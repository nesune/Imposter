
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User } from '../types';
import { LogIn, UserPlus, Mail, Lock, UserCircle, Fingerprint, Ghost } from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User) => void;
  onGuest: () => void;
}

const AuthView: React.FC<AuthViewProps> = ({ onLogin, onGuest }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const users = JSON.parse(localStorage.getItem('imposter_users') || '[]');

    if (isLogin) {
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('AGENT NOT FOUND!');
      }
    } else {
      if (!username || !email || !password) {
        setError('FIELDS MISSING!');
        return;
      }
      if (users.find((u: any) => u.email === email)) {
        setError('EMAIL COMPROMISED!');
        return;
      }
      const newUser: User & { password?: string } = {
        id: Math.random().toString(36).substring(2, 9).toUpperCase(),
        username,
        email,
        wins: 0,
        losses: 0,
        friends: [],
        password: password
      };
      users.push(newUser);
      localStorage.setItem('imposter_users', JSON.stringify(users));
      onLogin(newUser);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex-1 flex flex-col p-8 z-10 justify-center min-h-screen relative"
    >
      <div className="blob" style={{ top: '5%', left: '5%', background: 'linear-gradient(135deg, #f59e0b, #4f46e5)' }} />
      <div className="blob" style={{ bottom: '5%', right: '5%', background: 'linear-gradient(135deg, #ec4899, #4f46e5)' }} />

      <div className="text-center mb-10">
        <motion.div
          animate={{ 
            rotate: [0, -8, 8, 0],
            scale: [1, 1.1, 1],
          }}
          transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
          className="inline-block p-6 bg-indigo-600 rounded-[3rem] shadow-[0_20px_50px_rgba(79,70,229,0.3)] mb-6 text-white border-4 border-white"
        >
          <Fingerprint size={64} strokeWidth={2.5} />
        </motion.div>
        <h1 className="text-5xl font-black text-slate-900 tracking-tighter mb-2 italic">IMPOSTER</h1>
        <p className="text-indigo-600 font-black tracking-widest text-xs uppercase">Secret Mission Briefing</p>
      </div>

      <div className="bg-white p-3 rounded-[3.5rem] shadow-[0_30px_60px_rgba(0,0,0,0.1)] border-2 border-slate-100">
        <div className="flex bg-slate-100 p-2 rounded-[2.8rem] mb-4 relative overflow-hidden">
          <motion.div 
            className="absolute bg-white rounded-[2.3rem] shadow-sm h-[calc(100%-16px)] top-2"
            animate={{ x: isLogin ? 0 : '100%', width: 'calc(50% - 8px)' }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
          />
          <button 
            onClick={() => setIsLogin(true)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black z-10 transition-colors ${isLogin ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <LogIn size={18} /> LOGIN
          </button>
          <button 
            onClick={() => setIsLogin(false)}
            className={`flex-1 flex items-center justify-center gap-2 py-4 text-xs font-black z-10 transition-colors ${!isLogin ? 'text-indigo-600' : 'text-slate-400'}`}
          >
            <UserPlus size={18} /> SIGN UP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <AnimatePresence mode="wait">
            {!isLogin && (
              <motion.div 
                initial={{ opacity: 0, y: -20, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, y: -20, height: 0 }}
                className="relative overflow-hidden"
              >
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
                  <UserCircle size={22} />
                </div>
                <input 
                  type="text"
                  placeholder="AGENT CODE NAME"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-50 border-2 border-transparent rounded-[1.8rem] py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300 text-sm"
                />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
              <Mail size={22} />
            </div>
            <input 
              type="email"
              placeholder="SECURE EMAIL"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.8rem] py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300 text-sm"
            />
          </div>

          <div className="relative">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">
              <Lock size={22} />
            </div>
            <input 
              type="password"
              placeholder="ENCRYPTED KEY"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border-2 border-transparent rounded-[1.8rem] py-4 pl-12 pr-4 font-bold text-slate-700 outline-none focus:border-indigo-400 focus:bg-white transition-all placeholder:text-slate-300 text-sm"
            />
          </div>

          {error && (
            <motion.p 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-rose-500 text-[10px] font-black text-center tracking-widest bg-rose-50 py-2 rounded-xl"
            >
              ⚠️ {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.95 }}
            type="submit"
            className="w-full bg-indigo-600 text-white font-black py-5 rounded-[2rem] shadow-[0_15px_30px_rgba(79,70,229,0.3)] mt-2 active:bg-indigo-700 uppercase tracking-widest flex items-center justify-center gap-3 border-b-4 border-indigo-800"
          >
            {isLogin ? 'AUTHORIZE' : 'INITIATE AGENT'}
            <LogIn size={20} />
          </motion.button>
        </form>

        <div className="px-4 pb-4">
          <div className="flex items-center gap-3 mb-6 mt-2">
            <div className="h-px flex-1 bg-slate-100" />
            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">OR</span>
            <div className="h-px flex-1 bg-slate-100" />
          </div>

          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.95 }}
            onClick={onGuest}
            className="w-full bg-indigo-50 text-indigo-600 font-black py-5 rounded-[2rem] shadow-sm flex items-center justify-center gap-3 uppercase tracking-widest text-xs border-2 border-indigo-100 active:bg-indigo-100 transition-all"
          >
            <Ghost size={20} className="animate-bounce" />
            PLAY AS GUEST AGENT
          </motion.button>
        </div>
      </div>
      
      <p className="mt-8 text-center text-slate-400 text-xs font-black tracking-widest uppercase">
        End-to-End Fun Encryption Active
      </p>
    </motion.div>
  );
};

export default AuthView;
