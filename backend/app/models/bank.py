from datetime import datetime
from sqlalchemy import String, Text, DateTime, func, Index
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base


class MemoryBank(Base):
    """Memory bank model - isolated namespace for agent memories."""
    
    __tablename__ = "memory_banks"
    __table_args__ = (
        Index("ix_memory_banks_created_at", "created_at"),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    config: Mapped[str] = mapped_column(Text, default="{}", nullable=False)  # JSON config
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False
    )
    
    def __repr__(self) -> str:
        return f"<MemoryBank(id={self.id}, name='{self.name}')>"