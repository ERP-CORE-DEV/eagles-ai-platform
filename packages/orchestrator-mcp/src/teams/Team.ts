/**
 * @fileoverview Team assembly — owns agent roster, DagTaskQueue, MessageBus, and Semaphore.
 *
 * Ported and adapted from open-multi-agent (JackChen-me/open-multi-agent) with
 * EAGLES-specific adaptations:
 * - DagTaskQueue backed by SQLite checkpoints (not in-memory only)
 * - MessageBus backed by EAGLES SQLite EventBus
 * - Semaphore imported from @eagles-ai-platform/shared-utils
 * - TeamAgent role vocabulary aligned to EAGLES agent registry conventions
 */

import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { randomUUID } from "node:crypto";
import { EventBus } from "@eagles-ai-platform/data-layer";
import { Semaphore } from "@eagles-ai-platform/shared-utils";
import { DagTaskQueue } from "../tasks/DagTaskQueue.js";
import { MessageBus } from "../messaging/MessageBus.js";
import type { TaskDefinition, TaskPriority } from "../tasks/types.js";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export type AgentRole =
  | "architect"
  | "engineer"
  | "reviewer"
  | "tester"
  | "analyst";

export interface TeamAgent {
  readonly agentId: string;
  readonly name: string;
  readonly role: AgentRole;
  readonly capabilities: readonly string[];
  readonly systemPrompt?: string;
}

export interface TeamConfig {
  readonly name: string;
  readonly agents: TeamAgent[];
  /** Maximum number of tasks dispatched concurrently. Defaults to 3. */
  readonly maxConcurrency?: number;
  /** Maximum scheduling rounds before the stuck-detection guard fires. Defaults to 20. */
  readonly maxRounds?: number;
  /** Token budget for the whole team run. Defaults to 100 000. */
  readonly tokenBudget?: number;
}

/** Minimal input shape for adding a task to the team queue. */
export interface TaskInput {
  readonly name: string;
  readonly description: string;
  readonly dependsOn?: readonly string[];
  readonly requiredCapabilities?: readonly string[];
  readonly priority?: TaskPriority;
}

// ---------------------------------------------------------------------------
// Team
// ---------------------------------------------------------------------------

const DEFAULT_MAX_CONCURRENCY = 3;
const DEFAULT_MAX_ROUNDS = 20;
const DEFAULT_TOKEN_BUDGET = 100_000;

/**
 * Assembles a named multi-agent team around a shared DagTaskQueue,
 * MessageBus, and Semaphore.
 *
 * @example
 * ```ts
 * const team = new Team({
 *   name: "audit",
 *   agents: [
 *     { agentId: "a1", name: "architect", role: "architect", capabilities: ["design"] },
 *     { agentId: "a2", name: "engineer",  role: "engineer",  capabilities: ["code"] },
 *   ],
 * }, tmpDir);
 *
 * const taskId = team.addTask({ name: "Design schema", description: "..." });
 * ```
 */
export class Team {
  readonly name: string;
  readonly agents: readonly TeamAgent[];
  readonly queue: DagTaskQueue;
  readonly messageBus: MessageBus;
  readonly semaphore: Semaphore;
  readonly maxRounds: number;
  readonly tokenBudget: number;

  constructor(config: TeamConfig, dbDir?: string) {
    this.name = config.name;
    this.agents = config.agents;
    this.maxRounds = config.maxRounds ?? DEFAULT_MAX_ROUNDS;
    this.tokenBudget = config.tokenBudget ?? DEFAULT_TOKEN_BUDGET;
    this.semaphore = new Semaphore(config.maxConcurrency ?? DEFAULT_MAX_CONCURRENCY);

    const resolvedDir = dbDir ?? mkdtempSync(join(tmpdir(), "team-"));

    // DagTaskQueue starts empty — tasks are added via addTask().
    this.queue = new DagTaskQueue([], {
      maxRounds: this.maxRounds,
      dbPath: join(resolvedDir, `team-${this.name}.sqlite`),
    });

    const eventBus = new EventBus(join(resolvedDir, `team-${this.name}-messaging.sqlite`));
    this.messageBus = new MessageBus(eventBus);
  }

  // ---------------------------------------------------------------------------
  // Task management
  // ---------------------------------------------------------------------------

  /**
   * Adds a task to the internal DagTaskQueue and returns its generated taskId.
   */
  addTask(input: TaskInput): string {
    const taskId = randomUUID();
    const task: TaskDefinition = {
      taskId,
      name: input.name,
      description: input.description,
      dependsOn: input.dependsOn ? [...input.dependsOn] : [],
      requiredCapabilities: input.requiredCapabilities ? [...input.requiredCapabilities] : [],
      priority: input.priority ?? "normal",
      status: "pending",
      assignedAgent: null,
      result: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    this.queue.add(task);
    return taskId;
  }

  // ---------------------------------------------------------------------------
  // Agent queries
  // ---------------------------------------------------------------------------

  /** Returns the agent with the given name, or `undefined` if not found. */
  getAgent(name: string): TeamAgent | undefined {
    return this.agents.find((a) => a.name === name);
  }

  /** Returns all agents whose `role` matches the given value. */
  getAgentsByRole(role: AgentRole): TeamAgent[] {
    return this.agents.filter((a) => a.role === role);
  }
}
