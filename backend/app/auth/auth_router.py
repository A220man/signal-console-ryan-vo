from fastapi import APIRouter, Depends, Request, Response, HTTPException, status
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.auth.user import User, TokenResponse
from app.auth.token import authorize_url, exchange_code_for_tokens, fetch_user_info
from app.core.database import get_db
from sqlalchemy.ext.asyncio import AsyncSession

router = APIRouter(prefix="/auth", tags=["auth"])


@router.get("/login", include_in_schema=False)
async def login(request: Request, response: Response):
    """Initiate OIDC Keycloak login - redirect to Keycloak authorization page."""
    redirect_uri = settings.FRONTEND_URL + "/auth/callback"
    auth_url = await authorize_url(redirect_uri=redirect_uri)
    return RedirectResponse(url=auth_url)


@router.get("/callback", include_in_schema=False)
async def callback(
    request: Request,
    response: Response,
):
    """Handle Keycloak OAuth callback - exchange code for tokens, set session cookies."""
    code = request.query_params.get("code")
    state = request.query_params.get("state")
    
    if not code:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Authorization code not received from Keycloak",
        )
    
    # Exchange code for tokens
    tokens = await exchange_code_for_tokens(code=code, redirect_uri=settings.FRONTEND_URL + "/auth/callback")
    
    # Fetch user info using access token
    user = await fetch_user_info(access_token=tokens.access_token)
    
    # Set session cookie
    from datetime import timedelta, timezone
    
    # Session cookie settings
    session_max_age = 86400  # 24 hours
    session_cookie_max_age = session_max_age
    
    response.set_cookie(
        key=settings.SESSION_COOKIE_NAME,
        value=user.id,
        httponly=True,
        samesite=settings.SESSION_COOKIE_SAMESITE,
        secure=settings.SESSION_COOKIE_SECURE,
        path="/",
        max_age=session_cookie_max_age,
    )
    
    # Also set refresh token if present
    if tokens.refresh_token:
        response.set_cookie(
            key="sc_refresh_token",
            value=tokens.refresh_token,
            httponly=True,
            samesite="lax",
            secure=False,
            path="/",
            max_age=session_max_age,
        )
    
    # Redirect to frontend dashboard
    return RedirectResponse(url=settings.FRONTEND_URL + "/")
