import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createVerificationServer } from "../src/server.js";

function makeTempDb(): { dbPath: string; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "verify-server-test-"));
  const dbPath = join(dir, "test.sqlite");
  return {
    dbPath,
    // Skip rmSync on Windows — SQLite WAL/SHM files stay locked; OS cleans temp on reboot
    cleanup: () => {},
  };
}

async function makeClient(dbPath: string): Promise<Client> {
  const server = createVerificationServer(dbPath);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "test-client", version: "1.0.0" });
  await client.connect(clientTransport);
  return client;
}

function parseToolResult(result: Awaited<ReturnType<Client["callTool"]>>): unknown {
  const content = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content[0].text);
}

describe("verification-mcp server", () => {
  let client: Client;
  let cleanup: () => void;

  beforeEach(async () => {
    const temp = makeTempDb();
    cleanup = temp.cleanup;
    client = await makeClient(temp.dbPath);
  });

  afterEach(() => {
    cleanup();
  });

  it("should list all 12 tools", async () => {
    const result = await client.listTools();
    const toolNames = result.tools.map((t) => t.name);

    expect(toolNames).toContain("verify_output");
    expect(toolNames).toContain("verify_score_agent");
    expect(toolNames).toContain("verify_checkpoint_create");
    expect(toolNames).toContain("verify_checkpoint_list");
    expect(toolNames).toContain("verify_checkpoint_restore");
    expect(toolNames).toContain("verify_rollback");
    expect(toolNames).toContain("verify_pipeline_run");
    expect(toolNames).toContain("verify_history");
    expect(toolNames).toContain("verify_checkpoint_findings");
    expect(toolNames).toContain("verify_receipt_write");
    expect(toolNames).toContain("verify_receipt_list");
    expect(toolNames).toContain("verify_receipt_chain");
    expect(toolNames).toHaveLength(12);
  });

  it("verify_output_returnsAssessmentWithConfidenceAndSuggestedAction", async () => {
    const result = await client.callTool({
      name: "verify_output",
      arguments: {
        sessionId: "test-session",
        output: "This is a well-formed output from the agent that exceeds minimum length.",
      },
    });

    const data = parseToolResult(result) as {
      sessionId: string;
      confidence: number;
      flags: string[];
      suggestedAction: string;
    };

    expect(data.sessionId).toBe("test-session");
    expect(data.confidence).toBeGreaterThanOrEqual(0);
    expect(data.confidence).toBeLessThanOrEqual(1);
    expect(["accept", "review", "reject"]).toContain(data.suggestedAction);
    expect(Array.isArray(data.flags)).toBe(true);
  });

  it("verify_checkpoint_create_andRestore_roundtripsState", async () => {
    const createResult = await client.callTool({
      name: "verify_checkpoint_create",
      arguments: {
        sessionId: "cp-session",
        name: "wave-1",
        stateJson: '{"files": ["a.ts", "b.ts"]}',
        agentScore: 0.88,
      },
    });

    const createData = parseToolResult(createResult) as {
      checkpointId: string;
      sessionId: string;
      name: string;
      verified: boolean;
    };

    expect(createData.sessionId).toBe("cp-session");
    expect(createData.name).toBe("wave-1");
    expect(createData.verified).toBe(false);
    expect(createData.checkpointId).toBeDefined();

    const restoreResult = await client.callTool({
      name: "verify_checkpoint_restore",
      arguments: { checkpointId: createData.checkpointId },
    });

    const restoreData = parseToolResult(restoreResult) as {
      checkpointId: string;
      stateJson: string;
      agentScore: number;
    };

    expect(restoreData.checkpointId).toBe(createData.checkpointId);
    expect(restoreData.stateJson).toBe('{"files": ["a.ts", "b.ts"]}');
    expect(restoreData.agentScore).toBe(0.88);
  });

  it("verify_score_agent_returnsAgentScoreWithRiskLevel", async () => {
    const now = new Date().toISOString();

    const result = await client.callTool({
      name: "verify_score_agent",
      arguments: {
        sessionId: "score-session",
        agentId: "agent-alpha",
        observations: [
          { dimension: "accuracy", value: 0.9, timestamp: now },
          { dimension: "reliability", value: 0.85, timestamp: now },
          { dimension: "consistency", value: 0.88, timestamp: now },
          { dimension: "efficiency", value: 0.82, timestamp: now },
          { dimension: "adaptability", value: 0.80, timestamp: now },
        ],
      },
    });

    const data = parseToolResult(result) as {
      sessionId: string;
      agentId: string;
      composite: number;
      riskLevel: string;
    };

    expect(data.sessionId).toBe("score-session");
    expect(data.agentId).toBe("agent-alpha");
    expect(data.composite).toBeGreaterThan(0);
    expect(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).toContain(data.riskLevel);
  });

  it("verify_history_returnsVerificationRecords", async () => {
    await client.callTool({
      name: "verify_output",
      arguments: { sessionId: "history-session", output: "First output for the history test." },
    });

    await client.callTool({
      name: "verify_output",
      arguments: { sessionId: "history-session", output: "Second output for the history test." },
    });

    const result = await client.callTool({
      name: "verify_history",
      arguments: { sessionId: "history-session" },
    });

    const data = parseToolResult(result) as {
      sessionId: string;
      records: unknown[];
      total: number;
    };

    expect(data.sessionId).toBe("history-session");
    expect(data.total).toBe(2);
    expect(data.records).toHaveLength(2);
  });

  it("verify_checkpoint_create_withExtendedParams_storesWaveInfo", async () => {
    const result = await client.callTool({
      name: "verify_checkpoint_create",
      arguments: {
        sessionId: "ext-session",
        name: "wave-3",
        stateJson: "{}",
        agentScore: 0.9,
        waveNumber: 3,
        buildStatus: "success",
        testStatus: "407/407 pass",
        commitSha: "abc123",
      },
    });

    const data = parseToolResult(result) as {
      checkpointId: string;
      waveNumber: number;
      buildStatus: string;
      testStatus: string;
      commitSha: string;
    };

    expect(data.waveNumber).toBe(3);
    expect(data.buildStatus).toBe("success");
    expect(data.testStatus).toBe("407/407 pass");
    expect(data.commitSha).toBe("abc123");
  });

  it("verify_checkpoint_findings_add_and_list_roundtrips", async () => {
    const cpResult = await client.callTool({
      name: "verify_checkpoint_create",
      arguments: { sessionId: "findings-session", name: "w1", stateJson: "{}" },
    });
    const cpData = parseToolResult(cpResult) as { checkpointId: string };

    await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: {
        action: "add",
        checkpointId: cpData.checkpointId,
        severity: "P1",
        file: "src/server.ts",
        line: 42,
        description: "Missing error handling",
        blocker: true,
      },
    });

    await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: {
        action: "add",
        checkpointId: cpData.checkpointId,
        severity: "P3",
        file: "src/util.ts",
        description: "Style issue",
      },
    });

    const listResult = await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: { action: "list", checkpointId: cpData.checkpointId },
    });

    const listData = parseToolResult(listResult) as {
      total: number;
      blockers: number;
      unresolved: number;
      findings: Array<{ severity: string; file: string; blocker: boolean }>;
    };

    expect(listData.total).toBe(2);
    expect(listData.blockers).toBe(1);
    expect(listData.unresolved).toBe(2);
  });

  it("verify_checkpoint_findings_resolve_marksAsFixed", async () => {
    const cpResult = await client.callTool({
      name: "verify_checkpoint_create",
      arguments: { sessionId: "resolve-session", name: "w1", stateJson: "{}" },
    });
    const cpData = parseToolResult(cpResult) as { checkpointId: string };

    const addResult = await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: {
        action: "add",
        checkpointId: cpData.checkpointId,
        severity: "P0",
        file: "src/critical.ts",
        description: "Security vulnerability",
        blocker: true,
      },
    });
    const findingData = parseToolResult(addResult) as { findingId: string };

    const resolveResult = await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: {
        action: "resolve",
        checkpointId: cpData.checkpointId,
        findingId: findingData.findingId,
        fixCommit: "def456",
      },
    });

    const resolveData = parseToolResult(resolveResult) as { resolved: boolean; fixCommit: string };
    expect(resolveData.resolved).toBe(true);
    expect(resolveData.fixCommit).toBe("def456");

    const listResult = await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: { action: "list", checkpointId: cpData.checkpointId },
    });
    const listData = parseToolResult(listResult) as { unresolved: number };
    expect(listData.unresolved).toBe(0);
  });

  it("verify_receipt_write_createsReceiptWithHash", async () => {
    const result = await client.callTool({
      name: "verify_receipt_write",
      arguments: {
        sessionId: "receipt-session",
        agentName: "code-reviewer",
        waveNumber: 1,
        output: "Review complete: 0 issues found",
        evidence: { testsPass: true },
      },
    });

    const data = parseToolResult(result) as {
      receiptId: string;
      outputHash: string;
      agentName: string;
      evidence: Record<string, unknown>;
    };

    expect(data.receiptId).toBeDefined();
    expect(data.outputHash).toMatch(/^[a-f0-9]{64}$/);
    expect(data.agentName).toBe("code-reviewer");
    expect(data.evidence).toEqual({ testsPass: true });
  });

  it("verify_receipt_list_returnsBySessionAndWave", async () => {
    await client.callTool({
      name: "verify_receipt_write",
      arguments: { sessionId: "list-session", agentName: "a1", waveNumber: 1, output: "o1" },
    });
    await client.callTool({
      name: "verify_receipt_write",
      arguments: { sessionId: "list-session", agentName: "a2", waveNumber: 2, output: "o2" },
    });

    const allResult = await client.callTool({
      name: "verify_receipt_list",
      arguments: { sessionId: "list-session" },
    });
    const allData = parseToolResult(allResult) as { total: number };
    expect(allData.total).toBe(2);

    const wave1Result = await client.callTool({
      name: "verify_receipt_list",
      arguments: { sessionId: "list-session", waveNumber: 1 },
    });
    const wave1Data = parseToolResult(wave1Result) as { total: number };
    expect(wave1Data.total).toBe(1);
  });

  it("verify_receipt_chain_detectsCompleteness", async () => {
    await client.callTool({
      name: "verify_receipt_write",
      arguments: { sessionId: "chain-session", agentName: "planner", waveNumber: 1, output: "plan" },
    });
    await client.callTool({
      name: "verify_receipt_write",
      arguments: { sessionId: "chain-session", agentName: "coder", waveNumber: 1, output: "code" },
    });

    const incompleteResult = await client.callTool({
      name: "verify_receipt_chain",
      arguments: {
        sessionId: "chain-session",
        expectedAgents: ["planner", "coder", "reviewer"],
        waveNumber: 1,
      },
    });
    const incompleteData = parseToolResult(incompleteResult) as {
      complete: boolean;
      missing: string[];
    };

    expect(incompleteData.complete).toBe(false);
    expect(incompleteData.missing).toEqual(["reviewer"]);

    await client.callTool({
      name: "verify_receipt_write",
      arguments: { sessionId: "chain-session", agentName: "reviewer", waveNumber: 1, output: "review" },
    });

    const completeResult = await client.callTool({
      name: "verify_receipt_chain",
      arguments: {
        sessionId: "chain-session",
        expectedAgents: ["planner", "coder", "reviewer"],
        waveNumber: 1,
      },
    });
    const completeData = parseToolResult(completeResult) as { complete: boolean; missing: string[] };

    expect(completeData.complete).toBe(true);
    expect(completeData.missing).toEqual([]);
  });
});
