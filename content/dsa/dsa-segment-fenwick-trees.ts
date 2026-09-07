import type { Chapter } from "../types";

export const dsaSegmentFenwickTrees: Chapter = {
  id: "dsa-segment-fenwick-trees",
  num: "A6",
  title: "Segment trees & Fenwick trees",
  short: "Segment & Fenwick trees",
  levels: ["advanced"],
  practice: [
    "ex-range-sum-query-mutable",
    "ex-fenwick-binary-indexed-tree",
    "ex-range-minimum-query-segment-tree",
    "ex-count-of-smaller-numbers-after-self",
    "ex-range-sum-query-2d-mutable",
  ],
  ready: true,
  subtitle: "Prefix sums die the moment the array can change — these two structures buy back updates for a log factor.",
  body: `<h3>Where the prefix-sum array falls over</h3>
<p>
  A prefix-sum array is unbeatable on a <em>static</em> array: O(n) to build,
  O(1) per range query. The moment an element can change, it collapses —
  updating index i invalidates every prefix from i onward, so each update is
  O(n). Skip the precompute and you flip the problem: O(1) updates, O(n)
  queries. Either way an interleaved workload of q operations costs O(n·q),
  and with n and q around 10<sup>5</sup> that's 10<sup>10</sup> operations.
</p>
<table>
  <tr><th>Structure</th><th>Build</th><th>Range query</th><th>Point update</th><th>10⁵ mixed ops</th></tr>
  <tr><td>Raw array, loop each query</td><td>O(1)</td><td>O(n)</td><td>O(1)</td><td>~10¹⁰ — too slow</td></tr>
  <tr><td>Prefix-sum array</td><td>O(n)</td><td>O(1)</td><td>O(n)</td><td>~10¹⁰ — too slow</td></tr>
  <tr><td>Fenwick / segment tree</td><td>O(n)</td><td>O(log n)</td><td>O(log n)</td><td>~1.7 × 10⁶ — fine</td></tr>
</table>
<p class="sub">
  The move both structures make is the same one binary search makes: refuse to
  store either extreme. Don't store every individual element (queries too slow)
  and don't store every prefix (updates too slow) — store O(n) carefully chosen
  <em>partial</em> aggregates such that any range is assembled from O(log n) of
  them and any element belongs to only O(log n) of them.
</p>

<h3>The segment tree: one node per range</h3>
<p>
  Build a binary tree over index ranges. The root covers [0, n−1], each internal
  node splits its range in half, and leaves are single elements. Every node
  caches the aggregate of its range. A query for [l, r] descends from the root
  and stops the instant a node's range is fully contained — so an arbitrary
  range is covered by at most 2 nodes per level, i.e. O(log n) nodes total.
</p>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A segment tree over the eight element array 3 1 4 1 5 9 2 6, with the two nodes that answer a query for the range two to five highlighted in green">
    <g class="rough">
      <path class="ln" d="M320,42 L160,102" />
      <path class="ln" d="M320,42 L480,102" />
      <path class="ln" d="M160,102 L80,162" />
      <path class="lng" d="M160,102 L240,162" />
      <path class="lng" d="M480,102 L400,162" />
      <path class="ln" d="M480,102 L560,162" />
      <path class="ln" d="M80,162 L40,222" /><path class="ln" d="M80,162 L120,222" />
      <path class="ln" d="M240,162 L200,222" /><path class="ln" d="M240,162 L280,222" />
      <path class="ln" d="M400,162 L360,222" /><path class="ln" d="M400,162 L440,222" />
      <path class="ln" d="M560,162 L520,222" /><path class="ln" d="M560,162 L600,222" />
    </g>
    <g class="rough">
      <rect class="box" x="277" y="26" width="86" height="32" rx="6" />
      <rect class="box" x="122" y="86" width="76" height="32" rx="6" />
      <rect class="box" x="442" y="86" width="76" height="32" rx="6" />
      <rect class="box" x="47" y="146" width="66" height="32" rx="6" />
      <rect class="boxg" x="207" y="146" width="66" height="32" rx="6" />
      <rect class="boxg" x="367" y="146" width="66" height="32" rx="6" />
      <rect class="box" x="527" y="146" width="66" height="32" rx="6" />
      <rect class="box" x="18" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="98" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="178" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="258" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="338" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="418" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="498" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="578" y="206" width="44" height="30" rx="5" />
    </g>
    <text class="sm" x="320" y="47" text-anchor="middle">[0..7] = 31</text>
    <text class="sm" x="160" y="107" text-anchor="middle">[0..3] = 9</text>
    <text class="sm" x="480" y="107" text-anchor="middle">[4..7] = 22</text>
    <text class="sm" x="80" y="167" text-anchor="middle">[0..1]=4</text>
    <text class="sm gr" x="240" y="167" text-anchor="middle">[2..3]=5</text>
    <text class="sm gr" x="400" y="167" text-anchor="middle">[4..5]=14</text>
    <text class="sm" x="560" y="167" text-anchor="middle">[6..7]=8</text>
    <text class="sm" x="40" y="226" text-anchor="middle">3</text>
    <text class="sm" x="120" y="226" text-anchor="middle">1</text>
    <text class="sm" x="200" y="226" text-anchor="middle">4</text>
    <text class="sm" x="280" y="226" text-anchor="middle">1</text>
    <text class="sm" x="360" y="226" text-anchor="middle">5</text>
    <text class="sm" x="440" y="226" text-anchor="middle">9</text>
    <text class="sm" x="520" y="226" text-anchor="middle">2</text>
    <text class="sm" x="600" y="226" text-anchor="middle">6</text>
    <text class="lbl gr" x="20" y="20" style="font-size:14px">query(2, 5) = [2..3] + [4..5] = 5 + 14 = 19 — two nodes, not four leaves</text>
  </svg>
  <figcaption>Any range decomposes into O(log n) fully-covered nodes. Changing one leaf only touches the log n ancestors above it, which is where the fast update comes from.</figcaption>
</figure>

<h3>Build, query, update</h3>
<p>
  Store the tree in a flat array with the heap layout: node 1 is the root, node
  k's children are 2k and 2k+1. Every recursive call carries the range it owns
  (<code>lo</code>, <code>hi</code>) so no range metadata is stored per node.
</p>
<pre><code>class SegmentTree {
  constructor(nums) {
    this.n = nums.length;
    this.t = new Array(4 * this.n).fill(0); <span class="c">// 4n is the safe size — see the warning below</span>
    if (this.n > 0) this._build(nums, 1, 0, this.n - 1);
  }

  _build(nums, node, lo, hi) {
    if (lo === hi) { this.t[node] = nums[lo]; return; } <span class="c">// leaf</span>
    const mid = (lo + hi) >> 1;
    this._build(nums, 2 * node, lo, mid);
    this._build(nums, 2 * node + 1, mid + 1, hi);
    this.t[node] = this.t[2 * node] + this.t[2 * node + 1]; <span class="c">// merge children upward</span>
  }

  <span class="c">// sum of nums[l..r] inclusive — O(log n)</span>
  query(l, r, node = 1, lo = 0, hi = this.n - 1) {
    if (r < lo || hi < l) return 0;              <span class="c">// no overlap — return the IDENTITY, not 0 blindly</span>
    if (l <= lo && hi <= r) return this.t[node]; <span class="c">// total overlap — cached answer, stop descending</span>
    const mid = (lo + hi) >> 1;                  <span class="c">// partial overlap — split and combine</span>
    return this.query(l, r, 2 * node, lo, mid)
         + this.query(l, r, 2 * node + 1, mid + 1, hi);
  }

  <span class="c">// set nums[i] = value — O(log n), touches exactly one root-to-leaf path</span>
  update(i, value, node = 1, lo = 0, hi = this.n - 1) {
    if (lo === hi) { this.t[node] = value; return; }
    const mid = (lo + hi) >> 1;
    if (i <= mid) this.update(i, value, 2 * node, lo, mid);
    else          this.update(i, value, 2 * node + 1, mid + 1, hi);
    this.t[node] = this.t[2 * node] + this.t[2 * node + 1]; <span class="c">// re-merge on the way back up</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Two sizing/identity traps</span>
  <b>4n, not 2n.</b> When n isn't a power of two the tree is unbalanced in the
  heap layout and indices can reach just past 2n; 4n is the standard safe
  over-allocation (the tight bound is 2·2<sup>⌈log₂ n⌉</sup>, which is easier
  to just round up than to compute). <b>The no-overlap return must be the
  operation's identity.</b> Returning 0 is right for sum, catastrophically
  wrong for min — a min tree must return <code>Infinity</code> there, or every
  query gets dragged to 0.
</div>

<h3>Range min, max, gcd — only the merge changes</h3>
<p>
  Nothing about the traversal is sum-specific. Swap the merge function and the
  identity element and the same tree answers a different question. The only
  requirement is that the operation be <b>associative</b> — the tree combines
  sub-answers in a fixed nesting, so order of grouping must not matter.
</p>
<table>
  <tr><th>Query</th><th>merge(a, b)</th><th>identity (no-overlap return)</th><th>Fenwick can do it?</th></tr>
  <tr><td>range sum</td><td><code>a + b</code></td><td><code>0</code></td><td>yes — subtraction inverts it</td></tr>
  <tr><td>range min</td><td><code>Math.min(a, b)</code></td><td><code>Infinity</code></td><td>no — prefix min can't be un-done</td></tr>
  <tr><td>range max</td><td><code>Math.max(a, b)</code></td><td><code>-Infinity</code></td><td>no</td></tr>
  <tr><td>range gcd</td><td><code>gcd(a, b)</code></td><td><code>0</code></td><td>no</td></tr>
  <tr><td>range XOR</td><td><code>a ^ b</code></td><td><code>0</code></td><td>yes — XOR is its own inverse</td></tr>
  <tr><td>count of a value</td><td><code>a + b</code></td><td><code>0</code></td><td>yes</td></tr>
</table>
<p class="sub">
  That last column is the deep reason the two structures aren't interchangeable.
  A Fenwick tree answers range queries as <code>prefix(r) − prefix(l−1)</code>,
  which needs an <em>invertible</em> operation. Min has no inverse — you cannot
  recover min(l..r) from min(0..r) and min(0..l−1) — so range-min genuinely
  requires a segment tree (or, if the array never changes, a sparse table).
</p>

<h3>Lazy propagation: range updates without touching every leaf</h3>
<p>
  Now let updates be ranges too: "add 5 to everything in [l, r]." Doing that
  with point updates is O(n log n) per operation — worse than a plain loop. The
  fix is to be lazy: when a node's range is fully inside the update range, apply
  the change to <em>that node's aggregate only</em> and leave an IOU on it
  saying "my children still owe this." The IOU is pushed down one level at a
  time, and only when someone actually descends through that node.
</p>
<p>
  The whole technique is two rules. <b>Push before you look</b> — any node you
  visit must settle its debt before you read or split it. <b>Stop at total
  coverage</b> — record the IOU and return without recursing. Together they keep
  every range update at O(log n).
</p>
<pre><code>class LazySumTree {
  constructor(n) {
    this.n = n;
    this.t = new Array(4 * n).fill(0);
    this.lazy = new Array(4 * n).fill(0); <span class="c">// pending "+x to every element in my range"</span>
  }

  _push(node, lo, hi) {
    const add = this.lazy[node];
    if (add === 0) return;
    this.t[node] += add * (hi - lo + 1); <span class="c">// a range add of x raises the SUM by x * width</span>
    if (lo !== hi) {                      <span class="c">// leaves have nobody to hand the debt to</span>
      this.lazy[2 * node] += add;
      this.lazy[2 * node + 1] += add;
    }
    this.lazy[node] = 0;
  }

  rangeAdd(l, r, add, node = 1, lo = 0, hi = this.n - 1) {
    this._push(node, lo, hi);            <span class="c">// settle before doing anything else</span>
    if (r < lo || hi < l) return;
    if (l <= lo && hi <= r) {            <span class="c">// fully covered — take the IOU and STOP</span>
      this.lazy[node] += add;
      this._push(node, lo, hi);          <span class="c">// apply to this node so its parent can re-merge</span>
      return;
    }
    const mid = (lo + hi) >> 1;
    this.rangeAdd(l, r, add, 2 * node, lo, mid);
    this.rangeAdd(l, r, add, 2 * node + 1, mid + 1, hi);
    this.t[node] = this.t[2 * node] + this.t[2 * node + 1];
  }

  query(l, r, node = 1, lo = 0, hi = this.n - 1) {
    this._push(node, lo, hi);            <span class="c">// same rule on the read path</span>
    if (r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return this.t[node];
    const mid = (lo + hi) >> 1;
    return this.query(l, r, 2 * node, lo, mid)
         + this.query(l, r, 2 * node + 1, mid + 1, hi);
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Forgetting <code>* (hi - lo + 1)</code>, and mixing update kinds</span>
  Adding x to a range of width w raises that node's <em>sum</em> by x·w, not by
  x. On a min/max tree it really is just <code>+= x</code> (adding a constant
  shifts the minimum by that constant), so the multiplier is sum-specific — get
  it wrong and small tests still pass because width-1 leaves are correct.
  Separately: "add x to a range" and "assign x to a range" are different lazy
  values and cannot share one field naively — if a problem needs both, store the
  assignment tag and the pending add together, and apply assignment first.
</div>

<h3>Fenwick tree: the same job in a quarter of the code</h3>
<p>
  A Binary Indexed Tree does point-update / prefix-query with one flat array and
  two three-line loops. The idea: store in <code>t[k]</code> the sum of the
  <code>k &amp; -k</code> elements ending at k, where <code>k &amp; -k</code>
  isolates the lowest set bit. Then any prefix is assembled by repeatedly
  stripping the lowest set bit, and any index is updated by repeatedly adding it
  — both take as many steps as there are bits, so O(log n).
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Coverage ranges of a Fenwick tree over eight elements, with the three nodes that combine to form the prefix sum up to index seven highlighted in green">
    <g class="rough">
      <rect class="box"  x="30"  y="34"  width="60"  height="16" rx="3" />
      <rect class="box"  x="30"  y="56"  width="130" height="16" rx="3" />
      <rect class="box"  x="170" y="78"  width="60"  height="16" rx="3" />
      <rect class="boxg" x="30"  y="100" width="270" height="16" rx="3" />
      <rect class="box"  x="310" y="122" width="60"  height="16" rx="3" />
      <rect class="boxg" x="310" y="144" width="130" height="16" rx="3" />
      <rect class="boxg" x="450" y="166" width="60"  height="16" rx="3" />
      <rect class="box"  x="30"  y="188" width="550" height="16" rx="3" />
    </g>
    <text class="sm" x="36" y="47">t[1]</text>
    <text class="sm" x="36" y="69">t[2]</text>
    <text class="sm" x="176" y="91">t[3]</text>
    <text class="sm gr" x="36" y="113">t[4] — covers 1..4</text>
    <text class="sm" x="316" y="135">t[5]</text>
    <text class="sm gr" x="316" y="157">t[6] — covers 5..6</text>
    <text class="sm gr" x="456" y="179">t[7]</text>
    <text class="sm" x="36" y="201">t[8] — covers 1..8</text>
    <text class="sm" x="60" y="226" text-anchor="middle">1</text>
    <text class="sm" x="130" y="226" text-anchor="middle">2</text>
    <text class="sm" x="200" y="226" text-anchor="middle">3</text>
    <text class="sm" x="270" y="226" text-anchor="middle">4</text>
    <text class="sm" x="340" y="226" text-anchor="middle">5</text>
    <text class="sm" x="410" y="226" text-anchor="middle">6</text>
    <text class="sm" x="480" y="226" text-anchor="middle">7</text>
    <text class="sm" x="550" y="226" text-anchor="middle">8</text>
    <text class="lbl gr" x="20" y="20" style="font-size:14px">prefix(7) = t[7] + t[6] + t[4] — strip the lowest set bit: 7 → 6 → 4 → 0</text>
    <text class="sm rd" x="20" y="245">update(3) walks the other way, adding the low bit: 3 → 4 → 8</text>
  </svg>
  <figcaption>Each cell covers a power-of-two-sized block ending at its own index. Query walks left by removing low bits, update walks right by adding them — never more than log n steps either way.</figcaption>
</figure>

<pre><code>class Fenwick {
  constructor(n) {
    this.n = n;
    this.t = new Array(n + 1).fill(0); <span class="c">// 1-INDEXED internally; index 0 is unusable</span>
  }

  <span class="c">// add delta at 0-indexed position i — O(log n)</span>
  update(i, delta) {
    for (let k = i + 1; k <= this.n; k += k & -k) this.t[k] += delta;
  }

  <span class="c">// sum of nums[0..i] inclusive — O(log n)</span>
  prefix(i) {
    let sum = 0;
    for (let k = i + 1; k > 0; k -= k & -k) sum += this.t[k];
    return sum;
  }

  range(l, r) {
    return this.prefix(r) - (l > 0 ? this.prefix(l - 1) : 0); <span class="c">// needs an invertible op</span>
  }

  <span class="c">// O(n) build — much better than n calls to update(), which is O(n log n)</span>
  static from(nums) {
    const f = new Fenwick(nums.length);
    for (let i = 0; i < nums.length; i++) f.t[i + 1] += nums[i];
    for (let k = 1; k <= f.n; k++) {
      const parent = k + (k & -k);
      if (parent <= f.n) f.t[parent] += f.t[k]; <span class="c">// push each cell into the one that contains it</span>
    }
    return f;
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Fenwick stores <em>deltas</em>, not values</span>
  <code>update(i, delta)</code> <b>adds</b>; it does not assign. To <em>set</em>
  <code>nums[i] = v</code> you must keep the raw array alongside and call
  <code>update(i, v - nums[i])</code>, then write <code>nums[i] = v</code>.
  Passing the new value straight in is the single most common Fenwick bug, and
  it produces plausible-looking wrong answers rather than a crash. Related: the
  1-indexing is not stylistic — <code>k & -k</code> is 0 when k is 0, so a
  0-indexed loop never terminates.
</div>

<h3>Why Fenwick usually wins in practice</h3>
<p>
  Both are O(log n), but the constants differ a lot. The Fenwick array is n+1
  entries versus 4n; the loops are iterative with no recursion, no range
  bookkeeping and no branching; and access is a tight sequence of index
  arithmetic that the cache handles well. Expect a 2–4× real-time speedup and
  roughly a quarter of the code. It is also far easier to write correctly under
  interview pressure — two loops with no off-by-one range logic.
</p>
<p class="sub">
  The price is expressiveness. Fenwick does point-update + prefix-query of an
  invertible operation, and (via a difference array) range-update + point-query.
  Everything else — range min/max, range update <em>and</em> range query
  together, "find the k-th element," storing anything richer than a number per
  node — is segment tree territory.
</p>

<h3>Count of smaller numbers after self — the classic BIT problem</h3>
<p>
  For each element, how many elements to its right are strictly smaller? Brute
  force is O(n²). The trick is to sweep right-to-left over <em>value ranks</em>
  instead of positions: a Fenwick tree over ranks makes "how many already-seen
  values rank below this one?" a single prefix query.
</p>
<pre><code><span class="c">// O(n log n) time, O(n) space</span>
function countSmaller(nums) {
  <span class="c">// coordinate compression: values can be huge/negative, ranks are 0..m-1</span>
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const rank = new Map(sorted.map((v, i) => [v, i]));

  const bit = new Fenwick(sorted.length);
  const res = new Array(nums.length);

  for (let i = nums.length - 1; i >= 0; i--) { <span class="c">// right to left: "seen" == "to my right"</span>
    const r = rank.get(nums[i]);
    res[i] = r > 0 ? bit.prefix(r - 1) : 0; <span class="c">// count of seen values with a STRICTLY lower rank</span>
    bit.update(r, 1);                        <span class="c">// now this element counts as seen</span>
  }
  return res;
}</code></pre>
<p class="sub">
  Coordinate compression is the reusable half of this idea: whenever you want a
  Fenwick indexed by value but values are unbounded, sort the distinct values
  and index by rank. The same right-to-left + BIT skeleton solves counting
  inversions, "reverse pairs," and range-sum-count problems — recognising the
  skeleton is worth more than memorising any one of them.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Queries and updates are
  interleaved, so a prefix-sum array would cost O(n) per update. I'll use a
  Fenwick tree — point update and prefix query both O(log n), and range sum is
  just the difference of two prefixes. If the problem needed range minimum, or
  range updates as well as range queries, I'd move to a segment tree with lazy
  propagation instead, since min has no inverse and Fenwick can't do it."
</div>

<h3>Which one to reach for</h3>
<table>
  <tr><th>Workload</th><th>Use</th><th>Why</th></tr>
  <tr><td>Static array, many range queries</td><td><b>Prefix-sum array</b></td><td>O(1) queries; a tree is pure overhead</td></tr>
  <tr><td>Static array, range <em>min/max</em> only</td><td><b>Sparse table</b></td><td>O(n log n) build, O(1) query, no updates</td></tr>
  <tr><td>Point update + prefix/range <b>sum</b></td><td><b>Fenwick</b></td><td>smallest, fastest, hardest to get wrong</td></tr>
  <tr><td>Range update + <em>point</em> query</td><td><b>Fenwick over a difference array</b></td><td>add x at l, subtract x at r+1; point value = prefix sum</td></tr>
  <tr><td>Point update + range <b>min/max/gcd</b></td><td><b>Segment tree</b></td><td>non-invertible merge — prefixes can't be subtracted</td></tr>
  <tr><td>Range update + range query</td><td><b>Segment tree + lazy</b></td><td>the only one of the three that can defer work</td></tr>
  <tr><td>Rich per-node state (max subarray, k-th element, merge sort tree)</td><td><b>Segment tree</b></td><td>a node can hold a struct, not just a number</td></tr>
  <tr><td>2D grid sums with updates</td><td><b>2D Fenwick</b></td><td>nested loops over both dimensions, O(log² n)</td></tr>
</table>

<div class="sticky mint">
  <span class="ttl">One sentence to keep</span>
  A prefix-sum array is a segment tree that gave up on updates; a Fenwick tree
  is a segment tree that gave up on everything except invertible prefixes. Start
  at the cheapest one that still answers the question, and only climb when the
  workload forces you to.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Queries and <b>updates are interleaved</b> over the same array — that single word "update" is what rules out a prefix-sum array</li>
  <li>Constraints around n, q ≥ 10<sup>5</sup> with per-query work implied — O(n·q) is 10<sup>10</sup>, so an O(log n) per operation structure is the intended answer</li>
  <li>Brute force is "recompute the range every time"; the fix is caching O(n) partial aggregates so any range is O(log n) of them</li>
  <li>Sum-like and invertible (sum, XOR, count) → Fenwick. Min/max/gcd, or updates that span ranges → segment tree</li>
  <li>"How many earlier/later elements are smaller/larger" or "count inversions" → sweep in one direction with a Fenwick over compressed value ranks, not over positions</li>
  <li>Distinguish from a heap: a heap gives you the global min/max with updates, but cannot answer <em>a specific range</em>. Distinguish from a sorted structure: if you need order statistics <em>plus</em> ranges, that's a Fenwick over ranks</li>
  <li>If the array never changes after construction, stop — prefix sums or a sparse table, and say why you didn't build a tree</li>
</ul>`,
};
