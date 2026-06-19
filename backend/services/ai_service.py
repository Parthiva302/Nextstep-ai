# backend/services/ai_service.py
import json
import requests
from typing import Dict, List
from config.settings import settings
from utils.caching import cache_manager
from utils.logger import logger

class AIService:
    """Handles communication with OpenRouter APIs, featuring model fallback, response caching, and prompt token optimizations."""
    def __init__(self):
        self.api_key = settings.OPENROUTER_API_KEY
        self.url = settings.OPENROUTER_URL
        self.models = settings.MODELS
        self.timeout = settings.REQUEST_TIMEOUT

    def get_model(self) -> str:
        return self.models["primary"]

    def call_openrouter(self, messages: List[Dict], max_tokens: int = 500, temperature: float = 0.7) -> tuple:
        # Check cache first using hashed message representation
        cache_key = f"ai_chat:{hash(json.dumps(messages, sort_keys=True))}"
        cached = cache_manager.get(cache_key)
        if cached:
            logger.info("AI response served from cache.")
            return cached, "cached"

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "HTTP-Referer": "https://nextstep-ai.vercel.app",
            "X-Title": "NextStep AI",
            "Content-Type": "application/json"
        }
        
        payload = {
            "messages": messages,
            "max_tokens": max_tokens,
            "temperature": temperature
        }

        # User-specified fallback order
        models_to_try = [
            "anthropic/claude-sonnet-4",
            "google/gemini-2.5-flash",
            "mistralai/mistral-small-3.1"
        ]

        last_error = "No models configured"
        for model in models_to_try:
            payload["model"] = model
            for attempt in range(1, 4):
                try:
                    logger.info(f"Querying OpenRouter model: {model} (Attempt {attempt}/3)")
                    # 15 second timeout as requested
                    res = requests.post(self.url, headers=headers, json=payload, timeout=15)
                    
                    if res.status_code == 200:
                        content = res.json()["choices"][0]["message"]["content"]
                        # Cache positive results for 30 minutes to reduce token costs
                        cache_manager.set(cache_key, content, ttl_seconds=1800)
                        return content, model
                    
                    # Handle rate limit (429) or other API errors
                    last_error = f"Status {res.status_code}: {res.text}"
                    logger.warning(
                        f"Model {model} attempt {attempt}/3 failed with status {res.status_code}. "
                        f"Response: {res.text}"
                    )
                    
                    # Non-transient errors (like 404 or 400) don't benefit from retries
                    if res.status_code in [400, 404]:
                        break
                        
                except requests.Timeout as e:
                    last_error = f"Timeout: {e}"
                    logger.error(f"Model {model} attempt {attempt}/3 timed out.")
                except Exception as e:
                    last_error = f"Exception: {e}"
                    logger.error(f"Model {model} attempt {attempt}/3 failed with exception: {e}")
                
                # Backoff before retrying
                if attempt < 3:
                    import time
                    time.sleep(1)
            
            logger.warning(f"Model {model} exhausted all 3 attempts. Trying next fallback model...")

        logger.error(f"All OpenRouter models failed. Last error: {last_error}")
        return None, None

    def analyze_resume(self, resume_text: str) -> Dict:
        """Token-optimized prompt to analyze resume structure."""
        prompt = f"""Analyze this resume text. Output ONLY valid JSON. No backticks, markdown, or text outside the JSON block.
JSON format:
{{
  "skills": ["React", "Python"],
  "resume_score": 85,
  "ats_score": 80,
  "missing_keywords": ["Docker", "Kubernetes"],
  "improvements": ["Add project link"],
  "suggested_projects": ["Build REST API in FastAPI"],
  "suggested_certifications": ["AWS Certified Developer"]
}}
Resume:
{resume_text}"""

        messages = [{"role": "user", "content": prompt}]
        response_text, model_used = self.call_openrouter(messages, max_tokens=600, temperature=0.3)
        
        if not response_text:
            return {"error": "AI service unavailable"}
            
        try:
            cleaned = response_text.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse resume JSON. Raw output: {response_text}. Error: {e}")
            return {"error": "Failed to parse AI resume analysis response"}

    def generate_roadmap(self, career_goal: str, skill_gaps: List[str]) -> Dict:
        """Token-optimized learning roadmap prompt."""
        prompt = f"""Create an 8-week roadmap for goal: {career_goal} to address gaps: {', '.join(skill_gaps)}.
Output ONLY a valid JSON object matching this schema. No markdown formatting.
Schema:
{{
  "weeks": [
    {{
      "week": 1,
      "title": "Topic overview",
      "skills": ["skill1"],
      "resources": ["resource link/doc"],
      "project": "Mini project title",
      "effort_hours": 10
    }}
  ]
}}"""

        messages = [{"role": "user", "content": prompt}]
        response_text, model_used = self.call_openrouter(messages, max_tokens=1500, temperature=0.4)
        
        if not response_text:
            return {"error": "AI service unavailable"}
            
        try:
            cleaned = response_text.strip().replace("```json", "").replace("```", "").strip()
            return json.loads(cleaned)
        except Exception as e:
            logger.error(f"Failed to parse roadmap JSON. Raw: {response_text}. Error: {e}")
            return {"error": "Failed to parse AI learning roadmap response"}

ai_service = AIService()
