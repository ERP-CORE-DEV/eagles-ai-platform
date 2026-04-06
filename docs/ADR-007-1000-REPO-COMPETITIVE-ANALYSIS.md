# ADR-007: EAGLES AI Platform — 863-Repo Deep Competitive Analysis

**Date**: 2026-03-31
**Status**: Approved
**Authors**: Hatim Hajji (Lead), Claude Opus 4.6 (30 parallel research agents)
**Scope**: 863 repos across 25 categories, 30 parallel agents (25 completed, 5 timed out)

---

## Executive Summary

30 research agents scanned GitHub and the web in parallel across 25 completed categories. **863 unique repos** were catalogued, ranging from 5-star niche tools to 182K-star platforms. The analysis confirms EAGLES AI Platform has **unique strengths no single competitor replicates** (drift detection + SonaLearning + prerequisite DAG + token-to-verification pipeline), but has **40+ gaps** across 12 severity tiers.

**The three most critical gaps:**
1. **SKILL.md format** — 62 skills in proprietary TS, invisible to 500K+ marketplace. Industry standard adopted by Anthropic (107K stars), OpenAI, Microsoft, GitHub, Cursor.
2. **Zero security layer** — no prompt injection detection, no output guardrails, no red teaming, no policy engine, no fairness audit on matching engine
3. **Flat orchestration** — no DAG workflows, no parallel execution, no durable state, no crash recovery. Every competitor uses graph-based workflows.

---

## Research Scale

| Metric | Count |
|--------|-------|
| Parallel agents launched | 30 |
| Agents completed | 25 |
| Agents timed out | 5 (gateways, observability, spec-driven, protocols, DevEx) |
| Unique repos catalogued | 863 |
| Categories covered | 25 |
| Total combined stars analyzed | ~4.2M |
| Highest-star repo found | n8n (182K) |
| Research duration | ~45 minutes |

### Agents Completed (25/30)

| # | Agent | Repos | Key Finding |
|---|-------|-------|-------------|
| 01 | MCP Servers Top 50 | 50 | azure-devops-mcp directly relevant to our CI/CD |
| 03 | MCP Registries | 25 | 25 registries exist; EAGLES visible in 0 |
| 04 | Claude Code Extensions | 63 | 95% context compression exists (Continuous-Claude-v3) |
| 05 | Claude Hooks/Skills | 47 | SKILL.md is cross-industry standard (13 platforms) |
| 06 | Python Frameworks | 50 | LangGraph checkpointing = the orchestration standard |
| 07 | TS/JS Frameworks | 34 | Mastra = closest architectural sibling to EAGLES |
| 08 | .NET/Java/Go | 28 | Semantic Kernel entering maintenance → Agent Framework |
| 09 | Orchestration | 38 | 8 orchestration patterns EAGLES has 0% of |
| 10 | Coding Assistants | 35 | Goose "Recipes" = reusable workflows EAGLES should adopt |
| 12 | LLM Eval | 37 | 3 MCP-specific eval tools exist for EAGLES' servers |
| 13 | AI Memory | 35 | FTS5 hybrid = 1-2 day upgrade, biggest bang-for-buck |
| 14 | RAG Frameworks | 40+ | Zero document ingestion in EAGLES |
| 15 | Vector DBs | 25 | sqlite-vec drops into existing better-sqlite3 stack |
| 16 | Code Review | 27 | PR-Agent (10.7K) = self-hostable, BYO LLM |
| 17 | Test Generation | 30 | Stryker mutation testing = validate 1,021 tests catch bugs |
| 18 | AI Security | 34 | ZERO coverage in 6/9 security categories |
| 19 | Prompt Engineering | 34 | DSPy compiles prompts; EAGLES prompts are static strings |
| 20 | Workflow Automation | 30 | Activepieces: every connector = MCP server simultaneously |
| 21 | LLM Routing | 28 | LiteLLM's built-in features are NOT activated |
| 22 | Context Engineering | 27 | 15 MCP servers may consume 150K+ tokens in tool defs alone |
| 25 | Self-Hosted LLM | 30 | LMCache = 3-15x TTFT reduction, pip install on existing vLLM |
| 27 | Knowledge Graphs | 28 | Docling (MIT, MCP-native) for CV/HR document parsing |
| 28 | Sandboxes | 24 | ALL 7 MCP servers run in host process, zero isolation |
| 29 | IDE/LSP Bridges | 25 | One command: `/plugin marketplace add` = 23-language LSP |
| 30 | Emerging 2026 | 35+ | 14 NEW architectural patterns exclusive to 2025-2026 |

---

## The 40 Gaps — Master Matrix

### TIER 1: CRITICAL (Blocks competitiveness or poses security risk)

| # | Gap | EAGLES Today | Best Reference | Stars | Effort |
|---|-----|-------------|----------------|-------|--------|
| 1 | **No SKILL.md format** | 62 skills in proprietary TS | anthropics/skills + agentskills spec | 107K + 14.6K | Medium |
| 2 | **No prompt injection detection** | Hooks can block but no detection logic | protectai/rebuff (self-hardening) | 1.5K | Low |
| 3 | **No output guardrails** | Zero LLM output validation | guardrails-ai/guardrails | 6.6K | Medium |
| 4 | **No red teaming pipeline** | Zero adversarial testing | promptfoo + NVIDIA/garak | 18.8K + 7.4K | Low |
| 5 | **No DAG workflow engine** | Flat task list, no graph | LangGraph (checkpointing) | 28K | High |
| 6 | **No durable execution** | Process dies = all tasks lost | LangGraph + Temporal | 28K + 19.2K | High |
| 7 | **No agent privilege model** | Any agent calls any tool | MS agent-governance-toolkit + OPA | 348 + 11.5K | Medium |
| 8 | **No fairness audit on matching engine** | Scores candidates with zero anti-discrimination check | MS responsible-ai-toolbox | 1.7K | Medium |
| 9 | **Zero sandbox isolation** | All 7 MCP servers in host process | E2B + Wassette (WASM MCP) | 11.5K + 869 | High |

### TIER 2: HIGH (Significant competitive disadvantage)

| # | Gap | EAGLES Today | Best Reference | Stars | Effort |
|---|-----|-------------|----------------|-------|--------|
| 10 | **No OpenTelemetry tracing** | Flat SQLite events | openllmetry + claude-code-otel | 7K + 324 | Medium |
| 11 | **No code-graph/AST search** | Text-only HNSW vectors | claude-context (BM25+dense) + hex-graph | 5.8K | Medium |
| 12 | **Rule-based routing only** | Static rules in provider-router | RouteLLM (ML-trained, 85% cost cut) | 4.5K | High |
| 13 | **No eval metrics** | Verification = pass/fail only | deepeval (50+ metrics) + ragas | 14.3K + 13.2K | Medium |
| 14 | **No LLM-as-judge gate** | Manual @verifier invocation | PostToolUse hook + lightweight judge | — | Medium |
| 15 | **No MCP-specific eval** | 7 servers, zero benchmarks | mcp-bench + mcp-evals | 464 + 127 | Low |
| 16 | **No document ingestion** | Vector store requires manual embedding | Docling (MIT, MCP server) | 56.8K | Medium |
| 17 | **No hybrid BM25+dense search** | HNSW pure-ANN only | sqlite-vec + FTS5 | 7.1K | Low |
| 18 | **No temporal memory** | No fact validity windows | Graphiti/Zep (valid_at/invalid_at) | 24.4K | Medium |
| 19 | **No parallel agent execution** | Sequential task processing | Swarms ConcurrentWorkflow + DeerFlow | 6.2K + 45K | High |
| 20 | **No autonomous wave-chaining** | Human triggers each wave | Aider auto-commit loop + SpecWeave sw:auto | 42.5K | High |
| 21 | **Static prompt templates** | No optimization, versioning, testing | DSPy (compiled prompts) + promptfoo | 33.2K + 18.8K | Medium |
| 22 | **No PII scanning on LLM I/O** | AnonymizeXxx on models only | Microsoft Presidio | 7.4K | Medium |
| 23 | **No KV cache reuse** | Cold vLLM starts | LMCache (pip install on existing vLLM) | 7.8K | Low |

### TIER 3: MEDIUM (Competitive gap, not blocking)

| # | Gap | EAGLES Today | Best Reference | Stars | Effort |
|---|-----|-------------|----------------|-------|--------|
| 24 | **No user/agent namespace scoping** | Single flat memory space | mem0 tri-store (user/session/agent) | 51.5K | Low |
| 25 | **No FTS5 keyword fallback** | Pure vector search only | engram + MemOS (SQLite FTS5) | 2.1K + 8K | Low |
| 26 | **No memory type tags** | All memories treated equal | kuzu-memory (6 types + per-type TTL) | 21 | Low |
| 27 | **No self-learning feedback loop** | Sessions start cold | claude-reflect (corrections → CLAUDE.md) | 867 | Medium |
| 28 | **No mutation testing** | 1,021 tests, zero mutation score | Stryker.NET + Stryker.JS | 2K + 2.8K | Low |
| 29 | **No automated PR review** | Manual @code-reviewer | PR-Agent (self-hostable, BYO LLM) | 10.7K | Low |
| 30 | **No DORA delivery metrics** | Token cost tracking only | DORA 2025 report metrics | — | Low |
| 31 | **No cost-per-commit** | Session cost only | claudewatch (git correlation) | — | Low |
| 32 | **No typed hook interfaces** | 4 untyped Python hooks | cc-hooks-ts (defineHook API) | 37 | Low |
| 33 | **No context compression** | Compaction reminder warns only | Continuous-Claude-v3 (95% reduction) | 3.6K | High |
| 34 | **No repo-map** | No codebase structure awareness | Aider PageRank over tree-sitter | 42.6K | Medium |
| 35 | **No tool definition budget check** | 15 MCPs may eat 150K+ tokens | omamori (static analyzer) | ~100 | Low |
| 36 | **No hierarchical delegation** | Flat task_assign | CrewAI role/goal/backstory | 46K | Medium |

### TIER 4: LOW (Nice to have)

| # | Gap | Best Reference | Stars |
|---|-----|----------------|-------|
| 37 | No voice I/O | voicemode (local Whisper+Kokoro) | 932 |
| 38 | No desktop GUI | Opcode (Tauri+React) | 21.2K |
| 39 | No cross-tool config sync | rulesync (CLAUDE.md → Cursor/Copilot) | ~600 |
| 40 | No autocomplete layer | Fast 1.5B model unused | — |

---

## Top 20 Repos EAGLES Should Integrate (Prioritized)

### Immediate (This Week, Zero/Low Cost)

| # | Action | Tool | Effort |
|---|--------|------|--------|
| 1 | Activate LiteLLM fallback chains + virtual keys | Already installed | 0 (config change) |
| 2 | Install claude-code-lsps plugin | `/plugin marketplace add` | 1 command |
| 3 | Add FTS5 to vector-memory | SQLite built-in extension | 1-2 days |
| 4 | Add user/agent namespace scoping | Schema change | 1 day |
| 5 | Add memory type tags + TTL | Schema change | 1 day |
| 6 | Run omamori tool-definition budget check | Static analyzer | 1 hour |
| 7 | Add Stryker.NET + Stryker.JS to CI | `dotnet stryker` + `npx stryker` | 1 day |
| 8 | Install LMCache on vLLM | `pip install lmcache` | 1 day |

### Short-Term (Next 2 Sprints)

| # | Action | Tool | Effort |
|---|--------|------|--------|
| 9 | Add rebuff prompt injection to PreToolUse hook | `pip install rebuff` | 2 days |
| 10 | Add promptfoo red-team to Azure DevOps pipeline | YAML CI gate | 2 days |
| 11 | Add valid_at/invalid_at temporal memory | Schema + query_as_of tool | 3 days |
| 12 | Convert 62 skills to SKILL.md format | YAML frontmatter + MD | 3 days |
| 13 | Add deepeval pytest assertions to MCP tests | `pip install deepeval` | 3 days |
| 14 | Add Docling MCP server for document ingestion | MIT, MCP-native | 3 days |
| 15 | Add typed hooks via cc-hooks-ts | `pnpm add cc-hooks-ts` | 2 days |

### Medium-Term (Next Quarter)

| # | Action | Tool | Effort |
|---|--------|------|--------|
| 16 | Implement DAG task graph in orchestrator | LangGraph checkpoint pattern | 2 weeks |
| 17 | Add AST-aware code indexing (tree-sitter) | claude-context pattern | 2 weeks |
| 18 | Add OPA policy engine for agent authorization | Rego policies | 1 week |
| 19 | Add MS Presidio PII scanning on LLM I/O | Pipeline middleware | 1 week |
| 20 | Train ML router on provider-router history | RouteLLM BERT classifier | 2 weeks |

---

## What EAGLES Already Does Better Than Anyone

| Strength | Details | Nearest Competitor |
|----------|---------|-------------------|
| **5-metric drift detection** | Coverage + test health + file churn + token efficiency + scope creep with EMA trends | claudewatch has basic drift alerts only |
| **SonaLearning pattern engine** | EMA-scored patterns with auto-archive below 20% | Ruflo SONA claims similar but unverified |
| **Prerequisite DAG with cycle detection** | 62 skills with AND/OR prerequisites, DFS validation | Microsoft/skills has no typed prerequisite graph |
| **Token-to-verification pipeline** | record → drift_checkpoint → verify_output → receipt_write | No competitor chains all 4 stages |
| **French HR compliance baked in** | SMIC, CDI/CDD, CPF, OPCO, RNCP, CNIL/GDPR in skills | Zero competitors address French HR |
| **Zero-cost financial model** | Family team + Azure credits = ~99% gross margin | Every competitor is a funded startup burning cash |
| **12 SQLite WAL stores** | Single-process, zero-network, cross-MCP event bus | Most use Redis/Postgres (heavier ops) |

---

## Strategic Positioning

```
EAGLES occupies a UNIQUE position:
- More infrastructure depth than any Claude Code extension
- More domain specificity (French HR) than any generic platform
- Zero burn rate vs funded competitors
- But invisible to the ecosystem (no SKILL.md, no registry, no marketplace)

The play: Stay private, go deeper internally.
- Fix security gaps (critical for HR data)
- Fix orchestration (DAG + durable execution)
- Fix memory (FTS5 + temporal + namespaces)
- Fix eval (mutation testing + deepeval + MCP benchmarks)
- Activate LiteLLM features already installed
- Add LMCache to existing vLLM (pip install)
```

---

## Appendix: Star Count Hall of Fame (Top 30 by Stars)

| Repo | Stars | Category |
|------|-------|----------|
| n8n-io/n8n | 182K | Workflow |
| ollama/ollama | 152K | LLM Infra |
| langflow-ai/langflow | 146K | Workflow |
| langgenius/dify | 135K | Platform |
| obra/superpowers | 126K | Skills |
| everything-claude-code | 120K | Claude Extensions |
| open-webui/open-webui | 109K | LLM UI |
| comfyanonymous/ComfyUI | 107K | Workflow |
| anthropics/skills | 107K | Skills Standard |
| langchain-ai/langchain | 97K | Framework |
| google-gemini/gemini-cli | 90K | Coding Agent |
| ggml-org/llama.cpp | 86K | LLM Infra |
| punkpeye/awesome-mcp-servers | 81K | MCP Registry |
| modelcontextprotocol/servers | 82.5K | MCP Reference |
| vllm-project/vllm | 74.8K | LLM Infra |
| infiniflow/ragflow | 76.6K | RAG |
| PaddlePaddle/PaddleOCR | 73.6K | Document AI |
| openai/codex | 67K | Coding Agent |
| camel-ai/camel | 65K | Multi-Agent |
| OpenHands/OpenHands | 62K | Coding Agent |
| cline/cline | 59.7K | IDE Agent |
| open-interpreter | 58K | Computer Use |
| MetaGPT | 58K | Multi-Agent |
| zylon-ai/private-gpt | 57K | RAG |
| docling-project/docling | 56.8K | Document AI |
| microsoft/autogen | 56.5K | Multi-Agent |
| upstash/context7 | 51K | Context |
| mem0ai/mem0 | 51.5K | Memory |
| Flowise | 51.3K | Workflow |
| browser-use | 50K+ | Browser Agent |

---

## Sources

Full source lists archived in each agent's output file at:
`C:\Users\hatim\AppData\Local\Temp\claude\c--rh-optimerp-sourcing-candidate-attraction\2c292874-5d79-4d25-baad-e221f64ddd63\tasks\`

Each agent report contains 30-90 verified source URLs. Total: ~1,200+ unique source references across all 25 agents.
