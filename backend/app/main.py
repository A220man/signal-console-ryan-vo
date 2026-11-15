from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.core.database import init_db
from app.api import health, banks
from app.auth.auth_router import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await init_db()
    yield
    # Shutdown


def create_app() -> FastAPI:
    app = FastAPI(
        title="Signal Console",
        description="Signal Console — Agent Memory That Learns",
        version="1.0.0",
        lifespan=lifespan,
    )

    # CORS for frontend
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_URL],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    app.include_router(health.router)
    app.include_router(banks.router)
    app.include_router(auth_router)  # OIDC Keycloak auth routes

    return app


app = create_app()
