import vm from "node:vm";
import { describe, expect, it } from "vitest";
import { chapters, topics } from "@/lib/content";
import { OVER_LENGTH_CHAPTERS, UNPARSED_CODE_BLOCKS } from "./chapter-standards-baseline";

const MAX_WORDS = 6000;

const written = topics().flatMap((t) =>
  chapters(t.id)
    .filter((c) => c.ready)
    .map((c) => ({ topic: t.id, id: c.id, body: String(c.body || "") }))
);

function proseWords(body: string): number {
  return body
    .replace(/<pre[\s\S]*?<\/pre>/g, " ")
    .replace(/<script[\s\S]*?<\/script>/g, " ")
    .replace(/<svg[\s\S]*?<\/svg>/g, " ")
    .replace(/<[^>]*>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
}

function decode(html: string): string {
  return html
    .replace(/<[^>]+>/g, "")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&");
}

function unparsedBlocks(body: string): number {
  let count = 0;
  for (const match of body.matchAll(/<pre><code[^>]*>([\s\S]*?)<\/code><\/pre>/g)) {
    try {
      new vm.Script(`(async function(){\n${decode(match[1])}\n})`);
    } catch {
      count++;
    }
  }
  return count;
}

describe("chapter standards", () => {
  it(`keeps every chapter within ${MAX_WORDS} words of prose, and never lets an older long chapter grow`, () => {
    for (const chapter of written) {
      const words = proseWords(chapter.body);
      const allowed = OVER_LENGTH_CHAPTERS[chapter.id];
      if (allowed === undefined) {
        expect(
          words,
          `${chapter.id} has ${words} words of prose; the limit for a new chapter is ${MAX_WORDS}`
        ).toBeLessThanOrEqual(MAX_WORDS);
      } else {
        expect(words, `${chapter.id} grew past its recorded ${allowed} words`).toBeLessThanOrEqual(allowed);
        expect(words, `${chapter.id} is now under ${MAX_WORDS}; remove it from OVER_LENGTH_CHAPTERS`).toBeGreaterThan(
          MAX_WORDS
        );
      }
    }
  });

  it("parses every JavaScript code block in the DSA chapters, except the ones already recorded", () => {
    for (const chapter of written.filter((c) => c.topic === "dsa")) {
      const failures = unparsedBlocks(chapter.body);
      const allowed = UNPARSED_CODE_BLOCKS[chapter.id] ?? 0;
      expect(
        failures,
        `${chapter.id} has ${failures} code blocks that do not parse (recorded: ${allowed})`
      ).toBeLessThanOrEqual(allowed);
    }
  });

  it("names only written chapters in the baselines", () => {
    const ids = new Set(written.map((c) => c.id));
    for (const id of [...Object.keys(OVER_LENGTH_CHAPTERS), ...Object.keys(UNPARSED_CODE_BLOCKS)]) {
      expect(ids.has(id), `${id} is in a baseline but is not a written chapter`).toBe(true);
    }
  });
});
