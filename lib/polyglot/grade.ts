import type { RunnerTestResult } from "@/lib/runner";
import { functionName } from "@/lib/polyglot/starters";
import type { Json, Polyglot } from "@/lib/polyglot/types";

export const RESULT_MARK = "@@groundwork-case@@ ";

type Ready = Extract<Polyglot, { ok: true }>;

export type HarnessLanguage = "python" | "ruby" | "php" | "lua";

export const HARNESS_LANGUAGES: readonly string[] = ["python", "ruby", "php", "lua"];

function show(v: Json | undefined): string {
  return v === undefined ? "nothing" : JSON.stringify(v);
}

function same(a: Json | undefined, b: Json): boolean {
  if (typeof a === "number" && typeof b === "number") return Math.abs(a - b) <= 1e-6 * Math.max(1, Math.abs(b));
  if (Array.isArray(a) && Array.isArray(b)) return a.length === b.length && a.every((x, i) => same(x, b[i]));
  return a === b;
}

function luaLiteral(value: Json): string {
  if (value === null) return "nil";
  if (typeof value === "boolean" || typeof value === "number") return String(value);
  if (typeof value === "string")
    return `"${[...value].map((ch) => (/[\w .,:;!?()[\]{}+\-*/=<>@$%^&|~`'#]/.test(ch) ? ch : [...new TextEncoder().encode(ch)].map((b) => `\\${b}`).join(""))).join("")}"`;
  return `{${value.map(luaLiteral).join(", ")}}`;
}

const LUA_JSON = String.raw`
local function __enc(v)
  local t = type(v)
  if v == nil then return "null" end
  if t == "boolean" then return tostring(v) end
  if t == "number" then
    if v ~= v or v == math.huge or v == -math.huge then return "null" end
    if math.type(v) == "integer" then return tostring(v) end
    return string.format("%.17g", v)
  end
  if t == "string" then
    return '"' .. v:gsub('[%c"\\]', function(c) return string.format("\\u%04x", c:byte()) end) .. '"'
  end
  if t == "table" then
    local parts = {}
    for i = 1, #v do parts[i] = __enc(v[i]) end
    return "[" .. table.concat(parts, ",") .. "]"
  end
  return "null"
end
`;

export function withHarness(lang: HarnessLanguage, code: string, poly: Ready): string {
  const fn = functionName(lang, poly.signature);
  const args = poly.tests.map((t) => t.cases.map((c) => c.args));
  const cases = JSON.stringify(args);
  const mark = JSON.stringify(RESULT_MARK);
  switch (lang) {
    case "python":
      return `${code}\n\n# ---- grader ----\nimport json as __json\nfor __ti, __test in enumerate(__json.loads(${JSON.stringify(cases)})):\n    for __ci, __args in enumerate(__test):\n        try:\n            __got = ${fn}(*__args)\n            print(${mark} + __json.dumps([__ti, __ci, __got]))\n        except Exception as __err:\n            print(${mark} + __json.dumps([__ti, __ci, None, type(__err).__name__ + ": " + str(__err)]))\n`;
    case "ruby":
      return `${code}\n\nrequire "json"\nJSON.parse(${JSON.stringify(cases)}).each_with_index do |__test, __ti|\n  __test.each_with_index do |__args, __ci|\n    begin\n      __got = ${fn}(*__args)\n      $stdout.write(${mark} + JSON.generate([__ti, __ci, __got]) + "\\n")\n    rescue => __err\n      $stdout.write(${mark} + JSON.generate([__ti, __ci, nil, "#{__err.class}: #{__err.message}"]) + "\\n")\n    end\n  end\nend\n`;
    case "php": {
      const body = /^\s*<\?php/.test(code) ? code : `<?php\n${code}`;
      const quoted = cases.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
      return `${body}\n\n$__cases = json_decode('${quoted}', true);\nforeach ($__cases as $__ti => $__test) {\n  foreach ($__test as $__ci => $__args) {\n    try {\n      $__got = ${fn}(...$__args);\n      echo ${mark} . json_encode([$__ti, $__ci, $__got]) . "\\n";\n    } catch (Throwable $__err) {\n      echo ${mark} . json_encode([$__ti, $__ci, null, get_class($__err) . ": " . $__err->getMessage()]) . "\\n";\n    }\n  }\n}\n`;
    }
    case "lua":
      return `${code}\n${LUA_JSON}\nlocal __cases = ${luaLiteral(args as unknown as Json)}\nfor __ti, __test in ipairs(__cases) do\n  for __ci, __args in ipairs(__test) do\n    local __ok, __got = pcall(${fn}, table.unpack(__args))\n    if __ok then\n      print(${mark} .. "[" .. (__ti - 1) .. "," .. (__ci - 1) .. "," .. __enc(__got) .. "]")\n    else\n      print(${mark} .. "[" .. (__ti - 1) .. "," .. (__ci - 1) .. ",null," .. __enc(tostring(__got)) .. "]")\n    end\n  end\nend\n`;
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
