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
# Step 4: Register MCPs + Token + Hooks (via heal.js — no Python)
# -----------------------------------------------------------
echo "[5/6] Registering MCPs, token, and hooks..."
node "$SCRIPT_DIR/heal.js"

echo ""
echo "========================================="
echo "  Setup complete!"
echo ""
echo "  Next steps:"
echo "  1. Restart Claude Code (close + reopen VS Code)"
echo "  2. Verify: ask Claude 'search for token tracker tools'"
echo "  3. Docs: pnpm docs:dev (http://localhost:5173)"
echo "========================================="
