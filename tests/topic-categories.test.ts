import { describe, expect, it } from "vitest";
import { topics, topicsNav } from "@/lib/topics";
import { topicsNavWithStats } from "@/lib/topicStats";
import { TOPIC_CATEGORIES, groupByCategory, isReadable } from "@/lib/topicCategories";
import { guidesNav } from "@/lib/guidesNav";
import { onShelf } from "@/lib/topicShelf";
import { curriculumNotes } from "@/lib/topics";
import { plannedRelatedTopicId, relatedTopicId } from "@/lib/topicRelated";
import { outlineTopicIds } from "@/lib/topicIds";
import { PINNED_OUTLINE_TOPIC_IDS } from "@/next.config";
import { existsSync } from "node:fs";
import { join } from "node:path";

const known = new Set<string>(TOPIC_CATEGORIES.map((c) => c.id));
const guideIds = new Set(guidesNav().map((g) => g.id));
const listed = topics().filter((t) => !guideIds.has(t.id));

const NEW_TOPIC_IDS = ["python", "java", "cpp", "rust", "ruby", "go", "mongodb", "dbms", "networks", "os", "ai"];

describe("topic categories", () => {
  it("lists the eight categories in order, each with a label", () => {
    expect(TOPIC_CATEGORIES.map((c) => c.id)).toEqual([
      "languages",
      "web",
      "backend",
      "data",
      "cs",
      "devops",
      "engineering",
      "ai",
    ]);
    for (const c of TOPIC_CATEGORIES) expect(c.label.trim(), `${c.id} has no label`).not.toBe("");
  });

  it("gives every topic in the sidebar a known category", () => {
    for (const t of listed) {
      expect(t.category, `${t.id} has no category`).toBeDefined();
      expect(known.has(t.category!), `${t.id} has the unknown category "${t.category}"`).toBe(true);
    }
  });

  it("gives every category at least one topic", () => {
    for (const c of TOPIC_CATEGORIES) {
      expect(
        listed.some((t) => t.category === c.id),
        `${c.label} has no topic`
      ).toBe(true);
    }
  });

  it("carries the category into the navigation data", () => {
    for (const t of topicsNav()) {
      expect(t.category).toBe(topics().find((x) => x.id === t.id)?.category ?? null);
    }
  });

  it("files the topics where the platform plan puts them", () => {
    const of = (id: string) => topics().find((t) => t.id === id)?.category;
    for (const id of ["js", "typescript", "python", "java", "cpp", "rust", "ruby", "go"])
      expect(of(id)).toBe("languages");
    for (const id of ["html", "css", "react", "nextjs"]) expect(of(id)).toBe("web");
    for (const id of ["nestjs", "node", "graphql"]) expect(of(id)).toBe("backend");
    for (const id of ["databases", "redis", "mongodb", "dbms"]) expect(of(id)).toBe("data");
    for (const id of ["dsa", "system-design", "networks", "os"]) expect(of(id)).toBe("cs");
    for (const id of ["docker", "kubernetes", "cloud-devops"]) expect(of(id)).toBe("devops");
    for (const id of ["testing", "security"]) expect(of(id)).toBe("engineering");
    expect(of("ai")).toBe("ai");
  });

  it("lists ready topics before coming-soon ones inside each category", () => {
    const groups = groupByCategory(topicsNavWithStats().filter((t) => !guideIds.has(t.id)));
    expect(groups.length).toBeGreaterThan(1);
    for (const group of groups) {
      const flags = group.topics.map(isReadable);
      expect(flags, `${group.label} lists a coming-soon topic before a ready one`).toEqual(
        [...flags].sort((a, b) => Number(b) - Number(a))
      );
    }
  });

  it("keeps every sidebar topic in exactly one group", () => {
    const nav = topicsNavWithStats().filter((t) => !guideIds.has(t.id));
    const grouped = groupByCategory(nav).flatMap((g) => g.topics.map((t) => t.id));
    expect(grouped.sort()).toEqual(nav.map((t) => t.id).sort());
  });

  it("names the DSA topic DSA", () => {
    expect(topics().find((t) => t.id === "dsa")?.name).toBe("DSA");
  });
});

describe("coming-soon topics", () => {
  it("adds the eleven new topics as outlines with an empty syllabus", () => {
    for (const id of NEW_TOPIC_IDS) {
      const t = topics().find((x) => x.id === id);
      expect(t, `${id} is missing`).toBeDefined();
      expect(t!.status).toBe("ready");
      expect(t!.levels).toEqual([]);
      expect(t!.blurb.trim().length).toBeGreaterThan(40);
      expect(outlineTopicIds()).toContain(id);
      expect(PINNED_OUTLINE_TOPIC_IDS).toContain(id);
      expect(existsSync(join(process.cwd(), "app", id, "page.tsx")), `app/${id}/page.tsx`).toBe(true);
    }
  });

  it("keeps every new topic on the shelf", () => {
    for (const id of NEW_TOPIC_IDS) expect(onShelf(id)).toBe(true);
  });
});

describe("planning topics", () => {
  it("never borrow JavaScript's curriculum notes", () => {
    const planning = topics().filter((t) => t.levels && t.levels.length === 0);
    expect(planning.map((t) => t.id).sort()).toEqual([...NEW_TOPIC_IDS].sort());
    for (const t of planning) expect(curriculumNotes(t.id), `${t.id} shows notes it does not own`).toEqual([]);
  });

  it("points each at a written neighbour, or at none", () => {
    for (const id of ["python", "java", "cpp"]) expect(plannedRelatedTopicId(id)).toBe("dsa");
    for (const id of ["mongodb", "dbms", "networks", "os"]) expect(plannedRelatedTopicId(id)).toBe("system-design");
    for (const id of ["rust", "ruby", "go", "ai"]) expect(plannedRelatedTopicId(id)).toBeNull();
  });

  it("keeps the neighbours of topics that already have chapters", () => {
    expect(relatedTopicId("typescript")).toBe("js");
    expect(relatedTopicId("nextjs")).toBe("react");
    expect(relatedTopicId("docker")).toBe("js");
  });
});
