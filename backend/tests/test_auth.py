"""OIDC Keycloak authentication tests for Signal Console backend."""
import pytest
from httpx import ASGITransport, AsyncClient

from app.main import create_app


@pytest.fixture(scope="function")
def fresh_app():
    """Provide a fresh app instance per test."""
    return create_app()


@pytest.mark.asyncio
async def test_login_redirects_to_keycloak(fresh_app):
    """Test that /auth/login redirects to Keycloak authorization."""
    async with AsyncClient(transport=ASGITransport(app=fresh_app), base_url="http://test") as ac:
        response = await ac.get("/auth/login")
        # Should redirect to Keycloak authorization page (307 Temporary Redirect)
        assert response.status_code == 307


@pytest.mark.asyncio
async def test_unauthenticated_banks_endpoint_returns_error(fresh_app):
    """Test that /api/v1/banks/ without auth returns 401/403/422 not 307."""
    async with AsyncClient(transport=ASGITransport(app=fresh_app), base_url="http://test") as ac:
        response = await ac.get("/api/v1/banks/")
        # Without authentication, should return 401 or similar, NOT 307 redirect
        assert response.status_code in (401, 403, 422), (
            f"Expected 401/403/422 but got {response.status_code} - "
            "this may indicate session carry-over from previous test. "
            "Consider using separate ASGITransport instances."
        )


@pytest.mark.asyncio
async def test_health_endpoint_works(fresh_app):
    """Test that /health endpoint works."""
    async with AsyncClient(transport=ASGITransport(app=fresh_app), base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
