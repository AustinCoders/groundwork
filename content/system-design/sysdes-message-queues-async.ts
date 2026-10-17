import type { Chapter } from "../types";

export const sysdesMessageQueuesAsync: Chapter = {
  id: "sysdes-message-queues-async",
  num: "I3",
  title: "Message queues & async processing",
  short: "Message queues & async",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "The request path should only do the work the user is actually waiting for — everything else goes on a queue and gets retried.",
  body: `<h3>Decoupling: what you actually buy</h3>
<p>
  Synchronous calls couple two things that have no business being coupled:
  the <em>latency</em> a user experiences and the <em>capacity</em> of the
  slowest downstream service. Put a durable buffer between producer and
  consumer and you break that link. Four distinct wins come out of it, and
  naming them separately is what makes you sound like you have run this in
  production.
</p>
<ul>
  <li><b>Spike absorption.</b> A queue turns a 20x traffic burst into a growing backlog instead of a cascade of timeouts. Your workers keep running at their sustainable rate; the queue eats the difference. Latency degrades gracefully rather than the system falling over.</li>
  <li><b>Latency shedding.</b> Image transcoding takes 4 s; sending an email takes 800 ms; reindexing takes 300 ms. None of it needs to happen before the HTTP response. Enqueue in ~2 ms and return 202.</li>
  <li><b>Retries with durability.</b> If the email provider is down, an in-process retry loop dies with the pod. A queued message survives the deploy, the crash and the region failover.</li>
  <li><b>Fan-out.</b> One "order placed" event feeds billing, search indexing, the recommendation model, the fraud pipeline and the data warehouse — and adding a seventh consumer needs no change to the producer.</li>
</ul>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A synchronous API doing thumbnailing, email and indexing inline for a five second response, compared with an asynchronous API that enqueues in two milliseconds and returns immediately while workers do the slow work">
    <g class="rough">
      <path class="lnr" d="M126,52 L158,52" />
      <path class="lnr" d="M282,52 L314,52" />
      <path class="lnr" d="M436,52 L468,52" />
      <rect class="boxr" x="16"  y="30" width="110" height="44" rx="6" />
      <rect class="box"  x="158" y="30" width="124" height="44" rx="6" />
      <rect class="box"  x="314" y="30" width="122" height="44" rx="6" />
      <rect class="box"  x="468" y="30" width="124" height="44" rx="6" />
    </g>
    <text class="sm" x="71"  y="48" text-anchor="middle">POST /upload</text>
    <text class="sm rd" x="71" y="64" text-anchor="middle">synchronous</text>
    <text class="sm" x="220" y="57" text-anchor="middle">thumbnail 4 s</text>
    <text class="sm" x="375" y="57" text-anchor="middle">email 800 ms</text>
    <text class="sm" x="530" y="57" text-anchor="middle">index 300 ms</text>
    <text class="sm rd" x="16" y="98">user waits 5.1 s; one slow provider makes every upload time out</text>
    <g class="rough">
      <path class="lng" d="M126,168 L166,168" />
      <path class="lng" d="M290,168 L330,168" />
      <path class="ln"  d="M454,168 L494,150" />
      <path class="ln"  d="M454,176 L494,196" />
      <rect class="boxg" x="16"  y="146" width="110" height="44" rx="6" />
      <rect class="boxy" x="166" y="146" width="124" height="44" rx="6" />
      <rect class="box"  x="330" y="146" width="124" height="44" rx="6" />
      <rect class="box"  x="494" y="128" width="128" height="38" rx="6" />
      <rect class="box"  x="494" y="178" width="128" height="38" rx="6" />
    </g>
    <text class="sm" x="71"  y="164" text-anchor="middle">POST /upload</text>
    <text class="sm gr" x="71" y="180" text-anchor="middle">enqueue, 2 ms</text>
    <text class="sm" x="228" y="173" text-anchor="middle">durable queue</text>
    <text class="sm" x="392" y="173" text-anchor="middle">worker pool</text>
    <text class="sm" x="558" y="152" text-anchor="middle">thumbnailer</text>
    <text class="sm" x="558" y="202" text-anchor="middle">mailer</text>
    <text class="sm gr" x="16" y="238">202 Accepted in 12 ms; a dead mail provider grows a backlog instead of an outage</text>
  </svg>
  <figcaption>The queue does not make the work faster. It makes the work <em>not the user's problem</em>, and it makes failure recoverable instead of lost.</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ Async changes the product, not just the architecture</span>
  The moment you return 202 you owe the user a way to observe completion:
  a status endpoint, a websocket push, an email, or an optimistic UI that
  reconciles later. Candidates who move work off the request path without
  saying how the client learns it finished get marked down — the
  interviewer is checking whether you understand you just introduced a
  distributed state machine into the product.
</div>

<h3>Queue vs log: RabbitMQ and Kafka are not the same shape</h3>
<p>
  A <b>queue broker</b> (RabbitMQ, SQS, ActiveMQ) tracks per-message state.
  A message is delivered, acknowledged, and deleted. The broker owns the
  bookkeeping, which buys you per-message acking, arbitrary redelivery
  delays and routing topologies — at the cost of holding mutable state per
  message.
</p>
<p>
  A <b>log</b> (Kafka, Pulsar, Kinesis, Redpanda) is an append-only file
  per partition. Consumers hold an <b>offset</b> — a number — and the
  broker deletes nothing until the retention window expires. Reads and writes
  are mostly sequential and lean on the operating system's page cache, which is
  why a single broker can sustain hundreds of MB/s. Because messages aren't deleted on read, you can rewind the offset
  and replay a week of history into a new consumer, which is the
  capability classic queues lack. The two shapes are converging: RabbitMQ
  Streams add a replicated, non-destructive log (with offset and timestamp
  replay) inside RabbitMQ, and Kafka 4.2 made share groups ("queues for
  Kafka", KIP-932) production-ready, giving per-record acknowledgement on top of
  a log. Pick by the semantics you need, not by the product name.
</p>

<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="A producer hashing a key into three partitions of a topic, with a consumer group of four where consumers A, B and C each own one partition and consumer D sits idle because there are no partitions left">
    <g class="rough">
      <path class="ln" d="M124,148 L170,66" />
      <path class="ln" d="M124,152 L170,146" />
      <path class="ln" d="M124,158 L170,226" />
      <path class="lng" d="M330,66 L440,66" />
      <path class="lng" d="M330,146 L440,146" />
      <path class="lng" d="M330,226 L440,226" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="130" width="108" height="46" rx="6" />
      <rect class="boxy" x="170" y="44"  width="160" height="44" rx="6" />
      <rect class="boxy" x="170" y="124" width="160" height="44" rx="6" />
      <rect class="boxy" x="170" y="204" width="160" height="44" rx="6" />
      <rect class="boxg" x="440" y="44"  width="164" height="44" rx="6" />
      <rect class="boxg" x="440" y="124" width="164" height="44" rx="6" />
      <rect class="boxg" x="440" y="204" width="164" height="44" rx="6" />
      <rect class="boxr" x="440" y="262" width="164" height="46" rx="6" />
    </g>
    <text class="sm" x="70"  y="150" text-anchor="middle">producer</text>
    <text class="sm" x="70"  y="166" text-anchor="middle">key = userId</text>
    <text class="sm" x="132" y="112">hash % 3</text>
    <text class="sm" x="250" y="72" text-anchor="middle">partition 0</text>
    <text class="sm" x="250" y="152" text-anchor="middle">partition 1</text>
    <text class="sm" x="250" y="232" text-anchor="middle">partition 2</text>
    <text class="sm" x="522" y="64"  text-anchor="middle">consumer A</text>
    <text class="sm" x="522" y="80"  text-anchor="middle">owns P0</text>
    <text class="sm" x="522" y="144" text-anchor="middle">consumer B</text>
    <text class="sm" x="522" y="160" text-anchor="middle">owns P1</text>
    <text class="sm" x="522" y="224" text-anchor="middle">consumer C</text>
    <text class="sm" x="522" y="240" text-anchor="middle">owns P2</text>
    <text class="sm rd" x="522" y="282" text-anchor="middle">consumer D</text>
    <text class="sm rd" x="522" y="298" text-anchor="middle">idle — no partition</text>
    <text class="lbl" x="16" y="270" style="font-size:14px">one partition has exactly one owner in a group,</text>
    <text class="lbl" x="16" y="292" style="font-size:14px">so partition count is your parallelism ceiling</text>
  </svg>
  <figcaption>Consumer D is the whole lesson: in a classic Kafka consumer group you scale by adding partitions, not by adding pods, because a fourth consumer on three partitions has nothing to read. (Assignors balance partitions to within one of each other, so with three consumers each would own one.) Pick the partition count for the parallelism you'll want in a year, within the cost limits described below.</figcaption>
</figure>

<table>
  <tr><th>&nbsp;</th><th>Queue broker (RabbitMQ queues, SQS)</th><th>Log (Kafka, Pulsar, RabbitMQ Streams)</th></tr>
  <tr><td>Unit of progress</td><td>Per-message ack / nack</td><td>Per-partition offset commit</td></tr>
  <tr><td>After a message is consumed</td><td>Deleted</td><td>Still there until retention expires (hours to forever)</td></tr>
  <tr><td>Replay</td><td>Not in a classic or quorum queue — you must have kept a copy yourself (RabbitMQ Streams are the log-shaped exception)</td><td>Seek the offset backwards (or to a timestamp); a brand-new consumer can read all history</td></tr>
  <tr><td>Ordering</td><td>Per-queue, and lost the moment you add a second consumer</td><td>Total order <em>within a partition</em>; none across partitions</td></tr>
  <tr><td>Parallelism</td><td>Add consumers freely — the broker load-balances messages</td><td>Capped at partition count per consumer group. Exceptions that trade away per-key order: Kafka 4.2 share groups and Pulsar shared subscriptions allow more consumers than partitions</td></tr>
  <tr><td>Throughput, single node</td><td>Tens of thousands of msg/s per node is a common planning figure for RabbitMQ, far lower with persistence, confirms and rich routing; benchmark your own</td><td>Hundreds of MB/s; ~10 MB/s per partition is a comfortable planning figure</td></tr>
  <tr><td>Routing</td><td>Rich: topic/fanout/header exchanges, per-message TTL, delayed delivery</td><td>Deliberately dumb: topic + partition. Routing is the consumer's job</td></tr>
  <tr><td>Reach for this when</td><td>Task/job semantics — "someone do this one thing", varied per-message delays, complex routing, modest volume</td><td>Event-stream semantics — many independent consumers of the same events, replay for backfills or new services, ordered per-entity change streams, high volume</td></tr>
</table>
<p class="sub">
  A cheap tell that you've thought about it: "SQS standard gives me
  nearly unlimited throughput but no ordering. SQS FIFO orders messages within
  a message group; by default each queue partition is limited to 300 API calls
  per second per action (3,000 messages/s with 10-message batches), and high
  throughput mode raises that to as much as 70,000 TPS (700,000 messages/s
  batched) in us-east-1, us-west-2 and eu-west-1, scaling with the number of
  distinct message groups. So I'd use a high-cardinality group id such as the
  user id, never one global group." Named limits beat adjectives, and the
  limits are per queue partition, not per group (check the current quota page).
</p>

<h3>Delivery semantics, done properly</h3>
<p>
  Every distributed queue makes the same unavoidable choice: when the
  consumer processes a message and then dies before acknowledging it, was
  the message delivered? You can only pick which side of that ambiguity
  you fail on.
</p>
<table>
  <tr><th>Semantic</th><th>Mechanism</th><th>Failure mode</th><th>Use it for</th></tr>
  <tr><td>At-most-once</td><td>Ack (or commit the offset) <em>before</em> processing</td><td>Crash after ack, before work → message silently lost</td><td>High-volume telemetry, click logs, metrics — where one lost sample is genuinely irrelevant and throughput is everything</td></tr>
  <tr><td>At-least-once</td><td>Ack <em>after</em> processing succeeds</td><td>Crash after work, before ack → message redelivered and processed twice</td><td>Essentially everything. This is the default in Kafka, SQS and RabbitMQ, and the sane baseline</td></tr>
  <tr><td>"Exactly-once"</td><td>At-least-once delivery + an idempotent consumer, or a transaction spanning input and output</td><td>Only holds inside the transactional boundary — the moment you call an external API it degrades to at-least-once</td><td>Payments, ledgers, anything where a duplicate is a customer-visible error</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">Exactly-once delivery does not exist; exactly-once <em>effect</em> does</span>
  Two processes, an unreliable network, and no way to distinguish "your
  ack was lost" from "you never received it" — the sender must either
  resend (risking a duplicate) or not (risking a loss). This is a proof,
  not an engineering limitation. What you can build is an
  <b>at-least-once pipeline whose side effects are idempotent</b>, so
  processing a message twice produces the same state as processing it
  once. Kafka's exactly-once mode is exactly this, mechanised: an
  idempotent producer that de-duplicates by sequence number, plus a
  transaction that commits output records and input offsets atomically —
  and it only holds while you stay inside Kafka.
</div>
<p>
  So the real engineering question is never "which semantic do I pick?"
  It is <b>"what makes my consumer idempotent?"</b> Three answers, in
  descending order of how often they're the right one:
</p>
<ul>
  <li><b>A natural idempotency key.</b> The message carries a stable ID (order ID, event ID). The consumer writes <code>INSERT ... ON CONFLICT DO NOTHING</code> into a processed-events table inside the same transaction as its business write. Second delivery hits the conflict and does nothing. Cheap, obvious, correct.</li>
  <li><b>Naturally idempotent operations.</b> <code>SET status = 'shipped'</code> is safe to repeat; <code>balance = balance + 10</code> is not. Prefer absolute writes over deltas when you get to choose the schema — this single habit removes most duplicate-processing bugs before they exist.</li>
  <li><b>Idempotency tokens at the boundary.</b> When the side effect leaves your system (Stripe charge, email send), pass a client-generated key that the provider de-duplicates on. Stripe's <code>Idempotency-Key</code> exists for precisely this scenario (the header is being standardised as the IETF draft <code>draft-ietf-httpapi-idempotency-key-header</code>; it is not yet an RFC).</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll run at-least-once and
  make the consumer idempotent, because exactly-once delivery isn't
  achievable across a network — it's at-least-once plus de-duplication. I'll
  put a unique event ID on every message and have the consumer insert it
  into a processed-events table in the same transaction as the business
  write, so a redelivery is a no-op rather than a double charge."
</div>

<h3>Retries, dead letters and poison messages</h3>
<p>
  At-least-once means redelivery, and redelivery means you need a policy
  for messages that will <em>never</em> succeed. A <b>poison message</b> —
  malformed payload, a referenced row that was deleted, a bug that only
  triggers on one record — will otherwise be retried forever, and in a
  Kafka partition it blocks every message behind it. That is head-of-line
  blocking, and it is how one bad record stops a pipeline for an entire
  key range.
</p>
<ul>
  <li><b>Bound the retries.</b> 3-5 attempts with exponential backoff and jitter (see the rate-limiting chapter — the same backoff maths applies). Unbounded retry against a struggling downstream is a self-inflicted DDoS, and synchronised retries are worse than no retries.</li>
  <li><b>Distinguish retryable from terminal.</b> A 503 or a connection reset deserves a retry. A 400, a schema violation or a foreign-key error will fail identically at attempt 50 — route it straight to the DLQ and skip the backoff ladder entirely.</li>
  <li><b>Dead-letter queue.</b> After the budget is exhausted, move the message — with the original payload, the error, the attempt count and a trace ID — to a DLQ. Then <em>alert on DLQ depth</em>. An unmonitored DLQ is a data-loss mechanism with extra steps; the DLQ's value is entirely in someone looking at it.</li>
  <li><b>Make the DLQ replayable.</b> Fix the bug, ship it, drain the DLQ back into the main queue. If replay requires a bespoke script written under incident pressure, you don't have a DLQ, you have a graveyard.</li>
  <li><b>In Kafka, sidestep head-of-line blocking</b> by publishing the failure to a retry topic and committing the offset, so the partition keeps moving. You trade strict ordering for liveness, deliberately.</li>
</ul>

<h3>Durability and the other knobs worth naming</h3>
<p>
  A queue is only as durable as its replication settings. For Kafka, the usual
  production shape is replication factor 3, producers on <code>acks=all</code>
  and <code>min.insync.replicas=2</code>: a write is acknowledged once the
  in-sync replicas have it, and the partition refuses writes rather than run
  on a single copy, trading availability for durability. Kafka guarantees a
  committed message survives as long as one in-sync replica stays alive. Other
  features that come up: <b>log compaction</b> (keep at least the latest record
  per key, with tombstones for deletes, which is how a topic becomes a table
  changelog); <b>visibility timeout</b> in SQS (a received message is hidden
  for 30 seconds by default, up to 12 hours; if the consumer does not delete it
  in time it reappears, which is how at-least-once redelivery works there);
  <b>delay queues</b> (SQS message timers up to 15 minutes); and
  <b>consumer prefetch</b> in RabbitMQ (cap the unacknowledged messages per
  consumer so one slow consumer does not hoard work). For long-running
  multi-step work across services, the pattern on top of all this is a
  <b>saga</b>: a sequence of local transactions with compensating actions,
  driven by events.
</p>

<h3>Backpressure: the queue is a shock absorber, not a landfill</h3>
<p>
  A queue converts an overload into a backlog, which is only progress if
  the backlog eventually drains. The number to watch is <b>consumer lag</b>
  (messages behind, or seconds behind) and its <em>derivative</em>: if
  arrival rate exceeds processing rate at all, lag grows without bound and
  you have an outage on a delay timer.
</p>
<ul>
  <li><b>Do the arithmetic out loud.</b> 5,000 msg/s arriving, 40 ms per message per worker → 25 msg/s per worker → 200 workers to break even, and you want ~1.5x headroom to drain a backlog rather than merely hold it. That is the sizing answer an interviewer wants.</li>
  <li><b>Autoscale on lag, not CPU.</b> Consumer CPU is often near-idle while blocked on a downstream call; lag is the signal that actually tracks user harm. In Kafka, remember the partition ceiling — scaling to 300 pods against 50 partitions leaves 250 idle.</li>
  <li><b>Push backpressure upstream when the queue is unbounded in practice.</b> Reject or rate-limit at the producer, or shed low-priority work. A 10-hour backlog of stale notifications is worse than dropping them: you'll deliver yesterday's alerts tomorrow.</li>
  <li><b>Separate queues by priority and by latency budget.</b> One shared queue means a 4-hour bulk-import backlog delays password-reset emails. Different SLOs deserve different queues — this is the cheapest reliability decision in the whole design.</li>
</ul>

<h3>Ordering: per-key is almost always enough</h3>
<p>
  Global total ordering costs you all parallelism — it means one partition,
  one consumer, one thread. Almost no product needs it. What products
  actually need is <b>per-entity ordering</b>: user 42's profile updates
  must apply in order relative to <em>each other</em>; they have no
  meaningful relationship to user 91's.
</p>
<p>
  So partition by the entity key. <code>hash(userId) % partitions</code>
  puts every event for a user in one partition, which has one owner in the
  consumer group, which processes it in offset order. You get ordering
  where it matters and full parallelism across keys — this is the same
  insight as sharding by tenant, applied to a stream.
</p>
<div class="warn">
  <span class="ttl">⚠ Concurrency inside a consumer silently discards the ordering you just paid for</span>
  You partitioned by <code>userId</code>, then the consumer hands each
  message to a thread pool or fires off un-awaited async calls. Ordering
  is gone — the broker's guarantee ends at delivery. If you need
  intra-consumer parallelism, shard the work by the same key inside the
  consumer (key-affine worker threads), never round-robin. The related
  trap: adding partitions later re-maps <code>hash(key) % N</code>, so a
  key moves partitions and in-flight events for that key can be reordered
  across the resize. So leave headroom up front, but not unlimited: each
  partition adds open files, replication and recovery work on the brokers, and
  consumer-group rebalance time, so pick a number for the parallelism you
  expect in a year or two (a planning judgement, with some headroom), not the
  biggest number you can configure.
</div>

<h3>The outbox pattern: fixing the dual-write problem</h3>
<p>
  Here is a bug that survives every code review because it looks correct:
</p>
<pre><code>await db.orders.insert(order);        <span class="c">// 1. commits</span>
await kafka.send("order.created", e); <span class="c">// 2. broker unreachable → throws</span></code></pre>
<p>
  The order exists and nobody downstream will ever hear about it. Swapping
  the order just moves the failure: publish first and crash before the
  commit, and you've announced an order that doesn't exist. There is no
  ordering of two independent systems that is safe, because you cannot
  commit to a database and a broker atomically — that is the
  <b>dual-write problem</b>, and 2PC is not a real answer at this scale
  (it blocks on coordinator failure; XA transactions exist in some classic brokers such as IBM MQ and ActiveMQ, but few teams run them at scale).
</p>
<p>
  The fix is to make it a <em>single</em> write. Insert the event into an
  <code>outbox</code> table in the same transaction as the business row.
  Now either both exist or neither does. A separate relay reads that table and publishes to
  the broker. There are two kinds. A <b>polling relay</b> queries the table and
  marks rows sent (or remembers a high-water mark). A <b>log-based relay</b>
  such as Debezium tails the write-ahead log and sees each insert; its outbox
  router treats the table as insert-only (updates are not allowed), so there is
  no sent flag and you simply delete or expire old rows.
</p>

<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="An application writing an order row and an outbox row in one database transaction, with a separate relay process reading the outbox table and publishing to Kafka, marking rows as sent">
    <g class="rough">
      <path class="lng" d="M126,124 L172,124" />
      <path class="ln"  d="M336,124 L392,124" />
      <path class="lng" d="M512,124 L546,124" />
      <path class="ln dash" d="M392,150 L336,150" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="102" width="110" height="46" rx="6" />
      <rect class="boxy" x="172" y="60"  width="164" height="130" rx="6" />
      <rect class="box"  x="188" y="80"  width="132" height="40" rx="4" />
      <rect class="boxg" x="188" y="132" width="132" height="40" rx="4" />
      <rect class="box"  x="392" y="102" width="120" height="46" rx="6" />
      <rect class="boxg" x="546" y="102" width="78"  height="46" rx="6" />
    </g>
    <text class="sm" x="71"  y="122" text-anchor="middle">order service</text>
    <text class="sm" x="71"  y="138" text-anchor="middle">one txn</text>
    <text class="sm" x="254" y="105" text-anchor="middle">orders</text>
    <text class="sm" x="254" y="157" text-anchor="middle">outbox</text>
    <text class="sm" x="254" y="48"  text-anchor="middle">single ACID transaction</text>
    <text class="sm" x="452" y="120" text-anchor="middle">relay / CDC</text>
    <text class="sm" x="452" y="136" text-anchor="middle">(Debezium)</text>
    <text class="sm" x="585" y="128" text-anchor="middle">Kafka</text>
    <text class="sm" x="364" y="166" text-anchor="middle">mark sent (polling only)</text>
    <text class="lbl" x="16" y="222" style="font-size:14px">Both rows commit or neither does — the impossible state</text>
    <text class="lbl" x="16" y="244" style="font-size:14px">"order exists, event lost" can no longer occur.</text>
  </svg>
  <figcaption>The relay may crash mid-publish and re-send, so the outbox is at-least-once by design — which is fine, because you already made the consumer idempotent.</figcaption>
</figure>

<p class="sub">
  Cost and caveats, stated plainly: the outbox adds a write per event and
  a few hundred milliseconds to a few seconds of publish latency (poll
  interval; CDC is closer to tens of ms). You must prune old rows or the
  table becomes your biggest one. A polling relay that tracks the highest
  auto-increment id it has seen can also skip a row: id 7 may commit after id 8
  because its transaction was long-running, so poll with a safety lag or use a
  log-based relay. And the relay gives you at-least-once,
  never exactly-once — the event ID in the outbox row <em>is</em> the
  consumer's de-duplication key, which is why these two patterns are
  always taught together. The mirror-image pattern on the consumer side is
  the <b>inbox</b>: record the processed event ID transactionally with the
  effect.
</p>

<h4>Dry run: one event surviving a consumer crash and a redelivery, exactly once in effect</h4>
<table>
  <tr><th>Time</th><th>Event</th><th>Outbox row (event E77)</th><th><code>processed_events</code> table</th><th>Fulfillment record</th></tr>
  <tr><td>t0</td><td>Order service commits: <code>orders</code> row + outbox row, one transaction</td><td>status = pending</td><td>empty</td><td>none yet</td></tr>
  <tr><td>t1</td><td>Relay publishes E77 to Kafka (a polling relay then marks the row sent; a log-based relay needs no mark)</td><td>status = sent</td><td>empty</td><td>none yet</td></tr>
  <tr><td>t2</td><td>Consumer reads E77 at offset 42, begins processing</td><td>sent</td><td>empty</td><td>in progress</td></tr>
  <tr><td>t3</td><td>Consumer crashes before committing the offset or writing <code>processed_events</code></td><td>sent</td><td>empty</td><td>lost — never committed</td></tr>
  <tr><td>t4</td><td>Consumer restarts, resumes from the last committed offset (42, the next record to read) — E77 is redelivered</td><td>sent</td><td>empty</td><td>reprocessing starts</td></tr>
  <tr><td>t5</td><td>Consumer inserts into <code>processed_events(event_id)</code> and writes the fulfillment row, same transaction</td><td>sent</td><td>{E77} — first successful insert</td><td>created, exactly once</td></tr>
  <tr><td>t6</td><td>Offset 43 committed (Kafka commits the position of the <em>next</em> record to read, so after finishing offset 42 you commit 43)</td><td>sent</td><td>{E77}</td><td>created</td></tr>
  <tr><td>t7 (later)</td><td>The relay had crashed after publishing E77 but before marking it sent, so on restart it publishes E77 again as a new record (say offset 57), and the consumer reads it</td><td>sent (finally marked)</td><td>insert hits the unique constraint — conflict, no-op</td><td>unchanged — effect already applied</td></tr>
</table>
<p class="sub">
  The crash at t3 is exactly the case at-least-once delivery is built to
  survive, and it's also exactly the case a naive consumer gets wrong: the
  guarantee isn't that E77 arrives once, it's that redelivery at t4 and the
  duplicate publish at t7 both land on the same <code>processed_events</code>
  row and produce the same state either way — a duplicate delivery, not a
  duplicate effect. (A consumer-group rebalance after t6 would <em>not</em>
  redeliver E77, because the committed offset 43 is already past it; the
  duplicate here comes from the relay, which is why the consumer still needs
  its own de-duplication.)
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "send a notification", "generate a report", "process the video", "update the search index", "handle Black Friday traffic", or any single request that fans out to three or more downstream systems. If work can finish after the response, it should.</li>
  <li><b>The naive design</b> does everything inline and adds servers when it's slow — which scales the fast path and the slow path together, and still fails whenever the slowest third party does.</li>
  <li><b>Queue or log?</b> Ask "does anyone need to read these events twice, or will someone need them a year from now?" Yes → log (replay, multiple independent consumer groups, backfilling a new service). No, it's just work to be done → queue (simpler, richer routing, no partition-count planning).</li>
  <li><b>Distinguishing it from a request/response cache:</b> both remove latency, but a cache makes reads cheap while a queue makes <em>writes</em> deferrable. If the expensive thing is a read, you want the caching or CDN chapter, not this one.</li>
  <li><b>The pitfall to name unprompted:</b> the dual-write. If your design says "save to the DB, then publish an event", say "…via an outbox table, so I'm not doing a dual write" in the same breath. It is one clause and it reliably reads as senior.</li>
  <li><b>The follow-up you will get:</b> "what if the consumer processes the same message twice?" The answer is never "it won't." It's an idempotency key plus a processed-events table, written in the same transaction as the effect.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain the dual-write problem and why the outbox pattern fixes it by making two writes into one.</li>
    <li>Trace the crash-and-redelivery dry run above and say exactly which row makes the third delivery at t7 a no-op.</li>
    <li>Explain why "exactly-once delivery" is impossible but "exactly-once effect" is achievable, in your own words.</li>
    <li>Say what replication factor, acks and min.insync.replicas setting you would use for a durable Kafka topic, and what it costs in availability.</li>
    <li>Decide, for a concrete workload, whether you want a queue or a log — and justify it with the "does anyone need to replay this" test.</li>
    <li>Explain why partitioning by entity key gives you ordering where it matters without sacrificing parallelism across keys.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://kafka.apache.org/42/design/design/" rel="noopener noreferrer">Apache Kafka documentation: design</a> — replication guarantees, consumer position as the next offset, log compaction, page cache and sequential I/O</li>
    <li><a href="https://kafka.apache.org/blog/2026/02/17/apache-kafka-4.2.0-release-announcement/" rel="noopener noreferrer">Apache Kafka 4.2.0 release announcement</a> — share groups (queues for Kafka) declared production-ready</li>
    <li><a href="https://cwiki.apache.org/confluence/display/KAFKA/KIP-932%3A+Queues+for+Kafka" rel="noopener noreferrer">KIP-932: Queues for Kafka</a> — per-record acknowledgement and more consumers than partitions</li>
    <li><a href="https://www.rabbitmq.com/docs/streams" rel="noopener noreferrer">RabbitMQ Streams</a> — a replicated log with non-destructive reads and offset replay</li>
    <li><a href="https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/quotas-messages.html" rel="noopener noreferrer">Amazon SQS message quotas</a> — FIFO limits, high throughput mode, visibility timeout and message timers</li>
    <li><a href="https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/high-throughput-fifo.html" rel="noopener noreferrer">Amazon SQS high throughput for FIFO queues</a> — limits are per queue partition and scale with message groups</li>
    <li><a href="https://debezium.io/documentation/reference/stable/transformations/outbox-event-router.html" rel="noopener noreferrer">Debezium outbox event router</a> — the insert-only outbox table read from the log</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" are rules of thumb, not guarantees.</p>
</div>`,
};
