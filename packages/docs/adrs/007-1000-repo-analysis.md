# ADR-007: 1000-Repo Deep Competitive Analysis

**Date**: 2026-03-31 | **Status**: Approved | **Authors**: Hatim Hajji, Claude Opus 4.6

> Full ADR at `docs/ADR-007-1000-REPO-COMPETITIVE-ANALYSIS.md`

---

## Summary

30 parallel research agents scanned GitHub and the web across 25 categories. **863 unique repos** were catalogued (5 agents timed out). EAGLES' unique architecture is confirmed — but **40 gaps** were found across 12 severity tiers. The three most critical: no SKILL.md format, no security layer, and flat (non-DAG) orchestration.

## Research Scale

| Metric | Value |
|--------|-------|
| Parallel agents launched | 30 |
| Agents completed | 25 |
| Agents timed out | 5 (gateways, observability, spec-driven, protocols, DevEx) |
| Unique repos catalogued | 863 |
| Categories covered | 25 |
| Total combined stars analyzed | ~4.2M |
| Highest-star repo found | n8n (182K) |
| Research duration | ~45 minutes |

## Key Agent Findings

| Agent | Key Finding |
|-------|-------------|
| MCP Servers Top 50 | `azure-devops-mcp` directly relevant to our CI/CD |
| Claude Code Extensions | 95% context compression exists (Continuous-Claude-v3) |
| Claude Hooks/Skills | SKILL.md is cross-industry standard — 13 platforms have adopted it |
| Python Frameworks | LangGraph checkpointing is the orchestration standard |
| TS/JS Frameworks | Mastra is the closest architectural sibling to EAGLES |
| Orchestration | 8 orchestration patterns; EAGLES covers 0% of them |
| LLM Eval | 3 MCP-specific eval tools exist for EAGLES' servers |
| AI Memory | FTS5 hybrid search: 1–2 day upgrade, biggest bang-for-buck |
| AI Security | ZERO coverage in 6 of 9 security categories |
| Context Engineering | 15 MCP servers may consume 150K+ tokens in tool defs alone |

## The 40 Gaps — Top 12 (Tier 1: Critical)

| # | Gap | EAGLES Today | Best Reference |
|---|-----|-------------|----------------|
| 1 | No SKILL.md format | 62 skills in proprietary TS | anthropics/skills (107K stars) |
| 2 | No prompt injection detection | Hooks block but don't detect | protectai/rebuff (1.5K) |
| 3 | No output guardrails | Zero LLM output validation | guardrails-ai/guardrails (6.6K) |
| 4 | No red teaming pipeline | Zero adversarial testing | promptfoo + NVIDIA/garak |
| 5 | No DAG workflow engine | Flat task list, no graph | LangGraph (28K stars) |
| 6 | No durable execution | Process dies = all tasks lost | LangGraph + Temporal (19.2K) |
| 7 | No agent privilege model | Any agent calls any tool | MS agent-governance-toolkit + OPA |
| 8 | No fairness audit on matching engine | Zero anti-discrimination checks | MS responsible-ai-toolbox (1.7K) |
| 9 | Zero sandbox isolation | All 7 MCP servers in host process | E2B (11.5K) |
| 10 | No context window management | Full tool defs always loaded | Continuous-Claude-v3 (context compression) |
| 11 | No MCP registry presence | EAGLES visible in 0 of 25 registries | MCPJungle, mcp.so, pulsemcp |
| 12 | No self-hosted LLM integration | Relies on cloud APIs only | LMCache (3–15x TTFT reduction) |

## Tier 2–12 Summary (28 additional gaps)

**Tier 2 (High)**: No HTTP transport (STDIO-only), no A2A federation, no OpenTelemetry, no code graph / AST indexing, no PR review automation, no document ingestion pipeline.

**Tier 3 (Medium)**: Static rule routing (vs. ML), no LLM-as-judge gate, no temporal memory windows, no DORA metrics, no mutation testing, no IDE/LSP bridge.

**Tier 4–12**: Offline mode, multi-language localization, changelog automation, plugin marketplace, CI report cards, community forum, 12-factor app compliance, REST fallback, observability dashboard.

## Architectural Conclusions

1. EAGLES' SQLite WAL + prerequisite DAG combination is genuinely novel — no competitor replicates it.
2. The DAG workflow engine gap is now partially closed by `DagTaskQueue` + `Scheduler` (ported 2026-04-05).
3. SKILL.md conversion remains the highest-leverage single action — unlocks 500K+ marketplace skills.
4. Security coverage is the most dangerous gap — 6 of 9 categories have zero coverage.

## Decision

Approved. Gaps feed Phase 5 roadmap. Priority order matches ADR-006 with additions: security layer → DAG completion → SKILL.md → registry presence → HTTP transport.
