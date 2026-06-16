from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from pydantic import BaseModel
import logging
import json

from services.smart_ai_analyzer import SmartAIAnalyzer
from services.resume_parser import extract_text_from_pdf
from config import Config
from models.quota_tracker import QuotaTracker
from models.database import engine, Base, get_db
from models.schema import Student, StudentProfile, ReadinessScore, SkillGap, LearningRoadmap, ChatMessage
from services.nextstep_score import calculate_nextstep_score
from services.career_match import calculate_career_match

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="NextStep AI", version="1.0.0")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # In MVP allow all, but configured to FRONTEND_URL ideally
    allow_methods=["*"],
    allow_headers=["*"]
)

# Initialize analyzer
analyzer = SmartAIAnalyzer()

# Logging
logging.basicConfig(level=Config.LOG_LEVEL)
logger = logging.getLogger(__name__)

# --- Pydantic Models ---
class StudentCreate(BaseModel):
    email: str
    name: str
    cgpa: float
    coding_score: int
    projects: list[str]
    skills: list[str]
    career_goal: str

class MentorChatRequest(BaseModel):
    student_id: int
    question: str

# --- Endpoints ---

@app.get("/api/health")
def health():
    return {"status": "ok", "version": "1.0.0"}

@app.post("/api/students", status_code=201)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    try:
        # Check if email exists
        existing_student = db.query(Student).filter(Student.email == data.email).first()
        if existing_student:
            return {"id": existing_student.id, "email": existing_student.email, "message": "Student already exists"}
            
        new_student = Student(email=data.email, name=data.name)
        db.add(new_student)
        db.commit()
        db.refresh(new_student)
        
        # Create profile
        profile = StudentProfile(
            student_id=new_student.id,
            cgpa=data.cgpa,
            coding_score=data.coding_score,
            projects_count=len(data.projects),
            skills_json=json.dumps(data.skills),
            projects_json=json.dumps(data.projects),
            career_goal=data.career_goal
        )
        db.add(profile)
        db.commit()
        
        # Generate Readiness Score using New Score Engine
        academic_score = min(int(data.cgpa * 10), 100)
        project_score = min(len(data.projects)*20, 100)
        skill_score = 80 # Will be updated dynamically in real app
        resume_score = 70 # Default resume score on sign up
        
        score_data = calculate_nextstep_score({
            "academic_score": academic_score,
            "coding_score": data.coding_score,
            "project_score": project_score,
            "resume_score": resume_score,
            "skill_score": skill_score
        })
        
        score = ReadinessScore(
            student_id=new_student.id,
            total_score=score_data["nextstep_score"],
            academic_score=academic_score,
            coding_score=data.coding_score,
            project_score=project_score,
            skill_score=skill_score,
            resume_score=resume_score,
            strengths=score_data["strengths"],
            weaknesses=score_data["weaknesses"]
        )
        db.add(score)
        
        # Calculate skill gaps (Mock logic for now)
        mock_gaps = [{"skill": "System Design", "priority": 1}, {"skill": "Communication", "priority": 2}]
        for gap in mock_gaps:
            db.add(SkillGap(student_id=new_student.id, skill_name=gap["skill"], priority=gap["priority"]))
        
        db.commit()
        
        return {"id": new_student.id, "email": new_student.email, "message": "Profile created successfully"}
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating student: {e}")
        raise HTTPException(status_code=400, detail=str(e))

class StudentLogin(BaseModel):
    email: str
    password: str

@app.post("/api/students/login")
def login_student(data: StudentLogin, db: Session = Depends(get_db)):
    # Very basic login for MVP
    student = db.query(Student).filter(Student.email == data.email).first()
    if not student:
        raise HTTPException(status_code=404, detail="Account not found. Please register.")
    # Skip password check for now or implement if you want
    return {"id": student.id, "email": student.email, "message": "Login successful"}

@app.get("/api/students/{student_id}")
def get_student(student_id: int, db: Session = Depends(get_db)):
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        raise HTTPException(status_code=404, detail="Student not found")
    profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
    score = db.query(ReadinessScore).filter(ReadinessScore.student_id == student_id).order_by(ReadinessScore.created_at.desc()).first()
    skills_raw = profile.skills_json if profile and profile.skills_json else "[]"
    projects_raw = profile.projects_json if profile and profile.projects_json else "[]"
    skills = json.loads(skills_raw) if isinstance(skills_raw, str) else (skills_raw or [])
    projects = json.loads(projects_raw) if isinstance(projects_raw, str) else (projects_raw or [])
    return {
        "id": student.id,
        "email": student.email,
        "name": student.name or "",
        "cgpa": profile.cgpa if profile else 0.0,
        "coding_score": profile.coding_score if profile else 0,
        "projects_count": profile.projects_count if profile else 0,
        "skills": skills,
        "projects": projects,
        "career_goal": profile.career_goal if profile else "",
        "total_score": score.total_score if score else 0,
        "score_breakdown": {
            "academic": score.academic_score if score else 0,
            "coding": score.coding_score if score else 0,
            "projects": score.project_score if score else 0,
            "skills": score.skill_score if score else 0,
            "resume": score.resume_score if score else 0
        } if score else {}
    }

@app.post("/api/analyze")
async def analyze_resume(student_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    try:
        # Enforce PDF only
        filename = file.filename or ""
        content_type = file.content_type or ""
        if not filename.lower().endswith(".pdf") and "pdf" not in content_type.lower():
            raise HTTPException(status_code=400, detail="Only PDF files are accepted. Please upload a .pdf file.")
        
        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")
        
        resume_text = extract_text_from_pdf(contents)
        if not resume_text or len(resume_text.strip()) < 50:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF. Make sure it's not a scanned image.")
        
        result = analyzer.analyze_resume(resume_text)
        
        # Always return useful data — use AI result if available, else smart fallback
        if "error" in result or not result.get("resume_score"):
            # Calculate a basic score from the text length/content
            word_count = len(resume_text.split())
            basic_score = min(40 + (word_count // 20), 85)
            return {
                "resume_score": basic_score,
                "ats_score": max(basic_score - 10, 0),
                "skills": [],
                "missing_keywords": ["Python", "JavaScript", "SQL", "Docker", "AWS"],
                "improvements": [
                    "Add more quantifiable achievements (e.g. 'Improved performance by 30%')",
                    "Include a strong summary/objective section at the top",
                    "List relevant technical skills prominently",
                    "Add links to GitHub, LinkedIn, or portfolio"
                ],
                "suggested_projects": ["Full-stack web application", "Data analysis dashboard"],
                "suggested_certifications": ["AWS Cloud Practitioner"],
                "note": "Basic analysis — AI model busy, showing rule-based results"
            }
            
        return {
            "resume_score": result.get("resume_score", 70),
            "ats_score": result.get("ats_score", 65),
            "skills": result.get("skills", []),
            "missing_keywords": result.get("missing_keywords", []),
            "improvements": result.get("improvements", []),
            "suggested_projects": result.get("suggested_projects", []),
            "suggested_certifications": result.get("suggested_certifications", [])
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/score/{student_id}")
def get_score(student_id: int, db: Session = Depends(get_db)):
    score = db.query(ReadinessScore).filter(ReadinessScore.student_id == student_id).order_by(ReadinessScore.created_at.desc()).first()
    if not score:
        raise HTTPException(status_code=404, detail="Score not found")
    
    # Build dynamic strengths/weaknesses from real scores
    breakdown = {
        "academic": score.academic_score,
        "coding": score.coding_score,
        "projects": score.project_score,
        "skills": score.skill_score,
        "resume": score.resume_score
    }
    
    # Use strengths and weaknesses from DB (generated by Score Engine)
    strengths = score.strengths if score.strengths else ["Keep building your profile!"]
    weaknesses = score.weaknesses if score.weaknesses else ["Looking great overall!"]

    return {
        "total_score": score.total_score,
        "breakdown": breakdown,
        "strengths": strengths,
        "weaknesses": weaknesses,
        "next_actions": ["Upload your resume for AI analysis", "Chat with your AI mentor", "Practice mock interviews"]
    }

@app.get("/api/skill-gaps/{student_id}")
def get_skill_gaps(student_id: int, db: Session = Depends(get_db)):
    gaps = db.query(SkillGap).filter(SkillGap.student_id == student_id).all()
    result = [{"skill": g.skill_name, "priority": g.priority} for g in gaps]
    return {
        "gaps": result,
        "total_gaps": len(result),
        "critical_gaps": len([g for g in result if g["priority"] == 1])
    }

@app.get("/api/career-match/{student_id}")
def get_career_match(student_id: int, db: Session = Depends(get_db)):
    profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Profile not found")
        
    skills_raw = profile.skills_json if profile and profile.skills_json else "[]"
    skills = json.loads(skills_raw) if isinstance(skills_raw, str) else (skills_raw or [])
    
    matches = calculate_career_match(skills, profile.career_goal)
    
    # Analyze missing skills for the top match
    top_match_data = matches[0] if matches else None
    
    required_skills = []
    missing_skills = []
    if top_match_data:
        required_skills = top_match_data.get("matched_skills", []) + top_match_data.get("missing_skills", [])
        missing_skills = top_match_data.get("missing_skills", [])
    
    return {
        "matches": matches,
        "top_match_required_skills": required_skills,
        "missing_skills": missing_skills
    }

@app.post("/api/mentor/chat")
async def mentor_chat(req: MentorChatRequest, db: Session = Depends(get_db)):
    try:
        profile = db.query(StudentProfile).filter(StudentProfile.student_id == req.student_id).first()
        score = db.query(ReadinessScore).filter(ReadinessScore.student_id == req.student_id).order_by(ReadinessScore.created_at.desc()).first()
        gaps = db.query(SkillGap).filter(SkillGap.student_id == req.student_id).all()
        gap_skills = [g.skill_name for g in gaps]
        skills_raw = profile.skills_json if profile and profile.skills_json else "[]"
        skills = json.loads(skills_raw) if isinstance(skills_raw, str) else (skills_raw or [])
        projects_raw = profile.projects_json if profile and profile.projects_json else "[]"
        projects = json.loads(projects_raw) if isinstance(projects_raw, str) else (projects_raw or [])
        
        student_data = {
            "score": score.total_score if score else "Unknown",
            "skills": skills,
            "projects": projects,
            "career_goal": profile.career_goal if profile else "Software Engineer",
            "gaps": gap_skills
        }
        
        result = analyzer.chat_mentor(student_data, req.question)
        
        if "error" in result or not result.get("response"):
            # Fallback response when AI is unavailable
            return {
                "response": f"I'm here to help with your career journey! Based on your profile, you're aiming to be a {student_data['career_goal']} with a score of {student_data['score']}/100. Focus on your skill gaps: {', '.join(gap_skills) if gap_skills else 'keep building'}. What specific area would you like guidance on?",
                "relevant_data": {"student_score": student_data["score"]}
            }
            
        return {
            "response": result["response"],
            "relevant_data": {
                "student_score": student_data["score"]
            }
        }
    except Exception as e:
        logger.error(f"Mentor chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/roadmap/{student_id}")
def get_roadmap(student_id: int, db: Session = Depends(get_db)):
    existing_roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.student_id == student_id).first()
    if existing_roadmap and existing_roadmap.roadmap_json:
        return existing_roadmap.roadmap_json
        
    profile = db.query(StudentProfile).filter(StudentProfile.student_id == student_id).first()
    gaps = db.query(SkillGap).filter(SkillGap.student_id == student_id).all()
    gap_skills = [g.skill_name for g in gaps]
    
    # Normally we'd call analyzer.generate_roadmap, but we can do it here or return mock/cached
    result = analyzer.generate_roadmap(profile.career_goal if profile else "Software Engineer", gap_skills)
    
    if "error" in result:
        # Mock fallback
        weeks = [
            {
                "week": 1,
                "title": "Foundations",
                "skills": ["System Design", "Database Design"],
                "resources": ["Grokking System Design", "..."],
                "project": "Design Twitter",
                "effort_hours": 10
            }
        ]
    else:
        weeks = result.get("weeks", [])
        
    roadmap_data = {
        "career_goal": profile.career_goal if profile else "Software Engineer",
        "weeks": weeks,
        "estimated_total_weeks": len(weeks) or 8,
        "estimated_placement_score": 85
    }
    
    new_roadmap = LearningRoadmap(
        student_id=student_id,
        career_goal=profile.career_goal if profile else "Software Engineer",
        roadmap_json=roadmap_data
    )
    db.add(new_roadmap)
    db.commit()
    
    return roadmap_data


@app.get("/api/admin/costs")
async def get_costs():
    tracker = QuotaTracker(Config.DATABASE_URL)
    daily = tracker.get_daily_cost()
    monthly = tracker.get_monthly_cost()
    return {
        "daily": {
            "spent": f"${daily:.2f}",
            "limit": f"${Config.DAILY_COST_LIMIT}",
            "percentage": (daily / Config.DAILY_COST_LIMIT) * 100 if Config.DAILY_COST_LIMIT else 0
        },
        "monthly": {
            "spent": f"${monthly:.2f}",
            "limit": f"${Config.MONTHLY_COST_LIMIT}",
            "percentage": (monthly / Config.MONTHLY_COST_LIMIT) * 100 if Config.MONTHLY_COST_LIMIT else 0
        },
        "status": "normal" if daily < Config.DAILY_COST_LIMIT else "using_fallback"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
