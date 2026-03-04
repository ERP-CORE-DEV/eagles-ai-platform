# Packages

The EAGLES AI Platform monorepo contains 10 packages organized in 3 layers.

## Shared Libraries

| Package | Description | Dependencies |
|---------|-------------|-------------|
| [shared-utils](./shared-utils) | Types, pricing constants, validators | None (zero deps) |
| [data-layer](./data-layer) | SQLite stores, EventBus, VectorStore | shared-utils |
| [tool-registry](./tool-registry) | 62 skills catalog with prerequisite graph | shared-utils |

## MCP Servers

| Package | Tools | Dependencies |
|---------|-------|-------------|
| token-tracker-mcp | 11 | shared-utils, data-layer |
| provider-router-mcp | 7 | shared-utils, data-layer |
| vector-memory-mcp | 4 | shared-utils, data-layer |
| drift-detector-mcp | 8 | shared-utils, data-layer |
| verification-mcp | 12 | shared-utils, data-layer |
| orchestrator-mcp | 10 | shared-utils, data-layer |

## Benchmark

| Package | Description |
|---------|-------------|
| benchmark | Classic vs Advanced comparison framework |

## Build Order

```bash
# Correct dependency order
pnpm build:shared     # 1. shared-utils
pnpm build:data       # 2. data-layer
pnpm build:registry   # 3. tool-registry
pnpm build:mcps       # 4. All MCP servers (parallel)
pnpm build:bench      # 5. benchmark

# Or use the shortcut
pnpm build:ordered
```
