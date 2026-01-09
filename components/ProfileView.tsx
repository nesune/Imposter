
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Friend } from '../types';
import { UserCircle, Trophy, Frown, Users, Search, UserPlus, LogOut, ArrowLeft, Check, Copy } from 'lucide-react';

interface ProfileViewProps {
  user: User;
  onClose: () => void;
  onLogout: () => void;
  onUpdateUser: (user: User) => void;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user, onClose, onLogout, onUpdateUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Friend[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [copied, setCopied] = useState(false);

  const totalGames = user.wins + user.losses;
  const winRate = totalGames > 0 ? Math.round((user.wins / totalGames) * 100) : 0;

  const handleSearch = () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    // Simulate search from "database"
    const allUsers = JSON.parse(localStorage.getItem('imposter_users') || '[]');
    const results = allUsers
      .filter((u: any) => 
        u.id !== user.id && 
        (u.username.toLowerCase().includes(searchQuery.toLowerCase()) || u.id.includes(searchQuery.toUpperCase())) &&
        !user.friends.some(f => f.id === u.id)
      )
      .map((u: any) => ({ id: u.id, username: u.username }));
    
    setSearchResults(results);
    setIsSearching(false);
  };

  const addFriend = (friend: Friend) => {
    const updatedUser = {
      ...user,
      friends: [...user.friends, friend]
    };
    onUpdateUser(updatedUser);
    
    // Update local database
    const allUsers = JSON.parse(localStorage.getItem('imposter_users') || '[]');
    const uIdx = allUsers.findIndex((u: any) => u.id === user.id);
    if (uIdx !== -1) {
      allUsers[uIdx] = updatedUser;
      localStorage.setItem('imposter_users', JSON.stringify(allUsers));
    }
    
    // Clear search
    setSearchResults(prev => prev.filter(f => f.id !== friend.id));
  };

  const copyId = () => {
    navigator.clipboard.writeText(user.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className="flex-1 flex flex-col p-6 z-10 overflow-y-auto"
    >
      <div className="flex items-center justify-between mb-8">
        <button onClick={onClose} className="p-3 bg-white border border-slate-100 rounded-2xl shadow-sm text-slate-600">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-bold text-slate-900">Your Agent Profile</h2>
        <button onClick={onLogout} className="p-3 bg-rose-50 border border-rose-100 rounded-2xl text-rose-600">
          <LogOut size={20} />
        </button>
      </div>

      {/* Profile Header */}
      <div className="bg-white rounded-[3rem] p-8 text-center shadow-xl shadow-indigo-100/50 mb-8 border border-white">
        <div className="w-24 h-24 bg-indigo-100 rounded-[2.5rem] mx-auto flex items-center justify-center text-indigo-600 mb-4 shadow-inner">
          <UserCircle size={56} />
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-1">{user.username}</h1>
        <div className="flex items-center justify-center gap-2 mb-6">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">ID: {user.id}</p>
          <button onClick={copyId} className="text-slate-300 hover:text-indigo-600 transition-colors">
            {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
          </button>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="bg-slate-50 rounded-2xl p-3">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter mb-1">Total</p>
            <p className="text-lg font-black text-slate-900">{totalGames}</p>
          </div>
          <div className="bg-green-50 rounded-2xl p-3 border border-green-100">
            <p className="text-[10px] font-bold text-green-600 uppercase tracking-tighter mb-1">Wins</p>
            <p className="text-lg font-black text-green-700">{user.wins}</p>
          </div>
          <div className="bg-indigo-50 rounded-2xl p-3 border border-indigo-100">
            <p className="text-[10px] font-bold text-indigo-600 uppercase tracking-tighter mb-1">Rate</p>
            <p className="text-lg font-black text-indigo-700">{winRate}%</p>
          </div>
        </div>
      </div>

      {/* Friends Section */}
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between px-2">
          <h3 className="font-extrabold text-slate-900 flex items-center gap-2">
            <Users size={18} className="text-indigo-600" />
            Friends ({user.friends.length})
          </h3>
        </div>

        {/* Add Friend Search */}
        <div className="relative">
          <input 
            type="text"
            placeholder="Search by Username or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            className="w-full bg-white border border-slate-100 rounded-2xl py-4 pl-12 pr-4 font-semibold text-slate-700 outline-none focus:border-indigo-300 shadow-sm"
          />
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          {searchQuery && (
            <button 
              onClick={handleSearch}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-indigo-600 text-white p-2 rounded-xl"
            >
              <Search size={16} />
            </button>
          )}
        </div>

        <AnimatePresence>
          {searchResults.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="bg-indigo-50 rounded-3xl p-4 border border-indigo-100 space-y-3"
            >
              <p className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest px-2">Results</p>
              {searchResults.map(res => (
                <div key={res.id} className="flex items-center justify-between bg-white p-3 rounded-2xl shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <UserCircle size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{res.username}</p>
                      <p className="text-[10px] text-slate-400">ID: {res.id}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => addFriend(res)}
                    className="p-2 bg-indigo-600 text-white rounded-xl shadow-md active:scale-90 transition-transform"
                  >
                    <UserPlus size={16} />
                  </button>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Friends List */}
        <div className="space-y-3 pb-8">
          {user.friends.length === 0 ? (
            <div className="text-center py-12 bg-slate-50 rounded-[2.5rem] border border-dashed border-slate-200">
              <Users size={48} className="mx-auto text-slate-200 mb-3" />
              <p className="text-slate-400 font-medium">No friends yet.<br/>Search above to add some!</p>
            </div>
          ) : (
            user.friends.map(friend => (
              <motion.div 
                key={friend.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center justify-between bg-white p-4 rounded-[1.5rem] shadow-sm border border-slate-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <UserCircle size={20} />
                  </div>
                  <p className="font-bold text-slate-700">{friend.username}</p>
                </div>
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </motion.div>
            ))
          )}
        </div>
      </div>
      <div className="h-safe-bottom" />
    </motion.div>
  );
};

export default ProfileView;
