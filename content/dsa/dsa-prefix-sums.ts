import type { Chapter } from "../types";

export const dsaPrefixSums: Chapter = {
  id: "dsa-prefix-sums",
  num: "B4",
  title: "Prefix sums and difference arrays",
  short: "Prefix sums",
  levels: ["beginner"],
  prerequisites: ["dsa-arrays-strings"],
  practice: [
    "ex-batch-range-sums",
    "ex-range-sum-query-immutable",
    "ex-find-pivot-index",
    "ex-count-valid-splits",
    "ex-subarray-sum-equals-k",
    "ex-max-size-subarray-sum-equals-k",
    "ex-contiguous-array",
    "ex-continuous-subarray-sum",
    "ex-subarray-sums-divisible-by-k",
    "ex-count-nice-subarrays",
    "ex-longest-well-performing-interval",
    "ex-make-sum-divisible-by-p",
    "ex-xor-queries-of-a-subarray",
    "ex-count-triplets-equal-xor",
    "ex-subarrays-with-xor-k",
    "ex-product-of-array-except-self",
    "ex-apply-range-updates",
    "ex-car-pooling",
    "ex-region-sums-2d",
    "ex-matrix-block-sum",
    "ex-submatrices-sum-target",
  ],
  ready: true,
  subtitle: "Store the running total once, and a whole family of range questions becomes one subtraction.",
  body: `<h3>Where this chapter picks up</h3>
<p>
  If you met prefix sums in the arrays and strings chapter, you saw the idea
  once, in its smallest form: build a running total, answer a range sum with a
  subtraction. This chapter takes the idea over and follows it to the problems
  that do not look like range sums at all: counting subarrays that hit a
  target, the longest or shortest one, sums that divide evenly, XOR, products,
  range <em>updates</em>, and rectangles in a grid.
</p>
<p>
  One convention is fixed from the start. Some presentations store, at each
  index, the sum up to and including that index, which forces a special case
  for ranges that begin at index 0. Here the table is one slot longer and
  begins with an explicit zero. The special case disappears, and every
  hash-map trick later in the chapter needs that leading zero anyway.
</p>
<div class="sticky mint">
  <span class="ttl">The one idea underneath everything</span>
  A question about a contiguous range of an array is a question about
  <b>two prefixes</b>. Decide which function of the two prefixes the question
  needs (their difference, their XOR, whether they are equal, whether they
  leave the same remainder) and the problem is usually one loop with an array
  or a <code>Map</code>.
</div>

<h3>The idea: a range is the difference of two prefixes</h3>
<p>
  Suppose you are given an array and then asked, many times, for the sum of
  <code>nums[left..right]</code>. The direct way adds the elements up for each
  query. A query can cover the whole array, so each one costs O(n), and
  <code>q</code> queries cost O(n·q). With 100,000 elements and 100,000
  queries that is on the order of ten billion additions.
</p>
<p>
  The waste is obvious once you notice that different queries add up the same
  elements again and again. So pay for the shared work once. Let
  <code>P[i]</code> be the sum of the <b>first i elements</b>, with
  <code>P[0] = 0</code> for the empty prefix. Then
  <code>P[right + 1]</code> is everything from index 0 through
  <code>right</code>, and <code>P[left]</code> is everything from index 0
  through <code>left - 1</code>. Subtract: the elements before
  <code>left</code> appear in both and cancel, and what remains is exactly
  <code>nums[left..right]</code>.
</p>
<figure>
  <svg viewBox="0 0 640 245" class="dg" role="img" aria-label="An array of five numbers above its prefix sum table of six entries, with the range from index one to three highlighted and its sum found as prefix four minus prefix one">
    <g class="rough">
      <rect class="box" x="90" y="30" width="70" height="40" />
      <rect class="boxg" x="160" y="30" width="70" height="40" />
      <rect class="boxg" x="230" y="30" width="70" height="40" />
      <rect class="boxg" x="300" y="30" width="70" height="40" />
      <rect class="box" x="370" y="30" width="70" height="40" />
    </g>
    <text class="sm" x="125" y="55" text-anchor="middle">2</text>
    <text class="sm" x="195" y="55" text-anchor="middle">-1</text>
    <text class="sm" x="265" y="55" text-anchor="middle">3</text>
    <text class="sm" x="335" y="55" text-anchor="middle">4</text>
    <text class="sm" x="405" y="55" text-anchor="middle">-2</text>
    <text class="sm" x="125" y="22" text-anchor="middle">a[0]</text>
    <text class="sm" x="195" y="22" text-anchor="middle">a[1]</text>
    <text class="sm" x="265" y="22" text-anchor="middle">a[2]</text>
    <text class="sm" x="335" y="22" text-anchor="middle">a[3]</text>
    <text class="sm" x="405" y="22" text-anchor="middle">a[4]</text>
    <g class="rough">
      <path class="ln dash" d="M160,70 L160,120" />
      <path class="ln dash" d="M370,70 L370,120" />
    </g>
    <g class="rough">
      <rect class="box" x="55" y="120" width="70" height="40" />
      <rect class="boxr" x="125" y="120" width="70" height="40" />
      <rect class="box" x="195" y="120" width="70" height="40" />
      <rect class="box" x="265" y="120" width="70" height="40" />
      <rect class="boxg" x="335" y="120" width="70" height="40" />
      <rect class="box" x="405" y="120" width="70" height="40" />
    </g>
    <text class="sm" x="90" y="145" text-anchor="middle">0</text>
    <text class="sm rd" x="160" y="145" text-anchor="middle">2</text>
    <text class="sm" x="230" y="145" text-anchor="middle">1</text>
    <text class="sm" x="300" y="145" text-anchor="middle">4</text>
    <text class="sm gr" x="370" y="145" text-anchor="middle">8</text>
    <text class="sm" x="440" y="145" text-anchor="middle">6</text>
    <text class="sm" x="90" y="178" text-anchor="middle">P[0]</text>
    <text class="sm" x="160" y="178" text-anchor="middle">P[1]</text>
    <text class="sm" x="230" y="178" text-anchor="middle">P[2]</text>
    <text class="sm" x="300" y="178" text-anchor="middle">P[3]</text>
    <text class="sm" x="370" y="178" text-anchor="middle">P[4]</text>
    <text class="sm" x="440" y="178" text-anchor="middle">P[5]</text>
    <text class="lbl gr" x="20" y="208" style="font-size:14px">sum of a[1..3] = P[4] − P[1] = 8 − 2 = 6</text>
    <text class="sm" x="20" y="230">P[i] sits on the boundary left of a[i] and holds the sum of everything to its left</text>
  </svg>
  <figcaption>The prefix table has one more entry than the array. Each range sum is the green entry minus the red entry.</figcaption>
</figure>
<pre><code><span class="c">// P[i] = sum of the first i elements; P[0] = 0 is the empty prefix. O(n) time, O(n) space.</span>
function buildPrefix(nums) {
  const prefix = new Array(nums.length + 1).fill(0);
  for (let i = 0; i &lt; nums.length; i++) {
    prefix[i + 1] = prefix[i] + nums[i];
  }
  return prefix;
}

<span class="c">// sum of nums[left..right], both inclusive. O(1).</span>
function rangeSum(prefix, left, right) {
  return prefix[right + 1] - prefix[left];
}

const prefix = buildPrefix([2, -1, 3, 4, -2]); <span class="c">// [0, 2, 1, 4, 8, 6]</span>
rangeSum(prefix, 1, 3); <span class="c">// 6</span></code></pre>
<p>
  In an interview you will often be asked for this as a class, because the
  array is fixed and the queries arrive one at a time. The constructor does the
  O(n) work and each method call is a subtraction:
</p>
<pre><code>class NumArray {
  constructor(nums) {
    this.prefix = new Array(nums.length + 1).fill(0);
    for (let i = 0; i &lt; nums.length; i++) {
      this.prefix[i + 1] = this.prefix[i] + nums[i];
    }
  }

  sumRange(left, right) {
    return this.prefix[right + 1] - this.prefix[left];
  }
}</code></pre>
<h4>Dry run: the table for [2, -1, 3, 4, -2]</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>prefix[i]</th><th>prefix[i + 1] = prefix[i] + nums[i]</th></tr>
  <tr><td>0</td><td>2</td><td>0</td><td>2</td></tr>
  <tr><td>1</td><td>-1</td><td>2</td><td>1</td></tr>
  <tr><td>2</td><td>3</td><td>1</td><td>4</td></tr>
  <tr><td>3</td><td>4</td><td>4</td><td>8</td></tr>
  <tr><td>4</td><td>-2</td><td>8</td><td>6</td></tr>
</table>
<p class="sub">
  Now <code>rangeSum(prefix, 1, 3)</code> reads <code>prefix[4] - prefix[1]</code>,
  which is 8 − 2 = 6, and by hand <code>-1 + 3 + 4</code> is also 6. A range
  that starts at index 0, such as <code>rangeSum(prefix, 0, 4)</code>, needs no
  special case: it is <code>prefix[5] - prefix[0]</code> = 6 − 0.
</p>
<p>
  <b>Cost.</b> Building is one pass: O(n) time and O(n) extra space. Each query
  is one subtraction: O(1). Together, n elements and q queries cost O(n + q),
  against O(n·q) for rescanning. The price is the extra array, and the
  assumption that the array does not change: the table describes the numbers as
  they were when you built it.
</p>
<p>
  A cousin worth knowing is the <b>pivot index</b> problem: find the first
  index where the sum to its left equals the sum to its right. Here the
  prefix is never stored. The right side is <code>total - left - nums[i]</code>,
  so a running <code>left</code> total and one initial pass for
  <code>total</code> are enough. The prefix <em>idea</em> does not always need
  the prefix <em>array</em>.
</p>
<pre><code>function pivotIndex(nums) {
  const total = nums.reduce((a, b) =&gt; a + b, 0);
  let left = 0; <span class="c">// sum of nums[0..i-1]</span>
  for (let i = 0; i &lt; nums.length; i++) {
    const right = total - left - nums[i]; <span class="c">// sum of nums[i+1..]</span>
    if (left === right) return i;
    left += nums[i];
  }
  return -1;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Four ways a plain prefix table goes wrong</span>
  <b>(1) Mixing conventions.</b> Decide once that <code>P[i]</code> is the sum
  of the first <code>i</code> elements, so a range is
  <code>P[right + 1] - P[left]</code>. Mixing it with "sum up to and including
  i" gives answers that are off by exactly one element.
  <b>(2) Reading before the start.</b> Writing <code>prefix[left - 1]</code>
  with <code>left = 0</code> reads index −1, which is <code>undefined</code> in
  JavaScript, and the subtraction becomes <code>NaN</code> without any error.
  <b>(3) A stale table.</b> If an element changes after the build, every
  prefix from that index onward is wrong. Rebuilding costs O(n) per update; if
  updates and queries are mixed, you want a Fenwick tree or a segment tree
  (see <a href="/dsa/dsa-segment-fenwick-trees">that chapter</a>).
  <b>(4) Very large totals.</b> JavaScript numbers are exact for integers up
  to <code>Number.MAX_SAFE_INTEGER</code> (2<sup>53</sup> − 1, about 9 × 10<sup>15</sup>).
  100,000 values of size 10<sup>9</sup> sum to 10<sup>14</sup>, which is safe;
  totals beyond the limit need <code>BigInt</code>.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "The queries repeat the same
  additions, so I'll pay for them once. I store <code>P[i]</code>, the sum of
  the first i elements, with <code>P[0] = 0</code>. Then the sum of
  <code>left..right</code> is <code>P[right + 1] − P[left]</code>: the
  elements before <code>left</code> are in both prefixes and cancel. That is
  O(n) to build and O(1) per query, instead of O(n) per query."
</div>

<h3>Counting subarrays that hit a target: prefix sums plus a hash map</h3>
<p>
  Now a different question. Given an array, <b>how many contiguous subarrays
  sum to exactly k</b>? The array may contain negative numbers.
</p>
<p>
  The honest baseline checks every pair of endpoints: n(n + 1)/2 subarrays,
  so O(n²) even with a prefix table that makes each sum O(1). It is worth being
  able to write, because it is also your oracle for testing the fast version:
</p>
<pre><code><span class="c">// O(n²) time, O(1) space. The baseline to state, and a checker for the fast version.</span>
function subarraySumBrute(nums, k) {
  let count = 0;
  for (let start = 0; start &lt; nums.length; start++) {
    let sum = 0;
    for (let end = start; end &lt; nums.length; end++) {
      sum += nums[end];
      if (sum === k) count++;
    }
  }
  return count;
}</code></pre>
<p>
  If every number were non-negative you could use a sliding window: grow the
  right edge, and shrink the left edge while the sum is too big, because adding
  elements can only raise the sum. Negative numbers break that argument. A
  window that shrinks whenever its sum exceeds k, and counts a hit when its sum
  equals k, reports 3 on <code>[1, -1, 1, 1]</code> with <code>k = 1</code>,
  but the true answer is 5. Several different starts can work for the same end:
  for the end at index 2, both <code>[1, -1, 1]</code> and the single element
  <code>[1]</code> sum to 1, and the window holds only one start. And once
  negatives are allowed, "too big" no longer tells you which edge to move,
  because adding an element can lower the sum and removing one can raise it.
</p>
<p>
  Go back to the two-prefix idea instead. A subarray that ends at index
  <code>r</code> and starts at index <code>l</code> has sum
  <code>P[r + 1] − P[l]</code>. It hits the target when
</p>
<pre><code>P[r + 1] − P[l] = k   ⇔   P[l] = P[r + 1] − k</code></pre>
<p>
  So for each end <code>r</code> you do not need to try every start. You need
  to know <b>how many earlier prefixes equal <code>P[r + 1] − k</code></b>. Keep
  a <code>Map</code> from each prefix value to how many times it has occurred,
  and look the answer up in O(1). Every earlier prefix that matches is one
  distinct start index, and so one distinct subarray.
</p>
<pre><code><span class="c">// O(n) time (hash operations O(1) on average), O(n) space</span>
function subarraySum(nums, k) {
  const seen = new Map([[0, 1]]); <span class="c">// the empty prefix P[0] = 0 has occurred once</span>
  let prefix = 0;
  let count = 0;

  for (const x of nums) {
    prefix += x;
    count += seen.get(prefix - k) ?? 0;          <span class="c">// look up BEFORE recording this prefix</span>
    seen.set(prefix, (seen.get(prefix) ?? 0) + 1); <span class="c">// now it is available to later ends</span>
  }
  return count;
}

subarraySum([1, 1, 1], 2); <span class="c">// 2</span></code></pre>
<h4>Dry run: subarraySum([3, 4, -7, 1, 3, 3, 1, -4], 7)</h4>
<table>
  <tr><th>i</th><th>x</th><th>prefix</th><th>prefix − k</th><th>seen.get(prefix − k)</th><th>count</th></tr>
  <tr><td>0</td><td>3</td><td>3</td><td>-4</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>4</td><td>7</td><td>0</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>-7</td><td>0</td><td>-7</td><td>0</td><td>1</td></tr>
  <tr><td>3</td><td>1</td><td>1</td><td>-6</td><td>0</td><td>1</td></tr>
  <tr><td>4</td><td>3</td><td>4</td><td>-3</td><td>0</td><td>1</td></tr>
  <tr><td>5</td><td>3</td><td>7</td><td>0</td><td><b>2</b></td><td>3</td></tr>
  <tr><td>6</td><td>1</td><td>8</td><td>1</td><td>1</td><td>4</td></tr>
  <tr><td>7</td><td>-4</td><td>4</td><td>-3</td><td>0</td><td>4</td></tr>
</table>
<p class="sub">
  Row 5 is the one to study. The prefix is 7 and we need earlier prefixes equal
  to 0. The prefix value 0 has occurred twice: as the empty prefix before index
  0, and again after index 2 (because <code>3 + 4 − 7 = 0</code>). Those are two
  different start positions, so two subarrays end here:
  <code>[3, 4, −7, 1, 3, 3]</code> and <code>[1, 3, 3]</code>. The four
  subarrays found overall are <code>[3, 4]</code>,
  <code>[3, 4, −7, 1, 3, 3]</code>, <code>[1, 3, 3]</code> and
  <code>[3, 3, 1]</code>. That is why the map stores counts, not just
  "seen or not".
</p>
<p>
  <b>Cost.</b> One pass, one map lookup and one map write per element: O(n)
  time, assuming hash operations are O(1) on average, and O(n) space for the
  map. The answer itself is at most n(n + 1)/2, which is far inside the safe
  integer range for any array you can hold in memory.
</p>
<div class="warn">
  <span class="ttl">⚠ The two lines that are easy to get wrong</span>
  <b>The seed.</b> Without <code>[0, 1]</code>, a subarray that starts at index
  0 is missed, because its start prefix is the empty prefix, which was never
  recorded. <code>subarraySum([7], 7)</code> would return 0 instead of 1.
  <b>The order.</b> Look up first, record afterwards. If you record the current
  prefix first, then with <code>k = 0</code> every prefix finds itself and
  counts an empty subarray: <code>[1, 2, 3]</code> with <code>k = 0</code>
  would return 3 instead of 0. For <code>k ≠ 0</code> the wrong order happens
  to give the right answer, so a test with only non-zero targets will not catch
  it. Test <code>k = 0</code> on purpose.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "A window doesn't work because
  there are negatives, so I switch to prefix sums. A subarray ending here sums
  to k exactly when an earlier prefix equals <code>current − k</code>. I keep a
  map of prefix value to how many times it has occurred, seeded with zero seen
  once for the empty prefix, so each element is one lookup. That's O(n) time
  and O(n) space instead of O(n²)."
</div>

<h3>Longest and shortest: which index you keep decides the answer</h3>
<p>
  The same equation, <code>P[l] = P[r + 1] − k</code>, answers other questions
  once you choose what to store per prefix value. The lookup is identical; only
  the value kept in the map changes.
</p>
<table>
  <tr><th>Question</th><th>Store per prefix value</th><th>Why</th></tr>
  <tr><td>Does one exist?</td><td>nothing (a <code>Set</code>)</td><td>presence is the whole answer</td></tr>
  <tr><td>How many?</td><td>a count</td><td>each equal earlier prefix is a different start</td></tr>
  <tr><td>Longest?</td><td>the <b>first</b> index it occurred at</td><td>the earliest start gives the longest subarray, so never overwrite</td></tr>
  <tr><td>Shortest?</td><td>the <b>last</b> index it occurred at</td><td>the latest start gives the shortest subarray, so always overwrite</td></tr>
</table>
<pre><code><span class="c">// longest subarray with sum k; 0 if none. O(n) time, O(n) space</span>
function longestSubarraySum(nums, k) {
  const first = new Map([[0, -1]]); <span class="c">// the empty prefix ends before index 0, "at index -1"</span>
  let prefix = 0;
  let best = 0;

  for (let i = 0; i &lt; nums.length; i++) {
    prefix += nums[i];
    if (first.has(prefix - k)) best = Math.max(best, i - first.get(prefix - k));
    if (!first.has(prefix)) first.set(prefix, i); <span class="c">// keep the EARLIEST index only</span>
  }
  return best;
}

<span class="c">// shortest subarray with sum k; 0 if none. Same loop, other overwrite rule.</span>
function shortestSubarraySum(nums, k) {
  const last = new Map([[0, -1]]);
  let prefix = 0;
  let best = Infinity;

  for (let i = 0; i &lt; nums.length; i++) {
    prefix += nums[i];
    if (last.has(prefix - k)) best = Math.min(best, i - last.get(prefix - k));
    last.set(prefix, i); <span class="c">// the LATEST index wins</span>
  }
  return best === Infinity ? 0 : best;
}

longestSubarraySum([1, -1, 5, -2, 3], 3);  <span class="c">// 4</span>
shortestSubarraySum([1, -1, 5, -2, 3], 3); <span class="c">// 1</span></code></pre>
<p>
  The length of a subarray from start prefix <code>l</code> to end index
  <code>i</code> is <code>i − (index of the start prefix)</code>. With the
  empty prefix stored at index −1, a subarray that begins at index 0 has length
  <code>i − (−1) = i + 1</code>, which is correct.
</p>
<h4>Dry run: longestSubarraySum([1, -1, 5, -2, 3], 3)</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>prefix</th><th>prefix − k</th><th>first.get(prefix − k)</th><th>length</th><th>best</th></tr>
  <tr><td>0</td><td>1</td><td>1</td><td>-2</td><td>none</td><td>-</td><td>0</td></tr>
  <tr><td>1</td><td>-1</td><td>0</td><td>-3</td><td>none</td><td>-</td><td>0</td></tr>
  <tr><td>2</td><td>5</td><td>5</td><td>2</td><td>none</td><td>-</td><td>0</td></tr>
  <tr><td>3</td><td>-2</td><td>3</td><td>0</td><td>-1</td><td>3 − (−1) = <b>4</b></td><td>4</td></tr>
  <tr><td>4</td><td>3</td><td>6</td><td>3</td><td>3</td><td>4 − 3 = 1</td><td>4</td></tr>
</table>
<p class="sub">
  Look at row 1. The prefix 0 occurs again at index 1, but <code>first</code>
  already holds it, at index −1, from the empty prefix, so it is not
  overwritten. That is what lets row 3 find the start at −1 and report the
  length 4 (the subarray <code>[1, −1, 5, −2]</code>). If the line overwrote
  instead, row 3 would find the start at index 1 and report 2.
</p>
<div class="warn">
  <span class="ttl">⚠ One rule per question, and it must not be mixed up</span>
  For <b>longest</b>, a duplicate prefix must <em>not</em> replace the stored
  index. For <b>shortest</b>, it <em>must</em>. Writing
  <code>first.set(prefix, i)</code> unconditionally in the longest version
  returns 2 on the example above instead of 4, and nothing crashes, so it can
  pass small tests. Say which one you want out loud before you write the
  <code>set</code> line.
</div>

<h3>Remainders: sums that divide evenly</h3>
<p>
  Now the target is not a number but a property: <b>count the subarrays whose
  sum is divisible by k</b>. A sum <code>P[r + 1] − P[l]</code> is divisible
  by k exactly when <code>P[r + 1]</code> and <code>P[l]</code> leave the same
  remainder when divided by k. Two numbers with equal remainders differ by a
  multiple of k, and two numbers that differ by a multiple of k have equal
  remainders. So the equality test is on remainders, and only k different
  remainders exist. A plain array of size k replaces the map:
</p>
<pre><code><span class="c">// O(n) time, O(k) space. k is a positive integer.</span>
function subarraysDivByK(nums, k) {
  const seen = new Array(k).fill(0); <span class="c">// seen[r] = earlier prefixes with remainder r</span>
  seen[0] = 1;                        <span class="c">// the empty prefix has remainder 0</span>
  let remainder = 0;
  let count = 0;

  for (const x of nums) {
    remainder = (((remainder + x) % k) + k) % k; <span class="c">// lands in 0..k-1, even for negative sums</span>
    count += seen[remainder];
    seen[remainder]++;
  }
  return count;
}

subarraysDivByK([4, 5, 0, -2, -3, 1], 5); <span class="c">// 7</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ JavaScript's % keeps the sign of the left side</span>
  <code>-7 % 5</code> is <code>-2</code>, not <code>3</code>. Mathematically −2
  and 3 are the same remainder class modulo 5, but the array index
  <code>seen[-2]</code> is a different (and nonexistent) slot. Adding
  <code>k</code> and taking <code>% k</code> again, as above, folds every
  result into <code>0..k − 1</code>. A related quirk: <code>-5 % 5</code> is
  <code>-0</code>, which <code>===</code> treats as equal to 0, so it is
  harmless in the array here. And <code>x % 0</code> is <code>NaN</code>, so if
  k can be 0 you must handle it as a separate case.
</div>
<h4>Dry run: subarraysDivByK([4, 5, 0, -2, -3, 1], 5)</h4>
<table>
  <tr><th>i</th><th>x</th><th>prefix</th><th>remainder</th><th>seen[remainder] before</th><th>count</th></tr>
  <tr><td>0</td><td>4</td><td>4</td><td>4</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>5</td><td>9</td><td>4</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>0</td><td>9</td><td>4</td><td>2</td><td>3</td></tr>
  <tr><td>3</td><td>-2</td><td>7</td><td>2</td><td>0</td><td>3</td></tr>
  <tr><td>4</td><td>-3</td><td>4</td><td>4</td><td>3</td><td>6</td></tr>
  <tr><td>5</td><td>1</td><td>5</td><td>0</td><td>1</td><td><b>7</b></td></tr>
</table>
<p class="sub">
  The last row finds the seed: the prefix 5 has remainder 0, matching the empty
  prefix, so the whole array (sum 5) is one of the seven. Without
  <code>seen[0] = 1</code> the answer would be 6.
</p>
<p>
  <b>Continuous Subarray Sum</b> asks for a variation: does a subarray of
  <b>length at least 2</b> exist whose sum is a multiple of k? Existence only,
  so no counts, but the length requirement means indices matter. Store the
  <em>first</em> index of each remainder, and accept an equal remainder only if
  the two prefixes are at least two elements apart.
</p>
<pre><code><span class="c">// true if some subarray of length >= 2 has a sum that is a multiple of k (k >= 1). O(n) time, O(k) space.</span>
function checkSubarraySum(nums, k) {
  const first = new Map([[0, -1]]); <span class="c">// remainder 0 "at index -1": the empty prefix</span>
  let remainder = 0;

  for (let i = 0; i &lt; nums.length; i++) {
    remainder = (((remainder + nums[i]) % k) + k) % k;
    if (!first.has(remainder)) first.set(remainder, i);
    else if (i - first.get(remainder) >= 2) return true; <span class="c">// at least two elements between the prefixes</span>
  }
  return false;
}

checkSubarraySum([23, 2, 4, 6, 7], 6); <span class="c">// true: [2, 4] sums to 6</span>
checkSubarraySum([1, 0], 2);            <span class="c">// false: the only multiple of 2 is the single element 0</span></code></pre>
<h4>Dry run: checkSubarraySum([23, 2, 4, 6, 7], 6)</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>remainder</th><th>first.get(remainder)</th><th>decision</th></tr>
  <tr><td>0</td><td>23</td><td>5</td><td>none</td><td>store 5 → 0</td></tr>
  <tr><td>1</td><td>2</td><td>1</td><td>none</td><td>store 1 → 1</td></tr>
  <tr><td>2</td><td>4</td><td>5</td><td>0</td><td>2 − 0 = 2 ≥ 2, return <b>true</b></td></tr>
</table>
<p class="sub">
  The two prefixes with remainder 5 are the one after index 0 and the one after
  index 2. Everything between them, <code>nums[1..2] = [2, 4]</code>, sums to
  6. Keeping the <em>first</em> index matters: if a later occurrence
  overwrote it, a valid pair that is far apart could shrink to a length-1 pair
  and be rejected.
</p>

<h3>Turn the condition into a sum: the plus-one, minus-one trick</h3>
<p>
  Many subarray conditions are not about sums at all, but become sums after a
  change of variables. The classic case is <b>Contiguous Array</b>: given a
  0/1 array, find the longest subarray with equally many 0s and 1s. Counting
  both symbols is awkward. But replace every 0 with −1, and "equally many" is
  exactly "the sum is 0". Now you want the longest subarray with sum 0, which
  is the longest-subarray template with <code>k = 0</code>.
</p>
<pre><code><span class="c">// longest subarray with equal numbers of 0s and 1s. O(n) time, O(n) space</span>
function findMaxLength(nums) {
  const first = new Map([[0, -1]]);
  let balance = 0; <span class="c">// (#ones so far) - (#zeros so far)</span>
  let best = 0;

  for (let i = 0; i &lt; nums.length; i++) {
    balance += nums[i] === 1 ? 1 : -1;
    if (first.has(balance)) best = Math.max(best, i - first.get(balance));
    else first.set(balance, i);
  }
  return best;
}

findMaxLength([0, 1, 0, 0, 1, 1, 0]); <span class="c">// 6</span></code></pre>
<p>
  With <code>k = 0</code> the lookup key <code>prefix − k</code> is the
  prefix itself, so one map lookup replaces two, and the code above merges the
  "look up" and "record" steps into one if/else.
</p>
<h4>Dry run: findMaxLength([0, 1, 0, 0, 1, 1, 0])</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>balance</th><th>first.get(balance)</th><th>best</th></tr>
  <tr><td>0</td><td>0</td><td>-1</td><td>none, store −1 → 0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>0</td><td>−1</td><td>1 − (−1) = 2</td></tr>
  <tr><td>2</td><td>0</td><td>-1</td><td>0</td><td>2 − 0 = 2</td></tr>
  <tr><td>3</td><td>0</td><td>-2</td><td>none, store −2 → 3</td><td>2</td></tr>
  <tr><td>4</td><td>1</td><td>-1</td><td>0</td><td>4 − 0 = 4</td></tr>
  <tr><td>5</td><td>1</td><td>0</td><td>−1</td><td>5 − (−1) = <b>6</b></td></tr>
  <tr><td>6</td><td>0</td><td>-1</td><td>0</td><td>6 − 0 = 6</td></tr>
</table>
<p class="sub">
  At i = 5 the balance is back to 0, the value it had before any element. The
  subarray from index 0 to 5, <code>[0, 1, 0, 0, 1, 1]</code>, has three 0s
  and three 1s. The answer is even, because equal counts of two kinds make
  the length twice the count.
</p>
<p>
  The general move is to define a number per element that carries what you
  care about, then reuse a sum template. Counting subarrays with <b>exactly k
  odd numbers</b>: map each element to 1 if it is odd and 0 if even, and then
  you are counting subarrays that sum to k, which is
  <code>subarraySum</code> from earlier with a different running total:
</p>
<pre><code>function numberOfSubarrays(nums, k) {
  const seen = new Map([[0, 1]]);
  let odds = 0; <span class="c">// the running sum of the 0/1 version</span>
  let count = 0;

  for (const x of nums) {
    if (x % 2 !== 0) odds++; <span class="c">// "!== 0", not "=== 1": -3 % 2 is -1 in JavaScript</span>
    count += seen.get(odds - k) ?? 0;
    seen.set(odds, (seen.get(odds) ?? 0) + 1);
  }
  return count;
}

numberOfSubarrays([1, 1, 2, 1, 1], 3); <span class="c">// 2</span></code></pre>
<p>
  Two relatives follow the same logic, and are in the practice list. In
  <b>Longest Well-Performing Interval</b> the condition is "strictly more
  tiring days than non-tiring days": score a tiring day +1 and any other day
  −1, and you want the longest subarray whose sum is <em>positive</em>, not
  equal to a number. When the current score <code>s</code> is positive, the whole prefix
  qualifies, because the empty prefix has score 0, which is lower. Otherwise
  the score started at 0 and moves by exactly 1 per day, so it must pass
  through <code>s − 1</code> before it can reach anything lower. The earliest
  prefix below <code>s</code> is therefore the first occurrence of exactly
  <code>s − 1</code>, and a map of first indices still works. With larger steps
  the earliest lower prefix could be a value that you never stored a key for,
  so this shortcut is specific to ±1 scores.
</p>

<h3>Prefix XOR: when the operation undoes itself</h3>
<p>
  Prefix sums work because addition has an <b>inverse</b>: subtracting a
  prefix removes exactly what it added. Bitwise XOR has an even nicer one: each
  value is its own inverse, since <code>x ^ x = 0</code> and
  <code>x ^ 0 = x</code>. With <code>P[i] = a[0] ^ a[1] ^ ... ^ a[i − 1]</code>,
  the XOR of <code>a[l..r]</code> is <code>P[r + 1] ^ P[l]</code>: the shared
  prefix appears twice and cancels itself.
</p>
<pre><code><span class="c">// XOR of arr[left..right] for each query. O(n + q) time, O(n) space</span>
function xorQueries(arr, queries) {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 0; i &lt; arr.length; i++) prefix[i + 1] = prefix[i] ^ arr[i];
  return queries.map(([left, right]) =&gt; prefix[right + 1] ^ prefix[left]);
}

xorQueries([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]); <span class="c">// [2, 7, 14, 8]</span></code></pre>
<p>
  Everything from the sum sections carries over by replacing "minus" with
  "XOR". The number of subarrays whose XOR equals k: a subarray ends at
  <code>r</code> with start prefix <code>P[l]</code> when
  <code>P[r + 1] ^ P[l] = k</code>, that is, when
  <code>P[l] = P[r + 1] ^ k</code>. The loop is
  <code>subarraySum</code> with <code>^</code> in place of
  <code>+</code> and <code>prefix ^ k</code> in place of
  <code>prefix − k</code> (the practice list has it).
</p>
<p>
  The harder application is <b>Count Triplets That Can Form Two Arrays of Equal
  XOR</b>. You want triples <code>i &lt; j ≤ k</code> with
  <code>XOR(arr[i..j−1]) = XOR(arr[j..k])</code>. Two values are equal exactly
  when their XOR is 0, and the XOR of the two halves together is
  <code>XOR(arr[i..k])</code>. So the condition is
  <code>XOR(arr[i..k]) = 0</code>, that is, <code>P[i] = P[k + 1]</code>.
  And <code>j</code> has vanished from the condition: any of the
  <code>j</code> values in <code>i + 1..k</code> works, which is
  <code>k − i</code> of them.
</p>
<pre><code><span class="c">// O(n²) time, O(n) space: for every pair of equal prefixes, add the number of valid j</span>
function countTriplets(arr) {
  const prefix = new Array(arr.length + 1).fill(0);
  for (let i = 0; i &lt; arr.length; i++) prefix[i + 1] = prefix[i] ^ arr[i];

  let count = 0;
  for (let i = 0; i &lt; arr.length; i++) {
    for (let k = i + 1; k &lt; arr.length; k++) {
      if (prefix[i] === prefix[k + 1]) count += k - i; <span class="c">// j can be i+1, ..., k</span>
    }
  }
  return count;
}

countTriplets([2, 3, 1, 6, 7]); <span class="c">// 4</span></code></pre>
<p>
  The pair loop can be replaced by a map. For each prefix value, keep how many
  earlier prefix positions had it and the sum of their positions. A new prefix
  at position <code>b</code> adds, for each earlier equal position
  <code>a</code>, the amount <code>b − a − 1</code> (the same
  <code>k − i</code>, since <code>k = b − 1</code> and <code>i = a</code>), and
  that total is <code>howMany · (b − 1) − indexSum</code>:
</p>
<pre><code><span class="c">// O(n) time, O(n) space</span>
function countTripletsFast(arr) {
  const seen = new Map(); <span class="c">// prefix value -> { howMany, indexSum } over earlier prefix positions</span>
  let prefix = 0;
  let count = 0;

  const visit = (position) =&gt; {
    const entry = seen.get(prefix) ?? { howMany: 0, indexSum: 0 };
    count += entry.howMany * (position - 1) - entry.indexSum;
    entry.howMany++;
    entry.indexSum += position;
    seen.set(prefix, entry);
  };

  visit(0); <span class="c">// the empty prefix sits at position 0</span>
  for (let i = 0; i &lt; arr.length; i++) {
    prefix ^= arr[i];
    visit(i + 1);
  }
  return count;
}</code></pre>
<h4>Dry run: countTriplets([2, 3, 1, 6, 7])</h4>
<table>
  <tr><th>position</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
  <tr><td>P</td><td>0</td><td>2</td><td>1</td><td>0</td><td>6</td><td>1</td></tr>
</table>
<table>
  <tr><th>equal pair (a, b)</th><th>meaning: arr[a..b−1] XORs to 0</th><th>valid j (count = b − a − 1)</th></tr>
  <tr><td>(0, 3)</td><td>[2, 3, 1]: 2 ^ 3 ^ 1 = 0</td><td>2</td></tr>
  <tr><td>(2, 5)</td><td>[1, 6, 7]: 1 ^ 6 ^ 7 = 0</td><td>2</td></tr>
</table>
<p class="sub">
  Total: 2 + 2 = 4. For the first pair, <code>j = 1</code> splits into
  <code>[2]</code> and <code>[3, 1]</code> (2 and 3 ^ 1 = 2), and
  <code>j = 2</code> splits into <code>[2, 3]</code> and <code>[1]</code>
  (1 and 1). The brute-force triple loop gives the same 4.
</p>
<div class="warn">
  <span class="ttl">⚠ JavaScript's bitwise operators work on 32-bit signed integers</span>
  <code>2 ** 31 ^ 0</code> is <code>-2147483648</code>, and
  <code>5000000000 ^ 1</code> silently becomes <code>705032705</code>, because
  the operands are truncated to 32 bits first. If the values fit in 31 bits
  (below 2<sup>31</sup>), everything above is exact. Beyond that, use
  <code>BigInt</code> (which has its own <code>^</code>). Also note the
  prefix-equals-prefix test needs <code>===</code> on the XOR results, and they
  can be negative when bit 31 is set.
</div>

<h3>Prefix products: when the operation has no safe inverse</h3>
<p>
  A natural next try: <code>P[i]</code> is the product of the first i elements,
  and the product of <code>a[l..r]</code> is <code>P[r + 1] / P[l]</code>.
  Division is the inverse of multiplication, so the algebra works. The
  <em>implementation</em> has two problems. First, a single zero makes every
  later prefix 0, and you cannot divide by 0 to recover anything. Second, the
  products grow fast: 25! is about 1.55 × 10<sup>25</sup>, far past the
  2<sup>53</sup> − 1 limit up to which JavaScript numbers hold integers
  exactly, so the stored products, and the quotients made from them, can be
  inexact.
</p>
<table>
  <tr><th>Operation</th><th>Inverse</th><th>Range query by two prefixes?</th></tr>
  <tr><td>sum</td><td>subtraction</td><td>yes</td></tr>
  <tr><td>XOR</td><td>XOR itself</td><td>yes</td></tr>
  <tr><td>product</td><td>division</td><td>only without zeros and without overflow</td></tr>
  <tr><td>min, max, gcd</td><td>none</td><td>no: use a sparse table or a segment tree</td></tr>
</table>
<p>
  What does survive is the idea of an <b>exclusive prefix and an exclusive
  suffix</b>. In <b>Product of Array Except Self</b> you want, for each index,
  the product of everything except that element, and you may not divide. The
  answer at <code>i</code> is (the product of everything to the left of
  <code>i</code>) × (the product of everything to the right of
  <code>i</code>). Two sweeps give both factors, and the second can be folded
  into the output array, so the extra space beyond the output is O(1):
</p>
<pre><code><span class="c">// O(n) time, O(1) extra space beyond the output</span>
function productExceptSelf(nums) {
  const n = nums.length;
  const out = new Array(n).fill(1);

  let left = 1; <span class="c">// product of nums[0..i-1]</span>
  for (let i = 0; i &lt; n; i++) {
    out[i] = left;
    left *= nums[i];
  }

  let right = 1; <span class="c">// product of nums[i+1..n-1]</span>
  for (let i = n - 1; i >= 0; i--) {
    out[i] *= right;
    right *= nums[i];
  }
  return out;
}

productExceptSelf([1, 2, 3, 4]); <span class="c">// [24, 12, 8, 6]</span>
productExceptSelf([1, 0, 3]);    <span class="c">// [0, 3, 0]</span></code></pre>
<h4>Dry run: productExceptSelf([1, 2, 3, 4])</h4>
<table>
  <tr><th>pass</th><th>i</th><th>factor used</th><th>out after this step</th></tr>
  <tr><td>left</td><td>0</td><td>left = 1</td><td>[1, 1, 1, 1]</td></tr>
  <tr><td>left</td><td>1</td><td>left = 1</td><td>[1, 1, 1, 1]</td></tr>
  <tr><td>left</td><td>2</td><td>left = 2</td><td>[1, 1, 2, 1]</td></tr>
  <tr><td>left</td><td>3</td><td>left = 6</td><td>[1, 1, 2, 6]</td></tr>
  <tr><td>right</td><td>3</td><td>right = 1</td><td>[1, 1, 2, 6]</td></tr>
  <tr><td>right</td><td>2</td><td>right = 4</td><td>[1, 1, 8, 6]</td></tr>
  <tr><td>right</td><td>1</td><td>right = 12</td><td>[1, 12, 8, 6]</td></tr>
  <tr><td>right</td><td>0</td><td>right = 24</td><td>[24, 12, 8, 6]</td></tr>
</table>
<p class="sub">
  Zeros need no special handling: with <code>[1, 0, 3]</code> the left pass
  leaves <code>[1, 1, 0]</code>, and the right pass turns it into
  <code>[0, 3, 0]</code>, which is right, since every product that avoids the
  zero is taken over the other two elements only. One cosmetic quirk:
  <code>0 * -2</code> is <code>-0</code> in JavaScript, so
  <code>productExceptSelf([0, 5, -2])</code> contains a <code>-0</code>.
  <code>===</code> treats it as 0, but <code>Object.is(-0, 0)</code> is
  <code>false</code>, which matters only if a checker compares with it.
</p>

<h3>Difference arrays: the same idea run backwards</h3>
<p>
  Everything so far read ranges. Now flip it: <b>write</b> to ranges. You are
  given an array of n zeros and many updates, each saying "add
  <code>delta</code> to every element from <code>left</code> to
  <code>right</code>", and you need the final array. Applying each update with
  a loop costs O(n) per update, so O(n·q) overall. Booking systems,
  car-pooling and "how many intervals cover this point" all have this shape.
</p>
<p>
  The trick comes from asking what a prefix sum is the <em>reverse</em> of.
  Define the <b>difference array</b> <code>D[i] = A[i] − A[i − 1]</code>, with
  <code>A[−1] = 0</code>: how much the array steps up or down at each index.
  Taking prefix sums of <code>D</code> gives back <code>A</code>, because each
  step is added to the running level. Now watch what "add d to
  <code>A[l..r]</code>" does to the steps. Inside the range every element rises
  by d together, so the step between neighbours is unchanged. Only two steps
  change: the step <b>into</b> the range at <code>l</code> rises by d, and the
  step <b>out of</b> it, at <code>r + 1</code>, falls by d.
</p>
<figure>
  <svg viewBox="0 0 640 235" class="dg" role="img" aria-label="A difference array with plus two at index one and minus two at index four above the array that results from its running sum, which holds two at indexes one to three">
    <text class="lbl" x="20" y="30" style="font-size:14px">update: add 2 to indexes 1..3</text>
    <g class="rough">
      <rect class="box" x="60" y="45" width="90" height="40" />
      <rect class="boxg" x="150" y="45" width="90" height="40" />
      <rect class="box" x="240" y="45" width="90" height="40" />
      <rect class="box" x="330" y="45" width="90" height="40" />
      <rect class="boxr" x="420" y="45" width="90" height="40" />
    </g>
    <text class="sm" x="105" y="70" text-anchor="middle">0</text>
    <text class="sm gr" x="195" y="70" text-anchor="middle">+2</text>
    <text class="sm" x="285" y="70" text-anchor="middle">0</text>
    <text class="sm" x="375" y="70" text-anchor="middle">0</text>
    <text class="sm rd" x="465" y="70" text-anchor="middle">−2</text>
    <text class="sm" x="20" y="70">D</text>
    <g class="rough">
      <path class="ln dash" d="M105,85 L105,125" />
      <path class="ln dash" d="M195,85 L195,125" />
      <path class="ln dash" d="M285,85 L285,125" />
      <path class="ln dash" d="M375,85 L375,125" />
      <path class="ln dash" d="M465,85 L465,125" />
    </g>
    <g class="rough">
      <rect class="box" x="60" y="125" width="90" height="40" />
      <rect class="boxg" x="150" y="125" width="90" height="40" />
      <rect class="boxg" x="240" y="125" width="90" height="40" />
      <rect class="boxg" x="330" y="125" width="90" height="40" />
      <rect class="box" x="420" y="125" width="90" height="40" />
    </g>
    <text class="sm" x="105" y="150" text-anchor="middle">0</text>
    <text class="sm" x="195" y="150" text-anchor="middle">2</text>
    <text class="sm" x="285" y="150" text-anchor="middle">2</text>
    <text class="sm" x="375" y="150" text-anchor="middle">2</text>
    <text class="sm" x="465" y="150" text-anchor="middle">0</text>
    <text class="sm" x="20" y="150">A</text>
    <text class="sm" x="105" y="182" text-anchor="middle">0</text>
    <text class="sm" x="195" y="182" text-anchor="middle">1</text>
    <text class="sm" x="285" y="182" text-anchor="middle">2</text>
    <text class="sm" x="375" y="182" text-anchor="middle">3</text>
    <text class="sm" x="465" y="182" text-anchor="middle">4</text>
    <text class="sm rd" x="20" y="215">two writes record the whole update; the running sum of D rebuilds A: 0, 2, 2, 2, 0</text>
  </svg>
  <figcaption>Adding to a range touches two entries of D. The running sum turns the two steps back into a plateau.</figcaption>
</figure>
<p>
  So each update is two writes, O(1), and one final prefix-sum pass produces the
  array: O(n + q) in total.
</p>
<pre><code><span class="c">// n elements starting at 0; each update is [left, right, delta], inclusive. O(n + q) time, O(n) space</span>
function applyUpdates(n, updates) {
  const diff = new Array(n + 1).fill(0); <span class="c">// one spare slot so right + 1 === n is legal</span>

  for (const [left, right, delta] of updates) {
    diff[left] += delta;       <span class="c">// the level rises here</span>
    diff[right + 1] -= delta;  <span class="c">// and falls back right after the range</span>
  }

  const result = new Array(n);
  let level = 0;
  for (let i = 0; i &lt; n; i++) {
    level += diff[i]; <span class="c">// prefix sum of the steps</span>
    result[i] = level;
  }
  return result;
}

applyUpdates(5, [[1, 3, 2], [2, 4, 3], [0, 2, -1]]); <span class="c">// [-1, 1, 4, 5, 3]</span></code></pre>
<h4>Dry run: applyUpdates(5, [[1, 3, 2], [2, 4, 3], [0, 2, -1]])</h4>
<table>
  <tr><th>after update</th><th>diff[0..5]</th></tr>
  <tr><td>start</td><td>0, 0, 0, 0, 0, 0</td></tr>
  <tr><td>[1, 3, +2]</td><td>0, 2, 0, 0, −2, 0</td></tr>
  <tr><td>[2, 4, +3]</td><td>0, 2, 3, 0, −2, −3</td></tr>
  <tr><td>[0, 2, −1]</td><td>−1, 2, 3, 1, −2, −3</td></tr>
</table>
<table>
  <tr><th>i</th><th>diff[i]</th><th>level (running sum)</th></tr>
  <tr><td>0</td><td>-1</td><td>-1</td></tr>
  <tr><td>1</td><td>2</td><td>1</td></tr>
  <tr><td>2</td><td>3</td><td>4</td></tr>
  <tr><td>3</td><td>1</td><td>5</td></tr>
  <tr><td>4</td><td>-2</td><td>3</td></tr>
</table>
<p class="sub">
  Index 3, for instance, is covered by the first and second updates (+2 and
  +3) but not the third (which ends at 2), and indeed its level is 5. The last
  entry of <code>diff</code> (−3 at index 5) is never read; its only job was to
  absorb the subtraction from the update that ended at the final index.
</p>
<p>
  <b>Car Pooling</b> is the standard application. Trips are
  <code>[passengers, from, to]</code>; the load rises by that many at
  <code>from</code> and falls by the same amount at <code>to</code>, so the
  maximum load is the largest level of the running sum. Passengers leaving at a
  stop get out before new ones get in, and the code gets that rule for free:
  both changes land in the same slot and are added before the capacity is
  checked.
</p>
<pre><code><span class="c">// O(trips + stops) time, O(stops) space</span>
function carPooling(trips, capacity) {
  let lastStop = 0;
  for (const trip of trips) lastStop = Math.max(lastStop, trip[2]);

  const change = new Array(lastStop + 1).fill(0);
  for (const [passengers, from, to] of trips) {
    change[from] += passengers;
    change[to] -= passengers; <span class="c">// drop-off at "to": the seat is free again AT stop "to"</span>
  }

  let onBoard = 0;
  for (const delta of change) {
    onBoard += delta;
    if (onBoard > capacity) return false;
  }
  return true;
}

carPooling([[2, 1, 5], [3, 3, 7]], 4); <span class="c">// false: stops 3 and 4 hold 5 passengers</span>
carPooling([[2, 1, 5], [3, 5, 7]], 3); <span class="c">// true: the 2 get out at 5 before the 3 get in</span></code></pre>
<p>
  The same shape appears whenever you count overlapping intervals at a point:
  how many meetings are in progress, the maximum number of simultaneous
  bookings, or the flights-booked-per-day problem, where the only extra step is
  shifting a 1-based range to a 0-based index. When the coordinates are huge
  or sparse, a difference array of that size is wasteful: record the changes
  in a <code>Map</code> (or sort the endpoints) and sweep the keys in order,
  which is the sweep-line technique in the
  <a href="/dsa/dsa-intervals">intervals chapter</a>.
</p>
<div class="warn">
  <span class="ttl">⚠ What a difference array cannot do</span>
  It answers "what is the array after all updates" in one pass. It cannot
  answer "what is <code>A[i]</code> right now" in between updates without a
  rebuild, and rebuilding after every update costs O(n) again. When updates
  and reads are interleaved, keep the difference array inside a Fenwick tree:
  a range update is two point updates, and reading one element is a prefix sum,
  both O(log n). Also watch the edge: with a length-n array,
  <code>diff[right + 1]</code> for <code>right = n − 1</code> writes outside
  the array; allocate n + 1.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Applying each update with a
  loop is O(n) per update. A prefix sum has an inverse, the difference array,
  where adding to a range changes only the entry at the start and the entry
  just past the end. So each update is two writes, and a single prefix-sum
  pass at the end rebuilds the array: O(n + q). It works because I read
  the array once, after all the updates."
</div>

<h3>Two dimensions: rectangle sums by inclusion and exclusion</h3>
<p>
  A grid with many rectangle-sum queries has the same shape as the 1D problem,
  with a worse brute force: a query over a big rectangle touches up to
  rows × cols cells. The 1D idea extends if you define the prefix as a
  <b>rectangle anchored at the top-left corner</b>. Let <code>P[r][c]</code>
  be the sum of all cells with row index below r and column index below c
  (the first r rows and the first c columns). As in 1D, row 0 and column 0 of
  the table are zeros, so <code>P</code> has <code>(rows + 1) × (cols + 1)</code>
  entries.
</p>
<p>
  <b>Building it.</b> The rectangle ending at cell <code>(r, c)</code> is the
  cell itself, plus the rectangle that ends one row above, plus the rectangle
  that ends one column to the left. But the two neighbouring rectangles both
  contain everything above-left of the cell, so that region has been counted
  twice, and we subtract it once:
</p>
<pre><code>P[r + 1][c + 1] = a[r][c] + P[r][c + 1] + P[r + 1][c] − P[r][c]</code></pre>
<p>
  <b>Querying.</b> Take the rectangle with corners <code>(r1, c1)</code> and
  <code>(r2, c2)</code>, both inclusive. Start from the big prefix rectangle
  that reaches <code>(r2, c2)</code>, remove the strip above the query and the
  strip to its left, and notice that the corner where those two strips overlap
  was removed twice, so add it back once. This is inclusion and exclusion.
</p>
<figure>
  <svg viewBox="0 0 640 235" class="dg" role="img" aria-label="A grid split into four regions: the query rectangle in green, the strip above it and the strip left of it in red, and the corner they share in yellow, with the formula for subtracting and adding back the corner">
    <g class="rough">
      <rect class="boxy" x="60" y="30" width="160" height="70" />
      <rect class="boxr" x="220" y="30" width="180" height="70" />
      <rect class="boxr" x="60" y="100" width="160" height="100" />
      <rect class="boxg" x="220" y="100" width="180" height="100" />
    </g>
    <text class="sm" x="140" y="70" text-anchor="middle">corner</text>
    <text class="sm" x="310" y="70" text-anchor="middle">above</text>
    <text class="sm" x="140" y="155" text-anchor="middle">left</text>
    <text class="sm gr" x="310" y="155" text-anchor="middle">query</text>
    <text class="sm" x="420" y="60">all four: P[r2+1][c2+1]</text>
    <text class="sm" x="420" y="90">− P[r1][c2+1] (above + corner)</text>
    <text class="sm" x="420" y="120">− P[r2+1][c1] (left + corner)</text>
    <text class="sm" x="420" y="150">+ P[r1][c1] (corner)</text>
    <text class="sm rd" x="420" y="180">the corner was removed twice</text>
    <text class="sm" x="60" y="222">the query's top-left is (r1, c1) and its bottom-right is (r2, c2)</text>
  </svg>
  <figcaption>Everything is a prefix rectangle from the top-left corner. The query is the whole, minus two strips, plus the doubly removed corner.</figcaption>
</figure>
<pre><code><span class="c">// build: O(rows·cols). Each query: O(1). Space: O((rows+1)·(cols+1))</span>
class NumMatrix {
  constructor(matrix) {
    const rows = matrix.length;
    const cols = rows === 0 ? 0 : matrix[0].length;

    <span class="c">// Array.from with a callback: every row is its OWN array</span>
    this.prefix = Array.from({ length: rows + 1 }, () =&gt; new Array(cols + 1).fill(0));

    for (let r = 0; r &lt; rows; r++) {
      for (let c = 0; c &lt; cols; c++) {
        this.prefix[r + 1][c + 1] =
          matrix[r][c] + this.prefix[r][c + 1] + this.prefix[r + 1][c] - this.prefix[r][c];
      }
    }
  }

  sumRegion(r1, c1, r2, c2) {
    const p = this.prefix;
    return p[r2 + 1][c2 + 1] - p[r1][c2 + 1] - p[r2 + 1][c1] + p[r1][c1];
  }
}</code></pre>
<h4>Dry run: matrix [[3, 0, 1], [5, 6, 3], [1, 2, 0]]</h4>
<table>
  <tr><th>prefix</th><th>c = 0</th><th>c = 1</th><th>c = 2</th><th>c = 3</th></tr>
  <tr><td>r = 0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>r = 1</td><td>0</td><td>3</td><td>3</td><td>4</td></tr>
  <tr><td>r = 2</td><td>0</td><td>8</td><td>14</td><td>18</td></tr>
  <tr><td>r = 3</td><td>0</td><td>9</td><td>17</td><td>21</td></tr>
</table>
<p class="sub">
  Check one cell with the build rule: <code>prefix[2][2]</code> is
  <code>matrix[1][1] + prefix[1][2] + prefix[2][1] − prefix[1][1]</code> =
  6 + 3 + 8 − 3 = 14, and the top-left 2×2 block <code>3 + 0 + 5 + 6</code> is
  14. Now the query <code>sumRegion(1, 1, 2, 2)</code>, the bottom-right 2×2
  block: <code>prefix[3][3] − prefix[1][3] − prefix[3][1] + prefix[1][1]</code>
  = 21 − 4 − 9 + 3 = 11, and by hand <code>6 + 3 + 2 + 0</code> is 11.
</p>
<div class="warn">
  <span class="ttl">⚠ Where 2D prefix sums go wrong</span>
  <b>(1) Shared rows.</b> <code>new Array(n).fill(new Array(m).fill(0))</code>
  puts the <em>same</em> inner array in every row, so writing one cell writes
  a whole column. Use <code>Array.from(..., () =&gt; new Array(m).fill(0))</code>
  as above. <b>(2) Wrong size.</b> The table needs a leading row and column of
  zeros, so <code>(rows + 1) × (cols + 1)</code>. <b>(3) Swapped axes.</b> Keep
  every formula in (row, column) order; transposing one index gives a
  plausible wrong number on a square grid. <b>(4) Dropping the added-back
  corner.</b> Forgetting the <code>+ p[r1][c1]</code> term under-counts by that
  corner. A single-cell query on every cell is the cheapest test: each one
  must equal the cell itself. <b>(5) An empty matrix.</b> Guard
  <code>matrix[0].length</code>.
</div>
<p>
  <b>Matrix Block Sum</b> builds directly on the table. For each cell, the
  wanted block runs from <code>i − k</code> to <code>i + k</code> in each
  direction, clamped to the grid. Clamp the four corners with
  <code>Math.max(0, ...)</code> and <code>Math.min(last, ...)</code> and use
  the same four-term query: O(rows·cols) total, however large k is.
</p>
<pre><code>function matrixBlockSum(mat, k) {
  const rows = mat.length;
  const cols = mat[0].length;
  const grid = new NumMatrix(mat);

  return mat.map((row, i) =&gt;
    row.map((_, j) =&gt;
      grid.sumRegion(
        Math.max(0, i - k),
        Math.max(0, j - k),
        Math.min(rows - 1, i + k),
        Math.min(cols - 1, j + k)
      )
    )
  );
}</code></pre>
<p>
  The harder relative, <b>Number of Submatrices That Sum to Target</b>, joins
  the 2D table to the hash-map idea from earlier. Fix a top row and a bottom
  row. Every rectangle between them is a run of consecutive columns, and its
  sum is the sum of the column totals over that run. For a fixed pair of rows
  the column totals form a 1D array, and the question "how many runs sum to the
  target" is <code>subarraySum</code>. Loop the bottom row downward, adding one
  row at a time into the column totals:
</p>
<pre><code><span class="c">// O(rows² · cols) time, O(cols) extra space; reuses subarraySum from earlier</span>
function numSubmatrixSumTarget(matrix, target) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  let count = 0;

  for (let top = 0; top &lt; rows; top++) {
    const columnTotals = new Array(cols).fill(0);
    for (let bottom = top; bottom &lt; rows; bottom++) {
      for (let c = 0; c &lt; cols; c++) columnTotals[c] += matrix[bottom][c];
      count += subarraySum(columnTotals, target); <span class="c">// 1D problem for this pair of rows</span>
    }
  }
  return count;
}

numSubmatrixSumTarget([[0, 1, 0], [1, 1, 1], [0, 1, 0]], 0); <span class="c">// 4</span></code></pre>
<p>
  There are rows(rows + 1)/2 pairs of rows and each costs O(cols), so the total
  is O(rows² · cols). The row pairs are the squared factor, so when the grid is
  not square it is cheaper to take the smaller dimension as "rows" (transpose
  first if needed).
</p>
<p>
  The 2D <b>difference array</b> mirrors the 1D one with four corners. To add
  <code>d</code> to the rectangle <code>(r1, c1)–(r2, c2)</code>, write
  <code>+d</code> at its top-left, <code>−d</code> just right of its top-right
  and just below its bottom-left, and <code>+d</code> diagonally past its
  bottom-right. A 2D prefix sum over the table then yields the final grid:
</p>
<pre><code><span class="c">// diff has (rows + 1) rows and (cols + 1) columns</span>
function addRectangle(diff, r1, c1, r2, c2, delta) {
  diff[r1][c1] += delta;
  diff[r1][c2 + 1] -= delta;
  diff[r2 + 1][c1] -= delta;
  diff[r2 + 1][c2 + 1] += delta;
}

function rebuild(diff, rows, cols) {
  const out = Array.from({ length: rows }, () =&gt; new Array(cols).fill(0));
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      out[r][c] =
        diff[r][c] + (r ? out[r - 1][c] : 0) + (c ? out[r][c - 1] : 0) - (r &amp;&amp; c ? out[r - 1][c - 1] : 0);
    }
  }
  return out;
}</code></pre>
<p class="sub">
  The rebuild is the same inclusion-exclusion as the 2D prefix build, with the
  guards standing in for the leading row and column of zeros.
</p>

<h3>Choosing between the tools</h3>
<p>
  Prefix sums are one of several tools for range questions, and the decision is
  mostly about what changes and what is being asked.
</p>
<table>
  <tr><th>Situation</th><th>Reach for</th><th>Cost</th></tr>
  <tr><td>Fixed array, many range sums (or XORs)</td><td>prefix table</td><td>O(n) build, O(1) per query</td></tr>
  <tr><td>Count, longest or shortest subarray with an exact sum, negatives allowed</td><td>prefix sums plus a <code>Map</code></td><td>O(n) time, O(n) space</td></tr>
  <tr><td>Same question with all values non-negative, or a monotone window condition</td><td>a <a href="/dsa/dsa-sliding-window">sliding window</a></td><td>O(n) time, O(1) space</td></tr>
  <tr><td>Many range additions, one read at the end</td><td>difference array</td><td>O(n + q)</td></tr>
  <tr><td>Point updates mixed with range sums, or range updates mixed with reads</td><td><a href="/dsa/dsa-segment-fenwick-trees">Fenwick or segment tree</a></td><td>O(log n) per operation</td></tr>
  <tr><td>Range minimum or maximum</td><td>not prefix sums: a sparse table, a segment tree or a <a href="/dsa/dsa-monotonic-stack-queue">monotonic queue</a></td><td>varies</td></tr>
  <tr><td>Rectangle sums on a fixed grid</td><td>2D prefix table</td><td>O(rows·cols) build, O(1) per query</td></tr>
</table>
<p class="sub">
  The sliding-window row is worth saying aloud in an interview. Prefix sums
  with a map are the more general tool (they handle negatives), and a window
  is the lighter one (no map, constant space) when its monotonicity argument
  applies. See the <a href="/dsa/dsa-hashing">hashing chapter</a> for the map
  half of the pairing.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The statement says <b>subarray</b>, <b>contiguous</b>, <b>range</b>, <b>interval</b> or <b>rectangle</b>, and asks for a sum, a count of something, or a balance between two kinds of element</li>
  <li>The brute force is "for every pair of endpoints, compute the thing", O(n²) or O(n³): a prefix table makes each evaluation O(1), and a map can remove the inner loop entirely</li>
  <li>The input contains negative numbers and the problem is about an exact sum. This is the signal to prefer prefix sums plus a map over a sliding window</li>
  <li>"Equal numbers of A and B" becomes "sum is 0" after mapping A to +1 and B to −1; "exactly k things with a property" becomes "sum is k" after mapping each element to 0 or 1</li>
  <li>"Divisible by k", "a multiple of k" or a remainder condition means equal prefix <b>remainders</b>, and an array of size k or a map keyed by remainder</li>
  <li>XOR over a range means prefix XOR. If a triplet or pair condition says two XORs are equal, ask whether their combination is 0</li>
  <li>Many "add to a range" operations followed by a single read of the array (bookings, overlaps, capacity) means a difference array. "How many intervals cover this point" is the same thing</li>
  <li>A grid with many rectangle queries means a 2D prefix table. A question about every rectangle in a grid often means fixing two rows and solving a 1D problem</li>
  <li>If the array changes between queries, a plain prefix table is stale: move to a Fenwick or segment tree. If the question is about min or max, prefix tricks do not apply</li>
</ul>

<h3>The mistakes that lose offers</h3>
<ul>
  <li><b>Forgetting the empty prefix.</b> Seeding the map with <code>{0: 1}</code> (or <code>{0: -1}</code> for indices) is what lets subarrays that start at index 0 count. It is the most common single bug in this chapter</li>
  <li><b>Recording before looking up.</b> This only shows up when <code>k = 0</code>, so test <code>k = 0</code> deliberately</li>
  <li><b>Overwriting the first index</b> in a "longest" question, or <b>not</b> overwriting it in a "shortest" one</li>
  <li><b>Using a sliding window with negative numbers.</b> A window that shrinks when the sum is too big cannot tell which edge to move</li>
  <li><b>Negative remainders.</b> <code>-7 % 5</code> is <code>-2</code> in JavaScript. Normalise with <code>((x % k) + k) % k</code>; and <code>x % 0</code> is <code>NaN</code></li>
  <li><b>Tests for odd that use <code>=== 1</code>.</b> <code>-3 % 2</code> is <code>-1</code></li>
  <li><b>32-bit bitwise operators.</b> <code>^</code> and <code>&amp;</code> truncate to 32 bits; use <code>BigInt</code> for larger values</li>
  <li><b>Off-by-one at the end of a difference array.</b> Allocate n + 1 so <code>right + 1</code> is a valid index</li>
  <li><b>Shared rows in a 2D table</b> built with <code>fill(new Array(...))</code>, and a table without its leading row and column of zeros</li>
  <li><b>A stale table.</b> The prefix table describes the array as it was when built; if elements change, it is wrong from the first changed index onward</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write <code>buildPrefix</code> and <code>rangeSum</code> from memory with the leading zero, and say why <code>P[right + 1] − P[left]</code> needs no special case for <code>left = 0</code>.</li>
    <li>Derive, without looking, why "<code>P[r + 1] − P[l] = k</code>" becomes "look up <code>prefix − k</code> among earlier prefixes", and say which two lines (the seed and the order of lookup and record) make <code>subarraySum</code> correct.</li>
    <li>Explain why a sliding window fails on <code>[1, -1, 1, 1]</code> with <code>k = 1</code> and what the prefix-sum version does differently.</li>
    <li>For the same lookup, say what you store for count, for longest and for shortest, and why longest must not overwrite.</li>
    <li>Turn "equal numbers of 0s and 1s" and "exactly k odd numbers" into a sum problem, and name the transformation each uses.</li>
    <li>Fold a negative sum into <code>0..k − 1</code> in JavaScript, and say what <code>x % 0</code> gives.</li>
    <li>Explain why XOR ranges work with the same two-prefix idea but a range product usually does not.</li>
    <li>Explain, in two sentences, how a difference array applies a range update in O(1) and why it needs one slot more than the array.</li>
    <li>Write the four-term 2D range sum from the picture of the four regions, and say which term repairs a double subtraction.</li>
  </ul>
</div>`,
};
