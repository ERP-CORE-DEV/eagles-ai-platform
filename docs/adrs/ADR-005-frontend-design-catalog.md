# ADR-005: Frontend Design Catalog Integration into EAIP v2

**Status:** Proposed
**Date:** 2026-04-12
**Author:** Hatim Hajji

## Context

EAIP v2 covers backend AI orchestration but has no knowledge of the RH-OptimERP frontend design system. AI agents generating or auditing frontend code operate blind — no design token vocabulary, no component prop shapes, no Storybook contract.

The frontend stack across all RH-OptimERP microservices: React 18, TypeScript strict, Ant Design 5, TailwindCSS. The sourcing MS (`c:/rh-optimerp-sourcing-candidate-attraction/src/frontend/src/`) is the most mature (410 tests, Wave 10 complete) and serves as the golden reference with:
- 92 CSS custom properties in `design-tokens.css` (3-tier Base/System/Component, dark mode)
- 12 primitive `ui/` components, 30+ feature components
- No Storybook, no token pipeline, no systematic prop docs

## Decision

Adopt **Storybook 8 + Style Dictionary v4 + react-docgen-typescript**.

### Why

| Tool | Why selected | Why not alternatives |
|---|---|---|
| Storybook 8 (89.7K stars) | React 18 native, ConfigProvider decorator for antd 5, CLI, 200+ addons, i18n addon, a11y addon | Histoire: Vue-only. Ladle: dead (Sep 2024). Docz: archived. Styleguidist: broken on TS5 |
| Style Dictionary v4 (4.6K stars) | W3C DTCG format, single JSON → CSS + JS + Tailwind, built-in tailwind-preset | Theo: 6y inactive. Tokens Studio: requires Figma Enterprise (vendor lock-in) |
| react-docgen-typescript (1.3K stars) | Full TypeScript fidelity for strict mode (generics, unions, conditionals) | react-docgen: loses union type accuracy in strict TS |

## EAIP v2 Integration

### New package: `packages/frontend-catalog`

```
packages/frontend-catalog/
  .storybook/main.ts, preview.ts
  tokens/tokens.w3c.json, style-dictionary.config.ts
  stories/ui/*.stories.tsx
  dist/tokens.css, tokens.js, tailwind-tokens.js, storybook/
```

### New templates (prompt-library-orchestrator)

- **TPL-UI-0001** — Component Story Generator (generates .stories.tsx with all prop variations, ConfigProvider decorator, a11y checks)
- **TPL-UI-0002** — Design Token Extractor (CSS custom properties → W3C DTCG JSON)
- **TPL-UI-0003** — Component Catalog Audit (flags hardcoded hex, missing JSDoc, inline styles)

### New skills (tool-registry, 62 → 66)

- `generate_story` — Generate Storybook stories for React components
- `extract_tokens` — Extract design tokens into Style Dictionary format
- `audit_design_system` — Audit component consistency against tokens
- `build_catalog` — Build and deploy Storybook static site

### New workflow: WF-FRONTEND-CATALOG

`audit_design_system` → `extract_tokens` → `generate_story` (parallel per-file) → `build_catalog`

## Seed Strategy

Sourcing MS components in priority order:
1. `styles/design-tokens.css` — token extraction first
2. `components/ui/` (12) — primitives, golden reference
3. `components/matching/` (6) — feature-level
4. `components/DuplicateResolution/` (4) — complex multi-step
5. `components/candidates/` (14) — highest complexity
6. `components/layout/` (2) — MainLayout, DashboardWorkspace
7. `components/common/` (4) — ErrorBoundary, ChartWidget, etc.

French HR domain stories: StatusBadge (15 states + FRENCH_LABELS), KpiCard (fr-FR currency), contract-type color tokens (CDI/CDD/CDIC/freelance/interim/portage/auto).

## Implementation Waves

| Wave | Goal | Effort | Complexity |
|---|---|---|---|
| 1 | Token pipeline (tokens.w3c.json → CSS + JS + Tailwind) | 3-4h | S |
| 2 | Storybook infra (dev server, ConfigProvider, Button proof-of-concept) | 4-5h | M |
| 3 | Template authoring + skill registration + workflow | 3-4h | S |
| 4 | Full seed run (55 components) + CI integration | 5-6h | M |

**Total estimated: 15-19 hours across 4 waves.**

## NPM Dependencies (scoped to packages/frontend-catalog)

devDependencies: storybook ^8.6.0, @storybook/react-vite, addon-essentials, addon-a11y, addon-interactions, storybook-react-i18next, style-dictionary ^4.3.0, react-docgen-typescript ^2.4.0, vite ^5.4.0, tailwindcss ^3.4.0

peerDependencies: react ^18.2.0, react-dom ^18.2.0, antd ^5.11.0

## Consequences

**Positive:** AI agents get typed component references, token vocabulary, and executable stories. Story generation drops from 30-45min manual to 1 tool call. a11y enforced automatically. Static catalog deployable to Azure Static Web Apps.

**Negative:** ~45 new pnpm packages. CI build +2-3min for storybook build. react-docgen-typescript is slow (tsc invocation) — use react-docgen in dev, full TS in build.

## Rollback

Purely additive. Delete `packages/frontend-catalog/`, revert 4 skill entries in skill-catalog.ts, remove 3 TPL-UI templates, `pnpm install`. No existing MCPs modified, no schema changes.
