import type { DesignPool } from "../../quiz-types";

export const pool: DesignPool = {
  questions: [
    {
      id: "mq-idle-consumers",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "estimate",
      section: "queue-vs-log-rabbitmq-and-kafka-are-not-the-same-shape",
      kind: "single",
      prompt:
        "<p>A Kafka topic has 24 partitions and is read by one classic consumer group. Lag is growing, so the team scales the group from 12 pods to 40 pods, each running a single consumer. How many consumers are now idle, with no partition to read?</p>",
      choices: [
        {
          id: "a",
          text: "None, because the broker spreads messages across all 40 consumers",
          why: "That is how a queue broker such as RabbitMQ or SQS behaves, where messages are load-balanced to consumers. In a classic consumer group each partition has exactly one owner, so extra consumers do not receive anything.",
        },
        {
          id: "b",
          text: "28, the number of pods that were just added",
          why: "Not all of the 28 added pods are idle. The 12 original pods already own 12 partitions, so 12 of the new pods pick up the other 12 partitions and only the rest have nothing to read.",
        },
        {
          id: "c",
          text: "16, the consumers beyond the 24 partitions",
          why: "A partition has one owner in a group, so at most 24 consumers can be busy at once. The other 40 − 24 = 16 sit idle, which is why partition count is the parallelism ceiling.",
        },
        {
          id: "d",
          text: "24, one idle consumer for every partition",
          why: "24 is the number of consumers that are busy, one per partition. The idle ones are the remainder after those 24 are assigned.",
        },
      ],
      answer: "c",
    },
    {
      id: "mq-workers-to-break-even",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "estimate",
      section: "backpressure-the-queue-is-a-shock-absorber-not-a-landfill",
      kind: "single",
      prompt:
        "<p>Messages arrive at a steady 3,000 per second. Each worker handles one message at a time and takes 50 ms per message. What is the smallest number of workers for which consumer lag stops growing (the break-even point, with no headroom)?</p>",
      choices: [
        {
          id: "a",
          text: "20 workers, the throughput of one worker",
          why: "20 messages per second is what a single worker can do (1,000 ms ÷ 50 ms). It is the capacity of one worker, not the number of workers needed to match 3,000 per second.",
        },
        {
          id: "b",
          text: "225 workers, including headroom to drain a backlog",
          why: "Headroom of about 1.5x is what you add on top to drain an existing backlog. The question asks for the break-even point, where arrival and processing rates just match.",
        },
        {
          id: "c",
          text: "60 workers, from dividing 3,000 by 50",
          why: "That divides a rate in messages per second by a time in milliseconds, so the units do not match. Convert first: 50 ms is 0.05 s, so one worker handles 20 messages per second.",
        },
        {
          id: "d",
          text: "150 workers",
          why: "One worker completes 1,000 ÷ 50 = 20 messages per second, so matching 3,000 per second needs 3,000 ÷ 20 = 150 workers. Fewer than that and arrivals outpace processing, so lag grows without bound.",
        },
      ],
      answer: "d",
    },
    {
      id: "mq-lost-receipts",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "diagnose",
      section: "delivery-semantics-done-properly",
      kind: "single",
      prompt:
        "<p>After each deploy, a handful of receipt emails are never sent and no error is logged. The consumer reads a message, commits its offset straight away, and then calls the email provider. Deploys kill pods in the middle of that call. Which diagnosis and fix fit?</p>",
      choices: [
        {
          id: "a",
          text: "It behaves as at-most-once, so a crash after the commit loses the message. Commit after the send, and make it idempotent.",
          why: "Committing before processing means a crash in between leaves the message marked as done and never processed. Moving the commit after the work gives at-least-once, so the send must tolerate being repeated, for example with a provider idempotency key.",
        },
        {
          id: "b",
          text: "It behaves as at-least-once: the broker redelivers messages after each deploy, and the email provider drops the duplicate sends.",
          why: "Redelivery is the opposite symptom: it follows from a crash after the work but before the commit. Here the commit comes first, so a crash after it means nothing is redelivered.",
        },
        {
          id: "c",
          text: "It is a poison message, so the consumer keeps failing on the same record until the deploy finally removes it from the topic.",
          why: "A poison message is retried repeatedly and holds up the records behind it. These messages vanish once, with no errors and no backlog behind them.",
        },
        {
          id: "d",
          text: "It is a gap in exactly-once delivery during rolling restarts, which a larger partition count would close for good.",
          why: "Exactly-once delivery does not exist across a network, and a partition count has no bearing on when the offset is committed. The loss comes from the order of commit and work.",
        },
      ],
      answer: "a",
    },
    {
      id: "mq-stuck-partition",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "diagnose",
      section: "retries-dead-letters-and-poison-messages",
      kind: "single",
      prompt:
        "<p>On a 12-partition topic, the lag of one partition grows steadily while the other 11 sit near zero. The logs show the same offset failing with a JSON parse error every few seconds, and the consumer retries that record indefinitely. What explains it, and what is the fix?</p>",
      choices: [
        {
          id: "a",
          text: "The group has too few consumers, so add more pods until that partition is served faster and the lag clears.",
          why: "Each partition has one owner in the group, so another pod cannot help with it. The consumer is already reading this partition; it is stuck on one record.",
        },
        {
          id: "b",
          text: "The topic has too few partitions, so increase the partition count to spread the load more evenly.",
          why: "Eleven partitions are healthy, so capacity is not the issue. Adding partitions would also re-map keys and risk reordering without unblocking the stuck record.",
        },
        {
          id: "c",
          text: "A poison message blocks the records behind it. Mark it terminal, send it to a DLQ, commit past it, and alert.",
          why: "A record that fails identically on every attempt blocks the partition because the consumer will not move on. A malformed payload will not succeed on retry, so it goes to a dead-letter queue straight away, the offset moves on, and someone is alerted so it can be replayed after a fix.",
        },
        {
          id: "d",
          text: "Retention is too short, so the broker already deleted the record the consumer was about to read next.",
          why: "The consumer is clearly able to fetch the record, since it fails while parsing it. A record the broker had deleted could not be fetched at all, so this is not a retention problem.",
        },
      ],
      answer: "c",
    },
    {
      id: "mq-orders-without-events",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "tradeoff",
      section: "the-outbox-pattern-fixing-the-dual-write-problem",
      kind: "single",
      prompt:
        "<p>An order service inserts the order row, commits, and then publishes an event to the broker. During a 2-minute broker outage, 400 orders were saved but their events were never sent, so billing and search never heard of them. Events must never be lost, and a few seconds of extra publish delay is acceptable. Which fix fits?</p>",
      choices: [
        {
          id: "a",
          text: "Publish the event first and commit the order afterwards, so that the event can never be missing from the broker.",
          why: "Swapping the order only moves the failure. If the process dies after publishing and before the commit, the system announces an order that does not exist.",
        },
        {
          id: "b",
          text: "Write the event to an outbox table in the same transaction as the order, and have a relay publish it.",
          why: "One transaction commits both rows or neither, so an order cannot exist without its event. The relay publishes at least once and retries through an outage, and the event ID lets consumers de-duplicate. The cost is a write per event and a little latency.",
        },
        {
          id: "c",
          text: "Wrap the publish call in an in-process retry loop with exponential backoff that keeps running for up to ten minutes.",
          why: "A retry loop lives in the process, so a deploy or crash during the outage loses the pending events. It also keeps the request path tied to the broker's health.",
        },
        {
          id: "d",
          text: "Use a two-phase commit that spans the database and the broker so that both of the writes are atomic together.",
          why: "Two-phase commit can block when its coordinator fails, and few teams run XA across a database and a broker at scale. The outbox gets the same guarantee with one local transaction.",
        },
      ],
      answer: "b",
    },
    {
      id: "mq-replay-for-new-consumer",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "tradeoff",
      section: "queue-vs-log-rabbitmq-and-kafka-are-not-the-same-shape",
      kind: "single",
      prompt:
        '<p>Billing and search already consume the same "order placed" events independently. A new analytics service launches next quarter and must read the previous 7 days of those events and then keep up live. Which broker shape fits that requirement?</p>',
      choices: [
        {
          id: "a",
          text: "A classic queue where every message is deleted as soon as one consumer acknowledges it",
          why: "Once the existing consumers have acknowledged a message it is gone, so the new service has nothing to read for the past 7 days unless someone kept a separate copy.",
        },
        {
          id: "b",
          text: "A partitioned log with at least 7 days of retention and an offset per consumer group",
          why: "Records stay until retention expires and every group has its own position, so billing and search keep their places while the new group starts from the oldest retained record, then catches up.",
        },
        {
          id: "c",
          text: "One shared queue that billing, search and analytics all pull from at the same time as competing consumers",
          why: "Consumers on one queue compete for messages, so each event reaches only one of the three services. That breaks billing and search as well as failing to give analytics any history.",
        },
        {
          id: "d",
          text: "A read-through cache in front of the orders database that holds the last 7 days of orders",
          why: "A cache makes reads cheaper but does not deliver events to consumers or track their progress. This is a messaging requirement, not a read-latency one.",
        },
      ],
      answer: "b",
    },
    {
      id: "mq-idempotent-consumer-measures",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "concept",
      section: "delivery-semantics-done-properly",
      kind: "multi",
      prompt:
        "<p>A consumer reads from a broker with at-least-once delivery, so any message may arrive twice. Select every measure that makes processing safe to repeat.</p>",
      choices: [
        {
          id: "a",
          text: "Insert the event ID into a processed-events table in the same transaction as the business write, ignoring conflicts.",
          why: "A second delivery hits the unique constraint and does nothing, and because both writes share a transaction the effect and the record of it cannot diverge.",
        },
        {
          id: "b",
          text: "Prefer absolute writes such as setting a status to shipped over deltas such as adding 10 to a balance.",
          why: "Repeating an absolute write straight away leaves the same state, while repeating a delta applies it twice. Choosing the schema this way removes many duplicate bugs, though a replay of an older event after a newer one can still regress state.",
        },
        {
          id: "c",
          text: "Send the external provider an idempotency key derived from the event ID, which it de-duplicates on.",
          why: "Once the side effect leaves your system, the provider is the only party that can recognise a repeat. A stable key lets it return the original result instead of charging or sending twice.",
        },
        {
          id: "d",
          text: "Commit the offset before doing the work, so a message can never be seen a second time.",
          why: "This swaps duplicates for loss: a crash after the commit drops the message for good. It is at-most-once, not a way to make repeats safe.",
        },
        {
          id: "e",
          text: "Turn on the broker's exactly-once mode and assume it covers calls to an outside email API.",
          why: "Kafka's exactly-once guarantee holds inside Kafka. For other destination systems it needs their cooperation, so a call to an external API still degrades to at-least-once.",
        },
      ],
      answers: ["a", "b", "c"],
    },
    {
      id: "mq-outbox-path-in-order",
      chapter: "sysdes-message-queues-async",
      level: "intermediate",
      skill: "sequence",
      section: "the-outbox-pattern-fixing-the-dual-write-problem",
      kind: "order",
      prompt:
        "<p>An order is placed and an event must reach a downstream consumer, using an outbox on the producer side and a processed-events table on the consumer side. The consumer commits its offset only after its work succeeds. Put the steps in the order they happen.</p>",
      items: [
        { id: "commit", text: "The order service commits the order row and the outbox row in one transaction" },
        { id: "relay", text: "A relay reads the new outbox row and publishes the event to the broker" },
        {
          id: "effect",
          text: "The consumer inserts the event ID into processed_events and writes the effect in one transaction",
        },
        { id: "offset", text: "The consumer commits its offset past the event" },
      ],
      why: "The business row and the event are written together first, so neither can exist without the other. Only then can the relay publish, and it may re-send after a crash. The consumer records the event ID and the effect in one transaction, and commits the offset last, so a crash before the commit just causes a redelivery that the processed-events table turns into a no-op.",
    },
  ],
};
