import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { describe, expect, it } from "vitest";

const ROOTS = ["app", "components", "lib", "content"];
const ALLOWED_CONTENT = new Set(["content/types.ts", "content/topics.ts"]);

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return sourceFiles(path);
    return /\.tsx?$/.test(name) ? [path] : [];
  });
}

function resolve(spec: string, from: string): string | null {
  const base = spec.startsWith("@/")
    ? spec.slice(2)
    : spec.startsWith(".")
      ? normalize(join(dirname(from), spec))
      : null;
  if (!base) return null;
  for (const candidate of [`${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`, base]) {
    if (/\.tsx?$/.test(candidate) && existsSync(candidate) && statSync(candidate).isFile()) return candidate;
  }
  return null;
}

const files = ROOTS.flatMap(sourceFiles);
const text = new Map(files.map((file) => [file, readFileSync(file, "utf8")]));

const IMPORT = /(?:import|export)\s[^;]*?from\s+["']([^"']+)["']|import\s+["']([^"']+)["']/g;

function runtimeImports(file: string): string[] {
  const found: string[] = [];
  for (const match of text.get(file)!.matchAll(IMPORT)) {
    if (/^import\s+type\b/.test(match[0])) continue;
    const target = resolve(match[1] ?? match[2], file);
    if (target) found.push(target);
  }
  return found;
}

const imports = new Map(files.map((file) => [file, runtimeImports(file)]));
const clientFiles = files.filter((file) => /^\s*["']use client["']/.test(text.get(file)!));

function heavyPath(start: string): string[] | null {
  const via = new Map<string, string | null>([[start, null]]);
  const queue = [start];
  for (let at = 0; at < queue.length; at++) {
    const file = queue[at];
    if (file.startsWith("content/") && !ALLOWED_CONTENT.has(file)) {
      const path: string[] = [];
      for (let step: string | null = file; step; step = via.get(step) ?? null) path.unshift(step);
      return path;
    }
    for (const next of imports.get(file) ?? []) {
      if (!via.has(next)) {
        via.set(next, file);
        queue.push(next);
      }
    }
  }
  return null;
}

describe("the browser bundle", () => {
  it("finds the client components it checks", () => {
    expect(clientFiles.length).toBeGreaterThan(20);
  });

  it("never pulls chapter text, exercises or interview data into a client component", () => {
    const offenders = clientFiles
      .map((file) => heavyPath(file))
      .filter((path): path is string[] => path !== null)
      .map((path) => path.join(" -> "));
    expect(
      offenders,
      "a client component imports the content layer; pass the number or list in as a prop instead"
    ).toEqual([]);
  });
});
