# ADR-006: EAGLES AI Platform — Competitive Gap Analysis & Strategic Roadmap

**Date**: 2026-03-31
**Status**: Proposed
**Authors**: Hatim Hajji (Lead), Claude Opus 4.6 (Research)
**Research Scope**: 150+ repos analyzed across 5 parallel research agents

---

## Executive Summary

EAGLES AI Platform (7 MCP servers, 52 tools, 62 skills, 12 SQLite stores, 4 hooks, 484 tests) has **unique strengths** that no single competitor replicates — particularly drift detection, the SonaLearning pattern engine, and the integrated token-to-verification pipeline. However, 5 research agents scanning 150+ repos across the MCP ecosystem, AI dev infrastructure, Claude Code tooling, and 2026 trends identified **22 gaps** across 6 severity tiers.

**The crucial miss**: EAGLES skills are in a proprietary TypeScript format. The industry has standardized on **SKILL.md** (Anthropic, 73K stars, adopted by Microsoft/OpenAI/GitHub/Cursor). EAGLES' 62 skills are invisible to 500K+ skills on marketplaces and incompatible with 11+ AI coding tools. This is the single highest-impact gap.

---

## Research Sources (5 Parallel Agents)

| Agent | Scope | Repos Found | Duration |
|-------|-------|-------------|----------|
| MCP Ecosystem | MCP servers, gateways, registries, protocols | 35 repos | 8 min |
| AI Dev Infrastructure | LangChain, CrewAI, Dify, DSPy, Langfuse, RAGAS, Mem0 | 58 repos | 6 min |
| Claude Code Tools | oh-my-claudecode, Ruflo, SuperClaude, claudewatch, hooks libs | 65+ tools | 7 min |
| Emerging Trends 2026 | DORA, SKILL.md, MCP v1.27, LLM-as-Judge, context engineering | 14 trends | 5 min |
| EAGLES Inventory | Source-verified: every tool, store, hook, skill, script | Full audit | 2 min |

---

## EAGLES Current Strengths (What Nobody Else Has Combined)

| Strength | Details | Nearest Competitor |
|----------|---------|-------------------|
| **Drift Detection** | 5-metric scoring (coverage, test health, file churn, token efficiency, scope creep) with EMA trends | claudewatch has basic drift alerts, but no 5-metric model |
| **SonaLearning** | EMA-scored pattern learning with auto-archive below 20% success | Ruflo's SONA is similar but claims 0.05ms routing (unverified) |
| **Token-to-Verification Pipeline** | record_token_usage → drift_checkpoint → verify_output → verify_receipt_write — end-to-end chain | No competitor chains all 4 stages |
| **Prerequisite DAG** | 62 skills with AND/OR prerequisites, DFS cycle detection | No competitor has typed prerequisite graphs |
| **12 SQLite Stores (WAL)** | Single-process, zero-network, cross-MCP event bus | Most competitors use Redis/Postgres (heavier) |
| **French HR Compliance** | SMIC, CDI/CDD, CPF, OPCO, RNCP, CNIL/GDPR baked into skills | Zero competitors address French HR |

---

## The 22 Gaps — Consolidated & Deduplicated

### Tier 1: CRITICAL (Blocks competitiveness)

| # | Gap ID | Description | Evidence | Best Reference |
|---|--------|-------------|----------|----------------|
| 1 | **SKILL-FORMAT** | 62 skills in proprietary TS format, not SKILL.md. Invisible to 500K+ marketplace skills, incompatible with 11 AI tools | anthropics/skills (73K stars), agentskills.io, SkillsMP, microsoft/skills (1.9K) | Convert 62 skills to SKILL.md YAML+MD format |
| 2 | **NO-UI** | Zero visual layer. Every enterprise competitor has a dashboard | Archestra, MCPJungle, IBM ContextForge, Langfuse, Dify all ship UIs | Build React dashboard reading existing SQLite stores |
| 3 | **NO-A2A** | Agents isolated in SQLite bus, cannot federate with external agents | a2aproject/A2A (22.9K stars), Google-backed, Linux Foundation, 50+ partners | Implement A2A Agent Cards + JSON-RPC |
| 4 | **STDIO-ONLY** | All 7 MCP servers run local stdio. No remote access, no container deployment | supergateway (2.5K), MCP 2026 roadmap: Streamable HTTP, Server Cards | Add HTTP transport to top 3 servers |

### Tier 2: HIGH (Significant competitive disadvantage)

| # | Gap ID | Description | Evidence | Best Reference |
|---|--------|-------------|----------|----------------|
| 5 | **NO-OTEL** | Flat SQLite events, no structured traces/spans, no OTLP export | openllmetry (7K), Langfuse (21K), Phoenix (7.8K) all use OpenTelemetry | Add @opentelemetry/sdk-node to MCP servers |
| 6 | **NO-CODE-GRAPH** | Vector store does semantic similarity, not structural code analysis | hex-graph (tree-sitter AST, 11 tools), zilliztech/claude-context (BM25+dense, 40% token reduction) | Add AST-aware indexing to vector-memory |
| 7 | **RULE-ROUTING** | Provider routing is static rules, not ML-trained | RouteLLM (~7K stars): 85% cost reduction with <5% quality loss via trained classifiers | Train classifier on routing history |
| 8 | **NO-EVAL** | Verification monitors but doesn't measure LLM output quality | RAGAS (~25K), DeepEval (~5K), Promptfoo (13.2K, acquired by OpenAI) | Add faithfulness/hallucination metrics |
| 9 | **NO-JUDGE-GATE** | No automatic LLM-as-judge on agent output before it reaches developer | EvidentlyAI, Spring AI, CodeRabbit (2M+ repos) | PostToolUse hook running lightweight judge |
| 10 | **NO-SANDBOX** | Tools execute in host process, no isolation | E2B (Firecracker microVMs), trailofbits/claude-code-devcontainer | Docker/devcontainer isolation for untrusted code |
| 11 | **NO-IAM** | No authentication layer — any stdio process invokes any tool | mcp-gateway-registry (Keycloak/Entra/Okta), Archestra (per-team budgets) | OAuth scope-based permissions |
| 12 | **NO-WAVE-CHAIN** | Each orchestration wave requires human trigger | Aider (auto-commit loop), SpecWeave (sw:auto, 2500 iterations) | Autonomous wave-chaining in orchestrator |

### Tier 3: MEDIUM (Competitive gap, not blocking)

| # | Gap ID | Description | Evidence | Best Reference |
|---|--------|-------------|----------|----------------|
| 13 | **NO-TEMPORAL-MEM** | No fact validity windows ("true from X to Y") | Graphiti/Zep (23K stars): temporal edges, 18.5% accuracy improvement | Add valid_from/valid_until to memory entries |
| 14 | **NO-RED-TEAM** | No automated security scanning of skill prompts | Promptfoo: OWASP LLM Top 10 preset, 127 Fortune 500 users. Snyk: 36.82% of public skills have flaws | Add promptfoo to CI |
| 15 | **NO-DORA** | No delivery metrics (deploy freq, lead time, change failure rate, rework) | DORA 2025 report: rework rate is 5th metric. Plandek, Faros AI track these | Add 5 DORA tools to token-tracker |
| 16 | **SMALL-CATALOG** | 62 skills vs 136 (ECC), 200+ (Fabric), 400K+ (SkillKit) | everything-claude-code (120K+ stars), Fabric (40K), rohitg00 toolkit | SKILL.md format enables marketplace access |
| 17 | **NO-PR-HOOK** | Code review agents exist but are manually invoked | CodeRabbit (2M repos), claude-code-action (auto PR review) | Azure DevOps pipeline step calling @code-reviewer |
| 18 | **NO-CRAWL** | Vector memory stores embeddings but has no document ingestion | Archon (13.8K): auto-crawl docs sites + PDF + multi-format | Add crawl/ingest pipeline to vector-memory |
| 19 | **NO-SELF-QUERY** | Drift detector is external; Claude can't query its own state mid-session | claudewatch: 29 self-query tools, "8 reads + 0 writes = exploring" heuristic | Add get_drift_signal, get_error_loops tools |

### Tier 4: LOW (Nice to have)

| # | Gap ID | Description | Evidence | Best Reference |
|---|--------|-------------|----------|----------------|
| 20 | **NO-COST-COMMIT** | No git-commit-to-session-cost correlation | claudewatch: cost-per-commit metric | Stop hook reading git log |
| 21 | **NO-AUDIT-TRAIL** | No commit-to-agent-session linking | DORA 2026 best practices | Record session ID in commit trailer |
| 22 | **NO-AUTOCOMPLETE** | Fast 1.5B model unused for inline suggestions | Cursor/Windsurf have autocomplete; Claude Code doesn't | Hybrid setup with Cursor for autocomplete |

---

## Competitive Landscape Map

```
                        EAGLES AI Platform Position

    Breadth of Tools →

    ┌─────────────────────────────────────────────────────┐
    │                                                     │
    │   Ruflo (313 tools)          Dify (114K stars)     │  Full Platforms
    │   ECC (136 skills)           n8n (181K stars)      │  (UI + Workflow)
    │                                                     │
    │   ──────────── EAGLES TARGET ZONE ──────────────   │
    │                                                     │
    │   ★ EAGLES (52 tools)        CrewAI (44.6K)       │  Infrastructure
    │   Archestra (45ms p95)       LangGraph (27.9K)    │  (No UI, Deep)
    │   IBM ContextForge           Mastra (22.3K)       │
    │                                                     │
    │   claudewatch (29 tools)     RouteLLM              │  Single-Purpose
    │   hex-graph (11 tools)       Promptfoo             │  (Narrow, Deep)
    │   supergateway               Mem0 (37K)            │
    │                                                     │
    └─────────────────────────────────────────────────────┘
                    Depth of Integration →
```

**EAGLES occupies the "Infrastructure" quadrant** — deep MCP integration, no UI, moderate tool count. The strategic question: move UP (add UI, become a full platform like Dify) or move RIGHT (go deeper on the infrastructure layer, become the best MCP server collection).

---

## Strategic Decision: Go DEEPER, Not Wider

**Recommendation: Stay in the Infrastructure quadrant. Go RIGHT.**

**Why:**
1. EAGLES' zero-cost model (family team, Azure credits) cannot sustain a UI platform competing with Dify (114K stars, funded startup) or n8n (181K stars, $60M raised)
2. The MCP infrastructure layer is where EAGLES has **unique differentiation** (drift detection, SonaLearning, prerequisite DAG)
3. SKILL.md conversion makes the 62 skills discoverable without building a marketplace
4. HTTP transport + A2A makes EAGLES servers consumable by ANY platform (Dify, CrewAI, LangGraph)

**The play: Make EAGLES the best MCP server collection that any platform can consume.**

---

## Phased Roadmap

### Phase 1: Standards Compliance (Week 1-2) — SKILL.md + Server Cards

| Task | Effort | Impact |
|------|--------|--------|
| Convert 62 skills from TS graph nodes to SKILL.md format | 2 days | Skills discoverable by 11 tools, publishable to SkillsMP |
| Add `.well-known/mcp-server-card.json` to each server | 1 day | Registry discovery without connecting |
| Submit to modelcontextprotocol/registry | 1 day | Public namespace ownership |
| Submit top skills to verified-skill.com | 1 day | Security certification (3 tiers) |

### Phase 2: Observability (Week 2-3) — OpenTelemetry + Self-Query

| Task | Effort | Impact |
|------|--------|--------|
| Add `@opentelemetry/sdk-node` spans to all 7 MCP servers | 3 days | Compatible with Langfuse/Phoenix/Jaeger/Grafana |
| Add 4 self-query tools to drift-detector | 1 day | Claude can course-correct mid-session |
| Add cost-per-commit in Stop hook | 0.5 day | ROI tracking per commit |
| Add DORA metrics tools to token-tracker | 1 day | Delivery measurement |

### Phase 3: Transport + Federation (Week 3-4) — HTTP + A2A

| Task | Effort | Impact |
|------|--------|--------|
| Add Streamable HTTP to token-tracker, vector-memory, orchestrator | 3 days | Remote access, container deployment |
| Implement A2A Agent Cards for orchestrator | 2 days | Federation with CrewAI/LangGraph/AutoGen agents |
| Add namespace scoping (tool visibility per agent) | 1 day | Multi-agent isolation |

### Phase 4: Intelligence (Week 4-6) — Code Graph + Eval + Judge

| Task | Effort | Impact |
|------|--------|--------|
| Add AST-aware code indexing (tree-sitter) to vector-memory | 3 days | Structural code search, 40% token reduction |
| Add LLM-as-judge PostToolUse hook | 2 days | Automatic output quality gate |
| Integrate promptfoo for skill prompt red teaming | 1 day | OWASP LLM Top 10 scanning |
| Add RAGAS-style quality metrics to verification MCP | 2 days | Faithfulness, hallucination rate |

### Phase 5: Advanced (Week 6-8) — ML Routing + Temporal Memory + Wave Chain

| Task | Effort | Impact |
|------|--------|--------|
| Train ML router on provider-router history data | 3 days | 85% cost reduction (RouteLLM pattern) |
| Add temporal fact validity to vector-memory | 2 days | "True from X to Y" knowledge |
| Add autonomous wave-chaining to orchestrator | 3 days | Multi-hour unattended execution |
| Add pre-implementation spec approval gate | 1 day | Spec-first enforcement |

---

## What EAGLES Should NOT Build

| Capability | Why Not | Use Instead |
|------------|---------|-------------|
| Visual UI dashboard | High effort, funded competitors dominate | Langfuse/Grafana via OTLP export |
| 400+ app connectors | n8n (181K stars) already does this | n8n MCP integration |
| No-code workflow builder | Dify/Flowise own this space | Focus on code-first MCP |
| Full browser automation | playwright-mcp (30K stars) is official | Register playwright-mcp as external |
| Vector database engine | Qdrant (30K stars) is production-grade | Replace hnswlib with Qdrant client |
| Prompt management UI | PromptLayer/Langfuse handle this | Export prompts to SKILL.md |

---

## Key Repos to Watch

| Repo | Stars | Why |
|------|-------|-----|
| anthropics/skills | 73K | THE standard. EAGLES must comply. |
| a2aproject/A2A | 22.9K | Google-backed agent federation. Will be mandatory. |
| modelcontextprotocol/registry | 6.6K | Public discovery. EAGLES must register. |
| traceloop/openllmetry | 7K | MCP-specific OTel instrumentation package exists. |
| lm-sys/RouteLLM | ~7K | ML routing is the next evolution of provider-router. |
| getzep/graphiti | 23K | Temporal memory is the next evolution of vector-memory. |
| lastmile-ai/mcp-eval | 20 | Early but correct: real-environment MCP testing. |

---

## Success Metrics After Roadmap Execution

| Metric | Current | Target |
|--------|---------|--------|
| Skills discoverable by external tools | 0 | 62 (all SKILL.md) |
| MCP servers in public registry | 0 | 7 |
| Transport protocols | stdio only | stdio + HTTP |
| Federation protocols | none | A2A Agent Cards |
| Observability backends supported | 0 | Any OTLP-compatible |
| Eval metrics (faithfulness, hallucination) | 0 | 4+ metrics |
| ML-trained routing | No | Yes (85% cost target) |
| Autonomous wave duration | Manual trigger | 2-3 hours unattended |
| Security scanning | Manual | CI-automated (promptfoo) |

---

## Decision

**Adopt the "Best Infrastructure Layer" strategy:**
1. Phase 1 (SKILL.md) is non-negotiable and immediate
2. Phase 2 (OTLP) unlocks enterprise observability without building a UI
3. Phase 3 (HTTP + A2A) makes EAGLES consumable by any platform
4. Phases 4-5 deepen the moat (code intelligence, ML routing, temporal memory)

**Do NOT build a UI platform. Do NOT build a marketplace. Make EAGLES the MCP server collection that every platform wants to integrate.**

---

## Sources

Full source lists from each research agent are archived in the agent output files. Key references:

- [Anthropic Agent Skills](https://www.anthropic.com/engineering/equipping-agents-for-the-real-world-with-agent-skills) | [agentskills.io](https://agentskills.io)
- [MCP 2026 Roadmap](http://blog.modelcontextprotocol.io/posts/2026-mcp-roadmap/)
- [DORA 2025 Report](https://dora.dev/research/2025/dora-report/)
- [A2A Protocol](https://github.com/a2aproject/A2A) | [Google ADK Patterns](https://www.infoq.com/news/2026/01/multi-agent-design-patterns/)
- [RouteLLM](https://github.com/lm-sys/RouteLLM) | [Graphiti](https://github.com/getzep/graphiti)
- [OpenLLMetry](https://github.com/traceloop/openllmetry) | [Langfuse](https://github.com/langfuse/langfuse)
- [Ruflo](https://github.com/ruvnet/ruflo) | [Everything Claude Code](https://github.com/affaan-m/everything-claude-code)
- [SpecWeave Verified Skills](https://spec-weave.com/docs/skills/verified/verified-skills/)
- [Snyk ToxicSkills Study](https://spec-weave.com/docs/guides/why-verified-skill-matters/) — 36.82% of public skills have security flaws
- [Anthropic 2026 Agentic Coding Trends](https://resources.anthropic.com/2026-agentic-coding-trends-report)
- [Context Engineering — Martin Fowler](https://martinfowler.com/articles/exploring-gen-ai/context-engineering-coding-agents.html)
