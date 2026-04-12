import { readFileSync, existsSync } from "node:fs";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { resolveCatalogPath } from "./config.js";

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

  return server;
}
