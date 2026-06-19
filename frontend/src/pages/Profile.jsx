import React, { useState, useEffect } from 'react';
import { ShieldCheck, Mail, Edit3, Award, FileText, Code, LogOut, GraduationCap, Target, Plus, GitBranch, User, BookOpen, Briefcase, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import { CAREER_GOALS } from '../constants/skills';
import { useAppStore } from '../store/app-store';

const BACKEND_URL = import.meta.env.VITE_API_URL || '';

export default function Profile() {
  const { signOut, user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const setGithubData = useAppStore((state) => state.setGithubData);
  const [activeTab, setActiveTab] = useState('Overview');
  const [loadingGithub, setLoadingGithub] = useState(false);
  const [githubUser, setGithubUser] = useState(profile?.github_username || '');
  const [githubMsg, setGithubMsg] = useState({ type: '', text: '' });

  // Modals state
  const [showEditModal, setShowEditModal] = useState(false);
  const [showProjectModal, setShowProjectModal] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);

  // Edit forms state
  const [editForm, setEditForm] = useState({
    fullName: '',
    college: '',
    branch: '',
    year: '1st Year',
    cgpa: '',
    careerGoal: 'Software Engineer',
    leetcode: ''
  });

  const [newProject, setNewProject] = useState({ name: '', desc: '', tech: [] });
  const [newCert, setNewCert] = useState({ name: '', issuer: '', year: new Date().getFullYear().toString() });

  // Load profile details into form on open
  useEffect(() => {
    if (profile) {
      setEditForm({
        fullName: profile.full_name || '',
        college: profile.college || '',
        branch: profile.branch || '',
        year: profile.year || '1st Year',
        cgpa: profile.cgpa ? profile.cgpa.toString() : '',
        careerGoal: profile.career_goal || 'Software Engineer',
        leetcode: profile.leetcode_username || ''
      });
      setGithubUser(profile.github_username || '');
    }
  }, [profile]);

  const tabs = ['Overview', 'Skills & Projects', 'Certifications', 'Integrations', 'Resume'];

  const name = profile?.full_name || user?.email?.split('@')[0] || 'Student';
  const careerGoal = profile?.career_goal || 'Software Engineer';
  const college = profile?.college || 'Not Added';
  const branch = profile?.branch || 'Not Added';
  const year = profile?.year || 'Not Added';
  const cgpa = profile?.cgpa ? `${profile.cgpa} / 10` : 'Not Added';
  const github = profile?.github_username || '';
  const leetcode = profile?.leetcode_username || '';
  const email = profile?.email || user?.email || '';

  // Parse skills & projects from profile JSONB
  const [skills, setSkills] = useState([]);
  const [projects, setProjects] = useState([]);
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    if (profile) {
      // Parse skills — never show fake placeholders
      let parsedSkills = [];
      if (profile.skills && Array.isArray(profile.skills)) {
        parsedSkills = profile.skills;
      }
      setSkills(parsedSkills);

      // Parse projects
      let parsedProjects = [];
      if (profile.projects && Array.isArray(profile.projects)) {
        parsedProjects = profile.projects;
      }
      setProjects(parsedProjects);

      // Parse certifications
      let parsedCerts = [];
      if (profile.certifications && Array.isArray(profile.certifications)) {
        parsedCerts = profile.certifications;
      }
      setCerts(parsedCerts);
    }
  }, [profile]);


  const handleSkillsChange = async (newSkills) => {
    setSkills(newSkills);
    if (user) {
      const { supabase } = await import('../supabaseClient');
      await supabase.from('profiles').update({ skills: newSkills }).eq('user_id', user.id);
      await refreshProfile();
      // Recalculate career matches with updated skills
      try {
        const { calculateCareerMatches } = await import('../utils/score-engine');
        await calculateCareerMatches(user.id, newSkills);
      } catch (e) {
        console.warn('Career match recalculation warning:', e);
      }
    }
  };

  const handleEditProfileSave = async (e) => {
    e.preventDefault();
    if (user) {
      const { supabase } = await import('../supabaseClient');
      const { error } = await supabase.from('profiles').update({
        full_name: editForm.fullName,
        college: editForm.college,
        branch: editForm.branch,
        year: editForm.year,
        cgpa: editForm.cgpa ? parseFloat(editForm.cgpa) : null,
        career_goal: editForm.careerGoal,
        leetcode_username: editForm.leetcode
      }).eq('user_id', user.id);

      if (!error) {
        await refreshProfile();
        setShowEditModal(false);
      } else {
        alert("Error saving profile: " + error.message);
      }
    }
  };

  const handleAddProjectSave = async (e) => {
    e.preventDefault();
    if (!newProject.name.trim()) return;
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    if (user) {
      const { supabase } = await import('../supabaseClient');
      await supabase.from('profiles').update({ projects: updatedProjects }).eq('user_id', user.id);
      await refreshProfile();
    }
    setNewProject({ name: '', desc: '', tech: [] });
    setShowProjectModal(false);
  };

  const handleAddCertSave = async (e) => {
    e.preventDefault();
    if (!newCert.name.trim()) return;
    const updatedCerts = [...certs, newCert];
    setCerts(updatedCerts);
    if (user) {
      const { supabase } = await import('../supabaseClient');
      await supabase.from('profiles').update({ certifications: updatedCerts }).eq('user_id', user.id);
      await refreshProfile();
    }
    setNewCert({ name: '', issuer: '', year: new Date().getFullYear().toString() });
    setShowCertModal(false);
  };


  const handleConnectGithub = async () => {
    if (!githubUser.trim()) return;
    setLoadingGithub(true);
    setGithubMsg({ type: '', text: '' });
    try {
      const res = await fetch(`${BACKEND_URL}/api/github/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user?.id || 'anon', github_username: githubUser.trim() })
      });
      if (!res.ok) throw new Error('Unable to fetch GitHub data.');
      
      const data = await res.json();
      const mappedData = {
        ...data,
        languages: data.top_languages
      };
      setGithubData(mappedData);

      // Update profile in supabase
      if (user) {
        const { supabase } = await import('../supabaseClient');
        await supabase.from('github_stats').upsert({
          user_id: user.id, username: data.username, github_score: data.github_score,
          followers: data.followers, following: data.following, public_repos: data.public_repos,
          total_stars: data.total_stars, total_forks: data.total_forks, languages: data.top_languages,
          analysis: data.analysis, avatar_url: data.avatar_url, bio: data.bio,
          active_repos: data.active_repos, updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        await supabase.from('profiles').update({ github_username: githubUser.trim() }).eq('user_id', user.id);
      }
      setGithubMsg({ type: 'success', text: 'GitHub profile connected and analyzed successfully!' });
    } catch (e) {
      setGithubMsg({ type: 'error', text: e.message || 'Error connecting GitHub.' });
    } finally {
      setLoadingGithub(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Profile Card */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex-shrink-0 flex items-center justify-center text-white text-3xl font-bold border-4 border-white dark:border-[#0B0F19] shadow-md">
            {name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{name}</h1>
                  <ShieldCheck className="text-blue-500" size={20} />
                </div>
                <p className="text-slate-500 dark:text-slate-400 mt-0.5">{careerGoal} · {college}</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <button 
                  onClick={() => setShowEditModal(true)}
                  className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
                >
                  <Edit3 size={16} /> Edit Profile
                </button>
                <button onClick={signOut} className="bg-rose-50 dark:bg-rose-500/10 hover:bg-rose-100 dark:hover:bg-rose-500/20 text-rose-500 dark:text-rose-400 px-4 py-2 rounded-xl font-medium text-sm transition-colors flex items-center gap-2">
                  <LogOut size={16} /> Logout
                </button>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-2"><Mail size={15} className="text-slate-400" /> {email}</div>
              <div className="flex items-center gap-2"><GraduationCap size={15} className="text-slate-400" /> {college} · {branch}</div>
              <div className="flex items-center gap-2"><BookOpen size={15} className="text-slate-400" /> Year: {year} · CGPA: {cgpa}</div>
              <div className="flex items-center gap-2"><Target size={15} className="text-slate-400" /> Goal: {careerGoal}</div>
              {github && <div className="flex items-center gap-2"><GitBranch size={15} className="text-slate-400" /> github.com/{github}</div>}
              {leetcode && <div className="flex items-center gap-2"><Code size={15} className="text-slate-400" /> leetcode.com/u/{leetcode}</div>}
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Projects', value: projects.length, icon: Briefcase, color: '#6366F1' },
          { label: 'Skills', value: skills.length, icon: Code, color: '#10B981' },
          { label: 'Certifications', value: certs.length, icon: Award, color: '#F59E0B' },
          { label: 'CGPA', value: profile?.cgpa || '--', icon: GraduationCap, color: '#8B5CF6' },
        ].map((s, i) => (
          <div key={i} className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm text-center">
            <s.icon size={22} style={{ color: s.color }} className="mx-auto mb-2" />
            <div className="text-2xl font-bold text-slate-900 dark:text-white">{s.value}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium uppercase tracking-wider">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-colors duration-300">
        <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-shrink-0 px-6 py-4 text-sm font-medium transition-all ${activeTab === tab ? 'text-[#6366F1] border-b-2 border-[#6366F1]' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'Overview' && (
            <div className="space-y-4">
              <h3 className="font-bold text-slate-900 dark:text-white">About</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                A passionate {year} student at {college} pursuing {branch}, aiming to become a {careerGoal}. Building real-world projects and continuously improving technical skills.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">College</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{college}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Branch</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{branch}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Year</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{year}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CGPA</p>
                  <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{cgpa}</p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Skills & Projects' && (
            <div className="space-y-6">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Technical Skills</h3>
                <MultiSelectDropdown
                  selected={skills}
                  onChange={handleSkillsChange}
                  placeholder="Search and add technical skills..."
                />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white mb-3">Projects</h3>
                <div className="space-y-3">
                  {projects.map((p, i) => (
                    <div key={i} className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-800">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 dark:text-white">{p.name}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">{p.desc}</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {p.tech?.map((t, j) => <span key={j} className="px-2 py-0.5 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-600 dark:text-slate-400 rounded-md">{t}</span>)}
                      </div>
                    </div>
                  ))}
                  <button 
                    onClick={() => setShowProjectModal(true)}
                    className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-sm text-slate-500 hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
                  >
                    <Plus size={16} /> Add New Project
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'Certifications' && (
            <div className="space-y-3">
              {certs.map((c, i) => (
                <div key={i} className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/20 flex items-center justify-center flex-shrink-0">
                    <Award size={20} className="text-amber-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 dark:text-white text-sm">{c.name}</h4>
                    <p className="text-xs text-slate-500">{c.issuer} · {c.year}</p>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => setShowCertModal(true)}
                className="w-full p-4 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl flex items-center justify-center gap-2 text-sm text-slate-500 hover:border-[#6366F1] hover:text-[#6366F1] transition-colors"
              >
                <Plus size={16} /> Add Certification
              </button>
            </div>
          )}

          {activeTab === 'Integrations' && (
            <div className="space-y-6">
              <div className="p-6 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl">
                <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-2">
                  <GitBranch size={18} className="text-[#6366F1]" /> Connect GitHub
                </h3>
                <p className="text-sm text-slate-500 mb-5">Link your GitHub account to enable AI code analysis and improve your placement score.</p>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm font-mono">github.com/</span>
                    <input
                      type="text"
                      value={githubUser}
                      onChange={(e) => setGithubUser(e.target.value)}
                      placeholder="username"
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 pl-28 pr-4 text-sm font-mono focus:border-[#6366F1] focus:ring-1 focus:ring-[#6366F1] outline-none transition"
                    />
                  </div>
                  <button
                    onClick={handleConnectGithub}
                    disabled={loadingGithub}
                    className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {loadingGithub ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <GitBranch size={16} />}
                    {loadingGithub ? 'Analyzing...' : 'Analyze GitHub'}
                  </button>
                </div>

                {githubMsg.text && (
                  <div className={`mt-4 p-3 rounded-xl text-sm font-medium flex items-center gap-2 ${githubMsg.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                    {githubMsg.type === 'success' ? <ShieldCheck size={16} /> : <Target size={16} />}
                    {githubMsg.text}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'Resume' && (
            <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
              <div className="w-16 h-16 bg-[#6366F1]/10 rounded-2xl flex items-center justify-center">
                <FileText size={28} className="text-[#6366F1]" />
              </div>
              <h3 className="font-bold text-slate-900 dark:text-white">Upload / Update Resume</h3>
              <p className="text-sm text-slate-500 max-w-xs">Upload your resume to let AI analyze your skills and improve your placement score.</p>
              <button 
                onClick={() => navigate('/resume')}
                className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl font-medium text-sm transition-colors flex items-center gap-2"
              >
                <Plus size={16} /> Go to Resume Analyzer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Edit Profile Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <User size={20} className="text-[#6366F1]" /> Edit Details
              </h2>
              <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleEditProfileSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                <input 
                  type="text" required
                  value={editForm.fullName}
                  onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">College</label>
                <input 
                  type="text" required
                  value={editForm.college}
                  onChange={(e) => setEditForm({ ...editForm, college: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Branch</label>
                  <input 
                    type="text" required
                    value={editForm.branch}
                    onChange={(e) => setEditForm({ ...editForm, branch: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">CGPA</label>
                  <input 
                    type="number" step="0.01" max="10" required
                    value={editForm.cgpa}
                    onChange={(e) => setEditForm({ ...editForm, cgpa: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year</label>
                  <select 
                    value={editForm.year}
                    onChange={(e) => setEditForm({ ...editForm, year: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Career Goal</label>
                  <select 
                    value={editForm.careerGoal}
                    onChange={(e) => setEditForm({ ...editForm, careerGoal: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                  >
                    {CAREER_GOALS.map((goal) => (
                      <option key={goal} value={goal}>{goal}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowEditModal(false)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2 rounded-xl text-sm font-medium">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Project Modal */}
      {showProjectModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={20} className="text-[#6366F1]" /> Add New Project
              </h2>
              <button onClick={() => setShowProjectModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddProjectSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Project Name</label>
                <input 
                  type="text" required placeholder="e.g. Chat Messenger"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Description</label>
                <input 
                  type="text" required placeholder="Briefly describe what this project does"
                  value={newProject.desc}
                  onChange={(e) => setNewProject({ ...newProject, desc: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Technologies</label>
                <MultiSelectDropdown 
                  selected={newProject.tech || []}
                  onChange={(tech) => setNewProject({ ...newProject, tech })}
                  placeholder="Select technologies used..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowProjectModal(false)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2 rounded-xl text-sm font-medium">Add Project</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Certification Modal */}
      {showCertModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Plus size={20} className="text-[#6366F1]" /> Add Certification
              </h2>
              <button onClick={() => setShowCertModal(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleAddCertSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Certification Name</label>
                <input 
                  type="text" required placeholder="e.g. AWS Certified DevOps Engineer"
                  value={newCert.name}
                  onChange={(e) => setNewCert({ ...newCert, name: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Issuer / Authority</label>
                <input 
                  type="text" required placeholder="e.g. Amazon Web Services"
                  value={newCert.issuer}
                  onChange={(e) => setNewCert({ ...newCert, issuer: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Year Obtained</label>
                <input 
                  type="text" required placeholder="e.g. 2024"
                  value={newCert.year}
                  onChange={(e) => setNewCert({ ...newCert, year: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2.5 px-4 text-sm outline-none dark:text-white"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button type="button" onClick={() => setShowCertModal(false)} className="bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 px-4 py-2 rounded-xl text-sm font-medium">Cancel</button>
                <button type="submit" className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2 rounded-xl text-sm font-medium">Add Certification</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
