import { describe, expect, it } from "vitest";
import { getClientIP } from "../src/core/ip.js";

describe("Universal IP Extractor", () => {
  it("should extract CF-Connecting-IP correctly", () => {
    const req = new Request("https://api.example.com", {
      headers: { "cf-connecting-ip": "203.0.113.195" },
    });
    expect(getClientIP(req)).toBe("203.0.113.195");
  });

  it("should parse X-Forwarded-For and pick the first client IP", () => {
    const req = new Request("https://api.example.com", {
      headers: { "x-forwarded-for": "198.51.100.1, 10.0.0.1, 10.0.0.2" },
    });
    expect(getClientIP(req)).toBe("198.51.100.1");
  });

  it("should respect custom override header", () => {
    const req = new Request("https://api.example.com", {
      headers: { "x-custom-user-ip": "192.0.2.1" },
    });
    expect(getClientIP(req, "x-custom-user-ip")).toBe("192.0.2.1");
  });

  it("should fallback to 127.0.0.1 if no proxy headers exist", () => {
    const req = new Request("https://api.example.com");
    expect(getClientIP(req)).toBe("127.0.0.1")
  })
});
