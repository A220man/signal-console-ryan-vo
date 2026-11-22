from starlette import status
from typing import Optional
from fastapi import Request, HTTPException

from app.core.config import settings
from app.auth.user import User


async def get_current_user_from_cookie(request: Request) -> User:
    """Get current authenticated user from session cookie.
    
    This dependency extracts the user ID from the session cookie set during
    the Keycloak OAuth callback and returns a User model. If no valid session
    cookie is present, raises HTTP 401.
    """
    session_cookie_name = settings.SESSION_COOKIE_NAME
    
    # Try to get the session cookie from request cookies
    user_id = request.cookies.get(session_cookie_name)
    
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - no session cookie found",
        )
    
    # In a full implementation, we would verify the session against
    # Keycloak or a session store. For now, we return a minimal user
    # object from the cookie value.
    # TODO: Add proper session verification (e.g., JWT validation, 
    # session store lookup)
    return User(
        id=user_id,
        username=user_id,  # fallback
    )
