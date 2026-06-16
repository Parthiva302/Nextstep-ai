import React from 'react';
import { CheckCircle2, ChevronDown, Circle, Play, Code2, Link, BookOpen } from 'lucide-react';

export default function Roadmap() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Learning Roadmap</h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">Frontend Developer</span>
          <ChevronDown size={16} className="text-slate-400" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Progress & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Overall Progress</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">66%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-[#8B5CF6] h-2 rounded-full" style={{ width: '66%' }}></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-[#10B981] before:via-[#8B5CF6] before:to-slate-200 dark:before:to-slate-800 pl-8">
              
              <div className="relative">
                <div className="absolute left-[-2rem] mt-0.5 w-6 h-6 bg-[#10B981] rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#111827] z-10 transition-colors duration-300">
                  <CheckCircle2 size={14} className="text-white" />
                </div>
                <h4 className="text-sm font-medium text-slate-900 dark:text-white">1. Foundations</h4>
                <p className="text-xs text-[#10B981] mt-1">Completed</p>
              </div>

              <div className="relative bg-[#6366F1]/5 dark:bg-[#6366F1]/10 -m-4 p-4 rounded-xl border border-[#6366F1]/20">
                <div className="absolute left-[-1rem] mt-0.5 w-6 h-6 bg-[#8B5CF6] rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#111827] z-10 transition-colors duration-300">
                  <Circle size={10} className="fill-white" />
                </div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">2. Core Development</h4>
                <p className="text-xs text-[#8B5CF6] mt-1">In Progress</p>
              </div>

              <div className="relative opacity-50">
                <div className="absolute left-[-2rem] mt-0.5 w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#111827] z-10 transition-colors duration-300"></div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">3. Advanced Topics</h4>
                <p className="text-xs text-slate-500 mt-1">Pending</p>
              </div>

              <div className="relative opacity-50">
                <div className="absolute left-[-2rem] mt-0.5 w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#111827] z-10 transition-colors duration-300"></div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">4. Specialization</h4>
                <p className="text-xs text-slate-500 mt-1">Pending</p>
              </div>

              <div className="relative opacity-50">
                <div className="absolute left-[-2rem] mt-0.5 w-6 h-6 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#111827] z-10 transition-colors duration-300"></div>
                <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">5. Industry Ready</h4>
                <p className="text-xs text-slate-500 mt-1">Pending</p>
              </div>

            </div>
          </div>

        </div>

        {/* Right Column - Current Step Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors duration-300 flex-1 flex flex-col">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">Current Step</span>
            </div>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">React.js</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-8">
              Learn React concepts, components, state management, and build projects.
            </p>

            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Topics</h3>
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={16} className="text-[#10B981]" />
                <span className="text-slate-500 dark:text-slate-400 line-through">1. Components & Props</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <CheckCircle2 size={16} className="text-[#10B981]" />
                <span className="text-slate-500 dark:text-slate-400 line-through">2. State & Lifecycle</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Circle size={16} className="text-[#8B5CF6]" />
                <span className="text-slate-900 dark:text-white font-medium">3. Event Handling</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Circle size={16} className="text-slate-300 dark:text-slate-700" />
                <span className="text-slate-600 dark:text-slate-400">4. Forms</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Circle size={16} className="text-slate-300 dark:text-slate-700" />
                <span className="text-slate-600 dark:text-slate-400">5. React Hooks</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-auto">
              
              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Resources</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] transition-colors cursor-pointer">
                    <BookOpen size={16} /> React Official Docs
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] transition-colors cursor-pointer">
                    <BookOpen size={16} /> MDN Web Docs
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] transition-colors cursor-pointer">
                    <Link size={16} /> freeCodeCamp
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] transition-colors cursor-pointer">
                    <Play size={16} /> YouTube Playlist
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">Practice</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] transition-colors cursor-pointer">
                    <Code2 size={16} /> Practice Problems (12)
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] transition-colors cursor-pointer">
                    <Code2 size={16} /> Mini Projects (5)
                  </div>
                  <div className="flex items-center gap-3 text-sm text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] transition-colors cursor-pointer">
                    <Code2 size={16} /> Build a Todo App
                  </div>
                </div>
              </div>

            </div>

            <div className="flex items-center justify-between mt-8 pt-8 border-t border-slate-200 dark:border-slate-800">
              <div className="text-center">
                <p className="text-xs text-slate-500 dark:text-slate-400">Estimated Time</p>
                <p className="text-[#8B5CF6] font-medium">6 weeks</p>
              </div>
              <button className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-3 rounded-xl font-medium transition-colors shadow-[0_4px_14px_rgba(99,102,241,0.2)] dark:shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                Continue Learning
              </button>
            </div>
            
          </div>

        </div>

      </div>

    </div>
  );
}
