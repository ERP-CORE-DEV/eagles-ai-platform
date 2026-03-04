# ADR-001: Monorepo Structure

**Status:** Accepted
**Date:** 2026-03-02

## Context

EAGLES Classic uses flat NPM workspaces with individual `npm install` per MCP. Three new MCPs share types, constants, and a data layer. Building them as separate standalone packages would duplicate code and create version drift.

## Decision

Build the platform as a **pnpm monorepo** with 10 packages: 7 MCP servers, 2 shared libraries (shared-utils, data-layer), and 1 skills catalog (tool-registry).

Key choices:
- **pnpm** over npm/yarn: Strict hoisting, `workspace:*` protocol, fast on Windows
- **Vitest** workspace mode: Parallel test execution across all packages
- **tsup** for builds: esbuild-based, handles shebang banners for CLI entry points

## Consequences

- **Positive**: Single `pnpm build` for all, typed inter-MCP contracts, Vitest workspace runs tests in parallel, CI enforces build order.
- **Negative**: pnpm workspace adds toolchain complexity. Team must install pnpm.
- **Neutral**: EAGLES Classic is never modified.
