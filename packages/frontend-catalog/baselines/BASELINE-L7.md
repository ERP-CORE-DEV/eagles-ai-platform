# BASELINE-L7 — Motion
> Layer 7 of 8 | frontend-catalog design-system pipeline

---

## Scope

This document covers **motion tokens, animation primitives, choreography patterns, performance constraints, and accessibility requirements** for a React TypeScript design system. It answers: how to define animation as data (tokens), which libraries to use and why, how to keep animations off the main thread, and how to ensure all motion respects the user's OS-level reduced-motion preference.

Sources: 117 records from Material Design 3, IBM Carbon, Shopify Polaris, Adobe Spectrum, Microsoft Fluent 2, Motion (formerly Framer Motion), GSAP, View Transitions API (Chrome/MDN/React), DTCG spec, WCAG 2.3.3, Sara Soueidan, Josh Comeau, Paul Lewis (FLIP).

---

## Level 1 — TL;DR

Define duration and easing as tokens. Animate only `transform` and `opacity` for compositor-thread performance. Wrap all animations inside `@media (prefers-reduced-motion: no-preference)` using a no-motion-first approach. For React, use Motion (Framer Motion) for gesture-heavy interactions and layout animations; use CSS transitions + View Transitions API for navigation and simple state changes.

---

## Level 2 — Plain English

Animation is communication. A modal that fades in tells the user "something new arrived." A list item that slides up tells them "you just removed that." The problem is that animation is also expensive: a 100ms transition that runs on the wrong property can drop frames and make the app feel laggy. And for ~15% of users with vestibular disorders, motion causes physical disorientation. The solution is a motion system that defines animations as reusable tokens, always runs them on the GPU-composited thread, and automatically turns them off when the operating system says so.

---

## Level 3 — Technical Overview

The motion layer has four concerns:

1. **Motion tokens** — duration and easing values defined in the DTCG format alongside color and spacing tokens; consumed via CSS custom properties; never hardcoded raw `ms` values in component CSS.
2. **Animation techniques** — CSS transitions (simplest), CSS keyframes, WAAPI (`element.animate()`), Motion/Framer Motion (React-integrated), View Transitions API (navigation).
3. **Performance** — only `transform` and `opacity` run on the compositor thread without triggering layout or paint; everything else causes reflow.
4. **Reduced motion** — no-motion-first: animations are off by default, enabled inside `@media (prefers-reduced-motion: no-preference)`.

---

## Level 4 — Core Patterns

---

### Pattern 1: Motion Token System

**Sources**: DTCG 2025.10 spec, Material Design 3 motion tokens, Shopify Polaris motion tokens, Smashing Magazine "Including Animation in Your Design System", Medium "Motion Design Tokens", Designtokens Substack "Motion Tokens Naming"

The DTCG spec (2025.10 stable) formally defines `duration` and `cubicBezier` as token types. Motion tokens follow the same three-tier structure as color tokens: option (primitive) → decision (semantic) → component.

**DTCG token definition**

```json
{
  "motion": {
    "duration": {
      "instant": { "$type": "duration", "$value": "100ms" },
      "fast":    { "$type": "duration", "$value": "160ms" },
      "base":    { "$type": "duration", "$value": "240ms" },
      "slow":    { "$type": "duration", "$value": "360ms" },
      "deliberate": { "$type": "duration", "$value": "500ms" }
    },
    "easing": {
      "standard":   { "$type": "cubicBezier", "$value": [0.4, 0.0, 0.2, 1.0],
                      "$description": "General purpose. Ease in-out asymmetric. IBM/Carbon standard." },
      "enter":      { "$type": "cubicBezier", "$value": [0.0, 0.0, 0.2, 1.0],
                      "$description": "Ease-out. Elements entering the screen decelerate into place." },
      "exit":       { "$type": "cubicBezier", "$value": [0.4, 0.0, 1.0, 1.0],
                      "$description": "Ease-in. Elements leaving accelerate off the screen." },
      "emphasized": { "$type": "cubicBezier", "$value": [0.2, 0.0, 0.0, 1.0],
                      "$description": "Material Design 3 emphasized. For expressive/hero moments." }
    }
  },
  "motion-semantic": {
    "dialog-enter":  { "$value": "{motion.duration.base}", "$type": "duration" },
    "dialog-exit":   { "$value": "{motion.duration.fast}", "$type": "duration" },
    "tooltip-enter": { "$value": "{motion.duration.instant}", "$type": "duration" },
    "page-transition":{ "$value": "{motion.duration.slow}", "$type": "duration" }
  }
}
```

**CSS custom properties output** (Style Dictionary v4 transform)

```css
:root {
  /* Duration primitives */
  --motion-duration-instant:   100ms;
  --motion-duration-fast:      160ms;
  --motion-duration-base:      240ms;
  --motion-duration-slow:      360ms;
  --motion-duration-deliberate: 500ms;

  /* Easing primitives */
  --motion-easing-standard:   cubic-bezier(0.4, 0, 0.2, 1);
  --motion-easing-enter:      cubic-bezier(0, 0, 0.2, 1);
  --motion-easing-exit:       cubic-bezier(0.4, 0, 1, 1);
  --motion-easing-emphasized: cubic-bezier(0.2, 0, 0, 1);

  /* Semantic tokens */
  --motion-dialog-enter:      var(--motion-duration-base);
  --motion-dialog-exit:       var(--motion-duration-fast);
  --motion-tooltip-enter:     var(--motion-duration-instant);
  --motion-page-transition:   var(--motion-duration-slow);

  /* Duration scalar for global speed control (1 = normal, 0 = instant) */
  --motion-duration-scalar: 1;
}

/* Apply scalar to all durations */
*, *::before, *::after {
  transition-duration: calc(var(--transition-duration, 0ms) * var(--motion-duration-scalar));
  animation-duration: calc(var(--animation-duration, 0ms) * var(--motion-duration-scalar));
}
```

**Shopify Polaris enforcement pattern**: stylelint rules block raw `ms` values in `transition` and `animation` CSS properties — all motion must reference tokens.

**Distance-based duration selection** (Sprout Social Seeds): elements traveling ≤25% of the viewport width use `--motion-duration-fast`; 26–50% use `--motion-duration-base`; 51–100% use `--motion-duration-slow`.

---

### Pattern 2: No-Motion-First Reduced Motion

**Sources**: Tatiana Mac "No-Motion-First Approach", MDN prefers-reduced-motion, WCAG 2.3.3, web.dev motion accessibility, Norton Design System `duration-scalar` pattern

The no-motion-first approach is more inclusive than adding a `reduce` override after the fact.

```css
/* DEFAULT: no animation — safe for all users including those with vestibular disorders */

.animated-card {
  /* No transition defined at base level */
}

/* PROGRESSIVE ENHANCEMENT: add animation only when user has no preference */
@media (prefers-reduced-motion: no-preference) {
  .animated-card {
    transition: transform var(--motion-duration-base) var(--motion-easing-standard),
                opacity   var(--motion-duration-fast)  var(--motion-easing-enter);
  }
}

/* Global scalar approach (Norton Design System pattern) */
@media (prefers-reduced-motion: reduce) {
  :root {
    --motion-duration-scalar: 0; /* All calc()-based durations become 0 */
  }
}
```

**React runtime detection** (for JS-driven animations)

```tsx
// hooks/useReducedMotion.ts
import { useState, useEffect } from "react";

export function useReducedMotion(): boolean {
  const [reducedMotion, setReducedMotion] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  return reducedMotion;
}
```

**Usage in Motion (Framer Motion)**

```tsx
// AnimatedList.tsx
import { motion, AnimatePresence } from "motion/react";
import { useReducedMotion } from "@/hooks/useReducedMotion";

export function AnimatedList({ items }: { items: string[] }) {
  const reduced = useReducedMotion();

  return (
    <AnimatePresence>
      {items.map((item) => (
        <motion.li
          key={item}
          initial={reduced ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduced ? {} : { opacity: 0, y: -8 }}
          transition={{
            duration: reduced ? 0 : 0.16, // --motion-duration-fast
            ease: [0, 0, 0.2, 1],         // --motion-easing-enter
          }}
        >
          {item}
        </motion.li>
      ))}
    </AnimatePresence>
  );
}
```

**Accessibility rules for motion**
- Animations lasting >5 seconds must have a pause/stop control (WCAG 2.2.2)
- No content flashing >3 times per second (WCAG 2.3.1 — seizure threshold)
- Safe alternatives to translate/scale/rotate: fade/dissolve/color-change
- WCAG 2.3.3 (AAA): scroll-triggered parallax and page transition animations must be disableable via `prefers-reduced-motion`

---

### Pattern 3: Performance — Compositor-Only Animation

**Sources**: RAIL model (web.dev), Motion performance guide, Paul Lewis FLIP, Algolia 60fps guide, Chrome hardware acceleration

**Performance tier list** (from Motion Magazine):

| Tier | Properties | Thread | Paint required |
|---|---|---|---|
| S — best | `transform`, `opacity` | Compositor (GPU) | No |
| A | `background-color`, `border-radius`, `box-shadow` | Main thread | Paint only |
| B | `width`, `height`, `padding`, `margin` | Main thread | Layout + paint |
| C — avoid | `top`, `left`, `right`, `bottom` (non-`position: fixed`) | Main thread | Layout + paint |

**Frame budget at 60fps**: 16.7ms total. Browser needs ~6ms to render → ~10ms left for JS work. At 120fps, 8.3ms total → ~2ms for JS.

```css
/* Always animate via transform, not top/left */
.card-hover {
  transition: transform var(--motion-duration-fast) var(--motion-easing-standard);
}
.card-hover:hover {
  /* CORRECT: compositor-only */
  transform: translateY(-2px);
}

/* NOT: */
/* top: -2px; — causes layout reflow */
```

**`will-change` guidance** — use sparingly; promotes element to its own GPU layer (memory cost):

```css
/* Only set will-change when animation is imminent */
.modal {
  /* Don't set will-change: transform on page load */
}
.modal.is-animating {
  will-change: transform, opacity;
}
/* Remove after animation completes */
.modal.animation-done {
  will-change: auto;
}
```

**FLIP technique** (First-Last-Invert-Play) — for layout-changing animations that cannot avoid layout properties:

```ts
// flip.ts — manual FLIP for cases where Motion layout prop isn't available
export function animateFlip(element: HTMLElement, callback: () => void) {
  // FIRST: capture initial state
  const first = element.getBoundingClientRect();

  // Execute DOM change
  callback();

  // LAST: capture final state
  const last = element.getBoundingClientRect();

  // INVERT: calculate transform to appear at starting position
  const deltaX = first.left - last.left;
  const deltaY = first.top  - last.top;
  const scaleX = first.width  / last.width;
  const scaleY = first.height / last.height;

  // PLAY: animate from inverted position to identity
  element.animate(
    [
      { transform: `translate(${deltaX}px, ${deltaY}px) scale(${scaleX}, ${scaleY})` },
      { transform: "none" },
    ],
    {
      duration: 240,
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      fill: "both",
    }
  );
}
```

Motion (Framer Motion) and AutoAnimate (`auto-animate`) both implement FLIP automatically via the `layout` prop and `useAutoAnimate` hook respectively.

---

### Pattern 4: React Motion with Motion (Framer Motion)

**Sources**: Motion docs (React Transitions, AnimatePresence, Layout Animations, stagger, Variants), Motion changelog v12, React Spring comparison

Motion was rebranded from Framer Motion in 2025 and is now imported from `motion/react`. It uses a hybrid engine: WAAPI for compositable properties, rAF for complex values.

**Bundle sizes**: `motion/react` full ~17KB; `motion` (vanilla) ~4KB.

**Declarative component animations**

```tsx
// motion/react is the new import path (2025)
import { motion, AnimatePresence } from "motion/react";

// Simple entrance/exit
export function Toast({ message, visible }: { message: string; visible: boolean }) {
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="toast"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{
            duration: 0.16,                // --motion-duration-fast
            ease: [0, 0, 0.2, 1],          // --motion-easing-enter
          }}
          style={{
            position: "fixed",
            bottom: "var(--spacing-6)",
            right: "var(--spacing-6)",
            backgroundColor: "var(--color-surface-inverse)",
            color: "var(--color-text-inverse)",
            padding: "var(--spacing-3) var(--spacing-4)",
            borderRadius: "var(--radius-base)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          {message}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

**Variants for staggered lists**

```tsx
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,    // 50ms stagger between items
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.16, ease: [0, 0, 0.2, 1] },
  },
};

export function AnimatedList({ items }: { items: string[] }) {
  return (
    <motion.ul
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{ listStyle: "none", padding: 0, margin: 0 }}
    >
      {items.map((item) => (
        <motion.li key={item} variants={itemVariants}>
          {item}
        </motion.li>
      ))}
    </motion.ul>
  );
}
```

**Layout animations** (FLIP via `layout` prop)

```tsx
// Animates size/position change without breaking out of the normal document flow
export function ExpandableCard({ expanded, title, children }: ExpandableCardProps) {
  return (
    <motion.div
      layout                          // enables FLIP layout animation
      style={{
        overflow: "hidden",
        borderRadius: "var(--radius-base)",
        border: "1px solid var(--color-border-default)",
      }}
    >
      <motion.div layout="position">  {/* only animates position, not size */}
        <h3>{title}</h3>
      </motion.div>
      <AnimatePresence>
        {expanded && (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
```

**Spring physics**

```tsx
// Spring is the default transition type — no fixed duration, settles naturally
const springTransition = {
  type: "spring",
  stiffness: 200,   // higher = snappier
  damping: 20,      // higher = less oscillation
  mass: 1,          // higher = more inertia
};

// Simpler duration+bounce API (matches Figma/Apple spring UX)
const simpleSpring = {
  type: "spring",
  duration: 0.4,    // perceptual duration in seconds
  bounce: 0.2,      // 0 = critically damped; 0.5 = bouncy; 1 = very bouncy
};
```

---

### Pattern 5: View Transitions API

**Sources**: MDN View Transition API, Chrome View Transitions 2025, React Labs ViewTransition, Next.js View Transitions guide, React Router viewTransition, patterns.dev

Browser support (same-document, SPA mode): Chrome 111+, Edge 111+, Firefox 133+, Safari 18+. Universally available from late 2025 (Firefox 144 Baseline November 2025).

**Basic same-document transition**

```ts
// navigation.ts — wrap DOM update in startViewTransition
function navigateTo(url: string) {
  if (!document.startViewTransition) {
    // Fallback for unsupported browsers
    history.pushState({}, "", url);
    renderPage(url);
    return;
  }

  document.startViewTransition(() => {
    history.pushState({}, "", url);
    renderPage(url);
  });
}
```

**CSS custom transition animation**

```css
/* Default cross-fade is built-in */
/* Override for custom slide transition */
::view-transition-old(root) {
  animation: slide-out var(--motion-duration-base) var(--motion-easing-exit) forwards;
}

::view-transition-new(root) {
  animation: slide-in var(--motion-duration-base) var(--motion-easing-enter) forwards;
}

@keyframes slide-out {
  from { transform: translateX(0); }
  to   { transform: translateX(-30px); opacity: 0; }
}

@keyframes slide-in {
  from { transform: translateX(30px); opacity: 0; }
  to   { transform: translateX(0); }
}

/* Always respect reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-old(root),
  ::view-transition-new(root) {
    animation: none;
  }
}
```

**Shared element transitions** (named `view-transition-name`)

```css
/* Source element (list page) */
.card[data-id="42"] {
  view-transition-name: card-42;
}

/* Target element (detail page) */
.detail-header[data-id="42"] {
  view-transition-name: card-42;
}

/* The browser automatically animates between matching view-transition-name elements */
```

**React Router integration**

```tsx
import { Link, useNavigate } from "react-router-dom";

// Declarative
<Link to="/detail/42" viewTransition>View details</Link>

// Imperative
const navigate = useNavigate();
navigate("/detail/42", { viewTransition: true });
```

**Next.js App Router** — use `template.tsx` (not `layout.tsx`) for transitions between routes, since `template.tsx` is re-mounted on each navigation, enabling exit animations.

---

### Pattern 6: Skeleton Loading

**Sources**: NNGroup Skeleton Screens, LogRocket Skeleton Design, ProtoPie Skeleton Animation

Skeleton screens are perceived as faster than spinners for loads lasting >1 second. They must mirror the exact layout of the real content to prevent layout shift when content arrives.

```tsx
// Skeleton.tsx — reusable skeleton shape
interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
}

export function Skeleton({ width = "100%", height = "1em", borderRadius = "var(--radius-base)", className }: SkeletonProps) {
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={className}
      style={{
        display: "inline-block",
        width,
        height,
        borderRadius,
        backgroundColor: "var(--color-surface-subtle)",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: "linear-gradient(90deg, transparent 0%, var(--color-surface-overlay) 50%, transparent 100%)",
          backgroundSize: "200% 100%",
          // Shimmer animation: no-motion-first — only enabled with no preference
          animation: "none",
        }}
        className="skeleton-shimmer"
      />
    </span>
  );
}
```

```css
/* globals.css */
@media (prefers-reduced-motion: no-preference) {
  .skeleton-shimmer {
    animation: shimmer 1.5s ease-in-out infinite;
    background-size: 200% 100%;
    background-position: -100% 0;
  }
}

@keyframes shimmer {
  from { background-position: -100% 0; }
  to   { background-position: 200% 0; }
}
```

```tsx
// CardSkeleton.tsx — mirrors CardDetail layout
export function CardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading content"
      aria-live="polite"
      aria-busy="true"
      style={{ padding: "var(--spacing-4)", display: "flex", flexDirection: "column", gap: "var(--spacing-3)" }}
    >
      <Skeleton height={20} width="60%" />   {/* title */}
      <Skeleton height={14} width="100%" />  {/* line 1 */}
      <Skeleton height={14} width="80%" />   {/* line 2 */}
      <Skeleton height={14} width="90%" />   {/* line 3 */}
    </div>
  );
}
```

When the real content loads, set `aria-busy="false"` on the container and announce via a polite live region: "Content loaded."

---

### Supplementary: Micro-interactions Reference

Standard micro-interaction timings across elite design systems:

| Interaction | Duration | Notes |
|---|---|---|
| Button hover | 100–160ms | fast token; enter easing |
| Button press | 80–100ms | instant token; scale(0.96) |
| Toggle switch | 160–200ms | spring; ease-in-out |
| Toast appear | 160ms enter / 120ms exit | enter ease-out / exit ease-in |
| Modal appear | 200–240ms enter | emphasized easing; fade + scale-up from 0.95 |
| Modal exit | 150ms | faster than enter; ease-in |
| Tooltip appear | 100ms delay + 100ms fade | instant token |
| Skeleton shimmer | 1400–1600ms loop | shimmer left-to-right |
| List item stagger | 40–60ms between items | cascades max ~300ms total |
| Page transition | 300–360ms | slow token |

---

## Adoption Checklist

- [ ] Add `duration` and `cubicBezier` tokens to the DTCG token file alongside color and spacing; generate CSS custom properties via Style Dictionary v4
- [ ] Implement no-motion-first CSS: all transitions and keyframes live inside `@media (prefers-reduced-motion: no-preference)` blocks; base layer has no animation
- [ ] Create `useReducedMotion` hook; gate all JS-driven animations (Motion, GSAP) on its return value
- [ ] Add stylelint rule or ESLint rule to block raw `ms` values in CSS `transition` and `animation` properties — enforce token usage
- [ ] Audit all existing transitions: replace `top`/`left`/`width`/`height` animations with `transform` equivalents for compositor performance
- [ ] Implement `AnimatePresence` with exit animations for modals, toasts, and drawers — React unmounts components instantly without it
- [ ] Add skeleton loading to all data-fetching views that can take >1s; mirror the real layout; include `aria-live="polite"` and `aria-busy="true"` on the container
- [ ] Implement `document.startViewTransition` (with fallback) for primary navigation events; use `view-transition-name` for shared element transitions between list and detail views
- [ ] Set `--motion-duration-scalar: 0` under `@media (prefers-reduced-motion: reduce)` so all `calc()`-based duration values become zero without modifying individual components

---

## Anti-patterns

| Anti-pattern | Why it fails | Correct approach |
|---|---|---|
| Animating `width`, `height`, `top`, `left` | Triggers layout reflow + paint on every frame → jank | Animate `transform: translate/scale` and `opacity` only |
| Hardcoding `transition: 200ms ease` in component CSS | Motion values scattered, inconsistent, can't be globally adjusted | `transition: var(--motion-duration-fast) var(--motion-easing-standard)` |
| Adding `@media (prefers-reduced-motion: reduce)` as override | Treats reduced-motion as edge case; animations still flash before override | No-motion-first: define animations only inside `no-preference` media query |
| `will-change: transform` on all animated elements at page load | Promotes all elements to GPU layers → GPU memory exhaustion on mobile | Set `will-change` only immediately before animation; remove afterward |
| Using `AnimatePresence` without unique `key` on children | Motion cannot track which element is exiting → no exit animation | Always set `key` matching the data item id on direct children of AnimatePresence |
| Skeleton that does not match content layout | Layout shift when content loads looks broken | Skeleton must mirror title/line/image dimensions of real content exactly |

---

## Sources

| Title | URL | Year | Authority |
|---|---|---|---|
| Motion (Framer Motion) | https://motion.dev | 2025 | elite |
| Motion — AnimatePresence | https://motion.dev/docs/react-animate-presence | 2025 | elite |
| Motion — Layout Animations | https://motion.dev/docs/react-layout-animations | 2025 | elite |
| Motion — Variants Tutorial | https://motion.dev/tutorials/react-variants | 2025 | elite |
| Motion — Performance Guide | https://motion.dev/docs/performance | 2025 | elite |
| Motion — Stagger | https://motion.dev/docs/stagger | 2025 | elite |
| MDN — View Transition API | https://developer.mozilla.org/en-US/docs/Web/API/View_Transition_API | 2025 | elite |
| MDN — prefers-reduced-motion | https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion | 2025 | elite |
| MDN — Web Animations API | https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API | 2025 | elite |
| MDN — CSS Scroll-Driven Animations | https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Scroll-driven_animations | 2025 | elite |
| Chrome — View Transitions 2025 | https://developer.chrome.com/blog/view-transitions-in-2025 | 2025 | elite |
| Chrome — Hardware-Accelerated Animations | https://developer.chrome.com/blog/hardware-accelerated-animations | 2025 | elite |
| Chrome — linear() easing | https://developer.chrome.com/docs/css-ui/css-linear-easing-function | 2025 | elite |
| React Labs — View Transitions | https://react.dev/blog/2025/04/23/react-labs-view-transitions-activity-and-more | 2025 | elite |
| React — ViewTransition Reference | https://react.dev/reference/react/ViewTransition | 2025 | elite |
| Next.js — View Transitions | https://nextjs.org/docs/app/guides/view-transitions | 2025 | elite |
| React Router — View Transitions | https://reactrouter.com/how-to/view-transitions | 2025 | elite |
| Material Design 3 — Easing and Duration Tokens | https://m3.material.io/styles/motion/easing-and-duration/tokens-specs | 2025 | elite |
| Material Design 3 — Expressive Motion | https://m3.material.io/blog/m3-expressive-motion-theming | 2025 | elite |
| IBM Carbon — Motion Overview | https://carbondesignsystem.com/elements/motion/overview | 2025 | elite |
| IBM Carbon — Motion Choreography | https://carbondesignsystem.com/elements/motion/choreography | 2025 | elite |
| Shopify Polaris — Motion Tokens | https://polaris-react.shopify.com/tokens/motion | 2025 | elite |
| Adobe Spectrum — Motion | https://spectrum.adobe.com/page/motion | 2025 | elite |
| Microsoft Fluent 2 — Motion | https://fluent2.microsoft.design/motion | 2025 | elite |
| DTCG 2025.10 Stable Spec | https://www.designtokens.org/tr/drafts/format | 2025 | elite |
| WCAG — SC 2.3.3 Animation from Interactions | https://www.w3.org/WAI/WCAG21/Understanding/animation-from-interactions | 2024 | elite |
| Paul Lewis — FLIP Your Animations | https://aerotwist.com/blog/flip-your-animations | 2024 | elite |
| RAIL Model — web.dev | https://web.dev/articles/rail | 2025 | elite |
| NNGroup — Skeleton Screens | https://www.nngroup.com/articles/skeleton-screens | 2024 | elite |
| Tatiana Mac — No-Motion-First | https://www.tatianamac.com/posts/prefers-reduced-motion | 2024 | high |
| Smashing Magazine — Animation in Design Systems | https://www.smashingmagazine.com/2019/02/animation-design-system | 2024 | authoritative |
| Josh Comeau — CSS Transitions | https://www.joshwcomeau.com/animation/css-transitions | 2024 | authoritative |
| Josh Comeau — Springs in Native CSS | https://www.joshwcomeau.com/animation/linear-timing-function | 2025 | authoritative |
| Figma — How We Built Spring Animations | https://www.figma.com/blog/how-we-built-spring-animations | 2024 | elite |
| Sprout Social Seeds — Motion | https://seeds.sproutsocial.com/visual/motion | 2025 | authoritative |
| GSAP — Now 100% Free | https://gsap.com | 2025 | elite |
| AutoAnimate | https://auto-animate.formkit.com | 2025 | authoritative |
| Rive | https://rive.app | 2025 | elite |
| Lottie Web — Airbnb | https://github.com/airbnb/lottie-web | 2025 | elite |
| Easing Functions Cheat Sheet | https://easings.net | 2025 | authoritative |
| Medium — Motion Tokens 3-Tier | https://medium.com/@ogonzal87/animation-motion-design-tokens-8cf67ffa36e9 | 2024 | authoritative |

---

## Level 5 — Related Documents

- [BASELINE-L1.md](./BASELINE-L1.md) — Token system (DTCG format for `duration` and `cubicBezier` token types)
- [BASELINE-L2.md](./BASELINE-L2.md) — Headless primitives (focus management transitions, Floating UI position updates)
- [BASELINE-L3.md](./BASELINE-L3.md) — Component catalog (skeleton loading, toast notifications with AnimatePresence)
- [BASELINE-L4.md](./BASELINE-L4.md) — Patterns (dashboard widget load states, wizard step transitions)
- [BASELINE-L6.md](./BASELINE-L6.md) — Accessibility (WCAG 2.3.3, prefers-reduced-motion, aria-busy for loading states)
- [BASELINE-L8.md](./BASELINE-L8.md) — Governance (token naming conventions, stylelint rules for motion enforcement)
