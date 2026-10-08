import { afterEach, describe, expect, it, vi } from "vitest";
import type { PlacementRecord } from "@/lib/placementRecord";

const KEY = "groundwork:dsa:placement";

type Listener = (event: { key: string | null }) => void;

function install(options: { failWrites?: boolean } = {}) {
  const data = new Map<string, string>();
  const listeners = new Set<Listener>();
  vi.stubGlobal("window", {
    addEventListener: (type: string, fn: Listener) => type === "storage" && listeners.add(fn),
    removeEventListener: (type: string, fn: Listener) => type === "storage" && listeners.delete(fn),
  });
  vi.stubGlobal("localStorage", {
    getItem: (key: string) => data.get(key) ?? null,
    setItem: (key: string, value: string) => {
      if (options.failWrites) throw new Error("storage is full");
      data.set(key, value);
    },
    removeItem: (key: string) => data.delete(key),
  });
  return { data, listeners };
}

async function load() {
  vi.resetModules();
  return import("@/lib/placementStore");
}

function record(overrides: Partial<PlacementRecord> = {}): PlacementRecord {
  return {
    mode: "quiz",
    level: "intermediate",
    stages: [{ id: "route", correct: 5, asked: 6 }],
    testedOut: ["dsa-arrays"],
    allotted: ["dsa-binary-search"],
    takenAt: 1700000000000,
    seconds: 240,
    ...overrides,
  };
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the placement store", () => {
  it("starts with no placement and a stable snapshot", async () => {
    install();
    const { readPlacement } = await load();
    expect(readPlacement()).toBeNull();
    expect(readPlacement()).toBe(readPlacement());
  });

  it("saves a versioned record under its own key and writes no other key", async () => {
    const { data } = install();
    const { savePlacement, readPlacement } = await load();
    savePlacement(record());
    expect([...data.keys()]).toEqual([KEY]);
    expect([...data.keys()].some((key) => key.startsWith("jsnotes:"))).toBe(false);
    const saved = JSON.parse(data.get(KEY)!);
    expect(saved.v).toBe(1);
    expect(saved.record).toEqual(record());
    expect(readPlacement()).toEqual(record());
  });

  it("keeps a snapshot stable between writes and changes it on a write", async () => {
    install();
    const { savePlacement, readPlacement } = await load();
    savePlacement(record());
    const snapshot = readPlacement();
    expect(readPlacement()).toBe(snapshot);
    savePlacement(record({ level: "advanced" }));
    expect(readPlacement()).not.toBe(snapshot);
    expect(readPlacement()?.level).toBe("advanced");
    expect(readPlacement()).toBe(readPlacement());
  });

  it("treats a stale or unknown version as no placement", async () => {
    const { data } = install();
    data.set(KEY, JSON.stringify({ v: 2, record: record() }));
    const { readPlacement } = await load();
    expect(readPlacement()).toBeNull();
    data.set(KEY, JSON.stringify({ record: record() }));
    expect(readPlacement()).toBeNull();
  });

  it("treats junk as no placement and replaces it on the next save", async () => {
    const { data } = install();
    const { savePlacement, readPlacement } = await load();
    for (const junk of [
      "not json {",
      "null",
      "[]",
      '{"v":1}',
      '{"v":1,"record":7}',
      '{"v":1,"record":{"mode":"quiz"}}',
    ]) {
      data.set(KEY, junk);
      expect(readPlacement(), junk).toBeNull();
    }
    savePlacement(record());
    expect(JSON.parse(data.get(KEY)!).v).toBe(1);
    expect(readPlacement()).toEqual(record());
  });

  it("clears the record, removes its key and tells listeners", async () => {
    const { data } = install();
    const { savePlacement, clearPlacement, readPlacement, subscribePlacement } = await load();
    savePlacement(record());
    const changed = vi.fn();
    subscribePlacement(changed);
    clearPlacement();
    expect(data.has(KEY)).toBe(false);
    expect(readPlacement()).toBeNull();
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("keeps the result in memory when storage fails", async () => {
    const { data } = install({ failWrites: true });
    const { savePlacement, clearPlacement, readPlacement } = await load();
    savePlacement(record());
    expect(data.size).toBe(0);
    expect(readPlacement()).toEqual(record());
    expect(readPlacement()).toBe(readPlacement());
    clearPlacement();
    expect(readPlacement()).toBeNull();
  });

  it("tells listeners about its own key only", async () => {
    const { listeners } = install();
    const { savePlacement, subscribePlacement } = await load();
    const changed = vi.fn();
    const stop = subscribePlacement(changed);
    expect(listeners.size).toBe(1);

    savePlacement(record());
    expect(changed).toHaveBeenCalledTimes(1);

    listeners.forEach((fn) => fn({ key: "jsnotes:progress" }));
    expect(changed).toHaveBeenCalledTimes(1);
    listeners.forEach((fn) => fn({ key: KEY }));
    expect(changed).toHaveBeenCalledTimes(2);

    stop();
    expect(listeners.size).toBe(0);
  });

  it("also tells listeners when storage is cleared, which sends no key", async () => {
    const { listeners } = install();
    const { subscribePlacement } = await load();
    const changed = vi.fn();
    subscribePlacement(changed);
    listeners.forEach((fn) => fn({ key: null }));
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("reads another tab's write after its storage event", async () => {
    const { data, listeners } = install();
    const { readPlacement, subscribePlacement } = await load();
    subscribePlacement(() => {});
    expect(readPlacement()).toBeNull();
    data.set(KEY, JSON.stringify({ v: 1, record: record({ mode: "self", level: "advanced" }) }));
    listeners.forEach((fn) => fn({ key: KEY }));
    expect(readPlacement()).toMatchObject({ mode: "self", level: "advanced" });
  });

  it("never writes jsnotes keys when saving or clearing", async () => {
    const { data } = install();
    data.set("jsnotes:level", JSON.stringify("beginner"));
    data.set("jsnotes:progress", JSON.stringify({ chapters: {}, exercises: {} }));
    const before = new Map(data);
    const { savePlacement, clearPlacement } = await load();
    savePlacement(record());
    clearPlacement();
    for (const [key, value] of before) expect(data.get(key)).toBe(value);
    expect([...data.keys()].sort()).toEqual([...before.keys()].sort());
  });

  it("reads the stored record, not the in-memory one, after another tab writes", async () => {
    const { data, listeners } = install({ failWrites: true });
    const { savePlacement, readPlacement, subscribePlacement } = await load();
    subscribePlacement(() => {});
    savePlacement(record({ level: "beginner" }));
    expect(readPlacement()?.level).toBe("beginner");
    expect(data.size).toBe(0);

    data.set(KEY, JSON.stringify({ v: 1, record: record({ mode: "self", level: "advanced" }) }));
    listeners.forEach((fn) => fn({ key: KEY }));
    expect(readPlacement()).toMatchObject({ mode: "self", level: "advanced" });
    expect(readPlacement()).toBe(readPlacement());
  });

  it("drops the in-memory record on a storage event with no key", async () => {
    const { data, listeners } = install({ failWrites: true });
    const { savePlacement, readPlacement, subscribePlacement } = await load();
    subscribePlacement(() => {});
    savePlacement(record({ level: "beginner" }));
    data.set(KEY, JSON.stringify({ v: 1, record: record({ level: "advanced" }) }));
    listeners.forEach((fn) => fn({ key: null }));
    expect(readPlacement()?.level).toBe("advanced");
  });

  it("clears the cached snapshot when another tab removes the key", async () => {
    const { data, listeners } = install();
    const { savePlacement, readPlacement, subscribePlacement } = await load();
    subscribePlacement(() => {});
    savePlacement(record());
    expect(readPlacement()).not.toBeNull();
    data.delete(KEY);
    listeners.forEach((fn) => fn({ key: KEY }));
    expect(readPlacement()).toBeNull();
  });

  it("lets a later successful save replace an in-memory fallback", async () => {
    const data = new Map<string, string>();
    let failing = true;
    vi.stubGlobal("window", { addEventListener: () => {}, removeEventListener: () => {} });
    vi.stubGlobal("localStorage", {
      getItem: (key: string) => data.get(key) ?? null,
      setItem: (key: string, value: string) => {
        if (failing) throw new Error("storage is full");
        data.set(key, value);
      },
      removeItem: (key: string) => data.delete(key),
    });
    const { savePlacement, readPlacement } = await load();
    savePlacement(record({ level: "beginner" }));
    expect(data.size).toBe(0);
    expect(readPlacement()?.level).toBe("beginner");

    failing = false;
    savePlacement(record({ level: "advanced" }));
    expect(JSON.parse(data.get(KEY)!).record.level).toBe("advanced");
    expect(readPlacement()?.level).toBe("advanced");
    expect(readPlacement()).toBe(readPlacement());
  });
});
