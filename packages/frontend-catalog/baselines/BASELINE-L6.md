# BASELINE-L6 — Accessibility
> Layer 6 of 8 | frontend-catalog design-system pipeline

---

## Scope

This document covers **WCAG 2.2 compliance, WAI-ARIA implementation, keyboard interaction patterns, automated testing integration, and EU/French regulatory requirements (RGAA, EAA)** for a React TypeScript design system.

Sources: 137 records from W3C/WAI (WCAG 2.2, WAI-ARIA 1.2, APG, Understanding docs), Deque/axe-core, WebAIM Million 2024, Sara Soueidan, MDN, ETSI EN 301 549, RGAA 4.1 (DINUM), and European Accessibility Act (June 2025).

---

## Level 1 — TL;DR

Build to WCAG 2.2 AA minimum. Use semantic HTML first, ARIA as enhancement. The six most common failures (low contrast, missing alt, missing labels, empty links/buttons, missing lang) account for 95.9% of sites. Automate with axe-core + eslint-plugin-jsx-a11y + jest-axe; they catch ~40% of issues. Manual testing with NVDA+Chrome and VoiceOver+Safari closes the gap.

---

## Level 2 — Plain English

Accessibility means someone using a keyboard instead of a mouse, a screen reader instead of eyes, or a voice instead of hands can use the application just as effectively as anyone else. The law (WCAG 2.2, RGAA in France, European Accessibility Act since June 2025) requires it. The technology to do it (ARIA roles, focus management, live regions, color contrast) has been standardized for years. The mistake is treating it as an afterthought — the five minutes spent putting a proper label on a form field avoids hours of remediation.

---

## Level 3 — Technical Overview

The accessibility layer of a design system has five concerns:

1. **Compliance target** — WCAG 2.2 AA (87 criteria). The 9 new criteria added vs 2.1 are covered in the WCAG 2.2 section below.
2. **Semantic HTML** — native elements carry free keyboard behavior and AT semantics; always prefer `<button>` over `<div onClick>`, `<label>` over `<span>`, `<nav>` over `<div>`.
3. **ARIA** — extends semantics where HTML is insufficient; the first rule of ARIA is "use semantic HTML instead when possible."
4. **Keyboard interaction** — every interactive element is reachable by Tab; composite widgets (tabs, menus, comboboxes) use roving tabindex or aria-activedescendant per the APG.
5. **Testing pyramid** — lint time (eslint-plugin-jsx-a11y) → unit time (jest-axe) → component catalog (Storybook addon-a11y) → E2E (Playwright + axe) → manual screen reader testing.

---

## Level 4 — Core Patterns

---

### Pattern 1: WCAG 2.2 AA Requirements Summary

**Source**: W3C WCAG 2.2 Recommendation (October 2023), Understanding WCAG 2.2, Deque WCAG 2.2 resources

WCAG 2.2 has 87 success criteria: 32 Level A, 24 Level AA, 31 Level AAA. The Level AA criteria are the legal minimum (EAA, RGAA, Section 508, EN 301 549).

**The 9 new criteria added in WCAG 2.2 vs 2.1**

| SC | Level | Name | What it requires |
|---|---|---|---|
| 2.4.11 | AA | Focus Not Obscured (Minimum) | Focused element not COMPLETELY hidden by sticky header/cookie banner |
| 2.4.12 | AAA | Focus Not Obscured (Enhanced) | Focused element fully visible |
| 2.4.13 | AAA | Focus Appearance | Focus ring ≥2px thick, 3:1 contrast focused/unfocused |
| 2.5.7 | AA | Dragging Movements | All drag ops have single-pointer alternative |
| 2.5.8 | AA | Target Size (Minimum) | Interactive targets ≥24×24 CSS px or adequate spacing |
| 3.2.6 | A | Consistent Help | Help links in same position across pages |
| 3.3.7 | A | Redundant Entry | Multi-step forms don't re-ask previously entered info |
| 3.3.8 | AA | Accessible Authentication (Min) | No cognitive test to authenticate; paste in OTP fields required |
| 3.3.9 | AAA | Accessible Authentication (Enhanced) | No exceptions |

Note: 4.1.1 Parsing was removed as obsolete in WCAG 2.2.

**Focus Not Obscured fix (SC 2.4.11)**

```css
/* Prevent sticky header from covering focused elements */
:root {
  --sticky-header-height: 64px;
}

html {
  scroll-padding-top: var(--sticky-header-height);
}

/* For individual elements if needed */
.target-element {
  scroll-margin-top: var(--sticky-header-height);
}
```

**Target size (SC 2.5.8)**

```css
/* Minimum 24×24 px; best practice 44×44 px (Apple, Material Design) */
.interactive-element {
  min-width: 44px;
  min-height: 44px;
  /* If visual size is smaller, use padding to expand hit area */
  padding: 10px;
}

/* Inline text links are exempt from 2.5.8 */
/* Icon buttons in dense toolbars: use padding to meet minimum */
```

**Dragging movements (SC 2.5.7) — sortable list alternative**

```tsx
// All drag-to-reorder UI must have a keyboard-accessible alternative
// @dnd-kit includes keyboard sensor by default (see L3)
// Additionally provide explicit up/down buttons:
interface SortableItem {
  id: string;
  label: string;
}

interface ReorderButtonsProps {
  index: number;
  total: number;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export function ReorderButtons({ index, total, onMoveUp, onMoveDown }: ReorderButtonsProps) {
  return (
    <div role="group" aria-label="Reorder">
      <button onClick={onMoveUp} disabled={index === 0} aria-label="Move up">
        ↑
      </button>
      <button onClick={onMoveDown} disabled={index === total - 1} aria-label="Move down">
        ↓
      </button>
    </div>
  );
}
```

---

### Pattern 2: Keyboard Interaction Rules per Widget Type

**Source**: WAI-ARIA APG Patterns, MDN ARIA docs, Heydon Pickering Inclusive Components

The APG defines normative keyboard behavior for 30+ widget types. Key patterns:

#### Navigation and selection model

| Widget | Navigation | Activation | Close/Escape |
|---|---|---|---|
| Tabs | Arrow keys (left/right) between tabs, Tab enters panel | Enter / Space (manual) or Arrow (auto) | — |
| Modal dialog | Tab / Shift+Tab within dialog | — | Escape → return focus to trigger |
| Accordion | Tab between triggers | Enter / Space toggles panel | — |
| Combobox (list) | Arrow down opens list; Arrow up/down navigates | Enter selects | Escape closes |
| Tree view | Up/Down navigates; Right expands; Left collapses | Enter activates | — |
| Listbox | Up/Down navigates; Space selects (multi) | Enter activates single-select | — |
| Tooltip | Hover / Focus shows | — | Escape dismisses |
| Menu | Arrow down opens; Up/Down navigate items | Enter / Space activates item | Escape closes → focus trigger |

#### Tabs implementation (APG-compliant)

```tsx
// AccessibleTabs.tsx
import { useState, useRef, useCallback } from "react";

interface Tab {
  id: string;
  label: string;
  content: React.ReactNode;
}

interface AccessibleTabsProps {
  tabs: Tab[];
}

export function AccessibleTabs({ tabs }: AccessibleTabsProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent, index: number) => {
      let newIndex = index;
      if (e.key === "ArrowRight") {
        newIndex = (index + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        newIndex = (index - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        newIndex = 0;
      } else if (e.key === "End") {
        newIndex = tabs.length - 1;
      } else {
        return;
      }
      e.preventDefault();
      setActiveIndex(newIndex);
      tabRefs.current[newIndex]?.focus();
    },
    [tabs.length]
  );

  const activeTab = tabs[activeIndex];

  return (
    <div>
      <div role="tablist" aria-label="Tabs">
        {tabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(el) => { tabRefs.current[index] = el; }}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={index === activeIndex}
            aria-controls={`panel-${tab.id}`}
            tabIndex={index === activeIndex ? 0 : -1}
            onClick={() => setActiveIndex(index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            style={{
              background: "none",
              border: "none",
              borderBottom: index === activeIndex ? "2px solid var(--color-action-primary)" : "2px solid transparent",
              padding: "var(--spacing-2) var(--spacing-4)",
              cursor: "pointer",
              fontWeight: index === activeIndex ? "var(--font-semibold)" : "var(--font-normal)",
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`panel-${activeTab.id}`}
        aria-labelledby={`tab-${activeTab.id}`}
        tabIndex={0}
        style={{ padding: "var(--spacing-4)" }}
      >
        {activeTab.content}
      </div>
    </div>
  );
}
```

#### Modal dialog with focus trap

```tsx
// AccessibleDialog.tsx
import * as Dialog from "@radix-ui/react-dialog";

// Radix Dialog handles: focus trap, Escape key, aria-modal, return focus
interface AccessibleDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  trigger: React.ReactNode;
}

export function AccessibleDialog({
  open,
  onOpenChange,
  title,
  description,
  children,
  trigger,
}: AccessibleDialogProps) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Trigger asChild>{trigger}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            zIndex: "var(--z-overlay)",
          }}
        />
        <Dialog.Content
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "var(--color-surface-elevated)",
            borderRadius: "var(--radius-base)",
            padding: "var(--spacing-6)",
            maxWidth: 600,
            width: "90vw",
            zIndex: "var(--z-modal)",
          }}
          // Radix sets: role="dialog", aria-modal="true", aria-labelledby, aria-describedby
        >
          <Dialog.Title style={{ fontSize: "var(--text-xl)", fontWeight: "var(--font-semibold)", marginTop: 0 }}>
            {title}
          </Dialog.Title>
          {description && (
            <Dialog.Description style={{ color: "var(--color-text-secondary)", marginTop: "var(--spacing-2)" }}>
              {description}
            </Dialog.Description>
          )}
          {children}
          <Dialog.Close
            style={{
              position: "absolute",
              top: "var(--spacing-3)",
              right: "var(--spacing-3)",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "var(--spacing-1)",
              borderRadius: "var(--radius-sm)",
            }}
            aria-label="Close dialog"
          >
            ✕
          </Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

### Pattern 3: ARIA Live Regions

**Source**: Sara Soueidan "Accessible Notifications Parts 1&2", MDN ARIA live regions, A11Y Collective "Complete Guide to ARIA Live Regions"

**Pre-render two live region containers at page load** — inserting a live region dynamically and immediately announcing content into it is unreliable across screen readers.

```tsx
// LiveRegionProvider.tsx — mount once in app root
import { createContext, useContext, useCallback } from "react";

interface LiveRegionContextValue {
  announce: (message: string, priority?: "polite" | "assertive") => void;
}

const LiveRegionContext = createContext<LiveRegionContextValue>({
  announce: () => {},
});

export function useLiveRegion() {
  return useContext(LiveRegionContext);
}

export function LiveRegionProvider({ children }: { children: React.ReactNode }) {
  const announcePolite = useCallback((message: string) => {
    const el = document.getElementById("live-region-polite");
    if (el) {
      // Clear then set — forces announcement even if same message repeated
      el.textContent = "";
      requestAnimationFrame(() => {
        el.textContent = message;
      });
    }
  }, []);

  const announceAssertive = useCallback((message: string) => {
    const el = document.getElementById("live-region-assertive");
    if (el) {
      el.textContent = "";
      requestAnimationFrame(() => {
        el.textContent = message;
      });
    }
  }, []);

  const announce = useCallback(
    (message: string, priority: "polite" | "assertive" = "polite") => {
      if (priority === "assertive") {
        announceAssertive(message);
      } else {
        announcePolite(message);
      }
    },
    [announcePolite, announceAssertive]
  );

  return (
    <LiveRegionContext.Provider value={{ announce }}>
      {children}
      {/* These elements must be in the DOM at page load — pre-rendered, not dynamic */}
      <div
        id="live-region-polite"
        role="status"
        aria-live="polite"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />
      <div
        id="live-region-assertive"
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
        style={{
          position: "absolute",
          width: 1,
          height: 1,
          padding: 0,
          margin: -1,
          overflow: "hidden",
          clip: "rect(0, 0, 0, 0)",
          whiteSpace: "nowrap",
          border: 0,
        }}
      />
    </LiveRegionContext.Provider>
  );
}
```

**Usage in toast notifications**

```tsx
// useToast.ts — announce toast to screen readers on top of visual display
import { useLiveRegion } from "./LiveRegionProvider";

export function useToast() {
  const { announce } = useLiveRegion();

  return {
    success: (message: string) => {
      announce(message, "polite"); // success = polite (don't interrupt)
    },
    error: (message: string) => {
      announce(message, "assertive"); // error = assertive (interrupt current reading)
    },
    warning: (message: string) => {
      announce(message, "polite");
    },
  };
}
```

**Live region guidance table**

| Use case | role | aria-live | aria-atomic |
|---|---|---|---|
| Toast success/info | `status` | `polite` | `true` |
| Toast error | `alert` | `assertive` | `true` |
| Search results count | `status` | `polite` | `true` |
| Loading spinner text | `status` | `polite` | `true` |
| Critical error / session expiry | `alert` | `assertive` | `true` |

---

### Pattern 4: Accessible Form Validation

**Source**: TetraLogical "Form Validation and Error Messages", Deque "Anatomy of Accessible Forms", W3C WAI "User Notification", NNG "Form Error Guidelines"

```tsx
// AccessibleFormField.tsx
interface FormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
}

export function AccessibleFormField({
  id,
  label,
  required,
  error,
  helperText,
  value,
  onChange,
  type = "text",
}: FormFieldProps) {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;
  const describedBy = [
    error ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(" ") || undefined;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--spacing-1)" }}>
      <label htmlFor={id} style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)" }}>
        {label}
        {required && (
          <span aria-hidden="true" style={{ color: "var(--color-status-error)", marginLeft: 2 }}>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        required={required}
        aria-required={required}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={describedBy}
        style={{
          padding: "var(--spacing-2) var(--spacing-3)",
          borderRadius: "var(--radius-base)",
          border: error
            ? "1px solid var(--color-status-error)"
            : "1px solid var(--color-border-default)",
          outline: "none",
        }}
      />
      {helperText && !error && (
        <p id={helperId} style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)", margin: 0 }}>
          {helperText}
        </p>
      )}
      {error && (
        <p
          id={errorId}
          role="alert"
          style={{
            fontSize: "var(--text-xs)",
            color: "var(--color-status-error)",
            margin: 0,
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-1)",
          }}
        >
          {/* Icon + text — never color alone (SC 1.4.1) */}
          <span aria-hidden="true">⚠</span>
          {error}
        </p>
      )}
    </div>
  );
}
```

**Error summary on multi-field form submission**

```tsx
// ErrorSummary.tsx — focus this on failed submit
interface FieldError {
  fieldId: string;
  message: string;
  fieldLabel: string;
}

interface ErrorSummaryProps {
  errors: FieldError[];
}

import { useEffect, useRef } from "react";

export function ErrorSummary({ errors }: ErrorSummaryProps) {
  const summaryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errors.length > 0) {
      summaryRef.current?.focus();
    }
  }, [errors.length]);

  if (errors.length === 0) return null;

  return (
    <div
      ref={summaryRef}
      tabIndex={-1}
      role="alert"
      aria-labelledby="error-summary-title"
      style={{
        border: "2px solid var(--color-status-error)",
        borderRadius: "var(--radius-base)",
        padding: "var(--spacing-4)",
        marginBottom: "var(--spacing-4)",
      }}
    >
      <h2 id="error-summary-title" style={{ fontSize: "var(--text-base)", fontWeight: "var(--font-semibold)", margin: 0 }}>
        {errors.length === 1
          ? "There is 1 error. Please correct it before continuing."
          : `There are ${errors.length} errors. Please correct them before continuing.`}
      </h2>
      <ul style={{ marginTop: "var(--spacing-2)", paddingLeft: "var(--spacing-4)" }}>
        {errors.map((error) => (
          <li key={error.fieldId}>
            <a href={`#${error.fieldId}`} style={{ color: "var(--color-status-error)" }}>
              {error.fieldLabel}: {error.message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Pattern 5: Color Contrast and Visual Accessibility

**Source**: WebAIM Contrast Checker, WebAIM Million 2024 (83.6% of sites fail contrast), WCAG SC 1.4.3, 1.4.6, 1.4.11

**WCAG 2.2 contrast requirements**

| Content | AA | AAA |
|---|---|---|
| Normal text (<18pt / <14pt bold) | 4.5:1 | 7:1 |
| Large text (≥18pt or ≥14pt bold) | 3:1 | 4.5:1 |
| UI components and graphical objects | 3:1 | — |
| Inactive (disabled) UI | No requirement | No requirement |
| Decorative | No requirement | No requirement |
| Logotype | No requirement | No requirement |

**Note**: WCAG 2 uses luminance ratio (WCAG 2). WCAG 3 plans to adopt APCA (perceptually uniform, font-size-aware). L1 of this design system already accounts for APCA validation on token generation; the WCAG 2 luminance ratio is the current legal standard.

**Focus indicator minimum (SC 2.4.7 + best-practice toward 2.4.13)**

```css
/* Never remove outline without replacement */
:focus-visible {
  outline: 3px solid var(--color-focus-ring);
  outline-offset: 2px;
  /* Toward SC 2.4.13 AAA: 2px thick, 3:1 contrast focused/unfocused */
}

/* Dark mode — ensure focus ring remains visible */
@media (prefers-color-scheme: dark) {
  :focus-visible {
    outline-color: var(--color-focus-ring-dark);
  }
}
```

**Forced colors (Windows High Contrast Mode)**

```css
/* System color pairs in forced-colors mode */
@media (forced-colors: active) {
  .custom-button {
    /* Use system colors, not custom tokens */
    background-color: ButtonFace;
    color: ButtonText;
    border: 1px solid ButtonText;
  }

  .custom-button:focus-visible {
    outline: 2px solid Highlight;
  }

  /* Background images are hidden in forced-colors — use content fallback */
  .icon-with-bg-image::before {
    content: "★"; /* text or emoji fallback */
  }
}
```

**Prefers-reduced-motion (no-motion-first approach)**

```css
/* No-motion-first: animations are off by default, enabled on no-preference */
/* Source: Tatiana Mac "No-Motion-First Approach" */

.animated-element {
  /* No animation by default — safe for all users */
}

@media (prefers-reduced-motion: no-preference) {
  .animated-element {
    transition: transform 200ms ease, opacity 200ms ease;
  }

  .page-transition-enter {
    animation: slideIn 300ms ease forwards;
  }
}

/* For animations that cannot be removed — provide pause control */
/* WCAG 2.2.2: moving content that lasts >3s must be pausable */
```

---

### Pattern 6: Automated Testing Pipeline

**Source**: web.dev React a11y audit, Playwright accessibility testing, jest-axe, eslint-plugin-jsx-a11y, Storybook addon-a11y, TestParty testing pyramid

**Testing pyramid for accessibility**

| Layer | Tool | When | Coverage |
|---|---|---|---|
| Lint-time | `eslint-plugin-jsx-a11y` | Every save/commit | ~15% — missing labels, invalid ARIA roles |
| Unit / component | `jest-axe` | Every component test | ~25% — structural ARIA violations |
| Component catalog | `@storybook/addon-a11y` | Every story render | ~25% — color contrast, compound component ARIA |
| E2E | `@axe-core/playwright` | CI on PR | ~40% total automated coverage |
| Manual (screen reader) | NVDA+Chrome, VoiceOver+Safari | Monthly / release | Remainder — interaction flow, AT announcements |

**eslint configuration**

```js
// .eslintrc.cjs
module.exports = {
  plugins: ["jsx-a11y"],
  extends: ["plugin:jsx-a11y/recommended"],
  // Use /strict for additional rules (e.g., anchor-has-content, no-autofocus)
};
```

**jest-axe setup**

```tsx
// setupTests.ts — add to Jest setupFilesAfterFramework
import { toHaveNoViolations } from "jest-axe";
expect.extend(toHaveNoViolations);
```

```tsx
// Button.test.tsx
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Button } from "./Button";

describe("Button accessibility", () => {
  it("has no axe violations", async () => {
    const { container } = render(<Button onClick={() => {}}>Submit report</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("is labelled when icon-only", async () => {
    const { container } = render(<Button aria-label="Submit report" onClick={() => {}} iconOnly />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

Note: jest-axe running in JSDOM cannot check color contrast (no visual rendering). Run contrast checks in Storybook or Playwright.

**Storybook addon-a11y configuration**

```tsx
// .storybook/preview.tsx
import type { Preview } from "@storybook/react";

const preview: Preview = {
  parameters: {
    a11y: {
      config: {
        rules: [
          // Disable a specific rule globally (use with justification comment)
          // { id: "color-contrast", enabled: false }, // Only if design system tokens guarantee contrast
        ],
      },
    },
  },
};

export default preview;
```

```tsx
// Button.stories.tsx — story-level a11y config
export const IconOnly: Story = {
  args: { children: undefined, "aria-label": "Submit report" },
  parameters: {
    a11y: {
      config: {
        rules: [
          // Mark as manual-check if test adapter cannot verify (not disable)
          { id: "button-name", reviewOnFail: true },
        ],
      },
    },
  },
};
```

**Playwright E2E axe integration**

```ts
// e2e/accessibility.spec.ts
import { test, expect } from "@playwright/test";
import { checkA11y, configureAxe } from "axe-playwright";

test.beforeEach(async ({ page }) => {
  await configureAxe(page, {
    rules: [{ id: "color-contrast", enabled: true }],
    runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] },
  });
});

test("home page has no axe violations", async ({ page }) => {
  await page.goto("/");
  await checkA11y(page);
});

test("modal dialog accessibility", async ({ page }) => {
  await page.goto("/components/dialog");
  await page.getByRole("button", { name: "Open dialog" }).click();
  await page.getByRole("dialog").waitFor();
  await checkA11y(page, "[role=dialog]"); // Scope to dialog only
});
```

---

### Regulatory Overview: RGAA and EAA

**Source**: RGAA 4.1.2 (DINUM), EAA European Commission, DigitalA11Y RGAA 2025 guide, AllAccessible EAA guide

| Standard | Scope | Deadline | Penalties |
|---|---|---|---|
| RGAA 4.1.2 | French public sector | In force | €50k since Jan 2024 |
| European Accessibility Act (EAA) | EU private sector (>10 employees) | June 28 2025 | France: €300k; Spain: €1M; Germany: €500k |
| Section 508 | US federal procurement | In force | Exclusion from federal contracts |

**EAA conformance standard**: EN 301 549 V3.2.1 (embeds WCAG 2.1 AA). EN 301 549 V4.1.1 (with WCAG 2.2) planned for 2026.

**French mandatory accessibility declaration** (required for public sector and extended to private under EAA): generated via [ara.numerique.gouv.fr](https://ara.numerique.gouv.fr/) or [betagouv.github.io/a11y-generateur-declaration](https://betagouv.github.io/a11y-generateur-declaration/). The declaration states partial/full conformance and lists known exceptions.

**WCAG 3.0 status** (not yet legally enforceable): September 2025 Working Draft. Replaces A/AA/AAA with Bronze/Silver/Gold. Shifts from binary pass/fail to scored outcomes. Still years from Recommendation. WCAG 2.2 AA remains the legal standard until further notice.

**Overlay widgets warning**: AccessiBe was fined $1M by the FTC (January 2025) for false compliance claims. Overlays catch at most 30% of WCAG issues and frequently introduce new barriers. 25% of US ADA lawsuits in 2024 cited overlays as barriers. Automated overlays are not a compliance strategy.

---

## Adoption Checklist

- [ ] Add `eslint-plugin-jsx-a11y/recommended` to the ESLint config and ensure it blocks PRs with zero-tolerance violations (missing labels, invalid ARIA roles, interactive div/span without role)
- [ ] Add `jest-axe` and `toHaveNoViolations` to every component unit test; add to `setupTests.ts` once
- [ ] Install `@storybook/addon-a11y` and configure WCAG 2.2 rule tags in `.storybook/preview.tsx`; violations fail CI via Storybook Test addon
- [ ] Add `@axe-core/playwright` to E2E tests; run against all critical user journeys (auth, form submission, navigation) on every PR
- [ ] Mount `LiveRegionProvider` at the app root; route all toast and notification announcements through `useLiveRegion()` rather than directly manipulating the DOM
- [ ] Apply `scroll-padding-top` equal to sticky header height on `html` element to meet SC 2.4.11 Focus Not Obscured
- [ ] Ensure all interactive targets are ≥44×44 CSS px (or 24×24 with spacing) to meet SC 2.5.8 and best practice
- [ ] Implement no-motion-first CSS: define all animations inside `@media (prefers-reduced-motion: no-preference)` blocks; add forced-colors fallbacks using system color pairs
- [ ] Validate all form fields use `aria-invalid`, `aria-describedby` → error element, and error summary with focus management on submit failure
- [ ] Test minimum NVDA+Chrome + VoiceOver+Safari before each release; document results; maintain an accessibility statement page for RGAA/EAA compliance

---

## Anti-patterns

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| `<div onClick>` as interactive element | No keyboard focus, no role, no Enter/Space activation | Use `<button>` (activates on Enter/Space, focusable, semantic) |
| `aria-label` on every element | ARIA does not make elements keyboard-interactive | Add `tabIndex={0}` and keyboard handlers OR use semantic HTML |
| Injecting content into a live region immediately at page load | AT may miss announcement — container not yet observed | Pre-render container at load; inject message asynchronously |
| Removing `outline` without replacement | Keyboard users lose all focus visibility, violates SC 2.4.7 | Replace with `:focus-visible` and equal-prominence custom ring |
| Overlay accessibility widget ("accessiBe-style") | Catches ≤30% of issues, introduces new barriers, FTC-penalized | Fix code at the source; automated tools + manual testing |
| `role="menu"` on navigation | Hides links from AT link-list shortcuts; wrong keyboard model | Use `<nav><ul><li><a>` — native HTML with no ARIA needed |
| Using ARIA with no keyboard support | ARIA role announces semantics but does not add interaction | Every non-native element with a role needs Tab + Enter/Space |

---

## Sources

| Title | URL | Year | Authority |
|---|---|---|---|
| WCAG 2.2 Recommendation | https://www.w3.org/TR/WCAG22 | 2023 | elite |
| Understanding WCAG 2.2 | https://www.w3.org/WAI/WCAG22/Understanding | 2024 | elite |
| What's New in WCAG 2.2 | https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22 | 2023 | elite |
| WAI-ARIA 1.2 | https://www.w3.org/TR/wai-aria-1.2 | 2023 | elite |
| ARIA Authoring Practices Guide | https://www.w3.org/WAI/ARIA/apg | 2024 | elite |
| APG Landmark Regions | https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions | 2024 | elite |
| APG Dialog Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal | 2024 | elite |
| APG Tabs Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/tabs | 2024 | elite |
| APG Combobox Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/combobox | 2024 | elite |
| APG Tooltip Pattern | https://www.w3.org/WAI/ARIA/apg/patterns/tooltip | 2024 | elite |
| SC 2.4.11 Focus Not Obscured | https://www.w3.org/WAI/WCAG22/Understanding/focus-not-obscured-minimum | 2024 | elite |
| SC 2.4.13 Focus Appearance | https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance | 2024 | elite |
| SC 2.5.7 Dragging Movements | https://www.w3.org/WAI/WCAG22/Understanding/dragging-movements | 2024 | elite |
| SC 2.5.8 Target Size | https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum | 2024 | elite |
| SC 3.3.7 Redundant Entry | https://www.w3.org/WAI/WCAG22/Understanding/redundant-entry | 2024 | elite |
| SC 3.3.8 Accessible Authentication | https://www.w3.org/WAI/WCAG22/Understanding/accessible-authentication-minimum | 2024 | elite |
| W3C COGA — Cognitive Accessibility | https://www.w3.org/TR/coga-usable | 2024 | elite |
| axe-core GitHub | https://github.com/dequelabs/axe-core | 2024 | elite |
| Deque Axe 4.10 Rules | https://dequeuniversity.com/rules/axe/4.10 | 2024 | elite |
| jest-axe GitHub | https://github.com/nickcolley/jest-axe | 2024 | high |
| eslint-plugin-jsx-a11y GitHub | https://github.com/jsx-eslint/eslint-plugin-jsx-a11y | 2024 | elite |
| Playwright Accessibility Testing | https://playwright.dev/docs/accessibility-testing | 2024 | elite |
| Storybook addon-a11y | https://storybook.js.org/addons/@storybook/addon-a11y | 2024 | elite |
| Storybook Accessibility Tests Docs | https://storybook.js.org/docs/8/writing-tests/accessibility-testing | 2024 | elite |
| React Aria — Adobe | https://react-spectrum.adobe.com/react-aria | 2024 | elite |
| Radix Primitives Accessibility | https://www.radix-ui.com/primitives/docs/overview/accessibility | 2024 | elite |
| MDN ARIA | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA | 2024 | elite |
| MDN ARIA Live Regions | https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Guides/Live_regions | 2024 | elite |
| MDN prefers-reduced-motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | 2024 | elite |
| Sara Soueidan — ARIA Live Regions Part 1 | https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-1 | 2024 | elite |
| Sara Soueidan — ARIA Live Regions Part 2 | https://www.sarasoueidan.com/blog/accessible-notifications-with-aria-live-regions-part-2 | 2024 | elite |
| Tatiana Mac — No-Motion-First | https://www.tatianamac.com/posts/prefers-reduced-motion | 2024 | high |
| Heydon Pickering — Inclusive Components | https://inclusive-components.design | 2024 | elite |
| WebAIM Million 2024 | https://webaim.org/projects/million/2024 | 2024 | elite |
| WebAIM Screen Reader Survey 10 | https://webaim.org/projects/screenreadersurvey10 | 2024 | elite |
| WebAIM Contrast Checker | https://webaim.org/resources/contrastchecker | 2024 | elite |
| WebAIM Skip Navigation | https://webaim.org/techniques/skipnav | 2024 | elite |
| TetraLogical — Form Validation | https://tetralogical.com/blog/2024/10/21/foundations-form-validation-and-error-messages | 2024 | elite |
| Deque — Accessible Form Errors | https://www.deque.com/blog/anatomy-of-accessible-forms-error-messages | 2024 | elite |
| RGAA 4.1.2 — DINUM | https://accessibilite.numerique.gouv.fr | 2024 | elite |
| European Accessibility Act — EC | https://commission.europa.eu/strategy-and-policy/policies/justice-and-fundamental-rights/disability/european-accessibility-act-eaa_en | 2025 | elite |
| EN 301 549 V3 — ETSI | https://www.etsi.org/human-factors-accessibility/en-301-549-v3-the-harmonized-european-standard-for-ict-accessibility | 2024 | elite |
| DigitalA11Y — RGAA 2025 Guide | https://www.digitala11y.com/rgaa-compliance-the-complete-guide-to-french-digital-accessibility-2025-edition | 2025 | high |
| AllAccessible — EAA Compliance Guide | https://www.allaccessible.org/blog/european-accessibility-act-compliance-gdpr-whats-next | 2025 | medium |
| Lainey Feingold — AccessiBe Lawsuit | https://www.lflegal.com/2024/07/accessibe-class-action | 2024 | elite |
| TestParty — Automated vs Manual Testing | https://testparty.ai/blog/manual-vs-automated-accessibility-testing | 2024 | medium |
| Smashing Magazine — Windows High Contrast | https://www.smashingmagazine.com/2022/03/windows-high-contrast-colors-mode-css-custom-properties | 2022 | elite |
| WCAG 3.0 Proposed Scoring | https://www.smashingmagazine.com/2025/05/wcag-3-proposed-scoring-model-shift-accessibility-evaluation | 2025 | elite |

---

## Level 5 — Related Documents

- [BASELINE-L1.md](./BASELINE-L1.md) — Token system (APCA contrast validation, color token accessibility guarantees)
- [BASELINE-L2.md](./BASELINE-L2.md) — Headless primitives (React Aria hooks, roving tabindex, focus trap — all accessibility-first)
- [BASELINE-L3.md](./BASELINE-L3.md) — Component catalog (Storybook a11y tests, aria wiring on DataTable, Dialog, Form)
- [BASELINE-L4.md](./BASELINE-L4.md) — Patterns (ARIA announcements for filter changes, bulk selection, wizard step navigation)
- [BASELINE-L5.md](./BASELINE-L5.md) — Content (error message copy, alt text decision tree, aria-label vs visible label)
- [BASELINE-L7.md](./BASELINE-L7.md) — Motion (prefers-reduced-motion integration with animation system)
