/**
 * @fileoverview SharedContext — formats agent memory/context entries as markdown
 * for prompt injection.
 *
 * Ported from open-multi-agent SharedMemory.getSummary() pattern with
 * EAGLES-specific adaptations:
 * - Grouped by agentName (not flat key/value store)
 * - Immutable ContextEntry records
 * - Configurable per-entry character truncation
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ContextEntry {
  readonly agentName: string;
  readonly key: string;
  readonly value: string;
  readonly timestamp?: string;
}

// ---------------------------------------------------------------------------
// SharedContext
// ---------------------------------------------------------------------------

/**
 * In-memory context store grouped by agent name.
 *
 * @example
 * ```ts
 * const ctx = new SharedContext();
 * ctx.set('architect', 'decision', 'Use CosmosDB for persistence');
 * const md = ctx.getSummary();
 * // ## Agent: architect
 * // - decision: Use CosmosDB for persistence
 * ```
 */
export class SharedContext {
  private readonly _entries: Map<string, ContextEntry[]>;

  constructor() {
    this._entries = new Map();
  }

  // ---------------------------------------------------------------------------
  // Mutations
  // ---------------------------------------------------------------------------

  /**
   * Sets a key/value entry for the given agent. If the key already exists for
   * this agent, the existing entry is replaced. Otherwise a new entry is appended.
   */
  set(agentName: string, key: string, value: string): void {
    const existing = this._entries.get(agentName) ?? [];
    const idx = existing.findIndex((e) => e.key === key);
    const entry: ContextEntry = {
      agentName,
      key,
      value,
      timestamp: new Date().toISOString(),
    };

    if (idx !== -1) {
      existing[idx] = entry;
    } else {
      existing.push(entry);
    }

    this._entries.set(agentName, existing);
  }

  // ---------------------------------------------------------------------------
  // Queries
  // ---------------------------------------------------------------------------

  /**
   * Returns the value for the given agent/key combination, or `undefined` when
   * no such entry exists.
   */
  get(agentName: string, key: string): string | undefined {
    const entries = this._entries.get(agentName);
    if (entries === undefined) return undefined;
    return entries.find((e) => e.key === key)?.value;
  }

  /**
   * Returns all entries for the given agent, or an empty array when no entries
   * have been set for that agent.
   */
  getByAgent(agentName: string): ContextEntry[] {
    return this._entries.get(agentName) ?? [];
  }

  // ---------------------------------------------------------------------------
  // Markdown formatting
  // ---------------------------------------------------------------------------

  /**
   * Formats ALL entries as a markdown string suitable for prompt injection.
   *
   * Each agent's entries are rendered as a `## Agent: <name>` section with
   * bullet-point key/value lines. Values longer than `maxCharsPerEntry` are
   * truncated with an ellipsis.
   *
   * Returns an empty string when no entries have been set.
   *
   * @param maxCharsPerEntry - Maximum characters per value before truncation.
   *                           Defaults to 200.
   *
   * @example
   * ```
   * ## Agent: architect
   * - decision: Use CosmosDB for persistence
   * - rationale: Low latency point reads required
   * ## Agent: engineer
   * - implementation: Added CosmosJobRepository with SDK 3.54 direct
   * ```
   */
  getSummary(maxCharsPerEntry: number = 200): string {
    if (this._entries.size === 0) return "";

    const sections: string[] = [];

    for (const [agentName, entries] of this._entries) {
      if (entries.length === 0) continue;

      const lines: string[] = [`## Agent: ${agentName}`];

      for (const entry of entries) {
        const truncated =
          entry.value.length > maxCharsPerEntry
            ? `${entry.value.slice(0, maxCharsPerEntry)}…`
            : entry.value;
        lines.push(`- ${entry.key}: ${truncated}`);
      }

      sections.push(lines.join("\n"));
    }

    return sections.join("\n");
  }

  // ---------------------------------------------------------------------------
  // Maintenance
  // ---------------------------------------------------------------------------

  /** Removes all entries from all agents. */
  clear(): void {
    this._entries.clear();
  }

  /** Returns the total number of individual entries across all agents. */
  size(): number {
    let total = 0;
    for (const entries of this._entries.values()) {
      total += entries.length;
    }
    return total;
  }
}
