import React, { useState, useEffect, useCallback } from 'react';
import { Target, CheckCircle2, ChevronRight, Briefcase, TrendingUp, Zap, AlertCircle, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { calculateCareerMatches, CAREER_SKILLS_MAP } from '../utils/score-engine';

const getCareerMetadata = (name) => {
  const meta = {
    'Software Engineer': { icon: '💻', color: '#6366F1', desc: 'Build scalable web apps and backend systems.' },
    'Full Stack Developer': { icon: '🌐', color: '#3B82F6', desc: 'Build frontend and backend components.' },
    'Backend Developer': { icon: '⚙️', color: '#10B981', desc: 'Design database systems, APIs, and services.' },
    'Frontend Developer': { icon: '🎨', color: '#EC4899', desc: 'Create beautiful, interactive UI layouts.' },
    'AI Engineer': { icon: '🤖', color: '#8B5CF6', desc: 'Build intelligent AI/ML systems and LLM applications.' },
    'Machine Learning Engineer': { icon: '🧠', color: '#F59E0B', desc: 'Train and deploy production ML models.' },
    'Data Analyst': { icon: '📊', color: '#14B8A6', desc: 'Analyze data and generate business insights.' },
    'Data Scientist': { icon: '📈', color: '#6366F1', desc: 'Apply mathematical modeling to extract complex patterns.' },
    'Cloud Engineer': { icon: '☁️', color: '#06B6D4', desc: 'Design and manage cloud infrastructure at scale.' },
    'DevOps Engineer': { icon: '♾️', color: '#EF4444', desc: 'Automate software delivery pipelines.' },
    'Cyber Security Analyst': { icon: '🛡️', color: '#E11D48', desc: 'Protect networks and systems from threats.' },
    'Product Manager': { icon: '🎯', color: '#F59E0B', desc: 'Drive product roadmap, strategies, and execution.' }
  };
  return meta[name] || { icon: '💼', color: '#6B7280', desc: 'Analyze and build software careers.' };
};

// Skeleton card for loading state
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 animate-pulse">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-slate-200 dark:bg-slate-700 rounded-full" />
          <div>
            <div className="h-4 w-32 bg-slate-200 dark:bg-slate-700 rounded mb-1" />
            <div className="h-3 w-20 bg-slate-100 dark:bg-slate-800 rounded" />
          </div>
        </div>
        <div className="h-8 w-12 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
      <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-3" />
      <div className="flex gap-1 mb-3">
        {[1, 2, 3].map(i => <div key={i} className="h-5 w-16 bg-slate-100 dark:bg-slate-800 rounded-md" />)}
      </div>
      <div className="h-5 w-24 bg-slate-100 dark:bg-slate-800 rounded-full" />
    </div>
  );
}

export default function CareerMatch() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [selected, setSelected] = useState(null);
  const [careers, setCareers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const careerGoal = profile?.career_goal || 'Software Engineer';

  const loadMatches = useCallback(async (forceRefresh = false) => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      if (forceRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);

      // 1. Try fetching from Supabase cache first (skip if force refresh)
      if (!forceRefresh) {
        const { data: dbMatches, error: dbError } = await supabase
          .from('career_matches')
          .select('*')
          .eq('user_id', user.id)
          .order('match_score', { ascending: false });

        if (!dbError && dbMatches && dbMatches.length > 0) {
          // Check if all scores are 0 — means skills haven't been seeded yet
          const hasRealScores = dbMatches.some(m => (m.match_score ?? 0) > 0);
          if (hasRealScores) {
            const mapped = dbMatches.map((m) => {
              const mappedSkills = CAREER_SKILLS_MAP[m.career_name] || [];
              const missing = Array.isArray(m.missing_skills) ? m.missing_skills : [];
              const meta = getCareerMetadata(m.career_name);
              return {
                id: m.id,
                career: m.career_name,
                match: m.match_score ?? 0,
                icon: meta.icon,
                color: meta.color,
                required: mappedSkills,
                missing,
                demand: m.industry_demand || 'High',
                salary: m.salary_range || '₹8–22 LPA',
                desc: meta.desc
              };
            });
            setCareers(mapped);
            return; // Done — used cached data with real scores
          }
          // Fall through to recalculate if all 0%
        }
      }

      // 2. Resolve skills: profile.skills → github_stats.languages → []
      let userSkills = Array.isArray(profile?.skills) ? profile.skills : [];

      if (userSkills.length === 0) {
        // Try pulling languages from github_stats as skill proxies
        const { data: ghStats } = await supabase
          .from('github_stats')
          .select('languages')
          .eq('user_id', user.id)
          .single();
        if (ghStats?.languages) {
          const langs = Array.isArray(ghStats.languages)
            ? ghStats.languages
            : Object.keys(ghStats.languages);
          if (langs.length > 0) {
            userSkills = langs;
            // Back-fill profile skills so future loads are instant
            await supabase
              .from('profiles')
              .update({ skills: userSkills })
              .eq('user_id', user.id);
          }
        }
      }

      // 3. Compute fresh matches
      const generated = await calculateCareerMatches(user.id, userSkills);

      if (!generated || generated.length === 0) {
        // No skills at all — generate 0% placeholders
        const defaults = Object.keys(CAREER_SKILLS_MAP).map((careerName, idx) => {
          const meta = getCareerMetadata(careerName);
          const reqSkills = CAREER_SKILLS_MAP[careerName] || [];
          return {
            id: idx,
            career: careerName,
            match: 0,
            icon: meta.icon,
            color: meta.color,
            required: reqSkills,
            missing: reqSkills,
            demand: 'High',
            salary: '₹8–22 LPA',
            desc: meta.desc
          };
        });
        setCareers(defaults);
        return;
      }

      const mapped = generated.map((m, idx) => {
        const mappedSkills = CAREER_SKILLS_MAP[m.career_name] || [];
        const missing = Array.isArray(m.missing_skills) ? m.missing_skills : [];
        const meta = getCareerMetadata(m.career_name);
        return {
          id: m.id ?? idx,
          career: m.career_name,
          match: m.match_score ?? 0,
          icon: meta.icon,
          color: meta.color,
          required: mappedSkills,
          missing,
          demand: m.industry_demand || 'High',
          salary: m.salary_range || '₹8–22 LPA',
          desc: meta.desc
        };
      });
      setCareers(mapped);
    } catch (err) {
      console.error('Error loading career matches:', err);
      setError('Failed to load career analysis. Please try again.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, profile]);


  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-6 pb-10">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Target className="text-[#10B981]" /> Career Match Engine
            </h1>
            <p className="text-slate-500 dark:text-slate-400 mt-1">AI-predicted best career paths based on your profile</p>
          </div>
        </div>
        {/* Banner skeleton */}
        <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl p-6 animate-pulse">
          <div className="flex justify-between items-center gap-4">
            <div>
              <div className="h-3 w-32 bg-white/30 rounded mb-2" />
              <div className="h-8 w-52 bg-white/40 rounded mb-2" />
              <div className="h-3 w-48 bg-white/20 rounded" />
            </div>
            <div className="text-right">
              <div className="h-16 w-24 bg-white/30 rounded mb-1" />
              <div className="h-3 w-20 bg-white/20 rounded" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 gap-4">
        <AlertCircle size={48} className="text-red-400" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Failed to Load Career Analysis</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">{error}</p>
        <button
          onClick={() => loadMatches()}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <RefreshCw size={16} /> Retry
        </button>
      </div>
    );
  }

  // ── Sort: career goal first, then by match score ────────────────────────────
  const sortedCareers = [...careers].sort((a, b) => {
    if (a.career === careerGoal) return -1;
    if (b.career === careerGoal) return 1;
    return b.match - a.match;
  });

  const topMatch = sortedCareers[0] || null;

  // ── Empty state ─────────────────────────────────────────────────────────────
  if (!topMatch) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-12 gap-4">
        <Briefcase size={48} className="text-slate-300 dark:text-slate-600" />
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Career Matches Yet</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm max-w-sm">
          Add your technical skills to your profile so we can calculate your best-fit career paths.
        </p>
        <button
          onClick={() => navigate('/profile')}
          className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
        >
          <Zap size={16} /> Complete Your Profile
        </button>
      </div>
    );
  }

  // ── Main view ───────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Target className="text-[#10B981]" /> Career Match Engine
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">AI-predicted best career paths based on your profile</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => loadMatches(true)}
            disabled={refreshing}
            className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={15} className={refreshing ? 'animate-spin' : ''} />
            {refreshing ? 'Refreshing…' : 'Refresh'}
          </button>
          <button
            onClick={() => navigate('/skills')}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
          >
            <Zap size={16} /> View Skill Gaps
          </button>
        </div>
      </div>

      {/* Top Match Banner */}
      <div className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] rounded-2xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-white/70 text-sm mb-1">🎯 Your Best Career Match</p>
            <h2 className="text-3xl font-bold">{topMatch.career}</h2>
            <p className="text-white/80 text-sm mt-1">{topMatch.desc}</p>
          </div>
          <div className="text-right">
            <div className="text-6xl font-bold">{topMatch.match}%</div>
            <div className="text-white/70 text-sm">Match Score</div>
            <div className="mt-2 text-sm font-medium bg-white/20 px-3 py-1 rounded-full inline-block">{topMatch.salary}</div>
          </div>
        </div>
        <div className="mt-4 h-2 bg-white/20 rounded-full">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${topMatch.match}%` }} />
        </div>
      </div>

      {/* All Careers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedCareers.map((c) => (
          <div
            key={c.id}
            onClick={() => setSelected(selected?.id === c.id ? null : c)}
            className={`bg-white dark:bg-[#111827] rounded-2xl border p-5 shadow-sm cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.01] ${selected?.id === c.id ? 'border-[#6366F1] ring-2 ring-[#6366F1]/30' : 'border-slate-200 dark:border-slate-800'}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{c.icon}</span>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">{c.career}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">{c.salary}</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold" style={{ color: c.color }}>{c.match}%</span>
              </div>
            </div>

            <div className="h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full mb-3">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${c.match}%`, backgroundColor: c.color }}
              />
            </div>

            <div className="flex flex-wrap gap-1 mb-3">
              {(c.required || []).slice(0, 3).map((s, i) => (
                <span key={i} className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-md">{s}</span>
              ))}
              {(c.required || []).length > 3 && (
                <span className="text-xs px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-md">+{c.required.length - 3}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                c.demand === 'Extremely High' || c.demand === 'Critical'
                  ? 'bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400'
                  : c.demand === 'Very High'
                  ? 'bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400'
                  : 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
              }`}>
                {c.demand} Demand
              </span>
              <ChevronRight size={14} className="text-slate-400" />
            </div>
          </div>
        ))}
      </div>

      {/* Expanded Detail Panel */}
      {selected && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-[#6366F1]/30 p-6 shadow-md animate-in fade-in duration-300">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{selected.icon}</span>
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{selected.career} — Deep Dive</h2>
              <p className="text-sm text-slate-500">{selected.desc}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <CheckCircle2 size={14} className="text-[#10B981]" /> Required Skills
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selected.required || []).map((s, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-green-50 dark:bg-green-900/10 text-green-700 dark:text-green-400 rounded-lg border border-green-100 dark:border-green-900/20 font-medium">{s}</span>
                ))}
                {(selected.required || []).length === 0 && (
                  <span className="text-xs text-slate-400">No required skills mapped.</span>
                )}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                <AlertCircle size={14} className="text-[#EF4444]" /> Skills to Learn
              </h4>
              <div className="flex flex-wrap gap-2">
                {(selected.missing || []).map((s, i) => (
                  <span key={i} className="text-xs px-3 py-1.5 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-lg border border-red-100 dark:border-red-900/20 font-medium">{s}</span>
                ))}
                {(selected.missing || []).length === 0 && (
                  <span className="text-xs text-green-600 dark:text-green-400 font-medium">🎉 You have all required skills!</span>
                )}
              </div>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button
              onClick={() => navigate('/roadmap')}
              className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <TrendingUp size={16} /> View Roadmap for {selected.career}
            </button>
            <button
              onClick={() => navigate('/skills')}
              className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 px-5 py-2 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <Zap size={16} /> Skill Analysis
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
