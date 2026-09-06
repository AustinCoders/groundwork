import { chapters } from "@/lib/content";

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
