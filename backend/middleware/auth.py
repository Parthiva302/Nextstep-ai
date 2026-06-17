# backend/middleware/auth.py
from fastapi import Request, HTTPException, status

async def verify_auth_token(request: Request):
    """
    Placeholder JWT validation middleware.
    In full production, this intercepts requests and validates the bearer token against Supabase Auth.
    """
    auth_header = request.headers.get("Authorization")
    if not auth_header:
        # In development/MVP mode, allow passing through.
        return True
        
    if not auth_header.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format. Expected: Bearer <token>"
        )
    
    # In production, call supabase.auth.get_user(token) to verify
    return True
