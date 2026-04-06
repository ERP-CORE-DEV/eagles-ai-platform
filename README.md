# EAGLES AI Platform

Infrastructure layer that gives Claude Code persistent memory, cost tracking, drift detection, and coordinated multi-agent orchestration — without any external services.

![Tests](https://img.shields.io/badge/tests-655-brightgreen)
![Packages](https://img.shields.io/badge/packages-10-blue)
![MCP Servers](https://img.shields.io/badge/MCP%20servers-6-purple)
![Tools](https://img.shields.io/badge/tools-57-orange)
![Skills](https://img.shields.io/badge/skills-62-yellow)

## What EAGLES Does

- **Tracks everything**: every Claude Code tool call is recorded to SQLite — cost, tokens, model, wave — so you always know where your budget went
- **Detects drift**: five-metric scoring catches scope creep, declining test coverage, and token inefficiency before they compound across a multi-wave project
- **Orchestrates agents**: register agents, decompose goals into DAG tasks, route messages between agents, and replay learned patterns — all through standard MCP tools

## Quick Install

```bash
pnpm install
pnpm build
pnpm test
```

Docs dev server: `pnpm docs:dev` → http://localhost:5173

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Claude Code (client)                      │
│  PreToolUse hooks          PostToolUse hooks                 │
│  cost-router.py            token-tracker-hook.py            │
│  rate-limit-detector.py    skill-extractor.py               │
└──────────────┬──────────────────────────┬───────────────────┘
               │ MCP protocol             │ writes
               ▼                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    MCP Servers (Layer 3)                     │
│                                                             │
│  token-tracker   provider-router   vector-memory            │
│  drift-detector  verification      orchestrator             │
└──────────────────────────┬──────────────────────────────────┘
                           │ reads / writes
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                 Shared Libraries (Layer 2)                   │
│  data-layer: TokenLedger, DriftStore, MemoryRepository,     │
│              VectorStore, EventBus (SQLite WAL)              │
│  tool-registry: 62 skills, prereq DAG, DFS cycle detection  │
└──────────────────────────┬──────────────────────────────────┘
                           │ types / utils
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                  Foundation (Layer 1)                        │
│  shared-utils: types, MODEL_PRICING, Semaphore, retries      │
└─────────────────────────────────────────────────────────────┘
```

**Rule**: MCP servers never import each other. Cross-server communication goes through the SQLite EventBus exclusively.

## MCP Server Reference

| Server | Tools | Purpose |
|--------|------:|---------|
| `token-tracker-mcp` | 11 | Record tool calls, compute costs, budget alerts, session reports |
| `provider-router-mcp` | 7 | Multi-provider routing with cost/latency/round-robin strategies |
| `vector-memory-mcp` | 4 | Semantic memory store — save, search, forget with HNSW indexing |
| `drift-detector-mcp` | 8 | Five-metric drift scoring across requirements, tests, tokens |
| `verification-mcp` | 12 | Output assessment, checkpoint management, delivery receipts |
| `orchestrator-mcp` | 15 | Agent lifecycle, DAG tasks, decomposition, messaging, mission start |
| **Total** | **57** | |

## New in v2

| Feature | Location | Description |
|---------|----------|-------------|
| `mission_start` tool | `orchestrator-mcp` | Natural language goal → normalized mission plan with intent classification, project detection, context expansion |
| `DagTaskQueue` | `orchestrator-mcp/tasks/` | Topological task ordering with dependency enforcement |
| `Scheduler` | `orchestrator-mcp/tasks/` | Priority-aware task dispatch with capacity management |
| `Decomposer` | `orchestrator-mcp/tasks/` | LLM-driven goal decomposition into typed task specs |
| `MessageBus` | `orchestrator-mcp/messaging/` | Typed agent-to-agent messaging over the SQLite EventBus |
| Enforcement hooks | `hooks/` | 4 Claude Code hooks: DAG enforcement, session start, Sona recall, bypass telemetry |

## Hooks

Four Claude Code hooks activate automatically on every session:

```
hooks/cost-router.py          — PreToolUse  — print model recommendation before each call
hooks/token-tracker-hook.py   — PostToolUse — record cost + tokens to ledger.sqlite
hooks/rate-limit-detector.py  — PostToolUse — detect 429s, suggest provider switch
hooks/skill-extractor.py      — PostToolUse — extract used skills for Sona learning
```

## Links

- [VitePress Docs](packages/docs/) — full reference, `pnpm docs:dev`
- [ADR-007: 863-Repo Competitive Analysis](docs/ADR-007-1000-REPO-COMPETITIVE-ANALYSIS.md)
- [ADR-008: Session Start Contract](docs/ADR-008-SESSION-START-CONTRACT.md)
- [Skill Catalog](packages/tool-registry/) — 62 skills across 4 domains (26 Classic, 14 Language, 10 Cloud, 12 Database)

## License

MIT
