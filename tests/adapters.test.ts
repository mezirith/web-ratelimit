import { describe, it, expect } from 'vitest';
import { Hono } from 'hono';
import { rateLimit } from '../src/adapters/hono.js';

describe('Hono Adapter', () => {
  it('should rate limit requests in a Hono application', async () => {
    const app = new Hono();

    app.use('*', rateLimit({ tokens: 2, window: '1m' }));
    app.get('/test', (c) => c.text('OK'));

    // Request 1: Allowed
    const res1 = await app.request('/test');
    expect(res1.status).toBe(200);
    expect(res1.headers.get('X-RateLimit-Remaining')).toBe('1');

    // Request 2: Allowed
    const res2 = await app.request('/test');
    expect(res2.status).toBe(200);
    expect(res2.headers.get('X-RateLimit-Remaining')).toBe('0');

    // Request 3: Rate Limited (429)
    const res3 = await app.request('/test');
    expect(res3.status).toBe(429);
    const body = await res3.json();
    expect(body).toEqual({ error: 'Too Many Requests' });
  });
});