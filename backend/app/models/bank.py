from datetime import datetime
from sqlalchemy import String, Text, DateTime, func, Index, Integer, ForeignKey
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


class AuditLog(Base):
    """Audit log for tracking changes to memory banks."""
    
    __tablename__ = "audit_logs"
    __table_args__ = (
        Index("ix_audit_logs_bank_id", "bank_id"),
        Index("ix_audit_logs_created_at", "created_at"),
    )
    
    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    # Historical identifier deliberately survives deletion of its source bank.
    # bank_id is denormalized (no FK) so audit trail persists after bank deletion.
    # bank_name preserves human-readable reference when bank is gone.
    bank_id: Mapped[int] = mapped_column(Integer, nullable=False)
    bank_name: Mapped[str] = mapped_column(String(100), nullable=False)
    action: Mapped[str] = mapped_column(String(50), nullable=False)  # CREATE, UPDATE, DELETE
    changes: Mapped[str | None] = mapped_column(Text, nullable=True)  # JSON of changed fields
    user_id: Mapped[str | None] = mapped_column(String(100), nullable=True)  # Keycloak user ID
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )