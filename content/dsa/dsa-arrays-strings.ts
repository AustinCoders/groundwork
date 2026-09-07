import type { Chapter } from "../types";

export const dsaArraysStrings: Chapter = {
  id: "dsa-arrays-strings",
  num: "B2",
  title: "Arrays & strings",
  short: "Arrays & strings",
  levels: ["beginner"],
  practice: [
    "ex-best-time-to-buy-and-sell-stock",
    "ex-maximum-subarray",
    "ex-merge-sorted-array",
    "ex-remove-duplicates-from-sorted-array",
    "ex-rotate-array",
    "ex-product-of-array-except-self",
    "ex-majority-element",
    "ex-move-zeroes",
    "ex-contains-duplicate",
    "ex-missing-number",
    "ex-find-disappeared-numbers",
    "ex-subarray-sum-equals-k",
    "ex-continuous-subarray-sum",
    "ex-max-size-subarray-sum-equals-k",
    "ex-contiguous-array",
    "ex-find-pivot-index",
    "ex-range-sum-query-immutable",
    "ex-longest-common-prefix",
    "ex-reverse-string-in-place",
    "ex-reverse-words-in-string",
    "ex-string-to-integer-atoi",
    "ex-integer-to-roman",
    "ex-roman-to-integer",
    "ex-zigzag-conversion",
  ],
  ready: true,
  subtitle: "The two data structures every other pattern is built on top of.",
  body: `<h3>What "beginner" means for this chapter</h3>
<p>
  If arrays and strings already feel completely automatic to you, skim
  this one — but don't skip it. The interview traps in this chapter
  (accidental O(n²) string building, <code>unshift</code>'s hidden cost,
  the shared-reference 2D array bug) are some of the most common ways
  strong candidates lose points on otherwise-correct solutions.
</p>

<h3>An array is a promise about memory</h3>
<p>
  A JS array is really a resizable list, but the mental model interviewers
  expect comes from the lower-level version: a contiguous block of memory
  where <b>index math replaces searching</b>. Because every slot is the
  same fixed size apart, the address of index <code>i</code> is just
  <code>base + i × size</code> — no walking, no scanning. That's the whole
  reason <code>arr[i]</code> is O(1): it's arithmetic, not a lookup.
</p>

<figure>
  <svg viewBox="0 0 640 160" class="dg" role="img" aria-label="An array as contiguous memory slots, each reachable directly by index arithmetic">
    <g class="rough">
      <rect class="box" x="20" y="40" width="80" height="60" />
      <rect class="box" x="100" y="40" width="80" height="60" />
      <rect class="box" x="180" y="40" width="80" height="60" />
      <rect class="box" x="260" y="40" width="80" height="60" />
      <rect class="box" x="340" y="40" width="80" height="60" />
    </g>
    <text class="sm" x="60" y="75" text-anchor="middle">7</text>
    <text class="sm" x="140" y="75" text-anchor="middle">3</text>
    <text class="sm" x="220" y="75" text-anchor="middle">9</text>
    <text class="sm" x="300" y="75" text-anchor="middle">1</text>
    <text class="sm" x="380" y="75" text-anchor="middle">5</text>
    <text class="sm" x="60" y="118" text-anchor="middle">[0]</text>
    <text class="sm" x="140" y="118" text-anchor="middle">[1]</text>
    <text class="sm" x="220" y="118" text-anchor="middle">[2]</text>
    <text class="sm" x="300" y="118" text-anchor="middle">[3]</text>
    <text class="sm" x="380" y="118" text-anchor="middle">[4]</text>
    <text class="lbl" x="440" y="65" style="font-size:16px">arr[3] = base + 3×size</text>
    <text class="sm" x="440" y="88">no scanning — direct math</text>
  </svg>
  <figcaption>Index access is a formula, not a search — that's the entire source of O(1).</figcaption>
</figure>

<h3>What's actually O(1) vs O(n) on an array</h3>
<table>
  <tr><th>Operation</th><th>Complexity</th><th>Why</th></tr>
  <tr><td>Read/write by index</td><td>O(1)</td><td>direct address math</td></tr>
  <tr><td>Push/pop at the end</td><td>O(1) amortized</td><td>no shifting needed</td></tr>
  <tr><td>Shift/unshift at the start</td><td>O(n)</td><td>every other element moves over</td></tr>
  <tr><td><code>splice()</code> in the middle</td><td>O(n)</td><td>everything after the cut shifts</td></tr>
  <tr><td>Search by value (<code>indexOf</code>, <code>includes</code>)</td><td>O(n)</td><td>no shortcut — has to walk it</td></tr>
</table>
<figure>
  <svg viewBox="0 0 640 340" class="dg" role="img" aria-label="Before: three elements sit at indices 0, 1 and 2. After unshift, each of those three elements has moved one slot to the right, and the new element fills the now-empty index 0.">
    <text class="lbl" x="20" y="20" style="font-size:15px">BEFORE — arr = [7, 3, 9], 3 elements at indices 0, 1, 2</text>
    <g class="rough">
      <rect class="box" x="20" y="35" width="70" height="50" />
      <rect class="box" x="90" y="35" width="70" height="50" />
      <rect class="box" x="160" y="35" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="65" text-anchor="middle">7</text>
    <text class="sm" x="125" y="65" text-anchor="middle">3</text>
    <text class="sm" x="195" y="65" text-anchor="middle">9</text>
    <text class="sm" x="55" y="100" text-anchor="middle">[0]</text>
    <text class="sm" x="125" y="100" text-anchor="middle">[1]</text>
    <text class="sm" x="195" y="100" text-anchor="middle">[2]</text>

    <path class="lnr" d="M55,90 C 55,130 125,140 125,183" fill="none" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M125,90 C 125,130 195,140 195,183" fill="none" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M195,90 C 195,130 265,140 265,183" fill="none" marker-end="url(#dgarrow3)" />
    <defs>
      <marker id="dgarrow3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="sm rd" x="330" y="140" text-anchor="middle">each one moves one slot right — O(n) total</text>

    <text class="lbl" x="20" y="215" style="font-size:15px">AFTER — unshift(x) fills the now-empty index 0</text>
    <g class="rough">
      <rect class="boxg" x="20" y="230" width="70" height="50" />
      <rect class="box" x="90" y="230" width="70" height="50" />
      <rect class="box" x="160" y="230" width="70" height="50" />
      <rect class="box" x="230" y="230" width="70" height="50" />
    </g>
    <text class="sm gr" x="55" y="260" text-anchor="middle">x</text>
    <text class="sm" x="125" y="260" text-anchor="middle">7</text>
    <text class="sm" x="195" y="260" text-anchor="middle">3</text>
    <text class="sm" x="265" y="260" text-anchor="middle">9</text>
    <text class="sm" x="55" y="295" text-anchor="middle">[0]</text>
    <text class="sm" x="125" y="295" text-anchor="middle">[1]</text>
    <text class="sm" x="195" y="295" text-anchor="middle">[2]</text>
    <text class="sm" x="265" y="295" text-anchor="middle">[3]</text>
    <text class="lbl gr" x="20" y="320" style="font-size:13px">7 is now at [1] not [0], 3 is now at [2] not [1], 9 is now at [3] not [2]</text>
  </svg>
  <figcaption>Every element's INDEX changes, which means every element's underlying memory slot changes too — that's the O(n) work, done before x even gets placed at [0].</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ The interview trap</span>
  <code>arr.unshift(x)</code> and <code>arr.shift()</code> <em>feel</em> like
  O(1) because they're one method call — they're not. Every remaining
  element has to physically move one slot over. If you reach for these
  inside a loop, you've likely turned an O(n) solution into O(n²) by
  accident.
</div>

<h3>Strings are arrays with one extra rule</h3>
<p>
  In JS, strings are <b>immutable</b> — <code>str[0] = "x"</code> silently
  does nothing. Every "mutation" (<code>slice</code>, <code>+</code>,
  <code>replace</code>) actually builds a brand new string. That has a real
  cost: repeatedly concatenating inside a loop is O(n) <em>per
  concatenation</em>, so a naive loop that builds a string character by
  character is O(n²), not O(n).
</p>
<pre><code><span class="c">// O(n²) — each += allocates a new string of growing length</span>
function buildSlow(chars) {
  let out = "";
  for (const c of chars) out += c;
  return out;
}

<span class="c">// O(n) — push to an array (O(1) amortized), join once at the end</span>
function buildFast(chars) {
  const parts = [];
  for (const c of chars) parts.push(c);
  return parts.join("");
}</code></pre>

<h3>The in-place pattern</h3>
<p>
  A huge share of array interview questions ask for O(1) extra space,
  which means mutating the input instead of allocating a new array. The
  standard tool is <b>swap-and-shrink</b>: walk with two indices, overwrite
  in place, and treat everything past a "write pointer" as garbage.
</p>
<pre><code><span class="c">// remove all occurrences of val, in place, return new length</span>
function removeElement(nums, val) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== val) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write; <span class="c">// [0, write) is the real answer</span>
}</code></pre>
<p class="sub">
  This "read pointer scans everything, write pointer only advances on a
  keep" shape reappears constantly — it's the seed of the two-pointers
  chapter next.
</p>

<h3>Prefix sums — turn O(n) range queries into O(1)</h3>
<p>
  If you're going to ask "what's the sum of elements from index i to j?"
  <em>more than once</em> on the same array, recomputing each sum by
  scanning is wasteful. Precompute a running total once — O(n) — and every
  range sum after that is a subtraction, O(1).
</p>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="A prefix sum array where each entry holds the running total up to that index, letting a range sum be computed as a single subtraction">
    <g class="rough">
      <rect class="box" x="20" y="20" width="70" height="40" />
      <rect class="box" x="90" y="20" width="70" height="40" />
      <rect class="box" x="160" y="20" width="70" height="40" />
      <rect class="box" x="230" y="20" width="70" height="40" />
      <rect class="box" x="300" y="20" width="70" height="40" />
    </g>
    <text class="sm" x="55" y="45" text-anchor="middle">3</text>
    <text class="sm" x="125" y="45" text-anchor="middle">1</text>
    <text class="sm" x="195" y="45" text-anchor="middle">4</text>
    <text class="sm" x="265" y="45" text-anchor="middle">1</text>
    <text class="sm" x="335" y="45" text-anchor="middle">5</text>
    <text class="lbl" x="20" y="85" style="font-size:13px">original array</text>

    <g class="rough">
      <rect class="boxg" x="20" y="100" width="70" height="40" />
      <rect class="boxg" x="90" y="100" width="70" height="40" />
      <rect class="boxy" x="160" y="100" width="70" height="40" />
      <rect class="box" x="230" y="100" width="70" height="40" />
      <rect class="boxy" x="300" y="100" width="70" height="40" />
    </g>
    <text class="sm gr" x="55" y="125" text-anchor="middle">3</text>
    <text class="sm gr" x="125" y="125" text-anchor="middle">4</text>
    <text class="sm" x="195" y="125" text-anchor="middle">8</text>
    <text class="sm" x="265" y="125" text-anchor="middle">9</text>
    <text class="sm" x="335" y="125" text-anchor="middle">14</text>
    <text class="lbl" x="20" y="160" style="font-size:13px">sum(1..4) = prefix[4] − prefix[0] = 14 − 3 = 11</text>
    <text class="lbl" x="20" y="182" style="font-size:13px">prefix[i] = sum of everything up to and including index i</text>
  </svg>
  <figcaption>One O(n) pass builds the prefix array; every range sum after that is O(1) — a single subtraction.</figcaption>
</figure>
<pre><code>function buildPrefixSums(nums) {
  const prefix = new Array(nums.length);
  prefix[0] = nums[0];
  for (let i = 1; i < nums.length; i++) {
    prefix[i] = prefix[i - 1] + nums[i];
  }
  return prefix;
}

<span class="c">// sum of nums[left..right] inclusive, O(1) after O(n) preprocessing</span>
function rangeSum(prefix, left, right) {
  return left === 0 ? prefix[right] : prefix[right] - prefix[left - 1];
}</code></pre>
<p class="sub">
  This is the single highest-leverage array trick for "answer many range
  queries" problems — it turns what looks like it needs O(n) per query
  (O(n·q) for q queries) into O(n) total preprocessing plus O(1) per
  query. The same idea extends to 2D (a prefix-sum matrix for rectangle
  sums) and to counting problems (prefix counts of a condition).
</p>

<h3>Kadane's algorithm — the maximum subarray, in one pass</h3>
<p>
  "Find the contiguous subarray with the largest sum" looks like it needs
  checking every subarray — O(n²). Kadane's insight: at each position,
  the best subarray ending <em>here</em> is either "extend the previous
  best" or "start fresh from here" — whichever is bigger — because a
  negative running sum can only ever hurt what comes after it.
</p>
<pre><code>function maxSubArray(nums) {
  let bestSoFar = nums[0];
  let bestEndingHere = nums[0];

  for (let i = 1; i < nums.length; i++) {
    bestEndingHere = Math.max(nums[i], bestEndingHere + nums[i]);
    bestSoFar = Math.max(bestSoFar, bestEndingHere);
  }
  return bestSoFar;
}</code></pre>
<p><code>nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]</code>:</p>
<table>
  <tr><th>i</th><th>nums[i]</th><th>bestEndingHere</th><th>bestSoFar</th></tr>
  <tr><td>0</td><td>-2</td><td>-2</td><td>-2</td></tr>
  <tr><td>1</td><td>1</td><td>max(1, -2+1)=1</td><td>1</td></tr>
  <tr><td>2</td><td>-3</td><td>max(-3, 1-3)=-2</td><td>1</td></tr>
  <tr><td>3</td><td>4</td><td>max(4, -2+4)=4</td><td>4</td></tr>
  <tr><td>4</td><td>-1</td><td>max(-1, 4-1)=3</td><td>4</td></tr>
  <tr><td>5</td><td>2</td><td>max(2, 3+2)=5</td><td>5</td></tr>
  <tr><td>6</td><td>1</td><td>max(1, 5+1)=6</td><td>6</td></tr>
  <tr><td>7</td><td>-5</td><td>max(-5, 6-5)=1</td><td>6</td></tr>
  <tr><td>8</td><td>4</td><td>max(4, 1+4)=5</td><td>6</td></tr>
</table>
<p class="sub">
  Answer: 6, from subarray <code>[4, -1, 2, 1]</code>. This is O(n) time,
  O(1) space — and it's the template for a whole family of "best
  contiguous X" problems (max product subarray, circular array variants).
</p>

<h3>Rotating an array in O(1) space — the triple-reversal trick</h3>
<p>
  Rotating right by k with a new array is easy but O(n) space. The
  in-place version uses a neat property: reversing the whole array, then
  reversing each of the two pieces that should end up in the "wrong"
  order, produces a correct rotation.
</p>
<pre><code>function rotate(nums, k) {
  k = k % nums.length;
  reverse(nums, 0, nums.length - 1);  <span class="c">// reverse everything</span>
  reverse(nums, 0, k - 1);            <span class="c">// un-reverse the first k</span>
  reverse(nums, k, nums.length - 1);  <span class="c">// un-reverse the rest</span>
}

function reverse(arr, lo, hi) {
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++; hi--;
  }
}
<span class="c">// [1,2,3,4,5,6,7], k=3
   reverse all    → [7,6,5,4,3,2,1]
   reverse [0,k)  → [5,6,7,4,3,2,1]
   reverse [k,n)  → [5,6,7,1,2,3,4]  ← correctly rotated right by 3</span></code></pre>
<p class="sub">
  Three O(n) reversals is still O(n) total, but O(1) extra space instead
  of O(n) — the kind of tradeoff interviewers specifically probe for with
  "can you do it without the extra array?"
</p>

<h3>2D arrays — same rules, one more dimension</h3>
<p>
  A 2D array in JS is really an array of arrays — each row is its own
  separate array object, stored at scattered locations (unlike a true
  contiguous 2D block in lower-level languages). <code>grid[i][j]</code>
  is still O(1): it's two index lookups chained, each O(1).
</p>
<figure>
  <svg viewBox="0 0 500 190" class="dg" role="img" aria-label="A 2D array as an array of separate row arrays, each row its own object, indexed as grid of i then j">
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="130" height="30" />
      <rect class="boxy" x="20" y="60" width="130" height="30" />
      <rect class="boxy" x="20" y="100" width="130" height="30" />
      <rect class="box" x="220" y="10" width="220" height="34" />
      <rect class="box" x="220" y="55" width="220" height="34" />
      <rect class="box" x="220" y="100" width="220" height="34" />
    </g>
    <text class="sm" x="85" y="40" text-anchor="middle">grid[0] →</text>
    <text class="sm" x="85" y="80" text-anchor="middle">grid[1] →</text>
    <text class="sm" x="85" y="120" text-anchor="middle">grid[2] →</text>
    <text class="sm" x="330" y="32" text-anchor="middle">1  2  3</text>
    <text class="sm" x="330" y="77" text-anchor="middle">4  5  6</text>
    <text class="sm" x="330" y="122" text-anchor="middle">7  8  9</text>
    <text class="lbl" x="20" y="165" style="font-size:13px">grid[1][2] → row 1, then index 2 within it → 6. Two O(1) lookups, chained.</text>
  </svg>
  <figcaption>Three separate row arrays, not one contiguous block — which is exactly why the fill()-sharing bug below happens.</figcaption>
</figure>
<pre><code><span class="c">// row-major traversal — the standard order, matches memory/cache-friendly access</span>
function traverse2D(grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      console.log(grid[row][col]);
    }
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The shared-row bug</span>
  <code>Array(n).fill(Array(m).fill(0))</code> creates <b>one</b> inner
  array and reuses the same reference for every row — mutate
  <code>grid[0][0]</code> and you'll find <code>grid[1][0]</code> changed
  too. Build each row independently instead:
  <pre><code>const grid = Array.from({ length: n }, () => Array(m).fill(0));</code></pre>
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "Arrays give O(1) random
  access because the address is computed, not searched — but any operation
  that has to shift elements is O(n), and strings are immutable so
  building one char-by-char in a loop is O(n²) unless you batch it."
</div>

<h3>Common gotchas worth knowing cold</h3>
<ul>
  <li><b>Sparse arrays</b> — <code>new Array(5)</code> creates 5 empty
    slots, not zeros; <code>.map()</code> skips them.</li>
  <li><b>Copying</b> — <code>const b = a</code> copies the reference, not
    the array. Use <code>[...a]</code> or <code>a.slice()</code> for a
    shallow copy.</li>
  <li><b><code>sort()</code> mutates</b> the original array and defaults to
    <em>string</em> comparison — <code>[10, 2, 1].sort()</code> gives
    <code>[1, 10, 2]</code> unless you pass a comparator.</li>
  <li><b>Dynamic array growth</b> is covered in depth in the complexity
    chapter's amortized-analysis section — the short version:
    <code>push()</code> is amortized O(1) because the underlying buffer
    doubles instead of growing by one each time.</li>
</ul>`,
};
