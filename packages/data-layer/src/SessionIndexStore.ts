import Database from "better-sqlite3";
import { createReadStream } from "node:fs";
import { createInterface } from "node:readline";

export interface SessionIndexEntry {
  sessionId: string;
  projectName: string;
  projectPath: string;
  sessionDate: string;
  messageCount: number;
  userMessageCount: number;
  filePath: string;
  fileSizeBytes: number;
  keywords: string[];
  suppliersMentioned: string[];
  toolsUsed: string[];
  categories: Record<string, number>;
  summary: string;
  indexedAt: string;
}

export interface ExtractedMessage {
  role: string;
  content: string;
  category?: string;
}

interface SearchOptions {
  project?: string;
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  limit?: number;
}

interface ExtractOptions {
  role?: string;
  categories?: string[];
}

interface RawSessionRow {
  session_id: string;
  project_name: string;
  project_path: string;
  session_date: string;
  message_count: number;
  user_message_count: number;
  file_path: string;
  file_size_bytes: number;
  keywords: string;
  suppliers_mentioned: string;
  tools_used: string;
  categories: string;
  summary: string;
  indexed_at: string;
}

interface StatsRow {
  total_sessions: number;
  min_date: string | null;
  max_date: string | null;
}

interface ProjectRow {
  project_name: string;
}

export class SessionIndexStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS session_index (
        session_id TEXT PRIMARY KEY,
        project_name TEXT NOT NULL,
        project_path TEXT NOT NULL,
        session_date TEXT NOT NULL,
        message_count INTEGER NOT NULL DEFAULT 0,
        user_message_count INTEGER NOT NULL DEFAULT 0,
        file_path TEXT NOT NULL,
        file_size_bytes INTEGER NOT NULL DEFAULT 0,
        keywords TEXT NOT NULL DEFAULT '[]',
        suppliers_mentioned TEXT NOT NULL DEFAULT '[]',
        tools_used TEXT NOT NULL DEFAULT '[]',
        categories TEXT NOT NULL DEFAULT '{}',
        summary TEXT NOT NULL DEFAULT '',
        indexed_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_session_project ON session_index(project_name);
      CREATE INDEX IF NOT EXISTS idx_session_date ON session_index(session_date);
    `);
  }

  upsert(entry: SessionIndexEntry): void {
    this.db.prepare(`
      INSERT INTO session_index (
        session_id, project_name, project_path, session_date,
        message_count, user_message_count, file_path, file_size_bytes,
        keywords, suppliers_mentioned, tools_used, categories,
        summary, indexed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(session_id) DO UPDATE SET
        project_name = excluded.project_name,
        project_path = excluded.project_path,
        session_date = excluded.session_date,
        message_count = excluded.message_count,
        user_message_count = excluded.user_message_count,
        file_path = excluded.file_path,
        file_size_bytes = excluded.file_size_bytes,
        keywords = excluded.keywords,
        suppliers_mentioned = excluded.suppliers_mentioned,
        tools_used = excluded.tools_used,
        categories = excluded.categories,
        summary = excluded.summary,
        indexed_at = excluded.indexed_at
    `).run(
      entry.sessionId,
      entry.projectName,
      entry.projectPath,
      entry.sessionDate,
      entry.messageCount,
      entry.userMessageCount,
      entry.filePath,
      entry.fileSizeBytes,
      JSON.stringify(entry.keywords),
      JSON.stringify(entry.suppliersMentioned),
      JSON.stringify(entry.toolsUsed),
      JSON.stringify(entry.categories),
      entry.summary,
      entry.indexedAt,
    );
  }

  search(opts: SearchOptions): SessionIndexEntry[] {
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    const limit = opts.limit ?? 50;

    if (opts.project !== undefined) {
      conditions.push("project_name = ?");
      params.push(opts.project);
    }

    if (opts.keyword !== undefined) {
      conditions.push("keywords LIKE ?");
      params.push(`%${opts.keyword}%`);
    }

    if (opts.dateFrom !== undefined) {
      conditions.push("session_date >= ?");
      params.push(opts.dateFrom);
    }

    if (opts.dateTo !== undefined) {
      conditions.push("session_date <= ?");
      params.push(opts.dateTo);
    }

    const where = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
    const sql = `SELECT * FROM session_index ${where} ORDER BY session_date DESC LIMIT ?`;
    params.push(limit);

    const rows = this.db.prepare(sql).all(...params) as RawSessionRow[];
    return rows.map((row) => this.rowToEntry(row));
  }

  async extract(sessionId: string, opts: ExtractOptions): Promise<ExtractedMessage[]> {
    const row = this.db.prepare(
      "SELECT file_path FROM session_index WHERE session_id = ?",
    ).get(sessionId) as { file_path: string } | undefined;

    if (row === undefined) {
      return [];
    }

    const messages = await this.readJsonlFile(row.file_path);
    let filtered = messages;

    if (opts.role !== undefined) {
      const targetRole = opts.role;
      filtered = filtered.filter((m) => m.role === targetRole);
    }

    if (opts.categories !== undefined && opts.categories.length > 0) {
      const targetCategories = new Set(opts.categories);
      filtered = filtered.filter(
        (m) => m.category !== undefined && targetCategories.has(m.category),
      );
    }

    return filtered;
  }

  getStats(): { totalSessions: number; projects: string[]; dateRange: [string, string] } {
    const statsRow = this.db.prepare(
      "SELECT COUNT(*) as total_sessions, MIN(session_date) as min_date, MAX(session_date) as max_date FROM session_index",
    ).get() as StatsRow;

    const projectRows = this.db.prepare(
      "SELECT DISTINCT project_name FROM session_index ORDER BY project_name ASC",
    ).all() as ProjectRow[];

    return {
      totalSessions: statsRow.total_sessions,
      projects: projectRows.map((r) => r.project_name),
      dateRange: [statsRow.min_date ?? "", statsRow.max_date ?? ""],
    };
  }

  deleteSession(sessionId: string): void {
    this.db.prepare("DELETE FROM session_index WHERE session_id = ?").run(sessionId);
  }

  private rowToEntry(row: RawSessionRow): SessionIndexEntry {
    return {
      sessionId: row.session_id,
      projectName: row.project_name,
      projectPath: row.project_path,
      sessionDate: row.session_date,
      messageCount: row.message_count,
      userMessageCount: row.user_message_count,
      filePath: row.file_path,
      fileSizeBytes: row.file_size_bytes,
      keywords: JSON.parse(row.keywords) as string[],
      suppliersMentioned: JSON.parse(row.suppliers_mentioned) as string[],
      toolsUsed: JSON.parse(row.tools_used) as string[],
      categories: JSON.parse(row.categories) as Record<string, number>,
      summary: row.summary,
      indexedAt: row.indexed_at,
    };
  }

  private async readJsonlFile(filePath: string): Promise<ExtractedMessage[]> {
    const messages: ExtractedMessage[] = [];

    const stream = createReadStream(filePath, { encoding: "utf8" });
    const rl = createInterface({ input: stream, crlfDelay: Infinity });

    for await (const line of rl) {
      const trimmed = line.trim();
      if (trimmed.length === 0) continue;
      try {
        const parsed = JSON.parse(trimmed) as Partial<ExtractedMessage>;
        if (typeof parsed.role === "string" && typeof parsed.content === "string") {
          messages.push({
            role: parsed.role,
            content: parsed.content,
            category: typeof parsed.category === "string" ? parsed.category : undefined,
          });
        }
      } catch {
        // skip malformed lines
      }
    }

    return messages;
  }

  close(): void {
    this.db.close();
  }
}
