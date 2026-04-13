# @eagles-ai-platform/frontend-catalog-mcp

Stdio MCP server that exposes the EAGLES frontend catalog to LLM agents. 12 tools total — 6 original + 6 added during the v1.0 overnight shipment.

## Why

See [ADR-007](../frontend-catalog/docs/adr/ADR-007-ai-queryable-design-system.md). The primary consumer of new code is an LLM agent, not a human browsing docs. The catalog needs a structured query surface.

## The 12 tools

### Discovery
| Tool | Input | Returns |
|---|---|---|
| `catalog_search_pattern` | `query`, `limit?` | Top-ranked components matching the query |
| `catalog_component_metadata` | `name` | File path, tokens used, story parity |
| `catalog_list_tokens` | `category?` | All 138 W3C tokens grouped |
| `catalog_suggest_token` | `role`, `limit?` | Semantic role → token path (Levenshtein) |
| `catalog_get_component` | `name` | Source code of the .tsx file |

### Documentation
| Tool | Input | Returns |
|---|---|---|
| `catalog_get_baseline` | `layer` (1-8) | BASELINE-Lx.md body |
| `catalog_get_adr_decision` | `n` (1-20) | ADR-006 decision body |

### Enforcement
| Tool | Input | Returns |
|---|---|---|
| `catalog_lint_snippet` | `code` | Raw color literals with token suggestions |
| `catalog_audit_a11y` | `snippet` | Gate regex pack findings (hex, inline style, React.FC, icon button a11y, div onClick...) |

### Intelligence
| Tool | Input | Returns |
|---|---|---|
| `catalog_compare_systems` | `target` (component\|token), `name`, `systems?` | Canonicalized coverage across 8 external systems |

### Generation
| Tool | Input | Returns |
|---|---|---|
| `catalog_generate_from_spec` | `name`, `category`, `description`, `props?` | Generated .tsx + .css + .stories.tsx from locked templates |
| `catalog_token_playground` | `overrides` (Record) | Override diff + regenerated `tokens.css` |

## Install

```bash
cd C:/RH-OptimERP/eagles-ai-platform
pnpm --filter @eagles-ai-platform/frontend-catalog-mcp build
```

## Register with Claude Code

Add to `~/.claude.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "frontend-catalog": {
      "command": "node",
      "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog-mcp/dist/index.js"],
      "env": {
        "FRONTEND_CATALOG_ROOT": "C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog"
      }
    }
  }
}
```

Restart Claude Code. Run `/mcp` to verify.

## Example invocations

### Search

```jsonc
{ "name": "catalog_search_pattern", "arguments": { "query": "kanban", "limit": 3 } }
```
Returns top-ranked components with score, file path, and token count.

### Compare systems

```jsonc
{ "name": "catalog_compare_systems", "arguments": { "target": "component", "name": "DataTable" } }
```
Returns per-system match data for Carbon, Primer, Spectrum, Material 3, Fluent, Ant, Chakra, shadcn/ui.

### Audit a11y

```jsonc
{ "name": "catalog_audit_a11y", "arguments": { "snippet": "<div onClick={fn}>click me</div>" } }
```
Returns findings: `[{ rule: "no-div-onclick", line: 1, evidence: "<div onClick=..." }]`

### Token playground

```jsonc
{ "name": "catalog_token_playground", "arguments": { "overrides": { "system-status-success": "#10b981" } } }
```
Returns diff, matched count, and the full regenerated `tokens.css` preview.

### Generate from spec

```jsonc
{
  "name": "catalog_generate_from_spec",
  "arguments": {
    "name": "TeamMemberRow",
    "category": "erp",
    "description": "Row showing a team member avatar + role + actions",
    "props": [{ "name": "member", "type": "TeamMember", "optional": false }]
  }
}
```
Returns three file bodies that the agent can write to disk.

## Cross-system data

`data/systems/*.json` contains flattened token + component data for 8 public design systems (all MIT or Apache-2.0):

| System | Tokens | Components |
|---|---|---|
| IBM Carbon | 66 | 20 |
| GitHub Primer | 72 | 27 |
| Adobe Spectrum | 60 | 25 |
| Google Material 3 | 68 | 26 |
| Microsoft Fluent 2 | 68 | 30 |
| Ant Design | 68 | 43 |
| Chakra UI | 59 | 29 |
| shadcn/ui | 54 | 35 |
| **Total** | **515** | **235** |

Canonical aliases are in `src/server.ts` under `CANONICAL_COMPONENT_MAP` and `CANONICAL_TOKEN_MAP`.

## Development

```bash
pnpm typecheck     # tsc --noEmit
pnpm build         # tsup → dist/
pnpm test          # vitest
```

## License

MIT.
