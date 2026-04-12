# BASELINE-L4 — Patterns
> Layer 4 of 8 | frontend-catalog design-system pipeline

---

## Scope

This document covers **UI/UX interaction patterns** — the recurring solutions that solve common data-management and navigation problems in complex applications. Where L1–L3 define tokens, primitives, and components, Layer 4 defines the orchestration of those components into coherent user flows.

Sources: 157 records drawn from Atlassian, IBM Carbon, Shopify Polaris, Salesforce SLDS, PatternFly, GOV.UK, Pencil & Paper, Baymard Institute, Nielsen Norman Group, Eleken, UX Collective, UX Design World, Smashing Magazine, Appcues, Chameleon, and real-SaaS galleries (Nicelydone, Mobbin).

---

## Level 1 — TL;DR

Eight canonical patterns cover ~80% of complex-application UI needs: resource index/detail, filtering, empty states, bulk actions, wizard/multi-step, timeline/activity feed, dashboard layout, and command palette. Mastering these 8 eliminates ad-hoc reinvention across features.

---

## Level 2 — Plain English

Think of patterns as the floor plans of an application. Just as every office building has the same basic layout (reception, hallways, meeting rooms, bathrooms), every data-driven application has the same basic screens: a list screen, a detail screen, a creation form, a dashboard. Patterns are the proven blueprints for those recurring screens — not how to draw the walls, but which rooms go where and why.

---

## Level 3 — Technical Overview

Patterns are defined at the intersection of interaction design and component composition. They answer:
- **Structure** — what components appear on the page and in what arrangement
- **State** — what happens when the user has no data, partial data, or an error
- **Interaction** — how the user selects, filters, edits, creates, and destroys records
- **Feedback** — how the system acknowledges mutations (toast, undo, progress)

Patterns are documented as intent + anatomy + implementation constraints + anti-patterns. They reference L1 tokens for spacing/color, L2 primitives for keyboard behavior, and L3 components as building blocks.

---

## Level 4 — Core Patterns

---

### Pattern 1: Resource Index / Resource Detail

**Sources**: Shopify Polaris ("Index", "Resource list"), Atlassian DS, Carbon Design System, Salesforce SLDS

**Intent**: Display a collection of records (index) and expose the full record on demand (detail) without requiring a full page reload.

**Anatomy — Index**
- Header: page title + primary action button ("New [Entity]") + optional secondary actions
- Toolbar: search input (left) + filter controls (right) + bulk-action bar (appears on selection)
- Table or card grid (see L3 DataTable)
- Pagination or infinite scroll footer

**Anatomy — Detail**
- Breadcrumb: "[Entity list] / [Entity name]" (enables quick back-navigation)
- Header: entity title + status badge + action menu
- Content: sections (Overview, Activity, Related) — tabs or stacked cards
- Side panel (optional): context-sensitive metadata

**Implementation — split-view variant (60/40)**

```tsx
// ResourceLayout.tsx
import { Outlet, useParams } from "react-router-dom";

export function ResourceLayout() {
  const { id } = useParams();
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: id ? "3fr 2fr" : "1fr",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      <section
        aria-label="Resource list"
        style={{ overflowY: "auto", borderRight: "1px solid var(--color-border-default)" }}
      >
        <Outlet context="list" />
      </section>
      {id && (
        <section aria-label="Resource detail" style={{ overflowY: "auto" }}>
          <Outlet context="detail" />
        </section>
      )}
    </div>
  );
}
```

**Anti-patterns**
- Opening detail in a modal for records with 10+ fields — use a dedicated route
- Not preserving the list scroll position when navigating back from detail

---

### Pattern 2: Filtering (Batch vs. Instant)

**Sources**: Baymard Institute ("Filtering UX"), Polaris ("Filters"), PatternFly ("Filter"), Nielsen Norman Group

**Two modes**

| | Batch | Instant |
|---|---|---|
| **When to use** | Slow queries, server-side filter | Client-side, fast datasets |
| **UX** | User sets all filters, then clicks "Apply" | Filter applied on every change |
| **Risk** | Higher interaction cost | Jarring on slow connections |

**Applied filter chips** (both modes): each active filter renders as a dismissible chip below the toolbar. Chip text: "{field}: {value}" (e.g., "Status: Active"). A "Clear all" link appears when ≥2 chips exist.

**Filter panel anatomy** (side panel for 6+ filter fields, top bar for ≤3)

```tsx
// FilterChip.tsx
interface FilterChipProps {
  label: string;
  value: string;
  onRemove: () => void;
}

export function FilterChip({ label, value, onRemove }: FilterChipProps) {
  return (
    <span
      role="group"
      aria-label={`Filter: ${label} equals ${value}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "var(--spacing-1)",
        padding: "var(--spacing-1) var(--spacing-2)",
        backgroundColor: "var(--color-surface-accent)",
        borderRadius: "var(--radius-full)",
        fontSize: "var(--text-sm)",
      }}
    >
      <span>
        <strong>{label}</strong>: {value}
      </span>
      <button
        aria-label={`Remove filter ${label}`}
        onClick={onRemove}
        style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
      >
        ×
      </button>
    </span>
  );
}
```

**Anti-patterns**
- Resetting pagination to page 1 silently when the user removes a filter (announce with a screen-reader live region)
- Filter panel that forces full page reload — prefer query-param updates without navigation

---

### Pattern 3: Empty States (Three Types)

**Sources**: Eleken ("Empty State UX"), Polaris ("Empty state"), IBM Carbon, SetProduct, GOV.UK

**Taxonomy**

| Type | Trigger | Tone | CTA |
|---|---|---|---|
| **First-use** | Feature never used | Encouraging, celebratory | Primary action to populate |
| **No-results** | Search/filter returns 0 | Diagnostic, helpful | Remove filters / broaden search |
| **Error** | Data fetch failed | Neutral, not blame | Retry / Contact support |

**Rule**: never show an empty state for a loading failure — use an error state with a retry button. Never use passive language ("No items found") — always use active language ("Start by adding your first item").

```tsx
// EmptyState.tsx
interface EmptyStateProps {
  type: "first-use" | "no-results" | "error";
  icon: React.ReactNode;
  headline: string;
  body: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ type, icon, headline, body, action }: EmptyStateProps) {
  return (
    <div
      role="status"
      aria-live={type === "error" ? "assertive" : "polite"}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "var(--spacing-4)",
        padding: "var(--spacing-12)",
        textAlign: "center",
      }}
    >
      <div aria-hidden="true" style={{ opacity: 0.5, fontSize: "3rem" }}>
        {icon}
      </div>
      <h2 style={{ fontSize: "var(--text-lg)", fontWeight: "var(--font-semibold)", margin: 0 }}>
        {headline}
      </h2>
      <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)", maxWidth: "320px", margin: 0 }}>
        {body}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          style={{
            padding: "var(--spacing-2) var(--spacing-4)",
            backgroundColor: "var(--color-action-primary)",
            color: "var(--color-text-on-action)",
            border: "none",
            borderRadius: "var(--radius-base)",
            cursor: "pointer",
          }}
        >
          {action.label}
        </button>
      )}
    </div>
  );
}
```

---

### Pattern 4: Bulk Actions

**Sources**: Eleken ("Bulk Action UX"), Polaris ("Bulk actions"), Carbon, PatternFly ("Bulk select"), Shopify

**Three selection scopes**

1. **Row select** — only currently visible rows
2. **Page select** — all rows on current page (checkbox in header)
3. **Global select** — all records across all pages (requires explicit confirmation: "Select all 1,240 items")

**Floating action toolbar** — appears at the bottom of the viewport (position: sticky / fixed) when ≥1 row is selected. Disappears when selection is cleared.

```tsx
// BulkActionBar.tsx
interface BulkActionBarProps {
  selectedCount: number;
  totalCount: number;
  onSelectAll: () => void;
  actions: Array<{ label: string; variant?: "default" | "destructive"; onClick: () => void }>;
  onClear: () => void;
}

export function BulkActionBar({ selectedCount, totalCount, onSelectAll, actions, onClear }: BulkActionBarProps) {
  if (selectedCount === 0) return null;

  return (
    <div
      role="toolbar"
      aria-label="Bulk actions"
      style={{
        position: "fixed",
        bottom: "var(--spacing-6)",
        left: "50%",
        transform: "translateX(-50%)",
        display: "flex",
        alignItems: "center",
        gap: "var(--spacing-3)",
        padding: "var(--spacing-3) var(--spacing-5)",
        backgroundColor: "var(--color-surface-inverse)",
        color: "var(--color-text-inverse)",
        borderRadius: "var(--radius-lg)",
        boxShadow: "var(--shadow-xl)",
        zIndex: "var(--z-toolbar)",
      }}
    >
      <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--font-medium)" }}>
        {selectedCount} selected
      </span>
      {selectedCount < totalCount && (
        <button
          onClick={onSelectAll}
          style={{ background: "none", border: "none", color: "inherit", cursor: "pointer", textDecoration: "underline" }}
        >
          Select all {totalCount}
        </button>
      )}
      <div style={{ width: "1px", height: "1em", backgroundColor: "var(--color-border-inverse-subtle)" }} />
      {actions.map((action) => (
        <button
          key={action.label}
          onClick={action.onClick}
          style={{
            background: "none",
            border: "none",
            color: action.variant === "destructive" ? "var(--color-status-error-light)" : "inherit",
            cursor: "pointer",
            fontSize: "var(--text-sm)",
          }}
        >
          {action.label}
        </button>
      ))}
      <button
        onClick={onClear}
        aria-label="Clear selection"
        style={{ background: "none", border: "none", color: "inherit", cursor: "pointer" }}
      >
        ×
      </button>
    </div>
  );
}
```

**After destructive bulk action**: show undo toast for 5 seconds. If bulk operation is long-running (>1s), replace the toolbar with a progress indicator.

---

### Pattern 5: Wizard / Multi-Step Form

**Sources**: Eleken ("Wizard UI Pattern"), Growform, Medium ("React Wizard"), Figma Community ("150+ Stepper Types"), PatternFly ("Wizard")

**When to use**: 3+ logically separate phases of data entry, compliance forms with conditional branching, onboarding personalization flows. Do not use for forms that benefit from all-fields-visible review.

**Anatomy**
- Step indicator (horizontal numbered stepper for ≤6 steps, vertical left-nav for 6+ steps)
- Step label: descriptive ("Contact info") not numeric only ("Step 1")
- Content area: only current step's fields
- Footer: Back + Next/Submit buttons (Back disabled on step 1)
- Progress: step X of Y shown as both indicator and in page title

**URL-based step tracking** for refresh-safety and deep-link support (`?step=2`).

```tsx
// useWizard.ts
import { useCallback, useReducer } from "react";

interface WizardState<T> {
  step: number;
  totalSteps: number;
  data: Partial<T>;
}

type WizardAction<T> =
  | { type: "NEXT"; payload: Partial<T> }
  | { type: "BACK" }
  | { type: "JUMP"; step: number };

function wizardReducer<T>(state: WizardState<T>, action: WizardAction<T>): WizardState<T> {
  switch (action.type) {
    case "NEXT":
      return {
        ...state,
        step: Math.min(state.step + 1, state.totalSteps - 1),
        data: { ...state.data, ...action.payload },
      };
    case "BACK":
      return { ...state, step: Math.max(state.step - 1, 0) };
    case "JUMP":
      return { ...state, step: action.step };
    default:
      return state;
  }
}

export function useWizard<T>(totalSteps: number, initialData: Partial<T> = {}) {
  const [state, dispatch] = useReducer(wizardReducer<T>, {
    step: 0,
    totalSteps,
    data: initialData,
  });

  const next = useCallback(
    (payload: Partial<T>) => dispatch({ type: "NEXT", payload }),
    []
  );
  const back = useCallback(() => dispatch({ type: "BACK" }), []);
  const jump = useCallback((step: number) => dispatch({ type: "JUMP", step }), []);

  return { ...state, next, back, jump };
}
```

**Step indicator component**
```tsx
// StepIndicator.tsx
interface StepIndicatorProps {
  steps: string[];
  currentStep: number;
  completedSteps: Set<number>;
}

export function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <ol
      aria-label="Form progress"
      style={{ display: "flex", gap: 0, listStyle: "none", padding: 0, margin: 0 }}
    >
      {steps.map((label, index) => {
        const isCompleted = completedSteps.has(index);
        const isCurrent = index === currentStep;
        return (
          <li
            key={index}
            aria-current={isCurrent ? "step" : undefined}
            style={{ display: "flex", alignItems: "center", flex: 1 }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "var(--text-sm)",
                fontWeight: "var(--font-medium)",
                backgroundColor: isCompleted
                  ? "var(--color-status-success)"
                  : isCurrent
                    ? "var(--color-action-primary)"
                    : "var(--color-surface-subtle)",
                color: isCompleted || isCurrent ? "var(--color-text-on-action)" : "var(--color-text-secondary)",
              }}
            >
              {isCompleted ? "✓" : index + 1}
            </span>
            <span
              style={{
                marginLeft: "var(--spacing-2)",
                fontSize: "var(--text-sm)",
                color: isCurrent ? "var(--color-text-primary)" : "var(--color-text-secondary)",
              }}
            >
              {label}
            </span>
            {index < steps.length - 1 && (
              <div
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: isCompleted ? "var(--color-status-success)" : "var(--color-border-default)",
                  marginInline: "var(--spacing-2)",
                }}
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
```

**Anti-patterns**
- Losing user-entered data when the user clicks Back — always merge, never reset
- Disabled Next button with no error feedback — show validation inline before blocking navigation
- Wizard for forms with 2 or fewer fields

---

### Pattern 6: Timeline / Activity Feed

**Sources**: Nicelydone ("Timeline & History"), Aubergine Solutions ("Chronological Activity Feeds"), UX Patterns Dev ("Timeline"), Atlassian ("Jira activity")

**Three variants**

| Variant | Use case | Direction |
|---|---|---|
| **Activity feed** | Who did what, real-time updates | Newest first (top) |
| **Audit log** | Immutable record of changes | Newest first, read-only |
| **Process timeline** | Stages / milestones of a single entity | Oldest first (left-to-right) or top-to-bottom |

**Activity feed anatomy**: avatar/icon + actor name + action verb + object + relative timestamp ("2 hours ago"). Day separator divides groups. Aggregation collapses repeat events ("User A and 3 others commented").

```tsx
// ActivityFeed.tsx
interface ActivityEvent {
  id: string;
  actorName: string;
  actorAvatarUrl?: string;
  action: string; // "created", "updated", "deleted", "commented on"
  objectLabel: string;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

interface ActivityFeedProps {
  events: ActivityEvent[];
  isLive?: boolean; // enables aria-live region
}

function formatRelativeTime(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}

export function ActivityFeed({ events, isLive }: ActivityFeedProps) {
  return (
    <ol
      aria-label="Activity feed"
      aria-live={isLive ? "polite" : undefined}
      aria-relevant={isLive ? "additions" : undefined}
      style={{
        listStyle: "none",
        padding: 0,
        margin: 0,
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
      }}
    >
      {events.map((event, index) => (
        <li
          key={event.id}
          style={{
            display: "grid",
            gridTemplateColumns: "32px 1fr",
            gap: "var(--spacing-3)",
            paddingBottom: "var(--spacing-4)",
          }}
        >
          {/* Connector line */}
          {index < events.length - 1 && (
            <div
              aria-hidden="true"
              style={{
                gridColumn: "1",
                gridRow: "1",
                width: 2,
                backgroundColor: "var(--color-border-default)",
                marginInline: "auto",
                marginTop: 32,
                height: "calc(100% + var(--spacing-4))",
              }}
            />
          )}
          {/* Avatar node */}
          <div
            aria-hidden="true"
            style={{
              gridColumn: "1",
              gridRow: "1",
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "var(--color-surface-accent)",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            {event.actorAvatarUrl ? (
              <img src={event.actorAvatarUrl} alt="" style={{ width: "100%", height: "100%" }} />
            ) : (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", fontSize: "var(--text-sm)" }}>
                {event.actorName[0].toUpperCase()}
              </span>
            )}
          </div>
          {/* Content */}
          <div style={{ gridColumn: "2", gridRow: "1" }}>
            <p style={{ margin: 0, fontSize: "var(--text-sm)" }}>
              <strong>{event.actorName}</strong>{" "}
              {event.action}{" "}
              <em>{event.objectLabel}</em>
            </p>
            <time
              dateTime={event.timestamp.toISOString()}
              style={{ fontSize: "var(--text-xs)", color: "var(--color-text-tertiary)" }}
            >
              {formatRelativeTime(event.timestamp)}
            </time>
          </div>
        </li>
      ))}
    </ol>
  );
}
```

**Anti-patterns**
- Infinite scroll for audit logs — auditors need to reach the beginning; use "Load 20 more" button
- Showing real-time updates mid-scroll without anchoring position

---

### Pattern 7: Dashboard Layout

**Sources**: Justinmind ("Dashboard Design"), Polaris ("Dashboard page"), Salesforce SLDS ("Dashboard"), Atlassian, SetProduct

**Information hierarchy**: summary → trend → detail. Users scan top-to-bottom in an F-pattern; top row is most valuable real estate.

**Standard layout zones**

1. **KPI strip** — 4–6 metric cards in a horizontal row. Each card: metric label + value (large, tabular numerals) + delta vs. prior period (arrow + percentage, colored green/red). Clicking a KPI card drills into the detail view.
2. **Charts row** — 1–3 charts showing trends (line, bar, area). Date-range filter controls all charts simultaneously.
3. **Detail table** — paginated data table with top 10–20 records, link to full list.

```tsx
// KpiCard.tsx
interface KpiCardProps {
  label: string;
  value: string | number;
  delta?: number; // percentage, positive = improvement
  onClick?: () => void;
}

export function KpiCard({ label, value, delta, onClick }: KpiCardProps) {
  const isPositive = (delta ?? 0) >= 0;
  return (
    <article
      onClick={onClick}
      tabIndex={onClick ? 0 : undefined}
      role={onClick ? "button" : undefined}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
      style={{
        padding: "var(--spacing-5)",
        backgroundColor: "var(--color-surface-card)",
        borderRadius: "var(--radius-base)",
        border: "1px solid var(--color-border-default)",
        cursor: onClick ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        gap: "var(--spacing-2)",
      }}
    >
      <span style={{ fontSize: "var(--text-sm)", color: "var(--color-text-secondary)" }}>{label}</span>
      <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--font-bold)", fontVariantNumeric: "tabular-nums" }}>
        {value}
      </span>
      {delta !== undefined && (
        <span
          aria-label={`${isPositive ? "Up" : "Down"} ${Math.abs(delta)}% vs previous period`}
          style={{
            fontSize: "var(--text-xs)",
            color: isPositive ? "var(--color-status-success)" : "var(--color-status-error)",
          }}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(delta)}%
        </span>
      )}
    </article>
  );
}
```

**Dashboard grid** (responsive bento)
```css
.dashboard-grid {
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-template-rows: auto;
  gap: var(--spacing-4);
}

/* KPI strip: 3 per row on desktop, 2 on tablet, 1 on mobile */
.kpi-card { grid-column: span 3; }
@media (max-width: 1024px) { .kpi-card { grid-column: span 6; } }
@media (max-width: 640px) { .kpi-card { grid-column: span 12; } }

/* Chart cards: half-width or full */
.chart-half { grid-column: span 6; }
.chart-full { grid-column: span 12; }
```

**Anti-patterns**
- Date-range filter that only updates one widget but not others
- Showing raw numbers without units or context (no "%", "€", "items" label)
- KPI cards without a loading skeleton (layout shift on load)

---

### Pattern 8: Command Palette

**Sources**: Vendr ("History of Command Palettes"), Philip Davis ("Command Palette Interfaces"), Nicelydone, cmdk library, Linear DS

**Evolution**: TextMate (2005) → Sublime Text (2011, Cmd+Shift+P) → VS Code (2014) → GitHub (2021, `/`) → Linear/Notion/Figma (2021–2022) → now standard in enterprise SaaS.

**Keyboard shortcut**: `Cmd+K` (macOS) / `Ctrl+K` (Windows/Linux) — de-facto standard. Always provide a visible UI trigger button (icon button with tooltip) for discoverability.

**Anatomy**
- Modal dialog overlay (centered, 600px wide max)
- Search input (autofocused on open, placeholder "Search commands...")
- Result groups: Recent, Navigation, Commands, Data items
- Each result row: icon + label + keyboard shortcut hint (right-aligned)
- Empty state: "No results for {query}"

```tsx
// CommandPalette.tsx — uses cmdk + Radix Dialog
import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useEffect, useState } from "react";

interface CommandItem {
  id: string;
  label: string;
  group: "recent" | "navigation" | "actions";
  shortcut?: string;
  icon?: React.ReactNode;
  onSelect: () => void;
}

interface CommandPaletteProps {
  items: CommandItem[];
}

export function CommandPalette({ items }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const groups = {
    recent: items.filter((i) => i.group === "recent"),
    navigation: items.filter((i) => i.group === "navigation"),
    actions: items.filter((i) => i.group === "actions"),
  } as const;

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
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
          aria-label="Command palette"
          style={{
            position: "fixed",
            top: "20%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "min(600px, 90vw)",
            backgroundColor: "var(--color-surface-elevated)",
            borderRadius: "var(--radius-lg)",
            boxShadow: "var(--shadow-2xl)",
            overflow: "hidden",
            zIndex: "var(--z-modal)",
          }}
        >
          <Command>
            <Command.Input
              placeholder="Search commands..."
              style={{
                width: "100%",
                padding: "var(--spacing-3) var(--spacing-4)",
                border: "none",
                borderBottom: "1px solid var(--color-border-default)",
                backgroundColor: "transparent",
                fontSize: "var(--text-base)",
                outline: "none",
              }}
            />
            <Command.List style={{ maxHeight: 400, overflowY: "auto", padding: "var(--spacing-2)" }}>
              <Command.Empty style={{ padding: "var(--spacing-6)", textAlign: "center", color: "var(--color-text-tertiary)" }}>
                No results found.
              </Command.Empty>
              {(["recent", "navigation", "actions"] as const).map((groupKey) =>
                groups[groupKey].length > 0 ? (
                  <Command.Group
                    key={groupKey}
                    heading={groupKey.charAt(0).toUpperCase() + groupKey.slice(1)}
                  >
                    {groups[groupKey].map((item) => (
                      <Command.Item
                        key={item.id}
                        onSelect={() => {
                          item.onSelect();
                          setOpen(false);
                        }}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "var(--spacing-3)",
                          padding: "var(--spacing-2) var(--spacing-3)",
                          borderRadius: "var(--radius-sm)",
                          cursor: "pointer",
                          fontSize: "var(--text-sm)",
                        }}
                      >
                        {item.icon && <span aria-hidden="true">{item.icon}</span>}
                        <span style={{ flex: 1 }}>{item.label}</span>
                        {item.shortcut && (
                          <kbd
                            style={{
                              fontSize: "var(--text-xs)",
                              color: "var(--color-text-tertiary)",
                              backgroundColor: "var(--color-surface-subtle)",
                              padding: "1px 4px",
                              borderRadius: "var(--radius-xs)",
                              border: "1px solid var(--color-border-default)",
                            }}
                          >
                            {item.shortcut}
                          </kbd>
                        )}
                      </Command.Item>
                    ))}
                  </Command.Group>
                ) : null
              )}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

### Supplementary Pattern Catalogue

The following patterns appear frequently enough to warrant brief documentation without full code examples.

#### Inline Edit

Three affordance styles (UX Design World, WebAppHuddle):
- **Dashed border on hover** (Notion-style) — lowest friction, most discoverable
- **Pencil icon on hover** (Microsoft 365-style) — explicit, never ambiguous
- **Click-to-edit** (field click activates input) — most compact

Save patterns: Enter to save + Escape to cancel (keyboard-first) is preferred over auto-save on blur (risky: accidental tab-out). Show check + X buttons for pointer-first users.

Inline edit in tables: practical only for ≤5 editable columns. More than that → row-edit mode or detail drawer.

#### Date Picker

Always provide both a calendar grid and a free-text input (calendar alone fails when users know exact dates). Keyboard: arrow keys navigate cells, Enter selects, Page Up/Down switches month. Range selection: first click = start, hover highlights interim, second click = end. Footer: Today button + Clear button. ARIA: `role="grid"` on the calendar, `aria-selected` on the chosen cell. (Sources: UX Collective, UX Design World)

#### Settings Page Layout

Decision tree (SetProduct, Medium Bootcamp): under 8 sections → single scrollable page; 8–15 sections → tabbed or left-nav; 15+ sections → nested left-nav with settings search (instant filter of setting labels). Always show the current value for each setting. Danger zone: visually separated (red border or distinct background), typing-to-confirm required for account deletion.

#### Notification / Toast Taxonomy (SetProduct)

| Class | Dismiss | Position | Duration |
|---|---|---|---|
| Success | Auto (3s) | Top-right desktop / bottom-center mobile | Ephemeral |
| Info | Auto (5s) | Top-right | Ephemeral |
| Warning | Manual | Inline or top-right | Persistent |
| Error | Manual | Inline (field) or top-right | Persistent |

Undo pattern: success toast includes an Undo action link for the 3-second window.

#### File Upload

Show constraints BEFORE the user selects files (accepted types, max size, file count limit) — not as an error after failure. Progress: individual per-file progress bars for multi-file upload. Preview: thumbnail for images, filename + type icon for other files. Specific error messages ("File too large — max 10 MB") over generic ones. Retry button on per-file failure. (Source: Uploadcare)

#### Sidebar Navigation

Icon + text always outperforms icon-only (35% faster comprehension per UX Planet). Icon-only collapsed state (64px) requires tooltip on hover. Max 7 primary nav items (Miller's Law). Active item: accent background fill (not underline alone). State: persist collapsed/expanded to `localStorage`. Responsive: ≤768px collapses to drawer overlay. (Sources: UX Planet, ALF Design Group)

---

## Adoption Checklist

- [ ] Implement the three empty-state types (first-use, no-results, error) as a single `EmptyState` component with a `type` prop; audit all list views to ensure correct type is used
- [ ] Add a command palette with `Cmd+K` and a visible UI trigger; register navigation and top-10 frequent actions; include keyboard shortcut hints in each result row
- [ ] Replace any static toolbar for bulk operations with a floating `BulkActionBar`; implement three-scope selection (row, page, global) with an explicit "Select all N items" confirmation for global scope
- [ ] Apply the wizard pattern to any form with 3+ distinct phases; use `useWizard` reducer with URL step sync (`?step=N`) for refresh safety; never lose entered data on Back navigation
- [ ] Ensure every filter implementation renders applied filter chips with individual remove buttons and a "Clear all" link when ≥2 chips are active
- [ ] Use the KPI strip + chart row + detail table layout for all summary/dashboard views; connect a shared date-range filter that updates all widgets simultaneously
- [ ] Audit all toast notifications: success/info auto-dismiss ≤5 s, warning/error require manual dismiss; add undo action to destructive-mutation toasts
- [ ] Standardize sidebar state: icon+text expanded (240px) / icon-only (64px) / drawer (mobile); persist to `localStorage`; all icon-only items have tooltips
- [ ] Validate all inline-edit implementations use Enter-to-save + Escape-to-cancel and show explicit save controls (check + X) for pointer users
- [ ] Add settings-page search for any application with 15+ settings sections

---

## Anti-patterns

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Modal for complex forms (10+ fields) | Cramped layout, no URL deep-link | Dedicated route/page or full-height drawer |
| Passive empty-state copy ("No items found") | Does not help user take next action | Active voice: "Start by adding your first item" |
| Wizard that resets data on Back | Destroys user work, breaks trust | Merge step data via reducer; never reset on Back |
| Filter removal that silently resets to page 1 | Confusing — user expects same position | Preserve or announce page reset via live region |
| Floating bulk bar that covers primary page actions | Obscures content below the fold | Reserve bottom 80px viewport gutter for bulk bar; push content up |
| Command palette without a visible activation trigger | Power feature invisible to new users | Add a search/command button in the top nav bar |

---

## Sources

| Title | URL | Year | Authority |
|---|---|---|---|
| Shopify Polaris — Index | https://polaris.shopify.com/components/lists/index-table | 2025 | canonical |
| Shopify Polaris — Filters | https://polaris.shopify.com/components/selection-and-input/filters | 2025 | canonical |
| IBM Carbon — Data Table | https://carbondesignsystem.com/components/data-table/usage | 2025 | canonical |
| PatternFly — Wizard | https://www.patternfly.org/components/wizard | 2025 | canonical |
| PatternFly — Bulk Select | https://www.patternfly.org/components/toolbar | 2025 | canonical |
| Atlassian Design System | https://designsystems.surf/design-systems/atlassian | 2025 | established |
| Baymard Institute — Filtering | https://baymard.com/research/filtering | 2025 | primary research |
| Nielsen Norman Group — Dashboard | https://www.nngroup.com | 2025 | primary research |
| Eleken — Bulk Action UX | https://www.eleken.co/blog-posts/bulk-actions-ux | 2025 | established |
| Eleken — Empty State UX | https://www.eleken.co/blog-posts/empty-state-ux | 2025 | established |
| Eleken — Modal UX | https://www.eleken.co/blog-posts/modal-ux | 2025 | established |
| Eleken — Wizard UI Pattern | https://www.eleken.co/blog-posts/wizard-ui-pattern-explained | 2025 | established |
| Growform — Multi-Step Form | https://www.growform.co/must-follow-ux-best-practices-when-designing-a-multi-step-form | 2025 | established |
| Justinmind — Dashboard Design | https://www.justinmind.com/ui-design/dashboard-design-best-practices | 2025 | established |
| UX Collective — Date Picker | https://uxdesign.cc/date-picker-design-5c5ef8f35286 | 2024 | established |
| UX Design World — Inline Edit | https://uxdworld.com/inline-editing-in-tables-design | 2025 | established |
| UX Design World — Table Actions | https://uxdworld.com/best-practices-for-providing-actions-in-data-tables | 2025 | established |
| UX Planet — Sidebar | https://uxplanet.org/best-ux-practices-for-designing-a-sidebar-9174ee0ecaa2 | 2025 | established |
| ALF Design Group — Sidebar | https://www.alfdesigngroup.com/post/improve-your-sidebar-design-for-web-apps | 2025 | established |
| SetProduct — Notifications | https://www.setproduct.com/blog/notifications-ui-design | 2025 | established |
| SetProduct — Settings | https://www.setproduct.com/blog/settings-ui-design | 2025 | established |
| Aubergine Solutions — Activity Feeds | https://www.aubergine.co/insights/a-guide-to-designing-chronological-activity-feeds | 2025 | established |
| UX Patterns Dev — Timeline | https://uxpatterns.dev/patterns/data-display/timeline | 2025 | established |
| Nicelydone — Timeline | https://nicelydone.club/components/timeline-history | 2025 | established |
| Philip Davis — Command Palette | https://philipcdavis.com/writing/command-palette-interfaces | 2024 | established |
| Vendr — Command Palette History | https://www.vendr.com/blog/consumer-dev-tools-command-palette | 2025 | established |
| Uploadcare — File Uploader UX | https://uploadcare.com/blog/file-uploader-ux-best-practices | 2025 | established |
| Appcues — Onboarding Patterns | https://www.appcues.com/blog/user-onboarding-ui-ux-patterns | 2025 | established |
| Chameleon — Onboarding | https://www.chameleon.io/blog/onboarding-ux-patterns | 2025 | established |
| Medium — React Wizard | https://medium.com/@vandanpatel29122001/react-building-a-multi-step-form-with-wizard-pattern-85edec21f793 | 2025 | established |
| Figma Community — Stepper Types | https://www.figma.com/community/file/1344038523808556624 | 2025 | established |
| Mobbin — Accordion | https://mobbin.com/glossary/accordion | 2025 | established |

---

## Level 5 — Related Documents

- [BASELINE-L1.md](./BASELINE-L1.md) — Design tokens (colors, spacing, shadows used by all patterns)
- [BASELINE-L2.md](./BASELINE-L2.md) — Headless primitives (focus management, keyboard navigation inside patterns)
- [BASELINE-L3.md](./BASELINE-L3.md) — Component library (DataTable, Dialog, Toast as building blocks)
- [BASELINE-L5.md](./BASELINE-L5.md) — Content & Voice (copy guidelines for empty states, error messages, confirmation dialogs)
- [BASELINE-L6.md](./BASELINE-L6.md) — Accessibility (WCAG requirements for wizard step indicators, bulk selection announcements)
