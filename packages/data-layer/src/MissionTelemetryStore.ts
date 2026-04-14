import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

export type ViolationType =
  | "mission_start_without_task_create"
  | "mission_start_below_decomposition_threshold";

export interface MissionTelemetryRecord {
  readonly missionId: string;
  readonly project: string;
  readonly goal: string;
  readonly confidence: number;
  readonly taskCountAtCheck: number;
  readonly decompositionSuggested: number;
  readonly violationType: ViolationType | null;
  readonly resolved: boolean;
  readonly detectedAt: string;
}

interface TelemetryRow {
  mission_id: string;
  project: string;
  goal: string;
  confidence: number;
  task_count_at_check: number;
  decomposition_suggested: number;
  violation_type: string | null;
  resolved: number;
  detected_at: string;
}

function rowToRecord(row: TelemetryRow): MissionTelemetryRecord {
  return {
    missionId: row.mission_id,
    project: row.project,
    goal: row.goal,
    confidence: row.confidence,
    taskCountAtCheck: row.task_count_at_check,
    decompositionSuggested: row.decomposition_suggested,
    violationType: row.violation_type as ViolationType | null,
    resolved: row.resolved === 1,
    detectedAt: row.detected_at,
  };
}

export interface MissionSnapshot {
  readonly missionId: string;
  readonly project: string;
  readonly goal: string;
  readonly confidence: number;
  readonly decompositionSuggested: number;
  readonly startedAt: string;
}

export class MissionTelemetryStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS mission_telemetry (
        mission_id TEXT PRIMARY KEY,
        project TEXT NOT NULL,
        goal TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 0,
        task_count_at_check INTEGER NOT NULL DEFAULT 0,
        decomposition_suggested INTEGER NOT NULL DEFAULT 0,
        violation_type TEXT,
        resolved INTEGER NOT NULL DEFAULT 0,
        detected_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_telemetry_project ON mission_telemetry(project);
      CREATE INDEX IF NOT EXISTS idx_telemetry_violation ON mission_telemetry(violation_type);

      CREATE TABLE IF NOT EXISTS mission_snapshot (
        mission_id TEXT PRIMARY KEY,
        project TEXT NOT NULL,
        goal TEXT NOT NULL,
        confidence REAL NOT NULL DEFAULT 0,
        decomposition_suggested INTEGER NOT NULL DEFAULT 0,
        started_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_snapshot_started ON mission_snapshot(started_at);
    `);
  }

  recordMissionStart(params: {
    project: string;
    goal: string;
    confidence: number;
    decompositionSuggested: number;
  }): string {
    const missionId = randomUUID();
    const now = new Date().toISOString();

    this.db
      .prepare(
        `INSERT INTO mission_snapshot (mission_id, project, goal, confidence, decomposition_suggested, started_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        missionId,
        params.project,
        params.goal,
        params.confidence,
        params.decompositionSuggested,
        now,
      );

    return missionId;
  }

  getLatestSnapshot(project: string): MissionSnapshot | null {
    const row = this.db
      .prepare(
        `SELECT * FROM mission_snapshot WHERE project = ? ORDER BY started_at DESC LIMIT 1`,
      )
      .get(project) as
      | {
          mission_id: string;
          project: string;
          goal: string;
          confidence: number;
          decomposition_suggested: number;
          started_at: string;
        }
      | undefined;
    if (!row) return null;
    return {
      missionId: row.mission_id,
      project: row.project,
      goal: row.goal,
      confidence: row.confidence,
      decompositionSuggested: row.decomposition_suggested,
      startedAt: row.started_at,
    };
  }

  recordViolation(params: {
    missionId: string;
    project: string;
    goal: string;
    confidence: number;
    taskCountAtCheck: number;
    decompositionSuggested: number;
    violationType: ViolationType;
  }): MissionTelemetryRecord {
    const now = new Date().toISOString();
    this.db
      .prepare(
        `INSERT OR REPLACE INTO mission_telemetry
         (mission_id, project, goal, confidence, task_count_at_check, decomposition_suggested, violation_type, resolved, detected_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, 0, ?)`,
      )
      .run(
        params.missionId,
        params.project,
        params.goal,
        params.confidence,
        params.taskCountAtCheck,
        params.decompositionSuggested,
        params.violationType,
        now,
      );

    return {
      missionId: params.missionId,
      project: params.project,
      goal: params.goal,
      confidence: params.confidence,
      taskCountAtCheck: params.taskCountAtCheck,
      decompositionSuggested: params.decompositionSuggested,
      violationType: params.violationType,
      resolved: false,
      detectedAt: now,
    };
  }

  markResolved(missionId: string): boolean {
    const result = this.db
      .prepare(`UPDATE mission_telemetry SET resolved = 1 WHERE mission_id = ?`)
      .run(missionId);
    return result.changes > 0;
  }

  listViolations(params?: {
    project?: string;
    resolved?: boolean;
    limit?: number;
  }): MissionTelemetryRecord[] {
    const clauses: string[] = ["violation_type IS NOT NULL"];
    const values: unknown[] = [];
    if (params?.project !== undefined) {
      clauses.push("project = ?");
      values.push(params.project);
    }
    if (params?.resolved !== undefined) {
      clauses.push("resolved = ?");
      values.push(params.resolved ? 1 : 0);
    }
    const limit = params?.limit ?? 100;
    const rows = this.db
      .prepare(
        `SELECT * FROM mission_telemetry
         WHERE ${clauses.join(" AND ")}
         ORDER BY detected_at DESC
         LIMIT ?`,
      )
      .all(...values, limit) as TelemetryRow[];
    return rows.map(rowToRecord);
  }

  counters(): { total: number; byType: Record<string, number>; byProject: Record<string, number> } {
    const total = (
      this.db
        .prepare(`SELECT COUNT(*) as cnt FROM mission_telemetry WHERE violation_type IS NOT NULL`)
        .get() as { cnt: number }
    ).cnt;

    const byTypeRows = this.db
      .prepare(
        `SELECT violation_type as type, COUNT(*) as cnt FROM mission_telemetry
         WHERE violation_type IS NOT NULL GROUP BY violation_type`,
      )
      .all() as Array<{ type: string; cnt: number }>;
    const byType: Record<string, number> = {};
    for (const r of byTypeRows) byType[r.type] = r.cnt;

    const byProjectRows = this.db
      .prepare(
        `SELECT project, COUNT(*) as cnt FROM mission_telemetry
         WHERE violation_type IS NOT NULL GROUP BY project`,
      )
      .all() as Array<{ project: string; cnt: number }>;
    const byProject: Record<string, number> = {};
    for (const r of byProjectRows) byProject[r.project] = r.cnt;

    return { total, byType, byProject };
  }

  close(): void {
    this.db.close();
  }
}
