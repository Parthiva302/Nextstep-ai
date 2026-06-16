import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, ChevronLeft, UploadCloud, Target, Briefcase, GraduationCap, Code, BrainCircuit, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';

export default function Onboarding() {
  const [step, setStep] = useState(1);
  const navigate = useNavigate();
  const { user, refreshProfile } = useAuth();

  const [formData, setFormData] = useState({
    college: '',
    branch: '',
    year: '1st Year',
    cgpa: '',
    careerGoal: 'Software Engineer',
    github: '',
    leetcode: '',
    projects: []
  });

  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saving, setSaving] = useState(false);

  const nextStep = () => setStep(s => Math.min(s + 1, 6));
  const prevStep = () => setStep(s => Math.max(s - 1, 1));

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !user) return;
    
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.storage
        .from('resumes')
        .upload(`${user.id}/${file.name}`, file, {
          cacheControl: '3600',
          upsert: true
        });
      
      if (error) throw error;
      
      // Simulate AI extraction delay
      setTimeout(() => {
        setIsAnalyzing(false);
        nextStep();
      }, 2500);
    } catch (err) {
      console.error("Upload error:", err.message);
      setIsAnalyzing(false);
    }
  };

  const handleFinish = async () => {
    if (!user) return;
    setSaving(true);
    try {
      // First check if profile exists
      const { data: existing } = await supabase.from('profiles').select('id').eq('user_id', user.id).single();
      
      const payload = {
          college: formData.college,
          branch: formData.branch,
          year: formData.year,
          cgpa: formData.cgpa ? parseFloat(formData.cgpa) : null,
          career_goal: formData.careerGoal,
          github_username: formData.github,
          leetcode_username: formData.leetcode,
          onboarding_completed: true
      };

      let error;
      if (existing) {
        const { error: updateErr } = await supabase.from('profiles').update(payload).eq('user_id', user.id);
        error = updateErr;
      } else {
        const { error: insertErr } = await supabase.from('profiles').insert([{ ...payload, user_id: user.id, email: user.email }]);
        error = insertErr;
      }
        
      if (error) throw error;
      
      await refreshProfile();
      navigate('/dashboard');
    } catch (err) {
      console.error("Error saving profile:", err);
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
        <div className="text-sm font-medium text-slate-500">Step {step} of 6</div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl p-8 relative overflow-hidden transition-all duration-500">
          
          {/* Progress Bar */}
          <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100 dark:bg-slate-800">
            <div className="h-1.5 bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] transition-all duration-500" style={{ width: `${(step / 6) * 100}%` }}></div>
          </div>

          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-[#10B981]/10 flex items-center justify-center">
                    <GraduationCap className="text-[#10B981]" size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold">Basic Details</h2>
                   <p className="text-sm text-slate-500">Let's start with your academic information.</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Full Name</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none" placeholder="Enter your full name" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">College</label>
                  <input type="text" name="college" value={formData.college} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none" placeholder="University name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Branch</label>
                     <input type="text" name="branch" value={formData.branch} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none" placeholder="e.g. Computer Science" />
                   </div>
                   <div>
                     <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">CGPA</label>
                     <input type="number" step="0.1" name="cgpa" value={formData.cgpa} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none" placeholder="e.g. 8.5" />
                   </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">Year of Study</label>
                  <select name="year" value={formData.year} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none">
                     <option>1st Year</option>
                     <option>2nd Year</option>
                     <option>3rd Year</option>
                     <option>4th Year</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-[#3B82F6]/10 flex items-center justify-center">
                    <Briefcase className="text-[#3B82F6]" size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold">Career Goal</h2>
                   <p className="text-sm text-slate-500">What are you aiming for?</p>
                 </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 mt-8">
                 {['Software Engineer', 'AI Engineer', 'Data Analyst', 'Cyber Security', 'Cloud Engineer', 'DevOps'].map(goal => (
                   <div 
                     key={goal}
                     onClick={() => setFormData({...formData, careerGoal: goal})}
                     className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${formData.careerGoal === goal ? 'border-[#6366F1] bg-[#6366F1]/5' : 'border-slate-200 dark:border-slate-800 hover:border-[#6366F1]/50'}`}
                   >
                      <div className="flex items-center justify-between">
                         <span className={`font-bold ${formData.careerGoal === goal ? 'text-[#6366F1]' : 'text-slate-700 dark:text-slate-300'}`}>{goal}</span>
                         {formData.careerGoal === goal && <CheckCircle2 size={20} className="text-[#6366F1]" />}
                      </div>
                   </div>
                 ))}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-[#F59E0B]/10 flex items-center justify-center">
                    <Code className="text-[#F59E0B]" size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold">Coding Profiles</h2>
                   <p className="text-sm text-slate-500">Link your profiles for deep skill analysis.</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">GitHub Username</label>
                  <input type="text" name="github" value={formData.github} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none" placeholder="e.g. abhinav-dev" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">LeetCode Username</label>
                  <input type="text" name="leetcode" value={formData.leetcode} onChange={handleChange} className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none" placeholder="e.g. abhinav_lc" />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1 block">HackerRank Username (Optional)</label>
                  <input type="text" className="w-full bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] rounded-xl py-3 px-4 text-sm outline-none" placeholder="Username" />
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center">
                    <UploadCloud className="text-[#8B5CF6]" size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold">Resume Upload</h2>
                   <p className="text-sm text-slate-500">Upload your PDF resume for AI extraction.</p>
                 </div>
              </div>
              
              {!isAnalyzing ? (
                <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-3xl p-12 flex flex-col items-center justify-center text-center cursor-pointer hover:border-[#8B5CF6] hover:bg-[#8B5CF6]/5 transition-all">
                   <UploadCloud size={48} className="text-slate-400 mb-4" />
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">Click to upload or drag & drop</h3>
                   <p className="text-sm text-slate-500 mt-2">PDF (Max 5MB)</p>
                   <input type="file" accept="application/pdf" onChange={handleFileUpload} className="hidden" id="resume-upload" />
                   <label htmlFor="resume-upload" className="mt-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl font-medium text-sm cursor-pointer hover:opacity-90 transition-opacity">Select File</label>
                </div>
              ) : (
                <div className="border border-slate-200 dark:border-slate-800 rounded-3xl p-12 flex flex-col items-center justify-center text-center bg-slate-50 dark:bg-[#0B0F19]">
                   <div className="relative w-20 h-20 mb-6">
                      <div className="absolute inset-0 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                      <Sparkles className="absolute inset-0 m-auto text-[#8B5CF6] animate-pulse" size={24} />
                   </div>
                   <h3 className="text-lg font-bold text-slate-900 dark:text-white">Extracting Skills using AI...</h3>
                   <p className="text-sm text-slate-500 mt-2">Reading education, projects, and tech stack.</p>
                </div>
              )}
            </div>
          )}

          {step === 5 && (
            <div className="animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-2xl bg-[#EF4444]/10 flex items-center justify-center">
                    <Target className="text-[#EF4444]" size={24} />
                 </div>
                 <div>
                   <h2 className="text-2xl font-bold">Verify & Add Projects</h2>
                   <p className="text-sm text-slate-500">Add any recent projects to boost your score.</p>
                 </div>
              </div>
              
              <div className="space-y-4">
                 {formData.projects.map((proj, idx) => (
                    <div key={idx} className="p-4 border border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50 dark:bg-[#0B0F19] flex justify-between items-center">
                       <div>
                         <h4 className="font-bold text-slate-900 dark:text-white">{proj}</h4>
                       </div>
                       <button onClick={() => setFormData({...formData, projects: formData.projects.filter((_, i) => i !== idx)})} className="text-red-500 text-sm">Remove</button>
                    </div>
                 ))}

                 <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Project Name (e.g. E-Commerce App)" 
                      className="flex-1 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-4 text-sm outline-none dark:text-white"
                      id="new-project-input"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value.trim() !== '') {
                          setFormData({...formData, projects: [...formData.projects, e.target.value.trim()]});
                          e.target.value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById('new-project-input');
                        if (input.value.trim() !== '') {
                          setFormData({...formData, projects: [...formData.projects, input.value.trim()]});
                          input.value = '';
                        }
                      }}
                      className="px-4 py-2 bg-[#6366F1] text-white rounded-xl text-sm font-medium hover:bg-[#4F46E5]"
                    >
                      Add
                    </button>
                 </div>
              </div>
            </div>
          )}

          {step === 6 && (
            <div className="animate-in fade-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center py-8">
               <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center shadow-lg shadow-[#8B5CF6]/30 mb-8 relative">
                  <BrainCircuit size={40} className="text-white relative z-10" />
                  <div className="absolute inset-0 rounded-full border-4 border-[#8B5CF6] animate-ping opacity-20"></div>
               </div>
               
               <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-4">Generating Profile...</h2>
               <p className="text-sm text-slate-500 max-w-md mx-auto">
                 Our AI is calculating your NextStep Score, analyzing skill gaps, finding your career match, and generating your personalized roadmap.
               </p>

               <div className="w-full max-w-xs bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-8 overflow-hidden">
                  <div className="h-full bg-[#8B5CF6] animate-[pulse_2s_ease-in-out_infinite]" style={{ width: '100%' }}></div>
               </div>
            </div>
          )}

          {/* Footer Navigation */}
          {step < 6 && !isAnalyzing && (
            <div className="mt-10 flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-800">
              <button 
                onClick={prevStep} 
                disabled={step === 1}
                className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 dark:hover:text-white disabled:opacity-50 transition-colors"
              >
                <ChevronLeft size={16} /> Back
              </button>
              <button 
                onClick={nextStep}
                className="flex items-center gap-2 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm"
              >
                {step === 5 ? 'Generate Profile' : 'Next Step'} <ChevronRight size={16} />
              </button>
            </div>
          )}
          
          {step === 6 && (
            <div className="mt-10 flex justify-center">
              <button 
                onClick={handleFinish}
                disabled={saving}
                className="flex items-center justify-center gap-2 bg-[#10B981] hover:bg-[#059669] text-white px-8 py-3 rounded-xl text-sm font-bold transition-all shadow-[0_4px_14px_rgba(16,185,129,0.3)] hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 min-w-[200px]"
              >
                {saving ? (
                  <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                ) : (
                  "Go to Dashboard"
                )}
              </button>
            </div>
          )}

        </div>
      </main>

    </div>
  );
}
