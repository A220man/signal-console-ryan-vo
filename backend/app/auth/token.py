import json
import time
from typing import Optional, Dict, Any

import httpx
from fastapi import Request, Response, HTTPException, status
from fastapi.responses import RedirectResponse

from app.core.config import settings
from app.auth.user import User, TokenResponse, TokenPayload


# Keycloak OAuth endpoints
AUTHORIZE_URL = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_CLIENT_ID}/protocol/openid-connect/auth"
TOKEN_URL = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_CLIENT_ID}/protocol/openid-connect/token"
USERINFO_URL = f"{settings.KEYCLOAK_URL}/realms/{settings.KEYCLOAK_CLIENT_ID}/protocol/openid-connect/userinfo"


async def authorize_url(redirect_uri: str, state: Optional[str] = None, code_challenge: Optional[str] = None) -> str:
    """Generate Keycloak authorization URL for login redirect."""
    params = {
        "client_id": settings.KEYCLOAK_CLIENT_ID,
        "redirect_uri": redirect_uri,
        "response_type": "code",
        "scope": "openid profile email",
    }
    if state:
        params["state"] = state
    if code_challenge:
        params["code_challenge"] = code_challenge
        params["code_challenge_method"] = "S256"
    
    from urllib.parse import urlencode
    query_string = urlencode(params)
    return f"{AUTHORIZE_URL}?{query_string}"


async def exchange_code_for_tokens(code: str, redirect_uri: str) -> TokenResponse:
    """Exchange authorization code for tokens from Keycloak."""
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            TOKEN_URL,
            data={
                "grant_type": "authorization_code",
                "client_id": settings.KEYCLOAK_CLIENT_ID,
                "client_secret": settings.KEYCLOAK_CLIENT_SECRET,
                "code": code,
                "redirect_uri": redirect_uri,
            },
            timeout=30.0,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to exchange authorization code: {resp.text}",
            )
        tokens = resp.json()
        return TokenResponse(**tokens)


async def fetch_user_info(access_token: str) -> User:
    """Fetch user info from Keycloak userinfo endpoint."""
    async with httpx.AsyncClient() as client:
        resp = await client.get(
            USERINFO_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            timeout=30.0,
        )
        if resp.status_code != 200:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Failed to fetch user info: {resp.text}",
            )
        payload = resp.json()
        return TokenPayload(**payload).to_user()
