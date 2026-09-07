import type { Chapter } from "../types";

export const sysdesRateLimiting: Chapter = {
  id: "sysdes-rate-limiting",
  num: "I5",
  title: "Rate limiting & throttling",
  short: "Rate limiting & throttling",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "The only thing standing between one badly-behaved client and everybody else's latency.",
  body: `<h3>Four reasons to rate limit, and they need different limits</h3>
<p>
  A rate limiter answers "may this request proceed right now?" in a few
  microseconds, before any expensive work happens. It looks like a small
  component and it is one of the highest-leverage ones in a design,
  because it is the only mechanism that lets a system <em>choose</em> what
  to drop instead of failing at random.
</p>
<ul>
  <li><b>Abuse and security.</b> Credential stuffing, scraping, enumeration. 5 login attempts per account per 15 minutes turns an online brute force from hours into centuries.</li>
  <li><b>Fairness / multi-tenancy.</b> One customer's runaway integration script must not consume the capacity everyone else paid for. This is the noisy-neighbour problem, and the limiter is the fix.</li>
  <li><b>Cost control.</b> When a request costs real money downstream — an LLM call, an SMS, a third-party API billed per call — the limiter is a spend cap that works in real time rather than on the invoice.</li>
  <li><b>Cascading-failure protection.</b> The subtle one. When a dependency slows down, in-flight requests pile up, threads and connections are exhausted, and a slow dependency becomes a total outage. A limiter bounds concurrency so the system sheds load at the edge instead of dying in the middle. It is the same family as circuit breakers and bulkheads: <em>controlled</em> failure beats uncontrolled.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "I want three limiter layers,
  not one: a coarse per-IP limit at the edge to absorb volumetric abuse, a
  per-API-key quota at the gateway for fairness and billing, and a
  per-endpoint concurrency limit at the service so an expensive route
  can't exhaust the pool the cheap routes share."
</div>

<h3>Fixed window: the simplest one, and the burst it lets through</h3>
<p>
  Keep a counter per key per wall-clock window: <code>INCR user:42:1m</code>
  with a TTL. Increment, compare to the limit, reject above it. One integer
  per active key, O(1), trivially correct-looking.
</p>
<p>
  The flaw is at the boundary. With a limit of 100 per minute, a client
  sends 100 requests at 11:00:59 and 100 more at 11:01:00 — both windows
  are individually legal, and your service just took <b>200 requests in
  one second</b>. Any fixed-window limiter permits a 2x burst across the
  boundary, and burst is precisely what you were trying to prevent. It also
  synchronises clients: everyone whose quota resets on the minute retries
  at the same instant.
</p>

<h3>Sliding window log: exact, and priced accordingly</h3>
<p>
  Store the timestamp of every request in a sorted set per key. On each
  request, drop entries older than the window, count what's left, and admit
  if the count is under the limit. In Redis that is
  <code>ZREMRANGEBYSCORE</code> + <code>ZCARD</code> + <code>ZADD</code> in
  one Lua script.
</p>
<p>
  It is perfectly accurate — no boundary artefact, no approximation. It is
  also the only algorithm here whose memory scales with your
  <em>limit</em>: 16-24 bytes per retained timestamp. At 5,000 requests per
  hour per key and 1 million active keys, that's roughly
  <b>100 GB of Redis</b>, versus ~16 MB for a counter-based approach. Use
  it where the limit is small and precision matters — login attempts, OTP
  sends, password resets — and nowhere else.
</p>

<h3>Sliding window counter: the practical default</h3>
<p>
  Keep two counters, the current window and the previous one, and weight
  the previous by how much of it still overlaps the trailing window. It
  costs two integers per key, has no boundary burst, and its error is
  bounded and small — it slightly over-counts when traffic is bursty and
  slightly under-counts when it's idle, on the assumption that the previous
  window's requests were uniformly distributed.
</p>
<pre><code><span class="c">// state per key: { windowStart, count, prevCount } — two integers plus a boundary</span>
function allow(state, now, limit, windowMs) {
  const windowStart = Math.floor(now / windowMs) * windowMs;

  if (windowStart !== state.windowStart) {
    <span class="c">// rolled into a new window. Only carry the count forward if the</span>
    <span class="c">// previous window is literally the one before this — after a gap, it's stale.</span>
    state.prevCount = windowStart - state.windowStart === windowMs ? state.count : 0;
    state.windowStart = windowStart;
    state.count = 0;
  }

  const elapsed = (now - windowStart) / windowMs;      <span class="c">// 0…1 through the current window</span>
  const estimate = state.prevCount * (1 - elapsed) + state.count;

  if (estimate &gt;= limit) return false;
  state.count += 1;
  return true;
}</code></pre>
<p class="sub">
  Worked example at 100/minute: the client uses its full 100 in window 1.
  One second into window 2, <code>elapsed = 0.017</code>, so the estimate
  is <code>100 × 0.983 = 98.3</code> — only 2 requests get through, instead
  of the 100 a fixed window would have allowed. Halfway through window 2
  the previous window is weighted at 0.5, so 50 more are admitted. The
  boundary burst is gone for the cost of one extra integer.
</p>
<div class="warn">
  <span class="ttl">⚠ The stale-previous-window bug</span>
  If you carry <code>prevCount</code> forward without checking that the
  previous window is <em>adjacent</em>, a key that goes quiet for an hour
  comes back still weighted by hour-old traffic and gets throttled for no
  reason. The <code>windowStart - state.windowStart === windowMs</code>
  guard is not defensive padding — it's the difference between a limiter
  and a random rejection generator for low-traffic keys.
</div>

<h3>Token bucket: the one to reach for when bursts are legitimate</h3>
<p>
  A bucket holds up to <b>B</b> tokens and refills at <b>r</b> tokens per
  second. Each request removes tokens (usually one; expensive endpoints can
  charge more). Empty bucket means reject. That single structure encodes
  two independent knobs that every other algorithm conflates: the
  <em>sustained rate</em> is r, and the <em>burst tolerance</em> is B.
</p>

<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="A token bucket refilling at five tokens per second up to a capacity of ten, with requests consuming one token each, allowed requests served and requests arriving at an empty bucket rejected with a four twenty nine">
    <g class="rough">
      <path class="lng" d="M302,22 L302,66" />
      <path class="lnr" d="M394,84 L470,52" />
      <path class="ln"  d="M118,138 L212,138" />
      <path class="lng" d="M392,120 L498,102" />
      <path class="lnr" d="M392,166 L498,196" />
    </g>
    <g class="rough">
      <rect class="box"  x="212" y="66"  width="180" height="140" rx="8" />
      <rect class="box"  x="16"  y="116" width="102" height="44" rx="6" />
      <rect class="boxg" x="498" y="80"  width="124" height="44" rx="6" />
      <rect class="boxr" x="498" y="176" width="124" height="44" rx="6" />
      <circle class="boxg" cx="248" cy="184" r="12" />
      <circle class="boxg" cx="278" cy="184" r="12" />
      <circle class="boxg" cx="308" cy="184" r="12" />
      <circle class="boxg" cx="338" cy="184" r="12" />
      <circle class="boxg" cx="368" cy="184" r="12" />
      <circle class="boxg" cx="248" cy="156" r="12" />
      <circle class="boxg" cx="278" cy="156" r="12" />
      <circle class="boxg" cx="308" cy="156" r="12" />
    </g>
    <text class="sm gr" x="316" y="18">refill r = 5 tokens/sec, continuously</text>
    <text class="sm" x="67"  y="134" text-anchor="middle">requests</text>
    <text class="sm" x="67"  y="150" text-anchor="middle">cost 1 each</text>
    <text class="sm" x="302" y="100" text-anchor="middle">capacity B = 10</text>
    <text class="sm" x="302" y="120" text-anchor="middle">8 tokens available</text>
    <text class="sm rd" x="478" y="44">overflow discarded at B</text>
    <text class="sm gr" x="560" y="107" text-anchor="middle">served</text>
    <text class="sm rd" x="560" y="203" text-anchor="middle">429 + Retry-After</text>
    <text class="lbl" x="16" y="248" style="font-size:15px">B sets how big a burst you forgive; r sets the rate you can actually sustain.</text>
    <text class="sm" x="16" y="268">An idle client banks up to 10 requests it may fire instantly — usually exactly what you want.</text>
  </svg>
  <figcaption>The two knobs are independent, which is why token bucket is the default in production gateways: you tune burst without touching throughput.</figcaption>
</figure>

<pre><code>class TokenBucket {
  constructor(capacity, refillPerSec) {
    this.capacity = capacity;
    this.refillPerSec = refillPerSec;
    this.tokens = capacity;
    this.updatedAt = Date.now();
  }

  <span class="c">// Lazy refill: no timers. Compute how many tokens accrued since last touch.</span>
  <span class="c">// This is what makes the whole thing O(1) memory and O(1) time per key.</span>
  take(cost = 1, now = Date.now()) {
    const elapsedSec = Math.max(0, now - this.updatedAt) / 1000;
    this.tokens = Math.min(this.capacity, this.tokens + elapsedSec * this.refillPerSec);
    this.updatedAt = now;

    if (this.tokens &gt;= cost) {
      this.tokens -= cost;
      return { allowed: true, remaining: Math.floor(this.tokens), retryAfter: 0 };
    }
    <span class="c">// Tell the client exactly how long until it can succeed — this is what</span>
    <span class="c">// turns a 429 into cooperation instead of a retry storm.</span>
    const deficit = cost - this.tokens;
    return { allowed: false, remaining: 0, retryAfter: Math.ceil(deficit / this.refillPerSec) };
  }
}</code></pre>
<p class="sub">
  Two details that read as experience. <b>Lazy refill</b> — deriving tokens
  from elapsed time on access rather than running a timer — means a million
  idle keys cost nothing but their last-touched timestamp. And
  <b>variable cost</b> means one limiter can express "a search costs 1, a
  bulk export costs 50", which is how you protect a database from an
  endpoint that is 50x more expensive without inventing a second limiter.
</p>

<h3>Picking one</h3>
<table>
  <tr><th>Algorithm</th><th>Memory per key</th><th>Accuracy</th><th>Bursts</th><th>Reach for this when</th></tr>
  <tr><td>Fixed window</td><td>1 counter</td><td>Poor — up to 2x the limit at the boundary</td><td>Uncontrolled at boundaries</td><td>Rough abuse protection where a 2x overshoot is harmless, or you need the absolute simplest thing (one Redis INCR)</td></tr>
  <tr><td>Sliding window log</td><td>O(limit) timestamps, ~16-24 B each</td><td>Exact</td><td>Fully prevented</td><td>Small limits where precision is a security property: 5 logins / 15 min, 3 OTPs / hour</td></tr>
  <tr><td>Sliding window counter</td><td>2 counters</td><td>Small bounded error (assumes uniform prior window)</td><td>Effectively prevented</td><td>The general-purpose default for user-facing API quotas at scale</td></tr>
  <tr><td>Token bucket</td><td>2 numbers (tokens + timestamp)</td><td>Exact w.r.t. its own definition</td><td><em>Allows</em> them, up to B — deliberately</td><td>APIs where clients legitimately batch; anywhere you want burst and rate as separate knobs; variable-cost endpoints</td></tr>
  <tr><td>Leaky bucket (queue)</td><td>Queue of pending requests</td><td>Exact output rate</td><td>Smoothed, not rejected</td><td>Shaping traffic <em>towards</em> a fragile downstream — it queues and paces rather than rejecting, at the cost of added latency</td></tr>
</table>

<h3>Where the limiter lives</h3>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A request passing through three limiter layers: a per-IP limit at the CDN edge, a per-API-key quota at the gateway backed by shared Redis, and a per-tenant concurrency limit inside the service">
    <g class="rough">
      <path class="ln" d="M112,74 L156,74" />
      <path class="ln" d="M282,74 L326,74" />
      <path class="ln" d="M452,74 L496,74" />
      <path class="ln dash" d="M384,102 L384,168" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="52"  width="96"  height="44" rx="6" />
      <rect class="boxy" x="156" y="52"  width="126" height="44" rx="6" />
      <rect class="boxy" x="326" y="52"  width="126" height="44" rx="6" />
      <rect class="boxg" x="496" y="52"  width="126" height="44" rx="6" />
      <rect class="box"  x="318" y="168" width="142" height="46" rx="6" />
    </g>
    <text class="sm" x="64"  y="79"  text-anchor="middle">client</text>
    <text class="sm" x="219" y="72"  text-anchor="middle">edge / CDN</text>
    <text class="sm" x="219" y="88"  text-anchor="middle">per-IP, coarse</text>
    <text class="sm" x="389" y="72"  text-anchor="middle">API gateway</text>
    <text class="sm" x="389" y="88"  text-anchor="middle">per-API-key</text>
    <text class="sm" x="559" y="72"  text-anchor="middle">service</text>
    <text class="sm" x="559" y="88"  text-anchor="middle">per-tenant cost</text>
    <text class="sm" x="389" y="188" text-anchor="middle">shared Redis</text>
    <text class="sm" x="389" y="204" text-anchor="middle">counters, ~0.4 ms</text>
    <text class="sm" x="16" y="140">cheapest place to drop a packet is the furthest one from your database —</text>
    <text class="sm" x="16" y="158">but only the innermost layer knows what the request actually costs.</text>
    <text class="sm rd" x="16" y="240">each layer rejects a different attacker: volumetric abuse, quota overrun, and expensive-query exhaustion</text>
  </svg>
  <figcaption>These are complementary, not alternatives. Dropping at the edge is 1000x cheaper; only the service knows that this particular query will scan 40 million rows.</figcaption>
</figure>

<h3>The distributed problem: one limit, many nodes</h3>
<p>
  A limiter is trivial on one box and interesting on fifty, because the
  counter is shared mutable state on the hot path of every request. Three
  approaches, and the tradeoff between them is the actual interview
  question.
</p>
<table>
  <tr><th>Approach</th><th>Accuracy</th><th>Added latency</th><th>Failure mode</th></tr>
  <tr><td><b>Central Redis</b> — every node does an atomic INCR or Lua script</td><td>Exact (single serialisation point)</td><td>~0.3-1 ms same-AZ, 1-2 ms cross-AZ, on <em>every</em> request</td><td>Redis is now on the critical path for 100% of traffic. Needs a fail-open policy and replication</td></tr>
  <tr><td><b>Local buckets, limit/N per node</b></td><td>Poor under uneven load — a node with 3x traffic throttles at a third of the intended rate while others sit idle</td><td>Zero</td><td>Degrades quietly; gets worse as N grows and during deploys when N changes</td></tr>
  <tr><td><b>Local buckets + async reconciliation</b> (gossip, or periodic flush to Redis every 100-500 ms)</td><td>Approximate: overshoot bounded by (nodes × per-node drift) per sync interval</td><td>Zero on the request path</td><td>Overshoot spikes during a sync outage, but the limiter keeps working — this is the design most large gateways actually run</td></tr>
  </table>
<p>
  If you do go to Redis, the operation must be <b>atomic</b>. This is wrong:
</p>
<pre><code>const n = await redis.incr(key);
if (n === 1) await redis.expire(key, 60); <span class="c">// crash between these two and the key never expires</span></code></pre>
<p>
  A key that never expires is a key whose counter never resets — the user
  is banned forever. Do the whole read-modify-write in one round trip with
  a Lua script (Redis executes it atomically), which also collapses two
  RTTs into one:
</p>
<pre><code><span class="c">-- KEYS[1] = bucket key, ARGV = now_ms, refill_per_sec, capacity, cost</span>
<span class="c">-- Returns {allowed, tokens_remaining}. One round trip, atomic, no race.</span>
local st   = redis.call('HMGET', KEYS[1], 'tokens', 'ts')
local now  = tonumber(ARGV[1])
local rate = tonumber(ARGV[2])
local cap  = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])

local tokens = tonumber(st[1]) or cap
local ts     = tonumber(st[2]) or now
tokens = math.min(cap, tokens + ((now - ts) / 1000) * rate)

local allowed = 0
if tokens &gt;= cost then tokens = tokens - cost; allowed = 1 end

redis.call('HMSET', KEYS[1], 'tokens', tokens, 'ts', now)
redis.call('PEXPIRE', KEYS[1], math.ceil((cap / rate) * 1000) + 1000)
return { allowed, tokens }</code></pre>
<div class="warn">
  <span class="ttl">⚠ Decide fail-open vs fail-closed <em>before</em> Redis goes down</span>
  When the limiter's datastore is unreachable, do you admit everything or
  reject everything? Fail-closed on a public API means a Redis blip is a
  full outage. Fail-open means an attacker who can degrade Redis gets
  unlimited access. The usual answer is <b>fail open to a conservative
  local bucket</b>: keep an in-process token bucket sized generously per
  node as a backstop, so you lose precision rather than protection. Say
  this unprompted — it is the difference between having designed a limiter
  and having read about one.
</div>

<h3>Choosing the key</h3>
<table>
  <tr><th>Key</th><th>Good for</th><th>Breaks on</th></tr>
  <tr><td>Per authenticated user / API key</td><td>Fairness, billing tiers, abuse attribution. The default whenever identity exists</td><td>Nothing much — but it can't protect the login endpoint, where there is no identity yet</td></tr>
  <tr><td>Per IP</td><td>Unauthenticated traffic: signup, login, password reset, public reads</td><td>Corporate and mobile-carrier NAT put thousands of users behind one IP; IPv6 makes addresses nearly free for attackers (limit on the /64 prefix, not the address); proxies require trusting a forwarded header you must validate</td></tr>
  <tr><td>Per endpoint</td><td>Protecting one expensive route without throttling cheap ones — or, better, one limiter with per-route token costs</td><td>Attackers spreading load across many cheap endpoints; you still want a global per-user cap above it</td></tr>
  <tr><td>Composite (user + endpoint)</td><td>Real APIs: 1000 reads/min and 10 exports/hour for the same user</td><td>Key cardinality — users × endpoints entries in Redis. Fine at millions, plan for it</td></tr>
  <tr><td>Per account / tenant, above per-user</td><td>B2B, where one organisation's 500 seats shouldn't collectively exhaust the platform</td><td>Needs hierarchical limits: check user, then tenant, then global — and charge tokens at every level</td></tr>
</table>
<p class="sub">
  Layer them rather than agonising over one. Per-IP at the edge catches the
  botnet; per-user at the gateway catches the runaway script; per-tenant
  catches the enterprise customer whose backfill job just woke up.
</p>

<h3>What you return, and how a good client behaves</h3>
<p>
  A rejection is an API response, and its quality determines whether
  clients back off or hammer you harder.
</p>
<ul>
  <li><b>429 Too Many Requests</b> for a client exceeding its quota. Use <b>503 with Retry-After</b> for server-side overload shedding — the distinction tells the client whether the problem is theirs or yours.</li>
  <li><b>Retry-After: 12</b> (seconds, or an HTTP date). The single most valuable header: it converts guesswork into a schedule. Compute it from the limiter itself, as the token-bucket code above does.</li>
  <li><b>Standard quota headers on <em>every</em> response, not just rejections</b> — <code>RateLimit-Limit</code>, <code>RateLimit-Remaining</code>, <code>RateLimit-Reset</code>. A well-behaved client slows down before it gets rejected, which is strictly better for both sides.</li>
  <li><b>Never 200 with an error body.</b> Clients and their HTTP libraries key retry behaviour off the status code.</li>
</ul>
<p>
  On the client side, plain exponential backoff is not enough: every
  client throttled at the same moment retries at the same moment, and the
  recovering service is knocked over by the herd it just created. You need
  <b>jitter</b>.
</p>
<pre><code><span class="c">// "Full jitter": pick uniformly in [0, ceiling) rather than backing off to a fixed point.</span>
<span class="c">// Ceilings here: 200, 400, 800, 1600, 3200, 6400, 12800, 20000 ms (capped).</span>
function backoffDelay(attempt, baseMs = 200, capMs = 20000) {
  const ceiling = Math.min(capMs, baseMs * 2 ** attempt);
  return Math.floor(Math.random() * ceiling);
}

async function callWithRetry(fn, maxAttempts = 6) {
  for (let attempt = 0; ; attempt++) {
    const res = await fn();
    if (res.status !== 429 && res.status &lt; 500) return res;
    if (attempt &gt;= maxAttempts - 1) return res;

    <span class="c">// Trust the server's own estimate when it gives one — it knows the refill rate.</span>
    const hinted = Number(res.headers.get("retry-after")) * 1000;
    const delay = Number.isFinite(hinted) && hinted &gt; 0 ? hinted : backoffDelay(attempt);
    await new Promise((r) =&gt; setTimeout(r, delay));
  }
}</code></pre>
<p class="sub">
  Two things this snippet gets right that most don't: it prefers the
  server's <code>Retry-After</code> over its own guess, and it caps the
  attempt count. Unbounded retries against a struggling service are an
  outage amplifier — the client's retry budget is part of the server's
  capacity planning, which is why mature systems also implement a
  <b>circuit breaker</b> that stops calling entirely after a failure
  threshold. Even with a server hint, add a small random offset if
  thousands of clients share the same reset instant.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "public API", "prevent abuse", "free tier vs paid tier", "one customer is affecting others", "we got scraped", or any endpoint whose cost per call is measured in dollars. Also any design with a fan-out to a fragile third party.</li>
  <li><b>The naive design</b> puts a counter in each app server's memory and calls it done — which silently means N times the intended limit, and resets on every deploy.</li>
  <li><b>Pick the algorithm from the traffic shape.</b> Clients that legitimately batch → token bucket, so burst and rate are separate knobs. Smooth user-facing quotas → sliding window counter. Security-critical small limits → sliding window log, because exactness is the point and the memory cost is trivial at 5 events.</li>
  <li><b>Distinguishing it from load shedding and circuit breaking:</b> rate limiting is about <em>who</em> gets to use capacity (fairness, per-key, mostly static); load shedding is about <em>whether there is any capacity right now</em> (health-based, global, dynamic); a circuit breaker is a <em>client-side</em> decision to stop calling a failing dependency. Real systems have all three and an interviewer will be pleased if you separate them.</li>
  <li><b>Always state the distributed answer.</b> "Counters in Redis with a Lua script for atomicity, roughly half a millisecond added per request, fail open to a local bucket if Redis is unreachable" is the whole answer in one sentence.</li>
  <li><b>The pitfall to avoid:</b> returning a bare 429 with no <code>Retry-After</code>. You have told a thousand clients to retry immediately and simultaneously, which is how a rate limiter causes the outage it exists to prevent.</li>
</ul>`,
};
