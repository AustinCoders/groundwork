/**
 * Where the playground's runtimes come from.
 *
 * Pyodide is 15 MB and sql.js 1.5 MB. Copying them into public/ put 16.5 MB
 * into every deployment, and Vercel keeps every deployment — the project was
 * already past its storage allowance with nothing unusual in the repo. Both are
 * published on jsDelivr at exactly the versions in package.json, so the build
 * no longer carries them.
 *
 * The versions are written out rather than read from package.json because these
 * strings end up in a web worker, where there is no package resolution.
 * tests/wasm-assets.test.ts fails if they drift from what is installed.
 *
 * Set NEXT_PUBLIC_PYODIDE_BASE / NEXT_PUBLIC_SQL_JS_BASE to self-host instead;
 * scripts/copy-wasm-assets.mjs --all writes both into public/wasm/.
 */
export const PYODIDE_VERSION = "314.0.6";
export const SQL_JS_VERSION = "1.14.2";

export const PYODIDE_BASE =
  process.env.NEXT_PUBLIC_PYODIDE_BASE || `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

export const SQL_JS_BASE =
  process.env.NEXT_PUBLIC_SQL_JS_BASE || `https://cdn.jsdelivr.net/npm/sql.js@${SQL_JS_VERSION}/dist/`;

/** The origins the runtimes are fetched from, for the Content-Security-Policy. */
export function wasmOrigins(): string[] {
  const origins = new Set<string>();
  for (const base of [PYODIDE_BASE, SQL_JS_BASE]) {
    if (/^https?:\/\//.test(base)) origins.add(new URL(base).origin);
  }
  return [...origins];
}
