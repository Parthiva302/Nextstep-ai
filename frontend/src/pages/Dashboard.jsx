import React, { useEffect, useState } from 'react';
import {
  BrainCircuit, FileText, Map, Activity, Target, ChevronRight,
  GitBranch, CheckCircle2, Circle, Award,
  Sparkles, ExternalLink, Lock, Briefcase, Code2,
  Bell, X, ClipboardCheck, ArrowRight
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { useAppStore } from '../store/app-store';
import { jsPDF } from 'jspdf';
import {
  CAREER_SKILLS_MAP,
  logActivity
} from '../utils/score-engine';

export default function Dashboard() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Zustand Store
  const githubStats = useAppStore((state) => state.githubData);
  const setGithubStats = useAppStore((state) => state.setGithubData);
  const leetcodeStats = useAppStore((state) => state.leetcodeData);
  const setLeetcodeStats = useAppStore((state) => state.setLeetcodeData);
  const resumeAnalysis = useAppStore((state) => state.resumeAnalysis);

  // Component States
  const [projects, setProjects] = useState([]);
  const [activities, setActivities] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifMenu, setShowNotifMenu] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showSimulator, setShowSimulator] = useState(false);
  const [dbLeaderboard, setDbLeaderboard] = useState([]);

  // Simulator Toggles
  const [simGitHub, setSimGitHub] = useState(false);
  const [simLeetCode, setSimLeetCode] = useState(false);
  const [simResume, setSimResume] = useState(false);
  const [simProjectsCount, setSimProjectsCount] = useState(0);
  const [simSkillsCount, setSimSkillsCount] = useState(0);

  // Load stats from Supabase
  useEffect(() => {
    async function loadData() {
      if (!user) return;
      try {
        // GitHub
        if (!githubStats) {
          const { data: gh } = await supabase.from('github_stats').select('*').eq('user_id', user.id).maybeSingle();
          if (gh) setGithubStats(gh);
        }
        // LeetCode
        if (!leetcodeStats) {
          const { data: lc } = await supabase.from('leetcode_stats').select('*').eq('user_id', user.id).maybeSingle();
          if (lc) setLeetcodeStats(lc);
        }
        // Projects
        const { data: projs } = await supabase.from('projects').select('*').eq('user_id', user.id);
        if (projs) setProjects(projs);

        // Activities
        const { data: acts } = await supabase.from('user_activities').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(5);
        if (acts) setActivities(acts);

        // Notifications
        const { data: notifs } = await supabase.from('notifications').select('*').eq('user_id', user.id).order('created_at', { ascending: false }).limit(6);
        if (notifs && notifs.length > 0) {
          setNotifications(notifs);
        } else {
          // If empty, insert default notifications for the user
          const defaultNotifs = [
            { title: "🎉 Welcome to NextStep AI!", message: "Your career transformation starts here. Complete your profile and check your career matches." },
            { title: "💻 GitHub Connected", message: "Your repositories and language diversity score have been analyzed successfully." },
            { title: "🎯 Resume Uploaded", message: "Resume processed successfully. Check the Resume Analyzer page for your score." },
            { title: "📈 AI Daily Insights", message: "Your personalized roadmap has been updated with the latest trends." }
          ];
          try {
            const { data: insertedNotifs } = await supabase.from('notifications').insert(
              defaultNotifs.map(n => ({ ...n, user_id: user.id }))
            ).select();
            if (insertedNotifs) {
              setNotifications(insertedNotifs);
            } else {
              setNotifications(defaultNotifs.map((n, idx) => ({ ...n, id: idx + 1000 })));
            }
          } catch {
            setNotifications(defaultNotifs.map((n, idx) => ({ ...n, id: idx + 1000 })));
          }
        }

        // Fetch all profiles, github_stats, leetcode_stats, projects, and readiness_scores to compute leaderboard
        const { data: allProfiles } = await supabase.from('profiles').select('user_id, full_name, email, career_goal, github_username, leetcode_username, cgpa, skills');
        const { data: allGh } = await supabase.from('github_stats').select('user_id, github_score');
        const { data: allLc } = await supabase.from('leetcode_stats').select('user_id, leetcode_score');
        const { data: allProjs } = await supabase.from('projects').select('user_id');
        const { data: allReadiness } = await supabase.from('readiness_scores').select('user_id, resume_score');

        if (allProfiles) {
          const leaderUsers = allProfiles
            .filter(p => p.user_id !== user.id) // Filter out current user from DB lists, we'll append current user manually
            .map(p => {
              const gh = allGh?.find(g => g.user_id === p.user_id);
              const lc = allLc?.find(l => l.user_id === p.user_id);
              const userProjCount = allProjs?.filter(pr => pr.user_id === p.user_id).length || 0;
              const readiness = allReadiness?.find(r => r.user_id === p.user_id);
              
              const ghVal = gh?.github_score || (p.github_username ? 55 : 0);
              const lcVal = lc?.leetcode_score || (p.leetcode_username ? 50 : 0);
              
              let coding = 0;
              if (p.github_username && p.leetcode_username) {
                coding = Math.round(ghVal * 0.5 + lcVal * 0.5);
              } else if (p.github_username) {
                coding = ghVal;
              } else if (p.leetcode_username) {
                coding = lcVal;
              }

              const acad = p.cgpa ? Math.min(Math.round(p.cgpa * 10), 100) : 0;
              const proj = Math.min(userProjCount * 25, 100);
              const resume = readiness?.resume_score || 0;
              const skillsList = Array.isArray(p.skills) ? p.skills : [];
              const skill = Math.min(skillsList.length * 10, 100);

              const score = Math.round(
                coding * 0.30 +
                acad * 0.25 +
                proj * 0.20 +
                resume * 0.15 +
                skill * 0.10
              );

              return {
                name: p.full_name || p.email?.split('@')[0] || 'Student',
                goal: p.career_goal || 'Software Engineer',
                score: score,
                isCurrentUser: false
              };
            });
          setDbLeaderboard(leaderUsers);
        }

      } catch (err) {
        console.warn('Error loading dashboard data:', err);
      }
    }
    loadData();
  }, [user]);

  // Extract Lists & Values
  const skillsList = Array.isArray(profile?.skills) ? profile.skills : [];
  const selectedGoal = profile?.career_goal || 'Software Engineer';
  const displayName = profile?.full_name || user?.email?.split('@')[0] || 'Student';

  // Centralized Score Engine Component Calculations
  let githubScoreValue = githubStats?.github_score || (profile?.github_username ? 55 : 0);
  let leetcodeScoreValue = leetcodeStats?.leetcode_score || (profile?.leetcode_username ? 50 : 0);
  
  let codingScore = 0;
  if (profile?.github_username && profile?.leetcode_username) {
    codingScore = Math.round(githubScoreValue * 0.5 + leetcodeScoreValue * 0.5);
  } else if (profile?.github_username) {
    codingScore = githubScoreValue;
  } else if (profile?.leetcode_username) {
    codingScore = leetcodeScoreValue;
  }

  const academicScore = profile?.cgpa ? Math.min(Math.round(profile.cgpa * 10), 100) : 0;
  const projectScore = Math.min(projects.length * 25, 100);
  const resumeScore = resumeAnalysis?.resume_score || 0;
  const skillScore = Math.min(skillsList.length * 10, 100);

  // NEXTSTEP SCORE FORMULA (30%, 25%, 20%, 15%, 10%)
  const nextstepScore = Math.round(
    codingScore * 0.30 +
    academicScore * 0.25 +
    projectScore * 0.20 +
    resumeScore * 0.15 +
    skillScore * 0.10
  );

  // Initialize Simulator based on actual state on modal open
  useEffect(() => {
    if (showSimulator) {
      setSimGitHub(!!profile?.github_username);
      setSimLeetCode(!!profile?.leetcode_username);
      setSimResume(resumeScore > 0);
      setSimProjectsCount(projects.length);
      setSimSkillsCount(skillsList.length);
    }
  }, [showSimulator]);

  // Calculate Simulated Score
  const getSimulatedScore = () => {
    const sCoding = (simGitHub && simLeetCode) ? 80 : (simGitHub ? 75 : (simLeetCode ? 70 : 0));
    const sAcademic = academicScore;
    const sProject = Math.min(simProjectsCount * 25, 100);
    const sResume = simResume ? Math.max(resumeScore, 80) : 0;
    const sSkill = Math.min(simSkillsCount * 10, 100);

    return Math.round(
      sCoding * 0.30 +
      sAcademic * 0.25 +
      sProject * 0.20 +
      sResume * 0.15 +
      sSkill * 0.10
    );
  };

  // PROFILE COMPLETION ENGINE (CALIBRATED CHECKLIST %)
  const completionPercent = Math.round(
    (resumeScore > 0 ? 15 : 0) +
    (profile?.github_username ? 15 : 0) +
    (profile?.leetcode_username ? 15 : 0) +
    (projects.length > 0 ? 20 : 0) +
    (skillsList.length > 0 ? 15 : 0) +
    (profile?.career_goal ? 10 : 0) +
    (profile?.cgpa ? 10 : 0)
  );

  // Checklist Details
  const checklist = [
    { key: 'resume', label: 'Resume Uploaded', weight: '15%', completed: resumeScore > 0, path: '/resume' },
    { key: 'github', label: 'GitHub Connected', weight: '15%', completed: !!profile?.github_username, path: '/analytics', state: { activeTab: 'github' } },
    { key: 'leetcode', label: 'LeetCode Connected', weight: '15%', completed: !!profile?.leetcode_username, path: '/analytics', state: { activeTab: 'leetcode' } },
    { key: 'projects', label: 'Projects Added', weight: '20%', completed: projects.length > 0, path: '/profile' },
    { key: 'skills', label: 'Skills Selected', weight: '15%', completed: skillsList.length > 0, path: '/profile' },
    { key: 'career', label: 'Career Goal Set', weight: '10%', completed: !!profile?.career_goal, path: '/profile' },
    { key: 'cgpa', label: 'CGPA Added', weight: '10%', completed: !!profile?.cgpa, path: '/profile' }
  ];

  // AI Daily Insight Bar
  let aiDailyInsight;
  if (resumeScore === 0) {
    aiDailyInsight = '💡 Completing your Resume Upload could boost your NextStep score by up to 15 points immediately.';
  } else if (!profile?.github_username) {
    aiDailyInsight = '💡 Connect your GitHub repository to analyze commit logs and public contributions (+15 points potential).';
  } else if (!profile?.leetcode_username) {
    aiDailyInsight = '💡 Link LeetCode to synchronize problem-solving metrics and show off practice consistency.';
  } else if (projects.length < 2) {
    aiDailyInsight = '💡 Completing a high-demand project like a Database Management System could increase your score by 5 points.';
  } else if (skillsList.length < 6) {
    aiDailyInsight = '💡 Selecting critical missing skills (e.g. Docker, AWS) matching your goal will enhance your matching metric.';
  } else {
    aiDailyInsight = '💡 Your score is looking solid! Practice mock interview questions with your AI Mentor to prepare for target roles.';
  }

  // Why This Score details
  const strengths = [];
  const weaknesses = [];
  if (codingScore >= 75) strengths.push(`✓ Coding: Strong Developer Hub stats (${codingScore}/100)`);
  else if (codingScore > 0) weaknesses.push(`⚠ Coding: Solved counts could be optimized (${codingScore}/100)`);
  else weaknesses.push('⚠ Connect LeetCode/GitHub to calculate coding score');

  if (academicScore >= 75) strengths.push(`✓ Academics: Exceptional CGPA of ${profile?.cgpa}`);
  else if (academicScore > 0) weaknesses.push(`⚠ CGPA could be optimized (${profile?.cgpa})`);
  else weaknesses.push('⚠ Academic Details: Add CGPA to unlock academic score');

  if (projectScore >= 60) strengths.push(`✓ Projects: Cataloged ${projects.length} software projects`);
  else weaknesses.push('⚠ Projects: Showcase more practical repositories');

  if (resumeScore >= 70) strengths.push(`✓ Resume: AI Evaluated & ATS Ready (${resumeScore}/100)`);
  else weaknesses.push('⚠ Resume: Upload resume PDF to unlock ATS keywords');

  if (skillScore >= 60) strengths.push(`✓ Skills: Diverse tech stack with ${skillsList.length} tags`);
  else weaknesses.push('⚠ Skills: Expand tech stack to match career demand');

  let scoreExplanation;
  if (nextstepScore >= 80) {
    scoreExplanation = 'Your overall profile readiness is exceptional. You are in a strong position for top-tier internships and jobs. Keep up the great work!';
  } else if (nextstepScore >= 50) {
    scoreExplanation = 'Your profile is building nicely. You can significantly boost your placement readiness score by addressing the recommended checklist items below.';
  } else {
    scoreExplanation = 'Your career readiness index is in the early stages. Upload your resume and connect your coding accounts to unlock personalized career insights and scores.';
  }

  const potentialImprovement = 100 - nextstepScore;

  // Career Match Engine
  const targetSkills = CAREER_SKILLS_MAP[selectedGoal] || CAREER_SKILLS_MAP['Software Engineer'];
  const matchedSkills = skillsList.filter(s => targetSkills.includes(s));
  const missingSkills = targetSkills.filter(s => !skillsList.includes(s));
  const careerMatchPercent = targetSkills.length > 0
    ? Math.round((matchedSkills.length / targetSkills.length) * 100)
    : 0;

  // Opportunity recommendations with current dates (2026/2027)
  const opportunities = [
    { title: 'Google Summer of Code 2026', type: 'Program', deadline: 'Apr 15, 2026', match: 92, skills: ['Python', 'Git', 'Collaboration'], url: 'https://summerofcode.withgoogle.com/' },
    { title: 'Kaggle Titanic Prediction Challenge', type: 'Competition', deadline: 'Dec 31, 2026', match: 86, skills: ['Python', 'Machine Learning', 'Pandas'], url: 'https://www.kaggle.com/' },
    { title: 'Microsoft Imagine Cup Hackathon', type: 'Hackathon', deadline: 'Jan 22, 2027', match: 89, skills: ['React', 'Azure', 'Node.js'], url: 'https://imaginecup.microsoft.com/' },
    { title: 'Vercel FrontEnd Web Challenges', type: 'Challenge', deadline: 'Nov 12, 2026', match: 82, skills: ['Next.js', 'Tailwind CSS', 'TypeScript'], url: 'https://vercel.com/' }
  ].filter(o => {
    if (selectedGoal.includes('AI') || selectedGoal.includes('Machine') || selectedGoal.includes('Data')) {
      return o.title.includes('Google') || o.title.includes('Kaggle');
    }
    return o.title.includes('Microsoft') || o.title.includes('Vercel');
  });

  // Roadmap GPS Stages
  const roadmapStages = [
    { title: 'Foundation', status: skillsList.length > 2 ? 'completed' : 'current', path: '/profile' },
    { title: 'Core Skills', status: skillsList.length > 5 ? 'completed' : (skillsList.length > 2 ? 'current' : 'locked'), path: '/profile' },
    { title: 'Projects', status: projects.length >= 2 ? 'completed' : (skillsList.length > 5 ? 'current' : 'locked'), path: '/profile' },
    { title: 'Interview Prep', status: codingScore >= 70 ? 'completed' : (projects.length >= 2 ? 'current' : 'locked'), path: '/analytics' },
    { title: 'Placement Ready', status: nextstepScore >= 75 ? 'completed' : 'locked', path: '/roadmap' }
  ];

  // Leaderboard ranking including current student dynamically
  const baseLeaderboard = dbLeaderboard.length >= 2 ? dbLeaderboard : [
    { name: 'Parthiva', goal: 'AI Engineer', score: 91 },
    { name: 'Abhinav', goal: 'Full Stack Developer', score: 87 },
    { name: 'Murali', goal: 'DevOps Engineer', score: 84 },
  ];
  const fullLeaderboard = [...baseLeaderboard, { name: displayName, goal: selectedGoal, score: nextstepScore, isCurrentUser: true }]
    .sort((a, b) => b.score - a.score)
    .filter((v, i, a) => a.findIndex(t => t.name === v.name) === i) // Filter duplicate names
    .slice(0, 5); // Top 5 entries

  // Generate Career Report PDF
  const generateCareerReport = () => {
    const doc = new jsPDF();
    
    // Header block
    doc.setFillColor(15, 23, 42); 
    doc.rect(0, 0, 210, 40, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("NEXTSTEP AI - STUDENT CAREER REPORT", 14, 26);
    
    // Details
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(11);
    doc.text(`Candidate Name: ${displayName}`, 14, 52);
    doc.text(`Target Job Goal: ${selectedGoal}`, 14, 58);
    doc.text(`College Name: ${profile?.college || 'N/A'}`, 14, 64);
    doc.text(`Branch / Major: ${profile?.branch || 'N/A'}`, 14, 70);
    
    // Score Gauge Block
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(1);
    doc.rect(138, 46, 58, 28);
    doc.setFontSize(9);
    doc.text("NEXTSTEP SCORE INDEX", 142, 54);
    doc.setFontSize(26);
    doc.text(`${nextstepScore}/100`, 142, 68);

    // Section 1: Score breakdown
    doc.setFontSize(14);
    doc.text("1. NextStep Index Breakdown", 14, 88);
    doc.setFontSize(10);
    doc.text(`* Coding Score (30% weight): ${codingScore}/100`, 18, 96);
    doc.text(`* Academic Score (25% weight): ${academicScore}/100`, 18, 102);
    doc.text(`* Projects Score (20% weight): ${projectScore}/100`, 18, 108);
    doc.text(`* Resume Score (15% weight): ${resumeScore}/100`, 18, 114);
    doc.text(`* Skills Score (10% weight): ${skillScore}/100`, 18, 120);

    // Section 2: Career Matching & Gaps
    doc.setFontSize(14);
    doc.text("2. Career Matching Analysis", 14, 134);
    doc.setFontSize(10);
    doc.text(`- Career Goal: ${selectedGoal}`, 18, 142);
    doc.text(`- Match Index: ${careerMatchPercent}%`, 18, 148);
    doc.text(`- Missing Skills: ${missingSkills.join(', ') || 'None'}`, 18, 154, { maxWidth: 180 });

    // Section 3: Project Catalogs
    doc.setFontSize(14);
    doc.text("3. Cataloged Projects", 14, 170);
    doc.setFontSize(10);
    if (projects.length > 0) {
      projects.forEach((proj, idx) => {
        const y = 178 + (idx * 14);
        if (y < 260) {
          doc.text(`${idx + 1}. ${proj.title} [Stack: ${Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : ''}]`, 18, y);
          doc.text(`   Desc: ${proj.description || ''}`, 18, y + 5, { maxWidth: 175 });
        }
      });
    } else {
      doc.text("No projects cataloged. Add projects in profile to increase score index.", 18, 178);
    }

    // Section 4: Opportunities Recommendations
    doc.setFontSize(14);
    const oppsY = Math.max(178 + (projects.length * 14) + 10, 210);
    doc.text("4. Matched Opportunities", 14, oppsY);
    doc.setFontSize(10);
    opportunities.forEach((o, i) => {
      doc.text(`- [${o.type}] ${o.title} | Deadline: ${o.deadline} (Match: ${o.match}%)`, 18, oppsY + 8 + (i * 6));
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("Generated dynamically by NextStep AI • Your Next Step, Powered by AI", 14, 285);

    doc.save("nextstep-report.pdf");
    logActivity(user.id, 'download', 'Downloaded Career Report PDF');
  };

  // Notification menu unread click
  const markNotificationRead = async (id) => {
    try {
      await supabase.from('notifications').update({ read: true }).eq('id', id);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch {
      // Ignore update error
    }
  };

  // Notification header unread count
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-10">

      {/* Bell Notification Bell Dropdown Panel */}
      <div className="flex justify-between items-center bg-[#6366F1]/10 border border-[#6366F1]/20 rounded-2xl p-4 text-indigo-700 dark:text-indigo-300 shadow-sm relative">
        <div className="flex items-center gap-3">
          <Sparkles className="flex-shrink-0 text-[#8B5CF6]" size={20} />
          <span className="text-sm font-semibold tracking-wide">{aiDailyInsight}</span>
        </div>
        
        {/* Bell Action Icon Button */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifMenu(!showNotifMenu)}
            className="p-2 rounded-xl bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 relative transition-all"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-[9px] text-white font-bold animate-pulse">
                {unreadCount}
              </span>
            )}
          </button>
          
          {showNotifMenu && (
            <div className="absolute right-0 mt-3 w-80 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-850 rounded-2xl shadow-xl z-50 p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="flex justify-between items-center border-b border-slate-100 dark:border-slate-800 pb-2">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-white uppercase tracking-wider">Recent Alerts</h4>
                <button onClick={() => setShowNotifMenu(false)} className="text-slate-400 hover:text-slate-600"><X size={14} /></button>
              </div>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                {notifications.map((n) => (
                  <div 
                    key={n.id}
                    onClick={() => markNotificationRead(n.id)}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer text-left ${n.read ? 'border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-800/10' : 'border-indigo-500/20 bg-indigo-500/5'}`}
                  >
                    <h5 className={`text-xs font-bold ${n.read ? 'text-slate-700 dark:text-slate-300' : 'text-indigo-600 dark:text-indigo-400'}`}>{n.title}</h5>
                    <p className="text-[10px] text-slate-400 mt-0.5">{n.message}</p>
                  </div>
                ))}
                {notifications.length === 0 && (
                  <p className="text-center text-xs text-slate-400 py-4">No notifications present.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 1. Header (Welcome Card) */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            Welcome back, {displayName}! 👋
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Targeting <span className="font-bold text-[#6366F1]">{selectedGoal}</span> major.
          </p>
          
          {/* Profile Completion Engine Bar */}
          <div className="pt-2">
            <div className="flex items-center gap-4">
              <span className="text-xs font-semibold text-slate-500">Profile Completion</span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{completionPercent}%</span>
            </div>
            <div className="w-64 bg-slate-100 dark:bg-slate-800 h-2 rounded-full mt-1.5 overflow-hidden">
              <div 
                className="h-full bg-emerald-500 transition-all duration-700 ease-out" 
                style={{ width: `${completionPercent}%` }}
              ></div>
            </div>
            <button 
              onClick={() => setShowChecklist(!showChecklist)}
              className="text-xs text-[#6366F1] hover:underline mt-2 flex items-center gap-1 font-medium"
            >
              {showChecklist ? 'Hide Checklist' : 'Show Completion Breakdown'} ({checklist.filter(c => !c.completed).length} missing)
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate('/resume')}
            className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <FileText size={15} /> Analyze Resume
          </button>
          <button
            onClick={() => navigate('/roadmap')}
            className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <Map size={15} /> View Roadmap
          </button>
          <button
            onClick={generateCareerReport}
            className="bg-slate-50 hover:bg-slate-100 dark:bg-[#1F2937] dark:hover:bg-[#374151] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
          >
            <ClipboardCheck size={15} /> Generate Report
          </button>
          <button
            onClick={() => navigate('/mentor')}
            className="bg-[#6366F1] hover:bg-[#4F46E5] text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-md shadow-[#6366F1]/20"
          >
            <BrainCircuit size={15} /> Ask AI Mentor
          </button>
        </div>
      </div>

      {/* Completion Engine Expanded Checklist */}
      {showChecklist && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-3 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">Profile Setup Checklist</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {checklist.map((item) => (
              <div 
                key={item.key} 
                onClick={() => navigate(item.path, item.state ? { state: item.state } : undefined)}
                className={`p-3 border rounded-xl flex items-start justify-between gap-3 cursor-pointer transition-all hover:bg-slate-50 dark:hover:bg-slate-800/40 ${item.completed ? 'border-emerald-500/30 bg-emerald-500/5' : 'border-slate-200 dark:border-slate-800'}`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">
                    {item.completed ? (
                      <CheckCircle2 size={16} className="text-emerald-500" />
                    ) : (
                      <Circle size={16} className="text-slate-400" />
                    )}
                  </div>
                  <div>
                    <h4 className={`text-xs font-bold ${item.completed ? 'text-slate-700 dark:text-slate-300' : 'text-slate-500'}`}>{item.label}</h4>
                  </div>
                </div>
                <span className="text-[10px] font-extrabold text-slate-400">+{item.weight}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Bento Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Columns (Spans 2) */}
        <div className="lg:col-span-2 space-y-6">

          {/* 2. NextStep Score Engine Bento Tile */}
          <div className="bg-gradient-to-br from-[#1E293B] to-[#0F172A] border border-slate-700/50 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-64 h-64 bg-[#6366F1]/10 rounded-full blur-3xl -z-10"></div>
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div>
                <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider">Placement Intelligence</p>
                <h3 className="text-lg font-bold text-white mt-1">NextStep Score</h3>
                <p className="text-slate-400 text-xs mt-1">Weighted metric for top recruitment selection readiness</p>
                
                <div className="mt-6 space-y-3">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Coding Score (30%)</span>
                    <span>{codingScore}/100</span>
                  </div>
                  <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${codingScore}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Academics (25%)</span>
                    <span>{academicScore}/100</span>
                  </div>
                  <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500" style={{ width: `${academicScore}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Projects (20%)</span>
                    <span>{projectScore}/100</span>
                  </div>
                  <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-[#10B981]" style={{ width: `${projectScore}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Resume Upload (15%)</span>
                    <span>{resumeScore}/100</span>
                  </div>
                  <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-yellow-500" style={{ width: `${resumeScore}%` }}></div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-400">Skills Selected (10%)</span>
                    <span>{skillScore}/100</span>
                  </div>
                  <div className="w-64 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="h-full bg-red-400" style={{ width: `${skillScore}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Large Score Indicator */}
              <div className="flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-2xl p-6 w-full md:w-48 text-center backdrop-blur-sm shadow-md">
                <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                  {nextstepScore}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-2">NextStep Index</div>
                
                {/* 10. Biggest Missing Feature: Simulator trigger button */}
                <button 
                  onClick={() => setShowSimulator(true)}
                  className="mt-5 w-full py-2 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1"
                >
                  <Activity size={12} /> Analyze Readiness
                </button>
              </div>
            </div>
          </div>

          {/* 3. Why This Score Bento Tile */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Target size={16} className="text-[#8B5CF6]" /> Why this score?
              </h3>
              <div className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-xl flex items-center gap-1">
                Potential: +{potentialImprovement} Points
              </div>
            </div>
            
            <p className="text-sm text-slate-600 dark:text-slate-400 mb-6 italic">
              "{scoreExplanation}"
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Strengths */}
              <div className="bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-500/20 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-xs font-extrabold text-emerald-700 dark:text-emerald-400 uppercase tracking-wide">Verified Strengths</h4>
                <div className="space-y-2">
                  {strengths.map((s, idx) => (
                    <p key={idx} className="text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 font-medium">
                      {s}
                    </p>
                  ))}
                </div>
              </div>

              {/* Weaknesses */}
              <div className="bg-amber-50/40 dark:bg-amber-950/10 border border-amber-500/20 rounded-2xl p-4 space-y-2.5">
                <h4 className="text-xs font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wide">Key Improvements</h4>
                <div className="space-y-2">
                  {weaknesses.map((w, idx) => (
                    <p key={idx} className="text-xs text-amber-850 dark:text-amber-300 flex items-center gap-1.5 font-medium">
                      {w}
                    </p>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* 6. Learning Roadmap Progress Bento Tile */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Map size={16} className="text-indigo-500" /> Career GPS Roadmap
                </h3>
                <p className="text-xs text-slate-400 mt-1">Stage-by-stage learning tracking to {selectedGoal}</p>
              </div>
              <button 
                onClick={() => navigate('/roadmap')} 
                className="text-xs text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 font-bold flex items-center gap-1"
              >
                Go to Roadmap <ChevronRight size={14} />
              </button>
            </div>

            <div className="relative">
              {/* Horizontal Line Connecting Nodes */}
              <div className="absolute top-5 left-8 right-8 h-0.5 bg-slate-100 dark:bg-slate-800 -z-10 hidden md:block"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
                {roadmapStages.map((stage, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => navigate(stage.path)}
                    className="flex md:flex-col items-center gap-3 md:gap-2 text-left md:text-center cursor-pointer group hover:scale-105 transition-all duration-200"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all group-hover:shadow-md ${
                      stage.status === 'completed' 
                        ? 'bg-emerald-500 border-emerald-500 text-white group-hover:bg-emerald-600 group-hover:border-emerald-600' 
                        : (stage.status === 'current' 
                            ? 'bg-indigo-600 border-indigo-600 text-white animate-pulse group-hover:bg-indigo-700 group-hover:border-indigo-700' 
                            : 'bg-slate-100 dark:bg-slate-800 border-slate-300 dark:border-slate-700 text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700')
                    }`}>
                      {stage.status === 'completed' ? (
                        <CheckCircle2 size={16} />
                      ) : (
                        <span className="text-xs font-bold">{idx + 1}</span>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-indigo-500 dark:group-hover:text-indigo-400 transition-colors">{stage.title}</h4>
                      <p className="text-[10px] text-slate-400 capitalize">{stage.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 4. Activity Feed Bento Tile */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity size={16} className="text-[#6366F1]" /> Recent Activity Log
            </h3>
            <div className="space-y-2.5">
              {activities.map((act) => (
                <div key={act.id} className="flex justify-between items-center p-3 bg-slate-50 dark:bg-[#0B0F19] rounded-xl border border-slate-100 dark:border-slate-850">
                  <div className="flex items-center gap-2 text-xs">
                    <CheckCircle2 size={14} className="text-emerald-500 flex-shrink-0" />
                    <span className="text-slate-700 dark:text-slate-300 font-medium">{act.description}</span>
                  </div>
                  <span className="text-[9px] text-slate-400 font-mono">{new Date(act.created_at).toLocaleDateString()}</span>
                </div>
              ))}
              {activities.length === 0 && (
                <p className="text-center text-xs text-slate-400 py-4">No recent activity detected.</p>
              )}
            </div>
          </div>

        </div>

        {/* Right Side (Spans 1 Column) */}
        <div className="space-y-6">

          {/* 5. Leaderboard Bento Widget */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={16} className="text-[#F59E0B]" /> Top Students (Leaderboard)
            </h3>
            <div className="space-y-2">
              {fullLeaderboard.map((student, idx) => (
                <div 
                  key={idx}
                  className={`flex justify-between items-center p-3 rounded-xl border transition-all ${student.isCurrentUser ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-100 dark:border-slate-850 bg-slate-50 dark:bg-[#0B0F19]'}`}
                >
                  <div className="flex items-center gap-2.5">
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black ${idx === 0 ? 'bg-amber-400 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-950' : idx === 2 ? 'bg-amber-600 text-white' : 'bg-slate-200 dark:bg-slate-800'}`}>
                      {idx + 1}
                    </span>
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{student.name} {student.isCurrentUser && '(You)'}</h4>
                      <p className="text-[9px] text-slate-400">{student.goal}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-[#6366F1] dark:text-indigo-400">{student.score} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* 7. GitHub & LeetCode Stats Bento Tile */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-300 space-y-6">
            
            {/* GitHub Block */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch size={14} className="text-[#6366F1]" /> GitHub Analytics
                </h4>
                {githubStats ? (
                  <span className="text-[10px] font-extrabold bg-indigo-50 dark:bg-indigo-950/20 text-[#6366F1] px-2 py-0.5 rounded-full border border-indigo-500/10">
                    Score: {githubStats.github_score}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={10} /> Disconnected
                  </span>
                )}
              </div>

              {githubStats ? (
                <div className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center gap-3">
                    <img src={githubStats.avatar_url} alt="GitHub avatar" className="w-8 h-8 rounded-full border border-indigo-500/30" />
                    <div>
                      <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{githubStats.name || githubStats.username}</h5>
                      <p className="text-[10px] text-slate-400">{githubStats.bio || 'Developer profile connected'}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-1 pt-1.5 border-t border-slate-200 dark:border-slate-800/80 text-center">
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{githubStats.public_repos}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Repos</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{githubStats.total_stars}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Stars</p>
                    </div>
                    <div>
                      <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100">{githubStats.followers}</p>
                      <p className="text-[9px] text-slate-400 uppercase">Followers</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-2">
                  <p className="text-[11px] text-slate-400">Connect GitHub to unlock repository analysis & coding metrics.</p>
                  <button 
                    onClick={() => navigate('/analytics', { state: { activeTab: 'github' } })}
                    className="w-full py-2 bg-slate-50 dark:bg-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#374151] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-bold transition-colors"
                  >
                    Connect GitHub Profile
                  </button>
                </div>
              )}
            </div>

            {/* LeetCode Block */}
            <div className="space-y-3 pt-2">
              <div className="flex justify-between items-center">
                <h4 className="text-xs font-extrabold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <Code2 size={14} className="text-amber-500" /> LeetCode Analytics
                </h4>
                {leetcodeStats ? (
                  <span className="text-[10px] font-extrabold bg-amber-50 dark:bg-amber-950/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/10">
                    Score: {leetcodeStats.leetcode_score}
                  </span>
                ) : (
                  <span className="text-[10px] text-amber-500 font-bold bg-amber-500/10 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Lock size={10} /> Disconnected
                  </span>
                )}
              </div>

              {leetcodeStats ? (
                <div className="bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">User: {leetcodeStats.username}</span>
                    <span className="text-[10px] text-slate-400">Rank: #{leetcodeStats.ranking?.toLocaleString()}</span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-slate-500">Solved Issues</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{leetcodeStats.total_solved} total</span>
                    </div>
                    {/* Easy Medium Hard progress bar */}
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${(leetcodeStats.easy_solved / (leetcodeStats.total_solved || 1)) * 100}%` }}></div>
                      <div className="h-full bg-amber-500" style={{ width: `${(leetcodeStats.medium_solved / (leetcodeStats.total_solved || 1)) * 100}%` }}></div>
                      <div className="h-full bg-red-500" style={{ width: `${(leetcodeStats.hard_solved / (leetcodeStats.total_solved || 1)) * 100}%` }}></div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-center space-y-2">
                  <p className="text-[11px] text-slate-400">Connect LeetCode to synchronize problem solved statistics and tracking.</p>
                  <button 
                    onClick={() => navigate('/analytics', { state: { activeTab: 'leetcode' } })}
                    className="w-full py-2 bg-slate-50 dark:bg-[#1F2937] hover:bg-slate-100 dark:hover:bg-[#374151] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-xl text-[10px] font-bold transition-colors"
                  >
                    Connect LeetCode Profile
                  </button>
                </div>
              )}
            </div>

          </div>

          {/* 4. Career Match Bento Tile */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Briefcase size={16} className="text-[#10B981]" /> Career Match Engine
            </h3>
            
            <div className="flex justify-between items-center">
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">{selectedGoal}</h4>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Target Job Role</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-emerald-500">{careerMatchPercent}%</span>
                <p className="text-[9px] text-slate-400 uppercase font-semibold">Match Rate</p>
              </div>
            </div>

            <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500" style={{ width: `${careerMatchPercent}%` }}></div>
            </div>

            <div className="space-y-1 text-xs">
              <p className="font-bold text-slate-700 dark:text-slate-300">Missing Skills Gaps:</p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {missingSkills.slice(0, 4).map((skill, idx) => (
                  <span key={idx} className="bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded font-medium border border-amber-500/20">
                    {skill}
                  </span>
                ))}
                {missingSkills.length === 0 && (
                  <span className="text-emerald-500 font-bold">✓ All core skills connected!</span>
                )}
              </div>
            </div>
          </div>

          {/* 8. Opportunity Recommendations Bento Tile (Fixed dates) */}
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-6 shadow-sm transition-colors duration-300 space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Award size={16} className="text-pink-500" /> Opportunities Engine
            </h3>

            <div className="space-y-3">
              {opportunities.map((opp, idx) => (
                <div key={idx} className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-200 dark:border-slate-800 rounded-2xl flex justify-between items-start gap-2">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{opp.title}</h4>
                    <p className="text-[9px] text-slate-400 mt-0.5">{opp.type} • Deadline: {opp.deadline}</p>
                    <a href={opp.url} target="_blank" rel="noreferrer" className="text-[9px] text-indigo-500 hover:underline inline-flex items-center gap-0.5 mt-1 font-bold">
                      Apply Program <ExternalLink size={8} />
                    </a>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">{opp.match}%</span>
                  </div>
                </div>
              ))}
              <button 
                onClick={() => navigate('/opportunities')}
                className="w-full py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              >
                Explore All Opportunities
              </button>
            </div>
          </div>

        </div>

      </div>

      {/* 10. SCORE SIMULATOR MODAL (Why Am I Not Ready?) */}
      {showSimulator && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl p-6 shadow-2xl space-y-6 relative overflow-hidden animate-in zoom-in-95 duration-200 text-left">
            
            <button 
              onClick={() => setShowSimulator(false)}
              className="absolute right-4 top-4 p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
            >
              <X size={18} />
            </button>

            <div>
              <p className="text-xs font-extrabold text-indigo-500 uppercase tracking-widest">NextStep Simulator</p>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mt-1">Readiness Gap Simulator</h3>
              <p className="text-xs text-slate-400 mt-1">Simulate completing pending criteria and see your projected placement readiness index.</p>
            </div>

            {/* Score comparison dial */}
            <div className="flex items-center justify-between bg-slate-50 dark:bg-[#0B0F19] p-4 rounded-2xl border border-slate-100 dark:border-slate-850">
              <div>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Score</p>
                <div className="text-3xl font-black text-slate-700 dark:text-slate-300">{nextstepScore}</div>
              </div>
              <div className="text-slate-400 font-bold"><ArrowRight size={24} /></div>
              <div className="text-right">
                <p className="text-[10px] text-indigo-400 font-bold uppercase tracking-wider">Projected Score</p>
                <div className="text-3xl font-black text-indigo-600 dark:text-indigo-400">{getSimulatedScore()}</div>
              </div>
            </div>

            {/* Simulation controls */}
            <div className="space-y-3">
              <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-wider">Toggle Simulated Actions</h4>
              
              <label className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/10">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Link GitHub Profile (+15pts)</span>
                <input 
                  type="checkbox" 
                  checked={simGitHub} 
                  onChange={e => setSimGitHub(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/10">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Link LeetCode Profile (+15pts)</span>
                <input 
                  type="checkbox" 
                  checked={simLeetCode} 
                  onChange={e => setSimLeetCode(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              <label className="flex items-center justify-between p-3 border border-slate-100 dark:border-slate-850 rounded-xl cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/10">
                <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">Optimize Resume Keywords (+15pts)</span>
                <input 
                  type="checkbox" 
                  checked={simResume} 
                  onChange={e => setSimResume(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500"
                />
              </label>

              {/* Slider for projects */}
              <div className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <span>Simulated Projects Count (+25pts per project)</span>
                  <span className="font-bold">{simProjectsCount} Project(s)</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="4" 
                  value={simProjectsCount} 
                  onChange={e => setSimProjectsCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Slider for skills */}
              <div className="p-3 border border-slate-100 dark:border-slate-850 rounded-xl space-y-1.5">
                <div className="flex justify-between text-xs text-slate-700 dark:text-slate-300 font-medium">
                  <span>Simulated Skills Count (+10pts per skill tag)</span>
                  <span className="font-bold">{simSkillsCount} Skill(s)</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="10" 
                  value={simSkillsCount} 
                  onChange={e => setSimSkillsCount(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-200 dark:bg-slate-750 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button 
                onClick={() => setShowSimulator(false)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-colors"
              >
                Close simulator
              </button>
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}
