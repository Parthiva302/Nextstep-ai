import React from 'react';
import { Target, Map, TrendingUp, CheckCircle2, XCircle, ChevronRight, Briefcase } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useNavigate } from 'react-router-dom';

export default function CareerMatch() {
  const { studentData, careerMatch, loading } = useStudent();
  const navigate = useNavigate();

  // If no backend matches exist, fallback to static defaults
  const matches = careerMatch?.matches && careerMatch.matches.length > 0 
    ? careerMatch.matches 
    : [
        { career: "Software Engineer", match_percentage: 85 },
        { career: "AI Engineer", match_percentage: 60 },
        { career: "Data Analyst", match_percentage: 55 }
      ];

  const requiredSkillsMap = careerMatch?.top_match_required_skills || ["Python", "Algorithms", "System Design"];
  const missingSkillsMap = careerMatch?.missing_skills || ["System Design", "Cloud Computing"];
  const studentSkills = studentData?.skills || ["Python", "JavaScript"];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="text-[#10B981]" /> Career Match Engine
          </h1>
          <p className="text-sm text-slate-500 mt-1">Predicting your best career paths based on your current skill profile.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Top Matches Column */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6 uppercase tracking-wider flex items-center gap-2">
              <Briefcase size={16} className="text-[#8B5CF6]" /> Career Paths
            </h3>
            <div className="space-y-4">
              {matches.map((m, i) => (
                <div key={i} className={`p-4 rounded-xl border ${i === 0 ? 'border-[#10B981] bg-[#10B981]/5' : 'border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#0B0F19]'} transition-colors`}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-slate-900 dark:text-white">{m.career}</span>
                    <span className={`text-sm font-bold ${i === 0 ? 'text-[#10B981]' : 'text-slate-500'}`}>{m.match_percentage}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                    <div className={`h-1.5 rounded-full ${i === 0 ? 'bg-[#10B981]' : 'bg-slate-400'}`} style={{ width: `${m.match_percentage}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Match Details Column */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-6 opacity-10">
               <Target size={120} className="text-[#10B981]" />
             </div>
             
             <div className="relative z-10">
               <div className="flex items-center gap-3 mb-2">
                 <span className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs font-bold tracking-wide uppercase">Top Match</span>
                 <span className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400"><TrendingUp size={14} /> High Industry Demand</span>
               </div>
               
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">{matches[0].career}</h2>
               
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                 
                 {/* Required Skills */}
                 <div>
                   <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                     <CheckCircle2 size={16} className="text-[#10B981]" /> Matched Skills
                   </h4>
                   <ul className="space-y-2">
                     {requiredSkillsMap.filter(s => studentSkills.map(st=>st.toLowerCase()).includes(s.toLowerCase())).map((skill, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></div> {skill}
                        </li>
                     ))}
                     {requiredSkillsMap.filter(s => studentSkills.map(st=>st.toLowerCase()).includes(s.toLowerCase())).length === 0 && (
                        <li className="text-sm text-slate-500 italic">No exact matches found.</li>
                     )}
                   </ul>
                 </div>

                 {/* Missing Skills */}
                 <div>
                   <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                     <XCircle size={16} className="text-rose-500" /> Missing Skills
                   </h4>
                   <ul className="space-y-2">
                     {missingSkillsMap.map((skill, i) => (
                        <li key={i} className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-rose-500"></div> {skill}
                        </li>
                     ))}
                   </ul>
                 </div>
                 
               </div>

               <div className="flex gap-4 border-t border-slate-200 dark:border-slate-800 pt-6">
                 <button onClick={() => navigate('/roadmap')} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl font-medium flex items-center gap-2 transition-colors">
                   <Map size={18} /> Generate Learning Plan
                 </button>
                 <button className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-6 py-2.5 rounded-xl font-medium transition-colors">
                   View Details
                 </button>
               </div>
               
             </div>
          </div>
          
        </div>

      </div>

    </div>
  );
}
