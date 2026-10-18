import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, posix } from "node:path";
import { describe, expect, it } from "vitest";
import type { DesignDrill } from "@/content/drill-types";
import { chapters } from "@/lib/content";
import { drillChapterIds, drillProblems, DRILL_SIZE, loadDrill } from "@/lib/designDrill";
import { withHeadingIds } from "@/lib/headingToc";
import type { ChapterFacts } from "@/lib/quiz";
import { buildDrillBoard, DRILL_BOARDS, drillBoard } from "@/lib/whiteboard/drillBoards";
import { drillVerdict } from "@/components/check/DrillCard";

const DRILL_DIR = join(process.cwd(), "content", "system-design", "drills");
const REGISTERED = drillChapterIds();

const drills: Record<string, DesignDrill> = {};
for (const id of REGISTERED) drills[id] = (await loadDrill(id))!;

function factsOf(chapterId: string): ChapterFacts | null {
  const found = chapters("system-design").find((chapter) => chapter.id === chapterId);
  if (!found) return null;
  return { id: found.id, levels: found.levels, sections: withHeadingIds(found.body).toc.map((item) => item.id) };
}

const copy = <T>(value: T): T => structuredClone(value);
const sample = drills["sysdes-walkthrough-simple"];
const sampleFacts = factsOf("sysdes-walkthrough-simple")!;

describe("every walkthrough chapter has a design drill", () => {
  it("registers the six walkthroughs and each is a written chapter", () => {
    expect([...REGISTERED].sort()).toEqual([
      "sysdes-walkthrough-crawler",
      "sysdes-walkthrough-kv-store",
      "sysdes-walkthrough-medium",
      "sysdes-walkthrough-notifications",
      "sysdes-walkthrough-payments",
      "sysdes-walkthrough-simple",
    ]);
    for (const id of REGISTERED) expect(factsOf(id), id).not.toBeNull();
  });

  it("has a drill file for exactly the chapters the registry lists", () => {
    const files = readdirSync(DRILL_DIR)
      .filter((name) => name.endsWith(".ts"))
      .map((name) => name.slice(0, -3))
      .sort();
    expect(files).toEqual([...REGISTERED].sort());
  });

  for (const id of REGISTERED) {
    it(`${id} reports no problem`, () => {
      expect(drills[id], "the drill file does not load").toBeTruthy();
      expect(drillProblems(drills[id], factsOf(id), id)).toEqual([]);
    });

    it(`${id} has a non-empty checklist and mistakes, each with a heading`, () => {
      const drill = drills[id];
      expect(drill.checklist.length).toBeGreaterThanOrEqual(DRILL_SIZE.checklist.min);
      expect(drill.mistakes.length).toBeGreaterThanOrEqual(DRILL_SIZE.mistakes.min);
      const sections = factsOf(id)!.sections;
      for (const item of [...drill.checklist, ...drill.mistakes]) expect(sections).toContain(item.section);
    });
  }

  it("keeps item ids unique across every drill", () => {
    const ids = Object.values(drills).flatMap((drill) =>
      [...drill.checklist, ...drill.mistakes].map((item) => item.id)
    );
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("the drill health check", () => {
  it("passes the sample", () => {
    expect(drillProblems(sample, sampleFacts, "sample")).toEqual([]);
  });

  it("fails a missing chapter and a chapter mismatch", () => {
    expect(drillProblems(sample, null, "sample")).toHaveLength(1);
    expect(drillProblems({ ...copy(sample), chapter: "sysdes-cdns" }, sampleFacts, "sample").join()).toMatch(
      /chapter is/
    );
  });

  it("fails an unknown section on a checklist item and on a mistake", () => {
    const drill = copy(sample);
    drill.checklist[0].section = "not-a-heading";
    drill.mistakes[0].section = "also-not";
    const problems = drillProblems(drill, sampleFacts, "sample");
    expect(problems.filter((problem) => /is not a heading/.test(problem))).toHaveLength(2);
  });

  it("fails an empty or oversized list", () => {
    const empty = copy(sample);
    empty.checklist = [];
    empty.mistakes = [];
    expect(drillProblems(empty, sampleFacts, "sample").filter((problem) => /need \d to \d/.test(problem))).toHaveLength(
      2
    );
    const long = copy(sample);
    while (long.checklist.length <= DRILL_SIZE.checklist.max)
      long.checklist.push({
        ...long.checklist[0],
        id: `check-extra-${long.checklist.length}`,
        text: `${long.checklist[0].text} ${long.checklist.length}`,
      });
    expect(drillProblems(long, sampleFacts, "sample").join()).toMatch(/checklist items/);
  });

  it("fails a repeated id, a wrong id prefix, a short text, broken html and a narrow checklist", () => {
    const drill = copy(sample);
    drill.checklist[1].id = drill.checklist[0].id;
    drill.mistakes[0].id = "check-oops";
    drill.checklist[2].text = "Too short";
    drill.mistakes[1].text = "<p>An unclosed paragraph that is long enough to pass the length rule";
    drill.checklist.forEach((item) => (item.section = drill.checklist[0].section));
    const problems = drillProblems(drill, sampleFacts, "sample").join("\n");
    expect(problems).toMatch(/repeats inside/);
    expect(problems).toMatch(/starts with "mistake-"/);
    expect(problems).toMatch(/too short to check against/);
    expect(problems).toMatch(/never closed/);
    expect(problems).toMatch(/draws on only 1 headings/);
  });

  it("fails duplicate text and a prompt that is too short", () => {
    const drill = copy(sample);
    drill.checklist[1].text = drill.checklist[0].text;
    drill.prompt = "<p>Design it.</p>";
    const problems = drillProblems(drill, sampleFacts, "sample").join("\n");
    expect(problems).toMatch(/share the same text/);
    expect(problems).toMatch(/prompt is too short/);
  });
});

describe("the starter whiteboards", () => {
  it("has one board per drill, titled like the drill", () => {
    expect(DRILL_BOARDS.map((board) => board.chapter).sort()).toEqual([...REGISTERED].sort());
    for (const id of REGISTERED) expect(drillBoard(id)?.title, id).toBe(drills[id].title);
  });

  it("builds a board with a heading, four lanes and a frame, and none for an unknown chapter", () => {
    const els = buildDrillBoard(drillBoard("sysdes-walkthrough-simple")!);
    expect(els).toHaveLength(6);
    expect(els[0].text).toBe(drills["sysdes-walkthrough-simple"].title);
    expect(new Set(els.map((el) => el.id)).size).toBe(els.length);
    expect(drillBoard("sysdes-cdns")).toBeNull();
    expect(drillBoard("")).toBeNull();
  });
});

describe("the self-score verdict", () => {
  it("reads every band", () => {
    expect(drillVerdict(8, 8)).toMatch(/complete/);
    expect(drillVerdict(7, 8)).toMatch(/strong/);
    expect(drillVerdict(4, 8)).toMatch(/Half/);
    expect(drillVerdict(1, 8)).toMatch(/gaps/);
  });
});

describe("the import boundary", () => {
  const SPECIFIER = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)["']([^"']+)["']/g;

  function sourcesUnder(roots: string[]): Record<string, string> {
    const found: Record<string, string> = {};
    const walk = (dir: string) => {
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.tsx?$/.test(name)) found[path.split("\\").join("/")] = readFileSync(path, "utf8");
      }
    };
    for (const root of roots) walk(root);
    return found;
  }

  function resolved(specifier: string, file: string): string {
    if (specifier.startsWith("@/")) return specifier.slice(2);
    if (specifier.startsWith(".")) return posix.normalize(posix.join(posix.dirname(file), specifier));
    return specifier;
  }

  it("lets only the drill registry reach content/system-design/drills, and only dynamically", () => {
    const sources = sourcesUnder(["app", "components", "lib", "content", "tests"]);
    const importers = Object.entries(sources)
      .filter(([file]) => file !== "lib/designDrill.ts" && !file.startsWith("content/system-design/drills/"))
      .filter(([file]) => file !== "tests/system-design-drills.test.ts")
      .filter(([file, text]) =>
        [...text.matchAll(SPECIFIER)].some((match) =>
          resolved(match[1], file).startsWith("content/system-design/drills")
        )
      )
      .map(([file]) => file);
    expect(importers).toEqual([]);
    const registry = sources["lib/designDrill.ts"];
    expect(registry).not.toMatch(/^import\s+(?!type\b)[^;]*content\/system-design\/drills/m);
    expect(registry.match(/=>\s*import\(/g)?.length).toBe(REGISTERED.length);
  });
});
