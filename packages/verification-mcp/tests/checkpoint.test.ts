import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { VerificationStore } from "../src/store/VerificationStore.js";
import { CheckpointManager } from "../src/checkpoints/checkpoint-manager.js";

function makeTempStore(): { store: VerificationStore; manager: CheckpointManager; cleanup: () => void } {
  const dir = mkdtempSync(join(tmpdir(), "verify-cp-test-"));
  const dbPath = join(dir, "test.sqlite");
  const store = new VerificationStore(dbPath);
  const manager = new CheckpointManager(store);
  return {
    store,
    manager,
    // Skip rmSync on Windows — SQLite WAL/SHM files stay locked; OS cleans temp on reboot
    cleanup: () => {},
  };
}

describe("CheckpointManager", () => {
  let manager: CheckpointManager;
  let cleanup: () => void;

  beforeEach(() => {
    const temp = makeTempStore();
    manager = temp.manager;
    cleanup = temp.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  it("create_andRestore_roundtripsCheckpointData", () => {
    const checkpoint = manager.create({
      sessionId: "session-1",
      name: "wave-1",
      stateJson: '{"step": 1}',
      agentScore: 0.9,
    });

    const restored = manager.restore(checkpoint.checkpointId);

    expect(restored).not.toBeNull();
    expect(restored?.checkpointId).toBe(checkpoint.checkpointId);
    expect(restored?.sessionId).toBe("session-1");
    expect(restored?.name).toBe("wave-1");
    expect(restored?.stateJson).toBe('{"step": 1}');
    expect(restored?.agentScore).toBe(0.9);
    expect(restored?.verified).toBe(false);
  });

  it("listForSession_returnsChronologicalOrder", () => {
    manager.create({ sessionId: "session-list", name: "first", stateJson: "{}" });
    manager.create({ sessionId: "session-list", name: "second", stateJson: "{}" });
    manager.create({ sessionId: "session-list", name: "third", stateJson: "{}" });

    const list = manager.listForSession("session-list");

    expect(list).toHaveLength(3);
    expect(list[0].name).toBe("first");
    expect(list[1].name).toBe("second");
    expect(list[2].name).toBe("third");
  });

  it("getLastGood_returnsMostRecentVerifiedCheckpoint", () => {
    const first = manager.create({ sessionId: "session-good", name: "first", stateJson: "{}" });
    const second = manager.create({ sessionId: "session-good", name: "second", stateJson: "{}" });

    manager.verify(first.checkpointId);
    manager.verify(second.checkpointId);

    const lastGood = manager.getLastGood("session-good");

    expect(lastGood).not.toBeNull();
    expect(lastGood?.checkpointId).toBe(second.checkpointId);
  });

  it("getLastGood_returnsNullWhenNoneVerified", () => {
    manager.create({ sessionId: "session-unverified", name: "first", stateJson: "{}" });

    const lastGood = manager.getLastGood("session-unverified");

    expect(lastGood).toBeNull();
  });

  it("verify_marksCheckpointAsVerified", () => {
    const checkpoint = manager.create({
      sessionId: "session-verify",
      name: "to-verify",
      stateJson: "{}",
    });

    expect(checkpoint.verified).toBe(false);

    manager.verify(checkpoint.checkpointId);

    const restored = manager.restore(checkpoint.checkpointId);
    expect(restored?.verified).toBe(true);
  });

  it("restore_returnsNullForUnknownCheckpointId", () => {
    const result = manager.restore("non-existent-checkpoint-id");
    expect(result).toBeNull();
  });

  it("create_withExtendedParams_storesWaveAndBuildInfo", () => {
    const checkpoint = manager.create({
      sessionId: "session-ext",
      name: "wave-3",
      stateJson: '{"step": 3}',
      agentScore: 0.85,
      waveNumber: 3,
      buildStatus: "success",
      testStatus: "407/407 pass",
      commitSha: "abc123def",
    });

    const restored = manager.restore(checkpoint.checkpointId);

    expect(restored).not.toBeNull();
    expect(restored?.waveNumber).toBe(3);
    expect(restored?.buildStatus).toBe("success");
    expect(restored?.testStatus).toBe("407/407 pass");
    expect(restored?.commitSha).toBe("abc123def");
  });

  it("create_withoutExtendedParams_defaultsToNull", () => {
    const checkpoint = manager.create({
      sessionId: "session-defaults",
      name: "basic",
      stateJson: "{}",
    });

    const restored = manager.restore(checkpoint.checkpointId);

    expect(restored?.waveNumber).toBeNull();
    expect(restored?.buildStatus).toBeNull();
    expect(restored?.testStatus).toBeNull();
    expect(restored?.commitSha).toBeNull();
  });
});

describe("CheckpointManager — Findings", () => {
  let manager: CheckpointManager;
  let cleanup: () => void;
  let checkpointId: string;

  beforeEach(() => {
    const temp = makeTempStore();
    manager = temp.manager;
    cleanup = temp.cleanup;
    const cp = manager.create({ sessionId: "s1", name: "wave-1", stateJson: "{}" });
    checkpointId = cp.checkpointId;
  });

  afterEach(() => {
    cleanup();
  });

  it("addFinding_createsNewFinding", () => {
    const finding = manager.addFinding({
      checkpointId,
      severity: "P1",
      file: "src/server.ts",
      line: 42,
      description: "Missing error handling",
      blocker: true,
    });

    expect(finding.findingId).toBeDefined();
    expect(finding.severity).toBe("P1");
    expect(finding.file).toBe("src/server.ts");
    expect(finding.line).toBe(42);
    expect(finding.description).toBe("Missing error handling");
    expect(finding.blocker).toBe(true);
    expect(finding.resolved).toBe(false);
    expect(finding.fixCommit).toBeNull();
  });

  it("getFindings_returnsAllFindingsForCheckpoint", () => {
    manager.addFinding({ checkpointId, severity: "P0", file: "a.ts", description: "Critical issue" });
    manager.addFinding({ checkpointId, severity: "P2", file: "b.ts", description: "Minor issue" });

    const findings = manager.getFindings(checkpointId);

    expect(findings).toHaveLength(2);
    expect(findings[0].severity).toBe("P0");
    expect(findings[1].severity).toBe("P2");
  });

  it("getFindings_returnsEmptyArrayForCheckpointWithNoFindings", () => {
    const findings = manager.getFindings(checkpointId);
    expect(findings).toEqual([]);
  });

  it("resolveFinding_setsResolvedAndFixCommit", () => {
    const finding = manager.addFinding({
      checkpointId,
      severity: "P1",
      file: "src/bug.ts",
      description: "Bug found",
    });

    manager.resolveFinding(finding.findingId, "abc123");

    const findings = manager.getFindings(checkpointId);
    const resolved = findings.find((f) => f.findingId === finding.findingId);

    expect(resolved?.resolved).toBe(true);
    expect(resolved?.fixCommit).toBe("abc123");
  });

  it("addFinding_withoutLineAndBlocker_usesDefaults", () => {
    const finding = manager.addFinding({
      checkpointId,
      severity: "P3",
      file: "src/util.ts",
      description: "Style issue",
    });

    expect(finding.line).toBeNull();
    expect(finding.blocker).toBe(false);
  });
});

describe("CheckpointManager — Receipts", () => {
  let manager: CheckpointManager;
  let cleanup: () => void;

  beforeEach(() => {
    const temp = makeTempStore();
    manager = temp.manager;
    cleanup = temp.cleanup;
  });

  afterEach(() => {
    cleanup();
  });

  it("writeReceipt_createsReceiptWithSha256Hash", () => {
    const receipt = manager.writeReceipt({
      sessionId: "session-r",
      agentName: "code-reviewer",
      waveNumber: 1,
      output: "Review complete: 0 issues found",
    });

    expect(receipt.receiptId).toBeDefined();
    expect(receipt.sessionId).toBe("session-r");
    expect(receipt.agentName).toBe("code-reviewer");
    expect(receipt.waveNumber).toBe(1);
    expect(receipt.outputHash).toMatch(/^[a-f0-9]{64}$/);
    expect(receipt.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("writeReceipt_sameOutputProducesSameHash", () => {
    const output = "deterministic output";
    const r1 = manager.writeReceipt({ sessionId: "s1", agentName: "a1", waveNumber: 1, output });
    const r2 = manager.writeReceipt({ sessionId: "s2", agentName: "a2", waveNumber: 2, output });

    expect(r1.outputHash).toBe(r2.outputHash);
  });

  it("writeReceipt_differentOutputProducesDifferentHash", () => {
    const r1 = manager.writeReceipt({ sessionId: "s1", agentName: "a1", waveNumber: 1, output: "output-A" });
    const r2 = manager.writeReceipt({ sessionId: "s1", agentName: "a1", waveNumber: 1, output: "output-B" });

    expect(r1.outputHash).not.toBe(r2.outputHash);
  });

  it("writeReceipt_storesEvidence", () => {
    const receipt = manager.writeReceipt({
      sessionId: "s1",
      agentName: "verifier",
      waveNumber: 2,
      output: "verified",
      evidence: { testsPass: true, coverage: 0.85 },
    });

    expect(receipt.evidence).toEqual({ testsPass: true, coverage: 0.85 });
  });

  it("listReceipts_returnsBySession", () => {
    manager.writeReceipt({ sessionId: "s1", agentName: "a1", waveNumber: 1, output: "o1" });
    manager.writeReceipt({ sessionId: "s1", agentName: "a2", waveNumber: 1, output: "o2" });
    manager.writeReceipt({ sessionId: "s2", agentName: "a1", waveNumber: 1, output: "o3" });

    const receipts = manager.listReceipts("s1");

    expect(receipts).toHaveLength(2);
  });

  it("listReceipts_filtersByWaveNumber", () => {
    manager.writeReceipt({ sessionId: "s1", agentName: "a1", waveNumber: 1, output: "o1" });
    manager.writeReceipt({ sessionId: "s1", agentName: "a2", waveNumber: 2, output: "o2" });

    const wave1 = manager.listReceipts("s1", 1);
    const wave2 = manager.listReceipts("s1", 2);

    expect(wave1).toHaveLength(1);
    expect(wave1[0].agentName).toBe("a1");
    expect(wave2).toHaveLength(1);
    expect(wave2[0].agentName).toBe("a2");
  });

  it("verifyReceiptChain_completesWhenAllAgentsPresent", () => {
    manager.writeReceipt({ sessionId: "s1", agentName: "planner", waveNumber: 1, output: "plan" });
    manager.writeReceipt({ sessionId: "s1", agentName: "coder", waveNumber: 1, output: "code" });
    manager.writeReceipt({ sessionId: "s1", agentName: "reviewer", waveNumber: 1, output: "review" });

    const chain = manager.verifyReceiptChain("s1", ["planner", "coder", "reviewer"], 1);

    expect(chain.complete).toBe(true);
    expect(chain.missing).toEqual([]);
    expect(chain.receipts).toHaveLength(3);
  });

  it("verifyReceiptChain_detectsMissingAgents", () => {
    manager.writeReceipt({ sessionId: "s1", agentName: "planner", waveNumber: 1, output: "plan" });

    const chain = manager.verifyReceiptChain("s1", ["planner", "coder", "reviewer"], 1);

    expect(chain.complete).toBe(false);
    expect(chain.missing).toEqual(["coder", "reviewer"]);
    expect(chain.receipts).toHaveLength(1);
  });
});
