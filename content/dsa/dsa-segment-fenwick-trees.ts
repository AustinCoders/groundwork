import type { Chapter } from "../types";

export const dsaSegmentFenwickTrees: Chapter = {
  id: "dsa-segment-fenwick-trees",
  num: "A6",
  title: "Segment trees & Fenwick trees",
  short: "Segment & Fenwick trees",
  levels: ["advanced"],
  prerequisites: ["dsa-trees", "dsa-prefix-sums"],
  practice: [
    "ex-range-sum-query-mutable",
    "ex-fenwick-binary-indexed-tree",
    "ex-range-minimum-query-segment-tree",
    "ex-count-of-smaller-numbers-after-self",
    "ex-range-sum-query-2d-mutable",
    "ex-count-inversions",
    "ex-fenwick-kth-smallest",
    "ex-range-add-range-sum",
    "ex-maximum-subarray-with-updates",
    "ex-reverse-pairs",
    "ex-count-of-range-sum",
    "ex-my-calendar-iii",
    "ex-fruits-into-baskets",
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
<h4>Dry run: query(2,5), then update(4,10), then query(2,5) again — on [3,1,4,1,5,9,2,6]</h4>
<table>
  <tr><th>Call</th><th>node [lo,hi]</th><th>Overlap with [2,5]</th><th>Returns</th></tr>
  <tr><td>query(2,5)</td><td>1 [0,7]</td><td>partial — split</td><td>node 2's answer + node 3's answer</td></tr>
  <tr><td></td><td>2 [0,3]</td><td>partial — split</td><td>node 4's answer + node 5's answer</td></tr>
  <tr><td></td><td>4 [0,1]</td><td>none</td><td>0</td></tr>
  <tr><td></td><td>5 [2,3]</td><td>full</td><td>t[5] = 5</td></tr>
  <tr><td></td><td>3 [4,7]</td><td>partial — split</td><td>node 6's answer + node 7's answer</td></tr>
  <tr><td></td><td>6 [4,5]</td><td>full</td><td>t[6] = 14</td></tr>
  <tr><td></td><td>7 [6,7]</td><td>none</td><td>0</td></tr>
  <tr><td colspan="3">query(2,5) total</td><td><b>0 + 5 + 0 + 14 = 19</b></td></tr>
  <tr><td>update(4, 10)</td><td>leaf 12 [4,4]</td><td>—</td><td>t[12] = 10</td></tr>
  <tr><td></td><td>re-merge 6 [4,5]</td><td>—</td><td>t[6] = t[12] + t[13] = 10 + 9 = 19</td></tr>
  <tr><td></td><td>re-merge 3 [4,7]</td><td>—</td><td>t[3] = t[6] + t[7] = 19 + 8 = 27</td></tr>
  <tr><td></td><td>re-merge 1 [0,7]</td><td>—</td><td>t[1] = t[2] + t[3] = 9 + 27 = 36</td></tr>
  <tr><td>query(2,5) again</td><td>same path</td><td>—</td><td>t[5]=5, t[6]=19 → <b>24</b></td></tr>
</table>
<p class="sub">
  Only the nodes on the root-to-leaf chain for index 4 ever change — 12, then 6,
  then 3, then 1 — which is exactly why <code>update</code> is O(log n) instead
  of O(n). The first <code>query(2,5)</code> never even visits node 12; it reads
  the already-cached <code>t[6] = 14</code>. The update then refreshed that cache to
  19 on its way up, so bumping index 4 from 5 to 10 shifts the range answer from
  19 to 24 without anyone re-summing the range.
</p>
<div class="warn">
  <span class="ttl">⚠ Two sizing/identity traps</span>
  <b>4n, not 2n.</b> When n isn't a power of two the tree is unbalanced in the
  heap layout and indices can reach almost 4n (for n = 2080 the largest is about 3.9n); 4n is
  the standard safe over-allocation, which is easier to just use than to
  compute a tighter bound. <b>The no-overlap return must be the
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

<h3>Struct nodes: when a node stores more than one number</h3>
<p>
  So far every node held one number and the merge was one operator. Some
  questions need a node to remember <em>several</em> facts about its range, so
  that two halves can be combined without re-reading either. The standard
  example is the <b>maximum subarray sum</b> (the best non-empty contiguous
  run) with point updates, which a Fenwick tree cannot do and a prefix-sum array
  cannot do once values change.
</p>
<p>
  Ask what you would need to know about a left half L and a right half R to get
  the answer for the joined range. The best subarray of L∪R is one of three
  things: entirely inside L, entirely inside R, or <em>crossing the middle</em>,
  in which case it is a suffix of L glued to a prefix of R. So each node stores
  four numbers: <code>sum</code> (the whole range), <code>prefix</code> (the best
  run starting at the left end), <code>suffix</code> (the best run ending at the
  right end) and <code>best</code> (the best run anywhere). Each of the four can
  itself be derived from the children's four:
</p>
<table>
  <tr><th>field of the merged node</th><th>how it comes from L and R</th></tr>
  <tr><td><code>sum</code></td><td>L.sum + R.sum</td></tr>
  <tr><td><code>prefix</code></td><td>the better of L.prefix and (L.sum + R.prefix): stop inside L, or take all of L and keep going</td></tr>
  <tr><td><code>suffix</code></td><td>the better of R.suffix and (R.sum + L.suffix)</td></tr>
  <tr><td><code>best</code></td><td>the best of L.best, R.best and (L.suffix + R.prefix)</td></tr>
</table>
<pre><code>class MaxSubarrayTree {
  constructor(nums) {
    this.n = nums.length;
    this.t = new Array(4 * this.n);
    if (this.n > 0) this._build(nums, 1, 0, this.n - 1);
  }

  static leaf(v) { return { sum: v, prefix: v, suffix: v, best: v }; } <span class="c">// non-empty runs only</span>

  static merge(a, b) { <span class="c">// order matters: a is the LEFT half</span>
    return {
      sum: a.sum + b.sum,
      prefix: Math.max(a.prefix, a.sum + b.prefix),
      suffix: Math.max(b.suffix, b.sum + a.suffix),
      best: Math.max(a.best, b.best, a.suffix + b.prefix),
    };
  }

  _build(nums, node, lo, hi) {
    if (lo === hi) { this.t[node] = MaxSubarrayTree.leaf(nums[lo]); return; }
    const mid = (lo + hi) >> 1;
    this._build(nums, 2 * node, lo, mid);
    this._build(nums, 2 * node + 1, mid + 1, hi);
    this.t[node] = MaxSubarrayTree.merge(this.t[2 * node], this.t[2 * node + 1]);
  }

  update(i, value, node = 1, lo = 0, hi = this.n - 1) {
    if (lo === hi) { this.t[node] = MaxSubarrayTree.leaf(value); return; }
    const mid = (lo + hi) >> 1;
    if (i &lt;= mid) this.update(i, value, 2 * node, lo, mid);
    else this.update(i, value, 2 * node + 1, mid + 1, hi);
    this.t[node] = MaxSubarrayTree.merge(this.t[2 * node], this.t[2 * node + 1]);
  }

  <span class="c">// best subarray sum inside nums[l..r] — O(log n)</span>
  query(l, r, node = 1, lo = 0, hi = this.n - 1) {
    if (r &lt; lo || hi &lt; l) return null; <span class="c">// no zero-like identity exists, so "nothing" is null</span>
    if (l &lt;= lo &amp;&amp; hi &lt;= r) return this.t[node];
    const mid = (lo + hi) >> 1;
    const left = this.query(l, r, 2 * node, lo, mid);
    const right = this.query(l, r, 2 * node + 1, mid + 1, hi);
    if (left === null) return right;
    if (right === null) return left;
    return MaxSubarrayTree.merge(left, right);
  }

  best(l, r) { return this.query(l, r).best; }
}</code></pre>
<h4>Dry run: build on [1, −3, 4, 2], then set index 1 to 5</h4>
<table>
  <tr><th>node (range)</th><th>sum</th><th>prefix</th><th>suffix</th><th>best</th><th>how</th></tr>
  <tr><td>[0,1]</td><td>−2</td><td>1</td><td>−2</td><td>1</td><td>merge(1, −3): prefix max(1, 1−3), suffix max(−3, −3+1), best max(1, −3, 1−3)</td></tr>
  <tr><td>[2,3]</td><td>6</td><td>6</td><td>6</td><td>6</td><td>merge(4, 2): everything is positive, so all four fields grow</td></tr>
  <tr><td>[0,3] root</td><td>4</td><td>4</td><td>6</td><td><b>6</b></td><td>best max(1, 6, suffix(−2) + prefix(6) = 4) is the run [4, 2]</td></tr>
  <tr><td colspan="6"><b>update(1, 5)</b>: only the leaf, [0,1] and the root are rebuilt</td></tr>
  <tr><td>[0,1]</td><td>6</td><td>6</td><td>6</td><td>6</td><td>merge(1, 5)</td></tr>
  <tr><td>[0,3] root</td><td>12</td><td>12</td><td>12</td><td><b>12</b></td><td>best max(6, 6, suffix 6 + prefix 6 = 12): the whole array</td></tr>
</table>
<p class="sub">
  The cost per query and per update is still O(log n); only the constant grows,
  because a node is four numbers and a merge is a handful of operations. The
  principle is the useful part: when a question about a range cannot be answered
  from one number per half, add the facts that <em>can</em>, until the merge
  closes. Longest run of equal values, the number of runs, "is this range
  sorted" and range-gcd-with-count are all built this way.
</p>
<div class="warn">
  <span class="ttl">⚠ Struct merges are not commutative</span>
  <code>merge(a, b)</code> and <code>merge(b, a)</code> give different answers,
  because prefix and suffix depend on which half is on the left. The recursive
  query above is safe because it always merges the left result with the right
  one. Also note there is no zero-like identity element: with empty runs not
  allowed, a range that overlaps nothing has no "empty" node of ordinary numbers
  that is neutral (a true one needs sum 0 and <code>-Infinity</code> in the other
  three fields, which is easy to get wrong), so the query returns
  <code>null</code> and the two <code>if</code> lines skip it. Initialising an empty node to zeros would silently allow the
  empty subarray and break all-negative inputs.
</div>

<h3>The iterative bottom-up segment tree</h3>
<p>
  The recursive tree needs 4n cells and pays for a function call per level. When
  you can use the half-open convention, there is a much shorter version with a
  flat array of exactly 2n cells: leaf i lives at index <code>n + i</code>, and
  node k is the merge of nodes 2k and 2k+1. Building is a single backwards loop,
  updating is "write the leaf, then walk to the root", and a query walks inward
  from both ends of the range at once.
</p>
<pre><code>class BottomUpTree {
  constructor(nums, merge, identity) {
    this.n = nums.length;
    this.merge = merge;
    this.identity = identity;
    this.t = new Array(2 * this.n).fill(identity);
    for (let i = 0; i &lt; this.n; i++) this.t[this.n + i] = nums[i]; <span class="c">// leaves</span>
    for (let k = this.n - 1; k >= 1; k--) this.t[k] = merge(this.t[2 * k], this.t[2 * k + 1]);
  }

  update(i, value) {
    let k = i + this.n;
    this.t[k] = value;
    for (k >>= 1; k >= 1; k >>= 1) this.t[k] = this.merge(this.t[2 * k], this.t[2 * k + 1]);
  }

  <span class="c">// merge of nums[l..r-1], half-open — O(log n)</span>
  query(l, r) {
    let left = this.identity, right = this.identity;
    for (l += this.n, r += this.n; l &lt; r; l >>= 1, r >>= 1) {
      if (l &amp; 1) left = this.merge(left, this.t[l++]);     <span class="c">// l is a right child: take it, step past it</span>
      if (r &amp; 1) right = this.merge(this.t[--r], right);   <span class="c">// r is exclusive: step back, then take it</span>
    }
    return this.merge(left, right);
  }
}</code></pre>
<p>
  Here is why the loop works. At each level, <code>l</code> is the leftmost node
  whose range is still inside the query, and <code>r</code> is one past the
  rightmost. If <code>l</code> is odd it is a <em>right</em> child, so its parent
  would also cover an element left of the query: take <code>l</code> alone and
  move one step right. If <code>r</code> is odd then <code>r - 1</code> is a left
  child whose parent would cover an element right of the query: take
  <code>r - 1</code> alone. Then both indices halve and the same argument holds one
  level up. Each level takes at most two nodes, so a query is O(log n).
</p>
<h4>Dry run: query(2, 6) on [3, 1, 4, 1, 5, 9, 2, 6] with sum</h4>
<table>
  <tr><th>level</th><th>l, r</th><th>l odd?</th><th>r odd?</th><th>running result</th></tr>
  <tr><td>leaves</td><td>10, 14</td><td>no</td><td>no</td><td>0</td></tr>
  <tr><td>parents</td><td>5, 7</td><td>yes: take t[5] = 4 + 1 = 5, l becomes 6</td><td>yes: r becomes 6, take t[6] = 5 + 9 = 14</td><td>5 + 14 = 19</td></tr>
  <tr><td>grandparents</td><td>3, 3</td><td colspan="2">l &lt; r fails, stop</td><td><b>19</b></td></tr>
</table>
<p class="sub">
  The answer 19 matches the recursive tree's <code>query(2, 5)</code> from the
  dry run above, and it took two reads. Note the <em>half-open</em> range: the
  second argument is one past the last index.
</p>
<div class="warn">
  <span class="ttl">⚠ Why there are two accumulators</span>
  For sum and min a single accumulator would do, since the order of merging does
  not change the answer. But the loop collects nodes from the left edge moving
  right and from the right edge moving left. For an operation that is not
  commutative (string concatenation, the struct merge above, matrix product) the
  left pieces must be merged on the left side and the right pieces on the right
  side, which is what <code>left</code> and <code>right</code> do. With them the
  code is correct for non-commutative merges too, including when n is not a
  power of two. Passing a merge to the constructor means you must also pass
  its identity, and it must be a true identity for that merge.
</div>
<p class="sub">
  Use this version when you want the smallest, fastest code for point update and
  range query. Its limits: lazy propagation is awkward without the recursive
  structure, and the "descend by comparing the children" idiom in the next
  section is easier on the recursive layout.
</p>

<h3>Descending the tree: the leftmost index at or above a threshold</h3>
<p>
  A segment tree can also answer questions about <em>positions</em>, not just
  ranges. Take an array of capacities and the request "find the leftmost bin
  with capacity at least x, then use some of it." Scanning is O(n). If each node
  stores the <b>maximum</b> of its range, you can decide in O(1) whether a range
  contains any bin with capacity ≥ x, and descend straight to the answer: go left
  if the left child's maximum is enough, otherwise go right.
</p>
<pre><code>class MaxTree {
  constructor(nums) {
    this.n = nums.length;
    this.t = new Array(4 * this.n).fill(-Infinity);
    if (this.n > 0) this._build(nums, 1, 0, this.n - 1);
  }

  _build(nums, node, lo, hi) {
    if (lo === hi) { this.t[node] = nums[lo]; return; }
    const mid = (lo + hi) >> 1;
    this._build(nums, 2 * node, lo, mid);
    this._build(nums, 2 * node + 1, mid + 1, hi);
    this.t[node] = Math.max(this.t[2 * node], this.t[2 * node + 1]);
  }

  update(i, value, node = 1, lo = 0, hi = this.n - 1) {
    if (lo === hi) { this.t[node] = value; return; }
    const mid = (lo + hi) >> 1;
    if (i &lt;= mid) this.update(i, value, 2 * node, lo, mid);
    else this.update(i, value, 2 * node + 1, mid + 1, hi);
    this.t[node] = Math.max(this.t[2 * node], this.t[2 * node + 1]);
  }

  <span class="c">// smallest index i >= from with nums[i] >= x, or -1 — O(log n)</span>
  firstAtLeast(x, from = 0, node = 1, lo = 0, hi = this.n - 1) {
    if (hi &lt; from || this.t[node] &lt; x) return -1; <span class="c">// out of range, or no bin here is big enough</span>
    if (lo === hi) return lo;
    const mid = (lo + hi) >> 1;
    const found = this.firstAtLeast(x, from, 2 * node, lo, mid);
    return found !== -1 ? found : this.firstAtLeast(x, from, 2 * node + 1, mid + 1, hi);
  }
}</code></pre>
<p>
  Without the <code>from</code> argument the search is one root-to-leaf walk:
  at every node, the left child either has a bin that fits (go there; the answer
  is the <em>leftmost</em> one) or it does not and the right child must. With
  <code>from</code> some nodes straddle the start position, but a straddling
  node exists at only one position per level, and any node fully to the right of
  <code>from</code> is either rejected in O(1) by its maximum or contains the
  answer, so the total is still O(log n). Dry run on
  <code>[5, 3, 9, 2, 7, 8, 1, 6]</code>:
</p>
<table>
  <tr><th>call</th><th>node [lo, hi] and its max</th><th>decision</th></tr>
  <tr><td>firstAtLeast(8)</td><td>[0,7], max 9</td><td>9 ≥ 8, split</td></tr>
  <tr><td></td><td>[0,3], max 9</td><td>9 ≥ 8, split: try the left child first</td></tr>
  <tr><td></td><td>[0,1], max 5</td><td>5 &lt; 8, return −1 at once</td></tr>
  <tr><td></td><td>[2,3], max 9</td><td>≥ 8, split</td></tr>
  <tr><td></td><td>[2,2], 9</td><td>leaf, <b>return 2</b></td></tr>
  <tr><td>firstAtLeast(8, 3)</td><td>[0,3], max 9</td><td>9 is at index 2, before <code>from</code>, but the node's max cannot tell; split</td></tr>
  <tr><td></td><td>[0,1], then [2,2] inside [2,3] (max 9, split)</td><td>both end before 3: return −1 at once</td></tr>
  <tr><td></td><td>[2,3] and [3,3], max 2</td><td>[3,3] has 2 &lt; 8: return −1, so the whole left half fails</td></tr>
  <tr><td></td><td>[4,7], max 8</td><td>8 ≥ 8, split; [4,5] has max 8, split; [4,4] is 7 &lt; 8</td></tr>
  <tr><td></td><td>[5,5]</td><td>leaf, 8 ≥ 8, <b>return 5</b></td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ After you use a bin, write the new capacity back</span>
  The tree answers "where"; you still have to call <code>update</code> with the
  reduced capacity, or the same bin is offered again. A bin that is used up
  entirely can be set to <code>-Infinity</code> (or 0, when every request is
  positive), so it is never chosen again. Check <code>-1</code> before using the
  result as an index.
</div>
<p class="sub">
  The same shape answers "leftmost position whose prefix sum reaches k"
  (store sums, compare against the remaining amount while descending) and, with
  a min tree, "first index whose value is at most x". Whenever a loop over
  positions asks for the <em>first</em> one that satisfies a monotone test on a
  range aggregate, descend instead.
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

<h3>My Calendar III: a dynamic tree and tags that never move</h3>
<p>
  A booking <code>[start, end)</code> arrives, and after each one you must report
  the largest number of bookings that overlap at any single moment. Times go up
  to 10<sup>9</sup>, so an array indexed by time is impossible, and bookings
  arrive online, so you cannot compress coordinates in advance. This is a
  range-add, global-max problem, which is exactly what a segment tree with lazy
  updates does, if the tree is built <em>on demand</em>.
</p>
<p>
  Two ideas combine. First, a <b>dynamic tree</b>: nodes are objects created
  only when an update descends into them, so the tree over [0, 10<sup>9</sup>] has
  about log₂(10<sup>9</sup>) ≈ 30 levels but only O(log C) new nodes per booking.
  Second, <b>tags that never move</b>. In the earlier lazy tree you pushed a
  pending add down to the children before looking at them. For "add to a range,
  ask for the maximum" there is a simpler trick: leave the tag on the node where
  the update stopped, and let every ancestor recompute its maximum as
  <code>its own tag + the larger child maximum</code>. Nothing is ever pushed down,
  so no node ever needs to be visited just to settle a debt.
</p>
<pre><code>class MyCalendarThree {
  constructor() {
    this.root = this._node();
  }

  _node() { return { max: 0, add: 0, left: null, right: null }; }

  <span class="c">// book [startTime, endTime) and return the largest overlap so far — O(log C) per call</span>
  book(startTime, endTime) {
    this._add(this.root, 0, 1000000000, startTime, endTime - 1); <span class="c">// closed [l, r] inside the tree</span>
    return this.root.max;
  }

  _add(node, lo, hi, l, r) {
    if (r &lt; lo || hi &lt; l) return;
    if (l &lt;= lo &amp;&amp; hi &lt;= r) { <span class="c">// fully covered: tag this node and stop</span>
      node.max++;
      node.add++;
      return;
    }
    const mid = Math.floor((lo + hi) / 2);
    if (node.left === null) node.left = this._node();
    if (node.right === null) node.right = this._node();
    this._add(node.left, lo, mid, l, r);
    this._add(node.right, mid + 1, hi, l, r);
    node.max = node.add + Math.max(node.left.max, node.right.max); <span class="c">// the tag still applies to everything below</span>
  }
}</code></pre>
<p>
  The invariant is that <code>node.max</code> is the largest overlap anywhere in
  the node's range, counting the tags on the node itself and below it but not on
  its ancestors. When a booking fully covers a node, every point in it gains one
  booking, so both the maximum and the stored tag go up by one. A parent
  re-derives its maximum from its children's maxima plus its own tag. The root has
  no ancestors, so <code>root.max</code> is the global answer.
</p>
<table>
  <tr><th>call</th><th>effect</th><th>returns</th></tr>
  <tr><td>book(10, 20)</td><td>covers 10..19</td><td>1</td></tr>
  <tr><td>book(50, 60)</td><td>covers 50..59, disjoint from the first</td><td>1</td></tr>
  <tr><td>book(10, 40)</td><td>10..19 now has 2 overlapping</td><td>2</td></tr>
  <tr><td>book(5, 15)</td><td>10..14 is inside all of [10,20), [10,40), [5,15)</td><td>3</td></tr>
  <tr><td>book(5, 10)</td><td>5..9 has two, and 10 is not included in [5,10)</td><td>3</td></tr>
  <tr><td>book(25, 55)</td><td>50..54 now has two; no point reaches 4</td><td>3</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Half-open bookings and the tag-never-moves rule</span>
  A booking <code>[start, end)</code> excludes <code>end</code>, so the closed
  range inside the tree is <code>[start, end - 1]</code>; forgetting the
  <code>- 1</code> makes <code>book(5, 10)</code> and <code>book(10, 20)</code>
  appear to overlap at 10. And the shortcut is specific to this problem: tags
  that never move work because adding x to a whole range shifts its maximum by
  exactly x. A range <em>sum</em> needs the range width in the update, and an
  <em>assignment</em> tag does not commute with an add tag, so those need the
  push-down version from the lazy section.
</div>
<p class="sub">
  Memory is about O(n log C) nodes for n bookings, because each booking creates at
  most a few nodes per level. When all the bookings are known in advance, an even
  simpler method sweeps sorted start and end events and counts, but the online
  version above is the one that survives a follow-up of "what if they arrive
  one at a time?"
</p>

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
  0-indexed update loop never terminates.
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
  together (a two-tree trick exists for sums, but the segment tree is the
  general tool), storing anything richer than a number per node — is segment
  tree territory.
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

<h3>Fenwick binary descent: the k-th element in O(log n)</h3>
<p>
  Suppose a Fenwick tree holds <em>counts</em>, so <code>prefix(i)</code> is how
  many items have a value at index ≤ i. A natural question is the reverse one:
  "what is the smallest index whose prefix count reaches k?", which is the k-th
  smallest item of a multiset that supports insert and delete. Binary searching
  over <code>prefix</code> works but costs O(log² n): a log for the search and a
  log for each prefix. The Fenwick layout lets you do it in one O(log n) walk.
</p>
<p>
  Recall that <code>t[k]</code> covers the block of <code>k &amp; -k</code> items
  ending at k. Start at position 0 and try to move right by the biggest power of
  two, then the next biggest, and so on. A jump of <code>step</code> from
  <code>pos</code> lands on <code>pos + step</code>, and because
  <code>pos</code> only has bits larger than <code>step</code> set, the cell
  <code>t[pos + step]</code> covers exactly the <code>step</code> items just after
  <code>pos</code>. So you can ask "would taking this whole block still leave the
  prefix below the target?" and decide each bit of the answer from the high end,
  exactly as in a binary search over bits.
</p>
<pre><code><span class="c">// smallest 0-indexed i with prefix(i) >= target, or f.n if the total is smaller.</span>
<span class="c">// Every entry must be >= 0 so that prefix sums never decrease. O(log n).</span>
function lowerBound(f, target) {
  let top = 1;
  while (top * 2 &lt;= f.n) top *= 2; <span class="c">// the largest power of two that fits</span>

  let pos = 0, remaining = target;
  for (let step = top; step > 0; step >>= 1) {
    if (pos + step &lt;= f.n &amp;&amp; f.t[pos + step] &lt; remaining) {
      pos += step;               <span class="c">// the whole block is still too small: jump over it</span>
      remaining -= f.t[pos];
    }
  }
  return pos; <span class="c">// pos items have a prefix below target, so the answer is item number pos (0-indexed)</span>
}</code></pre>
<p>
  Dry run: values 1 to 8 live at indices 0 to 7, with counts
  <code>[1, 0, 2, 0, 1, 0, 0, 3]</code>, so the multiset is 1, 3, 3, 5, 8, 8, 8 and
  the 4th smallest should be 5, which is index 4. The Fenwick cells are
  <code>t[4] = 1+0+2+0 = 3</code>, <code>t[6] = 1+0 = 1</code>,
  <code>t[5] = 1</code> and <code>t[8] = 7</code>.
</p>
<table>
  <tr><th>step</th><th>pos + step</th><th>t[pos + step]</th><th>&lt; remaining?</th><th>pos after</th><th>remaining after</th></tr>
  <tr><td>8</td><td>8</td><td>7</td><td>7 &lt; 4? no</td><td>0</td><td>4</td></tr>
  <tr><td>4</td><td>4</td><td>3</td><td>3 &lt; 4? yes, jump</td><td>4</td><td>1</td></tr>
  <tr><td>2</td><td>6</td><td>1</td><td>1 &lt; 1? no</td><td>4</td><td>1</td></tr>
  <tr><td>1</td><td>5</td><td>1</td><td>1 &lt; 1? no</td><td>4</td><td>1</td></tr>
  <tr><td colspan="4">return pos = 4, which is value 5</td><td colspan="2"><b>4</b></td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Three ways the descent goes wrong</span>
  <b>Negative entries.</b> The jump test assumes prefix sums only grow. With a
  negative cell the condition no longer separates "too small" from "enough" and
  the result is meaningless; this works for counts, not for arbitrary deltas.
  <b>Not enough items.</b> If the total is below the target, the loop jumps as far
  as it can and returns <code>f.n</code>, which is one past the last index.
  Check for it. <b>The strict comparison.</b> The test is <code>&lt;</code>, not
  <code>&lt;=</code>: you stop at the last position whose prefix is still
  <em>below</em> the target, and the answer is the element after it. Using
  <code>&lt;=</code> finds the first position whose prefix is strictly greater
  than the target, which is a different question.
</div>
<p class="sub">
  This is the engine behind "k-th smallest in a dynamic multiset", "find the
  person at position k after removals" (keep a 1 per present person, delete by
  subtracting 1) and "k-th missing number" style questions. It only works on a
  Fenwick tree built over counts; the segment tree does the same thing by
  descending with the left child's total, and handles more kinds of nodes.
</p>

<h3>Range add and range sum with two Fenwick trees</h3>
<p>
  The earlier table says a Fenwick tree over a difference array supports range
  update with a <em>point</em> query. To get range updates <em>and</em> range sums
  you can use a segment tree with lazy tags, or you can pay two Fenwick trees and
  a little algebra. Derive it, because the formula is easy to forget but easy to
  rebuild.
</p>
<p>
  Let <code>d[j]</code> be the difference array, <code>d[j] = a[j] - a[j-1]</code>
  (with <code>a[-1] = 0</code>), so <code>a[k]</code> is the sum of
  <code>d[0..k]</code>. A range add of x on [l, r] changes just two entries:
  <code>d[l] += x</code> and <code>d[r+1] -= x</code>. The prefix sum of
  <code>a</code> up to i is
</p>
<p class="sub">
  S(i) = Σ<sub>k≤i</sub> a[k] = Σ<sub>k≤i</sub> Σ<sub>j≤k</sub> d[j] = Σ<sub>j≤i</sub> d[j] · (i − j + 1) = (i + 1) · Σ<sub>j≤i</sub> d[j] − Σ<sub>j≤i</sub> j · d[j]
</p>
<p>
  The middle step counts how many times each <code>d[j]</code> is included: once
  for each k from j to i, which is i − j + 1 times. The last form needs only two
  prefix sums: one over <code>d[j]</code> and one over <code>j · d[j]</code>. Keep
  one Fenwick tree for each.
</p>
<pre><code>class RangeFenwick {
  constructor(n) {
    this.n = n;
    this.byD = new Fenwick(n);     <span class="c">// prefix sums of d[j]</span>
    this.byJD = new Fenwick(n);    <span class="c">// prefix sums of j * d[j]</span>
  }

  _addAt(j, x) { <span class="c">// d[j] += x</span>
    this.byD.update(j, x);
    this.byJD.update(j, x * j);
  }

  <span class="c">// add x to every element in [l, r] — O(log n)</span>
  rangeAdd(l, r, x) {
    this._addAt(l, x);
    if (r + 1 &lt; this.n) this._addAt(r + 1, -x); <span class="c">// nothing to cancel past the end</span>
  }

  _prefix(i) {
    if (i &lt; 0) return 0;
    return (i + 1) * this.byD.prefix(i) - this.byJD.prefix(i);
  }

  <span class="c">// sum of a[l..r] — O(log n)</span>
  rangeSum(l, r) {
    return this._prefix(r) - this._prefix(l - 1);
  }
}</code></pre>
<p>
  This reuses the <code>Fenwick</code> class from earlier in the chapter. Dry run
  on five zeros: <code>rangeAdd(1, 3, 5)</code> sets <code>d[1] = 5</code> and
  <code>d[4] = −5</code>, so the stored arrays are:
</p>
<table>
  <tr><th>j</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>
  <tr><td>d[j]</td><td>0</td><td>5</td><td>0</td><td>0</td><td>−5</td></tr>
  <tr><td>j · d[j]</td><td>0</td><td>5</td><td>0</td><td>0</td><td>−20</td></tr>
</table>
<p class="sub">
  Now <code>rangeSum(0, 2)</code> is S(2) − S(−1) with
  S(2) = 3 · (0 + 5 + 0) − (0 + 5 + 0) = 10, which is a[0] + a[1] + a[2] =
  0 + 5 + 5. And S(4) = 5 · (0 + 5 + 0 + 0 − 5) − (0 + 5 + 0 + 0 − 20) = 0 + 15 =
  15, which is 5 + 5 + 5 over the whole array. Each call is four Fenwick
  operations, O(log n), with no recursion and no tags to push.
</p>
<div class="warn">
  <span class="ttl">⚠ Initial values, and the overflow of j · d[j]</span>
  The structure above starts from all zeros. If the array starts with values,
  either feed them in as range adds (<code>rangeAdd(i, i, a[i])</code> for each
  i), or keep a static prefix-sum array of the original values and add it to
  every answer. Also, <code>j · d[j]</code> can reach n times the largest update,
  so when n and the updates are both large the totals can pass
  2<sup>53</sup>, and <code>Number</code> arithmetic then silently loses digits;
  use <code>BigInt</code> if the limits are that large.
</div>

<h3>Offline sort plus Fenwick: reverse pairs and range-sum counts</h3>
<p>
  The count-of-smaller sweep generalises. Whenever a question is "for each
  element, count the earlier (or later) elements that stand in some <em>order</em>
  relation to it", sweep in index order, keep a Fenwick tree indexed by
  <b>compressed value</b>, and for each element ask for a range of values among
  the elements already inserted. Two questions show the pattern with a twist: the
  value you compare against is not the element itself.
</p>
<h4>Reverse pairs: count i &lt; j with nums[i] &gt; 2 · nums[j]</h4>
<p>
  For each j, the number of earlier elements larger than 2·nums[j] is "how many
  have I inserted" minus "how many inserted are at most 2·nums[j]". The value
  2·nums[j] need not be in the array, so find its position among the sorted
  distinct values with a binary search for how many values are ≤ it.
</p>
<pre><code><span class="c">// number of entries in the ascending array sorted that are &lt;= x</span>
function countAtMost(sorted, x) {
  let lo = 0, hi = sorted.length;
  while (lo &lt; hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] &lt;= x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

<span class="c">// number of entries in the ascending array sorted that are &lt; x</span>
function countLess(sorted, x) {
  let lo = 0, hi = sorted.length;
  while (lo &lt; hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] &lt; x) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}

<span class="c">// O(n log n) time, O(n) space</span>
function reversePairs(nums) {
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const bit = new Fenwick(sorted.length);
  let pairs = 0;
  for (let j = 0; j &lt; nums.length; j++) {
    const upTo = countAtMost(sorted, 2 * nums[j]);         <span class="c">// ranks 0..upTo-1 are values &lt;= 2 * nums[j]</span>
    const notBigger = upTo > 0 ? bit.prefix(upTo - 1) : 0; <span class="c">// inserted values that are NOT bigger</span>
    pairs += j - notBigger;                                 <span class="c">// j values were inserted so far</span>
    bit.update(countLess(sorted, nums[j]), 1);              <span class="c">// the rank of nums[j] is how many values are below it</span>
  }
  return pairs;
}</code></pre>
<p>
  On <code>[1, 3, 2, 3, 1]</code> the sorted distinct values are 1, 2, 3 with
  ranks 0, 1, 2. The answer should be 2, from the pairs (index 1, index 4) and
  (index 3, index 4), since 3 &gt; 2·1:
</p>
<table>
  <tr><th>j</th><th>nums[j]</th><th>2·nums[j]</th><th>values ≤ it</th><th>inserted so far</th><th>not bigger</th><th>pairs added</th></tr>
  <tr><td>0</td><td>1</td><td>2</td><td>2 (ranks 0, 1)</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>3</td><td>6</td><td>3</td><td>1</td><td>1</td><td>0</td></tr>
  <tr><td>2</td><td>2</td><td>4</td><td>3</td><td>2</td><td>2</td><td>0</td></tr>
  <tr><td>3</td><td>3</td><td>6</td><td>3</td><td>3</td><td>3</td><td>0</td></tr>
  <tr><td>4</td><td>1</td><td>2</td><td>2</td><td>4</td><td>2 (the values 1 and 2)</td><td><b>2</b></td></tr>
</table>
<p class="sub">
  At j = 4 the inserted values are 1, 3, 2, 3. Those at most 2 are 1 and 2, so
  two are not bigger, and 4 − 2 = 2 are bigger: the two 3s.
</p>
<h4>Count of range sum: how many subarrays have a sum in [lower, upper]</h4>
<p>
  Let <code>P</code> be the prefix sums with <code>P[0] = 0</code>. A subarray
  ending at <code>j</code> and starting after <code>i</code> has sum
  <code>P[j] − P[i]</code>, so you need the number of earlier prefix values
  <code>P[i]</code> in the window
  <code>[P[j] − upper, P[j] − lower]</code>. That is a <em>range</em> query on
  the Fenwick tree over compressed prefix values, the difference of two prefix
  counts.
</p>
<pre><code><span class="c">// O(n log n) time, O(n) space; needs countAtMost and countLess from above</span>
function countRangeSum(nums, lower, upper) {
  const prefix = [0];
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x);

  const sorted = [...new Set(prefix)].sort((a, b) => a - b);
  const bit = new Fenwick(sorted.length);
  let total = 0;
  for (const p of prefix) {
    const from = countLess(sorted, p - upper);   <span class="c">// ranks below this are too small</span>
    const to = countAtMost(sorted, p - lower);   <span class="c">// ranks below this hold values at most p - lower</span>
    const atMost = to > 0 ? bit.prefix(to - 1) : 0;
    const below = from > 0 ? bit.prefix(from - 1) : 0;
    total += atMost - below;
    bit.update(countLess(sorted, p), 1);         <span class="c">// insert AFTER counting, so only earlier prefixes are matched</span>
  }
  return total;
}</code></pre>
<p>
  On <code>nums = [−2, 5, −1]</code> with the window [−2, 2], the prefix sums are
  [0, −2, 3, 2] and the answer is 3 (the subarrays [−2], [−2, 5, −1] and [−1]):
</p>
<table>
  <tr><th>p</th><th>window [p − 2, p + 2]</th><th>earlier prefixes in the window</th><th>added</th></tr>
  <tr><td>0</td><td>[−2, 2]</td><td>none yet</td><td>0</td></tr>
  <tr><td>−2</td><td>[−4, 0]</td><td>0</td><td>1</td></tr>
  <tr><td>3</td><td>[1, 5]</td><td>none of 0, −2</td><td>0</td></tr>
  <tr><td>2</td><td>[0, 4]</td><td>0 and 3</td><td>2</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Insert after counting, and strict versus inclusive bounds</span>
  If you insert <code>p</code> before querying, the element pairs with itself
  and, whenever 0 is inside [lower, upper], an empty subarray is counted. Use
  <code>countLess</code> for the lower edge of the window and
  <code>countAtMost</code> for the upper edge; swapping them drops or adds the
  values that sit exactly on the edge. Also remember the prefix array has n + 1
  entries, not n.
</div>
<p class="sub">
  The reusable skeleton is: (1) turn the question into "for each j, count earlier
  i whose value falls in a window that depends on j"; (2) compress the values you
  will insert; (3) sweep, query the window as the difference of two prefix counts,
  then insert. Merge sort can solve the same two problems in the same time, but
  the Fenwick version is shorter to write once the helper exists, and each
  element is counted the moment it is inserted (the values still have to be known
  up front for the compression).
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
  <tr><td>Rich per-node state (max subarray, merge sort tree)</td><td><b>Segment tree</b></td><td>a node can hold a struct, not just a number</td></tr>
  <tr><td>2D grid sums with updates</td><td><b>2D Fenwick</b></td><td>nested loops over both dimensions, O(log² n)</td></tr>
  <tr><td>Range add + range sum, no tags to push</td><td><b>Two Fenwick trees</b></td><td>prefix sums of d[j] and of j·d[j] give any prefix sum</td></tr>
  <tr><td>k-th smallest in a multiset with inserts and deletes</td><td><b>Fenwick descent</b></td><td>one O(log n) walk over the counts, instead of a binary search over prefix queries</td></tr>
  <tr><td>Leftmost position that fits, with updates</td><td><b>Segment tree of maxima, descended</b></td><td>each node's max says whether the left half can serve the request</td></tr>
  <tr><td>Count earlier elements in a value window</td><td><b>Offline sweep + Fenwick over ranks</b></td><td>reverse pairs, range-sum counts, inversions</td></tr>
  <tr><td>Online range add, global max, huge coordinates</td><td><b>Dynamic segment tree</b></td><td>nodes created on demand; tags stay on the node</td></tr>
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
  <li>The answer for a range cannot be built from one number per half (best subarray, longest run, is-it-sorted) → a segment tree whose node stores a small struct, merged left-to-right</li>
  <li>"Find the first / leftmost / k-th position such that ..." with updates → descend a tree of aggregates (maxima in a segment tree, counts in a Fenwick) instead of scanning</li>
  <li>"Count pairs i &lt; j with a relation between nums[i] and a transform of nums[j]" → sweep j, query a window of ranks among the inserted values, then insert</li>
  <li>Range add and range sum with a tight code budget → two Fenwick trees; times up to 10<sup>9</sup> arriving online → a dynamic segment tree</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write a segment tree's build/query/update from memory, and explain why the no-overlap return must be the operation's identity element.</li>
    <li>Explain why a Fenwick tree can answer range sum but not range minimum, in terms of invertibility.</li>
    <li>Write a Fenwick tree's update and prefix loops, and explain why 1-indexing (not 0-indexing) is required for <code>k &amp; -k</code> to terminate.</li>
    <li>State the two lazy-propagation rules — push before you look, stop at total coverage — and say what breaks if you skip either one.</li>
    <li>Given a new problem, decide whether it needs a prefix-sum array, a Fenwick tree, or a segment tree (with or without lazy propagation), based on whether updates and non-invertible queries are both present.</li>
    <li>Define the four fields of a max-subarray node and say why its merge is not commutative and has no simple identity element.</li>
    <li>Write the iterative bottom-up tree from memory, say why the query uses a left and a right accumulator, and why the range is half-open.</li>
    <li>Descend a tree of maxima to find the leftmost bin that fits, and descend a Fenwick tree of counts to find the k-th element; say what each needs in order to work (monotone test, non-negative counts).</li>
    <li>Derive the two-Fenwick formula for a range-add range-sum from the difference array.</li>
    <li>Turn "count pairs with a relation" into a sweep with a Fenwick tree over compressed values, and say why you insert after counting.</li>
    <li>Explain why a dynamic segment tree can leave its tags in place for range add with global max, and why that shortcut does not carry over to sums or assignments.</li>
  </ul>
</div>`,
};
