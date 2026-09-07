import type { Chapter } from "../types";

export const sysdesAvailabilityDesign: Chapter = {
  id: "sysdes-availability-design",
  num: "I6",
  title: "Designing for availability",
  short: "Designing for availability",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Availability multiplies down your dependency chain — five nines in one box is four nines in a system.",
  body: `<h3>Availability is arithmetic, and the arithmetic is unforgiving</h3>
<p>
  Every candidate says "I'll make it highly available." Almost nobody can
  say what that costs. Availability is a measured number — the fraction of
  requests (or of wall-clock time) during which the system did the thing it
  promised — and the single most valuable fact about it is that it
  <b>multiplies down a serial dependency chain</b>. Your service cannot be
  more available than the product of everything it must reach to answer a
  request. Show that multiplication on the whiteboard unprompted and you
  have signalled seniority in about fifteen seconds.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="One API service depending on five backend services that each promise 99.9 percent availability, with the product of those five numbers working out to 99.5 percent, or 43.8 hours of downtime a year">
    <g class="rough">
      <path class="ln" d="M320,54 L66,110" />
      <path class="ln" d="M320,54 L190,110" />
      <path class="ln" d="M320,54 L314,110" />
      <path class="ln" d="M320,54 L438,110" />
      <path class="ln" d="M320,54 L562,110" />
    </g>
    <g class="rough">
      <rect class="boxy" x="250" y="14" width="140" height="40" rx="6" />
      <rect class="box" x="14" y="110" width="104" height="42" rx="6" />
      <rect class="box" x="138" y="110" width="104" height="42" rx="6" />
      <rect class="box" x="262" y="110" width="104" height="42" rx="6" />
      <rect class="box" x="386" y="110" width="104" height="42" rx="6" />
      <rect class="box" x="510" y="110" width="104" height="42" rx="6" />
    </g>
    <text class="lbl" x="320" y="40" text-anchor="middle">your API</text>
    <text class="sm" x="66" y="136" text-anchor="middle">auth</text>
    <text class="sm" x="190" y="136" text-anchor="middle">profiles</text>
    <text class="sm" x="314" y="136" text-anchor="middle">social graph</text>
    <text class="sm" x="438" y="136" text-anchor="middle">media meta</text>
    <text class="sm" x="562" y="136" text-anchor="middle">payments</text>
    <text class="sm" x="66" y="170" text-anchor="middle">99.9%</text>
    <text class="sm" x="190" y="170" text-anchor="middle">99.9%</text>
    <text class="sm" x="314" y="170" text-anchor="middle">99.9%</text>
    <text class="sm" x="438" y="170" text-anchor="middle">99.9%</text>
    <text class="sm" x="562" y="170" text-anchor="middle">99.9%</text>
    <text class="lbl" x="320" y="212" text-anchor="middle" style="font-size:15px">0.999 × 0.999 × 0.999 × 0.999 × 0.999 = 0.99501</text>
    <text class="lbl rd" x="320" y="240" text-anchor="middle" style="font-size:14px">= 99.50% → 43.8 hours a year, from five that each promised 8.8</text>
    <text class="lbl gr" x="320" y="270" text-anchor="middle" style="font-size:14px">make one of them optional and its 0.1% stops counting: 99.60%</text>
  </svg>
  <figcaption>Serial dependencies multiply. Adding a sixth 99.9% service costs you another 8.8 hours a year before you have written a line of your own code.</figcaption>
</figure>
<p>
  Include your own tier in that product and five hard dependencies at three
  nines put you at 99.40% — about 52 hours a year. Notice what that means:
  <b>you cannot buy availability you did not design for</b>. If the target
  is four nines end-to-end, either every hop is five nines (expensive) or
  most hops stop being hard dependencies (design work).
</p>

<h3>What the nines actually cost you in wall-clock time</h3>
<table>
  <tr><th>Availability</th><th>Downtime / year</th><th>Downtime / month</th><th>What it realistically implies</th></tr>
  <tr><td>99%</td><td>3.65 days</td><td>7.3 hours</td><td>One box, business-hours on-call, deploys cause outages</td></tr>
  <tr><td>99.9% ("three nines")</td><td>8.8 hours</td><td>43.8 minutes</td><td>Redundant instances, automated deploys, someone paged 24/7</td></tr>
  <tr><td>99.95%</td><td>4.4 hours</td><td>21.9 minutes</td><td>Multi-AZ, health-checked failover, tested rollbacks</td></tr>
  <tr><td>99.99% ("four nines")</td><td>52.6 minutes</td><td>4.4 minutes</td><td>No manual step in the recovery path — humans cannot respond that fast</td></tr>
  <tr><td>99.999% ("five nines")</td><td>5.3 minutes</td><td>26 seconds</td><td>Multi-region active-active, no dependency below five nines, very few systems truly have it</td></tr>
</table>
<p class="sub">
  Read the four-nines row again. 52 minutes a year is your entire budget for
  every bad deploy, every dependency incident, every certificate expiry and
  every disk failure combined. A single human paging in, opening a laptop and
  finding the runbook has already spent a quarter of the annual budget. That
  is the real threshold: <b>at four nines and above, recovery has to be
  automatic</b>.
</p>
<div class="warn">
  <span class="ttl">⚠ "Availability" measured over a year hides everything that matters</span>
  A service that is down for 45 minutes once still reports 99.99% for the
  year. Users experienced a total outage. Interviewers who work on real
  systems care about the distribution, not the average — say you would
  measure availability as <em>successful requests / total requests</em>
  bucketed per minute, so a short total outage shows up as a cliff rather
  than being smeared into a rounding error.
</div>

<h3>Redundancy: active-active vs active-passive</h3>
<p>
  Redundancy is the only actual mechanism for availability; everything else
  is plumbing around it. The design question is whether the spare capacity is
  serving traffic right now.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="Side by side comparison of active-active redundancy where both nodes serve traffic and active-passive redundancy where a standby node sits idle until failover">
    <g class="rough">
      <path class="lng" d="M100,64 L60,110" />
      <path class="lng" d="M120,64 L160,110" />
      <path class="lng" d="M420,64 L380,110" />
      <path class="ln dash" d="M440,64 L480,110" />
      <path class="ln dash" d="M320,10 L320,240" />
    </g>
    <g class="rough">
      <rect class="box" x="60" y="26" width="100" height="38" rx="6" />
      <rect class="boxg" x="20" y="110" width="80" height="40" rx="6" />
      <rect class="boxg" x="120" y="110" width="80" height="40" rx="6" />
      <rect class="box" x="380" y="26" width="100" height="38" rx="6" />
      <rect class="boxg" x="340" y="110" width="80" height="40" rx="6" />
      <rect class="box" x="440" y="110" width="80" height="40" rx="6" />
    </g>
    <text class="lbl" x="110" y="16" text-anchor="middle">active-active</text>
    <text class="lbl" x="430" y="16" text-anchor="middle">active-passive</text>
    <text class="sm" x="110" y="50" text-anchor="middle">LB / DNS</text>
    <text class="sm" x="430" y="50" text-anchor="middle">LB / DNS</text>
    <text class="sm gr" x="60" y="135" text-anchor="middle">serving</text>
    <text class="sm gr" x="160" y="135" text-anchor="middle">serving</text>
    <text class="sm gr" x="380" y="135" text-anchor="middle">serving</text>
    <text class="sm" x="480" y="135" text-anchor="middle">standby</text>
    <text class="sm gr" x="110" y="178" text-anchor="middle">failure is a capacity event</text>
    <text class="sm" x="110" y="200" text-anchor="middle">each node must run under 50%</text>
    <text class="sm" x="430" y="178" text-anchor="middle">failure is a state transition</text>
    <text class="sm rd" x="430" y="200" text-anchor="middle">30 s to 5 min of unavailability</text>
    <text class="sm" x="320" y="230" text-anchor="middle">the standby path is the one that is never exercised</text>
  </svg>
  <figcaption>Active-active degrades; active-passive switches. Switching is a discrete event that can fail, which is why the passive side needs deliberate, scheduled exercise.</figcaption>
</figure>
<table>
  <tr><th></th><th>Active-active</th><th>Active-passive</th></tr>
  <tr><td>Failure behaviour</td><td>Remaining nodes absorb the load — no transition</td><td>Detect, promote, redirect — a transition that can fail</td></tr>
  <tr><td>Recovery time</td><td>Effectively zero (a few in-flight requests)</td><td>Detection window + promotion + DNS/connection churn</td></tr>
  <tr><td>Cost</td><td>You pay for N+1 but you use it</td><td>You pay for the standby and get nothing back</td></tr>
  <tr><td>Hard part</td><td>Every node writes: conflicts, split state, sticky sessions</td><td>Keeping the standby warm, current, and actually working</td></tr>
  <tr><td>Reach for this when…</td><td>The work is stateless or the store already does multi-writer (Cassandra, Dynamo-style)</td><td>There is a single logical writer — a relational primary, a leader-elected coordinator</td></tr>
</table>
<p class="sub">
  Active-active is not simply "better". Two nodes both accepting writes to
  the same row is the whole consistency problem from the consistency-models
  chapter, showing up in your availability design. Most real systems are
  active-active at the stateless tier and active-passive (or quorum-based) at
  the storage tier, and saying exactly that is the correct answer.
</p>

<h3>Failover, and the three ways it betrays you</h3>
<p>
  Failover is the moment a system decides a component is dead and acts on
  that belief. The belief can be wrong, and the action can be worse than the
  fault.
</p>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A network partition splitting two database nodes, each of which promotes itself to primary and accepts writes from its own side of the split, producing divergent data">
    <g class="rough">
      <path class="lnr dash" d="M320,34 L320,190" />
      <path class="lnr dash" d="M210,94 L430,94" />
      <path class="ln" d="M140,160 L140,118" />
      <path class="ln" d="M500,160 L500,118" />
    </g>
    <g class="rough">
      <rect class="boxy" x="70" y="70" width="140" height="48" rx="6" />
      <rect class="boxy" x="430" y="70" width="140" height="48" rx="6" />
      <rect class="box" x="70" y="160" width="140" height="36" rx="6" />
      <rect class="box" x="430" y="160" width="140" height="36" rx="6" />
    </g>
    <text class="sm rd" x="320" y="24" text-anchor="middle">network partition</text>
    <text class="lbl" x="140" y="90" text-anchor="middle">primary A</text>
    <text class="sm" x="140" y="110" text-anchor="middle">accepting writes</text>
    <text class="lbl" x="500" y="90" text-anchor="middle">primary B</text>
    <text class="sm" x="500" y="110" text-anchor="middle">accepting writes</text>
    <text class="sm" x="140" y="183" text-anchor="middle">clients, west</text>
    <text class="sm" x="500" y="183" text-anchor="middle">clients, east</text>
    <text class="sm rd" x="320" y="86" text-anchor="middle">heartbeat lost</text>
    <text class="lbl rd" x="320" y="222" text-anchor="middle" style="font-size:15px">both sides are up, both sides are right, the data is now wrong</text>
  </svg>
  <figcaption>Nothing crashed. Two healthy nodes lost sight of each other and each did the responsible thing, which is exactly how split brain happens.</figcaption>
</figure>
<ul>
  <li><b>Split brain.</b> A partition, not a crash. Both replicas promote and accept writes; when the network heals you have two divergent histories and no principled way to merge them. The fix is not a smarter heartbeat — it is <b>quorum</b>: an odd number of voters, and a node refuses to serve as primary unless it can see a majority. A two-node cluster cannot do this, which is why "two nodes for HA" is often worse than one.</li>
  <li><b>Failback storms.</b> The recovered node comes back, is declared healthy, and instantly receives its full share of traffic — with cold caches, cold connection pools and cold JIT. It falls over, gets marked unhealthy, and the loop repeats while the healthy nodes absorb the oscillation. The fix is slow-start / connection ramping: bring a returning node up to full weight over 30-120 seconds, and require it to pass health checks for a sustained window, not a single probe.</li>
  <li><b>Retry amplification.</b> One dependency slows down, every caller retries three times, and the dependency now receives 4× the traffic at exactly the moment it can least handle it. Retries need exponential backoff <em>with jitter</em>, a retry budget (e.g. retries capped at 10% of requests), and a circuit breaker that stops calling a failing dependency entirely rather than politely queueing for it.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd use quorum-based leader
  election with three voters rather than a two-node primary/standby, because
  two nodes can't distinguish a dead peer from a partition. On failback I'd
  ramp the recovered node's traffic over about a minute instead of restoring
  full weight instantly, and every retry gets jittered exponential backoff
  behind a circuit breaker so a slow dependency doesn't get amplified into a
  dead one."
</div>

<h3>Health checks are a design decision, not a checkbox</h3>
<p>
  A health check is the sensor your entire availability story depends on, and
  most candidates specify it in three words. There are two distinct questions
  and they need different endpoints.
</p>
<table>
  <tr><th>Probe</th><th>Asks</th><th>Failure action</th><th>Must NOT check</th></tr>
  <tr><td>Liveness</td><td>Is this process wedged and unrecoverable?</td><td>Restart the instance</td><td>Dependencies — a DB outage would restart your whole fleet</td></tr>
  <tr><td>Readiness</td><td>Can this instance serve a request right now?</td><td>Remove from the load-balancer pool</td><td>Anything slow — the probe itself must be cheap</td></tr>
  <tr><td>Deep / synthetic</td><td>Does a real user journey still work end to end?</td><td>Page a human, drive dashboards</td><td>Nothing — this one is allowed to be expensive, run it from outside</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ The health check that takes down the whole fleet</span>
  Readiness returns 500 whenever the database is unreachable. The database
  has a 20-second blip. Every instance simultaneously reports unready, the
  load balancer drains the entire pool, and now you are returning 503 to
  100% of traffic including the requests that never touch that database. The
  rule: <b>a health check should report on the instance, not on the world</b>.
  If a dependency is down, fail the requests that need it and keep serving
  the ones that don't.
</div>

<h3>Graceful degradation: shrinking the blast radius on purpose</h3>
<p>
  The most leverage in availability design is not making dependencies more
  reliable — it is making fewer of them <em>hard</em>. Every dependency you
  can convert from "request fails without it" to "page renders with a
  slightly worse experience" is removed from the multiplication.
</p>
<table>
  <tr><th>Dependency down</th><th>Naive result</th><th>Degraded result</th></tr>
  <tr><td>Recommendation service</td><td>500 on the home page</td><td>Serve a cached or globally-popular list; page still renders</td></tr>
  <tr><td>Personalized ranking</td><td>Empty feed</td><td>Fall back to reverse-chronological</td></tr>
  <tr><td>Search cluster</td><td>Search page errors</td><td>Fall back to a prefix lookup on the primary store, or show recent items</td></tr>
  <tr><td>Cache tier</td><td>Origin collapses under 100% miss rate</td><td>Shed load: serve a smaller page, admit a fraction of traffic, keep the origin alive</td></tr>
  <tr><td>Payments</td><td>Checkout unavailable</td><td>Accept the order into a queue, confirm asynchronously — only if the business allows it</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The line to remember</span>
  Availability is not "make each box reliable." It is "reduce the number of
  boxes that can individually say no." Timeouts, fallbacks and static
  defaults are availability features, and they cost engineering time rather
  than hardware.
</div>
<p class="sub">
  Degradation only works with aggressive timeouts. A dependency that hangs
  for 30 seconds is worse than one that fails in 50 ms, because the hang
  consumes your own threads, connections and memory until <em>you</em> fall
  over too. Set every outbound call a timeout meaningfully tighter than your
  own SLO, and treat "no timeout configured" as a bug.
</p>

<h3>Hunting single points of failure</h3>
<p>
  A single point of failure is any component whose loss takes the system with
  it. They are rarely the obvious boxes — nobody forgets to replicate the
  database. They hide in the parts of the diagram people don't draw.
</p>
<ul>
  <li><b>The load balancer itself.</b> Redundant app servers behind one LB instance is a SPOF with extra steps. Managed LBs are already redundant; self-managed ones need a floating IP or DNS-level failover.</li>
  <li><b>DNS and TLS certificates.</b> An expired cert is a total outage that no amount of replication prevents. So is a single authoritative DNS provider.</li>
  <li><b>Shared configuration and feature flags.</b> If every instance fetches config at startup from one service, that service is a SPOF for every deploy and every autoscale event. Cache config locally and serve stale on failure.</li>
  <li><b>The deployment pipeline.</b> If you cannot roll back because CI is down, your recovery time is now bounded by someone else's uptime.</li>
  <li><b>Correlated failure.</b> Three replicas in one rack, one AZ, or on one storage volume are one failure domain wearing a costume. Ask "what is the smallest event that kills all N of these at once?"</li>
  <li><b>Shared state you forgot is shared.</b> One Redis holding sessions for a stateless fleet makes that fleet stateful. One shared connection pool, one shared secret store, one leader-election service.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Let me walk the request path and
  name every component that has exactly one of something — LB, DNS, cert,
  config service, and the primary database. For each one I'll say whether it
  is genuinely redundant, or just drawn as a single box because it's managed."
</div>

<h3>Multi-AZ vs multi-region, honestly costed</h3>
<table>
  <tr><th></th><th>Multi-AZ</th><th>Multi-region</th></tr>
  <tr><td>Protects against</td><td>Rack, power, cooling, one datacenter</td><td>Regional outage, regional network, fibre cut, regulatory isolation</td></tr>
  <tr><td>Inter-node latency</td><td>~1-2 ms — synchronous replication is fine</td><td>30-150 ms cross-continent — synchronous replication is not fine</td></tr>
  <tr><td>Data cost</td><td>Cross-AZ transfer, roughly 1-2 cents per GB</td><td>Cross-region transfer plus a full second copy of everything</td></tr>
  <tr><td>Consistency impact</td><td>Essentially none; you keep a single primary</td><td>You must choose: single writer with slow remote writes, or multi-writer with conflict resolution</td></tr>
  <tr><td>Realistic ceiling</td><td>99.95-99.99%</td><td>99.99%+ — and only if failover is genuinely automatic</td></tr>
  <tr><td>Reach for this when…</td><td>Almost always — it is close to free and the default answer</td><td>The business loses serious money per minute of downtime, or law requires data residency</td></tr>
</table>
<p>
  Be blunt about the cost of multi-region: it is not "deploy twice." It is a
  second copy of your data with a replication strategy, a global traffic
  routing layer, a story for cross-region consistency, and an
  organisation-wide discipline that every new service is region-aware from
  day one. Teams frequently build it and then discover their failover has
  never been tested, giving them all the cost and none of the availability.
  <b>Untested failover is decoration.</b> Say you would run scheduled
  region-evacuation drills — that one sentence separates people who have
  operated multi-region from people who have read about it.
</p>

<h3>SLA, SLO, SLI and the error budget</h3>
<table>
  <tr><th>Term</th><th>What it is</th><th>Audience</th><th>Example</th></tr>
  <tr><td>SLI</td><td>The measurement itself</td><td>Engineers</td><td>Fraction of requests returning 2xx/3xx in under 300 ms, per minute</td></tr>
  <tr><td>SLO</td><td>The internal target for that SLI</td><td>Your team</td><td>99.95% of those requests, measured over 28 rolling days</td></tr>
  <tr><td>SLA</td><td>The contractual promise, with a penalty</td><td>Customers, lawyers</td><td>99.9%, or service credits are owed</td></tr>
</table>
<p>
  The SLA is always <em>looser</em> than the SLO — deliberately. You want to
  be breaching your internal target and fixing it long before you owe anyone
  money. If your SLO equals your SLA you have no warning zone.
</p>
<p>
  The <b>error budget</b> is the inverse of the SLO, and it is the most
  useful idea here because it turns reliability from an argument into a
  number. A 99.95% SLO over 28 days permits about 20 minutes of failure.
  That budget is a resource: spend it on risky deploys, experiments and
  migrations. The operating rule is mechanical — <b>budget remaining, ship
  features; budget exhausted, feature work stops and reliability work
  starts</b> until the rolling window recovers. It also stops the opposite
  failure mode: if you finish every month with 100% of the budget unspent,
  you are over-invested in reliability and shipping too slowly.
</p>
<div class="warn">
  <span class="ttl">⚠ Promising nines you have not measured</span>
  Do not say "this design gives us five nines." You do not know that, and an
  experienced interviewer will ask how you'd verify it. Say instead: "I'd set
  an SLO of 99.95% on the checkout path measured as good-requests over
  total-requests per minute, because the dependency math supports roughly
  that and the business impact of checkout downtime justifies the cost.
  Non-critical paths get a looser SLO." Different SLOs per journey is itself
  a senior signal — a uniform target across every endpoint means nobody
  thought about it.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt contains a reliability number ("99.99%", "always available", "cannot go down during Black Friday") — that is an invitation to do the dependency multiplication out loud before designing anything.</li>
  <li>A naive design adds a second server, calls it highly available, and never mentions how failure is detected, how long detection takes, or what happens when the two servers disagree.</li>
  <li>Distinguish from <b>fault tolerance</b> (the advanced sibling chapter): availability is about staying up during expected failures; fault tolerance is about correctness and recovery when things fail in unexpected, partial and byzantine ways.</li>
  <li>Distinguish from <b>consistency</b>: if the prompt stresses "users must never see stale data", you are being asked a CAP question, not an availability question — and the two pull in opposite directions during a partition.</li>
  <li>Anything with a hard dependency on a third party you don't control (payments, mapping, SMS) should trigger the degradation conversation: what does the product do when that vendor is down for 20 minutes?</li>
  <li>Pitfall: treating redundancy as sufficient. Redundancy without automated, tested, ramped failover raises your cost and leaves your availability roughly where it was.</li>
</ul>`,
};
