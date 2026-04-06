import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { SessionIndexStore } from "../src/SessionIndexStore.js";
import type { SessionIndexEntry } from "../src/SessionIndexStore.js";

function makeTempDir(): string {
  return mkdtempSync(join(tmpdir(), "session-index-test-"));
}

function makeEntry(overrides: Partial<SessionIndexEntry> = {}): SessionIndexEntry {
  return {
    sessionId: "session-001",
    projectName: "rh-optimerp",
    projectPath: "/projects/rh-optimerp",
    sessionDate: "2026-04-01",
    messageCount: 10,
    userMessageCount: 5,
    filePath: "/sessions/session-001.jsonl",
    fileSizeBytes: 1024,
    keywords: ["matching", "scoring", "gdpr"],
    suppliersMentioned: ["Azure", "CosmosDB"],
    toolsUsed: ["Read", "Write", "Bash"],
    categories: { FEATURE: 3, BUG: 2 },
    summary: "Working on candidate matching engine scoring improvements.",
    indexedAt: new Date().toISOString(),
    ...overrides,
  };
}

function writeJsonlFile(dir: string, name: string, messages: object[]): string {
  const filePath = join(dir, name);
  const content = messages.map((m) => JSON.stringify(m)).join("\n");
  writeFileSync(filePath, content, "utf8");
  return filePath;
}

describe("SessionIndexStore", () => {
  let store: SessionIndexStore;
  let tempDir: string;

  beforeEach(() => {
    tempDir = makeTempDir();
    store = new SessionIndexStore(join(tempDir, "session-index.sqlite"));
  });

  afterEach(() => {
    store.close();
    // Note: skip rmSync on Windows — WAL/SHM files stay locked after close
  });

  it("upsert_andSearchByProject_findsCorrectSession", () => {
    const entry = makeEntry({ sessionId: "sess-proj-1", projectName: "eagles-platform" });
    store.upsert(entry);

    const results = store.search({ project: "eagles-platform" });

    expect(results).toHaveLength(1);
    expect(results[0].sessionId).toBe("sess-proj-1");
    expect(results[0].projectName).toBe("eagles-platform");
    expect(results[0].keywords).toEqual(["matching", "scoring", "gdpr"]);
    expect(results[0].categories).toEqual({ FEATURE: 3, BUG: 2 });
  });

  it("search_byKeyword_partialMatchWorks", () => {
    store.upsert(makeEntry({ sessionId: "sess-kw-1", keywords: ["matching", "scoring"] }));
    store.upsert(makeEntry({ sessionId: "sess-kw-2", keywords: ["billing", "invoice"] }));

    const results = store.search({ keyword: "scoring" });

    expect(results).toHaveLength(1);
    expect(results[0].sessionId).toBe("sess-kw-1");
  });

  it("search_byDateRange_filtersCorrectly", () => {
    store.upsert(makeEntry({ sessionId: "sess-date-old", sessionDate: "2026-01-15" }));
    store.upsert(makeEntry({ sessionId: "sess-date-mid", sessionDate: "2026-03-01" }));
    store.upsert(makeEntry({ sessionId: "sess-date-new", sessionDate: "2026-04-05" }));

    const results = store.search({ dateFrom: "2026-02-01", dateTo: "2026-03-31" });

    expect(results).toHaveLength(1);
    expect(results[0].sessionId).toBe("sess-date-mid");
  });

  it("extract_withRoleUser_returnsOnlyUserMessages", async () => {
    const filePath = writeJsonlFile(tempDir, "session-role.jsonl", [
      { role: "user", content: "How does scoring work?" },
      { role: "assistant", content: "Scoring works by computing a weighted average." },
      { role: "user", content: "Can you show me the algorithm?" },
      { role: "tool", content: "Read tool output here." },
    ]);

    store.upsert(makeEntry({ sessionId: "sess-role-1", filePath }));

    const messages = await store.extract("sess-role-1", { role: "user" });

    expect(messages).toHaveLength(2);
    expect(messages.every((m) => m.role === "user")).toBe(true);
    expect(messages[0].content).toBe("How does scoring work?");
    expect(messages[1].content).toBe("Can you show me the algorithm?");
  });

  it("extract_withCategoriesBug_returnsOnlyBugMessages", async () => {
    const filePath = writeJsonlFile(tempDir, "session-category.jsonl", [
      { role: "user", content: "The salary matching is off.", category: "BUG" },
      { role: "user", content: "Add RNCP support.", category: "FEATURE" },
      { role: "assistant", content: "I will fix the salary logic.", category: "BUG" },
      { role: "user", content: "Fix the null pointer in scoring.", category: "BUG" },
    ]);

    store.upsert(makeEntry({ sessionId: "sess-cat-1", filePath }));

    const messages = await store.extract("sess-cat-1", { categories: ["BUG"] });

    expect(messages).toHaveLength(3);
    expect(messages.every((m) => m.category === "BUG")).toBe(true);
  });

  it("getStats_returnsCorrectTotals", () => {
    store.upsert(makeEntry({ sessionId: "s1", projectName: "proj-a", sessionDate: "2026-01-01" }));
    store.upsert(makeEntry({ sessionId: "s2", projectName: "proj-b", sessionDate: "2026-03-15" }));
    store.upsert(makeEntry({ sessionId: "s3", projectName: "proj-a", sessionDate: "2026-04-01" }));

    const stats = store.getStats();

    expect(stats.totalSessions).toBe(3);
    expect(stats.projects).toContain("proj-a");
    expect(stats.projects).toContain("proj-b");
    expect(stats.projects).toHaveLength(2);
    expect(stats.dateRange[0]).toBe("2026-01-01");
    expect(stats.dateRange[1]).toBe("2026-04-01");
  });

  it("upsert_samSessionIdTwice_updatesNotDuplicates", () => {
    store.upsert(makeEntry({ sessionId: "sess-dup", messageCount: 5, summary: "First version" }));
    store.upsert(makeEntry({ sessionId: "sess-dup", messageCount: 12, summary: "Updated version" }));

    const results = store.search({ project: "rh-optimerp" });
    const match = results.filter((r) => r.sessionId === "sess-dup");

    expect(match).toHaveLength(1);
    expect(match[0].messageCount).toBe(12);
    expect(match[0].summary).toBe("Updated version");
  });

  it("search_withNoResults_returnsEmptyArray", () => {
    store.upsert(makeEntry({ sessionId: "sess-exists", projectName: "known-project" }));

    const results = store.search({ project: "nonexistent-project" });

    expect(results).toEqual([]);
  });

  it("extract_forUnknownSessionId_returnsEmptyArray", async () => {
    const messages = await store.extract("nonexistent-session-id", { role: "user" });
    expect(messages).toEqual([]);
  });
});
