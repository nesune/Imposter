
import React from 'react';
import { motion } from 'framer-motion';
import { Category } from '../types';
import { CATEGORIES } from '../constants';
import { ArrowLeft, Sparkles, Users, Target } from 'lucide-react';

interface CategoryViewProps {
  onSelect: (category: Category) => void;
  onBack: () => void;
  onlinePlayersCount?: number;
  isOnline?: boolean;
}

const CategoryView: React.FC<CategoryViewProps> = ({ onSelect, onBack, onlinePlayersCount = 0, isOnline = false }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 100 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 100 }}
      className="flex-1 flex flex-col p-6 z-10 min-h-screen"
    >
      <div className="flex items-center gap-4 mb-10">
        <motion.button 
          whileTap={{ scale: 0.9 }}
          onClick={onBack}
          className="p-4 bg-white border-2 border-slate-100 rounded-[1.5rem] shadow-xl text-slate-600"
        >
          <ArrowLeft size={24} strokeWidth={3} />
        </motion.button>
        <div className="flex-1">
          <h2 className="text-3xl font-black text-slate-900 leading-tight italic">SELECT THEME</h2>
          {isOnline && (
            <div className="flex items-center gap-2 text-indigo-600 font-black text-[10px] uppercase tracking-widest mt-1">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              <span>{onlinePlayersCount + 1} AGENTS READY</span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1 overflow-y-auto pb-24 scrollbar-hide">
        {CATEGORIES.map((cat, idx) => (
          <motion.button
            key={cat.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05, type: "spring", stiffness: 200 }}
            whileHover={{ y: -8, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => onSelect(cat)}
            className={`
              relative flex flex-col items-center justify-center p-8 rounded-[3rem] text-center border-4 transition-all group overflow-hidden
              ${cat.id === 'ai' 
                ? 'bg-gradient-to-br from-indigo-600 to-violet-700 border-indigo-400 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)]' 
                : 'bg-white border-slate-100 text-slate-900 hover:border-indigo-300 shadow-xl'}
            `}
          >
            {cat.id === 'ai' && (
              <div className="absolute top-4 right-4">
                <Sparkles size={20} className="text-indigo-200 animate-pulse" />
              </div>
            )}
            
            <div className="mb-4 transform group-hover:scale-125 transition-transform duration-300">
              <span className="text-5xl drop-shadow-lg">{cat.emoji}</span>
            </div>
            
            <span className="font-black text-sm uppercase tracking-tight block leading-none">{cat.name}</span>
            <div className={`w-8 h-1 rounded-full my-3 ${cat.id === 'ai' ? 'bg-indigo-300/30' : 'bg-slate-100'}`} />
            <span className={`text-[10px] font-bold leading-tight opacity-70 uppercase tracking-tighter ${cat.id === 'ai' ? 'text-indigo-100' : 'text-slate-400'}`}>
              {cat.description}
            </span>
            
            {/* Decorative background circle */}
            <div className={`absolute -bottom-10 -right-10 w-24 h-24 rounded-full opacity-10 transition-transform group-hover:scale-150 ${cat.id === 'ai' ? 'bg-white' : 'bg-indigo-600'}`} />
          </motion.button>
        ))}
      </div>
      <div className="h-safe-bottom" />
    </motion.div>
  );
};

export default CategoryView;
