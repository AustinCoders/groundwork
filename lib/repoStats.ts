import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { LANG_ORDER, LANGUAGES } from "@/lib/codeLanguages";

const ROOT = process.cwd();

function walk(dir: string, keep: (path: string) => boolean, out: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name.startsWith(".")) continue;
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, keep, out);
    else if (keep(path)) out.push(path);
  }
  return out;
}

const isCode = (p: string) => /\.(ts|tsx)$/.test(p);
const lines = (files: string[]) => files.reduce((n, f) => n + readFileSync(f, "utf8").split("\n").length, 0);

export interface RepoStats {
  pages: number;
  routeHandlers: number;
  apiFunctions: number;
  codeFiles: number;
  codeLines: number;
  contentLines: number;
  dependencies: number;
  devDependencies: number;
  unitTestFiles: number;
  e2eSpecs: number;
  languages: number;
  runnableLanguages: number;
  workflows: number;
}

let cached: RepoStats | null = null;

export function repoStats(): RepoStats {
  if (cached) return cached;
  const app = walk(join(ROOT, "app"), () => true).map((p) => relative(ROOT, p));
  const code = ["app", "components", "lib"].flatMap((d) => walk(join(ROOT, d), isCode));
  const content = walk(join(ROOT, "content"), isCode);
  const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
    dependencies?: Record<string, string>;
    devDependencies?: Record<string, string>;
  };
  cached = {
    pages: app.filter((p) => /(^|\/)page\.tsx$/.test(p)).length,
    routeHandlers: app.filter((p) => /(^|\/)route\.ts$/.test(p)).length,
    apiFunctions: app.filter((p) => p.startsWith("app/api/") && p.endsWith("route.ts")).length,
    codeFiles: code.length,
    codeLines: lines(code),
    contentLines: lines(content),
    dependencies: Object.keys(pkg.dependencies ?? {}).length,
    devDependencies: Object.keys(pkg.devDependencies ?? {}).length,
    unitTestFiles: readdirSync(join(ROOT, "tests")).filter((f) => f.endsWith(".test.ts")).length,
    e2eSpecs: readdirSync(join(ROOT, "e2e")).filter((f) => f.endsWith(".spec.ts")).length,
    languages: LANG_ORDER.length,
    runnableLanguages: LANG_ORDER.filter((k) => LANGUAGES[k].runnable).length,
    workflows: readdirSync(join(ROOT, ".github", "workflows")).filter((f) => /\.ya?ml$/.test(f)).length,
  };
  return cached;
}
