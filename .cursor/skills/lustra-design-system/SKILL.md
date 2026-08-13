---
name: lustra-design-system
description: >-
  Applies Lustra visual design tokens, typography, and layout rules for beauty-editorial
  UI. Use when styling pages, building UI primitives, landing hero, catalog cards,
  or when the user mentions design system, tokens, or visual polish.
---

# Lustra design system

Canonical token block: TECH-DESIGN §23. Rules file: `.cursor/rules/lustra-design-system.mdc`.

## Workflow for UI work

1. Use semantic CSS variables — never invent a one-off hex in a feature.
2. Spacing/type/radius only from numeric scales (`gap-12` mindset even in plain CSS: `var(--spacing-12)`).
3. Fonts: Playfair Display (display) + Manrope (text). Self-host or single Google link; subset cyrillic+latin.
4. Check first viewport against PRD §13 / user design rules: brand-first, one composition, no purple SaaS look.

## Do / Don't

| Do | Don't |
|---|---|
| Warm paper bg + soft terracotta accent | Purple/indigo gradients, neon glow |
| Full-bleed hero on landing | Inset hero cards / floating media collage |
| One job per section | Stat strips, pill clusters, dashboard chrome on marketing |
| Compose small primitives | 400-line styled mega-component |
| Inline SVG icons, `currentColor` | Emoji stars/checks as UI glyphs |
| `prefers-reduced-motion` | Endless decorative motion |

## Adding a primitive (`packages/ui` when present)

- Props minimal; variants via explicit union (`primary` \| `ghost` \| `outline`)
- No business data fetching inside UI package
- Export from barrel; document token dependencies only

## Review pass (before done)

- [ ] Contrast text ≥ 4.5:1 (gold not used as body text)
- [ ] Tap targets ≥ 44px on key actions
- [ ] No hardcoded spacing outside scale
- [ ] Mobile + desktop both readable without horizontal scroll
