import React, { useState } from 'react';
import { LineChart, RefreshCw, Layers, BrainCircuit, Activity, BarChart2, CheckCircle2, ChevronRight, Target } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useNavigate } from 'react-router-dom';

// Note: Recharts is not installed by default in Vite apps unless added. We'll use custom CSS visualizations for the MVP or rely on Recharts if added later.
// We'll build beautiful CSS-based progress bars and radar-like visual structures for the MVP.

export default function SkillAnalysis() {
  const { studentData, careerMatch, skillGaps, loading } = useStudent();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);

  const handleRefresh = () => {
    setAnalyzing(true);
    setTimeout(() => setAnalyzing(false), 1500);
  };

  const skills = studentData?.skills || ["Python", "JavaScript", "React"];
  const missing = careerMatch?.missing_skills || ["System Design", "Docker", "AWS"];
  const softSkills = ["Communication", "Problem Solving", "Teamwork"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-end mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="text-[#8B5CF6]" /> Skill Analysis
          </h1>
          <p className="text-sm text-slate-500 mt-1">AI-powered skill intelligence engine based on your profile.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleRefresh} disabled={analyzing} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50">
            <RefreshCw size={16} className={analyzing ? "animate-spin" : ""} /> Refresh Analysis
          </button>
          <button onClick={() => navigate('/roadmap')} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
             Generate Roadmap
          </button>
        </div>
      </div>

      {analyzing ? (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mb-6"></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analyzing Profile Data...</h3>
          <p className="text-sm text-slate-500 mt-2">Correlating Resume, GitHub, and LeetCode activity.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Technical Skills - Progress Bars */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                <Layers size={16} className="text-[#10B981]" /> Technical Skills
              </h3>
              <div className="space-y-5">
                {[
                  { name: skills[0] || "Python", prof: 85, color: "#3B82F6" },
                  { name: skills[1] || "JavaScript", prof: 75, color: "#F59E0B" },
                  { name: skills[2] || "React", prof: 70, color: "#6366F1" },
                  { name: skills[3] || "SQL", prof: 60, color: "#10B981" }
                ].map((s, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-end mb-1">
                      <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{s.name}</span>
                      <span className="text-xs font-bold text-slate-500">{s.prof}%</span>
                    </div>
                    <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
                      <div className="h-2 rounded-full transition-all duration-1000" style={{ width: `${s.prof}%`, backgroundColor: s.color }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Soft Skills */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                <BrainCircuit size={16} className="text-[#8B5CF6]" /> Soft Skills
              </h3>
              <div className="flex flex-wrap gap-3">
                {softSkills.map((s, i) => (
                   <div key={i} className="flex items-center gap-2 bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-4 py-2.5 rounded-xl text-[#8B5CF6] text-sm font-medium">
                     <CheckCircle2 size={16} /> {s}
                   </div>
                ))}
              </div>
            </div>
            
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Missing Skills & Priorities */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider flex items-center gap-2">
                <Target size={16} className="text-rose-500" /> Skill Priorities (Missing)
              </h3>
              <p className="text-xs text-slate-500 mb-4">Based on your goal: {studentData?.career_goal || "Software Engineer"}</p>
              
              <ul className="space-y-3">
                {missing.map((item, i) => (
                  <li key={i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-rose-500/10 flex items-center justify-center">
                        <Activity size={16} className="text-rose-500" />
                      </div>
                      <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item}</span>
                    </div>
                    <span className="text-xs font-bold px-2 py-1 bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 rounded-md">
                      {i === 0 ? "High Priority" : "Medium Priority"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Skill Matrix */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
                <BarChart2 size={16} className="text-[#3B82F6]" /> Skill Matrix
              </h3>
              <div className="grid grid-cols-2 gap-4">
                 <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Strengths</h4>
                   <div className="flex flex-wrap gap-1">
                     {skills.slice(0, 3).map((s,i) => <span key={i} className="text-xs bg-[#10B981]/10 text-[#10B981] px-2 py-1 rounded">{s}</span>)}
                   </div>
                 </div>
                 <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Emerging</h4>
                   <div className="flex flex-wrap gap-1">
                     {skills.slice(3, 5).map((s,i) => <span key={i} className="text-xs bg-[#3B82F6]/10 text-[#3B82F6] px-2 py-1 rounded">{s}</span>)}
                   </div>
                 </div>
                 <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Gaps</h4>
                   <div className="flex flex-wrap gap-1">
                     {missing.slice(0, 2).map((s,i) => <span key={i} className="text-xs bg-rose-500/10 text-rose-500 px-2 py-1 rounded">{s}</span>)}
                   </div>
                 </div>
                 <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]">
                   <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Target Role</h4>
                   <p className="text-sm font-medium text-slate-900 dark:text-white">{studentData?.career_goal || "Software Engineer"}</p>
                 </div>
              </div>
            </div>

          </div>
        </>
      )}

    </div>
  );
}
