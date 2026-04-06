# ADR-006: Competitive Gap Analysis

**Date**: 2026-03-31 | **Status**: Proposed | **Authors**: Hatim Hajji, Claude Opus 4.6

> Full ADR at `docs/ADR-006-COMPETITIVE-GAP-ANALYSIS.md`

---

## Summary

5 parallel research agents analyzed 150+ repos across the MCP ecosystem, AI dev infrastructure, Claude Code tooling, and 2026 trends. EAGLES AI Platform has unique strengths no single competitor replicates — but 22 gaps were identified across 6 severity tiers.

## Research Scope

| Agent | Scope | Repos |
|-------|-------|-------|
| MCP Ecosystem | Servers, gateways, registries, protocols | 35 |
| AI Dev Infrastructure | LangChain, CrewAI, Dify, DSPy, Langfuse | 58 |
| Claude Code Tools | oh-my-claudecode, Ruflo, SuperClaude, claudewatch | 65+ |
| Emerging Trends 2026 | SKILL.md, MCP v1.27, LLM-as-Judge, context engineering | 14 |
| EAGLES Inventory | Every tool, store, hook, skill, script — source-verified | Full |

## EAGLES Unique Strengths

- **Drift Detection** — 5-metric scoring (coverage, test health, file churn, token efficiency, scope creep) with EMA trends. No competitor chains all 5.
- **SonaLearning** — EMA-scored pattern engine with auto-archive below 20% success rate.
- **Token-to-Verification Pipeline** — `record_token_usage` → `drift_checkpoint` → `verify_output` → `verify_receipt_write`. No competitor chains all 4 stages.
- **Prerequisite DAG** — 62 skills with AND/OR prerequisites and DFS cycle detection.
- **12 SQLite Stores (WAL)** — Single-process, zero-network, cross-MCP event bus.
- **French HR Compliance** — SMIC, CDI/CDD, CPF, OPCO, RNCP, CNIL/GDPR baked into skills. Zero competitors address French HR.

## The 22 Gaps — By Tier

### Tier 1: Critical (4 gaps)

| Gap | Description |
|-----|-------------|
| **SKILL-FORMAT** | 62 skills in proprietary TS format, not SKILL.md. Invisible to 500K+ marketplace skills, incompatible with 11 AI tools. Anthropic's `skills` repo has 73K stars. |
| **NO-UI** | Zero visual layer. Every enterprise competitor (Archestra, IBM ContextForge, Langfuse, Dify) ships a dashboard. |
| **NO-A2A** | Agents isolated in SQLite bus, cannot federate externally. `a2aproject/A2A` has 22.9K stars, Google-backed, Linux Foundation. |
| **STDIO-ONLY** | All 7 MCP servers run local stdio only. No remote access, no container deployment. |

### Tier 2: High (8 gaps)

| Gap | Description |
|-----|-------------|
| **NO-OTEL** | Flat SQLite events, no structured traces/spans, no OTLP export (OpenLLMetry: 7K stars). |
| **NO-CODE-GRAPH** | Vector store uses semantic similarity only, no AST-aware structural code analysis. |
| **RULE-ROUTING** | Provider routing uses static rules, not ML classifiers. RouteLLM claims 85% cost reduction. |
| **NO-EVAL** | No faithfulness/hallucination metrics on LLM output (RAGAS: 25K, DeepEval: 5K). |
| **NO-JUDGE-GATE** | No automatic LLM-as-judge on agent output before it reaches the developer. |
| **NO-SANDBOX** | All tools execute in host process with no isolation (E2B uses Firecracker microVMs). |
| **NO-IAM** | No authentication layer — any stdio process invokes any tool. |
| **NO-WAVE-CHAIN** | Each orchestration wave requires a human trigger. |

### Tier 3: Medium (7 gaps)

Temporal memory validity windows, automated red teaming, DORA metrics, skills catalog size, automated PR hooks, document ingestion pipeline, self-query tools for drift state.

### Tier 4: Low / Tier 5–6 (3 gaps)

Offline capability, multi-language localization, changelog automation.

## Decision

Accept the analysis. Gaps are ranked. Priority order: SKILL-FORMAT → NO-UI → NO-A2A → NO-OTEL → NO-EVAL.
