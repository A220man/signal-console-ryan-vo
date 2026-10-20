# Checkpoint status

Work in progress; not a release-readiness or successful QA claim.

Version: 1.0.0

## Outstanding findings

Independent review rejected: memory-banks-crud feature claims 'done' but its audit log acceptance criterion lacks database-enforced referential integrity. The AuditLog.bank_id column is a plain integer (Integer, nullable=False) with NO ForeignKey constraint to memory_banks.id. In production PostgreSQL this means: (1) no referential integrity on CREATE/UPDATE - invalid bank_ids could be written to audit_logs; (2) on DELETE of a bank, the audit_log rows retain their bank_id value (no cascade) but the link is not protected by any constraint. The backend test test_audit_log_created_on_crud passes because it only verifies that audit rows are created with the correct bank_id value, not that the database enforces the relationship. The SQLite test fixture enables FK enforcement via PRAGMA but since no FK exists in the model, this enforcement is vacuous.

Additional findings:
1. CI workflow .github/workflows/ci.yml uses working-directory on run steps (valid GitHub syntax) - the observation claiming it uses working-directory on uses: steps is incorrect.
2. Frontend tests pass (10/10) but emit React act() warnings from async state updates in test renders - indicates fragile test setup but not functional failure.
3. compose-browser CI job exists but runtime verification is pending (no Docker daemon in sandbox); image builds alone do not establish the claimed browser CRUD + backend restart persistence.
4. Two compose files exist (compose.yaml and docker-compose.yaml) causing Docker Compose warning; docker-compose.yaml is used by CI but compose.yaml has different Keycloak config (dev-file vs postgres).
5. Frontend placeholder routes (/memories, /recall, /consolidation) are honestly marked as planned in PLAN.md and UI - not misrepresented as implemented.

Positive: core-skeleton feature meets acceptance (health endpoint, React build, Compose stack, tests pass, README). Branding uses independent 'Signal Console' with 'Hindsight: Agent Memory That Learns' tagline - original implementation. Future features (oidc-auth, memory-retention, recall, consolidation) are honestly planned. API contracts match acceptance for CRUD, pagination, filtering, UTC timestamps, validation. Backend 18 tests and frontend 10 tests pass in current fixtures.

Required for approval: (1) Add ForeignKey constraint on AuditLog.bank_id referencing MemoryBank.id with ondelete='RESTRICT' or 'NO ACTION' to prevent bank deletion when audit logs exist (soft-delete pattern) or add bank_name/bank_identifier denormalization to audit row for immutable audit trail; (2) Add backend test with actual PostgreSQL FK enforcement verifying audit log integrity; (3) Consolidate to single docker-compose.yaml file.

## Next round

Resume PLAN.md, check the current code, fix failures and advance one feature.
