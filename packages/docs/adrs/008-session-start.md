# ADR-008: Session-Start Contract

**Date**: 2026-04-05 | **Status**: Proposed | **Authors**: Hatim Hajji, Claude Opus 4.6

> Full ADR at `docs/ADR-008-SESSION-START-CONTRACT.md`
> Supersedes: n/a | Related: ADR-006, ADR-007

---

## Summary

EAGLES AI Platform has 6 MCP servers, 52+ tools, 62 skills, a DAG task queue, a Decomposer, a Scheduler, SonaLearning patterns, and a vector memory store. Even the platform's own builder bypasses it. This ADR defines a **mechanical hard-stop enforcement** contract to prevent that.

---

## The Problem

In the session of 2026-04-05, immediately after porting `DagTaskQueue`, `Decomposer`, and `Scheduler`, Claude Code reached for `Edit`/`Write` directly for a multi-file task — without calling `task_create` or routing through the orchestrator.

This is the same failure mode as **MEMORY.md Lesson 1** (Prompt Library bypassed):

- `PROMPT_PROD_READY.md` had 0 `get_prompt()` calls, 0 `start_workflow()` calls.
- The library was entirely bypassed in favor of familiar manual patterns.

**Root causes:**
1. No mechanical gate — nothing blocks the manual path.
2. Invisible capability surface — 62 skills and 52 tools are not auto-surfaced.
3. No bypass telemetry — silent failures, no signal to correct course.
4. Optional > default — orchestrator is opt-in, so it is never chosen under time pressure.
5. Stale MCP state — newly-wired tools don't load until a VS Code restart.

---

## Decision: Option C — Hybrid Hard-Stop

**User's directive**: Hard-stop enforcement (confidence 85% vs. 65% for nudge-only).

The chosen approach combines three layers:

| Layer | Mechanism | When |
|-------|-----------|------|
| **SessionStart** | Inject EAGLES capability surface + top SonaLearning patterns | Every session |
| **UserPromptSubmit** | Prepend SonaLearning recall for the current task type | Every prompt |
| **PreToolUse hard-stop** | Block `Edit`/`Write`/`MultiEdit` at N=4 mutations without a prior `task_create` | Mutation #5+ |

---

## The 4 Hooks

### Hook 1: SessionStart — Capability Injection

Fires at session start. Injects:
- Platform version and available MCP server list
- Top 3 SonaLearning patterns (by EMA score)
- Routing rule: "For tasks touching 2+ files or 3+ tool calls, call `task_create` first"

### Hook 2: UserPromptSubmit — SonaLearning Recall

Fires before every user prompt is processed. Prepends:
- Relevant SonaLearning patterns matched to the prompt's detected task type
- Active task context if a DAG task is in flight

### Hook 3: PreToolUse — Hard-Stop Enforcement

Fires before every `Edit`, `Write`, or `MultiEdit` call.

- Reads session mutation counter from SQLite (TaskStore)
- If counter < N=4: increment and allow
- If counter >= N=4 AND no `mcp__orchestrator__task_create` recorded this session: **exit code 2**
- Error message: explains the block, links to `task_create` usage, provides escape hatch syntax

**Escape hatch**: User may prefix their prompt with `[SINGLE-FILE]` to reset the counter for that operation. Logged to bypass telemetry.

### Hook 4: PostToolUse — Bypass Telemetry

Fires after every `Edit`/`Write`/`MultiEdit`. Records:
- Was a `task_create` called this session? (yes/no)
- Mutation tool name and file path
- Session ID and timestamp

Data feeds SonaLearning's bypass-rate metric.

---

## Decision Drivers

| # | Driver |
|---|--------|
| D1 | Multi-step tasks MUST route through orchestrator — self-dogfooding is the credibility test |
| D2 | Single-file genuine edits MUST remain fast — no bureaucracy on trivial workflows |
| D3 | Hook latency must be < 1 second (global CLAUDE.md rule) |
| D4 | Escape hatch required — user can override when orchestration is overkill |
| D5 | Fail-open on orchestrator crash — a broken platform must not brick Claude Code |
| D6 | Bypass detection must be observable — silent bypass is the original disease |
| D7 | SonaLearning patterns must be auto-injected — without recall, past lessons are wasted |
| D8 | 62 skills must be discoverable without hallucination |
| D9 | State must survive between tool calls — threshold counting requires persistence |

---

## Consequences

**Positive:**
- Multi-file tasks are mechanically routed through the DAG — platform self-dogfoods.
- Bypass rate becomes a measurable metric, visible in SonaLearning.
- Past lessons are recalled at session start rather than silently forgotten.

**Negative:**
- Hook 3 will produce false-positive blocks on legitimate rapid single-file editing sessions.
- Requires `[SINGLE-FILE]` prefix training — adds friction for new team members.
- Hook 2 adds ~200ms latency to every prompt (SQLite pattern lookup).

**Neutral:**
- N=4 threshold is a hypothesis. Will be tuned based on bypass telemetry data after 2 weeks.
