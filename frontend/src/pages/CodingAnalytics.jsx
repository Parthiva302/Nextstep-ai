import React, { useState } from 'react';
import { RefreshCw, Code2, GitMerge, GitBranch, GitCommit, Target, Activity, Flame, Award, PieChart, Layers, BrainCircuit } from 'lucide-react';

export default function CodingAnalytics() {
  const [analyzing, setAnalyzing] = useState(false);

  const handleRefresh = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 1500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Code2 className="text-[#3B82F6]" /> Coding Intelligence
          </h1>
          <p className="text-sm text-slate-500 mt-1">Deep analysis of your GitHub and LeetCode activity.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRefresh} disabled={analyzing} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} /> Refresh Stats
          </button>
          <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
            <BrainCircuit size={16} /> Analyze Progress
          </button>
        </div>
      </div>

      {analyzing ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full border-4 border-[#3B82F6] border-t-transparent animate-spin mb-6"></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Syncing with Platforms...</h3>
          <p className="text-sm text-slate-500 mt-2">Fetching latest repositories, commits, and problem resolutions.</p>
        </div>
      ) : (
        <>
          {/* Core Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-[#3B82F6] to-[#6366F1] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-center text-center">
               <h3 className="text-white/80 text-sm font-medium uppercase tracking-wider mb-2">Coding Score</h3>
               <span className="text-5xl font-bold">78<span className="text-xl text-white/60">/100</span></span>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
               <Activity size={24} className="text-[#10B981] mb-2" />
               <span className="text-3xl font-bold text-slate-900 dark:text-white">85%</span>
               <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Consistency Score</h3>
            </div>
            <div className="bg-white dark:bg-[#111827] p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center">
               <Award size={24} className="text-[#F59E0B] mb-2" />
               <span className="text-3xl font-bold text-slate-900 dark:text-white">72%</span>
               <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mt-1">Problem Solving Score</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* GitHub Stats */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                <GitBranch size={16} className="text-slate-900 dark:text-white" /> GitHub Activity
              </h3>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">12</span>
                  <span className="text-xs text-slate-500 font-medium">Repositories</span>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-800 text-center">
                  <span className="block text-2xl font-bold text-slate-900 dark:text-white">340</span>
                  <span className="text-xs text-slate-500 font-medium">Commits</span>
                </div>
              </div>
              
              <div>
                <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase">Top Languages</h4>
                <div className="space-y-3">
                  {[{name:"JavaScript", p:45, c:"#F59E0B"}, {name:"Python", p:35, c:"#3B82F6"}, {name:"HTML/CSS", p:20, c:"#10B981"}].map((l,i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="font-medium text-slate-700 dark:text-slate-300">{l.name}</span>
                        <span className="font-bold">{l.p}%</span>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-1.5 rounded-full">
                        <div className="h-1.5 rounded-full" style={{width: `${l.p}%`, backgroundColor: l.c}}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* LeetCode Stats */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} className="text-[#F59E0B]" /> LeetCode Stats
              </h3>
              <div className="flex items-center justify-between mb-8">
                <div className="text-center">
                  <span className="block text-4xl font-bold text-slate-900 dark:text-white">150</span>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Total Solved</span>
                </div>
                <div className="text-center px-6 border-l border-r border-slate-200 dark:border-slate-800">
                  <div className="flex items-center justify-center gap-1 text-[#F97316]">
                    <Flame size={20} />
                    <span className="text-3xl font-bold">14</span>
                  </div>
                  <span className="text-xs text-slate-500 font-medium uppercase tracking-wider mt-1">Day Streak</span>
                </div>
              </div>
              
              <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase">Problem Difficulty Chart</h4>
              <div className="flex items-end gap-2 h-24 mb-2">
                <div className="flex-1 bg-[#10B981]/20 rounded-t-lg relative group">
                  <div className="absolute bottom-0 w-full bg-[#10B981] rounded-t-lg transition-all" style={{height: '60%'}}></div>
                </div>
                <div className="flex-1 bg-[#F59E0B]/20 rounded-t-lg relative group">
                  <div className="absolute bottom-0 w-full bg-[#F59E0B] rounded-t-lg transition-all" style={{height: '80%'}}></div>
                </div>
                <div className="flex-1 bg-[#EF4444]/20 rounded-t-lg relative group">
                  <div className="absolute bottom-0 w-full bg-[#EF4444] rounded-t-lg transition-all" style={{height: '30%'}}></div>
                </div>
              </div>
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#10B981] flex-1 text-center">Easy (45)</span>
                <span className="text-[#F59E0B] flex-1 text-center">Medium (80)</span>
                <span className="text-[#EF4444] flex-1 text-center">Hard (25)</span>
              </div>
            </div>

          </div>

          {/* Activity Graph */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
              <Activity size={16} className="text-[#6366F1]" /> Overall Activity Graph (GitHub + LeetCode)
            </h3>
            <div className="flex flex-wrap gap-1 mb-2">
              {/* Mock contribution graph cells */}
              {Array.from({length: 120}).map((_, i) => {
                const opacity = Math.random();
                const bg = opacity > 0.8 ? 'bg-[#10B981]' : opacity > 0.5 ? 'bg-[#10B981]/60' : opacity > 0.2 ? 'bg-[#10B981]/30' : 'bg-slate-100 dark:bg-slate-800';
                return (
                  <div key={i} className={`w-3 h-3 rounded-sm ${bg}`}></div>
                )
              })}
            </div>
            <div className="flex justify-between text-xs text-slate-500 font-medium mt-2">
              <span>Less</span>
              <div className="flex gap-1 items-center">
                <div className="w-3 h-3 rounded-sm bg-slate-100 dark:bg-slate-800"></div>
                <div className="w-3 h-3 rounded-sm bg-[#10B981]/30"></div>
                <div className="w-3 h-3 rounded-sm bg-[#10B981]/60"></div>
                <div className="w-3 h-3 rounded-sm bg-[#10B981]"></div>
              </div>
              <span>More</span>
            </div>
          </div>

        </>
      )}

    </div>
  );
}
