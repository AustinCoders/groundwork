import type { Chapter } from "../types";

export const sysdesInterviewMentalModel: Chapter = {
  id: "sysdes-interview-mental-model",
  num: "B1",
  title: "What system design interviews test",
  short: "The mental model",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "There is no answer key — the interviewer is scoring how you got there, not where you landed.",
  body: `<h3>The interviewer is scoring a process, not an answer</h3>
<p>
  A coding interview has a correct answer: the tests pass or they don't. A
  system design interview does not. Two candidates can draw the same boxes on
  the same whiteboard and receive opposite recommendations, because the
  artifact being evaluated is not the diagram — it's the sequence of decisions
  that produced it. The interviewer is filling in a rubric with rows like
  "gathered requirements before designing" and "articulated a tradeoff without
  being prompted." Your drawing is only evidence.
</p>
<p>
  This is why strong engineers with real production experience sometimes fail
  the loop. They design the way they design at work — quietly, in their head,
  then present a conclusion. In a 45-minute interview an unspoken thought is a
  thought that did not happen.
</p>
<table>
  <tr><th>What the rubric row says</th><th>Weak signal</th><th>Senior / staff signal</th></tr>
  <tr>
    <td>Requirement gathering</td>
    <td>Starts drawing from the one-line prompt</td>
    <td>Spends 5-8 minutes turning a vague prompt into a bounded problem, and writes the scope down where both of you can see it</td>
  </tr>
  <tr>
    <td>Structured thinking</td>
    <td>Jumps between topics as they occur; the board becomes a mess</td>
    <td>Announces the plan ("requirements, then scale math, then a high-level design, then we pick something to go deep on") and visibly follows it</td>
  </tr>
  <tr>
    <td>Explicit tradeoffs</td>
    <td>Names a technology ("I'd use Kafka")</td>
    <td>Names the alternative they rejected and the property that decided it ("a queue over direct calls, because I want the write path to survive the consumer being down — cost is end-to-end latency and an at-least-once contract")</td>
  </tr>
  <tr>
    <td>Calibration to scale</td>
    <td>Shards a database for a 500-employee internal tool</td>
    <td>Sizes the solution to the stated load and says out loud what would have to change to justify more</td>
  </tr>
  <tr>
    <td>Depth</td>
    <td>Every component gets one sentence</td>
    <td>Can go three levels down on any box they drew — data model, failure behaviour, and what happens at 10x</td>
  </tr>
  <tr>
    <td>Knowing what you don't know</td>
    <td>Bluffs a confident wrong number</td>
    <td>"I don't know Spanner's exact commit latency; I know it's bounded by the TrueTime uncertainty window, so single-digit to low tens of milliseconds. I'd design assuming 10 ms and verify."</td>
  </tr>
  <tr>
    <td>Collaboration</td>
    <td>Treats interviewer questions as attacks to deflect</td>
    <td>Treats them as new requirements, updates the design, and says what the change costs</td>
  </tr>
</table>
<p class="sub">
  The last row is the one candidates underrate most. The interviewer is
  simulating a design review with a colleague. If disagreeing with you is
  unpleasant, that is a hire-signal problem no amount of correct architecture
  fixes.
</p>

<h3>The 45-minute arc</h3>
<p>
  Almost every system design round at a large company follows the same shape,
  whether or not the interviewer states it. Knowing the shape lets you budget
  time instead of discovering at minute 40 that you never discussed failure.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A timeline of a forty five minute system design interview divided into five phases: clarify requirements, estimate scale, high level design, deep dive on one component, and bottlenecks and failure, with a red arc showing the common mistake of skipping straight from the prompt to the diagram">
    <g class="rough">
      <path class="lnr dash" d="M66,86 C120,34 264,34 318,86" />
      <path class="ln" d="M120,118 L136,118" />
      <path class="ln" d="M246,118 L262,118" />
      <path class="ln" d="M372,118 L388,118" />
      <path class="ln" d="M498,118 L514,118" />
    </g>
    <g class="rough">
      <rect class="boxy" x="12"  y="90" width="108" height="56" rx="6" />
      <rect class="box"  x="138" y="90" width="108" height="56" rx="6" />
      <rect class="box"  x="264" y="90" width="108" height="56" rx="6" />
      <rect class="boxg" x="390" y="90" width="108" height="56" rx="6" />
      <rect class="box"  x="516" y="90" width="108" height="56" rx="6" />
    </g>
    <text class="sm rd" x="192" y="30" text-anchor="middle">the classic failure: drawing boxes at minute 2</text>
    <text class="sm" x="66"  y="113" text-anchor="middle">clarify</text>
    <text class="sm" x="66"  y="131" text-anchor="middle">requirements</text>
    <text class="sm" x="192" y="113" text-anchor="middle">estimate</text>
    <text class="sm" x="192" y="131" text-anchor="middle">scale</text>
    <text class="sm" x="318" y="113" text-anchor="middle">high-level</text>
    <text class="sm" x="318" y="131" text-anchor="middle">design</text>
    <text class="sm" x="444" y="113" text-anchor="middle">deep dive</text>
    <text class="sm" x="444" y="131" text-anchor="middle">(they choose)</text>
    <text class="sm" x="570" y="113" text-anchor="middle">bottlenecks</text>
    <text class="sm" x="570" y="131" text-anchor="middle">and failure</text>
    <text class="sm" x="66"  y="166" text-anchor="middle">0-8 min</text>
    <text class="sm" x="192" y="166" text-anchor="middle">8-13 min</text>
    <text class="sm" x="318" y="166" text-anchor="middle">13-23 min</text>
    <text class="sm" x="444" y="166" text-anchor="middle">23-38 min</text>
    <text class="sm" x="570" y="166" text-anchor="middle">38-45 min</text>
    <text class="lbl" x="20" y="198" style="font-size:15px">The green phase is where most of the score lives — depth on one</text>
    <text class="lbl" x="20" y="220" style="font-size:15px">component beats a shallow tour of eight. The yellow phase is where</text>
    <text class="lbl" x="20" y="242" style="font-size:15px">most candidates lose the interview by skipping it.</text>
  </svg>
  <figcaption>Budget the clock out loud. Announcing "I'll spend about five minutes on requirements" is itself a scored signal — it tells the interviewer you have run this meeting before.</figcaption>
</figure>
<table>
  <tr><th>Phase</th><th>What you produce</th><th>The failure mode</th></tr>
  <tr>
    <td>Clarify (0-8)</td>
    <td>A written list of in-scope features, out-of-scope features, and the non-functional targets you'll design against</td>
    <td>Accepting the prompt at face value and designing something nobody asked for</td>
  </tr>
  <tr>
    <td>Estimate (8-13)</td>
    <td>QPS (average and peak), storage per year, and one derived number that constrains the design</td>
    <td>Arithmetic theatre — computing numbers you never refer to again</td>
  </tr>
  <tr>
    <td>High-level (13-23)</td>
    <td>6-10 boxes, the data flow for the one or two critical paths, and the data model</td>
    <td>Twenty boxes with no data model; the model is what proves you understand the problem</td>
  </tr>
  <tr>
    <td>Deep dive (23-38)</td>
    <td>One component taken to implementation-level detail, chosen by the interviewer</td>
    <td>Staying at the same altitude you were at in the high-level phase</td>
  </tr>
  <tr>
    <td>Failure (38-45)</td>
    <td>What breaks first under 10x, what happens when each dependency dies, how you'd detect it</td>
    <td>Never getting here because the earlier phases ran long</td>
  </tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I draw anything: I want
  to spend a few minutes on requirements and rough numbers, then sketch a
  high-level design, then go deep wherever you're most interested. Does that
  work, or is there a specific area you'd like me to prioritise?"
</div>

<h3>Functional vs non-functional, and why only one of them shapes the design</h3>
<p>
  Functional requirements are what the system does: users can shorten a URL,
  followers see a post, a rider is matched to a driver. They determine your
  API surface and your data model. Non-functional requirements are the
  properties the system must hold while doing it: latency, availability,
  consistency, durability, scale, cost. They determine the architecture.
</p>
<p>
  This distinction earns its keep because functional requirements are usually
  easy and non-functional ones are where the interesting decisions live.
  "Users can post a tweet" is a row insert. "A tweet is visible to 100 million
  followers within two seconds" is the entire design.
</p>
<table>
  <tr><th>Non-functional requirement</th><th>Ask it as</th><th>What the answer changes</th></tr>
  <tr>
    <td>Scale</td>
    <td>"How many daily actives, and what's the read-to-write ratio?"</td>
    <td>Whether you need caching, replicas, sharding — or none of the above</td>
  </tr>
  <tr>
    <td>Latency</td>
    <td>"What's the p99 target for the read path?"</td>
    <td>Cache placement, whether cross-region calls are allowed on the critical path, sync vs async work</td>
  </tr>
  <tr>
    <td>Consistency</td>
    <td>"If a user updates their profile, must they see it on the next read? Must their friends?"</td>
    <td>Read-your-writes routing, whether replicas can serve reads, single-leader vs multi-leader</td>
  </tr>
  <tr>
    <td>Availability</td>
    <td>"Is it acceptable to be read-only during a regional outage?"</td>
    <td>Multi-region topology, failover strategy, and how much complexity is justified</td>
  </tr>
  <tr>
    <td>Durability</td>
    <td>"Is losing the last second of writes a bug or a catastrophe?"</td>
    <td>Synchronous vs asynchronous replication, write-ahead log fsync policy, queue acknowledgement semantics</td>
  </tr>
  <tr>
    <td>Cost</td>
    <td>"Are we optimising for engineer time or infrastructure spend?"</td>
    <td>Managed services vs self-hosted; whether "just add a bigger box" is allowed</td>
  </tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Asking questions is not the same as gathering requirements</span>
  Candidates learn that they should "ask clarifying questions" and then fire
  off eight of them without using any of the answers. The signal comes from
  the loop: ask, hear the number, say what it implies, write it down. "10
  million DAU with a 100-to-1 read ratio — so this is a read-heavy system and
  I'll be spending my design effort on the read path" is worth more than the
  next five questions.
</div>

<h3>Estimation you can do in your head, out loud</h3>
<p>
  The point of the scale math is not the number, it's the decision the number
  unlocks. You are looking for an order of magnitude that tells you which of
  three or four architectures is appropriate. Round aggressively; nobody wants
  to watch you long-divide.
</p>
<div class="sticky mint">
  <span class="ttl">The one conversion to memorise</span>
  A day is 86,400 seconds — call it 100,000. So <b>1 million requests per day
  ≈ 12 per second</b>, and 1 billion per day ≈ 12,000 per second. Almost every
  QPS estimate you will ever do in an interview is this ratio scaled up or
  down, then multiplied by 2-3 for peak.
</div>
<p>
  A worked pass, in the amount of detail you'd actually speak: 100 million
  daily actives, each reading their feed 10 times a day, is 1 billion reads a
  day, so about 12,000 reads per second average and call it 30,000 at peak.
  Writes at one post per user per day is 100 million a day, roughly 1,200 per
  second — a 10-to-1 read/write ratio. At 1 KB per post that's 100 GB of new
  post data per day, so 36 TB a year before replication, media, or indexes.
</p>
<p>
  Now use it. 30,000 reads per second will not come off a single relational
  primary, so reads must be served from cache or replicas. 1,200 writes per
  second <em>will</em> fit on one well-tuned Postgres box, which means sharding
  the write path is not yet justified and saying so is a senior signal. 36 TB
  a year means the hot dataset and the cold archive should not live in the same
  place. Three architectural decisions from four multiplications.
</p>
<table>
  <tr><th>Anchor</th><th>Value to quote</th></tr>
  <tr><td>Seconds in a day</td><td>~100,000 (86,400)</td></tr>
  <tr><td>1M requests/day</td><td>~12 QPS</td></tr>
  <tr><td>Peak-to-average traffic ratio</td><td>2-3x for consumer apps; 5-10x for event-driven spikes</td></tr>
  <tr><td>A tweet-sized text record</td><td>~200 bytes to 1 KB with metadata</td></tr>
  <tr><td>A compressed photo</td><td>~200 KB - 1 MB; a minute of 1080p video ~ 50 MB</td></tr>
  <tr><td>One commodity app server</td><td>Thousands of RPS for simple JSON, hundreds if it does real work per request</td></tr>
  <tr><td>One relational primary</td><td>~5,000-20,000 simple reads/sec, ~1,000-10,000 writes/sec</td></tr>
  <tr><td>One cache node</td><td>~100,000 ops/sec, sub-millisecond</td></tr>
</table>
<p class="sub">
  These are deliberately wide ranges. Quoting a range with the caveat "depends
  on row size and whether it's index-only" reads as experience; quoting
  "Postgres does 8,342 QPS" reads as memorised trivia and invites a follow-up
  you can't answer.
</p>

<h3>Why "it depends" is the right answer — and why it's usually said wrong</h3>
<p>
  "It depends" alone is the single most common way to sound senior and score
  as junior. It is a correct observation that transfers the work back to the
  interviewer. The complete form has three parts, and takes about fifteen
  seconds:
</p>
<ul>
  <li><b>It depends on X</b> — name the specific variable, not "the use case"</li>
  <li><b>Here's how I'd decide</b> — the threshold or test that resolves X</li>
  <li><b>Absent that information, here's my default and why</b> — commit to something</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Whether I cache the feed
  depends on the read-to-write ratio and how tolerant we are of stale data. If
  reads outnumber writes by more than about 10 to 1 and a few seconds of
  staleness is fine, caching is clearly worth it. You said 100 to 1 and this
  is a social feed, so I'm going to cache, with a short TTL plus invalidation
  on write."
</div>
<p>
  The third part is what separates the two grades. A staff-level candidate is
  someone a team can be pointed at an ambiguous problem with, and who returns
  with a decision. Endless conditionality is the opposite of that.
</p>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="One prompt branching into two very different designs depending on the answer to the scale question: an internal tool needing one database and one server, versus a global consumer service needing an ID service, cache, CDN and multiple regions">
    <g class="rough">
      <path class="lng" d="M142,105 L208,62" />
      <path class="ln"  d="M382,58 L416,58" />
      <path class="lnr" d="M142,127 L208,168" />
      <path class="ln"  d="M382,172 L416,172" />
    </g>
    <g class="rough">
      <rect class="boxy" x="10"  y="90"  width="132" height="52" rx="6" />
      <rect class="boxg" x="208" y="32"  width="174" height="52" rx="6" />
      <rect class="box"  x="416" y="32"  width="212" height="52" rx="6" />
      <rect class="boxr" x="208" y="146" width="174" height="52" rx="6" />
      <rect class="box"  x="416" y="146" width="212" height="52" rx="6" />
    </g>
    <text class="sm" x="76"  y="112" text-anchor="middle">"design a URL</text>
    <text class="sm" x="76"  y="130" text-anchor="middle">shortener"</text>
    <text class="sm gr" x="295" y="53"  text-anchor="middle">1k links/day,</text>
    <text class="sm gr" x="295" y="71"  text-anchor="middle">internal tool</text>
    <text class="sm" x="522" y="53"  text-anchor="middle">one table, one app server,</text>
    <text class="sm" x="522" y="71"  text-anchor="middle">an index on the short code</text>
    <text class="sm rd" x="295" y="167" text-anchor="middle">100M links/day,</text>
    <text class="sm rd" x="295" y="185" text-anchor="middle">global reads</text>
    <text class="sm" x="522" y="167" text-anchor="middle">key-generation service, cache,</text>
    <text class="sm" x="522" y="185" text-anchor="middle">CDN, multi-region replicas</text>
  </svg>
  <figcaption>The same prompt has two defensible answers that share almost no components. This is why the scale question comes before the drawing, not after it.</figcaption>
</figure>

<h3>The deep dive: they pick the component, you supply three levels</h3>
<p>
  Somewhere around minute 23 the interviewer will point at a box and ask you
  to expand it. This is not random — they are steering toward the part of the
  problem they consider interesting, and toward the depth signal they still
  need. Whatever they pick, the expansion has the same three levels:
</p>
<ul>
  <li><b>Mechanism</b> — what data structure or algorithm is inside the box, and the concrete data model (table columns, key format, index)</li>
  <li><b>Behaviour under load</b> — what the hot path costs, where the contention is, what happens at 10x traffic</li>
  <li><b>Behaviour under failure</b> — what happens when this box dies mid-request, when it's slow rather than dead, and how a client experiences that</li>
</ul>
<p>
  A useful discipline while sketching: don't draw a box you can't take to
  level three. If you write "recommendation service" on the board and have no
  model for what's inside it, you have handed the interviewer a place to
  probe where you will have nothing. Either be ready to open it, or name it
  explicitly as out of scope: "there's a ranking service here; I'll treat it
  as a black box that returns an ordered list of IDs unless you want to go
  into it."
</p>
<div class="warn">
  <span class="ttl">⚠ The slow-dependency question catches almost everyone</span>
  Candidates prepare for "what if the database goes down" and freeze on "what
  if it's just slow." Slow is worse: connections pile up, thread pools
  saturate, and a single degraded dependency takes the whole service down
  through queueing. The expected vocabulary is timeouts, bounded retries with
  jitter, circuit breakers, bulkheads, and load shedding. Have one sentence
  ready on each.
</div>

<h3>The failure modes that actually end interviews</h3>
<table>
  <tr><th>Failure mode</th><th>What it looks like</th><th>The fix</th></tr>
  <tr>
    <td>Drawing at minute 2</td>
    <td>The prompt is 12 words and there are already six boxes on the board</td>
    <td>Force the requirements phase; write scope in a corner of the board and refer back to it</td>
  </tr>
  <tr>
    <td>Designing for a billion when told a thousand</td>
    <td>Kafka, sharding, and a service mesh for an internal admin tool</td>
    <td>Match the design to the stated scale, then name the trigger that would change it</td>
  </tr>
  <tr>
    <td>Silence</td>
    <td>Thirty seconds of quiet thinking; the interviewer can't score what they can't hear</td>
    <td>Narrate the search, not just the conclusion: "I'm weighing whether the fan-out happens on write or on read..."</td>
  </tr>
  <tr>
    <td>Buzzword placement</td>
    <td>Naming a technology without a property to justify it</td>
    <td>Always pair the noun with the property: not "Redis", but "an in-memory store because I need sub-millisecond lookups on a small hot set"</td>
  </tr>
  <tr>
    <td>Breadth as avoidance</td>
    <td>Adding new components whenever a question gets hard</td>
    <td>Depth is the scored axis after minute 23; go down, not sideways</td>
  </tr>
  <tr>
    <td>Defending instead of updating</td>
    <td>Treating "what if writes are 100x higher?" as a criticism</td>
    <td>Treat every question as a new requirement: "then my single primary is out — here's what changes"</td>
  </tr>
  <tr>
    <td>Bluffing</td>
    <td>Inventing a mechanism for a system you've only read the name of</td>
    <td>Say what you do know, name the boundary, reason from principles from there — this scores well, and getting caught bluffing is often terminal</td>
  </tr>
</table>
<p class="sub">
  Notice that only two of these are about knowledge. The rest are about
  conduct in a room. This is the actual reason system design is the biggest
  differentiator at senior and staff levels: it is the only round that
  measures how you behave when the problem is underspecified and someone is
  disagreeing with you.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt is one sentence and deliberately ambiguous ("design Twitter") — that ambiguity is the first thing being tested, not an oversight to work around</li>
  <li>If the interviewer volunteers a number ("about a thousand internal users"), it is a constraint they will hold you to; designing above it reads as poor judgement, not ambition</li>
  <li>When they ask "why?" they are almost never disagreeing — they are giving you a scoring opportunity to state the tradeoff you skipped</li>
  <li>When they say "let's say traffic grows 100x", they have moved to the bottlenecks phase; stop adding features and start naming what breaks first</li>
  <li>If you have drawn a box you cannot open to three levels of detail, either open it now or declare it out of scope before they ask</li>
  <li>If you find yourself saying "it depends" without immediately naming the variable and your default, you have handed back the question — finish the sentence</li>
</ul>`,
};
