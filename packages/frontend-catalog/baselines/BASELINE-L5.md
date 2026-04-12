# BASELINE-L5 — Content & Voice
> Layer 5 of 8 | frontend-catalog design-system pipeline

---

## Scope

This document covers **UX writing, voice and tone, microcopy patterns, and internationalization (i18n/l10n)** — the textual layer of the design system. It answers: what words go in buttons, errors, empty states, tooltips, and confirmation dialogs; how those words are written in English; and how the pipeline makes them available in any language or locale.

Sources: 92 records from Atlassian, IBM Carbon, Shopify Polaris, Adobe Spectrum, Material Design 3, Microsoft Fluent, Apple HIG, GOV.UK, Mailchimp, Nielsen Norman Group, Intuit, Slack, FormatJS/react-intl, i18next, Lingui, Unicode CLDR, Phrase, Lokalise, Crowdin, and CXL conversion research.

---

## Level 1 — TL;DR

Content design is not copywriting applied after the fact — it is a design material. Write in second person, sentence case, active voice, imperative verbs. Externalize all strings from commit 0 using ICU MessageFormat so plurals, genders, and date/number formats are locale-correct without code branching.

---

## Level 2 — Plain English

Every word on a screen is a decision. "Are you sure?" is a waste of space because it answers nothing. "Delete report?" with buttons labeled "Delete" and "Keep" is a decision a user can make in one second. Content design is the practice of making every word earn its position — choosing the right verb, the right tone for the moment, and ensuring the text still works when translated into French, Arabic, or Japanese.

---

## Level 3 — Technical Overview

The content layer has two concerns:

1. **Voice and tone** — the rules for writing UI copy (capitalization, verb patterns, error copy, confirmation dialogs, empty states)
2. **Internationalization infrastructure** — the technical plumbing that makes copy swappable per locale (ICU MessageFormat, provider pattern, plural rules, pseudo-localization testing)

Voice is consistent (brand identity); tone shifts by context (errors are empathetic, success states are warm, destructive confirmations are precise and neutral). The i18n stack relies on CLDR plural rules and ICU syntax so that pluralization, gender inflection, and number formatting are handled in strings — never in conditional JavaScript.

---

## Level 4 — Core Patterns

---

### Pattern 1: Voice Model and Tone Matrix

**Sources**: Mailchimp Voice and Tone, Atlassian Voice and Tone Principles, IBM Carbon Content Overview, Microsoft Fluent 2, Slack Voice

**The canonical voice model** (converged across all elite design systems):

| Dimension | Principle |
|---|---|
| Person | Second person: "you", "your" — never "the user" |
| Capitalization | Sentence case everywhere: "Add team member", not "Add Team Member" |
| Verbs | Imperative first: "Save", "Delete report", not "You can save" |
| Length | Fewest words that communicate: test against Hemingway Grade 7–8 |
| Register | Conversational but not casual — "We couldn't find that file" not "File not found" |
| Humor | Permitted when genuine; never forced; never in error states |

**Tone matrix** — tone shifts by emotional context:

| Context | Tone | Example |
|---|---|---|
| Onboarding / first-use | Warm, encouraging | "You're all set. Your workspace is ready." |
| Success feedback | Positive, brief | "Changes saved." |
| Warning | Calm, informative | "This action cannot be undone." |
| Error | Empathetic, not blaming, actionable | "We couldn't connect. Check your network and try again." |
| Destructive confirmation | Neutral, precise, no softening | "Delete report '2025 Q1'? This can't be recovered." |
| Empty state (first-use) | Encouraging, action-oriented | "Start by adding your first record." |
| Empty state (no results) | Diagnostic, helpful | "No results for 'invoices'. Try removing some filters." |

**Anti-pattern**: "Are you sure you want to do this?" — vague, wastes the user's attention. Replace with a specific question and action-labeled buttons.

---

### Pattern 2: Microcopy Formulas

**Sources**: Polaris Actionable Language, Intuit Confirmations, Beth Aitman "Confirmation Dialog", UX Collective "Are you sure?", NNG "3 I's of Microcopy", CXL Microcopy ROI study

#### Button labels

```
Primary destructive:  [Verb] + [Object]   → "Delete report"
Primary constructive: [Verb] + [Object]   → "Add team member"
Cancel pair:          [Verb] [Object] / Keep [Object]   → "Delete report" / "Keep report"
Common exceptions:    Done, Close, Cancel, OK — verb alone is sufficient when context is clear
Never:                "Click here", "Submit", "Yes/No" as button pair for destructive actions
```

**Conversion evidence** (CXL, 2023): specific verbs outperform generic ones measurably. "Request a quote" → "Request pricing": +161% clicks. "We'll never spam you" in placeholder context: +15% form completions. "Shop Medicare Plans" vs "Get started now": +192% clicks.

#### Error messages

Three required parts, in order:

```
1. What happened (brief, no blame):   "Your session expired."
2. Why it happened (if not obvious):  "Sessions end after 30 minutes of inactivity."
3. What to do next (actionable):      "Sign in again to continue."
```

Combined: "Your session expired after 30 minutes of inactivity. Sign in again to continue."

Never: "Error 401 — Authentication failed."

```tsx
// ErrorMessage.tsx — renders inline below form field
interface ErrorMessageProps {
  id: string;         // must match aria-describedby on the input
  message: string;
}

export function ErrorMessage({ id, message }: ErrorMessageProps) {
  return (
    <p
      id={id}
      role="alert"
      aria-live="polite"
      style={{
        color: "var(--color-status-error)",
        fontSize: "var(--text-sm)",
        marginTop: "var(--spacing-1)",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
      }}
    >
      <span aria-hidden="true">⚠</span>
      {message}
    </p>
  );
}
```

#### Tooltip copy

Rules (Intuit, NNG): header ≤60 characters, body ≤130 characters. Lead with the verb introducing the function. No links inside tooltips (keyboard users cannot reach them). Never use a tooltip to explain something that should be visible on the page.

```tsx
// TooltipContent.tsx — tooltip body copy template
interface TooltipContentProps {
  header?: string;  // optional short label (≤60 chars)
  body: string;     // ≤130 chars, starts with verb
}

export function TooltipContent({ header, body }: TooltipContentProps) {
  return (
    <div style={{ maxWidth: 220, padding: "var(--spacing-2) var(--spacing-3)" }}>
      {header && (
        <p style={{ fontWeight: "var(--font-semibold)", fontSize: "var(--text-sm)", margin: "0 0 var(--spacing-1)" }}>
          {header}
        </p>
      )}
      <p style={{ fontSize: "var(--text-sm)", margin: 0, color: "var(--color-text-secondary)" }}>
        {body}
      </p>
    </div>
  );
}
```

#### Confirmation dialogs (destructive)

```
Title:   [Verb] + [specific object name, not placeholder]
         "Delete report '2025 Q1'" — NOT "Delete item"
Body:    Consequence if irreversible: "This report and all its data will be permanently deleted."
         Undo note if reversible: "You can undo this action within 30 days."
Buttons: [Destructive verb + object] + [Keep object]
         "Delete report" + "Keep report"
```

---

### Pattern 3: Internationalization Architecture

**Sources**: FormatJS react-intl, i18next/react-i18next, Lingui 5.0, Unicode CLDR, Lokalise React i18n guide, Phrase ICU guide, Crowdin software localization

**Three viable React i18n libraries**

| Library | Bundle | Strengths |
|---|---|---|
| `react-intl` (FormatJS) | ~25KB | Industry standard, full ICU, Temporal support |
| `react-i18next` | ~10KB | Largest ecosystem, Crowdin/Lokalise plugins, lazy namespace loading |
| `@lingui/react` (Lingui 5) | ~2KB | Compile-time extraction, PO format, RSC support |

**Provider pattern** — locale state lives in one provider; all components consume via hook, never via prop drilling:

```tsx
// i18n/provider.tsx
import { IntlProvider } from "react-intl";
import { useState, createContext, useContext } from "react";

interface I18nContextValue {
  locale: string;
  setLocale: (locale: string) => void;
}

const I18nContext = createContext<I18nContextValue>({ locale: "en", setLocale: () => {} });

export function useI18n() {
  return useContext(I18nContext);
}

interface I18nProviderProps {
  children: React.ReactNode;
  defaultLocale?: string;
}

// Lazy-load message bundles — never include all locales in initial bundle
async function loadMessages(locale: string): Promise<Record<string, string>> {
  const messages = await import(`../locales/${locale}.json`);
  return messages.default;
}

export function I18nProvider({ children, defaultLocale = "en" }: I18nProviderProps) {
  const [locale, setLocaleState] = useState(defaultLocale);
  const [messages, setMessages] = useState<Record<string, string>>({});

  async function setLocale(newLocale: string) {
    const msgs = await loadMessages(newLocale);
    setMessages(msgs);
    setLocaleState(newLocale);
  }

  return (
    <I18nContext.Provider value={{ locale, setLocale }}>
      <IntlProvider locale={locale} messages={messages} defaultLocale="en">
        {children}
      </IntlProvider>
    </I18nContext.Provider>
  );
}
```

---

### Pattern 4: ICU MessageFormat

**Sources**: FormatJS ICU Syntax Reference, Unicode CLDR, Phrase Practical Guide, Lokalise Complete Guide, SimpleLocalize ICU Guide, Crowdin ICU Guide 2026

**Why ICU**: plural rules differ by language (Russian has 4 plural forms; Arabic has 6). ICU moves plural logic into the string definition where translators control it — not into JavaScript conditionals that break non-English languages.

**ICU syntax reference**

```
# Simple interpolation
"greeting": "Hello, {name}!"

# Plural (count-based, CLDR rules per locale)
"itemCount": "{count, plural, =0 {No items} one {# item} other {# items}}"

# Select (enumerated values — gender, role, status)
"personIntro": "{role, select, admin {Administrator} member {Team member} other {User}}"

# Nested plural + select (complex but valid)
"assignedItems": "{assignee} {count, plural, one {has # item} other {has # items}}"

# Number format with skeleton
"price": "Total: {amount, number, :: currency/EUR}"

# Date format with skeleton
"updatedAt": "Updated {date, date, :: MMMMd}"

# Ordinal (rankings)
"rank": "You're in {position, selectordinal, one {#st} two {#nd} few {#rd} other {#th} place}"
```

**Usage with react-intl**

```tsx
// components/ItemCounter.tsx
import { useIntl, FormattedMessage } from "react-intl";

export function ItemCounter({ count }: { count: number }) {
  return (
    <span>
      <FormattedMessage
        id="itemCount"
        defaultMessage="{count, plural, =0 {No items} one {# item} other {# items}}"
        values={{ count }}
      />
    </span>
  );
}

// components/PriceDisplay.tsx — number formatting
export function PriceDisplay({ amount, currency }: { amount: number; currency: string }) {
  const intl = useIntl();
  return (
    <span>
      {intl.formatNumber(amount, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      })}
    </span>
  );
}

// components/RelativeDate.tsx — relative time
export function RelativeDate({ date }: { date: Date }) {
  const intl = useIntl();
  const seconds = Math.floor((date.getTime() - Date.now()) / 1000);
  return (
    <time dateTime={date.toISOString()}>
      {intl.formatRelativeTime(seconds, "second", { numeric: "auto" })}
    </time>
  );
}
```

**String key naming convention**

```
# Descriptive hierarchical keys (not sentence content as keys)

# Good
"nav.home"                         → "Home"
"actions.entity.create"            → "Add {entityType}"
"errors.network.timeout"           → "Connection timed out. Try again."
"empty.search.noResults.headline"  → "No results for "{query}""
"confirmations.delete.title"       → "Delete {entityName}?"

# Bad — full sentences as keys
"Hello, welcome to the platform"   → translated sentence loses context
"Are you sure?"                    → ambiguous, translators cannot infer context
```

---

### Pattern 5: Locale-Specific Rules

**Sources**: LingoHub French Localization, ECTOS Tu vs Vous, UX Content Collective Gender-Inclusive International Guide, Phrase 10 Common Mistakes, Smashing Magazine RTL, pseudo-localization guide

#### Text expansion budgets

Design containers to accommodate expansion without overflow or truncation:

| Language | Expansion vs English |
|---|---|
| German | +25–35% |
| French | +15–20% |
| Spanish | +15–25% |
| Portuguese | +20–30% |
| Arabic | +20–25% (RTL) |
| Finnish | +30–40% |
| Japanese | ±5% (shorter or same) |

**Rule**: never hardcode container widths for text-containing elements. Use `min-width` + `max-width` with overflow ellipsis at the extreme.

#### French-specific decisions

1. **Tu vs Vous** (ECTOS): Professional HR/finance/legal software defaults to **vous** (respectful, formal distance). Consumer or startup-culture products may use **tu** (warm, collaborative). This is a strategic brand decision; it must be made at system design time — not component by component.
2. **Text expansion**: French is 15–20% longer than English. Button labels that are exactly right in English will often overflow in French.
3. **Inclusive writing**: The CNIL-aligned dot format (élu·es) remains contested in French UI; prefer sentence restructuring to avoid gendered forms: "Bienvenue dans l'équipe" rather than "Bienvenu(e)".
4. **Number format**: `1 234,56 €` (space as thousands separator, comma as decimal, currency symbol after value).
5. **Cookie consent copy**: CNIL requires Accept and Reject buttons of equal prominence. Reject path may not require more clicks than Accept.

#### RTL layout (Arabic, Hebrew)

```css
/* Use CSS logical properties throughout — they flip automatically in RTL */
.card {
  padding-inline-start: var(--spacing-4);  /* ← not padding-left */
  padding-inline-end: var(--spacing-4);    /* ← not padding-right */
  border-inline-start: 2px solid var(--color-border-accent); /* ← not border-left */
}

/* Set dir attribute on root for RTL locales */
/* <html dir="rtl" lang="ar"> */
```

Numbers, emails, and URLs remain LTR even in RTL documents (Unicode bidi algorithm handles this automatically when using `dir="rtl"`).

#### Pseudo-localization testing

Run pseudo-localization before investing in real translations to catch layout bugs early:

```ts
// scripts/pseudo-locale.ts — transform strings to pseudo-locale for testing
export function pseudoLocalize(text: string): string {
  const charMap: Record<string, string> = {
    a: "á", b: "ƀ", c: "ç", d: "ď", e: "é", f: "ƒ", g: "ĝ",
    h: "ĥ", i: "í", j: "ĵ", k: "ķ", l: "ĺ", m: "m̂", n: "ñ",
    o: "ó", p: "ƥ", q: "q̂", r: "ŕ", s: "š", t: "ţ", u: "ú",
    v: "v̂", w: "ŵ", x: "x̂", y: "ý", z: "ž",
  };

  // Replace chars + add 30% expansion padding + wrap with markers
  const expanded = text
    .split("")
    .map((c) => charMap[c.toLowerCase()] ?? c)
    .join("");

  const padLength = Math.ceil(text.length * 0.3);
  const padding = "x".repeat(padLength);

  return `[!${expanded}${padding}!]`;
}
```

Pseudo-locale catches: text overflow/clipping, broken layout on buttons, missing font support for extended characters, hardcoded widths.

---

### Pattern 6: String Management Workflow

**Sources**: Crowdin Software Localization, Phrase 10 Common Mistakes, Lokalise React i18n guide, Lingui 5.0, Crowdin ICU Guide 2026

**Principle**: treat strings as data, not as code. Externalize from commit 0. Every hardcoded string is a localization bug waiting to happen.

**File structure**

```
src/
  locales/
    en.json          ← source language, the single source of truth
    fr.json          ← auto-synced from Crowdin/Phrase (never manually edited)
    ar.json
    de.json
  i18n/
    config.ts        ← locale list, fallback rules, namespace list
    provider.tsx     ← IntlProvider / I18nProvider wrapping
```

**CI/CD string sync**

```yaml
# .github/workflows/i18n-sync.yml
name: Sync translations
on:
  push:
    branches: [main]
    paths: ["src/locales/en.json"]

jobs:
  sync:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Upload source strings to Crowdin
        uses: crowdin/github-action@v2
        with:
          upload_sources: true
          download_translations: false
        env:
          CROWDIN_PROJECT_ID: ${{ secrets.CROWDIN_PROJECT_ID }}
          CROWDIN_PERSONAL_TOKEN: ${{ secrets.CROWDIN_TOKEN }}
```

**String comments for translators** — include context metadata so translators produce correct output without asking:

```json
{
  "actions.entity.delete": {
    "message": "Delete {entityName}",
    "description": "Button label in destructive confirmation dialog. entityName is a proper noun (report title, file name, etc.)"
  },
  "errors.network.timeout": {
    "message": "Connection timed out. Try again.",
    "description": "Shown when an API call exceeds the timeout threshold. Second sentence is a call to action."
  }
}
```

**Forbidden patterns**

```tsx
// NEVER: string concatenation across variables
const message = "Hello, " + userName + "! You have " + count + " messages.";
// Breaks in Japanese (word order differs), loses context for translators

// CORRECT: single ICU string with all variables
const message = intl.formatMessage(
  { id: "greeting.withMessages", defaultMessage: "Hello, {name}! You have {count, plural, one {# message} other {# messages}}." },
  { name: userName, count }
);

// NEVER: JSX string splitting
const label = <span>You have <strong>{count}</strong> items</span>;
// "You have" and "items" are separate untranslatable fragments

// CORRECT: Trans component (react-i18next) or rich-text ICU
import { Trans } from "react-i18next";
const label = <Trans i18nKey="itemCountRich" values={{ count }} components={{ bold: <strong /> }} />;
```

---

### Supplementary Content Rules

#### Empty state copy formula (Eleken, UX Writing Hub, Pencil & Paper)

```
Headline: Active voice, ≤20 characters, starts with imperative verb
          "Start by adding a record" — NOT "No records yet"
Body:     2–3 lines, benefit-focused, explains what the user gains
          "Records you create will appear here. Add your first one to get started."
CTA:      Verb + noun, matches primary action in header
          "Add record"
```

#### No-results search recovery (Baymard, LogRocket)

Approximately 50% of applications create a dead end at the no-results state. Correct recovery includes:
1. Echo the user's query: "No results for 'invoice 2024'"
2. Suggest spelling corrections if available
3. Offer related categories or a broader search
4. Provide a direct path to create the searched item if that makes sense

#### Form field labels and placeholders (NNG, Intuit)

Placeholder text that replaces the label causes accessibility failures: the label disappears when the user types. Always use a persistent visible label. Placeholder = supplemental hint or example only.

```tsx
// FormField.tsx — correct label + placeholder pattern
interface FormFieldProps {
  id: string;
  label: string;
  placeholder?: string; // hint text, not the label
  helperText?: string;
  errorId?: string;
}

export function FormField({ id, label, placeholder, helperText, errorId }: FormFieldProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
      <label htmlFor={id} style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)" }}>
        {label}
      </label>
      <input
        id={id}
        placeholder={placeholder}
        aria-describedby={[helperText ? `${id}-helper` : null, errorId].filter(Boolean).join(" ") || undefined}
        style={{ padding: "var(--spacing-2) var(--spacing-3)", borderRadius: "var(--radius-base)", border: "1px solid var(--color-border-default)" }}
      />
      {helperText && (
        <p id={`${id}-helper`} style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", margin: 0 }}>
          {helperText}
        </p>
      )}
    </div>
  );
}
```

---

## Adoption Checklist

- [ ] Establish sentence case as the system-wide capitalization rule — apply to all nav items, headings, button labels, tab labels, and modal titles; audit existing components for title-case violations
- [ ] Replace all "Are you sure?" confirmation dialogs with specific titles ("Delete {entityName}?") and action-labeled button pairs ("Delete report" / "Keep report")
- [ ] Externalize every UI string into locale JSON files from the first commit; configure `eslint-plugin-i18n-json` or equivalent to block hardcoded strings in CI
- [ ] Implement ICU MessageFormat for all pluralizable strings; ban `count === 1 ? "item" : "items"` conditionals in TypeScript — all plural logic lives in the ICU string
- [ ] Add pseudo-localization to the CI test suite; run against the English source to detect overflow and clipping before real translations are produced
- [ ] Configure CI/CD string sync to push new English keys to your TMS (Crowdin, Phrase, or Lokalise) on merge to main
- [ ] Write string comments with context metadata for every string that contains variables, UI-specific verbs, or domain jargon
- [ ] Audit all form fields: every `<input>` must have a persistent visible `<label>`; placeholder text must supplement but never replace the label
- [ ] Validate all inline error messages follow the three-part formula (what happened / why / what to do)
- [ ] Decide tu vs vous for French-locale builds at the design-system level, document in the voice guide, and add a lint rule or component prop to enforce consistency

---

## Anti-patterns

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Placeholder as label | Label disappears on input, fails WCAG 1.3.1 | Always use a persistent visible `<label>` |
| `count === 1 ? "item" : "items"` in JS | English-only logic; Russian, Arabic, etc. have different plural forms | ICU `{count, plural, one {# item} other {# items}}` |
| String concatenation across variables | Word order changes between languages, fragments lose translator context | Single ICU string with all variables embedded |
| Generic error messages ("Something went wrong") | Users cannot act on them | Three-part formula: what / why / what to do next |
| "Are you sure?" as confirmation title | Adds friction with zero information | Specific: "Delete report '2025 Q1'?" |
| Title case in UI elements | Inconsistent rules at scale; slower reading for longer labels | Sentence case universally |

---

## Sources

| Title | URL | Year | Authority |
|---|---|---|---|
| Atlassian — Voice and Tone Principles | https://atlassian.design/content/voice-and-tone-principles | 2024 | elite |
| Atlassian — Writing Guidelines | https://atlassian.design/content/writing-guidelines | 2024 | elite |
| IBM Carbon — Content Overview | https://carbondesignsystem.com/guidelines/content/overview | 2024 | elite |
| Shopify Polaris — Actionable Language | https://polaris.shopify.com/content/actionable-language | 2024 | elite |
| Shopify Polaris — Grammar and Mechanics | https://polaris.shopify.com/content/grammar-and-mechanics | 2024 | elite |
| Adobe Spectrum — Inclusive UX Writing | https://spectrum.adobe.com/page/inclusive-ux-writing | 2024 | elite |
| Microsoft Fluent 2 — Content Design | https://fluent2.microsoft.design/content-design | 2024 | elite |
| Apple HIG — Writing | https://developer.apple.com/design/human-interface-guidelines/writing | 2024 | elite |
| Material Design 3 — Content Design | https://m3.material.io/foundations/content-design/overview | 2024 | elite |
| GOV.UK — Writing for GOV.UK | https://www.gov.uk/guidance/content-design/writing-for-gov-uk | 2024 | elite |
| Mailchimp Content Style Guide | https://styleguide.mailchimp.com | 2023 | elite |
| Mailchimp — Voice and Tone | https://styleguide.mailchimp.com/voice-and-tone | 2023 | elite |
| Slack — Voice and Tone | https://api.slack.com/best-practices/voice-and-tone | 2023 | elite |
| NNG — 3 I's of Microcopy | https://www.nngroup.com/articles/3-is-of-microcopy | 2023 | elite |
| NNG — Error Reporting Guidelines | https://www.nngroup.com/articles/errors-forms-design-guidelines | 2023 | elite |
| NNG — Placeholders Are Harmful | https://www.nngroup.com/articles/form-design-placeholders | 2023 | elite |
| NNG — Tooltip Guidelines | https://www.nngroup.com/articles/tooltip-guidelines | 2023 | elite |
| PlainLanguage.gov Federal Guidelines | https://plainlanguage.gov/guidelines | 2023 | elite |
| 18F Content Guide — Plain Language | https://guides.18f.gov/content-guide/our-approach/plain-language | 2023 | elite |
| GitHub Docs Style Guide | https://docs.github.com/en/contributing/style-guide-and-content-model/style-guide | 2024 | elite |
| Microsoft Writing Style Guide | https://learn.microsoft.com/en-us/style-guide/welcome | 2024 | elite |
| Intuit — Confirmations | https://contentdesign.intuit.com/product-and-ui/confirmations | 2024 | elite |
| Intuit — Fields | https://contentdesign.intuit.com/product-and-ui/fields | 2024 | elite |
| Intuit — Tooltips | https://contentdesign.intuit.com/product-and-ui/tooltips | 2024 | elite |
| FormatJS — ICU Syntax Reference | https://formatjs.github.io/docs/core-concepts/icu-syntax | 2024 | elite |
| FormatJS react-intl | https://formatjs.io/docs/react-intl | 2024 | elite |
| i18next/react-i18next GitHub | https://github.com/i18next/react-i18next | 2024 | elite |
| Lingui 5.0 Release | https://lingui.dev/blog/2024/11/28/announcing-lingui-5.0 | 2024 | high |
| Unicode CLDR | https://cldr.unicode.org | 2024 | elite |
| Unicode TR35 — Numbers | https://www.unicode.org/reports/tr35/tr35-numbers.html | 2024 | elite |
| Lokalise — Complete ICU Guide | https://lokalise.com/blog/complete-guide-to-icu-message-format | 2024 | high |
| Lokalise — React i18n with react-intl | https://lokalise.com/blog/react-i18n-intl | 2024 | high |
| Phrase — Practical ICU Guide | https://phrase.com/blog/posts/guide-to-the-icu-message-format | 2024 | high |
| Phrase — 10 Common Localization Mistakes | https://phrase.com/blog/posts/10-common-mistakes-in-software-localization | 2024 | high |
| Crowdin — Software Localization | https://crowdin.com/blog/software-localization | 2024 | high |
| Crowdin — ICU Guide 2026 | https://crowdin.com/blog/icu-guide | 2026 | high |
| CXL — Microcopy and Conversions | https://cxl.com/blog/microcopy | 2023 | high |
| Smashing Magazine — Error Messages UX | https://www.smashingmagazine.com/2022/08/error-messages-ux-design | 2022 | high |
| Smashing Magazine — Inline Validation | https://www.smashingmagazine.com/2022/09/inline-validation-web-forms-ux | 2022 | high |
| Smashing Magazine — Microcopy 2024 | https://www.smashingmagazine.com/2024/06/how-improve-microcopy-ux-writing-tips-non-ux-writers | 2024 | high |
| Baymard — No-Results Pages | https://baymard.com/blog/no-results-page | 2023 | elite |
| LingoHub — French Localization | https://lingohub.com/blog/french-localization-language-peculiarities-and-challenges | 2023 | high |
| ECTOS — Tu vs Vous | https://www.ectos.com/en_US/blog/general-1/tutoiement-tu-vouvoiement-vous-in-french-91 | 2023 | high |
| UX Content Collective — Gender-Inclusive Writing | https://uxcontent.com/the-international-guide-to-gender-inclusive-writing | 2024 | high |
| Smashing Magazine — RTL Development | https://www.smashingmagazine.com/2017/11/right-to-left-mobile-design | 2023 | high |
| Cookie Information — CNIL French Cookie Rules | https://cookieinformation.com/regulations/cookie-guidelines/french-cookie-rules | 2024 | high |
| Beth Aitman — Confirmation Dialog | https://bethaitman.com/posts/ui-writing/confirmation | 2022 | high |
| UX Collective — Confirmation Dialogs | https://uxdesign.cc/are-you-sure-you-want-to-do-this-microcopy-for-confirmation-dialogues-1d94a0f73ac6 | 2022 | high |
| PatternFly — Capitalization | https://www.patternfly.org/ux-writing/capitalization | 2024 | high |
| Every Interaction — Title vs Sentence Case | https://www.everyinteraction.com/articles/title-case-vs-sentence-case-in-ui | 2023 | medium |

---

## Level 5 — Related Documents

- [BASELINE-L1.md](./BASELINE-L1.md) — Token system (color tokens for error/warning/success states used in error messages)
- [BASELINE-L2.md](./BASELINE-L2.md) — Headless primitives (aria-describedby wiring, aria-live regions for error announcements)
- [BASELINE-L3.md](./BASELINE-L3.md) — Components (form field, tooltip, toast — content patterns slot into these components)
- [BASELINE-L4.md](./BASELINE-L4.md) — Patterns (empty state, confirmation dialog, toast — copy formulas for each)
- [BASELINE-L6.md](./BASELINE-L6.md) — Accessibility (screen reader announcements, aria-live, WCAG 3.1 language of page)
