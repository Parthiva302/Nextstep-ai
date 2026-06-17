import React from 'react';
import { Award } from 'lucide-react';

export default function PlacementReadinessCard({ placementScore: scoreData = null }) {
  const loading = { score: false };

  if (loading.score) {
    return (
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="animate-spin h-12 w-12 border-4 border-indigo-200 dark:border-indigo-800 border-t-indigo-600 dark:border-t-indigo-400 rounded-full mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Calculating your placement score...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center text-center">
      <div className="bg-yellow-100 dark:bg-yellow-900/30 p-3 rounded-2xl mb-4">
        <Award className="text-yellow-600 dark:text-yellow-400" size={28} />
      </div>
      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Placement Readiness</h3>
      
      {scoreData ? (
        <div className="mt-6 flex flex-col items-center">
          <div className="relative">
            <svg className="w-32 h-32" viewBox="0 0 36 36">
              <path className="text-slate-100 dark:text-slate-800" strokeWidth="3" stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
              <path className={`${scoreData.total_score > 80 ? 'text-emerald-500' : scoreData.total_score > 60 ? 'text-yellow-500' : 'text-rose-500'}`} strokeWidth="3" strokeDasharray={`${scoreData.total_score}, 100`} stroke="currentColor" fill="none" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-3xl font-black text-slate-900 dark:text-white">{scoreData.total_score}</span>
            </div>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 font-medium">Out of 100</p>
          
          <div className="mt-6 w-full text-left space-y-3">
            <div>
              <span className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-400 mb-1 block">Strengths</span>
              <div className="flex flex-wrap gap-2">
                {scoreData.strengths.map((s, i) => <span key={i} className="text-xs bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-2 py-1 rounded-md">{s}</span>)}
              </div>
            </div>
            <div>
              <span className="text-xs font-bold uppercase text-rose-600 dark:text-rose-400 mb-1 block">Needs Work</span>
              <div className="flex flex-wrap gap-2">
                {scoreData.weaknesses.map((s, i) => <span key={i} className="text-xs bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 px-2 py-1 rounded-md">{s}</span>)}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-slate-500 dark:text-slate-400 mt-10">No score data available.</p>
      )}
    </div>
  );
}
