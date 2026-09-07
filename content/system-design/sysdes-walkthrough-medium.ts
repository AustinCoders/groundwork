import type { Chapter } from "../types";

export const sysdesWalkthroughMedium: Chapter = {
  id: "sysdes-walkthrough-medium",
  num: "I9",
  title: "Walkthrough: a news feed / chat app",
  short: "Walkthrough: feed/chat",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Fan-out on write, fan-out on read, and the hybrid that exists because one account has 150 million followers.",
  body: `<h3>The problem, and what makes it a real interview</h3>
<p>
  "Design a news feed" is the most-asked medium system design question in the
  industry, and it is asked because it has one genuinely hard decision buried
  under a lot of easy ones. Everything about it — the API, the data model,
  the caching — is routine. The decision is <b>where the work happens: at
  write time or at read time</b>, and the fact that neither answer works
  alone at scale. Candidates who reach the hybrid, and can say why the
  threshold exists, pass. Candidates who describe a beautiful CRUD service
  and never state the tradeoff do not.
</p>
<p>
  Spend the first four minutes on scope. Not because interviewers reward
  ceremony, but because the fan-out decision is entirely determined by
  numbers you have to extract from them.
</p>
<table>
  <tr><th>In scope</th><th>Explicitly out of scope</th></tr>
  <tr><td>Post text and images; follow / unfollow</td><td>Ads, monetization, DMs</td></tr>
  <tr><td>Home feed: posts from accounts you follow</td><td>Search and hashtag discovery (see the search chapter)</td></tr>
  <tr><td>Infinite scroll, newest-first with light ranking</td><td>Full ML ranking infrastructure and training pipelines</td></tr>
  <tr><td>Likes and comment counts on feed items</td><td>Comment threads themselves</td></tr>
</table>
<p>
  Non-functional targets, stated as numbers because vague ones cannot drive a
  design: feed load <b>p99 under 200 ms</b>; a new post visible to followers
  within <b>a few seconds</b> (eventual consistency is fine and the product
  does not need better); <b>read-heavy by roughly 100:1</b>;
  availability 99.9% — a briefly stale feed is acceptable, an unavailable one
  is not. That last sentence already tells you the system should favour
  availability over consistency, which is the CAP-chapter tradeoff arriving
  as a product requirement rather than a theory question.
</p>

<h3>Capacity estimation, with the arithmetic shown</h3>
<p>
  Do this on the board, out loud, rounding aggressively. The goal is not
  accuracy to two significant figures; it is to surface the one or two
  numbers that eliminate an entire design.
</p>
<table>
  <tr><th>Quantity</th><th>Arithmetic</th><th>Result</th></tr>
  <tr><td>Daily active users</td><td>given</td><td>500 M</td></tr>
  <tr><td>Feed opens</td><td>500 M × 15 per day ÷ 86,400 s</td><td>~87,000 reads/s average</td></tr>
  <tr><td>Peak reads</td><td>× 3 for daily peak</td><td>~250,000 reads/s</td></tr>
  <tr><td>Posts</td><td>10% of DAU × 1.5 posts ÷ 86,400 s</td><td>~870 writes/s average, ~2,500/s peak</td></tr>
  <tr><td>Read : write ratio</td><td>87,000 ÷ 870</td><td>~100 : 1</td></tr>
  <tr><td>Average accounts followed</td><td>given (mean; median far lower)</td><td>200</td></tr>
  <tr><td>Post metadata storage</td><td>75 M/day × 500 B × 365</td><td>~14 TB/year — trivial</td></tr>
  <tr><td>Media storage</td><td>30% of 75 M × ~800 KB (all renditions) × 365</td><td>~6.6 PB/year — object storage, not a database</td></tr>
  <tr><td>Media egress at peak</td><td>250,000 feeds/s × ~6 images × 150 KB</td><td>~200 GB/s — a CDN problem, not an origin problem</td></tr>
</table>
<p>
  Two of those numbers decide the architecture. <b>100:1 read-heavy</b> says
  precompute: it is worth doing substantially more work per write to make
  reads cheap. And <b>6.6 PB/year of media at 200 GB/s</b> says the media
  path is completely separate from the feed path — object storage behind a
  CDN, with the feed API returning URLs, never bytes. Neither of those is a
  close call, and saying so quickly buys you time for the decision that is.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "At 100:1 read-to-write I'll
  spend write-time work to buy read-time speed — that points at
  fan-out on write. Before I commit, let me check what happens at the tail of
  the follower distribution, because that's where this design usually breaks."
</div>

<h3>The core services and the data model</h3>
<p>
  Four services, deliberately boring, so that the interesting part stands out.
  <b>Post service</b> owns the canonical posts table. <b>Graph service</b>
  owns follows, and answers "who follows X" and "who does X follow" — both
  directions, because fan-out needs the first and read-time merge needs the
  second. <b>Feed service</b> owns per-user materialized feeds. <b>Media
  service</b> issues presigned upload URLs and runs the transcode pipeline
  from the storage chapter.
</p>
<table>
  <tr><th>Store</th><th>Key</th><th>Holds</th><th>Why this shape</th></tr>
  <tr><td>posts</td><td>post_id (snowflake: time-ordered)</td><td>author_id, text, media keys, created_at, counters</td><td>Time-ordered IDs mean a sort by ID is a sort by time — no extra index</td></tr>
  <tr><td>follows</td><td>(follower_id, followee_id)</td><td>created_at</td><td>Stored twice, once per direction, because both lookups are hot</td></tr>
  <tr><td>feed</td><td>user_id → sorted list of (score, post_id)</td><td>capped at ~500 entries</td><td>IDs only. Hydrate post bodies separately so an edited post is never stale in a million copies</td></tr>
  <tr><td>counters</td><td>post_id</td><td>likes, comments</td><td>Separate, because they change orders of magnitude more often than the post does</td></tr>
</table>
<p class="sub">
  The single most important line in that table is <b>"IDs only"</b>. If you
  copy the post body into every follower's feed, a post edit or deletion means
  chasing a million copies, and your feed store balloons by a factor of 50.
  Store references; hydrate at read time from a cache keyed by post_id, where
  a single copy serves every reader.
</p>

<h3>Fan-out on write: pay at post time</h3>
<p>
  When a user posts, immediately push the post ID into the materialized feed
  of every one of their followers. Reading a feed then costs one range read
  of a precomputed list.
</p>
<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="An author posting once, with a fan-out worker writing that post ID into the precomputed feed list of each of the author's two hundred followers, so that a feed read is a single range scan">
    <g class="rough">
      <path class="ln" d="M130,139 L170,139" />
      <path class="ln" d="M235,116 L235,76" />
      <path class="ln" d="M300,139 L340,139" />
      <path class="lng" d="M450,139 L490,44" />
      <path class="lng" d="M450,139 L490,92" />
      <path class="lng" d="M450,139 L490,140" />
      <path class="lng" d="M450,139 L490,188" />
      <path class="lng" d="M450,139 L490,236" />
    </g>
    <g class="rough">
      <rect class="boxy" x="20" y="116" width="110" height="46" rx="6" />
      <rect class="box" x="170" y="116" width="130" height="46" rx="6" />
      <rect class="box" x="170" y="30" width="130" height="46" rx="6" />
      <rect class="box" x="340" y="116" width="110" height="46" rx="6" />
      <rect class="boxg" x="490" y="26" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="74" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="122" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="170" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="218" width="130" height="36" rx="6" />
    </g>
    <text class="lbl" x="75" y="145" text-anchor="middle">author</text>
    <text class="lbl" x="235" y="58" text-anchor="middle">post store</text>
    <text class="lbl" x="235" y="145" text-anchor="middle">write API</text>
    <text class="sm" x="395" y="136" text-anchor="middle">fan-out</text>
    <text class="sm" x="395" y="154" text-anchor="middle">worker</text>
    <text class="sm" x="555" y="49" text-anchor="middle">feed:u1</text>
    <text class="sm" x="555" y="97" text-anchor="middle">feed:u2</text>
    <text class="sm" x="555" y="145" text-anchor="middle">feed:u3</text>
    <text class="sm" x="555" y="193" text-anchor="middle">…</text>
    <text class="sm" x="555" y="241" text-anchor="middle">feed:u200</text>
    <text class="lbl" x="320" y="272" text-anchor="middle" style="font-size:14px">one post → 200 list writes; the read is then one range scan</text>
  </svg>
  <figcaption>All the cost moves to the write, and it is asynchronous, so the author's request returns as soon as the post is durable.</figcaption>
</figure>
<p>
  The arithmetic: 870 posts/s × 200 followers = <b>~174,000 feed appends per
  second</b> average, and roughly 500,000/s at peak. That is a lot but it is
  entirely tractable — these are tiny appends to a sorted structure, spread
  across a sharded Redis or Cassandra cluster, and they are asynchronous so
  they can absorb a queue.
</p>
<p>
  Two optimizations cut it substantially and both are worth volunteering.
  <b>Fan out only to active users</b>: with 2 B registered accounts and 500 M
  daily actives, most followers will not open the app today, so writing to
  them is pure waste. Fan out to accounts active in the last 30 days and
  lazily build the feed for anyone else on their next login. And <b>cap the
  feed</b> at ~500 entries — nobody scrolls past that, and an uncapped list
  grows without bound.
</p>

<h3>Fan-out on read: pay at feed time</h3>
<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="A reader requesting their feed, which triggers fetching the recent posts of each of the two hundred accounts they follow and merging those lists at request time">
    <g class="rough">
      <path class="ln" d="M160,44 L330,130" />
      <path class="ln" d="M160,92 L330,134" />
      <path class="ln" d="M160,140 L330,138" />
      <path class="ln" d="M160,188 L330,142" />
      <path class="ln" d="M160,236 L330,146" />
      <path class="lng" d="M460,139 L490,139" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="26" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="74" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="122" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="170" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="218" width="140" height="36" rx="6" />
      <rect class="boxy" x="330" y="116" width="130" height="46" rx="6" />
      <rect class="boxg" x="490" y="116" width="130" height="46" rx="6" />
    </g>
    <text class="sm" x="90" y="49" text-anchor="middle">posts by a1</text>
    <text class="sm" x="90" y="97" text-anchor="middle">posts by a2</text>
    <text class="sm" x="90" y="145" text-anchor="middle">posts by a3</text>
    <text class="sm" x="90" y="193" text-anchor="middle">…</text>
    <text class="sm" x="90" y="241" text-anchor="middle">posts by a200</text>
    <text class="sm" x="395" y="136" text-anchor="middle">k-way merge</text>
    <text class="sm" x="395" y="154" text-anchor="middle">+ rank</text>
    <text class="lbl" x="555" y="145" text-anchor="middle">reader</text>
    <text class="lbl rd" x="320" y="272" text-anchor="middle" style="font-size:14px">one write; but every single read touches 200 timelines and merges them</text>
  </svg>
  <figcaption>The write becomes free and the read becomes a distributed scatter-gather whose tail latency is set by the slowest of two hundred lookups.</figcaption>
</figure>
<table>
  <tr><th></th><th>Fan-out on write</th><th>Fan-out on read</th></tr>
  <tr><td>Write cost</td><td>O(followers) — 200 appends, up to 150 M for a celebrity</td><td>O(1) — one insert</td></tr>
  <tr><td>Read cost</td><td>O(1) — one range scan, p99 under 10 ms from cache</td><td>O(following) — 200 lookups plus a merge, per request</td></tr>
  <tr><td>Total ops at our numbers</td><td>174 k writes/s, 87 k cheap reads/s</td><td>870 writes/s, 17.4 M lookups/s</td></tr>
  <tr><td>Storage</td><td>Duplicated per follower</td><td>Single copy of each post</td></tr>
  <tr><td>Freshness</td><td>Seconds of lag while fan-out drains</td><td>Perfectly fresh by construction</td></tr>
  <tr><td>Unfollow / delete</td><td>Requires cleanup, or filtering at read</td><td>Free — the merge just stops including them</td></tr>
  <tr><td>Reach for this when…</td><td>Read-heavy, bounded follower counts</td><td>Write-heavy, or the reader follows very few, very prolific accounts</td></tr>
</table>
<p>
  17.4 million lookups per second, with a p99 gated by the slowest of 200
  parallel calls, is not a system you can operate. At a 100:1 read ratio,
  fan-out on read loses on arithmetic. But look at the top-right cell of that
  table again — that is where fan-out on write dies.
</p>

<h3>The celebrity problem, and the hybrid that answers it</h3>
<p>
  An account with <b>150 million followers</b> posts. Under pure fan-out on
  write that is 150 million feed appends for one tweet. Even at a dedicated
  100,000 appends/s you are looking at <b>1,500 seconds — 25 minutes</b>
  before the last follower sees it. Worse, it is bursty and it starves
  everyone else's fan-out behind it in the same queue. And ten such accounts
  posting in the same minute is a self-inflicted denial of service.
</p>
<p>
  The answer every real system converges on: <b>fan out on write for normal
  accounts, fan out on read for the handful of accounts above a follower
  threshold, and merge the two at request time.</b>
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A hybrid feed built by merging a precomputed materialized feed written at post time with a small number of celebrity timelines pulled at request time">
    <g class="rough">
      <path class="lng" d="M220,65 L300,100" />
      <path class="ln" d="M220,155 L300,125" />
      <path class="lng" d="M440,110 L500,110" />
    </g>
    <g class="rough">
      <rect class="boxg" x="40" y="40" width="180" height="50" rx="6" />
      <rect class="boxy" x="40" y="130" width="180" height="50" rx="6" />
      <rect class="box" x="300" y="85" width="140" height="50" rx="6" />
      <rect class="box" x="500" y="85" width="120" height="50" rx="6" />
    </g>
    <text class="lbl" x="130" y="64" text-anchor="middle">materialized feed</text>
    <text class="sm" x="130" y="82" text-anchor="middle">normal accounts</text>
    <text class="lbl" x="130" y="154" text-anchor="middle">celebrity pull</text>
    <text class="sm" x="130" y="172" text-anchor="middle">~6 timelines</text>
    <text class="lbl" x="370" y="107" text-anchor="middle">merge</text>
    <text class="sm" x="370" y="125" text-anchor="middle">+ rank + dedupe</text>
    <text class="lbl" x="560" y="115" text-anchor="middle">client</text>
    <text class="sm gr" x="130" y="108" text-anchor="middle">written at post time</text>
    <text class="sm" x="130" y="198" text-anchor="middle">read at request time</text>
    <text class="lbl" x="320" y="238" text-anchor="middle" style="font-size:14px">threshold ~100 k followers; a user follows fewer than 10 of them, so the merge is cheap</text>
  </svg>
  <figcaption>The asymmetry that makes this work: celebrity accounts are rare, so the read-time pull is tiny, while their follower counts are enormous, so the write-time push was ruinous.</figcaption>
</figure>
<p>
  Why this is cheap: the number of accounts above 100,000 followers is small,
  and crucially <b>the number of them any one user follows is small</b> —
  typically under ten. So a feed read becomes one range scan of the
  materialized feed plus perhaps six cached "recent posts by author" lookups,
  merged and re-sorted. That is a bounded, predictable cost, unlike the 200
  lookups of pure fan-out on read.
</p>
<p>
  Two refinements, if the interviewer digs. The threshold should ideally be
  dynamic rather than a magic constant — the real cost driver is
  <em>followers × posting rate</em>, so an account with 80,000 followers
  posting 50 times a day may deserve pull treatment while a 200,000-follower
  account posting monthly does not. And the celebrity's recent posts are a
  perfect cache target: one list, read by tens of millions of people, with a
  hit rate approaching 100%.
</p>
<div class="sticky mint">
  <span class="ttl">This is the whole question</span>
  Push for the many, pull for the few, merge at read. If you say only one
  thing in this interview, say that — with the 150 million × 25 minutes
  arithmetic that forces it.
</div>

<h3>Ranking, cursors, and the caching stack</h3>
<p>
  <b>Ranking.</b> Reverse-chronological is a legitimate v1 and you should say
  so. When ranking arrives, use the same two-stage shape as search:
  candidate generation pulls ~500 entries from the materialized feed plus
  celebrity pulls, then a scorer ranks them on
  <em>affinity × recency_decay × predicted_engagement</em>. Affinity is how
  much this reader interacts with this author; recency decay is exponential
  with a half-life of hours. Keep the score out of the stored feed if you
  want to change the model without a backfill.
</p>
<p>
  <b>Pagination must use cursors, never OFFSET.</b> The feed has new items
  inserted at the head constantly. With <code>LIMIT 20 OFFSET 20</code>, if
  five posts arrive between page 1 and page 2, everything shifts down by five
  and the user sees five duplicates and misses nothing — or, scrolling the
  other way, misses items entirely. A cursor encodes the position in the
  ordering itself: <code>(last_score, last_post_id)</code> for a ranked feed,
  or just the last post ID for a chronological one, base64-encoded so clients
  treat it as opaque. For a ranked feed also pin a <b>session seed and
  snapshot timestamp</b> in the cursor, so the ranking model does not reshuffle
  under the user mid-scroll.
</p>
<div class="warn">
  <span class="ttl">⚠ OFFSET is also a performance trap, not just a correctness one</span>
  Even with a static dataset, <code>OFFSET 10000</code> makes the database
  produce and discard 10,000 rows before returning yours. Deep pagination
  costs grow linearly with depth. Cursors are O(1) regardless of how far the
  user has scrolled, because they seek directly into the index.
</div>
<table>
  <tr><th>Layer</th><th>Key</th><th>Hit rate</th><th>Why it exists</th></tr>
  <tr><td>CDN</td><td>media URL</td><td>&gt;95%</td><td>Media is 200 GB/s at peak — this is the only layer that can carry it</td></tr>
  <tr><td>Feed list cache</td><td>feed:user_id</td><td>~90% for active users</td><td>The top ~100 IDs for active users; ~2 TB across the fleet, the tail lives in Cassandra</td></tr>
  <tr><td>Post hydration cache</td><td>post:post_id</td><td>&gt;95%</td><td>One copy read by everyone. A multi-get of 20 IDs replaces 20 database reads</td></tr>
  <tr><td>Celebrity timeline cache</td><td>author:recent</td><td>~100%</td><td>Makes the pull half of the hybrid essentially free</td></tr>
  <tr><td>Counter cache</td><td>counts:post_id</td><td>high, written back in batches</td><td>Like counts change far faster than posts; do not make the post cache churn for them</td></tr>
</table>
<p class="sub">
  Feed store sizing, since interviewers ask: 500 M active users × 500 entries
  × 40 bytes = ~10 TB if you keep everything hot. Keeping only the top 100
  entries in memory is 500 M × 100 × 40 = 2 TB, which is a manageable
  Redis cluster, with the remainder paged in from a disk-backed store on the
  rare deep scroll.
</p>

<h3>Part two: the same reasoning applied to chat</h3>
<p>
  Chat looks like a different problem and is largely the same one with the
  latency requirement tightened and the connection made persistent. Targets:
  message delivery <b>p99 under 500 ms</b>, <b>10 M concurrent connections</b>,
  ~20 B messages/day (~230,000/s average, ~600,000/s peak), and — unlike the
  feed — <b>ordering and delivery guarantees actually matter</b>. A feed
  showing posts slightly out of order is fine. A conversation showing the
  answer before the question is broken.
</p>
<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="Two phones connected by WebSocket to different gateway nodes, with a registry mapping users to gateway nodes and a pub-sub bus routing a message from the sender's gateway to the recipient's gateway while persisting it to the message store">
    <g class="rough">
      <path class="ln" d="M130,60 L180,60" />
      <path class="ln dash" d="M310,52 L380,52" />
      <path class="ln" d="M310,72 L380,132" />
      <path class="lng" d="M380,145 L310,172" />
      <path class="lng" d="M180,177 L130,177" />
      <path class="ln" d="M440,154 L440,190" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="40" width="110" height="44" rx="6" />
      <rect class="boxy" x="180" y="40" width="130" height="44" rx="6" />
      <rect class="boxy" x="180" y="150" width="130" height="44" rx="6" />
      <rect class="box" x="20" y="150" width="110" height="44" rx="6" />
      <rect class="box" x="380" y="30" width="120" height="44" rx="6" />
      <rect class="box" x="380" y="110" width="120" height="44" rx="6" />
      <rect class="boxg" x="380" y="190" width="120" height="44" rx="6" />
    </g>
    <text class="lbl" x="75" y="68" text-anchor="middle">phone A</text>
    <text class="lbl" x="245" y="62" text-anchor="middle">gateway 1</text>
    <text class="sm" x="245" y="80" text-anchor="middle">holds A's socket</text>
    <text class="lbl" x="245" y="172" text-anchor="middle">gateway 3</text>
    <text class="sm" x="245" y="190" text-anchor="middle">holds B's socket</text>
    <text class="lbl" x="75" y="178" text-anchor="middle">phone B</text>
    <text class="lbl" x="440" y="52" text-anchor="middle">registry</text>
    <text class="sm" x="440" y="68" text-anchor="middle">user → gw node</text>
    <text class="lbl" x="440" y="130" text-anchor="middle">pub/sub</text>
    <text class="sm" x="440" y="147" text-anchor="middle">per-gateway topic</text>
    <text class="lbl" x="440" y="217" text-anchor="middle">message store</text>
    <text class="sm" x="155" y="50" text-anchor="middle">1 WSS</text>
    <text class="sm" x="345" y="42" text-anchor="middle">2 lookup</text>
    <text class="sm" x="345" y="104" text-anchor="middle">3 publish</text>
    <text class="sm gr" x="345" y="168" text-anchor="middle">4 deliver</text>
    <text class="sm" x="452" y="178">5 persist</text>
    <text class="lbl" x="320" y="262" text-anchor="middle" style="font-size:14px">the hard part is not the socket — it is knowing which of 40 gateway nodes holds it</text>
  </svg>
  <figcaption>Gateways are stateful in exactly one way: they own live sockets. Everything else is stateless, which is what lets you scale and restart them.</figcaption>
</figure>
<p>
  <b>Connection management.</b> A tuned Linux box holds 250,000-500,000 idle
  WebSockets — the constraint is memory (roughly 20-50 KB per connection in
  kernel and userspace buffers) and file descriptors, not the mythical 65,535
  port limit, which applies to outbound tuples rather than accepted
  connections. So 10 M concurrent needs about 40 gateway nodes plus headroom.
  Gateways must be as thin as possible: terminate TLS, hold the socket,
  translate frames to internal messages. The routing state lives in a
  <b>registry</b> (Redis: <code>user_id → gateway_node_id</code>, with a TTL
  refreshed by heartbeat) so that any service can find any user's socket in
  one lookup. Sending to a user is then: look up the node, publish to that
  node's topic, gateway writes the frame.
</p>
<div class="warn">
  <span class="ttl">⚠ The reconnect storm is the failure mode interviewers probe</span>
  A gateway holding 250,000 sockets restarts. All 250,000 clients notice
  simultaneously and reconnect within a second, hammering your load balancer,
  your auth service and your registry at once — and if that overloads the
  next gateway, you cascade. Mitigations to name: jittered exponential
  backoff on the client (mandatory), a connection-rate limit at the gateway
  that sheds rather than queues, and rolling restarts that drain slowly
  instead of dropping everything at once. This is the availability chapter's
  failback storm, in its most common real-world costume.
</div>
<p>
  <b>Ordering.</b> Never order by client timestamp — clocks are skewed by
  seconds and users can set them arbitrarily. Assign a <b>monotonic
  per-conversation sequence number</b> at a single owner (the shard that owns
  that conversation), so ordering is total within the conversation, which is
  the only place it is observable. Global ordering across conversations is
  neither needed nor affordable. The client also attaches a
  <b>client-generated message UUID</b> so a retry after an ambiguous timeout
  is deduplicated server-side rather than posting twice — the cheapest
  idempotency mechanism there is, and its absence is a very visible gap.
</p>
<p>
  <b>Delivery receipts</b> are a four-state machine — sent, server-acked,
  delivered to device, read — and each transition is itself a message that
  must be stored and routed. That doubles or triples your message volume, so
  batch them: acknowledge up to a sequence number rather than per message.
  <b>Presence</b> looks trivial and is not: 10 M online users heartbeating
  every 30 seconds is ~330,000 writes/s just to say "still here," and a
  single online/offline transition must notify everyone watching. Only
  subscribe to presence for contacts currently visible on screen, and batch
  transitions into a periodic digest rather than pushing each one.
</p>
<p>
  <b>And then group chat brings the fan-out question straight back.</b> A
  message to a 5-person group is 5 deliveries — push it into each member's
  inbox, exactly like fan-out on write. A message to a 100,000-member
  community is 100,000 deliveries per message, which is the celebrity problem
  wearing a different hat. The same answer applies: <b>store the message once
  per conversation and let clients pull by (conversation_id, seq &gt;
  last_seen_seq)</b>, with a lightweight "something changed" nudge instead of
  a full delivery. Small groups push, large groups pull, and the threshold
  is again about member count times message rate. Read receipts in a large
  group get degraded to an aggregate count or removed entirely, because N
  readers × M messages of receipt traffic exceeds the traffic of the
  conversation itself.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Chat is the same fan-out
  decision with a tighter latency budget. Small conversations fan out on
  write into per-user inboxes; large ones store once and let clients pull by
  sequence number. Ordering is a per-conversation monotonic sequence assigned
  server-side, and client-generated message IDs make retries idempotent. The
  genuinely stateful part is the gateway layer, so I'd keep gateways thin and
  put user-to-node routing in a registry with heartbeat TTLs."
</div>

<h3>What the interviewer was actually scoring</h3>
<ul>
  <li><b>Did you find the real decision?</b> Everything in this design is easy except fan-out. Time spent on the posts table schema is time not spent on the thing being evaluated. Getting to the fan-out tradeoff inside ten minutes is itself the signal.</li>
  <li><b>Did the numbers drive the design, or decorate it?</b> Estimating 87,000 reads/s and then not using it is worse than not estimating. The chain that scores is: 100:1 read ratio → precompute → 150 M followers breaks precompute → hybrid. Each number must eliminate an option.</li>
  <li><b>Did you reach the hybrid unprompted?</b> Proposing pure fan-out on write and defending it until the interviewer says "what about a celebrity" is a mid-level performance. Anticipating the tail of the follower distribution yourself is a senior one.</li>
  <li><b>Did you state what you gave up?</b> Every choice here costs something: the hybrid adds merge complexity and two code paths that can disagree; capped feeds mean deep scroll needs a fallback; async fan-out means seconds of staleness. Naming the cost of your own design is the strongest single behaviour in the whole loop.</li>
  <li><b>Did you separate the media path?</b> Candidates who route 200 GB/s of images through their API tier have quietly designed something that cannot exist. Object storage plus CDN, with the feed returning URLs, should be a throwaway sentence — but it has to be said.</li>
  <li><b>Did you handle the boring correctness details?</b> Cursor pagination instead of OFFSET, idempotent writes, IDs-not-bodies in the feed. These separate people who have shipped this from people who have read about it, and they cost one sentence each.</li>
  <li><b>Did you scope, and did you push back?</b> Saying "reverse-chronological for v1, and here's where ranking would slot in" is stronger than hand-waving an ML system you cannot describe. Interviewers are calibrating judgement about what to build now, not enthusiasm for building everything.</li>
</ul>`,
};
