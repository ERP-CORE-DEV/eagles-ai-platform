#!/usr/bin/env python3
"""EAGLES Session Tagger — Stop hook that indexes session metadata.

Parses JSONL transcript → extracts project, keywords, suppliers, categories.
Writes to SessionIndexStore SQLite for future session_search queries.
Runs at session end. Fails OPEN (never blocks session exit).

Trigger: Stop event
Purpose: Build searchable index of past sessions
Exit codes: Always 0 (fail-open — never blocks session exit)
"""
import sys
import json
import os
import sqlite3
import time
import re
from pathlib import Path
from collections import Counter

DATA_ROOT = Path(os.environ.get(
    'EAGLES_DATA_ROOT',
    'C:/RH-OptimERP/eagles-ai-platform/.data'
))
DB_PATH = DATA_ROOT / 'session-index.sqlite'

# Category → keyword triggers (lowercased)
CATEGORY_KEYWORDS = {
    'SUPPLIER':  ['qonto', 'alan', 'payfit', 'anthropic', 'ovh', 'bouygues',
                  'orange', 'free', 'sfr'],
    'MATCHING':  ['match', 'rapprochement', 'reconciliation', 'score', 'mapping'],
    'AUTH':      ['login', 'session', 'cdp', 'cookie', 'totp', 'auth',
                  'password', 'oauth'],
    'SCRAPING':  ['download', 'invoice', 'portal', 'scraper', 'pdf', 'facture'],
    'BUG':       ['ko', 'broken', 'fix', 'error', 'bug', 'marche pas',
                  'failed', 'crash'],
    'TAXONOMY':  ['supplier', 'employee', 'salary', 'ceo', 'category',
                  'type', 'classify'],
    'WORKFLOW':  ['import', 'export', 'process', 'workflow', 'step',
                  'pipeline', 'batch'],
}

SUPPLIER_NAMES = CATEGORY_KEYWORDS['SUPPLIER']

# Common English/French stopwords to exclude from keyword extraction
STOPWORDS = {
    'the', 'a', 'an', 'is', 'in', 'on', 'at', 'to', 'of', 'for', 'and',
    'or', 'but', 'not', 'with', 'that', 'this', 'it', 'be', 'as', 'by',
    'from', 'was', 'are', 'been', 'have', 'has', 'had', 'do', 'does', 'did',
    'will', 'can', 'could', 'should', 'would', 'may', 'might', 'shall',
    'i', 'you', 'we', 'he', 'she', 'they', 'me', 'him', 'her', 'us', 'them',
    'my', 'your', 'our', 'his', 'its', 'their',
    'le', 'la', 'les', 'un', 'une', 'des', 'du', 'de', 'et', 'ou', 'en',
    'au', 'aux', 'ce', 'se', 'sa', 'son', 'ses', 'je', 'tu', 'il', 'elle',
    'nous', 'vous', 'ils', 'elles', 'que', 'qui', 'ne', 'pas', 'plus',
    'si', 'aussi', 'mais', 'car', 'donc', 'ni', 'par', 'sur', 'sous',
    'dans', 'pour', 'avec', 'sans', 'entre', 'vers', 'chez',
    # Common noise tokens
    'please', 'ok', 'yes', 'no', 'thanks', 'hello', 'hi', 'hey',
    'use', 'get', 'set', 'run', 'make', 'go', 'new', 'old', 'now',
    'then', 'when', 'where', 'how', 'what', 'which', 'who', 'why',
    'all', 'any', 'some', 'each', 'both', 'here', 'there', 'up', 'down',
    'just', 'only', 'also', 'well', 'like', 'so', 'if', 'then', 'about',
}


def ensure_db(path: Path) -> sqlite3.Connection:
    """Create or open the session-index SQLite database."""
    path.parent.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(path), timeout=5)
    conn.execute('PRAGMA journal_mode=WAL')
    conn.execute('''
        CREATE TABLE IF NOT EXISTS session_index (
            session_id   TEXT PRIMARY KEY,
            project      TEXT NOT NULL DEFAULT '',
            cwd          TEXT NOT NULL DEFAULT '',
            categories   TEXT NOT NULL DEFAULT '[]',
            keywords     TEXT NOT NULL DEFAULT '[]',
            suppliers    TEXT NOT NULL DEFAULT '[]',
            message_count INTEGER NOT NULL DEFAULT 0,
            created_at   TEXT NOT NULL,
            updated_at   TEXT NOT NULL
        )
    ''')
    conn.commit()
    return conn


def extract_text_from_content(content) -> str:
    """Extract plain text from a JSONL content field (string or block array)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict):
                block_type = block.get('type', '')
                # Skip tool_result blocks — only user prose
                if block_type in ('tool_result', 'tool_use'):
                    continue
                text = block.get('text', '')
                if text:
                    parts.append(text)
        return ' '.join(parts)
    return ''


def parse_user_messages(transcript_path: str) -> list[str]:
    """Read JSONL transcript and return all user message texts."""
    messages = []
    try:
        with open(transcript_path, 'r', encoding='utf-8', errors='replace') as f:
            for line in f:
                line = line.strip()
                if not line:
                    continue
                try:
                    entry = json.loads(line)
                except json.JSONDecodeError:
                    continue

                # Claude Code JSONL format:
                # {"type":"user","message":{"role":"user","content":[...]}}
                msg = entry.get('message', {})
                if not isinstance(msg, dict):
                    continue

                role = msg.get('role', '')
                if role != 'user':
                    continue

                content = msg.get('content', '')
                text = extract_text_from_content(content)
                if text.strip():
                    messages.append(text)

    except (FileNotFoundError, PermissionError, OSError):
        pass
    return messages


def detect_categories(messages: list[str]) -> list[str]:
    """Return sorted list of category names triggered by message content."""
    combined = ' '.join(messages).lower()
    found = []
    for category, triggers in CATEGORY_KEYWORDS.items():
        for trigger in triggers:
            if trigger in combined:
                found.append(category)
                break
    return sorted(set(found))


def extract_keywords(messages: list[str], top_n: int = 20) -> list[str]:
    """Extract top N non-stopword words across all user messages."""
    combined = ' '.join(messages).lower()
    # Tokenize: keep only alpha tokens of length >= 3
    tokens = re.findall(r'[a-zA-ZÀ-ÿ]{3,}', combined)
    filtered = [t for t in tokens if t not in STOPWORDS]
    return [word for word, _ in Counter(filtered).most_common(top_n)]


def extract_suppliers(messages: list[str]) -> list[str]:
    """Extract supplier names mentioned in user messages."""
    combined = ' '.join(messages).lower()
    return sorted({s for s in SUPPLIER_NAMES if s in combined})


def project_from_cwd(cwd: str) -> str:
    """Extract project name as the basename of the working directory."""
    if not cwd:
        return ''
    return Path(cwd).name or ''


def main():
    try:
        raw = sys.stdin.read().strip()
        if not raw:
            sys.exit(0)
        data = json.loads(raw)
    except (json.JSONDecodeError, EOFError, ValueError):
        sys.exit(0)

    session_id = data.get('session_id', '')
    transcript_path = data.get('transcript_path', '')
    cwd = data.get('cwd', '')

    if not transcript_path:
        sys.exit(0)

    # Parse transcript
    messages = parse_user_messages(transcript_path)
    if not messages:
        sys.exit(0)

    # Derive a session_id from transcript path if not provided
    if not session_id:
        session_id = Path(transcript_path).stem

    project = project_from_cwd(cwd)
    categories = detect_categories(messages)
    keywords = extract_keywords(messages)
    suppliers = extract_suppliers(messages)
    now = time.strftime('%Y-%m-%dT%H:%M:%SZ')

    try:
        conn = ensure_db(DB_PATH)
        existing = conn.execute(
            'SELECT session_id FROM session_index WHERE session_id = ?',
            (session_id,)
        ).fetchone()

        if existing:
            conn.execute(
                '''UPDATE session_index
                   SET project=?, cwd=?, categories=?, keywords=?, suppliers=?,
                       message_count=?, updated_at=?
                   WHERE session_id=?''',
                (
                    project,
                    cwd,
                    json.dumps(categories),
                    json.dumps(keywords),
                    json.dumps(suppliers),
                    len(messages),
                    now,
                    session_id,
                )
            )
            action = 'updated'
        else:
            conn.execute(
                '''INSERT INTO session_index
                   (session_id, project, cwd, categories, keywords, suppliers,
                    message_count, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)''',
                (
                    session_id,
                    project,
                    cwd,
                    json.dumps(categories),
                    json.dumps(keywords),
                    json.dumps(suppliers),
                    len(messages),
                    now,
                    now,
                )
            )
            action = 'indexed'

        conn.commit()
        conn.close()

        print(
            f'[session-tagger] {action} session={session_id} '
            f'project={project} msgs={len(messages)} '
            f'cats={categories} suppliers={suppliers} '
            f'keywords={keywords[:5]}'
        )
    except Exception:
        pass

    sys.exit(0)


if __name__ == '__main__':
    try:
        main()
    except Exception:
        # Fail OPEN — never block session exit
        sys.exit(0)
