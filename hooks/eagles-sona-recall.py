#!/usr/bin/env python3
"""EAGLES SonaLearning recall — inject matching patterns at UserPromptSubmit.

Reads user prompt, queries learning_patterns for keyword matches in
name or description, appends top-3 matches as additional context.

Latency budget: <300ms.
Fails OPEN on any error.

Uses ACTUAL schema: learning_patterns table with name, description, success_rate.
"""
import json
import os
import sqlite3
import sys
from pathlib import Path

DATA_ROOT = Path(os.environ.get(
    "EAGLES_DATA_ROOT",
    r"C:\RH-OptimERP\eagles-ai-platform\.data"
))


def main():
    raw = sys.stdin.read()
    try:
        payload = json.loads(raw)
    except Exception:
        sys.exit(0)

    prompt = payload.get("prompt", "")[:300]
    if not prompt.strip():
        sys.exit(0)

    # Skip very short prompts — likely trivial
    if len(prompt) < 20:
        sys.exit(0)

    db = DATA_ROOT / "learning.sqlite"
    if not db.exists():
        sys.exit(0)

    # Extract keywords (words longer than 4 chars, lowercased, top 5)
    words = [w.lower() for w in prompt.split() if len(w) > 4]
    keywords = words[:5]
    if not keywords:
        sys.exit(0)

    try:
        conn = sqlite3.connect(f"file:{db}?mode=ro", uri=True, timeout=0.3)
        like_clauses = " OR ".join(
            "(LOWER(name) LIKE ? OR LOWER(description) LIKE ?)" for _ in keywords
        )
        params = []
        for k in keywords:
            pattern = f"%{k}%"
            params.extend([pattern, pattern])

        sql = (
            f"SELECT pattern_id, name, description, success_rate, total_attempts "
            f"FROM learning_patterns "
            f"WHERE archived = 0 AND success_rate >= 0.5 AND ({like_clauses}) "
            f"ORDER BY success_rate DESC, updated_at DESC LIMIT 3"
        )
        rows = conn.execute(sql, params).fetchall()
        conn.close()
    except Exception:
        sys.exit(0)

    if not rows:
        sys.exit(0)

    print("# EAGLES — Recalled Patterns from Past Sessions")
    print("")
    for pid, name, desc, rate, attempts in rows:
        desc_short = (desc or "")[:200]
        print(f"- **{name}** (success_rate={rate:.2f}, attempts={attempts})")
        print(f"  {desc_short}")
    print("")
    print("*(Patterns injected by eagles-sona-recall.py — success_rate >= 0.5)*")
    print("")
    sys.exit(0)


if __name__ == "__main__":
    try:
        main()
    except Exception:
        sys.exit(0)
