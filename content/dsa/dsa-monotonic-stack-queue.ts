import type { Chapter } from "../types";

export const dsaMonotonicStackQueue: Chapter = {
  id: "dsa-monotonic-stack-queue",
  num: "A8",
  title: "Monotonic stack & queue in depth",
  short: "Monotonic stack & queue",
  levels: ["advanced"],
  practice: [
    "ex-daily-temperatures",
    "ex-next-greater-element-i",
    "ex-next-greater-element-circular",
    "ex-largest-rectangle-histogram",
    "ex-maximal-rectangle",
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
    <span class="c">// whatever is on top now is i's PREVIOUS GREATER (or none if empty)</span>
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
  const stack = []; <span class="c">// indices; nums[stack] strictly decreasing</span>

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
  const stack = []; <span class="c">// indices; heights increasing bottom to top</span>
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
<table>
  <tr><th>i</th><th>h</th><th>popped (height)</th><th>left</th><th>width</th><th>area</th><th>best</th></tr>
  <tr><td>1</td><td>1</td><td>2</td><td>0</td><td>1</td><td>2</td><td>2</td></tr>
  <tr><td>4</td><td>2</td><td>6</td><td>3</td><td>1</td><td>6</td><td>6</td></tr>
  <tr><td>4</td><td>2</td><td>5</td><td>2</td><td>2</td><td><b>10</b></td><td><b>10</b></td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>3</td><td>5</td><td>1</td><td>3</td><td>10</td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>2</td><td>2</td><td>4</td><td>8</td><td>10</td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>1</td><td>0</td><td>6</td><td>6</td><td>10</td></tr>
</table>
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
  const stack = []; <span class="c">// indices; heights decreasing bottom to top</span>
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
  const dq = []; <span class="c">// indices; nums[dq] decreasing front to back</span>
  const out = [];

  for (let i = 0; i &lt; nums.length; i++) {
    if (dq.length &amp;&amp; dq[0] &lt;= i - k) dq.shift(); <span class="c">// front fell out of the window — evict</span>

    <span class="c">// anything smaller than nums[i] can never be a max again: nums[i] is newer AND bigger</span>
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


<h3>See the stack work</h3>
<p>Watch the stack stay decreasing. Every index is pushed once and popped at most once, which is the whole argument for O(n) despite the inner while loop.</p>

<div class="demo">
  <div class="demo__bar">Monotonic stack — next greater element</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="ms-code"></div>
        <div class="loop-bar"><i id="ms-bar"></i></div>
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
  var STEPS = [{"cells":[{"v":"2","c":"","p":""},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":[]},"note":"For each element, find the next element to its right that is bigger. The stack holds indices still waiting for their answer."},{"cells":[{"v":"2","c":"hot","p":"i"},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[0] = 2."},{"cells":[{"v":"2","c":"hot","p":"i"},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 0. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"hot","p":"i"},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[1] = 1."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"hot","p":"i"},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)","idx 1 (1)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 1. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"in","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)","idx 1 (1)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[2] = 5."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"a[2] = 5 is bigger than a[1] = 1, so 1's answer is 5. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"a[2] = 5 is bigger than a[0] = 2, so 2's answer is 5. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 2 (5)"],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 2. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"in","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 2 (5)"],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[3] = 6."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"a[3] = 6 is bigger than a[2] = 5, so 5's answer is 6. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Push index 3. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"hot","p":"i"},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Look at a[4] = 2."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"hot","p":"i"},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)","idx 4 (2)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Push index 4. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"in","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)","idx 4 (2)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Look at a[5] = 3."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"out","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"a[5] = 3 is bigger than a[4] = 2, so 2's answer is 3. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"out","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)","idx 5 (3)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"Push index 5. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"done","p":""},{"v":"1","c":"done","p":""},{"v":"5","c":"done","p":""},{"v":"6","c":"done","p":""},{"v":"2","c":"done","p":""},{"v":"3","c":"done","p":""}],"panels":{"stack":["idx 3 (6) — no answer","idx 5 (3) — no answer"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"Anything still on the stack has no greater element to its right. Final: [5, 5, 6, -1, 3, -1]."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
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
  <li>Pitfalls: pushing values instead of indices (you'll need positions for widths), the wrong strictness on ties, forgetting the sentinel so the stack never drains, and assuming <code>shift()</code> is free</li>
</ul>`,
};
