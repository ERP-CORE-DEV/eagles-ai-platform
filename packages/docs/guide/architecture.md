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

## Package Tree

```
packages/
├── shared-utils/           # Foundation types, pricing, utilities
├── data-layer/             # All SQLite stores + EventBus + VectorStore
├── tool-registry/          # 62 skills, prereq DAG, DFS cycle detection
├── token-tracker-mcp/      # 11 tools — cost tracking, budget alerts
├── provider-router-mcp/    # 7 tools  — multi-provider routing
├── vector-memory-mcp/      # 4 tools  — semantic memory (HNSW)
├── drift-detector-mcp/     # 8 tools  — 5-metric drift scoring
├── verification-mcp/       # 12 tools — checkpoints, receipts, assessments
├── orchestrator-mcp/       # 15 tools — agents, tasks, DAG, messaging, mission
│   ├── src/agents/         # Agent lifecycle, health, types
│   ├── src/tasks/          # DagTaskQueue, Scheduler, Decomposer, task-utils
│   ├── src/mission/        # 6 sub-modules (see below)
│   └── src/messaging/      # MessageBus
└── docs/                   # VitePress documentation site
```

## Orchestrator: Internal Modules

The `orchestrator-mcp` package is the most complex server. Its internal structure:

### mission/ — Mission Start Pipeline

Activated by the `mission_start` tool. Converts a natural language goal into a structured mission plan.

| Module | Responsibility |
|--------|---------------|
| `normalizer.ts` | Strip noise, expand contractions, extract `/skills` flags |
| `project-resolver.ts` | Detect active project from `cwd` (CLAUDE.md, package.json, .git) |
| `intent-classifier.ts` | Classify goal into intent type; map to required skills |
| `context-expander.ts` | Read project files to build layered context snapshot |
| `mission-start.ts` | Orchestrate all 4 steps; return `MissionStartResult` |
| `types.ts` | `MissionPlan`, `ExpandedContext`, `IntentClassification` types |

### tasks/ — DAG Task Engine

| Module | Responsibility |
|--------|---------------|
| `DagTaskQueue.ts` | Topological sort; enforces dependency ordering before dispatch |
| `Scheduler.ts` | Priority-aware dispatch; tracks capacity per agent |
| `Decomposer.ts` | Builds coordinator system prompt; parses LLM decomposition JSON |
| `task-utils.ts` | Shared helpers — ID generation, status transitions |
| `task-engine.ts` | Core CRUD over `TaskStore` (wraps data-layer) |
| `coordination.ts` | `findBestAgent` — capability matching against agent roster |
| `types.ts` | `TaskDefinition`, `TaskSpec`, `DecompositionResult` |

### messaging/ — Agent-to-Agent Messaging

| Module | Responsibility |
|--------|---------------|
| `MessageBus.ts` | `send`, `getUnread`, `getAll`, `getSince` — typed messages over EventBus |
| `types.ts` | `AgentMessage`, `MessageEnvelope` |

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

All runtime data is stored under `$EAGLES_DATA_ROOT` (default: `.eagles-data/`):

```
.eagles-data/
├── agents.sqlite             # Agent registry, heartbeats, status
├── tasks.sqlite              # Task DAG, assignments, results
├── learning.sqlite           # Sona pattern store (success rates)
├── messaging.sqlite          # Agent-to-agent message bus
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
└── events/
    └── eventbus.sqlite       # Cross-MCP event bus
```

Each store uses **WAL mode** for crash safety and concurrent access.

## Hook Integration

Four Claude Code hooks bridge tool execution and the MCP data stores:

```
Claude Code ──PreToolUse──▸  cost-router.py           ──▸ prints model recommendation
Claude Code ──PreToolUse──▸  eagles-enforce-dag        ──▸ blocks out-of-order task execution
Claude Code ──PostToolUse──▸ token-tracker-hook.py    ──▸ writes cost record to ledger.sqlite
Claude Code ──PostToolUse──▸ rate-limit-detector.py   ──▸ detects 429s, suggests provider switch
Claude Code ──PostToolUse──▸ skill-extractor.py       ──▸ extracts skills for Sona learning
```

### Enforcement Hooks (v2)

Four hooks enforce platform-level invariants on every session:

| Hook | Trigger | Purpose |
|------|---------|---------|
| `eagles-enforce-dag` | PreToolUse | Block tool calls that violate declared task dependencies |
| `eagles-session-start` | PreToolUse (first call) | Validate session contract, load mission context |
| `eagles-sona-recall` | PreToolUse | Surface relevant learned patterns before execution |
| `eagles-bypass-telemetry` | PostToolUse | Ensure no tool call escapes token tracking |

This creates a **feedback loop**: every tool call generates data that MCPs can analyze, creating insights that improve future tool usage.

## Tool Count by Server

| Server | Tools | New in v2 |
|--------|------:|----------|
| token-tracker-mcp | 11 | — |
| provider-router-mcp | 7 | — |
| vector-memory-mcp | 4 | — |
| drift-detector-mcp | 8 | — |
| verification-mcp | 12 | — |
| orchestrator-mcp | 15 | +5 (`mission_start`, `agent_message_send`, `agent_messages_get`, `task_build_decomposition_prompt`, `task_apply_decomposition`) |
| **Total** | **57** | |

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
