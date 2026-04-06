# EAGLES AI Platform — Architecture Diagrams

Generated via Eraser.io API on 2026-04-06.
All diagrams use dark theme at 2x scale.

---

## Diagram 1: Platform Cloud Architecture

**Type**: cloud-architecture-diagram
**Request ID**: `EQOFQ26oCYhsOSNkBeaK`

Shows the full platform topology: 6 MCP servers, 3 shared packages, 4 enforcement hooks, and external LiteLLM proxy routing to vLLM/Anthropic/OpenAI.

**Image URL**:
```
https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3Ae1305105de6619762f4feb8a07657d5964eb1f8c5f18854bcd9dfe3e3a027a0b.png
```

**Edit on Eraser.io**:
```
https://app.eraser.io/new?requestId=EQOFQ26oCYhsOSNkBeaK&teamId=jIGjG9bOhxFXVFeTdJqz
```

**Coverage**:
- Consumer: Claude Code (stdio transport)
- MCP Servers: token-tracker (11), vector-memory (4), drift-detector (8), provider-router (7), verification (12), orchestrator (15)
- Data Layer: 10 SQLite WAL stores (TokenLedger, MemoryRepository, HNSW, DriftStore, ProviderStore, VerificationStore, TaskStore, AgentRegistryStore, SonaLearningStore, EventBus)
- Shared packages: shared-utils, data-layer, tool-registry (62 skills)
- Enforcement: eagles-enforce-dag.py (WARN@2, SOFT@3, HARD@4), 3 additional hooks
- External: LiteLLM proxy → vLLM Kimi K2 (Azure) / Anthropic API / OpenAI API

---

## Diagram 2: mission_start Pipeline

**Type**: flowchart-diagram
**Request ID**: `yKQXhpxzGfehEzafgEJm`

Shows the 7-step intent resolution pipeline from raw natural language input to a fully assembled MissionPlan with DAG enrollment.

**Image URL**:
```
https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3A5e6c400d9a0c400a48ff7db54c7c2a3c9af93f9a3e75406a61587b3309b49e66.png
```

**Edit on Eraser.io**:
```
https://app.eraser.io/new?requestId=yKQXhpxzGfehEzafgEJm&teamId=jIGjG9bOhxFXVFeTdJqz
```

**Pipeline steps**:
1. Normalizer — French/English aliases, stopword removal, /skill and --flag extraction
2. Project Resolver — filesystem scan, CLAUDE.md match → `need_project` if unresolved
3. Intent Classifier — 9 goals, confidence threshold < 0.1 → `need_clarification`
4. Context Expander — layers, LOC, tech stack, graceful MINIMAL_CONTEXT fallback
5. Scope Filter — `--scope` flag filters layers
6. Skill Selector — goal bundle + user /skills, deduplication
7. MissionPlan Builder — `parallel = max(1, floor(skills.length / 2))`

---

## Diagram 3: DAG Task Execution

**Type**: sequence-diagram
**Request ID**: `7FYarumxfVwlyBYAm9AX`

Shows the full lifecycle from mission_start through parallel agent dispatch to verification pipeline completion, including failure cascade.

**Image URL**:
```
https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3Ab0044005e3766b9f47fe954220c482a7266fb9f5dadbe880e28a1fc8eae07f81.png
```

**Edit on Eraser.io**:
```
https://app.eraser.io/new?requestId=7FYarumxfVwlyBYAm9AX&teamId=jIGjG9bOhxFXVFeTdJqz
```

**Participants**: User, OrchestratorMCP, DagTaskQueue, Scheduler, Agent1, Agent2, VerificationMCP

**Key flows**:
- `task_create` → DagTaskQueue (pending | blocked on unmet deps)
- `task_assign` → Scheduler.findBestAgent (capability-match strategy)
- Parallel execution: Agent1 + Agent2 run concurrently
- Success path: complete → unblock dependents
- Failure path: cascade failure to downstream tasks
- Final: `pipeline_run` on VerificationMCP

---

## Diagram 4: Hook Enforcement Ladder

**Type**: flowchart-diagram
**Request ID**: `kp4W6o76LPMC4kQn76Iq`

Shows the decision tree inside `eagles-enforce-dag.py` — the PreToolUse hook that enforces DAG enrollment before allowing Edit/Write/MultiEdit calls.

**Image URL**:
```
https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3A4df8dcbc5a4f947c297c900270ef50b22ea50d5ec95455230157113cf0204ca6.png
```

**Edit on Eraser.io**:
```
https://app.eraser.io/new?requestId=kp4W6o76LPMC4kQn76Iq&teamId=jIGjG9bOhxFXVFeTdJqz
```

**Threshold ladder**:
| mutation_count | Action | Exit code |
|---|---|---|
| 1 | Silent pass | 0 |
| 2 | WARN to stderr | 0 |
| 3 | SOFT BLOCK warning | 0 |
| >= 4 | HARD BLOCK + log to eagles-bypass.log | 2 |

**Escape hatches**:
- `EAGLES_BYPASS=1` env var → immediate exit 0
- DAG enrollment tools (`task_create`, `task_apply_decomposition`, `task_build_decomposition_prompt`) → reset counter, set `dag_enrolled=true`
- Session TTL: 1 hour idle resets all counters
- Internal error → fail-open (exit 0, never brick workflow)

---

## Diagram 5: 3-Team Cross-Project Review

**Type**: flowchart-diagram
**Request ID**: `WNyCUqE9lm1EUKnAHJKg`

Shows the `/mission agent-comptable` orchestration pattern: mission_start auto-discovers 3 sub-projects, dispatches 3 parallel specialist teams, then merges findings into a single ADR.

**Image URL**:
```
https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3A42065241c010b3eb45567ddc344a3d2160c0862e28936c18edff0aade35e3ac3.png
```

**Edit on Eraser.io**:
```
https://app.eraser.io/new?requestId=WNyCUqE9lm1EUKnAHJKg&teamId=jIGjG9bOhxFXVFeTdJqz
```

**Teams dispatched in parallel**:
- Team 1 (Backend): FastAPI endpoints, JWT, GDPR, CVEs → TEAM1-BACKEND-REVIEW.md (15 findings: 3 CRITICAL, 7 HIGH, 5 MEDIUM)
- Team 2 (Frontend): React components, PII, CSP, XSS → TEAM2-FRONTEND-REVIEW.md (8 findings: 1 CRITICAL, 4 HIGH)
- Team 3 (E2E): test_broken_endpoints.py, auth flow, CORS → 22 tests (18 pass, 4 fail)

**Merge output**: `ADR-002-FULL-SCOPE-REVIEW.md` committed to `docs/architecture/`

---

## Summary

| # | Title | Type | Request ID | Image URL |
|---|---|---|---|---|
| 1 | Platform Cloud Architecture | cloud-architecture | EQOFQ26oCYhsOSNkBeaK | [link](https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3Ae1305105de6619762f4feb8a07657d5964eb1f8c5f18854bcd9dfe3e3a027a0b.png) |
| 2 | mission_start Pipeline | flowchart | yKQXhpxzGfehEzafgEJm | [link](https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3A5e6c400d9a0c400a48ff7db54c7c2a3c9af93f9a3e75406a61587b3309b49e66.png) |
| 3 | DAG Task Execution | sequence | 7FYarumxfVwlyBYAm9AX | [link](https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3Ab0044005e3766b9f47fe954220c482a7266fb9f5dadbe880e28a1fc8eae07f81.png) |
| 4 | Hook Enforcement Ladder | flowchart | kp4W6o76LPMC4kQn76Iq | [link](https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3A4df8dcbc5a4f947c297c900270ef50b22ea50d5ec95455230157113cf0204ca6.png) |
| 5 | 3-Team Cross-Project Review | flowchart | WNyCUqE9lm1EUKnAHJKg | [link](https://storage.googleapis.com/second-petal-295822.appspot.com/elements/autoDiagram%3A42065241c010b3eb45567ddc344a3d2160c0862e28936c18edff0aade35e3ac3.png) |
