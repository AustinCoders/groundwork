import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TopicShell } from "@/components/topic/shell/TopicShell";
import {
  buildGroups,
  currentLevel,
  groupSummary,
  heroStatus,
  markFor,
  peekFor,
  percent,
  stageStatus,
  upNextOf,
} from "@/components/topic/shell/model";
import type { ShellCard, ShellHero, ShellPart, TopicShellProps } from "@/components/topic/shell/types";
import { buildChapterStates } from "@/lib/chapterState";
import { chapterMetas, levels } from "@/lib/content";
import { coverCards, coverParts } from "@/lib/coverData";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

const jsParts: ShellPart[] = [
  { level: "beginner", title: "Beginner", promise: "I can write working code." },
  { level: "advanced", title: "Advanced" },
];

const plainHero: ShellHero = {
  eyebrow: null,
  title: "Topic",
  lead: null,
  status: null,
  note: null,
  action: null,
  links: [],
  teaser: null,
  standing: null,
  choice: null,
};

const jsCards: ShellCard[] = [
  { id: "scope", num: "1", title: "Scope", levels: ["beginner"], minutes: 8, exercises: 2, ready: true },
  { id: "closures", num: "2", title: "Closures", levels: ["beginner"], minutes: 9, exercises: 0, ready: true },
  { id: "proxies", num: "3", title: "Proxies", levels: ["advanced"], minutes: 0, exercises: 0, ready: false },
];

const base = (overrides: Partial<TopicShellProps>): TopicShellProps => ({
  topic: { name: "Topic" },
  ready: true,
  hero: plainHero,
  pathTitle: "Your path",
  pathHint: null,
  pathCount: "0 chapters",
  groups: [],
  tools: [],
  details: null,
  notes: null,
  foot: null,
  ...overrides,
});

function jsShell(done: ReadonlySet<string> | null) {
  const groups = buildGroups({
    parts: jsParts,
    cards: jsCards,
    basePath: "/notes",
    done,
    states: null,
    nextId: done ? "closures" : null,
    reviseIds: new Set(),
    yourLevel: null,
    openLevel: "beginner",
    titleOf: (card) => card.title,
  });
  return renderToStaticMarkup(
    createElement(
      TopicShell,
      base({
        topic: { name: "JavaScript" },
        hero: {
          ...plainHero,
          title: "JavaScript",
          status: heroStatus(done?.size ?? 0, 2, "Closures"),
          action: { label: "Continue", href: "/notes/closures" },
        },
        pathCount: "2 chapters",
        groups,
      })
    )
  );
}

describe("the topic shell takes a JavaScript-like config: no placement, no check states, no details", () => {
  const html = jsShell(new Set(["scope"]));

  it("renders one primary action and one chapter list", () => {
    expect(html.match(/id="topic-primary"/g)).toHaveLength(1);
    expect(html).toContain('href="/notes/closures"');
    expect(html.match(/<details/g)).toHaveLength(2);
    expect(html.match(/<li [^>]*data-kind/g)).toHaveLength(3);
  });

  it("opens the named level only", () => {
    expect(html).toMatch(/<details[^>]*id="beginner"[^>]* open=""/);
    expect(html).not.toMatch(/<details[^>]*id="advanced"[^>]* open=""/);
  });

  it("marks a read chapter with a word and a soon chapter dimmed with its own word", () => {
    expect(html).toMatch(/data-state="read"[^>]*>read</);
    expect(html).toMatch(/data-state="soon"[^>]*>soon</);
    expect(html).toContain("1 / 2 read");
  });

  it("draws no details panel, tools row or notes when none are given", () => {
    expect(html).not.toContain("data-tool");
    expect(html).not.toContain('id="pick-level"');
    expect(html).not.toContain('id="notes"');
  });
});

describe("the topic shell takes a DSA config", () => {
  const cards = coverCards("dsa");
  const parts = coverParts("dsa");
  const checkIds = ["dsa-binary-search"];
  const done = new Set(["dsa-complexity-analysis", "dsa-binary-search"]);
  const states = buildChapterStates({
    chapterIds: cards.filter((c) => c.ready).map((c) => c.id),
    checkChapterIds: checkIds,
    done,
    records: {},
    testedOut: ["dsa-two-pointers"],
  });
  const groups = buildGroups({
    parts: parts.map((p) => ({ level: p.level, title: p.title })),
    cards,
    basePath: "/dsa",
    done,
    states,
    nextId: "dsa-arrays-strings",
    reviseIds: new Set(["dsa-linked-lists"]),
    yourLevel: "beginner",
    openLevel: "beginner",
    titleOf: (card) => card.short || card.title,
  });

  it("gives each stage its own tone, a promise, a status and a peek", () => {
    expect(new Set(groups.map((g) => g.tone)).size).toBe(groups.length);
    expect(groups.every((g) => g.promise === null)).toBe(true);
    expect(groups[0].status).toBe("yours");
    expect(groups[1].status).toBe("fresh");
    expect(groups[0].peek).toBe("Next stop: Arrays & strings");
    expect(groups[1].peek).toMatch(/^Starts with /);
  });

  it("groups every chapter under its level and counts the written ones only", () => {
    expect(groups.map((g) => g.id)).toEqual(levels("dsa").map((l) => l.id));
    const metas = chapterMetas("dsa");
    expect(groups.reduce((sum, g) => sum + g.chapters.length, 0)).toBe(metas.length);
    expect(groups.reduce((sum, g) => sum + g.written, 0)).toBe(metas.filter((c) => c.ready).length);
    expect(groups.reduce((sum, g) => sum + g.read, 0)).toBe(2);
    expect(groups.filter((g) => g.open)).toHaveLength(1);
  });

  it("gives each row one mark, and quiet tags for up next and revise earlier", () => {
    const rows = groups.flatMap((g) => g.chapters);
    const byId = new Map(rows.map((row) => [row.id, row]));
    expect(byId.get("dsa-binary-search")?.mark.kind).toBe("read");
    expect(byId.get("dsa-two-pointers")?.mark.kind).toBe("skipped");
    expect(byId.get("dsa-complexity-analysis")?.mark.kind).toBe("read");
    expect(byId.get("dsa-arrays-strings")?.tag).toBe("up next");
    expect(byId.get("dsa-linked-lists")?.tag).toBe("revise earlier");
    expect(rows.filter((row) => !row.written).every((row) => row.mark.kind === "soon")).toBe(true);
    expect(rows.filter((row) => row.next)).toHaveLength(1);
  });

  const html = renderToStaticMarkup(
    createElement(
      TopicShell,
      base({
        topic: { name: "DSA" },
        hero: {
          ...plainHero,
          title: "DSA",
          status: heroStatus(2, 34, "Arrays & strings"),
          action: { label: "Continue", href: "/dsa/dsa-arrays-strings" },
        },
        groups,
        tools: [
          { id: "practice", label: "Practice", href: "/problems?topic=dsa", count: "277 exercises", glyph: "pencil" },
          { id: "review", label: "Review", href: "/review", count: null, glyph: "loop" },
        ],
        details: { id: "pick-level", title: "Plan & level", hint: "Beginner plan", children: "inside" },
        notes: { id: "notes", title: "Honest notes", items: ["one", "two"] },
      })
    )
  );

  it("draws the list, the tools row, the details panel and the notes once each", () => {
    expect(html.match(/id="topic-primary"/g)).toHaveLength(1);
    expect(html).toContain("2 / 34 read · next: Arrays &amp; strings");
    expect(html.match(/data-tool="/g)).toHaveLength(2);
    expect(html).toMatch(/<details[^>]*id="pick-level"/);
    expect(html).toMatch(/<details[^>]*id="notes"/);
    expect(html).toMatch(/<details[^>]*id="beginner"[^>]* open=""/);
    expect(html).toMatch(/<details[^>]*id="intermediate"(?![^>]* open="")/);
  });

  it("draws each stage as a disclosure with its chip, progress bar and peek", () => {
    expect(html.match(/<details[^>]*id="(beginner|intermediate|advanced)"/g)).toHaveLength(3);
    expect(html.match(/<summary/g)?.length).toBe(5);
    expect(html).toContain("your level");
    expect(html).toContain("not started");
    expect(html).toContain("Next stop: Arrays &amp; strings");
    expect(html.match(/aria-hidden="true"><i><\/i>/g)).toHaveLength(3);
    expect(html).toContain("2 / 10 read");
    expect(html.match(/data-teaser/g)).toBeNull();
  });

  it("draws a first-time invitation with one primary action, quiet links and a three-stop preview", () => {
    const invite = renderToStaticMarkup(
      createElement(
        TopicShell,
        base({
          groups,
          hero: {
            ...plainHero,
            eyebrow: "DSA",
            title: "Let's find your starting point",
            lead: "A short quiz.",
            note: "2 questions today, about 1 minute; more chapters add more.",
            action: { label: "Check my level", href: "/dsa/placement", id: "placement" },
            links: [
              { label: "Start from the beginning", href: "/dsa/first", id: "beginning" },
              { label: "I'll pick a level myself", href: "#pick-level", id: "pick" },
            ],
            teaser: {
              caption: "Three stops, nothing locked",
              stops: groups.map((g) => ({ id: g.id, name: g.name, promise: g.promise, tone: g.tone })),
            },
          },
        })
      )
    );
    expect(invite.match(/id="topic-primary"/g)).toHaveLength(1);
    expect(invite).toMatch(/id="topic-primary"[^>]*data-door="placement"|data-door="placement"[^>]*id="topic-primary"/);
    expect(invite.match(/data-door="/g)).toHaveLength(3);
    expect(invite).toContain("2 questions today, about 1 minute; more chapters add more.");
    expect(invite).toMatch(/data-teaser/);
    expect(invite).toContain("Check my level");
  });

  it("draws a placed reader's level, ring, up next card and exactly one Continue", () => {
    const placed = renderToStaticMarkup(
      createElement(
        TopicShell,
        base({
          groups,
          hero: {
            ...plainHero,
            eyebrow: "DSA",
            title: "Welcome back",
            action: { label: "Continue", href: "/dsa/dsa-arrays-strings" },
            standing: {
              kicker: "Your level",
              name: "Beginner",
              tone: "green",
              read: 2,
              total: 34,
              summary: "2 of 34 chapters read",
              upNext: { code: "B3", title: "Arrays & strings", meta: "7 min · 24 exercises" },
              recheck: { label: "Re-check my level", href: "/dsa/placement?retake=1", id: "recheck" },
              prompt: null,
            },
          },
        })
      )
    );
    expect(placed.match(/id="topic-primary"/g)).toHaveLength(1);
    expect(placed).toContain("Beginner");
    expect(placed).toContain('aria-label="2 of 34 chapters read"');
    expect(placed).toContain("Up next");
    expect(placed).toContain("7 min · 24 exercises");
    expect(placed).toContain("Re-check my level");
    expect(placed).not.toContain("Not sure where you stand");
  });

  it("offers a gentle prompt instead of a level badge when there are only ticks", () => {
    const ticks = renderToStaticMarkup(
      createElement(
        TopicShell,
        base({
          hero: {
            ...plainHero,
            action: { label: "Continue", href: "/x" },
            standing: {
              kicker: "Your progress",
              name: null,
              tone: "green",
              read: 3,
              total: 34,
              summary: "3 of 34 chapters read",
              upNext: null,
              recheck: null,
              prompt: { text: "Not sure where you stand?", link: { label: "Check my level", href: "/c" } },
            },
          },
        })
      )
    );
    expect(ticks).toContain("Not sure where you stand?");
    expect(ticks).toContain("All caught up");
    expect(ticks.match(/id="topic-primary"/g)).toHaveLength(1);
  });

  it("lets a first-time hero hold its own choice and no action", () => {
    const first = renderToStaticMarkup(
      createElement(
        TopicShell,
        base({
          hero: { ...plainHero, title: "DSA", lead: "How?", choice: createElement("ul", { id: "doors" }) },
        })
      )
    );
    expect(first).not.toContain("topic-primary");
    expect(first).toContain('id="doors"');
  });
});

describe("the shell's pure model", () => {
  const ready = { id: "a", ready: true };

  it("tells every state in words", () => {
    expect(markFor({ id: "a", ready: false }, null, null)).toMatchObject({ kind: "soon", word: "soon" });
    expect(markFor(ready, new Set(), null)).toMatchObject({ kind: "todo", word: null });
    expect(markFor(ready, new Set(["a"]), null)).toMatchObject({ kind: "read", word: "read" });
    expect(markFor(ready, new Set(["a"]), new Map([["a", "checked" as const]]))).toMatchObject({
      kind: "checked",
      word: "checked",
    });
    expect(markFor(ready, new Set(["a"]), new Map([["a", "not-checked" as const]]))).toMatchObject({
      kind: "unchecked",
      word: "not checked",
    });
    expect(markFor(ready, new Set(), new Map([["a", "tested-out" as const]]))).toMatchObject({
      kind: "skipped",
      word: "tested out",
    });
    expect(markFor(ready, new Set(["a"]), new Map([["a", "read-before-checks" as const]]))).toMatchObject({
      kind: "read",
      word: "read",
      label: "read, read before checks",
    });
  });

  it("opens the level of the next chapter, then the reader's level, then the first", () => {
    expect(currentLevel(jsCards, "proxies", "beginner", "beginner")).toBe("advanced");
    expect(currentLevel(jsCards, null, "advanced", "beginner")).toBe("advanced");
    expect(currentLevel(jsCards, null, null, "beginner")).toBe("beginner");
  });

  it("summarises a level by its read count once the page is live", () => {
    expect(groupSummary({ read: 0, written: 10 }, true)).toBe("0 / 10 read");
    expect(groupSummary({ read: 3, written: 10 }, true)).toBe("3 / 10 read");
    expect(groupSummary({ read: 3, written: 10 }, false)).toBe("10 chapters");
  });

  it("tells a stage's status in one word and its progress as a share", () => {
    expect(stageStatus({ read: 10, written: 10, yours: true }, true)).toBe("done");
    expect(stageStatus({ read: 2, written: 10, yours: true }, true)).toBe("yours");
    expect(stageStatus({ read: 0, written: 10, yours: false }, true)).toBe("next");
    expect(stageStatus({ read: 2, written: 10, yours: false }, false)).toBe("started");
    expect(stageStatus({ read: 0, written: 10, yours: false }, false)).toBe("fresh");
    expect(stageStatus({ read: 0, written: 0, yours: false }, false)).toBe("fresh");
    expect(percent(4, 10)).toBe(40);
    expect(percent(0, 0)).toBe(0);
    expect(percent(12, 10)).toBe(100);
  });

  it("peeks at the next stop of a closed stage", () => {
    const rows = buildGroups({
      parts: jsParts,
      cards: jsCards,
      basePath: "/notes",
      done: new Set(["scope"]),
      states: null,
      nextId: null,
      reviseIds: new Set(),
      yourLevel: null,
      openLevel: null,
      titleOf: (card) => card.title,
    });
    expect(rows[0].peek).toBe("Next stop: Closures");
    expect(rows[1].peek).toBe("Chapters are on their way");
    expect(peekFor(rows[0].chapters, 2, 2)).toBe("Every chapter read");
    expect(
      peekFor(
        rows[0].chapters.slice(0, 1).map((c) => ({ ...c, mark: { ...c.mark, kind: "todo" as const } })),
        0,
        1
      )
    ).toBe("Starts with Scope");
  });

  it("describes the up next chapter by its time and exercises", () => {
    expect(upNextOf(undefined)).toBeNull();
    const row = buildGroups({
      parts: jsParts,
      cards: jsCards,
      basePath: "/notes",
      done: null,
      states: null,
      nextId: "scope",
      reviseIds: new Set(),
      yourLevel: null,
      openLevel: null,
      titleOf: (card) => card.title,
    })[0].chapters[0];
    expect(upNextOf(row)).toEqual({ code: "1", title: "Scope", meta: "8 min · 2 exercises" });
  });

  it("closes the status line honestly when nothing is next", () => {
    expect(heroStatus(34, 34, null)).toBe("34 / 34 read · every chapter read");
    expect(heroStatus(5, 34, null)).toBe("5 / 34 read · your plan is done");
  });
});

describe("the shell stays generic", () => {
  const files = readdirSync(join(process.cwd(), "components/topic/shell"));

  it("names no topic in its code", () => {
    for (const file of files.filter((name) => /\.tsx?$/.test(name))) {
      expect(read(`components/topic/shell/${file}`), file).not.toMatch(/\bdsa\b|\bjs\b|javascript|placement/i);
    }
  });

  it("uses theme tokens and no tilt, tape or hand-set colour", () => {
    const css = read("components/topic/shell/shell.module.css");
    expect(css).not.toMatch(/#[0-9a-f]{3,8}\b|rgba?\(|\bwhite\b(?!-)|--tilt|tape/i);
    expect(read("components/topic/shell/TopicShell.tsx")).not.toContain("data-fx");
  });
});
