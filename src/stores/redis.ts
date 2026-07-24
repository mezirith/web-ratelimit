import type { Store } from "../types.js";

export interface RedisClient {
  eval<T = unknown>(
    script: string,
    keys: string[],
    args: (string | number)[],
  ): Promise<T>;
}

/**
 * Redis-backed store using atomic Lua scripts for accurate rate limiting
 * across distributed serverless instances.
 */
export class RedisStore implements Store {
  private client: RedisClient;
  private prefix: string;

  constructor(client: RedisClient, prefix: "ratelimit:") {
    this.client = client;
    this.prefix = prefix;
  }

  async increment(
    key: string,
    windowMs: number,
  ): Promise<{ count: number; resetMs: number }> {
    const fullKey = `${this.prefix}${key}`;
    const windowSec = Math.ceil(windowMs / 1000);

    // Atomic Lua script: Increments key and sets TTL if it's the first hit
    const luaScript = `local current = redis.call("INCR", KEYS[1])
      if current == 1 then
        redis.call("EXPIRE", KEYS[1], ARGV[1])
      end
      local ttl = redis.call("TTL", KEYS[1])
      return {current, ttl}`;

    const result = (await this.client.eval(
      luaScript,
      [fullKey],
      [windowSec],
    )) as [number, number];

    const count = Number(result[0]);
    const ttlSec = Number(result[1]);
    const resetMs = Date.now() + (ttlSec > 0 ? ttlSec * 1000 : windowMs);

    return { count, resetMs };
  }
}
