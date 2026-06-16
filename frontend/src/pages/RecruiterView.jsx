import React from 'react';
import { Share2, MapPin, ExternalLink, ShieldCheck } from 'lucide-react';

export default function RecruiterView() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-8">Recruiter View</h1>

      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300 max-w-xl">
        
        <div className="flex items-center justify-between mb-6 pb-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Public Profile</h3>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">Green tick <span className="text-[#8B5CF6] hover:underline cursor-pointer">Share link</span></p>
          </div>
          <button className="bg-[#10B981] hover:bg-[#059669] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <Share2 size={16} /> Share Profile
          </button>
        </div>

        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex-shrink-0 border-2 border-white dark:border-[#0B0F19] overflow-hidden">
             <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="Profile" className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Abhinav Vidadala</h2>
              <ShieldCheck size={16} className="text-[#3B82F6]" />
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">Software Engineering Student</p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1"><MapPin size={12} /> Andhra Pradesh, India</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">85</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Readiness Score</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">450</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Problems Solved</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">15+</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">Projects Built</p>
          </div>
          <div className="text-center">
            <p className="text-xl font-bold text-slate-900 dark:text-white">8.6</p>
            <p className="text-[10px] text-slate-500 mt-1 uppercase">CGPA</p>
          </div>
        </div>

        <div className="mb-8">
          <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Skills</h3>
          <div className="flex flex-wrap gap-2">
            {['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'MongoDB'].map(skill => (
              <span key={skill} className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                {skill}
              </span>
            ))}
          </div>
        </div>

        <button className="flex items-center gap-2 text-sm text-[#8B5CF6] hover:text-[#7C3AED] font-medium transition-colors">
          View Full Profile <ExternalLink size={14} />
        </button>

      </div>

    </div>
  );
}
