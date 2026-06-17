import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Bell, UserCircle, Sun, Moon } from 'lucide-react';

export default function TopHeader({ isDarkMode, toggleDarkMode }) {

  return (
    <header className="h-20 w-full flex items-center justify-between px-8 bg-white dark:bg-[#0B0F19] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-20 transition-colors duration-300">
      
      {/* Search Bar */}
      <div className="relative w-96">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={18} className="text-slate-400 dark:text-slate-500" />
        </div>
        <input 
          type="text" 
          placeholder="Search anything..." 
          className="w-full bg-slate-100 dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-full py-2.5 pl-10 pr-4 text-sm text-slate-900 dark:text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
        />
      </div>

      {/* Right Side Icons */}
      <div className="flex items-center gap-5">
        <button onClick={toggleDarkMode} className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors" title="Toggle Theme">
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        <Link to="/profile" className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center cursor-pointer border-2 border-white dark:border-slate-800 shadow-sm transition-transform hover:scale-105">
          <UserCircle size={20} className="text-white" />
        </Link>
      </div>

    </header>
  );
}
