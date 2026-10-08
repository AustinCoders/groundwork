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
    const mid = lo + Math.floor((hi - lo) / 2); <span class="c">// avoids overflow, same as (lo+hi)>>1 in JS</span>
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
    <li><code>mid = (lo + hi) / 2</code> can integer-overflow in other
      languages (not JS, but say it right anyway) — the
      <code>lo + (hi - lo) / 2</code> form is the safe habit.</li>
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


<h3>See the range collapse</h3>
<p>Step through the search and watch the range collapse. Ten candidates become one in four comparisons — and the count of comparisons is just how many times you can halve the array.</p>

<div data-play="binary-search"></div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Data is sorted, or the answer space is monotonic ("if X works, does X+1 also work?")</li>
  <li>The prompt says "minimum/maximum value such that…"</li>
  <li>A brute force would try every candidate linearly — O(n) or O(n·check)</li>
  <li>You can write a fast "does this candidate work?" check — that check
    becomes the comparison inside the binary search</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write the <code>lo &lt;= hi</code> template from memory, including the overflow-safe mid calculation.</li>
    <li>Trace <code>binarySearch</code> on a new sorted array by hand, stating <code>lo</code>, <code>hi</code>, and <code>mid</code> at each step.</li>
    <li>Explain "binary search on the answer" — what property of the answer space it actually needs (monotonic, not necessarily sorted input).</li>
    <li>Write <code>lowerBound</code> and explain why its loop uses <code>hi = nums.length</code> instead of <code>nums.length - 1</code>.</li>
    <li>Given a new problem, recognize whether "does X work?" is monotonic in X — before assuming the input itself needs to be sorted.</li>
  </ul>
</div>`,
};
