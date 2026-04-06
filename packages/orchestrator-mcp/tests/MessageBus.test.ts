/**
 * @fileoverview Behavioral tests for the SQLite-backed MessageBus.
 *
 * Every test validates observable behavior — routing, persistence, eviction,
 * subscription cleanup. No test passes solely because a property exists or a
 * method is callable.
 */

import { describe, it, expect, beforeEach } from "vitest";
import { join } from "node:path";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { EventBus } from "@eagles-ai-platform/data-layer";
import { MessageBus, isAddressedTo } from "../src/messaging/MessageBus.js";
import type { Message } from "../src/messaging/types.js";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeBusDir(): string {
  return mkdtempSync(join(tmpdir(), "msgbus-test-"));
}

/**
 * Create an EventBus + MessageBus pair that share the same SQLite file.
 * Pass `maxMessages` to both so SQLite-level FIFO eviction is active.
 */
function makeEventBusAndBus(
  dbPath: string,
  maxMessages?: number,
): { eventBus: EventBus; bus: MessageBus } {
  const eventBus = new EventBus(dbPath, maxMessages);
  const bus = new MessageBus(eventBus, maxMessages !== undefined ? { maxMessages } : {});
  return { eventBus, bus };
}

// ---------------------------------------------------------------------------
// 1. Persistence across instances
// ---------------------------------------------------------------------------

describe("persistence across instances", () => {
  it("messages sent by instance A are visible to instance B from the same SQLite file", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");

    // Instance A: send 3 messages then discard.
    const { bus: busA } = makeEventBusAndBus(dbPath);
    busA.send("sender", "recipient", "hello-1");
    busA.send("sender", "recipient", "hello-2");
    busA.send("sender", "recipient", "hello-3");

    // Instance B: fresh object, same SQLite.
    const { bus: busB } = makeEventBusAndBus(dbPath);
    const unread = busB.getUnread("recipient");

    expect(unread).toHaveLength(3);
    const contents = unread.map((m) => m.content);
    expect(contents).toContain("hello-1");
    expect(contents).toContain("hello-2");
    expect(contents).toContain("hello-3");
  });
});

// ---------------------------------------------------------------------------
// 2. readState persistence
// ---------------------------------------------------------------------------

describe("readState persistence", () => {
  it("markRead via instance A removes the message from getUnread on instance B", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");

    const { bus: busA } = makeEventBusAndBus(dbPath);
    const msg = busA.send("coordinator", "agent-Y", "task-alpha");

    // Mark as read on instance A.
    busA.markRead("agent-Y", [msg.id]);

    // Instance B must reflect the read-state delta persisted to SQLite.
    const { bus: busB } = makeEventBusAndBus(dbPath);
    const unread = busB.getUnread("agent-Y");

    expect(unread.find((m) => m.id === msg.id)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 3. FIFO eviction
// ---------------------------------------------------------------------------

describe("FIFO eviction", () => {
  it("after sending 7 messages with maxMessages=5, only the 5 newest survive in SQLite", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { eventBus, bus } = makeEventBusAndBus(dbPath, 5);

    // Send 7 messages — m1..m7.
    const ids: string[] = [];
    for (let i = 1; i <= 7; i++) {
      const msg = bus.send("sender", "recv", `msg-${i}`);
      ids.push(msg.id);
    }

    // Query the EventBus directly for persisted events.
    const persisted = eventBus.consume<Message>("agent_message:sent", null, 100);
    const persistedIds = new Set(persisted.map((e) => e.payload.id));

    // m1 and m2 must have been evicted (rowid ASC eviction).
    expect(persistedIds.has(ids[0]!)).toBe(false); // m1 gone
    expect(persistedIds.has(ids[1]!)).toBe(false); // m2 gone

    // m3..m7 must survive.
    for (let i = 2; i < 7; i++) {
      expect(persistedIds.has(ids[i]!)).toBe(true);
    }
    expect(persisted).toHaveLength(5);
  });

  it("eviction occurs on send, not on getUnread — getUnread does not reduce SQLite row count", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { eventBus, bus } = makeEventBusAndBus(dbPath, 5);

    // Send exactly 5 messages — cap reached but not exceeded.
    for (let i = 1; i <= 5; i++) {
      bus.send("sender", "recv", `msg-${i}`);
    }

    const countBefore = eventBus.consume<Message>("agent_message:sent", null, 100).length;

    // Calling getUnread should NOT alter SQLite.
    bus.getUnread("recv");

    const countAfter = eventBus.consume<Message>("agent_message:sent", null, 100).length;

    expect(countBefore).toBe(5);
    expect(countAfter).toBe(5);
  });
});

// ---------------------------------------------------------------------------
// 4. Broadcast sender exclusion
// ---------------------------------------------------------------------------

describe("broadcast sender exclusion", () => {
  it("broadcast from X is addressed to Y and Z but not to X itself", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { bus } = makeEventBusAndBus(dbPath);

    const msg = bus.broadcast("X", "stand by");

    expect(isAddressedTo(msg, "X")).toBe(false);
    expect(isAddressedTo(msg, "Y")).toBe(true);
    expect(isAddressedTo(msg, "Z")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 5. Direct message routing
// ---------------------------------------------------------------------------

describe("direct message routing", () => {
  it("direct message from X to Y is only addressed to Y, not X or Z", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { bus } = makeEventBusAndBus(dbPath);

    const msg = bus.send("X", "Y", "private task");

    expect(isAddressedTo(msg, "Y")).toBe(true);
    expect(isAddressedTo(msg, "X")).toBe(false);
    expect(isAddressedTo(msg, "Z")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 6. Symbol subscription cleanup
// ---------------------------------------------------------------------------

describe("symbol subscription cleanup", () => {
  it("unsubscribing 5 of 10 handlers means exactly 5 are invoked per message", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { bus } = makeEventBusAndBus(dbPath);

    let invocations = 0;
    const unsubscribers: Array<() => void> = [];

    for (let i = 0; i < 10; i++) {
      const unsub = bus.subscribe("target", () => {
        invocations++;
      });
      unsubscribers.push(unsub);
    }

    // Cancel the first 5 subscriptions.
    for (let i = 0; i < 5; i++) {
      unsubscribers[i]!();
    }

    bus.send("sender", "target", "trigger");

    expect(invocations).toBe(5);
  });

  it("after unsubscribing all handlers, no handler is invoked", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { bus } = makeEventBusAndBus(dbPath);

    let invocations = 0;
    const unsubscribers: Array<() => void> = [];

    for (let i = 0; i < 5; i++) {
      const unsub = bus.subscribe("target", () => {
        invocations++;
      });
      unsubscribers.push(unsub);
    }

    for (const unsub of unsubscribers) {
      unsub();
    }

    bus.send("sender", "target", "trigger");

    expect(invocations).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// 7. getUnread order and partial markRead
// ---------------------------------------------------------------------------

describe("getUnread order and partial markRead", () => {
  it("markRead on m2 only — getUnread returns m1 and m3 in original send order", () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { bus } = makeEventBusAndBus(dbPath);

    const m1 = bus.send("src", "Y", "first");
    const m2 = bus.send("src", "Y", "second");
    const m3 = bus.send("src", "Y", "third");

    bus.markRead("Y", [m2.id]);

    const unread = bus.getUnread("Y");

    expect(unread).toHaveLength(2);
    expect(unread[0]!.id).toBe(m1.id);
    expect(unread[1]!.id).toBe(m3.id);

    // m2 must be absent.
    expect(unread.find((m) => m.id === m2.id)).toBeUndefined();
  });
});

// ---------------------------------------------------------------------------
// 8. Concurrent writes
// ---------------------------------------------------------------------------

describe("concurrent writes", () => {
  it("20 concurrent sends from 2 agents produce exactly 20 unique persisted messages", async () => {
    const dir = makeBusDir();
    const dbPath = join(dir, "messages.sqlite");
    const { eventBus, bus } = makeEventBusAndBus(dbPath);

    // 10 sends from agent-A and 10 from agent-B, all started concurrently.
    const sends: Array<Promise<Message>> = [];
    for (let i = 0; i < 10; i++) {
      sends.push(Promise.resolve(bus.send("agent-A", "recv", `from-A-${i}`)));
      sends.push(Promise.resolve(bus.send("agent-B", "recv", `from-B-${i}`)));
    }
    const sent = await Promise.all(sends);

    // All 20 IDs must be unique.
    const ids = sent.map((m) => m.id);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(20);

    // All 20 must be persisted in SQLite.
    const persisted = eventBus.consume<Message>("agent_message:sent", null, 100);
    expect(persisted).toHaveLength(20);

    const persistedIds = new Set(persisted.map((e) => e.payload.id));
    for (const id of ids) {
      expect(persistedIds.has(id)).toBe(true);
    }
  });
});
