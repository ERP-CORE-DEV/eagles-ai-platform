import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

export type AgentStatus = "idle" | "busy" | "offline";

export interface StoredAgent {
  readonly agentId: string;
  readonly name: string;
  readonly capabilities: readonly string[];
  readonly tags: readonly string[];
  readonly status: AgentStatus;
  readonly lastHeartbeat: string;
  readonly registeredAt: string;
  readonly metadata: Record<string, unknown>;
}

interface AgentRow {
  agent_id: string;
  name: string;
  capabilities: string;
  tags: string;
  status: string;
  metadata: string;
  last_heartbeat: string;
  registered_at: string;
}

function rowToAgent(row: AgentRow): StoredAgent {
  return {
    agentId: row.agent_id,
    name: row.name,
    capabilities: JSON.parse(row.capabilities) as string[],
    tags: JSON.parse(row.tags) as string[],
    status: row.status as AgentStatus,
    metadata: JSON.parse(row.metadata) as Record<string, unknown>,
    lastHeartbeat: row.last_heartbeat,
    registeredAt: row.registered_at,
  };
}

export class AgentRegistryStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS agents (
        agent_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        capabilities TEXT NOT NULL DEFAULT '[]',
        tags TEXT NOT NULL DEFAULT '[]',
        status TEXT NOT NULL DEFAULT 'idle',
        metadata TEXT NOT NULL DEFAULT '{}',
        last_heartbeat TEXT NOT NULL,
        registered_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_agent_status ON agents(status);
      CREATE INDEX IF NOT EXISTS idx_agent_heartbeat ON agents(last_heartbeat);
    `);
  }

  register(params: {
    agentId?: string;
    name: string;
    capabilities?: readonly string[];
    tags?: readonly string[];
    metadata?: Record<string, unknown>;
  }): StoredAgent {
    const now = new Date().toISOString();
    const agentId = params.agentId ?? randomUUID();

    this.db.prepare(`
      INSERT INTO agents (agent_id, name, capabilities, tags, status, metadata, last_heartbeat, registered_at)
      VALUES (?, ?, ?, ?, 'idle', ?, ?, ?)
    `).run(
      agentId,
      params.name,
      JSON.stringify(params.capabilities ?? []),
      JSON.stringify(params.tags ?? []),
      JSON.stringify(params.metadata ?? {}),
      now,
      now,
    );

    return {
      agentId,
      name: params.name,
      capabilities: params.capabilities ?? [],
      tags: params.tags ?? [],
      status: "idle",
      metadata: params.metadata ?? {},
      lastHeartbeat: now,
      registeredAt: now,
    };
  }

  get(agentId: string): StoredAgent | null {
    const row = this.db.prepare(
      "SELECT * FROM agents WHERE agent_id = ?",
    ).get(agentId) as AgentRow | undefined;
    return row ? rowToAgent(row) : null;
  }

  findByCapability(capability: string): StoredAgent[] {
    const rows = this.db.prepare(
      "SELECT * FROM agents WHERE capabilities LIKE ?",
    ).all(`%"${capability}"%`) as AgentRow[];
    return rows.map(rowToAgent);
  }

  findByTag(tag: string): StoredAgent[] {
    const rows = this.db.prepare(
      "SELECT * FROM agents WHERE tags LIKE ?",
    ).all(`%"${tag}"%`) as AgentRow[];
    return rows.map(rowToAgent);
  }

  findByStatus(status: AgentStatus): StoredAgent[] {
    const rows = this.db.prepare(
      "SELECT * FROM agents WHERE status = ?",
    ).all(status) as AgentRow[];
    return rows.map(rowToAgent);
  }

  list(): StoredAgent[] {
    const rows = this.db.prepare("SELECT * FROM agents").all() as AgentRow[];
    return rows.map(rowToAgent);
  }

  unregister(agentId: string): boolean {
    const result = this.db.prepare(
      "DELETE FROM agents WHERE agent_id = ?",
    ).run(agentId);
    return result.changes > 0;
  }

  updateStatus(agentId: string, status: AgentStatus): void {
    this.db.prepare(
      "UPDATE agents SET status = ? WHERE agent_id = ?",
    ).run(status, agentId);
  }

  recordHeartbeat(agentId: string): void {
    this.db.prepare(
      "UPDATE agents SET last_heartbeat = ? WHERE agent_id = ?",
    ).run(new Date().toISOString(), agentId);
  }

  count(): number {
    const row = this.db.prepare(
      "SELECT COUNT(*) as cnt FROM agents",
    ).get() as { cnt: number };
    return row.cnt;
  }

  close(): void {
    this.db.close();
  }
}
