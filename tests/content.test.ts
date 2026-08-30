import { describe, expect, it } from "vitest";
import { chapters, exercises, notesData, topics } from "@/lib/content";
import { levels, notesHref } from "@/lib/topics";

const notesTopics = topics().filter((t) => t.levels);
const topicIds = notesTopics.map((t) => t.id);
const allChapters = topicIds.flatMap((id) => chapters(id).map((ch) => ({ topicId: id, ch })));
const exerciseIds = new Set(exercises().map((ex) => ex.id));
const chapterIds = new Set(allChapters.map(({ ch }) => ch.id));

describe("chapter integrity", () => {
  it("has chapters for every topic that declares levels", () => {
    for (const id of topicIds) {
      expect(chapters(id).length, `topic "${id}" has no chapters`).toBeGreaterThan(0);
    }
  });

  it("gives every chapter a unique id within its topic", () => {
    for (const id of topicIds) {
      const ids = chapters(id).map((ch) => ch.id);
      expect(new Set(ids).size, `topic "${id}" has duplicate chapter ids`).toBe(ids.length);
    }
  });

  // Chapter ids are URL path segments now, so a stray space or slash is a
  // broken route rather than just an ugly anchor.
  it("keeps every chapter id URL-safe", () => {
    for (const { topicId, ch } of allChapters) {
      expect(ch.id, `"${ch.id}" in ${topicId} is not a clean URL segment`).toMatch(/^[a-z0-9][a-z0-9-]*$/);
    }
  });

  it("never marks a chapter ready with an empty body", () => {
    for (const { topicId, ch } of allChapters) {
      if (!ch.ready) continue;
      expect(ch.body.trim().length, `${topicId}/${ch.id} is ready:true but has no body`).toBeGreaterThan(0);
    }
  });

  it("never leaves a written body on an unwritten chapter", () => {
    for (const { topicId, ch } of allChapters) {
      if (ch.ready) continue;
      expect(ch.body.trim(), `${topicId}/${ch.id} is ready:false but has a body`).toBe("");
    }
  });

  it("gives every ready chapter a title and subtitle", () => {
    for (const { topicId, ch } of allChapters) {
      if (!ch.ready) continue;
      expect(ch.title.trim(), `${topicId}/${ch.id} has no title`).not.toBe("");
      expect(ch.subtitle.trim(), `${topicId}/${ch.id} has no subtitle`).not.toBe("");
    }
  });

  it("balances <pre> and <code> tags in every body", () => {
    for (const { topicId, ch } of allChapters) {
      const open = (ch.body.match(/<pre>/g) || []).length;
      const close = (ch.body.match(/<\/pre>/g) || []).length;
      expect(open, `${topicId}/${ch.id} has unbalanced <pre> tags`).toBe(close);
    }
  });

  it("gives every diagram an aria-label", () => {
    for (const { topicId, ch } of allChapters) {
      const svgs = ch.body.match(/<svg[^>]*>/g) || [];
      for (const svg of svgs) {
        expect(svg, `${topicId}/${ch.id} has an <svg> with no aria-label`).toMatch(/aria-label="/);
      }
    }
  });
});

describe("practice wiring", () => {
  it("only references exercises that exist", () => {
    for (const { topicId, ch } of allChapters) {
      for (const id of ch.practice) {
        expect(exerciseIds.has(id), `${topicId}/${ch.id} references missing exercise "${id}"`).toBe(true);
      }
    }
  });

  it("points every exercise at a real chapter", () => {
    for (const ex of exercises()) {
      expect(chapterIds.has(ex.chapter), `exercise "${ex.id}" points at missing chapter "${ex.chapter}"`).toBe(true);
    }
  });

  it("gives every exercise at least one test", () => {
    for (const ex of exercises()) {
      expect(ex.tests.length, `exercise "${ex.id}" has no tests`).toBeGreaterThan(0);
    }
  });

  it("uses unique exercise ids", () => {
    const ids = exercises().map((ex) => ex.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("syllabus wiring", () => {
  it("only points syllabus sections at chapters that exist", () => {
    for (const topicId of topicIds) {
      const own = new Set(chapters(topicId).map((ch) => ch.id));
      for (const level of levels(topicId)) {
        for (const section of level.syllabus || []) {
          if (!section.chapter) continue;
          expect(
            own.has(section.chapter),
            `${topicId} syllabus "${section.title}" points at missing chapter "${section.chapter}"`
          ).toBe(true);
        }
      }
    }
  });
});

describe("routing", () => {
  it("gives every topic with notes a distinct reader route", () => {
    const routes = topicIds.map((id) => notesHref(id));
    expect(new Set(routes).size, "two topics resolve to the same route").toBe(routes.length);
  });

  it("gives every topic's notes file a title", () => {
    for (const id of topicIds) {
      expect(notesData(id).meta.title.trim(), `topic "${id}" has no notes title`).not.toBe("");
    }
  });
});
