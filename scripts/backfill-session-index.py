#!/usr/bin/env python3
"""Backfill Session Index — scan all existing sessions and index them.

Run once: python3 scripts/backfill-session-index.py
Progress: prints one line per session processed.
"""
import json
import os
import sqlite3
import time
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

PROJECTS_DIR = Path(os.path.expanduser("~/.claude/projects"))
DATA_ROOT = Path(os.environ.get("EAGLES_DATA_ROOT", "C:/RH-OptimERP/eagles-ai-platform/.data"))
DB_PATH = DATA_ROOT / "session-index.sqlite"

CATEGORIES = {
    "SUPPLIER": [
        "qonto", "alan", "payfit", "anthropic", "ovh", "bouygues",
        "orange", "free", "sfr", "aws", "azure", "docker",
    ],
    "MATCHING": [
        "match", "rapprochement", "reconciliation", "score",
        "mapping", "invoice",
    ],
    "AUTH": [
        "login", "session", "cdp", "cookie", "totp", "auth",
        "password", "oauth", "jwt",
    ],
    "SCRAPING": [
        "download", "scraper", "portal", "pdf", "facture",
        "playwright", "selenium",
    ],
    "BUG": [
        "ko", "broken", "fix", "error", "bug", "failed",
        "crash", "exception", "marche pas",
    ],
    "TAXONOMY": [
        "supplier", "employee", "salary", "ceo", "category",
        "type", "classify", "taxonomy",
    ],
    "WORKFLOW": [
        "import", "export", "process", "workflow", "step",
        "pipeline", "batch", "deploy",
    ],
}

KNOWN_SUPPLIERS = [
    "qonto", "alan", "payfit", "anthropic", "openai", "ovh", "bouygues",
    "orange", "free", "sfr", "aws", "azure", "google", "stripe",
    "brioche", "sncf", "transavia", "uber", "deliveroo",
    "hatim", "elystek", "exodus", "inside", "vertex",
    "urssaf", "dgfip", "inpi",
]

# Words not worth tracking as keywords
STOPWORDS = {
    "the", "and", "for", "that", "this", "with", "from", "have",
    "not", "are", "was", "can", "all", "but", "you", "your", "les",
    "des", "une", "est", "que", "qui", "dans", "pour", "pas", "sur",
    "par", "avec", "plus", "une", "une", "son", "ses", "il", "elle",
    "nous", "ils", "elles", "en", "au", "aux", "du", "de", "le", "la",
    "un", "its", "has", "be", "at", "to", "in", "is", "it", "of",
    "or", "on", "if", "do", "we", "as", "an", "no", "so", "up",
    "by", "my", "me", "he", "she", "his", "her", "they", "them",
    "will", "would", "should", "could", "when", "what", "how",
    "new", "use", "add", "get", "set", "run", "see", "let",
}


def create_table(conn: sqlite3.Connection) -> None:
    conn.executescript("""
        CREATE TABLE IF NOT EXISTS session_index (
            session_id          TEXT PRIMARY KEY,
            project_name        TEXT NOT NULL,
            project_path        TEXT NOT NULL,
            session_date        TEXT NOT NULL,
            message_count       INTEGER NOT NULL DEFAULT 0,
            user_message_count  INTEGER NOT NULL DEFAULT 0,
            file_path           TEXT NOT NULL,
            file_size_bytes     INTEGER NOT NULL DEFAULT 0,
            keywords            TEXT NOT NULL DEFAULT '[]',
            suppliers_mentioned TEXT NOT NULL DEFAULT '[]',
            tools_used          TEXT NOT NULL DEFAULT '[]',
            categories          TEXT NOT NULL DEFAULT '{}',
            summary             TEXT NOT NULL DEFAULT '',
            indexed_at          TEXT NOT NULL
        );
        CREATE INDEX IF NOT EXISTS idx_session_project ON session_index(project_name);
        CREATE INDEX IF NOT EXISTS idx_session_date ON session_index(session_date);
    """)
    conn.commit()


def upsert(conn: sqlite3.Connection, entry: dict) -> None:
    conn.execute(
        """
        INSERT INTO session_index (
            session_id, project_name, project_path, session_date,
            message_count, user_message_count, file_path, file_size_bytes,
            keywords, suppliers_mentioned, tools_used, categories,
            summary, indexed_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(session_id) DO UPDATE SET
            project_name        = excluded.project_name,
            project_path        = excluded.project_path,
            session_date        = excluded.session_date,
            message_count       = excluded.message_count,
            user_message_count  = excluded.user_message_count,
            file_path           = excluded.file_path,
            file_size_bytes     = excluded.file_size_bytes,
            keywords            = excluded.keywords,
            suppliers_mentioned = excluded.suppliers_mentioned,
            tools_used          = excluded.tools_used,
            categories          = excluded.categories,
            summary             = excluded.summary,
            indexed_at          = excluded.indexed_at
        """,
        (
            entry["session_id"],
            entry["project_name"],
            entry["project_path"],
            entry["session_date"],
            entry["message_count"],
            entry["user_message_count"],
            entry["file_path"],
            entry["file_size_bytes"],
            json.dumps(entry["keywords"]),
            json.dumps(entry["suppliers_mentioned"]),
            json.dumps(entry["tools_used"]),
            json.dumps(entry["categories"]),
            entry["summary"],
            entry["indexed_at"],
        ),
    )
    conn.commit()


def extract_text_from_content(content) -> str:
    """Flatten content that may be a string or an array of content blocks."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if not isinstance(block, dict):
                continue
            block_type = block.get("type", "")
            # Skip large base64 blobs and tool results that carry binary data
            if block_type in ("image", "document"):
                continue
            text = block.get("text", "") or block.get("thinking", "")
            if isinstance(text, str) and len(text) < 50_000:
                parts.append(text)
        return " ".join(parts)
    return ""


def tokenize(text: str) -> list:
    """Simple word tokenizer — lowercase alphanumeric tokens, min 3 chars."""
    import re
    words = re.findall(r"[a-zA-ZÀ-ÿ0-9_\-]{3,}", text.lower())
    return [w for w in words if w not in STOPWORDS]


def detect_categories(text_lower: str) -> dict:
    counts = {}
    for cat, keywords in CATEGORIES.items():
        hits = sum(1 for kw in keywords if kw in text_lower)
        if hits > 0:
            counts[cat] = hits
    return counts


def detect_suppliers(text_lower: str) -> list:
    return [s for s in KNOWN_SUPPLIERS if s in text_lower]


def parse_project_name(dir_name: str) -> str:
    """
    Convert encoded directory name to a human-readable project name.
    e.g. 'c--rh-optimerp-sourcing-candidate-attraction'
         → 'rh-optimerp-sourcing-candidate-attraction'
    Leading drive letter pattern (single char + '--') is stripped.
    """
    name = dir_name.lower()
    # Strip leading drive letter prefix: 'c--', 'd--', etc.
    if len(name) >= 3 and name[1:3] == "--":
        name = name[3:]
    return name


def process_file(jsonl_path: Path) -> dict:
    """Parse a single JSONL session file and return an index entry dict."""
    session_id = jsonl_path.stem
    project_dir = jsonl_path.parent.name
    project_name = parse_project_name(project_dir)
    project_path = str(jsonl_path.parent)
    file_size = jsonl_path.stat().st_size

    # Use file modification time as session date
    mtime = jsonl_path.stat().st_mtime
    session_date = datetime.fromtimestamp(mtime, tz=timezone.utc).strftime("%Y-%m-%d")

    message_count = 0
    user_message_count = 0
    tools_used_counter: Counter = Counter()
    all_user_text_parts: list = []
    user_text_budget = 200_000  # chars — enough for keyword extraction, avoids OOM
    user_text_total = 0
    first_timestamp: str = session_date

    with open(jsonl_path, "r", encoding="utf-8", errors="replace") as fh:
        for raw_line in fh:
            raw_line = raw_line.strip()
            if not raw_line:
                continue
            try:
                obj = json.loads(raw_line)
            except (json.JSONDecodeError, ValueError):
                continue

            if not isinstance(obj, dict):
                continue

            obj_type = obj.get("type", "")

            # Capture earliest timestamp for a better session date
            ts = obj.get("timestamp")
            if isinstance(ts, str) and ts and (ts < first_timestamp or first_timestamp == session_date):
                try:
                    first_timestamp = datetime.fromisoformat(
                        ts.replace("Z", "+00:00")
                    ).strftime("%Y-%m-%d")
                except ValueError:
                    pass

            # Count tool uses from assistant messages
            if obj_type == "assistant" or obj.get("message", {}).get("role") == "assistant":
                msg = obj.get("message", obj)
                content = msg.get("content", [])
                if isinstance(content, list):
                    for block in content:
                        if isinstance(block, dict) and block.get("type") == "tool_use":
                            tool_name = block.get("name", "unknown")
                            if isinstance(tool_name, str):
                                tools_used_counter[tool_name] += 1

            # Count and collect user messages
            is_user = False
            user_text = ""

            if obj_type == "user":
                # Top-level user turn record
                msg = obj.get("message", {})
                if isinstance(msg, dict) and msg.get("role") == "user":
                    is_user = True
                    user_text = extract_text_from_content(msg.get("content", ""))

            elif isinstance(obj.get("message"), dict):
                msg = obj["message"]
                if msg.get("role") == "user":
                    is_user = True
                    user_text = extract_text_from_content(msg.get("content", ""))

            if is_user:
                message_count += 1
                user_message_count += 1
                if user_text and user_text_total < user_text_budget:
                    chunk = user_text[: user_text_budget - user_text_total]
                    all_user_text_parts.append(chunk)
                    user_text_total += len(chunk)

            # Count assistant turns too for total message_count
            elif obj_type in ("assistant",) or (
                isinstance(obj.get("message"), dict)
                and obj["message"].get("role") == "assistant"
            ):
                message_count += 1

    combined_text = " ".join(all_user_text_parts)
    combined_lower = combined_text.lower()

    # Keywords: top-20 most frequent meaningful tokens
    tokens = tokenize(combined_text)
    keyword_counts = Counter(tokens).most_common(20)
    keywords = [word for word, _ in keyword_counts]

    suppliers = detect_suppliers(combined_lower)
    categories = detect_categories(combined_lower)

    # Summary: first 500 chars of combined user text, cleaned up
    summary_raw = combined_text[:500].replace("\n", " ").strip()

    return {
        "session_id": session_id,
        "project_name": project_name,
        "project_path": project_path,
        "session_date": first_timestamp,
        "message_count": message_count,
        "user_message_count": user_message_count,
        "file_path": str(jsonl_path),
        "file_size_bytes": file_size,
        "keywords": keywords,
        "suppliers_mentioned": suppliers,
        "tools_used": list(tools_used_counter.keys()),
        "categories": categories,
        "summary": summary_raw,
        "indexed_at": datetime.now(tz=timezone.utc).isoformat(),
    }


def main() -> None:
    print(f"Session Index Backfill")
    print(f"  projects dir : {PROJECTS_DIR}")
    print(f"  db path      : {DB_PATH}")
    print()

    # Collect all JSONL files, skip subagent dirs
    jsonl_files = [
        p
        for p in PROJECTS_DIR.rglob("*.jsonl")
        if "subagents" not in str(p)
    ]
    jsonl_files.sort()
    total = len(jsonl_files)
    print(f"Found {total} session file(s) to index.\n")

    if total == 0:
        print("Nothing to do.")
        return

    DATA_ROOT.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(str(DB_PATH))
    conn.execute("PRAGMA journal_mode = WAL")
    create_table(conn)

    errors = 0
    for idx, jsonl_path in enumerate(jsonl_files, start=1):
        size_mb = jsonl_path.stat().st_size / 1_048_576
        try:
            entry = process_file(jsonl_path)
            upsert(conn, entry)
            print(
                f"[{idx:2d}/{total}] {entry['session_id'][:8]}…"
                f"  project={entry['project_name'][:45]}"
                f"  msgs={entry['user_message_count']}"
                f"  kw={len(entry['keywords'])}"
                f"  size={size_mb:.1f}MB"
            )
        except Exception as exc:  # noqa: BLE001
            errors += 1
            print(f"[{idx:2d}/{total}] ERROR {jsonl_path.name}: {exc}")

    conn.close()

    print(f"\nDone. {total - errors}/{total} sessions indexed, {errors} error(s).")
    print()

    # Verification summary
    conn_verify = sqlite3.connect(str(DB_PATH))
    rows = conn_verify.execute(
        "SELECT project_name, COUNT(*), SUM(user_message_count) "
        "FROM session_index GROUP BY project_name"
    ).fetchall()
    print("Verification — sessions per project:")
    for project, count, msgs in rows:
        print(f"  {project}: {count} sessions, {msgs or 0} user messages")
    conn_verify.close()


if __name__ == "__main__":
    main()
