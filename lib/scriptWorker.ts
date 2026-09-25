import { SCRIPT_RUNTIMES } from "@/lib/wasmAssets";

type Lang = "lua" | "ruby" | "php" | "c" | "cpp";

interface Engine {
  run(code: string, stdin: string[]): Promise<void>;
  warm?(): Promise<void>;
}

const LINE_MARK = /^\u0002(\d+)\u0003/;

const pending: Record<string, string> = { log: "", error: "" };

function send(kind: string, piece: string) {
  const m = piece.match(LINE_MARK);
  const text = m ? piece.slice(m[0].length) : piece;
  postMessage({ type: "console", payload: { kind, text, line: m ? Number(m[1]) || undefined : undefined } });
}

function emit(kind: string, raw: string) {
  const text = (pending[kind] ?? "") + raw;
  const lines = text.split("\n");
  pending[kind] = lines.pop() ?? "";
  for (const line of lines) send(kind, line);
}

function flush() {
  for (const kind of Object.keys(pending)) {
    if (pending[kind]) send(kind, pending[kind]);
    pending[kind] = "";
  }
}

function load(url: string) {
  return import(/* webpackIgnore: true */ url);
}

const LUA_PRELUDE = `
local __print = print
local __lines = __stdin_lines
print = function(...)
  local info = debug.getinfo(2, "l")
  local parts = {}
  for i = 1, select("#", ...) do parts[i] = tostring((select(i, ...))) end
  __print(string.char(2) .. tostring(info and info.currentline or 0) .. string.char(3) .. table.concat(parts, "\\t"))
end
io.read = function()
  if #__lines == 0 then return nil end
  return table.remove(__lines, 1)
end
`;

async function luaEngine(): Promise<Engine> {
  const { LuaFactory } = await load(SCRIPT_RUNTIMES.lua.module);
  const factory = new LuaFactory(SCRIPT_RUNTIMES.lua.wasm);
  return {
    async run(code, stdin) {
      const lua = await factory.createEngine();
      try {
        lua.global.set("print", (...args: unknown[]) => emit("log", `${args.map(String).join("\t")}\n`));
        lua.global.set("__stdin_lines", stdin);
        await lua.doString(LUA_PRELUDE);
        await lua.doString(code);
      } finally {
        lua.global.close();
      }
    },
  };
}

const RUBY_PRELUDE = `
$__gw_lines = JSON.parse(%q(__STDIN__))
module Kernel
  def __gw_line
    loc = caller_locations(2, 1)&.first
    loc && loc.path == "eval" ? loc.lineno : 0
  end
  def puts(*args)
    mark = "\\u0002#{__gw_line}\\u0003"
    $stdout.write(args.empty? ? "#{mark}\\n" : args.flatten.map { |a| "#{mark}#{a.nil? ? "" : a}\\n" }.join)
    nil
  end
  def p(*args)
    mark = "\\u0002#{__gw_line}\\u0003"
    args.each { |a| $stdout.write("#{mark}#{a.inspect}\\n") }
    args.length <= 1 ? args.first : args
  end
  def gets(*)
    line = $__gw_lines.shift
    line && "#{line}\\n"
  end
end
`;

async function rubyEngine(): Promise<Engine> {
  const { DefaultRubyVM } = await load(SCRIPT_RUNTIMES.ruby.module);
  const rubyModule = await WebAssembly.compileStreaming(fetch(SCRIPT_RUNTIMES.ruby.wasm));
  return {
    async run(code, stdin) {
      const original = { log: console.log, warn: console.warn, error: console.error };
      console.log = (...a: unknown[]) => emit("log", a.join(" "));
      console.warn = (...a: unknown[]) => emit("error", `${a.join(" ")}\n`);
      console.error = (...a: unknown[]) => emit("error", `${a.join(" ")}\n`);
      try {
        const { vm } = await DefaultRubyVM(rubyModule);
        vm.eval('require "json"');
        vm.eval(RUBY_PRELUDE.replace("__STDIN__", JSON.stringify(stdin).replace(/[()\\]/g, "\\$&")));
        const result = vm.eval(
          `begin\n  eval(${JSON.stringify(code).replace(/#/g, "\\#")}, TOPLEVEL_BINDING, "eval", 1)\n  nil\nrescue Exception => e\n  "#{e.class}: #{e.message}\\n" + (e.backtrace || []).grep(/^eval:/).first(3).join("\\n")\nend`
        );
        const failure = result.toString();
        if (failure && failure !== "") throw new Error(failure);
      } finally {
        Object.assign(console, original);
      }
    },
  };
}

function documentStub() {
  const scope = self as unknown as Record<string, unknown>;
  if (!scope.window) scope.window = self;
  if (scope.document) return;
  const noop = () => {};
  const element = {
    style: {},
    appendChild: noop,
    addEventListener: noop,
    removeEventListener: noop,
    setAttribute: noop,
  };
  scope.document = {
    currentScript: null,
    baseURI: self.location.href,
    body: element,
    documentElement: element,
    title: "",
    addEventListener: noop,
    removeEventListener: noop,
    createElement: () => ({ ...element, getContext: () => null }),
    querySelector: () => null,
    getElementById: () => null,
  };
}

async function phpEngine(): Promise<Engine> {
  documentStub();
  const { PhpWeb } = await load(SCRIPT_RUNTIMES.php.module);
  return {
    async run(code) {
      const php = new PhpWeb();
      const onOut = (e: CustomEvent<string[]>) => emit("log", e.detail.join(""));
      const onErr = (e: CustomEvent<string[]>) => emit("error", e.detail.join(""));
      php.addEventListener("output", onOut);
      php.addEventListener("error", onErr);
      try {
        const source = /^\s*<\?php/.test(code) ? code : `<?php\n${code}`;
        const exit = await php.run(source);
        if (typeof exit === "number" && exit !== 0) throw new Error(`PHP exited with status ${exit}`);
      } finally {
        php.removeEventListener("output", onOut);
        php.removeEventListener("error", onErr);
      }
    },
  };
}

interface Clang {
  runClang: (
    args: string[],
    files: Record<string, string | Record<string, string>>,
    options: { stdout: (b: Uint8Array | null) => void; stderr: (b: Uint8Array | null) => void }
  ) => Promise<Record<string, Uint8Array>>;
}

let clangPromise: Promise<[Clang, typeof import("@bjorn3/browser_wasi_shim")]> | null = null;

function loadClang() {
  clangPromise ??= Promise.all([load(SCRIPT_RUNTIMES.clang.module), load(SCRIPT_RUNTIMES.clang.wasm)]);
  return clangPromise;
}

function compilerLine(text: string, file: string) {
  const m = text.match(new RegExp(`^${file.replace(".", "\\.")}:(\\d+):\\d+: (error|warning|note)`));
  return m ? { line: Number(m[1]), kind: m[2] === "error" ? "error" : m[2] === "warning" ? "warn" : "info" } : null;
}

const STD_HEADERS = [
  "algorithm",
  "array",
  "bitset",
  "cassert",
  "cctype",
  "climits",
  "cmath",
  "cstdint",
  "cstdio",
  "cstdlib",
  "cstring",
  "deque",
  "functional",
  "iomanip",
  "iostream",
  "iterator",
  "limits",
  "list",
  "map",
  "memory",
  "numeric",
  "optional",
  "queue",
  "set",
  "sstream",
  "stack",
  "string",
  "string_view",
  "tuple",
  "unordered_map",
  "unordered_set",
  "utility",
  "vector",
]
  .map((h) => `#include <${h}>`)
  .join("\n");

function nativeEngine(lang: "c" | "cpp"): Promise<Engine> {
  return loadClang().then(([clang, shim]) => ({
    async warm() {
      const file = lang === "c" ? "w.c" : "w.cpp";
      const source =
        lang === "c"
          ? "#include <stdio.h>\nint main(void) { return 0; }\n"
          : "#include <iostream>\n#include <string>\n#include <unordered_map>\n#include <vector>\nint main() { return 0; }\n";
      await clang
        .runClang(
          [lang === "c" ? "clang" : "clang++", "-O1", file, "-o", "w.wasm"],
          { [file]: source },
          {
            stdout: () => {},
            stderr: () => {},
          }
        )
        .catch(() => {});
    },
    async run(code, stdin) {
      const file = lang === "c" ? "main.c" : "main.cpp";
      const args =
        lang === "c"
          ? ["clang", "-O1", "-std=c17", file, "-o", "main.wasm", "-lm"]
          : ["clang++", "-O1", "-std=c++20", "-fno-exceptions", file, "-o", "main.wasm"];
      let diagnostics = "";
      const collect = (b: Uint8Array | null) => {
        if (b) diagnostics += new TextDecoder().decode(b);
      };
      let files: Record<string, Uint8Array>;
      try {
        files = await clang.runClang(
          lang === "cpp" ? [...args.slice(0, 1), "-I.", ...args.slice(1)] : args,
          lang === "cpp" ? { [file]: code, bits: { "stdc++.h": STD_HEADERS } } : { [file]: code },
          { stdout: collect, stderr: collect }
        );
      } catch {
        files = {};
      }
      for (const text of diagnostics.split("\n").filter(Boolean)) {
        const where = compilerLine(text, file);
        postMessage({
          type: "console",
          payload: { kind: where?.kind ?? "error", text: text.replace(`${file}:`, "line "), line: where?.line },
        });
      }
      const binary = files["main.wasm"];
      if (!binary) throw new Error("It did not compile — see the errors above.");
      postMessage({ type: "started" });
      const encoder = new TextEncoder();
      const input = new shim.OpenFile(new shim.File(encoder.encode(stdin.map((l) => `${l}\n`).join(""))));
      const out = shim.ConsoleStdout.lineBuffered((line: string) => emit("log", `${line}\n`));
      const err = shim.ConsoleStdout.lineBuffered((line: string) => emit("error", `${line}\n`));
      const wasi = new shim.WASI(["main"], [], [input, out, err]);
      const instance = await WebAssembly.instantiate(await WebAssembly.compile(binary as BufferSource), {
        wasi_snapshot_preview1: wasi.wasiImport,
      });
      let status = 0;
      try {
        status = wasi.start(instance as unknown as { exports: { memory: WebAssembly.Memory; _start: () => unknown } });
      } catch (e) {
        throw new Error(e instanceof Error ? `The program crashed: ${e.message}` : "The program crashed.");
      }
      if (status !== 0) throw new Error(`The program exited with status ${status}.`);
    },
  }));
}

const engines = new Map<Lang, Promise<Engine>>();
const LABEL: Record<Lang, string> = {
  lua: "Lua",
  ruby: "Ruby (~10 MB)",
  php: "PHP (~8 MB)",
  c: "C compiler (~12 MB)",
  cpp: "C++ compiler (~12 MB)",
};

function startEngine(lang: Lang) {
  if (engines.has(lang)) return;
  engines.set(
    lang,
    lang === "lua" ? luaEngine() : lang === "ruby" ? rubyEngine() : lang === "php" ? phpEngine() : nativeEngine(lang)
  );
  engines
    .get(lang)!
    .then((engine) => engine.warm?.())
    .catch(() => engines.delete(lang));
}

self.onmessage = async (event: MessageEvent) => {
  const data = event.data as { type: string; lang: Lang; code: string; stdin?: string };
  if (data?.type === "warm") return startEngine(data.lang);
  if (!data || data.type !== "run") return;
  if (!engines.has(data.lang)) {
    postMessage({
      type: "console",
      payload: { kind: "system", text: `▶ loading the ${LABEL[data.lang]} runtime — one-time, cached after this…` },
    });
    startEngine(data.lang);
  }
  const stdin = String(data.stdin ?? "")
    .replace(/\r\n/g, "\n")
    .split("\n");
  if (stdin.at(-1) === "") stdin.pop();
  try {
    const engine = await engines.get(data.lang)!;
    if (data.lang !== "c" && data.lang !== "cpp") postMessage({ type: "started" });
    await engine.run(data.code, stdin);
    flush();
    postMessage({ type: "done", payload: { results: [] } });
  } catch (err) {
    flush();
    const text = err instanceof Error ? err.message : String(err);
    const line = text.match(/(?:eval|\[string "[^"]*"\]):(\d+)/)?.[1];
    postMessage({ type: "console", payload: { kind: "error", text, line: line ? Number(line) : undefined } });
    postMessage({ type: "done", payload: { results: [], crashed: true } });
  }
};
