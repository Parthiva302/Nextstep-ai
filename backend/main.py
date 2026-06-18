# backend/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from config.settings import settings
from models.database import engine, Base
from middleware.metrics import metrics_middleware
from routers import auth, profile, analytics, mentor, roadmap, opportunities, achievements
from utils.logger import logger

# Initialize database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="NextStep AI",
    description="Your Next Step, Powered by AI - Career Intelligence Platform API",
    version="1.1.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Set to settings.FRONTEND_URL in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Custom performance timing middleware
app.middleware("http")(metrics_middleware)

# Register routers
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(analytics.router)
app.include_router(mentor.router)
app.include_router(roadmap.router)
app.include_router(opportunities.router)
app.include_router(achievements.router)

@app.get("/")
def root():
    return {
        "service": "NextStep AI",
        "status": "online",
        "version": "1.1.0"
    }

@app.get("/api/health")
def health():
    """Simple API health check endpoint."""
    return {"status": "healthy", "service": "nextstep-ai-api"}

@app.get("/api/admin/costs")
async def get_costs():
    """Mock cost administration route for checking OpenRouter quotas."""
    return {
        "daily_cost": 0.05,
        "monthly_cost": 1.20,
        "daily_limit": settings.DAILY_COST_LIMIT,
        "monthly_limit": settings.MONTHLY_COST_LIMIT,
        "status": "normal"
    }

logger.info("NextStep AI FastAPI application startup completed.")
