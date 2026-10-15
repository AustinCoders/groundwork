import type { Chapter } from "../types";

export const dsaTwoPointers: Chapter = {
  id: "dsa-two-pointers",
  num: "B6",
  title: "Two pointers",
  short: "Two pointers",
  levels: ["beginner"],
  prerequisites: ["dsa-arrays-strings"],
  practice: [
    "ex-sort-colors",
    "ex-next-permutation",
    "ex-trapping-rain-water",
    "ex-container-with-most-water",
    "ex-valid-palindrome",
    "ex-longest-palindromic-substring",
    "ex-two-sum-sorted",
    "ex-three-sum",
    "ex-four-sum",
    "ex-squares-of-sorted-array",
    "ex-backspace-string-compare",
    "ex-merge-two-sorted-arrays",
    "ex-three-sum-closest",
    "ex-k-sum",
    "ex-valid-palindrome-ii",
    "ex-remove-duplicates-ii",
    "ex-partition-around-pivot",
    "ex-count-palindromic-substrings",
    "ex-boats-to-save-people",
    "ex-is-subsequence",
    "ex-move-zeroes",
    "ex-merge-sorted-array",
    "ex-middle-of-linked-list",
    "ex-linked-list-has-cycle",
    "ex-linked-list-cycle-start",
  ],
  ready: true,
  subtitle: "One pass, two positions — how an O(n²) search collapses to O(n).",
  body: `<h3>The shape of the pattern</h3>
<p>
  Two pointers means walking a structure with <b>two indices instead of
  nested loops</b>. Whenever you're tempted to check every pair
  (<code>i</code>, <code>j</code>) against each other, ask: does the data
  have an order I can exploit so the pointers only ever move forward, never
  backward? If yes, two pointers turns O(n²) pair-checking into a single
  O(n) pass.
</p>

<h3>Variant 1 — opposite ends, closing inward</h3>
<p>Used on sorted arrays where you need a pair that satisfies some condition.</p>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="Two pointers starting at opposite ends of a sorted array and moving toward each other">
    <g class="rough">
      <rect class="box" x="20" y="50" width="70" height="50" />
      <rect class="box" x="90" y="50" width="70" height="50" />
      <rect class="box" x="160" y="50" width="70" height="50" />
      <rect class="box" x="230" y="50" width="70" height="50" />
      <rect class="box" x="300" y="50" width="70" height="50" />
      <rect class="box" x="370" y="50" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="80" text-anchor="middle">2</text>
    <text class="sm" x="125" y="80" text-anchor="middle">7</text>
    <text class="sm" x="195" y="80" text-anchor="middle">11</text>
    <text class="sm" x="265" y="80" text-anchor="middle">15</text>
    <text class="sm" x="335" y="80" text-anchor="middle">18</text>
    <text class="sm" x="405" y="80" text-anchor="middle">24</text>
    <text class="lbl rd" x="55" y="30" text-anchor="middle" style="font-size:16px">↓ left</text>
    <text class="lbl rd" x="405" y="30" text-anchor="middle" style="font-size:16px">right ↓</text>
    <text class="sm" x="440" y="80">→ close inward</text>
  </svg>
  <figcaption>sum too small → move left right; sum too big → move right left.</figcaption>
</figure>
<div data-code="two-pointers-opposite-ends"><pre><code><span class="c">// Two Sum on a SORTED array — O(n) time, O(1) space</span>
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;   <span class="c">// need bigger → drop the smaller end</span>
    else right--;               <span class="c">// need smaller → drop the bigger end</span>
  }
  return [-1, -1];
}</code></pre></div>
<p class="sub">
  Why this is correct, not just fast: because the array is sorted, moving
  <code>left</code> past the current value can never re-find a pair we
  already ruled out — every skipped pair genuinely can't work.
</p>

<h4>Dry run: twoSumSorted([2, 7, 11, 15, 18, 24], 22)</h4>
<table>
  <tr><th>step</th><th>left</th><th>right</th><th>nums[left]+nums[right]</th><th>compare to 22</th><th>move</th></tr>
  <tr><td>1</td><td>0 (2)</td><td>5 (24)</td><td>26</td><td>too big</td><td>right−−</td></tr>
  <tr><td>2</td><td>0 (2)</td><td>4 (18)</td><td>20</td><td>too small</td><td>left++</td></tr>
  <tr><td>3</td><td>1 (7)</td><td>4 (18)</td><td>25</td><td>too big</td><td>right−−</td></tr>
  <tr><td>4</td><td>1 (7)</td><td>3 (15)</td><td>22</td><td><b>match</b></td><td>return [1, 3]</td></tr>
</table>
<p class="sub">
  Six elements, but only four comparisons — each one eliminates an entire
  end of the remaining range, not just one element. That's the O(n)
  behavior: the pointers together take at most n steps total to meet.
</p>

<h3>Variant 2 — fast/slow, same direction</h3>
<p>
  Both pointers start at the same end but move at different rates (or one
  waits while the other scans). This is the shape behind removing
  duplicates in place, partitioning, and cycle detection in linked lists.
</p>
<pre><code><span class="c">// remove duplicates from a SORTED array, in place — O(n) time, O(1) space</span>
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0; <span class="c">// slow = last confirmed-unique position</span>
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1; <span class="c">// count of unique elements</span>
}</code></pre>

<h3>Variant 3 — palindrome / mirror check</h3>
<pre><code>function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}</code></pre>

<div class="warn">
  <span class="ttl">⚠ Two pointers needs an exploitable order</span>
  The opposite-ends variant only works because the array is sorted — try
  it on unsorted data and it silently gives wrong answers, not an error.
  If the input isn't sorted and sorting it doesn't destroy needed
  information (like original indices), sort first — O(n log n) to enable
  an O(n) pass is still a huge win over O(n²).
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "The array's sorted, so I can
  use two pointers closing inward — each comparison eliminates one end
  entirely instead of comparing every pair, which is what gets this from
  O(n²) down to O(n)."
</div>

<h3>Container with most water: proving the move is safe</h3>
<p>
  You are given the heights of <code>n</code> vertical lines. Pick two of
  them; together with the x-axis they hold water as deep as the
  <b>shorter</b> line and as wide as the gap between their indices. Find the
  largest area. Checking every pair is O(n²).
</p>
<p>
  Start with the widest container, the two ends. Every other container is
  narrower, so to beat the one you hold it needs a taller wall, and the wall
  that limits you is the shorter one. Now look at what a move does. Moving
  the <em>taller</em> wall inward shrinks the width by one and leaves the
  shorter wall in charge, so the area cannot grow. Moving the
  <em>shorter</em> wall inward also costs width, but it is the only move that
  can find something taller. That says which pointer to move. The next step
  is to show it throws nothing useful away.
</p>
<div class="sticky mint">
  <span class="ttl">Why discarding the shorter wall is safe</span>
  Say <code>height[left] &lt;= height[right]</code>. Take any container that
  keeps <code>left</code> as its left wall and puts its right wall at some
  <code>r'</code> below <code>right</code>. It is narrower, and its height is
  capped by <code>height[left]</code>, so its area is at most
  <code>height[left] * (right - left)</code>, which is exactly the area you
  just measured. Every container that uses <code>left</code> and a smaller
  right wall is therefore no better than one you already recorded, so
  <code>left</code> has nothing left to offer and can be dropped. With equal
  heights either side can be dropped.
</div>
<pre><code>function maxArea(height) {
  let left = 0, right = height.length - 1, best = 0;
  while (left &lt; right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    best = Math.max(best, area);
    if (height[left] &lt; height[right]) left++;  <span class="c">// the shorter wall limits us: drop it</span>
    else right--;                              <span class="c">// equal or taller on the left: drop the right</span>
  }
  return best;
}</code></pre>

<h4>Dry run: maxArea([1, 8, 6, 2, 5, 4, 8, 3, 7])</h4>
<table>
  <tr><th>left (h)</th><th>right (h)</th><th>width</th><th>area</th><th>best</th><th>move</th></tr>
  <tr><td>0 (1)</td><td>8 (7)</td><td>8</td><td>8</td><td>8</td><td>left++ (1 is shorter)</td></tr>
  <tr><td>1 (8)</td><td>8 (7)</td><td>7</td><td><b>49</b></td><td>49</td><td>right−−</td></tr>
  <tr><td>1 (8)</td><td>7 (3)</td><td>6</td><td>18</td><td>49</td><td>right−−</td></tr>
  <tr><td>1 (8)</td><td>6 (8)</td><td>5</td><td>40</td><td>49</td><td>right−− (equal: either side)</td></tr>
  <tr><td>1 (8)</td><td>5 (4)</td><td>4</td><td>16</td><td>49</td><td>right−−</td></tr>
  <tr><td>1 (8)</td><td>4 (5)</td><td>3</td><td>15</td><td>49</td><td>right−−</td></tr>
  <tr><td>1 (8)</td><td>3 (2)</td><td>2</td><td>4</td><td>49</td><td>right−−</td></tr>
  <tr><td>1 (8)</td><td>2 (6)</td><td>1</td><td>6</td><td>49</td><td>right−−, pointers meet</td></tr>
</table>
<p class="sub">
  Eight steps for nine lines, and every step discarded one index. That is
  O(n) time and O(1) space. The best container, 49, is the pair of lines of
  height 8 and 7, found on the second step; the rest of the scan only proves
  nothing beats it.
</p>
<div class="warn">
  <span class="ttl">⚠ Moving the taller wall is the bug interviewers wait for</span>
  "Move whichever pointer sees the bigger number" feels natural and is wrong:
  the area is capped by the shorter wall, so the taller wall can never be the
  reason a container improves. If you cannot say <em>why</em> the move is
  safe, say the argument above out loud; it is the whole point of the
  question.
</div>

<h3>3Sum: sort, fix one, scan the rest</h3>
<p>
  Find every <b>unique</b> triplet in the array that adds up to zero. The
  brute force tries every triple, O(n³), and then has to remove repeated
  triplets, which usually means building strings or sets of them. Two
  pointers removes both costs.
</p>
<p>
  Sort first. Now fix the smallest element of the triplet at position
  <code>i</code>. What remains is a question you already solved: find two
  values in the sorted part to the right of <code>i</code> that add up to
  <code>-a[i]</code>. That is <code>twoSumSorted</code>, an O(n) scan. Running
  it once per <code>i</code> gives O(n²) in total, and sorting costs only
  O(n log n) on top.
</p>
<p>
  Sorting also makes duplicates easy, because equal values sit next to each
  other. There are three places a repeated triplet can sneak in, and each has
  its own guard:
</p>
<ul>
  <li>
    <b>The fixed value.</b> If <code>a[i] === a[i - 1]</code>, skip
    <code>i</code>. The earlier iteration already found every triplet whose
    smallest element has that value, including those that use the second copy
    as <code>lo</code>. Compare with the <em>previous</em> element, not the
    next one: comparing with the next would skip <code>[-1, -1, 2]</code>.
  </li>
  <li>
    <b>The left pointer.</b> After a hit, move <code>lo</code> past every copy
    of the value you just used.
  </li>
  <li>
    <b>The right pointer.</b> Do the same for <code>hi</code>.
  </li>
</ul>
<pre><code><span class="c">// O(n²) time after an O(n log n) sort; O(n) for the sorted copy</span>
function threeSum(nums) {
  const a = nums.slice().sort((x, y) => x - y);  <span class="c">// numeric sort: the default one compares strings</span>
  const out = [];
  for (let i = 0; i &lt; a.length - 2; i++) {
    if (a[i] > 0) break;                         <span class="c">// the smallest is positive, so every sum is positive</span>
    if (i > 0 &amp;&amp; a[i] === a[i - 1]) continue;   <span class="c">// same fixed value as last time</span>
    let lo = i + 1, hi = a.length - 1;
    while (lo &lt; hi) {
      const sum = a[i] + a[lo] + a[hi];
      if (sum &lt; 0) lo++;
      else if (sum > 0) hi--;
      else {
        out.push([a[i], a[lo], a[hi]]);
        lo++;
        hi--;
        while (lo &lt; hi &amp;&amp; a[lo] === a[lo - 1]) lo++;   <span class="c">// step past copies of the value just used</span>
        while (lo &lt; hi &amp;&amp; a[hi] === a[hi + 1]) hi--;
      }
    }
  }
  return out;
}</code></pre>

<h4>Dry run: threeSum([-1, 0, 1, 2, -1, -4])</h4>
<p class="sub">Sorted copy: <code>[-4, -1, -1, 0, 1, 2]</code>.</p>
<table>
  <tr><th>i (a[i])</th><th>lo (value)</th><th>hi (value)</th><th>sum</th><th>action</th></tr>
  <tr><td>0 (−4)</td><td>1 (−1)</td><td>5 (2)</td><td>−3</td><td>too small, lo++</td></tr>
  <tr><td>0 (−4)</td><td>2 (−1)</td><td>5 (2)</td><td>−3</td><td>too small, lo++</td></tr>
  <tr><td>0 (−4)</td><td>3 (0)</td><td>5 (2)</td><td>−2</td><td>too small, lo++</td></tr>
  <tr><td>0 (−4)</td><td>4 (1)</td><td>5 (2)</td><td>−1</td><td>too small, lo++, pointers meet</td></tr>
  <tr><td>1 (−1)</td><td>2 (−1)</td><td>5 (2)</td><td>0</td><td><b>record [−1, −1, 2]</b>, lo++, hi−−</td></tr>
  <tr><td>1 (−1)</td><td>3 (0)</td><td>4 (1)</td><td>0</td><td><b>record [−1, 0, 1]</b>, lo++, hi−−, pointers cross</td></tr>
  <tr><td>2 (−1)</td><td colspan="2">same as the previous fixed value</td><td>—</td><td>skip this i</td></tr>
  <tr><td>3 (0)</td><td>4 (1)</td><td>5 (2)</td><td>3</td><td>too big, hi−−, pointers meet</td></tr>
</table>
<p class="sub">
  The answer is <code>[[-1, -1, 2], [-1, 0, 1]]</code>. Without the skip at
  <code>i = 2</code>, that iteration would find
  <code>[-1, 0, 1]</code> a second time.
</p>
<div class="warn">
  <span class="ttl">⚠ Four ways 3Sum goes wrong</span>
  <ul style="margin:6px 0 0">
    <li><code>nums.sort()</code> with no comparator sorts as strings:
      <code>[10, 9, 1].sort()</code> gives <code>[1, 10, 9]</code>, and the
      scan then misbehaves. Pass <code>(x, y) =&gt; x - y</code>.</li>
    <li>Skipping repeated values before you have used them, or comparing the
      fixed value with the next element instead of the previous one, drops
      valid triplets such as <code>[-1, -1, 2]</code>.</li>
    <li>Forgetting the <code>lo &lt; hi</code> guard inside the two skip loops
      lets a pointer run past the other or off the array.</li>
    <li><code>nums.sort(...)</code> sorts the caller's array in place. Copy
      first when the caller may care about the original order.</li>
  </ul>
</div>

<h3>k-Sum and 3Sum closest: the same scan, generalised</h3>
<p>
  4Sum is 3Sum with one more fixed value, and 5Sum with one more still. The
  pattern is a recursion: for <code>k &gt; 2</code>, fix one value and ask
  for a <code>(k - 1)</code>-sum on what remains to its right; at
  <code>k = 2</code>, run the two-pointer scan. Each level is a loop with the
  same duplicate guard on the fixed value, so you write the guard once.
</p>
<pre><code><span class="c">// all unique k-tuples (k >= 2) summing to target; O(n^(k-1)) after the sort</span>
function kSum(nums, target, k) {
  const a = nums.slice().sort((x, y) => x - y);
  return collect(a, 0, target, k);
}

function collect(a, start, target, k) {
  const out = [];
  if (start + k > a.length) return out;
  if (a[start] * k > target || a[a.length - 1] * k &lt; target) return out; <span class="c">// no k values can reach it</span>

  if (k === 2) {
    let lo = start, hi = a.length - 1;
    while (lo &lt; hi) {
      const sum = a[lo] + a[hi];
      if (sum &lt; target) lo++;
      else if (sum > target) hi--;
      else {
        out.push([a[lo], a[hi]]);
        lo++;
        hi--;
        while (lo &lt; hi &amp;&amp; a[lo] === a[lo - 1]) lo++;
        while (lo &lt; hi &amp;&amp; a[hi] === a[hi + 1]) hi--;
      }
    }
    return out;
  }

  for (let i = start; i &lt; a.length - k + 1; i++) {
    if (i > start &amp;&amp; a[i] === a[i - 1]) continue;
    for (const rest of collect(a, i + 1, target - a[i], k - 1)) out.push([a[i], ...rest]);
  }
  return out;
}</code></pre>
<p class="sub">
  The early exit is a bound, not a heuristic: the smallest possible sum of
  <code>k</code> values taken from <code>a[start..]</code> is
  <code>k * a[start]</code>, and the largest is
  <code>k * a[a.length - 1]</code>. If the target lies outside that range, no
  tuple exists. The time is O(n<sup>k−1</sup>): each added level multiplies the
  work by n, and the two-pointer base replaces the last loop. Say that
  number aloud; it is what separates "I know 4Sum" from "I know the family".
</p>
<p>
  <b>3Sum closest</b> asks for the triple whose sum is nearest to the target.
  The scan is identical, except that you no longer wait for an exact match.
  Keep the best sum seen so far, and move the pointer that brings the sum
  toward the target.
</p>
<pre><code><span class="c">// needs at least 3 numbers; O(n²)</span>
function threeSumClosest(nums, target) {
  const a = nums.slice().sort((x, y) => x - y);
  let best = a[0] + a[1] + a[2];
  for (let i = 0; i &lt; a.length - 2; i++) {
    let lo = i + 1, hi = a.length - 1;
    while (lo &lt; hi) {
      const sum = a[i] + a[lo] + a[hi];
      if (Math.abs(sum - target) &lt; Math.abs(best - target)) best = sum;
      if (sum === target) return sum;
      if (sum &lt; target) lo++;
      else hi--;
    }
  }
  return best;
}</code></pre>
<p class="sub">
  No duplicate guards are needed, because the function returns one number,
  not a list of triplets; repeated work only costs time, and the sorted scan
  is already O(n²).
</p>

<h3>Trapping rain water: three ways to the same answer</h3>
<p>
  After rain, how much water sits on top of an elevation map given as an
  array of non-negative bar heights? Think one column at a time. The water
  above bar <code>i</code> rises to the lower of the tallest bar on its left
  and the tallest bar on its right (each counting bar <code>i</code> itself),
  so the water in that column is
  <code>min(maxLeft, maxRight) - height[i]</code>.
</p>
<p>
  <b>Version 1: precompute both maxima.</b> Two passes fill
  <code>leftMax[]</code> and <code>rightMax[]</code>; a third adds up the
  columns. It is the easiest to get right and is O(n) time with O(n) space.
</p>
<pre><code>function trapWithArrays(height) {
  const n = height.length;
  if (n === 0) return 0;
  const leftMax = new Array(n), rightMax = new Array(n);
  leftMax[0] = height[0];
  for (let i = 1; i &lt; n; i++) leftMax[i] = Math.max(leftMax[i - 1], height[i]);
  rightMax[n - 1] = height[n - 1];
  for (let i = n - 2; i >= 0; i--) rightMax[i] = Math.max(rightMax[i + 1], height[i]);

  let water = 0;
  for (let i = 0; i &lt; n; i++) water += Math.min(leftMax[i], rightMax[i]) - height[i];
  return water;
}</code></pre>
<p>
  <b>Version 2: two pointers, O(1) space.</b> The arrays are only there to
  answer "which side is lower?" for one column at a time. Two pointers answer
  it without storing anything. Keep a running <code>leftMax</code> and
  <code>rightMax</code> and always advance the pointer on the <em>lower</em>
  wall.
</p>
<pre><code>function trap(height) {
  let left = 0, right = height.length - 1;
  let leftMax = 0, rightMax = 0, water = 0;
  while (left &lt; right) {
    if (height[left] &lt; height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];   <span class="c">// settled: the right side is at least as tall</span>
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}</code></pre>
<div class="sticky mint">
  <span class="ttl">Why the column on the lower side is settled</span>
  When <code>height[left] &lt; height[right]</code>, the true tallest bar to
  the right of <code>left</code> is at least <code>height[right]</code>, which
  is taller than the bar under <code>left</code>. The question is whether the
  running <code>leftMax</code> could exceed that right-hand maximum. It
  cannot: every bar <code>left</code> has already passed was lower than the
  bar at the right pointer at that moment, and the right pointer only ever
  sits on or beyond today's <code>right</code>. So the left side is the lower
  limit, and <code>leftMax - height[left]</code> is exactly the water in that
  column. The mirror argument covers the right side.
</div>

<h4>Dry run: trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])</h4>
<table>
  <tr><th>left (h)</th><th>right (h)</th><th>lower side</th><th>running max</th><th>water added</th><th>total</th></tr>
  <tr><td>0 (0)</td><td>11 (1)</td><td>left</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>1 (1)</td><td>11 (1)</td><td>right (equal)</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>1 (1)</td><td>10 (2)</td><td>left</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>2 (0)</td><td>10 (2)</td><td>left</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><td>3 (2)</td><td>10 (2)</td><td>right (equal)</td><td>2</td><td>0</td><td>1</td></tr>
  <tr><td>3 (2)</td><td>9 (1)</td><td>right</td><td>2</td><td>1</td><td>2</td></tr>
  <tr><td>3 (2)</td><td>8 (2)</td><td>right (equal)</td><td>2</td><td>0</td><td>2</td></tr>
  <tr><td>3 (2)</td><td>7 (3)</td><td>left</td><td>2</td><td>0</td><td>2</td></tr>
  <tr><td>4 (1)</td><td>7 (3)</td><td>left</td><td>2</td><td>1</td><td>3</td></tr>
  <tr><td>5 (0)</td><td>7 (3)</td><td>left</td><td>2</td><td>2</td><td>5</td></tr>
  <tr><td>6 (1)</td><td>7 (3)</td><td>left</td><td>2</td><td>1</td><td>6</td></tr>
</table>
<p class="sub">
  The pointers meet at index 7, the tallest bar, which holds no water, and the
  total is 6. Each step consumed one column, so the work is O(n) with O(1)
  extra space.
</p>
<p>
  <b>Version 3: a monotonic stack.</b> Instead of counting water column by
  column, count it in horizontal layers. Keep a stack of bar indices whose
  heights decrease from bottom to top. When a taller bar arrives, the bar on
  top of the stack is the bottom of a pocket: the stack entry beneath it is
  the left wall, the new bar is the right wall, and the layer's water is
  <code>width * (min(leftWall, rightWall) - bottom)</code>. It is also O(n)
  time with O(n) space, and it is the same pop-when-a-bigger-one-arrives idea
  you meet in <a href="/dsa/dsa-monotonic-stack-queue">monotonic stacks</a>.
</p>
<pre><code>function trapWithStack(height) {
  const stack = [];   <span class="c">// indices, heights decreasing from bottom to top</span>
  let water = 0;
  for (let i = 0; i &lt; height.length; i++) {
    while (stack.length &amp;&amp; height[i] > height[stack[stack.length - 1]]) {
      const bottom = stack.pop();
      if (stack.length === 0) break;              <span class="c">// no left wall: nothing to hold the water</span>
      const left = stack[stack.length - 1];
      const width = i - left - 1;
      water += width * (Math.min(height[left], height[i]) - height[bottom]);
    }
    stack.push(i);
  }
  return water;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "Water above a bar is the lower
  of the tallest wall on each side, minus the bar. I can precompute both
  maxima in O(n) space, or notice I only ever need the smaller one, so two
  pointers moving in from the ends on the shorter wall do it in O(1)."
</div>

<h3>Fast and slow in place: filter, keep at most two, move zeroes</h3>
<p>
  The duplicate-removal loop above is one instance of a shape worth naming.
  The <b>read</b> pointer looks at every element once. The <b>write</b> pointer
  marks the end of the part you have decided to keep. The invariant is a
  sentence you can say aloud: <em>
  <code>nums[0..write)</code> is the correct answer for
  <code>nums[0..read)</code></em>. Every in-place filter is that sentence with a
  different rule for "keep".
</p>
<pre><code><span class="c">// remove every copy of val; return the new length</span>
function removeElement(nums, val) {
  let write = 0;
  for (let read = 0; read &lt; nums.length; read++) {
    if (nums[read] !== val) nums[write++] = nums[read];
  }
  return write;
}

<span class="c">// move all zeroes to the end, keeping the order of the others</span>
function moveZeroes(nums) {
  let write = 0;
  for (let read = 0; read &lt; nums.length; read++) {
    if (nums[read] !== 0) {
      [nums[write], nums[read]] = [nums[read], nums[write]];
      write++;
    }
  }
}

<span class="c">// sorted array: keep at most k copies of each value; return the new length</span>
function keepAtMost(nums, k) {
  let write = 0;
  for (const x of nums) {
    if (write &lt; k || x !== nums[write - k]) nums[write++] = x;
  }
  return write;
}</code></pre>
<p class="sub">
  <code>keepAtMost</code> is the dedupe loop with the comparison pushed back.
  A value may be written unless the kept prefix already ends in
  <code>k</code> copies of it, which, because the prefix is sorted, is the
  same as <code>nums[write - k] === x</code>. Compare against the
  <em>written</em> prefix, not the original array: the original may already be
  overwritten. With <code>k = 1</code> this is exactly
  <code>removeDuplicates</code>; with <code>k = 2</code> it is the usual
  "remove duplicates, allow two" question.
</p>
<p>
  All three are O(n) time and O(1) space, and each element is read once. The
  <code>moveZeroes</code> swap does a pointless self-swap while
  <code>write === read</code>, which is harmless; if the interviewer cares
  about the number of writes, guard it with <code>if (write !== read)</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ The tail is not cleared</span>
  <code>removeElement</code> and <code>keepAtMost</code> leave whatever was
  after <code>write</code> exactly where it was. The returned length is the
  answer; the array's own <code>length</code> is not. Read the prompt for
  whether the tail must be zeroed or truncated, and do not use
  <code>nums.length</code> afterwards by habit.
</div>

<h3>Three-way partition: the Dutch national flag</h3>
<p>
  Sort an array that only contains 0, 1 and 2, in place, in one pass, without
  a counting pre-pass. This is the question that adds a third pointer. The
  idea is to split the array into four regions and keep each region honest:
  everything before <code>low</code> is a 0, everything from
  <code>low</code> up to <code>mid</code> is a 1, everything after
  <code>high</code> is a 2, and the stretch from <code>mid</code> to
  <code>high</code> has not been looked at yet.
</p>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="An array split into four regions: zeros up to low, ones from low to mid, an unseen region from mid to high, and twos after high">
    <g class="rough">
      <rect class="boxg" x="20" y="30" width="130" height="50" />
      <rect class="box" x="150" y="30" width="130" height="50" />
      <rect class="boxy" x="280" y="30" width="200" height="50" />
      <rect class="boxg" x="480" y="30" width="140" height="50" />
    </g>
    <text class="sm" x="85" y="60" text-anchor="middle">all 0</text>
    <text class="sm" x="215" y="60" text-anchor="middle">all 1</text>
    <text class="sm" x="380" y="60" text-anchor="middle">not looked at yet</text>
    <text class="sm" x="550" y="60" text-anchor="middle">all 2</text>
    <text class="lbl rd" x="150" y="108" text-anchor="middle" style="font-size:15px">↑ low</text>
    <text class="lbl rd" x="280" y="108" text-anchor="middle" style="font-size:15px">↑ mid</text>
    <text class="lbl rd" x="480" y="108" text-anchor="middle" style="font-size:15px">high ↑</text>
    <text class="sm" x="20" y="136">the loop runs while mid &lt;= high; the unseen region shrinks by one every step</text>
  </svg>
  <figcaption>Three pointers, four regions. Each step looks at <code>nums[mid]</code> and moves it into the region it belongs to.</figcaption>
</figure>
<pre><code>function sortColors(nums) {
  let low = 0, mid = 0, high = nums.length - 1;
  while (mid &lt;= high) {
    if (nums[mid] === 0) {
      swap(nums, low, mid);
      low++;
      mid++;                  <span class="c">// what came from low is a 1 we already saw</span>
    } else if (nums[mid] === 1) {
      mid++;
    } else {
      swap(nums, mid, high);
      high--;                 <span class="c">// do NOT move mid: the swapped-in value is unseen</span>
    }
  }
}

function swap(arr, i, j) {
  const t = arr[i];
  arr[i] = arr[j];
  arr[j] = t;
}</code></pre>

<h4>Dry run: sortColors([2, 0, 2, 1, 1, 0])</h4>
<table>
  <tr><th>nums[mid]</th><th>action</th><th>low</th><th>mid</th><th>high</th><th>array after</th></tr>
  <tr><td>2</td><td>swap mid and high, high−−</td><td>0</td><td>0</td><td>4</td><td>[0, 0, 2, 1, 1, 2]</td></tr>
  <tr><td>0</td><td>swap low and mid, both++</td><td>1</td><td>1</td><td>4</td><td>[0, 0, 2, 1, 1, 2]</td></tr>
  <tr><td>0</td><td>swap low and mid, both++</td><td>2</td><td>2</td><td>4</td><td>[0, 0, 2, 1, 1, 2]</td></tr>
  <tr><td>2</td><td>swap mid and high, high−−</td><td>2</td><td>2</td><td>3</td><td>[0, 0, 1, 1, 2, 2]</td></tr>
  <tr><td>1</td><td>mid++</td><td>2</td><td>3</td><td>3</td><td>[0, 0, 1, 1, 2, 2]</td></tr>
  <tr><td>1</td><td>mid++, mid is now past high</td><td>2</td><td>4</td><td>3</td><td>[0, 0, 1, 1, 2, 2]</td></tr>
</table>
<p class="sub">
  Look at the first row: after swapping a 2 to the back, the value that landed
  at <code>mid</code> is the 0 that used to be at the end, and the loop looks at
  it again on the next step. That is the reason <code>mid</code> stays put in
  the <code>2</code> branch and moves in the <code>0</code> branch: the value
  swapped in from <code>low</code> has already been classified (it can only be a
  1), but the value swapped in from <code>high</code> has not.
</p>
<p>
  The array is touched in one pass. Each step either moves <code>mid</code>
  up or <code>high</code> down, and the unseen region has
  <code>high - mid + 1</code> elements, so there are at most n steps: O(n)
  time, O(1) space. Nothing here is specific to the numbers 0, 1 and 2. Replace
  the three tests with <code>&lt; pivot</code>, <code>=== pivot</code> and
  <code>&gt; pivot</code> and you have the three-way partition behind quicksort
  on arrays with many equal keys, covered in
  <a href="/dsa/dsa-sorting-algorithms">sorting algorithms</a>.
</p>
<div class="warn">
  <span class="ttl">⚠ Two details that fail on small inputs</span>
  The loop condition is <code>mid &lt;= high</code>, not <code>&lt;</code>:
  when they are equal there is still one unseen element. And the 2-branch must
  not advance <code>mid</code>. Both bugs pass most examples. With
  <code>mid &lt; high</code> the array <code>[1, 0]</code> is left unsorted, and
  with <code>mid++</code> after the swap with <code>high</code> the array
  <code>[2, 1, 2]</code> is.
</div>

<h3>Two sorted inputs: merge from the back, squares from the ends</h3>
<p>
  Merging two sorted arrays into a new one is the base case: one pointer per
  array, always take the smaller head, O(m + n). The interview version adds a
  twist. The first array has room for both: it holds <code>m</code> real values
  followed by <code>n</code> empty slots, and you must merge in place.
</p>
<p>
  Merge from the front and you overwrite values of the first array you have not
  read yet. Merge from the <b>back</b> instead: the largest remaining value
  belongs at the last free slot, and the slots at the back are exactly the
  ones nobody needs. Three pointers: <code>i</code> at the end of the real
  values of the first array, <code>j</code> at the end of the second, and
  <code>k</code> at the slot being written.
</p>
<pre><code>function mergeInto(nums1, m, nums2, n) {
  let i = m - 1, j = n - 1, k = m + n - 1;
  while (j >= 0) {
    if (i >= 0 &amp;&amp; nums1[i] > nums2[j]) nums1[k--] = nums1[i--];
    else nums1[k--] = nums2[j--];
  }
}</code></pre>
<table>
  <tr><th>k</th><th>compare</th><th>written</th><th>nums1 after</th></tr>
  <tr><td>5</td><td>nums1[2]=3 vs nums2[2]=6</td><td>6 from nums2</td><td>[1, 2, 3, 0, 0, 6]</td></tr>
  <tr><td>4</td><td>3 vs nums2[1]=5</td><td>5 from nums2</td><td>[1, 2, 3, 0, 5, 6]</td></tr>
  <tr><td>3</td><td>3 vs nums2[0]=2</td><td>3 from nums1</td><td>[1, 2, 3, 3, 5, 6]</td></tr>
  <tr><td>2</td><td>nums1[1]=2 vs 2 (not greater)</td><td>2 from nums2</td><td>[1, 2, 2, 3, 5, 6]</td></tr>
</table>
<p class="sub">
  This is <code>mergeInto([1, 2, 3, 0, 0, 0], 3, [2, 5, 6], 3)</code>. The loop
  stops when <code>nums2</code> is used up, because whatever remains of
  <code>nums1</code> is already in its final place. Time O(m + n), space O(1).
</p>
<p>
  <b>Squares of a sorted array</b> uses the same trick for a different reason.
  Squaring a sorted array with negatives gives a sequence that falls and then
  rises: the largest squares are at the two <em>ends</em>. So fill the output
  from the back with whichever end has the larger square.
</p>
<pre><code>function sortedSquares(nums) {
  const n = nums.length;
  const out = new Array(n);
  let left = 0, right = n - 1;
  for (let k = n - 1; k >= 0; k--) {
    const l = nums[left] * nums[left];
    const r = nums[right] * nums[right];
    if (l > r) { out[k] = l; left++; }
    else { out[k] = r; right--; }
  }
  return out;
}</code></pre>
<p class="sub">
  On <code>[-4, -1, 0, 3, 10]</code> the picks are 100 (right), 16 (left), 9
  (right), 1 (left), 0 (right), giving <code>[0, 1, 9, 16, 100]</code> in
  O(n), where squaring and then sorting would cost O(n log n). The idea
  to carry away: when the useful values collect at the ends, work from the ends
  inward and fill the output from its largest slot.
</p>

<h3>Expanding from the center: palindromes in both directions</h3>
<p>
  Checking a palindrome moves two pointers <em>inward</em>. Finding the longest
  palindromic substring turns that around. You do not know where a palindrome
  starts or ends, but you do know that every palindrome has a center, and that
  growing outward from the center keeps it a palindrome exactly while the two
  new characters match. A string of length n has <code>2n - 1</code> centers:
  n single characters for odd lengths and n − 1 gaps between characters for
  even lengths.
</p>
<pre><code>function longestPalindrome(s) {
  let start = 0, bestLen = 0;

  function expand(l, r) {
    while (l >= 0 &amp;&amp; r &lt; s.length &amp;&amp; s[l] === s[r]) {
      l--;
      r++;
    }
    return r - l - 1;                         <span class="c">// length of the palindrome that just stopped growing</span>
  }

  for (let c = 0; c &lt; s.length; c++) {
    const len = Math.max(expand(c, c), expand(c, c + 1));  <span class="c">// odd center, even center</span>
    if (len > bestLen) {
      bestLen = len;
      start = c - Math.floor((len - 1) / 2);
    }
  }
  return s.slice(start, start + bestLen);
}</code></pre>
<p class="sub">
  The loop stops one step too far, with <code>l</code> and <code>r</code> on
  the first mismatch or off the array, so the palindrome is
  <code>s[l+1 .. r-1]</code>, which has length <code>r - l - 1</code>. The
  start formula works for both parities: for an odd length centered at
  <code>c</code> the start is <code>c - (len - 1) / 2</code>, and for an even
  length from the pair <code>(c, c + 1)</code> it is
  <code>c - (len / 2 - 1)</code>, and <code>Math.floor((len - 1) / 2)</code>
  gives both.
</p>
<p>
  Each of the <code>2n - 1</code> centers can expand up to about n/2 steps, so
  the worst case, a string such as <code>"aaaa…a"</code>, is O(n²) time and
  O(1) space. That is a real improvement on checking every substring, which is
  O(n³), and a good place to stop unless the interviewer asks for more. (An
  O(n) algorithm exists, Manacher's; it is rarely expected.) Counting
  palindromic substrings is the same loop: add one for every successful step of
  the expansion instead of tracking the longest.
</p>

<h3>Valid palindrome, with and without a deletion</h3>
<p>
  The most common variant ignores everything that is not a letter or a
  digit, and compares case-insensitively. Two pointers still close inward;
  each one first skips over characters that do not count.
</p>
<pre><code>function isPalindromeClean(s) {
  const isAlnum = (c) => /[a-z0-9]/i.test(c);
  let l = 0, r = s.length - 1;
  while (l &lt; r) {
    while (l &lt; r &amp;&amp; !isAlnum(s[l])) l++;
    while (l &lt; r &amp;&amp; !isAlnum(s[r])) r--;
    if (s[l].toLowerCase() !== s[r].toLowerCase()) return false;
    l++;
    r--;
  }
  return true;
}</code></pre>
<p>
  <b>Valid palindrome II</b> allows deleting <em>at most one</em> character.
  Scan inward as usual. At the first mismatch <code>(l, r)</code>, one of those
  two characters has to go: the characters outside them already match pairwise,
  so the only way to end with a palindrome is to drop <code>s[l]</code> or drop
  <code>s[r]</code>. Check both remaining ranges with a plain palindrome
  test; if either passes, the answer is yes.
</p>
<pre><code>function validPalindromeII(s) {
  function isRange(l, r) {
    while (l &lt; r) {
      if (s[l] !== s[r]) return false;
      l++;
      r--;
    }
    return true;
  }
  let l = 0, r = s.length - 1;
  while (l &lt; r) {
    if (s[l] !== s[r]) return isRange(l + 1, r) || isRange(l, r - 1);
    l++;
    r--;
  }
  return true;
}</code></pre>
<p class="sub">
  The second scan only happens once, at the first mismatch, so the total is at
  most three passes over the string: O(n) time, O(1) space. Do not try to
  recurse on both branches at every mismatch: that is how an O(n) idea turns
  into O(2<sup>n</sup>). If you want to convince yourself that two candidates
  are enough, test the function against a brute force that deletes every
  position in turn on all short strings.
</p>

<h3>Two strings at once: backspace compare in O(1) space</h3>
<p>
  Two strings contain letters and <code>#</code>, where <code>#</code> deletes
  the character before it. Are they equal after typing? The direct way builds
  both results with a stack and compares: O(n) time, O(n) space. To use O(1)
  space, scan <b>from the end</b> of both strings. Going backward, a
  <code>#</code> tells you exactly how many characters to the left to skip, so
  you never need to remember the letters you have not skipped yet.
</p>
<pre><code>function backspaceCompare(s, t) {
  let i = s.length - 1, j = t.length - 1;
  while (i >= 0 || j >= 0) {
    i = prevValid(s, i);
    j = prevValid(t, j);
    if (i &lt; 0 &amp;&amp; j &lt; 0) return true;       <span class="c">// both strings ran out together</span>
    if (i &lt; 0 || j &lt; 0) return false;      <span class="c">// only one ran out</span>
    if (s[i] !== t[j]) return false;
    i--;
    j--;
  }
  return true;
}

<span class="c">// the index of the next character that survives the backspaces, scanning left from i; -1 if none</span>
function prevValid(str, i) {
  let skip = 0;
  while (i >= 0) {
    if (str[i] === "#") { skip++; i--; }
    else if (skip > 0) { skip--; i--; }
    else break;
  }
  return i;
}</code></pre>
<p class="sub">
  On <code>"ab#c"</code> and <code>"ad#c"</code>: both scans start on
  <code>c</code> and match. The next call walks left over <code>#</code>
  (skip becomes 1), then over <code>b</code> or <code>d</code> (skip back to
  0), and stops on <code>a</code> in both, which also match. Both indices are
  now −1, so the answer is true. Each index only moves left, so the time is
  O(n + m) and the space is O(1). The reason the scan must go backward is that
  a <code>#</code> only affects what is <em>before</em> it.
</p>

<h3>Next permutation: a pivot, a swap and a reverse</h3>
<p>
  Rearrange an array into the next larger arrangement in lexicographic order,
  or the smallest one if it is already the largest, in place. The arrangement
  <code>[1, 3, 5, 4, 2]</code> is followed by <code>[1, 4, 2, 3, 5]</code>.
  There is nothing to search; the result follows from three observations.
</p>
<ul>
  <li>
    A suffix that is non-increasing (each value no larger than the one before)
    is already the largest arrangement of its own values, so you cannot get a
    larger one by touching only that suffix. Find the longest such suffix.
    The element just before it, the <b>pivot</b>, is the first one you can
    raise. If there is no pivot, the whole array is the largest permutation:
    reverse it and stop.
  </li>
  <li>
    To make the array larger by the smallest possible step, raise the pivot to
    the <em>smallest value in the suffix that is larger than it</em>. Because
    the suffix is non-increasing, scanning from the right finds it first.
  </li>
  <li>
    After the swap the suffix is still non-increasing. The smallest
    arrangement of those values is the increasing one, and reversing a
    non-increasing run produces it in O(n).
  </li>
</ul>
<pre><code>function nextPermutation(nums) {
  let i = nums.length - 2;
  while (i >= 0 &amp;&amp; nums[i] >= nums[i + 1]) i--;      <span class="c">// pivot: last place where the order goes up</span>
  if (i >= 0) {
    let j = nums.length - 1;
    while (nums[j] &lt;= nums[i]) j--;                  <span class="c">// rightmost value strictly larger than the pivot</span>
    swap(nums, i, j);
  }
  reverseRange(nums, i + 1, nums.length - 1);
}

function reverseRange(arr, lo, hi) {
  while (lo &lt; hi) swap(arr, lo++, hi--);
}</code></pre>
<p class="sub">
  On <code>[1, 3, 5, 4, 2]</code>: the suffix <code>[5, 4, 2]</code> is
  non-increasing, so the pivot is the 3 at index 1. The rightmost value larger
  than 3 is the 4 at index 3. Swap them to get <code>[1, 4, 5, 3, 2]</code>,
  then reverse the suffix after index 1 to get <code>[1, 4, 2, 3, 5]</code>.
  Time O(n), space O(1). The two comparisons use <code>&gt;=</code> and
  <code>&lt;=</code> so that equal values are handled: with duplicates, a
  strict test would stop on an equal pair, which is not a place where the
  order goes up.
</p>

<h3>Fast and slow on linked lists: middle, cycle, cycle start</h3>
<p>
  On a linked list you cannot jump to index n/2, but you can send two walkers:
  <code>slow</code> moves one node per step and <code>fast</code> moves two.
  When <code>fast</code> runs off the end, <code>slow</code> is in the middle,
  because it travelled half as far. If there is a cycle, <code>fast</code>
  never runs off the end, so the question becomes whether the two meet.
</p>
<pre><code>class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

<span class="c">// for an even count this returns the second of the two middle nodes</span>
function middleNode(head) {
  let slow = head, fast = head;
  while (fast &amp;&amp; fast.next) {
    slow = slow.next;
    fast = fast.next.next;
  }
  return slow;
}

function hasCycle(head) {
  let slow = head, fast = head;
  while (fast &amp;&amp; fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true;
  }
  return false;
}</code></pre>
<p>
  <b>Why they must meet.</b> Once both walkers are inside the cycle, the gap
  between them, measured along the cycle, shrinks by exactly one each step
  (fast gains one node on slow per step). A gap that shrinks by one at a time
  cannot jump over zero, so they meet within one cycle length of steps. That is
  the reason for speeds 1 and 2: their difference is exactly one node per
  step.
</p>
<p>
  <b>Where the cycle starts.</b> Let <code>a</code> be the number of nodes
  before the cycle, <code>c</code> the cycle length, and suppose the walkers
  meet <code>k</code> steps into the cycle. Slow has travelled
  <code>a + k</code> (it has not completed a lap yet, since the gap closes
  within one cycle length); fast has travelled <code>2(a + k)</code>, which
  equals <code>a + k</code> plus some whole number of laps. So <code>a + k</code> is
  a multiple of <code>c</code>, which means <code>a</code> steps from the
  meeting point lands exactly on the cycle's entrance. Start one pointer at
  the head and keep the other at the meeting point, move both one node at a
  time, and they meet at the entrance.
</p>
<pre><code>function cycleStart(head) {
  let slow = head, fast = head;
  while (fast &amp;&amp; fast.next) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let p = head;
      while (p !== slow) {
        p = p.next;
        slow = slow.next;
      }
      return p;
    }
  }
  return null;
}</code></pre>
<p class="sub">
  On the list <code>3 → 2 → 0 → −4 → 5 → 6</code> where the last node points
  back to the 2: the walkers meet at the 6 after five steps. Then a pointer
  from the head and one from the 6 step together: both land on the 2 after one
  move. Here <code>a = 1</code>, <code>c = 5</code>, and the first meeting is at
  <code>k = 4</code>, and indeed <code>a + k = 5 = c</code>. All three
  functions are O(n) time and O(1) space. The same idea finds a duplicate in
  an array treated as a linked list, which you will meet in
  <a href="/dsa/dsa-binary-search">binary search</a> as the alternative to a
  value-range search.
</p>

<h3>Which shape for which problem</h3>
<table>
  <tr><th>Shape</th><th>Pointers start</th><th>They move</th><th>What must be true</th><th>Typical problems</th></tr>
  <tr><td>Opposite ends</td><td>both ends</td><td>toward each other, one per step</td><td>an order that says which end to drop</td><td>two sum on sorted, 3Sum, container, trapping rain water, palindromes</td></tr>
  <tr><td>Read and write</td><td>both at the front</td><td>read every step, write only on a keep</td><td>a keep rule that looks at the current element and the kept prefix</td><td>remove duplicates, remove element, move zeroes</td></tr>
  <tr><td>Three-way partition</td><td>low, mid at the front, high at the back</td><td>mid forward; low and high toward it</td><td>values fall into three classes</td><td>sort colors, pivot partition</td></tr>
  <tr><td>Two inputs, merged</td><td>front or back of each</td><td>take the better head, advance that one</td><td>both inputs sorted</td><td>merge sorted arrays, intersection, is-subsequence</td></tr>
  <tr><td>Center outward</td><td>one center</td><td>away from each other</td><td>"still valid" can be checked as the range grows</td><td>longest palindromic substring, count palindromes</td></tr>
  <tr><td>Fast and slow</td><td>the same node</td><td>one step and two steps</td><td>a successor function, such as <code>next</code></td><td>middle, cycle detection, cycle start</td></tr>
</table>
<p class="sub">
  Ask three questions. Is there an order (or a sortable one) that tells me which
  pointer to drop? Am I building an output in place? Do the two things I move
  live in one sequence or in two? The answers choose a row of the table.
</p>

<h3>Pitfalls that cost offers</h3>
<ul>
  <li>
    <b>Using the opposite-ends scan on unsorted data</b> gives wrong answers
    with no error. Sort first, or use a hash map.
  </li>
  <li>
    <b><code>left &lt;= right</code> where <code>left &lt; right</code> is
    meant</b> pairs an element with itself. Decide whether the pointers may
    coincide, and write that in the loop condition.
  </li>
  <li>
    <b>Duplicate handling in k-Sum.</b> Skip against the previous element for
    the fixed value, and step past equal values after a hit. Both rules must be
    present or you return the same triplet twice, or miss one.
  </li>
  <li>
    <b>Sorting destroys positions.</b> If the answer is indices (classic Two
    Sum on an unsorted array), sorting loses them, unless you sort pairs of
    (value, index). A hash map is usually simpler.
  </li>
  <li>
    <b>The default <code>sort()</code></b> compares strings. Always pass
    <code>(a, b) =&gt; a - b</code> for numbers.
  </li>
  <li>
    <b>Mutating the input without saying so.</b> In-place problems expect it;
    problems that return a new structure usually do not. Copy with
    <code>slice()</code> before sorting when the caller keeps the original.
  </li>
  <li>
    <b>Moving <code>mid</code> after a swap with <code>high</code></b> in the
    three-way partition skips an unseen element.
  </li>
  <li>
    <b>Comparing against the original array</b> in a read/write loop instead of
    the written prefix, after the original has been overwritten.
  </li>
  <li>
    <b>Empty and tiny inputs.</b> Zero, one and two elements break loops that
    start at <code>nums.length - 2</code>, <code>a[0] + a[1] + a[2]</code> or
    <code>height.length - 1</code> unless guarded.
  </li>
</ul>

<h3>How to recognize it in an unseen problem</h3>
<ul>
  <li>The input is sorted (or can be sorted without losing what you need)</li>
  <li>You're looking for a pair, triplet, or a "does X exist" over combinations</li>
  <li>A brute force would be nested loops comparing indices against each other</li>
  <li>The words "sorted array," "pair," or "in-place" appear in the prompt</li>
  <li>The answer is built in place and the prompt asks for O(1) extra space: a read pointer and a write pointer</li>
  <li>Two sorted sequences must be combined, or a sorted array must be transformed and kept sorted</li>
  <li>A string must read the same from both ends, possibly after one deletion, or you must find the longest such stretch</li>
  <li>A linked list needs its middle, or a check for a cycle, without extra memory</li>
</ul>
<p class="sub">
  Three Sum is the natural extension: sort once, then fix one index and
  run the opposite-ends two-pointer scan on the rest — O(n²) total instead
  of the O(n³) brute force, because the inner two-sum collapses from a
  nested loop to a linear scan.</p>
<h3>See it move</h3>
<p>Step through it and watch <em>why</em> a pointer moves. Every move rules out a whole block of pairs at once — that is the entire reason this beats the nested loop.</p>

<div class="demo">
  <div class="demo__bar">Two pointers — find a pair that sums to 22</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="tp-code"></div>
        <div class="loop-bar"><i id="tp-bar"></i></div>
        <p class="loop-step" id="tp-step"></p>
        <div class="demo__ctl">
          <button class="btn" id="tp-prev" type="button">← Back</button>
          <button class="btn" id="tp-next" type="button">Next step →</button>
          <button class="btn" id="tp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="tp-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Current sum</div>
          <div id="tp-p-sum"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="tp-cells"></div></div></div>
    <p class="demo__note" id="tp-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "tp";
  var CODE = ["let lo = 0, hi = a.length - 1;","while (lo < hi) {","  const sum = a[lo] + a[hi];","  if (sum === target) return [lo, hi];","  sum < target ? lo++ : hi--;","}"];
  var STEPS = [{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"out","p":""},{"v":"11","c":"out","p":""},{"v":"15","c":"out","p":""},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":[]},"note":"Sorted array, target 22. Two pointers start at both ends.","line":1},{"cells":[{"v":"2","c":"lo","p":"lo"},{"v":"4","c":"in","p":""},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"in","p":""},{"v":"24","c":"hi","p":"hi"}],"panels":{"sum":["a[0] + a[6] = 2 + 24 = 26"]},"note":"Sum is 26. Compare it with the target 22.","line":3},{"cells":[{"v":"2","c":"lo","p":"lo"},{"v":"4","c":"in","p":""},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"hi","p":"hi"},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[0] + a[5] = 2 + 19 = 21"]},"note":"26 > 22. Only moving hi DOWN can decrease the sum, so hi retreats.","line":5},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"lo","p":"lo"},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"hi","p":"hi"},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[1] + a[5] = 4 + 19 = 23"]},"note":"21 < 22. Only moving lo UP can increase the sum, so lo advances. Everything left of it is now impossible.","line":5},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"lo","p":"lo"},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"hi","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[1] + a[4] = 4 + 15 = 19"]},"note":"23 > 22. Only moving hi DOWN can decrease the sum, so hi retreats.","line":5},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"lo","p":"lo"},{"v":"11","c":"in","p":""},{"v":"15","c":"hi","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[2] + a[4] = 7 + 15 = 22"]},"note":"19 < 22. Only moving lo UP can increase the sum, so lo advances. Everything left of it is now impossible.","line":5},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"done","p":"lo"},{"v":"11","c":"out","p":""},{"v":"15","c":"done","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[2] + a[4] = 7 + 15 = 22"]},"note":"7 + 15 = 22. Found the pair — done in one pass, O(n).","line":4}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var stepEl = document.getElementById(ID + "-step");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    if (stepEl) stepEl.textContent = "Step " + (i + 1) + " of " + STEPS.length;
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why the opposite-ends variant requires a sorted (or sortable) input, with an example of it silently giving a wrong answer on unsorted data.</li>
    <li>Trace <code>twoSumSorted</code> on a new sorted array by hand, stating which pointer moves and why at each step.</li>
    <li>Write the fast/slow "read pointer scans, write pointer only advances on a keep" shape from memory for removing duplicates in place.</li>
    <li>Say why each two-pointer comparison eliminates an entire end of the range, not just one element — and how that gets you from O(n²) to O(n).</li>
    <li>Given a new problem, recognize whether it needs opposite-ends closing inward or same-direction fast/slow — before writing any code.</li>
    <li>Prove aloud why container with most water can drop the shorter wall, and why trapping rain water can settle the lower side.</li>
    <li>Write 3Sum with all three duplicate guards, and say why the fixed value is compared with the previous element.</li>
    <li>State the Dutch national flag invariant for its four regions, and say why <code>mid</code> does not advance after a swap with <code>high</code>.</li>
    <li>Explain why merging in place goes from the back, and why squares of a sorted array fill the output from the back.</li>
    <li>Derive next permutation (pivot, swap, reverse) and Floyd's cycle start from the distances, not from memory.</li>
  </ul>
</div>
`,
};
