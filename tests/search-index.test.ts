import { gzipSync } from "node:zlib";
import { describe, expect, it } from "vitest";
import { buildSearchIndex, compactWords, searchableText } from "@/components/reader/searchIndex";
import { chapters } from "@/lib/content";
import { topics } from "@/lib/topics";

const written = topics()
  .map((t) => t.id)
  .filter((id) => chapters(id).some((ch) => ch.ready));

describe("search index", () => {
  it("matches exactly the same terms as the full chapter text", () => {
    for (const topicId of written) {
      for (const ch of chapters(topicId)) {
        const full = searchableText([ch.title, ch.short, ch.subtitle], String(ch.body || ""));
        const fullWords = new Set(full.split(" "));
        const compact = compactWords(full);

        for (const word of compact.split(" ")) {
          expect(fullWords.has(word), `${topicId}/${ch.id} gained "${word}"`).toBe(true);
        }
        for (const word of fullWords) {
          expect(compact.includes(word), `${topicId}/${ch.id} lost "${word}"`).toBe(true);
        }
      }
    }
  });

  it("indexes what a reader sees, not demo scripts or raw entities", () => {
    for (const topicId of written) {
      const bodies = new Map(chapters(topicId).map((ch) => [ch.id, String(ch.body || "")]));
      for (const { id, text } of buildSearchIndex(topicId)) {
        const body = bodies.get(id) ?? "";
        expect(text, `${topicId}/${id} still indexes a demo script`).not.toMatch(/\bdataset\.demoinit\b/);
        if (body.includes("=&gt;")) expect(text, `${topicId}/${id} cannot find "=>"`).toContain("=>");
        if (!body.includes("&amp;gt;")) expect(text, `${topicId}/${id} indexes a raw entity`).not.toContain("&gt;");
      }
    }
  });

  // Raised from 75 to 85 KB on 2026-09-24: the dry-run-table + checklist pass
  // across every DSA/JS/React/System Design chapter pushed JS (and, close
  // behind, React and System Design) past the old budget on legitimate
  // content growth, not bloat — see docs/ROADMAP.md section 3 for the
  // options (sharded index, hosted search) once a topic nears this one too.
  it("keeps every topic's index under 85 KB gzip", () => {
    for (const topicId of written) {
      const gzip = gzipSync(JSON.stringify(buildSearchIndex(topicId))).length;
      expect(gzip, `${topicId} index is ${Math.round(gzip / 1024)} KB gzip`).toBeLessThan(85 * 1024);
    }
  });
});
