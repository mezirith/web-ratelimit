import { type RateLimiterOptions } from "../core/limiter.js";
interface HonoContext {
    req: {
        raw: Request;
    };
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
export declare function rateLimit(options: RateLimiterOptions): (context: HonoContext, next: HonoNext) => Promise<Response | void>;
export {};
//# sourceMappingURL=hono.d.ts.map