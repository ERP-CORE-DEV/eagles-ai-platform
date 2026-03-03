import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { ToolRegistryStore } from "../src/ToolRegistryStore.js";

describe("ToolRegistryStore", () => {
  let store: ToolRegistryStore;

  beforeEach(() => {
    const testDir = mkdtempSync(join(tmpdir(), "tool-registry-store-test-"));
    store = new ToolRegistryStore(join(testDir, "test-tools.sqlite"));
  });

  afterEach(() => {
    store.close();
  });

  describe("register", () => {
    it("should register a tool and return it with defaults", () => {
      const tool = store.register({
        name: "memory_search",
        description: "Search vector memory",
        category: "memory",
        serverName: "vector-memory",
      });

      expect(tool.name).toBe("memory_search");
      expect(tool.description).toBe("Search vector memory");
      expect(tool.category).toBe("memory");
      expect(tool.tags).toEqual([]);
      expect(tool.serverName).toBe("vector-memory");
      expect(tool.inputSchema).toEqual({});
      expect(tool.callCount).toBe(0);
      expect(tool.avgLatencyMs).toBe(0);
      expect(tool.lastCalledAt).toBeNull();
      expect(tool.registeredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should register with tags and schema", () => {
      const tool = store.register({
        name: "drift_report",
        description: "Generate drift report",
        category: "drift",
        tags: ["analysis", "reporting"],
        serverName: "drift-detector",
        inputSchema: { type: "object", properties: { days: { type: "number" } } },
      });

      expect(tool.tags).toEqual(["analysis", "reporting"]);
      expect(tool.inputSchema).toEqual({
        type: "object",
        properties: { days: { type: "number" } },
      });
    });

    it("should increment count", () => {
      expect(store.count()).toBe(0);
      store.register({ name: "t1", description: "d", category: "c", serverName: "s" });
      store.register({ name: "t2", description: "d", category: "c", serverName: "s" });
      expect(store.count()).toBe(2);
    });
  });

  describe("get", () => {
    it("should return null for unknown tool", () => {
      expect(store.get("nonexistent")).toBeNull();
    });

    it("should return registered tool by name", () => {
      store.register({
        name: "token_usage",
        description: "Record token usage",
        category: "cost",
        serverName: "token-tracker",
      });

      const retrieved = store.get("token_usage");
      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe("token_usage");
      expect(retrieved!.category).toBe("cost");
    });
  });

  describe("findByCategory", () => {
    it("should return tools in the same category", () => {
      store.register({ name: "mem_search", description: "d", category: "memory", serverName: "s" });
      store.register({ name: "mem_store", description: "d", category: "memory", serverName: "s" });
      store.register({ name: "drift_check", description: "d", category: "drift", serverName: "s" });

      const memTools = store.findByCategory("memory");
      expect(memTools).toHaveLength(2);
      expect(memTools.map((t) => t.name).sort()).toEqual(["mem_search", "mem_store"]);
    });

    it("should return empty for unknown category", () => {
      expect(store.findByCategory("quantum")).toEqual([]);
    });
  });

  describe("findByTag", () => {
    it("should return tools with matching tag", () => {
      store.register({ name: "t1", description: "d", category: "c", tags: ["fast", "core"], serverName: "s" });
      store.register({ name: "t2", description: "d", category: "c", tags: ["slow"], serverName: "s" });
      store.register({ name: "t3", description: "d", category: "c", tags: ["fast"], serverName: "s" });

      const results = store.findByTag("fast");
      expect(results).toHaveLength(2);
    });

    it("should return empty for unknown tag", () => {
      expect(store.findByTag("nonexistent")).toEqual([]);
    });
  });

  describe("recordCall", () => {
    it("should update call count and running average latency", () => {
      store.register({ name: "tool1", description: "d", category: "c", serverName: "s" });

      store.recordCall("tool1", 100);
      let tool = store.get("tool1");
      expect(tool!.callCount).toBe(1);
      expect(tool!.avgLatencyMs).toBe(100);
      expect(tool!.lastCalledAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);

      store.recordCall("tool1", 200);
      tool = store.get("tool1");
      expect(tool!.callCount).toBe(2);
      expect(tool!.avgLatencyMs).toBe(150);

      store.recordCall("tool1", 300);
      tool = store.get("tool1");
      expect(tool!.callCount).toBe(3);
      expect(tool!.avgLatencyMs).toBeCloseTo(200, 5);
    });

    it("should do nothing for unknown tool", () => {
      store.recordCall("ghost", 100);
      expect(store.count()).toBe(0);
    });
  });

  describe("unregister", () => {
    it("should remove tool and return true", () => {
      store.register({ name: "temp", description: "d", category: "c", serverName: "s" });
      expect(store.unregister("temp")).toBe(true);
      expect(store.get("temp")).toBeNull();
      expect(store.count()).toBe(0);
    });

    it("should return false for unknown tool", () => {
      expect(store.unregister("ghost")).toBe(false);
    });
  });

  describe("list", () => {
    it("should return all registered tools", () => {
      store.register({ name: "t1", description: "d", category: "c", serverName: "s" });
      store.register({ name: "t2", description: "d", category: "c", serverName: "s" });
      store.register({ name: "t3", description: "d", category: "c", serverName: "s" });

      expect(store.list()).toHaveLength(3);
    });
  });
});
