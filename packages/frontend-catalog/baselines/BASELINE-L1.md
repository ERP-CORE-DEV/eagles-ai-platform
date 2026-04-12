# Layer 1 — Tokens: Elite Frontend Design-System Baseline

> Generic capability baseline synthesized from 155 sources across elite (W3C, Google, Amazon, Microsoft, Adobe, GitHub, Shopify, IBM, Atlassian, Radix), high, and medium authority.
> Intended as a reference for the `frontend-catalog` package, not tied to any single consumer.

---

## Scope of this layer

Design tokens are the atomic, platform-agnostic encoding of every design decision — color, spacing, typography, motion, elevation, radius — expressed as named key/value pairs in a machine-readable format. They are the contract between design tools and code, and when structured properly, the single source of truth for every visual property in a multi-platform system.

In the tokens → stories → catalog pipeline, this layer is the foundation everything else rests on. Tokens are authored in Figma (as variables) or in JSON, transformed by a build pipeline (Style Dictionary, Terrazzo, or Tokens Studio), and emitted as CSS custom properties, Sass variables, JS constants, or Swift/Kotlin types. Nothing at the component, pattern, or catalog layer is allowed to contain hard-coded values; all visual decisions must be token references.

"Elite" at this layer means: DTCG-spec-compliant JSON as the source format, a three-tier token architecture (option → decision → component), OKLCH as the color space with APCA contrast validation, an automated CI/CD pipeline that publishes token packages on every design-system change, and support for at least three modes (light, dark, high-contrast) without duplicating any component.

---

## Reference systems (top-tier)

- **W3C Design Tokens Community Group (DTCG) — 2025.10 stable spec** — Canonical format definition: `$type`/`$value`/`$description` JSON, 13 token types, multi-file Resolver Module. Adopted by Adobe, Amazon, Google, Microsoft, Meta, Shopify, Disney, Salesforce, Figma. `designtokens.org`
- **Style Dictionary v4 (Amazon)** — Most-starred transformation tool. ESM rewrite, native DTCG support, removed CTI coupling, async transforms. The de-facto build pipeline standard. `github.com/style-dictionary/style-dictionary`
- **Tokens Studio for Figma** — 264k Figma users, W3C DTCG v1 compliant, multi-mode, bidirectional GitHub sync. `docs.tokens.studio`
- **Material Design 3 / Material You (Google)** — Three-tier reference/system/component architecture, dynamic color (5 key colors → 65-tone palettes), motion easing/duration tokens as named specs. `m3.material.io`
- **Radix Colors** — Gold standard for 12-step OKLCH color scales with defined semantic use per step, APCA-based contrast targets, auto dark-mode. `radix-ui.com/colors`
- **IBM Carbon Design System** — Role-based token system with 4 themes, AI-specific token suite (2024), motion non-linear duration scale. `carbondesignsystem.com`
- **Primer Design System (GitHub)** — Three-tier (base/functional/component), 9 themes including high-contrast variants, 1000+ a11y issues resolved through tokens. `primer.style`
- **Shopify Polaris Tokens** — Private palette tokens + public alias API, 12 hues × 10-16 shades, uniform contrast ratios. Open-sourced as `@shopify/polaris-tokens`. `github.com/Shopify/polaris-tokens`
- **Adobe Spectrum** — Tokens as design decisions as data, platform scales, color themes, component states, migrating to Core Tokens ecosystem. `spectrum.adobe.com`
- **Atlassian Design System** — Intent-based naming (not color values), dark/high-contrast modes, Forge app theme inheritance, non-color token axes (density/motion/typography). `atlassian.design`
- **Fluent 2 (Microsoft)** — Two-layer global/alias architecture, transitioning to DTCG, comprehensive naming reference in fluentui-token-pipeline. `fluent2.microsoft.design`
- **Evil Martians (OKLCH ecosystem)** — Definitive case for OKLCH migration, Harmony palette, Harmonizer tool, apcach APCA library, practical Tailwind integration. `evilmartians.com`
- **Nathan Curtis / EightShapes** — Canonical naming taxonomy (namespace-category-concept-property-variant-state), the original 2016 tokens reference still in use. `medium.com/eightshapes-llc`
- **Tailwind CSS v4** — CSS-first `@theme` directive: all tokens become CSS variables AND utility classes from a single source. OKLCH migration complete. `tailwindcss.com`
- **APCA / Myndex** — Perceptual contrast algorithm replacing WCAG 2 luminance ratio for WCAG 3. Lc scoring is font-size and weight aware. `github.com/Myndex/SAPC-APCA`

---

## Core patterns

### Pattern 1: Three-Tier Token Architecture (Option → Decision → Component)

**Problem it solves:** Hard-coded values make theming, rebrand, and dark-mode require touching every component. One-tier flat token sets create semantic ambiguity.

**Canonical implementation:**
- **Tier 1 — Option tokens** (also called global, reference, or primitive): raw values with no intent. `--color-blue-500: oklch(55% 0.18 250)`. These are never consumed directly by components.
- **Tier 2 — Decision tokens** (semantic/alias): map options to intent. `--color-action-primary: var(--color-blue-500)`. These change per mode/brand without touching tier 1.
- **Tier 3 — Component tokens** (optional but improves DX): scope overrides per component. `--button-background: var(--color-action-primary)`.

Sources: Brad Frost "Many Faces of Themeable Design Systems", Material Design 3 "Design Tokens", GitHub Primer "UI Color System", Thomas Gossmann "Three Class Token Society", Stefanie Fluin "Pyramid Token Structure".

```css
/* Tier 1: option.tokens.json → generated CSS */
:root {
  --color-blue-500: oklch(55% 0.18 250);
  --color-blue-600: oklch(48% 0.20 250);
  --spacing-4: 1rem;
}

/* Tier 2: decision tokens (semantic) — overridden per brand/mode */
:root {
  --color-action-primary: var(--color-blue-500);
  --color-action-primary-hover: var(--color-blue-600);
  --space-component-gap: var(--spacing-4);
}

/* Tier 3: component tokens — consumed in component CSS */
.button {
  background: var(--button-background, var(--color-action-primary));
  padding: var(--button-padding, var(--space-component-gap));
}
```

---

### Pattern 2: W3C DTCG JSON as Source Format

**Problem it solves:** Proprietary token formats lock teams to a single tool; the DTCG 2025.10 stable spec provides a vendor-neutral, machine-readable format implemented by all major tools.

**Canonical implementation:**
Use `$type`, `$value`, `$description` keys. File extension `.tokens.json`. Media type `application/design-tokens+json`. The 13 primitive types: `color`, `dimension`, `fontFamily`, `fontWeight`, `duration`, `cubicBezier`, `number`, `strokeStyle`, plus composite types: `border`, `shadow`, `transition`, `typography`, `gradient`.

Sources: "Design Tokens Format Module 2025.10", "Design Tokens Color Module 2025.10", "Design Tokens Resolver Module 2025.10", Francesco Improta "Understanding W3C Design Token Types".

```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": { "colorSpace": "oklch", "components": [0.55, 0.18, 250] },
        "$description": "Primary brand action color"
      }
    }
  },
  "typography": {
    "heading-lg": {
      "$type": "typography",
      "$value": {
        "fontFamily": "{font.family.sans}",
        "fontSize": "{font.size.xl}",
        "fontWeight": "{font.weight.bold}",
        "lineHeight": 1.25
      }
    }
  },
  "motion": {
    "ease-standard": {
      "$type": "cubicBezier",
      "$value": [0.4, 0, 0.2, 1]
    }
  }
}
```

---

### Pattern 3: OKLCH as Color Space for Token Scales

**Problem it solves:** RGB and HSL produce perceptually uneven scales — equal numerical steps produce unequal perceived differences, and hue shifts occur (blue→purple) when adjusting lightness. OKLCH is perceptually uniform, enabling formulaic scale generation and predictable dark-mode generation.

**Canonical implementation:**
Use `oklch(L C H)` in all color tokens. L=0–1 lightness, C=0–0.4 chroma, H=0–360 hue. For dark mode: lower L for backgrounds, raise L for text, keep H constant. P3 gamut accessible above sRGB gamut boundary.

Sources: Evil Martians "OKLCH in CSS: Why We Moved from RGB and HSL", MDN `oklch()` reference, Tailwind v4 "HSL → OKLCH migration", Radix Colors 12-step OKLCH scales, "Design Tokens Color Module 2025.10".

```css
/* Formulaic OKLCH scale — hue stays constant, L+C vary */
:root {
  --color-brand-100: oklch(95% 0.04 250);
  --color-brand-200: oklch(88% 0.07 250);
  --color-brand-300: oklch(78% 0.12 250);
  --color-brand-400: oklch(67% 0.16 250);
  --color-brand-500: oklch(55% 0.18 250); /* base */
  --color-brand-600: oklch(46% 0.18 250);
  --color-brand-700: oklch(37% 0.16 250);
  --color-brand-800: oklch(28% 0.12 250);
  --color-brand-900: oklch(18% 0.07 250);
}

/* Dark mode: adjust L and C, never re-author hues */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background-default: oklch(14% 0.02 250);
    --color-text-default: oklch(92% 0.02 250);
  }
}
```

---

### Pattern 4: Automated Token Pipeline (CI/CD for Design Tokens)

**Problem it solves:** Manual handoff of token values from design to code introduces drift, delays, and human error. Every design system change should automatically build and publish updated token packages.

**Canonical implementation:**
1. Figma Variables / Tokens Studio as design source of truth
2. JSON committed to version control (GitHub)
3. Style Dictionary v4 transforms tokens to platform outputs
4. Semantic versioning via Conventional Commits + semantic-release
5. Published as npm package (`@org/design-tokens`)
6. Consuming apps update via standard package management

Sources: dev.to "Building a Design Token Ecosystem: Source of Truth to Automated Distribution", Supernova "Navigating the Future of Design Tokens", Tokens Studio docs "Remote Token Storage", Style Dictionary v4 migration guide.

```typescript
// style-dictionary.config.ts (v4, ESM)
import StyleDictionary from 'style-dictionary';
import { register } from '@tokens-studio/sd-transforms';

register(StyleDictionary);

const sd = new StyleDictionary({
  source: ['tokens/**/*.tokens.json'],
  platforms: {
    css: {
      transformGroup: 'tokens-studio',
      prefix: 'ds',
      buildPath: 'dist/css/',
      files: [
        {
          destination: 'tokens.css',
          format: 'css/variables',
          options: { outputReferences: true },
        },
      ],
    },
    ts: {
      transformGroup: 'tokens-studio',
      buildPath: 'dist/',
      files: [
        {
          destination: 'tokens.ts',
          format: 'javascript/es6',
        },
      ],
    },
  },
});

await sd.buildAllPlatforms();
```

---

### Pattern 5: Multi-Mode Token Architecture (Light/Dark/High-Contrast/Density)

**Problem it solves:** Each theme variant requires its own token values without duplicating component definitions. The Resolver Module enables per-mode token sets that swap at the semantic tier.

**Canonical implementation:**
Use the DTCG Resolver Module (`.resolver.json`) for multi-file theming, or CSS custom property overrides scoped to data attributes / media queries.

Sources: "Design Tokens Resolver Module 2025.10", Figma "Modes for Variables", Atlassian "Design Tokens and Theming", IBM Carbon "4 themes: White/G10/G90/G100", GitHub Primer "9 themes including high-contrast".

```css
/* decision-light.css — generated from light mode token set */
:root,
[data-theme="light"] {
  --color-surface-default:    oklch(98% 0.01 250);
  --color-text-default:       oklch(15% 0.03 250);
  --color-border-subtle:      oklch(88% 0.02 250);
}

/* decision-dark.css — same token names, different values */
[data-theme="dark"] {
  --color-surface-default:    oklch(14% 0.02 250);
  --color-text-default:       oklch(92% 0.02 250);
  --color-border-subtle:      oklch(28% 0.03 250);
}

/* High-contrast override responds to OS preference */
@media (prefers-contrast: more) {
  :root {
    --color-text-default:    oklch(0% 0 0);
    --color-surface-default: oklch(100% 0 0);
    --color-border-subtle:   oklch(20% 0 0);
  }
}
```

---

### Pattern 6: Semantic Token Naming Taxonomy

**Problem it solves:** Tokens named by value (`--color-blue-500`) break when the brand color changes. Tokens named by intent (`--color-action-primary`) remain stable and self-documenting.

**Canonical implementation:**
Six-level naming: `{namespace}-{category}-{concept}-{property}-{variant}-{state}`. Not all levels required; use minimum sufficient for disambiguation. State tokens are modifiers on semantic tokens.

Sources: Nathan Curtis "Naming Tokens in Design Systems", Smashing Magazine "Best Practices For Naming Design Tokens" (Nate Baldwin/Intuit), Francesco Improta "Structuring Design Tokens for Interactive States", Workleap Hopper "inset/stack space naming".

```typescript
// Token naming examples at each tier

// Tier 1 — option (value-descriptive)
const options = {
  'color.blue.500':    'oklch(55% 0.18 250)',
  'spacing.4':         '1rem',
  'font.weight.bold':  700,
};

// Tier 2 — decision (intent-descriptive, with state variants)
const decisions = {
  'color.action.primary.default':  '{color.blue.500}',
  'color.action.primary.hover':    '{color.blue.600}',
  'color.action.primary.disabled': '{color.neutral.300}',
  'space.inset.default':           '{spacing.4}',   // padding
  'space.stack.default':           '{spacing.4}',   // margin
};

// Tier 3 — component (scoped, rarely needed)
const components = {
  'button.background.default':  '{color.action.primary.default}',
  'button.background.hover':    '{color.action.primary.hover}',
};
```

---

### Pattern 7: Type-Safe Token Consumption in TypeScript

**Problem it solves:** Token names as plain strings provide no IDE autocompletion, allow typos, and break silently when tokens are renamed.

**Canonical implementation:**
Use `vanilla-extract` `createThemeContract`, Panda CSS type-generation, or generate a typed constants module from Style Dictionary output.

Sources: vanilla-extract "Zero-Runtime Stylesheets in TypeScript", Panda CSS docs "Tokens", dev.to "Exploring Typesafe Design Tokens in Tailwind 4", Tailwind v4 type inference.

```typescript
// Generated tokens.ts (Style Dictionary output)
export const tokens = {
  color: {
    action: {
      primary: {
        default: 'var(--ds-color-action-primary-default)',
        hover:   'var(--ds-color-action-primary-hover)',
      },
    },
  },
  space: {
    inset: { default: 'var(--ds-space-inset-default)' },
  },
} as const;

type TokenPath<T, P extends string = ''> =
  T extends string
    ? P
    : { [K in keyof T]: TokenPath<T[K], P extends '' ? `${string & K}` : `${P}.${string & K}`> }[keyof T];

type DesignToken = TokenPath<typeof tokens>;
// ^ "color.action.primary.default" | "color.action.primary.hover" | ...

// Usage in components — full autocomplete, no magic strings
import { tokens } from '@org/design-tokens';
const style = { background: tokens.color.action.primary.default };
```

---

### Pattern 8: APCA-Based Contrast Validation for Color Tokens

**Problem it solves:** WCAG 2 luminance ratio is perceptually inaccurate — it can pass low-contrast text on small fonts and fail high-contrast decorative elements. APCA scores are font-size and weight aware.

**Canonical implementation:**
Validate all color-pair tokens (text on background, icon on surface) against APCA Lc thresholds: Lc 15 = minimum non-text, Lc 30 = minimum large text, Lc 45 = UI elements, Lc 60 = body text (9px+), Lc 75 = fluent body text. Run validation in CI as part of the token build.

Sources: Myndex SAPC-APCA GitHub, Myndex apca-w3 (W3C-licensed version), Evil Martians apcach tool, Atmos.style APCA+WCAG2 palette builder, Radix Colors "APCA-based contrast targets", Designsystemet "WCAG 3.0 Introduces New Contrast Method".

```typescript
// Token contrast validation (CI step, using apca-w3)
import { calcAPCA } from 'apca-w3';
import { colorParsley } from 'colorparsley';
import { tokens } from './tokens.generated';

interface ContrastRule {
  text: string;
  background: string;
  minLc: number;
  label: string;
}

const rules: ContrastRule[] = [
  { text: '#1a1a2e', background: '#f8f8ff', minLc: 60, label: 'body text on default surface' },
  { text: '#1a1a2e', background: '#e8e8ff', minLc: 45, label: 'label on subtle surface' },
];

for (const rule of rules) {
  const lc = Math.abs(calcAPCA(
    colorParsley(rule.text),
    colorParsley(rule.background),
  ));
  if (lc < rule.minLc) {
    throw new Error(`Contrast fail: ${rule.label} — Lc ${lc.toFixed(1)} < ${rule.minLc}`);
  }
}
```

---

## Adoption checklist for frontend-catalog

- [ ] **DTCG-compliant JSON source** — All tokens are stored in `.tokens.json` files using `$type`/`$value`/`$description` from the 2025.10 stable spec. No proprietary formats.
- [ ] **Three-tier architecture enforced** — Option tokens never directly referenced in components; semantic (decision) tokens form the component API; component tokens used only where per-component override is necessary.
- [ ] **OKLCH color space throughout** — Zero `rgb()`, `hsl()`, or hex literals in option tokens; all colors expressed as `oklch(L C H)` with P3 gamut annotation where applicable.
- [ ] **APCA contrast validation in CI** — Every color-pair in the semantic tier is validated against APCA Lc thresholds in the token build pipeline; pipeline fails on contrast regressions.
- [ ] **Style Dictionary v4 pipeline** — `sd-transforms` registered, DTCG `$type`/`$value` natively handled, ESM output, CSS custom properties and TypeScript constants emitted.
- [ ] **Multi-mode support** — Light, dark, and high-contrast modes defined as separate decision-token sets; `prefers-color-scheme` and `prefers-contrast` media queries respected.
- [ ] **Typed token constants** — Style Dictionary emits a TypeScript module; no raw CSS variable strings used in component code; `TokenPath<>` or equivalent provides IDE autocompletion.
- [ ] **Figma Variables bidirectional sync** — Tokens Studio or native Figma Variables export keeps JSON source of truth in sync with design tool; sync runs on every design-system PR.
- [ ] **Semantic naming taxonomy documented** — Token naming convention (namespace/category/concept/property/variant/state) is written into the catalog's CONTRIBUTING guide and enforced by a linter or naming validator.
- [ ] **Published as versioned npm package** — `@org/design-tokens` published via semantic-release on every merge to main; CHANGELOG generated from Conventional Commits.
- [ ] **Motion and spacing tokens included** — Token set covers not only color but duration (`ms`), easing (`cubic-bezier`), spacing (`rem`/`px`), typography composites, border radius, shadow, and z-index.
- [ ] **Storybook Design Token addon configured** — Token values rendered in Storybook alongside components so consumers can browse the full token surface without reading JSON.

---

## Anti-patterns

1. **Hard-coded values in components** — Using `color: #1a73e8` or `padding: 16px` directly in component CSS. Failure mode: every rebrand or theme change requires grep-and-replace across hundreds of components; dark mode requires a parallel set of overrides with no structural constraint.

2. **Flat single-tier token sets** — Exposing only primitive tokens (`--color-blue-500`) as the public API. Failure mode: consuming teams reference raw values, semantic meaning is lost, and multi-brand support requires duplicating every component.

3. **HSL or hex in new token definitions** — Authoring tokens in HSL or hex when the target system uses OKLCH. Failure mode: perceptually uneven scales, unpredictable dark-mode generation, and loss of P3 gamut access.

4. **WCAG 2 ratio as sole contrast gate** — Passing color tokens through only WCAG 2.1 4.5:1 / 3:1 checks. Failure mode: small or light-weight text passes the ratio but fails perceptual readability; APCA scores better predict real-world legibility.

5. **Token names encoding current values** — Naming semantic tokens `--color-text-dark-blue` instead of `--color-text-primary`. Failure mode: when the brand color changes from blue to green, all token names become misleading and require a breaking rename.

6. **Skipping the CI build step** — Checking generated CSS/JS outputs into the repository alongside JSON source. Failure mode: source and output drift silently; developers edit generated files; the pipeline becomes optional rather than authoritative.

---

## Sources (full citation list)

### Primary (quality score 9–10)

**DTCG Specification**
- Design Tokens Format Module 2025.10 — https://www.designtokens.org/tr/drafts/format/
- Design Tokens Color Module 2025.10 — https://www.designtokens.org/tr/drafts/color/
- Design Tokens Resolver Module 2025.10 — https://www.designtokens.org/tr/2025.10/resolver/
- Design Tokens Glossary — https://www.designtokens.org/glossary/
- DTCG GitHub Repository — https://github.com/design-tokens/community-group
- W3C Stable Version Announcement — https://www.w3.org/community/design-tokens/2025/10/28/design-tokens-specification-reaches-first-stable-version/

**Style Dictionary / Terrazzo / Tooling**
- Style Dictionary GitHub (Amazon) — https://github.com/style-dictionary/style-dictionary
- Style Dictionary v4 Docs — https://styledictionary.com/info/tokens/
- Style Dictionary DTCG Docs — https://styledictionary.com/info/dtcg/
- Style Dictionary v4 Migration — https://styledictionary.com/versions/v4/migration/
- Tokens Studio Docs — https://docs.tokens.studio/
- Tokens Studio Figma Plugin GitHub — https://github.com/tokens-studio/figma-plugin
- sd-transforms GitHub — https://github.com/tokens-studio/sd-transforms
- Terrazzo Getting Started — https://terrazzo.app/docs/
- Terrazzo DTCG Guide — https://terrazzo.app/docs/guides/dtcg/

**Color Systems**
- OKLCH in CSS — Evil Martians — https://evilmartians.com/chronicles/oklch-in-css-why-quit-rgb-hsl
- oklch() — MDN — https://mdn/docs/Web/CSS/Reference/Values/color_value/oklch
- Material Design 3 Color — https://m3.material.io/styles/color
- Radix Colors — https://www.radix-ui.com/colors
- Radix Color Scales — https://www.radix-ui.com/colors/docs/palette-composition/scales
- Radix Color Use Cases — https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale
- Radix Colors GitHub — https://github.com/radix-ui/colors
- material-color-utilities GitHub — https://github.com/material-foundation/material-color-utilities
- Harmony (Evil Martians) — https://github.com/evilmartians/harmony
- APCA Algorithm — https://github.com/Myndex/SAPC-APCA
- APCA W3C — https://github.com/Myndex/apca-w3

**Reference Design Systems**
- Atlassian Design Tokens — https://atlassian.design/foundations/tokens/design-tokens/
- Carbon Color Tokens — https://carbondesignsystem.com/elements/color/tokens/
- USWDS Design Tokens — https://designsystem.digital.gov/design-tokens/
- Fluent 2 Design Tokens — https://fluent2.microsoft.design/design-tokens
- Primer UI Color System — https://primer.style/foundations/color/overview/
- Primer Primitives GitHub — https://github.com/primer/primitives
- Shopify Polaris Color Tokens — https://polaris-react.shopify.com/tokens/color
- Shopify Polaris GitHub — https://github.com/Shopify/polaris-tokens
- Adobe Spectrum Design Tokens — https://spectrum.adobe.com/page/design-tokens/
- Adobe Spectrum GitHub — https://github.com/adobe/spectrum-tokens
- Carbon GitHub — https://github.com/carbon-design-system/carbon
- Panda CSS Tokens — https://panda-css.com/docs/theming/tokens
- Panda CSS GitHub — https://github.com/chakra-ui/panda
- vanilla-extract — https://vanilla-extract.style/
- shadcn/ui Theming — https://ui.shadcn.com/docs/theming
- Radix Themes Color — https://www.radix-ui.com/themes/docs/theme/color
- M3 Design Tokens — https://m3.material.io/foundations/design-tokens
- M3 Motion Token Specs — https://m3.material.io/styles/motion/easing-and-duration/tokens-specs

**Naming & Architecture**
- Naming Tokens — Nathan Curtis — https://medium.com/eightshapes-llc/naming-tokens-in-design-systems-9e86c7444676
- Reimagining Token Taxonomy — Nathan Curtis — https://medium.com/eightshapes-llc/reimagining-a-token-taxonomy
- Tokens in Design Systems (10 Tips) — Nathan Curtis — https://medium.com/eightshapes-llc/tokens-in-design-systems-25dd82d58421
- Token Taxonomy for Intuit — Nate Baldwin — https://medium.com/@NateBaldwin/creating-a-flexible-design-token-taxonomy-for-intuits-design-system-81c8ff55c59b
- Design Token-Based UI Architecture — Martin Fowler — https://martinfowler.com/articles/design-token-based-ui-architecture.html
- Themeable Design Systems — Brad Frost — https://bradfrost.com/blog/post/creating-themeable-design-systems/
- Many Faces of Themeable Design Systems — Brad Frost — https://bradfrost.com/blog/post/the-many-faces-of-themeable-design-systems/

**Figma**
- Guide to Variables in Figma — https://help.figma.com/hc/en-us/articles/15339657135383-Guide-to-variables-in-Figma
- Modes for Variables — https://help.figma.com/hc/en-us/articles/15343816063383-Modes-for-variables
- Variables in Dev Mode — https://help.figma.com/hc/en-us/articles/27882809912471-Variables-in-Dev-Mode
- Tailwind v4 — Tailwind Blog — https://tailwindcss.com/blog/tailwindcss-v4
- Tailwind Theme Variables — https://tailwindcss.com/docs/theme

### Secondary (quality score 7–8)

**Accessibility & Color**
- WCAG 3.0 New Contrast Method — Designsystemet — https://designsystemet.no/en/best-practices/accessibility/contrast
- Colors — Designsystemet — https://designsystemet.no/en/fundamentals/design-tokens/colors/
- prefers-contrast — MDN — https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-contrast
- OKLCH Color Palettes — LogRocket — https://blog.logrocket.com/oklch-css-consistent-accessible-color-palettes/
- apcach (Evil Martians) — https://evilmartians.com/opensource/apcach
- Harmonizer — https://harmonizer.evilmartians.com/
- Atmos Style — https://atmos.style/
- Exploring OKLCH Ecosystem — Evil Martians — https://evilmartians.com/chronicles/exploring-the-oklch-ecosystem-and-its-tools
- Better Dynamic Themes with OKLCH — Evil Martians — https://evilmartians.com/chronicles/better-dynamic-themes-in-tailwind-with-oklch-color-magic
- oklch() — CSS-Tricks — https://css-tricks.com/almanac/functions/o/oklch/

**Pipeline & Tooling**
- Building a Design Token Ecosystem — dev.to — https://dev.to/timges/building-a-design-token-ecosystem-from-source-of-truth-to-automated-distribution-gpg
- Token Format DTCG vs Legacy — Tokens Studio — https://docs.tokens.studio/manage-settings/token-format
- Remote Storage Integrations — Tokens Studio — https://docs.tokens.studio/token-storage/remote
- Cobalt UI — https://cobalt-ui.pages.dev/
- Terrazzo GitHub — https://github.com/terrazzoapp/terrazzo
- DTCG Examples — https://github.com/terrazzoapp/dtcg-examples
- postcss-design-tokens — https://github.com/csstools/postcss-plugins/tree/main/plugins/postcss-design-tokens
- Token CSS — https://tokencss.com/
- Open Props — https://open-props.style/
- TokiForge — https://github.com/TokiForge/tokiforge
- Supernova Design Tokens — https://www.supernova.io/design-tokens
- Supernova Scalable Token Architecture — https://www.supernova.io/blog/scalable-token-architecture-principles
- State of Design Tokens 2024 — https://www.supernova.io/state-of-design-tokens
- Specify — https://specifyapp.com/
- Zeroheight Design Tokens — https://zeroheight.com/feature/design-tokens/
- Zeroheight DTCG Blog — https://zeroheight.com/blog/whats-new-in-the-design-tokens-spec/
- Knapsack Tokens — https://www.knapsack.cloud/feature-listing/design-tokens-theming

**Token Architecture & Naming**
- Three Class Token Society — Thomas Gossmann — https://gos.si/blog/inside-design-tokens-the-three-class-token-society
- Pyramid Token Structure — Stefanie Fluin — https://stefaniefluin.medium.com/the-pyramid-design-token-structure-the-best-way-to-format-organize-and-name-your-design-tokens-ca81b9d8836d
- Design Tokens Architecture — Feature-Sliced Design — https://feature-sliced.design/blog/design-tokens-architecture
- Best Practices Naming — Smashing Magazine — https://www.smashingmagazine.com/2024/05/naming-best-practices/
- Compound Tokens — Francesco Improta — https://designtokens.substack.com/p/decoding-compound-tokens
- Token Governance — Francesco Improta — https://designtokens.substack.com/p/design-tokens-governance
- Interactive States — Francesco Improta — https://designtokens.substack.com/p/structuring-design-tokens-for-interactive
- W3C Token Types — Francesco Improta — https://designtokens.substack.com/p/understanding-w3c-design-token-types
- One Token One Value — Francesco Improta — https://designtokens.substack.com/p/one-token-one-value
- Motion Tokens Naming — Francesco Improta — https://designtokens.substack.com/p/motion-tokens-naming-your-movement
- Tokens vs Variables — Francesco Improta — https://designtokens.substack.com/p/design-tokens-and-variables
- Design Tokens Pills Newsletter — https://designtokens.substack.com/
- Tokens Beyond Colors — Bumble Tech — https://medium.com/bumble-tech/design-tokens-beyond-colors-typography-and-spacing-ad7c98f4f228
- Responsive Tokens — https://medium.com/@hurleymandrew/responsive-tokens-universal-design-systems-e90de50ac00a
- Mastering Typography — UX Collective — https://uxdesign.cc/mastering-typography-in-design-systems-with-semantic-tokens-and-responsive-scaling-6ccd598d9f21
- Motion Design Tokens — Oscar Gonzalez — https://medium.com/@ogonzal87/animation-motion-design-tokens-8cf67ffa36e9
- Design Tokens Architecture Tetrisly — https://medium.com/design-bootcamp/design-tokens-variables-architecture-in-tetrisly-design-system-part-2-taxonomy-2504f959cbb1
- Synchronizing Figma Variables — Nate Baldwin — https://medium.com/@NateBaldwin/synchronizing-figma-variables-with-design-tokens-3a6c6adbf7da
- What Are Design Tokens? — CSS-Tricks — https://css-tricks.com/what-are-design-tokens/
- Design Tokens for Designers — Penpot — https://penpot.app/blog/design-tokens-for-designers/
- Developer's Guide Tokens/CSS Variables — Penpot — https://penpot.app/blog/the-developers-guide-to-design-tokens-and-css-variables/
- Evolution of Tokens 2025 — Design Systems Collective — https://www.designsystemscollective.com/the-evolution-of-design-system-tokens-a-2025-deep-dive-into-next-generation-figma-structures-969be68adfbe

**Reference Production Systems**
- Multi-Brand Token System — Hike One/Signify — https://hike.one/work/signify-multi-branded-design-system
- Serendie Design Tokens (Mitsubishi) — https://serendie.design/en/foundations/design-tokens/
- Serendie GitHub — https://github.com/serendie/design-token
- Nord Design Tokens — https://nordhealth.design/tokens/
- Nord Changelog — https://nordhealth.design/changelog/tokens/
- Atlassian Developer Theming — https://developer.atlassian.com/platform/forge/design-tokens-and-theming/
- Hopper Design System — https://hopper.workleap.design/
- Hopper Semantic Color — https://hopper.workleap.design/tokens/semantic/color
- Hopper Core Motion — https://hopper.workleap.design/tokens/core/motion
- Polaris Palettes and Roles — https://polaris-react.shopify.com/design/colors/palettes-and-roles
- Primer Foundations Color — https://primer.style/foundations/color/overview/
- Spectrum Token Visualizer — https://opensource.adobe.com/spectrum-tokens/visualizer/
- Mozilla Protocol Design Tokens — https://protocol.mozilla.org/docs/fundamentals/design-tokens.html
- California Design System Tokens — https://designsystem.california.gov/style/tokens/
- Deutsche Telekom Design Tokens — https://github.com/telekom/design-tokens
- Seeds Motion (Sprout Social) — https://seeds.sproutsocial.com/visual/motion/
- Carbon Motion — https://carbondesignsystem.com/elements/motion/overview/
- SLDS Design Tokens (Salesforce) — https://developer.salesforce.com/docs/platform/lwc/guide/create-components-css-design-tokens.html
- Fluent UI Token Pipeline Naming — https://microsoft.github.io/fluentui-token-pipeline/naming.html
- USWDS GitHub — https://github.com/uswds/uswds

**Storybook / DX**
- Managing Design Tokens in Storybook — https://dev.to/psqrrl/managing-design-tokens-using-storybook-5975
- Storybook Design Token Addon — https://storybook.js.org/addons/storybook-design-token
- Typesafe Tokens in Tailwind 4 — dev.to — https://dev.to/wearethreebears/exploring-typesafe-design-tokens-in-tailwind-4-372d
- shadcn/ui Tailwind v4 — https://ui.shadcn.com/docs/tailwind-v4

**Historical / Context**
- Salesforce Theo (origin of design tokens) — https://github.com/salesforce-ux/theo
- Diez Framework — https://diez.org/
- Diez GitHub — https://github.com/diez/diez
- Style Dictionary v4 Release Plans — Tokens Studio Blog — https://tokens.studio/blog/style-dictionary-v4-plan
- Awesome Design Tokens — https://github.com/sturobson/Awesome-Design-Tokens
- Awesome Design Systems — https://github.com/klaufel/awesome-design-systems
- Brad Frost & Ian Frost Design Tokens Course — https://designtokenscourse.com

---

*See also: [BASELINE-L2.md](BASELINE-L2.md) (Primitives), [BASELINE-L3.md](BASELINE-L3.md) (Components), [BASELINE-L7.md](BASELINE-L7.md) (Motion), [BASELINE-L8.md](BASELINE-L8.md) (Governance)*
