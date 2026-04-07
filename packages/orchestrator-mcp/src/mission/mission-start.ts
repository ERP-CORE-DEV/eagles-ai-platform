import { normalize } from "./normalizer.js";
import { resolveProject } from "./project-resolver.js";
import { classifyIntent, getSkillsForGoal } from "./intent-classifier.js";
import type { MissionPlan, ExpandedContext } from "./types.js";

export interface MissionStartResult {
  status: "mission_started" | "need_project" | "need_clarification";
  mission?: MissionPlan;
  message: string;
  candidates?: string[];
}

const MINIMAL_CONTEXT: ExpandedContext = {
  layers: [],
  totalFiles: 0,
  totalLOC: 0,
  techStack: [],
  pastFindings: [],
  claudeMdSummary: "",
};

async function tryExpandContext(projectPath: string): Promise<ExpandedContext> {
  try {
    const { expandContext } = await import("./context-expander.js");
    return await expandContext(projectPath);
  } catch {
    return { ...MINIMAL_CONTEXT };
  }
}

function filterLayersByScope(context: ExpandedContext, scope: string): ExpandedContext {
  const filtered = context.layers.filter((layer) =>
    layer.name.toLowerCase().includes(scope.toLowerCase()),
  );
  return {
    ...context,
    layers: filtered.length > 0 ? filtered : context.layers,
  };
}

export async function missionStart(
  input: string,
  options?: { cwd?: string },
): Promise<MissionStartResult> {
  const normalized = normalize(input);
  const { keywords, skills: userSkills, flags } = normalized;

  // Step 1: Resolve project
  const resolved = resolveProject(keywords, options?.cwd);

  if (!resolved.resolved) {
    return {
      status: "need_project",
      candidates: resolved.candidates,
      message: `Which project? Cannot determine project from input "${input}". Available: ${(resolved.candidates ?? []).join(", ")}`,
    };
  }

  const projectName = resolved.name;
  const projectPath = resolved.path;

  // Step 2: Classify intent — exclude project-alias keywords to avoid
  // "review" in "vérif sécu compta" skewing toward architecture-review
  // when "sécu" clearly signals security-audit.
  const nonProjectKeywords = keywords.filter((kw) => kw !== projectName);
  const classified = classifyIntent(nonProjectKeywords);
  const { goal, confidence } = classified;
  if (confidence < 0.1 && nonProjectKeywords.length > 0) {
    return {
      status: "need_clarification",
      message: `Could not determine goal from: ${nonProjectKeywords.join(", ")}. Please be more specific (e.g., "review", "fix", "test", "deploy").`,
    };
  }

  // Step 3: Expand context (graceful fallback if context-expander unavailable)
  let scope = await tryExpandContext(projectPath);

  // Step 4: Apply scope flag if present
  if (flags["scope"] !== undefined) {
    scope = filterLayersByScope(scope, flags["scope"]);
  }

  // Step 5: Select skills (goal bundle + user-supplied skills)
  const skills = getSkillsForGoal(goal, userSkills);

  // Step 6: Build MissionPlan
  const mission: MissionPlan = {
    project: projectName,
    projectPath,
    goal,
    confidence,
    skills,
    scope,
    dag: {
      enrolled: true,
      taskCount: skills.length,
      parallel: Math.max(1, Math.floor(skills.length / 2)),
    },
  };

  // Step 7: Dynamic scope guard — works for ANY goal, ANY project, ANY context
  const scopeGuard = [
    `SCOPE RULE: This is a [${goal}] mission on [${projectName}].`,
    `Stay on scope. If the user reports issues unrelated to [${goal}]:`,
    `- Log them to docs/BUGS-TO-FIX-LATER.md`,
    `- Do NOT switch to debugging or fixing unrelated issues`,
    `- Continue the [${goal}] mission`,
    `- Do NOT ask "What's your priority?" — the mission defines the priority`,
    `- Execute remaining tasks in the order defined by the context documents (RFC, ADR, CLAUDE.md)`,
  ].join("\n");

  return {
    status: "mission_started",
    mission,
    message: `Mission started: [${goal}] on ${projectName} with ${skills.length} skills (confidence: ${confidence.toFixed(2)})\n\n${scopeGuard}`,
  };
}
