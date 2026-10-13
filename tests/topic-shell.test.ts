import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { TopicShell } from "@/components/topic/shell/TopicShell";
import { buildGroups, currentLevel, groupSummary, heroStatus, markFor } from "@/components/topic/shell/model";
import type { ShellCard, ShellPart, TopicShellProps } from "@/components/topic/shell/types";
import { buildChapterStates } from "@/lib/chapterState";
import { chapterMetas, levels } from "@/lib/content";
import { coverCards, coverParts } from "@/lib/coverData";

const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

const jsParts: ShellPart[] = [
  { level: "beginner", title: "Beginner" },
  { level: "advanced", title: "Advanced" },
];

const jsCards: ShellCard[] = [
  { id: "scope", num: "1", title: "Scope", levels: ["beginner"], minutes: 8, exercises: 2, ready: true },
  { id: "closures", num: "2", title: "Closures", levels: ["beginner"], minutes: 9, exercises: 0, ready: true },
  { id: "proxies", num: "3", title: "Proxies", levels: ["advanced"], minutes: 0, exercises: 0, ready: false },
];

const base = (overrides: Partial<TopicShellProps>): TopicShellProps => ({
  topic: { name: "Topic" },
  ready: true,
  hero: { title: "Topic", lead: null, status: null, action: null, choice: null },
  pathTitle: "Your path",
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
          title: "JavaScript",
          lead: null,
          status: heroStatus(done?.size ?? 0, 2, "Closures"),
          action: { label: "Continue", href: "/notes/closures" },
          choice: null,
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
    expect(html.match(/<li /g)).toHaveLength(3);
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
          title: "DSA",
          lead: null,
          status: heroStatus(2, 34, "Arrays & strings"),
          action: { label: "Continue", href: "/dsa/dsa-arrays-strings" },
          choice: null,
        },
        groups,
        tools: [
          { id: "practice", label: "Practice", href: "/problems?topic=dsa", count: "277 exercises" },
          { id: "review", label: "Review", href: "/review", count: null },
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

  it("lets a first-time hero hold its own choice and no action", () => {
    const first = renderToStaticMarkup(
      createElement(
        TopicShell,
        base({
          hero: {
            title: "DSA",
            lead: "How?",
            status: null,
            action: null,
            choice: createElement("ul", { id: "doors" }),
          },
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

  it("summarises a level by its read count once there is one", () => {
    expect(groupSummary({ read: 0, written: 10 }, true)).toBe("10 chapters");
    expect(groupSummary({ read: 3, written: 10 }, true)).toBe("3 / 10 read");
    expect(groupSummary({ read: 3, written: 10 }, false)).toBe("10 chapters");
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
