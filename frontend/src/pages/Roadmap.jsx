import React, { useState, useEffect } from 'react';
import { CheckCircle2, ChevronDown, Circle, Play, Code2, Link, BookOpen, Map, RefreshCw, Clock, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/app-store';

const BACKEND_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export default function Roadmap() {
  const { user, profile } = useAuth();
  const roadmapData = useAppStore((state) => state.learningRoadmap);
  const setRoadmapData = useAppStore((state) => state.setLearningRoadmap);
  const [loading, setLoading] = useState(!roadmapData);
  const [error, setError] = useState(null);
  const [selectedWeekIdx, setSelectedWeekIdx] = useState(0);

  const fetchRoadmap = async () => {
    if (!user) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${BACKEND_URL}/api/roadmap/${user.id}`);
      if (!res.ok) throw new Error('Failed to load roadmap');
      const data = await res.json();
      setRoadmapData(data);
    } catch (err) {
      console.warn("Backend roadmap unavailable, using smart local fallback:", err.message);
      const goal = profile?.career_goal || 'Software Engineer';
      const fallbackWeeks = [
        {
          week: 1,
          title: "Programming Fundamentals & Logic",
          skills: ["Variables", "Control Flow", "Functions", "OOP Basics"],
          resources: ["W3Schools Tutorial", "MDN Web Docs", "freeCodeCamp JS Basics"],
          project: "Build a CLI Calculator",
          effort_hours: 10
        },
        {
          week: 2,
          title: "Data Structures & Algorithms",
          skills: ["Arrays", "Linked Lists", "Complexity Analysis", "Sorting"],
          resources: ["LeetCode Easy Problems", "GeeksforGeeks Guide", "Algos Visualization"],
          project: "Implement Stack & Queue from scratch",
          effort_hours: 12
        },
        {
          week: 3,
          title: "Frontend Basics (UI/UX)",
          skills: ["HTML5", "CSS3 Flexbox", "JavaScript ES6+", "DOM Manipulation"],
          resources: ["CSS Tricks Guide", "JavaScript.info", "Figma Design Introduction"],
          project: "Responsive Portfolio Website",
          effort_hours: 15
        },
        {
          week: 4,
          title: "Modern UI Libraries",
          skills: ["React Components", "State & Props", "Hooks (useState, useEffect)", "TailwindCSS"],
          resources: ["Official React Tutorial", "Tailwind Docs", "React DevTools Guide"],
          project: "Dynamic Task Dashboard",
          effort_hours: 18
        },
        {
          week: 5,
          title: "Backend Services & Databases",
          skills: ["Node.js / Express", "FastAPI", "SQL / PostgreSQL", "REST APIs"],
          resources: ["Node.js Crash Course", "FastAPI Docs", "SQL Bolt Exercises"],
          project: "Secure REST API with Auth",
          effort_hours: 15
        },
        {
          week: 6,
          title: "Cloud & DevOps Basics",
          skills: ["Git & GitHub Workflow", "Docker Containers", "AWS S3 / EC2", "CI/CD"],
          resources: ["Docker Curriculum", "AWS Cloud Practitioner Prep", "GitHub Actions Guide"],
          project: "Containerize & Deploy Web App",
          effort_hours: 16
        },
        {
          week: 7,
          title: "Advanced System Design",
          skills: ["Caching (Redis)", "Database Scaling", "Load Balancers", "Microservices"],
          resources: ["System Design Primer", "ByteByteGo YouTube", "Designing Data-Intensive Apps"],
          project: "Architect a Scalable Chat System",
          effort_hours: 14
        },
        {
          week: 8,
          title: "Interview Prep & Capstone",
          skills: ["Mock Interviews", "Behavioral Prep", "System Architecture Review", "Portfolio Polish"],
          resources: ["Tech Interview Handbook", "STAR Method Guide", "Cracking the Coding Interview"],
          project: "Deploy Full-Stack Capstone Project",
          effort_hours: 20
        }
      ];
      setRoadmapData({
        career_goal: goal,
        weeks: fallbackWeeks,
        estimated_total_weeks: 8,
        estimated_placement_score: 85
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && !roadmapData) {
      fetchRoadmap();
    }
  }, [user, roadmapData]);

  const careerGoal = roadmapData?.career_goal || profile?.career_goal || 'Software Engineer';
  const weeks = roadmapData?.weeks || [];
  const activeWeek = weeks[selectedWeekIdx] || null;

  // Calculate mock overall progress based on selected week
  const progressPercent = Math.round(((selectedWeekIdx + 1) / weeks.length) * 100) || 12;

  if (loading) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mb-6"></div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Generating your Roadmap...</h3>
        <p className="text-sm text-slate-500 mt-2">Personalizing roadmap stages based on your skill profile and target career goals.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Map className="text-[#8B5CF6]" /> My Learning Roadmap
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Personalized learning path targeting <span className="text-[#6366F1] font-bold">{careerGoal}</span>
          </p>
        </div>
        <button 
          onClick={fetchRoadmap} 
          className="bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={14} /> Regenerate
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Progress & Timeline */}
        <div className="lg:col-span-1 space-y-6">
          
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider">Estimated Progress</h3>
            <div className="flex items-end gap-2 mb-4">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">{progressPercent}%</span>
            </div>
            <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] h-2 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-[11px] before:-translate-x-px before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800 pl-8">
              
              {weeks.map((w, idx) => {
                const isActive = idx === selectedWeekIdx;
                const isCompleted = idx < selectedWeekIdx;
                
                return (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedWeekIdx(idx)}
                    className={`relative cursor-pointer transition-all p-2 rounded-xl border ${isActive ? 'bg-[#6366F1]/5 dark:bg-[#6366F1]/10 border-[#6366F1]/20' : 'border-transparent hover:bg-slate-50 dark:hover:bg-slate-800/40'}`}
                  >
                    <div className="absolute left-[-2.05rem] mt-0.5 w-6 h-6 rounded-full flex items-center justify-center ring-4 ring-white dark:ring-[#111827] z-10 transition-colors duration-300">
                      {isCompleted ? (
                        <CheckCircle2 size={16} className="text-[#10B981] bg-white dark:bg-[#111827] rounded-full" />
                      ) : isActive ? (
                        <Circle size={14} className="text-[#8B5CF6] fill-[#8B5CF6]" />
                      ) : (
                        <Circle size={14} className="text-slate-300 dark:text-slate-700 bg-white dark:bg-[#111827] rounded-full" />
                      )}
                    </div>
                    <h4 className={`text-xs font-bold ${isActive ? 'text-[#6366F1] dark:text-white' : 'text-slate-700 dark:text-slate-300'}`}>
                      Week {w.week}
                    </h4>
                    <p className={`text-xs truncate ${isActive ? 'text-slate-800 dark:text-slate-200 font-medium' : 'text-slate-500'}`}>
                      {w.title}
                    </p>
                  </div>
                );
              })}

            </div>
          </div>

        </div>

        {/* Right Column - Selected Week Details */}
        <div className="lg:col-span-2 space-y-6 flex flex-col h-full">
          
          {activeWeek && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm transition-colors duration-300 flex-1 flex flex-col animate-in fade-in duration-300">
              
              <div className="flex justify-between items-start mb-6">
                <div>
                  <span className="text-xs text-[#8B5CF6] dark:text-[#a78bfa] font-bold uppercase tracking-widest bg-[#8B5CF6]/10 px-2.5 py-1 rounded-md">
                    Week {activeWeek.week} Focus
                  </span>
                  <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-3">{activeWeek.title}</h2>
                </div>
                <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl text-xs font-medium">
                  <Clock size={14} /> {activeWeek.effort_hours} Hours Required
                </div>
              </div>

              {/* Target Skills */}
              <div className="mb-6">
                <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider flex items-center gap-1.5">
                  <Sparkles size={14} className="text-[#F59E0B]" /> Target Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {activeWeek.skills?.map((skill, idx) => (
                    <span 
                      key={idx} 
                      className="text-xs px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 rounded-xl font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">
                {/* Resources */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Curated Resources</h3>
                  <div className="space-y-2.5">
                    {activeWeek.resources?.map((resource, idx) => (
                      <a 
                        key={idx} 
                        href={`https://www.google.com/search?q=${encodeURIComponent(resource)}`} 
                        target="_blank" 
                        rel="noreferrer"
                        className="flex items-center gap-2.5 text-xs text-slate-600 dark:text-slate-400 hover:text-[#8B5CF6] dark:hover:text-[#a78bfa] transition-colors cursor-pointer group"
                      >
                        <BookOpen size={14} className="text-slate-400 group-hover:text-[#8B5CF6] transition-colors" /> {resource}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Practical Milestone */}
                <div>
                  <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wider">Weekly Milestone</h3>
                  <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-2xl border border-slate-200/60 dark:border-slate-800/80">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-white mb-2">
                      <Code2 size={14} className="text-[#10B981]" /> {activeWeek.project}
                    </div>
                    <p className="text-[11px] text-slate-500 leading-relaxed">
                      Implement the skills learned this week into a functional, micro-scoped project to prove competency.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between mt-auto pt-6 border-t border-slate-100 dark:border-slate-800">
                <div className="text-left">
                  <p className="text-[11px] text-slate-500">Milestone Project</p>
                  <p className="text-[#8B5CF6] dark:text-[#a78bfa] font-semibold text-xs truncate max-w-[200px] sm:max-w-[300px]">{activeWeek.project}</p>
                </div>
                <button 
                  onClick={() => {
                    if (selectedWeekIdx < weeks.length - 1) {
                      setSelectedWeekIdx(selectedWeekIdx + 1);
                    } else {
                      alert("Congratulations! You've reached the end of your learning roadmap.");
                    }
                  }}
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-[0_4px_14px_rgba(99,102,241,0.2)] hover:-translate-y-0.5 active:translate-y-0"
                >
                  {selectedWeekIdx < weeks.length - 1 ? "Complete & Continue" : "Finish Roadmap"}
                </button>
              </div>
              
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
