# Product development plan

Each round completes one feature or repair. Future items are planned, not implemented claims.

## Current round

memory-banks-crud

## Roadmap

### core-skeleton — Core FastAPI/React skeleton with install/run/test

Status: done

Acceptance:
- FastAPI backend with /health endpoint runs
- React + TypeScript + Vite frontend builds
- Docker Compose with backend, frontend, Keycloak, PostgreSQL
- pytest backend tests pass
- npm frontend build and tests pass
- README with install/run/test steps

Implementation: `backend/app/main.py`, `backend/requirements.txt`, `backend/tests/test_health.py`, `frontend/package.json`, `frontend/src/main.tsx`, `frontend/src/App.tsx`, `docker-compose.yaml`, `Dockerfile.backend`, `Dockerfile.frontend`, `README.md`, `portfolio.json`

Tests: `backend/tests/test_health.py`, `frontend/src/App.test.tsx`

### oidc-auth — OIDC Keycloak authentication with sessions

Status: planned

Acceptance:
- Login redirects to Keycloak
- Callback exchanges code for tokens
- HttpOnly SameSite cookies for session
- CSRF protection on writes
- Logout clears session
- Protected API endpoints require auth

Implementation: `backend/app/auth/`, `frontend/src/auth/`

Tests: `backend/tests/test_auth.py`, `frontend/src/auth.test.tsx`

### memory-banks-crud — Memory banks CRUD API and UI

Status: done

Acceptance:
- Create/list/get/update/delete banks via API
- React dashboard with bank list and forms
- Pagination and filtering
- UTC timestamps, validation, audit log

Implementation: `backend/app/api/banks.py`, `backend/app/models/bank.py`, `backend/app/services/bank_service.py`, `backend/app/schemas/bank.py`, `backend/app/utils/validation.py`, `backend/app/utils/datetime.py`, `frontend/src/banks/BankList.tsx`, `frontend/src/banks/BankForm.tsx`, `frontend/src/banks/BankDetail.tsx`, `frontend/src/banks/api.ts`, `frontend/src/banks/types.ts`, `frontend/src/utils/date.ts`, `frontend/src/utils/validation.ts`, `frontend/src/constants.ts`

Tests: `backend/tests/test_banks.py`, `frontend/src/banks/BankList.test.tsx`

### memory-retention — Memory retention (ingest) workflow

Status: planned

Acceptance:
- POST /memories with append/replace modes
- Tag support and metadata
- Extraction with LLM (mocked in tests)
- UI for manual retain with preview

Implementation: `backend/app/api/memories.py`, `backend/app/services/memory_service.py`, `backend/app/core/extraction.py`, `frontend/src/memories/`

Tests: `backend/tests/test_memories.py`, `frontend/src/memories.test.tsx`

### memory-recall — Memory recall/search workflow

Status: planned

Acceptance:
- POST /recall with query and filters
- Timestamp display on results
- UI search with results list
- Export recalled memories

Implementation: `backend/app/api/recall.py`, `backend/app/services/recall_service.py`, `frontend/src/recall/`

Tests: `backend/tests/test_recall.py`, `frontend/src/recall.test.tsx`

### consolidation — Memory consolidation workflow

Status: planned

Acceptance:
- POST /consolidate triggers consolidation
- Status polling and results
- UI shows consolidation status/history
- Observations and facts visible

Implementation: `backend/app/api/consolidation.py`, `backend/app/services/consolidation_service.py`, `frontend/src/consolidation/`

Tests: `backend/tests/test_consolidation.py`, `frontend/src/consolidation.test.tsx`

