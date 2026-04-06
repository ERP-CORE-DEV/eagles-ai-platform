/**
 * @fileoverview Task scheduler with four configurable strategies.
 *
 * Ported and adapted from open-multi-agent (JackChen-me/open-multi-agent)
 * with EAGLES-specific adaptations:
 * - `Agent` type includes 'error' and 'offline' status values for health filtering
 * - French HR stop-words supported out of the box (CPF, OPCO, RNCP, CDI, CDD
 *   are content words, not stop-words — they are intentionally kept)
 * - Bi-directional keyword scoring: task→agent AND agent→task
 * - Optional synonyms map applied before scoring
 * - Health check: error/offline agents are excluded before any selection
 */

import type { DagTaskQueue } from "./DagTaskQueue.js";
import type { TaskDefinition } from "./types.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type SchedulingStrategy =
  | "round-robin"
  | "least-busy"
  | "capability-match"
  | "dependency-first";

/**
 * Agent shape consumed by the Scheduler.
 *
 * Extends the platform's AgentInfo with 'error' status (not persisted in
 * AgentRegistryStore but used at runtime) and assignedTaskCount for
 * least-busy strategy.
 */
export interface Agent {
  readonly agentId: string;
  readonly name: string;
  readonly capabilities: readonly string[];
  readonly status: "idle" | "busy" | "error" | "offline";
  readonly assignedTaskCount?: number;
}

export interface SchedulerOptions {
  readonly strategy: SchedulingStrategy;
  /**
   * Words to strip during keyword extraction.
   *
   * Defaults to a combined English + French functional-word set.
   * Domain vocabulary (CPF, OPCO, RNCP, CDI, CDD) is intentionally NOT in
   * the default set — those are meaningful match signals.
   */
  readonly stopWords?: Set<string>;
  /**
   * Optional synonym map: canonical term → list of synonyms.
   * Applied during keyword extraction so that 'compile' → 'build', etc.
   *
   * @example new Map([['build', ['compile', 'bundle', 'make']]])
   */
  readonly synonyms?: Map<string, string[]>;
}

export interface AssignmentResult {
  readonly taskId: string;
  readonly agentId: string;
  /** Keyword overlap score for capability-match; 0 for all other strategies. */
  readonly score: number;
  readonly reason: string;
}

// ---------------------------------------------------------------------------
// Default stop-words (English + French functional words)
// ---------------------------------------------------------------------------

const DEFAULT_STOP_WORDS: Set<string> = new Set([
  // English
  "the", "a", "an", "and", "or", "of", "in", "to", "for", "is", "it",
  "on", "at", "by", "be", "as", "with", "this", "that", "are", "from",
  // French
  "le", "la", "les", "un", "une", "et", "ou", "de", "dans", "pour",
  "est", "en", "du", "au", "aux", "sur", "par", "ce", "que", "qui",
]);

// ---------------------------------------------------------------------------
// Scheduler
// ---------------------------------------------------------------------------

/**
 * Maps pending tasks onto available agents using one of four strategies.
 *
 * The scheduler is stateless between calls except for the round-robin cursor
 * which advances across successive `autoAssign` calls.
 */
export class Scheduler {
  private readonly _strategy: SchedulingStrategy;
  private readonly _stopWords: Set<string>;
  private readonly _synonyms: Map<string, string[]>;

  /** Rolling index for round-robin distribution. */
  private _roundRobinCursor = 0;

  constructor(options: SchedulerOptions) {
    this._strategy = options.strategy;
    this._stopWords = options.stopWords ?? DEFAULT_STOP_WORDS;
    this._synonyms = options.synonyms ?? new Map();
  }

  // ---------------------------------------------------------------------------
  // Primary API
  // ---------------------------------------------------------------------------

  /**
   * Assigns all pending tasks in `queue` to healthy agents, returning one
   * AssignmentResult per assignment made.
   *
   * Only tasks with status 'pending' are considered. Agents with status
   * 'error' or 'offline' are excluded before any strategy logic runs.
   */
  autoAssign(queue: DagTaskQueue, agents: Agent[]): AssignmentResult[] {
    const healthyAgents = agents.filter(
      (a) => a.status !== "error" && a.status !== "offline",
    );

    if (healthyAgents.length === 0) return [];

    const pendingTasks = queue.getByStatus("pending");
    if (pendingTasks.length === 0) return [];

    switch (this._strategy) {
      case "round-robin":
        return this._assignRoundRobin(pendingTasks, healthyAgents);
      case "least-busy":
        return this._assignLeastBusy(pendingTasks, healthyAgents);
      case "capability-match":
        return this._assignCapabilityMatch(pendingTasks, healthyAgents);
      case "dependency-first":
        return this._assignDependencyFirst(pendingTasks, healthyAgents, queue);
    }
  }

  // ---------------------------------------------------------------------------
  // Strategy implementations
  // ---------------------------------------------------------------------------

  /**
   * Round-robin: cycles through healthy agents by index using a shared cursor.
   * Wrap-around is handled via modulo so the cursor never exceeds agent count.
   */
  private _assignRoundRobin(
    tasks: TaskDefinition[],
    agents: Agent[],
  ): AssignmentResult[] {
    const results: AssignmentResult[] = [];

    for (const task of tasks) {
      const agent = agents[this._roundRobinCursor % agents.length]!;
      this._roundRobinCursor = (this._roundRobinCursor + 1) % agents.length;

      results.push({
        taskId: task.taskId,
        agentId: agent.agentId,
        score: 0,
        reason: "round-robin",
      });
    }

    return results;
  }

  /**
   * Least-busy: selects the agent with the lowest combined assigned+running
   * task count. Ties broken alphabetically by agentId for determinism.
   *
   * The simulated load is updated per assignment within a single batch so
   * successive tasks within the same call don't all pile onto the same agent.
   */
  private _assignLeastBusy(
    tasks: TaskDefinition[],
    agents: Agent[],
  ): AssignmentResult[] {
    // Build a mutable load map seeded from assignedTaskCount.
    const load = new Map<string, number>(
      agents.map((a) => [a.agentId, a.assignedTaskCount ?? 0]),
    );

    // Sort agents alphabetically for stable tie-breaking.
    const sorted = [...agents].sort((a, b) =>
      a.agentId.localeCompare(b.agentId),
    );

    const results: AssignmentResult[] = [];

    for (const task of tasks) {
      let bestAgent = sorted[0]!;
      let bestLoad = load.get(bestAgent.agentId) ?? 0;

      for (const agent of sorted) {
        const agentLoad = load.get(agent.agentId) ?? 0;
        if (agentLoad < bestLoad) {
          bestLoad = agentLoad;
          bestAgent = agent;
        }
      }

      load.set(bestAgent.agentId, (load.get(bestAgent.agentId) ?? 0) + 1);

      results.push({
        taskId: task.taskId,
        agentId: bestAgent.agentId,
        score: 0,
        reason: "least-busy",
      });
    }

    return results;
  }

  /**
   * Capability-match: scores each (task, agent) pair by bi-directional keyword
   * overlap. The winning agent is the one with the highest combined score.
   * Falls back to the first agent alphabetically when all scores are zero.
   */
  private _assignCapabilityMatch(
    tasks: TaskDefinition[],
    agents: Agent[],
  ): AssignmentResult[] {
    // Pre-compute keyword sets per agent to avoid re-extraction per task.
    const agentKeywords = new Map<string, Set<string>>(
      agents.map((a) => [
        a.agentId,
        this._extractKeywords(a.capabilities.join(" ")),
      ]),
    );

    const sorted = [...agents].sort((a, b) =>
      a.agentId.localeCompare(b.agentId),
    );

    const results: AssignmentResult[] = [];

    for (const task of tasks) {
      const taskText = `${task.name} ${task.description}`;
      const taskKeywords = this._extractKeywords(taskText);

      let bestAgent = sorted[0]!;
      let bestScore = -1;

      for (const agent of sorted) {
        const agentKws = agentKeywords.get(agent.agentId) ?? new Set<string>();

        // Direction 1: task keywords that appear in agent capabilities text
        let score = 0;
        for (const kw of taskKeywords) {
          if (agentKws.has(kw)) score++;
        }

        // Direction 2: agent capability keywords that appear in task text
        for (const kw of agentKws) {
          if (taskKeywords.has(kw)) score++;
        }

        if (score > bestScore) {
          bestScore = score;
          bestAgent = agent;
        }
      }

      results.push({
        taskId: task.taskId,
        agentId: bestAgent.agentId,
        score: bestScore < 0 ? 0 : bestScore,
        reason: "capability-match",
      });
    }

    return results;
  }

  /**
   * Dependency-first: ranks pending tasks by their transitive blocked-dependent
   * count (BFS over the dependency graph). Tasks with more blocked downstream
   * tasks are scheduled first. Within the same criticality tier agents are
   * selected round-robin.
   */
  private _assignDependencyFirst(
    tasks: TaskDefinition[],
    agents: Agent[],
    queue: DagTaskQueue,
  ): AssignmentResult[] {
    const ranked = [...tasks].sort((a, b) => {
      const critA = this._countBlockedDependents(a, queue);
      const critB = this._countBlockedDependents(b, queue);
      return critB - critA;
    });

    const results: AssignmentResult[] = [];
    let cursor = this._roundRobinCursor;

    for (const task of ranked) {
      const agent = agents[cursor % agents.length]!;
      cursor = (cursor + 1) % agents.length;

      results.push({
        taskId: task.taskId,
        agentId: agent.agentId,
        score: 0,
        reason: "dependency-first",
      });
    }

    this._roundRobinCursor = cursor;

    return results;
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  /**
   * BFS count of transitive blocked dependents for a given task.
   *
   * Builds a reverse adjacency map (dependency → tasks that wait on it) once
   * per call, then walks forward from `task.taskId` counting unique nodes
   * reachable without revisiting. The seed task itself is not counted.
   */
  countBlockedDependents(task: TaskDefinition, queue: DagTaskQueue): number {
    return this._countBlockedDependents(task, queue);
  }

  private _countBlockedDependents(
    task: TaskDefinition,
    queue: DagTaskQueue,
  ): number {
    const allTasks = [
      ...queue.getByStatus("pending"),
      ...queue.getByStatus("blocked"),
      ...queue.getByStatus("running"),
      ...queue.getByStatus("completed"),
      ...queue.getByStatus("failed"),
      ...queue.getByStatus("skipped"),
    ];

    // Build reverse adjacency: dependencyId → set of taskIds that depend on it
    const dependents = new Map<string, string[]>();
    for (const t of allTasks) {
      for (const depId of t.dependsOn) {
        const list = dependents.get(depId) ?? [];
        list.push(t.taskId);
        dependents.set(depId, list);
      }
    }

    const visited = new Set<string>();
    const bfsQueue: string[] = [task.taskId];

    while (bfsQueue.length > 0) {
      const current = bfsQueue.shift()!;
      for (const depId of dependents.get(current) ?? []) {
        if (!visited.has(depId)) {
          visited.add(depId);
          bfsQueue.push(depId);
        }
      }
    }

    // Do not count the seed task itself.
    visited.delete(task.taskId);
    return visited.size;
  }

  /**
   * Tokenises `text` into a set of meaningful lowercase keywords.
   *
   * Steps:
   * 1. Lowercase and split on non-word characters.
   * 2. Drop tokens in the stop-words set.
   * 3. Apply synonym expansion: if a token matches a synonym for a canonical
   *    term, replace it with the canonical term.
   * 4. Return the deduplicated set.
   */
  extractKeywords(text: string): Set<string> {
    return this._extractKeywords(text);
  }

  private _extractKeywords(text: string): Set<string> {
    const tokens = text.toLowerCase().split(/\W+/).filter(Boolean);

    // Build reverse synonym lookup: synonym → canonical
    const reverseMap = new Map<string, string>();
    for (const [canonical, synonymList] of this._synonyms) {
      for (const syn of synonymList) {
        reverseMap.set(syn.toLowerCase(), canonical.toLowerCase());
      }
    }

    const result = new Set<string>();
    for (const token of tokens) {
      if (this._stopWords.has(token)) continue;
      // Expand synonym: if token is a known synonym, store canonical form
      const canonical = reverseMap.get(token);
      result.add(canonical ?? token);
    }

    return result;
  }
}
