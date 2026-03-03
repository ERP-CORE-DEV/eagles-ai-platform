import Database from "better-sqlite3";

export interface StoredTool {
  readonly name: string;
  readonly description: string;
  readonly category: string;
  readonly tags: readonly string[];
  readonly serverName: string;
  readonly inputSchema: Record<string, unknown>;
  readonly registeredAt: string;
  readonly callCount: number;
  readonly avgLatencyMs: number;
  readonly lastCalledAt: string | null;
}

interface ToolRow {
  name: string;
  description: string;
  category: string;
  tags: string;
  server_name: string;
  input_schema: string;
  registered_at: string;
  call_count: number;
  avg_latency_ms: number;
  last_called_at: string | null;
}

function rowToTool(row: ToolRow): StoredTool {
  return {
    name: row.name,
    description: row.description,
    category: row.category,
    tags: JSON.parse(row.tags) as string[],
    serverName: row.server_name,
    inputSchema: JSON.parse(row.input_schema) as Record<string, unknown>,
    registeredAt: row.registered_at,
    callCount: row.call_count,
    avgLatencyMs: row.avg_latency_ms,
    lastCalledAt: row.last_called_at,
  };
}

export class ToolRegistryStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tools (
        name TEXT PRIMARY KEY,
        description TEXT NOT NULL DEFAULT '',
        category TEXT NOT NULL DEFAULT '',
        tags TEXT NOT NULL DEFAULT '[]',
        server_name TEXT NOT NULL DEFAULT '',
        input_schema TEXT NOT NULL DEFAULT '{}',
        registered_at TEXT NOT NULL,
        call_count INTEGER NOT NULL DEFAULT 0,
        avg_latency_ms REAL NOT NULL DEFAULT 0,
        last_called_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_tool_category ON tools(category);
      CREATE INDEX IF NOT EXISTS idx_tool_server ON tools(server_name);
    `);
  }

  register(params: {
    name: string;
    description: string;
    category: string;
    tags?: readonly string[];
    serverName: string;
    inputSchema?: Record<string, unknown>;
  }): StoredTool {
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO tools (name, description, category, tags, server_name, input_schema, registered_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      params.name,
      params.description,
      params.category,
      JSON.stringify(params.tags ?? []),
      params.serverName,
      JSON.stringify(params.inputSchema ?? {}),
      now,
    );

    return {
      name: params.name,
      description: params.description,
      category: params.category,
      tags: params.tags ?? [],
      serverName: params.serverName,
      inputSchema: params.inputSchema ?? {},
      registeredAt: now,
      callCount: 0,
      avgLatencyMs: 0,
      lastCalledAt: null,
    };
  }

  get(name: string): StoredTool | null {
    const row = this.db.prepare(
      "SELECT * FROM tools WHERE name = ?",
    ).get(name) as ToolRow | undefined;
    return row ? rowToTool(row) : null;
  }

  findByCategory(category: string): StoredTool[] {
    const rows = this.db.prepare(
      "SELECT * FROM tools WHERE category = ?",
    ).all(category) as ToolRow[];
    return rows.map(rowToTool);
  }

  findByTag(tag: string): StoredTool[] {
    const rows = this.db.prepare(
      "SELECT * FROM tools WHERE tags LIKE ?",
    ).all(`%"${tag}"%`) as ToolRow[];
    return rows.map(rowToTool);
  }

  recordCall(name: string, latencyMs: number): void {
    const row = this.db.prepare(
      "SELECT call_count, avg_latency_ms FROM tools WHERE name = ?",
    ).get(name) as { call_count: number; avg_latency_ms: number } | undefined;

    if (!row) return;

    const newCallCount = row.call_count + 1;
    const newAvgLatency = row.avg_latency_ms + (latencyMs - row.avg_latency_ms) / newCallCount;
    const now = new Date().toISOString();

    this.db.prepare(
      "UPDATE tools SET call_count = ?, avg_latency_ms = ?, last_called_at = ? WHERE name = ?",
    ).run(newCallCount, newAvgLatency, now, name);
  }

  list(): StoredTool[] {
    const rows = this.db.prepare("SELECT * FROM tools").all() as ToolRow[];
    return rows.map(rowToTool);
  }

  unregister(name: string): boolean {
    const result = this.db.prepare(
      "DELETE FROM tools WHERE name = ?",
    ).run(name);
    return result.changes > 0;
  }

  count(): number {
    const row = this.db.prepare(
      "SELECT COUNT(*) as cnt FROM tools",
    ).get() as { cnt: number };
    return row.cnt;
  }

  close(): void {
    this.db.close();
  }
}
