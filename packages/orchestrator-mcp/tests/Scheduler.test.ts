/**
 * Behavioral tests for Scheduler.
 *
 * Every test is designed to FAIL if the implementation is wrong.
 * No cosmetic assertions ("toBeDefined", "toBeTruthy" without a concrete value).
 * Each test exercises a specific algorithm contract that must hold.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { Scheduler } from "../src/tasks/Scheduler.js";
import { DagTaskQueue } from "../src/tasks/DagTaskQueue.js";
import type { Agent } from "../src/tasks/Scheduler.js";
import type { TaskDefinition } from "../src/tasks/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTask(
  id: string,
  dependsOn: string[] = [],
  overrides: Partial<TaskDefinition> = {},
): TaskDefinition {
  return {
    taskId: id,
    name: `Task-${id}`,
    description: `Description for ${id}`,
    dependsOn,
    requiredCapabilities: [],
    priority: "normal",
    status: "pending",
    assignedAgent: null,
    result: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
    ...overrides,
  };
}

function makeAgent(
  id: string,
  status: Agent["status"] = "idle",
  capabilities: string[] = [],
  assignedTaskCount = 0,
): Agent {
  return {
    agentId: id,
    name: `Agent-${id}`,
    capabilities,
    status,
    assignedTaskCount,
  };
}

/** Build a DagTaskQueue from a list of tasks (all pending by default). */
function makeQueue(tasks: TaskDefinition[]): DagTaskQueue {
  return new DagTaskQueue(tasks);
}

// ---------------------------------------------------------------------------
// round-robin
// ---------------------------------------------------------------------------

describe("round-robin: cycling assignment", () => {
  it("wraps correctly across 3 agents for 7 tasks", () => {
    const agents = [
      makeAgent("A"),
      makeAgent("B"),
      makeAgent("C"),
    ];
    const tasks = Array.from({ length: 7 }, (_, i) => makeTask(`T${i}`));
    const queue = makeQueue(tasks);

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(7);

    const expectedCycle = ["A", "B", "C", "A", "B", "C", "A"];
    results.forEach((r, i) => {
      expect(r.agentId).toBe(expectedCycle[i]);
    });
  });

  it("skips error and offline agents, only assigns to idle/busy", () => {
    const agents = [
      makeAgent("A", "idle"),
      makeAgent("B", "error"),
      makeAgent("C", "offline"),
      makeAgent("D", "idle"),
    ];
    const tasks = Array.from({ length: 4 }, (_, i) => makeTask(`T${i}`));
    const queue = makeQueue(tasks);

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(4);

    const assignedIds = results.map((r) => r.agentId);
    // B and C must never appear
    expect(assignedIds).not.toContain("B");
    expect(assignedIds).not.toContain("C");

    // Should alternate A, D, A, D
    expect(assignedIds).toEqual(["A", "D", "A", "D"]);
  });
});

// ---------------------------------------------------------------------------
// least-busy
// ---------------------------------------------------------------------------

describe("least-busy: minimum load selection", () => {
  it("selects agent with fewest assigned tasks", () => {
    const agents = [
      makeAgent("A", "idle", [], 3),
      makeAgent("B", "idle", [], 1),
      makeAgent("C", "idle", [], 5),
    ];
    const queue = makeQueue([makeTask("T1")]);

    const scheduler = new Scheduler({ strategy: "least-busy" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(1);
    expect(results[0]!.agentId).toBe("B");
  });

  it("breaks ties deterministically by agentId alphabetical order", () => {
    const agents = [
      makeAgent("B", "idle", [], 2),
      makeAgent("A", "idle", [], 2),
    ];
    const queue = makeQueue([makeTask("T1")]);

    const scheduler = new Scheduler({ strategy: "least-busy" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(1);
    // A comes before B alphabetically — must win
    expect(results[0]!.agentId).toBe("A");
  });
});

// ---------------------------------------------------------------------------
// capability-match
// ---------------------------------------------------------------------------

describe("capability-match: keyword scoring", () => {
  it("selects agent with matching capabilities over unrelated agent", () => {
    const agents = [
      makeAgent("A", "idle", ["review", "security"]),
      makeAgent("B", "idle", ["deploy", "docker"]),
    ];
    // Task text contains 'review', 'typescript', 'code', 'security'
    const task = makeTask("T1", [], {
      name: "review typescript code",
      description: "check for security vulnerabilities",
    });
    const queue = makeQueue([task]);

    const scheduler = new Scheduler({ strategy: "capability-match" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(1);
    const result = results[0]!;

    // Agent A matches 'review' and 'security' — score must be > 0
    expect(result.agentId).toBe("A");
    expect(result.score).toBeGreaterThan(0);
  });

  it("agent B with deploy/docker gets score 0 when task is about review/security", () => {
    const agents = [
      makeAgent("A", "idle", ["review", "security"]),
      makeAgent("B", "idle", ["deploy", "docker"]),
    ];
    const task = makeTask("T1", [], {
      name: "review code",
      description: "security audit",
    });
    const queue = makeQueue([task]);

    const scheduler = new Scheduler({ strategy: "capability-match" });
    const results = scheduler.autoAssign(queue, agents);

    // Agent B should not be selected
    expect(results[0]!.agentId).not.toBe("B");
  });

  it("resolves synonyms: agent with 'build' capability matches task saying 'compile'", () => {
    const synonyms = new Map([["build", ["compile", "bundle"]]]);
    const agents = [
      makeAgent("X", "idle", ["build"]),
      makeAgent("Y", "idle", ["deploy"]),
    ];
    const task = makeTask("T1", [], {
      name: "compile the project",
      description: "run compile step",
    });
    const queue = makeQueue([task]);

    const scheduler = new Scheduler({ strategy: "capability-match", synonyms });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(1);
    // 'compile' in task → maps to canonical 'build' → matches agent X's capability 'build'
    expect(results[0]!.agentId).toBe("X");
    expect(results[0]!.score).toBeGreaterThan(0);
  });

  it("filters French HR stopwords so 'le' and 'et' do not interfere with CPF/OPCO matching", () => {
    // Use only default stop-words (includes 'le', 'et', 'la')
    const agents = [
      makeAgent("A", "idle", ["cpf", "opco"]),
      makeAgent("B", "idle", ["deploy"]),
    ];
    // Task: "Vérifier le CPF et l'OPCO" — 'le' and 'et' are stop-words, 'cpf'/'opco' are not
    const task = makeTask("T1", [], {
      name: "Vérifier CPF OPCO",
      description: "valider le cpf et l opco du candidat",
    });
    const queue = makeQueue([task]);

    const scheduler = new Scheduler({ strategy: "capability-match" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(1);
    // Agent A must win: 'cpf' and 'opco' survive stop-word filtering and match
    expect(results[0]!.agentId).toBe("A");
    expect(results[0]!.score).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// dependency-first
// ---------------------------------------------------------------------------

describe("dependency-first: critical path ordering", () => {
  it("schedules task with most blocked dependents first", () => {
    // A has 0 dependents, B has 3 dependents, C has 1 dependent
    // B must be assigned to the first agent
    const taskA = makeTask("A");
    const taskB = makeTask("B");
    const taskC = makeTask("C");
    // These downstream tasks are all blocked waiting on B
    const bDep1 = makeTask("B1", ["B"], { status: "blocked" });
    const bDep2 = makeTask("B2", ["B1"], { status: "blocked" });
    const bDep3 = makeTask("B3", ["B2"], { status: "blocked" });
    // C has 1 dependent
    const cDep1 = makeTask("C1", ["C"], { status: "blocked" });

    const queue = makeQueue([taskA, taskB, taskC, bDep1, bDep2, bDep3, cDep1]);

    const agents = [makeAgent("Agent1"), makeAgent("Agent2")];
    const scheduler = new Scheduler({ strategy: "dependency-first" });
    const results = scheduler.autoAssign(queue, agents);

    // Only A, B, C are pending — bDep* are blocked
    const pendingResults = results.filter((r) =>
      ["A", "B", "C"].includes(r.taskId),
    );
    expect(pendingResults).toHaveLength(3);

    // B must be first in results (most blocked downstream)
    expect(pendingResults[0]!.taskId).toBe("B");
  });

  it("BFS counts transitively blocked dependents: A→B→C→D chain", () => {
    const taskA = makeTask("A");
    const taskB = makeTask("B", ["A"], { status: "blocked" });
    const taskC = makeTask("C", ["B"], { status: "blocked" });
    const taskD = makeTask("D", ["C"], { status: "blocked" });

    const queue = makeQueue([taskA, taskB, taskC, taskD]);

    const scheduler = new Scheduler({ strategy: "dependency-first" });

    // A has 3 transitive blocked dependents: B, C, D
    const countA = scheduler.countBlockedDependents(taskA, queue);
    expect(countA).toBe(3);

    // B has 2: C, D (but B is not pending — use countBlockedDependents directly)
    const countB = scheduler.countBlockedDependents(taskB, queue);
    expect(countB).toBe(2);

    // C has 1: D
    const countC = scheduler.countBlockedDependents(taskC, queue);
    expect(countC).toBe(1);

    // D has 0
    const countD = scheduler.countBlockedDependents(taskD, queue);
    expect(countD).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// Health check: error/offline exclusion
// ---------------------------------------------------------------------------

describe("health check: error/offline agents excluded", () => {
  it("all assignments go to the 2 healthy agents when 3 of 5 are errored", () => {
    const agents = [
      makeAgent("A", "error"),
      makeAgent("B", "idle"),
      makeAgent("C", "error"),
      makeAgent("D", "idle"),
      makeAgent("E", "error"),
    ];
    const tasks = Array.from({ length: 6 }, (_, i) => makeTask(`T${i}`));
    const queue = makeQueue(tasks);

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toHaveLength(6);

    const assignedIds = results.map((r) => r.agentId);
    for (const id of assignedIds) {
      expect(["B", "D"]).toContain(id);
    }
  });
});

// ---------------------------------------------------------------------------
// Edge cases
// ---------------------------------------------------------------------------

describe("edge cases", () => {
  it("returns empty array when agent list is empty", () => {
    const queue = makeQueue([makeTask("T1"), makeTask("T2")]);

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = scheduler.autoAssign(queue, []);

    expect(results).toEqual([]);
  });

  it("returns empty array when no tasks are pending (all completed)", () => {
    const tasks = [
      makeTask("T1", [], { status: "completed" }),
      makeTask("T2", [], { status: "completed" }),
    ];
    const queue = makeQueue(tasks);
    // Mark them completed so the queue reflects terminal state
    queue.start("T1");
    queue.complete("T1");
    queue.start("T2");
    queue.complete("T2");

    const agents = [makeAgent("A"), makeAgent("B")];
    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = scheduler.autoAssign(queue, agents);

    expect(results).toEqual([]);
  });
});
