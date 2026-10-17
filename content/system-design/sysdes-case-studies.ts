import type { Chapter } from "../types";

export const sysdesCaseStudies: Chapter = {
  id: "sysdes-case-studies",
  num: "A7",
  title: "Real-world case studies",
  short: "Case studies",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Six systems you use every week, one or two interesting decisions each, the bill that came with them, and what has changed since.",
  body: `<h3>How to read these — and how not to use them</h3>
<p>
  Everything below is drawn from <b>publicly discussed architecture</b>:
  conference talks, engineering blog posts, papers. Each is a snapshot of a
  system <em>at a point in time</em>, usually years ago, and in several cases
  the company has since rebuilt the thing described. None of it is current
  internal truth, and you should say so if you cite it. Each section below
  names its source year and carries a "what has changed since" line, so you
  can see how stale the snapshot is. Where a claim could not be traced to a
  dated primary source, the text says "reported" or "secondary write-up"
  instead of stating it as fact. The value is not the
  architecture; it is the <b>reasoning</b>, and specifically the part that
  most retellings skip: what the clever decision <em>cost</em>.
</p>
<p>
  Used badly, case studies are name-dropping — "I'd do it like Twitter"
  signals that you have read a blog post, not that you can design. Used well,
  they are a compressed argument: "there is a known pattern for the celebrity
  problem; it is a hybrid, and the threshold is a tunable I'd choose from the follower
  histogram and a cost model." Each section below ends with the one transferable
  move.
</p>

<h3>Twitter timelines — the hybrid fan-out</h3>
<p>
  The problem, as Twitter engineers described it in QCon talks in 2012 and
  2013 (the numbers here come from a 2013 summary of the "Timelines at Scale"
  talk): home timeline reads ran at about 300,000 requests per second against
  tweet writes of roughly 6,000 per second. A read-time query — "fetch
  every tweet from everyone this user follows, merge, sort" — is a scatter
  across thousands of partitions on the hottest path in the product. The fix
  was to invert it: on <b>write</b>, push the tweet id into a precomputed
  per-follower timeline list held in memory (Redis), capped at 800
  entries. The read then becomes a single list fetch. Reads went from a
  distributed join to an O(1) lookup.
</p>
<p>
  The cost is write amplification, and it is brutal at the tail of the
  follower distribution. The same summary cites an account with about 31
  million followers, where one tweet means about 31 million list insertions
  and, in the worst case, up to five minutes to reach everyone. Across the
  network, total fan-out ran to about 30 billion timeline deliveries a day.
  The summary also reports where Twitter was heading: exploring a
  <b>hybrid</b>, fanning out on write for ordinary accounts and, for the small
  set of very-high-follower accounts, skipping fan-out and merging their
  recent tweets in at read time. Note the tense: in 2013 that hybrid was
  being explored, not finished, so "Twitter uses a hybrid" is an inference
  from a snapshot, not a settled fact.
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
  <em>name the threshold as a tunable</em>. "Fan-out on write below some
  follower count, fan-out on read above it, and I'd make that a config value
  because the right number depends on the follower histogram and a cost
  model" is a complete answer to a whole family of feed, notification and
  subscription questions. There is no industry-standard number: reasonable
  thresholds sit anywhere from roughly 100,000 to 1,000,000 followers.
</p>
<p class="sub">
  <b>What has changed since (source years 2012-2013):</b> the design above is a
  2013 snapshot. X's open-sourced "For You" repository (updated in 2026)
  describes a different pipeline: in-network candidates come from an
  in-memory store of recent posts by accounts you follow, out-of-network
  candidates come from machine-learned retrieval, and a transformer model
  ranks them. The precomputed Redis list of 800 ids is no longer how that
  feed is described.
</p>

<h3>Netflix — precomputed placement, and failure as a habit</h3>
<p>
  Netflix's Open Connect programme, publicly described from around 2012,
  inverts the usual CDN model. Instead of caching reactively on a miss,
  Netflix offers physical appliances that sit inside ISP networks, and
  <b>fills them during off-peak windows</b> with content chosen by per-region
  popularity (Netflix's own overview says it can predict with high accuracy
  what members will watch and when). Video is unusually well suited to this:
  the catalogue is finite, changes slowly, and next-Tuesday's demand is
  genuinely predictable from this-Tuesday's. So the cache miss — the expensive
  event that dominates ordinary CDN design — is mostly engineered out of
  existence rather than optimised.
</p>
<p>
  The cost is that you are now running a hardware logistics operation:
  manufacturing, shipping (Netflix's current ISP page quotes about a week),
  ISP agreements, and operating boxes you cannot physically reach. That is a real organisational commitment, and it
  only pencils out because streaming video is a large enough fraction of
  internet traffic to justify it. Do not propose it for a service serving
  200 KB images.
</p>
<p>
  The second Netflix idea is cultural rather than architectural: Chaos Monkey,
  introduced in Netflix's 2011 Simian Army write-up, which randomly
  terminates production instances on purpose. The reasoning is that redundancy you have never
  exercised is a claim, not a property — failover paths rot, runbooks go
  stale, and the first real test of your multi-AZ story should not be at 3am.
  The cost is that you must build the resilience <em>first</em>; switching on
  failure injection in a system that isn't ready is just an outage you
  scheduled.
</p>
<p class="sub">
  <b>What has changed since (source years 2011-2012):</b> Netflix's current
  Open Connect pages still describe appliances embedded in ISP networks with
  nightly fills, so the idea has held up. The wider Simian Army project, by
  contrast, is retired and unmaintained; Chaos Monkey itself lives on as a
  standalone service that is configured through Spinnaker.
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
  every few seconds. Uber's publicly described answer (the H3 library, announced on
  Uber's engineering blog in June 2018) indexes the world as a hierarchy of <b>hexagonal</b> cells,
  each addressed by a 64-bit id, at sixteen resolutions from continent-sized
  down to cells of under a square metre. A proximity query becomes "look up this cell
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
  resolutions is approximate (H3's documentation says geographic containment
  is approximate while the logical parent-child relation in the index is
  exact), and wrapping a sphere in hexagons mathematically requires exactly
  twelve pentagons (H3 orients its icosahedron so all twelve fall in the
  ocean). That is a genuine correctness footnote you inherit.
</p>
<p>
  The deeper point is how a spatial index relates to sharding. Uber's H3 post
  describes using the grid for pricing, dispatch and analysis; it does not say
  H3 cells are database shard keys. The sharding claim comes from a separate,
  older source: secondary summaries of Uber's 2015 QCon talk on its dispatch
  platform report that it used S2 cell ids (a different spatial index) as the
  sharding key. Treat that as a 2015 secondary-source description of a system
  that has since been replaced. Sharding by geography is the natural choice,
  and it imports the natural failure: <b>geography is not a uniform load
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
<p class="sub">
  <b>What has changed since (source years 2015 and 2018):</b> H3 is still
  maintained as open source with public documentation. The dispatch
  architecture from the 2015 talk is more than a decade old; use it as a
  pattern for geographic sharding, not as a description of Uber today.
</p>

<h3>WhatsApp — constraining the product is a scaling lever</h3>
<p>
  The figures with a traceable source: in February 2014, when Facebook bought
  it, Sequoia's note counted more than 450 million active users and 32
  engineers (a ratio of about 14 million users per engineer). WhatsApp's own
  2012 blog post described holding <b>more than two million concurrent TCP
  connections on a single machine</b> (2.28 million sockets on a 24-logical-CPU
  server with about 96 GB of RAM), running Erlang on FreeBSD. Erlang's
  runtime is the reason it is even plausible — millions of cheap preemptively-scheduled processes, per-process
  heaps so garbage collection is per-connection and measured in microseconds
  rather than a stop-the-world pause, and supervision trees that restart a
  crashed connection process without touching its neighbours. Add heavy kernel
  tuning of socket buffers and file descriptor limits. The post does not
  state a per-connection memory figure; dividing the 35 GB of active memory
  in its output by 2.28 million sockets gives roughly 15 KB each, which is our
  arithmetic and an upper bound. (The Erlang runtime properties above are
  general features of that platform, not claims from the post.)
</p>
<p>
  But the runtime is only half of it. The other half is that WhatsApp
  <b>refused features</b>. The server did not keep message history: WhatsApp's
  privacy policy still says messages are stored on your device and deleted
  from its servers once delivered, and that an undelivered message is held in
  encrypted form for up to 30 days. That single product decision is worth
  revisiting with the arithmetic from the capacity chapter: retaining history
  costs petabytes a year; retaining only undelivered messages costs tens of
  gigabytes. Minimal server-side state and a narrow feature surface are a
  plausible reason the team could stay small, though the sources listed at the end
  of this chapter give the headcount, not the cause.
</p>
<p>
  The cost is severe specialisation. Hiring Erlang engineers is hard, the
  ecosystem is small, and the architecture is unusually inflexible in the
  direction of adding features — which is precisely what a company adds after
  an acquisition.
</p>
<p class="sub">
  <b>What has changed since (source years 2012 and 2014):</b> the product
  surface has grown. In June 2025 Meta announced channel subscriptions,
  promoted channels and ads in the Updates tab (which hosts Status and
  Channels), while saying personal chats stay end-to-end encrypted and are
  not used for ads. A WhatsApp with no advertising surface and no feed-like
  tab is therefore a pre-2025 picture, and the 2012-2014 numbers describe a
  much smaller product than Meta runs now.
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
  database." Through its hypergrowth years its core data lived in
  <b>PostgreSQL</b>, sharded by user id, with two decisions that made it work.
  (It was not Postgres alone: see the "what has changed since" note below.)
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
  a 2012 post, packs the shard into the primary key itself (the post's own
  example uses 2,000 logical shards and a shard computed as user id modulo
  the shard count; 13 bits allows up to 8,192):
</p>
<pre><code>64-bit id =  41 bits  millisecond timestamp   <span class="c">// 2^41 ms is ~69.7 years from a custom epoch (the 2012 post says "41 years")</span>
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
  Postgres backend that forks a process per connection means a connection
  pooler such as PgBouncer is usually needed.
</p>
<p class="sub">
  <b>What has changed since (source year 2012):</b> Instagram's 2018 engineering
  post says it began using Cassandra in 2012 to replace Redis for fraud
  detection, Feed and the Direct inbox, first on AWS and later on Facebook's
  infrastructure when the rest of Instagram moved. So the full picture is
  sharded Postgres for core relational data plus Cassandra for append-heavy,
  large-scale feed-style data, and the infrastructure it runs on is no longer
  the one the 2012 post describes.
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
  Discord's two posts on message storage — billions of messages on a
  12-node Cassandra cluster (January 2017), and trillions of messages after a
  move from 177 Cassandra nodes to 72 ScyllaDB nodes (March 2023, describing a
  cutover completed in May 2022) — are unusually honest about what
  went wrong in between, which makes them the most instructive pair on this
  list.
</p>
<p>
  The original data model is worth memorising as a template: partition key of
  <code>(channel_id, bucket)</code> where the bucket is a fixed time window,
  clustered by a snowflake message id in descending order. The bucket exists
  because a partition keyed on channel alone grows without bound; in the 2017
  post a bucket covers about ten days and keeps a partition under roughly
  100 MB, which makes "load the most recent messages" a single partition read
  with no sorting.
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
  The 2022 migration (written up in 2023) had two parts. ScyllaDB — a C++ reimplementation of
  Cassandra with a shard-per-core architecture and no garbage collector —
  removed the GC pauses. More interesting is what they put <em>in front</em>:
  intermediate "data services" written in Rust that <b>coalesce concurrent
  identical requests</b>. When ten thousand clients ask for the same channel
  page in the same instant, the first request goes to the database and the
  rest wait on its result; consistent-hash routing sends each channel to the
  same service instance so the crowd actually meets in one place.
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
    <text class="lbl" x="14" y="216" style="font-size:14px">no TTL to tune, no invalidation, and the hot partition never notices the crowd</text>
  </svg>
  <figcaption>Request coalescing is the cheapest tool against a read hotspot because it adds almost no staleness — unlike a TTL cache, nothing is served from older than one in-flight read. The one catch: a caller that joins an in-flight read gets a result from a query that started before it arrived, so a client that wrote a moment ago can miss its own write unless writes also break the flight.</figcaption>
</figure>
<p class="sub">
  <b>What to steal:</b> request coalescing (also called single-flight or
  request collapsing) is a genuinely reusable move, and mentioning it marks
  you as someone who has fought a thundering herd. It is also the correct
  answer to cache-stampede questions from the caching chapter: on a miss, one
  request refills while the others wait, instead of ten thousand simultaneous
  refills.
</p>
<p class="sub">
  <b>What has changed since (source years 2017 and 2023):</b> the 2017
  Cassandra design was replaced in 2022 (177 Cassandra nodes became 72
  ScyllaDB nodes, each with about 9 TB of disk). I found no later Discord
  write-up that supersedes the March 2023 post, so treat it as the latest
  public snapshot rather than a statement about today.
</p>

<h3>The six systems, seven decisions, on one line each</h3>
<table>
  <tr><th>System</th><th>The one interesting decision</th><th>What it cost</th><th>The transferable move</th></tr>
  <tr><td>Twitter timelines (2012-2013; superseded)</td><td>Fan-out on write, with a hybrid for high-follower accounts under exploration</td><td>Enormous write amplification; a threshold that must be tuned</td><td>Split head and tail of a power-law workload; name the threshold</td></tr>
  <tr><td>Netflix Open Connect (2012; still described today)</td><td>Predictive overnight cache fill into ISP-hosted appliances</td><td>Running a hardware logistics business</td><td>If demand is predictable, precompute placement rather than caching reactively</td></tr>
  <tr><td>Netflix Chaos Monkey (2011; Simian Army retired)</td><td>Inject failure in production, continuously</td><td>Requires the resilience to exist first</td><td>An untested failover is a broken failover</td></tr>
  <tr><td>Uber H3 (2018) and dispatch (2015 talk)</td><td>Hexagonal hierarchical spatial index; the 2015 dispatch talk (secondary summaries) sharded by S2 cell id</td><td>Approximate containment across resolutions; twelve pentagons; hot cells at events</td><td>Name the spatial index and its resolution tradeoff; volunteer the hotspot</td></tr>
  <tr><td>WhatsApp (2012 post, 2014 headcount)</td><td>Erlang + kernel tuning for millions of sockets per box; no server-side history</td><td>Extreme specialisation; a deliberately tiny feature surface</td><td>Cutting a requirement is a scaling lever — put a number on it</td></tr>
  <tr><td>Instagram (2012 post)</td><td>Sharded Postgres with logical shards and shard-encoded ids; blobs in object storage (Cassandra added for feed-style data)</td><td>No cross-shard joins or transactions; connection pooling as a project</td><td>Boring database plus an explicit scaling path beats an exotic one</td></tr>
  <tr><td>Discord (2017 post → 2023 post)</td><td>Bucketed partitions; then request coalescing in front of ScyllaDB</td><td>A trillions-of-messages migration; a bespoke service tier to maintain</td><td>Coalesce concurrent identical reads; GC pauses surface as p99, not as errors</td></tr>
</table>

<h3>Using a case study without sounding like you read a blog post</h3>
<ul>
  <li><b>Lead with the problem, not the company.</b> "This has the celebrity fan-out shape" is analysis; "Twitter uses Redis" is trivia. Name the company second, as a citation.</li>
  <li><b>Date it and hedge it.</b> "As of their 2017 write-up" costs you four words and protects you completely — the interviewer may work there and know it changed.</li>
  <li><b>Always state the cost.</b> A candidate who says "and that cost them cross-shard joins" has understood the decision. A candidate who lists only the benefit has memorised it.</li>
  <li><b>Never argue from authority.</b> "Netflix does it" is not a reason. "Our demand is predictable in the same way theirs is, which is what makes precomputed placement work here" is a reason.</li>
  <li><b>Scale-check the analogy out loud.</b> Most of these solve problems that appear above roughly 10 million users. If the prompt is a 100k-user product, the correct use of the case study is to explain why you are <em>not</em> doing it yet — which sets up the tradeoff-thinking chapter's central point.</li>
  <li><b>The pitfall:</b> importing a whole architecture instead of one idea. These companies each had a specific constraint that justified a specific cost. Steal the reasoning; leave the org chart.</li>
</ul>

<h4>Dry run: using the Twitter case study inside a live interview answer</h4>
<p class="sub">Prompt: "Design a social feed where a handful of accounts have 10M+ followers." Applying the six moves above to that one case study, in order.</p>
<table>
  <tr><th>Move</th><th>What you'd actually say</th><th>Why it scores</th></tr>
  <tr><td>1. Lead with the problem, not the company</td><td>"This has the celebrity fan-out shape — a power-law follower distribution, so write amplification blows up for a tiny minority of accounts."</td><td>Analysis of the problem shape, not a name-drop</td></tr>
  <tr><td>2. Date it and hedge it</td><td>"As Twitter's engineering team described it around 2013 — this may well have changed since."</td><td>Four words of hedging protects you if the interviewer knows it changed</td></tr>
  <tr><td>3. Always state the cost</td><td>"The fix was fan-out on write, but it cost real write amplification at the tail — a 30M-follower account means 30M list insertions per tweet."</td><td>Shows you understood the decision, not just the punchline</td></tr>
  <tr><td>4. Never argue from authority</td><td>"Our load isn't Twitter's, but if our follower distribution is similarly power-law, the same split should hold for the same reason — it's write cost that explodes, not read cost."</td><td>Reasons from the property, not from "Twitter does it"</td></tr>
  <tr><td>5. Scale-check the analogy</td><td>"This only pays off once the account tail is large enough for 30M-insert fan-outs to happen regularly. At a few hundred thousand users I'd skip the hybrid and fan out on write for everyone."</td><td>Matches the chapter's own point that most of these solve problems above ~10M users</td></tr>
  <tr><td>6. The pitfall, avoided</td><td>"I'm borrowing the specific idea — split head and tail, make the threshold a tunable — not the rest of Twitter's stack."</td><td>Steals the reasoning, leaves the org chart</td></tr>
</table>
<p class="sub">
  Every row is doing the same test: does this sentence teach the interviewer
  something about <em>this</em> design, or does it just prove you read a blog
  post? A case study only earns its place in the answer when the answer would
  be weaker without it.
</p>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Name the "what to steal" one-line takeaway for at least three of the six case studies, without re-telling the whole story.</li>
    <li>Explain why Twitter's fan-out threshold is a tunable rather than a fixed number, and say what it depends on.</li>
    <li>For any two case studies, say how old the source is and what has changed since, in one sentence each.</li>
    <li>For any case study you cite, state what it cost — not only what it solved.</li>
    <li>Say why you'd hesitate to propose Netflix's Open Connect model for a service serving 200 KB images.</li>
    <li>Walk a case study through all four framing moves (problem-first, dated and hedged, cost-stated, scale-checked) in one interview answer without lapsing into name-dropping.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.infoq.com/presentations/Twitter-Timeline-Scalability" rel="noopener noreferrer">InfoQ: Timelines at Scale (Raffi Krikorian, QCon 2013)</a> — the primary talk on Twitter's timeline architecture; the figures used here come from a summary of it</li>
    <li><a href="https://highscalability.com/the-architecture-twitter-uses-to-deal-with-150m-active-users/" rel="noopener noreferrer">High Scalability: the architecture Twitter uses (2013 summary)</a> — secondary write-up with the 300k read QPS, 6,000 writes, 800-entry lists and the hybrid being explored</li>
    <li><a href="https://github.com/xai-org/x-algorithm" rel="noopener noreferrer">xai-org/x-algorithm on GitHub (2026)</a> — the current open-sourced For You pipeline: in-memory recent posts, retrieval, transformer ranking</li>
    <li><a href="https://openconnect.netflix.com/Open-Connect-Overview.pdf" rel="noopener noreferrer">Netflix Open Connect overview</a> — off-peak fill windows and predictable demand, in Netflix's own words</li>
    <li><a href="https://openconnect.netflix.com/en/" rel="noopener noreferrer">Netflix Open Connect site</a> — appliances embedded in ISP networks and nightly fills today</li>
    <li><a href="https://github.com/Netflix/SimianArmy" rel="noopener noreferrer">Netflix Simian Army repository</a> — states the project is retired and no longer maintained</li>
    <li><a href="https://netflix.github.io/chaosmonkey/" rel="noopener noreferrer">Chaos Monkey documentation</a> — what Chaos Monkey does today and its Spinnaker configuration</li>
    <li><a href="https://www.uber.com/blog/h3/" rel="noopener noreferrer">Uber Engineering: H3 (2018)</a> — hexagons, 16 resolutions, 64-bit cell ids, twelve pentagons, and the uses Uber names</li>
    <li><a href="https://h3geo.org/docs/highlights/indexing" rel="noopener noreferrer">H3 documentation: indexing</a> — hexagons do not cleanly subdivide, containment is approximate</li>
    <li><a href="https://highscalability.com/how-uber-scales-their-real-time-market-platform/" rel="noopener noreferrer">High Scalability: how Uber scales its real-time market platform (2015 summary)</a> — secondary write-up of the 2015 dispatch talk, including S2 cells and consistent hashing</li>
    <li><a href="https://blog.whatsapp.com/1-million-is-so-2011" rel="noopener noreferrer">WhatsApp: 1 million is so 2011</a> — 2.28 million connections on one FreeBSD/Erlang server</li>
    <li><a href="https://www.whatsapp.com/legal/privacy-policy" rel="noopener noreferrer">WhatsApp privacy policy</a> — messages stored on devices, deleted from servers after delivery, undelivered ones held up to 30 days</li>
    <li><a href="https://sequoiacap.com/article/four-numbers-that-explain" rel="noopener noreferrer">Sequoia: four numbers that explain the WhatsApp acquisition (2014)</a> — 32 engineers and over 450 million active users</li>
    <li><a href="https://blog.whatsapp.com/helping-you-find-more-channels-and-businesses-on-whatsapp" rel="noopener noreferrer">WhatsApp blog: more channels and businesses (June 2025)</a> — ads, promoted channels and subscriptions in the Updates tab</li>
    <li><a href="https://medium.com/instagram-engineering/sharding-ids-at-instagram-1cf5a71e5a5c" rel="noopener noreferrer">Instagram Engineering: sharding and IDs at Instagram (2012)</a> — the 41/13/10-bit id layout and logical shards</li>
    <li><a href="https://medium.com/instagram-engineering/open-sourcing-a-10x-reduction-in-apache-cassandra-tail-latency-d64f86b43589" rel="noopener noreferrer">Instagram Engineering: Cassandra tail latency (2018)</a> — Cassandra replacing Redis from 2012 and the move to Facebook infrastructure</li>
    <li><a href="https://discord.com/blog/how-discord-stores-billions-of-messages" rel="noopener noreferrer">Discord: how we store billions of messages (2017)</a> — bucketed partitions, tombstones, GC pauses on 12 Cassandra nodes</li>
    <li><a href="https://discord.com/blog/how-discord-stores-trillions-of-messages" rel="noopener noreferrer">Discord: how we store trillions of messages (2023)</a> — 177 Cassandra nodes to 72 ScyllaDB nodes, Rust data services and request coalescing</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" are rules of thumb, not guarantees.</p>
</div>`,
};
