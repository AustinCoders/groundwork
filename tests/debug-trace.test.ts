import ts from "typescript";
import { describe, expect, it } from "vitest";
import { instrument } from "@/lib/debug/instrument";
import { toView } from "@/lib/debug/view";

function trace(code: string, lang: "javascript" | "typescript" = "javascript") {
  let js = instrument(ts, code, lang);
  if (lang === "typescript")
    js = ts.transpileModule(js, { compilerOptions: { target: ts.ScriptTarget.ES2020 } }).outputText;
  const steps: { line: number; fn: string; vars: Record<string, unknown> }[] = [];
  const stack: string[] = [];
  const logs: unknown[] = [];
  const t = (line: number, snap: () => Record<string, () => unknown>) => {
    const vars: Record<string, unknown> = {};
    for (const [k, get] of Object.entries(snap())) {
      try {
        vars[k] = structuredClone(get());
      } catch {}
    }
    steps.push({ line, fn: stack.at(-1) ?? "(top)", vars });
  };
  new Function("__t", "__enter", "__exit", "log", js)(
    t,
    (n: string) => stack.push(n),
    () => stack.pop(),
    (v: unknown) => logs.push(v)
  );
  return { steps, logs };
}

describe("the step-through tracer", () => {
  it("records every statement with the variables in scope, without changing what runs", () => {
    const { steps, logs } = trace("let total = 0;\nfor (let i = 1; i <= 3; i++) {\n  total += i;\n}\nlog(total);\n");
    expect(logs).toEqual([6]);
    expect(steps.map((s) => s.line)).toEqual([1, 2, 3, 3, 3, 5]);
    expect(steps[3].vars).toMatchObject({ total: 1, i: 2 });
    expect(steps.at(-1)!.vars.total).toBe(6);
  });

  it("follows calls into functions and arrow functions, naming them", () => {
    const { steps, logs } = trace(
      "function sq(n) {\n  return n * n;\n}\nconst add = (a, b) => a + b;\nlog(add(sq(2), sq(3)));\n"
    );
    expect(logs).toEqual([13]);
    expect(steps.filter((s) => s.fn === "sq").map((s) => s.vars.n)).toEqual([2, 3]);
    expect(steps.find((s) => s.fn === "add")?.vars).toMatchObject({ a: 4, b: 9 });
  });

  it("traces single-statement if/else and loop bodies", () => {
    const { steps, logs } = trace("let x = 0;\nwhile (x < 2) x++;\nif (x === 2) log('two');\nelse log('not');\n");
    expect(logs).toEqual(["two"]);
    expect(steps.filter((s) => s.line === 2)).toHaveLength(3);
  });

  it("works on TypeScript", () => {
    const { logs } = trace(
      "const xs: number[] = [3, 1, 2];\nconst sorted = [...xs].sort((a, b) => a - b);\nlog(sorted);\n",
      "typescript"
    );
    expect(logs).toEqual([[1, 2, 3]]);
  });
});

describe("drawing values", () => {
  it("recognises linked lists, cycles and trees", () => {
    const c = { val: 3, next: null as unknown };
    const b = { val: 2, next: c };
    const a = { val: 1, next: b };
    expect(toView(a)).toMatchObject({ t: "list", cycle: false, items: [{ v: "1" }, { v: "2" }, { v: "3" }] });
    c.next = a;
    expect(toView(a)).toMatchObject({ t: "list", cycle: true });
    const tree = { val: 2, left: { val: 1, left: null, right: null }, right: { val: 3, left: null, right: null } };
    expect(toView(tree)).toMatchObject({
      t: "tree",
      root: { v: { v: "2" }, l: { v: { v: "1" } }, r: { v: { v: "3" } } },
    });
  });

  it("keeps arrays, maps and sets small", () => {
    expect(toView(Array.from({ length: 100 }, (_, i) => i))).toMatchObject({ t: "arr", len: 100 });
    expect((toView(Array.from({ length: 100 }, (_, i) => i)) as { items: unknown[] }).items).toHaveLength(40);
    expect(toView(new Map([["a", 1]]))).toMatchObject({ t: "map", len: 1 });
  });
});
