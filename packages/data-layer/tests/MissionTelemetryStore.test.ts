import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { MissionTelemetryStore } from "../src/MissionTelemetryStore.js";

describe("MissionTelemetryStore", () => {
  let store: MissionTelemetryStore;

  beforeEach(() => {
    const testDir = mkdtempSync(join(tmpdir(), "mission-telemetry-test-"));
    store = new MissionTelemetryStore(join(testDir, "telemetry.sqlite"));
  });

  afterEach(() => {
    store.close();
  });

  describe("recordMissionStart + getLatestSnapshot", () => {
    it("returns null when no snapshot exists for the project", () => {
      expect(store.getLatestSnapshot("unknown")).toBeNull();
    });

    it("stores and reads back the latest snapshot per project", () => {
      store.recordMissionStart({
        project: "proj-a",
        goal: "security-audit",
        confidence: 0.7,
        decompositionSuggested: 5,
      });

      const snap = store.getLatestSnapshot("proj-a");
      expect(snap).not.toBeNull();
      expect(snap?.project).toBe("proj-a");
      expect(snap?.goal).toBe("security-audit");
      expect(snap?.confidence).toBe(0.7);
      expect(snap?.decompositionSuggested).toBe(5);
      expect(snap?.missionId).toMatch(/^[0-9a-f-]{36}$/);
    });

    it("isolates snapshots per project", () => {
      store.recordMissionStart({
        project: "proj-a",
        goal: "refactor",
        confidence: 0.4,
        decompositionSuggested: 3,
      });
      store.recordMissionStart({
        project: "proj-b",
        goal: "test",
        confidence: 0.9,
        decompositionSuggested: 2,
      });

      expect(store.getLatestSnapshot("proj-a")?.goal).toBe("refactor");
      expect(store.getLatestSnapshot("proj-b")?.goal).toBe("test");
    });
  });

  describe("recordViolation + listViolations", () => {
    it("records a violation and surfaces it via listViolations", () => {
      store.recordViolation({
        missionId: "mission-1",
        project: "proj-a",
        goal: "deploy",
        confidence: 0.5,
        taskCountAtCheck: 0,
        decompositionSuggested: 4,
        violationType: "mission_start_without_task_create",
      });

      const violations = store.listViolations();
      expect(violations).toHaveLength(1);
      expect(violations[0]?.violationType).toBe("mission_start_without_task_create");
      expect(violations[0]?.resolved).toBe(false);
    });

    it("filters violations by project", () => {
      store.recordViolation({
        missionId: "m-a",
        project: "proj-a",
        goal: "x",
        confidence: 0,
        taskCountAtCheck: 0,
        decompositionSuggested: 3,
        violationType: "mission_start_without_task_create",
      });
      store.recordViolation({
        missionId: "m-b",
        project: "proj-b",
        goal: "y",
        confidence: 0,
        taskCountAtCheck: 1,
        decompositionSuggested: 5,
        violationType: "mission_start_below_decomposition_threshold",
      });

      expect(store.listViolations({ project: "proj-a" })).toHaveLength(1);
      expect(store.listViolations({ project: "proj-b" })).toHaveLength(1);
    });
  });

  describe("markResolved", () => {
    it("marks a violation resolved and excludes it from unresolved queries", () => {
      store.recordViolation({
        missionId: "m-1",
        project: "proj-a",
        goal: "x",
        confidence: 0,
        taskCountAtCheck: 0,
        decompositionSuggested: 3,
        violationType: "mission_start_without_task_create",
      });

      const changed = store.markResolved("m-1");
      expect(changed).toBe(true);

      expect(store.listViolations({ resolved: false })).toHaveLength(0);
      expect(store.listViolations({ resolved: true })).toHaveLength(1);
    });

    it("returns false when mission_id is unknown", () => {
      expect(store.markResolved("does-not-exist")).toBe(false);
    });
  });

  describe("counters", () => {
    it("returns zero counters for an empty store", () => {
      const c = store.counters();
      expect(c.total).toBe(0);
      expect(c.byType).toEqual({});
      expect(c.byProject).toEqual({});
    });

    it("aggregates by type and by project", () => {
      store.recordViolation({
        missionId: "m1",
        project: "p1",
        goal: "g",
        confidence: 0,
        taskCountAtCheck: 0,
        decompositionSuggested: 2,
        violationType: "mission_start_without_task_create",
      });
      store.recordViolation({
        missionId: "m2",
        project: "p1",
        goal: "g",
        confidence: 0,
        taskCountAtCheck: 1,
        decompositionSuggested: 3,
        violationType: "mission_start_below_decomposition_threshold",
      });
      store.recordViolation({
        missionId: "m3",
        project: "p2",
        goal: "g",
        confidence: 0,
        taskCountAtCheck: 0,
        decompositionSuggested: 2,
        violationType: "mission_start_without_task_create",
      });

      const c = store.counters();
      expect(c.total).toBe(3);
      expect(c.byType["mission_start_without_task_create"]).toBe(2);
      expect(c.byType["mission_start_below_decomposition_threshold"]).toBe(1);
      expect(c.byProject["p1"]).toBe(2);
      expect(c.byProject["p2"]).toBe(1);
    });
  });
});
