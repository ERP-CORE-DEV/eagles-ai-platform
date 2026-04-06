/**
 * @fileoverview Assembles the full execution prompt for a single task dispatch.
 *
 * Ported and adapted from open-multi-agent (JackChen-me/open-multi-agent).
 * Pure function — no I/O, no side effects — so it is trivial to unit-test and
 * safe to call repeatedly without cost.
 */

import type { TaskDefinition } from "../tasks/types.js";
import type { Team } from "./Team.js";

// ---------------------------------------------------------------------------
// buildTaskPrompt
// ---------------------------------------------------------------------------

/**
 * Assembles the full execution prompt for a single task dispatch.
 *
 * Sections included (in order):
 * 1. Task name + description
 * 2. Team roster (agent names, roles, capabilities)
 * 3. Outputs from completed upstream tasks (direct dependsOn chain)
 * 4. Shared mission context (from the caller — memory or session findings)
 * 5. Messages from the MessageBus directed at the assigned agent
 *
 * @param task            - The task to build a prompt for.
 * @param team            - The team instance (roster + message bus).
 * @param completedTasks  - Map of taskId → output string for already-completed tasks.
 * @param sharedContext   - Optional free-text context injected by the caller.
 * @returns Formatted prompt string ready for agent dispatch.
 */
export function buildTaskPrompt(
  task: TaskDefinition,
  team: Team,
  completedTasks: Map<string, string>,
  sharedContext?: string,
): string {
  const sections: string[] = [];

  // ---- 1. Task header -------------------------------------------------------
  sections.push(`## Task: ${task.name}`);
  sections.push(task.description);

  // ---- 2. Team roster -------------------------------------------------------
  sections.push("\n## Team roster");
  for (const agent of team.agents) {
    const caps = agent.capabilities.join(", ");
    sections.push(`- **${agent.name}** (${agent.role}): ${caps}`);
  }

  // ---- 3. Upstream task outputs --------------------------------------------
  const upstreamOutputs: string[] = [];
  for (const depId of task.dependsOn) {
    const output = completedTasks.get(depId);
    if (output !== undefined) {
      const depTask = team.queue.getTask(depId);
      const label = depTask !== undefined ? depTask.name : depId;
      upstreamOutputs.push(`### Output of "${label}"\n${output}`);
    }
  }
  if (upstreamOutputs.length > 0) {
    sections.push("\n## Upstream results");
    sections.push(...upstreamOutputs);
  }

  // ---- 4. Shared context ---------------------------------------------------
  if (sharedContext !== undefined && sharedContext.trim().length > 0) {
    sections.push("\n## Shared context");
    sections.push(sharedContext.trim());
  }

  // ---- 5. MessageBus messages for assigned agent ---------------------------
  const assignedAgentName = task.assignedAgent;
  if (assignedAgentName !== null) {
    const messages = team.messageBus.getUnread(assignedAgentName);
    if (messages.length > 0) {
      sections.push("\n## Messages from teammates");
      for (const msg of messages) {
        sections.push(`- **From ${msg.from}**: ${msg.content}`);
      }
    }
  }

  return sections.join("\n");
}
