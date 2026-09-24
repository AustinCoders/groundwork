import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { PYODIDE_BASE, PYODIDE_VERSION, SQL_JS_BASE, SQL_JS_VERSION, wasmOrigins } from "@/lib/wasmAssets";

/**
 * The CDN URLs carry version numbers that are written out by hand, because they
 * are read inside a web worker where there is no package resolution. A bump in
 * package.json that does not reach lib/wasmAssets.ts would serve the browser a
 * runtime from a different version than the one the code was built against —
 * silently, and only for the people who open the playground.
 */
const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
const installed = (name: string) =>
  JSON.parse(readFileSync(join(process.cwd(), "node_modules", name, "package.json"), "utf8")).version as string;

describe("playground runtime versions", () => {
  it("matches the installed Pyodide", () => {
    expect(PYODIDE_VERSION).toBe(installed("pyodide"));
  });

  it("matches the installed sql.js", () => {
    expect(SQL_JS_VERSION).toBe(installed("sql.js"));
  });

  it("keeps both runtimes as declared dependencies", () => {
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    expect(deps.pyodide, "pyodide is loaded from a CDN but its version is still pinned by package.json").toBeTruthy();
    expect(deps["sql.js"]).toBeTruthy();
  });

  it("builds urls that end in a slash, so a filename can be appended", () => {
    expect(PYODIDE_BASE.endsWith("/")).toBe(true);
    expect(SQL_JS_BASE.endsWith("/")).toBe(true);
  });

  it("reports the origins the Content-Security-Policy has to allow", () => {
    const origins = wasmOrigins();
    expect(origins.length).toBeGreaterThan(0);
    for (const origin of origins) {
      expect(() => new URL(origin)).not.toThrow();
      expect(PYODIDE_BASE.startsWith(origin) || SQL_JS_BASE.startsWith(origin)).toBe(true);
    }
  });
});
