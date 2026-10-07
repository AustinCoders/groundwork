import { describe, expect, it } from "vitest";
import { chapterMetas, chapters, exercises, htmlMinutes, notesData, readTime, topics, totalTime } from "@/lib/content";
import { GIT_BODY_HTML, GIT_CHAPTERS } from "@/content/git-body";
import { levels, notesHref } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";

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

describe("reading time", () => {
  const writtenChapter = chapters("js").find((ch) => ch.ready);
  const outlineChapter = chapters("typescript").find((ch) => !ch.ready);

  it("gives an unwritten chapter 0 minutes and keeps the floor for a written one", () => {
    expect(outlineChapter, "expected an unwritten typescript chapter to test against").toBeDefined();
    expect(writtenChapter, "expected a written js chapter to test against").toBeDefined();
    expect(readTime(outlineChapter!)).toBe(0);
    expect(readTime(writtenChapter!)).toBeGreaterThan(0);
  });

  it("excludes unwritten chapters from totalTime", () => {
    expect(outlineChapter, "expected an unwritten typescript chapter to test against").toBeDefined();
    expect(writtenChapter, "expected a written js chapter to test against").toBeDefined();
    expect(totalTime([writtenChapter!, outlineChapter!])).toBe(readTime(writtenChapter!));
  });

  it("keeps a level's chapter and exercise counts to its ready chapters, for a synthetic mixed-ready level", () => {
    expect(outlineChapter, "expected an unwritten typescript chapter to test against").toBeDefined();
    expect(writtenChapter, "expected a written js chapter to test against").toBeDefined();

    const mixedReadyLevel = [writtenChapter!, outlineChapter!];
    const written = mixedReadyLevel.filter((ch) => ch.ready);
    const writtenIds = new Set(written.map((ch) => ch.id));
    expect(written).toEqual([writtenChapter]);

    const syntheticExercises = [
      { ...exercises()[0], chapter: writtenChapter!.id },
      { ...exercises()[0], chapter: outlineChapter!.id },
    ];
    expect(syntheticExercises.filter((ex) => writtenIds.has(ex.chapter)).length).toBe(1);
  });

  const words = (html: string) => (html.replace(/<[^>]+>/g, " ").match(/\S+/g) ?? []).length;
  const proseOf = (html: string) =>
    ["pre", "script", "style", "svg"].reduce(
      (rest, tag) => rest.replace(new RegExp(`<${tag}\\b[\\s\\S]*?</${tag}>`, "gi"), " "),
      html
    );

  it("counts only prose in a written chapter: the sliding-window chapter reads as its prose alone", () => {
    const slidingWindow = chapters("dsa").find((ch) => ch.id === "dsa-sliding-window");
    expect(slidingWindow, "expected the sliding-window chapter").toBeDefined();
    expect(slidingWindow!.ready).toBe(true);
    const proseWords = words(proseOf(slidingWindow!.body));
    const everyWord = words(slidingWindow!.body);
    expect(everyWord, "the chapter holds code that is not prose").toBeGreaterThan(proseWords);
    expect(readTime(slidingWindow!)).toBe(Math.max(2, Math.round(proseWords / 180)));
    const meta = chapterMetas("dsa").find((ch) => ch.id === "dsa-sliding-window");
    expect(meta?.readMinutes).toBe(readTime(slidingWindow!));
  });

  const everyWrittenBody = [
    ...topics().flatMap((t) =>
      chapters(t.id)
        .filter((ch) => ch.ready)
        .map((ch) => ({ name: `${t.id}/${ch.id}`, body: ch.body }))
    ),
    ...GIT_CHAPTERS.map((section) => ({ name: `git/${section.id}`, body: section.body })),
  ];
  const minutesOf = (html: string) => Math.max(2, Math.round(words(proseOf(html)) / 180));

  it("matches the prose-only formula for every written chapter of every topic, and for the Git guide", () => {
    expect(everyWrittenBody.length).toBeGreaterThan(200);
    for (const { name, body } of everyWrittenBody) {
      expect(htmlMinutes(body), `${name} reads ${htmlMinutes(body)} minutes, expected ${minutesOf(body)}`).toBe(
        minutesOf(body)
      );
    }
    for (const t of topics().filter((topic) => chapters(topic.id).length > 0)) {
      for (const ch of chapters(t.id)) {
        expect(readTime(ch), `${t.id}/${ch.id}`).toBe(ch.ready ? minutesOf(ch.body) : 0);
      }
    }
    expect(htmlMinutes(GIT_BODY_HTML)).toBe(minutesOf(GIT_BODY_HTML));
    expect(topicStats().git.minutes).toBe(minutesOf(GIT_BODY_HTML));
  });

  it("closes every <pre>, <script>, <style> and <svg> it opens in a written chapter", () => {
    const withoutScriptText = (html: string) =>
      html.replace(/(<script(?=[\s>])[^>]*>)[\s\S]*?(<\/script\s*>)/gi, "$1$2");
    for (const { name, body } of everyWrittenBody) {
      const outsideScripts = withoutScriptText(body);
      for (const tag of ["pre", "script", "style", "svg"]) {
        const opened = (outsideScripts.match(new RegExp(`<${tag}(?=[\\s>])`, "gi")) ?? []).length;
        const closed = (outsideScripts.match(new RegExp(`</${tag}\\s*>`, "gi")) ?? []).length;
        expect(closed, `${name} opens ${opened} <${tag}> and closes ${closed}`).toBe(opened);
      }
    }
  });

  it("drops code, scripts, styles and diagrams however they are cased or wrapped", () => {
    const prose = Array.from({ length: 1800 }, (_, i) => `word${i}`).join(" ");
    const noise = Array.from({ length: 9000 }, (_, i) => `noise${i}`).join(" ");
    expect(htmlMinutes(`<p>${prose}</p>`)).toBe(10);
    expect(htmlMinutes(`<p>${prose}</p><pre><code>${noise}</code></pre>`)).toBe(10);
    expect(htmlMinutes(`<p>${prose}</p><PRE class="x">\n${noise}\n</PRE>`)).toBe(10);
    expect(htmlMinutes(`<p>${prose}</p><script type="module">${noise}</script>`)).toBe(10);
    expect(htmlMinutes(`<p>${prose}</p><style>${noise}</style>`)).toBe(10);
    expect(htmlMinutes(`<p>${prose}</p><svg viewBox="0 0 9 9"><text>${noise}</text></svg>`)).toBe(10);
    expect(htmlMinutes(`<p>${prose}</p><p>and <code>${noise}</code> inline</p>`)).toBeGreaterThan(10);
    expect(htmlMinutes(`<pre>${noise}</pre>`)).toBe(2);
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
