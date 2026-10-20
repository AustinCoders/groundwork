import type { LldTopicId } from "./lld-types";

export const LLD_TOPICS: readonly { id: LldTopicId; name: string; blurb: string }[] = [
  { id: "booking", name: "Booking and reservations", blurb: "Slots, seats and rooms with clashes to avoid" },
  { id: "storage", name: "Caches and stores", blurb: "Key-value stores, eviction and file systems" },
  { id: "payments", name: "Wallets and payments", blurb: "Balances, transfers and splitting money" },
  { id: "games", name: "Games and state machines", blurb: "Rules, turns and machines that change state" },
  { id: "scheduling", name: "Schedulers and queues", blurb: "Jobs, timers and work that must run in order" },
  { id: "infra", name: "Libraries and infrastructure", blurb: "Loggers, limiters and pluggable components" },
  { id: "matching", name: "Matching engines", blurb: "Orders, riders and supply meeting demand" },
];

export const LLD_TOPIC_NAME: Readonly<Record<LldTopicId, string>> = Object.fromEntries(
  LLD_TOPICS.map((topic) => [topic.id, topic.name])
) as Record<LldTopicId, string>;
