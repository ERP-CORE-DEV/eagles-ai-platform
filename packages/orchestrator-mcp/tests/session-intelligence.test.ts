import { describe, it, expect, beforeEach } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { mkdtempSync, writeFileSync, mkdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { SessionIndexStore } from "@eagles-ai-platform/data-layer";
import { createOrchestratorServer } from "../src/server.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const FIXTURE_JSONL = join(__dirname, "fixtures", "test-session.jsonl");

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "session-test-"));
}

async function makeClient(dbDir: string): Promise<Client> {
  const server = createOrchestratorServer(dbDir);
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await server.connect(serverTransport);
  const client = new Client({ name: "session-test", version: "1.0.0" });
  await client.connect(clientTransport);
  return client;
}

function parseResult(result: Awaited<ReturnType<Client["callTool"]>>): unknown {
  const content = result.content as Array<{ type: string; text: string }>;
  return JSON.parse(content[0].text);
}

function insertTestSession(
  dbDir: string,
  overrides: Partial<{
    sessionId: string;
    projectName: string;
    sessionDate: string;
    keywords: string[];
    summary: string;
    filePath: string;
  }> = {},
): void {
  const store = new SessionIndexStore(join(dbDir, "session-index.sqlite"));
  store.upsert({
    sessionId: overrides.sessionId ?? "session-abc-123",
    projectName: overrides.projectName ?? "rh-optimerp",
    projectPath: "/projects/rh-optimerp",
    sessionDate: overrides.sessionDate ?? "2026-03-15",
    messageCount: 3,
    userMessageCount: 2,
    filePath: overrides.filePath ?? FIXTURE_JSONL,
    fileSizeBytes: 512,
    keywords: overrides.keywords ?? ["qonto", "supplier"],
    suppliersMentioned: ["qonto"],
    toolsUsed: [],
    categories: { SUPPLIER: 1 },
    summary: overrides.summary ?? "Checked qonto supplier status and found login broken",
    indexedAt: new Date().toISOString(),
  });
  store.close();
}

describe("session_search", () => {
  let client: Client;
  let dbDir: string;

  beforeEach(async () => {
    dbDir = makeTempDir();
    client = await makeClient(dbDir);
  });

  it("session_search with no index DB returns empty array gracefully", async () => {
    // dbDir has no session-index.sqlite — tool must not throw
    const result = await client.callTool({
      name: "session_search",
      arguments: {},
    });
    const data = parseResult(result) as { sessions: unknown[]; total: number };

    expect(data.sessions).toEqual([]);
    expect(data.total).toBe(0);
  });

  it("session_search by project returns matching sessions", async () => {
    insertTestSession(dbDir, { projectName: "rh-optimerp" });
    insertTestSession(dbDir, {
      sessionId: "session-other-999",
      projectName: "eagles-platform",
      sessionDate: "2026-03-10",
    });

    const result = await client.callTool({
      name: "session_search",
      arguments: { project: "rh-optimerp" },
    });
    const data = parseResult(result) as {
      sessions: Array<{ session_id: string; project_name: string }>;
      total: number;
    };

    expect(data.total).toBe(1);
    expect(data.sessions[0].session_id).toBe("session-abc-123");
    expect(data.sessions[0].project_name).toBe("rh-optimerp");
  });

  it("session_search by keyword returns partial keyword match", async () => {
    insertTestSession(dbDir, { keywords: ["qonto", "invoice", "download"] });
    insertTestSession(dbDir, {
      sessionId: "session-nomatch-001",
      projectName: "eagles-platform",
      sessionDate: "2026-02-01",
      keywords: ["deployment", "helm"],
    });

    const result = await client.callTool({
      name: "session_search",
      arguments: { keyword: "qonto" },
    });
    const data = parseResult(result) as {
      sessions: Array<{ session_id: string }>;
      total: number;
    };

    expect(data.total).toBe(1);
    expect(data.sessions[0].session_id).toBe("session-abc-123");
  });
});

describe("session_extract", () => {
  let client: Client;
  let dbDir: string;

  beforeEach(async () => {
    dbDir = makeTempDir();
    client = await makeClient(dbDir);
  });

  it("session_extract with mock JSONL returns filtered user messages", async () => {
    insertTestSession(dbDir, { filePath: FIXTURE_JSONL });

    const result = await client.callTool({
      name: "session_extract",
      arguments: { sessionId: "session-abc-123", role: "user" },
    });
    const data = parseResult(result) as {
      messages: Array<{ role: string; text: string }>;
      total: number;
    };

    expect(data.total).toBeGreaterThanOrEqual(2);
    expect(data.messages.every((m) => m.role === "user")).toBe(true);
    expect(data.messages.some((m) => m.text.includes("qonto"))).toBe(true);
  });

  it("session_extract with category filter returns only matching category", async () => {
    insertTestSession(dbDir, { filePath: FIXTURE_JSONL });

    const result = await client.callTool({
      name: "session_extract",
      arguments: {
        sessionId: "session-abc-123",
        role: "all",
        categories: ["SUPPLIER"],
      },
    });
    const data = parseResult(result) as {
      messages: Array<{ role: string; category: string; text: string }>;
      total: number;
    };

    // "qonto" in first user message should be categorized as SUPPLIER
    expect(data.total).toBeGreaterThanOrEqual(1);
    expect(data.messages.every((m) => m.category === "SUPPLIER")).toBe(true);
  });

  it("session_extract with invalid session_id returns error message", async () => {
    // Create the index DB but with no matching session
    insertTestSession(dbDir, { sessionId: "session-real-001" });

    const result = await client.callTool({
      name: "session_extract",
      arguments: { sessionId: "session-does-not-exist" },
    });
    const data = parseResult(result) as { error?: string };

    expect(data.error).toBeDefined();
    expect(data.error).toContain("not found");
  });

  it("session_extract with role=all returns both user and assistant messages", async () => {
    insertTestSession(dbDir, { filePath: FIXTURE_JSONL });

    const result = await client.callTool({
      name: "session_extract",
      arguments: { sessionId: "session-abc-123", role: "all" },
    });
    const data = parseResult(result) as {
      messages: Array<{ role: string; text: string }>;
      total: number;
    };

    const roles = new Set(data.messages.map((m) => m.role));
    expect(roles.has("user")).toBe(true);
    expect(roles.has("assistant")).toBe(true);
  });

  it("session_extract with BUG category filter matches broken login message", async () => {
    insertTestSession(dbDir, { filePath: FIXTURE_JSONL });

    const result = await client.callTool({
      name: "session_extract",
      arguments: {
        sessionId: "session-abc-123",
        role: "user",
        categories: ["BUG"],
      },
    });
    const data = parseResult(result) as {
      messages: Array<{ role: string; category: string; text: string }>;
      total: number;
    };

    // "broken" and "ko" in third line match BUG
    expect(data.total).toBeGreaterThanOrEqual(1);
    expect(data.messages[0].text).toContain("broken");
  });

  it("session_extract respects maxMessages limit", async () => {
    // Write a larger JSONL with many lines
    const manyLinesPath = join(dbDir, "many-messages.jsonl");
    const lines = Array.from({ length: 20 }, (_, i) =>
      JSON.stringify({
        type: "user",
        message: { role: "user", content: [{ type: "text", text: `message number ${i + 1}` }] },
      }),
    ).join("\n");
    writeFileSync(manyLinesPath, lines + "\n");

    insertTestSession(dbDir, { filePath: manyLinesPath });

    const result = await client.callTool({
      name: "session_extract",
      arguments: { sessionId: "session-abc-123", role: "user", maxMessages: 5 },
    });
    const data = parseResult(result) as {
      messages: Array<{ role: string; text: string }>;
      total: number;
    };

    expect(data.total).toBeLessThanOrEqual(5);
  });
});
