# Configuration

## MCP Server Registration

All MCP servers are registered in `~/.claude.json` under the `mcpServers` key.

### Required Environment Variable

| Variable | Default | Description |
|----------|---------|-------------|
| `EAGLES_DATA_ROOT` | `{cwd}/.data` | Root directory for all SQLite databases |

All servers **must** share the same `EAGLES_DATA_ROOT` for inter-MCP communication via the EventBus.

### Server Configuration Template

```json
{
  "mcpServers": {
    "<server-name>": {
      "type": "stdio",
      "command": "node",
      "args": ["<path>/packages/<server>-mcp/dist/index.js"],
      "env": {
        "EAGLES_DATA_ROOT": "<path>/eagles-ai-platform/.data"
      }
    }
  }
}
```

### All Servers

```json
{
  "mcpServers": {
    "token-tracker": {
      "type": "stdio",
      "command": "node",
      "args": ["<PATH>/packages/token-tracker-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "<PATH>/.data" }
    },
    "provider-router": {
      "type": "stdio",
      "command": "node",
      "args": ["<PATH>/packages/provider-router-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "<PATH>/.data" }
    },
    "vector-memory": {
      "type": "stdio",
      "command": "node",
      "args": ["<PATH>/packages/vector-memory-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "<PATH>/.data" }
    },
    "drift-detector": {
      "type": "stdio",
      "command": "node",
      "args": ["<PATH>/packages/drift-detector-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "<PATH>/.data" }
    },
    "verification": {
      "type": "stdio",
      "command": "node",
      "args": ["<PATH>/packages/verification-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "<PATH>/.data" }
    },
    "orchestrator": {
      "type": "stdio",
      "command": "node",
      "args": ["<PATH>/packages/orchestrator-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "<PATH>/.data" }
    }
  }
}
```

Replace `<PATH>` with your actual installation path (e.g., `C:/RH-OptimERP/eagles-ai-platform`).

::: warning Windows Paths
Use **forward slashes** (`C:/RH-OptimERP/...`) in `~/.claude.json`, not backslashes.
:::

## Hook Configuration

Hooks are configured in `~/.claude/settings.json` under the `hooks` key.

### Hook Events

| Event | Timing | Can Block? |
|-------|--------|-----------|
| `PreToolUse` | Before tool execution | Yes (exit code 2) |
| `PostToolUse` | After tool execution | No (advisory only) |
| `SessionStart` | When Claude Code starts | No |
| `Stop` | When session ends | No |
| `PreCompact` | Before context compaction | No |

### Matcher Syntax

Matchers use regex pattern matching:

```json
{
  "matcher": "Agent",           // Single tool
  "matcher": "Edit|Write",      // Multiple tools
  "matcher": "mcp__.*",         // All MCP tools
  "matcher": "Agent|Read|Edit|Write|Bash|Grep|Glob"  // Many tools
}
```

### Hook stdin Format

```json
{
  "hook_event_name": "PreToolUse",
  "session_id": "abc123",
  "tool_name": "Agent",
  "tool_input": { "subagent_type": "Explore", "prompt": "..." },
  "tool_result": {}
}
```

### Hook Output

| Exit Code | Meaning |
|-----------|---------|
| 0 | Allow (continue execution) |
| 1 | Warn (print to console, continue) |
| 2 | Block (prevent tool execution) |

Stdout text is shown as advisory messages in Claude Code.

## Data Directory Structure

```
$EAGLES_DATA_ROOT/
├── token-ledger/
│   └── ledger.sqlite
├── vector-memory/
│   ├── memory.sqlite
│   └── vectors.hnsw
├── drift-detector/
│   └── drift.sqlite
├── provider-router/
│   └── provider.sqlite
├── verification/
│   └── verification.sqlite
├── orchestrator/
│   └── orchestrator.sqlite
└── events/
    └── eventbus.sqlite
```

All databases use **SQLite WAL mode** for concurrent access.
