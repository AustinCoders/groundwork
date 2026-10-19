import type { CompanyQuestion } from "./types";

export const questions: CompanyQuestion[] = [
  {
    id: "google-distributed-counter",
    company: "google",
    title: "Design a distributed counter",
    prompt:
      "Design a service that counts events such as views or likes for 100 million items. Increments arrive at up to 58,000 a second across all items, one viral item can briefly take 20,000 a second, and a read should be within a few seconds of the truth and never go backwards.",
    level: "L5",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Blind: a candidate's long journey to Google L5",
        url: "https://www.teamblind.com/post/my-long-journey-to-google-l5-2c2fzrva",
        kind: "candidate-report",
        year: 2023,
      },
    ],
    chapters: ["sysdes-sharding-partitioning", "sysdes-caching-fundamentals", "sysdes-consistency-models"],
    answer: {
      ask: `<p>I would ask before drawing anything. Does the count have to be exact, or is "within a second or two, never going backwards" enough? Is anyone billed from it? Can counters go down (an unlike)? A like counter that also enforces one like per user needs a set of (user, item) pairs, which is a different problem from a view counter that only adds. How many counters are there, how skewed is the traffic, and are reads global or per region?</p>
<p><b>Assumed scope:</b> 100 million counters, add-only plus an optional decrement, eventual consistency with a delay of a few seconds, three regions. In scope: ingest, storage, hot keys, reads, the multi-region merge. Out of scope: per-user uniqueness (a follow-up), bot filtering, slicing counts by dimension.</p>`,
      numbers: `<p>These are planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Write rate:</b> 1 billion increments a day ÷ 86,400 s is about <b>11,600 a second</b>; at a 5× peak, <b>58,000 a second</b>.</li>
  <li><b>Against one primary:</b> a relational primary is a planning figure of 5,000 committed writes a second. 58,000 ÷ 5,000 = 11.6, so one row per increment on one box is out. Sixteen shards puts each at 58,000 ÷ 16 = <b>3,625 a second</b>.</li>
  <li><b>Hot key:</b> one item taking 20,000 a second is a single row that every writer must update in turn. Sharding by key does not help, because the load is one key. Batching does: collapse a second of increments into one delta and that row sees <b>1 write a second instead of 20,000</b>.</li>
  <li><b>Reads:</b> assume 5 reads per write at peak, 58,000 × 5 = <b>290,000 a second</b>. That is 14.5 times the 20,000 simple-read figure for one box, so reads need a cache. At a 99% hit rate the store sees 290,000 × 0.01 = <b>2,900 a second</b>.</li>
  <li><b>Size:</b> 100 million counters × 16 B (id plus count) = 1.6 GB; with roughly 3× overhead, about <b>5 GB</b>. Capacity is not what forces sharding. Write rate and hot keys are.</li>
  <li><b>Cross-region:</b> US to Western Europe is 70 to 90 ms. A synchronous global increment would add that to every write, so each region counts locally and merges later.</li>
</ul>
<p>The numbers force: a durable log in front, in-memory batching, a sharded store, a cache for reads, and region-local counting.</p>`,
      design: `<p>The shape is: API appends to a log, one aggregator per partition sums and writes to the matching store shard, reads go through a cache.</p>
<ol>
  <li><b>Ingest.</b> The API validates and appends <code>{counter_id, delta, event_id}</code> to a partitioned log, then acknowledges. The partition is <code>hash(counter_id) mod 16</code>. The log is the source of truth: a lost store is rebuilt by replay, and a traffic spike lands in the log, not on the store. The hot key at 20,000 events a second is about 1 MB/s at 50 B each, far under the roughly 10 MB/s per-partition planning figure.</li>
  <li><b>Aggregate.</b> One consumer owns each partition. It keeps a map of counter id to pending delta and flushes every second. A flush is one transaction on the one store shard that matches its partition: <code>UPDATE counters SET n = n + :d, version = version + 1 WHERE id = :id</code> for each counter, plus <code>UPDATE offsets SET off = :o WHERE partition = :p</code>. Because the log partition and the store shard use the same hash, the offset row lives in the same shard and commits atomically with the deltas.</li>
  <li><b>Replay safety.</b> On restart the consumer reads its stored offset and resumes after it, so a replayed batch is never applied twice. The idempotency key is the (partition, offset), not the individual event. A client retry of the API call is covered by <code>event_id</code>, de-duplicated in the aggregator for a short window.</li>
  <li><b>Store.</b> A table <code>counters(id, n, version)</code>, 16 shards, primary key <code>id</code>. Increments are always <code>n = n + delta</code> in the database. Never read the value, add in the application and write it back, because two writers will lose an update.</li>
  <li><b>Read.</b> API, then cache (TTL 2 s with plus or minus 20% jitter), then the shard. A cache fill carries the row version and never replaces a newer version with an older one, so a reader does not see the number go backwards. For a hot key the aggregator can push the new value into the cache on each flush instead of waiting for expiry.</li>
</ol>
<p><b>Hard problem 1: the hot key.</b> Batching first, as above: 20,000 increments become one delta a second per aggregator. If a single key ever outgrows one partition and one row (hundreds of thousands a second), detect it at runtime and split it into 16 slots. Producers route that key's events by (counter id, random slot) so they spread over partitions, which batching alone cannot do, and each slot row <code>counter_slots(id, slot, n)</code> lives on the shard that matches its partition. A read sums 16 rows and the result is cached. Only hot keys get slots, because every read of a slotted key costs 16 reads.</p>
<p><b>Hard problem 2: regions.</b> Each region runs the whole pipeline and owns one row per counter: <code>(counter_id, region, n)</code>. A region only ever writes its own row, so there are no write conflicts. Rows replicate asynchronously to the other regions, and the global value is the sum of the latest known row from each region. Each row only grows, so a merge is "take the larger", which is a grow-only counter. A decrement gets a second column and the value is increments minus decrements. Staleness is the replication delay, usually about a second, and it can never invent a count.</p>
<p><b>Failure.</b> If an aggregator dies, another takes its partition and resumes from the stored offset. If the cache dies, the store absorbs 290,000 reads a second for a moment, so protect it with a per-key lock on refill (one loader per key) and a short serve-stale window.</p>`,
      tradeoffs: `<ul>
  <li><b>Durable log versus batching in API memory.</b> Pick the log when the count is billed or ranks something, because a crashed API node loses its unflushed second. Flip to in-memory batching for plain view counts where losing a second of increments is acceptable and the extra hop is not worth it.</li>
  <li><b>Direct database increment versus log plus aggregator.</b> Direct is simple and exact at read time, fine up to a couple of thousand writes a second. Pick the log past the 5,000-a-second planning figure or when a hot key appears. Flip back when volume is small and a read must see the very latest write.</li>
  <li><b>Long cache TTL versus short.</b> Pick 2 seconds: it removes 99% of reads and the number is only seconds old. Flip to push-on-flush for the few hot keys where even 2 seconds looks wrong, or to a longer TTL for cold counters.</li>
  <li><b>Slots versus a single row.</b> Pick the single row with batching first. Flip to slots when one key's raw event rate exceeds what a single partition and its aggregator can take, accepting 16 times the read cost for that key only.</li>
</ul>`,
      followups: [
        "How would you make the counter exact, with each user counted at most once per item, and what does that do to storage?",
        "A counter is wrong after an incident. How do you detect it and repair it from the log?",
        "How do you support a rolling 'last 24 hours' count rather than a lifetime total?",
        "What changes if a region is partitioned from the others for ten minutes?",
        "How would you shrink storage if most of the 100 million counters never change?",
      ],
      slips: `<p>The common mistakes on this question:</p>
<ul>
  <li>Reading the value, adding one in application code and writing it back. It loses updates under concurrency; the add belongs in the store.</li>
  <li>One row per counter taking every increment directly, so a single viral item serialises 20,000 writers.</li>
  <li>Using an in-memory <code>INCR</code> with no story for a restart. If the instance dies, the counts since the last snapshot are gone.</li>
  <li>Retrying an increment after a timeout with no event id, which double counts. The outcome of a timed-out call is unknown.</li>
  <li>Synchronous cross-region agreement for every increment, paying 70 to 90 ms on the write path.</li>
  <li>Claiming "exactly once" without saying that it is at-least-once delivery plus an idempotent apply.</li>
</ul>`,
    },
  },
  {
    id: "meta-game-leaderboard",
    company: "meta",
    title: "Design a game leaderboard (top-K ranking)",
    prompt:
      "Design a leaderboard for an online game with 50 million players. It shows the global top 100, tells any player their exact rank, and reflects a finished match within a few seconds.",
    level: "E5",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Blind thread on Meta E5 loops (a commenter names it)",
        url: "https://www.teamblind.com/post/is-it-normal-to-have-2-coding-2-system-design-and-1-behavioral-interviews-for-meta-e5-virtual-interview-iato38mq",
        kind: "candidate-report",
        year: 2025,
      },
      {
        label: "Hello Interview: Meta E5 system design guide",
        url: "https://www.hellointerview.com/guides/meta/e5",
        kind: "prep-guide",
      },
    ],
    chapters: ["sysdes-caching-fundamentals", "sysdes-sharding-partitioning", "sysdes-batch-stream-processing"],
    answer: {
      ask: `<p>First questions. Is the score a running total or a best single result? Do scores only go up? What happens on ties? Is there one global board or also friends, regional, daily and weekly boards? How fresh must the top 100 be, and does every player need an exact rank or only the top few thousand? Is there a season reset? Who produces scores, the client or the server?</p>
<p><b>Assumed scope:</b> 50 million players, one global board per season plus daily and weekly boards, a score that only increases, scores written by the server from verified match results, exact rank for everyone, freshness of a few seconds. Out of scope: anti-cheat detection, matchmaking, and rewards.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Writes:</b> assume 10 million daily active players × 10 matches = 100 million score updates a day ÷ 86,400 s = about <b>1,200 a second</b>; at a 5× peak, about <b>6,000 a second</b>. That is above the 5,000-a-second planning figure for one durable primary, so the durable table must be partitioned. Four shards put each at 1,500 a second.</li>
  <li><b>Index size:</b> 50 million players × about 100 B per sorted-set entry (id, score, structure overhead) = <b>5 GB</b>. One in-memory node holds the whole ranking.</li>
  <li><b>Depth:</b> log2 of 50 million is about 26 (2^25 is 33.5 million, 2^26 is 67 million). Insert and rank lookup are about 26 steps each, so the ranking structure is not the bottleneck.</li>
  <li><b>Reads:</b> 10 million players × 20 board views a day = 200 million ÷ 86,400 = about 2,300 a second; at 5×, <b>11,600 a second</b>. That is under 20,000, but the top 100 is the same for everybody, so cache that one blob and leave only per-player rank lookups (roughly half the reads) for the index.</li>
  <li><b>Rebuild:</b> if the index is lost, reloading 50 million entries at an assumed 100,000 inserts a second takes 50,000,000 ÷ 100,000 = <b>500 s</b>, about 8 minutes.</li>
</ul>
<p>The numbers say: one sorted set is enough for the ranking, the durable store is what needs partitioning, and the top 100 should be served from a cached blob.</p>`,
      design: `<p>Treat the table and the log as truth, and the ranking index as a derived structure that can be rebuilt.</p>
<ol>
  <li><b>Ingest.</b> A finished match emits one event per player: <code>{match_id, player_id, points}</code> to a log partitioned by <code>player_id</code>. Per-player order is kept, and the idempotency key is <code>(match_id, player_id)</code>.</li>
  <li><b>Updater.</b> A consumer applies the event to the durable table <code>player_scores(player_id PK, season, total, updated_at)</code>, sharded by player id into four shards. A unique row <code>applied_matches(match_id, player_id)</code> written in the same transaction rejects a duplicate delivery. The consumer then sets the player's value in the ranking index.</li>
  <li><b>Ranking index.</b> An in-memory sorted set per board, <code>lb:season:42</code>, member is the player id and the sort value is a number. The update sets the absolute total, never an increment, so a replay is harmless. Redis sorted sets have a <code>GT</code> option on <code>ZADD</code> (check the current docs) that only applies a higher value, which protects against an out-of-order write.</li>
  <li><b>Ties.</b> Make the tie-break part of the sort value. Use <code>total × 1,000,000 + (1,000,000 − minutes_since_season_start)</code> so that the player who reached a total first ranks higher. With totals up to 10 million that is under 10^13, inside the range a double represents exactly (about 9 × 10^15). Check the store's exact-integer range.</li>
  <li><b>Read: top 100.</b> A refresher runs the range query for the top 100 once a second and writes a small blob to a cache or CDN key with a 1 s TTL. Read traffic never reaches the index for this.</li>
  <li><b>Read: my rank.</b> A reverse-rank lookup on the sorted set gives the exact position in about 26 steps. The neighbours (five above and below) are a range query from that rank. A friends board is a batch of score lookups for the friend list (a few hundred ids), sorted in the application.</li>
  <li><b>Periodic boards.</b> Daily and weekly boards are separate keys, <code>lb:daily:2026-10-19</code>, written by the same updater and given an expiry. A reset is just a new key, with no migration.</li>
</ol>
<p><b>Hard problem 1: growing past one node.</b> Say there are 500 million players or 100,000 writes a second. Partition the index by <code>hash(player_id)</code> across 16 sorted sets. The global top 100 is the merge of each shard's top 100 (1,600 candidates), which is exact, because a player in the global top 100 must be in the top 100 of their own shard. An exact rank becomes the sum of 16 "how many scores are higher than mine" counts, 16 calls per lookup. Past the top few thousand, switch to a score histogram and show "top 3%" rather than a number.</p>
<p><b>Hard problem 2: recovery.</b> A failed-over replica may be missing the last writes, because replication is asynchronous. The updater keeps its log offset, so after a failover it replays from a few minutes back; the absolute-set write makes that safe. A full loss is the 8-minute rebuild from the table.</p>`,
      tradeoffs: `<ul>
  <li><b>Exact rank versus approximate.</b> Pick exact while one sorted set (or a small number of them) holds everyone, since it is cheap. Flip to a histogram with "top N%" once a rank needs a wide fan-out or the board has hundreds of millions of rows.</li>
  <li><b>Sharding by player id versus by score range.</b> Player-id hash spreads load evenly and makes top-K a simple merge, but rank costs a fan-out. Score ranges make rank cheap but pile players into popular score bands. Pick the hash; flip to ranges only when rank lookups dominate and the band sizes are well known.</li>
  <li><b>Refreshing the top 100 on a timer versus on every write.</b> Pick the 1 s timer: it costs one range query a second no matter what, while per-write refresh costs 6,000 a second. Flip to push only if the product demands sub-second changes at the very top.</li>
  <li><b>Table as truth versus in-memory index as truth.</b> Pick the table plus log, because replication and snapshots can lose recent writes. Flip to index-only for a casual game where a few lost scores after a crash are acceptable.</li>
</ul>`,
      followups: [
        "How do you show a player their rank among friends only?",
        "How would the design change if scores could also decrease, for example after a cheat is removed?",
        "What do you do at the season reset, and how do you keep last season's final board?",
        "How would you shard the board for 500 million players and still answer exact rank?",
        "What does the board show when two players tie at the top, and how do you keep that stable?",
      ],
      slips: `<p>Common mistakes here:</p>
<ul>
  <li>Using <code>SELECT ... ORDER BY score DESC LIMIT 100</code> and a <code>COUNT(*) WHERE score &gt; mine</code> on every request against a large table.</li>
  <li>Forgetting ties, so two players share a score and the order flips between refreshes.</li>
  <li>Writing increments to the index, so a replayed event inflates a score.</li>
  <li>Treating the cache or the index as the only copy with no way to rebuild.</li>
  <li>Sharding by player id and then claiming the top 100 is just the top 100 of one shard.</li>
  <li>Recomputing the top 100 on every request instead of serving one shared blob.</li>
  <li>Trusting scores sent by the client.</li>
</ul>`,
    },
  },
  {
    id: "uber-top-k-popularity",
    company: "uber",
    title: "Design a top-k popularity ranking system",
    prompt:
      "Design a system that returns the 50 most popular items in a city over the last hour, refreshed every minute, from a stream of order or view events that peaks near 58,000 a second. Reads come from a mobile app and must be fast.",
    level: "L4 / SDE-2",
    kind: "hld",
    evidence: "one",
    sources: [
      {
        label: "Bugfree: Uber L4 SDE-2 interview experience",
        url: "https://blog.bugfree.ai/uber-l4-sde2-interview-experience-oa-to-offer",
        kind: "candidate-report",
      },
    ],
    chapters: ["sysdes-batch-stream-processing", "sysdes-caching-fundamentals", "sysdes-sharding-partitioning"],
    answer: {
      ask: `<p>Questions I would ask: what is "popular", raw event count or distinct users? Is the window sliding (last 60 minutes, updated each minute) or tumbling (each clock hour)? How many items and how many cities or categories? How exact must the ranking be, and does anyone pay money based on it? Can events arrive late or twice? How fresh must the list be?</p>
<p><b>Assumed scope:</b> raw event count, sliding one-hour window with a one-minute hop, 10 million distinct items active in an hour, results per city, approximate is acceptable (no billing), freshness of about a minute. Out of scope: personalised ranking, spam and fake-event filtering, and distinct-user counting (a follow-up).</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Rate:</b> 1 billion events a day ÷ 86,400 s = about <b>11,600 a second</b>; at 5×, <b>58,000 a second</b>. At 100 B an event that is 5.8 MB/s, under the ~10 MB/s per-partition planning figure, so volume alone does not force many partitions. Parallelism for the counting does.</li>
  <li><b>Window volume:</b> 11,574 × 3,600 s = about <b>42 million events in an hour</b> at the average rate (about 5 times that if a whole hour ran at peak).</li>
  <li><b>Exact state, worst case:</b> 10 million items × 60 one-minute buckets × 16 B = <b>9.6 GB</b>, assuming every item appears in every minute. Real data is sparse, so this is an upper bound. Split across 8 workers by item id, that is 9.6 ÷ 8 = <b>1.2 GB each</b>. It fits in memory.</li>
  <li><b>Sketch alternative:</b> a count-min sketch with error target ε = 0.0001 has width about e ÷ ε = 27,200 and depth 5. At 4 B per cell that is 27,200 × 5 × 4 = 544 KB per bucket, about 33 MB for 60 buckets. The worst over-count is ε × N = 0.0001 × 42 million = <b>4,200</b>, with probability about 99.3% (1 − e^-5). It only ever over-counts.</li>
  <li><b>Recovery:</b> replaying the last minute at peak is 58,000 × 60 = 3.5 million events; at an assumed 200,000 a second replay, about 17 s.</li>
  <li><b>Output:</b> 50 items × 100 B = 5 KB a list. At 10,000 reads a second that is 50 MB/s from a cache.</li>
</ul>
<p>The numbers force: exact counting is affordable at 10 million items, so use it, shard by item id, and keep the sketch for when cardinality reaches hundreds of millions or billions.</p>`,
      design: `<ol>
  <li><b>Ingest.</b> Services publish <code>{event_id, item_id, city, event_time}</code> to a log. The first stage is a light consumer, holding only one second of state, that pre-aggregates one second of events into partial counts <code>(city, item_id, count)</code> and re-publishes them keyed by <code>hash(item_id)</code>. This is what tames a viral item at 20,000 events a second: each pre-aggregator emits at most one record per item per second.</li>
  <li><b>Windowed counters.</b> Eight workers each own a slice of items. A worker keeps two things: a total per <code>(city, item_id)</code> for the last 60 minutes, and a sparse map of minute to per-item counts. An event adds to the total and to the current minute's map. At each minute boundary the worker removes the bucket that has just fallen out of the window: for every entry in that bucket, subtract its count from the total. The cost of a roll is the size of the expired bucket, not the whole state.</li>
  <li><b>Local top-K.</b> Once a minute each worker scans its totals with a 50-entry min-heap per city. A scan of about 1.25 million items (10 million ÷ 8) with a heap of 50 is a few million operations, well inside the minute.</li>
  <li><b>Merge.</b> A merger takes each worker's top 50 and picks the global top 50 from those 8 × 50 = 400 candidates. This is exact, not heuristic. Each item lives on exactly one worker, so an item in the true top 50 must be in the top 50 of its own worker: if it were not, 50 items on its worker would already beat it. This only holds because the partition key is the item id.</li>
  <li><b>Serve.</b> The merger writes <code>top:{city}:1h</code> as a versioned blob (about 5 KB) to a key-value store, and the app API reads that one key. Put a 30 s CDN or API-side cache in front. Nobody computes anything at read time.</li>
</ol>
<p><b>Hard problem 1: time.</b> Bucket by event time, not arrival time. A phone that was offline can deliver events minutes late. Use a watermark that allows 2 minutes of lateness; anything older is dropped and counted in a metric. Because nothing is billed, an occasional dropped late event is fine. If a daily top-K were needed for reporting, a nightly batch job over the archived log would give the settled numbers.</p>
<p><b>Hard problem 2: crash recovery.</b> Each worker snapshots its totals and buckets to object storage every minute together with its log offset. On restart it loads the snapshot and replays from the offset, which at peak is under a minute of events (the 17 s figure above). The list is slightly stale during that time and then catches up.</p>
<p><b>Duplicates.</b> The log is at-least-once, so some events will count twice. A ranking tolerates a tiny error, so I would skip exact de-duplication and say so. If the ranking drives anything paid, add a short-window <code>event_id</code> check in the first stage.</p>
<p><b>Dimensions.</b> Keep the dimension in the key, <code>(city, item_id)</code>, and a heap per city served. Do not precompute every combination (city × category × time window); precompute the few the product shows.</p>`,
      tradeoffs: `<ul>
  <li><b>Exact counts versus a count-min sketch.</b> Pick exact at 10 million items because it is 1.2 GB per worker and has no error. Flip to a sketch plus a candidate heap when distinct items reach hundreds of millions or billions, such as search queries, and accept an over-count bounded by ε × N.</li>
  <li><b>Sliding window versus tumbling.</b> Pick a sliding hour with a one-minute hop for a list that moves smoothly. Flip to tumbling clock hours if the product only needs "top of the last hour" once an hour, since it needs no subtract step.</li>
  <li><b>Raw count versus a decayed score.</b> Pick raw count for "most popular". Flip to an exponentially decayed score when the product means "trending now", because a steady best seller should not outrank a sudden riser.</li>
  <li><b>Partition by item id versus by event id.</b> Item id keeps all counts for an item on one worker and makes the merge exact, but skews on a viral item, which is why the pre-aggregation stage exists. Event id spreads load evenly but forces a shuffle before counting. Pick item id; flip if one item exceeds what a pre-aggregated stream can carry.</li>
</ul>`,
      followups: [
        "How would you count distinct users per item instead of raw events, and what does it cost?",
        "How do you stop someone from pushing an item up the list with fake events?",
        "How would you add 'top 50 in the last 24 hours' next to the one-hour list without doubling the state?",
        "What happens to the list during a worker crash, and how would you tell users it is stale?",
        "How would the design change for 1 billion distinct search queries?",
      ],
      slips: `<p>Typical mistakes:</p>
<ul>
  <li>Running <code>GROUP BY item ORDER BY count DESC LIMIT 50</code> over the last hour of raw events on every request.</li>
  <li>Keeping one global sorted set and updating it for every event at 58,000 a second.</li>
  <li>Partitioning by anything other than item id, then merging the per-partition top 50 as if it were exact.</li>
  <li>Handling a sliding window by recounting 42 million events each minute instead of adding the new bucket and subtracting the expired one.</li>
  <li>Using arrival time and then wondering why late phone events distort the list.</li>
  <li>Reaching for a sketch without checking that exact state already fits in memory.</li>
  <li>Ignoring the viral item, so one worker is overloaded while the others idle.</li>
</ul>`,
    },
  },
  {
    id: "microsoft-distributed-rate-limiter",
    company: "microsoft",
    title: "Design a distributed API rate limiter",
    prompt:
      "Design a rate limiter for a public API served by 50 gateway nodes across three regions. Each API key gets 1,000 requests a minute, the limiter may add at most about 2 ms at p99, and the API must keep working if the limiter's store is down.",
    level: "SDE-2",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "Blind: Microsoft Office 365 interview thread (comment)",
        url: "https://www.teamblind.com/post/microsoft-interview-office-365-7dz48pze",
        kind: "candidate-report",
        year: 2020,
      },
      {
        label: "Blind: Microsoft SDE2 interview prep (comment)",
        url: "https://www.teamblind.com/post/microsoft-sde2-interview-prep-drks1veq",
        kind: "candidate-report",
      },
    ],
    chapters: ["sysdes-rate-limiting", "sysdes-consistency-models", "sysdes-fault-tolerance"],
    answer: {
      ask: `<p>Questions first. What is limited: per API key, per user, per IP, per tenant, per route? Is the limit a hard contract or a protection, so is a small overshoot acceptable? Are bursts legitimate? What should a rejected caller see? Where does the limiter run, inside the gateway or as a service? What happens if the limiter's store is unreachable, for all routes alike?</p>
<p><b>Assumed scope:</b> per API key and per tenant limits, 1,000 requests a minute per key, bursts allowed, three regions with users spread across them, enforcement at the gateway, a small overshoot tolerated, and a 2 ms budget. Out of scope: DDoS protection at the network layer, billing, and the dashboard for editing limits.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Traffic:</b> assume 100,000 requests a second at peak across 50 gateway nodes, so <b>2,000 a second per node</b>.</li>
  <li><b>Central check per request:</b> every check is a read-modify-write. At the 5,000-writes-a-second planning figure for one durable node, 100,000 ÷ 5,000 = <b>20 shards</b>. An in-memory store does better, so benchmark it, but the order of magnitude says one box is not enough.</li>
  <li><b>Latency budget:</b> a same-AZ round trip is 0.5 ms and cross-AZ is 1 to 2 ms. One round trip to a same-AZ shard fits the 2 ms p99. A cross-region round trip is 70 to 90 ms, about 40 times the budget, so counting cannot cross regions on the request path.</li>
  <li><b>Denied traffic:</b> one abusive key sending 5,000 requests a second against a 1,000-a-minute limit would land 5,000 checks a second on one shard. If each gateway remembers a denial locally for 1 s, that falls to 50 nodes × 1 = <b>50 checks a second</b>, a 100-fold cut.</li>
  <li><b>State:</b> 5 million active keys × about 100 B = <b>500 MB</b>. Memory is not the constraint.</li>
  <li><b>Retries:</b> a client that retries 3 times across 3 layers turns one blocked call into 3 × 3 × 3 = <b>27 requests</b>, each costing a check. This is why the response must say when to come back.</li>
</ul>`,
      design: `<p>Gateways enforce; a sharded in-memory store holds the counters; a config service holds the limits.</p>
<ol>
  <li><b>Algorithm.</b> A token bucket per (api_key, route class). Refill rate is 1,000 ÷ 60 = 16.7 tokens a second; capacity is the burst size, the limit itself if bursts are legitimate or smaller if the limit is protective. Tokens are stored as a value plus a last-refill time.</li>
  <li><b>Atomic check.</b> One server-side script does read, refill, decide and write in a single round trip. The two-step "increment, then set expiry" pattern is wrong, because a crash between them leaves a key that never expires. The script takes time from the store, not from the caller, so a skewed client clock cannot refill its own bucket. It returns <code>{allowed, remaining, retry_after_ms}</code>. The key expires after a full refill time (60 s) plus slack, so idle keys disappear.</li>
  <li><b>Sharding.</b> The gateway library picks the shard by consistent hash of the tenant id, so a key's bucket and its tenant's bucket sit on the same shard and one script checks both levels. One call enforces a per-key and a per-tenant limit at once. Each shard has a replica for failover. The cost is that one very large tenant puts all its traffic on one shard, so watch per-shard load and give such a tenant its own shard or a local-bucket tier.</li>
  <li><b>Request path.</b> The gateway looks up the key in a local denial cache. If it is marked denied until a time still in the future, it returns 429 immediately. Otherwise it makes one call with a 5 ms timeout. On deny, it returns 429 with <code>Retry-After</code> and rate limit headers, and caches the denial for the smaller of the retry time and 1 s.</li>
  <li><b>Config.</b> Limits per plan live in a config store. Gateways cache them for 30 s. Changing a limit alters bucket parameters, not bucket state. New limits start in <b>shadow mode</b>, logging what they would have rejected, before enforcement.</li>
</ol>
<p><b>Hard problem 1: three regions.</b> A global count is out because of the 70 to 90 ms round trip. Split the quota instead. Each region gets a share of each key's limit that sums to the whole: 333, 333 and 334 requests a minute by default. Every few seconds a rebalancer reads each region's recent use per key (published asynchronously) and shifts unused quota to regions that are rejecting, keeping a floor per region. The invariant is that shares always sum to the limit, so the global total cannot be exceeded except briefly during a shift. Compare the alternative of every region holding the full 1,000 and syncing counts: up to 3 × 1,000 = 3,000 requests can be admitted against a limit of 1,000 before the first sync lands.</p>
<p><b>Hard problem 2: the limiter is down.</b> Decide this before the outage. On timeout or error the gateway falls back to a local in-process bucket per key, sized at about twice the fair share (limit ÷ node count × 2), so protection continues with up to 2× looseness (a key whose traffic lands unevenly can be rejected early, which is the price of a fallback). Routes where abuse is costly, like login, password reset and SMS sending, fail closed. A circuit breaker stops the gateway from calling a sick shard at all, and the call is a single attempt with no retry, because retries at three layers would make the shard's problem 27 times worse.</p>
<p><b>Observability.</b> Count allowed and denied per key class, fail-open events, store latency, and keys that hit the limit repeatedly.</p>`,
      tradeoffs: `<ul>
  <li><b>Central counting versus local buckets with async sync.</b> Pick central, sharded counting for contractual limits, because it is exact and costs 0.5 ms in the same AZ. Flip to local buckets with periodic reconciliation when the extra round trip is not affordable or approximate enforcement is fine, accepting overshoot that grows with node count.</li>
  <li><b>Token bucket versus sliding window counter.</b> Pick the token bucket because bursts are legitimate and state is two numbers. Flip to a sliding window counter when the contract is strictly "N in any rolling minute" and a short burst is a violation.</li>
  <li><b>Fail open versus fail closed.</b> Pick fail open to a local bucket for general traffic, since a limiter outage should not be an API outage. Flip to fail closed for login and other abuse-sensitive routes, and say that you choose per route.</li>
  <li><b>Library in the gateway versus a separate limiter service.</b> Pick the library to save a network hop in a 2 ms budget. Flip to a service when gateways are written in many languages or the policy changes often enough to need one deploy point, and pay the extra 0.5 ms.</li>
</ul>`,
      followups: [
        "How do you rate limit by IP when millions of users sit behind a few NAT addresses?",
        "How would you charge different token costs to different routes with one bucket?",
        "A customer reports being limited at 600 requests a minute. How do you debug it?",
        "How do you roll out a lower limit for existing customers safely?",
        "What changes if the limit must be exactly enforced across regions for a premium tier?",
      ],
      slips: `<p>Mistakes to avoid on this question:</p>
<ul>
  <li>Doing "read the counter, compare, then write" in separate calls, which lets concurrent requests all pass.</li>
  <li>Incrementing and setting the expiry as two calls, so a crash leaves a key that never resets.</li>
  <li>Using each caller's clock to compute refills.</li>
  <li>Dividing the limit by the node count and calling it distributed, which punishes any user whose traffic lands unevenly.</li>
  <li>Never saying what happens when the store is down.</li>
  <li>Returning a bare 429 with no <code>Retry-After</code>, which invites the 27-fold retry storm.</li>
  <li>Putting a cross-region call on the request path.</li>
<li>Limiting only by IP, which blocks a whole office behind one address and misses an attacker with many.</li>
</ul>`,
    },
  },
  {
    id: "netflix-ad-frequency-capping",
    company: "netflix",
    title: "Design an ad frequency-capping system",
    prompt:
      "Design the system that makes sure a viewer is shown a given ad campaign at most 3 times a day and 10 times a week, across all their devices. It sits in the ad-selection path, which has a budget of about 10 ms, and must handle about 58,000 ad decisions a second at peak.",
    level: "L5 (Ads org)",
    kind: "hld",
    evidence: "several",
    sources: [
      {
        label: "PracHub: Netflix senior engineer onsite loop in the Ads org",
        url: "https://prachub.com/interview-experiences/netflix-senior-software-engineer-interview-experience-onsite-loop-in-the-ads-org-topo-sort-system-design-and-two-bqs",
        kind: "candidate-report",
        year: 2026,
      },
      {
        label: "Aced: Netflix senior software engineer interview (L5, Ads)",
        url: "https://www.aced.io/experiences/netflix-senior-software-engineer-interview-00080c",
        kind: "candidate-report",
      },
      {
        label: "System Design Handbook: Netflix system design interview",
        url: "https://www.systemdesignhandbook.com/guides/netflix-system-design-interview/",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: ["sysdes-rate-limiting", "sysdes-batch-stream-processing", "sysdes-caching-fundamentals"],
    answer: {
      ask: `<p>Clarifying questions. What identifies a viewer: an account, a profile, a device? What does a cap count: ads chosen, ads rendered, or ads watched? Are the windows calendar days and weeks, or rolling? Is the cap a hard promise to the advertiser, or best effort? Is a slight over-delivery or under-delivery worse? What do we do if the cap check is unavailable?</p>
<p><b>Assumed scope:</b> caps are per profile and per campaign, daily and weekly on calendar buckets, enforced when the ad is chosen, a hard-ish cap with small tolerated overshoot, 100 million viewers, 30 active campaigns per viewer, and a pod of up to three ads chosen together. Out of scope: campaign budget pacing, auction logic, targeting, and billing.</p>`,
      numbers: `<p>Planning figures for the exercise, not facts about any company.</p>
<ul>
  <li><b>Decisions:</b> 50 million viewers a day × 20 ad slots = 1 billion decisions ÷ 86,400 s = about <b>11,600 a second</b>; at a 5× peak, <b>58,000 a second</b>.</li>
  <li><b>Lookups:</b> if each decision has 20 candidate campaigns and we look up each cap separately, that is 58,000 × 20 = <b>1.16 million lookups a second</b>. One record per viewer holding every campaign's counters turns it into <b>58,000 reads a second</b>, 20 times fewer.</li>
  <li><b>Viewer record:</b> 30 campaigns × 16 B of counters (campaign id, day count, week count) = 480 B, about <b>600 B</b> with a short list of recent reservation ids. 100 million × 600 B = <b>60 GB</b>.</li>
  <li><b>Writes:</b> each decision reserves a slot (one write). Assume 5% of decisions never play and are refunded later, so 58,000 × 1.05 = about <b>61,000 writes a second</b>. At the 5,000-a-second planning figure, 61,000 ÷ 5,000 = 12.2, so use <b>16 shards</b>: about 3,800 writes a second each and 60 ÷ 16 = <b>3.75 GB</b> each.</li>
  <li><b>Latency:</b> a same-AZ round trip is 0.5 ms, so one call fits a 10 ms budget with room. A cross-region call at 70 to 90 ms does not, so the check happens in the viewer's region.</li>
  <li><b>Rolling windows:</b> a log of up to 10 timestamps at 8 B per campaign is 80 B, × 30 = 2.4 KB per viewer, 100 million × 2.4 KB = <b>240 GB</b>, 4 times the counter design.</li>
  <li><b>Retries:</b> 3 attempts over 3 layers is 27× load if the store slows, so the hot path makes one attempt.</li>
</ul>`,
      design: `<ol>
  <li><b>Identity.</b> Key everything by profile id, not device id, so a cap follows the viewer across a TV, a phone and a laptop. The decision request carries the profile id. Signed-out or unknown traffic falls back to a device id and gets a looser, separate cap.</li>
  <li><b>Store.</b> A sharded key-value store, 16 shards by <code>hash(profile_id)</code>. One record per profile: for each campaign, <code>{day_bucket, day_count, week_bucket, week_count}</code>, plus a short list of recent reservation ids with expiry times. A viewer's whole record is on one shard, so a decision touches one shard. The record has a TTL of 8 days idle, because nothing in it matters after the longest window.</li>
  <li><b>Lazy reset.</b> The bucket label (for example <code>2026-10-19</code> and <code>2026-W43</code>) is stored beside the count. If the label differs from the current one, the count is treated as zero and overwritten on the next write. No midnight job is needed.</li>
  <li><b>Campaign rules.</b> The cap values (3 a day, 10 a week) are campaign metadata, cached in the decision service for about a minute. They change rarely and are not stored per viewer.</li>
  <li><b>Decision path.</b> The decision service gets candidates from targeting, then reads the viewer record in one call and drops every candidate that is at its cap. The auction then picks winners for the pod.</li>
  <li><b>Reserve.</b> For the chosen campaigns, one atomic script on that shard re-checks <code>count &lt; cap</code> for each and increments, recording a reservation id with a 2-minute expiry. If a campaign fails the re-check because another decision for the same viewer just took the slot, the service falls back to the next-best candidate once. This closes the race where two concurrent decisions both read 2 of 3 and both serve.</li>
  <li><b>Refund.</b> The player sends an impression beacon with the reservation id to an event log. A stream job joins decisions to beacons; a reservation without a beacon after a timeout shorter than the reservation's 2-minute expiry is refunded with a decrement, applied once per reservation id. About 5% of reservations take this path.</li>
</ol>
<p><b>Why count at decision time.</b> The next decision for the same viewer may come seconds later, long before any beacon is processed. Counting at the moment of choice means it sees the previous choice. The refund repairs the cases where counting early was wrong.</p>
<p><b>Hard problem 1: failure.</b> The store call has a 5 ms timeout and one attempt. On failure, fail open: serve the ad without a cap check, and emit a metric for every uncapped decision, because that is over-delivery you owe someone an explanation for. A circuit breaker stops calling a sick shard. The alternative, serving no ads, loses revenue and is worse for most campaigns.</p>
<p><b>Hard problem 2: regions and travel.</b> Each viewer has a home region, and the cap store is regional. A viewer using the service abroad is served by a nearby region; reading their home record would cost 70 to 90 ms, so the system either uses an asynchronously replicated copy and accepts small over-delivery, or pins decisions to the home region if the budget allows.</p>
<p><b>Rebuild.</b> The decision and beacon logs are the source of truth. After a store loss, load the last snapshot and replay the log tail.</p>`,
      tradeoffs: `<ul>
  <li><b>Count at decision versus count at impression.</b> Pick decision-time with a refund, because rapid back-to-back decisions see each other. Flip to impression-time counting when advertisers insist that only rendered ads count and over-delivery risk is tolerable.</li>
  <li><b>Atomic reserve versus check then write.</b> Pick the atomic script: it lives on one shard anyway and removes the double-serve race. Flip to plain check-then-write only if a small overshoot is acceptable and the script's cost becomes the bottleneck.</li>
  <li><b>Fail open versus fail closed.</b> Pick fail open for revenue, with a metric and an alert on uncapped decisions. Flip to fail closed for campaigns with a contractual hard cap, or serve only those campaigns that have no cap.</li>
  <li><b>Calendar buckets versus rolling windows.</b> Pick calendar: 60 GB against 240 GB, with a lazy reset. Flip to rolling when the contract says "in any 24 hours", and pay 4 times the state.</li>
  <li><b>One record per viewer versus one key per campaign.</b> Pick one record: one read, one shard, 58,000 reads a second instead of 1.16 million. Flip if a viewer's record grows beyond a few KB.</li>
</ul>`,
      followups: [
        "How do you handle a viewer's cap when the day boundary depends on their time zone?",
        "A campaign's cap is changed from 3 to 2 mid-day. What happens to viewers who already saw 3?",
        "How would you reconcile the cap store with the billing system's impression counts?",
        "How do you test that the cap holds under concurrent decisions for the same viewer?",
        "What would you change if the cap were also per advertiser across all of their campaigns?",
      ],
      slips: `<p>Mistakes to watch for:</p>
<ul>
  <li>Keying by device id, so a viewer on three devices sees the ad nine times.</li>
  <li>One lookup per candidate campaign, which multiplies load by the candidate count.</li>
  <li>Read-then-write without an atomic reserve, so concurrent pod decisions overshoot.</li>
  <li>Counting only when the beacon arrives, so the next decision does not see this one.</li>
  <li>Scheduling a nightly job to reset counters instead of stamping a bucket label.</li>
  <li>Retrying the store call at several layers when it is slow.</li>
  <li>Leaving the failure policy unsaid, then being asked "what if the store is down?" with no answer.</li>
  <li>Forgetting that a refund must be idempotent too.</li>
</ul>`,
    },
  },
];
