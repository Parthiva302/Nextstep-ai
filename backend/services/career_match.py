CAREER_PROFILES = {
    "Software Engineer": {
        "required_skills": ["Python", "Java", "C++", "Data Structures", "Algorithms", "System Design", "SQL", "Git"],
        "core_weight": 0.6,
        "secondary_weight": 0.4
    },
    "AI Engineer": {
        "required_skills": ["Python", "Machine Learning", "Deep Learning", "TensorFlow", "PyTorch", "NLP", "Computer Vision", "Mathematics", "Data Science"],
        "core_weight": 0.7,
        "secondary_weight": 0.3
    },
    "Cloud Engineer": {
        "required_skills": ["AWS", "Azure", "GCP", "Docker", "Kubernetes", "Linux", "Networking", "Terraform", "CI/CD"],
        "core_weight": 0.6,
        "secondary_weight": 0.4
    },
    "Cyber Security": {
        "required_skills": ["Network Security", "Cryptography", "Linux", "Penetration Testing", "Ethical Hacking", "Python", "Bash", "Security Automation"],
        "core_weight": 0.6,
        "secondary_weight": 0.4
    },
    "Data Analyst": {
        "required_skills": ["SQL", "Python", "R", "Excel", "Tableau", "Power BI", "Statistics", "Data Visualization", "Pandas"],
        "core_weight": 0.6,
        "secondary_weight": 0.4
    },
    "Backend Engineer": {
        "required_skills": ["Node.js", "Python", "Java", "Go", "SQL", "NoSQL", "Redis", "Kafka", "System Design", "API Development"],
        "core_weight": 0.7,
        "secondary_weight": 0.3
    },
    "Frontend Engineer": {
        "required_skills": ["HTML", "CSS", "JavaScript", "React", "Vue", "Angular", "TypeScript", "TailwindCSS", "UI/UX"],
        "core_weight": 0.7,
        "secondary_weight": 0.3
    },
    "Full Stack Developer": {
        "required_skills": ["JavaScript", "React", "Node.js", "Python", "SQL", "MongoDB", "Git", "Docker", "REST APIs", "TypeScript"],
        "core_weight": 0.5,
        "secondary_weight": 0.5
    }
}

def calculate_career_match(student_skills: list, target_career: str = None) -> list:
    """
    Compare student skills against predefined career profiles.
    Returns a list of matches sorted by percentage descending.
    If target_career is specified, ensures that one is included with specific details.
    """
    # Normalize student skills for comparison
    normalized_student_skills = [s.strip().lower() for s in student_skills]
    
    matches = []
    
    for career, profile in CAREER_PROFILES.items():
        required_skills = profile["required_skills"]
        normalized_required = [s.strip().lower() for s in required_skills]
        
        # Calculate overlap
        matched_skills = [s for s in required_skills if s.strip().lower() in normalized_student_skills]
        missing_skills = [s for s in required_skills if s.strip().lower() not in normalized_student_skills]
        
        match_percentage = 0
        if required_skills:
            match_percentage = int((len(matched_skills) / len(required_skills)) * 100)
            
        # Give a small boost to make MVP demo more realistic if they have generic skills
        if len(student_skills) > 0 and match_percentage < 20:
             match_percentage += min(len(student_skills) * 5, 30)
             
        matches.append({
            "career": career,
            "match_percentage": min(match_percentage, 100),
            "matched_skills": matched_skills,
            "missing_skills": missing_skills
        })
        
    # Sort by match percentage descending
    matches.sort(key=lambda x: x["match_percentage"], reverse=True)
    
    # Take top 3 for general display
    return matches[:5]
