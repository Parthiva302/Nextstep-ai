# backend/config/settings.py
import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    """Application Settings"""
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
    
    # AI Models priorities
    MODELS = {
        "primary": os.getenv("PRIMARY_MODEL", "google/gemma-2-9b-it:free"),
        "fallback_1": os.getenv("FALLBACK_MODEL_1", "google/gemma-2-9b-it:free"),
        "fallback_2": os.getenv("FALLBACK_MODEL_2", "meta-llama/llama-3-8b-instruct:free"),
        "fallback_3": os.getenv("FALLBACK_MODEL_3", "mistralai/mistral-7b-instruct:free")
    }
    
    DAILY_COST_LIMIT = 50  # $50 limit
    MONTHLY_COST_LIMIT = 500  # $500 limit
    
    QUOTA_LIMITS = {
        "anthropic/claude-3.5-sonnet": 10000,
        "google/gemma-2-9b-it": -1,
        "meta-llama/llama-3-8b-instruct": -1,
        "mistralai/mistral-7b-instruct": -1
    }
    
    REQUEST_TIMEOUT = 30  # seconds
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
    LOG_LEVEL = "INFO"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
    GITHUB_TOKEN = os.getenv("GITHUB_TOKEN", "")

settings = Settings()
