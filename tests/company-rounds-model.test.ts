import { describe, expect, it } from "vitest";
import { ROUND_KINDS, ROUND_ORDER } from "@/content/system-design/company-questions/rounds";
import { ASKED_MODEL } from "@/content/system-design/company-questions/rounds-model";
import { bookRound } from "@/lib/interviewBook";
import { chapters } from "@/lib/content";

const words = (text: string) => text.split(/\s+/).filter(Boolean).length;
const ROOTS = new Set([
  "/level/dsa",
  "/system-design",
  "/dbms",
  "/os",
  "/networks",
  "/databases",
  "/mock",
  "/whiteboard",
  "/problems",
]);
const sysdes = new Set(chapters("system-design").map((chapter) => chapter.id));

describe("the model answers for what can be asked in each round", () => {
  it("has one answer for every asked item, in the same order", () => {
    expect(Object.keys(ASKED_MODEL).sort()).toEqual([...ROUND_ORDER].sort());
    for (const type of ROUND_ORDER) expect(ASKED_MODEL[type], type).toHaveLength(ROUND_KINDS[type].asked.length);
  });

  it("writes plain, short answers without dashes or markup", () => {
    for (const type of ROUND_ORDER) {
      for (const entry of ASKED_MODEL[type]) {
        expect(words(entry.a), `${type}: ${entry.a.slice(0, 40)}`).toBeGreaterThanOrEqual(40);
        expect(words(entry.a)).toBeLessThanOrEqual(100);
        expect(entry.a).not.toMatch(/<[^>]+>|—|–/);
        expect(entry.a).not.toMatch(/\b(TODO|TBD|FIXME|lorem)\b/i);
      }
    }
  });

  it("links only to pages that exist", () => {
    for (const type of ROUND_ORDER) {
      for (const { link } of ASKED_MODEL[type]) {
        if (!link) continue;
        expect(link.label.length).toBeLessThanOrEqual(40);
        const interview = link.href.match(/^\/interview\/([a-z0-9]+)$/);
        const chapter = link.href.match(/^\/system-design\/([a-z0-9-]+)$/);
        if (interview) expect(bookRound(interview[1]), link.href).toBeTruthy();
        else if (chapter) expect(sysdes.has(chapter[1]), link.href).toBe(true);
        else expect(ROOTS.has(link.href), link.href).toBe(true);
      }
    }
  });
});
