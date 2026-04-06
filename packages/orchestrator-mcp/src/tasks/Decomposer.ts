/**
 * @fileoverview Deterministic helpers for the coordinator decomposition pattern.
 *
 * These functions are intentionally pure (no I/O, no LLM calls) so that they
 * are cheap to test and easy to reason about.  The LLM orchestration layer
 * (Claude Code) consumes the prompt produced by buildCoordinatorSystemPrompt(),
 * generates a JSON decomposition, then passes that JSON to
 * applyDecomposition() which creates tasks via the DagTaskQueue.
 *
 * Two MCP tools in server.ts expose this surface:
 *   - task_build_decomposition_prompt  → buildCoordinatorSystemPrompt / buildUserPrompt
 *   - task_apply_decomposition         → applyDecomposition
 */

import { randomUUID } from "node:crypto";

// ---------------------------------------------------------------------------
// Public types
// ---------------------------------------------------------------------------

export interface AgentEntry {
  readonly agentId: string;
  readonly name: string;
  readonly capabilities: string[];
  readonly systemPrompt?: string;
}

export interface DecompositionRequest {
  readonly goal: string;
  readonly agentRoster: readonly AgentEntry[];
  readonly maxTasks?: number;
}

export interface TaskSpec {
  readonly title: string;
  readonly description: string;
  readonly assignee: string;
  readonly dependsOn: string[];
  readonly priority?: "low" | "normal" | "high";
}

export interface DecompositionResult {
  readonly tasks: TaskSpec[];
  readonly warnings: string[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const SYSTEM_PROMPT_TRUNCATION_CHARS = 120;
const CREDENTIAL_PATTERN = /\b(api[_-]?key|secret|token|password|auth)[\s:=]+[\w-]{10,}/i;
const DEFAULT_MAX_TASKS = 10;

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

/**
 * Builds the coordinator system prompt for the LLM.
 *
 * Security rules applied before including agent.systemPrompt:
 * 1. Truncated to the first 120 characters.
 * 2. If the (truncated) string matches a credential pattern it is replaced
 *    with "[redacted]".
 *
 * @param request - Decomposition parameters including goal and roster.
 * @returns The system prompt string to feed to the LLM.
 */
export function buildCoordinatorSystemPrompt(request: DecompositionRequest): string {
  const maxTasks = request.maxTasks ?? DEFAULT_MAX_TASKS;

  const rosterLines = request.agentRoster.map((agent) => {
    const capabilitiesStr = agent.capabilities.join(", ");
    let systemPromptNote = "";

    if (agent.systemPrompt !== undefined && agent.systemPrompt.length > 0) {
      const truncated = agent.systemPrompt.slice(0, SYSTEM_PROMPT_TRUNCATION_CHARS);
      const sanitized = CREDENTIAL_PATTERN.test(truncated) ? "[redacted]" : truncated;
      systemPromptNote = `\n    System context: ${sanitized}`;
    }

    return `  - Name: ${agent.name}\n    Capabilities: ${capabilitiesStr}${systemPromptNote}`;
  });

  return [
    "You are a coordinator agent responsible for decomposing a high-level goal into",
    `a set of discrete tasks (maximum ${maxTasks}) that can be assigned to specialist agents.`,
    "",
    "## Available agents",
    ...rosterLines,
    "",
    "## Instructions",
    "Analyse the goal below and produce a JSON array of task specifications.",
    "Each task specification MUST be a JSON object with these fields:",
    '  - "title"       (string)  — short unique name',
    '  - "description" (string)  — detailed work description',
    '  - "assignee"    (string)  — MUST match one of the agent names listed above EXACTLY',
    '  - "dependsOn"   (string[])— titles of tasks that must complete before this one starts',
    '  - "priority"    (string)  — one of "low", "normal", "high" (optional, default "normal")',
    "",
    "Return ONLY a fenced ```json code block containing the array. No prose before or after.",
  ].join("\n");
}

/**
 * Builds the user-turn prompt carrying the actual goal.
 */
export function buildUserPrompt(goal: string): string {
  return `Goal: ${goal}`;
}

// ---------------------------------------------------------------------------
// JSON extraction
// ---------------------------------------------------------------------------

/**
 * Attempts to extract a TaskSpec[] from raw LLM output using a three-tier
 * fallback strategy:
 *
 * 1. Fenced ```json ... ``` block
 * 2. Any fenced ``` ... ``` block
 * 3. First [...] bracket slice in the string
 *
 * @returns Parsed TaskSpec array, or `null` when all strategies fail.
 */
export function parseTaskSpecs(llmOutput: string): TaskSpec[] | null {
  const strategies: Array<() => string | null> = [
    () => {
      const match = /```json\s*([\s\S]*?)```/.exec(llmOutput);
      return match !== null ? (match[1] ?? null) : null;
    },
    () => {
      const match = /```\s*([\s\S]*?)```/.exec(llmOutput);
      return match !== null ? (match[1] ?? null) : null;
    },
    () => {
      const start = llmOutput.indexOf("[");
      const end = llmOutput.lastIndexOf("]");
      if (start === -1 || end <= start) return null;
      return llmOutput.slice(start, end + 1);
    },
  ];

  for (const strategy of strategies) {
    const candidate = strategy();
    if (candidate === null) continue;
    try {
      const parsed: unknown = JSON.parse(candidate);
      if (!Array.isArray(parsed)) continue;
      return parsed as TaskSpec[];
    } catch {
      // try next strategy
    }
  }

  return null;
}

// ---------------------------------------------------------------------------
// Dependency resolution
// ---------------------------------------------------------------------------

/**
 * Assigns each TaskSpec a stable UUID, then resolves title-based dependsOn
 * references to those UUIDs.
 *
 * @returns Map from spec title to resolved taskId array (i.e. the
 *   dependsOn list expressed as IDs rather than titles).
 */
export function resolveDependencyTitlesToIds(
  specs: readonly TaskSpec[],
): Map<string, string[]> {
  // Assign each spec a stable ID keyed by title.
  const titleToId = new Map<string, string>();
  for (const spec of specs) {
    titleToId.set(spec.title, randomUUID());
  }

  const result = new Map<string, string[]>();
  for (const spec of specs) {
    const resolvedDeps: string[] = [];
    for (const depTitle of spec.dependsOn) {
      const depId = titleToId.get(depTitle);
      if (depId !== undefined) {
        resolvedDeps.push(depId);
      }
    }
    result.set(spec.title, resolvedDeps);
  }

  return result;
}

// ---------------------------------------------------------------------------
// Main apply function
// ---------------------------------------------------------------------------

/**
 * Parses raw LLM decomposition JSON and validates it against the agent roster.
 *
 * Applies all guards:
 * - If parsing fails → empty task list with a warning (no silent degradation).
 * - Unknown assignees → per-task warning.
 * - Exceeds maxTasks → truncation with warning.
 *
 * @param decompositionJson - Raw string from the LLM (may contain fences).
 * @param request           - Original decomposition request for guard context.
 * @returns Validated DecompositionResult (tasks + warnings).
 */
export function applyDecomposition(
  decompositionJson: string,
  request: DecompositionRequest,
): DecompositionResult {
  const warnings: string[] = [];
  const maxTasks = request.maxTasks ?? DEFAULT_MAX_TASKS;

  const parsed = parseTaskSpecs(decompositionJson);
  if (parsed === null) {
    warnings.push("decomposition failed to parse LLM output");
    return { tasks: [], warnings };
  }

  let specs = parsed;

  if (specs.length > maxTasks) {
    warnings.push(
      `truncated: LLM returned ${specs.length} tasks, capped to ${maxTasks}`,
    );
    specs = specs.slice(0, maxTasks);
  }

  const knownNames = new Set(request.agentRoster.map((a) => a.name));
  for (const spec of specs) {
    if (!knownNames.has(spec.assignee)) {
      warnings.push(`unknown assignee: ${spec.assignee}`);
    }
  }

  return { tasks: specs, warnings };
}
