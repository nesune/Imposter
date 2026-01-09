
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GameStatus, Player, Category, GameSettings, WordPair, GameMode, User, ChatMessage } from './types';
import { CATEGORIES, STATIC_WORDS } from './constants';
import { generateAIWordPair } from './services/geminiService';
import LobbyView from './components/LobbyView';
import CategoryView from './components/CategoryView';
import RevealView from './components/RevealView';
import GameView from './components/GameView';
import VotingView from './components/VotingView';
import ResultsView from './components/ResultsView';
import AuthView from './components/AuthView';
import ProfileView from './components/ProfileView';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  supabase, 
  createRoom, 
  getRoomByCode, 
  updateRoom, 
  deleteRoom,
  addPlayerToRoom,
  removePlayerFromRoom,
  sendChatMessage,
  submitVote,
  generateUniqueRoomCode,
  Room,
  getChatHistory
} from './services/supabaseService';
import { RealtimeChannel } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [status, setStatus] = useState<GameStatus>(GameStatus.AUTH);
  const [settings, setSettings] = useState<GameSettings>({ 
    playerCount: 4, 
    imposterCount: 1, 
    playerNames: [], 
    mode: GameMode.LOCAL,
    roundTime: 5 
  });
  const [category, setCategory] = useState<Category | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [wordPair, setWordPair] = useState<WordPair | null>(null);
  const [loading, setLoading] = useState(false);
  const [myPlayerId, setMyPlayerId] = useState<string | null>(null);
  const [votedPlayer, setVotedPlayer] = useState<Player | null>(null);

  // Voice Chat State - Default to Muted
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [isMuted, setIsMuted] = useState(true);

  // Turn-based state for GameView
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);

  // Supabase state
  const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);
  const [currentRoomCode, setCurrentRoomCode] = useState<string | null>(null);
  const [isHost, setIsHost] = useState(false);
  const roomChannelRef = useRef<RealtimeChannel | null>(null);

  // Generate unique player ID
  const generatePlayerId = () => {
    return `player_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  };

  // Check for existing session and test Supabase connection
  useEffect(() => {
    const saved = localStorage.getItem('imposter_session');
    if (saved) {
      setCurrentUser(JSON.parse(saved));
      setStatus(GameStatus.LOBBY);
    }
    // Generate player ID on mount
    setMyPlayerId(generatePlayerId());
    
    // Test Supabase connection on mount
    import('./services/supabaseService').then(({ testConnection }) => {
      testConnection().catch(err => {
        console.error('Failed to test Supabase connection:', err);
      });
    });
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('imposter_session', JSON.stringify(user));
    setStatus(GameStatus.LOBBY);
  };

  const handleGuestLogin = () => {
    setCurrentUser(null);
    setStatus(GameStatus.LOBBY);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('imposter_session');
    setStatus(GameStatus.AUTH);
  };

  const toggleMute = () => {
    if (localStream) {
      const nextMuteState = !isMuted;
      localStream.getAudioTracks().forEach(track => {
        track.enabled = !nextMuteState;
      });
      setIsMuted(nextMuteState);
    }
  };

  const initVoice = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Disable audio tracks immediately for "off by default" behavior
      stream.getAudioTracks().forEach(track => {
        track.enabled = false;
      });
      setLocalStream(stream);
      return stream;
    } catch (err) {
      console.error("Failed to get local stream", err);
      return null;
    }
  };

  // Setup Supabase real-time subscription
  const setupRoomSubscription = (roomId: string) => {
    // Cleanup existing subscription
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
    }

    const channel = supabase
      .channel(`room:${roomId}`)
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'rooms', filter: `id=eq.${roomId}` },
        (payload) => {
          const room = payload.new as Room;
          if (room) {
            // Update local state from room
            if (room.players) setPlayers(room.players);
            if (room.category) setCategory(room.category);
            if (room.word_pair) setWordPair(room.word_pair);
            if (room.status === 'revealing') setStatus(GameStatus.REVEALING);
            if (room.status === 'playing') setStatus(GameStatus.PLAYING);
            if (room.status === 'voting') setStatus(GameStatus.VOTING);
            if (room.status === 'results') setStatus(GameStatus.RESULTS);
          }
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'room_chats', filter: `room_id=eq.${roomId}` },
        (payload) => {
          const chat = payload.new as any;
          const msg: ChatMessage = {
            playerId: chat.player_id,
            playerName: chat.player_name,
            text: chat.text,
            timestamp: chat.timestamp,
          };
          setChatHistory(prev => [...prev, msg]);
          // Update turn index
          const playerIndex = players.findIndex(p => p.id === msg.playerId);
          if (playerIndex !== -1) {
            setCurrentTurnIndex((playerIndex + 1) % players.length);
          }
        }
      )
      .subscribe();

    roomChannelRef.current = channel;
  };

  const startSetup = async (s: GameSettings) => {
    setSettings(s);
    
    if (s.mode === GameMode.LOCAL) {
      setStatus(GameStatus.CATEGORY_SELECT);
      return;
    }

    // Online mode
    const playerName = s.playerNames[0] || currentUser?.username || 'GUEST AGENT';
    const playerId = myPlayerId || generatePlayerId();
    setMyPlayerId(playerId);

    if (s.isHost) {
      // Host: Create room with unique code
      let roomCode = s.roomCode;
      if (!roomCode) {
        roomCode = await generateUniqueRoomCode();
      } else {
        // Normalize to uppercase
        roomCode = roomCode.toUpperCase().padStart(4, '0').slice(0, 4);
        // Check if provided code is available, if not generate unique one
        const exists = await supabase
          .from('rooms')
          .select('id')
          .eq('code', roomCode)
          .single()
          .then(({ data, error }) => {
            if (error && error.code === 'PGRST116') return false; // Room not found = available
            return !!data;
          });
        
        if (exists) {
          console.log('Room code already exists, generating new one');
          roomCode = await generateUniqueRoomCode();
        }
      }
      setCurrentRoomCode(roomCode);
      console.log('Creating room with code:', roomCode);
      
      const roomId = await createRoom(roomCode, playerId, playerName, s);
      if (!roomId) {
        alert('Failed to create room. Please check your Supabase connection and try again.');
        console.error('Room creation failed. Check browser console for details.');
        return;
      }

      setCurrentRoomId(roomId);
      setIsHost(true);
      
      // Add host as player
      await addPlayerToRoom(roomId, playerId, playerName, true, currentUser?.id);
      
      // Setup real-time subscription
      setupRoomSubscription(roomId);
      
      // Initialize voice if needed
      if (s.mode === GameMode.ONLINE) {
        await initVoice();
      }

      setStatus(GameStatus.CATEGORY_SELECT);
    } else {
      // Client: Join room
      let roomCode = s.roomCode;
      if (!roomCode) {
        alert('Please enter a room code');
        return;
      }
      
      // Normalize to uppercase
      roomCode = roomCode.toUpperCase().padStart(4, '0').slice(0, 4);
      console.log('Joining room with code:', roomCode);

      const room = await getRoomByCode(roomCode);
      if (!room) {
        alert(`Room not found with code: ${roomCode}. Please check the code and make sure the host has created the room.`);
        console.error('Room lookup failed. Check browser console for details.');
        return;
      }

      if (room.status !== 'waiting' && room.status !== 'category_select') {
        alert('Game has already started. Please join another room.');
        return;
      }

      setCurrentRoomId(room.id);
      setCurrentRoomCode(roomCode);
      setIsHost(false);
      
      // Add player to room
      await addPlayerToRoom(room.id, playerId, playerName, false, currentUser?.id);
      
      // Setup real-time subscription
      setupRoomSubscription(room.id);
      
      // Initialize voice if needed
      if (s.mode === GameMode.ONLINE) {
        await initVoice();
      }

      // Update local state from room
      setPlayers(room.players || []);
      if (room.category) setCategory(room.category);
      if (room.word_pair) setWordPair(room.word_pair);
      
      // Use type assertion to handle all possible status values
      const roomStatus = room.status as 'waiting' | 'category_select' | 'revealing' | 'playing' | 'voting' | 'results';
      
      // Load chat history if game is in progress
      if (roomStatus === 'playing' || roomStatus === 'voting' || roomStatus === 'results') {
        const history = await getChatHistory(room.id);
        setChatHistory(history);
      }
      
      if (roomStatus === 'category_select') {
        setStatus(GameStatus.WAITING_FOR_HOST);
      } else if (roomStatus === 'revealing') {
        setStatus(GameStatus.REVEALING);
      } else if (roomStatus === 'playing') {
        setStatus(GameStatus.PLAYING);
      } else if (roomStatus === 'voting') {
        setStatus(GameStatus.VOTING);
      } else if (roomStatus === 'results') {
        setStatus(GameStatus.RESULTS);
      } else {
        setStatus(GameStatus.WAITING_FOR_HOST);
      }
    }
  };

  const initializeGame = useCallback(async (selectedCategory: Category) => {
    setLoading(true);
    setCategory(selectedCategory);
    
    let pair: WordPair;
    if (selectedCategory.id === 'ai') {
      pair = await generateAIWordPair();
    } else {
      const list = STATIC_WORDS[selectedCategory.id];
      pair = list[Math.floor(Math.random() * list.length)];
    }
    setWordPair(pair);

    if (settings.mode === GameMode.LOCAL) {
      // Local mode: use settings directly
      const newPlayers: Player[] = [];
      const imposterIndices = new Set<number>();
      const actualImposterCount = Math.min(settings.imposterCount, settings.playerCount - 1);
      
      while (imposterIndices.size < actualImposterCount) {
        imposterIndices.add(Math.floor(Math.random() * settings.playerCount));
      }

      for (let i = 0; i < settings.playerCount; i++) {
        const isImposter = imposterIndices.has(i);
        newPlayers.push({
          id: String(i),
          name: settings.playerNames[i] || `AGENT ${i + 1}`,
          isImposter,
          word: isImposter ? 'YOU ARE THE IMPOSTER' : pair.target,
        });
      }

      setPlayers(newPlayers);
      setLoading(false);
      setStatus(GameStatus.REVEALING);
      return;
    }

    // Online mode: use room state
    if (!currentRoomId) {
      setLoading(false);
      return;
    }

    // Get current room state
    const room = await supabase
      .from('rooms')
      .select('*')
      .eq('id', currentRoomId)
      .single()
      .then(({ data }) => data as Room);

    if (!room) {
      setLoading(false);
      return;
    }

    const currentPlayers = room.players || [];
    const actualPlayerCount = currentPlayers.length;
    const imposterIndices = new Set<number>();
    const actualImposterCount = Math.min(settings.imposterCount, actualPlayerCount - 1);
    
    while (imposterIndices.size < actualImposterCount) {
      imposterIndices.add(Math.floor(Math.random() * actualPlayerCount));
    }

    // Assign roles
    const newPlayers: Player[] = currentPlayers.map((p, idx) => {
      const isImposter = imposterIndices.has(idx);
      return {
        ...p,
        isImposter,
        word: isImposter ? 'YOU ARE THE IMPOSTER' : pair.target,
      };
    });

    setPlayers(newPlayers);
    
    // Update room in database
    await updateRoom(currentRoomId, {
      category: selectedCategory,
      word_pair: pair,
      players: newPlayers,
      status: 'revealing',
    });

    setLoading(false);
    setStatus(GameStatus.REVEALING);
  }, [currentRoomId, settings]);

  const handleLocalSendChat = (text: string) => {
    const me = players[currentTurnIndex];
    const msg: ChatMessage = { 
      playerId: me.id, 
      playerName: me.name, 
      text, 
      timestamp: Date.now() 
    };
    setChatHistory(prev => [...prev, msg]);
    setCurrentTurnIndex(prev => (prev + 1) % players.length);
  };

  const handleOnlineSendChat = async (text: string) => {
    if (!currentRoomId || !myPlayerId) return;
    
    const me = players.find(p => p.id === myPlayerId);
    if (!me) return;

    await sendChatMessage(currentRoomId, myPlayerId, me.name, text);
    // Real-time subscription will update chatHistory
  };

  const handleStartVoting = async () => {
    if (settings.mode === GameMode.ONLINE && isHost && currentRoomId) {
      await updateRoom(currentRoomId, { status: 'voting' });
    }
    setStatus(GameStatus.VOTING);
  };

  const updateStats = (won: boolean) => {
    if (!currentUser) return;
    
    const updatedUser = {
      ...currentUser,
      wins: currentUser.wins + (won ? 1 : 0),
      losses: currentUser.losses + (won ? 0 : 1)
    };
    
    setCurrentUser(updatedUser);
    localStorage.setItem('imposter_session', JSON.stringify(updatedUser));
    
    // Also update in the global users list if it exists
    const allUsers = JSON.parse(localStorage.getItem('imposter_users') || '[]');
    const uIdx = allUsers.findIndex((u: any) => u.id === currentUser.id);
    if (uIdx !== -1) {
      allUsers[uIdx] = { ...allUsers[uIdx], wins: updatedUser.wins, losses: updatedUser.losses };
      localStorage.setItem('imposter_users', JSON.stringify(allUsers));
    }
  };

  const handleVoteFinished = async (voted: Player) => {
    if (currentRoomId && myPlayerId) {
      await submitVote(currentRoomId, myPlayerId, voted.id);
    }
    
    setVotedPlayer(voted);
    setStatus(GameStatus.RESULTS);
    
    if (currentUser) {
      const meInGame = players.find(p => p.userId === currentUser.id || (settings.mode === GameMode.LOCAL && p.name === currentUser.username));
      if (meInGame) {
        const imposterCaught = voted.isImposter;
        const amImposter = meInGame.isImposter;
        const meWon = amImposter ? !imposterCaught : imposterCaught;
        updateStats(meWon);
      }
    }

    // Update room status
    if (currentRoomId && isHost) {
      await updateRoom(currentRoomId, { status: 'results' });
    }
  };

  const resetGame = async () => {
    // Cleanup Supabase subscription
    if (roomChannelRef.current) {
      supabase.removeChannel(roomChannelRef.current);
      roomChannelRef.current = null;
    }

    // Remove player from room
    if (currentRoomId && myPlayerId) {
      await removePlayerFromRoom(currentRoomId, myPlayerId);
      
      // If host, delete room
      if (isHost) {
        await deleteRoom(currentRoomId);
      }
    }

    // Cleanup voice
    localStream?.getTracks().forEach(t => t.stop());
    setLocalStream(null);
    setIsMuted(true);

    // Reset state
    setStatus(GameStatus.LOBBY);
    setCategory(null);
    setPlayers([]);
    setWordPair(null);
    setVotedPlayer(null);
    setChatHistory([]);
    setCurrentTurnIndex(0);
    setCurrentRoomId(null);
    setCurrentRoomCode(null);
    setIsHost(false);
  };

  return (
    <div className="min-h-screen max-w-md mx-auto relative flex flex-col bg-white">
      <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
        <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-rose-400 blur-3xl"></div>
        <div className="absolute top-1/2 -right-20 w-80 h-80 rounded-full bg-indigo-400 blur-3xl"></div>
        <div className="absolute -bottom-20 left-1/4 w-72 h-72 rounded-full bg-amber-400 blur-3xl"></div>
      </div>
      <AnimatePresence>
        {status === GameStatus.AUTH && <AuthView key="auth" onLogin={handleLogin} onGuest={handleGuestLogin} />}
        {status === GameStatus.PROFILE && currentUser && (
          <ProfileView key="profile" user={currentUser} onClose={() => setStatus(GameStatus.LOBBY)} onLogout={handleLogout} onUpdateUser={setCurrentUser} />
        )}
        {status === GameStatus.LOBBY && (
          <LobbyView key="lobby" onStart={startSetup} currentUser={currentUser} onOpenProfile={() => setStatus(GameStatus.PROFILE)} />
        )}
        {status === GameStatus.WAITING_FOR_HOST && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="relative mb-8">
              <div className="w-24 h-24 bg-indigo-600 rounded-full animate-ping absolute opacity-20"></div>
              <div className="w-24 h-24 bg-indigo-600 rounded-[2.5rem] relative flex items-center justify-center text-white shadow-xl">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 4, ease: "linear" }}>
                  <div className="w-12 h-12 border-4 border-white/30 border-t-white rounded-full"></div>
                </motion.div>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Connected!</h2>
            <p className="text-slate-500">Waiting for host to start the game...</p>
            <button onClick={resetGame} className="mt-8 text-rose-500 font-bold px-6 py-2 bg-rose-50 rounded-xl">Cancel</button>
          </motion.div>
        )}
        {status === GameStatus.CATEGORY_SELECT && (
          <CategoryView 
            key="category" 
            onSelect={initializeGame} 
            onBack={() => setStatus(GameStatus.LOBBY)} 
            onlinePlayersCount={players.length} 
            isOnline={settings.mode === GameMode.ONLINE} 
          />
        )}
        {status === GameStatus.REVEALING && players.length > 0 && (
          <RevealView 
            key="reveal" 
            players={players} 
            onFinish={async () => {
              if (settings.mode === GameMode.ONLINE && isHost && currentRoomId) {
                await updateRoom(currentRoomId, { status: 'playing' });
              }
              setStatus(GameStatus.PLAYING);
            }} 
            isOnline={settings.mode === GameMode.ONLINE} 
          />
        )}
        {status === GameStatus.PLAYING && (
          <GameView 
            key="game" 
            category={category!} 
            onReset={resetGame} 
            onEndRound={handleStartVoting}
            roundTime={settings.roundTime}
            players={players}
            currentTurnIndex={currentTurnIndex}
            chatHistory={chatHistory}
            onSendChat={settings.mode === GameMode.LOCAL ? handleLocalSendChat : handleOnlineSendChat}
            myPlayerId={myPlayerId || ''}
            isOnline={settings.mode === GameMode.ONLINE}
            isMuted={isMuted}
            onToggleMute={toggleMute}
          />
        )}
        {status === GameStatus.VOTING && <VotingView key="voting" players={players} onVote={handleVoteFinished} />}
        {status === GameStatus.RESULTS && votedPlayer && (
          <ResultsView key="results" votedPlayer={votedPlayer} secretWord={wordPair?.target || ''} onReset={resetGame} />
        )}
      </AnimatePresence>
      {loading && (
        <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
          <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full" />
          <p className="mt-4 font-semibold text-indigo-900 animate-pulse">Consulting the Oracle...</p>
        </div>
      )}
    </div>
  );
};

export default App;
