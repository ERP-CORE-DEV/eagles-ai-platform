# ADR-008: Session-Start Contract — Mechanical Enforcement of EAGLES Orchestration

**Date**: 2026-04-05
**Status**: Proposed
**Authors**: Hatim Hajji (Lead), Claude Opus 4.6 (Architect)
**Supersedes**: n/a
**Related**: ADR-006 (Competitive Gap Analysis), ADR-007 (1000-Repo Competitive Analysis)

---

## 1. Status

**Proposed** — pending user review and Phase 5 implementation.

---

## 2. Context

The EAGLES AI Platform contains 6 MCP servers, 52+ tools, 62 skills, a DAG task queue, a Decomposer, a Scheduler, a MessageBus, SonaLearning patterns, and a vector memory store. It represents ~9 months of architectural work and 1,021+ tests.

**The problem**: even the platform's own builder bypasses it.

In the session of 2026-04-05 (see `sessions/2026-04-05_EAGLES-port-and-activation.md`), immediately after porting `DagTaskQueue`, `Decomposer`, and `Scheduler`, Claude Code proceeded to a multi-file test-fix task and reached for `Edit`/`Write` directly. The user explicitly challenged: *"are you using now new eagles ai platform with new DAG?"* Honest answer: **No**.

This matches **MEMORY.md Lesson 1** — the "Prompt Library bypassed" anti-pattern, now repeated at the platform level:

- PROMPT_PROD_READY.md had 0 `get_prompt()` calls, 0 `start_workflow()` calls. The library was entirely bypassed.
- Same failure mode here: DagTaskQueue exists, is tested, is wired — and is ignored in favor of familiar manual patterns.

**Root causes identified**:

1. **No mechanical gate** — nothing blocks the manual path, so Claude defaults to it.
2. **Invisible capability surface** — 62 skills, 52 tools, 20 workflow templates are not auto-surfaced at session start.
3. **No bypass telemetry** — silent failures, no signal to correct course.
4. **Optional > default** — the orchestrator is opt-in, so it is never chosen under time pressure.
5. **Stale MCP state** — newly-wired tools (`task_build_decomposition_prompt`, `agent_message_send`) don't load into the running Claude Code process until a VS Code restart.

**User's directive**: HARD-STOP ENFORCEMENT chosen over nudge-based approaches (confidence 85% vs 65%).

---

## 3. Decision Drivers

| # | Driver | Rationale |
|---|--------|-----------|
| D1 | Multi-step tasks MUST route through orchestrator | Self-dogfooding is the credibility test for the platform |
| D2 | Single-file genuine edits MUST remain fast | Don't break trivial workflows with bureaucracy |
| D3 | Hook latency <1s | Global CLAUDE.md rule |
| D4 | Escape hatch required | User can override when orchestration is overkill |
| D5 | Fail-closed on orchestrator crash is unacceptable | A broken platform must not brick all Claude Code sessions |
| D6 | Bypass detection must be observable | Silent bypass is the original disease |
| D7 | SonaLearning patterns must be auto-injected | Without recall, past lessons are wasted |
| D8 | 62 skills must be discoverable without hallucination | Avoid "skill that doesn't exist" fabrications |
| D9 | State must survive between tool calls | Threshold counting needs persistence |

---

## 4. Considered Options

### Option A — Pure Nudge (SessionStart + UserPromptSubmit Injection)

A SessionStart hook injects a reminder: *"You have 6 EAGLES MCPs. For multi-step tasks, call `task_create` first."* UserPromptSubmit hook prepends SonaLearning recall.

- Pros: Zero friction. No blocking. Simple.
- Cons: **This is what we have today and it failed.** Claude ignores soft reminders under task pressure. Proven-ineffective pattern.
- Confidence: 35%.

### Option B — Hard-Stop PreToolUse Hook

PreToolUse hook on `Edit|Write|MultiEdit` tracks mutation-tool count per session. On the Nth call without a preceding `mcp__orchestrator__task_create` (or similar DAG-enrolling call), return exit code 2 with stderr explaining the block and next steps.

- Pros: **Mechanically unavoidable.** Removes the possibility of drift. Provides clear telemetry.
- Cons: Risk of false-positive blocks on legitimate single-file edits. Requires escape hatch. Requires state persistence.
- Confidence: 85%.

### Option C — Hybrid (Nudge + Bypass Detection + Hard-Stop)

SessionStart nudge + UserPromptSubmit SonaLearning injection + PostToolUse bypass telemetry + PreToolUse hard-stop at threshold N=4.

- Pros: Combines observability (telemetry), pattern recall (SonaLearning), and enforcement (hard-stop). Defensive depth.
- Cons: More hooks = more latency budget used. More moving parts. 4 files vs 1.
- Confidence: 90%.

### Option D — Orchestrator Heartbeat Required Before Any Tool Call

PreToolUse on every tool call queries orchestrator-mcp health. If no heartbeat in last 60s, block all tool calls.

- Pros: Guarantees platform is actually loaded and healthy.
- Cons: **Fails driver D5** (fail-closed). If orchestrator MCP crashes, the entire Claude Code session is bricked. Also adds latency to every single call. Too aggressive.
- Confidence: 40%.

### Option E — Require `eagles_session_begin` First Tool Call

First tool call in every session MUST be `mcp__orchestrator__eagles_session_begin`. All other tool calls blocked until it returns.

- Pros: Forces skill/pattern surfacing on a real MCP round-trip.
- Cons: Breaks Read-only exploratory sessions. Over-constrains the "I just want to check one file" workflow.
- Confidence: 55%.

---

## 5. Decision Outcome

**Chosen: Option C — Hybrid (Nudge + Bypass Detection + Hard-Stop)**

Rationale:
- Option B alone satisfies the user's hard-stop directive but misses drivers D7 (SonaLearning auto-injection) and D8 (skill surfacing).
- Option C layers defenses: observability *before* enforcement. The user gets a warning at N=2, a soft block at N=3, a hard block at N=4.
- The hybrid fails **open** on orchestrator crash (driver D5) while still failing **closed** on user bypass attempts (driver D1).
- The SessionStart nudge + UserPromptSubmit SonaLearning injection create the information environment that makes the hard-stop feel reasonable, not arbitrary.

**Threshold rationale** (N=4 mutation calls without a DAG enrollment):
- N=1 is too aggressive (blocks single-edit typo fixes).
- N=2-3 is the warning band.
- N=4 is where a pattern of manual multi-step work is statistically established.
- Based on the 2026-04-05 session's observed bypass: it took ~6 manual Edit calls before the user caught it. N=4 catches earlier than a human reviewer.

---

## 6. Positive Consequences

1. **Self-dogfooding enforced.** It becomes structurally impossible for Claude to port new orchestration components then ignore them.
2. **SonaLearning is finally wired into the feedback loop.** Patterns learned in prior sessions actually get recalled.
3. **Bypass telemetry exists.** The `eagles-bypass.log` provides ground truth on how often manual mode is still chosen.
4. **Skills become discoverable.** The 62-skill catalog appears in the session header, reducing hallucination.
5. **Escape hatch preserves trust.** `EAGLES_BYPASS=1` means the user is never trapped.
6. **Demonstrable credibility.** ADR-007 claimed competitive parity. ADR-008 proves it by forcing its own adoption.

---

## 7. Negative Consequences

1. **False-positive blocks.** A user doing 4 legitimate unrelated single-file edits in one session will hit the block. Mitigation: escape hatch + threshold review after 2 weeks of telemetry.
2. **Hook latency budget.** 4 active hooks (SessionStart, UserPromptSubmit, PreToolUse, PostToolUse) must collectively stay <1s. Mitigation: PreToolUse hook is pure SQLite read + counter check (~5ms).
3. **Windows path edge cases.** Git Bash MSYS paths break Python file access (MEMORY.md Lesson 28). Mitigation: all hook paths use `os.path.expanduser` + `os.path.join`.
4. **State file contention.** Counter file written on every Edit/Write. Mitigation: append-only JSONL with OS-atomic writes; no locking needed for single-writer Claude Code process.
5. **User backlash risk.** If threshold is too aggressive, user disables hook entirely and platform is worse off than before. Mitigation: start at N=4, instrument, retune.
6. **VS Code restart remains required** to load new MCP tools. This ADR does not solve that — it addresses adoption after tools are loaded.

---

## 8. Implementation Details

### 8.1 Hook files (all in `C:/Users/hatim/.claude/hooks/`)

#### File 1: `eagles-session-start.py` (SessionStart hook)

```python
#!/usr/bin/env python3
"""EAGLES SessionStart — surface capabilities + inject recent SonaLearning patterns.

Outputs to stdout (appended to session context). Fails OPEN on any error.
Latency budget: <200ms.
"""
import json
import os
import sqlite3
import sys
from pathlib import Path

DATA_ROOT = Path(os.environ.get("EAGLES_DATA_ROOT",
    r"C:\RH-OptimERP\eagles-ai-platform\.eagles-data"))

def load_top_skills(limit=10):
    """Surface top skills from tool-registry SQLite store."""
    db = DATA_ROOT / "tool-registry.sqlite"
    if not db.exists():
        return []
    try:
        conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True, timeout=0.5)
        rows = conn.execute(
            "SELECT skill_id, name, category FROM skills "
            "ORDER BY usage_count DESC LIMIT ?", (limit,)
        ).fetchall()
        conn.close()
        return rows
    except Exception:
        return []

def load_recent_patterns(limit=5):
    """Surface recent SonaLearning patterns."""
    db = DATA_ROOT / "learning.sqlite"
    if not db.exists():
        return []
    try:
        conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True, timeout=0.5)
        rows = conn.execute(
            "SELECT pattern_id, summary FROM patterns "
            "WHERE confidence > 0.7 ORDER BY created_at DESC LIMIT ?", (limit,)
        ).fetchall()
        conn.close()
        return rows
    except Exception:
        return []

def main():
    skills = load_top_skills()
    patterns = load_recent_patterns()

    lines = ["# EAGLES Session Contract", ""]
    lines.append("**6 MCP servers loaded.** For multi-step tasks, call "
                 "`mcp__orchestrator__task_create` FIRST.")
    lines.append("")
    lines.append(f"**Top skills ({len(skills)})**: " +
                 ", ".join(f"{r[1]}" for r in skills[:10]) if skills else
                 "**Skills**: registry empty")
    lines.append("")
    if patterns:
        lines.append("**Recent learned patterns:**")
        for pid, summary in patterns:
            lines.append(f"- [{pid}] {summary[:120]}")
    lines.append("")
    lines.append("**Enforcement**: after 4 Edit/Write calls without "
                 "`task_create`, mutations will be BLOCKED (exit 2).")
    lines.append("**Escape hatch**: set `EAGLES_BYPASS=1` in env.")
    lines.append("")

    print("\n".join(lines))
    sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # Fail OPEN — never block session start
        print(f"[eagles-session-start] warn: {e}", file=sys.stderr)
        sys.exit(0)
```

#### File 2: `eagles-enforce-dag.py` (PreToolUse hook on `Edit|Write|MultiEdit`)

```python
#!/usr/bin/env python3
"""EAGLES DAG enforcement — hard-stop on manual mutations bypassing orchestrator.

Reads tool call from stdin, tracks mutation count in session state file.
Blocks with exit 2 on 4th mutation without preceding task_create.

Latency budget: <50ms (pure file I/O).
Fails OPEN on any internal error (never brick user's workflow).
"""
import json
import os
import sys
import time
from pathlib import Path

STATE_DIR = Path(os.path.expanduser("~/.claude/state/eagles"))
STATE_DIR.mkdir(parents=True, exist_ok=True)

MUTATION_TOOLS = {"Edit", "Write", "MultiEdit"}
DAG_ENROLL_TOOLS = {
    "mcp__orchestrator__task_create",
    "mcp__orchestrator__task_apply_decomposition",
    "mcp__orchestrator__task_build_decomposition_prompt",
}
THRESHOLD_WARN = 2
THRESHOLD_SOFT = 3
THRESHOLD_HARD = 4
SESSION_TTL_SECONDS = 3600  # reset counter if session idle >1h

def session_id():
    ppid = os.getppid()
    return f"sess_{ppid}"

def state_path():
    return STATE_DIR / f"{session_id()}.json"

def load_state():
    p = state_path()
    if not p.exists():
        return {"mutation_count": 0, "dag_enrolled": False, "last_ts": time.time()}
    try:
        s = json.loads(p.read_text())
        if time.time() - s.get("last_ts", 0) > SESSION_TTL_SECONDS:
            return {"mutation_count": 0, "dag_enrolled": False, "last_ts": time.time()}
        return s
    except Exception:
        return {"mutation_count": 0, "dag_enrolled": False, "last_ts": time.time()}

def save_state(s):
    s["last_ts"] = time.time()
    try:
        state_path().write_text(json.dumps(s))
    except Exception:
        pass

def log_bypass(tool_name, count):
    log = STATE_DIR / "eagles-bypass.log"
    try:
        with log.open("a", encoding="utf-8") as f:
            f.write(json.dumps({
                "ts": time.time(),
                "session": session_id(),
                "tool": tool_name,
                "count": count,
            }) + "\n")
    except Exception:
        pass

def main():
    if os.environ.get("EAGLES_BYPASS") == "1":
        sys.exit(0)

    raw = sys.stdin.read()
    try:
        payload = json.loads(raw)
    except Exception:
        sys.exit(0)

    tool_name = payload.get("tool_name", "")
    state = load_state()

    if tool_name in DAG_ENROLL_TOOLS:
        state["dag_enrolled"] = True
        state["mutation_count"] = 0
        save_state(state)
        sys.exit(0)

    if tool_name not in MUTATION_TOOLS:
        sys.exit(0)

    if state.get("dag_enrolled"):
        sys.exit(0)

    state["mutation_count"] += 1
    count = state["mutation_count"]
    save_state(state)

    if count == THRESHOLD_WARN:
        print(f"[eagles] WARN: {count} mutations without task_create. "
              f"Consider calling mcp__orchestrator__task_create.", file=sys.stderr)
        sys.exit(0)

    if count == THRESHOLD_SOFT:
        print(f"[eagles] SOFT BLOCK: {count} mutations without DAG. "
              f"Next mutation will be BLOCKED. Call task_create now, "
              f"or set EAGLES_BYPASS=1.", file=sys.stderr)
        sys.exit(0)

    if count >= THRESHOLD_HARD:
        log_bypass(tool_name, count)
        print(
            "[eagles] HARD BLOCK (exit 2): "
            f"{count} Edit/Write calls without DAG enrollment.\n"
            "This is a multi-step task — route it through the EAGLES orchestrator.\n"
            "\n"
            "Required next step:\n"
            "  mcp__orchestrator__task_create (or task_apply_decomposition)\n"
            "\n"
            "Escape hatch (single-file exception):\n"
            "  set EAGLES_BYPASS=1  (Windows)\n"
            "  export EAGLES_BYPASS=1  (bash)\n"
            "\n"
            "See ADR-008-SESSION-START-CONTRACT.md for rationale.",
            file=sys.stderr
        )
        sys.exit(2)

    sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(f"[eagles-enforce] warn: {e}", file=sys.stderr)
        sys.exit(0)
```

#### File 3: `eagles-sona-recall.py` (UserPromptSubmit hook)

```python
#!/usr/bin/env python3
"""EAGLES SonaLearning recall — inject top-k matching patterns at prompt submit.

Reads user prompt, queries SonaLearningStore for similar past patterns,
appends them to prompt context. Latency budget: <300ms.
Fails OPEN.
"""
import json
import os
import sqlite3
import sys
from pathlib import Path

DATA_ROOT = Path(os.environ.get("EAGLES_DATA_ROOT",
    r"C:\RH-OptimERP\eagles-ai-platform\.eagles-data"))

def main():
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw)
    except Exception:
        sys.exit(0)

    prompt = payload.get("prompt", "")[:200]
    if not prompt.strip():
        sys.exit(0)

    db = DATA_ROOT / "learning.sqlite"
    if not db.exists():
        sys.exit(0)

    try:
        conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True, timeout=0.3)
        keywords = [w.lower() for w in prompt.split() if len(w) > 4][:5]
        if not keywords:
            sys.exit(0)
        like_clauses = " OR ".join("LOWER(summary) LIKE ?" for _ in keywords)
        params = [f"%{k}%" for k in keywords]
        rows = conn.execute(
            f"SELECT pattern_id, summary FROM patterns "
            f"WHERE ({like_clauses}) AND confidence > 0.7 "
            f"ORDER BY usage_count DESC LIMIT 3", params
        ).fetchall()
        conn.close()
    except Exception:
        sys.exit(0)

    if rows:
        print("# EAGLES Recalled Patterns")
        for pid, summary in rows:
            print(f"- [{pid}] {summary[:160]}")
        print("")
    sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
```

#### File 4: `eagles-bypass-telemetry.py` (PostToolUse hook on mutations)

```python
#!/usr/bin/env python3
"""EAGLES bypass telemetry — record every mutation + DAG-enrollment status.
Non-blocking. Writes JSONL to eagles-telemetry.log.
"""
import json
import os
import sys
import time
from pathlib import Path

STATE_DIR = Path(os.path.expanduser("~/.claude/state/eagles"))
STATE_DIR.mkdir(parents=True, exist_ok=True)
LOG = STATE_DIR / "eagles-telemetry.log"

def main():
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw)
    except Exception:
        sys.exit(0)
    tool = payload.get("tool_name", "")
    if tool not in {"Edit", "Write", "MultiEdit"}:
        sys.exit(0)
    state_file = STATE_DIR / f"sess_{os.getppid()}.json"
    enrolled = False
    if state_file.exists():
        try:
            enrolled = json.loads(state_file.read_text()).get("dag_enrolled", False)
        except Exception:
            pass
    try:
        with LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps({
                "ts": time.time(), "tool": tool, "dag_enrolled": enrolled,
            }) + "\n")
    except Exception:
        pass
    sys.exit(0)

if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
```

### 8.2 `settings.json` modifications

Add to `hooks.PreToolUse` array:

```json
{
  "matcher": "Edit|Write|MultiEdit",
  "hooks": [{
    "type": "command",
    "command": "python3 \"%USERPROFILE%\\.claude\\hooks\\eagles-enforce-dag.py\" 2>&1"
  }]
}
```

Add to `hooks.SessionStart` array:

```json
{
  "matcher": "startup|resume",
  "hooks": [{
    "type": "command",
    "command": "python3 \"%USERPROFILE%\\.claude\\hooks\\eagles-session-start.py\""
  }]
}
```

Add new `hooks.UserPromptSubmit` array:

```json
"UserPromptSubmit": [{
  "hooks": [{
    "type": "command",
    "command": "python3 \"%USERPROFILE%\\.claude\\hooks\\eagles-sona-recall.py\""
  }]
}]
```

Add to `hooks.PostToolUse` array:

```json
{
  "matcher": "Edit|Write|MultiEdit",
  "hooks": [{
    "type": "command",
    "command": "python3 \"%USERPROFILE%\\.claude\\hooks\\eagles-bypass-telemetry.py\""
  }]
}
```

### 8.3 Threshold values

| Event | Threshold | Action |
|-------|-----------|--------|
| 2nd mutation without DAG | `THRESHOLD_WARN=2` | stderr warn, exit 0 |
| 3rd mutation without DAG | `THRESHOLD_SOFT=3` | stderr soft-block warning, exit 0 |
| 4th mutation without DAG | `THRESHOLD_HARD=4` | stderr hard-block, **exit 2** |
| Any `task_create`/`task_apply_decomposition` call | reset | counter = 0, `dag_enrolled=true` |
| Session idle >1h | reset | full state reset |

### 8.4 State persistence

- **Location**: `~/.claude/state/eagles/sess_{ppid}.json` (per-session file keyed by Claude Code parent PID).
- **Format**: JSON with `mutation_count`, `dag_enrolled`, `last_ts`.
- **Why file, not SQLite**: hook latency — file I/O is ~5ms, SQLite open+query is ~30ms.
- **Why not memory**: hooks are fresh Python processes per invocation; state must persist across calls.
- **Telemetry**: `~/.claude/state/eagles/eagles-telemetry.log` (JSONL, append-only).
- **Bypass log**: `~/.claude/state/eagles/eagles-bypass.log` (records every hard-block event).

### 8.5 Escape hatch mechanics

- **Global**: `EAGLES_BYPASS=1` in env — hook short-circuits on entry, exit 0.
- **Per-session reset**: `rm ~/.claude/state/eagles/sess_*.json`.
- **Threshold tuning**: edit constants at top of `eagles-enforce-dag.py`.

### 8.6 Fail-open policy

All four hooks wrap `main()` in try/except and exit 0 on any internal error. The enforce hook uses exit 2 **only** for the intentional hard-block path. A crashed hook never blocks a tool call. A crashed orchestrator MCP never blocks anything — the enforcement hook only reads local SQLite files, it does not query the orchestrator.

---

## 9. Validation Criteria

### 9.1 Pre-deployment (local smoke)

1. `python3 ~/.claude/hooks/eagles-enforce-dag.py < test-payload.json` runs in <50ms.
2. `EAGLES_BYPASS=1 python3 ...` exits 0 regardless of state.
3. 4 consecutive Edit calls produce: warn, soft-block warn, no-op, **exit 2**.
4. A `task_create` call between Edit 2 and Edit 3 resets the counter.

### 9.2 Post-deployment (first real session)

1. Fresh VS Code window → SessionStart hook prints 62 skills + 5 patterns in session header.
2. First UserPrompt on a multi-step task → SonaLearning recall prepends 1-3 matching patterns.
3. First MCP call on the task **must be** `mcp__orchestrator__*` — validated by telemetry log.
4. `eagles-telemetry.log` shows `dag_enrolled=true` on ≥90% of mutations within 2 sessions.
5. `eagles-bypass.log` size stays at 0 on well-structured sessions, non-zero only when user invokes escape hatch.

### 9.3 2-week retrospective

- Count hard-block events in `eagles-bypass.log`.
- If >5/week and >50% are legitimate single-file edits → raise threshold to N=6.
- If <1/week and orchestrator usage is still <50% → lower threshold to N=3.
- If telemetry shows `dag_enrolled=false` in >30% of mutations → investigate why `task_create` isn't being called.

---

## 10. Related Decisions

- **ADR-006** (Competitive Gap Analysis) — identifies 40 gaps; this ADR closes the "self-adoption gap."
- **ADR-007** (1000-Repo Competitive Analysis) — documents parity claims; ADR-008 enforces them.
- **MEMORY.md Lesson 1** — "Prompt Library bypassed" anti-pattern; ADR-008 is the generalized fix.
- **CLAUDE.md hook rules** — all 4 hooks comply with <1s latency budget and fail-open posture.

---

## 11. Open Questions

1. Should `task_create` *alone* count as enrollment, or must the task reach `started` status? **Decision**: creation is sufficient for V1.
2. What about `MultiEdit`? Counts as **1 mutation** (it's one tool call, regardless of file count).
3. Should the bypass log trigger a /compact suggestion at N>10/session? **Defer to V2**.
4. Should enforcement apply in non-git directories (one-off scripts)? **V1: yes, uniform policy.**

---

**End of ADR-008.**
