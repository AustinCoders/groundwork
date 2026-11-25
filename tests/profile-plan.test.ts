import { describe, expect, it } from "vitest";
import { completeness } from "@/lib/profile/completeness";
import { freezeState, freezesToApply, frozenDays } from "@/lib/profile/freeze";
import { EMPTY_PLAN, isDay, sanitizePlan } from "@/lib/profile/planData";
import { bandOf, computeReadiness, type ReadinessInput } from "@/lib/profile/readiness";
import { trackFor } from "@/lib/profile/roles";
import type { BaseTracks, RoleStep, RoleTrack } from "@/lib/profile/roleTracks";
import { buildToday, daysUntil } from "@/lib/profile/today";

const NOON = new Date(2026, 10, 25, 12).getTime();
const DAY = 86_400_000;

function key(time: number): string {
  const d = new Date(time);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function logOf(daysAgo: number[]): Record<string, number> {
  return Object.fromEntries(daysAgo.map((n) => [key(NOON - n * DAY), 2]));
}

function step(keyName: string, ids: string[], check = false): RoleStep {
  return {
    key: keyName,
    kind: "topic",
    title: keyName.toUpperCase(),
    mark: "•",
    href: `/${keyName}`,
    ids,
    chapters: ids.map((id) => ({ id, title: `Chapter ${id}`, href: `/${keyName}/${id}`, check })),
  };
}

const track: RoleTrack = {
  role: "frontend",
  title: "Frontend developer",
  steps: [step("js", ["a", "b", "c", "d"]), step("dsa", ["e", "f"], true), step("react", ["g", "h"])],
};

function input(over: Partial<ReadinessInput> = {}): ReadinessInput {
  return {
    track,
    read: new Set(),
    passed: new Set(),
    exercises: 0,
    confidence: { knew: 0, shaky: 0, blank: 0 },
    mock: null,
    skills: {},
    skillInfo: { react: { name: "React", href: "/react" } },
    ...over,
  };
}

describe("plan data", () => {
  it("cleans what it reads instead of trusting it", () => {
    const plan = sanitizePlan({
      date: "2026-02-30",
      goal: 7,
      companies: ["google", "google", "Bad Id", "flipkart", "a", "b", "c", "d"],
      skills: { react: "strong", node: "expert", __proto__: "okay", "x y": "okay" },
      freezes: ["2026-11-20", "nope", "2026-11-20"],
    });
    expect(plan.date).toBeNull();
    expect(plan.goal).toBe(EMPTY_PLAN.goal);
    expect(plan.companies).toEqual(["google", "flipkart", "a", "b", "c"]);
    expect(plan.skills).toEqual({ react: "strong" });
    expect(plan.freezes).toEqual(["2026-11-20"]);
    expect(sanitizePlan(null)).toEqual(EMPTY_PLAN);
  });

  it("knows a real calendar day", () => {
    expect(isDay("2026-12-15")).toBe(true);
    expect(isDay("2026-13-01")).toBe(false);
    expect(isDay("15-12-2026")).toBe(false);
  });
});

describe("streak freezes", () => {
  it("earns one freeze per seven active days and saves at most two", () => {
    expect(freezeState(logOf([1, 2, 3, 4, 5, 6]), []).banked).toBe(0);
    expect(freezeState(logOf([1, 2, 3, 4, 5, 6, 7]), []).banked).toBe(1);
    expect(freezeState(logOf(Array.from({ length: 30 }, (_, k) => k + 1)), []).banked).toBe(2);
    expect(freezeState(logOf(Array.from({ length: 14 }, (_, k) => k + 1)), ["2026-01-01"]).banked).toBe(1);
  });

  it("covers a missed yesterday when a freeze is saved", () => {
    const log = logOf([2, 3, 4, 5, 6, 7, 8]);
    expect(freezesToApply(log, [], NOON)).toEqual([key(NOON - DAY)]);
  });

  it("does nothing without a saved freeze, when yesterday was studied, or after a long gap", () => {
    expect(freezesToApply(logOf([2, 3]), [], NOON)).toEqual([]);
    expect(freezesToApply(logOf([1, 2, 3, 4, 5, 6, 7]), [], NOON)).toEqual([]);
    expect(freezesToApply(logOf([5, 6, 7, 8, 9, 10, 11, 12]), [], NOON)).toEqual([]);
  });

  it("covers two missed days only when two freezes are saved", () => {
    const fourteen = logOf(Array.from({ length: 14 }, (_, k) => k + 3));
    expect(freezesToApply(fourteen, [], NOON)).toEqual([key(NOON - 2 * DAY), key(NOON - DAY)]);
    const seven = logOf(Array.from({ length: 7 }, (_, k) => k + 3));
    expect(freezesToApply(seven, [], NOON)).toEqual([]);
  });

  it("keeps used freezes in the frozen set", () => {
    expect(frozenDays(logOf([1]), ["2026-11-01"], NOON).has("2026-11-01")).toBe(true);
  });
});

describe("readiness", () => {
  it("is zero with nothing done, and full when everything is", () => {
    expect(computeReadiness(input()).score).toBe(0);
    const all = computeReadiness(
      input({
        read: new Set(["a", "b", "c", "d", "e", "f", "g", "h"]),
        passed: new Set(["e", "f"]),
        exercises: 50,
        confidence: { knew: 70, shaky: 0, blank: 0 },
        mock: { score: 1, sessions: 6 },
        skills: { react: "strong" },
      })
    );
    expect(all.score).toBe(100);
    expect(all.band).toBe("strong");
    expect(all.gaps).toEqual([]);
  });

  it("weights add up to 100 and skip checks when the path has none", () => {
    const sum = (r: ReturnType<typeof computeReadiness>) => r.parts.reduce((s, p) => s + p.weight, 0);
    expect(sum(computeReadiness(input()))).toBeCloseTo(100);
    const noChecks: RoleTrack = { ...track, steps: [step("js", ["a", "b"])] };
    const r = computeReadiness(input({ track: noChecks }));
    expect(r.parts.some((p) => p.id === "checks")).toBe(false);
    expect(sum(r)).toBeCloseTo(100);
  });

  it("puts the gap that would lift the score most first, with a real link", () => {
    const r = computeReadiness(input({ read: new Set(["a"]) }));
    expect(r.gaps[0].part).toBe("learn");
    expect(r.gaps[0].href).toBe("/js/b");
    expect(r.gaps.find((g) => g.part === "skills")?.href).toBe("/resume");
  });

  it("asks for the check on read chapters that have one", () => {
    const r = computeReadiness(input({ read: new Set(["e"]) }));
    expect(r.gaps.find((g) => g.part === "checks")?.href).toBe("/dsa/e#check");
  });

  it("points an unsure skill at its topic", () => {
    const r = computeReadiness(input({ skills: { react: "unsure", node: "strong" } }));
    const gap = r.gaps.find((g) => g.part === "skills");
    expect(gap?.title).toBe("Brush up React");
    expect(gap?.href).toBe("/react");
  });

  it("bands the score", () => {
    expect(bandOf(10)).toBe("starting");
    expect(bandOf(50)).toBe("building");
    expect(bandOf(70)).toBe("ready");
    expect(bandOf(90)).toBe("strong");
  });
});

describe("role tracks", () => {
  const base: BaseTracks = {
    frontend: { role: "frontend", title: "F", steps: [step("js", ["a", "b"]), step("book", ["r1"])] },
    backend: {
      role: "backend",
      title: "B",
      steps: [step("node", ["n1"]), step("book", ["r1"]), step("js", ["a", "z"])],
    },
    other: { role: "other", title: "O", steps: [step("book", ["r1"])] },
  };

  it("merges front and back end without counting a chapter twice", () => {
    const full = trackFor("fullstack", base);
    expect(full.steps.flatMap((s) => s.ids)).toEqual(["a", "b", "r1", "n1", "z"]);
    expect(full.steps.find((s) => s.key === "js" && s.ids.includes("z"))?.chapters.map((c) => c.id)).toEqual(["z"]);
  });

  it("falls back to the general path without a role", () => {
    expect(trackFor(null, base)).toBe(base.other);
    expect(trackFor("backend", base)).toBe(base.backend);
  });
});

describe("today's plan", () => {
  const base = {
    track,
    read: new Set<string>(),
    date: null,
    goal: 3,
    doneToday: 0,
    due: 0,
    shaky: 0,
    lastMockAt: null,
    exercises: 0,
    now: NOON,
  };

  it("counts days to the interview in local days", () => {
    expect(daysUntil("2026-11-25", NOON)).toBe(0);
    expect(daysUntil("2026-12-05", NOON)).toBe(10);
    expect(daysUntil("2026-11-24", NOON)).toBe(-1);
  });

  it("spreads what is left over the days before the interview", () => {
    const plan = buildToday({ ...base, date: "2026-11-29" });
    expect(plan.daysLeft).toBe(4);
    expect(plan.remaining).toBe(8);
    expect(plan.perDay).toBe(3);
    expect(plan.tasks.filter((t) => t.kind === "read").map((t) => t.href)).toEqual(["/js/a", "/js/b", "/js/c"]);
    expect(plan.tasks.some((t) => t.kind === "mock")).toBe(true);
  });

  it("puts due reviews first and switches to questions in the last two days", () => {
    const plan = buildToday({ ...base, date: "2026-11-26", due: 2 });
    expect(plan.tasks[0].kind).toBe("review");
    expect(plan.tasks.some((t) => t.kind === "read")).toBe(false);
    expect(plan.tasks.some((t) => t.kind === "questions")).toBe(true);
  });

  it("uses the daily goal when there is no date", () => {
    const plan = buildToday({ ...base, goal: 5 });
    expect(plan.daysLeft).toBeNull();
    expect(plan.tasks.filter((t) => t.kind === "read")).toHaveLength(3);
  });

  it("says the date has passed", () => {
    expect(buildToday({ ...base, date: "2026-11-01" }).passed).toBe(true);
  });
});

describe("profile completeness", () => {
  const empty = {
    name: "ada",
    emailName: "ada",
    hasPicture: false,
    headline: "",
    location: "",
    github: "",
    linkedin: "",
    website: "",
    role: null,
    goal: null,
    experience: null,
    planned: false,
    skills: 0,
  };

  it("does not count a name copied from the email", () => {
    expect(completeness(empty).done).toBe(0);
    expect(completeness({ ...empty, name: "Ada Lovelace" }).items[0].done).toBe(true);
  });

  it("reaches 100 with everything filled", () => {
    const full = completeness({
      ...empty,
      name: "Ada Lovelace",
      hasPicture: true,
      headline: "Frontend engineer",
      location: "Pune",
      github: "ada",
      website: "https://ada.dev",
      role: "frontend",
      goal: "interview",
      experience: "advanced",
      planned: true,
      skills: 4,
    });
    expect(full.percent).toBe(100);
    expect(full.items.every((i) => i.href.startsWith("/account"))).toBe(true);
  });
});
