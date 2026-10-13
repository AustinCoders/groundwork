import { afterEach, describe, expect, it, vi } from "vitest";

const HUGE = JSON.stringify({ chapters: Object.fromEntries(Array.from({ length: 20000 }, (_, i) => [`c${i}`, true])) });

const BAD_VALUES: [string, string][] = [
  ["null", "null"],
  ["true", "true"],
  ["a number", "42"],
  ["a string", '"hello"'],
  ["an empty array", "[]"],
  ["an array of nulls", "[null,null]"],
  ["garbage text", "{not json"],
  ["an empty string", ""],
  ["an empty object", "{}"],
  ["nested nulls", '{"chapters":{"dsa-trees":null},"exercises":null,"files":[null],"v":1,"record":null}'],
  ["wrong field types", '{"chapters":[1,2],"exercises":"yes","v":"1","language":7,"files":"x","record":[],"voice":5}'],
  ["a future version", '{"v":99,"chapters":{"a":{"attempts":1}},"record":{"mode":"quiz"},"language":"python"}'],
  ["a proto key", '{"__proto__":{"polluted":true},"chapters":{"__proto__":true}}'],
  ["nan-like numbers", '{"chapters":{"a":{"at":"x","reviews":null}},"2026-01-01":"many"}'],
  ["a huge object", HUGE],
  ["a huge string", JSON.stringify("x".repeat(4_500_000))],
];

function install(raw: string) {
  const data = new Map<string, string>();
  vi.stubGlobal("window", {
    addEventListener: () => {},
    removeEventListener: () => {},
    matchMedia: () => ({ matches: false }),
  });
  vi.stubGlobal("localStorage", {
    getItem: () => raw,
    setItem: (key: string, value: string) => data.set(key, value),
    removeItem: (key: string) => data.delete(key),
  });
}

async function fresh<T>(path: string): Promise<T> {
  vi.resetModules();
  return (await import(path)) as T;
}

afterEach(() => vi.unstubAllGlobals());

describe.each(BAD_VALUES)("a stored value that is %s", (_name, raw) => {
  it("falls back to empty progress, activity and a null level", async () => {
    install(raw);
    const storage = await fresh<typeof import("@/lib/storage")>("@/lib/storage");
    const data = storage.progress.all();
    expect(Object.values(data.chapters).every((m) => m === true || typeof m.at === "number")).toBe(true);
    expect(Object.keys(data.chapters)).not.toContain("__proto__");
    expect(Object.values(data.exercises).every((v) => v === true)).toBe(true);
    expect(Object.keys(storage.activity.all()).every((day) => /^\d{4}-\d{2}-\d{2}$/.test(day))).toBe(true);
    expect(storage.lastLevel()).toBeNull();
    expect(storage.savedTheme()).toBeNull();
    expect(storage.savedFont()).toBeNull();
    expect(storage.code.load("x")).toSatisfy((v: unknown) => v === null || typeof v === "string");
    expect(storage.progress.dueForReview(["dsa-trees", "a"])).toBeInstanceOf(Array);
    expect(storage.progress.countDone([{ id: "dsa-trees" }])).toBeGreaterThanOrEqual(0);
    expect(storage.progress.isChapterDone("dsa-trees")).toBeTypeOf("boolean");
    expect(storage.progress.isExerciseSolved("x")).toBeTypeOf("boolean");
    expect(() => storage.progress.setChapterDone("dsa-trees", true)).not.toThrow();
  });

  it("gives the narration its defaults field by field", async () => {
    install(raw);
    const { savedNarration } = await fresh<typeof import("@/lib/storage")>("@/lib/storage");
    const narration = savedNarration();
    expect(narration.voice).toBeTypeOf("string");
    expect(narration.rate).toBeGreaterThanOrEqual(0.5);
    expect(narration.pitch).toMatch(/%$/);
  });

  it("keeps the stats and the heatmap computable", async () => {
    install(raw);
    const { computeStats, recentActivity } = await fresh<typeof import("@/lib/gamification")>("@/lib/gamification");
    const stats = computeStats();
    for (const value of Object.values(stats)) expect(Number.isFinite(value)).toBe(true);
    expect(recentActivity(7)).toHaveLength(7);
  });

  it("reads the quiz, placement, language and confidence stores as empty", async () => {
    install(raw);
    const quiz = await fresh<typeof import("@/lib/quizStore")>("@/lib/quizStore");
    expect(() => quiz.quizStore.all()).not.toThrow();
    expect(quiz.quizStore.get("dsa-trees")).toBeUndefined();
    const placement = await fresh<typeof import("@/lib/placementStore")>("@/lib/placementStore");
    expect(placement.readPlacement()).toBeNull();
    const language = await fresh<typeof import("@/lib/codeLanguage")>("@/lib/codeLanguage");
    expect(language.readCodeLanguage()).toBe("javascript");
    const confidence = await fresh<typeof import("@/lib/interviewConfidence")>("@/lib/interviewConfidence");
    expect(Object.keys(confidence.confidence.all())).not.toContain("__proto__");
    expect(() => confidence.confidence.set("a", "knew")).not.toThrow();
  });

  it("reads the playground, editor, resume and tour state as defaults", async () => {
    install(raw);
    const runs = await fresh<typeof import("@/lib/runHistory")>("@/lib/runHistory");
    expect(runs.runsSnapshot()).toBeInstanceOf(Array);
    const project = await fresh<typeof import("@/lib/playgroundProject")>("@/lib/playgroundProject");
    const loaded = project.loadProject();
    expect(loaded.files.length).toBeGreaterThan(0);
    expect(loaded.files.some((f) => f.id === loaded.active)).toBe(true);
    const settings = await fresh<typeof import("@/lib/editor/settings")>("@/lib/editor/settings");
    expect([2, 4]).toContain(settings.loadSettings().tabSize);
    expect(settings.loadSettings().lint).toBeTypeOf("boolean");
    const resume = await fresh<typeof import("@/lib/resume")>("@/lib/resume");
    expect(resume.readResume()).toBeNull();
    const tour = await fresh<typeof import("@/components/tour/tourStore")>("@/components/tour/tourStore");
    expect(tour.readTour()).toBeNull();
    const sound = await fresh<typeof import("@/lib/sound")>("@/lib/sound");
    expect(sound.isSoundEnabled()).toBeTypeOf("boolean");
  });

  it("reads the mock interview state as empty and the lobby config as defaults", async () => {
    install(raw);
    const mock = await fresh<typeof import("@/lib/mock/storage")>("@/lib/mock/storage");
    expect(mock.mockStore.current()).toBeNull();
    expect(mock.mockStore.history()).toEqual([]);
    expect(mock.mockStore.retry()).toEqual([]);
    const { sanitizeConfig } = await fresh<typeof import("@/app/mock/loopConfig")>("@/app/mock/loopConfig");
    const fallback = { role: "fullstack", seniority: "mid", company: "product", intensity: "standard" } as const;
    const parsed = (() => {
      try {
        return JSON.parse(raw);
      } catch {
        return null;
      }
    })();
    expect(sanitizeConfig(parsed, { ...fallback, style: null })).toMatchObject(fallback);
  });

  it("ignores a broken trail", async () => {
    const { parseTrail } = await fresh<typeof import("@/lib/navTrail")>("@/lib/navTrail");
    expect(() => parseTrail(raw, "/here")).not.toThrow();
    expect(parseTrail(raw, "/here")).toBeNull();
  });
});

describe("the theme script", () => {
  async function run(theme: string | null, font: string | null) {
    const { THEME_INIT_SCRIPT } = await fresh<typeof import("@/lib/themeInitScript")>("@/lib/themeInitScript");
    const attrs: Record<string, string> = {};
    const stored: Record<string, string | null> = { "jsnotes:theme": theme, "jsnotes:font": font };
    const documentElement = {
      setAttribute: (name: string, value: string) => (attrs[name] = value),
      style: { setProperty: () => {} },
    };
    new Function("document", "localStorage", "window", THEME_INIT_SCRIPT)(
      { documentElement },
      { getItem: (key: string) => stored[key] ?? null },
      { matchMedia: () => ({ matches: false }) }
    );
    return attrs;
  }

  it("takes a known theme and font", async () => {
    expect(await run('"kraft"', '"serif"')).toMatchObject({ "data-theme": "kraft", "data-font": "serif" });
  });

  it.each(['"purple"', "7", "null", "[]", "{not json", '{"x":1}', '"__proto__"'])(
    "falls back to the default theme and font for %s",
    async (raw) => {
      expect(await run(raw, raw)).toMatchObject({ "data-theme": "light", "data-font": "classic" });
    }
  );
});

describe("clearing saved data", () => {
  it("removes progress and settings but keeps whiteboards and foreign keys", async () => {
    const entries = new Map([
      ["jsnotes:progress", "{}"],
      ["jsnotes:code:x", '"a"'],
      ["groundwork:quiz", "{}"],
      ["groundwork:board:abc", "{}"],
      ["groundwork:boards", "[]"],
      ["other-app:state", "1"],
    ]);
    vi.stubGlobal("window", {});
    vi.stubGlobal("localStorage", {
      get length() {
        return entries.size;
      },
      key: (i: number) => [...entries.keys()][i] ?? null,
      removeItem: (key: string) => entries.delete(key),
    });
    const { clearSavedData } = await fresh<typeof import("@/lib/storage")>("@/lib/storage");
    expect(clearSavedData()).toBe(3);
    expect([...entries.keys()].sort()).toEqual(["groundwork:board:abc", "groundwork:boards", "other-app:state"]);
  });
});

describe("valid saved data", () => {
  it("survives the clean-up, and a legacy mark with no date is due now rather than decades overdue", async () => {
    install(
      JSON.stringify({
        chapters: { a: true, b: { at: 1700000000000, reviews: 2 }, c: { at: 0, reviews: 0 }, d: null, e: { at: "x" } },
        exercises: { x: true, y: false },
      })
    );
    const storage = await fresh<typeof import("@/lib/storage")>("@/lib/storage");
    const data = storage.progress.all();
    expect(Object.keys(data.chapters).sort()).toEqual(["a", "b", "c"]);
    expect(data.chapters.b).toEqual({ at: 1700000000000, reviews: 2 });
    expect(data.chapters.c).toBe(true);
    expect(Object.keys(data.exercises)).toEqual(["x"]);
    const now = 1800000000000;
    expect(storage.dueAt(true, now)).toBe(now);
    expect(storage.progress.dueForReview(["a", "c"], now)).toEqual(["a", "c"]);
  });
});
