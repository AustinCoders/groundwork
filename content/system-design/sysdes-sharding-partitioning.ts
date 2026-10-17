import type { Chapter } from "../types";

export const sysdesShardingPartitioning: Chapter = {
  id: "sysdes-sharding-partitioning",
  num: "A4",
  title: "Sharding & partitioning at scale",
  short: "Sharding at scale",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "One machine is a limit, not a bug — but the shard key you pick in week one is the decision you will still be paying for in year five.",
  body: `<h3>The wall you hit, and the things to try before sharding</h3>
<p>
  Sharding is splitting one logical dataset across many independent
  databases so that no single machine holds it all. It is the most powerful
  scaling tool you have and the most expensive, because it takes away
  things you have relied on your whole career: joins, transactions, unique
  constraints, and <code>ORDER BY</code> across the whole table. The senior
  answer to "how would you scale the database?" starts by <em>not</em>
  sharding.
</p>
<table>
  <tr><th>Do this first</th><th>Buys you</th><th>Runs out when…</th></tr>
  <tr><td>Vertical scaling</td><td>The biggest cloud boxes reach 896 vCPU and 32 TiB of RAM (AWS u7in-32tb). As conservative planning figures, one relational primary on NVMe with a warm cache handles about 20,000 simple indexed point reads/sec and 5,000 committed writes/sec. These are not limits: strong hardware with batching and group commit does several times more (100,000+ reads/sec and 20,000–50,000 writes/sec are reported), and OpenAI runs ChatGPT on one Azure PostgreSQL primary plus about 50 read replicas at millions of aggregate queries per second, while moving shardable write-heavy workloads elsewhere. Rule of thumb: start planning a change when sustained reads pass ~20k/s (cache, replicas) or sustained writes pass ~5k/s (partitioning or a queue), and treat 20k+ sustained writes as "you are sharding or queueing now". Measure, do not assume.</td><td>Price becomes superlinear, and the single-writer ceiling is fixed no matter how big the box is.</td></tr>
  <tr><td>Read replicas</td><td>Scales reads ~linearly. Five replicas, five times the read capacity.</td><td>Writes still all land on one primary. Replication lag becomes a correctness problem for read-your-writes.</td></tr>
  <tr><td>Caching (see the caching chapter)</td><td>Can remove most reads for skewed workloads (a planning figure is 80–95% of reads, at well under 1 ms per hit). Measure your own hit rate.</td><td>The write path and cache-miss path are unchanged; a cold cache now takes the DB down.</td></tr>
  <tr><td>Archiving cold rows / table partitioning on one host</td><td>Keeps the hot working set in RAM. Postgres declarative partitioning lets queries prune to the hot partitions and makes dropping old data a cheap metadata operation. How much it speeds up reads depends entirely on the workload; measure before promising a number.</td><td>The <em>hot</em> set alone exceeds RAM, or write throughput exceeds one primary.</td></tr>
</table>
<p>
  You shard when one of three things is true: the working set no longer
  fits in RAM on the biggest box you're willing to pay for; write
  throughput exceeds what one primary can commit; or the blast radius has
  become unacceptable (a single 8 TB database takes hours to restore, and
  during those hours every customer is down).
</p>

<h3>Vertical vs horizontal partitioning</h3>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="On the left, vertical partitioning splits a table by columns into a hot narrow store and a cold wide store; on the right, horizontal partitioning splits the same table by rows into three shards covering different user id ranges">
    <g class="rough">
      <rect class="box"  x="30"  y="70"  width="110" height="118" rx="6" />
      <rect class="boxy" x="160" y="70"  width="110" height="118" rx="6" />
      <rect class="box"  x="370" y="70"  width="240" height="36"  rx="6" />
      <rect class="boxy" x="370" y="112" width="240" height="36"  rx="6" />
      <rect class="boxg" x="370" y="154" width="240" height="36"  rx="6" />
    </g>
    <text class="lbl" x="150" y="42" text-anchor="middle">vertical — split by column</text>
    <text class="lbl" x="490" y="42" text-anchor="middle">horizontal — split by row</text>
    <text class="sm" x="85"  y="120" text-anchor="middle">id, email,</text>
    <text class="sm" x="85"  y="138" text-anchor="middle">name, tier</text>
    <text class="sm" x="85"  y="164" text-anchor="middle">hot, narrow</text>
    <text class="sm" x="215" y="120" text-anchor="middle">avatar_blob,</text>
    <text class="sm" x="215" y="138" text-anchor="middle">bio, prefs_json</text>
    <text class="sm" x="215" y="164" text-anchor="middle">cold, wide</text>
    <text class="sm" x="490" y="93"  text-anchor="middle">shard 0 — users 0 … 1M</text>
    <text class="sm" x="490" y="135" text-anchor="middle">shard 1 — users 1M … 2M</text>
    <text class="sm" x="490" y="177" text-anchor="middle">shard 2 — users 2M … 3M</text>
    <text class="sm" x="150" y="218" text-anchor="middle">same rows, fewer columns each</text>
    <text class="sm" x="490" y="218" text-anchor="middle">same columns, fewer rows each</text>
  </svg>
  <figcaption>Vertical partitioning shrinks the row so more rows fit in a page and in RAM; horizontal partitioning is the only one that removes the single-machine ceiling.</figcaption>
</figure>
<p>
  <b>Vertical partitioning</b> splits a table by column — move rarely read
  wide columns out to a separate table or store so the hot row stays small
  and many rows fit in each page of RAM. Note that Postgres (TOAST) and
  InnoDB already move very large values off-row automatically, so the gain
  comes mostly from mid-sized columns (hundreds of bytes to a few KB) that
  bloat every page; the rows-per-page improvement is whatever the ratio of
  hot to cold bytes works out to. It is cheap and reversible. Taken to its extreme across
  services it becomes "each service owns its own database", which is the
  microservices decomposition, not a scaling technique. It never removes
  the write ceiling, because the hot table still lives on one machine.
</p>
<p>
  <b>Horizontal partitioning (sharding)</b> splits by row. Every shard has
  the identical schema and a disjoint subset of rows. This is the one that
  scales writes, and everything difficult in this chapter follows from it.
</p>

<h3>Shard key selection: the decision you cannot take back</h3>
<p>
  The shard key determines which shard a row lives on. It is embedded in
  your routing layer, your access patterns, your operational tooling, and —
  because most systems put it in the primary key — often in the IDs your
  customers have already saved in bookmarks and integrations. Changing it
  means physically moving every row while the system stays online. Plan for
  weeks, and treat this as the single highest-stakes call in the design.
</p>
<table>
  <tr><th>Property the key must have</th><th>Why</th></tr>
  <tr><td><b>High cardinality</b></td><td>You can never have more shards than distinct key values. Sharding by <code>country</code> caps you at ~200 shards and half your traffic is in three of them.</td></tr>
  <tr><td><b>Even access distribution</b></td><td>Even <em>data</em> distribution is not enough — a shard holding 1/8 of the rows but 60% of the QPS is still a hot shard.</td></tr>
  <tr><td><b>Immutable</b></td><td>If the key can change, a row must be deleted from one shard and inserted into another: not atomic, breaks foreign keys, and invalidates any ID derived from it.</td></tr>
  <tr><td><b>Present in the majority of queries</b></td><td>A query without the shard key must be broadcast to every shard. If 90% of your reads lack the key, you have built a distributed full scan.</td></tr>
  <tr><td><b>Aligned with your transaction boundary</b></td><td>If the rows that must change atomically share a shard key, transactions stay single-shard and you never need two-phase commit.</td></tr>
</table>
<table>
  <tr><th>Key</th><th>Verdict</th><th>Why</th></tr>
  <tr><td><code>user_id</code> for a social/consumer app</td><td>Good</td><td>High cardinality, immutable, and nearly every read is "everything for this user" — timeline, settings, orders. Transactions naturally stay local.</td></tr>
  <tr><td><code>tenant_id</code> for B2B SaaS</td><td>Good</td><td>Every query already filters by tenant; it gives you free per-customer isolation, per-customer backup/restore, and the ability to move a whale onto its own hardware.</td></tr>
  <tr><td><code>conversation_id</code> for chat</td><td>Good</td><td>The unit of read is a conversation. Sharding by <code>user_id</code> instead would put the two sides of a DM on different shards and make every message a cross-shard write.</td></tr>
  <tr><td>hash of <code>(device_id, day)</code> for telemetry</td><td>Good</td><td>Spreads writes, keeps a device's day contiguous for the common query, and lets you drop whole days by dropping partitions.</td></tr>
  <tr><td>Auto-increment <code>id</code> or <code>created_at</code>, range-partitioned</td><td><b>Catastrophic</b></td><td>Every insert goes to the newest shard forever. You have N shards and one of them is doing 100% of the writes. This is the single most common sharding mistake.</td></tr>
  <tr><td><code>status</code>, <code>country</code>, <code>is_active</code></td><td><b>Catastrophic</b></td><td>Low cardinality and Zipfian distribution. Hard ceiling on shard count and guaranteed skew.</td></tr>
  <tr><td>A mutable attribute (<code>current_plan</code>, <code>region</code>)</td><td><b>Catastrophic</b></td><td>An upgrade from free to pro physically relocates the row. Non-atomic, and every cached reference to its location is now wrong.</td></tr>
  <tr><td><code>user_id</code> when 90% of reads are by <code>order_id</code></td><td><b>Catastrophic</b></td><td>The key is correct in isolation and wrong for the workload: nearly every read becomes a scatter-gather. Always check the key against the <em>read</em> patterns, not just the write ones.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Do not pick the key before you have listed the queries</span>
  Candidates announce "I'll shard by user ID" thirty seconds into the
  design. Write the top five queries by volume on the board <em>first</em>,
  then pick the key that keeps the most of them single-shard, then name
  explicitly which queries you have just made expensive. That sequence is
  the entire signal.
</div>

<h3>Range vs hash vs directory</h3>
<table>
  <tr><th>Strategy</th><th>How it routes</th><th>Wins</th><th>Loses</th><th>Reach for it when…</th></tr>
  <tr><td><b>Range</b></td><td>Sorted key space cut into contiguous intervals; a metadata service maps interval → shard.</td><td>Range scans and ordered pagination are one shard. Splits are cheap — cut a hot range in half (systems like Spanner, CockroachDB, HBase and Vitess split and merge ranges online).</td><td>Sequential keys create a permanent hotspot on the newest range.</td><td>You need ordered scans: time-series reads, "next 50 rows after X". HBase, Bigtable, Spanner, CockroachDB, MongoDB ranged sharding.</td></tr>
  <tr><td><b>Hash</b></td><td><code>shard = hash(key) mod N</code>, or a token on a consistent-hashing ring.</td><td>Near-perfect distribution with no thought. Routing is a pure function — no lookup hop.</td><td>Range scans are dead (adjacent keys are on different shards). Naive <code>mod N</code> makes resizing catastrophic.</td><td>Point lookups dominate and you want zero routing state. Cassandra (Murmur3 token), DynamoDB partition key, Vitess hash vindex.</td></tr>
  <tr><td><b>Directory / lookup</b></td><td>An explicit key → shard map held in a coordination service, cached at the client.</td><td>Total control: move one noisy tenant to dedicated hardware with a single row update. Heterogeneous shard sizes are fine.</td><td>An extra hop, and the directory becomes a critical HA dependency. A stale cached map routes writes to the wrong shard — you need versioning and a redirect.</td><td>B2B SaaS with wildly uneven tenants, or any time "give this customer its own database" is a product requirement. Vitess-style keyspaces, and how most large multi-tenant apps actually work.</td></tr>
</table>
<p class="sub">
  These compose. Cassandra hashes the partition key onto a ring and then
  <em>range</em>-orders rows inside the partition by clustering key —
  which is exactly why "hash of device, range on time" is the canonical
  time-series schema. DynamoDB is the same idea with different words:
  partition key hashes, sort key ranges.
</p>

<h3>Consistent hashing, and why virtual nodes are the real trick</h3>
<p>
  The problem with <code>hash(key) mod N</code> is resizing. Go from 10
  shards to 11 and about 90% of keys change owner — every cache is cold,
  every row moves, and you cannot do it online. Consistent hashing fixes
  this by hashing both keys and nodes onto the same circular space
  (typically 2<sup>64</sup> or 2<sup>32</sup> points). A key belongs to the
  first node found by walking clockwise. Adding an (N+1)th node moves only
  about 1/(N+1) of the keys. With one point per node they all come from its
  immediate clockwise successor; with virtual nodes (below) they come in
  small slices from many nodes.
</p>
<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="A consistent hashing ring with twelve virtual nodes belonging to three physical nodes A, B and C interleaved around the circle, showing a key hashing to a point on the ring and walking clockwise to the next virtual node">
    <g class="rough">
      <path class="ln dash" d="M200,60 A100,100 0 1,1 199,60.01" />
      <path class="lnr" d="M296,134 A100,100 0 0,1 300,160" />
      <path class="lnr dash" d="M330,120 L302,131" />
    </g>
    <g class="rough">
      <circle class="box"  cx="200" cy="60"  r="16" />
      <circle class="boxy" cx="250" cy="73"  r="16" />
      <circle class="boxg" cx="287" cy="110" r="16" />
      <circle class="box"  cx="300" cy="160" r="16" />
      <circle class="boxy" cx="287" cy="210" r="16" />
      <circle class="boxg" cx="250" cy="247" r="16" />
      <circle class="box"  cx="200" cy="260" r="16" />
      <circle class="boxy" cx="150" cy="247" r="16" />
      <circle class="boxg" cx="113" cy="210" r="16" />
      <circle class="box"  cx="100" cy="160" r="16" />
      <circle class="boxy" cx="113" cy="110" r="16" />
      <circle class="boxg" cx="150" cy="73"  r="16" />
    </g>
    <text class="sm" x="200" y="65"  text-anchor="middle">A1</text>
    <text class="sm" x="250" y="78"  text-anchor="middle">B1</text>
    <text class="sm" x="287" y="115" text-anchor="middle">C1</text>
    <text class="sm" x="300" y="165" text-anchor="middle">A2</text>
    <text class="sm" x="287" y="215" text-anchor="middle">B2</text>
    <text class="sm" x="250" y="252" text-anchor="middle">C2</text>
    <text class="sm" x="200" y="265" text-anchor="middle">A3</text>
    <text class="sm" x="150" y="252" text-anchor="middle">B3</text>
    <text class="sm" x="113" y="215" text-anchor="middle">C3</text>
    <text class="sm" x="100" y="165" text-anchor="middle">A4</text>
    <text class="sm" x="113" y="115" text-anchor="middle">B4</text>
    <text class="sm" x="150" y="78"  text-anchor="middle">C4</text>
    <text class="sm rd" x="336" y="115">key k lands here</text>
    <text class="lbl" x="400" y="70">3 physical nodes: A, B, C</text>
    <text class="sm"  x="400" y="94">each owns 4 virtual nodes,</text>
    <text class="sm"  x="400" y="112">interleaved around the ring</text>
    <text class="sm rd" x="400" y="146">a key walks clockwise to the</text>
    <text class="sm rd" x="400" y="164">next vnode — here, A2 → node A</text>
    <text class="sm gr" x="400" y="200">remove B and only B&#39;s four arcs</text>
    <text class="sm gr" x="400" y="218">move — split between A and C,</text>
    <text class="sm gr" x="400" y="236">refilled from both in parallel</text>
    <text class="sm" x="400" y="272">without vnodes, B&#39;s entire range</text>
    <text class="sm" x="400" y="290">would land on one unlucky neighbour</text>
  </svg>
  <figcaption>Virtual nodes are what make removal survivable: the departing node's load is spread over every survivor instead of doubling one neighbour.</figcaption>
</figure>
<p>
  Plain consistent hashing with one point per node has two flaws. Random
  placement of 10 points on a circle gives wildly uneven arcs — in
  expectation the largest arc is about 2.9× the mean and the smallest about
  0.1×, a spread of roughly 30× between the luckiest and unluckiest node. And when a node dies, its <em>entire</em> range
  falls on its single clockwise successor, which promptly gets double load
  and often dies too. Virtual nodes fix both: give each physical node V
  positions on the ring (deployments commonly use tens to a few hundred; Cassandra's
  <code>num_tokens</code> defaulted to 256 historically and 16 in modern
  versions with the token allocation algorithm). Load variance shrinks
  roughly as 1/√V, and a departing node's data is refilled from every
  survivor in parallel. As a bonus, a machine with twice the RAM simply
  gets twice the vnodes.
</p>
<pre><code><span class="c">// Ring = sorted array of {token, node}. Lookup is a binary search, O(log n).</span>
function buildRing(nodes, vnodesPerNode) {
  const ring = [];
  for (const node of nodes) {
    for (let v = 0; v &lt; vnodesPerNode; v++) {
      ring.push({ token: hash64(node.id + "#" + v), node }); <span class="c">// deterministic vnode positions</span>
    }
  }
  return ring.sort((a, b) =&gt; (a.token &lt; b.token ? -1 : 1));
}

function lookup(ring, key) {
  const h = hash64(key);
  let lo = 0, hi = ring.length - 1;
  while (lo &lt; hi) {                       <span class="c">// first token &gt;= h</span>
    const mid = (lo + hi) &gt;&gt; 1;
    if (ring[mid].token &lt; h) lo = mid + 1; else hi = mid;
  }
  return ring[ring[lo].token &lt; h ? 0 : lo].node; <span class="c">// wrap past the end of the ring</span>
}</code></pre>
<p class="sub">
  For replication factor 3, you do not take the next three vnodes — you
  walk clockwise until you have three <em>distinct physical nodes</em>, and
  ideally three distinct racks or AZs. Forgetting that is how people end up
  with all three replicas of a key on one machine.
</p>

<p>
  Consistent hashing with vnodes is not the only way to avoid the
  <code>mod N</code> reshuffle. <b>Rendezvous (highest-random-weight)
  hashing</b> scores every node against the key and picks the highest, so
  removing a node moves only that node's keys and there is no ring to
  maintain, at O(N) cost per lookup. <b>Jump consistent hash</b> maps a key
  to one of N numbered buckets in O(log N) with no memory, but buckets can
  only be added or removed at the end, which suits caches and sharded
  stores that grow, not clusters where an arbitrary node dies.
  <b>Bounded-load consistent hashing</b> caps each node at a multiple of the
  average load and spills the excess to the next node, which tames hot nodes
  in a cache fleet. All of these decide placement of keys; none helps with one
  key that is itself too hot.
</p>
<p>
  Separately, someone has to answer "which shard holds this key?" at request
  time. There are three common shapes: the client sends to any node, which
  forwards (Cassandra, Dynamo); a routing tier looks the key up in the shard
  map and proxies (Vitess vtgate, mongos); or a shard-aware client library
  caches the map and talks directly (Redis Cluster clients, Kafka producers),
  refreshing on a redirect. Whatever you choose, the shard map is the thing
  that needs a coordination service and versioning. Related placement tools:
  geo-partitioning pins a row to the region of its owner for latency and data
  residency, and co-located or interleaved tables keep a parent and its
  children on the same shard so joins and transactions stay local.
</p>

<h4>Dry run: a 3-node ring with 4 vnodes each (positions 0–999, chosen for illustration), then removing node B</h4>
<table>
  <tr><th>Vnode</th><th>Position</th><th>Arc it owns (previous position, this one]</th><th>Size</th></tr>
  <tr><td>A3</td><td>49</td><td>(931, 49] — wraps past 999</td><td>118</td></tr>
  <tr><td>A2</td><td>100</td><td>(49, 100]</td><td>51</td></tr>
  <tr><td>A0</td><td>134</td><td>(100, 134]</td><td>34</td></tr>
  <tr><td>C1</td><td>283</td><td>(134, 283]</td><td>149</td></tr>
  <tr><td>C2</td><td>331</td><td>(283, 331]</td><td>48</td></tr>
  <tr><td>B2</td><td>434</td><td>(331, 434]</td><td>103</td></tr>
  <tr><td>B1</td><td>659</td><td>(434, 659]</td><td>225</td></tr>
  <tr><td>C3</td><td>724</td><td>(659, 724]</td><td>65</td></tr>
  <tr><td>B0</td><td>738</td><td>(724, 738]</td><td>14</td></tr>
  <tr><td>B3</td><td>832</td><td>(738, 832]</td><td>94</td></tr>
  <tr><td>A1</td><td>927</td><td>(832, 927]</td><td>95</td></tr>
  <tr><td>C0</td><td>931</td><td>(927, 931]</td><td>4</td></tr>
</table>
<p class="sub">
  Node shares before any removal: A owns 118 + 51 + 34 + 95 = 298 of 1000
  (29.8%), B owns 103 + 225 + 14 + 94 = 436 (43.6%), C owns 149 + 48 + 65 + 4
  = 266 (26.6%). With only four vnodes each the split is visibly lumpy, which
  is the 1/√V effect in action. Two real keys (MD5 of the key string, mod
  1000) pinned to that ring: <code>hash("user:7") = 559</code> falls in B1's
  arc (434, 659], served by node B. <code>hash("order:39") = 982</code> falls
  in A3's wraparound arc (931, 49], served by node A.
</p>
<table>
  <tr><th>B's arc before removal</th><th>New owner after B leaves the ring</th></tr>
  <tr><td>(331, 434] — was B2</td><td>C3 @ 724</td></tr>
  <tr><td>(434, 659] — was B1</td><td>C3 @ 724</td></tr>
  <tr><td>(724, 738] — was B0</td><td>A1 @ 927</td></tr>
  <tr><td>(738, 832] — was B3</td><td>A1 @ 927</td></tr>
</table>
<p class="sub">
  B owned 436 of 1000 positions. After it leaves, C3 absorbs 103 + 225 = 328
  of them (75%) and A1 absorbs 14 + 94 = 108 (25%), so B's data lands on two
  nodes instead of one neighbour. The final shares are A 40.6% and C 59.4%
  (A 298 + 108 = 406; C 266 + 328 = 594). That is better than dumping all of
  B on one successor, but the 75/25 split shows the limit of four vnodes: with
  128 or more per node each survivor would take close to an equal slice.
  <code>user:7</code> (hash 559), previously on B1, now resolves to C3's
  expanded arc (331, 724] and moves to node C; every key owned by A or C
  before the removal stays where it was.
</p>

<h3>Hot shards and the celebrity problem</h3>
<p>
  Real access distributions are heavily skewed (Zipfian): in many
  workloads a tiny fraction of keys carries a large share of the traffic
  (illustratively, tens of percent from the top fraction of a percent). Hashing gives you an even spread of <em>keys</em>,
  not of <em>requests</em>. One artist with 80 million followers, one
  enterprise tenant with 200× the average volume, or one viral post will
  saturate a single shard while the other 63 idle — and you cannot fix it
  by adding shards, because the unit of load is a single key.
</p>
<table>
  <tr><th>Mitigation</th><th>Mechanism</th><th>Cost</th></tr>
  <tr><td><b>Cache the hot key</b></td><td>By definition a hot key has a ~99% hit rate. Put it in Redis or even in-process, and add request coalescing so a miss doesn't stampede.</td><td>Staleness, and a cold-cache event now hits the hot shard even harder. Do this first anyway — it is the cheapest 10×.</td></tr>
  <tr><td><b>Key salting</b></td><td>Write to <code>celeb:42#0 … celeb:42#31</code> and read by fanning out to all 32. Spreads one logical key over 32 shards.</td><td>Every read becomes 32 reads. Only apply it to keys detected as hot at runtime, never uniformly — otherwise you have made the average case 32× worse to fix the p99.9.</td></tr>
  <tr><td><b>Dedicated shard</b></td><td>Directory partitioning moves the whale onto its own hardware with one map update.</td><td>Operational sprawl and a manual placement decision — but it is what large B2B SaaS actually does, and it is why the directory strategy earns its extra hop.</td></tr>
  <tr><td><b>Change the data model</b></td><td>The celebrity's followers stop being a fan-out-on-write problem: push to normal users, and let followers of the celebrity pull her posts at read time and merge.</td><td>A hybrid read path. This is the well-known Twitter timeline answer and it is a modelling fix, not an infrastructure fix — usually the strongest one available.</td></tr>
  <tr><td><b>Managed adaptive capacity</b></td><td>DynamoDB will isolate and split a hot partition automatically.</td><td>Still bounded by hard per-partition limits (about 3,000 read and 1,000 write units per second). A single key that exceeds this cannot be saved by the platform.</td></tr>
</table>

<h3>What sharding costs you</h3>
<table>
  <tr><th>What you lose</th><th>What you do instead</th></tr>
  <tr><td><b>Cross-shard joins</b></td><td>Application-side joins (fetch IDs, then batch-fetch by shard — never row by row, or you have built an N+1 over the network), or denormalize the joined columns into the child row and accept the update cost.</td></tr>
  <tr><td><b>Cross-shard transactions</b></td><td>Two-phase commit works but adds a coordinator, blocks if the coordinator dies mid-commit, and adds durable prepare and commit round trips while holding locks, so a distributed commit typically costs a small multiple of a single-shard commit (measure it). The alternatives are sagas with explicit compensating actions, or — far better — choosing a shard key that keeps transactions single-shard in the first place.</td></tr>
  <tr><td><b>Global unique constraints</b></td><td>The database can only enforce uniqueness within a shard. Generate IDs that are unique without coordination: UUIDs (random, with negligible collision probability) or Snowflake-style IDs (deterministic: timestamp, worker ID and sequence). That only covers surrogate IDs. Business keys such as email still need a small dedicated uniqueness table (email → user_id) that is itself sharded by the constrained column.</td></tr>
  <tr><td><b>Cheap secondary indexes</b></td><td><b>Local index:</b> lives on each shard, cheap to write, but a lookup by that column must scatter-gather across all shards. <b>Global index:</b> a separate table sharded by the indexed column — one hop to read, but writing it is a cross-shard write, which is why it is maintained asynchronously and why DynamoDB's Global Secondary Indexes are eventually consistent.</td></tr>
  <tr><td><b>Cheap <code>ORDER BY</code> / <code>LIMIT</code> / <code>COUNT</code></b></td><td>Top-K across shards needs each shard to return its own top K and the router to merge. Deep offset pagination is pathological — use keyset ("seek") pagination on a sortable cursor instead.</td></tr>
</table>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A query router fanning a single read out to four shards, with one slow shard shown in red, illustrating that the overall latency equals the slowest shard's latency">
    <g class="rough">
      <path class="ln" d="M110,110 L160,110" />
      <path class="ln"  d="M260,100 L300,42" />
      <path class="ln"  d="M260,106 L300,90" />
      <path class="lnr" d="M260,116 L300,140" />
      <path class="ln"  d="M260,122 L300,190" />
    </g>
    <g class="rough">
      <rect class="box"  x="20"  y="88"  width="90"  height="44" rx="6" />
      <rect class="boxy" x="160" y="88"  width="100" height="44" rx="6" />
      <rect class="box"  x="300" y="24"  width="100" height="36" rx="6" />
      <rect class="box"  x="300" y="72"  width="100" height="36" rx="6" />
      <rect class="boxr" x="300" y="120" width="100" height="36" rx="6" />
      <rect class="box"  x="300" y="168" width="100" height="36" rx="6" />
    </g>
    <text class="lbl" x="65"  y="116" text-anchor="middle">client</text>
    <text class="lbl" x="210" y="116" text-anchor="middle">router</text>
    <text class="sm" x="350" y="46"  text-anchor="middle">shard 0 — 8 ms</text>
    <text class="sm" x="350" y="94"  text-anchor="middle">shard 1 — 11 ms</text>
    <text class="sm rd" x="350" y="142" text-anchor="middle">shard 2 — 240 ms</text>
    <text class="sm" x="350" y="190" text-anchor="middle">shard 3 — 9 ms</text>
    <text class="lbl rd" x="420" y="100">answer arrives at 240 ms</text>
    <text class="sm" x="420" y="126">with 100 shards each 1% likely</text>
    <text class="sm" x="420" y="144">to be slow, ~63% of queries</text>
    <text class="sm" x="420" y="162">hit at least one straggler</text>
    <text class="sm gr" x="420" y="192">fix: hedged requests after p95</text>
  </svg>
  <figcaption>Tail latency amplification: a fan-out read inherits the worst p99 in the fleet, so scatter-gather designs need hedging, per-shard deadlines, or a data model that avoids the fan-out.</figcaption>
</figure>

<h3>Re-sharding a live system</h3>
<p>
  Everything above is why the shard key is irreversible in practice — but
  "irreversible" means expensive, not impossible, and being able to walk
  the migration is a strong staff-level signal.
</p>
<ul>
  <li><b>1. Stand up the new topology</b> alongside the old. Nothing reads from it.</li>
  <li><b>2. Backfill</b> historical rows in throttled chunks, watching replication lag and IO on the source. For a multi-TB table this runs for days; make it resumable and idempotent.</li>
  <li><b>3. Keep the new side in sync</b> while the old one remains the source of truth. The safer default is change data capture: tail the old database's WAL or binlog and apply it to the new topology, so there is one writer and an ordered stream. An application-level dual-write is not atomic (one side can succeed while the other fails), so if you do it — Notion did, with an audit log and a catch-up script replaying missed writes — build in reconciliation.</li>
  <li><b>4. Shadow-read and diff:</b> serve from old, also read from new, compare, emit a mismatch counter. You want a full day at zero mismatches before proceeding. This step is the one people skip and the one that catches the bugs.</li>
  <li><b>5. Flip reads gradually</b> — 1% of tenants, then 10%, then 50% — with an instant rollback that requires no deploy.</li>
  <li><b>6. Flip the source of truth</b>, keep dual-writing for a week as your undo button, then stop and drop the old topology.</li>
</ul>
<div class="sticky mint">
  <span class="ttl">Design so you never have to do that again</span>
  Choose a large fixed number of <b>logical</b> shards up front — 1,024 or
  4,096 — and map many logical shards onto each physical machine. Growing
  the cluster then means <em>moving whole logical shards</em>, never
  rehashing a single key: the shard key and the routing function never
  change, only the placement map does. Notion did exactly this: 480 logical
  shards across 32 Postgres databases, routed in the application, with no
  Vitess. Designing Data-Intensive Applications lists this fixed partition count as
  the simple strategy. The alternative is dynamic
  splitting, used by Vitess, HBase, Spanner and CockroachDB: each shard owns a
  range of the key space and is split or merged online as it grows, which
  adapts without a guess at the right count but needs split-and-merge
  machinery. Either way, the irreversible decision above becomes a routine
  capacity operation.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll shard by tenant ID into
  4,096 logical shards placed on 16 physical Postgres hosts, with a
  directory in etcd mapping logical shard to host. Tenant ID is in
  essentially every query, so reads and transactions stay single-shard, and
  when a tenant outgrows shared hardware I move its logical shards to
  dedicated hosts by updating one row in the directory — no rehashing, no
  ID changes."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The numbers force it: estimate data volume and write throughput out loud. "500M users × 2 KB = 1 TB, at 50k writes/sec" is the sentence that justifies sharding without you having to assert it.</li>
  <li>A naive design says "we'll add read replicas". Replicas never scale writes — if the prompt's bottleneck is write throughput or dataset size, replicas are the wrong tool and saying why earns the point.</li>
  <li>The prompt mentions a skewed population — celebrities, whale tenants, viral content, one huge customer. That is a hot-shard question wearing a costume; go straight to caching, salting, or dedicated placement.</li>
  <li>Distinguish from replication: replication makes copies of the same data for availability and read scale; partitioning splits different data for write scale and capacity. Real systems do both, and every shard is itself a replica set.</li>
  <li>The moment you name a shard key, immediately name the query it breaks and how you'll serve that query anyway (global index, denormalized copy, or search engine). Volunteering the downside is the difference between L5 and L6.</li>
  <li>Never propose <code>hash(key) mod N</code> without saying what happens when N changes — consistent hashing with vnodes, or fixed logical shards, are the two acceptable answers.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Given a candidate shard key, check it against all five required properties — cardinality, access distribution, immutability, query coverage, transaction alignment — and say which ones it fails.</li>
    <li>Explain why <code>hash(key) mod N</code> breaks under resizing, and how consistent hashing with virtual nodes fixes it, including why load variance shrinks as vnode count V grows.</li>
    <li>Trace, by hand, which surviving nodes absorb a failed node's arcs on a small consistent-hashing ring — and explain why that split, not a single overloaded neighbor, is what vnodes buy you.</li>
    <li>Name at least two mitigations for a hot shard caused by one celebrity key, and say which to reach for first and why.</li>
    <li>Explain why choosing a large fixed number of logical shards up front means you never have to rehash a key again when the cluster grows.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://openai.com/index/scaling-postgresql/" rel="noopener noreferrer">OpenAI: scaling PostgreSQL</a> — one primary and about 50 replicas at millions of queries per second, with shardable writes moved elsewhere</li>
    <li><a href="https://www.notion.com/blog/sharding-postgres-at-notion" rel="noopener noreferrer">Notion: sharding Postgres</a> — 480 logical shards on 32 databases, application-level routing, and the dual-write migration</li>
    <li><a href="https://vitess.io/docs/reference/features/sharding/" rel="noopener noreferrer">Vitess sharding</a> — keyspace ID ranges per shard, vindexes, and splitting or merging shards</li>
    <li><a href="https://vitess.io/docs/reference/vreplication/reshard/" rel="noopener noreferrer">Vitess Reshard</a> — online resharding workflow and its brief cutover</li>
    <li><a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/bp-partition-key-design.html" rel="noopener noreferrer">DynamoDB partition key design</a> — the 3,000 read and 1,000 write units per partition limits</li>
    <li><a href="https://aws.amazon.com/ec2/instance-types/high-memory/" rel="noopener noreferrer">EC2 High Memory instances</a> — the family of very large single machines (u7in-32tb: 896 vCPU, 32 TiB)</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html" rel="noopener noreferrer">Cassandra architecture: Dynamo</a> — token rings, virtual nodes and how token counts evolved</li>
    <li><a href="https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf" rel="noopener noreferrer">Dynamo paper (SOSP 2007)</a> — consistent hashing with virtual nodes and the load-balancing strategies compared</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" are rules of thumb, not guarantees. The ring dry run uses illustrative vnode positions; the key hashes are real MD5 values mod 1000.</p>
</div>`,
};
