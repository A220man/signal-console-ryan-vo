from typing import Optional
from pydantic import BaseModel, Field


class User(BaseModel):
    """User model representing an authenticated user from Keycloak."""
    id: str = Field(..., description="Keycloak user UUID")
    username: str = Field(..., description="User display name or username")
    email: Optional[str] = Field(None, description="User email address")
    full_name: Optional[str] = Field(None, description="User full name")
    realm_access: Optional[list] = Field(None, description="Realm-level roles")
    resource_access: Optional[dict] = Field(None, description="Client-level roles")
    updated: Optional[str] = Field(None, description="Last update timestamp from Keycloak")


class TokenResponse(BaseModel):
    """Token response from Keycloak token endpoint."""
    access_token: str
    refresh_token: Optional[str] = None
    expires_in: Optional[int] = None
    token_type: str = "Bearer"
    scope: Optional[str] = None


class TokenPayload(BaseModel):
    """Decoded JWT payload from Keycloak."""
    sub: str  # Subject (user ID)
    email: Optional[str] = None
    name: Optional[str] = None
    preferred_username: Optional[str] = None
    realm_access: Optional[list] = None
    resource_access: Optional[dict] = None
    auth_time: Optional[int] = None
    nonce: Optional[str] = None
    
    def to_user(self) -> User:
        """Convert token payload to User model."""
        return User(
            id=self.sub,
            username=self.preferred_username or self.name or self.sub,
            email=self.email,
            full_name=self.name,
            realm_access=self.realm_access,
            resource_access=self.resource_access,
        )
