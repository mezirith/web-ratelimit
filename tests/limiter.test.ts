import { describe, it, expect } from "vitest";
import { RateLimiter, parseWindow } from "../src/index.js";

describe("RateLimiter Core", () => {
  it("should parse human readable time windows", () => {
    expect(parseWindow("10s")).toBe(10_000);
    expect(parseWindow("1m")).toBe(60_000);
    expect(parseWindow("1h")).toBe(3_600_000);
    expect(parseWindow(5000)).toBe(5000);
  });

  it("should allow requests within limit and block when exceeded", async () => {
    const limiter = new RateLimiter({
      tokens: 2,
      window: "1m",
    });

    const req = new Request("https://api.example.com", {
      headers: { "cf-connecting-ip": "1.1.1.1" },
    });

    // Request 1: Allowed
    const res1 = await limiter.limit(req);
    expect(res1.success).toBe(true);
    expect(res1.remaining).toBe(1);

    // Request 2: Allowed
    const res2 = await limiter.limit(req);
    expect(res2.success).toBe(true);
    expect(res2.remaining).toBe(0);

    // Request 3: Exceeded -> Blocked
    const res3 = await limiter.limit(req);
    expect(res3.success).toBe(false);
    expect(res3.remaining).toBe(0);

    // Check toResponse() HTTP 429 generation
    const httpResponse = res3.toResponse();
    expect(httpResponse.status).toBe(429);
    expect(httpResponse.headers.get("X-RateLimit-Limit")).toBe("2");
    expect(httpResponse.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(httpResponse.headers.get("Retry-After")).toBeDefined();
  });
});
