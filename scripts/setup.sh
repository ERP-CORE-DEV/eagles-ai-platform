#!/usr/bin/env bash
set -euo pipefail

# EAGLES AI Platform — One-command setup
# Installs, builds, registers MCPs, copies hooks, and verifies.
# Usage: bash scripts/setup.sh

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
# Convert to forward-slash path for JSON (Windows compatibility)
PROJECT_PATH="${PROJECT_ROOT//\\//}"

CLAUDE_JSON="$HOME/.claude.json"
CLAUDE_SETTINGS="$HOME/.claude/settings.json"
HOOKS_DIR="$HOME/.claude/hooks"

echo "========================================="
echo "  EAGLES AI Platform — Setup"
echo "  7 MCP servers | 52 tools | 62 skills"
echo "========================================="
echo ""

# -----------------------------------------------------------
# Step 1: Create data directories
# -----------------------------------------------------------
echo "[1/6] Creating data directories..."
mkdir -p "$PROJECT_ROOT/.data/token-ledger"
mkdir -p "$PROJECT_ROOT/.data/vector-memory"
mkdir -p "$PROJECT_ROOT/.data/drift-detector"
mkdir -p "$PROJECT_ROOT/.data/provider-router"
mkdir -p "$PROJECT_ROOT/.data/verification"
mkdir -p "$PROJECT_ROOT/.data/orchestrator"
mkdir -p "$PROJECT_ROOT/.data/events"
echo "  Done."

# -----------------------------------------------------------
# Step 2: Install + build
# -----------------------------------------------------------
echo "[2/6] Installing dependencies..."
cd "$PROJECT_ROOT"
pnpm install --frozen-lockfile 2>/dev/null || pnpm install
echo ""

echo "[3/6] Building all packages (ordered)..."
pnpm run build:ordered
echo ""

# -----------------------------------------------------------
# Step 3: Run tests
# -----------------------------------------------------------
echo "[4/6] Running tests..."
if pnpm test 2>&1 | tail -5; then
    echo "  Tests passed."
else
    echo "  WARNING: Some tests failed. Check output above."
fi
echo ""

# -----------------------------------------------------------
# Step 4: Register MCP servers in ~/.claude.json
# -----------------------------------------------------------
echo "[5/6] Registering MCP servers in ~/.claude.json..."

# Create ~/.claude.json if it doesn't exist
if [ ! -f "$CLAUDE_JSON" ]; then
    echo '{}' > "$CLAUDE_JSON"
fi

# Use python3 to safely merge MCP config (preserves existing entries)
python3 -c "
import json, sys

claude_json_path = '$CLAUDE_JSON'
project_path = '$PROJECT_PATH'

try:
    with open(claude_json_path, 'r') as f:
        config = json.load(f)
except (json.JSONDecodeError, FileNotFoundError):
    config = {}

if 'mcpServers' not in config:
    config['mcpServers'] = {}

servers = {
    'token-tracker': 'token-tracker-mcp',
    'provider-router': 'provider-router-mcp',
    'vector-memory': 'vector-memory-mcp',
    'drift-detector': 'drift-detector-mcp',
    'verification': 'verification-mcp',
    'orchestrator': 'orchestrator-mcp',
}

data_root = project_path + '/.data'
added = []
skipped = []

for name, pkg in servers.items():
    if name in config['mcpServers']:
        skipped.append(name)
        continue
    config['mcpServers'][name] = {
        'type': 'stdio',
        'command': 'node',
        'args': [project_path + '/packages/' + pkg + '/dist/index.js'],
        'env': {'EAGLES_DATA_ROOT': data_root}
    }
    added.append(name)

with open(claude_json_path, 'w') as f:
    json.dump(config, f, indent=2)

if added:
    print(f'  Added: {', '.join(added)}')
if skipped:
    print(f'  Already registered: {', '.join(skipped)}')
if not added and not skipped:
    print('  No changes needed.')
"
echo ""

# -----------------------------------------------------------
# Step 5: Copy hooks + wire settings.json
# -----------------------------------------------------------
echo "[6/6] Installing Claude Code hooks..."
mkdir -p "$HOOKS_DIR"

# Copy hook files
cp "$PROJECT_ROOT/hooks/cost-router.py" "$HOOKS_DIR/cost-router.py" 2>/dev/null && echo "  Copied cost-router.py" || echo "  cost-router.py not found in repo"
cp "$PROJECT_ROOT/hooks/token-tracker-hook.py" "$HOOKS_DIR/token-tracker-hook.py" 2>/dev/null && echo "  Copied token-tracker-hook.py" || echo "  token-tracker-hook.py not found in repo"
cp "$PROJECT_ROOT/hooks/skill-extractor.py" "$HOOKS_DIR/skill-extractor.py" 2>/dev/null && echo "  Copied skill-extractor.py" || true
cp "$PROJECT_ROOT/hooks/rate-limit-detector.py" "$HOOKS_DIR/rate-limit-detector.py" 2>/dev/null && echo "  Copied rate-limit-detector.py" || true

# Wire hooks into settings.json (only if not already present)
python3 -c "
import json, os

settings_path = '$CLAUDE_SETTINGS'

try:
    with open(settings_path, 'r') as f:
        settings = json.load(f)
except (json.JSONDecodeError, FileNotFoundError):
    settings = {}

if 'hooks' not in settings:
    settings['hooks'] = {}

# PreToolUse: cost-router for Agent
pre_hooks = settings['hooks'].get('PreToolUse', [])
has_cost_router = any('cost-router' in str(h) for h in pre_hooks)
if not has_cost_router:
    pre_hooks.append({
        'matcher': 'Agent',
        'hooks': [{
            'type': 'command',
            'command': 'python3 -c \"import sys,json,os; exec(open(os.path.join(os.path.expanduser(\\\"~\\\"),\\\".claude\\\",\\\"hooks\\\",\\\"cost-router.py\\\")).read())\" 2>NUL || ver>NUL'
        }]
    })
    settings['hooks']['PreToolUse'] = pre_hooks
    print('  Added PreToolUse cost-router hook')
else:
    print('  PreToolUse cost-router already configured')

# PostToolUse: token-tracker for all tools
post_hooks = settings['hooks'].get('PostToolUse', [])
has_tracker = any('token-tracker' in str(h) for h in post_hooks)
if not has_tracker:
    post_hooks.append({
        'matcher': 'Agent|Read|Edit|Write|Bash|Grep|Glob|WebFetch|WebSearch|TodoWrite|ToolSearch|mcp__.*',
        'hooks': [{
            'type': 'command',
            'command': 'python3 -c \"import sys,json,os; exec(open(os.path.join(os.path.expanduser(\\\"~\\\"),\\\".claude\\\",\\\"hooks\\\",\\\"token-tracker-hook.py\\\")).read())\" 2>NUL || ver>NUL'
        }]
    })
    settings['hooks']['PostToolUse'] = post_hooks
    print('  Added PostToolUse token-tracker hook')
else:
    print('  PostToolUse token-tracker already configured')

with open(settings_path, 'w') as f:
    json.dump(settings, f, indent=2)
" 2>/dev/null || echo "  WARNING: Could not auto-configure hooks. See docs/guide/hooks.md for manual setup."

echo ""
echo "========================================="
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Restart Claude Code (close + reopen VS Code)"
echo "  2. Verify: ask Claude 'search for token tracker tools'"
echo "  3. Docs: pnpm docs:dev (http://localhost:5173)"
echo "========================================="
