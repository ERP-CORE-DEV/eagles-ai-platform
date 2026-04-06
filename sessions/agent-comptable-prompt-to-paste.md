# PROMPT TO PASTE IN AGENT-COMPTABLE CHAT

**Instructions**: Open a new Claude Code session at `C:/agent-comptable`, then paste the block below as your first message.

---

## PROMPT START ▼▼▼

You are operating on **agent-comptable** (invoice automation platform, 94K Python LOC, zero active test coverage). I need a **deep architecture review** using the EAGLES AI Platform framework.

## EAGLES Platform Context (load this)

EAGLES AI Platform is at `C:/RH-OptimERP/eagles-ai-platform`. Key components you MUST use:

**MCP Servers available in this session** (verify via ToolSearch):
- `mcp__orchestrator__*` — 14 tools including `task_create`, `task_build_decomposition_prompt`, `task_apply_decomposition`, `agent_message_send`, `learn_pattern`, `learn_suggest`
- `mcp__vector-memory__*` — semantic memory (memory_store, memory_search, memory_stats)
- `mcp__drift-detector__*` — 5-metric drift scoring (drift_set_requirements, drift_checkpoint, drift_compare)
- `mcp__verification__*` — output validation (verify_output, verify_checkpoint_create)
- `mcp__provider-router__*` — LLM routing
- `mcp__token-tracker__*` — cost tracking

**Active hooks (enforced automatically)**:
1. SessionStart: surfaces top 10 skills from 62-skill catalog
2. UserPromptSubmit: recalls matching patterns from SonaLearning
3. **PreToolUse HARD-STOP**: blocks Edit/Write/MultiEdit at 4th mutation without `task_create` call — **exit code 2**
4. PostToolUse: telemetry logging

**Escape hatch**: `EAGLES_BYPASS=1` env var (don't use unless single-file trivial edit).

## MANDATORY WORKFLOW

1. **FIRST**: Call `mcp__orchestrator__task_create` to enroll DAG (this is non-negotiable — hook will block you otherwise)
2. **SECOND**: Set drift requirements via `mcp__drift-detector__drift_set_requirements`
3. **THIRD**: Execute analysis using sub-agents (Explore/architecture-explorer/code-reviewer)
4. **FOURTH**: Checkpoint via `mcp__drift-detector__drift_checkpoint` after each wave

## Mission: Deep Architecture Review of agent-comptable

**Repository**: `C:/agent-comptable` (Python/FastAPI + React/Vite invoice automation)

**Scope**:
1. **Services inventory** — `C:/agent-comptable/services/` has 10 services: classifier.py, excel_generator.py, gmail_service.py, matcher.py, ms365_scraper.py, portal_scraper.py, qonto_service.py, qonto_uploader.py, reconciliation_engine.py
2. **Extractors** — `C:/agent-comptable/extractors/` has ocr_extractor.py, pdf_extractor.py
3. **Test coverage audit** — active services have ZERO test coverage (all tests in `_archive/`)
4. **Architecture patterns** — identify layering, separation of concerns, coupling
5. **Security review** — credentials handling, OCR data flow, Qonto API integration
6. **French compliance** — GDPR/CNIL for invoice data, Qonto banking regulations

**Deliverables**:
1. **ADR at**: `C:/agent-comptable/docs/ADR-001-ARCHITECTURE-REVIEW.md` (create docs/ if missing)
2. **Gap analysis** with severity tiers (Critical / High / Medium / Low)
3. **Top 10 prioritized fixes** with effort estimates
4. **Test coverage recovery plan** — the `_archive/` tests are orphaned, services are unprotected

## Framework Constraints (ADR-008)

- No bypass of EAGLES hooks
- Every multi-step task MUST have `task_create` called first
- Report checkpoints back to: `C:/RH-OptimERP/eagles-ai-platform/sessions/cross-chat-agent-comptable-review.md`
- Use the 5-checkpoint format in that file

## Output Format

After completing each phase, **append a checkpoint update** to `C:/RH-OptimERP/eagles-ai-platform/sessions/cross-chat-agent-comptable-review.md` with:
```markdown
### [2026-04-05 HH:MM] Checkpoint N: <name>
<details>
```

## First Action

1. Read `C:/RH-OptimERP/eagles-ai-platform/sessions/cross-chat-agent-comptable-review.md` to understand the tracker format
2. Read `C:/RH-OptimERP/eagles-ai-platform/docs/ADR-007-1000-REPO-COMPETITIVE-ANALYSIS.md` for the 40-gap methodology reference
3. Read `C:/agent-comptable/CLAUDE.md` for project context
4. **Call `mcp__orchestrator__task_create` to enroll DAG**
5. Begin architecture review

## Success Criteria

- 5 checkpoints logged in the tracker file
- ADR-001 created in agent-comptable repo
- Gap analysis with >= 15 findings
- Top 10 prioritized fixes with code-level specifics
- Zero hook bypass events (check `~/.claude/state/eagles/eagles-bypass.log`)

---

GO.

## PROMPT END ▲▲▲

---

## Notes for coordinator (this chat)

After pasting the prompt in the other chat, I'll spawn a polling sub-agent here that:
- Reads `cross-chat-agent-comptable-review.md` every 60s
- Reports new checkpoint updates back
- Alerts when checkpoint 5 (DONE) fires
