# Orchestrator

Agent lifecycle management, task DAG execution, and pattern learning for coordinated multi-agent workflows.

**Package**: `@eagles-ai-platform/orchestrator-mcp`
**Tools**: 18
**Store**: `$EAGLES_DATA_ROOT/orchestrator/orchestrator.sqlite`

## Concepts

### Agents
Registered entities with capabilities and tags. Agents have status (`idle`, `busy`, `offline`) tracked via heartbeats. Stale agents (no heartbeat) are auto-detected.

### Tasks
Work items with priority, dependencies (`dependsOn`), and required capabilities. Tasks form a DAG (Directed Acyclic Graph) — a task only becomes assignable when all dependencies are completed.

### Patterns
Learned solutions with success rates. The orchestrator suggests patterns based on tags and historical success.

## Tools

### agent_register

Register a new agent with capabilities.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `agentId` | string | yes | - |
| `name` | string | yes | - |
| `capabilities` | string[] | yes | - |
| `tags` | string[] | no | [] |
| `metadata` | Record | no | - |

### agent_discover

Find agents by capability, tag, or status.

| Parameter | Type | Required |
|-----------|------|----------|
| `capability` | string | no |
| `tag` | string | no |
| `status` | `"idle" \| "busy" \| "offline"` | no |

### agent_status

Check status of a specific agent.

| Parameter | Type | Required |
|-----------|------|----------|
| `agentId` | string | yes |

**Returns**: `{ status, isStale, lastHeartbeat, uptime: { hours, minutes } }`

### agent_heartbeat

Send heartbeat to keep agent alive.

| Parameter | Type | Required |
|-----------|------|----------|
| `agentId` | string | yes |

### task_create

Create a task with optional dependencies and capability requirements.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `name` | string | yes | - |
| `description` | string | yes | - |
| `dependsOn` | string[] | no | - |
| `requiredCapabilities` | string[] | no | - |
| `priority` | `"urgent" \| "high" \| "normal" \| "low"` | no | "normal" |

### task_assign

Assign a task to the best available agent based on capabilities.

| Parameter | Type | Required |
|-----------|------|----------|
| `taskId` | string | yes |

**Returns**: `{ taskId, status, assignedAgent }` or error if no capable agent is available.

### task_status

Get current status of a task.

| Parameter | Type | Required |
|-----------|------|----------|
| `taskId` | string | yes |

**Task Statuses**: `pending`, `assigned`, `in_progress`, `completed`, `failed`

### task_results

Get results of a completed task.

| Parameter | Type | Required |
|-----------|------|----------|
| `taskId` | string | yes |

### task_complete

Mark a task as completed and release its assigned agent back to `idle`. Closes the single-task write-loop that `task_create` → `task_assign` opens — without this call, tasks stay stuck in `assigned` and the agent never frees up.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `taskId` | string | yes | - |
| `result` | string | no | `""` |

**Returns**: `{ taskId, status: "completed", result, completedAt, releasedAgent }`

Errors:
- `Task not found: <id>` — no task with that ID
- `Task already completed` — idempotency guard, includes the original `completedAt`
- `Task already failed — cannot complete` — task is in a terminal `failed` state

**When to use**: Every time you finish a unit of work that was registered via `task_create` and assigned via `task_assign`. The multi-agent DAG path (`mission_execute`) calls this internally, but single-task flows must call it explicitly.

**Example**:
```json
{
  "taskId": "22f41430-9090-4f80-95b9-c36c6fc2c389",
  "result": "Applied schema v42 — 42 rows migrated"
}
```

### learn_pattern

Record a successful pattern for future reference.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `name` | string | yes | - |
| `description` | string | yes | - |
| `tags` | string[] | no | [] |

### learn_suggest

Get pattern recommendations based on tags and success history.

| Parameter | Type | Required | Default |
|-----------|------|----------|---------|
| `tags` | string[] | no | - |
| `limit` | integer | no | - |

**Returns**: Patterns ranked by `successRate` (0-1).

---

## Messaging Tools

### agent_message_send

Send a message from one agent to another (point-to-point or broadcast).

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `from` | string | yes | Sender agent ID or name |
| `to` | string | yes | Recipient agent ID, name, or `"broadcast"` |
| `content` | string | yes | Message body |
| `metadata` | Record | no | Arbitrary key/value payload |

**Returns**: `{ messageId: string }`

**When to use**: Coordinate between two agents running in parallel — pass partial results, signal readiness, or trigger a downstream step without going through the task DAG.

**Example**:
```json
{
  "from": "code-reviewer",
  "to": "architect",
  "content": "Security review complete — 2 HIGH findings in AuthService.cs",
  "metadata": { "severity": "HIGH", "file": "AuthService.cs" }
}
```

### agent_messages_get

Retrieve messages queued for an agent, with optional filtering.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `agentName` | string | yes | Recipient agent ID or name |
| `unreadOnly` | boolean | no | Return only unread messages |
| `since` | string | no | ISO 8601 timestamp — return messages after this time |

**Returns**: `{ messages: Message[] }` where each message contains `id`, `from`, `to`, `content`, `metadata`, `readAt`, `createdAt`.

**When to use**: Poll for incoming messages at the start of an agent's work unit, or drain the queue after a broadcast. Combine `unreadOnly: true` with `since` to fetch only new messages since last check.

**Example**:
```json
{
  "agentName": "architect",
  "unreadOnly": true
}
```

---

## Task Decomposition Tools

### task_build_decomposition_prompt

Build the coordinator system prompt and user prompt needed for LLM-driven task decomposition. Call this first, then pass the prompts to an LLM, then call `task_apply_decomposition` with the response.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `goal` | string | yes | High-level goal to decompose |
| `agentRoster` | AgentSpec[] | yes | Available agents with capabilities |
| `maxTasks` | integer | no | Cap on tasks the LLM may create |

`AgentSpec` shape: `{ agentId, name, capabilities: string[], systemPrompt? }`

**Returns**: `{ systemPrompt: string, userPrompt: string }`

**When to use**: The first step of LLM-assisted decomposition. Feed the returned `systemPrompt` and `userPrompt` to any capable LLM. The LLM responds with a JSON decomposition that `task_apply_decomposition` can parse.

**Calling this tool also resets the DAG enforcement counter** in `eagles-enforce-dag.py`, enrolling the session.

**Example**:
```json
{
  "goal": "Implement salary scoring service with unit tests and CosmosDB integration",
  "agentRoster": [
    { "agentId": "codegen-1", "name": "codegen", "capabilities": ["dotnet", "csharp"] },
    { "agentId": "tdd-1", "name": "tdd-guide", "capabilities": ["testing", "xunit"] }
  ],
  "maxTasks": 6
}
```

### task_apply_decomposition

Parse an LLM decomposition response and create the resulting tasks in the DAG. Completes the two-step decomposition workflow started by `task_build_decomposition_prompt`.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `decompositionJson` | string | yes | Raw JSON string from the LLM decomposition response |
| `agentRoster` | AgentSpec[] | yes | Same roster passed to `task_build_decomposition_prompt` |
| `goal` | string | yes | Original goal (used for validation context) |
| `maxTasks` | integer | no | Hard cap applied during parsing |

**Returns**: `{ createdTaskIds: string[], warnings: string[] }`

`warnings` contains non-fatal issues found during parsing (e.g., unknown agent reference, dependency cycle detected and skipped).

**When to use**: Immediately after receiving the LLM response from `task_build_decomposition_prompt`. The created task IDs can then be assigned via `task_assign`.

**Calling this tool also resets the DAG enforcement counter**, enrolling the session (same as `task_create`).

**Example**:
```json
{
  "decompositionJson": "{\"tasks\": [{\"title\": \"Implement SalaryMatchingService\", ...}]}",
  "goal": "Implement salary scoring service with unit tests",
  "agentRoster": [
    { "agentId": "codegen-1", "name": "codegen", "capabilities": ["dotnet", "csharp"] }
  ]
}
```

---

## Mission Tool

### mission_start

Convert a natural language goal into a structured mission plan. This is the primary entry point for starting any multi-step work — the "steering wheel" that translates intent into an actionable plan.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `input` | string | yes | Natural language goal, optionally with `/skills` tags and `--flags` |
| `cwd` | string | no | Working directory for project detection (stack, framework) |

**Returns**: A structured mission object containing:
- Detected skills and required capabilities
- Suggested agent assignments
- Recommended task breakdown
- Any `--flags` parsed from the input

**When to use**: At the very start of a session when the user provides an open-ended goal. `mission_start` analyzes the intent and surfaces the right agents, skills, and decomposition strategy before any code is written. It is the recommended first call for any multi-agent workflow.

**Example**:
```json
{
  "input": "Add duplicate detection for candidates /skills dotnet cosmos --strict",
  "cwd": "C:/rh-optimerp-sourcing-candidate-attraction"
}
```

**Output example**:
```json
{
  "goal": "Add duplicate detection for candidates",
  "skills": ["dotnet", "cosmos"],
  "flags": { "strict": true },
  "suggestedAgents": ["codegen", "code-reviewer", "devsecops"],
  "taskHints": [
    "Implement IDuplicateDetectionService interface",
    "Add CosmosDB query for exact/fuzzy matching",
    "Write unit tests covering 30 scenarios"
  ]
}
```

---

## Session Intelligence Tools

### session_search

Query past sessions by project name, keyword, or date range. Returns the most-relevant sessions with their summaries and keyword tags.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `project` | string | no | Filter by project name (partial match) |
| `keyword` | string | no | Filter by keyword tag |
| `since` | string | no | ISO 8601 — return sessions started after this date |
| `until` | string | no | ISO 8601 — return sessions started before this date |
| `limit` | integer | no | Maximum sessions to return (default: 10, max: 50) |

**Returns**: `{ sessions: [{ id, project, summary, keywords, startedAt, endedAt }] }`

**When to use**: At the start of a session to surface prior work on the same project before writing any code. Also useful for retrospectives — "what did we do on the salary scoring last week?"

**Example**:
```json
{
  "project": "sourcing-candidate-attraction",
  "keyword": "salary",
  "limit": 5
}
```

**Example response**:
```json
{
  "sessions": [
    {
      "id": "3f2a8c1d-...",
      "project": "sourcing-candidate-attraction",
      "summary": "Added SalaryMatchingService with SMIC validation and IOptions<SalaryConfig>. Fixed CosmosDB partition key on job offers.",
      "keywords": "salary,scoring,iOptions,SMIC,CosmosDB",
      "startedAt": "2026-03-18T09:14:00Z",
      "endedAt": "2026-03-18T11:42:00Z"
    }
  ]
}
```

### session_extract

Extract filtered messages from a specific past session. Useful for retrieving the exact code snippets, decisions, or findings from a prior conversation.

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `sessionId` | string | yes | Session UUID from `session_search` results |
| `role` | `"user" \| "assistant" \| "all"` | no | Filter by message role (default: `"all"`) |
| `contains` | string | no | Only return messages containing this substring |
| `limit` | integer | no | Maximum messages to return (default: 20) |

**Returns**: `{ messages: [{ role, content, timestamp }] }`

**When to use**: After `session_search` identifies a relevant session, use `session_extract` to pull specific messages — for example, to recover a design decision, a code snippet that was written, or a finding from a prior audit.

**Example**:
```json
{
  "sessionId": "3f2a8c1d-...",
  "role": "assistant",
  "contains": "SalaryMatchingService"
}
```
