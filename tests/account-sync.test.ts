import { describe, expect, it } from "vitest";
import { safeNext } from "@/lib/account/config";
import { codeProblem, emailProblem, friendlyAuthError, nameProblem, passwordProblem } from "@/lib/account/errors";
import { isSyncedKey, mergeValues, syncStrategy, type MergeStrategy } from "@/lib/account/syncRules";

function strategy(key: string): MergeStrategy {
  const found = syncStrategy(key);
  if (!found) throw new Error(`${key} is not synced`);
  return found;
}

describe("which keys sync", () => {
  it("syncs learning state and leaves device settings alone", () => {
    for (const key of [
      "jsnotes:progress",
      "jsnotes:activity",
      "jsnotes:code:sum-array",
      "jsnotes:code:two-sum:python",
      "groundwork:quiz",
      "groundwork:mock:history",
      "groundwork:boards",
      "groundwork:board:abc123",
      "groundwork:resume",
    ]) {
      expect(isSyncedKey(key), key).toBe(true);
    }
    for (const key of [
      "jsnotes:theme",
      "jsnotes:font",
      "jsnotes:zoom",
      "jsnotes:narration",
      "groundwork:tour",
      "groundwork:nav:here",
      "groundwork:mock:current",
      "groundwork:board:",
      "jsnotes:code:",
      "gw-auth",
      "gw-sync",
      "groundwork:board:bad key",
    ]) {
      expect(isSyncedKey(key), key).toBe(false);
    }
  });

  it("keeps the board index apart from board bodies", () => {
    expect(strategy("groundwork:boards").kind).toBe("list");
    expect(strategy("groundwork:board:x1").kind).toBe("latest");
  });
});

describe("merging", () => {
  it("unions progress and keeps the later chapter mark", () => {
    const local = {
      chapters: { a: { at: 100, reviews: 1 }, b: true },
      exercises: { e1: true },
    };
    const remote = {
      chapters: { a: { at: 50, reviews: 4 }, c: { at: 70, reviews: 0 } },
      exercises: { e2: true },
    };
    expect(mergeValues(strategy("jsnotes:progress"), { value: local, at: 1 }, { value: remote, at: 2 })).toEqual({
      chapters: { a: { at: 100, reviews: 1 }, b: true, c: { at: 70, reviews: 0 } },
      exercises: { e1: true, e2: true },
    });
  });

  it("breaks an equal-time tie on reviews", () => {
    const merged = mergeValues(
      strategy("jsnotes:progress"),
      { value: { chapters: { a: { at: 10, reviews: 1 } }, exercises: {} }, at: 5 },
      { value: { chapters: { a: { at: 10, reviews: 3 } }, exercises: {} }, at: 1 }
    );
    expect(merged).toEqual({ chapters: { a: { at: 10, reviews: 3 } }, exercises: {} });
  });

  it("ignores prototype keys while merging", () => {
    const hostile = JSON.parse('{"chapters":{"__proto__":{"at":1,"reviews":1}},"exercises":{"__proto__":true}}');
    const merged = mergeValues(strategy("jsnotes:progress"), { value: hostile, at: 1 }, null);
    expect(merged).toBe(hostile);
    const both = mergeValues(strategy("jsnotes:progress"), { value: hostile, at: 1 }, { value: hostile, at: 2 }) as {
      chapters: object;
    };
    expect(Object.keys(both.chapters)).toEqual([]);
    expect(({} as Record<string, unknown>).at).toBeUndefined();
  });

  it("takes the busier count for each day of activity", () => {
    expect(
      mergeValues(
        strategy("jsnotes:activity"),
        { value: { "2026-11-01": 3, "2026-11-02": 1 }, at: 1 },
        { value: { "2026-11-01": 2, "2026-11-03": 5, bad: -1 }, at: 2 }
      )
    ).toEqual({ "2026-11-01": 3, "2026-11-02": 1, "2026-11-03": 5 });
  });

  it("lets the newer side win for plain settings and code drafts", () => {
    const s = strategy("jsnotes:code:sum-array");
    expect(mergeValues(s, { value: "old", at: 10 }, { value: "new", at: 20 })).toBe("new");
    expect(mergeValues(s, { value: "mine", at: 30 }, { value: "theirs", at: 20 })).toBe("mine");
    expect(mergeValues(s, { value: "mine", at: 30 }, { value: "theirs", at: 30 })).toBe("mine");
    expect(mergeValues(s, null, { value: "theirs", at: 1 })).toBe("theirs");
    expect(mergeValues(s, { value: "mine", at: 1 }, null)).toBe("mine");
    expect(mergeValues(s, null, null)).toBeUndefined();
  });

  it("prefers the account on a first sign-in, when this device has no sync time", () => {
    expect(mergeValues(strategy("jsnotes:level"), { value: "beginner", at: 0 }, { value: "advanced", at: 5 })).toBe(
      "advanced"
    );
  });

  it("merges mock history by id, oldest first, keeping the last 50", () => {
    const entry = (id: string, finishedAt: number) => ({ id, finishedAt });
    const local = Array.from({ length: 40 }, (_, i) => entry(`l${i}`, i * 2));
    const remote = [...Array.from({ length: 30 }, (_, i) => entry(`r${i}`, i * 2 + 1)), entry("l0", 0)];
    const merged = mergeValues(
      strategy("groundwork:mock:history"),
      { value: local, at: 1 },
      { value: remote, at: 2 }
    ) as {
      id: string;
      finishedAt: number;
    }[];
    expect(merged).toHaveLength(50);
    expect(new Set(merged.map((m) => m.id)).size).toBe(50);
    const times = merged.map((m) => m.finishedAt);
    expect(times).toEqual([...times].sort((a, b) => a - b));
    expect(times[times.length - 1]).toBe(78);
  });

  it("keeps the most recently edited board meta, newest first", () => {
    const merged = mergeValues(
      strategy("groundwork:boards"),
      {
        value: [
          { id: "a", name: "Old name", updatedAt: 5 },
          { id: "b", name: "B", updatedAt: 9 },
        ],
        at: 1,
      },
      { value: [{ id: "a", name: "New name", updatedAt: 7 }], at: 2 }
    );
    expect(merged).toEqual([
      { id: "b", name: "B", updatedAt: 9 },
      { id: "a", name: "New name", updatedAt: 7 },
    ]);
  });

  it("merges quiz records per chapter and keeps the newer side on a clash", () => {
    const merged = mergeValues(
      strategy("groundwork:quiz"),
      { value: { v: 1, chapters: { a: { passed: true }, b: { passed: false } } }, at: 10 },
      { value: { v: 1, chapters: { b: { passed: true }, c: { passed: true } } }, at: 20 }
    );
    expect(merged).toEqual({ v: 1, chapters: { a: { passed: true }, b: { passed: true }, c: { passed: true } } });
  });

  it("falls back to the newer value when shapes disagree", () => {
    expect(
      mergeValues(strategy("groundwork:quiz"), { value: { v: 2, chapters: {} }, at: 1 }, { value: "x", at: 2 })
    ).toBe("x");
    expect(mergeValues(strategy("groundwork:boards"), { value: [], at: 5 }, { value: {}, at: 1 })).toEqual([]);
  });
});

describe("safe redirects", () => {
  it("only allows paths on this site", () => {
    expect(safeNext("/progress")).toBe("/progress");
    expect(safeNext("/level/js?x=1")).toBe("/level/js?x=1");
    expect(safeNext("https://evil.example")).toBe("/");
    expect(safeNext("//evil.example")).toBe("/");
    expect(safeNext("/\\evil.example")).toBe("/");
    expect(safeNext("/auth/callback")).toBe("/");
    expect(safeNext("/a\nb")).toBe("/");
    expect(safeNext(null, "/account")).toBe("/account");
  });
});

describe("form checks", () => {
  it("validates email, name, password and code", () => {
    expect(emailProblem("")).not.toBeNull();
    expect(emailProblem("a@b")).not.toBeNull();
    expect(emailProblem(" dev@example.com ")).toBeNull();
    expect(nameProblem("A")).not.toBeNull();
    expect(nameProblem("Akshat")).toBeNull();
    expect(passwordProblem("short1")).not.toBeNull();
    expect(passwordProblem("letters only here")).not.toBeNull();
    expect(passwordProblem("12345678")).not.toBeNull();
    expect(passwordProblem("groundwork1")).toBeNull();
    expect(passwordProblem(`a1${"x".repeat(80)}`)).not.toBeNull();
    expect(codeProblem("12345")).not.toBeNull();
    expect(codeProblem("123456")).toBeNull();
  });

  it("turns auth errors into plain sentences", () => {
    expect(friendlyAuthError({ code: "invalid_credentials", message: "Invalid login credentials" })).toMatch(
      /do not match/
    );
    expect(friendlyAuthError({ status: 429, message: "x" })).toMatch(/Wait a minute/);
    expect(friendlyAuthError({ message: "Failed to fetch" })).toMatch(/connection/);
    expect(friendlyAuthError(null)).toMatch(/Try again/);
  });
});
