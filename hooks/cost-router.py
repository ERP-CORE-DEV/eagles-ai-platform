#!/usr/bin/env python3
"""EAGLES Cost Router — PreToolUse hook for Agent tool calls.

Prints model routing recommendation as additionalContext.
Claude Code reads this and should apply the model parameter.

Cannot use updatedInput (breaks Agent tool's subagent_type).
Instead uses additionalContext to instruct Claude which model to use.

Tiers:
  haiku  — Explore, search, quick lookups (60x cheaper than opus)
  sonnet — Code review, planning, generation (5x cheaper than opus)
  opus   — Architecture, orchestration, complex debug (default)
"""
import sys
import json

HAIKU_AGENTS = {
    'Explore',
    'claude-code-guide',
    'framework-advisor',
    'statusline-setup',
}

SONNET_AGENTS = {
    'code-reviewer',
    'Plan',
    'planner',
    'python-reviewer',
    'go-reviewer',
    'java-reviewer',
    'rust-reviewer',
    'ruby-reviewer',
    'php-reviewer',
    'go-build-resolver',
    'build-error-resolver',
    'database-reviewer',
    'security-reviewer',
    'doc-code-analyst',
    'doc-official-writer',
    'doc-hub-architect',
    'doc-diagram-artist',
    'doc-updater',
    'refactor-cleaner',
    'tdd-guide',
    'e2e-runner',
    'verifier',
    'codegen',
    'devsecops',
}

def main():
    try:
        data = json.load(sys.stdin)
    except (json.JSONDecodeError, EOFError):
        sys.exit(0)

    tool_input = data.get('tool_input', {})
    subagent_type = tool_input.get('subagent_type', '')

    # If user explicitly set model, respect it
    if tool_input.get('model'):
        sys.exit(0)

    target_model = None
    savings = ''
    if subagent_type in HAIKU_AGENTS:
        target_model = 'haiku'
        savings = '60x cheaper'
    elif subagent_type in SONNET_AGENTS:
        target_model = 'sonnet'
        savings = '5x cheaper'

    if target_model:
        print(f'[cost-router] @{subagent_type} should use model:{target_model} ({savings} than opus)')

    sys.exit(0)

if __name__ == '__main__':
    main()
