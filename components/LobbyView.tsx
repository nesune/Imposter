
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameSettings, GameMode, User } from '../types';
import { Users, UserMinus, ShieldQuestion, Play, UserCircle2, Globe, Laptop, Smartphone, Copy, Check, Timer, User as UserIcon, Plus, Minus, RefreshCw } from 'lucide-react';
import { createRoom, generateUniqueRoomCode, getRoomByCode } from '../services/supabaseService';

interface LobbyViewProps {
  onStart: (settings: GameSettings) => void;
  currentUser: User | null;
  onOpenProfile: () => void;
}

const LobbyView: React.FC<LobbyViewProps> = ({ onStart, currentUser, onOpenProfile }) => {
  const [mode, setMode] = useState<GameMode>(GameMode.LOCAL);
  const [playerCount, setPlayerCount] = useState(4);
  const [imposterCount, setImposterCount] = useState(1);
  const [roundTime, setRoundTime] = useState(5);
  const [names, setNames] = useState<string[]>(['', '', '', '']);
  const [roomCode, setRoomCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [copied, setCopied] = useState(false);
  const [roomCreated, setRoomCreated] = useState(false);
  const [creatingRoom, setCreatingRoom] = useState(false);

  useEffect(() => {
    if (currentUser && names[0] === '') {
      setNames(prev => {
        const n = [...prev];
        n[0] = currentUser.username;
        return n;
      });
    }
  }, [currentUser]);

  useEffect(() => {
    if (mode === GameMode.ONLINE && !isJoining && !roomCode) {
      // Generate 4-digit code (will be replaced with unique code from Supabase)
      const code = Math.floor(1000 + Math.random() * 9000).toString();
      setRoomCode(code);
      setRoomCreated(false);
    }
  }, [mode, isJoining]);

  // Create room automatically when in HOST OPS mode
  useEffect(() => {
    const createRoomIfNeeded = async () => {
      if (mode === GameMode.ONLINE && !isJoining && !roomCreated && roomCode && !creatingRoom) {
        setCreatingRoom(true);
        try {
          // Generate unique room code
          let finalCode = roomCode;
          const exists = await getRoomByCode(finalCode);
          if (exists) {
            finalCode = await generateUniqueRoomCode();
            setRoomCode(finalCode);
          } else {
            // Normalize to uppercase
            finalCode = finalCode.toUpperCase().padStart(4, '0').slice(0, 4);
            setRoomCode(finalCode);
          }

          // Create room with minimal settings (will be updated when game starts)
          // We create an empty room - the host will be added when they click "CHOOSE THEME"
          const playerName = names[0] || currentUser?.username || 'GUEST AGENT';
          const tempPlayerId = `temp_host_${Date.now()}`;
          
          const roomId = await createRoom(
            finalCode,
            tempPlayerId,
            playerName,
            {
              playerCount: 1,
              imposterCount: imposterCount,
              playerNames: [playerName],
              mode: GameMode.ONLINE,
              roundTime: roundTime
            }
          );
          
          // Don't add player to room_players table yet - that happens in App.tsx

          if (roomId) {
            setRoomCreated(true);
            console.log('Room created in lobby with code:', finalCode);
          } else {
            console.error('Failed to create room in lobby');
          }
        } catch (error) {
          console.error('Error creating room in lobby:', error);
        } finally {
          setCreatingRoom(false);
        }
      }
    };

    // Small delay to avoid creating room too quickly
    const timer = setTimeout(createRoomIfNeeded, 500);
    return () => clearTimeout(timer);
  }, [mode, isJoining, roomCode, roomCreated, creatingRoom, names, currentUser, imposterCount, roundTime]);

  useEffect(() => {
    if (mode === GameMode.LOCAL) {
      setNames(prev => {
        const next = [...prev];
        if (playerCount > next.length) {
          while (next.length < playerCount) next.push('');
        } else if (playerCount < next.length) {
          next.splice(playerCount);
        }
        return next;
      });
    } else {
      setNames(prev => [prev[0] || currentUser?.username || '']);
    }
  }, [playerCount, mode]);

  const handleStart = () => {
    if (mode === GameMode.ONLINE && isJoining && (!roomCode || roomCode.length !== 4)) {
      alert('Please enter a valid 4-digit room code');
      return;
    }
    
    onStart({ 
      mode,
      playerCount: mode === GameMode.LOCAL ? playerCount : 1, 
      imposterCount, 
      roundTime,
      playerNames: names.map((n, i) => n.trim() || `AGENT ${i + 1}`),
      roomCode: mode === GameMode.ONLINE ? roomCode : undefined,
      isHost: mode === GameMode.ONLINE ? !isJoining : undefined
    });
  };

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}?room=${roomCode}`;
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const refreshRoomCode = async () => {
    // Generate a new 4-digit room code
    const newCode = await generateUniqueRoomCode();
    setRoomCode(newCode);
    setRoomCreated(false); // Reset so new room will be created
  };

  const Counter = ({ value, onAdd, onSub, label, icon: Icon, color, suffix = "" }: any) => (
    <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border-2 border-slate-50 flex items-center justify-between group hover:border-indigo-100 transition-all">
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-2xl ${color} text-white shadow-lg`}>
          <Icon size={24} />
        </div>
        <div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{label}</p>
          <p className="text-xl font-black text-slate-900 leading-none">{value}{suffix}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-2xl border-2 border-slate-100">
        <button onClick={onSub} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"><Minus size={18} className="text-slate-400" /></button>
        <span className="w-8 text-center font-black text-indigo-600">{value}</span>
        <button onClick={onAdd} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center active:scale-90 transition-transform"><Plus size={18} className="text-slate-400" /></button>
      </div>
    </div>
  );

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex-1 flex flex-col p-6 z-10 overflow-hidden min-h-screen"
    >
      {/* Dynamic Background Elements */}
      <div className="blob" style={{ top: '-10%', right: '-10%' }} />
      <div className="blob" style={{ bottom: '-10%', left: '-10%', background: 'linear-gradient(135deg, #f59e0b, #ec4899)' }} />

      <div className="mt-4 flex justify-between items-center mb-8">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onOpenProfile}
          className="flex items-center gap-3 bg-white border-2 border-white p-1.5 pr-4 rounded-[2rem] shadow-xl hover:shadow-indigo-100 transition-all"
        >
          <div className="w-12 h-12 bg-indigo-600 rounded-[1.5rem] flex items-center justify-center text-white shadow-lg">
            <UserIcon size={24} />
          </div>
          <div className="text-left">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">AGENT</p>
            <p className="text-sm font-black text-slate-900 leading-none">{currentUser?.username || 'GUEST'}</p>
          </div>
        </motion.button>
        <h1 className="text-2xl font-black text-slate-900 tracking-tighter italic">IMPOSTER</h1>
      </div>

      <div className="flex bg-slate-200/50 backdrop-blur-sm p-1.5 rounded-[2.5rem] mb-8 relative">
        <motion.div 
          className="absolute bg-white rounded-[2rem] shadow-xl h-[calc(100%-12px)] top-1.5"
          animate={{ x: mode === GameMode.LOCAL ? 0 : '100%', width: 'calc(50% - 6px)' }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
        />
        <button 
          onClick={() => { setMode(GameMode.LOCAL); setIsJoining(false); }}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black z-10 transition-colors ${mode === GameMode.LOCAL ? 'text-indigo-600' : 'text-slate-500'}`}
        >
          <Smartphone size={16} /> LOCAL PASS
        </button>
        <button 
          onClick={() => setMode(GameMode.ONLINE)}
          className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black z-10 transition-colors ${mode === GameMode.ONLINE ? 'text-indigo-600' : 'text-slate-500'}`}
        >
          <Globe size={16} /> ONLINE OPS
        </button>
      </div>

      <div className="flex-1 overflow-y-auto space-y-4 pb-4 scrollbar-hide px-1">
        <AnimatePresence mode="wait">
          {mode === GameMode.ONLINE && (
            <motion.div 
              key="online-controls"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-4"
            >
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsJoining(false)}
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs border-2 transition-all ${!isJoining ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  HOST OPS
                </button>
                <button 
                  onClick={() => setIsJoining(true)}
                  className={`flex-1 py-4 rounded-[1.5rem] font-black text-xs border-2 transition-all ${isJoining ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' : 'bg-white border-slate-100 text-slate-400'}`}
                >
                  JOIN OPS
                </button>
              </div>
              
              <div className="bg-white p-8 rounded-[3rem] border-2 border-slate-100 shadow-sm text-center group">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">MISSION ACCESS CODE</p>
                {isJoining ? (
                  <input 
                    value={roomCode}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4);
                      setRoomCode(value);
                    }}
                    placeholder="0000"
                    maxLength={4}
                    className="text-4xl font-black text-center text-indigo-600 outline-none w-full bg-slate-50 rounded-[2rem] py-4 tracking-[0.3em] placeholder:text-slate-200"
                  />
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center justify-center gap-4">
                      <span className="text-5xl font-black tracking-[0.2em] text-indigo-600">{roomCode}</span>
                      <div className="flex gap-2">
                        <button 
                          onClick={refreshRoomCode} 
                          className="p-4 bg-slate-50 hover:bg-amber-50 rounded-2xl text-slate-400 hover:text-amber-600 transition-all"
                          title="Generate new code"
                          disabled={creatingRoom}
                        >
                          <RefreshCw size={28} className={creatingRoom ? 'animate-spin' : ''} />
                        </button>
                        <button 
                          onClick={copyLink} 
                          className="p-4 bg-slate-50 hover:bg-indigo-50 rounded-2xl text-slate-400 hover:text-indigo-600 transition-all"
                          title="Copy room link"
                        >
                          {copied ? <Check size={28} className="text-green-500" /> : <Copy size={28} />}
                        </button>
                      </div>
                    </div>
                    {creatingRoom && (
                      <p className="text-xs text-amber-600 font-bold animate-pulse">Creating room...</p>
                    )}
                    {roomCreated && !creatingRoom && (
                      <p className="text-xs text-green-600 font-bold">✓ Room active - Players can join!</p>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {(!isJoining) && (
          <div className="space-y-4">
            {mode === GameMode.LOCAL && (
              <Counter 
                label="TOTAL AGENTS" 
                value={playerCount} 
                onAdd={() => setPlayerCount(Math.min(12, playerCount + 1))}
                onSub={() => setPlayerCount(Math.max(3, playerCount - 1))}
                icon={Users}
                color="bg-indigo-600"
              />
            )}
            <Counter 
              label="IMPOSTERS" 
              value={imposterCount} 
              onAdd={() => setImposterCount(Math.min(Math.max(1, playerCount - 2), imposterCount + 1))}
              onSub={() => setImposterCount(Math.max(1, imposterCount - 1))}
              icon={UserMinus}
              color="bg-rose-500"
            />
            <Counter 
              label="MISSION TIME" 
              value={roundTime} 
              onAdd={() => setRoundTime(Math.min(10, roundTime + 1))}
              onSub={() => setRoundTime(Math.max(1, roundTime - 1))}
              icon={Timer}
              color="bg-amber-500"
              suffix="m"
            />
          </div>
        )}

        <div className="space-y-3 pt-4">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-4">AGENTS LIST</h3>
          <div className="space-y-2">
            {(isJoining ? [names[0]] : names).map((name, idx) => (
              <motion.div 
                key={`p-${idx}`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-4 bg-white/50 backdrop-blur-sm p-3 pl-5 rounded-[1.5rem] border-2 border-transparent hover:border-indigo-200 transition-all group"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-focus-within:bg-indigo-100 group-focus-within:text-indigo-600">
                  <UserCircle2 size={20} />
                </div>
                <input 
                  type="text"
                  value={name}
                  placeholder={isJoining ? "ENTER YOUR AGENT NAME" : `AGENT ${idx + 1}`}
                  onChange={(e) => {
                    const next = [...names];
                    next[idx] = e.target.value.toUpperCase();
                    setNames(next);
                  }}
                  className="flex-1 bg-transparent outline-none text-slate-900 font-black text-sm uppercase placeholder:text-slate-300"
                />
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      <motion.button
        whileHover={{ scale: 1.02, y: -4 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleStart}
        className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.2)] flex items-center justify-center gap-4 mt-6 uppercase tracking-widest border-b-4 border-slate-950"
      >
        <Play fill="white" size={24} />
        {isJoining ? 'INITIATE OPS' : 'CHOOSE THEME'}
      </motion.button>
      <div className="h-safe-bottom mt-4" />
    </motion.div>
  );
};

export default LobbyView;
