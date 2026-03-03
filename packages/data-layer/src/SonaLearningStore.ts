import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

const EMA_ALPHA = 0.3;
const PRUNE_THRESHOLD = 0.2;
const MIN_ATTEMPTS_FOR_PRUNE = 5;

export interface StoredPattern {
  readonly patternId: string;
  readonly name: string;
  readonly description: string;
  readonly successRate: number;
  readonly totalAttempts: number;
  readonly tags: readonly string[];
  readonly archived: boolean;
  readonly createdAt: string;
  readonly updatedAt: string;
}

interface PatternRow {
  pattern_id: string;
  name: string;
  description: string;
  success_rate: number;
  total_attempts: number;
  tags: string;
  archived: number;
  created_at: string;
  updated_at: string;
}

function rowToPattern(row: PatternRow): StoredPattern {
  return {
    patternId: row.pattern_id,
    name: row.name,
    description: row.description,
    successRate: row.success_rate,
    totalAttempts: row.total_attempts,
    tags: JSON.parse(row.tags) as string[],
    archived: row.archived === 1,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SonaLearningStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS learning_patterns (
        pattern_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        success_rate REAL NOT NULL DEFAULT 0.5,
        total_attempts INTEGER NOT NULL DEFAULT 0,
        tags TEXT NOT NULL DEFAULT '[]',
        archived INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_pattern_archived ON learning_patterns(archived);
      CREATE INDEX IF NOT EXISTS idx_pattern_success ON learning_patterns(success_rate);
    `);
  }

  store(params: {
    name: string;
    description?: string;
    tags?: string[];
  }): StoredPattern {
    const patternId = randomUUID();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO learning_patterns (pattern_id, name, description, success_rate, total_attempts, tags, archived, created_at, updated_at)
      VALUES (?, ?, ?, 0.5, 0, ?, 0, ?, ?)
    `).run(
      patternId,
      params.name,
      params.description ?? "",
      JSON.stringify(params.tags ?? []),
      now,
      now,
    );

    return {
      patternId,
      name: params.name,
      description: params.description ?? "",
      successRate: 0.5,
      totalAttempts: 0,
      tags: params.tags ?? [],
      archived: false,
      createdAt: now,
      updatedAt: now,
    };
  }

  recordOutcome(patternId: string, success: boolean): StoredPattern | null {
    const row = this.db.prepare(
      "SELECT * FROM learning_patterns WHERE pattern_id = ?",
    ).get(patternId) as PatternRow | undefined;

    if (!row) return null;

    const outcome = success ? 1 : 0;
    const newSuccessRate = EMA_ALPHA * outcome + (1 - EMA_ALPHA) * row.success_rate;
    const newAttempts = row.total_attempts + 1;
    const shouldArchive = newSuccessRate < PRUNE_THRESHOLD && newAttempts >= MIN_ATTEMPTS_FOR_PRUNE;
    const now = new Date().toISOString();

    this.db.prepare(`
      UPDATE learning_patterns
      SET success_rate = ?, total_attempts = ?, archived = ?, updated_at = ?
      WHERE pattern_id = ?
    `).run(newSuccessRate, newAttempts, shouldArchive ? 1 : 0, now, patternId);

    return {
      ...rowToPattern(row),
      successRate: newSuccessRate,
      totalAttempts: newAttempts,
      archived: shouldArchive,
      updatedAt: now,
    };
  }

  suggest(tags?: string[], limit?: number): StoredPattern[] {
    let rows: PatternRow[];

    if (tags && tags.length > 0) {
      const conditions = tags.map(() => "tags LIKE ?").join(" OR ");
      const params = tags.map((tag) => `%"${tag}"%`);
      rows = this.db.prepare(
        `SELECT * FROM learning_patterns WHERE archived = 0 AND (${conditions}) ORDER BY success_rate DESC`,
      ).all(...params) as PatternRow[];
    } else {
      rows = this.db.prepare(
        "SELECT * FROM learning_patterns WHERE archived = 0 ORDER BY success_rate DESC",
      ).all() as PatternRow[];
    }

    const patterns = rows.map(rowToPattern);
    return limit !== undefined ? patterns.slice(0, limit) : patterns;
  }

  get(patternId: string): StoredPattern | null {
    const row = this.db.prepare(
      "SELECT * FROM learning_patterns WHERE pattern_id = ?",
    ).get(patternId) as PatternRow | undefined;
    return row ? rowToPattern(row) : null;
  }

  list(includeArchived?: boolean): StoredPattern[] {
    const rows = includeArchived
      ? this.db.prepare("SELECT * FROM learning_patterns").all() as PatternRow[]
      : this.db.prepare("SELECT * FROM learning_patterns WHERE archived = 0").all() as PatternRow[];
    return rows.map(rowToPattern);
  }

  prune(): number {
    const result = this.db.prepare(`
      UPDATE learning_patterns
      SET archived = 1, updated_at = ?
      WHERE archived = 0
        AND success_rate < ?
        AND total_attempts >= ?
    `).run(new Date().toISOString(), PRUNE_THRESHOLD, MIN_ATTEMPTS_FOR_PRUNE);
    return result.changes;
  }

  count(): number {
    const row = this.db.prepare(
      "SELECT COUNT(*) as cnt FROM learning_patterns",
    ).get() as { cnt: number };
    return row.cnt;
  }

  close(): void {
    this.db.close();
  }
}
