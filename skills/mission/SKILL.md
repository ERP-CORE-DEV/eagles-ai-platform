---
name: mission
description: Start an EAGLES mission from natural language. Auto-discovers scope, selects skills, enrolls DAG.
---

Parse the user's input and call the `mcp__orchestrator__mission_start` tool with it.

The tool accepts natural language in French or English:
- `/mission agent-comptable` → full architecture review
- `/mission vérif sécu compta` → security audit on agent-comptable
- `/mission fix the broken tests` → bug-fix on current project
- `/mission eagles test-coverage --scope packages` → targeted testing
- `/mission compta /security-scan /gdpr-check` → forced skill overrides

The tool auto-handles:
- French/English normalization (aliases for 50+ terms)
- Project detection from keywords or current directory
- Intent classification → goal + skill bundle selection
- Scope discovery from CLAUDE.md + file tree
- DAG auto-enrollment via task_create

If project cannot be determined, it returns candidates to choose from.
If intent is ambiguous, it returns clarification request.
