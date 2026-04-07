#!/usr/bin/env python3
"""EAGLES bypass telemetry — record every mutation + DAG enrollment status.

PostToolUse hook on Edit|Write|MultiEdit.
Writes append-only JSONL to ~/.claude/state/eagles/eagles-telemetry.log.
Non-blocking (always exits 0). Fail-open on any error.

Used by the 2-week retrospective (ADR-008 section 9.3) to measure bypass rate.
"""
import json
import os
import sys
import time
from pathlib import Path

STATE_DIR = Path(os.path.expanduser("~/.claude/state/eagles"))
LOG = STATE_DIR / "eagles-telemetry.log"

MUTATION_TOOLS = {"Edit", "Write", "MultiEdit"}


def main():
    STATE_DIR.mkdir(parents=True, exist_ok=True)

    raw = sys.stdin.read()
    try:
        payload = json.loads(raw)
    except Exception:
        sys.exit(0)

    tool = payload.get("tool_name", "")
    if tool not in MUTATION_TOOLS:
        sys.exit(0)

    # Read current DAG enrollment state from the enforce hook's state file
    state_file = STATE_DIR / f"sess_{os.getppid()}.json"
    enrolled = False
    if state_file.exists():
        try:
            enrolled = json.loads(state_file.read_text(encoding="utf-8")).get(
                "dag_enrolled", False
            )
        except Exception:
            pass

    try:
        with LOG.open("a", encoding="utf-8") as f:
            f.write(json.dumps({
                "ts": time.time(),
                "tool": tool,
                "dag_enrolled": enrolled,
                "session": f"sess_{os.getppid()}",
            }) + "\n")
    except Exception:
        pass

    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
