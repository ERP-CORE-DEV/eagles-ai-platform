import { describe, it, expect, beforeEach } from "vitest";
import { SharedContext } from "../src/teams/shared-context.js";

// ---------------------------------------------------------------------------
// Shared setup
// ---------------------------------------------------------------------------

let ctx: SharedContext;

beforeEach(() => {
  ctx = new SharedContext();
});

// ---------------------------------------------------------------------------
// set + get
// ---------------------------------------------------------------------------

describe("set + get", () => {
  it("set_singleEntry_getReturnsCorrectValue", () => {
    ctx.set("architect", "decision", "Use CosmosDB for persistence");

    expect(ctx.get("architect", "decision")).toBe("Use CosmosDB for persistence");
  });

  it("set_duplicateKey_replacesExistingEntry", () => {
    ctx.set("architect", "decision", "Use CosmosDB");
    ctx.set("architect", "decision", "Use PostgreSQL");

    expect(ctx.get("architect", "decision")).toBe("Use PostgreSQL");
    // Only one entry should exist — not two.
    expect(ctx.getByAgent("architect")).toHaveLength(1);
  });

  it("get_missingAgent_returnsUndefined", () => {
    expect(ctx.get("nonexistent", "key")).toBeUndefined();
  });

  it("get_missingKey_returnsUndefined", () => {
    ctx.set("architect", "decision", "Use CosmosDB");

    expect(ctx.get("architect", "unknown-key")).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// getByAgent
// ---------------------------------------------------------------------------

describe("getByAgent", () => {
  it("getByAgent_multipleAgents_returnsOnlyTargetAgentEntries", () => {
    ctx.set("architect", "decision", "CosmosDB");
    ctx.set("architect", "rationale", "Low latency reads");
    ctx.set("engineer", "implementation", "Added CosmosJobRepository");

    const architectEntries = ctx.getByAgent("architect");

    expect(architectEntries).toHaveLength(2);
    expect(architectEntries.every((e) => e.agentName === "architect")).toBe(true);
  });

  it("getByAgent_unknownAgent_returnsEmptyArray", () => {
    ctx.set("architect", "decision", "CosmosDB");

    expect(ctx.getByAgent("nonexistent")).toEqual([]);
  });

  it("getByAgent_returnsEntriesWithCorrectShape", () => {
    ctx.set("engineer", "status", "done");

    const entries = ctx.getByAgent("engineer");

    expect(entries[0]).toMatchObject({
      agentName: "engineer",
      key: "status",
      value: "done",
    });
  });
});

// ---------------------------------------------------------------------------
// getSummary — markdown formatting
// ---------------------------------------------------------------------------

describe("getSummary", () => {
  it("getSummary_emptyContext_returnsEmptyString", () => {
    expect(ctx.getSummary()).toBe("");
  });

  it("getSummary_singleAgent_formatsMarkdownWithAgentHeader", () => {
    ctx.set("architect", "decision", "Use CosmosDB");

    const summary = ctx.getSummary();

    expect(summary).toContain("## Agent: architect");
    expect(summary).toContain("- decision: Use CosmosDB");
  });

  it("getSummary_multipleAgents_includesSeparateSectionsForEach", () => {
    ctx.set("architect", "decision", "Use CosmosDB");
    ctx.set("engineer", "implementation", "CosmosJobRepository added");

    const summary = ctx.getSummary();

    expect(summary).toContain("## Agent: architect");
    expect(summary).toContain("## Agent: engineer");
    expect(summary).toContain("- decision: Use CosmosDB");
    expect(summary).toContain("- implementation: CosmosJobRepository added");
  });

  it("getSummary_valueLongerThanLimit_truncatesWithEllipsis", () => {
    const longValue = "A".repeat(300);
    ctx.set("architect", "notes", longValue);

    const summary = ctx.getSummary(200);

    // Truncated value should end with ellipsis and be at most 201 chars (200 + …)
    expect(summary).toContain("…");
    const line = summary.split("\n").find((l) => l.startsWith("- notes:"))!;
    // The value portion: strip "- notes: " prefix (9 chars)
    const valueInLine = line.slice("- notes: ".length);
    expect(valueInLine.length).toBeLessThanOrEqual(201);
  });

  it("getSummary_valueExactlyAtLimit_doesNotTruncate", () => {
    const exactValue = "B".repeat(200);
    ctx.set("architect", "notes", exactValue);

    const summary = ctx.getSummary(200);

    expect(summary).not.toContain("…");
    expect(summary).toContain(exactValue);
  });

  it("getSummary_defaultMaxChars_uses200", () => {
    const longValue = "C".repeat(201);
    ctx.set("architect", "key", longValue);

    const summary = ctx.getSummary(); // default = 200

    expect(summary).toContain("…");
  });
});

// ---------------------------------------------------------------------------
// clear
// ---------------------------------------------------------------------------

describe("clear", () => {
  it("clear_afterSettingEntries_removesAllEntries", () => {
    ctx.set("architect", "decision", "CosmosDB");
    ctx.set("engineer", "implementation", "done");

    ctx.clear();

    expect(ctx.size()).toBe(0);
    expect(ctx.getSummary()).toBe("");
  });

  it("clear_emptyContext_isIdempotent", () => {
    ctx.clear();

    expect(ctx.size()).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// size
// ---------------------------------------------------------------------------

describe("size", () => {
  it("size_noEntries_returnsZero", () => {
    expect(ctx.size()).toBe(0);
  });

  it("size_multipleAgentsMultipleKeys_returnsTotalEntryCount", () => {
    ctx.set("architect", "decision", "A");
    ctx.set("architect", "rationale", "B");
    ctx.set("engineer", "implementation", "C");

    expect(ctx.size()).toBe(3);
  });

  it("size_duplicateKeyReplaces_doesNotIncrementCount", () => {
    ctx.set("architect", "decision", "first");
    ctx.set("architect", "decision", "second");

    expect(ctx.size()).toBe(1);
  });
});
