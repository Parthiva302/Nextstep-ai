import requests
import json
import logging
import os
from typing import Dict, Optional, Tuple
from datetime import datetime, timedelta

logger = logging.getLogger(__name__)

from config import Config
from models.quota_tracker import QuotaTracker

class SmartAIAnalyzer:
    """
    Smart AI analyzer that:
    1. Uses primary model (Claude Sonnet)
    2. Tracks quota/cost
    3. Switches to free fallback if quota exceeded
    4. Ensures always has a working model
    """
    
    def __init__(self):
        self.api_key = Config.OPENROUTER_API_KEY
        self.url = Config.OPENROUTER_URL
        self.models = Config.MODELS
        self.quota_tracker = QuotaTracker(Config.DATABASE_URL)
        self.cost_limits = {
            "daily": Config.DAILY_COST_LIMIT,
            "monthly": Config.MONTHLY_COST_LIMIT
        }
    
    def get_next_available_model(self) -> str:
        """Get next available model (with fallback chain)"""
        
        # Check daily cost limit
        daily_cost = self.quota_tracker.get_daily_cost()
        if daily_cost >= self.cost_limits["daily"]:
            logger.warning(f"Daily cost limit reached (${daily_cost:.2f})")
            return self.models["fallback_1"]  # Switch to free
        
        # Check monthly cost limit
        monthly_cost = self.quota_tracker.get_monthly_cost()
        if monthly_cost >= self.cost_limits["monthly"]:
            logger.warning(f"Monthly cost limit reached (${monthly_cost:.2f})")
            return self.models["fallback_1"]  # Switch to free
        
        # Try primary model first (Claude Sonnet)
        return self.models["primary"]
    
    def call_openrouter(self, messages: list, model: str = None, 
                       max_tokens: int = 800, temperature: float = 0.7) -> Tuple[str, Dict]:
        """
        Call OpenRouter API with fallback logic
        
        Returns:
            (response_text, metadata)
        """
        
        if model is None:
            model = self.get_next_available_model()
        
        metadata = {
            "model_requested": self.models["primary"],
            "model_used": model,
            "tokens_input": 0,
            "tokens_output": 0,
            "cost": 0.0,
            "status": "error",
            "error_message": None
        }
        
        try:
            logger.info(f"Calling OpenRouter with model: {model}")
            
            response = requests.post(
                self.url,
                headers={
                    "Authorization": f"Bearer {self.api_key}",
                    "HTTP-Referer": "https://nextestep-ai.vercel.app",
                    "X-Title": "NextStep AI",
                    "Content-Type": "application/json"
                },
                json={
                    "model": model,
                    "messages": messages,
                    "max_tokens": max_tokens,
                    "temperature": temperature
                },
                timeout=Config.REQUEST_TIMEOUT
            )
            
            # Handle different status codes
            if response.status_code == 429:  # Rate limit / Quota exceeded
                logger.warning(f"Quota exceeded for {model}. Switching to fallback.")
                metadata["error_message"] = "Quota exceeded, using fallback model"
                
                # Try fallback models
                for fallback_key in ["fallback_1", "fallback_2", "fallback_3"]:
                    fallback_model = self.models[fallback_key]
                    logger.info(f"Trying fallback: {fallback_model}")
                    
                    try:
                        return self.call_openrouter(
                            messages=messages,
                            model=fallback_model,
                            max_tokens=max_tokens,
                            temperature=temperature
                        )
                    except Exception as e:
                        logger.warning(f"Fallback {fallback_model} failed: {e}")
                        continue
                
                # All models failed
                return None, metadata
            
            elif response.status_code == 401:  # Unauthorized (bad API key)
                logger.error("Invalid API key")
                metadata["error_message"] = "Invalid API key"
                return None, metadata
            
            elif response.status_code == 500:  # Server error
                logger.error(f"OpenRouter server error: {response.text}")
                metadata["error_message"] = "Server error, retrying with fallback"
                
                # Try fallback
                fallback_model = self.models["fallback_1"]
                try:
                    return self.call_openrouter(
                        messages=messages,
                        model=fallback_model,
                        max_tokens=max_tokens,
                        temperature=temperature
                    )
                except:
                    return None, metadata
            
            elif response.status_code != 200:
                logger.error(f"API error {response.status_code}: {response.text}")
                metadata["error_message"] = f"API error: {response.status_code}"
                return None, metadata
            
            # Success
            result = response.json()
            
            # Extract response
            content = result["choices"][0]["message"]["content"]
            
            # Calculate tokens and cost
            tokens_input = result.get("usage", {}).get("prompt_tokens", 0)
            tokens_output = result.get("usage", {}).get("completion_tokens", 0)
            
            cost = self.calculate_cost(model, tokens_input, tokens_output)
            
            metadata.update({
                "model_used": model,
                "tokens_input": tokens_input,
                "tokens_output": tokens_output,
                "cost": cost,
                "status": "success",
                "error_message": None
            })
            
            # Log usage for tracking
            self.quota_tracker.log_usage(
                model=model,
                tokens_input=tokens_input,
                tokens_output=tokens_output,
                cost=cost,
                status="success"
            )
            
            logger.info(f"✓ API call successful. Model: {model}, Cost: ${cost:.4f}")
            
            return content, metadata
        
        except requests.exceptions.Timeout:
            logger.error("API request timeout")
            metadata["error_message"] = "Request timeout"
            
            # Fallback
            try:
                return self.call_openrouter(
                    messages=messages,
                    model=self.models["fallback_1"],
                    max_tokens=max_tokens,
                    temperature=temperature
                )
            except:
                return None, metadata
        
        except requests.exceptions.RequestException as e:
            logger.error(f"Request error: {e}")
            metadata["error_message"] = str(e)
            return None, metadata
        
        except Exception as e:
            logger.error(f"Unexpected error: {e}")
            metadata["error_message"] = str(e)
            return None, metadata
    
    @staticmethod
    def calculate_cost(model: str, tokens_input: int, tokens_output: int) -> float:
        """Calculate cost of API call based on model and tokens"""
        
        # Pricing per model (per 1M tokens)
        pricing = {
            "anthropic/claude-3.5-sonnet": {
                "input": 0.003,
                "output": 0.015
            },
            "mistralai/mistral-7b-instruct": {
                "input": 0.0001,
                "output": 0.0001
            },
            "gryphe/neuralchat-7b-v3-1": {
                "input": 0.0,  # FREE
                "output": 0.0  # FREE
            },
            "meta-llama/llama-2-7b-chat": {
                "input": 0.0,  # FREE
                "output": 0.0  # FREE
            }
        }
        
        if model not in pricing:
            return 0.0
        
        price = pricing[model]
        input_cost = (tokens_input / 1_000_000) * price["input"]
        output_cost = (tokens_output / 1_000_000) * price["output"]
        
        return input_cost + output_cost
    
    def analyze_resume(self, resume_text: str) -> Dict:
        """Analyze resume with automatic fallback"""
        
        prompt = f"""You are an expert resume reviewer and career coach. Analyze the following resume and return ONLY a valid JSON object with NO markdown, NO backticks, and NO preamble.

Resume text:
{resume_text}

Return ONLY this JSON structure exactly:
{{
  "skills": ["skill1", "skill2", ...],
  "resume_score": <0-100>,
  "ats_score": <0-100>,
  "missing_keywords": ["keyword1", "keyword2", ...],
  "improvements": ["improvement1", "improvement2", ...],
  "suggested_projects": ["project1", "project2", ...],
  "suggested_certifications": ["cert1", "cert2", ...]
}}
Return ONLY the JSON, nothing else."""
        
        messages = [{"role": "user", "content": prompt}]
        
        response_text, metadata = self.call_openrouter(
            messages=messages,
            max_tokens=800
        )
        
        if response_text is None:
            return {
                "error": "Failed to analyze resume",
                "metadata": metadata
            }
        
        try:
            # Clean and parse JSON
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            
            analysis = json.loads(cleaned)
            analysis["metadata"] = metadata
            return analysis
        
        except json.JSONDecodeError:
            logger.error(f"Failed to parse response: {response_text[:200]}")
            return {
                "error": "Failed to parse AI response",
                "metadata": metadata
            }
    
    def chat_mentor(self, student_data: Dict, question: str) -> Dict:
        """Chat with AI mentor with automatic fallback"""
        
        system_prompt = f"""You are an elite AI Career Coach and Technical Mentor for a university student.

Here is the student's complete profile context:
- NextStep Readiness Score: {student_data.get('score', 'Unknown')}/100
- Target Career Goal: {student_data.get('career_goal', 'Unknown')}
- Known Technical Skills: {', '.join(student_data.get('skills', []))}
- Current Projects: {', '.join(student_data.get('projects', []))}
- Critical Skill Gaps: {', '.join(student_data.get('gaps', []))}

Your goal is to provide highly actionable, concise, and personalized guidance. 
If they ask about their resume, reference their skills and gaps.
If they ask for project ideas, suggest projects that fill their skill gaps.
Do not use generic advice. Always tie your answer back to their specific Career Goal and current Skills."""
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question}
        ]
        
        response_text, metadata = self.call_openrouter(
            messages=messages,
            max_tokens=500,
            temperature=0.8
        )
        
        if response_text is None:
            return {
                "error": "Failed to get mentor response",
                "metadata": metadata
            }
        
        return {
            "response": response_text,
            "metadata": metadata
        }
    
    def generate_roadmap(self, career_goal: str, skill_gaps: list) -> Dict:
        """Generate learning roadmap with automatic fallback"""
        
        prompt = f"""Create an 8-week personalized learning roadmap for a student.

Career Goal: {career_goal}
Current Skill Gaps: {', '.join(skill_gaps)}

Return ONLY this JSON (no markdown, no backticks):
{{
  "weeks": [
    {{
      "week": 1,
      "title": "Week title",
      "skills": ["skill1", "skill2"],
      "resources": ["resource1", "resource2"],
      "project": "Project name",
      "effort_hours": 10
    }}
  ]
}}

Return ONLY the JSON."""
        
        messages = [{"role": "user", "content": prompt}]
        
        response_text, metadata = self.call_openrouter(
            messages=messages,
            max_tokens=2000
        )
        
        if response_text is None:
            return {
                "error": "Failed to generate roadmap",
                "metadata": metadata
            }
        
        try:
            cleaned = response_text.strip()
            if cleaned.startswith("```"):
                cleaned = cleaned.split("```")[1]
                if cleaned.startswith("json"):
                    cleaned = cleaned[4:]
            
            roadmap = json.loads(cleaned)
            roadmap["metadata"] = metadata
            return roadmap
        
        except json.JSONDecodeError:
            return {
                "error": "Failed to parse roadmap",
                "metadata": metadata
            }
