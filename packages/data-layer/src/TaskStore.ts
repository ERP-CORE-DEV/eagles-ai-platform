import Database from "better-sqlite3";
import { randomUUID } from "node:crypto";

export type TaskStatus = "pending" | "assigned" | "running" | "completed" | "failed";
export type TaskPriority = "urgent" | "high" | "normal" | "low";

export interface StoredTask {
  readonly taskId: string;
  readonly name: string;
  readonly description: string;
  readonly dependsOn: readonly string[];
  readonly requiredCapabilities: readonly string[];
  readonly priority: TaskPriority;
  readonly status: TaskStatus;
  readonly assignedAgent: string | null;
  readonly result: string | null;
  readonly createdAt: string;
  readonly completedAt: string | null;
}

interface TaskRow {
  task_id: string;
  name: string;
  description: string;
  depends_on: string;
  required_capabilities: string;
  priority: string;
  status: string;
  assigned_agent: string | null;
  result: string | null;
  created_at: string;
  completed_at: string | null;
}

function rowToTask(row: TaskRow): StoredTask {
  return {
    taskId: row.task_id,
    name: row.name,
    description: row.description,
    dependsOn: JSON.parse(row.depends_on) as string[],
    requiredCapabilities: JSON.parse(row.required_capabilities) as string[],
    priority: row.priority as TaskPriority,
    status: row.status as TaskStatus,
    assignedAgent: row.assigned_agent,
    result: row.result,
    createdAt: row.created_at,
    completedAt: row.completed_at,
  };
}

export class TaskStore {
  private readonly db: Database.Database;

  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.db.pragma("journal_mode = WAL");
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS tasks (
        task_id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        depends_on TEXT NOT NULL DEFAULT '[]',
        required_capabilities TEXT NOT NULL DEFAULT '[]',
        priority TEXT NOT NULL DEFAULT 'normal',
        status TEXT NOT NULL DEFAULT 'pending',
        assigned_agent TEXT,
        result TEXT,
        created_at TEXT NOT NULL,
        completed_at TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_task_status ON tasks(status);
      CREATE INDEX IF NOT EXISTS idx_task_priority ON tasks(priority);
    `);
  }

  create(params: {
    name: string;
    description?: string;
    dependsOn?: string[];
    requiredCapabilities?: string[];
    priority?: TaskPriority;
  }): StoredTask {
    const taskId = randomUUID();
    const now = new Date().toISOString();

    this.db.prepare(`
      INSERT INTO tasks (task_id, name, description, depends_on, required_capabilities, priority, status, created_at)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)
    `).run(
      taskId,
      params.name,
      params.description ?? "",
      JSON.stringify(params.dependsOn ?? []),
      JSON.stringify(params.requiredCapabilities ?? []),
      params.priority ?? "normal",
      now,
    );

    return {
      taskId,
      name: params.name,
      description: params.description ?? "",
      dependsOn: params.dependsOn ?? [],
      requiredCapabilities: params.requiredCapabilities ?? [],
      priority: params.priority ?? "normal",
      status: "pending",
      assignedAgent: null,
      result: null,
      createdAt: now,
      completedAt: null,
    };
  }

  get(taskId: string): StoredTask | null {
    const row = this.db.prepare(
      "SELECT * FROM tasks WHERE task_id = ?",
    ).get(taskId) as TaskRow | undefined;
    return row ? rowToTask(row) : null;
  }

  getReady(): StoredTask[] {
    const pending = this.db.prepare(
      "SELECT * FROM tasks WHERE status = 'pending'",
    ).all() as TaskRow[];

    return pending
      .map(rowToTask)
      .filter((task) => {
        if (task.dependsOn.length === 0) return true;
        return task.dependsOn.every((depId) => {
          const dep = this.get(depId);
          return dep !== null && dep.status === "completed";
        });
      });
  }

  assign(taskId: string, agentId: string): StoredTask {
    const existing = this.get(taskId);
    if (existing === null) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.db.prepare(
      "UPDATE tasks SET status = 'assigned', assigned_agent = ? WHERE task_id = ?",
    ).run(agentId, taskId);

    return { ...existing, status: "assigned", assignedAgent: agentId };
  }

  start(taskId: string): StoredTask {
    const existing = this.get(taskId);
    if (existing === null) {
      throw new Error(`Task not found: ${taskId}`);
    }

    this.db.prepare(
      "UPDATE tasks SET status = 'running' WHERE task_id = ?",
    ).run(taskId);

    return { ...existing, status: "running" };
  }

  complete(taskId: string, result: string): StoredTask {
    const existing = this.get(taskId);
    if (existing === null) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const now = new Date().toISOString();
    this.db.prepare(
      "UPDATE tasks SET status = 'completed', result = ?, completed_at = ? WHERE task_id = ?",
    ).run(result, now, taskId);

    return { ...existing, status: "completed", result, completedAt: now };
  }

  fail(taskId: string, reason: string): StoredTask {
    const existing = this.get(taskId);
    if (existing === null) {
      throw new Error(`Task not found: ${taskId}`);
    }

    const now = new Date().toISOString();
    this.db.prepare(
      "UPDATE tasks SET status = 'failed', result = ?, completed_at = ? WHERE task_id = ?",
    ).run(reason, now, taskId);

    return { ...existing, status: "failed", result: reason, completedAt: now };
  }

  list(): StoredTask[] {
    const rows = this.db.prepare("SELECT * FROM tasks").all() as TaskRow[];
    return rows.map(rowToTask);
  }

  getByStatus(status: TaskStatus): StoredTask[] {
    const rows = this.db.prepare(
      "SELECT * FROM tasks WHERE status = ?",
    ).all(status) as TaskRow[];
    return rows.map(rowToTask);
  }

  count(): number {
    const row = this.db.prepare(
      "SELECT COUNT(*) as cnt FROM tasks",
    ).get() as { cnt: number };
    return row.cnt;
  }

  close(): void {
    this.db.close();
  }
}
