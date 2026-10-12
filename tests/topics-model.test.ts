import { describe, expect, it } from "vitest";
import { layoutMetro } from "@/lib/metro";
import { TOPIC_CATEGORIES } from "@/lib/topicCategories";
import {
  buildTopics,
  exactTopic,
  findTopics,
  legendCell,
  legendChipsRow,
  lineGlyph,
  startTopic,
  toneOfCategory,
} from "@/components/home/topicsModel";
import type { ShelfCard } from "@/components/home/types";
import { onShelf } from "@/lib/topicShelf";
import { topicsNavWithStats } from "@/lib/topicStats";

const card = (id: string, name: string, category: ShelfCard["category"], chapters = 0): ShelfCard => ({
  id,
  name,
  mark: id.slice(0, 2),
  accent: "blue",
  tagline: `${name} tagline`,
  category,
  href: `/${id}`,
  chapters,
  exercises: chapters * 2,
  minutes: chapters * 10,
});

const ready = [card("react", "React", "web", 57), card("js", "JavaScript", "languages", 41)];
const soon = [card("rust", "Rust", "languages"), card("go", "Go", "languages"), card("css", "CSS", "web")];
const topics = buildTopics(ready, soon, { rounds: 27, questions: 420 });

describe("the home topic model", () => {
  it("orders topics by category with the written ones first and the interview book after computer science", () => {
    expect(topics.map((topic) => topic.id)).toEqual(["js", "rust", "go", "react", "css", "interview"]);
    expect(topics.find((topic) => topic.id === "js")).toMatchObject({
      written: true,
      chip: "41 chapters",
      label: "JavaScript, 41 chapters, written",
    });
    expect(topics.find((topic) => topic.id === "rust")).toMatchObject({
      written: false,
      chip: "Coming soon",
      label: "Rust, coming soon",
    });
    expect(topics.find((topic) => topic.id === "interview")).toMatchObject({ chip: "27 rounds", href: "/interview" });
  });

  it("finds topics by name or id, ignoring case, spaces and punctuation, and finds nothing for an empty query", () => {
    expect(findTopics(topics, "").length).toBe(0);
    expect(findTopics(topics, "   ").length).toBe(0);
    expect(findTopics(topics, "RUS").map((topic) => topic.id)).toEqual(["rust"]);
    expect(findTopics(topics, "  script ").map((topic) => topic.id)).toEqual(["js"]);
    expect(findTopics(topics, "zzz").length).toBe(0);
  });

  it("matches the way people type names: node js, next js, c plus plus and c++", () => {
    const named = buildTopics(
      [card("js", "JavaScript", "languages", 4), card("nextjs", "Next.js", "web", 2)],
      [card("node", "Node.js", "backend"), card("cpp", "C++", "languages")],
      { rounds: 1, questions: 1 }
    );
    expect(findTopics(named, "node js").map((t) => t.id)).toEqual(["node"]);
    expect(findTopics(named, "Next JS").map((t) => t.id)).toEqual(["nextjs"]);
    expect(findTopics(named, "c plus plus").map((t) => t.id)).toEqual(["cpp"]);
    expect(findTopics(named, "c++").map((t) => t.id)).toEqual(["cpp"]);
  });

  it("knows common aliases and categories", () => {
    const all = buildTopics(
      [card("js", "JavaScript", "languages", 4)],
      [
        card("kubernetes", "Kubernetes", "devops"),
        card("go", "Go", "languages"),
        card("databases", "SQL & Databases", "data"),
        card("mongodb", "MongoDB", "data"),
        card("typescript", "TypeScript", "languages"),
        card("python", "Python", "languages"),
        card("react", "React", "web"),
        card("ai", "Claude & AI tools", "ai"),
        card("node", "Node.js", "backend"),
      ],
      { rounds: 1, questions: 1 }
    );
    expect(findTopics(all, "k8s").map((t) => t.id)).toContain("kubernetes");
    expect(findTopics(all, "golang").map((t) => t.id)).toContain("go");
    expect(findTopics(all, "postgres").map((t) => t.id)).toContain("databases");
    expect(findTopics(all, "mongo").map((t) => t.id)).toContain("mongodb");
    expect(findTopics(all, "ts").map((t) => t.id)).toContain("typescript");
    expect(findTopics(all, "py").map((t) => t.id)).toContain("python");
    expect(findTopics(all, "js").map((t) => t.id)).toContain("js");
    expect(findTopics(all, "frontend").map((t) => t.id)).toEqual(["react"]);
    expect(findTopics(all, "backend").map((t) => t.id)).toEqual(["node"]);
    expect(findTopics(all, "ai").map((t) => t.id)).toContain("ai");
  });

  it("finds the exact name before a longer match, so java opens Java", () => {
    const java = buildTopics([card("js", "JavaScript", "languages", 4)], [card("java", "Java", "languages")], {
      rounds: 1,
      questions: 1,
    });
    expect(findTopics(java, "java")).toHaveLength(2);
    expect(exactTopic(java, "Java")?.id).toBe("java");
    expect(exactTopic(java, "js")?.id).toBe("js");
    expect(exactTopic(java, "jav")).toBeUndefined();
    expect(exactTopic(java, " ")).toBeUndefined();
  });

  it("places legend rows column by column and opens the active row's chips under it", () => {
    expect(legendCell(0, 0, 9)).toEqual({ row: 1, column: 1 });
    expect(legendCell(1, 0, 9)).toEqual({ row: 3, column: 1 });
    expect(legendCell(4, 0, 9)).toEqual({ row: 6, column: 1 });
    expect(legendCell(5, 0, 9)).toEqual({ row: 1, column: 2 });
    expect(legendCell(6, 0, 9)).toEqual({ row: 3, column: 2 });
    expect(legendChipsRow(0, 9)).toBe(2);
    expect(legendCell(5, 5, 9)).toEqual({ row: 1, column: 2 });
    expect(legendChipsRow(5, 9)).toBe(2);
    expect(legendCell(2, 2, 9)).toEqual({ row: 3, column: 1 });
    expect(legendCell(3, 2, 9)).toEqual({ row: 5, column: 1 });
    expect(legendChipsRow(2, 9)).toBe(4);
    expect(legendCell(0, 0, 4)).toEqual({ row: 1, column: 1 });
    expect(legendCell(2, 0, 4)).toEqual({ row: 1, column: 2 });
    expect(legendCell(1, 1, 4)).toEqual({ row: 2, column: 1 });
    expect(legendChipsRow(1, 4)).toBe(3);
  });

  it("recommends JavaScript when it is written, otherwise the written topic with the most chapters", () => {
    expect(startTopic(ready)?.id).toBe("js");
    expect(startTopic([card("react", "React", "web", 57), card("git", "Git", "engineering", 18)])?.id).toBe("react");
    expect(startTopic([])).toBeUndefined();
  });

  it("draws each category as the real shape of its line, inside the glyph frame", () => {
    const real = topicsNavWithStats().filter((topic) => onShelf(topic.id));
    const layout = layoutMetro(
      real.map((topic) => ({ id: topic.id, name: topic.name, category: topic.category, lit: topic.written > 0 })),
      TOPIC_CATEGORIES
    );
    const glyph = lineGlyph(layout, "languages")!;
    expect(glyph.dots).toHaveLength(8);
    for (const dot of glyph.dots) {
      expect(dot.x).toBeGreaterThanOrEqual(0);
      expect(dot.x).toBeLessThanOrEqual(40);
      expect(dot.y).toBeGreaterThanOrEqual(0);
      expect(dot.y).toBeLessThanOrEqual(24);
    }
    expect(glyph.dots.filter((dot) => dot.lit)).toHaveLength(1);
    expect(glyph.lines).toMatch(/^M[\d. -]+L[\d. -]+/);
    expect(lineGlyph(layout, "nowhere")).toBeNull();
    expect(lineGlyph(layout, "ai")!.dots).toHaveLength(1);
  });

  it("gives every category its own accent colour token and an unknown one the fallback", () => {
    const tones = TOPIC_CATEGORIES.map((category) => toneOfCategory(category.id));
    expect(new Set(tones).size).toBe(tones.length);
    expect(tones).not.toContain(toneOfCategory("nowhere"));
  });

  it("draws a glyph for every category from the real line", () => {
    const real = topicsNavWithStats().filter((topic) => onShelf(topic.id));
    const layout = layoutMetro(
      real.map((topic) => ({ id: topic.id, name: topic.name, category: topic.category, lit: topic.written > 0 })),
      TOPIC_CATEGORIES
    );
    for (const category of TOPIC_CATEGORIES) expect(lineGlyph(layout, category.id), category.id).not.toBeNull();
  });
});
