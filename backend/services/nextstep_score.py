def calculate_nextstep_score(student_data: dict) -> dict:
    """
    Calculate the NextStep score and provide explainable AI insights (strengths/weaknesses).
    
    Weights:
    - Academic Score (25%)
    - Coding Score (30%)
    - Project Score (20%)
    - Resume Score (15%)
    - Skill Score (10%)
    
    student_data is expected to have:
    - academic_score: float (0-100) or cgpa (where cgpa * 10 = score)
    - coding_score: float (0-100)
    - project_score: float (0-100)
    - resume_score: float (0-100)
    - skill_score: float (0-100)
    """
    # Extract scores with fallbacks
    academic = student_data.get("academic_score")
    if academic is None:
        cgpa = student_data.get("cgpa", 0.0)
        academic = cgpa * 10 if cgpa <= 10 else cgpa
    
    coding = student_data.get("coding_score", 0.0)
    project = student_data.get("project_score", 0.0)
    resume = student_data.get("resume_score", 0.0)
    skill = student_data.get("skill_score", 0.0)
    
    # Calculate weighted score
    total_score = (
        (academic * 0.25) +
        (coding * 0.30) +
        (project * 0.20) +
        (resume * 0.15) +
        (skill * 0.10)
    )
    
    nextstep_score = round(total_score)
    
    # Determine Strengths and Weaknesses
    scores_map = {
        "Academic Record": academic,
        "Coding Activity": coding,
        "Projects": project,
        "Resume Quality": resume,
        "Technical Skills": skill
    }
    
    strengths = []
    weaknesses = []
    
    for category, score in scores_map.items():
        if score >= 80:
            strengths.append(category)
        elif score < 60:
            weaknesses.append(category)
            
    # Add qualitative explanations based on the data
    explainable_strengths = []
    for s in strengths:
        if s == "Coding Activity":
            explainable_strengths.append("Strong Coding Activity (Excellent problem solving)")
        elif s == "Academic Record":
            explainable_strengths.append("Good Academic Record (High CGPA)")
        elif s == "Projects":
            explainable_strengths.append("Impressive Projects Portfolio")
        elif s == "Resume Quality":
            explainable_strengths.append("Strong ATS-friendly Resume")
        elif s == "Technical Skills":
            explainable_strengths.append("Robust Technical Skillset")
            
    explainable_weaknesses = []
    for w in weaknesses:
        if w == "Coding Activity":
            explainable_weaknesses.append("Low Coding Activity (Need more LeetCode/GitHub activity)")
        elif w == "Academic Record":
            explainable_weaknesses.append("Academic Score needs improvement")
        elif w == "Projects":
            explainable_weaknesses.append("Missing or weak Projects (Build more full-stack apps)")
        elif w == "Resume Quality":
            explainable_weaknesses.append("Weak Resume Keywords (Optimize for ATS)")
        elif w == "Technical Skills":
            explainable_weaknesses.append("Skill gaps identified (Learn required tech stack)")
            
    # Ensure there's always some feedback if lists are empty due to average scores (60-79)
    if not explainable_strengths and nextstep_score >= 70:
        explainable_strengths.append("Consistent overall performance across all areas")
    if not explainable_weaknesses and nextstep_score < 85:
        explainable_weaknesses.append("Push scores above 80% to stand out to top recruiters")

    return {
        "nextstep_score": nextstep_score,
        "strengths": explainable_strengths,
        "weaknesses": explainable_weaknesses,
        "raw_scores": {
            "academic": academic,
            "coding": coding,
            "project": project,
            "resume": resume,
            "skill": skill
        }
    }
