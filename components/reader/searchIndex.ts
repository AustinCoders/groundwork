import { chapters } from "@/lib/content";

const ENTITIES: Record<string, string> = {
  nbsp: " ",
  lt: "<",
  gt: ">",
  quot: '"',
  apos: "'",
  "#39": "'",
  rarr: "→",
  larr: "←",
  mdash: "—",
  ndash: "–",
  hellip: "…",
  middot: "·",
  times: "×",
  amp: "&",
};

export function searchableText(parts: string[], body: string): string {
  const visible = body
    .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&(#39|[a-z]+);/g, (entity, name: string) => ENTITIES[name] ?? entity);
  return `${parts.join(" ")} ${visible}`.toLowerCase().replace(/\s+/g, " ").trim();
}

export function compactWords(text: string): string {
  const unique = [...new Set(text.split(" "))].sort((a, b) => b.length - a.length);
  const kept: string[] = [];
  let joined = "";
  for (const word of unique) {
    if (joined.indexOf(word) !== -1) continue;
    kept.push(word);
    joined += ` ${word}`;
  }
  return kept.join(" ");
}

export function buildSearchIndex(topicId: string) {
  return chapters(topicId).map((ch) => ({
    id: ch.id,
    text: compactWords(searchableText([ch.title, ch.short, ch.subtitle], String(ch.body || ""))),
  }));
}

export function searchIndexResponse(topicId: string): Response {
  return Response.json(buildSearchIndex(topicId));
}
