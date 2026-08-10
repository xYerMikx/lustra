---
name: lustra-backend
description: >-
  Implements Lustra NestJS API with use-case modules, guards/pipes, Zod validation,
  and SOLID-sized services. Use when editing apps/api, Prisma access, bookings,
  scheduling, auth, or adding REST endpoints.
---

# Lustra backend

Read `.cursor/rules/lustra-backend.mdc` and TECH-DESIGN §§12–18 (layers, errors, booking protocol).

## New endpoint workflow

1. Add/extend Zod schema in `@lustra/contracts` (rule: no schema → no endpoint).
2. Create/update **use-case** in `modules/<ctx>/app/<action>.usecase.ts` (kebab-case file, e.g. `hold-slot.usecase.ts`).
3. Wire controller in `api/` — inject use-case only.
4. Guard: auth + `@Roles(...)`; load actor from token.
5. Repository methods in `infra/` — keep SQL/`FOR UPDATE` here, not in use-case sprawl.
6. Domain errors with stable `code` from `error-codes.ts`.
7. Tests: domain unit + use-case with mocks; race/IDOR if mutation touches slots/bookings.

## Use-case template

```ts
Injectable()
export class HoldSlotUseCase {
  constructor(
    private readonly slots: SlotRepository,
    private readonly bookings: BookingRepository,
    private readonly tx: TransactionManager,
    private readonly clock: ClockService,
  ) {}

  execute(actor: AuthUser, input: HoldSlotInput): Promise<HoldSlotResult> {
    return this.tx.run(async () => {
      // validate policy → lock granules → insert hold → outbox
    })
  }
}
```

## Guards / pipes / middleware

| Concern | Mechanism |
|---|---|
| Auth | `JwtGuard` (cookie/Bearer) |
| Roles | `RolesGuard` + `@Roles` |
| Input shape | `ZodValidationPipe` (strict, strip unknown) |
| Idempotency | interceptor + `Idempotency-Key` |
| Abuse | `@nestjs/throttler` |

Fastify hooks only for cross-cutting HTTP (cookies, raw body) — business rules stay in use-cases.

## Anti–god-service smells → fix

- Service name is a whole domain (`BookingsService`) with many public methods → split use-cases
- Method needs 10+ injected deps → split use-case or extract domain service
- `if (role === …)` trees in one method → separate use-cases or policy functions
- Prisma calls inside controller → move to infra via use-case

## Size

Use-case / repository file **≤ 300 lines**. Shared domain helpers in `domain/*.ts` as pure functions.

## Done when

- [ ] Ownership from token verified
- [ ] Zod on input; DTO mapper excludes private fields
- [ ] Outbox for notifications (no send-before-commit)
- [ ] Unit or API test for the new invariant
