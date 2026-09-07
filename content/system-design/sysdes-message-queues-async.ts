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
  broker deletes nothing until the retention window expires. Reads are
  sequential disk scans, which is why a single broker sustains hundreds of
  MB/s. Because messages aren't deleted on read, you can rewind the offset
  and replay a week of history into a new consumer, which is the
  capability queues fundamentally lack.
</p>

<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="A producer hashing a key into three partitions of a topic, with a consumer group of three where the first consumer owns two partitions, the second owns one, and the third sits idle because there are no partitions left">
    <g class="rough">
      <path class="ln" d="M124,148 L170,66" />
      <path class="ln" d="M124,152 L170,146" />
      <path class="ln" d="M124,158 L170,226" />
      <path class="lng" d="M330,66 L440,84" />
      <path class="lng" d="M330,146 L440,96" />
      <path class="lng" d="M330,226 L440,206" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="130" width="108" height="46" rx="6" />
      <rect class="boxy" x="170" y="44"  width="160" height="44" rx="6" />
      <rect class="boxy" x="170" y="124" width="160" height="44" rx="6" />
      <rect class="boxy" x="170" y="204" width="160" height="44" rx="6" />
      <rect class="boxg" x="440" y="64"  width="164" height="46" rx="6" />
      <rect class="boxg" x="440" y="184" width="164" height="46" rx="6" />
      <rect class="boxr" x="440" y="258" width="164" height="46" rx="6" />
    </g>
    <text class="sm" x="70"  y="150" text-anchor="middle">producer</text>
    <text class="sm" x="70"  y="166" text-anchor="middle">key = userId</text>
    <text class="sm" x="132" y="112">hash % 3</text>
    <text class="sm" x="250" y="72" text-anchor="middle">partition 0</text>
    <text class="sm" x="250" y="152" text-anchor="middle">partition 1</text>
    <text class="sm" x="250" y="232" text-anchor="middle">partition 2</text>
    <text class="sm" x="522" y="86"  text-anchor="middle">consumer A</text>
    <text class="sm" x="522" y="102" text-anchor="middle">owns P0 + P1</text>
    <text class="sm" x="522" y="206" text-anchor="middle">consumer B</text>
    <text class="sm" x="522" y="222" text-anchor="middle">owns P2</text>
    <text class="sm rd" x="522" y="280" text-anchor="middle">consumer C</text>
    <text class="sm rd" x="522" y="296" text-anchor="middle">idle — no partition</text>
    <text class="lbl" x="16" y="270" style="font-size:14px">one partition has exactly one owner in a group,</text>
    <text class="lbl" x="16" y="292" style="font-size:14px">so partition count is your parallelism ceiling</text>
  </svg>
  <figcaption>Consumer C is the whole lesson: you scale a Kafka consumer group by adding partitions, not by adding pods. Pick the partition count for the parallelism you'll want in a year.</figcaption>
</figure>

<table>
  <tr><th>&nbsp;</th><th>Queue broker (RabbitMQ, SQS)</th><th>Log (Kafka, Pulsar)</th></tr>
  <tr><td>Unit of progress</td><td>Per-message ack / nack</td><td>Per-partition offset commit</td></tr>
  <tr><td>After a message is consumed</td><td>Deleted</td><td>Still there until retention expires (hours to forever)</td></tr>
  <tr><td>Replay</td><td>Not possible — you must have kept a copy yourself</td><td>Seek the offset backwards; a brand-new consumer can read all history</td></tr>
  <tr><td>Ordering</td><td>Per-queue, and lost the moment you add a second consumer</td><td>Total order <em>within a partition</em>; none across partitions</td></tr>
  <tr><td>Parallelism</td><td>Add consumers freely — the broker load-balances messages</td><td>Capped at partition count per consumer group</td></tr>
  <tr><td>Throughput, single node</td><td>~20-50 k msg/s (much lower with persistence + per-message routing)</td><td>Hundreds of MB/s; ~10 MB/s per partition is a comfortable planning figure</td></tr>
  <tr><td>Routing</td><td>Rich: topic/fanout/header exchanges, per-message TTL, delayed delivery</td><td>Deliberately dumb: topic + partition. Routing is the consumer's job</td></tr>
  <tr><td>Reach for this when</td><td>Task/job semantics — "someone do this one thing", varied per-message delays, complex routing, modest volume</td><td>Event-stream semantics — many independent consumers of the same events, replay for backfills or new services, ordered per-entity change streams, high volume</td></tr>
</table>
<p class="sub">
  A cheap tell that you've thought about it: "SQS standard gives me
  unbounded throughput but no ordering; SQS FIFO gives me ordering per
  message-group at ~300 messages/second per group (3,000 batched), which
  is fine per user and useless as a global pipe." Named limits beat
  adjectives.
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
  <li><b>Idempotency tokens at the boundary.</b> When the side effect leaves your system (Stripe charge, email send), pass a client-generated key that the provider de-duplicates on. Stripe's <code>Idempotency-Key</code> exists for precisely this scenario.</li>
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
  across the resize. Over-provision partitions up front instead.
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
  (it blocks on coordinator failure and no cloud broker offers it).
</p>
<p>
  The fix is to make it a <em>single</em> write. Insert the event into an
  <code>outbox</code> table in the same transaction as the business row.
  Now either both exist or neither does. A separate relay — a poller, or
  Debezium tailing the write-ahead log — reads that table and publishes to
  the broker, marking rows sent.
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
    <text class="sm" x="364" y="166" text-anchor="middle">mark sent</text>
    <text class="lbl" x="16" y="222" style="font-size:14px">Both rows commit or neither does — the impossible state</text>
    <text class="lbl" x="16" y="244" style="font-size:14px">"order exists, event lost" can no longer occur.</text>
  </svg>
  <figcaption>The relay may crash mid-publish and re-send, so the outbox is at-least-once by design — which is fine, because you already made the consumer idempotent.</figcaption>
</figure>

<p class="sub">
  Cost and caveats, stated plainly: the outbox adds a write per event and
  a few hundred milliseconds to a few seconds of publish latency (poll
  interval; CDC is closer to tens of ms). You must prune sent rows or the
  table becomes your biggest one. And the relay gives you at-least-once,
  never exactly-once — the event ID in the outbox row <em>is</em> the
  consumer's de-duplication key, which is why these two patterns are
  always taught together. The mirror-image pattern on the consumer side is
  the <b>inbox</b>: record the processed event ID transactionally with the
  effect.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "send a notification", "generate a report", "process the video", "update the search index", "handle Black Friday traffic", or any single request that fans out to three or more downstream systems. If work can finish after the response, it should.</li>
  <li><b>The naive design</b> does everything inline and adds servers when it's slow — which scales the fast path and the slow path together, and still fails whenever the slowest third party does.</li>
  <li><b>Queue or log?</b> Ask "does anyone need to read these events twice, or will someone need them a year from now?" Yes → log (replay, multiple independent consumer groups, backfilling a new service). No, it's just work to be done → queue (simpler, richer routing, no partition-count planning).</li>
  <li><b>Distinguishing it from a request/response cache:</b> both remove latency, but a cache makes reads cheap while a queue makes <em>writes</em> deferrable. If the expensive thing is a read, you want the caching or CDN chapter, not this one.</li>
  <li><b>The pitfall to name unprompted:</b> the dual-write. If your design says "save to the DB, then publish an event", say "…via an outbox table, so I'm not doing a dual write" in the same breath. It is one clause and it reliably reads as senior.</li>
  <li><b>The follow-up you will get:</b> "what if the consumer processes the same message twice?" The answer is never "it won't." It's an idempotency key plus a processed-events table, written in the same transaction as the effect.</li>
</ul>`,
};
