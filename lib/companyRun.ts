export interface RunCheck {
  name: string;
  body: string;
}

const short = (value: unknown, cap = 56) => {
  const text = JSON.stringify(value) ?? "undefined";
  return text.length > cap ? `${text.slice(0, cap - 1)}…` : text;
};

export function codingChecks(entry: string, cases: { args: unknown[]; expected: unknown }[]): RunCheck[] {
  return cases.map((testCase) => ({
    name: `${entry}(${testCase.args.map((arg) => short(arg, 30)).join(", ")}) → ${short(testCase.expected, 30)}`,
    body: `assert.deepEqual(${entry}(...structuredClone(${JSON.stringify(testCase.args)})), ${JSON.stringify(testCase.expected)});`,
  }));
}

export function lldChecks(checks: { name: string; expr: string; expected: unknown }[]): RunCheck[] {
  return checks.map((check) => ({
    name: check.name,
    body: `assert.deepEqual((${check.expr}), ${JSON.stringify(check.expected)});`,
  }));
}

export function codingPrefill(entry: string, cases: { args: unknown[] }[]): string {
  const first = cases[0]?.args ?? [];
  return `console.log(${entry}(${first.map((arg) => JSON.stringify(arg)).join(", ")}));`;
}

export function lldPrefill(checks: { expr: string }[]): string {
  return `console.log(${checks[0]?.expr ?? "1 + 1"});`;
}
