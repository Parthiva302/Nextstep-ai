# backend/routers/mentor.py
import json
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from pydantic import BaseModel
from models.database import get_db
from models.schema import Student, StudentProfile, ReadinessScore, SkillGap, ChatMessage
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
        student_name = "Student"
        skills = []
        projects = []
        career_goal = "Software Engineer"
        score_val = 50
        resume_score_val = 0
        github_stats_str = "No GitHub stats linked"
        leetcode_stats_str = "No LeetCode stats linked"
        gap_skills = []

        if not is_uuid:
            # Legacy integer ID
            int_id = int(req.student_id)
            student_obj = db.query(Student).filter(Student.id == int_id).first()
            profile = db.query(StudentProfile).filter(StudentProfile.student_id == int_id).first()
            score = db.query(ReadinessScore).filter(ReadinessScore.student_id == int_id).order_by(ReadinessScore.created_at.desc()).first()
            gaps = db.query(SkillGap).filter(SkillGap.student_id == int_id).all()
            gap_skills = [g.skill_name for g in gaps]
            
            if student_obj:
                student_name = student_obj.name or "Student"
            if profile:
                career_goal = profile.career_goal or "Software Engineer"
                s_raw = profile.skills_json
                skills = json.loads(s_raw) if isinstance(s_raw, str) else (s_raw or [])
                p_raw = profile.projects_json
                projects = json.loads(p_raw) if isinstance(p_raw, str) else (p_raw or [])
            if score:
                score_val = score.total_score or 50
                resume_score_val = score.resume_score or 0
        else:
            # Supabase UUID
            profile_sql = text("SELECT * FROM profiles WHERE user_id = :uid OR id = :uid LIMIT 1")
            profile_row = db.execute(profile_sql, {"uid": req.student_id}).mappings().first()
            if profile_row:
                student_name = profile_row.get("full_name") or "Student"
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
                score_sql = text("SELECT total_score, resume_score FROM readiness_scores WHERE user_id = :uid ORDER BY created_at DESC LIMIT 1")
                score_row = db.execute(score_sql, {"uid": req.student_id}).mappings().first()
                if score_row:
                    score_val = score_row.get("total_score") or 50
                    resume_score_val = score_row.get("resume_score") or 0
            except Exception as e:
                logger.warning(f"Error fetching score for chat: {e}")

            # Fetch GitHub Stats
            try:
                gh_sql = text("SELECT github_score, public_repos, total_stars, active_repos, languages FROM github_stats WHERE user_id = :uid LIMIT 1")
                gh_row = db.execute(gh_sql, {"uid": req.student_id}).mappings().first()
                if gh_row:
                    langs = gh_row.get("languages") or []
                    if isinstance(langs, str):
                        langs = json.loads(langs)
                    github_stats_str = (
                        f"Score: {gh_row.get('github_score') or 0}, "
                        f"Repos: {gh_row.get('public_repos') or 0}, "
                        f"Stars: {gh_row.get('total_stars') or 0}, "
                        f"Active Repos: {gh_row.get('active_repos') or 0}, "
                        f"Languages: {', '.join(langs[:5])}"
                    )
            except Exception as e:
                logger.warning(f"Error fetching github stats for chat: {e}")

            # Fetch LeetCode Stats
            try:
                lc_sql = text("SELECT leetcode_score, total_solved, easy_solved, medium_solved, hard_solved, ranking FROM leetcode_stats WHERE user_id = :uid LIMIT 1")
                lc_row = db.execute(lc_sql, {"uid": req.student_id}).mappings().first()
                if lc_row:
                    leetcode_stats_str = (
                        f"Score: {lc_row.get('leetcode_score') or 0}, "
                        f"Solved: {lc_row.get('total_solved') or 0} "
                        f"(Easy: {lc_row.get('easy_solved') or 0}, "
                        f"Medium: {lc_row.get('medium_solved') or 0}, "
                        f"Hard: {lc_row.get('hard_solved') or 0}), "
                        f"Ranking: {lc_row.get('ranking') or 'N/A'}"
                    )
            except Exception as e:
                logger.warning(f"Error fetching leetcode stats for chat: {e}")

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
        system_prompt = f"""You are NextStep AI's elite AI Career Coach and Technical Mentor.
Profile details of the student you are helping:
- Student Name: {student_name}
- Career Goal: {career_goal}
- Placement Readiness Score: {score_val}/100
- Resume Quality Score: {resume_score_val}/100
- Skills: {', '.join(skills[:15]) if skills else 'None added'}
- Projects: {', '.join(projects[:5]) if projects else 'None added'}
- GitHub Stats: {github_stats_str}
- LeetCode Stats: {leetcode_stats_str}
- Missing Skills to study: {', '.join(gap_skills[:5]) if gap_skills else 'None identified'}

Actionable rules:
- Address the student by their Name ({student_name}) when appropriate to personalize the response.
- Directly reference their specific skills, projects, and readiness index in your advice.
- If they have weaknesses in coding, projects, or resume scores, give concrete recommendations to raise them.
- Keep responses compact, motivating, professional, and extremely technical.
- Suggest projects targeting their missing skills if requested."""

        # Setup messages list
        messages = [{"role": "system", "content": system_prompt}]
        for hist_msg in history_messages:
            messages.append({"role": hist_msg["role"], "content": hist_msg["content"]})
        
        # Add current user prompt
        messages.append({"role": "user", "content": req.question})

        # Call OpenRouter
        response_text, model_used = ai_service.call_openrouter(messages, max_tokens=500, temperature=0.7)

        if not response_text:
            return {
                "success": False,
                "error": "All OpenRouter models failed to respond. Please try again later."
            }

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
            "success": True,
            "response": response_text,
            "model_used": model_used,
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Mentor chat endpoint error: {e}")
        return {
            "success": False,
            "error": "Internal server error while processing your request. Please try again."
        }
