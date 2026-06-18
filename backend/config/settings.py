# backend/config/settings.py
import os
from dotenv import load_dotenv

# Resolve the path to the .env file in the backend directory
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
dotenv_path = os.path.join(base_dir, '.env')
load_dotenv(dotenv_path=dotenv_path)

class Settings:
    """Application Settings"""
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
    
    # AI Models priorities
    MODELS = {
        "primary": os.getenv("PRIMARY_MODEL", "openrouter/free"),
        "fallback_1": os.getenv("FALLBACK_MODEL_1", "meta-llama/llama-3.3-70b-instruct:free"),
        "fallback_2": os.getenv("FALLBACK_MODEL_2", "google/gemma-4-31b-it:free"),
        "fallback_3": os.getenv("FALLBACK_MODEL_3", "qwen/qwen3-coder:free")
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
    
    # Supabase configuration
    SUPABASE_URL = os.getenv("SUPABASE_URL", "")
    SUPABASE_ANON_KEY = os.getenv("SUPABASE_ANON_KEY", "")
    SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")

    def validate(self):
        missing = []
        if not self.OPENROUTER_API_KEY:
            missing.append("OPENROUTER_API_KEY")
        if not self.DATABASE_URL or self.DATABASE_URL == "sqlite:///./test.db":
            # On Render, DATABASE_URL is strictly required
            if os.getenv("RENDER") or os.getenv("PORT"):
                missing.append("DATABASE_URL")
        if not self.SUPABASE_URL:
            missing.append("SUPABASE_URL")
        if not self.SUPABASE_ANON_KEY:
            missing.append("SUPABASE_ANON_KEY")
        if not self.SUPABASE_SERVICE_ROLE_KEY:
            missing.append("SUPABASE_SERVICE_ROLE_KEY")

        if missing:
            raise RuntimeError(
                f"Configuration Error: Missing required environment variables: {', '.join(missing)}. "
                f"Please ensure they are defined in your environment or .env file."
            )

settings = Settings()
settings.validate()
