# EAIP V2 Lifecycle Rules

## You are running EAIP V2 (Eagles AI Platform)
- V2 is ACTIVE since 2026-04-09. Orchestrator + Verification MCPs point to V2 builds.
- 3 SHIP patterns active: P1 (evidence-gated verification), P2 (fuzzy skill matching, 62 skills), P5 (auto-decision engine)
- 62 skills available (surfaced per-prompt by P2 hook). Use them.

## Mission Lifecycle (mandatory for multi-step tasks)
1. `ToolSearch` for deferred MCP tools BEFORE first call — schemas are NOT loaded until fetched
2. `mission_start` — registers the mission, returns confidence + scope
3. `task_create` — registers each unit of work (NEVER skip this)
4. Execute the work (Edit, Write, Bash, Agent, etc.)
5. `task_results` — reads task status (NOTE: this is READ-ONLY, does not mark task completed)
6. Low confidence from `mission_start` does NOT mean skip EAIP — it means proceed with caution

## Known gap: no `task_complete` tool
- `DagTaskQueue.complete()` exists internally but is NOT exposed as an MCP tool
- Only `mission_execute` (multi-agent DAG mode) calls `complete()` internally
- For single-task flows, call `task_results` to read status — task stays "assigned" until `task_complete` is implemented
- Do NOT pretend the loop is closed — acknowledge the gap if asked

## Rules
- Every `/mission` MUST use the full lifecycle above
- `agent_register` if no agents exist in the session
- TodoWrite is for intra-task step tracking WITHIN a mission, not a replacement for EAIP
- Deferred MCP tools require `ToolSearch` before first call — calling without schema = InputValidationError
