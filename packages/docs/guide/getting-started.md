# Getting Started

## Prerequisites

- **Node.js** 20+ (LTS)
- **pnpm** 9+ (`npm install -g pnpm`)
- **Claude Code** with MCP support
- **Git**

## Installation

```bash
# Clone the repository
git clone https://github.com/ERP-CORE-DEV/eagles-ai-platform.git
cd eagles-ai-platform

# Install dependencies
pnpm install

# Build all packages (ordered)
pnpm build:ordered

# Run tests
pnpm test
```

### Build Order

The monorepo has strict dependency ordering:

```
1. shared-utils    (types, constants — zero deps)
2. data-layer      (SQLite stores, EventBus — depends on shared-utils)
3. tool-registry   (62 skills catalog — depends on shared-utils)
4. All MCP servers (depend on shared-utils + data-layer)
5. benchmark       (depends on all above)
```

Use `pnpm build:ordered` to build in correct order, or `pnpm build` for parallel build (requires prior build).

## Register MCP Servers

Add the following to your `~/.claude.json` under `mcpServers`:

```json
{
  "mcpServers": {
    "token-tracker": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/token-tracker-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "C:/RH-OptimERP/eagles-ai-platform/.data" }
    },
    "provider-router": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/provider-router-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "C:/RH-OptimERP/eagles-ai-platform/.data" }
    },
    "vector-memory": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/vector-memory-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "C:/RH-OptimERP/eagles-ai-platform/.data" }
    },
    "drift-detector": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/drift-detector-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "C:/RH-OptimERP/eagles-ai-platform/.data" }
    },
    "verification": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/verification-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "C:/RH-OptimERP/eagles-ai-platform/.data" }
    },
    "orchestrator": {
      "type": "stdio",
      "command": "node",
      "args": ["C:/RH-OptimERP/eagles-ai-platform/packages/orchestrator-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "C:/RH-OptimERP/eagles-ai-platform/.data" }
    }
  }
}
```

::: tip
Set `EAGLES_DATA_ROOT` to a shared directory. All MCP servers write their SQLite databases here, enabling inter-MCP communication via the EventBus.
:::

## Verify Installation

```bash
# Smoke test all MCPs
pnpm smoke-test

# Or test individually
pnpm test
```

Restart Claude Code after registering MCPs. The tools will appear in Claude Code's tool discovery.

## Install Hooks (Optional)

Two Claude Code hooks enhance the platform:

1. **cost-router** — Routes Agent subagents to optimal models (haiku/sonnet/opus)
2. **token-tracker** — Records all tool calls to the token-tracker SQLite

See [Hooks Guide](/guide/hooks) for installation.

## Development

```bash
# Watch mode for tests
pnpm test:watch

# Type checking
pnpm typecheck

# Clean all build artifacts
pnpm clean

# Live documentation
pnpm docs:dev
```
