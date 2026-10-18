import type { Chapter } from "../types";

export const sysdesWalkthroughSimple: Chapter = {
  id: "sysdes-walkthrough-simple",
  num: "B7",
  title: "Walkthrough: a URL shortener",
  short: "Walkthrough: URL shortener",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle:
    "The full 45-minute arc on the classic warm-up question — where every number is shown, every choice is defended, and the trap is the click counter.",
  body: `<h3>Why this question survives, and how the 45 minutes are spent</h3>
<p>
  "Design a URL shortener" (TinyURL, bit.ly) is the most-asked warm-up in the
  industry and candidates dismiss it at their peril. It survives because the
  functional requirements fit in one sentence, which means <b>100% of your
  signal comes from how you reason, not from what you build</b>. There is
  nowhere to hide behind domain complexity. Every senior-level muscle gets
  exercised: scoping, capacity estimation, an ID-generation choice with real
  collision math, a read-heavy caching story, and one planted trap that
  separates people who have run a system from people who have read about one.
</p>
<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="A forty-five minute interview timeline split into six phases: five minutes clarifying, five minutes estimating, six minutes on the API and data model, fourteen minutes of core design, eight minutes of deep dive and seven minutes of scaling and wrap-up, with the first ten minutes highlighted as the ones candidates skip">
    <g class="rough">
      <rect class="boxy" x="16"  y="56" width="68"  height="40" rx="5" />
      <rect class="boxy" x="84"  y="56" width="67"  height="40" rx="5" />
      <rect class="box"  x="151" y="56" width="81"  height="40" rx="5" />
      <rect class="boxg" x="232" y="56" width="189" height="40" rx="5" />
      <rect class="box"  x="421" y="56" width="108" height="40" rx="5" />
      <rect class="box"  x="529" y="56" width="95"  height="40" rx="5" />
      <path class="lnr" d="M50,132 L50,100" />
      <path class="lnr" d="M117,132 L117,100" />
    </g>
    <text class="lbl" x="320" y="26" text-anchor="middle">where the 45 minutes actually go</text>
    <text class="sm" x="50"  y="50" text-anchor="middle">5 min</text>
    <text class="sm" x="117" y="50" text-anchor="middle">5 min</text>
    <text class="sm" x="191" y="50" text-anchor="middle">6 min</text>
    <text class="sm" x="326" y="50" text-anchor="middle">14 min</text>
    <text class="sm" x="475" y="50" text-anchor="middle">8 min</text>
    <text class="sm" x="576" y="50" text-anchor="middle">7 min</text>
    <text class="sm" x="50"  y="81" text-anchor="middle">clarify</text>
    <text class="sm" x="117" y="81" text-anchor="middle">estimate</text>
    <text class="sm" x="191" y="81" text-anchor="middle">API + model</text>
    <text class="sm" x="326" y="81" text-anchor="middle">core design</text>
    <text class="sm" x="475" y="81" text-anchor="middle">deep dive</text>
    <text class="sm" x="576" y="81" text-anchor="middle">scale + wrap</text>
    <text class="sm rd" x="112" y="152" text-anchor="middle">the ten minutes candidates skip</text>
    <text class="sm" x="112" y="172" text-anchor="middle">and then design the wrong system</text>
    <text class="sm" x="356" y="152">every later phase inherits the numbers</text>
    <text class="sm" x="356" y="172">you agreed on in the first two</text>
  </svg>
  <figcaption>The deep dive is where the level gets decided, but its topic is chosen by the interviewer based on what you said in the first ten minutes. Rushing to boxes-and-arrows forfeits that.</figcaption>
</figure>

<h3>Minute 0-5: the clarifying questions worth asking</h3>
<p>
  Ask questions that <em>change the design</em>. "Should it be scalable?" is
  noise. Each of these has a wrong answer that would send you somewhere else
  entirely, and you should say why you're asking.
</p>
<table>
  <tr><th>Question</th><th>Why it changes the design</th><th>Assume, if they shrug</th></tr>
  <tr><td>What's the traffic — new links per day?</td><td>Sets everything downstream: key length, storage, shard count</td><td>10 M creates/day</td></tr>
  <tr><td>Read to write ratio?</td><td>Decides whether this is a caching problem or a write problem</td><td>100:1 — so 1 B redirects/day</td></tr>
  <tr><td>How long do links live?</td><td>Unbounded means 5-year storage math and a reclamation story; TTLs mean the keyspace recycles</td><td>Default never expire, optional expiry</td></tr>
  <tr><td>Custom aliases?</td><td>Adds a second, user-controlled namespace with a uniqueness race and a squatting problem</td><td>Yes, as an optional field</td></tr>
  <tr><td>Do we need per-click analytics?</td><td><b>This is the load-bearing one.</b> It decides how long (if at all) a redirect may be cached, and it introduces a write path 100× the create path</td><td>Yes — counts, and coarse geo/referrer</td></tr>
  <tr><td>Should keys be unguessable?</td><td>Rules out a plain counter; forces a scramble, a hash, or a pre-generated pool</td><td>Yes — enumerable links leak private URLs (keys are still not secrets: truly private targets need authentication)</td></tr>
  <tr><td>Latency target on the redirect?</td><td>Sets the caching and geographic strategy</td><td>p99 under 100 ms at the edge</td></tr>
  <tr><td>Global or single region?</td><td>Multi-region changes the write path and the consistency story</td><td>Global reads, single-region writes</td></tr>
</table>
<p>
  Then state the requirements back, split into functional and non-functional,
  and get agreement. Functional: create a short link from a long URL,
  optionally with a custom alias and an expiry; redirect a short link to its
  target; report click counts; delete or disable a link. Non-functional:
  redirects are the hot path and must be fast and highly available; creates
  can be slower and can tolerate brief unavailability; keys must not be
  enumerable; a link, once created, must never resolve to the wrong target —
  <b>that last one is a correctness requirement, not a nicety, and it is what
  makes key uniqueness a security property rather than a hygiene issue</b>.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I draw anything: I'm
  assuming 10 million creates a day, roughly 100 reads per write, links that
  live indefinitely by default, and that we need per-click analytics. The
  analytics answer is the one I care most about, because it turns a
  116-writes-per-second system into an 11,574-writes-per-second system, and
  I'd design those two paths very differently. Sound right?"
</div>

<h3>Minute 5-10: back-of-envelope, line by line</h3>
<p>
  Write the arithmetic on the board. Not the results — the arithmetic. Round
  aggressively and say that you're rounding. There are 86,400 seconds in a
  day; approximating that as 100,000 is standard and keeps the mental math
  clean, though below I'll use the real figure so the numbers reconcile.
</p>
<p><b>Traffic.</b></p>
<ul>
  <li>Writes: 10,000,000 ÷ 86,400 = <b>116 creates/sec</b>. At 3× peak: <b>~350/sec</b>.</li>
  <li>Reads: 10,000,000 × 100 = 1,000,000,000 redirects/day. 1,000,000,000 ÷ 86,400 = <b>11,574 redirects/sec</b>. At 3× peak: <b>~35,000/sec</b>.</li>
  <li>The two paths are <b>two orders of magnitude apart</b> (11,574 ÷ 116 is about 100×; 35,000 ÷ 350 is exactly 100×). That single observation drives the entire rest of the design: separate services, separate scaling, and a cache that only the read path touches.</li>
</ul>
<p><b>Storage over 5 years.</b></p>
<ul>
  <li>Per row: 7 B short key + ~100 B average long URL + 8 B user id + 8 B created_at + 8 B expires_at + flags ≈ 132 B of payload. With row overhead, the primary index and one secondary index, budget <b>500 B per link</b>.</li>
  <li>Rows: 10,000,000/day × 365 × 5 = <b>18.25 billion</b>.</li>
  <li>Storage: 18.25 × 10⁹ × 500 B = 9.125 × 10¹² B = <b>~9.1 TB</b>. With 3× replication, <b>~27 TB</b>.</li>
  <li>Read that number back: 9 TB is <em>small</em>. It fits on three commodity volumes. Storage is not the hard part of this problem, and saying so out loud stops you over-engineering the next twenty minutes.</li>
</ul>
<p><b>Bandwidth.</b></p>
<ul>
  <li>Writes: 116/sec × ~500 B ≈ <b>58 KB/sec</b>. Nothing.</li>
  <li>Reads: a redirect response is headers plus a <code>Location</code>, call it 500 B. 11,574/sec × 500 B ≈ <b>5.8 MB/sec ≈ 46 Mbps</b>; 139 Mbps at peak. Also nothing — one server's NIC.</li>
  <li>Conclusion: this is a <b>QPS and key-management problem</b>, not a bandwidth or storage problem. Naming what the problem <em>isn't</em> is a senior move.</li>
</ul>
<p><b>Cache sizing.</b></p>
<ul>
  <li>Redirect traffic is strongly recency-skewed — most clicks land on links created in the last few days. Cache the ~10 most recent days of creations plus the evergreen tail: 10 × 10,000,000 = <b>100 million entries</b>.</li>
  <li>Per entry: 7 B key + ~100 B URL + Redis object overhead ≈ <b>200 B</b>. 100 × 10⁶ × 200 B = <b>20 GB</b> — a three-node Redis cluster with room to spare.</li>
  <li>At a 95% hit rate the datastore sees 11,574 × 0.05 = <b>579 reads/sec</b> (1,750/sec at peak). <b>That is the whole point of the estimate</b>: the read tier's job is to shrink 35,000/sec down to something a single replicated store answers without breaking a sweat.</li>
</ul>
<p class="sub">
  One database sanity check against the course's planning figures (about
  20,000 simple indexed reads/s and 5,000 committed writes/s for one relational
  primary; conservative numbers, not limits): 35,000 redirects/s of peak
  traffic would exceed one primary on reads, which is why the cache exists, and
  the 11,574 click-count writes/s of the naive design would exceed its write
  figure by more than 2×.
</p>
<p class="sub">
  Server count, since it always gets asked: a stateless handler that does one
  Redis <code>GET</code> and emits a 302 will do roughly 8-10k requests/sec on
  a modest instance. 35,000 ÷ 8,000 ≈ 5, so call it 12 instances across three
  availability zones — sized for redundancy and headroom, not for throughput.
</p>

<h3>Minute 10-16: the API surface and the redirect semantics</h3>
<table>
  <tr><th>Endpoint</th><th>Notes</th></tr>
  <tr><td><code>POST /api/v1/links</code><br/><code>{ url, alias?, expires_at? }</code> → <code>201 { key, short_url, expires_at }</code></td><td>Requires <code>Authorization</code> and an <code>Idempotency-Key</code> header (an IETF draft convention, not yet an RFC, but widely used by payment APIs), so a client retry after a timeout does not mint two keys for one user action. Rate-limited per account</td></tr>
  <tr><td><code>GET /{key}</code> → <code>302</code> + <code>Location</code></td><td>The hot path. No auth, no body, no database write. Must be the simplest code in the system</td></tr>
  <tr><td><code>GET /api/v1/links/{key}</code></td><td>Metadata for the owner; not the redirect path</td></tr>
  <tr><td><code>DELETE /api/v1/links/{key}</code></td><td>Soft delete + immediate cache purge. Abuse takedown depends on this being fast</td></tr>
  <tr><td><code>GET /api/v1/links?cursor=&amp;limit=</code></td><td>Cursor pagination, not offset — a heavy account has millions of links</td></tr>
  <tr><td><code>GET /api/v1/links/{key}/stats?from=&amp;to=</code></td><td>Served from the analytics store, never from the links table</td></tr>
</table>
<p>
  Then the question that looks trivial and isn't: <b>which redirect status,
  and how long may it be cached?</b> The status code sets a default; the
  <code>Cache-Control</code> header overrides it. RFC 9110 marks
  <code>301</code> and <code>308</code> as heuristically cacheable, so a bare
  301 can sit in a browser (and in any shared cache) for a long time and you
  never see the repeat visit. <code>302</code> and <code>307</code> carry no
  such default and are cached only if the response says so. That gives you a
  menu, not a binary choice:
</p>
<table>
  <tr><th>Option</th><th>Headers</th><th>Clicks you see</th><th>Time to revoke a link</th><th>Use it when</th></tr>
  <tr><td><b>A. Never cached</b></td><td><code>302</code> or <code>307</code> + <code>Cache-Control: no-store</code> (or <code>private, max-age=0</code>)</td><td>Every click, including repeats from the same browser</td><td>Immediate for browsers; bounded by your own L1/Redis TTL and purge on your side</td><td>Default. Analytics and fast takedown are product requirements</td></tr>
  <tr><td><b>B. 301 with a short private TTL</b></td><td><code>301</code> + <code>Cache-Control: private, max-age=90</code></td><td>One click per browser per 90 s; repeats inside the window are served from the browser cache</td><td>Up to the TTL (90 s here), and only for browsers that already have it, because <code>private</code> keeps CDNs and proxies from storing it</td><td>You want 301 semantics and fewer repeat hits, and can state a takedown window of "a couple of minutes"</td></tr>
  <tr><td><b>C. Edge-cached, purge on delete</b></td><td><code>302</code> + <code>Cache-Control: max-age=0, s-maxage=3600</code> + a purge-by-tag call when a link is disabled</td><td>Only cache misses reach you; count clicks from edge logs instead</td><td>The purge time: a few seconds or less on modern CDNs (Cloudflare reports a global p50 under 150 ms for tag purges); budget tens of seconds for slow or tiered setups</td><td>Global latency matters (scaling stage 5) and you have a CDN with a fast purge API</td></tr>
  <tr><td><b>D. Bare 301 or 308</b></td><td><code>301</code> or <code>308</code>, no cache headers</td><td>Roughly one click per browser, ever</td><td>Effectively never, for browsers that have cached it</td><td>Permanent, non-sensitive links where you accept no analytics and no takedown. Not for a public shortener</td></tr>
</table>
<p>
  Real shorteners sit at option B: when this chapter was checked in October
  2026, a bit.ly link answered with <code>301</code> and
  <code>Cache-Control: private, max-age=90</code>. The old advice that
  "301 makes a phishing link irrevocable" is true of option D and wrong for B:
  a short <em>private</em> TTL bounds the damage to a stated number of seconds.
  Pick A by default, offer B or C per link or per customer, and say the
  revocation window of whatever you pick out loud. Saying <em>that</em>
  tradeoff, rather than picking a number, is the answer.
</p>

<h3>Key generation: three strategies and the collision math</h3>
<p>
  This is the technical core of the question. First, key length. Base62
  (<code>a-z A-Z 0-9</code>) gives you 62 characters per position:
</p>
<ul>
  <li>62⁶ = <b>56,800,235,584</b> ≈ 5.68 × 10¹⁰</li>
  <li>62⁷ = <b>3,521,614,606,208</b> ≈ 3.52 × 10¹²</li>
</ul>
<p>
  We need 18.25 × 10⁹ keys. Against 62⁶ that is 18.25 ÷ 56.8 = <b>32% of the
  keyspace</b> — fine for a counter, disastrous for random generation, since
  by year five roughly one in three random draws would collide. Against 62⁷ it
  is 18.25 ÷ 3,521.6 = <b>0.52%</b>. So: <b>7 characters if keys are random,
  6 if they come from a counter</b>. That difference is not cosmetic — a
  counter uses the keyspace densely, which is precisely what randomness gives
  up. The same density works against you when someone guesses keys: with 6 characters,
  32% of every possible key is a live link by year five, so a random probe hits
  a real link about one time in three even if the counter is scrambled. At 7
  characters the density is 0.52%, about one hit per 190 guesses. Either way
  the key is an identifier, not a secret.
</p>
<table>
  <tr><th></th><th>Hash + truncate</th><th>Counter + base62</th><th>Pre-generated key pool</th></tr>
  <tr><td>Mechanism</td><td>SHA-256(url + salt), base62-encode, take the first 7 chars</td><td>Global monotonic counter, base62-encode the integer</td><td>An offline service generates unique random keys into a table and hands out blocks</td></tr>
  <tr><td>Collisions</td><td>Expected ≈ N²/2M = (1.825×10¹⁰)² ÷ (2 × 3.52×10¹²) ≈ <b>47 million</b> over 5 years — ~1 in 390 inserts on average, ~1 in 190 by year 5</td><td><b>Zero, by construction</b></td><td><b>Zero</b> — uniqueness is enforced once, offline, at generation time</td></tr>
  <tr><td>Write path</td><td>Conditional insert (<code>ON CONFLICT DO NOTHING</code>); on conflict, read the existing row: same long URL and owner means return that key, a different URL means re-salt and retry. Never read-then-write — that races</td><td>One unconditional insert</td><td>One unconditional insert; the key was already reserved</td></tr>
  <tr><td>Guessable?</td><td>No</td><td><b>Yes</b> — sequential keys let anyone enumerate every link and infer your daily volume. Needs a bijective scramble (a keyed Feistel permutation over the integer) to hide the order, but at 6 characters the space is 32% occupied by year 5, so random probing still hits about 1 in 3</td><td>No</td></tr>
  <tr><td>Key length needed</td><td>7</td><td>6 (7 if you also want sparse keys)</td><td>7</td></tr>
  <tr><td>Same URL twice</td><td>Same key — free dedupe, but two users now share one link's analytics and either can delete it. Salt with the user id if that matters</td><td>Different keys</td><td>Different keys</td></tr>
  <tr><td>New moving parts</td><td>None</td><td>A counter service, and range allocation so it isn't a per-write hotspot</td><td>A key-generation service, its own store, and a strictly transactional handout</td></tr>
  <tr><td>Reach for this when…</td><td>You want zero extra infrastructure and can tolerate a retry loop on the write path</td><td>You control the whole system, want the shortest keys, and will do the scramble properly</td><td>You want the write path to be a single unconditional insert with no collision logic anywhere — the choice at genuinely large scale</td></tr>
</table>
<p>
  The counter approach deserves one more number, because it kills the obvious
  objection. Nobody increments a shared counter 116 times a second; you
  <b>allocate ranges</b>. Each app server takes a block of 1,000,000 ids and
  serves creates from local memory. At 10 M creates a day, the fleet consumes
  <b>ten blocks per day</b> — the counter service handles about ten requests
  in twenty-four hours, and can be a single row in Postgres behind a
  transaction. If a server crashes, its unused ids are lost: worst case a full
  fleet restart burns 12 × 1,000,000 = 12 million ids, which is 0.02% of 62⁶.
  <b>Deliberately wasting 12 million ids to avoid a distributed counter is the
  correct engineering trade, and saying it that plainly is the signal.</b>
</p>
<p class="sub">
  Sizing the pre-generated pool, if you go that way: hold six months of
  buffer, 10 M/day × 180 = 1.8 × 10⁹ keys at 8 B each = <b>14.4 GB</b> — a
  single table. Generate replacements at 116/sec, which is trivial. The one
  thing you must get right is the handout: two servers receiving the same key
  block means two links resolving to the same short code, which is a security
  bug, not a glitch. Hand out blocks inside a transaction that marks them
  taken, and accept losing a block when a server dies.
</p>
<div class="warn">
  <span class="ttl">⚠ "I'll hash the URL and check if it exists"</span>
  <code>SELECT</code> then <code>INSERT</code> is a race: two concurrent
  creates both see "free" and both insert, and now one of them silently
  overwrote the other's link. The redirect for that key now sends users to the
  wrong site. It must be a single conditional write — <code>INSERT … ON
  CONFLICT DO NOTHING</code> in Postgres, a conditional
  <code>attribute_not_exists(key)</code> in DynamoDB — and when zero rows are
  affected, read the existing row: if it holds the same URL for the same owner,
  return its key, and only if it holds a different URL retry with a different
  salt. Interviewers plant this one
  deliberately; getting it right takes one sentence and getting it wrong
  undoes a good design.
</div>

<h3>Data model, and the trap in the click counter</h3>
<p>
  The read path does exactly one thing: point lookup by primary key. No joins,
  no ranges, no sorting. That is a pure key-value access pattern, which tells
  you the storage engine barely matters and the sharding key is obvious.
</p>
<ul>
  <li><b>links</b> — <code>short_key</code> (PK, char(7)), <code>long_url</code>, <code>user_id</code>, <code>created_at</code>, <code>expires_at</code>, <code>is_active</code>. Sharded by <code>hash(short_key)</code>: uniform distribution, and every redirect knows its shard from the URL alone with no lookup.</li>
  <li><b>links_by_user</b> — a secondary index or GSI on <code>user_id</code>, for the low-volume "list my links" API. Do not let this exist on the redirect path.</li>
  <li><b>click events</b> — a separate system entirely. Not a column. Not on this table. Not in this database.</li>
</ul>
<div class="warn">
  <span class="ttl">⚠ The planted trap: UPDATE links SET clicks = clicks + 1</span>
  It is the natural thing to write and it destroys the design. Your create
  path is 116 writes/sec; adding a counter update to every redirect makes it
  <b>11,574 writes/sec</b> — a 100× increase, and more than twice a single
  primary's conservative 5,000-writes/sec planning figure — aimed at the exact rows you are
  trying to read, with row-level lock contention concentrated on whichever
  links are popular. A single viral link means thousands of serialised writes
  per second to one row, replication lag behind it, and cache invalidation
  storms because the row keeps changing. The read-heavy system you just sized
  quietly became a write-heavy one.
</div>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A comparison of counting clicks with a database update on every redirect producing over eleven thousand writes per second, against buffering counts in process memory and flushing them every ten seconds into an event stream, producing seventy two batched flushes per minute">
    <g class="rough">
      <path class="lnr" d="M160,78 L160,106" />
      <path class="lnr" d="M160,144 L160,180" />
      <path class="lng" d="M480,78 L480,106" />
      <path class="lng dash" d="M480,144 L480,180" />
      <path class="ln dash" d="M320,16 L320,238" />
    </g>
    <g class="rough">
      <rect class="box"  x="100" y="40"  width="120" height="38" rx="6" />
      <rect class="boxr" x="90"  y="106" width="140" height="38" rx="6" />
      <rect class="boxr" x="100" y="180" width="120" height="38" rx="6" />
      <rect class="box"  x="420" y="40"  width="120" height="38" rx="6" />
      <rect class="boxg" x="410" y="106" width="140" height="38" rx="6" />
      <rect class="boxg" x="410" y="180" width="140" height="38" rx="6" />
    </g>
    <text class="lbl" x="160" y="28" text-anchor="middle">naive</text>
    <text class="lbl" x="480" y="28" text-anchor="middle">buffered</text>
    <text class="sm" x="160" y="64" text-anchor="middle">redirect path</text>
    <text class="sm" x="480" y="64" text-anchor="middle">redirect path</text>
    <text class="sm rd" x="160" y="124" text-anchor="middle">UPDATE clicks + 1</text>
    <text class="sm rd" x="160" y="138" text-anchor="middle">on every redirect</text>
    <text class="sm gr" x="480" y="124" text-anchor="middle">in-process counter</text>
    <text class="sm gr" x="480" y="138" text-anchor="middle">per key, per instance</text>
    <text class="sm rd" x="160" y="204" text-anchor="middle">primary datastore</text>
    <text class="sm gr" x="480" y="198" text-anchor="middle">flush every 10 s →</text>
    <text class="sm gr" x="480" y="212" text-anchor="middle">event stream → rollups</text>
    <text class="sm rd" x="160" y="236" text-anchor="middle">694,000 writes/min, hot-row locks</text>
    <text class="sm gr" x="480" y="236" text-anchor="middle">72 batched flushes/min — ~9,600× fewer</text>
  </svg>
  <figcaption>Twelve instances flushing six times a minute produce 72 batched writes a minute regardless of traffic; how many rows each batch carries depends on how many distinct links were clicked. The counter becomes eventually consistent and can lose ten seconds of clicks on a crash — for a click counter, that is obviously the right price.</figcaption>
</figure>
<p>
  The arithmetic: naive is 11,574 × 60 = <b>694,440 writes/min</b>. Buffered is
  12 instances × 6 flushes/min = <b>72 batched writes/min</b>, and 694,440 ÷ 72
  is about <b>9,600× fewer</b> write transactions; the redirect path itself now
  performs <em>zero</em> writes. Be honest about the other number, though: a
  flush writes one delta per <em>distinct</em> link that instance saw in the
  10-second window. Each instance handles about 11,574 ÷ 12 ≈ 965 redirects a second, about 9,650 in a window. If they touch an illustrative 500 distinct links, a flush carries
  about 500 rows and the fleet writes 72 × 500 = 36,000 row updates a minute,
  roughly 19× fewer rows than the naive 694,440. With a long tail where nearly
  every click is a different link, the row count barely falls; with a viral link
  it collapses. That is why the counts go to an append-only stream and rollup
  store rather than into the <code>links</code> table at all. If you
  want durable, attributable click events (geo, referrer, timestamp) rather
  than just counts, publish one event per redirect to Kafka and aggregate
  downstream — same principle, the redirect still never touches the primary
  store, and the analytics pipeline scales on its own budget.
</p>

<h3>Minute 16-30: the architecture</h3>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="The full architecture: clients reach a CDN and anycast edge, then a layer seven load balancer that splits traffic between a stateless read-only redirect service backed by a Redis cluster and a write-only create service backed by a key allocation service, both sitting on a key-value store sharded by hash of the short key">
    <g class="rough">
      <path class="ln"  d="M88,134 L106,134" />
      <path class="ln"  d="M186,134 L204,134" />
      <path class="lng" d="M280,124 L300,82" />
      <path class="ln"  d="M280,146 L300,184" />
      <path class="lng" d="M412,64 L436,64" />
      <path class="lnr dash" d="M470,92 L470,112" />
      <path class="ln"  d="M436,190 L414,190" />
      <path class="ln"  d="M414,180 L436,156" />
    </g>
    <g class="rough">
      <rect class="box"  x="8"   y="112" width="80"  height="44" rx="6" />
      <rect class="boxy" x="106" y="112" width="80"  height="44" rx="6" />
      <rect class="boxy" x="204" y="112" width="76"  height="44" rx="6" />
      <rect class="boxg" x="300" y="42"  width="112" height="44" rx="6" />
      <rect class="boxy" x="436" y="42"  width="96"  height="44" rx="6" />
      <rect class="box"  x="436" y="112" width="180" height="44" rx="6" />
      <rect class="box"  x="300" y="168" width="114" height="44" rx="6" />
      <rect class="box"  x="436" y="168" width="120" height="44" rx="6" />
    </g>
    <text class="sm" x="48"  y="130" text-anchor="middle">clients</text>
    <text class="sm" x="48"  y="146" text-anchor="middle">browser, app</text>
    <text class="sm" x="146" y="130" text-anchor="middle">CDN /</text>
    <text class="sm" x="146" y="146" text-anchor="middle">anycast edge</text>
    <text class="sm" x="242" y="130" text-anchor="middle">L7 load</text>
    <text class="sm" x="242" y="146" text-anchor="middle">balancer</text>
    <text class="sm" x="356" y="60"  text-anchor="middle">redirect service</text>
    <text class="sm" x="356" y="76"  text-anchor="middle">stateless, read-only</text>
    <text class="sm" x="484" y="60"  text-anchor="middle">Redis cluster</text>
    <text class="sm" x="484" y="76"  text-anchor="middle">20 GB, ~95% hit</text>
    <text class="sm" x="526" y="130" text-anchor="middle">KV store, sharded on</text>
    <text class="sm" x="526" y="146" text-anchor="middle">hash(short_key)</text>
    <text class="sm" x="357" y="186" text-anchor="middle">create service</text>
    <text class="sm" x="357" y="202" text-anchor="middle">writes only</text>
    <text class="sm" x="496" y="186" text-anchor="middle">key service</text>
    <text class="sm" x="496" y="202" text-anchor="middle">1 M-id blocks</text>
    <text class="sm rd" x="502" y="106" text-anchor="middle">~5% miss</text>
    <text class="sm gr" x="150" y="242">reads: 11.6k/s average, 35k/s peak — cache absorbs 95%</text>
    <text class="sm" x="150" y="262">writes: 116/s average, 350/s peak — two orders of magnitude (100x) smaller</text>
    <text class="sm" x="150" y="282">so the two paths are separate services that scale independently</text>
  </svg>
  <figcaption>The redirect service is deliberately the dumbest component in the diagram: one cache lookup, one 302, no writes, no auth, no joins. Everything expensive has been moved off the path that runs a billion times a day.</figcaption>
</figure>
<p>
  Walk the two paths out loud. <b>Create:</b> authenticate, validate and
  normalise the URL, check the idempotency key, take the next id from the
  in-memory block, write the row, populate the cache optimistically, return
  201. <b>Redirect:</b> <code>GET</code> the key from Redis; on a hit emit a
  302 immediately; on a miss read the shard, populate the cache with a
  jittered TTL, emit the 302; increment an in-process click counter and return.
  Nineteen times out of twenty (the 95% hit rate) the entire request is one
  memory lookup in a co-located Redis and a response with no body.
</p>
<div class="sticky mint">
  <span class="ttl">Why this design is easy, in one sentence</span>
  Once created, a short link's <b>destination is immutable</b> — the mapping
  never changes; only its state (active, disabled, expired) can. Immutable,
  tiny, read-heavy data is the friendliest possible thing to cache and
  replicate, which is why a system doing a billion reads a day needs no
  consistency protocol for the mapping. The one thing that does need prompt
  propagation is a takedown, so budget for it explicitly (below). Say this, and the interviewer knows you
  understand <em>why</em> it's easy rather than just that it is.
</div>

<h3>Minute 30-45: the deep dive, the scaling path and the follow-ups</h3>
<table>
  <tr><th>Stage</th><th>Trigger</th><th>What changes</th><th>What it buys</th></tr>
  <tr><td>1. One box</td><td>Launch</td><td>App + Postgres + Redis on one machine</td><td>Genuinely serves millions of redirects a day. Start here and say so</td></tr>
  <tr><td>2. Split and scale the read tier</td><td>CPU on the app</td><td>Stateless redirect instances behind an L7 LB, dedicated Redis</td><td>Linear read scaling; the DB is now protected by a 95% hit rate</td></tr>
  <tr><td>3. Read replicas</td><td>Cache misses saturate the primary</td><td>Route redirect misses to replicas; creates stay on the primary</td><td>Read capacity without sharding. Replica lag is harmless for the mapping, which never changes; it is not harmless for a takedown, so disable and delete on the primary, purge caches explicitly, and accept a short window where a lagging replica can still serve the old row</td></tr>
  <tr><td>4. Shard the store</td><td>Data past a few TB, or write IOPS</td><td>Hash-shard on <code>short_key</code>; or move to DynamoDB/Cassandra, which is what this access pattern wants</td><td>Horizontal storage and write scaling with no cross-shard queries, ever</td></tr>
  <tr><td>5. Go multi-region</td><td>p99 for distant users, or a regional outage requirement</td><td>Read replicas or a full cache per region; writes still home to one region; optionally edge caching of the redirect with an explicit <code>s-maxage</code> and purge-on-delete (option C above), counting clicks from edge logs</td><td>Redirect latency from a cross-ocean round trip of 200 ms or more down to tens of milliseconds. Safe because the mapping is immutable, with the takedown window as the one cost</td></tr>
  <tr><td>6. Split analytics off</td><td>Anyone asks for dashboards</td><td>Click events to Kafka, stream aggregation, columnar store for queries</td><td>Analytics load never touches the redirect path</td></tr>
</table>
<p>
  The follow-ups an interviewer will reach for, and the one-line answers:
</p>
<ul>
  <li><b>A link goes viral — one key gets 50,000 rps.</b> That's a single hot Redis shard. Add a per-instance L1 cache with a 1-5 second TTL in front of Redis: 12 instances refreshing once a second is at most 12 reads/sec to Redis no matter how viral the link gets. The destination is immutable, so a few seconds of staleness costs nothing, with one exception: that TTL is also your takedown window for a disabled link unless the delete publishes an invalidation to every instance.</li>
  <li><b>How do you expire 18 billion rows?</b> Never a <code>DELETE … WHERE expires_at &lt; now()</code> across the table. Prefer a store with native TTL (DynamoDB TTL, Cassandra TTL), where expiry is a background delete the store schedules; in Postgres, sweep expired rows in small batches via an index on <code>expires_at</code>. Partitioning so that expiry is a <code>DROP PARTITION</code> only works if you partition by expiry time, which makes the point lookup on <code>short_key</code> probe every partition, so it is a poor fit here. Add lazy deletion on top: if a read finds an expired row, return 410 and evict.</li>
  <li><b>Attackers hammer random keys.</b> Every miss on a nonexistent key would fall through to the store. Put a Bloom filter of live keys (or a short negative-cache entry for 404s) in front of it, and rate-limit by IP.</li>
  <li><b>Where does the counter service live?</b> One Postgres row is fine at ten block grants a day; if you want it off your database, a coordinator such as ZooKeeper or etcd can hand out the same ranges. Snowflake-style time-based ids also work but need 64 bits, which is 11 base62 characters, far longer than the 6 or 7 you budgeted.</li>
  <li><b>Custom aliases racing.</b> Same conditional insert as key generation, plus a reserved-word list (<code>api</code>, <code>login</code>, <code>admin</code>) so a user can't claim a path that shadows your own routes.</li>
  <li><b>Abuse and phishing.</b> Scan the target on create against a reputation service; hold new links from untrusted accounts behind an interstitial; rate-limit creates per account and per IP. All of this depends on being able to revoke quickly, within a window you can state — which is the argument for a non-cached (or short-TTL) redirect you already made.</li>
  <li><b>What do you monitor?</b> Cache hit rate (an early-warning signal for everything), p99 redirect latency, key-block depth per instance, create error rate, and the 404 rate on redirects, which spikes when a shard is misrouted.</li>
  <li><b>What breaks first?</b> Be specific: the Redis cluster. At 95% hit rate the store sees 579 reads/sec; lose one of three cache nodes and the miss rate goes to roughly 1/3 + 2/3 × 0.05 = 0.367, sending 11,574 × 0.367 ≈ <b>4,250 reads/sec</b> at the store — about a 7× spike (about 12,700/sec at 3× peak, which is within a single primary's ~20,000 reads/sec planning figure but leaves no headroom). Consistent hashing keeps a node loss from reshuffling the other two, and the store must be sized for the degraded number, not the healthy one.</li>
</ul>

<h4>Dry run: the six phases of this exact interview, with the numbers each one produced</h4>
<table>
  <tr><th>Phase</th><th>Time</th><th>What got decided</th><th>Number that drove it</th></tr>
  <tr><td>Clarify</td><td>0-5 min</td><td>10M creates/day, 100:1 read:write, links live indefinitely, per-click analytics required, keys unguessable</td><td>The analytics answer alone turns 116 writes/sec into 11,574 writes/sec — the single fact that shapes everything after it</td></tr>
  <tr><td>Estimate</td><td>5-10 min</td><td>Separate the read and write paths; size storage, bandwidth, and cache</td><td>350 peak creates/sec vs 35,000 peak redirects/sec — two orders of magnitude (100×) apart; ~27 TB replicated storage; 20 GB cache at 95% hit</td></tr>
  <tr><td>API + model</td><td>10-16 min</td><td>Six endpoints; the redirect handler takes no auth and does no write; 302 with no-store chosen by default, 301 with a 90 s private TTL offered as an option</td><td>A bare 301 can sit in browser caches indefinitely, making a phishing link effectively irrevocable; analytics and a bounded takedown window rule it out as the default</td></tr>
  <tr><td>Core design</td><td>16-30 min</td><td>Counter + base62 for key generation; buffer click counts in memory instead of writing on every redirect</td><td>6-char keys need zero collision handling; buffering cuts click write transactions from 694,440/min to 72/min, about 9,600× fewer (rows per batch depend on how many distinct links were clicked)</td></tr>
  <tr><td>Deep dive</td><td>30-38 min</td><td>The interviewer's pick; here the viral key and the takedown window: a 1-5 second L1 cache in front of Redis, and an explicit purge on delete</td><td>A 50,000 rps key costs Redis at most 12 reads/sec with 12 instances and a 1-second L1 TTL; at a 95% hit rate the store sees only 579 reads/sec on average</td></tr>
  <tr><td>Scale + wrap</td><td>38-45 min</td><td>Six-stage scaling path, each gated by a named trigger, not a fixed timeline</td><td>Losing one of three Redis nodes sends store traffic from 579 to ~4,250 reads/sec — the store must be sized for that, not for the healthy case</td></tr>
</table>
<p class="sub">
  Every number in the right-hand column was computed earlier in this same
  walkthrough — nothing here is new arithmetic. That is the point of the
  exercise: a senior answer is not six separate good ideas, it is one chain
  where each phase's output is the next phase's input.
</p>

<h3>What the interviewer was actually scoring</h3>
<p>
  The rubric is never "did you produce the reference architecture." Almost
  everyone converges on roughly the same boxes. These are the axes that
  actually get written on the feedback form:
</p>
<ul>
  <li><b>Did you drive?</b> Whether you scoped the problem yourself or waited to be handed requirements is usually decided in the first three minutes, and it is the single most common reason a strong engineer gets down-levelled here.</li>
  <li><b>Did a number change a decision?</b> Estimation is not a ritual. The 9 TB figure is what justified <em>not</em> proposing an exotic distributed store; the 100:1 ratio is what justified splitting read and write services; the 20 GB cache figure is what made "95% hit rate" a claim rather than a hope. If your estimates didn't visibly steer anything, you performed the ritual without doing the work.</li>
  <li><b>Did you find the click counter?</b> This is the planted trap. Spotting that per-click writes are 100× the create load — unprompted — is the strongest single signal available in this question.</li>
  <li><b>Did you commit?</b> Comparing three key-generation strategies and then not choosing one reads as indecision, not rigour. Pick one, name what you're giving up, and say what would make you switch.</li>
  <li><b>Was your design proportionate?</b> Reaching for Cassandra, Kafka and a stream processor in minute four for a system one Postgres box would serve is scored as a negative at senior level. Knowing the smallest thing that works, and knowing exactly which metric would force the next step, is the whole skill.</li>
  <li><b>Did you know your correctness boundaries?</b> That the mapping is immutable (so replica lag and stale caches are harmless, except for takedowns, where the cache TTL is your revocation window), that click counts are eventually consistent and may lose ten seconds (fine), but that key uniqueness must be enforced by a conditional write (not fine to hand-wave, because the failure is a link resolving to the wrong site).</li>
  <li><b>Did the follow-up land?</b> "Now make it 100×" or "now it's multi-region" is a test of whether your design had joints. A design where the answer is "add more redirect instances and a regional cache" was built by someone who has scaled something; a design where the answer is "I'd rebuild it" was not.</li>
  <li><b>Level tell:</b> a mid-level answer produces a design that works. A senior/staff answer additionally names the tradeoff it is accepting, quantifies the cost of that trade, states what it is deliberately <em>not</em> building, and identifies the metric that would change its mind.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State the peak writes/sec and peak reads/sec for this exact scenario from memory, and explain why the two-order-of-magnitude (100×) gap between them drives the whole architecture.</li>
    <li>Compute the base62 key length needed for 18.25 billion keys under random generation versus a counter, and explain why the two strategies need different lengths, and why a 6-character scrambled counter is 32% dense by year five.</li>
    <li>Spot the planted click-counter trap and quantify why writing on every redirect turns a read-heavy system into a write-heavy one.</li>
    <li>Justify a non-cached 302 as the default using both the analytics requirement and the revocability requirement, and describe the 301-with-short-private-TTL alternative with its revocation window.</li>
    <li>Walk the six-stage scaling path and name the trigger metric that gates each stage, not just the stage's name.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.rfc-editor.org/rfc/rfc9110.html" rel="noopener noreferrer">RFC 9110: HTTP semantics</a> — 301 and 308 are heuristically cacheable; 302 and 307 carry no such default</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc9111.html" rel="noopener noreferrer">RFC 9111: HTTP caching</a> — how Cache-Control, including private and max-age, overrides the defaults</li>
    <li><a href="https://blog.cloudflare.com/instant-purge/" rel="noopener noreferrer">Cloudflare: instant purge</a> — global purge-by-tag latency of under 150 ms at the median</li>
    <li><a href="https://datatracker.ietf.org/doc/draft-ietf-httpapi-idempotency-key-header/" rel="noopener noreferrer">IETF draft: the Idempotency-Key header</a> — still an Internet-Draft, not an RFC</li>
    <li><a href="https://docs.stripe.com/api/idempotent_requests" rel="noopener noreferrer">Stripe API: idempotent requests</a> — a production example of the idempotency-key pattern used on the create endpoint</li>
    <li><a href="https://openai.com/index/scaling-postgresql/" rel="noopener noreferrer">OpenAI: scaling PostgreSQL</a> — why one relational primary can go far beyond the conservative planning figures used here</li>
  </ul>
  <p class="sub">The bit.ly response headers quoted in this chapter were observed directly in October 2026 and can change at any time. Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" are rules of thumb, not guarantees.</p>
</div>`,
};
