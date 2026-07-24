import type { RateLimitResult, Store } from "../types.js";
export type TimeWindow = number | `${number}s` | `${number}m` | `${number}h` | `${number}d`;
export interface RateLimiterOptions {
    /** Maximum number of allowed requests in the time window */
    tokens: number;
    /** Window duration in milliseconds or human readable format (e.g. 60000, "1m", "15s") */
    window: TimeWindow;
    /** Storage driver (defaults to in-memory store) */
    store?: Store;
    /** Custom key generator (defaults to client IP address) */
    keyGenerator?: (request: Request) => string | Promise<string>;
}
export declare class RateLimiter {
    private tokens;
    private windowMs;
    private store;
    private keyGenerator;
    constructor(options: RateLimiterOptions);
    /**
     * Evaluates the rate limit for an incoming Web API Request.
     */
    limit(request: Request): Promise<RateLimitResponse>;
}
/**
 * Encapsulates the rate limit evaluation and provides standard HTTP Response formatting.
 */
export declare class RateLimitResponse implements RateLimitResult {
    success: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
    retryAfterSec: number;
    constructor(data: {
        success: boolean;
        limit: number;
        remaining: number;
        resetMs: number;
        retryAfterSec: number;
    });
    /**
     * Generates standard IETF RateLimit HTTP headers.
     */
    get headers(): Record<string, string>;
    /**
     * Generates a standard Web API Response (HTTP 429 Too Many Requests).
     */
    toResponse(customMessage?: string): Response;
}
export declare function parseWindow(window: TimeWindow): number;
//# sourceMappingURL=limiter.d.ts.map