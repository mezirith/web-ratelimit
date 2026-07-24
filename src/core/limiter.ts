import { MemoryStore } from "../stores/memory.js";
import type { RateLimitResult, Store } from "../types.js";
import { getClientIP } from "./ip.js";

export type TimeWindow =
  | number
  | `${number}s`
  | `${number}m`
  | `${number}h`
  | `${number}d`;

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

export class RateLimiter {
  private tokens: number;
  private windowMs: number;
  private store: Store;
  private keyGenerator: (request: Request) => string | Promise<string>;

  constructor(options: RateLimiterOptions) {
    this.tokens = options.tokens;
    this.windowMs = parseWindow(options.window);
    this.store = options.store ?? new MemoryStore();
    this.keyGenerator = options.keyGenerator ?? ((req) => getClientIP(req));
  }

  /**
   * Evaluates the rate limit for an incoming Web API Request.
   */
  async limit(request: Request): Promise<RateLimitResponse> {
    const key = await this.keyGenerator(request);
    const { count, resetMs } = await this.store.increment(
      key,
      this.windowMs,
      this.tokens,
    );

    const remaining = Math.max(0, this.tokens - count);
    const success = count <= this.tokens;
    const now = Date.now();
    const retryAfterSec = Math.ceil(Math.max(0, resetMs - now) / 1000);

    return new RateLimitResponse({
      success,
      limit: this.tokens,
      remaining,
      resetMs,
      retryAfterSec,
    });
  }
}

/**
 * Encapsulates the rate limit evaluation and provides standard HTTP Response formatting.
 */
export class RateLimitResponse implements RateLimitResult {
  public success: boolean;
  public limit: number;
  public remaining: number;
  public resetMs: number;
  public retryAfterSec: number;

  constructor(data: {
    success: boolean;
    limit: number;
    remaining: number;
    resetMs: number;
    retryAfterSec: number;
  }) {
    this.success = data.success;
    this.limit = data.limit;
    this.remaining = data.remaining;
    this.resetMs = data.resetMs;
    this.retryAfterSec = data.retryAfterSec;
  }

  /**
   * Generates standard IETF RateLimit HTTP headers.
   */
  get headers(): Record<string, string> {
    const headers: Record<string, string> = {
      "X-RateLimit-Limit": this.limit.toString(),
      "X-RateLimit-Remaining": this.remaining.toString(),
      "X-RateLimit-Reset": Math.ceil(this.resetMs / 1000).toString(),
    };

    if (!this.success) {
      headers["Retry-After"] = this.retryAfterSec.toString();
    }

    return headers;
  }

  /**
   * Generates a standard Web API Response (HTTP 429 Too Many Requests).
   */
  toResponse(customMessage = "Too Many Requests"): Response {
    return new Response(JSON.stringify({ error: customMessage }), {
      status: 429,
      headers: {
        "Content-Type": "application/json",
        ...this.headers,
      },
    });
  }
}

export function parseWindow(window: TimeWindow): number {
  if (typeof window === "number") return window;

  const match = window.match(/^(\d+)(s|m|h|d)$/);
  if (!match) {
    throw new Error(
      `Invalid time window format: "${window}". Expected e.g. "10s", "1m", "1h", "1d".`,
    );
  }

  const value = parseInt(match[1]!, 10);
  const unit = match[2];

  switch (unit) {
    case "s":
      return value * 1000;
    case "m":
      return value * 60 * 1000;
    case "h":
      return value * 60 * 60 * 1000;
    case "d":
      return value * 24 * 60 * 60 * 1000;
    default:
      return value;
  }
}
