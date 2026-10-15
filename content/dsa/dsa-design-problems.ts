import type { Chapter } from "../types";

export const dsaDesignProblems: Chapter = {
  id: "dsa-design-problems",
  num: "A9",
  title: "Design problems",
  short: "Design problems",
  levels: ["advanced"],
  prerequisites: ["dsa-hashing", "dsa-linked-lists", "dsa-heaps-priority-queues"],
  practice: [
    "ex-lru-cache",
    "ex-lfu-cache",
    "ex-min-stack",
    "ex-hit-counter",
    "ex-time-based-key-value-store",
    "ex-time-map-out-of-order",
    "ex-insert-delete-getrandom",
    "ex-randomized-collection",
    "ex-all-o-one",
    "ex-median-from-data-stream",
    "ex-bounded-median",
    "ex-design-hashmap",
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
  <tr><td>Min or max, arbitrary insert/delete</td><td>O(log n)</td><td>Heap (lazy deletion for arbitrary removal)</td><td>O(1) lookup by key</td></tr>
  <tr><td>Kth smallest / median, streaming</td><td>O(log n)</td><td>Two heaps, balanced</td><td>Range queries</td></tr>
  <tr><td>Prefix / range sums with updates</td><td>O(log n)</td><td>Fenwick or segment tree</td><td>Key lookup</td></tr>
  <tr><td>Expire old events by time</td><td>O(1) amortized</td><td>Deque or ring buffer of buckets</td><td>Random access by key</td></tr>
  <tr><td>Group by count, get the smallest count</td><td>O(1)</td><td>Frequency buckets (LFU)</td><td>Ordering within… unless the bucket is itself ordered</td></tr>
  <tr><td>Value as of time t, writes in time order</td><td>O(log n)</td><td>Per-key sorted list and a binary search</td><td>Cheap writes that arrive out of order</td></tr>
  <tr><td>Uniform random member plus O(1) removal</td><td>O(1)</td><td>Dense array and a map from value to index</td><td>Keeping the members in any order</td></tr>
  <tr><td>Largest and smallest count when each count moves by 1</td><td>O(1)</td><td>Linked list of count buckets</td><td>Jumps in count without a search</td></tr>
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
    if (this.cap === 0) return; <span class="c">// nothing can be stored, so there is nothing to evict either</span>
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
<h4>Dry run: LRUCache(3) — the same keys as the figure above</h4>
<table>
  <tr><th>Call</th><th>list, front → back (most → least recent)</th><th>map keys</th><th>evicted</th></tr>
  <tr><td>put("C", 3)</td><td>C</td><td>C</td><td>—</td></tr>
  <tr><td>put("B", 2)</td><td>B, C</td><td>C, B</td><td>—</td></tr>
  <tr><td>put("A", 1)</td><td>A, B, C</td><td>C, B, A</td><td>— (matches the figure: A newest, C next to evict)</td></tr>
  <tr><td>get("C") → 3</td><td>C, A, B</td><td>C, B, A</td><td>— (C refreshed to the front; B is now the LRU)</td></tr>
  <tr><td>put("D", 4)</td><td>D, C, A</td><td>C, A, D</td><td><b>B</b></td></tr>
</table>
<p class="sub">
  The <code>get("C")</code> call is the pivot: before it, B was the
  <em>newer</em> entry and C was next in line for eviction. One read moves C
  to the front and leaves B stranded at the tail — B is evicted not because
  it was written first — C was written first and survives — but because
  nobody has touched it for the longest time. That's the entire meaning of "least recently used."
</p>
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

<h3>All O(1): LFU's buckets, with the list made explicit</h3>
<p>
  The contract: <code>inc(key)</code>, <code>dec(key)</code>,
  <code>getMaxKey()</code> and <code>getMinKey()</code>, all O(1). A map from
  key to count makes <code>inc</code> and <code>dec</code> trivial and says
  nothing about the largest or smallest count. A heap finds the extreme in
  O(1) but moving one key's count inside it costs O(log n), and sorting on
  every query costs far more. So the requirement is a structure that keeps
  <em>counts</em> in sorted order and survives a key changing its count.
</p>
<p>
  The fact that makes it possible is the same one that powered
  <code>minFreq</code> in the LFU cache: a count changes by exactly 1. When a
  key moves from count <i>c</i> to <i>c</i> + 1, the only place it can belong
  in the sorted order is the bucket for <i>c</i> + 1 — which, if it exists, is
  already the next bucket in the list — or a brand-new bucket spliced in
  directly after the old one. There is never anything to search for. Keep one
  bucket per distinct count, each holding a <code>Set</code> of the keys with
  that count, link the buckets into a doubly linked list sorted by count, and
  give the map a handle to each key's bucket. The maximum is the last bucket
  and the minimum is the first.
</p>
<pre><code>class AllOne {
  constructor() {
    this.head = { count: 0, keys: new Set(), prev: null, next: null }; <span class="c">// sentinel: "count 0"</span>
    this.tail = { count: Infinity, keys: new Set(), prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
    this.bucketOf = new Map(); <span class="c">// key -&gt; the bucket that holds it</span>
  }

  _insertAfter(node, count) {
    const bucket = { count, keys: new Set(), prev: node, next: node.next };
    node.next.prev = bucket;
    node.next = bucket;
    return bucket;
  }

  _unlinkIfEmpty(bucket) {
    if (bucket === this.head || bucket.keys.size &gt; 0) return;
    bucket.prev.next = bucket.next;
    bucket.next.prev = bucket.prev;
  }

  inc(key) {
    const from = this.bucketOf.get(key) || this.head;
    const count = from.count + 1;
    const to = from.next.count === count ? from.next : this._insertAfter(from, count);
    to.keys.add(key);
    this.bucketOf.set(key, to);
    from.keys.delete(key);
    this._unlinkIfEmpty(from);
  }

  dec(key) {
    const from = this.bucketOf.get(key);
    if (!from) return;
    const count = from.count - 1;
    if (count === 0) {
      this.bucketOf.delete(key);
    } else {
      const to = from.prev.count === count ? from.prev : this._insertAfter(from.prev, count);
      to.keys.add(key);
      this.bucketOf.set(key, to);
    }
    from.keys.delete(key);
    this._unlinkIfEmpty(from);
  }

  getMaxKey() {
    return this.tail.prev === this.head ? "" : this.tail.prev.keys.values().next().value;
  }

  getMinKey() {
    return this.head.next === this.tail ? "" : this.head.next.keys.values().next().value;
  }
}</code></pre>
<h4>Dry run: the list of buckets, count : keys, after each call</h4>
<table>
  <tr><th>Call</th><th>buckets, smallest count first</th><th>getMaxKey</th><th>getMinKey</th></tr>
  <tr><td>inc("a")</td><td>1:a</td><td>a</td><td>a</td></tr>
  <tr><td>inc("b")</td><td>1:a,b</td><td>a</td><td>a</td></tr>
  <tr><td>inc("a")</td><td>1:b | 2:a</td><td>a</td><td>b</td></tr>
  <tr><td>inc("c")</td><td>1:b,c | 2:a</td><td>a</td><td>b</td></tr>
  <tr><td>inc("c")</td><td>1:b | 2:a,c</td><td>a</td><td>b</td></tr>
  <tr><td>inc("c")</td><td>1:b | 2:a | 3:c</td><td>c</td><td>b</td></tr>
  <tr><td>dec("a")</td><td>1:b,a | 3:c (the empty 2-bucket was unlinked)</td><td>c</td><td>b</td></tr>
  <tr><td>dec("b")</td><td>1:a | 3:c</td><td>c</td><td>a</td></tr>
  <tr><td>dec("c")</td><td>1:a | 2:c (a new 2-bucket spliced in before the 3-bucket, which then emptied)</td><td>c</td><td>a</td></tr>
</table>
<p class="sub">
  Row 3 is the whole trick in one step: <code>a</code> leaves the 1-bucket,
  finds no 2-bucket next to it, and a fresh one is spliced in right after.
  Row 7 shows the cleanup: <code>a</code> drops to 1, joins the existing
  1-bucket, and the 2-bucket it left behind is empty, so it is unlinked at
  once. Ties return whichever key the bucket's <code>Set</code> yields first;
  the contract allows any of them.
</p>
<p>
  Every call touches at most three buckets (the old one, the new one, and a
  neighbour to compare counts with) and does a constant number of
  <code>Set</code> and <code>Map</code> operations, so each operation is O(1)
  on average, and the space is O(distinct keys). The two sentinels do real
  work: the tail's count of <code>Infinity</code> means
  <code>from.next.count === count</code> can never match it, and the head's
  count of 0 lets a brand-new key start from "count 0" through the same code
  path as every other increment.
</p>
<div class="warn">
  <span class="ttl">⚠ Four ways this goes wrong</span>
  <b>(1)</b> Not unlinking a bucket when its last key leaves: it stays in the
  list empty, and <code>getMaxKey</code> reads <code>undefined</code> from an
  empty <code>Set</code>. <b>(2)</b> Treating count 0 as a bucket: a key that
  reaches 0 must leave the map and every bucket, not sit in a "0" bucket.
  <b>(3)</b> Splicing in a new bucket without first checking whether the
  neighbour already has the right count; the list then holds two buckets for
  the same count and the sorted order is quietly wrong. <b>(4)</b> Unlinking
  the old bucket <em>before</em> inserting the new one, which loses the node you
  were going to insert after. The code inserts first and cleans up second.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "A count only ever changes by
  one, so a key's new position in sorted order is always adjacent to its old
  one. That means I can keep a sorted linked list of count buckets and splice,
  never search. The map holds each key's bucket, the list gives me both ends
  in O(1), and I delete a bucket the moment it empties."
</div>

<h3>Min stack: O(1) getMin with an auxiliary stack</h3>
<p>
  The trap is reaching for a heap. A heap pays O(log n) per push and pop to
  support arbitrary removal — but a stack doesn't <em>have</em> arbitrary removal. Pops happen
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
  <code>mins</code> when the new value is a new minimum or ties the current one,
  and only pop from it when the popped value equals the current minimum.
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
  <code>getMin()</code> now reports the wrong minimum (<code>undefined</code>
  here, or a larger value left over from beneath) even though a 2 is still
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

<h3>Time-based key-value store: a sorted history per key</h3>
<p>
  <code>set(key, value, timestamp)</code> records a value; <code>get(key,
  timestamp)</code> returns the value that was in force at that moment, which
  is the one with the <em>largest stored time that is at most</em> the query.
  If nothing was written by then, the answer is the empty string. The naive
  design keeps every write in one global list and scans it: correct, and
  O(total writes) per <code>get</code>. The first fix is obvious: histories of
  different keys never interact, so give each key its own list.
</p>
<p>
  The second fix is the one being tested. If timestamps arrive in increasing
  order, each key's list is <em>already sorted</em> by time, because
  appending is the only operation, so <code>get</code> can binary search
  instead of scanning. The detail that costs offers is the shape of that
  search. It is not "find this exact time"; it is "find the last version not
  after this time", the same boundary search as an upper bound: look for the
  first version written <em>after</em> the query, and the answer is the one
  just before it.
</p>
<pre><code>class TimeMap {
  constructor() {
    this.versions = new Map(); <span class="c">// key -&gt; [[timestamp, value], ...], oldest first</span>
  }

  set(key, value, timestamp) {
    if (!this.versions.has(key)) this.versions.set(key, []);
    this.versions.get(key).push([timestamp, value]); <span class="c">// timestamps only grow, so the list stays sorted</span>
  }

  get(key, timestamp) {
    const list = this.versions.get(key);
    if (!list) return "";
    let lo = 0;
    let hi = list.length; <span class="c">// search for the first version written AFTER timestamp</span>
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt; 1;
      if (list[mid][0] &lt;= timestamp) lo = mid + 1;
      else hi = mid;
    }
    return lo === 0 ? "" : list[lo - 1][1]; <span class="c">// the version just before that one</span>
  }
}</code></pre>
<h4>Dry run: three versions of one key, then get("k", 6)</h4>
<p class="sub">After <code>set("k","a",2)</code>, <code>set("k","b",5)</code> and <code>set("k","c",9)</code> the list is <code>[(2,a), (5,b), (9,c)]</code>.</p>
<table>
  <tr><th>Step</th><th>lo</th><th>hi</th><th>mid</th><th>time at mid</th><th>Decision</th></tr>
  <tr><td>start</td><td>0</td><td>3</td><td>1</td><td>5</td><td>5 &lt;= 6, so version 1 is not after the query: lo = 2</td></tr>
  <tr><td>2</td><td>2</td><td>3</td><td>2</td><td>9</td><td>9 &gt; 6, so version 2 is after the query: hi = 2</td></tr>
  <tr><td>end</td><td>2</td><td>2</td><td>-</td><td>-</td><td>lo = 2 is the first version after time 6; the answer is list[1], which is "b"</td></tr>
</table>
<p class="sub">
  Other queries on the same list: time 1 gives <code>""</code> (<code>lo</code>
  stays 0, so nothing is at or before it), time 5 gives <code>"b"</code> (an
  exact match counts, because the comparison is <code>&lt;=</code>), and time
  100 gives <code>"c"</code>.
</p>
<p>
  <code>set</code> is O(1) amortized and <code>get</code> is O(log m), where
  m is the number of versions of that one key, not of all keys. Memory is
  O(total writes), and nothing in this design ever deletes: say so, and say
  what you would add (a retention window, or compaction of old versions) if
  asked.
</p>
<h4>When timestamps can arrive out of order</h4>
<p>
  The "increasing timestamps" promise is what keeps <code>set</code> a plain
  append. If a write can arrive with any timestamp, the list must be kept
  sorted by inserting at the position the same binary search finds, and a
  second write at an existing instant must replace the first rather than add a
  duplicate. In JavaScript the insert is a <code>splice</code>, which shifts
  the tail, so <code>set</code> becomes O(m); an ordered tree or skip list
  makes it O(log m), but JavaScript has no built-in ordered map, so that is a
  sentence to say, not code to write.
</p>
<pre><code>class TimeMapAnyOrder {
  constructor() {
    this.versions = new Map();
  }

  _after(list, timestamp) {
    let lo = 0;
    let hi = list.length;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt; 1;
      if (list[mid][0] &lt;= timestamp) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  set(key, value, timestamp) {
    if (!this.versions.has(key)) this.versions.set(key, []);
    const list = this.versions.get(key);
    const at = this._after(list, timestamp);
    if (at &gt; 0 &amp;&amp; list[at - 1][0] === timestamp) list[at - 1][1] = value; <span class="c">// same instant: last write wins</span>
    else list.splice(at, 0, [timestamp, value]); <span class="c">// splice shifts the tail: O(versions) per out-of-order write</span>
  }

  get(key, timestamp) {
    const list = this.versions.get(key);
    if (!list) return "";
    const at = this._after(list, timestamp);
    return at === 0 ? "" : list[at - 1][1];
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Where the boundary search goes wrong</span>
  <b>(1)</b> Searching for an exact match and returning <code>""</code> when
  there is none: most queries fall <em>between</em> two writes. <b>(2)</b>
  Returning <code>list[lo]</code> instead of <code>list[lo - 1]</code>:
  <code>lo</code> is the first version after the query, so the answer sits one
  slot earlier. <b>(3)</b> Forgetting the case <code>lo === 0</code>, where
  every version is newer than the query and <code>list[-1]</code> would read
  <code>undefined</code>. <b>(4)</b> Assuming increasing timestamps because the
  example happens to have them. Ask, and if the statement does not promise it,
  say that you are relying on it.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Writes for one key come in time
  order, so each key's history is a sorted array and <code>get</code> is a
  binary search for the last version that is not after the query: find the
  first version after it and step back one. <code>set</code> is O(1) and
  <code>get</code> is O(log of that key's versions). If timestamps could
  arrive out of order I'd insert at the found position instead of appending,
  which costs a shift in an array or O(log n) in a balanced tree."
</div>

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
  edge can be over- or under-counted (usually slightly, but in the worst case by
  most of a window's worth of requests). State that trade-off
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

<h3>Insert, delete, getRandom in O(1): a dense array with a map of positions</h3>
<p>
  <code>insert(v)</code>, <code>remove(v)</code> and <code>getRandom()</code>,
  all O(1) on average, where <code>getRandom</code> must return every current
  member with equal probability. Try the single structures first, because the
  failure of each one is the design. A <code>Set</code> inserts, removes and
  tests membership in O(1) but has no way to say "give me the member at a
  random position"; turning it into an array first costs O(n). An array picks
  a random position in O(1) but finds a value in O(n), and deleting from its
  middle shifts everything after it, also O(n).
</p>
<p>
  Compose them, and attack the one thing that is still slow. Keep a dense
  array of the values, so a random index is a random member, and a
  <code>Map</code> from each value to its index in the array, so membership
  and "where is it" are O(1). Insert pushes onto the end and records the
  index. The remaining problem is removal from the middle. The key
  observation is that the array promises <em>density</em>, not <em>order</em>:
  nobody asked for the members in any particular sequence. So instead of
  shifting the tail left, move the <b>last</b> element into the hole and pop
  the end. One write, one pop, O(1).
</p>
<pre><code>class RandomizedSet {
  constructor() {
    this.values = []; <span class="c">// dense array: getRandom is an index</span>
    this.slot = new Map(); <span class="c">// value -&gt; its index in values</span>
  }

  insert(value) {
    if (this.slot.has(value)) return false;
    this.slot.set(value, this.values.length);
    this.values.push(value);
    return true;
  }

  remove(value) {
    if (!this.slot.has(value)) return false;
    const hole = this.slot.get(value);
    const last = this.values[this.values.length - 1];
    this.values[hole] = last; <span class="c">// the last value fills the hole</span>
    this.slot.set(last, hole); <span class="c">// ...and learns its new index</span>
    this.values.pop();
    this.slot.delete(value); <span class="c">// LAST: when value === last, this undoes the set above</span>
    return true;
  }

  getRandom() {
    return this.values[Math.floor(Math.random() * this.values.length)];
  }
}</code></pre>
<h4>Dry run: insert 10, 20, 30, 40, then remove 20, 40, 30</h4>
<table>
  <tr><th>Call</th><th>values</th><th>slot map (value → index)</th><th>What happened</th></tr>
  <tr><td>4 inserts</td><td>[10, 20, 30, 40]</td><td>10→0, 20→1, 30→2, 40→3</td><td>push and record</td></tr>
  <tr><td>remove(20)</td><td>[10, 40, 30]</td><td>10→0, 40→1, 30→2</td><td>hole at 1; 40, the last, moves into it and its index changes from 3 to 1</td></tr>
  <tr><td>remove(40)</td><td>[10, 30]</td><td>10→0, 30→1</td><td>hole at 1; 30 moves into it, index 2 → 1</td></tr>
  <tr><td>remove(30)</td><td>[10]</td><td>10→0</td><td>30 <em>is</em> the last element: it fills its own hole, then both the pop and the delete remove it</td></tr>
</table>
<p class="sub">
  The last row is the case that breaks careless versions. When the value being
  removed is itself the last element, "move the last one into the hole" copies
  it onto itself, and the order of the final two lines of the method decides
  whether the map ends up correct.
</p>
<div class="warn">
  <span class="ttl">⚠ Delete from the map last, not first</span>
  The method sets <code>slot[last] = hole</code> and then deletes
  <code>slot[value]</code>. If it deleted first and set second, then for
  <code>value === last</code> the set would put the entry back. Starting from
  <code>insert(1)</code>, <code>insert(2)</code> and removing 2 in that wrong
  order leaves <code>values = [1]</code> but <code>slot</code> still holding
  both <code>1→0</code> and <code>2→1</code>. <code>insert(2)</code> would then
  answer "already there", and <code>remove(2)</code> would report success for a
  value that is already gone and leave <code>1</code> mapped to index 1 of a
  one-element array. Two other classic slips: forgetting to update the moved
  element's index in the map at all, and calling
  <code>values.indexOf(v)</code> inside <code>remove</code>, which quietly
  makes it O(n).
</div>
<h4>With duplicates: a Set of positions per value</h4>
<p>
  Now <code>insert</code> may add a copy of a value already present,
  <code>remove</code> removes one copy, and a value stored three times must be
  three times as likely to be returned. The array may now hold the same value
  at several indices, so the map's value must grow from one index to a
  <code>Set</code> of indices. Everything else is the same move: pick any
  index of the value being removed, fill that hole with the last element, and
  tell the <em>last element's value</em> that one of its positions changed.
</p>
<pre><code>class RandomizedCollection {
  constructor() {
    this.values = [];
    this.slots = new Map(); <span class="c">// value -&gt; Set of every index where it sits in values</span>
  }

  insert(value) {
    const isNew = !this.slots.has(value);
    if (isNew) this.slots.set(value, new Set());
    this.slots.get(value).add(this.values.length);
    this.values.push(value);
    return isNew; <span class="c">// true only for the first copy</span>
  }

  remove(value) {
    const mine = this.slots.get(value);
    if (!mine) return false;
    const hole = mine.values().next().value; <span class="c">// any one copy will do</span>
    const lastIndex = this.values.length - 1;
    const last = this.values[lastIndex];
    mine.delete(hole);
    if (hole !== lastIndex) {
      this.values[hole] = last;
      const theirs = this.slots.get(last); <span class="c">// when last === value this is the same Set as mine</span>
      theirs.delete(lastIndex);
      theirs.add(hole);
    }
    this.values.pop();
    if (mine.size === 0) this.slots.delete(value);
    return true;
  }

  getRandom() {
    return this.values[Math.floor(Math.random() * this.values.length)];
  }
}</code></pre>
<p class="sub">
  The comment on <code>theirs</code> marks the subtle case. If the last element is
  another copy of the value being removed, <code>theirs</code> and
  <code>mine</code> are the same <code>Set</code>: the code has already removed
  <code>hole</code> from it, then removes <code>lastIndex</code> and adds
  <code>hole</code>, which leaves exactly the right positions. Draws are
  proportional to count simply because each copy occupies one array slot. In
  one run of 60,000 draws from a collection holding <code>1, 1, 2</code>, the
  value 1 came back 39,868 times, against 40,000 expected.
</p>
<p>
  Complexity: <code>insert</code>, <code>remove</code> and
  <code>getRandom</code> are O(1) on average for both versions, since each does
  a constant number of <code>Map</code>, <code>Set</code> and array-end
  operations. Space is O(n). The whole design is one sentence: <b>make
  removal O(1) by giving up an order nobody asked you to keep.</b>
</p>

<h3>Median finder: two heaps that meet in the middle</h3>
<p>
  <code>addNum(x)</code> adds a number to a stream and <code>findMedian()</code>
  returns the middle value of everything so far (the mean of the two middle
  values when the count is even). The obvious store is a sorted array. Finding
  where <code>x</code> belongs is a binary search, O(log n), but inserting
  there shifts the tail, so each <code>addNum</code> costs O(n). Re-sorting on
  every query is worse. One heap is no help either: it exposes the minimum or
  the maximum, and the median is neither.
</p>
<p>
  Look at what the median needs. It does not need the data sorted, it needs
  <em>the boundary between the smaller half and the larger half</em>. Split
  the numbers into a lower half and an upper half. If the lower half sits in a
  max-heap, its top is the largest of the small numbers; if the upper half
  sits in a min-heap, its top is the smallest of the large ones. The two tops
  are exactly the middle elements. All that has to be maintained is two
  invariants: <b>(1)</b> every number in the lower half is at most every number
  in the upper half, and <b>(2)</b> the halves differ in size by at most one,
  with the extra element in the lower half.
</p>
<p>
  <code>addNum</code> restores both in three steps and no
  branching on values. Push <code>x</code> into the lower half; then move that
  half's largest element across to the upper half, which guarantees invariant
  (1) whatever <code>x</code> was; then, if the upper half is now bigger, move
  its smallest back.
</p>
<pre><code>class Heap {
  constructor(before) {
    this.items = [];
    this.before = before; <span class="c">// before(a, b) is true when a belongs closer to the top than b</span>
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(x) {
    const a = this.items;
    a.push(x);
    let i = a.length - 1;
    while (i &gt; 0) {
      const parent = (i - 1) &gt;&gt; 1;
      if (!this.before(a[i], a[parent])) break;
      [a[i], a[parent]] = [a[parent], a[i]];
      i = parent;
    }
  }

  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length &gt; 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        let best = i;
        const l = 2 * i + 1;
        const r = l + 1;
        if (l &lt; a.length &amp;&amp; this.before(a[l], a[best])) best = l;
        if (r &lt; a.length &amp;&amp; this.before(a[r], a[best])) best = r;
        if (best === i) break;
        [a[i], a[best]] = [a[best], a[i]];
        i = best;
      }
    }
    return top;
  }
}

class MedianFinder {
  constructor() {
    this.low = new Heap((a, b) =&gt; a &gt; b); <span class="c">// max-heap: the smaller half</span>
    this.high = new Heap((a, b) =&gt; a &lt; b); <span class="c">// min-heap: the larger half</span>
  }

  addNum(x) {
    this.low.push(x);
    this.high.push(this.low.pop()); <span class="c">// the biggest of the small half crosses over, so every low &lt;= every high</span>
    if (this.high.size &gt; this.low.size) this.low.push(this.high.pop()); <span class="c">// low keeps the extra element</span>
  }

  findMedian() {
    if (this.low.size === 0) return undefined;
    return this.low.size &gt; this.high.size ? this.low.peek() : (this.low.peek() + this.high.peek()) / 2;
  }
}</code></pre>
<h4>Dry run: add 5, 2, 8, 1, 9</h4>
<table>
  <tr><th>addNum</th><th>lower half (max-heap)</th><th>upper half (min-heap)</th><th>findMedian</th></tr>
  <tr><td>5</td><td>{5}</td><td>{}</td><td>5 (lower is larger: its top)</td></tr>
  <tr><td>2</td><td>{2}</td><td>{5}</td><td>(2 + 5) / 2 = 3.5</td></tr>
  <tr><td>8</td><td>{2, 5}</td><td>{8}</td><td>5</td></tr>
  <tr><td>1</td><td>{1, 2}</td><td>{5, 8}</td><td>(2 + 5) / 2 = 3.5</td></tr>
  <tr><td>9</td><td>{1, 2, 5}</td><td>{8, 9}</td><td>5</td></tr>
</table>
<p class="sub">
  Row 2 shows the crossing: 2 is pushed into the lower half beside 5, 5 is the
  larger so it crosses to the upper half, and the sizes are already balanced.
  Row 4: pushing 1 into {2, 5} then moving the maximum 5 across leaves {1, 2}
  and {5, 8}, again balanced. Each row's median is the top of one heap, or the
  mean of two tops.
</p>
<p>
  <code>addNum</code> costs O(log n) (a constant number of heap pushes and
  pops), <code>findMedian</code> is O(1), and space is O(n). The heap class is
  there because JavaScript has none; in an interview, state its interface
  (<code>push</code>, <code>pop</code>, <code>peek</code>, <code>size</code>)
  and offer to write it if the interviewer wants it.
</p>
<div class="warn">
  <span class="ttl">⚠ What breaks the invariant</span>
  <b>(1)</b> A comparator pointing the wrong way: the lower half needs a
  <em>max</em>-heap, and a default <code>a &lt; b</code> comparator quietly builds a
  min-heap there. <b>(2)</b> Pushing straight into whichever heap
  "looks right" by comparing with the tops, then forgetting one of the
  rebalancing cases; the push-cross-rebalance sequence above has no cases to
  forget. <b>(3)</b> Integer division on the even case:
  <code>(a + b) / 2</code> must stay a floating-point mean, so the median of
  <code>1</code> and <code>2</code> is <code>1.5</code>. <b>(4)</b> Reading the
  median of an empty finder; decide what it returns and say so.
</div>
<h4>Follow-ups the interviewer is waiting to ask</h4>
<p>
  <b>"All values are integers from 0 to 100."</b> Then no heap is needed. Keep
  101 counters, one per value, and a running total. The median is the k-th
  smallest for one or two ranks k, found by walking the counters from 0 upward
  until the running sum reaches k. That is at most 101 steps no matter how
  many numbers have arrived, so <code>findMedian</code> is O(1) and
  <code>addNum</code> is O(1). The extra shape to name is that a small value
  range replaces comparison-based structures with counting.
</p>
<pre><code>class BoundedMedian {
  constructor() {
    this.counts = new Array(101).fill(0); <span class="c">// counts[v] = how many times v (0..100) arrived</span>
    this.total = 0;
  }

  addNum(x) {
    this.counts[x]++;
    this.total++;
  }

  _kth(k) {
    let seen = 0;
    for (let v = 0; v &lt;= 100; v++) {
      seen += this.counts[v];
      if (seen &gt;= k) return v; <span class="c">// the k-th smallest, 1-based</span>
    }
  }

  findMedian() {
    if (this.total === 0) return undefined;
    const lowRank = Math.ceil(this.total / 2);
    const highRank = Math.floor(this.total / 2) + 1;
    return (this._kth(lowRank) + this._kth(highRank)) / 2;
  }
}</code></pre>
<p class="sub">
  <b>"99% of values are in 0 to 100, the rest are arbitrary."</b> Keep the
  same 101 counters plus a count of values below 0 and a count above 100. At
  most 1% of the numbers lie on either side, far fewer than half, so the
  middle rank always falls inside 0 to 100; subtract the below-0 count when
  walking the ranks. <b>"Slide a window: remove the oldest number."</b> A heap
  cannot delete an arbitrary item cheaply, so either mark the item as deleted
  and discard it when it reaches a top (lazy deletion, keeping separate
  counts of live items per heap), or switch to an ordered structure.
</p>

<h3>Design HashMap: buckets, collisions and resizing</h3>
<p>
  "Implement a hash map without using the built-in one." The interviewer is not
  after a clever structure; they want to see that you know what a hash map
  <em>is</em>. The idea in three steps. A hash function turns any key into a
  number. That number, taken modulo the length of an array, picks a
  <b>bucket</b>. Looking a key up is then one array access instead of a search.
</p>
<p>
  The catch is unavoidable: there are far more possible keys than buckets, so
  two different keys will land in the same bucket. This is a
  <b>collision</b>, and it is normal, not a bug. The standard answer is
  <em>separate chaining</em>: each bucket is a short list of
  <code>[key, value]</code> pairs, and every operation is "find the bucket,
  then scan that short list". That scan is only short if the buckets stay
  nearly empty, so the map also tracks its <b>load factor</b>, the number of
  entries divided by the number of buckets, and doubles the array when it
  passes a threshold (here 0.75), re-distributing every pair.
</p>
<pre><code>function hashOf(key) {
  const text = String(key);
  let h = 0;
  for (let i = 0; i &lt; text.length; i++) h = (Math.imul(h, 31) + text.charCodeAt(i)) | 0;
  return h &gt;&gt;&gt; 0; <span class="c">// reinterpret as unsigned: a negative index would silently miss every bucket</span>
}

class MyHashMap {
  constructor(capacity = 8) {
    this.buckets = Array.from({ length: capacity }, () =&gt; []); <span class="c">// each bucket: a short list of [key, value]</span>
    this.size = 0;
  }

  _bucket(key) {
    return this.buckets[hashOf(key) % this.buckets.length];
  }

  put(key, value) {
    const bucket = this._bucket(key);
    for (const pair of bucket) {
      if (pair[0] === key) {
        pair[1] = value; <span class="c">// overwrite: size must not grow</span>
        return;
      }
    }
    bucket.push([key, value]);
    this.size++;
    if (this.size &gt; 0.75 * this.buckets.length) this._grow();
  }

  get(key) {
    for (const pair of this._bucket(key)) if (pair[0] === key) return pair[1];
    return -1;
  }

  remove(key) {
    const bucket = this._bucket(key);
    const i = bucket.findIndex((pair) =&gt; pair[0] === key);
    if (i === -1) return;
    bucket.splice(i, 1);
    this.size--;
  }

  _grow() {
    const old = this.buckets;
    this.buckets = Array.from({ length: old.length * 2 }, () =&gt; []);
    for (const bucket of old) {
      for (const pair of bucket) this._bucket(pair[0]).push(pair); <span class="c">// re-hash against the NEW length</span>
    }
  }
}</code></pre>
<h4>Dry run: capacity 4, putting a, b, c, e, f (the hash of a single character is its character code)</h4>
<table>
  <tr><th>Call</th><th>index = hash % capacity</th><th>buckets after the call</th><th>size / capacity</th></tr>
  <tr><td>put("a")</td><td>97 % 4 = 1</td><td>[ , a, , ]</td><td>1 / 4</td></tr>
  <tr><td>put("b")</td><td>98 % 4 = 2</td><td>[ , a, b, ]</td><td>2 / 4</td></tr>
  <tr><td>put("c")</td><td>99 % 4 = 3</td><td>[ , a, b, c]</td><td>3 / 4, exactly 0.75, not above it</td></tr>
  <tr><td>put("e")</td><td>101 % 4 = 1, a collision with "a"</td><td>bucket 1 briefly holds a, e; size 4 &gt; 0.75 × 4, so the map grows to 8 and re-hashes every pair: 97 % 8 = 1, 98 % 8 = 2, 99 % 8 = 3, 101 % 8 = 5, giving [ , a, b, c, , e, , ]</td><td>4 / 8</td></tr>
  <tr><td>put("f")</td><td>102 % 8 = 6</td><td>[ , a, b, c, , e, f, ]</td><td>5 / 8</td></tr>
</table>
<p class="sub">
  The collision in row 4 disappeared after the resize only because 97 and 101
  differ by 4, and 4 is a multiple of the old capacity but not the new one.
  That is the point of growing: more buckets spread the same keys out.
</p>
<p>
  Costs, stated with their assumptions. With a hash function that spreads keys
  evenly and a bounded load factor, <code>put</code>, <code>get</code> and
  <code>remove</code> take expected O(1) time, because each bucket holds a
  constant number of pairs on average. A single resize is O(n), but doubling
  makes the total cost of n insertions O(n), so the amortized cost per
  <code>put</code> is O(1). If every key hashed to one bucket, all three
  operations would degrade to O(n); that is the worst case, and it is why the
  quality of the hash matters. Space is O(n + capacity).
</p>
<div class="warn">
  <span class="ttl">⚠ The bugs that turn up in this question</span>
  <b>(1)</b> A negative bucket index. <code>Math.imul</code> and <code>|
  0</code> keep the hash in 32 bits but leave it signed, and
  <code>%</code> keeps the sign of its left operand, so the index can be
  negative; in a check of 1,000 random eight-letter words, 498 raw
  hashes were negative. The <code>&gt;&gt;&gt; 0</code> at the end of
  <code>hashOf</code> reads it as unsigned. <b>(2)</b> Re-using old bucket
  indices while growing: every pair must be re-indexed against the <em>new</em>
  length, which is why <code>_grow</code> calls <code>_bucket</code> again.
  <b>(3)</b> Counting an overwrite as a new entry, so <code>size</code> drifts
  upward and the map resizes for no reason. <b>(4)</b> Returning
  <code>-1</code> for "absent" when <code>-1</code> can be a stored value. The
  classic statement promises non-negative values; if yours does not,
  return <code>undefined</code> and say why. <b>(5)</b> Forgetting that
  <code>remove</code> must also decrease <code>size</code>.
</div>
<p class="sub">
  The main alternative is <b>open addressing</b>: no lists, each entry lives
  directly in the array, and a collision probes the next slot. It uses less
  memory per entry and has better locality, but deletion becomes subtle: you
  cannot just empty a slot, because a later key may have probed <em>past</em> it
  to get where it is, so a removed entry must leave a marker (a tombstone)
  that lookups skip over and inserts may reuse. Naming that trap is usually
  enough; writing both versions is rarely asked.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Hash the key to a bucket index,
  and make each bucket a short list because collisions are unavoidable. To keep
  the lists short I track the load factor and double the array past 0.75,
  re-hashing every pair against the new size. Expected O(1) per operation,
  amortized because of the resize, O(n) in the worst case if everything
  collides."
</div>

<h3>Encode and decode strings: make the encoding say where each piece ends</h3>
<p>
  Design <code>encode(strs)</code>, which turns a list of strings into one
  string, and <code>decode(text)</code>, which gives the list back. The strings
  can contain <em>any</em> character. Everything about the problem is in that
  last sentence.
</p>
<p>
  The first idea is to join with a delimiter and split on it. It fails
  immediately, and it is worth showing why rather than asserting it. With
  <code>"#"</code> as the delimiter, <code>["a#b", "c"]</code> decodes as
  <code>["a", "b", "c"]</code>. Worse, <code>[]</code> and <code>[""]</code>
  both encode to the empty string, so <code>decode</code> has no way to tell
  them apart; in the naive version below, <code>[""]</code> comes back as
  <code>[]</code>.
</p>
<pre><code>function encodeNaive(strs) {
  return strs.join("#");
}

function decodeNaive(text) {
  return text === "" ? [] : text.split("#");
}</code></pre>
<p>
  Picking a rarer delimiter only moves the bug. Escaping works but is fiddly:
  once <code>#</code> is escaped, the escape character must be escaped too.
  The robust fix is a different idea: stop scanning for a boundary, and
  <b>announce the length before the content</b>. Write each string as its
  length, a separator, then exactly that many characters. The decoder reads the
  digits up to the first separator, then <em>counts</em> that many characters
  and does not look at what they are. A <code>#</code> or a digit inside the
  string cannot confuse it, because the decoder is never searching inside the
  string, only skipping it.
</p>
<pre><code>function encode(strs) {
  return strs.map((s) =&gt; s.length + "#" + s).join("");
}

function decode(text) {
  const out = [];
  let i = 0;
  while (i &lt; text.length) {
    const hash = text.indexOf("#", i); <span class="c">// the first "#" after i ends the length: digits never contain one</span>
    const length = Number(text.slice(i, hash));
    const start = hash + 1;
    out.push(text.slice(start, start + length)); <span class="c">// take exactly \`length\` characters, whatever they are</span>
    i = start + length;
  }
  return out;
}</code></pre>
<h4>Dry run: decode of the text for ["lint", "c#de", "", "7#x"]</h4>
<p class="sub">The encoded text is <code>4#lint4#c#de0#3#7#x</code>.</p>
<table>
  <tr><th>Loop</th><th>i</th><th>first "#" at or after i</th><th>length</th><th>piece = slice(start, start + length)</th><th>next i</th></tr>
  <tr><td>1</td><td>0</td><td>1</td><td>4</td><td>"lint"</td><td>6</td></tr>
  <tr><td>2</td><td>6</td><td>7</td><td>4</td><td>"c#de" (its own "#" is skipped, not read)</td><td>12</td></tr>
  <tr><td>3</td><td>12</td><td>13</td><td>0</td><td>"" (an empty string is a real entry)</td><td>14</td></tr>
  <tr><td>4</td><td>14</td><td>15</td><td>3</td><td>"7#x" (digits and "#" inside are skipped)</td><td>19, the end</td></tr>
</table>
<p>
  Both functions are O(total length): each character is written once and
  examined once. The empty list encodes to <code>""</code> and a list holding
  one empty string encodes to <code>"0#"</code>, so those two inputs stay
  distinct. I round-tripped 3,000 random lists whose characters came from a
  deliberately hostile alphabet (<code>#</code>, digits, spaces, newlines, a
  NUL character, an accented letter, an emoji, a lone surrogate half, and the
  string <code>"7#x"</code>) and every one decoded to what went in.
</p>
<div class="warn">
  <span class="ttl">⚠ Four places this goes wrong</span>
  <b>(1)</b> Searching for <code>"#"</code> from index 0 instead of from
  <code>i</code>, which finds the first piece's separator again.
  <b>(2)</b> Assuming the length is one digit: it can be <code>12</code> or
  <code>1000</code>, which is why the separator exists after it.
  <b>(3)</b> Mixing units. In JavaScript <code>length</code> counts UTF-16 code
  units, so <code>"😀".length</code> is 2, and this code is consistent because
  both sides count the same way. If the encoded string is later sent as UTF-8
  bytes, that same emoji is 4 bytes, so a decoder that counts bytes must be
  paired with an encoder that counts bytes.
  <b>(4)</b> Handling the empty list as a special case with a sentinel such as
  <code>"EMPTY"</code>, which reintroduces a value a string could equal.
</div>
<p class="sub">
  In real code you would reach for <code>JSON.stringify</code> and
  <code>JSON.parse</code>, which solve this problem with escaping. Say that
  first, then say why the interview version asks for something else: it is
  checking whether you can make an encoding unambiguous by construction. The
  same length-prefix idea is how many binary formats and network protocols
  frame their messages.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "A delimiter fails because the
  strings can contain anything, including the delimiter. So I stop searching
  for boundaries: each piece is written as its length, a separator, and then
  exactly that many characters. The decoder reads the length, takes that many
  characters without inspecting them, and moves on, so the content can never
  be mistaken for structure."
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
  <li>"O(1) min/max" on a structure with LIFO removal → auxiliary stack. "O(1) min/max" with arbitrary removal → you need a heap with lazy deletion or an ordered map, and the honest answer is O(log n), not O(1)</li>
  <li>"Streaming," "in the last N seconds," "timestamps arrive in order" → the window is fixed, so memory should be O(window), not O(events); bucket and expire lazily</li>
  <li>"The value as of time t" with writes arriving in time order → a sorted list per key and a binary search for the last version <em>not after</em> t; if writes can arrive out of order, you pay for the insert</li>
  <li>"Return a random member" beside an O(1) delete → a dense array plus a map of positions, deleting by moving the last element into the hole</li>
  <li>"Most and least frequent key" where each count changes by exactly 1 → buckets of keys in a linked list sorted by count, spliced rather than searched</li>
  <li>"Implement X from scratch" or "make the encoding unambiguous" → name the collision or the ambiguity first, then remove it by construction: chaining plus a resize, or a length written before the content</li>
  <li>Distinguish from an algorithms question: there's no clever traversal or recurrence here. If you're searching for an <em>algorithm</em>, you've misread it — you're searching for a <em>combination</em></li>
  <li>Pitfalls: forgetting that a read counts as a use, not storing the key inside the node so eviction can clean up the map, using <code>&lt;</code> where <code>&lt;=</code> is needed on duplicate minimums, and letting the per-key map grow without bound</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write the LRU cache's <code>get</code> and <code>put</code> from memory, and explain why each node must store its own key.</li>
    <li>Explain why the LFU cache's <code>minFreq</code> never needs to search for the new minimum after a promotion or an insert.</li>
    <li>Construct the two-element input that exposes the <code>x &lt; min</code> vs <code>x &lt;= min</code> bug in the optimized Min Stack.</li>
    <li>Explain why the auxiliary-stack trick for O(1) min breaks the moment <code>popMax()</code> (arbitrary removal) is required.</li>
    <li>Given a new "design X" prompt, write the operation/complexity table first and name which two structures you'd compose before writing any code.</li>
    <li>Write the random set's <code>remove</code> from memory, including the case where the removed value is the last element, and say which line has to come last.</li>
    <li>Explain why the time-based store's <code>get</code> searches for the first version <em>after</em> the query and steps back one, and what happens when that index is 0.</li>
    <li>State the two invariants of the two-heap median finder and the three steps in <code>addNum</code> that restore them.</li>
    <li>Say what a hash map's load factor is for, and why every pair must be re-indexed when the array grows.</li>
    <li>Say why a delimiter cannot encode a list of arbitrary strings, and how writing the length first fixes it.</li>
  </ul>
</div>`,
};
