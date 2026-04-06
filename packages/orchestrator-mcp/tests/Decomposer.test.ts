/**
 * Behavioral tests for Decomposer.ts
 *
 * Every assertion targets an observable output of the public functions.
 * No implementation details are inspected — only return values and their
 * structural properties.
 */

import { describe, it, expect } from "vitest";
import {
  buildCoordinatorSystemPrompt,
  parseTaskSpecs,
  resolveDependencyTitlesToIds,
  applyDecomposition,
} from "../src/tasks/Decomposer.js";
import type { DecompositionRequest, TaskSpec } from "../src/tasks/Decomposer.js";

// ---------------------------------------------------------------------------
// Shared fixtures
// ---------------------------------------------------------------------------

function makeRoster() {
  return [
    { agentId: "a1", name: "Reviewer", capabilities: ["code-review", "linting"] },
    { agentId: "a2", name: "Coder", capabilities: ["typescript", "node"] },
    { agentId: "a3", name: "Tester", capabilities: ["unit-testing", "e2e"] },
  ];
}

function makeRequest(overrides: Partial<DecompositionRequest> = {}): DecompositionRequest {
  return {
    goal: "Ship the feature",
    agentRoster: makeRoster(),
    ...overrides,
  };
}

// ---------------------------------------------------------------------------
// buildCoordinatorSystemPrompt — roster inclusion
// ---------------------------------------------------------------------------

describe("buildCoordinatorSystemPrompt includes agent roster", () => {
  it("contains all three agent names", () => {
    const prompt = buildCoordinatorSystemPrompt(makeRequest());

    expect(prompt).toContain("Reviewer");
    expect(prompt).toContain("Coder");
    expect(prompt).toContain("Tester");
  });

  it("contains each agent capabilities", () => {
    const prompt = buildCoordinatorSystemPrompt(makeRequest());

    expect(prompt).toContain("code-review");
    expect(prompt).toContain("typescript");
    expect(prompt).toContain("unit-testing");
  });
});

// ---------------------------------------------------------------------------
// buildCoordinatorSystemPrompt — systemPrompt truncation
// ---------------------------------------------------------------------------

describe("buildCoordinatorSystemPrompt truncates long systemPrompts", () => {
  it("includes only the first 120 characters of a 500-char systemPrompt", () => {
    const longPrompt = "A".repeat(500);
    const request = makeRequest({
      agentRoster: [
        { agentId: "a1", name: "Reviewer", capabilities: ["review"], systemPrompt: longPrompt },
      ],
    });

    const prompt = buildCoordinatorSystemPrompt(request);

    // The first 120 characters of the long prompt should appear.
    expect(prompt).toContain("A".repeat(120));
    // The 121st character and beyond must NOT appear as a contiguous sequence.
    expect(prompt).not.toContain("A".repeat(121));
  });
});

// ---------------------------------------------------------------------------
// buildCoordinatorSystemPrompt — credential redaction
// ---------------------------------------------------------------------------

describe("buildCoordinatorSystemPrompt redacts credentials", () => {
  it("replaces api_key pattern with [redacted]", () => {
    const credentialPrompt = "Use api_key=sk-abc123xyz789 to authenticate";
    const request = makeRequest({
      agentRoster: [
        { agentId: "a1", name: "Coder", capabilities: ["coding"], systemPrompt: credentialPrompt },
      ],
    });

    const prompt = buildCoordinatorSystemPrompt(request);

    expect(prompt).toContain("[redacted]");
    expect(prompt).not.toContain("sk-abc123xyz789");
  });
});

// ---------------------------------------------------------------------------
// parseTaskSpecs — fenced ```json block
// ---------------------------------------------------------------------------

describe("parseTaskSpecs — fenced json block", () => {
  it("returns a TaskSpec array from a fenced ```json block", () => {
    const input = 'Here you go:\n```json\n[{"title":"T1","description":"d","assignee":"A","dependsOn":[]}]\n```';

    const result = parseTaskSpecs(input);

    expect(result).not.toBeNull();
    expect(Array.isArray(result)).toBe(true);
    expect(result!.length).toBe(1);
    expect(result![0]!.title).toBe("T1");
  });
});

// ---------------------------------------------------------------------------
// parseTaskSpecs — bare ``` block
// ---------------------------------------------------------------------------

describe("parseTaskSpecs — bare fence", () => {
  it("returns a valid TaskSpec array from a bare ``` fence", () => {
    const input = '```\n[{"title":"T1","description":"d","assignee":"A","dependsOn":[]}]\n```';

    const result = parseTaskSpecs(input);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0]!.title).toBe("T1");
  });
});

// ---------------------------------------------------------------------------
// parseTaskSpecs — bracket slice
// ---------------------------------------------------------------------------

describe("parseTaskSpecs — bracket slice", () => {
  it("returns a valid TaskSpec array when JSON is embedded in prose", () => {
    const input = 'prefix [{"title":"T1","description":"d","assignee":"A","dependsOn":[]}] suffix';

    const result = parseTaskSpecs(input);

    expect(result).not.toBeNull();
    expect(result!.length).toBe(1);
    expect(result![0]!.title).toBe("T1");
  });
});

// ---------------------------------------------------------------------------
// parseTaskSpecs — unparseable returns null
// ---------------------------------------------------------------------------

describe("parseTaskSpecs — unparseable input", () => {
  it("returns null (not empty array, not undefined) when input has no JSON", () => {
    const result = parseTaskSpecs("no json here at all");

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// resolveDependencyTitlesToIds
// ---------------------------------------------------------------------------

describe("resolveDependencyTitlesToIds", () => {
  it("resolves title-based dependsOn to exactly one ID per dependency", () => {
    const specs: TaskSpec[] = [
      { title: "Design", description: "Design the system", assignee: "Coder", dependsOn: [] },
      { title: "Code", description: "Implement the design", assignee: "Coder", dependsOn: ["Design"] },
    ];

    const resolved = resolveDependencyTitlesToIds(specs);

    const codeResolvedDeps = resolved.get("Code");
    expect(codeResolvedDeps).toBeDefined();
    expect(codeResolvedDeps!.length).toBe(1);

    // The single resolved dep must be a non-empty string (UUID) — not the title itself.
    const dep = codeResolvedDeps![0]!;
    expect(typeof dep).toBe("string");
    expect(dep.length).toBeGreaterThan(0);
    expect(dep).not.toBe("Design");
  });

  it("produces an empty array for a task with no dependsOn", () => {
    const specs: TaskSpec[] = [
      { title: "Design", description: "Design", assignee: "Coder", dependsOn: [] },
    ];

    const resolved = resolveDependencyTitlesToIds(specs);

    expect(resolved.get("Design")).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// Unknown assignee warning
// ---------------------------------------------------------------------------

describe("unknown assignee warning", () => {
  it("emits a warning when an assignee name does not match any roster agent", () => {
    const decompositionJson = JSON.stringify([
      { title: "Ghost work", description: "Do stuff", assignee: "Ghost", dependsOn: [] },
    ]);

    const result = applyDecomposition(decompositionJson, makeRequest());

    expect(result.warnings.some((w) => w.includes("unknown assignee: Ghost"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// maxTasks truncation warning
// ---------------------------------------------------------------------------

describe("maxTasks truncation", () => {
  it("truncates tasks to maxTasks and emits a truncation warning", () => {
    const manySpecs: TaskSpec[] = Array.from({ length: 15 }, (_, i) => ({
      title: `Task-${i + 1}`,
      description: `Description ${i + 1}`,
      assignee: "Coder",
      dependsOn: [],
    }));
    const decompositionJson = JSON.stringify(manySpecs);

    const result = applyDecomposition(decompositionJson, makeRequest({ maxTasks: 10 }));

    expect(result.tasks.length).toBe(10);
    expect(result.warnings.some((w) => w.includes("truncated"))).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// Silent fallback fix — parse failure surfaces as a warning
// ---------------------------------------------------------------------------

describe("silent fallback fix", () => {
  it("returns empty task list with explicit parse-failure warning when LLM output is unparseable", () => {
    const result = applyDecomposition("this is definitely not json", makeRequest());

    expect(result.tasks).toEqual([]);
    expect(
      result.warnings.some((w) => w.includes("decomposition failed to parse LLM output")),
    ).toBe(true);
  });
});
