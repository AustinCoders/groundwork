import type { Signature, ValueType } from "@/lib/polyglot/types";

export type StarterLanguage =
  | "typescript"
  | "python"
  | "ruby"
  | "php"
  | "lua"
  | "c"
  | "cpp"
  | "java"
  | "go"
  | "rust"
  | "kotlin"
  | "swift"
  | "csharp";

export function snake(name: string): string {
  return name.replace(/([a-z0-9])([A-Z])/g, "$1_$2").toLowerCase();
}

export function functionName(lang: StarterLanguage, sig: Signature): string {
  return lang === "ruby" || lang === "rust" ? snake(sig.name) : sig.name;
}

function depth(t: ValueType): { base: ValueType["k"]; dims: number } {
  let dims = 0;
  while (t.k === "list") {
    dims++;
    t = t.of;
  }
  return { base: t.k === "unknown" ? "int" : t.k, dims };
}

type Base = "int" | "float" | "bool" | "string";

const NAMES: Record<string, Record<Base, string>> = {
  typescript: { int: "number", float: "number", bool: "boolean", string: "string" },
  python: { int: "int", float: "float", bool: "bool", string: "str" },
  cpp: { int: "int", float: "double", bool: "bool", string: "string" },
  c: { int: "int", float: "double", bool: "bool", string: "char*" },
  java: { int: "int", float: "double", bool: "boolean", string: "String" },
  go: { int: "int", float: "float64", bool: "bool", string: "string" },
  rust: { int: "i32", float: "f64", bool: "bool", string: "String" },
  kotlin: { int: "Int", float: "Double", bool: "Boolean", string: "String" },
  swift: { int: "Int", float: "Double", bool: "Bool", string: "String" },
  csharp: { int: "int", float: "double", bool: "bool", string: "string" },
};

export function typeName(lang: StarterLanguage, t: ValueType): string {
  const { base, dims } = depth(t);
  const b = NAMES[lang]?.[base as Base] ?? "any";
  switch (lang) {
    case "typescript":
      return b + "[]".repeat(dims);
    case "python":
      return dims ? "list[".repeat(dims) + b + "]".repeat(dims) : b;
    case "cpp":
      return dims ? "vector<".repeat(dims) + b + ">".repeat(dims) : b;
    case "c":
      return b + "*".repeat(dims);
    case "java":
    case "csharp":
      return b + "[]".repeat(dims);
    case "go":
      return "[]".repeat(dims) + b;
    case "rust":
      return dims ? "Vec<".repeat(dims) + b + ">".repeat(dims) : b;
    case "kotlin": {
      if (!dims) return b;
      const inner =
        base === "int"
          ? "IntArray"
          : base === "float"
            ? "DoubleArray"
            : base === "bool"
              ? "BooleanArray"
              : `Array<${b}>`;
      return "Array<".repeat(dims - 1) + inner + ">".repeat(dims - 1);
    }
    case "swift":
      return dims ? "[".repeat(dims) + b + "]".repeat(dims) : b;
    default:
      return b;
  }
}

const SCALAR_ZERO: Record<string, Record<Base, string>> = {
  default: { int: "0", float: "0.0", bool: "false", string: '""' },
  typescript: { int: "0", float: "0", bool: "false", string: '""' },
  python: { int: "0", float: "0.0", bool: "False", string: '""' },
  php: { int: "0", float: "0.0", bool: "false", string: "''" },
  lua: { int: "0", float: "0", bool: "false", string: '""' },
  rust: { int: "0", float: "0.0", bool: "false", string: "String::new()" },
};

function zero(lang: StarterLanguage, t: ValueType): string {
  const { base, dims } = depth(t);
  if (dims) {
    return (
      {
        typescript: "[]",
        python: "[]",
        ruby: "[]",
        php: "[]",
        lua: "{}",
        cpp: "{}",
        c: "NULL",
        java: `new ${typeName("java", t).replace(/\[\]/, "[0]")}`,
        go: "nil",
        rust: "vec![]",
        kotlin: base === "int" && dims === 1 ? "intArrayOf()" : "arrayOf()",
        swift: "[]",
        csharp: `new ${typeName("csharp", t).replace(/\[\]/, "[0]")}`,
      } as Record<StarterLanguage, string>
    )[lang];
  }
  return SCALAR_ZERO[lang]?.[base as Base] ?? SCALAR_ZERO.default[base as Base];
}

export function starterFor(lang: StarterLanguage, sig: Signature, title: string): string {
  const fn = functionName(lang, sig);
  const params = sig.params;
  const ret = sig.returns;
  const T = (t: ValueType) => typeName(lang, t);
  const Z = zero(lang, ret);
  const note = (c: string) =>
    `${c} ${title}\n${c} Return the answer — the tests call ${fn}(${params.map((p) => p.name).join(", ")}).\n`;

  switch (lang) {
    case "typescript":
      return `${note("//")}\nfunction ${fn}(${params.map((p) => `${p.name}: ${T(p.type)}`).join(", ")}): ${T(ret)} {\n  // your code here\n  return ${Z};\n}\n`;
    case "python":
      return `${note("#")}\ndef ${fn}(${params.map((p) => `${p.name}: ${T(p.type)}`).join(", ")}) -> ${T(ret)}:\n    # your code here\n    return ${Z}\n`;
    case "ruby":
      return `${note("#")}\ndef ${fn}(${params.map((p) => snake(p.name)).join(", ")})\n  # your code here\n  ${Z}\nend\n`;
    case "php":
      return `<?php\n${note("//")}\nfunction ${fn}(${params.map((p) => `$${p.name}`).join(", ")}) {\n    // your code here\n    return ${Z};\n}\n`;
    case "lua":
      return `${note("--")}-- Tables here start at 1, but indices the tests expect start at 0.\n\nfunction ${fn}(${params.map((p) => p.name).join(", ")})\n  -- your code here\n  return ${Z}\nend\n`;
    case "cpp":
      return `#include <algorithm>\n#include <climits>\n#include <string>\n#include <unordered_map>\n#include <unordered_set>\n#include <vector>\nusing namespace std;\n\n${note("//")}\n${T(ret)} ${fn}(${params.map((p) => `${depth(p.type).dims ? `${T(p.type)}&` : T(p.type)} ${p.name}`).join(", ")}) {\n    // your code here\n    return ${Z};\n}\n`;
    case "c": {
      const args = params.flatMap((p) =>
        depth(p.type).dims ? [`${T(p.type)} ${p.name}`, `int ${p.name}Size`] : [`${T(p.type)} ${p.name}`]
      );
      if (depth(ret).dims) args.push("int* returnSize");
      return `#include <stdbool.h>\n#include <stdlib.h>\n#include <string.h>\n\n${note("//")}// Arrays come with their length; set *returnSize to the length you return.\n\n${T(ret)} ${fn}(${args.join(", ")}) {\n    // your code here\n    return ${Z};\n}\n`;
    }
    case "java":
      return `${note("//")}\nclass Solution {\n    public ${T(ret)} ${fn}(${params.map((p) => `${T(p.type)} ${p.name}`).join(", ")}) {\n        // your code here\n        return ${Z};\n    }\n}\n`;
    case "go":
      return `package main\n\n${note("//")}\nfunc ${fn}(${params.map((p) => `${p.name} ${T(p.type)}`).join(", ")}) ${T(ret)} {\n\t// your code here\n\treturn ${Z}\n}\n`;
    case "rust":
      return `${note("//")}\nfn ${fn}(${params.map((p) => `${snake(p.name)}: ${T(p.type)}`).join(", ")}) -> ${T(ret)} {\n    // your code here\n    ${Z}\n}\n`;
    case "kotlin":
      return `${note("//")}\nfun ${fn}(${params.map((p) => `${p.name}: ${T(p.type)}`).join(", ")}): ${T(ret)} {\n    // your code here\n    return ${Z}\n}\n`;
    case "swift":
      return `${note("//")}\nfunc ${fn}(_ ${params.map((p) => `${p.name}: ${T(p.type)}`).join(", _ ")}) -> ${T(ret)} {\n    // your code here\n    return ${Z}\n}\n`;
    case "csharp":
      return `${note("//")}\npublic class Solution {\n    public ${T(ret)} ${fn}(${params.map((p) => `${T(p.type)} ${p.name}`).join(", ")}) {\n        // your code here\n        return ${Z};\n    }\n}\n`;
  }
}
