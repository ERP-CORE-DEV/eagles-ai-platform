import { describe, it, expect, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createOrchestratorServer } from "../src/server.js";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "orch-integration-test-"));
}

async function makeClient(dbDir: string): Promise<Client> {
  const server = createOrchestratorServer(dbDir);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "integration-test", version: "1.0.0" });
  await client.connect(clientTransport);
  return client;
}

function parseResult(result: Awaited<ReturnType<Client["callTool"]>>): unknown {
  const content = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content[0].text);
}

describe("orchestrator-mcp integration", () => {
  let client: Client;

  beforeEach(async () => {
    const dbDir = makeTempDir();
    client = await makeClient(dbDir);
  });

  it("should list all 19 tools", async () => {
    const result = await client.listTools();
    const toolNames = result.tools.map((t) => t.name);

    expect(toolNames).toContain("agent_register");
    expect(toolNames).toContain("agent_discover");
    expect(toolNames).toContain("agent_status");
    expect(toolNames).toContain("agent_heartbeat");
    expect(toolNames).toContain("task_create");
    expect(toolNames).toContain("task_assign");
    expect(toolNames).toContain("task_status");
    expect(toolNames).toContain("task_results");
    expect(toolNames).toContain("task_complete");
    expect(toolNames).toContain("learn_pattern");
    expect(toolNames).toContain("learn_suggest");
    expect(toolNames).toContain("agent_message_send");
    expect(toolNames).toContain("agent_messages_get");
    expect(toolNames).toContain("task_build_decomposition_prompt");
    expect(toolNames).toContain("task_apply_decomposition");
    expect(toolNames).toContain("mission_start");
    expect(toolNames).toContain("session_search");
    expect(toolNames).toContain("session_extract");
    expect(toolNames).toContain("mission_execute");
    expect(toolNames).toHaveLength(19);
  });

  it("agent lifecycle: register → heartbeat → discover", async () => {
    // Register agent
    const regResult = await client.callTool({
      name: "agent_register",
      arguments: {
        agentId: "agent-reviewer-1",
        name: "code-reviewer",
        capabilities: ["review", "security"],
        tags: ["quality"],
      },
    });
    const regData = parseResult(regResult) as { agentId: string; status: string; name: string };
    expect(regData.agentId).toBe("agent-reviewer-1");
    expect(regData.status).toBe("idle");
    expect(regData.name).toBe("code-reviewer");

    // Heartbeat
    const hbResult = await client.callTool({
      name: "agent_heartbeat",
      arguments: { agentId: "agent-reviewer-1" },
    });
    const hbData = parseResult(hbResult) as { acknowledged: boolean };
    expect(hbData.acknowledged).toBe(true);

    // Discover agents
    const discoverResult = await client.callTool({
      name: "agent_discover",
      arguments: {},
    });
    const discoverData = parseResult(discoverResult) as { agents: Array<{ name: string }>; total: number };
    expect(discoverData.total).toBeGreaterThanOrEqual(1);
    expect(discoverData.agents.some((a) => a.name === "code-reviewer")).toBe(true);
  });

  it("task workflow: create → check status → assign (auto)", async () => {
    // Register an agent first
    await client.callTool({
      name: "agent_register",
      arguments: {
        agentId: "agent-build-1",
        name: "builder",
        capabilities: ["build", "deploy"],
        tags: [],
      },
    });

    // Create task
    const taskResult = await client.callTool({
      name: "task_create",
      arguments: {
        name: "Build project",
        description: "Build all packages in order",
        requiredCapabilities: ["build"],
      },
    });
    const taskData = parseResult(taskResult) as { taskId: string; status: string };
    expect(taskData.taskId).toBeDefined();
    expect(taskData.status).toBe("pending");

    // Check status
    const statusResult = await client.callTool({
      name: "task_status",
      arguments: { taskId: taskData.taskId },
    });
    const statusData = parseResult(statusResult) as { status: string; name: string };
    expect(statusData.status).toBe("pending");
    expect(statusData.name).toBe("Build project");

    // Auto-assign (finds best agent)
    const assignResult = await client.callTool({
      name: "task_assign",
      arguments: { taskId: taskData.taskId },
    });
    const assignData = parseResult(assignResult) as { status: string; assignedAgent: string };
    expect(assignData.status).toBe("assigned");
    expect(assignData.assignedAgent).toBe("agent-build-1");
  });

  it("task_complete: closes write-loop and releases assigned agent", async () => {
    await client.callTool({
      name: "agent_register",
      arguments: {
        agentId: "agent-complete-1",
        name: "completer",
        capabilities: ["build"],
        tags: [],
      },
    });

    const created = parseResult(
      await client.callTool({
        name: "task_create",
        arguments: {
          name: "Run migration",
          description: "Apply schema v42",
          requiredCapabilities: ["build"],
        },
      }),
    ) as { taskId: string };

    await client.callTool({
      name: "task_assign",
      arguments: { taskId: created.taskId },
    });

    const completed = parseResult(
      await client.callTool({
        name: "task_complete",
        arguments: { taskId: created.taskId, result: "42 rows migrated" },
      }),
    ) as {
      taskId: string;
      status: string;
      result: string;
      completedAt: string;
      releasedAgent: string;
    };

    expect(completed.taskId).toBe(created.taskId);
    expect(completed.status).toBe("completed");
    expect(completed.result).toBe("42 rows migrated");
    expect(completed.completedAt).toBeTruthy();
    expect(completed.releasedAgent).toBe("agent-complete-1");

    const status = parseResult(
      await client.callTool({
        name: "task_status",
        arguments: { taskId: created.taskId },
      }),
    ) as { status: string };
    expect(status.status).toBe("completed");

    const discover = parseResult(
      await client.callTool({
        name: "agent_discover",
        arguments: {},
      }),
    ) as { agents: Array<{ agentId: string; status: string }> };
    const releasedAgent = discover.agents.find((a) => a.agentId === "agent-complete-1");
    expect(releasedAgent?.status).toBe("idle");

    const doubleComplete = parseResult(
      await client.callTool({
        name: "task_complete",
        arguments: { taskId: created.taskId },
      }),
    ) as { error?: string };
    expect(doubleComplete.error).toBe("Task already completed");

    const missing = parseResult(
      await client.callTool({
        name: "task_complete",
        arguments: { taskId: "does-not-exist" },
      }),
    ) as { error?: string };
    expect(missing.error).toBe("Task not found: does-not-exist");
  });

  it("SQLite persistence: data survives across server reconnections", async () => {
    const dbDir = makeTempDir();

    // First connection — register agent + create task
    const client1 = await makeClient(dbDir);
    await client1.callTool({
      name: "agent_register",
      arguments: { agentId: "persist-agent-1", name: "persistent-agent", capabilities: ["build"], tags: [] },
    });
    await client1.callTool({
      name: "task_create",
      arguments: { name: "Persistent task", description: "Should survive restart" },
    });

    // Second connection — same dbDir
    const client2 = await makeClient(dbDir);
    const discoverResult = await client2.callTool({
      name: "agent_discover",
      arguments: {},
    });
    const discoverData = parseResult(discoverResult) as { agents: Array<{ name: string }>; total: number };
    expect(discoverData.total).toBeGreaterThanOrEqual(1);
    expect(discoverData.agents.some((a) => a.name === "persistent-agent")).toBe(true);
  });

  it("SONA learning: store patterns → suggest by tags", async () => {
    await client.callTool({
      name: "learn_pattern",
      arguments: {
        name: "Use IOptions<T>",
        description: "Bind config via IOptions<T> instead of direct env reads",
        tags: ["dotnet", "config"],
      },
    });

    await client.callTool({
      name: "learn_pattern",
      arguments: {
        name: "Constructor injection",
        description: "Use constructor injection only",
        tags: ["dotnet", "di"],
      },
    });

    const suggestResult = await client.callTool({
      name: "learn_suggest",
      arguments: { tags: ["dotnet"] },
    });
    const suggestData = parseResult(suggestResult) as { patterns: unknown[]; total: number };

    expect(suggestData.total).toBeGreaterThanOrEqual(2);
  });

  it("agent_discover filters by capability", async () => {
    await client.callTool({
      name: "agent_register",
      arguments: { agentId: "a1", name: "reviewer", capabilities: ["review"], tags: [] },
    });
    await client.callTool({
      name: "agent_register",
      arguments: { agentId: "a2", name: "builder", capabilities: ["build"], tags: [] },
    });

    const reviewAgents = await client.callTool({
      name: "agent_discover",
      arguments: { capability: "review" },
    });
    const reviewData = parseResult(reviewAgents) as { agents: Array<{ name: string }>; total: number };

    expect(reviewData.total).toBe(1);
    expect(reviewData.agents[0].name).toBe("reviewer");
  });
});
