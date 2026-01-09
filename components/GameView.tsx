
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Category, Player, ChatMessage } from '../types';
import { Timer, AlertCircle, Vote, Send, User, MessageCircle, Mic2, MicOff } from 'lucide-react';

interface GameViewProps {
  category: Category;
  players: Player[];
  currentTurnIndex: number;
  chatHistory: ChatMessage[];
  onReset: () => void;
  onEndRound: () => void;
  onSendChat: (text: string) => void;
  roundTime: number;
  myPlayerId: string;
  isOnline: boolean;
  isMuted?: boolean;
  onToggleMute?: () => void;
}

const GameView: React.FC<GameViewProps> = ({ 
  category, players, currentTurnIndex, chatHistory, onReset, onEndRound, onSendChat, roundTime, myPlayerId, isOnline, isMuted = false, onToggleMute 
}) => {
  const [timeLeft, setTimeLeft] = useState(roundTime * 60);
  const [isPaused] = useState(false);
  const [showConfirmEnd, setShowConfirmEnd] = useState(false);
  const [inputText, setInputText] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (!isPaused && timeLeft > 0) {
      interval = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0) {
      onEndRound();
    }
    return () => clearInterval(interval);
  }, [isPaused, timeLeft, onEndRound]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const currentPlayerTurn = players[currentTurnIndex];
  const isMyTurn = isOnline ? (currentPlayerTurn?.id === myPlayerId) : true;

  const handleSend = () => {
    if (!inputText.trim()) return;
    onSendChat(inputText.trim().toUpperCase());
    setInputText('');
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getAvatarColor = (name: string) => {
    const colors = ['bg-rose-500', 'bg-indigo-500', 'bg-amber-500', 'bg-emerald-500', 'bg-sky-500', 'bg-violet-500', 'bg-pink-500', 'bg-orange-500'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex-1 flex flex-col h-full z-10 overflow-hidden min-screen"
    >
      {/* Header */}
      <div className="bg-white p-6 pt-10 rounded-b-[3rem] shadow-xl border-b-2 border-slate-50 flex flex-col gap-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center text-3xl shadow-[0_10px_20px_rgba(79,70,229,0.3)] border-2 border-white">
              {category.emoji}
            </div>
            <div>
              <p className="text-[10px] font-black text-indigo-600 tracking-[0.2em] uppercase leading-none mb-1">CURRENT THEME</p>
              <h2 className="text-xl font-black text-slate-900 leading-none italic uppercase">{category.name}</h2>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {isOnline && (
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={onToggleMute}
                className={`p-4 rounded-2xl shadow-md border-2 transition-all ${isMuted ? 'bg-rose-50 border-rose-200 text-rose-500' : 'bg-indigo-50 border-indigo-200 text-indigo-600'}`}
              >
                {isMuted ? <MicOff size={20} strokeWidth={3} /> : <Mic2 size={20} strokeWidth={3} />}
              </motion.button>
            )}
            <div className={`px-5 py-3 rounded-2xl border-2 flex items-center gap-2 font-black tabular-nums transition-all ${timeLeft < 60 ? 'bg-rose-50 border-rose-200 text-rose-500 animate-pulse' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
              <Timer size={18} strokeWidth={3} />
              {formatTime(timeLeft)}
            </div>
            <motion.button 
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowConfirmEnd(true)} 
              className="p-4 bg-slate-900 text-white rounded-2xl shadow-xl active:bg-black"
            >
              <Vote size={20} strokeWidth={3} />
            </motion.button>
          </div>
        </div>

        {/* Turn Progress Indicators */}
        <div className="flex gap-2 items-center">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-2">TURNS</p>
          {players.map((_, i) => (
            <motion.div 
              key={i} 
              animate={{ 
                height: i === currentTurnIndex ? 12 : 6,
                backgroundColor: i === currentTurnIndex ? '#4f46e5' : i < currentTurnIndex ? '#a5b4fc' : '#e2e8f0',
                scale: i === currentTurnIndex ? 1.1 : 1
              }}
              className="flex-1 rounded-full transition-all"
            />
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 py-8 space-y-6 scrollbar-hide">
        {chatHistory.length === 0 && (
          <div className="text-center py-20">
            <motion.div 
              animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 4 }}
              className="w-20 h-20 bg-indigo-50 rounded-[2rem] mx-auto flex items-center justify-center text-indigo-300 mb-6 border-2 border-dashed border-indigo-100"
            >
              <MessageCircle size={40} />
            </motion.div>
            <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">MISSION START</p>
            <p className="text-sm font-bold text-slate-500 mt-2 px-8">WAITING FOR <span className="text-indigo-600 uppercase font-black">{currentPlayerTurn?.name}</span> TO BRIEF THE TEAM.</p>
          </div>
        )}
        
        {chatHistory.map((msg, i) => {
          const isMe = isOnline ? msg.playerId === myPlayerId : (i % players.length === currentTurnIndex - 1 || (currentTurnIndex === 0 && i === chatHistory.length -1));
          const isCurrentSpeakerMessage = msg.playerId === currentPlayerTurn?.id;

          return (
            <motion.div 
              key={i}
              initial={{ opacity: 0, x: isMe ? 50 : -50, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: isCurrentSpeakerMessage ? 1.05 : 1 
              }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className={`flex items-end gap-3 ${isMe ? 'flex-row-reverse items-end' : 'flex-row'}`}
            >
              {/* Avatar */}
              <motion.div 
                animate={isCurrentSpeakerMessage ? {
                  scale: [1, 1.1, 1],
                  boxShadow: ["0px 0px 0px rgba(79,70,229,0)", "0px 0px 10px rgba(79,70,229,0.4)", "0px 0px 0px rgba(79,70,229,0)"],
                } : {}}
                transition={{ repeat: Infinity, duration: 2 }}
                className={`w-9 h-9 rounded-2xl flex items-center justify-center text-[12px] font-black text-white shrink-0 shadow-lg border-2 border-white mb-2 ${getAvatarColor(msg.playerName)}`}
              >
                {msg.playerName.charAt(0).toUpperCase()}
              </motion.div>

              {/* Message Column */}
              <div className={`flex flex-col flex-1 max-w-[80%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div className="flex items-center gap-2 mb-1.5 px-2">
                  <span className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors ${isMe || isCurrentSpeakerMessage ? 'text-indigo-600' : 'text-slate-400'}`}>
                    {msg.playerName}
                  </span>
                  {isCurrentSpeakerMessage && (
                    <motion.div 
                      animate={{ 
                        opacity: [0.6, 1, 0.6],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{ repeat: Infinity, duration: 1.5 }}
                      className="flex items-center gap-1 bg-indigo-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg border border-indigo-400"
                    >
                      <Mic2 size={10} /> SPEAKING
                    </motion.div>
                  )}
                </div>
                
                <motion.div 
                  animate={isCurrentSpeakerMessage ? {
                    boxShadow: ["0px 0px 0px rgba(79,70,229,0)", "0px 0px 15px rgba(79,70,229,0.3)", "0px 0px 0px rgba(79,70,229,0)"],
                  } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                  className={`
                    w-full px-6 py-4 rounded-[2rem] text-sm font-black shadow-lg leading-relaxed border-b-4 transition-all duration-300
                    ${isCurrentSpeakerMessage ? 'ring-4 ring-indigo-600/30 border-indigo-500 z-10' : ''}
                    ${isMe 
                      ? 'bg-indigo-600 text-white rounded-tr-none border-indigo-800' 
                      : isCurrentSpeakerMessage 
                        ? 'bg-indigo-50 text-indigo-900 rounded-tl-none border-indigo-200'
                        : 'bg-white text-slate-700 rounded-tl-none border-slate-100'}
                  `}
                >
                  {msg.text}
                </motion.div>
              </div>
            </motion.div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      {/* Input / Turn Indicator Footer */}
      <div className="p-6 bg-gradient-to-t from-slate-100/80 to-transparent backdrop-blur-sm shrink-0">
        <AnimatePresence mode="wait">
          {isMyTurn ? (
            <motion.div 
              key="my-turn"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              className="bg-white p-2 rounded-[2.5rem] shadow-[0_20px_50px_rgba(79,70,229,0.2)] border-2 border-indigo-100 flex items-center gap-2"
            >
              <input 
                autoFocus
                type="text"
                placeholder="REPORT YOUR FINDINGS AGENT..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="flex-1 bg-transparent outline-none text-slate-900 font-black placeholder:text-slate-200 px-6 py-4 text-xs tracking-widest uppercase"
              />
              <motion.button 
                whileTap={{ scale: 0.9 }}
                onClick={handleSend}
                disabled={!inputText.trim()}
                className={`w-14 h-14 rounded-full flex items-center justify-center transition-all shadow-lg ${inputText.trim() ? 'bg-indigo-600 text-white shadow-indigo-200' : 'bg-slate-100 text-slate-300'}`}
              >
                <Send size={24} strokeWidth={3} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="wait"
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="bg-slate-900 text-white p-6 rounded-[2.5rem] shadow-2xl flex items-center justify-between border-b-4 border-black"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/10 rounded-[1.2rem] flex items-center justify-center">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }} 
                    transition={{ repeat: Infinity, duration: 1.5 }}
                  >
                    <User size={24} className="text-white" strokeWidth={3} />
                  </motion.div>
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 tracking-[0.2em] leading-none mb-1 uppercase">TEAM BRIEFING</p>
                  <p className="text-sm font-black leading-none uppercase italic">{currentPlayerTurn?.name} IS SPEAKING...</p>
                </div>
              </div>
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div 
                    key={i} 
                    animate={{ y: [0, -8, 0] }} 
                    transition={{ repeat: Infinity, duration: 0.6, delay: i * 0.1 }}
                    className="w-2 h-2 bg-indigo-400 rounded-full"
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Confirmation Modal */}
      <AnimatePresence>
        {showConfirmEnd && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[60] flex items-center justify-center p-8"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 100 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.8, y: 100 }}
              className="bg-white w-full max-w-sm rounded-[4rem] p-10 text-center shadow-2xl border-b-8 border-slate-100"
            >
              <div className="w-24 h-24 bg-rose-100 rounded-[2.5rem] flex items-center justify-center text-rose-500 mx-auto mb-8 shadow-inner">
                <AlertCircle size={48} strokeWidth={3} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 mb-4 italic uppercase">END ROUND?</h3>
              <p className="text-slate-500 font-bold mb-10 leading-relaxed text-sm uppercase tracking-tight">ARE YOU READY TO VOTE OUT THE IMPOSTER? MISSIONS ARE HIGH STAKES!</p>
              <div className="space-y-4">
                <button onClick={onEndRound} className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-xl shadow-indigo-100 active:scale-95 transition-all uppercase tracking-widest border-b-4 border-indigo-800">VOTE NOW</button>
                <button onClick={() => setShowConfirmEnd(false)} className="w-full bg-slate-100 text-slate-400 font-black py-5 rounded-[2rem] active:scale-95 transition-all uppercase tracking-widest">CONTINUE INTEL</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      <div className="h-safe-bottom" />
    </motion.div>
  );
};

export default GameView;
