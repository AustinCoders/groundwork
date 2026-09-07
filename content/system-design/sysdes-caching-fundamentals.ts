import type { Chapter } from "../types";

export const sysdesCachingFundamentals: Chapter = {
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
};
