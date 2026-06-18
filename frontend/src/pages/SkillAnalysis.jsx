import { useState, useEffect } from 'react';
import { LineChart, RefreshCw, BrainCircuit, CheckCircle2, ChevronRight, Target, Zap, Code, Database, Cloud, Shield, GitBranch } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/app-store';
import { ALL_SKILLS } from '../constants/skills';

export default function SkillAnalysis() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const [analyzing, setAnalyzing] = useState(false);
  const [analyzed, setAnalyzed] = useState(false);

  // Zustand Store
  const resumeAnalysis = useAppStore((state) => state.resumeAnalysis);

  const careerGoal = profile?.career_goal || 'Software Engineer';

  // Fallback skills based on career goal
  const skillSets = {
    'Software Engineer': {
      technical: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git'],
      missing: ['System Design', 'Docker', 'AWS', 'Kubernetes', 'TypeScript'],
      soft: ['Communication', 'Problem Solving', 'Teamwork', 'Time Management'],
    },
    'Full Stack Developer': {
      technical: ['JavaScript', 'TypeScript', 'React', 'Node.js', 'HTML', 'CSS'],
      missing: ['Next.js', 'System Design', 'Docker', 'PostgreSQL', 'Tailwind CSS'],
      soft: ['Teamwork', 'Communication', 'Problem Solving'],
    },
    'AI Engineer': {
      technical: ['Python', 'TensorFlow', 'PyTorch', 'NumPy', 'Pandas'],
      missing: ['MLOps', 'LangChain', 'CUDA', 'Hugging Face', 'Vector DBs'],
      soft: ['Analytical Thinking', 'Research Skills', 'Attention to Detail'],
    },
    'Data Analyst': {
      technical: ['Python', 'SQL', 'Excel', 'Pandas', 'Matplotlib'],
      missing: ['Power BI', 'Tableau', 'Spark', 'Airflow', 'dbt'],
      soft: ['Communication', 'Critical Thinking', 'Storytelling with Data'],
    },
    'Cloud Engineer': {
      technical: ['AWS', 'Linux', 'Python', 'Terraform', 'Docker'],
      missing: ['Kubernetes', 'Ansible', 'Azure', 'GCP', 'Prometheus'],
      soft: ['Problem Solving', 'Collaboration', 'Documentation'],
    },
    'DevOps Engineer': {
      technical: ['Docker', 'CI/CD', 'Linux', 'Git', 'AWS'],
      missing: ['Kubernetes', 'Prometheus', 'Grafana', 'Helm', 'Vault'],
      soft: ['Communication', 'Crisis Management', 'Automation Mindset'],
    },
  };

  const currentSet = skillSets[careerGoal] || skillSets['Software Engineer'];

  // Merge profile skills and resume-extracted skills
  const profileSkills = Array.isArray(profile?.skills) ? profile.skills : [];
  const resumeSkills = Array.isArray(resumeAnalysis?.skills) ? resumeAnalysis.skills : [];
  const uniqueSkills = Array.from(new Set([...profileSkills, ...resumeSkills])).filter(Boolean);
  
  // Fallback if user has no skills at all
  const userSkills = uniqueSkills.length > 0 ? uniqueSkills : currentSet.technical;

  // Calculate dynamic skill levels for their technical skills
  const skillLevels = userSkills.map((s, i) => {
    // Find demand score from ALL_SKILLS if available, else default
    const matched = ALL_SKILLS.find(item => item.skill.toLowerCase() === s.toLowerCase());
    const level = matched ? Math.min(matched.demand_score - (i * 2), 98) : ([85, 75, 70, 65, 80, 90, 75, 80, 85, 90][i % 10] || 70);
    
    return {
      name: s,
      level: Math.max(level, 45), // baseline 45%
      color: ['#6366F1', '#8B5CF6', '#10B981', '#3B82F6', '#F59E0B', '#EF4444', '#EC4899', '#06B6D4', '#14B8A6', '#F43F5E'][i % 10]
    };
  });

  // Calculate Missing Skills dynamically by checking what they lack
  const missingSkillsList = currentSet.missing.filter(s => !userSkills.some(us => us.toLowerCase() === s.toLowerCase()));
  const finalMissing = missingSkillsList.length > 0 ? missingSkillsList : currentSet.missing;

  // Calculate Soft Skills dynamically from user list, else fall back to career target
  const softSkillsSelected = userSkills.filter(skill => {
    const item = ALL_SKILLS.find(s => s.skill.toLowerCase() === skill.toLowerCase());
    return item && item.category === 'Soft Skills';
  });
  const finalSoftSkills = softSkillsSelected.length > 0 ? softSkillsSelected : currentSet.soft;

  // Calculate Dynamic Scores for Skill Matrix Categories
  const getCategoryScore = (categoryName) => {
    const categoryMapping = {
      'Coding': ['Programming Languages', 'Frontend', 'Backend'],
      'Databases': ['Databases'],
      'Cloud': ['Cloud & DevOps'],
      'Security': ['Cyber Security'],
      'DevOps': ['Cloud & DevOps'],
      'AI/ML': ['AI / Machine Learning']
    };
    
    const targetCategories = categoryMapping[categoryName] || [];
    
    // Find all matching skills in userSkills
    const matchingSkills = userSkills.filter(skill => {
      const skillItem = ALL_SKILLS.find(s => s.skill.toLowerCase() === skill.toLowerCase());
      return skillItem && targetCategories.includes(skillItem.category);
    });
    
    const count = matchingSkills.length;
    if (count === 0) return 20; // baseline
    if (count === 1) return 55;
    if (count === 2) return 75;
    if (count === 3) return 88;
    return Math.min(90 + count * 2, 100);
  };

  const skillMatrix = [
    { label: 'Coding', value: getCategoryScore('Coding'), icon: Code, color: '#3B82F6' },
    { label: 'Databases', value: getCategoryScore('Databases'), icon: Database, color: '#8B5CF6' },
    { label: 'Cloud', value: getCategoryScore('Cloud'), icon: Cloud, color: '#F59E0B' },
    { label: 'Security', value: getCategoryScore('Security'), icon: Shield, color: '#EF4444' },
    { label: 'DevOps', value: getCategoryScore('DevOps'), icon: GitBranch, color: '#10B981' },
    { label: 'AI/ML', value: getCategoryScore('AI/ML'), icon: BrainCircuit, color: '#6366F1' },
  ];

  const handleAnalyze = () => {
    setAnalyzing(true);
    setTimeout(() => { setAnalyzing(false); setAnalyzed(true); }, 1800);
  };

  // Trigger auto-analysis if they have real custom skills loaded
  useEffect(() => {
    if (uniqueSkills.length > 0) {
      setAnalyzed(true);
    }
  }, [uniqueSkills.length]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Header */}
      <div className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <LineChart className="text-[#8B5CF6]" /> Skill Analysis
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">AI-powered skill intelligence for <span className="text-[#6366F1] font-medium">{careerGoal}</span></p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleAnalyze}
            disabled={analyzing}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors shadow-sm disabled:opacity-70"
          >
            {analyzing ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analyzing...</> : <><BrainCircuit size={16} /> Generate Analysis</>}
          </button>
          <button onClick={() => navigate('/roadmap')} className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors">
            <ChevronRight size={16} /> Generate Roadmap
          </button>
        </div>
      </div>

      {/* Skill Levels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Zap size={16} className="text-[#6366F1]" /> Technical Skills
          </h3>
          <div className="space-y-4 max-h-[360px] overflow-y-auto pr-2 custom-scrollbar">
            {skillLevels.map((skill, i) => (
              <div key={i}>
                <div className="flex justify-between text-sm mb-1.5">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{skill.name}</span>
                  <span className="text-slate-500">{analyzed ? skill.level : '?'}%</span>
                </div>
                <div className="h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{ width: analyzed ? `${skill.level}%` : '0%', backgroundColor: skill.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Skill Matrix (CSS based) */}
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
            <Target size={16} className="text-[#10B981]" /> Skill Matrix
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {skillMatrix.map((item, i) => (
              <div key={i} className="p-4 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2">
                  <item.icon size={16} style={{ color: item.color }} />
                  <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{item.label}</span>
                </div>
                <div className="text-2xl font-bold" style={{ color: item.color }}>{analyzed ? item.value : '--'}<span className="text-xs text-slate-400 font-normal">%</span></div>
                <div className="mt-2 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full">
                  <div className="h-full rounded-full transition-all duration-1000" style={{ width: analyzed ? `${item.value}%` : '0%', backgroundColor: item.color }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Missing Skills & Soft Skills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <RefreshCw size={16} className="text-[#EF4444]" /> Missing Skills (Priority)
          </h3>
          <div className="space-y-3">
            {finalMissing.slice(0, 5).map((skill, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20">
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{skill}</span>
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${i < 2 ? 'bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400' : i < 4 ? 'bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {i < 2 ? 'HIGH' : i < 4 ? 'MEDIUM' : 'LOW'}
                </span>
              </div>
            ))}
            {finalMissing.length === 0 && (
              <div className="p-4 text-center text-sm text-emerald-600 dark:text-emerald-400 font-bold">
                ✓ You have connected all critical skills mapped to this target career!
              </div>
            )}
          </div>
        </div>

        <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
          <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-[#10B981]" /> Soft Skills
          </h3>
          <div className="space-y-3">
            {finalSoftSkills.map((skill, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/10 rounded-xl border border-green-100 dark:border-green-900/20">
                <CheckCircle2 size={16} className="text-[#10B981] flex-shrink-0" />
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{skill}</span>
              </div>
            ))}
          </div>
          <div className="mt-4 p-4 bg-[#6366F1]/5 dark:bg-[#6366F1]/10 rounded-xl border border-[#6366F1]/20">
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              💡 <strong>AI Tip:</strong> {finalMissing.length > 0 ? (
                <>Focus on <strong>{finalMissing[0]}</strong> first — it's the highest-impact missing skill for your <strong>{careerGoal}</strong> goal.</>
              ) : (
                <>Keep updating your GitHub and LeetCode activity to build and showcase placement-level consistency!</>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
