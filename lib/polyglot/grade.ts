import type { RunnerTestResult } from "@/lib/runner";
import { functionName, typeName } from "@/lib/polyglot/starters";
import type { Json, Polyglot, Signature, ValueType } from "@/lib/polyglot/types";

export const RESULT_MARK = "@@groundwork-case@@ ";

type Ready = Extract<Polyglot, { ok: true }>;

export type HarnessLanguage = "python" | "ruby" | "php" | "lua" | "cpp" | "c";

export const HARNESS_LANGUAGES: readonly string[] = ["python", "ruby", "php", "lua", "cpp", "c"];

function dims(t: ValueType): { base: ValueType["k"]; n: number } {
  let n = 0;
  while (t.k === "list") {
    n++;
    t = t.of;
  }
  return { base: t.k === "unknown" ? "int" : t.k, n };
}

export function canGrade(lang: string, sig: Signature): boolean {
  if (lang !== "c") return HARNESS_LANGUAGES.includes(lang);
  const ok = (t: ValueType) => {
    const d = dims(t);
    return d.n === 0 || (d.n === 1 && d.base !== "string");
  };
  return sig.params.every((p) => ok(p.type)) && ok(sig.returns);
}

function cString(value: string): string {
  return `"${[...new TextEncoder().encode(value)]
    .map((b) =>
      b >= 0x20 && b < 0x7f && b !== 0x22 && b !== 0x5c && b !== 0x3f
        ? String.fromCharCode(b)
        : `\\${b.toString(8).padStart(3, "0")}`
    )
    .join("")}"`;
}

function cppLiteral(value: Json, type: ValueType): string {
  if (Array.isArray(value)) {
    const of = type.k === "list" ? type.of : ({ k: "unknown" } as ValueType);
    return `{${value.map((v) => cppLiteral(v, of)).join(", ")}}`;
  }
  if (typeof value === "string") return `std::string(${cString(value)}, ${new TextEncoder().encode(value).length})`;
  if (typeof value === "number") return type.k === "float" && Number.isInteger(value) ? `${value}.0` : String(value);
  return String(value);
}

const CPP_PRINT = String.raw`
static void __gw_put(std::ostream& o, long long v) { o << v; }
static void __gw_put(std::ostream& o, int v) { o << v; }
static void __gw_put(std::ostream& o, double v) { if (std::isfinite(v)) o << std::setprecision(17) << v; else o << "null"; }
static void __gw_put(std::ostream& o, bool v) { o << (v ? "true" : "false"); }
static void __gw_put(std::ostream& o, const std::string& s) {
  o << '"';
  for (unsigned char c : s) {
    if (c == '"' || c == '\\') o << '\\' << c;
    else if (c < 0x20) { char b[8]; std::snprintf(b, sizeof b, "\\u%04x", c); o << b; }
    else o << c;
  }
  o << '"';
}
template <class T> static void __gw_put(std::ostream& o, const std::vector<T>& v) {
  o << '[';
  for (size_t i = 0; i < v.size(); i++) { if (i) o << ','; __gw_put(o, static_cast<T>(v[i])); }
  o << ']';
}
`;

const C_PRINT = String.raw`
#include <stdio.h>
#include <math.h>
#include <stdbool.h>
static void __gw_int(long long v) { printf("%lld", v); }
static void __gw_double(double v) { if (isfinite(v)) printf("%.17g", v); else printf("null"); }
static void __gw_bool(bool v) { printf(v ? "true" : "false"); }
static void __gw_str(const char* s) {
  if (!s) { printf("null"); return; }
  putchar('"');
  for (const unsigned char* p = (const unsigned char*)s; *p; p++) {
    if (*p == '"' || *p == '\\') { putchar('\\'); putchar(*p); }
    else if (*p < 0x20) printf("\\u%04x", *p);
    else putchar(*p);
  }
  putchar('"');
}
`;

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
  const sig = poly.signature;
  switch (lang) {
    case "cpp": {
      const blocks = poly.tests.flatMap((t, ti) =>
        t.cases.map((c, ci) => {
          const decls = sig.params.map(
            (p, i) => `    ${typeName("cpp", p.type)} __a${i} = ${cppLiteral(c.args[i], p.type)};`
          );
          const call = `${fn}(${sig.params.map((_, i) => `__a${i}`).join(", ")})`;
          return `  {
${decls.join("\n")}
    auto __r = ${call};
    std::cout << ${mark} << "[${ti},${ci},";
    __gw_put(std::cout, __r);
    std::cout << "]" << std::endl;
  }`;
        })
      );
      return `${code}

#include <iostream>
#include <iomanip>
#include <cmath>
#include <cstdio>
#include <string>
#include <vector>
${CPP_PRINT}
int main() {
${blocks.join("\n")}
  return 0;
}
`;
    }
    case "c": {
      const put = (t: ValueType, expr: string, size = "") => {
        const d = dims(t);
        const one = (e: string) =>
          d.base === "float"
            ? `__gw_double(${e})`
            : d.base === "bool"
              ? `__gw_bool(${e})`
              : d.base === "string"
                ? `__gw_str(${e})`
                : `__gw_int(${e})`;
        if (!d.n) return `${one(expr)};`;
        return `putchar('['); for (int __i = 0; __i < ${size}; __i++) { if (__i) putchar(','); ${one(`${expr}[__i]`)}; } putchar(']');`;
      };
      const blocks = poly.tests.flatMap((t, ti) =>
        t.cases.map((c, ci) => {
          const decls: string[] = [];
          const args: string[] = [];
          sig.params.forEach((p, i) => {
            const d = dims(p.type);
            const v = c.args[i];
            if (d.n) {
              const items = (v as Json[]).map((x) => cppLiteral(x, p.type.k === "list" ? p.type.of : p.type));
              decls.push(
                `    ${typeName("c", d.base === "float" ? { k: "float" } : d.base === "bool" ? { k: "bool" } : { k: "int" })} __a${i}[] = {${items.length ? items.join(", ") : "0"}};`
              );
              args.push(`__a${i}`, String(items.length));
            } else if (d.base === "string") {
              decls.push(`    char __a${i}[] = ${cString(v as string)};`);
              args.push(`__a${i}`);
            } else args.push(cppLiteral(v, p.type));
          });
          const returnsList = dims(sig.returns).n > 0;
          if (returnsList) args.push("&__rs");
          return `  {
${decls.join("\n")}
    int __rs = 0;
    ${typeName("c", sig.returns)} __r = ${fn}(${args.join(", ")});
    (void)__rs;
    printf("%s[${ti},${ci},", ${mark});
    ${put(sig.returns, "__r", "__rs")}
    printf("]\\n");
    fflush(stdout);
  }`;
        })
      );
      return `${code}
${C_PRINT}
int main(void) {
${blocks.join("\n")}
  return 0;
}
`;
    }
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
