import type { Chapter } from "../types";

export const dsaMonotonicStackQueue: Chapter = {
  id: "dsa-monotonic-stack-queue",
  num: "I18",
  title: "Monotonic stack & queue in depth",
  short: "Monotonic stack & queue",
  levels: ["intermediate"],
  prerequisites: ["dsa-stacks-queues", "dsa-sliding-window"],
  practice: [
    "ex-daily-temperatures",
    "ex-next-greater-element-i",
    "ex-next-greater-element-circular",
    "ex-largest-rectangle-histogram",
    "ex-maximal-rectangle",
    "ex-sliding-window-maximum",
    "ex-online-stock-span",
    "ex-sum-of-subarray-minimums",
    "ex-remove-k-digits",
    "ex-remove-duplicate-letters",
    "ex-132-pattern",
    "ex-car-fleet",
    "ex-shortest-subarray-with-sum-at-least-k",
    "ex-jump-game-vi",
    "ex-longest-subarray-abs-diff-limit",
  ],
  ready: true,
  subtitle: "Throw away every element that can never win again — what survives is already sorted.",
  body: `<h3>The insight: some elements become permanently useless</h3>
<p>
  Suppose you're scanning left to right looking for each element's <b>next
  greater element</b>. You reach value 7 and the pending element behind it
  is a 3. That 3 is finished — 7 is its answer, and no later element can
  ever be its answer instead. But more than that: the 3 is now useless to
  <em>everyone</em>. Any future element looking backward for something
  bigger will hit the 7 before it reaches the 3. So the 3 can be discarded
  entirely.
</p>
<p>
  Do this consistently and the pending set is always sorted — a
  <b>monotonic stack</b>. You never search it, never sort it, never scan it:
  you only pop from the top while the invariant is violated. Each element is
  pushed exactly once and popped at most once, so the total work across the
  whole scan is O(n), even though the inner <code>while</code> loop can pop
  many elements on a single step.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Four snapshots of a monotonic stack as it scans the array two one five six two three, showing the stack growing, then two elements being popped when a smaller value arrives">
    <g class="rough">
      <rect class="box" x="52" y="180" width="76" height="32" rx="4" />
    </g>
    <g class="rough">
      <rect class="box" x="212" y="180" width="76" height="32" rx="4" />
      <rect class="box" x="212" y="146" width="76" height="32" rx="4" />
      <rect class="box" x="212" y="112" width="76" height="32" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxg" x="372" y="180" width="76" height="32" rx="4" />
      <rect class="boxr" x="372" y="146" width="76" height="32" rx="4" />
      <rect class="boxr" x="372" y="112" width="76" height="32" rx="4" />
    </g>
    <g class="rough">
      <rect class="box" x="522" y="180" width="76" height="32" rx="4" />
      <rect class="box" x="522" y="146" width="76" height="32" rx="4" />
      <rect class="box" x="522" y="112" width="76" height="32" rx="4" />
    </g>
    <text class="lbl" x="20" y="28" style="font-size:15px">heights = [2, 1, 5, 6, 2, 3] — stack holds indices, heights strictly increasing bottom to top</text>
    <text class="sm" x="90" y="62" text-anchor="middle">after i=1</text>
    <text class="sm" x="250" y="62" text-anchor="middle">after i=3</text>
    <text class="sm rd" x="410" y="62" text-anchor="middle">at i=4, h=2</text>
    <text class="sm" x="560" y="62" text-anchor="middle">after i=5</text>
    <text class="sm" x="90" y="201" text-anchor="middle">1</text>
    <text class="sm" x="250" y="201" text-anchor="middle">1</text>
    <text class="sm" x="250" y="167" text-anchor="middle">5</text>
    <text class="sm" x="250" y="133" text-anchor="middle">6</text>
    <text class="sm gr" x="410" y="201" text-anchor="middle">1</text>
    <text class="sm rd" x="410" y="167" text-anchor="middle">5 pop</text>
    <text class="sm rd" x="410" y="133" text-anchor="middle">6 pop</text>
    <text class="sm" x="560" y="201" text-anchor="middle">1</text>
    <text class="sm" x="560" y="167" text-anchor="middle">2</text>
    <text class="sm" x="560" y="133" text-anchor="middle">3</text>
    <text class="sm rd" x="20" y="232">a bar is popped exactly when its right boundary is found — and the new stack top is its left boundary</text>
  </svg>
  <figcaption>The stack is never searched or sorted — it stays ordered because anything out of order is popped on arrival.</figcaption>
</figure>

<h3>The canonical shape</h3>
<pre><code><span class="c">// The template. Two decisions define every variant:</span>
<span class="c">//   1. the comparison in the while condition (&lt; vs > vs &lt;= vs >=)</span>
<span class="c">//   2. what you do at pop time vs. at push time</span>
function monotonic(nums) {
  const stack = []; <span class="c">// store INDICES, not values — you almost always need positions</span>

  for (let i = 0; i &lt; nums.length; i++) {
    while (stack.length &amp;&amp; nums[stack[stack.length - 1]] &lt; nums[i]) {
      const j = stack.pop();
      <span class="c">// nums[i] is j's NEXT GREATER — resolve j here</span>
    }
    <span class="c">// whatever is on top now is i's PREVIOUS GREATER-OR-EQUAL (or none if empty)</span>
    stack.push(i);
  }
  <span class="c">// anything left on the stack has no next greater element</span>
}</code></pre>
<div class="sticky mint">
  <span class="ttl">One pass gives you two answers</span>
  A single decreasing stack resolves <b>next greater</b> at pop time and
  <b>previous greater</b> at push time, in the same loop. Most people write
  two passes (one forward, one backward) for problems that need both
  boundaries. You don't have to — and saying so mid-interview is a strong
  signal that you understand the structure rather than the recipe.
</div>
<table>
  <tr><th>Question</th><th>Stack order (bottom → top)</th><th>Pop while top ...</th></tr>
  <tr><td>Next greater element</td><td>decreasing</td><td>value &lt; nums[i]</td></tr>
  <tr><td>Next smaller element</td><td>increasing</td><td>value > nums[i]</td></tr>
  <tr><td>Previous greater element</td><td>decreasing</td><td>same loop, read the top after popping</td></tr>
  <tr><td>Previous smaller element</td><td>increasing</td><td>same loop, read the top after popping</td></tr>
</table>
<p class="sub">
  Ties: with these strict pop tests, the top you read after popping is the
  previous greater-or-equal (or smaller-or-equal) element. Pop on equal values
  too (<code>&lt;=</code> or <code>&gt;=</code>) when the previous element must
  be strictly greater or strictly smaller; the pop-time answer then becomes
  next greater-or-equal, so a single pass cannot make both sides strict.
</p>
<p class="sub">
  Memorize the <em>derivation</em>, not the table: "I want the next bigger
  thing, so a pending element stops being pending the moment something
  bigger arrives, so I pop while the top is smaller, so the stack is
  decreasing." Regenerate it in ten seconds at the whiteboard instead of
  recalling four near-identical rules under pressure.
</p>

<h3>Next greater element</h3>
<pre><code><span class="c">// For each element, the first larger value to its right; -1 if none. O(n).</span>
function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = []; <span class="c">// indices; nums[stack] non-increasing (equal values stay on the stack)</span>

  for (let i = 0; i &lt; nums.length; i++) {
    while (stack.length &amp;&amp; nums[stack[stack.length - 1]] &lt; nums[i]) {
      res[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return res; <span class="c">// leftovers keep their -1 — nothing bigger ever came</span>
}

nextGreater([2, 1, 2, 4, 3]); <span class="c">// [4, 2, 4, -1, -1]</span></code></pre>
<p>
  The <b>circular</b> variant ("Next Greater Element II") wraps around the
  end of the array. The fix is not a second algorithm — just walk the index
  twice and mod:
</p>
<pre><code>function nextGreaterCircular(nums) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  const stack = [];

  for (let step = 0; step &lt; 2 * n; step++) { <span class="c">// two laps: the second one resolves the wrap-around</span>
    const i = step % n;
    while (stack.length &amp;&amp; nums[stack[stack.length - 1]] &lt; nums[i]) {
      res[stack.pop()] = nums[i];
    }
    if (step &lt; n) stack.push(i); <span class="c">// only push during the first lap, or indices duplicate</span>
  }
  return res;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Strict vs. non-strict comparison decides how ties behave</span>
  <code>&lt;</code> vs <code>&lt;=</code> in the while condition changes
  whether equal elements pop each other. For "next <em>strictly</em> greater"
  you must use <code>&lt;</code>, otherwise two equal values resolve each
  other incorrectly. For histogram-style problems with duplicate heights,
  <code>&gt;=</code> (popping equals) is usually the right choice — it can
  compute a too-small width for one of the duplicates, but the largest
  duplicate is always measured with the full width, so the maximum still
  comes out correct. Reason about ties explicitly; don't guess.
</div>

<h3>Daily Temperatures, Next Greater Element I and Stock Span</h3>
<p>
  Three of the most common warm-ups are the template above with a different
  thing written at pop time or push time. In each case the stack holds
  indices (or, when the values are distinct and positions are not needed,
  values) whose answer is still pending.
</p>
<p>
  <b>Daily Temperatures</b> asks how many days you wait for a warmer day. The
  answer for day <code>j</code> is the <em>distance</em> to its next greater
  element, <code>i - j</code>, written when <code>j</code> is popped.
</p>
<pre><code>function dailyTemperatures(temperatures) {
  const wait = new Array(temperatures.length).fill(0); <span class="c">// 0 means "never warmer"</span>
  const stack = [];
  for (let i = 0; i &lt; temperatures.length; i++) {
    while (stack.length &amp;&amp; temperatures[stack[stack.length - 1]] &lt; temperatures[i]) {
      const j = stack.pop();
      wait[j] = i - j;
    }
    stack.push(i);
  }
  return wait;
}</code></pre>
<h4>Dry run: [73, 74, 75, 71, 69, 72, 76, 73]</h4>
<table>
  <tr><th>i</th><th>temp</th><th>Pops (index → wait)</th><th>Stack of indices after</th></tr>
  <tr><td>0</td><td>73</td><td>—</td><td>[0]</td></tr>
  <tr><td>1</td><td>74</td><td>0 → 1</td><td>[1]</td></tr>
  <tr><td>2</td><td>75</td><td>1 → 1</td><td>[2]</td></tr>
  <tr><td>3</td><td>71</td><td>—</td><td>[2, 3]</td></tr>
  <tr><td>4</td><td>69</td><td>—</td><td>[2, 3, 4]</td></tr>
  <tr><td>5</td><td>72</td><td>4 → 1, 3 → 2</td><td>[2, 5]</td></tr>
  <tr><td>6</td><td>76</td><td>5 → 1, 2 → 4</td><td>[6]</td></tr>
  <tr><td>7</td><td>73</td><td>—</td><td>[6, 7]</td></tr>
</table>
<p class="sub">
  Indices 6 and 7 are still on the stack at the end and keep their 0. The result
  is <code>[1, 1, 4, 2, 1, 1, 0, 0]</code>. O(n) time and O(n) space.
</p>
<p>
  <b>Next Greater Element I</b> gives two arrays: for every value of
  <code>nums1</code>, a subset of <code>nums2</code> with distinct values, find
  the next greater element of that value inside <code>nums2</code>. Compute the
  answer for every value of <code>nums2</code> with the stack, store it in a
  <code>Map</code>, then look up each value of <code>nums1</code>. Because the
  values are distinct and no positions are needed, the stack can hold values.
</p>
<pre><code>function nextGreaterElementI(nums1, nums2) {
  const next = new Map(); <span class="c">// value → its next greater value in nums2</span>
  const stack = [];
  for (const value of nums2) {
    while (stack.length &amp;&amp; stack[stack.length - 1] &lt; value) next.set(stack.pop(), value);
    stack.push(value);
  }
  return nums1.map((value) =&gt; next.get(value) ?? -1);
}</code></pre>
<p class="sub">
  O(n + m) time. If <code>nums2</code> could repeat a value, a Map keyed by value
  would mix up the copies; keep indices on the stack in that case.
</p>
<p>
  <b>Stock Span</b> asks, for each day, how many consecutive days ending today
  (today included) had a price at most today's. That is the distance back to
  the <em>previous strictly greater</em> price, so the answer is written at
  push time, from whatever is left on top after the pops, and the pop test is
  "less than or equal".
</p>
<pre><code>function stockSpans(prices) {
  const spans = [];
  const stack = []; <span class="c">// indices; prices strictly decreasing bottom to top</span>
  for (let i = 0; i &lt; prices.length; i++) {
    while (stack.length &amp;&amp; prices[stack[stack.length - 1]] &lt;= prices[i]) stack.pop();
    spans.push(stack.length ? i - stack[stack.length - 1] : i + 1);
    stack.push(i);
  }
  return spans;
}</code></pre>
<h4>Dry run: [100, 80, 60, 70, 60, 75, 85]</h4>
<table>
  <tr><th>i</th><th>price</th><th>Popped (prices)</th><th>Top left</th><th>Span</th></tr>
  <tr><td>0</td><td>100</td><td>—</td><td>none</td><td>1 (i + 1)</td></tr>
  <tr><td>1</td><td>80</td><td>—</td><td>index 0</td><td>1 - 0 = 1</td></tr>
  <tr><td>2</td><td>60</td><td>—</td><td>index 1</td><td>1</td></tr>
  <tr><td>3</td><td>70</td><td>60</td><td>index 1</td><td>3 - 1 = 2</td></tr>
  <tr><td>4</td><td>60</td><td>—</td><td>index 3</td><td>1</td></tr>
  <tr><td>5</td><td>75</td><td>60, 70</td><td>index 1</td><td>5 - 1 = 4</td></tr>
  <tr><td>6</td><td>85</td><td>75, 80</td><td>index 0</td><td>6 - 0 = 6</td></tr>
</table>
<p class="sub">
  The spans are <code>[1, 1, 1, 2, 1, 4, 6]</code>. The online version (a
  class with a <code>next(price)</code> method that is called once per day)
  keeps the same stack, but stores <code>{ price, day }</code> pairs and a day
  counter, since there is no array to index into. Each call is O(1) amortised.
  Note the symmetry with Daily Temperatures: one writes a distance forward at
  pop time, the other a distance backward at push time.
</p>

<h3>Largest rectangle in histogram</h3>
<p>
  This is the problem that makes the pattern click. A rectangle of height
  <code>heights[j]</code> extends left until it hits a strictly shorter bar
  and right until it hits a strictly shorter bar. So each bar needs its
  <b>previous smaller</b> and <b>next smaller</b> index — exactly what an
  increasing stack hands you: <code>i</code> is the right boundary at pop
  time, and the new stack top is the left boundary.
</p>
<pre><code><span class="c">// O(n) time, O(n) space</span>
function largestRectangleArea(heights) {
  const stack = []; <span class="c">// indices; heights strictly increasing bottom to top (&gt;= pops equal heights)</span>
  let best = 0;

  for (let i = 0; i &lt;= heights.length; i++) {
    <span class="c">// SENTINEL: a virtual height-0 bar past the end drains the stack — no cleanup loop</span>
    const h = i === heights.length ? 0 : heights[i];

    while (stack.length &amp;&amp; heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      <span class="c">// left boundary = one past the new top; if the stack emptied, this bar reached index 0</span>
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      best = Math.max(best, height * (i - left)); <span class="c">// width = right boundary i, exclusive</span>
    }
    stack.push(i);
  }
  return best;
}

largestRectangleArea([2, 1, 5, 6, 2, 3]); <span class="c">// 10 — the 5 and 6 bars, width 2</span></code></pre>
<h4>Dry run: largestRectangleArea([2, 1, 5, 6, 2, 3]) — the same array as the figure above</h4>
<table>
  <tr><th>i</th><th>h</th><th>popped (height)</th><th>left</th><th>width</th><th>area</th><th>best</th></tr>
  <tr><td>1</td><td>1</td><td>2</td><td>0</td><td>1</td><td>2</td><td>2</td></tr>
  <tr><td>4</td><td>2</td><td>6</td><td>3</td><td>1</td><td>6</td><td>6</td></tr>
  <tr><td>4</td><td>2</td><td>5</td><td>2</td><td>2</td><td><b>10</b></td><td><b>10</b></td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>3</td><td>5</td><td>1</td><td>3</td><td>10</td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>2</td><td>2</td><td>4</td><td>8</td><td>10</td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>1</td><td>0</td><td>6</td><td>6</td><td>10</td></tr>
</table>
<p class="sub">
  Row three is the whole problem: popping the 6 first (width 1, area 6) looks
  smaller, but the very next pop of the 5 reaches back to <code>left = 2</code>
  because the 6 is already gone from the stack — the rectangle of height 5
  spans both index 2 and index 3. That's the payoff of storing indices, not
  values: the width of a popped bar's rectangle depends on what's left
  standing, which changes after every pop.
</p>
<div class="warn">
  <span class="ttl">⚠ Two off-by-one traps live in the width calculation</span>
  <b>(1)</b> When the stack empties after a pop, the left boundary is
  <code>0</code>, not <code>stack.top + 1</code> — that bar was shorter than
  everything before it, so it extends all the way to the start. Forgetting
  this silently under-counts the widest rectangles. <b>(2)</b> The width is
  <code>i - left</code>, not <code>i - left + 1</code>, because
  <code>i</code> is the first bar that <em>breaks</em> the rectangle, so it
  is an exclusive right boundary. Sanity-check both against
  <code>[2]</code> (answer 2) and <code>[2, 2]</code> (answer 4) before
  declaring victory.
</div>
<p class="sub">
  Directly on top of this: <b>Maximal Rectangle</b> in a binary matrix. Walk
  the rows, maintain a running "height of consecutive 1s ending at this row"
  array, and call <code>largestRectangleArea</code> on it once per row —
  O(rows × cols) total. Recognizing that a hard 2D problem is this 1D
  problem run row-by-row is exactly the kind of reduction interviews reward.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Every rectangle is bounded by
  the first shorter bar on each side, so I need previous-smaller and
  next-smaller for each bar. An increasing monotonic stack gives me both in
  one pass: the index that triggers a pop is the right boundary, and
  whatever is left on the stack is the left boundary. I'll append a virtual
  zero-height bar so the stack drains without a separate cleanup loop."
</div>

<h3>Trapping rain water, the monotonic-stack way</h3>
<p>
  You have probably seen the two-pointer solution. The stack version is
  worth knowing because it computes the water in <b>horizontal layers</b>
  rather than vertical columns, and it's the same skeleton as the histogram
  — which means one mental model covers both problems.
</p>
<pre><code><span class="c">// O(n) time, O(n) space — fills water layer by layer</span>
function trap(height) {
  const stack = []; <span class="c">// indices; heights non-increasing bottom to top (equal heights stay)</span>
  let water = 0;

  for (let i = 0; i &lt; height.length; i++) {
    while (stack.length &amp;&amp; height[stack[stack.length - 1]] &lt; height[i]) {
      const bottom = stack.pop(); <span class="c">// the floor of the basin we're about to fill</span>
      if (!stack.length) break;   <span class="c">// no left wall → water spills off the edge</span>

      const left = stack[stack.length - 1];
      const width = i - left - 1;                                    <span class="c">// strictly between the two walls</span>
      const bounded = Math.min(height[left], height[i]) - height[bottom]; <span class="c">// shorter wall caps the level</span>
      water += width * bounded;
    }
    stack.push(i);
  }
  return water;
}

trap([0,1,0,2,1,0,1,3,2,1,2,1]); <span class="c">// 6</span></code></pre>
<p class="sub">
  The <code>break</code> when the stack empties is the whole "you need walls
  on both sides" rule, expressed structurally. And notice
  <code>bounded</code> subtracts <code>height[bottom]</code>: you're adding
  only the slab <em>above</em> the previously-filled level, never
  double-counting a layer you already paid for. The two-pointer solution is
  O(1) space and is the better final answer — but explaining the layered
  view first shows you understand <em>why</em> the two-pointer bound works.
</p>

<h3>Sum of Subarray Minimums: count the windows each element rules</h3>
<p>
  Add up the minimum of every contiguous subarray. There are O(n²) subarrays,
  so listing them is too slow for large n. Turn the sum around:
  <code>sum = Σ arr[i] × (the number of subarrays whose minimum is arr[i])</code>.
  This is the <b>contribution technique</b>. A subarray with minimum at
  position <code>i</code> starts somewhere among the positions that are
  reachable to the left without meeting a smaller value, and ends somewhere
  reachable to the right, so the count is
  <code>leftCount × rightCount</code>. Those two extents are the distances to the
  previous smaller and the next smaller element, which one monotonic stack
  produces.
</p>
<p>
  Ties need a rule, or equal values would claim the same subarray twice. Decide
  that a subarray belongs to its <b>leftmost</b> minimum. Then on the left,
  an equal value blocks the extent (the equal one is more to the left and wins);
  on the right, an equal value does not block it. Strict on one side and
  non-strict on the other is the asymmetry that makes every subarray count
  exactly once.
</p>
<pre><code>function sumSubarrayMins(arr) {
  const MOD = 1000000007;
  const stack = []; <span class="c">// indices; values non-decreasing bottom to top, so a pop means a strictly smaller value arrived</span>
  let total = 0;

  for (let i = 0; i &lt;= arr.length; i++) {
    const current = i === arr.length ? -Infinity : arr[i]; <span class="c">// sentinel drains the stack</span>
    while (stack.length &amp;&amp; arr[stack[stack.length - 1]] &gt; current) {
      const mid = stack.pop();
      const leftBound = stack.length ? stack[stack.length - 1] : -1; <span class="c">// previous element that is smaller or EQUAL</span>
      const leftCount = mid - leftBound;  <span class="c">// starts: leftBound + 1 .. mid</span>
      const rightCount = i - mid;         <span class="c">// ends: mid .. i - 1 (i is the next STRICTLY smaller)</span>
      total = (total + arr[mid] * leftCount * rightCount) % MOD;
    }
    stack.push(i);
  }
  return total;
}</code></pre>
<h4>Dry run: sumSubarrayMins([3, 1, 2, 4])</h4>
<table>
  <tr><th>Element</th><th>Starts available (left)</th><th>Ends available (right)</th><th>Windows</th><th>Contribution</th></tr>
  <tr><td>3</td><td>1 (only itself)</td><td>1 (the 1 stops it)</td><td>1</td><td>3</td></tr>
  <tr><td>1</td><td>2 (the 3 and itself)</td><td>3 (itself, 2, 4)</td><td>6</td><td>6</td></tr>
  <tr><td>2</td><td>1 (the 1 blocks the left)</td><td>2 (itself and 4)</td><td>2</td><td>4</td></tr>
  <tr><td>4</td><td>1</td><td>1</td><td>1</td><td>4</td></tr>
</table>
<p class="sub">
  The total is 3 + 6 + 4 + 4 = 17, which matches the 10 subarrays' minimums
  added by hand. Tie check on <code>[2, 2]</code>: the first 2 gets
  1 start × 2 ends (windows <code>[2]</code> and <code>[2, 2]</code>) = 2 windows,
  the second gets 1 × 1, giving 2 × 2 + 2 × 1 = 6, the correct sum of
  <code>2 + 2 + 2</code>. If both sides were strict the pair window would be
  counted twice (total 8); if both sides were non-strict it would be counted
  zero times (total 4).
</p>
<p class="sub">
  O(n) time and O(n) space. The product
  <code>arr[mid] * leftCount * rightCount</code> stays below 2<sup>53</sup> for
  the usual limits (values and n up to about 3 × 10<sup>4</sup>); if both could
  be around 10<sup>9</sup> you would need BigInt or a modular multiply. The same
  recipe with "maximum" instead of "minimum" gives Sum of Subarray Ranges as
  max-sum minus min-sum.
</p>

<h3>Lexicographic stacks: Remove K Digits and Remove Duplicate Letters</h3>
<p>
  A monotonic stack also builds the <em>smallest string</em> by deleting
  characters. The idea: scan left to right; if the new character is smaller
  than the one on top, then keeping the larger character earlier makes the
  result larger, so delete it if you are allowed to. The stack ends up
  non-decreasing, which is the lexicographic minimum.
</p>
<p>
  <b>Remove K Digits</b>: delete exactly k digits from a number string to make
  the smallest possible number.
</p>
<pre><code>function removeKdigits(num, k) {
  const stack = [];
  for (const digit of num) {
    while (k &gt; 0 &amp;&amp; stack.length &amp;&amp; stack[stack.length - 1] &gt; digit) {
      stack.pop(); <span class="c">// a larger digit earlier in the number loses to a smaller one that follows</span>
      k--;
    }
    stack.push(digit);
  }
  while (k &gt; 0) { stack.pop(); k--; } <span class="c">// still need deletions: the end holds the largest digits</span>

  let start = 0;
  while (start &lt; stack.length - 1 &amp;&amp; stack[start] === "0") start++; <span class="c">// strip leading zeros, keep one digit</span>
  const result = stack.slice(start).join("");
  return result === "" ? "0" : result;
}</code></pre>
<h4>Dry run: removeKdigits("1432219", 3)</h4>
<table>
  <tr><th>digit</th><th>Pops (k left)</th><th>Stack after</th></tr>
  <tr><td>1</td><td>—</td><td>1</td></tr>
  <tr><td>4</td><td>—</td><td>1 4</td></tr>
  <tr><td>3</td><td>4 (k = 2)</td><td>1 3</td></tr>
  <tr><td>2</td><td>3 (k = 1)</td><td>1 2</td></tr>
  <tr><td>2</td><td>—</td><td>1 2 2</td></tr>
  <tr><td>1</td><td>2 (k = 0)</td><td>1 2 1</td></tr>
  <tr><td>9</td><td>k is 0, no more pops</td><td>1 2 1 9</td></tr>
</table>
<p class="sub">
  The answer is <code>"1219"</code>. Three details lose offers: forgetting the
  leftover deletions (<code>"12345"</code> with k = 2 never pops in the loop and
  must lose its last two digits, giving <code>"123"</code>), forgetting to strip
  leading zeros (<code>"10200"</code> with k = 1 becomes <code>"0200"</code>
  before stripping, <code>"200"</code> after), and returning an empty string
  instead of <code>"0"</code> when everything is deleted.
</p>
<p>
  <b>Remove Duplicate Letters</b>: remove repeated letters so that each letter
  of the string appears exactly once and the result is the smallest in
  lexicographic order. The same greedy applies with one extra rule: you may pop
  a larger letter only if it appears <em>again later</em>, because otherwise
  popping it would lose that letter forever. Track each letter's last index and
  which letters are already on the stack.
</p>
<pre><code>function removeDuplicateLetters(s) {
  const last = new Map();
  for (let i = 0; i &lt; s.length; i++) last.set(s[i], i);

  const inStack = new Set();
  const stack = [];
  for (let i = 0; i &lt; s.length; i++) {
    const ch = s[i];
    if (inStack.has(ch)) continue; <span class="c">// already placed, in the best position found so far</span>
    while (stack.length &amp;&amp; stack[stack.length - 1] &gt; ch &amp;&amp; last.get(stack[stack.length - 1]) &gt; i) {
      inStack.delete(stack.pop()); <span class="c">// bigger, and it will come again later, so it can wait</span>
    }
    stack.push(ch);
    inStack.add(ch);
  }
  return stack.join("");
}</code></pre>
<h4>Dry run: removeDuplicateLetters("cbacdcbc")</h4>
<table>
  <tr><th>i</th><th>ch</th><th>Action</th><th>Stack after</th></tr>
  <tr><td>0</td><td>c</td><td>push</td><td>c</td></tr>
  <tr><td>1</td><td>b</td><td>c is bigger and appears again at index 7: pop it, push b</td><td>b</td></tr>
  <tr><td>2</td><td>a</td><td>b is bigger and appears again at index 6: pop it, push a</td><td>a</td></tr>
  <tr><td>3</td><td>c</td><td>push</td><td>a c</td></tr>
  <tr><td>4</td><td>d</td><td>push</td><td>a c d</td></tr>
  <tr><td>5</td><td>c</td><td>already on the stack: skip</td><td>a c d</td></tr>
  <tr><td>6</td><td>b</td><td>d is bigger but its last index is 4, so it cannot wait; push b</td><td>a c d b</td></tr>
  <tr><td>7</td><td>c</td><td>already on the stack: skip</td><td>a c d b</td></tr>
</table>
<p class="sub">
  The answer is <code>"acdb"</code>. O(n) time, because each character is
  pushed and popped at most once, with O(alphabet) extra space for the two
  tables. The pattern "pop while the top is worse and it is safe to lose" covers
  both problems; what "safe" means is the only thing that changes (a remaining
  deletion budget, or a later copy of the same letter).
</p>

<h3>132 pattern: a stack that remembers the best "2"</h3>
<p>
  Is there a triple of positions <code>i &lt; j &lt; k</code> with
  <code>nums[i] &lt; nums[k] &lt; nums[j]</code>? Call the three values "1", "3"
  and "2" after their relative sizes. A cubic search tries every triple. Scan
  from the <b>right</b> instead, and keep two things: a decreasing stack of
  values that could play "3", and <code>third</code>, the largest value known to
  be a valid "2" (some value that has a strictly larger value on its left,
  to the right of the scan point). When the scan reaches a new element that is
  smaller than <code>third</code>, it is a valid "1" and the answer is yes.
</p>
<pre><code>function find132pattern(nums) {
  let third = -Infinity; <span class="c">// the best "2" so far: popped values are smaller than a later "3" to their left</span>
  const stack = [];      <span class="c">// candidate "3"s, decreasing bottom to top (equal values stay)</span>
  for (let i = nums.length - 1; i &gt;= 0; i--) {
    if (nums[i] &lt; third) return true; <span class="c">// nums[i] is the "1": it is below a "2" that sits under a bigger "3"</span>
    while (stack.length &amp;&amp; stack[stack.length - 1] &lt; nums[i]) third = stack.pop();
    stack.push(nums[i]);
  }
  return false;
}</code></pre>
<h4>Dry run: [3, 1, 4, 2]</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>Check against third</th><th>Pops</th><th>third after</th><th>Stack after</th></tr>
  <tr><td>3</td><td>2</td><td>2 &lt; -Infinity? no</td><td>—</td><td>-Infinity</td><td>[2]</td></tr>
  <tr><td>2</td><td>4</td><td>4 &lt; -Infinity? no</td><td>2</td><td>2</td><td>[4]</td></tr>
  <tr><td>1</td><td>1</td><td>1 &lt; 2? yes</td><td colspan="3">return true: the triple is 1, 4, 2</td></tr>
</table>
<p class="sub">
  O(n) time and O(n) space. Why <code>third</code> only ever grows: a value
  is pushed only if it is not below <code>third</code> (otherwise we would
  have returned), so every later pop is at least <code>third</code>. The
  comparisons are strict on both sides because the pattern needs
  <code>1 &lt; 2 &lt; 3</code>; with <code>&lt;=</code> the array
  <code>[1, 2, 2]</code> would wrongly succeed. Scanning left to right with the
  same ideas needs a prefix-minimum array, and the right-to-left stack version
  avoids it.
</p>

<h3>Car Fleet: sort by position, keep a stack of arrival times</h3>
<p>
  Cars drive toward a target on a single lane and cannot pass; a faster car that
  catches a slower one slows to its speed and from then on they travel as one
  <b>fleet</b>. Count the fleets that reach the target. The key observation is
  that only <em>arrival times</em> matter. Sort the cars by position, closest to
  the target first. A car's own time is
  <code>(target - position) / speed</code>. If it is no more than the time of
  the fleet in front, it catches up (or arrives together with it) and merges;
  if it is strictly more, it is slower than everything ahead and forms a new
  fleet, which the stack records.
</p>
<pre><code>function carFleet(target, position, speed) {
  const order = position.map((_, i) =&gt; i).sort((a, b) =&gt; position[b] - position[a]); <span class="c">// nearest to the target first</span>
  const fleetTimes = []; <span class="c">// strictly increasing: each fleet is slower than the one in front</span>
  for (const i of order) {
    const time = (target - position[i]) / speed[i];
    if (fleetTimes.length === 0 || time &gt; fleetTimes[fleetTimes.length - 1]) fleetTimes.push(time);
  }
  return fleetTimes.length;
}</code></pre>
<h4>Dry run: target = 12, position = [10, 8, 0, 5, 3], speed = [2, 4, 1, 1, 3]</h4>
<table>
  <tr><th>Car (position)</th><th>Time to target</th><th>Compare with fleet in front</th><th>Fleet times after</th></tr>
  <tr><td>10</td><td>(12 - 10) / 2 = 1</td><td>none in front</td><td>[1]</td></tr>
  <tr><td>8</td><td>(12 - 8) / 4 = 1</td><td>1 is not above 1: merges</td><td>[1]</td></tr>
  <tr><td>5</td><td>(12 - 5) / 1 = 7</td><td>7 &gt; 1: new fleet</td><td>[1, 7]</td></tr>
  <tr><td>3</td><td>(12 - 3) / 3 = 3</td><td>3 is not above 7: merges</td><td>[1, 7]</td></tr>
  <tr><td>0</td><td>(12 - 0) / 1 = 12</td><td>12 &gt; 7: new fleet</td><td>[1, 7, 12]</td></tr>
</table>
<p class="sub">
  The answer is 3. The cost is the sort, O(n log n). Since a car only ever
  compares with the <em>last</em> fleet time, a single running maximum would
  do instead of a stack; the stack framing shows the family resemblance
  (a pending element is absorbed by a stronger one) and is easier to extend.
  Equal times always compare equal here, because division of the same rational
  gives the same double. In principle two different times could round to the same
  double when positions and speeds are huge; if the limits allow that, compare
  cross-multiplied integers instead.
</p>

<h3>Monotonic deque: sliding window maximum</h3>
<p>
  Same invariant, one extra requirement: elements also expire off the
  <em>front</em> when they fall out of the window. A stack can't do that, so
  you use a deque — pop from the back to maintain monotonicity, shift from
  the front to evict stale indices. The front is always the window's maximum
  because everything smaller behind it was discarded on arrival.
</p>
<pre><code><span class="c">// max of every window of size k — O(n) time, O(k) space</span>
function maxSlidingWindow(nums, k) {
  const dq = []; <span class="c">// indices; nums[dq] strictly decreasing front to back (&lt;= pops equal values)</span>
  const out = [];

  for (let i = 0; i &lt; nums.length; i++) {
    if (dq.length &amp;&amp; dq[0] &lt;= i - k) dq.shift(); <span class="c">// front fell out of the window — evict</span>

    <span class="c">// anything smaller than or equal to nums[i] can never be a max again: nums[i] is newer AND at least as big</span>
    while (dq.length &amp;&amp; nums[dq[dq.length - 1]] &lt;= nums[i]) dq.pop();

    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[0]]); <span class="c">// front = current window max</span>
  }
  return out;
}

maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3); <span class="c">// [3, 3, 5, 5, 6, 7]</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Array.prototype.shift() is not O(1)</span>
  In the abstract this is a deque; in JavaScript, <code>shift()</code> on a
  plain array is O(n) in the general case because it re-indexes. V8
  optimizes small arrays well enough that this passes in practice, but the
  honest O(n) implementation uses a head pointer into a fixed array and
  advances it instead of shifting. If an interviewer asks "is that really
  O(n) overall?" — that's what they're probing. The one-line fix:
  <code>let head = 0;</code> then <code>head++</code> in place of
  <code>shift()</code>, and read <code>dq[head]</code> for the front.
</div>
<table>
  <tr><th>Approach</th><th>Time</th><th>Space</th><th>Note</th></tr>
  <tr><td>Recompute each window</td><td>O(n·k)</td><td>O(1)</td><td>The baseline to state and reject</td></tr>
  <tr><td>Max-heap with lazy deletion</td><td>O(n log n)</td><td>O(n)</td><td>Works, and generalizes to "kth largest in window"</td></tr>
  <tr><td>Monotonic deque</td><td><b>O(n)</b></td><td>O(k)</td><td>Optimal — each index enters and leaves once</td></tr>
  <tr><td>Balanced BST / multiset</td><td>O(n log k)</td><td>O(k)</td><td>Needed if the window query is median or kth, not max</td></tr>
</table>
<p class="sub">
  That last row is the useful boundary: a monotonic deque works because
  <code>max</code> lets you discard dominated elements forever. If the query
  were "median of every window," nothing is discardable — you'd need two
  heaps or an ordered multiset. Knowing <em>why</em> the deque stops working
  is more valuable than knowing that it works.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "If a new element is both
  larger and more recent than something already in the deque, that older
  element is permanently dominated — it can never be the max of any future
  window. So I drop it. What's left is decreasing, the front is the current
  max, and each index is pushed and popped exactly once, giving O(n) total
  rather than O(n·k)."
</div>


<h3>Deque with prefix sums: shortest subarray with sum at least K</h3>
<p>
  Find the length of the shortest non-empty subarray with sum at least
  <code>k</code>, where the array may contain <b>negative numbers</b>. The
  sliding window from the earlier chapter fails here: with positive numbers,
  growing the window raises the sum and shrinking lowers it, so a two-pointer
  rule is valid. With negatives, adding an element can lower the sum and
  removing one can raise it, so neither pointer has a safe move.
</p>
<p>
  Switch to prefix sums, where <code>prefix[j] - prefix[i] &gt;= k</code> for
  <code>i &lt; j</code> is the condition, and keep a deque of candidate start
  indices <code>i</code>. Two observations prune the deque. First, if some start
  <code>i</code> already satisfies the condition for the current end
  <code>j</code>, record <code>j - i</code> and discard <code>i</code> for good:
  every later end gives a longer subarray from <code>i</code>. Second, if the
  new <code>prefix[j]</code> is at most the prefix at the back of the deque, the
  back start can never beat <code>j</code>: <code>j</code> is closer to every
  future end and has a prefix that is no larger, so it gives at least as large a
  sum. Popping those keeps the deque's prefix values increasing.
</p>
<pre><code>function shortestSubarray(nums, k) {
  const n = nums.length;
  const prefix = new Array(n + 1).fill(0);
  for (let i = 0; i &lt; n; i++) prefix[i + 1] = prefix[i] + nums[i];

  const deque = new Array(n + 1); <span class="c">// indices into prefix; head and tail replace shift() and pop()</span>
  let head = 0, tail = 0;
  let best = Infinity;

  for (let j = 0; j &lt;= n; j++) {
    while (head &lt; tail &amp;&amp; prefix[j] - prefix[deque[head]] &gt;= k) {
      best = Math.min(best, j - deque[head]); <span class="c">// this start is finished: it cannot do better later</span>
      head++;
    }
    while (head &lt; tail &amp;&amp; prefix[deque[tail - 1]] &gt;= prefix[j]) tail--; <span class="c">// dominated starts</span>
    deque[tail++] = j;
  }
  return best === Infinity ? -1 : best;
}</code></pre>
<h4>Dry run: shortestSubarray([2, -1, 2], 3), prefix = [0, 2, 1, 3]</h4>
<table>
  <tr><th>j</th><th>prefix[j]</th><th>Front check (prefix[j] - front start)</th><th>Back pops</th><th>Deque of start indices</th></tr>
  <tr><td>0</td><td>0</td><td>deque is empty</td><td>—</td><td>[0]</td></tr>
  <tr><td>1</td><td>2</td><td>2 - 0 = 2 &lt; 3</td><td>—</td><td>[0, 1]</td></tr>
  <tr><td>2</td><td>1</td><td>1 - 0 = 1 &lt; 3</td><td>index 1 (prefix 2 is at least 1)</td><td>[0, 2]</td></tr>
  <tr><td>3</td><td>3</td><td>3 - 0 = 3 is at least 3: best = 3, drop index 0; 3 - 1 = 2 &lt; 3</td><td>—</td><td>[2, 3]</td></tr>
</table>
<p class="sub">
  The answer is 3 (the whole array). Each index enters the deque once and
  leaves once, so the time is O(n) and the space is O(n) for the prefix array.
  Using <code>shift()</code> instead of a head pointer would hide an O(n)
  inside the loop, as discussed in the deque section. The structure is the
  deque of the sliding-window maximum, with two differences: values are
  prefix sums, and the front is also popped on a <em>success</em>, not only when
  it falls out of a fixed-size window.
</p>

<h3>Deque with DP: Jump Game VI</h3>
<p>
  You start at index 0 and may jump forward by 1 to <code>k</code> steps; the
  score is the sum of the values you land on, including both ends. Find the
  maximum score at the last index. The DP is
  <code>dp[i] = nums[i] + max(dp[i - k .. i - 1])</code>, a maximum over a
  window of the last k DP values. Computing each maximum by scanning costs
  O(n · k); but "maximum of every window of size k" is the sliding window
  maximum. Keep a deque of indices whose DP values decrease, take the front as
  the window maximum, and push each new <code>dp[i]</code> after popping the
  smaller values behind it.
</p>
<pre><code>function maxResult(nums, k) {
  const n = nums.length;
  const dp = new Array(n);
  dp[0] = nums[0];
  const deque = [0]; <span class="c">// indices; dp values strictly decreasing from head to tail</span>
  let head = 0;

  for (let i = 1; i &lt; n; i++) {
    if (deque[head] &lt; i - k) head++; <span class="c">// the front can no longer reach i</span>
    dp[i] = nums[i] + dp[deque[head]];  <span class="c">// the best place to jump from</span>
    while (deque.length &gt; head &amp;&amp; dp[deque[deque.length - 1]] &lt;= dp[i]) deque.pop();
    deque.push(i);
  }
  return dp[n - 1];
}</code></pre>
<h4>Dry run: maxResult([1, -1, -2, 4, -7, 3], 2)</h4>
<table>
  <tr><th>i</th><th>Window of indices</th><th>Front (best dp)</th><th>dp[i]</th><th>Deque after</th></tr>
  <tr><td>0</td><td>—</td><td>—</td><td>1</td><td>[0]</td></tr>
  <tr><td>1</td><td>0</td><td>dp[0] = 1</td><td>-1 + 1 = 0</td><td>[0, 1]</td></tr>
  <tr><td>2</td><td>0, 1</td><td>dp[0] = 1</td><td>-2 + 1 = -1</td><td>[0, 1, 2]</td></tr>
  <tr><td>3</td><td>1, 2 (index 0 left)</td><td>dp[1] = 0</td><td>4 + 0 = 4</td><td>[3] (4 beats 0 and -1)</td></tr>
  <tr><td>4</td><td>2, 3</td><td>dp[3] = 4</td><td>-7 + 4 = -3</td><td>[3, 4]</td></tr>
  <tr><td>5</td><td>3, 4</td><td>dp[3] = 4</td><td>3 + 4 = 7</td><td>[5]</td></tr>
</table>
<p class="sub">
  The answer is 7, along the path 0, 1, 3, 5 (values 1, -1, 4, 3). O(n) time, O(n)
  space. The same trick speeds up any DP whose transition is "best of the
  previous k states": the deque holds dominated-free candidates, and the front is
  the maximum. When the transition takes a minimum, flip the comparison. The
  DP chapters mention this as the monotone-deque optimisation.
</p>

<h3>See the stack work</h3>
<p>Watch the stack stay decreasing. Every index is pushed once and popped at most once, which is the whole argument for O(n) despite the inner while loop.</p>

<div class="demo">
  <div class="demo__bar">Monotonic stack — next greater element</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="ms-code"></div>
        <div class="loop-bar"><i id="ms-bar"></i></div>
        <p class="loop-step" id="ms-step"></p>
        <div class="demo__ctl">
          <button class="btn" id="ms-prev" type="button">← Back</button>
          <button class="btn" id="ms-next" type="button">Next step →</button>
          <button class="btn" id="ms-play" type="button">Play</button>
          <button class="btn btn--ghost" id="ms-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Stack (indices waiting)</div>
          <div id="ms-p-stack"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Answers</div>
          <div id="ms-p-out"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="ms-cells"></div></div></div>
    <p class="demo__note" id="ms-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "ms";
  var CODE = ["const stack = [];","for (let i = 0; i < a.length; i++) {","  while (stack.length && a[stack.at(-1)] < a[i])","    res[stack.pop()] = a[i];","  stack.push(i);","}"];
  var STEPS = [{"cells":[{"v":"2","c":"","p":""},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":[]},"note":"For each element, find the next element to its right that is bigger. The stack holds indices still waiting for their answer.","line":1},{"cells":[{"v":"2","c":"hot","p":"i"},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[0] = 2.","line":2},{"cells":[{"v":"2","c":"hot","p":"i"},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 0. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total.","line":5},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"hot","p":"i"},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[1] = 1.","line":2},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"hot","p":"i"},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)","idx 1 (1)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 1. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total.","line":5},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"in","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)","idx 1 (1)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[2] = 5.","line":2},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"a[2] = 5 is bigger than a[1] = 1, so 1's answer is 5. Pop it — it never needs the stack again.","line":4},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"a[2] = 5 is bigger than a[0] = 2, so 2's answer is 5. Pop it — it never needs the stack again.","line":4},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 2 (5)"],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 2. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total.","line":5},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"in","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 2 (5)"],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[3] = 6.","line":2},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"a[3] = 6 is bigger than a[2] = 5, so 5's answer is 6. Pop it — it never needs the stack again.","line":4},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Push index 3. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total.","line":5},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"hot","p":"i"},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Look at a[4] = 2.","line":2},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"hot","p":"i"},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)","idx 4 (2)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Push index 4. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total.","line":5},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"in","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)","idx 4 (2)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Look at a[5] = 3.","line":2},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"out","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"a[5] = 3 is bigger than a[4] = 2, so 2's answer is 3. Pop it — it never needs the stack again.","line":4},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"out","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)","idx 5 (3)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"Push index 5. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total.","line":5},{"cells":[{"v":"2","c":"done","p":""},{"v":"1","c":"done","p":""},{"v":"5","c":"done","p":""},{"v":"6","c":"done","p":""},{"v":"2","c":"done","p":""},{"v":"3","c":"done","p":""}],"panels":{"stack":["idx 3 (6) — no answer","idx 5 (3) — no answer"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"Anything still on the stack has no greater element to its right. Final: [5, 5, 6, -1, 3, -1].","line":6}];
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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The literal words "next greater," "next smaller," "previous warmer day," "first element to the right that…" — that's a monotonic stack, unconditionally</li>
  <li>Each element needs its <b>span</b> or <b>boundaries</b> — "how far can this bar/temperature/stock price extend before something bigger stops it" (Daily Temperatures, Stock Span, Largest Rectangle, Maximal Rectangle, Sum of Subarray Minimums)</li>
  <li>The brute force is an O(n²) double loop where the inner loop scans rightward until a condition trips — that inner scan is what the stack amortizes away</li>
  <li>"Maximum/minimum of every window of size k" with a fixed k → monotonic <b>deque</b>. The extra front-eviction is the only difference from a stack</li>
  <li>Distinguish from a plain sliding window: sliding window maintains an aggregate (sum, count, set) that updates in O(1); monotonic structures maintain an <em>ordered candidate set</em> because the aggregate (max, min) can't be undone incrementally when an element leaves</li>
  <li>Distinguish from a heap: use a heap when you need the kth or the median, or when elements arrive without a scan order. Use a monotonic deque when a newer-and-better element makes an older one permanently irrelevant</li>
  <li>"How many days until," "how many consecutive days up to now" → distances: write <code>i - j</code> at pop time (Daily Temperatures) or <code>i - top</code> at push time (Stock Span)</li>
  <li>"Sum over all subarrays of their min or max" → the contribution technique: each element times (left extent × right extent), with strict on one side and non-strict on the other to break ties</li>
  <li>"Smallest result after deleting characters or digits," in order → a stack that pops a worse top while it is allowed to lose it (a budget of K, or a later copy)</li>
  <li>A pattern like "small, big, medium" over positions → scan from the end with a decreasing stack and remember the last popped value</li>
  <li>Moving things that merge when a faster one catches a slower one → sort by position and compare arrival times</li>
  <li>A sliding window on an array with negatives and a "sum at least K" target → prefix sums with a monotonic deque of candidate starts</li>
  <li>A DP of the form "best of the previous k states plus a cost" → a monotonic deque over the DP values</li>
  <li>Pitfalls: pushing values instead of indices (you'll need positions for widths), the wrong strictness on ties, forgetting the sentinel so the stack never drains, and assuming <code>shift()</code> is free</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Derive, don't recall, whether a stack should be increasing or decreasing for "next greater" versus "next smaller" — say the one-sentence reasoning out loud.</li>
    <li>Write <code>largestRectangleArea</code> from memory, including the sentinel bar, and explain both off-by-one traps in the width calculation.</li>
    <li>Explain why one decreasing-stack pass resolves both "next greater" (at pop time) and "previous greater" (at push time) without a second pass.</li>
    <li>Explain why <code>Array.prototype.shift()</code> silently breaks the promised O(n) bound for a monotonic deque, and what the head-pointer fix looks like.</li>
    <li>Given a new problem, decide between a monotonic stack/deque, a plain sliding window, and a heap — based on whether the aggregate can be "undone" when an element leaves.</li>
    <li>Write Daily Temperatures and Stock Span, and say which of the two writes its answer at pop time and which at push time.</li>
    <li>Compute Sum of Subarray Minimums by the contribution technique, and show with <code>[2, 2]</code> why one side of the tie must be strict and the other not.</li>
    <li>Build the smallest number by removing K digits, and explain the three edge cases: leftover deletions, leading zeros and the empty result.</li>
    <li>Say why Shortest Subarray with Sum at Least K cannot use a plain sliding window with negative numbers, and what the deque holds instead.</li>
    <li>Turn "dp[i] = nums[i] + max of the last k dp values" into an O(n) loop with a monotonic deque.</li>
  </ul>
</div>`,
};
