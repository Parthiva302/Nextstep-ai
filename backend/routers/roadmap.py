# backend/routers/roadmap.py
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.database import get_db
from models.schema import StudentProfile, SkillGap, LearningRoadmap
from services.ai_service import ai_service
from utils.logger import logger

router = APIRouter(prefix="/api", tags=["Roadmap"])

@router.get("/roadmap/{student_id}")
def get_roadmap(student_id: str, db: Session = Depends(get_db)):
    """Fetches or dynamically generates an 8-week learning roadmap based on student career goals and skill gaps."""
    try:
        is_int_id = False
        try:
            int_id = int(student_id)
            is_int_id = True
        except ValueError:
            pass

        # Check existing cached roadmap
        if is_int_id:
            existing_roadmap = db.query(LearningRoadmap).filter(LearningRoadmap.student_id == int_id).first()
            if existing_roadmap and existing_roadmap.roadmap_json:
                return existing_roadmap.roadmap_json
        else:
            try:
                # UUID check if table structure matches user_id, or return freshly generated
                pass
            except Exception as e:
                logger.warning(f"Error checking roadmap cache: {e}")

        # 1. Fetch student data for context
        career_goal = "Software Engineer"
        skills = []
        gap_skills = []

        if is_int_id:
            profile = db.query(StudentProfile).filter(StudentProfile.student_id == int_id).first()
            gaps = db.query(SkillGap).filter(SkillGap.student_id == int_id).all()
            gap_skills = [g.skill_name for g in gaps]
            if profile:
                career_goal = profile.career_goal or "Software Engineer"
        else:
            profile_sql = text("SELECT * FROM profiles WHERE user_id = :uid OR id = :uid LIMIT 1")
            profile_row = db.execute(profile_sql, {"uid": student_id}).mappings().first()

            if profile_row:
                career_goal = profile_row.get("career_goal") or "Software Engineer"
                s_data = profile_row.get("skills")
                if s_data:
                    skills = json.loads(s_data) if isinstance(s_data, str) else s_data

            try:
                matches_sql = text("SELECT missing_skills FROM career_matches WHERE user_id = :uid AND career_name = :goal LIMIT 1")
                match_row = db.execute(matches_sql, {"uid": student_id, "goal": career_goal}).mappings().first()
                if match_row:
                    m_skills = match_row.get("missing_skills")
                    gap_skills = json.loads(m_skills) if isinstance(m_skills, str) else (m_skills or [])
            except Exception as e:
                logger.warning(f"Error fetching career gaps for roadmap: {e}")

        # Fallbacks if empty
        if not gap_skills:
            target_skills = {
                "Software Engineer": ["System Design", "Docker", "AWS", "Kubernetes"],
                "AI Engineer": ["MLOps", "LangChain", "CUDA", "Hugging Face"],
                "Data Analyst": ["Power BI", "Tableau", "Spark", "Airflow"],
                "Cloud Engineer": ["Kubernetes", "Ansible", "Azure", "GCP"],
                "DevOps Engineer": ["Kubernetes", "Prometheus", "Grafana", "Helm"]
            }
            candidates = target_skills.get(career_goal, target_skills["Software Engineer"])
            gap_skills = [c for c in candidates if c not in skills]
        if not gap_skills:
            gap_skills = ["System Design", "Docker"]

        # Call AI service to generate learning path
        result = ai_service.generate_roadmap(career_goal, gap_skills)

        if "error" in result:
            # Sentry-free user-friendly fallback error state
            weeks = [
                {
                    "week": 1,
                    "title": "Foundations",
                    "skills": gap_skills[:2],
                    "resources": ["Official Documentation", "MDN Web Docs"],
                    "project": f"Build a {career_goal} starter application",
                    "effort_hours": 10
                }
            ]
        else:
            weeks = result.get("weeks", [])

        roadmap_data = {
            "career_goal": career_goal,
            "weeks": weeks,
            "estimated_total_weeks": len(weeks) or 8,
            "estimated_placement_score": 85
        }

        # Cache legacy integer ID roadmap
        if is_int_id:
            try:
                new_roadmap = LearningRoadmap(
                    student_id=int_id,
                    career_goal=career_goal,
                    roadmap_json=roadmap_data
                )
                db.add(new_roadmap)
                db.commit()
            except Exception as ex:
                db.rollback()
                logger.warning(f"Could not cache roadmap: {ex}")

        return roadmap_data
    except Exception as e:
        logger.error(f"Roadmap generation exception: {e}")
        raise HTTPException(status_code=500, detail="Unable to load roadmap data. Please try again.")
