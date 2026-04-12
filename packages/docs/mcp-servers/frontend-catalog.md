# Frontend Catalog

Design-system source of truth exposed to LLM agents. Wraps the
`frontend-catalog` package — DTCG tokens, seed components, layer baselines,
and ADR-006 decisions — in 6 read-only tools.

**Package**: `@eagles-ai-platform/frontend-catalog-mcp`
**Tools**: 6
**Store**: filesystem (reads `packages/frontend-catalog/`, no SQLite state)
**Env**: `FRONTEND_CATALOG_ROOT` (optional, auto-resolves inside monorepo)

Unlike the other MCP servers, this one holds no runtime state and publishes no
events. It is a stateless read layer over a package that already ships as an
npm artifact — the MCP delivers the same source of truth to agents that reason
about UI code, while the npm package delivers it to builds.

## Tools

### catalog_list_tokens

List DTCG tokens, optionally filtered by a dot-prefix.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `category` | string | no | — | Dot-prefix filter (`base.violet`, `component.button`) |

Returns every matching token with its dotted path, generated CSS variable name
(`base.violet.600` → `--base-violet-600`), raw value, and DTCG `$type`.

### catalog_suggest_token

Given a semantic role, return ranked token matches.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `role` | string | yes | — | Semantic role (`"primary button background"`, `"danger text"`) |
| `limit` | integer | no | 5 | Max suggestions (1-20) |

Scoring combines keyword hit count with Levenshtein distance against the
token path. Use this when generating components — ask for the semantic role,
get back the correct three-tier token.

### catalog_get_component

Read the source of a seed component by name.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `name` | string | yes | — | File name without extension (`Button`, `StatusBadge`) |

Reads from `components/ui/{name}.tsx`. Used when agents need to see how a
primitive is wired (`forwardRef`, `asChild`, ARIA attributes) before copying it
into a consumer project.

### catalog_get_baseline

Fetch one of the 8 layer baseline markdown files.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `layer` | integer | yes | — | Layer number (1-8) |

Layers: **L1** Tokens · **L2** Primitives · **L3** Accessibility · **L4** Motion
· **L5** Content · **L6** Forms · **L7** Data · **L8** Distribution.

Each baseline was synthesized from ~155 elite sources (W3C, Material Design,
GitHub Primer, Radix, Atlassian, Adobe, IBM, Shopify, Microsoft) and is the
provenance record behind ADR-006.

### catalog_get_adr_decision

Extract one decision from `ADR-006-frontend-catalog-elite-baseline.md`.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `n` | integer | yes | — | Decision number (1-20) |

Returns just the decision body rather than the full 583-line ADR. Use this
when you need the rationale for a single architectural choice (e.g. Decision
3: three-tier token architecture) without flooding context with the whole file.

### catalog_lint_snippet

Scan code for raw hex colors and suggest token replacements.

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `code` | string | yes | — | Source snippet (TSX/CSS/JSX) |

Flags every `#rrggbb[aa]` and `#rgb` literal, and when the value matches a
token in `tokens.w3c.json` returns the suggested token path + CSS variable.
Cheap linter for PR review and agent self-check.

## Registration

```json
"frontend-catalog": {
  "command": "node",
  "args": ["${EAGLES_PLATFORM_ROOT}/packages/frontend-catalog-mcp/dist/index.js"],
  "env": {
    "FRONTEND_CATALOG_ROOT": "${EAGLES_PLATFORM_ROOT}/packages/frontend-catalog"
  }
}
```

`FRONTEND_CATALOG_ROOT` is optional. If unset, the server resolves the sibling
`packages/frontend-catalog` directory inside the monorepo automatically.

## Cross-Project Use

This MCP is designed to be registered in repositories that **do not** contain
the `frontend-catalog` source. Workflow:

1. Build once in the monorepo: `pnpm --filter @eagles-ai-platform/frontend-catalog-mcp build`.
2. Register with an absolute `FRONTEND_CATALOG_ROOT` pointing at the monorepo copy.
3. Every consumer project now has a live view of the same tokens, baselines,
   and ADR decisions — no vendoring, no drift.

When the catalog changes, rebuild the MCP; all consuming projects pick up the
new source of truth on the next tool call.
