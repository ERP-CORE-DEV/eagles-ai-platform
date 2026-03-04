import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { ToolRegistry } from "../src/registry.js";
import { SKILL_CATALOG, TOTAL_SKILL_COUNT } from "../src/skill-catalog.js";
import { validatePrerequisites } from "../src/prerequisites.js";
import { detectCycles, getTopologicalOrder } from "../src/graph.js";
import type { GraphNode } from "../src/graph.js";

describe("tool-registry integration", () => {
  let registry: ToolRegistry;

  beforeEach(() => {
    const testDir = mkdtempSync(join(tmpdir(), "tool-reg-integration-"));
    registry = new ToolRegistry(join(testDir, "skills.sqlite"));
  });

  afterEach(() => {
    registry.close();
  });

  it("register all 62 skills and verify complete catalog", () => {
    for (const skill of SKILL_CATALOG) {
      registry.register({
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tags: skill.tags,
        serverName: skill.serverName,
        inputSchema: {},
      });
    }

    expect(registry.count()).toBe(TOTAL_SKILL_COUNT);
    expect(registry.count()).toBe(62);
  });

  it("category distribution matches expected counts", () => {
    for (const skill of SKILL_CATALOG) {
      registry.register({
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tags: skill.tags,
        serverName: skill.serverName,
        inputSchema: {},
      });
    }

    const database = registry.findByCategory("database");
    const testing = registry.findByCategory("testing");
    const codegen = registry.findByCategory("codegen");
    const deploy = registry.findByCategory("deploy");
    const language = registry.findByCategory("language");
    const iac = registry.findByCategory("iac");

    expect(database.length).toBeGreaterThanOrEqual(10);
    expect(testing.length).toBeGreaterThanOrEqual(8);
    expect(codegen.length).toBeGreaterThanOrEqual(7);
    expect(deploy.length).toBeGreaterThanOrEqual(4);
    expect(language.length).toBeGreaterThanOrEqual(5);
    expect(iac.length).toBeGreaterThanOrEqual(3);
  });

  it("all prerequisite chains are valid (no dangling references)", () => {
    const allNames = new Set(SKILL_CATALOG.map((s) => s.name));
    const danglingRefs: string[] = [];

    for (const skill of SKILL_CATALOG) {
      for (const prereq of skill.prerequisites) {
        if (!allNames.has(prereq)) {
          danglingRefs.push(`${skill.name} → ${prereq}`);
        }
      }
    }

    expect(danglingRefs).toEqual([]);
  });

  it("prerequisite graph has no cycles", () => {
    const nodes: GraphNode[] = SKILL_CATALOG.map((s) => ({
      name: s.name,
      dependencies: [...s.prerequisites],
    }));

    const result = detectCycles(nodes);
    expect(result.hasCycle).toBe(false);
  });

  it("topological order respects all prerequisites", () => {
    const nodes: GraphNode[] = SKILL_CATALOG
      .filter((s) => s.prerequisites.length > 0)
      .map((s) => ({
        name: s.name,
        dependencies: [...s.prerequisites],
      }));

    // Add nodes that are only prerequisites (no deps themselves)
    const allPrereqs = new Set(SKILL_CATALOG.flatMap((s) => [...s.prerequisites]));
    for (const prereq of allPrereqs) {
      if (!nodes.some((n) => n.name === prereq)) {
        nodes.push({ name: prereq, dependencies: [] });
      }
    }

    const order = getTopologicalOrder(nodes);

    // Verify all prerequisites come before dependents
    for (const skill of SKILL_CATALOG) {
      if (skill.prerequisites.length === 0) continue;
      const skillIdx = order.indexOf(skill.name);
      if (skillIdx === -1) continue;

      for (const prereq of skill.prerequisites) {
        const prereqIdx = order.indexOf(prereq);
        expect(prereqIdx, `${prereq} should come before ${skill.name}`).toBeLessThan(skillIdx);
      }
    }
  });

  it("helm_deploy requires azure_pipeline (AND mode)", () => {
    const helm = SKILL_CATALOG.find((s) => s.name === "helm_deploy")!;

    // Not completed
    const r1 = validatePrerequisites(
      { prerequisites: [...helm.prerequisites], mode: helm.prerequisiteMode },
      new Set(),
    );
    expect(r1.valid).toBe(false);

    // Completed
    const r2 = validatePrerequisites(
      { prerequisites: [...helm.prerequisites], mode: helm.prerequisiteMode },
      new Set(["azure_pipeline"]),
    );
    expect(r2.valid).toBe(true);
  });

  it("cloud deploy skills use OR mode for terraform", () => {
    const cloudDeploys = SKILL_CATALOG.filter(
      (s) => ["aws_deploy", "gcp_deploy", "ibm_deploy"].includes(s.name),
    );

    for (const skill of cloudDeploys) {
      expect(skill.prerequisiteMode).toBe("or");
      expect(skill.prerequisites).toContain("terraform_validate");

      // OR mode: terraform_validate satisfies the prerequisite
      const result = validatePrerequisites(
        { prerequisites: [...skill.prerequisites], mode: skill.prerequisiteMode },
        new Set(["terraform_validate"]),
      );
      expect(result.valid).toBe(true);
    }
  });

  it("recordCall tracks metrics after registration", () => {
    registry.register({
      name: "code_review",
      description: "Code review",
      category: "quality",
      tags: ["review"],
      serverName: "orchestrator-mcp",
      inputSchema: {},
    });

    registry.recordCall("code_review", 150);
    registry.recordCall("code_review", 250);
    registry.recordCall("code_review", 200);

    const tool = registry.get("code_review");
    expect(tool!.metadata.callCount).toBe(3);
    expect(tool!.metadata.avgLatencyMs).toBeCloseTo(200, 0);
    expect(tool!.metadata.lastCalledAt).not.toBeNull();
  });

  it("unregister removes skill and decrements count", () => {
    for (const skill of SKILL_CATALOG.slice(0, 5)) {
      registry.register({
        name: skill.name,
        description: skill.description,
        category: skill.category,
        tags: skill.tags,
        serverName: skill.serverName,
        inputSchema: {},
      });
    }

    expect(registry.count()).toBe(5);

    const removed = registry.unregister(SKILL_CATALOG[0].name);
    expect(removed).toBe(true);
    expect(registry.count()).toBe(4);
    expect(registry.get(SKILL_CATALOG[0].name)).toBeNull();
  });
});
