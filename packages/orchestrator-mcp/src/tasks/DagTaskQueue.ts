/**
 * @fileoverview Dependency-aware DAG task queue backed by SQLite checkpoints.
 *
 * Ported and adapted from open-multi-agent (JackChen-me/open-multi-agent) with
 * EAGLES-specific adaptations:
 * - Fields mapped to EAGLES TaskDefinition (taskId not id, assignedAgent not assignee)
 * - SQLite checkpoint via TaskStore.upsert() on every state transition
 * - Symbol-keyed subscriptions prevent duplicate-handler registration bugs
 * - Stuck-detection guard with maxRounds circuit-breaker
 * - 'blocked' and 'skipped' states added to TaskStatus
 */

import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { TaskStore } from "@eagles-ai-platform/data-layer";
import { isTaskReady, validateTaskDependencies } from "./task-utils.js";
import type { TaskDefinition, TaskStatus } from "./types.js";

// ---------------------------------------------------------------------------
// Event types
// ---------------------------------------------------------------------------

export type DagTaskQueueEvent =
  | "task:added"
  | "task:started"
  | "task:completed"
  | "task:failed"
  | "task:skipped"
  | "task:unblocked"
  | "error";

type TaskEventHandler = (task: TaskDefinition) => void;
type ErrorEventHandler = (diagnostic: { reason: string; details: unknown }) => void;
type AnyHandler = TaskEventHandler | ErrorEventHandler;

// ---------------------------------------------------------------------------
// Options
// ---------------------------------------------------------------------------

export interface DagTaskQueueOptions {
  /**
   * Maximum scheduling rounds before the stuck-detection guard fires.
   * Defaults to 1000. A "round" is one full pass across blocked tasks looking
   * for newly-satisfiable tasks. When the guard fires the queue emits 'error'
   * with a 'stuck' diagnostic.
   */
  readonly maxRounds?: number;

  /**
   * Path to an existing SQLite database to restore state from.
   * When omitted, a fresh temp-file-backed store is used.
   */
  readonly dbPath?: string;
}

// ---------------------------------------------------------------------------
// DagTaskQueue
// ---------------------------------------------------------------------------

/**
 * In-memory execution buffer with SQLite checkpoints.
 *
 * Tasks are held in a `Map<taskId, TaskDefinition>` for O(1) lookups.
 * Every state transition is checkpointed to the TaskStore via `upsert()` so
 * a new instance constructed from the same `dbPath` restores the prior state.
 *
 * @example
 * ```ts
 * const queue = new DagTaskQueue(tasks);
 * queue.on('task:unblocked', (t) => queue.start(t.taskId));
 * queue.on('task:started',   (t) => execute(t));
 * ```
 */
export class DagTaskQueue {
  private readonly _tasks = new Map<string, TaskDefinition>();
  private readonly _store: TaskStore;
  private readonly _dbPath: string;
  private readonly _maxRounds: number;

  /** Symbol-keyed handler maps, keyed by event name. */
  private readonly _listeners = new Map<
    DagTaskQueueEvent,
    Map<symbol, AnyHandler>
  >();

  constructor(
    tasks: readonly TaskDefinition[],
    options: DagTaskQueueOptions = {},
  ) {
    this._maxRounds = options.maxRounds ?? 1_000;

    if (options.dbPath !== undefined) {
      this._dbPath = options.dbPath;
    } else {
      const dir = mkdtempSync(join(tmpdir(), "dag-task-queue-"));
      this._dbPath = join(dir, "tasks.sqlite");
    }
    this._store = new TaskStore(this._dbPath);

    // Validate DAG before accepting any tasks.
    const { valid, errors } = validateTaskDependencies(tasks);
    if (!valid) {
      throw new Error(
        `DagTaskQueue: invalid dependency graph.\n${errors.join("\n")}`,
      );
    }

    // Load tasks — restore from SQLite snapshot when available.
    for (const task of tasks) {
      const stored = this._store.get(task.taskId);
      if (stored !== null) {
        // Restore from snapshot — stored.status may be 'blocked' or 'skipped'
        // since upsert() persists any TaskStatus string.
        const restored: TaskDefinition = {
          ...task,
          status: stored.status as TaskStatus,
          result: stored.result,
          completedAt: stored.completedAt,
          assignedAgent: stored.assignedAgent,
        };
        this._tasks.set(task.taskId, restored);
      } else {
        const initialStatus = this._resolveInitialStatus(task);
        const initialTask: TaskDefinition = { ...task, status: initialStatus };
        this._tasks.set(task.taskId, initialTask);
        this._checkpoint(initialTask);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // Accessors (primarily for testing)
  // ---------------------------------------------------------------------------

  /** SQLite file path — useful for snapshot-restoration tests. */
  get dbPath(): string {
    return this._dbPath;
  }

  /** Underlying TaskStore — allows direct SQLite assertions in tests. */
  get store(): TaskStore {
    return this._store;
  }

  // ---------------------------------------------------------------------------
  // Mutation: add
  // ---------------------------------------------------------------------------

  /**
   * Adds a single task after construction.
   *
   * Re-validates the full graph including the new task. The new task starts as
   * 'pending' when all its dependencies are already 'completed', otherwise
   * 'blocked'.
   */
  add(task: TaskDefinition): void {
    const allTasks = [...Array.from(this._tasks.values()), task];
    const { valid, errors } = validateTaskDependencies(allTasks);
    if (!valid) {
      throw new Error(
        `DagTaskQueue.add: invalid graph after adding "${task.name}".\n${errors.join("\n")}`,
      );
    }

    const initialStatus = this._resolveInitialStatus(task);
    const initialTask: TaskDefinition = { ...task, status: initialStatus };
    this._tasks.set(task.taskId, initialTask);
    this._checkpoint(initialTask);
    this._emit("task:added", initialTask);
  }

  // ---------------------------------------------------------------------------
  // Mutation: lifecycle transitions
  // ---------------------------------------------------------------------------

  /**
   * Transitions a 'pending' task to 'running'. Fires 'task:started'.
   *
   * @throws {Error} when taskId is not found or the task is not 'pending'.
   */
  start(taskId: string): void {
    const task = this._requireTask(taskId);
    if (task.status !== "pending") {
      throw new Error(
        `DagTaskQueue.start: task "${taskId}" is "${task.status}", expected "pending".`,
      );
    }
    const updated: TaskDefinition = { ...task, status: "running" };
    this._tasks.set(taskId, updated);
    this._checkpoint(updated);
    this._emit("task:started", updated);
  }

  /**
   * Marks a task 'completed', checkpoints to SQLite, then unblocks dependents.
   * Fires 'task:completed' then 'task:unblocked' for each newly-pending task.
   */
  complete(taskId: string, result?: unknown): void {
    const task = this._requireTask(taskId);
    const resultStr = result !== undefined ? JSON.stringify(result) : null;
    const now = new Date().toISOString();
    const updated: TaskDefinition = {
      ...task,
      status: "completed",
      result: resultStr,
      completedAt: now,
    };
    this._tasks.set(taskId, updated);
    this._checkpoint(updated);
    this._emit("task:completed", updated);
    this._unblockDependents(taskId);
  }

  /**
   * Marks a task 'failed', checkpoints to SQLite, then cascades to dependents.
   * Fires 'task:failed' for this task and every transitively-blocked downstream.
   */
  fail(taskId: string, error: string): void {
    const task = this._requireTask(taskId);
    const now = new Date().toISOString();
    const updated: TaskDefinition = {
      ...task,
      status: "failed",
      result: error,
      completedAt: now,
    };
    this._tasks.set(taskId, updated);
    this._checkpoint(updated);
    this._emit("task:failed", updated);
    this._cascadeFailure(taskId, error);
  }

  /**
   * Marks a task 'skipped', checkpoints to SQLite, then cascades to dependents.
   * Fires 'task:skipped' for this task and every transitively-blocked downstream.
   */
  skip(taskId: string, reason: string): void {
    const task = this._requireTask(taskId);
    const now = new Date().toISOString();
    const updated: TaskDefinition = {
      ...task,
      status: "skipped",
      result: reason,
      completedAt: now,
    };
    this._tasks.set(taskId, updated);
    this._checkpoint(updated);
    this._emit("task:skipped", updated);
    this._cascadeSkip(taskId, reason);
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  /** Returns all tasks whose status matches `status`. */
  getByStatus(status: TaskStatus): TaskDefinition[] {
    return Array.from(this._tasks.values()).filter((t) => t.status === status);
  }

  /** Returns the task with the given id, or `undefined` if not found. */
  getTask(taskId: string): TaskDefinition | undefined {
    return this._tasks.get(taskId);
  }

  /**
   * Returns `true` when every task has reached a terminal state
   * ('completed', 'failed', or 'skipped'), or the queue is empty.
   */
  isComplete(): boolean {
    for (const task of this._tasks.values()) {
      if (
        task.status !== "completed" &&
        task.status !== "failed" &&
        task.status !== "skipped"
      ) {
        return false;
      }
    }
    return true;
  }

  // ---------------------------------------------------------------------------
  // Events
  // ---------------------------------------------------------------------------

  /**
   * Subscribes to a queue event. Uses symbol-keyed subscriptions so that two
   * independent `on()` calls for the same event + handler reference produce
   * independent registrations that must each be unsubscribed independently.
   *
   * @returns An unsubscribe function. Calling it is idempotent.
   *
   * @example
   * ```ts
   * const unsub = queue.on('task:completed', (t) => console.log(t.taskId));
   * // later…
   * unsub();
   * ```
   */
  on(event: DagTaskQueueEvent, handler: AnyHandler): () => void {
    let map = this._listeners.get(event);
    if (map === undefined) {
      map = new Map();
      this._listeners.set(event, map);
    }
    const id = Symbol();
    map.set(id, handler);
    return () => {
      this._listeners.get(event)?.delete(id);
    };
  }

  /**
   * Removes a subscription by the symbol id returned from `on()`.
   *
   * Prefer the unsubscribe function returned by `on()` — it is O(1) and
   * does not require storing the symbol separately.
   */
  off(subId: symbol): void {
    for (const map of this._listeners.values()) {
      if (map.delete(subId)) return;
    }
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private _resolveInitialStatus(task: TaskDefinition): TaskStatus {
    if (task.dependsOn.length === 0) return "pending";

    const allCurrent = Array.from(this._tasks.values());
    const taskById = new Map<string, TaskDefinition>(
      allCurrent.map((t) => [t.taskId, t]),
    );
    const candidate: TaskDefinition = { ...task, status: "pending" };
    return isTaskReady(candidate, allCurrent, taskById) ? "pending" : "blocked";
  }

  /**
   * Scans all 'blocked' tasks and promotes to 'pending' any whose every
   * dependency is now 'completed'. Fires 'task:unblocked' for each promotion.
   *
   * The pre-built Map is rebuilt once at the start of each round and updated
   * in-place during the scan, keeping the operation O(n) per round.
   *
   * Stuck-detection guard: if the round counter reaches maxRounds AND no task
   * was unblocked in that round, an 'error' event is emitted with a 'stuck'
   * diagnostic and the loop terminates.
   */
  private _unblockDependents(_completedId: string): void {
    let round = 0;

    while (round < this._maxRounds) {
      round++;

      const allTasks = Array.from(this._tasks.values());
      const taskById = new Map<string, TaskDefinition>(
        allTasks.map((t) => [t.taskId, t]),
      );

      let anyUnblocked = false;

      for (const task of allTasks) {
        if (task.status !== "blocked") continue;

        const candidate: TaskDefinition = { ...task, status: "pending" };
        if (isTaskReady(candidate, allTasks, taskById)) {
          const unblocked: TaskDefinition = { ...task, status: "pending" };
          this._tasks.set(task.taskId, unblocked);
          taskById.set(task.taskId, unblocked);
          this._checkpoint(unblocked);
          this._emit("task:unblocked", unblocked);
          anyUnblocked = true;
        }
      }

      if (!anyUnblocked) break;
    }

    if (round >= this._maxRounds) {
      this._emitError({
        reason: "stuck",
        details: {
          rounds: round,
          blockedTasks: this.getByStatus("blocked").map((t) => t.taskId),
        },
      });
    }
  }

  /**
   * Recursively marks all tasks that transitively depend on `failedTaskId`
   * as 'failed' with a cascade error message.
   *
   * Only 'blocked' or 'pending' tasks are eligible; already-terminal tasks
   * are skipped. Uses an iterative BFS queue to avoid stack overflow on deep
   * dependency graphs.
   */
  private _cascadeFailure(failedTaskId: string, upstreamError: string): void {
    const bfsQueue: string[] = [failedTaskId];
    const visited = new Set<string>([failedTaskId]);

    while (bfsQueue.length > 0) {
      const currentId = bfsQueue.shift()!;

      for (const task of this._tasks.values()) {
        if (task.status !== "blocked" && task.status !== "pending") continue;
        if (!task.dependsOn.includes(currentId)) continue;
        if (visited.has(task.taskId)) continue;

        visited.add(task.taskId);
        const cascadeError = `cascade: ${upstreamError}`;
        const now = new Date().toISOString();
        const cascaded: TaskDefinition = {
          ...task,
          status: "failed",
          result: cascadeError,
          completedAt: now,
        };
        this._tasks.set(task.taskId, cascaded);
        this._checkpoint(cascaded);
        this._emit("task:failed", cascaded);
        bfsQueue.push(task.taskId);
      }
    }
  }

  /**
   * Recursively marks all tasks that transitively depend on `skippedTaskId`
   * as 'skipped'. Uses the same iterative BFS pattern as `_cascadeFailure`.
   */
  private _cascadeSkip(skippedTaskId: string, upstreamReason: string): void {
    const bfsQueue: string[] = [skippedTaskId];
    const visited = new Set<string>([skippedTaskId]);

    while (bfsQueue.length > 0) {
      const currentId = bfsQueue.shift()!;

      for (const task of this._tasks.values()) {
        if (task.status !== "blocked" && task.status !== "pending") continue;
        if (!task.dependsOn.includes(currentId)) continue;
        if (visited.has(task.taskId)) continue;

        visited.add(task.taskId);
        const cascadeReason = `cascade: ${upstreamReason}`;
        const now = new Date().toISOString();
        const cascaded: TaskDefinition = {
          ...task,
          status: "skipped",
          result: cascadeReason,
          completedAt: now,
        };
        this._tasks.set(task.taskId, cascaded);
        this._checkpoint(cascaded);
        this._emit("task:skipped", cascaded);
        bfsQueue.push(task.taskId);
      }
    }
  }

  // ---------------------------------------------------------------------------
  // SQLite checkpoint
  // ---------------------------------------------------------------------------

  /**
   * Upserts the task's current state to SQLite using the task's own taskId.
   * Uses TaskStore.upsert() which accepts a caller-supplied taskId (unlike
   * create() which generates a new UUID).
   */
  private _checkpoint(task: TaskDefinition): void {
    try {
      this._store.upsert({
        taskId: task.taskId,
        name: task.name,
        description: task.description,
        dependsOn: [...task.dependsOn],
        requiredCapabilities: [...task.requiredCapabilities],
        priority: task.priority,
        status: task.status,
        result: task.result,
        completedAt: task.completedAt,
      });
    } catch {
      // Checkpoint is advisory — do not let SQLite errors break execution flow.
    }
  }

  // ---------------------------------------------------------------------------
  // Event emitters
  // ---------------------------------------------------------------------------

  private _emit(event: DagTaskQueueEvent, task: TaskDefinition): void {
    const map = this._listeners.get(event);
    if (map === undefined) return;
    for (const handler of map.values()) {
      (handler as TaskEventHandler)(task);
    }
  }

  private _emitError(diagnostic: { reason: string; details: unknown }): void {
    const map = this._listeners.get("error");
    if (map === undefined) return;
    for (const handler of map.values()) {
      (handler as ErrorEventHandler)(diagnostic);
    }
  }

  private _requireTask(taskId: string): TaskDefinition {
    const task = this._tasks.get(taskId);
    if (task === undefined) {
      throw new Error(`DagTaskQueue: task "${taskId}" not found.`);
    }
    return task;
  }
}
