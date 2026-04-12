# @eagles-ai-platform/frontend-catalog-mcp

MCP server that exposes the `frontend-catalog` design system (tokens, components,
baselines, ADR decisions) to LLM agents at query time.

Pairs with the `frontend-catalog` package: the npm package delivers tokens and
components to builds, this MCP delivers the same source of truth to agents that
reason about UI code.

## Tools

| Tool | Purpose |
| --- | --- |
| `catalog_list_tokens` | List DTCG tokens, optionally filtered by dot-prefix (`base.violet`, `component.button`). |
| `catalog_suggest_token` | Given a semantic role (`"primary button background"`), return ranked token matches with CSS var names. |
| `catalog_get_component` | Read a component source file by name (`Button`, `StatusBadge`). |
| `catalog_get_baseline` | Read a `BASELINE-L{n}.md` file (1-8) — Tokens, Primitives, Accessibility, Motion, Content, Forms, Data, Distribution. |
| `catalog_get_adr_decision` | Extract a single decision (1-20) from `ADR-006-frontend-catalog-elite-baseline.md`. |
| `catalog_lint_snippet` | Scan code for raw hex colors and suggest token replacements. |

## Register with Claude Code

Add to `~/.claude.json` under `mcpServers`:

```json
"frontend-catalog": {
  "command": "node",
  "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog-mcp/dist/index.js"],
  "env": {
    "FRONTEND_CATALOG_ROOT": "C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog"
  }
}
```

`FRONTEND_CATALOG_ROOT` is optional — if unset the server resolves the sibling
`packages/frontend-catalog` directory automatically inside the monorepo.

## Build

```bash
pnpm --filter @eagles-ai-platform/frontend-catalog-mcp build
```

Output: `dist/index.js` (with shebang, esm, node20 target).
