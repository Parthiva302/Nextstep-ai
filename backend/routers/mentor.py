# backend/routers/mentor.py
import json
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from models.database import get_db
from models.schema import StudentProfile, ReadinessScore, SkillGap, ChatMessage
from services.ai_service import ai_service
from utils.logger import logger

router = APIRouter(prefix="/api", tags=["Mentor"])

class MentorChatRequest(BaseModel):
    student_id: str
    question: str

@router.post("/mentor/chat")
async def mentor_chat(req: MentorChatRequest, db: Session = Depends(get_db)):
    """Handles AI Career Coach Chat, queries student details, retrieves last 6 chat history messages, and writes response back to DB."""
    try:
        # Determine user ID format (UUID vs legacy integer)
        is_uuid = False
        try:
            from uuid import UUID
            UUID(req.student_id)
            is_uuid = True
        except ValueError:
            pass

        # 1. Fetch student data for context
        skills = []
        projects = []
        career_goal = "Software Engineer"
        score_val = 50
        gap_skills = []

        if not is_uuid:
            # Legacy integer ID
            int_id = int(req.student_id)
            profile = db.query(StudentProfile).filter(StudentProfile.student_id == int_id).first()
            score = db.query(ReadinessScore).filter(ReadinessScore.student_id == int_id).order_by(ReadinessScore.created_at.desc()).first()
            gaps = db.query(SkillGap).filter(SkillGap.student_id == int_id).all()
            gap_skills = [g.skill_name for g in gaps]
            
            if profile:
                career_goal = profile.career_goal or "Software Engineer"
                s_raw = profile.skills_json
                skills = json.loads(s_raw) if isinstance(s_raw, str) else (s_raw or [])
                p_raw = profile.projects_json
                projects = json.loads(p_raw) if isinstance(p_raw, str) else (p_raw or [])
            if score:
                score_val = score.total_score
        else:
            # Supabase UUID
            profile_sql = text("SELECT * FROM profiles WHERE user_id = :uid OR id = :uid LIMIT 1")
            profile_row = db.execute(profile_sql, {"uid": req.student_id}).mappings().first()
            if profile_row:
                career_goal = profile_row.get("career_goal") or "Software Engineer"
                s_data = profile_row.get("skills")
                if s_data:
                    skills = json.loads(s_data) if isinstance(s_data, str) else s_data
                    
            try:
                projects_sql = text("SELECT title FROM projects WHERE user_id = :uid")
                projects_rows = db.execute(projects_sql, {"uid": req.student_id}).mappings().all()
                projects = [p.get("title") for p in projects_rows]
            except Exception as e:
                logger.warning(f"Error fetching projects for chat: {e}")

            try:
                score_sql = text("SELECT total_score FROM readiness_scores WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1")
                score_row = db.execute(score_sql, {"uid": req.student_id}).mappings().first()
                if score_row:
                    score_val = score_row.get("total_score")
            except Exception as e:
                logger.warning(f"Error fetching score for chat: {e}")

            try:
                matches_sql = text("SELECT missing_skills FROM career_matches WHERE user_id = :uid AND career_name = :goal LIMIT 1")
                match_row = db.execute(matches_sql, {"uid": req.student_id, "goal": career_goal}).mappings().first()
                if match_row:
                    m_skills = match_row.get("missing_skills")
                    gap_skills = json.loads(m_skills) if isinstance(m_skills, str) else (m_skills or [])
            except Exception as e:
                logger.warning(f"Error fetching career gaps for chat: {e}")

        # Fallback gaps if empty
        if not gap_skills:
            target_skills = {
                "Software Engineer": ["System Design", "Docker", "AWS", "Kubernetes"],
                "AI Engineer": ["MLOps", "LangChain", "CUDA", "Hugging Face"],
                "Data Analyst": ["Power BI", "Tableau", "Spark", "Airflow"],
                "Cloud Engineer": ["Kubernetes", "Azure", "GCP", "Ansible"],
                "DevOps Engineer": ["Kubernetes", "Prometheus", "Grafana", "Helm"]
            }
            candidates = target_skills.get(career_goal, target_skills["Software Engineer"])
            gap_skills = [c for c in candidates if c not in skills]
        if not gap_skills:
            gap_skills = ["System Design", "Docker"]

        # 2. Save User Message to Database
        try:
            if is_uuid:
                db.execute(
                    text("INSERT INTO chat_messages (user_id, role, content, created_at) VALUES (:uid, 'user', :content, NOW())"),
                    {"uid": req.student_id, "content": req.question}
                )
            else:
                db.add(ChatMessage(student_id=int(req.student_id), role="user", content=req.question))
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to persist user chat message to database: {e}")

        # 3. Retrieve recent conversation history (last 6 messages) for context
        history_messages = []
        try:
            if is_uuid:
                history_rows = db.execute(
                    text("SELECT role, content FROM chat_messages WHERE user_id = :uid ORDER BY created_at ASC"),
                    {"uid": req.student_id}
                ).mappings().all()
                history_messages = [{"role": r["role"], "content": r["content"]} for r in history_rows[-6:]]
            else:
                history = db.query(ChatMessage).filter(ChatMessage.student_id == int(req.student_id)).order_by(ChatMessage.created_at.asc()).all()
                history_messages = [{"role": msg.role, "content": msg.content} for msg in history[-6:]]
        except Exception as e:
            logger.warning(f"Failed to fetch conversation history: {e}")

        # 4. Construct token-optimized system prompt
        system_prompt = f"""You are an elite AI Career Coach and Technical Mentor.
Profile details:
- NextStep Index: {score_val}/100
- Goal: {career_goal}
- Skills: {', '.join(skills[:10])}
- Projects: {', '.join(projects[:5])}
- Missing Skills to study: {', '.join(gap_skills[:5])}

Actionable rules:
- Refer to these details when answering.
- Keep responses compact, motivating, and extremely technical.
- Suggest projects targeting their missing skills if requested."""

        # Setup messages list
        messages = [{"role": "system", "content": system_prompt}]
        for hist_msg in history_messages:
            messages.append({"role": hist_msg["role"], "content": hist_msg["content"]})
        
        # Add current user prompt
        messages.append({"role": "user", "content": req.question})

        # Call OpenRouter
        response_text = ai_service.call_openrouter(messages, max_tokens=500, temperature=0.7)

        if not response_text:
            response_text = f"I'm here to support your progress! As an aspiring {career_goal} with an index of {score_val}/100, focus on learning {', '.join(gap_skills[:3])} and coding. What specific technical concepts can I explain?"

        # 5. Save Assistant Message Response to Database
        try:
            if is_uuid:
                db.execute(
                    text("INSERT INTO chat_messages (user_id, role, content, created_at) VALUES (:uid, 'assistant', :content, NOW())"),
                    {"uid": req.student_id, "content": response_text}
                )
            else:
                db.add(ChatMessage(student_id=int(req.student_id), role="assistant", content=response_text))
            db.commit()
        except Exception as e:
            logger.warning(f"Failed to persist assistant chat response to database: {e}")

        return {
            "response": response_text,
            "relevant_data": {
                "student_score": score_val
            }
        }
    except Exception as e:
        logger.error(f"Mentor chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Unable to process your chat question. Please try again.")
