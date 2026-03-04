#!/usr/bin/env python3
"""EAGLES Token Tracker — PostToolUse hook for ALL tool calls.

Records every Claude Code tool call into the token-tracker MCP's SQLite store.
Tracks: Agent, Read, Edit, Write, Bash, Grep, Glob, WebFetch, WebSearch, MCP tools.

DB path: C:/RH-OptimERP/eagles-ai-platform/.data/token-ledger/ledger.sqlite
Table: token_records (matches MCP schema exactly)
"""
import sys
import json
import sqlite3
import time
import hashlib

TOKEN_DB = 'C:/RH-OptimERP/eagles-ai-platform/.data/token-ledger/ledger.sqlite'

# Pricing per 1K tokens (as of 2026-03)
PRICING = {
    'opus':   {'input': 0.015,  'output': 0.075},
    'sonnet': {'input': 0.003,  'output': 0.015},
    'haiku':  {'input': 0.00025, 'output': 0.00125},
}

CHARS_PER_TOKEN = 4

# Estimated token cost per tool call type (input + output overhead)
# These represent the context tokens Claude uses to make and process each tool call
TOOL_OVERHEAD = {
    'Agent':     0,       # Agent has its own tracking via prompt/result size
    'Read':      500,     # file content returned to context
    'Edit':      300,     # old_string + new_string in context
    'Write':     400,     # file content in context
    'Bash':      200,     # command + output in context
    'Grep':      300,     # pattern + results in context
    'Glob':      150,     # pattern + file list in context
    'WebFetch':  800,     # URL content fetched and processed
    'WebSearch': 600,     # search results in context
    'TodoWrite': 50,      # small JSON
    'ToolSearch':100,     # tool discovery
}


def estimate_tokens(text):
    if not text:
        return 0
    return max(1, len(str(text)) // CHARS_PER_TOKEN)


def record_usage(model, input_tokens, output_tokens, tool_name, description):
    """Write to token_records table (same schema as token-tracker MCP)."""
    try:
        conn = sqlite3.connect(TOKEN_DB, timeout=5)
        conn.execute('PRAGMA journal_mode=WAL')

        prices = PRICING.get(model, PRICING['opus'])
        cost = (input_tokens / 1000 * prices['input']) + (output_tokens / 1000 * prices['output'])
        total_tokens = input_tokens + output_tokens

        record_id = hashlib.sha256(f'{time.time()}-{tool_name}-{description}'.encode()).hexdigest()[:16]

        conn.execute(
            '''INSERT OR IGNORE INTO token_records
               (id, session_id, model_name, prompt_tokens, completion_tokens, total_tokens,
                cache_read_tokens, cache_write_tokens, estimated_cost_usd, recorded_at,
                wave_number, agent_name, tool_name)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)''',
            (
                record_id,
                time.strftime('%Y-%m-%d'),
                f'claude-{model}-4-6' if model in ('opus', 'sonnet') else f'claude-{model}-4-5',
                input_tokens,
                output_tokens,
                total_tokens,
                0, 0,
                round(cost, 6),
                time.strftime('%Y-%m-%dT%H:%M:%SZ'),
                None,
                description[:50] if description else tool_name,
                tool_name,
            )
        )
        conn.commit()
        conn.close()
        return cost
    except Exception:
        return 0.0


def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    tool_name = data.get('tool_name', 'unknown')
    tool_input = data.get('tool_input', {})
    tool_result = data.get('tool_result', {})

    # Determine model — Agent calls have explicit model, everything else uses main model (opus)
    model = 'opus'  # default: main Claude Code model

    # Extract result text for token estimation
    result_text = ''
    if isinstance(tool_result, dict):
        result_text = tool_result.get('stdout', '') or tool_result.get('output', '') or ''
        if not result_text:
            result_text = json.dumps(tool_result)[:2000]
    elif isinstance(tool_result, str):
        result_text = tool_result

    # Extract input text for token estimation
    input_text = ''
    description = tool_name

    if tool_name == 'Agent':
        model = tool_input.get('model', 'opus')
        input_text = tool_input.get('prompt', '')
        description = f"@{tool_input.get('subagent_type', 'unknown')}: {tool_input.get('description', '')}"

    elif tool_name == 'Read':
        # File read: input = file path, output = file content
        input_text = tool_input.get('file_path', '')
        description = f"Read: {tool_input.get('file_path', '')[-40:]}"

    elif tool_name in ('Edit', 'Write'):
        input_text = tool_input.get('old_string', '') + tool_input.get('new_string', '') + tool_input.get('content', '')
        fp = tool_input.get('file_path', '')
        description = f"{tool_name}: {fp[-40:]}"

    elif tool_name == 'Bash':
        input_text = tool_input.get('command', '')
        description = f"Bash: {input_text[:40]}"

    elif tool_name == 'Grep':
        input_text = tool_input.get('pattern', '')
        description = f"Grep: {input_text[:40]}"

    elif tool_name == 'Glob':
        input_text = tool_input.get('pattern', '')
        description = f"Glob: {input_text[:40]}"

    elif tool_name in ('WebFetch', 'WebSearch'):
        input_text = tool_input.get('url', '') or tool_input.get('query', '')
        description = f"{tool_name}: {input_text[:40]}"

    elif tool_name.startswith('mcp__'):
        # MCP tool calls
        input_text = json.dumps(tool_input)[:500]
        description = f"MCP: {tool_name}"

    else:
        input_text = json.dumps(tool_input)[:200]

    # Calculate tokens
    input_tokens = estimate_tokens(input_text)
    output_tokens = estimate_tokens(result_text)

    # Add tool overhead (context tokens Claude uses for the tool call itself)
    base_tool = tool_name.split('__')[0] if tool_name.startswith('mcp__') else tool_name
    overhead = TOOL_OVERHEAD.get(base_tool, 200)
    input_tokens += overhead

    cost = record_usage(model, input_tokens, output_tokens, tool_name, description)

    # Only print for significant costs (> $0.01)
    if cost > 0.01:
        print(f'[token-tracker] {description} ({model}): ~{input_tokens + output_tokens} tokens ~ ${cost:.4f}')

    sys.exit(0)


if __name__ == '__main__':
    main()
