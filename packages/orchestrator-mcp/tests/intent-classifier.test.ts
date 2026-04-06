import { describe, it, expect } from "vitest";
import { classifyIntent, getSkillsForGoal } from "../src/mission/intent-classifier.js";

// ---------------------------------------------------------------------------
// classifyIntent
// ---------------------------------------------------------------------------

describe("classifyIntent", () => {
  it("classifyIntent_architectureKeywords_returnsArchitectureReviewWithHighConfidence", () => {
    const result = classifyIntent(["review", "architecture"]);

    expect(result.goal).toBe("architecture-review");
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it("classifyIntent_securityKeywords_returnsSecurityAuditWithHighConfidence", () => {
    const result = classifyIntent(["security", "gdpr", "check"]);

    expect(result.goal).toBe("security-audit");
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it("classifyIntent_bugFixKeywords_returnsBugFixWithHighConfidence", () => {
    const result = classifyIntent(["fix", "broken", "crash"]);

    expect(result.goal).toBe("bug-fix");
    expect(result.confidence).toBeGreaterThanOrEqual(0.5);
  });

  it("classifyIntent_singleKeywordClean_returnsRefactor", () => {
    const result = classifyIntent(["clean"]);

    expect(result.goal).toBe("refactor");
  });

  it("classifyIntent_singleKeywordTest_returnsTestCoverage", () => {
    const result = classifyIntent(["test"]);

    expect(result.goal).toBe("test-coverage");
  });

  it("classifyIntent_singleKeywordDeploy_returnsDeploy", () => {
    const result = classifyIntent(["deploy"]);

    expect(result.goal).toBe("deploy");
  });

  it("classifyIntent_emptyKeywords_returnsArchitectureReviewWithZeroConfidence", () => {
    const result = classifyIntent([]);

    expect(result.goal).toBe("architecture-review");
    expect(result.confidence).toBe(0);
  });

  it("classifyIntent_mixedSignals_returnsAlternativesArrayWithAtLeastOneEntry", () => {
    const result = classifyIntent(["review", "security"]);

    expect(Array.isArray(result.alternatives)).toBe(true);
    expect(result.alternatives.length).toBeGreaterThanOrEqual(1);
  });

  it("classifyIntent_partialKeyword_reviewingMatchesReviewSignal", () => {
    const result = classifyIntent(["reviewing"]);

    expect(result.goal).toBe("architecture-review");
  });

  it("classifyIntent_noMatchingKeywords_defaultsToArchitectureReviewWithZeroConfidence", () => {
    const result = classifyIntent(["xyzunknownword"]);

    expect(result.goal).toBe("architecture-review");
    expect(result.confidence).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getSkillsForGoal
// ---------------------------------------------------------------------------

describe("getSkillsForGoal", () => {
  it("getSkillsForGoal_securityAuditNoUserSkills_containsSecurityScanAndGdprCheck", () => {
    const skills = getSkillsForGoal("security-audit");

    expect(skills).toContain("/security-scan");
    expect(skills).toContain("/gdpr-check");
  });

  it("getSkillsForGoal_architectureReviewWithUserSkillE2e_containsBothArchitectReviewAndE2e", () => {
    const skills = getSkillsForGoal("architecture-review", ["/e2e"]);

    expect(skills).toContain("/architect-review");
    expect(skills).toContain("/e2e");
  });

  it("getSkillsForGoal_securityAuditWithDuplicateUserSkill_securityScanAppearsOnlyOnce", () => {
    const skills = getSkillsForGoal("security-audit", ["/security-scan"]);

    const occurrences = skills.filter((s) => s === "/security-scan").length;
    expect(occurrences).toBe(1);
  });
});
