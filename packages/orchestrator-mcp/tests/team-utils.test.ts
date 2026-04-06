import { describe, it, expect, vi, beforeEach } from "vitest";
import { DagTaskQueue } from "../src/tasks/DagTaskQueue.js";
import { loadSpecsIntoQueue, buildTeamRunResult } from "../src/teams/team-utils.js";
import type { TaskSpec } from "../src/teams/team-utils.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Creates a minimal TaskSpec for test purposes. */
function makeSpec(
  title: string,
  dependsOn: string[] = [],
  overrides: Partial<TaskSpec> = {},
): TaskSpec {
  return {
    title,
    description: `Description for ${title}`,
    assignee: "agent-alpha",
    dependsOn,
    priority: "normal",
    ...overrides,
  };
}

/** Creates an empty DagTaskQueue (no initial tasks). */
function makeQueue(): DagTaskQueue {
  return new DagTaskQueue([]);
}

// ---------------------------------------------------------------------------
// loadSpecsIntoQueue — task creation
// ---------------------------------------------------------------------------

describe("loadSpecsIntoQueue — task creation", () => {
  it("loadSpecsIntoQueue_threeSpecs_addsThreeTasksToQueue", () => {
    const queue = makeQueue();
    const specs = [
      makeSpec("Design"),
      makeSpec("Implement"),
      makeSpec("Review"),
    ];

    loadSpecsIntoQueue(specs, queue);

    const pending = queue.getByStatus("pending");
    const blocked = queue.getByStatus("blocked");
    expect(pending.length + blocked.length).toBe(3);
  });

  it("loadSpecsIntoQueue_returnsMapWithAllTitles", () => {
    const queue = makeQueue();
    const specs = [makeSpec("Alpha"), makeSpec("Beta")];

    const titleToId = loadSpecsIntoQueue(specs, queue);

    expect(titleToId.has("Alpha")).toBe(true);
    expect(titleToId.has("Beta")).toBe(true);
  });

  it("loadSpecsIntoQueue_eachTitleMapsToUniqueUUID", () => {
    const queue = makeQueue();
    const specs = [makeSpec("Task-A"), makeSpec("Task-B"), makeSpec("Task-C")];

    const titleToId = loadSpecsIntoQueue(specs, queue);
    const ids = [...titleToId.values()];

    // All IDs must be distinct.
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("loadSpecsIntoQueue_emptySpecs_addsNoTasks", () => {
    const queue = makeQueue();

    const titleToId = loadSpecsIntoQueue([], queue);

    expect(titleToId.size).toBe(0);
    expect(queue.getByStatus("pending")).toHaveLength(0);
  });
});

// ---------------------------------------------------------------------------
// loadSpecsIntoQueue — dependency resolution
// ---------------------------------------------------------------------------

describe("loadSpecsIntoQueue — dependency resolution", () => {
  it("loadSpecsIntoQueue_dependsOnKnownTitle_taskIsBlockedUntilDepCompletes", () => {
    const queue = makeQueue();
    const specs = [
      makeSpec("Foundation"),
      makeSpec("Building", ["Foundation"]),
    ];

    const titleToId = loadSpecsIntoQueue(specs, queue);

    const buildingId = titleToId.get("Building")!;
    const buildingTask = queue.getTask(buildingId)!;

    // "Building" depends on "Foundation" which is only pending — so it must be blocked.
    expect(buildingTask.status).toBe("blocked");
  });

  it("loadSpecsIntoQueue_dependencyResolved_dependsOnContainsFoundationUUID", () => {
    const queue = makeQueue();
    const specs = [
      makeSpec("Foundation"),
      makeSpec("Building", ["Foundation"]),
    ];

    const titleToId = loadSpecsIntoQueue(specs, queue);

    const foundationId = titleToId.get("Foundation")!;
    const buildingId = titleToId.get("Building")!;
    const buildingTask = queue.getTask(buildingId)!;

    expect(buildingTask.dependsOn).toContain(foundationId);
  });

  it("loadSpecsIntoQueue_unknownDepTitle_logsWarningAndSkipsDep", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const queue = makeQueue();
    const specs = [makeSpec("Orphan", ["NonExistentTask"])];

    const titleToId = loadSpecsIntoQueue(specs, queue);

    // Warning must have been emitted.
    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining("Unknown dependency title"),
    );

    // The task should still be created (graceful degradation), with no deps.
    const orphanId = titleToId.get("Orphan")!;
    const orphanTask = queue.getTask(orphanId)!;
    expect(orphanTask).toBeDefined();
    expect(orphanTask.dependsOn).toHaveLength(0);

    warnSpy.mockRestore();
  });

  it("loadSpecsIntoQueue_mixedKnownAndUnknownDeps_resolvesOnlyKnown", () => {
    const warnSpy = vi.spyOn(console, "warn").mockImplementation(() => undefined);
    const queue = makeQueue();
    const specs = [
      makeSpec("ValidDep"),
      makeSpec("Consumer", ["ValidDep", "GhostDep"]),
    ];

    const titleToId = loadSpecsIntoQueue(specs, queue);

    const validDepId = titleToId.get("ValidDep")!;
    const consumerId = titleToId.get("Consumer")!;
    const consumerTask = queue.getTask(consumerId)!;

    // Only the valid dep should be in dependsOn.
    expect(consumerTask.dependsOn).toEqual([validDepId]);
    expect(warnSpy).toHaveBeenCalledOnce();

    warnSpy.mockRestore();
  });
});

// ---------------------------------------------------------------------------
// buildTeamRunResult — counting
// ---------------------------------------------------------------------------

describe("buildTeamRunResult — counting", () => {
  it("buildTeamRunResult_allCompleted_countsAreCorrect", () => {
    const queue = makeQueue();
    const specs = [makeSpec("T1"), makeSpec("T2"), makeSpec("T3")];
    const titleToId = loadSpecsIntoQueue(specs, queue);

    const outputs = new Map<string, string>();
    for (const [title, id] of titleToId) {
      queue.start(id);
      queue.complete(id, `output of ${title}`);
      outputs.set(id, `output of ${title}`);
    }

    const result = buildTeamRunResult("test goal", queue, outputs, Date.now() - 100);

    expect(result.completed).toBe(3);
    expect(result.failed).toBe(0);
    expect(result.skipped).toBe(0);
    expect(result.totalTasks).toBe(3);
    expect(result.goal).toBe("test goal");
  });

  it("buildTeamRunResult_mixedStatuses_countsCompletedFailedSkippedSeparately", () => {
    const queue = makeQueue();
    const specs = [
      makeSpec("S1"),
      makeSpec("S2"),
      makeSpec("S3"),
      makeSpec("S4"),
    ];
    const titleToId = loadSpecsIntoQueue(specs, queue);
    const ids = [...titleToId.values()];

    // Complete first, fail second, skip third, leave fourth pending (not counted).
    queue.start(ids[0]!);
    queue.complete(ids[0]!);

    queue.start(ids[1]!);
    queue.fail(ids[1]!, "something broke");

    queue.skip(ids[2]!, "not needed");

    const result = buildTeamRunResult("mixed", queue, new Map(), Date.now() - 50);

    expect(result.completed).toBe(1);
    expect(result.failed).toBe(1);
    expect(result.skipped).toBe(1);
    // The pending task is NOT in totalTasks (only terminal states counted).
    expect(result.totalTasks).toBe(3);
  });

  it("buildTeamRunResult_noTerminalTasks_returnsZeroCounts", () => {
    const queue = makeQueue();
    loadSpecsIntoQueue([makeSpec("Pending")], queue);

    const result = buildTeamRunResult("goal", queue, new Map(), Date.now());

    expect(result.totalTasks).toBe(0);
    expect(result.completed).toBe(0);
    expect(result.failed).toBe(0);
    expect(result.skipped).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// buildTeamRunResult — duration
// ---------------------------------------------------------------------------

describe("buildTeamRunResult — duration", () => {
  it("buildTeamRunResult_withStartTime_durationMsIsPositive", () => {
    const queue = makeQueue();
    const startTime = Date.now() - 500;

    const result = buildTeamRunResult("goal", queue, new Map(), startTime);

    expect(result.durationMs).toBeGreaterThanOrEqual(500);
  });

  it("buildTeamRunResult_immediateCall_durationMsIsNonNegative", () => {
    const queue = makeQueue();
    const startTime = Date.now();

    const result = buildTeamRunResult("goal", queue, new Map(), startTime);

    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });
});

// ---------------------------------------------------------------------------
// buildTeamRunResult — results map
// ---------------------------------------------------------------------------

describe("buildTeamRunResult — results map", () => {
  it("buildTeamRunResult_completedTask_resultsMapHasSuccessTrueAndOutput", () => {
    const queue = makeQueue();
    const specs = [makeSpec("Worker", [], { assignee: "agent-beta" })];
    const titleToId = loadSpecsIntoQueue(specs, queue);
    const taskId = titleToId.get("Worker")!;

    queue.start(taskId);
    queue.complete(taskId);

    const outputs = new Map([[taskId, "the final answer"]]);
    const result = buildTeamRunResult("goal", queue, outputs, Date.now());

    const entry = result.results.get(taskId)!;
    expect(entry.success).toBe(true);
    expect(entry.output).toBe("the final answer");
    expect(entry.agentName).toBe("agent-beta");
  });

  it("buildTeamRunResult_failedTask_resultsMapHasSuccessFalse", () => {
    const queue = makeQueue();
    const specs = [makeSpec("Broken")];
    const titleToId = loadSpecsIntoQueue(specs, queue);
    const taskId = titleToId.get("Broken")!;

    queue.start(taskId);
    queue.fail(taskId, "error occurred");

    const result = buildTeamRunResult("goal", queue, new Map(), Date.now());

    const entry = result.results.get(taskId)!;
    expect(entry.success).toBe(false);
  });

  it("buildTeamRunResult_taskMissingFromOutputs_usesEmptyStringOutput", () => {
    const queue = makeQueue();
    const specs = [makeSpec("Silent")];
    const titleToId = loadSpecsIntoQueue(specs, queue);
    const taskId = titleToId.get("Silent")!;

    queue.start(taskId);
    queue.complete(taskId);

    // No entry in completedOutputs for this taskId.
    const result = buildTeamRunResult("goal", queue, new Map(), Date.now());

    expect(result.results.get(taskId)!.output).toBe("");
  });
});
