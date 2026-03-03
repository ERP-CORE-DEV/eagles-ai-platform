import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { TaskStore } from "../src/TaskStore.js";

describe("TaskStore", () => {
  let store: TaskStore;

  beforeEach(() => {
    const testDir = mkdtempSync(join(tmpdir(), "task-store-test-"));
    store = new TaskStore(join(testDir, "test-tasks.sqlite"));
  });

  afterEach(() => {
    store.close();
  });

  describe("create", () => {
    it("should create a task with defaults", () => {
      const task = store.create({ name: "build-frontend" });

      expect(task.taskId).toBeDefined();
      expect(task.name).toBe("build-frontend");
      expect(task.description).toBe("");
      expect(task.dependsOn).toEqual([]);
      expect(task.requiredCapabilities).toEqual([]);
      expect(task.priority).toBe("normal");
      expect(task.status).toBe("pending");
      expect(task.assignedAgent).toBeNull();
      expect(task.result).toBeNull();
      expect(task.createdAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      expect(task.completedAt).toBeNull();
    });

    it("should create a task with all params", () => {
      const task = store.create({
        name: "deploy",
        description: "Deploy to production",
        dependsOn: ["task-1", "task-2"],
        requiredCapabilities: ["k8s", "helm"],
        priority: "urgent",
      });

      expect(task.description).toBe("Deploy to production");
      expect(task.dependsOn).toEqual(["task-1", "task-2"]);
      expect(task.requiredCapabilities).toEqual(["k8s", "helm"]);
      expect(task.priority).toBe("urgent");
    });

    it("should increment count", () => {
      expect(store.count()).toBe(0);
      store.create({ name: "t1" });
      store.create({ name: "t2" });
      expect(store.count()).toBe(2);
    });
  });

  describe("get", () => {
    it("should return null for unknown task", () => {
      expect(store.get("nonexistent")).toBeNull();
    });

    it("should return the task by id", () => {
      const created = store.create({ name: "test-task", description: "desc" });
      const retrieved = store.get(created.taskId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe("test-task");
      expect(retrieved!.description).toBe("desc");
    });
  });

  describe("getReady", () => {
    it("should return pending tasks with no dependencies", () => {
      store.create({ name: "independent" });
      const ready = store.getReady();
      expect(ready).toHaveLength(1);
      expect(ready[0].name).toBe("independent");
    });

    it("should not return tasks with unmet dependencies", () => {
      const t1 = store.create({ name: "step-1" });
      store.create({ name: "step-2", dependsOn: [t1.taskId] });

      const ready = store.getReady();
      expect(ready).toHaveLength(1);
      expect(ready[0].name).toBe("step-1");
    });

    it("should return tasks whose dependencies are completed", () => {
      const t1 = store.create({ name: "step-1" });
      store.create({ name: "step-2", dependsOn: [t1.taskId] });

      store.complete(t1.taskId, "done");

      const ready = store.getReady();
      expect(ready).toHaveLength(1);
      expect(ready[0].name).toBe("step-2");
    });
  });

  describe("assign", () => {
    it("should assign an agent to a task", () => {
      const task = store.create({ name: "review" });
      const assigned = store.assign(task.taskId, "agent-1");

      expect(assigned.status).toBe("assigned");
      expect(assigned.assignedAgent).toBe("agent-1");
    });

    it("should throw for unknown task", () => {
      expect(() => store.assign("ghost", "agent-1")).toThrow("Task not found");
    });
  });

  describe("start", () => {
    it("should set task status to running", () => {
      const task = store.create({ name: "build" });
      const started = store.start(task.taskId);
      expect(started.status).toBe("running");
    });

    it("should throw for unknown task", () => {
      expect(() => store.start("ghost")).toThrow("Task not found");
    });
  });

  describe("complete", () => {
    it("should mark task as completed with result", () => {
      const task = store.create({ name: "analyze" });
      const completed = store.complete(task.taskId, "All checks passed");

      expect(completed.status).toBe("completed");
      expect(completed.result).toBe("All checks passed");
      expect(completed.completedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should throw for unknown task", () => {
      expect(() => store.complete("ghost", "done")).toThrow("Task not found");
    });
  });

  describe("fail", () => {
    it("should mark task as failed with reason", () => {
      const task = store.create({ name: "deploy" });
      const failed = store.fail(task.taskId, "Connection timeout");

      expect(failed.status).toBe("failed");
      expect(failed.result).toBe("Connection timeout");
      expect(failed.completedAt).not.toBeNull();
    });

    it("should throw for unknown task", () => {
      expect(() => store.fail("ghost", "reason")).toThrow("Task not found");
    });
  });

  describe("getByStatus", () => {
    it("should filter tasks by status", () => {
      const t1 = store.create({ name: "t1" });
      store.create({ name: "t2" });
      store.complete(t1.taskId, "done");

      expect(store.getByStatus("pending")).toHaveLength(1);
      expect(store.getByStatus("completed")).toHaveLength(1);
      expect(store.getByStatus("failed")).toHaveLength(0);
    });
  });

  describe("list", () => {
    it("should return all tasks", () => {
      store.create({ name: "t1" });
      store.create({ name: "t2" });
      store.create({ name: "t3" });

      expect(store.list()).toHaveLength(3);
    });
  });
});
