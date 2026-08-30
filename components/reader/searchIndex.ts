import { chapters } from "@/lib/content";

/**
 * Full-text search index for one topic, served as a static JSON file and
 * fetched only when the reader first types in the search box — so chapter
 * bodies stay off the initial page load.
 */
export function buildSearchIndex(topicId: string) {
  return chapters(topicId).map((ch) => ({
    id: ch.id,
    text: `${ch.title} ${ch.short} ${ch.subtitle} ${String(ch.body || "").replace(/<[^>]*>/g, " ")}`
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim(),
  }));
}

export function searchIndexResponse(topicId: string): Response {
  return Response.json(buildSearchIndex(topicId));
}
