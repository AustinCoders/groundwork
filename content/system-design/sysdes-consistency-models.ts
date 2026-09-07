import type { Chapter } from "../types";

export const sysdesConsistencyModels: Chapter = {
  id: "sysdes-consistency-models",
  num: "I4",
  title: "Consistency models",
  short: "Consistency models",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Every consistency model is just a rule about which stale reads you are willing to let a user see.",
  body: `<h3>Consistency is a contract about what a read may return</h3>
<p>
  Once data exists in more than one place — a replica, a cache, a second
  region — "what is the current value?" stops having a single answer. A
  <b>consistency model</b> is the contract you offer the application about
  which of the possible answers a read is allowed to produce. Stronger
  models forbid more answers, which costs coordination, which costs
  latency and availability.
</p>
<p>
  Interviewers push on this because it is the one topic where candidates
  reliably say something confidently wrong ("we'll use eventual
  consistency for speed") without noticing they just permitted a user to
  see their own comment disappear. The senior move is to pick a model
  <em>per operation</em> and justify it in product terms.
</p>

<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="A client writing version two to the primary, then two milliseconds later reading from a replica that is still forty milliseconds behind and returns the older version one">
    <g class="rough">
      <path class="lng" d="M128,110 L248,74" />
      <path class="ln dash" d="M316,110 L316,164" />
      <path class="lnr" d="M248,196 L128,140" />
    </g>
    <g class="rough">
      <rect class="box"  x="18"  y="102" width="110" height="48" rx="6" />
      <rect class="boxg" x="248" y="50"  width="150" height="52" rx="6" />
      <rect class="boxr" x="248" y="172" width="150" height="52" rx="6" />
    </g>
    <text class="lbl" x="73"  y="122" text-anchor="middle">client</text>
    <text class="sm"  x="73"  y="140" text-anchor="middle">Alice</text>
    <text class="sm"  x="323" y="72"  text-anchor="middle">primary</text>
    <text class="sm gr" x="323" y="90" text-anchor="middle">balance = 120 (v2)</text>
    <text class="sm"  x="323" y="194" text-anchor="middle">read replica</text>
    <text class="sm rd" x="323" y="212" text-anchor="middle">balance = 100 (v1)</text>
    <text class="sm gr" x="140" y="76">t=0 write v2, committed</text>
    <text class="sm rd" x="140" y="176">t=2 ms read → 100</text>
    <text class="sm" x="330" y="145">replication lag 40 ms</text>
    <text class="lbl rd" x="18" y="248" style="font-size:15px">Alice deposited 20 and her balance went down. Nothing is broken — the system is behaving exactly as specified.</text>
  </svg>
  <figcaption>Every consistency anomaly you will ever discuss is a variation on this picture. The models differ only in which arrow they forbid.</figcaption>
</figure>

<h3>Replication lag is the concrete thing underneath all of it</h3>
<p>
  "Eventual consistency" sounds abstract until you attach numbers to it.
  Lag is the wall-clock delay between a write committing on the primary
  and being visible on a given replica, and its distribution is wildly
  skewed — the median is boring and the tail is where your bugs live.
</p>
<table>
  <tr><th>Setup</th><th>Typical lag</th><th>Tail behaviour</th></tr>
  <tr><td>Same-AZ async replica</td><td>0.5-2 ms</td><td>Tens of ms under write bursts</td></tr>
  <tr><td>Cross-AZ, same region</td><td>2-10 ms</td><td>100 ms+ during compaction or vacuum</td></tr>
  <tr><td>Cross-region (us-east → eu-west)</td><td>70-120 ms, floor set by RTT</td><td>Seconds if the link saturates</td></tr>
  <tr><td>Any replica during a bulk write, index build, or long transaction</td><td>seconds to minutes</td><td>Single-threaded replay (classic MySQL) can fall <em>hours</em> behind and never catch up until write traffic drops</td></tr>
  <tr><td>Read-through cache with 60 s TTL</td><td>up to 60 s</td><td>This is replication lag too. People forget caches are replicas</td></tr>
</table>
<p class="sub">
  The operationally important property: lag is not bounded. Any design
  that says "the replica is only a few milliseconds behind, so it's fine"
  is a design that breaks during the exact incident where correctness
  matters most. If you need a bound, you must enforce one — by reading the
  primary, by waiting for a version token, or by refusing to serve from a
  replica whose lag exceeds a threshold.
</p>

<h3>The two poles, and the useful middle</h3>
<p>
  <b>Strong consistency</b> (informally: every read sees the latest
  committed write) requires the read to be coordinated with the write —
  route to the leader, or read a quorum, or hold a lease. Cost: at least
  one extra round trip, and unavailability whenever the leader is
  unreachable. <b>Eventual consistency</b> promises only that if writes
  stop, replicas converge. Cost: nothing; guarantee: nearly nothing. Any
  stale value is legal, in any order, on any read.
</p>
<p>
  Between them sit the <b>session guarantees</b> — the models that actually
  ship in real products, because they fix the anomalies users can
  <em>perceive</em> without paying for global coordination.
</p>
<table>
  <tr><th>Model</th><th>Forbids</th><th>How it's implemented</th></tr>
  <tr><td>Read-your-writes</td><td>You post a comment and it isn't there on refresh</td><td>Route a user's reads to the primary for N seconds after their write; or return a version token (Postgres LSN, MySQL GTID) with the write and have the read wait for a replica that has caught up to it</td></tr>
  <tr><td>Monotonic reads</td><td>Refreshing shows a comment, then it vanishes, then it's back</td><td>Sticky routing: hash the user to one replica so they never move backwards in the replication stream</td></tr>
  <tr><td>Consistent prefix</td><td>Seeing the reply "because he's late" before the question "why?"</td><td>Preserve write order per partition; don't shard causally-related rows across independently-replicated partitions</td></tr>
  <tr><td>Causal consistency</td><td>Any effect visible before its cause, across users</td><td>Track happens-before with vector clocks or dependency metadata and delay applying an update until its dependencies have landed</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll serve reads from
  replicas, but pin a user to the primary for about 500 ms after any write
  of theirs — that buys read-your-writes for the person who cares, while
  everyone else still gets the cheap replica read. If the lag distribution
  makes a fixed window unreliable, I'll upgrade to returning the write's
  LSN and having the replica wait for it."
</div>
<div class="warn">
  <span class="ttl">⚠ Read-your-writes breaks on a second device, and on the client's own cache</span>
  Sticky-to-primary usually keys on the session or connection. Alice
  updates her profile on her phone, opens her laptop, and the laptop's
  session hits a lagging replica — the anomaly is back. If cross-device
  read-your-writes matters, the sticky key has to be the <em>user</em>,
  not the session, and the version token has to travel with the user
  (stored server-side or in a cookie), not with the connection.
</div>

<h3>Quorums: R + W &gt; N, with the numbers worked out</h3>
<p>
  In a leaderless or quorum-replicated store (Dynamo, Cassandra, Riak) you
  choose three numbers: <b>N</b> replicas hold each key, a write must be
  acknowledged by <b>W</b> of them, a read must gather <b>R</b> of them. If
  <code>R + W &gt; N</code>, the read set and the write set must overlap in
  at least one node by pigeonhole — so at least one responding replica has
  the newest write, and version stamps let the reader pick it.
</p>

<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="Three replicas where a write is acknowledged by the first two and a read contacts the last two, so the middle replica belongs to both sets and guarantees the read sees the newest write">
    <g class="rough">
      <path class="lng" d="M112,50 L196,116" />
      <path class="lng" d="M112,58 L336,120" />
      <path class="ln"  d="M112,232 L336,168" />
      <path class="ln"  d="M112,236 L476,168" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="26"  width="96" height="42" rx="6" />
      <rect class="box"  x="16"  y="212" width="96" height="42" rx="6" />
      <rect class="boxg" x="196" y="116" width="120" height="52" rx="6" />
      <rect class="boxy" x="336" y="116" width="120" height="52" rx="6" />
      <rect class="box"  x="476" y="116" width="120" height="52" rx="6" />
    </g>
    <text class="sm" x="64"  y="52"  text-anchor="middle">writer</text>
    <text class="sm" x="64"  y="238" text-anchor="middle">reader</text>
    <text class="sm gr" x="256" y="138" text-anchor="middle">replica 1</text>
    <text class="sm gr" x="256" y="156" text-anchor="middle">written</text>
    <text class="sm" x="396" y="138" text-anchor="middle">replica 2</text>
    <text class="sm" x="396" y="156" text-anchor="middle">written + read</text>
    <text class="sm" x="536" y="138" text-anchor="middle">replica 3</text>
    <text class="sm" x="536" y="156" text-anchor="middle">read only</text>
    <text class="sm gr" x="126" y="92">W = 2</text>
    <text class="sm" x="126" y="204">R = 2</text>
    <text class="lbl" x="336" y="212" style="font-size:15px">R + W = 4 &gt; N = 3</text>
    <text class="sm" x="336" y="234">the overlap is replica 2 — it must be in both sets</text>
    <text class="sm" x="336" y="254">so the reader always sees the newest version stamp</text>
  </svg>
  <figcaption>The guarantee comes from arithmetic, not from timing: with R + W &gt; N the sets cannot be disjoint, so a reader physically cannot miss the newest committed write.</figcaption>
</figure>

<table>
  <tr><th>N, W, R</th><th>Overlap?</th><th>Write tolerance</th><th>Read tolerance</th><th>Character</th></tr>
  <tr><td>3, 2, 2</td><td>Yes (4 &gt; 3)</td><td>1 node down</td><td>1 node down</td><td>The default. Balanced, survives one failure on both paths</td></tr>
  <tr><td>3, 3, 1</td><td>Yes (4 &gt; 3)</td><td>0 — any node down blocks writes</td><td>2 nodes down</td><td>Read-optimised: 1-replica reads are fast and local, writes are brittle</td></tr>
  <tr><td>3, 1, 3</td><td>Yes (4 &gt; 3)</td><td>2 nodes down</td><td>0</td><td>Write-optimised: fast durable-ish writes, fragile reads</td></tr>
  <tr><td>3, 1, 1</td><td><b>No</b> (2 &lt; 3)</td><td>2 down</td><td>2 down</td><td>Pure eventual consistency. Lowest latency, highest availability, a read can miss a write entirely</td></tr>
  <tr><td>5, 3, 3</td><td>Yes (6 &gt; 5)</td><td>2 down</td><td>2 down</td><td>Survives two failures on both paths; ~1.5x the write cost. Standard for critical data</td></tr>
</table>
<p class="sub">
  Latency follows directly: a W=2 write waits for the <em>second-fastest</em>
  of three replicas, so it inherits that node's p95, not the fastest node's.
  Raising W or R moves you further into the tail of the slowest responder —
  which is why quorum systems tune these per-query rather than globally.
</p>
<div class="warn">
  <span class="ttl">⚠ R + W &gt; N does not give you linearizability</span>
  It guarantees the newest <em>committed</em> value is in the read set. It
  does not order concurrent writes (two writers at W=2 can each succeed on
  a different pair and produce siblings), it does not make a failed write
  disappear (a write that reached one node and then failed can still be
  read later and repaired into existence), and <b>sloppy quorums</b> with
  hinted handoff — the default in Dynamo-style systems during a
  partition — accept W acks from nodes that aren't even in the key's
  preference list, which breaks the overlap argument outright. Quorums buy
  you strong-ish reads under normal operation, not consensus. For real
  linearizability you need Raft or Paxos with a leader lease.
</div>

<h3>Linearizability vs serializability — telling them apart for good</h3>
<p>
  They sound like synonyms, they come from different fields, and mixing
  them up is the fastest way to lose credibility on this topic.
</p>
<ul>
  <li>
    <b>Linearizability</b> is about <em>single objects</em> and
    <em>real time</em>. Every operation appears to take effect
    instantaneously at some point between its invocation and its response,
    and that point respects wall-clock order: if write W completes before
    read R begins, R must see W. It says nothing about multi-key
    transactions. It is a <em>recency</em> guarantee — the C in CAP.
  </li>
  <li>
    <b>Serializability</b> is about <em>multi-object transactions</em> and
    says nothing about real time. Concurrent transactions produce a result
    equivalent to <em>some</em> serial order — and that order need not
    match the order they actually happened in. A transaction that
    committed an hour ago may legally be ordered after one committing now.
    It is an <em>isolation</em> guarantee — the I in ACID.
  </li>
  <li>
    <b>Strict serializability</b> is both: a serial order that also
    respects real time. This is what Spanner (via TrueTime), FaunaDB and
    CockroachDB market as "external consistency", and it is the strongest
    practical model.
  </li>
</ul>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A timeline showing a write of x equals one, a concurrent read that may legally return either the old or new value, and a later non-overlapping read that must return one under linearizability">
    <g class="rough">
      <rect class="boxg" x="108" y="34"  width="146" height="38" rx="5" />
      <rect class="boxy" x="196" y="92"  width="136" height="38" rx="5" />
      <rect class="box"  x="330" y="150" width="136" height="38" rx="5" />
      <path class="ln" d="M40,214 L604,214" />
      <path class="ln dash" d="M254,26 L254,214" />
    </g>
    <text class="sm" x="181" y="58"  text-anchor="middle">A: write(x=1)</text>
    <text class="sm" x="264" y="116" text-anchor="middle">B: read(x)</text>
    <text class="sm" x="398" y="174" text-anchor="middle">C: read(x)</text>
    <text class="sm" x="346" y="116">overlaps the write → 0 or 1 both legal</text>
    <text class="sm gr" x="480" y="174">starts after → must return 1</text>
    <text class="sm" x="258" y="24">write completes here</text>
    <text class="sm" x="560" y="234">real time →</text>
    <text class="lbl" x="40" y="240" style="font-size:14px">linearizability constrains only non-overlapping operations</text>
  </svg>
  <figcaption>Concurrency is where freedom lives: overlapping operations may be ordered either way, but once an operation has returned, everyone must see it.</figcaption>
</figure>

<p class="sub">
  The one-liner worth memorising: <b>linearizability is about recency of a
  single key; serializability is about the illusion of one-at-a-time
  transactions.</b> A database can be serializable and still let you read
  stale data (Postgres SERIALIZABLE on a replica); a store can be
  linearizable per key and have no transactions at all (etcd, ZooKeeper).
</p>

<h3>Choosing per operation: model, cost, and what it looks like to a user</h3>
<table>
  <tr><th>Model</th><th>Guarantee</th><th>Cost</th><th>Real product example</th></tr>
  <tr><td>Eventual</td><td>Replicas converge if writes stop</td><td>None — local read, local write, survives partitions</td><td><b>Like count, view count, follower count.</b> Off by 3 for 200 ms; nobody can tell, and nobody is harmed. Rendering it as "1.2k" makes the staleness literally invisible</td></tr>
  <tr><td>Monotonic reads</td><td>Never move backwards in time</td><td>Sticky routing — mild load imbalance, awkward on replica failover</td><td><b>An infinite feed.</b> Items reappearing or vanishing while scrolling reads as a bug even when values are individually fine</td></tr>
  <tr><td>Read-your-writes</td><td>You always see your own effects</td><td>Primary reads for a short window, or LSN-waiting on read</td><td><b>Posting a comment, editing a profile, uploading an avatar.</b> The cheapest model that makes the product feel correct — and the default you should reach for on any write-then-read flow</td></tr>
  <tr><td>Causal</td><td>Effects never precede their causes</td><td>Dependency metadata on every write; real complexity</td><td><b>Threaded comments and chat.</b> A reply must not be visible before the message it replies to</td></tr>
  <tr><td>Linearizable (single key)</td><td>Reads see the latest committed write, in real-time order</td><td>Leader round trip; unavailable during leader loss (CP)</td><td><b>Bank balance display, seat inventory, feature-flag kill switch.</b> Being 200 ms stale is a wrong number on a screen someone will act on</td></tr>
  <tr><td>Strict serializable / transactional</td><td>Multi-key transactions in a real-time-respecting serial order</td><td>Consensus per commit; cross-region commits cost an inter-region RTT</td><td><b>Username reservation, seat booking, money transfer.</b> Two users claiming <code>@ada</code> concurrently must produce exactly one winner — this needs a uniqueness constraint or a compare-and-set, not a read-then-write</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The three-question test for any field in your design</span>
  <ul style="margin:8px 0 0">
    <li><b>If a user sees a value 5 seconds old, what happens?</b> Nothing → eventual. Confusing → session guarantees. Wrong decision or lost money → strong.</li>
    <li><b>Can two concurrent writes both "win"?</b> If the answer must be no (username, seat, inventory), no amount of replication tuning helps — you need a single serialisation point: a uniqueness constraint, a conditional write, or consensus.</li>
    <li><b>Who notices the staleness — the writer or a third party?</b> Only the writer → read-your-writes is enough and it's cheap. Everyone → you're in strong-consistency territory.</li>
  </ul>
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd mix models rather than
  pick one. Counters and feeds go eventual off replicas. Anything the user
  just wrote gets read-your-writes via primary-pinning. Balance and
  inventory read from the leader, and the actual decrement is a
  conditional update inside a transaction, so two concurrent buyers can't
  both take the last seat. That's three models in one system and each one
  is justified by what breaks if I go weaker."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> the moment your diagram grows a read replica, a cache, or a second region, you have chosen a consistency model — the only question is whether you chose it deliberately. "Multi-region", "read replicas", "global users" are all consistency prompts in disguise.</li>
  <li><b>The naive design</b> says "we'll use eventual consistency, it's more available" and then puts a write-then-read flow on top of it. Almost every user-visible consistency bug is a read-your-writes violation, not a deep causality problem.</li>
  <li><b>Distinguishing it from CAP hand-waving:</b> CAP is a statement about behaviour <em>during a network partition</em>, which is rare. Replication lag is present every single second of normal operation. Talk about lag; mention CAP only if partitions are actually in scope.</li>
  <li><b>Uniqueness and inventory are not consistency-tunable.</b> If two concurrent operations must not both succeed, no choice of R and W saves you — you need a single point of serialisation. Say that explicitly; it's a common trap.</li>
  <li><b>Quantify.</b> "Cross-region lag is ~100 ms, so a European read of a US write can be stale for a tenth of a second — fine for a like count, not for a payment confirmation" is worth more than three paragraphs of theory.</li>
  <li><b>The pitfall to avoid:</b> using "strongly consistent" and "serializable" interchangeably. If you only remember one thing: linearizability = recency of one key; serializability = transactions appear one-at-a-time.</li>
</ul>`,
};
