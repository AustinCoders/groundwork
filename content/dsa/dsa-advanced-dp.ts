import type { Chapter } from "../types";

export const dsaAdvancedDp: Chapter = {
  id: "dsa-advanced-dp",
  num: "A1",
  title: "Advanced DP",
  short: "Advanced DP",
  levels: ["advanced"],
  practice: [
    "ex-travelling-salesman-bitmask",
    "ex-partition-k-equal-sum-subsets",
    "ex-count-strictly-increasing-digits",
    "ex-burst-balloons",
    "ex-minimum-cost-to-cut-a-stick",
    "ex-house-robber-iii",
  ],
  ready: true,
  subtitle: 'Once you can design the state, every "impossible" DP is just a normal DP over a stranger index.',
  body: `<h3>Advanced DP is not harder recursion — it's harder state design</h3>
<p>
  In the 1D and 2D chapters the state was handed to you: <code>dp[i]</code>
  "best answer using the first i items," <code>dp[i][j]</code> "best answer
  for prefixes i and j." Advanced DP is the same machine — overlapping
  subproblems, memoize, iterate in dependency order — but you have to
  <em>invent</em> the index. The four shapes below cover almost every
  advanced DP asked in interviews, and each one is defined entirely by what
  it uses as the state: a <b>subset</b> (bitmask), a <b>subtree</b> (tree
  DP), a <b>prefix of the digits of a number</b> (digit DP), or a
  <b>contiguous range</b> (interval DP).
</p>

<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="Four boxes showing the four advanced dynamic programming state types: a bitmask subset, a subtree, a digit prefix, and an interval, each labelled with its state signature">
    <g class="rough">
      <rect class="box" x="20" y="40" width="130" height="70" rx="6" />
      <rect class="boxg" x="180" y="40" width="130" height="70" rx="6" />
      <rect class="boxy" x="340" y="40" width="130" height="70" rx="6" />
      <rect class="boxr" x="500" y="40" width="120" height="70" rx="6" />
    </g>
    <text class="lbl" x="85" y="68" text-anchor="middle" style="font-size:15px">bitmask</text>
    <text class="sm" x="85" y="90" text-anchor="middle">dp[mask][last]</text>
    <text class="lbl" x="245" y="68" text-anchor="middle" style="font-size:15px">tree</text>
    <text class="sm" x="245" y="90" text-anchor="middle">dp[node][took?]</text>
    <text class="lbl" x="405" y="68" text-anchor="middle" style="font-size:15px">digit</text>
    <text class="sm" x="405" y="90" text-anchor="middle">dp[pos][tight]</text>
    <text class="lbl" x="560" y="68" text-anchor="middle" style="font-size:15px">interval</text>
    <text class="sm" x="560" y="90" text-anchor="middle">dp[l][r]</text>
    <text class="lbl" x="20" y="150" style="font-size:15px">the state answers: "what does the rest of the problem still need to know?"</text>
    <text class="sm" x="20" y="178">bitmask → which items are already used · tree → the whole subtree is summarized in a few numbers</text>
    <text class="sm" x="20" y="200">digit → how much freedom the remaining digits have · interval → this range is solved independently</text>
    <text class="sm rd" x="20" y="224">if two different paths reach the same state, they are interchangeable from here on — that is the whole test</text>
  </svg>
  <figcaption>Every one of these is the same DP; only the shape of the index changes. Pick the smallest state that still makes future decisions independent of how you arrived.</figcaption>
</figure>

<h3>Bitmask DP: an integer <em>is</em> the visited-set</h3>
<p>
  When n is small (typically n ≤ 20) and the subproblem depends on
  <em>which</em> subset of items you've used — not just how many — encode
  the subset as the bits of a single integer. Bit <code>i</code> set means
  "item i is used." That gives you 2<sup>n</sup> states you can index into
  an array directly, which is far cheaper than hashing a Set.
</p>
<table>
  <tr><th>Operation</th><th>Code</th><th>Meaning</th></tr>
  <tr><td>Is item i in the set?</td><td><code>(mask >> i) & 1</code></td><td>test bit i</td></tr>
  <tr><td>Add item i</td><td><code>mask | (1 << i)</code></td><td>set bit i</td></tr>
  <tr><td>Remove item i</td><td><code>mask & ~(1 << i)</code></td><td>clear bit i</td></tr>
  <tr><td>Full set of n items</td><td><code>(1 << n) - 1</code></td><td>n low bits set</td></tr>
  <tr><td>Iterate submasks of mask</td><td><code>for (let s = mask; s; s = (s - 1) & mask)</code></td><td>every subset of mask, 3<sup>n</sup> total</td></tr>
</table>
<p class="sub">
  The bit-manipulation chapter covered these operators; the new idea here is
  purely that <code>mask</code> is a legal <em>array index</em>. That is what
  turns an exponential search over subsets into a DP over 2<sup>n</sup> cells.
</p>

<div class="sticky mint">
  <span class="ttl">The ordering trick that makes bitmask DP easy</span>
  Adding an element to a subset always makes the integer <em>larger</em>
  (you set a bit that was 0). So a plain <code>for (let mask = 0; mask &lt; 1 &lt;&lt; n; mask++)</code>
  is already a valid topological order — every state you read from has a
  smaller numeric value than the state you're writing. You never need an
  explicit dependency sort.
</div>

<h3>Traveling Salesman — the canonical bitmask DP</h3>
<p>
  "Visit every city exactly once and return to the start, minimizing total
  distance." Brute force is n! orderings. The DP insight: once you know
  <em>which</em> cities are visited and <em>which one you're standing on</em>,
  the cheapest completion doesn't depend on the order you visited them in.
  That collapses n! paths into 2<sup>n</sup> × n states.
</p>
<pre><code><span class="c">// dist[i][j] = cost of edge i→j. Returns min cost of a tour starting and ending at 0.</span>
<span class="c">// Time O(2^n · n^2), space O(2^n · n) — practical to about n = 18-20.</span>
function tsp(dist) {
  const n = dist.length;
  const FULL = (1 << n) - 1;

  <span class="c">// dp[mask][last] = cheapest way to have visited exactly the set "mask", standing on "last"</span>
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0; <span class="c">// only city 0 visited, standing on city 0, cost 0</span>

  for (let mask = 1; mask &lt;= FULL; mask++) {
    if ((mask & 1) === 0) continue; <span class="c">// every tour includes the start city</span>

    for (let last = 0; last &lt; n; last++) {
      const cur = dp[mask][last];
      if (cur === Infinity) continue;        <span class="c">// unreachable state — skip, don't propagate Infinity</span>
      if (((mask >> last) & 1) === 0) continue; <span class="c">// "last" must actually be in the visited set</span>

      for (let next = 0; next &lt; n; next++) {
        if ((mask >> next) & 1) continue;    <span class="c">// already visited</span>
        const nextMask = mask | (1 << next);
        const cost = cur + dist[last][next];
        if (cost &lt; dp[nextMask][next]) dp[nextMask][next] = cost;
      }
    }
  }

  let best = Infinity;
  for (let last = 1; last &lt; n; last++) {
    best = Math.min(best, dp[FULL][last] + dist[last][0]); <span class="c">// close the loop back to 0</span>
  }
  return best;
}</code></pre>
<p class="sub">
  Two variants come up constantly. Drop the final <code>+ dist[last][0]</code>
  and you get the shortest Hamiltonian <em>path</em> ("Shortest Path Visiting
  All Nodes"). Replace <code>Math.min</code> with a sum and you're
  <em>counting</em> orderings instead of optimizing them — same states, same
  loops, different combiner.
</p>

<div class="warn">
  <span class="ttl">⚠ 1 &lt;&lt; n overflows the trick, not the language</span>
  JavaScript's bitwise operators coerce to <b>32-bit signed</b> integers, so
  <code>1 &lt;&lt; 31</code> is negative and <code>1 &lt;&lt; 32</code> is
  <code>1</code>, silently. That's fine for n ≤ 30, but it's also a hard
  ceiling worth stating out loud: bitmask DP is for n ≤ ~20 anyway, because
  2<sup>20</sup> × 20 is already 20M cells. If an interviewer gives you n = 40,
  bitmask is the wrong tool — look for meet-in-the-middle instead.
</div>

<h3>Bitmask DP without a "last" dimension — the assignment problem</h3>
<p>
  Not every bitmask DP needs a second dimension. If the k-th decision is
  always "assign worker k," then the number of bits already set
  <em>tells you</em> which worker you're on — the popcount is a free index,
  so the state collapses to a single 1D array of size 2<sup>n</sup>.
</p>
<pre><code><span class="c">// cost[w][j] = cost of giving job j to worker w. Assign every worker exactly one job.</span>
function minAssignmentCost(cost) {
  const n = cost.length;
  const FULL = (1 << n) - 1;
  const dp = new Array(1 << n).fill(Infinity);
  dp[0] = 0;

  for (let mask = 0; mask &lt; FULL; mask++) {
    if (dp[mask] === Infinity) continue;
    const worker = popcount(mask); <span class="c">// jobs assigned so far === index of the next worker</span>

    for (let job = 0; job &lt; n; job++) {
      if ((mask >> job) & 1) continue;
      const nextMask = mask | (1 << job);
      const cost2 = dp[mask] + cost[worker][job];
      if (cost2 &lt; dp[nextMask]) dp[nextMask] = cost2;
    }
  }
  return dp[FULL];
}

function popcount(x) {
  let c = 0;
  while (x) { x &= x - 1; c++; } <span class="c">// x &= x-1 clears the lowest set bit</span>
  return c;
}</code></pre>
<p class="sub">
  Recognizing that a dimension is <em>derivable</em> from the mask is a real
  optimization, not cosmetics: it takes the table from O(2<sup>n</sup>·n) to
  O(2<sup>n</sup>) memory. Say it out loud when you spot it.
</p>

<h3>DP on trees: the subtree is the subproblem</h3>
<p>
  On a tree there are no cycles, so a post-order DFS visits every subproblem
  exactly once — you don't even need a memo table, the recursion tree
  <em>is</em> the DP table. The whole design question is: <b>what summary of a
  subtree does the parent need?</b> Usually it's a small tuple, and the
  classic shape is a pair: "best if I take this node" and "best if I don't."
</p>
<pre><code><span class="c">// House Robber III — can't rob a node and its child. Returns max loot.</span>
function rob(root) {
  <span class="c">// returns [bestIfWeRobThisNode, bestIfWeSkipThisNode]</span>
  function dfs(node) {
    if (!node) return [0, 0];

    const [leftRob, leftSkip] = dfs(node.left);
    const [rightRob, rightSkip] = dfs(node.right);

    const robHere = node.val + leftSkip + rightSkip;  <span class="c">// children must be skipped</span>
    const skipHere = Math.max(leftRob, leftSkip) + Math.max(rightRob, rightSkip); <span class="c">// children are free</span>

    return [robHere, skipHere];
  }
  const [a, b] = dfs(root);
  return Math.max(a, b);
}</code></pre>
<p class="sub">
  Note <code>skipHere</code> takes the max of each child independently — a
  common wrong version writes <code>leftSkip + rightSkip</code>, quietly
  forbidding grandchildren from being robbed. The pair-return shape makes
  that mistake visible because each slot has a stated meaning.
</p>

<h3>The two-value trick: what you return upward ≠ what you record</h3>
<p>
  Diameter and "maximum path sum" share one subtle idea that trips people up:
  the best answer <em>through</em> a node (using both children) is not a value
  the parent can use, because a parent can only extend a path that goes
  <em>straight down</em> one side. So you record the two-sided value in an
  outer variable and return the one-sided value.
</p>
<pre><code><span class="c">// Binary Tree Maximum Path Sum — path may start and end anywhere, values may be negative.</span>
function maxPathSum(root) {
  let best = -Infinity;

  <span class="c">// returns the best DOWNWARD path sum starting at this node (usable by the parent)</span>
  function gain(node) {
    if (!node) return 0;

    const left = Math.max(gain(node.left), 0);   <span class="c">// clamp at 0: a negative branch is never worth taking</span>
    const right = Math.max(gain(node.right), 0);

    best = Math.max(best, node.val + left + right); <span class="c">// record the path that TURNS here — two-sided</span>

    return node.val + Math.max(left, right);        <span class="c">// return the path that CONTINUES up — one-sided</span>
  }

  gain(root);
  return best;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Returning the two-sided value is the bug that passes small tests</span>
  If <code>gain</code> returned <code>node.val + left + right</code>, the
  parent would splice in a path that already bends — producing a "path" that
  visits a node twice. It happens to give the right answer on tiny symmetric
  trees, which is exactly why it survives your hand-check and dies on the
  hidden tests. Diameter (<code>best = max(best, left + right)</code>, return
  <code>1 + max(left, right)</code>) is the same skeleton with edge counts.
</div>
<div class="warn">
  <span class="ttl">⚠ Recursion depth on a 10<sup>5</sup>-node skewed tree</span>
  Tree DP recurses to the tree's height. A degenerate (linked-list-shaped)
  tree or a general graph-as-tree with 10<sup>5</sup> nodes will overflow the
  JS call stack. If constraints hint at that, do an explicit iterative
  post-order: push nodes in DFS order into an array, then process that array
  in reverse — every child is finished before its parent.
</div>

<h3>Digit DP: counting numbers up to N with a property</h3>
<p>
  "How many integers in [1, N] have no two adjacent equal digits?" with N up
  to 10<sup>18</sup>. You cannot loop to N. Instead, build the number one
  digit at a time from the most significant end and count completions. Two
  bookkeeping flags carry all the difficulty:
</p>
<ul>
  <li><b>tight</b> — every digit so far matched N's prefix exactly, so this
  position is capped at N's digit. Once you place something smaller, you're
  free (<code>tight</code> becomes false) and all remaining positions allow 0-9.</li>
  <li><b>started</b> — you've placed a nonzero digit. Before that you're in
  leading zeros, which must not count as digits (otherwise "07" looks like it
  has an adjacent-pair rule applied to a zero that isn't there).</li>
</ul>
<pre><code><span class="c">// Count integers in [1, N] with no two adjacent equal digits.</span>
function countNoAdjacentRepeats(N) {
  const digits = String(N).split("").map(Number);
  const n = digits.length;
  const memo = new Map();

  function go(pos, prev, tight, started) {
    if (pos === n) return started ? 1 : 0; <span class="c">// the all-zeros path is the number 0 — don't count it</span>

    <span class="c">// Only memoize the FREE states: a tight state is visited at most once per position anyway,</span>
    <span class="c">// and its count depends on N's digits, so caching it would be wrong to reuse.</span>
    const key = pos * 100 + (prev + 1) * 2 + (started ? 1 : 0);
    if (!tight && memo.has(key)) return memo.get(key);

    const limit = tight ? digits[pos] : 9;
    let total = 0;

    for (let d = 0; d &lt;= limit; d++) {
      if (started && d === prev) continue; <span class="c">// the actual property being enforced</span>
      total += go(
        pos + 1,
        d,
        tight && d === limit,      <span class="c">// stay tight only if we matched N's digit exactly</span>
        started || d > 0
      );
    }

    if (!tight) memo.set(key, total);
    return total;
  }

  return go(0, -1, true, false);
}</code></pre>
<p class="sub">
  Complexity is O(positions × states-per-position × 10) — here 19 × 20 × 10,
  a few thousand operations for N = 10<sup>18</sup>. To count in a range
  <code>[L, R]</code>, compute <code>f(R) - f(L - 1)</code>; that subtraction
  is the standard closing move and interviewers expect you to name it.
</p>
<div class="warn">
  <span class="ttl">⚠ Memoizing tight states is the classic digit-DP bug</span>
  A tight state's answer is a function of N's remaining digits, not just
  <code>(pos, prev)</code>. Cache it and a later, non-tight visit to the same
  <code>(pos, prev)</code> reads a value that was capped by N — an undercount
  that only shows on some inputs. The guard is one condition:
  <code>if (!tight)</code> on both read and write.
</div>

<h3>Interval DP: solve short ranges first, and pick the <em>last</em> move</h3>
<p>
  When the answer for <code>[l, r]</code> is built from answers for strictly
  shorter ranges inside it, iterate by <b>increasing length</b>, not by index.
  The design trick that makes these problems click is choosing the right
  split point semantics: for matrix chain multiplication you pick the last
  multiplication; for Burst Balloons you pick the <em>last balloon to pop</em>,
  because that's the only choice under which the two sides become independent.
</p>

<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="A triangular table showing interval DP filled by increasing range length, with length-one cells on the bottom row and the full range at the top">
    <g class="rough">
      <rect class="box" x="40" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="130" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="220" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="310" y="140" width="70" height="40" rx="4" />
      <rect class="boxy" x="85" y="90" width="70" height="40" rx="4" />
      <rect class="boxy" x="175" y="90" width="70" height="40" rx="4" />
      <rect class="boxy" x="265" y="90" width="70" height="40" rx="4" />
      <rect class="boxg" x="130" y="40" width="70" height="40" rx="4" />
      <rect class="boxg" x="220" y="40" width="70" height="40" rx="4" />
    </g>
    <text class="sm" x="75" y="165" text-anchor="middle">[0,0]</text>
    <text class="sm" x="165" y="165" text-anchor="middle">[1,1]</text>
    <text class="sm" x="255" y="165" text-anchor="middle">[2,2]</text>
    <text class="sm" x="345" y="165" text-anchor="middle">[3,3]</text>
    <text class="sm" x="120" y="115" text-anchor="middle">[0,1]</text>
    <text class="sm" x="210" y="115" text-anchor="middle">[1,2]</text>
    <text class="sm" x="300" y="115" text-anchor="middle">[2,3]</text>
    <text class="sm" x="165" y="65" text-anchor="middle">[0,2]</text>
    <text class="sm" x="255" y="65" text-anchor="middle">[1,3]</text>
    <text class="lbl" x="410" y="160" style="font-size:15px">length 1 — base cases</text>
    <text class="lbl" x="410" y="112" style="font-size:15px">length 2 — needs length 1</text>
    <text class="lbl gr" x="410" y="62" style="font-size:15px">length 3 — needs 1 and 2</text>
    <text class="sm rd" x="40" y="30">outer loop is LENGTH, not index — that is the whole ordering rule</text>
  </svg>
  <figcaption>Every cell only reads cells strictly below it, so filling by increasing length guarantees dependencies are ready.</figcaption>
</figure>

<pre><code><span class="c">// Burst Balloons: popping balloon i earns nums[left] * nums[i] * nums[right],</span>
<span class="c">// where left/right are its CURRENT neighbours. Maximize total coins. O(n^3).</span>
function maxCoins(nums) {
  const a = [1, ...nums, 1]; <span class="c">// sentinel 1s so edge balloons have neighbours</span>
  const n = a.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  <span class="c">// dp[l][r] = best coins from bursting everything strictly between l and r,</span>
  <span class="c">// with l and r themselves still standing (that's what makes the halves independent)</span>
  for (let len = 2; len &lt; n; len++) {          <span class="c">// len = distance between the exclusive bounds</span>
    for (let l = 0; l + len &lt; n; l++) {
      const r = l + len;
      for (let k = l + 1; k &lt; r; k++) {        <span class="c">// k = the LAST balloon burst in (l, r)</span>
        const coins = dp[l][k] + a[l] * a[k] * a[r] + dp[k][r];
        if (coins > dp[l][r]) dp[l][r] = coins;
      }
    }
  }
  return dp[0][n - 1];
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "If I pick the balloon I burst
  <em>first</em>, the two halves aren't independent — the left half's final
  neighbour depends on what's left of the right half. So I invert it and let
  k be the <em>last</em> balloon in the range: at that moment its neighbours
  are exactly the untouched boundaries l and r, and the two sides never
  interact. That's what makes it a clean O(n³) interval DP."
</div>

<p>
  A second interval problem, to show the shape isn't always a 2D answer
  table: <b>palindrome partitioning with minimum cuts</b>. Here the range
  structure only shows up in a precomputed palindrome table; the answer
  itself is a 1D DP over prefixes. Recognizing that split keeps this O(n²)
  instead of O(n³).
</p>
<pre><code><span class="c">// Minimum cuts so every piece of s is a palindrome. O(n^2) time and space.</span>
function minCut(s) {
  const n = s.length;
  if (n &lt;= 1) return 0;

  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--) {          <span class="c">// i descending so pal[i+1][j-1] is already known</span>
    for (let j = i; j &lt; n; j++) {
      if (s[i] === s[j] && (j - i &lt; 2 || pal[i + 1][j - 1])) pal[i][j] = true;
    }
  }

  const cuts = new Array(n).fill(0);
  for (let j = 0; j &lt; n; j++) {
    if (pal[0][j]) { cuts[j] = 0; continue; } <span class="c">// whole prefix is already a palindrome — zero cuts</span>
    let best = Infinity;
    for (let i = 1; i &lt;= j; i++) {
      if (pal[i][j]) best = Math.min(best, cuts[i - 1] + 1); <span class="c">// cut before i</span>
    }
    cuts[j] = best;
  }
  return cuts[n - 1];
}</code></pre>
<p class="sub">
  Matrix chain multiplication is the same skeleton one more time: iterate by
  chain length, split at k, combine as
  <code>dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]</code>. If you can write
  Burst Balloons you can write MCM — the only difference is what the
  "combine" term costs.
</p>

<h3>State compression: making a big state fit</h3>
<p>
  Once the state has three or four dimensions, memory becomes the binding
  constraint before time does. Three techniques cover most of it:
</p>
<table>
  <tr><th>Technique</th><th>When</th><th>Effect</th></tr>
  <tr><td>Rolling array</td><td>dp[i] only reads dp[i-1]</td><td>O(n·m) → O(m) memory; keep <code>prev</code> and <code>cur</code></td></tr>
  <tr><td>Pack dimensions into one integer key</td><td>small, bounded dimensions</td><td><code>pos * 100 + prev * 2 + started</code> beats a string key or nested Map</td></tr>
  <tr><td>Derive a dimension</td><td>one index is a function of another</td><td>popcount(mask) removes a whole dimension, as in the assignment DP</td></tr>
  <tr><td>Typed arrays</td><td>numeric dp with known bounds</td><td><code>Int32Array(1 &lt;&lt; n)</code> is ~4× smaller and faster than a JS array</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ String keys are where advanced DP silently gets slow</span>
  <code>memo.set(i + "," + j + "," + mask, v)</code> allocates a string on
  every single call. At 10<sup>7</sup> states that's the dominant cost — the
  algorithm is right and the submission still times out. Prefer a numeric key
  (<code>(i * M + j) * K + mask</code>) or a flat preallocated array. Mention
  this trade-off out loud; it reads as production experience, not trivia.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I write any code, let me
  pin down the state. I need to know which items are already used and where I
  currently am — order doesn't matter beyond that — so the state is
  (subset, current). n is 15, so 2¹⁵ × 15 states with an O(n) transition is
  about 8 million operations: comfortably fast. Then the recurrence writes
  itself."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>n ≤ 20 with permutations, assignments, or "visit all"</b> → bitmask DP. The tiny constraint is the giveaway; interviewers set n = 12-18 precisely to signal 2<sup>n</sup>.</li>
  <li><b>"Maximum/minimum over a tree, with a constraint between parent and child"</b> → tree DP with a tuple return. Ask what a parent needs from a subtree; that tuple <em>is</em> your state.</li>
  <li><b>N up to 10<sup>9</sup>-10<sup>18</sup> and the question is "how many numbers ≤ N satisfy…"</b> → digit DP. Nothing else fits a bound that large, and the answer is a count, not a search.</li>
  <li><b>"Merge adjacent," "burst," "remove and the neighbours join," "partition a string into pieces"</b> → interval DP. Loop by length; the split point is usually the <em>last</em> operation, not the first.</li>
  <li><b>Distinguish from plain 2D DP:</b> 2D DP indexes two independent sequences; interval DP indexes two ends of the <em>same</em> sequence and must be filled by length, not row by row.</li>
  <li><b>Distinguish from greedy:</b> if a locally best choice can be invalidated by a later one (bursting the biggest balloon first is not optimal), greedy is out — the fact that "obvious greedy" fails on a small counterexample is the strongest signal you're in advanced-DP territory.</li>
  <li>Common pitfall across all four: propagating <code>Infinity</code> from unreachable states into arithmetic. Always <code>continue</code> on unreachable before relaxing.</li>
</ul>`,
};
