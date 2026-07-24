import { RateLimiter, type RateLimiterOptions, type RateLimitResponse } from "../core/limiter.js";

interface HonoContext {
  req: { raw: Request };
  header: (name: string, value: string) => void;
  json: (objec: unknown, status: number) => Response;
}

type HonoNext = () => Promise<void>;

/**
 * Native rate limiting middleware for Hono apps.
 *
 * @example
 * ```ts
 * import { Hono } from 'hono';
 * import { rateLimit } from 'web-ratelimit/hono';
 *
 * const app = new Hono();
 * app.use('*', rateLimit({ tokens: 10, window: '1m' }));
 * ```
 */
export function rateLimit(options: RateLimiterOptions) {
  const limiter = new RateLimiter(options);

  return async function rateLimitMiddleware(
    context: HonoContext,
    next: HonoNext,
  ): Promise<Response | void> {
    const result: RateLimitResponse = await limiter.limit(context.req.raw);

    // Inject X-RateLimit headers into Hono context
    for (const [key, value] of Object.entries(result.headers)) {
      context.header(key, value);
    }

    if (!result.success) {
      return context.json({ error: "Too Many Requests" }, 429);
    }

    await next();
  };
}
