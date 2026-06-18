import { supabase } from '../supabaseClient';

export const CAREER_SKILLS_MAP = {
  'Software Engineer': ['Python', 'Java', 'JavaScript', 'TypeScript', 'C++', 'PostgreSQL', 'Docker', 'AWS', 'Problem Solving'],
  'Full Stack Developer': ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Node.js', 'Express.js', 'PostgreSQL', 'MongoDB', 'Tailwind CSS'],
  'Backend Developer': ['Python', 'Java', 'Node.js', 'FastAPI', 'Django', 'PostgreSQL', 'Redis', 'Docker', 'AWS'],
  'Frontend Developer': ['JavaScript', 'TypeScript', 'React', 'Next.js', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS'],
  'AI Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Generative AI', 'LangChain', 'MongoDB'],
  'Machine Learning Engineer': ['Python', 'Machine Learning', 'Deep Learning', 'PyTorch', 'TensorFlow', 'Pandas', 'NumPy', 'Data Analytics'],
  'Data Analyst': ['SQL', 'Pandas', 'NumPy', 'Power BI', 'Tableau', 'Data Analytics', 'Communication'],
  'Data Scientist': ['Python', 'Machine Learning', 'Pandas', 'NumPy', 'Data Analytics', 'Communication', 'Problem Solving'],
  'Cloud Engineer': ['AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Linux', 'Terraform'],
  'DevOps Engineer': ['Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions', 'AWS', 'Redis', 'Problem Solving'],
  'Cyber Security Analyst': ['Penetration Testing', 'Ethical Hacking', 'Network Security', 'SIEM', 'OWASP', 'Problem Solving'],
  'Product Manager': ['Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Public Speaking']
};

export const CAREER_DEMAND_MAP = {
  'Software Engineer': { demand: 'High', salary: '$85K - $125K' },
  'Full Stack Developer': { demand: 'Critical', salary: '$95K - $135K' },
  'Backend Developer': { demand: 'High', salary: '$90K - $130K' },
  'Frontend Developer': { demand: 'High', salary: '$80K - $115K' },
  'AI Engineer': { demand: 'Critical', salary: '$115K - $170K' },
  'Machine Learning Engineer': { demand: 'Critical', salary: '$110K - $160K' },
  'Data Analyst': { demand: 'Medium', salary: '$65K - $95K' },
  'Data Scientist': { demand: 'High', salary: '$95K - $140K' },
  'Cloud Engineer': { demand: 'High', salary: '$90K - $135K' },
  'DevOps Engineer': { demand: 'High', salary: '$95K - $140K' },
  'Cyber Security Analyst': { demand: 'High', salary: '$85K - $130K' },
  'Product Manager': { demand: 'Medium', salary: '$90K - $130K' }
};

// Log user activity helper
export async function logActivity(userId, activityType, description) {
  if (!userId) return;
  try {
    await supabase.from('user_activities').insert({
      user_id: userId,
      activity_type: activityType,
      description: description
    });
  } catch (err) {
    console.warn('Activity logging warning:', err);
  }
}

// Add user notification helper
export async function addNotification(userId, title, message) {
  if (!userId) return;
  try {
    await supabase.from('notifications').insert({
      user_id: userId,
      title: title,
      message: message
    });
  } catch (err) {
    console.warn('Notification insert warning:', err);
  }
}

// 1. Centralized Career Match Calculator
export async function calculateCareerMatches(userId, skills = []) {
  if (!userId) return [];
  const matches = [];

  const skillsLower = skills.map(s => s.toLowerCase());

  for (const [careerName, reqSkills] of Object.entries(CAREER_SKILLS_MAP)) {
    const matched = reqSkills.filter(s => skillsLower.includes(s.toLowerCase()));
    const missing = reqSkills.filter(s => !skillsLower.includes(s.toLowerCase()));
    const matchScore = reqSkills.length > 0 ? Math.round((matched.length / reqSkills.length) * 100) : 0;
    
    const meta = CAREER_DEMAND_MAP[careerName] || { demand: 'Medium', salary: '$75K - $105K' };

    const matchRow = {
      user_id: userId,
      career_name: careerName,
      match_score: matchScore,
      salary_range: meta.salary,
      industry_demand: meta.demand,
      missing_skills: missing
    };
    matches.push(matchRow);
  }

  try {
    // Delete existing matches and batch insert new ones
    await supabase.from('career_matches').delete().eq('user_id', userId);
    await supabase.from('career_matches').insert(matches);
  } catch (err) {
    console.error('Error saving career matches:', err);
  }

  return matches;
}

// 2. Centralized NextStep Score Calculator
export async function calculateNextStepScore(userId, profile, githubStats, leetcodeStats, projects = []) {
  if (!userId) return 0;

  // Coding Score: combining Github & Leetcode
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

  // Academic Score: CGPA * 10
  const academics = profile?.cgpa ? Math.min(Math.round(profile.cgpa * 10), 100) : 0;

  // Projects Score: 25pts per project, cap at 100
  const projectScore = Math.min(projects.length * 25, 100);

  // Resume Score: Analysis or default uploaded score
  const resumeAnalysis = await fetchResumeAnalysisScore(userId);
  const resumeScore = resumeAnalysis?.resume_score || 0;

  // Skills Score: 10pts per skill, cap at 100
  const skillsList = Array.isArray(profile?.skills) ? profile.skills : [];
  const skillScore = Math.min(skillsList.length * 10, 100);

  // Formula: Coding (30%), Academics (25%), Projects (20%), Resume (15%), Skills (10%)
  const totalScore = Math.round(
    codingScore * 0.30 +
    academics * 0.25 +
    projectScore * 0.20 +
    resumeScore * 0.15 +
    skillScore * 0.10
  );

  // Generate Strengths & Weaknesses
  const strengths = [];
  const weaknesses = [];

  if (codingScore >= 75) strengths.push(`Strong coding profile (${codingScore}/100)`);
  else if (codingScore > 0) weaknesses.push('Improve solved problem counts on coding profiles');
  else weaknesses.push('Connect GitHub and LeetCode profiles to unlock coding metrics');

  if (academics >= 75) strengths.push(`Excellent academic CGPA of ${profile?.cgpa}`);
  else if (academics > 0) weaknesses.push('Academic CGPA could be optimized');
  else weaknesses.push('Add CGPA to unlock academic score');

  if (projectScore >= 50) strengths.push(`Demonstrated hands-on experience with ${projects.length} project(s)`);
  else weaknesses.push('Add more projects to demonstrate practical coding skills');

  if (resumeScore >= 70) strengths.push(`Resume is evaluated and ATS optimized (${resumeScore}/100)`);
  else weaknesses.push('Upload a PDF resume to analyze ATS keyword matches');

  if (skillScore >= 60) strengths.push(`Broad tech stack containing ${skillsList.length} skills`);
  else weaknesses.push('Expand technical stack to match career demand');

  const scoreRow = {
    user_id: userId,
    total_score: totalScore,
    academic_score: academics,
    coding_score: codingScore,
    project_score: projectScore,
    skill_score: skillScore,
    resume_score: resumeScore,
    strengths: strengths,
    weaknesses: weaknesses
  };

  try {
    // Insert historical log
    await supabase.from('readiness_scores').insert(scoreRow);
  } catch (err) {
    console.error('Error saving score:', err);
  }

  // Trigger achievements check
  await checkAndUnlockAchievements(userId, profile, githubStats, leetcodeStats, projects.length, resumeScore, totalScore);

  return scoreRow;
}

// 3. Centralized Achievement Unlocking Engine
export async function checkAndUnlockAchievements(userId, profile, githubStats, leetcodeStats, projectsCount, resumeScore, totalScore) {
  if (!userId) return;

  const targetAchievements = [];

  if (resumeScore > 0) {
    targetAchievements.push({
      name: 'Resume Uploaded',
      desc: 'First PDF Resume analyzed successfully'
    });
  }

  if (profile?.github_username) {
    targetAchievements.push({
      name: 'GitHub Connected',
      desc: 'Linked GitHub repositories and commit logs'
    });
  }

  if (profile?.leetcode_username) {
    targetAchievements.push({
      name: 'LeetCode Connected',
      desc: 'Linked LeetCode stats and problems solved'
    });
  }

  if (projectsCount >= 1) {
    targetAchievements.push({
      name: 'First Project Added',
      desc: 'Added first completed project to portfolio'
    });
  }

  if (projectsCount >= 5) {
    targetAchievements.push({
      name: '5 Projects Completed',
      desc: 'Completed 5 robust software engineering projects'
    });
  }

  // Completion calculation
  const isCgpaSet = !!profile?.cgpa;
  const isGoalSet = !!profile?.career_goal;
  const skillsCount = Array.isArray(profile?.skills) ? profile.skills.length : 0;

  const completionPercent = Math.round(
    (resumeScore > 0 ? 15 : 0) +
    (profile?.github_username ? 15 : 0) +
    (profile?.leetcode_username ? 15 : 0) +
    (projectsCount > 0 ? 20 : 0) +
    (skillsCount > 0 ? 15 : 0) +
    (isGoalSet ? 10 : 0) +
    (isCgpaSet ? 10 : 0)
  );

  if (completionPercent === 100) {
    targetAchievements.push({
      name: 'Profile 100%',
      desc: 'Completed all onboarding credentials and connected hubs'
    });
  }

  if (totalScore >= 80) {
    targetAchievements.push({
      name: 'Readiness Above 80',
      desc: 'Achieved an outstanding NextStep Score of 80+'
    });
  }

  if (leetcodeStats?.total_solved >= 100) {
    targetAchievements.push({
      name: '100 Coding Problems Solved',
      desc: 'Solved over 100 algorithm challenges on LeetCode'
    });
  }

  try {
    // Fetch earned achievements
    const { data: earned } = await supabase.from('achievements').select('achievement_name').eq('user_id', userId);
    const earnedNames = (earned || []).map(a => a.achievement_name);

    for (const ach of targetAchievements) {
      if (!earnedNames.includes(ach.name)) {
        // Unlock new achievement
        await supabase.from('achievements').insert({
          user_id: userId,
          achievement_name: ach.name,
          description: ach.desc
        });
        await logActivity(userId, 'achievement', `Achievement unlocked: ${ach.name}`);
        await addNotification(userId, '🏆 New Achievement!', `You earned the badge: "${ach.name}"`);
      }
    }
  } catch (err) {
    console.warn('Error checking achievements:', err);
  }
}

// Fetch resume analysis helper to avoid zustand import in engine
async function fetchResumeAnalysisScore(userId) {
  try {
    // Just fetch user's last uploaded resume score if stored, or fallback to Zustand locally
    const storeState = window.localStorage.getItem('nextstep-app-store');
    if (storeState) {
      const parsed = JSON.parse(storeState);
      if (parsed?.state?.resumeAnalysis) {
        return parsed.state.resumeAnalysis;
      }
    }
  } catch {
    // Fallback if localStorage is corrupt
  }
  return null;
}
