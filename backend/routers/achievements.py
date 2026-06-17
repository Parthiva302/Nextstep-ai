# backend/routers/achievements.py
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.database import get_db
from models.schema import ReadinessScore, SkillGap, StudentProfile
from services.career_match import calculate_career_match
from utils.logger import logger

router = APIRouter(prefix="/api", tags=["Achievements"])

@router.get("/score/{student_id}")
def get_score(student_id: str, db: Session = Depends(get_db)):
    """Retrieve placement readiness score index and explanation categories."""
    try:
        is_int_id = False
        try:
            int_id = int(student_id)
            is_int_id = True
        except ValueError:
            pass

        if is_int_id:
            score = db.query(ReadinessScore).filter(ReadinessScore.student_id == int_id).order_by(ReadinessScore.created_at.desc()).first()
        else:
            score_sql = text("SELECT * FROM readiness_scores WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1")
            score_row = db.execute(score_sql, {"uid": student_id}).mappings().first()
            score = score_row

        if not score:
            raise HTTPException(status_code=404, detail="Readiness score not found. Please upload resume and complete profile first.")

        if is_int_id:
            breakdown = {
                "academic": score.academic_score,
                "coding": score.coding_score,
                "projects": score.project_score,
                "skills": score.skill_score,
                "resume": score.resume_score
            }
            strengths = score.strengths if score.strengths else ["Keep building your profile!"]
            weaknesses = score.weaknesses if score.weaknesses else ["Looking great overall!"]
            total_score = score.total_score
        else:
            breakdown = {
                "academic": score.get("academic_score", 0),
                "coding": score.get("coding_score", 0),
                "projects": score.get("project_score", 0),
                "skills": score.get("skill_score", 0),
                "resume": score.get("resume_score", 0)
            }
            s_data = score.get("strengths")
            strengths = json.loads(s_data) if isinstance(s_data, str) else (s_data or ["Keep building your profile!"])
            w_data = score.get("weaknesses")
            weaknesses = json.loads(w_data) if isinstance(w_data, str) else (w_data or ["Looking great overall!"])
            total_score = score.get("total_score", 0)

        return {
            "total_score": total_score,
            "breakdown": breakdown,
            "strengths": strengths,
            "weaknesses": weaknesses,
            "next_actions": ["Upload your resume for AI analysis", "Chat with your AI mentor", "Practice mock interviews"]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting readiness score: {e}")
        raise HTTPException(status_code=500, detail="Unable to load score data. Please try again.")

@router.get("/skill-gaps/{student_id}")
def get_skill_gaps(student_id: str, db: Session = Depends(get_db)):
    """Retrieve technical skill gaps and priority lists."""
    try:
        is_int_id = False
        try:
            int_id = int(student_id)
            is_int_id = True
        except ValueError:
            pass

        if is_int_id:
            gaps = db.query(SkillGap).filter(SkillGap.student_id == int_id).all()
            result = [{"skill": g.skill_name, "priority": g.priority} for g in gaps]
        else:
            profile_sql = text("SELECT career_goal, skills FROM profiles WHERE user_id = :uid LIMIT 1")
            profile = db.execute(profile_sql, {"uid": student_id}).mappings().first()
            if not profile:
                return {"gaps": [], "total_gaps": 0, "critical_gaps": 0}

            career_goal = profile.get("career_goal") or "Software Engineer"
            skills_data = profile.get("skills")
            skills = json.loads(skills_data) if isinstance(skills_data, str) else (skills_data or [])

            matches_sql = text("SELECT missing_skills FROM career_matches WHERE user_id = :uid AND career_name = :goal LIMIT 1")
            match_row = db.execute(matches_sql, {"uid": student_id, "goal": career_goal}).mappings().first()
            gap_list = []
            if match_row:
                m_skills = match_row.get("missing_skills")
                gap_list = json.loads(m_skills) if isinstance(m_skills, str) else (m_skills or [])
            
            if not gap_list:
                target_skills = {
                    "Software Engineer": ["System Design", "Docker", "AWS", "Kubernetes"],
                    "AI Engineer": ["MLOps", "LangChain", "CUDA", "Hugging Face"],
                    "Data Analyst": ["Power BI", "Tableau", "Spark", "Airflow"]
                }
                candidates = target_skills.get(career_goal, target_skills["Software Engineer"])
                gap_list = [c for c in candidates if c not in skills]

            result = [{"skill": skill, "priority": 1 if idx < 2 else 2} for idx, skill in enumerate(gap_list)]

        return {
            "gaps": result,
            "total_gaps": len(result),
            "critical_gaps": len([g for g in result if g["priority"] == 1])
        }
    except Exception as e:
        logger.error(f"Error getting skill gaps: {e}")
        raise HTTPException(status_code=500, detail="Unable to load skill gaps. Please try again.")

@router.get("/career-match/{student_id}")
def get_career_match(student_id: str, db: Session = Depends(get_db)):
    """Retrieve detailed matching statistics across standard careers."""
    try:
        is_int_id = False
        try:
            int_id = int(student_id)
            is_int_id = True
        except ValueError:
            pass

        if is_int_id:
            profile = db.query(StudentProfile).filter(StudentProfile.student_id == int_id).first()
            if not profile:
                raise HTTPException(status_code=404, detail="Profile not found")
            skills_raw = profile.skills_json if profile and profile.skills_json else "[]"
            skills = json.loads(skills_raw) if isinstance(skills_raw, str) else (skills_raw or [])
            career_goal = profile.career_goal or "Software Engineer"
        else:
            profile_sql = text("SELECT career_goal, skills FROM profiles WHERE user_id = :uid LIMIT 1")
            profile_row = db.execute(profile_sql, {"uid": student_id}).mappings().first()
            if not profile_row:
                raise HTTPException(status_code=404, detail="Profile not found")
            career_goal = profile_row.get("career_goal") or "Software Engineer"
            s_data = profile_row.get("skills")
            skills = json.loads(s_data) if isinstance(s_data, str) else (s_data or [])

        matches = calculate_career_match(skills, career_goal)
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
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error calculating career match: {e}")
        raise HTTPException(status_code=500, detail="Unable to load career match. Please try again.")
