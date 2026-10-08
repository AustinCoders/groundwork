import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const KEY = "groundwork:quiz";

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
  return import("@/lib/quizStore");
}

beforeEach(() => {
  vi.unstubAllGlobals();
});

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("the quiz store", () => {
  it("starts empty with a stable snapshot", async () => {
    install();
    const { quizStore } = await load();
    expect(quizStore.all()).toEqual({});
    expect(quizStore.all()).toBe(quizStore.all());
    expect(quizStore.get("dsa-binary-search")).toBeUndefined();
  });

  it("saves a versioned shape under its own key and writes no other key", async () => {
    const { data } = install();
    const { quizStore } = await load();
    quizStore.recordAttempt("dsa-binary-search", { score: 3, missed: ["a", "b"], passed: false });
    expect([...data.keys()]).toEqual([KEY]);
    const saved = JSON.parse(data.get(KEY)!);
    expect(saved.v).toBe(1);
    expect(saved.chapters["dsa-binary-search"]).toMatchObject({
      attempts: 1,
      best: 3,
      passedAt: null,
      markedAnyway: false,
      missed: ["a", "b"],
    });
  });

  it("keeps the missed ids of the latest attempt and the pass time after a pass", async () => {
    install();
    const { quizStore } = await load();
    quizStore.recordAttempt("c", { score: 2, missed: ["a", "b", "c"], passed: false });
    quizStore.recordAttempt("c", { score: 4, missed: ["z"], passed: true });
    const record = quizStore.get("c")!;
    expect(record.attempts).toBe(2);
    expect(record.best).toBe(4);
    expect(record.missed).toEqual(["z"]);
    expect(record.passedAt).toBeGreaterThan(0);
  });

  it("keeps a snapshot referentially stable between writes and changes it on a write", async () => {
    install();
    const { quizStore } = await load();
    quizStore.recordAttempt("c", { score: 1, missed: ["a"], passed: false });
    const snapshot = quizStore.all();
    expect(quizStore.all()).toBe(snapshot);
    expect(quizStore.get("c")).toBe(snapshot.c);
    quizStore.recordAttempt("c", { score: 2, missed: [], passed: false });
    expect(quizStore.all()).not.toBe(snapshot);
    expect(quizStore.all()).toBe(quizStore.all());
  });

  it("marking anyway records it, and unmarking clears the pass and the flag but keeps the rest", async () => {
    install();
    const { quizStore } = await load();
    quizStore.recordAttempt("c", { score: 5, missed: ["m"], passed: true });
    quizStore.unmark("c");
    expect(quizStore.get("c")).toMatchObject({
      passedAt: null,
      markedAnyway: false,
      attempts: 1,
      best: 5,
      missed: ["m"],
    });
    quizStore.recordMarkedAnyway("c");
    expect(quizStore.get("c")).toMatchObject({ markedAnyway: true, passedAt: null, attempts: 1 });
    quizStore.unmark("c");
    expect(quizStore.get("c")).toMatchObject({ markedAnyway: false, attempts: 1 });
  });

  it("unmarking a chapter with no record writes nothing", async () => {
    const { data } = install();
    const { quizStore } = await load();
    quizStore.unmark("never-checked");
    expect(data.size).toBe(0);
  });

  it("treats a stale or unknown version as empty", async () => {
    const { data } = install();
    data.set(KEY, JSON.stringify({ v: 2, chapters: { c: { attempts: 9, best: 5 } } }));
    const { quizStore } = await load();
    expect(quizStore.all()).toEqual({});
    data.set(KEY, JSON.stringify({ chapters: { c: { attempts: 9 } } }));
    expect(quizStore.all()).toEqual({});
  });

  it("treats junk as empty and replaces it on the next write", async () => {
    const { data } = install();
    const { quizStore } = await load();
    for (const junk of ["not json {", "null", "[]", '{"v":1}', '{"v":1,"chapters":7}']) {
      data.set(KEY, junk);
      expect(quizStore.all(), junk).toEqual({});
    }
    quizStore.recordAttempt("c", { score: 1, missed: [], passed: false });
    expect(JSON.parse(data.get(KEY)!).v).toBe(1);
  });

  it("drops a bad record and keeps the good ones", async () => {
    const { data } = install();
    data.set(
      KEY,
      JSON.stringify({ v: 1, chapters: { good: { attempts: 2, best: 4, missed: ["a"] }, bad: "nope", worse: null } })
    );
    const { quizStore } = await load();
    expect(Object.keys(quizStore.all())).toEqual(["good"]);
    expect(quizStore.get("good")).toMatchObject({ attempts: 2, best: 4, missed: ["a"] });
  });

  it("keeps the session's results in memory when storage fails", async () => {
    const { data } = install({ failWrites: true });
    const { quizStore } = await load();
    quizStore.recordAttempt("c", { score: 4, missed: ["q"], passed: true });
    expect(data.size).toBe(0);
    expect(quizStore.get("c")).toMatchObject({ attempts: 1, best: 4, missed: ["q"] });
    quizStore.recordAttempt("c", { score: 2, missed: [], passed: false });
    expect(quizStore.get("c")!.attempts).toBe(2);
    expect(quizStore.all()).toBe(quizStore.all());
  });

  it("tells listeners about its own key only", async () => {
    const { listeners } = install();
    const { quizStore, subscribeQuiz } = await load();
    const changed = vi.fn();
    const stop = subscribeQuiz(changed);
    expect(listeners.size).toBe(1);

    quizStore.recordAttempt("c", { score: 1, missed: [], passed: false });
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
    const { subscribeQuiz } = await load();
    const changed = vi.fn();
    subscribeQuiz(changed);
    listeners.forEach((fn) => fn({ key: null }));
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("clears every record, removes its key and tells listeners", async () => {
    const { data } = install();
    const { quizStore, subscribeQuiz } = await load();
    quizStore.recordAttempt("a", { score: 4, missed: [], passed: true });
    quizStore.recordAttempt("b", { score: 1, missed: ["x"], passed: false });
    const changed = vi.fn();
    subscribeQuiz(changed);
    quizStore.clear();
    expect(data.has(KEY)).toBe(false);
    expect(quizStore.all()).toEqual({});
    expect(changed).toHaveBeenCalledTimes(1);
  });

  it("clears the in-memory results too when storage had failed", async () => {
    install({ failWrites: true });
    const { quizStore } = await load();
    quizStore.recordAttempt("a", { score: 4, missed: [], passed: true });
    expect(quizStore.get("a")).toBeDefined();
    quizStore.clear();
    expect(quizStore.all()).toEqual({});
  });

  it("reads another tab's write after its storage event", async () => {
    const { data, listeners } = install();
    const { quizStore, subscribeQuiz } = await load();
    subscribeQuiz(() => {});
    expect(quizStore.all()).toEqual({});
    data.set(KEY, JSON.stringify({ v: 1, chapters: { other: { attempts: 1, best: 3, missed: [] } } }));
    listeners.forEach((fn) => fn({ key: KEY }));
    expect(quizStore.get("other")).toMatchObject({ attempts: 1, best: 3 });
  });
});
