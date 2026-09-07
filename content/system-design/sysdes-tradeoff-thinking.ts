import type { Chapter } from "../types";

export const sysdesTradeoffThinking: Chapter = {
  id: "sysdes-tradeoff-thinking",
  num: "A8",
  title: "Tradeoff thinking",
  short: "Tradeoff thinking",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Nobody is grading your architecture. They are grading whether you knew what you were giving up, and said so.",
  body: `<h3>The thing that is actually being scored</h3>
<p>
  Twenty-three chapters of this topic have been about mechanisms. This one is
  about the only skill that is graded directly. Interviewers at this level are
  not comparing your diagram against a reference answer — for most prompts
  there isn't one, and the interviewer has seen a dozen different designs pass.
  What they are assessing is narrower and more human: <b>can this person make
  a decision under incomplete information, explain the cost, and change their
  mind for a reason rather than for social pressure?</b> That is the job. The
  system design interview is a forty-five-minute simulation of a design review
  you will be running for the rest of your career.
</p>
<p>
  Which is why two candidates can draw an almost identical diagram and receive
  opposite ratings. One says "and then we add Kafka." The other says "I'll add
  a queue here because the write path is 600k/sec at peak and the consumer can
  fall behind without hurting the user — the cost is that the feed is now
  eventually consistent by a few seconds, and I'd revisit if product tells me
  the write must be read-your-own-write." Same box on the whiteboard. Entirely
  different signal.
</p>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="A frontier chart plotting consistency strength against write availability and latency, with eventual, quorum, single-primary and consensus designs sitting along an achievable curve, and an unreachable point above it labelled strong plus always-writable plus fast">
    <g class="rough">
      <path class="ln" d="M70,240 L610,240" />
      <path class="ln" d="M70,30 L70,240" />
      <path class="ln dash" d="M110,52 C220,86 350,150 560,228" />
      <circle class="boxg" cx="130" cy="70"  r="9" />
      <circle class="box"  cx="270" cy="120" r="9" />
      <circle class="boxy" cx="400" cy="172" r="9" />
      <circle class="box"  cx="520" cy="214" r="9" />
      <circle class="boxr" cx="470" cy="62"  r="9" />
    </g>
    <text class="sm" x="70"  y="22"  >write availability and low latency ↑</text>
    <text class="sm" x="610" y="264" text-anchor="end">stronger consistency →</text>
    <text class="sm" x="146" y="64"  >eventual — Dynamo-style</text>
    <text class="sm" x="286" y="114" >quorum — R + W &gt; N</text>
    <text class="sm" x="416" y="166" >single primary + sync replica</text>
    <text class="sm" x="508" y="206" text-anchor="end">consensus — Raft, Spanner</text>
    <text class="sm rd" x="470" y="40" text-anchor="middle">unreachable</text>
    <text class="lbl" x="70" y="286" style="font-size:14px">you choose a point on the curve; you do not get to leave it</text>
  </svg>
  <figcaption>Every named system is a point on the same frontier, not a different quality of engineering. When someone asks for the red dot, your job is to say which axis they are willing to give up on — that conversation is the design.</figcaption>
</figure>

<h3>The six axes, and the sentence for each</h3>
<p>
  Almost every decision in system design is one of six tradeoffs wearing a
  costume. Learning to <em>name the axis out loud</em> is most of the skill —
  it converts a technology choice into a reasoned position, and it lets the
  interviewer engage with the reasoning instead of the brand name.
</p>
<table>
  <tr><th>Axis</th><th>Buying more of this…</th><th>…costs you this</th><th>The sentence</th></tr>
  <tr>
    <td>Consistency vs availability</td>
    <td>Every reader sees the latest write</td>
    <td>Writes must fail or block during a partition; higher write latency</td>
    <td>"During a partition I'd rather reject the write than serve a stale balance — this is a money path."</td>
  </tr>
  <tr>
    <td>Latency vs throughput</td>
    <td>Fast individual responses</td>
    <td>Less batching, less pipelining, worse hardware utilisation, higher cost per request</td>
    <td>"Batching to 50 ms windows triples throughput and adds 50 ms of latency — for an analytics write path that's free, for a chat send it isn't."</td>
  </tr>
  <tr>
    <td>Cost vs performance</td>
    <td>Headroom, replicas, more cache, more regions</td>
    <td>Money, linearly, forever — plus the opportunity cost of the team maintaining it</td>
    <td>"A second region roughly doubles infra spend to move availability from three nines to four. Is that worth it for this product?"</td>
  </tr>
  <tr>
    <td>Complexity vs capability</td>
    <td>A feature the simple design can't do</td>
    <td>A new failure mode, a new backup story, a new upgrade path, a new page at 3am</td>
    <td>"That's a fourth stateful system. Each one is an on-call runbook — I'd want the capability to be worth that."</td>
  </tr>
  <tr>
    <td>Read-optimised vs write-optimised</td>
    <td>Cheap reads: denormalisation, materialised views, fan-out on write, more indexes</td>
    <td>Expensive, amplified writes; stale derived data; harder invalidation</td>
    <td>"Read:write here is 100:1, so I'll pay on write. If it were 1:1 I'd compute at read time instead."</td>
  </tr>
  <tr>
    <td>Build vs buy</td>
    <td>Control, exact fit, no per-GB bill</td>
    <td>Team time forever, and you are now the on-call for a commodity</td>
    <td>"I'd buy the CDN and the queue and build the matching engine — that's the only part that's our differentiator."</td>
  </tr>
</table>
<p class="sub">
  A seventh worth keeping in your pocket: <b>flexibility vs optimisation</b>.
  Every performance win — denormalisation, a chosen shard key, a precomputed
  index, a cached projection — is a bet on a specific access pattern. If the
  product pivots, the optimisation becomes the migration. Saying "this shard
  key assumes we always query by user, and if we later need query-by-region
  that's a full reshard" is the kind of foresight that reads as staff-level.
</p>

<h3>The four-beat move that makes a decision defensible</h3>
<p>
  There is a repeatable structure for any decision you announce, and it takes
  about fifteen seconds. Assumption, choice, cost, trigger. Beats one and two
  are what most candidates give. Beats three and four are the entire
  difference in rating.
</p>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="A four step sequence for defending a decision: state the assumption, state the choice, state the cost, state the trigger that would change your mind, with a red dashed path showing candidates who jump from choice straight to the end">
    <g class="rough">
      <path class="ln" d="M152,68 L172,68" />
      <path class="ln" d="M310,68 L330,68" />
      <path class="ln" d="M468,68 L488,68" />
      <path class="lnr dash" d="M241,96 C300,150 460,150 557,96" />
    </g>
    <g class="rough">
      <rect class="box"  x="14"  y="40" width="138" height="56" rx="6" />
      <rect class="boxy" x="172" y="40" width="138" height="56" rx="6" />
      <rect class="box"  x="330" y="40" width="138" height="56" rx="6" />
      <rect class="boxg" x="488" y="40" width="138" height="56" rx="6" />
    </g>
    <text class="sm" x="83"  y="62" text-anchor="middle">1 · assumption</text>
    <text class="sm" x="83"  y="82" text-anchor="middle">the number I'm using</text>
    <text class="sm" x="241" y="62" text-anchor="middle">2 · choice</text>
    <text class="sm" x="241" y="82" text-anchor="middle">what I'd build</text>
    <text class="sm" x="399" y="62" text-anchor="middle">3 · cost</text>
    <text class="sm" x="399" y="82" text-anchor="middle">what I give up</text>
    <text class="sm" x="557" y="62" text-anchor="middle">4 · trigger</text>
    <text class="sm" x="557" y="82" text-anchor="middle">what changes my mind</text>
    <text class="lbl rd" x="400" y="172" style="font-size:14px" text-anchor="middle">skipping 3 and 4 is what reads as mid-level</text>
  </svg>
  <figcaption>Beat 4 is the one nobody does. Naming the condition under which you would reverse yourself proves the decision was reasoned rather than remembered.</figcaption>
</figure>
<div class="say">
  <span class="ttl">Say it like this →</span> "Assuming 100:1 reads to writes
  and that a two-second delay on the feed is acceptable, I'd fan out on write
  into a per-user timeline cache. That costs me write amplification — a
  million-follower account generates a million inserts — and it costs me
  strict ordering across sources. I'd switch to read-time merge if the
  follower distribution turned out to be flatter than I'm assuming, or if
  product needs the feed strictly consistent."
</div>
<p>
  Notice the shape: one assumption, one choice, two costs, two triggers. It is
  four sentences and it is unfalsifiable in the good way — the interviewer can
  now attack the assumption ("what if it's 10:1?") which is exactly the
  conversation you want, because you have already told them what you'd do.
</p>

<h3>"It depends" is only half a sentence</h3>
<p>
  "It depends" is true of every question in this interview, which is precisely
  why saying it alone scores zero. It is not wrong, it is <em>empty</em> — it
  transfers the work back to the interviewer. The fix is mechanical: the
  phrase must always be completed with <b>on what</b>, and then with <b>what
  you would do in each branch</b>.
</p>
<table>
  <tr><th>Empty</th><th>Complete</th></tr>
  <tr><td>"It depends on the use case."</td><td>"It depends on whether users read their own writes. If they do, I'll route reads to the primary for that user for a few seconds after a write. If they don't, replicas are fine and I save the primary's capacity."</td></tr>
  <tr><td>"SQL or NoSQL, it depends."</td><td>"It depends on whether the access pattern is known and stable. It is — everything is a lookup by conversation id — so I'll take a wide-column store and give up ad-hoc queries. If analysts need ad-hoc access I'd ship a copy to a warehouse rather than compromise the serving store."</td></tr>
  <tr><td>"Depends how much scale we need."</td><td>"At 100 writes/sec one Postgres primary handles this with an order of magnitude of headroom. I'd revisit above about 5,000 writes/sec, which at current growth is roughly three years out."</td></tr>
</table>
<p class="sub">
  The same discipline applies to any comparative you use. "Faster" — than
  what, by how much? "More scalable" — along which dimension? "More reliable"
  — measured how? Vague comparatives are the verbal signature of someone
  reciting rather than reasoning, and experienced interviewers hear them
  instantly.
</p>

<h3>Over-engineering is the most common senior-level failure</h3>
<p>
  Mid-level candidates under-design. Senior candidates over-design, and it is
  the more expensive mistake because it looks like effort. The reflex is
  understandable: the interview rewards knowledge, knowledge feels like
  components, so more components must be a better answer. It is not. Every
  additional stateful system is a permanent operational tax — its own failure
  modes, its own backup and restore story, its own version upgrades, its own
  runbook, its own capacity model, its own page at 3am. You do not get to
  count only the benefit.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A diminishing-returns curve of capability delivered against components added, divided by dashed lines into three zones labelled necessary, defensible and theatre">
    <g class="rough">
      <path class="ln" d="M60,180 L610,180" />
      <path class="ln" d="M60,24 L60,180" />
      <path class="ln" d="M60,176 C130,120 190,62 300,52 C400,44 520,40 610,38" />
      <path class="ln dash" d="M210,24 L210,180" />
      <path class="lnr dash" d="M380,24 L380,180" />
    </g>
    <text class="sm" x="60"  y="18"  >capability delivered ↑</text>
    <text class="sm" x="610" y="216" text-anchor="end">components added →</text>
    <text class="sm" x="135" y="200" text-anchor="middle">necessary</text>
    <text class="sm" x="295" y="200" text-anchor="middle">defensible</text>
    <text class="sm rd" x="495" y="200" text-anchor="middle">theatre</text>
  </svg>
  <figcaption>The curve flattens long before candidates stop adding boxes. Knowing where the red line is — for the specific numbers you estimated ten minutes earlier — is the judgement being tested.</figcaption>
</figure>
<table>
  <tr><th>Actual scale</th><th>What is genuinely sufficient</th><th>What candidates reach for anyway</th></tr>
  <tr><td>10k DAU, ~10 writes/sec</td><td>One Postgres box, one app tier, daily backups. Genuinely. Nothing else.</td><td>Microservices, Kafka, Redis, Elasticsearch, Kubernetes</td></tr>
  <tr><td>1M DAU, ~500 writes/sec, 20k reads/sec</td><td>Postgres primary + 2 replicas, Redis cache, CDN for static, one background worker</td><td>Sharding, a service mesh, event sourcing, CQRS</td></tr>
  <tr><td>50M DAU, 20k writes/sec</td><td>Now sharding, a real queue, a separate read model, multi-AZ. The complexity has been earned.</td><td>Multi-region active-active before anyone asked for four nines</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ "We'll need Kafka" is the single most over-used sentence in these interviews</span>
  Kafka earns its place when you need durable replay, multiple independent
  consumer groups over the same stream, or sustained throughput a database
  cannot absorb. It does not earn its place because a request is
  asynchronous — a table with a status column and a worker polling it handles
  thousands of jobs per second and can be operated by anyone. If you propose a
  queue, say which of the three properties you need. If none apply, say "a
  jobs table is enough here, and I'd move to a broker when we need replay or a
  second consumer."
</div>
<p>
  The counterintuitive part: <b>proposing the simple thing is a higher-risk,
  higher-reward move</b>, and that is exactly why it scores. Anyone can list
  components. Saying "at this scale a single Postgres box is genuinely fine,
  and here is the number that tells me so, and here is the threshold where I'd
  change" requires you to have done the arithmetic and to be willing to be
  wrong in public. That is what the rating is measuring.
</p>

<h3>How to disagree with your interviewer well</h3>
<p>
  At some point the interviewer will push back, and often they will be
  deliberately wrong to see what you do. Both failure modes are common.
  <b>Folding instantly</b> — "oh, sure, we can do that" — reads as never
  having had a reason for your original choice. <b>Digging in</b> — repeating
  your position louder — reads as someone who will be difficult in a design
  review. The scored behaviour is neither.
</p>
<p>
  The move has three parts. <b>Restate their point in your own words</b>, so
  they know you actually heard it and so you find out whether you understood
  it. <b>Locate the disagreement on an axis</b> — you are almost never
  disagreeing about facts, you are weighting a tradeoff differently or working
  from a different assumption. Then either <b>update explicitly and say why</b>,
  or <b>hold with a cost</b>.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "So the concern is that a single
  primary is a write bottleneck and a single point of failure — that's fair.
  I'm weighting it differently because at 500 writes a second we're at maybe
  10% of what one box does, and sharding now costs me cross-shard
  transactions on the checkout path. If you're telling me to plan for 10×
  growth inside a year, that flips it and I'd shard by customer id from the
  start. Which assumption should I be designing against?"
</div>
<p class="sub">
  That last question is the highest-value four words available to you.
  Pushback usually encodes information the interviewer has and you don't —
  they know the growth curve because they picked the problem. Asking which
  assumption to design against converts an argument into a requirements
  clarification, which is a thing you get points for.
</p>
<p>
  And when you are genuinely wrong, be conspicuous about it: "You're right, I
  had the read-write ratio backwards — that changes my answer, let me redo it."
  Visibly updating on evidence is a positive signal, not a recovery from a
  negative one. Nobody in the history of these interviews has been downgraded
  for correcting themselves cleanly.
</p>

<div class="sticky mint">
  <span class="ttl">The whole chapter in one line</span>
  You are not being asked for the best design. You are being asked for a
  design you can <b>defend</b>, delivered with its <b>price tag attached</b>
  and the <b>conditions under which you'd change it</b>. Say the price out
  loud and the interview stops being an exam.
</div>

<h3>What separates a senior/staff performance from a mid-level one</h3>
<ul>
  <li><b>Drives the clock.</b> Mid-level waits to be asked what's next. Senior says "I've got requirements and estimates, I'll spend ten minutes on the core data path, then come back to failure handling" — and then does that, watching the time.</li>
  <li><b>Commits, then qualifies.</b> Mid-level lists three databases and asks which one you want. Senior picks one in a sentence, says what it costs, and moves on. The pick can be wrong; the refusal to pick cannot be recovered from.</li>
  <li><b>Numbers precede boxes.</b> Mid-level draws the architecture and adds capacity math if prompted. Senior estimates first and lets the numbers force the components — so every box on the board has an arithmetic reason to exist.</li>
  <li><b>Names the axis, not just the option.</b> "This is a consistency-versus-availability call and I'm taking availability because it's a like counter" beats any amount of correct-but-unexplained choice.</li>
  <li><b>Volunteers the weakness.</b> Mid-level defends the design. Senior says "the fragile part here is the cross-shard transaction on checkout — if I had more time that's where I'd focus" before being asked. Interviewers have a mental list of your design's flaws; naming them first turns each one from a discovered gap into demonstrated judgement.</li>
  <li><b>Simplifies on purpose, with a threshold.</b> "One Postgres box, and here's the number at which I'd shard" is a strictly stronger answer than a distributed store nobody needed. Under-engineering with a stated trigger is judgement; over-engineering is anxiety.</li>
  <li><b>Talks about operating it.</b> Deploys, migrations, backfills, rollback, on-call load, what the dashboard shows, what pages a human. Mid-level designs a system that gets built. Senior designs one that gets run for five years.</li>
  <li><b>Handles pushback as information.</b> Restates the objection, locates the disagreement in an assumption, updates or holds with a reason — and asks which assumption to design against rather than guessing.</li>
  <li><b>Scopes to the ask.</b> Recognises that "design a URL shortener for an internal tool" and "design one for 100 M links a day" are different problems, and refuses to answer the second when asked the first.</li>
</ul>`,
};
