export const PYODIDE_VERSION = "314.0.6";
export const SQL_JS_VERSION = "1.14.2";

export const PYODIDE_BASE =
  process.env.NEXT_PUBLIC_PYODIDE_BASE || `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export const SQL_JS_BASE =
  process.env.NEXT_PUBLIC_SQL_JS_BASE || `https://cdn.jsdelivr.net/npm/sql.js@${SQL_JS_VERSION}/dist/`;

export function wasmOrigins(): string[] {
  const origins = new Set<string>();
  for (const base of [PYODIDE_BASE, SQL_JS_BASE]) {
    if (/^https?:\/\//.test(base)) origins.add(new URL(base).origin);
  }
  return [...origins];
}
