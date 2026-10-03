import { topics } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";
import { onShelf } from "@/lib/topicShelf";

export function outlineTopicIds(): string[] {
  const stats = topicStats();
  return topics()
    .filter((t) => t.status === "ready" && (stats[t.id]?.written ?? 0) === 0)
    .map((t) => t.id);
}

export function pathTopicIds(): string[] {
  const stats = topicStats();
  return topics()
    .filter((t) => t.status === "ready" && onShelf(t.id) && t.levels && (stats[t.id]?.written ?? 0) > 0)
    .map((t) => t.id);
}
