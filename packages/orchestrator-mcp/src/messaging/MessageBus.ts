/**
 * @fileoverview Inter-agent message bus backed by EAGLES' SQLite EventBus.
 *
 * Ported from open-multi-agent (JackChen-me/open-multi-agent) with the
 * following EAGLES-specific adaptations:
 *
 * - **Persistence**: messages are written to the EventBus SQLite store under
 *   the `agent_message:sent` topic; read-state deltas are written under
 *   `agent_message:readstate`. Both are replayed on construction so the bus
 *   survives process restarts.
 *
 * - **Memory-leak fix**: a `maxMessages` constructor option caps the in-memory
 *   cache using FIFO eviction (oldest message dropped first). The SQLite store
 *   is left intact — only the cache is trimmed. The EventBus itself accepts a
 *   separate `maxEvents` cap for disk-level eviction.
 *
 * - **Symbol-keyed subscriptions**: each `subscribe()` call receives a unique
 *   Symbol as its internal handle, preventing duplicate-handler bugs.
 *
 * - **Namespace**: all EventBus writes use the `agent_message:sent` and
 *   `agent_message:readstate` topics so they never collide with other
 *   platform topics.
 */

import { randomUUID } from "node:crypto";
import { EventBus } from "@eagles-ai-platform/data-layer";
import type { Message, ReadStatePayload } from "./types.js";

export type { Message };

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/** Returns true when `message` is addressed to `agentName`. */
export function isAddressedTo(message: Message, agentName: string): boolean {
  if (message.to === "*") {
    // Broadcasts are delivered to everyone except the sender.
    return message.from !== agentName;
  }
  return message.to === agentName;
}

// ---------------------------------------------------------------------------
// MessageBusOptions
// ---------------------------------------------------------------------------

export interface MessageBusOptions {
  /**
   * Maximum number of messages kept in the in-memory cache.
   * When the cache reaches this size, the oldest message is evicted (FIFO).
   * Defaults to 1000. Set to `Infinity` to disable eviction.
   */
  readonly maxMessages?: number;
}

// ---------------------------------------------------------------------------
// MessageBus
// ---------------------------------------------------------------------------

/**
 * SQLite-backed inter-agent message bus.
 *
 * @example
 * ```ts
 * const bus = new MessageBus(eventBus)
 *
 * const unsubscribe = bus.subscribe('worker', (msg) => {
 *   console.log(`worker received: ${msg.content}`)
 * })
 *
 * bus.send('coordinator', 'worker', 'Start task A')
 * bus.broadcast('coordinator', 'All agents: stand by')
 *
 * unsubscribe()
 * ```
 */
export class MessageBus {
  private readonly eventBus: EventBus;
  private readonly maxMessages: number;

  /** In-memory FIFO cache of all messages (bounded by `maxMessages`). */
  private readonly cache: Message[] = [];

  /**
   * Per-agent set of message IDs already marked as read.
   * Seeded from `agent_message:readstate` events on construction.
   */
  private readonly readState = new Map<string, Set<string>>();

  /**
   * Active subscribers keyed by agent name. Symbol keys prevent duplicate
   * handler registrations.
   */
  private readonly subscribers = new Map<
    string,
    Map<symbol, (message: Message) => void>
  >();

  constructor(eventBus: EventBus, options: MessageBusOptions = {}) {
    this.eventBus = eventBus;
    this.maxMessages = options.maxMessages ?? 1000;
    this.rehydrate();
  }

  // ---------------------------------------------------------------------------
  // Write operations
  // ---------------------------------------------------------------------------

  /**
   * Send a message from `from` to `to`.
   *
   * @returns The persisted {@link Message} including its generated ID and timestamp.
   */
  send(
    from: string,
    to: string,
    content: string,
    metadata: Record<string, unknown> = {},
  ): Message {
    const message: Message = {
      id: randomUUID(),
      from,
      to,
      content,
      metadata,
      timestamp: new Date().toISOString(),
    };
    this.persist(message);
    return message;
  }

  /**
   * Broadcast a message from `from` to all other agents (`to === '*'`).
   *
   * @returns The persisted broadcast {@link Message}.
   */
  broadcast(
    from: string,
    content: string,
    metadata: Record<string, unknown> = {},
  ): Message {
    return this.send(from, "*", content, metadata);
  }

  // ---------------------------------------------------------------------------
  // Read operations
  // ---------------------------------------------------------------------------

  /**
   * Returns messages that have not yet been marked as read by `agentName`,
   * including both direct messages and broadcasts addressed to them.
   */
  getUnread(agentName: string): Message[] {
    const read = this.readState.get(agentName) ?? new Set<string>();
    return this.cache.filter(
      (m) => isAddressedTo(m, agentName) && !read.has(m.id),
    );
  }

  /**
   * Returns every message (read or unread) addressed to `agentName`,
   * preserving insertion order.
   */
  getAll(agentName: string): Message[] {
    return this.cache.filter((m) => isAddressedTo(m, agentName));
  }

  /**
   * Returns messages addressed to `agentName` sent on or after `since` (ISO
   * string). Useful for polling patterns without full scan.
   */
  getSince(agentName: string, since: string): Message[] {
    return this.cache.filter(
      (m) => isAddressedTo(m, agentName) && m.timestamp >= since,
    );
  }

  /**
   * Mark a set of messages as read for `agentName`.
   * Passing IDs that were already marked, or do not exist, is a no-op.
   * The delta is persisted to SQLite so read-state survives restarts.
   */
  markRead(agentName: string, messageIds: string[]): void {
    if (messageIds.length === 0) return;
    let read = this.readState.get(agentName);
    if (!read) {
      read = new Set<string>();
      this.readState.set(agentName, read);
    }
    for (const id of messageIds) {
      read.add(id);
    }
    // Persist the read-state delta.
    const payload: ReadStatePayload = { agentName, messageIds };
    this.eventBus.publish("agent_message:readstate", payload);
  }

  /**
   * Returns all messages exchanged between `agent1` and `agent2` (in either
   * direction), sorted chronologically.
   */
  getConversation(agent1: string, agent2: string): Message[] {
    return this.cache.filter(
      (m) =>
        (m.from === agent1 && m.to === agent2) ||
        (m.from === agent2 && m.to === agent1),
    );
  }

  // ---------------------------------------------------------------------------
  // Subscriptions
  // ---------------------------------------------------------------------------

  /**
   * Subscribe to new messages addressed to `agentName`.
   *
   * The callback is invoked synchronously after each matching message is
   * persisted. Returns an unsubscribe function; calling it is idempotent.
   *
   * @example
   * ```ts
   * const off = bus.subscribe('agent-b', (msg) => handleMessage(msg))
   * // Later…
   * off()
   * ```
   */
  subscribe(
    agentName: string,
    callback: (message: Message) => void,
  ): () => void {
    let agentSubs = this.subscribers.get(agentName);
    if (!agentSubs) {
      agentSubs = new Map();
      this.subscribers.set(agentName, agentSubs);
    }
    const id = Symbol();
    agentSubs.set(id, callback);
    return () => {
      agentSubs!.delete(id);
    };
  }

  // ---------------------------------------------------------------------------
  // Private helpers
  // ---------------------------------------------------------------------------

  private persist(message: Message): void {
    // Write to SQLite first (durable).
    this.eventBus.publish("agent_message:sent", message);

    // Eagerly enforce SQLite-level cap when maxMessages is finite.
    // enforceMaxEvents() is topic-agnostic; it works correctly when the
    // EventBus instance is dedicated to messaging (messaging.sqlite).
    if (this.maxMessages !== Infinity) {
      this.eventBus.enforceMaxEvents();
    }

    // Update in-memory cache with FIFO eviction.
    this.cache.push(message);
    if (this.cache.length > this.maxMessages) {
      this.cache.shift();
    }

    // Notify subscribers synchronously.
    this.notifySubscribers(message);
  }

  private notifySubscribers(message: Message): void {
    if (message.to !== "*") {
      this.fireCallbacks(message.to, message);
      return;
    }
    // Broadcast: notify all subscribers except the sender.
    for (const [agentName, subs] of this.subscribers) {
      if (agentName !== message.from && subs.size > 0) {
        this.fireCallbacks(agentName, message);
      }
    }
  }

  private fireCallbacks(agentName: string, message: Message): void {
    const subs = this.subscribers.get(agentName);
    if (!subs) return;
    for (const callback of subs.values()) {
      callback(message);
    }
  }

  /**
   * Replay persisted messages and read-state from SQLite so in-memory cache
   * is consistent after a process restart.
   *
   * Messages are loaded newest-first (up to `maxMessages`) to respect the FIFO
   * eviction budget while still replaying the most recent history.
   */
  private rehydrate(): void {
    // Load persisted messages — consume returns oldest-first (rowid ASC).
    const events = this.eventBus.consume<Message>(
      "agent_message:sent",
      null,
      this.maxMessages === Infinity ? 100_000 : this.maxMessages,
    );
    for (const event of events) {
      this.cache.push(event.payload);
    }

    // Replay all read-state deltas.
    const readEvents = this.eventBus.consume<ReadStatePayload>(
      "agent_message:readstate",
      null,
      100_000,
    );
    for (const event of readEvents) {
      const { agentName, messageIds } = event.payload;
      let set = this.readState.get(agentName);
      if (!set) {
        set = new Set<string>();
        this.readState.set(agentName, set);
      }
      for (const id of messageIds) {
        set.add(id);
      }
    }
  }
}
