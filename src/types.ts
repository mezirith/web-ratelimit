export interface RateLimitOptions {
  /** Maximum number of allowed requests in the time window */
  tokens: number;
  /** Window duration in milliseconds or human readable format (e.g. "1m", "15s") */
  window: number;
  /** Custom key generator (defaults to extracting IP address) */
  keyGenerator?: (request: Request) => string | Promise<string>;
}

export interface RateLimitResult {
  success: boolean;
  limit: number;
  remaining: number;
  resetMs: number;
}

export interface Store {
  increment(key: string, windowMs: number, tokens: number): Promise<{
    count: number;
    resetMs: number;
  }>;
}