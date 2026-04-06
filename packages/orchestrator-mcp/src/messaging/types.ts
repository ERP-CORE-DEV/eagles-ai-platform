/**
 * @fileoverview Shared types for the EAGLES inter-agent MessageBus.
 */

// ---------------------------------------------------------------------------
// Message
// ---------------------------------------------------------------------------

/** A single message exchanged between agents (or broadcast to all). */
export interface Message {
  /** Stable UUID for this message. */
  readonly id: string;
  /** Name of the sending agent. */
  readonly from: string;
  /**
   * Recipient agent name, or `'*'` when the message is a broadcast intended
   * for every agent except the sender.
   */
  readonly to: string;
  readonly content: string;
  /** Optional caller-supplied metadata (e.g. task context, correlation IDs). */
  readonly metadata: Record<string, unknown>;
  readonly timestamp: string;
}

// ---------------------------------------------------------------------------
// MessageStatus
// ---------------------------------------------------------------------------

export type MessageStatus = "delivered" | "read";

// ---------------------------------------------------------------------------
// ReadStatePayload — persisted to EventBus
// ---------------------------------------------------------------------------

/** Shape of payloads written to the `agent_message:readstate` topic. */
export interface ReadStatePayload {
  readonly agentName: string;
  readonly messageIds: readonly string[];
}
