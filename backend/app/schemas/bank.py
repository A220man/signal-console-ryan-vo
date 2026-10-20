from typing import Optional
from pydantic import BaseModel, Field, ConfigDict


class BankConfig(BaseModel):
    """Memory bank configuration."""
    model_config = ConfigDict(extra="allow")
    
    retain_chunk_size: int = Field(default=1000, ge=100, le=10000)
    enable_auto_consolidation: bool = False
    consolidation_threshold: int = Field(default=100, ge=10, le=1000)


class BankCreate(BaseModel):
    """Request model for creating a memory bank."""
    name: str = Field(..., min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
    description: Optional[str] = Field(default=None, max_length=500)
    config: Optional[BankConfig] = None


class BankUpdate(BaseModel):
    """Request model for updating a memory bank."""
    name: Optional[str] = Field(default=None, min_length=1, max_length=100, pattern=r"^[a-zA-Z0-9_-]+$")
    description: Optional[str] = Field(default=None, max_length=500)
    config: Optional[BankConfig] = None


class BankListParams(BaseModel):
    """Query parameters for listing memory banks."""
    page: int = Field(default=1, ge=1)
    page_size: int = Field(default=20, ge=1, le=100)
    name: Optional[str] = None


class BankResponse(BaseModel):
    """Response model for a memory bank."""
    id: int
    name: str
    description: Optional[str]
    config: BankConfig
    created_at: str  # ISO format
    updated_at: str  # ISO format
    
    model_config = ConfigDict(from_attributes=True)


class BankListResponse(BaseModel):
    """Response model for paginated bank list."""
    items: list[BankResponse]
    total: int
    page: int
    page_size: int
    total_pages: int