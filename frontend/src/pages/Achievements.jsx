import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { Award, ShieldCheck, Code, FileText, CheckCircle2, Lock, Sparkles, BookOpen } from 'lucide-react';
import { Github } from '../components/Icons';

export default function Achievements() {
  const { user, profile } = useAuth();
  const [dbAchievements, setDbAchievements] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        setLoading(true);
        // Fetch achievements
        const { data: ach } = await supabase.from('achievements').select('*').eq('user_id', user.id);
        if (ach) setDbAchievements(ach.map(a => a.achievement_name));

        // Fetch projects count
        const { data: projs } = await supabase.from('projects').select('*').eq('user_id', user.id);
        if (projs) setProjects(projs);
      } catch (err) {
        console.warn('Error loading achievements:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [user]);

  // Checklist Completion Engine (Weighted matching Dashboard)
  const skillsList = Array.isArray(profile?.skills) ? profile.skills : [];
  
  const completionPercent = Math.round(
    (dbAchievements.includes('Resume Uploaded') ? 15 : 0) +
    (profile?.github_username ? 15 : 0) +
    (profile?.leetcode_username ? 15 : 0) +
    (projects.length > 0 ? 20 : 0) +
    (skillsList.length > 0 ? 15 : 0) +
    (profile?.career_goal ? 10 : 0) +
    (profile?.cgpa ? 10 : 0)
  );

  const checklist = [
    { label: 'Resume Uploaded (15%)', done: dbAchievements.includes('Resume Uploaded') },
    { label: 'GitHub Connected (15%)', done: !!profile?.github_username },
    { label: 'LeetCode Connected (15%)', done: !!profile?.leetcode_username },
    { label: 'Projects Added (20%)', done: projects.length > 0 },
    { label: 'Skills Selected (15%)', done: skillsList.length > 0 },
    { label: 'Career Goal Set (10%)', done: !!profile?.career_goal },
    { label: 'CGPA Added (10%)', done: !!profile?.cgpa }
  ];

  const badges = [
    {
      id: 'resume',
      title: 'Resume Uploaded',
      desc: 'First PDF Resume analyzed successfully.',
      icon: FileText,
      unlocked: dbAchievements.includes('Resume Uploaded'),
      color: 'from-blue-500 to-indigo-600',
      emoji: '📄'
    },
    {
      id: 'github',
      title: 'GitHub Connected',
      desc: 'Linked GitHub repositories and commit logs.',
      icon: Github,
      unlocked: dbAchievements.includes('GitHub Connected'),
      color: 'from-slate-700 to-slate-900 dark:from-slate-800 dark:to-black',
      emoji: '🐙'
    },
    {
      id: 'leetcode',
      title: 'LeetCode Connected',
      desc: 'Linked LeetCode stats and problems solved.',
      icon: Code,
      unlocked: dbAchievements.includes('LeetCode Connected'),
      color: 'from-[#F59E0B] to-[#D97706]',
      emoji: '💡'
    },
    {
      id: 'problems',
      title: '100 Coding Problems Solved',
      desc: 'Solved over 100 algorithm challenges on LeetCode.',
      icon: Award,
      unlocked: dbAchievements.includes('100 Coding Problems Solved'),
      color: 'from-emerald-500 to-teal-600',
      emoji: '🏆'
    },
    {
      id: 'first_project',
      title: 'First Project Added',
      desc: 'Added first completed project to portfolio.',
      icon: BookOpen,
      unlocked: dbAchievements.includes('First Project Added'),
      color: 'from-cyan-500 to-blue-600',
      emoji: '🚀'
    },
    {
      id: 'five_projects',
      title: '5 Projects Completed',
      desc: 'Completed 5 robust software engineering projects.',
      icon: Award,
      unlocked: dbAchievements.includes('5 Projects Completed'),
      color: 'from-violet-500 to-purple-600',
      emoji: '⭐'
    },
    {
      id: 'profile_100',
      title: 'Profile 100%',
      desc: 'Completed all onboarding credentials and connected hubs.',
      icon: ShieldCheck,
      unlocked: dbAchievements.includes('Profile 100%'),
      color: 'from-pink-500 to-rose-600',
      emoji: '👑'
    },
    {
      id: 'readiness_80',
      title: 'Readiness Above 80',
      desc: 'Achieved an outstanding NextStep Score of 80+.',
      icon: Sparkles,
      unlocked: dbAchievements.includes('Readiness Above 80'),
      color: 'from-amber-400 to-orange-500',
      emoji: '🔥'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center text-center p-8 transition-colors duration-300">
        <div className="w-16 h-16 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mb-6"></div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Loading Achievements...</h3>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="bg-white dark:bg-[#111827] p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-300">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          My Achievements 🏆
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-1">Unlock badges by connecting your profiles and completing goals.</p>
        
        {/* Profile Completion Bar */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300">Profile Completion Progress</span>
            <span className="text-sm font-bold text-[#6366F1]">{completionPercent}%</span>
          </div>
          <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-500" style={{ width: `${completionPercent}%` }}></div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 mt-4">
            {checklist.map((item, idx) => (
              <div key={idx} className="flex items-center gap-1.5 text-xs">
                <CheckCircle2 size={12} className={item.done ? 'text-[#10B981]' : 'text-slate-300 dark:text-slate-700'} />
                <span className={item.done ? 'text-slate-700 dark:text-slate-300 font-medium' : 'text-slate-400'}>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Badges Grid */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6">Badges & Awards</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {badges.map((badge) => {
            return (
              <div 
                key={badge.id}
                className={`p-6 border rounded-2xl relative transition-all duration-300 flex flex-col items-center text-center ${badge.unlocked ? 'border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] hover:shadow-md' : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-[#111827]/40 opacity-60'}`}
              >
                {/* Badge Emoji Circle */}
                <div className={`w-20 h-20 rounded-full flex items-center justify-center text-4xl mb-4 relative shadow-sm border ${badge.unlocked ? `bg-gradient-to-br ${badge.color} border-white dark:border-slate-800 text-white` : 'bg-slate-200 dark:bg-slate-800 border-slate-300 dark:border-slate-700 filter grayscale'}`}>
                  {badge.unlocked ? badge.emoji : <Lock size={28} className="text-slate-400 dark:text-slate-600" />}
                </div>

                <h4 className={`font-bold ${badge.unlocked ? 'text-slate-900 dark:text-white' : 'text-slate-550'}`}>
                  {badge.title}
                </h4>
                <p className="text-xs text-slate-500 mt-2 max-w-[200px]">
                  {badge.desc}
                </p>

                {/* Status Indicator */}
                <div className={`mt-4 text-xs font-semibold px-2.5 py-1 rounded-full ${badge.unlocked ? 'bg-green-50 text-[#10B981] dark:bg-[#10B981]/10' : 'bg-slate-100 text-slate-400 dark:bg-slate-800'}`}>
                  {badge.unlocked ? 'Unlocked' : 'Locked'}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
