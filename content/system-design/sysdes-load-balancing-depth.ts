import type { Chapter } from "../types";

export const sysdesLoadBalancingDepth: Chapter = {
  id: "sysdes-load-balancing-depth",
  num: "I1",
  title: "Load balancing in depth",
  short: "Load balancing in depth",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "The box everyone draws and nobody explains — where L7 earns its latency, why consistent hashing keeps recurring, and how a health check turns a brownout into an outage.",
  body: `<h3>The most-drawn, least-understood box on the whiteboard</h3>
<p>
  Every candidate draws a load balancer. Very few can say what layer it
  operates at, what it can and cannot see, how it decides where a request
  goes, how it learns a backend is dead, or what happens to the connections
  in flight when you deploy. Those five questions are the entire chapter, and
  they are asked because the load balancer is simultaneously the thing that
  makes a system horizontally scalable and <b>the single component every
  request must survive</b>. Get it wrong and your redundancy is decorative —
  a health check that is too eager can convert a slow backend into a dead
  fleet in under a minute.
</p>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A comparison of a layer four load balancer that forwards flows using only IP address and port against a layer seven proxy that terminates TLS, parses each HTTP request and routes it by path to different backend pools">
    <g class="rough">
      <path class="ln" d="M92,88 L124,88" />
      <path class="ln" d="M212,82 L246,66" />
      <path class="ln" d="M212,94 L246,112" />
      <path class="ln" d="M422,88 L452,88" />
      <path class="lng" d="M546,76 L576,54" />
      <path class="lng" d="M546,88 L576,90" />
      <path class="lng" d="M546,100 L576,126" />
      <path class="ln dash" d="M320,14 L320,214" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="68"  width="76" height="40" rx="6" />
      <rect class="boxy" x="124" y="68"  width="88" height="40" rx="6" />
      <rect class="box"  x="246" y="48"  width="56" height="32" rx="5" />
      <rect class="box"  x="246" y="98"  width="56" height="32" rx="5" />
      <rect class="box"  x="346" y="68"  width="76" height="40" rx="6" />
      <rect class="boxg" x="452" y="62"  width="94" height="52" rx="6" />
      <rect class="box"  x="576" y="38"  width="52" height="30" rx="5" />
      <rect class="box"  x="576" y="76"  width="52" height="30" rx="5" />
      <rect class="box"  x="576" y="114" width="52" height="30" rx="5" />
    </g>
    <text class="lbl" x="160" y="26" text-anchor="middle">L4</text>
    <text class="lbl" x="480" y="26" text-anchor="middle">L7</text>
    <text class="sm" x="160" y="46" text-anchor="middle">transport: IP and port</text>
    <text class="sm" x="480" y="46" text-anchor="middle">application: method, path, headers</text>
    <text class="sm" x="54"  y="92" text-anchor="middle">client</text>
    <text class="sm" x="168" y="92" text-anchor="middle">flow map</text>
    <text class="sm" x="384" y="92" text-anchor="middle">client</text>
    <text class="sm" x="499" y="84" text-anchor="middle">TLS +</text>
    <text class="sm" x="499" y="100" text-anchor="middle">HTTP parse</text>
    <text class="sm" x="602" y="58" text-anchor="middle">/api</text>
    <text class="sm" x="602" y="96" text-anchor="middle">/img</text>
    <text class="sm" x="602" y="134" text-anchor="middle">/ws</text>
    <text class="sm" x="160" y="160" text-anchor="middle">forwards flows, never reads the body</text>
    <text class="sm" x="160" y="180" text-anchor="middle">millions of conn/sec, direct server return possible</text>
    <text class="sm rd" x="160" y="200" text-anchor="middle">cannot retry, cannot route by path</text>
    <text class="sm" x="480" y="160" text-anchor="middle">terminates TLS, parses every request</text>
    <text class="sm" x="480" y="180" text-anchor="middle">10-50k rps per core, adds 0.5-2 ms</text>
    <text class="sm gr" x="480" y="200" text-anchor="middle">retries, path routing, header injection</text>
    <text class="sm" x="320" y="228" text-anchor="middle">on HTTP/2 only L7 balances individual streams — L4 pins them all to one backend</text>
  </svg>
  <figcaption>L4 moves packets and is nearly free; L7 understands requests and charges you a millisecond for it. The bottom line is the one that decides most modern designs.</figcaption>
</figure>

<h3>L4 vs L7: what only L7 can do</h3>
<p>
  An L4 balancer picks a backend once, per <em>connection</em>, from the
  5-tuple, then shovels bytes. It never decrypts, never parses, and therefore
  costs almost nothing — a software L4 on commodity hardware handles millions
  of concurrent flows and tens of gigabits, and with direct server return the
  response never traverses the balancer at all, which matters enormously for
  video and download workloads. An L7 proxy terminates the connection, does
  the TLS handshake, parses the HTTP request, and makes a fresh decision per
  <em>request</em>.
</p>
<table>
  <tr><th>Capability</th><th>L4</th><th>L7</th><th>Why it matters</th></tr>
  <tr><td>Route by host / path / header</td><td>No</td><td>Yes</td><td>One public IP fronting twenty services; canary by header; API versioning at the edge</td></tr>
  <tr><td>Retry a failed request elsewhere</td><td>No — it can only reset the connection</td><td>Yes</td><td>L4 doesn't know where a request begins or ends, so it cannot replay one. This is the biggest practical gap</td></tr>
  <tr><td>Per-request balancing on HTTP/2 or gRPC</td><td>No</td><td>Yes</td><td><b>The one that bites people.</b> gRPC multiplexes many calls over one long-lived connection; an L4 pins every one of them to whichever backend it picked at connect time, and your "balanced" fleet develops permanent hotspots</td></tr>
  <tr><td>TLS termination, mTLS, cert management</td><td>Passthrough only</td><td>Yes</td><td>Centralised certificates; backends speak plaintext or mesh mTLS</td></tr>
  <tr><td>Inject <code>X-Forwarded-For</code>, trace ids</td><td>No</td><td>Yes</td><td>Without it, every backend log shows the balancer's IP and distributed tracing has no root span</td></tr>
  <tr><td>Rate limiting, WAF, response caching, compression</td><td>No</td><td>Yes</td><td>Per-route policy in one place</td></tr>
  <tr><td>Cost and latency</td><td>Microseconds; near-zero CPU</td><td>0.5-2 ms; a full RSA-2048 handshake is 1-2 ms of CPU, ECDSA far less, and session resumption removes most of it</td><td>At a million rps the L7 fleet is a real line item</td></tr>
  <tr><td>Reach for this when…</td><td>Raw throughput, non-HTTP protocols, huge egress, or as the first tier absorbing volume before L7</td><td>Anything HTTP where you need routing, retries, observability or per-request fairness — which is nearly every application tier</td><td>Real systems use both, in that order</td></tr>
</table>

<h3>Algorithms, and when each one is right</h3>
<table>
  <tr><th>Algorithm</th><th>How it decides</th><th>Fails when</th><th>Reach for this when…</th></tr>
  <tr><td><b>Round robin</b></td><td>Next backend in sequence</td><td>Requests vary in cost, or backends vary in size — a slow request pins a server while the rotation keeps feeding it</td><td>Homogeneous backends and roughly uniform request cost. Still the correct default for a stateless web tier</td></tr>
  <tr><td><b>Weighted round robin</b></td><td>Proportional to a static weight</td><td>Weights are guesses and go stale after a hardware refresh</td><td>Mixed instance sizes, or ramping a canary from 1% to 100%</td></tr>
  <tr><td><b>Least connections</b></td><td>Fewest in-flight connections</td><td>Each balancer only sees its own connections; with many balancers they all pick the same "idle" backend at once and stampede it</td><td>Long-lived or highly variable requests: WebSockets, streaming, uploads, slow queries</td></tr>
  <tr><td><b>Least request / peak-EWMA</b></td><td>Fewest outstanding requests, weighted by observed latency</td><td>Needs per-backend latency state; reacts to noise if the window is too short</td><td>Service-to-service traffic behind a mesh, where a degraded backend must be shed automatically</td></tr>
  <tr><td><b>Power of two choices</b></td><td>Pick two backends at random, send to the less loaded of the two</td><td>Almost nothing — this is the quiet best-in-class default</td><td>Any fleet with multiple independent balancers. It needs no global state and drops the expected maximum load from roughly log n to log log n</td></tr>
  <tr><td><b>Consistent hashing</b></td><td>Hash a key onto a ring; take the first node clockwise</td><td>Hot keys — one popular key means one hot backend, permanently</td><td>Cache tiers, sharded stateful services, session affinity without cookies. See below</td></tr>
  <tr><td><b>Source-IP hash</b></td><td>Hash the client IP</td><td>Carrier-grade NAT — an entire mobile network arrives as one IP and lands on one backend</td><td>Rarely. Use a cookie or a real key instead</td></tr>
</table>
<p class="sub">
  Power of two choices is worth naming explicitly because it sounds like a
  compromise and is actually close to optimal. Pure random assignment leaves
  the busiest server with roughly log n / log log n times the average queue;
  sampling just two and taking the shorter queue reduces that to about log log
  n — an exponential improvement bought with zero coordination. It is why
  modern proxies default to it rather than to true least-connections, and
  mentioning it is a cheap, genuine seniority signal.
</p>
<div class="warn">
  <span class="ttl">⚠ A brand-new backend is not ready for its full share</span>
  Round robin gives an instance that booted four seconds ago exactly the same
  traffic as one that has been warm for a week — into a cold cache, an empty
  connection pool and un-JITed code. It gets slow, fails a health check, drops
  out, comes back, and oscillates. Every serious balancer has a slow-start or
  warm-up setting that ramps a new backend's weight from near zero to full
  over 30-120 seconds. It is one config line and it is the difference between
  a deploy nobody notices and a deploy that pages someone.
</div>

<h3>Consistent hashing, properly</h3>
<p>
  Suppose you route cache keys with <code>hash(key) mod N</code>. With four
  nodes you add a fifth, and every key whose home changes loses its cached
  value. How many change? Work it out with the Chinese remainder theorem: a
  key keeps its home only when <code>k mod 4 == k mod 5</code>, which for
  <code>k mod 20</code> happens exactly for 0, 1, 2 and 3. That is
  <b>4 out of 20 — 20% stay, 80% move</b>. You added capacity and instantly
  invalidated four fifths of your warm cache.
</p>
<figure>
  <svg viewBox="0 0 640 310" class="dg" role="img" aria-label="A consistent hashing ring with three nodes A, B and C placed around it and three keys, showing that inserting a new node D only takes over the arc between D and the next node counter-clockwise, so exactly one key moves and the other two are unaffected">
    <g class="rough">
      <path class="ln" d="M145,150 A105,105 0 1 0 355,150 A105,105 0 1 0 145,150" />
      <path class="lng" d="M349,114 A105,105 0 0 0 250,45" />
      <circle class="boxy" cx="250" cy="45"  r="13" />
      <circle class="boxy" cx="341" cy="203" r="13" />
      <circle class="boxy" cx="159" cy="203" r="13" />
      <circle class="boxg" cx="349" cy="114" r="13" />
      <circle class="box"  cx="303" cy="59"  r="7" />
      <circle class="box"  cx="145" cy="150" r="7" />
      <circle class="box"  cx="214" cy="249" r="7" />
    </g>
    <text class="sm" x="250" y="26"  text-anchor="middle">node A</text>
    <text class="sm" x="341" y="232" text-anchor="middle">node B</text>
    <text class="sm" x="159" y="232" text-anchor="middle">node C</text>
    <text class="sm gr" x="349" y="94" text-anchor="middle">node D, new</text>
    <text class="sm" x="316" y="46"  text-anchor="middle">k1</text>
    <text class="sm" x="124" y="146" text-anchor="middle">k2</text>
    <text class="sm" x="206" y="272" text-anchor="middle">k3</text>
    <text class="sm" x="396" y="60">a key belongs to the first node</text>
    <text class="sm" x="396" y="80">clockwise around the ring</text>
    <text class="sm gr" x="396" y="110">D takes only the green arc, so</text>
    <text class="sm gr" x="396" y="130">k1 moves from B to D</text>
    <text class="sm" x="396" y="150">k2 and k3 never notice</text>
    <text class="sm rd" x="396" y="184">mod-N, 4 → 5 nodes: 80% of keys move</text>
    <text class="sm gr" x="396" y="204">ring, 4 → 5 nodes: 20% of keys move</text>
    <text class="sm" x="396" y="238">virtual nodes: 100-200 ring points</text>
    <text class="sm" x="396" y="258">per machine, or the arcs come out</text>
    <text class="sm" x="396" y="278">badly uneven by luck alone</text>
    <text class="sm" x="250" y="300" text-anchor="middle">adding a node disturbs one arc, not the whole mapping</text>
  </svg>
  <figcaption>The property that matters is not that the hash is clever — it is that node membership changes affect an arc rather than a modulus, so the disruption is 1/(N+1) instead of nearly everything.</figcaption>
</figure>
<p>
  On a ring, both keys and nodes are hashed into the same space (say
  0 to 2³²−1). A key is owned by the first node clockwise from it. Adding a
  node inserts one new point and it steals only the arc between itself and its
  predecessor: <b>an expected 1/(N+1) of all keys</b>. Going from four nodes to
  five moves 20% instead of 80%. At a hundred nodes, adding one moves 1%
  instead of essentially everything.
</p>
<p>
  Tie that back to the cache arithmetic, because that is where the difference
  becomes an incident. A tier at a 95% hit rate, resizing from four nodes to
  five:
</p>
<ul>
  <li><b>mod-N:</b> new miss rate = 0.80 + 0.20 × 0.05 = <b>0.81</b>. Origin load jumps <b>16×</b>, while you were <em>adding</em> capacity.</li>
  <li><b>Consistent hashing:</b> new miss rate = 0.20 + 0.80 × 0.05 = <b>0.24</b>. A 4.8× bump — still real, still worth ramping the new node in gradually, but survivable.</li>
</ul>
<p>
  Two refinements you should mention unprompted. <b>Virtual nodes</b>: placing
  each machine at a single ring point gives arc lengths drawn from an
  exponential distribution, so with ten nodes one of them can easily own three
  times its fair share. Give every machine 100-200 ring points instead and the
  imbalance shrinks roughly as 1/√V — around ±10% at V = 100 — and you get
  weighting for free, since a machine with twice the capacity simply gets twice
  the points. <b>Bounded-load consistent hashing</b>: cap any node at (1 + ε)
  times the average load and spill the overflow to the next node clockwise,
  which fixes the one genuine weakness of the ring, namely that a single very
  hot key concentrates on a single node forever.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd shard the cache with
  consistent hashing and about 150 virtual nodes per machine. The reason isn't
  elegance — with plain modulo, replacing one failed node out of five remaps
  roughly 80% of keys, which takes the hit rate from 95% to about 19% and
  sends 16× the normal load at the database at the exact moment I'm already
  degraded. The ring keeps that blast radius to one node's share."
</div>

<h3>Health checks: active, passive, and how they amplify an outage</h3>
<table>
  <tr><th></th><th>Active probing</th><th>Passive (outlier detection)</th></tr>
  <tr><td>Mechanism</td><td>The balancer calls <code>/healthz</code> every N seconds</td><td>The balancer watches real responses and ejects after k consecutive 5xx or timeouts</td></tr>
  <tr><td>Detection time</td><td>interval × unhealthy-threshold, plus the timeout — 5 s × 3 is up to ~20 s of served errors</td><td>Effectively immediate — it fails on real traffic</td></tr>
  <tr><td>Blind spot</td><td>A backend that returns 200 on <code>/healthz</code> while failing every real request (bad deploy, poisoned cache, exhausted pool)</td><td>Cannot tell you when a backend has recovered — nothing is being sent to it</td></tr>
  <tr><td>Risk</td><td>Probe traffic at scale, and coupling to dependencies</td><td>Ejecting a backend for errors the client actually caused</td></tr>
  <tr><td>Reach for this when…</td><td>Always, as the mechanism for <em>re-admitting</em> a recovered instance and for gating new ones</td><td>Always, alongside it, as the mechanism for fast <em>removal</em>. Use both; they cover each other's blind spots</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ How a health check turns a brownout into an outage</span>
  Ten backends running at 70% CPU. Two get slow under a traffic bump and fail
  their probes, so the balancer ejects them. The remaining eight now carry
  10/8 = 1.25× the load — 87.5% CPU. Two more go slow and get ejected. The
  last six carry 10/6 = 1.67× — <b>117% of capacity</b> — and the fleet is
  gone. The health check did precisely what it was told: it removed capacity
  from a system whose problem was insufficient capacity. Real balancers guard
  this with a <b>panic threshold</b> (Envoy's default: if fewer than 50% of
  hosts are healthy, ignore health status entirely and spread load across all
  of them, on the theory that a struggling backend beats no backend). The
  other half of the fix belongs to the backend: enforce a concurrency limit
  and shed excess load with a fast 503 rather than degrading into timeouts,
  so an overloaded server stays <em>honest</em> instead of looking dead.
</div>
<p class="sub">
  Two more health-check details that separate operators from readers. First,
  <b>probe the instance, not the world</b>: a readiness endpoint that checks
  the database will fail on every instance simultaneously during a 20-second
  database blip and drain your entire pool — the outage is then total rather
  than partial. Second, <b>probing costs something</b>: 200 balancer instances
  each probing 500 backends every 2 seconds is 50,000 probes/sec of pure
  overhead. Past a certain fleet size you stop having every proxy probe every
  backend and move to a control plane that distributes health state (xDS-style
  push), which is also what makes ejection decisions consistent across the
  fleet instead of each proxy holding its own private opinion.
</p>

<h3>Connection draining, and the deploy that drops requests</h3>
<p>
  Removing a backend is not an event, it is a sequence, and skipping a step
  shows up as a small burst of 502s on every single deploy that nobody ever
  gets around to fixing.
</p>
<ul>
  <li><b>1. Stop being advertised.</b> Fail the readiness probe or deregister from the pool. New requests stop arriving — <em>eventually</em>.</li>
  <li><b>2. Wait for that to propagate.</b> This is the step everyone omits. The balancer may not notice for a full health-check interval, and in Kubernetes the SIGTERM and the endpoint removal happen <em>concurrently</em>, so a container that exits promptly on SIGTERM will drop requests that were routed a moment earlier. A <code>preStop</code> sleep of 5-10 seconds before you begin shutting down is the standard fix.</li>
  <li><b>3. Drain in-flight work</b> up to a deadline — 30 s for a web tier, longer for uploads. Reject anything new with a clean 503.</li>
  <li><b>4. Close keep-alive connections deliberately.</b> Send <code>Connection: close</code> on the last response (or an HTTP/2 <code>GOAWAY</code>), otherwise a client holds an idle socket to a process that is about to vanish and its next request fails.</li>
  <li><b>5. Then exit.</b></li>
</ul>
<p>
  Long-lived connections don't drain, they get evicted. Rolling a fleet
  holding a million WebSockets disconnects a million clients, all of which
  reconnect immediately and in unison unless the client backs off with
  jitter — a self-inflicted denial of service that arrives roughly one second
  after a successful deploy. Roll in small batches, and make jittered
  reconnect a client requirement, not a hope.
</p>

<h3>Sticky sessions and why they are a smell</h3>
<p>
  Affinity — by source IP, by a balancer-issued cookie, or by hashing a header
  — pins a user to one backend. It works, which is the problem: it lets you
  keep server-side state that you should have externalised, and it converts a
  stateless tier into a stateful one without anybody deciding to.
</p>
<ul>
  <li><b>Load stops being balanced.</b> Existing sessions never move, so scaling out during a spike adds instances that receive nothing until sessions churn. Autoscaling is least effective exactly when you need it most.</li>
  <li><b>Every deploy is a data-loss event.</b> Restarting a backend destroys the sessions, carts and in-memory work of whoever was pinned to it.</li>
  <li><b>Draining becomes user-visible.</b> You cannot remove a node gracefully when removal means logging its users out.</li>
  <li><b>Failure stops being graceful.</b> One dead instance out of twenty means 5% of users are fully broken, rather than everyone losing one request that gets retried.</li>
  <li><b>Source-IP affinity in particular is broken by design.</b> Carrier-grade NAT puts an entire mobile network behind a handful of IPs, and those hash to a handful of backends.</li>
</ul>
<p>
  The legitimate uses are narrow and worth naming, so you don't sound
  dogmatic: a WebSocket or gRPC stream is <em>inherently</em> pinned for its
  lifetime; a multipart upload buffered on local disk has to finish where it
  started. And for <b>cache locality</b> — routing the same user to the
  instance that already has their data warm — the right tool is consistent
  hashing on the user id, not session affinity, because a ring degrades
  gracefully when a node dies and rebalances when you add one, whereas
  affinity does neither. Everything else is solved by putting the session in
  Redis or in a short-lived signed token, at which point any instance can
  serve any request and the whole category of problem disappears.
</p>
<div class="sticky mint">
  <span class="ttl">The distinction to keep</span>
  Sticky sessions are affinity you depend on for <em>correctness</em>.
  Consistent hashing is affinity you exploit for <em>performance</em>. The
  first breaks when a node dies; the second just gets slower for a moment.
  Same routing trick, opposite blast radius.
</div>

<h3>Multi-tier balancing: DNS, global, regional</h3>
<p>
  At scale there is no "the load balancer" — there are four tiers, each
  choosing at a different granularity and failing over on a different
  timescale.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="A four tier load balancing hierarchy where a client resolves DNS or anycast to choose a region, then inside the region a layer four tier spreads traffic to a layer seven proxy tier which routes requests to individual pods, with a second identical region ready to be withdrawn from anycast on failure">
    <g class="rough">
      <rect class="box" x="24"  y="122" width="272" height="148" rx="8" />
      <rect class="box" x="344" y="122" width="272" height="148" rx="8" />
    </g>
    <g class="rough">
      <path class="ln" d="M320,46 L320,66" />
      <path class="ln" d="M290,100 L180,122" />
      <path class="ln dash" d="M350,100 L470,122" />
      <path class="ln" d="M130,175 L170,175" />
      <path class="ln" d="M225,192 L80,220" />
      <path class="ln" d="M225,192 L155,220" />
      <path class="ln" d="M225,192 L235,220" />
    </g>
    <g class="rough">
      <rect class="boxy" x="272" y="14"  width="96"  height="32" rx="6" />
      <rect class="boxy" x="240" y="66"  width="160" height="34" rx="6" />
      <rect class="boxy" x="40"  y="158" width="90"  height="34" rx="6" />
      <rect class="boxg" x="170" y="158" width="110" height="34" rx="6" />
      <rect class="boxg" x="45"  y="220" width="70"  height="30" rx="5" />
      <rect class="boxg" x="120" y="220" width="70"  height="30" rx="5" />
      <rect class="boxg" x="200" y="220" width="70"  height="30" rx="5" />
    </g>
    <text class="sm" x="320" y="34"  text-anchor="middle">client</text>
    <text class="sm" x="320" y="80"  text-anchor="middle">DNS / anycast — choose a region</text>
    <text class="sm" x="320" y="96"  text-anchor="middle">seconds to minutes to fail over</text>
    <text class="sm" x="40"  y="144">region A</text>
    <text class="sm" x="360" y="144">region B</text>
    <text class="sm" x="85"  y="179" text-anchor="middle">L4 / ECMP</text>
    <text class="sm" x="225" y="179" text-anchor="middle">L7 proxy tier</text>
    <text class="sm" x="80"  y="239" text-anchor="middle">pod</text>
    <text class="sm" x="155" y="239" text-anchor="middle">pod</text>
    <text class="sm" x="235" y="239" text-anchor="middle">pod</text>
    <text class="sm" x="480" y="180" text-anchor="middle">identical stack</text>
    <text class="sm" x="480" y="202" text-anchor="middle">withdrawn from anycast</text>
    <text class="sm" x="480" y="224" text-anchor="middle">when the region is unhealthy</text>
    <text class="sm" x="320" y="290" text-anchor="middle">each tier's failover is faster and finer-grained than the tier above it</text>
  </svg>
  <figcaption>Granularity increases downwards: DNS moves whole regions in minutes, L4 moves flows in seconds, L7 moves individual requests instantly. Match the failure you're protecting against to the tier that can actually respond in time.</figcaption>
</figure>
<table>
  <tr><th>Tier</th><th>Chooses</th><th>Failover speed</th><th>Gotcha</th></tr>
  <tr><td><b>DNS / GeoDNS</b></td><td>Which region's IP the client gets</td><td>Minutes, and not really yours to control</td><td>TTL is advisory. Resolvers, OSes and browsers all cache; assume 5-15 minutes of residual traffic to a withdrawn record no matter what TTL you set</td></tr>
  <tr><td><b>Anycast</b></td><td>Which POP the packets reach, via BGP</td><td>Seconds</td><td>Immune to DNS caching, which is why it's the preferred top tier — but a BGP reconvergence can move a flow mid-connection and reset TCP</td></tr>
  <tr><td><b>Regional L4</b></td><td>Which L7 proxy gets the flow</td><td>Seconds, per flow</td><td>Use Maglev-style consistent hashing so scaling the L4 tier doesn't reshuffle every existing connection</td></tr>
  <tr><td><b>Regional L7</b></td><td>Which backend gets each request</td><td>Immediate, per request</td><td>The only tier that can retry. Also the only tier that can be zone-aware</td></tr>
  <tr><td><b>Client-side / mesh sidecar</b></td><td>Which instance, from the caller's own process</td><td>Immediate</td><td>Removes a network hop entirely, but every client now needs service discovery and a control plane to push endpoints</td></tr>
</table>
<p class="sub">
  One practical detail from the bottom tier that interviewers like:
  <b>zone-aware routing</b>. Cross-AZ traffic costs real money (roughly one to
  two cents per GB, charged in both directions) and adds a millisecond or two.
  Configuring the L7 tier to prefer backends in its own availability zone, and
  only spill across zones when the local ones are unhealthy or saturated, cuts
  both. Say it as a cost decision, because it is one, and cost awareness is
  rare enough in system design interviews to be memorable.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The moment a design has more than one instance of anything, the interviewer is entitled to ask how traffic reaches them. Have a default ready: L4 in front of L7, round robin or power-of-two at the bottom, active plus passive health checks, slow start on new instances.</li>
  <li>Any mention of gRPC, HTTP/2 or long-lived connections between services should make you say "per-request balancing" out loud — an L4 balancer in front of gRPC produces permanent, invisible hotspots and this is a favourite gotcha.</li>
  <li>A naive design draws one load balancer box, never says which layer, and leaves it as an unreplicated single point of failure in front of a carefully replicated everything-else.</li>
  <li>Distinguish this from <b>sharding</b>: load balancing spreads <em>stateless</em> work across interchangeable workers; sharding partitions <em>state</em> across non-interchangeable owners. Consistent hashing shows up in both, which is exactly why people confuse them — name which one you're doing.</li>
  <li>"Users must stay connected to the same server" is a prompt to push back. Ask what state lives there and whether it can be externalised, and only accept affinity for genuinely connection-scoped things.</li>
  <li>Pitfall: treating health checks as a checkbox. If you can describe the detection interval, what the probe does <em>not</em> check, the panic threshold, and what happens to in-flight requests during a deploy, you are answering at a level most candidates never reach.</li>
</ul>`,
};
