/**
 * Shared orchestration types used across MCP servers.
 * Unified from Classic Bash types and Advanced TypeScript types.
 */

export type FindingSeverity = "P0" | "P1" | "P2" | "P3";

export type WaveStatus = "pending" | "running" | "completed" | "failed" | "skipped";

export interface WaveCheckpoint {
  readonly checkpointId: string;
  readonly sessionId: string;
  readonly waveNumber: number;
  readonly name: string;
  readonly buildStatus: string | null;
  readonly testStatus: string | null;
  readonly commitSha: string | null;
  readonly agentScore: number | null;
  readonly verified: boolean;
  readonly createdAt: string;
}

export interface AgentReceipt {
  readonly receiptId: string;
  readonly sessionId: string;
  readonly agentName: string;
  readonly waveNumber: number;
  readonly outputHash: string;
  readonly evidence: Record<string, unknown>;
  readonly createdAt: string;
}

export interface BusMessage<T = unknown> {
  readonly id: string;
  readonly topic: string;
  readonly payload: T;
  readonly publishedAt: string;
  readonly deduplicationKey?: string;
}

export interface WaveSummary {
  readonly waveNumber: number;
  readonly status: WaveStatus;
  readonly agentCount: number;
  readonly findingsCount: number;
  readonly blockersCount: number;
  readonly receiptsComplete: boolean;
  readonly startedAt: string | null;
  readonly completedAt: string | null;
}
