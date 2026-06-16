import React from 'react';
import { List, CheckCircle } from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export default function CriticalSkillGapsCard() {
  const { skillGaps, loading } = useStudent();

  if (loading.score) {
    return (
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Analyzing your skill gaps...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 lg:col-span-2 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-indigo-100 dark:bg-indigo-500/20 p-2 rounded-xl">
          <List className="text-indigo-600 dark:text-indigo-400" size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Critical Skill Gaps</h3>
      </div>
      
      <div className="flex-1">
        {skillGaps && skillGaps.gaps && skillGaps.gaps.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {skillGaps.gaps.map((gap, idx) => (
              <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 p-4 rounded-2xl flex flex-col justify-between hover:shadow-md transition-shadow">
                <span className="font-bold text-slate-800 dark:text-slate-200">{gap.skill}</span>
                <div className="mt-4 flex items-center justify-between">
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${gap.priority === 1 ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300' : gap.priority === 2 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'}`}>
                    {gap.priority === 1 ? 'High Priority' : gap.priority === 2 ? 'Medium Priority' : 'Low Priority'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-center text-emerald-600 dark:text-emerald-400 p-6 bg-emerald-50 dark:bg-emerald-500/10 rounded-2xl border border-emerald-100 dark:border-emerald-500/20">
            <CheckCircle size={48} className="mb-4 opacity-50" />
            <span className="font-bold text-lg">You're fully equipped!</span>
            <span className="text-sm mt-1">No major skill gaps detected for your target role.</span>
          </div>
        )}
      </div>
    </div>
  );
}
