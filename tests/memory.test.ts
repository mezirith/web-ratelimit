import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MemoryStore } from "../src/stores/memory.js";

describe("Memory Store Adapter", () => {
  let store: MemoryStore;

  beforeEach(() => {
    store = new MemoryStore();
  });

  afterEach(() => {
    store.destroy();
  });

  it("should increment request count for key", async () => {
    const res1 = await store.increment("user-1", 60_000);
    expect(res1.count).toBe(1);

    const res2 = await store.increment("user-1", 60_000);
    expect(res2.count).toBe(2)
  });

  it("should isolate keys from each other", async() => {
    await store.increment("user-1", 60_000);
    const resUser2 = await store.increment("user-2", 60_000);

    expect(resUser2.count).toBe(1)
  })
});
