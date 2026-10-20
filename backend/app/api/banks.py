from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.database import get_db
from app.schemas.bank import (
    BankCreate,
    BankUpdate,
    BankListParams,
    BankResponse,
    BankListResponse,
)
from app.services.bank_service import BankService


router = APIRouter(prefix="/api/v1/banks", tags=["banks"])


@router.post("", response_model=BankResponse, status_code=status.HTTP_201_CREATED)
async def create_bank(
    data: BankCreate,
    db: AsyncSession = Depends(get_db),
):
    """Create a new memory bank."""
    service = BankService(db)
    
    # Check if name already exists
    existing = await service.get_by_name(data.name)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Bank with name '{data.name}' already exists",
        )
    
    bank = await service.create(data, user_id="demo-user")
    return _to_response(bank)


@router.get("", response_model=BankListResponse)
async def list_banks(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    name: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """List memory banks with pagination and optional filtering."""
    service = BankService(db)
    params = BankListParams(page=page, page_size=page_size, name=name)
    banks, total = await service.list(params)
    
    return BankListResponse(
        items=[_to_response(b) for b in banks],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=(total + page_size - 1) // page_size,
    )


@router.get("/{bank_id}", response_model=BankResponse)
async def get_bank(
    bank_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Get a memory bank by ID."""
    service = BankService(db)
    bank = await service.get_by_id(bank_id)
    
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bank with id {bank_id} not found",
        )
    
    return _to_response(bank)


@router.patch("/{bank_id}", response_model=BankResponse)
async def update_bank(
    bank_id: int,
    data: BankUpdate,
    db: AsyncSession = Depends(get_db),
):
    """Update a memory bank."""
    service = BankService(db)
    
    # Check if new name conflicts
    if data.name is not None:
        existing = await service.get_by_name(data.name)
        if existing and existing.id != bank_id:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Bank with name '{data.name}' already exists",
            )
    
    bank = await service.update(bank_id, data, user_id="demo-user")
    
    if not bank:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bank with id {bank_id} not found",
        )
    
    return _to_response(bank)


@router.delete("/{bank_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_bank(
    bank_id: int,
    db: AsyncSession = Depends(get_db),
):
    """Delete a memory bank."""
    service = BankService(db)
    deleted = await service.delete(bank_id, user_id="demo-user")
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Bank with id {bank_id} not found",
        )


def _to_response(bank) -> BankResponse:
    """Convert MemoryBank model to BankResponse."""
    import json
    from app.schemas.bank import BankConfig
    
    config_data = json.loads(bank.config) if bank.config else {}
    return BankResponse(
        id=bank.id,
        name=bank.name,
        description=bank.description,
        config=BankConfig(**config_data),
        created_at=bank.created_at.isoformat(),
        updated_at=bank.updated_at.isoformat(),
    )