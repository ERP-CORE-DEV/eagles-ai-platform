# DAG Task Orchestration

## What is a DAG?

A **Directed Acyclic Graph (DAG)** is a set of tasks connected by dependency edges, with no cycles. Each edge means "this task cannot start until that task is complete." Tasks with no incoming edges can run immediately; tasks with multiple incoming edges must wait for all of them.

```
       A                 Sequential chain:
       │                 A must finish before B starts,
       ▼                 B must finish before C starts.
       B
       │
       ▼
       C

       A                 Parallel fan-out:
      / \                B and C can run at the same time.
     ▼   ▼               D waits for both B and C.
     B   C
      \ /
       ▼
       D
```

EAGLES uses a DAG when a `/mission` decomposes into multiple skills. The `dag.parallel` field on a `MissionPlan` is `floor(skills.length / 2)`, giving a rough upper bound on concurrent tasks.

## DagTaskQueue — Lifecycle States

Every task in the queue moves through a strict state machine. Only forward transitions are allowed; there are no rollbacks.

```
  pending ──────────────────────────► running ──► completed
     ▲                                              │
     │ (dependencies met)                           │ _unblockDependents()
  blocked ◄──────── initial state                  │
     │               (has unmet deps)               ▼
     │                                          (trigger)
     │
     │  fail()  ──► failed ──┐  _cascadeFailure()
     │  skip()  ──► skipped ─┘  _cascadeSkip()
     │              │
     └──────────────┘ (cascade marks downstream blocked/pending tasks)
```

| Status | Description |
|---|---|
| `pending` | All dependencies met; ready to be assigned and started. |
| `blocked` | At least one dependency is not yet `completed`. |
| `running` | `queue.start(taskId)` called; task is executing. |
| `completed` | `queue.complete(taskId, result)` called; result stored in SQLite. |
| `failed` | `queue.fail(taskId, error)` called; error stored; cascade triggered. |
| `skipped` | `queue.skip(taskId, reason)` called; reason stored; cascade triggered. |

Every transition is checkpointed to a SQLite `TaskStore` via `upsert()`. A new `DagTaskQueue` constructed from the same `dbPath` restores all task states from that snapshot, so in-flight work survives process restarts.

### Construction

```ts
import { DagTaskQueue } from "@eagles-ai-platform/orchestrator-mcp";

const tasks: TaskDefinition[] = [
  { taskId: "t1", name: "lint",   dependsOn: [],     requiredCapabilities: ["lint"],   priority: "normal", status: "pending" },
  { taskId: "t2", name: "build",  dependsOn: ["t1"], requiredCapabilities: ["build"],  priority: "normal", status: "pending" },
  { taskId: "t3", name: "deploy", dependsOn: ["t2"], requiredCapabilities: ["deploy"], priority: "high",   status: "pending" },
];

const queue = new DagTaskQueue(tasks);
// DagTaskQueue validates the dependency graph at construction time.
// Cycles or unknown dependency IDs throw immediately.
```

### Event-Driven Execution Loop

```ts
// Wire up the event loop
queue.on("task:unblocked", (task) => {
  queue.start(task.taskId);
});

queue.on("task:started", async (task) => {
  try {
    const result = await executeTask(task);
    queue.complete(task.taskId, result);
  } catch (err) {
    queue.fail(task.taskId, String(err));
  }
});

queue.on("task:completed", (task) => {
  console.log(`Done: ${task.name}`);
});

queue.on("task:failed", (task) => {
  console.error(`Failed: ${task.name} — ${task.result}`);
});

queue.on("error", (diagnostic) => {
  if (diagnostic.reason === "stuck") {
    // Stuck guard fired: circular dependency detected at runtime
    console.error("Queue stuck", diagnostic.details);
  }
});

// Seed initial pending tasks (those with no dependencies start as 'pending')
for (const task of queue.getByStatus("pending")) {
  queue.start(task.taskId);
}
```

### Snapshot Restoration

```ts
// Restore a prior run from its SQLite checkpoint
const restoredQueue = new DagTaskQueue(tasks, { dbPath: "/path/to/tasks.sqlite" });

// Tasks that were 'completed' in the prior run remain 'completed'.
// Tasks that were 'blocked' remain 'blocked' until their deps finish.
console.log(restoredQueue.dbPath); // the SQLite file path
```

## Cascade Failure

When a task fails, all downstream tasks that (directly or transitively) depend on it are automatically moved to `failed` via an iterative BFS. The same propagation applies for `skipped` tasks.

```
    A (fails)
    │
    ├── B (blocked → failed, result: "cascade: <A's error>")
    │   └── D (blocked → failed, result: "cascade: <A's error>")
    └── C (blocked → failed, result: "cascade: <A's error>")
```

Only `blocked` or `pending` downstream tasks are eligible for cascade. Tasks already in a terminal state (`completed`, `failed`, `skipped`) are skipped by the BFS.

```ts
// Example: failing task A cascades to B, C, D
queue.fail("t-a", "lint config not found");

// After this call:
// queue.getByStatus("failed") → [A, B, C, D]
// queue.isComplete()          → true (all tasks are in terminal states)
```

## Scheduler — 4 Strategies

The `Scheduler` maps pending tasks onto available agents. Agents with status `"error"` or `"offline"` are filtered out before any strategy runs.

### round-robin

Cycles through healthy agents in order using a rolling cursor. Wrap-around is handled by modulo. Use this when all agents are equivalent and you want equal task distribution.

```ts
import { Scheduler } from "@eagles-ai-platform/orchestrator-mcp";

const scheduler = new Scheduler({ strategy: "round-robin" });

const assignments = scheduler.autoAssign(queue, agents);
// assignments[i].reason === "round-robin"
// assignments[i].score  === 0
```

Best for: homogeneous agent pools, equal load distribution, predictable routing.

### least-busy

Selects the agent with the lowest `assignedTaskCount` (simulated load within the batch). Ties are broken alphabetically by `agentId` for determinism. The simulated load map is updated per-assignment so within a single batch tasks do not pile onto the same agent.

```ts
const scheduler = new Scheduler({ strategy: "least-busy" });

const agents = [
  { agentId: "agent-1", assignedTaskCount: 3, status: "busy",  ... },
  { agentId: "agent-2", assignedTaskCount: 1, status: "busy",  ... },
  { agentId: "agent-3", assignedTaskCount: 0, status: "idle",  ... },
];

const assignments = scheduler.autoAssign(queue, agents);
// First task → agent-3 (load 0), second → agent-2 (load 1), ...
```

Best for: heterogeneous pools where some agents carry heavier workloads.

### capability-match

Scores each `(task, agent)` pair by **bi-directional keyword overlap**:

1. Extract keywords from `task.name + task.description`.
2. Extract keywords from `agent.capabilities.join(" ")`.
3. Score = (task keywords found in agent keywords) + (agent keywords found in task keywords).
4. Agent with highest score wins. Ties broken alphabetically by `agentId`.

An optional `synonyms` map (`Map<canonical, synonym[]>`) normalises tokens before scoring so `"compile"` matches `"build"`.

```ts
const scheduler = new Scheduler({
  strategy: "capability-match",
  synonyms: new Map([
    ["build",    ["compile", "bundle", "make"]],
    ["security", ["pentest", "vuln", "owasp"]],
  ]),
});

// assignment.score reflects the keyword overlap count
const assignments = scheduler.autoAssign(queue, agents);
```

Best for: specialist agent pools where routing precision matters (security agents, test agents, deploy agents).

### dependency-first

Sorts pending tasks by their **transitive blocked-dependent count** (BFS over the full dependency graph) before assigning. Tasks that block the most downstream work are scheduled first, minimising total wall-clock time. Within the same criticality tier agents are assigned round-robin.

```ts
const scheduler = new Scheduler({ strategy: "dependency-first" });

// Expose the criticality score for inspection
const criticalTask = queue.getByStatus("pending")[0]!;
const score = scheduler.countBlockedDependents(criticalTask, queue);
console.log(`Blocking ${score} downstream tasks`);
```

Best for: long dependency chains where completing the critical path first reduces total execution time.

## MessageBus — Inter-Agent Messaging

`MessageBus` is a SQLite-backed publish/subscribe bus. Messages are written to the `agent_message:sent` topic in the EventBus and replayed on construction, so communication survives process restarts.

```ts
import { MessageBus } from "@eagles-ai-platform/orchestrator-mcp";
import { EventBus } from "@eagles-ai-platform/data-layer";

const eventBus = new EventBus("/path/to/messaging.sqlite");
const bus = new MessageBus(eventBus, { maxMessages: 500 });
```

`maxMessages` caps the in-memory FIFO cache. When the cache is full, the oldest message is evicted. The SQLite store is left intact.

### send — direct message

```ts
const msg = bus.send("coordinator", "worker-1", "Start task A", { priority: "high" });
// msg.id, msg.timestamp are auto-generated
```

### broadcast — all agents

```ts
const msg = bus.broadcast("coordinator", "All agents: stand by");
// msg.to === "*"
// Delivered to all subscribers except "coordinator"
```

### getUnread — poll for new messages

```ts
const unread = bus.getUnread("worker-1");
// Returns messages addressed to worker-1 (direct or broadcast) not yet marked read

bus.markRead("worker-1", unread.map((m) => m.id));
// Read state is persisted to SQLite
```

### subscribe — real-time notifications

```ts
const off = bus.subscribe("worker-1", (message) => {
  console.log(`worker-1 received from ${message.from}: ${message.content}`);
  bus.markRead("worker-1", [message.id]);
});

// Clean up when done
off();
```

The callback fires synchronously after each matching message is persisted. Symbol-keyed subscriptions prevent duplicate-handler registration bugs.

## Decomposer — LLM-Driven Task Decomposition

The Decomposer converts a high-level goal into a `TaskSpec[]` by querying an LLM. The flow is split into two MCP tools to keep LLM calls outside the pure helper functions:

```
task_build_decomposition_prompt  →  buildCoordinatorSystemPrompt + buildUserPrompt
        ↓ (LLM call happens in Claude Code)
task_apply_decomposition         →  applyDecomposition (parse + validate)
```

### task_build_decomposition_prompt

```ts
import { buildCoordinatorSystemPrompt, buildUserPrompt } from "@eagles-ai-platform/orchestrator-mcp";

const request = {
  goal: "Add GDPR anonymisation to the Candidate entity",
  agentRoster: [
    { agentId: "a1", name: "backend-dev",  capabilities: ["C#", ".NET", "CosmosDB"] },
    { agentId: "a2", name: "qa-engineer",  capabilities: ["xUnit", "testing"] },
  ],
  maxTasks: 5,
};

const systemPrompt = buildCoordinatorSystemPrompt(request);
const userPrompt   = buildUserPrompt(request.goal);
// Pass systemPrompt + userPrompt to the LLM; receive JSON decomposition
```

Security guards applied to `agent.systemPrompt` before inclusion:
- Truncated to first 120 characters.
- Any substring matching the credential pattern (`api_key`, `secret`, `token`, `password`, `auth` followed by a value) is replaced with `"[redacted]"`.

### task_apply_decomposition

```ts
import { applyDecomposition } from "@eagles-ai-platform/orchestrator-mcp";

const llmOutput = `
\`\`\`json
[
  { "title": "Add AnonymizeCandidate()",   "description": "...", "assignee": "backend-dev", "dependsOn": [],                        "priority": "high" },
  { "title": "Write xUnit tests",          "description": "...", "assignee": "qa-engineer",  "dependsOn": ["Add AnonymizeCandidate()"], "priority": "normal" }
]
\`\`\`
`;

const { tasks, warnings } = applyDecomposition(llmOutput, request);
// warnings[] is non-empty when:
//   - LLM output could not be parsed
//   - An assignee name does not match any agent in the roster
//   - Task count exceeds maxTasks (truncation applied with warning)
```

`parseTaskSpecs` uses a three-tier fallback to extract JSON from LLM output:

1. ` ```json ... ``` ` fenced block.
2. Any ` ``` ... ``` ` fenced block.
3. First `[...]` bracket slice in the string.

## executeWithRetry — Structured Output Validation with Exponential Backoff

`executeWithRetry` lives in `@eagles-ai-platform/shared-utils` and is the standard wrapper for any LLM call that must return validated structured output.

```
Attempt 1: fn(undefined)
     │ output  → extractJSON → validateOutput(schema)
     │    ✓ → return validated T
     │    ✗ → buildValidationFeedback(error)
     ↓
sleep(baseDelayMs * 2^0)   [attempt 1 retry]
     ↓
Attempt 2: fn("Previous output had these validation errors:\n...")
     │    ✓ → return validated T
     │    ✗ → buildValidationFeedback(error)
     ↓
sleep(baseDelayMs * 2^1)   [attempt 2 retry]
     ↓
Attempt N: fn(feedback)
     │    ✗ → throw "executeWithRetry exhausted N retries: <last error>"
```

Delay formula: `min(baseDelayMs * 2^attempt, 5000ms)`. The cap prevents unbounded waits on deeply nested retry chains.

```ts
import { executeWithRetry } from "@eagles-ai-platform/shared-utils";
import { z } from "zod";

const CandidateSchema = z.object({
  name:       z.string(),
  score:      z.number().min(0).max(1),
  reasoning:  z.string(),
});

const result = await executeWithRetry(
  (feedback) => llm.call({
    systemPrompt: "Return a JSON object with name, score, reasoning.",
    userPrompt:   feedback
      ? `${feedback}\n\nTry again.`
      : "Analyse this candidate.",
  }),
  {
    schema:      CandidateSchema,
    maxRetries:  3,
    baseDelayMs: 100,
    onRetry: (attempt, error, lastOutput) => {
      console.warn(`Retry ${attempt}: ${error.message}`);
      console.warn(`Last output: ${lastOutput}`);
    },
  },
);

// result is typed as z.infer<typeof CandidateSchema>
console.log(result.score);
```

When `schema` is omitted, `executeWithRetry` returns the raw `string` on the first successful call. Non-validation errors (network timeouts, thrown exceptions from `fn`) are retried with `feedback = undefined`.

### Options Reference

| Option | Type | Default | Description |
|---|---|---|---|
| `maxRetries` | `number` | `3` | Retry attempts after the initial call. |
| `baseDelayMs` | `number` | `100` | Base delay for exponential backoff. |
| `schema` | `ZodSchema<T>` | `undefined` | When provided, validates extracted JSON and returns `T`. |
| `onRetry` | `function` | `undefined` | Called before each retry with attempt number, error, and last raw output. |
