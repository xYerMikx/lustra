---
name: lumira-testing
description: >-
  Writes and maintains Lumira unit tests for frontend utils and backend domain/use-cases,
  plus Playwright/API e2e for P0 flows. Use when adding tests, fixing CI, booking races,
  or when the user mentions coverage, vitest, playwright, or e2e.
---

# Lumira testing

Rules summary: `.cursor/rules/lumira-testing.mdc`, smoke markers: `.cursor/rules/lumira-smoke-data.mdc`. Product acceptance: PRD §17, TECH-DESIGN §29 (smoke), §28 (slices).

## What to unit-test

### Frontend (`apps/web`)

- `shared/lib/**`: phone E.164 `+375…`, money/BYN format, tz (`Europe/Minsk`), slugify, filter ↔ URL serializers
- Feature pure helpers: hold timer remaining, slot grouping (morning/day/evening), booking step transitions

Colocate: `foo.ts` + `foo.test.ts`.

### Backend (`apps/api`)

- `domain/**`: booking status machine (legal + illegal transitions), cancel cutoff, lead time, bayesian rating
- `SlotGenerator` / availability arithmetic with injected `Clock`
- Use-cases with **mocked** repositories — assert calls + DomainError codes

Do **not** prioritize shallow controller tests.

## API e2e (must-have scenarios)

```
parallel HoldSlot same window     → 1×201, N×409 SLOT_TAKEN
Idempotency-Key replay            → same booking id
IDOR get booking                  → 403/404
client booking DTO                → no masterNote / trustScore
cancel booking                    → reminder jobs removed (when queues exist)
```

## Playwright e2e (P0 paths)

Mobile viewport default. One file per flow under future `apps/web/e2e/`.

1. Master signup → onboarding → public `/m/[slug]` reachable  
2. Client book happy path  
3. Master manual booking  
4. Cancel + status visible  
5. Review after completed  

## Authoring rules

- Name tests by **behavior**, not method: `rejects hold when granule already held`
- Use fixed `Clock` / frozen dates for schedule tests — no flaky `Date.now()`
- Prefer deterministic seed data over random UUIDs in assertions
- New pure util or domain policy in a PR **without** a test is incomplete

## Smoke data markers (required)

All manual/API smoke and future e2e seeds must be identifiable for cleanup:

| Entity | Pattern |
|---|---|
| User email | `{role}.smoke.{runId}@example.com` |
| Booking idempotency | `smoke:{runId}:…` |

- Fresh `runId` per run (`date +%s` or `$GITHUB_RUN_ID`)
- Domain `@example.com` only
- Reference impl: `apps/api/postman/run-auth-smoke.sh`
- Postman: update collection via MCP, not JSON in git

**Cleanup (planned):** `packages/db/src/cleanup-smoke.ts` + `pnpm db:cleanup:smoke` with `--dry-run` / `--execute`, prod guard, FK-safe order. Implement in a dedicated PR — do not block feature PRs.

## Commands

```bash
pnpm test                              # unit via turbo
pnpm test:e2e                          # when Playwright/API e2e packages wired
apps/api/postman/run-auth-smoke.sh     # local auth curl smoke (creates marked users)
# pnpm db:cleanup:smoke --dry-run      # planned — not wired yet
```
