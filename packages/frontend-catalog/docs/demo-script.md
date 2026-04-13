# Demo — An LLM scaffolds a recruitment dashboard from the EAGLES catalog

This is the end-to-end demo script. Run it in a fresh Claude Code session with the `frontend-catalog` MCP server registered.

## Setup (one-time)

```bash
# From the monorepo root
cd C:/RH-OptimERP/eagles-ai-platform
pnpm install
pnpm --filter @eagles-ai-platform/frontend-catalog build
pnpm --filter @eagles-ai-platform/frontend-catalog-mcp build

# Register the MCP server in Claude Code
# (add to ~/.claude.json under mcpServers)
{
  "frontend-catalog": {
    "command": "node",
    "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog-mcp/dist/index.js"],
    "env": {
      "FRONTEND_CATALOG_ROOT": "C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog"
    }
  }
}
```

Restart Claude Code. Verify with `/mcp` that `frontend-catalog` is connected and shows 12 tools.

## The demo prompt

Open Claude Code in a blank directory (`mkdir /tmp/demo && cd /tmp/demo && claude`). Paste:

> I need a recruitment dashboard built from the EAGLES frontend catalog. Search the catalog for dashboard-appropriate components, inspect the top matches, check how it compares to IBM Carbon for one of them, and scaffold a page.tsx that imports what you found.

## Expected tool calls

1. **`catalog_search_pattern({ query: "dashboard", limit: 8 })`**

   Returns the top 8 matches ranked by keyword hits + name bonus. Expected top results: `KanbanBoard`, `DataTable`, `MetricCard`, `Stat`, `PageHeader`, `SearchBar`, `Tabs`, `FilterBar`.

2. **`catalog_component_metadata({ name: "KanbanBoard" })`**

   Returns: file path, token count, story parity flag. Confirms the component is ready to import.

3. **`catalog_component_metadata({ name: "MetricCard" })`**

   Same for MetricCard. Confirms it composes `Stat` under the hood.

4. **`catalog_compare_systems({ target: "component", name: "DataTable" })`**

   Returns coverage: `8/8` systems have DataTable. Shows that EAGLES ships its own, gate-clean, with N tokens used.

5. **`catalog_get_component({ name: "PageHeader" })`**

   Returns the source of PageHeader.tsx so the agent can see the exact prop signature before writing the page.

6. **`catalog_audit_a11y({ snippet: "<button><svg /></button>" })`**

   (Optional — the agent may run this on its own draft before committing.) Returns: `icon-button-needs-aria-label` finding.

## Expected agent output

The agent should write a single `page.tsx` file that:

- Imports from `@eagles-ai-platform/frontend-catalog` (or relative path during development)
- Uses `PageHeader` at the top with `title="Recrutement"` and `actions={<ExportButton />}`
- Uses a 3-column `MetricCard` row showing candidate count, open roles, avg time-to-hire
- Uses `SearchBar` + `FilterBar` above a `KanbanBoard`
- Passes all 12 cards through the `KanbanBoard` with French HR mock data
- Sets `data-theme="dark"` on `documentElement` for the dark demo

## Verification

```bash
# In the demo directory
node -e "require('fs').existsSync('page.tsx') || process.exit(1)" && echo OK

# Run the EAGLES gate against the generated file (if inside the monorepo)
cd C:/RH-OptimERP/eagles-ai-platform/packages/frontend-catalog
node scripts/gate.mjs
# → 48 components, 0 findings
```

## What this proves

- **The catalog answers agent queries in JSON, not HTML.** No scraping, no URL generation, no heuristics on top of a docs site.
- **The gate is the contract.** The audit tool uses the exact same regex pack as the pre-commit gate. An agent cannot write code that passes one and fails the other.
- **Cross-system context is one call away.** The agent can tell a user "yes, Carbon has a DataTable too, here is the URL" without leaving the tool.
- **Generation is bounded.** `catalog_generate_from_spec` only accepts names that match a regex and are not already taken, so the agent cannot silently overwrite the catalog.

## Recording the demo

```bash
# Start an asciinema recording
asciinema rec eagles-catalog-demo.cast
# Run the demo prompt above
# Ctrl-D to stop

# Convert to GIF for the pitch
asciinema2gif eagles-catalog-demo.cast > eagles-catalog-demo.gif
```

The recording is the artifact that accompanies the €1M pitch.
