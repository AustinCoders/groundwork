import { describe, expect, it } from "vitest";
import { continueCard, startTopic } from "@/lib/continueCard";
import { guidesNav } from "@/lib/guidesNav";
import { parseResume, sinceLabel, type Resume } from "@/lib/resume";
import { isReadable } from "@/lib/topicCategories";
import { topicsNavWithStats } from "@/lib/topicStats";

const guides = guidesNav();
const guideIds = new Set(guides.map((g) => g.id));
const topics = topicsNavWithStats().filter((t) => !guideIds.has(t.id));
const NOW = Date.UTC(2026, 9, 9, 12);
const DAY = 24 * 60 * 60 * 1000;

function visit(overrides: Partial<Resume> = {}): Resume {
  const topic = topics.find(isReadable)!;
  return {
    v: 1,
    topic: topic.id,
    topicName: topic.name,
    chapter: "intro",
    num: "3",
    title: "Closures",
    href: `/${topic.id}/intro`,
    index: 3,
    total: topic.written,
    at: NOW,
    ...overrides,
  };
}

describe("the saved place", () => {
  it("accepts a well-formed visit", () => {
    expect(parseResume(visit())).toEqual(visit());
  });

  it("rejects anything malformed", () => {
    expect(parseResume(null)).toBeNull();
    expect(parseResume("x")).toBeNull();
    expect(parseResume({ ...visit(), v: 2 })).toBeNull();
    expect(parseResume({ ...visit(), title: "" })).toBeNull();
    expect(parseResume({ ...visit(), index: 0 })).toBeNull();
    expect(parseResume({ ...visit(), index: 9, total: 4 })).toBeNull();
    expect(parseResume({ ...visit(), at: "now" })).toBeNull();
    expect(parseResume({ ...visit(), href: "https://elsewhere.example/x" })).toBeNull();
    expect(parseResume({ ...visit(), href: "//elsewhere.example/x" })).toBeNull();
  });

  it("says how long ago in words", () => {
    expect(sinceLabel(NOW, NOW)).toBe("today");
    expect(sinceLabel(NOW - DAY, NOW)).toBe("yesterday");
    expect(sinceLabel(NOW - 5 * DAY, NOW)).toBe("5 days ago");
  });
});

describe("the Continue card", () => {
  it("returns to the saved chapter of a written topic", () => {
    const card = continueCard(visit({ at: NOW - 2 * DAY }), topics, guides, NOW);
    expect(card).toMatchObject({ kind: "resume", title: "Closures", index: 3, since: "2 days ago" });
  });

  it("returns to a chapter of a guide that still has it", () => {
    const guide = guides[0];
    const chapter = guide.groups[0].chapters[0];
    const card = continueCard(
      visit({ topic: guide.id, topicName: guide.name, chapter: chapter.id, href: chapter.href, total: guide.total }),
      topics,
      guides,
      NOW
    );
    expect(card).toMatchObject({ kind: "resume", href: chapter.href });
  });

  it("falls back to Start here for a guide chapter that is gone", () => {
    const guide = guides[0];
    const card = continueCard(
      visit({ topic: guide.id, chapter: "gone", href: `${guide.href}/gone` }),
      topics,
      guides,
      NOW
    );
    expect(card?.kind).toBe("start");
  });

  it("falls back to Start here with no history, an unknown topic or an unwritten one", () => {
    const soon = topics.find((t) => !isReadable(t))!;
    expect(continueCard(null, topics, guides, NOW)?.kind).toBe("start");
    expect(continueCard(visit({ topic: "no-such-topic" }), topics, guides, NOW)?.kind).toBe("start");
    expect(continueCard(visit({ topic: soon.id }), topics, guides, NOW)?.kind).toBe("start");
  });

  it("starts with the topic that has the most written chapters", () => {
    const best = startTopic(topics)!;
    expect(isReadable(best)).toBe(true);
    for (const t of topics.filter(isReadable)) expect(best.written).toBeGreaterThanOrEqual(t.written);
    expect(continueCard(null, topics, guides, NOW)).toMatchObject({ kind: "start", name: best.name });
  });

  it("shows nothing when no topic is written", () => {
    expect(continueCard(null, [], [], NOW)).toBeNull();
  });
});
