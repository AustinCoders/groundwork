import type { Chapter } from "../types";

export const sysdesCapTheoremDepth: Chapter = {
  id: "sysdes-cap-theorem-depth",
  num: "A1",
  title: "The CAP theorem in depth",
  short: "CAP theorem in depth",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    'You never "pick two" — you pick one letter during a partition, and PACELC tells you what you picked for the other 99.9% of the time.',
  body: `<h3>The version everyone repeats is wrong, and the wrongness matters</h3>
<p>
  The folklore statement is "consistency, availability, partition
  tolerance — pick two." That framing fails the moment you take it
  seriously, because <b>P is not a choice you get to make</b>. A partition
  is a property of the network: a cut fibre, a failed top-of-rack switch, a
  bad BGP announcement, an AZ losing connectivity, or — most commonly — a
  node that is merely <em>slow</em> (a 40-second stop-the-world GC pause, a
  VM live-migration stall) and is therefore indistinguishable from a dead
  one. You cannot buy a network that never partitions, so "CA" is not a
  system design. It is a system with no story for partitions, which under
  partition quietly gives up both letters.
</p>
<p>
  The precise statement is narrower and far more useful: <b>when a
  partition occurs, and only then, you must choose between consistency and
  availability.</b> When there is no partition — which is essentially all
  of the time — CAP says nothing whatsoever about your system. That last
  clause is the one that separates candidates: CAP is a theorem about the
  rare case, and the rare case is not where your latency budget lives.
</p>
<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="Two nodes on either side of a severed network link, with the two possible responses shown below: the CP choice refuses writes on the minority side, and the AP choice accepts writes on both sides and diverges">
    <g class="rough">
      <path class="ln" d="M110,72 L170,72" />
      <path class="lnr dash" d="M270,72 L370,72" />
      <path class="ln" d="M470,72 L530,72" />
      <path class="lnr" d="M306,58 L334,86" />
      <path class="lnr" d="M334,58 L306,86" />
      <path class="ln" d="M215,94 L172,168" />
      <path class="ln" d="M425,94 L468,168" />
    </g>
    <g class="rough">
      <rect class="box"  x="20"  y="50"  width="90"  height="44" rx="6" />
      <rect class="boxy" x="170" y="50"  width="100" height="44" rx="6" />
      <rect class="boxy" x="370" y="50"  width="100" height="44" rx="6" />
      <rect class="box"  x="530" y="50"  width="90"  height="44" rx="6" />
      <rect class="boxr" x="60"  y="168" width="220" height="76" rx="6" />
      <rect class="boxy" x="360" y="168" width="220" height="76" rx="6" />
    </g>
    <text class="lbl" x="65"  y="78"  text-anchor="middle">client A</text>
    <text class="lbl" x="220" y="78"  text-anchor="middle">node 1</text>
    <text class="lbl" x="420" y="78"  text-anchor="middle">node 2</text>
    <text class="lbl" x="575" y="78"  text-anchor="middle">client B</text>
    <text class="sm rd" x="320" y="36" text-anchor="middle">partition — each side thinks the other died</text>
    <text class="lbl rd" x="170" y="192" text-anchor="middle">choose C</text>
    <text class="sm" x="170" y="212" text-anchor="middle">minority refuses writes,</text>
    <text class="sm" x="170" y="230" text-anchor="middle">client A gets an error</text>
    <text class="lbl" x="470" y="192" text-anchor="middle">choose A</text>
    <text class="sm" x="470" y="212" text-anchor="middle">both sides accept writes,</text>
    <text class="sm" x="470" y="230" text-anchor="middle">histories diverge — merge later</text>
  </svg>
  <figcaption>The choice only exists inside the red X. Notice that neither branch is "correct" — one costs you an error page, the other costs you a reconciliation problem you must have designed in advance.</figcaption>
</figure>

<h3>The three letters, defined precisely (this is where marks are lost)</h3>
<table>
  <tr><th>Letter</th><th>What it formally means</th><th>What candidates think it means</th></tr>
  <tr><td>C</td><td><b>Linearizability.</b> The system behaves as if there is exactly one copy of the data: every read returns the value of the most recently completed write, and once a read sees a value, no later read sees an older one.</td><td>The C in ACID (integrity constraints). Unrelated.</td></tr>
  <tr><td>A</td><td><b>Every request to a non-failing node returns a non-error response.</b> No bound on how long it takes, and no promise the answer is fresh.</td><td>"Four nines of uptime." Also unrelated — a CP system can have a better SLA than an AP one.</td></tr>
  <tr><td>P</td><td>The system keeps operating when arbitrary messages between nodes are dropped.</td><td>An optional feature. It is not optional.</td></tr>
</table>
<p class="sub">
  Two consequences fall straight out of those definitions. First, CAP-A has
  no latency bound, so a system that answers in 30 seconds is "available" —
  which is why CAP alone is useless for reasoning about production SLOs.
  Second, CAP-C is <em>linearizability</em>, the strongest single-object
  guarantee; weaker useful models (read-your-writes, monotonic reads,
  causal consistency) sit below it and are perfectly compatible with staying
  available during a partition. "AP" does not mean "no guarantees."
</p>

<h3>What CP actually looks like from the client's seat</h3>
<p>
  Take a five-node leader-based cluster — etcd, ZooKeeper, a Spanner
  Paxos group, a MongoDB replica set with majority write concern. The
  network splits it 3 | 2.
</p>
<ul>
  <li><b>Majority side (3 nodes):</b> keeps or elects a leader, keeps committing writes, fully functional. If the old leader was on this side, there is no interruption at all.</li>
  <li><b>Minority side (2 nodes):</b> cannot reach a quorum, so it cannot commit anything. Writes fail immediately with something like "no leader" or a context deadline. Reads either fail too, or are served locally and are knowingly stale — that is a per-system decision, and a good one to ask about.</li>
  <li><b>A client pinned to the minority</b> sees hard errors for the entire duration of the partition, plus an election timeout on top (Raft's classic 150–300 ms, etcd's default 1000 ms, ZooKeeper tick-based failover typically a few seconds).</li>
</ul>
<p>
  The client-visible contract is: <b>never a wrong answer, sometimes no
  answer.</b> That is the right trade whenever a wrong answer is more
  expensive than an error page — a ledger balance, decrementing the last
  unit of inventory, a cluster-membership record, a lock, a feature-flag
  kill switch.
</p>

<h3>What AP actually looks like from the client's seat</h3>
<p>
  Now the same partition in Cassandra at consistency level ONE, or DynamoDB
  with eventually-consistent reads, or Riak. Both sides accept writes.
  Every client gets a 200. Nothing appears wrong — and that is precisely
  the danger, because the damage is deferred to reconciliation time. When
  the partition heals you have two divergent histories, and something has
  to merge them:
</p>
<table>
  <tr><th>Reconciliation strategy</th><th>What it costs</th><th>Reach for it when…</th></tr>
  <tr><td><b>Last-write-wins</b> by timestamp</td><td>Silently discards one side's writes. With wall-clock timestamps, clock skew of a few hundred ms decides which user's data survives.</td><td>The value is a cache-like overwrite where losing an update is genuinely acceptable — a "last seen at" field, a presence flag.</td></tr>
  <tr><td><b>Siblings / vector clocks</b> returned to the app</td><td>Every read path must now handle "here are 3 conflicting values." Real complexity, pushed into product code.</td><td>The app has domain knowledge that makes merging obvious (union the shopping cart).</td></tr>
  <tr><td><b>CRDTs</b> (G-Counter, OR-Set, LWW-Register)</td><td>Restricted data types, metadata growth, and you must model the domain as a mergeable lattice.</td><td>Counters, sets, collaborative text, presence — anywhere concurrent edits are normal (Redis CRDT, Automerge, Yjs).</td></tr>
  <tr><td><b>Read repair + anti-entropy</b> (Merkle trees)</td><td>Background convergence only; does not decide semantics, just propagates whatever the winner already is.</td><td>Always — it is a complement to one of the above, never a substitute.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ "We'll go AP" is only half an answer</span>
  The interviewer's next sentence is "so how do you merge?" If you cannot
  name last-write-wins, siblings, or a CRDT and say which one you'd use for
  <em>this</em> data, you have taken AP's availability without paying AP's
  price. "Eventually consistent" describes an outcome, not a mechanism.
  The canonical example is the Dynamo shopping cart: under LWW, a partition
  loses items a customer added; modelled as an OR-Set, the merge is a union
  and the worst case is a deleted item reappearing — which Amazon judged
  strictly better than a lost sale.
</div>

<h3>PACELC — the framing that actually predicts database behaviour</h3>
<p>
  Abadi's 2010 extension is the one to bring up unprompted, because it
  covers the case CAP ignores: <b>if there is a Partition, choose A or C;
  Else, choose Latency or Consistency.</b> The "else" half applies over
  99.9% of your system's life, and it is not a legal technicality — it is
  forced by physics. Keeping replicas linearizable requires a round trip to
  a quorum before you can answer, and round trips cost:
</p>
<table>
  <tr><th>Hop</th><th>Typical RTT</th><th>What that means for a quorum write</th></tr>
  <tr><td>Same rack / same AZ</td><td>0.2–0.5 ms</td><td>Consistency is nearly free; take it.</td></tr>
  <tr><td>Cross-AZ, same region</td><td>0.5–2 ms</td><td>Still cheap. This is why a 3-AZ quorum inside one region is the default shape for most CP systems.</td></tr>
  <tr><td>us-east ↔ us-west</td><td>60–70 ms</td><td>A cross-region quorum write costs at minimum the second-fastest RTT. Your write p50 now starts at ~35 ms.</td></tr>
  <tr><td>us-east ↔ eu-west</td><td>75–90 ms</td><td>Global linearizable writes are tens of milliseconds, permanently. No amount of engineering removes this.</td></tr>
</table>
<p>
  Spanner is the clearest illustration of choosing consistency in the
  "else" branch and simply paying: it is PC/EC, it commits through Paxos
  across regions, and it adds a deliberate <b>commit wait</b> of roughly
  twice the TrueTime clock uncertainty (single-digit milliseconds) so that
  commit timestamps are globally meaningful. Writes land in the tens of
  milliseconds. In exchange you get external consistency across a planet,
  and read-only transactions at a past timestamp that any replica can serve
  locally with no coordination at all.
</p>

<h3>Where real systems sit — the honest, tunable version</h3>
<table>
  <tr><th>System</th><th>PACELC</th><th>Why, and where the knob is</th></tr>
  <tr><td><b>Postgres</b>, single primary + sync standby</td><td>PC/EC</td><td>With <code>synchronous_commit = on</code> and a named standby, a commit waits for the standby. Lose the standby and writes block — that is CP behaving as advertised. Switch to <code>local</code>/async and you become EL with replica reads stale by the replication lag (sub-ms idle, seconds-to-minutes under a heavy write burst or a long-running query on the replica).</td></tr>
  <tr><td><b>DynamoDB</b></td><td>PA/EL (default)<br />PC/EC (per read)</td><td>Reads are eventually consistent by default and served by any of the three AZ replicas. Pass <code>ConsistentRead=true</code> and you route to the leader replica: 2× the read cost, a few extra ms, and unavailable if that partition has no leader. The letter is chosen <em>per API call</em>.</td></tr>
  <tr><td><b>Cassandra / ScyllaDB</b></td><td>PA/EL (default)<br />PC/EC (QUORUM)</td><td>Consistency level is per query. ONE is fast and stale-tolerant; QUORUM read + QUORUM write gives R + W &gt; N and single-key linearizability-ish behaviour at the cost of latency; LOCAL_QUORUM keeps you inside one DC. Note that sloppy quorums with hinted handoff can violate the overlap guarantee during a partition — worth knowing.</td></tr>
  <tr><td><b>Spanner / CockroachDB</b></td><td>PC/EC</td><td>Paxos/Raft per range, majority commit. Consistency is not negotiable; latency is the bill. Follower reads and bounded-staleness reads are the escape hatch when you want EL for a specific query.</td></tr>
  <tr><td><b>ZooKeeper</b></td><td>PC/EC (writes)</td><td>Zab totally orders writes through a leader with a majority. But <b>reads are served locally by any follower and may be stale</b> — you must call <code>sync()</code> first for a linearizable read. Saying this unprompted is a strong signal.</td></tr>
  <tr><td><b>etcd</b></td><td>PC/EC</td><td>Raft; linearizable reads by default via read-index. Minority members return errors. This is the coordination substrate for Kubernetes precisely because it refuses to guess.</td></tr>
  <tr><td><b>MongoDB</b></td><td>PC/EC or PA/EL</td><td><code>w:majority</code> + <code>readConcern:majority</code> is CP-ish; <code>w:1</code> plus reads from secondaries is AP-ish and can lose acknowledged writes on failover (rollback files).</td></tr>
  <tr><td><b>Redis</b> (Sentinel or Cluster)</td><td>Neither, honestly</td><td>Replication is always asynchronous, so a failover can lose writes the primary already acknowledged. It is AP-shaped <em>without</em> AP's conflict resolution — the losing writes just vanish. <code>WAIT</code> reduces the window but is not a quorum commit. Treat Redis as a cache or a lossy store, and never as your source of truth for money.</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The one line to remember</span>
  The choice is made <b>per operation</b>, not per database. Almost every
  modern store exposes the dial as a per-request consistency level, write
  concern, or read flag — so the interesting design question is never "is
  this system CP or AP", it is "which of my operations can tolerate a stale
  read, and which cannot".
</div>

<h3>The quorum dial: R + W &gt; N</h3>
<p>
  In a Dynamo-style system with N replicas, you require W acknowledgements
  to accept a write and R responses to serve a read. If <b>R + W &gt; N</b>,
  the read set and the write set must overlap in at least one replica, so
  every read touches at least one node that saw the latest write.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="Three replicas labelled A, B and C, where a write is acknowledged by A and B while a read is answered by B and C, so replica B appears in both sets and guarantees the read observes the write">
    <g class="rough">
      <path class="lng" d="M110,124 L140,128" />
      <path class="lng" d="M110,142 Q220,206 292,162" />
      <path class="ln" d="M500,130 L536,130" />
      <path class="ln" d="M528,146 Q426,208 348,166" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="108" width="90" height="44" rx="6" />
      <circle class="boxg" cx="180" cy="130" r="40" />
      <circle class="boxy" cx="320" cy="130" r="40" />
      <circle class="box"  cx="460" cy="130" r="40" />
      <rect class="box" x="536" y="108" width="90" height="44" rx="6" />
    </g>
    <text class="lbl" x="65"  y="136" text-anchor="middle">writer</text>
    <text class="lbl" x="180" y="136" text-anchor="middle">A</text>
    <text class="lbl" x="320" y="136" text-anchor="middle">B</text>
    <text class="lbl" x="460" y="136" text-anchor="middle">C</text>
    <text class="lbl" x="581" y="136" text-anchor="middle">reader</text>
    <text class="sm gr" x="20"  y="40">W = 2 (green)</text>
    <text class="sm"    x="470" y="40">R = 2</text>
    <text class="lbl" x="320" y="40" text-anchor="middle">N = 3</text>
    <text class="sm" x="320" y="205" text-anchor="middle">B is in both sets — the overlap is the whole guarantee</text>
  </svg>
  <figcaption>The pigeonhole principle is doing all the work: two sets of size 2 drawn from 3 replicas cannot be disjoint.</figcaption>
</figure>
<table>
  <tr><th>N=3 config</th><th>Behaviour</th><th>Reach for this when…</th></tr>
  <tr><td>W=1, R=1</td><td>Fastest possible both ways, no overlap, reads can be arbitrarily stale. One replica loss loses data.</td><td>Metrics, logs, view counters, anything where losing a write is a rounding error.</td></tr>
  <tr><td>W=2, R=2</td><td>Overlap guaranteed. Tolerates one node down for both reads and writes.</td><td>The default. Most OLTP-ish workloads on a Dynamo-style store.</td></tr>
  <tr><td>W=3, R=1</td><td>Reads are single-hop fast; any node down makes writes unavailable.</td><td>Read-dominated config data written rarely.</td></tr>
  <tr><td>W=1, R=3</td><td>Writes are single-hop fast; any node down makes reads unavailable.</td><td>Rarely correct — usually a sign the workload wants W=2, R=2.</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll run N=3 across three
  AZs with quorum reads and writes for the orders table — cross-AZ RTT is
  about a millisecond so consistency is nearly free there. For the product
  catalogue I'll drop to R=1 and accept a few seconds of staleness, because
  a stale price on a listing page is recoverable and an unavailable
  listing page is not."
</div>

<h3>Using CAP in the room without sounding like a flashcard</h3>
<p>
  The senior move is to refuse the question as posed. Nobody designs "a CP
  system"; you design a system in which <em>different data has different
  requirements</em>, and you say so explicitly:
</p>
<ul>
  <li><b>Payments ledger, account balances, idempotency keys:</b> CP. Refuse the write rather than double-charge.</li>
  <li><b>Session store, presence, notification counts, feed ranking:</b> AP. A stale unread count costs nothing.</li>
  <li><b>Inventory:</b> split it. The last 50 units of a SKU are sold through a CP path with a real reservation; the "1,200 in stock" badge on the listing page is AP and can be minutes old. Ticketmaster-style seat selection is the same trick — browse is AP, hold is CP.</li>
  <li><b>Cluster metadata, leader election, feature-flag kill switches:</b> CP, and delegated to etcd or ZooKeeper rather than built.</li>
</ul>
<div class="warn">
  <span class="ttl">⚠ Three sentences that cost you the level</span>
  "It's a CA system" (there is no such thing across a network).
  "CAP says pick two" (it says pick one, and only during a partition).
  "We'll use Cassandra because it's AP" (Cassandra is whatever your
  consistency level says it is, per query). Any of these tells the
  interviewer you learned CAP from a blog post rather than from an outage.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt spans more than one datacentre, region, or AZ — the moment replicas can be separated by a network, CAP is live and the interviewer will probe it.</li>
  <li>Words like "globally distributed", "multi-region active-active", "must never lose a write", "must always accept a write" are direct invitations to name your partition-time choice.</li>
  <li>A naive design says "we'll replicate to the other region" and stops. The follow-up that exposes it is always: <em>what does the client see while the link between them is down?</em> Have that answer ready before it's asked.</li>
  <li>Distinguish from the plain replication chapter: replication is about <em>how</em> copies get updated; CAP is about what you do when they <em>can't</em>. Distinguish from PACELC's else-branch: if the network is healthy and you are still arguing about staleness, that is a latency-vs-consistency question, not a CAP question.</li>
  <li>If you choose AP, immediately state the merge function. If you choose CP, immediately state the blast radius: which clients get errors, for how long, and what the retry/queue story is so the user doesn't just see a 500.</li>
  <li>The strongest closing move is to make the choice per-operation and justify each one with the business cost of being wrong versus the business cost of being down.</li>
</ul>`,
};
