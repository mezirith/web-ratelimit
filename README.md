# web-ratelimit

> **Zero-dependency, universal rate-limiting engine** for Node.js, Bun, Deno, Cloudflare Workers, Next.js, and Edge runtimes.

Built natively on the standard Web APIs (`Request` and `Response`). Out of the box support for **Hono**, **Next.js**, and **Redis**.

[![npm version](https://img.shields.io/npm/v/web-ratelimit.svg?color=blue)](https://www.npmjs.com/package/web-ratelimit)
[![license](https://img.shields.io/npm/l/web-ratelimit.svg)](LICENSE)
[![bundle size](https://img.shields.io/bundlephobia/minzip/web-ratelimit)](https://bundlephobia.com/package/web-ratelimit)

---

## Features

- **Runtime Agnostic:** Works everywhere standard `Request`/`Response` exists (Cloudflare Workers, Vercel Edge, Bun, Deno, Node.js).
- **Zero Dependencies:** Ultra-lightweight footprint with zero external dependencies.
- **Human-Readable Windows:** Specify duration easily (`"10s"`, `"1m"`, `"1h"`, `"1d"`).
- **Universal IP Detection:** Auto-detects real client IPs across Cloudflare, Vercel, AWS, Nginx, Fastly, and Akamai.
- **Pluggable Storage:** In-Memory with auto-garbage collection or distributed atomic Redis.
- **Standard HTTP Headers:** Emits RFC-compliant `X-RateLimit-*` and `Retry-After` headers.

---

## Installation

```bash
# pnpm
pnpm add web-ratelimit

# npm
npm install web-ratelimit

# bun
bun add web-ratelimit


1. Vanilla Web API / Cloudflare Workers / Bun

import { RateLimiter } from 'web-ratelimit';

const limiter = new RateLimiter({
  tokens: 10,       // Max 10 requests
  window: '1m',     // Per 1 minute
});

export default {
  async fetch(request: Request): Promise<Response> {
    const result = await limiter.limit(request);

    if (!result.success) {
      // Returns HTTP 429 JSON response with X-RateLimit headers
      return result.toResponse();
    }

    return new Response('Hello World!', {
      headers: result.headers,
    });
  },
};


2. Hono Middleware

import { Hono } from 'hono';
import { rateLimit } from 'web-ratelimit/hono';

const app = new Hono();

// Rate limit all routes: 100 requests per 15 minutes
app.use('*', rateLimit({
  tokens: 100,
  window: '15m',
}));

app.get('/api/data', (c) => c.json({ status: 'ok' }));

export default app;


3. Next.js Middleware

// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { rateLimit } from 'web-ratelimit/next';

const limiter = rateLimit({
  tokens: 20,
  window: '1m',
});

export async function middleware(request: NextRequest) {
  const result = await limiter(request);

  if (!result.success) {
    return result.toResponse(); // HTTP 429
  }

  const response = NextResponse.next();
  
  // Attach rate limit headers
  Object.entries(result.headers).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
}

export const config = {
  matcher: '/api/:path*',
};


Storage Drivers
Included by default. Uses an internal Map with an automatic garbage-collection timer to purge expired keys and prevent memory leaks.

import { RateLimiter, MemoryStore } from 'web-ratelimit';

const limiter = new RateLimiter({
  tokens: 5,
  window: '10s',
  store: new MemoryStore(60_000), // Purge expired entries every 60 seconds
});


Redis Store (Distributed / Serverless)
Compatible with Upstash Redis (@upstash/redis), ioredis, or node-redis. Uses atomic Lua scripts under the hood.

import { Redis } from '@upstash/redis';
import { RateLimiter, RedisStore } from 'web-ratelimit';

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const limiter = new RateLimiter({
  tokens: 50,
  window: '1m',
  store: new RedisStore(redis, 'ratelimit:api:'),
});


Configuration & Options
interface RateLimiterOptions {
  /** Maximum number of allowed requests in the time window */
  tokens: number;
  
  /** Window duration in milliseconds or string e.g. "10s", "1m", "1h", "1d" */
  window: number | `${number}s` | `${number}m` | `${number}h` | `${number}d`;
  
  /** Storage driver (defaults to MemoryStore) */
  store?: Store;
  
  /** Custom key generator (defaults to client IP address) */
  keyGenerator?: (request: Request) => string | Promise<string>;
}


Custom Key Generator Example (Rate Limit by User ID or API Key)

const limiter = new RateLimiter({
  tokens: 100,
  window: '1h',
  keyGenerator: (request) => {
    // Rate limit by Authorization bearer token instead of IP
    const auth = request.headers.get('authorization');
    return auth || getClientIP(request);
  },
});


Client IP Detection Order

web-ratelimit automatically extracts the real client IP address by checking proxy headers in the following security order:
CF-Connecting-IP (Cloudflare)
X-Real-IP (Vercel / Nginx)
X-Forwarded-For (Standard proxy chain - extracts first IP)
True-Client-IP (Akamai)
Fastly-Client-IP (Fastly)
127.0.0.1 (Fallback)


License

MIT