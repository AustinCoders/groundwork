import { describe, expect, it } from "vitest";
import sitemap from "@/app/sitemap";
import { topicChapterMetadata, topicCoverMetadata } from "@/components/reader/topicPages";
import { chapters, chapterHref, exercises, notesHref, topics } from "@/lib/content";
import { pageMetadata } from "@/lib/metadata";
import { practiceChapterLinks, problemHref } from "@/lib/practiceLinks";
import { CANONICAL_ORIGIN, SITE_URL } from "@/lib/site";
import { navHref } from "@/lib/topicNav";
import { topicsNavWithStats } from "@/lib/topicStats";

const entries = sitemap();
const urls = new Set(entries.map((e) => e.url));
const readyTopics = topics().filter((t) => t.status === "ready");

describe("sitemap", () => {
  it("lists no chapter that has not been written", () => {
    for (const t of readyTopics) {
      for (const ch of chapters(t.id)) {
        if (ch.ready) continue;
        const url = `${SITE_URL}${chapterHref(t.id, ch.id)}`;
        expect(urls.has(url), `${t.id}/${ch.id} is an outline but is in the sitemap`).toBe(false);
      }
    }
  });

  it("lists every chapter that has been written", () => {
    for (const t of readyTopics) {
      for (const ch of chapters(t.id)) {
        if (!ch.ready) continue;
        const url = `${SITE_URL}${chapterHref(t.id, ch.id)}`;
        expect(urls.has(url), `${t.id}/${ch.id} is written but missing from the sitemap`).toBe(true);
      }
    }
  });

  it("leaves out the cover of a topic that is still an outline", () => {
    for (const t of readyTopics) {
      if (!t.levels) continue;
      if (chapters(t.id).some((ch) => ch.ready)) continue;
      expect(urls.has(`${SITE_URL}${notesHref(t.id)}`), `${t.id} has nothing written but its cover is listed`).toBe(
        false
      );
    }
  });

  it("has no duplicate entries", () => {
    expect(urls.size).toBe(entries.length);
  });

  it("builds every url on one origin", () => {
    for (const e of entries) {
      expect(e.url.startsWith(SITE_URL), `${e.url} is not on ${SITE_URL}`).toBe(true);
    }
  });

  it("lists the mock room, the question bank and privacy, and drops the empty playground shell", () => {
    expect(urls.has(`${SITE_URL}/mock`)).toBe(true);
    expect(urls.has(`${SITE_URL}/interview/questions`)).toBe(true);
    expect(urls.has(`${SITE_URL}/privacy`)).toBe(true);
    expect(urls.has(`${SITE_URL}/practice`)).toBe(false);
  });

  it("gives every entry a lastModified that is not the moment of the build", () => {
    const now = Date.now();
    for (const e of entries) {
      const stamp = new Date(e.lastModified as Date).getTime();
      expect(now - stamp, `${e.url} carries today's date instead of a content date`).toBeGreaterThan(60_000);
    }
  });

  it("gives a topic's own lastModified from its own notes file, not the shared fallback", () => {
    const stamp = (url: string) => new Date(entries.find((e) => e.url === url)!.lastModified as Date).getTime();
    const augustTopic = stamp(`${SITE_URL}${notesHref("dsa")}`);
    const septemberTopic = stamp(`${SITE_URL}${notesHref("react")}`);
    const undated = stamp(`${SITE_URL}/problems`);
    expect(augustTopic, "an August-dated topic shares a date with a September one").not.toBe(septemberTopic);
    expect(septemberTopic, "a dated topic's cover matches the undated fallback by coincidence").not.toBe(undated);
  });
});

describe("problem pages", () => {
  it("gives every exercise its own url in the sitemap", () => {
    for (const ex of exercises()) {
      expect(urls.has(`${SITE_URL}${problemHref(ex.id)}`), `${ex.id} has no page in the sitemap`).toBe(true);
    }
  });

  it("keeps every exercise id usable as a url segment", () => {
    for (const ex of exercises()) {
      expect(ex.id, `"${ex.id}" is not a clean URL segment`).toMatch(/^[a-z0-9][a-z0-9-]*$/);
    }
  });
});

describe("chapter metadata", () => {
  it("asks crawlers to skip an unwritten chapter and to index a written one", () => {
    for (const t of readyTopics) {
      for (const ch of chapters(t.id)) {
        const meta = topicChapterMetadata(t.id, ch.id);
        const robots = meta.robots as { index?: boolean } | undefined;
        if (ch.ready) {
          expect(robots?.index, `${t.id}/${ch.id} is written but asks not to be indexed`).not.toBe(false);
        } else {
          expect(robots?.index, `${t.id}/${ch.id} is an outline but indexable`).toBe(false);
        }
      }
    }
  });

  it("gives every chapter a canonical path under its own topic", () => {
    for (const t of readyTopics) {
      for (const ch of chapters(t.id)) {
        const canonical = topicChapterMetadata(t.id, ch.id).alternates?.canonical;
        expect(canonical, `${t.id}/${ch.id} has no canonical`).toBe(`${notesHref(t.id)}/${ch.id}`);
      }
    }
  });
});

describe("topic cover metadata", () => {
  it("points every cover at its own canonical", () => {
    for (const t of readyTopics) {
      expect(topicCoverMetadata(t.id).alternates?.canonical, `${t.id} cover has the wrong canonical`).toBe(
        notesHref(t.id)
      );
    }
  });

  it("gives every cover its own Open Graph title and url", () => {
    const seen = new Set<string>();
    for (const t of readyTopics) {
      const og = topicCoverMetadata(t.id).openGraph as { title?: string; url?: string } | undefined;
      expect(og?.url, `${t.id} cover has no og:url of its own`).toBe(notesHref(t.id));
      expect(og?.title, `${t.id} cover has no og:title`).toBeTruthy();
      expect(seen.has(String(og?.title)), `${t.id} shares an og:title with another topic`).toBe(false);
      seen.add(String(og?.title));
    }
  });

  it("gives every cover and chapter a share image", () => {
    for (const t of readyTopics) {
      const coverOg = topicCoverMetadata(t.id).openGraph as { images?: unknown[] } | undefined;
      expect(coverOg?.images?.length, `${t.id} cover has no og:image`).toBeGreaterThan(0);
      for (const ch of chapters(t.id).filter((c) => c.ready)) {
        const chapterOg = topicChapterMetadata(t.id, ch.id).openGraph as { images?: unknown[] } | undefined;
        expect(chapterOg?.images?.length, `${t.id}/${ch.id} has no og:image`).toBeGreaterThan(0);
      }
    }
  });

  it("asks crawlers to skip a topic that is still an outline", () => {
    for (const t of readyTopics) {
      const robots = topicCoverMetadata(t.id).robots as { index?: boolean } | undefined;
      const written = chapters(t.id).filter((ch) => ch.ready).length;
      expect(robots?.index === false, `${t.id} cover robots do not match its ${written} written chapters`).toBe(
        written === 0
      );
    }
  });
});

describe("links into a topic", () => {
  it("sends a topic with nothing written to its own outline landing rather than an empty reading path", () => {
    for (const t of topicsNavWithStats()) {
      if (t.written > 0) continue;
      expect(navHref(t, "beginner"), `${t.id} is an outline but links into the reader`).toBe(`/${t.id}`);
    }
  });

  it("keeps every topic ready, because links and redirects no longer special-case a topic that is not", () => {
    for (const t of topics()) expect(t.status, `${t.id} is not ready`).toBe("ready");
  });

  it("sends a topic with chapters into the reader", () => {
    for (const t of topicsNavWithStats()) {
      if (t.written === 0) continue;
      expect(navHref(t, null), `${t.id} has chapters but links to /soon`).not.toContain("/soon");
    }
  });
});

describe("problem breadcrumbs", () => {
  it("names a problem's own topic instead of always saying JavaScript", () => {
    const links = practiceChapterLinks();
    for (const t of readyTopics) {
      if (!t.levels) continue;
      for (const ch of chapters(t.id)) {
        const link = links[ch.id];
        if (!link) continue;
        expect(link.topic.name, `${ch.id}'s breadcrumb names the wrong topic`).toBe(t.name);
        expect(link.topic.href, `${ch.id}'s breadcrumb links the wrong topic`).toBe(notesHref(t.id));
      }
    }
  });
});

describe("share images", () => {
  it("gives a share image to pages with no section of their own", () => {
    const mock = pageMetadata({ title: "Mock interview", description: "d", path: "/mock" });
    const privacy = pageMetadata({ title: "Privacy", description: "d", path: "/privacy" });
    const og = (m: ReturnType<typeof pageMetadata>) => m.openGraph as { images?: unknown[] } | undefined;
    expect(og(mock)?.images?.length).toBeGreaterThan(0);
    expect(og(privacy)?.images?.length).toBeGreaterThan(0);
  });

  it("matches every section, cover and level page to its own image before falling back to the site default", () => {
    const og = (path: string) => {
      const meta = pageMetadata({ title: "t", description: "d", path });
      return (meta.openGraph as { images?: string[] } | undefined)?.images?.[0];
    };
    expect(og("/interview/questions")).toBe("/interview/opengraph-image");
    expect(og("/problems/ex-accounts-merge")).toBe("/problems/opengraph-image");
    expect(og("/notes")).toBe("/notes/opengraph-image");
    expect(og("/notes/closures")).toBe("/notes/opengraph-image");
    expect(og("/react")).toBe("/react/opengraph-image");
    expect(og("/dsa")).toBe("/dsa/opengraph-image");
    expect(og("/system-design")).toBe("/system-design/opengraph-image");
    expect(og("/git")).toBe("/git/opengraph-image");
    expect(og("/git/merge")).toBe("/git/opengraph-image");
    expect(og("/architecture")).toBe("/architecture/opengraph-image");
    expect(og("/level/react")).toBe("/react/opengraph-image");
    expect(og("/level/typescript")).toBe("/opengraph-image");
    expect(og("/mock")).toBe("/opengraph-image");
  });
});

describe("canonical origin", () => {
  it("is the domain the site is published under", () => {
    expect(CANONICAL_ORIGIN).toBe("https://groundwork.austincoders.com");
  });
});
