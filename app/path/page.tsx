import { Suspense } from "react";
import { levels, topics } from "@/lib/topics";
import { topicStats } from "@/lib/topicStats";
import { PathRedirect } from "./PathRedirect";

export default function PathPage() {
  const stats = topicStats();
  const targets = Object.fromEntries(
    topics().map((t) => [t.id, t.levels && stats[t.id]?.written !== 0 ? levels(t.id).map((l) => l.id) : null])
  );
  return (
    <Suspense fallback={null}>
      <PathRedirect targets={targets} />
    </Suspense>
  );
}
