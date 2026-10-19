import type { DesignPool } from "@/content/quiz-types";

const pools = new Map<string, () => Promise<{ pool: DesignPool }>>([
  ["sysdes-interview-mental-model", () => import("@/content/system-design/quiz/sysdes-interview-mental-model")],
  ["sysdes-client-server-basics", () => import("@/content/system-design/quiz/sysdes-client-server-basics")],
  [
    "sysdes-scaling-vertical-horizontal",
    () => import("@/content/system-design/quiz/sysdes-scaling-vertical-horizontal"),
  ],
  ["sysdes-databases-in-design", () => import("@/content/system-design/quiz/sysdes-databases-in-design")],
  ["sysdes-caching-fundamentals", () => import("@/content/system-design/quiz/sysdes-caching-fundamentals")],
  ["sysdes-apis-communication", () => import("@/content/system-design/quiz/sysdes-apis-communication")],
  ["sysdes-walkthrough-simple", () => import("@/content/system-design/quiz/sysdes-walkthrough-simple")],
  ["sysdes-load-balancing-depth", () => import("@/content/system-design/quiz/sysdes-load-balancing-depth")],
  ["sysdes-cdns", () => import("@/content/system-design/quiz/sysdes-cdns")],
  ["sysdes-message-queues-async", () => import("@/content/system-design/quiz/sysdes-message-queues-async")],
  ["sysdes-consistency-models", () => import("@/content/system-design/quiz/sysdes-consistency-models")],
  ["sysdes-rate-limiting", () => import("@/content/system-design/quiz/sysdes-rate-limiting")],
  ["sysdes-availability-design", () => import("@/content/system-design/quiz/sysdes-availability-design")],
  ["sysdes-storage-systems", () => import("@/content/system-design/quiz/sysdes-storage-systems")],
  ["sysdes-search-systems", () => import("@/content/system-design/quiz/sysdes-search-systems")],
  ["sysdes-walkthrough-medium", () => import("@/content/system-design/quiz/sysdes-walkthrough-medium")],
  ["sysdes-cap-theorem-depth", () => import("@/content/system-design/quiz/sysdes-cap-theorem-depth")],
  ["sysdes-sharding-partitioning", () => import("@/content/system-design/quiz/sysdes-sharding-partitioning")],
  ["sysdes-distributed-consensus", () => import("@/content/system-design/quiz/sysdes-distributed-consensus")],
  ["sysdes-fault-tolerance", () => import("@/content/system-design/quiz/sysdes-fault-tolerance")],
  ["sysdes-observability-scale", () => import("@/content/system-design/quiz/sysdes-observability-scale")],
  ["sysdes-capacity-estimation", () => import("@/content/system-design/quiz/sysdes-capacity-estimation")],
  ["sysdes-case-studies", () => import("@/content/system-design/quiz/sysdes-case-studies")],
  ["sysdes-tradeoff-thinking", () => import("@/content/system-design/quiz/sysdes-tradeoff-thinking")],
  ["sysdes-replication", () => import("@/content/system-design/quiz/sysdes-replication")],
  ["sysdes-transactions-isolation", () => import("@/content/system-design/quiz/sysdes-transactions-isolation")],
  ["sysdes-storage-engines", () => import("@/content/system-design/quiz/sysdes-storage-engines")],
  ["sysdes-time-ordering-ids", () => import("@/content/system-design/quiz/sysdes-time-ordering-ids")],
  ["sysdes-batch-stream-processing", () => import("@/content/system-design/quiz/sysdes-batch-stream-processing")],
  ["sysdes-walkthrough-kv-store", () => import("@/content/system-design/quiz/sysdes-walkthrough-kv-store")],
  ["sysdes-walkthrough-notifications", () => import("@/content/system-design/quiz/sysdes-walkthrough-notifications")],
  ["sysdes-walkthrough-crawler", () => import("@/content/system-design/quiz/sysdes-walkthrough-crawler")],
  ["sysdes-walkthrough-payments", () => import("@/content/system-design/quiz/sysdes-walkthrough-payments")],
  ["sysdes-microservices-discovery", () => import("@/content/system-design/quiz/sysdes-microservices-discovery")],
  ["sysdes-security-basics", () => import("@/content/system-design/quiz/sysdes-security-basics")],
  ["sysdes-release-safety", () => import("@/content/system-design/quiz/sysdes-release-safety")],
]);

export function designPoolChapterIds(): string[] {
  return [...pools.keys()];
}

export async function loadDesignPool(chapterId: string): Promise<DesignPool | null> {
  const load = pools.get(chapterId);
  return load ? (await load()).pool : null;
}
