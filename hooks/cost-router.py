#!/usr/bin/env python3
"""EAGLES Cost Router — PreToolUse hook for Agent tool calls.

FORCES model routing via hookSpecificOutput.updatedInput (merged, not replaced).
Previous advisory-only approach was ineffective — Claude ignored recommendations.

Key fix: output the FULL tool_input with model field added/overridden.
This preserves subagent_type, prompt, description, and all other fields.

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
        # FORCE model by merging into full tool_input (preserves all other fields)
        merged_input = {**tool_input, 'model': target_model}
        hook_output = {
            "hookSpecificOutput": {
                "updatedInput": merged_input
            }
        }
        print(json.dumps(hook_output))

    sys.exit(0)

if __name__ == '__main__':
    main()
