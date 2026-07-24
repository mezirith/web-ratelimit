import type { Store } from "../types.js";
export interface RedisClient {
    eval<T = unknown>(script: string, keys: string[], args: (string | number)[]): Promise<T>;
}
/**
 * Redis-backed store using atomic Lua scripts for accurate rate limiting
 * across distributed serverless instances.
 */
export declare class RedisStore implements Store {
    private client;
    private prefix;
    constructor(client: RedisClient, prefix: "ratelimit:");
    increment(key: string, windowMs: number): Promise<{
        count: number;
        resetMs: number;
    }>;
}
//# sourceMappingURL=redis.d.ts.map