export const CAREER_GOALS = [
  'Software Engineer',
  'Full Stack Developer',
  'Backend Developer',
  'Frontend Developer',
  'AI Engineer',
  'Machine Learning Engineer',
  'Data Analyst',
  'Data Scientist',
  'Cloud Engineer',
  'DevOps Engineer',
  'Cyber Security Analyst',
  'Product Manager'
];

export const SKILL_CATEGORIES = {
  'Programming Languages': [
    'Python', 'Java', 'JavaScript', 'TypeScript', 'C', 'C++', 'C#', 'Go', 'Rust', 'PHP', 'Kotlin', 'Swift'
  ],
  'Frontend': [
    'React', 'Next.js', 'Vue.js', 'Angular', 'Tailwind CSS', 'Bootstrap', 'HTML', 'CSS'
  ],
  'Backend': [
    'Node.js', 'Express.js', 'FastAPI', 'Django', 'Flask', 'Spring Boot', 'Laravel'
  ],
  'Databases': [
    'MySQL', 'PostgreSQL', 'MongoDB', 'Firebase', 'Supabase', 'Redis'
  ],
  'Cloud & DevOps': [
    'AWS', 'Azure', 'Google Cloud', 'Docker', 'Kubernetes', 'Jenkins', 'GitHub Actions'
  ],
  'AI / Machine Learning': [
    'Machine Learning', 'Deep Learning', 'TensorFlow', 'PyTorch', 'OpenCV', 'NLP', 'Generative AI', 'LangChain'
  ],
  'Cyber Security': [
    'Penetration Testing', 'Ethical Hacking', 'Network Security', 'SIEM', 'OWASP'
  ],
  'Data Science': [
    'Pandas', 'NumPy', 'Power BI', 'Tableau', 'Data Analytics'
  ],
  'Soft Skills': [
    'Communication', 'Leadership', 'Teamwork', 'Problem Solving', 'Public Speaking'
  ]
};

// Flatten skills for easy searching
export const ALL_SKILLS = Object.entries(SKILL_CATEGORIES).flatMap(([category, skills]) => 
  skills.map(skill => ({ skill, category }))
);
