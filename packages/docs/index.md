---
layout: home
hero:
  name: EAGLES AI Platform
  text: AI-Powered Development Infrastructure
  tagline: 7 MCP servers, 52 tools, 62 skills — powering Claude Code with real-time tracking, semantic memory, drift detection, and intelligent orchestration.
  actions:
    - theme: brand
      text: Get Started
      link: /guide/getting-started
    - theme: alt
      text: API Reference
      link: /reference/api
    - theme: alt
      text: View on GitHub
      link: https://github.com/ERP-CORE-DEV/eagles-ai-platform

features:
  - icon: "\U0001F4CA"
    title: Token Tracker
    details: Real-time cost tracking across all Claude Code tool calls. Budget alerts, model routing, per-session and per-wave cost reports.
    link: /mcp-servers/token-tracker
  - icon: "\U0001F9ED"
    title: Provider Router
    details: Multi-provider model routing with cost-based, round-robin, and latency strategies. Failover configuration for production resilience.
    link: /mcp-servers/provider-router
  - icon: "\U0001F9E0"
    title: Vector Memory
    details: Semantic search over developer memory using HNSW indexing. Store, search, and forget memories with GDPR-compliant deletion.
    link: /mcp-servers/vector-memory
  - icon: "\U0001F50D"
    title: Drift Detector
    details: 5-metric requirement drift scoring. Track scope creep, test health, and token efficiency across development waves.
    link: /mcp-servers/drift-detector
  - icon: "\u2705"
    title: Verification
    details: Output assessment, agent scoring, checkpoint management, and delivery receipt chains for quality assurance.
    link: /mcp-servers/verification
  - icon: "\U0001F3AF"
    title: Orchestrator
    details: Agent lifecycle management, task DAG execution, and pattern learning for coordinated multi-agent workflows.
    link: /mcp-servers/orchestrator
---

## Quick Install

```bash
git clone https://github.com/ERP-CORE-DEV/eagles-ai-platform.git
cd eagles-ai-platform
pnpm install
pnpm build
pnpm test          # 484 tests
pnpm docs:dev      # Live documentation at localhost:5173
```

## Platform at a Glance

| Metric | Value |
|--------|-------|
| MCP Servers | 7 |
| Total Tools | 52 |
| Skills Catalog | 62 |
| Test Coverage | 484 tests across 36 files |
| Data Stores | 12 SQLite stores (WAL mode) |
| Packages | 10 (3 shared libs + 7 servers) |

## Architecture

```
shared-utils (types, pricing, constants)
     │
     └──▸ data-layer (SQLite stores, EventBus, VectorStore)
              │
              ├──▸ token-tracker-mcp     (11 tools)
              ├──▸ provider-router-mcp   (7 tools)
              ├──▸ vector-memory-mcp     (4 tools)
              ├──▸ drift-detector-mcp    (8 tools)
              ├──▸ verification-mcp      (12 tools)
              ├──▸ orchestrator-mcp      (10 tools)
              └──▸ tool-registry         (62 skills)
```
