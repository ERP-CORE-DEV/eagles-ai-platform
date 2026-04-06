import type { ClassifiedIntent, Goal } from "./types.js";

// ---------------------------------------------------------------------------
// Intent signal map — keywords that indicate each goal
// ---------------------------------------------------------------------------

const INTENT_SIGNALS: Record<Goal, string[]> = {
  "architecture-review": [
    "review", "architecture", "archi", "audit", "assess",
    "analyze", "check", "inspect", "evaluate", "survey", "scan",
  ],
  "security-audit": [
    "security", "vuln", "vulnerability", "owasp", "pentest",
    "injection", "xss", "secrets", "credentials", "gdpr", "cnil", "leak",
  ],
  "test-coverage": [
    "test", "coverage", "tdd", "unittest", "e2e", "playwright",
    "pytest", "xunit", "jest", "vitest", "mutation",
  ],
  "bug-fix": [
    "fix", "bug", "broken", "error", "crash", "fail",
    "exception", "issue", "debug", "diagnose",
  ],
  "new-feature": [
    "add", "create", "new", "feature", "implement", "build",
    "scaffold", "generate", "crud",
  ],
  refactor: [
    "refactor", "clean", "reorganize", "restructure", "simplify",
    "dead", "ugly", "messy", "spaghetti", "duplicate",
  ],
  deploy: [
    "deploy", "ship", "release", "pipeline", "ci", "cd",
    "kubernetes", "helm", "docker", "aks",
  ],
  documentation: [
    "doc", "document", "readme", "adr", "diagram", "explain",
  ],
  onboard: [
    "onboard", "setup", "getting", "started", "walkthrough", "tour", "new developer",
  ],
};

// ---------------------------------------------------------------------------
// Goal → skill bundle mapping
// ---------------------------------------------------------------------------

export const GOAL_SKILLS: Record<Goal, string[]> = {
  "architecture-review": ["/architect-review", "/code-review", "/security-scan", "/update-docs"],
  "security-audit": ["/security-scan", "/gdpr-check", "/gitleaks", "/semgrep-scan"],
  "test-coverage": ["/tdd", "/e2e", "/test-coverage", "/mutation-test"],
  "bug-fix": ["/diagnose", "/build-fix", "/tdd"],
  "new-feature": ["/plan", "/scaffold", "/tdd", "/e2e", "/code-review"],
  refactor: ["/refactor-clean", "/code-review", "/test-coverage"],
  deploy: ["/helm-deploy", "/create-azure-pipeline", "/configure-secrets"],
  documentation: ["/update-docs", "/architect-review"],
  onboard: ["/onboard-developer", "/update-docs", "/repo-map"],
};

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Returns true when keyword contains signal OR signal contains keyword
 * (case-insensitive partial match in both directions).
 */
function partialMatch(keyword: string, signal: string): boolean {
  const kw = keyword.toLowerCase();
  const sig = signal.toLowerCase();
  // Exact match
  if (kw === sig) return true;
  // Keyword starts with signal (e.g., "reviewing" matches "review")
  if (kw.startsWith(sig) && sig.length >= 3) return true;
  // Signal starts with keyword (e.g., "test" matches "testing" but NOT "pentest")
  if (sig.startsWith(kw) && kw.length >= 3) return true;
  return false;
}

/**
 * Computes a raw match count for a single goal against a keyword list.
 * Each keyword contributes at most 1 to the count (first signal match wins).
 */
function matchCount(keywords: string[], signals: string[]): number {
  let count = 0;
  for (const keyword of keywords) {
    if (signals.some((signal) => partialMatch(keyword, signal))) {
      count += 1;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Classifies a list of keywords into the most likely mission goal.
 *
 * Scoring: matchCount / keywords.length (capped at 1.0).
 * If no keywords are provided or nothing matches, defaults to
 * "architecture-review" with confidence 0.
 */
export function classifyIntent(keywords: string[]): ClassifiedIntent {
  if (keywords.length === 0) {
    return {
      goal: "architecture-review",
      confidence: 0,
      alternatives: [],
    };
  }

  const goals = Object.keys(INTENT_SIGNALS) as Goal[];

  const scored: [Goal, number][] = goals.map((goal) => {
    const count = matchCount(keywords, INTENT_SIGNALS[goal]);
    const score = Math.min(count / keywords.length, 1.0);
    return [goal, score];
  });

  // Sort descending by score. On tie, prefer specific goals over generic
  // "architecture-review" (which matches common words like "review", "check", "scan").
  scored.sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    // Tie-break: architecture-review is the default/generic — deprioritize it
    if (a[0] === "architecture-review") return 1;
    if (b[0] === "architecture-review") return -1;
    return 0;
  });

  const [[topGoal, topConfidence]] = scored;

  // No matches at all — default to architecture-review with confidence 0
  if (topConfidence === 0) {
    return {
      goal: "architecture-review",
      confidence: 0,
      alternatives: [],
    };
  }

  // Top 2 alternatives (excluding the winner)
  const alternatives: [Goal, number][] = scored
    .slice(1)
    .filter(([, score]) => score > 0)
    .slice(0, 2);

  return {
    goal: topGoal,
    confidence: topConfidence,
    alternatives,
  };
}

/**
 * Returns the skill bundle for a goal, merged with any caller-supplied skills.
 * User skills are always included; duplicates are removed.
 */
export function getSkillsForGoal(goal: Goal, userSkills?: string[]): string[] {
  const base = GOAL_SKILLS[goal];

  if (userSkills === undefined || userSkills.length === 0) {
    return [...base];
  }

  const merged = [...base];
  for (const skill of userSkills) {
    if (!merged.includes(skill)) {
      merged.push(skill);
    }
  }
  return merged;
}
