import type { Chapter } from "../types";

export const sysdesCdns: Chapter = {
  id: "sysdes-cdns",
  num: "I2",
  title: "CDNs",
  short: "CDNs",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Move the bytes closer to the user — the cheapest 10x in system design, right up to the moment you cache something personal.",
  body: `<h3>A CDN is a cache you don't operate, sitting where the latency is</h3>
<p>
  You already know caching: put a copy of an expensive result somewhere
  faster than recomputing it. A CDN applies that idea to the one cost you
  cannot optimise away in your own datacentre — <b>the speed of light</b>.
  A round trip from Singapore to us-east-1 is ~180 ms on fibre and no
  amount of Redis fixes it. A CDN is a network of <b>PoPs</b> (points of
  presence — racks of caching proxies in ~100-600 metros depending on the
  vendor) that terminate the user's TCP and TLS locally and serve the
  response from a disk 10 ms away.
</p>
<p>
  Interviewers ask about CDNs because it is the fastest read on whether you
  think about <em>where</em> a system runs, not just what it does — and
  because the follow-up ("what happens when a logged-in user's page gets
  cached?") separates people who have configured a CDN from people who have
  heard of one.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A request from a client reaching a nearby edge point of presence, served from cache in twelve milliseconds on a hit, or forwarded across the ocean to origin adding one hundred and sixty milliseconds on a miss">
    <g class="rough">
      <path class="lng" d="M118,124 L214,124" />
      <path class="ln dash" d="M356,124 L456,124" />
      <path class="lng" d="M214,132 L118,132" />
    </g>
    <g class="rough">
      <rect class="box"  x="18"  y="100" width="100" height="48" rx="6" />
      <rect class="boxy" x="214" y="100" width="142" height="48" rx="6" />
      <rect class="box"  x="456" y="100" width="166" height="48" rx="6" />
    </g>
    <text class="lbl" x="68"  y="129" text-anchor="middle">client</text>
    <text class="lbl" x="285" y="123" text-anchor="middle">edge PoP</text>
    <text class="sm"  x="285" y="141" text-anchor="middle">Singapore</text>
    <text class="lbl" x="539" y="123" text-anchor="middle">origin</text>
    <text class="sm"  x="539" y="141" text-anchor="middle">us-east-1</text>
    <text class="sm gr" x="166" y="110" text-anchor="middle">8 ms RTT</text>
    <text class="sm" x="406" y="112" text-anchor="middle">only on MISS</text>
    <text class="sm" x="406" y="168" text-anchor="middle">+160 ms RTT</text>
    <text class="lbl gr" x="18" y="196" style="font-size:15px">HIT: ~12 ms to first byte — TLS terminated locally, warm connection</text>
    <text class="lbl rd" x="18" y="220" style="font-size:15px">MISS: ~190 ms — and 3 round trips if the origin link is cold</text>
    <text class="sm" x="18" y="240">at 95% hit rate the weighted average is ~21 ms, and origin sees 1/20th the traffic</text>
  </svg>
  <figcaption>The interesting number is not the hit latency, it's the hit <em>rate</em> — everything in this chapter is a lever on that one percentage.</figcaption>
</figure>

<h3>How the request finds the nearest edge: anycast and DNS steering</h3>
<p>
  There are two mechanisms and good candidates name both.
</p>
<ul>
  <li>
    <b>Anycast.</b> The CDN announces the <em>same</em> IP prefix via BGP
    from every PoP. Internet routers each pick the topologically shortest
    path to that prefix, so a packet addressed to 104.16.0.1 lands in
    Frankfurt from Berlin and in São Paulo from Rio, with no application
    logic involved. Failover is a BGP withdrawal: pull the announcement
    from a PoP and traffic re-converges elsewhere in seconds. The catch is
    that anycast is <em>stateless routing</em> — a mid-connection path
    change can land packets at a different PoP, which is why anycast TCP
    needs careful ECMP consistency (in practice all major CDNs solve this).
  </li>
  <li>
    <b>DNS-based steering (unicast).</b> The authoritative DNS server
    returns a different A record per resolver location, using EDNS Client
    Subnet to see the real user prefix rather than the resolver's. More
    control (you can weight by PoP load or cost), but it inherits DNS TTL
    latency: draining a PoP takes as long as the longest cached TTL, so
    these deployments run 20-60 s TTLs and pay the extra lookups.
  </li>
</ul>
<p class="sub">
  Most large CDNs do both: anycast to reach a metro, then internal
  layer-4 load balancing inside the PoP. Say "anycast for the coarse
  routing, DNS or GeoIP steering when I need per-PoP control" and you have
  covered it.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "The edge terminates TLS
  ~8 ms from the user instead of 180 ms away. Even for a full miss that's
  a win, because the handshake round trips happen locally and the edge
  keeps a warm, tuned connection pool to origin — I'm paying one long RTT
  instead of three."
</div>

<h3>Push vs pull: who decides what lives at the edge</h3>
<table>
  <tr><th>&nbsp;</th><th>Pull (origin-pull)</th><th>Push</th></tr>
  <tr><td>Who populates</td><td>First user to request an object; edge fetches and stores it</td><td>You upload objects to the CDN ahead of time, usually in CI</td></tr>
  <tr><td>Cost of a cold object</td><td>One user eats the full origin RTT; N PoPs means up to N cold fetches unless there's a shield tier</td><td>Zero — it's already there</td></tr>
  <tr><td>Storage cost</td><td>Only what's actually requested</td><td>Everything, in every region, whether requested or not</td></tr>
  <tr><td>Operational load</td><td>Near zero — set headers and point DNS at it</td><td>A deploy step that can fail, plus lifecycle management</td></tr>
  <tr><td>Reach for this when</td><td>Almost always. It's self-tuning: popular objects are cached, the long tail isn't</td><td>Large, predictable, launch-critical objects — a game patch, a video catalogue, a Super Bowl ad you cannot afford to miss on</td></tr>
</table>
<p class="sub">
  The honest answer in an interview is "pull, with an origin shield." A
  <b>shield</b> is a designated mid-tier PoP that all other PoPs miss
  through, so a cold object costs one origin fetch globally instead of one
  per PoP. On a 300-PoP network that is the difference between a launch
  and an origin outage.
</p>

<h3>Cache-Control: the directives and what they actually do</h3>
<table>
  <tr><th>Directive</th><th>What it actually does</th><th>The part people get wrong</th></tr>
  <tr><td><code>max-age=N</code></td><td>Fresh for N seconds in <em>any</em> cache, including the browser</td><td>Once sent, you cannot recall it from a browser. Deploying a bad 1-year max-age is unfixable without changing the URL</td></tr>
  <tr><td><code>s-maxage=N</code></td><td>Same, but only for shared caches (CDN, proxy). Overrides max-age there</td><td>The lever you want: <code>max-age=0, s-maxage=600</code> means browsers always revalidate but the CDN absorbs the load</td></tr>
  <tr><td><code>public</code></td><td>Cacheable by shared caches even when the request had an Authorization header</td><td>Setting this on an authenticated endpoint is exactly how personalised pages leak</td></tr>
  <tr><td><code>private</code></td><td>Browser may cache; shared caches must not</td><td>It is not a security control — it's a hint. Don't rely on it for secrets</td></tr>
  <tr><td><code>no-cache</code></td><td>Store it, but revalidate with the origin before every reuse</td><td>Does <em>not</em> mean "don't cache". That's <code>no-store</code>. This is the single most common misreading in the whole spec</td></tr>
  <tr><td><code>no-store</code></td><td>Never write it to disk or memory anywhere</td><td>Correct for account pages and API responses with PII; wasteful everywhere else</td></tr>
  <tr><td><code>must-revalidate</code></td><td>Once stale, you may not serve it — even if the origin is down</td><td>Turns an origin outage into a user-visible outage. Usually you want the opposite</td></tr>
  <tr><td><code>stale-while-revalidate=N</code></td><td>For N seconds past expiry, serve the stale copy <em>immediately</em> and refresh in the background</td><td>The highest-value directive in the table and the most under-used — it decouples freshness from latency</td></tr>
  <tr><td><code>stale-if-error=N</code></td><td>If the origin returns 5xx or times out, keep serving the stale copy for N seconds</td><td>Free availability. Your CDN becomes a static failover for the whole site</td></tr>
  <tr><td><code>immutable</code></td><td>Don't even conditionally revalidate on a user reload</td><td>Only safe with content-hashed filenames. Pair with <code>max-age=31536000</code></td></tr>
  <tr><td><code>Vary: H</code></td><td>Adds request header H to the cache key</td><td><code>Vary: User-Agent</code> shatters your hit rate into thousands of fragments. <code>Vary: Accept-Encoding</code> is fine (3 values)</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The three header sets worth memorising</span>
  <ul style="margin:8px 0 0">
    <li><b>Hashed static asset</b> (<code>/app.9f2c1a.js</code>): <code>Cache-Control: public, max-age=31536000, immutable</code></li>
    <li><b>Shared HTML or a hot read API</b>: <code>Cache-Control: public, max-age=0, s-maxage=60, stale-while-revalidate=600, stale-if-error=86400</code></li>
    <li><b>Anything user-specific</b>: <code>Cache-Control: private, no-store</code> — and check that no CDN rule overrides it</li>
  </ul>
</div>

<h3>ETags and revalidation: paying for freshness in bytes, not seconds</h3>
<p>
  When an object goes stale the edge does not have to re-download it. It
  sends a conditional request — <code>If-None-Match: "9f2c1a"</code> — and
  the origin replies <code>304 Not Modified</code> with an empty body if
  the ETag still matches. You save the payload (often 99% of the bytes)
  but you still pay the full origin round trip, so a 304 costs the same
  <em>latency</em> as a 200. That is precisely the gap
  <code>stale-while-revalidate</code> closes.
</p>
<ul>
  <li>
    <b>Strong ETag</b> — byte-for-byte identity, required for range
    requests and resumable downloads. Usually a content hash.
  </li>
  <li>
    <b>Weak ETag</b> (<code>W/"abc"</code>) — semantically equivalent.
    Right choice when gzip levels or a timestamp comment make bytes differ
    while meaning doesn't.
  </li>
  <li>
    <b>Last-Modified / If-Modified-Since</b> — 1-second granularity, and
    it lies whenever a deploy rewrites files without changing content.
    Prefer ETags; keep Last-Modified as a fallback.
  </li>
</ul>
<div class="warn">
  <span class="ttl">⚠ ETags computed per-server break behind a load balancer</span>
  If your ETag is derived from the file's inode or mtime (nginx's default
  is <code>mtime-size</code>), two app servers holding identical content
  emit different ETags. Every revalidation then misses, the CDN
  re-downloads, and you have quietly built a cache that never hits. Derive
  the ETag from a hash of the content or from the build ID — something all
  replicas agree on.
</div>

<h3>Choosing a TTL: the question is "how stale is tolerable", not "how fresh can I be"</h3>
<table>
  <tr><th>Content</th><th>TTL</th><th>Reasoning</th></tr>
  <tr><td>Hashed JS/CSS/fonts</td><td>1 year, immutable</td><td>The URL changes when the bytes change, so staleness is impossible by construction</td></tr>
  <tr><td>Un-hashed images, PDFs</td><td>1-7 days at the CDN, minutes in the browser</td><td>You can purge the CDN in seconds; you cannot purge browsers</td></tr>
  <tr><td>Marketing / docs HTML</td><td><code>s-maxage=300</code> + <code>swr=86400</code></td><td>Editors expect changes within minutes, not instantly; SWR means nobody ever waits for the refresh</td></tr>
  <tr><td>Product listing / search results</td><td><code>s-maxage=10-60</code> + swr</td><td>60 s of staleness on a catalogue is invisible to users and removes 99% of origin reads on a hot query</td></tr>
  <tr><td>Price, inventory count</td><td><code>s-maxage=0-5</code>, or don't cache</td><td>Wrong price is a business incident. Cache the page shell, fetch the number client-side</td></tr>
  <tr><td>Anything per-user</td><td>no-store at the CDN</td><td>Cache key cardinality equals user count — the hit rate is ~0 even if it were safe</td></tr>
</table>
<p class="sub">
  A useful reframing under pressure: <em>TTL is a budget for how wrong you
  are willing to be, multiplied by how often the data changes.</em> A
  60-second TTL on data that changes hourly is nearly pointless
  conservatism; a 60-second TTL on data that changes every 200 ms is a
  deliberate, correct decision to serve approximate data fast.
</p>

<h3>Cache key design, and the bug that ends careers</h3>
<p>
  The cache key is what the edge hashes to decide "have I seen this
  request before?" By default it is roughly scheme + host + path + full
  query string, plus whatever <code>Vary</code> adds. Two failure modes
  sit on either side of getting it right.
</p>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A cache key built from host, path and sorted query parameters, contrasted with a broken key that omits the session cookie so a logged-in user's personalised page is served to everyone else">
    <g class="rough">
      <rect class="boxg" x="16"  y="46" width="118" height="42" rx="6" />
      <rect class="boxg" x="146" y="46" width="150" height="42" rx="6" />
      <rect class="boxg" x="308" y="46" width="176" height="42" rx="6" />
      <rect class="boxy" x="496" y="46" width="126" height="42" rx="6" />
    </g>
    <text class="sm" x="75"  y="72" text-anchor="middle">shop.example</text>
    <text class="sm" x="221" y="72" text-anchor="middle">/products/list</text>
    <text class="sm" x="396" y="72" text-anchor="middle">?page=2&amp;sort=price</text>
    <text class="sm" x="559" y="66" text-anchor="middle">Vary: Accept-</text>
    <text class="sm" x="559" y="82" text-anchor="middle">Encoding</text>
    <text class="sm" x="16" y="34">cache key =</text>
    <text class="sm gr" x="16" y="112">safe: nothing here identifies a person, so every visitor shares one entry</text>
    <g class="rough">
      <rect class="boxr" x="16"  y="152" width="470" height="46" rx="6" />
      <path class="lnr" d="M500,175 L596,175" />
      <circle class="boxr" cx="612" cy="175" r="16" />
    </g>
    <text class="sm" x="30" y="172">GET /account/orders   Cookie: session=alice…   Set-Cookie in response</text>
    <text class="sm rd" x="30" y="190">cookie NOT in the key, response marked public</text>
    <text class="sm rd" x="16" y="228">Bob requests the same path, hits Alice's cached entry, and reads her order history.</text>
    <text class="sm rd" x="16" y="248">One request poisons the entry for every user in that PoP until the TTL expires.</text>
  </svg>
  <figcaption>The green row is a good key: coarse enough to be shared, precise enough to be correct. The red row is the same bug that has taken down Steam, several banks, and at least one airline.</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ The classic: caching a personalised response</span>
  It needs three things to line up, and they line up depressingly often:
  a response that varies by user, a cache key that ignores the thing
  identifying that user (cookie, Authorization header), and a
  <code>Cache-Control</code> that permits shared caching (or an
  origin that omits the header entirely and lets the CDN apply a default
  TTL). The defence is layered: default to <code>private, no-store</code>
  on every authenticated route; put the CDN in "cache nothing unless the
  origin explicitly opts in" mode; and add a synthetic test that logs in
  as user A, then requests the same URL as user B and asserts the
  response does not contain A's data.
</div>
<p>
  Going the other way, an over-precise key destroys your hit rate. Keys
  should be <b>normalised</b> before hashing:
</p>
<ul>
  <li><b>Sort and allow-list query params.</b> <code>?sort=price&amp;page=2</code> and <code>?page=2&amp;sort=price</code> must hash the same, and tracking params like <code>utm_source</code>, <code>fbclid</code>, <code>gclid</code> must be stripped — otherwise every ad click creates a unique, permanently-cold cache entry.</li>
  <li><b>Never key on the whole Cookie header.</b> Key on a derived value instead: a boolean <code>logged-in</code>, or a plan tier. Two variants, not two million.</li>
  <li><b>Collapse device classes.</b> Bucket User-Agent into <code>mobile|desktop|bot</code> at the edge and vary on that, never on the raw string.</li>
  <li><b>Lowercase the host, drop the default port, canonicalise trailing slashes</b> — free hit-rate.</li>
</ul>

<h3>Invalidation: purge is the fallback, versioned URLs are the design</h3>
<p>
  The strongest thing you can say here is that <em>you avoid invalidation
  rather than optimise it</em>. Content-addressed URLs
  (<code>/static/app.9f2c1a.js</code>, emitted by the bundler) make the
  problem disappear: new bytes get a new URL, the old URL stays valid
  forever, and rollback is just re-pointing the HTML. The HTML itself is
  the only short-TTL object in the system, and it is small.
</p>
<table>
  <tr><th>Mechanism</th><th>Propagation</th><th>Reach for this when</th></tr>
  <tr><td>Versioned / hashed URL</td><td>Instant, by construction</td><td>Default for every build artefact — JS, CSS, images, fonts</td></tr>
  <tr><td>Purge single URL</td><td>Seconds globally</td><td>One asset was published wrong; a legal takedown</td></tr>
  <tr><td>Surrogate-key / cache-tag purge</td><td>~150 ms - a few seconds</td><td>The real tool for dynamic sites: tag every response with the entity IDs it contains (<code>Surrogate-Key: product-42 category-9</code>) and purge by tag when the entity changes. One product edit invalidates exactly the pages that mention it</td></tr>
  <tr><td>Purge everything</td><td>Seconds, then a stampede</td><td>Almost never. Every PoP simultaneously misses, origin takes 20-50x its normal read load, and you find out whether your database was ever really sized for it</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd tag responses with
  surrogate keys for the entities they render, and purge by tag on write.
  That gives me long TTLs — minutes, not seconds — with event-driven
  freshness, so the hit rate stays above 95% and edits still show up
  immediately. Full purges I'd treat as an incident tool, because they
  turn the CDN into an origin stampede."
</div>

<h3>Edge compute: the CDN stops being read-only</h3>
<p>
  Every major CDN now runs your code in the PoP — Cloudflare Workers,
  Lambda@Edge and CloudFront Functions, Fastly Compute — typically a V8
  isolate or WASM sandbox with sub-millisecond cold start and a ~5-50 ms
  CPU budget. That converts several origin round trips into edge-local
  work:
</p>
<ul>
  <li><b>Cache key rewriting.</b> Normalise the query string, bucket the A/B variant, downgrade a cookie to a boolean — the normalisation rules above, implemented rather than configured.</li>
  <li><b>Auth at the edge.</b> Verify a JWT signature locally and reject unauthenticated traffic 170 ms before it would have reached your origin. Revocation still needs an origin check, so keep tokens short-lived.</li>
  <li><b>Personalisation without breaking the cache.</b> Cache one shared, anonymous HTML shell aggressively, then have the Worker stitch in the per-user fragment (name, cart count) from a KV lookup. You get a cacheable page <em>and</em> a personalised one.</li>
  <li><b>Geo / consent routing, redirects, signed URLs, bot scoring</b> — all decisions that only need the request itself.</li>
</ul>
<p class="sub">
  Be honest about the limits: edge runtimes have tight memory, no
  persistent TCP to your primary database (a 180 ms hop back to origin
  eats the entire win), and eventually-consistent edge KV. Edge compute is
  for decisions about the request, not for business logic that needs your
  transactional store.
</p>

<h3>When a CDN is a 10x win, and when it changes nothing</h3>
<table>
  <tr><th>Workload</th><th>Effect</th><th>Why</th></tr>
  <tr><td>Static assets, images, video, downloads</td><td>Enormous</td><td>95-99% offload; origin egress drops 20-50x, and CDN egress is often 5-10x cheaper per GB than cloud egress</td></tr>
  <tr><td>Mostly-anonymous read pages (news, docs, catalogue, marketing)</td><td>Large</td><td>One cached copy serves millions; the long tail is where hit rate goes, so watch p50 not just totals</td></tr>
  <tr><td>Read-heavy public API (prices, timetables, feature flags)</td><td>Real, with 5-60 s TTLs</td><td>The traffic is spiky and repetitive — exactly what a cache is for</td></tr>
  <tr><td>Highly personalised API (<code>/me/feed</code>)</td><td>~Nothing on cacheability</td><td>Key cardinality equals user count. You still get TLS termination and a warm origin connection — worth maybe 30-50% off TTFB, not 10x</td></tr>
  <tr><td>Write-heavy endpoints (checkout, messaging, uploads)</td><td>Nothing, by definition</td><td>POST/PUT/PATCH are never cached. A CDN can still shed abusive traffic and terminate TLS, but it is not a scaling story</td></tr>
  <tr><td>Real-time, sub-second freshness (live trading, presence)</td><td>Nothing, and it can hurt</td><td>Any TTL is too long; caching here converts a latency problem into a correctness problem</td></tr>
</table>
<p class="sub">
  The load-bearing metric in all six rows is the same:
  <b>hit rate</b>. A CDN at 50% hit rate is a rounding error; at 95% it
  removes 20x the load; at 99% it removes 100x. When an interviewer asks
  "how would you know it's working", the answer is hit rate by content
  type and origin egress per user — not "latency looks better."
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "global users", "millions of images", "video streaming", "our site is slow in India", or a read:write ratio quoted above about 20:1. Any of those and the CDN belongs in your first drawing, before you touch the database.</li>
  <li><b>The naive design</b> puts one app tier in one region behind a load balancer and tries to fix the 200 ms of physics with more replicas. Replicas cut queue time; they cannot cut propagation delay.</li>
  <li><b>Distinguishing it from application caching:</b> a CDN caches <em>HTTP responses keyed by URL, near the user</em>; Redis caches <em>arbitrary values keyed by anything, near the service</em>. If the thing you want to reuse isn't addressable by URL, or is per-user, it belongs in Redis — this is a layered-cache question, not an either/or.</li>
  <li><b>Estimate before you commit.</b> 10 M daily users × 2 MB of assets ≈ 20 TB/day. At cloud egress that's roughly $1,800/day; at 95% CDN offload with cheaper per-GB pricing it's a small fraction of that. Cost is a legitimate reason to reach for a CDN and it scores well.</li>
  <li><b>The pitfall to name unprompted:</b> personalised content in a shared cache. Say the words "I'd default authenticated routes to <code>private, no-store</code> and make the CDN opt-in rather than opt-out" and you have pre-empted the follow-up question.</li>
  <li><b>The second pitfall:</b> full purges and cold-start stampedes. If the design has a global purge in it, pair it with a shield tier or staggered TTLs, or say out loud that the origin must be sized for the miss storm.</li>
</ul>`,
};
