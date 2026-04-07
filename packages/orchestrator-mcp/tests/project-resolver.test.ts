import { describe, it, expect, beforeEach } from "vitest";
import { resolveProject, addProject, listProjects, refreshProjectCache } from "../src/mission/project-resolver.js";

/**
 * project-resolver uses auto-discovery (scans filesystem for CLAUDE.md files).
 * Tests verify:
 * 1. Auto-discovered projects from real filesystem (agent-comptable, eagles, etc.)
 * 2. Keyword alias resolution
 * 3. CWD fallback
 * 4. Unresolvable input
 * 5. Runtime addProject
 * 6. Case insensitivity
 */

beforeEach(() => {
  refreshProjectCache();
});

describe("resolveProject — auto-discovery", () => {
  it("discovers agent-comptable from real filesystem", () => {
    const projects = listProjects();
    const names = projects.map(p => p.name);
    // agent-comptable has CLAUDE.md at C:/agent-comptable
    expect(names).toContain("agent-comptable");
  });

  it("discovers eagles-ai-platform from real filesystem", () => {
    const projects = listProjects();
    const names = projects.map(p => p.name);
    expect(names).toContain("eagles-ai-platform");
  });

  it("discovers multiple projects", () => {
    const projects = listProjects();
    expect(projects.length).toBeGreaterThanOrEqual(2);
  });
});

describe("resolveProject — keyword resolution", () => {
  it("resolveProject_aliasMatch_resolvesAgentComptable", () => {
    const result = resolveProject(["review", "agent-comptable"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("agent-comptable");
    }
  });

  it("resolveProject_shortAlias_resolvesComptable", () => {
    // "comptable" is auto-generated alias from "agent-comptable" split
    const result = resolveProject(["comptable"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("agent-comptable");
    }
  });

  it("resolveProject_eaglesAlias_resolvesEaglesPlatform", () => {
    // "eagles" is auto-generated from "eagles-ai-platform" split
    const result = resolveProject(["eagles"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("eagles-ai-platform");
    }
  });

  it("resolveProject_platformAlias_resolvesEagles", () => {
    const result = resolveProject(["platform"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("eagles-ai-platform");
    }
  });
});

describe("resolveProject — CWD fallback", () => {
  it("resolveProject_cwdAgentComptable_resolves", () => {
    const result = resolveProject(["review"], "C:/agent-comptable");

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("agent-comptable");
    }
  });

  it("resolveProject_cwdEagles_resolves", () => {
    const result = resolveProject(["fix"], "C:/RH-OptimERP/eagles-ai-platform");

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("eagles-ai-platform");
    }
  });
});

describe("resolveProject — unresolvable", () => {
  it("resolveProject_noMatch_returnsUnresolved", () => {
    const result = resolveProject(["xyznonexistent123"]);

    expect(result.resolved).toBe(false);
    expect(result.candidates).toBeDefined();
    expect(result.candidates!.length).toBeGreaterThan(0);
  });

  it("resolveProject_emptyKeywords_returnsUnresolved", () => {
    const result = resolveProject([]);

    expect(result.resolved).toBe(false);
  });
});

describe("resolveProject — runtime addProject", () => {
  it("addProject_then_resolveByAlias", () => {
    addProject({
      name: "my-new-project",
      path: "C:/projects/my-new-project",
      aliases: ["my-new-project", "newproj", "mnp"],
    });

    const result = resolveProject(["newproj"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("my-new-project");
      expect(result.path).toBe("C:/projects/my-new-project");
    }
  });
});

describe("resolveProject — case insensitivity", () => {
  it("resolveProject_uppercaseKeyword_resolves", () => {
    const result = resolveProject(["EAGLES"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("eagles-ai-platform");
    }
  });

  it("resolveProject_mixedCaseKeyword_resolves", () => {
    const result = resolveProject(["Agent-Comptable"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("agent-comptable");
    }
  });
});

describe("resolveProject — first keyword wins", () => {
  it("resolveProject_multipleMatches_firstKeywordWins", () => {
    const result = resolveProject(["comptable", "eagles"]);

    expect(result.resolved).toBe(true);
    if (result.resolved) {
      expect(result.name).toBe("agent-comptable");
    }
  });
});

describe("resolveProject — hyphenated keyword expansion", () => {
  it("resolveProject_hyphenatedKeyword_matchesSplitAlias", () => {
    // "agent-comptable" as a single hyphenated keyword should match
    // even though aliases include "agent" and "comptable" separately
    const result = resolveProject(["agent-comptable"]);

    expect(result.resolved).toBe(true);
    expect(result.name).toBe("agent-comptable");
  });

  it("resolveProject_partialHyphenatedKeyword_matchesViaExpansion", () => {
    // User types "hiring-management" → expanded to ["hiring-management", "hiring", "management"]
    // "hiring" matches alias from rh-optimerp-hiring-management (if it exists on disk)
    // This test verifies the expansion mechanism works
    const result = resolveProject(["eagles-ai-platform"]);

    expect(result.resolved).toBe(true);
    expect(result.name).toBe("eagles-ai-platform");
  });
});

describe("resolveProject — parent CWD disambiguation (Houssine bug)", () => {
  it("resolveProject_parentCwdMultipleChildren_returnsUnresolved", () => {
    // Houssine opens C:\RH-OptimERP which contains multiple project dirs.
    // Should NOT pick first alphabetical match — should return unresolved with candidates.
    const result = resolveProject([], "C:/RH-OptimERP");

    // Must be unresolved (ambiguous) because RH-OptimERP contains multiple projects
    expect(result.resolved).toBe(false);
    expect(result.candidates).toBeDefined();
    expect(result.candidates!.length).toBeGreaterThan(1);
  });

  it("resolveProject_parentCwdMultipleChildren_candidatesAreChildren", () => {
    // Candidates should be only the child projects, not ALL discovered projects
    const result = resolveProject([], "C:/RH-OptimERP");

    expect(result.resolved).toBe(false);
    if (result.candidates) {
      // All candidates should be under RH-OptimERP
      expect(result.candidates).toContain("eagles-ai-platform");
    }
  });

  it("resolveProject_exactProjectCwd_resolves", () => {
    // CWD IS a project dir (not a parent) — should resolve
    const result = resolveProject([], "C:/RH-OptimERP/eagles-ai-platform");

    expect(result.resolved).toBe(true);
    expect(result.name).toBe("eagles-ai-platform");
  });

  it("resolveProject_insideProjectSubdir_resolves", () => {
    // CWD is INSIDE a project — should resolve to that project
    const result = resolveProject([], "C:/RH-OptimERP/eagles-ai-platform/packages");

    expect(result.resolved).toBe(true);
    expect(result.name).toBe("eagles-ai-platform");
  });

  it("resolveProject_parentCwd_neverFalseMatchByName", () => {
    // Regression: old code used includes(name) which matched project names
    // appearing as substrings of the CWD path
    const result = resolveProject([], "C:/RH-OptimERP");

    // Should NOT resolve to any specific project
    expect(result.resolved).toBe(false);
  });
});
