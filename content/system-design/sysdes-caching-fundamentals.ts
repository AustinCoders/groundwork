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
    "A cache is one bet placed at six distances — and the interesting number is never the hit rate, it's the miss rate.",
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
    <text class="sm gr" x="580" y="134" text-anchor="middle">0.1-1 ms</text>
    <text class="sm rd" x="580" y="203" text-anchor="middle">SSD 0.1-1 ms</text>
    <text class="sm" x="262" y="160" text-anchor="middle">each layer removes work from every layer to its right</text>
    <text class="sm" x="262" y="182" text-anchor="middle">the leftmost hit saves the most work — and is the hardest to invalidate</text>
    <text class="sm" x="262" y="204" text-anchor="middle">a full miss pays every hop, not just the last one</text>
  </svg>
  <figcaption>The numbers are what the asker pays, so they are not one monotonic scale: the first two are the user's network distance, the rest are your servers' lookup costs (an in-process hit at ~100 ns beats a CDN hit, but it saves no user network time). What does move monotonically is the asymmetry: the further left a hit lands, the more work it removes, and the harder it is to revoke a stale copy.</figcaption>
</figure>

<h3>What each layer actually buys you</h3>
<table>
  <tr><th>Layer</th><th>Caches</th><th>Typical TTL</th><th>Who can invalidate it</th><th>What it really buys</th></tr>
  <tr><td>Browser / HTTP cache</td><td>Static assets, GET responses, service-worker data</td><td>Minutes to a year (fingerprinted assets)</td><td><b>Nobody.</b> Once served, it is gone until it expires</td><td>Removes the request entirely — no network, no server work at all</td></tr>
  <tr><td>CDN edge</td><td>Assets, whole pages, API GETs, images</td><td>Seconds to days</td><td>You, via purge — propagation is sub-second to a few seconds on modern CDNs (Cloudflare reports a p50 under 150 ms for tag purge); budget tens of seconds for slow or tiered setups</td><td>Cuts a distant user's RTT (70-230 ms cross-region) to a nearby edge's 10-30 ms, and can absorb 80-99% of requests for highly cacheable content before they reach your region</td></tr>
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
  often still a several-fold latency win (workload-dependent; measure it), but say <em>why</em>, because "the database
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

  <span class="c">// null is the miss signal. Test for it explicitly. The classic bug is testing</span>
  <span class="c">// the *deserialised* value for truthiness (or a client that returns raw</span>
  <span class="c">// values): a legitimately cached 0, "" or false then looks like a miss.</span>
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
  cache-aside, Redis being down <em>can</em> degrade to slow, because the
  application can fall through to the database; with read-through, Redis
  being down means down unless the cache layer itself has a bypass. But
  "degrades to slow" only holds while the database can absorb the full read
  load, and at a 99% hit rate it usually cannot (see the node-loss box
  below). So the real answer when an interviewer asks which you'd pick is:
  cache-aside gives you the option of failing open, and you still need load
  shedding to make that option survivable.
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
  <tr><td><b>FIFO / random</b></td><td>Nothing in particular</td><td>Nothing badly, surprisingly</td><td>You need O(1) with zero bookkeeping; random is a sensible choice when keys are accessed roughly uniformly (Redis docs: a repeating cycle), and worse than LRU on skewed workloads</td></tr>
  <tr><td><b>TTL-only (volatile-ttl)</b></td><td>Entries furthest from expiry</td><td>Keys written without a TTL — they become unevictable</td><td>Every entry genuinely has a natural lifetime</td></tr>
  <tr><td><b>W-TinyLFU (Caffeine)</b></td><td>Whatever a frequency sketch says earns its slot</td><td>Very little; near-optimal hit rates</td><td>In-process JVM caches where the extra few percent of hit rate is worth a real library</td></tr>
</table>
<p>
  Two implementation details worth knowing because they get asked. First,
  Redis does not implement true LRU: it samples a handful of keys
  (<code>maxmemory-samples</code>, default 5) and evicts the least recently
  used <em>of the sample</em>. Redis's docs describe it as a close
  approximation of true LRU (a sample size of 10 gets very close, at some extra
  CPU), and minimal or no difference on power-law access, for much less
  bookkeeping memory. It is a nice example of the
  approximate-is-fine reasoning these systems are built on. Second, Redis LFU
  counters are 8-bit probabilistic counters with logarithmic increment and
  time-based decay — you cannot store a true frequency for a billion keys, so
  you store something that ranks them well enough and costs one byte.
</p>

<h4>Dry run: an LRU cache, capacity 3, through five operations</h4>
<table>
  <tr><th>#</th><th>Operation</th><th>Result</th><th>Cache after (MRU → LRU)</th></tr>
  <tr><td>1</td><td>GET a</td><td>miss — load, insert</td><td>[a]</td></tr>
  <tr><td>2</td><td>GET b</td><td>miss — load, insert</td><td>[b, a]</td></tr>
  <tr><td>3</td><td>GET c</td><td>miss — load, insert (cache now full)</td><td>[c, b, a]</td></tr>
  <tr><td>4</td><td>GET a</td><td>hit — <code>a</code> is promoted to most-recently-used</td><td>[a, c, b]</td></tr>
  <tr><td>5</td><td>GET d</td><td>miss — cache full, evict the LRU entry (<code>b</code>), insert <code>d</code></td><td>[d, a, c]</td></tr>
</table>
<p class="sub">
  Step 5 is the whole policy in one row: <code>b</code> was the least
  recently touched, not the oldest — <code>a</code> was inserted before it
  but survives because a hit re-promotes it. LRU tracks recency of access,
  not age, which is exactly why it breaks on a single cold scan: a query that
  touches a million rows once each promotes all of them ahead of your
  actually-hot keys.
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
  <li><b>Versioned keys.</b> The strongest pattern. Never mutate an entry — put the version in the key: <code>user:42:v17</code>, where 17 comes from a row counter, an ETag, or the row's <code>updated_at</code>. A write bumps the version, so new readers ask for a key nobody has written stale data into. The race above becomes harmless <em>provided readers learn the current version from an authoritative source</em>: A's stale <code>SET</code> lands on <code>v16</code>, which no reader asks for once they know the current version is 17. The catch is that "learn the current version" is itself a read of authoritative state (a cheap version-column or ETag lookup). If you cache that version pointer, you have moved the staleness problem up one level rather than removed it. Old entries cost memory until eviction reaps them.</li>
  <li><b>Explicit purge / surrogate keys.</b> What CDNs give you: tag a response <code>product:42</code> and purge every edge copy carrying that tag in one call. Essential at the CDN layer, but remember purge is itself a distributed system — it is fast on modern CDNs (sub-second to a few seconds) and it can still fail or lag.</li>
  <li><b>CDC-driven invalidation.</b> Tail the database's write-ahead log (Debezium and friends) and emit invalidations from there. This is the only approach where invalidation is derived from <em>committed</em> state, in commit order, with no dual write. It costs you a pipeline; buy it when correctness matters more than simplicity. The principle behind it: treat the cache as <em>derived data</em> built from one authoritative write, not as a second place you also write (a dual write, which can diverge on any partial failure).</li>
  <li><b>Leases.</b> Facebook's memcache fix for exactly the race above: a miss returns a lease token to the one reader allowed to repopulate, and a delete invalidates outstanding tokens, so the stale <code>SET</code> from reader A is rejected. The same token rate-limits stampedes (see the Facebook paper in the sources).</li>
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
  You can purge Redis in a millisecond and a CDN in about a second or a few, but a
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
  usually does the work before anyone has to wait for it (the technique is from
  Vattani et al., VLDB 2015, linked below).
</p>
<p class="sub">
  Vocabulary you will hear, and which failure each word names: <b>penetration</b>
  is requests for keys that never exist (fix: negative caching, a Bloom filter);
  <b>breakdown</b> is one hot key expiring (fix: coalescing, refresh-ahead);
  <b>avalanche</b> is many keys expiring together, or the whole cache tier going
  away (fix: jittered TTLs, replicas, a gutter pool, load shedding). Two more
  operational notes: a freshly started or flushed cache is a 0% hit-rate
  cache, so warm it from replayed traffic or ramp traffic onto it gradually
  rather than cutting over cold; and a cache tier is a single point of failure
  unless you have sized the database for its absence.
</p>

<h3>Hit-rate arithmetic: why 90% is not a good number</h3>
<p>
  This is the section that wins interviews, because almost nobody does the
  arithmetic. Take a read tier serving <b>500,000 reads/sec</b>, backed by
  replicas that each sustain about <b>20,000 simple indexed point reads/sec</b>.
  That is this course's conservative planning figure, not a limit: strong
  hardware does several times more, and OpenAI runs ChatGPT on one Azure
  PostgreSQL primary plus nearly 50 replicas at millions of aggregate queries
  per second. Measure your own.
</p>
<table>
  <tr><th>Hit rate</th><th>Miss rate</th><th>Reads reaching the database</th><th>Replicas required</th></tr>
  <tr><td>90%</td><td>10%</td><td>500,000 × 0.10 = <b>50,000/s</b></td><td>50,000 ÷ 20,000 = 2.5, so <b>3</b></td></tr>
  <tr><td>95%</td><td>5%</td><td>500,000 × 0.05 = <b>25,000/s</b></td><td>25,000 ÷ 20,000 = 1.25, so <b>2</b></td></tr>
  <tr><td>99%</td><td>1%</td><td>500,000 × 0.01 = <b>5,000/s</b></td><td><b>1</b>, at 25% utilisation</td></tr>
  <tr><td>99.9%</td><td>0.1%</td><td>500,000 × 0.001 = <b>500/s</b></td><td><b>1</b>, at 2.5% utilisation</td></tr>
</table>
<p>
  Going from 90% to 99% is described in conversation as "nine percentage
  points". In load terms it is a <b>10× reduction</b> and it takes you from
  three replicas to one. Going the other way is worse: a hit rate slipping from
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
  <li>And the percentile that matters: at a 10% miss rate, <b>every request above p90 is a cache miss by definition</b>. Your p95 and p99 are not "the cache is a bit slower sometimes" — they are raw database latency, including its tail. At a 99% hit rate the miss tail begins exactly at p99, so p99 sits on the boundary between cache and database latency; you need roughly a 99.9% hit rate before p99 is a pure cache hit and only p99.9 is the database.</li>
</ul>
<div class="warn">
  <span class="ttl">⚠ The failure nobody sizes for: losing a cache node</span>
  Five Redis nodes, 99% hit rate, 5,000 reads/sec reaching the database.
  One node dies. Its 20% of the keyspace (this already assumes consistent
  hashing; with naive modulo hashing nearly every key would move and the
  miss rate would approach 100%) now misses on every request, so the
  new miss rate is 0.20 + 0.80 × 0.01 = <b>0.208</b>, and the database
  receives 500,000 × 0.208 = <b>104,000 reads/sec</b> — a <b>20.8×</b> spike
  against a tier provisioned for 5,000, and more than five times what one
  20,000/s replica serves. The database falls over, the cache
  cannot be refilled, and the outage is now self-sustaining. This is how
  cache tiers kill databases. Consistent hashing is what <em>caps the damage
  at the lost node's share</em>; it does not remove it. What shrinks the
  spike: replicas of the hot shards, a small <em>gutter pool</em> of spare
  cache servers that temporarily takes over a failed node's keys with short
  TTLs (Facebook's memcache design), request coalescing and leases so a
  thousand misses on one key become one query, and load shedding at the
  origin. Be honest that your database floor is set by your
  <em>degraded</em> miss rate, not your healthy one.
</div>
<p class="sub">
  Sizing follows the same logic in reverse. Hit rate is a function of how
  much of the working set fits in memory, and real access distributions are
  Zipf-ish: often roughly the top 20% of keys serve 80% of requests. That means the first
  gigabyte buys you an enormous amount and the climb from 90% to 99% can cost
  several times the memory (workload-dependent; this is an illustrative
  shape, not a measured constant), because you are now paying to hold the long tail. Knowing
  where you are on that curve is what makes "should we double the cache?" a
  calculable question rather than an argument.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Any prompt with a heavy read:write skew (news feed, product catalogue, URL shortener, profile service) is a caching problem before it is a database problem. State the ratio, then state the miss rate you're targeting and the load that leaves — do not just say "add Redis."</li>
  <li>A naive design adds a cache and stops there: no TTL policy, no invalidation story, no eviction policy, no stampede protection, and no answer for what happens when a cache node dies. Each of those is a follow-up question the interviewer already has queued.</li>
  <li>Distinguish caching from <b>replication</b>: a read replica is authoritative and eventually consistent; a cache is non-authoritative and arbitrarily stale. If the prompt needs "must reflect the last write", a replica with read-your-writes routing is the answer, not a cache.</li>
  <li>Distinguish it from a <b>CDN</b> question: if the payload is large, static and geographically distributed, the win is bandwidth and RTT at the edge, not query offload. Different layer, different invalidation story, same bet.</li>
  <li>Hot-key language ("a celebrity posts", "a flash sale", "one video goes viral") is the interviewer explicitly asking for stampede handling and hot-key mitigation — coalescing, a per-instance L1 in front of the shared tier, key splitting, or replicating the one hot key across several cache nodes so no single node carries it.</li>
  <li>Pitfall: caching writes. If the prompt is write-heavy or the data is read once and never again, a cache adds latency and memory cost for nothing. Say "I would not cache this, and here's why" at least once during a loop — knowing where a cache does not belong reads as strongly as knowing where it does.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Can you explain why a cache hit must be detected with an explicit miss check (<code>!== null</code>), not by testing the cached value for truthiness, and what breaks when a legitimate <code>0</code> or empty string is cached?</li>
    <li>Can you compute how database load changes when hit rate drops from 99% to 90%, and explain why you should reason in miss rate, not hit rate?</li>
    <li>Can you name which invalidation pattern — TTL, delete-not-update, versioned keys — fits a given scenario, and why the others don't?</li>
    <li>Can you say what happens to the database when the cache tier fails, and which of coalescing, a gutter pool, replicas or load shedding you would use to survive it?</li>
    <li>Can you compute what happens to your database when one node in a 5-node, 99%-hit-rate Redis cluster dies?</li>
    <li>Can you trace an LRU cache's contents through a short sequence of gets on a small, fixed-capacity cache?</li>
  </ul>
</div>
<div class="bx is-ref">
  <span class="ttl">Sources and further reading</span>
  <ul>
    <li><a href="https://www.usenix.org/conference/nsdi13/technical-sessions/presentation/nishtala" rel="noopener noreferrer">Scaling Memcache at Facebook (NSDI 2013)</a> — leases against stale sets and stampedes, gutter pools for failed servers, and look-aside caching at very large scale</li>
    <li><a href="https://redis.io/docs/latest/develop/reference/eviction/" rel="noopener noreferrer">Redis documentation: key eviction</a> — the policies, approximated LRU, and LFU counters with decay</li>
    <li><a href="https://www.rfc-editor.org/rfc/rfc5861" rel="noopener noreferrer">RFC 5861: stale-while-revalidate and stale-if-error</a> — how the stale windows are counted from expiry</li>
    <li><a href="https://doi.org/10.14778/2757807.2757813" rel="noopener noreferrer">Optimal probabilistic cache stampede prevention (VLDB 2015)</a> — the early-recompute rule described in this chapter</li>
    <li><a href="https://blog.cloudflare.com/instant-purge/" rel="noopener noreferrer">Cloudflare: instant purge</a> — reported purge latency, including tag purge</li>
    <li><a href="https://openai.com/index/scaling-postgresql/" rel="noopener noreferrer">OpenAI: scaling PostgreSQL</a> — one primary plus about fifty replicas at millions of queries per second, as a reality check on planning numbers</li>
  </ul>
  <p class="sub">Claims in this chapter were checked against these sources in October 2026. Figures marked "planning figure" are rules of thumb, not guarantees.</p>
</div>`,
};
