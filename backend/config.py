import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    """Application configuration"""
    
    # OpenRouter Settings
    OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY")
    OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions"
    
    # Model Configuration (Priority order)
    MODELS = {
        "primary": os.getenv("PRIMARY_MODEL", "mistralai/mistral-7b-instruct:free"),
        "fallback_1": os.getenv("FALLBACK_MODEL_1", "mistralai/mistral-7b-instruct:free"),
        "fallback_2": os.getenv("FALLBACK_MODEL_2", "huggingfaceh4/zephyr-7b-beta:free"),
        "fallback_3": os.getenv("FALLBACK_MODEL_3", "meta-llama/llama-3-8b-instruct:free")
    }
    
    # Cost limits (to prevent bill shock)
    DAILY_COST_LIMIT = 50  # $50 per day
    MONTHLY_COST_LIMIT = 500  # $500 per month
    
    # Quotas (requests per day)
    QUOTA_LIMITS = {
        "anthropic/claude-3.5-sonnet": 10000,  # Primary
        "mistralai/mistral-7b-instruct": -1,   # Unlimited (free)
        "gryphe/neuralchat-7b-v3-1": -1,       # Unlimited (free)
        "meta-llama/llama-2-7b-chat": -1       # Unlimited (free)
    }
    
    # Request timeout
    REQUEST_TIMEOUT = 30  # seconds
    
    # Database
    DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db") # Added sqlite fallback for easier testing
    
    # Logging
    LOG_LEVEL = "INFO"
    FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
