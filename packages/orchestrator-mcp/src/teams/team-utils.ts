/**
 * @fileoverview Team utility functions for loading task specs and summarising
 * run results.
 *
 * Ported from open-multi-agent loadSpecsIntoQueue + buildTeamRunResult with
 * EAGLES-specific adaptations:
 * - Two-pass title→UUID resolution using createTask + DagTaskQueue constructor
 * - TeamRunResult uses Map for O(1) agent output lookup
 * - Unknown dependency titles emit a console warning and are skipped (not thrown)
 */

import { randomUUID } from "node:crypto";
import { createTask } from "../tasks/task-utils.js";
import { DagTaskQueue } from "../tasks/DagTaskQueue.js";
import type { TaskDefinition, TaskPriority } from "../tasks/types.js";

// ---------------------------------------------------------------------------
// TaskSpec
// ---------------------------------------------------------------------------

export interface TaskSpec {
  readonly title: string;
  readonly description: string;
  readonly assignee: string;
  readonly dependsOn: readonly string[];
  readonly priority?: string;
}

// ---------------------------------------------------------------------------
// loadSpecsIntoQueue
// ---------------------------------------------------------------------------

/**
 * Loads an array of human-readable {@link TaskSpec} entries into a
 * {@link DagTaskQueue} using a two-pass title→UUID resolution strategy.
 *
 * **Pass 1**: Generate a stable UUID for every spec and build a title→taskId
 * map. No tasks are added to the queue yet.
 *
 * **Pass 2**: Resolve each spec's `dependsOn` titles to UUIDs. Titles that
 * cannot be resolved emit a `console.warn` and are silently skipped so that
 * the remaining graph remains valid. All fully-resolved {@link TaskDefinition}
 * objects are added to the queue via {@link DagTaskQueue.add}.
 *
 * @returns A `Map<title, taskId>` that callers can use to look up task UUIDs
 *          by their original spec titles.
 *
 * @example
 * ```ts
 * const titleToId = loadSpecsIntoQueue(specs, queue);
 * const architectId = titleToId.get('Design system architecture');
 * ```
 */
export function loadSpecsIntoQueue(
  specs: readonly TaskSpec[],
  queue: DagTaskQueue,
): Map<string, string> {
  // Pass 1: assign a stable UUID to every spec title.
  const titleToId = new Map<string, string>();
  for (const spec of specs) {
    titleToId.set(spec.title, randomUUID());
  }

  // Pass 2: build fully-wired TaskDefinition objects and add them to the queue.
  for (const spec of specs) {
    const taskId = titleToId.get(spec.title)!;

    const resolvedDepIds: string[] = [];
    for (const depTitle of spec.dependsOn) {
      const depId = titleToId.get(depTitle);
      if (depId === undefined) {
        console.warn(
          `[loadSpecsIntoQueue] Unknown dependency title "${depTitle}" for task "${spec.title}" — skipping.`,
        );
        continue;
      }
      resolvedDepIds.push(depId);
    }

    const task: TaskDefinition = {
      taskId,
      name: spec.title,
      description: spec.description,
      dependsOn: resolvedDepIds,
      requiredCapabilities: [],
      priority: _normalisePriority(spec.priority),
      status: "pending",
      assignedAgent: spec.assignee,
      result: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };

    queue.add(task);
  }

  return titleToId;
}

// ---------------------------------------------------------------------------
// TeamRunResult
// ---------------------------------------------------------------------------

export interface TeamRunResult {
  readonly goal: string;
  readonly totalTasks: number;
  readonly completed: number;
  readonly failed: number;
  readonly skipped: number;
  readonly results: Map<string, { agentName: string; output: string; success: boolean }>;
  readonly synthesis?: string;
  readonly durationMs: number;
}

// ---------------------------------------------------------------------------
// buildTeamRunResult
// ---------------------------------------------------------------------------

/**
 * Builds a {@link TeamRunResult} summary from a completed (or partially
 * completed) {@link DagTaskQueue} run.
 *
 * Counts are derived from the queue's terminal-state tasks. The `results` map
 * is populated from `completedOutputs` — tasks absent from the map but present
 * in the queue receive an empty string output.
 *
 * @param goal             - The original team goal / mission statement.
 * @param queue            - The queue after execution (all tasks terminal).
 * @param completedOutputs - Map of taskId → agent output string.
 * @param startTime        - `Date.now()` captured before execution began.
 */
export function buildTeamRunResult(
  goal: string,
  queue: DagTaskQueue,
  completedOutputs: Map<string, string>,
  startTime: number,
): TeamRunResult {
  const completed = queue.getByStatus("completed");
  const failed = queue.getByStatus("failed");
  const skipped = queue.getByStatus("skipped");

  const allTerminal = [...completed, ...failed, ...skipped];
  const totalTasks = allTerminal.length;

  const results = new Map<
    string,
    { agentName: string; output: string; success: boolean }
  >();

  for (const task of allTerminal) {
    results.set(task.taskId, {
      agentName: task.assignedAgent ?? "unassigned",
      output: completedOutputs.get(task.taskId) ?? "",
      success: task.status === "completed",
    });
  }

  return {
    goal,
    totalTasks,
    completed: completed.length,
    failed: failed.length,
    skipped: skipped.length,
    results,
    durationMs: Date.now() - startTime,
  };
}

// ---------------------------------------------------------------------------
// Private helpers
// ---------------------------------------------------------------------------

function _normalisePriority(raw: string | undefined): TaskPriority {
  if (raw === "urgent" || raw === "high" || raw === "normal" || raw === "low") {
    return raw;
  }
  return "normal";
}
