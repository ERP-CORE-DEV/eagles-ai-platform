# Hooks

Claude Code hooks extend the platform by intercepting tool calls before and after execution.

## Overview

| Hook | Event | Purpose |
|------|-------|---------|
| `cost-router.py` | PreToolUse (Agent) | **Forces** subagents to optimal model tier |
| `token-tracker-hook.py` | PostToolUse (all tools) | Records every tool call to SQLite |
| `skill-extractor.py` | Stop (session end) | Auto-extracts tool patterns to SonaLearningStore |
| `rate-limit-detector.py` | PostToolUse (Agent, Bash, Web, MCP) | Detects rate limits and warns |

## cost-router.py

**Event**: `PreToolUse` (Agent tool only)
**Location**: `~/.claude/hooks/cost-router.py`
**Effect**: **Forces** model selection via `hookSpecificOutput.updatedInput` (merged, not replaced)

### Model Routing Table

| Agent Type | Recommended Model | Rationale |
|-----------|-------------------|-----------|
| Explore, claude-code-guide, framework-advisor, statusline-setup | **haiku** | Simple lookups, fast searches |
| code-reviewer, Plan, planner, all language reviewers, codegen, devsecops, tdd-guide, e2e-runner, verifier, doc-* agents | **sonnet** | Code analysis, generation |
| architect, orchestrator, doc-orchestrator, researcher, architecture-explorer, qa-tester, general-purpose | **opus** | Complex reasoning (default) |

### How It Works

```python
# Reads Agent tool_input from stdin
# Checks subagent_type against routing tables
# Prints recommendation (advisory only)
# Respects explicit model parameter if already set
```

::: warning
The cost-router is **advisory only**. It prints a recommendation but cannot force the model parameter. Claude Code must voluntarily apply the suggestion.
:::

### Installation

```bash
# Copy to hooks directory
cp hooks/cost-router.py ~/.claude/hooks/cost-router.py
```

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PreToolUse": [
      {
        "matcher": "Agent",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import sys,json,os; exec(open(os.path.join(os.path.expanduser('~'),'.claude','hooks','cost-router.py')).read())\" 2>NUL || ver>NUL"
          }
        ]
      }
    ]
  }
}
```

## token-tracker-hook.py

**Event**: `PostToolUse` (all tools)
**Location**: `~/.claude/hooks/token-tracker-hook.py`
**Effect**: Writes to token-tracker MCP's SQLite database

### Tracked Tools

All Claude Code tools are tracked:

| Tool | Input Estimation | Output Estimation |
|------|-----------------|-------------------|
| Agent | prompt text | result text |
| Read | file path | file content |
| Edit / Write | old_string + new_string | result |
| Bash | command | stdout |
| Grep / Glob | pattern | results |
| WebFetch / WebSearch | URL / query | response |
| TodoWrite | JSON | - |
| ToolSearch | query | - |
| mcp__* | JSON input | JSON result |

### Token Estimation

Since Claude Code hooks don't receive actual token counts, the hook estimates:

```python
CHARS_PER_TOKEN = 4  # Conservative estimate

# Per-tool overhead (context tokens for the tool call itself)
TOOL_OVERHEAD = {
    'Agent': 0,       # Has its own tracking
    'Read': 500,      # File content returned
    'Edit': 300,      # Old + new strings
    'Write': 400,     # File content
    'Bash': 200,      # Command + output
    'Grep': 300,      # Pattern + results
    'Glob': 150,      # Pattern + file list
    'WebFetch': 800,  # URL content
    'WebSearch': 600, # Search results
}
```

### Pricing Model

```python
PRICING = {
    'opus':   { 'input': 0.015,  'output': 0.075 },   # per 1K tokens
    'sonnet': { 'input': 0.003,  'output': 0.015 },
    'haiku':  { 'input': 0.00025, 'output': 0.00125 },
}
```

::: info
For **Max subscription** users (flat monthly fee), cost tracking is informational — useful for understanding usage patterns and optimizing speed, not financial impact.
:::

### Installation

```bash
cp hooks/token-tracker-hook.py ~/.claude/hooks/token-tracker-hook.py
```

Add to `~/.claude/settings.json`:

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Agent|Read|Edit|Write|Bash|Grep|Glob|WebFetch|WebSearch|TodoWrite|ToolSearch|mcp__.*",
        "hooks": [
          {
            "type": "command",
            "command": "python3 -c \"import sys,json,os; exec(open(os.path.join(os.path.expanduser('~'),'.claude','hooks','token-tracker-hook.py')).read())\" 2>NUL || ver>NUL"
          }
        ]
      }
    ]
  }
}
```

### Database Schema

The hook writes directly to the token-tracker MCP's SQLite:

```
Path: $EAGLES_DATA_ROOT/token-ledger/ledger.sqlite
Table: token_records

Columns:
  id                  TEXT PRIMARY KEY
  session_id          TEXT
  model_name          TEXT
  prompt_tokens       INTEGER
  completion_tokens   INTEGER
  total_tokens        INTEGER
  cache_read_tokens   INTEGER
  cache_write_tokens  INTEGER
  estimated_cost_usd  REAL
  recorded_at         TEXT (ISO 8601)
  wave_number         INTEGER
  agent_name          TEXT
  tool_name           TEXT
```

## skill-extractor.py

**Event**: `Stop` (session end)
**Location**: `~/.claude/hooks/skill-extractor.py`
**Effect**: Auto-extracts tool patterns from session transcript into SonaLearningStore

### What It Learns

| Pattern Type | Example | Tags |
|-------------|---------|------|
| **Tool sequences** | `Grep -> Read -> Edit` (3x) | `sequence`, `auto` |
| **Agent combos** | `agents:Explore+code-reviewer` | `combo`, `auto` |
| **Session profiles** | `profile:Read+Edit+Bash` | `profile`, `auto` |

### How It Works

1. Receives `transcript_path` from Stop hook stdin (JSONL file)
2. Parses all tool calls from the session
3. Extracts recurring n-gram sequences (2-4 tools)
4. Records agent combinations used together
5. Writes patterns to `$EAGLES_DATA_ROOT/orchestrator/orchestrator.sqlite`
6. Uses EMA scoring (alpha=0.3) — successful sessions boost pattern score

Patterns are available via the orchestrator MCP's `learn_suggest` tool.

::: info
Patterns auto-archive when their success rate drops below 20% after 5+ attempts (EMA pruning).
:::

## rate-limit-detector.py

**Event**: `PostToolUse` (Agent, Bash, WebFetch, WebSearch, MCP tools)
**Location**: `~/.claude/hooks/rate-limit-detector.py`
**Effect**: Detects rate limit responses and warns with advisory message

### Detection Signals

Scans tool results for: `rate_limit`, `too many requests`, `429`, `throttled`, `quota exceeded`, `capacity`, `overloaded`

### Behavior

1. **Detected**: Logs `RATE_LIMIT` event to token-tracker SQLite, writes state file, prints warning
2. **Not detected**: Clears stale state file after 120s recovery window
3. **Non-blocking**: Uses exit code 1 (warning only, never blocks execution)

### State File

`~/.claude/.rate-limit-state` — JSON with last rate limit timestamp. Enables cross-session awareness (new session can check if recently rate-limited).
