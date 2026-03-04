# Orchestrator

Agent lifecycle management, task DAG execution, and pattern learning for coordinated multi-agent workflows.

**Package**: `@eagles-ai-platform/orchestrator-mcp`
**Tools**: 10
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
