import React from 'react';
import { Map } from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export default function LearningRoadmapCard() {
  const { roadmap, loading } = useStudent();

  if (loading.score) {
    return (
      <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
        <div className="animate-spin h-12 w-12 border-4 border-blue-200 dark:border-blue-800 border-t-blue-600 dark:border-t-blue-400 rounded-full mb-4"></div>
        <p className="text-slate-500 dark:text-slate-400">Generating your roadmap...</p>
      </div>
    );
  }

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-blue-100 dark:bg-blue-500/20 p-2 rounded-xl">
          <Map className="text-blue-600 dark:text-blue-400" size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Learning Roadmap</h3>
      </div>
      
      {roadmap ? (
        <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
          {roadmap.weeks?.map((week, idx) => (
            <div key={idx} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 font-bold shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                {week.week}
              </div>
              <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-5 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 shadow-sm transition-transform hover:-translate-y-1">
                <div className="font-bold text-slate-800 dark:text-slate-200 text-lg mb-2">{week.title}</div>
                <div className="text-sm text-slate-600 dark:text-slate-400 space-y-2">
                  <p><strong>Skills:</strong> <span className="text-slate-500 dark:text-slate-300">{week.skills?.join(', ')}</span></p>
                  <p><strong>Project:</strong> <span className="text-slate-500 dark:text-slate-300">{week.project}</span></p>
                  <p className="text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 inline-block px-2 py-1 rounded">{week.effort_hours} hrs/week</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-slate-400 py-10">No roadmap generated.</div>
      )}
    </div>
  );
}
