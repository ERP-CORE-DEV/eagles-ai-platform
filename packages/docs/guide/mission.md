# Mission — Natural Language to Structured Execution

## What is /mission?

`/mission` is the orchestrator's natural-language entry point. You type a free-form instruction — in English or French — and the 6-layer pipeline converts it into a `MissionPlan`: a resolved project name, a classified goal, a context snapshot, and an ordered skill bundle ready for DAG execution. There is no need to know skill names, project paths, or flag syntax in advance; the pipeline infers all of that from the words you provide.

## Quick Examples

```
/mission agent-comptable
```
No action verb — defaults to `architecture-review` on the `agent-comptable` project.
Skills: `/architect-review`, `/code-review`, `/security-scan`, `/update-docs`

---

```
/mission vérif sécu compta
```
`vérif` → `review`, `sécu` → `security`, `compta` → `agent-comptable`.
Intent: `security-audit` (outscores `architecture-review` on the security signal set).
Skills: `/security-scan`, `/gdpr-check`, `/gitleaks`, `/semgrep-scan`

---

```
/mission fix broken tests --scope backend
```
`fix` + `broken` → `bug-fix`. `--scope backend` narrows the context layers to files whose
layer name contains `"backend"`.
Skills: `/diagnose`, `/build-fix`, `/tdd`

---

```
/mission eagles /e2e /mutation-test
```
`eagles` → `eagles-ai-platform`, no action keyword → `architecture-review` (confidence 0).
`/e2e` and `/mutation-test` are **forced skills**: they are appended to whatever the goal
bundle selects, so the final skill list is `/architect-review`, `/code-review`,
`/security-scan`, `/update-docs`, `/e2e`, `/mutation-test`.

## How It Works — 6-Layer Pipeline

```
Input string
    │
    ▼
1. Normalizer          strip stopwords, expand aliases (French/English), extract /skills and --flags
    │
    ▼
2. Project Resolver    match keywords against known project aliases → resolve path
    │
    ▼
3. Intent Classifier   score keywords against 9 INTENT_SIGNALS maps → pick highest-confidence Goal
    │
    ▼
4. Context Expander    scan projectPath → ExpandedContext (layers, LOC, tech stack, past findings)
    │                  graceful fallback: returns empty context if context-expander is unavailable
    ▼
5. Skill Selector      GOAL_SKILLS[goal] + any user-supplied /skills (deduplicated)
    │
    ▼
6. MissionPlan         { project, projectPath, goal, confidence, skills, scope, dag }
                       dag.parallel = floor(skills.length / 2)
```

### Layer 1 — Normalizer

Processes input in order:

1. Extracts `/skill-name` tokens (regex `/[\w-]+/g`) into `skills[]`.
2. Extracts `--flag value` pairs (regex `--(\w+)\s+(\S+)`) into `flags{}`.
3. Lowercases and splits remaining text on whitespace.
4. Drops stopwords (combined English + French functional-word set).
5. Resolves aliases: each word is looked up in the `ALIASES` map; if found, the canonical form replaces it.

### Layer 2 — Project Resolver

Matches keywords against a registry of known project names and their aliases. When exactly one project matches, it is resolved along with its filesystem path. When zero or multiple projects match, `/mission` returns `status: "need_project"` with a `candidates` list.

### Layer 3 — Intent Classifier

Each of the 9 `Goal` types has an `INTENT_SIGNALS` array of trigger keywords. The classifier scores `matchCount(keywords, signals) / keywords.length` for each goal and picks the highest scorer.

Tie-breaking rule: `architecture-review` is deprioritized in ties because it uses generic words (`review`, `check`, `scan`) that appear in other domains. A specific goal such as `security-audit` always wins on a tie.

When no keyword scores above 0 and the input is non-empty, `/mission` returns `status: "need_clarification"`.

### Layer 4 — Context Expander

Walks the resolved project path and builds an `ExpandedContext`:

| Field | Description |
|---|---|
| `layers` | Named code layers (backend, frontend, tests, infra, …) with file counts |
| `totalFiles` | Total file count across all layers |
| `totalLOC` | Approximate lines of code |
| `techStack` | Detected technologies (`.csproj`, `package.json`, Helm charts, …) |
| `pastFindings` | Prior finding summaries from SONA learning store |
| `claudeMdSummary` | First section of `CLAUDE.md` if present |

The `--scope` flag filters `layers` by name substring before the context is passed to the skill selector.

### Layer 5 — Skill Selector

```ts
getSkillsForGoal(goal, userSkills)
// → [...GOAL_SKILLS[goal], ...userSkills_not_already_in_bundle]
```

User-supplied `/skill` tokens are always appended; duplicates are silently removed.

### Layer 6 — MissionPlan

The final `MissionPlan` returned by `missionStart()`:

```ts
interface MissionPlan {
  project: string;
  projectPath: string;
  goal: Goal;
  confidence: number;       // 0.0 – 1.0
  skills: string[];         // ordered skill bundle
  scope: ExpandedContext;
  dag: {
    enrolled: true;
    taskCount: number;      // skills.length
    parallel: number;       // floor(skills.length / 2)
  };
}
```

## Goals Table

| Goal | Auto-selected Skills |
|---|---|
| `architecture-review` | `/architect-review` `/code-review` `/security-scan` `/update-docs` |
| `security-audit` | `/security-scan` `/gdpr-check` `/gitleaks` `/semgrep-scan` |
| `test-coverage` | `/tdd` `/e2e` `/test-coverage` `/mutation-test` |
| `bug-fix` | `/diagnose` `/build-fix` `/tdd` |
| `new-feature` | `/plan` `/scaffold` `/tdd` `/e2e` `/code-review` |
| `refactor` | `/refactor-clean` `/code-review` `/test-coverage` |
| `deploy` | `/helm-deploy` `/create-azure-pipeline` `/configure-secrets` |
| `documentation` | `/update-docs` `/architect-review` |
| `onboard` | `/onboard-developer` `/update-docs` `/repo-map` |

## French / English Aliases

The normalizer maps these input words to canonical keywords before any further processing:

| Input | Canonical |
|---|---|
| `vérifier` / `vérif` | `review` |
| `corriger` / `réparer` / `fixer` | `fix` |
| `nettoyer` | `clean` |
| `refactorer` | `refactor` |
| `déployer` / `deployer` | `deploy` |
| `tester` | `test` |
| `documenter` | `docs` |
| `sécurité` / `sécu` | `security` |
| `archi` | `architecture` |
| `comptable` / `compta` | `agent-comptable` |
| `sourcing` / `matching` | `rh-optimerp-sourcing-candidate-attraction` |
| `eagles` / `eaip` / `platform` | `eagles-ai-platform` |
| `pété` / `cassé` / `bug` | `broken` |
| `propre` | `clean` |
| `checker` | `check` |

## Flags

| Flag | Values | Effect |
|---|---|---|
| `--scope` | `backend` `frontend` `cli` `full` | Filters `ExpandedContext.layers` to names that contain the scope string. `full` is a no-op (all layers kept). Layers that do not match are dropped; if none match, all layers are kept as a fallback. |

## When to Use /mission vs Direct Skill Calls

Use `/mission` when:

- You are starting a new task and do not know which skills apply.
- You want the context expander to constrain execution to the relevant layers.
- You want the DAG parallel count set automatically from skill count.
- You are writing in French and want alias resolution handled for you.

Call skills directly (e.g. `/security-scan`, `/tdd`) when:

- You know the exact skills you need and want no inference overhead.
- The project is already resolved from a prior `/mission` call.
- You want to override the standard bundle entirely.
- Confidence from a prior run was low and you want to correct the goal manually.
