# backend/middleware/metrics.py
import time
from fastapi import Request
from utils.logger import logger

async def metrics_middleware(request: Request, call_next):
    """Timing middleware that logs request execution duration and inserts Server-Timing headers."""
    start_time = time.time()
    response = await call_next(request)
    duration = time.time() - start_time
    
    # Exclude logs for simple health check to avoid clogging logs
    if request.url.path != "/api/health":
        logger.info(f"{request.method} {request.url.path} - Completed in {duration * 1000:.2f}ms | Status: {response.status_code}")
        
    response.headers["Server-Timing"] = f"api;dur={duration * 1000:.2f}"
    return response
