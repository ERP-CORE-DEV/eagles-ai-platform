# Architecture

## Overview

EAGLES AI Platform is a **pnpm monorepo** with 10 packages organized in 3 layers:

```
┌──────────────────────────────────────────────┐
│              MCP Servers (Layer 3)            │
│  token-tracker │ provider-router │ vector-mem │
│  drift-detect  │ verification   │ orchestrat │
├──────────────────────────────────────────────┤
│           Shared Libraries (Layer 2)         │
│  data-layer (stores, EventBus, VectorStore)  │
│  tool-registry (62 skills, prereq graph)     │
├──────────────────────────────────────────────┤
│             Foundation (Layer 1)             │
│  shared-utils (types, pricing, constants)    │
└──────────────────────────────────────────────┘
```

## Dependency Graph

```
shared-utils ─────────────────────────────┐
     │                                     │
     └──▸ data-layer ──▸ token-tracker-mcp │
              │     ──▸ provider-router-mcp│
              │     ──▸ vector-memory-mcp  │
              │     ──▸ drift-detector-mcp │
              │     ──▸ verification-mcp   │
              │     ──▸ orchestrator-mcp   │
              │                            │
     └──▸ tool-registry ──────────────────┘
              │
              └──▸ benchmark
```

**Rule**: MCP servers never depend on each other. They communicate exclusively through the **SQLite EventBus**.

## Inter-MCP Communication

```
token-tracker  ──publish("token.recorded")──▸  EventBus (SQLite WAL)
                                                      │
drift-detector ──consume("token.recorded")────────────┘
```

The EventBus uses **SQLite WAL mode** for concurrent read/write access:
- One writer at a time (SQLite constraint)
- Multiple concurrent readers (WAL mode benefit)
- No file-based JSON polling (Classic pattern — prone to corruption)

## Data Persistence

All runtime data is stored under `$EAGLES_DATA_ROOT` (default: `.data/`):

```
.data/
├── token-ledger/
│   └── ledger.sqlite         # Token records, cost tracking
├── vector-memory/
│   ├── memory.sqlite         # Memory entries metadata
│   └── vectors.hnsw          # HNSW vector index
├── drift-detector/
│   └── drift.sqlite          # Requirements, checkpoints, scores
├── provider-router/
│   └── provider.sqlite       # Provider configs, routing history
├── verification/
│   └── verification.sqlite   # Checkpoints, receipts, findings
├── orchestrator/
│   └── orchestrator.sqlite   # Agents, tasks, patterns
└── events/
    └── eventbus.sqlite       # Cross-MCP event bus
```

Each store uses **WAL mode** for crash safety and concurrent access.

## Technology Stack

| Component | Choice | Rationale |
|-----------|--------|-----------|
| Monorepo | pnpm workspaces | Strict hoisting, `workspace:*` protocol |
| Language | TypeScript 5.5+ (strict) | Type safety, IDE support |
| Runtime | Node.js 20+ | LTS, native ESM |
| MCP SDK | @modelcontextprotocol/sdk | Standard MCP protocol |
| Validation | Zod | Runtime type validation |
| Database | better-sqlite3 | Synchronous, WAL mode, zero-config |
| Vector Index | hnswlib-node | ~0.5ms query at 10K vectors |
| Embeddings | @xenova/transformers | Client-side, no external API |
| Tests | Vitest | Native ESM, workspace mode |
| Build | tsup | esbuild-based, fast |

## Hook Integration

Two Claude Code hooks bridge the gap between Claude Code's tool execution and the MCP data stores:

```
Claude Code ──PreToolUse──▸ cost-router.py ──▸ prints model recommendation
Claude Code ──PostToolUse──▸ token-tracker-hook.py ──▸ writes to ledger.sqlite
```

This creates a **feedback loop**: every tool call generates data that MCPs can analyze, creating insights that improve future tool usage.
