import { describe, expect, it } from "vitest";
import { GIT_CHAPTERS } from "@/content/git-body";
import { SOURCES_BY_TOPIC } from "@/content/sources";
import { SOURCE_KIND_NAME } from "@/content/sources/types";
import { chapters } from "@/lib/content";

const NOT_PRIMARY = [
  "medium.com",
  "geeksforgeeks.org",
  "w3schools.com",
  "tutorialspoint.com",
  "quora.com",
  "reddit.com",
];

function readyIds(topic: string): string[] {
  if (topic === "git") return GIT_CHAPTERS.map((chapter) => chapter.id);
  return chapters(topic)
    .filter((chapter) => chapter.ready)
    .map((chapter) => chapter.id);
}

describe("chapter sources", () => {
  for (const [topic, byChapter] of Object.entries(SOURCES_BY_TOPIC)) {
    const ids = readyIds(topic);
    const filled = Object.keys(byChapter).length > 0;

    it(`${topic}: every key is a written chapter`, () => {
      for (const id of Object.keys(byChapter)) expect(ids, `${topic}/${id} is not a written chapter`).toContain(id);
    });

    it.runIf(filled)(`${topic}: every written chapter has two to six sources`, () => {
      for (const id of ids) {
        const count = byChapter[id]?.length ?? 0;
        expect(count, `${topic}/${id} has ${count} sources`).toBeGreaterThanOrEqual(2);
        expect(count, `${topic}/${id} has ${count} sources`).toBeLessThanOrEqual(6);
      }
    });

    it(`${topic}: each source is a distinct https link with a label and a reason`, () => {
      for (const [id, list] of Object.entries(byChapter)) {
        const urls = list.map((source) => source.url);
        expect(new Set(urls).size, `${topic}/${id} repeats a link`).toBe(urls.length);
        for (const source of list) {
          expect(source.url.startsWith("https://"), source.url).toBe(true);
          const host = new URL(source.url).host.replace(/^www\./, "");
          expect(
            NOT_PRIMARY.some((bad) => host === bad || host.endsWith(`.${bad}`)),
            `${source.url} is not a primary source`
          ).toBe(false);
          expect(source.label.length, source.url).toBeGreaterThan(8);
          expect(source.backs.length, source.url).toBeGreaterThanOrEqual(30);
          expect(source.backs.length, source.url).toBeLessThanOrEqual(220);
          expect(SOURCE_KIND_NAME[source.kind], source.url).toBeDefined();
        }
      }
    });
  }
});
