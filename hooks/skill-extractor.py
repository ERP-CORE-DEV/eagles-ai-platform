#!/usr/bin/env python3
"""EAGLES Skill Extractor — Stop hook for auto-learning from sessions.

Parses session transcript (JSONL) to extract tool sequences, agent combos,
and session profiles. Writes to SonaLearningStore (orchestrator SQLite).
"""
import sys
import json
import sqlite3
import hashlib
import time
from collections import Counter
from pathlib import Path

ORCH_DB = 'C:/RH-OptimERP/eagles-ai-platform/.data/orchestrator/orchestrator.sqlite'
MIN_SEQ_COUNT = 2
MAX_SEQ_LEN = 4
EMA_ALPHA = 0.3


def parse_transcript(path):
    calls = []
    try:
        with open(path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    e = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if e.get('type') == 'tool_use' or 'tool_name' in e:
                    name = e.get('tool_name', e.get('name', ''))
                    inp = e.get('tool_input', e.get('input', {}))
                    ok = not e.get('is_error', False)
                    if name == 'Agent':
                        calls.append({'tool': f"Agent:{inp.get('subagent_type','?')}", 'ok': ok})
                    elif name:
                        calls.append({'tool': name, 'ok': ok})
    except (FileNotFoundError, PermissionError):
        pass
    return calls


def extract_sequences(calls):
    seqs = Counter()
    tools = [c['tool'] for c in calls]
    for n in range(2, min(MAX_SEQ_LEN + 1, len(tools) + 1)):
        for i in range(len(tools) - n + 1):
            seq = tuple(tools[i:i + n])
            if len(set(seq)) > 1:
                seqs[seq] += 1
    return {s: c for s, c in seqs.items() if c >= MIN_SEQ_COUNT}


def pid(name):
    return hashlib.sha256(name.encode()).hexdigest()[:36]


def ensure_db(p):
    Path(p).parent.mkdir(parents=True, exist_ok=True)
    c = sqlite3.connect(p, timeout=5)
    c.execute('PRAGMA journal_mode=WAL')
    c.execute('''CREATE TABLE IF NOT EXISTS learning_patterns (
        pattern_id TEXT PRIMARY KEY, name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '', success_rate REAL NOT NULL DEFAULT 0.5,
        total_attempts INTEGER NOT NULL DEFAULT 0, tags TEXT NOT NULL DEFAULT '[]',
        archived INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)''')
    c.commit()
    return c


def upsert(conn, name, desc, tags, success):
    p = pid(name)
    now = time.strftime('%Y-%m-%dT%H:%M:%SZ')
    row = conn.execute('SELECT success_rate,total_attempts FROM learning_patterns WHERE pattern_id=?', (p,)).fetchone()
    if row:
        nr = EMA_ALPHA * (1.0 if success else 0.0) + (1 - EMA_ALPHA) * row[0]
        conn.execute('UPDATE learning_patterns SET success_rate=?,total_attempts=?,updated_at=? WHERE pattern_id=?',
                     (nr, row[1] + 1, now, p))
        return 'u'
    conn.execute('INSERT INTO learning_patterns VALUES (?,?,?,0.5,1,?,0,?,?)',
                 (p, name, desc, json.dumps(tags), now, now))
    return 'c'


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    tp = data.get('transcript_path', '')
    if not tp:
        sys.exit(0)

    calls = parse_transcript(tp)
    if len(calls) < 3:
        sys.exit(0)

    sr = sum(1 for c in calls if c.get('ok', True)) / len(calls)
    cr = up = 0

    try:
        db = ensure_db(ORCH_DB)
        for seq, cnt in extract_sequences(calls).items():
            r = upsert(db, ' -> '.join(seq), f'{cnt}x', ['sequence', 'auto'], sr > 0.7)
            cr += r == 'c'; up += r == 'u'

        agents = {c['tool'].split(':',1)[1] for c in calls if c['tool'].startswith('Agent:') and ':?' not in c['tool']}
        if len(agents) >= 2:
            r = upsert(db, 'agents:' + '+'.join(sorted(agents)), ', '.join(sorted(agents)), ['combo', 'auto'], sr > 0.7)
            cr += r == 'c'; up += r == 'u'

        top = Counter(c['tool'] for c in calls).most_common(3)
        if top:
            r = upsert(db, f"profile:{'+'.join(t[0] for t in top)}", ', '.join(f"{t[0]}({t[1]}x)" for t in top), ['profile', 'auto'], sr > 0.7)
            cr += r == 'c'; up += r == 'u'

        db.commit(); db.close()
        if cr or up:
            print(f'[skill-extractor] +{cr} new, ~{up} updated ({len(calls)} calls)')
    except Exception:
        pass
    sys.exit(0)

if __name__ == '__main__':
    main()
