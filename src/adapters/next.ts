import {
  RateLimiter,
  RateLimitResponse,
  type RateLimiterOptions,
} from "../core/limiter.js";

/**
 * Rate limit helper for Next.js App Router Middleware or Route Handlers.
 *
 * @example
 * ```ts
 * // middleware.ts
 * import { rateLimit } from 'web-ratelimit/next';
 *
 * const limiter = rateLimit({ tokens: 5, window: '1m' });
 *
 * export async function middleware(request: Request) {
 *   const { success, toResponse } = await limiter(request);
 *   if (!success) return toResponse();
 * }
 * ```
 */
export function rateLimit(options: RateLimiterOptions) {
  const limiter = new RateLimiter(options);

  return async function nextRateLimit(
    request: Request,
  ): Promise<RateLimitResponse> {
    return await limiter.limit(request);
  };
}
