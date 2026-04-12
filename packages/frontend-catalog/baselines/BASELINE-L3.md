# Layer 3 — Components: Elite Frontend Design-System Baseline

> Generic capability baseline synthesized from 161 sources across elite (Adobe, Vercel/shadcn, WorkOS/Radix, MUI, Tailwind Labs, IBM, Microsoft, Shopify, GitHub), high, and medium authority.
> Intended as a reference for the `frontend-catalog` package, not tied to any single consumer.

---

## Scope of this layer

The component layer is where styled, interactive, catalog-ready building blocks are assembled from tokens (L1) and primitives (L2). This is the layer consumers of the design system see and install. Components should have no knowledge of business domain — they are generic, composable UI elements: buttons, forms, data tables, date pickers, command palettes, drag-and-drop sortables, chart wrappers.

In the pipeline, this layer transforms the catalog from a collection of primitives into a usable product. Every component in the catalog must be: accessible by construction (from L2 primitives), styled using design tokens (from L1), documented with live Storybook stories, installable via CLI, and owned by the consuming application (copy-paste or dependency, explicitly chosen).

"Elite" at this layer means: a component ships with keyboard navigation, ARIA compliance, token-based theming, dark-mode support, TypeScript types, Storybook story, and a documented upgrade path. The ecosystem evidence in 2025 shows a strong convergence toward four distribution patterns: (1) shadcn/ui-style copy-paste with Radix + Tailwind, (2) headless + zero-style (Base UI, Radix), (3) batteries-included with design opinion (Mantine, MUI, IBM Carbon), and (4) framework-agnostic state-machine (Ark UI on Zag).

---

## Reference systems (top-tier)

- **shadcn/ui** — Copy-paste, code-ownership model. 75k+ GitHub stars, 250k+ weekly npm. Radix Primitives + Tailwind CSS v4. CLI 3.0 (Aug 2025) with namespaced registries. No breaking changes (you own the code). Acquired by Vercel. `ui.shadcn.com`
- **Radix Primitives (WorkOS)** — 28 accessible, unstyled components, foundation of shadcn/ui, HeroUI, and most modern React libraries. `radix-ui.com/primitives`
- **React Aria / React Spectrum (Adobe)** — 50+ hooks + components, strictest ARIA compliance, i18n (13 calendar systems), color picker suite (ColorArea, ColorSlider, ColorWheel). `react-spectrum.adobe.com/react-aria`
- **Mantine** — 90+ components in one ecosystem: `@mantine/core`, `@mantine/dates`, `@mantine/tiptap` (RTE), `@mantine/charts` (Recharts). MIT, TypeScript, active. `mantine.dev`
- **Material UI v6 + MUI X (MUI)** — Most used globally, 100+ components, Pigment CSS zero-runtime, MUI X for DatePickers + DataGrid + Charts + TreeView. `mui.com`
- **HeroUI (formerly NextUI)** — 75+ components on React Aria + Tailwind v4, OKLCH tokens, MCP server for AI dev, Apache 2.0. `heroui.com`
- **Ark UI / Zag (Chakra Systems)** — 45+ components across React/Vue/Svelte/Solid on XState-inspired finite state machines. Predictable behavior by construction. `ark-ui.com`
- **IBM Carbon** — Enterprise-grade, 100+ components, AI token suite, server-side DataTable, TreeView, Tearsheet, used in IBM Cloud. `carbondesignsystem.com`
- **TanStack Table v8 + TanStack Virtual** — Headless, cross-framework, 15KB, sort/filter/page/select/pin/group/virtualize. The table layer of choice for 100k-row scale. `tanstack.com/table`
- **cmdk** — 12.5k stars, headless command palette (⌘K). Used by Vercel, Linear, shadcn Command. `cmdk.paco.me`
- **@dnd-kit** — WCAG 2.1 AA drag-and-drop with keyboard alternative, 1.2M+ weekly downloads. Sortable, kanban, constrained. `dndkit.com`
- **React Hook Form** — 42.8k stars, 12KB, zero-deps, uncontrolled, Zod/Yup/Valibot schema validation. Industry standard for new projects. `react-hook-form.com`
- **Motion (formerly Framer Motion)** — 120fps via Web Animations API, OKLCH support, AnimatePresence, LayoutAnimation. `motion.dev`
- **Sonner** — 2-3KB zero-deps toast. shadcn default. Standard for React toast 2025. `github.com/emilkowalski/sonner`

---

## Core patterns

### Pattern 1: Copy-Paste Code-Ownership Distribution (shadcn model)

**Problem it solves:** npm-distributed component libraries impose version-lock, prevent customization of internal component structure, and create breaking-change upgrades that block teams. The code-ownership model gives teams full control without the brittleness.

**Canonical implementation:**
Components are installed into the consuming project's repository via a CLI. The component source lives in `components/ui/` inside the consuming project. Consumers modify, extend, or delete components freely. No `node_modules` update cycle can break internal component code. The catalog provides the initial copy; the team owns it thereafter.

Sources: shadcn/ui Philosophy, shadcn CLI 3.0, WorkOS "Radix vs shadcn/ui", Vercel acquisition rationale.

```bash
# CLI 3.0 — namespaced registry support
npx shadcn@latest add button dialog data-table

# Result: components/ui/button.tsx now in your repo
# You own it — edit freely, the CLI only runs once per component

# Custom registry pattern for the catalog itself
# .../registry.json (your org's component registry)
{
  "$schema": "https://ui.shadcn.com/schema/registry.json",
  "name": "@org/design-system",
  "homepage": "https://design.yourorg.com",
  "items": [
    {
      "name": "entity-card",
      "type": "registry:component",
      "files": ["components/ui/entity-card.tsx"],
      "dependencies": ["@radix-ui/react-card"],
      "registryDependencies": ["card", "badge"]
    }
  ]
}
```

---

### Pattern 2: Storybook as Living Component Catalog

**Problem it solves:** Component documentation written in Markdown becomes stale. Living component documentation driven directly from component source keeps stories and implementation in sync, and provides an interactive reference for all catalog consumers.

**Canonical implementation:**
Every component in the catalog has a `.stories.tsx` file. Controls addon exposes all props for live editing. The `@storybook/addon-a11y` addon runs `axe-core` on every story automatically. Chromatic provides visual regression CI for catching unintended visual changes. The Storybook MCP server (2025) exposes story metadata to AI agents, preventing hallucinated component usage.

Sources: Storybook home, Storybook MCP for React, Chromatic visual regression, Storybook Design Token addon.

```tsx
// components/ui/status-badge.stories.tsx
import type { Meta, StoryObj } from '@storybook/react';
import { StatusBadge } from './status-badge';

const meta: Meta<typeof StatusBadge> = {
  title: 'UI/StatusBadge',
  component: StatusBadge,
  // Controls auto-generated from TypeScript types
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'success', 'warning', 'destructive', 'outline'],
      description: 'Visual variant — maps to semantic color tokens',
    },
  },
  parameters: {
    // a11y addon: axe-core runs automatically on every render
    a11y: { config: { rules: [{ id: 'color-contrast', enabled: true }] } },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Default: Story = { args: { variant: 'default', children: 'Active' } };
export const Success: Story = { args: { variant: 'success', children: 'Approved' } };
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: '8px' }}>
      {(['default', 'success', 'warning', 'destructive'] as const).map(v => (
        <StatusBadge key={v} variant={v}>{v}</StatusBadge>
      ))}
    </div>
  ),
};
```

---

### Pattern 3: Headless Data Table with Server-Side Capabilities

**Problem it solves:** Display of large entity collections (any domain with list views) requires sorting, filtering, pagination, row selection, column visibility, and virtualization — but no single styled table component handles all of these without lock-in.

**Canonical implementation:**
TanStack Table v8 for all table logic (headless). shadcn/ui `<Table>` for HTML structure. `useVirtualizer` from `@tanstack/react-virtual` for 100k+ row scenarios. URL-driven state (via `nuqs`) for shareable filtered/sorted states.

Sources: shadcn/ui Official Data Table Guide, OpenStatus Data Table, tablecn, TanStack Table virtualized rows, TanStack Table infinite scroll.

```tsx
import {
  useReactTable, getCoreRowModel, getSortedRowModel,
  getFilteredRowModel, getPaginationRowModel,
  flexRender, type ColumnDef, type SortingState,
} from '@tanstack/react-table';
import { useState } from 'react';

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

function DataTable<TData, TValue>({ columns, data }: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [globalFilter, setGlobalFilter] = useState('');

  const table = useReactTable({
    data,
    columns,
    state: { sorting, globalFilter },
    onSortingChange: setSorting,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div>
      <input
        value={globalFilter}
        onChange={e => setGlobalFilter(e.target.value)}
        placeholder="Search..."
        aria-label="Filter table"
      />
      <table role="grid" aria-rowcount={data.length}>
        <thead>
          {table.getHeaderGroups().map(headerGroup => (
            <tr key={headerGroup.id} role="row">
              {headerGroup.headers.map(header => (
                <th
                  key={header.id}
                  role="columnheader"
                  aria-sort={
                    header.column.getIsSorted() === 'asc' ? 'ascending'
                    : header.column.getIsSorted() === 'desc' ? 'descending'
                    : 'none'
                  }
                  onClick={header.column.getToggleSortingHandler()}
                  style={{ cursor: header.column.getCanSort() ? 'pointer' : 'default' }}
                >
                  {flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row, rowIndex) => (
            <tr key={row.id} role="row" aria-rowindex={rowIndex + 1}>
              {row.getVisibleCells().map(cell => (
                <td key={cell.id} role="gridcell">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

### Pattern 4: Command Palette (⌘K) for Power-User Navigation

**Problem it solves:** Large applications with many entities and actions benefit from a keyboard-driven command interface that eliminates deep menu navigation. The command palette is a standard power-user affordance in elite SaaS products.

**Canonical implementation:**
`cmdk` provides the headless filtering + navigation layer. Wraps in a Radix/shadcn `Dialog` for the modal overlay. `react-hotkeys-hook` binds the trigger shortcut. The command list is structured with groups and items matching the WAI-ARIA combobox pattern.

Sources: cmdk home and GitHub, shadcn Command component, react-hotkeys-hook, better-cmdk.

```tsx
import { Command } from 'cmdk';
import * as Dialog from '@radix-ui/react-dialog';
import { useHotkeys } from 'react-hotkeys-hook';
import { useState } from 'react';

interface CommandItem {
  id: string;
  label: string;
  onSelect: () => void;
}

interface CommandPaletteProps {
  groups: Array<{ heading: string; items: CommandItem[] }>;
}

function CommandPalette({ groups }: CommandPaletteProps) {
  const [open, setOpen] = useState(false);

  // Mod = Ctrl on Windows, Cmd on macOS
  useHotkeys('mod+k', () => setOpen(prev => !prev), { preventDefault: true });
  useHotkeys('Escape', () => setOpen(false));

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)' }} />
        <Dialog.Content
          aria-label="Command palette"
          style={{ position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)', width: 640 }}
        >
          {/* Command uses role=combobox + role=listbox internally */}
          <Command>
            <Command.Input placeholder="Type a command or search…" />
            <Command.List>
              <Command.Empty>No results found.</Command.Empty>
              {groups.map(group => (
                <Command.Group key={group.heading} heading={group.heading}>
                  {group.items.map(item => (
                    <Command.Item
                      key={item.id}
                      onSelect={() => { item.onSelect(); setOpen(false); }}
                    >
                      {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              ))}
            </Command.List>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
```

---

### Pattern 5: Form with Schema Validation

**Problem it solves:** Forms are the primary data entry surface of any application. Validation logic repeated in event handlers is fragile; schema-first validation enforces invariants at declaration rather than imperative branches.

**Canonical implementation:**
React Hook Form (RHF) with `zodResolver` for schema validation. Uncontrolled inputs via `register()` for performance (no re-render on every keystroke). `<Controller>` for custom components (comboboxes, date pickers, sliders). `useFormContext()` for nested form sections. React 19 `useActionState` + server actions for simple cases.

Sources: React Hook Form docs, React Hook Form vs Formik comparison, React 19 form handling.

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  salary: z.number({ invalid_type_error: 'Must be a number' }).positive().optional(),
  startDate: z.date({ required_error: 'Start date is required' }),
});

type FormValues = z.infer<typeof schema>;

function EntityForm({ onSubmit }: { onSubmit: (data: FormValues) => Promise<void> }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div>
        <label htmlFor="title">Title *</label>
        <input
          id="title"
          {...register('title')}
          aria-invalid={errors.title ? 'true' : undefined}
          aria-describedby={errors.title ? 'title-error' : undefined}
        />
        {errors.title && (
          <span id="title-error" role="alert">{errors.title.message}</span>
        )}
      </div>

      {/* Date picker via Controller (external component) */}
      {/* <Controller control={control} name="startDate" render={({ field }) => (
        <DatePicker value={field.value} onChange={field.onChange} />
      )} /> */}

      <button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
        {isSubmitting ? 'Saving…' : 'Save'}
      </button>
    </form>
  );
}
```

---

### Pattern 6: Accessible Drag-and-Drop Sorting

**Problem it solves:** Sortable lists (kanban columns, ranked items, reorderable rows) are pointer-only by default. WCAG 2.2 SC 2.5.7 requires a keyboard and AT alternative for all drag operations.

**Canonical implementation:**
`@dnd-kit` provides the sensor system (mouse, touch, keyboard), sorting primitives (`@dnd-kit/sortable`), and ARIA announcements for screen readers. Keyboard drag: Space to grab, Arrow keys to move, Space to drop, Escape to cancel. Screen reader live region announces item order changes.

Sources: @dnd-kit docs, Top 5 Drag-and-Drop Libraries 2025, npm comparison data, Atlassian pragmatic-drag-and-drop alternative.

```tsx
import {
  DndContext, closestCenter,
  KeyboardSensor, PointerSensor, useSensor, useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext, sortableKeyboardCoordinates,
  verticalListSortingStrategy, useSortable, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

function SortableItem({ id, label }: { id: string; label: string }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });

  return (
    <li
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 }}
      {...attributes}  // aria-roledescription, aria-describedby for AT
      {...listeners}   // keyboard and pointer event handlers
    >
      {label}
    </li>
  );
}

function SortableList({ initialItems }: { initialItems: Array<{ id: string; label: string }> }) {
  const [items, setItems] = useState(initialItems);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function handleDragEnd({ active, over }: DragEndEvent) {
    if (!over || active.id === over.id) return;
    const oldIndex = items.findIndex(i => i.id === active.id);
    const newIndex = items.findIndex(i => i.id === over.id);
    setItems(prev => arrayMove(prev, oldIndex, newIndex));
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map(i => i.id)} strategy={verticalListSortingStrategy}>
        <ul role="listbox" aria-label="Sortable items">
          {items.map(item => <SortableItem key={item.id} {...item} />)}
        </ul>
      </SortableContext>
    </DndContext>
  );
}
```

---

### Pattern 7: Token-Driven Component Theming with CSS Custom Properties

**Problem it solves:** Components with hard-coded colors can't be rebrand-ed, can't switch modes, and can't be white-labeled. Token-driven CSS custom properties enable all three without touching component markup.

**Canonical implementation:**
Components consume only semantic-tier token CSS variables. The Tailwind v4 `@theme` directive defines tokens that generate both utilities AND raw CSS variables. Each component uses Tailwind semantic utilities (`bg-action-primary`) or direct CSS variable references.

Sources: CSS Variables and Design Tokens Guide 2025, Tailwind v4 @theme, shadcn/ui Theming, HeroUI OKLCH tokens.

```css
/* tokens/semantic.css — generated from Style Dictionary */
:root {
  --color-action-primary:         oklch(55% 0.18 250);
  --color-action-primary-hover:   oklch(48% 0.20 250);
  --color-action-primary-text:    oklch(98% 0.01 250);
  --color-surface-default:        oklch(98% 0.01 250);
  --color-text-default:           oklch(15% 0.03 250);
  --radius-md:                    0.375rem;
  --shadow-sm:                    0 1px 2px oklch(0% 0 0 / 0.05);
}

[data-theme="dark"] {
  --color-action-primary:         oklch(65% 0.16 250);
  --color-surface-default:        oklch(14% 0.02 250);
  --color-text-default:           oklch(92% 0.02 250);
}
```

```tsx
// Button component — only semantic tokens, no hardcoded values
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
}

function Button({ variant = 'primary', className, ...props }: ButtonProps) {
  // Tailwind classes reference @theme tokens — or use direct CSS vars
  const variantClasses = {
    primary:   'bg-[var(--color-action-primary)] text-[var(--color-action-primary-text)] hover:bg-[var(--color-action-primary-hover)]',
    secondary: 'bg-[var(--color-surface-subtle)] text-[var(--color-text-default)]',
    ghost:     'bg-transparent text-[var(--color-text-default)] hover:bg-[var(--color-surface-hover)]',
  };

  return (
    <button
      className={`inline-flex items-center justify-center rounded-[var(--radius-md)] px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-action-primary)] ${variantClasses[variant]} ${className ?? ''}`}
      {...props}
    />
  );
}
```

---

### Pattern 8: Rich Text / Document Editor

**Problem it solves:** Applications with free-text content areas (job descriptions, candidate notes, announcements) need formatted input that goes beyond `<textarea>` but should not require a full-featured heavyweight editor.

**Canonical implementation:**
TipTap (ProseMirror-based) with custom extensions. Headless by default — consumer controls toolbar UI. Key extensions: `@tiptap/extension-placeholder`, `@tiptap/extension-link`, `@tiptap/extension-image`, `@tiptap/extension-mention` (for @user references). Lexical (Meta) for performance-critical cases.

Sources: Liveblocks Rich Text Editor Choice 2025, Ashby Engineering "Why We Chose TipTap", TipTap vs Lexical comparison, Mantine @mantine/tiptap.

```tsx
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Link from '@tiptap/extension-link';

interface RichTextEditorProps {
  content: string;
  onChange: (html: string) => void;
  placeholder?: string;
}

function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({ placeholder: placeholder ?? 'Write something…' }),
      Link.configure({ openOnClick: false, autolink: true }),
    ],
    content,
    onUpdate: ({ editor: e }) => onChange(e.getHTML()),
  });

  return (
    <div className="prose max-w-none border rounded-[var(--radius-md)] p-3">
      {/* Toolbar */}
      <div role="toolbar" aria-label="Text formatting" className="flex gap-1 border-b pb-2 mb-2">
        <button
          type="button"
          onClick={() => editor?.chain().focus().toggleBold().run()}
          aria-pressed={editor?.isActive('bold')}
          className="px-2 py-1 rounded hover:bg-gray-100"
        >
          <strong>B</strong>
        </button>
        {/* more toolbar buttons... */}
      </div>

      {/* The editable content area */}
      <EditorContent
        editor={editor}
        role="textbox"
        aria-multiline="true"
        aria-label="Rich text editor"
      />
    </div>
  );
}
```

---

## Adoption checklist for frontend-catalog

- [ ] **Headless primitive library selected and documented** — One of Radix, React Aria, Ark UI, or Base UI is the foundation; the choice and rationale are recorded in the catalog's CONTRIBUTING guide.
- [ ] **Component distribution model decided** — Copy-paste (shadcn model) or npm package; if copy-paste, a CLI script or registry.json is provided for installation.
- [ ] **Every component has a Storybook story** — Story covers: default state, all variants, error/disabled states, keyboard navigation demo, and a `AllVariants` story for visual regression baseline.
- [ ] **axe-core runs on every story in CI** — `@storybook/addon-a11y` configured; pipeline fails on any axe violation; manual AT testing checklist exists for each component category.
- [ ] **Data table supports** — Sorting, filtering, pagination, column visibility, row selection, and keyboard navigation per APG Grid pattern; virtualization tested with 10k+ rows.
- [ ] **Form pattern standardized** — React Hook Form + zodResolver is the catalog-wide form pattern; all form components wire ARIA error associations (`aria-invalid`, `aria-describedby`).
- [ ] **Token-only styling** — No color literals, spacing literals, or font-size literals in component source; every visual value references a semantic-tier CSS variable.
- [ ] **Command palette installed** — `cmdk` + Dialog wrapper registered in catalog; keyboard shortcut documented and configurable by consumer.
- [ ] **Drag-and-drop has keyboard alternative** — Any sortable component uses `@dnd-kit` keyboard sensor; screen reader announcements configured; WCAG 2.2 SC 2.5.7 explicitly tested.
- [ ] **Rich text editor included** — TipTap with StarterKit, placeholder, and link extensions; HTML output sanitized before storage.
- [ ] **Dark mode support verified** — Every component renders correctly in both `[data-theme="light"]` and `[data-theme="dark"]`; no hardcoded background or text colors.
- [ ] **Storybook MCP server registered** — AI agents in the catalog pipeline can query existing components before generating new ones; prevents duplication.

---

## Anti-patterns

1. **Installing a full component library as a locked dependency** — Using `import { Button } from 'mantine'` or `import { Button } from '@mui/material'` in the design system catalog ties the catalog to the library's release schedule, breaking changes, and theming constraints. If the library's component needs internal modification, you're blocked. Prefer headless primitives + copy-paste skins for catalog components.

2. **Duplicating form logic across views** — Writing custom validation in `onChange` handlers per form. Failure mode: validation rules drift between creation and edit forms; error messages are inconsistent; adding a new field requires touching multiple files. Use schema-first form validation (React Hook Form + Zod) uniformly.

3. **Formik in new projects** — Formik's last commit was 1+ year ago (as of 2025), its bundle is 4× React Hook Form's, and it relies on controlled inputs causing re-renders on every keystroke. All new forms should use React Hook Form.

4. **Custom positioning for tooltips/popovers** — Implementing manual `position: absolute` with scroll listeners for popup elements. Failure mode: element clipped at viewport edges, incorrect position after scroll, wrong z-index in stacked modal context. Always use Floating UI.

5. **AG Grid Enterprise for moderate data volumes** — Paying for AG Grid Enterprise when TanStack Table + react-virtual handles under 50k rows without license cost. AG Grid is justified only when row grouping, pivot tables, server-side row model, or Excel export are hard requirements.

6. **Using `react-beautiful-dnd`** — Atlassian archived this library in 2022; it does not support React 18 StrictMode and keyboard drag is incomplete. Use `@dnd-kit` for all new drag-and-drop requirements.

---

## Sources (full citation list)

### Primary — Core Libraries
- shadcn/ui Philosophy — https://ui.shadcn.com/docs
- shadcn/ui Component List — https://ui.shadcn.com/docs/components
- shadcn/ui CLI 3.0 + MCP — https://ui.shadcn.com/docs/changelog/2025-08-cli-3-mcp
- shadcn/ui npx create — https://ui.shadcn.com/docs/changelog/2025-12-shadcn-create
- shadcn/ui Combobox — https://ui.shadcn.com/docs/components/radix/combobox
- shadcn/ui Data Table — https://ui.shadcn.com/docs/components/radix/data-table
- shadcn/ui Drawer (Vaul) — https://ui.shadcn.com/docs/components/radix/drawer
- shadcn/ui Input OTP — https://ui.shadcn.com/docs/components/radix/input-otp
- shadcn/ui Sidebar — https://ui.shadcn.com/docs/components/radix/sidebar
- shadcn/ui Calendar — https://ui.shadcn.com/docs/components/base/calendar
- shadcn-ui/ui GitHub — https://github.com/shadcn-ui/ui
- Radix Primitives — https://www.radix-ui.com/primitives
- Radix Slider — https://www.radix-ui.com/primitives/docs/components/slider
- Radix Themes 3.0 — https://www.radix-ui.com/themes/docs/overview/getting-started
- radix-ui/primitives GitHub — https://github.com/radix-ui/primitives
- React Aria Home — https://react-aria.adobe.com/
- React Aria Components — https://react-spectrum.adobe.com/react-aria/components.html
- React Aria Autocomplete — https://react-spectrum.adobe.com/react-aria/Autocomplete.html
- React Aria Virtualizer — https://react-spectrum.adobe.com/react-aria/Virtualizer.html
- React Aria usePopover — https://react-spectrum.adobe.com/react-aria/usePopover.html
- React Aria ColorPicker — https://react-spectrum.adobe.com/react-aria/ColorPicker.html
- React Aria useSlider — https://react-spectrum.adobe.com/react-aria/useSlider.html
- adobe/react-spectrum GitHub — https://github.com/adobe/react-spectrum
- Mantine — https://mantine.dev
- Mantine DatePicker — https://mantine.dev/dates/date-picker/
- Mantine DatePickerInput — https://mantine.dev/dates/date-picker-input/
- Mantine DateTimePicker — https://mantine.dev/dates/date-time-picker/
- Mantine Dates Getting Started — https://mantine.dev/dates/getting-started/
- Mantine v7.15 Changelog — https://mantine.dev/changelog/7-15-0/
- Material UI v6 — https://mui.com/material-ui/
- MUI X DateRangePicker — https://mui.com/x/react-date-pickers/date-range-picker/
- MUI X TimePicker — https://mui.com/x/react-date-pickers/time-picker/
- MUI X Timezone — https://mui.com/x/react-date-pickers/timezone/
- MUI Pagination — https://mui.com/material-ui/react-pagination/
- HeroUI Home — https://heroui.com/
- HeroUI Components — https://heroui.com/docs/react/components
- HeroUI Pagination — https://heroui.com/docs/react/components/pagination
- Ark UI — https://ark-ui.com/
- chakra-ui/ark GitHub — https://github.com/chakra-ui/ark
- Zag.js — https://zagjs.com/
- Zag.js Introduction — https://zagjs.com/overview/introduction
- Chakra UI v3 — https://chakra-ui.com/
- Chakra UI v3 Announcement — https://chakra-ui.com/blog/announcing-v3
- Park UI — https://park-ui.com/
- Base UI v1 — https://base-ui.com/
- Base UI Combobox — https://base-ui.com/react/components/combobox
- Base UI Autocomplete — https://base-ui.com/react/components/autocomplete
- Base UI Context Menu — https://base-ui.com/react/components/context-menu
- Base UI Releases — https://base-ui.com/react/overview/releases
- IBM Carbon GitHub — https://github.com/carbon-design-system/carbon
- Carbon Components Storybook — https://react.carbondesignsystem.com/
- GitHub Primer React — https://primer.style/components/
- primer/react GitHub — https://github.com/primer/react
- Fluent UI React v9 — https://fluent2.microsoft.design/components/web/react/
- Fluent UI GitHub — https://github.com/microsoft/fluentui
- Fluent UI Storybook — https://storybooks.fluentui.dev/react/
- Ariakit — https://ariakit.org/
- Ariakit Components — https://ariakit.org/components
- Shopify Polaris Components — https://polaris-react.shopify.com/components
- Shopify Polaris Web Components — https://www.shopify.com/partners/blog/polaris-unified-and-for-the-web
- PrimeReact — https://primereact.org/
- primefaces/primereact GitHub — https://github.com/primefaces/primereact
- Mantine React Table — https://www.mantine-react-table.com/
- Material React Table — https://www.material-react-table.com/
- KevinVandy/material-react-table GitHub — https://github.com/KevinVandy/material-react-table
- TanStack Table v8 — https://tanstack.com/table/v8
- TanStack Virtualized Rows — https://tanstack.com/table/v8/docs/framework/react/examples/virtualized-rows
- TanStack Virtualized Infinite Scroll — https://tanstack.com/table/v8/docs/framework/react/examples/virtualized-infinite-scrolling
- TanStack Column Pinning — https://tanstack.com/table/v8/docs/framework/react/examples/column-pinning-sticky
- TanStack Column Virtualization — https://tanstack.com/table/v8/docs/framework/react/examples/virtualized-columns
- TanStack Virtualization Guide — https://tanstack.com/table/v8/docs/guide/virtualization
- AG Grid Community vs Enterprise — https://www.ag-grid.com/react-data-grid/community-vs-enterprise/
- AG Grid Column Pinning — https://www.ag-grid.com/react-data-grid/column-pinning/
- AG Grid Row Grouping — https://www.ag-grid.com/react-data-grid/grouping/
- OpenStatus Data Table — https://data-table.openstatus.dev
- tablecn — https://github.com/sadmann7/tablecn
- cmdk Home — https://cmdk.paco.me
- cmdk GitHub — https://github.com/pacocoursey/cmdk
- React Hook Form — https://react-hook-form.com/
- Motion Home — https://motion.dev/
- Motion React — https://motion.dev/docs/react
- Floating UI Home — https://floating-ui.com/
- Headless UI — https://headlessui.com/
- tailwindlabs/headlessui GitHub — https://github.com/tailwindlabs/headlessui
- Storybook — https://storybook.js.org/
- Storybook MCP for React — https://storybook.js.org/blog/storybook-mcp-for-react/
- Sonner — https://github.com/emilkowalski/sonner
- Vaul — https://github.com/emilkowalski/vaul
- @dnd-kit — https://dndkit.com/
- React Hook Form — https://react-hook-form.com/
- Recharts — https://recharts.org/
- Tremor Home — https://www.tremor.so/
- Tremor GitHub — https://github.com/tremorlabs/tremor
- Vercel Acquires Tremor — https://vercel.com/blog/vercel-acquires-tremor
- Vercel Geist — https://vercel.com/geist/introduction
- React DayPicker — https://daypicker.dev/
- Uppy — https://uppy.io/
- react-dropzone — https://react-dropzone.js.org/
- react-colorful — https://github.com/omgovich/react-colorful
- react-resizable-panels — https://github.com/bvaughn/react-resizable-panels
- react-loading-skeleton GitHub — https://github.com/dvtng/react-loading-skeleton
- input-otp — https://github.com/guilhermerodz/input-otp
- react-hotkeys-hook — https://github.com/JohannesKlauss/react-hotkeys-hook
- React Select — https://react-select.com/
- Downshift — https://www.downshift-js.com/
- Flowbite React — https://flowbite-react.com/

### Secondary — Comparisons and Ecosystem Analysis
- Best React Chart Libraries 2025 — LogRocket — https://blog.logrocket.com/best-react-chart-libraries-2025/
- Badges vs Chips vs Tags vs Pills — https://smart-interface-design-patterns.com/articles/badges-chips-tags-pills/
- WorkOS Radix vs shadcn — https://workos.com/blog/what-is-the-difference-between-radix-and-shadcn-ui
- Best Design System Examples 2025 — https://www.adhamdannaway.com/blog/design-systems/design-system-examples
- Ashby Engineering TipTap — https://www.ashbyhq.com/blog/engineering/tiptap-part-1
- Ariakit at React Advanced 2025 — https://www.infoq.com/news/2025/12/accessibility-ariakit-react/
- React UI Libraries 2025 — Makers Den — https://www.makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra
- shadcn vs MUI vs Ant Design — https://adminlte.io/blog/shadcn-ui-vs-mui-vs-ant-design/
- React Select Libraries — LogRocket — https://blog.logrocket.com/best-react-select-component-libraries/
- Popper vs Floating UI — https://blog.logrocket.com/popper-vs-floating-ui/
- React Toast Libraries 2025 — LogRocket — https://blog.logrocket.com/react-toast-libraries-compared-2025/
- Top React Date Pickers — LogRocket — https://blog.logrocket.com/top-react-date-pickers/
- Virtualized Table Recipe — dev.to — https://dev.to/ainayeem/building-an-efficient-virtualized-table-with-tanstack-virtual-and-react-query-with-shadcn-2hhl
- Top 5 DnD Libraries 2025 — dev.to — https://dev.to/puckeditor/top-5-drag-and-drop-libraries-for-react-24lb
- react-window vs react-virtuoso — dev.to — https://dev.to/sanamumtaz/react-virtualization-react-window-vs-react-virtuoso-8g
- React UI Libraries Matrix — Makers Den — https://makersden.io/blog/react-ui-libs-2025-comparing-shadcn-radix-mantine-mui-chakra
- TipTap vs Lexical — https://medium.com/@faisalmujtaba/tiptap-vs-lexical-which-rich-text-editor-should-you-pick-for-your-next-project-17a1817efcd9
- Ant Design vs shadcn/ui — https://subframe.com/tips/ant-design-vs-shadcn
- Gantt Libraries 2026 — svar.dev — https://svar.dev/blog/top-react-gantt-charts/
- DataGrid Comparison 2025 — https://thedatagrid.com/blog/ag-grid-vs-infinite-table-vs-mui-datagrid-vs-tanstack-2025
- React A11y Best Practices — https://www.allaccessible.org/blog/react-accessibility-best-practices-guide
- RHF vs Formik — https://www.digitalogy.co/blog/react-hook-form-vs-formik/
- React 19 Form Handling — https://www.foo.software/posts/form-handling-in-2025-why-react-19-triumphs-over-formik-and-hook-form
- CSS Variables Guide 2025 — https://www.frontendtools.tech/blog/css-variables-guide-design-tokens-theming-2025
- Headless vs WYSIWYG Editors — https://www.nutrient.io/blog/headless-vs-wysiwyg/
- TanStack vs AG Grid — https://www.simple-table.com/blog/tanstack-table-vs-ag-grid-comparison
- Rich Text Editor Framework 2025 — Liveblocks — https://liveblocks.io/blog/which-rich-text-editor-framework-should-you-choose-in-2025
- better-cmdk AI palette — https://better-cmdk.com/
- Base UI v1 — InfoQ — https://www.infoq.com/news/2026/02/baseui-v1-accessible/
- DnD Libraries npm Comparison — https://npm-compare.com/@dnd-kit/core,react-beautiful-dnd,react-dnd,react-sortable-hoc
- Puck DnD 2026 — https://puckeditor.com/blog/top-5-drag-and-drop-libraries-for-react
- Multi-Select Components Ranked — https://reactscript.com/best-multiple-select-components/
- shadcn Alternatives — https://subframe.com/tips/shadcn-alternatives
- Carousel Libraries 2025 — https://www.angularminds.com/blog/best-react-carousel-component-libraries
- 3 Ways Infinite Scroll — LogRocket — https://blog.logrocket.com/3-ways-implement-infinite-scroll-react/
- 20 Datepickers Ranked 2026 — https://component-depot.com/posts/best-react-datepicker
- Infinite Scroll IntersectionObserver — freeCodeCamp — https://freecodecamp.org/news/infinite-scrolling-in-react/
- Embla Carousel — https://www.embla-carousel.com/
- davidjerleke/embla-carousel GitHub — https://github.com/davidjerleke/embla-carousel
- Page Transitions Motion — https://jfelix.info/blog/page-transitions-in-react
- shadcn vs Radix vs TailwindUI — https://javascript.plainenglish.io/shadcn-ui-vs-radix-ui-vs-tailwind-ui-which-should-you-choose-in-2025-b8b4cadeaa25
- react-phone-number-input — https://www.npmjs.com/package/react-phone-number-input
- react-input-mask GitHub — https://github.com/sanniassin/react-input-mask
- react-spinners — https://www.davidhu.io/react-spinners/
- react-range GitHub — https://github.com/tajo/react-range
- lightGallery React — https://www.lightgalleryjs.com/demos/react-image-gallery/
- react-timezone-select — https://www.npmjs.com/package/react-timezone-select
- react-timeline-gantt — https://github.com/guiqui/react-timeline-gantt
- Yet Another React Lightbox — https://yet-another-react-lightbox.com/examples/carousel

---

*See also: [BASELINE-L1.md](BASELINE-L1.md) (Tokens), [BASELINE-L2.md](BASELINE-L2.md) (Primitives), [BASELINE-L4.md](BASELINE-L4.md) (Patterns), [BASELINE-L8.md](BASELINE-L8.md) (Governance)*
