import type { Chapter } from "../types";

export const dsaBinarySearch: Chapter = {
  id: "dsa-binary-search",
  num: "B8",
  title: "Binary search",
  short: "Binary search",
  levels: ["beginner"],
  prerequisites: ["dsa-arrays-strings"],
  practice: [
    "ex-binary-search-classic",
    "ex-search-insert-position",
    "ex-search-2d-matrix",
    "ex-first-last-position",
    "ex-search-rotated-sorted-array",
    "ex-search-rotated-sorted-array-ii",
    "ex-find-min-rotated",
    "ex-find-peak-element",
    "ex-koko-eating-bananas",
    "ex-ship-packages-in-days",
    "ex-split-array-largest-sum",
    "ex-median-two-sorted-arrays",
    "ex-integer-sqrt",
    "ex-valid-perfect-square",
    "ex-find-duplicate-number",
    "ex-first-bad-version",
    "ex-peak-index-in-mountain-array",
    "ex-find-min-rotated-ii",
    "ex-find-k-closest-elements",
    "ex-single-element-in-sorted-array",
    "ex-minimum-days-bouquets",
    "ex-smallest-divisor-threshold",
    "ex-magnetic-force-between-balls",
    "ex-real-square-root",
  ],
  ready: true,
  subtitle: "Halving the search space is the single highest-leverage trick in DSA.",
  body: `<h3>The core idea</h3>
<p>
  Binary search needs exactly one property from the search space: at every
  point, you can tell which half the answer is in without checking it
  directly. On a sorted array that's obvious — but the same idea applies
  to any "monotonic" space, which is why binary search shows up far more
  often than "is this array sorted" questions alone would suggest.
</p>

<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="Binary search halving the search space by comparing the middle element">
    <g class="rough">
      <rect class="box" x="20" y="30" width="40" height="40" />
      <rect class="box" x="60" y="30" width="40" height="40" />
      <rect class="box" x="100" y="30" width="40" height="40" />
      <rect class="boxy" x="140" y="30" width="40" height="40" />
      <rect class="box" x="180" y="30" width="40" height="40" />
      <rect class="box" x="220" y="30" width="40" height="40" />
      <rect class="box" x="260" y="30" width="40" height="40" />
    </g>
    <text class="sm" x="40" y="55" text-anchor="middle">1</text>
    <text class="sm" x="80" y="55" text-anchor="middle">3</text>
    <text class="sm" x="120" y="55" text-anchor="middle">6</text>
    <text class="sm" x="160" y="55" text-anchor="middle">9</text>
    <text class="sm" x="200" y="55" text-anchor="middle">12</text>
    <text class="sm" x="240" y="55" text-anchor="middle">15</text>
    <text class="sm" x="280" y="55" text-anchor="middle">20</text>
    <text class="lbl rd" x="160" y="14" text-anchor="middle" style="font-size:14px">mid</text>
    <text class="sm" x="60" y="100">target = 15 &gt; 9 → whole left half (1,3,6,9) is eliminated, no need to check any of it</text>
    <text class="lbl" x="20" y="140" style="font-size:15px">n → n/2 → n/4 → n/8 → … → 1</text>
    <text class="sm" x="20" y="165">log₂(n) halvings until one element remains — that's the O(log n)</text>
  </svg>
  <figcaption>Each comparison eliminates half the remaining space, not just one element.</figcaption>
</figure>

<h3>The template that avoids off-by-one bugs</h3>
<div data-code="binary-search-classic"><pre><code>function binarySearch(sorted, target) {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {              <span class="c">// note: <=, not <</span>
    const mid = lo + Math.floor((hi - lo) / 2); <span class="c">// avoids overflow in fixed-width integer languages</span>
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; <span class="c">// not found</span>
}</code></pre></div>
<div class="warn">
  <span class="ttl">⚠ The two bugs that show up every time</span>
  <ul style="margin:6px 0 0">
    <li><code>lo &lt;= hi</code> vs <code>lo &lt; hi</code> — get this wrong
      and you'll either miss the last candidate or loop forever.</li>
    <li><code>mid = (lo + hi) / 2</code> is a fraction in JS and can
      integer-overflow in other languages — the
      <code>lo + Math.floor((hi - lo) / 2)</code> form is the safe habit
      everywhere, so use it every time.</li>
  </ul>
</div>

<h4>Dry run: binarySearch([1, 3, 6, 9, 12, 15, 20], 15)</h4>
<table>
  <tr><th>step</th><th>lo</th><th>hi</th><th>mid (value)</th><th>compare</th><th>action</th></tr>
  <tr><td>1</td><td>0</td><td>6</td><td>3 (9)</td><td>9 &lt; 15</td><td>lo = 4</td></tr>
  <tr><td>2</td><td>4</td><td>6</td><td>5 (15)</td><td><b>match</b></td><td>return 5</td></tr>
</table>
<p class="sub">
  Seven elements, but only two comparisons — <code>log₂(7) ≈ 2.8</code>,
  rounded up to 3 worst-case steps. Compare that to a linear scan, which
  could need all 7. At n = 1,000,000, binary search needs about 20 steps;
  a linear scan could need a million.
</p>

<h3>Binary search on the answer, not the array</h3>
<p>
  This is the pattern that separates candidates who've memorized one
  template from candidates who understand the idea. Whenever a problem
  asks for the <b>minimum value that satisfies a condition</b> (or
  maximum), and "does value X work?" gets easier to check as X changes
  monotonically, you can binary search over the range of possible answers
  instead of the input array.
</p>
<div data-code="answer-search-bananas"><pre><code><span class="c">// minimum "speed" to eat all bananas within h hours — classic answer-space search</span>
function minEatingSpeed(piles, h) {
  function hoursNeeded(speed) {
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / speed);
    return hours;
  }

  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (hoursNeeded(mid) <= h) hi = mid;   <span class="c">// mid works — answer could be smaller</span>
    else lo = mid + 1;                     <span class="c">// mid too slow — need bigger speed</span>
  }
  return lo;
}</code></pre></div>
<p class="sub">
  The array here isn't even sorted — what's monotonic is the
  <em>relationship between speed and hours needed</em>: faster speed always
  means fewer or equal hours. That monotonic relationship is the real
  requirement for binary search, not "is the input array sorted."
</p>

<h3>Finding a boundary (first/last occurrence)</h3>
<div data-code="lower-bound"><pre><code><span class="c">// leftmost index where nums[i] >= target — the building block for
// "find first occurrence" and most boundary-search variants</span>
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length; <span class="c">// note: hi = length, not length-1, here</span>
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}</code></pre></div>

<div class="say">
  <span class="ttl">Say it like this →</span> "Even though the array isn't
  sorted, the answer space is monotonic — if speed X works, every speed
  faster than X also works — so I can binary search over the range of
  possible speeds instead of scanning them all."
</div>


<h3>Upper bound, first and last position, and counting</h3>
<p>
  <code>lowerBound</code> returns the first index whose value is
  <em>at least</em> the target. Its twin, <code>upperBound</code>, returns the
  first index whose value is <em>greater than</em> the target. The two differ by
  one character, and together they answer most "sorted array with duplicates"
  questions.
</p>
<pre><code><span class="c">// first index with nums[i] > target (nums.length if there is none)</span>
function upperBound(nums, target) {
  let lo = 0, hi = nums.length;
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] &lt;= target) lo = mid + 1;   <span class="c">// the only change from lowerBound: &lt;= instead of &lt;</span>
    else hi = mid;
  }
  return lo;
}

<span class="c">// [first, last] position of target, or [-1, -1]</span>
function searchRange(nums, target) {
  const first = lowerBound(nums, target);
  if (first === nums.length || nums[first] !== target) return [-1, -1];
  return [first, upperBound(nums, target) - 1];
}

function countOccurrences(nums, target) {
  return upperBound(nums, target) - lowerBound(nums, target);
}</code></pre>
<p>
  Read them as counts. <code>lowerBound(nums, x)</code> is the number of
  elements <em>smaller than</em> x, and <code>upperBound(nums, x)</code> is the
  number of elements <em>at most</em> x. Their difference is how many equal x.
  The same reading gives the insertion point for a new value
  (<code>lowerBound</code>) and the number of elements in a value range
  <code>[a, b]</code> (<code>upperBound(b) - lowerBound(a)</code>).
</p>

<h4>Dry run: searchRange([5, 7, 7, 8, 8, 10], 8)</h4>
<table>
  <tr><th>search</th><th>lo</th><th>hi</th><th>mid (value)</th><th>test</th><th>action</th></tr>
  <tr><td>lowerBound</td><td>0</td><td>6</td><td>3 (8)</td><td>8 &lt; 8? no</td><td>hi = 3</td></tr>
  <tr><td>lowerBound</td><td>0</td><td>3</td><td>1 (7)</td><td>7 &lt; 8? yes</td><td>lo = 2</td></tr>
  <tr><td>lowerBound</td><td>2</td><td>3</td><td>2 (7)</td><td>7 &lt; 8? yes</td><td>lo = 3, result <b>3</b></td></tr>
  <tr><td>upperBound</td><td>0</td><td>6</td><td>3 (8)</td><td>8 &lt;= 8? yes</td><td>lo = 4</td></tr>
  <tr><td>upperBound</td><td>4</td><td>6</td><td>5 (10)</td><td>10 &lt;= 8? no</td><td>hi = 5</td></tr>
  <tr><td>upperBound</td><td>4</td><td>5</td><td>4 (8)</td><td>8 &lt;= 8? yes</td><td>lo = 5, result <b>5</b></td></tr>
</table>
<p class="sub">
  The answer is <code>[3, 5 - 1] = [3, 4]</code>, and the count of 8s is
  <code>5 - 3 = 2</code>. Two searches of O(log n) each. Notice the check
  <code>first === nums.length</code> before reading <code>nums[first]</code>:
  when every element is smaller than the target, <code>lowerBound</code> returns
  <code>nums.length</code>, one past the end.
</p>
<div class="warn">
  <span class="ttl">⚠ "Find one, then walk outward" is O(n)</span>
  Finding any occurrence with the classic template and then stepping left and
  right to the ends is correct, and degrades to a linear scan on an array of
  equal values. The question is asking for the two boundaries precisely so that
  you do not do that.
</div>

<h3>Deriving the loop from an invariant</h3>
<p>
  Most binary search bugs are not typos. They are a loop, two updates and a
  return value that do not agree about what <code>lo</code> and
  <code>hi</code> <em>mean</em>. You do not need to memorise three templates;
  you need to answer three questions and let the code follow.
</p>
<ol>
  <li>What does the range <code>[lo, hi]</code> promise? (The answer, if there is one, lies inside it.)</li>
  <li>What does each branch do to keep that promise true?</li>
  <li>Why must the range get strictly smaller on every pass?</li>
</ol>
<p>
  <b>Form 1: search for an exact value, closed range.</b> The promise is: if
  the target is present, it is in <code>[lo, hi]</code>, both ends included.
  After looking at <code>mid</code> you know it is not the target, so you throw
  it away on both sides: <code>lo = mid + 1</code> or <code>hi = mid - 1</code>.
  The range gets smaller by at least one element each pass. It is empty when
  <code>lo &gt; hi</code>, which is why the loop test is
  <code>lo &lt;= hi</code>: a range with <code>lo === hi</code> still holds one
  candidate that has not been examined. This is the classic template.
</p>
<p>
  <b>Form 2: find the first index where a condition becomes true.</b> The
  promise changes. You are looking for the boundary between a run of
  <code>false</code> and a run of <code>true</code>, and the answer may be one
  past the end (no <code>true</code> at all). So <code>hi</code> starts at
  <code>n</code>, not <code>n - 1</code>, and <code>[lo, hi]</code> promises
  that the first <code>true</code> is somewhere in it, <code>hi</code>
  included. If the condition is false at <code>mid</code>, the answer is after
  it: <code>lo = mid + 1</code>. If it is true, <code>mid</code> <em>might be
  the answer</em>, so you must keep it: <code>hi = mid</code>, not
  <code>mid - 1</code>. The loop runs while <code>lo &lt; hi</code> and ends with
  <code>lo === hi</code>, one candidate left, which is the answer. There is
  nothing left to check, so there is no separate return inside the loop.
</p>
<pre><code><span class="c">// smallest x in [lo, hi) with ok(x) true; hi if there is none (ok is false up to a point, true from then on)</span>
function firstTrue(lo, hi, ok) {
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (ok(mid)) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}

<span class="c">// largest x in [lo, hi] with ok(x) true; lo - 1 if there is none (ok is true up to a point, false from then on)</span>
function lastTrue(lo, hi, ok) {
  while (lo &lt; hi) {
    const mid = lo + Math.ceil((hi - lo) / 2);   <span class="c">// the UPPER middle, see below</span>
    if (ok(mid)) lo = mid;
    else hi = mid - 1;
  }
  return ok(lo) ? lo : lo - 1;
}</code></pre>
<p>
  With <code>firstTrue</code>, <code>lowerBound</code> is
  <code>firstTrue(0, n, i =&gt; nums[i] &gt;= target)</code> and
  <code>upperBound</code> is
  <code>firstTrue(0, n, i =&gt; nums[i] &gt; target)</code>.
</p>
<p>
  <b>Form 3: find the last index where a condition is true.</b> This is the
  mirror image, and it has a trap. When the condition is true at
  <code>mid</code>, <code>mid</code> might be the answer, so you keep it:
  <code>lo = mid</code>. Now the range only shrinks if <code>mid</code> is
  strictly above <code>lo</code>. With the usual lower middle that fails:
  at <code>lo = 0, hi = 1</code> the lower middle is 0, <code>lo = mid</code>
  changes nothing, and the loop never ends. The fix is to round the middle
  <em>up</em> in this form, as <code>lastTrue</code> does, so that
  <code>mid &gt; lo</code> whenever <code>lo &lt; hi</code>.
</p>
<table>
  <tr><th>Form</th><th>Loop test</th><th>Range</th><th>Go right</th><th>Go left</th><th>Middle</th><th>Result</th></tr>
  <tr><td>exact value</td><td><code>lo &lt;= hi</code></td><td>[0, n − 1]</td><td><code>lo = mid + 1</code></td><td><code>hi = mid - 1</code></td><td>either</td><td>returned inside, or −1</td></tr>
  <tr><td>first true</td><td><code>lo &lt; hi</code></td><td>[0, n]</td><td><code>lo = mid + 1</code></td><td><code>hi = mid</code></td><td>lower</td><td><code>lo</code></td></tr>
  <tr><td>last true</td><td><code>lo &lt; hi</code></td><td>[0, n − 1]</td><td><code>lo = mid</code></td><td><code>hi = mid - 1</code></td><td><b>upper</b></td><td><code>lo</code>, after one check</td></tr>
</table>
<p class="sub">
  In both boundary forms, the update that keeps <code>mid</code>
  (<code>hi = mid</code> or <code>lo = mid</code>) is paired with the middle that
  guarantees <code>mid</code> is not stuck at that end. In the exact-value form
  <code>mid</code> is always thrown away, so either middle works. Two
  quick tests catch most mistakes: run the loop by hand on a range of size 1 and
  on a range of size 2, and on an array where the answer is the first element,
  the last element, and "none".
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll treat it as finding the
  first index where the condition turns true. When it's true at mid, mid might
  still be the answer, so I keep it with <code>hi = mid</code>; when it's false,
  the answer is strictly after mid. With <code>lo &lt; hi</code> and that pair
  of updates the range always shrinks, and when it collapses to one index,
  that's the answer."
</div>

<h3>See the range collapse</h3>
<p>Step through the search and watch the range collapse. Ten candidates become one in four comparisons — and the count of comparisons is just how many times you can halve the array.</p>

<div data-play="binary-search"></div>

<h3>Rotated sorted arrays: minimum, search and the duplicates trap</h3>
<p>
  Take a sorted array and rotate it: <code>[0, 1, 2, 4, 5, 6, 7]</code> becomes
  <code>[4, 5, 6, 7, 0, 1, 2]</code>. It is no longer sorted, but it is two
  sorted runs glued together, with one drop in the middle. That structure is
  enough for binary search, because one comparison still tells you which side
  to keep.
</p>
<p>
  <b>Finding the minimum</b> (all values distinct). Compare
  <code>nums[mid]</code> with the <em>last</em> element of the range. If
  <code>nums[mid] &gt; nums[hi]</code>, <code>mid</code> sits in the high left
  run and the drop, which holds the minimum, is to its right. Otherwise
  <code>nums[mid]</code> is in the low right run, so it might itself be the
  minimum: keep it with <code>hi = mid</code>. This is the first-true form: the
  condition "<code>nums[i] &lt;= nums[last]</code>" is false on the high run and
  true on the low run.
</p>
<pre><code>function findMin(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;   <span class="c">// the drop is to the right of mid</span>
    else hi = mid;                            <span class="c">// mid is on the low run: it may be the minimum</span>
  }
  return nums[lo];
}</code></pre>
<p class="sub">
  Why compare with <code>nums[hi]</code> and not with <code>nums[lo]</code>:
  when the range happens to be one sorted run, <code>nums[mid] &gt;= nums[lo]</code>
  is true as well, and it would send you right, past the minimum. The last
  element is a fixed reference: everything on the high run is larger than it,
  and everything on the low run is no larger.
</p>
<table>
  <tr><th>lo</th><th>hi</th><th>mid (value)</th><th>compare with nums[hi]</th><th>action</th></tr>
  <tr><td>0</td><td>6</td><td>3 (7)</td><td>7 &gt; 2</td><td>lo = 4</td></tr>
  <tr><td>4</td><td>6</td><td>5 (1)</td><td>1 &gt; 2? no</td><td>hi = 5</td></tr>
  <tr><td>4</td><td>5</td><td>4 (0)</td><td>0 &gt; 1? no</td><td>hi = 4, answer <b>0</b></td></tr>
</table>
<p>
  <b>With duplicates</b> there is one case the comparison cannot decide:
  <code>nums[mid] === nums[hi]</code>. In <code>[2, 2, 2, 0, 2]</code> and
  <code>[2, 0, 2, 2, 2]</code> the middle and the end are equal, and the drop is
  on opposite sides. The safe move is to discard the end:
</p>
<pre><code>function findMinWithDuplicates(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] > nums[hi]) lo = mid + 1;
    else if (nums[mid] &lt; nums[hi]) hi = mid;
    else hi--;                                <span class="c">// equal: drop one copy of the end; mid still holds that value</span>
  }
  return nums[lo];
}</code></pre>
<p class="sub">
  <code>hi--</code> loses nothing, because <code>nums[mid]</code> has the same
  value and is still inside the range, so the minimum value remains reachable.
  The price is the worst case: on an array that is all one value, every step
  removes a single element and the search takes O(n). Say so; it is the honest
  complexity of this version, and a common follow-up question.
</p>
<p>
  <b>Searching for a target.</b> The trick is that after any split, <em>at
  least one half is a plain sorted run</em>. Find that half, check whether the
  target falls inside its endpoints, and keep or discard it accordingly.
</p>
<pre><code>function searchRotated(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo &lt;= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return mid;
    if (nums[lo] &lt;= nums[mid]) {                       <span class="c">// [lo, mid] is sorted</span>
      if (nums[lo] &lt;= target &amp;&amp; target &lt; nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {                                           <span class="c">// [mid, hi] is sorted</span>
      if (nums[mid] &lt; target &amp;&amp; target &lt;= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return -1;
}</code></pre>
<table>
  <tr><th>lo</th><th>hi</th><th>mid (value)</th><th>which half is sorted</th><th>target 0 inside it?</th><th>action</th></tr>
  <tr><td>0</td><td>6</td><td>3 (7)</td><td>left, [4 … 7]</td><td>no, 0 &lt; 4</td><td>lo = 4</td></tr>
  <tr><td>4</td><td>6</td><td>5 (1)</td><td>left, [0, 1]</td><td>yes, 0 ≤ 0 &lt; 1</td><td>hi = 4</td></tr>
  <tr><td>4</td><td>4</td><td>4 (0)</td><td>—</td><td>—</td><td>found, return <b>4</b></td></tr>
</table>
<p class="sub">
  This is <code>searchRotated([4, 5, 6, 7, 0, 1, 2], 0)</code>. The test is
  <code>nums[lo] &lt;= nums[mid]</code> with <code>&lt;=</code>, because
  <code>lo</code> and <code>mid</code> can be the same index and a one-element
  half is sorted. With duplicates the same equality trap appears: if
  <code>nums[lo]</code>, <code>nums[mid]</code> and <code>nums[hi]</code> are
  all equal you cannot tell which half is sorted, and you can safely discard
  both ends (neither can be the target, since each equals
  <code>nums[mid]</code>, which was just tested). That makes the worst case
  O(n) again.
</p>
<pre><code>function searchRotatedWithDuplicates(nums, target) {
  let lo = 0, hi = nums.length - 1;
  while (lo &lt;= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] === target) return true;
    if (nums[lo] === nums[mid] &amp;&amp; nums[mid] === nums[hi]) {
      lo++;
      hi--;
    } else if (nums[lo] &lt;= nums[mid]) {
      if (nums[lo] &lt;= target &amp;&amp; target &lt; nums[mid]) hi = mid - 1;
      else lo = mid + 1;
    } else {
      if (nums[mid] &lt; target &amp;&amp; target &lt;= nums[hi]) lo = mid + 1;
      else hi = mid - 1;
    }
  }
  return false;
}</code></pre>

<h3>Peak element: binary search without a sorted array</h3>
<p>
  Here the array is not sorted at all. You are told that neighbouring values
  are different, and that you may imagine <code>-∞</code> on both sides of the
  array. A <b>peak</b> is an element larger than both neighbours. Find the index
  of any one peak, in O(log n).
</p>
<p>
  Compare <code>nums[mid]</code> with <code>nums[mid + 1]</code>. If the
  right neighbour is larger, you are going uphill, and walking right can only end
  at a peak: either the climb stops at an element larger than its right
  neighbour, or it reaches the end of the array, where the imaginary
  <code>-∞</code> makes the last element a peak. So a peak exists in
  <code>[mid + 1, hi]</code>. If the right neighbour is smaller, the same
  argument on the left shows a peak exists in <code>[lo, mid]</code>, with
  <code>mid</code> itself a candidate.
</p>
<pre><code>function findPeakElement(nums) {
  let lo = 0, hi = nums.length - 1;
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] &lt; nums[mid + 1]) lo = mid + 1;   <span class="c">// uphill: a peak is to the right</span>
    else hi = mid;                                  <span class="c">// downhill: mid or something left of it is a peak</span>
  }
  return lo;
}</code></pre>
<table>
  <tr><th>lo</th><th>hi</th><th>mid (value)</th><th>right neighbour</th><th>action</th></tr>
  <tr><td>0</td><td>6</td><td>3 (3)</td><td>5, higher</td><td>lo = 4</td></tr>
  <tr><td>4</td><td>6</td><td>5 (6)</td><td>4, lower</td><td>hi = 5</td></tr>
  <tr><td>4</td><td>5</td><td>4 (5)</td><td>6, higher</td><td>lo = 5, answer index <b>5</b> (value 6)</td></tr>
</table>
<p class="sub">
  This is <code>[1, 2, 1, 3, 5, 6, 4]</code>, which has two peaks (the 2 and the
  6); the search happened to find one of them. It guarantees <em>a</em> peak,
  not the highest. The promise of the range is "some peak lies in
  <code>[lo, hi]</code>", and that is all binary search needs: the half to keep
  comes from a local comparison, not from the array being sorted. If equal
  neighbours are allowed, a flat stretch can hide the direction and the
  argument fails, so check the constraints first.
</p>

<h3>A sorted matrix as one flat array</h3>
<p>
  Suppose each row of a matrix is sorted, and the first value of each row is
  larger than the last value of the row above. Read row by row, the matrix is
  one long sorted list. You do not need to build that list; you only need to
  convert a position in it back to a cell. For a matrix with <code>cols</code>
  columns, the flat index <code>k</code> lives at row
  <code>Math.floor(k / cols)</code> and column <code>k % cols</code>.
</p>
<pre><code>function searchMatrix(matrix, target) {
  if (matrix.length === 0 || matrix[0].length === 0) return false;
  const rows = matrix.length, cols = matrix[0].length;
  let lo = 0, hi = rows * cols - 1;
  while (lo &lt;= hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return true;
    if (value &lt; target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}</code></pre>
<p class="sub">
  On <code>[[1, 3, 5, 7], [10, 11, 16, 20], [23, 30, 34, 60]]</code> and target
  3, the middles are flat positions 5 (the 11), 2 (the 5), 0 (the 1), then 1
  (the 3), found. The cost is O(log(rows × cols)), which equals
  O(log rows + log cols). Use <code>Math.floor</code> for the row: without it
  <code>mid / cols</code> is a fraction in JavaScript, and indexing with a
  fraction gives <code>undefined</code>.
</p>
<p>
  The flattening works only because the whole matrix is one sorted sequence. In
  the other well-known matrix, each row and each column is sorted but rows are
  not ordered against each other, the row-by-row order is not sorted, and the
  trick is wrong. There you start at the top-right corner and walk: a value
  larger than the target means the whole column below it is too large, so move
  left; a value smaller means the rest of the row is too small, so move down.
  That is O(rows + cols), and it is not a binary search. It lives with the
  other grid techniques in <a href="/dsa/dsa-matrix-problems">matrix problems</a>.
</p>
<pre><code>function searchMatrixII(matrix, target) {
  if (matrix.length === 0 || matrix[0].length === 0) return false;
  let r = 0, c = matrix[0].length - 1;
  while (r &lt; matrix.length &amp;&amp; c >= 0) {
    const value = matrix[r][c];
    if (value === target) return true;
    if (value > target) c--;
    else r++;
  }
  return false;
}</code></pre>

<h3>The feasible(x) template: minimize the maximum</h3>
<p>
  The bananas example earlier searched for the smallest speed that works. The
  same shape covers a large family of problems whose answer reads "the smallest
  X such that it is possible to…", or "minimize the largest …". Write the
  question in two parts and keep them apart:
</p>
<ul>
  <li>
    <b>A check</b>, <code>feasible(x)</code>: given a candidate answer, a plain
    O(n) loop (usually greedy) says yes or no.
  </li>
  <li>
    <b>A search</b> over the range of possible answers, using
    <code>firstTrue</code>, valid because <code>feasible</code> is
    <em>monotone</em>: once a candidate works, every larger one works too.
  </li>
</ul>
<p>
  <b>Capacity to ship packages within D days.</b> Packages must go in order;
  each day the ship carries consecutive packages up to its capacity. What is
  the smallest capacity that gets everything shipped in D days? The check is
  greedy: load packages until the next would overflow, then start a new day, and
  count the days. A bigger ship never needs more days, so the check is monotone.
  The smallest sensible capacity is the heaviest single package (anything less
  can never carry it), and the largest needed is the total weight (one day).
</p>
<pre><code>function shipWithinDays(weights, days) {
  const daysNeeded = (capacity) => {
    let used = 1, load = 0;
    for (const w of weights) {
      if (load + w > capacity) {
        used++;
        load = 0;
      }
      load += w;
    }
    return used;
  };

  let lo = Math.max(...weights);
  let hi = weights.reduce((sum, w) => sum + w, 0);
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (daysNeeded(mid) &lt;= days) hi = mid;      <span class="c">// mid works: try smaller</span>
    else lo = mid + 1;                          <span class="c">// mid is too small</span>
  }
  return lo;
}</code></pre>
<table>
  <tr><th>lo</th><th>hi</th><th>capacity tried</th><th>days needed</th><th>enough for 5 days?</th></tr>
  <tr><td>10</td><td>55</td><td>32</td><td>2</td><td>yes, hi = 32</td></tr>
  <tr><td>10</td><td>32</td><td>21</td><td>3</td><td>yes, hi = 21</td></tr>
  <tr><td>10</td><td>21</td><td>15</td><td>5</td><td>yes, hi = 15</td></tr>
  <tr><td>10</td><td>15</td><td>12</td><td>6</td><td>no, lo = 13</td></tr>
  <tr><td>13</td><td>15</td><td>14</td><td>6</td><td>no, lo = 15</td></tr>
</table>
<p class="sub">
  The weights are <code>[1, 2, …, 10]</code> and D = 5, giving capacity
  <b>15</b>. Each check is O(n) and the search needs about
  <code>log₂(sum − max)</code> rounds, so the time is O(n log(sum)) and the
  space is O(1).
</p>
<p>
  <b>Split array largest sum</b> is the same problem in different clothes: cut
  an array into <code>k</code> consecutive pieces so that the largest piece sum
  is as small as possible. "Pieces needed for a given limit" replaces "days
  needed for a given capacity", and it is the same greedy loop. (Assume
  <code>k</code> is at most the array length; using fewer pieces than
  <code>k</code> is fine, because a piece can always be split further without
  raising the maximum.)
</p>
<pre><code>function splitArray(nums, k) {
  const piecesNeeded = (limit) => {
    let pieces = 1, sum = 0;
    for (const x of nums) {
      if (sum + x > limit) {
        pieces++;
        sum = 0;
      }
      sum += x;
    }
    return pieces;
  };

  let lo = Math.max(...nums);
  let hi = nums.reduce((total, x) => total + x, 0);
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (piecesNeeded(mid) &lt;= k) hi = mid;
    else lo = mid + 1;
  }
  return lo;
}</code></pre>
<p>
  <b>Maximize the minimum</b> flips the direction. Place <code>m</code> balls
  in baskets at the given positions so that the smallest gap between any two
  balls is as large as possible. A bigger required gap is harder, so
  <code>canPlace(gap)</code> goes from true to false, and you want the last
  true: the mirror form with the upper middle.
</p>
<pre><code>function maxMinGap(positions, m) {
  const p = positions.slice().sort((a, b) => a - b);
  const canPlace = (gap) => {
    let placed = 1, last = p[0];
    for (let i = 1; i &lt; p.length; i++) {
      if (p[i] - last >= gap) {
        placed++;
        last = p[i];
      }
    }
    return placed >= m;
  };

  let lo = 1, hi = p[p.length - 1] - p[0];
  while (lo &lt; hi) {
    const mid = lo + Math.ceil((hi - lo) / 2);   <span class="c">// upper middle: lo = mid must make progress</span>
    if (canPlace(mid)) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}</code></pre>
<p class="sub">
  This assumes distinct integer positions and <code>2 &lt;= m &lt;= n</code>;
  with those, a gap of 1 is always possible, so <code>lo = 1</code> is a safe
  start. For positions <code>[1, 2, 3, 4, 7]</code> and <code>m = 3</code> the
  gaps tried are 4 (no), 2 (yes), 3 (yes), giving 3 (balls at 1, 4 and 7). How
  to recognise the family: the answer is a number, a check on one candidate is
  easy, and the words "minimum possible largest", "maximum possible smallest" or
  "at least … at most" appear.
</p>
<div class="warn">
  <span class="ttl">⚠ Bounds and monotonicity decide everything</span>
  <ul style="margin:6px 0 0">
    <li>A <code>lo</code> below the heaviest package (say 1) lets the greedy
      check accept a capacity that cannot carry it, because the check quietly
      counts an overweight package as an ordinary day. With weights
      <code>[10, 1]</code> and 3 days the search would return 1. A
      <code>hi</code> that is too small excludes the answer. Reason about
      both ends before coding.</li>
    <li>Say <em>why</em> the check is monotone in one sentence. If you cannot,
      binary search may not apply.</li>
    <li>The check must be <em>exactly</em> right for a given candidate. A
      greedy that is only approximately right makes the search converge on the
      wrong value, with no error.</li>
  </ul>
</div>

<h3>Real-valued search and square roots</h3>
<p>
  Binary search also works when the answer is not an integer. The integer
  square root, the largest <code>r</code> with <code>r * r &lt;= x</code>, is
  the "last true" form:
</p>
<pre><code>function integerSqrt(x) {
  let lo = 0, hi = x;
  while (lo &lt; hi) {
    const mid = lo + Math.ceil((hi - lo) / 2);
    if (mid * mid &lt;= x) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}</code></pre>
<p class="sub">
  For <code>x = 40</code> the middles are 20, 10, 5, 7 and 6, ending at 6
  (6 × 6 = 36, 7 × 7 = 49). In JavaScript <code>mid * mid</code> is exact up to
  2<sup>53</sup>, and beyond that it is rounded, yet still larger than any
  <code>x</code> below 2<sup>53</sup>, so the comparison stays right. In a
  language with fixed-width integers the same product can overflow, which is
  why you will see the comparison written <code>mid &lt;= x / mid</code> or
  with a wider type.
</p>
<p>
  For a real-valued root, shrink the interval instead of looking for a boundary
  index, and decide how to stop. A tolerance loop such as
  <code>while (hi - lo &gt; 1e-9)</code> looks natural and can hang: for large
  values, adjacent doubles are further apart than <code>1e-9</code> (near
  <code>1e15</code> the gap is 0.125), so the width can never get below the
  tolerance. A fixed number of halvings always ends.
</p>
<pre><code>function sqrtReal(x) {                       <span class="c">// x >= 0</span>
  let lo = 0, hi = Math.max(1, x);           <span class="c">// the root of x &lt; 1 is larger than x</span>
  for (let i = 0; i &lt; 100; i++) {
    const mid = (lo + hi) / 2;
    if (mid * mid &lt;= x) lo = mid;
    else hi = mid;
  }
  return lo;
}</code></pre>
<p class="sub">
  100 halvings shrink the starting width by a factor of 2<sup>100</sup>, far
  below what a double can resolve for any <code>x</code> up to about
  10<sup>28</sup>, so the loop settles on the closest representable values. For
  a much larger <code>x</code> the starting width is too big for 100 halvings,
  and you would use more. <code>sqrtReal(2)</code> gives
  <code>1.414213562373095</code>, and the answer is correct to about the last
  digit; do not compare real-valued results with <code>===</code>, compare
  within a tolerance.
</p>

<h3>Find the duplicate by searching the value range</h3>
<p>
  An array of <code>n + 1</code> integers holds values from 1 to <code>n</code>,
  so by pigeonhole at least one value repeats. Find a repeated value without
  modifying the array and with O(1) extra space. Sorting would change it; a
  <code>Set</code> would use O(n) space. The array is not sorted, but the
  <em>values</em> are a range, and a count tells you which half of the range
  holds a duplicate.
</p>
<p>
  Pick <code>mid</code> in the value range and count how many elements are at
  most <code>mid</code>. If the count is greater than <code>mid</code>, the
  values 1 … mid are too crowded: there are only <code>mid</code> distinct
  values to go round, so a duplicate lies in <code>[1, mid]</code>. If the count
  is at most <code>mid</code>, then more than <code>n - mid</code> elements are
  above <code>mid</code>, and only <code>n - mid</code> distinct values live
  there, so a duplicate lies in <code>[mid + 1, n]</code>.
</p>
<pre><code>function findDuplicate(nums) {
  let lo = 1, hi = nums.length - 1;
  while (lo &lt; hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    let count = 0;
    for (const x of nums) if (x &lt;= mid) count++;
    if (count > mid) hi = mid;            <span class="c">// too many values in [1, mid]: a duplicate is there</span>
    else lo = mid + 1;
  }
  return lo;
}</code></pre>
<table>
  <tr><th>lo</th><th>hi</th><th>mid</th><th>elements ≤ mid</th><th>more than mid?</th><th>action</th></tr>
  <tr><td>1</td><td>4</td><td>2</td><td>3 (1, 2, 2)</td><td>yes</td><td>hi = 2</td></tr>
  <tr><td>1</td><td>2</td><td>1</td><td>1 (just the 1)</td><td>no</td><td>lo = 2, answer <b>2</b></td></tr>
</table>
<p class="sub">
  This is <code>[1, 3, 4, 2, 2]</code>. Each round scans the array, and there
  are about <code>log₂ n</code> rounds, so the time is O(n log n) with O(1)
  space. There is also an O(n) route: treat the array as a linked list in which
  index <code>i</code> points to <code>nums[i]</code>. The repeated value is
  where two indices point at the same node, which is the entrance of a cycle,
  found with the fast and slow pointers from
  <a href="/dsa/dsa-two-pointers">two pointers</a>.
</p>
<pre><code>function findDuplicateFloyd(nums) {
  let slow = nums[0], fast = nums[nums[0]];
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[nums[fast]];
  }
  slow = 0;
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}</code></pre>

<h3>Median of two sorted arrays: search the partition</h3>
<p>
  Given two sorted arrays, find the median of all their elements together in
  O(log(min(m, n))). Merging them is O(m + n). The faster way uses the idea that
  the median is a <b>cut</b>: a split of the combined elements into a left part
  and a right part of the right size, where everything on the left is no larger
  than everything on the right.
</p>
<p>
  Cut the shorter array <code>A</code> at position <code>i</code>, so
  <code>A[0..i)</code> goes left, and cut the longer array <code>B</code> at
  <code>j = half - i</code>, where <code>half = floor((m + n + 1) / 2)</code> is
  the size the left part should have. Choosing <code>i</code> fixes
  <code>j</code>, so the search is over one number. The cut is correct when the
  largest element on each side of the left part does not exceed the smallest on
  the right part. Because each array is already sorted internally, only two
  cross-checks are needed: <code>A[i-1] &lt;= B[j]</code> and
  <code>B[j-1] &lt;= A[i]</code>.
</p>
<ul>
  <li>If <code>A[i-1] &gt; B[j]</code>, you took too much from <code>A</code>: move <code>i</code> left.</li>
  <li>If <code>B[j-1] &gt; A[i]</code>, you took too little from <code>A</code>: move <code>i</code> right.</li>
  <li>Otherwise the cut is valid. The median is the larger of the two left maxima when <code>m + n</code> is odd, or the average of that and the smaller of the two right minima when it is even.</li>
</ul>
<pre><code>function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length + nums2.length === 0) throw new RangeError("the median of no values is undefined");
  let A = nums1, B = nums2;
  if (A.length > B.length) [A, B] = [B, A];     <span class="c">// search the shorter array</span>
  const m = A.length, n = B.length;
  const half = Math.floor((m + n + 1) / 2);

  let lo = 0, hi = m;
  while (lo &lt;= hi) {
    const i = lo + Math.floor((hi - lo) / 2);
    const j = half - i;
    const aLeft = i > 0 ? A[i - 1] : -Infinity;
    const aRight = i &lt; m ? A[i] : Infinity;
    const bLeft = j > 0 ? B[j - 1] : -Infinity;
    const bRight = j &lt; n ? B[j] : Infinity;

    if (aLeft > bRight) hi = i - 1;
    else if (bLeft > aRight) lo = i + 1;
    else {
      const leftMax = Math.max(aLeft, bLeft);
      if ((m + n) % 2 === 1) return leftMax;
      return (leftMax + Math.min(aRight, bRight)) / 2;
    }
  }
  throw new Error("the arrays are not sorted");
}</code></pre>
<table>
  <tr><th>lo</th><th>hi</th><th>i</th><th>j</th><th>A left | right</th><th>B left | right</th><th>verdict</th></tr>
  <tr><td>0</td><td>5</td><td>2</td><td>4</td><td>3 | 8</td><td>19 | 21</td><td>19 &gt; 8: take more from A, lo = 3</td></tr>
  <tr><td>3</td><td>5</td><td>4</td><td>2</td><td>9 | 15</td><td>11 | 18</td><td>9 ≤ 18 and 11 ≤ 15: valid cut</td></tr>
</table>
<p class="sub">
  This is <code>A = [1, 3, 8, 9, 15]</code> and
  <code>B = [7, 11, 18, 19, 21, 25]</code>: eleven elements, <code>half = 6</code>.
  The left part is <code>{1, 3, 8, 9}</code> and <code>{7, 11}</code>, its
  largest value is 11, and since the total is odd the median is
  <b>11</b>. The sentinels <code>±Infinity</code> handle cuts at the very
  start or end of either array, so there are no special cases. Searching the
  shorter array is not only about speed: with <code>m &lt;= n</code>,
  <code>j = half - i</code> always lands in <code>[0, n]</code>. If you search
  the longer one, <code>j</code> can go negative.
</p>

<h3>Which template for which question</h3>
<table>
  <tr><th>The question looks like</th><th>Form</th><th>What you search over</th></tr>
  <tr><td>Is x in the sorted array? At which index?</td><td>exact value, <code>lo &lt;= hi</code></td><td>indices</td></tr>
  <tr><td>First index at least x; insertion point; how many are smaller</td><td><code>firstTrue</code> (lower bound)</td><td>indices, <code>hi = n</code></td></tr>
  <tr><td>First and last occurrence; count of x</td><td>two boundary searches</td><td>indices</td></tr>
  <tr><td>Rotated array: minimum, or find a value</td><td>compare with an end; test which half is sorted</td><td>indices</td></tr>
  <tr><td>Any peak; first bad version; where a pattern flips</td><td><code>firstTrue</code> on a local comparison</td><td>indices</td></tr>
  <tr><td>Smallest X such that something is possible</td><td><code>firstTrue</code> with a greedy check</td><td>candidate answers</td></tr>
  <tr><td>Largest X such that something is possible</td><td><code>lastTrue</code> (upper middle)</td><td>candidate answers</td></tr>
  <tr><td>Root, square root, real-valued answer</td><td>fixed number of halvings</td><td>real numbers</td></tr>
  <tr><td>Duplicate in a range of values, k-th in a value range</td><td>count at most mid, compare with mid</td><td>values</td></tr>
  <tr><td>Median or k-th of two sorted arrays</td><td>search the cut in the shorter array</td><td>cut positions</td></tr>
</table>

<h3>Pitfalls that cost offers</h3>
<ul>
  <li>
    <b>A loop that never ends.</b> <code>lo = mid</code> with the lower middle
    hangs at a range of two. Pair <code>lo = mid</code> with the upper middle,
    or use <code>lo = mid + 1</code>.
  </li>
  <li>
    <b>Mixing forms.</b> <code>hi = nums.length - 1</code> with
    <code>hi = mid</code> and <code>lo &lt; hi</code> skips the case where the
    answer is one past the end; <code>hi = nums.length</code> with
    <code>lo &lt;= hi</code> reads <code>nums[nums.length]</code>. Write the
    promise of <code>[lo, hi]</code> first.
  </li>
  <li>
    <b>Reading past the end.</b> Check <code>first === nums.length</code>
    before using <code>nums[first]</code> after a lower bound.
  </li>
  <li>
    <b>Searching something that is not monotone.</b> Say, in one sentence,
    what is true on the left of the answer and what is false on the right. If
    you cannot, a different technique is needed.
  </li>
  <li>
    <b>Wrong bounds for the answer search.</b> The smallest feasible value and
    the largest possible value must both be inside <code>[lo, hi]</code>.
  </li>
  <li>
    <b>Duplicates in rotated arrays.</b> The comparison with the end can be a
    tie; plan for the O(n) worst case instead of pretending it is O(log n).
  </li>
  <li>
    <b>Floating-point loops with a fixed tolerance.</b> Use a fixed number of
    iterations, and compare results within a tolerance.
  </li>
  <li>
    <b>Overflow in other languages.</b> <code>(lo + hi) / 2</code> and
    <code>mid * mid</code> both can; use <code>lo + (hi - lo) / 2</code> and a
    wider type.
  </li>
</ul>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Data is sorted, or the answer space is monotonic ("if X works, does X+1 also work?")</li>
  <li>The prompt says "minimum/maximum value such that…"</li>
  <li>A brute force would try every candidate linearly — O(n) or O(n·check)</li>
  <li>You can write a fast "does this candidate work?" check — that check
    becomes the comparison inside the binary search</li>
  <li>The prompt wants a boundary: the first or last position, an insertion point, "the first bad", or a count of elements below a value</li>
  <li>An array was rotated, or has a single peak, or has one local structure that tells you which side to keep even though it is not sorted</li>
  <li>"Minimize the largest" or "maximize the smallest" over a split, a capacity or a distance, with a greedy check for one candidate</li>
  <li>A real-valued answer, a square root, or "the k-th / median of two sorted arrays" in logarithmic time</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write the <code>lo &lt;= hi</code> template from memory, including the overflow-safe mid calculation.</li>
    <li>Trace <code>binarySearch</code> on a new sorted array by hand, stating <code>lo</code>, <code>hi</code>, and <code>mid</code> at each step.</li>
    <li>Explain "binary search on the answer" — what property of the answer space it actually needs (monotonic, not necessarily sorted input).</li>
    <li>Write <code>lowerBound</code> and explain why its loop uses <code>hi = nums.length</code> instead of <code>nums.length - 1</code>.</li>
    <li>Given a new problem, recognize whether "does X work?" is monotonic in X — before assuming the input itself needs to be sorted.</li>
    <li>For each of the three loop forms, state what <code>[lo, hi]</code> promises, what each branch keeps, and why the range shrinks.</li>
    <li>Explain why <code>lo = mid</code> needs the upper middle, using a range of two elements.</li>
    <li>Write <code>upperBound</code>, and get the first position, last position and count of a value from the two bounds.</li>
    <li>Say which half of a rotated array is sorted and how that decides the move, and what changes with duplicates.</li>
    <li>Turn "minimize the largest" or "maximize the smallest" into a <code>feasible(x)</code> check plus a bounded search, and justify <code>lo</code> and <code>hi</code>.</li>
    <li>Explain the cut that makes a median of two sorted arrays valid, and why you search the shorter array.</li>
  </ul>
</div>`,
};
