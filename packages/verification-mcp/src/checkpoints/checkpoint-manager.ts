import type { Checkpoint, CheckpointFinding, FindingSeverity, Receipt } from "./types.js";
import type { VerificationStore } from "../store/VerificationStore.js";

export class CheckpointManager {
  constructor(private readonly store: VerificationStore) {}

  create(params: {
    readonly sessionId: string;
    readonly name: string;
    readonly stateJson: string;
    readonly agentScore?: number;
    readonly waveNumber?: number;
    readonly buildStatus?: string;
    readonly testStatus?: string;
    readonly commitSha?: string;
  }): Checkpoint {
    return this.store.insertCheckpoint({
      sessionId: params.sessionId,
      name: params.name,
      stateJson: params.stateJson,
      agentScore: params.agentScore ?? null,
      waveNumber: params.waveNumber,
      buildStatus: params.buildStatus,
      testStatus: params.testStatus,
      commitSha: params.commitSha,
    });
  }

  restore(checkpointId: string): Checkpoint | null {
    return this.store.getCheckpoint(checkpointId);
  }

  listForSession(sessionId: string): Checkpoint[] {
    return this.store.listCheckpoints(sessionId);
  }

  getLastGood(sessionId: string): Checkpoint | null {
    return this.store.getLastVerifiedCheckpoint(sessionId);
  }

  verify(checkpointId: string): void {
    this.store.markVerified(checkpointId);
  }

  // ---------------------------------------------------------------------------
  // Findings
  // ---------------------------------------------------------------------------

  addFinding(params: {
    readonly checkpointId: string;
    readonly severity: FindingSeverity;
    readonly file: string;
    readonly line?: number;
    readonly description: string;
    readonly blocker?: boolean;
  }): CheckpointFinding {
    return this.store.insertFinding(params);
  }

  getFindings(checkpointId: string): CheckpointFinding[] {
    return this.store.getFindings(checkpointId);
  }

  resolveFinding(findingId: string, fixCommit: string): void {
    this.store.resolveFinding(findingId, fixCommit);
  }

  // ---------------------------------------------------------------------------
  // Receipts
  // ---------------------------------------------------------------------------

  writeReceipt(params: {
    readonly sessionId: string;
    readonly agentName: string;
    readonly waveNumber: number;
    readonly output: string;
    readonly evidence?: Record<string, unknown>;
  }): Receipt {
    return this.store.writeReceipt(params);
  }

  listReceipts(sessionId: string, waveNumber?: number): Receipt[] {
    return this.store.listReceipts(sessionId, waveNumber);
  }

  verifyReceiptChain(sessionId: string, expectedAgents: string[], waveNumber: number): {
    complete: boolean;
    missing: string[];
    receipts: Receipt[];
  } {
    return this.store.verifyReceiptChain(sessionId, expectedAgents, waveNumber);
  }
}
