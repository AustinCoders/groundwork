import { describe, expect, it } from "vitest";
import { practice } from "@/content/practice";
import { gradeResults, parseResultLine, RESULT_MARK, withHarness } from "@/lib/polyglot/grade";
import { recordPolyglot } from "@/lib/polyglot/record";
import { starterFor, typeName, type StarterLanguage } from "@/lib/polyglot/starters";
import type { Polyglot } from "@/lib/polyglot/types";

const byId = (id: string) => practice.find((e) => e.id === id)!;
type Ready = Extract<Polyglot, { ok: true }>;

describe("recording a problem for every language", () => {
  const twoSum = recordPolyglot(byId("ex-two-sum")) as Ready;

  it("reads the signature off the calls the tests make", () => {
    expect(twoSum.ok).toBe(true);
    expect(twoSum.signature).toEqual({
      name: "twoSum",
      params: [
        { name: "nums", type: { k: "list", of: { k: "int" } } },
        { name: "target", type: { k: "int" } },
      ],
      returns: { k: "list", of: { k: "int" } },
    });
    expect(twoSum.tests[0].cases[0]).toEqual({ args: [[2, 7, 11, 15], 9], expected: [0, 1] });
  });

  it("covers most of the problems, and every one it covers replays its own solution", () => {
    let covered = 0;
    for (const ex of practice) {
      if (!ex.tests.length) continue;
      const poly = recordPolyglot(ex);
      if (!poly.ok) continue;
      covered++;
      // what the grader will compare against is what the reference returns
      const fn = new Function(`${ex.solution}\nreturn ${poly.signature.name};`)();
      for (const t of poly.tests)
        for (const c of t.cases) expect(fn(...structuredClone(c.args)), `${ex.id}: ${t.name}`).toEqual(c.expected);
    }
    expect(covered).toBeGreaterThanOrEqual(200);
  });

  it("leaves JavaScript-only problems alone, and says why", () => {
    const component = practice.find((e) => e.kind === "component")!;
    const poly = recordPolyglot(component);
    expect(poly.ok).toBe(false);
    expect(poly.ok ? "" : poly.reason).toMatch(/JavaScript/);
  });

  it("keeps tests that check a property rather than an answer out of other languages", () => {
    const random = practice.find((e) => e.tests.some((t) => /randomInt\(/.test(t.body)));
    if (random) expect(recordPolyglot(random).ok).toBe(false);
  });
});

describe("starters", () => {
  const LANGS: StarterLanguage[] = [
    "typescript",
    "python",
    "ruby",
    "php",
    "lua",
    "c",
    "cpp",
    "java",
    "go",
    "rust",
    "kotlin",
    "swift",
    "csharp",
  ];

  it("names the function the grader calls, in every language", () => {
    const poly = recordPolyglot(byId("ex-two-sum")) as Ready;
    for (const lang of LANGS) {
      const code = starterFor(lang, poly.signature, "Two Sum");
      expect(code, lang).toMatch(lang === "ruby" || lang === "rust" ? /two_sum/ : /twoSum/);
      expect(code, lang).toContain("Two Sum");
    }
  });

  it("spells nested lists the way each language does", () => {
    const grid = { k: "list", of: { k: "list", of: { k: "int" } } } as const;
    expect(typeName("python", grid)).toBe("list[list[int]]");
    expect(typeName("cpp", grid)).toBe("vector<vector<int>>");
    expect(typeName("java", grid)).toBe("int[][]");
    expect(typeName("go", grid)).toBe("[][]int");
    expect(typeName("rust", grid)).toBe("Vec<Vec<i32>>");
    expect(typeName("kotlin", grid)).toBe("Array<IntArray>");
    expect(typeName("swift", grid)).toBe("[[Int]]");
  });
});

describe("grading", () => {
  const poly = recordPolyglot(byId("ex-two-sum")) as Ready;

  it("passes a test only when every case matches", () => {
    const rows = poly.tests.flatMap((t, ti) =>
      t.cases.map((c, ci) => [ti, ci, c.expected] as [number, number, typeof c.expected])
    );
    rows[0] = [0, 0, [1, 0]];
    const results = gradeResults(poly, rows);
    expect(results[0]).toMatchObject({ ok: false, message: "twoSum([2,7,11,15], 9) returned [1,0], expected [0,1]" });
    expect(results.slice(1).every((r) => r.ok)).toBe(true);
  });

  it("reports a throw and a missing result as failures", () => {
    const results = gradeResults(poly, [[0, 0, null, "KeyError: 3"]]);
    expect(results[0].message).toMatch(/threw KeyError: 3/);
    expect(results[1].message).toMatch(/never returned/);
  });

  it("reads the grader's marked lines and ignores the reader's own output", () => {
    const text = `hello\n${RESULT_MARK}[0,0,[0,1]]\n${RESULT_MARK}[0,1,`;
    expect(parseResultLine(text)).toEqual([[0, 0, [0, 1]]]);
  });

  it("appends a Python grader that calls the reader's function", () => {
    const code = withHarness("python", "def twoSum(nums, target):\n    return []", poly);
    expect(code).toContain("__got = twoSum(*__args)");
  });
});
