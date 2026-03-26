#!/usr/bin/env python3
"""EAGLES Rate Limit Detector — PostToolUse hook.

Detects rate limit responses in tool results and:
1. Logs to token-tracker SQLite as RATE_LIMIT event
2. Prints wait advisory
3. Writes state file for cross-session awareness
"""
import sys
import json
import sqlite3
import time
import hashlib
from pathlib import Path

TOKEN_DB = 'C:/RH-OptimERP/eagles-ai-platform/.data/token-ledger/ledger.sqlite'
STATE_FILE = Path.home() / '.claude' / '.rate-limit-state'

RATE_LIMIT_SIGNALS = [
    'rate_limit', 'rate limit', 'too many requests', '429',
    'throttled', 'quota exceeded', 'capacity', 'overloaded',
]


def is_rate_limited(tool_result):
    text = json.dumps(tool_result).lower() if isinstance(tool_result, dict) else str(tool_result).lower()
    return any(signal in text for signal in RATE_LIMIT_SIGNALS)


def log_rate_limit(tool_name):
    try:
        conn = sqlite3.connect(TOKEN_DB, timeout=5)
        conn.execute('PRAGMA journal_mode=WAL')
        rid = hashlib.sha256(f'rl-{time.time()}-{tool_name}'.encode()).hexdigest()[:16]
        conn.execute(
            '''INSERT OR IGNORE INTO token_records
               (id,session_id,model_name,prompt_tokens,completion_tokens,total_tokens,
                cache_read_tokens,cache_write_tokens,estimated_cost_usd,recorded_at,
                wave_number,agent_name,tool_name)
               VALUES (?,?,?,0,0,0,0,0,0,?,NULL,?,?)''',
            (rid, time.strftime('%Y-%m-%d'), 'RATE_LIMIT',
             time.strftime('%Y-%m-%dT%H:%M:%SZ'), tool_name, 'RATE_LIMIT'))
        conn.commit()
        conn.close()
    except Exception:
        pass


def write_state(tool_name):
    try:
        STATE_FILE.write_text(json.dumps({
            'tool': tool_name,
            'timestamp': time.strftime('%Y-%m-%dT%H:%M:%SZ'),
            'unix': time.time(),
        }))
    except Exception:
        pass


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    tool_name = data.get('tool_name', '')
    tool_result = data.get('tool_result', {})

    if is_rate_limited(tool_result):
        log_rate_limit(tool_name)
        write_state(tool_name)
        print(f'[rate-limit] Rate limit detected on {tool_name}. Consider waiting 30-60s before retrying.')
        sys.exit(1)  # Exit 1 = warning (non-blocking)

    # Clear state if no rate limit (recovery)
    if STATE_FILE.exists():
        try:
            state = json.loads(STATE_FILE.read_text())
            if time.time() - state.get('unix', 0) > 120:
                STATE_FILE.unlink()
        except Exception:
            pass

    sys.exit(0)

if __name__ == '__main__':
    main()
