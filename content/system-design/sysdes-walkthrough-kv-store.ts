import type { Chapter } from "../types";

export const sysdesWalkthroughKvStore: Chapter = {
  id: "sysdes-walkthrough-kv-store",
  num: "A12",
  title: "Walkthrough: a key-value store",
  short: "Walkthrough: key-value store",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "A Dynamo-style store is not one clever idea but eight ordinary ones bolted together, and the interview is about the decision you make at each seam.",
  body: `<h3>What you are building, and what you refuse to build</h3>
<p>
  "Design a key-value store" (it is the sixth chapter of Alex Xu's first
  volume) sounds like a data-structure question and is really an assembly
  question. The hash map is the easy part. The task is to make it survive the loss
  of machines, outgrow one machine, and stay writable while the network is
  broken, using parts you have already met in this course. So this chapter does not
  re-teach them. It names each part, links the chapter that explains it, and spends
  its words on the <b>seams</b>: the choices where one part constrains the next.
</p>
<p>
  The model is the one in Amazon's Dynamo paper (SOSP 2007), which the paper pins
  down tightly: state is stored as binary objects identified by a key, no operation
  spans multiple items, there is no relational schema, and the objects are
  relatively small, usually under 1 MB. That scope is the whole bargain. By
  refusing transactions, secondary indexes and range scans you get a system where
  every request touches one key, so every request can be routed by a hash, and
  capacity grows by adding machines.
</p>
<table>
  <tr><th>Requirement</th><th>Decision</th><th>Where it is explained</th></tr>
  <tr><td>More data than one machine holds</td><td>Hash-partition the key space on a ring with virtual nodes</td><td><a href="/system-design/sysdes-sharding-partitioning">Sharding</a></td></tr>
  <tr><td>Survive machine and zone loss</td><td>N copies of each key on distinct machines, spread over failure domains</td><td><a href="/system-design/sysdes-replication">Replication</a></td></tr>
  <tr><td>Stay writable during a partition</td><td>Choose availability over consistency (AP), with tunable quorums</td><td><a href="/system-design/sysdes-cap-theorem-depth">CAP</a>, <a href="/system-design/sysdes-consistency-models">consistency models</a></td></tr>
  <tr><td>Concurrent writes will happen</td><td>Version every value: a vector clock or a timestamp</td><td><a href="/system-design/sysdes-time-ordering-ids">Time and ordering</a></td></tr>
  <tr><td>Copies drift apart</td><td>Hinted handoff, read repair, Merkle-tree anti-entropy</td><td>Replication, and below</td></tr>
  <tr><td>No coordinator to fail</td><td>Gossip membership and a local failure detector</td><td>Below</td></tr>
  <tr><td>Fast, durable local writes</td><td>An LSM storage engine: commit log, memtable, SSTables</td><td><a href="/system-design/sysdes-storage-engines">Storage engines</a></td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The AP choice is the first decision, not a detail</span>
  Everything after this row depends on saying out loud that writes keep being
  accepted when replicas cannot talk to each other, and that you will reconcile
  later. A strongly consistent store (a consensus group per key range, as in the
  <a href="/system-design/sysdes-distributed-consensus">consensus chapter</a>) is a legitimate
  alternative; it needs a different list of components. Amazon DynamoDB, the
  managed service, is a different design from the Dynamo paper (see the replication
  chapter), so do not answer a Dynamo question by describing DynamoDB.
</div>

<h3>Capacity estimation</h3>
<p>
  The assumptions are mine, chosen to be round; the structure of the estimate is
  what to copy.
</p>
<ul>
  <li><b>Data:</b> 5 billion keys × 1 KB average value = <b>5 TB</b> of user data. With N = 3 replicas, <b>15 TB</b> stored.</li>
  <li><b>Traffic at peak:</b> 100,000 reads a second and 50,000 writes a second.</li>
  <li><b>Fan-out into replica work.</b> Following Cassandra's read path, a read at R = 2 asks two replicas (one returns the data, one a digest), so 100,000 × 2 = 200,000 replica reads. (The Dynamo paper's coordinator instead asks all N replicas and waits for R answers: 300,000 reads, 450,000 operations in total, about 75 nodes at the same utilization.) A write goes to all three replicas, so 50,000 × 3 = 150,000 replica writes. Total <b>350,000 replica operations a second</b>.</li>
  <li><b>Node count.</b> Take 10,000 operations a second per node as a conservative planning figure and plan to run at 60%, so 6,000 usable: 350,000 ÷ 6,000 = 58.3, so <b>60 nodes</b>, 20 in each of three availability zones.</li>
  <li><b>Storage per node:</b> 15 TB ÷ 60 = <b>250 GB</b>. Throughput, not capacity, set the node count, which is typical for this workload and is why I would not pay for 4 TB disks.</li>
  <li><b>Write path per node:</b> 150,000 ÷ 60 = 2,500 replica writes a second × 1 KB = <b>2.5 MB/s</b> into the commit log. A 32 MiB commit log segment (33.6 MB) fills in about 13 seconds. At the storage chapter's assumed write amplification of 20, compaction writes about <b>50 MB/s</b> per node. The compaction budget, not the 2.5 MB/s, is what you size disks for.</li>
  <li><b>Cross-zone traffic:</b> each write sends the value to two replicas in other zones: 50,000 × 2 × 1 KB = <b>100 MB/s</b>, about 0.8 Gbps.</li>
  <li><b>Growth:</b> adding the 61st node moves 15 TB ÷ 61 = <b>246 GB</b> to it. At an assumed 100 MB/s streaming throttle that takes 2,460 seconds, about 41 minutes. Scaling out is slow and should start well before you need it.</li>
</ul>

<h3>Partitioning: the ring and its settings</h3>
<p>
  Hash each key onto a ring; each node owns tokens, and a key belongs to the first
  node clockwise from its hash. The sharding chapter works through why
  <code>hash mod N</code> fails and why virtual nodes are the real trick. The
  decisions that remain are quantitative. How many tokens? Cassandra 5.0's
  <code>num_tokens</code> default is 16 (older versions used 256 random tokens, and
  the docs say newer versions use a deterministic allocator that needs far fewer
  per node). For 60 nodes that is 960 tokens. What do tokens buy? When a node
  dies or joins, its ranges move in many small pieces to or from many neighbours
  instead of dumping all its load on one.
</p>
<p>
  The Dynamo paper adds a decision worth knowing because it explains operational
  pain. Its first scheme gave each node random tokens, so the partition boundaries
  were set by the tokens. Moving data meant recomputing Merkle trees and
  archiving the key space was hard, because partitioning and placement were
  entangled. The paper's third scheme (Q/S tokens per node) divides the hash space
  into Q equal partitions and then places partitions on nodes. Placement can change
  without changing partitioning, a partition is one file that can be archived or
  shipped as a unit, and the paper reports it had the best load-balance efficiency
  for the same amount of per-node metadata, at a cost: changing the node count needs
  coordination. The takeaway for an interview is a single sentence: <em>decouple the
  partition from the node that owns it</em>, so rebalancing moves whole partitions
  and nothing is rehashed.
</p>
<p>
  Replica placement is the next seam. The coordinator stores the key and
  copies it to the next N − 1 distinct clockwise nodes. With virtual nodes the next
  N positions can belong to fewer than N machines, so the paper builds the
  <b>preference list</b> by skipping positions until it has N distinct physical
  nodes, and spreads the list across data centers. In practice you extend this to
  racks and zones. If you remember one rule: the preference list is chosen for
  <b>failure-domain diversity</b>, not for ring adjacency.
</p>

<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="A hash ring with five nodes A at 100, B at 300, C at 500, D at 700 and E at 900. A key hashing to 250 belongs to B, with the preference list B, C, D. C has failed, shown in red, and E, shown in yellow, holds a hinted replica for C.">
    <g class="rough">
      <path class="ln" d="M190,55 A95,95 0 0 1 190,245 A95,95 0 0 1 190,55" />
      <path class="ln dash" d="M190,150 L285,150" />
      <circle class="box"  cx="246" cy="73"  r="17" />
      <circle class="boxg" cx="280" cy="179" r="17" />
      <circle class="boxr" cx="190" cy="245" r="17" />
      <circle class="boxg" cx="100" cy="179" r="17" />
      <circle class="boxy" cx="134" cy="73"  r="17" />
      <circle class="boxg" cx="285" cy="150" r="4" />
    </g>
    <text class="sm" x="246" y="77"  text-anchor="middle">A</text>
    <text class="sm" x="280" y="183" text-anchor="middle">B</text>
    <text class="sm" x="190" y="249" text-anchor="middle">C</text>
    <text class="sm" x="100" y="183" text-anchor="middle">D</text>
    <text class="sm" x="134" y="77"  text-anchor="middle">E</text>
    <text class="sm" x="196" y="144">key k = 250</text>
    <text class="sm" x="268" y="52">100</text>
    <text class="sm" x="304" y="196">300</text>
    <text class="sm" x="210" y="265">500</text>
    <text class="sm" x="52"  y="196">700</text>
    <text class="sm" x="96"  y="52">900</text>
    <text class="lbl" x="350" y="40" style="font-size:14px">key k hashes to 250</text>
    <text class="sm" x="350" y="64">first node clockwise: B, the coordinator</text>
    <text class="sm gr" x="350" y="88">preference list (N = 3): B, C, D</text>
    <text class="sm rd" x="350" y="112">C is down: the write cannot reach it</text>
    <text class="sm" x="350" y="136">E, the next healthy node, takes a hinted</text>
    <text class="sm" x="350" y="152">replica labelled "for C"</text>
    <text class="sm" x="350" y="190">sloppy quorum: B, D and E count (Dynamo)</text>
    <text class="sm" x="350" y="206">strict quorum: only B and D count, B keeps</text>
    <text class="sm" x="350" y="222">the hint (Cassandra)</text>
    <text class="lbl" x="350" y="262" style="font-size:14px">one token per node here; with virtual nodes each</text>
    <text class="lbl" x="350" y="282" style="font-size:14px">machine owns many positions on the same circle</text>
  </svg>
  <figcaption>The ring used by the first dry run. Positions run 0 to 999 clockwise from the top and are chosen for illustration.</figcaption>
</figure>

<h3>The request path: who coordinates, and what a quorum costs</h3>
<p>
  Any node can receive a request, and the key's coordinator, typically the first of
  the top N nodes in the preference list, runs it. The paper describes two ways to
  reach the coordinator. A generic load balancer sends the request to a random
  node, which forwards it if it is not in the key's preference list: the client
  needs no special library, at the cost of a possible extra hop. A
  partition-aware client library routes directly and skips the hop, at the cost of
  shipping Dynamo-specific code into every client. Either way, every node needs to
  know the ring, which is what gossip is for (below).
</p>
<p>
  For a <code>put</code> the coordinator generates the new version's vector clock,
  writes it locally, sends it to the other replicas and succeeds when at least
  W − 1 others respond. For a <code>get</code> it asks the replicas and waits for R
  responses. If it gets several versions that are causally unrelated, it returns them
  all. The paper's own note on cost is the one to remember: the latency of a get or
  put is dictated by the <em>slowest of the R or W replicas</em> it must wait for,
  which is why R and W are usually set below N.
</p>
<p>
  The table and the availability sum below assume <b>strict quorums</b>, where only the real
  replicas count. A sloppy quorum (Dynamo's) raises write availability, because a stand-in
  node can take the write, and weakens the guarantee that a read overlaps the latest write.
</p>
<table>
  <tr><th>(N, W, R)</th><th>R + W &gt; N?</th><th>Replicas that may be down for a write / a read</th><th>Choose it for</th></tr>
  <tr><td>(3, 2, 2)</td><td>4 &gt; 3, yes</td><td>1 / 1</td><td>The common setting. The Dynamo paper says (3, 2, 2) was the configuration used by several instances</td></tr>
  <tr><td>(3, 3, 1)</td><td>4 &gt; 3, yes</td><td>0 / 2</td><td>Read-heavy, rarely written; a single dead replica blocks all writes</td></tr>
  <tr><td>(3, 1, 3)</td><td>4 &gt; 3, yes</td><td>2 / 0</td><td>Write availability above all; any dead replica blocks reads</td></tr>
  <tr><td>(3, 1, 1)</td><td>2 &gt; 3, no</td><td>2 / 2</td><td>Fastest and weakest: a read may miss the newest write</td></tr>
</table>
<p>
  The availability cost is easy to compute and impressive to say. With strict quorums,
  assume each replica is up 99.9% of the time, independently (a generous assumption:
  zones, racks and bad deploys correlate failures). A write that needs 2 of 3 replicas
  succeeds with probability 3 × 0.999² × 0.001 + 0.999³ = 0.002994 + 0.997003 =
  <b>0.999997</b>, about 1.6 minutes of unavailability a year. A write that needs all
  3 succeeds with 0.999³ = <b>0.997003</b>, which is 26.3 hours a year. Demanding one
  more replica costs a factor of about a thousand in unavailability, which is why
  (3, 2, 2) beats (3, 3, 1) for anything user-facing.
</p>

<h3>Versioning: vector clocks against last write wins</h3>
<p>
  Two clients can update the same key through different coordinators during a failure.
  The store must either detect that or silently pick a winner, and this is the
  decision users feel most. The <a href="/system-design/sysdes-time-ordering-ids">time and ordering chapter</a>
  explains the clocks; the seam question is which one you attach to a value.
</p>
<table>
  <tr><th>&nbsp;</th><th>Vector clock (Dynamo, Riak)</th><th>Last write wins (Cassandra)</th></tr>
  <tr><td>Concurrent writes</td><td>Detected; both versions are kept and returned to the reader, who merges</td><td>Not detected; the higher timestamp silently wins</td></tr>
  <tr><td>Cost per value</td><td>A list of (node, counter) pairs; the Dynamo paper truncates it at a threshold, its example 10 pairs, dropping the oldest, which it concedes can blur the ancestry check</td><td>One timestamp per value (Cassandra keeps one per cell, so concurrent writes to different columns both survive)</td></tr>
  <tr><td>Who pays</td><td>The application, which needs a merge function (the paper's example merges shopping carts, and notes that deleted items can resurface)</td><td>The user, whose write may vanish when two clocks disagree</td></tr>
  <tr><td>Failure mode</td><td>Sibling explosion: Riak's documentation describes objects rapidly collecting unreconciled siblings, with higher latency and memory pressure</td><td>Clock skew picks the wrong winner and nobody knows</td></tr>
  <tr><td>Reality check</td><td>The paper measured 99.94% of requests to Amazon's shopping-cart service seeing exactly one version in one 24-hour window; it attributes divergence mainly to concurrent writers, often automated clients, not failures</td><td>Fine when writes are single-writer-per-key or idempotent overwrites</td></tr>
</table>
<p class="sub">
  Riak's documentation says vector clocks were once its sole means of tracking object
  history, that they cannot say which value belonged to which update (so duplicate
  siblings appear), and that dotted version vectors, an option since Riak 2.0, fix that
  and limit siblings better, so it recommends them. The answer
  to give is therefore "causal metadata, preferably dotted, and an application merge
  where concurrent updates matter; timestamps where they do not."
</p>

<h4>Dry run: the paper's five versions of one key, and what a timestamp would have done</h4>
<table>
  <tr><th>Version</th><th>Written by</th><th>Vector clock</th><th>Relation to the others</th></tr>
  <tr><td>D1</td><td>Sx</td><td>[(Sx,1)]</td><td>First version</td></tr>
  <tr><td>D2</td><td>Sx</td><td>[(Sx,2)]</td><td>Descends from D1, overwrites it</td></tr>
  <tr><td>D3</td><td>Sy, after a client read D2</td><td>[(Sx,2), (Sy,1)]</td><td>Descends from D2</td></tr>
  <tr><td>D4</td><td>Sz, after another client read D2</td><td>[(Sx,2), (Sz,1)]</td><td>Descends from D2. D3 has Sy = 1 where D4 has 0, and D4 has Sz = 1 where D3 has 0: <b>concurrent</b>, both kept</td></tr>
  <tr><td>D5</td><td>Sx, after a client read D3 and D4 and merged them</td><td>[(Sx,3), (Sy,1), (Sz,1)]</td><td>The read context is the element-wise maximum, [(Sx,2), (Sy,1), (Sz,1)]; Sx then increments its own counter. D5 descends from both</td></tr>
</table>
<p class="sub">
  Now replay D3 and D4 with timestamps instead, where Sy's clock is 2 ms ahead of
  Sz's: D3 is stamped 10.002 and D4 is stamped 10.001. Last write wins keeps D3 and
  drops D4, and the client that wrote D4 is never told. With vector clocks the
  store knew the two writes had never seen each other, kept both, and let a reader
  merge them into D5. The cost was the merge code and the bookkeeping.
</p>

<h3>Failure handling, in three layers</h3>
<p>
  Replicas will disagree, and each layer repairs on a different timescale and with
  different guarantees. The replication chapter has the full table; the
  assembly question is what you promise and when.
</p>
<ul>
  <li><b>Hinted handoff (seconds to hours).</b> A node that cannot reach a replica stores the write with a hint naming the intended recipient and delivers it when that node returns. The Dynamo paper's variant is a <b>sloppy quorum</b>: reads and writes use the first N <em>healthy</em> nodes of the preference list, so a write succeeds even when two of the three real replicas are unreachable, at the price that the nodes acknowledging it may not be the ones a later read asks. Cassandra deliberately differs: a write always goes to every replica, the consistency level only says how many replies to wait for, and a hint on the coordinator is repair, not an acknowledgement (other than at consistency level ANY). Cassandra's docs also call hints best effort that do not guarantee eventual consistency, and keep them by default for a 3-hour window.</li>
  <li><b>Read repair (on the read path).</b> In Cassandra the coordinator reads the data from one replica and digests from others; on a mismatch it fetches the full data, reconciles by timestamp and writes the winner back to the stale replicas involved, before answering. In the Dynamo paper the coordinator asks all N replicas for their versions, answers after R, and then, once the stragglers arrive, updates any node that returned a stale version, using the vector clocks. Either way it only repairs keys that are read, and Cassandra does nothing at consistency level ONE, because no digests are requested.</li>
  <li><b>Anti-entropy with Merkle trees (days).</b> Replicas compare hash trees over the key ranges they share and stream only what differs. This is the only layer that fixes data nobody reads, and it must run often enough to beat the tombstone grace period: Cassandra's default is 10 days, so repair every node at least every 7 days.</li>
</ul>
<p>
  The Merkle arithmetic is worth doing once, using the paper's traversal (two replicas compare roots, then descend only into subtrees whose hashes differ). Cassandra instead has each replica build its whole tree by scanning the range and then compares the trees, so there the saving is in what gets streamed, not in the comparison. Suppose a node's range holds 250 GB
  and each side builds a tree with 2<sup>16</sup> = 65,536 leaves (an illustrative
  size). Each leaf covers 250 GB ÷ 65,536 ≈ <b>3.8 MB</b>. Compare roots: if equal, the
  range is in sync after one hash. If not, descend: each level compares two child
  hashes, and one differing key makes exactly one path mismatch, so the
  comparison costs 1 + 16 × 2 = <b>33 hash exchanges</b> instead of 65,536, and the
  repair streams one 3.8 MB leaf range rather than the whole 250 GB. The trade-off is the leaf
  size: more leaves mean less re-streamed data and more memory to build the tree.
  Dynamo notes the weakness that motivated its partitioning change: each node keeps a
  tree per key range it hosts, and when a node joins or leaves, many ranges change
  and their trees must be recalculated.
</p>

<h3>Membership and failure detection without a coordinator</h3>
<p>
  There is no master to ask who is alive, so nodes tell each other. Cassandra's
  gossip runs every second: each node updates its own heartbeat, exchanges state
  with one random node, probabilistically tries nodes it believes are unreachable,
  and talks to a seed node if it has not already. State is versioned by a
  (generation, version) pair so newer information wins. Because each exchange
  spreads what a node knows to another, news reaches the cluster in a number of
  rounds that grows with the logarithm of the cluster size, so seconds for tens
  of nodes at one round a second (a planning estimate, not a measured figure). The
  Dynamo paper adds <b>seeds</b>: well-known nodes that every node eventually
  reconciles membership with, which prevents the cluster splitting into two logical
  rings that never learn of each other.
</p>
<p>
  Deciding that a node is dead is a separate problem. Cassandra runs a variant of
  the <b>phi accrual failure detector</b>: instead of a binary timeout, each node
  turns the silence since the last heartbeat into a suspicion level, phi, and marks
  a peer down when phi reaches <code>phi_convict_threshold</code> (default 8, "most
  users should never need to adjust this"). Two seam decisions follow. First, the
  verdict is <em>local</em>: Cassandra's docs say UP and DOWN status is not
  propagated by gossip, so two nodes can disagree about a third, and a quorum
  system tolerates that. Second, the detector trades speed against false alarms.
  Convicting too fast during a garbage-collection pause triggers hints and
  re-routing for a node that was merely slow, and convicting too slowly sends
  requests to a dead node and adds timeouts to your p99.
</p>

<h3>The storage node: a commit log, a memtable and immutable files</h3>
<p>
  Each node persists with an LSM engine, explained in the
  <a href="/system-design/sysdes-storage-engines">storage engines chapter</a>; here is
  the path through Cassandra's version with its documented settings.
</p>
<figure>
  <svg viewBox="0 0 640 262" class="dg" role="img" aria-label="Write path: a write is appended to the commit log and inserted into the memtable, the memtable is flushed to an immutable SSTable, and compaction merges SSTables. Read path: a read checks the memtable, then for each SSTable the Bloom filter, the partition index and the data file, and merges results by timestamp.">
    <g class="rough">
      <path class="lng" d="M104,64 L140,64" />
      <path class="lng" d="M228,64 L264,64" />
      <path class="lng" d="M352,64 L388,64" />
      <path class="lng" d="M476,64 L512,64" />
      <path class="ln"  d="M104,184 L140,184" />
      <path class="ln"  d="M228,184 L264,184" />
      <path class="ln"  d="M352,184 L388,184" />
      <path class="ln"  d="M476,184 L512,184" />
      <rect class="box"  x="16"  y="42" width="88" height="44" rx="6" />
      <rect class="boxy" x="140" y="42" width="88" height="44" rx="6" />
      <rect class="boxg" x="264" y="42" width="88" height="44" rx="6" />
      <rect class="box"  x="388" y="42" width="88" height="44" rx="6" />
      <rect class="boxr" x="512" y="42" width="88" height="44" rx="6" />
      <rect class="box"  x="16"  y="162" width="88" height="44" rx="6" />
      <rect class="boxg" x="140" y="162" width="88" height="44" rx="6" />
      <rect class="boxy" x="264" y="162" width="88" height="44" rx="6" />
      <rect class="box"  x="388" y="162" width="88" height="44" rx="6" />
      <rect class="boxg" x="512" y="162" width="88" height="44" rx="6" />
    </g>
    <text class="lbl" x="16" y="26" style="font-size:14px">write path</text>
    <text class="sm" x="60"  y="62" text-anchor="middle">write</text>
    <text class="sm" x="60"  y="78" text-anchor="middle">mutation</text>
    <text class="sm" x="184" y="62" text-anchor="middle">commit log</text>
    <text class="sm" x="184" y="78" text-anchor="middle">append, fsync</text>
    <text class="sm" x="308" y="62" text-anchor="middle">memtable</text>
    <text class="sm" x="308" y="78" text-anchor="middle">sorted, in RAM</text>
    <text class="sm" x="432" y="62" text-anchor="middle">SSTable</text>
    <text class="sm" x="432" y="78" text-anchor="middle">immutable</text>
    <text class="sm" x="556" y="62" text-anchor="middle">compaction</text>
    <text class="sm" x="556" y="78" text-anchor="middle">merge + rewrite</text>
    <text class="lbl" x="16" y="146" style="font-size:14px">read path</text>
    <text class="sm" x="60"  y="182" text-anchor="middle">read key</text>
    <text class="sm" x="184" y="182" text-anchor="middle">memtable</text>
    <text class="sm" x="308" y="178" text-anchor="middle">per SSTable:</text>
    <text class="sm" x="308" y="194" text-anchor="middle">Bloom filter</text>
    <text class="sm" x="432" y="178" text-anchor="middle">partition index</text>
    <text class="sm" x="432" y="194" text-anchor="middle">then data file</text>
    <text class="sm" x="556" y="178" text-anchor="middle">merge versions</text>
    <text class="sm" x="556" y="194" text-anchor="middle">by timestamp</text>
    <text class="sm" x="16" y="236">acknowledged after the commit-log append (default: fsync every 10 s)</text>
    <text class="sm" x="16" y="252">the Bloom filter lets most SSTables be skipped without a disk read</text>
  </svg>
  <figcaption>The two paths on one node. The write path is a sequential append plus a memory insert; the cost is deferred to flushing and compaction. The read path is the mirror image: it pays to check several files, and the Bloom filter exists to avoid most of them.</figcaption>
</figure>
<ul>
  <li><b>Write path.</b> Each write is appended to a local commit log (segments of 32 MiB by default) and inserted in the memtable, which keeps data sorted by key. A memtable flush writes a sorted, immutable SSTable with a partition index; background compaction merges SSTables, which is the write amplification the capacity estimate charged for.</li>
  <li><b>Read path.</b> The node consults the memtable and the SSTables that may hold the key. Each SSTable has a Bloom filter over its partition keys to skip files, a partition index that maps keys to positions in the data file, and a summary that samples every 128th index entry by default (in the BIG sstable format; Cassandra 5.0's newer BTI format uses a trie-based index instead). Versions found in different files are reconciled by timestamp.</li>
  <li><b>The durability seam.</b> The commit log defaults to <code>periodic</code> sync: writes are acknowledged immediately and the log is fsynced every 10,000 ms by default, so an unlucky machine crash can lose up to that window on that node. <code>batch</code> mode waits for the fsync, at the cost of latency. The quorum is what makes the default acceptable: an acknowledged write sits in at least two nodes' logs, and with replicas in different zones one machine failure cannot lose it. The Dynamo paper makes the same trade: it describes a write buffer that cut 99.9th-percentile latency by a factor of 5 at peak, and refines it so the coordinator picks one replica to do a durable write while still waiting only for W responses.</li>
</ul>

<h4>Dry run: a write during a failure, then three ways the dead replica catches up</h4>
<p>
  The ring from the figure: nodes A to E at 100, 300, 500, 700 and 900. Key k hashes
  to 250, so its coordinator is B and its preference list is B, C, D. N = 3, W = 2,
  R = 2, Dynamo-style sloppy quorum.
</p>
<table>
  <tr><th>Time</th><th>Event</th><th>B</th><th>C</th><th>D</th><th>E (hints)</th></tr>
  <tr><td>t0</td><td>put v1 via B. Clock [(B,1)]. B stores it, sends to C and D. Replies from C and D (W − 1 = 1 needed): success</td><td>v1</td><td>v1</td><td>v1</td><td>none</td></tr>
  <tr><td>t1</td><td>C crashes</td><td>v1</td><td>down</td><td>v1</td><td>none</td></tr>
  <tr><td>t2</td><td>put v2 (client passes the context [(B,1)]). Clock [(B,2)]. B stores it, sends to D, and to E as a hinted replica for C because C is unreachable. D replies: success (W = 2 met by B and D even under a strict quorum)</td><td>v2</td><td>down</td><td>v2</td><td>v2 for C</td></tr>
  <tr><td>t3</td><td>get with R = 2 asks B and D: both return v2, so one version, no repair needed</td><td>v2</td><td>down</td><td>v2</td><td>v2 for C</td></tr>
  <tr><td>t4a</td><td><b>Path A, hint delivered.</b> C returns, gossip marks it up, E delivers v2 to C and deletes its copy</td><td>v2</td><td>v2</td><td>v2</td><td>empty</td></tr>
  <tr><td>t4b</td><td><b>Path B, hint lost.</b> E crashed and lost the hint; C returns holding v1</td><td>v2</td><td>v1</td><td>v2</td><td>empty</td></tr>
  <tr><td>t5b</td><td>get asks C and D. D returns v2 with clock [(B,2)], C returns v1 with [(B,1)]. [(B,2)] descends from [(B,1)], so v2 wins and is written back: <b>read repair</b></td><td>v2</td><td>v2</td><td>v2</td><td>empty</td></tr>
  <tr><td>t6c</td><td><b>Path C, nobody reads k.</b> The range containing k differs between C and B in the Merkle comparison: 33 hash exchanges locate the 3.8 MB leaf range (assuming the 250 GB range from the capacity estimate), which is streamed to C</td><td>v2</td><td>v2</td><td>v2</td><td>empty</td></tr>
</table>
<p class="sub">
  Three things to say about it. The client never saw a failure: W = 2 was met by
  real replicas. The correctness of path B relied on the vector clock to prove v2
  newer, which is exactly what timestamps cannot prove under skew. And path C is
  the only one that works for keys that nobody reads, which is why anti-entropy
  must exist and must be scheduled, even though hints and read repair usually do the
  work. (At t2, a Cassandra-style strict quorum keeps the hint on the coordinator
  B instead of E, and E is never involved.)
</p>

<h3>Follow-ups and failure modes to volunteer</h3>
<ul>
  <li><b>Hot keys.</b> Partitioning spreads keys, not requests. The Dynamo paper's design assumes there are enough popular keys to spread their load; a single hot key stays on its N replicas. Answer with a cache in front, key splitting (a counter as several keys summed on read) or client-side batching.</li>
  <li><b>Deletes.</b> A delete is a write of a tombstone; purge it only after every replica has it, which is the repair-within-grace-period rule above. Otherwise deleted data returns.</li>
  <li><b>Multi-region.</b> Put replicas of a preference list in several data centers, as the paper describes, as the paper describes. Cassandra additionally lets you choose per request between a local and a global quorum (LOCAL_QUORUM and EACH_QUORUM); waiting globally costs cross-region latency of 60 to 230 ms (the course's round-trip figures).</li>
  <li><b>Large values.</b> Dynamo targets objects under 1 MB. Beyond that, store a pointer and keep the blob in object storage.</li>
  <li><b>Overload on recovery.</b> A node that returns after hours is flooded by hint replay and repair streaming at the same moment it is cold. Throttle both.</li>
</ul>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll build a Dynamo-style AP store,
  because for a key-value workload I'd rather accept a write and reconcile than
  refuse it. Keys hash onto a ring with 16 virtual nodes per machine, and each key
  lives on three nodes in different zones. I'll run N = 3, W = 2, R = 2 with strict
  quorums, so reads and writes overlap and any one replica can fail without anyone noticing. Versions
  carry vector clocks where concurrent writes matter and timestamps where they do
  not. A missed write is repaired three ways: a hint when the node returns, read
  repair when a stale replica is read, and Merkle-tree anti-entropy on a schedule
  shorter than the tombstone grace period. Nodes learn membership by gossip and
  decide failure locally with a phi-accrual detector. Each node is an LSM engine, so
  writes are a log append and a memory insert. For the numbers, 5 TB of data is 15 TB
  replicated, but 350,000 replica operations a second need about 60 nodes, so
  throughput, not disk, sets the size."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "design a key-value store", "a cache that survives restarts", "a session store", "a shopping cart that is always writable", "a distributed hash table", or any prompt with simple get and put by key at large scale and a strict availability target.</li>
  <li><b>First fork:</b> must two readers never disagree (then a consensus-backed store, as in the consensus and replication chapters) or must the system always accept writes (then this design)?</li>
  <li><b>What to refuse:</b> multi-key transactions, secondary indexes and range scans. Naming that these are out of scope is part of the design.</li>
  <li><b>The numbers an interviewer wants:</b> replica fan-out (R reads and N writes per client operation), node count from throughput, write amplification, and the cost of one more replica in the write quorum.</li>
  <li><b>The pitfalls to name unprompted:</b> last write wins and clock skew, the hint window, tombstone resurrection if repair runs too rarely, hot keys, and that R + W &gt; N guarantees overlap only for strict quorums: a sloppy quorum breaks it, and even strict quorums are not linearizable (see the consistency models chapter).</li>
  <li><b>The follow-up you will get:</b> "a node is down for a day, then comes back: what happens?" Walk the three layers in order, and say the hint window has expired so Merkle repair and read repair do the work.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Rebuild the capacity estimate: from 100,000 reads and 50,000 writes a second, get 350,000 replica operations and about 60 nodes, and say why storage did not set the size.</li>
    <li>Explain preference-list construction with virtual nodes and why it skips positions owned by the same machine.</li>
    <li>Compute the availability of W = 2 of 3 against W = 3 of 3 with 99.9% replicas, and say what the independence assumption hides.</li>
    <li>Walk the D1 to D5 version example and say what a timestamp would have lost.</li>
    <li>Trace the dry run through all three recovery paths and say which one handles a key nobody reads.</li>
    <li>Say why gossip-based failure detection is local, and what a phi threshold trades.</li>
    <li>Explain what the commit-log sync default risks, and what makes the risk acceptable.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.allthingsdistributed.com/files/amazon-dynamo-sosp2007.pdf" rel="noopener noreferrer">DeCandia et al., Dynamo: Amazon's Highly Available Key-value Store (SOSP 2007)</a> — scope, preference lists, vector clocks and the D1 to D5 example, sloppy quorum and hinted handoff, Merkle trees, seeds, (3, 2, 2), partitioning strategies</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/architecture/dynamo.html" rel="noopener noreferrer">Cassandra architecture: Dynamo</a> — tokens and virtual nodes, replication factor, consistency levels, gossip each second, phi accrual detection, local UP and DOWN status</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/architecture/storage-engine.html" rel="noopener noreferrer">Cassandra: storage engine</a> — commit log, memtable, SSTables, compaction, Bloom filter, index summary, periodic and batch commit-log sync</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/operating/hints.html" rel="noopener noreferrer">Cassandra: hints</a> — best-effort hinted handoff and the 3-hour default window</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/operating/read_repair.html" rel="noopener noreferrer">Cassandra: read repair</a> — data and digest reads, repair by timestamp, no repair at consistency level ONE</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/operating/repair.html" rel="noopener noreferrer">Cassandra: repair</a> — Merkle trees, incremental and full repair, repairing inside the grace period</li>
    <li><a href="https://cassandra.apache.org/doc/latest/cassandra/managing/configuration/cass_yaml_file.html" rel="noopener noreferrer">Cassandra: cassandra.yaml reference</a> — num_tokens 16, phi_convict_threshold 8, max_hint_window 3h, commit-log defaults</li>
    <li><a href="https://docs.riak.com/riak/kv/latest/learn/concepts/causal-context/index.html" rel="noopener noreferrer">Riak: causal context</a> — vector clocks, dotted version vectors, siblings and sibling explosion</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026, using the Cassandra 5.0 documentation. Figures marked "planning figure", "assumed" or "illustrative" (10,000 operations a second per node, a write amplification of 20, a Merkle tree of 65,536 leaves, 99.9% replica availability, the ring positions) are this chapter's own inputs, not measurements. The Dynamo paper was read as extracted text, so wording was matched approximately.</p>
</div>`,
};
