# ADR-007: The AI-queryable design system

**Date:** 2026-04-13
**Status:** Accepted
**Supersedes:** extends ADR-006 (elite baseline)

## Context

ADR-006 established the elite baseline for the frontend catalog: 138 W3C DTCG tokens, Style Dictionary pipeline, light + dark parity, and the first two production components (Button, StatusBadge). The open question was what shape the catalog would take at scale — a docs site for humans, or something else.

This ADR captures the decision taken during the 2026-04-13 overnight shipment: the catalog is built to be consumed by LLM agents via MCP, not browsed by humans via a docs site.

## The thesis

Design systems today are optimized for humans reading documentation and copy-pasting examples. The primary consumer of new code in 2026 is not a human reading docs — it is an LLM agent scaffolding a dashboard, a form, a workflow. That agent does not scroll through a design system site. It does not care about hero sections, navigation trees, or search UX. It needs:

1. **Structured metadata** — which components exist, what tokens they use, whether they have stories, which category they belong to
2. **Runtime querying** — a way to search the catalog, inspect a single component, and get back JSON
3. **Generation** — a way to request a new component from a locked template with validated inputs
4. **Cross-system context** — a way to answer "how does IBM Carbon represent this?" without leaving the tool

A Storybook static export and a landing page are artifacts for humans who evaluate the catalog. The real surface area is the MCP server.

## Decision

The EAGLES Frontend Catalog ships as **two tightly-coupled packages**:

1. **`@eagles-ai-platform/frontend-catalog`** — the component library, tokens, gate, templates, and Storybook build
2. **`@eagles-ai-platform/frontend-catalog-mcp`** — a stdio MCP server that reads the catalog and exposes 12 tools

The MCP package reads the catalog package at runtime — it does not copy or regenerate data. One source of truth; two consumption surfaces.

## The 12 tools

| Layer | Tool | Responsibility |
|---|---|---|
| Discovery | `catalog_search_pattern` | Fuzzy match over the manifest by free-form query |
| Discovery | `catalog_component_metadata` | Exact lookup: file path, tokens used, story parity |
| Discovery | `catalog_list_tokens` | All 138 W3C tokens, grouped by category |
| Discovery | `catalog_suggest_token` | Semantic role → token path (Levenshtein + keyword) |
| Discovery | `catalog_get_component` | Source code read by name |
| Documentation | `catalog_get_baseline` | BASELINE-L1..L8 markdown lookup |
| Documentation | `catalog_get_adr_decision` | ADR decision lookup by number |
| Enforcement | `catalog_lint_snippet` | Find raw color literals, suggest token replacements |
| Enforcement | `catalog_audit_a11y` | Run the gate's regex pack against an arbitrary snippet |
| Intelligence | `catalog_compare_systems` | Canonicalized comparison across 8 external systems |
| Generation | `catalog_generate_from_spec` | Template substitution from a validated spec |
| Generation | `catalog_token_playground` | Apply token overrides, return diff + regenerated CSS |

The split is intentional: discovery and documentation tools are read-only and fast; enforcement tools reuse the exact regex pack that runs in `scripts/gate.mjs` (same source of truth, no drift); intelligence and generation tools extend the catalog without mutating it.

## Consequences

### Positive

- **Agents scaffold faster.** A Claude Code session can query the catalog in 3 tool calls and have enough metadata to generate a correct page. No manual URL navigation, no screen reading, no guesswork.
- **One source of truth for the gate.** The a11y audit tool reuses the same regex pack that `scripts/gate.mjs` enforces at commit time — an agent cannot bypass the rules by asking a different question.
- **Comparison is cheap.** Ingesting 8 design systems into flat JSON files took 4 parallel sub-agents and ~90 seconds. The canonical map is 20 lines of regex. The tool answers "does Carbon have a DataTable?" in milliseconds.
- **Generation is bounded.** `catalog_generate_from_spec` only accepts specs that match a schema. It refuses names that already exist. It uses locked Handlebars templates. An agent cannot use it to write arbitrary code.

### Negative

- **No visual regression yet.** Chromatic is deferred to Q2 2026. Gate compliance is necessary but not sufficient — a component can pass all static checks and still look wrong. The story count + DarkMode parity rule is the current compensator.
- **Cross-system data is hand-seeded.** The Wave 2B ingestion used training-knowledge seeds rather than live fetches for reliability. Values reflect stable public design systems, but they are point-in-time. A refresh mechanism is needed.
- **No sandbox rendering for `token_playground`.** The tool returns a diff and regenerated CSS, but does not render a component with the override applied. A real iframe sandbox is Q2 work.
- **The canonical map is small (26 components, 15 tokens).** Coverage will need to grow as more systems are ingested. The regex-based approach will need to be replaced with embeddings once the set exceeds ~100 canonical entries.

### Risks we accept

- **Drift between the gate and the audit tool.** Both enforce the same regex pack today. If the gate's patterns change without the audit tool being updated, agents would see a different ruleset than commits. Mitigation: both live in the same repo and the MCP server's test suite should snapshot against `gate.mjs` patterns (Q2 work).
- **Hallucinated component names in `catalog_generate_from_spec`.** An agent could request `name: "Buttton"` and the tool would happily generate files. Mitigation: the regex `^[A-Z][A-Za-z0-9]+$` constrains the shape, and the tool rejects duplicates against the manifest. Fuzzy-matching the name against the manifest to catch typos is Q2 work.

## Alternatives considered

### Docs site (Docusaurus/Storybook-only)

Rejected. A docs site is for humans. It does not help an LLM scaffold. Ship Storybook as an artifact on the landing page, but do not make it the primary surface.

### Embeddings-based component search (pgvector/hnsw)

Considered for `catalog_search_pattern`. Rejected for v1 in favor of inline Levenshtein + keyword match because the catalog only has 48 components. Embeddings become interesting at ~500 components. When we cross that threshold we reopen this.

### SQLite for external systems

Considered for the cross-system ingestion. Rejected in favor of flat JSON files under `data/systems/` because:
1. Adding `better-sqlite3` as a dep to `frontend-catalog-mcp` violated the "no new installs overnight" rule
2. The data is small (<250 KB total across 8 systems)
3. JSON is trivially inspectable from `cat`, `jq`, or a text editor
4. The query patterns we need are filter + group-by, not joins

When the ingested set exceeds ~20 systems or ~10k tokens, SQLite becomes the right answer.

### Separate MCP per concern

Considered splitting the 12 tools into three MCP servers (discovery / enforcement / generation). Rejected: cognitive overhead for users, three connection slots instead of one, and no technical benefit. If tool count exceeds ~30 we reopen.

## References

- ADR-006 — Frontend catalog elite baseline
- `scripts/gate.mjs` — the enforcement gate
- `packages/frontend-catalog-mcp/src/server.ts` — the MCP tool registrations
- `data/systems/*.json` — ingested external design systems
- Landing page — `dist/landing/index.html`
