#!/usr/bin/env python3
"""EAGLES DAG enforcement hook — hard-stop on manual mutations bypassing orchestrator.

PreToolUse hook on Edit|Write|MultiEdit.
Tracks mutation count per session in ~/.claude/state/eagles/sess_{ppid}.json.
Blocks with exit 2 on the 4th mutation without preceding task_create call.

Threshold ladder:
    N=2 → WARN (stderr, exit 0)
    N=3 → SOFT BLOCK WARNING (stderr, exit 0)
    N=4 → HARD BLOCK (stderr + exit 2)

Escape hatch: EAGLES_BYPASS=1 env var bypasses all checks.
Fail-open: any internal error → exit 0 (never brick user's workflow).

Latency budget: <50ms (pure file I/O).

See ADR-008-SESSION-START-CONTRACT.md for full rationale.
"""
import json
import os
import sys
import time
from pathlib import Path

STATE_DIR = Path(os.path.expanduser("~/.claude/state/eagles"))

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
    """PID-keyed session identifier (Claude Code exposes no native session ID)."""
    return f"sess_{os.getppid()}"


def state_path():
    return STATE_DIR / f"{session_id()}.json"


def load_state():
    p = state_path()
    if not p.exists():
        return {"mutation_count": 0, "dag_enrolled": False, "last_ts": time.time()}
    try:
        s = json.loads(p.read_text(encoding="utf-8"))
        if time.time() - s.get("last_ts", 0) > SESSION_TTL_SECONDS:
            return {"mutation_count": 0, "dag_enrolled": False, "last_ts": time.time()}
        return s
    except Exception:
        return {"mutation_count": 0, "dag_enrolled": False, "last_ts": time.time()}


def save_state(s):
    s["last_ts"] = time.time()
    try:
        state_path().write_text(json.dumps(s), encoding="utf-8")
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
    # Escape hatch — short-circuit immediately
    if os.environ.get("EAGLES_BYPASS") == "1":
        sys.exit(0)

    STATE_DIR.mkdir(parents=True, exist_ok=True)

    raw = sys.stdin.read()
    try:
        payload = json.loads(raw)
    except Exception:
        sys.exit(0)  # malformed input → fail open

    tool_name = payload.get("tool_name", "")
    state = load_state()

    # DAG enrollment tools reset the counter AND flag session as enrolled
    if tool_name in DAG_ENROLL_TOOLS:
        state["dag_enrolled"] = True
        state["mutation_count"] = 0
        save_state(state)
        sys.exit(0)

    # Non-mutation tools pass through
    if tool_name not in MUTATION_TOOLS:
        sys.exit(0)

    # If DAG already enrolled in this session, pass through
    if state.get("dag_enrolled"):
        sys.exit(0)

    # Count this mutation
    state["mutation_count"] += 1
    count = state["mutation_count"]
    save_state(state)

    if count == THRESHOLD_WARN:
        print(
            f"[eagles] WARN: {count} mutations without task_create. "
            f"Consider calling mcp__orchestrator__task_create for multi-step work.",
            file=sys.stderr
        )
        sys.exit(0)

    if count == THRESHOLD_SOFT:
        print(
            f"[eagles] SOFT BLOCK: {count} mutations without DAG enrollment. "
            f"NEXT mutation will be BLOCKED. Call mcp__orchestrator__task_create "
            f"now, or set EAGLES_BYPASS=1 to override.",
            file=sys.stderr
        )
        sys.exit(0)

    if count >= THRESHOLD_HARD:
        log_bypass(tool_name, count)
        print(
            "[eagles] HARD BLOCK (exit 2)\n"
            f"{count} Edit/Write calls detected without DAG enrollment.\n"
            "This is a multi-step task — route it through the EAGLES orchestrator.\n"
            "\n"
            "Required next step:\n"
            "  mcp__orchestrator__task_create (or task_apply_decomposition)\n"
            "\n"
            "Escape hatch (single-file exception):\n"
            "  set EAGLES_BYPASS=1    (Windows)\n"
            "  export EAGLES_BYPASS=1 (bash)\n"
            "\n"
            "See docs/ADR-008-SESSION-START-CONTRACT.md for rationale.",
            file=sys.stderr
        )
        sys.exit(2)

    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        # Fail OPEN — never block user on a hook bug
        print(f"[eagles-enforce] warn: {e}", file=sys.stderr)
        sys.exit(0)
