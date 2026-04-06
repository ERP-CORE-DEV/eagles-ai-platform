/**
 * @fileoverview Shared counting semaphore for concurrency control.
 *
 * Used to cap the number of concurrent async operations without requiring
 * any third-party dependencies.
 *
 * @remarks Node.js single-threaded assumption
 * This implementation assumes Node.js's single-threaded event loop. It gates
 * concurrent *async* operations (Promise chains) rather than CPU threads, so
 * no atomics or mutex primitives are required. It is not safe to use across
 * worker threads or child processes.
 */

// ---------------------------------------------------------------------------
// Semaphore
// ---------------------------------------------------------------------------

/**
 * Classic counting semaphore for concurrency control.
 *
 * `acquire()` resolves immediately if a slot is free, otherwise queues the
 * caller. `release()` unblocks the next waiter in FIFO order.
 *
 * @example
 * ```ts
 * const sem = new Semaphore(3);
 * await sem.run(async () => {
 *   await fetchSomething();
 * });
 * ```
 */
export class Semaphore {
  private _current = 0;
  private readonly _queue: Array<() => void> = [];

  /**
   * @param max - Maximum number of concurrent holders. Must be >= 1.
   */
  constructor(private readonly _max: number) {
    if (_max < 1) {
      throw new RangeError(`Semaphore max must be at least 1, got ${_max}`);
    }
  }

  /**
   * Acquire a slot. Resolves immediately when one is free, or waits until a
   * holder calls `release()`.
   */
  acquire(): Promise<void> {
    if (this._current < this._max) {
      this._current++;
      return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
      this._queue.push(resolve);
    });
  }

  /**
   * Release a previously acquired slot.
   * If callers are queued, the next one is unblocked synchronously.
   */
  release(): void {
    const next = this._queue.shift();
    if (next !== undefined) {
      // A queued caller is waiting — hand the slot directly to it.
      // `_current` stays the same: we consumed the slot immediately.
      next();
    } else {
      this._current--;
    }
  }

  /**
   * Run `fn` while holding one slot, automatically releasing it afterward
   * even if `fn` throws.
   */
  async run<T>(fn: () => Promise<T>): Promise<T> {
    await this.acquire();
    try {
      return await fn();
    } finally {
      this.release();
    }
  }

  /** Number of slots currently in use. */
  get active(): number {
    return this._current;
  }

  /** Number of callers waiting for a slot. */
  get pending(): number {
    return this._queue.length;
  }

  /** Maximum concurrent slots configured at construction. */
  get max(): number {
    return this._max;
  }
}
