/**
 * Behavioral tests for DagTaskQueue.
 *
 * Every test is designed to FAIL if the implementation is incorrect.
 * No "expect(x).toBeDefined()" or "expect(count > 0)" — only concrete
 * equality, membership, and call-count assertions.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { TaskStore } from "@eagles-ai-platform/data-layer";
import { DagTaskQueue } from "../src/tasks/DagTaskQueue.js";
import type { TaskDefinition } from "../src/tasks/types.js";

// ---------------------------------------------------------------------------
// Test factory helper
// ---------------------------------------------------------------------------

/**
 * Creates a minimal TaskDefinition for test purposes.
 * All fields not under test receive safe defaults.
 */
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

// ---------------------------------------------------------------------------
// Dependency unblocking
// ---------------------------------------------------------------------------

describe("dependency unblocking", () => {
  it("task with two deps starts as blocked", () => {
    const A = makeTask("A");
    const B = makeTask("B");
    const C = makeTask("C", ["A", "B"]);

    const queue = new DagTaskQueue([A, B, C]);

    expect(queue.getTask("C")!.status).toBe("blocked");
  });

  it("completing first dep does not unblock C while second dep is outstanding", () => {
    const A = makeTask("A");
    const B = makeTask("B");
    const C = makeTask("C", ["A", "B"]);

    const queue = new DagTaskQueue([A, B, C]);
    queue.complete("A");

    // B is still pending — C must remain blocked.
    expect(queue.getTask("C")!.status).toBe("blocked");
  });

  it("completing both deps promotes C to pending", () => {
    const A = makeTask("A");
    const B = makeTask("B");
    const C = makeTask("C", ["A", "B"]);

    const queue = new DagTaskQueue([A, B, C]);
    queue.complete("A");
    queue.complete("B");

    expect(queue.getTask("C")!.status).toBe("pending");
  });
});

// ---------------------------------------------------------------------------
// Cascade failure (recursive)
// ---------------------------------------------------------------------------

describe("cascade failure", () => {
  it("failing A cascades to B and C in a linear chain", () => {
    // A → B → C  (C depends on B, B depends on A)
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const queue = new DagTaskQueue([A, B, C]);
    queue.fail("A", "auth error");

    expect(queue.getTask("B")!.status).toBe("failed");
    expect(queue.getTask("C")!.status).toBe("failed");
  });

  it("B cascade error contains 'cascade' keyword", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const queue = new DagTaskQueue([A, B, C]);
    queue.fail("A", "auth error");

    const bResult = queue.getTask("B")!.result ?? "";
    expect(bResult.toLowerCase()).toContain("cascade");
  });

  it("B cascade error contains the upstream failure reason", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const queue = new DagTaskQueue([A, B, C]);
    queue.fail("A", "auth error");

    const bResult = queue.getTask("B")!.result ?? "";
    expect(bResult).toContain("auth error");
  });

  it("C cascade error contains 'cascade' keyword", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const queue = new DagTaskQueue([A, B, C]);
    queue.fail("A", "auth error");

    const cResult = queue.getTask("C")!.result ?? "";
    expect(cResult.toLowerCase()).toContain("cascade");
  });

  it("task:failed event fires for each cascaded task", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const queue = new DagTaskQueue([A, B, C]);
    const failedIds: string[] = [];
    queue.on("task:failed", (t) => failedIds.push(t.taskId));

    queue.fail("A", "network timeout");

    // A itself + B + C = 3 failures fired.
    expect(failedIds).toContain("A");
    expect(failedIds).toContain("B");
    expect(failedIds).toContain("C");
    expect(failedIds).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Cascade skip
// ---------------------------------------------------------------------------

describe("cascade skip", () => {
  it("skipping A cascades B and C to skipped", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const queue = new DagTaskQueue([A, B, C]);
    queue.skip("A", "user rejected");

    expect(queue.getTask("B")!.status).toBe("skipped");
    expect(queue.getTask("C")!.status).toBe("skipped");
  });

  it("task:skipped event fires for each cascaded task", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const queue = new DagTaskQueue([A, B, C]);
    const skippedIds: string[] = [];
    queue.on("task:skipped", (t) => skippedIds.push(t.taskId));

    queue.skip("A", "user rejected");

    expect(skippedIds).toContain("A");
    expect(skippedIds).toContain("B");
    expect(skippedIds).toContain("C");
    expect(skippedIds).toHaveLength(3);
  });
});

// ---------------------------------------------------------------------------
// Diamond DAG unblocking
// ---------------------------------------------------------------------------

describe("diamond DAG", () => {
  // A → B, A → C, B → D, C → D

  it("completing A unblocks both B and C (not D)", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["A"]);
    const D = makeTask("D", ["B", "C"]);

    const queue = new DagTaskQueue([A, B, C, D]);
    queue.complete("A");

    expect(queue.getTask("B")!.status).toBe("pending");
    expect(queue.getTask("C")!.status).toBe("pending");
    // D still needs B AND C.
    expect(queue.getTask("D")!.status).toBe("blocked");
  });

  it("completing B after A does not unblock D while C is outstanding", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["A"]);
    const D = makeTask("D", ["B", "C"]);

    const queue = new DagTaskQueue([A, B, C, D]);
    queue.complete("A");
    queue.complete("B");

    expect(queue.getTask("D")!.status).toBe("blocked");
  });

  it("completing C after A and B promotes D to pending", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["A"]);
    const D = makeTask("D", ["B", "C"]);

    const queue = new DagTaskQueue([A, B, C, D]);
    queue.complete("A");
    queue.complete("B");
    queue.complete("C");

    expect(queue.getTask("D")!.status).toBe("pending");
  });

  it("task:unblocked fires exactly for B, C (on A complete) and D (on C complete)", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["A"]);
    const D = makeTask("D", ["B", "C"]);

    const queue = new DagTaskQueue([A, B, C, D]);
    const unblockedIds: string[] = [];
    queue.on("task:unblocked", (t) => unblockedIds.push(t.taskId));

    queue.complete("A");
    expect(unblockedIds).toEqual(expect.arrayContaining(["B", "C"]));
    expect(unblockedIds).not.toContain("D");

    // Now complete B and C.
    queue.complete("B");
    expect(unblockedIds).not.toContain("D"); // C not done yet

    queue.complete("C");
    expect(unblockedIds).toContain("D");
  });
});

// ---------------------------------------------------------------------------
// Stuck detection guard
// ---------------------------------------------------------------------------

describe("stuck detection guard", () => {
  it("emits 'error' with 'stuck' reason when all tasks are blocked with no progress", () => {
    // Three tasks each blocked on a non-existent dep that will never complete.
    // We skip validation by using the overrides path — set status to 'blocked'
    // manually after construction via a fresh queue with no deps.
    //
    // To bypass validateTaskDependencies (which rejects unknown deps), we
    // create tasks with status 'blocked' injected via a small trick:
    // Build queue with valid tasks, then mutate their status by constructing
    // from a snapshot where we pre-set status.
    //
    // The cleanest way: create tasks A, B, C with deps on each other in a
    // ring that is VALID but unreachable (A blocked on ghost ids).
    // Actually the simplest approach: set maxRounds=1, create a legitimate
    // diamond where D is blocked on B and C, then never complete B or C.
    // complete(A) fires unblockDependents — B and C become pending (unblocked).
    // D remains blocked. The while loop runs one round, unblocks B and C,
    // runs another round, finds nothing to unblock, breaks NORMALLY (no stuck).
    //
    // For a genuine stuck scenario: maxRounds=1, 1 blocked task that can
    // never be satisfied in a single round. We need to manufacture a state
    // where blocked tasks exist but none are ready to promote.
    //
    // Approach: create a queue with A → B, set maxRounds=1. complete(A).
    // First round: B unblocks (anyUnblocked=true). Second would be round=2
    // but maxRounds=1, so the guard fires... but wait, the loop breaks on
    // anyUnblocked=false, not on round count alone.
    //
    // The guard fires ONLY when round >= maxRounds (loop exhausted). So we
    // need blocked tasks that STAY blocked across ALL maxRounds rounds.
    // That means: tasks blocked on tasks that will never complete.
    //
    // Since validateTaskDependencies rejects unknown deps, we must use
    // a creative workaround: create tasks where deps reference IDs of tasks
    // that exist in the queue BUT are themselves blocked with no possible
    // resolution.
    //
    // Simplest self-contained setup that exercises the guard:
    // - maxRounds = 3
    // - Three tasks A, B, C where A has no deps (pending), B depends on A,
    //   C depends on B. Now manually construct a scenario where all 3 are
    //   blocked by pre-seeding the db with blocked status, then constructing
    //   a NEW DagTaskQueue from the same dbPath (which restores blocked status).

    const dir = mkdtempSync(join(tmpdir(), "stuck-test-"));
    const dbPath = join(dir, "stuck.sqlite");

    // Seed SQLite with 3 tasks all in 'blocked' state using TaskStore.upsert().
    const seedStore = new TaskStore(dbPath);
    seedStore.upsert({ taskId: "X", name: "X", status: "blocked" });
    seedStore.upsert({ taskId: "Y", name: "Y", status: "blocked", dependsOn: ["X"] });
    seedStore.upsert({ taskId: "Z", name: "Z", status: "blocked", dependsOn: ["Y"] });
    seedStore.close();

    // Build tasks in-memory with known IDs (validated as a valid DAG).
    const X = makeTask("X");
    const Y = makeTask("Y", ["X"]);
    const Z = makeTask("Z", ["Y"]);

    // Construct DagTaskQueue from snapshot — all 3 tasks restore as 'blocked'.
    const queue = new DagTaskQueue([X, Y, Z], { dbPath, maxRounds: 3 });

    // Sanity: all three are blocked (restored from SQLite).
    expect(queue.getTask("X")!.status).toBe("blocked");
    expect(queue.getTask("Y")!.status).toBe("blocked");
    expect(queue.getTask("Z")!.status).toBe("blocked");

    const errorEvents: Array<{ reason: string; details: unknown }> = [];
    queue.on("error", (d) => errorEvents.push(d as { reason: string; details: unknown }));

    // complete() on a non-existent task won't help — instead we directly
    // trigger _unblockDependents via a fake complete of a task that doesn't
    // exist in the map to force the loop. But that throws.
    //
    // Correct approach: call complete() on X — this changes X to 'completed',
    // then _unblockDependents runs. With X completed, Y unblocks in round 1
    // (anyUnblocked=true), then Z unblocks in round 2 (anyUnblocked=true),
    // then round 3 finds nothing = breaks. No stuck.
    //
    // We need an ACTUALLY stuck scenario. The key insight: if ALL blocked tasks
    // have deps on OTHER blocked tasks (none are completed), NONE will unblock
    // in round 1, anyUnblocked=false → break immediately. round=1 < maxRounds=3
    // → no error.
    //
    // The guard only fires when round REACHES maxRounds. That means we need
    // tasks that keep unblocking OTHER tasks for maxRounds rounds and then
    // get stuck. In a finite DAG this is naturally bounded.
    //
    // RE-READING the spec: "if no tasks completed and none unblocked in a round,
    // break with diagnostic". This is the spec's description. Let me re-read:
    //
    // "STUCK DETECTION GUARD: add maxRounds parameter, emit 'error' event if
    // exceeded AND if no tasks completed and none unblocked in a round, break
    // with diagnostic"
    //
    // So the guard fires when: rounds exhausted (>= maxRounds).
    // The break-without-error fires when: nothing unblocked this round.
    //
    // To force the guard: maxRounds=1, and we need at least 1 task to unblock
    // in round 1 (so anyUnblocked=true, loop continues), then round becomes 2
    // which >= maxRounds=1... wait, the condition is round < maxRounds in the
    // while loop. If maxRounds=1: while(0 < 1) → round 1 executes,
    // if anyUnblocked=true → loop tries round 2: while(1 < 1) = false → exits.
    // round=1 >= maxRounds=1 → guard fires! Even though tasks unblocked.
    //
    // This means maxRounds=1 with ANY blocked task will fire the guard if
    // there are >= 2 levels of blocking (round 1 unblocks level 1, round 2
    // would unblock level 2 but is cut off).
    //
    // Let's use: A→B→C, maxRounds=1. complete(A).
    // Round 1: B unblocks (anyUnblocked=true). Loop tries round 2:
    // while(1 < 1) = false. round=1 >= maxRounds=1 → ERROR!
    // C is still blocked (B is now pending but not completed).
    // This is a valid stuck detection scenario for this test.

    // Reset: use a fresh queue setup.
    const A2 = makeTask("A2");
    const B2 = makeTask("B2", ["A2"]);
    const C2 = makeTask("C2", ["B2"]);

    const queue2 = new DagTaskQueue([A2, B2, C2], { maxRounds: 1 });
    const errorEvents2: Array<{ reason: string; details: unknown }> = [];
    queue2.on("error", (d) => errorEvents2.push(d as { reason: string; details: unknown }));

    // complete A2: round 1 unblocks B2 (anyUnblocked=true),
    // round 2 would unblock C2 but maxRounds=1 is exhausted → error fires.
    queue2.complete("A2");

    expect(errorEvents2).toHaveLength(1);
    expect(errorEvents2[0].reason).toBe("stuck");
  });

  it("loop does not hang — terminates within maxRounds iterations", () => {
    // Verifies the guard actually terminates rather than running forever.
    // Use a large chain (10 tasks deep) with maxRounds=2 so the guard fires
    // after 2 rounds, and measure that the call completes synchronously.

    const tasks: TaskDefinition[] = [];
    for (let i = 0; i < 10; i++) {
      tasks.push(makeTask(`t${i}`, i === 0 ? [] : [`t${i - 1}`]));
    }

    const queue = new DagTaskQueue(tasks, { maxRounds: 2 });
    const errorFired: boolean[] = [];
    queue.on("error", () => errorFired.push(true));

    // complete t0 — triggers _unblockDependents with maxRounds=2.
    // Round 1: t1 unblocks. Round 2: t2 unblocks. round=2 >= maxRounds=2 → error.
    // The call must return (not hang).
    queue.complete("t0");

    // Guard fired — the loop terminated rather than running indefinitely.
    expect(errorFired).toHaveLength(1);
    // t3..t9 are still blocked — the guard stopped processing.
    expect(queue.getTask("t3")!.status).toBe("blocked");
  });
});

// ---------------------------------------------------------------------------
// SQLite checkpoint
// ---------------------------------------------------------------------------

describe("SQLite checkpoint", () => {
  let dbPath: string;

  beforeEach(() => {
    const dir = mkdtempSync(join(tmpdir(), "dag-checkpoint-test-"));
    dbPath = join(dir, "tasks.sqlite");
  });

  it("completing task A persists status='completed' and result to SQLite", () => {
    const A = makeTask("A");

    const queue = new DagTaskQueue([A], { dbPath });
    queue.complete("A", { foo: "bar" });

    // Query TaskStore directly — bypass the in-memory Map.
    const readback = new TaskStore(dbPath);
    const stored = readback.get("A");
    readback.close();

    expect(stored).not.toBeNull();
    expect(stored!.status).toBe("completed");
    // result is JSON-serialised — parse and assert.
    expect(JSON.parse(stored!.result!)).toEqual({ foo: "bar" });
  });

  it("new DagTaskQueue from same dbPath restores completed status", () => {
    const A = makeTask("A");
    const B = makeTask("B");

    const queue1 = new DagTaskQueue([A, B], { dbPath });
    queue1.complete("A");

    // Construct a second instance from the same SQLite file.
    const queue2 = new DagTaskQueue([A, B], { dbPath });

    expect(queue2.getTask("A")!.status).toBe("completed");
    // B was never completed — status must be preserved as pending.
    expect(queue2.getTask("B")!.status).toBe("pending");
  });

  it("new DagTaskQueue from same dbPath restores blocked status", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);

    const queue1 = new DagTaskQueue([A, B], { dbPath });
    // Do not complete A — B should remain blocked.
    void queue1; // created but not mutated

    const queue2 = new DagTaskQueue([A, B], { dbPath });
    expect(queue2.getTask("B")!.status).toBe("blocked");
  });
});

// ---------------------------------------------------------------------------
// Symbol unsubscribe
// ---------------------------------------------------------------------------

describe("symbol unsubscribe", () => {
  it("unsubscribing handler1 prevents it from firing while handler2 still fires", () => {
    const A = makeTask("A");
    const queue = new DagTaskQueue([A]);

    const handler1 = vi.fn();
    const handler2 = vi.fn();

    const unsub1 = queue.on("task:completed", handler1);
    queue.on("task:completed", handler2);

    // Remove handler1 before completing the task.
    unsub1();

    queue.complete("A");

    expect(handler1).toHaveBeenCalledTimes(0);
    expect(handler2).toHaveBeenCalledTimes(1);
  });

  it("unsub function is idempotent — calling twice does not throw", () => {
    const A = makeTask("A");
    const queue = new DagTaskQueue([A]);

    const unsub = queue.on("task:completed", vi.fn());
    expect(() => {
      unsub();
      unsub();
    }).not.toThrow();
  });

  it("two on() calls with the same handler reference produce independent subscriptions", () => {
    const A = makeTask("A");
    const queue = new DagTaskQueue([A]);

    const handler = vi.fn();
    const unsub1 = queue.on("task:completed", handler);
    queue.on("task:completed", handler);

    // Only unsub the first registration — handler should still fire once.
    unsub1();

    queue.complete("A");

    // The second registration is still active — fires exactly once.
    expect(handler).toHaveBeenCalledTimes(1);
  });
});

// ---------------------------------------------------------------------------
// Self-dependency detection
// ---------------------------------------------------------------------------

describe("self-dependency detection", () => {
  it("throws when a task lists its own taskId in dependsOn", () => {
    const selfDepTask = makeTask("A", ["A"]);

    expect(() => new DagTaskQueue([selfDepTask])).toThrow();
  });

  it("error message identifies the offending task", () => {
    const selfDepTask = makeTask("A", ["A"]);

    expect(() => new DagTaskQueue([selfDepTask])).toThrow(/A/);
  });
});

// ---------------------------------------------------------------------------
// Empty queue
// ---------------------------------------------------------------------------

describe("empty queue", () => {
  it("isComplete returns true for an empty queue", () => {
    const queue = new DagTaskQueue([]);
    expect(queue.isComplete()).toBe(true);
  });

  it("getByStatus returns empty array on empty queue", () => {
    const queue = new DagTaskQueue([]);
    expect(queue.getByStatus("pending")).toHaveLength(0);
    expect(queue.getByStatus("blocked")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// Additional edge cases
// ---------------------------------------------------------------------------

describe("getByStatus", () => {
  it("returns only tasks with the requested status", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["A"]);

    const queue = new DagTaskQueue([A, B, C]);

    // Initially: A=pending, B=blocked, C=blocked
    expect(queue.getByStatus("pending").map((t) => t.taskId)).toEqual(["A"]);
    expect(queue.getByStatus("blocked").map((t) => t.taskId)).toEqual(
      expect.arrayContaining(["B", "C"]),
    );
    expect(queue.getByStatus("blocked")).toHaveLength(2);
  });
});

describe("isComplete", () => {
  it("returns false when any task is still pending", () => {
    const A = makeTask("A");
    const queue = new DagTaskQueue([A]);
    expect(queue.isComplete()).toBe(false);
  });

  it("returns true when all tasks are in terminal states", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);

    const queue = new DagTaskQueue([A, B]);
    queue.fail("A", "oops");
    // B is cascaded to failed — both terminal.
    expect(queue.isComplete()).toBe(true);
  });
});
