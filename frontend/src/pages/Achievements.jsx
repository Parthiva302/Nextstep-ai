import React from 'react';
import Profile from './Profile';

export default function Achievements({ studentId }) {
  // We can just reuse the Profile component but we'd need to tell it to open the Achievements tab.
  // Since we don't have a way to pass defaultTab to Profile easily without editing it,
  // let's just make a standalone view or edit Profile to accept defaultTab.
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      <div className="flex items-center justify-between bg-white dark:bg-[#111827] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            My Achievements 🏆
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">View all your hard-earned badges and certificates.</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Badges & Awards</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-gradient-to-b from-amber-50 to-white dark:from-amber-900/10 dark:to-[#111827]">
            <div className="w-16 h-16 mx-auto bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center text-amber-500 mb-4 text-2xl">🥇</div>
            <h4 className="font-bold text-slate-900 dark:text-white">Hackathon Winner</h4>
            <p className="text-sm text-slate-500 mt-2">1st Place at National CodeFest 2024</p>
          </div>
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-900/10 dark:to-[#111827]">
            <div className="w-16 h-16 mx-auto bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-4 text-2xl">⚡</div>
            <h4 className="font-bold text-slate-900 dark:text-white">Top Coder</h4>
            <p className="text-sm text-slate-500 mt-2">Ranked top 5% on LeetCode India</p>
          </div>
          <div className="p-6 border border-slate-200 dark:border-slate-800 rounded-2xl text-center bg-gradient-to-b from-purple-50 to-white dark:from-purple-900/10 dark:to-[#111827]">
            <div className="w-16 h-16 mx-auto bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-purple-500 mb-4 text-2xl">🔥</div>
            <h4 className="font-bold text-slate-900 dark:text-white">100 Day Streak</h4>
            <p className="text-sm text-slate-500 mt-2">Completed 100 days of continuous coding</p>
          </div>
        </div>
      </div>
    </div>
  );
}
