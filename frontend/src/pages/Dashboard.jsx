import React, { useEffect, useState } from 'react';
import { BrainCircuit, FileText, Map, Settings, ChevronRight, Activity, Code, Target, RefreshCw, Briefcase, ChevronDown, CheckCircle2, Circle, Zap } from 'lucide-react';
import { useStudent } from '../context/StudentContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const { fetchPlacementScore, loading, errors, studentData, placementScore, careerMatch } = useStudent();
  const [staleSession, setStaleSession] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      const loadData = async () => {
        try {
          // Temporarily use profile ID or email if mapping to FastAPI
          // If FastAPI isn't synced, this might fail, but we'll try with 1 for now or skip
          await fetchPlacementScore(user.id);
        } catch (error) {
          console.log(error);
        } finally {
          setInitialLoad(false);
        }
      };
      loadData();
    }
  }, [user, fetchPlacementScore]);

  if (!user) return null;

  const scoreData = placementScore?.scoreData || {};
  const topMatch = careerMatch?.matches?.[0] || { career: "Software Engineer", match_percentage: 0 };
  const breakdown = scoreData.breakdown || { academic: 0, coding: 0, projects: 0, skills: 0, resume: 0 };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {studentData?.name || "Student"}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Here is your central overview.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={() => fetchPlacementScore(studentId)} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <RefreshCw size={16} /> Refresh Analysis
          </button>
          <button onClick={() => navigate('/resume')} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <FileText size={16} /> Analyze Resume
          </button>
          <button onClick={() => navigate('/roadmap')} className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <Map size={16} /> Generate Roadmap
          </button>
          <button onClick={() => navigate('/mentor')} className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm">
            <BrainCircuit size={16} /> Ask AI Mentor
          </button>
        </div>
      </div>

      {/* Top Main Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* NextStep Score */}
        <div className="bg-gradient-to-br from-[#6366F1] to-[#8B5CF6] p-6 rounded-2xl shadow-sm text-white flex flex-col justify-between h-40">
           <div>
             <p className="text-white/80 text-sm font-medium mb-1">NextStep Score</p>
             <h2 className="text-5xl font-bold">{scoreData.total_score || 0}<span className="text-2xl text-white/60 font-normal">/100</span></h2>
           </div>
           <div className="text-sm font-medium text-white bg-white/20 px-3 py-1.5 rounded-lg inline-flex items-center gap-2 w-max">
             <Activity size={16} /> Placement Readiness
           </div>
        </div>

        {/* Top Career Match */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-sm flex flex-col justify-between h-40 transition-colors duration-300">
           <div>
             <p className="text-slate-500 dark:text-slate-400 text-sm font-medium mb-1 flex items-center gap-2"><Target size={16} className="text-[#10B981]" /> Top Career Match</p>
             <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{topMatch.career}</h2>
           </div>
           <div className="flex items-center justify-between">
             <span className="text-3xl font-bold text-[#10B981]">{topMatch.match_percentage}%</span>
             <button onClick={() => navigate('/careers')} className="text-sm text-slate-500 hover:text-[#10B981] transition-colors">View Details</button>
           </div>
        </div>

        {/* Explainable AI */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between h-40 transition-colors duration-300 overflow-hidden">
           <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center gap-2">
             <BrainCircuit size={14} className="text-[#8B5CF6]" /> Why this score?
           </h3>
           <div className="space-y-1 overflow-y-auto custom-scrollbar flex-1 pr-2">
             {scoreData.strengths?.map((s, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-[#10B981] font-bold mt-0.5">+</span>
                  <span className="text-slate-600 dark:text-slate-400 leading-snug">{s}</span>
                </div>
             ))}
             {scoreData.weaknesses?.map((w, i) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <span className="text-red-500 font-bold mt-0.5">-</span>
                  <span className="text-slate-600 dark:text-slate-400 leading-snug">{w}</span>
                </div>
             ))}
           </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Coding Score", score: breakdown.coding, icon: Code, color: "#3B82F6" },
          { label: "Resume Score", score: breakdown.resume, icon: FileText, color: "#F59E0B" },
          { label: "Skill Score", score: breakdown.skills, icon: Zap, color: "#10B981" },
          { label: "Academic Score", score: breakdown.academic, icon: Award, color: "#8B5CF6" }
        ].map((item, idx) => (
          <div key={idx} className="bg-white dark:bg-[#111827] p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col justify-center items-center text-center transition-colors duration-300 group">
             <item.icon size={24} color={item.color} className="mb-3 group-hover:scale-110 transition-transform" />
             <span className="text-3xl font-bold text-slate-900 dark:text-white">{item.score || 0}</span>
             <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wide font-medium">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Career GPS Timeline UI */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm overflow-hidden transition-colors duration-300">
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Map className="text-[#8B5CF6]" /> Career GPS to {topMatch.career}
          </h3>
          <span className="text-xs font-medium px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded-md">Live Tracking</span>
        </div>
        
        <div className="p-8">
          <div className="relative">
             {/* Timeline Line */}
             <div className="absolute top-1/2 left-0 right-0 h-1 bg-slate-200 dark:bg-slate-700 -translate-y-1/2 rounded-full hidden md:block"></div>
             
             {/* Dynamic Progress Line */}
             <div className="absolute top-1/2 left-0 w-[45%] h-1 bg-gradient-to-r from-[#6366F1] to-[#10B981] -translate-y-1/2 rounded-full hidden md:block z-0"></div>
             
             <div className="grid grid-cols-1 md:grid-cols-5 gap-8 relative z-10">
               {[
                 { stage: "Foundation", status: "completed", desc: "Basic concepts & syntax", icon: CheckCircle2, color: "text-[#10B981]", bg: "bg-[#10B981]" },
                 { stage: "Core Skills", status: "completed", desc: "Data structures & tools", icon: CheckCircle2, color: "text-[#10B981]", bg: "bg-[#10B981]" },
                 { stage: "Projects", status: "current", desc: "Build & deploy 3 apps", icon: Activity, color: "text-[#6366F1]", bg: "bg-[#6366F1]", pulse: true },
                 { stage: "Interview Prep", status: "locked", desc: "System design & mock", icon: Circle, color: "text-slate-400 dark:text-slate-500", bg: "bg-slate-200 dark:bg-slate-700" },
                 { stage: "Placement Ready", status: "locked", desc: "Target roles & apply", icon: Target, color: "text-slate-400 dark:text-slate-500", bg: "bg-slate-200 dark:bg-slate-700" }
               ].map((step, i) => (
                 <div key={i} className="flex flex-row md:flex-col items-center text-left md:text-center gap-4 md:gap-3 group">
                    <div className="relative flex-shrink-0">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center border-4 border-white dark:border-[#111827] shadow-sm transition-transform duration-300 group-hover:scale-110 ${step.bg} ${step.status === 'locked' ? 'opacity-50' : ''}`}>
                         {step.status === 'completed' && <step.icon size={20} className="text-white" />}
                         {step.status === 'current' && <step.icon size={20} className="text-white animate-pulse" />}
                         {step.status === 'locked' && <step.icon size={20} className="text-slate-500" />}
                      </div>
                      {step.pulse && (
                        <div className="absolute inset-0 rounded-full bg-[#6366F1] animate-ping opacity-20"></div>
                      )}
                    </div>
                    <div>
                      <h4 className={`text-sm font-bold ${step.status === 'locked' ? 'text-slate-500' : 'text-slate-900 dark:text-white'}`}>{step.stage}</h4>
                      <p className="text-xs text-slate-500 mt-1">{step.desc}</p>
                    </div>
                 </div>
               ))}
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}

// Missing icons for imports
const Zap = ({ size, color, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon></svg>;
const Award = ({ size, color, className }) => <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="8" r="7"></circle><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline></svg>;
