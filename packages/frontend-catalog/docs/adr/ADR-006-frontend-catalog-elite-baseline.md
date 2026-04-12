# ADR-006: Frontend-Catalog Elite Baseline — Adoption of Reference Design-System Patterns

**Status**: Proposed · 2026-04-12
**Author**: Doc-Code-Analyst (Wave 3 Consolidator)
**Reviewers**: DS Core Team, Frontend Leads, Accessibility Guild

---

## 1. Context

The `frontend-catalog` package is the shared **tokens → stories → catalog** pipeline for RH-OptimERP frontends and any future consumer application. It is intentionally generic: it encodes no business domain, no product-specific data models, and no consumer-specific color palette. RH-OptimERP is only the first consumer.

As the catalog grows, it must remain defensible. Every technical choice — token format, primitive library, styling engine, accessibility target, release tooling — must be grounded in evidence from systems that have already solved these problems at scale, survived breaking changes, and maintained user trust across thousands of consuming applications.

This ADR codifies the adoption decisions derived from an eight-layer baseline research corpus:

- **1,103 unique sources** across 8 layers, extracted from 8 parallel research dives
- Consolidated at `baselines/consolidated/L{1..8}.jsonl`
- Documented in `baselines/BASELINE-L{1..8}.md`

The reference systems interrogated include: W3C DTCG, Style Dictionary (Amazon), Radix (WorkOS), React Aria (Adobe), shadcn/ui (Vercel), Material Design 3 (Google), Shopify Polaris, IBM Carbon, GitHub Primer, Atlassian Design System, Microsoft Fluent 2, Adobe Spectrum, USWDS, GOV.UK, PatternFly (Red Hat), Motion (Framer), TanStack, FormatJS, and the WCAG/WAI standards body.

Without this ADR, individual contributors make local decisions that accumulate into architectural drift: three different token formats, two competing animation libraries, inconsistent ARIA implementations, and per-team release scripts that cannot coordinate. This document prevents that drift by establishing a single, evidence-backed reference for every layer of the pipeline.

---

## 2. Decisions

Each decision follows the structure: **Decision** | **Rationale** | **Alternatives rejected**.

---

### Decision 1: Token Format — DTCG 2025.10 JSON + Style Dictionary v4

**Decision**: All design tokens are authored in W3C Design Tokens Community Group (DTCG) 2025.10 stable-spec JSON (`.tokens.json` extension, `$type` / `$value` / `$description` keys). The build pipeline uses Style Dictionary v4 (ESM rewrite, native DTCG support, async transforms) to emit CSS custom properties, JS ESM constants, and any additional platform targets.

**Rationale**: The DTCG 2025.10 spec is the only vendor-neutral, machine-readable token contract implemented by all major tooling simultaneously — Adobe, Amazon, Google, Microsoft, Meta, Shopify, Disney, Salesforce, and Figma have all adopted it [BASELINE-L1]. Style Dictionary v4 is the de-facto transformation tool, and its v4 ESM rewrite removes the legacy CTI coupling that caused naming conflicts in earlier versions [BASELINE-L1]. Authoring in a spec-compliant format means the pipeline is not locked to any single tool: any future DTCG-compliant processor can replace Style Dictionary without re-authoring token files.

**Alternatives rejected**:
- *Tokens Studio proprietary format*: vendor lock-in; DTCG export is a secondary step, not primary.
- *Style Dictionary v3 (CommonJS)*: deprecated; v4 is the maintained branch with native DTCG support.
- *Custom JSON schema*: no tooling ecosystem, no Figma sync, no interoperability with design tools.

---

### Decision 2: Color Space — OKLCH for Brand/Semantic Tokens, APCA for Contrast Validation

**Decision**: All color tokens are expressed in `oklch(L C H)` notation. Color scale generation uses OKLCH's perceptual uniformity property (constant hue `H`, varying `L` and `C`). Contrast validation uses APCA (Advanced Perceptual Contrast Algorithm) Lc scoring rather than WCAG 2 luminance ratios.

**Rationale**: RGB and HSL produce perceptually non-uniform scales where equal numerical steps create unequal perceived lightness differences, and hue shifts occur when adjusting lightness in blues and purples [BASELINE-L1]. OKLCH eliminates both problems, enabling formulaic scale generation and predictable dark-mode derivation — properties demonstrated at scale by Radix Colors (12-step OKLCH scales) and Tailwind v4 (migrated from HSL to OKLCH) [BASELINE-L1]. APCA, the successor algorithm targeting WCAG 3, is font-size and weight aware — it avoids the false passes that WCAG 2 luminance ratio produces for large text at borderline values [BASELINE-L1].

**Alternatives rejected**:
- *HSL*: hue shift on lightness change, perceptually non-uniform — discarded by Tailwind v4 and Radix Colors.
- *P3 hex*: no tooling for programmatic scale generation; OKLCH subsumes P3 gamut.
- *WCAG 2.x luminance ratio only*: known false passes for large light text; APCA supplements, does not replace WCAG 2.2 AA during the WCAG 3 transition period.

---

### Decision 3: Token Tier Architecture — Primitive → Semantic → Component

**Decision**: Tokens are organized in exactly three tiers:
1. **Primitive (Option) tokens**: raw values with no intent. `--color-blue-500: oklch(55% 0.18 250)`. Never consumed directly by components.
2. **Semantic (Decision) tokens**: map primitives to intent. `--color-action-primary: var(--color-blue-500)`. Changed per brand/mode without touching tier 1.
3. **Component tokens** (scoped overrides): `--button-background: var(--color-action-primary)`. Optional but required for components that need per-instance theming.

**Rationale**: A flat token set creates semantic ambiguity — consumers cannot tell whether `--blue-500` is a valid direct-use token or an internal primitive [BASELINE-L1]. The three-tier model, independently invented by Material Design 3 (reference/system/component), GitHub Primer (base/functional/component), and described by Brad Frost and Thomas Gossmann, is the converged solution across the entire industry [BASELINE-L1]. It enables theming, dark-mode, and multi-brand support without duplicating any component definition.

**Alternatives rejected**:
- *Two tiers (primitive + semantic)*: insufficient for component-scoped overrides needed by complex inputs, date pickers, and data tables.
- *Single-tier flat tokens*: no semantic clarity; rebrand requires touching every component.
- *Four or more tiers*: added complexity without demonstrated benefit from any reference system.

---

### Decision 4: Primitives Library — Radix Primitives + React Aria for Complex Widgets

**Decision**: The catalog uses **Radix Primitives** (`@radix-ui/*`) as the primary headless primitive layer for all interactive components. **React Aria** (`@react-aria/*` hooks) supplements Radix for widgets where React Aria demonstrates superior compliance: date/time pickers (13-calendar-system i18n), color pickers (ColorArea/ColorSlider/ColorWheel), and comboboxes requiring strict ARIA 1.2 `listbox` role handling.

**Rationale**: Radix Primitives (28 components, 18.6k stars) provides the `asChild` composition engine, compound component anatomy (Root/Trigger/Content/Item), and independently versioned packages that have proven resilient across 5+ years of breaking React releases [BASELINE-L2]. React Aria (50+ hooks, Adobe) applies the strictest WAI-ARIA compliance in the ecosystem and is the only library with production-tested i18n for 13 calendar systems via `@internationalized/date` — a requirement that cannot be solved at the Radix layer [BASELINE-L2]. Using both avoids forcing a single library to cover 100% of cases, which no single headless library does without compromise.

**Alternatives rejected**:
- *Headless UI (Tailwind Labs)*: only 12 components; insufficient coverage for catalog scope.
- *Ark UI / Zag*: strong cross-framework story but catalog is React-only; state-machine overhead adds bundle cost without corresponding benefit in a single-framework pipeline.
- *Base UI (MUI)*: launched 1.0 in 2026; insufficient production history at time of this ADR.
- *Ariakit alone*: excellent for composite navigation; not a full-system replacement for Radix's compound model.

---

### Decision 5: Component API Contracts — asChild/Polymorphic, forwardRef, Slot-Based

**Decision**: All catalog components expose three standard API patterns:
1. **`asChild` prop** (via `@radix-ui/react-slot`): merges ARIA attributes, event handlers, and refs onto the consumer's provided child element. Used on any component that renders a single interactive element.
2. **`React.forwardRef`**: all leaf components forward their ref to the underlying DOM element.
3. **Slot-based composition**: compound components communicate through React context; no prop-drilling; each anatomy part (`Root`, `Trigger`, `Content`, `Item`, `Indicator`) is a named export.

**Rationale**: The polymorphic `as` prop requires complex TypeScript generics and cannot safely merge refs and handlers from both caller and library [BASELINE-L2]. `asChild` via `@radix-ui/react-slot` solves this cleanly — the `Slot` component clones the consumer's child and merges props via `composeRefs` and explicit handler composition, ensuring neither side silently drops events [BASELINE-L2]. This pattern is adopted by shadcn/ui, HeroUI, and all Radix-derived systems as the standard composition contract [BASELINE-L3].

**Alternatives rejected**:
- *`as` polymorphic prop*: TypeScript generics complexity; ref merging requires custom implementation per component.
- *Render props*: verbose consumer API; out of favor since React context became standard.
- *Prop-drilling sub-component configuration*: breaks compound component anatomy model from Radix.

---

### Decision 6: Distribution Model — shadcn-Style Copy Registry + Versioned Package for Stable Primitives

**Decision**: The catalog distributes components via two complementary mechanisms:
1. **Copy registry** (shadcn/ui CLI model): components are installed into the consuming project via `npx shadcn@latest add <component>` or equivalent CLI. The source lands in `components/ui/` inside the consumer's repository. The consumer owns and modifies the code. No library update cycle can break copied components.
2. **Versioned npm package** (`@org/design-tokens`, `@org/primitives`): tokens and low-level primitives are distributed as versioned packages. Breaking changes follow SemVer and require explicit consumer upgrade.

**Rationale**: Library-distributed components impose version-lock and prevent consumers from customizing internal component structure — every upgrade is a potential breaking change requiring consumer testing [BASELINE-L3]. The copy-paste code-ownership model, pioneered by shadcn/ui (75k+ stars, 250k+ weekly npm, acquired by Vercel), gives consuming teams full autonomy while the catalog provides the initial high-quality, accessible implementation [BASELINE-L3]. Tokens and primitives remain in packages because they are stable contracts with well-defined SemVer semantics [BASELINE-L8].

**Alternatives rejected**:
- *Pure npm package for all components*: version-lock; consumer customization requires forking or `!important` overrides.
- *Copy-paste without a registry schema*: no CLI discoverability; manual copy introduces drift from catalog source.
- *Monorepo internal package only*: prevents external consumers from adopting the catalog.

---

### Decision 7: Styling Engine — Tailwind v4 @theme + CSS Variables, Not CSS-in-JS

**Decision**: Components are styled using **Tailwind CSS v4** utility classes, with all design decisions sourced from CSS custom properties (generated by the token pipeline). The `@theme` directive in Tailwind v4 maps token CSS variables to Tailwind utility classes from a single source. No CSS-in-JS library (styled-components, Emotion, vanilla-extract) is used.

**Rationale**: Tailwind v4 adopts a CSS-first `@theme` directive that generates utility classes directly from CSS custom properties — tokens become both CSS variables AND utilities from one source, eliminating the synchronization gap between token values and styling classes [BASELINE-L1]. CSS-in-JS runtime libraries add JavaScript overhead for style injection, complicate server rendering (requiring additional configuration for Next.js App Router / React Server Components), and prevent the browser's style cache from being shared across component instances [BASELINE-L3]. Tailwind v4 also completed its OKLCH migration, making it the natural pairing with Decision 2.

**Alternatives rejected**:
- *styled-components / Emotion*: runtime style injection; React Server Components incompatibility; bundle overhead.
- *vanilla-extract*: zero-runtime but requires a separate build plugin; token synchronization still manual.
- *Tailwind v3*: no `@theme` directive; CSS variable integration requires custom plugins; OKLCH migration incomplete.
- *Plain CSS modules*: no utility class generation from tokens; more verbose styling for catalog components.

---

### Decision 8: Accessibility Conformance — WCAG 2.2 AA Baseline, EAA + RGAA 4.1 for FR Market

**Decision**: The catalog targets **WCAG 2.2 Level AA** as its minimum conformance baseline (87 criteria: 32 Level A + 24 Level AA, including the 9 criteria new in 2.2). For RH-OptimERP and any consumer serving the French/EU market, the catalog additionally conforms to:
- **European Accessibility Act (EAA)**, June 2025, EN 301 549 / ETSI standard
- **RGAA 4.1** (Référentiel Général d'Amélioration de l'Accessibilité), DINUM

**Rationale**: WCAG 2.2 AA is the legal minimum across all current major accessibility legislation (EAA, Section 508, EN 301 549) [BASELINE-L6]. The EAA entered enforcement in June 2025 with direct applicability to digital products sold or operated in EU member states — making it non-optional for RH-OptimERP [BASELINE-L6]. RGAA 4.1 is the French national transposition of WCAG 2.2 with additional criteria specific to the French web ecosystem; DINUM mandates it for public-sector digital services [BASELINE-L6]. The six most prevalent failure types — low contrast, missing alt text, missing form labels, empty links/buttons, missing page language, and document structure — account for 95.9% of sites with detected errors (WebAIM Million 2024) and are addressed at the primitive and token layers of this catalog.

**Alternatives rejected**:
- *WCAG 2.1 AA only*: misses 9 new criteria including Focus Not Obscured (2.4.11), Target Size (2.5.8), and Accessible Authentication (3.3.8); not compliant with EAA.
- *WCAG 2.2 AAA*: AAA criteria are aspirational, not mandated; some (no time limits) are impractical for HR applications.
- *Self-assessed conformance without external standards*: no auditable reference; insufficient for regulated sectors.

---

### Decision 9: Accessibility Testing — axe-core + Playwright + Manual Screen Reader Matrix

**Decision**: Accessibility testing follows a five-layer pyramid:
1. **Lint time**: `eslint-plugin-jsx-a11y` in CI — catches static misuse of ARIA roles, missing labels.
2. **Unit/component time**: `jest-axe` on rendered components — automated ARIA rule violations.
3. **Catalog catalog**: `@storybook/addon-a11y` (axe-core) runs on every story render in Storybook.
4. **E2E time**: `@axe-core/playwright` in integration test suites.
5. **Manual testing**: SR matrix — NVDA + Chrome, JAWS + Edge, VoiceOver + Safari (macOS/iOS), TalkBack + Chrome (Android).

**Rationale**: Automated tools (axe-core) detect approximately 40–57% of WCAG issues; the gap is closed only by manual screen reader testing [BASELINE-L6]. axe-core (15M weekly downloads, Deque) is the industry standard integrated into Storybook, Playwright, Cypress, and Jest DOM [BASELINE-L2]. Running it at all five layers creates a defense-in-depth model where issues are caught at the cheapest possible stage [BASELINE-L6]. The manual SR matrix covers the four most-used AT/browser combinations that account for the majority of real-user AT combinations (WebAIM SR Survey 2024).

**Alternatives rejected**:
- *Automated-only testing*: misses 43–60% of real-world WCAG failures; insufficient for RGAA/EAA compliance claims.
- *IBM Equal Access Checker only*: good IBM Carbon integration but less ecosystem coverage than axe-core.
- *Manual testing only*: not scalable; cannot prevent regressions in CI.

---

### Decision 10: Motion System — Motion v12 + View Transitions API, Reduced-Motion Honored

**Decision**: The catalog motion system consists of:
1. **Motion tokens** in DTCG format (duration: 100ms/160ms/240ms/360ms/500ms; easing: standard/enter/exit/emphasized) — emitted as CSS custom properties.
2. **Motion (formerly Framer Motion) v12** for React-integrated gesture animations, layout animations, and `AnimatePresence` exit sequences.
3. **View Transitions API** (CSS + `startViewTransition()`) for navigation and page-level transitions.
4. **No-motion-first** CSS approach: animations are absent at baseline; added inside `@media (prefers-reduced-motion: no-preference)`. A `--motion-duration-scalar: 0` token reduces all calc()-based durations to zero under `prefers-reduced-motion: reduce`.

**Rationale**: The DTCG 2025.10 spec formally defines `duration` and `cubicBezier` as token types, enabling motion to be part of the same token pipeline as color and spacing [BASELINE-L7]. Motion v12 uses the Web Animations API for 120fps performance without main-thread JavaScript, supporting OKLCH color interpolation for color-based animations [BASELINE-L3, BASELINE-L7]. The no-motion-first approach, documented by Tatiana Mac and adopted by the Norton Design System's scalar pattern, is more inclusive than adding a `prefers-reduced-motion: reduce` override as an afterthought — approximately 15% of users have vestibular disorders that motion can exacerbate [BASELINE-L7].

**Alternatives rejected**:
- *GSAP*: commercial license required for many use cases; heavier than Motion v12 for catalog scope.
- *CSS-only animations*: insufficient for complex gesture/layout animations and `AnimatePresence` exit coordination.
- *React Spring*: physics-based, no View Transitions integration; ecosystem momentum shifted to Motion.
- *CSS `animation` keyword without tokens*: hardcoded `ms` values bypass the token pipeline (Polaris enforces this via stylelint).

---

### Decision 11: Content / Voice — Tone Guide + Microcopy Patterns, ICU MessageFormat

**Decision**: The catalog ships a **voice and tone guide** (inline in Storybook stories and documentation) that governs all UI copy within catalog components. The canonical rules are:
- Second person ("you", "your"); sentence case everywhere; imperative verbs first.
- Error messages follow the three-part formula: what happened / why / what to do next.
- Destructive confirmations use specific object names: "Delete report '2025 Q1'" not "Delete item".
- All strings in catalog components are externalized as ICU MessageFormat v2 message IDs from commit zero.

**Rationale**: Content design research across Mailchimp, Atlassian, IBM Carbon, Microsoft Fluent 2, and Shopify Polaris has converged on the same voice model: sentence case, second person, imperative verbs, Grade 7–8 Flesch–Kincaid [BASELINE-L5]. CXL conversion research (2023) shows specific verbs materially outperform generic ones ("Request pricing" +161% over generic CTA) — a finding directly applicable to form submission and confirmation flows [BASELINE-L5]. ICU MessageFormat is the industry standard for i18n-ready string externalization, handling plurals, gender inflection, and date/number formatting in strings rather than conditional JavaScript [BASELINE-L5].

**Alternatives rejected**:
- *Ad-hoc copy decided per feature team*: divergent voice fragments user trust signals across the product surface.
- *Printf-style `%s` string interpolation*: no plural/gender rule support; requires code branching for locale-specific grammar.
- *Fluent (Mozilla)*: smaller ecosystem than ICU; less tooling integration with react-intl.

---

### Decision 12: i18n — FormatJS react-intl + ICU, Locale-Aware Formatting

**Decision**: The catalog i18n infrastructure uses **FormatJS `react-intl`** with ICU MessageFormat v2. Locale state lives in a single `<IntlProvider>` context; message bundles are lazy-loaded per locale (never bundled together). Number, date, currency, and relative-time formatting use `Intl.*` browser APIs via react-intl wrappers. Pseudo-localization (padded strings, RTL mirror) is used in CI to catch layout breakage before real translations are available.

**Rationale**: `react-intl` is the industry standard (FormatJS, ~25KB) with full ICU MessageFormat support, Temporal API integration, and the broadest CLDR plural rule coverage of the three viable React i18n libraries [BASELINE-L5]. Lazy-loading message bundles prevents including all locales in the initial bundle — a pattern explicitly demonstrated in the baseline's provider architecture [BASELINE-L5]. Pseudo-localization is a low-cost, high-value CI gate: padded strings surface truncation regressions; RTL mirror surfaces logical-property gaps, both without requiring real translation files.

**Alternatives rejected**:
- *i18next / react-i18next*: larger ecosystem (plugins, Crowdin/Lokalise), but adds namespace loading complexity; ICU support requires the i18next-icu plugin.
- *Lingui 5*: compile-time extraction is attractive but ~2KB bundle size comes at the cost of PO format familiarity gap for translators; RSC support not yet battle-tested.
- *Build-time string inlining*: prevents runtime locale switching without page reload.

---

### Decision 13: RTL Support — Logical Properties, dir-Aware Primitives

**Decision**: All catalog components use **CSS logical properties** exclusively (`margin-inline-start` not `margin-left`, `padding-block` not `padding-top/bottom`, `border-inline-end` not `border-right`). The `dir` attribute is set at the `<html>` element by the i18n provider. Radix Primitives and React Aria handle RTL-aware positioning automatically. No separate RTL stylesheet is maintained.

**Rationale**: Physical CSS properties (`left`, `right`, `margin-left`) require a mirrored stylesheet for RTL locales, creating a maintenance burden that grows with every new component [BASELINE-L5]. CSS logical properties work with the cascade and `dir` attribute to automatically mirror layout, eliminating the duplicate stylesheet. Radix Primitives and React Aria both use the `dir` prop/context from the DOM for positioning decisions (tooltip placement, popover alignment, menu direction), making RTL support compositional rather than additive [BASELINE-L2].

**Alternatives rejected**:
- *Physical properties + RTL override stylesheet*: doubled CSS surface area; diverges on every refactor.
- *JavaScript-driven RTL detection flipping margins*: runtime cost; misses CSS transitions and paint properties.
- *RTL support deferred to consumer*: breaks the catalog's accessibility contract for any RTL-locale consumer.

---

### Decision 14: Storybook — CSF3 + Play Functions + a11y Addon

**Decision**: Every catalog component ships with a Storybook story file (`*.stories.tsx`) using **Component Story Format 3 (CSF3)**. Stories use **play functions** (via `@storybook/test`) to simulate user interactions and assert component behavior. The `@storybook/addon-a11y` addon runs axe-core automatically on every story render. Stories document all relevant component states: default, loading, error, disabled, empty, and boundary variants.

**Rationale**: CSF3 is the current stable Storybook format, enabling `args`-based story composition, auto-generated `Controls`, and TypeScript-inferred prop tables [BASELINE-L3]. Play functions transform stories from static visual snapshots into interactive acceptance tests — they execute click, type, and keyboard sequences, then assert DOM state, enabling both visual documentation and behavioral testing from a single artifact [BASELINE-L3]. The `@storybook/addon-a11y` integration means every PR that changes a component automatically runs axe-core against all its story states, catching contrast and ARIA regressions before review [BASELINE-L6].

**Alternatives rejected**:
- *CSF2 (pre-3.0 story format)*: no play functions; no TypeScript inference for argTypes; deprecated.
- *Storybook interaction tests disabled*: removes behavioral test coverage at the catalog layer.
- *Separate accessibility test suite*: duplicates story maintenance; the addon runs axe inline, requiring no separate file.

---

### Decision 15: Forms — React Hook Form + Zod Resolvers

**Decision**: All form components in the catalog are built for integration with **React Hook Form** (RHF) v7 as the form state manager, with **Zod** as the schema validation library via `@hookform/resolvers/zod`. Catalog form primitives (`Input`, `Select`, `Checkbox`, `RadioGroup`, `DatePicker`) expose `ref` forwarding and are compatible with RHF's `register` / `Controller` APIs without wrapper components.

**Rationale**: React Hook Form (42.8k stars, 12KB, zero dependencies) uses uncontrolled inputs, avoiding re-renders on every keystroke — the primary performance advantage over Formik and Redux Form at scale [BASELINE-L3]. Zod is the de-facto runtime type-safe validation library in the TypeScript ecosystem, and `@hookform/resolvers` provides first-class integration with zero boilerplate [BASELINE-L3]. Catalog components exposing standard `ref` forwarding ensure RHF's `register` function can attach to any input without wrapper abstractions.

**Alternatives rejected**:
- *Formik*: controlled inputs cause full-form re-renders on every keystroke; slower at scale.
- *Yup*: less TypeScript-native than Zod; slower inference; Zod has overtaken it in ecosystem momentum.
- *Valibot*: smaller bundle but less mature; fewer resolver integrations.
- *Custom form state management*: reinvents RHF's solved problems (dirty tracking, touched, error normalization).

---

### Decision 16: Data Tables — TanStack Table + TanStack Virtual

**Decision**: All data table implementations in the catalog use **TanStack Table v8** (headless, cross-framework, 15KB) for table logic and **`@tanstack/react-virtual`** for row virtualization at 100k+ row scale. The styled HTML table shell uses catalog semantic HTML (`<table>`, `<thead>`, `<tbody>`, `<tr>`, `<th>`, `<td>`). URL state for sort/filter is handled by `nuqs` (URL-native state management).

**Rationale**: TanStack Table v8 is headless — it provides sorting, filtering, pagination, row selection, column pinning, grouping, and virtualization logic without imposing any visual style, making it the only table primitive that can be used with any styling system [BASELINE-L2, BASELINE-L3]. `@tanstack/react-virtual` handles the windowed rendering required for 100k-row tables without a dedicated virtualized-table library [BASELINE-L3]. URL-driven state (nuqs) makes table states (active filters, sort order, page) shareable via URL — a direct user need in any HR list view.

**Alternatives rejected**:
- *AG Grid*: enterprise license required for advanced features; imposes its own styling system.
- *MUI DataGrid*: tied to MUI styling system; breaking change cycles follow MUI major versions.
- *react-table v7*: deprecated; TanStack Table v8 is the maintained successor.
- *Custom table implementation*: ARIA `grid` role keyboard behavior is complex; TanStack Table's headless model is the correct abstraction layer.

---

### Decision 17: Visual Regression Testing — Lost Pixel (OSS Self-Hosted) with Chromatic as Paid Alternative

**Decision**: The catalog's visual regression testing (VRT) pipeline uses **Lost Pixel** (self-hosted OSS) as the default configuration, running against Storybook story snapshots on every PR. Teams with budget constraints or on Storybook SaaS may substitute **Chromatic** (cloud, TurboSnap enabled). Zero pixel tolerance is enforced for design system components. Failed diffs block PR merge.

**Rationale**: Design system components have a stricter visual correctness requirement than application components — an unreviewed visual change in `Button` affects every surface in every consuming application [BASELINE-L8]. Lost Pixel (OSS, self-hosted) is the cost-effective choice for teams running their own CI infrastructure: it integrates with Storybook, supports pixel-exact diffing, and has no per-snapshot pricing [BASELINE-L8]. Chromatic (cloud, Storybook SaaS) is the best DX option for teams already on Storybook's cloud platform and provides TurboSnap (only snapshot stories affected by the diff) [BASELINE-L8]. The 2025 AI context adds urgency: AI-generated UI code is error-prone for visual consistency; VRT baselines serve as accuracy benchmarks [BASELINE-L8].

**Alternatives rejected**:
- *Playwright built-in snapshots only*: no dashboard; diff review requires manual CI artifact inspection.
- *Percy (BrowserStack)*: per-snapshot pricing becomes expensive at catalog scale; same capability as Lost Pixel.
- *No VRT*: undetected visual regressions accumulate; component upgrades cannot be safely automated.

---

### Decision 18: Versioning + Release — Changesets + SemVer + Deprecation Policy

**Decision**: The catalog monorepo uses **Changesets** for versioning and release. Every PR that changes a public API (token name, component prop, CSS custom property) must include a `.changeset/*.md` file declaring the affected packages and bump type. SemVer rules specific to design systems apply:
- Token rename → `major`; new token group → `minor`; token value correction → `patch`
- Component prop removed → `major`; new optional prop → `minor`; visual fix → `patch`

The deprecation policy follows the USWDS lifecycle model: Proposal → Experimental → Candidate → Released → Deprecated (with replacement documented) → Retired (with codemod provided).

**Rationale**: Changesets achieves atomic multi-package versioning in a monorepo with a single changeset file per PR and one version PR that bumps all affected packages simultaneously — without the per-package `.releaserc` complexity of semantic-release [BASELINE-L8]. The USWDS deprecation lifecycle is the most explicit design-system-specific deprecation model in the baseline corpus, with distinct status stages that communicate stability guarantees to consumers [BASELINE-L8]. The SemVer rules for token and component API changes are explicit: token names are public API, and any rename is a breaking change that requires a major bump.

**Alternatives rejected**:
- *semantic-release*: requires per-package `.releaserc` files in monorepos; tag-format coordination is complex; documented as "high" complexity cost [BASELINE-L8].
- *Manual changelog maintenance*: diverges from actual changes; not auditable.
- *CalVer*: no semantic signal for breaking vs. non-breaking changes; not standard in npm ecosystem.

---

### Decision 19: Docs Site — Starlight + MDX + Live Examples

**Decision**: The catalog documentation site is built with **Starlight** (Astro-based, <50KB JS client bundle). Component documentation pages are written in **MDX** and include live, interactive component examples via a Storybook `<Embed>` integration (Storybook Composition). The docs site is deployed as a static site (SSG) and supports English and French locales out of the box via Starlight's built-in i18n.

**Rationale**: Starlight is the lightest-weight documentation SSG in the baseline comparison (<50KB JS vs Nextra's ~200KB and Docusaurus's ~150KB), with versioned docs, full-text search, and i18n support built in — requiring no additional plugins for the catalog's core documentation needs [BASELINE-L8]. MDX enables component stories to be embedded directly in documentation pages, keeping live examples in sync with the implementation without manual screenshots [BASELINE-L8]. Storybook Composition enables federated component discovery when multiple teams publish their own Storybook instances, referenced from the central docs hub [BASELINE-L8].

**Alternatives rejected**:
- *Nextra (Next.js)*: ~200KB client bundle; best for interactive demo-heavy systems but adds Next.js build complexity to a docs-primary site.
- *Docusaurus*: strong API reference + blog; ~150KB; Storybook Composition integration requires more configuration.
- *VitePress*: Vue-centric; React ecosystem expects React-compatible MDX rendering.
- *Storybook as sole docs*: excellent for component reference; insufficient for conceptual documentation, token guides, and migration content.

---

### Decision 20: Contribution Governance — RFC Process + CODEOWNERS + ADR Log

**Decision**: The catalog governance model has three interlocking mechanisms:
1. **RFC process**: new components or pattern changes are proposed via a GitHub Issue using the DS RFC template. Classification into Core / Extended / Out-of-scope is the DS team's responsibility within 5 business days.
2. **CODEOWNERS**: `tokens/` and `primitives/` directories require DS Core team approval (`@ds-core`). `components/` may be approved by any senior frontend engineer. `docs/` is open contribution.
3. **ADR log**: all architectural decisions are documented in `docs/adr/ADR-NNN-*.md` following the Michael Nygard format. The ADR index is maintained in `docs/adr/README.md`. Superseded ADRs are marked with their superseding ADR number, not deleted.

**Rationale**: Design systems without explicit governance decay into "component soup" — measurably tracked as a "chaos index" of duplicate variants per concept [BASELINE-L8]. The RFC-then-classify model, documented across IBM Carbon, Atlassian, and USWDS contribution workflows, is the standard path from consumer need to catalog component [BASELINE-L8]. CODEOWNERS enforces the review contract at the git layer, making it impossible for token or primitive changes to merge without the domain expert who understands downstream impact [BASELINE-L8]. The ADR log prevents re-litigating settled decisions — a direct cost observed in design system teams that operate without architectural records.

**Alternatives rejected**:
- *Open contribution without triage*: 47+ custom Button variants is the documented outcome [BASELINE-L8].
- *PR description only (no RFC)*: insufficient for decisions requiring design + engineering + a11y alignment before implementation starts.
- *Wiki-based decision log*: not version-controlled with the code; diverges from implementation.

---

## 3. Consolidated Stack

| Layer | Choice | Version | Reference Systems |
|---|---|---|---|
| Token format | W3C DTCG JSON | 2025.10 stable | Adobe, Amazon, Google, Microsoft, Meta, Shopify, Figma |
| Token build | Style Dictionary | v4 (ESM) | Amazon; de-facto standard |
| Token design tool | Tokens Studio for Figma | latest | 264k Figma users; GitHub sync |
| Color space | OKLCH | CSS Color Level 4 | Evil Martians, Radix Colors, Tailwind v4 |
| Contrast algorithm | APCA / Lc | WCAG 3 candidate | Myndex, Deque |
| Token tiers | Primitive → Semantic → Component | — | Material 3, GitHub Primer, Brad Frost |
| Primary headless primitives | Radix Primitives | latest per-package | shadcn/ui, HeroUI, WorkOS |
| Complex widget primitives | React Aria | `@react-aria/*` latest | Adobe Spectrum |
| Slot composition | `@radix-ui/react-slot` | latest | All Radix-derived systems |
| Styling engine | Tailwind CSS | v4 | Tailwind Labs, shadcn/ui |
| Distribution | shadcn/ui copy registry + npm package | CLI 3.0 | Vercel/shadcn, WorkOS |
| Component API | asChild + forwardRef + CSF3 | — | Radix, shadcn, React Aria |
| Accessibility standard | WCAG 2.2 AA + EAA + RGAA 4.1 | WCAG Oct 2023; EAA Jun 2025 | W3C, DINUM, EU |
| A11y testing: lint | eslint-plugin-jsx-a11y | latest | Standard React ecosystem |
| A11y testing: unit | jest-axe / axe-core | latest | Deque (15M weekly npm) |
| A11y testing: catalog | @storybook/addon-a11y | latest | Storybook, Deque |
| A11y testing: E2E | @axe-core/playwright | latest | Deque, Playwright |
| Motion library | Motion (Framer Motion) | v12 | shadcn/ui default |
| Motion tokens | DTCG duration + cubicBezier | 2025.10 | Material 3, Shopify Polaris, IBM Carbon |
| View transitions | View Transitions API (CSS + JS) | Chrome 126+, CSS Level 4 | MDN, Chrome team |
| Reduced motion | No-motion-first + `--motion-duration-scalar` | — | Tatiana Mac, Norton DS |
| Voice guide | Sentence case, second person, imperative | — | Mailchimp, Atlassian, IBM Carbon, Polaris |
| String format | ICU MessageFormat v2 | — | Unicode, FormatJS |
| i18n library | react-intl (FormatJS) | ~25KB | Adobe, IBM, industry standard |
| RTL | CSS logical properties + `dir` attribute | CSS Logical Level 1 | MDN, React Aria, Radix |
| Stories | Storybook CSF3 + play functions | Storybook 8.x | shadcn, IBM Carbon, Adobe |
| Forms | React Hook Form + Zod | RHF v7, Zod v3 | 42.8k stars; shadcn/ui default |
| Data tables | TanStack Table v8 + TanStack Virtual | v8 | shadcn/ui data-table guide |
| Visual regression | Lost Pixel (OSS) / Chromatic (paid) | latest | BASELINE-L8 VRT matrix |
| Versioning | Changesets | latest | Monorepo standard |
| Deprecation lifecycle | USWDS stages | — | USWDS contribution model |
| Docs site | Starlight (Astro) | latest | <50KB JS; i18n built-in |
| Docs format | MDX + Storybook Composition | — | Storybook, Astro |
| ADR format | Michael Nygard | — | ADR log `docs/adr/` |

---

## 4. Consequences

### Positive

- **Interoperability**: DTCG-spec tokens can be consumed by any DTCG-compliant tool (Figma Variables, Tokens Studio, Supernova, future tools) without re-authoring. Token files are portable across build pipelines.
- **Accessibility by construction**: Radix Primitives and React Aria wire WAI-ARIA patterns correctly at the primitive layer. Consumer teams inherit correct keyboard behavior and ARIA semantics without implementing them per component. RGAA/EAA compliance is achievable through the catalog rather than per-team remediation.
- **Developer experience**: The copy-registry model means teams are never blocked by DS team release cycles on internal customization. `asChild` composition and CSF3 play functions reduce the boilerplate required to use and test catalog components.
- **Performance**: Tailwind v4 CSS-first styling avoids runtime style injection costs. TanStack Table + Virtual handles 100k rows without library-level performance tuning. Motion v12's Web Animations API path runs at 120fps off the main thread.
- **Theming and multi-consumer readiness**: The three-tier token architecture enables any consumer to swap brand colors, dark mode, or density without touching component code. The catalog is generic by design.
- **Governance clarity**: The RFC → classify → build → review → release → communicate lifecycle gives every contributor a clear path and every consumer a stable contract.

### Negative

- **Learning curve**: DTCG JSON syntax, OKLCH color notation, APCA contrast calculation, and the `asChild` composition pattern are not universally familiar. Onboarding requires investment in documentation and pairing.
- **Tailwind v4 maturity**: Tailwind v4 was released recently; ecosystem plugins (shadcn/ui, HeroUI) are on varying adoption timelines. Some plugin APIs may change before v4 stabilizes.
- **Dual primitive dependency**: Using both Radix Primitives and React Aria means two headless libraries in the dependency tree. Teams must understand which primitive covers which component type to avoid parallel implementations.
- **Lost Pixel operational overhead**: Self-hosted VRT requires maintaining a CI runner with a headless browser and a baseline image store. Chromatic's cloud model eliminates this cost but introduces per-snapshot pricing.
- **Copy-registry ownership**: When teams own their component copies, catalog updates do not propagate automatically. Consuming teams must actively pull updates via CLI and resolve conflicts. This is intentional (code ownership) but requires an update communication discipline.

### Neutral

- **React-only**: The catalog is React TypeScript. The choice of Radix Primitives (React-only) over Ark UI (cross-framework) is a deliberate scope decision. Future multi-framework expansion would require a primitives layer substitution.
- **No design-tool enforcement**: The catalog cannot enforce that Figma designs use the token variables — token drift from design is a process problem, not a tooling one. Tokens Studio sync bridges the gap but does not eliminate human error.
- **WCAG 3 transition**: APCA is included as a supplementary contrast check during the WCAG 2/3 transition. When WCAG 3 reaches Candidate Recommendation status, this ADR should be revisited to determine whether APCA becomes the sole contrast standard.

---

## 5. Adoption Roadmap

### Phase 1: Token Foundation (Weeks 1–3)

**Deliverables**:
- `tokens/src/` directory with DTCG 2025.10 JSON: primitive color scales (OKLCH), semantic color tokens (light + dark), spacing, typography, motion, radius, shadow.
- Style Dictionary v4 config emitting `dist/css/variables.css` and `dist/js/tokens.js`.
- Tailwind v4 `@theme` config consuming the CSS custom properties.
- CI step: `sd build` runs on every PR touching `tokens/src/`.

**Exit criteria**: `npm run build:tokens` produces artifact with zero errors. Light and dark mode CSS custom properties verified in browser DevTools. Token naming passes Nathan Curtis taxonomy lint rule (no raw color names in semantic tier).

**Owner role**: Design Systems Engineer + Designer (token authoring).

---

### Phase 2: Primitives and Composition Layer (Weeks 3–5)

**Deliverables**:
- `@radix-ui/*` and `@react-aria/*` installed and documented in `docs/primitives/`.
- `@radix-ui/react-slot` `Slot` wrapper and `composeRefs` utility exported from `src/primitives/`.
- Base `Button`, `Dialog`, `Popover`, `Select`, `Tooltip`, `Tabs` built on Radix; `DatePicker`, `ColorPicker` built on React Aria.
- All primitives pass `jest-axe` + `@storybook/addon-a11y` with zero violations.

**Exit criteria**: All 6 Radix-backed components and 2 React Aria-backed components pass axe-core automated checks. Each has a Storybook story with play function. NVDA + Chrome manual test documented.

**Owner role**: Accessibility-focused Frontend Engineer.

---

### Phase 3: Component Catalog First Release (Weeks 5–8)

**Deliverables**:
- 15 catalog components in `components/ui/`: Button, Badge, Input, Textarea, Select, Checkbox, RadioGroup, Switch, Dialog, Sheet, Popover, Tooltip, Tabs, Card, DataTable (TanStack Table + Virtual).
- shadcn-style `registry.json` published; `npx catalog-cli add <component>` working.
- `@org/design-tokens` npm package published at v0.1.0 via Changesets.
- Chromatic or Lost Pixel VRT baseline established for all 15 components.

**Exit criteria**: All 15 components installable via CLI into a fresh Next.js 15 app without manual configuration. VRT baseline images committed. Zero axe-core violations across all story states.

**Owner role**: DS Core Team.

---

### Phase 4: Forms, Tables, and Motion (Weeks 8–11)

**Deliverables**:
- React Hook Form + Zod integration guide in docs.
- `FormField`, `FormLabel`, `FormMessage`, `FormDescription` wrapper components that bridge RHF `Controller` and catalog inputs.
- Motion token CSS custom properties emitted from token pipeline.
- `useReducedMotion` hook in `src/hooks/`.
- `AnimatedPresence` wrapper using Motion v12 with no-motion-first defaults.
- `DataTable` with server-side sort/filter/paginate + URL state (nuqs).

**Exit criteria**: Form demo with Zod validation renders with zero axe violations and all error messages linked via `aria-describedby`. Motion tests verify `--motion-duration-scalar: 0` collapses all animation durations. DataTable handles 50k rows at <200ms render.

**Owner role**: Frontend Engineer + DS Core Team.

---

### Phase 5: i18n, RTL, and Content Layer (Weeks 11–13)

**Deliverables**:
- `react-intl` `IntlProvider` wrapper exported from catalog.
- All catalog component strings externalized as ICU message IDs in `src/locales/en.json` and `src/locales/fr.json`.
- Pseudo-localization CI step (padded strings + RTL mirror) added to test pipeline.
- All components verified with `dir="rtl"` in Storybook.
- Voice and tone guide published in `docs/content/voice-and-tone.md`.
- Microcopy formulas (button labels, error messages, confirmation dialogs, empty states) documented with before/after examples.

**Exit criteria**: French locale stories render correctly with all strings translated. RTL Storybook viewport shows no layout breakage. Pseudo-localization CI step passes.

**Owner role**: UX Writer + i18n Engineer.

---

### Phase 6: Governance Infrastructure (Weeks 13–15)

**Deliverables**:
- RFC GitHub Issue template at `.github/ISSUE_TEMPLATE/design-system-rfc.md`.
- `CODEOWNERS` file with `@ds-core` for `tokens/` and `primitives/`.
- ADR log at `docs/adr/` with ADR-001 through ADR-006 (this document).
- Changesets `config.json` with design-system SemVer rules documented in `CONTRIBUTING.md`.
- USWDS lifecycle status JSDoc tags on all components.
- Adoption tracking: `react-scanner` config to measure component usage across consuming repos.

**Exit criteria**: First non-DS-team RFC submitted and classified within 5 business days. Version PR generated by Changesets GitHub Action on merge to main. Component lifecycle status visible in Storybook via tags.

**Owner role**: DS Tech Lead + Engineering Manager.

---

### Phase 7: Docs Site Launch (Weeks 15–18)

**Deliverables**:
- Starlight site at `apps/docs/` with English + French locales.
- Getting Started, Foundations (tokens, color, spacing, motion), Components (one page per component with live Storybook embed), Patterns (8 patterns from L4), Accessibility guide, Contributing guide.
- Storybook Composition: central Storybook at `storybook.ds.org` with refs to per-team Storybooks.
- Search enabled (Starlight built-in Pagefind).
- `docs.ds.org` deployment from `main` branch on merge.

**Exit criteria**: Docs site Lighthouse score ≥95 on all four categories. All component pages have live interactive examples. Search returns relevant results for "button", "form", "dark mode", "RTL".

**Owner role**: DS Core Team + Technical Writer.

---

## 6. Risk Register

| # | Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|---|
| R01 | Tailwind v4 plugin API changes before ecosystem stabilizes | Medium | High | Pin Tailwind v4 minor version; monitor shadcn/ui migration notes; maintain CSS variable fallback that works without Tailwind |
| R02 | WCAG 3 / APCA specification changes before finalization | High | Medium | Document APCA as supplementary; maintain WCAG 2.2 AA as primary standard; ADR review trigger on WCAG 3 CR |
| R03 | Component copy-registry diverges from catalog source | High | Medium | CLI `--check` command diffs consumer copy against catalog source; changelog entry required on every catalog update |
| R04 | Radix Primitives major version breaks composition API | Low | High | Pin `@radix-ui/*` per-package; shadcn/ui upgrade guide is the canonical migration path; React Aria as fallback for any dropped Radix component |
| R05 | Lost Pixel infrastructure maintenance burden exceeds team capacity | Medium | Low | Chromatic free tier (5K snapshots/month) as immediate fallback; cost documented in ADR-006 |
| R06 | React Aria + Radix dual dependency creates conflicting ARIA attributes | Low | High | Explicit ownership matrix (which components use which library); integration tests asserting correct ARIA tree |
| R07 | ICU MessageFormat v2 extraction tooling not supported by translation vendor | Low | Medium | react-intl supports both ICU v1 and v2; Phrase, Lokalise, and Crowdin support ICU — verify vendor contract before commit |
| R08 | RGAA 4.1 requirements beyond WCAG 2.2 AA not fully covered | Medium | High | RGAA audit by DINUM-certified auditor at Phase 3 milestone; RGAA delta tracked in `docs/accessibility/rgaa-gaps.md` |
| R09 | Motion v12 API churn (recently renamed from Framer Motion) | Medium | Low | Pin to v12.x; Motion has published stable API commitment post-rename; WCAG fallback is CSS transitions (no library dependency) |
| R10 | Contributor RFC backlog blocks team velocity | Medium | Medium | 5-business-day triage SLA enforced; Extended classification delegates to contributor; auto-close after 60 days without progress |
| R11 | TanStack Table v8 ARIA grid compliance gaps for screen readers | Low | High | Consumer responsibility documented explicitly (TanStack Table does not auto-inject `aria-rowcount`/`aria-colindex`); catalog wrapper adds required ARIA |
| R12 | Token pipeline Figma → DTCG → CSS drift when designers edit without Tokens Studio | High | Medium | CI validates `tokens/src/*.tokens.json` DTCG schema on every PR; Tokens Studio write-back from code to Figma documented in onboarding |

---

## 7. Open Questions

1. **Token package scope**: Should `@org/design-tokens` be a single npm package or split into `@org/tokens-primitives` and `@org/tokens-semantic`? Splitting allows consumers to extend primitives without inheriting semantic decisions. Decision deferred to Phase 1 exit.

2. **React Aria vs Radix boundary**: The current decision gives React Aria ownership of DatePicker, ColorPicker, and comboboxes. Should `NumberField`, `SearchField`, and `TimeField` (all React Aria specialties) also use React Aria, or be built on Radix Input + Zod validation? Needs spike in Phase 2.

3. **Chromatic vs Lost Pixel for public CI**: If the catalog repository is open-source, Lost Pixel self-hosted VRT requires a server. Is there a budget for Chromatic free tier (5K snapshots/month), or should Playwright built-in screenshot diffing be the fallback?

4. **Storybook version target**: Storybook 8.x is the current stable. Storybook 9 (2026 roadmap) may change the addon-a11y API. Should the catalog pin to Storybook 8.x and define an upgrade trigger, or track latest minor?

5. **Density tokens**: The three-tier architecture covers color, spacing, and motion. Should a density axis (compact / default / comfortable) be included in Phase 1 tokens, or deferred? Atlassian DS includes density as a non-color token axis [BASELINE-L1].

6. **Server Components compatibility**: React Server Components (Next.js App Router, Remix) do not support `useContext` in server-side renders. All Radix Primitives and the `IntlProvider` require client components. Should the catalog export explicit `"use client"` boundaries, or document this as consumer responsibility?

7. **Storybook MCP server**: Storybook released an MCP server in 2025 that exposes story metadata to AI agents, preventing hallucinated component usage [BASELINE-L3]. Should this be included in the catalog's developer tooling contract?

8. **EAA enforcement scope**: The EAA (June 2025) applies to products sold in EU member states. For SaaS HR products, the scope includes web applications. Has legal confirmed whether RH-OptimERP's specific deployment model triggers EAA enforcement, or does RGAA 4.1 (French public sector) apply instead?

---

## 8. References

### Baseline Research Corpus

- `baselines/BASELINE-L1.md` — Layer 1: Tokens (155 sources: W3C, Google, Amazon, Microsoft, Adobe, GitHub, Shopify, IBM, Atlassian, Radix)
- `baselines/BASELINE-L2.md` — Layer 2: Primitives (137 sources: W3C APG, Adobe, WorkOS, Tailwind Labs, eBay, Angular CDK)
- `baselines/BASELINE-L3.md` — Layer 3: Components (161 sources: Adobe, Vercel/shadcn, WorkOS, MUI, IBM, Microsoft, Shopify, GitHub)
- `baselines/BASELINE-L4.md` — Layer 4: Patterns (157 sources: Atlassian, IBM, Shopify, Salesforce, PatternFly, GOV.UK, Baymard, NNG)
- `baselines/BASELINE-L5.md` — Layer 5: Content & Voice (92 sources: Atlassian, IBM, Shopify, Adobe, Material 3, FormatJS, Unicode CLDR)
- `baselines/BASELINE-L6.md` — Layer 6: Accessibility (137 sources: W3C/WAI WCAG 2.2, WAI-ARIA 1.2, APG, Deque/axe-core, RGAA 4.1, ETSI EN 301 549)
- `baselines/BASELINE-L7.md` — Layer 7: Motion (117 sources: Material 3, IBM, Shopify, Adobe, Microsoft, Motion/Framer, GSAP, DTCG, WCAG)
- `baselines/BASELINE-L8.md` — Layer 8: Governance (147 sources: Changesets, Chromatic, Lost Pixel, Starlight, USWDS, Atlassian, IBM Carbon)

**Total corpus**: 1,103 unique sources across 8 layers.

Consolidated JSONL: `baselines/consolidated/L1.jsonl` through `baselines/consolidated/L8.jsonl`

### External Specifications and Tools

- W3C Design Tokens Format Module 2025.10: `designtokens.org`
- Style Dictionary v4: `github.com/style-dictionary/style-dictionary`
- Radix Primitives: `radix-ui.com/primitives`
- React Aria: `react-spectrum.adobe.com/react-aria`
- shadcn/ui CLI 3.0: `ui.shadcn.com`
- Tailwind CSS v4: `tailwindcss.com`
- WCAG 2.2: `w3.org/TR/WCAG22`
- WAI-ARIA APG: `w3.org/WAI/ARIA/apg`
- RGAA 4.1: `accessibilite.numerique.gouv.fr`
- European Accessibility Act (EAA): `ec.europa.eu/social/eaa`
- axe-core: `github.com/dequelabs/axe-core`
- Motion v12: `motion.dev`
- TanStack Table v8: `tanstack.com/table`
- FormatJS react-intl: `formatjs.io`
- Changesets: `github.com/changesets/changesets`
- Lost Pixel: `lost-pixel.com`
- Starlight: `starlight.astro.build`
- Michael Nygard ADR format: `github.com/joelparkerhenderson/architecture-decision-record`

---

*This ADR was synthesized by the Doc-Code-Analyst (Wave 3 Consolidator) from the 8-layer elite baseline research corpus. Superseded by: none. Supersedes: none. Related: see `docs/adr/README.md` for full ADR index.*
