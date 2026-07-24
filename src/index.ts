export * from './types.js';
export { RateLimiter, RateLimitResponse, parseWindow } from './core/limiter.js';
export { getClientIP } from './core/ip.js';
export { MemoryStore } from './stores/memory.js';
export { RedisStore } from './stores/redis.js';

export function createRateLimiter() {
  return {
    version: '0.1.0',
    status: 'ready',
  };
}

