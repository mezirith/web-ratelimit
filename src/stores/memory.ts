import type { Store } from "../types.js";

interface MemoryRecord {
  count: number;
  resetMs: number;
}

export class MemoryStore implements Store {
  private hits = new Map<string, MemoryRecord>();
  private cleanupIntervalMs: number;
  private timer?: ReturnType<typeof setInterval>;

  /**
   * @param cleanupIntervalMs How often to purge expired records from memory (default: 1 minute)
   */

  constructor(cleanupIntervalMs = 60_000) {
    this.cleanupIntervalMs = cleanupIntervalMs;
    this.startCleanup();
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetMs: number }> {
    const now = Date.now();
    const record = this.hits.get(key);

    // If key exists and window hasn't expired yet
    if (record && now < record.resetMs) {
      record.count += 1;

      return {
        count: record.count,
        resetMs: record.resetMs,
      };
    }

    // Key is either new or expired -> create new record
    const newRecord: MemoryRecord = {
      count: 1,
      resetMs: now + windowMs,
    };

    this.hits.set(key, newRecord);

    return {
      count: newRecord.count,
      resetMs: newRecord.resetMs,
    };
  }

  /**
   * Purges expired records to prevent memory leaks.
   */
  private startCleanup(): void {
    // Unref timer in Node environment if possible so process isn't kept alive artificially
    if (typeof setInterval !== "undefined") {
      this.timer = setInterval(() => {
        const now = Date.now();
        for (const [key, record] of this.hits.entries()) {
          if (now >= record.resetMs) {
            this.hits.delete(key);
          }
        }
      }, this.cleanupIntervalMs);

      if(this.timer && typeof this.timer === "object" && "unref" in this.timer){
        (this.timer as { unref: () => void}).unref()
      }
    }
  }

  /**
   * Manually stop cleanup timer (useful for unit testing).
   */
  destroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    this.hits.clear();
  }
}
