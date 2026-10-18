import type { Chapter } from "../types";

export const sysdesReplication: Chapter = {
  id: "sysdes-replication",
  num: "I5",
  title: "Replication",
  short: "Replication",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Keeping copies of the same data on several machines is easy until the machines disagree, and then every design choice is a decision about which copy you are willing to lose.",
  body: `<h3>Why copy data at all, and why a copy is not a backup</h3>
<p>
  Replication means keeping the same data on more than one machine, and it
  does three separate jobs that are easy to blur together. It gives
  <b>availability</b>: when one machine dies another already holds the data.
  It gives <b>read capacity</b>: copies can serve queries so the original
  does not have to. And it gives <b>locality</b>: a copy in Frankfurt answers a
  European user in a few milliseconds instead of a 70 to 90 ms round trip to US East. Each job wants a different trade-off, which is why "we'll add a
  replica" is the start of a design conversation and not the end of one.
</p>
<p>
  A replica is <em>not</em> a backup. Replication copies mistakes as
  faithfully as it copies data: a bad <code>DELETE</code> or a bug that
  corrupts rows reaches every follower within moments. Backups and
  point-in-time recovery protect against your own mistakes; replicas protect
  against hardware. This chapter takes the three families in order: one
  leader with followers, several leaders, and no leader at all. It spends its
  time on the places each one loses data, because that is what interviewers
  and incidents probe. How stale a follower's reads can be is covered in the
  consistency models chapter, and the quorum arithmetic behind leaderless
  stores is covered there too; both are linked here, not repeated.
</p>

<h3>Single leader: one place decides the order</h3>
<p>
  In the most common arrangement one node, the <b>leader</b> (also called
  primary or source), accepts every write. It appends the change to a log
  and ships that log to <b>followers</b> (replicas, standbys), which apply the
  entries in the same order. Because there is one writer and one order,
  followers can never disagree about <em>what</em> happened, only about
  <em>how far along</em> they are. That single property is why this design
  dominates relational databases.
</p>

<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="A client sends a write to the leader. The leader appends it to its log, ships it to a synchronous follower that must acknowledge before the client is told, and to two asynchronous followers that are not waited for.">
    <g class="rough">
      <path class="ln"  d="M118,135 L196,135" />
      <path class="lng" d="M326,118 L430,62" />
      <path class="ln dash" d="M326,135 L430,135" />
      <path class="ln dash" d="M326,152 L430,208" />
    </g>
    <g class="rough">
      <rect class="box"  x="18"  y="110" width="100" height="50" rx="6" />
      <rect class="boxy" x="196" y="104" width="130" height="62" rx="6" />
      <rect class="boxg" x="430" y="36"  width="170" height="50" rx="6" />
      <rect class="box"  x="430" y="110" width="170" height="50" rx="6" />
      <rect class="box"  x="430" y="184" width="170" height="50" rx="6" />
    </g>
    <text class="lbl" x="68"  y="140" text-anchor="middle">client</text>
    <text class="lbl" x="261" y="128" text-anchor="middle">leader</text>
    <text class="sm"  x="261" y="148" text-anchor="middle">log: ..., 41, 42</text>
    <text class="sm gr" x="515" y="58" text-anchor="middle">follower 1 (sync)</text>
    <text class="sm gr" x="515" y="76" text-anchor="middle">commit waits for this ack</text>
    <text class="sm" x="515" y="132" text-anchor="middle">follower 2 (async)</text>
    <text class="sm" x="515" y="150" text-anchor="middle">applies when it gets there</text>
    <text class="sm" x="515" y="206" text-anchor="middle">follower 3 (async)</text>
    <text class="sm" x="515" y="224" text-anchor="middle">may be seconds behind</text>
    <text class="sm" x="126" y="124">1 write</text>
    <text class="sm gr" x="338" y="84">2 ship the log</text>
    <text class="lbl rd" x="18" y="262" style="font-size:15px">Only the sync follower is certain to hold entry 42 at "committed".</text>
  </svg>
  <figcaption>The log, not the data files, is what travels. Whether the client waits for a follower is the entire sync-versus-async decision.</figcaption>
</figure>

<h4>What exactly is in the log</h4>
<table>
  <tr><th>Log style</th><th>Ships</th><th>Where you meet it</th><th>Catch</th></tr>
  <tr><td>Physical (write-ahead log)</td><td>Low-level changes to disk pages</td><td>PostgreSQL streaming replication sends WAL records as they are generated, without waiting for a 16 MB segment to fill</td><td>The standby is a copy of the whole cluster, so it replays everything the primary does</td></tr>
  <tr><td>Row-based (logical)</td><td>Which rows changed and their new values</td><td>The MySQL binary log; row-based logging is the default in MySQL 8.4. PostgreSQL logical replication also streams row changes</td><td>Larger logs for bulk updates, but the follower never has to guess</td></tr>
  <tr><td>Statement-based</td><td>The SQL text itself</td><td>MySQL still supports it (its manual says changing <code>binlog_format</code> is deprecated), and its mixed mode uses it by default</td><td>The follower re-executes the statement, so anything non-deterministic (a random number, the current time) can produce a different row on each machine</td></tr>
</table>
<p class="sub">
  The log style decides what else replication can do. A physical standby is
  the simplest and fastest way to get a failover copy. A logical stream can
  feed a different database, a search index or a cache invalidator, which is
  why change-data-capture tools read the logical log.
</p>

<h3>Synchronous or asynchronous: you are choosing what a crash may cost</h3>
<p>
  The leader can tell the client "committed" at three moments: after its own
  disk flush, after a follower has the entry, or after a follower has applied
  it. The earlier it answers, the faster the write and the larger the window
  in which a leader crash destroys an acknowledged write. PostgreSQL exposes
  the whole range through <code>synchronous_commit</code>, and its manual
  states the baseline plainly: with asynchronous streaming, transactions that
  committed on the primary may not have reached the standby when it crashes,
  causing data loss.
</p>
<table>
  <tr><th>Setting</th><th>Commit returns after</th><th>Acknowledged write can be lost if…</th></tr>
  <tr><td>Asynchronous (<code>synchronous_standby_names</code> empty, the default)</td><td>The leader's own WAL flush</td><td>The leader dies before the standby received the record</td></tr>
  <tr><td><code>remote_write</code></td><td>The standby has received the record and handed it to its operating system, not necessarily flushed it</td><td>The primary is lost and the standby's operating system crashes before it flushes the record (the manual: the write survives a crash of the standby's PostgreSQL, not of its operating system)</td></tr>
  <tr><td><code>on</code> with a standby named</td><td>The standby has flushed the commit record to durable storage</td><td>Both machines lose their storage (the manual: the primary and every synchronous standby suffer corruption of their database storage)</td></tr>
  <tr><td><code>remote_apply</code></td><td>The standby has replayed the record, so it is visible to queries there</td><td>Same as <code>on</code>, and a read from a synchronous standby that acknowledged sees the write</td></tr>
</table>
<p>
  Notice the last row. With plain <code>on</code>, the standby has the
  record on disk but may not yet have replayed it, so a read served from that
  "synchronous" standby can still be stale. Synchronous replication buys
  <em>durability</em>; only <code>remote_apply</code> also buys read-your-writes
  from the follower, at the cost of waiting for replay too. MySQL's version is
  <b>semi-synchronous</b> replication: the source waits until at least one
  replica has received the events and written them to its relay log on disk,
  and by default it waits after the binary log is synced but before the
  transaction commits in the storage engine. If no replica answers within the
  timeout, the source quietly reverts to asynchronous replication and
  returns to semi-synchronous when a replica catches up. Read that twice:
  your durability promise silently weakens in exactly the moment a replica is
  unhealthy.
</p>

<h4>The price of waiting</h4>
<p>
  Waiting for a follower adds at least one network round trip to every commit.
  Using the planning round trips from the capacity chapter: a follower in the
  same availability zone adds about 0.5 ms, one in another zone 1 to 2 ms, and
  one across the US or to Western Europe 60 to 90 ms. A single connection that
  commits one transaction after another can then do at most
  1 &divide; 0.08 = 12.5 commits a second against a distant synchronous
  standby, where the same connection could do hundreds locally. Concurrency
  and group commit recover throughput across many connections, but each
  user-visible write still pays the latency. That is why synchronous
  replication across regions is rare and synchronous replication across zones
  is common.
</p>
<p>
  The second price is availability. If the single synchronous standby is down
  and the primary insists on its acknowledgement, writes stop. PostgreSQL's
  manual warns that such commits may never complete if a synchronous standby
  crashes. The standard fix is a <b>quorum</b>: <code>ANY 1 (s1, s2)</code>
  commits when either standby answers, while <code>FIRST 1 (s1, s2)</code>
  keeps a priority order and promotes the next standby into the synchronous
  role when the current one disconnects.
</p>
<table>
  <tr><th>Write path needs</th><th>Each machine 99.9% available, independent</th><th>Writes available</th></tr>
  <tr><td>Primary only (async)</td><td>0.999</td><td>99.9%</td></tr>
  <tr><td>Primary and one specific synchronous standby</td><td>0.999 &times; 0.999</td><td>99.8%</td></tr>
  <tr><td>Primary and any 1 of 2 standbys</td><td>0.999 &times; (1 &minus; 0.001 &times; 0.001) = 0.999 &times; 0.999999</td><td>99.9%</td></tr>
</table>
<p class="sub">
  The independence assumption is generous, since standbys in one zone share
  fate, but the shape is right: one mandatory synchronous follower costs
  availability, and a quorum of followers gives the durability back without
  the cost.
</p>

<h3>Failover: promoting a follower is easy, doing it safely is the problem</h3>
<p>
  When the leader fails, a follower must take over: something detects the
  failure, picks the follower that is furthest along, promotes it, and points
  clients and the remaining followers at it. PostgreSQL exposes promotion
  (<code>pg_ctl promote</code> or <code>pg_promote()</code>) and leaves the
  decision about <em>when</em> to external tooling or a managed service. In
  MySQL Group Replication a single-primary group elects a new primary
  automatically, preferring members on the lowest server version, then by
  member weight (default 50), then by lowest server UUID, and clients still have to be re-routed, by your proxy or by MySQL Router in an InnoDB Cluster.
</p>

<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="Timeline of a failover. The old primary acknowledges writes, a network partition begins, the standby is promoted, and the old primary keeps accepting writes, so two histories exist. Writes acknowledged by the old primary but not yet replicated are lost or must be reconciled.">
    <g class="rough">
      <path class="ln" d="M24,90 L616,90" />
      <path class="ln" d="M24,200 L616,200" />
      <path class="ln dash" d="M300,44 L300,262" />
      <path class="ln dash" d="M420,44 L420,262" />
    </g>
    <g class="rough">
      <rect class="boxg" x="40"  y="66" width="150" height="46" rx="5" />
      <rect class="boxr" x="190" y="66" width="104" height="46" rx="5" />
      <rect class="boxr" x="306" y="66" width="220" height="46" rx="5" />
      <rect class="boxg" x="40"  y="176" width="254" height="46" rx="5" />
      <rect class="boxy" x="426" y="176" width="190" height="46" rx="5" />
    </g>
    <text class="sm" x="24"  y="52">old primary</text>
    <text class="sm gr" x="115" y="94" text-anchor="middle">writes replicated</text>
    <text class="sm rd" x="242" y="86" text-anchor="middle">acked, not</text>
    <text class="sm rd" x="242" y="102" text-anchor="middle">yet shipped</text>
    <text class="sm rd" x="416" y="94" text-anchor="middle">still taking writes: split brain</text>
    <text class="sm" x="24"  y="162">standby</text>
    <text class="sm gr" x="167" y="203" text-anchor="middle">applying the log, lag 40 ms</text>
    <text class="sm" x="521" y="203" text-anchor="middle">promoted: new writes</text>
    <text class="sm" x="300" y="38" text-anchor="middle">partition</text>
    <text class="sm" x="420" y="38" text-anchor="middle">promotion</text>
    <text class="lbl rd" x="24" y="258" style="font-size:15px">At 5,000 writes a second, 40 ms of lag is 200 acknowledged writes lost.</text>
    <text class="sm" x="24" y="282">Fencing makes the old primary stop; reconciliation decides what to do with its extra 200.</text>
  </svg>
  <figcaption>Two separate problems share one diagram: the writes in the red box are lost by an async failover, and the red bar on the right is what happens if nobody stops the old primary.</figcaption>
</figure>

<h4>Hazard 1: lost writes</h4>
<p>
  With asynchronous replication the new primary is missing whatever the old
  one had acknowledged but not shipped. The size of that loss is lag times
  write rate: 0.040 s &times; 5,000 writes a second (the planning write rate for
  one relational primary) is 200 writes. Choosing the most advanced follower
  (highest log position) minimises the loss; a synchronous or quorum standby
  drives it to zero for the acknowledged writes it covers, provided the failover tool can compare the standbys' log positions and promote one that holds every acknowledged write. With a quorum of 1 out of 2, a promoted standby that happens to be the lagging one would silently drop acknowledged writes. The lost writes are
  not gone from the world: they sit on the old primary's disk, and someone has
  to decide whether to replay, discard or hand them back to users.
</p>

<h4>Hazard 2: two primaries</h4>
<p>
  A false failure is worse than a real one. A network partition, a long
  garbage-collection pause or an overloaded primary that misses its heartbeat
  looks identical to a crash from outside. The failover tool promotes the
  standby, the old primary is still alive and still has clients connected, and
  now both accept writes. The distributed consensus chapter explains why
  quorum elections do not stop a stale leader from acting on resources outside
  the quorum, and why a <b>fencing token</b> is the cure. For databases the
  practical forms are:
</p>
<ul>
  <li><b>Shoot the old primary</b> (power it off, cut its network port, revoke its storage lease) before the promotion completes.</li>
  <li><b>Make the old primary demote itself</b> when it loses its lease, so it stops by its own clock.</li>
  <li><b>Never let it rejoin as a primary.</b> After promotion the cluster has moved to a new timeline, and the old primary holds writes that exist nowhere else. It must be rebuilt as a follower of the new primary, or its extra writes must be reconciled by hand. PostgreSQL standbys follow the switch automatically when <code>recovery_target_timeline</code> is <code>latest</code>, its default.</li>
</ul>
<p>
  Detection is a trade-off too. A short timeout means a load spike triggers a
  needless failover (which itself causes load); a long one extends the outage.
  Tuning it down to a few seconds without fencing is how teams manufacture
  split brain.
</p>

<div class="warn">
  <span class="ttl">⚠ A real 43-second partition became a 24-hour incident</span>
  On 21 October 2018 maintenance on a failing optical link cut GitHub's US East
  Coast network hub off from its primary data center for 43 seconds. Its
  Orchestrator failover tooling, running a Raft quorum, promoted primaries in
  the West Coast data center during the gap. When the link returned, each side
  held writes the other did not: the post-incident analysis describes a few
  seconds of unreplicated writes, with 954 writes on one of the busiest
  clusters. Because both sides had unique data, GitHub could not simply fail
  back, and service was degraded for 24 hours and 11 minutes while it
  reconciled the data. GitHub's analysis points to several causes: the few seconds of unreplicated writes, nearly 40 minutes of new writes on the West Coast that blocked a simple fail-back, and a cross-country topology the application tier could not run well.
</div>

<h4>Hazard 3: things outside the database remember the old primary</h4>
<p>
  If the old primary handed out identifiers 1001 to 1200 and those were
  emailed, cached or published before it died, the new primary's counter may
  start at 1001 again and reuse them. Clients with cached connections keep
  writing to the old address, and caches that were warmed from the old primary
  hold values the new primary never saw. Plan the redirect (DNS, a proxy, a
  service-discovery update) and the cache flush as part of failover, not after
  it. A <b>planned switchover</b> removes the first two hazards and shrinks the third: stop writes, let the follower catch up to the leader's position, demote the old leader, promote the follower, and nothing is lost. You still re-point clients and flush caches.
</p>

<h3>Followers, lag and the operational cost of read replicas</h3>
<p>
  Lag, and the session guarantees that hide it, belong to the consistency
  models chapter. What belongs here is measuring it and knowing what makes
  it grow. PostgreSQL reports three separate lags per standby in its
  <code>pg_stat_replication</code> view: <code>write_lag</code>,
  <code>flush_lag</code> and <code>replay_lag</code>, each the time until the
  standby has written, flushed or applied recent WAL. They answer different
  questions: flush lag tells you about durability, replay lag tells you about
  what a reader sees. Alert on replay lag for read replicas.
</p>
<p>
  Two hot-standby traps recur. A read-only query on a standby can conflict
  with the stream of changes it is replaying, for example when the primary
  vacuums away rows the query still needs, so replay is held up or the query
  is cancelled. Setting <code>hot_standby_feedback</code> tells the primary
  what the standby still needs and prevents the cancellations, at the cost of
  letting dead rows pile up on the primary. And a standby that disconnects with
  a replication slot makes the primary keep WAL for it, which the manual
  warns can fill the disk allocated for <code>pg_wal</code>. The <code>max_slot_wal_keep_size</code> setting caps how much WAL a slot may hold.
</p>

<h3>Multi-leader: writes in more than one place, and the bill that arrives</h3>
<p>
  With several leaders, each accepts writes and forwards them to the others.
  It earns its keep in three situations: users in several regions who need
  local write latency (a US East to Europe write that waits on a 70 to 90 ms round trip feels slow), clients that must work offline (every phone is a leader
  that syncs later), and collaborative editing. The price is that two leaders
  can accept conflicting writes to the same record at the same time, and
  nothing in the architecture says which one is right.
</p>
<p>
  The cheapest defence is to <b>avoid the conflict</b>: route every record to
  a home leader (a user's profile is written only in that user's home
  region) so that concurrent writes to one record cannot happen. That is
  single-leader per record with multi-leader plumbing, and it breaks only
  when the home region is down. When you cannot avoid conflicts you must pick
  a resolution rule. The rules, from cheapest to most careful:
</p>
<table>
  <tr><th>Rule</th><th>How it works</th><th>What it loses</th></tr>
  <tr><td>Last write wins (LWW)</td><td>Each write carries a timestamp; the highest timestamp replaces the other</td><td>The losing write, silently, with no error to its author. And "last" is decided by clocks that disagree</td></tr>
  <tr><td>Keep both, resolve on read</td><td>Store the concurrent versions as siblings and let the application merge them. Dynamo's shopping cart merges the divergent carts</td><td>Nothing is lost, but deleted items can resurface, as the Dynamo paper says of the cart</td></tr>
  <tr><td>Merge by construction (CRDT)</td><td>Use a data type whose merge operation is commutative, associative and idempotent, so replicas that have seen the same updates reach the same state</td><td>You are limited to types that have a merge: counters, sets, registers, sequences. Metadata can grow</td></tr>
  <tr><td>Reject or serialise</td><td>Detect the conflict and abort one side, or send writes through one leader</td><td>Availability: the aborted write has to be retried by someone</td></tr>
</table>

<h4>Dry run: the same two concurrent writes under LWW and under a CRDT</h4>
<p>
  Two regions, A and B, both hold a profile with <code>bio = "Hi"</code> and a
  like counter of 5. Region A's clock is exact. Region B's clock runs 80 ms
  slow. Two users act at nearly the same time, and each region first applies
  the write locally.
</p>
<table>
  <tr><th>Step (true time)</th><th>Region A</th><th>Region B</th><th>Note</th></tr>
  <tr><td>0.000 s</td><td>bio "Hi", likes 5</td><td>bio "Hi", likes 5</td><td>Replicas agree</td></tr>
  <tr><td>10.000 s</td><td>writes bio "Hello" stamped 10.000; likes 6 stamped 10.000</td><td>unchanged</td><td>A's clock is exact</td></tr>
  <tr><td>10.020 s</td><td>unchanged</td><td>writes bio "Hey" stamped 10.020 &minus; 0.080 = 9.940; likes 6 stamped 9.940</td><td>B's write is 20 ms later but looks 60 ms earlier. A's write cannot have reached B yet (the one-way delay is 35 to 45 ms), so the writes are concurrent</td></tr>
  <tr><td>about 10.060 s, replication crosses</td><td>receives "Hey" @ 9.940; 9.940 &lt; 10.000, so it keeps "Hello"</td><td>receives "Hello" @ 10.000; 10.000 &gt; 9.940, so it replaces "Hey"</td><td>Both converge on "Hello"</td></tr>
  <tr><td>Result under LWW</td><td>bio "Hello"; likes 6</td><td>bio "Hello"; likes 6</td><td>Replicas agree, but the later bio edit is gone, and two +1 clicks became one</td></tr>
  <tr><td>Result with a counter CRDT (5 is the starting value; a grow-only counter keeps one increment slot per replica, here A:1 and B:1, and merge takes the maximum of each slot)</td><td>{A:1, B:1}, 5 + 2 = 7</td><td>{A:1, B:1}, 5 + 2 = 7</td><td>No increment lost. The bio, being a plain overwrite, still needs a rule</td></tr>
</table>
<p class="sub">
  Two lessons sit in that table. LWW converges, which makes it look safe, but
  convergence is not the same as keeping what users did. And the counter is
  exactly the case where you should not use overwrite semantics at all:
  model it as increments and the problem disappears. (A button that can also be undone needs separate increment and decrement slots, a PN-counter.)
</p>

<h4>How real systems handle multi-leader writes</h4>
<ul>
  <li><b>DynamoDB global tables.</b> In the default multi-Region eventual consistency mode, each item change is replicated asynchronously to the other Regions, and when the same item is modified in several Regions at once the modification with the latest internal timestamp wins on a per-item basis. A strongly consistent read returns the latest version only if the item was last updated in that Region, and transactions are atomic only within the Region where they ran, so another Region can briefly see part of one. The alternative multi-Region strong consistency mode replicates synchronously to at least one other Region before the write returns, requires exactly three Regions (three replicas, or two plus a witness), and does not support transactions or TTL. A write that collides with one in flight elsewhere fails with <code>ReplicatedWriteConflictException</code> and can be retried.</li>
  <li><b>PostgreSQL logical replication.</b> The manual says a conflict that produces an error, for example a duplicate on a unique key, stops replication until a person fixes it, either by changing the data or by skipping the transaction, which it warns can leave the subscriber inconsistent. When a row was last changed by a different origin, the incoming update is applied anyway, so the remote write always wins (the conflict is logged only if <code>track_commit_timestamp</code> is on at the subscriber). There is no general resolution policy. Treat it as a way to move changes between databases that do not write the same rows.</li>
  <li><b>MySQL Group Replication.</b> Multi-primary mode is optimistic: members execute transactions locally and roll them back if the group cannot certify them. A transaction run under SERIALIZABLE isolation fails to commit in a multi-primary group, and a group is limited to 9 members. Consensus on transaction order is Paxos-based.</li>
</ul>

<h3>Leaderless: any replica takes writes, and repair does the cleaning</h3>
<p>
  Dynamo-style stores such as Cassandra have no leader. A client or
  coordinator sends each write to all N replicas of the key and counts
  acknowledgements against W; reads gather R. The arithmetic of R + W &gt; N, the
  worked example, and the hinted-handoff caveat are in the consistency models
  chapter and are not repeated. What that chapter leaves out is how replicas
  that missed a write catch up, which happens in three layers.
</p>
<table>
  <tr><th>Mechanism</th><th>When it runs</th><th>What it fixes</th><th>Limits</th></tr>
  <tr><td><b>Read repair</b></td><td>During a read</td><td>The coordinator asks one replica for the data and others for a digest (hash). If they differ it fetches the full data, takes the newest by timestamp and writes it to the stale replicas involved in the read. The client waits for this</td><td>Only repairs keys that are read. Does not happen at consistency level ONE or LOCAL_ONE. Cassandra 4.0 removed the old background (probabilistic) read repair</td></tr>
  <tr><td><b>Hinted handoff</b></td><td>When a replica is down at write time</td><td>The coordinator stores the write as a hint and replays it when the replica returns</td><td>Best effort: Cassandra's docs say hints do not guarantee eventual consistency. By default hints are kept only for a 3-hour window; after that the replica stays stale until repair</td></tr>
  <tr><td><b>Anti-entropy repair</b></td><td>On a schedule, normally started by the operator</td><td>Replicas compare Merkle trees (hierarchies of hashes) over their shared token ranges and stream the differences</td><td>Not automatic by default (Cassandra 5.0.8 and later have an opt-in repair scheduler). It must run often enough, as the next paragraph explains</td></tr>
</table>

<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="Two Merkle trees, one for each replica, each with four leaf ranges. The roots differ, the left child hashes differ, the right child hashes match, and within the left subtree only the second leaf range differs, so only that range is streamed.">
    <g class="rough">
      <path class="ln"  d="M160,60 L100,108" />
      <path class="ln"  d="M160,60 L220,108" />
      <path class="ln"  d="M100,128 L70,176" />
      <path class="lnr" d="M100,128 L130,176" />
      <path class="ln"  d="M220,128 L190,176" />
      <path class="ln"  d="M220,128 L250,176" />
      <path class="ln"  d="M480,60 L420,108" />
      <path class="ln"  d="M480,60 L540,108" />
      <path class="ln"  d="M420,128 L390,176" />
      <path class="lnr" d="M420,128 L450,176" />
      <path class="ln"  d="M540,128 L510,176" />
      <path class="ln"  d="M540,128 L570,176" />
    </g>
    <g class="rough">
      <rect class="boxr" x="130" y="36"  width="60" height="26" rx="5" />
      <rect class="boxr" x="70"  y="106" width="60" height="26" rx="5" />
      <rect class="boxg" x="190" y="106" width="60" height="26" rx="5" />
      <rect class="boxg" x="42"  y="178" width="56" height="26" rx="5" />
      <rect class="boxr" x="102" y="178" width="56" height="26" rx="5" />
      <rect class="boxg" x="162" y="178" width="56" height="26" rx="5" />
      <rect class="boxg" x="222" y="178" width="56" height="26" rx="5" />
      <rect class="boxr" x="450" y="36"  width="60" height="26" rx="5" />
      <rect class="boxr" x="390" y="106" width="60" height="26" rx="5" />
      <rect class="boxg" x="510" y="106" width="60" height="26" rx="5" />
      <rect class="boxg" x="362" y="178" width="56" height="26" rx="5" />
      <rect class="boxr" x="422" y="178" width="56" height="26" rx="5" />
      <rect class="boxg" x="482" y="178" width="56" height="26" rx="5" />
      <rect class="boxg" x="542" y="178" width="56" height="26" rx="5" />
    </g>
    <text class="sm" x="160" y="26" text-anchor="middle">replica 1</text>
    <text class="sm" x="480" y="26" text-anchor="middle">replica 2</text>
    <text class="sm" x="160" y="53" text-anchor="middle">root</text>
    <text class="sm" x="480" y="53" text-anchor="middle">root</text>
    <text class="sm" x="70"  y="222" text-anchor="middle">range 1</text>
    <text class="sm" x="130" y="222" text-anchor="middle">range 2</text>
    <text class="sm" x="190" y="222" text-anchor="middle">range 3</text>
    <text class="sm" x="250" y="222" text-anchor="middle">range 4</text>
    <text class="sm" x="390" y="222" text-anchor="middle">range 1</text>
    <text class="sm" x="450" y="222" text-anchor="middle">range 2</text>
    <text class="sm" x="510" y="222" text-anchor="middle">range 3</text>
    <text class="sm" x="570" y="222" text-anchor="middle">range 4</text>
    <text class="lbl rd" x="320" y="250" text-anchor="middle" style="font-size:15px">Root differs, so descend. Only the red path differs, so only range 2 is streamed.</text>
  </svg>
  <figcaption>Comparing hashes top down means two replicas holding gigabytes exchange a few hashes and then only the ranges that disagree. A leaf covers a range of keys, not one key, so a mismatch streams that range.</figcaption>
</figure>

<h4>The deadline that makes repair mandatory</h4>
<p>
  Deletes are writes too: Cassandra records a delete as a tombstone and
  purges it after <code>gc_grace_seconds</code>, 10 days by default. If a replica
  missed the delete and the tombstone is purged everywhere else before repair
  reaches it, the old value is still there, and the next repair spreads it
  back across the cluster as if it were new. The data you deleted comes back.
  The Cassandra documentation therefore says to repair every node at least once
  within the grace period, advising every 7 days so that 10 &minus; 7 = 3 days of
  slack absorb delays, with incremental repair (the default) every 1 to 3 days
  and a full repair every 1 to 3 weeks as a starting point.
</p>
<p>
  Leaderless stores also need a rule for concurrent versions of one key. The
  Dynamo paper used vector clocks to detect them and hand both versions back
  to the application; it truncates a clock when it grows past a threshold
  (the paper's example is 10 node-and-counter pairs) by dropping the oldest, which the
  paper concedes can blur the ancestry check. Cassandra chose the simpler
  rule: every mutation carries a timestamp, taken from the client if it
  supplies one and otherwise from the coordinator's clock in microseconds, and
  the highest wins. That is last write wins with all the clock hazards from
  the dry run above, which is why the Cassandra documentation tells you to
  run NTP. Monotonic and causal clocks are the subject of the time and
  ordering chapter.
</p>
<p>
  One more Cassandra detail worth quoting in an interview: blocking read
  repair gives <em>monotonic quorum reads</em>, so two successive QUORUM reads
  never go backwards even when a failed write reached only a minority of
  replicas. The table option <code>read_repair='NONE'</code> turns the
  write-back off and gives up that guarantee in exchange for partition-level
  write atomicity.
</p>

<h3>How the four systems you will be asked about really do it</h3>
<table>
  <tr><th>System</th><th>Topology</th><th>Default durability</th><th>Failure and conflict story</th></tr>
  <tr><td><b>PostgreSQL</b></td><td>One primary, physical streaming standbys; logical replication for selected tables</td><td>Asynchronous; synchronous or quorum (<code>FIRST</code>, <code>ANY</code>) by configuration</td><td>Promotion is a command; the decision is external. Old primary must be rebuilt or rejoin on the new timeline. Logical replication conflicts stop the stream</td></tr>
  <tr><td><b>MySQL</b></td><td>One source with replicas shipping the row-based binary log. Group Replication adds a Paxos-based group, single- or multi-primary</td><td>Asynchronous; semi-synchronous waits for one replica's relay log and falls back to async on timeout</td><td>Group Replication elects a new primary and you re-route clients; multi-primary rolls back certification failures</td></tr>
  <tr><td><b>Cassandra</b></td><td>Leaderless, N replicas per key, replication factor set per datacenter with NetworkTopologyStrategy</td><td>Per-query consistency level; writes always go to all replicas</td><td>Hints, read repair and anti-entropy repair converge replicas; conflicts resolved by highest timestamp</td></tr>
  <tr><td><b>DynamoDB</b></td><td>Each partition has a replication group across Availability Zones using Multi-Paxos, with a leased leader; global tables add Regions</td><td>A write is acknowledged once a quorum of the group persists its log record: two of three replicas from different zones</td><td>Only the leader serves writes and strongly consistent reads; any replica serves eventually consistent reads. Cross-Region conflicts: last writer wins, or strong consistency mode</td></tr>
</table>
<p class="sub">
  The pattern across all four: a leader-based system decides order in one
  place and pays at failover; a leaderless system never fails over and pays on
  every read and in repair; a multi-region system picks between latency and
  conflicts. Notice that DynamoDB inside a Region looks like a consensus-backed
  single leader per partition, the shape described in the distributed
  consensus chapter, and only becomes multi-leader with last writer wins when you ask it to span Regions in its default mode.
</p>

<h3>Choosing, in one table</h3>
<table>
  <tr><th>If the requirement is…</th><th>Reach for</th><th>Because</th></tr>
  <tr><td>Read-heavy, one region, relational</td><td>Single leader, async followers</td><td>Simplest; accept the failover loss window, or add a quorum standby for zero loss of acknowledged writes</td></tr>
  <tr><td>No acknowledged write may ever be lost</td><td>Synchronous or quorum standby, ideally in another zone</td><td>The RPO is zero but you pay a round trip per commit and need a quorum to stay writable</td></tr>
  <tr><td>Low-latency writes in several regions</td><td>Home-region routing first; multi-leader only if you must</td><td>Avoiding the conflict is cheaper than resolving it</td></tr>
  <tr><td>Offline clients or collaborative editing</td><td>Multi-leader with CRDTs or application merge</td><td>Conflicts are normal, so make merging a design primitive</td></tr>
  <tr><td>Always writable through zone loss, tolerant of staleness</td><td>Leaderless with N=3 and a repair schedule</td><td>No failover to botch, at the cost of repair operations and timestamp conflicts</td></tr>
</table>

<div class="say">
  <span class="ttl">Say it like this →</span> "One leader per shard with two
  followers in other zones. Commits wait for one of the two followers, so an
  acknowledged write survives losing the leader, and I only need one of them
  to be up to keep writing. Reads that must be fresh go to the leader. For
  failover I'd fence the old leader before promoting, because a false
  positive with two writers is worse than a few seconds of downtime. If you
  want multi-region writes I'd first route each user to a home region, and
  only then talk about resolving conflicts, with increments as counters
  rather than overwrites."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "multi-region", "survive a datacenter loss", "read replicas", "zero data loss", "offline mode", "collaborative editing". Each one is a replication-topology question in disguise.</li>
  <li><b>The naive design</b> adds a replica and stops. Ask three follow-ups yourself: is it synchronous, what happens to writes the replica lacks when the leader dies, and who stops the old leader from coming back.</li>
  <li><b>Count the loss window.</b> Lag &times; write rate gives the number of acknowledged writes at risk in an async failover (40 ms &times; 5,000 per second = 200). A number beats "a few".</li>
  <li><b>Multi-leader means conflicts</b>, so say which rule you pick for which field: counters as CRDTs, free text as last-write-wins only if losing an edit is acceptable, uniqueness through a single home or a constraint check, never through eventual convergence.</li>
  <li><b>Leaderless means repair.</b> If you pick Cassandra or DynamoDB-style storage, volunteer the repair schedule and the delete-resurrection risk. It signals you have operated one.</li>
  <li><b>The pitfall to avoid:</b> calling a replica a backup, or promising "no data loss" while using asynchronous replication.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Compute how many acknowledged writes a failover can lose given a lag and a write rate, and say which setting drives it to zero.</li>
    <li>Explain why a single mandatory synchronous standby lowers write availability, and how a quorum of standbys fixes it.</li>
    <li>Describe two ways split brain happens during failover and three defences against it.</li>
    <li>Walk the dry run: why do both regions converge, and what did last-write-wins throw away that a counter CRDT keeps?</li>
    <li>Name the three layers of Cassandra convergence, and explain why skipping repair can bring deleted data back.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.postgresql.org/docs/current/warm-standby.html" rel="noopener noreferrer">PostgreSQL: log-shipping standby servers</a> — streaming replication, synchronous replication, FIRST and ANY, promotion, replication slots, hot standby feedback</li>
    <li><a href="https://www.postgresql.org/docs/current/logical-replication-conflicts.html" rel="noopener noreferrer">PostgreSQL: logical replication conflicts</a> — which conflicts stop replication and which are applied</li>
    <li><a href="https://dev.mysql.com/doc/refman/8.4/en/replication-semisync.html" rel="noopener noreferrer">MySQL 8.4: semisynchronous replication</a> — wait point and the fall back to asynchronous</li>
    <li><a href="https://dev.mysql.com/doc/refman/8.4/en/group-replication-limitations.html" rel="noopener noreferrer">MySQL 8.4: Group Replication limitations</a> — the 9-member limit and SERIALIZABLE in multi-primary groups</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/operating/read_repair.html" rel="noopener noreferrer">Cassandra: read repair</a> — blocking read repair, monotonic quorum reads, the read_repair table option</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/operating/hints.html" rel="noopener noreferrer">Cassandra: hints</a> — best-effort hinted handoff and the 3-hour window</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/operating/repair.html" rel="noopener noreferrer">Cassandra: repair</a> — Merkle trees, incremental and full repair, the gc_grace deadline</li>
    <li><a href="https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/V2globaltables_HowItWorks.html" rel="noopener noreferrer">DynamoDB global tables: how they work</a> — last writer wins, MREC and MRSC</li>
    <li><a href="https://www.usenix.org/conference/atc22/presentation/elhemali" rel="noopener noreferrer">DynamoDB paper (USENIX ATC 2022)</a> — Multi-Paxos replication groups, leader leases, quorum-acknowledged log writes</li>
    <li><a href="https://www.amazon.science/publications/dynamo-amazons-highly-available-key-value-store" rel="noopener noreferrer">Dynamo paper (SOSP 2007)</a> — vector clocks, merged shopping carts, hinted handoff, Merkle-tree anti-entropy</li>
    <li><a href="https://dev.mysql.com/doc/refman/8.4/en/group-replication-multi-primary-mode.html" rel="noopener noreferrer">MySQL 8.4: Group Replication multi-primary mode</a> — optimistic execution, certification failures, SERIALIZABLE commits fail</li>
    <li><a href="https://github.blog/news-insights/company-news/oct21-post-incident-analysis/" rel="noopener noreferrer">GitHub: October 21 post-incident analysis</a> — a 43-second partition, a cross-datacenter failover and 24 hours of reconciliation</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026, for PostgreSQL 18, MySQL 8.4 and Cassandra 5.0. Figures marked "planning" are rules of thumb, not guarantees; the 40 ms lag and the 99.9% machine availability are illustrative inputs.</p>
</div>`,
};
