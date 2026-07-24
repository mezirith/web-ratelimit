import type { Store } from "../types.js";
export declare class MemoryStore implements Store {
    private hits;
    private cleanupIntervalMs;
    private timer?;
    /**
     * @param cleanupIntervalMs How often to purge expired records from memory (default: 1 minute)
     */
    constructor(cleanupIntervalMs?: number);
    increment(key: string, windowMs: number): Promise<{
        count: number;
        resetMs: number;
    }>;
    /**
     * Purges expired records to prevent memory leaks.
     */
    private startCleanup;
    /**
     * Manually stop cleanup timer (useful for unit testing).
     */
    destroy(): void;
}
//# sourceMappingURL=memory.d.ts.map