
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Player } from '../types';
import { User, CheckCircle2, ShieldAlert } from 'lucide-react';

interface VotingViewProps {
  players: Player[];
  onVote: (player: Player) => void;
}

const VotingView: React.FC<VotingViewProps> = ({ players, onVote }) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);

  const handleConfirmVote = () => {
    if (selectedPlayer) {
      onVote(selectedPlayer);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="flex-1 flex flex-col p-6 z-10"
    >
      <div className="text-center mb-8">
        <div className="inline-flex p-4 bg-amber-100 rounded-3xl text-amber-600 mb-4 shadow-sm">
          <ShieldAlert size={32} />
        </div>
        <h2 className="text-3xl font-black text-slate-900 mb-2">Who is Suspicious?</h2>
        <p className="text-slate-500 font-medium">Select the player you think is the Imposter.</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-3 pb-24 scrollbar-hide">
        {players.map((player, idx) => (
          <motion.button
            key={player.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => {
              setSelectedPlayer(player);
              setIsConfirming(false);
            }}
            className={`
              w-full flex items-center p-4 rounded-2xl border-2 transition-all relative overflow-hidden
              ${selectedPlayer?.id === player.id 
                ? 'bg-indigo-50 border-indigo-600' 
                : 'bg-white border-slate-100 hover:border-indigo-100'}
            `}
          >
            <div className={`
              w-12 h-12 rounded-xl flex items-center justify-center mr-4 transition-colors
              ${selectedPlayer?.id === player.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400'}
            `}>
              <User size={24} />
            </div>
            <span className={`text-lg font-bold ${selectedPlayer?.id === player.id ? 'text-indigo-900' : 'text-slate-700'}`}>
              {player.name}
            </span>
            
            {selectedPlayer?.id === player.id && (
              <motion.div 
                layoutId="check"
                className="ml-auto text-indigo-600"
              >
                <CheckCircle2 size={24} fill="currentColor" className="text-white" />
              </motion.div>
            )}
          </motion.button>
        ))}
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-white via-white to-transparent max-w-md mx-auto">
        <AnimatePresence mode="wait">
          {!isConfirming ? (
            <motion.button
              key="vote-btn"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              disabled={!selectedPlayer}
              onClick={() => setIsConfirming(true)}
              className={`
                w-full py-5 rounded-[2rem] font-bold shadow-xl transition-all
                ${!selectedPlayer 
                  ? 'bg-slate-100 text-slate-300 cursor-not-allowed' 
                  : 'bg-indigo-600 text-white shadow-indigo-100 active:scale-95'}
              `}
            >
              VOTE FOR {selectedPlayer ? selectedPlayer.name.toUpperCase() : '...'}
            </motion.button>
          ) : (
            <motion.div
              key="confirm-area"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="space-y-3"
            >
              <p className="text-center text-xs font-bold text-indigo-600 uppercase tracking-widest mb-1">Are you absolutely sure?</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="flex-1 py-4 bg-slate-100 text-slate-600 font-bold rounded-2xl active:scale-95 transition-transform"
                >
                  No, wait
                </button>
                <button
                  onClick={handleConfirmVote}
                  className="flex-[2] py-4 bg-rose-600 text-white font-bold rounded-2xl shadow-xl shadow-rose-100 active:scale-95 transition-transform"
                >
                  Confirm Vote
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className="h-safe-bottom" />
    </motion.div>
  );
};

export default VotingView;
