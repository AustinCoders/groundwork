import { readdirSync, readFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { describe, expect, it } from "vitest";
import { INTERVIEW_ROUNDS_RAW } from "@/content/interview-data";
import { GIT_CHAPTERS } from "@/content/git-body";
import { exercises, notesData, topics } from "@/lib/content";

const ROOTS = ["content", "app", "lib"];
const TEXT_FILE = /\.(?:tsx?|jsx?|mjs|cjs|css|json|md|html|svg|txt)$/;
const NUL = "\u0000";

const files = ROOTS.flatMap((root) =>
  readdirSync(join(process.cwd(), root), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile() && TEXT_FILE.test(entry.name))
    .map((entry) => relative(process.cwd(), join(entry.parentPath, entry.name)).split(sep).join("/"))
);

function nulPaths(value: unknown, path: string, seen = new Set<object>()): string[] {
  if (typeof value === "string") return value.includes(NUL) ? [path] : [];
  if (!value || typeof value !== "object" || seen.has(value)) return [];
  seen.add(value);
  return Object.entries(value).flatMap(([key, inner]) => nulPaths(inner, `${path}.${key}`, seen));
}

describe("source text", () => {
  it("finds the files it scans", () => {
    expect(files.length).toBeGreaterThan(100);
    expect(files).toContain("content/dsa/dsa-string-algorithms.ts");
  });

  it("holds no U+0000, which browsers drop from rendered text", () => {
    const offenders = files.filter((file) => readFileSync(join(process.cwd(), file)).includes(0));
    expect(offenders, "these files contain a literal NUL character; use a visible separator").toEqual([]);
  });
});

describe("loaded content", () => {
  it("finds a NUL wherever the walk looks", () => {
    expect(nulPaths({ a: ["x", `y${NUL}z`], b: { c: NUL } }, "root")).toEqual(["root.a.1", "root.b.c"]);
    expect(nulPaths("\\u0000 as written text", "root")).toEqual([]);
  });

  it("holds no U+0000 once the escapes are evaluated, in any chapter, exercise, topic or interview round", () => {
    const offenders = [
      ...topics().flatMap((t) => nulPaths(notesData(t.id), `notes.${t.id}`)),
      ...nulPaths(topics(), "topics"),
      ...nulPaths(exercises(), "exercises"),
      ...nulPaths(INTERVIEW_ROUNDS_RAW, "interview"),
      ...nulPaths(GIT_CHAPTERS, "git"),
    ];
    expect(offenders, "these values contain a NUL character, written raw or as an escape").toEqual([]);
  });
});
