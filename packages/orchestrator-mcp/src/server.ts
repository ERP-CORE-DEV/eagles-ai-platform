import { join } from "node:path";
import { existsSync, createReadStream } from "node:fs";
import { createInterface } from "node:readline";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { AgentRegistryStore } from "@eagles-ai-platform/data-layer";
import { TaskStore } from "@eagles-ai-platform/data-layer";
import { SonaLearningStore } from "@eagles-ai-platform/data-layer";
import { EventBus } from "@eagles-ai-platform/data-layer";
import { SessionIndexStore } from "@eagles-ai-platform/data-layer";
import { computeHealth } from "./agents/lifecycle.js";
import { findBestAgent } from "./tasks/coordination.js";
import { MessageBus } from "./messaging/MessageBus.js";
import {
  buildCoordinatorSystemPrompt,
  buildUserPrompt,
  applyDecomposition,
} from "./tasks/Decomposer.js";
import type { AgentInfo } from "./agents/types.js";
import type { TaskDefinition } from "./tasks/types.js";
import { missionStart } from "./mission/mission-start.js";
import { Team } from "./teams/Team.js";
import { executeQueue } from "./teams/executeQueue.js";
import { Scheduler } from "./tasks/Scheduler.js";

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  SUPPLIER: ["qonto", "alan", "payfit", "anthropic", "ovh", "bouygues"],
  MATCHING: ["match", "rapprochement", "reconciliation", "score"],
  AUTH: ["login", "session", "cdp", "cookie", "totp", "auth"],
  SCRAPING: ["download", "invoice", "portal", "scraper", "pdf"],
  BUG: ["ko", "broken", "fix", "error", "bug", "failed"],
  TAXONOMY: ["supplier", "employee", "salary", "ceo", "classify"],
  WORKFLOW: ["import", "export", "process", "workflow", "pipeline"],
};

function categorizeText(text: string): string | undefined {
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) {
      return category;
    }
  }
  return undefined;
}

interface ClaudeSessionLine {
  type?: string;
  message?: {
    role?: string;
    content?: Array<{ type?: string; text?: string }> | string;
  };
}

async function readClaudeSessionJsonl(
  filePath: string,
  maxMessages: number,
): Promise<Array<{ role: string; text: string }>> {
  const results: Array<{ role: string; text: string }> = [];

  const stream = createReadStream(filePath, { encoding: "utf8" });
  const rl = createInterface({ input: stream, crlfDelay: Infinity });

  for await (const line of rl) {
    if (results.length >= maxMessages) break;
    const trimmed = line.trim();
    if (trimmed.length === 0) continue;
    try {
      const parsed = JSON.parse(trimmed) as ClaudeSessionLine;
      const message = parsed.message;
      if (message === undefined || typeof message.role !== "string") continue;

      let text = "";
      if (Array.isArray(message.content)) {
        text = message.content
          .filter((block) => block.type === "text" && typeof block.text === "string")
          .map((block) => block.text as string)
          .join(" ");
      } else if (typeof message.content === "string") {
        text = message.content;
      }

      if (text.length > 0) {
        results.push({ role: message.role, text });
      }
    } catch {
      // skip malformed lines
    }
  }

  return results;
}

export function createOrchestratorServer(dbDir?: string): McpServer {
  const dir = dbDir ?? process.env["EAGLES_DATA_ROOT"] ?? join(process.cwd(), ".eagles-data");
  const registry = new AgentRegistryStore(join(dir, "agents.sqlite"));
  const engine = new TaskStore(join(dir, "tasks.sqlite"));
  const sona = new SonaLearningStore(join(dir, "learning.sqlite"));
  const messagingEventBus = new EventBus(join(dir, "messaging.sqlite"));
  const messageBus = new MessageBus(messagingEventBus);
  const server = new McpServer({ name: "orchestrator-mcp", version: "0.1.0" });

  // -------------------------------------------------------------------------
  // agent_register
  // -------------------------------------------------------------------------
  server.tool(
    "agent_register",
    {
      agentId: z.string(),
      name: z.string(),
      capabilities: z.array(z.string()),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.unknown()).optional(),
    },
    async (params) => {
      const agent = registry.register({
        agentId: params.agentId,
        name: params.name,
        capabilities: params.capabilities,
        tags: params.tags ?? [],
        metadata: params.metadata ?? {},
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            agentId: agent.agentId,
            name: agent.name,
            capabilities: agent.capabilities,
            tags: agent.tags,
            status: agent.status,
            registeredAt: agent.registeredAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // agent_discover
  // -------------------------------------------------------------------------
  server.tool(
    "agent_discover",
    {
      capability: z.string().optional(),
      tag: z.string().optional(),
      status: z.enum(["idle", "busy", "offline"]).optional(),
    },
    async (params) => {
      let agents = registry.list();

      if (params.capability !== undefined) {
        agents = registry.findByCapability(params.capability);
      } else if (params.tag !== undefined) {
        agents = registry.findByTag(params.tag);
      }

      if (params.status !== undefined) {
        agents = agents.filter((a) => a.status === params.status);
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            agents: agents.map((a) => ({
              agentId: a.agentId,
              name: a.name,
              capabilities: a.capabilities,
              tags: a.tags,
              status: a.status,
              lastHeartbeat: a.lastHeartbeat,
            })),
            total: agents.length,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // agent_status
  // -------------------------------------------------------------------------
  server.tool(
    "agent_status",
    {
      agentId: z.string(),
    },
    async (params) => {
      const agent = registry.get(params.agentId);

      if (agent === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `Agent not found: ${params.agentId}` }),
          }],
        };
      }

      const health = computeHealth(agent as AgentInfo);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            agentId: health.agentId,
            status: health.status,
            isStale: health.isStale,
            lastHeartbeat: health.lastHeartbeat,
            uptime: health.uptime,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // agent_heartbeat
  // -------------------------------------------------------------------------
  server.tool(
    "agent_heartbeat",
    {
      agentId: z.string(),
    },
    async (params) => {
      registry.recordHeartbeat(params.agentId);

      const agent = registry.get(params.agentId);
      if (agent === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `Agent not found: ${params.agentId}` }),
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            agentId: agent.agentId,
            lastHeartbeat: agent.lastHeartbeat,
            acknowledged: true,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // task_create
  // -------------------------------------------------------------------------
  server.tool(
    "task_create",
    {
      name: z.string(),
      description: z.string(),
      dependsOn: z.array(z.string()).optional(),
      requiredCapabilities: z.array(z.string()).optional(),
      priority: z.enum(["urgent", "high", "normal", "low"]).optional(),
    },
    async (params) => {
      const task = engine.create({
        name: params.name,
        description: params.description,
        dependsOn: params.dependsOn,
        requiredCapabilities: params.requiredCapabilities,
        priority: params.priority,
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            taskId: task.taskId,
            name: task.name,
            status: task.status,
            priority: task.priority,
            dependsOn: task.dependsOn,
            requiredCapabilities: task.requiredCapabilities,
            createdAt: task.createdAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // task_assign
  // -------------------------------------------------------------------------
  server.tool(
    "task_assign",
    {
      taskId: z.string(),
    },
    async (params) => {
      const task = engine.get(params.taskId);

      if (task === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `Task not found: ${params.taskId}` }),
          }],
        };
      }

      const bestAgent = findBestAgent(task as TaskDefinition, registry.list() as unknown as AgentInfo[]);

      if (bestAgent === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({
              error: "No suitable idle agent found for task",
              taskId: params.taskId,
              requiredCapabilities: task.requiredCapabilities,
            }),
          }],
        };
      }

      const assigned = engine.assign(params.taskId, bestAgent.agentId);
      registry.updateStatus(bestAgent.agentId, "busy");

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            taskId: assigned.taskId,
            status: assigned.status,
            assignedAgent: assigned.assignedAgent,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // task_status
  // -------------------------------------------------------------------------
  server.tool(
    "task_status",
    {
      taskId: z.string(),
    },
    async (params) => {
      const task = engine.get(params.taskId);

      if (task === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `Task not found: ${params.taskId}` }),
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            taskId: task.taskId,
            name: task.name,
            status: task.status,
            priority: task.priority,
            assignedAgent: task.assignedAgent,
            createdAt: task.createdAt,
            completedAt: task.completedAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // task_results
  // -------------------------------------------------------------------------
  server.tool(
    "task_results",
    {
      taskId: z.string(),
    },
    async (params) => {
      const task = engine.get(params.taskId);

      if (task === null) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `Task not found: ${params.taskId}` }),
          }],
        };
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            taskId: task.taskId,
            status: task.status,
            result: task.result,
            completedAt: task.completedAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // learn_pattern
  // -------------------------------------------------------------------------
  server.tool(
    "learn_pattern",
    {
      name: z.string(),
      description: z.string(),
      tags: z.array(z.string()).optional(),
    },
    async (params) => {
      const pattern = sona.store({
        name: params.name,
        description: params.description,
        tags: params.tags,
      });

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            patternId: pattern.patternId,
            name: pattern.name,
            successRate: pattern.successRate,
            totalAttempts: pattern.totalAttempts,
            tags: pattern.tags,
            archived: pattern.archived,
            createdAt: pattern.createdAt,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // learn_suggest
  // -------------------------------------------------------------------------
  server.tool(
    "learn_suggest",
    {
      tags: z.array(z.string()).optional(),
      limit: z.number().int().positive().optional(),
    },
    async (params) => {
      const patterns = sona.suggest(params.tags, params.limit);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            patterns: patterns.map((p) => ({
              patternId: p.patternId,
              name: p.name,
              description: p.description,
              successRate: p.successRate,
              totalAttempts: p.totalAttempts,
              tags: p.tags,
            })),
            total: patterns.length,
          }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // agent_message_send
  // -------------------------------------------------------------------------
  server.tool(
    "agent_message_send",
    {
      from: z.string(),
      to: z.string(),
      content: z.string(),
      metadata: z.record(z.unknown()).optional(),
    },
    async (params) => {
      const message = messageBus.send(
        params.from,
        params.to,
        params.content,
        params.metadata ?? {},
      );

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ messageId: message.id }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // agent_messages_get
  // -------------------------------------------------------------------------
  server.tool(
    "agent_messages_get",
    {
      agentName: z.string(),
      unreadOnly: z.boolean().optional(),
      since: z.string().optional(),
    },
    async (params) => {
      let messages;

      if (params.since !== undefined) {
        messages = messageBus.getSince(params.agentName, params.since);
        if (params.unreadOnly === true) {
          const unreadIds = new Set(
            messageBus.getUnread(params.agentName).map((m) => m.id),
          );
          messages = messages.filter((m) => unreadIds.has(m.id));
        }
      } else if (params.unreadOnly === true) {
        messages = messageBus.getUnread(params.agentName);
      } else {
        messages = messageBus.getAll(params.agentName);
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ messages }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // task_build_decomposition_prompt
  // -------------------------------------------------------------------------
  server.tool(
    "task_build_decomposition_prompt",
    {
      goal: z.string(),
      agentRoster: z.array(
        z.object({
          agentId: z.string(),
          name: z.string(),
          capabilities: z.array(z.string()),
          systemPrompt: z.string().optional(),
        }),
      ),
      maxTasks: z.number().int().positive().optional(),
    },
    async (params) => {
      const systemPrompt = buildCoordinatorSystemPrompt({
        goal: params.goal,
        agentRoster: params.agentRoster,
        maxTasks: params.maxTasks,
      });
      const userPrompt = buildUserPrompt(params.goal);

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ systemPrompt, userPrompt }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // task_apply_decomposition
  // -------------------------------------------------------------------------
  server.tool(
    "task_apply_decomposition",
    {
      decompositionJson: z.string(),
      agentRoster: z.array(
        z.object({
          agentId: z.string(),
          name: z.string(),
          capabilities: z.array(z.string()),
          systemPrompt: z.string().optional(),
        }),
      ),
      goal: z.string(),
      maxTasks: z.number().int().positive().optional(),
    },
    async (params) => {
      const result = applyDecomposition(params.decompositionJson, {
        goal: params.goal,
        agentRoster: params.agentRoster,
        maxTasks: params.maxTasks,
      });

      const createdTaskIds: string[] = [];
      for (const spec of result.tasks) {
        const task = engine.create({
          name: spec.title,
          description: spec.description,
          priority: spec.priority === "high" || spec.priority === "low"
            ? spec.priority
            : "normal",
        });
        createdTaskIds.push(task.taskId);
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ createdTaskIds, warnings: result.warnings }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // mission_start
  // -------------------------------------------------------------------------
  server.tool(
    "mission_start",
    {
      input: z.string().describe("Natural language goal with optional /skills and --flags"),
      cwd: z.string().optional().describe("Current working directory for project detection"),
    },
    async (params) => {
      const result = await missionStart(params.input, { cwd: params.cwd });
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify(result, null, 2),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // session_search
  // -------------------------------------------------------------------------
  server.tool(
    "session_search",
    {
      project: z.string().optional().describe("Filter by project name"),
      keyword: z.string().optional().describe("Search in keywords, suppliers_mentioned, or summary"),
      dateFrom: z.string().optional().describe("ISO date start (inclusive)"),
      dateTo: z.string().optional().describe("ISO date end (inclusive)"),
      limit: z.number().int().positive().optional().default(20).describe("Max results"),
    },
    async (params) => {
      const dbPath = join(dir, "session-index.sqlite");

      if (!existsSync(dbPath)) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ sessions: [], total: 0 }),
          }],
        };
      }

      const store = new SessionIndexStore(dbPath);
      try {
        const entries = store.search({
          project: params.project,
          keyword: params.keyword,
          dateFrom: params.dateFrom,
          dateTo: params.dateTo,
          limit: params.limit,
        });

        const sessions = entries.map((e) => ({
          session_id: e.sessionId,
          project_name: e.projectName,
          session_date: e.sessionDate,
          message_count: e.messageCount,
          keywords: e.keywords,
          summary: e.summary,
        }));

        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ sessions, total: sessions.length }),
          }],
        };
      } finally {
        store.close();
      }
    },
  );

  // -------------------------------------------------------------------------
  // session_extract
  // -------------------------------------------------------------------------
  server.tool(
    "session_extract",
    {
      sessionId: z.string().describe("Session ID to extract messages from"),
      role: z.string().optional().default("user").describe("Message role filter: user, assistant, or all"),
      categories: z.array(z.string()).optional().describe("Category filter: SUPPLIER, BUG, AUTH, etc."),
      maxMessages: z.number().int().positive().optional().default(50).describe("Max messages to return"),
    },
    async (params) => {
      const dbPath = join(dir, "session-index.sqlite");

      if (!existsSync(dbPath)) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `Session index not found at ${dbPath}` }),
          }],
        };
      }

      const store = new SessionIndexStore(dbPath);
      let filePath: string | undefined;

      try {
        // Look up the session entry to get file_path
        const allEntries = store.search({ limit: 9999 });
        const entry = allEntries.find((e) => e.sessionId === params.sessionId);

        if (entry === undefined) {
          return {
            content: [{
              type: "text" as const,
              text: JSON.stringify({ error: `Session not found: ${params.sessionId}` }),
            }],
          };
        }

        filePath = entry.filePath;
      } finally {
        store.close();
      }

      if (!existsSync(filePath)) {
        return {
          content: [{
            type: "text" as const,
            text: JSON.stringify({ error: `Session file not found on disk: ${filePath}` }),
          }],
        };
      }

      const rawMessages = await readClaudeSessionJsonl(filePath, params.maxMessages * 3);

      const targetRole = params.role === "all" ? undefined : (params.role ?? "user");
      const targetCategories = params.categories !== undefined && params.categories.length > 0
        ? new Set(params.categories)
        : undefined;

      const filtered: Array<{ date: string; role: string; category: string | undefined; text: string }> = [];

      for (const msg of rawMessages) {
        if (filtered.length >= params.maxMessages) break;

        if (targetRole !== undefined && msg.role !== targetRole) continue;

        const category = categorizeText(msg.text);

        if (targetCategories !== undefined) {
          if (category === undefined || !targetCategories.has(category)) continue;
        }

        filtered.push({
          date: new Date().toISOString(),
          role: msg.role,
          category,
          text: msg.text.slice(0, 500),
        });
      }

      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({ messages: filtered, total: filtered.length }),
        }],
      };
    },
  );

  // -------------------------------------------------------------------------
  // mission_execute
  // -------------------------------------------------------------------------
  server.tool(
    "mission_execute",
    {
      goal: z.string().describe("Mission goal"),
      teamConfig: z.object({
        agents: z.array(z.object({
          name: z.string(),
          role: z.string(),
          capabilities: z.array(z.string()),
        })),
        maxConcurrency: z.number().optional(),
        maxRounds: z.number().optional(),
      }).describe("Team configuration"),
      context: z.string().optional().describe("Additional context to inject"),
    },
    async ({ goal, teamConfig, context }) => {
      // 1. Build agent roster with synthetic agentIds.
      const agents = teamConfig.agents.map((a, idx) => ({
        agentId: `agent-${idx}-${a.name.replace(/\s+/g, "-")}`,
        name: a.name,
        role: a.role as "architect" | "engineer" | "reviewer" | "tester" | "analyst",
        capabilities: a.capabilities,
      }));

      // 2. Create Team.
      const team = new Team(
        {
          name: "mission",
          agents,
          maxConcurrency: teamConfig.maxConcurrency,
          maxRounds: teamConfig.maxRounds,
        },
        dir,
      );

      // 3. Decompose goal into TaskSpecs using Decomposer helpers.
      const rosterForDecomposer = agents.map((a) => ({
        agentId: a.agentId,
        name: a.name,
        capabilities: a.capabilities,
      }));

      const decompositionJson = JSON.stringify(
        agents.map((a) => ({
          title: `${goal} — ${a.role} phase`,
          description: `${a.role} work for: ${goal}`,
          assignee: a.name,
          dependsOn: [],
          priority: "normal",
        })),
      );

      const decomposed = applyDecomposition(decompositionJson, {
        goal,
        agentRoster: rosterForDecomposer,
        maxTasks: teamConfig.maxRounds ?? 20,
      });

      // 4. Load tasks into the team queue.
      for (const spec of decomposed.tasks) {
        team.addTask({
          name: spec.title,
          description: spec.description,
          priority: spec.priority ?? "normal",
          dependsOn: [],
        });
      }

      // 5. Run executeQueue with a capability-match scheduler.
      const scheduler = new Scheduler({ strategy: "capability-match" });
      const results = await executeQueue({
        team,
        scheduler,
        maxRounds: teamConfig.maxRounds ?? team.maxRounds,
        sharedContext: context,
      });

      // 6. Return results.
      return {
        content: [{
          type: "text" as const,
          text: JSON.stringify({
            goal,
            taskCount: decomposed.tasks.length,
            warnings: decomposed.warnings,
            dispatches: results.map((r) => ({
              taskId: r.taskId,
              agentName: r.agentName,
              success: r.success,
              promptLength: r.output.length,
              error: r.error,
            })),
          }, null, 2),
        }],
      };
    },
  );

  return server;
}
