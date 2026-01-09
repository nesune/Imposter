
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../types';
import { EyeOff, CheckCircle2, User, AlertTriangle, Fingerprint, Shield } from 'lucide-react';

interface RevealViewProps {
  players: Player[];
  onFinish: () => void;
  isOnline?: boolean;
}

const RevealView: React.FC<RevealViewProps> = ({ players, onFinish, isOnline = false }) => {
  const [currentPlayerIdx, setCurrentPlayerIdx] = useState(0);
  const [isRevealed, setIsRevealed] = useState(false);
  const [showInterstitial, setShowInterstitial] = useState(!isOnline); 
  const [hasSeenWord, setHasSeenWord] = useState(false);

  const currentPlayer = players[currentPlayerIdx];
  const isImposterRole = currentPlayer?.word === 'YOU ARE THE IMPOSTER';

  const handleReveal = () => {
    setIsRevealed(true);
    setHasSeenWord(true);
  };

  const handleNext = () => {
    if (isOnline) {
      onFinish(); 
      return;
    }

    if (currentPlayerIdx < players.length - 1) {
      setCurrentPlayerIdx(currentPlayerIdx + 1);
      setIsRevealed(false);
      setShowInterstitial(true);
      setHasSeenWord(false);
    } else {
      onFinish();
    }
  };

  return (
    <div className="flex-1 flex flex-col p-6 z-10 bg-slate-50 min-h-screen overflow-hidden">
      <div className="mb-6 flex items-center justify-between">
        {!isOnline ? (
          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-2xl shadow-sm border border-slate-100">
            <span className="text-indigo-600 font-black text-lg">{currentPlayerIdx + 1}</span>
            <div className="w-1 h-4 bg-slate-100 rounded-full" />
            <span className="text-slate-400 font-black text-sm">{players.length} AGENTS</span>
          </div>
        ) : <div />}
        <div className="text-[10px] font-black text-slate-400 bg-white px-4 py-2 rounded-full border border-slate-100 uppercase tracking-widest shadow-sm">
          TOP SECRET IDENTITY
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center perspective-1000">
        <AnimatePresence mode="wait">
          {showInterstitial ? (
            <motion.div 
              key="inter"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 1.2, y: -50 }}
              className="w-full text-center p-8 bg-white rounded-[4rem] shadow-2xl border-4 border-slate-50"
            >
              <div className="w-32 h-32 bg-indigo-600 rounded-[3rem] mx-auto flex items-center justify-center text-white mb-8 shadow-[0_20px_50px_rgba(79,70,229,0.3)] border-4 border-white">
                <User size={64} strokeWidth={3} />
              </div>
              <p className="text-indigo-600 font-black uppercase tracking-[0.3em] text-xs mb-2">NEXT AGENT</p>
              <h2 className="text-4xl font-black text-slate-900 mb-6 truncate italic">{currentPlayer?.name}</h2>
              <div className="p-6 bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 mb-10">
                <p className="text-slate-500 font-bold leading-relaxed text-sm">PLEASE HAND THE DEVICE TO <span className="text-indigo-600">{currentPlayer?.name}</span> IN PRIVATE!</p>
              </div>
              
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowInterstitial(false)}
                className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-xl active:bg-black transition-all uppercase tracking-widest flex items-center justify-center gap-3"
              >
                I AM {currentPlayer?.name}
                <Fingerprint size={24} />
              </motion.button>
            </motion.div>
          ) : (
            <motion.div 
              key="card"
              initial={{ opacity: 0, rotateY: 90 }}
              animate={{ opacity: 1, rotateY: 0 }}
              className="w-full max-w-sm"
            >
              <div 
                className={`
                  relative min-h-[30rem] w-full rounded-[4rem] p-10 shadow-2xl transition-all duration-700 flex flex-col items-center justify-center
                  ${isRevealed 
                    ? (isImposterRole ? 'bg-gradient-to-br from-rose-500 to-rose-700 shadow-rose-200 border-rose-400' : 'bg-gradient-to-br from-indigo-600 to-indigo-800 shadow-indigo-200 border-indigo-400') 
                    : 'bg-white border-4 border-dashed border-slate-200'}
                  border-4
                `}
              >
                {!isRevealed ? (
                  <div className="text-center w-full">
                    <motion.div 
                      animate={{ y: [0, -10, 0], rotate: [0, -5, 5, 0] }}
                      transition={{ repeat: Infinity, duration: 4 }}
                      className="mb-10 text-indigo-400"
                    >
                      <Shield size={100} strokeWidth={1} className="mx-auto" />
                    </motion.div>
                    <p className="text-slate-900 font-black text-2xl mb-2 uppercase italic">{currentPlayer?.name}</p>
                    <p className="text-slate-400 font-black uppercase tracking-[0.2em] text-[10px] mb-12">IDENTITY LOCKED</p>
                    
                    <motion.button 
                      onPointerDown={handleReveal}
                      onPointerUp={() => setIsRevealed(false)}
                      onPointerLeave={() => setIsRevealed(false)}
                      whileTap={{ scale: 1.1 }}
                      className="w-full py-6 bg-indigo-50 text-indigo-600 font-black rounded-[2.5rem] active:bg-indigo-100 transition-colors select-none touch-none shadow-sm flex items-center justify-center gap-3 border-2 border-indigo-100"
                    >
                      HOLD TO SCAN
                      <Fingerprint size={24} />
                    </motion.button>
                  </div>
                ) : (
                  <motion.div 
                    initial={{ scale: 0.5, opacity: 0 }} 
                    animate={{ scale: 1, opacity: 1 }} 
                    className="text-center text-white"
                  >
                    {isImposterRole ? (
                      <>
                        <motion.div
                          animate={{ rotate: [0, -10, 10, 0] }}
                          transition={{ repeat: Infinity, duration: 2 }}
                        >
                          <AlertTriangle size={80} className="mx-auto mb-8 text-rose-200" />
                        </motion.div>
                        <h3 className="text-5xl font-black mb-6 tracking-tighter leading-none italic uppercase">IMPOSTER<br/>DETECTED</h3>
                        <div className="bg-white/20 p-4 rounded-3xl backdrop-blur-md border border-white/30">
                          <p className="text-white font-black text-xs uppercase tracking-[0.2em]">MISSION: BLEND IN</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <p className="text-indigo-200 font-black uppercase tracking-[0.3em] text-[10px] mb-4">YOUR SECRET WORD</p>
                        <h3 className="text-6xl font-black mb-10 tracking-tight uppercase italic drop-shadow-2xl">{currentPlayer?.word}</h3>
                        <div className="w-16 h-1.5 bg-white/30 rounded-full mx-auto mb-10" />
                        <div className="bg-white/10 p-5 rounded-[2rem] backdrop-blur-md border border-white/20">
                          <p className="text-indigo-100 font-bold text-sm leading-relaxed">STAY COOL, ACT NATURAL!</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                )}
              </div>

              <div className="mt-10">
                <motion.button
                  disabled={!hasSeenWord}
                  onClick={handleNext}
                  whileTap={{ scale: 0.95 }}
                  className={`
                    w-full py-6 rounded-[2.5rem] font-black shadow-2xl flex items-center justify-center gap-4 transition-all uppercase tracking-widest border-b-4
                    ${!hasSeenWord ? 'bg-slate-200 text-slate-400 border-slate-300' : 'bg-indigo-600 text-white border-indigo-800 shadow-indigo-100 active:bg-indigo-700'}
                  `}
                >
                  <CheckCircle2 size={24} />
                  {isOnline ? 'START OPS' : (currentPlayerIdx === players.length - 1 ? 'BEGIN MISSION' : 'CONFIRM')}
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-safe-bottom" />
    </div>
  );
};

export default RevealView;
