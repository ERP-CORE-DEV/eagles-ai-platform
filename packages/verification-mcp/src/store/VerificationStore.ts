import Database from "better-sqlite3";
import { createHash, randomUUID } from "node:crypto";
import type { AgentScore, TruthAssessment } from "../scoring/types.js";
import type { Checkpoint, CheckpointFinding, FindingSeverity, Receipt } from "../checkpoints/types.js";

export interface AgentScoreRow {
  readonly id: string;
  readonly sessionId: string;
  readonly agentId: string;
  readonly accuracy: number;
  readonly reliability: number;
  readonly consistency: number;
  readonly efficiency: number;
  readonly adaptability: number;
  readonly composite: number;
  readonly riskLevel: string;
  readonly computedAt: string;
}

export interface VerificationRow {
  readonly id: string;
  readonly sessionId: string;
  readonly confidence: number;
  readonly suggestedAction: string;
  readonly flags: readonly string[];
  readonly verifiedAt: string;
}

export class VerificationStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agent_scores (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        agent_id TEXT NOT NULL,
        accuracy REAL NOT NULL,
        reliability REAL NOT NULL,
        consistency REAL NOT NULL,
        efficiency REAL NOT NULL,
        adaptability REAL NOT NULL,
        composite REAL NOT NULL,
        risk_level TEXT NOT NULL,
        computed_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS checkpoints (
        checkpoint_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        name TEXT NOT NULL,
        state_json TEXT NOT NULL,
        agent_score REAL,
        verified INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        wave_number INTEGER,
        build_status TEXT,
        test_status TEXT,
        commit_sha TEXT
      );

      CREATE TABLE IF NOT EXISTS checkpoint_findings (
        finding_id TEXT PRIMARY KEY,
        checkpoint_id TEXT NOT NULL,
        severity TEXT NOT NULL DEFAULT 'P2',
        file TEXT NOT NULL,
        line INTEGER,
        description TEXT NOT NULL,
        blocker INTEGER NOT NULL DEFAULT 0,
        resolved INTEGER NOT NULL DEFAULT 0,
        fix_commit TEXT,
        created_at TEXT NOT NULL,
        FOREIGN KEY (checkpoint_id) REFERENCES checkpoints(checkpoint_id)
      );

      CREATE TABLE IF NOT EXISTS receipts (
        receipt_id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        agent_name TEXT NOT NULL,
        wave_number INTEGER NOT NULL,
        output_hash TEXT NOT NULL,
        evidence TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS verification_history (
        id TEXT PRIMARY KEY,
        session_id TEXT NOT NULL,
        confidence REAL NOT NULL,
        suggested_action TEXT NOT NULL,
        flags TEXT NOT NULL,
        verified_at TEXT NOT NULL
      );

      CREATE INDEX IF NOT EXISTS idx_agent_scores_session ON agent_scores(session_id);
      CREATE INDEX IF NOT EXISTS idx_checkpoints_session ON checkpoints(session_id);
      CREATE INDEX IF NOT EXISTS idx_findings_checkpoint ON checkpoint_findings(checkpoint_id);
      CREATE INDEX IF NOT EXISTS idx_receipts_session ON receipts(session_id);
      CREATE INDEX IF NOT EXISTS idx_receipts_wave ON receipts(session_id, wave_number);
      CREATE INDEX IF NOT EXISTS idx_verification_history_session ON verification_history(session_id);
    `);
  }

  // ---------------------------------------------------------------------------
  // Agent scores
  // ---------------------------------------------------------------------------

  insertAgentScore(sessionId: string, agentId: string, score: AgentScore): void {
    const id = randomUUID();
    const computedAt = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO agent_scores (
        id, session_id, agent_id, accuracy, reliability, consistency,
        efficiency, adaptability, composite, risk_level, computed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id, sessionId, agentId,
      score.accuracy, score.reliability, score.consistency,
      score.efficiency, score.adaptability, score.composite,
      score.riskLevel, computedAt,
    );
  }

  getAgentScores(sessionId: string, agentId?: string): AgentScoreRow[] {
    const query = agentId !== undefined
      ? "SELECT * FROM agent_scores WHERE session_id = ? AND agent_id = ? ORDER BY computed_at ASC"
      : "SELECT * FROM agent_scores WHERE session_id = ? ORDER BY computed_at ASC";

    const rows = agentId !== undefined
      ? this.db.prepare(query).all(sessionId, agentId) as Array<{
          id: string; session_id: string; agent_id: string;
          accuracy: number; reliability: number; consistency: number;
          efficiency: number; adaptability: number; composite: number;
          risk_level: string; computed_at: string;
        }>
      : this.db.prepare(query).all(sessionId) as Array<{
          id: string; session_id: string; agent_id: string;
          accuracy: number; reliability: number; consistency: number;
          efficiency: number; adaptability: number; composite: number;
          risk_level: string; computed_at: string;
        }>;

    return rows.map((row) => ({
      id: row.id, sessionId: row.session_id, agentId: row.agent_id,
      accuracy: row.accuracy, reliability: row.reliability,
      consistency: row.consistency, efficiency: row.efficiency,
      adaptability: row.adaptability, composite: row.composite,
      riskLevel: row.risk_level, computedAt: row.computed_at,
    }));
  }

  // ---------------------------------------------------------------------------
  // Checkpoints
  // ---------------------------------------------------------------------------

  insertCheckpoint(params: {
    readonly sessionId: string;
    readonly name: string;
    readonly stateJson: string;
    readonly agentScore: number | null;
    readonly waveNumber?: number;
    readonly buildStatus?: string;
    readonly testStatus?: string;
    readonly commitSha?: string;
  }): Checkpoint {
    const checkpointId = randomUUID();
    const createdAt = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO checkpoints (
        checkpoint_id, session_id, name, state_json, agent_score, verified,
        created_at, wave_number, build_status, test_status, commit_sha
      ) VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, ?, ?)
    `).run(
      checkpointId, params.sessionId, params.name, params.stateJson,
      params.agentScore, createdAt,
      params.waveNumber ?? null, params.buildStatus ?? null,
      params.testStatus ?? null, params.commitSha ?? null,
    );

    return {
      checkpointId, sessionId: params.sessionId, name: params.name,
      stateJson: params.stateJson, agentScore: params.agentScore,
      verified: false, createdAt,
      waveNumber: params.waveNumber ?? null,
      buildStatus: params.buildStatus ?? null,
      testStatus: params.testStatus ?? null,
      commitSha: params.commitSha ?? null,
    };
  }

  getCheckpoint(checkpointId: string): Checkpoint | null {
    const row = this.db.prepare(
      "SELECT * FROM checkpoints WHERE checkpoint_id = ?",
    ).get(checkpointId) as {
      checkpoint_id: string; session_id: string; name: string;
      state_json: string; agent_score: number | null; verified: number;
      created_at: string; wave_number: number | null;
      build_status: string | null; test_status: string | null;
      commit_sha: string | null;
    } | undefined;

    if (row === undefined) return null;

    return {
      checkpointId: row.checkpoint_id, sessionId: row.session_id,
      name: row.name, stateJson: row.state_json,
      agentScore: row.agent_score, verified: row.verified === 1,
      createdAt: row.created_at, waveNumber: row.wave_number,
      buildStatus: row.build_status, testStatus: row.test_status,
      commitSha: row.commit_sha,
    };
  }

  listCheckpoints(sessionId: string): Checkpoint[] {
    const rows = this.db.prepare(
      "SELECT * FROM checkpoints WHERE session_id = ? ORDER BY created_at ASC",
    ).all(sessionId) as Array<{
      checkpoint_id: string; session_id: string; name: string;
      state_json: string; agent_score: number | null; verified: number;
      created_at: string; wave_number: number | null;
      build_status: string | null; test_status: string | null;
      commit_sha: string | null;
    }>;

    return rows.map((row) => ({
      checkpointId: row.checkpoint_id, sessionId: row.session_id,
      name: row.name, stateJson: row.state_json,
      agentScore: row.agent_score, verified: row.verified === 1,
      createdAt: row.created_at, waveNumber: row.wave_number,
      buildStatus: row.build_status, testStatus: row.test_status,
      commitSha: row.commit_sha,
    }));
  }

  markVerified(checkpointId: string): void {
    this.db.prepare(
      "UPDATE checkpoints SET verified = 1 WHERE checkpoint_id = ?",
    ).run(checkpointId);
  }

  getLastVerifiedCheckpoint(sessionId: string): Checkpoint | null {
    const row = this.db.prepare(
      "SELECT * FROM checkpoints WHERE session_id = ? AND verified = 1 ORDER BY rowid DESC LIMIT 1",
    ).get(sessionId) as {
      checkpoint_id: string; session_id: string; name: string;
      state_json: string; agent_score: number | null; verified: number;
      created_at: string; wave_number: number | null;
      build_status: string | null; test_status: string | null;
      commit_sha: string | null;
    } | undefined;

    if (row === undefined) return null;

    return {
      checkpointId: row.checkpoint_id, sessionId: row.session_id,
      name: row.name, stateJson: row.state_json,
      agentScore: row.agent_score, verified: row.verified === 1,
      createdAt: row.created_at, waveNumber: row.wave_number,
      buildStatus: row.build_status, testStatus: row.test_status,
      commitSha: row.commit_sha,
    };
  }

  // ---------------------------------------------------------------------------
  // Checkpoint findings
  // ---------------------------------------------------------------------------

  insertFinding(params: {
    readonly checkpointId: string;
    readonly severity: FindingSeverity;
    readonly file: string;
    readonly line?: number;
    readonly description: string;
    readonly blocker?: boolean;
  }): CheckpointFinding {
    const findingId = randomUUID();
    const createdAt = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO checkpoint_findings (
        finding_id, checkpoint_id, severity, file, line,
        description, blocker, resolved, fix_commit, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, 0, NULL, ?)
    `).run(
      findingId, params.checkpointId, params.severity,
      params.file, params.line ?? null, params.description,
      params.blocker ? 1 : 0, createdAt,
    );

    return {
      findingId, checkpointId: params.checkpointId,
      severity: params.severity, file: params.file,
      line: params.line ?? null, description: params.description,
      blocker: params.blocker ?? false, resolved: false,
      fixCommit: null, createdAt,
    };
  }

  getFindings(checkpointId: string): CheckpointFinding[] {
    const rows = this.db.prepare(
      "SELECT * FROM checkpoint_findings WHERE checkpoint_id = ? ORDER BY created_at ASC",
    ).all(checkpointId) as Array<{
      finding_id: string; checkpoint_id: string; severity: string;
      file: string; line: number | null; description: string;
      blocker: number; resolved: number; fix_commit: string | null;
      created_at: string;
    }>;

    return rows.map((row) => ({
      findingId: row.finding_id, checkpointId: row.checkpoint_id,
      severity: row.severity as FindingSeverity, file: row.file,
      line: row.line, description: row.description,
      blocker: row.blocker === 1, resolved: row.resolved === 1,
      fixCommit: row.fix_commit, createdAt: row.created_at,
    }));
  }

  resolveFinding(findingId: string, fixCommit: string): void {
    this.db.prepare(
      "UPDATE checkpoint_findings SET resolved = 1, fix_commit = ? WHERE finding_id = ?",
    ).run(fixCommit, findingId);
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
    const receiptId = randomUUID();
    const outputHash = createHash("sha256").update(params.output).digest("hex");
    const createdAt = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO receipts (
        receipt_id, session_id, agent_name, wave_number,
        output_hash, evidence, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      receiptId, params.sessionId, params.agentName,
      params.waveNumber, outputHash,
      JSON.stringify(params.evidence ?? {}), createdAt,
    );

    return {
      receiptId, sessionId: params.sessionId,
      agentName: params.agentName, waveNumber: params.waveNumber,
      outputHash, evidence: params.evidence ?? {},
      createdAt,
    };
  }

  listReceipts(sessionId: string, waveNumber?: number): Receipt[] {
    const query = waveNumber !== undefined
      ? "SELECT * FROM receipts WHERE session_id = ? AND wave_number = ? ORDER BY created_at ASC"
      : "SELECT * FROM receipts WHERE session_id = ? ORDER BY created_at ASC";

    const rows = waveNumber !== undefined
      ? this.db.prepare(query).all(sessionId, waveNumber) as Array<{
          receipt_id: string; session_id: string; agent_name: string;
          wave_number: number; output_hash: string; evidence: string;
          created_at: string;
        }>
      : this.db.prepare(query).all(sessionId) as Array<{
          receipt_id: string; session_id: string; agent_name: string;
          wave_number: number; output_hash: string; evidence: string;
          created_at: string;
        }>;

    return rows.map((row) => ({
      receiptId: row.receipt_id, sessionId: row.session_id,
      agentName: row.agent_name, waveNumber: row.wave_number,
      outputHash: row.output_hash,
      evidence: JSON.parse(row.evidence) as Record<string, unknown>,
      createdAt: row.created_at,
    }));
  }

  verifyReceiptChain(sessionId: string, expectedAgents: string[], waveNumber: number): {
    complete: boolean;
    missing: string[];
    receipts: Receipt[];
  } {
    const receipts = this.listReceipts(sessionId, waveNumber);
    const agentsWithReceipts = new Set(receipts.map((r) => r.agentName));
    const missing = expectedAgents.filter((a) => !agentsWithReceipts.has(a));

    return {
      complete: missing.length === 0,
      missing,
      receipts,
    };
  }

  // ---------------------------------------------------------------------------
  // Verification history
  // ---------------------------------------------------------------------------

  insertVerificationRecord(sessionId: string, assessment: TruthAssessment): void {
    const id = randomUUID();
    const verifiedAt = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO verification_history (
        id, session_id, confidence, suggested_action, flags, verified_at
      ) VALUES (?, ?, ?, ?, ?, ?)
    `).run(
      id, sessionId, assessment.confidence,
      assessment.suggestedAction, JSON.stringify(assessment.flags),
      verifiedAt,
    );
  }

  getVerificationHistory(sessionId: string): VerificationRow[] {
    const rows = this.db.prepare(
      "SELECT * FROM verification_history WHERE session_id = ? ORDER BY verified_at ASC",
    ).all(sessionId) as Array<{
      id: string; session_id: string; confidence: number;
      suggested_action: string; flags: string; verified_at: string;
    }>;

    return rows.map((row) => ({
      id: row.id, sessionId: row.session_id,
      confidence: row.confidence, suggestedAction: row.suggested_action,
      flags: JSON.parse(row.flags) as string[],
      verifiedAt: row.verified_at,
    }));
  }

  close(): void {
    this.db.close();
  }
}
