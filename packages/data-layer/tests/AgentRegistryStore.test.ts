import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { AgentRegistryStore } from "../src/AgentRegistryStore.js";

describe("AgentRegistryStore", () => {
  let store: AgentRegistryStore;

  beforeEach(() => {
    const testDir = mkdtempSync(join(tmpdir(), "agent-registry-test-"));
    store = new AgentRegistryStore(join(testDir, "test-agents.sqlite"));
  });

  afterEach(() => {
    store.close();
  });

  describe("register", () => {
    it("should register an agent and return it with defaults", () => {
      const agent = store.register({ name: "code-reviewer" });

      expect(agent.agentId).toBeDefined();
      expect(agent.name).toBe("code-reviewer");
      expect(agent.capabilities).toEqual([]);
      expect(agent.tags).toEqual([]);
      expect(agent.status).toBe("idle");
      expect(agent.metadata).toEqual({});
      expect(agent.registeredAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
    });

    it("should register with capabilities, tags, and metadata", () => {
      const agent = store.register({
        name: "planner",
        capabilities: ["planning", "estimation"],
        tags: ["core", "v2"],
        metadata: { version: "2.0", maxConcurrency: 3 },
      });

      expect(agent.capabilities).toEqual(["planning", "estimation"]);
      expect(agent.tags).toEqual(["core", "v2"]);
      expect(agent.metadata).toEqual({ version: "2.0", maxConcurrency: 3 });
    });

    it("should use provided agentId when given", () => {
      const agent = store.register({ agentId: "custom-id", name: "test" });
      expect(agent.agentId).toBe("custom-id");
    });

    it("should increment count after registration", () => {
      expect(store.count()).toBe(0);
      store.register({ name: "a1" });
      store.register({ name: "a2" });
      expect(store.count()).toBe(2);
    });
  });

  describe("get", () => {
    it("should return null for unknown agent", () => {
      expect(store.get("nonexistent")).toBeNull();
    });

    it("should return the registered agent by id", () => {
      const registered = store.register({ name: "searcher", capabilities: ["search"] });
      const retrieved = store.get(registered.agentId);

      expect(retrieved).not.toBeNull();
      expect(retrieved!.name).toBe("searcher");
      expect(retrieved!.capabilities).toEqual(["search"]);
    });
  });

  describe("findByCapability", () => {
    it("should return agents with matching capability", () => {
      store.register({ name: "a1", capabilities: ["review", "analyze"] });
      store.register({ name: "a2", capabilities: ["deploy"] });
      store.register({ name: "a3", capabilities: ["review", "test"] });

      const results = store.findByCapability("review");
      expect(results).toHaveLength(2);
      expect(results.map((a) => a.name).sort()).toEqual(["a1", "a3"]);
    });

    it("should return empty array for unknown capability", () => {
      store.register({ name: "a1", capabilities: ["build"] });
      expect(store.findByCapability("fly")).toEqual([]);
    });
  });

  describe("findByTag", () => {
    it("should return agents with matching tag", () => {
      store.register({ name: "a1", tags: ["quality"] });
      store.register({ name: "a2", tags: ["infra"] });
      store.register({ name: "a3", tags: ["quality", "testing"] });

      const results = store.findByTag("quality");
      expect(results).toHaveLength(2);
    });
  });

  describe("findByStatus", () => {
    it("should filter agents by status", () => {
      const a1 = store.register({ name: "a1" });
      store.register({ name: "a2" });
      store.updateStatus(a1.agentId, "busy");

      expect(store.findByStatus("idle")).toHaveLength(1);
      expect(store.findByStatus("busy")).toHaveLength(1);
      expect(store.findByStatus("offline")).toHaveLength(0);
    });
  });

  describe("unregister", () => {
    it("should remove an agent and return true", () => {
      const agent = store.register({ name: "temp" });
      expect(store.unregister(agent.agentId)).toBe(true);
      expect(store.get(agent.agentId)).toBeNull();
      expect(store.count()).toBe(0);
    });

    it("should return false for unknown agent", () => {
      expect(store.unregister("ghost")).toBe(false);
    });
  });

  describe("updateStatus", () => {
    it("should change agent status", () => {
      const agent = store.register({ name: "worker" });
      store.updateStatus(agent.agentId, "busy");

      const updated = store.get(agent.agentId);
      expect(updated!.status).toBe("busy");
    });
  });

  describe("recordHeartbeat", () => {
    it("should update lastHeartbeat timestamp", () => {
      const agent = store.register({ name: "heartbeat-test" });
      const originalHeartbeat = agent.lastHeartbeat;

      // Small delay to ensure timestamp difference
      store.recordHeartbeat(agent.agentId);
      const updated = store.get(agent.agentId);

      expect(updated!.lastHeartbeat).toBeDefined();
      expect(updated!.lastHeartbeat >= originalHeartbeat).toBe(true);
    });
  });

  describe("list", () => {
    it("should return all registered agents", () => {
      store.register({ name: "a1" });
      store.register({ name: "a2" });
      store.register({ name: "a3" });

      const all = store.list();
      expect(all).toHaveLength(3);
    });
  });
});
