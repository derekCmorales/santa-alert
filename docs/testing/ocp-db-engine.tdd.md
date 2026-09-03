# TDD evidence — PGlite ElfAccountGateway (OCP parte 4)

**Source plan:** `.claude/plans/ocp-db-engine.plan.md`

## User journeys

1. As ops, I want `DB_DRIVER=pglite` so elf accounts persist in embedded PostgreSQL without changing registration rules.
2. As a developer, I want Prisma+SQLite to keep working so PGlite is an extension, not a rewrite.
3. As a reviewer, I want adapter tests in-memory so CI never needs Docker or a Postgres server.

## Task report

| Task | Command | RED | GREEN | Guarantee |
|------|---------|-----|-------|-----------|
| `PgliteElfAccountMapper` | `vitest run tests/unit/database/PgliteElfAccountMapper.test.ts` | missing module | 5 passed | save/find round-trip; Date; verify upsert |
| `createElfAccountGateway` / `parseDbDriver` | `vitest run tests/unit/database/createElfAccountGateway.test.ts` | missing factory | 5 passed | `prisma` \| `pglite`; unknown driver rejected |
| `loadConfig` | `vitest run tests/unit/composition/loadConfig.db.test.ts` | no `dbDriver` | 3 passed | default prisma; pglite + data dir; fail-fast |
| Integration | `vitest run tests/integration` | Prisma row updates | 2 passed | same flow on both engines via the port |
| HTTP e2e | `vitest run tests/e2e` | PrismaClient in HTTP test | 3 passed | register→verify→login on PGlite |

## Test specification

| # | What is guaranteed | Test file | Type | Result |
|---|--------------------|-----------|------|--------|
| 1 | save + findByEmail round-trip | `PgliteElfAccountMapper.test.ts` | unit | PASS |
| 2 | findById and findByVerificationTokenHash | same | unit | PASS |
| 3 | missing elf returns null | same | unit | PASS |
| 4 | `verificationExpiresAt` is a `Date` | same | unit | PASS |
| 5 | save after `elf.verify()` updates status and clears token | same | unit | PASS |
| 6 | Factory returns PGlite / Prisma by driver | `createElfAccountGateway.test.ts` | unit | PASS |
| 7 | Unknown `DB_DRIVER` throws | same + `loadConfig.db.test.ts` | unit | PASS |
| 8 | Auth flow on Prisma without `elfAccount.update` | `auth.flow.test.ts` | integration | PASS |
| 9 | Same auth flow on PGlite | same | integration | PASS |
| 10 | HTTP register→verify→login→board on PGlite | `auth.http.e2e.test.ts` | e2e | PASS |

## Coverage and gaps

- PGlite in CI is in-memory (no `PGLITE_DATA_DIR`). Manual check: `DB_DRIVER=pglite` with a data dir if you want persistence across restarts.
- Generator unit tests still use `InMemoryElfGateway` and were **not** rewritten.

## Merge evidence

RED: new tests failed on missing `PgliteElfAccountMapper` / `createElfAccountGateway`.  
GREEN: adapter + factory + root wiring made those tests pass; integration no longer names `PrismaClient`.  
Refactor: `build*` take `ElfAccountGateway`; one in-memory PGlite per mapper suite.
