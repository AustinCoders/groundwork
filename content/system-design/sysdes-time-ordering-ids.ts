import type { Chapter } from "../types";

export const sysdesTimeOrderingIds: Chapter = {
  id: "sysdes-time-ordering-ids",
  num: "A5",
  title: "Time, ordering and IDs",
  short: "Time, ordering and IDs",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle:
    "Machines disagree about what time it is, so a distributed design has to decide what to trust: the wall clock, a counter that only counts causes, or a clock that admits its own error.",
  body: `<h3>Two questions that sound like one</h3>
<p>
  Almost every distributed design silently asks one of two questions. The
  first is <em>what time is it?</em>, wanted for expiry, rate limits, logs and
  "created at". The second is <em>what happened before what?</em>, wanted for
  conflict resolution, replication order and transactions. On one machine the
  answers coincide: read the clock, and the later number happened later. Across
  machines they separate, because each machine has its own clock, and no
  message can tell one machine what another's clock says right now. The
  replication chapter's dry run already showed the cost: a write that really
  came 20 ms later lost a last-write-wins comparison because its node's clock
  ran 80 ms slow. This chapter is about that failure and its four remedies:
  sturdier use of physical clocks, logical clocks, hybrid clocks, and clocks
  that publish an error bar. It ends with the practical problem that depends
  on all of them, generating identifiers.
</p>

<h3>Two clocks in every computer, for different jobs</h3>
<p>
  Operating systems expose two kinds of clock, and mixing them up is a classic
  bug. On Linux the <b>real-time clock</b> (<code>CLOCK_REALTIME</code>) measures
  wall-clock time. It is settable, and the man page says it is affected by
  discontinuous jumps in the system time and by the incremental adjustments of
  NTP. The <b>monotonic clock</b> (<code>CLOCK_MONOTONIC</code>) is not settable and is
  not affected by discontinuous jumps, though it is still slewed (sped up or
  slowed down slightly) by NTP, and it does not count time while the system is
  suspended. Use the monotonic clock to measure a duration on one machine: a
  timeout, a latency, the age of a cache entry. Use the real-time clock only
  when you need a calendar time, and never assume two machines' real-time
  clocks can be compared exactly.
</p>
<div class="warn">
  <span class="ttl">⚠ A one-second step made a DNS resolver panic for about 6 hours 45 minutes</span>
  At the end of 31 December 2016 a leap second was added. Cloudflare's DNS
  software, written in Go, measured resolver round-trip times by subtracting two
  wall-clock readings. When the clock stepped back, some differences came out
  negative, the smoothed value went negative, and a random-number call that
  panics on negative input was reached. Only customers using CNAME records were affected, and at the peak about 0.2% of DNS queries were, between 00:00 and 06:45 UTC; the worst-hit machines were patched within 90 minutes. The root cause was the assumption that time cannot go backwards. (Go has tracked monotonic time inside <code>time.Time</code> values since version 1.9, so this exact bug cannot recur there, but the lesson applies to any language.)
</div>

<h3>How wrong can a clock be?</h3>
<p>
  Quartz oscillators drift. Google's Spanner paper applies a drift rate of 200 microseconds per second as its conservative worst-case bound for a server clock, which is not a small number:
</p>
<table>
  <tr><th>Time since last synchronisation</th><th>Arithmetic at 200 &micro;s per second</th><th>Possible error</th></tr>
  <tr><td>30 seconds (Spanner's poll interval)</td><td>30 &times; 200 &micro;s</td><td>6 ms</td></tr>
  <tr><td>1 hour</td><td>3,600 &times; 200 &micro;s</td><td>0.72 s</td></tr>
  <tr><td>1 day</td><td>86,400 &times; 200 &micro;s</td><td>17.28 s</td></tr>
</table>
<p>
  NTP keeps drift in check by polling servers and slewing the clock, and it
  works well, but not perfectly. RFC 5905 (NTPv4) says that typical primary
  servers are precise within a few tens of microseconds, typical clients on
  fast LANs within a few hundred microseconds, and, with poll intervals up to 36 hours, within a few tens of milliseconds. A cloud provider's own time
  service narrows this: Amazon runs the Amazon Time Sync Service from
  satellite-connected and atomic reference clocks in each Region, and it
  offers ClockBound, a daemon and library that reports the instance's clock
  error so you can check whether a timestamp is in the past or future relative
  to your clock. Across a fleet you should still budget for tens of milliseconds
  of disagreement in the worst case, and for rare, much larger excursions when
  a time source fails or a VM is paused and resumed.
</p>
<p>
  <b>Leap seconds</b> are a special hazard because UTC inserts an extra second
  and software must decide what the clock shows. The NTP protocol has a
  two-bit leap indicator warning that the last minute of the day will have 61 or 59 seconds. Google avoids the step by <b>smearing</b>: it spreads the
  extra second linearly over 24 hours, noon to noon UTC, so smeared time is just under 0.5 s behind UTC when the leap second begins and just under 0.5 s ahead when it ends, agreeing with UTC again at both ends of the window, with a frequency change of about 11.6 ppm (1 second in 86,400 is 11.57 parts per
  million). The consequence is that two machines can legally disagree by up to about half a second around a leap event if one smears and the other does not, which is why
  Amazon cautions against mixing smeared and non-smeared sources in one time
  client. The most recent leap second was at the end of 2016, and a 2022 resolution of the General Conference on Weights and Measures commits to abandoning them by or before 2035, as Amazon's documentation notes, but old data, old software and replayed history still carry the hazard.
</p>

<h4>Process pauses: the clock is right but the program is not looking</h4>
<p>
  Even a perfect clock does not help if the program stops looking at it. A
  garbage-collection pause, a VM migration, a laptop lid or a page fault storm
  can freeze a process between "check that my lease is valid" and "act on it".
  When it resumes, the lease may have expired and another node may hold the
  lock, yet this process still believes it is the leader. The consensus chapter
  explains the cure, the fencing token, which moves the check to the resource.
  The lesson for time is the same: never base a safety property on "no more than
  X milliseconds can pass between these two lines".
</p>

<h3>Logical time: order without clocks</h3>
<p>
  Lamport's 1978 paper begins from a different question. Instead of asking when
  an event happened, ask whether it <em>could have influenced</em> another. He
  defines <b>happened-before</b>: within one process, earlier events precede later
  ones; sending a message precedes receiving it; and the relation is transitive.
  Two events related by neither are <b>concurrent</b>. This is a partial order,
  not a timeline: it says only what could have caused what.
</p>
<p>
  A <b>Lamport clock</b> is a counter per process that obeys the paper's Clock
  Condition: if event a happened before b, then C(a) &lt; C(b). The rules are
  short: increment before each event; stamp every message with the counter;
  on receipt set the counter to the larger of its own and the message's, plus
  one. Breaking ties by process id turns the partial order into a total order
  that every node can compute alone. The catch is in the paper's own note: the
  converse does not hold. C(a) &lt; C(b) does not mean a happened before b, so a
  Lamport clock cannot tell a cause from a coincidence.
</p>
<p>
  A <b>vector clock</b> keeps one counter per process instead of one in total.
  Each process increments its own slot on every event and, on receipt, takes the
  element-wise maximum with the message's vector. Compare two vectors: if every
  slot of V1 is less than or equal to V2's, (and the two are not identical) then V1 happened before V2; if each is
  larger somewhere, the events are concurrent. That recovers exactly what the
  Lamport clock loses. The price is a vector the size of the number of writers.
  The Dynamo paper used vector clocks to detect conflicting versions of a key and
  returned both to the application, and it truncated the clock when it grew past
  a threshold (its example is 10 pairs), accepting that the ancestry check can
  blur.
</p>

<figure>
  <svg viewBox="0 0 640 310" class="dg" role="img" aria-label="Three processes P1, P2 and P3 on parallel timelines. P1 has a local event then sends message one to P2. P3 has an independent local event. P2 receives message one, then sends message two to P3, which receives it. Each event is labelled with a Lamport counter and a vector clock.">
    <g class="rough">
      <path class="ln dash" d="M60,60 L620,60" />
      <path class="ln dash" d="M60,150 L620,150" />
      <path class="ln dash" d="M60,240 L620,240" />
      <path class="lng" d="M240,60 L330,150" />
      <path class="lng" d="M440,150 L520,240" />
    </g>
    <g class="rough">
      <rect class="boxy" x="150" y="42" width="30" height="36" rx="5" />
      <rect class="boxy" x="210" y="42" width="30" height="36" rx="5" />
      <rect class="box"  x="330" y="132" width="30" height="36" rx="5" />
      <rect class="box"  x="410" y="132" width="30" height="36" rx="5" />
      <rect class="boxr" x="150" y="222" width="30" height="36" rx="5" />
      <rect class="box"  x="490" y="222" width="30" height="36" rx="5" />
    </g>
    <text class="lbl" x="30" y="64"  text-anchor="middle">P1</text>
    <text class="lbl" x="30" y="154" text-anchor="middle">P2</text>
    <text class="lbl" x="30" y="244" text-anchor="middle">P3</text>
    <text class="sm" x="165" y="36" text-anchor="middle">a</text>
    <text class="sm" x="225" y="36" text-anchor="middle">send m1</text>
    <text class="sm" x="345" y="126" text-anchor="middle">recv m1</text>
    <text class="sm" x="425" y="126" text-anchor="middle">send m2</text>
    <text class="sm rd" x="165" y="216" text-anchor="middle">c</text>
    <text class="sm" x="505" y="216" text-anchor="middle">recv m2</text>
    <text class="sm" x="165" y="96" text-anchor="middle">L1 [1,0,0]</text>
    <text class="sm" x="235" y="96" text-anchor="middle">L2 [2,0,0]</text>
    <text class="sm" x="345" y="186" text-anchor="middle">L3 [2,1,0]</text>
    <text class="sm" x="430" y="186" text-anchor="middle">L4 [2,2,0]</text>
    <text class="sm rd" x="165" y="276" text-anchor="middle">L1 [0,0,1]</text>
    <text class="sm" x="505" y="276" text-anchor="middle">L5 [2,2,2]</text>
    <text class="lbl rd" x="270" y="298" text-anchor="middle" style="font-size:14px">c has Lamport 1, below "send m1" at 2, yet the two are concurrent.</text>
  </svg>
  <figcaption>The Lamport counter orders c before send m1 although neither could have influenced the other. The vectors [0,0,1] and [2,0,0] each exceed the other somewhere, which reveals the concurrency.</figcaption>
</figure>

<h4>Dry run: the six events in the figure</h4>
<table>
  <tr><th>Event</th><th>Lamport rule</th><th>Lamport</th><th>Vector rule</th><th>Vector</th></tr>
  <tr><td>a: P1 local</td><td>0 + 1</td><td>1</td><td>P1 slot +1</td><td>[1,0,0]</td></tr>
  <tr><td>P1 sends m1 to P2</td><td>1 + 1</td><td>2</td><td>P1 slot +1</td><td>[2,0,0]</td></tr>
  <tr><td>c: P3 local</td><td>0 + 1</td><td>1</td><td>P3 slot +1</td><td>[0,0,1]</td></tr>
  <tr><td>P2 receives m1</td><td>max(0, 2) + 1</td><td>3</td><td>P2 slot +1 gives [0,1,0]; element-wise max with [2,0,0]</td><td>[2,1,0]</td></tr>
  <tr><td>P2 sends m2 to P3</td><td>3 + 1</td><td>4</td><td>P2 slot +1</td><td>[2,2,0]</td></tr>
  <tr><td>P3 receives m2</td><td>max(1, 4) + 1</td><td>5</td><td>P3 slot +1 gives [0,0,2]; element-wise max with [2,2,0]</td><td>[2,2,2]</td></tr>
  <tr><td>Is a before "P3 receives m2"?</td><td>1 &lt; 5, consistent but not proof</td><td>—</td><td>[1,0,0] &le; [2,2,2] in every slot: yes</td><td>Proven</td></tr>
  <tr><td>Are c and "P1 sends m1" ordered?</td><td>1 &lt; 2 suggests so</td><td>—</td><td>[0,0,1] vs [2,0,0]: each is larger in some slot: concurrent</td><td>Concurrent</td></tr>
</table>

<h3>Hybrid logical clocks: timestamps that look like time and respect causes</h3>
<p>
  Lamport and vector clocks cannot answer "what was the state at 14:00?",
  because their numbers are unrelated to the wall clock. Physical clocks answer
  that but can invert causes. The <b>hybrid logical clock</b> (HLC), proposed by
  Kulkarni and colleagues, keeps a pair (l, c): l is the largest physical time
  the node has seen, from its own clock or from any message, and c is a counter
  that breaks ties when l does not move. It fits in 64 bits, stays close to the
  physical clock, and is built to coexist with NTP. The paper's rules are:
</p>
<ul>
  <li><b>Local or send event:</b> set l to the larger of the old l and the physical time. If l did not change, increment c; otherwise reset c to 0.</li>
  <li><b>Receive event:</b> set l to the largest of the old l, the message's l and the physical time. If l equals both the old l and the message's l, c is the larger of the two c values plus one; if it equals only the old l, increment c; if it equals only the message's l, take the message's c plus one; otherwise reset c to 0.</li>
</ul>
<p>
  Compare timestamps as pairs, l first, then c. The effect is that a node whose
  clock is slow never produces a timestamp lower than something it has already
  heard about.
</p>
<h4>Dry run: the slow clock, when the later write is causally after</h4>
<p>
  This is a variant of the replication chapter's scenario in which B has already
  received A's update before it writes, so B's write is causally later and its
  stamp is 9.980 (true time 10.060) instead of the concurrent 9.940.
</p>
<table>
  <tr><th>Step</th><th>Node, physical time</th><th>Prior (l, c)</th><th>Rule applied</th><th>New (l, c)</th></tr>
  <tr><td>1. A writes</td><td>A, 10.000</td><td>(0, 0)</td><td>l = max(0, 10.000) = 10.000, changed, so c = 0</td><td>(10.000, 0)</td></tr>
  <tr><td>2. B receives A's update (B's clock is 80 ms slow)</td><td>B, 9.960</td><td>(9.900, 0)</td><td>l = max(9.900, 10.000, 9.960) = 10.000, equal to the message's l only, so c = 0 + 1</td><td>(10.000, 1)</td></tr>
  <tr><td>3. B writes, causally after A</td><td>B, 9.980</td><td>(10.000, 1)</td><td>l = max(10.000, 9.980) = 10.000, unchanged, so c = 1 + 1</td><td>(10.000, 2)</td></tr>
  <tr><td>4. Compare the two writes</td><td>—</td><td>—</td><td>(10.000, 2) beats (10.000, 0)</td><td>B's later write wins; its raw wall time, 9.980, would have lost</td></tr>
  <tr><td>5. B's clock moves on</td><td>B, 10.010</td><td>(10.000, 2)</td><td>l = max(10.000, 10.010) = 10.010, changed, so c = 0</td><td>(10.010, 0)</td></tr>
</table>
<p class="sub">
  HLC fixes a causally later write receiving an earlier stamp. It does not fix
  truly concurrent writes, as in the replication chapter, where B never saw A's
  write: one of the two still has to lose or be merged. CockroachDB is a
  real user. Its documentation describes each node's HLC as a physical part
  always close to local wall time plus a logical part for ties, and warns that
  clock skew beyond the configured maximum offset can violate single-key
  linearizability between causally dependent transactions (serializability at SERIALIZABLE isolation holds regardless). A node whose clock is out of sync with at least half of the
  others by 80% of the maximum offset shuts itself down, so a bad clock cannot
  silently corrupt the order.
</p>

<h3>TrueTime: a clock that reports its own error</h3>
<p>
  Spanner takes the opposite route to logical clocks: make physical time
  trustworthy enough, and expose its uncertainty. <b>TrueTime</b>'s
  <code>TT.now()</code> returns an interval, [earliest, latest], that is
  guaranteed to contain the true time. Half the width is the error bound &epsilon;, so the interval is 2&epsilon; wide.
  Google's time masters use GPS receivers and atomic clocks (it calls the
  atomic-clock masters "Armageddon masters"), and each machine's daemon polls
  several of them, rejects liars, and advertises a slowly growing uncertainty
  between polls. In the paper, &epsilon; is typically a sawtooth varying from
  about 1 to 7 ms over each 30-second poll interval, which is 4 ms most of the
  time. The arithmetic is visible: 30 s &times; 200 &micro;s/s = 6 ms of
  drift allowance, which accounts for the sawtooth between 0 and 6 ms, and the
  remaining 1 ms is communication delay to the time masters.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A timeline showing the TrueTime interval at commit, with earliest and latest bounds. The commit timestamp s is chosen at the latest bound. The coordinator waits until earliest has passed s before releasing locks and acknowledging, so a later transaction anywhere sees a larger timestamp.">
    <g class="rough">
      <path class="ln" d="M24,150 L616,150" />
      <path class="ln dash" d="M200,60 L200,210" />
      <path class="ln dash" d="M340,60 L340,210" />
      <path class="ln dash" d="M480,60 L480,210" />
    </g>
    <g class="rough">
      <rect class="boxy" x="200" y="96" width="140" height="40" rx="5" />
      <rect class="boxr" x="340" y="96" width="140" height="40" rx="5" />
    </g>
    <text class="sm" x="270" y="120" text-anchor="middle">interval, width 2ε</text>
    <text class="sm rd" x="410" y="120" text-anchor="middle">commit wait</text>
    <text class="sm" x="200" y="52" text-anchor="middle">TT.now().earliest</text>
    <text class="sm" x="340" y="52" text-anchor="middle">s = latest</text>
    <text class="sm" x="480" y="52" text-anchor="middle">TT.after(s) true</text>
    <text class="sm gr" x="480" y="178" text-anchor="middle">release locks, reply to client</text>
    <text class="sm" x="270" y="178" text-anchor="middle">choose s as the commit timestamp</text>
    <text class="lbl" x="320" y="214" text-anchor="middle" style="font-size:15px">Wait until s is surely in the past everywhere, then let anyone see the commit.</text>
    <text class="sm" x="320" y="238" text-anchor="middle">The wait costs milliseconds, not round trips; the paper measured about 5 ms of commit wait.</text>
  </svg>
  <figcaption>External consistency by waiting: if the next transaction starts after this one is acknowledged, its timestamp is guaranteed to be larger.</figcaption>
</figure>

<p>
  The protocol follows. A read-write transaction picks a commit timestamp s no
  earlier than <code>TT.now().latest</code>, then the coordinator waits until
  <code>TT.after(s)</code> is true before applying the commit and replying. By
  then s is in the past on every machine, so any transaction that starts after
  the client hears "committed" gets a larger timestamp. That is Spanner's
  <b>external consistency</b>, the strict serializability described in the
  consistency models chapter. The expected wait is at least 2&epsilon;, and the paper says it is typically overlapped with the Paxos communication; in its one-replica experiments commit wait was about 5 ms and Paxos latency about 9 ms. It also explains why
  TrueTime matters for the engineering trade: Spanner pays with specialised time
  hardware; CockroachDB, running on ordinary NTP clocks, accepts a configured maximum offset and restarts reads that fall inside an uncertainty interval, and its documentation says that skew beyond the bound can break single-key linearizability between causally dependent transactions.
</p>

<h3>Generating IDs: uniqueness, order and no coordination</h3>
<p>
  Every row, message and event needs an identifier, and generating one is a
  time-and-ordering problem in disguise: you want values that are unique
  without a round trip to a central allocator, roughly sortable by creation
  time so indexes stay cheap, and compact. No scheme gets all three for free.
</p>
<table>
  <tr><th>Scheme</th><th>How it works</th><th>Strengths</th><th>Costs</th></tr>
  <tr><td><b>Database sequence or auto-increment</b></td><td>One counter in one database hands out the next integer</td><td>Compact, strictly increasing from that counter, trivially unique</td><td>Single point of contention and failure. PostgreSQL's manual says a value obtained is not reclaimed if the transaction aborts, so aborts and crashes leave gaps and sequences cannot be gapless. Reveals volume</td></tr>
  <tr><td><b>Ticket server</b> (Flickr)</td><td>Dedicated MySQL tables with an auto-increment column; <code>REPLACE INTO</code> then <code>LAST_INSERT_ID()</code>. Two servers split odd and even numbers (<code>auto-increment-increment = 2</code>) and clients round-robin</td><td>Simple, compact, survives one server down</td><td>An extra network hop per ID, a service to run, and the two servers' numbers drift slightly apart, so order across them is approximate</td></tr>
  <tr><td><b>UUIDv4</b></td><td>122 random bits in a 128-bit value (RFC 9562)</td><td>No coordination at all</td><td>No order, 16 bytes, and random insertion points give poor index locality. The RFC notes the effect can be an order of magnitude or more against time-ordered values</td></tr>
  <tr><td><b>UUIDv7</b></td><td>48-bit Unix millisecond timestamp, then version, 12 bits and 62 bits of random or counter data, with variant bits (74 usable bits)</td><td>Sortable, standard, index-friendly. PostgreSQL's documentation (version 18 and later) lists a <code>uuidv7()</code> function, which uses part of the 12-bit field for a sub-millisecond timestamp</td><td>Exposes creation time. The RFC says not to assume UUIDs are hard to guess, and recommends v4 where unpredictability matters</td></tr>
  <tr><td><b>ULID</b></td><td>48-bit millisecond timestamp plus 80 random bits, written as 26 Crockford base32 characters; within one millisecond the random part is incremented to stay monotonic</td><td>Sortable as a string, shorter text than the 36-character UUID form</td><td>Same timestamp leak; a community specification rather than an IETF standard</td></tr>
  <tr><td><b>Snowflake-style</b></td><td>Twitter's layout: 41-bit millisecond timestamp from a custom epoch, 10-bit machine id, 12-bit sequence, in 63 bits</td><td>64-bit integers, time-sorted, no per-ID coordination</td><td>Needs a unique machine id per generator, and depends on the clock never going back</td></tr>
</table>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Bit layouts drawn as segmented bars. Snowflake: 41 bits of time, 10 of machine, 12 of sequence. UUIDv7: 48 bits of time, 4 version, 12 random A, 2 variant, 62 random B. ULID: 48 bits of time and 80 of randomness. Each bar is drawn to its own scale.">
    <g class="rough">
      <rect class="boxg" x="40"  y="40"  width="364" height="34" rx="4" />
      <rect class="boxy" x="404" y="40"  width="89"  height="34" rx="4" />
      <rect class="box"  x="493" y="40"  width="107" height="34" rx="4" />
      <rect class="boxg" x="40"  y="110" width="210" height="34" rx="4" />
      <rect class="box"  x="250" y="110" width="18"  height="34" rx="4" />
      <rect class="boxy" x="268" y="110" width="52"  height="34" rx="4" />
      <rect class="box"  x="320" y="110" width="9"   height="34" rx="4" />
      <rect class="boxy" x="329" y="110" width="271" height="34" rx="4" />
      <rect class="boxg" x="40"  y="180" width="210" height="34" rx="4" />
      <rect class="boxy" x="250" y="180" width="350" height="34" rx="4" />
    </g>
    <text class="lbl" x="40" y="30">Snowflake, 63 bits</text>
    <text class="sm" x="222" y="62" text-anchor="middle">41 time</text>
    <text class="sm" x="448" y="62" text-anchor="middle">10 machine</text>
    <text class="sm" x="546" y="62" text-anchor="middle">12 sequence</text>
    <text class="lbl" x="40" y="100">UUIDv7, 128 bits</text>
    <text class="sm" x="145" y="132" text-anchor="middle">48 time</text>
    <text class="sm" x="294" y="132" text-anchor="middle">12</text>
    <text class="sm" x="465" y="132" text-anchor="middle">62 random or counter</text>
    <text class="lbl" x="40" y="170">ULID, 128 bits</text>
    <text class="sm" x="145" y="202" text-anchor="middle">48 time</text>
    <text class="sm" x="425" y="202" text-anchor="middle">80 random</text>
    <text class="sm" x="320" y="238" text-anchor="middle">Not to a common scale. The small UUIDv7 boxes are the 4 version and 2 variant bits.</text>
  </svg>
  <figcaption>The time field sits first in all three, so sorting by value sorts by creation time. What fills the rest is where they differ.</figcaption>
</figure>

<h4>Dry run: what the bit counts allow</h4>
<table>
  <tr><th>Question</th><th>Arithmetic</th><th>Result</th></tr>
  <tr><td>How long does a 41-bit millisecond timestamp last?</td><td>2<sup>41</sup> = 2,199,023,255,552 ms &divide; (1,000 &times; 86,400 &times; 365.25)</td><td>about 69.7 years, which matches the "69 years" in Snowflake's description</td></tr>
  <tr><td>How many machines does a 10-bit id allow?</td><td>2<sup>10</sup></td><td>1,024</td></tr>
  <tr><td>How many IDs per millisecond per machine?</td><td>2<sup>12</sup>, the sequence "rolls over every 4096"</td><td>4,096, or 4,096,000 a second per machine</td></tr>
  <tr><td>Fleet ceiling with 1,024 machines</td><td>4,096,000 &times; 1,024</td><td>4,194,304,000 a second, far above any real demand</td></tr>
  <tr><td>Chance that a trillion UUIDv4s contain a duplicate</td><td>n(n&minus;1) &divide; (2 &times; 2<sup>122</sup>) with n = 10<sup>12</sup></td><td>about 9.4 &times; 10<sup>&minus;14</sup>, negligible</td></tr>
  <tr><td>IDs before a UUIDv4 collision is as likely as not</td><td>about 1.18 &times; &radic;(2<sup>122</sup>)</td><td>about 2.7 &times; 10<sup>18</sup></td></tr>
  <tr><td>Random bits per millisecond in the RFC's pure-random UUIDv7</td><td>12 + 62</td><td>74 bits, so collisions inside one millisecond need around 2<sup>37</sup> IDs in that same millisecond</td></tr>
</table>

<h4>The hazards, which are all clock hazards</h4>
<ul>
  <li><b>The clock goes backwards.</b> A time-based ID generator that sees an earlier clock reading may reuse a timestamp and sequence, producing a duplicate. The archived Snowflake design refuses to generate IDs until the clock passes the last time it used. Do the same: stall, or fail loudly, never reuse.</li>
  <li><b>Two generators share a machine id.</b> Snowflake-style schemes assume each worker id is unique. Assign ids from a coordination service with a lease, or from a fixed configuration, not from hostnames that can repeat.</li>
  <li><b>Order is approximate across machines.</b> IDs from different machines are sorted only to within their clock skew. If two events must be ordered exactly, use a per-entity sequence or a log, not the timestamp inside an ID. This is the same limit as last-write-wins.</li>
  <li><b>IDs leak information.</b> A sequence reveals volume, a time-based ID reveals creation time. Do not use either as a secret or an access token.</li>
  <li><b>Index locality.</b> Random primary keys cause random page inserts in a B-tree, as the storage engines chapter describes; time-prefixed IDs append at the right-hand edge. Conversely, a monotonically increasing key makes all inserts hit one shard in a range-partitioned table, a hot-spot the sharding chapter covers.</li>
</ul>

<h3>Choosing</h3>
<table>
  <tr><th>Need</th><th>Reach for</th><th>Because</th></tr>
  <tr><td>A duration, timeout or latency on one machine</td><td>The monotonic clock</td><td>Not stepped by NTP jumps; check how it treats suspend (Linux has CLOCK_BOOTTIME for that)</td></tr>
  <tr><td>Calendar time for display or coarse expiry</td><td>The wall clock, with NTP, and slack in the comparison</td><td>Clocks disagree by milliseconds to seconds</td></tr>
  <tr><td>Decide which of two writes is later, across nodes</td><td>Per-entity version numbers, a hybrid logical clock, or a consensus log, not raw wall time</td><td>Wall-clock last-write-wins loses causally later writes</td></tr>
  <tr><td>Detect that two versions are concurrent</td><td>Version vectors (or vector clocks), accepting the metadata cost</td><td>Only they distinguish "after" from "concurrent"</td></tr>
  <tr><td>Strict global transaction order</td><td>Spanner-style bounded clocks with commit wait, or a single sequencer</td><td>Pay a few milliseconds, or one hot component</td></tr>
  <tr><td>Primary keys for a sharded OLTP table</td><td>UUIDv7 or Snowflake-style 64-bit IDs</td><td>Unique without coordination, mostly time-sorted, index friendly</td></tr>
  <tr><td>Unguessable public identifiers</td><td>UUIDv4, or random tokens, kept apart from the primary key</td><td>No embedded time or counter</td></tr>
</table>

<div class="say">
  <span class="ttl">Say it like this →</span> "I won't compare wall-clock times
  from two machines to decide which write is newer. NTP keeps them within
  milliseconds on a good day, but a slow clock makes a later write look
  earlier, and a pause or leap second can make it worse. I'll attach a version
  to each record and, where I need physical-looking timestamps, use a hybrid
  logical clock, so a node that has seen a write never stamps anything
  earlier. For IDs I'd use time-prefixed 64-bit IDs, Snowflake-style, with a
  leased worker id and a guard that refuses to issue IDs if the clock moves
  backwards, so primary keys are unique, index-friendly and need no central
  allocator."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Signals:</b> "last write wins", "order of events", "timestamps", "unique ID", "expires at", "leader lease", "audit log". Each needs you to say whose clock and how wrong it can be.</li>
  <li><b>The naive design</b> uses <code>now()</code> on each server for ordering. Ask yourself what happens when one server's clock is 80 ms slow, or steps back a second.</li>
  <li><b>Quantify the error budget.</b> Drift of 200 &micro;s a second is 6 ms per 30 seconds and 17 seconds a day without correction; NTP over the Internet gives tens of milliseconds; TrueTime gives 1 to 7 ms with special hardware. Pick a mechanism whose error is below the gap you need to resolve.</li>
  <li><b>Pick the weakest tool that works:</b> a per-entity counter if one writer owns the entity, version vectors if you must detect concurrency, an HLC if you need time-like stamps, a consensus log or TrueTime only if you need a global order.</li>
  <li><b>For IDs</b> state the layout and the failure mode: bits for time, worker and sequence, how worker ids are assigned, and what happens when the clock goes back.</li>
  <li><b>The pitfall to avoid:</b> using timestamps for ordering and also for expiry without noticing they need different clocks, wall for the first and monotonic for the second.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain when to use the monotonic clock and when the real-time clock, and what happened to Cloudflare's DNS when it mixed them up.</li>
    <li>Work out how far a 200 &micro;s per second clock can drift in an hour, and why Spanner needs a poll interval of seconds, not minutes.</li>
    <li>Run a Lamport clock and a vector clock on a small message diagram, and show an example where Lamport order is misleading and the vectors are not.</li>
    <li>Apply the HLC rules to a receive event on a node whose clock is behind, and explain what the counter c does.</li>
    <li>Describe how TrueTime's commit wait gives external consistency, and compute the lifetime and per-millisecond capacity of a 41-bit, 12-bit-sequence Snowflake ID.</li>
  </ul>
</div>

<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://lamport.azurewebsites.net/pubs/time-clocks.pdf" rel="noopener noreferrer">Lamport: Time, Clocks, and the Ordering of Events in a Distributed System (1978)</a> — happened-before, the Clock Condition, logical clocks and the total order</li>
    <li><a href="https://cse.buffalo.edu/tech-reports/2014-04.pdf" rel="noopener noreferrer">Kulkarni et al.: Logical Physical Clocks and Consistent Snapshots in Globally Distributed Databases</a> — the hybrid logical clock algorithm</li>
    <li><a href="https://research.google/pubs/spanner-googles-globally-distributed-database-2/" rel="noopener noreferrer">Spanner paper (OSDI 2012)</a> — TrueTime, the 200 &micro;s/s drift bound, the 1 to 7 ms uncertainty, commit wait</li>
    <li><a href="https://docs.cockroachlabs.com/docs/stable/architecture/transaction-layer" rel="noopener noreferrer">CockroachDB: transaction layer</a> — hybrid-logical clocks, maximum clock offset, read uncertainty</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc5905" rel="noopener noreferrer">RFC 5905: Network Time Protocol version 4</a> — precision figures, strata and the leap indicator</li>
    <li><a href="https://developers.google.com/time/smear" rel="noopener noreferrer">Google Public NTP: leap smear</a> — the 24-hour linear smear and its half-second bound</li>
    <li><a href="https://blog.cloudflare.com/how-and-why-the-leap-second-affected-cloudflare-dns/" rel="noopener noreferrer">Cloudflare: how and why the leap second affected DNS</a> — a negative duration from a stepped wall clock</li>
    <li><a href="https://man7.org/linux/man-pages/man3/clock_gettime.3.html" rel="noopener noreferrer">Linux clock_gettime(3)</a> — CLOCK_REALTIME against CLOCK_MONOTONIC</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc9562" rel="noopener noreferrer">RFC 9562: Universally Unique IDentifiers</a> — UUIDv4 and UUIDv7 layouts, monotonicity, index locality, security notes</li>
    <li><a href="https://github.com/ulid/spec" rel="noopener noreferrer">ULID specification</a> — 48-bit time, 80-bit randomness, 26-character encoding, monotonic sort</li>
    <li><a href="https://github.com/twitter-archive/snowflake/tree/snowflake-2010" rel="noopener noreferrer">Twitter Snowflake (archived)</a> — 41-bit time, 10-bit machine, 12-bit sequence, refusing to issue IDs when the clock goes back</li>
    <li><a href="https://code.flickr.net/2010/02/08/ticket-servers-distributed-unique-primary-keys-on-the-cheap/" rel="noopener noreferrer">Flickr: ticket servers</a> — auto-increment tables on two MySQL servers, odd and even</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources, and against the Dynamo paper, PostgreSQL's sequence and UUID documentation and the Amazon Time Sync Service pages, in October 2026. Drift arithmetic uses the Spanner paper's 200 &micro;s per second bound; the 10<sup>12</sup> UUID example is illustrative.</p>
</div>`,
};
