from datetime import datetime, timezone
from typing import Optional
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models.bank import MemoryBank
from app.schemas.bank import BankCreate, BankUpdate, BankListParams


class BankService:
    """Service layer for memory bank operations."""
    
    def __init__(self, session: AsyncSession):
        self.session = session
    
    async def create(self, data: BankCreate) -> MemoryBank:
        """Create a new memory bank."""
        bank = MemoryBank(
            name=data.name,
            description=data.description,
            config=data.config.model_dump_json() if data.config else "{}",
        )
        self.session.add(bank)
        await self.session.commit()
        await self.session.refresh(bank)
        return bank
    
    async def get_by_id(self, bank_id: int) -> Optional[MemoryBank]:
        """Get a memory bank by ID."""
        result = await self.session.execute(
            select(MemoryBank).where(MemoryBank.id == bank_id)
        )
        return result.scalar_one_or_none()
    
    async def get_by_name(self, name: str) -> Optional[MemoryBank]:
        """Get a memory bank by name."""
        result = await self.session.execute(
            select(MemoryBank).where(MemoryBank.name == name)
        )
        return result.scalar_one_or_none()
    
    async def list(self, params: BankListParams) -> tuple[list[MemoryBank], int]:
        """List memory banks with pagination and filtering."""
        query = select(MemoryBank)
        
        if params.name:
            query = query.where(MemoryBank.name.ilike(f"%{params.name}%"))
        
        # Count total
        count_query = select(func.count()).select_from(query.subquery())
        total = await self.session.scalar(count_query) or 0
        
        # Apply pagination
        query = query.order_by(MemoryBank.created_at.desc())
        query = query.offset((params.page - 1) * params.page_size).limit(params.page_size)
        
        result = await self.session.execute(query)
        banks = result.scalars().all()
        
        return list(banks), total
    
    async def update(self, bank_id: int, data: BankUpdate) -> Optional[MemoryBank]:
        """Update a memory bank."""
        bank = await self.get_by_id(bank_id)
        if not bank:
            return None
        
        if data.name is not None:
            bank.name = data.name
        if data.description is not None:
            bank.description = data.description
        if data.config is not None:
            bank.config = data.config.model_dump_json()
        
        bank.updated_at = datetime.now(timezone.utc)
        await self.session.commit()
        await self.session.refresh(bank)
        return bank
    
    async def delete(self, bank_id: int) -> bool:
        """Delete a memory bank."""
        bank = await self.get_by_id(bank_id)
        if not bank:
            return False
        
        await self.session.delete(bank)
        await self.session.commit()
        return True