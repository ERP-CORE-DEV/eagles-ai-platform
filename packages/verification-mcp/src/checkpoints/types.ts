export type FindingSeverity = "P0" | "P1" | "P2" | "P3";

export interface Checkpoint {
  readonly checkpointId: string;
  readonly sessionId: string;
  readonly name: string;
  readonly stateJson: string;
  readonly agentScore: number | null;
  readonly verified: boolean;
  readonly createdAt: string;
  readonly waveNumber: number | null;
  readonly buildStatus: string | null;
  readonly testStatus: string | null;
  readonly commitSha: string | null;
}

export interface CheckpointFinding {
  readonly findingId: string;
  readonly checkpointId: string;
  readonly severity: FindingSeverity;
  readonly file: string;
  readonly line: number | null;
  readonly description: string;
  readonly blocker: boolean;
  readonly resolved: boolean;
  readonly fixCommit: string | null;
  readonly createdAt: string;
}

export interface Receipt {
  readonly receiptId: string;
  readonly sessionId: string;
  readonly agentName: string;
  readonly waveNumber: number;
  readonly outputHash: string;
  readonly evidence: Record<string, unknown>;
  readonly createdAt: string;
}
