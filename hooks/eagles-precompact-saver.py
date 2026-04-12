#!/usr/bin/env python3
"""EAGLES PreCompact Saver — snapshots session state before compaction.

Auto-compaction drops the raw transcript — anything the next wake-up needs
must be written to disk first. This hook parses the last N messages from
the transcript JSONL and emits a markdown snapshot containing:

- the final user prompt and assistant response
- in-progress TodoWrite state (latest call)
- recently touched files (Edit/Write tool calls)
- current working directory (from recent Bash calls)

Snapshot location: ~/.claude/sessions/precompact/<session_id>-<ts>.md

The hook MUST NOT fail — any exception exits 0 so compaction proceeds.
"""
import os
import sys
import json
import time
from pathlib import Path

SESSIONS_DIR = Path(os.path.expanduser('~')) / '.claude' / 'sessions' / 'precompact'
TAIL_MESSAGES = 60
MAX_TEXT_CHARS = 1500


def tail_transcript(path, n):
    """Return the last n JSONL entries from the transcript."""
    try:
        with open(path, 'r', encoding='utf-8') as f:
            lines = f.readlines()
    except (FileNotFoundError, PermissionError, OSError):
        return []

    entries = []
    for line in lines[-n * 3:]:
        line = line.strip()
        if not line:
            continue
        try:
            entries.append(json.loads(line))
        except json.JSONDecodeError:
            continue
    return entries[-n:]


def extract_text(content):
    """Extract text from a content field (string or list of blocks)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for block in content:
            if isinstance(block, dict) and block.get('type') == 'text':
                parts.append(block.get('text', ''))
        return '\n'.join(parts)
    return ''


def truncate(s, n=MAX_TEXT_CHARS):
    if not s:
        return ''
    s = s.strip()
    if len(s) <= n:
        return s
    return s[:n] + f'\n\n... [truncated {len(s) - n} chars]'


def collect_snapshot(entries):
    last_user = ''
    last_assistant = ''
    last_todos = None
    recent_files = []
    last_cwd = ''

    for e in entries:
        msg = e.get('message') or e
        role = msg.get('role', '')
        content = msg.get('content', '')

        if role == 'user':
            text = extract_text(content)
            if text and not text.startswith('<system-reminder>'):
                last_user = text
        elif role == 'assistant':
            if isinstance(content, list):
                text_parts = [b.get('text', '') for b in content if isinstance(b, dict) and b.get('type') == 'text']
                if text_parts:
                    last_assistant = '\n'.join(text_parts)
                for b in content:
                    if not isinstance(b, dict) or b.get('type') != 'tool_use':
                        continue
                    name = b.get('name', '')
                    inp = b.get('input', {}) or {}
                    if name == 'TodoWrite':
                        last_todos = inp.get('todos', last_todos)
                    elif name in ('Edit', 'Write'):
                        fp = inp.get('file_path', '')
                        if fp and fp not in recent_files:
                            recent_files.append(fp)
                    elif name == 'Bash':
                        cmd = inp.get('command', '')
                        if 'cd ' in cmd or 'pwd' in cmd:
                            last_cwd = cmd[:120]

    return {
        'last_user': truncate(last_user),
        'last_assistant': truncate(last_assistant),
        'todos': last_todos,
        'files': recent_files[-15:],
        'cwd_hint': last_cwd,
    }


def render_markdown(session_id, trigger, snap):
    ts = time.strftime('%Y-%m-%dT%H:%M:%SZ')
    lines = [
        f'# PreCompact Snapshot',
        '',
        f'- **session_id**: `{session_id}`',
        f'- **trigger**: `{trigger}`',
        f'- **saved_at**: {ts}',
        '',
        '## Last user prompt',
        '',
        snap['last_user'] or '_(none captured)_',
        '',
        '## Last assistant message',
        '',
        snap['last_assistant'] or '_(none captured)_',
        '',
    ]

    if snap['todos']:
        lines.append('## Todos at compact time')
        lines.append('')
        for t in snap['todos']:
            if not isinstance(t, dict):
                continue
            status = t.get('status', '?')
            content = t.get('content', '')
            marker = {'completed': '[x]', 'in_progress': '[~]', 'pending': '[ ]'}.get(status, '[?]')
            lines.append(f'- {marker} {content}')
        lines.append('')

    if snap['files']:
        lines.append('## Recently touched files')
        lines.append('')
        for f in snap['files']:
            lines.append(f'- `{f}`')
        lines.append('')

    if snap['cwd_hint']:
        lines.append('## CWD hint')
        lines.append('')
        lines.append(f'`{snap["cwd_hint"]}`')
        lines.append('')

    return '\n'.join(lines)


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError, ValueError):
        sys.exit(0)

    tp = data.get('transcript_path', '')
    session_id = data.get('session_id', 'unknown')
    trigger = data.get('trigger', 'unknown')

    if not tp or not os.path.exists(tp):
        sys.exit(0)

    try:
        entries = tail_transcript(tp, TAIL_MESSAGES)
        if not entries:
            sys.exit(0)

        snap = collect_snapshot(entries)
        md = render_markdown(session_id, trigger, snap)

        SESSIONS_DIR.mkdir(parents=True, exist_ok=True)
        ts = time.strftime('%Y%m%d-%H%M%S')
        out = SESSIONS_DIR / f'{session_id[:8]}-{ts}.md'
        out.write_text(md, encoding='utf-8')

        print(f'[precompact-saver] snapshot written: {out.name} (trigger={trigger})')
    except Exception:
        pass

    sys.exit(0)


if __name__ == '__main__':
    main()
