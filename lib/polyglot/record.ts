import vm from "node:vm";
import { assert } from "@/lib/assertKit";
import type { Case, CaseTest, Json, Polyglot, ValueType } from "@/lib/polyglot/types";

interface Recordable {
  kind?: "function" | "component";
  solution: string;
  tests: { name: string; body: string }[];
}

function isPlain(v: unknown): v is Json {
  if (v === null || typeof v === "boolean" || typeof v === "string") return true;
  if (typeof v === "number") return Number.isFinite(v);
  return Array.isArray(v) && v.every(isPlain);
}

export function unify(a: ValueType | null, b: ValueType | null): ValueType | null {
  if (!a || !b) return null;
  if (a.k === "unknown") return b;
  if (b.k === "unknown") return a;
  if (a.k === b.k && a.k !== "list") return a;
  if ((a.k === "int" && b.k === "float") || (a.k === "float" && b.k === "int")) return { k: "float" };
  if (a.k === "list" && b.k === "list") {
    const of = unify(a.of, b.of);
    return of && { k: "list", of };
  }
  return null;
}

export function typeOf(v: Json): ValueType | null {
  if (v === null) return null;
  if (typeof v === "boolean") return { k: "bool" };
  if (typeof v === "string") return { k: "string" };
  if (typeof v === "number") return Number.isInteger(v) ? { k: "int" } : { k: "float" };
  let of: ValueType | null = { k: "unknown" };
  for (const x of v) of = unify(of, typeOf(x));
  return of && { k: "list", of };
}

function paramNames(solution: string, name: string): string[] | null {
  const m = solution.match(new RegExp(`function\\s+${name}\\s*\\(([^)]*)\\)`));
  if (!m) return null;
  const names = m[1]
    .split(",")
    .map((p) => p.trim().replace(/\s*=.*$/, ""))
    .filter(Boolean);
  return names.every((n) => /^[A-Za-z_$][\w$]*$/.test(n)) ? names : null;
}

export function recordPolyglot(ex: Recordable): Polyglot {
  if (ex.kind === "component") return { ok: false, reason: "A React component only runs as JavaScript." };
  const name = ex.solution.match(/^function\s+([A-Za-z_$][\w$]*)\s*\(/m)?.[1];
  if (!name) return { ok: false, reason: "This one is about JavaScript itself, so it stays in JavaScript." };
  const names = paramNames(ex.solution, name);
  if (!names) return { ok: false, reason: "Its function takes arguments only JavaScript can express." };
  if (ex.tests.some((t) => /\bawait\b|setTimeout|Promise/.test(t.body))) {
    return { ok: false, reason: "It is about JavaScript's async model, so it stays in JavaScript." };
  }

  const direct = new RegExp(`^assert\\.(equal|deepEqual|strictEqual|deepStrictEqual)\\(\\s*${name}\\(`);
  const chained = new RegExp(`${name}\\([^;]*?\\)\\s*(\\.|\\[)`);
  const isDirect = (body: string) => {
    const statements = body
      .split(/;\s*\n|\n/)
      .map((l) => l.trim())
      .filter(Boolean);
    return (
      statements.some((l) => l.startsWith("assert.")) &&
      statements.every((l) => (l.startsWith("assert.") ? direct.test(l) && !chained.test(l) : /^const \w+ = /.test(l)))
    );
  };

  const tests: CaseTest[] = [];
  let skipped = 0;
  for (const test of ex.tests) {
    if (!isDirect(test.body)) {
      skipped++;
      continue;
    }
    const cases: Case[] = [];
    let plain = true;
    const record = (args: unknown[], result: unknown) => {
      if (!args.every(isPlain) || !isPlain(result) || result === null) plain = false;
      else cases.push({ args: structuredClone(args) as Json[], expected: structuredClone(result) as Json });
    };
    try {
      vm.runInNewContext(
        `(function () {\n${ex.solution}\nconst __real = ${name};\n${name} = function (...a) { const before = JSON.parse(JSON.stringify(a ?? null)); const r = __real.apply(this, a); __record(before, r); return r; };\n${test.body}\n})()`,
        { assert, __record: record, console: { log() {}, info() {}, warn() {}, error() {} } },
        { timeout: 2000 }
      );
    } catch {
      return { ok: false, reason: "Its tests check something besides what the function returns." };
    }
    if (!plain)
      return { ok: false, reason: "It works on JavaScript objects, which other languages spell differently." };
    if (!cases.length) return { ok: false, reason: "Its tests check more than the function's return value." };
    tests.push({ name: test.name, cases });
  }
  if (!tests.length)
    return { ok: false, reason: "Its tests check properties of the answer that only JavaScript can replay." };

  const params = names.map((n, i) => {
    let t: ValueType | null = { k: "unknown" };
    for (const test of tests) for (const c of test.cases) t = unify(t, i < c.args.length ? typeOf(c.args[i]) : null);
    return { name: n, type: t };
  });
  let returns: ValueType | null = { k: "unknown" };
  for (const test of tests) for (const c of test.cases) returns = unify(returns, typeOf(c.expected));
  if (
    !returns ||
    params.some((p) => !p.type) ||
    tests.some((t) => t.cases.some((c) => c.args.length !== names.length))
  ) {
    return { ok: false, reason: "Its arguments change type between calls, which a typed language cannot declare." };
  }
  return {
    ok: true,
    signature: { name, params: params as { name: string; type: ValueType }[], returns },
    tests,
    skipped,
  };
}
