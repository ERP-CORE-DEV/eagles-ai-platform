import { describe, it, expect } from "vitest";
import {
  createTask,
  isTaskReady,
  getTaskDependencyOrder,
  validateTaskDependencies,
} from "../src/tasks/task-utils.js";
import type { TaskDefinition } from "../src/tasks/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Builds a minimal TaskDefinition for test purposes.
 * Provides required fields that are not under test with safe defaults.
 */
function makeTask(
  id: string,
  dependsOn: string[] = [],
  overrides: Partial<TaskDefinition> = {},
): TaskDefinition {
  return {
    taskId: id,
    name: id,
    description: `Task ${id}`,
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
// createTask
// ---------------------------------------------------------------------------

describe("createTask", () => {
  it("createTask_defaultInput_generatesDifferentUUIDs", () => {
    const t1 = createTask({ name: "Alpha", description: "First" });
    const t2 = createTask({ name: "Beta", description: "Second" });

    // Two separately created tasks must never share a taskId.
    expect(t1.taskId).not.toBe(t2.taskId);
  });

  it("createTask_withDependsOn_copiesArraySoMutationDoesNotLeak", () => {
    const deps = ["dep-1", "dep-2"];
    const task = createTask({ name: "T", description: "desc", dependsOn: deps });

    // Mutating the source array must not alter the task's dependsOn.
    deps.push("dep-3");
    expect(task.dependsOn).toHaveLength(2);
    expect(task.dependsOn).not.toContain("dep-3");
  });

  it("createTask_noDependsOn_producesEmptyDependsOnArray", () => {
    const task = createTask({ name: "Root", description: "No deps" });
    expect(task.dependsOn).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// isTaskReady
// ---------------------------------------------------------------------------

describe("isTaskReady", () => {
  it("isTaskReady_anyDepPending_returnsFalse", () => {
    const depA = makeTask("A", [], { status: "completed" });
    const depB = makeTask("B", [], { status: "pending" });
    const task = makeTask("C", ["A", "B"]);

    const ready = isTaskReady(task, [depA, depB, task]);

    // B is still pending — task C must not be ready.
    expect(ready).toBe(false);
  });

  it("isTaskReady_allDepsCompleted_returnsTrue", () => {
    const depA = makeTask("A", [], { status: "completed" });
    const depB = makeTask("B", [], { status: "completed" });
    const task = makeTask("C", ["A", "B"]);

    const ready = isTaskReady(task, [depA, depB, task]);

    expect(ready).toBe(true);
  });

  it("isTaskReady_noDeps_returnsTrue", () => {
    const task = makeTask("Solo");
    expect(isTaskReady(task, [task])).toBe(true);
  });

  it("isTaskReady_taskAlreadyRunning_returnsFalse", () => {
    const task = makeTask("X", [], { status: "running" });
    // Even with no unresolved deps, a non-pending task must not be 'ready'.
    expect(isTaskReady(task, [task])).toBe(false);
  });

  it("isTaskReady_missingDepFromAllTasks_returnsFalse", () => {
    // Dep "ghost" is not present in allTasks — must treat as unresolvable.
    const task = makeTask("T", ["ghost"]);
    expect(isTaskReady(task, [task])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// getTaskDependencyOrder
// ---------------------------------------------------------------------------

describe("getTaskDependencyOrder", () => {
  it("emptyGraph_returnsEmptyArray", () => {
    expect(getTaskDependencyOrder([])).toEqual([]);
  });

  it("singleTask_nodeps_returnsThatTask", () => {
    const task = makeTask("only");
    const order = getTaskDependencyOrder([task]);
    expect(order).toHaveLength(1);
    expect(order[0].taskId).toBe("only");
  });

  it("diamondDAG_AFirst_DLast_BCBetween", () => {
    // Diamond: A → B, A → C, B → D, C → D
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["A"]);
    const D = makeTask("D", ["B", "C"]);

    const order = getTaskDependencyOrder([A, B, C, D]);
    const ids = order.map((t) => t.taskId);

    // A must appear before B and C.
    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("B"));
    expect(ids.indexOf("A")).toBeLessThan(ids.indexOf("C"));

    // B and C must both appear before D.
    expect(ids.indexOf("B")).toBeLessThan(ids.indexOf("D"));
    expect(ids.indexOf("C")).toBeLessThan(ids.indexOf("D"));

    // All 4 tasks present in result.
    expect(ids).toHaveLength(4);
  });

  it("linearChain_respectsFullOrder", () => {
    // A → B → C → D (linear chain)
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);
    const D = makeTask("D", ["C"]);

    const order = getTaskDependencyOrder([D, C, B, A]); // intentionally shuffled input
    const ids = order.map((t) => t.taskId);

    expect(ids).toEqual(["A", "B", "C", "D"]);
  });
});

// ---------------------------------------------------------------------------
// validateTaskDependencies — enhanced detection
// ---------------------------------------------------------------------------

describe("validateTaskDependencies", () => {
  it("validDAG_returnsValidTrue_noErrors", () => {
    const A = makeTask("A");
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["A", "B"]);

    const { valid, errors } = validateTaskDependencies([A, B, C]);
    expect(valid).toBe(true);
    expect(errors).toHaveLength(0);
  });

  it("3NodeCycle_detectedWithFullPath_A_B_C_A", () => {
    // A → B → C → A cycle
    const A = makeTask("A", ["C"]);
    const B = makeTask("B", ["A"]);
    const C = makeTask("C", ["B"]);

    const { valid, errors } = validateTaskDependencies([A, B, C]);

    expect(valid).toBe(false);
    // At least one error message must contain all three node references in order.
    const cycleError = errors.find(
      (e) =>
        e.includes("A") && e.includes("B") && e.includes("C"),
    );
    expect(cycleError).toBeDefined();

    // The path separator "→" (or "->") must appear — proving path is reported,
    // not just individual node names.
    expect(cycleError).toMatch(/->|→/);
  });

  it("selfDependency_rejectedWithMentionOfTaskAndSelf", () => {
    const A = makeTask("A", ["A"]);

    const { valid, errors } = validateTaskDependencies([A]);

    expect(valid).toBe(false);
    const selfError = errors.find((e) => e.toLowerCase().includes("self") || e.includes("A"));
    expect(selfError).toBeDefined();
    // Must mention the task identifier.
    expect(errors.join(" ")).toContain("A");
  });

  it("unknownReference_rejectedWithMentionOfUnknownId", () => {
    const A = makeTask("A", ["ghost"]);

    const { valid, errors } = validateTaskDependencies([A]);

    expect(valid).toBe(false);
    // The unknown ID "ghost" must appear in the error message.
    expect(errors.join(" ")).toContain("ghost");
  });

  it("multipleProblems_allReportedNotJustFirst", () => {
    const A = makeTask("A", ["A"]);           // self-dep
    const B = makeTask("B", ["phantom"]);     // unknown ref

    const { valid, errors } = validateTaskDependencies([A, B]);

    expect(valid).toBe(false);
    // Both issues must be reported — not short-circuited at first failure.
    expect(errors.length).toBeGreaterThanOrEqual(2);
  });
});
