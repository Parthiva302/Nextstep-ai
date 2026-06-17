# backend/routers/analytics.py
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from services.github_service import github_service
from services.leetcode_service import leetcode_service
from utils.logger import logger
from utils.limiter import rate_limit_dependency

router = APIRouter(prefix="/api", tags=["Analytics"])

class GitHubAnalyzeRequest(BaseModel):
    user_id: str
    github_username: str
    github_token: str = None

class LeetCodeAnalyzeRequest(BaseModel):
    user_id: str
    leetcode_username: str

@router.post("/github/analyze", dependencies=[Depends(rate_limit_dependency)])
async def analyze_github(data: GitHubAnalyzeRequest):
    """Triggers GitHub profile fetching, scores calculation, and updates database records."""
    try:
        username = data.github_username.strip()
        res = await github_service.analyze_profile(username)
        if "error" in res:
            raise HTTPException(status_code=400, detail=res["error"])
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"GitHub analysis route exception: {e}")
        raise HTTPException(status_code=500, detail="Unable to retrieve or analyze GitHub metrics. Please try again.")

@router.post("/leetcode/analyze", dependencies=[Depends(rate_limit_dependency)])
async def analyze_leetcode(data: LeetCodeAnalyzeRequest):
    """Triggers LeetCode GraphQL data fetching, solved metrics collection, and database syncs."""
    try:
        username = data.leetcode_username.strip()
        res = await leetcode_service.analyze_profile(username)
        if "error" in res or res.get("status") == "error":
            raise HTTPException(status_code=400, detail=res.get("error", "LeetCode sync failed"))
        return res
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"LeetCode analysis route exception: {e}")
        raise HTTPException(status_code=500, detail="Unable to retrieve or analyze LeetCode statistics. Please try again.")
