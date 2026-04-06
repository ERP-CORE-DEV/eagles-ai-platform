import { describe, it, expect } from "vitest";
import { Semaphore } from "../src/semaphore.js";

describe("Semaphore — behavioral", () => {
  // -------------------------------------------------------------------------
  // Blocking
  // -------------------------------------------------------------------------

  it("acquire_atCapacity_blocksUntilRelease", async () => {
    const sem = new Semaphore(3);

    // Fill all 3 slots.
    await sem.acquire();
    await sem.acquire();
    await sem.acquire();

    // The 4th acquire must NOT resolve within 50 ms while slots are held.
    let resolved = false;
    const raceResult = await Promise.race([
      sem.acquire().then(() => {
        resolved = true;
        return "acquired";
      }),
      new Promise<string>((res) => setTimeout(() => res("timeout"), 60)),
    ]);

    expect(raceResult).toBe("timeout");
    expect(resolved).toBe(false);

    // Cleanup — release all 3 plus unblock the waiting 4th.
    sem.release();
    // Give event loop one tick to let the 4th waiter run.
    await Promise.resolve();
    sem.release();
    sem.release();
    sem.release();
  });

  // -------------------------------------------------------------------------
  // FIFO ordering
  // -------------------------------------------------------------------------

  it("release_withWaiters_unblocksFIFO", async () => {
    const sem = new Semaphore(2);
    const order: number[] = [];

    // Fill both slots.
    await sem.acquire();
    await sem.acquire();

    // Queue 5 additional waiters.
    const waiters = [1, 2, 3, 4, 5].map((n) =>
      sem.acquire().then(() => {
        order.push(n);
        sem.release();
      }),
    );

    // Release one slot — waiter 1 should unblock.
    sem.release();
    await Promise.resolve();

    // Release another — waiter 2, and so on.
    for (let i = 0; i < 4; i++) {
      sem.release();
      await Promise.resolve();
    }

    await Promise.all(waiters);

    // FIFO: must have resolved in the order they were queued.
    expect(order).toEqual([1, 2, 3, 4, 5]);
  });

  // -------------------------------------------------------------------------
  // run() releases on throw
  // -------------------------------------------------------------------------

  it("run_fnThrows_releasesSlotSoActiveReturnsToZero", async () => {
    const sem = new Semaphore(2);

    await expect(
      sem.run(async () => {
        throw new Error("boom");
      }),
    ).rejects.toThrow("boom");

    // After the throwing run() the slot must have been released.
    expect(sem.active).toBe(0);
  });

  // -------------------------------------------------------------------------
  // No leak under stress
  // -------------------------------------------------------------------------

  it("acquire_release_1000Cycles_noLeak", async () => {
    const sem = new Semaphore(10);

    for (let i = 0; i < 1000; i++) {
      await sem.acquire();
      sem.release();
    }

    expect(sem.active).toBe(0);
    expect(sem.pending).toBe(0);
  });

  // -------------------------------------------------------------------------
  // Constructor guard
  // -------------------------------------------------------------------------

  it("constructor_maxLessThanOne_throwsRangeError", () => {
    expect(() => new Semaphore(0)).toThrow(RangeError);
    expect(() => new Semaphore(-5)).toThrow(RangeError);
  });
});
