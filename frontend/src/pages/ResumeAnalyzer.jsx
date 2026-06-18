import React, { useState } from 'react';
import axios from 'axios';
import { FileText, RefreshCw, UploadCloud, AlertCircle, CheckCircle2, ChevronRight, Briefcase, Award, Zap, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useAppStore } from '../store/app-store';
import MultiSelectDropdown from '../components/MultiSelectDropdown';
import { supabase } from '../supabaseClient';

const API_URL = `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api`;

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const uploadedResume = useAppStore((state) => state.uploadedResume);
  const resumeAnalysis = useAppStore((state) => state.resumeAnalysis);
  const setUploadedResume = useAppStore((state) => state.setUploadedResume);
  const setResumeAnalysis = useAppStore((state) => state.setResumeAnalysis);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSkillsChange = async (newSkills) => {
    const updatedAnalysis = { ...resumeAnalysis, skills: newSkills };
    setResumeAnalysis(updatedAnalysis);
    
    if (user) {
      try {
        await supabase
          .from('profiles')
          .update({ skills: newSkills })
          .eq('user_id', user.id);
      } catch (err) {
        console.warn("Failed to update profile skills:", err);
      }
    }
  };

  const handleKeywordsChange = (newKeywords) => {
    const updatedAnalysis = { ...resumeAnalysis, missing_keywords: newKeywords };
    setResumeAnalysis(updatedAnalysis);
  };

  const addKeywordToSkills = async (keyword) => {
    const currentSkills = resumeAnalysis?.skills || [];
    if (!currentSkills.includes(keyword)) {
      const newSkills = [...currentSkills, keyword];
      const newKeywords = (resumeAnalysis?.missing_keywords || []).filter(k => k !== keyword);
      
      const updatedAnalysis = { 
        ...resumeAnalysis, 
        skills: newSkills,
        missing_keywords: newKeywords
      };
      setResumeAnalysis(updatedAnalysis);
      
      if (user) {
        try {
          await supabase
            .from('profiles')
            .update({ skills: newSkills })
            .eq('user_id', user.id);
        } catch (err) {
          console.warn("Failed to update profile skills:", err);
        }
      }
    }
  };

  const analyzeResume = async (fileToAnalyze) => {
    if (!fileToAnalyze) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', fileToAnalyze);
    
    try {
      // Set the initial file metadata in store
      setUploadedResume({
        name: fileToAnalyze.name,
        size: fileToAnalyze.size,
        uploadDate: new Date().toLocaleDateString()
      });

      const res = await axios.post(`${API_URL}/analyze?student_id=${user?.id || 1}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResumeAnalysis(res.data);
    } catch (err) {
      console.error(err);
      const detail = err.response?.data?.detail;
      if (Array.isArray(detail)) {
        setError(detail.map(d => d.msg || JSON.stringify(d)).join('; '));
      } else if (typeof detail === 'string') {
        setError(detail);
      } else {
        setError("Failed to analyze resume. Please try again.");
      }
      // Clear file metadata if upload failed
      setUploadedResume(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">
      
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Resume Analyzer</h1>
          <p className="text-sm text-slate-500 mt-1">Upload your resume for AI-powered ATS scoring and feedback.</p>
        </div>
      </div>

      {!resumeAnalysis && !loading && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 flex flex-col items-center justify-center text-center transition-colors duration-300">
          <div className="w-16 h-16 rounded-full bg-[#6366F1]/10 flex items-center justify-center mb-4">
            <UploadCloud size={32} className="text-[#8B5CF6]" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Upload your Resume</h3>
          <p className="text-sm text-slate-500 mb-6 max-w-md">Upload a PDF of your resume to get instant feedback on ATS compatibility, missing keywords, and project recommendations.</p>
          
          <input 
            type="file" 
            accept=".pdf" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                analyzeResume(e.target.files[0]);
              }
            }} 
            className="hidden" 
            id="resume-upload" 
          />
          <label 
            htmlFor="resume-upload" 
            className="cursor-pointer bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            Select PDF File
          </label>
        </div>
      )}

      {loading && (
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mb-6"></div>
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI is analyzing your resume...</h3>
          <p className="text-sm text-slate-500 mt-2">Extracting skills, checking ATS formatting, and generating recommendations.</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="text-red-600 dark:text-red-400 mt-0.5" size={18} />
          <div>
            <h4 className="text-sm font-medium text-red-800 dark:text-red-300">Analysis Error</h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button onClick={() => setError(null)} className="mt-2 text-sm text-red-700 dark:text-red-300 underline font-medium">Try again</button>
          </div>
        </div>
      )}

      {resumeAnalysis && !loading && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column - Scores & Actions */}
          <div className="lg:col-span-1 space-y-6 flex flex-col">
            
            {/* File Info */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col sm:flex-row items-center justify-between shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-[#6366F1]/10 flex items-center justify-center flex-shrink-0">
                  <FileText size={20} className="text-[#8B5CF6]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{uploadedResume?.name || "resume.pdf"}</h4>
                  <p className="text-xs text-slate-500 mt-1">Uploaded on {uploadedResume?.uploadDate || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center flex-1 transition-colors duration-300">
              <div className="relative w-48 h-48 rounded-full border-[8px] border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6">
                <div 
                  className={`absolute inset-0 rounded-full border-[8px] ${resumeAnalysis.resume_score >= 80 ? 'border-[#10B981]' : resumeAnalysis.resume_score >= 60 ? 'border-[#F59E0B]' : 'border-red-500'}`} 
                  style={{ clipPath: `polygon(0 0, 100% 0, 100% ${resumeAnalysis.resume_score}%, 0 100%)` }}
                ></div>
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{resumeAnalysis.resume_score}</span>
                  <span className="text-xl text-slate-500 dark:text-slate-400">/100</span>
                </div>
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Resume Score</h3>
              <p className="text-sm text-slate-500 mt-2 text-center">Your overall resume strength based on content, impact, and clarity.</p>
            </div>
            
            {/* ATS Score */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300 flex items-center justify-between">
               <div>
                 <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">ATS Score</h3>
                 <p className="text-xs text-slate-500 mt-1">Machine readability</p>
               </div>
               <div className={`text-2xl font-bold ${resumeAnalysis.ats_score >= 80 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                  {resumeAnalysis.ats_score}/100
               </div>
            </div>

            <button 
              onClick={() => {
                setResumeAnalysis(null);
                setUploadedResume(null);
              }}
              className="w-full flex items-center justify-center gap-2 text-sm text-white bg-[#8B5CF6] hover:bg-[#7C3AED] transition-colors py-3 rounded-xl font-medium"
            >
              <RefreshCw size={16} /> Analyze Another Resume
            </button>

          </div>

          {/* Right Column - Details */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Improvements */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Zap size={16} className="text-blue-500" />
                </div>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Improvement Suggestions</h3>
              </div>
              
              <ul className="space-y-4">
                {resumeAnalysis.improvements && resumeAnalysis.improvements.length > 0 ? resumeAnalysis.improvements.map((item, i) => (
                  <li key={i} className="flex items-start gap-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl">
                    <ChevronRight size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
                    <span className="text-sm text-slate-700 dark:text-slate-300">{item}</span>
                  </li>
                )) : (
                  <li className="text-sm text-slate-500 italic">No specific improvements found.</li>
                )}
              </ul>
            </div>

            {/* Missing Keywords & Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                  <span>Detected Skills</span>
                  <span className="text-[10px] bg-[#10B981]/15 text-[#10B981] px-2 py-0.5 rounded-full">AI Extracted</span>
                </h3>
                <p className="text-xs text-slate-500 mb-4">Review, remove, or add missing skills below.</p>
                <div className="flex flex-wrap gap-2 mb-4">
                  {resumeAnalysis.skills && resumeAnalysis.skills.length > 0 ? (
                    resumeAnalysis.skills.map((skill, i) => (
                      <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs font-medium border border-[#10B981]/20">
                        {skill}
                        <button 
                          onClick={() => {
                            const updated = resumeAnalysis.skills.filter(s => s !== skill);
                            handleSkillsChange(updated);
                          }}
                          className="hover:bg-[#10B981]/25 rounded-full p-0.5 transition-colors"
                          title="Remove Skill"
                        >
                          <X size={10} />
                        </button>
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-slate-500 italic">No skills selected.</span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2 mb-4">
                  {resumeAnalysis.missing_keywords && resumeAnalysis.missing_keywords.length > 0 ? resumeAnalysis.missing_keywords.map((kw, i) => (
                    <button 
                      key={i} 
                      onClick={() => addKeywordToSkills(kw)}
                      className="px-3 py-1 bg-red-500/10 hover:bg-[#10B981]/20 text-red-500 hover:text-[#10B981] dark:text-red-400 rounded-full text-xs font-medium border border-transparent hover:border-[#10B981]/25 transition-all flex items-center gap-1"
                      title="Move to Detected Skills"
                    >
                      {kw} +
                    </button>
                  )) : (
                    <span className="text-sm text-slate-500 italic">No missing keywords identified.</span>
                  )}
                </div>
                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 mt-4">
                  <MultiSelectDropdown
                    selected={resumeAnalysis.missing_keywords || []}
                    onChange={handleKeywordsChange}
                    placeholder="Search and add missing keywords..."
                  />
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Briefcase size={16} className="text-[#8B5CF6]" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Suggested Projects</h3>
                </div>
                <ul className="space-y-3">
                  {resumeAnalysis.suggested_projects && resumeAnalysis.suggested_projects.length > 0 ? resumeAnalysis.suggested_projects.map((proj, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">{proj}</span>
                    </li>
                  )) : (
                    <span className="text-sm text-slate-500 italic">No projects suggested.</span>
                  )}
                </ul>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
                <div className="flex items-center gap-2 mb-4">
                  <Award size={16} className="text-[#8B5CF6]" />
                  <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Suggested Certifications</h3>
                </div>
                <ul className="space-y-3">
                  {resumeAnalysis.suggested_certifications && resumeAnalysis.suggested_certifications.length > 0 ? resumeAnalysis.suggested_certifications.map((cert, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0 mt-0.5" />
                      <span className="text-xs text-slate-600 dark:text-slate-400">{cert}</span>
                    </li>
                  )) : (
                    <span className="text-sm text-slate-500 italic">No certifications suggested.</span>
                  )}
                </ul>
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
