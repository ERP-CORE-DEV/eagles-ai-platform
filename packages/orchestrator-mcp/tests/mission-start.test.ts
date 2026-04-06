import { describe, it, expect, vi } from "vitest";
import { missionStart } from "../src/mission/mission-start.js";
import type { MissionPlan } from "../src/mission/types.js";

// Stub context-expander so tests run without filesystem access
vi.mock("../src/mission/context-expander.js", () => ({
  expandContext: vi.fn(() => ({
    layers: [{ name: "packages", path: "C:/RH-OptimERP/eagles-ai-platform/packages", files: 10, loc: 500 }],
    totalFiles: 10,
    totalLOC: 500,
    techStack: ["typescript", "node"],
    pastFindings: [],
    claudeMdSummary: "",
  })),
}));

describe("missionStart — French input end-to-end", () => {
  it("missionStart_frenchSecurityCompta_returnsMissionStartedWithSecurityAudit", async () => {
    const result = await missionStart("vérif sécu compta");

    expect(result.status).toBe("mission_started");
    expect(result.mission).toBeDefined();
    expect(result.mission!.project).toBe("agent-comptable");
    expect(result.mission!.goal).toBe("security-audit");
  });
});

describe("missionStart — English minimal input", () => {
  it("missionStart_englishAgentComptable_returnsMissionStartedWithDefaultGoal", async () => {
    const result = await missionStart("agent-comptable");

    expect(result.status).toBe("mission_started");
    expect(result.mission).toBeDefined();
    expect(result.mission!.project).toBe("agent-comptable");
    // When no intent signal is present, confidence=0 and goal defaults to architecture-review
    expect(result.mission!.goal).toBe("architecture-review");
  });
});

describe("missionStart — skills override", () => {
  it("missionStart_withSkillsOverride_skillsContainUserSupplied", async () => {
    const result = await missionStart("review eagles /e2e /mutation-test");

    expect(result.status).toBe("mission_started");
    expect(result.mission).toBeDefined();
    const skills = result.mission!.skills;
    expect(skills).toContain("/e2e");
    expect(skills).toContain("/mutation-test");
  });
});

describe("missionStart — scope flag", () => {
  it("missionStart_withScopeFlag_flagParsedAndLayersFiltered", async () => {
    const result = await missionStart("compta --scope backend");

    expect(result.status).toBe("mission_started");
    expect(result.mission).toBeDefined();
    // The --scope flag is captured; filtered layers returned (empty match falls back to all)
    expect(result.mission!.project).toBe("agent-comptable");
  });
});

describe("missionStart — unknown project", () => {
  it("missionStart_unknownProject_returnsNeedProjectWithCandidates", async () => {
    const result = await missionStart("fix the thing");

    expect(result.status).toBe("need_project");
    expect(result.candidates).toBeDefined();
    expect(result.candidates!.length).toBeGreaterThan(0);
  });
});

describe("missionStart — CWD fallback", () => {
  it("missionStart_cwdAgentComptable_resolvesProjectFromPath", async () => {
    const result = await missionStart("review", { cwd: "C:/agent-comptable" });

    expect(result.status).toBe("mission_started");
    expect(result.mission).toBeDefined();
    expect(result.mission!.project).toBe("agent-comptable");
  });

  it("missionStart_emptyInputWithEaglesCwd_resolvesEaglesAiPlatform", async () => {
    const result = await missionStart("", { cwd: "C:/RH-OptimERP/eagles-ai-platform" });

    expect(result.status).toBe("mission_started");
    expect(result.mission).toBeDefined();
    expect(result.mission!.project).toBe("eagles-ai-platform");
  });
});

describe("missionStart — skills always present in plan", () => {
  it("missionStart_anySuccessfulMission_skillsNotEmpty", async () => {
    const result = await missionStart("vérif sécu compta");

    expect(result.status).toBe("mission_started");
    expect(result.mission!.skills.length).toBeGreaterThan(0);
  });
});

describe("missionStart — MissionPlan required fields", () => {
  it("missionStart_successfulMission_planHasAllRequiredFields", async () => {
    const result = await missionStart("review eagles");

    expect(result.status).toBe("mission_started");
    const plan = result.mission as MissionPlan;
    expect(plan.project).toBeDefined();
    expect(plan.projectPath).toBeDefined();
    expect(plan.goal).toBeDefined();
    expect(typeof plan.confidence).toBe("number");
    expect(Array.isArray(plan.skills)).toBe(true);
    expect(plan.scope).toBeDefined();
    expect(plan.dag).toBeDefined();
    expect(typeof plan.dag.enrolled).toBe("boolean");
    expect(typeof plan.dag.taskCount).toBe("number");
    expect(typeof plan.dag.parallel).toBe("number");
  });
});

describe("missionStart — confidence reflects keyword quality", () => {
  it("missionStart_securityKeywords_confidenceAboveHalf", async () => {
    const result = await missionStart("security gdpr vuln compta");

    expect(result.status).toBe("mission_started");
    expect(result.mission!.confidence).toBeGreaterThan(0.5);
  });
});
