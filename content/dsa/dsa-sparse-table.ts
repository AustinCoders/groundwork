import type { Chapter } from "../types";

export const dsaSparseTable: Chapter = {
  id: "dsa-sparse-table",
  num: "A7",
  title: "Sparse tables and range tricks",
  short: "Sparse tables",
  levels: ["advanced"],
  prerequisites: ["dsa-segment-fenwick-trees"],
  practice: [
    "ex-sparse-table-range-min",
    "ex-range-gcd-queries",
    "ex-range-min-index-leftmost",
    "ex-first-index-below-threshold",
    "ex-longest-subarray-abs-diff-limit",
    "ex-range-minimum-query-segment-tree",
    "ex-kth-ancestor-of-tree-node",
    "ex-kth-step-functional-graph",
    "ex-sqrt-decomposition-range-sum",
    "ex-sqrt-range-add-range-sum",
    "ex-offline-count-in-value-range",
    "ex-mo-powerful-array",
  ],
  ready: true,
  subtitle:
    "Pay O(n log n) once on an array that never changes and a range minimum costs one comparison. Doubling, blocks and reordered queries cover what a table cannot.",
  body: `<h3>Where the earlier tools stop</h3>
<p>
  Prefix sums answer "what is the sum of this range?" in O(1) because a sum can
  be <em>undone</em>: <code>sum(l..r) = P[r+1] − P[l]</code>. Take the same
  array and ask for the <b>minimum</b> of a range and the trick collapses —
  there is no way to subtract a minimum. The previous chapter's segment tree
  does answer it, in O(log n) per query, and it also accepts updates. That
  generality is paid for on every query: a descent through the tree with a
  recursive call or two per level.
</p>
<p>
  Now remove the updates. The array is read once, then queried a million
  times: the lowest price in a date range, the weakest link in a stretch of a
  pipeline, the common divisor of a run of numbers. When nothing ever changes,
  you are free to do work up front that a mutable structure could not afford.
  The question this chapter starts from is: <em>how much work up front buys a
  single comparison per query?</em>
</p>
<table>
  <tr><th>Approach</th><th>Build</th><th>Query</th><th>Memory</th><th>Updates</th></tr>
  <tr><td>Loop over the range each time</td><td>O(1)</td><td>O(n)</td><td>O(1) extra</td><td>trivial</td></tr>
  <tr><td>Precompute every pair (l, r)</td><td>O(n²)</td><td>O(1)</td><td>O(n²)</td><td>O(n²) to redo</td></tr>
  <tr><td>Segment tree</td><td>O(n)</td><td>O(log n)</td><td>O(n)</td><td>O(log n)</td></tr>
  <tr><td><b>Sparse table</b></td><td>O(n log n)</td><td><b>O(1)</b></td><td>O(n log n)</td><td>rebuild</td></tr>
</table>
<p class="sub">
  Storing every pair is out: n = 10<sup>5</sup> gives about 5 × 10<sup>9</sup>
  answers. The sparse table is the middle road between "store nothing" and
  "store everything": store the answer only for ranges whose length is a
  <em>power of two</em>. There are about n log n of those, and, as the next two
  sections show, any range is covered by two of them.
</p>
<p>
  One honest note on priorities. For most interview questions a segment tree
  is fast enough and you already know it, so the sparse table is not something
  you need in every round. It earns its place in two situations: the range
  query sits inside a loop or a binary search, so a log factor multiplies, and
  the problem tells you the array is fixed. The bigger payoff is the
  <b>doubling idea</b> underneath it, which comes back in this chapter as binary
  lifting and again, in disguise, in several other techniques.
</p>

<h3>The sparse table: keep only the power-of-two blocks</h3>
<p>
  Let <code>table[j][i]</code> be the answer for the block of length
  2<sup>j</sup> that starts at index <code>i</code>, that is, for
  <code>a[i .. i + 2<sup>j</sup> − 1]</code>. Row 0 is the array itself, since a
  block of length 1 is one element. The other rows follow from one observation:
  a block of length 2<sup>j</sup> is two blocks of length 2<sup>j−1</sup> placed
  side by side. So, writing <code>op</code> for min, max or gcd,
</p>
<pre><code>table[j][i] = op(table[j-1][i], table[j-1][i + 2^(j-1)])</code></pre>
<p>
  The block has to fit inside the array, so row j starts at index 0 and ends at
  index <code>n − 2<sup>j</sup></code>: it has <code>n − 2<sup>j</sup> + 1</code>
  entries. Rows exist for every j with 2<sup>j</sup> ≤ n, which is
  <code>⌊log₂ n⌋ + 1</code> rows. Here is the whole table, for minimum, on an
  array of eight numbers.
</p>
<table>
  <tr><th>i</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
  <tr><td><code>a</code> = row 0 (length 1)</td><td>5</td><td>2</td><td>4</td><td>7</td><td>1</td><td>3</td><td>6</td><td>2</td></tr>
  <tr><td>row 1 (length 2)</td><td>2</td><td>2</td><td>4</td><td>1</td><td>1</td><td>3</td><td>2</td><td>—</td></tr>
  <tr><td>row 2 (length 4)</td><td>2</td><td>1</td><td>1</td><td>1</td><td>1</td><td>—</td><td>—</td><td>—</td></tr>
  <tr><td>row 3 (length 8)</td><td>1</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td></tr>
</table>
<p class="sub">
  Read one cell to see the recurrence. <code>table[2][1] = 1</code> is the
  minimum of <code>a[1..4] = 2, 4, 7, 1</code>. It was built from
  <code>table[1][1] = 2</code> (the block <code>a[1..2]</code>) and
  <code>table[1][3] = 1</code> (the block <code>a[3..4]</code>), and
  min(2, 1) = 1. A dash is a block that would run past the end of the array, so
  no such cell is stored.
</p>

<h3>Querying in O(1) with two overlapping blocks</h3>
<p>
  Take a query for <code>a[l..r]</code> of length <code>len = r − l + 1</code>.
  Let <code>k = ⌊log₂ len⌋</code>, the largest k with 2<sup>k</sup> ≤ len. Two
  blocks of length 2<sup>k</sup> cover the range: one <b>starts</b> at
  <code>l</code>, the other <b>ends</b> at <code>r</code> and so starts at
  <code>r − 2<sup>k</sup> + 1</code>. There is no gap between them, because
  2<sup>k+1</sup> &gt; len means two blocks are at least as long as the whole
  range. They usually overlap, in the middle.
</p>

<figure>
  <svg viewBox="0 0 640 244" class="dg" role="img" aria-label="The array 5 2 4 7 1 3 6 2 with two blocks of length four, covering indices one to four and three to six, overlapping on indices three and four, which are marked as counted twice">
    <g class="rough">
      <rect class="boxg" x="98" y="40" width="266" height="26" rx="5" />
      <rect class="boxg" x="234" y="72" width="266" height="26" rx="5" />
      <rect class="boxr" x="234" y="104" width="130" height="26" rx="5" />
    </g>
    <g class="rough">
      <rect class="box" x="30" y="148" width="62" height="32" rx="4" />
      <rect class="boxg" x="98" y="148" width="62" height="32" rx="4" />
      <rect class="boxg" x="166" y="148" width="62" height="32" rx="4" />
      <rect class="boxr" x="234" y="148" width="62" height="32" rx="4" />
      <rect class="boxr" x="302" y="148" width="62" height="32" rx="4" />
      <rect class="boxg" x="370" y="148" width="62" height="32" rx="4" />
      <rect class="boxg" x="438" y="148" width="62" height="32" rx="4" />
      <rect class="box" x="506" y="148" width="62" height="32" rx="4" />
    </g>
    <text class="lbl gr" x="20" y="22" style="font-size:14px">query(1, 6): length 6, so k = 2 and two blocks of length 4</text>
    <text class="sm gr" x="231" y="58" text-anchor="middle">table[2][1] = min of a[1..4]</text>
    <text class="sm gr" x="367" y="90" text-anchor="middle">table[2][3] = min of a[3..6]</text>
    <text class="sm rd" x="299" y="122" text-anchor="middle">in both: a[3..4]</text>
    <text class="sm" x="61" y="169" text-anchor="middle">5</text>
    <text class="sm" x="129" y="169" text-anchor="middle">2</text>
    <text class="sm" x="197" y="169" text-anchor="middle">4</text>
    <text class="sm" x="265" y="169" text-anchor="middle">7</text>
    <text class="sm" x="333" y="169" text-anchor="middle">1</text>
    <text class="sm" x="401" y="169" text-anchor="middle">3</text>
    <text class="sm" x="469" y="169" text-anchor="middle">6</text>
    <text class="sm" x="537" y="169" text-anchor="middle">2</text>
    <text class="sm" x="61" y="198" text-anchor="middle">0</text>
    <text class="sm" x="129" y="198" text-anchor="middle">1</text>
    <text class="sm" x="197" y="198" text-anchor="middle">2</text>
    <text class="sm" x="265" y="198" text-anchor="middle">3</text>
    <text class="sm" x="333" y="198" text-anchor="middle">4</text>
    <text class="sm" x="401" y="198" text-anchor="middle">5</text>
    <text class="sm" x="469" y="198" text-anchor="middle">6</text>
    <text class="sm" x="537" y="198" text-anchor="middle">7</text>
    <text class="sm rd" x="20" y="232">for a minimum the double coverage is harmless: min(min(A), min(B)) is the minimum of A ∪ B</text>
  </svg>
  <figcaption>Two precomputed blocks answer a range of any length: the left one is anchored at l, the right one at r. The cells they share are simply seen twice.</figcaption>
</figure>

<p>
  To find k without a loop or a lookup table, use the position of the highest
  set bit of the length. <code>Math.clz32(len)</code> counts the leading zero
  bits in a 32-bit integer, so <code>31 − Math.clz32(len)</code> is exactly
  ⌊log₂ len⌋. Checked in Node 24, it matches <code>Math.floor(Math.log2(len))</code>
  for every length up to 2<sup>24</sup>, but the bit version is integer
  arithmetic from start to finish, so there is never a question of a float
  rounding the wrong way. If you prefer, a precomputed array
  <code>lg[i] = lg[i &gt;&gt; 1] + 1</code> does the same job.
</p>
<h4>Dry run: five queries for the minimum on the array from the table</h4>
<table>
  <tr><th>query(l, r)</th><th>len</th><th>k</th><th>left block (starts at l)</th><th>right block (ends at r)</th><th>min of the two</th><th>true minimum</th></tr>
  <tr><td>(1, 6)</td><td>6</td><td>2</td><td>table[2][1] = 1, covers 1..4</td><td>table[2][3] = 1, covers 3..6</td><td><b>1</b></td><td>min(2, 4, 7, 1, 3, 6) = 1</td></tr>
  <tr><td>(0, 2)</td><td>3</td><td>1</td><td>table[1][0] = 2, covers 0..1</td><td>table[1][1] = 2, covers 1..2</td><td><b>2</b></td><td>min(5, 2, 4) = 2</td></tr>
  <tr><td>(5, 7)</td><td>3</td><td>1</td><td>table[1][5] = 3, covers 5..6</td><td>table[1][6] = 2, covers 6..7</td><td><b>2</b></td><td>min(3, 6, 2) = 2</td></tr>
  <tr><td>(3, 7)</td><td>5</td><td>2</td><td>table[2][3] = 1, covers 3..6</td><td>table[2][4] = 1, covers 4..7</td><td><b>1</b></td><td>min(7, 1, 3, 6, 2) = 1</td></tr>
  <tr><td>(4, 4)</td><td>1</td><td>0</td><td>table[0][4] = 1</td><td>table[0][4] = 1</td><td><b>1</b></td><td>a[4] = 1</td></tr>
</table>
<p class="sub">
  Every query is two table reads and one <code>op</code>, whatever the length.
  The last row shows the degenerate case: with len = 1 both blocks are the same
  single element, which is fine for the same reason the overlaps are fine.
  In (0, 2) the element <code>a[1]</code> is inside both blocks.
</p>

<h3>Why it works only for idempotent operations</h3>
<p>
  The overlap is the entire trick, and it is also the entire restriction. Every
  element in the overlap is folded into the answer <em>twice</em>. That is only
  safe when folding something in twice gives the same result as folding it in
  once, an <b>idempotent</b> operation: <code>op(x, x) = x</code>. Minimum,
  maximum, gcd, bitwise AND and bitwise OR all have this property. The answer to
  "what is the min of this set?" does not depend on how many times a member
  appears, as long as every member appears at least once, and that is exactly
  what two covering blocks guarantee.
</p>
<p>
  A sum is the opposite case. Run the same two-block query for the sum of
  <code>a[1..6]</code> on the array above:
</p>
<table>
  <tr><th>piece</th><th>covers</th><th>value</th></tr>
  <tr><td>left block, table[2][1]</td><td>a[1..4] = 2, 4, 7, 1</td><td>14</td></tr>
  <tr><td>right block, table[2][3]</td><td>a[3..6] = 7, 1, 3, 6</td><td>17</td></tr>
  <tr><td>left + right</td><td></td><td><b>31</b></td></tr>
  <tr><td>true sum of a[1..6]</td><td>2 + 4 + 7 + 1 + 3 + 6</td><td><b>23</b></td></tr>
  <tr><td>the difference</td><td>the overlap a[3..4] = 7 + 1</td><td>8, counted twice</td></tr>
</table>
<table>
  <tr><th>Operation</th><th>op(x, x) = x?</th><th>Overlapping two-block query?</th></tr>
  <tr><td>min, max</td><td>yes</td><td>yes, O(1)</td></tr>
  <tr><td>gcd</td><td>yes, gcd(x, x) = x</td><td>yes, O(1)</td></tr>
  <tr><td>bitwise AND, OR</td><td>yes</td><td>yes, O(1)</td></tr>
  <tr><td>sum</td><td>no, x + x = 2x</td><td>no, double counts</td></tr>
  <tr><td>XOR</td><td>no, x ^ x = 0, the overlap cancels itself out</td><td>no, drops the overlap</td></tr>
  <tr><td>product, count</td><td>no</td><td>no</td></tr>
</table>
<p>
  This is the same split as in the previous chapter, seen from the other side.
  A Fenwick tree needs an operation that can be <em>undone</em> (sum, XOR); a
  sparse table needs one that can be <em>repeated</em> (min, max, gcd). They
  cover different operations, and which one you need follows from the
  question.
</p>
<p>
  The table is not useless for the other operations; it just loses the O(1).
  Any associative operation can be answered from the same rows in O(log n) by
  cutting the range into blocks that do <em>not</em> overlap: take the biggest
  power of two that still fits, then the biggest that fits in what remains, and
  so on. That is the binary representation of the length. For the sum of
  <code>a[1..6]</code>, length 6 = 4 + 2, take <code>table[2][1] = 14</code>
  for <code>a[1..4]</code>, then <code>table[1][5] = 9</code> for
  <code>a[5..6]</code>, and 14 + 9 = 23. The order is left to right, so it also
  works for operations where order matters.
</p>

<h3>The complete sparse table</h3>
<p>
  The class below takes the combining function as an argument, so one piece of
  code serves min, max, gcd and the rest. The rows are plain arrays of numbers;
  each row is shorter than the one before it by exactly the amount the block
  length grew.
</p>
<pre><code>class SparseTable {
  constructor(nums, combine) {
    this.combine = combine;
    const n = nums.length;
    this.table = [nums.slice()]; <span class="c">// level 0: blocks of length 1</span>
    for (let j = 1; (1 &lt;&lt; j) &lt;= n; j++) {
      const prev = this.table[j - 1];
      const half = 1 &lt;&lt; (j - 1);
      const row = new Array(n - (1 &lt;&lt; j) + 1);
      for (let i = 0; i &lt; row.length; i++) {
        row[i] = combine(prev[i], prev[i + half]); <span class="c">// two halves of the block at i</span>
      }
      this.table.push(row);
    }
  }

  query(l, r) { <span class="c">// inclusive, needs 0 &lt;= l &lt;= r &lt; n</span>
    const k = 31 - Math.clz32(r - l + 1); <span class="c">// floor(log2(length))</span>
    const left = this.table[k][l];
    const right = this.table[k][r - (1 &lt;&lt; k) + 1]; <span class="c">// block that ends exactly at r</span>
    return this.combine(left, right);
  }
}</code></pre>
<pre><code>const gcd = (a, b) =&gt; (b === 0 ? a : gcd(b, a % b));

const mins = new SparseTable([5, 2, 4, 7, 1, 3, 6, 2], Math.min);
mins.query(1, 6); <span class="c">// 1</span>
mins.query(0, 2); <span class="c">// 2</span>

const gcds = new SparseTable([12, 18, 24, 9, 6], gcd);
gcds.query(0, 2); <span class="c">// 6, the gcd of 12, 18, 24</span>
gcds.query(1, 3); <span class="c">// 3, the gcd of 18, 24, 9</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Four ways a sparse table goes wrong</span>
  <b>An operation that is not idempotent.</b> Pass <code>(a, b) =&gt; a + b</code>
  and every query that has an overlap returns a plausible, wrong number; no error
  appears. Check <code>op(x, x) = x</code> before you build.
  <b>A bad range.</b> The class does not check <code>l &lt;= r</code>.
  With <code>l &gt; r</code> the length is zero or negative, so <code>k</code> is
  not a valid row, and the read of <code>this.table[k]</code> throws a
  <code>TypeError</code>. Validate at the edge if the input is untrusted.
  <b>Expecting updates.</b> The table is a snapshot. Assign to the original
  array afterwards and every cell that included that element is stale, silently.
  <b>The wrong row bound.</b> The loop condition is
  <code>(1 &lt;&lt; j) &lt;= n</code>. With <code>&lt;</code> instead of
  <code>&lt;=</code> the top row is missing, and a query over the whole array
  with n a power of two reads a row that does not exist.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "The array is fixed and the
  question is a range minimum, so there is no need to pay O(log n) per query.
  I'll build a sparse table: row j holds the minimum of every block of length
  2<sup>j</sup>, built from the row below in O(n log n). A query takes the two
  blocks of length 2<sup>k</sup> that start at l and end at r, with k the floor
  of log₂ of the length, and returns the smaller one. They overlap, which is
  fine for min and wrong for sum. If there were updates I would use a segment
  tree instead."
</div>

<h3>Cost: O(n log n) to build, and the memory bill</h3>
<p>
  There are ⌊log₂ n⌋ + 1 rows, and every row has at most n entries, each
  filled with one <code>op</code> call, so the build is <b>O(n log n)</b> time
  and <b>O(n log n)</b> memory. The query does one subtraction, one
  <code>clz32</code>, two reads and one <code>op</code>: <b>O(1)</b>, assuming
  <code>op</code> itself is constant time (gcd on machine integers takes a
  number of steps that grows with the logarithm of the values, so a gcd table
  has that extra factor per query).
</p>
<p>
  Memory is the price, and it is worth putting numbers on it, because it is
  what decides whether the sparse table is the right choice.
</p>
<table>
  <tr><th>n</th><th>rows</th><th>entries in the table</th><th>if each entry is a 4-byte integer</th></tr>
  <tr><td>10<sup>5</sup></td><td>17</td><td>1,568,946</td><td>about 6.3 MB</td></tr>
  <tr><td>10<sup>6</sup></td><td>20</td><td>18,951,445</td><td>about 76 MB</td></tr>
</table>
<p class="sub">
  Compare the structures you already have, at n = 10<sup>5</sup>: a prefix-sum
  array or Fenwick tree stores n + 1 numbers, and the segment tree of the last
  chapter allocates 4n = 400,000. The sparse table is about four times the
  segment tree there, and the gap widens with n because it carries the extra
  log n factor. For large n in JavaScript, build each row as an
  <code>Int32Array</code> (or <code>Float64Array</code> if values do not fit
  32 bits): a typed array stores each entry in a fixed 4 or 8 bytes.
</p>
<p>
  What about updates? Change <code>a[i]</code> and every cell whose block
  contains i is stale. Row j has up to 2<sup>j</sup> such cells, so a single
  change can invalidate O(n) cells across the rows, and a mutable array wants a
  different structure. If the changes arrive in a batch and queries come
  afterwards, rebuilding once in O(n log n) is a legitimate plan.
</p>

<h3>Returning the position, not the value</h3>
<p>
  Often the question is "<em>where</em> is the minimum?", not "what is it?". The
  fix is to store indices in the table and make the combining step compare the
  values those indices point at. The ties are the part to be careful about:
  when two candidates have equal values, keep the left one and the answer is the
  leftmost minimum of the range.
</p>
<pre><code>function buildArgMin(nums) {
  const pickIndex = (a, b) =&gt; (nums[b] &lt; nums[a] ? b : a); <span class="c">// on a tie keep a, the smaller index</span>
  const indices = nums.map((_, i) =&gt; i);
  return new SparseTable(indices, pickIndex);
}</code></pre>
<p>
  For <code>nums = [5, 2, 4, 7, 1, 3, 6, 2]</code> the table built this way
  answers <code>query(0, 7)</code> with 4 and <code>query(5, 7)</code> with 7,
  the position of the 2 at the end. On <code>[3, 1, 1, 1, 3]</code>,
  <code>query(2, 4)</code> returns 2, not 3 or 4, and <code>query(0, 4)</code>
  returns 1. This is still the idempotent trick: <code>pickIndex(x, x)</code>
  returns <code>x</code>, so a candidate that sits in the overlap cannot change
  the result.
</p>
<div class="warn">
  <span class="ttl">⚠ Do not pass Math.min as the combine step for indices</span>
  <code>Math.min(3, 1)</code> would return the smaller <em>index</em>, which has
  nothing to do with which element is smaller. The same slip happens with
  <code>Math.max</code> when you want the position of a maximum. The combine
  step must look values up in the original array.
</div>

<h3>Descending the table: the first index below a threshold</h3>
<p>
  A second query the same table answers, and one that sets up the next section.
  Given a start index and a threshold x, find the first index at or after the
  start whose value is below x. A block whose minimum is at least x contains
  nothing you want, so you can skip all of it. Try the block sizes from the
  largest down to 1, and skip whenever a whole block is safe to skip.
</p>
<pre><code>function firstBelow(st, from, x) { <span class="c">// st is a SparseTable built with Math.min</span>
  const n = st.table[0].length;
  let pos = from;
  for (let j = st.table.length - 1; j &gt;= 0; j--) {
    if (pos + (1 &lt;&lt; j) &lt;= n &amp;&amp; st.table[j][pos] &gt;= x) pos += 1 &lt;&lt; j; <span class="c">// the whole block is &gt;= x: skip it</span>
  }
  return pos &lt; n ? pos : -1;
}</code></pre>
<p>
  Why does the greedy order work? Say the answer is d positions after
  <code>from</code>, which means the first d values are all at least x. Skipping
  a block of length 2<sup>j</sup> is allowed exactly when it fits inside those
  d positions. Going from the largest size to the smallest, the code takes each
  power of two that is still needed, which builds d in binary, one bit per row.
  So the cost is one step per row: O(log n) per query, with no
  <code>op</code> calls at all. If no value is below x, the walk ends at
  <code>n</code> and the function returns −1.
</p>
<p class="sub">
  On <code>[5, 2, 4, 7, 1, 3, 6, 2]</code>: <code>firstBelow(st, 0, 3)</code>
  gives 1, <code>firstBelow(st, 2, 2)</code> gives 4, <code>firstBelow(st, 5, 3)</code>
  gives 7, and <code>firstBelow(st, 0, 1)</code> gives −1, because no value is
  below 1.
</p>

<h3>The table as a subroutine: longest subarray within a limit</h3>
<p>
  Range minimum and maximum rarely stand alone in an interview; they are the
  inner step of something else. Take the sliding-window problem "find the
  longest subarray in which the largest and smallest values differ by at most
  <code>limit</code>". Growing the window to the right and shrinking it from the
  left is the two-pointer pattern, and the only thing it needs at each step is
  max − min over the current window. With two sparse tables that is two O(1)
  reads.
</p>
<pre><code>function longestWithinLimit(nums, limit) {
  const lows = new SparseTable(nums, Math.min);
  const highs = new SparseTable(nums, Math.max);
  let best = 0;
  let left = 0;
  for (let right = 0; right &lt; nums.length; right++) {
    while (highs.query(left, right) - lows.query(left, right) &gt; limit) left++;
    best = Math.max(best, right - left + 1);
  }
  return best;
}</code></pre>
<h4>Dry run: longestWithinLimit([10, 1, 2, 4, 7, 2], 5)</h4>
<table>
  <tr><th>right</th><th>left before</th><th>window [left..right]</th><th>max − min</th><th>action</th><th>left after</th><th>length, best so far</th></tr>
  <tr><td>0</td><td>0</td><td>[0..0]</td><td>10 − 10 = 0</td><td>fits</td><td>0</td><td>1, 1</td></tr>
  <tr><td>1</td><td>0</td><td>[0..1]</td><td>10 − 1 = 9 &gt; 5</td><td>left++</td><td>1</td><td>1, 1</td></tr>
  <tr><td>2</td><td>1</td><td>[1..2]</td><td>2 − 1 = 1</td><td>fits</td><td>1</td><td>2, 2</td></tr>
  <tr><td>3</td><td>1</td><td>[1..3]</td><td>4 − 1 = 3</td><td>fits</td><td>1</td><td>3, 3</td></tr>
  <tr><td>4</td><td>1</td><td>[1..4]</td><td>7 − 1 = 6 &gt; 5</td><td>left++</td><td>2</td><td>3, 3</td></tr>
  <tr><td>5</td><td>2</td><td>[2..5]</td><td>7 − 2 = 5</td><td>fits</td><td>2</td><td>4, <b>4</b></td></tr>
</table>
<p>
  The answer is 4, the window <code>[2, 4, 7, 2]</code>. The cost is O(n log n)
  for the two tables and O(n) queries after that, so O(n log n) overall.
</p>
<p class="sub">
  Be straight with the interviewer about the alternative. A pair of monotonic
  deques (see <a href="/dsa/dsa-monotonic-stack-queue">monotonic stack and queue</a>)
  solves this exact problem in O(n) time and O(n) memory, and the practice list
  has that problem under <code>ex-longest-subarray-abs-diff-limit</code>. The
  sparse table version is shorter to get right, and it keeps working when the
  ranges you ask about do not slide in one direction, for example when you
  binary search for the longest valid length, or when the queries are arbitrary
  pairs handed to you in a list.
</p>

<h3>Binary lifting: the same doubling, over ancestors</h3>
<p>
  A tree of n nodes is given as a <code>parent</code> array, and you are asked,
  many times, for the k-th ancestor of a node: the node you reach by going up k
  parents. Walking up one parent at a time costs O(k), which is O(n) per query
  on a tree that is a long chain, and with 10<sup>5</sup> nodes and 10<sup>5</sup>
  queries that is the 10<sup>10</sup> wall from the last chapter again.
</p>
<p>
  The sparse table suggests the cure. It never stored every block length; it
  stored lengths 1, 2, 4, 8, ... and built each from two of the previous size.
  Do the same with <em>jumps</em>. Let <code>up[j][v]</code> be the node you
  reach from v by going up 2<sup>j</sup> parents, or −1 if the root is passed on
  the way. A jump of 2<sup>j</sup> steps is two jumps of 2<sup>j−1</sup> steps
  chained together:
</p>
<pre><code>up[j][v] = up[j-1][ up[j-1][v] ]      <span class="c">// but -1 stays -1</span></code></pre>
<p>
  To answer a query, write k in binary. Going up k steps is the same as going up
  2<sup>j</sup> steps for every bit j that is set in k, since the bits add up to
  k, and every jump follows the one path toward the root, so the order does not
  matter. That is at most log₂ n jumps per query.
</p>
<pre><code>class AncestorTable {
  constructor(parent) { <span class="c">// parent[root] = -1</span>
    const n = parent.length;
    this.n = n;
    let levels = 1;
    while ((1 &lt;&lt; levels) &lt; n) levels++; <span class="c">// 2^levels &gt;= n, deeper than any node</span>
    this.up = [parent.slice()]; <span class="c">// up[j][v] = the 2^j-th ancestor of v, or -1</span>
    for (let j = 1; j &lt; levels; j++) {
      const prev = this.up[j - 1];
      const row = new Array(n);
      for (let v = 0; v &lt; n; v++) {
        row[v] = prev[v] === -1 ? -1 : prev[prev[v]]; <span class="c">// two jumps of 2^(j-1)</span>
      }
      this.up.push(row);
    }
  }

  kthAncestor(node, k) {
    if (k &gt;= this.n) return -1; <span class="c">// no node is that deep</span>
    for (let j = 0; j &lt; this.up.length &amp;&amp; node !== -1; j++) {
      if ((k &gt;&gt; j) &amp; 1) node = this.up[j][node];
    }
    return node;
  }
}</code></pre>
<pre><code>const tree = new AncestorTable([-1, 0, 0, 1, 1, 2, 4, 6]);
tree.kthAncestor(7, 3); <span class="c">// 1</span>
tree.kthAncestor(7, 4); <span class="c">// 0</span>
tree.kthAncestor(7, 5); <span class="c">// -1, node 7 has only four ancestors</span></code></pre>
<h4>Dry run: the tree 0←1, 0←2, 1←3, 1←4, 2←5, 4←6, 6←7</h4>
<table>
  <tr><th>node v</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
  <tr><td><code>up[0][v]</code> = parent</td><td>−1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>2</td><td>4</td><td>6</td></tr>
  <tr><td><code>up[1][v]</code> = 2 steps up</td><td>−1</td><td>−1</td><td>−1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>4</td></tr>
  <tr><td><code>up[2][v]</code> = 4 steps up</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>0</td></tr>
</table>
<p class="sub">
  Row 1 is row 0 applied twice: for v = 6, <code>up[0][6] = 4</code> and
  <code>up[0][4] = 1</code>, so <code>up[1][6] = 1</code>. Node 7's ancestors,
  nearest first, are 6, 4, 1, 0.
</p>
<table>
  <tr><th>query</th><th>k in binary</th><th>jumps taken</th><th>result</th></tr>
  <tr><td>kthAncestor(7, 3)</td><td>011</td><td>bit 0: up[0][7] = 6; bit 1: up[1][6] = 1</td><td><b>1</b></td></tr>
  <tr><td>kthAncestor(7, 4)</td><td>100</td><td>bit 2: up[2][7] = 0</td><td><b>0</b></td></tr>
  <tr><td>kthAncestor(7, 5)</td><td>101</td><td>bit 0: up[0][7] = 6; bit 2: up[2][6] = −1</td><td><b>−1</b></td></tr>
  <tr><td>kthAncestor(5, 1)</td><td>001</td><td>bit 0: up[0][5] = 2</td><td><b>2</b></td></tr>
</table>
<p>
  The build is O(n log n) time and memory, one row per bit, and a query is
  O(log n). The number of rows follows from the depth: no node has more than
  n − 1 ancestors, so with 2<sup>rows</sup> ≥ n every k below n has all its set
  bits inside the rows, and the guard <code>k &gt;= this.n</code> returns −1 for
  the rest. One difference from the dynamic programs you may have written on
  trees: row j depends only on row j − 1, never on a traversal order, so the
  parent array may list nodes in any order.
</p>
<div class="warn">
  <span class="ttl">⚠ Lifting pitfalls</span>
  <b>Forgetting that −1 is a node.</b> Without the
  <code>prev[v] === -1</code> test, the build reads <code>prev[-1]</code>, which
  is <code>undefined</code>, and the table fills with <code>undefined</code>
  instead of −1. <b>Too few rows.</b> If the row count is less than the bits in
  the largest k you will ask for, the loop silently ignores the high bits and
  returns a wrong ancestor, not an error. <b>The root as its own parent.</b>
  Some solutions set <code>parent[root] = root</code> instead of −1, which makes
  every too-large k land on the root. Decide which convention the problem wants
  and keep it in the build and the guard.
</div>
<p>
  The table is not limited to "which node". A second table beside
  <code>up</code> can carry a value along each jump, for example the largest
  edge weight on the way, merged with <code>Math.max</code> when two jumps
  chain. The best-known application is the lowest common ancestor of two nodes:
  lift the deeper one until both sit at the same depth, then lift both together.
  That needs depths from a traversal, and it belongs with strongly connected
  components, bridges and Euler paths in
  <a href="/dsa/dsa-graph-structure">the advanced graphs chapter</a>, which builds
  the same table and puts the LCA on top of it.
</p>

<h4>No tree needed: the same idea on a functional graph</h4>
<p>
  Doubling does not depend on the structure being a tree. Suppose every node has
  exactly one outgoing edge, <code>next[v]</code>, and the graph may contain
  cycles (a train that always goes from station i to <code>next[i]</code>).
  Where are you after k steps, with k as large as 10<sup>12</sup>? Simulating is
  hopeless; squaring the table is not: after the j-th squaring,
  <code>jump[v]</code> is the station 2<sup>j</sup> steps ahead.
</p>
<pre><code>function kthStep(next, start, k) {
  let levels = 1;
  while (2 ** levels &lt;= k) levels++;
  let jump = next.slice(); <span class="c">// jump = the 2^0 table</span>
  let node = start;
  for (let j = 0; j &lt; levels; j++) {
    if (Math.floor(k / 2 ** j) % 2 === 1) node = jump[node];
    jump = jump.map((v) =&gt; jump[v]); <span class="c">// square the table: 2^j steps becomes 2^(j+1)</span>
  }
  return node;
}</code></pre>
<pre><code>const next = [1, 2, 0, 3]; <span class="c">// 0 -&gt; 1 -&gt; 2 -&gt; 0 and so on; station 3 loops on itself</span>
kthStep(next, 0, 1e12); <span class="c">// 1, because 10^12 % 3 === 1</span>
kthStep(next, 3, 1e12); <span class="c">// 3</span></code></pre>
<p>
  This keeps one table and squares it in place, so memory stays O(n) and time is
  O(n log k). It reads each bit of k with <code>Math.floor(k / 2 ** j) % 2</code>
  instead of <code>(k &gt;&gt; j) &amp; 1</code>, because the bit operators in
  JavaScript first convert to a 32-bit integer and would silently cut off a k
  like 10<sup>12</sup>. Walking until a node repeats also works for this problem, and avoids the
  table, but it has to treat the tail before the cycle and the cycle itself
  separately; the doubling version needs no such case split.
</p>

<h3>Sqrt decomposition: blocks of about √n</h3>
<p>
  The next idea is the simplest of the chapter and the most forgiving.
  Cut the array into blocks of size B, and for every block keep the aggregate you
  care about, such as its sum. A range query then has three parts: single
  elements at the left end, whole blocks in the middle, single elements at the
  right end.
</p>

<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="An array of ten numbers cut into four blocks of three, three, three and one, each with its sum above it, and a query for indices two to seven reading one single cell, one whole block, and two single cells">
    <g class="rough">
      <rect class="box" x="20" y="34" width="150" height="28" rx="5" />
      <rect class="boxg" x="190" y="34" width="150" height="28" rx="5" />
      <rect class="box" x="360" y="34" width="150" height="28" rx="5" />
      <rect class="box" x="530" y="34" width="46" height="28" rx="5" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="92" width="46" height="32" rx="4" />
      <rect class="box" x="72" y="92" width="46" height="32" rx="4" />
      <rect class="boxg" x="124" y="92" width="46" height="32" rx="4" />
      <rect class="box" x="190" y="92" width="46" height="32" rx="4" />
      <rect class="box" x="242" y="92" width="46" height="32" rx="4" />
      <rect class="box" x="294" y="92" width="46" height="32" rx="4" />
      <rect class="boxg" x="360" y="92" width="46" height="32" rx="4" />
      <rect class="boxg" x="412" y="92" width="46" height="32" rx="4" />
      <rect class="box" x="464" y="92" width="46" height="32" rx="4" />
      <rect class="box" x="530" y="92" width="46" height="32" rx="4" />
    </g>
    <text class="sm" x="95" y="53" text-anchor="middle">block 0: sum 15</text>
    <text class="sm gr" x="265" y="53" text-anchor="middle">block 1: sum 13</text>
    <text class="sm" x="435" y="53" text-anchor="middle">block 2: sum 17</text>
    <text class="sm" x="553" y="53" text-anchor="middle">B3: 10</text>
    <text class="sm" x="43" y="113" text-anchor="middle">5</text>
    <text class="sm" x="95" y="113" text-anchor="middle">2</text>
    <text class="sm gr" x="147" y="113" text-anchor="middle">8</text>
    <text class="sm" x="213" y="113" text-anchor="middle">1</text>
    <text class="sm" x="265" y="113" text-anchor="middle">9</text>
    <text class="sm" x="317" y="113" text-anchor="middle">3</text>
    <text class="sm gr" x="383" y="113" text-anchor="middle">7</text>
    <text class="sm gr" x="435" y="113" text-anchor="middle">4</text>
    <text class="sm" x="487" y="113" text-anchor="middle">6</text>
    <text class="sm" x="553" y="113" text-anchor="middle">10</text>
    <text class="sm" x="147" y="144" text-anchor="middle">index 2</text>
    <text class="sm" x="265" y="144" text-anchor="middle">indices 3 to 5</text>
    <text class="sm" x="435" y="144" text-anchor="middle">indices 6, 7</text>
    <text class="lbl gr" x="20" y="22" style="font-size:14px">query(2, 7) = 8 (one cell) + 13 (one whole block) + 7 + 4 (two cells) = 32</text>
    <text class="sm rd" x="20" y="180">the last block is shorter than the others, so the length of block b is min(B, n - b·B)</text>
  </svg>
  <figcaption>With n = 10 the block size is ⌊√10⌋ = 3, giving ⌈10 / 3⌉ = 4 blocks. A query pays one read per loose cell plus one read per whole block.</figcaption>
</figure>

<h3>Choosing the block size, and the code</h3>
<p>
  How many reads does one query cost? At most B − 1 loose cells on the left, B − 1
  on the right, and about n / B whole blocks, so roughly 2B + n / B. Making B
  larger shortens the block list and lengthens the loose ends, and the reverse.
  The sum is smallest when the two terms balance, near B = √(n / 2), and anything
  close to √n has the same growth: <b>O(√n) per query</b>, which is why
  <code>Math.floor(Math.sqrt(n))</code> is the usual choice and why the idea is
  named after the square root.
</p>
<pre><code>class SqrtSum {
  constructor(nums) {
    this.a = nums.slice();
    this.size = Math.max(1, Math.floor(Math.sqrt(nums.length)));
    this.blocks = new Array(Math.ceil(nums.length / this.size)).fill(0);
    for (let i = 0; i &lt; nums.length; i++) {
      this.blocks[Math.floor(i / this.size)] += nums[i];
    }
  }

  update(i, value) {
    this.blocks[Math.floor(i / this.size)] += value - this.a[i]; <span class="c">// fix the block by the difference</span>
    this.a[i] = value;
  }

  query(l, r) { <span class="c">// inclusive</span>
    const first = Math.floor(l / this.size);
    const last = Math.floor(r / this.size);
    let sum = 0;
    if (first === last) {
      for (let i = l; i &lt;= r; i++) sum += this.a[i]; <span class="c">// inside one block: just loop</span>
      return sum;
    }
    for (let i = l; i &lt; (first + 1) * this.size; i++) sum += this.a[i]; <span class="c">// tail of the first block</span>
    for (let b = first + 1; b &lt; last; b++) sum += this.blocks[b]; <span class="c">// whole blocks</span>
    for (let i = last * this.size; i &lt;= r; i++) sum += this.a[i]; <span class="c">// head of the last block</span>
    return sum;
  }
}</code></pre>
<pre><code>const blocks = new SqrtSum([5, 2, 8, 1, 9, 3, 7, 4, 6, 10]);
blocks.query(2, 7); <span class="c">// 32 = 8 + 13 + (7 + 4)</span>
blocks.update(4, 0);
blocks.query(2, 7); <span class="c">// 23</span></code></pre>
<h4>Dry run: the array from the figure</h4>
<table>
  <tr><th>step</th><th>what happens</th><th>reads</th><th>result</th></tr>
  <tr><td>build</td><td>size = ⌊√10⌋ = 3, blocks = ⌈10 / 3⌉ = 4, sums [15, 13, 17, 10]</td><td>10</td><td>—</td></tr>
  <tr><td>query(2, 7)</td><td>first block 0, last block 2. Tail of block 0: index 2. Whole block 1. Head of block 2 up to 7: indices 6, 7</td><td>1 + 1 + 2</td><td>8 + 13 + (7 + 4) = <b>32</b></td></tr>
  <tr><td>update(4, 0)</td><td>blocks[1] += 0 − 9, so block 1 drops from 13 to 4</td><td>1</td><td>sums [15, 4, 17, 10]</td></tr>
  <tr><td>query(2, 7)</td><td>same pieces, block 1 is now 4</td><td>1 + 1 + 2</td><td>8 + 4 + 11 = <b>23</b></td></tr>
  <tr><td>query(0, 1)</td><td>first = last = block 0, so loop over the cells only</td><td>2</td><td>5 + 2 = <b>7</b></td></tr>
</table>
<p class="sub">
  An update for a sum is O(1): the block total changes by the difference
  between the new and old value, and nothing else is touched. A build is O(n),
  one pass.
</p>
<div class="warn">
  <span class="ttl">⚠ Where block code goes wrong</span>
  <b>Both ends in one block.</b> If <code>l</code> and <code>r</code> are in the
  same block, the general three-part code reads the tail from l to the block end
  and the head from the block start to r, so some cells are counted twice and
  others are read from outside the range. Handle that case first, as the code
  does. <b>The short last block.</b> The block count is
  <code>Math.ceil(n / size)</code>, not <code>Math.floor</code>, and a block
  length is <code>Math.min(size, n - b * size)</code>; assuming every block has
  <code>size</code> elements breaks the lazy variant below. <b>A size of zero.</b>
  An empty array gives <code>Math.sqrt(0) = 0</code>, which divides by zero in
  the index math; <code>Math.max(1, ...)</code> keeps the size valid.
  <b>Using a difference for a non-invertible aggregate.</b> A minimum cannot be
  repaired by subtracting; see the next code block.
</div>
<p>
  When the aggregate is a minimum, an update cannot correct the block total by a
  difference, because the old value may have been the minimum and you do not
  know the runner-up. The fix is to recompute the block from its cells, which
  costs O(B) = O(√n):
</p>
<pre><code>class SqrtMin {
  constructor(nums) {
    this.a = nums.slice();
    this.size = Math.max(1, Math.floor(Math.sqrt(nums.length)));
    this.blocks = [];
    for (let b = 0; b * this.size &lt; nums.length; b++) this.blocks.push(this._scan(b));
  }

  _scan(b) {
    const from = b * this.size;
    const to = Math.min(from + this.size, this.a.length);
    let low = Infinity;
    for (let i = from; i &lt; to; i++) low = Math.min(low, this.a[i]);
    return low;
  }

  update(i, value) {
    this.a[i] = value;
    const b = Math.floor(i / this.size);
    this.blocks[b] = this._scan(b); <span class="c">// a minimum cannot be fixed by a difference: rescan the block</span>
  }

  query(l, r) {
    const first = Math.floor(l / this.size);
    const last = Math.floor(r / this.size);
    let low = Infinity;
    if (first === last) {
      for (let i = l; i &lt;= r; i++) low = Math.min(low, this.a[i]);
      return low;
    }
    for (let i = l; i &lt; (first + 1) * this.size; i++) low = Math.min(low, this.a[i]);
    for (let b = first + 1; b &lt; last; b++) low = Math.min(low, this.blocks[b]);
    for (let i = last * this.size; i &lt;= r; i++) low = Math.min(low, this.a[i]);
    return low;
  }
}</code></pre>
<p class="sub">
  On <code>[5, 2, 8, 1, 9, 3, 7, 4, 6, 10]</code> the block minimums are
  [2, 1, 4, 10]. After <code>update(3, 20)</code>, block 1 holds 20, 9, 3, so its
  minimum rises from 1 to 3, and <code>query(2, 7)</code> changes from 1 to 3.
</p>
<p>
  Why use √n blocks at all when a segment tree gives O(log n)? For n = 10<sup>5</sup>
  the block size is 316, so a worst-case query reads about 950 cells, against a
  few dozen tree nodes. The reason to choose blocks is what a block is
  <em>allowed to hold</em>. A segment-tree node must merge with its sibling in
  O(1). A block can hold anything you can rebuild in O(B): a sorted copy of its
  cells, a table of how often each value occurs, a bitset. "Count the elements
  at least x in a range, with updates" is the typical example: keep each block
  sorted, binary search inside every whole block, rebuild one block on an
  update. Another extension is the range add with range sum: put a pending
  <code>lazy</code> amount on each block, add to whole blocks by bumping the tag
  and the block total (<code>delta * length</code>), and add cell by cell at the
  two loose ends. The exercise <code>ex-sqrt-range-add-range-sum</code> builds
  exactly that.
</p>

<h3>Offline queries: sort them first</h3>
<p>
  Everything so far answered each query the moment it arrived. Often the
  problem hands you the <em>whole list</em> of queries up front, and then you
  are free to answer them in any order you like and put the answers back in the
  original positions. That freedom is a technique by itself: pick an order in
  which one sweeping structure can answer each query at the right moment.
</p>
<p>
  Here is the standard example. Given an array and queries
  <code>[l, r, x]</code>, count how many elements of <code>nums[l..r]</code> are
  at most x. Answering one query at a time needs a structure that can ask about
  any position range and any value limit at once, which is heavy. But sort the
  queries by x. As x grows, the set of elements that are <code>&lt;= x</code>
  only <em>grows</em>, so each element is switched on exactly once. Keep a
  Fenwick tree over <em>positions</em>, with a 1 at every switched-on position:
  a query is then a count of ones in <code>[l, r]</code>, the difference of two
  prefix sums.
</p>
<pre><code>function countAtMost(nums, queries) { <span class="c">// queries[q] = [l, r, x]: how many of nums[l..r] are &lt;= x</span>
  const n = nums.length;
  const byValue = nums.map((_, i) =&gt; i).sort((a, b) =&gt; nums[a] - nums[b]);
  const byLimit = queries.map((_, q) =&gt; q).sort((a, b) =&gt; queries[a][2] - queries[b][2]);

  const tree = new Array(n + 1).fill(0); <span class="c">// Fenwick over positions: 1 = "this element is active"</span>
  const activate = (i) =&gt; {
    for (let k = i + 1; k &lt;= n; k += k &amp; -k) tree[k]++;
  };
  const activeBefore = (i) =&gt; {
    let sum = 0;
    for (let k = i; k &gt; 0; k -= k &amp; -k) sum += tree[k]; <span class="c">// active elements in positions 0..i-1</span>
    return sum;
  };

  const answer = new Array(queries.length);
  let next = 0;
  for (const q of byLimit) {
    const [l, r, x] = queries[q];
    while (next &lt; n &amp;&amp; nums[byValue[next]] &lt;= x) activate(byValue[next++]);
    answer[q] = activeBefore(r + 1) - activeBefore(l);
  }
  return answer;
}</code></pre>
<h4>Dry run: nums = [4, 1, 3, 1, 5, 2]</h4>
<p>
  The queries are q0 = (1, 4, 2), q1 = (0, 5, 3), q2 = (2, 3, 1), q3 = (0, 2, 4).
  The positions in order of value are <code>byValue = [1, 3, 5, 2, 0, 4]</code>,
  which are the values 1, 1, 2, 3, 4, 5.
</p>
<table>
  <tr><th>query, in sorted order</th><th>x</th><th>positions switched on in this step</th><th>on after the step</th><th>count in [l, r]</th></tr>
  <tr><td>q2 = (2, 3, 1)</td><td>1</td><td>1, 3 (values 1, 1)</td><td>{1, 3}</td><td>position 3 only: <b>1</b></td></tr>
  <tr><td>q0 = (1, 4, 2)</td><td>2</td><td>5 (value 2)</td><td>{1, 3, 5}</td><td>positions 1, 3: <b>2</b></td></tr>
  <tr><td>q1 = (0, 5, 3)</td><td>3</td><td>2 (value 3)</td><td>{1, 2, 3, 5}</td><td>all four: <b>4</b></td></tr>
  <tr><td>q3 = (0, 2, 4)</td><td>4</td><td>0 (value 4)</td><td>{0, 1, 2, 3, 5}</td><td>positions 0, 1, 2: <b>3</b></td></tr>
</table>
<p class="sub">
  The answers go back to their original slots by query number, so the output is
  <code>[2, 4, 1, 3]</code>. The cost is the two sorts, O(n log n + q log q),
  plus a Fenwick update per element and two prefix queries per query: O((n + q) log (n + q))
  in total.
</p>
<p>
  A second flavour of the same idea sorts the queries by their <b>right end</b>.
  The question is "how many distinct values are in <code>nums[l..r]</code>?".
  Sweep a right pointer across the array, and keep a 1 only at the <em>latest</em>
  occurrence so far of each value: when position p brings a value that was
  already seen, clear the old 1 and set a new one at p. At the moment the sweep
  has reached r, a value occurs in <code>[l, r]</code> exactly when its latest
  occurrence at or before r is at or after l, so the number of ones in
  <code>[l, r]</code> is the number of distinct values there.
</p>
<pre><code>function distinctInRanges(nums, queries) { <span class="c">// queries[q] = [l, r]</span>
  const n = nums.length;
  const byRight = queries.map((_, q) =&gt; q).sort((a, b) =&gt; queries[a][1] - queries[b][1]);
  const tree = new Array(n + 1).fill(0);
  const add = (i, delta) =&gt; {
    for (let k = i + 1; k &lt;= n; k += k &amp; -k) tree[k] += delta;
  };
  const before = (i) =&gt; {
    let sum = 0;
    for (let k = i; k &gt; 0; k -= k &amp; -k) sum += tree[k];
    return sum;
  };

  const lastSeen = new Map();
  const answer = new Array(queries.length);
  let next = 0;
  for (const q of byRight) {
    const [l, r] = queries[q];
    while (next &lt;= r) {
      const value = nums[next];
      if (lastSeen.has(value)) add(lastSeen.get(value), -1); <span class="c">// only the latest copy counts</span>
      add(next, 1);
      lastSeen.set(value, next);
      next++;
    }
    answer[q] = before(r + 1) - before(l);
  }
  return answer;
}</code></pre>
<pre><code>countAtMost([4, 1, 3, 1, 5, 2], [[1, 4, 2], [0, 5, 3], [2, 3, 1], [0, 2, 4]]); <span class="c">// [2, 4, 1, 3]</span>
distinctInRanges([3, 1, 3, 2, 1, 2, 3, 1], [[1, 4], [0, 2], [3, 5]]); <span class="c">// [3, 2, 2]</span></code></pre>
<h4>Dry run: nums = [3, 1, 3, 2, 1, 2, 3, 1], marked positions as the right end advances</h4>
<table>
  <tr><th>right end reached</th><th>new element</th><th>the previous copy is cleared</th><th>positions marked</th><th>queries answered here</th></tr>
  <tr><td>0</td><td>3</td><td>—</td><td>{0}</td><td></td></tr>
  <tr><td>1</td><td>1</td><td>—</td><td>{0, 1}</td><td></td></tr>
  <tr><td>2</td><td>3</td><td>position 0</td><td>{1, 2}</td><td>(0, 2): marks in 0..2 = <b>2</b></td></tr>
  <tr><td>3</td><td>2</td><td>—</td><td>{1, 2, 3}</td><td></td></tr>
  <tr><td>4</td><td>1</td><td>position 1</td><td>{2, 3, 4}</td><td>(1, 4): marks in 1..4 = <b>3</b></td></tr>
  <tr><td>5</td><td>2</td><td>position 3</td><td>{2, 4, 5}</td><td>(3, 5): marks in 3..5 = <b>2</b></td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Offline pitfalls</span>
  <b>Sorting the queries in place.</b> Then there is nothing to say which answer
  belongs to which input. Sort an array of query <em>numbers</em> and write
  <code>answer[q]</code>. <b>Sorting numbers without a comparator.</b>
  <code>[10, 9, 1].sort()</code> returns <code>[1, 10, 9]</code>, because the
  default order compares as strings; pass <code>(a, b) =&gt; a - b</code>.
  <b>Answering too early.</b> Every element with value at most x must be switched
  on <em>before</em> the query for x reads the tree, which is why the
  <code>while</code> loop runs first and uses <code>&lt;=</code>.
  <b>Queries that depend on earlier answers.</b> If the next query is computed
  from the previous result, the list is not known in advance and the offline
  trick is unavailable; an online structure (a persistent segment tree, or a
  merge sort tree) is the usual way out.
</div>

<h3>Mo's algorithm: sorting queries so a window barely moves</h3>
<p>
  This one is mention-level for interviews: it appears rarely, and you will
  seldom be asked to write it. It is worth knowing because it solves range
  queries that nothing else in this chapter can touch, and the idea is a small
  step from the offline section.
</p>
<p>
  Suppose you can maintain the answer for a <em>window</em>
  <code>nums[curL..curR]</code> as elements are added or removed at either end,
  each in O(1), as with a table of counts per value. Then moving the window from
  one query to the next costs <code>|curL − l| + |curR − r|</code> element
  moves. If the queries are answered in the order they were given, that can be
  O(n) per query. Mo's observation: the queries are offline, so reorder them to
  make the total movement small.
</p>
<p>
  Cut the array into blocks of size B = ⌊√n⌋. Sort the queries by the block that
  contains <code>l</code>, and inside one block by <code>r</code> ascending. Now
  count the movement. Inside a block, <code>l</code> stays within B positions of
  where it was, so the left pointer moves at most B per query, O(qB) in total.
  Inside a block the queries come in ascending order of <code>r</code>, so the
  right pointer sweeps rightward, at most n positions, before it moves back for
  the next block. There are n / B blocks, so it moves O(n · n / B) in total. With
  B = √n the two terms are O(q√n) and O(n√n): <b>O((n + q)√n)</b> moves.
</p>
<pre><code>function distinctWithMo(nums, queries) { <span class="c">// queries[q] = [l, r], inclusive</span>
  const block = Math.max(1, Math.floor(Math.sqrt(nums.length)));
  const order = queries.map((_, q) =&gt; q).sort((a, b) =&gt; {
    const blockA = Math.floor(queries[a][0] / block);
    const blockB = Math.floor(queries[b][0] / block);
    if (blockA !== blockB) return blockA - blockB;
    return blockA % 2 === 0 ? queries[a][1] - queries[b][1] : queries[b][1] - queries[a][1];
  });

  const count = new Map();
  let distinct = 0;
  const add = (i) =&gt; {
    const c = (count.get(nums[i]) ?? 0) + 1;
    count.set(nums[i], c);
    if (c === 1) distinct++;
  };
  const remove = (i) =&gt; {
    const c = count.get(nums[i]) - 1;
    count.set(nums[i], c);
    if (c === 0) distinct--;
  };

  let curL = 0;
  let curR = -1; <span class="c">// the window nums[curL..curR] starts empty</span>
  const answer = new Array(queries.length);
  for (const q of order) {
    const [l, r] = queries[q];
    while (curL &gt; l) add(--curL); <span class="c">// grow first ...</span>
    while (curR &lt; r) add(++curR);
    while (curL &lt; l) remove(curL++); <span class="c">// ... then shrink</span>
    while (curR &gt; r) remove(curR--);
    answer[q] = distinct;
  }
  return answer;
}</code></pre>
<pre><code>const nums = [3, 1, 3, 2, 1, 2, 3, 1];
distinctWithMo(nums, [[1, 4], [5, 7], [2, 6], [0, 2], [3, 5]]); <span class="c">// [3, 3, 3, 2, 2]</span></code></pre>
<p class="sub">
  The comparator reverses the direction of r in every odd block. That is a
  constant-factor trick: the right pointer then sweeps back instead of
  teleporting back to the left, and the bound is unchanged. Remove the
  <code>blockA % 2</code> test and the algorithm is still correct.
</p>
<h4>Dry run: nums = [3, 1, 3, 2, 1, 2, 3, 1], five queries, block size ⌊√8⌋ = 2</h4>
<p>
  The queries in the order they were given: q0 = (1, 4), q1 = (5, 7), q2 = (2, 6),
  q3 = (0, 2), q4 = (3, 5). Their blocks of <code>l</code> are 0, 2, 1, 0, 1, so the
  sorted order is block 0 by r ascending (q3, q0), block 1 by r descending
  (q2, q4) and block 2 (q1). The window starts empty, at
  <code>curL = 0, curR = −1</code>.
</p>
<table>
  <tr><th>query, in sorted order</th><th>moves (+ index added, − index removed)</th><th>count</th><th>window values</th><th>distinct values</th></tr>
  <tr><td>q3 = (0, 2)</td><td>+0 +1 +2</td><td>3</td><td>3, 1, 3</td><td><b>2</b></td></tr>
  <tr><td>q0 = (1, 4)</td><td>+3 +4 −0</td><td>3</td><td>1, 3, 2, 1</td><td><b>3</b></td></tr>
  <tr><td>q2 = (2, 6)</td><td>+5 +6 −1</td><td>3</td><td>3, 2, 1, 2, 3</td><td><b>3</b></td></tr>
  <tr><td>q4 = (3, 5)</td><td>−2 −6</td><td>2</td><td>2, 1, 2</td><td><b>2</b></td></tr>
  <tr><td>q1 = (5, 7)</td><td>+6 +7 −3 −4</td><td>4</td><td>2, 3, 1</td><td><b>3</b></td></tr>
</table>
<p>
  The total is 15 element moves. Taking the same five queries in the order given
  would cost 29, and the gap grows quickly with n. The answers, put back in the
  original order, are <code>[3, 3, 3, 2, 2]</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ Mo's pitfalls</span>
  <b>Shrinking before growing.</b> Run the four pointer loops in the order grow
  left, grow right, shrink left, shrink right. Done the other way around, the
  window can briefly have a negative length and <code>remove</code> is called on
  an element that was never added, driving a count below zero.
  <b>A move that is not O(1).</b> The bound needs add and remove in constant
  time; a quantity like the median needs an ordered structure, which multiplies
  the bound by a log. <b>Updates between queries.</b> Plain Mo's does not allow
  them. A variant with a time dimension exists, but it is far outside interview
  scope. <b>Reaching for it too early.</b> For distinct counts, the sorted-by-right
  Fenwick method above is O((n + q) log n), better than Mo's O((n + q)√n). Mo's
  is the fallback for when the window quantity can be maintained under add and
  remove but does not split by endpoint, like the sum of squared counts in
  <code>ex-mo-powerful-array</code>.
</div>

<h3>Choosing among prefix sums, sparse table, Fenwick, segment tree and blocks</h3>
<p>
  Two questions settle most of the choice. Does the array change? And what is the
  operation: can it be undone (sum, XOR), repeated (min, max, gcd), or neither
  of those but still associative (a pair of values, a matrix product)?
</p>
<table>
  <tr><th>Structure</th><th>Build</th><th>Range query</th><th>Update</th><th>Operation it needs</th><th>Memory</th></tr>
  <tr><td>Prefix sums</td><td>O(n)</td><td>O(1)</td><td>O(n) to rebuild</td><td>can be undone: sum, XOR, count</td><td>n + 1</td></tr>
  <tr><td>Sparse table</td><td>O(n log n)</td><td>O(1)</td><td>rebuild</td><td>can be repeated: min, max, gcd, AND, OR</td><td>about n log n</td></tr>
  <tr><td>Fenwick tree</td><td>O(n)</td><td>O(log n)</td><td>O(log n) point</td><td>can be undone</td><td>n + 1</td></tr>
  <tr><td>Segment tree</td><td>O(n)</td><td>O(log n)</td><td>O(log n) point; range with lazy</td><td>any associative operation</td><td>4n in the layout used earlier</td></tr>
  <tr><td>Sqrt blocks</td><td>O(n)</td><td>O(√n)</td><td>O(1) for a sum; O(√n) for a min</td><td>any summary you can keep per block</td><td>n + √n</td></tr>
</table>
<table>
  <tr><th>The problem says</th><th>Reach for</th><th>Why</th></tr>
  <tr><td>Fixed array, many range sums, XORs or counts</td><td>Prefix sums</td><td>one subtraction; nothing is cheaper</td></tr>
  <tr><td>Fixed array, many range min, max or gcd queries</td><td>Sparse table</td><td>O(1) per query after one build; the log factor never shows</td></tr>
  <tr><td>A window sliding in one direction, asking for min or max</td><td>Monotonic deque</td><td>O(n) overall and O(1) extra work per step</td></tr>
  <tr><td>Point updates with range sums</td><td>Fenwick tree</td><td>the smallest code that handles updates</td></tr>
  <tr><td>Point updates with range min, max or gcd</td><td>Segment tree</td><td>a prefix cannot be undone, and the table cannot be patched</td></tr>
  <tr><td>Range updates with range queries</td><td>Segment tree with lazy tags (or blocks with a tag per block)</td><td>whole nodes or blocks absorb the update</td></tr>
  <tr><td>A statistic no node can merge in O(1), with updates</td><td>Sqrt decomposition</td><td>a block can hold a sorted copy or a count table</td></tr>
  <tr><td>All queries given up front, and sorting them makes a sweep possible</td><td>Offline sort with a Fenwick tree</td><td>each element enters the structure once</td></tr>
  <tr><td>All queries given up front, a window quantity moves by one element</td><td>Mo's algorithm</td><td>O((n + q)√n) moves, no updates</td></tr>
  <tr><td>Jump k steps up a tree, or along next pointers, with large k</td><td>Binary lifting</td><td>one jump per set bit of k</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Let me settle two things first.
  Does the array change, and what is the query operation? It never changes and
  the query is a range gcd, which is idempotent, so I can build a sparse table in
  O(n log n) and answer every query in O(1) from two overlapping blocks. If it
  were a sum I would use prefix sums, and with updates I would switch to a
  Fenwick tree for sums or a segment tree for min and gcd. The cost I'd flag is
  memory: n log n entries."
</div>

<div class="sticky mint">
  <span class="ttl">One sentence to keep</span>
  A sparse table is what you get when you stop asking "which ranges might I be
  asked about" and precompute only the ones whose length is a power of two,
  because two of them, overlapping, always cover the rest, provided that seeing an
  element twice changes nothing.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The array is <b>never modified</b> and the questions are many ranges with the operation <b>min, max or gcd</b> (or AND, OR): sparse table. The word "static" or "immutable" in the statement is the cue.</li>
  <li>A range minimum or maximum appears <b>inside a loop</b> or a binary search (for each i, find the farthest j such that ...): an O(1) query keeps the whole solution at O(n log n) instead of O(n log² n).</li>
  <li>Updates arrive between queries: not a sparse table; a Fenwick tree for sums, a segment tree for min, max or gcd.</li>
  <li>"The k-th ancestor", "jump k steps", "after 10<sup>9</sup> moves, where are you?", with every node having one successor: binary lifting, one jump per bit of k.</li>
  <li>The aggregate is awkward to merge but easy to recompute for a small block (count of values at least x with updates, most frequent value): sqrt decomposition.</li>
  <li>You can read every query before answering any, and the question is a count over a position range and a value condition: sort the queries by that value (or by right endpoint) and sweep with a Fenwick tree.</li>
  <li>"Number of distinct values", "sum of squared counts", or another window statistic over many ranges, without updates: Mo's algorithm, once you have ruled out the offline sweep.</li>
  <li>Distinguish from a sliding window of fixed shape: if the window only slides forward, the monotonic deque is O(n) and needs no table.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Build a sparse table from memory: state what <code>table[j][i]</code> means, write the recurrence, and say why row j has <code>n − 2<sup>j</sup> + 1</code> entries.</li>
    <li>Write the O(1) query, compute k with <code>31 - Math.clz32(len)</code>, and show on a small example why the two blocks leave no gap.</li>
    <li>Explain why the overlap is harmless for min, max and gcd and wrong for sum and XOR, and name the property (<code>op(x, x) = x</code>).</li>
    <li>Give the build time and memory of a sparse table, and say what you would use instead when the array has updates.</li>
    <li>Write the binary lifting table <code>up[j][v] = up[j-1][up[j-1][v]]</code>, answer a k-th ancestor query bit by bit, and handle the root and k beyond the depth.</li>
    <li>Write sqrt decomposition for a range sum with point update, including the query whose two ends fall in the same block, and explain why the block size is near √n.</li>
    <li>Explain what makes a problem offline and how sorting the queries lets one sweep answer them, then sketch Mo's algorithm: sort by (block of l, r), and the order of the four pointer loops.</li>
    <li>Given a new range-query problem, pick between prefix sums, a sparse table, a Fenwick tree, a segment tree, blocks, an offline sweep and Mo's by the two questions: does it change, and which operation is it.</li>
  </ul>
</div>`,
};
