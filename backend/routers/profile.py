# backend/routers/profile.py
import json
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Dict
from models.database import get_db
from models.schema import Student, StudentProfile, ReadinessScore, SkillGap
from services.nextstep_score import calculate_nextstep_score
from services.resume_service import resume_service
from utils.logger import logger

router = APIRouter(tags=["Profile"])

class StudentCreate(BaseModel):
    email: str
    name: str
    cgpa: float
    coding_score: int
    projects: List[str]
    skills: List[str]
    career_goal: str

@router.post("/api/students", status_code=201)
def create_student(data: StudentCreate, db: Session = Depends(get_db)):
    """Creates a new student record, profile configuration, and calculates initial readiness score."""
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
        skill_score = 80 
        resume_score = 70 

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

        # Calculate initial skill gaps
        mock_gaps = [{"skill": "System Design", "priority": 1}, {"skill": "Communication", "priority": 2}]
        for gap in mock_gaps:
            db.add(SkillGap(student_id=new_student.id, skill_name=gap["skill"], priority=gap["priority"]))

        db.commit()
        return {"id": new_student.id, "email": new_student.email, "message": "Profile created successfully"}
        
    except Exception as e:
        db.rollback()
        logger.error(f"Error creating student: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/api/students/{student_id}")
def get_student(student_id: str, db: Session = Depends(get_db)):
    """Retrieve full student record."""
    try:
        # Check integer id fallback
        try:
            int_id = int(student_id)
            student = db.query(Student).filter(Student.id == int_id).first()
        except ValueError:
            # Match UUID column in profiles
            from sqlalchemy import text
            sql = text("SELECT * FROM profiles WHERE user_id = :uid OR id = :uid LIMIT 1")
            row = db.execute(sql, {"uid": student_id}).mappings().first()
            if row:
                return {
                    "id": student_id,
                    "email": row.get("email"),
                    "name": row.get("full_name") or "User",
                    "github_username": row.get("github_username"),
                    "leetcode_username": row.get("leetcode_username")
                }
            student = None

        if not student:
            raise HTTPException(status_code=404, detail="Student not found")
            
        return {
            "id": student.id,
            "email": student.email,
            "name": student.name,
            "github_username": student.github_username,
            "leetcode_username": getattr(student, "leetcode_username", None)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching student: {e}")
        raise HTTPException(status_code=500, detail="Unable to retrieve profile details")

@router.post("/api/analyze")
async def analyze_resume(student_id: str, file: UploadFile = File(...), db: Session = Depends(get_db)):
    """Receives resume PDF file, parses text, and runs AI ATS scoring evaluation."""
    try:
        # Validate format (Enforce PDF only)
        filename = file.filename or ""
        content_type = file.content_type or ""
        if not filename.lower().endswith(".pdf") and "pdf" not in content_type.lower():
            raise HTTPException(status_code=400, detail="Only PDF files are accepted. Please upload a .pdf file.")

        contents = await file.read()
        if len(contents) > 5 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="File too large. Maximum size is 5MB.")

        # PDF Parsing & AI Evaluation
        res = resume_service.parse_and_analyze(contents)
        
        if "error" in res or not res.get("analysis") or "error" in res["analysis"]:
            # Fallback to local heuristic estimation if AI is busy
            word_count = len(res.get("text", "").split())
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

        analysis = res["analysis"]
        return {
            "resume_score": analysis.get("resume_score", 70),
            "ats_score": analysis.get("ats_score", 65),
            "skills": analysis.get("skills", []),
            "missing_keywords": analysis.get("missing_keywords", []),
            "improvements": analysis.get("improvements", []),
            "suggested_projects": analysis.get("suggested_projects", []),
            "suggested_certifications": analysis.get("suggested_certifications", [])
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Resume analysis error: {e}")
        raise HTTPException(status_code=500, detail="Unable to parse or analyze resume. Please try again.")
