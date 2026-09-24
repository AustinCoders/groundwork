import type { RunnerTestResult } from "@/lib/runner";
import { functionName } from "@/lib/polyglot/starters";
import type { Json, Polyglot } from "@/lib/polyglot/types";

export const RESULT_MARK = "@@groundwork-case@@ ";

type Ready = Extract<Polyglot, { ok: true }>;

export type HarnessLanguage = "python";

function show(v: Json | undefined): string {
  return v === undefined ? "nothing" : JSON.stringify(v);
}

function same(a: Json | undefined, b: Json): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
  return a === b;
}

export function withHarness(lang: HarnessLanguage, code: string, poly: Ready): string {
  const fn = functionName(lang, poly.signature);
  const cases = JSON.stringify(poly.tests.map((t) => t.cases.map((c) => c.args)));
  switch (lang) {
    case "python":
      return `${code}\n\n# ---- grader ----\nimport json as __json\nfor __ti, __test in enumerate(__json.loads(${JSON.stringify(cases)})):\n    for __ci, __args in enumerate(__test):\n        try:\n            __got = ${fn}(*__args)\n            print(${JSON.stringify(RESULT_MARK)} + __json.dumps([__ti, __ci, __got]))\n        except Exception as __err:\n            print(${JSON.stringify(RESULT_MARK)} + __json.dumps([__ti, __ci, None, type(__err).__name__ + ": " + str(__err)]))\n`;
  }
}

export function parseResultLine(text: string): [number, number, Json, string?][] {
  const out: [number, number, Json, string?][] = [];
  for (const line of text.split("\n")) {
    if (!line.startsWith(RESULT_MARK)) continue;
    try {
      out.push(JSON.parse(line.slice(RESULT_MARK.length)));
    } catch {}
  }
  return out;
}

export function isResultLine(text: string): boolean {
  return text.split("\n").some((l) => l.startsWith(RESULT_MARK));
}

export function gradeResults(poly: Ready, rows: [number, number, Json, string?][]): RunnerTestResult[] {
  const got = new Map(rows.map(([t, c, value, error]) => [`${t}:${c}`, { value, error }]));
  const fn = poly.signature.name;
  return poly.tests.map((test, index) => {
    for (let ci = 0; ci < test.cases.length; ci++) {
      const c = test.cases[ci];
      const call = `${fn}(${c.args.map((a) => JSON.stringify(a)).join(", ")})`;
      const r = got.get(`${index}:${ci}`);
      if (!r)
        return {
          index,
          name: test.name,
          ok: false,
          message: `${call} never returned — it crashed or ran out of time.`,
        };
      if (r.error) return { index, name: test.name, ok: false, message: `${call} threw ${r.error}` };
      if (!same(r.value, c.expected)) {
        return {
          index,
          name: test.name,
          ok: false,
          message: `${call} returned ${show(r.value)}, expected ${show(c.expected)}`,
        };
      }
    }
    return { index, name: test.name, ok: true };
  });
}
