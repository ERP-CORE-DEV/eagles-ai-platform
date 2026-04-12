# /mission EAIP Frontend Design Catalog — Implementation

## Objective
Implement ADR-005: Add Storybook 8 + Style Dictionary v4 + react-docgen-typescript to EAIP v2 as `packages/frontend-catalog`. Seed with sourcing MS components.

## Wave 1 — Token Pipeline (S, 3-4h)

### Steps
1. Create `packages/frontend-catalog/` with `package.json` (devDeps: style-dictionary ^4.3.0, typescript ^5.9.0)
2. Parse `c:/rh-optimerp-sourcing-candidate-attraction/src/frontend/src/styles/design-tokens.css`
3. Author `tokens/tokens.w3c.json` in W3C DTCG format (92 CSS vars → structured JSON with $value/$type)
4. Author `tokens/style-dictionary.config.ts`:
   - Output: `dist/tokens.css` (CSS vars), `dist/tokens.js` (ESM typed), `dist/tailwind-tokens.js` (Tailwind preset)
5. Run `style-dictionary build` — verify 3 output files
6. Write TPL-UI-0002 template to `C:/RH-OptimERP/PROMPT_MODELS/templates/TPL-UI-0002_DesignTokenExtractor.json` and `prompts/TPL-UI-0002_DesignTokenExtractor.md`
7. Test: `tsc --noEmit` on a file importing `dist/tokens.js`

### Exit Criteria
- `pnpm --filter frontend-catalog build:tokens` exits 0
- `dist/tokens.css` contains all 92 CSS vars
- `dist/tokens.js` exports typed token object

---

## Wave 2 — Storybook Infrastructure (M, 4-5h)

### Steps
1. Install Storybook 8: `@storybook/react-vite`, `addon-essentials`, `addon-a11y`, `addon-interactions`, `storybook-react-i18next`
2. Author `.storybook/main.ts`:
   - `typescript.reactDocgen: 'react-docgen-typescript'`
   - `shouldExtractLiteralValuesFromEnum: true`
3. Author `.storybook/preview.ts`:
   - antd `ConfigProvider` decorator with `frFR` locale
   - Import `design-tokens.css` for CSS var resolution
   - Token values mapped to antd theme.token
4. Create `vite.config.ts`: Tailwind with `preflight: false`
5. Write proof-of-concept: `stories/ui/Button.stories.tsx`
   - Meta with argTypes from Button interface
   - 6 variant stories (primary/secondary/success/danger/warning/info)
   - play function for click interaction
6. Run `storybook dev` — verify Button renders with violet primary
7. Run `storybook build` — verify static output

### Exit Criteria
- `pnpm --filter frontend-catalog storybook` starts with 0 errors
- Button 6 variants render correctly
- a11y addon shows 0 violations

---

## Wave 3 — Templates, Skills, Workflow (S, 3-4h)

### Steps
1. Author TPL-UI-0001 (Component Story Generator):
   - Input: component path, component name
   - Output: .stories.tsx with Meta, Default, per-variant stories, play functions
   - Uses Button story as reference output format
2. Author TPL-UI-0003 (Component Catalog Audit):
   - Input: directory path, reference token file
   - Output: JSON audit report
3. Add 4 skills to `packages/tool-registry/src/skill-catalog.ts`:
   - `generate_story`, `extract_tokens`, `audit_design_system`, `build_catalog`
   - Category: 'Frontend'
4. Register WF-FRONTEND-CATALOG workflow in prompt-library-orchestrator
5. Run tool-registry tests (DFS cycle detection)
6. Integration test: invoke TPL-UI-0001 on StatusBadge.tsx → verify 15 state stories

### Exit Criteria
- `pnpm --filter tool-registry test` passes
- prompt-library lists TPL-UI-0001, TPL-UI-0002, TPL-UI-0003
- StatusBadge generated stories compile with `tsc --noEmit`

---

## Wave 4 — Full Seed Run + CI (M, 5-6h)

### Steps
1. Run WF-FRONTEND-CATALOG against full sourcing MS component tree (~55 components)
2. Priority order: ui/ (12) → matching/ (6) → DuplicateResolution/ (4) → candidates/ (14) → layout/ (2) → common/ (4)
3. Manual review + fix: candidates/ components (complex forms, modals, async state)
4. French HR validation:
   - StatusBadge: 15 states with FRENCH_LABELS
   - KpiCard: fr-FR currency format
   - Contract-type tokens: CDI/CDD/CDIC/freelance/interim/portage/auto colors
5. Add CI job to `.github/workflows/ci.yml`:
   - Token freshness: `build:tokens` + `git diff --exit-code tokens.w3c.json`
   - Storybook build: `storybook build`
   - Tool-registry tests
6. Optional: Deploy static Storybook to Azure Static Web Apps

### Exit Criteria
- All 12 ui/ stories render with 0 a11y violations
- `storybook build` exits 0
- CI pipeline green
- KpiCard currency story shows `1 234 €` (fr-FR)

---

## Constraints
- Zero vendor lock-in (open source only)
- CLI/API for orchestration (no GUI-only tools)
- French locale support (i18n-ready)
- Stack: React 18, TypeScript strict, Ant Design 5, TailwindCSS
- Tailwind preflight disabled in Storybook (antd CSS conflict)
- react-docgen-typescript in build mode only (react-docgen in dev for speed)

## Rollback
Delete `packages/frontend-catalog/`, revert skill-catalog.ts, remove TPL-UI-* templates, `pnpm install`.
