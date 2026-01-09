
import React from 'react';
import { motion } from 'framer-motion';
import { Player } from '../types';
import { Trophy, Frown, RotateCcw, PartyPopper, UserX, UserCheck, Skull, Heart } from 'lucide-react';

interface ResultsViewProps {
  votedPlayer: Player;
  secretWord: string;
  onReset: () => void;
}

const ResultsView: React.FC<ResultsViewProps> = ({ votedPlayer, secretWord, onReset }) => {
  const isCorrect = votedPlayer.isImposter;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={`flex-1 flex flex-col items-center p-8 text-center z-10 overflow-y-auto min-h-screen ${isCorrect ? 'bg-green-50' : 'bg-rose-50'}`}
    >
      <div className="my-auto py-12 flex flex-col items-center w-full max-w-sm">
        <div className="mb-10 w-full relative">
          <motion.div
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", damping: 12, stiffness: 200 }}
            className={`
              w-48 h-48 rounded-[5rem] mx-auto flex items-center justify-center mb-10 shadow-2xl border-8 border-white
              ${isCorrect ? 'bg-green-500 text-white' : 'bg-rose-500 text-white'}
            `}
          >
            {isCorrect ? <Trophy size={100} strokeWidth={2.5} /> : <Skull size={100} strokeWidth={2.5} />}
          </motion.div>
          
          <motion.h1 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`text-6xl font-black mb-4 tracking-tighter italic uppercase ${isCorrect ? 'text-green-600' : 'text-rose-600'}`}
          >
            {isCorrect ? 'VICTORY!' : 'FAILED!'}
          </motion.h1>
          
          <div className="flex flex-col items-center gap-4 mb-10">
            <p className="text-slate-600 font-bold text-xl uppercase tracking-tighter px-6 leading-tight">
              AGENT <span className={`font-black ${isCorrect ? 'text-green-600' : 'text-rose-600'}`}>{votedPlayer.name}</span> WAS {isCorrect ? 'THE IMPOSTER!' : 'INNOCENT!'}
            </p>
            
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
              className={`
                px-8 py-3 rounded-full font-black text-sm tracking-[0.2em] uppercase flex items-center gap-3 shadow-xl border-2
                ${isCorrect ? 'bg-white border-green-200 text-green-600' : 'bg-white border-rose-200 text-rose-600'}
              `}
            >
              {isCorrect ? <UserCheck size={20} /> : <UserX size={20} />}
              {isCorrect ? 'CIVILIANS WIN' : 'IMPOSTER WINS'}
            </motion.div>
          </div>
        </div>

        <div className={`
          w-full p-10 rounded-[4rem] border-4 mb-12 relative overflow-hidden shadow-xl
          ${isCorrect ? 'bg-white border-green-100' : 'bg-white border-rose-100'}
        `}>
          {isCorrect && <motion.div animate={{ rotate: [0, 360] }} transition={{ repeat: Infinity, duration: 10, ease: "linear" }} className="absolute -top-10 -right-10 text-green-100 opacity-50"><PartyPopper size={160} /></motion.div>}
          
          <p className="text-slate-400 font-black uppercase tracking-[0.3em] text-[10px] mb-3">SECRET MISSION WORD</p>
          <h3 className={`text-5xl font-black italic uppercase tracking-tighter ${isCorrect ? 'text-green-600' : 'text-rose-600'}`}>
            {secretWord}
          </h3>
        </div>

        <div className="w-full space-y-4">
          <motion.button
            whileHover={{ scale: 1.05, y: -4 }}
            whileTap={{ scale: 0.95 }}
            onClick={onReset}
            className="w-full bg-slate-900 text-white font-black py-6 rounded-[2.5rem] shadow-2xl flex items-center justify-center gap-4 uppercase tracking-widest border-b-4 border-black"
          >
            <RotateCcw size={24} strokeWidth={3} />
            REDEPLOY AGENTS
          </motion.button>
          
          <button 
            onClick={onReset}
            className="text-slate-400 font-black text-xs hover:text-slate-600 transition-colors uppercase tracking-[0.2em]"
          >
            EXIT TO BASE
          </button>
        </div>
      </div>
      <div className="h-safe-bottom" />
    </motion.div>
  );
};

export default ResultsView;
