import React, { useState, useEffect } from 'react';
import {
  RefreshCw, Code2, GitBranch, Target, Activity, Flame,
  Award, Star, Users, Globe, AlertCircle,
  CheckCircle2, Zap, ExternalLink, Link, Check, Laptop, Sparkles, BrainCircuit
} from 'lucide-react';
import { Linkedin, BrainCircle, Github } from '../components/Icons';
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/app-store';
import { useLocation } from 'react-router-dom';

const BACKEND = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const COLORS = ['#6366F1', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

export default function CodingAnalytics() {
  const { user, profile, refreshProfile } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('github'); // 'github', 'leetcode', 'professional'
  const [toast, setToast] = useState('');

  // Sync active tab from location state if passed
  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location]);

  // GitHub Store & State
  const githubData = useAppStore((state) => state.githubData);
  const setGithubData = useAppStore((state) => state.setGithubData);
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [githubError, setGithubError] = useState('');
  const [githubUsername, setGithubUsername] = useState('');

  // LeetCode Store & State
  const leetcodeData = useAppStore((state) => state.leetcodeData);
  const setLeetcodeData = useAppStore((state) => state.setLeetcodeData);
  const [loadingLeetcode, setLoadingLeetcode] = useState(false);
  const [leetcodeError, setLeetcodeError] = useState('');
  const [leetcodeUsername, setLeetcodeUsername] = useState('');

  // Professional Store & State
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [loadingProfessional, setLoadingProfessional] = useState(false);

  async function loadSavedGithubStats() {
    const { data } = await supabase
      .from('github_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setGithubData(data);
  }

  async function loadSavedLeetcodeStats() {
    const { data } = await supabase
      .from('leetcode_stats')
      .select('*')
      .eq('user_id', user.id)
      .single();
    if (data) setLeetcodeData(data);
  }

  // Sync state values on mount
  useEffect(() => {
    if (user) {
      if (!githubData) loadSavedGithubStats();
      if (!leetcodeData) loadSavedLeetcodeStats();
    }
    if (profile) {
      if (profile.github_username && !githubUsername) setGithubUsername(profile.github_username);
      if (profile.leetcode_username && !leetcodeUsername) setLeetcodeUsername(profile.leetcode_username);
      setLinkedinUrl(profile.linkedin_url || '');
      setPortfolioUrl(profile.portfolio_url || '');
    }
  }, [user, profile]);

  // Analyze GitHub
  const analyzeGithub = async () => {
    if (!githubUsername.trim()) { setGithubError('Please enter a GitHub username.'); return; }
    setLoadingGithub(true); setGithubError('');

    try {
      const res = await fetch(`${BACKEND}/api/github/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id || 'anon', github_username: githubUsername.trim() })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to analyze GitHub profile.');
      }

      const data = await res.json();

      // Save to Supabase
      if (user) {
        const statsRow = {
          user_id: user.id,
          username: data.username,
          github_score: data.github_score,
          followers: data.followers,
          following: data.following,
          public_repos: data.public_repos,
          total_stars: data.total_stars,
          total_forks: data.total_forks,
          languages: data.top_languages,
          analysis: data.analysis,
          avatar_url: data.avatar_url,
          bio: data.bio,
          active_repos: data.active_repos,
          updated_at: new Date().toISOString()
        };
        await supabase.from('github_stats').upsert(statsRow, { onConflict: 'user_id' });
        // Update profile
        await supabase.from('profiles').update({ github_username: githubUsername.trim() }).eq('user_id', user.id);
        await refreshProfile();
      }

      const mappedData = { ...data, languages: data.top_languages };
      setGithubData(mappedData);
      setToast('✅ GitHub analysis complete!');
      setTimeout(() => setToast(''), 4000);
    } catch (e) {
      setGithubError(e.message || 'Unable to fetch GitHub data.');
    } finally {
      setLoadingGithub(false);
    }
  };

  // Analyze LeetCode
  const analyzeLeetcode = async () => {
    if (!leetcodeUsername.trim()) { setLeetcodeError('Please enter a LeetCode username.'); return; }
    setLoadingLeetcode(true); setLeetcodeError('');

    try {
      const res = await fetch(`${BACKEND}/api/leetcode/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id || 'anon', leetcode_username: leetcodeUsername.trim() })
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || 'Failed to analyze LeetCode profile.');
      }

      const data = await res.json();

      // Save to Supabase
      if (user) {
        const statsRow = {
          user_id: user.id,
          username: data.username,
          total_solved: data.total_solved,
          easy_solved: data.easy_solved,
          medium_solved: data.medium_solved,
          hard_solved: data.hard_solved,
          ranking: data.ranking,
          contest_rating: data.contest_rating,
          contest_ranking: data.contest_ranking,
          leetcode_score: data.leetcode_score,
          updated_at: new Date().toISOString()
        };
        await supabase.from('leetcode_stats').upsert(statsRow, { onConflict: 'user_id' });
        // Update profile
        await supabase.from('profiles').update({ leetcode_username: leetcodeUsername.trim() }).eq('user_id', user.id);
        await refreshProfile();
      }

      setLeetcodeData(data);
      setToast('✅ LeetCode analysis complete!');
      setTimeout(() => setToast(''), 4000);
    } catch (e) {
      setLeetcodeError(e.message || 'Unable to fetch LeetCode data.');
    } finally {
      setLoadingLeetcode(false);
    }
  };

  // Save Professional URL links
  const saveProfessionalLinks = async (e) => {
    e.preventDefault();
    setLoadingProfessional(true);
    try {
      if (user) {
        await supabase.from('profiles').update({
          linkedin_url: linkedinUrl.trim(),
          portfolio_url: portfolioUrl.trim()
        }).eq('user_id', user.id);
        await refreshProfile();
        setToast('✅ Professional links connected!');
        setTimeout(() => setToast(''), 4000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingProfessional(false);
    }
  };

  // Profile Completion Calculations
  const hasResume = !!(profile?.cgpa || profile?.college); // Mock check for profile completion
  const checklist = [
    { label: 'GitHub Connected', done: !!githubData },
    { label: 'LeetCode Connected', done: !!leetcodeData },
    { label: 'LinkedIn Connected', done: !!profile?.linkedin_url },
    { label: 'Portfolio Connected', done: !!profile?.portfolio_url },
    { label: 'Career Goal Selected', done: !!profile?.career_goal },
    { label: 'Profile Details Verified', done: !!profile?.full_name }
  ];
  const completedCount = checklist.filter(c => c.done).length;
  const completionPercent = Math.round((completedCount / checklist.length) * 100);

  // GitHub constants formatting
  const langChartData = (githubData?.top_languages || githubData?.languages || []).map((lang, i) => ({
    name: lang, value: 100 - i * 15
  }));

  const repoActivityData = [
    { month: 'Jan', repos: 2 }, { month: 'Feb', repos: 3 }, { month: 'Mar', repos: 4 },
    { month: 'Apr', repos: 3 }, { month: 'May', repos: 5 }, { month: 'Jun', repos: githubData?.active_repos || 4 }
  ];

  // LeetCode Data formatting
  const leetcodeChartData = leetcodeData ? [
    { name: 'Easy', value: leetcodeData.easy_solved, color: '#10B981' },
    { name: 'Medium', value: leetcodeData.medium_solved, color: '#F59E0B' },
    { name: 'Hard', value: leetcodeData.hard_solved, color: '#EF4444' }
  ] : [];

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Toast Alert */}
      {toast && (
        <div className="fixed top-6 right-6 z-50 bg-[#10B981] text-white px-5 py-3 rounded-2xl shadow-xl flex items-center gap-2 animate-in slide-in-from-top-4 duration-300">
          <CheckCircle2 size={18} /> {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Laptop className="text-[#6366F1]" /> Developer Hub
          </h1>
          <p className="text-sm text-slate-500 mt-1">Consolidate and monitor your coding profiles, public metrics, and professional status.</p>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('github')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'github' ? 'bg-[#6366F1]/10 text-[#8B5CF6] border border-[#6366F1]/20 font-medium' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <GitBranch size={16} /> GitHub Intelligence
        </button>
        <button
          onClick={() => setActiveTab('leetcode')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'leetcode' ? 'bg-[#EC4899]/10 text-[#EC4899] border border-[#EC4899]/20 font-medium' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <Code2 size={16} /> LeetCode Analytics
        </button>
        <button
          onClick={() => setActiveTab('professional')}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${activeTab === 'professional' ? 'bg-[#0077B5]/10 text-[#0077B5] border border-[#0077B5]/20 font-medium' : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'}`}
        >
          <Linkedin size={16} /> Professional Hub
        </button>
      </div>

      {/* Tab 1: GitHub Intelligence */}
      {activeTab === 'github' && (
        <div className="space-y-6">
          {/* Analyze Input */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <GitBranch size={18} className="text-[#6366F1]" /> Connect GitHub Profile
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">github.com/</span>
                <input
                  type="text"
                  value={githubUsername}
                  onChange={e => setGithubUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyzeGithub()}
                  placeholder="your-username"
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-28 pr-4 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition"
                />
              </div>
              <button
                onClick={analyzeGithub}
                disabled={loadingGithub}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-70 shadow-md shadow-[#6366F1]/20"
              >
                {loadingGithub ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><BrainCircuit size={16} /> Analyze GitHub</>
                )}
              </button>
            </div>
            {githubError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
                <AlertCircle size={16} /> {githubError}
              </div>
            )}
          </div>

          {loadingGithub && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-[#6366F1] border-t-transparent rounded-full animate-spin" />
                <GitBranch size={28} className="absolute inset-0 m-auto text-[#6366F1]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analyzing GitHub Profile...</h3>
              <p className="text-sm text-slate-500 mt-2">Fetching repositories, calculating scores, generating AI insights.</p>
            </div>
          )}

          {!loadingGithub && githubData && (
            <>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#1a1b2e] to-[#0d1117] rounded-2xl p-6 text-white flex flex-wrap items-center gap-6">
                {githubData.avatar_url && (
                  <img src={githubData.avatar_url} alt="avatar" className="w-20 h-20 rounded-full border-4 border-[#6366F1]/50 shadow-xl flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">{githubData.name || githubData.username}</h2>
                    <a href={`https://github.com/${githubData.username}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">@{githubData.username}</p>
                  {githubData.bio && <p className="text-slate-300 text-sm mt-1">{githubData.bio}</p>}
                </div>
                <div className="flex items-center gap-4 text-center">
                  <div className="bg-white/10 rounded-2xl px-6 py-4">
                    <div className="text-4xl font-bold text-[#6366F1]">{githubData.github_score}</div>
                    <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">GitHub Score</div>
                  </div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Repositories', value: githubData.public_repos, icon: GitBranch, color: '#6366F1' },
                  { label: 'Total Stars', value: githubData.total_stars, icon: Star, color: '#F59E0B' },
                  { label: 'Followers', value: githubData.followers, icon: Users, color: '#10B981' },
                  { label: 'Active Repos', value: githubData.active_repos, icon: Activity, color: '#3B82F6' },
                ].map((m, i) => (
                  <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                    <m.icon size={22} style={{ color: m.color }} className="mx-auto mb-2" />
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{m.value}</div>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Charts Row */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <Globe size={16} className="text-[#6366F1]" /> Language Distribution
                  </h3>
                  {langChartData.length > 0 ? (
                    <div className="flex items-center gap-4">
                      <ResponsiveContainer width={180} height={180}>
                        <PieChart>
                          <Pie data={langChartData} cx={85} cy={85} innerRadius={50} outerRadius={80} dataKey="value" paddingAngle={3}>
                            {langChartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                          </Pie>
                          <Tooltip formatter={(v, n) => [n, '']} />
                        </PieChart>
                      </ResponsiveContainer>
                      <div className="space-y-2 flex-1">
                        {langChartData.map((l, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                            <span className="text-sm text-slate-700 dark:text-slate-300 font-medium">{l.name}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-slate-400 text-sm text-center py-8">No language data available.</p>
                  )}
                </div>

                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                    <Activity size={16} className="text-[#10B981]" /> Repository Activity
                  </h3>
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={repoActivityData} barSize={24}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                      <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <YAxis tick={{ fontSize: 12, fill: '#6B7280' }} />
                      <Tooltip contentStyle={{ background: '#111827', border: '1px solid #374151', borderRadius: 12, color: '#fff' }} />
                      <Bar dataKey="repos" fill="#6366F1" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* AI Insights */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { title: 'Strengths', items: githubData.analysis?.strengths || [], icon: CheckCircle2, color: '#10B981', bg: 'bg-green-50 dark:bg-green-900/10', border: 'border-green-100 dark:border-green-900/20', prefix: '✓' },
                  { title: 'Weaknesses', items: githubData.analysis?.weaknesses || [], icon: AlertCircle, color: '#F59E0B', bg: 'bg-amber-50 dark:bg-amber-900/10', border: 'border-amber-100 dark:border-amber-900/20', prefix: '⚠' },
                  { title: 'Recommendations', items: githubData.analysis?.recommendations || [], icon: Zap, color: '#6366F1', bg: 'bg-[#6366F1]/5 dark:bg-[#6366F1]/10', border: 'border-[#6366F1]/20', prefix: '→' },
                ].map((section, i) => (
                  <div key={i} className={`${section.bg} ${section.border} border rounded-2xl p-5`}>
                    <h4 className="font-bold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                      <section.icon size={16} style={{ color: section.color }} /> {section.title}
                    </h4>
                    <div className="space-y-2">
                      {section.items.length > 0 ? section.items.map((item, j) => (
                        <p key={j} className="text-sm text-slate-600 dark:text-slate-400 flex items-start gap-1.5 font-medium">
                          <span className="font-bold flex-shrink-0" style={{ color: section.color }}>{section.prefix}</span> {item}
                        </p>
                      )) : <p className="text-sm text-slate-400 italic">None detected.</p>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {!loadingGithub && !githubData && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-[#6366F1]/10 flex items-center justify-center mb-6">
                <GitBranch size={36} className="text-[#6366F1]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No GitHub Profile Linked</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-sm">Connect your GitHub profile above to unlock repository metrics, stars overview, languages distribution, and personalized AI recommendations.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 2: LeetCode Analytics */}
      {activeTab === 'leetcode' && (
        <div className="space-y-6">
          {/* Analyze Input */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Code2 size={18} className="text-[#EC4899]" /> Connect LeetCode Profile
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">leetcode.com/</span>
                <input
                  type="text"
                  value={leetcodeUsername}
                  onChange={e => setLeetcodeUsername(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && analyzeLeetcode()}
                  placeholder="your-username"
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-28 pr-4 text-sm font-mono text-slate-900 dark:text-white outline-none focus:border-[#EC4899] focus:ring-1 focus:ring-[#EC4899] transition"
                />
              </div>
              <button
                onClick={analyzeLeetcode}
                disabled={loadingLeetcode}
                className="bg-[#EC4899] hover:bg-[#D946EF] text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-colors disabled:opacity-70 shadow-md shadow-[#EC4899]/20"
              >
                {loadingLeetcode ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                ) : (
                  <><BrainCircuit size={16} /> Analyze LeetCode</>
                )}
              </button>
            </div>
            {leetcodeError && (
              <div className="mt-3 flex items-center gap-2 text-sm text-red-500 bg-red-50 dark:bg-red-900/20 px-4 py-2.5 rounded-xl border border-red-100 dark:border-red-900/30">
                <AlertCircle size={16} /> {leetcodeError}
              </div>
            )}
          </div>

          {loadingLeetcode && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="relative w-20 h-20 mb-6">
                <div className="absolute inset-0 border-4 border-[#EC4899] border-t-transparent rounded-full animate-spin" />
                <Code2 size={28} className="absolute inset-0 m-auto text-[#EC4899]" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Analyzing LeetCode Profile...</h3>
              <p className="text-sm text-slate-500 mt-2">Fetching problems solved counts, contest rating, and global ranking.</p>
            </div>
          )}

          {!loadingLeetcode && leetcodeData && (
            <>
              {/* Profile Header */}
              <div className="bg-gradient-to-r from-[#2a1a2e] to-[#0f0b19] rounded-2xl p-6 text-white flex flex-wrap items-center gap-6">
                <div className="w-20 h-20 rounded-full bg-[#EC4899]/15 border-4 border-[#EC4899]/40 shadow-xl flex items-center justify-center text-3xl font-bold flex-shrink-0">
                  🏆
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold">@{leetcodeData.username}</h2>
                    <a href={`https://leetcode.com/${leetcodeData.username}`} target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors">
                      <ExternalLink size={16} />
                    </a>
                  </div>
                  <p className="text-slate-400 text-sm mt-0.5">Ranking: #{leetcodeData.ranking?.toLocaleString() || 'N/A'}</p>
                </div>
                <div className="bg-white/10 rounded-2xl px-6 py-4 text-center">
                  <div className="text-4xl font-bold text-[#EC4899]">{leetcodeData.leetcode_score}</div>
                  <div className="text-xs text-slate-400 mt-1 uppercase tracking-wide">LeetCode Score</div>
                </div>
              </div>

              {/* Key Metrics */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Problems Solved', value: leetcodeData.total_solved, icon: Code2, color: '#EC4899' },
                  { label: 'Contest Rating', value: leetcodeData.contest_rating || 'Unrated', icon: Flame, color: '#F59E0B' },
                  { label: 'Global Ranking', value: leetcodeData.ranking ? `#${leetcodeData.ranking.toLocaleString()}` : '--', icon: Star, color: '#3B82F6' },
                  { label: 'Contest Rank', value: leetcodeData.contest_ranking ? `#${leetcodeData.contest_ranking.toLocaleString()}` : '--', icon: Activity, color: '#10B981' },
                ].map((m, i) => (
                  <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
                    <m.icon size={22} style={{ color: m.color }} className="mx-auto mb-2" />
                    <div className="text-3xl font-bold text-slate-900 dark:text-white">{m.value}</div>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-medium">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Difficulty Breakdown Progress Bars */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm lg:col-span-2 space-y-5">
                  <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Award size={18} className="text-[#EC4899]" /> Difficulty Breakdown
                  </h3>
                  
                  <div className="space-y-4 pt-2">
                    {[
                      { name: 'Easy Solved', count: leetcodeData.easy_solved, color: '#10B981', total: 800, text: 'text-[#10B981]' },
                      { name: 'Medium Solved', count: leetcodeData.medium_solved, color: '#F59E0B', total: 1600, text: 'text-[#F59E0B]' },
                      { name: 'Hard Solved', count: leetcodeData.hard_solved, color: '#EF4444', total: 900, text: 'text-[#EF4444]' }
                    ].map((diff, i) => {
                      const percent = Math.round((diff.count / diff.total) * 100);
                      return (
                        <div key={i} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="font-semibold text-slate-700 dark:text-slate-300">{diff.name}</span>
                            <span className="text-slate-500 font-medium">
                              <span className={diff.text}>{diff.count}</span> / {diff.total} ({percent}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-800 h-3 rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${percent}%`, backgroundColor: diff.color }}></div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Acceptance Rate / Summary */}
                <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col justify-center items-center text-center">
                  <ResponsiveContainer width={150} height={150}>
                    <PieChart>
                      <Pie data={leetcodeChartData} cx={70} cy={70} innerRadius={40} outerRadius={60} dataKey="value">
                        {leetcodeChartData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <h4 className="font-bold text-slate-900 dark:text-white mt-4">Solved Distribution</h4>
                  <p className="text-xs text-slate-500 mt-1">Difficulty breakdown visualization of solved problems.</p>
                </div>
              </div>
            </>
          )}

          {!loadingLeetcode && !leetcodeData && (
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-16 flex flex-col items-center justify-center text-center shadow-sm">
              <div className="w-20 h-20 rounded-2xl bg-[#EC4899]/10 flex items-center justify-center mb-6">
                <Code2 size={36} className="text-[#EC4899]" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No LeetCode Profile Linked</h3>
              <p className="text-slate-500 text-sm mt-2 max-w-sm">Connect your LeetCode username above to fetch problem-solving counts, contest ratings, and unlock consistency algorithms.</p>
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Professional Hub (LinkedIn & Portfolio) */}
      {activeTab === 'professional' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Connection Forms */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                <Linkedin size={18} className="text-[#0077B5]" /> Connect Professional Links
              </h3>
              
              <form onSubmit={saveProfessionalLinks} className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">LinkedIn Profile URL</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono"><Linkedin size={16} /></span>
                    <input
                      type="url"
                      value={linkedinUrl}
                      onChange={e => setLinkedinUrl(e.target.value)}
                      placeholder="https://linkedin.com/in/username"
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-[#0077B5] focus:ring-1 focus:ring-[#0077B5] transition"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">Personal Portfolio URL</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono"><Globe size={16} /></span>
                    <input
                      type="url"
                      value={portfolioUrl}
                      onChange={e => setPortfolioUrl(e.target.value)}
                      placeholder="https://myportfolio.dev"
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-12 pr-4 text-sm text-slate-900 dark:text-white outline-none focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loadingProfessional}
                  className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors w-full shadow-md disabled:opacity-75"
                >
                  {loadingProfessional ? 'Saving Links...' : 'Save Connections'}
                </button>
              </form>
            </div>

            {/* Profile Summary Card */}
            {(profile?.linkedin_url || profile?.portfolio_url) && (
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
                <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                  <Sparkles size={18} className="text-[#F59E0B]" /> Connected Hub Details
                </h3>
                
                <div className="space-y-4">
                  {profile.linkedin_url && (
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-[#0077B5]/10 flex items-center justify-center text-[#0077B5]">
                        <Linkedin size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">LinkedIn Profile</h4>
                          <span className="text-[10px] bg-green-500/10 text-green-500 px-2 py-0.5 rounded-full font-bold">Verified</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-sm">{profile.linkedin_url}</p>
                        <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#0077B5] hover:underline font-bold mt-2">
                          Visit LinkedIn Profile <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}

                  {profile.portfolio_url && (
                    <div className="flex items-start gap-4 p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
                      <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center text-[#6366F1]">
                        <Globe size={20} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 dark:text-white text-sm">Portfolio Website</h4>
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-500 px-2 py-0.5 rounded-full font-bold">Live</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 truncate max-w-sm">{profile.portfolio_url}</p>
                        <a href={profile.portfolio_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-[#6366F1] hover:underline font-bold mt-2">
                          Visit Portfolio Website <ExternalLink size={12} />
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Profile Completion Engine */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4">
                Profile Completion Engine
              </h3>
              
              <div className="flex flex-col items-center justify-center text-center mb-6">
                <div className="relative w-32 h-32 rounded-full border-[6px] border-slate-100 dark:border-slate-800 flex items-center justify-center mb-4">
                  <span className="text-3xl font-bold text-slate-900 dark:text-white">{completionPercent}%</span>
                  <div 
                    className="absolute inset-0 rounded-full border-[6px] border-[#6366F1] transition-all"
                    style={{ clipPath: `polygon(0 0, 100% 0, 100% ${completionPercent}%, 0 100%)` }}
                  ></div>
                </div>
                <h4 className="font-bold text-sm text-slate-800 dark:text-white">Developer Status</h4>
                <p className="text-xs text-slate-500 mt-1">Verify all hubs to unlock 100% score potential.</p>
              </div>

              <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                {checklist.map((item, i) => (
                  <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-800 text-xs">
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{item.label}</span>
                    <span className={`px-2 py-0.5 rounded-full font-bold ${item.done ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-600 dark:bg-red-900/20 dark:text-red-400'}`}>
                      {item.done ? 'Complete' : 'Missing'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
