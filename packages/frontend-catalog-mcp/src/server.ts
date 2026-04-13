import { readFileSync, existsSync, readdirSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveCatalogPath } from "./config.js";

const __serverFile = fileURLToPath(import.meta.url);
const __serverDir = dirname(__serverFile);
const MCP_PKG_ROOT = resolve(__serverDir, "..");

function resolveMcpDataPath(relative: string): string {
  return resolve(MCP_PKG_ROOT, relative);
}

type Json = Record<string, unknown>;

function readJson(relative: string): Json {
  const raw = readFileSync(resolveCatalogPath(relative), "utf8");
  return JSON.parse(raw) as Json;
}

function readText(relative: string): string {
  return readFileSync(resolveCatalogPath(relative), "utf8");
}

function text(value: unknown) {
  return {
    content: [
      {
        type: "text" as const,
        text: typeof value === "string" ? value : JSON.stringify(value, null, 2),
      },
    ],
  };
}

function errorText(message: string) {
  return {
    isError: true,
    content: [{ type: "text" as const, text: message }],
  };
}

type FlatToken = { path: string; value: string; type: string };

function flattenTokens(node: Json, prefix: string[], out: FlatToken[]): void {
  for (const [key, raw] of Object.entries(node)) {
    if (key.startsWith("$")) continue;
    if (raw === null || typeof raw !== "object") continue;
    const entry = raw as Json;
    if ("$value" in entry) {
      out.push({
        path: [...prefix, key].join("."),
        value: String(entry.$value),
        type: String(entry.$type ?? "unknown"),
      });
      continue;
    }
    flattenTokens(entry, [...prefix, key], out);
  }
}

function loadAllTokens(): FlatToken[] {
  const doc = readJson("tokens/tokens.w3c.json");
  const out: FlatToken[] = [];
  flattenTokens(doc, [], out);
  return out;
}

function tokensToCssVar(path: string): string {
  return `--${path.replace(/\./g, "-")}`;
}

function levenshtein(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const prev = new Array<number>(n + 1);
  const curr = new Array<number>(n + 1);
  for (let j = 0; j <= n; j++) prev[j] = j;
  for (let i = 1; i <= m; i++) {
    curr[0] = i;
    for (let j = 1; j <= n; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= n; j++) prev[j] = curr[j];
  }
  return prev[n];
}

export function createFrontendCatalogServer(): McpServer {
  const server = new McpServer({ name: "frontend-catalog", version: "0.1.0" });

  server.tool(
    "catalog_list_tokens",
    {
      category: z
        .string()
        .optional()
        .describe("Optional dot-prefix filter, e.g. 'base.violet' or 'component.button'"),
    },
    async ({ category }) => {
      try {
        const all = loadAllTokens();
        const filtered = category
          ? all.filter((t) => t.path === category || t.path.startsWith(`${category}.`))
          : all;
        const grouped: Record<string, FlatToken[]> = {};
        for (const t of filtered) {
          const top = t.path.split(".")[0] ?? "root";
          (grouped[top] ??= []).push(t);
        }
        return text({
          total: filtered.length,
          categories: Object.keys(grouped),
          tokens: filtered.map((t) => ({
            path: t.path,
            cssVar: tokensToCssVar(t.path),
            value: t.value,
            type: t.type,
          })),
        });
      } catch (err) {
        return errorText(`catalog_list_tokens failed: ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    "catalog_suggest_token",
    {
      role: z
        .string()
        .describe("Semantic role or context, e.g. 'primary button background', 'danger text', 'card shadow'"),
      limit: z.number().int().positive().max(20).default(5),
    },
    async ({ role, limit }) => {
      try {
        const needle = role.toLowerCase().trim();
        const needleWords = needle.split(/[\s-_.]+/).filter(Boolean);
        const all = loadAllTokens();
        const scored = all.map((t) => {
          const hay = t.path.toLowerCase();
          let hits = 0;
          for (const w of needleWords) if (hay.includes(w)) hits += 1;
          const base = hits * 10;
          const dist = levenshtein(needle, hay);
          const score = base - dist * 0.1;
          return { ...t, score };
        });
        scored.sort((a, b) => b.score - a.score);
        const top = scored.slice(0, limit).map((t) => ({
          path: t.path,
          cssVar: tokensToCssVar(t.path),
          value: t.value,
          type: t.type,
          score: Number(t.score.toFixed(2)),
        }));
        return text({ role, suggestions: top });
      } catch (err) {
        return errorText(`catalog_suggest_token failed: ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    "catalog_get_component",
    {
      name: z.string().describe("Component file name without extension, e.g. 'Button', 'StatusBadge'"),
    },
    async ({ name }) => {
      const safe = name.replace(/[^A-Za-z0-9_-]/g, "");
      if (!safe) return errorText("Invalid component name");
      const candidates = [`components/ui/${safe}.tsx`, `components/ui/${safe}.ts`];
      for (const rel of candidates) {
        const abs = resolveCatalogPath(rel);
        if (existsSync(abs)) {
          try {
            return text({
              name: safe,
              path: rel,
              source: readText(rel),
            });
          } catch (err) {
            return errorText(`catalog_get_component failed: ${(err as Error).message}`);
          }
        }
      }
      return errorText(`Component '${safe}' not found under components/ui/`);
    },
  );

  server.tool(
    "catalog_get_baseline",
    {
      layer: z.number().int().min(1).max(8).describe("Baseline layer number (1-8)"),
    },
    async ({ layer }) => {
      const rel = `baselines/BASELINE-L${layer}.md`;
      try {
        return text({ layer, path: rel, markdown: readText(rel) });
      } catch (err) {
        return errorText(`catalog_get_baseline failed: ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    "catalog_get_adr_decision",
    {
      n: z.number().int().min(1).max(20).describe("Decision number from ADR-006 (1-20)"),
    },
    async ({ n }) => {
      const rel = "docs/adr/ADR-006-frontend-catalog-elite-baseline.md";
      try {
        const doc = readText(rel);
        const lines = doc.split(/\r?\n/);
        const startPattern = new RegExp(`^### Decision ${n}:`);
        const nextPattern = /^### Decision \d+:/;
        const startIdx = lines.findIndex((l) => startPattern.test(l));
        if (startIdx < 0) return errorText(`Decision ${n} not found in ADR-006`);
        let endIdx = lines.length;
        for (let i = startIdx + 1; i < lines.length; i++) {
          if (nextPattern.test(lines[i]) || /^## /.test(lines[i])) {
            endIdx = i;
            break;
          }
        }
        const slice = lines.slice(startIdx, endIdx).join("\n").trim();
        return text({ decision: n, heading: lines[startIdx], body: slice });
      } catch (err) {
        return errorText(`catalog_get_adr_decision failed: ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    "catalog_lint_snippet",
    {
      code: z.string().describe("Source snippet (TSX/CSS/JSX) to lint for raw color/spacing values"),
    },
    async ({ code }) => {
      try {
        const findings: Array<{
          line: number;
          column: number;
          raw: string;
          rule: string;
          suggestion?: { path: string; cssVar: string; value: string };
        }> = [];
        const all = loadAllTokens();
        const colorTokens = all.filter((t) => t.type === "color");
        const hexRe = /#([0-9a-fA-F]{3}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})\b/g;
        const lines = code.split(/\r?\n/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          let m: RegExpExecArray | null;
          hexRe.lastIndex = 0;
          while ((m = hexRe.exec(line)) !== null) {
            const raw = m[0].toLowerCase();
            const match = colorTokens.find((t) => t.value.toLowerCase() === raw);
            findings.push({
              line: i + 1,
              column: m.index + 1,
              raw,
              rule: "no-raw-color",
              suggestion: match
                ? { path: match.path, cssVar: tokensToCssVar(match.path), value: match.value }
                : undefined,
            });
          }
        }
        return text({
          findings,
          count: findings.length,
          summary:
            findings.length === 0
              ? "Clean. No raw color literals detected."
              : `${findings.length} raw color literal(s) found. Replace with design tokens.`,
        });
      } catch (err) {
        return errorText(`catalog_lint_snippet failed: ${(err as Error).message}`);
      }
    },
  );

  type ManifestComponent = {
    name: string;
    file: string;
    hasCss: boolean;
    hasStory: boolean;
    tokens: string[];
  };
  type Manifest = { generatedAt: string; count: number; components: ManifestComponent[] };

  function loadManifest(): Manifest {
    const raw = readFileSync(resolveCatalogPath("components.manifest.json"), "utf8");
    return JSON.parse(raw) as Manifest;
  }

  const SEMANTIC_KEYWORDS: Record<string, string[]> = {
    AppShell: ["shell", "app", "layout", "sidebar", "topbar", "frame", "page"],
    PageHeader: ["page", "header", "title", "breadcrumb", "dashboard", "section"],
    Section: ["section", "layout", "group", "container", "dashboard"],
    Drawer: ["drawer", "sidebar", "panel", "sidepanel", "overlay"],
    Modal: ["modal", "dialog", "popup", "overlay", "confirm"],
    Card: ["card", "container", "panel", "tile", "surface"],
    Divider: ["divider", "separator", "rule", "line"],
    ScrollArea: ["scroll", "overflow", "container"],
    DataTable: ["table", "grid", "list", "rows", "data", "dashboard", "sort", "filter", "pagination"],
    Stat: ["stat", "kpi", "metric", "number", "value", "dashboard", "analytics"],
    MetricCard: ["metric", "kpi", "stat", "card", "dashboard", "analytics", "number"],
    Tag: ["tag", "label", "chip", "badge", "marker"],
    Chip: ["chip", "tag", "label", "pill"],
    Avatar: ["avatar", "user", "profile", "picture"],
    Badge: ["badge", "count", "indicator", "status", "notification"],
    Progress: ["progress", "bar", "loading", "completion", "percent"],
    Tooltip: ["tooltip", "hover", "hint", "popover"],
    EmptyState: ["empty", "zero", "placeholder", "noresults", "nodata"],
    FormField: ["form", "field", "input", "label", "validation"],
    Input: ["input", "text", "form", "field", "textbox"],
    Textarea: ["textarea", "multiline", "text", "form", "input"],
    Select: ["select", "dropdown", "picker", "combobox", "form"],
    MultiSelect: ["multiselect", "select", "dropdown", "tags", "form"],
    Checkbox: ["checkbox", "check", "toggle", "form", "boolean"],
    Radio: ["radio", "option", "choice", "form"],
    Switch: ["switch", "toggle", "boolean", "on", "off"],
    DatePicker: ["date", "picker", "calendar", "datetime", "form"],
    FileUpload: ["file", "upload", "dropzone", "attachment", "form"],
    Toast: ["toast", "notification", "snackbar", "alert", "feedback"],
    Alert: ["alert", "notification", "warning", "error", "info", "banner"],
    Skeleton: ["skeleton", "loading", "placeholder", "shimmer"],
    Spinner: ["spinner", "loading", "loader", "progress"],
    CommandPalette: ["command", "palette", "search", "kbar", "cmdk", "shortcut"],
    Breadcrumb: ["breadcrumb", "navigation", "trail", "path", "dashboard"],
    Tabs: ["tabs", "navigation", "sections", "dashboard", "switcher"],
    Stepper: ["stepper", "wizard", "steps", "progress", "workflow"],
    Pagination: ["pagination", "paging", "pages", "navigation", "table"],
    Menu: ["menu", "dropdown", "navigation", "options", "actions"],
    KanbanBoard: ["kanban", "board", "columns", "workflow", "dashboard", "drag", "pipeline", "cards"],
    CandidateCard: ["candidate", "card", "applicant", "profile", "recruitment", "hr"],
    JobCard: ["job", "card", "posting", "offer", "recruitment", "vacancy", "hr"],
    ScoreBadge: ["score", "badge", "rating", "match", "percentage"],
    FilterBar: ["filter", "bar", "facets", "search", "dashboard", "query"],
    TimelineEvent: ["timeline", "event", "history", "activity", "feed"],
    ExportButton: ["export", "download", "csv", "excel", "action"],
    SearchBar: ["search", "bar", "query", "find", "filter", "dashboard"],
    Button: ["button", "action", "cta", "submit", "click"],
    StatusBadge: ["status", "badge", "state", "indicator", "label"],
  };

  server.tool(
    "catalog_search_pattern",
    {
      query: z.string().describe("Free-form query: 'dashboard', 'form input with error', 'kanban column', etc."),
      limit: z.number().int().positive().max(30).default(8),
    },
    async ({ query, limit }) => {
      try {
        const manifest = loadManifest();
        const needle = query.toLowerCase().trim();
        const words = needle.split(/[\s-_.]+/).filter(Boolean);
        const scored = manifest.components.map((c) => {
          const nameLower = c.name.toLowerCase();
          const haystack = [c.name, c.file, ...c.tokens].join(" ").toLowerCase();
          const semantic = SEMANTIC_KEYWORDS[c.name] ?? [];
          let hits = 0;
          let semHits = 0;
          for (const w of words) {
            if (haystack.includes(w)) hits += 2;
            let best = 0;
            for (const k of semantic) {
              if (k === w) { best = 5; break; }
              if (k.includes(w) || w.includes(k)) best = Math.max(best, 3);
            }
            semHits += best;
          }
          const nameBonus = nameLower.includes(needle) ? 10 : 0;
          const levPenalty = Math.min(levenshtein(needle, nameLower) * 0.05, 2);
          const score = hits + nameBonus + semHits - levPenalty;
          return { ...c, score };
        });
        const relevant = scored.filter((c) => c.score > 0);
        relevant.sort((a, b) => b.score - a.score);
        const top = relevant.slice(0, limit).map((c) => ({
          name: c.name,
          file: c.file,
          tokenCount: c.tokens.length,
          score: Number(c.score.toFixed(2)),
        }));
        return text({
          query,
          total: manifest.count,
          matched: relevant.length,
          matches: top,
        });
      } catch (err) {
        return errorText(`catalog_search_pattern failed: ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    "catalog_component_metadata",
    {
      name: z.string().describe("Exact component name, e.g. 'Button', 'KanbanBoard'"),
    },
    async ({ name }) => {
      try {
        const manifest = loadManifest();
        const comp = manifest.components.find((c) => c.name === name);
        if (!comp) return errorText(`Component '${name}' not found in manifest`);
        return text({
          name: comp.name,
          file: comp.file,
          hasCss: comp.hasCss,
          hasStory: comp.hasStory,
          tokensUsed: comp.tokens,
          tokenCount: comp.tokens.length,
        });
      } catch (err) {
        return errorText(`catalog_component_metadata failed: ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    "catalog_audit_a11y",
    {
      snippet: z.string().describe("TSX/JSX source snippet to audit for accessibility + token-only violations"),
    },
    async ({ snippet }) => {
      try {
        const findings: Array<{ rule: string; line: number; evidence: string }> = [];
        const lines = snippet.split(/\r?\n/);
        const forbidden: Array<{ rule: string; pattern: RegExp }> = [
          { rule: "no-hex-color", pattern: /#([0-9a-fA-F]{3,8})\b/ },
          { rule: "no-rgb-color", pattern: /\brgb\(/ },
          { rule: "no-hsl-color", pattern: /\bhsl\(/ },
          { rule: "no-inline-style-object", pattern: /style\s*=\s*\{\{/ },
          { rule: "no-react-fc", pattern: /React\.FC/ },
          { rule: "no-tailwind-arbitrary", pattern: /className\s*=\s*"[^"]*\[[^\]]+\]/ },
        ];
        for (let i = 0; i < lines.length; i++) {
          for (const f of forbidden) {
            const m = f.pattern.exec(lines[i]);
            if (m) findings.push({ rule: f.rule, line: i + 1, evidence: m[0] });
          }
        }
        const iconButtonRe = /<button[^>]*>\s*<(svg|img|Icon)/g;
        let mm: RegExpExecArray | null;
        while ((mm = iconButtonRe.exec(snippet)) !== null) {
          const slice = snippet.slice(Math.max(0, mm.index - 300), mm.index + mm[0].length);
          if (!/aria-label\s*=/.test(slice)) {
            const line = snippet.slice(0, mm.index).split(/\r?\n/).length;
            findings.push({ rule: "icon-button-needs-aria-label", line, evidence: mm[0].slice(0, 60) });
          }
        }
        const inputRe = /<input(?![^>]*type\s*=\s*["'](?:hidden|submit|button|reset)["'])[^>]*>/g;
        let im: RegExpExecArray | null;
        while ((im = inputRe.exec(snippet)) !== null) {
          const match = im[0];
          if (
            !/aria-label\s*=/.test(match) &&
            !/aria-labelledby\s*=/.test(match) &&
            !/\bid\s*=/.test(match)
          ) {
            const line = snippet.slice(0, im.index).split(/\r?\n/).length;
            findings.push({ rule: "input-needs-label", line, evidence: match.slice(0, 60) });
          }
        }
        const divClickRe = /<div[^>]*\sonClick\s*=/g;
        let dm: RegExpExecArray | null;
        while ((dm = divClickRe.exec(snippet)) !== null) {
          const line = snippet.slice(0, dm.index).split(/\r?\n/).length;
          findings.push({ rule: "no-div-onclick", line, evidence: dm[0].slice(0, 60) });
        }
        return text({
          findings,
          count: findings.length,
          summary:
            findings.length === 0
              ? "Clean. No a11y or token violations detected."
              : `${findings.length} violation(s). Fix before merging.`,
        });
      } catch (err) {
        return errorText(`catalog_audit_a11y failed: ${(err as Error).message}`);
      }
    },
  );

  type ExternalSystem = {
    system: { id: string; name: string; license: string; sourceUrl: string; fetchedAt: string };
    tokens: Array<{ path: string; value: string; type: string }>;
    components: Array<{ name: string; categoryGuess: string; url?: string }>;
  };

  const CANONICAL_COMPONENT_MAP: Record<string, string[]> = {
    button: ["button"],
    input: ["input", "textfield", "textinput"],
    select: ["select", "dropdown", "combobox", "picker"],
    checkbox: ["checkbox"],
    radio: ["radio", "radiogroup", "radiobutton"],
    switch: ["switch", "toggle"],
    slider: ["slider", "range"],
    modal: ["modal", "dialog"],
    drawer: ["drawer", "sidesheet", "sheet"],
    tooltip: ["tooltip"],
    toast: ["toast", "notification", "snackbar", "messagebar"],
    alert: ["alert", "banner", "callout"],
    badge: ["badge", "tag", "chip", "pill"],
    avatar: ["avatar", "persona"],
    card: ["card"],
    table: ["table", "datatable", "datagrid"],
    tabs: ["tab", "tabs", "tablist"],
    breadcrumb: ["breadcrumb", "breadcrumbs"],
    pagination: ["pagination", "pager"],
    menu: ["menu", "contextmenu", "menubar"],
    progress: ["progress", "progressbar"],
    spinner: ["spinner", "loading", "circularprogress"],
    skeleton: ["skeleton", "placeholder"],
    stepper: ["stepper", "wizard"],
    accordion: ["accordion", "disclosure", "collapse"],
    emptystate: ["emptystate", "empty"],
  };

  const CANONICAL_TOKEN_MAP: Record<string, RegExp[]> = {
    "color.primary": [/primary/, /brand/, /accent/, /\bbrand\./i],
    "color.danger": [/danger/, /error/, /critical/, /negative/, /\bred\./i],
    "color.success": [/success/, /positive/, /\bgreen\./i],
    "color.warning": [/warning/, /caution/, /attention/, /\byellow\./i, /\borange\./i],
    "color.info": [/info/, /notice/, /\bblue\./i],
    "color.text.primary": [/text.*primary/, /foreground.*primary/, /content.*primary/, /on-surface/],
    "color.text.secondary": [/text.*secondary/, /foreground.*secondary/, /content.*secondary/],
    "color.background.surface": [/background.*surface/, /surface/, /paper/, /background.*primary/],
    "color.background.muted": [/background.*muted/, /background.*subtle/, /\bmuted/, /\bsubtle/],
    "color.border.default": [/border.*default/, /border.*primary/, /divider/, /outline/],
    "spacing.xs": [/spacing[-.]?0?1\b/, /spacing[-.]?xs\b/, /size[-.]?50\b/],
    "spacing.sm": [/spacing[-.]?0?2\b/, /spacing[-.]?sm\b/, /size[-.]?100\b/],
    "spacing.md": [/spacing[-.]?0?4\b/, /spacing[-.]?md\b/, /size[-.]?200\b/],
    "radius.sm": [/radius[-.]?sm\b/, /radius[-.]?1\b/, /corner[-.]?1\b/],
    "radius.md": [/radius[-.]?md\b/, /radius[-.]?2\b/, /corner[-.]?2\b/],
    "typography.size.base": [/font[-.]?size[-.]?base/, /typography[-.]?size[-.]?base/, /size[-.]?100[-.]?body/],
  };

  function loadExternalSystems(): ExternalSystem[] {
    const dir = resolveMcpDataPath("data/systems");
    if (!existsSync(dir)) return [];
    const files = readdirSync(dir).filter((f) => f.endsWith(".json"));
    const out: ExternalSystem[] = [];
    for (const f of files) {
      try {
        const raw = readFileSync(resolve(dir, f), "utf8");
        out.push(JSON.parse(raw) as ExternalSystem);
      } catch {
        // skip malformed
      }
    }
    return out;
  }

  function canonicalizeComponentName(raw: string): string | null {
    const n = raw.toLowerCase().replace(/[^a-z0-9]/g, "");
    for (const [canonical, aliases] of Object.entries(CANONICAL_COMPONENT_MAP)) {
      if (aliases.some((a) => n === a || n.includes(a))) return canonical;
    }
    return null;
  }

  function canonicalizeTokenPath(raw: string): string | null {
    const n = raw.toLowerCase();
    for (const [canonical, patterns] of Object.entries(CANONICAL_TOKEN_MAP)) {
      if (patterns.some((p) => p.test(n))) return canonical;
    }
    return null;
  }

  server.tool(
    "catalog_compare_systems",
    {
      target: z
        .enum(["component", "token"])
        .describe("Compare component coverage or token coverage across design systems"),
      name: z
        .string()
        .describe("Component name (e.g. 'Button', 'DataTable') or canonical token path (e.g. 'color.primary')"),
      systems: z
        .array(z.string())
        .optional()
        .describe("Optional filter, e.g. ['carbon','primer']. Default: all ingested."),
    },
    async ({ target, name, systems }) => {
      try {
        const all = loadExternalSystems();
        const filtered = systems?.length
          ? all.filter((s) => systems.includes(s.system.id))
          : all;
        if (filtered.length === 0) {
          return errorText("No ingested design systems found under data/systems/. Run Wave 2B ingestion.");
        }
        if (target === "component") {
          const canonical = canonicalizeComponentName(name);
          const rows = filtered.map((s) => {
            const matches = s.components.filter((c) => {
              const cn = canonicalizeComponentName(c.name);
              return cn === canonical || c.name.toLowerCase() === name.toLowerCase();
            });
            return {
              systemId: s.system.id,
              systemName: s.system.name,
              found: matches.length > 0,
              matches: matches.map((m) => ({ name: m.name, category: m.categoryGuess, url: m.url })),
            };
          });
          const eaglesManifest = loadManifest();
          const eaglesMatch = eaglesManifest.components.find(
            (c) => canonicalizeComponentName(c.name) === canonical || c.name.toLowerCase() === name.toLowerCase(),
          );
          return text({
            query: name,
            canonical,
            eagles: eaglesMatch
              ? { found: true, name: eaglesMatch.name, tokenCount: eaglesMatch.tokens.length }
              : { found: false },
            systems: rows,
            coverage: `${rows.filter((r) => r.found).length}/${rows.length}`,
          });
        } else {
          const canonicalQuery = name.toLowerCase();
          const rows = filtered.map((s) => {
            const matches = s.tokens.filter((t) => {
              const can = canonicalizeTokenPath(t.path);
              return can === canonicalQuery || t.path.toLowerCase().includes(canonicalQuery);
            });
            return {
              systemId: s.system.id,
              systemName: s.system.name,
              found: matches.length > 0,
              samples: matches.slice(0, 5).map((m) => ({ path: m.path, value: m.value, type: m.type })),
            };
          });
          return text({
            query: name,
            systems: rows,
            coverage: `${rows.filter((r) => r.found).length}/${rows.length}`,
          });
        }
      } catch (err) {
        return errorText(`catalog_compare_systems failed: ${(err as Error).message}`);
      }
    },
  );

  const GENERATE_CATEGORIES = [
    "layout",
    "data",
    "forms",
    "feedback",
    "navigation",
    "erp",
  ] as const;

  function kebabCase(input: string): string {
    return input
      .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
      .replace(/[\s_]+/g, "-")
      .toLowerCase();
  }

  function substituteTemplate(tmpl: string, vars: Record<string, string>): string {
    return tmpl.replace(/\{\{([A-Z_]+)\}\}/g, (_m, key: string) => vars[key] ?? "");
  }

  server.tool(
    "catalog_generate_from_spec",
    {
      name: z.string().regex(/^[A-Z][A-Za-z0-9]+$/).describe("PascalCase component name, e.g. 'UserCard'"),
      category: z.enum(GENERATE_CATEGORIES),
      description: z.string().describe("Short description (one sentence)"),
      props: z
        .array(
          z.object({
            name: z.string(),
            type: z.string(),
            optional: z.boolean().default(true),
            doc: z.string().optional(),
          }),
        )
        .default([]),
    },
    async ({ name, category, description, props }) => {
      try {
        const manifest = loadManifest();
        if (manifest.components.some((c) => c.name === name)) {
          return errorText(
            `Component '${name}' already exists in the catalog. Use catalog_component_metadata to inspect.`,
          );
        }
        const tsxTmpl = readText("templates/component.tsx.hbs");
        const cssTmpl = readText("templates/component.css.hbs");
        const storyTmpl = readText("templates/stories.tsx.hbs");
        const kebab = kebabCase(name);
        const propsBlock = props
          .map(
            (p) =>
              `  /** ${p.doc ?? p.name} */\n  ${p.name}${p.optional ? "?" : ""}: ${p.type};`,
          )
          .join("\n");
        const propDestructure = props.map((p) => `  ${p.name},`).join("\n");
        const vars: Record<string, string> = {
          NAME: name,
          KEBAB: kebab,
          CATEGORY: category,
          DESCRIPTION: description,
          PROP_DOC: description,
          PROPS: propsBlock,
          PROP_DESTRUCTURE: propDestructure,
          EXTRA_PROPS: "",
          DEFAULT_ARGS: "{}",
        };
        const tsx = substituteTemplate(tsxTmpl, vars);
        const css = substituteTemplate(cssTmpl, vars);
        const story = substituteTemplate(storyTmpl, vars);
        return text({
          name,
          category,
          files: {
            [`components/ui/${name}.tsx`]: tsx,
            [`components/ui/${name}.css`]: css,
            [`components/ui/${name}.stories.tsx`]: story,
          },
          notes: [
            "Generated from locked templates — safe starting point.",
            "Run `node scripts/gate.mjs` after writing to verify token + a11y compliance.",
            "Add a DarkMode story export (parity rule enforced by gate).",
          ],
        });
      } catch (err) {
        return errorText(`catalog_generate_from_spec failed: ${(err as Error).message}`);
      }
    },
  );

  server.tool(
    "catalog_token_playground",
    {
      overrides: z
        .record(z.string())
        .describe("Map of CSS variable name (without leading --) to new value. Example: { 'system-status-success': '#10b981' }"),
    },
    async ({ overrides }) => {
      try {
        const original = readText("dist/tokens.css");
        const lines = original.split(/\r?\n/);
        const diff: Array<{ varName: string; before: string; after: string; matched: boolean }> = [];
        const newLines = lines.map((line) => {
          for (const [k, v] of Object.entries(overrides)) {
            const re = new RegExp(`^(\\s*--${k.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")}\\s*:\\s*)([^;]+)(;.*)?$`);
            const m = re.exec(line);
            if (m) {
              diff.push({ varName: `--${k}`, before: m[2].trim(), after: v, matched: true });
              return `${m[1]}${v}${m[3] ?? ";"}`;
            }
          }
          return line;
        });
        const unmatched = Object.keys(overrides).filter(
          (k) => !diff.some((d) => d.varName === `--${k}`),
        );
        for (const k of unmatched) {
          diff.push({ varName: `--${k}`, before: "(not found)", after: overrides[k], matched: false });
        }
        const generatedCss = newLines.join("\n");
        return text({
          requested: Object.keys(overrides).length,
          matched: diff.filter((d) => d.matched).length,
          unmatched: unmatched.length,
          diff,
          cssLength: generatedCss.length,
          preview: generatedCss.slice(0, 2000),
        });
      } catch (err) {
        return errorText(`catalog_token_playground failed: ${(err as Error).message}`);
      }
    },
  );

  return server;
}
