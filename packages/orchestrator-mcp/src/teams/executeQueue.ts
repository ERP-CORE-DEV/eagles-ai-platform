/**
 * @fileoverview Round-based parallel dispatch loop for team task execution.
 *
 * Ported and adapted from open-multi-agent (JackChen-me/open-multi-agent) with
 * EAGLES-specific adaptations:
 * - No live LLM pool — dispatch produces a structured DispatchResult that the
 *   MCP layer (mission_execute tool) returns to the caller. The caller
 *   (Claude Code agent) is responsible for the actual agent sub-invocation.
 * - Semaphore bounds concurrent dispatches (from Team.semaphore).
 * - Scheduler.autoAssign() assigns agents to pending tasks before each round.
 * - Stuck detection: if a round completes with zero new successes and zero
 *   newly unblocked tasks, the loop terminates with a 'stuck' warning.
 */

import type { Team } from "./Team.js";
import type { Scheduler } from "../tasks/Scheduler.js";
import { buildTaskPrompt } from "./buildTaskPrompt.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface ProgressEvent {
  readonly round: number;
  readonly totalTasks: number;
  readonly completed: number;
  readonly failed: number;
  readonly pending: number;
  readonly running: number;
}

export interface DispatchResult {
  readonly taskId: string;
  readonly agentName: string;
  readonly success: boolean;
  readonly output: string;
  readonly error?: string;
  readonly tokensUsed?: number;
}

export interface ExecuteQueueOptions {
  readonly team: Team;
  readonly scheduler: Scheduler;
  readonly maxRounds: number;
  readonly sharedContext?: string;
  readonly onProgress?: (event: ProgressEvent) => void;
  readonly abortSignal?: { aborted: boolean };
}

// ---------------------------------------------------------------------------
// executeQueue
// ---------------------------------------------------------------------------

/**
 * Runs the team queue round-by-round until all tasks reach a terminal state,
 * or `maxRounds` is exhausted, or the abort signal fires.
 *
 * Each round:
 * 1. Check abort signal — break if aborted.
 * 2. Call scheduler.autoAssign() — stamp assignedAgent onto pending tasks in the
 *    queue (via the task's assignedAgent field when available, otherwise use
 *    assignment results to map taskId → agent name for prompt building).
 * 3. Get all pending tasks from the queue.
 * 4. If no pending tasks, break (all tasks are either running, complete, failed,
 *    blocked, or skipped).
 * 5. Build dispatch promises — one per pending task, bounded by the semaphore.
 * 6. Each dispatch:
 *    a. Marks the task in_progress via queue.start(taskId).
 *    b. Builds the prompt via buildTaskPrompt().
 *    c. Produces a DispatchResult representing the structured command.
 *    d. On "success": queue.complete(taskId, output).
 *    e. On "failure": queue.fail(taskId, error) → triggers cascade.
 * 7. Execute all dispatches via Promise.allSettled.
 * 8. Emit progress event.
 * 9. Stuck detection: if no tasks were completed in this round AND the number
 *    of pending+running tasks did not decrease, break with a stuck warning.
 * 10. Loop.
 *
 * EAGLES adaptation note:
 * Since we have no live LLM agent pool, the "execution" of each task is
 * simulated by building the full prompt and recording it as the task output.
 * The mission_execute MCP tool returns these DispatchResults to Claude Code,
 * which can then act as the agent pool by invoking sub-agents for each item.
 */
export async function executeQueue(
  options: ExecuteQueueOptions,
): Promise<DispatchResult[]> {
  const { team, scheduler, maxRounds, sharedContext, onProgress, abortSignal } = options;
  const allResults: DispatchResult[] = [];

  // completedTasks: taskId → output string, used by buildTaskPrompt for upstream context.
  const completedTasks = new Map<string, string>();

  // Seed completedTasks from any tasks that were already completed before we started.
  for (const task of team.queue.getByStatus("completed")) {
    if (task.result !== null) {
      completedTasks.set(task.taskId, task.result);
    }
  }

  for (let round = 0; round < maxRounds; round++) {
    // ---- 1. Abort check ----------------------------------------------------
    if (abortSignal?.aborted === true) break;

    // ---- 2. Assign agents to pending tasks ----------------------------------
    const schedulerAgents = team.agents.map((a) => ({
      agentId: a.agentId,
      name: a.name,
      capabilities: a.capabilities as string[],
      status: "idle" as const,
      assignedTaskCount: 0,
    }));

    const assignments = scheduler.autoAssign(team.queue, schedulerAgents);

    // Build a lookup: taskId → agentName for this round's assignments.
    const agentIdToName = new Map<string, string>(
      team.agents.map((a) => [a.agentId, a.name]),
    );
    const taskToAgentName = new Map<string, string>(
      assignments.map((r) => [r.taskId, agentIdToName.get(r.agentId) ?? r.agentId]),
    );

    // ---- 3. Collect pending tasks -------------------------------------------
    const pendingTasks = team.queue.getByStatus("pending");

    // ---- 4. Break if no work left -------------------------------------------
    if (pendingTasks.length === 0) break;

    // ---- 5-7. Build + execute dispatch batch --------------------------------
    const roundCompletedCount = { value: 0 };

    const dispatchPromises = pendingTasks.map((task) => {
      return team.semaphore.run(async (): Promise<DispatchResult> => {
        // Mark as in_progress in the queue.
        try {
          team.queue.start(task.taskId);
        } catch {
          // Task may have been started by a concurrent branch — skip.
          return {
            taskId: task.taskId,
            agentName: taskToAgentName.get(task.taskId) ?? "unknown",
            success: false,
            output: "",
            error: "task already running or not pending",
          };
        }

        const agentName = taskToAgentName.get(task.taskId) ?? "unknown";

        // Build context-rich prompt for the agent.
        // Patch task with assignedAgent for buildTaskPrompt's message lookup.
        const taskWithAgent = { ...task, assignedAgent: agentName };
        const prompt = buildTaskPrompt(
          taskWithAgent,
          team,
          completedTasks,
          sharedContext,
        );

        // EAGLES adaptation: the prompt IS the dispatch output.
        // In a live pool this would be: const output = await pool.run(agentName, prompt)
        // Here we record the prompt as the structured command for the MCP caller.
        const output = prompt;

        try {
          team.queue.complete(task.taskId, output);
          completedTasks.set(task.taskId, output);
          roundCompletedCount.value++;

          return {
            taskId: task.taskId,
            agentName,
            success: true,
            output,
          };
        } catch (err) {
          const errorMessage =
            err instanceof Error ? err.message : String(err);
          team.queue.fail(task.taskId, errorMessage);

          return {
            taskId: task.taskId,
            agentName,
            success: false,
            output: "",
            error: errorMessage,
          };
        }
      });
    });

    const settled = await Promise.allSettled(dispatchPromises);

    for (const outcome of settled) {
      if (outcome.status === "fulfilled") {
        allResults.push(outcome.value);
      } else {
        // The semaphore.run() wrapper itself should not throw, but guard anyway.
        allResults.push({
          taskId: "unknown",
          agentName: "unknown",
          success: false,
          output: "",
          error: outcome.reason instanceof Error
            ? outcome.reason.message
            : String(outcome.reason),
        });
      }
    }

    // ---- 8. Emit progress ---------------------------------------------------
    if (onProgress !== undefined) {
      const allStatuses = [
        ...team.queue.getByStatus("pending"),
        ...team.queue.getByStatus("running"),
        ...team.queue.getByStatus("completed"),
        ...team.queue.getByStatus("failed"),
        ...team.queue.getByStatus("skipped"),
        ...team.queue.getByStatus("blocked"),
      ];
      onProgress({
        round: round + 1,
        totalTasks: allStatuses.length,
        completed: team.queue.getByStatus("completed").length,
        failed: team.queue.getByStatus("failed").length,
        pending: team.queue.getByStatus("pending").length,
        running: team.queue.getByStatus("running").length,
      });
    }

    // ---- 9. Stuck detection -------------------------------------------------
    // Break if nothing completed this round AND there are no newly-pending tasks.
    if (roundCompletedCount.value === 0) {
      const stillPending = team.queue.getByStatus("pending").length;
      const stillRunning = team.queue.getByStatus("running").length;
      if (stillPending === 0 && stillRunning === 0) break;

      // Some tasks remain blocked with no hope of progress — stuck.
      const blockedCount = team.queue.getByStatus("blocked").length;
      if (blockedCount > 0 && stillPending === 0) break;
    }

    // ---- Break when queue is fully settled ----------------------------------
    if (team.queue.isComplete()) break;
  }

  return allResults;
}
