export const PYODIDE_VERSION = "314.0.6";
export const SQL_JS_VERSION = "1.14.2";

export const PYODIDE_BASE =
  process.env.NEXT_PUBLIC_PYODIDE_BASE || `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export const SQL_JS_BASE =
  process.env.NEXT_PUBLIC_SQL_JS_BASE || `https://cdn.jsdelivr.net/npm/sql.js@${SQL_JS_VERSION}/dist/`;

export const WASMOON_VERSION = "1.16.0";
export const RUBY_WASM_VERSION = "2.10.1";
export const PHP_WASM_VERSION = "0.1.0";
export const CLANG_VERSION = "22.0.0-git20542-10";
export const WASI_SHIM_VERSION = "0.4.2";

const NPM_CDN = process.env.NEXT_PUBLIC_NPM_CDN || "https://cdn.jsdelivr.net/npm/";

export const SCRIPT_RUNTIMES = {
  lua: {
    module: `${NPM_CDN}wasmoon@${WASMOON_VERSION}/+esm`,
    wasm: `${NPM_CDN}wasmoon@${WASMOON_VERSION}/dist/glue.wasm`,
  },
  ruby: {
    module: `${NPM_CDN}@ruby/wasm-wasi@${RUBY_WASM_VERSION}/dist/browser/+esm`,
    wasm: `${NPM_CDN}@ruby/3.4-wasm-wasi@${RUBY_WASM_VERSION}/dist/ruby+stdlib.wasm`,
  },
  php: {
    module: `${NPM_CDN}php-wasm@${PHP_WASM_VERSION}/PhpWeb.mjs`,
    wasm: "",
  },
  clang: {
    module: `${NPM_CDN}@yowasp/clang@${CLANG_VERSION}/gen/bundle.js`,
    wasm: `${NPM_CDN}@bjorn3/browser_wasi_shim@${WASI_SHIM_VERSION}/+esm`,
  },
} as const;

export function wasmOrigins(): string[] {
  const origins = new Set<string>();
  for (const base of [PYODIDE_BASE, SQL_JS_BASE, NPM_CDN]) {
    if (/^https?:\/\//.test(base)) origins.add(new URL(base).origin);
  }
  return [...origins];
}
