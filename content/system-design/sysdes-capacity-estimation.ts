import type { Chapter } from "../types";

export const sysdesCapacityEstimation: Chapter = {
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
};
