from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "Signal Console"
    APP_VERSION: str = "1.0.0"
    ENVIRONMENT: str = "development"
    
    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./signal_console.db"
    
    # Frontend
    FRONTEND_URL: str = "http://127.0.0.1:5173"
    
    # Keycloak / OIDC
    KEYCLOAK_URL: str = "http://127.0.0.1:8080"
    KEYCLOAK_REALM: str = "signal-console"
    KEYCLOAK_CLIENT_ID: str = "signal-console-frontend"
    KEYCLOAK_CLIENT_SECRET: str = ""
    OIDC_DISCOVERY_URL: str = ""
    
    # Session
    SESSION_SECRET_KEY: str = "dev-secret-change-in-production"
    SESSION_COOKIE_NAME: str = "sc_session"
    SESSION_COOKIE_SECURE: bool = False
    SESSION_COOKIE_SAMESITE: str = "lax"
    
    # LLM
    LLM_API_KEY: Optional[str] = None
    LLM_PROVIDER: str = "openai-compatible"
    LLM_MODEL: str = "gpt-4o-mini"
    LLM_BASE_URL: Optional[str] = None
    
    # Demo mode (local only)
    DEMO_MODE: bool = True
    
    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        case_sensitive = True


settings = Settings()