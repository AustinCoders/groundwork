import type { Chapter } from "../types";

export const sysdesCaseStudies: Chapter = {
  id: "sysdes-case-studies",
  num: "A7",
  title: "Real-world case studies",
  short: "Case studies",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Six systems you use every week, one interesting decision each, and the bill that came with it.",
  body: `<h3>How to read these — and how not to use them</h3>
<p>
  Everything below is drawn from <b>publicly discussed architecture</b>:
  conference talks, engineering blog posts, papers. Each is a snapshot of a
  system <em>at a point in time</em>, usually years ago, and in several cases
  the company has since rebuilt the thing described. None of it is current
  internal truth, and you should say so if you cite it. The value is not the
  architecture; it is the <b>reasoning</b>, and specifically the part that
  most retellings skip: what the clever decision <em>cost</em>.
</p>
<p>
  Used badly, case studies are name-dropping — "I'd do it like Twitter"
  signals that you have read a blog post, not that you can design. Used well,
  they are a compressed argument: "there is a known pattern for the celebrity
  problem; it is a hybrid, and the threshold is a tunable I'd set at around
  a million followers." Each section below ends with the one transferable
  move.
</p>

<h3>Twitter timelines — the hybrid fan-out</h3>
<p>
  The problem, as described in Twitter's engineering talks around 2013: home
  timeline reads ran at a few hundred thousand requests per second against
  tweet writes in the low thousands per second. A read-time query — "fetch
  every tweet from everyone this user follows, merge, sort" — is a scatter
  across thousands of partitions on the hottest path in the product. The fix
  was to invert it: on <b>write</b>, push the tweet id into a precomputed
  per-follower timeline list held in memory (Redis), capped at roughly 800
  entries. The read then becomes a single list fetch. Reads went from a
  distributed join to an O(1) lookup.
</p>
<p>
  The cost is write amplification, and it is brutal at the tail of the
  follower distribution. A user with 30 million followers generates 30 million
  list insertions per tweet. At a few thousand tweets per second across the
  network, total fan-out delivery ran into tens of billions of timeline writes
  per day. So the design became a <b>hybrid</b>: fan out on write for ordinary
  accounts, and for the small set of very-high-follower accounts, skip fan-out
  entirely and merge their recent tweets in at read time.
</p>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="Hybrid timeline fan-out: an ordinary user's tweet goes through a fan-out worker into per-follower timeline caches, while a celebrity's tweet is written once to a separate store and merged into the timeline only at read time">
    <g class="rough">
      <path class="ln" d="M150,46 L196,46" />
      <path class="ln" d="M320,46 L386,26" />
      <path class="ln" d="M320,46 L386,72" />
      <path class="ln" d="M320,46 L386,118" />
      <path class="lnr dash" d="M194,206 L246,206" />
      <path class="lnr" d="M386,206 L440,206" />
      <path class="lng" d="M500,136 L516,182" />
    </g>
    <g class="rough">
      <rect class="box"  x="14"  y="24"  width="136" height="44" rx="6" />
      <rect class="boxy" x="196" y="24"  width="124" height="44" rx="6" />
      <rect class="box"  x="386" y="8"   width="150" height="36" rx="6" />
      <rect class="box"  x="386" y="54"  width="150" height="36" rx="6" />
      <rect class="box"  x="386" y="100" width="150" height="36" rx="6" />
      <rect class="boxr" x="14"  y="182" width="180" height="48" rx="6" />
      <rect class="box"  x="246" y="182" width="140" height="48" rx="6" />
      <rect class="boxg" x="440" y="182" width="184" height="48" rx="6" />
    </g>
    <text class="sm" x="82"  y="40"  text-anchor="middle">tweet by</text>
    <text class="sm" x="82"  y="58"  text-anchor="middle">ordinary account</text>
    <text class="sm" x="258" y="40"  text-anchor="middle">fan-out</text>
    <text class="sm" x="258" y="58"  text-anchor="middle">workers</text>
    <text class="sm" x="461" y="31"  text-anchor="middle">timeline cache · follower A</text>
    <text class="sm" x="461" y="77"  text-anchor="middle">timeline cache · follower B</text>
    <text class="sm" x="461" y="123" text-anchor="middle">timeline cache · follower C</text>
    <text class="sm rd" x="104" y="200" text-anchor="middle">tweet by celebrity</text>
    <text class="sm rd" x="104" y="218" text-anchor="middle">30 M followers</text>
    <text class="sm" x="316" y="200" text-anchor="middle">celebrity tweet store</text>
    <text class="sm" x="316" y="218" text-anchor="middle">write once, no fan-out</text>
    <text class="sm" x="532" y="200" text-anchor="middle">read path: merge</text>
    <text class="sm" x="532" y="218" text-anchor="middle">cached list + celebrity pull</text>
    <text class="lbl" x="14" y="262" style="font-size:14px">write cost is paid by the 99.9% of accounts where it is cheap;</text>
    <text class="lbl" x="14" y="282" style="font-size:14px">read cost is paid only for the handful of accounts where fan-out would explode</text>
  </svg>
  <figcaption>The threshold is the design. Too low and you pay the merge cost on every read; too high and one celebrity tweet stalls the fan-out queue for everyone behind it.</figcaption>
</figure>
<p class="sub">
  <b>What to steal in an interview:</b> whenever a workload has a power-law
  distribution, propose treating the head and the tail differently, and
  <em>name the threshold as a tunable</em>. "Fan-out on write below a million
  followers, fan-out on read above it, and I'd make that a config value
  because the right number depends on the follower histogram" is a complete
  answer to a whole family of feed, notification and subscription questions.
</p>

<h3>Netflix — precomputed placement, and failure as a habit</h3>
<p>
  Netflix's Open Connect programme, publicly described from around 2012,
  inverts the usual CDN model. Instead of caching reactively on a miss,
  Netflix ships physical appliances into ISP networks and internet exchanges,
  and <b>fills them overnight during off-peak hours</b> with content chosen by
  a popularity prediction per region. Video is unusually well suited to this:
  the catalogue is finite, changes slowly, and next-Tuesday's demand is
  genuinely predictable from this-Tuesday's. So the cache miss — the expensive
  event that dominates ordinary CDN design — is mostly engineered out of
  existence rather than optimised.
</p>
<p>
  The cost is that you are now running a hardware logistics operation:
  manufacturing, shipping, ISP contracts, remote diagnostics for boxes you
  cannot physically reach. That is a real organisational commitment, and it
  only pencils out because streaming video is a large enough fraction of
  internet traffic to justify it. Do not propose it for a service serving
  200 KB images.
</p>
<p>
  The second Netflix idea is cultural rather than architectural: Chaos Monkey
  and the broader Simian Army, which terminate production instances during
  business hours on purpose. The reasoning is that redundancy you have never
  exercised is a claim, not a property — failover paths rot, runbooks go
  stale, and the first real test of your multi-AZ story should not be at 3am.
  The cost is that you must build the resilience <em>first</em>; switching on
  failure injection in a system that isn't ready is just an outage you
  scheduled.
</p>
<p class="sub">
  <b>What to steal:</b> two sentences. "If demand is predictable, precompute
  placement instead of caching reactively." And, at the end of any
  availability discussion, "I'd verify the failover path with scheduled
  failure injection, because an untested failover is a broken failover." The
  second one costs you fifteen seconds and reliably lands.
</p>

<h3>Uber — a spatial index is a sharding decision</h3>
<p>
  Matching riders to drivers is a continuous geospatial query: given a point,
  find nearby available supply, fast, while every driver's position updates
  every few seconds. Uber's publicly described answer (the H3 library, open
  sourced in 2018) indexes the world as a hierarchy of <b>hexagonal</b> cells,
  each addressed by a 64-bit id, at sixteen resolutions from continent-sized
  down to about a square metre. A proximity query becomes "look up this cell
  and its ring of neighbours" — a key lookup, not a geometric search.
</p>
<p>
  Hexagons rather than squares for a specific reason: a hexagon has six
  neighbours and all six centroids are <em>equidistant</em>. A square grid has
  four edge-neighbours at distance <em>d</em> and four corner-neighbours at
  <em>d</em>√2, so "expand the search by one ring" means different things in
  different directions, and any smoothing or gradient over the grid is
  distorted. The cost is that hexagons do not tile hierarchically: you cannot
  subdivide a hexagon into smaller hexagons exactly, so containment across
  resolutions is approximate, and wrapping a sphere in hexagons mathematically
  requires exactly twelve pentagons (H3 places them over ocean). That is a
  genuine correctness footnote you inherit.
</p>
<p>
  The deeper point is that the spatial index doubles as the shard key. Uber's
  dispatch system was sharded geographically, which is the natural choice and
  which imports the natural failure: <b>geography is not a uniform load
  distribution</b>. A stadium at kickoff is a hot cell, and no amount of
  consistent hashing helps because the load genuinely is in one place. The
  mitigations are the usual ones from the sharding chapter — split hot cells
  to a finer resolution dynamically, and keep the dispatch tier able to
  rebalance ownership between nodes.
</p>
<p class="sub">
  <b>What to steal:</b> for any "find things near me" prompt, name a concrete
  index (H3, S2, geohash, or a PostGIS R-tree) and immediately name the
  resolution tradeoff — coarse cells mean fewer lookups but more candidates to
  filter; fine cells mean more lookups but tighter results. Then volunteer the
  hot-cell problem before the interviewer does.
</p>

<h3>WhatsApp — constraining the product is a scaling lever</h3>
<p>
  The widely cited figures: in 2015 WhatsApp served roughly 900 million users
  with an engineering team of about fifty. Their 2012 blog post described
  holding <b>two million concurrent TCP connections on a single machine</b>,
  running Erlang on FreeBSD. Erlang's runtime is the reason it is even
  plausible — millions of cheap preemptively-scheduled processes, per-process
  heaps so garbage collection is per-connection and measured in microseconds
  rather than a stop-the-world pause, and supervision trees that restart a
  crashed connection process without touching its neighbours. Add heavy kernel
  tuning of socket buffers and file descriptor limits, and the per-connection
  cost lands in the low tens of kilobytes.
</p>
<p>
  But the runtime is only half of it. The other half is that WhatsApp
  <b>refused features</b>. For most of that period the server did not store
  message history — a message was queued only until delivered, then deleted.
  That single product decision is worth revisiting with the arithmetic from
  the capacity chapter: retaining history costs petabytes a year; retaining
  only undelivered messages costs tens of gigabytes. No ads, no timeline, no
  media transcoding pipeline of significance, minimal server-side state. The
  small team was not despite the scale; it was possible <em>because</em> the
  surface area was tiny.
</p>
<p>
  The cost is severe specialisation. Hiring Erlang engineers is hard, the
  ecosystem is small, and the architecture is unusually inflexible in the
  direction of adding features — which is precisely what a company adds after
  an acquisition.
</p>
<p class="sub">
  <b>What to steal:</b> when the requirements phase is happening, ask whether
  a feature is actually required, and put a number on what it costs if it is.
  "Do we need server-side history? If yes I need a petabyte-scale message
  store; if no, a 40 GB queue covers it" is the highest-leverage question in
  the whole interview, and almost nobody asks it. Also: name your
  per-connection memory budget on any real-time design.
</p>

<h3>Instagram — boring database, aggressively applied</h3>
<p>
  Instagram is the standing counterexample to "web scale needs a new
  database." Through its hypergrowth years it ran on <b>PostgreSQL</b>,
  sharded by user id, with two decisions that made it work.
</p>
<p>
  First, blobs left the database immediately — photos went to object storage
  behind a CDN, and Postgres held only metadata rows. Re-run the capacity
  arithmetic and it is obvious why: the blob path is measured in petabytes and
  the metadata path in terabytes. Keeping them in the same system means sizing
  your relational store for the wrong workload.
</p>
<p>
  Second, <b>logical shards</b>. Rather than mapping users onto physical
  machines, they mapped users onto a few thousand logical shards (Postgres
  schemas), then mapped many logical shards onto each physical machine.
  Growing the cluster means moving logical shards between machines — no
  re-hashing, no application change. Their id generation scheme, described in
  a 2012 post, packs the shard into the primary key itself:
</p>
<pre><code>64-bit id =  41 bits  millisecond timestamp   <span class="c">// ~69 years of range from a custom epoch</span>
           + 13 bits  logical shard id        <span class="c">// 8,192 logical shards</span>
           + 10 bits  per-shard sequence      <span class="c">// 1,024 ids per ms per shard</span>

  ids are roughly time-sortable  -> good index locality on an append-heavy table
  the shard is IN the id         -> route a request without a lookup table
  generated in the database      -> no separate id service to keep available</code></pre>
<p>
  The cost is everything you give up by sharding a relational database: no
  cross-shard joins, no cross-shard transactions, no global secondary indexes,
  and application code that must always know the shard key. Connection
  management becomes its own project — thousands of app processes against a
  Postgres backend that forks per connection means PgBouncer is not optional.
</p>
<p class="sub">
  <b>What to steal:</b> "I'd start with Postgres" is a legitimate and often
  correct answer, and the way to make it credible is to pair it with the
  scaling path — blobs out to object storage, logical shards from day one so
  rebalancing is a data move rather than a rewrite, and a shard-encoded id.
  Say the sentence "sharding costs me joins and cross-shard transactions"
  before the interviewer asks.
</p>

<h3>Discord — coalescing in front of a hot partition</h3>
<p>
  Discord's two posts on message storage — billions of messages on Cassandra
  in 2017, trillions on ScyllaDB in 2023 — are unusually honest about what
  went wrong in between, which makes them the most instructive pair on this
  list.
</p>
<p>
  The original data model is worth memorising as a template: partition key of
  <code>(channel_id, bucket)</code> where the bucket is a fixed time window,
  clustered by a snowflake message id in descending order. The bucket exists
  because a partition keyed on channel alone grows without bound; bucketing
  caps partition size and makes "load the most recent messages" a single
  partition read with no sorting.
</p>
<p>
  What broke was not throughput but <b>tail latency</b>, and the causes are a
  tour of distributed-storage failure modes. Hot partitions: a handful of
  enormous channels received a wildly disproportionate share of reads.
  Tombstones: deletes in an LSM store are writes, and a range scan must read
  past every tombstone in the range, so a heavily-moderated channel became
  slow to read. And JVM garbage collection: stop-the-world pauses on Cassandra
  nodes produced multi-second stalls that showed up purely as p99 spikes —
  invisible in an average, invisible in the error rate, exactly the pattern
  the observability chapter warns about.
</p>
<p>
  The 2023 rebuild had two parts. ScyllaDB — a C++ reimplementation of
  Cassandra with a shard-per-core architecture and no garbage collector —
  removed the GC pauses. More interesting is what they put <em>in front</em>:
  intermediate "data services" written in Rust that <b>coalesce concurrent
  identical requests</b>. When ten thousand clients ask for the same channel
  page in the same instant, the first request goes to the database and the
  rest wait on its result.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A thousand concurrent requests for the same channel arrive at a Rust data service that coalesces them by key, so the ScyllaDB partition receives only a single read">
    <g class="rough">
      <path class="lnr" d="M164,120 L226,120" />
      <path class="lng" d="M406,120 L470,120" />
    </g>
    <g class="rough">
      <rect class="box"  x="14"  y="90"  width="150" height="60" rx="6" />
      <rect class="boxy" x="226" y="84"  width="180" height="72" rx="6" />
      <rect class="boxg" x="470" y="96"  width="150" height="48" rx="6" />
    </g>
    <text class="sm" x="89"  y="112" text-anchor="middle">10,000 clients</text>
    <text class="sm" x="89"  y="130" text-anchor="middle">same channel, same</text>
    <text class="sm" x="89"  y="146" text-anchor="middle">instant</text>
    <text class="sm" x="316" y="112" text-anchor="middle">data service (Rust)</text>
    <text class="sm" x="316" y="130" text-anchor="middle">coalesce by</text>
    <text class="sm" x="316" y="146" text-anchor="middle">(channel_id, bucket)</text>
    <text class="sm" x="545" y="116" text-anchor="middle">ScyllaDB</text>
    <text class="sm" x="545" y="134" text-anchor="middle">hot partition</text>
    <text class="sm rd" x="195" y="106" text-anchor="middle">10,000 reads/s</text>
    <text class="sm gr" x="438" y="106" text-anchor="middle">1 read</text>
    <text class="lbl" x="14" y="196" style="font-size:14px">this is a cache with a time-to-live of "the duration of one query" —</text>
    <text class="lbl" x="14" y="216" style="font-size:14px">no staleness, no invalidation problem, and the hot partition never notices the crowd</text>
  </svg>
  <figcaption>Request coalescing is the cheapest tool against a read hotspot because it introduces no staleness at all — unlike a TTL cache, every caller still receives a value that was live when their request arrived.</figcaption>
</figure>
<p class="sub">
  <b>What to steal:</b> request coalescing (also called single-flight or
  request collapsing) is a genuinely reusable move, and mentioning it marks
  you as someone who has fought a thundering herd. It is also the correct
  answer to cache-stampede questions from the caching chapter: on a miss, one
  request refills while the others wait, instead of ten thousand simultaneous
  refills.
</p>

<h3>The six, on one line each</h3>
<table>
  <tr><th>System</th><th>The one interesting decision</th><th>What it cost</th><th>The transferable move</th></tr>
  <tr><td>Twitter timelines (~2013)</td><td>Fan-out on write, hybrid for high-follower accounts</td><td>Enormous write amplification; a threshold that must be tuned</td><td>Split head and tail of a power-law workload; name the threshold</td></tr>
  <tr><td>Netflix Open Connect (~2012+)</td><td>Predictive overnight cache fill into ISP-hosted appliances</td><td>Running a hardware logistics business</td><td>If demand is predictable, precompute placement rather than caching reactively</td></tr>
  <tr><td>Netflix Chaos Monkey</td><td>Inject failure in production, continuously</td><td>Requires the resilience to exist first</td><td>An untested failover is a broken failover</td></tr>
  <tr><td>Uber H3 (open sourced 2018)</td><td>Hexagonal hierarchical spatial index as both index and shard key</td><td>Approximate containment across resolutions; twelve pentagons; hot cells at events</td><td>Name the spatial index and its resolution tradeoff; volunteer the hotspot</td></tr>
  <tr><td>WhatsApp (~2012-2015)</td><td>Erlang + kernel tuning for millions of sockets per box; no server-side history</td><td>Extreme specialisation; a deliberately tiny feature surface</td><td>Cutting a requirement is a scaling lever — put a number on it</td></tr>
  <tr><td>Instagram (~2012+)</td><td>Sharded Postgres with logical shards and shard-encoded ids; blobs in object storage</td><td>No cross-shard joins or transactions; connection pooling as a project</td><td>Boring database plus an explicit scaling path beats an exotic one</td></tr>
  <tr><td>Discord (2017 → 2023)</td><td>Bucketed partitions; then request coalescing in front of ScyllaDB</td><td>A trillion-row migration; a bespoke service tier to maintain</td><td>Coalesce concurrent identical reads; GC pauses surface as p99, not as errors</td></tr>
</table>

<h3>Using a case study without sounding like you read a blog post</h3>
<ul>
  <li><b>Lead with the problem, not the company.</b> "This has the celebrity fan-out shape" is analysis; "Twitter uses Redis" is trivia. Name the company second, as a citation.</li>
  <li><b>Date it and hedge it.</b> "As of their 2017 write-up" costs you four words and protects you completely — the interviewer may work there and know it changed.</li>
  <li><b>Always state the cost.</b> A candidate who says "and that cost them cross-shard joins" has understood the decision. A candidate who lists only the benefit has memorised it.</li>
  <li><b>Never argue from authority.</b> "Netflix does it" is not a reason. "Our demand is predictable in the same way theirs is, which is what makes precomputed placement work here" is a reason.</li>
  <li><b>Scale-check the analogy out loud.</b> Most of these solve problems that appear above roughly 10 million users. If the prompt is a 100k-user product, the correct use of the case study is to explain why you are <em>not</em> doing it yet — which sets up the tradeoff-thinking chapter's central point.</li>
  <li><b>The pitfall:</b> importing a whole architecture instead of one idea. These companies each had a specific constraint that justified a specific cost. Steal the reasoning; leave the org chart.</li>
</ul>`,
};
