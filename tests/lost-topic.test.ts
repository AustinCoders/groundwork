import { describe, expect, it } from "vitest";
import { guidesNav } from "@/lib/guidesNav";
import { lostButtonLabel, topicForPath, type LostTopic } from "@/lib/lostTopic";
import { notesHref, topicHome, topics } from "@/lib/topics";

const guideIds = new Set(guidesNav().map((guide) => guide.id));
const LIST: LostTopic[] = topics()
  .filter((topic) => topic.status === "ready")
  .map((topic) => ({
    id: topic.id,
    name: topic.name,
    segment: notesHref(topic.id).slice(1),
    home: topicHome(topic.id),
    guide: guideIds.has(topic.id),
  }));

describe("the topic a missing page belonged to", () => {
  it("finds the topic from the first segment, and offers its home", () => {
    const dsa = topicForPath("/dsa/zzz", LIST);
    expect(dsa?.id).toBe("dsa");
    expect(dsa?.home).toBe("/level/dsa");
    expect(topicForPath("/react/zzz", LIST)?.home).toBe(topicHome("react"));
    expect(topicForPath("/notes/zzz", LIST)?.id).toBe("js");
  });

  it("reads the topic from a level or path address", () => {
    expect(topicForPath("/level/dsa/extra", LIST)?.id).toBe("dsa");
    expect(topicForPath("/path/dsa/zzz", LIST)?.id).toBe("dsa");
    expect(topicForPath("/path", LIST)).toBeNull();
  });

  it("ignores case, and offers nothing for pages that belong to no topic", () => {
    expect(topicForPath("/DSA/ZZZ", LIST)?.id).toBe("dsa");
    expect(topicForPath("/zzz", LIST)).toBeNull();
    expect(topicForPath("/", LIST)).toBeNull();
    expect(topicForPath("/level/zzz", LIST)).toBeNull();
  });

  it("names the button after the topic, without 'notes' for the guides", () => {
    expect(lostButtonLabel(topicForPath("/dsa/zzz", LIST)!)).toBe("Open the DSA notes");
    expect(lostButtonLabel(topicForPath("/interview/zzz", LIST)!)).toMatch(/^Open the (?!.*notes$)/);
  });
});
