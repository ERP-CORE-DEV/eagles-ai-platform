# BASELINE-L8: Governance, Versioning & Lifecycle

## Scope

Layer 8 covers the processes, tools, and team structures that keep a design system healthy over time: versioning strategy, visual regression testing, token pipeline from design tool to code, documentation site generation, contribution models, adoption measurement, codemod-assisted migration, and governance frameworks. Source: 147 records from `L8.jsonl`.

---

## Level 1: TL;DR

A design system without explicit governance decays into a component folder within 12 months. This layer defines the six disciplines — versioning, visual regression, token pipeline, documentation, contribution, and adoption measurement — that turn a one-time build into a living product.

---

## Level 2: Plain English

Think of a design system like a public library. Someone has to decide which books to add (contribution process), label them so people can find them (documentation), track which books are actually being borrowed (adoption measurement), repair damaged books (bug fixes), and retire outdated ones with a forwarding note to the replacement (deprecation + migration).

Without the librarian role and the processes, the shelves fill up with contradictory duplicates: 47 custom Button variants instead of 8 — a measurable "chaos index" that directly correlates with developer onboarding friction and design debt.

---

## Level 3: Technical Overview

Governance in a design system monorepo has six interlocking pillars:

1. **Versioning** — SemVer applied at package level with Changesets (preferred) or semantic-release. Token names are public API: rename = breaking change = major bump. Release cadence: major quarterly, minor bi-weekly, patch as-needed.

2. **Visual Regression Testing (VRT)** — automated per-PR screenshot diffing. Tool choice driven by budget × team size × Storybook usage: Chromatic (Storybook-native SaaS), Percy (framework-agnostic SaaS), Applitools (AI-powered enterprise), Lost Pixel (self-hosted OSS), Playwright built-in (free, no dashboard).

3. **Token Pipeline** — Figma Variables → Tokens Studio (Figma plugin with GitHub sync) → DTCG 2025.10 JSON → Style Dictionary v4 (transforms + formatters) → CSS custom properties / JS constants / native platform tokens. Supernova as all-in-one alternative.

4. **Documentation Site** — Starlight (Astro, recommended: <50 KB JS, search, i18n, versioning out of box), Nextra (Next.js, best for interactive demos), Docusaurus (versioned docs), VitePress (Vue-centric). Storybook Composition for federated multi-repo component discovery.

5. **Contribution Model** — stages: Identify → Propose (RFC/issue) → Classify (core/extended/out-of-scope) → Build → Review (automated gates + design review + a11y audit) → Release → Communicate. Classification determines the level of DS team support. USWDS lifecycle: Proposal → Experimental → Candidate → Released → Deprecated → Retired.

6. **Adoption Measurement** — four metric tiers: usage (component count, adoption %), quality (defect rate, a11y score), velocity (time-to-ship), satisfaction (NPS from consumers). Tools: Omlet (paid), react-scanner + React Scanner Studio (free), ts-morph AST scanning (DIY), Zeroheight dev-side tracking.

---

## Level 4: Core Patterns

### Pattern 1: Changesets for Monorepo Versioning

**Intent**: Provide human-readable, PR-linked changelog entries for each package in a monorepo without the complexity of per-package semantic-release configuration.

**Why over semantic-release in monorepos**: semantic-release requires per-package `.releaserc` files, per-package CI jobs, and tag-format coordination (`@scope/package@v1.2.3`). Changesets achieves the same outcome with a single `changeset` file per PR and one version PR that bumps all affected packages atomically. Sources: records 9 (Changesets docs), 57 (Changesets vs semantic-release comparison), 146 (Valtech monorepo semantic releases — complexity cost documented as "high").

```bash
# Developer workflow: create a changeset when making a PR
npx changeset

# Prompts:
# 1. Which packages are changed? (multi-select)
# 2. Bump type per package: major / minor / patch
# 3. Summary (goes into CHANGELOG.md)
# Writes: .changeset/lucky-eagle-flies.md
```

```markdown
<!-- .changeset/lucky-eagle-flies.md (committed with the PR) -->
---
"@myorg/tokens": minor
"@myorg/ui": patch
---

Add `semantic.feedback.warning` token set; fix Button disabled state contrast ratio.
```

```bash
# CI: on merge to main, Changesets opens a "Version PR" automatically
# The Version PR bumps package.json versions + updates CHANGELOG.md for each changed package
# Merging the Version PR triggers npm publish

# Manual publish (if not using Changesets GitHub Action):
npx changeset version   # bumps versions + writes changelogs
npx changeset publish   # publishes all packages with new versions to npm
```

```typescript
// .changeset/config.json — recommended settings for a design system monorepo
{
  "$schema": "https://unpkg.com/@changesets/config/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

**SemVer rules specific to design systems** (source: records 8, 125, 134):
- Token rename → `major` (token names are public API)
- New token group → `minor`
- Token value correction → `patch`
- Component prop removed → `major`
- New optional prop → `minor`
- Visual fix matching spec → `patch`
- Breaking CSS custom property rename → `major`

---

### Pattern 2: Visual Regression Testing Pipeline

**Intent**: Catch unintended visual regressions in component stories before they reach consumers. VRT is the automated quality gate for all visual changes.

**Tool decision matrix** (sources: records 21, 60, 97, 137, 142):

| Tool | Host | Pricing | Best For |
|---|---|---|---|
| Chromatic | Cloud (Storybook SaaS) | Per-snapshot (free tier: 5K/mo) | Storybook-first teams; best DX |
| Percy | Cloud (BrowserStack) | Per-snapshot | Framework-agnostic; CI-native |
| Applitools | Cloud + on-prem | Per-seat (enterprise) | AI-powered diffing; cross-browser |
| Lost Pixel | Self-hosted | Free (OSS) | Cost at scale; full control |
| Playwright VRT | Self-hosted | Free (built-in) | No budget; no dashboard needed |

**Chromatic + TurboSnap setup** (sources: records 21, 22):

```yaml
# .github/workflows/chromatic.yml
name: Chromatic
on: [push]
jobs:
  chromatic:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with: { fetch-depth: 0 }   # full history required for TurboSnap
      - uses: actions/setup-node@v4
        with: { node-version: 20 }
      - run: npm ci
      - name: Publish to Chromatic
        uses: chromaui/action@v11
        with:
          projectToken: ${{ secrets.CHROMATIC_PROJECT_TOKEN }}
          onlyChanged: true          # TurboSnap: only test stories affected by diff
          exitZeroOnChanges: false   # fail CI on unreviewed visual changes
```

**Lost Pixel self-hosted** (source: record 60):

```typescript
// lost-pixel.config.ts
import type { CustomProjectConfig } from 'lost-pixel';

export const config: CustomProjectConfig = {
  storybookShots: {
    storybookUrl: 'http://localhost:6006',
  },
  generateOnly: false,          // compare against baselines
  failOnDifference: true,
  threshold: 0,                 // zero pixel tolerance for design system components
  imagePathBaseline: '.lostpixel/baseline',
  imagePathCurrent: '.lostpixel/current',
  imagePathDifference: '.lostpixel/difference',
};
```

**2025 AI context**: VRT becomes more critical as teams adopt AI coding assistants. AI-generated UI code is error-prone for visual consistency. Design systems with strong VRT baselines serve as the accuracy benchmark — if AI output matches the VRT baseline, the AI used the design system correctly (source: record 135).

---

### Pattern 3: Token Pipeline (Figma → Code)

**Intent**: Establish a single source of truth for design tokens in Figma, synchronized to a DTCG-compliant JSON file in source control, transformed to all platform targets via Style Dictionary v4.

**Full pipeline** (sources: records 4, 14, 19, 40, 44, 140):

```
Figma Variables (designer edits)
  ↓  Tokens Studio Figma plugin (sync on save or manual push)
  ↓  GitHub PR to tokens/src/tokens.json (DTCG 2025.10 format)
  ↓  CI: Style Dictionary v4 transform
  ↓  tokens/dist/
      ├── css/variables.css      (CSS custom properties)
      ├── js/tokens.js           (ESM named exports)
      ├── ios/tokens.swift       (iOS SwiftUI)
      └── android/tokens.xml     (Android XML)
```

**DTCG 2025.10 token file** (source: record 4):

```json
{
  "color": {
    "semantic": {
      "feedback": {
        "warning": {
          "$type": "color",
          "$value": "{color.option.yellow.500}",
          "$description": "Warning state: backgrounds, borders, icons",
          "status": "stable"
        },
        "error": {
          "$type": "color",
          "$value": "{color.option.red.600}",
          "$description": "Error/destructive state",
          "status": "stable"
        }
      }
    },
    "option": {
      "yellow": {
        "500": {
          "$type": "color",
          "$value": "oklch(0.85 0.18 85)",
          "$description": "Yellow primitive — do not use directly in components"
        }
      }
    }
  },
  "motion": {
    "duration": {
      "short": {
        "$type": "duration",
        "$value": "150ms"
      },
      "medium": {
        "$type": "duration",
        "$value": "250ms"
      }
    },
    "easing": {
      "standard": {
        "$type": "cubicBezier",
        "$value": [0.4, 0, 0.2, 1]
      }
    }
  }
}
```

**Style Dictionary v4 config** (source: record 4):

```javascript
// style-dictionary.config.mjs  (ESM — SD v4 drops CJS)
import StyleDictionary from 'style-dictionary';

const sd = new StyleDictionary({
  source: ['tokens/src/**/*.json'],
  platforms: {
    css: {
      transformGroup: 'css',
      prefix: 'ds',
      buildPath: 'tokens/dist/css/',
      files: [{
        destination: 'variables.css',
        format: 'css/variables',
        options: { outputReferences: true },
      }],
    },
    js: {
      transformGroup: 'js',
      buildPath: 'tokens/dist/js/',
      files: [{
        destination: 'tokens.js',
        format: 'javascript/esm',
      }],
    },
  },
});

await sd.buildAllPlatforms();
```

**Token deprecation governance** (source: record 140):

```json
{
  "color": {
    "brand": {
      "primary": {
        "$type": "color",
        "$value": "{color.semantic.action.default}",
        "$description": "DEPRECATED: use color.semantic.action.default instead",
        "status": "deprecated",
        "deprecatedSince": "3.0.0",
        "replacedBy": "color.semantic.action.default",
        "removalVersion": "4.0.0"
      }
    }
  }
}
```

---

### Pattern 4: Documentation Site with Starlight

**Intent**: Ship a fast, searchable, versioned documentation site with zero framework lock-in. Starlight (Astro) is the recommended default; Nextra (Next.js) for interactive demo-heavy systems.

**SSG comparison** (sources: records 50, 68, 95):

| Framework | Bundle | Best For | Versioned Docs | i18n |
|---|---|---|---|---|
| Starlight (Astro) | <50 KB JS | Most teams | Built-in | Built-in (30+ locales) |
| Nextra (Next.js) | ~200 KB | Interactive code demos | Via config | Manual |
| Docusaurus | ~150 KB | API reference + blog | Built-in | Built-in |
| VitePress | ~60 KB | Vue component systems | Via plugin | Built-in |
| Fumadocs | ~80 KB | Headless customization | Built-in | Manual |

**Starlight setup** (source: record 50):

```bash
npm create astro@latest -- --template starlight
```

```javascript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    starlight({
      title: 'Design System',
      social: { github: 'https://github.com/myorg/design-system' },
      sidebar: [
        { label: 'Getting Started', autogenerate: { directory: 'getting-started' } },
        { label: 'Foundations', autogenerate: { directory: 'foundations' } },
        { label: 'Components', autogenerate: { directory: 'components' } },
        { label: 'Patterns', autogenerate: { directory: 'patterns' } },
      ],
      defaultLocale: 'en',
      locales: {
        en: { label: 'English' },
        fr: { label: 'Français' },
      },
    }),
  ],
});
```

**Storybook Composition** for federated multi-repo discovery (source: record 47):

```javascript
// .storybook/main.ts in the central documentation hub
import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  refs: {
    'core-ui': {
      title: 'Core UI Library',
      url: 'https://storybook.myorg.com/core-ui',
      expanded: true,
    },
    'data-viz': {
      title: 'Data Visualization',
      url: 'https://storybook.myorg.com/data-viz',
    },
    'marketing': {
      title: 'Marketing Components',
      url: 'https://storybook.myorg.com/marketing',
    },
  },
};
export default config;
```

---

### Pattern 5: Contribution Model and RFC Process

**Intent**: Define the path from "I need a component" to "it's in the design system" with clear classification, quality gates, and timelines.

**Contribution lifecycle** (sources: records 46, 52, 55, 65, 130, 133, 141):

```
1. IDENTIFY   Consumer team identifies a recurring need
2. PROPOSE    Open RFC issue using template (description, usage count, a11y needs)
3. CLASSIFY   DS team triages:
              - Core: DS team builds + maintains
              - Extended: contributor builds, DS team reviews
              - Out-of-scope: redirect to product-side pattern library
4. BUILD      Contributor (or DS team) implements:
              - Component code (TypeScript, tested)
              - Storybook stories (default + edge cases)
              - Accessibility audit (jest-axe + manual keyboard test)
              - Usage documentation (props table, dos/don'ts, code examples)
5. REVIEW     Automated gates (lint + tests + VRT) THEN
              Design review (matches existing patterns?) THEN
              A11y review (WCAG 2.2 AA minimum)
6. RELEASE    Version bump via Changesets, changelog entry, npm publish
7. COMMUNICATE Release notes + migration guide if breaking
```

**RFC issue template** (source: records 52, 55):

```markdown
<!-- .github/ISSUE_TEMPLATE/design-system-rfc.md -->
---
name: Design System RFC
about: Propose a new component or pattern
labels: ["ds:rfc", "needs-triage"]
---

## Problem
<!-- What user need does this address? How many surfaces use this pattern today? -->

## Proposed Solution
<!-- Component name, props sketch, visual reference -->

## Usage Evidence
<!-- Links to 3+ places where this pattern exists today in product -->

## Accessibility Considerations
<!-- Known ARIA pattern? Keyboard behavior? -->

## Alternatives Considered
<!-- What existing DS components were evaluated first? -->
```

**USWDS component lifecycle stages** (source: record 63):

```typescript
// Expose lifecycle status in component metadata (Storybook tags or JSDoc)
/**
 * @status experimental
 * @since 2.1.0
 * @expectedStable 3.0.0
 *
 * Use for: navigation between multi-step flows
 * Do not use for: single-page content (use Tabs instead)
 */
export const StepIndicator: React.FC<StepIndicatorProps> = ...
```

---

### Pattern 6: Adoption Measurement

**Intent**: Track which components are used, how often, with which props, across which repositories — to justify investment, identify unused components, and catch prop usage that signals API friction.

**Tool comparison** (sources: records 67, 71, 80, 84, 85, 96, 127, 138):

| Tool | Approach | Cost | Best For |
|---|---|---|---|
| Omlet | SaaS scanner + dashboard | Paid | Team dashboards, trend charts |
| react-scanner | CLI static analysis | Free | CI-friendly, JSON output |
| React Scanner Studio | GUI for react-scanner | Free | Visual exploration |
| ts-morph | TypeScript AST | Free | Custom prop-level analysis |
| Zeroheight | Documentation platform | Paid | Design+dev adoption together |

**react-scanner setup** (sources: records 67, 84):

```javascript
// react-scanner.config.js
module.exports = {
  crawlFrom: './src',
  includeSubComponents: true,
  importedFrom: /@myorg\/ui/,   // only count DS components
  processors: [
    ['count-components-and-props', { outputTo: '.data/ds-adoption.json' }],
  ],
};
```

```json
// .data/ds-adoption.json (sample output)
{
  "Button": {
    "instances": 247,
    "props": {
      "variant": { "primary": 142, "secondary": 63, "ghost": 42 },
      "size": { "md": 198, "sm": 31, "lg": 18 },
      "disabled": { "true": 23 }
    }
  },
  "Badge": {
    "instances": 89,
    "props": {
      "color": { "blue": 45, "green": 31, "red": 13 }
    }
  }
}
```

**ts-morph JSX scanner for prop-level analysis** (source: record 131):

```typescript
// scripts/scan-ds-usage.ts
import { Project, SyntaxKind } from 'ts-morph';

const project = new Project({ tsConfigFilePath: './tsconfig.json' });
const report: Record<string, number> = {};

for (const sourceFile of project.getSourceFiles('src/**/*.tsx')) {
  for (const jsxElement of sourceFile.getDescendantsOfKind(SyntaxKind.JsxOpeningElement)) {
    const tagName = jsxElement.getTagNameNode().getText();
    const importDecl = sourceFile.getImportDeclaration(
      d => d.getModuleSpecifierValue().startsWith('@myorg/ui')
    );
    if (importDecl) {
      report[tagName] = (report[tagName] ?? 0) + 1;
    }
  }
}

console.log(JSON.stringify(report, null, 2));
```

**Four metric tiers** (source: record 138):

```typescript
interface DesignSystemMetrics {
  // Tier 1: Usage
  adoptionRate: number;          // % of product surfaces using DS components
  componentInstanceCount: number;
  uniqueComponentsUsed: number;

  // Tier 2: Quality
  openAccessibilityIssues: number;
  openBugs: number;
  visualRegressionFailureRate: number;

  // Tier 3: Velocity
  averageContributionDays: number;   // propose → release
  releaseFrequencyPerMonth: number;

  // Tier 4: Satisfaction
  consumerNps: number;               // quarterly survey, DS consumers only
  contributorNps: number;
}
```

---

### Pattern 7: Codemod-Assisted Migration

**Intent**: Provide automated AST transforms that upgrade consumer codebases when the design system ships breaking changes, making major version adoption tractable.

**Three codemod types** (source: record 49 — Martin Fowler; records 62, 82, 83, 129, 136):

1. **Rename codemods** — component or prop renamed
2. **Restructure codemods** — prop moved from child to parent, or merged with another prop
3. **Decompose codemods** — monolithic component split into composable parts

**jscodeshift rename codemod** (sources: records 62, 129):

```typescript
// codemods/v4/Button-rename-kind-to-variant.ts
import type { Transform, JSXAttribute } from 'jscodeshift';

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  const root = j(file.source);

  // Rename prop: kind="primary" → variant="primary"
  root
    .find(j.JSXOpeningElement, { name: { name: 'Button' } })
    .find(j.JSXAttribute, { name: { name: 'kind' } })
    .forEach((path) => {
      (path.node.name as JSXAttribute['name']) = j.jsxIdentifier('variant');
    });

  return root.toSource();
};

export default transform;
```

```bash
# Consumer runs migration — Spirit design system model (record 129)
npx @myorg/codemods -p ./src -t v4/Button-rename-kind-to-variant

# Or via Hypermod community registry (record 136)
npx hypermod @myorg/button-v4-migration
```

**Token rename codemod** (source: record 83 — token migration case study):

```typescript
// codemods/tokens/v3-rename-primary-to-action.ts
import type { Transform } from 'jscodeshift';

const TOKEN_RENAMES: Record<string, string> = {
  'color.brand.primary':     'color.semantic.action.default',
  'color.brand.primaryHover': 'color.semantic.action.hover',
  'color.brand.primaryActive': 'color.semantic.action.active',
};

const transform: Transform = (file, api) => {
  const j = api.jscodeshift;
  let source = file.source;

  // Replace CSS custom property references in .ts/.tsx files
  for (const [oldToken, newToken] of Object.entries(TOKEN_RENAMES)) {
    const oldVar = `--${oldToken.replace(/\./g, '-')}`;
    const newVar = `--${newToken.replace(/\./g, '-')}`;
    source = source.replaceAll(oldVar, newVar);
  }

  return source;
};

export default transform;
```

**Multi-repo codemod execution** (source: record 82 — codemod at scale):

```bash
# multi-gitter: run codemod across all consumer repos in the GitHub org
multi-gitter run \
  "npx @myorg/codemods -p . -t v4/Button-rename-kind-to-variant" \
  --org myorg \
  --branch "chore/ds-v4-migration" \
  --pr-title "chore: migrate to Design System v4 Button API" \
  --pr-body "Automated codemod — see MIGRATION.md for manual steps"
```

---

### Pattern 8: Governance Framework

**Intent**: Define the roles, processes, and artifacts that prevent governance failure. The six-element framework applies to teams of any size.

**Six governance elements** (sources: records 72, 126, 130):

```
1. ROLES          Design system team | Contributors | Consumers | Champions
2. DECISION PATH  RFC template → triage → build → review → release
3. BACKLOG        Priority scoring (usage × pain × effort)
4. RELEASE CADENCE major quarterly, minor bi-weekly, patch as-needed
5. CONTRIBUTION   Classify → support level → quality gates → communication
6. MEASUREMENT    Four metric tiers: usage, quality, velocity, satisfaction
```

**Governance model selection** (sources: records 66, 101, 105):

| Model | Structure | Best For |
|---|---|---|
| Centralized | DS team owns all components | Small org, high consistency need |
| Federated | Product teams own, DS team reviews | Large org, autonomy needed |
| Hybrid | DS team owns core, product teams own domain | Most organizations |
| Community-driven | RFC-based, any team can ship | Open-source / very large orgs |

**Federated governance with ambassador network** (source: records 105, 132):

```typescript
// Each product team has a "DS Champion" — lightweight governance without formal RFCs
interface DsAmbassador {
  team: string;
  name: string;
  responsibilities: [
    'Attend weekly 15-min DS sync',
    'Triage DS questions within team',
    'Validate new patterns before proposing to DS backlog',
    'Report adoption blockers',
  ];
}
```

**Changelog entry template** (sources: records 125, 143):

```markdown
## 3.2.0 — 2025-10-14

### What's New
- **DataGrid**: new `virtualScrolling` prop for lists >500 rows — reduces DOM nodes by 90%
- **Tokens**: `motion.duration.scalar` CSS variable for reduced-motion scaling (0 when prefers-reduced-motion)

### Changed
- **Button**: `kind` prop renamed to `variant` — run `npx @myorg/codemods -t v3/button-kind-to-variant`
- **Tokens**: `color.brand.primary` deprecated — use `color.semantic.action.default`

### Fixed
- **Dialog**: focus trap no longer escapes when clicking iframe content
- **Badge**: contrast ratio corrected from 3.5:1 to 4.8:1 (WCAG AA)

### Removed
- **Icon**: `size="xl"` removed (deprecated since 2.4.0) — use `size="lg"` with CSS override
```

**Figma MCP + Code Connect for AI-accurate generation** (source: record 15):

```typescript
// Button.figma.tsx — Code Connect file: maps Figma component to code
import figma from '@figma/code-connect';
import { Button } from '@myorg/ui';

figma.connect(Button, 'https://figma.com/file/.../Button', {
  props: {
    label:   figma.string('Label'),
    variant: figma.enum('Variant', {
      Primary:   'primary',
      Secondary: 'secondary',
      Ghost:     'ghost',
    }),
    disabled: figma.boolean('Disabled'),
  },
  example: ({ label, variant, disabled }) => (
    <Button variant={variant} disabled={disabled}>{label}</Button>
  ),
});
```

```bash
# Publish Code Connect files — Figma Dev Mode shows exact React code
npx figma connect publish --token $FIGMA_ACCESS_TOKEN
```

---

## Adoption Checklist

- [ ] Changesets installed; every PR that modifies a package includes a `.changeset/*.md` file with correct bump type (major/minor/patch)
- [ ] Token names treated as public API — renames tracked in breaking-change log and accompanied by a rename codemod
- [ ] VRT tool chosen and integrated in CI (`chromatic.yml` or `lost-pixel.config.ts`); PRs blocked on unreviewed visual changes
- [ ] Token pipeline configured: Tokens Studio Figma plugin → DTCG JSON → Style Dictionary v4 → CSS/JS outputs; Figma Variables are the source of truth
- [ ] Documentation site deployed (Starlight recommended); includes component status badges (experimental/stable/deprecated)
- [ ] RFC issue template committed to `.github/ISSUE_TEMPLATE/`; contribution model documented in `CONTRIBUTING.md`
- [ ] Contribution quality gates automated: lint + tests + VRT pass before human review
- [ ] react-scanner (or ts-morph) runs in CI and outputs adoption JSON to `.data/`; at least Tier-1 metrics (adoption rate, instance count) tracked per sprint
- [ ] Codemods published alongside every major version; documented in `MIGRATION.md`
- [ ] Governance roles assigned: DS team owner, product team champions, review SLA defined (e.g., RFC response within 5 business days)
- [ ] Changelog is consumer-facing (product engineers, not DS internals); both design decisions and code changes documented
- [ ] Figma Code Connect files published for all stable components; Figma Dev Mode shows real component code

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Correct Approach |
|---|---|---|
| No versioning strategy | Consumers cannot safely upgrade; any change is potentially breaking | SemVer + Changesets; token renames are majors |
| Manual visual review only | Scale kills it — 100 components × 5 variants = 500 screenshots per PR | Automated VRT (Chromatic, Lost Pixel, or Playwright VRT) as required CI gate |
| Figma as source of truth without sync | Figma tokens drift from code; designers work with stale values | Tokens Studio GitHub sync; CSS variables generated from tokens JSON, not hand-coded |
| RFC process with no SLA | Proposals go stale; contributors give up and build their own | 5-business-day first response SLA; weekly triage meeting |
| Tracking only usage metrics | Cannot justify investment without velocity/satisfaction data | Four metric tiers: usage + quality + velocity + satisfaction |
| Breaking changes without codemods | Consumers block on major version; DS adoption stalls | Ship a jscodeshift codemod with every breaking API change |
| Per-snapshot VRT pricing with large system | Costs become prohibitive; teams skip VRT | Use Lost Pixel (self-hosted, free at scale) or Playwright VRT for large story counts |
| Governance as afterthought | 47 custom Button variants vs 8 with governance — $200K/year design debt | Treat governance artifacts (RFC templates, release processes) as first-class deliverables, version-controlled alongside components |
| semantic-release in monorepos | Per-package `.releaserc` complexity, CI job matrix per package, tag format conflicts | Changesets for monorepos — same outcome, much simpler setup |
| Documentation as wiki pages | Outdated instantly; not co-located with code | Documentation site generated from MDX/source; versioned docs (Docusaurus/Starlight) |

---

## Sources

| Record | URL | Authority | Key Contribution |
|---|---|---|---|
| 9 | changesets.dev | Elite | Changesets fundamentals + config |
| 57 | DS Weekly (Changesets vs semantic-release) | Strong | Comparison rationale |
| 4 | DTCG 2025.10 spec | Elite | Token file format + `$type`/`$value` |
| 21 | Chromatic docs | Elite | TurboSnap + CI integration |
| 60 | Lost Pixel docs | Strong | Self-hosted VRT config |
| 50 | Starlight docs (Astro) | Elite | SSG setup + i18n |
| 47 | Storybook Composition docs | Elite | Federated multi-repo docs |
| 46 | Polaris CONTRIBUTING.md | Elite | Real-world contribution lifecycle |
| 52 | GitHub Primer contribution | Elite | RFC template + governance |
| 63 | USWDS component lifecycle | Elite | Experimental→Released stages |
| 67 | Omlet docs | Strong | Adoption analytics |
| 84 | react-scanner | Strong | CLI static analysis setup |
| 131 | ts-morph navigation | Strong | AST prop scanning API |
| 49 | Martin Fowler codemods | Elite | Three codemod types taxonomy |
| 129 | Spirit design system codemods | Strong | Real-world jscodeshift shipping |
| 136 | Hypermod codemod library | Strong | Community codemod registry |
| 82 | Codemod at scale (multi-gitter) | Strong | Multi-repo execution pattern |
| 72 | DSRUPTR governance 6 elements | Strong | Framework taxonomy |
| 126 | Rangle.io governance | Strong | Failure modes without governance |
| 128 | Chaos index | Community | 47→8 variants ROI quantification |
| 15 | Figma Code Connect | Elite | AI-accurate code generation |
| 138 | Netguru DS metrics | Strong | Four metric tiers definition |
| 125 | Practical Design Systems | Strong | Release cadence best practices |
| 143 | UXPin changelog | Strong | Changelog format for designers+devs |

---

## Level 5: Related Documents

- [BASELINE-L1.md](BASELINE-L1.md) — Token architecture that governance must version and migrate
- [BASELINE-L2.md](BASELINE-L2.md) — Component API design; prop changes that trigger major version bumps
- [BASELINE-L3.md](BASELINE-L3.md) — Storybook story structure that VRT tools snapshot
- [BASELINE-L4.md](BASELINE-L4.md) — UX patterns whose contributions flow through the RFC process
- [BASELINE-L6.md](BASELINE-L6.md) — Accessibility audit gate that blocks contributions without WCAG 2.2 AA
- [BASELINE-L7.md](BASELINE-L7.md) — Motion tokens that must be versioned under the token pipeline
