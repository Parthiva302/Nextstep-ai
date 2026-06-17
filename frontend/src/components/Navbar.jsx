import React from 'react';
import { NavLink } from 'react-router-dom';
import { Target, Home, User, MessageCircle, LogOut, Sun, Moon } from 'lucide-react';

export default function Navbar({ onLogout, isDarkMode, toggleDarkMode }) {
  return (
    <nav className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-md sticky top-0 z-50 border-b border-slate-200/50 dark:border-slate-800/50 shadow-sm transition-colors duration-300 w-full">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 dark:bg-indigo-500 p-2 rounded-xl text-white shadow-lg shadow-indigo-200 dark:shadow-indigo-900/20">
              <Target size={24} strokeWidth={2.5} />
            </div>
            <span className="text-xl font-black bg-gradient-to-r from-indigo-600 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent tracking-tight hidden sm:block">
              NextStep AI
            </span>
          </div>
          
          <div className="flex items-center gap-4 sm:gap-6">
            {studentId && (
              <>
                <NavLink to="/dashboard" className={({isActive}) => `flex items-center gap-2 text-sm font-semibold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}>
                  <Home size={18} /> <span className="hidden md:inline">Dashboard</span>
                </NavLink>
                <NavLink to="/mentor" className={({isActive}) => `flex items-center gap-2 text-sm font-semibold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}>
                  <MessageCircle size={18} /> <span className="hidden md:inline">AI Mentor</span>
                </NavLink>
                <NavLink to="/profile" className={({isActive}) => `flex items-center gap-2 text-sm font-semibold transition-colors ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 dark:text-slate-400 hover:text-indigo-500 dark:hover:text-indigo-300'}`}>
                  <User size={18} /> <span className="hidden md:inline">Profile</span>
                </NavLink>
                <div className="h-6 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
              </>
            )}
            
            <button 
              onClick={toggleDarkMode} 
              className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            
            {studentId && (
              <button onClick={onLogout} className="flex items-center gap-2 text-sm font-semibold text-rose-500 dark:text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors ml-2">
                <LogOut size={18} /> <span className="hidden sm:inline">Logout</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
