import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, RefreshCw, UploadCloud, AlertCircle, CheckCircle2, ChevronRight, Briefcase, Award, Zap } from 'lucide-react';

const API_URL = 'http://localhost:8000/api';

export default function ResumeAnalyzer() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const studentId = localStorage.getItem('studentId');

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const analyzeResume = async (fileToAnalyze = file) => {
    if (!fileToAnalyze) return;
    
    setLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('file', fileToAnalyze);
    
    try {
      const res = await axios.post(`${API_URL}/analyze?student_id=${studentId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Failed to analyze resume. Please try again.");
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

      {!results && !loading && (
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
              handleFileChange(e);
              if(e.target.files[0]) analyzeResume(e.target.files[0]);
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

      {results && !loading && (
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
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate max-w-[150px]">{file?.name || "resume.pdf"}</h4>
                  <p className="text-xs text-slate-500 mt-1">Analyzed just now</p>
                </div>
              </div>
            </div>

            {/* Overall Score */}
            <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-sm flex flex-col items-center justify-center flex-1 transition-colors duration-300">
              <div className="relative w-48 h-48 rounded-full border-[8px] border-slate-100 dark:border-slate-800 flex items-center justify-center mb-6">
                <div 
                  className={`absolute inset-0 rounded-full border-[8px] ${results.resume_score >= 80 ? 'border-[#10B981]' : results.resume_score >= 60 ? 'border-[#F59E0B]' : 'border-red-500'}`} 
                  style={{ clipPath: `polygon(0 0, 100% 0, 100% ${results.resume_score}%, 0 100%)` }}
                ></div>
                <div className="text-center">
                  <span className="text-4xl font-bold text-slate-900 dark:text-white">{results.resume_score}</span>
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
               <div className={`text-2xl font-bold ${results.ats_score >= 80 ? 'text-[#10B981]' : 'text-[#F59E0B]'}`}>
                 {results.ats_score}/100
               </div>
            </div>

            <button 
              onClick={() => {
                setResults(null);
                setFile(null);
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
                {results.improvements && results.improvements.length > 0 ? results.improvements.map((item, i) => (
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
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Detected Skills</h3>
                <div className="flex flex-wrap gap-2">
                  {results.skills && results.skills.length > 0 ? results.skills.map((skill, i) => (
                    <span key={i} className="px-3 py-1 bg-[#10B981]/10 text-[#10B981] rounded-full text-xs font-medium">
                      {skill}
                    </span>
                  )) : (
                    <span className="text-sm text-slate-500 italic">No skills detected.</span>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
                <h3 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4 uppercase tracking-wider">Missing Keywords</h3>
                <div className="flex flex-wrap gap-2">
                  {results.missing_keywords && results.missing_keywords.length > 0 ? results.missing_keywords.map((kw, i) => (
                    <span key={i} className="px-3 py-1 bg-red-500/10 text-red-500 dark:text-red-400 rounded-full text-xs font-medium">
                      {kw}
                    </span>
                  )) : (
                    <span className="text-sm text-slate-500 italic">No missing keywords identified.</span>
                  )}
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
                  {results.suggested_projects && results.suggested_projects.length > 0 ? results.suggested_projects.map((proj, i) => (
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
                  {results.suggested_certifications && results.suggested_certifications.length > 0 ? results.suggested_certifications.map((cert, i) => (
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
