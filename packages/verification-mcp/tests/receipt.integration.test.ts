import { describe, it, expect, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { createHash } from "node:crypto";
import { createVerificationServer } from "../src/server.js";

function makeTempDb(): string {
  const dir = mkdtempSync(join(tmpdir(), "verify-receipt-integ-"));
  return join(dir, "test.sqlite");
}

async function makeClient(dbPath: string): Promise<Client> {
  const server = createVerificationServer(dbPath);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "receipt-integration-test", version: "1.0.0" });
  await client.connect(clientTransport);
  return client;
}

function parseResult(result: Awaited<ReturnType<Client["callTool"]>>): unknown {
  const content = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content[0].text);
}

describe("receipt chain integration", () => {
  let client: Client;

  beforeEach(async () => {
    client = await makeClient(makeTempDb());
  });

  it("full receipt chain: write 3 receipts → verify chain → check SHA-256 consistency", async () => {
    const sessionId = "chain-integration-test";
    const waveNumber = 1;

    // Write 3 receipts (simulating 3 agents completing work)
    const outputs = [
      { agent: "planner", output: "Plan: 3 phases, 5 files, 12 tests" },
      { agent: "coder", output: "Implemented: 5 files, 200 lines" },
      { agent: "reviewer", output: "Review: 0 critical, 2 warnings" },
    ];

    const receiptIds: string[] = [];
    for (const { agent, output } of outputs) {
      const result = await client.callTool({
        name: "verify_receipt_write",
        arguments: {
          sessionId,
          agentName: agent,
          waveNumber,
          output,
          evidence: { testsPass: true },
        },
      });
      const data = parseResult(result) as { receiptId: string; outputHash: string };
      receiptIds.push(data.receiptId);

      // Verify SHA-256 hash matches Node.js crypto
      const expectedHash = createHash("sha256").update(output).digest("hex");
      expect(data.outputHash).toBe(expectedHash);
    }

    expect(receiptIds).toHaveLength(3);

    // Verify chain completeness
    const chainResult = await client.callTool({
      name: "verify_receipt_chain",
      arguments: {
        sessionId,
        expectedAgents: ["planner", "coder", "reviewer"],
        waveNumber,
      },
    });
    const chainData = parseResult(chainResult) as {
      complete: boolean;
      missing: string[];
      total: number;
    };

    expect(chainData.complete).toBe(true);
    expect(chainData.missing).toEqual([]);
    expect(chainData.total).toBe(3);
  });

  it("receipt chain detects missing agent across waves", async () => {
    const sessionId = "multi-wave-test";

    // Wave 1: all 3 agents complete
    for (const agent of ["planner", "coder", "reviewer"]) {
      await client.callTool({
        name: "verify_receipt_write",
        arguments: { sessionId, agentName: agent, waveNumber: 1, output: `${agent} wave 1 done` },
      });
    }

    // Wave 2: only planner and coder complete (reviewer missing)
    for (const agent of ["planner", "coder"]) {
      await client.callTool({
        name: "verify_receipt_write",
        arguments: { sessionId, agentName: agent, waveNumber: 2, output: `${agent} wave 2 done` },
      });
    }

    // Wave 1 should be complete
    const wave1 = parseResult(await client.callTool({
      name: "verify_receipt_chain",
      arguments: { sessionId, expectedAgents: ["planner", "coder", "reviewer"], waveNumber: 1 },
    })) as { complete: boolean };
    expect(wave1.complete).toBe(true);

    // Wave 2 should be incomplete
    const wave2 = parseResult(await client.callTool({
      name: "verify_receipt_chain",
      arguments: { sessionId, expectedAgents: ["planner", "coder", "reviewer"], waveNumber: 2 },
    })) as { complete: boolean; missing: string[] };
    expect(wave2.complete).toBe(false);
    expect(wave2.missing).toEqual(["reviewer"]);
  });

  it("checkpoint + findings + receipt integration", async () => {
    const sessionId = "full-integration";

    // Create checkpoint with wave info
    const cpResult = parseResult(await client.callTool({
      name: "verify_checkpoint_create",
      arguments: {
        sessionId,
        name: "wave-1",
        stateJson: '{"files": 5}',
        agentScore: 0.85,
        waveNumber: 1,
        buildStatus: "success",
        testStatus: "465/465 pass",
        commitSha: "abc123",
      },
    })) as { checkpointId: string };

    // Add findings
    await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: {
        action: "add",
        checkpointId: cpResult.checkpointId,
        severity: "P1",
        file: "src/server.ts",
        line: 42,
        description: "Missing error boundary",
        blocker: true,
      },
    });

    await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: {
        action: "add",
        checkpointId: cpResult.checkpointId,
        severity: "P3",
        file: "src/utils.ts",
        description: "Consider using const assertion",
      },
    });

    // List findings
    const findingsResult = parseResult(await client.callTool({
      name: "verify_checkpoint_findings",
      arguments: { action: "list", checkpointId: cpResult.checkpointId },
    })) as { total: number; blockers: number; unresolved: number };

    expect(findingsResult.total).toBe(2);
    expect(findingsResult.blockers).toBe(1);
    expect(findingsResult.unresolved).toBe(2);

    // Write receipt after addressing findings
    const receiptResult = parseResult(await client.callTool({
      name: "verify_receipt_write",
      arguments: {
        sessionId,
        agentName: "verifier",
        waveNumber: 1,
        output: "Verification complete: 2 findings, 1 blocker",
        evidence: { checkpointId: cpResult.checkpointId, findingsCount: 2, blockersCount: 1 },
      },
    })) as { receiptId: string; outputHash: string };

    expect(receiptResult.receiptId).toBeDefined();
    expect(receiptResult.outputHash).toMatch(/^[a-f0-9]{64}$/);
  });

  it("SHA-256 hash is deterministic — same output always produces same hash", async () => {
    const output = "deterministic test output for SHA-256 verification";

    const r1 = parseResult(await client.callTool({
      name: "verify_receipt_write",
      arguments: { sessionId: "s1", agentName: "a1", waveNumber: 1, output },
    })) as { outputHash: string };

    const r2 = parseResult(await client.callTool({
      name: "verify_receipt_write",
      arguments: { sessionId: "s2", agentName: "a2", waveNumber: 2, output },
    })) as { outputHash: string };

    expect(r1.outputHash).toBe(r2.outputHash);

    // Verify against local Node.js crypto
    const expectedHash = createHash("sha256").update(output).digest("hex");
    expect(r1.outputHash).toBe(expectedHash);
  });
});
