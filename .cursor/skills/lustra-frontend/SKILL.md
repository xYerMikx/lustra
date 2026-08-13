---
name: lustra-frontend
description: >-
  Implements Lustra Next.js/Astro UI with composition, feature-sliced layout,
  strict size limits, and minimal useEffect. Use when editing apps/web or
  apps/landing, building screens, forms, catalog, booking UI, or master calendar.
---

# Lustra frontend

Read `.cursor/rules/lustra-frontend.mdc` + design-system rule. Tokens: TECH-DESIGN §23.

## Checklist before coding

1. Which app? `web` (product) vs `landing` (static/SEO).
2. Route rendering: SSR/ISR for SEO pages; client + Query for `/app/**`.
3. Split UI into `entities` (dumb) vs `features` (stateful flow).

## Composition pattern

```
feature-x/
  ui/feature-shell.tsx      # layout ≤ ~80 lines
  ui/step-a.tsx
  ui/step-b.tsx
  model/use-feature-x.ts    # state machine / query hooks
  model/types.ts
  index.ts
```

Filenames always **kebab-case**; exports stay `FeatureShell`, `useFeatureX`.

If a file approaches **300 lines** — extract child or hook **before** merging.

## useEffect policy

Allowed only to sync with **external** systems:

- `window`/`document` listeners, IntersectionObserver, non-React widgets
- syncing URL ↔ local UI when not expressible via `searchParams` alone

Not allowed as default for:

- deriving data from props/state → compute in render
- fetching → TanStack Query / server `fetch`
- “on mount do X once” from user action → do X in the event that caused mount need

Prefer `useEffectEvent` for stable effect bodies that call latest handlers (React 19+).

## Validation

- Schemas only from `@lustra/contracts` (when package exists); duplicate ad-hoc zod in features is forbidden.
- Show field errors from API `VALIDATION_FAILED.details` as well as client resolver.

## Role UI

| Area | Role |
|---|---|
| `/catalog`, `/m/*` | anon+ |
| `/app/client/**` | client |
| `/app/master/**`, onboarding | master |
| `/admin/**` | admin + server/API enforcement |

Never hide-only security: still call guarded APIs.

Icons: inline SVG in `shared/ui`, never emoji or icon fonts.

## Done when

- [ ] No component > 300 lines
- [ ] No unjustified `useEffect`
- [ ] Loading/empty/error/success covered for data views
- [ ] Utils covered by unit tests if new pure logic added
