import { topics } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";

export function outlineTopicIds(): string[] {
  const stats = topicStats();
  return topics()
    .filter((t) => t.status === "ready" && (stats[t.id]?.written ?? 0) === 0)
    .map((t) => t.id);
}
