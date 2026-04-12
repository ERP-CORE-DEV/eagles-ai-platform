# Team Setup

Step-by-step guide for team members to install and configure the EAGLES AI Platform.

## Prerequisites

Ensure you have:
- **Node.js 20+**: `node --version`
- **pnpm 9+**: `npm install -g pnpm`
- **Python 3**: `python3 --version` (for hooks)
- **Claude Code**: With MCP support enabled
- **Git**: Access to `ERP-CORE-DEV/eagles-ai-platform`

## Step 1: Clone and Build

```bash
# Clone the repository
git clone https://github.com/ERP-CORE-DEV/eagles-ai-platform.git
cd eagles-ai-platform

# Install all dependencies
pnpm install

# Build in dependency order
pnpm build:ordered

# Verify — all 484 tests should pass
pnpm test
```

## Step 2: Register MCP Servers

Edit `~/.claude.json` and add all 7 MCP servers under the `mcpServers` key.

::: warning IMPORTANT
Edit `~/.claude.json` (NOT `~/.claude/.mcp.json`). The `.mcp.json` file inside `~/.claude/` is not read by Claude Code.
:::

Replace `YOUR_PATH` with your actual clone path:

```json
{
  "mcpServers": {
    "token-tracker": {
      "type": "stdio",
      "command": "node",
      "args": ["YOUR_PATH/eagles-ai-platform/packages/token-tracker-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "YOUR_PATH/eagles-ai-platform/.data" }
    },
    "provider-router": {
      "type": "stdio",
      "command": "node",
      "args": ["YOUR_PATH/eagles-ai-platform/packages/provider-router-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "YOUR_PATH/eagles-ai-platform/.data" }
    },
    "vector-memory": {
      "type": "stdio",
      "command": "node",
      "args": ["YOUR_PATH/eagles-ai-platform/packages/vector-memory-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "YOUR_PATH/eagles-ai-platform/.data" }
    },
    "drift-detector": {
      "type": "stdio",
      "command": "node",
      "args": ["YOUR_PATH/eagles-ai-platform/packages/drift-detector-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "YOUR_PATH/eagles-ai-platform/.data" }
    },
    "verification": {
      "type": "stdio",
      "command": "node",
      "args": ["YOUR_PATH/eagles-ai-platform/packages/verification-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "YOUR_PATH/eagles-ai-platform/.data" }
    },
    "orchestrator": {
      "type": "stdio",
      "command": "node",
      "args": ["YOUR_PATH/eagles-ai-platform/packages/orchestrator-mcp/dist/index.js"],
      "env": { "EAGLES_DATA_ROOT": "YOUR_PATH/eagles-ai-platform/.data" }
    },
    "frontend-catalog": {
      "type": "stdio",
      "command": "node",
      "args": ["YOUR_PATH/eagles-ai-platform/packages/frontend-catalog-mcp/dist/index.js"],
      "env": { "FRONTEND_CATALOG_ROOT": "YOUR_PATH/eagles-ai-platform/packages/frontend-catalog" }
    }
  }
}
```

Note: `frontend-catalog` does not use `EAGLES_DATA_ROOT` — it reads the design-system package directly and holds no SQLite state.

## Step 3: Install Hooks

Copy the hook files to your Claude hooks directory:

```bash
# Create hooks directory if it doesn't exist
mkdir -p ~/.claude/hooks

# Copy hooks
cp eagles-ai-platform/hooks/cost-router.py ~/.claude/hooks/
cp eagles-ai-platform/hooks/token-tracker-hook.py ~/.claude/hooks/
```

Then add the hook configuration to `~/.claude/settings.json`:

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
    ],
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

## Step 4: Restart and Verify

1. **Restart Claude Code** (close and reopen VS Code)
2. In Claude Code, verify MCP tools are available:
   - Type: "search for token tracker tools" — should find `record_token_usage`, `get_cost_report`, etc.
   - Type: "search for memory tools" — should find `memory_store`, `memory_search`, etc.

## Step 5: Live Documentation

```bash
cd eagles-ai-platform
pnpm docs:dev
```

Opens the documentation hub at `http://localhost:5173` with hot-reload on file changes.

## Troubleshooting

### MCP tools not appearing
- Verify `~/.claude.json` (not `~/.claude/.mcp.json`)
- Check paths use forward slashes on Windows (`C:/` not `C:\`)
- Ensure `pnpm build` completed without errors
- Restart Claude Code completely

### Hooks not firing
- Check `python3` is in PATH: `python3 --version`
- Verify hook files exist: `ls ~/.claude/hooks/`
- Check `~/.claude/settings.json` has correct hook config

### Build failures
- Run `pnpm build:ordered` (not `pnpm build`) for first build
- Ensure Node.js 20+: `node --version`
- Clear and rebuild: `pnpm clean && pnpm install && pnpm build:ordered`

### Vector memory first-run delay
- First use downloads the embedding model (~90MB)
- Subsequent uses are instant (model is cached)
