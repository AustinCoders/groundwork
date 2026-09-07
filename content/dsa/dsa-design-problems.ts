import type { Chapter } from "../types";

export const dsaDesignProblems: Chapter = {
  id: "dsa-design-problems",
  num: "A9",
  title: "Design problems",
  short: "Design problems",
  levels: ["advanced"],
  practice: [
    "ex-lru-cache",
    "ex-design-hashmap",
    "ex-time-based-key-value-store",
    "ex-insert-delete-getrandom",
    "ex-encode-decode-strings",
  ],
  ready: true,
  subtitle:
    "The interface is the spec — pick the data structure combo that meets the complexity contract before you write a line of code.",
  body: `<h3>These questions are graded on the choice, not the code</h3>
<p>
  "Design an LRU cache with O(1) get and put." "Design a stack with O(1)
  getMin." The implementation is usually forty lines of unremarkable
  pointer-juggling. What's being tested is the twenty seconds <em>before</em>
  that: can you read a set of required operations and their required
  complexities, notice that no single data structure delivers all of them,
  and compose two structures where each covers the other's blind spot?
</p>
<p>
  The universal opening move: write the operation table first. Every
  operation, its required complexity, and the structure that provides it.
  Do this out loud, on the board, before touching code.
</p>
<table>
  <tr><th>Requirement</th><th>Target</th><th>Structure that delivers it</th><th>What it cannot do</th></tr>
  <tr><td>Find a value by key</td><td>O(1)</td><td>Hash map</td><td>Any ordering</td></tr>
  <tr><td>Reorder / evict by recency</td><td>O(1)</td><td>Doubly linked list</td><td>Find a node by key</td></tr>
  <tr><td>Min or max of a stack</td><td>O(1)</td><td>Parallel auxiliary stack</td><td>Arbitrary deletion</td></tr>
  <tr><td>Min or max, arbitrary insert/delete</td><td>O(log n)</td><td>Heap</td><td>O(1) lookup by key</td></tr>
  <tr><td>Kth smallest / median, streaming</td><td>O(log n)</td><td>Two heaps, balanced</td><td>Range queries</td></tr>
  <tr><td>Prefix / range sums with updates</td><td>O(log n)</td><td>Fenwick or segment tree</td><td>Key lookup</td></tr>
  <tr><td>Expire old events by time</td><td>O(1) amortized</td><td>Deque or ring buffer of buckets</td><td>Random access by key</td></tr>
  <tr><td>Group by count, get the smallest count</td><td>O(1)</td><td>Frequency buckets (LFU)</td><td>Ordering within… unless the bucket is itself ordered</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The composition rule</span>
  When one structure can find things but not order them, and another can
  order things but not find them, <b>store pointers from the first into the
  second</b>. The hash map's value is not the data — it's a handle into the
  ordered structure. Almost every "design X in O(1)" answer is an instance
  of that one sentence.
</div>

<h3>LRU cache: the canonical composition</h3>
<p>
  The contract: <code>get(key)</code> and <code>put(key, value)</code>, both
  O(1), with the least-recently-used entry evicted when capacity is
  exceeded. A hash map gives O(1) lookup but has no notion of "oldest." An
  array or list gives ordering, but finding a key in it is O(n). A doubly
  linked list gives O(1) removal <em>if you already hold the node</em> —
  which is exactly what the map can hand you.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A hash map on the left whose entries point into a doubly linked list on the right, with the most recently used node next to the head sentinel and the least recently used node next to the tail">
    <g class="rough">
      <path class="ln dash" d="M132,86 L250,100" />
      <path class="ln dash" d="M132,120 L360,104" />
      <path class="ln dash" d="M132,154 L470,118" />
    </g>
    <g class="rough">
      <path class="ln" d="M220,104 L248,104" />
      <path class="ln" d="M332,104 L358,104" />
      <path class="ln" d="M442,104 L468,104" />
      <path class="ln" d="M552,104 L578,104" />
      <path class="ln dash" d="M248,126 L220,126" />
      <path class="ln dash" d="M358,126 L332,126" />
      <path class="ln dash" d="M468,126 L442,126" />
      <path class="ln dash" d="M578,126 L552,126" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="50" width="112" height="150" rx="6" />
      <rect class="box" x="170" y="88" width="50" height="48" rx="4" />
      <rect class="boxg" x="250" y="88" width="82" height="48" rx="4" />
      <rect class="box" x="360" y="88" width="82" height="48" rx="4" />
      <rect class="boxr" x="470" y="88" width="82" height="48" rx="4" />
      <rect class="box" x="580" y="88" width="50" height="48" rx="4" />
    </g>
    <text class="sm" x="76" y="42" text-anchor="middle">hash map</text>
    <text class="sm" x="34" y="90">"A" →</text>
    <text class="sm" x="34" y="124">"B" →</text>
    <text class="sm" x="34" y="158">"C" →</text>
    <text class="sm" x="195" y="118" text-anchor="middle">head</text>
    <text class="sm" x="291" y="118" text-anchor="middle">A</text>
    <text class="sm" x="401" y="118" text-anchor="middle">B</text>
    <text class="sm" x="511" y="118" text-anchor="middle">C</text>
    <text class="sm" x="605" y="118" text-anchor="middle">tail</text>
    <text class="sm gr" x="291" y="76" text-anchor="middle">most recent</text>
    <text class="sm rd" x="511" y="76" text-anchor="middle">evict this one</text>
    <text class="sm gr" x="150" y="186">map: O(1) "which node is key K?"</text>
    <text class="sm gr" x="150" y="208">list: O(1) unlink, O(1) move-to-front, O(1) evict-from-back</text>
  </svg>
  <figcaption>Neither structure alone is enough; the dashed arrows — map entries pointing at list nodes — are the entire design.</figcaption>
</figure>
<pre><code><span class="c">// LRU cache — get, put, and eviction all O(1). O(capacity) space.</span>
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map(); <span class="c">// key → node reference (NOT key → value)</span>

    <span class="c">// sentinel head/tail remove every null check from the unlink code</span>
    this.head = { key: null, val: null, prev: null, next: null };
    this.tail = { key: null, val: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _unlink(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _pushFront(node) { <span class="c">// front (next to head) = most recently used</span>
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this._unlink(node);
    this._pushFront(node); <span class="c">// a read counts as a use — this is the line people forget</span>
    return node.val;
  }

  put(key, value) {
    const existing = this.map.get(key);
    if (existing) {
      existing.val = value;
      this._unlink(existing);
      this._pushFront(existing);
      return; <span class="c">// an update must NOT evict anything</span>
    }

    if (this.map.size === this.cap) {
      const lru = this.tail.prev;
      this._unlink(lru);
      this.map.delete(lru.key); <span class="c">// why nodes store their key: you evict from the list, delete from the map</span>
    }

    const node = { key, val: value, prev: null, next: null };
    this._pushFront(node);
    this.map.set(key, node);
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Three bugs that turn an O(1) LRU into a wrong one</span>
  <b>(1)</b> Not refreshing on <code>get</code> — a read is a use, and
  skipping the move-to-front makes it an insertion-order cache, not an LRU.
  <b>(2)</b> Not storing <code>key</code> inside the node — on eviction you
  hold the node and need its key to delete the map entry; without it you'd
  have to scan the map, and the whole design collapses to O(n).
  <b>(3)</b> Evicting on an update to an existing key — capacity didn't
  change, so nothing should be evicted; this shows up as a failing test only
  when the cache is exactly full.
</div>
<p class="sub">
  Worth mentioning after you've written the real thing: JavaScript's
  <code>Map</code> preserves insertion order, so
  <code>map.delete(k); map.set(k, v);</code> moves a key to the back, and
  <code>map.keys().next().value</code> is the oldest key — a ten-line LRU.
  Say it as a language-specific shortcut you know about, then note that
  interviewers ask this question precisely to see the linked-list mechanics,
  so you'd hand-roll it here.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Both operations have to be
  O(1), so I need constant-time lookup <em>and</em> constant-time reordering.
  No single structure gives me both. A hash map maps keys to nodes, and a
  doubly linked list holds recency order — the map tells me which node in
  O(1), and because the list is doubly linked I can unlink that node in O(1)
  without traversing. Sentinel head and tail nodes let me skip all the
  null-checking edge cases."
</div>

<h3>LFU cache: the same trick, one level deeper</h3>
<p>
  LFU evicts the least <em>frequently</em> used entry, breaking ties by
  least-recently used. Now three things must be O(1): find a key, find the
  minimum frequency, and find the oldest key at that frequency. The answer
  is to bucket by frequency and keep each bucket internally ordered — a map
  from count to an ordered collection of keys — plus a single
  <code>minFreq</code> integer.
</p>
<p>
  Why a bare <code>minFreq</code> counter is enough is the elegant part:
  frequencies only ever increase by exactly 1. So <code>minFreq</code> can
  only rise by 1 (when the last key in the minimum bucket is promoted) or
  reset to 1 (when a brand-new key is inserted). You never have to search
  for the new minimum.
</p>
<pre><code><span class="c">// LFU — get/put O(1). A JS Set preserves insertion order, so it doubles as</span>
<span class="c">// the per-bucket LRU list; in another language this is a DLL per bucket.</span>
class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.vals = new Map();    <span class="c">// key → value</span>
    this.freq = new Map();    <span class="c">// key → use count</span>
    this.buckets = new Map(); <span class="c">// count → Set of keys, oldest first</span>
    this.minFreq = 0;
  }

  _promote(key) {
    const f = this.freq.get(key);
    const bucket = this.buckets.get(f);
    bucket.delete(key);
    if (bucket.size === 0) {
      this.buckets.delete(f);
      if (this.minFreq === f) this.minFreq++; <span class="c">// safe: counts only ever step up by 1</span>
    }
    this.freq.set(key, f + 1);
    if (!this.buckets.has(f + 1)) this.buckets.set(f + 1, new Set());
    this.buckets.get(f + 1).add(key);
  }

  get(key) {
    if (!this.vals.has(key)) return -1;
    this._promote(key);
    return this.vals.get(key);
  }

  put(key, value) {
    if (this.cap === 0) return;
    if (this.vals.has(key)) { this.vals.set(key, value); this._promote(key); return; }

    if (this.vals.size === this.cap) {
      const victims = this.buckets.get(this.minFreq);
      const victim = victims.values().next().value; <span class="c">// oldest key in the least-used bucket → LRU tiebreak</span>
      victims.delete(victim);
      if (victims.size === 0) this.buckets.delete(this.minFreq);
      this.vals.delete(victim);
      this.freq.delete(victim);
    }

    this.vals.set(key, value);
    this.freq.set(key, 1);
    if (!this.buckets.has(1)) this.buckets.set(1, new Set());
    this.buckets.get(1).add(key);
    this.minFreq = 1; <span class="c">// a fresh key always resets the minimum</span>
  }
}</code></pre>
<p class="sub">
  Note the shape is identical to LRU — a lookup structure pointing into an
  ordered structure — just nested one level: map → bucket → ordered keys.
  If you can explain LRU cleanly, LFU is a five-sentence extension, and
  saying "it's LRU with a frequency dimension, and minFreq works because
  counts only increment" is usually enough to satisfy the follow-up.
</p>

<h3>Min stack: O(1) getMin with an auxiliary stack</h3>
<p>
  The trap is reaching for a heap. A heap gives O(log n) min with arbitrary
  removal — but a stack doesn't <em>have</em> arbitrary removal. Pops happen
  in exactly the reverse order of pushes, which means you can precompute the
  answer: at push time, record the minimum of everything at or below this
  point. Popping automatically restores the previous minimum because you
  pop that record too.
</p>
<pre><code><span class="c">// push / pop / top / getMin all O(1). O(n) extra space.</span>
class MinStack {
  constructor() {
    this.main = [];
    this.mins = []; <span class="c">// mins[i] = min of main[0..i] — a running prefix minimum</span>
  }

  push(x) {
    this.main.push(x);
    const currentMin = this.mins.length ? this.mins[this.mins.length - 1] : x;
    this.mins.push(Math.min(x, currentMin));
  }

  pop() {
    this.mins.pop(); <span class="c">// discarding this entry restores the previous min for free</span>
    return this.main.pop();
  }

  top()    { return this.main[this.main.length - 1]; }
  getMin() { return this.mins[this.mins.length - 1]; }
}</code></pre>
<p>
  The space optimization interviewers like to fish for: only push to
  <code>mins</code> when the new value is a new minimum, and only pop from
  it when the popped value equals the current minimum.
</p>
<pre><code>  push(x) {
    this.main.push(x);
    if (!this.mins.length || x &lt;= this.mins[this.mins.length - 1]) this.mins.push(x);
  }

  pop() {
    const x = this.main.pop();
    if (x === this.mins[this.mins.length - 1]) this.mins.pop();
    return x;
  }</code></pre>
<div class="warn">
  <span class="ttl">⚠ The duplicate-minimum bug in the optimized version</span>
  It must be <code>x &lt;= min</code>, not <code>x &lt; min</code>. Push
  <code>[2, 2]</code> with a strict comparison and only one 2 lands in
  <code>mins</code>; the first <code>pop()</code> removes it, and
  <code>getMin()</code> now reports a stale minimum even though a 2 is still
  on the stack. This is the single most common failure on this problem, and
  the test case that catches it is two lines long — offer it yourself.
</div>
<p class="sub">
  <b>Max Stack</b> is the same design for <code>peekMax()</code>. But if the
  question also demands <code>popMax()</code> — remove the maximum from
  anywhere in the stack — the auxiliary-stack trick breaks, because you're
  no longer popping in reverse push order. That version needs a doubly
  linked list plus an ordered map from value to the list of nodes holding
  it, giving O(log n) <code>popMax</code>. Naming that boundary unprompted
  ("this trick works only because removals are LIFO") is the senior-level
  version of this answer.
</p>

<h3>Hit counter: designing for a stream</h3>
<p>
  "Count hits in the last 5 minutes, with timestamps arriving in
  non-decreasing order." The naive store-everything approach is O(1) per hit
  but unbounded memory. The complexity contract to negotiate here isn't just
  time — it's <b>space</b>, and the interviewer is waiting for you to notice
  that the window is fixed-size.
</p>
<pre><code><span class="c">// Version 1: a queue of timestamps. O(1) amortized hit, O(1) amortized</span>
<span class="c">// getHits, but O(hits) space — unbounded under load.</span>
class HitCounter {
  constructor(windowSec = 300) {
    this.window = windowSec;
    this.times = [];
    this.head = 0; <span class="c">// head pointer instead of shift() — shift() is O(n)</span>
  }

  hit(ts) { this.times.push(ts); }

  getHits(ts) {
    while (this.head &lt; this.times.length &amp;&amp; this.times[this.head] &lt;= ts - this.window) {
      this.head++; <span class="c">// each timestamp is skipped at most once across all calls</span>
    }
    return this.times.length - this.head;
  }
}</code></pre>
<pre><code><span class="c">// Version 2: a ring buffer of per-second buckets. O(1) hit, O(window)</span>
<span class="c">// getHits, and O(window) space no matter the traffic — the one to ship.</span>
class BucketedHitCounter {
  constructor(windowSec = 300) {
    this.n = windowSec;
    this.stamps = new Array(windowSec).fill(-1); <span class="c">// which second this slot currently represents</span>
    this.counts = new Array(windowSec).fill(0);
  }

  hit(ts) {
    const i = ts % this.n;
    if (this.stamps[i] !== ts) {         <span class="c">// slot belongs to an older second — reuse it</span>
      this.stamps[i] = ts;
      this.counts[i] = 1;
    } else {
      this.counts[i]++;
    }
  }

  getHits(ts) {
    let total = 0;
    for (let i = 0; i &lt; this.n; i++) {
      if (ts - this.stamps[i] &lt; this.n) total += this.counts[i]; <span class="c">// skip stale slots without clearing them</span>
    }
    return total;
  }
}</code></pre>
<p class="sub">
  The lazy-expiry idea — never clear old data, just check whether a slot's
  timestamp is still in range when you read it — is the reusable insight
  here. It's the same technique behind lazy deletion in heaps and tombstones
  in log-structured storage.
</p>

<h3>Rate limiter: a sliding window counter</h3>
<p>
  The natural follow-up, and the one that bridges into system design. A
  fixed-window counter is trivial but lets a client fire 2× the limit across
  a window boundary. Storing every request timestamp is exact but O(limit)
  memory per user. The sliding-window-counter approximation keeps two
  integers per user and weights the previous window by how much of it still
  overlaps — the algorithm real API gateways ship.
</p>
<pre><code><span class="c">// O(1) time and O(1) space PER USER. Approximate, but bounded error.</span>
class SlidingWindowRateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.state = new Map(); <span class="c">// userId → { start, count, prevCount }</span>
  }

  allow(userId, now = Date.now()) {
    const start = Math.floor(now / this.windowMs) * this.windowMs;
    let s = this.state.get(userId);

    if (!s || s.start &lt; start - this.windowMs) {
      s = { start, count: 0, prevCount: 0 }; <span class="c">// idle for 2+ windows — everything expired</span>
    } else if (s.start &lt; start) {
      s = { start, count: 0, prevCount: s.count }; <span class="c">// rolled into a new window: demote count</span>
    }
    this.state.set(userId, s);

    <span class="c">// fraction of the previous window still inside the trailing window</span>
    const overlap = 1 - (now - start) / this.windowMs;
    const estimate = s.prevCount * overlap + s.count;

    if (estimate >= this.limit) return false;
    s.count++;
    return true;
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Bounded memory is part of the contract, and it's the part people skip</span>
  Two things will be probed. <b>(1)</b> This <code>Map</code> grows forever
  as new user IDs appear — a real implementation needs TTL eviction, which
  is… an LRU, from earlier in this chapter. Say that; it closes the loop.
  <b>(2)</b> The counter is an <em>approximation</em>: it assumes requests
  were spread evenly across the previous window, so a burst clustered at one
  edge can be over- or under-counted by a few percent. State that trade-off
  before being asked, and name the exact alternative (a deque of timestamps,
  O(limit) memory) so the interviewer knows you chose rather than settled.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Let me pin the contract
  first: which operations must be O(1), and is memory bounded? For the rate
  limiter, per-request work has to be O(1) and per-user memory has to be
  O(1) — that immediately rules out storing every timestamp, so I'll use a
  weighted two-window counter. It's approximate at window boundaries; if you
  need exactness I'd switch to a deque of timestamps and pay O(limit)
  memory per user."
</div>

<h3>How to run the first two minutes of any design question</h3>
<table>
  <tr><th>Step</th><th>What you say</th></tr>
  <tr><td>1. Restate the interface</td><td>"So: get, put, and eviction — three operations."</td></tr>
  <tr><td>2. Pin the complexity per operation</td><td>"All three O(1)? Including eviction? Good."</td></tr>
  <tr><td>3. Name what breaks</td><td>"A map has no order; a list can't find a key. Neither alone works."</td></tr>
  <tr><td>4. Compose, then justify</td><td>"Map from key to <em>node</em>, list for order. Map finds, list reorders."</td></tr>
  <tr><td>5. Call out the edge cases first</td><td>"Capacity 0, update-an-existing-key, get on a miss."</td></tr>
  <tr><td>6. Then write it</td><td>Sentinels first, helpers second, public methods last.</td></tr>
</table>
<p class="sub">
  Steps 1-5 take ninety seconds and are where the hiring signal lives. A
  candidate who writes a flawless LRU without ever explaining why the list
  must be <em>doubly</em> linked has demonstrated recall; a candidate who
  derives it from "unlink must be O(1) and I only hold the node, not its
  predecessor" has demonstrated design.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt starts with the word "Design" and hands you a class signature with named methods and stated complexities — the complexities <em>are</em> the problem statement</li>
  <li>Two operations pull in opposite directions: fast lookup versus maintained order, or fast insert versus fast min/max. That tension is the signal to compose two structures rather than search for one perfect one</li>
  <li>Something must be evicted, expired, or capped — look for hash map + doubly linked list (recency), frequency buckets (LFU), or a ring buffer / deque (time windows)</li>
  <li>"O(1) min/max" on a structure with LIFO removal → auxiliary stack. "O(1) min/max" with arbitrary removal → you need a heap or ordered map, and the honest answer is O(log n), not O(1)</li>
  <li>"Streaming," "in the last N seconds," "timestamps arrive in order" → the window is fixed, so memory should be O(window), not O(events); bucket and expire lazily</li>
  <li>Distinguish from an algorithms question: there's no clever traversal or recurrence here. If you're searching for an <em>algorithm</em>, you've misread it — you're searching for a <em>combination</em></li>
  <li>Pitfalls: forgetting that a read counts as a use, not storing the key inside the node so eviction can clean up the map, using <code>&lt;</code> where <code>&lt;=</code> is needed on duplicate minimums, and letting the per-key map grow without bound</li>
</ul>`,
};
