import type { Chapter } from "../types";

export const sysdesClientServerBasics: Chapter = {
  id: "sysdes-client-server-basics",
  num: "B2",
  title: "Client-server basics",
  short: "Client-server basics",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle:
    "A senior candidate can narrate everything between the keypress and the pixel — and knows what each hop costs in milliseconds.",
  body: `<h3>The one question that separates levels: "what happens when I hit enter?"</h3>
<p>
  This looks like a trivia question and is actually a depth probe. Anyone can
  say "the browser sends a request to the server." The signal is in whether
  you can name each hop, say roughly what it costs, and identify which hops
  you get to influence as a designer. Every scaling technique in later
  chapters — caching, load balancing, CDNs, replicas — is an intervention at
  one specific point on this path. If the path is fuzzy, the interventions
  sound arbitrary.
</p>
<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="The full lifecycle of a web request: browser resolves DNS through a recursive resolver and authoritative nameserver, opens a TCP and TLS connection to a load balancer, which forwards to one of two stateless app servers, which read from a cache and fall back to the primary database">
    <g class="rough">
      <path class="ln dash" d="M64,116 L200,60" />
      <path class="ln dash" d="M282,46 L320,46" />
      <path class="ln" d="M112,142 L146,142" />
      <path class="ln" d="M272,142 L316,116" />
      <path class="ln" d="M272,142 L316,178" />
      <path class="lng" d="M438,110 L488,110" />
      <path class="lnr" d="M438,180 L508,206" />
    </g>
    <g class="rough">
      <rect class="box"  x="12"  y="118" width="100" height="48" rx="6" />
      <rect class="box"  x="152" y="24"  width="130" height="44" rx="6" />
      <rect class="box"  x="320" y="24"  width="140" height="44" rx="6" />
      <rect class="boxy" x="146" y="118" width="126" height="48" rx="6" />
      <rect class="box"  x="318" y="88"  width="120" height="44" rx="6" />
      <rect class="box"  x="318" y="158" width="120" height="44" rx="6" />
      <rect class="boxg" x="488" y="88"  width="132" height="44" rx="6" />
      <rect class="boxr" x="488" y="184" width="132" height="48" rx="6" />
    </g>
    <text class="lbl" x="62"  y="148" text-anchor="middle">browser</text>
    <text class="sm"  x="217" y="51"  text-anchor="middle">recursive resolver</text>
    <text class="sm"  x="390" y="51"  text-anchor="middle">authoritative NS</text>
    <text class="sm"  x="209" y="139" text-anchor="middle">load balancer</text>
    <text class="sm"  x="209" y="157" text-anchor="middle">(TLS terminates here)</text>
    <text class="sm"  x="378" y="107" text-anchor="middle">app server 1</text>
    <text class="sm"  x="378" y="124" text-anchor="middle">stateless</text>
    <text class="sm"  x="378" y="177" text-anchor="middle">app server 2</text>
    <text class="sm"  x="378" y="194" text-anchor="middle">stateless</text>
    <text class="sm gr" x="554" y="107" text-anchor="middle">cache</text>
    <text class="sm gr" x="554" y="124" text-anchor="middle">0.5 ms, 90% hit</text>
    <text class="sm rd" x="554" y="205" text-anchor="middle">primary DB</text>
    <text class="sm rd" x="554" y="222" text-anchor="middle">5-20 ms, hard to scale</text>
    <text class="sm" x="86" y="88">1. DNS: 0 ms warm, 20-120 ms cold</text>
    <text class="sm" x="86" y="188">2. TCP + TLS: 2-3 RTT</text>
    <text class="lbl" x="20" y="258" style="font-size:15px">Everything left of the load balancer you influence with DNS and</text>
    <text class="lbl" x="20" y="280" style="font-size:15px">connection reuse. Everything right of it you influence with</text>
    <text class="lbl" x="20" y="302" style="font-size:15px">statelessness, caching, and how rarely you touch the red box.</text>
  </svg>
  <figcaption>The red box is the one component in this picture that is genuinely hard to scale. Most of system design is a campaign to talk to it less often.</figcaption>
</figure>

<h3>DNS: four lookups you hope never to make</h3>
<p>
  The browser needs an IP address before it can open a socket. It asks its
  configured <b>recursive resolver</b> (your ISP's, or a public one like
  8.8.8.8), and that resolver is the component that does the actual walking:
  it asks a root nameserver who handles <code>.com</code>, asks that TLD
  server who is authoritative for <code>example.com</code>, and asks the
  authoritative nameserver for the record. Each step is a network round trip,
  which is why a genuinely cold resolution can cost 100 ms or more, and why
  in practice it costs zero — every layer caches.
</p>
<p>
  Caching is governed by the record's <b>TTL</b>. A 60-second TTL means fast
  failover and heavy query load on your nameservers; a 24-hour TTL means the
  opposite. The critical property for design: the TTL is a hint, not a
  contract. Resolvers clamp it, operating systems cache on top of it, and
  browsers keep their own cache for a minute or two regardless. If you plan to
  move traffic by changing a DNS record, assume a long tail of clients keeps
  using the old answer for hours.
</p>
<table>
  <tr><th>DNS routing strategy</th><th>Mechanism</th><th>Reach for this when…</th></tr>
  <tr>
    <td>Multiple A records (round robin)</td>
    <td>Return several IPs; clients pick roughly at random</td>
    <td>You need crude spread across a handful of static endpoints and nothing better is available</td>
  </tr>
  <tr>
    <td>Weighted records</td>
    <td>Return IP A 95% of the time, IP B 5%</td>
    <td>Canary deploys and gradual migrations between stacks or providers</td>
  </tr>
  <tr>
    <td>GeoDNS / latency-based</td>
    <td>Answer depends on the resolver's location or measured latency</td>
    <td>Multi-region: send European users to the European stack, cutting 80-100 ms off every request</td>
  </tr>
  <tr>
    <td>Health-checked failover</td>
    <td>Provider probes endpoints and withdraws dead records</td>
    <td>Regional disaster recovery — accept that failover takes TTL plus stubborn-cache time</td>
  </tr>
  <tr>
    <td>Anycast</td>
    <td>One IP announced from many locations; BGP routes to the nearest</td>
    <td>What CDNs and large services actually use — failover in seconds, no client caching problem, but requires network-level infrastructure</td>
  </tr>
</table>
<p class="sub">
  So DNS <em>is</em> a load balancer, but a bad one: it balances resolvers
  rather than requests, it can't see that a server is at 99% CPU, it can't
  do per-request decisions, and its failover is measured in minutes. It is the
  right tool for coarse geographic steering and the wrong tool for anything
  reactive.
</p>
<div class="warn">
  <span class="ttl">⚠ "We'll just lower the TTL to 30 seconds and fail over"</span>
  This is the most common wrong answer about DNS in an interview. Aggressive
  TTLs help, but a meaningful fraction of clients — corporate resolvers, some
  mobile stacks, anything with a broken cache — will keep hammering the dead
  IP well past it. If failover must be fast, the address must stay the same:
  anycast, a virtual IP that moves, or a load balancer in front.
</div>

<h3>TCP and TLS: the cost of a cold connection</h3>
<p>
  With an IP in hand the client still cannot send a byte of HTTP. TCP needs a
  three-way handshake (one round trip before the client can send data), and
  TLS needs its own negotiation on top: two round trips in TLS 1.2, one in TLS
  1.3, and zero on resumption if you accept the replay risk of 0-RTT data.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="A sequence diagram showing the three round trips before the first byte of a web page arrives: the TCP three way handshake, the TLS one point three handshake, and finally the HTTP request and response">
    <g class="rough">
      <path class="ln dash" d="M100,40 L100,238" />
      <path class="ln dash" d="M540,40 L540,238" />
      <path class="ln"  d="M100,62 L540,76" />
      <path class="lng" d="M540,90 L100,104" />
      <path class="ln"  d="M100,118 L540,132" />
      <path class="lng" d="M540,146 L100,160" />
      <path class="ln"  d="M100,174 L540,188" />
      <path class="lng" d="M540,202 L100,216" />
    </g>
    <text class="lbl" x="100" y="30" text-anchor="middle">client</text>
    <text class="lbl" x="540" y="30" text-anchor="middle">server</text>
    <text class="sm" x="320" y="60" text-anchor="middle">SYN</text>
    <text class="sm" x="320" y="88" text-anchor="middle">SYN-ACK</text>
    <text class="sm" x="320" y="116" text-anchor="middle">ACK + ClientHello (key share)</text>
    <text class="sm" x="320" y="144" text-anchor="middle">ServerHello + certificate + Finished</text>
    <text class="sm" x="320" y="172" text-anchor="middle">Finished + GET /feed</text>
    <text class="sm" x="320" y="200" text-anchor="middle">200 OK — first byte of HTML</text>
    <text class="sm" x="12" y="86">1 RTT</text>
    <text class="sm" x="12" y="102">TCP</text>
    <text class="sm" x="12" y="142">1 RTT</text>
    <text class="sm" x="12" y="158">TLS 1.3</text>
    <text class="sm" x="12" y="198">1 RTT</text>
    <text class="sm" x="12" y="214">HTTP</text>
    <text class="lbl" x="20" y="262" style="font-size:15px">Three round trips before any content. Same datacenter: ~1.5 ms.</text>
    <text class="lbl rd" x="20" y="284" style="font-size:15px">New York to Sydney at 200 ms RTT: 600 ms of pure handshake.</text>
  </svg>
  <figcaption>Round trips, not bandwidth, dominate first-byte latency on long paths. Every technique that helps — keep-alive, TLS session resumption, QUIC, terminating TLS at an edge PoP — is a way to delete one of these arrows.</figcaption>
</figure>
<p>
  Two design consequences follow directly. First, <b>connection reuse is not
  an optimisation, it's the baseline</b>: HTTP keep-alive, connection pools in
  your service-to-service clients, and pooled database connections all exist
  to amortise this cost. A service that opens a fresh TLS connection per
  request has added several RTTs and a public-key operation to every call.
  Second, <b>terminating TLS close to the user matters enormously</b>. A CDN
  PoP 10 ms from the user absorbs the handshake round trips locally and reuses
  a warm connection back to origin, which is often a bigger win than caching
  the content itself.
</p>

<h3>HTTP/1.1 vs HTTP/2 vs HTTP/3, at the level that changes a design</h3>
<table>
  <tr><th></th><th>HTTP/1.1</th><th>HTTP/2</th><th>HTTP/3</th></tr>
  <tr><td>Transport</td><td>TCP, one request in flight per connection</td><td>TCP, many streams multiplexed on one connection</td><td>QUIC over UDP, streams are independent</td></tr>
  <tr><td>Head-of-line blocking</td><td>At the HTTP layer — a slow response blocks the connection</td><td>Fixed at HTTP layer, still present at TCP layer: one lost packet stalls every stream</td><td>Gone — a lost packet stalls only its own stream</td></tr>
  <tr><td>Handshake</td><td>TCP + TLS, 2-3 RTT</td><td>Same</td><td>1 RTT combined, 0-RTT on resumption</td></tr>
  <tr><td>Headers</td><td>Plain text, repeated in full every request</td><td>HPACK compression</td><td>QPACK compression</td></tr>
  <tr><td>Connection migration</td><td>Breaks on network change</td><td>Breaks on network change</td><td>Survives a Wi-Fi to cellular switch via connection ID</td></tr>
  <tr><td>Reach for this when…</td><td>Simple internal service-to-service; still the default for many proxies to origin</td><td>Default for browser traffic and gRPC; many small resources over one connection</td><td>Lossy or mobile networks, and latency-sensitive global traffic — the win grows with packet loss</td></tr>
</table>
<p>
  The practical fallout you should be able to state: because HTTP/1.1 allows
  one outstanding request per connection, browsers open about six connections
  per origin, and the old trick of "domain sharding" existed to buy more. On
  HTTP/2 that trick is actively harmful — it defeats multiplexing and header
  compression and multiplies handshakes. And HTTP/2's remaining weakness is
  real: multiplexing many streams over one TCP connection means one dropped
  packet stalls all of them, which is exactly the case QUIC was built to fix.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Browser to edge I'd run HTTP/3
  with HTTP/2 fallback — our users are mobile and packet loss is where QUIC
  pays. Edge to origin I'd keep long-lived HTTP/2 connections so the origin
  isn't paying handshake cost per request. Internally, gRPC over HTTP/2 for
  the streaming and header compression."
</div>

<h3>Load balancer, reverse proxy, API gateway</h3>
<p>
  These overlap enough that candidates use them interchangeably and get
  caught. A <b>reverse proxy</b> is any server that accepts a client
  connection and makes its own request to a backend on the client's behalf; a
  <b>load balancer</b> is a reverse proxy whose defining job is distributing
  across many backends; an <b>API gateway</b> is an L7 reverse proxy that
  additionally owns cross-cutting concerns — authentication, rate limiting,
  request shaping, per-route policy. One box often does all three.
</p>
<table>
  <tr><th></th><th>L4 (transport)</th><th>L7 (application)</th></tr>
  <tr><td>Sees</td><td>IPs, ports, TCP connections</td><td>Full HTTP: method, path, headers, cookies, body</td></tr>
  <tr><td>Can do</td><td>Connection-level distribution, extremely high throughput, near-zero added latency</td><td>Path and header routing, TLS termination, retries, rate limiting, request rewriting, sticky sessions, per-request balancing</td></tr>
  <tr><td>Cost</td><td>Blind to application health and to individual requests on a long-lived connection</td><td>More CPU, added latency (typically well under a millisecond), and it must hold the TLS keys</td></tr>
  <tr><td>Reach for this when…</td><td>Raw TCP services, databases, extreme packet rates, or you want the backend to see the real client TLS</td><td>Essentially all HTTP traffic — the routing and observability are worth the overhead</td></tr>
</table>
<p>
  Beyond distribution, the load balancer is where three other things live, and
  naming them unprompted is a strong signal: <b>health checks</b> (active
  probes plus passive outlier ejection when a backend starts erroring),
  <b>TLS termination</b>, and <b>the balancing algorithm itself</b>. Round
  robin is fine when every request costs the same; least-outstanding-requests
  is materially better when they don't, because it routes away from a backend
  that has quietly become slow. Consistent hashing is the choice when backends
  hold a warm per-key cache and you want the same key to land on the same node.
</p>
<div class="warn">
  <span class="ttl">⚠ Don't draw one load balancer box and move on</span>
  A single load balancer is a single point of failure, and the interviewer
  will ask. The real answer is a pair or a fleet behind a floating virtual IP
  or an anycast address, health-checked, with the DNS record pointing at the
  address rather than any individual machine. It is also worth saying that a
  managed L7 balancer scales itself, but its connection and rules limits are
  real quotas you should know exist.
</div>

<h3>Statelessness is the property everything else is built on</h3>
<p>
  A stateless app server is one where any request can be served correctly by
  any instance, because no request depends on memory left behind by a previous
  request on that same box. Every request carries or fetches everything it
  needs. That single property is what makes horizontal scaling, rolling
  deploys, autoscaling, and instance failure all boring — you can add, remove,
  or kill a server without anyone noticing.
</p>
<p>
  Statelessness does not mean the system has no state. It means the state has
  been moved somewhere purpose-built: a database, a cache, a blob store, or
  the client itself. The interview question is always <em>where did you put
  it</em>.
</p>
<table>
  <tr><th>Where session state lives</th><th>Cost</th><th>Reach for this when…</th></tr>
  <tr>
    <td>In app server memory + sticky sessions</td>
    <td>Losing a node logs users out; deploys are disruptive; load skews toward whichever node holds the busy users; autoscaling barely helps</td>
    <td>Almost never in a new design — know it mainly so you can explain why you rejected it</td>
  </tr>
  <tr>
    <td>Shared session store (Redis, Memcached)</td>
    <td>One extra network hop (~0.5 ms) per request; the store becomes a dependency you must make highly available</td>
    <td>You need server-side revocation, large session payloads, or session data that changes mid-session</td>
  </tr>
  <tr>
    <td>Signed token in a cookie (JWT and friends)</td>
    <td>No lookup at all, but revocation is genuinely hard and every request pays the token size in bytes</td>
    <td>Read-mostly identity claims with short expiry, plus a refresh token you <em>can</em> revoke server-side</td>
  </tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "The app tier is stateless —
  session lives in Redis, uploads go straight to object storage, and anything
  in process memory is a cache that can be dropped. That means the load
  balancer can use plain least-outstanding-requests, I can autoscale on CPU,
  and losing an instance costs us the in-flight requests only."
</div>

<h3>Numbers every engineer should know</h3>
<p>
  You will be asked to justify a latency budget, and the justification has to
  be built from components. Memorise the orders of magnitude, not the digits.
  The single most useful mental jump is that each of these tiers is roughly
  100x apart: nanoseconds in cache, microseconds in memory and SSD,
  milliseconds on the network, hundreds of milliseconds across the planet.
</p>
<table>
  <tr><th>Operation</th><th>Time</th><th>What it means for you</th></tr>
  <tr><td>L1 cache reference</td><td>~1 ns</td><td>Free; never a design consideration</td></tr>
  <tr><td>Branch mispredict</td><td>~3 ns</td><td>Free</td></tr>
  <tr><td>Mutex lock/unlock</td><td>~20 ns</td><td>Contention, not the lock itself, is what hurts</td></tr>
  <tr><td>Main memory reference</td><td>~100 ns</td><td>An in-process cache hit is ~1000x faster than a network cache hit</td></tr>
  <tr><td>Read 1 MB sequentially from memory</td><td>~3 µs</td><td>Serialisation and copying usually cost more than the read</td></tr>
  <tr><td>SSD random read</td><td>~16-100 µs</td><td>A cache miss to local NVMe is survivable; to a remote DB it is not</td></tr>
  <tr><td>Round trip in the same datacenter</td><td>~0.5 ms</td><td>Every internal service hop costs this <em>at minimum</em> — this is why chatty microservices die</td></tr>
  <tr><td>Redis GET over the network</td><td>~0.2-1 ms</td><td>Dominated by the round trip, not by Redis</td></tr>
  <tr><td>Simple indexed DB query, warm</td><td>~1-10 ms</td><td>Your typical read-path floor</td></tr>
  <tr><td>HDD seek</td><td>~2-10 ms</td><td>Why random I/O on spinning disks shaped a generation of storage design</td></tr>
  <tr><td>Cross-region RTT (US East to US West)</td><td>~60-70 ms</td><td>One synchronous cross-country call blows a 100 ms budget on its own</td></tr>
  <tr><td>Cross-continent RTT (US East to Europe)</td><td>~80-100 ms</td><td>Speed of light in fibre, not an engineering problem you can optimise</td></tr>
  <tr><td>Cross-planet RTT (US to Singapore/Sydney)</td><td>~200-250 ms</td><td>Multi-region read-local architecture is mandatory, not a nice-to-have</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The budget arithmetic that wins arguments</span>
  For a 200 ms p99 page load with a user 80 ms away: 80 ms is gone to the
  network round trip before your code runs. Handshakes take more unless the
  connection is warm. That leaves you well under 100 ms of server time —
  enough for one cache hit plus one database query, or about five sequential
  internal service hops. Sequential dependencies, not slow code, are what
  usually eat the budget.
</div>
<p class="sub">
  Note that the speed of light in fibre is about 200,000 km/s, so New York to
  London (5,600 km) has a physical floor near 56 ms round trip; real paths run
  1.5-2x that. When you say "we cannot make this call synchronous across
  regions", you are citing physics, and interviewers recognise the difference
  between that and an opinion.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Any prompt with a latency target ("under 200 ms p99") is asking you to build a budget out of the table above — say where the milliseconds go before proposing optimisations</li>
  <li>"Users are global" means the physics number, ~100-250 ms RTT, is now in every request; the design answer is edge termination and read-local replicas, not faster servers</li>
  <li>If a component holds per-user state in memory, the interviewer will ask what happens when it restarts — decide up front whether that state is durable, reconstructible, or genuinely disposable</li>
  <li>"How would you do a zero-downtime deploy / autoscale this?" is a statelessness question wearing a costume</li>
  <li>DNS is the answer for coarse geographic routing and gradual migrations; it is never the answer for fast failover or per-request balancing — an interviewer probing failover wants anycast or a floating VIP</li>
  <li>Distinguish bandwidth problems from round-trip problems: large media is a bandwidth and CDN problem, chatty APIs are a round-trip problem, and they have completely different fixes</li>
</ul>`,
};
