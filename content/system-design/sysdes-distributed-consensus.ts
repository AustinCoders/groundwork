import type { Chapter } from "../types";

export const sysdesDistributedConsensus: Chapter = {
  id: "sysdes-distributed-consensus",
  num: "A3",
  title: "Distributed consensus (surface)",
  short: "Distributed consensus",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Getting a group of unreliable machines to agree on one value — and why your job is to use a consensus system correctly, not to write one.",
  body: `<h3>What consensus buys, and where you actually need it</h3>
<p>
  Consensus is the problem of getting a set of nodes to agree on a single
  value, such that once a value is decided, every node that ever learns a
  decision learns the same one — even though nodes crash and restart, and
  messages are delayed, reordered, duplicated, or lost. It sounds abstract
  until you notice how many concrete production problems are secretly the
  same problem.
</p>
<table>
  <tr><th>Problem</th><th>The value being agreed on</th></tr>
  <tr><td><b>Leader election</b></td><td>"Which node is the primary for term 7?" Every replication scheme with a single writer needs this, and needs it to be unambiguous.</td></tr>
  <tr><td><b>Cluster membership and config</b></td><td>"Which nodes are in the cluster, and what is the current shard map?" A split view of membership is how you get two nodes both believing they own shard 12.</td></tr>
  <tr><td><b>Distributed locks / leases</b></td><td>"Who holds the right to run the nightly billing job?" Running it twice is a customer-visible incident.</td></tr>
  <tr><td><b>Atomic commit across shards</b></td><td>"Did transaction T commit or abort?" All participants must reach the same answer.</td></tr>
  <tr><td><b>Exactly-once semantics</b></td><td>"Has message 91,442 been processed?" Exactly-once delivery is impossible; exactly-once <em>effect</em> is achievable by agreeing on a durable sequence and deduplicating against it.</td></tr>
</table>
<p>
  Equally important is the list of things that do <em>not</em> need
  consensus, because reaching for it unnecessarily is its own mistake:
  ordinary application data (use replication with quorums), counters and
  metrics (use CRDTs or just accept approximation), caches, and anything
  where "two nodes did the work" is merely wasteful rather than wrong.
  Consensus costs a majority round trip on every decision — you pay it only
  where correctness demands it.
</p>

<h3>The problem, stated honestly</h3>
<p>
  What makes this hard is that in an asynchronous network you cannot
  distinguish <b>a crashed node</b> from <b>a slow node</b> from <b>a node
  you can't currently reach</b>. All three look identical: silence. The FLP
  result formalises this — with even one possible crash and no timing
  assumptions, no deterministic protocol can guarantee termination. Real
  systems escape it by adding a timing assumption in the form of timeouts,
  which makes progress <em>probabilistic</em> while keeping safety
  <em>absolute</em>. That split is the key idea to hold onto:
</p>
<ul>
  <li><b>Safety</b> — never two different decisions, never a lost committed entry — holds unconditionally, even during arbitrary partitions and crashes.</li>
  <li><b>Liveness</b> — actually deciding something — holds only when a majority can talk to each other for long enough. During a bad partition, a consensus system stops making progress. That is not a bug; it is the CP choice being exercised.</li>
</ul>

<h3>Raft: terms, elections, and why randomization matters</h3>
<p>
  Raft was explicitly designed to be understandable, which is why it is the
  one to explain out loud. It decomposes consensus into leader election,
  log replication, and safety.
</p>
<p>
  Time is divided into <b>terms</b>: monotonically increasing integers that
  act as a logical clock. Each term has at most one leader. Every message
  carries a term; a node seeing a higher term immediately steps down to
  follower and adopts it, and a node seeing a lower term rejects the
  message. That single rule retires stale leaders automatically.
</p>
<p>
  A follower that hears no heartbeat within its <b>election timeout</b>
  becomes a candidate: it increments the term, votes for itself, and asks
  everyone for a vote. A node grants at most one vote per term, and only to
  a candidate whose log is at least as up to date as its own. Win a
  majority and you are leader; the first thing a leader does is send
  heartbeats to suppress further elections.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Five nodes in a row during a Raft election, where node one collects two votes plus its own to reach a majority of three and becomes leader, while node five collects only one vote plus its own and cannot win">
    <g class="rough">
      <path class="lng" d="M186,152 L96,152" />
      <path class="lng" d="M304,152 Q200,88 96,146" />
      <path class="ln"  d="M462,152 Q506,112 544,150" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="80"  cy="170" r="26" />
      <circle class="box"  cx="200" cy="170" r="26" />
      <circle class="box"  cx="320" cy="170" r="26" />
      <circle class="box"  cx="440" cy="170" r="26" />
      <circle class="boxy" cx="560" cy="170" r="26" />
    </g>
    <text class="lbl" x="80"  y="176" text-anchor="middle">n1</text>
    <text class="lbl" x="200" y="176" text-anchor="middle">n2</text>
    <text class="lbl" x="320" y="176" text-anchor="middle">n3</text>
    <text class="lbl" x="440" y="176" text-anchor="middle">n4</text>
    <text class="lbl" x="560" y="176" text-anchor="middle">n5</text>
    <text class="sm" x="20" y="28">both n1 and n5 time out and become candidates in term 5</text>
    <text class="sm" x="20" y="48">a node grants at most one vote per term — so two majorities cannot both form</text>
    <text class="sm gr" x="80"  y="214" text-anchor="middle">candidate</text>
    <text class="sm gr" x="80"  y="232" text-anchor="middle">3 of 5 → LEADER</text>
    <text class="sm" x="200" y="214" text-anchor="middle">voted n1</text>
    <text class="sm" x="320" y="214" text-anchor="middle">voted n1</text>
    <text class="sm" x="440" y="214" text-anchor="middle">voted n5</text>
    <text class="sm rd" x="560" y="214" text-anchor="middle">candidate</text>
    <text class="sm rd" x="560" y="232" text-anchor="middle">2 of 5 → stalls</text>
  </svg>
  <figcaption>The whole guarantee is set overlap: any two subsets of five nodes with three members each must share a node, and that shared node only voted once.</figcaption>
</figure>
<p>
  <b>Why a majority guarantees at most one leader:</b> two majorities of the
  same cluster must intersect in at least one node, and that node casts at
  most one vote per term. So two candidates cannot both reach a majority in
  the same term, and higher terms retire lower ones. This is the sentence
  to be able to say verbatim.
</p>
<p>
  <b>Why the timeout is randomized:</b> if every follower used the same
  election timeout, they would all time out together, all become
  candidates, all split the vote, and all time out again — livelock.
  Randomizing each node's timeout over a range (the Raft paper suggests
  150–300 ms; etcd defaults to 1000 ms with 100 ms heartbeats) means one
  node almost always wakes first and wins before the others start.
  Randomization is not a tuning detail; it is the liveness mechanism.
</p>

<h3>Log replication and the commit rule</h3>
<p>
  Every state change is an entry appended to a replicated log. Clients send
  commands to the leader; the leader appends locally, then sends
  <code>AppendEntries</code> to followers. An entry is <b>committed</b> once
  it is durably stored on a majority — at which point the leader applies it
  to its state machine, returns to the client, and tells followers the new
  commit index on the next heartbeat. Because every replica applies the same
  entries in the same order, every replica ends in the same state. That is
  the <em>replicated state machine</em> pattern, and it is what a consensus
  system really sells you.
</p>
<table>
  <tr><th>Raft property</th><th>What it prevents</th></tr>
  <tr><td><b>Log matching:</b> <code>AppendEntries</code> carries the index and term of the preceding entry; a follower rejects it if that doesn't match, and the leader walks backwards until it finds agreement, then overwrites the divergent tail.</td><td>Divergent histories silently persisting on a follower.</td></tr>
  <tr><td><b>Election restriction:</b> a voter refuses any candidate whose last log entry is older (lower term, or same term but shorter) than its own.</td><td>Electing a leader that is missing a committed entry — which would erase it.</td></tr>
  <tr><td><b>Leader-term commit rule:</b> a leader may only mark an entry committed by counting replicas if that entry is <em>from its own term</em>. Entries from previous terms become committed indirectly, once a current-term entry above them commits.</td><td>The subtle Figure-8 scenario where an entry replicated to a majority is still later overwritten. Naming this rule is a genuine expert signal.</td></tr>
  <tr><td><b>Persist before responding:</b> <code>currentTerm</code>, <code>votedFor</code>, and the log must be fsynced before any reply.</td><td>A node that crashes and restarts voting twice in the same term — which elects two leaders and destroys safety.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Reads are not automatically safe</span>
  A leader that has been silently partitioned away still <em>believes</em>
  it is leader until its next failed heartbeat round. If it answers reads
  from local state in that window, it serves stale data — a real
  linearizability violation. Real systems fix this with a read-index (confirm
  leadership with a heartbeat round before answering) or a leader lease
  (answer locally, but only within a lease shorter than the election
  timeout). This is also exactly why ZooKeeper reads are not linearizable
  unless you call <code>sync()</code> first.
</div>

<h3>Cluster sizing — always odd, almost always 3 or 5</h3>
<table>
  <tr><th>Nodes</th><th>Majority</th><th>Failures tolerated</th><th>Comment</th></tr>
  <tr><td>3</td><td>2</td><td>1</td><td>The default. Survives one node or one AZ.</td></tr>
  <tr><td>4</td><td>3</td><td>1</td><td><b>Strictly worse than 3</b> — same fault tolerance, more nodes to ack every write. Never do this.</td></tr>
  <tr><td>5</td><td>3</td><td>2</td><td>The right answer for anything critical: survives a node failure <em>during</em> a maintenance window.</td></tr>
  <tr><td>7</td><td>4</td><td>3</td><td>Rarely worth it. Every write waits for the 4th-fastest node, so latency gets worse as you add members.</td></tr>
</table>
<p class="sub">
  Consensus clusters do not scale by adding members — throughput drops as
  they grow, because every decision needs a majority ack. You scale them by
  <em>sharding the keyspace across many independent consensus groups</em>,
  which is exactly what Spanner (one Paxos group per range) and CockroachDB
  (one Raft group per range) do. Expect single-digit-millisecond writes for
  a same-region etcd cluster, and tens of milliseconds if you stretch the
  members across regions.
</p>

<h3>Paxos, briefly</h3>
<p>
  Paxos is the original (Lamport, 1989/1998) and is still the substrate for
  Chubby and Spanner. Single-decree Paxos agrees on one value with prepare
  and accept phases; Multi-Paxos amortises the prepare phase by keeping a
  stable leader — at which point it looks very much like Raft. It is
  notoriously hard to specify completely enough to implement, which is
  precisely the gap Raft was written to fill. In an interview: mention it as
  "the older, harder one that Raft was designed to replace as the teachable
  protocol", note that Multi-Paxos and Raft are equivalent in power, and
  move on. Do not attempt to derive Paxos at a whiteboard.
</p>

<h3>In practice: coordination services, split brain, and fencing</h3>
<p>
  You almost never talk to Raft directly. You talk to a coordination
  service that has already solved it and exposes a small, safe API.
</p>
<table>
  <tr><th>Service</th><th>Protocol</th><th>Shape of the API</th><th>Reach for it when…</th></tr>
  <tr><td><b>etcd</b></td><td>Raft</td><td>Key-value with revisions, leases, compare-and-swap, watches. Every write returns a monotonically increasing revision.</td><td>Kubernetes-adjacent infrastructure, service discovery, leader election, config. The default modern choice.</td></tr>
  <tr><td><b>ZooKeeper</b></td><td>Zab</td><td>Hierarchical znodes, ephemeral and sequential nodes, watches. Ephemeral+sequential is the classic leader-election recipe.</td><td>The JVM ecosystem — Kafka (historically), HBase, Solr. Battle-tested for well over a decade.</td></tr>
  <tr><td><b>Consul</b></td><td>Raft</td><td>KV, sessions, health checks, service catalogue, DNS interface.</td><td>Service discovery where health checking and multi-datacenter federation matter as much as the KV store.</td></tr>
  <tr><td><b>Your database</b></td><td>varies</td><td>A row with a unique constraint plus a lease column is a perfectly good lock if you already have a strongly consistent database.</td><td>You don't want another stateful system to operate. Often the correct, boring answer.</td></tr>
</table>
<p>
  <b>Split brain</b> is what happens when two nodes simultaneously believe
  they are the leader. Majority quorum prevents two leaders from both
  <em>committing</em>, but it does <b>not</b> prevent an old leader from
  <em>thinking</em> it is leader and acting on external systems that have no
  idea a quorum exists. The lock service is consistent; your S3 bucket, your
  payment gateway, and your file system are not participants in the
  protocol.
</p>
<p>
  The fix is a <b>fencing token</b>: the lock service hands out a
  monotonically increasing number with every grant, and every write to the
  protected resource carries it. The resource remembers the highest token it
  has seen and rejects anything lower. This moves the arbitration to the
  resource, which is the only place it can be correct.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="A sequence diagram in which client A acquires a lock with token 33 then stalls, the lease expires, client B acquires token 34 and writes successfully, and client A's later write with token 33 is rejected by the storage layer">
    <g class="rough">
      <path class="ln dash" d="M80,58 L80,286" />
      <path class="ln dash" d="M250,58 L250,286" />
      <path class="ln dash" d="M420,58 L420,286" />
      <path class="ln dash" d="M570,58 L570,286" />
      <path class="ln"  d="M80,84 L418,84" />
      <path class="ln"  d="M250,158 L418,158" />
      <path class="lng" d="M250,192 L568,192" />
      <path class="lnr" d="M80,252 L568,252" />
    </g>
    <g class="rough">
      <rect class="box"  x="25"  y="20" width="110" height="38" rx="6" />
      <rect class="box"  x="195" y="20" width="110" height="38" rx="6" />
      <rect class="boxy" x="365" y="20" width="110" height="38" rx="6" />
      <rect class="boxg" x="515" y="20" width="110" height="38" rx="6" />
    </g>
    <text class="lbl" x="80"  y="45" text-anchor="middle">client A</text>
    <text class="lbl" x="250" y="45" text-anchor="middle">client B</text>
    <text class="lbl" x="420" y="45" text-anchor="middle">lock service</text>
    <text class="lbl" x="570" y="45" text-anchor="middle">storage</text>
    <text class="sm" x="90"  y="78">acquire → token 33</text>
    <text class="sm rd" x="90" y="116">A stalls: 30 s GC pause / VM migration</text>
    <text class="sm rd" x="430" y="140">lease expires</text>
    <text class="sm" x="258" y="152">acquire → token 34</text>
    <text class="sm gr" x="258" y="186">write(token 34) — accepted</text>
    <text class="sm gr" x="430" y="222">storage records highest token = 34</text>
    <text class="sm rd" x="90"  y="246">A wakes, write(token 33) — REJECTED, 33 &lt; 34</text>
    <text class="sm" x="20" y="282">without the token, A&#39;s stale write silently overwrites B&#39;s work and nothing logs an error</text>
  </svg>
  <figcaption>The lock never actually prevented the race — the resource did. Any lock without a fencing token is only advisory.</figcaption>
</figure>
<p class="sub">
  You usually get the token for free: ZooKeeper's <code>zxid</code> and
  sequential znode number, etcd's revision or lease ID, or a
  <code>version</code> column you compare-and-swap on in your own database.
  This is also the honest answer to the long-running argument about
  Redis-based distributed locks: a multi-node Redis lock relies on bounded
  clock drift and bounded process pauses, and neither is guaranteed — so if
  you propose one, be ready to say what happens during a 30-second GC pause,
  and carry a fencing token so the answer is "nothing bad".
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll use an etcd lease for
  the leader lock, but I won't trust the lock on its own — the leader
  attaches the etcd revision as a fencing token to every write, and the
  storage layer rejects any write whose token is lower than the highest it
  has seen. That way a leader that was partitioned away and doesn't know it
  yet can't corrupt anything when it comes back."
</div>

<h3>Why you should almost never implement consensus yourself</h3>
<p>
  The happy path of Raft is a weekend project. The parts that take years are
  the ones that only show up under failure:
</p>
<ul>
  <li><b>Persistence correctness.</b> <code>currentTerm</code> and <code>votedFor</code> must be fsynced before you reply, or a crash-restart lets a node vote twice in one term and you elect two leaders. This bug is invisible in testing and unrecoverable in production.</li>
  <li><b>Membership changes.</b> Adding or removing a node while the cluster is live requires joint consensus or strict single-node changes; get it wrong and you create two disjoint majorities.</li>
  <li><b>Log compaction and snapshots.</b> Logs grow forever otherwise, and installing a snapshot on a lagging follower is a whole second protocol.</li>
  <li><b>The read path.</b> As above — the naive implementation quietly serves stale reads.</li>
  <li><b>Verification.</b> Production implementations are TLA+-specified and tested with deterministic fault injection (Jepsen, FoundationDB-style simulation). Consensus bugs are silent, and they lose committed data.</li>
</ul>
<p>
  The correct engineering answer is: use etcd, ZooKeeper, or Consul; or use a
  database that already embeds a verified implementation (Spanner,
  CockroachDB, YugabyteDB, TiDB, Kafka's KRaft). Better still, design so you
  need consensus in as few places as possible — one small, well-understood
  coordination layer that everything else defers to.
</p>
<div class="warn">
  <span class="ttl">⚠ The consensus-shaped answer that isn't</span>
  "I'll have the nodes vote among themselves" and "I'll use a heartbeat and
  whoever stops responding gets replaced" both describe a system with no
  quorum requirement — that is a split-brain generator, not consensus. If
  you cannot say which set of nodes must agree and why two such sets must
  overlap, you have not described a consensus protocol.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt says "exactly one", "only one node should", "elect", "must not run twice", or "who owns this partition" — those are all leader election in disguise.</li>
  <li>Any design with a single writer, a primary, or a coordinator has an implicit consensus dependency: ask yourself who decides who the primary is, and what happens if two nodes disagree.</li>
  <li>A naive design says "we'll use a lock in Redis." The follow-up is always the pause scenario. Have the fencing token ready before it's asked — it converts a shaky answer into a senior one.</li>
  <li>Distinguish from quorum replication: quorums give you consistency for a <em>single key</em>; consensus gives you an agreed <em>ordered log</em>, which is what you need for leadership, membership, and atomic commit.</li>
  <li>Distinguish from CAP: consensus systems are the CP corner made concrete — during a partition the minority stops. If the prompt cannot tolerate stopping, you need to move that data out of the consensus path entirely.</li>
  <li>Scope it explicitly. A good answer keeps consensus on a small amount of metadata (leases, shard maps, config) and keeps the bulk data out of it, because a consensus group's throughput is bounded by a majority round trip.</li>
</ul>`,
};
