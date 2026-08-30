import type { NotesFile } from "./types";

export const systemDesignNotes: NotesFile = {
  meta: {
    title: "System Design — the whole map",
    subtitle: "24 sections across three levels — beginner through advanced, all written.",
    lead: "Pick a level and you'll get these sections in the order that makes sense, from the request lifecycle to sharding, consensus and the tradeoff thinking the interview is actually scoring.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: { figure: "" },

  chapters: [
    {
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
    },
    {
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
    },
    {
      id: "sysdes-scaling-vertical-horizontal",
      num: "B3",
      title: "Scaling: vertical vs horizontal",
      short: "Vertical vs horizontal",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle:
        "Buy a bigger box or buy more boxes — and one modern box is far bigger than the candidate who instantly reaches for a cluster believes.",
      body: `<h3>There are only two knobs, and they cost different things</h3>
<p>
  When a system runs out of capacity you can make the machine bigger
  (<b>vertical</b>, scale up) or add machines (<b>horizontal</b>, scale out).
  Everything else — caching, replicas, sharding, queues — is either a way to
  need less capacity or a specific tactic for making scale-out work on a tier
  that resists it.
</p>
<p>
  The reason interviewers open here is that the choice reveals judgement.
  Vertical scaling costs money and has a ceiling. Horizontal scaling costs
  <em>architecture</em>: it forces you to give up in-process state, easy
  transactions, and the ability to reason about your system as one program.
  Candidates who reach for a distributed cluster before they have exhausted a
  single box are showing an interviewer that they will over-build in
  production too, and that is a genuine downgrade signal at senior level.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="A single box running both application and database evolving into a load balanced tier of three stateless app servers with a primary database and an asynchronous read replica">
    <g class="rough">
      <path class="ln dash" d="M146,144 L206,144" />
      <path class="ln" d="M306,142 L344,66" />
      <path class="ln" d="M306,142 L344,142" />
      <path class="ln" d="M306,142 L344,218" />
      <path class="lnr" d="M450,66 L498,112" />
      <path class="lnr" d="M450,142 L498,120" />
      <path class="lng dash" d="M450,218 L498,218" />
      <path class="ln dash" d="M563,140 L563,196" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="92"  width="124" height="104" rx="6" />
      <rect class="boxy" x="28"  y="104" width="100" height="34" rx="5" />
      <rect class="box"  x="28"  y="150" width="100" height="34" rx="5" />
      <rect class="boxy" x="214" y="118" width="92"  height="48" rx="6" />
      <rect class="box"  x="346" y="46"  width="104" height="40" rx="6" />
      <rect class="box"  x="346" y="122" width="104" height="40" rx="6" />
      <rect class="box"  x="346" y="198" width="104" height="40" rx="6" />
      <rect class="boxg" x="500" y="96"  width="126" height="44" rx="6" />
      <rect class="box"  x="500" y="196" width="126" height="44" rx="6" />
    </g>
    <text class="sm" x="78"  y="84"  text-anchor="middle">day one</text>
    <text class="sm" x="78"  y="126" text-anchor="middle">app</text>
    <text class="sm" x="78"  y="172" text-anchor="middle">database</text>
    <text class="sm" x="176" y="134" text-anchor="middle">20x</text>
    <text class="sm" x="260" y="146" text-anchor="middle">balancer</text>
    <text class="sm" x="398" y="70"  text-anchor="middle">app 1</text>
    <text class="sm" x="398" y="146" text-anchor="middle">app 2</text>
    <text class="sm" x="398" y="222" text-anchor="middle">app 3</text>
    <text class="sm rd" x="470" y="100">writes</text>
    <text class="sm gr" x="452" y="212">reads</text>
    <text class="sm gr" x="563" y="122" text-anchor="middle">primary</text>
    <text class="sm" x="563" y="222" text-anchor="middle">read replica</text>
    <text class="sm" x="556" y="164" text-anchor="end">lag: 10 ms - 2 s</text>
    <text class="lbl" x="20" y="266" style="font-size:15px">The app tier scaled out because it holds no state. The database</text>
    <text class="lbl" x="20" y="288" style="font-size:15px">did not — it grew a replica, and writes still go to exactly one node.</text>
  </svg>
  <figcaption>Notice the asymmetry: three interchangeable app servers, still one writer. That asymmetry is the whole story of scaling, and everything harder in distributed systems is an attempt to break it.</figcaption>
</figure>

<h3>How big is one box, actually</h3>
<p>
  Most engineers' intuition about a "single server" was formed on a laptop or
  a 4-vCPU cloud instance. The real top end is startling, and quoting it is
  one of the cheapest ways to sound like you have operated systems rather than
  only read about them.
</p>
<table>
  <tr><th>Resource</th><th>What one rentable machine offers today</th></tr>
  <tr><td>CPU</td><td>Up to ~900 vCPUs on the largest high-memory cloud instances; 128-192 vCPUs is an ordinary large instance</td></tr>
  <tr><td>Memory</td><td>Up to 24-32 TiB on high-memory instances; 768 GiB is routine and cheap-ish</td></tr>
  <tr><td>Local storage</td><td>Tens of terabytes of NVMe on storage-optimised instances, at millions of random IOPS and single-digit-microsecond latency</td></tr>
  <tr><td>Network</td><td>100 Gbps and above on large instances — roughly 12 GB/s, more than most systems' entire dataset per minute</td></tr>
</table>
<p>
  What that translates to in throughput terms is more useful than the specs:
</p>
<table>
  <tr><th>Workload on a single well-tuned box</th><th>Realistic throughput</th></tr>
  <tr><td>nginx or Envoy proxying HTTP</td><td>50,000-100,000+ requests/sec</td></tr>
  <tr><td>A typical JSON API server doing real work per request</td><td>500-5,000 requests/sec per instance</td></tr>
  <tr><td>Redis, single node</td><td>~100,000 ops/sec, into the millions with pipelining</td></tr>
  <tr><td>Postgres, indexed point reads, working set in RAM</td><td>~10,000-50,000 reads/sec</td></tr>
  <tr><td>Postgres writes (WAL and fsync bound)</td><td>~1,000-10,000 transactions/sec, higher with batching and group commit</td></tr>
  <tr><td>Dataset that fits entirely in RAM</td><td>Hundreds of gigabytes to a few terabytes — which is most companies' entire production database</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The anchor worth remembering</span>
  Stack Overflow served hundreds of millions of page views a month from about
  nine web servers and a two-node SQL Server cluster, with the database
  machines sitting at single-digit CPU utilisation. If your design needs more
  than that, be able to say <em>why</em> your workload is different. Usually
  the honest answer is media, machine learning, or genuine consumer scale —
  and if it is none of those, one big box plus a replica is the correct
  design.
</div>

<h3>Where vertical scaling actually hits the wall</h3>
<p>
  The naive story is "vertical scaling gets exponentially expensive." That is
  only partly true, and saying it as stated invites a correction: within an
  instance family, cloud pricing is close to linear — twice the vCPUs is
  roughly twice the price. The real wall is made of five other things, and
  naming them precisely is the senior version of this answer.
</p>
<table>
  <tr><th>The wall</th><th>What it actually looks like</th></tr>
  <tr>
    <td>Availability</td>
    <td>One box is one failure domain. There is no rolling deploy, no instance-failure tolerance, and maintenance means downtime. This usually binds long before capacity does.</td>
  </tr>
  <tr>
    <td>Resize is not online</td>
    <td>Changing instance class means a stop/start or a failover — minutes of downtime, or a managed failover of 30-120 seconds. You cannot scale up mid-incident in time to matter.</td>
  </tr>
  <tr>
    <td>Diminishing returns</td>
    <td>Doubling cores rarely doubles throughput: lock contention, NUMA effects across sockets, single-threaded components (Redis, a WAL writer, a Node event loop), and GC pauses that grow with heap size. Past a point you buy cores that idle while one thread is the bottleneck.</td>
  </tr>
  <tr>
    <td>A genuine ceiling</td>
    <td>There is a largest instance, and when you reach it there is no next step — the migration you postponed now has to happen under load, which is the worst possible time.</td>
  </tr>
  <tr>
    <td>Cost at the extremes and licensing</td>
    <td>The top-of-catalog high-memory tiers do carry a premium per unit, huge instances are not always available in your AZ, and per-core commercial licensing turns a linear hardware curve into a brutal software bill.</td>
  </tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "At 1,200 writes per second I'm
  nowhere near a single primary's limit, so I'm not sharding. I'd scale the
  database vertically and add a replica — but I want two nodes from day one
  for availability, not for throughput. Those are different reasons and only
  the first one applies today."
</div>

<h3>What horizontal scaling takes away</h3>
<p>
  Adding a second server silently invalidates a set of assumptions that were
  true and invisible when there was one. This is the part candidates skip, and
  it is where the interesting follow-ups live.
</p>
<pre><code><span class="c">// Perfectly correct on one server. Quietly broken on two.</span>
const hits = new Map();

function allowRequest(userId) {
  const n = (hits.get(userId) || 0) + 1;
  hits.set(userId, n);
  return n &lt;= 100;            <span class="c">// "100 requests per user"</span>
}
<span class="c">// With 10 app servers behind a round-robin LB, each user gets ~1000.</span>
<span class="c">// A deploy resets every counter. Autoscaling changes the limit.</span>
<span class="c">// The fix is not a bigger Map — it is moving the counter out of the process.</span></code></pre>
<table>
  <tr><th>What you lose</th><th>Why</th><th>What you do instead</th></tr>
  <tr>
    <td>In-process state</td>
    <td>Rate limit counters, WebSocket connection maps, uploaded file chunks, in-memory caches all become per-node and inconsistent</td>
    <td>Move it to a shared store, or partition deliberately so a given key always lands on the same node</td>
  </tr>
  <tr>
    <td>Session affinity for free</td>
    <td>Consecutive requests from one user hit different servers</td>
    <td>Externalise the session; use sticky sessions only as a last resort and know what they cost</td>
  </tr>
  <tr>
    <td>Easy transactions</td>
    <td>Only holds while all the data is in one database; the moment state spans nodes or services, you need sagas, outbox patterns, or idempotency keys</td>
    <td>Keep transactional data in one store as long as you possibly can — this is a strong reason not to split services early</td>
  </tr>
  <tr>
    <td>Simple debugging</td>
    <td>"Check the log" becomes "check twelve logs"; a bug may reproduce on one node only</td>
    <td>Centralised logging, request IDs, distributed tracing — real infrastructure you now have to own</td>
  </tr>
  <tr>
    <td>Total-failure simplicity</td>
    <td>Systems now fail <em>partially</em>: one node slow, one AZ unreachable, half the writes succeeded</td>
    <td>Timeouts, retries with jitter, idempotency, circuit breakers, health-check-driven ejection</td>
  </tr>
  <tr>
    <td>Cheap in-memory calls</td>
    <td>A function call becomes a network round trip, ~0.5 ms and occasionally failing</td>
    <td>Batch, cache, and resist splitting components that chat constantly</td>
  </tr>
</table>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A second request from the same user is routed by the load balancer to a different app server, which has no copy of the in-memory session, so the user is unexpectedly logged out">
    <g class="rough">
      <path class="ln" d="M104,120 L146,120" />
      <path class="lng" d="M262,112 L318,68" />
      <path class="lnr" d="M262,130 L318,172" />
      <path class="lng dash" d="M452,68 L520,68" />
      <path class="lnr dash" d="M452,172 L520,172" />
    </g>
    <g class="rough">
      <rect class="box"  x="12"  y="96"  width="92"  height="48" rx="6" />
      <rect class="boxy" x="150" y="96"  width="112" height="48" rx="6" />
      <rect class="boxg" x="320" y="42"  width="132" height="52" rx="6" />
      <rect class="boxr" x="320" y="146" width="132" height="52" rx="6" />
    </g>
    <text class="sm" x="58"  y="124" text-anchor="middle">client</text>
    <text class="sm" x="206" y="124" text-anchor="middle">load balancer</text>
    <text class="sm gr" x="386" y="63"  text-anchor="middle">app 1</text>
    <text class="sm gr" x="386" y="81"  text-anchor="middle">session: alice</text>
    <text class="sm rd" x="386" y="167" text-anchor="middle">app 2</text>
    <text class="sm rd" x="386" y="185" text-anchor="middle">no session in memory</text>
    <text class="sm gr" x="272" y="82">login</text>
    <text class="sm rd" x="272" y="162">next request</text>
    <text class="sm gr" x="526" y="72">200 OK</text>
    <text class="sm rd" x="526" y="176">401 — logged out</text>
    <text class="lbl" x="20" y="222" style="font-size:15px">The bug appears only under load balancing, only sometimes, and only in production.</text>
  </svg>
  <figcaption>Nothing here is broken in isolation. Statefulness in the app tier is a correctness bug that scale-out reveals rather than causes.</figcaption>
</figure>

<h3>Stateless and stateful tiers scale differently</h3>
<p>
  The reason the app tier is easy and the data tier is hard comes down to one
  question: does adding a node add capacity, or does it add a copy that must
  be kept in agreement with the others?
</p>
<table>
  <tr><th></th><th>Stateless tier (web, API, workers)</th><th>Stateful tier (databases, caches, queues)</th></tr>
  <tr><td>Add a node and you get</td><td>Linear capacity, immediately</td><td>Another copy to keep consistent — read capacity maybe, write capacity usually not</td></tr>
  <tr><td>Losing a node costs</td><td>The in-flight requests</td><td>Availability, or data, or both, depending on replication settings</td></tr>
  <tr><td>Scaling mechanism</td><td>Autoscaling group behind a load balancer</td><td>Replication, then partitioning/sharding, each with real consistency consequences</td></tr>
  <tr><td>Practical limit</td><td>Whatever the data tier behind it can take</td><td>The write throughput of a single partition</td></tr>
</table>
<p class="sub">
  This is why "make the app tier stateless" is not a style preference. It is
  the move that concentrates all the hard problems into one tier, where you
  can attack them with dedicated tools, instead of spreading them everywhere.
</p>

<h3>Read replicas: the first real scaling move for most systems</h3>
<p>
  Nearly every consumer-facing system is read-heavy, often by 10:1 or 100:1.
  That asymmetry means the highest-leverage change is almost always to serve
  reads from somewhere other than the primary: a cache first, and replicas
  right behind it. A replica is a full copy of the database that applies the
  primary's write stream and serves read-only queries.
</p>
<table>
  <tr><th>Property</th><th>Reality you should state</th></tr>
  <tr><td>What it buys</td><td>Read throughput scales roughly linearly with replica count, plus a warm failover candidate and a place to run analytics without touching production load</td></tr>
  <tr><td>What it does not buy</td><td>Write capacity — every write still executes on the primary <em>and</em> is replayed on every replica, so replicas add write work rather than absorbing it</td></tr>
  <tr><td>Replication lag</td><td>Typically single-digit milliseconds to a couple of seconds; it spikes during bulk writes, schema changes, and long-running queries on the replica</td></tr>
  <tr><td>The correctness trap</td><td>A user writes, is redirected, reads from a lagging replica, and their own change is missing</td></tr>
  <tr><td>The standard fixes</td><td>Route reads to the primary for a short window after a write (read-your-writes), pin a session to the primary, or track a write timestamp/LSN and pick a replica that has caught up</td></tr>
  <tr><td>Synchronous replication</td><td>Removes the lag problem, adds the round trip to every commit and couples your write availability to the replica's health</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ "I'll add read replicas" is only half an answer</span>
  The immediate follow-up is always some form of "what does a user see right
  after they post?" If you have not decided how reads are routed and what
  staleness is acceptable per endpoint, the replica has introduced a
  user-visible bug. State the policy explicitly: profile reads tolerate two
  seconds of staleness, the checkout page does not and goes to the primary.
</div>

<h3>When not to scale out</h3>
<p>
  Premature distribution is one of the most reliable senior-level red flags,
  precisely because it looks like sophistication. The cost is not the servers
  — it is that a distributed system fails in partial, non-reproducible ways,
  and you have taken on that tax before you had the problem it solves. Work
  this list before adding nodes, out loud:
</p>
<ul>
  <li><b>Measure.</b> Which resource is saturated — CPU, memory, disk IOPS, connections, or a lock? "The database is slow" is not a diagnosis, and an interviewer will notice if you skip this.</li>
  <li><b>The missing index.</b> A single index has turned a dying database into an idle one more times than every scaling technique combined.</li>
  <li><b>N+1 queries and chatty calls.</b> 200 sequential queries per page request is an application bug, not a capacity problem.</li>
  <li><b>Connection pool configuration.</b> Databases die from connection exhaustion far more often than from CPU.</li>
  <li><b>Caching the hot 1%.</b> Read distributions are power laws; a small cache usually absorbs most of the traffic.</li>
  <li><b>Move work off the request path.</b> Emails, thumbnails, analytics, and webhooks belong in a queue, not in the user's 200 ms.</li>
  <li><b>Then buy the bigger box.</b> It is a one-line change and it buys months. Take the months.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I distribute anything I
  want to know what's actually saturated. If it's read CPU on the database,
  a cache and a replica fix it for a fraction of the complexity of sharding.
  I'd shard when a single primary can no longer absorb the write rate or the
  dataset no longer fits — those are the two triggers, and neither is true at
  the numbers we estimated."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Do the scale math first: below roughly 10,000 writes/sec or a few terabytes, one primary plus replicas is a defensible design and reaching past it needs justification</li>
  <li>Any prompt with "high availability" is a horizontal question even at tiny scale — you add the second node for failure tolerance, and it happens to also add capacity</li>
  <li>Read-heavy with tolerable staleness (feeds, catalogs, profiles) → cache then replicas; write-heavy or strongly consistent (ledgers, inventory, counters) → replicas do not help and you should say so</li>
  <li>If the design keeps anything per-user in process memory — sessions, WebSocket maps, rate limit counters, upload buffers — that component is stateful and cannot simply be autoscaled; decide where the state goes before you add the second instance</li>
  <li>Distinguish scaling out from sharding: adding stateless app servers is nearly free, and partitioning a database is a one-way door involving hot keys, cross-shard queries, and resharding pain</li>
  <li>The trap is symmetric — under-designing for a stated billion-user scale reads as naive, and over-designing for a stated thousand-user scale reads as undisciplined; the number they gave you is the tiebreaker</li>
</ul>`,
    },
    {
      id: "sysdes-databases-in-design",
      num: "B4",
      title: "Databases in system design",
      short: "Databases in design",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle:
        'The choice is decided by access pattern and consistency need — "SQL doesn\'t scale" is a claim that will cost you the interview.',
      body: `<h3>The axis is access pattern, not scale</h3>
<p>
  Candidates are taught a false dichotomy: relational databases are for small
  consistent things, NoSQL is for big fast things, so pick NoSQL when the
  prompt says "millions of users." Interviewers at senior level are
  specifically listening for this and will push back, because it is wrong on
  the facts. Relational systems run at enormous scale (a large fraction of the
  world's payment and social infrastructure is sharded MySQL or Postgres), and
  plenty of NoSQL deployments are small.
</p>
<p>
  The honest framing is that these systems made different bargains. Relational
  databases keep joins, ad-hoc queries, and multi-row transactions — features
  that are hard to distribute — so distributing them is work you do yourself.
  Most NoSQL systems removed those features up front, which is exactly what
  lets them partition automatically. So the question is never "how much data?"
  It is: <b>do I know my access patterns in advance, and what do I need to be
  true across rows at once?</b>
</p>
<table>
  <tr><th>Question to ask</th><th>Pushes you relational</th><th>Pushes you non-relational</th></tr>
  <tr><td>Do I know every query up front?</td><td>No — the product will invent new ones monthly</td><td>Yes — two or three fixed lookups, forever</td></tr>
  <tr><td>Do I need to combine entities at read time?</td><td>Yes — joins across users, orders, items</td><td>No — one key returns everything needed</td></tr>
  <tr><td>Do I need multi-row atomicity?</td><td>Yes — transfers, inventory, bookings</td><td>Single-key atomicity is enough</td></tr>
  <tr><td>What is the write rate to one logical key?</td><td>Anything a single primary can absorb</td><td>Beyond one node's write capacity, and the keyspace splits cleanly</td></tr>
  <tr><td>Does the shape of the data vary per record?</td><td>No — a stable schema is an asset</td><td>Yes — heterogeneous, sparse, evolving documents</td></tr>
  <tr><td>How bad is stale or lost data?</td><td>Unacceptable — money, medical, legal</td><td>Tolerable — likes, views, telemetry, feeds</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd start relational. The
  access patterns here involve joining users to orders to line items, we need
  a transaction across two of those tables, and the product is going to keep
  inventing queries. If the event-log table becomes the write bottleneck I'd
  move that one table to a wide-column store, rather than moving the whole
  system."
</div>

<h3>The families, and what each is genuinely good at</h3>
<table>
  <tr><th>Family</th><th>Data model</th><th>Genuine strength</th><th>Reach for this when…</th></tr>
  <tr>
    <td>Relational (Postgres, MySQL)</td>
    <td>Tables, rows, foreign keys, a declarative query planner</td>
    <td>Ad-hoc queries, joins, ACID transactions, constraints that make invalid states unrepresentable</td>
    <td>The default. Anything with entities and relationships, and any time you can't yet enumerate the queries</td>
  </tr>
  <tr>
    <td>Key-value (Redis, Memcached, DynamoDB in its simplest use)</td>
    <td>Opaque value behind a single key</td>
    <td>Sub-millisecond point lookups, trivially partitionable, very high throughput</td>
    <td>Caching, sessions, rate limit counters, leaderboards, feature flags — anything you always fetch by exactly one key</td>
  </tr>
  <tr>
    <td>Document (MongoDB, DynamoDB, Couchbase)</td>
    <td>Nested JSON-ish documents, keyed, secondary indexes available</td>
    <td>Fetching one self-contained aggregate in a single read; per-record schema flexibility</td>
    <td>The read unit and the write unit are the same object — a product listing, a user profile, a CMS page</td>
  </tr>
  <tr>
    <td>Wide-column (Cassandra, ScyllaDB, HBase, Bigtable)</td>
    <td>Partition key plus sorted clustering keys; rows can be sparse and wide</td>
    <td>Enormous write throughput on an LSM engine, linear scale-out, efficient range scans within a partition, multi-datacenter replication</td>
    <td>Time series, event logs, messages/feeds per user — huge writes, queries always scoped to one partition key</td>
  </tr>
  <tr>
    <td>Graph (Neo4j, and graph layers on top of relational)</td>
    <td>Nodes and edges as first-class, traversal-oriented query language</td>
    <td>Variable-depth traversal — "friends of friends who like X", shortest path, fraud rings</td>
    <td>The relationships <em>are</em> the query and depth is unbounded; a 2-hop join in SQL is fine, a 6-hop one is not</td>
  </tr>
  <tr>
    <td>Search (Elasticsearch, OpenSearch)</td>
    <td>Inverted index over analysed text plus filters and facets</td>
    <td>Relevance-ranked full-text search, faceting, fuzzy matching</td>
    <td>Users type free text into a box; treat it as a derived index fed from your source of truth, never as the source of truth</td>
  </tr>
  <tr>
    <td>Columnar / OLAP (ClickHouse, BigQuery, Snowflake, Redshift)</td>
    <td>Column-oriented storage, heavy compression, vectorised scans</td>
    <td>Aggregating billions of rows over a few columns in seconds</td>
    <td>Analytics and reporting. Also the correct answer to "how do we stop the analytics team from taking production down"</td>
  </tr>
  <tr>
    <td>Object storage (S3 and equivalents)</td>
    <td>Immutable blobs behind a key, HTTP access</td>
    <td>Effectively unlimited capacity at very low cost per GB, extreme durability</td>
    <td>Images, video, backups, data lake files. Store the bytes here and the metadata in your database — never the bytes in the database</td>
  </tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Naming a database is not a design decision</span>
  "I'll use Cassandra" earns nothing. "I'll use a wide-column store keyed by
  (user_id, bucket) with messages clustered by timestamp descending, because
  every read is the last fifty messages for one user and the write rate is
  100k/sec" earns the whole section. The store follows from the key design;
  present them together or the interviewer cannot tell whether you understand
  the choice or memorised it.
</div>

<h3>The same data, modelled two ways</h3>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="The same blog post data modelled as three normalized relational tables joined at read time, versus a single denormalized document that embeds the author and comments and must be updated in many places when the author changes their name">
    <g class="rough">
      <path class="ln" d="M105,92 L105,124" />
      <path class="ln" d="M105,168 L105,200" />
      <path class="ln dash" d="M300,24 L300,250" />
    </g>
    <g class="rough">
      <rect class="box"  x="30"  y="50"  width="150" height="42" rx="6" />
      <rect class="box"  x="30"  y="126" width="150" height="42" rx="6" />
      <rect class="box"  x="30"  y="202" width="150" height="42" rx="6" />
      <rect class="boxy" x="352" y="48"  width="270" height="196" rx="8" />
      <rect class="box"  x="366" y="64"  width="242" height="38" rx="5" />
      <rect class="box"  x="366" y="112" width="242" height="38" rx="5" />
      <rect class="box"  x="366" y="176" width="242" height="52" rx="5" />
    </g>
    <text class="sm" x="105" y="34"  text-anchor="middle">normalized: one fact, one place</text>
    <text class="sm" x="105" y="76"  text-anchor="middle">users (id, name, avatar)</text>
    <text class="sm" x="105" y="152" text-anchor="middle">posts (id, author_id, body)</text>
    <text class="sm" x="105" y="228" text-anchor="middle">comments (id, post_id, ...)</text>
    <text class="sm" x="487" y="34"  text-anchor="middle">denormalized: one document</text>
    <text class="sm" x="487" y="88"  text-anchor="middle">post: id, body, created_at</text>
    <text class="sm" x="487" y="136" text-anchor="middle">author: name, avatar (copied)</text>
    <text class="sm" x="487" y="196" text-anchor="middle">comments: [ text, author_name,</text>
    <text class="sm" x="487" y="214" text-anchor="middle">... 50 more embedded ]</text>
    <text class="sm rd" x="105" y="268" text-anchor="middle">read = 2 joins</text>
    <text class="sm gr" x="105" y="288" text-anchor="middle">rename author = 1 row updated</text>
    <text class="sm gr" x="487" y="268" text-anchor="middle">read = 1 lookup, no joins</text>
    <text class="sm rd" x="487" y="288" text-anchor="middle">rename author = N documents rewritten</text>
  </svg>
  <figcaption>Denormalization does not remove work, it moves it from read time to write time — and buys that with the risk that two copies of a fact disagree.</figcaption>
</figure>
<p>
  Normalize by default: one fact in one place means an update is one write and
  contradictions are impossible. Denormalize deliberately, when a measured read
  path is too expensive and the data is read far more often than it changes.
  The three costs you must name when you propose it are <b>write
  amplification</b> (one logical change touches many records), <b>update
  anomalies</b> (copies drift, and you now need a repair job), and <b>growth</b>
  (an embedded array of comments is unbounded, and most document stores have a
  hard per-document size limit).
</p>
<table>
  <tr><th></th><th>Normalized</th><th>Denormalized</th></tr>
  <tr><td>Read cost</td><td>Joins at query time, planner-dependent</td><td>One lookup by key</td></tr>
  <tr><td>Write cost</td><td>One row</td><td>Fan-out to every copy, often asynchronously</td></tr>
  <tr><td>Consistency</td><td>Enforced by the database</td><td>Your responsibility, and eventual at best</td></tr>
  <tr><td>Schema change</td><td>One migration</td><td>Backfill every copy</td></tr>
  <tr><td>Reach for this when…</td><td>Default — until profiling says otherwise</td><td>Read/write ratio is extreme, the shape is stable, and staleness between copies is acceptable</td></tr>
</table>
<p class="sub">
  Notice the symmetry with feed design: a normalized model is fan-out-on-read,
  a denormalized one is fan-out-on-write. It is the same tradeoff at a
  different altitude, which is worth saying out loud — interviewers reward
  candidates who recognise a pattern they have already discussed.
</p>

<h3>Indexes: what they buy and what they cost</h3>
<p>
  An index is a second data structure — usually a B-tree — that maps column
  values to row locations in sorted order, turning a full table scan into a
  logarithmic descent. That is the benefit, and it is enormous: on a
  ten-million-row table it is the difference between seconds and microseconds.
  The cost is paid on every write, and candidates almost never mention it
  unprompted.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A single row insert expanding into four physical writes: the table heap page, the write ahead log, and one update for each of two secondary indexes">
    <g class="rough">
      <path class="ln" d="M148,114 L278,39" />
      <path class="ln" d="M148,114 L278,85" />
      <path class="lnr" d="M148,114 L278,131" />
      <path class="lnr" d="M148,114 L278,177" />
    </g>
    <g class="rough">
      <rect class="boxy" x="16"  y="90"  width="132" height="48" rx="6" />
      <rect class="box"  x="278" y="20"  width="172" height="38" rx="5" />
      <rect class="box"  x="278" y="66"  width="172" height="38" rx="5" />
      <rect class="boxr" x="278" y="112" width="172" height="38" rx="5" />
      <rect class="boxr" x="278" y="158" width="172" height="38" rx="5" />
    </g>
    <text class="sm" x="82"  y="112" text-anchor="middle">INSERT</text>
    <text class="sm" x="82"  y="130" text-anchor="middle">one row</text>
    <text class="sm" x="364" y="44"  text-anchor="middle">table heap page</text>
    <text class="sm" x="364" y="90"  text-anchor="middle">write-ahead log (fsync)</text>
    <text class="sm rd" x="364" y="136" text-anchor="middle">index on (user_id)</text>
    <text class="sm rd" x="364" y="182" text-anchor="middle">index on (created_at)</text>
    <text class="sm rd" x="466" y="106">one logical write</text>
    <text class="sm rd" x="466" y="126">= four physical writes</text>
    <text class="lbl" x="20" y="220" style="font-size:15px">Each extra index is a permanent tax on every insert, update and delete of that table.</text>
  </svg>
  <figcaption>Indexes are not free storage tricks; they are a read/write tradeoff you are making on behalf of every future write.</figcaption>
</figure>
<ul>
  <li><b>Write amplification.</b> Each secondary index adds a structural update per write, often at a random location in the tree. Five indexes on a hot table can cut write throughput by half or more, and index maintenance also inflates the WAL.</li>
  <li><b>Selectivity decides everything.</b> An index only helps when it eliminates most rows. An index on a boolean column with a 50/50 split is worse than useless — the planner will correctly ignore it, because random-access lookups for half the table cost more than a sequential scan.</li>
  <li><b>Composite indexes are left-prefix.</b> An index on (a, b, c) serves queries filtering on a, on a and b, or on all three; it does not serve a query filtering only on b. Order the columns by equality-filters first, then the range or sort column.</li>
  <li><b>Covering indexes.</b> If the index contains every column the query needs, the database never touches the table — an index-only scan, often several times faster.</li>
  <li><b>The planner can be wrong.</b> It chooses from cost estimates based on statistics, and stale statistics or a skewed distribution produce catastrophically bad plans, which is why "read the query plan" is a real skill.</li>
</ul>
<pre><code><span class="c">-- The query the product actually runs</span>
SELECT id, body FROM posts
WHERE author_id = 42 AND created_at &gt; now() - interval '7 days'
ORDER BY created_at DESC LIMIT 20;

<span class="c">-- Wrong order: created_at first means every recent post by anyone is scanned</span>
CREATE INDEX ON posts (created_at, author_id);

<span class="c">-- Right: equality column first, then the range/sort column</span>
CREATE INDEX ON posts (author_id, created_at DESC);
<span class="c">-- Now the rows are already sorted within author_id -- the LIMIT stops early,</span>
<span class="c">-- and EXPLAIN ANALYZE shows an index scan with no sort node at all.</span></code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "This table is write-heavy, so
  I want the smallest number of indexes that serve the query patterns — one
  composite on (author_id, created_at DESC) covers both the filter and the
  ordering. I'd check EXPLAIN ANALYZE for a sort node; if one appears, the
  index isn't doing its job."
</div>

<h3>Read-heavy and write-heavy are different problems</h3>
<table>
  <tr><th></th><th>Read-heavy (feeds, catalogs, profiles)</th><th>Write-heavy (events, telemetry, messages, ledgers)</th></tr>
  <tr><td>First move</td><td>Cache the hot set; reads follow a power law</td><td>Batch and buffer writes; append rather than update in place</td></tr>
  <tr><td>Second move</td><td>Read replicas, with an explicit staleness policy per endpoint</td><td>Partition by key so writes spread across nodes</td></tr>
  <tr><td>Indexing posture</td><td>Index generously — reads dominate</td><td>Index sparingly — every index taxes the hot path</td></tr>
  <tr><td>Data modelling</td><td>Denormalize toward the read shape</td><td>Keep writes narrow; derive read models asynchronously</td></tr>
  <tr><td>Storage engine that fits</td><td>B-tree — reads land in one place, in-place updates</td><td>LSM tree — writes go to an in-memory table then flush sequentially; costs read amplification and background compaction I/O</td></tr>
  <tr><td>Typical stores</td><td>Postgres/MySQL plus Redis plus a CDN</td><td>Cassandra, ScyllaDB, RocksDB-backed systems, Kafka as a write buffer</td></tr>
</table>
<p class="sub">
  Being able to say "B-tree for read-optimised in-place updates, LSM for
  write-optimised sequential flushes, and the LSM's price is read amplification
  plus compaction" is one of the highest-value-per-word things you can put on
  the whiteboard. It explains a whole category of database choices in one
  sentence.
</p>

<h3>Connection pooling, the bottleneck nobody draws</h3>
<p>
  Databases do not accept unlimited connections, and the limit is far lower
  than people expect. Postgres forks a process per connection at roughly 5-10
  MB of overhead each, and typical configurations cap out between 100 and 500.
  MySQL uses threads and is cheaper, but the shape is identical. Meanwhile a
  fleet of 50 app servers each holding a 20-connection pool wants 1,000
  connections, and the database falls over — not from query load, but from
  connection count.
</p>
<table>
  <tr><th>Concept</th><th>Number to quote</th><th>Consequence</th></tr>
  <tr><td>Useful pool size</td><td>Roughly 2-4x the database's CPU core count, in total across all clients</td><td>Beyond that, throughput <em>drops</em> — you have added queueing and context switching, not capacity</td></tr>
  <tr><td>Per-connection overhead</td><td>~5-10 MB in Postgres</td><td>Idle connections consume real memory that the page cache wanted</td></tr>
  <tr><td>External pooler (PgBouncer and friends)</td><td>Multiplexes thousands of client connections onto tens of server connections</td><td>Transaction-level pooling breaks session state: prepared statements, session variables, advisory locks, and long transactions</td></tr>
  <tr><td>Serverless and autoscaled functions</td><td>Each instance opens its own connections; scale-out multiplies them</td><td>A pooler or a data proxy is mandatory, not optional</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ "Just raise max_connections" is the wrong instinct</span>
  It converts a fast failure into a slow one. The database now accepts every
  connection and services all of them badly, so latency climbs across the
  board instead of a few clients being rejected. The right answer is a
  bounded pool plus a pooler in front, and rejecting or queueing excess work
  at the application edge where you can shed it cheaply.
</div>

<h3>Where "just use Postgres" is the right senior answer</h3>
<p>
  A candidate who reaches for six specialised stores in a 45-minute design is
  describing an operational burden, not an architecture. Every additional
  datastore is another failure mode, another backup and restore story, another
  consistency boundary, and another thing your on-call has to understand at 3
  a.m. One mature relational database covers a startling amount of ground:
</p>
<ul>
  <li><b>Document store</b> — JSONB columns with GIN indexes handle schemaless data honestly well</li>
  <li><b>Key-value</b> — a two-column table with a primary key is a fine key-value store at any scale a single node handles</li>
  <li><b>Search</b> — built-in full-text is genuinely good up to millions of documents before Elasticsearch earns its keep</li>
  <li><b>Queue</b> — SELECT ... FOR UPDATE SKIP LOCKED gives you a correct work queue, comfortably into the thousands of jobs per second</li>
  <li><b>Geospatial, time-series, vectors</b> — PostGIS, partitioned time ranges, and pgvector all exist and are used in production</li>
  <li><b>Analytics</b> — a read replica keeps reporting queries off the primary until data volumes genuinely demand a columnar engine</li>
</ul>
<p>
  The point is not that Postgres is always right. The point is that
  consolidating on one store buys operational simplicity, and simplicity is a
  legitimate design goal you are allowed to argue for. State the exit
  conditions and you get the credit without sounding dogmatic.
</p>
<table>
  <tr><th>Reach past Postgres when…</th><th>Because</th></tr>
  <tr><td>Sustained writes exceed what one primary can absorb (roughly tens of thousands per second, workload dependent)</td><td>A partitioned wide-column store scales writes horizontally by design</td></tr>
  <tr><td>You need active-active writes in multiple regions</td><td>Single-leader replication cannot do it; you need multi-leader, a leaderless store, or distributed SQL like Spanner or CockroachDB</td></tr>
  <tr><td>Queries are relevance-ranked free text</td><td>An inverted index with proper analysers and scoring is a different data structure</td></tr>
  <tr><td>Analytics scan billions of rows over a few columns</td><td>Row storage reads columns you don't need; columnar engines are 10-100x faster here</td></tr>
  <tr><td>Access is a single key at sub-millisecond latency, at very high rates</td><td>An in-memory key-value store avoids disk, planner, and MVCC overhead entirely</td></tr>
  <tr><td>The workload is deep, variable-length graph traversal</td><td>Recursive joins degrade badly past a few hops</td></tr>
</table>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Before choosing a store, write the two or three highest-volume queries as literal key lookups — the key you need is usually the partition key, and it decides the store more than the store decides the key</li>
  <li>"Transaction", "balance", "inventory", "booking", "must not double-charge" → relational with real ACID, or an explicit idempotency and reconciliation design; do not hand-wave this one</li>
  <li>"Timeline", "feed", "events", "telemetry", "messages" with huge write volume and partition-scoped reads → wide-column on an LSM engine; expect the follow-up about hot partitions</li>
  <li>If the prompt implies free-text search or analytics, propose a derived index fed from the source of truth, and be ready to explain how it stays in sync (change data capture, dual writes plus reconciliation, or a periodic rebuild)</li>
  <li>Any time you propose denormalization, name the write amplification and the repair path in the same breath — proposing it without them is the most common way to lose the data-modelling signal</li>
  <li>Distinguish "this table is a bottleneck" from "this database is a bottleneck": the first is solved with an index, a cache, or moving one table, and the first is far more often the truth</li>
</ul>`,
    },
    {
      id: "sysdes-caching-fundamentals",
      num: "B5",
      title: "Caching fundamentals",
      short: "Caching fundamentals",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle:
        "A cache is one bet placed at seven distances — and the interesting number is never the hit rate, it's the miss rate.",
      body: `<h3>Every cache is the same bet, made at a different distance</h3>
<p>
  A cache exists because of exactly one wager: <b>this answer will be asked
  for again before it changes</b>. Every caching layer in every architecture
  is that same bet — the layers differ only in how far from the user the copy
  sits, who pays when the bet is wrong, and how hard it is to take the copy
  back. Interviewers ask about caching constantly, not because inserting a
  Redis is hard, but because it is the fastest way to find out whether you
  reason about a system in <em>rates and distributions</em> or in adjectives.
  A candidate who says "we'll add a cache" and a candidate who says "at a 90%
  hit rate this still sends 50k reads a second to the primary, so 90% isn't
  the goal" are two very different hires.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="The six caching layers a request can pass through, from the browser through a CDN edge, reverse proxy, in-process application memory, a shared Redis tier and the database buffer pool, ending at disk, each labelled with its typical latency">
    <g class="rough">
      <path class="ln" d="M104,92 L120,92" />
      <path class="ln" d="M208,92 L224,92" />
      <path class="ln" d="M312,92 L328,92" />
      <path class="ln" d="M416,92 L432,92" />
      <path class="ln" d="M520,92 L536,92" />
      <path class="lnr" d="M580,116 L580,178" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="70" width="88" height="44" rx="6" />
      <rect class="boxy" x="120" y="70" width="88" height="44" rx="6" />
      <rect class="box"  x="224" y="70" width="88" height="44" rx="6" />
      <rect class="boxy" x="328" y="70" width="88" height="44" rx="6" />
      <rect class="boxy" x="432" y="70" width="88" height="44" rx="6" />
      <rect class="box"  x="536" y="70" width="88" height="44" rx="6" />
      <rect class="boxr" x="536" y="178" width="88" height="40" rx="6" />
    </g>
    <text class="lbl" x="320" y="30" text-anchor="middle">one request, six chances to never reach disk</text>
    <text class="sm" x="60"  y="90" text-anchor="middle">browser</text>
    <text class="sm" x="164" y="90" text-anchor="middle">CDN edge</text>
    <text class="sm" x="268" y="90" text-anchor="middle">reverse</text>
    <text class="sm" x="268" y="106" text-anchor="middle">proxy</text>
    <text class="sm" x="372" y="90" text-anchor="middle">app memory</text>
    <text class="sm" x="476" y="90" text-anchor="middle">Redis tier</text>
    <text class="sm" x="580" y="90" text-anchor="middle">DB buffer</text>
    <text class="sm" x="580" y="106" text-anchor="middle">pool</text>
    <text class="sm gr" x="60"  y="134" text-anchor="middle">0 ms</text>
    <text class="sm gr" x="164" y="134" text-anchor="middle">10-30 ms</text>
    <text class="sm gr" x="268" y="134" text-anchor="middle">1-3 ms</text>
    <text class="sm gr" x="372" y="134" text-anchor="middle">~100 ns</text>
    <text class="sm gr" x="476" y="134" text-anchor="middle">0.3-1 ms</text>
    <text class="sm gr" x="580" y="134" text-anchor="middle">~0.1 ms</text>
    <text class="sm rd" x="580" y="203" text-anchor="middle">SSD 0.1-1 ms</text>
    <text class="sm" x="262" y="160" text-anchor="middle">each layer removes work from every layer to its right</text>
    <text class="sm" x="262" y="182" text-anchor="middle">the leftmost hit is the cheapest — and the hardest to invalidate</text>
    <text class="sm" x="262" y="204" text-anchor="middle">a full miss pays every hop, not just the last one</text>
  </svg>
  <figcaption>Notice the asymmetry: latency improves by four orders of magnitude as you move left, and your ability to revoke a stale copy gets worse by roughly the same amount.</figcaption>
</figure>

<h3>What each layer actually buys you</h3>
<table>
  <tr><th>Layer</th><th>Caches</th><th>Typical TTL</th><th>Who can invalidate it</th><th>What it really buys</th></tr>
  <tr><td>Browser / HTTP cache</td><td>Static assets, GET responses, service-worker data</td><td>Minutes to a year (fingerprinted assets)</td><td><b>Nobody.</b> Once served, it is gone until it expires</td><td>Removes the request entirely — the only layer that saves network, not just work</td></tr>
  <tr><td>CDN edge</td><td>Assets, whole pages, API GETs, images</td><td>Seconds to days</td><td>You, via purge — but propagation takes 1-30 s</td><td>Cuts RTT from ~120 ms to ~20 ms and absorbs 80-99% of read traffic before it reaches your region</td></tr>
  <tr><td>Reverse proxy (nginx, Varnish, Envoy)</td><td>Rendered fragments, upstream responses</td><td>Seconds to minutes</td><td>You, instantly — it's your box</td><td>Shields origin from duplicate work; the natural home for request coalescing</td></tr>
  <tr><td>In-process (Caffeine, an LRU Map)</td><td>Config, feature flags, hot rows, compiled templates</td><td>Seconds to minutes</td><td>Only that process; every instance has its own copy</td><td>~100 ns lookups, zero network — but N instances means N copies and N stale windows</td></tr>
  <tr><td>Shared cache tier (Redis, Memcached)</td><td>Objects, session state, computed aggregates, rate-limit counters</td><td>Seconds to hours</td><td>You, atomically, for the whole fleet</td><td>One consistent copy across all app servers; the workhorse layer</td></tr>
  <tr><td>Database buffer pool</td><td>Pages the storage engine recently touched</td><td>Until evicted</td><td>Nobody — and you don't want to</td><td>Free, already on; the reason "the database is slow" is usually false for hot data</td></tr>
</table>
<p class="sub">
  The buffer pool is the layer candidates forget exists, and it changes the
  conversation. A Postgres box with 64 GB of RAM and a 40 GB hot set is
  already serving nearly every read from memory. Adding Redis in front of it
  does not save you a disk seek — it saves you connection setup, query
  parsing, planning, MVCC visibility checks and result serialisation. That is
  still worth 5-20× on latency, but say <em>why</em>, because "the database
  reads from disk" is frequently wrong and an interviewer who runs databases
  will notice.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd cache at two layers here.
  CDN for the read-only public content, because that removes traffic from my
  region entirely, and a shared Redis tier for per-user objects, because
  those need one consistent copy across the fleet. I'd deliberately skip a
  per-instance in-memory cache for anything mutable — N instances means N
  independent stale windows and no way to purge them."
</div>

<h3>Read strategies: cache-aside vs read-through</h3>
<p>
  <b>Cache-aside</b> (also "lazy loading") puts the application in charge:
  ask the cache, and on a miss go fetch and populate it yourself. This is the
  one you will be asked to write on a whiteboard, so write it well — the
  three-line version everyone produces has three real bugs in it.
</p>
<pre><code>async function getUser(id) {
  const key = \`user:v3:\${id}\`;                <span class="c">// v3 = payload schema version; see invalidation</span>
  const hit = await redis.get(key);

  <span class="c">// !== null, not truthy: a legitimately cached 0, "" or false is a HIT.</span>
  <span class="c">// if (hit) is the single most common bug in this function.</span>
  if (hit !== null) return JSON.parse(hit);

  const row = await db.users.findById(id);    <span class="c">// the miss path — the expensive part</span>

  if (row === null) {
    <span class="c">// Negative caching. Without it, a scraper hitting nonexistent ids</span>
    <span class="c">// passes straight through the cache into the database, every time.</span>
    await redis.set(key, "null", "EX", 30);
    return null;
  }

  <span class="c">// Jittered TTL: 300 s ± 30. A million keys populated in the same minute</span>
  <span class="c">// must not expire in the same second. This one line prevents avalanche.</span>
  const ttl = 300 + Math.floor(Math.random() * 61) - 30;
  await redis.set(key, JSON.stringify(row), "EX", ttl);
  return row;
}</code></pre>
<p>
  Note what this function does <em>not</em> do: it never writes to the cache
  on the write path. The write path deletes the key and lets the next read
  repopulate it. That asymmetry is deliberate and we'll see why in the
  invalidation section.
</p>
<p>
  <b>Read-through</b> moves that same logic behind the cache client, so the
  application only ever talks to the cache and the cache knows how to load a
  miss. Cleaner code, one place to implement coalescing and metrics — but the
  cache is now on the critical path for correctness, not just speed. With
  cache-aside, Redis being down means slow. With read-through, Redis being
  down means down. That distinction is the whole answer when an interviewer
  asks which you'd pick.
</p>

<h3>Write strategies, and when each is right</h3>
<table>
  <tr><th>Strategy</th><th>What the write does</th><th>Cost</th><th>Failure mode</th><th>Reach for this when…</th></tr>
  <tr><td><b>Cache-aside + invalidate</b></td><td>Write DB, then <code>DEL</code> the key</td><td>None on the write path</td><td>A read/write interleaving can leave a stale entry until TTL</td><td>The default. Pick this unless you can name why not</td></tr>
  <tr><td><b>Write-through</b></td><td>Write cache and DB synchronously, both must succeed</td><td>Every write pays both latencies</td><td>Caches data that may never be read; a cache outage stalls writes</td><td>The same key is read within seconds of being written (profile edit, cart update) and write latency budget is loose</td></tr>
  <tr><td><b>Write-behind (write-back)</b></td><td>Write cache, ack the client, flush to DB in batches later</td><td>Durability — the ack is a lie until the flush lands</td><td>Cache node dies with unflushed writes; ordering across keys is hard</td><td>High-volume, low-value-per-write, <em>coalescable</em> data: view counts, likes, "last seen", metrics</td></tr>
  <tr><td><b>Write-around</b></td><td>Write DB only, never touch the cache</td><td>First read after a write is always a miss</td><td>Nothing, which is the point</td><td>Bulk imports, logs, audit rows — write-once data that would otherwise evict your hot set</td></tr>
  <tr><td><b>Refresh-ahead</b></td><td>Proactively recompute an entry before its TTL expires</td><td>Wasted work on keys nobody asks for again</td><td>Amplifies load if applied to a large keyspace</td><td>A small, known set of extremely hot keys — a homepage feed, a leaderboard, a config blob</td></tr>
</table>
<p class="sub">
  Write-behind is the one worth volunteering. A "like" counter taking 50k
  increments a second is 50k row updates a second with lock contention on a
  single hot row — a database will simply refuse. Buffer the increments in
  Redis, flush the delta every second, and 50k writes become one. You have
  traded "we might lose the last second of counts if a Redis node dies" for a
  50,000× reduction in write load, and for a like counter that is obviously
  the right trade. Say the trade out loud; that is the whole point of the
  answer.
</p>

<h3>Eviction: what happens when memory runs out</h3>
<p>
  TTL is <em>expiry</em> — the entry becomes invalid at a known time. Eviction
  is what the cache does when it is full and someone wants to write anyway.
  They are different mechanisms and conflating them is a tell.
</p>
<table>
  <tr><th>Policy</th><th>Keeps</th><th>Breaks on</th><th>Reach for this when…</th></tr>
  <tr><td><b>LRU</b></td><td>Recently accessed keys</td><td>Scans — one analytics query touching a million cold rows flushes your entire working set</td><td>General purpose, access is recency-correlated (sessions, recent items)</td></tr>
  <tr><td><b>LFU</b></td><td>Frequently accessed keys</td><td>Aging — yesterday's viral post keeps a slot forever unless counters decay</td><td>A stable long-tail popularity distribution; scan resistance matters</td></tr>
  <tr><td><b>FIFO / random</b></td><td>Nothing in particular</td><td>Nothing badly, surprisingly</td><td>You need O(1) with zero bookkeeping; random eviction is within a few points of LRU in practice</td></tr>
  <tr><td><b>TTL-only (volatile-ttl)</b></td><td>Entries furthest from expiry</td><td>Keys written without a TTL — they become unevictable</td><td>Every entry genuinely has a natural lifetime</td></tr>
  <tr><td><b>W-TinyLFU (Caffeine)</b></td><td>Whatever a frequency sketch says earns its slot</td><td>Very little; near-optimal hit rates</td><td>In-process JVM caches where the extra few percent of hit rate is worth a real library</td></tr>
</table>
<p>
  Two implementation details worth knowing because they get asked. First,
  Redis does not implement true LRU: it samples a handful of keys
  (<code>maxmemory-samples</code>, default 5) and evicts the least recently
  used <em>of the sample</em>. It gets within a percent or two of exact LRU
  for a fraction of the bookkeeping, and it is a nice example of the
  approximate-is-fine reasoning these systems are built on. Second, Redis LFU
  counters are 8-bit probabilistic counters with logarithmic increment and
  time-based decay — you cannot store a true frequency for a billion keys, so
  you store something that ranks them correctly and costs one byte.
</p>
<div class="warn">
  <span class="ttl">⚠ Running a datastore under an eviction policy</span>
  Sessions, idempotency keys, rate-limit state and distributed locks are
  frequently parked in "the Redis" — which is configured
  <code>allkeys-lru</code> because it is a cache. Under memory pressure it
  will silently evict a session and log a user out, or evict an idempotency
  key and let a duplicate payment through. Anything whose loss is a
  correctness bug belongs in a separate instance set to
  <code>noeviction</code>, where a full memory condition fails writes loudly
  instead of corrupting state quietly.
</div>

<h3>Invalidation is hard, and here is exactly why</h3>
<p>
  "There are two hard things in computer science" is a joke everyone repeats
  and almost nobody unpacks. The concrete reason is this: <b>there is no
  transaction that spans your cache and your database</b>. They are two
  independent systems, so any two operations against them can interleave, and
  one specific interleaving is permanently damaging.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A timeline showing a reader thread missing the cache and reading version one from the database, while a writer thread commits version two and deletes the empty cache key in between, after which the reader writes the stale version one back into the cache">
    <g class="rough">
      <path class="ln" d="M8,198 L624,198" />
      <path class="lnr dash" d="M190,88 L562,88" />
    </g>
    <g class="rough">
      <rect class="box"  x="8"   y="44"  width="116" height="44" rx="6" />
      <rect class="box"  x="132" y="44"  width="116" height="44" rx="6" />
      <rect class="boxy" x="256" y="120" width="116" height="44" rx="6" />
      <rect class="boxy" x="380" y="120" width="116" height="44" rx="6" />
      <rect class="boxr" x="504" y="44"  width="128" height="44" rx="6" />
    </g>
    <text class="sm" x="8" y="36">reader A</text>
    <text class="sm" x="256" y="112">writer B</text>
    <text class="sm" x="66"  y="64" text-anchor="middle">GET key</text>
    <text class="sm" x="66"  y="80" text-anchor="middle">→ miss</text>
    <text class="sm" x="190" y="64" text-anchor="middle">SELECT</text>
    <text class="sm" x="190" y="80" text-anchor="middle">→ v1</text>
    <text class="sm" x="314" y="140" text-anchor="middle">UPDATE</text>
    <text class="sm" x="314" y="156" text-anchor="middle">→ v2 committed</text>
    <text class="sm" x="438" y="140" text-anchor="middle">DEL key</text>
    <text class="sm" x="438" y="156" text-anchor="middle">→ nothing there</text>
    <text class="sm rd" x="568" y="64" text-anchor="middle">SET key = v1</text>
    <text class="sm rd" x="568" y="80" text-anchor="middle">(stale)</text>
    <text class="sm" x="376" y="82" text-anchor="middle">A is holding v1 across this entire window</text>
    <text class="sm" x="8" y="190">t0</text>
    <text class="sm" x="132" y="190">t1</text>
    <text class="sm" x="256" y="190">t2</text>
    <text class="sm" x="380" y="190">t3</text>
    <text class="sm" x="504" y="190">t4</text>
    <text class="lbl rd" x="320" y="222" text-anchor="middle" style="font-size:15px">the cache now serves v1 until the TTL expires — the delete already happened</text>
  </svg>
  <figcaption>Nothing failed and nobody wrote buggy code. The reader simply held a value across a window in which the world changed, and then persisted it. Every cache-aside deployment has this race; the only question is how long it can last.</figcaption>
</figure>
<p>
  Once you can draw that, the practical patterns stop being folklore and
  become answers to a specific question — <em>how long can a stale entry
  survive?</em>
</p>
<ul>
  <li><b>TTL.</b> The honest answer. It does not prevent staleness, it bounds it. A 60-second TTL means the worst case above resolves in at most 60 seconds. Most systems are correct <em>because of</em> TTL, not because of clever invalidation, and saying so is a sign of experience rather than a concession.</li>
  <li><b>Delete, never update.</b> On write, <code>DEL</code> the key; do not compute the new value and <code>SET</code> it. Two concurrent writers who both <code>SET</code> can land in either order and the loser's value sticks. Two concurrent writers who both <code>DEL</code> converge on "empty", and the next read repopulates from the committed source of truth.</li>
  <li><b>Versioned keys.</b> The strongest pattern. Never mutate an entry — put the version in the key: <code>user:42:v17</code>, where 17 comes from a row counter, an ETag, or the row's <code>updated_at</code>. A write bumps the version, so it is writing to a key nobody will ever read again. The race above becomes harmless: A's stale <code>SET</code> lands on <code>v16</code>, which no reader will ever request. Old entries cost memory until LRU reaps them, and that is the entire price.</li>
  <li><b>Explicit purge / surrogate keys.</b> What CDNs give you: tag a response <code>product:42</code> and purge every edge copy carrying that tag in one call. Essential at the CDN layer, but remember purge is itself a distributed system — it takes seconds, and it can fail.</li>
  <li><b>CDC-driven invalidation.</b> Tail the database's write-ahead log (Debezium and friends) and emit invalidations from there. This is the only approach where invalidation is derived from <em>committed</em> state, in commit order, with no dual write. It costs you a pipeline; buy it when correctness matters more than simplicity.</li>
</ul>
<div class="sticky mint">
  <span class="ttl">The one that dissolves the problem</span>
  The only cache you never have to invalidate is one whose key contains the
  identity of its content. Fingerprinted asset URLs, versioned cache keys and
  content-addressed blobs are all the same trick: make the new value live at
  a new address, and staleness becomes impossible rather than merely
  short-lived.
</div>
<div class="warn">
  <span class="ttl">⚠ The layer you cannot take back</span>
  You can purge Redis in a millisecond and a CDN in ten seconds, but a
  response you served with <code>Cache-Control: max-age=3600</code> is sitting
  in a browser you will never speak to again for the next hour. This is why
  HTML gets <code>no-cache</code> or a short max-age while fingerprinted JS
  and CSS get <code>immutable, max-age=31536000</code>. Get that backwards and
  a bad deploy is unfixable for everyone who loaded the page.
</div>

<h3>Thundering herd, and the four ways to stop it</h3>
<p>
  A single key serving 50,000 requests a second expires. Recomputing it takes
  20 ms. In that window <b>50,000 × 0.020 = 1,000 requests</b> all miss, all
  decide independently to recompute, and all hit the database with the same
  query at the same instant. The database was comfortably serving one query
  per five minutes for that key; it now gets a thousand at once. Nothing was
  misconfigured. The cache working correctly produced the outage.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Side by side comparison showing a hot key expiring and sending a thousand duplicate queries to the database, versus the same traffic passing through a request coalescing layer that issues exactly one query and shares the result">
    <g class="rough">
      <path class="lnr" d="M60,84 L110,168" />
      <path class="lnr" d="M100,84 L125,168" />
      <path class="lnr" d="M140,84 L140,168" />
      <path class="lnr" d="M180,84 L155,168" />
      <path class="lnr" d="M220,84 L170,168" />
      <path class="ln" d="M400,84 L470,110" />
      <path class="ln" d="M470,84 L490,110" />
      <path class="ln" d="M540,84 L510,110" />
      <path class="lng" d="M490,150 L490,168" />
      <path class="ln dash" d="M320,14 L320,236" />
    </g>
    <g class="rough">
      <rect class="boxy" x="20"  y="40"  width="240" height="44" rx="6" />
      <rect class="boxr" x="80"  y="168" width="120" height="44" rx="6" />
      <rect class="boxy" x="360" y="40"  width="240" height="44" rx="6" />
      <rect class="boxg" x="410" y="110" width="160" height="40" rx="6" />
      <rect class="boxg" x="430" y="168" width="120" height="44" rx="6" />
    </g>
    <text class="lbl" x="140" y="30" text-anchor="middle">naive</text>
    <text class="lbl" x="480" y="30" text-anchor="middle">coalesced</text>
    <text class="sm" x="140" y="60" text-anchor="middle">1,000 requests arrive during</text>
    <text class="sm" x="140" y="76" text-anchor="middle">the 20 ms recompute window</text>
    <text class="sm" x="480" y="60" text-anchor="middle">1,000 requests arrive during</text>
    <text class="sm" x="480" y="76" text-anchor="middle">the 20 ms recompute window</text>
    <text class="sm" x="490" y="135" text-anchor="middle">singleflight / lock</text>
    <text class="sm rd" x="140" y="194" text-anchor="middle">1,000 queries</text>
    <text class="sm gr" x="490" y="194" text-anchor="middle">1 query</text>
    <text class="sm rd" x="140" y="230" text-anchor="middle">the database sees a 1,000× spike on one key</text>
    <text class="sm gr" x="480" y="230" text-anchor="middle">999 callers await the same promise</text>
  </svg>
  <figcaption>The fix is not a bigger database. It is recognising that a thousand identical concurrent questions deserve one answer, and that the cache is the natural place to enforce that.</figcaption>
</figure>
<pre><code>const inflight = new Map();                    <span class="c">// key → Promise, per process</span>

function coalesce(key, loader) {
  const existing = inflight.get(key);
  if (existing) return existing;               <span class="c">// 999 callers join the same promise</span>

  <span class="c">// finally() matters: on rejection the entry must clear, or one</span>
  <span class="c">// transient error is cached as a permanent failure for that key.</span>
  const p = loader().finally(() =&gt; inflight.delete(key));
  inflight.set(key, p);
  return p;
}</code></pre>
<p class="sub">
  Be precise about the scope of that fix: it coalesces <em>within one
  process</em>. With 40 app servers you have gone from 1,000 queries to 40,
  which is usually enough. If it isn't, the cross-process version is a
  <code>SET key NX EX 10</code> lock in Redis — one winner recomputes, the
  losers either wait briefly or serve the stale value — and you should say
  out loud that you have just introduced a distributed lock, with the lease
  expiry and fencing questions that come with it.
</p>
<table>
  <tr><th>Technique</th><th>Mechanism</th><th>Cost</th><th>Reach for this when…</th></tr>
  <tr><td>Request coalescing / singleflight</td><td>One in-flight load per key; everyone else awaits it</td><td>A few lines; per-process only</td><td>Always. This is the baseline, not an optimisation</td></tr>
  <tr><td>Jittered TTL</td><td><code>ttl = base ± rand(base × 0.1)</code></td><td>One line, no downside</td><td>Always — and specifically whenever many keys are populated together (deploy, warm-up, bulk import)</td></tr>
  <tr><td>Early / probabilistic recompute</td><td>Refresh before expiry with probability rising as expiry nears</td><td>A little duplicate work; needs the last recompute duration stored</td><td>A handful of extremely hot keys where even one miss is a visible latency spike</td></tr>
  <tr><td>Stale-while-revalidate</td><td>Serve the expired value immediately, refresh in the background</td><td>Bounded staleness, by design</td><td>Read paths that tolerate a few seconds of stale data — which is most read paths</td></tr>
  <tr><td>Negative caching + bloom filter</td><td>Cache "does not exist"; or test membership before querying</td><td>A short stale window on newly created ids</td><td>Enumerable keyspaces where a scraper or a bug can request ids that were never real</td></tr>
</table>
<p>
  The probabilistic version is worth naming precisely because it sounds like
  an invented answer otherwise. XFetch: store how long the last recompute
  took as <code>delta</code>, and on every read refresh early if
  <code>now − delta × beta × ln(random()) ≥ expiry</code>, with
  <code>beta</code> around 1. Expensive-to-compute entries and entries close
  to expiry refresh sooner, probabilistically, so exactly one unlucky reader
  usually does the work before anyone has to wait for it.
</p>

<h3>Hit-rate arithmetic: why 90% is not a good number</h3>
<p>
  This is the section that wins interviews, because almost nobody does the
  arithmetic. Take a read tier serving <b>500,000 reads/sec</b>, backed by
  replicas that each sustain about <b>8,000 point reads/sec</b> before p99
  degrades.
</p>
<table>
  <tr><th>Hit rate</th><th>Miss rate</th><th>Reads reaching the database</th><th>Replicas required</th></tr>
  <tr><td>90%</td><td>10%</td><td>500,000 × 0.10 = <b>50,000/s</b></td><td>50,000 ÷ 8,000 = <b>7</b></td></tr>
  <tr><td>95%</td><td>5%</td><td>500,000 × 0.05 = <b>25,000/s</b></td><td><b>4</b></td></tr>
  <tr><td>99%</td><td>1%</td><td>500,000 × 0.01 = <b>5,000/s</b></td><td><b>1</b></td></tr>
  <tr><td>99.9%</td><td>0.1%</td><td>500,000 × 0.001 = <b>500/s</b></td><td><b>1</b>, at 6% utilisation</td></tr>
</table>
<p>
  Going from 90% to 99% is described in conversation as "nine percentage
  points". In load terms it is a <b>10× reduction</b> and it deletes six
  database replicas. Going the other way is worse: a hit rate slipping from
  99% to 98% <em>doubles</em> database load overnight, and no dashboard
  labelled "cache hit rate 98%" looks alarming. <b>Always reason in miss
  rate.</b> Hit rate is a vanity metric; miss rate is the thing that is
  actually multiplied by your traffic.
</p>
<p>
  The same arithmetic explains the latency shape. With a 0.5 ms cache and a
  20 ms database:
</p>
<ul>
  <li>99% hit: mean = 0.99 × 0.5 + 0.01 × 20 = <b>0.695 ms</b></li>
  <li>90% hit: mean = 0.90 × 0.5 + 0.10 × 20 = <b>2.45 ms</b> — 3.5× worse from a number that "sounds fine"</li>
  <li>And the percentile that matters: at a 10% miss rate, <b>every request above p90 is a cache miss by definition</b>. Your p95 and p99 are not "the cache is a bit slower sometimes" — they are raw database latency, including its tail. A 99% hit rate is what moves the database out of p99 entirely.</li>
</ul>
<div class="warn">
  <span class="ttl">⚠ The failure nobody sizes for: losing a cache node</span>
  Five Redis nodes, 99% hit rate, 5,000 reads/sec reaching the database.
  One node dies. Its 20% of the keyspace now misses on every request, so the
  new miss rate is 0.20 + 0.80 × 0.01 = <b>0.208</b>, and the database
  receives 500,000 × 0.208 = <b>104,000 reads/sec</b> — a <b>20.8×</b> spike
  against a tier provisioned for 5,000. The database falls over, the cache
  cannot be refilled, and the outage is now self-sustaining. This is how
  cache tiers kill databases, and it is why the answers are consistent
  hashing (so a lost node redistributes rather than reshuffles), load
  shedding at the origin, and being honest that your database floor is set by
  your <em>degraded</em> miss rate, not your healthy one.
</div>
<p class="sub">
  Sizing follows the same logic in reverse. Hit rate is a function of how
  much of the working set fits in memory, and real access distributions are
  Zipf-ish: the top ~20% of keys serve ~80% of requests. That means the first
  gigabyte buys you an enormous amount and the climb from 90% to 99% can cost
  4-8× the memory, because you are now paying to hold the long tail. Knowing
  where you are on that curve is what makes "should we double the cache?" a
  calculable question rather than an argument.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Any prompt with a heavy read:write skew (news feed, product catalogue, URL shortener, profile service) is a caching problem before it is a database problem. State the ratio, then state the miss rate you're targeting and the load that leaves — do not just say "add Redis."</li>
  <li>A naive design adds a cache and stops there: no TTL policy, no invalidation story, no eviction policy, no stampede protection, and no answer for what happens when a cache node dies. Each of those is a follow-up question the interviewer already has queued.</li>
  <li>Distinguish caching from <b>replication</b>: a read replica is authoritative and eventually consistent; a cache is non-authoritative and arbitrarily stale. If the prompt needs "must reflect the last write", a replica with read-your-writes routing is the answer, not a cache.</li>
  <li>Distinguish it from a <b>CDN</b> question: if the payload is large, static and geographically distributed, the win is bandwidth and RTT at the edge, not query offload. Different layer, different invalidation story, same bet.</li>
  <li>Hot-key language ("a celebrity posts", "a flash sale", "one video goes viral") is the interviewer explicitly asking for stampede handling and hot-key mitigation — coalescing, a per-instance L1 in front of the shared tier, or key splitting.</li>
  <li>Pitfall: caching writes. If the prompt is write-heavy or the data is read once and never again, a cache adds latency and memory cost for nothing. Say "I would not cache this, and here's why" at least once during a loop — knowing where a cache does not belong reads as strongly as knowing where it does.</li>
</ul>`,
    },
    {
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
    },
    {
      id: "sysdes-walkthrough-simple",
      num: "B7",
      title: "Walkthrough: a URL shortener",
      short: "Walkthrough: URL shortener",
      levels: ["beginner"],
      practice: [],
      ready: true,
      subtitle:
        "The full 45-minute arc on the classic warm-up question — where every number is shown, every choice is defended, and the trap is the click counter.",
      body: `<h3>Why this question survives, and how the 45 minutes are spent</h3>
<p>
  "Design a URL shortener" (TinyURL, bit.ly) is the most-asked warm-up in the
  industry and candidates dismiss it at their peril. It survives because the
  functional requirements fit in one sentence, which means <b>100% of your
  signal comes from how you reason, not from what you build</b>. There is
  nowhere to hide behind domain complexity. Every senior-level muscle gets
  exercised: scoping, capacity estimation, an ID-generation choice with real
  collision math, a read-heavy caching story, and one planted trap that
  separates people who have run a system from people who have read about one.
</p>
<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="A forty-five minute interview timeline split into six phases: five minutes clarifying, five minutes estimating, six minutes on the API and data model, fourteen minutes of core design, eight minutes of deep dive and seven minutes of scaling and wrap-up, with the first ten minutes highlighted as the ones candidates skip">
    <g class="rough">
      <rect class="boxy" x="16"  y="56" width="68"  height="40" rx="5" />
      <rect class="boxy" x="84"  y="56" width="67"  height="40" rx="5" />
      <rect class="box"  x="151" y="56" width="81"  height="40" rx="5" />
      <rect class="boxg" x="232" y="56" width="189" height="40" rx="5" />
      <rect class="box"  x="421" y="56" width="108" height="40" rx="5" />
      <rect class="box"  x="529" y="56" width="95"  height="40" rx="5" />
      <path class="lnr" d="M50,132 L50,100" />
      <path class="lnr" d="M117,132 L117,100" />
    </g>
    <text class="lbl" x="320" y="26" text-anchor="middle">where the 45 minutes actually go</text>
    <text class="sm" x="50"  y="50" text-anchor="middle">5 min</text>
    <text class="sm" x="117" y="50" text-anchor="middle">5 min</text>
    <text class="sm" x="191" y="50" text-anchor="middle">6 min</text>
    <text class="sm" x="326" y="50" text-anchor="middle">14 min</text>
    <text class="sm" x="475" y="50" text-anchor="middle">8 min</text>
    <text class="sm" x="576" y="50" text-anchor="middle">7 min</text>
    <text class="sm" x="50"  y="81" text-anchor="middle">clarify</text>
    <text class="sm" x="117" y="81" text-anchor="middle">estimate</text>
    <text class="sm" x="191" y="81" text-anchor="middle">API + model</text>
    <text class="sm" x="326" y="81" text-anchor="middle">core design</text>
    <text class="sm" x="475" y="81" text-anchor="middle">deep dive</text>
    <text class="sm" x="576" y="81" text-anchor="middle">scale + wrap</text>
    <text class="sm rd" x="112" y="152" text-anchor="middle">the ten minutes candidates skip</text>
    <text class="sm" x="112" y="172" text-anchor="middle">and then design the wrong system</text>
    <text class="sm" x="356" y="152">every later phase inherits the numbers</text>
    <text class="sm" x="356" y="172">you agreed on in the first two</text>
  </svg>
  <figcaption>The deep dive is where the level gets decided, but its topic is chosen by the interviewer based on what you said in the first ten minutes. Rushing to boxes-and-arrows forfeits that.</figcaption>
</figure>

<h3>Minute 0-5: the clarifying questions worth asking</h3>
<p>
  Ask questions that <em>change the design</em>. "Should it be scalable?" is
  noise. Each of these has a wrong answer that would send you somewhere else
  entirely, and you should say why you're asking.
</p>
<table>
  <tr><th>Question</th><th>Why it changes the design</th><th>Assume, if they shrug</th></tr>
  <tr><td>What's the traffic — new links per day?</td><td>Sets everything downstream: key length, storage, shard count</td><td>10 M creates/day</td></tr>
  <tr><td>Read to write ratio?</td><td>Decides whether this is a caching problem or a write problem</td><td>100:1 — so 1 B redirects/day</td></tr>
  <tr><td>How long do links live?</td><td>Unbounded means 5-year storage math and a reclamation story; TTLs mean the keyspace recycles</td><td>Default never expire, optional expiry</td></tr>
  <tr><td>Custom aliases?</td><td>Adds a second, user-controlled namespace with a uniqueness race and a squatting problem</td><td>Yes, as an optional field</td></tr>
  <tr><td>Do we need per-click analytics?</td><td><b>This is the load-bearing one.</b> It decides 301 vs 302, and it introduces a write path 100× the create path</td><td>Yes — counts, and coarse geo/referrer</td></tr>
  <tr><td>Should keys be unguessable?</td><td>Rules out a plain counter; forces a scramble, a hash, or a pre-generated pool</td><td>Yes — enumerable links leak private URLs</td></tr>
  <tr><td>Latency target on the redirect?</td><td>Sets the caching and geographic strategy</td><td>p99 under 100 ms at the edge</td></tr>
  <tr><td>Global or single region?</td><td>Multi-region changes the write path and the consistency story</td><td>Global reads, single-region writes</td></tr>
</table>
<p>
  Then state the requirements back, split into functional and non-functional,
  and get agreement. Functional: create a short link from a long URL,
  optionally with a custom alias and an expiry; redirect a short link to its
  target; report click counts; delete or disable a link. Non-functional:
  redirects are the hot path and must be fast and highly available; creates
  can be slower and can tolerate brief unavailability; keys must not be
  enumerable; a link, once created, must never resolve to the wrong target —
  <b>that last one is a correctness requirement, not a nicety, and it is what
  makes key uniqueness a security property rather than a hygiene issue</b>.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I draw anything: I'm
  assuming 10 million creates a day, roughly 100 reads per write, links that
  live indefinitely by default, and that we need per-click analytics. The
  analytics answer is the one I care most about, because it turns a
  116-writes-per-second system into an 11,000-writes-per-second system, and
  I'd design those two paths very differently. Sound right?"
</div>

<h3>Minute 5-10: back-of-envelope, line by line</h3>
<p>
  Write the arithmetic on the board. Not the results — the arithmetic. Round
  aggressively and say that you're rounding. There are 86,400 seconds in a
  day; approximating that as 100,000 is standard and keeps the mental math
  clean, though below I'll use the real figure so the numbers reconcile.
</p>
<p><b>Traffic.</b></p>
<ul>
  <li>Writes: 10,000,000 ÷ 86,400 = <b>116 creates/sec</b>. At 3× peak: <b>~350/sec</b>.</li>
  <li>Reads: 10,000,000 × 100 = 1,000,000,000 redirects/day. 1,000,000,000 ÷ 86,400 = <b>11,574 redirects/sec</b>. At 3× peak: <b>~35,000/sec</b>.</li>
  <li>The two paths are <b>three orders of magnitude apart</b>. That single observation drives the entire rest of the design: separate services, separate scaling, and a cache that only the read path touches.</li>
</ul>
<p><b>Storage over 5 years.</b></p>
<ul>
  <li>Per row: 7 B short key + ~100 B average long URL + 8 B user id + 8 B created_at + 8 B expires_at + flags ≈ 132 B of payload. With row overhead, the primary index and one secondary index, budget <b>500 B per link</b>.</li>
  <li>Rows: 10,000,000/day × 365 × 5 = <b>18.25 billion</b>.</li>
  <li>Storage: 18.25 × 10⁹ × 500 B = 9.125 × 10¹² B = <b>~9.1 TB</b>. With 3× replication, <b>~27 TB</b>.</li>
  <li>Read that number back: 9 TB is <em>small</em>. It fits on three commodity volumes. Storage is not the hard part of this problem, and saying so out loud stops you over-engineering the next twenty minutes.</li>
</ul>
<p><b>Bandwidth.</b></p>
<ul>
  <li>Writes: 116/sec × ~500 B ≈ <b>58 KB/sec</b>. Nothing.</li>
  <li>Reads: a redirect response is headers plus a <code>Location</code>, call it 500 B. 11,574/sec × 500 B ≈ <b>5.8 MB/sec ≈ 46 Mbps</b>; 139 Mbps at peak. Also nothing — one server's NIC.</li>
  <li>Conclusion: this is a <b>QPS and key-management problem</b>, not a bandwidth or storage problem. Naming what the problem <em>isn't</em> is a senior move.</li>
</ul>
<p><b>Cache sizing.</b></p>
<ul>
  <li>Redirect traffic is strongly recency-skewed — most clicks land on links created in the last few days. Cache the ~10 most recent days of creations plus the evergreen tail: 10 × 10,000,000 = <b>100 million entries</b>.</li>
  <li>Per entry: 7 B key + ~100 B URL + Redis object overhead ≈ <b>200 B</b>. 100 × 10⁶ × 200 B = <b>20 GB</b> — a three-node Redis cluster with room to spare.</li>
  <li>At a 95% hit rate the datastore sees 11,574 × 0.05 = <b>579 reads/sec</b> (1,750/sec at peak). <b>That is the whole point of the estimate</b>: the read tier's job is to shrink 35,000/sec down to something a single replicated store answers without breaking a sweat.</li>
</ul>
<p class="sub">
  Server count, since it always gets asked: a stateless handler that does one
  Redis <code>GET</code> and emits a 302 will do roughly 8-10k requests/sec on
  a modest instance. 35,000 ÷ 8,000 ≈ 5, so call it 12 instances across three
  availability zones — sized for redundancy and headroom, not for throughput.
</p>

<h3>Minute 10-16: the API surface and the redirect semantics</h3>
<table>
  <tr><th>Endpoint</th><th>Notes</th></tr>
  <tr><td><code>POST /api/v1/links</code><br/><code>{ url, alias?, expires_at? }</code> → <code>201 { key, short_url, expires_at }</code></td><td>Requires <code>Authorization</code> and an <code>Idempotency-Key</code> header, so a client retry after a timeout does not mint two keys for one user action. Rate-limited per account</td></tr>
  <tr><td><code>GET /{key}</code> → <code>302</code> + <code>Location</code></td><td>The hot path. No auth, no body, no database write. Must be the simplest code in the system</td></tr>
  <tr><td><code>GET /api/v1/links/{key}</code></td><td>Metadata for the owner; not the redirect path</td></tr>
  <tr><td><code>DELETE /api/v1/links/{key}</code></td><td>Soft delete + immediate cache purge. Abuse takedown depends on this being fast</td></tr>
  <tr><td><code>GET /api/v1/links?cursor=&amp;limit=</code></td><td>Cursor pagination, not offset — a heavy account has millions of links</td></tr>
  <tr><td><code>GET /api/v1/links/{key}/stats?from=&amp;to=</code></td><td>Served from the analytics store, never from the links table</td></tr>
</table>
<p>
  Then the question that looks trivial and isn't: <b>301 or 302?</b> A
  <code>301 Moved Permanently</code> lets the browser and every CDN cache the
  mapping, which is wonderful — your traffic collapses because repeat visitors
  never reach you again. That is also exactly the problem: you lose per-click
  analytics for repeat visitors, and <b>you can no longer revoke the link</b>.
  When a link turns out to point at a phishing page, a 301 you served
  yesterday is still redirecting victims from their browser cache and there is
  nothing you can do about it. So: <code>302</code> (or <code>307</code>) with
  <code>Cache-Control: private, no-store</code> by default, because
  revocability and analytics are product requirements; offer 301 as a
  per-link option for high-volume customers who don't need either. Saying
  <em>that</em> tradeoff, rather than picking a number, is the answer.
</p>

<h3>Key generation: three strategies and the collision math</h3>
<p>
  This is the technical core of the question. First, key length. Base62
  (<code>a-z A-Z 0-9</code>) gives you 62 characters per position:
</p>
<ul>
  <li>62⁶ = <b>56,800,235,584</b> ≈ 5.68 × 10¹⁰</li>
  <li>62⁷ = <b>3,521,614,606,208</b> ≈ 3.52 × 10¹²</li>
</ul>
<p>
  We need 18.25 × 10⁹ keys. Against 62⁶ that is 18.25 ÷ 56.8 = <b>32% of the
  keyspace</b> — fine for a counter, disastrous for random generation, since
  by year five roughly one in three random draws would collide. Against 62⁷ it
  is 18.25 ÷ 3,521.6 = <b>0.52%</b>. So: <b>7 characters if keys are random,
  6 if they come from a counter</b>. That difference is not cosmetic — a
  counter uses the keyspace densely, which is precisely what randomness gives
  up.
</p>
<table>
  <tr><th></th><th>Hash + truncate</th><th>Counter + base62</th><th>Pre-generated key pool</th></tr>
  <tr><td>Mechanism</td><td>SHA-256(url + salt), base62-encode, take the first 7 chars</td><td>Global monotonic counter, base62-encode the integer</td><td>An offline service generates unique random keys into a table and hands out blocks</td></tr>
  <tr><td>Collisions</td><td>Expected ≈ N²/2M = (1.825×10¹⁰)² ÷ (2 × 3.52×10¹²) ≈ <b>47 million</b> over 5 years — ~1 in 400 inserts on average, ~1 in 190 by year 5</td><td><b>Zero, by construction</b></td><td><b>Zero</b> — uniqueness is enforced once, offline, at generation time</td></tr>
  <tr><td>Write path</td><td>Conditional insert (<code>ON CONFLICT DO NOTHING</code>), re-salt and retry on conflict. Never read-then-write — that races</td><td>One unconditional insert</td><td>One unconditional insert; the key was already reserved</td></tr>
  <tr><td>Guessable?</td><td>No</td><td><b>Yes</b> — sequential keys let anyone enumerate every link and infer your daily volume. Needs a bijective scramble (a keyed Feistel permutation over the integer) to fix</td><td>No</td></tr>
  <tr><td>Key length needed</td><td>7</td><td>6</td><td>7</td></tr>
  <tr><td>Same URL twice</td><td>Same key — free dedupe, but two users now share one link's analytics and either can delete it. Salt with the user id if that matters</td><td>Different keys</td><td>Different keys</td></tr>
  <tr><td>New moving parts</td><td>None</td><td>A counter service, and range allocation so it isn't a per-write hotspot</td><td>A key-generation service, its own store, and a strictly transactional handout</td></tr>
  <tr><td>Reach for this when…</td><td>You want zero extra infrastructure and can tolerate a retry loop on the write path</td><td>You control the whole system, want the shortest keys, and will do the scramble properly</td><td>You want the write path to be a single unconditional insert with no collision logic anywhere — the choice at genuinely large scale</td></tr>
</table>
<p>
  The counter approach deserves one more number, because it kills the obvious
  objection. Nobody increments a shared counter 116 times a second; you
  <b>allocate ranges</b>. Each app server takes a block of 1,000,000 ids and
  serves creates from local memory. At 10 M creates a day, the fleet consumes
  <b>ten blocks per day</b> — the counter service handles about ten requests
  in twenty-four hours, and can be a single row in Postgres behind a
  transaction. If a server crashes, its unused ids are lost: worst case a full
  fleet restart burns 12 × 1,000,000 = 12 million ids, which is 0.02% of 62⁶.
  <b>Deliberately wasting 12 million ids to avoid a distributed counter is the
  correct engineering trade, and saying it that plainly is the signal.</b>
</p>
<p class="sub">
  Sizing the pre-generated pool, if you go that way: hold six months of
  buffer, 10 M/day × 180 = 1.8 × 10⁹ keys at 8 B each = <b>14.4 GB</b> — a
  single table. Generate replacements at 116/sec, which is trivial. The one
  thing you must get right is the handout: two servers receiving the same key
  block means two links resolving to the same short code, which is a security
  bug, not a glitch. Hand out blocks inside a transaction that marks them
  taken, and accept losing a block when a server dies.
</p>
<div class="warn">
  <span class="ttl">⚠ "I'll hash the URL and check if it exists"</span>
  <code>SELECT</code> then <code>INSERT</code> is a race: two concurrent
  creates both see "free" and both insert, and now one of them silently
  overwrote the other's link. The redirect for that key now sends users to the
  wrong site. It must be a single conditional write — <code>INSERT … ON
  CONFLICT DO NOTHING</code> in Postgres, a conditional
  <code>attribute_not_exists(key)</code> in DynamoDB — with a retry using a
  different salt when zero rows are affected. Interviewers plant this one
  deliberately; getting it right takes one sentence and getting it wrong
  undoes a good design.
</div>

<h3>Data model, and the trap in the click counter</h3>
<p>
  The read path does exactly one thing: point lookup by primary key. No joins,
  no ranges, no sorting. That is a pure key-value access pattern, which tells
  you the storage engine barely matters and the sharding key is obvious.
</p>
<ul>
  <li><b>links</b> — <code>short_key</code> (PK, char(7)), <code>long_url</code>, <code>user_id</code>, <code>created_at</code>, <code>expires_at</code>, <code>is_active</code>. Sharded by <code>hash(short_key)</code>: uniform distribution, and every redirect knows its shard from the URL alone with no lookup.</li>
  <li><b>links_by_user</b> — a secondary index or GSI on <code>user_id</code>, for the low-volume "list my links" API. Do not let this exist on the redirect path.</li>
  <li><b>click events</b> — a separate system entirely. Not a column. Not on this table. Not in this database.</li>
</ul>
<div class="warn">
  <span class="ttl">⚠ The planted trap: UPDATE links SET clicks = clicks + 1</span>
  It is the natural thing to write and it destroys the design. Your create
  path is 116 writes/sec; adding a counter update to every redirect makes it
  <b>11,574 writes/sec</b> — a 100× increase — aimed at the exact rows you are
  trying to read, with row-level lock contention concentrated on whichever
  links are popular. A single viral link means thousands of serialised writes
  per second to one row, replication lag behind it, and cache invalidation
  storms because the row keeps changing. The read-heavy system you just sized
  quietly became a write-heavy one.
</div>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A comparison of counting clicks with a database update on every redirect producing over eleven thousand writes per second, against buffering counts in process memory and flushing them every ten seconds into an event stream, producing about one hundred and forty four writes per minute">
    <g class="rough">
      <path class="lnr" d="M160,78 L160,106" />
      <path class="lnr" d="M160,144 L160,180" />
      <path class="lng" d="M480,78 L480,106" />
      <path class="lng dash" d="M480,144 L480,180" />
      <path class="ln dash" d="M320,16 L320,238" />
    </g>
    <g class="rough">
      <rect class="box"  x="100" y="40"  width="120" height="38" rx="6" />
      <rect class="boxr" x="90"  y="106" width="140" height="38" rx="6" />
      <rect class="boxr" x="100" y="180" width="120" height="38" rx="6" />
      <rect class="box"  x="420" y="40"  width="120" height="38" rx="6" />
      <rect class="boxg" x="410" y="106" width="140" height="38" rx="6" />
      <rect class="boxg" x="410" y="180" width="140" height="38" rx="6" />
    </g>
    <text class="lbl" x="160" y="28" text-anchor="middle">naive</text>
    <text class="lbl" x="480" y="28" text-anchor="middle">buffered</text>
    <text class="sm" x="160" y="64" text-anchor="middle">redirect path</text>
    <text class="sm" x="480" y="64" text-anchor="middle">redirect path</text>
    <text class="sm rd" x="160" y="124" text-anchor="middle">UPDATE clicks + 1</text>
    <text class="sm rd" x="160" y="138" text-anchor="middle">on every redirect</text>
    <text class="sm gr" x="480" y="124" text-anchor="middle">in-process counter</text>
    <text class="sm gr" x="480" y="138" text-anchor="middle">per key, per instance</text>
    <text class="sm rd" x="160" y="204" text-anchor="middle">primary datastore</text>
    <text class="sm gr" x="480" y="198" text-anchor="middle">flush every 10 s →</text>
    <text class="sm gr" x="480" y="212" text-anchor="middle">event stream → rollups</text>
    <text class="sm rd" x="160" y="236" text-anchor="middle">694,000 writes/min, hot-row locks</text>
    <text class="sm gr" x="480" y="236" text-anchor="middle">144 writes/min — 4,800× fewer</text>
  </svg>
  <figcaption>Twelve instances flushing six times a minute produce 144 writes regardless of traffic. The counter becomes eventually consistent and can lose ten seconds of clicks on a crash — for a click counter, that is obviously the right price.</figcaption>
</figure>
<p>
  The arithmetic: naive is 11,574 × 60 = <b>694,440 writes/min</b>. Buffered is
  12 instances × 6 flushes/min = <b>144 writes/min</b>, a <b>4,800×</b>
  reduction, and the redirect path now performs <em>zero</em> writes. If you
  want durable, attributable click events (geo, referrer, timestamp) rather
  than just counts, publish one event per redirect to Kafka and aggregate
  downstream — same principle, the redirect still never touches the primary
  store, and the analytics pipeline scales on its own budget.
</p>

<h3>Minute 16-30: the architecture</h3>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="The full architecture: clients reach a CDN and anycast edge, then a layer seven load balancer that splits traffic between a stateless read-only redirect service backed by a Redis cluster and a write-only create service backed by a key allocation service, both sitting on a key-value store sharded by hash of the short key">
    <g class="rough">
      <path class="ln"  d="M88,134 L106,134" />
      <path class="ln"  d="M186,134 L204,134" />
      <path class="lng" d="M280,124 L300,82" />
      <path class="ln"  d="M280,146 L300,184" />
      <path class="lng" d="M412,64 L436,64" />
      <path class="lnr dash" d="M470,92 L470,112" />
      <path class="ln"  d="M436,190 L414,190" />
      <path class="ln"  d="M414,180 L436,156" />
    </g>
    <g class="rough">
      <rect class="box"  x="8"   y="112" width="80"  height="44" rx="6" />
      <rect class="boxy" x="106" y="112" width="80"  height="44" rx="6" />
      <rect class="boxy" x="204" y="112" width="76"  height="44" rx="6" />
      <rect class="boxg" x="300" y="42"  width="112" height="44" rx="6" />
      <rect class="boxy" x="436" y="42"  width="96"  height="44" rx="6" />
      <rect class="box"  x="436" y="112" width="180" height="44" rx="6" />
      <rect class="box"  x="300" y="168" width="114" height="44" rx="6" />
      <rect class="box"  x="436" y="168" width="120" height="44" rx="6" />
    </g>
    <text class="sm" x="48"  y="130" text-anchor="middle">clients</text>
    <text class="sm" x="48"  y="146" text-anchor="middle">browser, app</text>
    <text class="sm" x="146" y="130" text-anchor="middle">CDN /</text>
    <text class="sm" x="146" y="146" text-anchor="middle">anycast edge</text>
    <text class="sm" x="242" y="130" text-anchor="middle">L7 load</text>
    <text class="sm" x="242" y="146" text-anchor="middle">balancer</text>
    <text class="sm" x="356" y="60"  text-anchor="middle">redirect service</text>
    <text class="sm" x="356" y="76"  text-anchor="middle">stateless, read-only</text>
    <text class="sm" x="484" y="60"  text-anchor="middle">Redis cluster</text>
    <text class="sm" x="484" y="76"  text-anchor="middle">20 GB, ~95% hit</text>
    <text class="sm" x="526" y="130" text-anchor="middle">KV store, sharded on</text>
    <text class="sm" x="526" y="146" text-anchor="middle">hash(short_key)</text>
    <text class="sm" x="357" y="186" text-anchor="middle">create service</text>
    <text class="sm" x="357" y="202" text-anchor="middle">writes only</text>
    <text class="sm" x="496" y="186" text-anchor="middle">key service</text>
    <text class="sm" x="496" y="202" text-anchor="middle">1 M-id blocks</text>
    <text class="sm rd" x="502" y="106" text-anchor="middle">~5% miss</text>
    <text class="sm gr" x="150" y="242">reads: 11.6k/s average, 35k/s peak — cache absorbs 95%</text>
    <text class="sm" x="150" y="262">writes: 116/s average, 350/s peak — three orders of magnitude smaller</text>
    <text class="sm" x="150" y="282">so the two paths are separate services that scale independently</text>
  </svg>
  <figcaption>The redirect service is deliberately the dumbest component in the diagram: one cache lookup, one 302, no writes, no auth, no joins. Everything expensive has been moved off the path that runs a billion times a day.</figcaption>
</figure>
<p>
  Walk the two paths out loud. <b>Create:</b> authenticate, validate and
  normalise the URL, check the idempotency key, take the next id from the
  in-memory block, write the row, populate the cache optimistically, return
  201. <b>Redirect:</b> <code>GET</code> the key from Redis; on a hit emit a
  302 immediately; on a miss read the shard, populate the cache with a
  jittered TTL, emit the 302; increment an in-process click counter and return.
  Nine times out of ten the entire request is one memory lookup in a
  co-located Redis and a response with no body.
</p>
<div class="sticky mint">
  <span class="ttl">Why this design is easy, in one sentence</span>
  Once created, a short link is <b>immutable</b> — the mapping never changes.
  Immutable, tiny, read-heavy data is the friendliest possible thing to cache
  and replicate, which is why a system doing a billion reads a day needs no
  consistency protocol at all. Say this, and the interviewer knows you
  understand <em>why</em> it's easy rather than just that it is.
</div>

<h3>Minute 30-45: the scaling path and the follow-ups</h3>
<table>
  <tr><th>Stage</th><th>Trigger</th><th>What changes</th><th>What it buys</th></tr>
  <tr><td>1. One box</td><td>Launch</td><td>App + Postgres + Redis on one machine</td><td>Genuinely serves millions of redirects a day. Start here and say so</td></tr>
  <tr><td>2. Split and scale the read tier</td><td>CPU on the app</td><td>Stateless redirect instances behind an L7 LB, dedicated Redis</td><td>Linear read scaling; the DB is now protected by a 95% hit rate</td></tr>
  <tr><td>3. Read replicas</td><td>Cache misses saturate the primary</td><td>Route redirect misses to replicas; creates stay on the primary</td><td>Read capacity without sharding. Replica lag is harmless — the row is immutable</td></tr>
  <tr><td>4. Shard the store</td><td>Data past a few TB, or write IOPS</td><td>Hash-shard on <code>short_key</code>; or move to DynamoDB/Cassandra, which is what this access pattern wants</td><td>Horizontal storage and write scaling with no cross-shard queries, ever</td></tr>
  <tr><td>5. Go multi-region</td><td>p99 for distant users, or a regional outage requirement</td><td>Read replicas or a full cache per region; writes still home to one region; edge caching on the 302 itself</td><td>Redirect latency from ~120 ms to ~20 ms globally. Safe precisely because the mapping is immutable</td></tr>
  <tr><td>6. Split analytics off</td><td>Anyone asks for dashboards</td><td>Click events to Kafka, stream aggregation, columnar store for queries</td><td>Analytics load never touches the redirect path</td></tr>
</table>
<p>
  The follow-ups an interviewer will reach for, and the one-line answers:
</p>
<ul>
  <li><b>A link goes viral — one key gets 50,000 rps.</b> That's a single hot Redis shard. Add a per-instance L1 cache with a 1-5 second TTL in front of Redis: 12 instances refreshing once a second is 12 reads/sec to Redis no matter how viral the link gets. The data is immutable, so a few seconds of staleness costs nothing.</li>
  <li><b>How do you expire 18 billion rows?</b> Never a <code>DELETE … WHERE expires_at &lt; now()</code> across the table. Partition by creation month so expiry is a <code>DROP PARTITION</code>, plus lazy deletion: if a read finds an expired row, return 410 and evict.</li>
  <li><b>Custom aliases racing.</b> Same conditional insert as key generation, plus a reserved-word list (<code>api</code>, <code>login</code>, <code>admin</code>) so a user can't claim a path that shadows your own routes.</li>
  <li><b>Abuse and phishing.</b> Scan the target on create against a reputation service; hold new links from untrusted accounts behind an interstitial; rate-limit creates per account and per IP. All of this depends on being able to revoke instantly — which is the argument for 302 you already made.</li>
  <li><b>What do you monitor?</b> Cache hit rate (an early-warning signal for everything), p99 redirect latency, key-block depth per instance, create error rate, and the 404 rate on redirects, which spikes when a shard is misrouted.</li>
  <li><b>What breaks first?</b> Be specific: the Redis cluster. At 95% hit rate the store sees 579 reads/sec; lose one of three cache nodes and the miss rate goes to roughly 0.33 + 0.67 × 0.05 = 0.365, sending 11,574 × 0.365 ≈ <b>4,200 reads/sec</b> at the store — a 7× spike. Consistent hashing keeps a node loss from reshuffling the other two, and the store must be sized for the degraded number, not the healthy one.</li>
</ul>

<h3>What the interviewer was actually scoring</h3>
<p>
  The rubric is never "did you produce the reference architecture." Almost
  everyone converges on roughly the same boxes. These are the axes that
  actually get written on the feedback form:
</p>
<ul>
  <li><b>Did you drive?</b> Whether you scoped the problem yourself or waited to be handed requirements is usually decided in the first three minutes, and it is the single most common reason a strong engineer gets down-levelled here.</li>
  <li><b>Did a number change a decision?</b> Estimation is not a ritual. The 9 TB figure is what justified <em>not</em> proposing an exotic distributed store; the 100:1 ratio is what justified splitting read and write services; the 20 GB cache figure is what made "95% hit rate" a claim rather than a hope. If your estimates didn't visibly steer anything, you performed the ritual without doing the work.</li>
  <li><b>Did you find the click counter?</b> This is the planted trap. Spotting that per-click writes are 100× the create load — unprompted — is the strongest single signal available in this question.</li>
  <li><b>Did you commit?</b> Comparing three key-generation strategies and then not choosing one reads as indecision, not rigour. Pick one, name what you're giving up, and say what would make you switch.</li>
  <li><b>Was your design proportionate?</b> Reaching for Cassandra, Kafka and a stream processor in minute four for a system one Postgres box would serve is scored as a negative at senior level. Knowing the smallest thing that works, and knowing exactly which metric would force the next step, is the whole skill.</li>
  <li><b>Did you know your correctness boundaries?</b> That the mapping is immutable (so replica lag and stale caches are harmless), that click counts are eventually consistent and may lose ten seconds (fine), but that key uniqueness must be enforced by a conditional write (not fine to hand-wave, because the failure is a link resolving to the wrong site).</li>
  <li><b>Did the follow-up land?</b> "Now make it 100×" or "now it's multi-region" is a test of whether your design had joints. A design where the answer is "add more redirect instances and a regional cache" was built by someone who has scaled something; a design where the answer is "I'd rebuild it" was not.</li>
  <li><b>Level tell:</b> a mid-level answer produces a design that works. A senior/staff answer additionally names the tradeoff it is accepting, quantifies the cost of that trade, states what it is deliberately <em>not</em> building, and identifies the metric that would change its mind.</li>
</ul>`,
    },

    {
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
    },
    {
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
    },
    {
      id: "sysdes-message-queues-async",
      num: "I3",
      title: "Message queues & async processing",
      short: "Message queues & async",
      levels: ["intermediate"],
      practice: [],
      ready: true,
      subtitle:
        "The request path should only do the work the user is actually waiting for — everything else goes on a queue and gets retried.",
      body: `<h3>Decoupling: what you actually buy</h3>
<p>
  Synchronous calls couple two things that have no business being coupled:
  the <em>latency</em> a user experiences and the <em>capacity</em> of the
  slowest downstream service. Put a durable buffer between producer and
  consumer and you break that link. Four distinct wins come out of it, and
  naming them separately is what makes you sound like you have run this in
  production.
</p>
<ul>
  <li><b>Spike absorption.</b> A queue turns a 20x traffic burst into a growing backlog instead of a cascade of timeouts. Your workers keep running at their sustainable rate; the queue eats the difference. Latency degrades gracefully rather than the system falling over.</li>
  <li><b>Latency shedding.</b> Image transcoding takes 4 s; sending an email takes 800 ms; reindexing takes 300 ms. None of it needs to happen before the HTTP response. Enqueue in ~2 ms and return 202.</li>
  <li><b>Retries with durability.</b> If the email provider is down, an in-process retry loop dies with the pod. A queued message survives the deploy, the crash and the region failover.</li>
  <li><b>Fan-out.</b> One "order placed" event feeds billing, search indexing, the recommendation model, the fraud pipeline and the data warehouse — and adding a seventh consumer needs no change to the producer.</li>
</ul>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A synchronous API doing thumbnailing, email and indexing inline for a five second response, compared with an asynchronous API that enqueues in two milliseconds and returns immediately while workers do the slow work">
    <g class="rough">
      <path class="lnr" d="M126,52 L158,52" />
      <path class="lnr" d="M282,52 L314,52" />
      <path class="lnr" d="M436,52 L468,52" />
      <rect class="boxr" x="16"  y="30" width="110" height="44" rx="6" />
      <rect class="box"  x="158" y="30" width="124" height="44" rx="6" />
      <rect class="box"  x="314" y="30" width="122" height="44" rx="6" />
      <rect class="box"  x="468" y="30" width="124" height="44" rx="6" />
    </g>
    <text class="sm" x="71"  y="48" text-anchor="middle">POST /upload</text>
    <text class="sm rd" x="71" y="64" text-anchor="middle">synchronous</text>
    <text class="sm" x="220" y="57" text-anchor="middle">thumbnail 4 s</text>
    <text class="sm" x="375" y="57" text-anchor="middle">email 800 ms</text>
    <text class="sm" x="530" y="57" text-anchor="middle">index 300 ms</text>
    <text class="sm rd" x="16" y="98">user waits 5.1 s; one slow provider makes every upload time out</text>
    <g class="rough">
      <path class="lng" d="M126,168 L166,168" />
      <path class="lng" d="M290,168 L330,168" />
      <path class="ln"  d="M454,168 L494,150" />
      <path class="ln"  d="M454,176 L494,196" />
      <rect class="boxg" x="16"  y="146" width="110" height="44" rx="6" />
      <rect class="boxy" x="166" y="146" width="124" height="44" rx="6" />
      <rect class="box"  x="330" y="146" width="124" height="44" rx="6" />
      <rect class="box"  x="494" y="128" width="128" height="38" rx="6" />
      <rect class="box"  x="494" y="178" width="128" height="38" rx="6" />
    </g>
    <text class="sm" x="71"  y="164" text-anchor="middle">POST /upload</text>
    <text class="sm gr" x="71" y="180" text-anchor="middle">enqueue, 2 ms</text>
    <text class="sm" x="228" y="173" text-anchor="middle">durable queue</text>
    <text class="sm" x="392" y="173" text-anchor="middle">worker pool</text>
    <text class="sm" x="558" y="152" text-anchor="middle">thumbnailer</text>
    <text class="sm" x="558" y="202" text-anchor="middle">mailer</text>
    <text class="sm gr" x="16" y="238">202 Accepted in 12 ms; a dead mail provider grows a backlog instead of an outage</text>
  </svg>
  <figcaption>The queue does not make the work faster. It makes the work <em>not the user's problem</em>, and it makes failure recoverable instead of lost.</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ Async changes the product, not just the architecture</span>
  The moment you return 202 you owe the user a way to observe completion:
  a status endpoint, a websocket push, an email, or an optimistic UI that
  reconciles later. Candidates who move work off the request path without
  saying how the client learns it finished get marked down — the
  interviewer is checking whether you understand you just introduced a
  distributed state machine into the product.
</div>

<h3>Queue vs log: RabbitMQ and Kafka are not the same shape</h3>
<p>
  A <b>queue broker</b> (RabbitMQ, SQS, ActiveMQ) tracks per-message state.
  A message is delivered, acknowledged, and deleted. The broker owns the
  bookkeeping, which buys you per-message acking, arbitrary redelivery
  delays and routing topologies — at the cost of holding mutable state per
  message.
</p>
<p>
  A <b>log</b> (Kafka, Pulsar, Kinesis, Redpanda) is an append-only file
  per partition. Consumers hold an <b>offset</b> — a number — and the
  broker deletes nothing until the retention window expires. Reads are
  sequential disk scans, which is why a single broker sustains hundreds of
  MB/s. Because messages aren't deleted on read, you can rewind the offset
  and replay a week of history into a new consumer, which is the
  capability queues fundamentally lack.
</p>

<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="A producer hashing a key into three partitions of a topic, with a consumer group of three where the first consumer owns two partitions, the second owns one, and the third sits idle because there are no partitions left">
    <g class="rough">
      <path class="ln" d="M124,148 L170,66" />
      <path class="ln" d="M124,152 L170,146" />
      <path class="ln" d="M124,158 L170,226" />
      <path class="lng" d="M330,66 L440,84" />
      <path class="lng" d="M330,146 L440,96" />
      <path class="lng" d="M330,226 L440,206" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="130" width="108" height="46" rx="6" />
      <rect class="boxy" x="170" y="44"  width="160" height="44" rx="6" />
      <rect class="boxy" x="170" y="124" width="160" height="44" rx="6" />
      <rect class="boxy" x="170" y="204" width="160" height="44" rx="6" />
      <rect class="boxg" x="440" y="64"  width="164" height="46" rx="6" />
      <rect class="boxg" x="440" y="184" width="164" height="46" rx="6" />
      <rect class="boxr" x="440" y="258" width="164" height="46" rx="6" />
    </g>
    <text class="sm" x="70"  y="150" text-anchor="middle">producer</text>
    <text class="sm" x="70"  y="166" text-anchor="middle">key = userId</text>
    <text class="sm" x="132" y="112">hash % 3</text>
    <text class="sm" x="250" y="72" text-anchor="middle">partition 0</text>
    <text class="sm" x="250" y="152" text-anchor="middle">partition 1</text>
    <text class="sm" x="250" y="232" text-anchor="middle">partition 2</text>
    <text class="sm" x="522" y="86"  text-anchor="middle">consumer A</text>
    <text class="sm" x="522" y="102" text-anchor="middle">owns P0 + P1</text>
    <text class="sm" x="522" y="206" text-anchor="middle">consumer B</text>
    <text class="sm" x="522" y="222" text-anchor="middle">owns P2</text>
    <text class="sm rd" x="522" y="280" text-anchor="middle">consumer C</text>
    <text class="sm rd" x="522" y="296" text-anchor="middle">idle — no partition</text>
    <text class="lbl" x="16" y="270" style="font-size:14px">one partition has exactly one owner in a group,</text>
    <text class="lbl" x="16" y="292" style="font-size:14px">so partition count is your parallelism ceiling</text>
  </svg>
  <figcaption>Consumer C is the whole lesson: you scale a Kafka consumer group by adding partitions, not by adding pods. Pick the partition count for the parallelism you'll want in a year.</figcaption>
</figure>

<table>
  <tr><th>&nbsp;</th><th>Queue broker (RabbitMQ, SQS)</th><th>Log (Kafka, Pulsar)</th></tr>
  <tr><td>Unit of progress</td><td>Per-message ack / nack</td><td>Per-partition offset commit</td></tr>
  <tr><td>After a message is consumed</td><td>Deleted</td><td>Still there until retention expires (hours to forever)</td></tr>
  <tr><td>Replay</td><td>Not possible — you must have kept a copy yourself</td><td>Seek the offset backwards; a brand-new consumer can read all history</td></tr>
  <tr><td>Ordering</td><td>Per-queue, and lost the moment you add a second consumer</td><td>Total order <em>within a partition</em>; none across partitions</td></tr>
  <tr><td>Parallelism</td><td>Add consumers freely — the broker load-balances messages</td><td>Capped at partition count per consumer group</td></tr>
  <tr><td>Throughput, single node</td><td>~20-50 k msg/s (much lower with persistence + per-message routing)</td><td>Hundreds of MB/s; ~10 MB/s per partition is a comfortable planning figure</td></tr>
  <tr><td>Routing</td><td>Rich: topic/fanout/header exchanges, per-message TTL, delayed delivery</td><td>Deliberately dumb: topic + partition. Routing is the consumer's job</td></tr>
  <tr><td>Reach for this when</td><td>Task/job semantics — "someone do this one thing", varied per-message delays, complex routing, modest volume</td><td>Event-stream semantics — many independent consumers of the same events, replay for backfills or new services, ordered per-entity change streams, high volume</td></tr>
</table>
<p class="sub">
  A cheap tell that you've thought about it: "SQS standard gives me
  unbounded throughput but no ordering; SQS FIFO gives me ordering per
  message-group at ~300 messages/second per group (3,000 batched), which
  is fine per user and useless as a global pipe." Named limits beat
  adjectives.
</p>

<h3>Delivery semantics, done properly</h3>
<p>
  Every distributed queue makes the same unavoidable choice: when the
  consumer processes a message and then dies before acknowledging it, was
  the message delivered? You can only pick which side of that ambiguity
  you fail on.
</p>
<table>
  <tr><th>Semantic</th><th>Mechanism</th><th>Failure mode</th><th>Use it for</th></tr>
  <tr><td>At-most-once</td><td>Ack (or commit the offset) <em>before</em> processing</td><td>Crash after ack, before work → message silently lost</td><td>High-volume telemetry, click logs, metrics — where one lost sample is genuinely irrelevant and throughput is everything</td></tr>
  <tr><td>At-least-once</td><td>Ack <em>after</em> processing succeeds</td><td>Crash after work, before ack → message redelivered and processed twice</td><td>Essentially everything. This is the default in Kafka, SQS and RabbitMQ, and the sane baseline</td></tr>
  <tr><td>"Exactly-once"</td><td>At-least-once delivery + an idempotent consumer, or a transaction spanning input and output</td><td>Only holds inside the transactional boundary — the moment you call an external API it degrades to at-least-once</td><td>Payments, ledgers, anything where a duplicate is a customer-visible error</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">Exactly-once delivery does not exist; exactly-once <em>effect</em> does</span>
  Two processes, an unreliable network, and no way to distinguish "your
  ack was lost" from "you never received it" — the sender must either
  resend (risking a duplicate) or not (risking a loss). This is a proof,
  not an engineering limitation. What you can build is an
  <b>at-least-once pipeline whose side effects are idempotent</b>, so
  processing a message twice produces the same state as processing it
  once. Kafka's exactly-once mode is exactly this, mechanised: an
  idempotent producer that de-duplicates by sequence number, plus a
  transaction that commits output records and input offsets atomically —
  and it only holds while you stay inside Kafka.
</div>
<p>
  So the real engineering question is never "which semantic do I pick?"
  It is <b>"what makes my consumer idempotent?"</b> Three answers, in
  descending order of how often they're the right one:
</p>
<ul>
  <li><b>A natural idempotency key.</b> The message carries a stable ID (order ID, event ID). The consumer writes <code>INSERT ... ON CONFLICT DO NOTHING</code> into a processed-events table inside the same transaction as its business write. Second delivery hits the conflict and does nothing. Cheap, obvious, correct.</li>
  <li><b>Naturally idempotent operations.</b> <code>SET status = 'shipped'</code> is safe to repeat; <code>balance = balance + 10</code> is not. Prefer absolute writes over deltas when you get to choose the schema — this single habit removes most duplicate-processing bugs before they exist.</li>
  <li><b>Idempotency tokens at the boundary.</b> When the side effect leaves your system (Stripe charge, email send), pass a client-generated key that the provider de-duplicates on. Stripe's <code>Idempotency-Key</code> exists for precisely this scenario.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll run at-least-once and
  make the consumer idempotent, because exactly-once delivery isn't
  achievable across a network — it's at-least-once plus de-duplication. I'll
  put a unique event ID on every message and have the consumer insert it
  into a processed-events table in the same transaction as the business
  write, so a redelivery is a no-op rather than a double charge."
</div>

<h3>Retries, dead letters and poison messages</h3>
<p>
  At-least-once means redelivery, and redelivery means you need a policy
  for messages that will <em>never</em> succeed. A <b>poison message</b> —
  malformed payload, a referenced row that was deleted, a bug that only
  triggers on one record — will otherwise be retried forever, and in a
  Kafka partition it blocks every message behind it. That is head-of-line
  blocking, and it is how one bad record stops a pipeline for an entire
  key range.
</p>
<ul>
  <li><b>Bound the retries.</b> 3-5 attempts with exponential backoff and jitter (see the rate-limiting chapter — the same backoff maths applies). Unbounded retry against a struggling downstream is a self-inflicted DDoS, and synchronised retries are worse than no retries.</li>
  <li><b>Distinguish retryable from terminal.</b> A 503 or a connection reset deserves a retry. A 400, a schema violation or a foreign-key error will fail identically at attempt 50 — route it straight to the DLQ and skip the backoff ladder entirely.</li>
  <li><b>Dead-letter queue.</b> After the budget is exhausted, move the message — with the original payload, the error, the attempt count and a trace ID — to a DLQ. Then <em>alert on DLQ depth</em>. An unmonitored DLQ is a data-loss mechanism with extra steps; the DLQ's value is entirely in someone looking at it.</li>
  <li><b>Make the DLQ replayable.</b> Fix the bug, ship it, drain the DLQ back into the main queue. If replay requires a bespoke script written under incident pressure, you don't have a DLQ, you have a graveyard.</li>
  <li><b>In Kafka, sidestep head-of-line blocking</b> by publishing the failure to a retry topic and committing the offset, so the partition keeps moving. You trade strict ordering for liveness, deliberately.</li>
</ul>

<h3>Backpressure: the queue is a shock absorber, not a landfill</h3>
<p>
  A queue converts an overload into a backlog, which is only progress if
  the backlog eventually drains. The number to watch is <b>consumer lag</b>
  (messages behind, or seconds behind) and its <em>derivative</em>: if
  arrival rate exceeds processing rate at all, lag grows without bound and
  you have an outage on a delay timer.
</p>
<ul>
  <li><b>Do the arithmetic out loud.</b> 5,000 msg/s arriving, 40 ms per message per worker → 25 msg/s per worker → 200 workers to break even, and you want ~1.5x headroom to drain a backlog rather than merely hold it. That is the sizing answer an interviewer wants.</li>
  <li><b>Autoscale on lag, not CPU.</b> Consumer CPU is often near-idle while blocked on a downstream call; lag is the signal that actually tracks user harm. In Kafka, remember the partition ceiling — scaling to 300 pods against 50 partitions leaves 250 idle.</li>
  <li><b>Push backpressure upstream when the queue is unbounded in practice.</b> Reject or rate-limit at the producer, or shed low-priority work. A 10-hour backlog of stale notifications is worse than dropping them: you'll deliver yesterday's alerts tomorrow.</li>
  <li><b>Separate queues by priority and by latency budget.</b> One shared queue means a 4-hour bulk-import backlog delays password-reset emails. Different SLOs deserve different queues — this is the cheapest reliability decision in the whole design.</li>
</ul>

<h3>Ordering: per-key is almost always enough</h3>
<p>
  Global total ordering costs you all parallelism — it means one partition,
  one consumer, one thread. Almost no product needs it. What products
  actually need is <b>per-entity ordering</b>: user 42's profile updates
  must apply in order relative to <em>each other</em>; they have no
  meaningful relationship to user 91's.
</p>
<p>
  So partition by the entity key. <code>hash(userId) % partitions</code>
  puts every event for a user in one partition, which has one owner in the
  consumer group, which processes it in offset order. You get ordering
  where it matters and full parallelism across keys — this is the same
  insight as sharding by tenant, applied to a stream.
</p>
<div class="warn">
  <span class="ttl">⚠ Concurrency inside a consumer silently discards the ordering you just paid for</span>
  You partitioned by <code>userId</code>, then the consumer hands each
  message to a thread pool or fires off un-awaited async calls. Ordering
  is gone — the broker's guarantee ends at delivery. If you need
  intra-consumer parallelism, shard the work by the same key inside the
  consumer (key-affine worker threads), never round-robin. The related
  trap: adding partitions later re-maps <code>hash(key) % N</code>, so a
  key moves partitions and in-flight events for that key can be reordered
  across the resize. Over-provision partitions up front instead.
</div>

<h3>The outbox pattern: fixing the dual-write problem</h3>
<p>
  Here is a bug that survives every code review because it looks correct:
</p>
<pre><code>await db.orders.insert(order);        <span class="c">// 1. commits</span>
await kafka.send("order.created", e); <span class="c">// 2. broker unreachable → throws</span></code></pre>
<p>
  The order exists and nobody downstream will ever hear about it. Swapping
  the order just moves the failure: publish first and crash before the
  commit, and you've announced an order that doesn't exist. There is no
  ordering of two independent systems that is safe, because you cannot
  commit to a database and a broker atomically — that is the
  <b>dual-write problem</b>, and 2PC is not a real answer at this scale
  (it blocks on coordinator failure and no cloud broker offers it).
</p>
<p>
  The fix is to make it a <em>single</em> write. Insert the event into an
  <code>outbox</code> table in the same transaction as the business row.
  Now either both exist or neither does. A separate relay — a poller, or
  Debezium tailing the write-ahead log — reads that table and publishes to
  the broker, marking rows sent.
</p>

<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="An application writing an order row and an outbox row in one database transaction, with a separate relay process reading the outbox table and publishing to Kafka, marking rows as sent">
    <g class="rough">
      <path class="lng" d="M126,124 L172,124" />
      <path class="ln"  d="M336,124 L392,124" />
      <path class="lng" d="M512,124 L546,124" />
      <path class="ln dash" d="M392,150 L336,150" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="102" width="110" height="46" rx="6" />
      <rect class="boxy" x="172" y="60"  width="164" height="130" rx="6" />
      <rect class="box"  x="188" y="80"  width="132" height="40" rx="4" />
      <rect class="boxg" x="188" y="132" width="132" height="40" rx="4" />
      <rect class="box"  x="392" y="102" width="120" height="46" rx="6" />
      <rect class="boxg" x="546" y="102" width="78"  height="46" rx="6" />
    </g>
    <text class="sm" x="71"  y="122" text-anchor="middle">order service</text>
    <text class="sm" x="71"  y="138" text-anchor="middle">one txn</text>
    <text class="sm" x="254" y="105" text-anchor="middle">orders</text>
    <text class="sm" x="254" y="157" text-anchor="middle">outbox</text>
    <text class="sm" x="254" y="48"  text-anchor="middle">single ACID transaction</text>
    <text class="sm" x="452" y="120" text-anchor="middle">relay / CDC</text>
    <text class="sm" x="452" y="136" text-anchor="middle">(Debezium)</text>
    <text class="sm" x="585" y="128" text-anchor="middle">Kafka</text>
    <text class="sm" x="364" y="166" text-anchor="middle">mark sent</text>
    <text class="lbl" x="16" y="222" style="font-size:14px">Both rows commit or neither does — the impossible state</text>
    <text class="lbl" x="16" y="244" style="font-size:14px">"order exists, event lost" can no longer occur.</text>
  </svg>
  <figcaption>The relay may crash mid-publish and re-send, so the outbox is at-least-once by design — which is fine, because you already made the consumer idempotent.</figcaption>
</figure>

<p class="sub">
  Cost and caveats, stated plainly: the outbox adds a write per event and
  a few hundred milliseconds to a few seconds of publish latency (poll
  interval; CDC is closer to tens of ms). You must prune sent rows or the
  table becomes your biggest one. And the relay gives you at-least-once,
  never exactly-once — the event ID in the outbox row <em>is</em> the
  consumer's de-duplication key, which is why these two patterns are
  always taught together. The mirror-image pattern on the consumer side is
  the <b>inbox</b>: record the processed event ID transactionally with the
  effect.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "send a notification", "generate a report", "process the video", "update the search index", "handle Black Friday traffic", or any single request that fans out to three or more downstream systems. If work can finish after the response, it should.</li>
  <li><b>The naive design</b> does everything inline and adds servers when it's slow — which scales the fast path and the slow path together, and still fails whenever the slowest third party does.</li>
  <li><b>Queue or log?</b> Ask "does anyone need to read these events twice, or will someone need them a year from now?" Yes → log (replay, multiple independent consumer groups, backfilling a new service). No, it's just work to be done → queue (simpler, richer routing, no partition-count planning).</li>
  <li><b>Distinguishing it from a request/response cache:</b> both remove latency, but a cache makes reads cheap while a queue makes <em>writes</em> deferrable. If the expensive thing is a read, you want the caching or CDN chapter, not this one.</li>
  <li><b>The pitfall to name unprompted:</b> the dual-write. If your design says "save to the DB, then publish an event", say "…via an outbox table, so I'm not doing a dual write" in the same breath. It is one clause and it reliably reads as senior.</li>
  <li><b>The follow-up you will get:</b> "what if the consumer processes the same message twice?" The answer is never "it won't." It's an idempotency key plus a processed-events table, written in the same transaction as the effect.</li>
</ul>`,
    },
    {
      id: "sysdes-consistency-models",
      num: "I4",
      title: "Consistency models",
      short: "Consistency models",
      levels: ["intermediate"],
      practice: [],
      ready: true,
      subtitle: "Every consistency model is just a rule about which stale reads you are willing to let a user see.",
      body: `<h3>Consistency is a contract about what a read may return</h3>
<p>
  Once data exists in more than one place — a replica, a cache, a second
  region — "what is the current value?" stops having a single answer. A
  <b>consistency model</b> is the contract you offer the application about
  which of the possible answers a read is allowed to produce. Stronger
  models forbid more answers, which costs coordination, which costs
  latency and availability.
</p>
<p>
  Interviewers push on this because it is the one topic where candidates
  reliably say something confidently wrong ("we'll use eventual
  consistency for speed") without noticing they just permitted a user to
  see their own comment disappear. The senior move is to pick a model
  <em>per operation</em> and justify it in product terms.
</p>

<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="A client writing version two to the primary, then two milliseconds later reading from a replica that is still forty milliseconds behind and returns the older version one">
    <g class="rough">
      <path class="lng" d="M128,110 L248,74" />
      <path class="ln dash" d="M316,110 L316,164" />
      <path class="lnr" d="M248,196 L128,140" />
    </g>
    <g class="rough">
      <rect class="box"  x="18"  y="102" width="110" height="48" rx="6" />
      <rect class="boxg" x="248" y="50"  width="150" height="52" rx="6" />
      <rect class="boxr" x="248" y="172" width="150" height="52" rx="6" />
    </g>
    <text class="lbl" x="73"  y="122" text-anchor="middle">client</text>
    <text class="sm"  x="73"  y="140" text-anchor="middle">Alice</text>
    <text class="sm"  x="323" y="72"  text-anchor="middle">primary</text>
    <text class="sm gr" x="323" y="90" text-anchor="middle">balance = 120 (v2)</text>
    <text class="sm"  x="323" y="194" text-anchor="middle">read replica</text>
    <text class="sm rd" x="323" y="212" text-anchor="middle">balance = 100 (v1)</text>
    <text class="sm gr" x="140" y="76">t=0 write v2, committed</text>
    <text class="sm rd" x="140" y="176">t=2 ms read → 100</text>
    <text class="sm" x="330" y="145">replication lag 40 ms</text>
    <text class="lbl rd" x="18" y="248" style="font-size:15px">Alice deposited 20 and her balance went down. Nothing is broken — the system is behaving exactly as specified.</text>
  </svg>
  <figcaption>Every consistency anomaly you will ever discuss is a variation on this picture. The models differ only in which arrow they forbid.</figcaption>
</figure>

<h3>Replication lag is the concrete thing underneath all of it</h3>
<p>
  "Eventual consistency" sounds abstract until you attach numbers to it.
  Lag is the wall-clock delay between a write committing on the primary
  and being visible on a given replica, and its distribution is wildly
  skewed — the median is boring and the tail is where your bugs live.
</p>
<table>
  <tr><th>Setup</th><th>Typical lag</th><th>Tail behaviour</th></tr>
  <tr><td>Same-AZ async replica</td><td>0.5-2 ms</td><td>Tens of ms under write bursts</td></tr>
  <tr><td>Cross-AZ, same region</td><td>2-10 ms</td><td>100 ms+ during compaction or vacuum</td></tr>
  <tr><td>Cross-region (us-east → eu-west)</td><td>70-120 ms, floor set by RTT</td><td>Seconds if the link saturates</td></tr>
  <tr><td>Any replica during a bulk write, index build, or long transaction</td><td>seconds to minutes</td><td>Single-threaded replay (classic MySQL) can fall <em>hours</em> behind and never catch up until write traffic drops</td></tr>
  <tr><td>Read-through cache with 60 s TTL</td><td>up to 60 s</td><td>This is replication lag too. People forget caches are replicas</td></tr>
</table>
<p class="sub">
  The operationally important property: lag is not bounded. Any design
  that says "the replica is only a few milliseconds behind, so it's fine"
  is a design that breaks during the exact incident where correctness
  matters most. If you need a bound, you must enforce one — by reading the
  primary, by waiting for a version token, or by refusing to serve from a
  replica whose lag exceeds a threshold.
</p>

<h3>The two poles, and the useful middle</h3>
<p>
  <b>Strong consistency</b> (informally: every read sees the latest
  committed write) requires the read to be coordinated with the write —
  route to the leader, or read a quorum, or hold a lease. Cost: at least
  one extra round trip, and unavailability whenever the leader is
  unreachable. <b>Eventual consistency</b> promises only that if writes
  stop, replicas converge. Cost: nothing; guarantee: nearly nothing. Any
  stale value is legal, in any order, on any read.
</p>
<p>
  Between them sit the <b>session guarantees</b> — the models that actually
  ship in real products, because they fix the anomalies users can
  <em>perceive</em> without paying for global coordination.
</p>
<table>
  <tr><th>Model</th><th>Forbids</th><th>How it's implemented</th></tr>
  <tr><td>Read-your-writes</td><td>You post a comment and it isn't there on refresh</td><td>Route a user's reads to the primary for N seconds after their write; or return a version token (Postgres LSN, MySQL GTID) with the write and have the read wait for a replica that has caught up to it</td></tr>
  <tr><td>Monotonic reads</td><td>Refreshing shows a comment, then it vanishes, then it's back</td><td>Sticky routing: hash the user to one replica so they never move backwards in the replication stream</td></tr>
  <tr><td>Consistent prefix</td><td>Seeing the reply "because he's late" before the question "why?"</td><td>Preserve write order per partition; don't shard causally-related rows across independently-replicated partitions</td></tr>
  <tr><td>Causal consistency</td><td>Any effect visible before its cause, across users</td><td>Track happens-before with vector clocks or dependency metadata and delay applying an update until its dependencies have landed</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll serve reads from
  replicas, but pin a user to the primary for about 500 ms after any write
  of theirs — that buys read-your-writes for the person who cares, while
  everyone else still gets the cheap replica read. If the lag distribution
  makes a fixed window unreliable, I'll upgrade to returning the write's
  LSN and having the replica wait for it."
</div>
<div class="warn">
  <span class="ttl">⚠ Read-your-writes breaks on a second device, and on the client's own cache</span>
  Sticky-to-primary usually keys on the session or connection. Alice
  updates her profile on her phone, opens her laptop, and the laptop's
  session hits a lagging replica — the anomaly is back. If cross-device
  read-your-writes matters, the sticky key has to be the <em>user</em>,
  not the session, and the version token has to travel with the user
  (stored server-side or in a cookie), not with the connection.
</div>

<h3>Quorums: R + W &gt; N, with the numbers worked out</h3>
<p>
  In a leaderless or quorum-replicated store (Dynamo, Cassandra, Riak) you
  choose three numbers: <b>N</b> replicas hold each key, a write must be
  acknowledged by <b>W</b> of them, a read must gather <b>R</b> of them. If
  <code>R + W &gt; N</code>, the read set and the write set must overlap in
  at least one node by pigeonhole — so at least one responding replica has
  the newest write, and version stamps let the reader pick it.
</p>

<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="Three replicas where a write is acknowledged by the first two and a read contacts the last two, so the middle replica belongs to both sets and guarantees the read sees the newest write">
    <g class="rough">
      <path class="lng" d="M112,50 L196,116" />
      <path class="lng" d="M112,58 L336,120" />
      <path class="ln"  d="M112,232 L336,168" />
      <path class="ln"  d="M112,236 L476,168" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="26"  width="96" height="42" rx="6" />
      <rect class="box"  x="16"  y="212" width="96" height="42" rx="6" />
      <rect class="boxg" x="196" y="116" width="120" height="52" rx="6" />
      <rect class="boxy" x="336" y="116" width="120" height="52" rx="6" />
      <rect class="box"  x="476" y="116" width="120" height="52" rx="6" />
    </g>
    <text class="sm" x="64"  y="52"  text-anchor="middle">writer</text>
    <text class="sm" x="64"  y="238" text-anchor="middle">reader</text>
    <text class="sm gr" x="256" y="138" text-anchor="middle">replica 1</text>
    <text class="sm gr" x="256" y="156" text-anchor="middle">written</text>
    <text class="sm" x="396" y="138" text-anchor="middle">replica 2</text>
    <text class="sm" x="396" y="156" text-anchor="middle">written + read</text>
    <text class="sm" x="536" y="138" text-anchor="middle">replica 3</text>
    <text class="sm" x="536" y="156" text-anchor="middle">read only</text>
    <text class="sm gr" x="126" y="92">W = 2</text>
    <text class="sm" x="126" y="204">R = 2</text>
    <text class="lbl" x="336" y="212" style="font-size:15px">R + W = 4 &gt; N = 3</text>
    <text class="sm" x="336" y="234">the overlap is replica 2 — it must be in both sets</text>
    <text class="sm" x="336" y="254">so the reader always sees the newest version stamp</text>
  </svg>
  <figcaption>The guarantee comes from arithmetic, not from timing: with R + W &gt; N the sets cannot be disjoint, so a reader physically cannot miss the newest committed write.</figcaption>
</figure>

<table>
  <tr><th>N, W, R</th><th>Overlap?</th><th>Write tolerance</th><th>Read tolerance</th><th>Character</th></tr>
  <tr><td>3, 2, 2</td><td>Yes (4 &gt; 3)</td><td>1 node down</td><td>1 node down</td><td>The default. Balanced, survives one failure on both paths</td></tr>
  <tr><td>3, 3, 1</td><td>Yes (4 &gt; 3)</td><td>0 — any node down blocks writes</td><td>2 nodes down</td><td>Read-optimised: 1-replica reads are fast and local, writes are brittle</td></tr>
  <tr><td>3, 1, 3</td><td>Yes (4 &gt; 3)</td><td>2 nodes down</td><td>0</td><td>Write-optimised: fast durable-ish writes, fragile reads</td></tr>
  <tr><td>3, 1, 1</td><td><b>No</b> (2 &lt; 3)</td><td>2 down</td><td>2 down</td><td>Pure eventual consistency. Lowest latency, highest availability, a read can miss a write entirely</td></tr>
  <tr><td>5, 3, 3</td><td>Yes (6 &gt; 5)</td><td>2 down</td><td>2 down</td><td>Survives two failures on both paths; ~1.5x the write cost. Standard for critical data</td></tr>
</table>
<p class="sub">
  Latency follows directly: a W=2 write waits for the <em>second-fastest</em>
  of three replicas, so it inherits that node's p95, not the fastest node's.
  Raising W or R moves you further into the tail of the slowest responder —
  which is why quorum systems tune these per-query rather than globally.
</p>
<div class="warn">
  <span class="ttl">⚠ R + W &gt; N does not give you linearizability</span>
  It guarantees the newest <em>committed</em> value is in the read set. It
  does not order concurrent writes (two writers at W=2 can each succeed on
  a different pair and produce siblings), it does not make a failed write
  disappear (a write that reached one node and then failed can still be
  read later and repaired into existence), and <b>sloppy quorums</b> with
  hinted handoff — the default in Dynamo-style systems during a
  partition — accept W acks from nodes that aren't even in the key's
  preference list, which breaks the overlap argument outright. Quorums buy
  you strong-ish reads under normal operation, not consensus. For real
  linearizability you need Raft or Paxos with a leader lease.
</div>

<h3>Linearizability vs serializability — telling them apart for good</h3>
<p>
  They sound like synonyms, they come from different fields, and mixing
  them up is the fastest way to lose credibility on this topic.
</p>
<ul>
  <li>
    <b>Linearizability</b> is about <em>single objects</em> and
    <em>real time</em>. Every operation appears to take effect
    instantaneously at some point between its invocation and its response,
    and that point respects wall-clock order: if write W completes before
    read R begins, R must see W. It says nothing about multi-key
    transactions. It is a <em>recency</em> guarantee — the C in CAP.
  </li>
  <li>
    <b>Serializability</b> is about <em>multi-object transactions</em> and
    says nothing about real time. Concurrent transactions produce a result
    equivalent to <em>some</em> serial order — and that order need not
    match the order they actually happened in. A transaction that
    committed an hour ago may legally be ordered after one committing now.
    It is an <em>isolation</em> guarantee — the I in ACID.
  </li>
  <li>
    <b>Strict serializability</b> is both: a serial order that also
    respects real time. This is what Spanner (via TrueTime), FaunaDB and
    CockroachDB market as "external consistency", and it is the strongest
    practical model.
  </li>
</ul>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A timeline showing a write of x equals one, a concurrent read that may legally return either the old or new value, and a later non-overlapping read that must return one under linearizability">
    <g class="rough">
      <rect class="boxg" x="108" y="34"  width="146" height="38" rx="5" />
      <rect class="boxy" x="196" y="92"  width="136" height="38" rx="5" />
      <rect class="box"  x="330" y="150" width="136" height="38" rx="5" />
      <path class="ln" d="M40,214 L604,214" />
      <path class="ln dash" d="M254,26 L254,214" />
    </g>
    <text class="sm" x="181" y="58"  text-anchor="middle">A: write(x=1)</text>
    <text class="sm" x="264" y="116" text-anchor="middle">B: read(x)</text>
    <text class="sm" x="398" y="174" text-anchor="middle">C: read(x)</text>
    <text class="sm" x="346" y="116">overlaps the write → 0 or 1 both legal</text>
    <text class="sm gr" x="480" y="174">starts after → must return 1</text>
    <text class="sm" x="258" y="24">write completes here</text>
    <text class="sm" x="560" y="234">real time →</text>
    <text class="lbl" x="40" y="240" style="font-size:14px">linearizability constrains only non-overlapping operations</text>
  </svg>
  <figcaption>Concurrency is where freedom lives: overlapping operations may be ordered either way, but once an operation has returned, everyone must see it.</figcaption>
</figure>

<p class="sub">
  The one-liner worth memorising: <b>linearizability is about recency of a
  single key; serializability is about the illusion of one-at-a-time
  transactions.</b> A database can be serializable and still let you read
  stale data (Postgres SERIALIZABLE on a replica); a store can be
  linearizable per key and have no transactions at all (etcd, ZooKeeper).
</p>

<h3>Choosing per operation: model, cost, and what it looks like to a user</h3>
<table>
  <tr><th>Model</th><th>Guarantee</th><th>Cost</th><th>Real product example</th></tr>
  <tr><td>Eventual</td><td>Replicas converge if writes stop</td><td>None — local read, local write, survives partitions</td><td><b>Like count, view count, follower count.</b> Off by 3 for 200 ms; nobody can tell, and nobody is harmed. Rendering it as "1.2k" makes the staleness literally invisible</td></tr>
  <tr><td>Monotonic reads</td><td>Never move backwards in time</td><td>Sticky routing — mild load imbalance, awkward on replica failover</td><td><b>An infinite feed.</b> Items reappearing or vanishing while scrolling reads as a bug even when values are individually fine</td></tr>
  <tr><td>Read-your-writes</td><td>You always see your own effects</td><td>Primary reads for a short window, or LSN-waiting on read</td><td><b>Posting a comment, editing a profile, uploading an avatar.</b> The cheapest model that makes the product feel correct — and the default you should reach for on any write-then-read flow</td></tr>
  <tr><td>Causal</td><td>Effects never precede their causes</td><td>Dependency metadata on every write; real complexity</td><td><b>Threaded comments and chat.</b> A reply must not be visible before the message it replies to</td></tr>
  <tr><td>Linearizable (single key)</td><td>Reads see the latest committed write, in real-time order</td><td>Leader round trip; unavailable during leader loss (CP)</td><td><b>Bank balance display, seat inventory, feature-flag kill switch.</b> Being 200 ms stale is a wrong number on a screen someone will act on</td></tr>
  <tr><td>Strict serializable / transactional</td><td>Multi-key transactions in a real-time-respecting serial order</td><td>Consensus per commit; cross-region commits cost an inter-region RTT</td><td><b>Username reservation, seat booking, money transfer.</b> Two users claiming <code>@ada</code> concurrently must produce exactly one winner — this needs a uniqueness constraint or a compare-and-set, not a read-then-write</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The three-question test for any field in your design</span>
  <ul style="margin:8px 0 0">
    <li><b>If a user sees a value 5 seconds old, what happens?</b> Nothing → eventual. Confusing → session guarantees. Wrong decision or lost money → strong.</li>
    <li><b>Can two concurrent writes both "win"?</b> If the answer must be no (username, seat, inventory), no amount of replication tuning helps — you need a single serialisation point: a uniqueness constraint, a conditional write, or consensus.</li>
    <li><b>Who notices the staleness — the writer or a third party?</b> Only the writer → read-your-writes is enough and it's cheap. Everyone → you're in strong-consistency territory.</li>
  </ul>
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'd mix models rather than
  pick one. Counters and feeds go eventual off replicas. Anything the user
  just wrote gets read-your-writes via primary-pinning. Balance and
  inventory read from the leader, and the actual decrement is a
  conditional update inside a transaction, so two concurrent buyers can't
  both take the last seat. That's three models in one system and each one
  is justified by what breaks if I go weaker."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> the moment your diagram grows a read replica, a cache, or a second region, you have chosen a consistency model — the only question is whether you chose it deliberately. "Multi-region", "read replicas", "global users" are all consistency prompts in disguise.</li>
  <li><b>The naive design</b> says "we'll use eventual consistency, it's more available" and then puts a write-then-read flow on top of it. Almost every user-visible consistency bug is a read-your-writes violation, not a deep causality problem.</li>
  <li><b>Distinguishing it from CAP hand-waving:</b> CAP is a statement about behaviour <em>during a network partition</em>, which is rare. Replication lag is present every single second of normal operation. Talk about lag; mention CAP only if partitions are actually in scope.</li>
  <li><b>Uniqueness and inventory are not consistency-tunable.</b> If two concurrent operations must not both succeed, no choice of R and W saves you — you need a single point of serialisation. Say that explicitly; it's a common trap.</li>
  <li><b>Quantify.</b> "Cross-region lag is ~100 ms, so a European read of a US write can be stale for a tenth of a second — fine for a like count, not for a payment confirmation" is worth more than three paragraphs of theory.</li>
  <li><b>The pitfall to avoid:</b> using "strongly consistent" and "serializable" interchangeably. If you only remember one thing: linearizability = recency of one key; serializability = transactions appear one-at-a-time.</li>
</ul>`,
    },
    {
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
    },
    {
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
    },
    {
      id: "sysdes-storage-systems",
      num: "I7",
      title: "Storage systems",
      short: "Storage systems",
      levels: ["intermediate"],
      practice: [],
      ready: true,
      subtitle: "Block, file, object — and why the bytes of a user upload should never touch your app servers.",
      body: `<h3>Three storage abstractions, and the one you should default to</h3>
<p>
  "Where do the files go?" appears in nearly every design that touches
  photos, video, documents or backups, and it is a question with a boring
  correct answer that a surprising number of candidates miss. The three
  abstractions differ in what the storage layer knows about your data: block
  storage knows nothing but offsets, file storage knows a directory tree,
  object storage knows an immutable blob plus metadata and nothing else.
</p>
<table>
  <tr><th></th><th>Block</th><th>File</th><th>Object</th></tr>
  <tr><td>Unit</td><td>Fixed-size blocks, no structure</td><td>Files in a POSIX hierarchy</td><td>Immutable blob + key + metadata, flat namespace</td></tr>
  <tr><td>Access</td><td>Attached to one machine as a device</td><td>Mounted by many machines (NFS/SMB)</td><td>HTTP GET/PUT, from anywhere</td></tr>
  <tr><td>Mutation</td><td>Random read/write at any offset</td><td>Random read/write, plus locking semantics</td><td>Replace whole object; no partial in-place edit</td></tr>
  <tr><td>Scale limit</td><td>One volume, typically up to ~64 TB</td><td>Petabytes, but metadata operations get slow</td><td>Effectively unbounded, per-object up to ~5 TB</td></tr>
  <tr><td>Latency</td><td>Sub-millisecond</td><td>~1-5 ms</td><td>~20-100 ms first byte</td></tr>
  <tr><td>Cost / GB-month</td><td>~$0.08 (SSD-backed)</td><td>~$0.30 (managed NFS)</td><td>~$0.023, dropping to ~$0.001 archived</td></tr>
  <tr><td>Reach for this when…</td><td>A database's data directory, or anything needing real random writes</td><td>Legacy software that insists on a filesystem, or shared build/render scratch space</td><td>User uploads, media, backups, logs, static assets — the default</td></tr>
</table>
<p class="sub">
  Notice the cost column spans two orders of magnitude for storing the same
  bytes. That gap is not a discount for being clever; it is what you pay for
  random-write latency you probably do not need. A 500 KB profile photo does
  not need sub-millisecond random access at any offset. It needs to be
  fetched whole, over HTTP, from a CDN.
</p>

<h3>Why object storage is the default, and what the durability number means</h3>
<p>
  S3-class object stores advertise something like <b>eleven nines of
  durability</b> (99.999999999%). That is not marketing noise, but it also
  does not mean what people assume. It is an annual expected-loss figure:
  store ten million objects and you would statistically expect to lose one
  roughly every ten thousand years. It is achieved by <b>erasure coding</b> —
  the object is split into k data fragments plus m parity fragments spread
  across independent failure domains, and any k of the k+m fragments
  reconstruct it. Losing several disks, or an entire facility, loses nothing.
</p>
<div class="warn">
  <span class="ttl">⚠ Durability and availability are different properties, and conflating them is a tell</span>
  <b>Durability</b> is "the bytes still exist." <b>Availability</b> is "you
  can read them right now." S3 Standard offers eleven nines of durability but
  only four nines of availability, backed by a three-nines SLA. Those are not
  in tension — a regional API outage means you cannot reach a perfectly
  intact object. And critically, <b>durability protects against hardware, not
  against you</b>. Eleven nines does nothing about a bad deploy that deletes
  a prefix, or a compromised credential. That is what versioning, object lock
  and cross-region replication are for. Say this distinction out loud; it is
  a cheap, high-signal moment.
</div>
<p>
  The other property to name explicitly is <b>consistency</b>. Modern S3 is
  strongly read-after-write consistent for new objects and overwrites, which
  removed a class of bug that used to bite everyone. But two caveats survive
  and are worth knowing: <em>listing</em> a bucket can still lag behind
  individual object writes at scale, and any CDN or client cache in front of
  the bucket reintroduces staleness that the storage layer's guarantee says
  nothing about. Cache-busting by putting a content hash in the key —
  writing new objects instead of overwriting them — sidesteps both.
</p>

<h3>Presigned URLs: get your app servers out of the byte path</h3>
<p>
  This is the single most reliably-asked storage detail in an interview, and
  the naive design fails on it hard. If uploads are POSTed to your API, then
  every byte of every file traverses your app servers: they buffer it, hold a
  worker thread or event-loop turn for the whole transfer, consume bandwidth
  twice (in from the client, out to storage), and now your autoscaling is
  driven by upload volume rather than request volume. A single user on a slow
  connection uploading a 2 GB video occupies a server slot for minutes.
</p>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="A client asks the app server for a presigned URL, then uploads the file bytes directly to object storage bypassing the app entirely, and an object-created event flows through a queue to a worker that marks the upload ready in the metadata database">
    <g class="rough">
      <path class="ln" d="M138,48 L245,48" />
      <path class="ln dash" d="M245,62 L138,62" />
      <path class="ln" d="M385,49 L490,49" />
      <path class="lng" d="M79,72 L79,167 L245,167" />
      <path class="ln" d="M385,167 L440,167" />
      <path class="ln" d="M515,194 L515,228" />
      <path class="ln dash" d="M590,251 L620,251 L620,72" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="26" width="118" height="46" rx="6" />
      <rect class="boxy" x="245" y="26" width="140" height="46" rx="6" />
      <rect class="box" x="490" y="26" width="130" height="46" rx="6" />
      <rect class="boxg" x="245" y="140" width="140" height="54" rx="6" />
      <rect class="box" x="440" y="140" width="150" height="54" rx="6" />
      <rect class="box" x="440" y="228" width="150" height="46" rx="6" />
    </g>
    <text class="lbl" x="79" y="54" text-anchor="middle">client</text>
    <text class="lbl" x="315" y="48" text-anchor="middle">app server</text>
    <text class="sm" x="315" y="66" text-anchor="middle">issues presigned URL</text>
    <text class="lbl" x="555" y="48" text-anchor="middle">metadata DB</text>
    <text class="sm" x="555" y="66" text-anchor="middle">row: pending</text>
    <text class="lbl" x="315" y="162" text-anchor="middle">object storage</text>
    <text class="sm" x="315" y="182" text-anchor="middle">bucket</text>
    <text class="lbl" x="515" y="162" text-anchor="middle">event queue</text>
    <text class="sm" x="515" y="182" text-anchor="middle">object-created</text>
    <text class="lbl" x="515" y="246" text-anchor="middle">worker</text>
    <text class="sm" x="515" y="264" text-anchor="middle">scan + transcode</text>
    <text class="sm" x="191" y="40" text-anchor="middle">1 init</text>
    <text class="sm" x="191" y="82" text-anchor="middle">2 signed URL</text>
    <text class="sm" x="437" y="40" text-anchor="middle">3 pending row</text>
    <text class="sm gr" x="94" y="122">4 PUT bytes straight to the bucket</text>
    <text class="sm" x="412" y="158" text-anchor="middle">5 event</text>
    <text class="sm" x="612" y="212" text-anchor="end">6 marks it ready</text>
  </svg>
  <figcaption>The green path carries every byte and never touches the app tier. The app tier only ever handles two small JSON requests per upload, whatever the file size.</figcaption>
</figure>
<p>
  A presigned URL is a normal storage URL with a signature, an expiry and a
  set of constraints baked into the query string. Your app server holds the
  storage credentials; the client never does. Signing is a local
  cryptographic operation — no network call to the storage provider — so
  issuing them is essentially free.
</p>
<p>
  The constraints matter, and interviewers probe them. A presigned PUT should
  pin: <b>expiry</b> (5-15 minutes, not 7 days), <b>a maximum content
  length</b> so a client cannot upload 500 GB, <b>the exact object key</b>
  which your server generates so clients cannot overwrite each other's
  objects, and ideally <b>content type</b>. The key should be
  server-chosen and unguessable — a UUID or content hash, never
  a user-supplied filename, which is both a collision problem and a path
  traversal problem.
</p>
<div class="warn">
  <span class="ttl">⚠ Trusting the client to tell you the upload finished</span>
  If the client PUTs to storage and then calls your API saying "done," a
  malicious or merely buggy client can mark a nonexistent or half-written
  object as ready. Drive the state transition from the storage layer's own
  <em>object-created</em> event instead, which is what the queue in the
  diagram is for. That also gives you a natural place to run the things you
  must never skip: virus scanning, content moderation, size and format
  validation, and metadata extraction — all before the object is visible to
  anyone. Objects sitting in the pending state past their expiry get swept by
  a lifecycle rule.
</div>
<p class="sub">
  Downloads get the same treatment in reverse. Serving private media through
  your API means proxying gigabytes; a presigned GET (or a signed CDN URL
  with a short TTL) lets the CDN serve it while still enforcing
  authorization, because the signature <em>is</em> the authorization and it
  expires.
</p>

<h3>Large media: chunked, resumable, and parallel</h3>
<p>
  A single PUT is fine to about 100 MB and is capped around 5 GB. Beyond
  that, and on any mobile network, one long-lived request is the wrong shape:
  a dropped connection at 95% costs you the whole transfer.
</p>
<p>
  <b>Multipart upload</b> solves this. The client initiates an upload and gets
  an upload ID, then uploads independent parts (minimum 5 MB each, up to
  10,000 parts, which is what gets you to a 5 TB object), each returning an
  ETag. When all parts are in, the client sends a complete request listing the
  parts and their ETags, and the storage service assembles the object. Three
  properties fall out of that design and each is worth stating:
</p>
<ul>
  <li><b>Resumability.</b> A failed part is retried alone. The client can query which parts already landed and resume after an app restart or a change of network.</li>
  <li><b>Parallelism.</b> Parts are independent, so a client can run 4-8 concurrent uploads and saturate the link rather than being limited by a single TCP stream's throughput.</li>
  <li><b>Integrity.</b> Per-part checksums catch corruption at part granularity instead of after the whole 5 GB transfer.</li>
</ul>
<p>
  Each part can have its own presigned URL, so the bytes still bypass your
  app entirely. The one thing you must remember operationally: incomplete
  multipart uploads consume storage you are billed for and are invisible in a
  normal object listing. A lifecycle rule to abort uploads older than seven
  days is not optional, and mentioning it reads as operational experience.
</p>

<h3>Transcoding: the pipeline behind every video product</h3>
<p>
  Raw uploads are unservable. A 4K phone recording is the wrong codec,
  bitrate and container for most viewers, so you generate a <b>ladder</b> of
  renditions and let the player adapt to the network.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A source video object flowing through a job queue into a pool of transcoding workers that emit a ladder of renditions at 1080p, 720p and 360p back into object storage">
    <g class="rough">
      <path class="ln" d="M130,104 L170,104" />
      <path class="ln" d="M280,104 L320,58" />
      <path class="ln" d="M280,104 L320,106" />
      <path class="ln" d="M280,104 L320,154" />
      <path class="lng" d="M430,58 L480,58" />
      <path class="lng" d="M430,106 L480,106" />
      <path class="lng" d="M430,154 L480,154" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="80" width="110" height="48" rx="6" />
      <rect class="box" x="170" y="80" width="110" height="48" rx="6" />
      <rect class="boxy" x="320" y="40" width="110" height="36" rx="6" />
      <rect class="boxy" x="320" y="88" width="110" height="36" rx="6" />
      <rect class="boxy" x="320" y="136" width="110" height="36" rx="6" />
      <rect class="boxg" x="480" y="40" width="140" height="36" rx="6" />
      <rect class="boxg" x="480" y="88" width="140" height="36" rx="6" />
      <rect class="boxg" x="480" y="136" width="140" height="36" rx="6" />
    </g>
    <text class="sm" x="75" y="100" text-anchor="middle">source object</text>
    <text class="sm" x="75" y="118" text-anchor="middle">4K, 3 GB</text>
    <text class="sm" x="225" y="100" text-anchor="middle">job queue</text>
    <text class="sm" x="225" y="118" text-anchor="middle">per segment</text>
    <text class="sm" x="375" y="63" text-anchor="middle">worker</text>
    <text class="sm" x="375" y="111" text-anchor="middle">worker</text>
    <text class="sm" x="375" y="159" text-anchor="middle">worker</text>
    <text class="sm" x="550" y="63" text-anchor="middle">1080p / 5 Mbps</text>
    <text class="sm" x="550" y="111" text-anchor="middle">720p / 3 Mbps</text>
    <text class="sm" x="550" y="159" text-anchor="middle">360p / 0.8 Mbps</text>
    <text class="lbl" x="320" y="205" text-anchor="middle" style="font-size:14px">encode is CPU-bound at roughly 1-3× realtime per rendition —</text>
    <text class="lbl" x="320" y="224" text-anchor="middle" style="font-size:14px">split the source into 10-second segments and fan those out</text>
  </svg>
  <figcaption>The parallelism unit is the segment, not the file. Fanning out by rendition alone caps a two-hour film at the speed of one CPU.</figcaption>
</figure>
<p>
  Three design points to raise. First, transcoding is asynchronous by
  definition — the upload response returns immediately with a
  <em>processing</em> status and the client polls or gets pushed a
  notification, which is the message-queue chapter applied directly. Second,
  jobs must be idempotent and keyed on the source object plus rendition, so a
  worker crashing halfway just gets retried without producing duplicates.
  Third, the output is not one file per rendition but hundreds of small
  HLS/DASH segments plus a manifest, because that is what lets a player
  switch bitrate mid-stream — and it means the CDN serves a huge number of
  small cacheable objects rather than a few enormous ones.
</p>

<h3>Where not to put blobs: your relational database</h3>
<p>
  Storing a file as a <code>BYTEA</code> or <code>BLOB</code> column is
  tempting because it gives you transactions and one backup story. It is
  almost always wrong at scale, for reasons worth being able to list quickly:
</p>
<ul>
  <li><b>It destroys your buffer pool.</b> The database caches pages of hot rows in RAM. A 2 MB blob evicts hundreds of useful index and row pages to serve one request. Your unrelated queries get slower.</li>
  <li><b>Backups and restores become impossible to schedule.</b> A 200 GB database backs up in minutes; the same database with 8 TB of images does not, and your recovery time objective quietly becomes hours.</li>
  <li><b>Replication amplifies it.</b> Every blob write ships to every replica over the replication stream, which is exactly the traffic you least want in a channel whose lag governs your read consistency.</li>
  <li><b>You cannot put a CDN in front of a SQL query.</b> Every byte comes out through your connection pool, competing with real queries for connections.</li>
  <li><b>Cost.</b> Database storage is priced like block storage, roughly 3-10× object storage, and you are paying it for bytes you never query on.</li>
</ul>
<p>
  The correct pattern: blob in object storage, <b>row in the database holding
  the key, size, content type, checksum and status</b>. You lose atomicity
  across the two — which is why the pending-then-confirmed state machine in
  the upload diagram exists, and why an orphan-sweeping job (objects with no
  row, rows with no object) belongs in the design.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Blobs go to object storage,
  metadata goes to Postgres. Uploads go direct from the client via a
  presigned PUT with a short expiry, a size cap and a server-generated key,
  so no file byte ever touches an app server. The row starts as pending and
  is flipped to ready by a worker consuming the bucket's object-created
  event, after scanning and thumbnailing. Reads are served from the CDN with
  signed URLs."
</div>

<h3>Hot, warm, cold: tiering and what it actually saves</h3>
<p>
  Access to stored data is extraordinarily skewed. A photo is viewed heavily
  in its first week and then approximately never — but must still be there in
  ten years. Tiering prices that reality.
</p>
<table>
  <tr><th>Tier</th><th>$/GB-month</th><th>Retrieval</th><th>First-byte latency</th><th>Right for</th></tr>
  <tr><td>Standard (hot)</td><td>~$0.023</td><td>free</td><td>tens of ms</td><td>Anything read this month</td></tr>
  <tr><td>Infrequent access (warm)</td><td>~$0.0125</td><td>~$0.01/GB</td><td>tens of ms</td><td>Read a few times a year; 30-day minimum charge</td></tr>
  <tr><td>Archive instant</td><td>~$0.004</td><td>~$0.03/GB</td><td>tens of ms</td><td>Compliance copies you must be able to produce immediately</td></tr>
  <tr><td>Archive flexible</td><td>~$0.0036</td><td>~$0.01/GB</td><td>minutes to hours</td><td>Backups, old media</td></tr>
  <tr><td>Deep archive (cold)</td><td>~$0.00099</td><td>~$0.02/GB</td><td>up to 12 hours</td><td>Legal retention you hope never to read</td></tr>
</table>
<p>
  Make the saving concrete. Take 5 PB of user media where 5% is read in any
  given month. All-hot costs about 5,000,000 GB × $0.023 = <b>$115,000 a
  month</b>. Move the 95% cold portion to deep archive and it becomes
  250,000 × $0.023 + 4,750,000 × $0.00099 ≈ 5,750 + 4,700 = <b>about $10,500
  a month</b> — a 90% cut, with the tradeoff that a rare access takes hours
  and costs a retrieval fee.
</p>
<div class="warn">
  <span class="ttl">⚠ Aggressive tiering can cost more than it saves</span>
  Every colder tier adds a minimum storage duration (30, 90 or 180 days) and
  a per-GB retrieval charge. Push objects to infrequent access after 7 days
  and then read 20% of them again, and you pay the retrieval fee plus the
  early-deletion penalty — often more than staying hot. Tier on the access
  distribution you measured, not on age alone; intelligent-tiering that
  observes access patterns and moves objects automatically is the safe answer
  when you do not know the distribution yet.
</div>
<p class="sub">
  One more line item people forget entirely: <b>egress</b>. Pulling data out
  of a cloud region runs around $0.05-0.09 per GB, which is roughly four
  times the monthly cost of storing it. For a media-heavy product, bandwidth
  out of the CDN is usually a larger bill than the storage itself, which is
  the real financial argument for high cache-hit ratios.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt mentions photos, video, documents, avatars, attachments, backups or "user uploads" — object storage is the answer, and presigned direct upload is the detail that earns the point.</li>
  <li>A naive design POSTs the file to the API and stores it in the database, then wonders why the app tier autoscales on upload traffic and backups take six hours.</li>
  <li>Distinguish it from a <b>caching</b> question: caching is about latency for data you already have; storage tiering is about cost for data you rarely touch. They use the same vocabulary (hot/cold) and mean different things.</li>
  <li>Distinguish durability from availability the moment anyone says "we can't lose the data" — and add that neither one protects against a bad deploy, which is what versioning and object lock are for.</li>
  <li>Files over ~100 MB, or mobile clients, means multipart and resumable uploads; anything with video means an async transcoding pipeline with idempotent, segment-level jobs.</li>
  <li>Pitfall: designing the write path beautifully and forgetting the read path. Say how the bytes get back out — signed CDN URLs, cache TTLs, and who pays the egress.</li>
</ul>`,
    },
    {
      id: "sysdes-search-systems",
      num: "I8",
      title: "Search systems (surface)",
      short: "Search systems",
      levels: ["intermediate"],
      practice: [],
      ready: true,
      subtitle: "The database scans; the inverted index looks up. Everything else in search is ranking and staleness.",
      body: `<h3>Why the obvious query can never work</h3>
<p>
  Every search feature starts as <code>SELECT * FROM items WHERE title LIKE
  '%running shoes%'</code>. It works on 10,000 rows in a laptop demo and
  fails on every axis at scale, for reasons that are worth being able to
  state precisely rather than waving at.
</p>
<ul>
  <li><b>The leading wildcard defeats the index.</b> A B-tree orders by prefix, so it can answer "starts with run" but has no way to jump to rows containing <em>run</em> somewhere in the middle. Every query becomes a full table scan.</li>
  <li><b>Scans do not fit the latency budget.</b> 50 million rows at 2 KB each is 100 GB. Even reading purely from page cache at several GB/s that is tens of seconds, and it burns the CPU and I/O of the database your writes depend on.</li>
  <li><b>It is literal.</b> "running shoes" does not match "shoes for running", "Running Shoe", or "sneakers". No stemming, no reordering, no synonyms.</li>
  <li><b>There is no ranking at all.</b> <code>LIKE</code> returns a set, not an order. With 40,000 matches you have no principled way to pick the 10 to show, and the ordering is the entire product.</li>
</ul>
<p>
  Postgres full-text search (<code>tsvector</code> plus a GIN index) fixes the
  first three and part of the fourth, and is genuinely the right answer up to
  a few million documents with modest query volume. Say so — reaching for
  Elasticsearch on day one is over-engineering and a good interviewer will
  say as much. But both roads lead to the same data structure, so understand
  it properly.
</p>

<h3>The inverted index, built from three documents</h3>
<p>
  A normal index maps <em>document → contents</em>. An inverted index maps
  <em>term → the documents containing it</em>, which is the direction a query
  actually needs. Each entry in the map is a <b>postings list</b>: the sorted
  document IDs for that term, usually with positions and term frequencies
  alongside.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="Three short documents about shoes being analyzed into an inverted index of five terms, where the term shoe appears in all three documents and the query red running intersects two postings lists to return document one">
    <g class="rough">
      <path class="ln" d="M225,122 L325,122" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="40" width="200" height="44" rx="6" />
      <rect class="box" x="20" y="100" width="200" height="44" rx="6" />
      <rect class="box" x="20" y="160" width="200" height="44" rx="6" />
      <rect class="boxy" x="330" y="40" width="290" height="28" rx="4" />
      <rect class="boxy" x="330" y="76" width="290" height="28" rx="4" />
      <rect class="boxr" x="330" y="112" width="290" height="28" rx="4" />
      <rect class="boxy" x="330" y="148" width="290" height="28" rx="4" />
      <rect class="boxy" x="330" y="184" width="290" height="28" rx="4" />
    </g>
    <text class="sm" x="34" y="68">D1 &nbsp;red running shoes</text>
    <text class="sm" x="34" y="128">D2 &nbsp;red shoes for kids</text>
    <text class="sm" x="34" y="188">D3 &nbsp;running shoes review</text>
    <text class="sm" x="275" y="112" text-anchor="middle">analyze</text>
    <text class="sm" x="344" y="59">red &nbsp;→ &nbsp;[D1, D2]</text>
    <text class="sm" x="344" y="95">run &nbsp;→ &nbsp;[D1, D3]</text>
    <text class="sm rd" x="344" y="131">shoe &nbsp;→ &nbsp;[D1, D2, D3]</text>
    <text class="sm" x="344" y="167">kid &nbsp;→ &nbsp;[D2]</text>
    <text class="sm" x="344" y="203">review &nbsp;→ &nbsp;[D3]</text>
    <text class="lbl" x="320" y="244" text-anchor="middle" style="font-size:15px">query "red running" → red[D1,D2] ∩ run[D1,D3] = D1</text>
    <text class="sm rd" x="320" y="274" text-anchor="middle">shoe matches everything, so it carries almost no signal — that is IDF</text>
  </svg>
  <figcaption>Both postings lists are sorted, so the intersection is a linear merge over two short lists — never a scan of the corpus.</figcaption>
</figure>
<p>
  The performance property is the whole point: query cost scales with the
  length of the postings lists for the query's terms, not with corpus size.
  Adding fifty million documents that contain neither <em>red</em> nor
  <em>run</em> costs those queries nothing. And because the lists are sorted
  integer sequences, they compress viciously well (delta encoding plus
  variable-byte or bitpacking), so a 100 GB corpus produces an index in the
  low tens of GB that largely lives in page cache.
</p>
<p class="sub">
  Postings usually store more than IDs. Term frequency per document powers
  scoring; term positions power phrase queries, so <code>"red shoes"</code> as
  an exact phrase can check that <em>red</em> at position i is followed by
  <em>shoe</em> at position i+1 rather than merely co-occurring in the
  document.
</p>

<h3>Analysis: the pipeline that decides what a term even is</h3>
<p>
  Notice that "running" became "run" and "for" disappeared. That transform is
  the <b>analyzer</b>, and it runs identically at index time and at query
  time — the non-negotiable rule of search, because a query term that was
  analyzed differently from the document term will simply never match.
</p>
<table>
  <tr><th>Stage</th><th>Does</th><th>"Red Running Shoes, for Kids!" becomes</th></tr>
  <tr><td>Character filter</td><td>Strip HTML, normalize punctuation and accents</td><td>Red Running Shoes for Kids</td></tr>
  <tr><td>Tokenizer</td><td>Split into terms on whitespace/punctuation rules</td><td>[Red] [Running] [Shoes] [for] [Kids]</td></tr>
  <tr><td>Lowercase</td><td>Case-fold</td><td>[red] [running] [shoes] [for] [kids]</td></tr>
  <tr><td>Stop words</td><td>Drop extremely common, low-information terms</td><td>[red] [running] [shoes] [kids]</td></tr>
  <tr><td>Stemming</td><td>Reduce inflections to a common root</td><td>[red] [run] [shoe] [kid]</td></tr>
  <tr><td>Synonyms (optional)</td><td>Expand or normalize equivalents</td><td>[red] [run] [shoe] [sneaker] [kid]</td></tr>
</table>
<p>
  Three things to know about these stages, because each has a real failure
  mode. <b>Tokenization is language-specific</b>: whitespace splitting is
  useless for Chinese and Japanese, which need dictionary-based segmentation,
  and it mangles identifiers like <code>C++</code> or
  <code>wi-fi</code>. <b>Stemming is a lossy heuristic</b> — Porter stemming
  maps "university" and "universe" both to "univers", and "operating" to
  "oper"; lemmatization is the dictionary-based, slower, more accurate
  alternative. <b>Stop words are no longer a clear win</b>: they were a
  compression trick from when index size dominated, and dropping them breaks
  phrase queries like "to be or not to be" and "The Who". Modern engines
  usually keep them and let IDF discount them automatically.
</p>
<div class="warn">
  <span class="ttl">⚠ Changing the analyzer means reindexing everything</span>
  The analyzer's output is baked into the index. Add a synonym list or switch
  stemmers and every existing document is now tokenized under the old rules
  while queries use the new ones — matches silently disappear. This is why
  production search runs <b>index aliases</b>: build the new index in
  parallel, backfill it, then atomically swing the alias. Volunteering that
  operational detail is a strong signal, because it is the thing that hurts
  in real life.
</div>

<h3>Relevance: TF-IDF, then BM25, then reality</h3>
<p>
  Once you have the matching set you must order it. The classical intuition is
  <b>TF-IDF</b>, built from two opposing forces:
</p>
<ul>
  <li><b>Term frequency.</b> A document mentioning "kayak" eight times is more about kayaks than one mentioning it once.</li>
  <li><b>Inverse document frequency.</b> A term appearing in nearly every document (<em>shoe</em> in our three-doc corpus, or <em>the</em> in any corpus) discriminates nothing, so its weight collapses toward zero. Rare terms carry the signal.</li>
</ul>
<p>
  A document's score for a query is the sum, over the query's terms, of
  term-frequency times inverse-document-frequency. <b>BM25</b> is the modern
  default and fixes two concrete defects in that formula, both worth naming:
</p>
<ul>
  <li><b>Term frequency saturates.</b> Under raw TF-IDF a page repeating "kayak" 500 times scores 500× a page mentioning it once, which is both wrong and trivially game-able. BM25 applies diminishing returns via a tunable parameter (k1, typically ~1.2), so going from 1 to 5 occurrences matters a lot and 50 to 500 matters almost nothing.</li>
  <li><b>Length normalization.</b> A long document naturally contains more terms and would otherwise win everything. BM25 divides by document length relative to the corpus average, with a parameter b (typically 0.75) controlling how hard that penalty bites.</li>
</ul>
<p class="sub">
  You do not need the closed form on a whiteboard. Saying "BM25 — TF-IDF with
  saturating term frequency and length normalization, and it's the default in
  Lucene" demonstrates exactly the right depth for a system design round. If
  someone pushes further, the honest frontier is that BM25 is a lexical
  score, and modern stacks add a <b>vector/embedding</b> retrieval arm to
  catch semantic matches BM25 misses, then fuse the two result sets.
</p>

<h3>Textual relevance is not business relevance</h3>
<p>
  BM25 answers "which document is most about these words." Nobody actually
  wants that. A news search wants recent things; a marketplace wants items
  that are in stock and convert; a music app wants the song people are
  streaming this week. Pure lexical relevance would happily rank a perfectly
  matching, sold-out, three-year-old listing first.
</p>
<p>
  Real systems therefore run <b>two stages</b>, and the separation is the
  architectural point:
</p>
<table>
  <tr><th>Stage</th><th>Input size</th><th>Cost per doc</th><th>Signals used</th></tr>
  <tr><td>Retrieval (candidate generation)</td><td>Millions → a few hundred</td><td>Must be microseconds</td><td>BM25 over the inverted index, plus hard filters (in stock, region, permissions)</td></tr>
  <tr><td>Ranking (rerank)</td><td>A few hundred → 10</td><td>Can afford milliseconds each</td><td>Recency decay, popularity, click-through history, personalization, a learned model</td></tr>
</table>
<p>
  The reason to split is pure economics: you cannot run a gradient-boosted
  model or a cross-encoder over ten million documents inside a 200 ms budget,
  but you can absolutely run it over 300. Blending is usually multiplicative
  or a weighted sum over normalized signals — a common shape being
  <em>final = bm25_norm × recency_decay × log(1 + popularity)</em>, where
  recency decay is an exponential with a half-life chosen per vertical (hours
  for news, months for products).
</p>
<div class="warn">
  <span class="ttl">⚠ Hard filters must happen in retrieval, not rerank</span>
  If "only show items I'm permitted to see" or "only in-stock" is applied
  after fetching the top 100, a user whose permitted set is rare gets an
  empty page while millions of matching documents exist. Permissions and
  availability belong in the index as filterable fields so the engine
  intersects them with the postings lists. Filtering after ranking is a
  correctness bug that presents as a relevance bug.
</div>

<h3>Elasticsearch in practice: shards, replicas, near-real-time</h3>
<p>
  Elasticsearch and OpenSearch are distributed wrappers around Lucene, and the
  three operational concepts you need are all visible in how a document
  becomes searchable.
</p>
<ul>
  <li><b>Shards</b> partition the index. Each shard is an independent Lucene index; a query fans out to every shard, each returns its local top-k, and a coordinating node merges them. Practical sizing is <b>10-50 GB per shard</b>. Over-sharding is the common mistake — every query pays coordination overhead on every shard, so a 20 GB index split into 100 shards is dramatically slower than the same data in 2.</li>
  <li><b>Replicas</b> are full copies of a shard. They provide both availability (a lost node loses no data) and read throughput (queries round-robin across copies). Writes go to the primary and replicate; read scaling is therefore cheap, write scaling requires more primaries, which requires more shards, which you cannot change without reindexing.</li>
  <li><b>Near-real-time.</b> Lucene segments are immutable. A new document goes to an in-memory buffer and is not searchable until a <em>refresh</em> creates a new segment — by default every 1 second. That one second is not a bug you can configure away for free: refreshing more often produces more tiny segments and more merge pressure. For bulk loads the standard move is to disable refresh entirely, index, then refresh once.</li>
</ul>
<p class="sub">
  Immutable segments also explain deletes and updates. A delete just marks a
  tombstone; an update is a delete plus an insert. Space is only reclaimed
  when background <b>merges</b> rewrite segments together, so a
  heavily-updated index carries dead weight and periodic merge I/O spikes.
  This is why Elasticsearch is a poor primary datastore for
  frequently-mutating rows and a great one for append-heavy documents.
</p>

<h3>Search is a secondary index, fed asynchronously</h3>
<p>
  This is the architectural claim that matters most in an interview, and the
  one candidates most often get backwards. <b>Your search cluster is not your
  source of truth.</b> It is a derived, denormalized, rebuildable projection
  of data that lives authoritatively somewhere else.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="Writes going from the application into Postgres as the source of truth, then flowing through change data capture into Kafka and an indexer that populates a search cluster, which the application queries back, with replication lag of up to thirty seconds in between">
    <g class="rough">
      <path class="ln" d="M130,49 L180,49" />
      <path class="ln" d="M310,49 L360,49" />
      <path class="ln" d="M480,49 L520,49" />
      <path class="ln" d="M570,72 L570,163 L520,163" />
      <path class="ln" d="M400,163 L350,163" />
      <path class="lng" d="M200,163 L75,163 L75,72" />
    </g>
    <g class="rough">
      <rect class="boxy" x="20" y="26" width="110" height="46" rx="6" />
      <rect class="boxg" x="180" y="26" width="130" height="46" rx="6" />
      <rect class="box" x="360" y="26" width="120" height="46" rx="6" />
      <rect class="box" x="520" y="26" width="100" height="46" rx="6" />
      <rect class="box" x="400" y="140" width="120" height="46" rx="6" />
      <rect class="boxy" x="200" y="140" width="150" height="46" rx="6" />
    </g>
    <text class="lbl" x="75" y="54" text-anchor="middle">app</text>
    <text class="lbl" x="245" y="48" text-anchor="middle">Postgres</text>
    <text class="sm" x="245" y="66" text-anchor="middle">source of truth</text>
    <text class="lbl" x="420" y="54" text-anchor="middle">CDC / outbox</text>
    <text class="lbl" x="570" y="54" text-anchor="middle">Kafka</text>
    <text class="lbl" x="460" y="158" text-anchor="middle">indexer</text>
    <text class="sm" x="460" y="176" text-anchor="middle">bulk, map, retry</text>
    <text class="lbl" x="275" y="158" text-anchor="middle">search cluster</text>
    <text class="sm" x="275" y="176" text-anchor="middle">secondary index</text>
    <text class="sm" x="155" y="40" text-anchor="middle">write</text>
    <text class="sm" x="335" y="40" text-anchor="middle">change</text>
    <text class="sm" x="500" y="40" text-anchor="middle">publish</text>
    <text class="sm rd" x="558" y="112" text-anchor="end">lag: 100 ms – 30 s</text>
    <text class="sm gr" x="150" y="152" text-anchor="middle">query</text>
    <text class="lbl rd" x="320" y="228" text-anchor="middle" style="font-size:14px">a write committed in Postgres is not yet findable in search — design the UX for that</text>
  </svg>
  <figcaption>The search cluster is downstream of the truth, always. Anything you can only learn by querying it is data you are prepared to lose and rebuild.</figcaption>
</figure>
<p>
  Three consequences follow, and each is an interview point on its own:
</p>
<ul>
  <li><b>No read-your-writes.</b> A user edits a listing and immediately searches for it; the change is committed but not yet indexed. Fixes, in increasing order of effort: tell the UI it may take a moment; read the just-written record from the primary and splice it into the results; or make the write path wait for an index acknowledgement, which trades latency for consistency and is rarely worth it.</li>
  <li><b>Never dual-write.</b> The tempting implementation is "write to Postgres, then write to Elasticsearch" in the same request handler. It fails the instant the second write errors or the process dies between them, and it leaves permanent, silent divergence. Use the <b>transactional outbox</b> (write the row and an outbox event in one transaction, a relay publishes the event) or <b>change data capture</b> from the database's replication log. Either way there is exactly one atomic commit.</li>
  <li><b>It is disposable, and that is the point.</b> Because the index is derived, you can always rebuild it from source. This is what makes the alias-swap reindex safe, and it means a corrupted search cluster is an availability incident, not a data-loss incident. It also means search should degrade gracefully — if the cluster is down, fall back to a database prefix lookup or a "search is temporarily unavailable" state rather than failing the whole page.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Search is a secondary index. The
  relational store stays the source of truth, and I'll propagate changes with
  CDC or a transactional outbox into a stream, with an indexer doing bulk
  writes into Elasticsearch. That gives me eventual consistency on the order
  of a second, so I'd handle read-your-writes at the API layer by merging the
  freshly-written record into results. If the cluster dies I rebuild it from
  the source rather than restore it from backup."
</div>

<h3>Autocomplete is a different problem with a different index</h3>
<p>
  Autocomplete fires on every keystroke, so its budget is roughly 50 ms
  end-to-end including the network, and it must handle a 2-character prefix
  matching millions of entries. Running a full BM25 query per keystroke is
  both too slow and semantically wrong — "shoe" typed as "sho" is not a term.
</p>
<table>
  <tr><th>Approach</th><th>How</th><th>Reach for this when…</th></tr>
  <tr><td>Edge n-grams</td><td>Index "shoes" as sh, sho, shoe, shoes — a prefix becomes an exact term lookup</td><td>You want it inside your existing search cluster with no new infrastructure; costs index size</td></tr>
  <tr><td>Trie / FST</td><td>Prefix tree in memory; walk the prefix, then collect the top-k completions stored at that node</td><td>You need the lowest possible latency and control over the ranked suggestions</td></tr>
  <tr><td>Precomputed top-k per prefix</td><td>Key-value store: prefix → the 10 best completions, refreshed offline from query logs</td><td>Query volume is enormous and the suggestion set changes slowly — a single cache hit per keystroke</td></tr>
  <tr><td>Fuzzy / typo-tolerant</td><td>Levenshtein-bounded automaton over the FST, usually edit distance 1 for short terms</td><td>Mobile users; be careful, it multiplies the candidate set</td></tr>
</table>
<p class="sub">
  The crucial insight is that suggestions should be ranked by what people
  <em>search for</em>, not by what exists in the catalogue. Build the
  suggestion index from query logs weighted by frequency and click-through,
  which also means it is small, offline-rebuildable, and can be pushed
  entirely into memory. And debounce on the client at 100-150 ms — the
  cheapest 60% traffic reduction in the whole design.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt says "search", "find", "filter by keyword", "typeahead", or describes users looking for something by name or description rather than fetching it by ID.</li>
  <li>A naive design puts <code>LIKE '%term%'</code> on the primary database and never mentions ranking — the two failures to call out immediately are the full scan and the absence of any ordering.</li>
  <li>Distinguish it from a <b>database indexing</b> question: a B-tree answers "give me the rows where x = y" exactly; search answers "give me the best rows for this fuzzy human intent, in order." Ranking is the tell.</li>
  <li>Distinguish it from a <b>recommendation</b> question: search has an explicit query string, recommendations do not. They share the two-stage retrieve-then-rank architecture, which is a good connection to draw.</li>
  <li>Any time you introduce a search cluster, immediately say how it gets fed and what the staleness window means for the user — the async secondary-index point is worth more than any detail about BM25.</li>
  <li>Pitfall: forgetting permissions and filters belong in the index. Post-filtering ranked results silently returns empty pages to exactly the users with the narrowest access.</li>
</ul>`,
    },
    {
      id: "sysdes-walkthrough-medium",
      num: "I9",
      title: "Walkthrough: a news feed / chat app",
      short: "Walkthrough: feed/chat",
      levels: ["intermediate"],
      practice: [],
      ready: true,
      subtitle:
        "Fan-out on write, fan-out on read, and the hybrid that exists because one account has 150 million followers.",
      body: `<h3>The problem, and what makes it a real interview</h3>
<p>
  "Design a news feed" is the most-asked medium system design question in the
  industry, and it is asked because it has one genuinely hard decision buried
  under a lot of easy ones. Everything about it — the API, the data model,
  the caching — is routine. The decision is <b>where the work happens: at
  write time or at read time</b>, and the fact that neither answer works
  alone at scale. Candidates who reach the hybrid, and can say why the
  threshold exists, pass. Candidates who describe a beautiful CRUD service
  and never state the tradeoff do not.
</p>
<p>
  Spend the first four minutes on scope. Not because interviewers reward
  ceremony, but because the fan-out decision is entirely determined by
  numbers you have to extract from them.
</p>
<table>
  <tr><th>In scope</th><th>Explicitly out of scope</th></tr>
  <tr><td>Post text and images; follow / unfollow</td><td>Ads, monetization, DMs</td></tr>
  <tr><td>Home feed: posts from accounts you follow</td><td>Search and hashtag discovery (see the search chapter)</td></tr>
  <tr><td>Infinite scroll, newest-first with light ranking</td><td>Full ML ranking infrastructure and training pipelines</td></tr>
  <tr><td>Likes and comment counts on feed items</td><td>Comment threads themselves</td></tr>
</table>
<p>
  Non-functional targets, stated as numbers because vague ones cannot drive a
  design: feed load <b>p99 under 200 ms</b>; a new post visible to followers
  within <b>a few seconds</b> (eventual consistency is fine and the product
  does not need better); <b>read-heavy by roughly 100:1</b>;
  availability 99.9% — a briefly stale feed is acceptable, an unavailable one
  is not. That last sentence already tells you the system should favour
  availability over consistency, which is the CAP-chapter tradeoff arriving
  as a product requirement rather than a theory question.
</p>

<h3>Capacity estimation, with the arithmetic shown</h3>
<p>
  Do this on the board, out loud, rounding aggressively. The goal is not
  accuracy to two significant figures; it is to surface the one or two
  numbers that eliminate an entire design.
</p>
<table>
  <tr><th>Quantity</th><th>Arithmetic</th><th>Result</th></tr>
  <tr><td>Daily active users</td><td>given</td><td>500 M</td></tr>
  <tr><td>Feed opens</td><td>500 M × 15 per day ÷ 86,400 s</td><td>~87,000 reads/s average</td></tr>
  <tr><td>Peak reads</td><td>× 3 for daily peak</td><td>~250,000 reads/s</td></tr>
  <tr><td>Posts</td><td>10% of DAU × 1.5 posts ÷ 86,400 s</td><td>~870 writes/s average, ~2,500/s peak</td></tr>
  <tr><td>Read : write ratio</td><td>87,000 ÷ 870</td><td>~100 : 1</td></tr>
  <tr><td>Average accounts followed</td><td>given (mean; median far lower)</td><td>200</td></tr>
  <tr><td>Post metadata storage</td><td>75 M/day × 500 B × 365</td><td>~14 TB/year — trivial</td></tr>
  <tr><td>Media storage</td><td>30% of 75 M × ~800 KB (all renditions) × 365</td><td>~6.6 PB/year — object storage, not a database</td></tr>
  <tr><td>Media egress at peak</td><td>250,000 feeds/s × ~6 images × 150 KB</td><td>~200 GB/s — a CDN problem, not an origin problem</td></tr>
</table>
<p>
  Two of those numbers decide the architecture. <b>100:1 read-heavy</b> says
  precompute: it is worth doing substantially more work per write to make
  reads cheap. And <b>6.6 PB/year of media at 200 GB/s</b> says the media
  path is completely separate from the feed path — object storage behind a
  CDN, with the feed API returning URLs, never bytes. Neither of those is a
  close call, and saying so quickly buys you time for the decision that is.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "At 100:1 read-to-write I'll
  spend write-time work to buy read-time speed — that points at
  fan-out on write. Before I commit, let me check what happens at the tail of
  the follower distribution, because that's where this design usually breaks."
</div>

<h3>The core services and the data model</h3>
<p>
  Four services, deliberately boring, so that the interesting part stands out.
  <b>Post service</b> owns the canonical posts table. <b>Graph service</b>
  owns follows, and answers "who follows X" and "who does X follow" — both
  directions, because fan-out needs the first and read-time merge needs the
  second. <b>Feed service</b> owns per-user materialized feeds. <b>Media
  service</b> issues presigned upload URLs and runs the transcode pipeline
  from the storage chapter.
</p>
<table>
  <tr><th>Store</th><th>Key</th><th>Holds</th><th>Why this shape</th></tr>
  <tr><td>posts</td><td>post_id (snowflake: time-ordered)</td><td>author_id, text, media keys, created_at, counters</td><td>Time-ordered IDs mean a sort by ID is a sort by time — no extra index</td></tr>
  <tr><td>follows</td><td>(follower_id, followee_id)</td><td>created_at</td><td>Stored twice, once per direction, because both lookups are hot</td></tr>
  <tr><td>feed</td><td>user_id → sorted list of (score, post_id)</td><td>capped at ~500 entries</td><td>IDs only. Hydrate post bodies separately so an edited post is never stale in a million copies</td></tr>
  <tr><td>counters</td><td>post_id</td><td>likes, comments</td><td>Separate, because they change orders of magnitude more often than the post does</td></tr>
</table>
<p class="sub">
  The single most important line in that table is <b>"IDs only"</b>. If you
  copy the post body into every follower's feed, a post edit or deletion means
  chasing a million copies, and your feed store balloons by a factor of 50.
  Store references; hydrate at read time from a cache keyed by post_id, where
  a single copy serves every reader.
</p>

<h3>Fan-out on write: pay at post time</h3>
<p>
  When a user posts, immediately push the post ID into the materialized feed
  of every one of their followers. Reading a feed then costs one range read
  of a precomputed list.
</p>
<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="An author posting once, with a fan-out worker writing that post ID into the precomputed feed list of each of the author's two hundred followers, so that a feed read is a single range scan">
    <g class="rough">
      <path class="ln" d="M130,139 L170,139" />
      <path class="ln" d="M235,116 L235,76" />
      <path class="ln" d="M300,139 L340,139" />
      <path class="lng" d="M450,139 L490,44" />
      <path class="lng" d="M450,139 L490,92" />
      <path class="lng" d="M450,139 L490,140" />
      <path class="lng" d="M450,139 L490,188" />
      <path class="lng" d="M450,139 L490,236" />
    </g>
    <g class="rough">
      <rect class="boxy" x="20" y="116" width="110" height="46" rx="6" />
      <rect class="box" x="170" y="116" width="130" height="46" rx="6" />
      <rect class="box" x="170" y="30" width="130" height="46" rx="6" />
      <rect class="box" x="340" y="116" width="110" height="46" rx="6" />
      <rect class="boxg" x="490" y="26" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="74" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="122" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="170" width="130" height="36" rx="6" />
      <rect class="boxg" x="490" y="218" width="130" height="36" rx="6" />
    </g>
    <text class="lbl" x="75" y="145" text-anchor="middle">author</text>
    <text class="lbl" x="235" y="58" text-anchor="middle">post store</text>
    <text class="lbl" x="235" y="145" text-anchor="middle">write API</text>
    <text class="sm" x="395" y="136" text-anchor="middle">fan-out</text>
    <text class="sm" x="395" y="154" text-anchor="middle">worker</text>
    <text class="sm" x="555" y="49" text-anchor="middle">feed:u1</text>
    <text class="sm" x="555" y="97" text-anchor="middle">feed:u2</text>
    <text class="sm" x="555" y="145" text-anchor="middle">feed:u3</text>
    <text class="sm" x="555" y="193" text-anchor="middle">…</text>
    <text class="sm" x="555" y="241" text-anchor="middle">feed:u200</text>
    <text class="lbl" x="320" y="272" text-anchor="middle" style="font-size:14px">one post → 200 list writes; the read is then one range scan</text>
  </svg>
  <figcaption>All the cost moves to the write, and it is asynchronous, so the author's request returns as soon as the post is durable.</figcaption>
</figure>
<p>
  The arithmetic: 870 posts/s × 200 followers = <b>~174,000 feed appends per
  second</b> average, and roughly 500,000/s at peak. That is a lot but it is
  entirely tractable — these are tiny appends to a sorted structure, spread
  across a sharded Redis or Cassandra cluster, and they are asynchronous so
  they can absorb a queue.
</p>
<p>
  Two optimizations cut it substantially and both are worth volunteering.
  <b>Fan out only to active users</b>: with 2 B registered accounts and 500 M
  daily actives, most followers will not open the app today, so writing to
  them is pure waste. Fan out to accounts active in the last 30 days and
  lazily build the feed for anyone else on their next login. And <b>cap the
  feed</b> at ~500 entries — nobody scrolls past that, and an uncapped list
  grows without bound.
</p>

<h3>Fan-out on read: pay at feed time</h3>
<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="A reader requesting their feed, which triggers fetching the recent posts of each of the two hundred accounts they follow and merging those lists at request time">
    <g class="rough">
      <path class="ln" d="M160,44 L330,130" />
      <path class="ln" d="M160,92 L330,134" />
      <path class="ln" d="M160,140 L330,138" />
      <path class="ln" d="M160,188 L330,142" />
      <path class="ln" d="M160,236 L330,146" />
      <path class="lng" d="M460,139 L490,139" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="26" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="74" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="122" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="170" width="140" height="36" rx="6" />
      <rect class="box" x="20" y="218" width="140" height="36" rx="6" />
      <rect class="boxy" x="330" y="116" width="130" height="46" rx="6" />
      <rect class="boxg" x="490" y="116" width="130" height="46" rx="6" />
    </g>
    <text class="sm" x="90" y="49" text-anchor="middle">posts by a1</text>
    <text class="sm" x="90" y="97" text-anchor="middle">posts by a2</text>
    <text class="sm" x="90" y="145" text-anchor="middle">posts by a3</text>
    <text class="sm" x="90" y="193" text-anchor="middle">…</text>
    <text class="sm" x="90" y="241" text-anchor="middle">posts by a200</text>
    <text class="sm" x="395" y="136" text-anchor="middle">k-way merge</text>
    <text class="sm" x="395" y="154" text-anchor="middle">+ rank</text>
    <text class="lbl" x="555" y="145" text-anchor="middle">reader</text>
    <text class="lbl rd" x="320" y="272" text-anchor="middle" style="font-size:14px">one write; but every single read touches 200 timelines and merges them</text>
  </svg>
  <figcaption>The write becomes free and the read becomes a distributed scatter-gather whose tail latency is set by the slowest of two hundred lookups.</figcaption>
</figure>
<table>
  <tr><th></th><th>Fan-out on write</th><th>Fan-out on read</th></tr>
  <tr><td>Write cost</td><td>O(followers) — 200 appends, up to 150 M for a celebrity</td><td>O(1) — one insert</td></tr>
  <tr><td>Read cost</td><td>O(1) — one range scan, p99 under 10 ms from cache</td><td>O(following) — 200 lookups plus a merge, per request</td></tr>
  <tr><td>Total ops at our numbers</td><td>174 k writes/s, 87 k cheap reads/s</td><td>870 writes/s, 17.4 M lookups/s</td></tr>
  <tr><td>Storage</td><td>Duplicated per follower</td><td>Single copy of each post</td></tr>
  <tr><td>Freshness</td><td>Seconds of lag while fan-out drains</td><td>Perfectly fresh by construction</td></tr>
  <tr><td>Unfollow / delete</td><td>Requires cleanup, or filtering at read</td><td>Free — the merge just stops including them</td></tr>
  <tr><td>Reach for this when…</td><td>Read-heavy, bounded follower counts</td><td>Write-heavy, or the reader follows very few, very prolific accounts</td></tr>
</table>
<p>
  17.4 million lookups per second, with a p99 gated by the slowest of 200
  parallel calls, is not a system you can operate. At a 100:1 read ratio,
  fan-out on read loses on arithmetic. But look at the top-right cell of that
  table again — that is where fan-out on write dies.
</p>

<h3>The celebrity problem, and the hybrid that answers it</h3>
<p>
  An account with <b>150 million followers</b> posts. Under pure fan-out on
  write that is 150 million feed appends for one tweet. Even at a dedicated
  100,000 appends/s you are looking at <b>1,500 seconds — 25 minutes</b>
  before the last follower sees it. Worse, it is bursty and it starves
  everyone else's fan-out behind it in the same queue. And ten such accounts
  posting in the same minute is a self-inflicted denial of service.
</p>
<p>
  The answer every real system converges on: <b>fan out on write for normal
  accounts, fan out on read for the handful of accounts above a follower
  threshold, and merge the two at request time.</b>
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A hybrid feed built by merging a precomputed materialized feed written at post time with a small number of celebrity timelines pulled at request time">
    <g class="rough">
      <path class="lng" d="M220,65 L300,100" />
      <path class="ln" d="M220,155 L300,125" />
      <path class="lng" d="M440,110 L500,110" />
    </g>
    <g class="rough">
      <rect class="boxg" x="40" y="40" width="180" height="50" rx="6" />
      <rect class="boxy" x="40" y="130" width="180" height="50" rx="6" />
      <rect class="box" x="300" y="85" width="140" height="50" rx="6" />
      <rect class="box" x="500" y="85" width="120" height="50" rx="6" />
    </g>
    <text class="lbl" x="130" y="64" text-anchor="middle">materialized feed</text>
    <text class="sm" x="130" y="82" text-anchor="middle">normal accounts</text>
    <text class="lbl" x="130" y="154" text-anchor="middle">celebrity pull</text>
    <text class="sm" x="130" y="172" text-anchor="middle">~6 timelines</text>
    <text class="lbl" x="370" y="107" text-anchor="middle">merge</text>
    <text class="sm" x="370" y="125" text-anchor="middle">+ rank + dedupe</text>
    <text class="lbl" x="560" y="115" text-anchor="middle">client</text>
    <text class="sm gr" x="130" y="108" text-anchor="middle">written at post time</text>
    <text class="sm" x="130" y="198" text-anchor="middle">read at request time</text>
    <text class="lbl" x="320" y="238" text-anchor="middle" style="font-size:14px">threshold ~100 k followers; a user follows fewer than 10 of them, so the merge is cheap</text>
  </svg>
  <figcaption>The asymmetry that makes this work: celebrity accounts are rare, so the read-time pull is tiny, while their follower counts are enormous, so the write-time push was ruinous.</figcaption>
</figure>
<p>
  Why this is cheap: the number of accounts above 100,000 followers is small,
  and crucially <b>the number of them any one user follows is small</b> —
  typically under ten. So a feed read becomes one range scan of the
  materialized feed plus perhaps six cached "recent posts by author" lookups,
  merged and re-sorted. That is a bounded, predictable cost, unlike the 200
  lookups of pure fan-out on read.
</p>
<p>
  Two refinements, if the interviewer digs. The threshold should ideally be
  dynamic rather than a magic constant — the real cost driver is
  <em>followers × posting rate</em>, so an account with 80,000 followers
  posting 50 times a day may deserve pull treatment while a 200,000-follower
  account posting monthly does not. And the celebrity's recent posts are a
  perfect cache target: one list, read by tens of millions of people, with a
  hit rate approaching 100%.
</p>
<div class="sticky mint">
  <span class="ttl">This is the whole question</span>
  Push for the many, pull for the few, merge at read. If you say only one
  thing in this interview, say that — with the 150 million × 25 minutes
  arithmetic that forces it.
</div>

<h3>Ranking, cursors, and the caching stack</h3>
<p>
  <b>Ranking.</b> Reverse-chronological is a legitimate v1 and you should say
  so. When ranking arrives, use the same two-stage shape as search:
  candidate generation pulls ~500 entries from the materialized feed plus
  celebrity pulls, then a scorer ranks them on
  <em>affinity × recency_decay × predicted_engagement</em>. Affinity is how
  much this reader interacts with this author; recency decay is exponential
  with a half-life of hours. Keep the score out of the stored feed if you
  want to change the model without a backfill.
</p>
<p>
  <b>Pagination must use cursors, never OFFSET.</b> The feed has new items
  inserted at the head constantly. With <code>LIMIT 20 OFFSET 20</code>, if
  five posts arrive between page 1 and page 2, everything shifts down by five
  and the user sees five duplicates and misses nothing — or, scrolling the
  other way, misses items entirely. A cursor encodes the position in the
  ordering itself: <code>(last_score, last_post_id)</code> for a ranked feed,
  or just the last post ID for a chronological one, base64-encoded so clients
  treat it as opaque. For a ranked feed also pin a <b>session seed and
  snapshot timestamp</b> in the cursor, so the ranking model does not reshuffle
  under the user mid-scroll.
</p>
<div class="warn">
  <span class="ttl">⚠ OFFSET is also a performance trap, not just a correctness one</span>
  Even with a static dataset, <code>OFFSET 10000</code> makes the database
  produce and discard 10,000 rows before returning yours. Deep pagination
  costs grow linearly with depth. Cursors are O(1) regardless of how far the
  user has scrolled, because they seek directly into the index.
</div>
<table>
  <tr><th>Layer</th><th>Key</th><th>Hit rate</th><th>Why it exists</th></tr>
  <tr><td>CDN</td><td>media URL</td><td>&gt;95%</td><td>Media is 200 GB/s at peak — this is the only layer that can carry it</td></tr>
  <tr><td>Feed list cache</td><td>feed:user_id</td><td>~90% for active users</td><td>The top ~100 IDs for active users; ~2 TB across the fleet, the tail lives in Cassandra</td></tr>
  <tr><td>Post hydration cache</td><td>post:post_id</td><td>&gt;95%</td><td>One copy read by everyone. A multi-get of 20 IDs replaces 20 database reads</td></tr>
  <tr><td>Celebrity timeline cache</td><td>author:recent</td><td>~100%</td><td>Makes the pull half of the hybrid essentially free</td></tr>
  <tr><td>Counter cache</td><td>counts:post_id</td><td>high, written back in batches</td><td>Like counts change far faster than posts; do not make the post cache churn for them</td></tr>
</table>
<p class="sub">
  Feed store sizing, since interviewers ask: 500 M active users × 500 entries
  × 40 bytes = ~10 TB if you keep everything hot. Keeping only the top 100
  entries in memory is 500 M × 100 × 40 = 2 TB, which is a manageable
  Redis cluster, with the remainder paged in from a disk-backed store on the
  rare deep scroll.
</p>

<h3>Part two: the same reasoning applied to chat</h3>
<p>
  Chat looks like a different problem and is largely the same one with the
  latency requirement tightened and the connection made persistent. Targets:
  message delivery <b>p99 under 500 ms</b>, <b>10 M concurrent connections</b>,
  ~20 B messages/day (~230,000/s average, ~600,000/s peak), and — unlike the
  feed — <b>ordering and delivery guarantees actually matter</b>. A feed
  showing posts slightly out of order is fine. A conversation showing the
  answer before the question is broken.
</p>
<figure>
  <svg viewBox="0 0 640 280" class="dg" role="img" aria-label="Two phones connected by WebSocket to different gateway nodes, with a registry mapping users to gateway nodes and a pub-sub bus routing a message from the sender's gateway to the recipient's gateway while persisting it to the message store">
    <g class="rough">
      <path class="ln" d="M130,60 L180,60" />
      <path class="ln dash" d="M310,52 L380,52" />
      <path class="ln" d="M310,72 L380,132" />
      <path class="lng" d="M380,145 L310,172" />
      <path class="lng" d="M180,177 L130,177" />
      <path class="ln" d="M440,154 L440,190" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="40" width="110" height="44" rx="6" />
      <rect class="boxy" x="180" y="40" width="130" height="44" rx="6" />
      <rect class="boxy" x="180" y="150" width="130" height="44" rx="6" />
      <rect class="box" x="20" y="150" width="110" height="44" rx="6" />
      <rect class="box" x="380" y="30" width="120" height="44" rx="6" />
      <rect class="box" x="380" y="110" width="120" height="44" rx="6" />
      <rect class="boxg" x="380" y="190" width="120" height="44" rx="6" />
    </g>
    <text class="lbl" x="75" y="68" text-anchor="middle">phone A</text>
    <text class="lbl" x="245" y="62" text-anchor="middle">gateway 1</text>
    <text class="sm" x="245" y="80" text-anchor="middle">holds A's socket</text>
    <text class="lbl" x="245" y="172" text-anchor="middle">gateway 3</text>
    <text class="sm" x="245" y="190" text-anchor="middle">holds B's socket</text>
    <text class="lbl" x="75" y="178" text-anchor="middle">phone B</text>
    <text class="lbl" x="440" y="52" text-anchor="middle">registry</text>
    <text class="sm" x="440" y="68" text-anchor="middle">user → gw node</text>
    <text class="lbl" x="440" y="130" text-anchor="middle">pub/sub</text>
    <text class="sm" x="440" y="147" text-anchor="middle">per-gateway topic</text>
    <text class="lbl" x="440" y="217" text-anchor="middle">message store</text>
    <text class="sm" x="155" y="50" text-anchor="middle">1 WSS</text>
    <text class="sm" x="345" y="42" text-anchor="middle">2 lookup</text>
    <text class="sm" x="345" y="104" text-anchor="middle">3 publish</text>
    <text class="sm gr" x="345" y="168" text-anchor="middle">4 deliver</text>
    <text class="sm" x="452" y="178">5 persist</text>
    <text class="lbl" x="320" y="262" text-anchor="middle" style="font-size:14px">the hard part is not the socket — it is knowing which of 40 gateway nodes holds it</text>
  </svg>
  <figcaption>Gateways are stateful in exactly one way: they own live sockets. Everything else is stateless, which is what lets you scale and restart them.</figcaption>
</figure>
<p>
  <b>Connection management.</b> A tuned Linux box holds 250,000-500,000 idle
  WebSockets — the constraint is memory (roughly 20-50 KB per connection in
  kernel and userspace buffers) and file descriptors, not the mythical 65,535
  port limit, which applies to outbound tuples rather than accepted
  connections. So 10 M concurrent needs about 40 gateway nodes plus headroom.
  Gateways must be as thin as possible: terminate TLS, hold the socket,
  translate frames to internal messages. The routing state lives in a
  <b>registry</b> (Redis: <code>user_id → gateway_node_id</code>, with a TTL
  refreshed by heartbeat) so that any service can find any user's socket in
  one lookup. Sending to a user is then: look up the node, publish to that
  node's topic, gateway writes the frame.
</p>
<div class="warn">
  <span class="ttl">⚠ The reconnect storm is the failure mode interviewers probe</span>
  A gateway holding 250,000 sockets restarts. All 250,000 clients notice
  simultaneously and reconnect within a second, hammering your load balancer,
  your auth service and your registry at once — and if that overloads the
  next gateway, you cascade. Mitigations to name: jittered exponential
  backoff on the client (mandatory), a connection-rate limit at the gateway
  that sheds rather than queues, and rolling restarts that drain slowly
  instead of dropping everything at once. This is the availability chapter's
  failback storm, in its most common real-world costume.
</div>
<p>
  <b>Ordering.</b> Never order by client timestamp — clocks are skewed by
  seconds and users can set them arbitrarily. Assign a <b>monotonic
  per-conversation sequence number</b> at a single owner (the shard that owns
  that conversation), so ordering is total within the conversation, which is
  the only place it is observable. Global ordering across conversations is
  neither needed nor affordable. The client also attaches a
  <b>client-generated message UUID</b> so a retry after an ambiguous timeout
  is deduplicated server-side rather than posting twice — the cheapest
  idempotency mechanism there is, and its absence is a very visible gap.
</p>
<p>
  <b>Delivery receipts</b> are a four-state machine — sent, server-acked,
  delivered to device, read — and each transition is itself a message that
  must be stored and routed. That doubles or triples your message volume, so
  batch them: acknowledge up to a sequence number rather than per message.
  <b>Presence</b> looks trivial and is not: 10 M online users heartbeating
  every 30 seconds is ~330,000 writes/s just to say "still here," and a
  single online/offline transition must notify everyone watching. Only
  subscribe to presence for contacts currently visible on screen, and batch
  transitions into a periodic digest rather than pushing each one.
</p>
<p>
  <b>And then group chat brings the fan-out question straight back.</b> A
  message to a 5-person group is 5 deliveries — push it into each member's
  inbox, exactly like fan-out on write. A message to a 100,000-member
  community is 100,000 deliveries per message, which is the celebrity problem
  wearing a different hat. The same answer applies: <b>store the message once
  per conversation and let clients pull by (conversation_id, seq &gt;
  last_seen_seq)</b>, with a lightweight "something changed" nudge instead of
  a full delivery. Small groups push, large groups pull, and the threshold
  is again about member count times message rate. Read receipts in a large
  group get degraded to an aggregate count or removed entirely, because N
  readers × M messages of receipt traffic exceeds the traffic of the
  conversation itself.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Chat is the same fan-out
  decision with a tighter latency budget. Small conversations fan out on
  write into per-user inboxes; large ones store once and let clients pull by
  sequence number. Ordering is a per-conversation monotonic sequence assigned
  server-side, and client-generated message IDs make retries idempotent. The
  genuinely stateful part is the gateway layer, so I'd keep gateways thin and
  put user-to-node routing in a registry with heartbeat TTLs."
</div>

<h3>What the interviewer was actually scoring</h3>
<ul>
  <li><b>Did you find the real decision?</b> Everything in this design is easy except fan-out. Time spent on the posts table schema is time not spent on the thing being evaluated. Getting to the fan-out tradeoff inside ten minutes is itself the signal.</li>
  <li><b>Did the numbers drive the design, or decorate it?</b> Estimating 87,000 reads/s and then not using it is worse than not estimating. The chain that scores is: 100:1 read ratio → precompute → 150 M followers breaks precompute → hybrid. Each number must eliminate an option.</li>
  <li><b>Did you reach the hybrid unprompted?</b> Proposing pure fan-out on write and defending it until the interviewer says "what about a celebrity" is a mid-level performance. Anticipating the tail of the follower distribution yourself is a senior one.</li>
  <li><b>Did you state what you gave up?</b> Every choice here costs something: the hybrid adds merge complexity and two code paths that can disagree; capped feeds mean deep scroll needs a fallback; async fan-out means seconds of staleness. Naming the cost of your own design is the strongest single behaviour in the whole loop.</li>
  <li><b>Did you separate the media path?</b> Candidates who route 200 GB/s of images through their API tier have quietly designed something that cannot exist. Object storage plus CDN, with the feed returning URLs, should be a throwaway sentence — but it has to be said.</li>
  <li><b>Did you handle the boring correctness details?</b> Cursor pagination instead of OFFSET, idempotent writes, IDs-not-bodies in the feed. These separate people who have shipped this from people who have read about it, and they cost one sentence each.</li>
  <li><b>Did you scope, and did you push back?</b> Saying "reverse-chronological for v1, and here's where ranking would slot in" is stronger than hand-waving an ML system you cannot describe. Interviewers are calibrating judgement about what to build now, not enthusiasm for building everything.</li>
</ul>`,
    },

    {
      id: "sysdes-cap-theorem-depth",
      num: "A1",
      title: "The CAP theorem in depth",
      short: "CAP theorem in depth",
      levels: ["advanced"],
      practice: [],
      ready: true,
      subtitle:
        'You never "pick two" — you pick one letter during a partition, and PACELC tells you what you picked for the other 99.9% of the time.',
      body: `<h3>The version everyone repeats is wrong, and the wrongness matters</h3>
<p>
  The folklore statement is "consistency, availability, partition
  tolerance — pick two." That framing fails the moment you take it
  seriously, because <b>P is not a choice you get to make</b>. A partition
  is a property of the network: a cut fibre, a failed top-of-rack switch, a
  bad BGP announcement, an AZ losing connectivity, or — most commonly — a
  node that is merely <em>slow</em> (a 40-second stop-the-world GC pause, a
  VM live-migration stall) and is therefore indistinguishable from a dead
  one. You cannot buy a network that never partitions, so "CA" is not a
  system design. It is a system with no story for partitions, which under
  partition quietly gives up both letters.
</p>
<p>
  The precise statement is narrower and far more useful: <b>when a
  partition occurs, and only then, you must choose between consistency and
  availability.</b> When there is no partition — which is essentially all
  of the time — CAP says nothing whatsoever about your system. That last
  clause is the one that separates candidates: CAP is a theorem about the
  rare case, and the rare case is not where your latency budget lives.
</p>
<figure>
  <svg viewBox="0 0 640 270" class="dg" role="img" aria-label="Two nodes on either side of a severed network link, with the two possible responses shown below: the CP choice refuses writes on the minority side, and the AP choice accepts writes on both sides and diverges">
    <g class="rough">
      <path class="ln" d="M110,72 L170,72" />
      <path class="lnr dash" d="M270,72 L370,72" />
      <path class="ln" d="M470,72 L530,72" />
      <path class="lnr" d="M306,58 L334,86" />
      <path class="lnr" d="M334,58 L306,86" />
      <path class="ln" d="M215,94 L172,168" />
      <path class="ln" d="M425,94 L468,168" />
    </g>
    <g class="rough">
      <rect class="box"  x="20"  y="50"  width="90"  height="44" rx="6" />
      <rect class="boxy" x="170" y="50"  width="100" height="44" rx="6" />
      <rect class="boxy" x="370" y="50"  width="100" height="44" rx="6" />
      <rect class="box"  x="530" y="50"  width="90"  height="44" rx="6" />
      <rect class="boxr" x="60"  y="168" width="220" height="76" rx="6" />
      <rect class="boxy" x="360" y="168" width="220" height="76" rx="6" />
    </g>
    <text class="lbl" x="65"  y="78"  text-anchor="middle">client A</text>
    <text class="lbl" x="220" y="78"  text-anchor="middle">node 1</text>
    <text class="lbl" x="420" y="78"  text-anchor="middle">node 2</text>
    <text class="lbl" x="575" y="78"  text-anchor="middle">client B</text>
    <text class="sm rd" x="320" y="36" text-anchor="middle">partition — each side thinks the other died</text>
    <text class="lbl rd" x="170" y="192" text-anchor="middle">choose C</text>
    <text class="sm" x="170" y="212" text-anchor="middle">minority refuses writes,</text>
    <text class="sm" x="170" y="230" text-anchor="middle">client A gets an error</text>
    <text class="lbl" x="470" y="192" text-anchor="middle">choose A</text>
    <text class="sm" x="470" y="212" text-anchor="middle">both sides accept writes,</text>
    <text class="sm" x="470" y="230" text-anchor="middle">histories diverge — merge later</text>
  </svg>
  <figcaption>The choice only exists inside the red X. Notice that neither branch is "correct" — one costs you an error page, the other costs you a reconciliation problem you must have designed in advance.</figcaption>
</figure>

<h3>The three letters, defined precisely (this is where marks are lost)</h3>
<table>
  <tr><th>Letter</th><th>What it formally means</th><th>What candidates think it means</th></tr>
  <tr><td>C</td><td><b>Linearizability.</b> The system behaves as if there is exactly one copy of the data: every read returns the value of the most recently completed write, and once a read sees a value, no later read sees an older one.</td><td>The C in ACID (integrity constraints). Unrelated.</td></tr>
  <tr><td>A</td><td><b>Every request to a non-failing node returns a non-error response.</b> No bound on how long it takes, and no promise the answer is fresh.</td><td>"Four nines of uptime." Also unrelated — a CP system can have a better SLA than an AP one.</td></tr>
  <tr><td>P</td><td>The system keeps operating when arbitrary messages between nodes are dropped.</td><td>An optional feature. It is not optional.</td></tr>
</table>
<p class="sub">
  Two consequences fall straight out of those definitions. First, CAP-A has
  no latency bound, so a system that answers in 30 seconds is "available" —
  which is why CAP alone is useless for reasoning about production SLOs.
  Second, CAP-C is <em>linearizability</em>, the strongest single-object
  guarantee; weaker useful models (read-your-writes, monotonic reads,
  causal consistency) sit below it and are perfectly compatible with staying
  available during a partition. "AP" does not mean "no guarantees."
</p>

<h3>What CP actually looks like from the client's seat</h3>
<p>
  Take a five-node leader-based cluster — etcd, ZooKeeper, a Spanner
  Paxos group, a MongoDB replica set with majority write concern. The
  network splits it 3 | 2.
</p>
<ul>
  <li><b>Majority side (3 nodes):</b> keeps or elects a leader, keeps committing writes, fully functional. If the old leader was on this side, there is no interruption at all.</li>
  <li><b>Minority side (2 nodes):</b> cannot reach a quorum, so it cannot commit anything. Writes fail immediately with something like "no leader" or a context deadline. Reads either fail too, or are served locally and are knowingly stale — that is a per-system decision, and a good one to ask about.</li>
  <li><b>A client pinned to the minority</b> sees hard errors for the entire duration of the partition, plus an election timeout on top (Raft's classic 150–300 ms, etcd's default 1000 ms, ZooKeeper tick-based failover typically a few seconds).</li>
</ul>
<p>
  The client-visible contract is: <b>never a wrong answer, sometimes no
  answer.</b> That is the right trade whenever a wrong answer is more
  expensive than an error page — a ledger balance, decrementing the last
  unit of inventory, a cluster-membership record, a lock, a feature-flag
  kill switch.
</p>

<h3>What AP actually looks like from the client's seat</h3>
<p>
  Now the same partition in Cassandra at consistency level ONE, or DynamoDB
  with eventually-consistent reads, or Riak. Both sides accept writes.
  Every client gets a 200. Nothing appears wrong — and that is precisely
  the danger, because the damage is deferred to reconciliation time. When
  the partition heals you have two divergent histories, and something has
  to merge them:
</p>
<table>
  <tr><th>Reconciliation strategy</th><th>What it costs</th><th>Reach for it when…</th></tr>
  <tr><td><b>Last-write-wins</b> by timestamp</td><td>Silently discards one side's writes. With wall-clock timestamps, clock skew of a few hundred ms decides which user's data survives.</td><td>The value is a cache-like overwrite where losing an update is genuinely acceptable — a "last seen at" field, a presence flag.</td></tr>
  <tr><td><b>Siblings / vector clocks</b> returned to the app</td><td>Every read path must now handle "here are 3 conflicting values." Real complexity, pushed into product code.</td><td>The app has domain knowledge that makes merging obvious (union the shopping cart).</td></tr>
  <tr><td><b>CRDTs</b> (G-Counter, OR-Set, LWW-Register)</td><td>Restricted data types, metadata growth, and you must model the domain as a mergeable lattice.</td><td>Counters, sets, collaborative text, presence — anywhere concurrent edits are normal (Redis CRDT, Automerge, Yjs).</td></tr>
  <tr><td><b>Read repair + anti-entropy</b> (Merkle trees)</td><td>Background convergence only; does not decide semantics, just propagates whatever the winner already is.</td><td>Always — it is a complement to one of the above, never a substitute.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ "We'll go AP" is only half an answer</span>
  The interviewer's next sentence is "so how do you merge?" If you cannot
  name last-write-wins, siblings, or a CRDT and say which one you'd use for
  <em>this</em> data, you have taken AP's availability without paying AP's
  price. "Eventually consistent" describes an outcome, not a mechanism.
  The canonical example is the Dynamo shopping cart: under LWW, a partition
  loses items a customer added; modelled as an OR-Set, the merge is a union
  and the worst case is a deleted item reappearing — which Amazon judged
  strictly better than a lost sale.
</div>

<h3>PACELC — the framing that actually predicts database behaviour</h3>
<p>
  Abadi's 2010 extension is the one to bring up unprompted, because it
  covers the case CAP ignores: <b>if there is a Partition, choose A or C;
  Else, choose Latency or Consistency.</b> The "else" half applies over
  99.9% of your system's life, and it is not a legal technicality — it is
  forced by physics. Keeping replicas linearizable requires a round trip to
  a quorum before you can answer, and round trips cost:
</p>
<table>
  <tr><th>Hop</th><th>Typical RTT</th><th>What that means for a quorum write</th></tr>
  <tr><td>Same rack / same AZ</td><td>0.2–0.5 ms</td><td>Consistency is nearly free; take it.</td></tr>
  <tr><td>Cross-AZ, same region</td><td>0.5–2 ms</td><td>Still cheap. This is why a 3-AZ quorum inside one region is the default shape for most CP systems.</td></tr>
  <tr><td>us-east ↔ us-west</td><td>60–70 ms</td><td>A cross-region quorum write costs at minimum the second-fastest RTT. Your write p50 now starts at ~35 ms.</td></tr>
  <tr><td>us-east ↔ eu-west</td><td>75–90 ms</td><td>Global linearizable writes are tens of milliseconds, permanently. No amount of engineering removes this.</td></tr>
</table>
<p>
  Spanner is the clearest illustration of choosing consistency in the
  "else" branch and simply paying: it is PC/EC, it commits through Paxos
  across regions, and it adds a deliberate <b>commit wait</b> of roughly
  twice the TrueTime clock uncertainty (single-digit milliseconds) so that
  commit timestamps are globally meaningful. Writes land in the tens of
  milliseconds. In exchange you get external consistency across a planet,
  and read-only transactions at a past timestamp that any replica can serve
  locally with no coordination at all.
</p>

<h3>Where real systems sit — the honest, tunable version</h3>
<table>
  <tr><th>System</th><th>PACELC</th><th>Why, and where the knob is</th></tr>
  <tr><td><b>Postgres</b>, single primary + sync standby</td><td>PC/EC</td><td>With <code>synchronous_commit = on</code> and a named standby, a commit waits for the standby. Lose the standby and writes block — that is CP behaving as advertised. Switch to <code>local</code>/async and you become EL with replica reads stale by the replication lag (sub-ms idle, seconds-to-minutes under a heavy write burst or a long-running query on the replica).</td></tr>
  <tr><td><b>DynamoDB</b></td><td>PA/EL (default)<br />PC/EC (per read)</td><td>Reads are eventually consistent by default and served by any of the three AZ replicas. Pass <code>ConsistentRead=true</code> and you route to the leader replica: 2× the read cost, a few extra ms, and unavailable if that partition has no leader. The letter is chosen <em>per API call</em>.</td></tr>
  <tr><td><b>Cassandra / ScyllaDB</b></td><td>PA/EL (default)<br />PC/EC (QUORUM)</td><td>Consistency level is per query. ONE is fast and stale-tolerant; QUORUM read + QUORUM write gives R + W &gt; N and single-key linearizability-ish behaviour at the cost of latency; LOCAL_QUORUM keeps you inside one DC. Note that sloppy quorums with hinted handoff can violate the overlap guarantee during a partition — worth knowing.</td></tr>
  <tr><td><b>Spanner / CockroachDB</b></td><td>PC/EC</td><td>Paxos/Raft per range, majority commit. Consistency is not negotiable; latency is the bill. Follower reads and bounded-staleness reads are the escape hatch when you want EL for a specific query.</td></tr>
  <tr><td><b>ZooKeeper</b></td><td>PC/EC (writes)</td><td>Zab totally orders writes through a leader with a majority. But <b>reads are served locally by any follower and may be stale</b> — you must call <code>sync()</code> first for a linearizable read. Saying this unprompted is a strong signal.</td></tr>
  <tr><td><b>etcd</b></td><td>PC/EC</td><td>Raft; linearizable reads by default via read-index. Minority members return errors. This is the coordination substrate for Kubernetes precisely because it refuses to guess.</td></tr>
  <tr><td><b>MongoDB</b></td><td>PC/EC or PA/EL</td><td><code>w:majority</code> + <code>readConcern:majority</code> is CP-ish; <code>w:1</code> plus reads from secondaries is AP-ish and can lose acknowledged writes on failover (rollback files).</td></tr>
  <tr><td><b>Redis</b> (Sentinel or Cluster)</td><td>Neither, honestly</td><td>Replication is always asynchronous, so a failover can lose writes the primary already acknowledged. It is AP-shaped <em>without</em> AP's conflict resolution — the losing writes just vanish. <code>WAIT</code> reduces the window but is not a quorum commit. Treat Redis as a cache or a lossy store, and never as your source of truth for money.</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The one line to remember</span>
  The choice is made <b>per operation</b>, not per database. Almost every
  modern store exposes the dial as a per-request consistency level, write
  concern, or read flag — so the interesting design question is never "is
  this system CP or AP", it is "which of my operations can tolerate a stale
  read, and which cannot".
</div>

<h3>The quorum dial: R + W &gt; N</h3>
<p>
  In a Dynamo-style system with N replicas, you require W acknowledgements
  to accept a write and R responses to serve a read. If <b>R + W &gt; N</b>,
  the read set and the write set must overlap in at least one replica, so
  every read touches at least one node that saw the latest write.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="Three replicas labelled A, B and C, where a write is acknowledged by A and B while a read is answered by B and C, so replica B appears in both sets and guarantees the read observes the write">
    <g class="rough">
      <path class="lng" d="M110,124 L140,128" />
      <path class="lng" d="M110,142 Q220,206 292,162" />
      <path class="ln" d="M500,130 L536,130" />
      <path class="ln" d="M528,146 Q426,208 348,166" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="108" width="90" height="44" rx="6" />
      <circle class="boxg" cx="180" cy="130" r="40" />
      <circle class="boxy" cx="320" cy="130" r="40" />
      <circle class="box"  cx="460" cy="130" r="40" />
      <rect class="box" x="536" y="108" width="90" height="44" rx="6" />
    </g>
    <text class="lbl" x="65"  y="136" text-anchor="middle">writer</text>
    <text class="lbl" x="180" y="136" text-anchor="middle">A</text>
    <text class="lbl" x="320" y="136" text-anchor="middle">B</text>
    <text class="lbl" x="460" y="136" text-anchor="middle">C</text>
    <text class="lbl" x="581" y="136" text-anchor="middle">reader</text>
    <text class="sm gr" x="20"  y="40">W = 2 (green)</text>
    <text class="sm"    x="470" y="40">R = 2</text>
    <text class="lbl" x="320" y="40" text-anchor="middle">N = 3</text>
    <text class="sm" x="320" y="205" text-anchor="middle">B is in both sets — the overlap is the whole guarantee</text>
  </svg>
  <figcaption>The pigeonhole principle is doing all the work: two sets of size 2 drawn from 3 replicas cannot be disjoint.</figcaption>
</figure>
<table>
  <tr><th>N=3 config</th><th>Behaviour</th><th>Reach for this when…</th></tr>
  <tr><td>W=1, R=1</td><td>Fastest possible both ways, no overlap, reads can be arbitrarily stale. One replica loss loses data.</td><td>Metrics, logs, view counters, anything where losing a write is a rounding error.</td></tr>
  <tr><td>W=2, R=2</td><td>Overlap guaranteed. Tolerates one node down for both reads and writes.</td><td>The default. Most OLTP-ish workloads on a Dynamo-style store.</td></tr>
  <tr><td>W=3, R=1</td><td>Reads are single-hop fast; any node down makes writes unavailable.</td><td>Read-dominated config data written rarely.</td></tr>
  <tr><td>W=1, R=3</td><td>Writes are single-hop fast; any node down makes reads unavailable.</td><td>Rarely correct — usually a sign the workload wants W=2, R=2.</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll run N=3 across three
  AZs with quorum reads and writes for the orders table — cross-AZ RTT is
  about a millisecond so consistency is nearly free there. For the product
  catalogue I'll drop to R=1 and accept a few seconds of staleness, because
  a stale price on a listing page is recoverable and an unavailable
  listing page is not."
</div>

<h3>Using CAP in the room without sounding like a flashcard</h3>
<p>
  The senior move is to refuse the question as posed. Nobody designs "a CP
  system"; you design a system in which <em>different data has different
  requirements</em>, and you say so explicitly:
</p>
<ul>
  <li><b>Payments ledger, account balances, idempotency keys:</b> CP. Refuse the write rather than double-charge.</li>
  <li><b>Session store, presence, notification counts, feed ranking:</b> AP. A stale unread count costs nothing.</li>
  <li><b>Inventory:</b> split it. The last 50 units of a SKU are sold through a CP path with a real reservation; the "1,200 in stock" badge on the listing page is AP and can be minutes old. Ticketmaster-style seat selection is the same trick — browse is AP, hold is CP.</li>
  <li><b>Cluster metadata, leader election, feature-flag kill switches:</b> CP, and delegated to etcd or ZooKeeper rather than built.</li>
</ul>
<div class="warn">
  <span class="ttl">⚠ Three sentences that cost you the level</span>
  "It's a CA system" (there is no such thing across a network).
  "CAP says pick two" (it says pick one, and only during a partition).
  "We'll use Cassandra because it's AP" (Cassandra is whatever your
  consistency level says it is, per query). Any of these tells the
  interviewer you learned CAP from a blog post rather than from an outage.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt spans more than one datacentre, region, or AZ — the moment replicas can be separated by a network, CAP is live and the interviewer will probe it.</li>
  <li>Words like "globally distributed", "multi-region active-active", "must never lose a write", "must always accept a write" are direct invitations to name your partition-time choice.</li>
  <li>A naive design says "we'll replicate to the other region" and stops. The follow-up that exposes it is always: <em>what does the client see while the link between them is down?</em> Have that answer ready before it's asked.</li>
  <li>Distinguish from the plain replication chapter: replication is about <em>how</em> copies get updated; CAP is about what you do when they <em>can't</em>. Distinguish from PACELC's else-branch: if the network is healthy and you are still arguing about staleness, that is a latency-vs-consistency question, not a CAP question.</li>
  <li>If you choose AP, immediately state the merge function. If you choose CP, immediately state the blast radius: which clients get errors, for how long, and what the retry/queue story is so the user doesn't just see a 500.</li>
  <li>The strongest closing move is to make the choice per-operation and justify each one with the business cost of being wrong versus the business cost of being down.</li>
</ul>`,
    },
    {
      id: "sysdes-sharding-partitioning",
      num: "A2",
      title: "Sharding & partitioning at scale",
      short: "Sharding at scale",
      levels: ["advanced"],
      practice: [],
      ready: true,
      subtitle:
        "One machine is a limit, not a bug — but the shard key you pick in week one is the decision you will still be paying for in year five.",
      body: `<h3>The wall you hit, and the things to try before sharding</h3>
<p>
  Sharding is splitting one logical dataset across many independent
  databases so that no single machine holds it all. It is the most powerful
  scaling tool you have and the most expensive, because it takes away
  things you have relied on your whole career: joins, transactions, unique
  constraints, and <code>ORDER BY</code> across the whole table. The senior
  answer to "how would you scale the database?" starts by <em>not</em>
  sharding.
</p>
<table>
  <tr><th>Do this first</th><th>Buys you</th><th>Runs out when…</th></tr>
  <tr><td>Vertical scaling</td><td>A modern cloud box tops out around 400+ vCPU and 24 TB of RAM. A well-tuned Postgres on NVMe handles roughly 5–10k simple indexed reads/sec per core-rich box and low thousands of write TPS.</td><td>Price becomes superlinear, and the single-writer ceiling is fixed no matter how big the box is.</td></tr>
  <tr><td>Read replicas</td><td>Scales reads ~linearly. Five replicas, five times the read capacity.</td><td>Writes still all land on one primary. Replication lag becomes a correctness problem for read-your-writes.</td></tr>
  <tr><td>Caching (see the caching chapter)</td><td>Removes 80–95% of reads for skewed workloads at ~0.3 ms per hit.</td><td>The write path and cache-miss path are unchanged; a cold cache now takes the DB down.</td></tr>
  <tr><td>Archiving cold rows / table partitioning on one host</td><td>Keeps the hot working set in RAM. Postgres declarative partitioning and index-only scans often buy a full order of magnitude.</td><td>The <em>hot</em> set alone exceeds RAM, or write throughput exceeds one primary.</td></tr>
</table>
<p>
  You shard when one of three things is true: the working set no longer
  fits in RAM on the biggest box you're willing to pay for; write
  throughput exceeds what one primary can commit; or the blast radius has
  become unacceptable (a single 8 TB database takes hours to restore, and
  during those hours every customer is down).
</p>

<h3>Vertical vs horizontal partitioning</h3>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="On the left, vertical partitioning splits a table by columns into a hot narrow store and a cold wide store; on the right, horizontal partitioning splits the same table by rows into three shards covering different user id ranges">
    <g class="rough">
      <rect class="box"  x="30"  y="70"  width="110" height="118" rx="6" />
      <rect class="boxy" x="160" y="70"  width="110" height="118" rx="6" />
      <rect class="box"  x="370" y="70"  width="240" height="36"  rx="6" />
      <rect class="boxy" x="370" y="112" width="240" height="36"  rx="6" />
      <rect class="boxg" x="370" y="154" width="240" height="36"  rx="6" />
    </g>
    <text class="lbl" x="150" y="42" text-anchor="middle">vertical — split by column</text>
    <text class="lbl" x="490" y="42" text-anchor="middle">horizontal — split by row</text>
    <text class="sm" x="85"  y="120" text-anchor="middle">id, email,</text>
    <text class="sm" x="85"  y="138" text-anchor="middle">name, tier</text>
    <text class="sm" x="85"  y="164" text-anchor="middle">hot, narrow</text>
    <text class="sm" x="215" y="120" text-anchor="middle">avatar_blob,</text>
    <text class="sm" x="215" y="138" text-anchor="middle">bio, prefs_json</text>
    <text class="sm" x="215" y="164" text-anchor="middle">cold, wide</text>
    <text class="sm" x="490" y="93"  text-anchor="middle">shard 0 — users 0 … 1M</text>
    <text class="sm" x="490" y="135" text-anchor="middle">shard 1 — users 1M … 2M</text>
    <text class="sm" x="490" y="177" text-anchor="middle">shard 2 — users 2M … 3M</text>
    <text class="sm" x="150" y="218" text-anchor="middle">same rows, fewer columns each</text>
    <text class="sm" x="490" y="218" text-anchor="middle">same columns, fewer rows each</text>
  </svg>
  <figcaption>Vertical partitioning shrinks the row so more rows fit in a cache line and in RAM; horizontal partitioning is the only one that removes the single-machine ceiling.</figcaption>
</figure>
<p>
  <b>Vertical partitioning</b> splits a table by column — move the 40 KB
  <code>bio_text</code> and the blob out to a separate store so the hot
  60-byte row stays cache-resident. It is cheap, reversible, and often
  worth a 3–5× improvement in rows-per-page. Taken to its extreme across
  services it becomes "each service owns its own database", which is the
  microservices decomposition, not a scaling technique. It never removes
  the write ceiling, because the hot table still lives on one machine.
</p>
<p>
  <b>Horizontal partitioning (sharding)</b> splits by row. Every shard has
  the identical schema and a disjoint subset of rows. This is the one that
  scales writes, and everything difficult in this chapter follows from it.
</p>

<h3>Shard key selection: the decision you cannot take back</h3>
<p>
  The shard key determines which shard a row lives on. It is embedded in
  your routing layer, your access patterns, your operational tooling, and —
  because most systems put it in the primary key — often in the IDs your
  customers have already saved in bookmarks and integrations. Changing it
  means physically moving every row while the system stays online. Plan for
  weeks, and treat this as the single highest-stakes call in the design.
</p>
<table>
  <tr><th>Property the key must have</th><th>Why</th></tr>
  <tr><td><b>High cardinality</b></td><td>You can never have more shards than distinct key values. Sharding by <code>country</code> caps you at ~200 shards and half your traffic is in three of them.</td></tr>
  <tr><td><b>Even access distribution</b></td><td>Even <em>data</em> distribution is not enough — a shard holding 1/8 of the rows but 60% of the QPS is still a hot shard.</td></tr>
  <tr><td><b>Immutable</b></td><td>If the key can change, a row must be deleted from one shard and inserted into another: not atomic, breaks foreign keys, and invalidates any ID derived from it.</td></tr>
  <tr><td><b>Present in the majority of queries</b></td><td>A query without the shard key must be broadcast to every shard. If 90% of your reads lack the key, you have built a distributed full scan.</td></tr>
  <tr><td><b>Aligned with your transaction boundary</b></td><td>If the rows that must change atomically share a shard key, transactions stay single-shard and you never need two-phase commit.</td></tr>
</table>
<table>
  <tr><th>Key</th><th>Verdict</th><th>Why</th></tr>
  <tr><td><code>user_id</code> for a social/consumer app</td><td>Good</td><td>High cardinality, immutable, and nearly every read is "everything for this user" — timeline, settings, orders. Transactions naturally stay local.</td></tr>
  <tr><td><code>tenant_id</code> for B2B SaaS</td><td>Good</td><td>Every query already filters by tenant; it gives you free per-customer isolation, per-customer backup/restore, and the ability to move a whale onto its own hardware.</td></tr>
  <tr><td><code>conversation_id</code> for chat</td><td>Good</td><td>The unit of read is a conversation. Sharding by <code>user_id</code> instead would put the two sides of a DM on different shards and make every message a cross-shard write.</td></tr>
  <tr><td>hash of <code>(device_id, day)</code> for telemetry</td><td>Good</td><td>Spreads writes, keeps a device's day contiguous for the common query, and lets you drop whole days by dropping partitions.</td></tr>
  <tr><td>Auto-increment <code>id</code> or <code>created_at</code>, range-partitioned</td><td><b>Catastrophic</b></td><td>Every insert goes to the newest shard forever. You have N shards and one of them is doing 100% of the writes. This is the single most common sharding mistake.</td></tr>
  <tr><td><code>status</code>, <code>country</code>, <code>is_active</code></td><td><b>Catastrophic</b></td><td>Low cardinality and Zipfian distribution. Hard ceiling on shard count and guaranteed skew.</td></tr>
  <tr><td>A mutable attribute (<code>current_plan</code>, <code>region</code>)</td><td><b>Catastrophic</b></td><td>An upgrade from free to pro physically relocates the row. Non-atomic, and every cached reference to its location is now wrong.</td></tr>
  <tr><td><code>user_id</code> when 90% of reads are by <code>order_id</code></td><td><b>Catastrophic</b></td><td>The key is correct in isolation and wrong for the workload: nearly every read becomes a scatter-gather. Always check the key against the <em>read</em> patterns, not just the write ones.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Do not pick the key before you have listed the queries</span>
  Candidates announce "I'll shard by user ID" thirty seconds into the
  design. Write the top five queries by volume on the board <em>first</em>,
  then pick the key that keeps the most of them single-shard, then name
  explicitly which queries you have just made expensive. That sequence is
  the entire signal.
</div>

<h3>Range vs hash vs directory</h3>
<table>
  <tr><th>Strategy</th><th>How it routes</th><th>Wins</th><th>Loses</th><th>Reach for it when…</th></tr>
  <tr><td><b>Range</b></td><td>Sorted key space cut into contiguous intervals; a metadata service maps interval → shard.</td><td>Range scans and ordered pagination are one shard. Splits are cheap — cut a hot range in half.</td><td>Sequential keys create a permanent hotspot on the newest range.</td><td>You need ordered scans: time-series reads, "next 50 rows after X". HBase, Bigtable, Spanner, CockroachDB, MongoDB ranged sharding.</td></tr>
  <tr><td><b>Hash</b></td><td><code>shard = hash(key) mod N</code>, or a token on a consistent-hashing ring.</td><td>Near-perfect distribution with no thought. Routing is a pure function — no lookup hop.</td><td>Range scans are dead (adjacent keys are on different shards). Naive <code>mod N</code> makes resizing catastrophic.</td><td>Point lookups dominate and you want zero routing state. Cassandra (Murmur3 token), DynamoDB partition key, Vitess hash vindex.</td></tr>
  <tr><td><b>Directory / lookup</b></td><td>An explicit key → shard map held in a coordination service, cached at the client.</td><td>Total control: move one noisy tenant to dedicated hardware with a single row update. Heterogeneous shard sizes are fine.</td><td>An extra hop, and the directory becomes a critical HA dependency. A stale cached map routes writes to the wrong shard — you need versioning and a redirect.</td><td>B2B SaaS with wildly uneven tenants, or any time "give this customer its own database" is a product requirement. Vitess-style keyspaces, and how most large multi-tenant apps actually work.</td></tr>
</table>
<p class="sub">
  These compose. Cassandra hashes the partition key onto a ring and then
  <em>range</em>-orders rows inside the partition by clustering key —
  which is exactly why "hash of device, range on time" is the canonical
  time-series schema. DynamoDB is the same idea with different words:
  partition key hashes, sort key ranges.
</p>

<h3>Consistent hashing, and why virtual nodes are the real trick</h3>
<p>
  The problem with <code>hash(key) mod N</code> is resizing. Go from 10
  shards to 11 and about 90% of keys change owner — every cache is cold,
  every row moves, and you cannot do it online. Consistent hashing fixes
  this by hashing both keys and nodes onto the same circular space
  (typically 2<sup>64</sup> or 2<sup>32</sup> points). A key belongs to the
  first node found by walking clockwise. Adding an (N+1)th node moves only
  about 1/(N+1) of the keys — and only from its immediate successor.
</p>
<figure>
  <svg viewBox="0 0 640 320" class="dg" role="img" aria-label="A consistent hashing ring with twelve virtual nodes belonging to three physical nodes A, B and C interleaved around the circle, showing a key hashing to a point on the ring and walking clockwise to the next virtual node">
    <g class="rough">
      <path class="ln dash" d="M200,60 A100,100 0 1,1 199,60.01" />
      <path class="lnr" d="M296,134 A100,100 0 0,1 300,160" />
      <path class="lnr dash" d="M330,120 L302,131" />
    </g>
    <g class="rough">
      <circle class="box"  cx="200" cy="60"  r="16" />
      <circle class="boxy" cx="250" cy="73"  r="16" />
      <circle class="boxg" cx="287" cy="110" r="16" />
      <circle class="box"  cx="300" cy="160" r="16" />
      <circle class="boxy" cx="287" cy="210" r="16" />
      <circle class="boxg" cx="250" cy="247" r="16" />
      <circle class="box"  cx="200" cy="260" r="16" />
      <circle class="boxy" cx="150" cy="247" r="16" />
      <circle class="boxg" cx="113" cy="210" r="16" />
      <circle class="box"  cx="100" cy="160" r="16" />
      <circle class="boxy" cx="113" cy="110" r="16" />
      <circle class="boxg" cx="150" cy="73"  r="16" />
    </g>
    <text class="sm" x="200" y="65"  text-anchor="middle">A1</text>
    <text class="sm" x="250" y="78"  text-anchor="middle">B1</text>
    <text class="sm" x="287" y="115" text-anchor="middle">C1</text>
    <text class="sm" x="300" y="165" text-anchor="middle">A2</text>
    <text class="sm" x="287" y="215" text-anchor="middle">B2</text>
    <text class="sm" x="250" y="252" text-anchor="middle">C2</text>
    <text class="sm" x="200" y="265" text-anchor="middle">A3</text>
    <text class="sm" x="150" y="252" text-anchor="middle">B3</text>
    <text class="sm" x="113" y="215" text-anchor="middle">C3</text>
    <text class="sm" x="100" y="165" text-anchor="middle">A4</text>
    <text class="sm" x="113" y="115" text-anchor="middle">B4</text>
    <text class="sm" x="150" y="78"  text-anchor="middle">C4</text>
    <text class="sm rd" x="336" y="115">key k lands here</text>
    <text class="lbl" x="400" y="70">3 physical nodes: A, B, C</text>
    <text class="sm"  x="400" y="94">each owns 4 virtual nodes,</text>
    <text class="sm"  x="400" y="112">interleaved around the ring</text>
    <text class="sm rd" x="400" y="146">a key walks clockwise to the</text>
    <text class="sm rd" x="400" y="164">next vnode — here, A2 → node A</text>
    <text class="sm gr" x="400" y="200">remove B and only B&#39;s four arcs</text>
    <text class="sm gr" x="400" y="218">move — split between A and C,</text>
    <text class="sm gr" x="400" y="236">refilled from both in parallel</text>
    <text class="sm" x="400" y="272">without vnodes, B&#39;s entire range</text>
    <text class="sm" x="400" y="290">would land on one unlucky neighbour</text>
  </svg>
  <figcaption>Virtual nodes are what make removal survivable: the departing node's load is spread over every survivor instead of doubling one neighbour.</figcaption>
</figure>
<p>
  Plain consistent hashing with one point per node has two flaws. Random
  placement of 10 points on a circle gives wildly uneven arcs — shard sizes
  routinely vary by 2–3×. And when a node dies, its <em>entire</em> range
  falls on its single clockwise successor, which promptly gets double load
  and often dies too. Virtual nodes fix both: give each physical node V
  positions on the ring (Dynamo used ~100–200; Cassandra's
  <code>num_tokens</code> defaulted to 256 historically and 16 in modern
  versions with the token allocation algorithm). Load variance shrinks
  roughly as 1/√V, and a departing node's data is refilled from every
  survivor in parallel. As a bonus, a machine with twice the RAM simply
  gets twice the vnodes.
</p>
<pre><code><span class="c">// Ring = sorted array of {token, node}. Lookup is a binary search, ~50ns.</span>
function buildRing(nodes, vnodesPerNode) {
  const ring = [];
  for (const node of nodes) {
    for (let v = 0; v &lt; vnodesPerNode; v++) {
      ring.push({ token: hash64(node.id + "#" + v), node }); <span class="c">// deterministic vnode positions</span>
    }
  }
  return ring.sort((a, b) =&gt; (a.token &lt; b.token ? -1 : 1));
}

function lookup(ring, key) {
  const h = hash64(key);
  let lo = 0, hi = ring.length - 1;
  while (lo &lt; hi) {                       <span class="c">// first token &gt;= h</span>
    const mid = (lo + hi) &gt;&gt; 1;
    if (ring[mid].token &lt; h) lo = mid + 1; else hi = mid;
  }
  return ring[ring[lo].token &lt; h ? 0 : lo].node; <span class="c">// wrap past the end of the ring</span>
}</code></pre>
<p class="sub">
  For replication factor 3, you do not take the next three vnodes — you
  walk clockwise until you have three <em>distinct physical nodes</em>, and
  ideally three distinct racks or AZs. Forgetting that is how people end up
  with all three replicas of a key on one machine.
</p>

<h3>Hot shards and the celebrity problem</h3>
<p>
  Real access distributions are Zipfian: the top 0.1% of keys often carry
  40–60% of the traffic. Hashing gives you an even spread of <em>keys</em>,
  not of <em>requests</em>. One artist with 80 million followers, one
  enterprise tenant with 200× the average volume, or one viral post will
  saturate a single shard while the other 63 idle — and you cannot fix it
  by adding shards, because the unit of load is a single key.
</p>
<table>
  <tr><th>Mitigation</th><th>Mechanism</th><th>Cost</th></tr>
  <tr><td><b>Cache the hot key</b></td><td>By definition a hot key has a ~99% hit rate. Put it in Redis or even in-process, and add request coalescing so a miss doesn't stampede.</td><td>Staleness, and a cold-cache event now hits the hot shard even harder. Do this first anyway — it is the cheapest 10×.</td></tr>
  <tr><td><b>Key salting</b></td><td>Write to <code>celeb:42#0 … celeb:42#31</code> and read by fanning out to all 32. Spreads one logical key over 32 shards.</td><td>Every read becomes 32 reads. Only apply it to keys detected as hot at runtime, never uniformly — otherwise you have made the average case 32× worse to fix the p99.9.</td></tr>
  <tr><td><b>Dedicated shard</b></td><td>Directory partitioning moves the whale onto its own hardware with one map update.</td><td>Operational sprawl and a manual placement decision — but it is what large B2B SaaS actually does, and it is why the directory strategy earns its extra hop.</td></tr>
  <tr><td><b>Change the data model</b></td><td>The celebrity's followers stop being a fan-out-on-write problem: push to normal users, and let followers of the celebrity pull her posts at read time and merge.</td><td>A hybrid read path. This is the well-known Twitter timeline answer and it is a modelling fix, not an infrastructure fix — usually the strongest one available.</td></tr>
  <tr><td><b>Managed adaptive capacity</b></td><td>DynamoDB will isolate and split a hot partition automatically.</td><td>Still bounded by hard per-partition limits (about 3,000 read and 1,000 write units per second). A single key that exceeds this cannot be saved by the platform.</td></tr>
</table>

<h3>What sharding costs you</h3>
<table>
  <tr><th>What you lose</th><th>What you do instead</th></tr>
  <tr><td><b>Cross-shard joins</b></td><td>Application-side joins (fetch IDs, then batch-fetch by shard — never row by row, or you have built an N+1 over the network), or denormalize the joined columns into the child row and accept the update cost.</td></tr>
  <tr><td><b>Cross-shard transactions</b></td><td>Two-phase commit works but adds a coordinator, blocks if the coordinator dies mid-commit, and typically multiplies write latency by 3–10×. The alternatives are sagas with explicit compensating actions, or — far better — choosing a shard key that keeps transactions single-shard in the first place.</td></tr>
  <tr><td><b>Global unique constraints</b></td><td>The database can only enforce uniqueness within a shard. Use UUIDs/Snowflake IDs so uniqueness is probabilistic-by-construction, or keep a small dedicated uniqueness table (email → user_id) that is itself sharded by the constrained column.</td></tr>
  <tr><td><b>Cheap secondary indexes</b></td><td><b>Local index:</b> lives on each shard, cheap to write, but a lookup by that column must scatter-gather across all shards. <b>Global index:</b> a separate table sharded by the indexed column — one hop to read, but writing it is a cross-shard write, which is why it is maintained asynchronously and why DynamoDB's Global Secondary Indexes are eventually consistent.</td></tr>
  <tr><td><b>Cheap <code>ORDER BY</code> / <code>LIMIT</code> / <code>COUNT</code></b></td><td>Top-K across shards needs each shard to return its own top K and the router to merge. Deep offset pagination is pathological — use keyset ("seek") pagination on a sortable cursor instead.</td></tr>
</table>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A query router fanning a single read out to four shards, with one slow shard shown in red, illustrating that the overall latency equals the slowest shard's latency">
    <g class="rough">
      <path class="ln" d="M110,110 L160,110" />
      <path class="ln"  d="M260,100 L300,42" />
      <path class="ln"  d="M260,106 L300,90" />
      <path class="lnr" d="M260,116 L300,140" />
      <path class="ln"  d="M260,122 L300,190" />
    </g>
    <g class="rough">
      <rect class="box"  x="20"  y="88"  width="90"  height="44" rx="6" />
      <rect class="boxy" x="160" y="88"  width="100" height="44" rx="6" />
      <rect class="box"  x="300" y="24"  width="100" height="36" rx="6" />
      <rect class="box"  x="300" y="72"  width="100" height="36" rx="6" />
      <rect class="boxr" x="300" y="120" width="100" height="36" rx="6" />
      <rect class="box"  x="300" y="168" width="100" height="36" rx="6" />
    </g>
    <text class="lbl" x="65"  y="116" text-anchor="middle">client</text>
    <text class="lbl" x="210" y="116" text-anchor="middle">router</text>
    <text class="sm" x="350" y="46"  text-anchor="middle">shard 0 — 8 ms</text>
    <text class="sm" x="350" y="94"  text-anchor="middle">shard 1 — 11 ms</text>
    <text class="sm rd" x="350" y="142" text-anchor="middle">shard 2 — 240 ms</text>
    <text class="sm" x="350" y="190" text-anchor="middle">shard 3 — 9 ms</text>
    <text class="lbl rd" x="420" y="100">answer arrives at 240 ms</text>
    <text class="sm" x="420" y="126">with 100 shards each 1% likely</text>
    <text class="sm" x="420" y="144">to be slow, ~63% of queries</text>
    <text class="sm" x="420" y="162">hit at least one straggler</text>
    <text class="sm gr" x="420" y="192">fix: hedged requests after p95</text>
  </svg>
  <figcaption>Tail latency amplification: a fan-out read inherits the worst p99 in the fleet, so scatter-gather designs need hedging, per-shard deadlines, or a data model that avoids the fan-out.</figcaption>
</figure>

<h3>Re-sharding a live system</h3>
<p>
  Everything above is why the shard key is irreversible in practice — but
  "irreversible" means expensive, not impossible, and being able to walk
  the migration is a strong staff-level signal.
</p>
<ul>
  <li><b>1. Stand up the new topology</b> alongside the old. Nothing reads from it.</li>
  <li><b>2. Backfill</b> historical rows in throttled chunks, watching replication lag and IO on the source. For a multi-TB table this runs for days; make it resumable and idempotent.</li>
  <li><b>3. Dual-write</b> every mutation to both topologies, with the old one remaining the source of truth. Failures writing to the new side are logged, not fatal.</li>
  <li><b>4. Shadow-read and diff:</b> serve from old, also read from new, compare, emit a mismatch counter. You want a full day at zero mismatches before proceeding. This step is the one people skip and the one that catches the bugs.</li>
  <li><b>5. Flip reads gradually</b> — 1% of tenants, then 10%, then 50% — with an instant rollback that requires no deploy.</li>
  <li><b>6. Flip the source of truth</b>, keep dual-writing for a week as your undo button, then stop and drop the old topology.</li>
</ul>
<div class="sticky mint">
  <span class="ttl">Design so you never have to do that again</span>
  Choose a large fixed number of <b>logical</b> shards up front — 1,024 or
  4,096 — and map many logical shards onto each physical machine. Growing
  the cluster then means <em>moving whole logical shards</em>, never
  rehashing a single key: the shard key and the routing function never
  change, only the placement map does. Vitess, Slack, Notion and most
  well-run sharded fleets are built exactly this way, and it converts the
  irreversible decision above into a routine capacity operation.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll shard by tenant ID into
  4,096 logical shards placed on 16 physical Postgres hosts, with a
  directory in etcd mapping logical shard to host. Tenant ID is in
  essentially every query, so reads and transactions stay single-shard, and
  when a tenant outgrows shared hardware I move its logical shards to
  dedicated hosts by updating one row in the directory — no rehashing, no
  ID changes."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The numbers force it: estimate data volume and write throughput out loud. "500M users × 2 KB = 1 TB, at 50k writes/sec" is the sentence that justifies sharding without you having to assert it.</li>
  <li>A naive design says "we'll add read replicas". Replicas never scale writes — if the prompt's bottleneck is write throughput or dataset size, replicas are the wrong tool and saying why earns the point.</li>
  <li>The prompt mentions a skewed population — celebrities, whale tenants, viral content, one huge customer. That is a hot-shard question wearing a costume; go straight to caching, salting, or dedicated placement.</li>
  <li>Distinguish from replication: replication makes copies of the same data for availability and read scale; partitioning splits different data for write scale and capacity. Real systems do both, and every shard is itself a replica set.</li>
  <li>The moment you name a shard key, immediately name the query it breaks and how you'll serve that query anyway (global index, denormalized copy, or search engine). Volunteering the downside is the difference between L5 and L6.</li>
  <li>Never propose <code>hash(key) mod N</code> without saying what happens when N changes — consistent hashing with vnodes, or fixed logical shards, are the two acceptable answers.</li>
</ul>`,
    },
    {
      id: "sysdes-distributed-consensus",
      num: "A3",
      title: "Distributed consensus (surface)",
      short: "Distributed consensus",
      levels: ["advanced"],
      practice: [],
      ready: true,
      subtitle:
        "Getting a group of unreliable machines to agree on one value — and why your job is to use a consensus system correctly, not to write one.",
      body: `<h3>What consensus buys, and where you actually need it</h3>
<p>
  Consensus is the problem of getting a set of nodes to agree on a single
  value, such that once a value is decided, every node that ever learns a
  decision learns the same one — even though nodes crash and restart, and
  messages are delayed, reordered, duplicated, or lost. It sounds abstract
  until you notice how many concrete production problems are secretly the
  same problem.
</p>
<table>
  <tr><th>Problem</th><th>The value being agreed on</th></tr>
  <tr><td><b>Leader election</b></td><td>"Which node is the primary for term 7?" Every replication scheme with a single writer needs this, and needs it to be unambiguous.</td></tr>
  <tr><td><b>Cluster membership and config</b></td><td>"Which nodes are in the cluster, and what is the current shard map?" A split view of membership is how you get two nodes both believing they own shard 12.</td></tr>
  <tr><td><b>Distributed locks / leases</b></td><td>"Who holds the right to run the nightly billing job?" Running it twice is a customer-visible incident.</td></tr>
  <tr><td><b>Atomic commit across shards</b></td><td>"Did transaction T commit or abort?" All participants must reach the same answer.</td></tr>
  <tr><td><b>Exactly-once semantics</b></td><td>"Has message 91,442 been processed?" Exactly-once delivery is impossible; exactly-once <em>effect</em> is achievable by agreeing on a durable sequence and deduplicating against it.</td></tr>
</table>
<p>
  Equally important is the list of things that do <em>not</em> need
  consensus, because reaching for it unnecessarily is its own mistake:
  ordinary application data (use replication with quorums), counters and
  metrics (use CRDTs or just accept approximation), caches, and anything
  where "two nodes did the work" is merely wasteful rather than wrong.
  Consensus costs a majority round trip on every decision — you pay it only
  where correctness demands it.
</p>

<h3>The problem, stated honestly</h3>
<p>
  What makes this hard is that in an asynchronous network you cannot
  distinguish <b>a crashed node</b> from <b>a slow node</b> from <b>a node
  you can't currently reach</b>. All three look identical: silence. The FLP
  result formalises this — with even one possible crash and no timing
  assumptions, no deterministic protocol can guarantee termination. Real
  systems escape it by adding a timing assumption in the form of timeouts,
  which makes progress <em>probabilistic</em> while keeping safety
  <em>absolute</em>. That split is the key idea to hold onto:
</p>
<ul>
  <li><b>Safety</b> — never two different decisions, never a lost committed entry — holds unconditionally, even during arbitrary partitions and crashes.</li>
  <li><b>Liveness</b> — actually deciding something — holds only when a majority can talk to each other for long enough. During a bad partition, a consensus system stops making progress. That is not a bug; it is the CP choice being exercised.</li>
</ul>

<h3>Raft: terms, elections, and why randomization matters</h3>
<p>
  Raft was explicitly designed to be understandable, which is why it is the
  one to explain out loud. It decomposes consensus into leader election,
  log replication, and safety.
</p>
<p>
  Time is divided into <b>terms</b>: monotonically increasing integers that
  act as a logical clock. Each term has at most one leader. Every message
  carries a term; a node seeing a higher term immediately steps down to
  follower and adopts it, and a node seeing a lower term rejects the
  message. That single rule retires stale leaders automatically.
</p>
<p>
  A follower that hears no heartbeat within its <b>election timeout</b>
  becomes a candidate: it increments the term, votes for itself, and asks
  everyone for a vote. A node grants at most one vote per term, and only to
  a candidate whose log is at least as up to date as its own. Win a
  majority and you are leader; the first thing a leader does is send
  heartbeats to suppress further elections.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Five nodes in a row during a Raft election, where node one collects two votes plus its own to reach a majority of three and becomes leader, while node five collects only one vote plus its own and cannot win">
    <g class="rough">
      <path class="lng" d="M186,152 L96,152" />
      <path class="lng" d="M304,152 Q200,88 96,146" />
      <path class="ln"  d="M462,152 Q506,112 544,150" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="80"  cy="170" r="26" />
      <circle class="box"  cx="200" cy="170" r="26" />
      <circle class="box"  cx="320" cy="170" r="26" />
      <circle class="box"  cx="440" cy="170" r="26" />
      <circle class="boxy" cx="560" cy="170" r="26" />
    </g>
    <text class="lbl" x="80"  y="176" text-anchor="middle">n1</text>
    <text class="lbl" x="200" y="176" text-anchor="middle">n2</text>
    <text class="lbl" x="320" y="176" text-anchor="middle">n3</text>
    <text class="lbl" x="440" y="176" text-anchor="middle">n4</text>
    <text class="lbl" x="560" y="176" text-anchor="middle">n5</text>
    <text class="sm" x="20" y="28">both n1 and n5 time out and become candidates in term 5</text>
    <text class="sm" x="20" y="48">a node grants at most one vote per term — so two majorities cannot both form</text>
    <text class="sm gr" x="80"  y="214" text-anchor="middle">candidate</text>
    <text class="sm gr" x="80"  y="232" text-anchor="middle">3 of 5 → LEADER</text>
    <text class="sm" x="200" y="214" text-anchor="middle">voted n1</text>
    <text class="sm" x="320" y="214" text-anchor="middle">voted n1</text>
    <text class="sm" x="440" y="214" text-anchor="middle">voted n5</text>
    <text class="sm rd" x="560" y="214" text-anchor="middle">candidate</text>
    <text class="sm rd" x="560" y="232" text-anchor="middle">2 of 5 → stalls</text>
  </svg>
  <figcaption>The whole guarantee is set overlap: any two subsets of five nodes with three members each must share a node, and that shared node only voted once.</figcaption>
</figure>
<p>
  <b>Why a majority guarantees at most one leader:</b> two majorities of the
  same cluster must intersect in at least one node, and that node casts at
  most one vote per term. So two candidates cannot both reach a majority in
  the same term, and higher terms retire lower ones. This is the sentence
  to be able to say verbatim.
</p>
<p>
  <b>Why the timeout is randomized:</b> if every follower used the same
  election timeout, they would all time out together, all become
  candidates, all split the vote, and all time out again — livelock.
  Randomizing each node's timeout over a range (the Raft paper suggests
  150–300 ms; etcd defaults to 1000 ms with 100 ms heartbeats) means one
  node almost always wakes first and wins before the others start.
  Randomization is not a tuning detail; it is the liveness mechanism.
</p>

<h3>Log replication and the commit rule</h3>
<p>
  Every state change is an entry appended to a replicated log. Clients send
  commands to the leader; the leader appends locally, then sends
  <code>AppendEntries</code> to followers. An entry is <b>committed</b> once
  it is durably stored on a majority — at which point the leader applies it
  to its state machine, returns to the client, and tells followers the new
  commit index on the next heartbeat. Because every replica applies the same
  entries in the same order, every replica ends in the same state. That is
  the <em>replicated state machine</em> pattern, and it is what a consensus
  system really sells you.
</p>
<table>
  <tr><th>Raft property</th><th>What it prevents</th></tr>
  <tr><td><b>Log matching:</b> <code>AppendEntries</code> carries the index and term of the preceding entry; a follower rejects it if that doesn't match, and the leader walks backwards until it finds agreement, then overwrites the divergent tail.</td><td>Divergent histories silently persisting on a follower.</td></tr>
  <tr><td><b>Election restriction:</b> a voter refuses any candidate whose last log entry is older (lower term, or same term but shorter) than its own.</td><td>Electing a leader that is missing a committed entry — which would erase it.</td></tr>
  <tr><td><b>Leader-term commit rule:</b> a leader may only mark an entry committed by counting replicas if that entry is <em>from its own term</em>. Entries from previous terms become committed indirectly, once a current-term entry above them commits.</td><td>The subtle Figure-8 scenario where an entry replicated to a majority is still later overwritten. Naming this rule is a genuine expert signal.</td></tr>
  <tr><td><b>Persist before responding:</b> <code>currentTerm</code>, <code>votedFor</code>, and the log must be fsynced before any reply.</td><td>A node that crashes and restarts voting twice in the same term — which elects two leaders and destroys safety.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Reads are not automatically safe</span>
  A leader that has been silently partitioned away still <em>believes</em>
  it is leader until its next failed heartbeat round. If it answers reads
  from local state in that window, it serves stale data — a real
  linearizability violation. Real systems fix this with a read-index (confirm
  leadership with a heartbeat round before answering) or a leader lease
  (answer locally, but only within a lease shorter than the election
  timeout). This is also exactly why ZooKeeper reads are not linearizable
  unless you call <code>sync()</code> first.
</div>

<h3>Cluster sizing — always odd, almost always 3 or 5</h3>
<table>
  <tr><th>Nodes</th><th>Majority</th><th>Failures tolerated</th><th>Comment</th></tr>
  <tr><td>3</td><td>2</td><td>1</td><td>The default. Survives one node or one AZ.</td></tr>
  <tr><td>4</td><td>3</td><td>1</td><td><b>Strictly worse than 3</b> — same fault tolerance, more nodes to ack every write. Never do this.</td></tr>
  <tr><td>5</td><td>3</td><td>2</td><td>The right answer for anything critical: survives a node failure <em>during</em> a maintenance window.</td></tr>
  <tr><td>7</td><td>4</td><td>3</td><td>Rarely worth it. Every write waits for the 4th-fastest node, so latency gets worse as you add members.</td></tr>
</table>
<p class="sub">
  Consensus clusters do not scale by adding members — throughput drops as
  they grow, because every decision needs a majority ack. You scale them by
  <em>sharding the keyspace across many independent consensus groups</em>,
  which is exactly what Spanner (one Paxos group per range) and CockroachDB
  (one Raft group per range) do. Expect single-digit-millisecond writes for
  a same-region etcd cluster, and tens of milliseconds if you stretch the
  members across regions.
</p>

<h3>Paxos, briefly</h3>
<p>
  Paxos is the original (Lamport, 1989/1998) and is still the substrate for
  Chubby and Spanner. Single-decree Paxos agrees on one value with prepare
  and accept phases; Multi-Paxos amortises the prepare phase by keeping a
  stable leader — at which point it looks very much like Raft. It is
  notoriously hard to specify completely enough to implement, which is
  precisely the gap Raft was written to fill. In an interview: mention it as
  "the older, harder one that Raft was designed to replace as the teachable
  protocol", note that Multi-Paxos and Raft are equivalent in power, and
  move on. Do not attempt to derive Paxos at a whiteboard.
</p>

<h3>In practice: coordination services, split brain, and fencing</h3>
<p>
  You almost never talk to Raft directly. You talk to a coordination
  service that has already solved it and exposes a small, safe API.
</p>
<table>
  <tr><th>Service</th><th>Protocol</th><th>Shape of the API</th><th>Reach for it when…</th></tr>
  <tr><td><b>etcd</b></td><td>Raft</td><td>Key-value with revisions, leases, compare-and-swap, watches. Every write returns a monotonically increasing revision.</td><td>Kubernetes-adjacent infrastructure, service discovery, leader election, config. The default modern choice.</td></tr>
  <tr><td><b>ZooKeeper</b></td><td>Zab</td><td>Hierarchical znodes, ephemeral and sequential nodes, watches. Ephemeral+sequential is the classic leader-election recipe.</td><td>The JVM ecosystem — Kafka (historically), HBase, Solr. Battle-tested for well over a decade.</td></tr>
  <tr><td><b>Consul</b></td><td>Raft</td><td>KV, sessions, health checks, service catalogue, DNS interface.</td><td>Service discovery where health checking and multi-datacenter federation matter as much as the KV store.</td></tr>
  <tr><td><b>Your database</b></td><td>varies</td><td>A row with a unique constraint plus a lease column is a perfectly good lock if you already have a strongly consistent database.</td><td>You don't want another stateful system to operate. Often the correct, boring answer.</td></tr>
</table>
<p>
  <b>Split brain</b> is what happens when two nodes simultaneously believe
  they are the leader. Majority quorum prevents two leaders from both
  <em>committing</em>, but it does <b>not</b> prevent an old leader from
  <em>thinking</em> it is leader and acting on external systems that have no
  idea a quorum exists. The lock service is consistent; your S3 bucket, your
  payment gateway, and your file system are not participants in the
  protocol.
</p>
<p>
  The fix is a <b>fencing token</b>: the lock service hands out a
  monotonically increasing number with every grant, and every write to the
  protected resource carries it. The resource remembers the highest token it
  has seen and rejects anything lower. This moves the arbitration to the
  resource, which is the only place it can be correct.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="A sequence diagram in which client A acquires a lock with token 33 then stalls, the lease expires, client B acquires token 34 and writes successfully, and client A's later write with token 33 is rejected by the storage layer">
    <g class="rough">
      <path class="ln dash" d="M80,58 L80,286" />
      <path class="ln dash" d="M250,58 L250,286" />
      <path class="ln dash" d="M420,58 L420,286" />
      <path class="ln dash" d="M570,58 L570,286" />
      <path class="ln"  d="M80,84 L418,84" />
      <path class="ln"  d="M250,158 L418,158" />
      <path class="lng" d="M250,192 L568,192" />
      <path class="lnr" d="M80,252 L568,252" />
    </g>
    <g class="rough">
      <rect class="box"  x="25"  y="20" width="110" height="38" rx="6" />
      <rect class="box"  x="195" y="20" width="110" height="38" rx="6" />
      <rect class="boxy" x="365" y="20" width="110" height="38" rx="6" />
      <rect class="boxg" x="515" y="20" width="110" height="38" rx="6" />
    </g>
    <text class="lbl" x="80"  y="45" text-anchor="middle">client A</text>
    <text class="lbl" x="250" y="45" text-anchor="middle">client B</text>
    <text class="lbl" x="420" y="45" text-anchor="middle">lock service</text>
    <text class="lbl" x="570" y="45" text-anchor="middle">storage</text>
    <text class="sm" x="90"  y="78">acquire → token 33</text>
    <text class="sm rd" x="90" y="116">A stalls: 30 s GC pause / VM migration</text>
    <text class="sm rd" x="430" y="140">lease expires</text>
    <text class="sm" x="258" y="152">acquire → token 34</text>
    <text class="sm gr" x="258" y="186">write(token 34) — accepted</text>
    <text class="sm gr" x="430" y="222">storage records highest token = 34</text>
    <text class="sm rd" x="90"  y="246">A wakes, write(token 33) — REJECTED, 33 &lt; 34</text>
    <text class="sm" x="20" y="282">without the token, A&#39;s stale write silently overwrites B&#39;s work and nothing logs an error</text>
  </svg>
  <figcaption>The lock never actually prevented the race — the resource did. Any lock without a fencing token is only advisory.</figcaption>
</figure>
<p class="sub">
  You usually get the token for free: ZooKeeper's <code>zxid</code> and
  sequential znode number, etcd's revision or lease ID, or a
  <code>version</code> column you compare-and-swap on in your own database.
  This is also the honest answer to the long-running argument about
  Redis-based distributed locks: a multi-node Redis lock relies on bounded
  clock drift and bounded process pauses, and neither is guaranteed — so if
  you propose one, be ready to say what happens during a 30-second GC pause,
  and carry a fencing token so the answer is "nothing bad".
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll use an etcd lease for
  the leader lock, but I won't trust the lock on its own — the leader
  attaches the etcd revision as a fencing token to every write, and the
  storage layer rejects any write whose token is lower than the highest it
  has seen. That way a leader that was partitioned away and doesn't know it
  yet can't corrupt anything when it comes back."
</div>

<h3>Why you should almost never implement consensus yourself</h3>
<p>
  The happy path of Raft is a weekend project. The parts that take years are
  the ones that only show up under failure:
</p>
<ul>
  <li><b>Persistence correctness.</b> <code>currentTerm</code> and <code>votedFor</code> must be fsynced before you reply, or a crash-restart lets a node vote twice in one term and you elect two leaders. This bug is invisible in testing and unrecoverable in production.</li>
  <li><b>Membership changes.</b> Adding or removing a node while the cluster is live requires joint consensus or strict single-node changes; get it wrong and you create two disjoint majorities.</li>
  <li><b>Log compaction and snapshots.</b> Logs grow forever otherwise, and installing a snapshot on a lagging follower is a whole second protocol.</li>
  <li><b>The read path.</b> As above — the naive implementation quietly serves stale reads.</li>
  <li><b>Verification.</b> Production implementations are TLA+-specified and tested with deterministic fault injection (Jepsen, FoundationDB-style simulation). Consensus bugs are silent, and they lose committed data.</li>
</ul>
<p>
  The correct engineering answer is: use etcd, ZooKeeper, or Consul; or use a
  database that already embeds a verified implementation (Spanner,
  CockroachDB, YugabyteDB, TiDB, Kafka's KRaft). Better still, design so you
  need consensus in as few places as possible — one small, well-understood
  coordination layer that everything else defers to.
</p>
<div class="warn">
  <span class="ttl">⚠ The consensus-shaped answer that isn't</span>
  "I'll have the nodes vote among themselves" and "I'll use a heartbeat and
  whoever stops responding gets replaced" both describe a system with no
  quorum requirement — that is a split-brain generator, not consensus. If
  you cannot say which set of nodes must agree and why two such sets must
  overlap, you have not described a consensus protocol.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt says "exactly one", "only one node should", "elect", "must not run twice", or "who owns this partition" — those are all leader election in disguise.</li>
  <li>Any design with a single writer, a primary, or a coordinator has an implicit consensus dependency: ask yourself who decides who the primary is, and what happens if two nodes disagree.</li>
  <li>A naive design says "we'll use a lock in Redis." The follow-up is always the pause scenario. Have the fencing token ready before it's asked — it converts a shaky answer into a senior one.</li>
  <li>Distinguish from quorum replication: quorums give you consistency for a <em>single key</em>; consensus gives you an agreed <em>ordered log</em>, which is what you need for leadership, membership, and atomic commit.</li>
  <li>Distinguish from CAP: consensus systems are the CP corner made concrete — during a partition the minority stops. If the prompt cannot tolerate stopping, you need to move that data out of the consensus path entirely.</li>
  <li>Scope it explicitly. A good answer keeps consensus on a small amount of metadata (leases, shard maps, config) and keeps the bulk data out of it, because a consensus group's throughput is bounded by a majority round trip.</li>
</ul>`,
    },
    {
      id: "sysdes-fault-tolerance",
      num: "A4",
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
  <tr><td>99.99%</td><td>4.3 minutes</td><td>Multi-AZ, no single points of failure, automated rollback — no human is fast enough to be in the loop.</td></tr>
  <tr><td>99.999%</td><td>26 seconds</td><td>Multi-region active-active, cell isolation, and a genuine willingness to degrade rather than fail. Very expensive; make sure the prompt actually asks for it.</td></tr>
</table>

<h3>Timeouts: no timeout is a bug</h3>
<p>
  Every network call must have a deadline. Without one, a hung dependency is
  converted into thread, connection, and memory exhaustion in <em>your</em>
  process — you die of someone else's slowness. The defaults are not on your
  side: many HTTP clients ship with no socket read timeout at all and fall
  back to OS-level TCP behaviour, which can hold a connection for over two
  hours.
</p>
<ul>
  <li><b>Set the timeout from the dependency's healthy p99.9, not from a round number.</b> If a call normally takes 20 ms at p99.9, a 30-second timeout is not a safety margin — it is 1,500× the useful waiting time, and it guarantees you hold resources for half a minute per hung request.</li>
  <li><b>Propagate deadlines, don't restart them.</b> Five hops each with a fresh 1-second timeout can burn 5 seconds while the user gave up at 2. Pass the remaining budget down (gRPC deadlines, an <code>x-request-deadline</code> header) and have each hop subtract its own elapsed time. If the remaining budget is already less than the dependency's p50, fail immediately rather than starting work that cannot finish.</li>
  <li><b>Separate connect, read, and total timeouts.</b> A connect timeout should be tight (a few hundred ms — TCP handshakes don't get slower under load, they just fail); a read timeout tracks the work; a total timeout caps the whole thing including retries.</li>
  <li><b>A timeout is not an error you understand.</b> A timed-out write may still have committed. This is why the next two sections — retries and idempotency — are inseparable.</li>
</ul>

<h3>Retries, backoff, jitter — and how naive retries kill you</h3>
<p>
  Retrying a transient failure is obviously correct and quietly one of the
  most dangerous things in distributed systems, because retries add load
  exactly when the system has the least capacity.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A four tier request chain where each tier retries three times, multiplying one user request into twenty seven requests at the database that is already overloaded">
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
    <text class="lbl rd" x="20" y="150">every tier retrying 3× multiplies load 27× at the tier that is already failing</text>
    <text class="sm" x="20" y="178">the DB now has to serve 27 requests to satisfy one user, so it gets slower,</text>
    <text class="sm" x="20" y="196">so more calls time out, so more retries fire — the failure sustains itself</text>
    <text class="sm gr" x="20" y="226">fix: retry at ONE tier only, cap retries to ~10% of successes with a token-bucket budget</text>
  </svg>
  <figcaption>Retry amplification is multiplicative across tiers, which is why a retry policy is an architectural decision and not a client-library default.</figcaption>
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
  latency. <b>Retry at one layer only</b>, ideally the one closest to the
  failure or the outermost edge, never both. And <b>enforce a retry
  budget</b>: a token bucket that allows retries to be at most ~10% of
  successful requests, which is how Envoy, gRPC and Finagle bound the
  amplification. When the dependency is fully down, a budget makes retries
  stop automatically.
</p>
<div class="sticky mint">
  <span class="ttl">Metastable failure — the concept that reads as staff-level</span>
  Some systems have <b>two</b> stable states: healthy, and an overloaded
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
    <text class="sm gr" x="150" y="160" text-anchor="middle">one probe succeeds</text>
    <text class="sm rd" x="420" y="272" text-anchor="middle">probe fails → straight back to OPEN</text>
    <text class="sm" x="20" y="26">CLOSED: calls pass through, failures counted</text>
    <text class="sm rd" x="590" y="26" text-anchor="end">OPEN: fail instantly, no thread held</text>
  </svg>
  <figcaption>The half-open state must admit only one or two probe calls — reopening the gate to full traffic is how a recovering dependency gets knocked straight back down.</figcaption>
</figure>
<table>
  <tr><th>State</th><th>Behaviour</th><th>Typical setting</th></tr>
  <tr><td><b>Closed</b></td><td>Calls pass through; outcomes recorded in a rolling window.</td><td>Trip at &gt;50% errors over 10 s, with a minimum of ~20 calls so a single failure on a quiet endpoint doesn't trip it.</td></tr>
  <tr><td><b>Open</b></td><td>Calls fail immediately without touching the network. Return the fallback (cached value, default, partial response) — this is where degradation is wired in.</td><td>Cooldown of 5–30 s. Fast failure is the whole point: you free the thread instead of parking it for the timeout.</td></tr>
  <tr><td><b>Half-open</b></td><td>Admit a single trial call. Success closes the breaker; failure reopens it and restarts the cooldown.</td><td>1–3 concurrent probes, hard-capped. Never let half-open mean "resume normal traffic".</td></tr>
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

<h3>Bulkheads and resource isolation</h3>
<p>
  Named after ship compartments: partition your resources so one flooded
  compartment doesn't sink the vessel. The failure it prevents is the most
  common shape of outage — one slow dependency consuming every thread or
  connection in a shared pool, taking down endpoints that never touched it.
</p>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="On the left a single shared pool of one hundred threads is fully consumed by one slow dependency so all three dependencies fail; on the right three isolated pools of forty threads each mean only the slow dependency's calls fail">
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
    <text class="sm" x="380" y="94" text-anchor="middle">40</text>
    <text class="sm" x="470" y="94" text-anchor="middle">40 — full</text>
    <text class="sm" x="560" y="94" text-anchor="middle">40</text>
    <text class="sm" x="65"  y="163" text-anchor="middle">dep A</text>
    <text class="sm" x="155" y="163" text-anchor="middle">dep B slow</text>
    <text class="sm" x="245" y="163" text-anchor="middle">dep C</text>
    <text class="sm" x="380" y="163" text-anchor="middle">dep A</text>
    <text class="sm" x="470" y="163" text-anchor="middle">dep B slow</text>
    <text class="sm" x="560" y="163" text-anchor="middle">dep C</text>
    <text class="lbl rd" x="155" y="212" text-anchor="middle">A and C fail too</text>
    <text class="lbl gr" x="470" y="212" text-anchor="middle">only B fails</text>
  </svg>
  <figcaption>Bulkheading trades a little peak efficiency for a bounded blast radius — the shared pool is faster right up until the moment it is catastrophic.</figcaption>
</figure>
<ul>
  <li><b>Per-dependency pools:</b> a separate connection/thread pool per downstream, sized so no single one can exhaust the process.</li>
  <li><b>Separate critical from non-critical:</b> checkout and recommendations must not share a pool. Ever.</li>
  <li><b>Cells:</b> partition the whole stack — LB, app, cache, DB — into independent cells serving disjoint customer sets. A bad deploy or poison request takes out one cell, not the fleet. This is how AWS builds most services.</li>
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
  only ever fail critical when there is nothing left.
</p>
<table>
  <tr><th>Technique</th><th>What it does</th><th>The detail people miss</th></tr>
  <tr><td><b>Priority shedding</b></td><td>Reject low-priority classes at the admission point when the system is saturated.</td><td>The priority must be assigned at the edge and carried in-band, or downstream services have no basis to choose.</td></tr>
  <tr><td><b>Latency-based admission control</b></td><td>Shed based on <em>queue wait time</em>, not CPU. If a request has already waited longer than its deadline, dropping it is free capacity.</td><td>CPU is a lagging indicator; by the time it's at 100% you are already in the queue-growth spiral.</td></tr>
  <tr><td><b>LIFO under overload</b></td><td>Serve the newest request first. Old queued requests are probably already abandoned by their client.</td><td>Counterintuitive but correct: FIFO under overload means every request is served just after it became useless.</td></tr>
  <tr><td><b>Fast rejection</b></td><td>Return 429/503 with <code>Retry-After</code> immediately. A rejection costs microseconds; a timeout costs a held thread for seconds.</td><td>The rejection path must be cheap — no DB call, no serialization of a big error body.</td></tr>
  <tr><td><b>Feature degradation</b></td><td>Serve stale cache, drop personalization and serve the generic feed, turn off recommendations, go read-only, serve a static fallback page.</td><td>Each degraded mode needs to be a runtime flag that has actually been exercised — an untested fallback path is just a second bug waiting for the worst possible moment.</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Health checks are a fault-tolerance hazard</span>
  A liveness check that only proves the process is running keeps a broken
  node in rotation. A health check that verifies downstream dependencies
  does the opposite and far worse: when the shared dependency blips, every
  node reports unhealthy simultaneously and the load balancer removes the
  <em>entire fleet</em>. The resolution is to split liveness (self only,
  used for restarts) from readiness (dependencies, used for routing), and to
  make the load balancer <b>fail open</b> — if more than half the targets
  are unhealthy, route to all of them anyway, because degraded service beats
  no service. Both AWS ELB and Envoy have this behaviour, called panic mode.
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
  <li><b>Handle the concurrent duplicate.</b> Two retries can race. Insert the key with a unique constraint <em>first</em>, in the same transaction as the effect; the loser of the insert waits and returns the winner's result. A read-then-write check is a race, not a solution.</li>
  <li><b>Give keys a TTL</b> (Stripe uses 24 hours) and scope them per-customer per-endpoint so a key cannot be replayed against a different operation.</li>
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
  <tr><td>A trigger — a deploy, a traffic spike, a slow query, a lost AZ — pushes one tier past capacity.</td><td>Autoscaling with headroom; canary deploys; per-tenant rate limits so one caller cannot be the trigger.</td></tr>
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
  edge only, with full jitter and a 10% retry budget. If the recommendation
  service is down the breaker opens and we serve the non-personalised feed —
  the user notices nothing, and checkout is completely unaffected because it
  uses a different pool."
</div>

<h3>Chaos engineering and game days</h3>
<p>
  Every mechanism above is a code path that only executes during an
  incident, which means it is untested by default — and an untested fallback
  is usually broken. Chaos engineering is the practice of executing those
  paths deliberately, while people are watching.
</p>
<ul>
  <li><b>Hypothesis first.</b> "If we kill one instance in the payments cell, error rate stays under 0.1% and recovery completes in under 60 seconds." A chaos experiment without a predicted outcome is just an outage you caused.</li>
  <li><b>Smallest blast radius, then widen.</b> One instance, then one AZ, then a region evacuation. Netflix's ladder from Chaos Monkey (kill an instance) to Chaos Kong (evacuate a region) is the model; AWS Fault Injection Service and Gremlin package the same idea.</li>
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
</ul>`,
    },
    {
      id: "sysdes-observability-scale",
      num: "A5",
      title: "Observability at scale",
      short: "Observability at scale",
      levels: ["advanced"],
      practice: [],
      ready: true,
      subtitle:
        "Metrics say something is wrong, traces say where, logs say what — and p99 says whether anyone noticed.",
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
    },
    {
      id: "sysdes-capacity-estimation",
      num: "A6",
      title: "Capacity estimation",
      short: "Capacity estimation",
      levels: ["advanced"],
      practice: [],
      ready: true,
      subtitle:
        "The whiteboard arithmetic that turns hand-waving into a design — no calculator, under two minutes, out loud.",
      body: `<h3>Why they make you do arithmetic</h3>
<p>
  Capacity estimation looks like a party trick and is actually the load-bearing
  part of the interview. Nobody cares whether you said 30 TB/day or 40 TB/day.
  What the arithmetic does is <b>force every architectural decision that
  follows to have a reason</b>. "We'll need a CDN" is a guess. "Peak egress is
  around a terabit per second, so serving from origin would need forty 25-gig
  links; we'll put a CDN in front and target a 95% hit ratio" is a design. The
  numbers are how you stop the interview from being an opinion exchange.
</p>
<p>
  The second reason is negative: estimation is the fastest way to discover
  that you <em>don't</em> need the thing you were about to draw. Roughly half
  the value of the exercise is in the moments when the number comes back small
  and you get to say "so a single Postgres box covers this for three years."
  That sentence scores higher than any amount of Kafka.
</p>

<h3>The rounding conventions that make it tractable</h3>
<p>
  You have no calculator and you are talking while you compute. Every
  convention below exists to keep the arithmetic to one significant figure and
  a power of ten.
</p>
<table>
  <tr><th>Quantity</th><th>True value</th><th>Use this</th><th>Error, and which way</th></tr>
  <tr><td>Seconds in a day</td><td>86,400</td><td>100,000 = 10<sup>5</sup></td><td>Rate estimates come out ~14% low. Irrelevant next to a 3× peak multiplier.</td></tr>
  <tr><td>Seconds in a month</td><td>2,592,000</td><td>2.5 × 10<sup>6</sup></td><td>Under 4% off.</td></tr>
  <tr><td>Seconds in a year</td><td>31,536,000</td><td>3 × 10<sup>7</sup></td><td>~5% low. (The famous mnemonic: π × 10<sup>7</sup>.)</td></tr>
  <tr><td>Days in 5 years</td><td>1,825</td><td>2,000</td><td>~10% high — conservative, which is the right direction for storage.</td></tr>
  <tr><td>1 KB / MB / GB / TB / PB</td><td>2<sup>10</sup>, 2<sup>20</sup>, 2<sup>30</sup>, 2<sup>40</sup>, 2<sup>50</sup></td><td>10<sup>3</sup>, 10<sup>6</sup>, 10<sup>9</sup>, 10<sup>12</sup>, 10<sup>15</sup></td><td>7% low at GB, 10% at TB. Say "I'm using powers of ten" once and move on.</td></tr>
  <tr><td>Peak-to-average traffic</td><td>varies</td><td>2-3× (10× if event-driven: ticket sales, live sport, New Year)</td><td>State which one you chose and why.</td></tr>
  <tr><td>Fraction of DAU concurrent at peak</td><td>varies</td><td>10-25%</td><td>Only matters for connection-oriented systems.</td></tr>
  <tr><td>Storage replication overhead</td><td>varies</td><td>3× for replicas, 1.4× for erasure coding</td><td>Forgetting this is the single most common estimation miss.</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">One number does half the work</span>
  A day is <b>100,000 seconds</b>. Every "per day" figure becomes a "per
  second" figure by moving the decimal point five places. 2 billion requests
  a day is 20,000 a second, and you did that in your head while still talking.
</div>

<h3>The order — always the same eight steps</h3>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="An eight step estimation cascade: daily active users leads to requests per second, then peak requests per second, then storage per day, wrapping to storage over five years, bandwidth, cache memory and finally server count">
    <g class="rough">
      <path class="ln" d="M144,64 L176,64" />
      <path class="ln" d="M304,64 L336,64" />
      <path class="ln" d="M464,64 L496,64" />
      <path class="ln dash" d="M560,88 L560,120 L80,120 L80,150" />
      <path class="ln" d="M144,174 L176,174" />
      <path class="ln" d="M304,174 L336,174" />
      <path class="ln" d="M464,174 L496,174" />
    </g>
    <g class="rough">
      <rect class="boxy" x="16"  y="40"  width="128" height="48" rx="6" />
      <rect class="box"  x="176" y="40"  width="128" height="48" rx="6" />
      <rect class="boxr" x="336" y="40"  width="128" height="48" rx="6" />
      <rect class="box"  x="496" y="40"  width="128" height="48" rx="6" />
      <rect class="box"  x="16"  y="150" width="128" height="48" rx="6" />
      <rect class="box"  x="176" y="150" width="128" height="48" rx="6" />
      <rect class="box"  x="336" y="150" width="128" height="48" rx="6" />
      <rect class="boxg" x="496" y="150" width="128" height="48" rx="6" />
    </g>
    <text class="sm" x="80"  y="60"  text-anchor="middle">1. DAU</text>
    <text class="sm" x="80"  y="78"  text-anchor="middle">given or assumed</text>
    <text class="sm" x="240" y="60"  text-anchor="middle">2. avg req/sec</text>
    <text class="sm" x="240" y="78"  text-anchor="middle">÷ 100,000 s</text>
    <text class="sm rd" x="400" y="60"  text-anchor="middle">3. PEAK req/sec</text>
    <text class="sm rd" x="400" y="78"  text-anchor="middle">× 2-3</text>
    <text class="sm" x="560" y="60"  text-anchor="middle">4. storage/day</text>
    <text class="sm" x="560" y="78"  text-anchor="middle">writes × bytes</text>
    <text class="sm" x="80"  y="170" text-anchor="middle">5. storage / 5 yr</text>
    <text class="sm" x="80"  y="188" text-anchor="middle">× 2,000 × replicas</text>
    <text class="sm" x="240" y="170" text-anchor="middle">6. bandwidth</text>
    <text class="sm" x="240" y="188" text-anchor="middle">bytes/s → Gbps</text>
    <text class="sm" x="400" y="170" text-anchor="middle">7. cache RAM</text>
    <text class="sm" x="400" y="188" text-anchor="middle">hot set × row size</text>
    <text class="sm" x="560" y="170" text-anchor="middle">8. servers</text>
    <text class="sm" x="560" y="188" text-anchor="middle">peak ÷ per-box</text>
  </svg>
  <figcaption>Step 3 sizes the fleet, step 5 chooses the storage engine, step 6 decides whether you need a CDN. Do them in order and each answer is an input to the next; skip one and you will be caught out by the interviewer who asks "so how many machines?"</figcaption>
</figure>
<p class="sub">
  Two habits make this fluent. First, <b>write the assumptions on the board
  before the arithmetic</b> — "10 sessions/user/day, 3× peak, 5-year horizon"
  — so the interviewer can correct an input instead of watching you compute
  the wrong thing for two minutes. Second, <b>say the units out loud every
  line</b>. Almost every estimation error in an interview is a units error:
  bits versus bytes, per-day versus per-second, one photo versus one photo
  plus its four derived sizes.
</p>

<h3>Numbers worth memorizing</h3>
<table>
  <tr><th>Operation</th><th>Time</th><th>Anchor</th></tr>
  <tr><td>L1 cache reference</td><td>1 ns</td><td>the unit everything else is measured in</td></tr>
  <tr><td>Branch mispredict</td><td>3 ns</td><td></td></tr>
  <tr><td>L2 cache reference</td><td>4 ns</td><td></td></tr>
  <tr><td>Mutex lock/unlock, uncontended</td><td>20 ns</td><td></td></tr>
  <tr><td>Main memory reference</td><td>100 ns</td><td>100× slower than L1 — this is why cache locality wins</td></tr>
  <tr><td>Compress 1 KB</td><td>2 µs</td><td>compression is nearly always cheaper than the network hop it saves</td></tr>
  <tr><td>Read 1 MB sequentially from RAM</td><td>~50 µs</td><td>≈ 20 GB/s</td></tr>
  <tr><td>SSD random read (NVMe, with queueing)</td><td>~100 µs</td><td>~16 µs is the flash; the rest is the software stack</td></tr>
  <tr><td>Read 1 MB from NVMe SSD</td><td>~300 µs</td><td>≈ 3 GB/s</td></tr>
  <tr><td>Round trip within one datacenter</td><td>0.5 ms</td><td>your budget for a service-to-service hop</td></tr>
  <tr><td>Read 1 MB sequentially from spinning disk</td><td>~10 ms</td><td>≈ 100 MB/s</td></tr>
  <tr><td>Disk seek (HDD)</td><td>~10 ms</td><td>why random I/O on HDD is a design error, not a tuning problem</td></tr>
  <tr><td>Round trip US coast to coast</td><td>~50 ms</td><td>4,800 km at 200,000 km/s in fibre = 24 ms each way. Physics, not engineering.</td></tr>
  <tr><td>Round trip US to Europe</td><td>~80 ms</td><td></td></tr>
  <tr><td>Round trip US to India / Australia</td><td>~200 ms</td><td>the reason "just put it in one region" fails a global product</td></tr>
</table>
<table>
  <tr><th>Component</th><th>Throughput to assume</th><th>Note</th></tr>
  <tr><td>Single Postgres/MySQL box, indexed and warm</td><td>5,000-10,000 simple reads/s; 1,000-5,000 writes/s</td><td>Writes are fsync-bound. A single box with an NVMe WAL goes higher; do not claim more than 10k writes/s without saying why.</td></tr>
  <tr><td>Read replica</td><td>Adds another 5,000-10,000 reads/s each</td><td>Replicas scale reads, never writes. Say this every time you add one.</td></tr>
  <tr><td>Redis, single instance</td><td>~100,000 ops/s; up to ~1,000,000 pipelined</td><td>Single-threaded for command execution — one hot key cannot be scaled by adding RAM.</td></tr>
  <tr><td>Application server, real JSON handler with a DB call</td><td>1,000-5,000 rps</td><td>Use 1,000 for sizing. It is conservative and defensible.</td></tr>
  <tr><td>nginx / envoy serving static or proxying</td><td>50,000+ rps per box</td><td></td></tr>
  <tr><td>Kafka broker</td><td>100 MB/s-1 GB/s sustained</td><td>Sequential disk writes; the bottleneck is usually the NIC.</td></tr>
  <tr><td>One 10 / 25 Gbps NIC</td><td>1.25 / 3.1 GB/s</td><td>Divide by 8. Bandwidth is quoted in bits, storage in bytes — this is the classic slip.</td></tr>
  <tr><td>One commodity server, 2026</td><td>64-128 cores, 256 GB-2 TB RAM, tens of TB NVMe</td><td>Bigger than most candidates assume. Vertical scaling gets you further than the folklore suggests.</td></tr>
</table>
<table>
  <tr><th>Thing</th><th>Bytes</th></tr>
  <tr><td>char / boolean / int / bigint or timestamp / UUID</td><td>1 / 1 / 4 / 8 / 16</td></tr>
  <tr><td>A "skinny" row — a few ids and a timestamp</td><td>~100 B</td></tr>
  <tr><td>A typical metadata row with short text</td><td>~500 B - 1 KB</td></tr>
  <tr><td>A chat message (text + delivery metadata)</td><td>~200 B</td></tr>
  <tr><td>A structured JSON log line</td><td>~500 B - 1 KB</td></tr>
  <tr><td>A thumbnail / a web-sized image / a phone photo</td><td>~20 KB / ~200 KB / 1-5 MB</td></tr>
  <tr><td>One minute of 1080p video</td><td>~50 MB</td></tr>
</table>

<h3>Worked example 1 — a photo-sharing service</h3>
<p>
  Assumptions stated first, on the board, before any arithmetic: 200 M daily
  active users; each opens the app 10 times a day and each open loads one feed
  page of 20 images; 10% of users post one photo per day; 5-year retention;
  peak is 3× average.
</p>
<pre><code>TRAFFIC
  DAU                      200,000,000
  feed opens / user / day  10
  feed reads / day         2 x 10^9              <span class="c">// 200M x 10</span>
  seconds / day            100,000
  avg feed reads / sec     20,000                <span class="c">// 2e9 / 1e5</span>
  PEAK feed reads / sec    60,000                <span class="c">// x3 — this sizes the fleet</span>

  posters / day            20,000,000            <span class="c">// 10% of 200M</span>
  avg uploads / sec        200                   <span class="c">// 2e7 / 1e5</span>
  PEAK uploads / sec       600
  read : write ratio       100 : 1               <span class="c">// 2e9 vs 2e7 -> read-heavy, cache hard</span>

BLOB STORAGE
  bytes / photo            1.5 MB                <span class="c">// 1.2 MB original + 4 derived sizes</span>
  per day                  20e6 x 1.5e6 = 3 x 10^13 B = 30 TB/day
  per year                 30 TB x 365 = 10,950 TB ~ 11 PB/year
  over 5 years             ~55 PB raw
  with 3x replication      ~165 PB
  with erasure coding 1.4x ~77 PB                <span class="c">// worth 88 PB of savings — say this out loud</span>

METADATA STORAGE
  bytes / photo row        500 B                 <span class="c">// ids, timestamps, caption, url, counters</span>
  per day                  20e6 x 500 = 10 GB/day
  per year                 3.65 TB/year
  over 5 years             ~18 TB                <span class="c">// ONE box. Do not shard this on day one.</span>

BANDWIDTH (egress)
  bytes / feed page        20 images x 100 KB = 2 MB
  per day                  2e9 x 2e6 = 4 x 10^15 B = 4 PB/day
  avg egress               4e15 / 1e5 = 4 x 10^10 B/s = 40 GB/s = 320 Gbps
  PEAK egress              ~960 Gbps ~ 1 Tbps    <span class="c">// serving this from origin is not a plan</span>
  with a 95%-hit CDN       origin sees ~48 Gbps  <span class="c">// two or three 25G links. Feasible.</span>

CACHE
  hot set: metadata for the last 7 days of photos
  rows                     20e6 x 7 = 1.4 x 10^8
  memory                   1.4e8 x 500 B = 70 GB <span class="c">// 3-node Redis + replicas. Trivial.</span>

SERVERS
  peak req/s               60,000
  per app server           1,000 rps
  bare minimum             60
  x2 for headroom + AZ loss tolerance  ~120 app servers</code></pre>
<p class="sub">
  Every one of those lines is a sentence you say while writing it. The
  interviewer is not checking your multiplication — they are checking that
  <em>you know which quantity comes next</em> and that you noticed the two
  interesting results: metadata is small enough for one machine, and blob
  egress is large enough to make the CDN non-negotiable.
</p>
<div class="warn">
  <span class="ttl">⚠ The three misses that cost candidates the most</span>
  <b>(1)</b> Forgetting replication and derived data — a 55 PB answer that
  ignores 3× replicas is off by a factor of three, and the fix is one
  sentence. <b>(2)</b> Confusing bits and bytes when quoting bandwidth;
  40 GB/s is 320 Gbps, not 40 Gbps. <b>(3)</b> Estimating average load and
  then sizing the fleet from it. Systems fail at peak, so the fleet is sized
  from peak, and the peak multiplier is an assumption you must state.
</div>

<h3>Worked example 2 — a chat service</h3>
<p>
  Same eight steps, wildly different shape of answer — which is exactly why
  it is worth doing twice. Assumptions: 500 M DAU; 40 messages sent per user
  per day; average message reaches 3 recipients (a mix of 1:1 and small
  groups); 20% of DAU are connected simultaneously at peak.
</p>
<pre><code>TRAFFIC
  DAU                      500,000,000
  messages sent / day      500e6 x 40 = 2 x 10^10
  avg sends / sec          200,000               <span class="c">// 2e10 / 1e5</span>
  PEAK sends / sec         600,000

  avg recipients / message 3
  deliveries / day         6 x 10^10
  avg deliveries / sec     600,000
  PEAK deliveries / sec    1,800,000             <span class="c">// the real workload is delivery, not send</span>

STORAGE (if you keep history)
  bytes / message          200 B                 <span class="c">// text + ids + timestamps + delivery state</span>
  per day                  2e10 x 200 = 4 x 10^12 B = 4 TB/day
  per year                 1.46 PB/year
  x3 replication           ~4.4 PB/year          <span class="c">// LSM store, partition by conversation</span>

STORAGE (if you keep only the undelivered)
  ~1% undelivered at any time, held ~1 day
  4 TB x 1% =              40 GB                 <span class="c">// five orders of magnitude cheaper</span>

CONNECTIONS
  concurrent at peak       500e6 x 20% = 100,000,000 sockets
  memory / socket          ~10 KB                <span class="c">// kernel buffers + per-user state</span>
  total connection RAM     1e8 x 1e4 = 10^12 B = 1 TB
  sockets / gateway box    1,000,000             <span class="c">// tuned kernel, event-driven runtime</span>
  gateway boxes            100, call it 150 with headroom

BANDWIDTH
  peak                     1.8e6 deliveries/s x 200 B = 3.6 x 10^8 B/s
                           = 360 MB/s ~ 3 Gbps   <span class="c">// compare: 1 Tbps for the photo service</span>

ROUTING TABLE (which gateway holds each live socket?)
  100e6 entries x 50 B  =  5 GB                  <span class="c">// fits in one Redis. Do not use a database.</span></code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "The interesting result is that
  chat is a <em>connection</em> problem, not a bandwidth problem — 3 Gbps at
  peak is nothing, but 100 million concurrent sockets means the gateway tier
  is stateful and I need a routing layer to find a user's socket. And notice
  that 'do we retain history?' swings storage from 40 GB to 4.4 PB a year.
  That is a product decision with a five-order-of-magnitude infrastructure
  consequence, so I'd want it answered before I draw the storage layer."
</div>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Clients pull roughly 960 gigabits per second at peak from a CDN edge with a 95 percent hit ratio, so the origin and object store only see about 48 gigabits per second">
    <g class="rough">
      <path class="lnr" d="M126,96 L200,96" />
      <path class="ln dash" d="M350,96 L470,96" />
    </g>
    <g class="rough">
      <rect class="box"  x="16"  y="70" width="110" height="52" rx="6" />
      <rect class="boxg" x="200" y="60" width="150" height="72" rx="6" />
      <rect class="boxy" x="470" y="72" width="150" height="48" rx="6" />
    </g>
    <text class="sm" x="71"  y="92"  text-anchor="middle">clients</text>
    <text class="sm" x="71"  y="110" text-anchor="middle">200 M DAU</text>
    <text class="sm" x="275" y="88"  text-anchor="middle">CDN edge</text>
    <text class="sm" x="275" y="106" text-anchor="middle">95% hit ratio</text>
    <text class="sm" x="545" y="92"  text-anchor="middle">origin + object store</text>
    <text class="sm" x="545" y="110" text-anchor="middle">55 PB, erasure coded</text>
    <text class="sm rd" x="163" y="82" text-anchor="middle">~960 Gbps</text>
    <text class="sm" x="410" y="82"  text-anchor="middle">~48 Gbps</text>
    <text class="lbl" x="16" y="168" style="font-size:14px">the hit ratio is the whole design: at 80% the origin needs ~190 Gbps,</text>
    <text class="lbl" x="16" y="188" style="font-size:14px">at 99% it needs ~10 Gbps — so cache-key design is a capacity decision</text>
  </svg>
  <figcaption>The CDN is not there to reduce latency here; it is there because the origin physically cannot emit a terabit per second. Quote the hit ratio as an assumption, because the origin number is entirely a function of it.</figcaption>
</figure>

<h3>How each number cashes out as a design decision</h3>
<table>
  <tr><th>The number you computed</th><th>What it rules out</th><th>What it rules in</th></tr>
  <tr><td>60,000 peak reads/sec</td><td>A single database primary serving reads</td><td>Cache tier in front, read replicas behind, ~120 stateless app servers</td></tr>
  <tr><td>100:1 read:write ratio</td><td>Optimising for write throughput; normalised schemas with joins on the read path</td><td>Denormalised read models, aggressive caching, fan-out-on-write (see the case-studies chapter)</td></tr>
  <tr><td>30 TB/day of blobs</td><td>Storing images in the database. Ever.</td><td>Object storage + CDN; the DB holds a 500-byte row with a URL</td></tr>
  <tr><td>18 TB of metadata over 5 years</td><td>Sharding into 100 shards on day one</td><td>One primary + replicas, with a shard key chosen now and applied later</td></tr>
  <tr><td>~1 Tbps peak egress</td><td>Serving from origin, single-region</td><td>CDN with an explicit hit-ratio target; cache keys designed for hit ratio</td></tr>
  <tr><td>100 M concurrent sockets</td><td>Stateless HTTP polling; a stateless gateway tier</td><td>Persistent connections, sticky routing, a socket-location registry, graceful drain on deploy</td></tr>
  <tr><td>5 GB routing table</td><td>A database lookup on every message delivery</td><td>In-memory table, replicated, rebuilt from connection state on restart</td></tr>
  <tr><td>600,000 peak writes/sec</td><td>A relational primary; synchronous cross-region replication</td><td>LSM-tree store partitioned by conversation id, tunable quorum (see the sharding and consistency chapters)</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Do not over-invest in precision</span>
  Spending eight minutes of a forty-five-minute interview on arithmetic is a
  failure mode of its own. The target is roughly <b>three minutes</b>: state
  assumptions, compute peak QPS, storage, bandwidth, and one memory figure,
  then say "these are order-of-magnitude; the ones that change the design are
  peak QPS and total storage" and move on. If the interviewer wants a number
  refined they will ask. And if they hand you a number — "assume 10 M users" —
  take it and stop negotiating; they are trying to save you time.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Every design prompt needs this, whether or not it is asked for. Do it immediately after requirements and before the first box goes on the board — it is what makes the boxes defensible.</li>
  <li>The prompt gives you a user count, a "how would this scale to X", or a product with obvious media (photos, video, voice) — media means the blob path and the metadata path have wildly different sizes and must be estimated separately.</li>
  <li>A naive answer estimates average load. The senior move is peak load, with the multiplier stated as an assumption, plus a sentence about what drives the peak for <em>this specific product</em>.</li>
  <li>Distinguish "big number" from "hard problem": 18 TB of metadata is a big number and an easy problem; 100 M concurrent connections is a smaller number and a much harder one. Say which of your numbers are merely large.</li>
  <li>The pitfall: computing storage and never computing bandwidth or memory. Storage is the cheap one. Egress bandwidth and RAM are where the money and the architecture actually live.</li>
  <li>If a number comes back small, <em>say so and simplify the design</em>. "That's 100 writes a second, so one Postgres primary with a replica handles this for years" is a stronger answer than any distributed store.</li>
</ul>`,
    },
    {
      id: "sysdes-case-studies",
      num: "A7",
      title: "Real-world case studies",
      short: "Case studies",
      levels: ["advanced"],
      practice: [],
      ready: true,
      subtitle: "Six systems you use every week, one interesting decision each, and the bill that came with it.",
      body: `<h3>How to read these — and how not to use them</h3>
<p>
  Everything below is drawn from <b>publicly discussed architecture</b>:
  conference talks, engineering blog posts, papers. Each is a snapshot of a
  system <em>at a point in time</em>, usually years ago, and in several cases
  the company has since rebuilt the thing described. None of it is current
  internal truth, and you should say so if you cite it. The value is not the
  architecture; it is the <b>reasoning</b>, and specifically the part that
  most retellings skip: what the clever decision <em>cost</em>.
</p>
<p>
  Used badly, case studies are name-dropping — "I'd do it like Twitter"
  signals that you have read a blog post, not that you can design. Used well,
  they are a compressed argument: "there is a known pattern for the celebrity
  problem; it is a hybrid, and the threshold is a tunable I'd set at around
  a million followers." Each section below ends with the one transferable
  move.
</p>

<h3>Twitter timelines — the hybrid fan-out</h3>
<p>
  The problem, as described in Twitter's engineering talks around 2013: home
  timeline reads ran at a few hundred thousand requests per second against
  tweet writes in the low thousands per second. A read-time query — "fetch
  every tweet from everyone this user follows, merge, sort" — is a scatter
  across thousands of partitions on the hottest path in the product. The fix
  was to invert it: on <b>write</b>, push the tweet id into a precomputed
  per-follower timeline list held in memory (Redis), capped at roughly 800
  entries. The read then becomes a single list fetch. Reads went from a
  distributed join to an O(1) lookup.
</p>
<p>
  The cost is write amplification, and it is brutal at the tail of the
  follower distribution. A user with 30 million followers generates 30 million
  list insertions per tweet. At a few thousand tweets per second across the
  network, total fan-out delivery ran into tens of billions of timeline writes
  per day. So the design became a <b>hybrid</b>: fan out on write for ordinary
  accounts, and for the small set of very-high-follower accounts, skip fan-out
  entirely and merge their recent tweets in at read time.
</p>
<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="Hybrid timeline fan-out: an ordinary user's tweet goes through a fan-out worker into per-follower timeline caches, while a celebrity's tweet is written once to a separate store and merged into the timeline only at read time">
    <g class="rough">
      <path class="ln" d="M150,46 L196,46" />
      <path class="ln" d="M320,46 L386,26" />
      <path class="ln" d="M320,46 L386,72" />
      <path class="ln" d="M320,46 L386,118" />
      <path class="lnr dash" d="M194,206 L246,206" />
      <path class="lnr" d="M386,206 L440,206" />
      <path class="lng" d="M500,136 L516,182" />
    </g>
    <g class="rough">
      <rect class="box"  x="14"  y="24"  width="136" height="44" rx="6" />
      <rect class="boxy" x="196" y="24"  width="124" height="44" rx="6" />
      <rect class="box"  x="386" y="8"   width="150" height="36" rx="6" />
      <rect class="box"  x="386" y="54"  width="150" height="36" rx="6" />
      <rect class="box"  x="386" y="100" width="150" height="36" rx="6" />
      <rect class="boxr" x="14"  y="182" width="180" height="48" rx="6" />
      <rect class="box"  x="246" y="182" width="140" height="48" rx="6" />
      <rect class="boxg" x="440" y="182" width="184" height="48" rx="6" />
    </g>
    <text class="sm" x="82"  y="40"  text-anchor="middle">tweet by</text>
    <text class="sm" x="82"  y="58"  text-anchor="middle">ordinary account</text>
    <text class="sm" x="258" y="40"  text-anchor="middle">fan-out</text>
    <text class="sm" x="258" y="58"  text-anchor="middle">workers</text>
    <text class="sm" x="461" y="31"  text-anchor="middle">timeline cache · follower A</text>
    <text class="sm" x="461" y="77"  text-anchor="middle">timeline cache · follower B</text>
    <text class="sm" x="461" y="123" text-anchor="middle">timeline cache · follower C</text>
    <text class="sm rd" x="104" y="200" text-anchor="middle">tweet by celebrity</text>
    <text class="sm rd" x="104" y="218" text-anchor="middle">30 M followers</text>
    <text class="sm" x="316" y="200" text-anchor="middle">celebrity tweet store</text>
    <text class="sm" x="316" y="218" text-anchor="middle">write once, no fan-out</text>
    <text class="sm" x="532" y="200" text-anchor="middle">read path: merge</text>
    <text class="sm" x="532" y="218" text-anchor="middle">cached list + celebrity pull</text>
    <text class="lbl" x="14" y="262" style="font-size:14px">write cost is paid by the 99.9% of accounts where it is cheap;</text>
    <text class="lbl" x="14" y="282" style="font-size:14px">read cost is paid only for the handful of accounts where fan-out would explode</text>
  </svg>
  <figcaption>The threshold is the design. Too low and you pay the merge cost on every read; too high and one celebrity tweet stalls the fan-out queue for everyone behind it.</figcaption>
</figure>
<p class="sub">
  <b>What to steal in an interview:</b> whenever a workload has a power-law
  distribution, propose treating the head and the tail differently, and
  <em>name the threshold as a tunable</em>. "Fan-out on write below a million
  followers, fan-out on read above it, and I'd make that a config value
  because the right number depends on the follower histogram" is a complete
  answer to a whole family of feed, notification and subscription questions.
</p>

<h3>Netflix — precomputed placement, and failure as a habit</h3>
<p>
  Netflix's Open Connect programme, publicly described from around 2012,
  inverts the usual CDN model. Instead of caching reactively on a miss,
  Netflix ships physical appliances into ISP networks and internet exchanges,
  and <b>fills them overnight during off-peak hours</b> with content chosen by
  a popularity prediction per region. Video is unusually well suited to this:
  the catalogue is finite, changes slowly, and next-Tuesday's demand is
  genuinely predictable from this-Tuesday's. So the cache miss — the expensive
  event that dominates ordinary CDN design — is mostly engineered out of
  existence rather than optimised.
</p>
<p>
  The cost is that you are now running a hardware logistics operation:
  manufacturing, shipping, ISP contracts, remote diagnostics for boxes you
  cannot physically reach. That is a real organisational commitment, and it
  only pencils out because streaming video is a large enough fraction of
  internet traffic to justify it. Do not propose it for a service serving
  200 KB images.
</p>
<p>
  The second Netflix idea is cultural rather than architectural: Chaos Monkey
  and the broader Simian Army, which terminate production instances during
  business hours on purpose. The reasoning is that redundancy you have never
  exercised is a claim, not a property — failover paths rot, runbooks go
  stale, and the first real test of your multi-AZ story should not be at 3am.
  The cost is that you must build the resilience <em>first</em>; switching on
  failure injection in a system that isn't ready is just an outage you
  scheduled.
</p>
<p class="sub">
  <b>What to steal:</b> two sentences. "If demand is predictable, precompute
  placement instead of caching reactively." And, at the end of any
  availability discussion, "I'd verify the failover path with scheduled
  failure injection, because an untested failover is a broken failover." The
  second one costs you fifteen seconds and reliably lands.
</p>

<h3>Uber — a spatial index is a sharding decision</h3>
<p>
  Matching riders to drivers is a continuous geospatial query: given a point,
  find nearby available supply, fast, while every driver's position updates
  every few seconds. Uber's publicly described answer (the H3 library, open
  sourced in 2018) indexes the world as a hierarchy of <b>hexagonal</b> cells,
  each addressed by a 64-bit id, at sixteen resolutions from continent-sized
  down to about a square metre. A proximity query becomes "look up this cell
  and its ring of neighbours" — a key lookup, not a geometric search.
</p>
<p>
  Hexagons rather than squares for a specific reason: a hexagon has six
  neighbours and all six centroids are <em>equidistant</em>. A square grid has
  four edge-neighbours at distance <em>d</em> and four corner-neighbours at
  <em>d</em>√2, so "expand the search by one ring" means different things in
  different directions, and any smoothing or gradient over the grid is
  distorted. The cost is that hexagons do not tile hierarchically: you cannot
  subdivide a hexagon into smaller hexagons exactly, so containment across
  resolutions is approximate, and wrapping a sphere in hexagons mathematically
  requires exactly twelve pentagons (H3 places them over ocean). That is a
  genuine correctness footnote you inherit.
</p>
<p>
  The deeper point is that the spatial index doubles as the shard key. Uber's
  dispatch system was sharded geographically, which is the natural choice and
  which imports the natural failure: <b>geography is not a uniform load
  distribution</b>. A stadium at kickoff is a hot cell, and no amount of
  consistent hashing helps because the load genuinely is in one place. The
  mitigations are the usual ones from the sharding chapter — split hot cells
  to a finer resolution dynamically, and keep the dispatch tier able to
  rebalance ownership between nodes.
</p>
<p class="sub">
  <b>What to steal:</b> for any "find things near me" prompt, name a concrete
  index (H3, S2, geohash, or a PostGIS R-tree) and immediately name the
  resolution tradeoff — coarse cells mean fewer lookups but more candidates to
  filter; fine cells mean more lookups but tighter results. Then volunteer the
  hot-cell problem before the interviewer does.
</p>

<h3>WhatsApp — constraining the product is a scaling lever</h3>
<p>
  The widely cited figures: in 2015 WhatsApp served roughly 900 million users
  with an engineering team of about fifty. Their 2012 blog post described
  holding <b>two million concurrent TCP connections on a single machine</b>,
  running Erlang on FreeBSD. Erlang's runtime is the reason it is even
  plausible — millions of cheap preemptively-scheduled processes, per-process
  heaps so garbage collection is per-connection and measured in microseconds
  rather than a stop-the-world pause, and supervision trees that restart a
  crashed connection process without touching its neighbours. Add heavy kernel
  tuning of socket buffers and file descriptor limits, and the per-connection
  cost lands in the low tens of kilobytes.
</p>
<p>
  But the runtime is only half of it. The other half is that WhatsApp
  <b>refused features</b>. For most of that period the server did not store
  message history — a message was queued only until delivered, then deleted.
  That single product decision is worth revisiting with the arithmetic from
  the capacity chapter: retaining history costs petabytes a year; retaining
  only undelivered messages costs tens of gigabytes. No ads, no timeline, no
  media transcoding pipeline of significance, minimal server-side state. The
  small team was not despite the scale; it was possible <em>because</em> the
  surface area was tiny.
</p>
<p>
  The cost is severe specialisation. Hiring Erlang engineers is hard, the
  ecosystem is small, and the architecture is unusually inflexible in the
  direction of adding features — which is precisely what a company adds after
  an acquisition.
</p>
<p class="sub">
  <b>What to steal:</b> when the requirements phase is happening, ask whether
  a feature is actually required, and put a number on what it costs if it is.
  "Do we need server-side history? If yes I need a petabyte-scale message
  store; if no, a 40 GB queue covers it" is the highest-leverage question in
  the whole interview, and almost nobody asks it. Also: name your
  per-connection memory budget on any real-time design.
</p>

<h3>Instagram — boring database, aggressively applied</h3>
<p>
  Instagram is the standing counterexample to "web scale needs a new
  database." Through its hypergrowth years it ran on <b>PostgreSQL</b>,
  sharded by user id, with two decisions that made it work.
</p>
<p>
  First, blobs left the database immediately — photos went to object storage
  behind a CDN, and Postgres held only metadata rows. Re-run the capacity
  arithmetic and it is obvious why: the blob path is measured in petabytes and
  the metadata path in terabytes. Keeping them in the same system means sizing
  your relational store for the wrong workload.
</p>
<p>
  Second, <b>logical shards</b>. Rather than mapping users onto physical
  machines, they mapped users onto a few thousand logical shards (Postgres
  schemas), then mapped many logical shards onto each physical machine.
  Growing the cluster means moving logical shards between machines — no
  re-hashing, no application change. Their id generation scheme, described in
  a 2012 post, packs the shard into the primary key itself:
</p>
<pre><code>64-bit id =  41 bits  millisecond timestamp   <span class="c">// ~69 years of range from a custom epoch</span>
           + 13 bits  logical shard id        <span class="c">// 8,192 logical shards</span>
           + 10 bits  per-shard sequence      <span class="c">// 1,024 ids per ms per shard</span>

  ids are roughly time-sortable  -> good index locality on an append-heavy table
  the shard is IN the id         -> route a request without a lookup table
  generated in the database      -> no separate id service to keep available</code></pre>
<p>
  The cost is everything you give up by sharding a relational database: no
  cross-shard joins, no cross-shard transactions, no global secondary indexes,
  and application code that must always know the shard key. Connection
  management becomes its own project — thousands of app processes against a
  Postgres backend that forks per connection means PgBouncer is not optional.
</p>
<p class="sub">
  <b>What to steal:</b> "I'd start with Postgres" is a legitimate and often
  correct answer, and the way to make it credible is to pair it with the
  scaling path — blobs out to object storage, logical shards from day one so
  rebalancing is a data move rather than a rewrite, and a shard-encoded id.
  Say the sentence "sharding costs me joins and cross-shard transactions"
  before the interviewer asks.
</p>

<h3>Discord — coalescing in front of a hot partition</h3>
<p>
  Discord's two posts on message storage — billions of messages on Cassandra
  in 2017, trillions on ScyllaDB in 2023 — are unusually honest about what
  went wrong in between, which makes them the most instructive pair on this
  list.
</p>
<p>
  The original data model is worth memorising as a template: partition key of
  <code>(channel_id, bucket)</code> where the bucket is a fixed time window,
  clustered by a snowflake message id in descending order. The bucket exists
  because a partition keyed on channel alone grows without bound; bucketing
  caps partition size and makes "load the most recent messages" a single
  partition read with no sorting.
</p>
<p>
  What broke was not throughput but <b>tail latency</b>, and the causes are a
  tour of distributed-storage failure modes. Hot partitions: a handful of
  enormous channels received a wildly disproportionate share of reads.
  Tombstones: deletes in an LSM store are writes, and a range scan must read
  past every tombstone in the range, so a heavily-moderated channel became
  slow to read. And JVM garbage collection: stop-the-world pauses on Cassandra
  nodes produced multi-second stalls that showed up purely as p99 spikes —
  invisible in an average, invisible in the error rate, exactly the pattern
  the observability chapter warns about.
</p>
<p>
  The 2023 rebuild had two parts. ScyllaDB — a C++ reimplementation of
  Cassandra with a shard-per-core architecture and no garbage collector —
  removed the GC pauses. More interesting is what they put <em>in front</em>:
  intermediate "data services" written in Rust that <b>coalesce concurrent
  identical requests</b>. When ten thousand clients ask for the same channel
  page in the same instant, the first request goes to the database and the
  rest wait on its result.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A thousand concurrent requests for the same channel arrive at a Rust data service that coalesces them by key, so the ScyllaDB partition receives only a single read">
    <g class="rough">
      <path class="lnr" d="M164,120 L226,120" />
      <path class="lng" d="M406,120 L470,120" />
    </g>
    <g class="rough">
      <rect class="box"  x="14"  y="90"  width="150" height="60" rx="6" />
      <rect class="boxy" x="226" y="84"  width="180" height="72" rx="6" />
      <rect class="boxg" x="470" y="96"  width="150" height="48" rx="6" />
    </g>
    <text class="sm" x="89"  y="112" text-anchor="middle">10,000 clients</text>
    <text class="sm" x="89"  y="130" text-anchor="middle">same channel, same</text>
    <text class="sm" x="89"  y="146" text-anchor="middle">instant</text>
    <text class="sm" x="316" y="112" text-anchor="middle">data service (Rust)</text>
    <text class="sm" x="316" y="130" text-anchor="middle">coalesce by</text>
    <text class="sm" x="316" y="146" text-anchor="middle">(channel_id, bucket)</text>
    <text class="sm" x="545" y="116" text-anchor="middle">ScyllaDB</text>
    <text class="sm" x="545" y="134" text-anchor="middle">hot partition</text>
    <text class="sm rd" x="195" y="106" text-anchor="middle">10,000 reads/s</text>
    <text class="sm gr" x="438" y="106" text-anchor="middle">1 read</text>
    <text class="lbl" x="14" y="196" style="font-size:14px">this is a cache with a time-to-live of "the duration of one query" —</text>
    <text class="lbl" x="14" y="216" style="font-size:14px">no staleness, no invalidation problem, and the hot partition never notices the crowd</text>
  </svg>
  <figcaption>Request coalescing is the cheapest tool against a read hotspot because it introduces no staleness at all — unlike a TTL cache, every caller still receives a value that was live when their request arrived.</figcaption>
</figure>
<p class="sub">
  <b>What to steal:</b> request coalescing (also called single-flight or
  request collapsing) is a genuinely reusable move, and mentioning it marks
  you as someone who has fought a thundering herd. It is also the correct
  answer to cache-stampede questions from the caching chapter: on a miss, one
  request refills while the others wait, instead of ten thousand simultaneous
  refills.
</p>

<h3>The six, on one line each</h3>
<table>
  <tr><th>System</th><th>The one interesting decision</th><th>What it cost</th><th>The transferable move</th></tr>
  <tr><td>Twitter timelines (~2013)</td><td>Fan-out on write, hybrid for high-follower accounts</td><td>Enormous write amplification; a threshold that must be tuned</td><td>Split head and tail of a power-law workload; name the threshold</td></tr>
  <tr><td>Netflix Open Connect (~2012+)</td><td>Predictive overnight cache fill into ISP-hosted appliances</td><td>Running a hardware logistics business</td><td>If demand is predictable, precompute placement rather than caching reactively</td></tr>
  <tr><td>Netflix Chaos Monkey</td><td>Inject failure in production, continuously</td><td>Requires the resilience to exist first</td><td>An untested failover is a broken failover</td></tr>
  <tr><td>Uber H3 (open sourced 2018)</td><td>Hexagonal hierarchical spatial index as both index and shard key</td><td>Approximate containment across resolutions; twelve pentagons; hot cells at events</td><td>Name the spatial index and its resolution tradeoff; volunteer the hotspot</td></tr>
  <tr><td>WhatsApp (~2012-2015)</td><td>Erlang + kernel tuning for millions of sockets per box; no server-side history</td><td>Extreme specialisation; a deliberately tiny feature surface</td><td>Cutting a requirement is a scaling lever — put a number on it</td></tr>
  <tr><td>Instagram (~2012+)</td><td>Sharded Postgres with logical shards and shard-encoded ids; blobs in object storage</td><td>No cross-shard joins or transactions; connection pooling as a project</td><td>Boring database plus an explicit scaling path beats an exotic one</td></tr>
  <tr><td>Discord (2017 → 2023)</td><td>Bucketed partitions; then request coalescing in front of ScyllaDB</td><td>A trillion-row migration; a bespoke service tier to maintain</td><td>Coalesce concurrent identical reads; GC pauses surface as p99, not as errors</td></tr>
</table>

<h3>Using a case study without sounding like you read a blog post</h3>
<ul>
  <li><b>Lead with the problem, not the company.</b> "This has the celebrity fan-out shape" is analysis; "Twitter uses Redis" is trivia. Name the company second, as a citation.</li>
  <li><b>Date it and hedge it.</b> "As of their 2017 write-up" costs you four words and protects you completely — the interviewer may work there and know it changed.</li>
  <li><b>Always state the cost.</b> A candidate who says "and that cost them cross-shard joins" has understood the decision. A candidate who lists only the benefit has memorised it.</li>
  <li><b>Never argue from authority.</b> "Netflix does it" is not a reason. "Our demand is predictable in the same way theirs is, which is what makes precomputed placement work here" is a reason.</li>
  <li><b>Scale-check the analogy out loud.</b> Most of these solve problems that appear above roughly 10 million users. If the prompt is a 100k-user product, the correct use of the case study is to explain why you are <em>not</em> doing it yet — which sets up the tradeoff-thinking chapter's central point.</li>
  <li><b>The pitfall:</b> importing a whole architecture instead of one idea. These companies each had a specific constraint that justified a specific cost. Steal the reasoning; leave the org chart.</li>
</ul>`,
    },
    {
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
    },
  ],
};
