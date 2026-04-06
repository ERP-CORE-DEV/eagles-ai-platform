/**
 * @fileoverview Pure task utility functions.
 *
 * These helpers operate on plain {@link TaskDefinition} values without any
 * mutable state, making them safe to use in reducers, tests, and reactive
 * pipelines. Stateful orchestration belongs in {@link TaskEngine}.
 *
 * Ported from open-multi-agent with EAGLES adaptations:
 * - Mapped upstream `Task` fields to EAGLES `TaskDefinition` (taskId, name, assignedAgent)
 * - Enhanced `validateTaskDependencies`: detects self-deps, unknown refs, AND full cycle paths
 * - `getTaskDependencyOrder` uses Kahn's algorithm — returns partial order if graph has cycles
 */

import { randomUUID } from "node:crypto";
import type { TaskDefinition, TaskPriority } from "./types.js";

// ---------------------------------------------------------------------------
// Factory
// ---------------------------------------------------------------------------

/**
 * Creates a new {@link TaskDefinition} with a generated UUID, `'pending'`
 * status, and `createdAt` timestamp set to the current instant.
 *
 * @example
 * ```ts
 * const task = createTask({ name: 'Research competitors', description: 'Identify top 5' });
 * ```
 */
export function createTask(input: {
  readonly name: string;
  readonly description: string;
  readonly dependsOn?: readonly string[];
  readonly requiredCapabilities?: readonly string[];
  readonly priority?: TaskPriority;
  readonly assignedAgent?: string;
}): TaskDefinition {
  return {
    taskId: randomUUID(),
    name: input.name,
    description: input.description,
    dependsOn: input.dependsOn ? [...input.dependsOn] : [],
    requiredCapabilities: input.requiredCapabilities
      ? [...input.requiredCapabilities]
      : [],
    priority: input.priority ?? "normal",
    status: "pending",
    assignedAgent: input.assignedAgent ?? null,
    result: null,
    createdAt: new Date().toISOString(),
    completedAt: null,
  };
}

// ---------------------------------------------------------------------------
// Readiness
// ---------------------------------------------------------------------------

/**
 * Returns `true` when `task` can be started immediately.
 *
 * A task is ready when:
 * 1. Its status is `'pending'`.
 * 2. Every task listed in `task.dependsOn` has status `'completed'`.
 *
 * Tasks whose dependencies are missing from `allTasks` are treated as
 * unresolvable and therefore **not** ready.
 *
 * @param task     - The task to evaluate.
 * @param allTasks - The full collection of tasks in the current plan.
 * @param taskById - Optional pre-built id→task map. When provided the function
 *                   skips rebuilding the map, reducing call-site complexity
 *                   from O(n²) to O(n) when used inside a loop.
 */
export function isTaskReady(
  task: TaskDefinition,
  allTasks: readonly TaskDefinition[],
  taskById?: ReadonlyMap<string, TaskDefinition>,
): boolean {
  if (task.status !== "pending") return false;
  if (task.dependsOn.length === 0) return true;

  const map =
    taskById ??
    new Map<string, TaskDefinition>(allTasks.map((t) => [t.taskId, t]));

  for (const depId of task.dependsOn) {
    const dep = map.get(depId);
    if (dep === undefined || dep.status !== "completed") return false;
  }

  return true;
}

// ---------------------------------------------------------------------------
// Topological sort
// ---------------------------------------------------------------------------

/**
 * Returns `tasks` sorted so that each task appears after all of its
 * dependencies — a standard topological (Kahn's algorithm) ordering.
 *
 * Tasks with no dependencies come first. If the graph contains a cycle the
 * function returns a partial result containing only the tasks that could be
 * ordered; use {@link validateTaskDependencies} to detect cycles before
 * calling this function in production paths.
 *
 * @example
 * ```ts
 * const ordered = getTaskDependencyOrder(tasks);
 * for (const task of ordered) {
 *   await run(task);
 * }
 * ```
 */
export function getTaskDependencyOrder(
  tasks: readonly TaskDefinition[],
): TaskDefinition[] {
  if (tasks.length === 0) return [];

  const taskById = new Map<string, TaskDefinition>(
    tasks.map((t) => [t.taskId, t]),
  );

  // Build adjacency: dependsOn edges become in-degree counts and successor lists.
  const inDegree = new Map<string, number>();
  const successors = new Map<string, string[]>();

  for (const task of tasks) {
    if (!inDegree.has(task.taskId)) inDegree.set(task.taskId, 0);
    if (!successors.has(task.taskId)) successors.set(task.taskId, []);

    for (const depId of task.dependsOn) {
      // Only count dependencies that exist in this task set.
      if (taskById.has(depId)) {
        inDegree.set(task.taskId, (inDegree.get(task.taskId) ?? 0) + 1);
        const deps = successors.get(depId) ?? [];
        deps.push(task.taskId);
        successors.set(depId, deps);
      }
    }
  }

  // Kahn's algorithm: start with all nodes of in-degree 0.
  const queue: string[] = [];
  for (const [id, degree] of inDegree) {
    if (degree === 0) queue.push(id);
  }

  const ordered: TaskDefinition[] = [];
  while (queue.length > 0) {
    // Non-null assertion is safe: queue.length > 0 is the loop guard.
    const id = queue.shift()!;
    const task = taskById.get(id);
    if (task !== undefined) ordered.push(task);

    for (const successorId of successors.get(id) ?? []) {
      const newDegree = (inDegree.get(successorId) ?? 0) - 1;
      inDegree.set(successorId, newDegree);
      if (newDegree === 0) queue.push(successorId);
    }
  }

  return ordered;
}

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

/**
 * Validates the dependency graph of a task collection.
 *
 * Checks (in order):
 * 1. **Self-dependencies** — a task listing its own `taskId` in `dependsOn`.
 * 2. **Unknown references** — a `dependsOn` entry that does not match any
 *    `taskId` in the collection.
 * 3. **Cycles** — transitive dependency loops. The full cycle path is reported
 *    (e.g. `"A -> B -> C -> A"`), not just the node names.
 *
 * This is an enhancement over the EAGLES `TaskEngine.validateDag()` which
 * only detects cycles and does not report self-deps or unknown references.
 *
 * @returns `{ valid: true }` when no issues were found, or
 *          `{ valid: false, errors: string[] }` describing each problem.
 *
 * @example
 * ```ts
 * const { valid, errors } = validateTaskDependencies(tasks);
 * if (!valid) throw new Error(errors.join('\n'));
 * ```
 */
export function validateTaskDependencies(tasks: readonly TaskDefinition[]): {
  readonly valid: boolean;
  readonly errors: readonly string[];
} {
  const errors: string[] = [];
  const taskById = new Map<string, TaskDefinition>(
    tasks.map((t) => [t.taskId, t]),
  );

  // Pass 1: self-dependencies and unknown references.
  for (const task of tasks) {
    for (const depId of task.dependsOn) {
      if (depId === task.taskId) {
        errors.push(
          `Task "${task.name}" (${task.taskId}) depends on itself.`,
        );
        continue;
      }
      if (!taskById.has(depId)) {
        errors.push(
          `Task "${task.name}" (${task.taskId}) references unknown dependency "${depId}".`,
        );
      }
    }
  }

  // Pass 2: cycle detection via DFS colouring (white=0, grey=1, black=2).
  // Reports the full cycle path, not just the participating node names.
  const colour = new Map<string, 0 | 1 | 2>();
  for (const task of tasks) colour.set(task.taskId, 0);

  const visit = (id: string, path: readonly string[]): void => {
    if (colour.get(id) === 2) return; // Already fully explored — no cycle through here.
    if (colour.get(id) === 1) {
      // Found a back-edge — build the full cycle path.
      const cycleStart = path.indexOf(id);
      const cyclePath = [...path.slice(cycleStart), id];
      const cycleNames = cyclePath.map((nodeId) => {
        const t = taskById.get(nodeId);
        return t !== undefined ? `"${t.name}" (${nodeId})` : nodeId;
      });
      errors.push(`Cyclic dependency detected: ${cycleNames.join(" -> ")}`);
      return;
    }

    colour.set(id, 1);
    const task = taskById.get(id);
    for (const depId of task?.dependsOn ?? []) {
      if (taskById.has(depId)) {
        visit(depId, [...path, id]);
      }
    }
    colour.set(id, 2);
  };

  for (const task of tasks) {
    if (colour.get(task.taskId) === 0) {
      visit(task.taskId, []);
    }
  }

  return { valid: errors.length === 0, errors };
}
