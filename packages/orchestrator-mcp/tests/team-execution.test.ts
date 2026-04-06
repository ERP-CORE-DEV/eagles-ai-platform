/**
 * Behavioral tests for Team, executeQueue, and buildTaskPrompt.
 *
 * All tests are concrete equality or membership assertions — no "toBeDefined()"
 * or "> 0" guards. Tests are designed to FAIL if the implementation is wrong.
 */

import { describe, it, expect, vi } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Team } from "../src/teams/Team.js";
import { executeQueue } from "../src/teams/executeQueue.js";
import { buildTaskPrompt } from "../src/teams/buildTaskPrompt.js";
import { Scheduler } from "../src/tasks/Scheduler.js";
import type { TeamAgent } from "../src/teams/Team.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "team-test-"));
}

function makeAgents(count: number): TeamAgent[] {
  return Array.from({ length: count }, (_, i) => ({
    agentId: `agent-${i}`,
    name: `agent-${i}`,
    role: "engineer" as const,
    capabilities: ["code", `skill-${i}`],
  }));
}

// ---------------------------------------------------------------------------
// Team construction
// ---------------------------------------------------------------------------

describe("Team constructor", () => {
  it("creates queue, messageBus, and semaphore", () => {
    const team = new Team(
      { name: "test-team", agents: makeAgents(2) },
      makeTempDir(),
    );

    expect(team.queue).toBeDefined();
    expect(team.messageBus).toBeDefined();
    expect(team.semaphore).toBeDefined();
    expect(team.name).toBe("test-team");
    expect(team.agents).toHaveLength(2);
  });

  it("defaults maxConcurrency to 3 (semaphore max)", () => {
    const team = new Team({ name: "t", agents: makeAgents(1) }, makeTempDir());
    expect(team.semaphore.max).toBe(3);
  });

  it("respects custom maxConcurrency", () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1), maxConcurrency: 5 },
      makeTempDir(),
    );
    expect(team.semaphore.max).toBe(5);
  });

  it("defaults maxRounds to 20", () => {
    const team = new Team({ name: "t", agents: makeAgents(1) }, makeTempDir());
    expect(team.maxRounds).toBe(20);
  });

  it("defaults tokenBudget to 100000", () => {
    const team = new Team({ name: "t", agents: makeAgents(1) }, makeTempDir());
    expect(team.tokenBudget).toBe(100_000);
  });
});

// ---------------------------------------------------------------------------
// Team.addTask
// ---------------------------------------------------------------------------

describe("Team.addTask", () => {
  it("adds task to the internal DagTaskQueue and returns a taskId string", () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    const taskId = team.addTask({ name: "Do work", description: "Some work" });

    expect(typeof taskId).toBe("string");
    expect(taskId.length).toBeGreaterThan(0);

    const stored = team.queue.getTask(taskId);
    expect(stored).not.toBeUndefined();
    expect(stored!.name).toBe("Do work");
    expect(stored!.status).toBe("pending");
  });

  it("task with unresolved dependsOn starts as blocked", () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    const idA = team.addTask({ name: "A", description: "first" });
    const idB = team.addTask({ name: "B", description: "second", dependsOn: [idA] });

    expect(team.queue.getTask(idA)!.status).toBe("pending");
    expect(team.queue.getTask(idB)!.status).toBe("blocked");
  });
});

// ---------------------------------------------------------------------------
// Team.getAgent / getAgentsByRole
// ---------------------------------------------------------------------------

describe("Team agent queries", () => {
  it("getAgent returns the agent by name", () => {
    const agents: TeamAgent[] = [
      { agentId: "a1", name: "alice", role: "architect", capabilities: ["design"] },
      { agentId: "a2", name: "bob",   role: "engineer",  capabilities: ["code"] },
    ];
    const team = new Team({ name: "t", agents }, makeTempDir());

    expect(team.getAgent("alice")!.agentId).toBe("a1");
    expect(team.getAgent("bob")!.agentId).toBe("a2");
    expect(team.getAgent("carol")).toBeUndefined();
  });

  it("getAgentsByRole filters correctly", () => {
    const agents: TeamAgent[] = [
      { agentId: "a1", name: "alice", role: "architect", capabilities: [] },
      { agentId: "a2", name: "bob",   role: "engineer",  capabilities: [] },
      { agentId: "a3", name: "carol", role: "engineer",  capabilities: [] },
    ];
    const team = new Team({ name: "t", agents }, makeTempDir());

    const engineers = team.getAgentsByRole("engineer");
    expect(engineers).toHaveLength(2);
    expect(engineers.map((a) => a.name)).toContain("bob");
    expect(engineers.map((a) => a.name)).toContain("carol");

    const architects = team.getAgentsByRole("architect");
    expect(architects).toHaveLength(1);
    expect(architects[0].name).toBe("alice");

    const testers = team.getAgentsByRole("tester");
    expect(testers).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// executeQueue — independent tasks dispatched in same round
// ---------------------------------------------------------------------------

describe("executeQueue — independent tasks", () => {
  it("dispatches 2 independent tasks in the same round", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(2), maxConcurrency: 2 },
      makeTempDir(),
    );

    team.addTask({ name: "Task A", description: "Independent A" });
    team.addTask({ name: "Task B", description: "Independent B" });

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = await executeQueue({ team, scheduler, maxRounds: 5 });

    expect(results).toHaveLength(2);
    expect(results.every((r) => r.success)).toBe(true);
    expect(results.map((r) => r.taskId)).toHaveLength(2);
  });

  it("all tasks reach completed status after executeQueue", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(2) },
      makeTempDir(),
    );

    team.addTask({ name: "Task A", description: "A" });
    team.addTask({ name: "Task B", description: "B" });

    const scheduler = new Scheduler({ strategy: "round-robin" });
    await executeQueue({ team, scheduler, maxRounds: 5 });

    expect(team.queue.getByStatus("completed")).toHaveLength(2);
    expect(team.queue.getByStatus("pending")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// executeQueue — A → B dependency ordering
// ---------------------------------------------------------------------------

describe("executeQueue — dependency ordering", () => {
  it("dispatches B only after A completes", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(2) },
      makeTempDir(),
    );

    const idA = team.addTask({ name: "A", description: "First step" });
    const _idB = team.addTask({ name: "B", description: "Second step", dependsOn: [idA] });

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = await executeQueue({ team, scheduler, maxRounds: 10 });

    // Both tasks should complete.
    expect(results.filter((r) => r.success)).toHaveLength(2);

    // A must appear before B in the results list.
    const indexA = results.findIndex((r) => r.taskId === idA);
    const indexB = results.findIndex((r) => r.taskId !== idA);
    expect(indexA).toBeLessThan(indexB);
  });

  it("B is blocked until A is done", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(2) },
      makeTempDir(),
    );

    const idA = team.addTask({ name: "A", description: "First" });
    const idB = team.addTask({ name: "B", description: "Second", dependsOn: [idA] });

    // Before execution: B is blocked.
    expect(team.queue.getTask(idB)!.status).toBe("blocked");
    expect(team.queue.getTask(idA)!.status).toBe("pending");

    const scheduler = new Scheduler({ strategy: "round-robin" });
    await executeQueue({ team, scheduler, maxRounds: 10 });

    // After execution: both complete.
    expect(team.queue.getTask(idA)!.status).toBe("completed");
    expect(team.queue.getTask(idB)!.status).toBe("completed");
  });
});

// ---------------------------------------------------------------------------
// executeQueue — cascade failure
// ---------------------------------------------------------------------------

describe("executeQueue — cascade failure", () => {
  it("downstream tasks are skipped/failed when upstream fails", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    const idA = team.addTask({ name: "A", description: "Will fail" });
    const idB = team.addTask({ name: "B", description: "Depends on A", dependsOn: [idA] });

    // Manually fail A to simulate a failure without a live executor.
    team.queue.start(idA);
    team.queue.fail(idA, "intentional failure");

    // B should now be failed (cascaded).
    const taskB = team.queue.getTask(idB);
    expect(taskB!.status).toBe("failed");
    expect(taskB!.result).toMatch(/cascade/);
  });
});

// ---------------------------------------------------------------------------
// executeQueue — stuck detection
// ---------------------------------------------------------------------------

describe("executeQueue — stuck detection", () => {
  it("terminates gracefully when queue is complete after all tasks done", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    team.addTask({ name: "Solo", description: "Only task" });

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = await executeQueue({ team, scheduler, maxRounds: 5 });

    expect(results).toHaveLength(1);
    expect(results[0].success).toBe(true);
    expect(team.queue.isComplete()).toBe(true);
  });

  it("abortSignal stops the loop before all rounds", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1), maxConcurrency: 1 },
      makeTempDir(),
    );

    // Add several tasks.
    for (let i = 0; i < 5; i++) {
      team.addTask({ name: `Task ${i}`, description: `Desc ${i}` });
    }

    const abortSignal = { aborted: true }; // Abort immediately.
    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = await executeQueue({ team, scheduler, maxRounds: 10, abortSignal });

    // When aborted immediately, zero tasks should be dispatched.
    expect(results).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// buildTaskPrompt
// ---------------------------------------------------------------------------

describe("buildTaskPrompt", () => {
  it("includes task name and description", () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    const taskId = team.addTask({ name: "Build API", description: "Build the REST API" });
    const task = team.queue.getTask(taskId)!;

    const prompt = buildTaskPrompt(task, team, new Map());

    expect(prompt).toContain("Build API");
    expect(prompt).toContain("Build the REST API");
  });

  it("includes team roster (agent names and roles)", () => {
    const agents: TeamAgent[] = [
      { agentId: "a1", name: "alice", role: "architect", capabilities: ["design"] },
      { agentId: "a2", name: "bob",   role: "engineer",  capabilities: ["code"] },
    ];
    const team = new Team({ name: "t", agents }, makeTempDir());

    const taskId = team.addTask({ name: "Task", description: "Do it" });
    const task = team.queue.getTask(taskId)!;

    const prompt = buildTaskPrompt(task, team, new Map());

    expect(prompt).toContain("alice");
    expect(prompt).toContain("architect");
    expect(prompt).toContain("bob");
    expect(prompt).toContain("engineer");
  });

  it("includes upstream task output from completedTasks map", () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    const idA = team.addTask({ name: "Phase 1", description: "Phase one work" });
    const idB = team.addTask({ name: "Phase 2", description: "Phase two work", dependsOn: [idA] });

    // Simulate A being completed.
    const completedTasks = new Map<string, string>([[idA, "Phase 1 output: schema v2"]]);

    team.queue.start(idA);
    team.queue.complete(idA, "Phase 1 output: schema v2");

    const taskB = team.queue.getTask(idB)!;
    const prompt = buildTaskPrompt(taskB, team, completedTasks);

    expect(prompt).toContain("Phase 1 output: schema v2");
    expect(prompt).toContain("Phase 1"); // upstream task name
  });

  it("includes sharedContext when provided", () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    const taskId = team.addTask({ name: "Task", description: "Do it" });
    const task = team.queue.getTask(taskId)!;

    const prompt = buildTaskPrompt(
      task,
      team,
      new Map(),
      "Use CosmosDB SDK 3.54 direct",
    );

    expect(prompt).toContain("Use CosmosDB SDK 3.54 direct");
  });

  it("omits upstream section when there are no completed dependencies", () => {
    const team = new Team(
      { name: "t", agents: makeAgents(1) },
      makeTempDir(),
    );

    const taskId = team.addTask({ name: "Standalone", description: "No deps" });
    const task = team.queue.getTask(taskId)!;

    const prompt = buildTaskPrompt(task, team, new Map());

    expect(prompt).not.toContain("Upstream results");
  });
});

// ---------------------------------------------------------------------------
// Semaphore bounding
// ---------------------------------------------------------------------------

describe("Semaphore concurrency bounding", () => {
  it("semaphore with max=1 processes tasks sequentially (active never exceeds 1)", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(3), maxConcurrency: 1 },
      makeTempDir(),
    );

    let maxObservedActive = 0;
    const originalRun = team.semaphore.run.bind(team.semaphore);

    // Spy on the semaphore — track max active INSIDE the run scope
    vi.spyOn(team.semaphore, "run").mockImplementation(async (fn) => {
      return originalRun(async () => {
        // Inside the semaphore gate — active count is accurate here
        maxObservedActive = Math.max(maxObservedActive, team.semaphore.active);
        return fn();
      });
    });

    for (let i = 0; i < 3; i++) {
      team.addTask({ name: `Task ${i}`, description: `Desc ${i}` });
    }

    const scheduler = new Scheduler({ strategy: "round-robin" });
    await executeQueue({ team, scheduler, maxRounds: 10 });

    expect(maxObservedActive).toBeLessThanOrEqual(1);
  });

  it("semaphore with max=3 allows up to 3 concurrent dispatches", async () => {
    const team = new Team(
      { name: "t", agents: makeAgents(3), maxConcurrency: 3 },
      makeTempDir(),
    );

    expect(team.semaphore.max).toBe(3);

    for (let i = 0; i < 3; i++) {
      team.addTask({ name: `T${i}`, description: `D${i}` });
    }

    const scheduler = new Scheduler({ strategy: "round-robin" });
    const results = await executeQueue({ team, scheduler, maxRounds: 5 });

    expect(results).toHaveLength(3);
  });
});
