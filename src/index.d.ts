export * from './types.js';
export { RateLimiter, RateLimitResponse, parseWindow } from './core/limiter.js';
export { getClientIP } from './core/ip.js';
export { MemoryStore } from './stores/memory.js';
export { RedisStore } from './stores/redis.js';
export declare function createRateLimiter(): {
    version: string;
    status: string;
};
//# sourceMappingURL=index.d.ts.map