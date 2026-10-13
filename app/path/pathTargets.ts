import { levels, topics } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";

export function pathTargets(): Record<string, string[] | null> {
  const stats = topicStats();
  return Object.fromEntries(
    topics().map((t) => [t.id, t.levels && stats[t.id]?.written !== 0 ? levels(t.id).map((l) => l.id) : null])
  );
}
