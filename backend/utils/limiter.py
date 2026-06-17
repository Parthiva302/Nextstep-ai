# backend/utils/limiter.py
import time
from collections import defaultdict
from fastapi import HTTPException, Request, status

class RateLimiter:
    """Sliding-window in-memory rate limiter to prevent spam attacks."""
    def __init__(self, requests_limit: int = 100, window_seconds: int = 60):
        self.requests_limit = requests_limit
        self.window_seconds = window_seconds
        self.history = defaultdict(list)

    def is_allowed(self, client_id: str) -> bool:
        now = time.time()
        # Clean up history to keep only request logs within window
        self.history[client_id] = [t for t in self.history[client_id] if now - t < self.window_seconds]
        
        if len(self.history[client_id]) >= self.requests_limit:
            return False
            
        self.history[client_id].append(now)
        return True

# Limit to 100 requests per minute per IP address
global_limiter = RateLimiter(requests_limit=100, window_seconds=60)

async def rate_limit_dependency(request: Request):
    client_ip = request.client.host if request.client else "unknown_ip"
    if not global_limiter.is_allowed(client_ip):
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail="Rate limit exceeded. Please try again in a minute."
        )
