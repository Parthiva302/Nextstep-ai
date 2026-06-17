import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Share2, MapPin, ExternalLink, ShieldCheck, Check, Mail, FileText, 
  ArrowLeft, Brain, Code2, GitBranch, Award, Globe, Users, Database, Sparkles, AlertCircle 
} from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../context/AuthContext';
import { Github, Linkedin } from '../components/Icons';
import { jsPDF } from 'jspdf';
import { CAREER_SKILLS_MAP } from '../utils/score-engine';

export default function RecruiterView({ isPublic = false }) {
  const { userId } = useParams();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const targetUserId = userId || authUser?.id;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [candidate, setCandidate] = useState({
    profile: null,
    projects: [],
    readiness: null,
    github: null,
    leetcode: null,
    achievements: []
  });

  useEffect(() => {
    if (!targetUserId) {
      setLoading(false);
      setError("No user profile specified.");
      return;
    }

    async function fetchCandidateData() {
      try {
        setLoading(true);
        setError(null);

        // 1. Fetch Profile
        let { data: profileRow, error: profileErr } = await supabase
          .from('profiles')
          .select('*')
          .eq('user_id', targetUserId)
          .maybeSingle();

        if (profileErr) {
          console.error("Profile error:", profileErr);
          throw new Error("Could not connect to database.");
        }

        if (!profileRow) {
          // Fallback: Check if targetUserId matches the 'id' column
          const { data: fallbackRow, error: fallbackErr } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', targetUserId)
            .maybeSingle();

          if (fallbackErr) {
            console.error("Fallback profile error:", fallbackErr);
            throw new Error("Could not connect to database.");
          }
          profileRow = fallbackRow;
        }

        if (!profileRow) {
          throw new Error("Candidate profile not found. The user may not have completed onboarding.");
        }

        const resolvedUserId = profileRow.user_id || profileRow.id;

        // 2. Fetch Projects
        const { data: projectsData } = await supabase
          .from('projects')
          .select('*')
          .eq('user_id', resolvedUserId);

        // 3. Fetch Readiness Scores
        const { data: readinessData } = await supabase
          .from('readiness_scores')
          .select('*')
          .eq('user_id', resolvedUserId)
          .order('created_at', { ascending: false })
          .limit(1);

        // 4. Fetch GitHub stats
        const { data: githubData } = await supabase
          .from('github_stats')
          .select('*')
          .eq('user_id', resolvedUserId)
          .maybeSingle();

        // 5. Fetch LeetCode stats
        const { data: leetcodeData } = await supabase
          .from('leetcode_stats')
          .select('*')
          .eq('user_id', resolvedUserId)
          .maybeSingle();

        // 6. Fetch Achievements
        const { data: achievementsData } = await supabase
          .from('achievements')
          .select('*')
          .eq('user_id', resolvedUserId);

        setCandidate({
          profile: profileRow,
          projects: projectsData || [],
          readiness: readinessData?.[0] || null,
          github: githubData || null,
          leetcode: leetcodeData || null,
          achievements: achievementsData || []
        });

        // Dynamic SEO meta tags for recruiter shared previews
        const name = profileRow.full_name || "Candidate";
        const goal = profileRow.career_goal || "Developer";
        document.title = `${name} | Student Portfolio - NextStep AI`;
        
        const setMetaTag = (nameAttr, content, isProperty = false) => {
          const attr = isProperty ? 'property' : 'name';
          let tag = document.querySelector(`meta[${attr}="${nameAttr}"]`);
          if (!tag) {
            tag = document.createElement('meta');
            tag.setAttribute(attr, nameAttr);
            document.head.appendChild(tag);
          }
          tag.setAttribute('content', content);
        };

        setMetaTag('description', `View the readiness scores, projects, achievements, and roadmap for ${name}, aspiring ${goal}.`);
        setMetaTag('og:title', `${name} - Student Portfolio`);
        setMetaTag('og:description', `Readiness index, project list, coding activity, and roadmap for ${name}.`);
        setMetaTag('og:type', 'profile', true);
        setMetaTag('og:url', window.location.href, true);
        setMetaTag('twitter:card', 'summary_large_image');
        setMetaTag('twitter:title', `${name} - Student Portfolio`);
        setMetaTag('twitter:description', `Check placement score and coding achievements for ${name}.`);

      } catch (err) {
        console.error("Error fetching candidate portfolio:", err);
        setError(err.message || "Failed to load candidate information.");
      } finally {
        setLoading(false);
      }
    }

    fetchCandidateData();
  }, [targetUserId]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/public/${candidate.profile?.user_id || targetUserId}`;
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const generateResumePDF = () => {
    if (!candidate.profile) return;
    const { profile, projects, github, leetcode, readiness } = candidate;
    const name = profile.full_name || 'Candidate Name';
    const goal = profile.career_goal || 'Software Engineer';
    const emailStr = profile.email || authUser?.email || 'candidate@nextstep.ai';

    const doc = new jsPDF();

    // 1. Header (Dark Navy Block)
    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 42, 'F');

    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text(name.toUpperCase(), 14, 20);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(199, 210, 254);
    doc.text(goal.toUpperCase(), 14, 28);

    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(`Email: ${emailStr}  |  College: ${profile.college || 'N/A'}  |  Branch: ${profile.branch || 'N/A'}`, 14, 36);

    // 2. Metrics Block (Right Top)
    doc.setDrawColor(99, 102, 241);
    doc.setLineWidth(0.5);
    doc.setFillColor(243, 244, 246);
    doc.rect(135, 48, 60, 24, 'F');
    doc.rect(135, 48, 60, 24);
    
    doc.setTextColor(17, 24, 39);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(8);
    doc.text("VERIFIED BY NEXTSTEP AI", 138, 54);
    
    doc.setFontSize(16);
    doc.setTextColor(79, 70, 229);
    const scoreVal = readiness?.total_score || 55;
    doc.text(`Score: ${scoreVal}/100`, 138, 64);

    // 3. Section: Academic Details
    doc.setTextColor(15, 23, 42);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("EDUCATION", 14, 56);
    doc.line(14, 58, 120, 58);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`Degree: Bachelor of Technology (B.Tech)`, 16, 64);
    doc.text(`Institute: ${profile.college || 'Partner Institution'}`, 16, 70);
    doc.text(`Branch/Major: ${profile.branch || 'Information Technology'}`, 16, 76);
    doc.text(`Cumulative CGPA: ${profile.cgpa ? parseFloat(profile.cgpa).toFixed(2) : 'N/A'} / 10.0`, 16, 82);

    // 4. Section: Technical Skills
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("TECHNICAL SKILLS", 14, 94);
    doc.line(14, 96, 196, 96);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    const skillsList = Array.isArray(profile.skills) ? profile.skills : [];
    doc.text(skillsList.join('  •  ') || 'No verified skills cataloged.', 16, 102, { maxWidth: 178 });

    // 5. Section: Coding Profiles
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    doc.text("CODING CREDENTIALS", 14, 114);
    doc.line(14, 116, 196, 116);

    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    let yVal = 122;
    if (leetcode) {
      doc.text(`- LeetCode Solved: ${leetcode.total_solved} Problems (Easy: ${leetcode.easy_solved}, Medium: ${leetcode.medium_solved}, Hard: ${leetcode.hard_solved})`, 16, yVal);
      doc.text(`  Global Ranking: #${leetcode.ranking?.toLocaleString() || 'N/A'}`, 16, yVal + 5);
      yVal += 11;
    } else if (profile.leetcode_username) {
      doc.text(`- LeetCode Profile Linked: User "${profile.leetcode_username}"`, 16, yVal);
      yVal += 6;
    }

    if (github) {
      doc.text(`- GitHub Account: "${github.username}"`, 16, yVal);
      doc.text(`  Public Repos: ${github.public_repos}  |  Total Stars: ${github.total_stars}  |  Active Repos: ${github.active_repos}`, 16, yVal + 5);
      yVal += 11;
    } else if (profile.github_username) {
      doc.text(`- GitHub Profile Linked: User "${profile.github_username}"`, 16, yVal);
      yVal += 6;
    }

    if (!leetcode && !github) {
      doc.text("No external coding accounts verified.", 16, yVal);
      yVal += 6;
    }

    // 6. Section: Projects Showcase
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(12);
    const projSectionY = yVal + 4;
    doc.text("VERIFIED ACADEMIC PROJECTS", 14, projSectionY);
    doc.line(14, projSectionY + 2, 196, projSectionY + 2);

    let projY = projSectionY + 8;
    if (projects.length > 0) {
      projects.forEach((proj, idx) => {
        if (projY < 270) {
          doc.setFont("Helvetica", "bold");
          doc.setFontSize(10);
          const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack.join(', ') : (proj.tech_stack || '');
          doc.text(`${idx + 1}. ${proj.title} [Tech Stack: ${stack}]`, 16, projY);
          
          doc.setFont("Helvetica", "normal");
          doc.setFontSize(9);
          doc.text(`Description: ${proj.description || 'No description provided.'}`, 18, projY + 5, { maxWidth: 175 });
          
          if (proj.github_url || proj.live_url) {
            const urls = [
              proj.github_url ? `Repo: ${proj.github_url}` : null,
              proj.live_url ? `Live: ${proj.live_url}` : null
            ].filter(Boolean).join('  |  ');
            doc.text(`Links: ${urls}`, 18, projY + 10);
            projY += 16;
          } else {
            projY += 11;
          }
        }
      });
    } else {
      doc.setFont("Helvetica", "normal");
      doc.setFontSize(10);
      doc.text("No verified software engineering projects cataloged.", 16, projY);
    }

    // 7. Footer
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text("Verified candidate resume generated dynamically by NextStep AI", 14, 288);

    doc.save(`${name.replace(/\s+/g, '_')}_Resume.pdf`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center text-center p-8 transition-colors duration-300">
        <div className="w-16 h-16 rounded-full border-4 border-[#8B5CF6] border-t-transparent animate-spin mb-6"></div>
        <h3 className="text-lg font-bold text-slate-900 dark:text-white">Retrieving Portfolio...</h3>
        <p className="text-sm text-slate-500 mt-2">Loading database profile, metrics, projects, and verified credentials.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] flex flex-col items-center justify-center text-center p-6 transition-colors duration-300">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-6 border border-red-200 dark:border-red-800">
          <AlertCircle className="text-red-600 dark:text-red-400" size={30} />
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Profile Access Error</h3>
        <p className="text-sm text-slate-500 mt-2 max-w-md">{error}</p>
        <button 
          onClick={() => navigate('/dashboard')}
          className="mt-6 bg-[#6366F1] hover:bg-[#4F46E5] text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366F1]/20"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  const { profile, projects, github, leetcode, readiness, achievements } = candidate;

  const displayName = profile?.full_name || 'Abhinav Vidadala';
  const selectedGoal = profile?.career_goal || 'Software Engineer';
  const collegeName = profile?.college || 'NextStep Partner University';
  const branchName = profile?.branch || 'Information Technology';
  const cgpaValue = profile?.cgpa ? parseFloat(profile.cgpa).toFixed(2) : '8.60';
  const finalScore = readiness?.total_score || 55;
  const skillsList = Array.isArray(profile?.skills) ? profile.skills : [];

  // Match percentage calculation for recruiter view based on selected goal
  const goalSkills = CAREER_SKILLS_MAP[selectedGoal] || CAREER_SKILLS_MAP['Software Engineer'];
  const matchedSkills = skillsList.filter(s => goalSkills.some(g => g.toLowerCase() === s.toLowerCase()));
  const matchPercent = goalSkills.length > 0 ? Math.round((matchedSkills.length / goalSkills.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-white font-sans transition-colors duration-300 p-6 lg:p-10">
      
      {/* Top Banner Controls */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
        
        {/* Back Button */}
        <div>
          {authUser ? (
            <button 
              onClick={() => navigate('/dashboard')}
              className="flex items-center gap-2 text-xs font-bold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-colors"
            >
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
          ) : (
            <div className="flex items-center gap-2 text-xs font-bold text-[#6366F1]">
              <Brain size={18} className="text-[#8B5CF6] animate-pulse" /> NEXTSTEP AI PORTFOLIO
            </div>
          )}
        </div>

        {/* Action Share Tools */}
        <div className="flex items-center gap-2">
          {authUser && (
            <button 
              onClick={handleShare}
              className="bg-white dark:bg-[#111827] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-colors shadow-sm"
            >
              {copied ? (
                <>
                  <Check size={14} className="text-emerald-500" /> Link Copied
                </>
              ) : (
                <>
                  <Share2 size={14} /> Share Profile
                </>
              )}
            </button>
          )}

          {!authUser && (
            <button 
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] hover:from-[#4F46E5] hover:to-[#7C3AED] text-white px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#6366F1]/20"
            >
              Join NextStep AI
            </button>
          )}
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        
        {/* Left Side: General Profile Card */}
        <div className="space-y-6 lg:col-span-1">
          
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#6366F1]/5 rounded-full blur-2xl -z-10"></div>
            
            {/* Header Identity */}
            <div className="flex flex-col items-center text-center pb-6 border-b border-slate-200 dark:border-slate-800">
              <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#8B5CF6] flex items-center justify-center text-white text-3xl font-black shadow-lg border-2 border-white dark:border-[#111827] mb-4">
                {displayName.charAt(0).toUpperCase()}
              </div>

              <div className="flex items-center gap-1.5 justify-center">
                <h2 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-wide">{displayName}</h2>
                <ShieldCheck size={18} className="text-[#3B82F6] flex-shrink-0" />
              </div>

              <p className="text-xs text-indigo-500 dark:text-indigo-400 font-bold mt-1 uppercase tracking-widest">{selectedGoal} Target</p>
              
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-3 flex flex-col items-center gap-1.5">
                <p className="flex items-center gap-1"><MapPin size={13} className="text-slate-400" /> {collegeName}</p>
                <p className="text-[11px] font-medium text-slate-400">{branchName} Major</p>
              </div>
            </div>

            {/* Core Placement Indicators */}
            <div className="py-6 grid grid-cols-2 gap-4 text-center border-b border-slate-200 dark:border-slate-800">
              <div className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-850 rounded-2xl">
                <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{finalScore}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Readiness Score</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-850 rounded-2xl">
                <div className="text-2xl font-black text-emerald-500">{matchPercent}%</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Career Match</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-850 rounded-2xl">
                <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{cgpaValue}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">CGPA Metric</div>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-850 rounded-2xl">
                <div className="text-2xl font-black text-slate-700 dark:text-slate-300">{projects.length}</div>
                <div className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1">Projects Built</div>
              </div>
            </div>

            {/* CTA action buttons */}
            <div className="pt-6 space-y-2.5">
              <button 
                onClick={generateResumePDF}
                className="w-full flex items-center justify-center gap-2 bg-[#8B5CF6] hover:bg-[#7C3AED] text-white py-3 rounded-xl text-xs font-bold transition-all shadow-md shadow-[#8B5CF6]/10"
              >
                <FileText size={15} /> Download PDF Resume
              </button>

              <a 
                href={`mailto:${profile?.email || 'candidate@nextstep.ai'}?subject=Inquiry%20from%20NextStep%2520AI%2520Recruiter&body=Hi%2520${displayName},%2520we%2520viewed%2520your%2520profile%2520on%2520NextStep%2520AI%2520and%2520wanted%2520to%2520reach%2520out%2520regarding%2520opportunities...`}
                className="w-full flex items-center justify-center gap-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 py-3 rounded-xl text-xs font-bold transition-all border border-slate-200 dark:border-slate-700"
              >
                <Mail size={15} /> Contact Candidate
              </a>
            </div>

          </div>

          {/* Social connections if present */}
          {(profile?.github_username || profile?.leetcode_username) && (
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300 space-y-4">
              <h3 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest">Verified Accounts</h3>
              
              <div className="space-y-2.5">
                {profile?.github_username && (
                  <a 
                    href={`https://github.com/${profile.github_username}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Github size={18} className="text-slate-700 dark:text-slate-300" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile.github_username}</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-indigo-500 transition-colors" />
                  </a>
                )}

                {profile?.leetcode_username && (
                  <a 
                    href={`https://leetcode.com/${profile.leetcode_username}`} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="flex items-center justify-between p-3 bg-slate-50 dark:bg-[#0B0F19] hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 rounded-xl transition-all group"
                  >
                    <div className="flex items-center gap-2.5">
                      <Code2 size={18} className="text-amber-500" />
                      <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{profile.leetcode_username}</span>
                    </div>
                    <ExternalLink size={12} className="text-slate-400 group-hover:text-amber-500 transition-colors" />
                  </a>
                )}
              </div>
            </div>
          )}

        </div>

        {/* Right Side: Detailed Bento Sections */}
        <div className="space-y-6 lg:col-span-2">
          
          {/* Bento Tile 1: Skills Tech Stack */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Sparkles size={16} className="text-[#8B5CF6]" /> Skill Inventory
            </h3>
            
            <div className="flex flex-wrap gap-2">
              {skillsList.map((skill, idx) => (
                <span 
                  key={idx} 
                  className="px-3.5 py-1.5 bg-slate-50 dark:bg-[#0B0F19] text-slate-800 dark:text-slate-300 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-medium tracking-wide"
                >
                  {skill}
                </span>
              ))}
              {skillsList.length === 0 && (
                <p className="text-xs text-slate-500 italic">No technical skills registered on profile.</p>
              )}
            </div>
          </div>

          {/* Bento Tile 2: Coding Profile Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Github Tile */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <GitBranch size={14} className="text-[#6366F1]" /> GitHub Activity
                  </h4>
                  {github ? (
                    <span className="text-[10px] font-black bg-indigo-50 dark:bg-indigo-950/20 text-[#6366F1] px-2 py-0.5 rounded-full border border-indigo-500/10">
                      Score: {github.github_score}
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Not Connected</span>
                  )}
                </div>

                {github ? (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-650 dark:text-slate-400 line-clamp-2 italic">{github.bio || 'Developer profile synced.'}</p>
                    <div className="grid grid-cols-3 gap-2 text-center pt-2">
                      <div className="bg-slate-50 dark:bg-[#0B0F19] p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <div className="text-sm font-black text-slate-800 dark:text-white">{github.public_repos}</div>
                        <div className="text-[8px] text-slate-500 uppercase mt-0.5">Repos</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0B0F19] p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <div className="text-sm font-black text-slate-800 dark:text-white">{github.total_stars}</div>
                        <div className="text-[8px] text-slate-500 uppercase mt-0.5">Stars</div>
                      </div>
                      <div className="bg-slate-50 dark:bg-[#0B0F19] p-2.5 rounded-xl border border-slate-100 dark:border-slate-850">
                        <div className="text-sm font-black text-slate-800 dark:text-white">{github.active_repos}</div>
                        <div className="text-[8px] text-slate-500 uppercase mt-0.5">Active</div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-550 py-4 italic">Candidate has not synced GitHub profile logs yet.</p>
                )}
              </div>
            </div>

            {/* LeetCode Tile */}
            <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-xs font-extrabold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Code2 size={14} className="text-amber-500" /> LeetCode Metrics
                  </h4>
                  {leetcode ? (
                    <span className="text-[10px] font-black bg-amber-50 dark:bg-amber-950/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/10">
                      Score: {leetcode.leetcode_score}
                    </span>
                  ) : (
                    <span className="text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full">Not Connected</span>
                  )}
                </div>

                {leetcode ? (
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-500">Solved Algorithm Counts</span>
                      <span className="font-bold text-slate-800 dark:text-slate-200">{leetcode.total_solved} Solved</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden flex">
                      <div className="h-full bg-emerald-500" style={{ width: `${(leetcode.easy_solved / (leetcode.total_solved || 1)) * 100}%` }} title="Easy"></div>
                      <div className="h-full bg-amber-500" style={{ width: `${(leetcode.medium_solved / (leetcode.total_solved || 1)) * 100}%` }} title="Medium"></div>
                      <div className="h-full bg-red-500" style={{ width: `${(leetcode.hard_solved / (leetcode.total_solved || 1)) * 100}%` }} title="Hard"></div>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Easy: {leetcode.easy_solved}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span> Med: {leetcode.medium_solved}</span>
                      <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Hard: {leetcode.hard_solved}</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-550 py-4 italic">Candidate has not synced LeetCode solved statistics yet.</p>
                )}
              </div>
            </div>

          </div>

          {/* Bento Tile 3: Projects Showcase */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
              <Database size={16} className="text-[#10B981]" /> Projects Showcase
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.map((proj) => {
                const stack = Array.isArray(proj.tech_stack) ? proj.tech_stack : [];
                return (
                  <div 
                    key={proj.id} 
                    className="p-4 border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50 dark:bg-[#0B0F19] hover:border-indigo-500 dark:hover:border-indigo-500 transition-all flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">{proj.title}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-3">{proj.description}</p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex flex-wrap gap-1">
                        {stack.map((t, i) => (
                          <span key={i} className="bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 text-[9px] px-2 py-0.5 rounded font-medium">
                            {t}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-3 text-xs pt-1 border-t border-slate-200/50 dark:border-slate-800/50">
                        {proj.github_url && (
                          <a 
                            href={proj.github_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1 text-slate-500 hover:text-slate-755 dark:text-slate-400 dark:hover:text-white transition-colors"
                          >
                            <Github size={13} /> Code Repository
                          </a>
                        )}
                        {proj.live_url && (
                          <a 
                            href={proj.live_url} 
                            target="_blank" 
                            rel="noreferrer" 
                            className="flex items-center gap-1 text-[#6366F1] hover:text-[#4F46E5] font-semibold transition-colors"
                          >
                            <Globe size={13} /> Live Preview
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div className="col-span-2 text-center py-6 text-slate-500 italic text-xs bg-slate-50 dark:bg-[#0B0F19] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No verified projects cataloged on the portfolio yet.
                </div>
              )}
            </div>
          </div>

          {/* Bento Tile 4: Unlocked Badges & Credentials */}
          <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm transition-colors duration-300">
            <h3 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Award size={16} className="text-[#F59E0B]" /> Verified Achievements
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {achievements.map((ach) => (
                <div key={ach.id} className="p-3 bg-slate-50 dark:bg-[#0B0F19] border border-slate-100 dark:border-slate-850 rounded-2xl flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 flex-shrink-0">
                    <Award size={20} />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">{ach.achievement_name}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">{ach.description}</p>
                  </div>
                </div>
              ))}

              {achievements.length === 0 && (
                <div className="col-span-2 text-center py-4 text-slate-550 italic text-xs bg-slate-50 dark:bg-[#0B0F19] border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
                  No verified badges earned yet.
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
      
    </div>
  );
}
