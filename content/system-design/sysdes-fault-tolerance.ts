import type { Chapter } from "../types";

export const sysdesFaultTolerance: Chapter = {
  id: "sysdes-fault-tolerance",
  num: "A8",
  title: "Designing for fault tolerance",
  short: "Fault tolerance",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    'At scale something is always broken — the design question is never "will it fail" but "what happens to everything else when it does".',
  body: `<h3>Failure is the steady state, not the exception</h3>
<p>
  In a 10,000-server fleet with a two-year mean time between failures, you
  lose roughly 14 machines every day. Disk annualised failure rates of 1–2%
  mean 100–200 dead drives a year per 10,000. Add rack power events, kernel
  panics, bad deploys, expired certificates, and a dependency's dependency
  having a bad afternoon — and there is no hour in which everything is
  healthy. Fault tolerance is not a hardening pass at the end; it is the
  shape of the design.
</p>
<p>
  The arithmetic that motivates all of it: <b>serial dependencies
  multiply.</b> A service that must call ten dependencies, each independently
  available 99.9% of the time, is available 0.999<sup>10</sup> ≈ 99.0% — about
  7 hours of downtime a month, built entirely out of "reliable" components.
  You get availability back only by making dependencies optional, redundant,
  or bounded.
</p>
<table>
  <tr><th>Availability</th><th>Downtime / month</th><th>What it takes</th></tr>
  <tr><td>99% ("two nines")</td><td>7.2 hours</td><td>One box, one region, a human on call.</td></tr>
  <tr><td>99.9%</td><td>43 minutes</td><td>Redundancy within a region, health checks, automated failover.</td></tr>
  <tr><td>99.99%</td><td>4.3 minutes</td><td>Multi-AZ with no shared single point of failure and automated rollback — no human is fast enough to be in the loop.</td></tr>
  <tr><td>99.999%</td><td>26 seconds</td><td>Cell isolation, deploy and config safety, and a genuine willingness to degrade rather than fail; usually multi-region. Very expensive; make sure the prompt actually asks for it.</td></tr>
</table>
<p class="sub">
  Planning figure: one well-run region with multi-AZ lands somewhere around
  99.95–99.99%, depending on what it shares (a single database, a control
  plane, a config pipeline). Multi-region active-active can exceed that but
  costs far more, and many outages are caused by a bad deploy or config push,
  which a second region simply receives too.
</p>

<h3>Timeouts: no timeout is a bug</h3>
<p>
  Every network call must have a deadline. Without one, a hung dependency is
  converted into thread, connection, and memory exhaustion in <em>your</em>
  process — you die of someone else's slowness. The defaults are not on your
  side: many HTTP clients ship with no socket read timeout at all and fall
  back to OS-level TCP behaviour. On Linux that means a blocked read on a
  silent connection can wait indefinitely unless keepalive is on, and
  keepalive does not even start probing until the connection has been idle
  for 2 hours (the 7,200 s default). If the peer vanishes while you have
  unacknowledged data in flight, the kernel retransmits for about 15 minutes
  (<code>tcp_retries2</code> = 15, roughly 925 s) before giving up. Either way
  your thread is parked far longer than any user will wait.
</p>
<ul>
  <li><b>Set the timeout from the dependency's healthy p99.9, not from a round number.</b> If a call normally takes 20 ms at p99.9, a 30-second timeout is not a safety margin — it is 1,500× the useful waiting time, and it guarantees you hold resources for half a minute per hung request.</li>
  <li><b>Propagate deadlines, don't restart them.</b> Five hops each with a fresh 1-second timeout can burn 5 seconds while the user gave up at 2. Pass the remaining budget down (gRPC deadlines, an <code>x-request-deadline</code> header) and have each hop subtract its own elapsed time. If the remaining budget is already less than the dependency's p50, fail immediately rather than starting work that cannot finish.</li>
  <li><b>Separate connect, read, and total timeouts.</b> A connect timeout should be tight (a few hundred ms: a handshake to a healthy host in the same region takes about one round trip, and under SYN-queue pressure a lost SYN is only retried by the kernel after about 1 s, then 3 s, so waiting longer just means waiting for a host that is not coming back — fail over to another instance instead); a read timeout tracks the work; a total timeout caps the whole thing including retries.</li>
  <li><b>A timeout is not an error you understand.</b> A timed-out write may still have committed. This is why the next two sections — retries and idempotency — are inseparable.</li>
</ul>

<h3>Retries, backoff, jitter — and how naive retries kill you</h3>
<p>
  Retrying a transient failure is obviously correct and quietly one of the
  most dangerous things in distributed systems, because retries add load
  exactly when the system has the least capacity.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A request chain where each of three layers makes up to three attempts per call, multiplying one user request into twenty seven requests at the database that is already overloaded">
    <g class="rough">
      <path class="ln"  d="M110,92 L145,92" />
      <path class="lnr" d="M240,92 L280,92" />
      <path class="lnr" d="M375,92 L415,92" />
      <path class="lnr" d="M510,92 L550,92" />
    </g>
    <g class="rough">
      <rect class="box"  x="20"  y="70" width="90" height="44" rx="6" />
      <rect class="boxy" x="145" y="70" width="95" height="44" rx="6" />
      <rect class="boxr" x="280" y="70" width="95" height="44" rx="6" />
      <rect class="boxr" x="415" y="70" width="95" height="44" rx="6" />
      <rect class="boxr" x="550" y="70" width="75" height="44" rx="6" />
    </g>
    <text class="lbl" x="65"  y="98" text-anchor="middle">clients</text>
    <text class="sm"  x="192" y="98" text-anchor="middle">edge</text>
    <text class="sm"  x="327" y="98" text-anchor="middle">service A</text>
    <text class="sm"  x="462" y="98" text-anchor="middle">service B</text>
    <text class="sm"  x="587" y="98" text-anchor="middle">DB</text>
    <text class="sm"    x="127" y="60" text-anchor="middle">1×</text>
    <text class="sm rd" x="260" y="60" text-anchor="middle">3×</text>
    <text class="sm rd" x="395" y="60" text-anchor="middle">9×</text>
    <text class="sm rd" x="530" y="60" text-anchor="middle">27×</text>
    <text class="lbl rd" x="20" y="150">3 attempts per layer (2 retries) x 3 layers = 27x at the tier already failing</text>
    <text class="sm" x="20" y="178">the DB now has to serve 27 requests to satisfy one user, so it gets slower,</text>
    <text class="sm" x="20" y="196">so more calls time out, so more retries fire — the failure sustains itself</text>
    <text class="sm gr" x="20" y="226">fix: retry at ONE layer only, cap retries to ~10% of successes with a token-bucket budget</text>
  </svg>
  <figcaption>Retry amplification is multiplicative across layers, which is why a retry policy is an architectural decision and not a client-library default. Count attempts, not retries: the Google SRE book's example of 3 <em>retries</em> per layer is 4 attempts, and 4<sup>3</sup> = 64x.</figcaption>
</figure>
<p>
  <b>Exponential backoff</b> spaces attempts as base × 2<sup>n</sup> up to a
  cap. <b>Jitter</b> is what stops every client from retrying in
  synchronised waves — without it, a blip trains all your clients onto the
  same clock and you get a self-inflicted DDoS every 2, 4, 8 seconds. Full
  jitter is the standard choice and is a one-liner:
</p>
<pre><code><span class="c">// "Full jitter": sleep uniformly in [0, capped backoff). AWS-recommended.</span>
function delayMs(attempt, base = 100, cap = 20000) {
  const window = Math.min(cap, base * 2 ** attempt);
  return Math.random() * window; <span class="c">// spreads a retry wave across the whole window</span>
}

async function callWithRetry(fn, { attempts = 3, budget } = {}) {
  for (let i = 0; i &lt; attempts; i++) {
    try {
      return await fn();
    } catch (err) {
      if (!isRetryable(err)) throw err;        <span class="c">// 400s, validation, auth: never retry</span>
      if (i === attempts - 1) throw err;
      if (budget &amp;&amp; !budget.tryConsume()) throw err; <span class="c">// token bucket: retries capped at ~10% of traffic</span>
      await sleep(delayMs(i));
    }
  }
}</code></pre>
<p>
  Three rules that matter more than the backoff formula. <b>Retry only what
  is retryable</b> — a 400, a validation failure, or an auth error will fail
  identically every time and burning three attempts on it just adds
  latency. <b>Retry at one layer only</b>: AWS's guidance is to retry "at a
  single point in the stack", and every other layer fails fast and passes
  the error up. Retrying next to the failing dependency redoes the least
  work; retrying at the edge is simplest when the whole operation is
  idempotent. Either is defensible — the rule is to pick one and say which.
  And <b>enforce a retry budget</b>: a token bucket that allows retries to be
  only a fraction of successful requests. The numbers differ by system: the
  Google SRE book uses a per-client budget of 10% (plus at most three
  attempts per request), gRPC's retry-throttling example uses a token ratio
  of 0.1, Envoy's retry budget defaults to 20%, and Finagle's to 20% plus
  10 retries a second. When the dependency is fully down, a budget makes
  retries stop automatically.
</p>
<div class="sticky mint">
  <span class="ttl">Metastable failure — the concept that reads as staff-level</span>
  The term comes from Bronson et al., "Metastable Failures in Distributed
  Systems" (HotOS 2021). Some systems have <b>two</b> stable states: healthy, and an overloaded
  state that <em>sustains itself after the original trigger is gone</em>,
  because the load amplification (retries, cache misses, growing queues) has
  become the cause. The canonical case: a cache tier restarts, every request
  misses, the database saturates, calls time out, clients retry, and the
  database can now never get far enough ahead to let the cache repopulate —
  restoring capacity does not help, because the system is stable where it
  is. The only exits are to <b>remove load</b> below the normal level (shed
  traffic, drain queues, disable retries) and then ramp back up, or to warm
  the cache offline before reopening the gate. If you design a retry policy
  without asking "could this system get stuck in a bad stable state", you
  have not finished.
</div>

<h3>Circuit breakers</h3>
<p>
  Once a dependency is clearly down, continuing to call it is pure harm: you
  burn your own threads waiting for timeouts, and you keep hammering
  something that needs quiet to recover. A circuit breaker is a small state
  machine on the <em>caller</em> side, one per dependency, that converts slow
  failures into instant ones.
</p>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="The three state machine of a circuit breaker: closed transitions to open when the failure rate exceeds a threshold, open transitions to half open after a cooldown, and half open returns to closed on a successful probe or back to open on a failed probe">
    <g class="rough">
      <path class="lnr" d="M178,70 L452,70" />
      <path class="ln"  d="M478,122 L362,176" />
      <path class="lng" d="M270,182 L166,122" />
      <path class="lnr dash" d="M366,244 Q510,256 528,128" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="130" cy="80"  r="48" />
      <circle class="boxr" cx="500" cy="80"  r="48" />
      <circle class="boxy" cx="315" cy="210" r="52" />
    </g>
    <text class="lbl" x="130" y="86"  text-anchor="middle">CLOSED</text>
    <text class="lbl" x="500" y="86"  text-anchor="middle">OPEN</text>
    <text class="lbl" x="315" y="216" text-anchor="middle">HALF-OPEN</text>
    <text class="sm rd" x="315" y="52" text-anchor="middle">failure rate &gt; 50% over a rolling window (min 20 calls)</text>
    <text class="sm" x="480" y="152" text-anchor="end">after a cooldown</text>
    <text class="sm" x="480" y="170" text-anchor="end">(e.g. 5–30 s)</text>
    <text class="sm gr" x="150" y="160" text-anchor="middle">probe calls succeed</text>
    <text class="sm rd" x="420" y="272" text-anchor="middle">probe fails → straight back to OPEN</text>
    <text class="sm" x="20" y="26">CLOSED: calls pass through, failures counted</text>
    <text class="sm rd" x="590" y="26" text-anchor="end">OPEN: fail instantly, no thread held</text>
  </svg>
  <figcaption>The half-open state must admit only a small, hard-capped number of probe calls (the dry run below uses one) — reopening the gate to full traffic is how a recovering dependency gets knocked straight back down.</figcaption>
</figure>
<p>
  The thresholds drawn here (50% errors, a minimum of 20 calls, a 10-second
  window, a 5-second cooldown) are the defaults of Netflix Hystrix, which has
  been in maintenance mode since 2018. Its recommended successor,
  Resilience4j, defaults differently: a 100-call window with a minimum of
  100 calls, a 60-second wait in the open state, and 10 permitted calls in
  half-open. Treat all of these as starting points to tune per dependency,
  not as constants.
</p>
<table>
  <tr><th>State</th><th>Behaviour</th><th>Typical setting</th></tr>
  <tr><td><b>Closed</b></td><td>Calls pass through; outcomes recorded in a rolling window.</td><td>Hystrix-style: trip at &gt;50% errors over 10 s, with a minimum of ~20 calls so a single failure on a quiet endpoint doesn't trip it.</td></tr>
  <tr><td><b>Open</b></td><td>Calls fail immediately without touching the network. Return the fallback (cached value, default, partial response) — this is where degradation is wired in.</td><td>Cooldown of 5–60 s (Hystrix 5 s, Resilience4j 60 s). Fast failure is the whole point: you free the thread instead of parking it for the timeout.</td></tr>
  <tr><td><b>Half-open</b></td><td>Admit a small, capped number of trial calls. Success closes the breaker; failure reopens it and restarts the cooldown.</td><td>Hystrix lets one trial call through; Resilience4j defaults to 10. Never let half-open mean "resume normal traffic".</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Count slowness as failure, and scope the breaker correctly</span>
  A dependency answering in 8 seconds is worse for you than one refusing
  connections, so timeouts must count toward the trip threshold. Equally, a
  breaker keyed on the whole service will trip because one endpoint or one
  shard is sick — key it per dependency and, where it matters, per instance
  or per shard. And never let a breaker on a non-critical dependency
  propagate an error: if opening the breaker still returns a 500 to the
  user, you have built a faster failure, not a fault-tolerant system.
</div>

<h4>Dry run: a circuit breaker tripping, cooling down, and probing back open</h4>
<p class="sub">Trip threshold &gt;50% errors over a rolling 10s window, minimum 20 calls; 5s cooldown; 1 probe in half-open. A rolling window trips the moment it crosses the threshold, not on a round-number boundary.</p>
<table>
  <tr><th>Time</th><th>Event</th><th>Rolling window (calls, errors)</th><th>Error rate</th><th>Breaker state</th></tr>
  <tr><td>t = 0-10s</td><td>Dependency healthy</td><td>20 calls, 3 errors</td><td>15%</td><td>Closed — calls pass through</td></tr>
  <tr><td>t = 10-17s</td><td>Dependency starts degrading; errors pile into the window</td><td>at t=17s: 20 calls, 11 errors</td><td>55%</td><td>Window holds ≥20 calls and has just crossed 50% → trips <b>Open</b> at t=17s</td></tr>
  <tr><td>t = 17-22s</td><td>5 calls arrive during cooldown</td><td>n/a — not sent</td><td>n/a</td><td>Open: all 5 fail instantly, no thread held, no network call made</td></tr>
  <tr><td>t = 22s</td><td>Cooldown elapses</td><td>n/a</td><td>n/a</td><td>Transitions to <b>Half-open</b>, admits exactly 1 probe call</td></tr>
  <tr><td>t = 22.1s</td><td>Probe succeeds</td><td>reset</td><td>0%</td><td>Closes — normal traffic resumes</td></tr>
  <tr><td>t = 22.1s (alternate)</td><td>Probe fails instead</td><td>reset</td><td>100% of 1</td><td>Straight back to <b>Open</b>, cooldown restarts at 5s</td></tr>
</table>
<p class="sub">
  The load-bearing detail is in the row at t=17-22s: the breaker frees
  every caller's thread in microseconds instead of letting five more calls
  each burn a full timeout against a dependency that was already failing
  more than half the time — that gap is the entire value of "fail instantly"
  over "fail slowly."
</p>

<h3>Bulkheads and resource isolation</h3>
<p>
  Named after ship compartments: partition your resources so one flooded
  compartment doesn't sink the vessel. The failure it prevents is the most
  common shape of outage — one slow dependency consuming every thread or
  connection in a shared pool, taking down endpoints that never touched it.
</p>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="On the left a single shared pool of one hundred threads is fully consumed by one slow dependency so all three dependencies fail; on the right the same hundred threads split into three isolated pools of about thirty three each mean only the slow dependency's calls fail">
    <g class="rough">
      <path class="ln" d="M65,140 L65,110" />
      <path class="lnr" d="M155,140 L155,110" />
      <path class="ln" d="M245,140 L245,110" />
      <path class="ln" d="M380,140 L380,110" />
      <path class="lnr" d="M470,140 L470,110" />
      <path class="ln" d="M560,140 L560,110" />
    </g>
    <g class="rough">
      <rect class="boxr" x="20"  y="66"  width="270" height="44" rx="6" />
      <rect class="box"  x="340" y="66"  width="80"  height="44" rx="6" />
      <rect class="boxr" x="430" y="66"  width="80"  height="44" rx="6" />
      <rect class="box"  x="520" y="66"  width="80"  height="44" rx="6" />
      <rect class="box"  x="30"  y="140" width="70"  height="36" rx="6" />
      <rect class="boxr" x="120" y="140" width="70"  height="36" rx="6" />
      <rect class="box"  x="210" y="140" width="70"  height="36" rx="6" />
      <rect class="box"  x="345" y="140" width="70"  height="36" rx="6" />
      <rect class="boxr" x="435" y="140" width="70"  height="36" rx="6" />
      <rect class="box"  x="525" y="140" width="70"  height="36" rx="6" />
    </g>
    <text class="lbl" x="155" y="40" text-anchor="middle">one shared pool</text>
    <text class="lbl" x="470" y="40" text-anchor="middle">bulkheaded pools</text>
    <text class="sm" x="155" y="94" text-anchor="middle">100 threads — all consumed</text>
    <text class="sm" x="380" y="94" text-anchor="middle">33</text>
    <text class="sm" x="470" y="94" text-anchor="middle">33 — full</text>
    <text class="sm" x="560" y="94" text-anchor="middle">33</text>
    <text class="sm" x="65"  y="163" text-anchor="middle">dep A</text>
    <text class="sm" x="155" y="163" text-anchor="middle">dep B slow</text>
    <text class="sm" x="245" y="163" text-anchor="middle">dep C</text>
    <text class="sm" x="380" y="163" text-anchor="middle">dep A</text>
    <text class="sm" x="470" y="163" text-anchor="middle">dep B slow</text>
    <text class="sm" x="560" y="163" text-anchor="middle">dep C</text>
    <text class="lbl rd" x="155" y="212" text-anchor="middle">A and C fail too</text>
    <text class="lbl gr" x="470" y="212" text-anchor="middle">only B fails</text>
  </svg>
  <figcaption>Same 100-thread budget, split three ways (about 33 each). Bulkheading trades a little peak efficiency for a bounded blast radius — the shared pool is faster right up until the moment it is catastrophic.</figcaption>
</figure>
<ul>
  <li><b>Per-dependency pools:</b> a separate connection/thread pool per downstream, sized so no single one can exhaust the process.</li>
  <li><b>Separate critical from non-critical:</b> checkout and recommendations must not share a pool. Ever.</li>
  <li><b>Cells:</b> partition the whole stack — LB, app, cache, DB — into independent cells serving disjoint customer sets. A bad deploy or poison request takes out one cell, not the fleet. AWS documents this as cell-based architecture in its Well-Architected guidance.</li>
  <li><b>Shuffle sharding:</b> assign each customer a random <em>subset</em> of workers rather than a single cell. With 100 workers and 5 per customer there are about 75 million distinct combinations, so the chance that any other customer shares all five with a noisy neighbour is vanishingly small — near-total isolation at almost no capacity cost.</li>
</ul>

<h3>Graceful degradation and load shedding</h3>
<p>
  When you cannot serve everything, the choice is between deciding what to
  drop and letting the system decide randomly — and random means the
  checkout requests die alongside the avatar thumbnails. <b>Decide in
  advance, and encode the decision in the request.</b>
</p>
<p>
  Tag every request with a priority class at the edge — critical (payments,
  auth, writes the user is watching), normal (reads on the main path), bulk
  (backfills, analytics, prefetch, recommendations) — and propagate it
  through every hop. Under pressure you shed bulk first, then normal, and
  only ever fail critical when there is nothing left. Google's internal
  version has four named classes (critical-plus, critical, sheddable-plus,
  sheddable), and backends reject the lowest class first.
</p>
<table>
  <tr><th>Technique</th><th>What it does</th><th>The detail people miss</th></tr>
  <tr><td><b>Priority shedding</b></td><td>Reject low-priority classes at the admission point when the system is saturated.</td><td>The priority must be assigned at the edge and carried in-band, or downstream services have no basis to choose.</td></tr>
  <tr><td><b>Latency-based admission control</b></td><td>Shed based on <em>queue wait time</em>, not CPU. If a request has already waited longer than its deadline, dropping it is free capacity.</td><td>CPU is a lagging indicator; by the time it's at 100% you are already in the queue-growth spiral.</td></tr>
  <tr><td><b>LIFO under overload</b></td><td>Serve the newest request first. Old queued requests are probably already abandoned by their client.</td><td>Counterintuitive but correct: FIFO under overload means every request is served just after it became useless.</td></tr>
  <tr><td><b>Client-side adaptive throttling</b></td><td>Each client tracks its recent requests and how many the backend accepted; once requests exceed K times the accepts it starts rejecting some calls locally, with rising probability. Google's SRE book uses K = 2 over a two-minute window.</td><td>Rejecting at the client means the doomed request never costs the overloaded backend even the cheap rejection. Lower K is more aggressive.</td></tr>
  <tr><td><b>Fast rejection</b></td><td>Return 429/503 with <code>Retry-After</code> immediately. A rejection costs microseconds; a timeout costs a held thread for seconds.</td><td>The rejection path must be cheap — no DB call, no serialization of a big error body.</td></tr>
  <tr><td><b>Feature degradation</b></td><td>Serve stale cache, drop personalization and serve the generic feed, turn off recommendations, go read-only, serve a static fallback page.</td><td>Each degraded mode needs to be a runtime flag that has actually been exercised — an untested fallback path is just a second bug waiting for the worst possible moment.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Health checks are a fault-tolerance hazard</span>
  A liveness check that only proves the process is running keeps a broken
  node in rotation. A health check that verifies downstream dependencies
  does the opposite and far worse: when the shared dependency blips, every
  node reports unhealthy simultaneously and the load balancer removes the
  <em>entire fleet</em>. AWS's guidance is to keep the fast, automatic
  load-balancer checks <b>local</b> (can this process serve at all: not
  deadlocked, config loaded, disk and memory sane) and to handle dependency
  health separately: surface it as metrics and alerts, and let the request
  path degrade through timeouts, breakers and fallbacks, rather than letting
  a dependency blip pull every node out of rotation. So split liveness (self
  only, used for restarts) from the routing check (also local), and treat
  dependency checks as signals for people and slower control loops, never as
  the thing that empties the pool.
  As a last line of defence, load balancers can <b>fail open</b>, but the
  details differ and are narrower than they sound. An Application Load
  Balancer fails open only when <em>all</em> targets fail their checks in all
  enabled Availability Zones, then it routes to all of them. Envoy calls its
  version "panic mode": when the share of healthy hosts drops below a
  panic threshold (50% by default) it ignores health status and spreads
  traffic across the cluster. AWS itself says it is wary of relying on fail
  open, so design as if it will not save you.
</div>

<h3>Idempotency: the property that makes retries legal</h3>
<p>
  Every mechanism above depends on being able to retry safely, and you can
  only retry safely if the operation is idempotent. This is not a detail —
  it is the load-bearing assumption. A timed-out request may have succeeded,
  so "retry" and "do it twice" are the same code path from the client's
  point of view.
</p>
<ul>
  <li><b>Client-generated idempotency keys.</b> The caller mints a UUID per logical operation and sends it with every attempt. The server stores key → response and returns the stored response on replay. Store the <em>response</em>, not just a "seen" flag, so the retry gets the same order ID rather than a 409.</li>
  <li><b>Handle the concurrent duplicate.</b> Two retries can race. Insert the key with a unique constraint <em>first</em>, in the same transaction as the effect; the loser of the insert either waits and returns the winner's result or fails fast with a retryable conflict (Stripe returns an error for a request that conflicts with one still executing). A read-then-write check is a race, not a solution.</li>
  <li><b>Give keys a TTL</b> (Stripe's v1 API lets keys be pruned after 24 hours) and scope them per-customer per-endpoint so a key cannot be replayed against a different operation. Stripe also stores the first result including a 500 and replays it, and returns an error if a retry arrives with different parameters under the same key. The <code>Idempotency-Key</code> HTTP header is still only an expired IETF Internet-Draft, not an RFC, so every API defines its own rules; read them.</li>
  <li><b>Prefer natural idempotency where you can get it.</b> "Set balance to X" is idempotent; "add 10 to balance" is not. A unique constraint on <code>(order_id, item_id)</code> makes double-insert a no-op for free.</li>
  <li><b>Downstream side effects need it too.</b> Sending an email or charging a card twice is the actual customer harm — push the idempotency key all the way to the payment provider, which is exactly why every payment API has one.</li>
</ul>

<h3>Anatomy of a cascading failure, and where to cut it</h3>
<p>
  Cascades follow the same script every time, and each arrow in it is a
  place you can insert a defence:
</p>
<table>
  <tr><th>Step in the cascade</th><th>What breaks the chain here</th></tr>
  <tr><td>A trigger — a deploy, a config push, a traffic spike, a slow query, a lost AZ — pushes one tier past capacity.</td><td>Autoscaling with headroom; canary deploys with automatic rollback; staged config rollout (a config push reaches every region at once unless you stop it); per-tenant rate limits so one caller cannot be the trigger.</td></tr>
  <tr><td>Latency at that tier rises; callers' threads block waiting on it.</td><td><b>Timeouts</b> bound how long anything can block. This is the single highest-value fix.</td></tr>
  <tr><td>Callers' shared pools fill; unrelated endpoints on the same process start failing.</td><td><b>Bulkheads</b> — per-dependency pools, cells, shuffle sharding.</td></tr>
  <tr><td>Callers time out and retry, multiplying load on the already-saturated tier.</td><td><b>Circuit breakers</b> stop the calls entirely; <b>retry budgets</b> and jitter bound the amplification.</td></tr>
  <tr><td>Queues grow; every request is served after its client gave up; useful throughput reaches zero.</td><td><b>Load shedding</b> on queue latency, LIFO ordering, bounded queues (an unbounded queue is a latency bomb with extra steps).</td></tr>
  <tr><td>The failure sustains itself even after the trigger is removed.</td><td>Accept it is metastable: <b>shed hard, drain queues, warm caches, ramp back slowly.</b> Have this as an explicit runbook, because in the moment nobody derives it.</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Every call gets a deadline
  derived from the request budget, a per-dependency connection pool, and a
  circuit breaker that counts timeouts as failures. Retries happen at the
  one layer only (the edge client; everything behind it fails fast), with full jitter and a 10% retry budget. If the recommendation
  service is down the breaker opens and we serve the non-personalised feed —
  the user notices nothing, and checkout is completely unaffected because it
  uses a different pool."
</div>

<h3>Failover has its own failure modes</h3>
<p>
  Redundancy brings a new question: who is in charge now? A leader that is
  slow, paused by a long garbage collection, or cut off by a network
  partition looks dead to everyone else, so a replacement is promoted — and
  then the old leader wakes up still believing it is the leader. That is
  split brain. The standard defence is a <b>fencing token</b>: every
  promotion hands out a monotonically increasing number, and the storage or
  downstream service rejects any write carrying an older one. Failover also
  needs numbers agreed in advance: the <b>RPO</b> (how much recent data you
  can afford to lose) and the <b>RTO</b> (how long you can be down) decide
  whether you need synchronous replication, a hot standby, or just backups
  you have actually restored. Finally, make shutdown graceful too: stop
  accepting new requests, finish in-flight ones, then exit, so a routine
  deploy does not look like a failure to every caller.
</p>

<h3>Chaos engineering and game days</h3>
<p>
  Every mechanism above is a code path that only executes during an
  incident, which means it is untested by default — and an untested fallback
  is usually broken. Chaos engineering is the practice of executing those
  paths deliberately, while people are watching.
</p>
<ul>
  <li><b>Hypothesis first.</b> "If we kill one instance in the payments cell, error rate stays under 0.1% and recovery completes in under 60 seconds." A chaos experiment without a predicted outcome is just an outage you caused.</li>
  <li><b>Smallest blast radius, then widen.</b> One instance, then one AZ, then a region evacuation. Netflix's ladder from Chaos Monkey (kill an instance) to Chaos Kong (evacuate a region) is the model (the wider Simian Army project is retired; Chaos Monkey continues as a standalone service configured through Spinnaker); AWS Fault Injection Service and Gremlin package the same idea.</li>
  <li><b>Inject latency, not just failure.</b> Slow is harder than dead and far more common — most cascades start with a p99 that quietly went from 20 ms to 2 s.</li>
  <li><b>Run it in production, during business hours,</b> with an abort button and a named person holding it. Staging does not have your traffic pattern, your cache state, or your on-call rotation.</li>
  <li><b>Game days test humans as much as systems.</b> Does the alert fire? Does it page the right team? Is the runbook accurate? Can the on-call actually find the dashboard at 3 a.m.? Half the value found in a good game day is organisational, not technical.</li>
</ul>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt names an availability target ("99.99%", "always available", "handle Black Friday") or mentions money, safety, or regulatory consequences — all of them mean the interviewer wants explicit failure handling, not a happy-path diagram.</li>
  <li>Any arrow you draw between two boxes is a place to state a timeout, a retry policy, and a fallback. Walking the diagram once and annotating each arrow is a strong, structured way to spend five minutes.</li>
  <li>A naive design adds retries everywhere and calls it resilience. The distinguishing question is always "what happens when the dependency is down for ten minutes, not two seconds" — that is where breakers, budgets, and degradation separate from retries.</li>
  <li>Distinguish from replication and failover: those give you redundancy for <em>component</em> failure. This chapter is about <em>overload and correlated</em> failure, where redundancy alone makes things worse because every replica is failing for the same reason.</li>
  <li>Whenever you propose a retry, immediately say how the operation is made idempotent. Retries without idempotency are duplicate charges, and interviewers notice both when you say it and when you don't.</li>
  <li>Close by naming the degraded mode. "If the whole recommendation tier is gone, here is exactly what the user sees" is the answer that demonstrates you have run something in production.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Compute, for a service with 10 dependencies each at 99.9% availability, the resulting availability — and say what breaks that multiplication.</li>
    <li>Walk through the circuit breaker dry run above and explain why the five calls during cooldown fail instantly instead of timing out.</li>
    <li>Say how many attempts reach the database when three layers each make up to 3 attempts, and how many when each makes 3 retries (4 attempts).</li>
    <li>Explain metastable failure in your own words, and name the two ways out of it.</li>
    <li>Say why a readiness check that pings a downstream dependency can take down an entire healthy fleet, and how splitting liveness from readiness fixes it.</li>
    <li>For any retry you propose, state in the same breath how the operation is made idempotent.</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://aws.amazon.com/builders-library/timeouts-retries-and-backoff-with-jitter/" rel="noopener noreferrer">AWS Builders' Library: timeouts, retries and backoff with jitter</a> — retry at a single point in the stack, token-bucket retry limits, and how stacked retries multiply load</li>
    <li><a href="https://aws.amazon.com/builders-library/implementing-health-checks/" rel="noopener noreferrer">AWS Builders' Library: implementing health checks</a> — why load balancer checks stay local, and the caution about relying on fail open</li>
    <li><a href="https://sre.google/sre-book/handling-overload/" rel="noopener noreferrer">Google SRE book: handling overload</a> — per-client retry budget of 10%, adaptive client throttling with K = 2, criticality classes</li>
    <li><a href="https://sre.google/sre-book/addressing-cascading-failures/" rel="noopener noreferrer">Google SRE book: addressing cascading failures</a> — the 3-retries-per-layer example that gives 64x, load shedding and degradation</li>
    <li><a href="https://www.envoyproxy.io/docs/envoy/latest/intro/arch_overview/upstream/load_balancing/panic_threshold" rel="noopener noreferrer">Envoy docs: panic threshold</a> — the 50% default and what panic mode does</li>
    <li><a href="https://docs.aws.amazon.com/elasticloadbalancing/latest/application/target-group-health-checks.html" rel="noopener noreferrer">AWS docs: Application Load Balancer health checks</a> — fail open only when all targets fail in all enabled zones</li>
    <li><a href="https://resilience4j.readme.io/docs/circuitbreaker" rel="noopener noreferrer">Resilience4j circuit breaker docs</a> — default window, minimum calls, open-state wait and half-open probe count</li>
    <li><a href="https://github.com/Netflix/Hystrix/wiki/Configuration" rel="noopener noreferrer">Hystrix configuration wiki</a> — the 50% / 20 calls / 10 s / 5 s defaults the diagram uses</li>
    <li><a href="https://docs.stripe.com/api/idempotent_requests" rel="noopener noreferrer">Stripe API: idempotent requests</a> — key retention, replay of stored responses, rejection of changed parameters</li>
    <li><a href="https://doi.org/10.1145/3458336.3465286" rel="noopener noreferrer">Metastable failures in distributed systems (HotOS 2021)</a> — the original definition of the self-sustaining overload state</li>
    <li><a href="https://docs.aws.amazon.com/wellarchitected/latest/reducing-scope-of-impact-with-cell-based-architecture/what-is-a-cell-based-architecture.html" rel="noopener noreferrer">AWS Well-Architected: cell-based architecture</a> — cells, cell routers and blast-radius reduction</li>
    <li><a href="https://www.kernel.org/doc/html/latest/networking/ip-sysctl.html" rel="noopener noreferrer">Linux kernel networking sysctls</a> — keepalive and retransmission defaults behind the timeout numbers</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" are rules of thumb, not guarantees.</p>
</div>`,
};
