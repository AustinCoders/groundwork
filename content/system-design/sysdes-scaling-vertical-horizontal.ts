import type { Chapter } from "../types";

export const sysdesScalingVerticalHorizontal: Chapter = {
  id: "sysdes-scaling-vertical-horizontal",
  num: "B3",
  title: "Scaling: vertical vs horizontal",
  short: "Vertical vs horizontal",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle:
    "Buy a bigger box or buy more boxes — and one modern box is far bigger than the candidate who instantly reaches for a cluster believes.",
  body: `<h3>There are only two knobs, and they cost different things</h3>
<p>
  When a system runs out of capacity you can make the machine bigger
  (<b>vertical</b>, scale up) or add machines (<b>horizontal</b>, scale out).
  Everything else — caching, replicas, sharding, queues — is either a way to
  need less capacity or a specific tactic for making scale-out work on a tier
  that resists it.
</p>
<p>
  The reason interviewers open here is that the choice reveals judgement.
  Vertical scaling costs money and has a ceiling. Horizontal scaling costs
  <em>architecture</em>: it forces you to give up in-process state, easy
  transactions, and the ability to reason about your system as one program.
  Candidates who reach for a distributed cluster before they have exhausted a
  single box are showing an interviewer that they will over-build in
  production too, and that is a genuine downgrade signal at senior level.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="A single box running both application and database evolving into a load balanced tier of three stateless app servers with a primary database and an asynchronous read replica">
    <g class="rough">
      <path class="ln dash" d="M146,144 L206,144" />
      <path class="ln" d="M306,142 L344,66" />
      <path class="ln" d="M306,142 L344,142" />
      <path class="ln" d="M306,142 L344,218" />
      <path class="lnr" d="M450,66 L498,112" />
      <path class="lnr" d="M450,142 L498,120" />
      <path class="lng dash" d="M450,218 L498,218" />
      <path class="ln dash" d="M563,140 L563,196" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="92"  width="124" height="104" rx="6" />
      <rect class="boxy" x="28"  y="104" width="100" height="34" rx="5" />
      <rect class="box"  x="28"  y="150" width="100" height="34" rx="5" />
      <rect class="boxy" x="214" y="118" width="92"  height="48" rx="6" />
      <rect class="box"  x="346" y="46"  width="104" height="40" rx="6" />
      <rect class="box"  x="346" y="122" width="104" height="40" rx="6" />
      <rect class="box"  x="346" y="198" width="104" height="40" rx="6" />
      <rect class="boxg" x="500" y="96"  width="126" height="44" rx="6" />
      <rect class="box"  x="500" y="196" width="126" height="44" rx="6" />
    </g>
    <text class="sm" x="78"  y="84"  text-anchor="middle">day one</text>
    <text class="sm" x="78"  y="126" text-anchor="middle">app</text>
    <text class="sm" x="78"  y="172" text-anchor="middle">database</text>
    <text class="sm" x="176" y="134" text-anchor="middle">20x</text>
    <text class="sm" x="260" y="146" text-anchor="middle">balancer</text>
    <text class="sm" x="398" y="70"  text-anchor="middle">app 1</text>
    <text class="sm" x="398" y="146" text-anchor="middle">app 2</text>
    <text class="sm" x="398" y="222" text-anchor="middle">app 3</text>
    <text class="sm rd" x="470" y="100">writes</text>
    <text class="sm gr" x="452" y="212">reads</text>
    <text class="sm gr" x="563" y="122" text-anchor="middle">primary</text>
    <text class="sm" x="563" y="222" text-anchor="middle">read replica</text>
    <text class="sm" x="556" y="164" text-anchor="end">lag: 10 ms - 2 s</text>
    <text class="lbl" x="20" y="266" style="font-size:15px">The app tier scaled out because it holds no state. The database</text>
    <text class="lbl" x="20" y="288" style="font-size:15px">did not — it grew a replica, and writes still go to exactly one node.</text>
  </svg>
  <figcaption>Notice the asymmetry: three interchangeable app servers, still one writer. That asymmetry is the whole story of scaling, and everything harder in distributed systems is an attempt to break it.</figcaption>
</figure>

<h3>How big is one box, actually</h3>
<p>
  Most engineers' intuition about a "single server" was formed on a laptop or
  a 4-vCPU cloud instance. The real top end is startling, and quoting it is
  one of the cheapest ways to sound like you have operated systems rather than
  only read about them.
</p>
<table>
  <tr><th>Resource</th><th>What one rentable machine offers today</th></tr>
  <tr><td>CPU</td><td>Up to ~900 vCPUs on the largest high-memory cloud instances; 128-192 vCPUs is an ordinary large instance</td></tr>
  <tr><td>Memory</td><td>Up to 24-32 TiB on high-memory instances; 768 GiB is routine and cheap-ish</td></tr>
  <tr><td>Local storage</td><td>Tens of terabytes of NVMe on storage-optimised instances, at millions of random IOPS and single-digit-microsecond latency</td></tr>
  <tr><td>Network</td><td>100 Gbps and above on large instances — roughly 12 GB/s, more than most systems' entire dataset per minute</td></tr>
</table>
<p>
  What that translates to in throughput terms is more useful than the specs:
</p>
<table>
  <tr><th>Workload on a single well-tuned box</th><th>Realistic throughput</th></tr>
  <tr><td>nginx or Envoy proxying HTTP</td><td>50,000-100,000+ requests/sec</td></tr>
  <tr><td>A typical JSON API server doing real work per request</td><td>500-5,000 requests/sec per instance</td></tr>
  <tr><td>Redis, single node</td><td>~100,000 ops/sec, into the millions with pipelining</td></tr>
  <tr><td>Postgres, indexed point reads, working set in RAM</td><td>~10,000-50,000 reads/sec</td></tr>
  <tr><td>Postgres writes (WAL and fsync bound)</td><td>~1,000-10,000 transactions/sec, higher with batching and group commit</td></tr>
  <tr><td>Dataset that fits entirely in RAM</td><td>Hundreds of gigabytes to a few terabytes — which is most companies' entire production database</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The anchor worth remembering</span>
  Stack Overflow served hundreds of millions of page views a month from about
  nine web servers and a two-node SQL Server cluster, with the database
  machines sitting at single-digit CPU utilisation. If your design needs more
  than that, be able to say <em>why</em> your workload is different. Usually
  the honest answer is media, machine learning, or genuine consumer scale —
  and if it is none of those, one big box plus a replica is the correct
  design.
</div>

<h3>Where vertical scaling actually hits the wall</h3>
<p>
  The naive story is "vertical scaling gets exponentially expensive." That is
  only partly true, and saying it as stated invites a correction: within an
  instance family, cloud pricing is close to linear — twice the vCPUs is
  roughly twice the price. The real wall is made of five other things, and
  naming them precisely is the senior version of this answer.
</p>
<table>
  <tr><th>The wall</th><th>What it actually looks like</th></tr>
  <tr>
    <td>Availability</td>
    <td>One box is one failure domain. There is no rolling deploy, no instance-failure tolerance, and maintenance means downtime. This usually binds long before capacity does.</td>
  </tr>
  <tr>
    <td>Resize is not online</td>
    <td>Changing instance class means a stop/start or a failover — minutes of downtime, or a managed failover of 30-120 seconds. You cannot scale up mid-incident in time to matter.</td>
  </tr>
  <tr>
    <td>Diminishing returns</td>
    <td>Doubling cores rarely doubles throughput: lock contention, NUMA effects across sockets, single-threaded components (Redis, a WAL writer, a Node event loop), and GC pauses that grow with heap size. Past a point you buy cores that idle while one thread is the bottleneck.</td>
  </tr>
  <tr>
    <td>A genuine ceiling</td>
    <td>There is a largest instance, and when you reach it there is no next step — the migration you postponed now has to happen under load, which is the worst possible time.</td>
  </tr>
  <tr>
    <td>Cost at the extremes and licensing</td>
    <td>The top-of-catalog high-memory tiers do carry a premium per unit, huge instances are not always available in your AZ, and per-core commercial licensing turns a linear hardware curve into a brutal software bill.</td>
  </tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "At 1,200 writes per second I'm
  nowhere near a single primary's limit, so I'm not sharding. I'd scale the
  database vertically and add a replica — but I want two nodes from day one
  for availability, not for throughput. Those are different reasons and only
  the first one applies today."
</div>

<h3>What horizontal scaling takes away</h3>
<p>
  Adding a second server silently invalidates a set of assumptions that were
  true and invisible when there was one. This is the part candidates skip, and
  it is where the interesting follow-ups live.
</p>
<pre><code><span class="c">// Perfectly correct on one server. Quietly broken on two.</span>
const hits = new Map();

function allowRequest(userId) {
  const n = (hits.get(userId) || 0) + 1;
  hits.set(userId, n);
  return n &lt;= 100;            <span class="c">// "100 requests per user"</span>
}
<span class="c">// With 10 app servers behind a round-robin LB, each user gets ~1000.</span>
<span class="c">// A deploy resets every counter. Autoscaling changes the limit.</span>
<span class="c">// The fix is not a bigger Map — it is moving the counter out of the process.</span></code></pre>
<table>
  <tr><th>What you lose</th><th>Why</th><th>What you do instead</th></tr>
  <tr>
    <td>In-process state</td>
    <td>Rate limit counters, WebSocket connection maps, uploaded file chunks, in-memory caches all become per-node and inconsistent</td>
    <td>Move it to a shared store, or partition deliberately so a given key always lands on the same node</td>
  </tr>
  <tr>
    <td>Session affinity for free</td>
    <td>Consecutive requests from one user hit different servers</td>
    <td>Externalise the session; use sticky sessions only as a last resort and know what they cost</td>
  </tr>
  <tr>
    <td>Easy transactions</td>
    <td>Only holds while all the data is in one database; the moment state spans nodes or services, you need sagas, outbox patterns, or idempotency keys</td>
    <td>Keep transactional data in one store as long as you possibly can — this is a strong reason not to split services early</td>
  </tr>
  <tr>
    <td>Simple debugging</td>
    <td>"Check the log" becomes "check twelve logs"; a bug may reproduce on one node only</td>
    <td>Centralised logging, request IDs, distributed tracing — real infrastructure you now have to own</td>
  </tr>
  <tr>
    <td>Total-failure simplicity</td>
    <td>Systems now fail <em>partially</em>: one node slow, one AZ unreachable, half the writes succeeded</td>
    <td>Timeouts, retries with jitter, idempotency, circuit breakers, health-check-driven ejection</td>
  </tr>
  <tr>
    <td>Cheap in-memory calls</td>
    <td>A function call becomes a network round trip, ~0.5 ms and occasionally failing</td>
    <td>Batch, cache, and resist splitting components that chat constantly</td>
  </tr>
</table>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A second request from the same user is routed by the load balancer to a different app server, which has no copy of the in-memory session, so the user is unexpectedly logged out">
    <g class="rough">
      <path class="ln" d="M104,120 L146,120" />
      <path class="lng" d="M262,112 L318,68" />
      <path class="lnr" d="M262,130 L318,172" />
      <path class="lng dash" d="M452,68 L520,68" />
      <path class="lnr dash" d="M452,172 L520,172" />
    </g>
    <g class="rough">
      <rect class="box"  x="12"  y="96"  width="92"  height="48" rx="6" />
      <rect class="boxy" x="150" y="96"  width="112" height="48" rx="6" />
      <rect class="boxg" x="320" y="42"  width="132" height="52" rx="6" />
      <rect class="boxr" x="320" y="146" width="132" height="52" rx="6" />
    </g>
    <text class="sm" x="58"  y="124" text-anchor="middle">client</text>
    <text class="sm" x="206" y="124" text-anchor="middle">load balancer</text>
    <text class="sm gr" x="386" y="63"  text-anchor="middle">app 1</text>
    <text class="sm gr" x="386" y="81"  text-anchor="middle">session: alice</text>
    <text class="sm rd" x="386" y="167" text-anchor="middle">app 2</text>
    <text class="sm rd" x="386" y="185" text-anchor="middle">no session in memory</text>
    <text class="sm gr" x="272" y="82">login</text>
    <text class="sm rd" x="272" y="162">next request</text>
    <text class="sm gr" x="526" y="72">200 OK</text>
    <text class="sm rd" x="526" y="176">401 — logged out</text>
    <text class="lbl" x="20" y="222" style="font-size:15px">The bug appears only under load balancing, only sometimes, and only in production.</text>
  </svg>
  <figcaption>Nothing here is broken in isolation. Statefulness in the app tier is a correctness bug that scale-out reveals rather than causes.</figcaption>
</figure>

<h3>Stateless and stateful tiers scale differently</h3>
<p>
  The reason the app tier is easy and the data tier is hard comes down to one
  question: does adding a node add capacity, or does it add a copy that must
  be kept in agreement with the others?
</p>
<table>
  <tr><th></th><th>Stateless tier (web, API, workers)</th><th>Stateful tier (databases, caches, queues)</th></tr>
  <tr><td>Add a node and you get</td><td>Linear capacity, immediately</td><td>Another copy to keep consistent — read capacity maybe, write capacity usually not</td></tr>
  <tr><td>Losing a node costs</td><td>The in-flight requests</td><td>Availability, or data, or both, depending on replication settings</td></tr>
  <tr><td>Scaling mechanism</td><td>Autoscaling group behind a load balancer</td><td>Replication, then partitioning/sharding, each with real consistency consequences</td></tr>
  <tr><td>Practical limit</td><td>Whatever the data tier behind it can take</td><td>The write throughput of a single partition</td></tr>
</table>
<p class="sub">
  This is why "make the app tier stateless" is not a style preference. It is
  the move that concentrates all the hard problems into one tier, where you
  can attack them with dedicated tools, instead of spreading them everywhere.
</p>

<h3>Read replicas: the first real scaling move for most systems</h3>
<p>
  Nearly every consumer-facing system is read-heavy, often by 10:1 or 100:1.
  That asymmetry means the highest-leverage change is almost always to serve
  reads from somewhere other than the primary: a cache first, and replicas
  right behind it. A replica is a full copy of the database that applies the
  primary's write stream and serves read-only queries.
</p>
<table>
  <tr><th>Property</th><th>Reality you should state</th></tr>
  <tr><td>What it buys</td><td>Read throughput scales roughly linearly with replica count, plus a warm failover candidate and a place to run analytics without touching production load</td></tr>
  <tr><td>What it does not buy</td><td>Write capacity — every write still executes on the primary <em>and</em> is replayed on every replica, so replicas add write work rather than absorbing it</td></tr>
  <tr><td>Replication lag</td><td>Typically single-digit milliseconds to a couple of seconds; it spikes during bulk writes, schema changes, and long-running queries on the replica</td></tr>
  <tr><td>The correctness trap</td><td>A user writes, is redirected, reads from a lagging replica, and their own change is missing</td></tr>
  <tr><td>The standard fixes</td><td>Route reads to the primary for a short window after a write (read-your-writes), pin a session to the primary, or track a write timestamp/LSN and pick a replica that has caught up</td></tr>
  <tr><td>Synchronous replication</td><td>Removes the lag problem, adds the round trip to every commit and couples your write availability to the replica's health</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ "I'll add read replicas" is only half an answer</span>
  The immediate follow-up is always some form of "what does a user see right
  after they post?" If you have not decided how reads are routed and what
  staleness is acceptable per endpoint, the replica has introduced a
  user-visible bug. State the policy explicitly: profile reads tolerate two
  seconds of staleness, the checkout page does not and goes to the primary.
</div>

<h3>When not to scale out</h3>
<p>
  Premature distribution is one of the most reliable senior-level red flags,
  precisely because it looks like sophistication. The cost is not the servers
  — it is that a distributed system fails in partial, non-reproducible ways,
  and you have taken on that tax before you had the problem it solves. Work
  this list before adding nodes, out loud:
</p>
<ul>
  <li><b>Measure.</b> Which resource is saturated — CPU, memory, disk IOPS, connections, or a lock? "The database is slow" is not a diagnosis, and an interviewer will notice if you skip this.</li>
  <li><b>The missing index.</b> A single index has turned a dying database into an idle one more times than every scaling technique combined.</li>
  <li><b>N+1 queries and chatty calls.</b> 200 sequential queries per page request is an application bug, not a capacity problem.</li>
  <li><b>Connection pool configuration.</b> Databases die from connection exhaustion far more often than from CPU.</li>
  <li><b>Caching the hot 1%.</b> Read distributions are power laws; a small cache usually absorbs most of the traffic.</li>
  <li><b>Move work off the request path.</b> Emails, thumbnails, analytics, and webhooks belong in a queue, not in the user's 200 ms.</li>
  <li><b>Then buy the bigger box.</b> It is a one-line change and it buys months. Take the months.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I distribute anything I
  want to know what's actually saturated. If it's read CPU on the database,
  a cache and a replica fix it for a fraction of the complexity of sharding.
  I'd shard when a single primary can no longer absorb the write rate or the
  dataset no longer fits — those are the two triggers, and neither is true at
  the numbers we estimated."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Do the scale math first: below roughly 10,000 writes/sec or a few terabytes, one primary plus replicas is a defensible design and reaching past it needs justification</li>
  <li>Any prompt with "high availability" is a horizontal question even at tiny scale — you add the second node for failure tolerance, and it happens to also add capacity</li>
  <li>Read-heavy with tolerable staleness (feeds, catalogs, profiles) → cache then replicas; write-heavy or strongly consistent (ledgers, inventory, counters) → replicas do not help and you should say so</li>
  <li>If the design keeps anything per-user in process memory — sessions, WebSocket maps, rate limit counters, upload buffers — that component is stateful and cannot simply be autoscaled; decide where the state goes before you add the second instance</li>
  <li>Distinguish scaling out from sharding: adding stateless app servers is nearly free, and partitioning a database is a one-way door involving hot keys, cross-shard queries, and resharding pain</li>
  <li>The trap is symmetric — under-designing for a stated billion-user scale reads as naive, and over-designing for a stated thousand-user scale reads as undisciplined; the number they gave you is the tiebreaker</li>
</ul>`,
};
