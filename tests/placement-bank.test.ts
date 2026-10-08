import { afterEach, describe, expect, it, vi } from "vitest";

const POOL = "@/content/dsa/quiz/dsa-binary-search";

afterEach(() => {
  vi.doUnmock(POOL);
  vi.resetModules();
});

async function loadPool() {
  vi.resetModules();
  return import("@/lib/quizPool");
}

describe("the placement bank loader", () => {
  it("returns only placement-tagged questions in registry order and shares one load", async () => {
    const { loadPlacementBank, poolChapterIds, loadPool: pool } = await loadPool();
    const bank = await loadPlacementBank();
    expect(bank.length).toBeGreaterThan(0);
    expect(bank.every((question) => question.placement === true)).toBe(true);
    const registry = poolChapterIds();
    const chapters = bank.map((question) => question.chapter);
    expect(chapters).toEqual([...chapters].sort((a, b) => registry.indexOf(a) - registry.indexOf(b)));
    const first = (await pool(registry[0]))!.questions.filter((question) => question.placement === true);
    expect(bank.slice(0, first.length)).toEqual(first);
    expect(loadPlacementBank()).toBe(loadPlacementBank());
  });

  it("keeps the pools that load when one fails, and tries again on the next call", async () => {
    let calls = 0;
    vi.doMock(POOL, async (importOriginal) => {
      calls++;
      if (calls === 1) throw new Error("chunk failed");
      return importOriginal();
    });
    const { loadPlacementBank } = await loadPool();
    await expect(loadPlacementBank()).resolves.toEqual([]);
    await Promise.resolve();
    const retried = await loadPlacementBank();
    expect(retried.length).toBeGreaterThan(0);
    expect(loadPlacementBank()).toBe(loadPlacementBank());
  });
});
