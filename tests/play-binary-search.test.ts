import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { chapters } from "@/lib/content";
import { splitIslands } from "@/lib/chapterIslands";
import { PlayIsland } from "@/components/play/PlayIsland";
import { loadTracer } from "@/lib/play/registry";
import { tracer, type BinarySearchInput } from "@/lib/play/binarySearch";
import type { Frame, Tracer } from "@/lib/play/types";

const cases: { name: string; input: BinarySearchInput }[] = [
  { name: "the default input", input: tracer.defaultInput },
  ...tracer.presets.map((preset) => ({ name: preset.name, input: preset.input })),
];

function linearSearch({ array, target }: BinarySearchInput) {
  return array.indexOf(target);
}

function reportedAnswer(frames: Frame[]): number {
  const last = frames.at(-1)!;
  if (/^Not found/.test(last.narration)) return -1;
  const index = /returns index (\d+)/.exec(last.narration);
  if (!index) throw new Error(`the last narration states no result: ${last.narration}`);
  return Number(index[1]);
}

function reportedComparisons(frames: Frame[]): number {
  const count = /after (\d+) comparisons?\.$/.exec(frames.at(-1)!.narration);
  if (!count) throw new Error(`the last narration names no comparison count: ${frames.at(-1)!.narration}`);
  return Number(count[1]);
}

function foundCell(frames: Frame[]): number {
  return frames.at(-1)!.cells.findIndex((cell) => cell.state === "found");
}

function undeclaredLineIds(source: Pick<Tracer, "lines">, frames: Frame[]): string[] {
  const declared = new Set(source.lines.map((line) => line.id));
  return frames
    .flatMap((frame) => [frame.line, frame.next])
    .filter((id): id is string => id !== null && !declared.has(id));
}

function seededRandom(seed: number) {
  let state = Math.imul(seed, 2654435761) >>> 0;
  return () => {
    state = (Math.imul(state, 1103515245) + 12345) >>> 0;
    return state / 4294967296;
  };
}

function shuffledSorted(seed: number): BinarySearchInput {
  const next = seededRandom(seed);
  const size = 1 + Math.floor(next() * 16);
  const values = new Set<number>();
  while (values.size < size) values.add(Math.floor(next() * 60) - 10);
  const array = [...values].sort((a, b) => a - b);
  const target = next() < 0.5 ? array[Math.floor(next() * array.length)] : Math.floor(next() * 60) - 10;
  return { array, target };
}

function sortedWithDuplicates(seed: number): BinarySearchInput {
  const next = seededRandom(seed);
  const size = 2 + Math.floor(next() * 15);
  const array = Array.from({ length: size }, () => Math.floor(next() * 7)).sort((a, b) => a - b);
  return { array, target: Math.floor(next() * 9) - 1 };
}

function decode(text: string) {
  return text
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function mirrorMismatches(source: Pick<Tracer, "lines" | "mirrors">, body: string): string[] {
  const block = new RegExp(`<div data-code="${source.mirrors}"><pre><code>([\\s\\S]*?)</code></pre></div>`).exec(body);
  if (!block) return [`the block ${source.mirrors} is not in the chapter`];
  const shown = decode(block[1].replace(/<\/?[a-zA-Z][^>]*>/g, "")).split("\n");
  const mismatches = source.lines.flatMap((line, at) =>
    line.text === shown[at] ? [] : [`${line.id}: ${JSON.stringify(line.text)} is not ${JSON.stringify(shown[at])}`]
  );
  if (shown.length !== source.lines.length) mismatches.push(`${source.lines.length} lines against ${shown.length}`);
  return mismatches;
}

const chapter = chapters("dsa").find((entry) => entry.id === "dsa-binary-search")!;

describe("the binary search tracer", () => {
  it.each(cases)("ends on the reference answer for $name", ({ input }) => {
    const frames = tracer.run(input);
    expect(reportedAnswer(frames)).toBe(linearSearch(input));
    expect(foundCell(frames)).toBe(linearSearch(input));
  });

  it("finds the same answer as a linear search on random sorted arrays", () => {
    for (let seed = 1; seed <= 300; seed++) {
      const input = shuffledSorted(seed);
      const frames = tracer.run(input);
      expect(reportedAnswer(frames), JSON.stringify(input)).toBe(linearSearch(input));
      expect(foundCell(frames), JSON.stringify(input)).toBe(linearSearch(input));
    }
  });

  it("draws random arrays that really vary", () => {
    const inputs = Array.from({ length: 300 }, (_, at) => JSON.stringify(shuffledSorted(at + 1)));
    expect(new Set(inputs).size).toBeGreaterThan(250);
    const sizes = new Set(inputs.map((input) => (JSON.parse(input) as BinarySearchInput).array.length));
    expect(sizes.size).toBeGreaterThan(10);
  });

  it("reports any index that holds the target when the array repeats values, and not found when it is absent", () => {
    let repeated = 0;
    let found = 0;
    let absent = 0;
    for (let seed = 1; seed <= 300; seed++) {
      const input = sortedWithDuplicates(seed);
      const frames = tracer.run(input);
      const answer = reportedAnswer(frames);
      if (new Set(input.array).size < input.array.length) repeated += 1;
      if (input.array.includes(input.target)) {
        found += 1;
        expect(input.array[answer], JSON.stringify(input)).toBe(input.target);
        expect(foundCell(frames), JSON.stringify(input)).toBe(answer);
      } else {
        absent += 1;
        expect(answer, JSON.stringify(input)).toBe(-1);
        expect(foundCell(frames), JSON.stringify(input)).toBe(-1);
      }
    }
    expect(repeated).toBeGreaterThan(200);
    expect(found).toBeGreaterThan(50);
    expect(absent).toBeGreaterThan(50);
  });

  it("keeps the default input from the old demo and finds 31 at index 6 in four comparisons", () => {
    expect(tracer.defaultInput).toEqual({ array: [1, 4, 9, 13, 20, 27, 31, 38, 45, 50], target: 31 });
    const frames = tracer.run(tracer.defaultInput);
    expect(frames.at(-1)!.narration).toBe(
      "sorted[6] = 31 equals the target, so the search returns index 6 after 4 comparisons."
    );
  });

  it("states not found and the comparison count on the last frame of the not-in-array preset", () => {
    const preset = tracer.presets.find((entry) => entry.name === "Not in the array")!;
    const frames = tracer.run(preset.input);
    expect(frames.at(-1)!.narration).toMatch(/^Not found: 30 is not in the array/);
    expect(reportedAnswer(frames)).toBe(-1);
    expect(foundCell(frames)).toBe(-1);
  });

  it("names the presets the plan lists", () => {
    expect(tracer.presets.map((preset) => preset.name)).toEqual([
      "Found in the middle",
      "Not in the array",
      "Smallest element",
      "Single element",
    ]);
  });

  it.each(cases)("gives every frame of $name one sentence of narration", ({ input }) => {
    for (const frame of tracer.run(input)) {
      expect(frame.narration).toMatch(/^\S.*\.$/);
      expect(frame.narration).not.toMatch(/\. /);
    }
  });

  it.each(cases)("names only declared lines in $name, ending on a line with no next", ({ input }) => {
    const frames = tracer.run(input);
    expect(undeclaredLineIds(tracer, frames)).toEqual([]);
    expect(frames.at(-1)!.next).toBeNull();
    expect(frames.slice(0, -1).every((frame) => frame.next !== null)).toBe(true);
    for (let at = 1; at < frames.length; at++) expect(frames[at].line).toBe(frames[at - 1].next);
  });

  it("declares unique line ids", () => {
    const ids = tracer.lines.map((line) => line.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it.each(cases)("never makes more than floor(log2 n) + 1 comparisons for $name", ({ input }) => {
    const frames = tracer.run(input);
    const comparisons = reportedComparisons(frames);
    expect(comparisons).toBe(frames.filter((frame) => frame.line === "mid").length);
    expect(comparisons).toBeLessThanOrEqual(Math.floor(Math.log2(input.array.length)) + 1);
  });

  it("keeps lo, hi and mid in step with the marks and the variables", () => {
    for (const frame of tracer.run(tracer.defaultInput)) {
      const vars = new Map(frame.vars);
      for (const mark of ["lo", "hi", "mid"] as const) {
        const value = vars.get(mark);
        const marked = frame.cells.flatMap((cell, at) => (cell.marks.includes(mark) ? [at] : []));
        expect(marked).toEqual(typeof value === "number" && value >= 0 && value < frame.cells.length ? [value] : []);
      }
      expect(frame.vars.map(([name]) => name)).toEqual(["lo", "hi", "mid", "sorted[mid]", "target"]);
    }
  });

  it("starts with nothing set and the whole array in play after the first line", () => {
    const [first, second] = tracer.run(tracer.defaultInput);
    expect(new Map(first.vars).get("lo")).toBeNull();
    expect(first.cells.every((cell) => cell.state === "none")).toBe(true);
    expect(new Map(second.vars).get("lo")).toBe(0);
    expect(second.cells.every((cell) => cell.state === "in")).toBe(true);
  });

  it("renders the island for an unknown id as a plain sentence with no player", async () => {
    const island = await PlayIsland({ id: "nope" });
    const shown = JSON.stringify(island);
    expect(shown).toContain("There is no step-by-step player for this part of the chapter.");
    expect(shown).toContain('"id":"nope"');
    expect(shown).not.toContain("frames");
  });

  it("renders the island for binary search with the frames, the lines and the title as props", async () => {
    const island = await PlayIsland({ id: "binary-search" });
    const player = JSON.stringify(island);
    expect(player).toContain('"title":"Binary search"');
    expect(player).toContain('"frames"');
    expect(player).toContain('"lines"');
  });

  it("loads from the registry and returns null for an unknown id", async () => {
    expect((await loadTracer("binary-search"))?.id).toBe("binary-search");
    expect(await loadTracer("nope")).toBeNull();
    expect(await loadTracer("constructor")).toBeNull();
  });
});

describe("the binary search parser", () => {
  it("reads a sorted list and a target", () => {
    expect(tracer.parse("1, 4, 9, 13 | 9")).toEqual({ ok: true, input: { array: [1, 4, 9, 13], target: 9 } });
    expect(tracer.parse("[2 3 5] | -4")).toEqual({ ok: true, input: { array: [2, 3, 5], target: -4 } });
    expect(tracer.parse("3, 3, 3 | 3").ok).toBe(true);
    expect(tracer.parse("1, 2, 2, 2, 3 | 2")).toEqual({ ok: true, input: { array: [1, 2, 2, 2, 3], target: 2 } });
  });

  it("accepts exactly the limit and refuses one more", () => {
    const row = (count: number) => Array.from({ length: count }, (_, at) => at).join(", ");
    expect(tracer.limit).toBe(16);
    expect(tracer.parse(`${row(16)} | 3`).ok).toBe(true);
    const over = tracer.parse(`${row(17)} | 3`);
    expect(over.ok).toBe(false);
    if (!over.ok) expect(over.message).toMatch(/at most 16/);
  });

  it.each([
    ["unsorted", "3, 1, 2 | 2", /sorted/],
    ["empty", " | 3", /at least one number/],
    ["not numbers", "abc | 3", /not a whole number/],
    ["a decimal", "1, 2.5, 3 | 3", /not a whole number/],
    ["no target", "1, 2, 3 |", /target/],
    ["a target that is not a number", "1, 2, 3 | x", /target/],
    ["no divider", "abc", /\|/],
    ["two dividers", "1, 2 | 2 | 3", /\|/],
    ["nothing at all", "", /\|/],
  ])("refuses %s with a plain message", (_name, text, message) => {
    const result = tracer.parse(text);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(message);
  });
});

describe("the binary search chapter", () => {
  it("mirrors the chapter's code block line by line", () => {
    expect(mirrorMismatches(tracer, chapter.body)).toEqual([]);
  });

  it("holds no script and still splits into the play island", () => {
    expect(chapter.body).not.toMatch(/<script/i);
    expect(chapter.body).not.toContain('class="demo"');
    const island = splitIslands(chapter.body)!.filter((segment) => segment.kind === "island");
    expect(island).toEqual([{ kind: "island", id: tracer.id, input: null }]);
  });
});

describe("the browser bundle", () => {
  it("never imports a tracer or the registry from a client file", () => {
    const files = ["app", "components", "lib"].flatMap((dir) =>
      readdirSync(dir, { recursive: true, encoding: "utf8" })
        .filter((entry) => /\.tsx?$/.test(entry))
        .map((entry) => join(dir, entry))
    );
    const importers = files.filter((file) => {
      const source = readFileSync(file, "utf8");
      return (
        /^\s*["']use client["']/.test(source) &&
        /lib\/play\/(?:registry|binarySearch)|\.\/(?:registry|binarySearch)/.test(source)
      );
    });
    expect(importers).toEqual([]);
  });
});

describe("the checks themselves", () => {
  it("catches a frame that names a line the tracer does not declare", () => {
    const frames = tracer
      .run(tracer.defaultInput)
      .map((frame, at) => (at === 3 ? { ...frame, next: "nowhere" } : frame));
    expect(undeclaredLineIds(tracer, frames)).toEqual(["nowhere"]);
    const dropped = { lines: tracer.lines.filter((line) => line.id !== "equal") };
    expect(undeclaredLineIds(dropped, tracer.run(tracer.defaultInput)).length).toBeGreaterThan(0);
  });

  it("catches a run that reports the wrong answer", () => {
    const frames = tracer.run(tracer.defaultInput);
    const wrong = frames.map((frame, at) =>
      at === frames.length - 1 ? { ...frame, narration: frame.narration.replace("index 6", "index 5") } : frame
    );
    expect(reportedAnswer(wrong)).not.toBe(linearSearch(tracer.defaultInput));
    const lost = frames.map((frame, at) =>
      at === frames.length - 1 ? { ...frame, narration: "Not found: 31 is not in the array." } : frame
    );
    expect(reportedAnswer(lost)).not.toBe(linearSearch(tracer.defaultInput));
  });

  it("catches a mirrored line that drifts from the chapter", () => {
    const drifted = {
      mirrors: tracer.mirrors,
      lines: tracer.lines.map((line) => (line.id === "init" ? { ...line, text: line.text.replace("0", "1") } : line)),
    };
    expect(mirrorMismatches(drifted, chapter.body)).toHaveLength(1);
    expect(mirrorMismatches(drifted, chapter.body)[0]).toMatch(/^init:/);
    expect(mirrorMismatches({ ...tracer, lines: tracer.lines.slice(1) }, chapter.body).length).toBeGreaterThan(0);
    expect(mirrorMismatches({ ...tracer, mirrors: "no-such-block" }, chapter.body)).toHaveLength(1);
  });
});
