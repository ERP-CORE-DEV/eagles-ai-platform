# MCP Servers

The EAGLES AI Platform provides **7 MCP servers** with a total of **58 tools**.

## Server Inventory

| Server | Tools | Purpose |
|--------|-------|---------|
| [Token Tracker](./token-tracker) | 11 | Cost tracking, budget alerts, model routing |
| [Provider Router](./provider-router) | 7 | Multi-provider model selection and failover |
| [Vector Memory](./vector-memory) | 4 | Semantic memory storage and search |
| [Drift Detector](./drift-detector) | 8 | Requirement drift scoring and alerts |
| [Verification](./verification) | 12 | Output assessment, checkpoints, receipts |
| [Orchestrator](./orchestrator) | 10 | Agent lifecycle, task DAG, pattern learning |
| [Frontend Catalog](./frontend-catalog) | 6 | Design-system tokens, components, baselines, ADR-006 lookups |

## Registration

All servers are registered in `~/.claude.json` under the `mcpServers` key. Each uses:

- **Transport**: stdio (stdin/stdout JSON-RPC)
- **Runtime**: Node.js 20+
- **Shared env**: `EAGLES_DATA_ROOT` pointing to `.data/` directory

See [Getting Started](/guide/getting-started) for full registration config.

## Communication

MCP servers **never import each other**. They communicate through the **SQLite EventBus**:

```
Publisher ──▸ EventBus (SQLite WAL) ──▸ Consumer
```

This ensures:
- Zero compile-time coupling between servers
- Crash isolation (one server failing doesn't affect others)
- Data persistence (events survive process restarts)
