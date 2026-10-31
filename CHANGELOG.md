# Changelog

## 1.2.0 — work-in-progress checkpoint

Partial code published for continued development. Known issues: STATUS.md.

## 1.1.0 — work-in-progress checkpoint

Partial code published for continued development. Known issues: STATUS.md.

## 1.0.0 — work-in-progress checkpoint

Partial code published for continued development. Known issues: STATUS.md.

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2026-10-20

### Added
- Core FastAPI/React skeleton with health endpoint
- Docker Compose orchestration (backend, frontend, PostgreSQL, Keycloak)
- Backend pytest infrastructure with health tests
- Frontend Vitest infrastructure with component tests
- Keycloak realm export with admin/operator/analyst roles
- README with install/run/test instructions
- portfolio.json with schema_version 1
- MIT LICENSE
- Memory banks CRUD API (create, list, get, update, delete)
- Memory banks React UI (list, create form, edit form, detail view)
- Pagination and name filtering for bank listing
- UTC timestamps with ISO format serialization
- Bank configuration with validation (retain_chunk_size, enable_auto_consolidation, consolidation_threshold)
- Database auto-initialization on startup
- Audit logging for memory bank CRUD operations

### Security
- Non-root Docker users
- HttpOnly SameSite cookie configuration
- Environment-based secrets management
- Demo mode restricted to localhost
