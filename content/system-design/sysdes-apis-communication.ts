import type { Chapter } from "../types";

export const sysdesApisCommunication: Chapter = {
  id: "sysdes-apis-communication",
  num: "B6",
  title: "APIs & communication",
  short: "APIs & communication",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle:
    "The API is the coupling surface — every round trip, every version and every retry is a design decision someone will live with for years.",
  body: `<h3>An API is not a format question, it is a coupling question</h3>
<p>
  Candidates treat "REST or GraphQL?" as a taste debate. It isn't. The API is
  the seam between teams that deploy independently, and the choice determines
  three things you cannot easily change later: <b>how many round trips a
  client needs</b>, <b>who has to redeploy when a field changes</b>, and
  <b>whether an intermediary can cache the response</b>. Everything else —
  JSON versus protobuf, verbs versus procedures — is downstream of those. The
  reason interviewers spend fifteen minutes here is that the answer reveals
  whether you have ever had to evolve an API that mobile clients from two
  years ago are still calling.
</p>
<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="A comparison of a chatty REST client making four sequential round trips across a slow mobile link versus a single aggregated request where the server fans out to four internal services over the fast datacenter network">
    <g class="rough">
      <path class="ln dash" d="M65,84 L65,240" />
      <path class="ln dash" d="M245,84 L245,240" />
      <path class="ln dash" d="M385,84 L385,240" />
      <path class="ln dash" d="M500,84 L500,240" />
      <path class="ln dash" d="M600,120 L600,200" />
      <path class="lnr" d="M65,102 L245,110" />
      <path class="lnr" d="M245,124 L65,132" />
      <path class="lnr" d="M65,146 L245,154" />
      <path class="lnr" d="M245,168 L65,176" />
      <path class="lnr" d="M65,190 L245,198" />
      <path class="lnr" d="M245,212 L65,220" />
      <path class="lng" d="M385,110 L500,116" />
      <path class="ln" d="M500,134 L600,134" />
      <path class="ln" d="M600,146 L500,150" />
      <path class="ln" d="M500,162 L600,162" />
      <path class="ln" d="M600,174 L500,178" />
      <path class="lng" d="M500,206 L385,214" />
      <path class="ln dash" d="M320,20 L320,250" />
    </g>
    <g class="rough">
      <rect class="box"  x="20"  y="44" width="90" height="40" rx="6" />
      <rect class="boxy" x="200" y="44" width="90" height="40" rx="6" />
      <rect class="box"  x="340" y="44" width="90" height="40" rx="6" />
      <rect class="boxy" x="455" y="44" width="90" height="40" rx="6" />
      <rect class="box"  x="556" y="80" width="78" height="40" rx="6" />
    </g>
    <text class="lbl" x="160" y="30" text-anchor="middle">chatty client</text>
    <text class="lbl" x="470" y="30" text-anchor="middle">aggregated</text>
    <text class="sm" x="65"  y="68" text-anchor="middle">phone</text>
    <text class="sm" x="245" y="68" text-anchor="middle">API</text>
    <text class="sm" x="385" y="68" text-anchor="middle">phone</text>
    <text class="sm" x="500" y="68" text-anchor="middle">gateway</text>
    <text class="sm" x="600" y="104" text-anchor="middle">services</text>
    <text class="sm rd" x="155" y="240" text-anchor="middle">the 4th round trip is off-screen</text>
    <text class="sm" x="548" y="196" text-anchor="middle">~2 ms each</text>
    <text class="lbl rd" x="160" y="262" text-anchor="middle" style="font-size:15px">4 × 120 ms = 480 ms</text>
    <text class="lbl gr" x="470" y="262" text-anchor="middle" style="font-size:15px">120 ms + 8 ms = 128 ms</text>
  </svg>
  <figcaption>The dominant cost is the number of times you cross the slow link, not the bytes. Moving the fan-out from the phone to the datacenter is worth more than any serialisation format you could choose.</figcaption>
</figure>

<h3>REST vs gRPC vs GraphQL, at the system level</h3>
<table>
  <tr><th></th><th>REST / JSON over HTTP</th><th>gRPC / protobuf</th><th>GraphQL</th></tr>
  <tr><td>Coupling</td><td>Client couples to resource shapes and URL structure</td><td>Client couples to a generated stub; compatibility is a mechanical rule set (never reuse a field number)</td><td>Client declares the shape it wants; server owns the graph. Loosest client coupling of the three</td></tr>
  <tr><td>Over-fetching</td><td>Endemic. Every client gets the union of every client's needs</td><td>Same as REST unless you add field masks</td><td>Solved by construction — the client asks for four fields and gets four fields</td></tr>
  <tr><td>Round trips for a composite screen</td><td>One per resource, often sequential because of id dependencies</td><td>One per call; streaming can amortise</td><td>One, always</td></tr>
  <tr><td>Payload / CPU</td><td>Verbose text; parsing is measurable on low-end phones</td><td>3-10× smaller on the wire, materially cheaper to encode and decode</td><td>JSON, so REST-like, but you only ship what was asked for</td></tr>
  <tr><td>Intermediary caching</td><td>Free. URL + <code>Cache-Control</code> means CDNs and proxies work with no effort</td><td>None. Opaque bodies over HTTP/2 POST-like streams</td><td>Hard. Everything is <code>POST /graphql</code>; you need persisted queries served over GET to get any edge caching back</td></tr>
  <tr><td>Browser support</td><td>Native</td><td>Not native — needs grpc-web plus a translating proxy</td><td>Native</td></tr>
  <tr><td>Failure surface</td><td>HTTP status codes carry meaning</td><td>Rich status codes, deadlines that propagate across hops</td><td>HTTP 200 with an <code>errors</code> array — partial success is normal and your monitoring must understand it</td></tr>
  <tr><td>Reach for this when…</td><td>Public APIs, third-party integrations, anything cacheable at the edge, anything a stranger must integrate against from a doc page</td><td>Internal service-to-service calls where latency, payload size and strict contracts matter, and both ends are yours</td><td>Many diverse clients (iOS, Android, web, TV) over one domain graph, shipping on different release cadences</td></tr>
</table>
<p class="sub">
  The honest architecture at most large companies is all three at once: gRPC
  between internal services, a GraphQL or BFF layer for first-party clients,
  and REST at the public edge because that is what partners can integrate
  against without a codegen toolchain. Saying that — and saying <em>why each
  boundary picked what it picked</em> — is a stronger answer than defending
  one of them everywhere.
</p>
<div class="warn">
  <span class="ttl">⚠ GraphQL's two bills come due in production</span>
  First, the <b>N+1 resolver problem</b>: a query for 50 posts each with an
  author naively issues 1 + 50 database queries, because each resolver runs
  independently. The fix is per-request batching (DataLoader), and if you
  propose GraphQL without mentioning it, expect the follow-up. Second,
  <b>a client can write a query that costs you a datacenter</b> — deeply
  nested, wide-fanning, perfectly valid. You need query depth limits, static
  cost analysis with a budget per caller, and for first-party clients,
  persisted queries so only hashes of pre-approved documents are executable.
</div>

<h3>Versioning: you evolve an API, you rarely version it</h3>
<p>
  Every version you ship you maintain forever, because the client that stops
  calling <code>/v1</code> is the client that uninstalls the app. That makes
  <b>additive, backward-compatible evolution the default and a version bump
  the failure case</b>. The rules are boring and absolute: adding an optional
  field is safe; adding a required field, removing a field, renaming a field,
  narrowing a type, or changing the meaning of an existing value are all
  breaking, even when the tests pass.
</p>
<table>
  <tr><th>Approach</th><th>Mechanics</th><th>Cost</th><th>Reach for this when…</th></tr>
  <tr><td>Additive only</td><td>New optional fields; deprecate old ones with telemetry, never delete while used</td><td>Field sprawl and dead code</td><td>Always, as the baseline. Most "we need v2" is really "we need three more fields"</td></tr>
  <tr><td>URL version (<code>/v2/orders</code>)</td><td>Whole new surface, routed separately</td><td>You now run two implementations, or one with branching</td><td>A genuine model change — the resource means something different now</td></tr>
  <tr><td>Header / media-type version</td><td><code>Accept: application/vnd.acme.v2+json</code></td><td>Invisible in logs and caches unless you add <code>Vary</code>; harder for partners to use</td><td>Internal APIs where clean URLs matter and clients are sophisticated</td></tr>
  <tr><td>Field-level evolution (protobuf)</td><td>Numbered fields, all optional; readers ignore unknowns</td><td>Requires discipline: a reused field number is silent data corruption</td><td>gRPC internals — this is the mechanism that lets thousands of services skew by months</td></tr>
  <tr><td>Expand / contract migration</td><td>Write both old and new fields, migrate readers, then stop writing the old one</td><td>Three deploys and a waiting period per change</td><td>Any rename or reshape in a system with independently deployed clients</td></tr>
</table>
<p>
  Mobile is what makes this hard, and it is worth saying explicitly because it
  reframes the whole discussion. A web client is whatever you deployed thirty
  seconds ago. A mobile client is a distribution: an app-store rollout takes
  days, adoption tails for months, and some non-trivial slice of users never
  updates. So the design constraints are (1) the server must tolerate every
  client version simultaneously, forever, (2) you need per-version telemetry
  to know when a field is genuinely dead, and (3) a server-driven kill switch
  or forced-upgrade path is a feature you should have shipped in v1.
</p>

<h3>Sync vs async: when a call should have been an event</h3>
<p>
  A synchronous call says "wait here while I do this, and while everything I
  depend on does its part." That is the right shape when the user's next
  action depends on the result. It is the wrong shape far more often than
  people write it.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A checkout request that synchronously calls payment, email, analytics, warehouse and loyalty services taking 830 milliseconds with five hard dependencies, compared with a version that only calls payment synchronously and publishes an event that four consumers process independently">
    <g class="rough">
      <path class="lnr" d="M64,64 L64,88" />
      <path class="lnr" d="M64,112 L64,136" />
      <path class="lnr" d="M64,160 L64,184" />
      <path class="ln" d="M112,100 L152,100" />
      <path class="ln" d="M112,148 L152,148" />
      <path class="ln" d="M112,196 L152,196" />
      <path class="lng" d="M420,64 L420,88" />
      <path class="lng" d="M420,112 L420,136" />
      <path class="ln dash" d="M468,150 L520,110" />
      <path class="ln dash" d="M468,152 L520,146" />
      <path class="ln dash" d="M468,154 L520,182" />
      <path class="ln dash" d="M468,156 L520,218" />
      <path class="ln dash" d="M320,16 L320,244" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="30"  width="96" height="34" rx="6" />
      <rect class="boxy" x="16"  y="88"  width="96" height="24" rx="4" />
      <rect class="boxr" x="16"  y="136" width="96" height="24" rx="4" />
      <rect class="boxr" x="16"  y="184" width="96" height="24" rx="4" />
      <rect class="box"  x="372" y="30"  width="96" height="34" rx="6" />
      <rect class="boxy" x="372" y="88"  width="96" height="24" rx="4" />
      <rect class="boxg" x="372" y="136" width="96" height="24" rx="4" />
      <rect class="boxg" x="520" y="96"  width="104" height="26" rx="4" />
      <rect class="boxg" x="520" y="132" width="104" height="26" rx="4" />
      <rect class="boxg" x="520" y="168" width="104" height="26" rx="4" />
      <rect class="boxg" x="520" y="204" width="104" height="26" rx="4" />
    </g>
    <text class="lbl" x="120" y="22" text-anchor="middle">everything synchronous</text>
    <text class="lbl" x="470" y="22" text-anchor="middle">one sync hop, four events</text>
    <text class="sm" x="64" y="52" text-anchor="middle">checkout</text>
    <text class="sm" x="64" y="105" text-anchor="middle">charge 250 ms</text>
    <text class="sm rd" x="64" y="153" text-anchor="middle">email 180 ms</text>
    <text class="sm rd" x="64" y="201" text-anchor="middle">warehouse 300 ms</text>
    <text class="sm" x="180" y="104" text-anchor="middle">hard dep</text>
    <text class="sm" x="180" y="152" text-anchor="middle">hard dep</text>
    <text class="sm" x="180" y="200" text-anchor="middle">hard dep</text>
    <text class="sm" x="420" y="52" text-anchor="middle">checkout</text>
    <text class="sm" x="420" y="105" text-anchor="middle">charge 250 ms</text>
    <text class="sm gr" x="420" y="153" text-anchor="middle">publish event</text>
    <text class="sm" x="572" y="113" text-anchor="middle">email</text>
    <text class="sm" x="572" y="149" text-anchor="middle">analytics</text>
    <text class="sm" x="572" y="185" text-anchor="middle">warehouse</text>
    <text class="sm" x="572" y="221" text-anchor="middle">loyalty</text>
    <text class="lbl rd" x="150" y="250" text-anchor="middle" style="font-size:14px">830 ms · 0.999^5 = 99.50%</text>
    <text class="lbl gr" x="470" y="250" text-anchor="middle" style="font-size:14px">252 ms · 0.999^1 = 99.90%</text>
  </svg>
  <figcaption>Moving four calls off the request path cut latency 3.3× and removed four dependencies from the availability product. Nothing got faster — the work simply stopped happening while the user waited.</figcaption>
</figure>
<p>
  Four symptoms tell you a request/response call should have been an event:
</p>
<ul>
  <li><b>The caller ignores the response.</b> If the return value is discarded, or wrapped in a try/catch that swallows the error, you have written an event with extra steps and worse failure semantics.</li>
  <li><b>New consumers force a producer change.</b> When "also notify the loyalty service" means editing checkout, the coupling is backwards. Publishing <code>order.placed</code> once and letting consumers subscribe is the entire point.</li>
  <li><b>The callee's availability became yours.</b> Every synchronous hop enters the availability product. Five three-nines dependencies in series cap you at 99.50% before you write any of your own code.</li>
  <li><b>The work outlives the request budget.</b> Video transcoding, PDF generation, bulk import. Return <code>202 Accepted</code> with a status URL, and let the client poll or subscribe.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd keep the payment
  authorisation synchronous, because the user has to be told yes or no before
  they leave the page. Everything else — receipt email, analytics, warehouse
  pick, loyalty points — becomes an <code>order.placed</code> event. That
  takes checkout from 830 ms and five hard dependencies down to 250 ms and
  one, and adding a sixth consumer later doesn't touch the checkout service
  at all."
</div>
<p class="sub">
  Then say the cost, unprompted, or you sound naive: asynchronous means
  at-least-once delivery, so consumers must be idempotent; it means ordering
  is only guaranteed within a partition key; it means the user's receipt now
  arrives "soon" rather than "now" and someone in product has to agree to
  that; and it means debugging a broken flow requires distributed tracing
  rather than a stack trace.
</p>

<h3>Real-time transports: the decision table you will need</h3>
<p>
  Nearly every real-time design question — chat, notifications, live scores,
  collaborative editing, order tracking — bottoms out in this choice. Do the
  arithmetic before picking. <b>One million clients short-polling every five
  seconds is 200,000 requests per second</b>, and if only 2% of polls have
  anything to return, 196,000 of those per second are pure overhead: TLS,
  headers, auth, a database lookup, and a 204.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="Four sequence diagrams comparing short polling with repeated empty round trips, long polling with held requests, server-sent events with one request and many server pushes, and WebSockets with bidirectional frames after a single upgrade">
    <g class="rough">
      <path class="ln dash" d="M28,70 L28,244" />
      <path class="ln dash" d="M132,70 L132,244" />
      <path class="ln dash" d="M188,70 L188,244" />
      <path class="ln dash" d="M292,70 L292,244" />
      <path class="ln dash" d="M348,70 L348,244" />
      <path class="ln dash" d="M452,70 L452,244" />
      <path class="ln dash" d="M508,70 L508,244" />
      <path class="ln dash" d="M612,70 L612,244" />
      <path class="lnr" d="M28,86 L132,90" />
      <path class="ln"  d="M132,100 L28,104" />
      <path class="lnr" d="M28,124 L132,128" />
      <path class="ln"  d="M132,138 L28,142" />
      <path class="lnr" d="M28,162 L132,166" />
      <path class="ln"  d="M132,176 L28,180" />
      <path class="lnr" d="M28,200 L132,204" />
      <path class="lng" d="M132,214 L28,218" />
      <path class="lnr" d="M188,86 L292,90" />
      <path class="lng" d="M292,150 L188,154" />
      <path class="lnr" d="M188,168 L292,172" />
      <path class="ln"  d="M292,230 L188,234" />
      <path class="lnr" d="M348,86 L452,90" />
      <path class="lng" d="M452,118 L348,122" />
      <path class="lng" d="M452,152 L348,156" />
      <path class="lng" d="M452,186 L348,190" />
      <path class="lng" d="M452,220 L348,224" />
      <path class="lnr" d="M508,86 L612,90" />
      <path class="lng" d="M612,118 L508,122" />
      <path class="lng" d="M508,146 L612,150" />
      <path class="lng" d="M612,178 L508,182" />
      <path class="lng" d="M508,206 L612,210" />
      <path class="lng" d="M612,232 L508,236" />
    </g>
    <text class="lbl" x="80"  y="24" text-anchor="middle">short poll</text>
    <text class="lbl" x="240" y="24" text-anchor="middle">long poll</text>
    <text class="lbl" x="400" y="24" text-anchor="middle">SSE</text>
    <text class="lbl" x="560" y="24" text-anchor="middle">WebSocket</text>
    <text class="sm" x="80"  y="44" text-anchor="middle">ask, mostly nothing</text>
    <text class="sm" x="240" y="44" text-anchor="middle">ask, server holds</text>
    <text class="sm" x="400" y="44" text-anchor="middle">one stream, down only</text>
    <text class="sm" x="560" y="44" text-anchor="middle">frames, both ways</text>
    <text class="sm" x="80"  y="64" text-anchor="middle">client · server</text>
    <text class="sm" x="240" y="64" text-anchor="middle">client · server</text>
    <text class="sm" x="400" y="64" text-anchor="middle">client · server</text>
    <text class="sm" x="560" y="64" text-anchor="middle">client · server</text>
    <text class="sm rd" x="80"  y="268" text-anchor="middle">4 trips, 3 empty</text>
    <text class="sm" x="240" y="268" text-anchor="middle">2 trips, 0 empty</text>
    <text class="sm gr" x="400" y="268" text-anchor="middle">1 trip, 4 pushes</text>
    <text class="sm gr" x="560" y="268" text-anchor="middle">1 upgrade, then free</text>
    <text class="sm" x="320" y="290" text-anchor="middle">the cost moves from requests per second to open sockets held per box</text>
  </svg>
  <figcaption>Moving right along this row trades request volume for connection state. That is the actual decision: you are choosing whether your scaling problem is QPS or file descriptors.</figcaption>
</figure>
<table>
  <tr><th>Transport</th><th>Direction</th><th>Server cost at 1M clients</th><th>Real cost</th><th>Reach for this when…</th></tr>
  <tr><td><b>Short polling</b></td><td>Client pulls</td><td>200k rps at a 5 s interval, ~98% empty</td><td>Wasted capacity and up to 5 s of staleness</td><td>Updates are rare, latency tolerance is tens of seconds, and you want zero new infrastructure. Genuinely fine for "check order status"</td></tr>
  <tr><td><b>Long polling</b></td><td>Client pulls, server holds</td><td>1M held requests plus a re-request every ~30 s timeout</td><td>Ties up a request slot per client; needs async server I/O or your thread pool dies</td><td>You need push semantics but must traverse hostile proxies and ancient clients. The compatibility fallback, not the target</td></tr>
  <tr><td><b>SSE</b></td><td>Server pushes, one way</td><td>1M open HTTP responses; a tuned box holds 100-500k</td><td>No client→server channel on that stream; older HTTP/1.1 stacks cap 6 connections per origin</td><td>Feeds, notifications, live scores, LLM token streaming — anything where the client only listens. Auto-reconnect and <code>Last-Event-ID</code> replay come free</td></tr>
  <tr><td><b>WebSocket</b></td><td>Full duplex</td><td>Same socket cost as SSE, plus connection-to-server routing</td><td>You leave HTTP behind: your own framing, auth refresh, heartbeats, reconnect and backpressure. Deploys disconnect everyone at once</td><td>Genuinely bidirectional and chatty: chat, multiplayer, collaborative editing, trading. Not "we might want push someday"</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ WebSockets make your stateless tier stateful</span>
  A connected socket lives on one specific process. To deliver a message to
  user 7 you must know which box holds their socket — so you need a presence
  registry (user → connection → node) and a way to route a message to that
  node, usually a pub/sub fan-out where every node subscribes to the channels
  its connections care about. You also inherit sticky load balancing,
  connection draining on deploy, and a reconnect storm every time you roll
  the fleet: 1M clients reconnecting with no jitter is a self-inflicted DDoS.
  Choose WebSockets because you need duplex, not because they sound modern.
</div>

<h3>Idempotency keys, and retries that don't multiply</h3>
<p>
  Any call that times out has three possible truths: it never arrived, it
  arrived and failed, or <b>it arrived and succeeded and you lost the
  response</b>. The client cannot tell them apart, so it retries, so every
  mutating endpoint must be safe to call twice. <code>GET</code>,
  <code>PUT</code> and <code>DELETE</code> are naturally idempotent.
  <code>POST /payments</code> is not, and that is where the money is.
</p>
<p>
  The mechanism: the client generates a key per <em>logical operation</em> —
  not per attempt — and sends it as a header. The server makes the key part of
  the transaction.
</p>
<pre><code>BEGIN;
  <span class="c">-- UNIQUE (account_id, idempotency_key). This insert is the lock.</span>
  INSERT INTO idempotency (account_id, key, request_hash, state)
  VALUES ($1, $2, $3, 'in_progress');   <span class="c">-- duplicate → unique violation</span>

  <span class="c">-- the real work, in the SAME transaction, so it can never</span>
  <span class="c">-- happen without the key being recorded, or vice versa</span>
  INSERT INTO payments (...) VALUES (...);

  UPDATE idempotency SET state = 'done', response = $4 WHERE key = $2;
COMMIT;</code></pre>
<p>
  Three details separate a working implementation from a plausible-sounding
  one, and interviewers probe all three:
</p>
<ul>
  <li><b>Bind the key to the request.</b> Store a hash of the body. If the same key arrives with a different body, that is a client bug — return <code>422</code>, never silently replay the old response or, worse, execute the new one.</li>
  <li><b>Handle the concurrent duplicate.</b> The retry may arrive while the original is still running. The unique constraint rejects it, and the correct response is <code>409 in progress</code> so the client backs off — not a wait, which converts one slow request into two held connections.</li>
  <li><b>Give keys a lifetime and say what it is.</b> 24 hours to 7 days is typical. After that the record is reaped and a replayed request would execute again — which is fine, because no sane client retries a day later, but you should be the one to point that out.</li>
</ul>
<p class="sub">
  Retry hygiene is the other half. Retry only on timeouts, connection errors,
  <code>429</code> and <code>5xx</code> — never on <code>4xx</code>, which
  will fail identically forever. Use exponential backoff with <em>full
  jitter</em>, cap attempts, and add a retry budget (abort retrying entirely
  if retries exceed ~10% of requests) so a struggling dependency doesn't
  receive 4× traffic at its worst moment. Honour <code>Retry-After</code>. And
  remember that every layer that retries multiplies: a client retrying 3× in
  front of a gateway retrying 3× in front of a service retrying 3× turns one
  user action into 27 backend calls. <b>Retry at one layer, not every layer.</b>
</p>

<h3>Pagination: why offset breaks and cursors don't</h3>
<p>
  <code>LIMIT 20 OFFSET 100000</code> does not skip 100,000 rows — the engine
  <em>reads and discards</em> 100,020 rows to hand you 20. Cost grows linearly
  with page depth: page 1 is a sub-millisecond index read, page 5,000 is
  hundreds of milliseconds and climbing, and a crawler walking to page 50,000
  is an accidental denial-of-service you built yourself.
</p>
<p>
  The correctness problem is worse than the performance one, because it is
  silent. Offsets address <em>positions</em>, and positions shift. On a feed
  where new rows arrive constantly, three items inserted between the user
  fetching page 1 and page 2 pushes three items they already saw onto page 2 —
  guaranteed duplicates. A deletion does the reverse and silently skips items.
  Every infinite scroll that repeats posts is this bug.
</p>
<table>
  <tr><th></th><th>Offset / limit</th><th>Cursor (keyset)</th></tr>
  <tr><td>Query</td><td><code>ORDER BY created_at DESC LIMIT 20 OFFSET n</code></td><td><code>WHERE (created_at, id) &lt; ($1, $2) ORDER BY created_at DESC, id DESC LIMIT 20</code></td></tr>
  <tr><td>Cost per page</td><td>O(offset + limit) — degrades with depth</td><td>O(log n + limit) — identical on page 1 and page 50,000</td></tr>
  <tr><td>Stability under writes</td><td>Duplicates and skips whenever rows shift</td><td>Stable: the cursor names a row, not a position</td></tr>
  <tr><td>Jump to page 500</td><td>Trivially supported</td><td>Impossible by design</td></tr>
  <tr><td>Total count</td><td>Users expect one, and <code>COUNT(*)</code> on 500M rows is a scan</td><td>Usually omitted, or an estimate from table statistics</td></tr>
  <tr><td>Requires</td><td>A stable sort</td><td>A <em>unique</em> total ordering — always append the primary key as a tiebreaker or duplicate timestamps will drop rows</td></tr>
  <tr><td>Reach for this when…</td><td>Small, bounded, human-browsed sets: an admin table of 400 rows, search results capped at 10 pages</td><td>Feeds, timelines, exports, event logs, any API a machine will walk end to end. This is the default for anything that grows</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">Make the cursor opaque</span>
  Return the cursor as a base64 blob and treat it as your private encoding.
  Clients will otherwise parse it, depend on it, and freeze your sort order
  forever. Sign it if it encodes anything a caller could forge into scanning
  data they shouldn't see.
</div>

<h3>API gateways: what belongs there and what emphatically doesn't</h3>
<p>
  A gateway is the one place every request passes through, which makes it the
  correct home for concerns that are identical for every request — and a
  catastrophic home for anything else, because it is also a single shared
  deployment across every team you have.
</p>
<table>
  <tr><th>Belongs at the gateway</th><th>Does not belong there</th></tr>
  <tr><td>TLS termination and certificate management</td><td>Business logic of any kind</td></tr>
  <tr><td>Authentication: validate the token once, inject a verified identity</td><td><b>Authorization decisions services then trust blindly</b> — services must re-check; the gateway is not a security boundary on its own</td></tr>
  <tr><td>Coarse rate limiting and quota enforcement per caller</td><td>Per-resource rules that need domain knowledge</td></tr>
  <tr><td>Routing, canary and blue/green traffic splits</td><td>Response aggregation with domain semantics — that's a BFF, and it should be a real service owned by the client team</td></tr>
  <tr><td>Trace-id injection, structured access logs, request size limits</td><td>Data transformation that changes when a product changes</td></tr>
  <tr><td>Protocol translation at the edge (REST in, gRPC out)</td><td>Anything whose change requires a gateway deploy to ship a feature</td></tr>
</table>
<p>
  Two consequences to state out loud. First, the gateway is on the critical
  path for 100% of traffic, so <b>its availability is the ceiling on
  everything behind it</b> — it must be horizontally scaled, multi-AZ, and
  boringly simple. Second, the moment teams start putting logic in it you have
  built a distributed monolith with a shared release train: forty teams
  queueing behind one config repo, and an outage in the gateway is an outage
  in every product. The BFF pattern is the escape hatch — one thin aggregation
  service per client type (iOS, web, partner), owned by the team that consumes
  it, so mobile's needs never distort the public API and vice versa.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The words "live", "real-time", "instant", "as soon as it happens" mean the interviewer wants the polling/long-poll/SSE/WebSocket decision — with the request-per-second arithmetic, not a preference. Ask first how stale is acceptable; "30 seconds" turns a WebSocket design into polling.</li>
  <li>"Mobile app" is a versioning and round-trip prompt. Say that old clients live forever, that you evolve additively, and that you would collapse the composite screen into one aggregated call.</li>
  <li>A naive design makes every internal call synchronous and never mentions timeouts, retries or idempotency — then designs a retry loop that quietly double-charges customers.</li>
  <li>Any mutating endpoint involving money, inventory or messages is an idempotency question in disguise. Volunteer the key before you're asked.</li>
  <li>"Show the user their history / feed / all their orders" with a large dataset is a cursor-pagination prompt. Offset in an interview reads as never having operated a table past a few million rows.</li>
  <li>Distinguish this from the <b>message queue</b> topic: this chapter is about the shape of a call between two parties; queues are about durability, ordering and buffering once you've decided the call should be asynchronous. Name the boundary and move on rather than re-deriving both.</li>
</ul>`,
};
