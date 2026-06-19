import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  UploadCloud, CheckCircle2, ChevronRight, ChevronLeft,
  Briefcase, Sparkles, GraduationCap, Code, BrainCircuit,
  Target, Plus
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import MultiSelectDropdown from "../components/MultiSelectDropdown";
import { CAREER_GOALS } from "../constants/skills";
import { supabase } from "../supabaseClient";
import { useAppStore } from "../store/app-store";
import {
  calculateCareerMatches,
  calculateNextStepScore,
  logActivity,
  addNotification
} from "../utils/score-engine";

const BACKEND_URL = import.meta.env.VITE_API_URL || '';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  // Zustand setters
  const setUploadedResume = useAppStore((state) => state.setUploadedResume);
  const setResumeAnalysis = useAppStore((state) => state.setResumeAnalysis);
  const setGithubData = useAppStore((state) => state.setGithubData);
  const setLeetcodeData = useAppStore((state) => state.setLeetcodeData);

  const [formData, setFormData] = useState({
    fullName: "",
    college: "",
    branch: "",
    year: "1st Year",
    cgpa: "",
    careerGoal: "Software Engineer",
    github: "",
    leetcode: "",
    projects: [],
    skills: [],
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectTech, setNewProjectTech] = useState([]);
  const [newProjectDesc, setNewProjectDesc] = useState("");
  const [saving, setSaving] = useState(false);

  const nextStep = () => setStep((s) => Math.min(s + 1, 6));
  const prevStep = () => setStep((s) => Math.max(s - 1, 1));

  const handleChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  // STEP 1: Resume Upload
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;

    setIsAnalyzing(true);
    setUploadedResume({ name: file.name, size: file.size });

    try {
      const payload = new FormData();
      payload.append('file', file);

      // Call FastAPI backend analysis
      const res = await fetch(`${BACKEND_URL}/api/analyze?student_id=${user.id}`, {
        method: 'POST',
        body: payload,
      });

      if (res.ok) {
        const data = await res.json();
        setResumeAnalysis(data);
        
        // Populate profile with extracted skills & defaults
        const extractedSkills = data.skills || data.keywords || [];
        setFormData((prev) => ({
          ...prev,
          skills: extractedSkills.length > 0 ? extractedSkills : prev.skills,
        }));
        
        // Non-blocking upload to Supabase storage
        supabase.storage
          .from('resumes')
          .upload(`${user.id}/${file.name}`, file, { cacheControl: '3600', upsert: true })
          .catch((err) => console.warn('Storage upload warning:', err.message));

        await logActivity(user.id, 'resume', `Resume uploaded and analyzed: ${file.name}`);
        await addNotification(user.id, '📄 Resume Uploaded', `Extracted ${extractedSkills.length} skills. Resume Score: ${data.resume_score}/100.`);
      } else {
        // Fallback analysis values
        const fallbackData = {
          resume_score: 55,
          ats_score: 50,
          skills: ['Python', 'JavaScript', 'SQL'],
          improvements: ['Add quantitative accomplishments', 'Integrate portfolio link']
        };
        setResumeAnalysis(fallbackData);
        setFormData((prev) => ({
          ...prev,
          skills: fallbackData.skills,
        }));
      }
    } catch (err) {
      console.warn('Resume analysis fetch failed:', err);
    } finally {
      setIsAnalyzing(false);
      nextStep();
    }
  };

  // STEP 6: Profile Generation
  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // 1. Create or Update Profile
      const { data: existing } = await supabase
        .from("profiles")
        .select("id")
        .eq("user_id", user.id)
        .single();

      const profilePayload = {
        full_name: formData.fullName || user.user_metadata?.full_name || '',
        college: formData.college,
        branch: formData.branch,
        year: formData.year,
        cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
        career_goal: formData.careerGoal,
        github_username: formData.github,
        leetcode_username: formData.leetcode,
        skills: formData.skills,
        onboarding_completed: true,
      };

      let error;
      if (existing) {
        const { error: updateErr } = await supabase
          .from("profiles")
          .update(profilePayload)
          .eq("user_id", user.id);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase
          .from("profiles")
          .insert([{ ...profilePayload, user_id: user.id, email: user.email }]);
        error = insertErr;
      }
      if (error) throw error;

      // 2. Clear old projects and Insert onboarding projects
      await supabase.from('projects').delete().eq('user_id', user.id);
      if (formData.projects && formData.projects.length > 0) {
        const projectsRows = formData.projects.map(proj => ({
          user_id: user.id,
          title: proj.name,
          description: proj.description || 'Onboarding project',
          tech_stack: proj.tech || [],
          status: 'Completed'
        }));
        await supabase.from('projects').insert(projectsRows);
      }

      // 3. GitHub analysis in background
      let finalGithubStats = null;
      if (formData.github.trim()) {
        try {
          const ghRes = await fetch(`${BACKEND_URL}/api/github/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, github_username: formData.github.trim() })
          });
          if (ghRes.ok) {
            const data = await ghRes.json();
            finalGithubStats = {
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
            await supabase.from('github_stats').upsert(finalGithubStats, { onConflict: 'user_id' });
            setGithubData(finalGithubStats);
            await logActivity(user.id, 'github', `GitHub connected: @${data.username}`);
          }
        } catch (e) {
          console.warn('Onboarding GitHub analysis error:', e);
        }
      }

      // 4. LeetCode analysis in background
      let finalLeetcodeStats = null;
      if (formData.leetcode.trim()) {
        try {
          const lcRes = await fetch(`${BACKEND_URL}/api/leetcode/analyze`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ user_id: user.id, leetcode_username: formData.leetcode.trim() })
          });
          if (lcRes.ok) {
            const data = await lcRes.json();
            finalLeetcodeStats = {
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
            await supabase.from('leetcode_stats').upsert(finalLeetcodeStats, { onConflict: 'user_id' });
            setLeetcodeData(finalLeetcodeStats);
            await logActivity(user.id, 'leetcode', `LeetCode connected: @${data.username}`);
          }
        } catch (e) {
          console.warn('Onboarding LeetCode analysis error:', e);
        }
      }

      // 5. Trigger Centralized Score & Match Engine
      const profileData = { ...profilePayload, user_id: user.id };
      await calculateCareerMatches(user.id, formData.skills);
      await calculateNextStepScore(user.id, profileData, finalGithubStats, finalLeetcodeStats, formData.projects);

      await logActivity(user.id, 'system', 'Onboarding completed successfully');
      await addNotification(user.id, '🎉 Onboarding Complete!', 'Welcome to NextStep AI. Your profile indices are fully synced.');

      await refreshProfile();
      navigate("/dashboard");
    } catch (err) {
      console.error("Error saving profile:", err);
      alert(`Error saving profile: ${err.message}. Please try again.`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans flex flex-col transition-colors duration-300">
      
      {/* Header */}
      <header className="h-20 px-8 flex items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0B0F19]">
        <div className="flex items-center gap-2">
          <div className="bg-[#6366F1]/10 dark:bg-[#6366F1]/20 p-2 rounded-xl">
            <Target size={24} className="text-[#8B5CF6]" />
          </div>
          <span className="text-xl font-bold tracking-tight">NextStep AI</span>
        </div>
        <div className="text-sm font-medium text-slate-500">
          Step {step} of 6
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 relative overflow-hidden transition-all duration-500">
          
          {/* Progress Indicator */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
            <div
              className="h-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-500"
              style={{ width: `${(step / 6) * 100}%` }}
            ></div>
          </div>

          {/* STEP 1: RESUME UPLOAD (AI POWERED CENTRAL ENTRY) */}
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center">
                  <UploadCloud className="text-[#8B5CF6]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Upload Resume</h2>
                  <p className="text-sm text-slate-500">
                    Upload your resume PDF. NextStep AI will extract your skills and autofill your profile.
                  </p>
                </div>
              </div>

              {!isAnalyzing ? (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-all">
                    <UploadCloud size={48} className="text-slate-400 mb-4" />
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      Click to upload or drag & drop
                    </h3>
                    <p className="text-sm text-slate-500 mt-2">PDF (Max 5MB)</p>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                      id="resume-upload"
                    />
                    <label
                      htmlFor="resume-upload"
                      className="mt-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors shadow-md shadow-[#6366F1]/10"
                    >
                      Select File
                    </label>
                  </div>
                  <button
                    onClick={nextStep}
                    className="w-full text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 py-2 transition-colors font-semibold"
                  >
                    Skip for now, input manually →
                  </button>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#0B0F19]">
                  <div className="relative w-20 h-20 mb-6">
                    <div className="absolute inset-0 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                    <Sparkles
                      className="absolute inset-0 m-auto text-[#8B5CF6] animate-pulse"
                      size={24}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Extracting Skills using AI...
                  </h3>
                  <p className="text-sm text-slate-500 mt-2">
                    Reading education, projects, and tech stack.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: BASIC & ACADEMIC DETAILS */}
          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center">
                  <GraduationCap className="text-[#10B981]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Academic Details</h2>
                  <p className="text-sm text-slate-500">
                    Verify or enter your educational details.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Full Name
                  </label>
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    College / University
                  </label>
                  <input
                    type="text"
                    name="college"
                    value={formData.college}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none"
                    placeholder="e.g. Stanford University"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      Branch / Major
                    </label>
                    <input
                      type="text"
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                      CGPA / GPA
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      name="cgpa"
                      value={formData.cgpa}
                      onChange={handleChange}
                      className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none"
                      placeholder="e.g. 9.2"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    Year of Study
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none"
                  >
                    <option>1st Year</option>
                    <option>2nd Year</option>
                    <option>3rd Year</option>
                    <option>4th Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: CAREER GOAL */}
          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center">
                  <Briefcase className="text-[#3B82F6]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Career Goal</h2>
                  <p className="text-sm text-slate-500">
                    What is your target professional career path?
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                {CAREER_GOALS.map((goal) => (
                  <div
                    key={goal}
                    onClick={() =>
                      setFormData({ ...formData, careerGoal: goal })
                    }
                    className={`p-3.5 rounded-xl border-2 cursor-pointer transition-all ${formData.careerGoal === goal ? "border-[#6366F1] bg-[#6366F1]/5" : "border-slate-200 dark:border-slate-850 hover:border-[#6366F1]/50"}`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`font-bold text-xs ${formData.careerGoal === goal ? "text-[#6366F1]" : "text-slate-700 dark:text-slate-300"}`}
                      >
                        {goal}
                      </span>
                      {formData.careerGoal === goal && (
                        <CheckCircle2 size={16} className="text-[#6366F1]" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* STEP 4: CODING PROFILES */}
          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center">
                  <Code className="text-[#F59E0B]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Coding Profiles</h2>
                  <p className="text-sm text-slate-500">
                    Link usernames to synchronise repositories and solved algorithm metrics.
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    GitHub Username
                  </label>
                  <input
                    type="text"
                    name="github"
                    value={formData.github}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none"
                    placeholder="e.g. octocat"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">
                    LeetCode Username
                  </label>
                  <input
                    type="text"
                    name="leetcode"
                    value={formData.leetcode}
                    onChange={handleChange}
                    className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none"
                    placeholder="e.g. leetcode_user"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: VERIFY SKILLS & PROJECTS (CRUD INTEGRATED) */}
          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-5">
                <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center">
                  <Target className="text-[#EF4444]" size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">Skills & Projects</h2>
                  <p className="text-sm text-slate-500">
                    Verify AI-extracted skills and catalog software projects.
                  </p>
                </div>
              </div>

              <div className="space-y-5 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                
                {/* Skills Verification */}
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111827]">
                  <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                    <Sparkles size={16} className="text-[#8B5CF6]" /> Skill Selection tag
                  </h3>
                  <MultiSelectDropdown
                    selected={formData.skills}
                    onChange={(skills) => setFormData({ ...formData, skills })}
                    placeholder="Search technical or soft skills..."
                  />
                </div>

                {/* Projects Manager */}
                <div className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-[#111827] space-y-4">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm">Added Projects ({formData.projects.length})</h3>
                  
                  {formData.projects.map((proj, idx) => (
                    <div key={idx} className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl flex justify-between items-start gap-4">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">{proj.name}</h4>
                        <p className="text-[10px] text-slate-400 mt-0.5">{proj.description}</p>
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          {proj.tech.map((t, i) => (
                            <span key={i} className="text-[8px] px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 rounded text-slate-500 font-bold">{t}</span>
                          ))}
                        </div>
                      </div>
                      <button
                        onClick={() => setFormData({
                          ...formData,
                          projects: formData.projects.filter((_, i) => i !== idx)
                        })}
                        className="text-[10px] text-red-500 font-bold hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  ))}

                  {/* Add New Project Inline Form */}
                  <div className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 p-3 rounded-xl space-y-3">
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">Add New Project</h4>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={e => setNewProjectName(e.target.value)}
                      placeholder="Project Title (e.g. E-Commerce Backend)"
                      className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-[#6366F1]"
                    />
                    <input
                      type="text"
                      value={newProjectDesc}
                      onChange={e => setNewProjectDesc(e.target.value)}
                      placeholder="Brief Description"
                      className="w-full bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-700 rounded-lg py-1.5 px-3 text-xs outline-none focus:border-[#6366F1]"
                    />
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-1">Technologies Used</label>
                      <MultiSelectDropdown
                        selected={newProjectTech}
                        onChange={setNewProjectTech}
                        placeholder="Select stack..."
                      />
                    </div>
                    <button
                      onClick={() => {
                        if (newProjectName.trim()) {
                          setFormData({
                            ...formData,
                            projects: [...formData.projects, {
                              name: newProjectName.trim(),
                              description: newProjectDesc.trim() || 'Software application',
                              tech: newProjectTech
                            }]
                          });
                          setNewProjectName("");
                          setNewProjectDesc("");
                          setNewProjectTech([]);
                        }
                      }}
                      className="w-full py-1.5 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Plus size={14} /> Catalog Project
                    </button>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* STEP 6: AI PROFILE SYNCHRONIZATION LOADING */}
          {step === 6 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-8">
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 mb-8 relative">
                <BrainCircuit size={40} className="text-white relative z-10 animate-bounce" />
                <div className="absolute inset-0 rounded-full border-4 border-[#8B5CF6] animate-ping opacity-20"></div>
              </div>

              <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">
                Syncing AI Intelligence...
              </h2>
              <p className="text-sm text-slate-500 max-w-md mx-auto">
                NextStep Score engine is linking your GitHub commits, LeetCode ratings, and ATS keywords to establish your index score.
              </p>

              <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-8 overflow-hidden">
                <div
                  className="h-full bg-[#8B5CF6] animate-[pulse_2s_ease-in-out_infinite]"
                  style={{ width: "100%" }}
                ></div>
              </div>
            </div>
          )}

          {/* Footer Controls */}
          {step < 6 && !isAnalyzing && (
            <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button
                onClick={prevStep}
                disabled={step === 1}
                className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-slate-700 dark:hover:text-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button
                onClick={nextStep}
                className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-sm"
              >
                {step === 5 ? "Generate Profile" : "Next Step"}{" "}
                <ChevronRight size={16} />
              </button>
            </div>
          )}

          {step === 6 && (
            <div className="mt-8 flex justify-center">
              <button
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 min-w-[200px]"
              >
                {saving ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  "Launch Dashboard"
                )}
              </button>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}
