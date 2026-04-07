---
name: qa-test
description: Run live browser QA tests via Chrome DevTools MCP — smoke, lifecycle, forms, GDPR, API health, console audit, auth guard
agent: qa-tester
user-invocable: true
tags: testing, qa, automation, browser, runtime, dast
---

Run runtime QA tests on the live application using Chrome DevTools MCP.

## Usage

- `/qa-test` — Run all 8 scenarios (full suite)
- `/qa-test smoke` — Smoke test: navigate all 13 pages, check for console errors
- `/qa-test campaign-lifecycle` — Campaign state transitions: Draft→Active→Paused→Active→Completed→Archived
- `/qa-test job-lifecycle` — Job state transitions: Draft→Review→Approved→Published→Closed
- `/qa-test forms` — Submit empty forms, verify validation messages (no crashes)
- `/qa-test gdpr` — GDPR anonymization flow: anonymize PII, verify removal
- `/qa-test api-health` — Network request audit: check for 5xx errors across all pages
- `/qa-test console` — Console audit: categorize errors/warnings per page
- `/qa-test auth` — Auth guard: verify protected routes redirect when unauthenticated

## Prerequisites

1. Frontend running at `http://localhost:3000`
2. Backend running at `http://localhost:5000`
3. Chrome DevTools MCP connected (chrome-devtools server in MCP config)
4. Browser tab open to the application

## Target Scenarios

$ARGUMENTS

If no arguments provided, run all scenarios and produce a full QA report.
