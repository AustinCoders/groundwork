import type { Chapter } from "../types";

export const sysdesObservabilityScale: Chapter = {
  id: "sysdes-observability-scale",
  num: "A5",
  title: "Observability at scale",
  short: "Observability at scale",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Metrics say something is wrong, traces say where, logs say what — and p99 says whether anyone noticed.",
  body: `<h3>Three pillars, three questions, one fixed order</h3>
<p>
  Observability is usually taught as a list of three data types, which is
  useless at a whiteboard. The useful framing is that each answers a
  <em>different question</em>, and during an incident you reach for them in a
  fixed order. <b>Metrics</b> answer "is something wrong, and since when?"
  <b>Traces</b> answer "where in the call graph is it wrong?" <b>Logs</b>
  answer "what exactly happened to the request that failed?" Run that order
  backwards and you spend the outage grepping. Interviewers ask about this
  because a design that cannot be debugged is not a finished design — and
  because the candidate who says "and here is how I'd know it broke" is
  visibly a different animal from one who draws boxes and stops.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="Three application services emit telemetry to a collector agent, which writes into a metrics time-series database, a log store and a trace store; only the metrics store feeds the alerting and paging system">
    <g class="rough">
      <path class="ln" d="M112,47 L170,112" />
      <path class="ln" d="M112,117 L170,120" />
      <path class="ln" d="M112,187 L170,130" />
      <path class="ln" d="M258,112 L318,46" />
      <path class="ln" d="M258,120 L318,122" />
      <path class="ln" d="M258,130 L318,196" />
      <path class="lnr" d="M450,46 L524,114" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="26"  width="96"  height="42" rx="6" />
      <rect class="box"  x="16"  y="96"  width="96"  height="42" rx="6" />
      <rect class="box"  x="16"  y="166" width="96"  height="42" rx="6" />
      <rect class="boxy" x="170" y="96"  width="88"  height="48" rx="6" />
      <rect class="boxg" x="318" y="24"  width="132" height="44" rx="6" />
      <rect class="box"  x="318" y="100" width="132" height="44" rx="6" />
      <rect class="box"  x="318" y="176" width="132" height="44" rx="6" />
      <rect class="boxr" x="524" y="100" width="100" height="44" rx="6" />
    </g>
    <text class="sm" x="64"  y="51"  text-anchor="middle">api gateway</text>
    <text class="sm" x="64"  y="121" text-anchor="middle">feed service</text>
    <text class="sm" x="64"  y="191" text-anchor="middle">ranking svc</text>
    <text class="sm" x="214" y="116" text-anchor="middle">collector</text>
    <text class="sm" x="214" y="133" text-anchor="middle">(sidecar agent)</text>
    <text class="sm" x="384" y="51"  text-anchor="middle">metrics — TSDB</text>
    <text class="sm" x="384" y="82"  text-anchor="middle">13 months, cheap</text>
    <text class="sm" x="384" y="127" text-anchor="middle">logs — object store</text>
    <text class="sm" x="384" y="158" text-anchor="middle">14 days, expensive</text>
    <text class="sm" x="384" y="203" text-anchor="middle">traces</text>
    <text class="sm" x="384" y="234" text-anchor="middle">7 days, sampled</text>
    <text class="sm rd" x="574" y="118" text-anchor="middle">alerting</text>
    <text class="sm rd" x="574" y="135" text-anchor="middle">pager</text>
  </svg>
  <figcaption>Notice the one red arrow: only metrics drive the pager. Logs and traces are for the human who has already been woken up — paging off a log line is how you build an alert nobody trusts.</figcaption>
</figure>

<h3>The three pillars, priced</h3>
<table>
  <tr><th>Pillar</th><th>Question it answers</th><th>Shape</th><th>Cost driver</th><th>Typical retention</th><th>How it fails you</th></tr>
  <tr>
    <td>Metrics</td>
    <td>Is something wrong, and when did it start?</td>
    <td>Numeric time series, fixed label set, pre-aggregated at write</td>
    <td>Unique time series (cardinality), not event count</td>
    <td>13-15 months (downsampled)</td>
    <td>Tells you the error rate is 4%. Cannot tell you which 4%.</td>
  </tr>
  <tr>
    <td>Logs</td>
    <td>What exactly happened to this one request?</td>
    <td>Semi-structured records, unbounded fields</td>
    <td>Bytes ingested and indexed — roughly $0.30-$1.00 per GB on managed platforms</td>
    <td>7-30 days hot, then cold storage</td>
    <td>Volume. At real scale you cannot afford to keep them all, so the one you needed was sampled away.</td>
  </tr>
  <tr>
    <td>Traces</td>
    <td>Where in the call graph did the latency go?</td>
    <td>A tree of timed spans sharing a trace id</td>
    <td>Spans retained — so almost always sampled at 0.1%-10%</td>
    <td>3-14 days</td>
    <td>Head-based sampling throws away the slow trace before it knows it was slow.</td>
  </tr>
</table>
<p class="sub">
  A fourth thing is worth naming because senior candidates do:
  <b>events</b> — a durable, structured record of a business fact (order
  placed, payment captured). Those are not telemetry, they belong in the same
  queue infrastructure as everything else in the message-queue chapter, and
  they are the thing you reconcile against when metrics and reality disagree.
</p>

<h3>Averages lie, and they lie in the direction that hurts</h3>
<p>
  A mean latency is a single number summarising a distribution that is never
  symmetric. Request latency is always right-skewed: it has a hard floor (you
  cannot be faster than the network) and no ceiling (a lock, a GC pause, a
  cold cache, a retry). Averaging a floor with a fat tail produces a number
  that describes no actual user. Worse, the mean is dominated by the tail it
  is hiding — you can double your p99 and barely move the mean.
</p>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="A right-skewed latency distribution curve with dashed vertical markers at p50 of 120 milliseconds, the mean at 205 milliseconds and p99 at 1.9 seconds far out in the tail">
    <g class="rough">
      <path class="ln" d="M56,200 L616,200" />
      <path class="ln" d="M56,198 C92,198 116,54 152,52 C188,50 206,114 244,146 C300,186 400,195 616,197" />
      <path class="ln dash" d="M176,36 L176,200" />
      <path class="ln dash" d="M240,36 L240,200" />
      <path class="lnr dash" d="M492,36 L492,200" />
    </g>
    <text class="sm" x="176" y="222" text-anchor="middle">p50 · 120 ms</text>
    <text class="sm" x="252" y="244" text-anchor="middle">mean · 205 ms</text>
    <text class="sm rd" x="492" y="222" text-anchor="middle">p99 · 1.9 s</text>
    <text class="sm" x="610" y="222" text-anchor="end">latency →</text>
    <text class="lbl" x="56" y="268" style="font-size:14px">the mean sits between p50 and p75 and describes nobody;</text>
    <text class="lbl rd" x="56" y="286" style="font-size:14px">the users who churn are all living out past that red line</text>
  </svg>
  <figcaption>The mean is pulled right by the tail without ever reaching it. Report p50 for "typical", p99 for "worst thing a real person routinely experiences", and never report a mean latency as if it were a user experience.</figcaption>
</figure>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd set the SLO on p99, not
  average. Average latency is a number that improves when your slowest users
  give up and leave — p99 is the number that tracks whether the product feels
  broken."
</div>

<h3>Fan-out: why p99 per service is not p99 per user</h3>
<p>
  Here is the arithmetic that separates people who have run a distributed
  system from people who have read about one. A user request that touches
  10 backend services is only fast if <em>all ten</em> were fast. If each
  service independently has a 1% chance of being in its slow tail, the
  chance the request avoids every one of them is 0.99 to the tenth power.
</p>
<table>
  <tr><th>Services on the critical path</th><th>P(all fast) = 0.99<sup>n</sup></th><th>P(at least one slow path)</th></tr>
  <tr><td>1</td><td>0.990</td><td>1.0%</td></tr>
  <tr><td>5</td><td>0.951</td><td>4.9%</td></tr>
  <tr><td>10</td><td>0.904</td><td>9.6%</td></tr>
  <tr><td>100</td><td>0.366</td><td>63.4%</td></tr>
</table>
<p>
  Read the last row again: with a hundred-way fan-out, a per-service p99 means
  <em>most</em> requests hit at least one slow path. This is why Jeff Dean's
  "tail at scale" framing matters — as you decompose into more services, the
  user-visible p99 degrades even though every individual service's p99 is
  unchanged. Turn it around to get the design rule: to hold a user-facing p99,
  each of ten backends needs roughly <b>p99.9</b>, because 0.999<sup>10</sup>
  is 0.990. Every layer you add moves the percentile you must engineer for one
  notch further out.
</p>
<div class="warn">
  <span class="ttl">⚠ Retries and hedging cut the tail but multiply the load</span>
  The standard fix is a <em>hedged request</em>: if a replica hasn't answered
  by p95, fire a second request to another replica and take the first
  response. That converts a tail event into a p95-plus-a-bit event for about
  5% extra traffic. The failure mode is that when the system is already
  degraded, <em>everything</em> exceeds p95, so every request hedges, load
  doubles, and you have built a retry storm. Always pair hedging with a
  circuit breaker and a budget ("at most 5% of requests may hedge") — the same
  discipline as the retry-budget discussion in the fault tolerance chapter.
</div>

<h3>Cardinality is the thing that makes metrics expensive</h3>
<p>
  A metrics system does not charge you per event. Incrementing a counter a
  billion times costs essentially nothing. What it charges for is
  <b>unique time series</b> — one series per distinct combination of metric
  name and label values, each of which needs its own in-memory index entry
  and its own compressed chunk on disk. Cardinality is multiplicative:
</p>
<pre><code>http_requests_total{service, endpoint, status, region}

  services   50
  endpoints  200
  statuses   15
  regions    5
  ----------------------------------------------
  50 * 200 * 15 * 5 = 750,000 active series   <span class="c">// fine — a mid-size Prometheus handles this</span>

at a 15s scrape interval:
  750,000 * 4 samples/min * 1,440 min = 4.3 * 10^9 samples/day
  at ~2 bytes/sample compressed = ~8.6 GB/day   <span class="c">// affordable</span>

now add one label: user_id, 20,000,000 values
  750,000 * 20,000,000 = 1.5 * 10^13 series    <span class="c">// the cluster is dead</span></code></pre>
<p class="sub">
  The rule is mechanical: a metric label must be <b>bounded and low
  cardinality</b> — something you could write out on a whiteboard. User ids,
  request ids, session ids, raw URLs with path parameters, email addresses,
  and error strings all belong in <em>logs or traces</em>, where you pay per
  event but the schema is free. "Which user?" is a logs question. "How many
  users?" is a metrics question.
</p>
<div class="warn">
  <span class="ttl">⚠ The accidental-cardinality bugs are almost always the same three</span>
  Un-templated URL paths as a label (<code>/orders/8814</code> instead of
  <code>/orders/:id</code>); the raw exception message as a label when it
  contains an id or a timestamp; and a pod name or container id as a label in
  an autoscaling deployment, which quietly creates a new series every deploy
  and never garbage-collects the old ones. Each one has taken down a real
  monitoring cluster.
</div>

<h3>Distributed tracing and context propagation</h3>
<p>
  A trace is one tree per user request. Each unit of work is a <b>span</b>
  carrying a trace id (shared across the whole request), its own span id, and
  a parent span id. The only genuinely hard part is <b>context
  propagation</b>: every hop — HTTP call, gRPC call, queue publish, thread
  handoff — must carry the ids forward, or the tree silently breaks into
  disconnected fragments. The W3C standard is a single header:
</p>
<pre><code>traceparent: 00-4bf92f3577b34da6a3ce929d0e0e4736-00f067aa0ba902b7-01
             ^   ^                                ^                ^
             |   trace-id (16 bytes)              parent span-id   flags
             version                              (8 bytes)        (01 = sampled)</code></pre>
<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="A trace waterfall showing an api gateway span of 480 milliseconds containing auth, feed service, follow database, post store and a ranking service span of 295 milliseconds that accounts for most of the total latency">
    <g class="rough">
      <rect class="boxy" x="60"  y="32"  width="528" height="22" rx="4" />
      <rect class="box"  x="66"  y="62"  width="44"  height="22" rx="4" />
      <rect class="box"  x="115" y="92"  width="462" height="22" rx="4" />
      <rect class="box"  x="120" y="122" width="44"  height="22" rx="4" />
      <rect class="box"  x="170" y="152" width="66"  height="22" rx="4" />
      <rect class="boxr" x="241" y="182" width="325" height="22" rx="4" />
      <path class="ln" d="M60,232 L610,232" />
      <path class="ln" d="M60,232 L60,240 M170,232 L170,240 M280,232 L280,240 M390,232 L390,240 M500,232 L500,240 M610,232 L610,240" />
    </g>
    <text class="sm" x="60"  y="20"  >one trace_id, propagated on every hop via the traceparent header</text>
    <text class="sm" x="66"  y="48"  >api-gateway · 480 ms</text>
    <text class="sm" x="116" y="78"  >auth-svc · 40 ms</text>
    <text class="sm" x="121" y="108" >feed-svc · 420 ms</text>
    <text class="sm" x="170" y="138" >follow-db · 40 ms</text>
    <text class="sm" x="242" y="168" >post-store · 60 ms</text>
    <text class="sm rd" x="247" y="198" >ranking-svc · 295 ms</text>
    <text class="sm" x="60"  y="254" text-anchor="middle">0</text>
    <text class="sm" x="170" y="254" text-anchor="middle">100</text>
    <text class="sm" x="280" y="254" text-anchor="middle">200</text>
    <text class="sm" x="390" y="254" text-anchor="middle">300</text>
    <text class="sm" x="500" y="254" text-anchor="middle">400</text>
    <text class="sm" x="610" y="254" text-anchor="end">500 ms</text>
    <text class="lbl rd" x="60" y="276" style="font-size:14px">the dashboard said "feed-svc is slow" — the trace says feed-svc spent 70% of its time waiting on ranking</text>
  </svg>
  <figcaption>The value of the waterfall is not the total, it is the gaps and the nesting. Bars that start late reveal queueing; bars that overlap reveal parallelism you thought you had; a long parent with short children means the time went somewhere you are not instrumenting.</figcaption>
</figure>
<table>
  <tr><th>Sampling strategy</th><th>How it decides</th><th>Cost</th><th>Reach for this when…</th></tr>
  <tr><td>Head-based, fixed rate</td><td>Coin flip at the entry point; the decision rides in the traceparent flags so the whole tree agrees</td><td>Cheapest; trivially stateless</td><td>Default. You want a representative sample of normal traffic and you accept losing most rare events.</td></tr>
  <tr><td>Head-based, rate-limited per route</td><td>N traces per second per endpoint</td><td>Cheap; needs a per-route counter</td><td>Traffic is wildly skewed and a fixed rate would give you a million traces of the health check and none of checkout.</td></tr>
  <tr><td>Tail-based</td><td>Buffer all spans of a trace at the collector, decide once it completes: keep if slow, errored, or rare</td><td>Collector must hold every in-flight trace in memory for the duration; needs all spans of a trace routed to the same collector</td><td>You specifically need the pathological traces — which, since those are the ones you debug, is most serious deployments.</td></tr>
</table>

<h3>Structured logging, and the volume problem behind it</h3>
<p>
  A log line that is a sentence is a log line you can only grep. A log line
  that is an object is a log line you can query, aggregate and join to a
  trace. The single most valuable field is the trace id — it is what turns
  three independent stores into one investigation.
</p>
<pre><code>{"ts":"2026-08-08T11:04:22.184Z","level":"error","svc":"ranking",
 "trace_id":"4bf92f3577b34da6a3ce929d0e0e4736","span_id":"00f067aa0ba902b7",
 "user_id":"u_88214","route":"/v1/feed","status":503,"dur_ms":1841,
 "err":"model_pool_exhausted","pool_size":32,"queue_depth":417}</code></pre>
<p>
  Now the volume. At 100,000 requests/sec with one 500-byte log line each:
</p>
<pre><code>100,000 * 500 B          = 50 MB/s
50 MB/s * 86,400 s       = 4.3 TB/day
4.3 TB/day at $0.50/GB   ~ $2,150/day  ~ $780,000/year   <span class="c">// for one log line per request</span></code></pre>
<p class="sub">
  That number is why sampling is not optional at scale, and why the sampling
  policy should be asymmetric: keep <b>100% of errors and warnings</b>, keep
  100% of anything on a trace that was already sampled, and keep 1% of
  successful requests. You lose almost nothing diagnostically and drop
  roughly 99% of the bill. Add a per-service log budget so one team's debug
  statement cannot consume the org's ingest quota — a noisy-neighbour problem
  identical in shape to the one solved in the rate-limiting chapter.
</p>

<h3>Alert on symptoms, not causes</h3>
<p>
  The instinct is to alert on everything you can measure: CPU above 80%, disk
  above 70%, replica lag above 5 seconds. Every one of those is a
  <b>cause</b> alert, and cause alerts have two failure modes. They fire when
  nothing is wrong (CPU at 90% during a nightly batch job is correct
  behaviour), and they fail to fire when something is wrong in a way you did
  not predict. After six months of false pages, the team mutes the channel,
  and the monitoring system is now decorative.
</p>
<p>
  Alert on <b>symptoms</b> instead: the things a user would complain about.
  Google's four golden signals are latency, traffic, errors, and saturation;
  the first three are symptoms and the fourth is the leading indicator you use
  for capacity planning, not for paging. Keep cause metrics — you need them
  the moment you start debugging — but put them on dashboards, not on the
  pager.
</p>
<table>
  <tr><th>Don't page on this (cause)</th><th>Page on this instead (symptom)</th><th>Why</th></tr>
  <tr><td>CPU above 80% on app tier</td><td>p99 request latency above the SLO threshold</td><td>High CPU with acceptable latency is a well-utilised fleet, not an incident.</td></tr>
  <tr><td>Read replica lag above 5 s</td><td>Rate of stale-read complaints / stale-read guard trips</td><td>Lag only matters if a user reads their own write and doesn't see it.</td></tr>
  <tr><td>Queue depth above 10,000</td><td>Oldest-message age above 5 minutes</td><td>Depth depends on message size and consumer count; age is directly the user-visible delay.</td></tr>
  <tr><td>A single host is unreachable</td><td>Error rate above the error budget burn threshold</td><td>If losing one host pages you, you did not build the fault tolerance you claimed.</td></tr>
</table>

<h3>SLOs and error budgets: making the alert threshold non-arbitrary</h3>
<p>
  An <b>SLI</b> is the measurement ("proportion of requests served in under
  300 ms"). An <b>SLO</b> is the target on it ("99.9% over a rolling 30
  days"). The <b>error budget</b> is the leftover: 0.1% of requests, which
  over 30 days is a concrete allowance you may spend on deploys, experiments
  and bad luck. This is the mechanism that converts a philosophical argument
  about reliability into arithmetic.
</p>
<table>
  <tr><th>Availability target</th><th>Budget per 30 days</th><th>Budget per year</th><th>What it implies</th></tr>
  <tr><td>99%</td><td>7.2 hours</td><td>3.65 days</td><td>An internal tool. One long maintenance window is fine.</td></tr>
  <tr><td>99.9% ("three nines")</td><td>43.2 minutes</td><td>8.8 hours</td><td>A normal SaaS product. Achievable with a single region done well.</td></tr>
  <tr><td>99.95%</td><td>21.6 minutes</td><td>4.4 hours</td><td>Multi-AZ, automated failover, no manual step in the recovery path.</td></tr>
  <tr><td>99.99%</td><td>4.3 minutes</td><td>52.6 minutes</td><td>Multi-region active-active. A human cannot even read the page in the budget.</td></tr>
  <tr><td>99.999%</td><td>26 seconds</td><td>5.3 minutes</td><td>Almost never the right answer. Say so out loud when someone asks for it.</td></tr>
</table>
<p>
  Alerting on the raw SLI ("error rate above 0.1%") is too twitchy: a 30-second
  blip trips it. Alerting on the whole window is too slow: you find out you
  blew the budget on day 29. The standard answer is <b>multi-window burn-rate
  alerting</b> — page on how fast the budget is being consumed, measured over
  both a long and a short window so a recovered blip stops paging.
</p>
<table>
  <tr><th>Burn rate</th><th>Budget consumed</th><th>Windows (long + short)</th><th>Response</th></tr>
  <tr><td>14.4×</td><td>2% in 1 hour</td><td>1 hour + 5 minutes</td><td>Page immediately. At this rate the month is gone in ~2 days.</td></tr>
  <tr><td>6×</td><td>5% in 6 hours</td><td>6 hours + 30 minutes</td><td>Page.</td></tr>
  <tr><td>1×</td><td>10% in 3 days</td><td>3 days + 6 hours</td><td>File a ticket. This is a slow leak, not an outage.</td></tr>
</table>
<p class="sub">
  The short window is the part people forget: it exists so that when the
  incident ends, the alert clears within minutes instead of staying lit for
  the remaining hour of the long window. And the error budget has a second,
  political job — when it is exhausted, feature launches stop until
  reliability work restores it. That is the only mechanism anyone has found
  that makes "we should invest in reliability" an automatic decision rather
  than a quarterly argument.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd define the SLI as the
  fraction of feed requests served under 300 ms at the edge, set the SLO at
  99.9% over 30 days, and page on a 14.4× burn rate over a one-hour window
  with a five-minute short window to suppress recovered blips. Everything else
  — CPU, replica lag, queue depth — goes on a dashboard, not the pager."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt says "highly available", "five nines", "SLA", or asks how you would <em>operate</em> the system — that is an invitation to talk SLI/SLO/error budget, and most candidates skip it entirely.</li>
  <li>A naive design monitors hosts (CPU, memory, disk) and calls it observability. The tell of a senior answer is monitoring <em>user-visible symptoms</em> and treating host metrics as debugging aids.</li>
  <li>Any design with more than about five services on the critical path has a tail-latency problem by construction — bring up the 0.99<sup>n</sup> arithmetic unprompted; it is one of the highest-signal thirty seconds available to you.</li>
  <li>If you propose adding a label to a metric, immediately state its cardinality bound. If it is unbounded, it is a log field, not a label.</li>
  <li>Distinguish it from the fault-tolerance chapter: fault tolerance is about the system <em>surviving</em> a failure; observability is about <em>humans finding out</em> and locating it. A system can be perfectly redundant and completely un-debuggable.</li>
  <li>The pitfall: proposing logging everything. At 100k rps that is a multi-hundred-thousand-dollar annual line item. Name the sampling policy (all errors, 1% of successes) before the interviewer has to ask what it costs.</li>
</ul>`,
};
