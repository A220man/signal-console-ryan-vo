import pytest
import pytest_asyncio
from httpx import ASGITransport, AsyncClient
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession, async_sessionmaker
from sqlalchemy.pool import StaticPool
from sqlalchemy import event

from app.main import create_app
from app.core.database import Base, get_db
from app.models.bank import MemoryBank, AuditLog


TEST_DATABASE_URL = "sqlite+aiosqlite:///:memory:"


@pytest_asyncio.fixture(scope="function")
async def test_engine():
    engine = create_async_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    @event.listens_for(engine.sync_engine, "connect")
    def enforce_foreign_keys(connection, _):
        cursor = connection.cursor()
        cursor.execute("PRAGMA foreign_keys=ON")
        cursor.close()

    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield engine
    await engine.dispose()


@pytest_asyncio.fixture(scope="function")
async def test_session(test_engine):
    async_session = async_sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)
    async with async_session() as session:
        yield session


@pytest_asyncio.fixture(scope="function")
async def client(test_session):
    def override_get_db():
        yield test_session
    
    app = create_app()
    app.dependency_overrides[get_db] = override_get_db
    
    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as ac:
        yield ac
    
    app.dependency_overrides.clear()


@pytest_asyncio.fixture(scope="function")
async def sample_bank(test_session):
    """Create a sample bank for testing."""
    bank = MemoryBank(name="test-bank", description="Test bank", config="{}")
    test_session.add(bank)
    await test_session.commit()
    await test_session.refresh(bank)
    return bank


class TestBanksAPI:
    """Tests for memory banks API."""
    
    @pytest.mark.asyncio
    async def test_create_bank(self, client):
        response = await client.post(
            "/api/v1/banks",
            json={"name": "my-bank", "description": "My test bank"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "my-bank"
        assert data["description"] == "My test bank"
        assert data["id"] > 0
        assert "created_at" in data
        assert "updated_at" in data
        assert "config" in data
    
    @pytest.mark.asyncio
    async def test_create_bank_duplicate_name(self, client, sample_bank):
        response = await client.post(
            "/api/v1/banks",
            json={"name": "test-bank", "description": "Another bank"},
        )
        assert response.status_code == 409
        assert "already exists" in response.json()["detail"]
    
    @pytest.mark.asyncio
    async def test_create_bank_invalid_name(self, client):
        response = await client.post(
            "/api/v1/banks",
            json={"name": "invalid name!", "description": "Test"},
        )
        assert response.status_code == 422
    
    @pytest.mark.asyncio
    async def test_list_banks_empty(self, client):
        response = await client.get("/api/v1/banks")
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["page"] == 1
        assert data["page_size"] == 20
        assert data["total_pages"] == 0
    
    @pytest.mark.asyncio
    async def test_list_banks_with_data(self, client, sample_bank):
        response = await client.get("/api/v1/banks")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "test-bank"
        assert data["total"] == 1
    
    @pytest.mark.asyncio
    async def test_list_banks_pagination(self, client, test_session):
        # Create multiple banks
        for i in range(5):
            bank = MemoryBank(name=f"bank-{i}", description=f"Bank {i}", config="{}")
            test_session.add(bank)
        await test_session.commit()
        
        response = await client.get("/api/v1/banks?page=1&page_size=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["page"] == 1
        assert data["page_size"] == 2
        assert data["total"] == 5
        assert data["total_pages"] == 3
    
    @pytest.mark.asyncio
    async def test_list_banks_filter_by_name(self, client, test_session):
        for name in ["alpha-bank", "beta-bank", "gamma-bank"]:
            bank = MemoryBank(name=name, description=name, config="{}")
            test_session.add(bank)
        await test_session.commit()
        
        response = await client.get("/api/v1/banks?name=beta")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "beta-bank"
    
    @pytest.mark.asyncio
    async def test_get_bank(self, client, sample_bank):
        response = await client.get(f"/api/v1/banks/{sample_bank.id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_bank.id
        assert data["name"] == "test-bank"
    
    @pytest.mark.asyncio
    async def test_get_bank_not_found(self, client):
        response = await client.get("/api/v1/banks/999")
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_update_bank(self, client, sample_bank):
        response = await client.patch(
            f"/api/v1/banks/{sample_bank.id}",
            json={"description": "Updated description"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description"
        assert data["name"] == "test-bank"
    
    @pytest.mark.asyncio
    async def test_update_bank_name_conflict(self, client, test_session):
        bank1 = MemoryBank(name="bank-1", description="First", config="{}")
        bank2 = MemoryBank(name="bank-2", description="Second", config="{}")
        test_session.add_all([bank1, bank2])
        await test_session.commit()
        
        response = await client.patch(
            f"/api/v1/banks/{bank2.id}",
            json={"name": "bank-1"},
        )
        assert response.status_code == 409
    
    @pytest.mark.asyncio
    async def test_update_bank_not_found(self, client):
        response = await client.patch(
            "/api/v1/banks/999",
            json={"description": "Updated"},
        )
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_bank(self, client, sample_bank):
        response = await client.delete(f"/api/v1/banks/{sample_bank.id}")
        assert response.status_code == 204
        
        # Verify deleted
        response = await client.get(f"/api/v1/banks/{sample_bank.id}")
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_delete_bank_not_found(self, client):
        response = await client.delete("/api/v1/banks/999")
        assert response.status_code == 404
    
    @pytest.mark.asyncio
    async def test_bank_config_field(self, client):
        response = await client.post(
            "/api/v1/banks",
            json={
                "name": "config-bank",
                "description": "Bank with config",
                "config": {
                    "retain_chunk_size": 500,
                    "enable_auto_consolidation": True,
                    "consolidation_threshold": 50,
                },
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["config"]["retain_chunk_size"] == 500
        assert data["config"]["enable_auto_consolidation"] is True
        assert data["config"]["consolidation_threshold"] == 50
    
    @pytest.mark.asyncio
    async def test_audit_log_created_on_crud(self, client, test_session):
        """Test that audit log entries are created for CRUD operations."""
        # Create bank
        response = await client.post(
            "/api/v1/banks",
            json={"name": "audit-bank", "description": "Test audit"},
        )
        assert response.status_code == 201
        bank_id = response.json()["id"]
        
        # Check CREATE audit log
        result = await test_session.execute(
            AuditLog.__table__.select().where(AuditLog.bank_id == bank_id).order_by(AuditLog.id)
        )
        audits = result.all()
        assert len(audits) == 1
        assert audits[0].action == "CREATE"
        
        # Update bank
        response = await client.patch(
            f"/api/v1/banks/{bank_id}",
            json={"description": "Updated description"},
        )
        assert response.status_code == 200
        
        # Check UPDATE audit log
        result = await test_session.execute(
            AuditLog.__table__.select().where(AuditLog.bank_id == bank_id).order_by(AuditLog.id)
        )
        audits = result.all()
        assert len(audits) == 2
        assert audits[1].action == "UPDATE"
        
        # Delete bank
        response = await client.delete(f"/api/v1/banks/{bank_id}")
        assert response.status_code == 204
        
        # Check DELETE audit log
        result = await test_session.execute(
            AuditLog.__table__.select().where(AuditLog.bank_id == bank_id).order_by(AuditLog.id)
        )
        audits = result.all()
        assert len(audits) == 3
        assert audits[2].action == "DELETE"
