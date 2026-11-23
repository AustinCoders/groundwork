import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PENDING_MINUTES, clearPending, readPending, savePending } from "@/lib/resume/pending";

const KEY = "gw:resume-pending";

function memoryStorage() {
  const data = new Map<string, string>();
  return {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => void data.set(key, value),
    removeItem: (key: string) => void data.delete(key),
    data,
  };
}

let storage: ReturnType<typeof memoryStorage>;

beforeEach(() => {
  storage = memoryStorage();
  vi.stubGlobal("window", { localStorage: storage });
});

afterEach(() => {
  vi.unstubAllGlobals();
});

const read = {
  lines: ["Riya Sharma", "Experience", "Built a cache"],
  links: ["https://github.com/riya"],
  pages: 1,
  wideGaps: 0,
};

describe("pending resume", () => {
  it("round-trips what was read", () => {
    expect(savePending("riya-resume", read)).toBe(true);
    const back = readPending();
    expect(back?.title).toBe("riya-resume");
    expect(back?.read).toEqual(read);
  });

  it("expires after the window and clears itself", () => {
    savePending("old", read);
    const later = Date.now() + (PENDING_MINUTES + 1) * 60_000;
    expect(readPending(later)).toBeNull();
    expect(storage.data.has(KEY)).toBe(false);
  });

  it("drops broken or empty records", () => {
    storage.setItem(KEY, "{not json");
    expect(readPending()).toBeNull();
    storage.setItem(KEY, JSON.stringify({ title: "x", at: Date.now(), read: { lines: [] } }));
    expect(readPending()).toBeNull();
    expect(storage.data.has(KEY)).toBe(false);
  });

  it("cleans odd values instead of trusting them", () => {
    storage.setItem(
      KEY,
      JSON.stringify({
        title: "",
        at: Date.now(),
        read: { lines: ["a", 3, "b"], links: "no", pages: 99, wideGaps: -4 },
      })
    );
    const back = readPending();
    expect(back?.title).toBe("Resume");
    expect(back?.read).toEqual({ lines: ["a", "b"], links: [], pages: 10, wideGaps: 0 });
  });

  it("clears on request", () => {
    savePending("x", read);
    clearPending();
    expect(readPending()).toBeNull();
  });
});
