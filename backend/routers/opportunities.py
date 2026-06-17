# backend/routers/opportunities.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from models.database import get_db
from utils.logger import logger

router = APIRouter(prefix="/api", tags=["Opportunities"])

@router.get("/skills")
def get_all_skills(db: Session = Depends(get_db)):
    """Fetch the master database skill records list for dropdown selectors."""
    try:
        res = db.execute(text("SELECT id, skill_name, category, difficulty, demand_score FROM public.skills ORDER BY category, skill_name;"))
        skills = []
        for row in res:
            skills.append({
                "id": row[0],
                "skill_name": row[1],
                "category": row[2],
                "difficulty": row[3],
                "demand_score": row[4]
            })
        return skills
    except Exception as e:
        logger.error(f"Error fetching skills master records: {e}")
        # Return fallback items so user does not experience page crash
        return [
            {"id": 1, "skill_name": "React", "category": "Frontend", "difficulty": "Medium", "demand_score": 90},
            {"id": 2, "skill_name": "Python", "category": "Backend", "difficulty": "Easy", "demand_score": 95},
            {"id": 3, "skill_name": "FastAPI", "category": "Backend", "difficulty": "Medium", "demand_score": 85},
            {"id": 4, "skill_name": "PostgreSQL", "category": "Database", "difficulty": "Medium", "demand_score": 80}
        ]
