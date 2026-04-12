# Layer 2 — Primitives: Elite Frontend Design-System Baseline

> Generic capability baseline synthesized from 137 sources across elite (W3C, Adobe, WorkOS/Radix, Tailwind Labs, Google Angular CDK, eBay), high, and community authority.
> Intended as a reference for the `frontend-catalog` package, not tied to any single consumer.

---

## Scope of this layer

Primitives are the unstyled, behavior-complete building blocks of a design system — components that encode keyboard interaction, ARIA semantics, focus management, and interaction normalization without imposing any visual style. They live directly above the token layer and directly below the styled component layer in the tokens → stories → catalog pipeline.

The purpose of this layer is to ensure that every interactive component in the catalog is accessible by construction rather than as an afterthought. This means: WAI-ARIA APG keyboard patterns are wired correctly, focus is managed on open/close/navigation, screen reader virtual cursor is supported, and interaction normalization covers mouse, touch, keyboard, and assistive technology input modes simultaneously.

"Elite" at this layer means: selecting primitives that are WAI-ARIA APG-compliant, tested against real assistive technology (NVDA, JAWS, VoiceOver, TalkBack), supporting keyboard interaction patterns defined in the W3C APG, handling `asChild` / slot composition cleanly, and either being framework-agnostic or having verified ports to the target framework. The test for any headless primitive is whether it passes `axe-core` automated tests AND manual AT testing — automated tools catch only ~57% of WCAG issues.

---

## Reference systems (top-tier)

- **W3C ARIA Authoring Practices Guide (APG)** — Normative reference for 30+ patterns, each with keyboard interaction, ARIA role/state/property, and AT-tested working examples. The ground truth every primitive library implements. `w3.org/WAI/ARIA/apg`
- **Radix Primitives (WorkOS)** — 28 components, WAI-ARIA compliant, React-only, independently versioned, `asChild` composition engine via `@radix-ui/react-slot`. 18.6k stars. `radix-ui.com/primitives`
- **React Aria (Adobe)** — 50+ hooks + components, strictest WAI-ARIA compliance, i18n via `@internationalized/date` (13 calendar systems), unified `usePress` interaction model. `react-spectrum.adobe.com/react-aria`
- **Headless UI (Tailwind Labs)** — React + Vue, 12 components, ARIA auto-management, 27k+ stars. Sentinel-node focus trap. `headlessui.com`
- **Ark UI / Zag (Chakra Systems)** — 45+ components across React/Vue/Svelte/Solid from state-machine (Zag) foundation. Strongest cross-framework primitive set. `ark-ui.com`
- **Floating UI** — Positioning engine for all tooltip/popover/dropdown. `~3kB`, collision detection, auto-flip/shift, useInteractions hook for composable event merging. `floating-ui.com`
- **Base UI (MUI)** — 35 components, zero styles, slot-based composition, 1.0 launched 2026. Built by Radix + Floating UI + MUI talent. `base-ui.com`
- **Ariakit (Diego Hernandez)** — Composite primitive with unified `roving tabindex` + `aria-activedescendant` + `virtualFocus` modes. The most sophisticated keyboard nav primitive. `ariakit.org`
- **Downshift** — 12k+ stars. `useCombobox` / `useSelect` / `useMultipleSelection`, ARIA 1.2 strict compliance, prop-getter pattern. `downshift-js.com`
- **focus-trap + tabbable** — Low-level focus trap (sentinel-node) and focusable element query library. Used by Radix, Headless UI, and many others. `github.com/focus-trap`
- **Angular CDK a11y** — Most complete framework-provided a11y primitive set: `FocusTrap`, `FocusMonitor`, `ListKeyManager`, `ActiveDescendantKeyManager`, `LiveAnnouncer`. `material.angular.dev/cdk/a11y`
- **TanStack Table + Virtual** — 100% headless, cross-framework table and virtualization. ARIA `aria-rowcount`/`aria-colindex` responsibility is explicit on the consumer. `tanstack.com`
- **axe-core (Deque)** — 15M weekly downloads, automated ARIA testing engine. Used by Storybook, Playwright, Cypress, Jest DOM. ~57% WCAG issue detection rate. `github.com/dequelabs/axe-core`
- **eBay MIND Patterns** — Production-tested accessibility patterns library, framework-agnostic, WCAG 2.2 Level AA, tested with NVDA/JAWS/VoiceOver. `ebay.gitbook.io/mindpatterns`

---

## Core patterns

### Pattern 1: Compound Component Anatomy (Root → Trigger → Content → Item)

**Problem it solves:** Monolithic components with dozens of props create unmaintainable APIs and prevent consumers from rendering custom elements at arbitrary points in the tree. Compound components expose each sub-part as a named export.

**Canonical implementation:**
Every Radix primitive follows: `Root` (context + state), `Trigger` (button that opens/activates), `Content` (floating/revealed element), `Item` (repeatable sub-element), `Indicator` (visual state marker). Sub-components communicate through React context; no prop-drilling. `asChild` on any sub-part injects ARIA + handlers into the consumer's own element.

Sources: Radix Primitives Introduction, Vercel Academy "Anatomy of a Primitive", DeepWiki radix-ui/primitives "Component Composition Pattern", WorkOS "Radix vs shadcn/ui".

```tsx
// Radix compound component — all 5 anatomy parts
import * as Popover from '@radix-ui/react-popover';

function InfoPopover({ label, content }: { label: string; content: React.ReactNode }) {
  return (
    <Popover.Root>
      {/* Trigger: asChild merges ARIA+handlers onto caller's element */}
      <Popover.Trigger asChild>
        <button type="button" aria-label={label}>
          <InfoIcon />
        </button>
      </Popover.Trigger>

      {/* Portal: renders outside DOM parent to avoid stacking-context issues */}
      <Popover.Portal>
        <Popover.Content
          side="bottom"
          align="start"
          sideOffset={4}
          onOpenAutoFocus={(e) => e.preventDefault()} // control focus destination
        >
          {content}
          <Popover.Close aria-label="Close" />
          {/* Arrow is a sub-part/Indicator */}
          <Popover.Arrow />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
```

---

### Pattern 2: asChild / Slot Composition

**Problem it solves:** The polymorphic `as` prop requires complex generics and loses TypeScript type-safety for the rendered element. `asChild` avoids a wrapper DOM node while safely merging all ARIA attributes, event handlers, and refs onto the consumer's provided child element.

**Canonical implementation:**
`@radix-ui/react-slot` exposes `Slot` and `Slottable`. When `asChild={true}`, `Slot` clones the single child and merges props using `composeRefs` for refs and explicit handler merging (neither caller nor library handler can silently swallow the other's event).

Sources: Radix "Composition Guide", `@radix-ui/react-slot` docs, Jacob Paris "Implement asChild Pattern", Reka UI Vue port analysis.

```tsx
// Implementing asChild from scratch (simplified)
import React from 'react';

type SlotProps = { children: React.ReactElement; [key: string]: unknown };

function Slot({ children, ...slotProps }: SlotProps) {
  const child = React.Children.only(children);

  return React.cloneElement(child, {
    ...slotProps,
    ...child.props,
    // Merge event handlers — both must be called
    onClick: composeHandlers(slotProps.onClick, child.props.onClick),
    // Merge refs
    ref: composeRefs(
      (slotProps as { ref?: React.Ref<unknown> }).ref,
      (child as React.ReactElement & { ref?: React.Ref<unknown> }).ref,
    ),
    // Merge className
    className: [slotProps.className, child.props.className].filter(Boolean).join(' '),
  });
}

function composeHandlers<E>(
  a?: React.EventHandler<E>,
  b?: React.EventHandler<E>,
): React.EventHandler<E> | undefined {
  if (!a && !b) return undefined;
  return (e: E) => {
    a?.(e);
    b?.(e);
  };
}
```

---

### Pattern 3: Focus Management (Trap → Restore → Roving)

**Problem it solves:** Dialogs that don't trap focus allow screen reader users to reach background content. Components that don't restore focus disorient AT users. Composite widgets without roving tabindex require too many Tab stops.

**Three sub-patterns:**

**3a — Focus Trap (Dialogs/Modals):**
On open: move focus into dialog (first interactive element or `tabindex=-1` static header). While open: `Tab`/`Shift+Tab` cycle only within. On close: restore focus to the trigger. Use `inert` attribute on background content (preferred over `aria-hidden` for HTML5). The `<dialog>.showModal()` native API handles both automatically.

**3b — Roving Tabindex (Toolbars, Radio Groups, Tabs):**
Only one item in the group has `tabindex=0` at any time; all others have `tabindex=-1`. Arrow keys move focus and update `tabindex=0` imperatively. `Home`/`End` jump to first/last. The entire group appears as a single Tab stop.

**3c — aria-activedescendant (Combobox Listboxes):**
Container holds real DOM focus; `aria-activedescendant` IDREF tracks the logically active item. Scroll of list must be implemented manually (it does not auto-scroll). VoiceOver has known gaps — prefer `roving tabindex` for tree views and grids; use `aria-activedescendant` only when the input element must retain focus (combobox pattern).

Sources: W3C APG "Developing a Keyboard Interface", W3C APG "Radio Group Example" (roving tabindex reference), Sarah Higley "aria-activedescendant is not focus", focus-trap GitHub, react-focus-lock, inert attribute guidance.

```tsx
// Roving tabindex implementation (no external library)
import { useRef, useCallback, KeyboardEvent } from 'react';

function useRovingTabIndex(count: number) {
  const activeRef = useRef(0);
  const itemRefs = useRef<(HTMLElement | null)[]>([]);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    let next = activeRef.current;

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      next = (activeRef.current + 1) % count;
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      next = (activeRef.current - 1 + count) % count;
    } else if (e.key === 'Home') {
      next = 0;
    } else if (e.key === 'End') {
      next = count - 1;
    } else {
      return;
    }

    e.preventDefault();
    activeRef.current = next;
    itemRefs.current[next]?.focus();
  }, [count]);

  return {
    getItemProps: (index: number) => ({
      ref: (el: HTMLElement | null) => { itemRefs.current[index] = el; },
      tabIndex: index === 0 ? 0 : -1,
      onKeyDown: handleKeyDown,
    }),
  };
}
```

---

### Pattern 4: Unified Cross-Device Interaction (usePress)

**Problem it solves:** `onClick` fires twice on touch devices (pointer + emulated mouse), doesn't handle keyboard `Enter`/`Space` equivalence, and the native focus-on-click behavior differs between Safari and other browsers. A unified press hook normalizes all input modes.

**Canonical implementation:**
React Aria's `usePress` handles: pointer down/up, touch start/end (with global pointer capture to detect off-target release), keyboard Enter/Space as press equivalent, prevents browser mouse-after-touch duplicate event, and exposes `isPressed` for visual active state.

Sources: React Aria "usePress", React Aria "Interactions Overview", React Aria Blog "Building a Button Part 3" (Safari focus quirks), usePress.ts source code.

```tsx
import { usePress } from '@react-aria/interactions';

function PressableItem({ onAction, children }: { onAction: () => void; children: React.ReactNode }) {
  const { pressProps, isPressed } = usePress({
    onPress: () => onAction(),
    // Prevent native Safari focus-on-click from moving focus to body
    // (post-Safari 17: let browser manage focus natively)
  });

  return (
    <div
      role="button"
      tabIndex={0}
      data-pressed={isPressed || undefined}
      {...pressProps}
      style={{
        background: isPressed ? 'var(--color-action-pressed)' : 'var(--color-action-default)',
      }}
    >
      {children}
    </div>
  );
}
```

---

### Pattern 5: Floating Element Positioning (Floating UI)

**Problem it solves:** Tooltips, popovers, dropdowns, and menus need to flip, shift, and hide relative to their reference element as the viewport scrolls or resizes. Manual positioning breaks in every viewport edge case.

**Canonical implementation:**
`useFloating` from `@floating-ui/react` provides x/y coordinates plus `strategy` (absolute/fixed). Middlewares compose: `flip()` (flips when near viewport edge), `shift()` (nudges to stay within boundary), `offset()` (gap from reference), `size()` (constrains max-height). `useInteractions()` merges multiple independent interaction hooks (hover, click, dismiss, role).

Sources: Floating UI React docs, Floating UI `useInteractions`, floating-ui/floating-ui GitHub, Sarah Higley "Tooltips in WCAG 2.1" (WCAG 1.4.13 hoverable requirement).

```tsx
import {
  useFloating, useInteractions, useHover, useFocus,
  useDismiss, useRole, flip, shift, offset,
} from '@floating-ui/react';
import { useState } from 'react';

function AccessibleTooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(false);

  const { refs, floatingStyles, context } = useFloating({
    open,
    onOpenChange: setOpen,
    middleware: [offset(8), flip(), shift({ padding: 4 })],
  });

  const hover = useHover(context, { move: false });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });  // adds aria-describedby

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  return (
    <>
      <span ref={refs.setReference} {...getReferenceProps()}>
        {children}
      </span>
      {open && (
        <div
          ref={refs.setFloating}
          role="tooltip"
          style={floatingStyles}
          {...getFloatingProps()}
        >
          {label}
        </div>
      )}
    </>
  );
}
```

---

### Pattern 6: Combobox / Autocomplete (ARIA 1.2)

**Problem it solves:** Combobox is the most complex primitive pattern: a text input whose value filters a popup list while keeping focus in the input, with typeahead, Arrow key navigation, and proper ARIA 1.2 semantics.

**Key ARIA 1.2 requirements:**
`aria-haspopup` lives on the `<input>`, not on a wrapper. `aria-expanded` on the input. `aria-controls` points to listbox. `aria-activedescendant` on input tracks highlighted option's ID. `Escape` closes and returns focus to input. `Arrow Down` opens and moves highlight to first item. `Enter` selects highlighted item.

Sources: W3C APG "Combobox Pattern", Downshift `useCombobox`, Headless UI Combobox, React Aria `useComboBox`, Ariakit `virtualFocus` for combobox.

```tsx
import { useCombobox } from 'downshift';

function FilterableSelect({ items }: { items: string[] }) {
  const [inputValue, setInputValue] = useState('');
  const filteredItems = items.filter(i =>
    i.toLowerCase().includes(inputValue.toLowerCase()),
  );

  const {
    isOpen, highlightedIndex, selectedItem,
    getInputProps, getToggleButtonProps,
    getMenuProps, getItemProps, getLabelProps,
  } = useCombobox({
    items: filteredItems,
    inputValue,
    onInputValueChange: ({ inputValue: v = '' }) => setInputValue(v),
  });

  return (
    <div>
      <label {...getLabelProps()}>Search options</label>
      <div style={{ display: 'flex' }}>
        {/* input: aria-haspopup, aria-expanded, aria-controls, aria-activedescendant */}
        <input {...getInputProps()} />
        <button type="button" {...getToggleButtonProps()} aria-label="toggle menu" />
      </div>
      {/* role=listbox, must spread ALL getMenuProps() */}
      <ul {...getMenuProps()} style={{ display: isOpen ? 'block' : 'none' }}>
        {isOpen && filteredItems.map((item, index) => (
          <li
            key={item}
            style={{ background: highlightedIndex === index ? 'var(--color-item-hover)' : '' }}
            {...getItemProps({ item, index })}  // aria-selected, role=option, id
          >
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

---

### Pattern 7: State Machine-Based Primitives (Zag / Ark)

**Problem it solves:** Complex interactive components (date pickers, multi-step dialogs, color pickers) have many discrete states and valid transitions. Representing these as ad-hoc boolean flags produces untestable, inconsistent behavior across frameworks.

**Canonical implementation:**
Zag models each component as an XState-inspired FSM: `context` (shared data), `state` (current behavioral state, e.g., `idle`/`open`/`focused`), `transitions` (events that trigger state changes). Framework bindings (`@zag-js/react`, `@zag-js/vue`, `@zag-js/solid`) convert machine output to prop-getters. Ark UI wraps Zag machines in ergonomic compound component APIs.

Sources: Zag GitHub, Ark UI, chakra-ui/ark GitHub, DeepWiki "chakra-ui/ark".

```tsx
import * as zagSelect from '@zag-js/select';
import { useMachine, normalizeProps } from '@zag-js/react';

const selectItems = [
  { label: 'Option A', value: 'a' },
  { label: 'Option B', value: 'b' },
];

function MachineSelect() {
  const [state, send] = useMachine(
    zagSelect.machine({
      id: 'select-1',
      collection: zagSelect.collection({ items: selectItems }),
    }),
  );

  const api = zagSelect.connect(state, send, normalizeProps);

  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Choose option</label>
      <button type="button" {...api.getTriggerProps()}>
        {api.valueAsString || 'Select…'}
      </button>
      <div {...api.getPositionerProps()}>
        <ul {...api.getContentProps()}>
          {selectItems.map(item => (
            <li key={item.value} {...api.getItemProps({ item })}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
```

---

### Pattern 8: Accessible Drag and Drop (WCAG 2.2 SC 2.5.7)

**Problem it solves:** Drag-and-drop interactions are pointer-only by default. WCAG 2.2 SC 2.5.7 (Dragging Movements, Level AA) requires that all drag operations have a pointer single-point alternative (e.g., keyboard move with Arrow keys + Enter to confirm drop).

**Canonical implementation:**
React Aria's `useDraggableCollection` + `useDroppableCollection` handle pointer drag, touch drag, and keyboard-accessible drag (Insert key starts drag, Arrow keys choose drop target, Enter confirms, Escape cancels). Screen reader announcements via `aria-live` for drag state.

Sources: React Aria `useDroppableCollection`, WCAG 2.2 "What's New" (SC 2.5.7).

---

## Adoption checklist for frontend-catalog

- [ ] **Headless primitive library selected** — Choose one primary primitive library (Radix, React Aria, Ark, or Base UI) as the catalog foundation. Document the choice and the selection criteria (i18n depth, framework support, maintenance backing, ARIA strictness).
- [ ] **All 30+ APG patterns covered** — Map each interactive component in the catalog to its W3C APG pattern; every component's keyboard interaction matches the normative specification exactly.
- [ ] **axe-core integrated in Storybook and CI** — `@storybook/addon-a11y` with `axe-core` runs on every story; CI fails on any axe violation; automated checks supplemented by manual AT testing checklist.
- [ ] **Focus trap verified for all modal layers** — Dialogs, drawers, and sheets trap Tab/Shift+Tab; focus moves into overlay on open; focus returns to trigger on close; background receives `inert` attribute.
- [ ] **Roving tabindex implemented for all composite widgets** — Toolbars, tab lists, radio groups, sliders, and menus use roving tabindex (one `tabindex=0` item); entire group is a single Tab stop.
- [ ] **usePress / unified interaction** — No direct `onClick` on custom interactive elements; use `usePress` (React Aria) or equivalent that handles keyboard, touch, and pointer without duplicate events.
- [ ] **asChild / Slot composition available** — Every primitive supports `asChild` or an equivalent slot API so consumers can render any element without DOM node inflation; ref and event merging tested.
- [ ] **Floating UI used for all positioned overlays** — No manual `position: absolute` calculations; Floating UI handles flip, shift, offset, and hide for tooltips, popovers, dropdowns, and menus.
- [ ] **WCAG 2.2 AA compliance** — SC 2.4.11 Focus Not Obscured (sticky header coverage), SC 2.4.13 Focus Appearance (≥2px, 3:1 contrast), SC 2.5.7 Dragging Movements (keyboard alternative), SC 3.2.6 Consistent Help — all verified.
- [ ] **Tooltip WCAG 1.4.13 compliance** — Tooltips are dismissable with Escape, hoverable (pointer can travel to tooltip without dismiss), and persistent. Floating UI safe-triangle pattern where relevant.
- [ ] **i18n primitives for date/number inputs** — Date pickers use `@internationalized/date` or equivalent supporting multiple calendar systems; number fields use `Intl.NumberFormat`; text inputs support RTL via `dir` attribute.
- [ ] **AT testing matrix documented** — Each component has evidence of testing against NVDA+Chrome, JAWS+Edge, VoiceOver+Safari (macOS and iOS), and TalkBack+Chrome (Android).

---

## Anti-patterns

1. **Using `role=menu` for navigation links** — Navigation lists are not application menus. `role=menu`/`role=menuitem` semantics tell screen readers they are in an application context (like a desktop File menu) with Arrow-key navigation. Navigation links should use `<nav>` + `<a>` or `role=listbox` for selectable lists. This is the most widespread ARIA misuse in the wild.

2. **`aria-modal` without a focus trap** — `aria-modal=true` signals modal semantics to AT but does NOT trap focus. A separate focus trap implementation is always required. AT support for `aria-modal` is also incomplete; the `inert` attribute on background content is the more reliable approach.

3. **`aria-activedescendant` for tree views and grids** — `aria-activedescendant` does not scroll the list and VoiceOver has known compatibility gaps. Use roving tabindex for tree views, grids, and any list where the active item should auto-scroll into view. Reserve `aria-activedescendant` for combobox input patterns only.

4. **Polymorphic `as` prop instead of `asChild`** — The `as` prop requires complex TypeScript generics to preserve child element type-safety and creates ref-forwarding complexity. The `asChild` pattern via `@radix-ui/react-slot` avoids both problems with a simpler implementation and preserved TypeScript types.

5. **Direct `onClick` on interactive elements** — Browser's `click` event fires twice on touch devices (pointer + emulated mouse), doesn't normalize keyboard `Enter`/`Space`, and behaves inconsistently on iOS Safari. Always use a normalized press handler for custom interactive elements.

6. **Skipping AT testing after automated axe passes** — axe-core catches ~57% of WCAG issues. Critical failures like incorrect focus trap order, missing typeahead in listboxes, and aria-activedescendant scroll failures require manual testing with a real screen reader. A green axe score is a necessary but not sufficient accessibility gate.

---

## Sources (full citation list)

### Primary — W3C Normative References
- ARIA Authoring Practices Guide — https://www.w3.org/WAI/ARIA/apg/
- APG Patterns Index — https://www.w3.org/WAI/ARIA/apg/patterns/
- Combobox Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/combobox/
- Dialog (Modal) Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/
- Keyboard Interface — https://www.w3.org/WAI/ARIA/apg/practices/keyboard-interface/
- Accordion Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/accordion/
- Date Picker Dialog Example — https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/examples/datepicker-dialog/
- Disclosure Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/
- Grid Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/grid/
- Listbox Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/listbox/
- Menu Button Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/
- Radio Group (roving tabindex) — https://www.w3.org/WAI/ARIA/apg/patterns/radio/examples/radio/
- Tabs Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/tabs/
- Tree View Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/treeview/
- Carousel Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/carousel/
- Data Grid Examples — https://www.w3.org/WAI/ARIA/apg/patterns/grid/examples/data-grids/
- Slider Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/slider/
- Switch Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/switch/
- Toolbar Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/toolbar/
- Tooltip Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/
- Landmark Regions — https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/
- SpinButton Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/spinbutton/
- Feed Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/feed/
- Breadcrumb Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/
- Navigation Landmark Example — https://www.w3.org/WAI/ARIA/apg/patterns/landmark-regions/examples/navigation.html
- Treegrid Pattern — https://www.w3.org/WAI/ARIA/apg/patterns/treegrid/
- WAI-ARIA 1.3 Working Draft — https://www.w3.org/TR/wai-aria-1.3/
- WCAG 2.2 What's New — https://www.w3.org/WAI/standards-guidelines/wcag/new-in-22/
- WCAG 2.2 SC 2.4.13 Focus Appearance — https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html
- WAI-ARIA 1.3 FPWD Announcement — https://www.w3.org/news/2024/first-public-working-draft-accessible-rich-internet-applications-wai-aria-1-3/
- w3c/aria-practices GitHub — https://github.com/w3c/aria-practices

### Primary — Headless Libraries
- Radix Primitives Introduction — https://www.radix-ui.com/primitives/docs/overview/introduction
- Radix Composition Guide (asChild) — https://www.radix-ui.com/primitives/docs/guides/composition
- Radix Slot Utility — https://www.radix-ui.com/primitives/docs/utilities/slot
- Radix OTP Field — https://www.radix-ui.com/primitives/docs/components/one-time-password-field
- Radix Password Toggle — https://www.radix-ui.com/primitives/docs/components/password-toggle-field
- radix-ui/primitives GitHub — https://github.com/radix-ui/primitives
- React Aria Home — https://react-spectrum.adobe.com/react-aria/index.html
- React Aria Accessibility — https://react-spectrum.adobe.com/react-aria/accessibility.html
- React Aria Hooks List — https://react-spectrum.adobe.com/react-aria/hooks.html
- React Aria Interactions — https://react-spectrum.adobe.com/react-aria/interactions.html
- React Aria Architecture — https://react-spectrum.adobe.com/architecture.html
- React Aria useCalendar — https://react-spectrum.adobe.com/react-aria/useCalendar.html
- React Aria useFocusVisible — https://react-spectrum.adobe.com/react-aria/useFocusVisible.html
- React Aria useListBox — https://react-spectrum.adobe.com/react-aria/useListBox.html
- React Aria usePress — https://react-spectrum.adobe.com/react-aria/usePress.html
- React Aria useSelect — https://react-spectrum.adobe.com/react-aria/useSelect.html
- React Aria useGridList — https://react-spectrum.adobe.com/react-aria/useGridList.html
- React Aria useToast — https://react-spectrum.adobe.com/react-aria/useToast.html
- React Aria useDroppableCollection — https://react-spectrum.adobe.com/react-aria/useDroppableCollection.html
- React Stately — https://react-spectrum.adobe.com/react-stately/index.html
- Internationalized — https://react-spectrum.adobe.com/internationalized/index.html
- React Aria Date Pickers Blog — https://react-spectrum.adobe.com/blog/date-and-time-pickers-for-all.html
- React Aria Button Focus Blog — https://react-spectrum.adobe.com/blog/building-a-button-part-3.html
- React Aria November 2024 Release — https://react-spectrum.adobe.com/v3/releases/2024-11-20.html
- adobe/react-spectrum GitHub — https://github.com/adobe/react-spectrum
- usePress.ts Source — https://github.com/adobe/react-spectrum/blob/main/packages/%40react-aria/interactions/src/usePress.ts
- Headless UI Home — https://headlessui.com/
- Headless UI Combobox — https://headlessui.com/react/combobox
- Headless UI Listbox — https://headlessui.com/react/listbox
- Headless UI Menu — https://headlessui.com/react/menu
- Headless UI Tabs — https://headlessui.com/react/tabs
- tailwindlabs/headlessui GitHub — https://github.com/tailwindlabs/headlessui
- Ark UI Home — https://ark-ui.com/
- chakra-ui/ark GitHub — https://github.com/chakra-ui/ark
- Zag Home — https://zagjs.com/
- chakra-ui/zag GitHub — https://github.com/chakra-ui/zag
- Base UI Home — https://base-ui.com/
- Base UI Releases — https://base-ui.com/react/overview/releases
- Ariakit Home — https://ariakit.org/
- Ariakit API Reference — https://ariakit.org/reference
- ariakit/ariakit GitHub — https://github.com/ariakit/ariakit
- Downshift Home — https://www.downshift-js.com/
- Downshift useCombobox — https://www.downshift-js.com/use-combobox/
- downshift-js/downshift GitHub — https://github.com/downshift-js/downshift
- Floating UI React — https://floating-ui.com/docs/react
- Floating UI useInteractions — https://floating-ui.com/docs/useinteractions
- floating-ui/floating-ui GitHub — https://github.com/floating-ui/floating-ui

### Primary — Framework-Specific Primitives
- Melt UI (Svelte) Home — https://melt-ui.com/
- melt-ui/melt-ui GitHub — https://github.com/melt-ui/melt-ui
- Bits UI (Svelte) — https://bits-ui.com/docs/introduction
- Reka UI (Vue) Home — https://reka-ui.com/
- unovue/reka-ui GitHub — https://github.com/unovue/reka-ui
- Kobalte (SolidJS) Home — https://kobalte.dev/
- kobaltedev/kobalte GitHub — https://github.com/kobaltedev/kobalte
- @kobalte/core npm — https://www.npmjs.com/package/@kobalte/core
- Angular CDK a11y — https://material.angular.dev/cdk/a11y/overview

### Primary — Focus Utilities
- focus-trap/focus-trap GitHub — https://github.com/focus-trap/focus-trap
- focus-trap/tabbable GitHub — https://github.com/focus-trap/tabbable
- theKashey/react-focus-lock GitHub — https://github.com/theKashey/react-focus-lock

### Primary — Table / Virtual
- TanStack Table — https://tanstack.com/table/latest/docs/introduction
- TanStack Virtual — https://tanstack.com/virtual/latest

### Secondary
- axe-core GitHub — https://github.com/dequelabs/axe-core
- aria-modal MDN — https://developer.mozilla.org/en-US/docs/Web/Accessibility/ARIA/Reference/Attributes/aria-modal
- Headless Component Pattern — Martin Fowler — https://martinfowler.com/articles/headless-component.html
- aria-activedescendant is not focus — Sarah Higley — https://sarahmhigley.com/writing/activedescendant/
- Tooltips in WCAG 2.1 — Sarah Higley — https://sarahmhigley.com/writing/tooltips-in-wcag-21/
- eBay MIND Patterns — https://ebay.gitbook.io/mindpatterns
- WAI-ARIA 1.3 Features — Orange Digital — https://a11y-guidelines.orange.com/en/articles/aria-1-3-new-accessibility-features/
- WAI-ARIA 1.3 Draft Review — Craig Abbott — https://www.craigabbott.co.uk/blog/a-look-at-the-new-wai-aria-1-3-draft/
- inert Attribute — https://mspk.substack.com/p/the-inert-attribute-stop-writing
- Spectrum Web Components — https://opensource.adobe.com/spectrum-web-components/
- Spectrum Roving Tab Index — https://opensource.adobe.com/spectrum-web-components/tools/roving-tab-index/
- Headless UI Alternatives — LogRocket — https://blog.logrocket.com/headless-ui-alternatives/
- Radix vs shadcn/ui — WorkOS — https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui
- Anatomy of a Primitive — Vercel Academy — https://vercel.com/academy/shadcn-ui/anatomy-of-a-primitive
- React UI Libraries 2025 — Makers Den — https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra
- Migrating Radix → React Aria — Argos CI — https://github.com/argos-ci/argos-ci.com/blob/main/app/blog/react-aria-migration.mdx
- Base UI 1.0 — InfoQ — https://www.infoq.com/news/2026/02/baseui-v1-accessible/
- Implement asChild Pattern — Jacob Paris — https://www.jacobparis.com/content/react-as-child
- React Slot/asChild — https://boda.sh/blog/react-slot-aschild-pattern/
- Roving Focus — Accessibility Solutions — https://a11y-solutions.stevenwoodson.com/solutions/focus/roving-focus/
- Keyboard Navigation Complex Widgets — UXPin — https://uxpin.com/studio/blog/keyboard-navigation-patterns-complex-widgets/
- Accessible Modals Guide — A11y Collective — https://www.a11y-collective.com/blog/modal-accessibility/
- Building with Downshift — LogRocket — https://blog.logrocket.com/building-accessible-components-with-downshift/
- Radix vs React Aria — Fellipe Utaka — https://www.fellipeutaka.com/blog/radix-ui-vs-react-aria-components
- Radix vs React Aria — DhiWise — https://www.dhiwise.com/post/react-aria-vs-radix-ui-what-best-ui-toolkit
- DeepWiki chakra-ui/ark — https://deepwiki.com/chakra-ui/ark
- DeepWiki radix-ui/primitives — https://deepwiki.com/radix-ui/primitives/2.2-component-composition-pattern
- DeepWiki w3c/aria-practices — https://deepwiki.com/w3c/aria-practices/4-aria-examples-and-patterns
- react-roving-tabindex GitHub — https://github.com/stevejay/react-roving-tabindex
- React Roving Tabindex — Joshua Woodward — https://www.josephwoodson.com/react-roving-tabindex
- cmdk Command Menu — https://cmdk.paco.me/
- vaul Drawer — https://github.com/emilkowalski/vaul
- Sonner Toast — https://www.npmjs.com/package/sonner
- React DayPicker — https://github.com/gpbl/react-day-picker
- DayPicker Accessibility — https://daypicker.dev/guides/accessibility
- Embla Carousel Accessibility — https://www.embla-carousel.com/docs/plugins/accessibility
- Reakit (archived) — https://reakit.io/
- Reach UI — https://reach.tech/
- focus-trap npm — https://www.npmjs.com/package/focus-trap
- react-focus-lock npm — https://www.npmjs.com/package/react-focus-lock
- Awesome React Headless — https://github.com/jxom/awesome-react-headless-components
- accessible-ui/popover — https://github.com/accessible-ui/popover
- ally.js (legacy) — https://allyjs.io/index.html

---

*See also: [BASELINE-L1.md](BASELINE-L1.md) (Tokens), [BASELINE-L3.md](BASELINE-L3.md) (Components), [BASELINE-L6.md](BASELINE-L6.md) (Accessibility), [BASELINE-L7.md](BASELINE-L7.md) (Motion)*
