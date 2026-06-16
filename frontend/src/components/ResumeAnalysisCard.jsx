import React, { useRef, useState } from 'react';
import { UploadCloud, AlertCircle } from 'lucide-react';
import { useStudent } from '../context/StudentContext';

export default function ResumeAnalysisCard({ studentId }) {
  const { resumeAnalysis, loading, errors, analyzeResume } = useStudent();
  const fileInputRef = useRef(null);
  const [localError, setLocalError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Strict PDF check on client side
    const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
    if (!isPdf) {
      setLocalError('❌ Only PDF files are accepted. Please upload a .pdf file.');
      e.target.value = '';
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLocalError('❌ File too large. Maximum size is 5MB.');
      e.target.value = '';
      return;
    }

    setLocalError(null);
    try {
      await analyzeResume(studentId, file);
    } catch (error) {
      console.error('Resume analysis failed:', error);
    } finally {
      e.target.value = '';
    }
  };

  const currentError = localError || errors.resume;

  return (
    <div className="bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl p-8 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="bg-purple-100 dark:bg-purple-500/20 p-2 rounded-xl">
          <UploadCloud className="text-purple-600 dark:text-purple-400" size={24} />
        </div>
        <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Resume Grader</h3>
      </div>

      {!resumeAnalysis && !loading.resume ? (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative group cursor-pointer border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-purple-400 dark:hover:border-purple-500 bg-slate-50 dark:bg-slate-800/50 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]"
        >
          <UploadCloud size={48} className="text-slate-400 dark:text-slate-500 group-hover:text-purple-500 dark:group-hover:text-purple-400 mb-4 transition-colors" />
          <span className="font-bold text-slate-700 dark:text-slate-300">Click to upload your resume</span>
          <span className="text-sm text-slate-500 dark:text-slate-500 mt-2">Accepted formats: PDF (Max 5MB)</span>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      ) : null}

      {loading.resume && (
        <div className="relative border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-8 text-center flex flex-col items-center justify-center min-h-[200px]">
          <div className="animate-spin h-8 w-8 border-4 border-purple-200 dark:border-purple-800 border-t-purple-600 dark:border-t-purple-400 rounded-full mb-4"></div>
          <span className="font-bold text-purple-600 dark:text-purple-400">Analyzing Resume...</span>
        </div>
      )}

      {currentError && !loading.resume && (
        <div className="mt-4 p-3 bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-medium rounded-xl flex items-center gap-2">
          <AlertCircle size={16} /> {currentError}
        </div>
      )}

      {resumeAnalysis && !loading.resume && (
        <div className="mt-6 p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 animate-in slide-in-from-bottom-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-black text-slate-800 dark:text-slate-200 text-lg">Analysis Result</h4>
            <span className={`font-black px-4 py-1 rounded-full text-sm ${
              resumeAnalysis.score >= 80 ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300' :
              resumeAnalysis.score >= 60 ? 'bg-amber-100 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300' :
              'bg-rose-100 dark:bg-rose-500/20 text-rose-700 dark:text-rose-300'
            }`}>{resumeAnalysis.score}/100</span>
          </div>
          {/* Score bar */}
          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5 mb-5">
            <div
              className={`h-2.5 rounded-full transition-all duration-700 ${
                resumeAnalysis.score >= 80 ? 'bg-emerald-500' :
                resumeAnalysis.score >= 60 ? 'bg-amber-500' : 'bg-rose-500'
              }`}
              style={{ width: `${resumeAnalysis.score}%` }}
            ></div>
          </div>
          {resumeAnalysis.note && (
            <p className="text-xs text-slate-400 dark:text-slate-500 italic mb-4">{resumeAnalysis.note}</p>
          )}
          <div className="space-y-4">
            {resumeAnalysis.suggestions?.length > 0 && (
              <div>
                <strong className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">💡 Suggestions</strong>
                <ul className="space-y-2">
                  {resumeAnalysis.suggestions.map((s, i) => (
                    <li key={i} className="text-sm text-slate-700 dark:text-slate-300 flex items-start gap-2 p-2 bg-white dark:bg-slate-900/50 rounded-xl border border-slate-100 dark:border-slate-700">
                      <span className="text-purple-500 dark:text-purple-400 shrink-0 mt-0.5">→</span> {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {resumeAnalysis.keywords?.length > 0 && (
              <div>
                <strong className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-2">🔑 Skills Detected</strong>
                <div className="flex flex-wrap gap-2">
                  {resumeAnalysis.keywords.map((k, i) => (
                    <span key={i} className="text-xs bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-800 px-2 py-1 rounded-lg font-medium">{k}</span>
                  ))}
                </div>
              </div>
            )}
            {resumeAnalysis.missing_sections?.length > 0 && (
              <div className="p-3 bg-amber-50 dark:bg-amber-500/10 rounded-xl border border-amber-100 dark:border-amber-500/20 text-sm">
                <strong className="text-amber-800 dark:text-amber-400 block mb-1">⚠️ Missing Sections:</strong>
                <span className="text-amber-700 dark:text-amber-300">{resumeAnalysis.missing_sections.join(', ')}</span>
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full mt-6 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-2 rounded-xl transition-colors text-sm font-semibold"
          >
            Upload Different Resume
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      )}
    </div>
  );
}
