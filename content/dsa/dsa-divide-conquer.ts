import type { Chapter } from "../types";

export const dsaDivideConquer: Chapter = {
  id: "dsa-divide-conquer",
  num: "I21",
  title: "Divide and conquer and selection",
  short: "Divide and conquer",
  levels: ["intermediate"],
  prerequisites: ["dsa-basic-recursion", "dsa-sorting-algorithms"],
  practice: [
    "ex-count-inversions",
    "ex-reverse-pairs",
    "ex-count-of-smaller-numbers-after-self",
    "ex-quickselect-kth-largest",
    "ex-max-subarray-summary-merge",
    "ex-count-range-sum-merge-sort",
    "ex-the-skyline-problem",
    "ex-closest-pair-of-points",
    "ex-different-ways-to-add-parentheses",
    "ex-majority-element-or-none",
    "ex-pow-x-n",
    "ex-kth-of-two-sorted-arrays",
    "ex-median-two-sorted-arrays",
    "ex-longest-substring-at-least-k-repeats",
    "ex-merge-k-sorted-arrays-halving",
  ],
  ready: true,
  subtitle:
    "Cut the input in two, solve each half, and the whole difficulty moves into one question: what can the answer be that neither half sees?",
  body: `<h3>The shape: split, solve, combine</h3>
<p>
  Some problems get easier when the input is cut in two. Cut it, solve each half
  as if it were the whole problem, and stitch the two answers into the answer
  for the whole. That is <b>divide and conquer</b>, and it has exactly three
  moving parts: a <b>split</b> that makes two smaller instances of the
  <em>same</em> problem, a <b>base case</b> small enough to answer on sight, and a
  <b>combine</b> step that turns the two sub-answers into one. If you can say what
  each part is, you can write the function; the first two are usually a line each,
  and almost all of the thinking goes into the third.
</p>
<pre><code>function solve(lo, hi) {                          <span class="c">// answers the question for the half-open range [lo, hi)</span>
  if (hi - lo &lt;= 1) return baseCase(lo, hi);      <span class="c">// size 0 or 1: answer on sight</span>
  const mid = lo + ((hi - lo) &gt;&gt; 1);
  const left = solve(lo, mid);                    <span class="c">// divide: two independent halves</span>
  const right = solve(mid, hi);
  return combine(left, right, lo, mid, hi);       <span class="c">// the whole difficulty lives here</span>
}</code></pre>
<p>
  Two properties make this different from the recursion you have already seen.
  The subproblems are <b>independent</b>: the left half never needs anything the
  right half computed, so they can be solved in either order, and the only place
  the two meet is the combine. And they are <b>disjoint</b>: no piece of the input
  is solved twice. When subproblems <em>overlap</em> (the same smaller question
  reached by several routes) you are in dynamic programming territory, covered in
  <a href="/dsa/dsa-dp-1d">DP in one dimension</a>, and a cache is what saves you,
  not the split. Backtracking is another relative: it also recurses, but it
  explores choices and undoes them, rather than splitting the data in two.
</p>
<p>
  This chapter assumes the <a href="/dsa/dsa-basic-recursion">recursion</a> and
  <a href="/dsa/dsa-sorting-algorithms">sorting</a> chapters. Merge sort,
  quickselect, counting inversions and the n log n lower bound already live in
  the sorting chapter, and this chapter does not repeat them; it uses them as the
  worked examples of a pattern and then applies the pattern to problems that
  sorting alone does not solve.
</p>
<div class="warn">
  <span class="ttl">⚠ The base case is "size 1", not only "size 0"</span>
  With a half-open range, the split <code>[lo, mid)</code> and <code>[mid, hi)</code>
  makes progress only when <code>hi - lo &gt;= 2</code>: a range of size 1 would split
  into an empty half and itself, and recurse forever. So a function whose base case
  is exactly <code>hi - lo === 1</code> never stops on an empty input
  (<code>solve(0, 0)</code> splits into <code>solve(0, 0)</code> again). Decide what
  an empty input means before you write the recursion, and handle it once, at the top.
</div>

<h3>Where you have already used it</h3>
<p>
  The pattern is older than this chapter. Looking at the algorithms you know as
  instances of it shows the one design question that separates them: <em>where does the work
  happen, before the recursive calls or after them?</em>
</p>
<table>
  <tr><th>Algorithm</th><th>Split</th><th>Combine</th><th>Recurrence</th><th>Details</th></tr>
  <tr><td>Merge sort</td><td>the middle index</td><td>merge two sorted halves, O(n)</td><td>T(n) = 2T(n/2) + n</td><td><a href="/dsa/dsa-sorting-algorithms">Sorting</a>, merge sort</td></tr>
  <tr><td>Quicksort</td><td>partition around a pivot value (the work is here)</td><td>nothing: the halves are already in place</td><td>T(n) = T(k) + T(n − k) + n</td><td>Sorting, quicksort</td></tr>
  <tr><td>Quickselect</td><td>partition, then keep only the side that holds index k</td><td>nothing</td><td>T(n) = T(part) + n</td><td>Sorting, quickselect</td></tr>
  <tr><td>Binary search</td><td>the middle index, keep one half</td><td>nothing</td><td>T(n) = T(n/2) + 1</td><td><a href="/dsa/dsa-binary-search">Binary search</a></td></tr>
  <tr><td>Fast exponentiation</td><td>exponent n becomes ⌊n/2⌋</td><td>one multiplication</td><td>T(n) = T(n/2) + 1</td><td>Recursion, fast exponentiation</td></tr>
  <tr><td>Counting inversions</td><td>the middle index</td><td>count the pairs that straddle the split, while merging</td><td>T(n) = 2T(n/2) + n</td><td>Sorting, counting inversions</td></tr>
</table>
<p class="sub">
  Merge sort does its work in the combine (after the calls); quicksort does it in the
  split (before the calls) and has an empty combine. The problems below all
  look like merge sort: the split is trivial (cut in the middle) and the combine is
  where the question gets answered. One more fact from the sorting chapter is
  worth keeping in mind as a ceiling: no comparison-based method can sort in
  fewer than about n log₂ n comparisons, so a divide-and-conquer sort that reaches
  O(n log n) is as good as comparison sorting gets.
</p>

<h3>Reading the recurrence off the code</h3>
<p>
  Once you have a divide-and-conquer function you can read its running time
  straight from its shape, without a theorem. Write down three numbers:
  <b>a</b>, the number of recursive calls; <b>b</b>, the factor by which the input
  shrinks (2 for a halving); and <b>f(n)</b>, the work done outside the recursive
  calls (the combine plus any splitting). The cost obeys
  <code>T(n) = a · T(n/b) + f(n)</code>. The
  <a href="/dsa/dsa-complexity-analysis">complexity chapter</a> states the
  master theorem for this; here is the picture behind it, which is easier to
  remember than three cases.
</p>
<p>
  Draw the recursion tree. At depth k there are aᵏ calls, each on an input of size
  n/bᵏ. So the work done at depth k is the number of calls times the work per call,
  <code>aᵏ · f(n/bᵏ)</code>, and the total is the sum over all depths, about log_b n
  of them. When f(n) is n<sup>d</sup>, the work at depth k is n<sup>d</sup> times
  <code>(a / b<sup>d</sup>)ᵏ</code>, so everything depends on one ratio
  <code>r = a / b<sup>d</sup></code>:
</p>
<ul>
  <li><b>r &lt; 1</b>: each level does less than the one above it, the sum is a shrinking geometric series, and the <b>root dominates</b>: T(n) = O(n<sup>d</sup>), just the top-level combine.</li>
  <li><b>r = 1</b>: every level does the same work, so the total is the work per level times the number of levels: O(n<sup>d</sup> · log n). Merge sort is here, with n work on each of log₂ n levels.</li>
  <li><b>r &gt; 1</b>: each level does more than the one above, and the <b>leaves dominate</b>. There are a<sup>log_b n</sup> = n<sup>log_b a</sup> of them, so T(n) = O(n<sup>log_b a</sup>).</li>
</ul>
<table>
  <tr><th>Algorithm</th><th>Recurrence</th><th>a, b, d</th><th>r = a / bᵈ</th><th>T(n)</th></tr>
  <tr><td>Binary search; fast exponentiation</td><td>T(n/2) + 1</td><td>1, 2, 0</td><td>1</td><td>O(log n)</td></tr>
  <tr><td>Quickselect, if every pivot split the input in half</td><td>T(n/2) + n</td><td>1, 2, 1</td><td>1/2</td><td>O(n)</td></tr>
  <tr><td>Merge sort; counting inversions; the crossing scan for maximum subarray</td><td>2T(n/2) + n</td><td>2, 2, 1</td><td>1</td><td>O(n log n)</td></tr>
  <tr><td>Maximum subarray with prefix/suffix summaries (below)</td><td>2T(n/2) + 1</td><td>2, 2, 0</td><td>2</td><td>O(n)</td></tr>
  <tr><td>The two-call mistake <code>pow(x, n/2) * pow(x, n/2)</code></td><td>2T(n/2) + 1</td><td>2, 2, 0</td><td>2</td><td>O(n)</td></tr>
  <tr><td>Multiplying big numbers with three half-size products (Karatsuba)</td><td>3T(n/2) + n</td><td>3, 2, 1</td><td>3/2</td><td>O(n<sup>1.585</sup>)</td></tr>
  <tr><td>Multiplying matrices with seven half-size products (Strassen)</td><td>7T(n/2) + n²</td><td>7, 2, 2</td><td>7/4</td><td>O(n<sup>2.807</sup>)</td></tr>
</table>
<p class="sub">
  The last two rows are why the recurrence is worth reading: in both, the combine
  is cheap and the whole improvement comes from lowering <b>a</b> by one. The
  quickselect row is the idealized best case; the sorting chapter proves the
  average for a random pivot. The recurrence assumes equal-sized halves: the
  merge sort bound needs the split to be balanced, and the next paragraphs show
  what happens when it is not.
</p>
<p>
  <b>Three ways the code costs more than the recurrence you meant to write.</b>
  First, a <b>lopsided split</b>. Quicksort with a pivot that peels off one element
  has T(n) = T(n − 1) + n, which is n²/2 steps, not n log n. Second, <b>copying in
  the split</b>. This version of "largest element" copies each half:
</p>
<pre><code>function maxSliced(nums) {
  if (nums.length === 1) return nums[0];
  const mid = nums.length &gt;&gt; 1;
  return Math.max(maxSliced(nums.slice(0, mid)), maxSliced(nums.slice(mid)));   <span class="c">// copies every element, every level</span>
}

function maxRange(nums, lo = 0, hi = nums.length) {
  if (hi - lo === 1) return nums[lo];
  const mid = lo + ((hi - lo) &gt;&gt; 1);
  return Math.max(maxRange(nums, lo, mid), maxRange(nums, mid, hi));            <span class="c">// passes indexes, copies nothing</span>
}</code></pre>
<p class="sub">
  The recurrence for the range version is 2T(n/2) + 1, which is O(n). The sliced
  version pays n elements of copying per level, so it is 2T(n/2) + n, which is
  O(n log n); for 1,024 elements the slices copy 10,240 elements in total, and the
  range version copies none. This is the same cost the recursion chapter
  warned about for <code>slice</code>, and the cure is the same: pass index ranges.
</p>
<p>
  Third, <b>a combine that does more than you think</b>. A combine that sorts the
  merged pieces again costs n log n per level, so the recurrence is
  2T(n/2) + n log n and the total is O(n log² n): there are log n levels and
  each does about n log n. The closest-pair algorithm below has exactly this
  trap, and carrying the sorted order up from the recursion is how it avoids it.
</p>

<h3>Finding the combine step</h3>
<p>
  The method for any new problem: pretend the two recursive calls have already
  come back with the right answer for the left half and the right half, and ask
  <b>what could the answer for the whole range be that neither half can see?</b>
  The candidates fall into three families.
</p>
<figure>
  <svg viewBox="0 0 640 224" class="dg" role="img" aria-label="An array of eight cells split at the middle, with three brackets: an answer entirely inside the left half, one entirely inside the right half, and one that crosses the middle line and can only be found by the combine step">
    <g class="rough">
      <rect class="box" x="80" y="30" width="60" height="38" />
      <rect class="box" x="140" y="30" width="60" height="38" />
      <rect class="box" x="200" y="30" width="60" height="38" />
      <rect class="box" x="260" y="30" width="60" height="38" />
      <rect class="box" x="320" y="30" width="60" height="38" />
      <rect class="box" x="380" y="30" width="60" height="38" />
      <rect class="box" x="440" y="30" width="60" height="38" />
      <rect class="box" x="500" y="30" width="60" height="38" />
      <path class="ln dash" d="M320,22 L320,82" />
    </g>
    <text class="lbl rd" x="320" y="16" text-anchor="middle" style="font-size:13px">mid</text>
    <g class="rough">
      <path class="lng" d="M84,92 L84,102 L256,102 L256,92" />
      <path class="lng" d="M384,92 L384,102 L556,102 L556,92" />
      <path class="lnr" d="M200,132 L200,142 L440,142 L440,132" />
    </g>
    <text class="sm gr" x="170" y="122" text-anchor="middle">inside the left half</text>
    <text class="sm gr" x="470" y="122" text-anchor="middle">inside the right half</text>
    <text class="sm rd" x="320" y="162" text-anchor="middle">crosses mid</text>
    <text class="lbl" x="20" y="192" style="font-size:14px">the recursion already finds the first two; the combine step exists to find the third</text>
    <text class="lbl" x="20" y="214" style="font-size:14px">or to join the two sub-answers into one, when the answer is built from both halves</text>
  </svg>
  <figcaption>For most problems the answer is the best of three things: the left half's answer, the right half's answer, and something that straddles the split.</figcaption>
</figure>
<ol>
  <li><b>The answer lives in one half.</b> Take the better of the two sub-answers (the maximum of an array, the winning candidate). The combine is O(1), or it checks which half to keep.</li>
  <li><b>The answer may straddle the split.</b> The halves report their own best, and the combine must find the best thing that uses both sides: a subarray that crosses the middle, a pair with one point on each side. This is the family of most of the problems below.</li>
  <li><b>The answer is built from both.</b> The sub-answers are not candidates but ingredients: two outlines to merge into one, two lists of results to pair up.</li>
</ol>
<div class="sticky mint">
  <span class="ttl">The question to ask of any new problem</span>
  Suppose both halves are already solved. What could the answer for the whole be that neither half can see?
  The combine step is the answer to that question.
</div>
<p>
  The extra fact is a design choice: <b>the recursive call may return more than the
  original question asks for.</b> Merge sort returns the <em>sorted</em> half
  because the combine needs it sorted. The maximum-subarray version below
  returns four numbers per range instead of one, because the combine needs the best
  prefix and suffix. When your combine is stuck, ask what extra fact about each half
  would make it easy, and have the recursion return that too.
</p>
<table>
  <tr><th>Problem</th><th>What each half reports</th><th>What only the combine can see</th><th>Combine cost</th></tr>
  <tr><td>Maximum subarray</td><td>best sum inside</td><td>the best subarray through the middle</td><td>O(n) scan outward, or O(1) with prefix, suffix and total</td></tr>
  <tr><td>Count smaller after self</td><td>counts for its own elements, and its elements sorted</td><td>for each left element, how many right elements are smaller</td><td>O(n), during the merge</td></tr>
  <tr><td>Count of range sum</td><td>the count inside, and prefix sums sorted</td><td>cross pairs whose difference is in range</td><td>O(n), two pointers on sorted halves</td></tr>
  <tr><td>Skyline</td><td>the outline of its buildings</td><td>where the two outlines overlap</td><td>O(n) merge sweep</td></tr>
  <tr><td>Closest pair</td><td>closest distance inside, and its points sorted by y</td><td>a pair with one point on each side</td><td>O(n), the strip</td></tr>
  <tr><td>Different ways to add parentheses</td><td>every result of its sub-expression</td><td>every pairing of a left result with a right result</td><td>|left| · |right|</td></tr>
  <tr><td>Majority element</td><td>the only value that could be its majority</td><td>whether either candidate wins on the whole range</td><td>O(n), two counts</td></tr>
  <tr><td>k-th of two sorted arrays</td><td>no split of the data: discard a block that cannot hold the answer</td><td>nothing, there is no combine</td><td>O(1) per step</td></tr>
</table>

<h3>Maximum subarray, and why Kadane wins</h3>
<p>
  Find the contiguous subarray with the largest sum. The array has n(n + 1)/2
  subarrays, so checking every one is O(n²), even with a running sum for each start. Cut the array at the middle and ask where the best subarray can be.
  Either it lies entirely in the left half, or entirely in the right half, or
  it <b>crosses the middle</b>, which means it contains both
  <code>nums[mid - 1]</code> and <code>nums[mid]</code>. The first two are
  the recursive calls. For the third, notice that a crossing subarray is a
  piece of the left half that ends at <code>mid - 1</code> glued to a piece of the right half that
  starts at <code>mid</code>, and the two pieces are chosen independently. So the best crossing
  sum is the best <em>suffix</em> of the left half plus the best <em>prefix</em> of the right
  half, each found by one scan outward from the middle.
</p>
<pre><code>function maxSubarrayDC(nums) {
  if (nums.length === 0) throw new RangeError("needs at least one element");
  function best(lo, hi) {                          <span class="c">// best sum of a non-empty subarray inside [lo, hi)</span>
    if (hi - lo === 1) return nums[lo];
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    let sum = 0, leftBest = -Infinity;
    for (let i = mid - 1; i &gt;= lo; i--) {          <span class="c">// grow leftwards from mid - 1: every suffix of the left half</span>
      sum += nums[i];
      leftBest = Math.max(leftBest, sum);
    }
    sum = 0;
    let rightBest = -Infinity;
    for (let j = mid; j &lt; hi; j++) {               <span class="c">// grow rightwards from mid: every prefix of the right half</span>
      sum += nums[j];
      rightBest = Math.max(rightBest, sum);
    }
    return Math.max(best(lo, mid), best(mid, hi), leftBest + rightBest);
  }
  return best(0, nums.length);
}
<span class="c">// maxSubarrayDC([-2, 1, -3, 4, -1, 2, 1, -5, 4]) → 6</span></code></pre>
<h4>Dry run: [-2, 1, -3, 4, -1, 2, 1, -5, 4]</h4>
<p class="sub">
  The ranges below are listed in the order they finish, which is bottom-up. The crossing sum is
  <code>leftBest + rightBest</code>, the best subarray that uses both neighbours of <code>mid</code>.
</p>
<table>
  <tr><th>Range</th><th>Values</th><th>mid</th><th>Best in left half</th><th>Best in right half</th><th>Best suffix of left + best prefix of right</th><th>Crossing sum</th><th>Result</th></tr>
  <tr><td>[0, 2)</td><td>-2, 1</td><td>1</td><td>-2</td><td>1</td><td>-2 + 1</td><td>-1</td><td>1</td></tr>
  <tr><td>[2, 4)</td><td>-3, 4</td><td>3</td><td>-3</td><td>4</td><td>-3 + 4</td><td>1</td><td>4</td></tr>
  <tr><td>[0, 4)</td><td>-2, 1, -3, 4</td><td>2</td><td>1</td><td>4</td><td>1 + 1</td><td>2</td><td>4</td></tr>
  <tr><td>[4, 6)</td><td>-1, 2</td><td>5</td><td>-1</td><td>2</td><td>-1 + 2</td><td>1</td><td>2</td></tr>
  <tr><td>[7, 9)</td><td>-5, 4</td><td>8</td><td>-5</td><td>4</td><td>-5 + 4</td><td>-1</td><td>4</td></tr>
  <tr><td>[6, 9)</td><td>1, -5, 4</td><td>7</td><td>1</td><td>4</td><td>1 + (-1)</td><td>0</td><td>4</td></tr>
  <tr><td>[4, 9)</td><td>-1, 2, 1, -5, 4</td><td>6</td><td>2</td><td>4</td><td>2 + 1</td><td>3</td><td>4</td></tr>
  <tr><td>[0, 9)</td><td>the whole array</td><td>4</td><td>4</td><td>4</td><td>4 + 2</td><td>6</td><td>6</td></tr>
</table>
<p class="sub">
  At the top, the left half's best is 4 and the right half's best is 4, but the
  crossing subarray <code>[4, -1, 2, 1]</code> has sum 6. Scanning left from index 3 gives
  suffix sums 4, 1, 2, 0, so the best is 4 (just <code>[4]</code>); scanning right from index 4 gives
  prefix sums -1, 1, 2, -3, 1, so the best is 2 (<code>[-1, 2, 1]</code>). Neither half
  could have found 6 alone.
</p>
<p>
  <b>Cost.</b> The two scans cost n per range and the recursion has two calls, so
  T(n) = 2T(n/2) + n, which is O(n log n) time with O(log n) recursion depth and no extra
  arrays. That is slower than the one-pass answer, and it is the honest reason
  <b>Kadane's algorithm wins</b> the usual interview question: it needs O(n) time and
  O(1) space and a few lines
  (<a href="/dsa/dsa-arrays-strings">arrays and strings</a>). Offer the
  divide-and-conquer solution only when the interviewer asks for it, or
  when the problem changes shape, as the next version shows.
</p>
<p>
  <b>A better combine.</b> The crossing scans exist only because the halves
  returned a single number. Let each range return four, so that the combine
  becomes O(1):
</p>
<pre><code>function maxSubarraySummary(nums) {
  if (nums.length === 0) throw new RangeError("needs at least one element");
  function summarize(lo, hi) {
    if (hi - lo === 1) {
      const v = nums[lo];
      return { total: v, prefix: v, suffix: v, best: v };
    }
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    const left = summarize(lo, mid);
    const right = summarize(mid, hi);
    return {
      total: left.total + right.total,                                 <span class="c">// the whole range summed</span>
      prefix: Math.max(left.prefix, left.total + right.prefix),         <span class="c">// best sum of a prefix: stop in the left, or take all of the left and go on</span>
      suffix: Math.max(right.suffix, right.total + left.suffix),        <span class="c">// best sum of a suffix, by symmetry</span>
      best: Math.max(left.best, right.best, left.suffix + right.prefix), <span class="c">// inside a half, or across the middle</span>
    };
  }
  return summarize(0, nums.length).best;
}</code></pre>
<p class="sub">
  Now the recurrence is T(n) = 2T(n/2) + 1, which solves to O(n): the same
  asymptotic cost as Kadane, with O(log n) recursion depth but an object allocated per
  call. It is not a faster way to answer one query. What it buys is a
  <em>mergeable summary</em>: the four numbers for a range can be combined with the
  four numbers of its neighbour in O(1), which is exactly the node of a segment tree
  that answers "maximum subarray inside positions l to r" with updates (the struct nodes
  in <a href="/dsa/dsa-segment-fenwick-trees">segment and Fenwick trees</a>). It also suits data that arrives already
  cut into chunks on different machines: each chunk sends four numbers.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "For one query on an array I would use Kadane:
  O(n) time and O(1) space. The divide-and-conquer version splits at the middle. The best subarray is in the
  left half, in the right half, or crosses the middle, and the crossing one is the best suffix
  of the left plus the best prefix of the right, found by two scans. That is O(n log n), or
  O(n) if each half returns its total, prefix, suffix and best, which is also what a segment tree node stores."
</div>
<div class="warn">
  <span class="ttl">⚠ Where the divide-and-conquer version goes wrong</span>
  <b>Starting the crossing scan at 0 and the best at 0.</b> The crossing subarray must include both
  <code>nums[mid - 1]</code> and <code>nums[mid]</code>, so each scan must take at least one element.
  Seeding the best with <code>-Infinity</code> and adding before comparing does that; seeding it with 0
  lets the scan pretend to take none, and an all-negative array then returns a wrong answer.
  <b>Dropping the base case for size 1</b>, or calling it on an empty array: that is the
  infinite recursion from the first section, hence the guard at the top. <b>Slicing the halves</b>
  in the summary version: it turns the O(1) combine into an O(n) copy, and T(n) = 2T(n/2) + 1 into
  2T(n/2) + n, so the O(n) bound is lost.
</div>

<h3>Count of smaller numbers after self</h3>
<p>
  Given <code>nums</code>, return an array <code>counts</code> where
  <code>counts[i]</code> is the number of elements to the right of position <code>i</code> that are strictly smaller than
  <code>nums[i]</code>. For <code>[5, 2, 6, 1]</code> the answer is <code>[2, 1, 1, 0]</code>. The brute force
  is two nested loops, O(n²). The sorting chapter counted <em>all</em> inversions with one
  number; here every element needs <em>its own</em> count, and the same
  merge-sort skeleton gives it with one change: the recursion must remember <b>whose
  count is whose</b>.
</p>
<p>
  Sort positions, not values. Keep an array <code>order</code> of indexes, and compare
  <code>nums[order[i]]</code> when merging, so after the sort you still know the original position of every
  element. Now take the merge of a sorted left half and a sorted right half. When the merge writes a <b>left</b> element
  <code>x</code>, the right elements already written are exactly the right elements that are
  smaller than <code>x</code> (if ties are taken from the left first, strictly smaller). They sit to the right of
  <code>x</code> in the original array, because the whole right half does. So add the number of right
  elements written so far to <code>x</code>'s count. Every pair (i, j) with i before j is split at
  exactly one level, the one where i is in the left half and j in the right, and is counted there; a
  pair is never seen twice, so the counts simply accumulate with <code>+=</code> as the recursion unwinds.
</p>
<pre><code>function countSmaller(nums) {
  const n = nums.length;
  const counts = new Array(n).fill(0);
  const order = Array.from({ length: n }, (_, i) =&gt; i);   <span class="c">// order[k] is the original position of the element now at slot k</span>
  const aux = new Array(n);

  function sort(lo, hi) {                              <span class="c">// sorts order[lo, hi) by value, adding to counts as it merges</span>
    if (hi - lo &lt;= 1) return;
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    sort(lo, mid);
    sort(mid, hi);
    let i = lo, j = mid;
    for (let k = lo; k &lt; hi; k++) {
      if (j === hi || (i &lt; mid &amp;&amp; nums[order[i]] &lt;= nums[order[j]])) {
        counts[order[i]] += j - mid;                   <span class="c">// right elements already written are all smaller than this one</span>
        aux[k] = order[i++];
      } else {
        aux[k] = order[j++];
      }
    }
    for (let k = lo; k &lt; hi; k++) order[k] = aux[k];
  }

  sort(0, n);
  return counts;
}
<span class="c">// countSmaller([5, 2, 6, 1]) → [2, 1, 1, 0]</span></code></pre>
<h4>Dry run: countSmaller([5, 2, 6, 1])</h4>
<table>
  <tr><th>Merge of</th><th>Left half (values)</th><th>Right half (values)</th><th>What the merge writes</th><th>counts afterwards</th></tr>
  <tr><td>[0, 2)</td><td>5</td><td>2</td><td>2 from the right; then 5 from the left, with 1 right element written: counts[0] += 1</td><td>[1, 0, 0, 0]</td></tr>
  <tr><td>[2, 4)</td><td>6</td><td>1</td><td>1 from the right; then 6 from the left, with 1 written: counts[2] += 1</td><td>[1, 0, 1, 0]</td></tr>
  <tr><td>[0, 4)</td><td>2, 5</td><td>1, 6</td><td>1 from the right; 2 from the left (1 written): counts[1] += 1; 5 from the left (1 written): counts[0] += 1; then 6 from the right</td><td>[2, 1, 1, 0]</td></tr>
</table>
<p class="sub">
  The element 5 gains 1 in the first merge (it jumped over 2) and 1 in the last (it jumped over 1), for a
  total of 2: the two smaller values to its right. The 6 gains 1 from the element 1 and nothing more, since 5 and
  2 are on its left, and the 1 has nothing to its right. Time is O(n log n), as for any
  merge sort that adds O(1) per written element; extra space is O(n) for <code>order</code>,
  <code>aux</code> and <code>counts</code>. A Fenwick tree over compressed values gives the same bound
  with a different tool (<a href="/dsa/dsa-segment-fenwick-trees">segment and Fenwick trees</a>); merge sort needs no
  coordinate compression and touches the data in sorted runs.
</p>
<div class="warn">
  <span class="ttl">⚠ Where this one goes wrong</span>
  <b>Sorting the values</b> instead of the indexes: you then know the counts but not whose they are.
  <b>Taking the right element first on a tie</b> (using <code>&lt;</code> instead of
  <code>&lt;=</code> for the left): equal right elements are then written before the left one and counted as
  "smaller". <b>Assigning with <code>=</code></b> instead of <code>+=</code>, which keeps only the last level's
  contribution. <b>Carrying over <code>mid - i</code></b> from inversion counting: that credits the <em>right</em>
  element when it is written. Here the credit belongs to the <em>left</em> element, and it is
  <code>j - mid</code>, the number of right elements that went before it. <b>Mutating the caller's array</b>: the code above
  sorts <code>order</code>, never <code>nums</code>.
</div>

<h3>Count of range sum</h3>
<p>
  Count the pairs (i, j) with i &lt; j (a non-empty subarray <code>nums[i..j-1]</code>) whose sum lies
  between <code>lower</code> and <code>upper</code>, both inclusive. For <code>[-2, 5, -1]</code> with the
  range [-2, 2] the subarrays are -2, 5, -1, 3, 4 and 2, and three of them (-2, -1 and 2) qualify.
  The brute force is O(n²).
</p>
<p>
  Turn sums into differences. Let <code>P</code> be the prefix sums with a leading 0, so
  <code>P[0] = 0</code> and <code>P[k] = nums[0] + … + nums[k-1]</code>. The sum of
  <code>nums[i..j-1]</code> is <code>P[j] − P[i]</code>, so the task is: count the index pairs
  i &lt; j among the <b>n + 1</b> prefix values with
  <code>lower ≤ P[j] − P[i] ≤ upper</code>. That has the shape of the inversion problem, and the same
  attack works. Split the prefix array in the middle. Pairs inside a half are the recursion's job. For the
  pairs with i in the left half and j in the right half, <b>the positions no longer matter</b>:
  every left index is before every right index, however the halves are ordered inside. So once both halves are
  <em>sorted</em>, for each left value <code>P[i]</code> the matching right values form a contiguous run: those
  with <code>P[i] + lower ≤ P[j] ≤ P[i] + upper</code>. As <code>P[i]</code> increases, both ends of that
  run move right, never left, so two pointers find every run in one pass.
</p>
<pre><code>function countRangeSum(nums, lower, upper) {
  const prefix = [0];
  for (const x of nums) prefix.push(prefix[prefix.length - 1] + x);   <span class="c">// n + 1 prefix sums, starting with 0</span>
  const aux = new Array(prefix.length);

  function sortCount(lo, hi) {                         <span class="c">// sorts prefix[lo, hi), returns the qualifying pairs inside it</span>
    if (hi - lo &lt;= 1) return 0;
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    let count = sortCount(lo, mid) + sortCount(mid, hi);
    let from = mid, to = mid;                          <span class="c">// the run of right values for the current left value is [from, to)</span>
    for (let i = lo; i &lt; mid; i++) {
      while (from &lt; hi &amp;&amp; prefix[from] - prefix[i] &lt; lower) from++;    <span class="c">// too small: P[j] - P[i] below lower</span>
      while (to &lt; hi &amp;&amp; prefix[to] - prefix[i] &lt;= upper) to++;       <span class="c">// still within upper</span>
      count += to - from;
    }
    let i = lo, j = mid;                               <span class="c">// now the ordinary merge</span>
    for (let k = lo; k &lt; hi; k++) {
      aux[k] = j === hi || (i &lt; mid &amp;&amp; prefix[i] &lt;= prefix[j]) ? prefix[i++] : prefix[j++];
    }
    for (let k = lo; k &lt; hi; k++) prefix[k] = aux[k];
    return count;
  }

  return sortCount(0, prefix.length);
}
<span class="c">// countRangeSum([-2, 5, -1], -2, 2) → 3</span></code></pre>
<h4>Dry run: countRangeSum([-2, 5, -1], -2, 2)</h4>
<p class="sub">
  The prefix sums are <code>[0, -2, 3, 2]</code>. The recursion splits them into
  <code>[0, -2]</code> and <code>[3, 2]</code>. In the first half the only pair is
  (0, -2) with difference -2, in range: 1. In the second half the pair is (3, 2) with difference -1: 1.
  Both halves are then sorted to <code>[-2, 0]</code> and <code>[2, 3]</code>, and the top-level counting runs:
</p>
<table>
  <tr><th>Left value P[i]</th><th>Differences P[j] − P[i] for the right values 2 and 3</th><th>In the range [-2, 2]</th><th>Run [from, to)</th><th>Pairs counted</th></tr>
  <tr><td>-2</td><td>4 and 5</td><td>neither: from stops at 2, and to has not moved past it, since 4 &gt; 2</td><td>empty</td><td>0</td></tr>
  <tr><td>0</td><td>2 and 3</td><td>2 only: from still stops at 2, and to moves past it but not past 3</td><td>the value 2</td><td>1</td></tr>
</table>
<p class="sub">
  The cross pairs add 1, for a total of 1 + 1 + 1 = 3, matching the three qualifying subarrays. The
  pair counted at the top is P[0] = 0 against P[3] = 2: the subarray <code>[-2, 5, -1]</code> itself,
  whose sum is 2. Time is O(n log n) with O(n) extra space, since the counting pass is linear and the merge is
  linear at every level. Note that both pointers are set once per merge, before the loop, and are never
  reset inside it: that is what makes the pass linear.
</p>
<div class="warn">
  <span class="ttl">⚠ Where this one goes wrong</span>
  <b>Forgetting the leading 0</b> in the prefix array: subarrays that start at index 0 then disappear.
  <b>Counting after the merge:</b> the pointer trick needs the halves sorted, but it must run
  <em>before</em> the halves are merged together, because once merged the left and right values are
  mixed and you can no longer tell which side a value came from. <b>Mixing up strict and inclusive bounds:</b>
  <code>from</code> skips values strictly below <code>lower</code>; <code>to</code> takes values up to and including
  <code>upper</code>. <b>Resetting the pointers for every <code>i</code></b>, which makes the pass quadratic.
  <b>Size:</b> prefix sums of 10⁵ values near 2³¹ stay below 2⁵³, so plain numbers are exact;
  do not <code>| 0</code> them.
</div>
<p>
  The counting problems here and in the sorting chapter share one skeleton, and it is worth stating as a rule:
  <b>if a question is about pairs (i, j) with i before j, and the relation between the two elements is
  something a sorted order can answer in bulk (smaller than, more than double, within a window), sort
  by merging and count the cross pairs while the halves are sorted.</b> Inversions, reverse pairs
  (<code>nums[i] &gt; 2 · nums[j]</code>), smaller-after-self and range-sum counts differ only in the
  counting pass. A Fenwick tree over compressed values is the other standard tool for these counts, and
  <a href="/dsa/dsa-segment-fenwick-trees">segment and Fenwick trees</a> solves two of them that way.
</p>

<h3>The skyline problem: merge two outlines</h3>
<p>
  Each building is <code>[left, right, height]</code>. The skyline is the outline you see from far away,
  reported as the points where the height changes: <code>[x, height]</code> means "from x onwards,
  the height is <code>height</code>", and the last point has height 0. For
  <code>[[2, 9, 10], [3, 7, 15], [5, 12, 12]]</code> the answer is
  <code>[[2, 10], [3, 15], [7, 12], [12, 0]]</code>. Coordinates can be huge, so you cannot walk every x; the
  height only changes at building edges, and that is where all the work is.
</p>
<p>
  The skyline of one building is trivial: <code>[[left, height], [right, 0]]</code>. Now the combine: given the
  skylines of two halves of the buildings, produce the skyline of all of them. The outline of a union of
  buildings is the <b>pointwise maximum</b> of the outlines. Each outline is a step function that holds its
  height from one key point to the next, so sweep both lists left to right, like merging two sorted lists. Keep
  the current height of each outline. At every x where either list has a key point, update that
  outline's height, take the larger of the two, and emit a key point if the result differs from the last height
  emitted.
</p>
<pre><code>function mergeSkylines(a, b) {
  const out = [];
  let i = 0, j = 0, heightA = 0, heightB = 0;
  while (i &lt; a.length || j &lt; b.length) {
    const x = Math.min(i &lt; a.length ? a[i][0] : Infinity, j &lt; b.length ? b[j][0] : Infinity);
    if (i &lt; a.length &amp;&amp; a[i][0] === x) heightA = a[i++][1];          <span class="c">// a has a key point here: its height changes</span>
    if (j &lt; b.length &amp;&amp; b[j][0] === x) heightB = b[j++][1];          <span class="c">// b may have one at the same x: take both</span>
    const height = Math.max(heightA, heightB);
    if (out.length === 0 ? height !== 0 : height !== out[out.length - 1][1]) out.push([x, height]);
  }
  return out;
}

function getSkyline(buildings) {
  function build(lo, hi) {
    if (hi - lo === 0) return [];
    if (hi - lo === 1) {
      const [left, right, height] = buildings[lo];
      return [[left, height], [right, 0]];
    }
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    return mergeSkylines(build(lo, mid), build(mid, hi));
  }
  return build(0, buildings.length);
}
<span class="c">// getSkyline([[2, 9, 10], [3, 7, 15], [5, 12, 12]]) → [[2, 10], [3, 15], [7, 12], [12, 0]]</span></code></pre>
<h4>Dry run: mergeSkylines([[2, 10], [9, 0]], [[3, 15], [7, 0]])</h4>
<p class="sub">
  This merges the outlines of two single buildings, <code>[2, 9, 10]</code> and <code>[3, 7, 15]</code>, the first
  two of the example above.
</p>
<table>
  <tr><th>x</th><th>heightA</th><th>heightB</th><th>max</th><th>Emitted?</th></tr>
  <tr><td>2</td><td>10 (a's first point)</td><td>0</td><td>10</td><td>yes: [2, 10] (the first point, and not 0)</td></tr>
  <tr><td>3</td><td>10</td><td>15 (b's first point)</td><td>15</td><td>yes: [3, 15]</td></tr>
  <tr><td>7</td><td>10</td><td>0 (b ends)</td><td>10</td><td>yes: [7, 10], b ends and the outline falls back to a's height</td></tr>
  <tr><td>9</td><td>0 (a ends)</td><td>0</td><td>0</td><td>yes: [9, 0]</td></tr>
</table>
<p class="sub">
  The result is <code>[[2, 10], [3, 15], [7, 10], [9, 0]]</code>. Merging in the outline of the third building,
  <code>[[5, 12], [12, 0]]</code>, keeps <code>[3, 15]</code> (the 15 is taller), turns <code>[7, 10]</code> into
  <code>[7, 12]</code> (the third building is taller than the first from x = 7), drops <code>[9, 0]</code> (the height
  stays 12 there) and ends at <code>[12, 0]</code>, which gives the answer above. Time is T(n) = 2T(n/2) + n, which is O(n log n): the number
  of key points in a merged skyline is at most the number in the two inputs, so each merge is linear. The heap-based
  sweep line is the other standard solution and reaches the same bound (see Meeting Rooms II in
  <a href="/dsa/dsa-intervals">intervals</a> and the skyline in the later sweep-line chapter); the merge version is the one that
  needs no priority queue and generalizes to merging outlines of any step function.
</p>
<div class="warn">
  <span class="ttl">⚠ Where the skyline goes wrong</span>
  <b>Emitting a point whose height equals the previous one.</b> Two adjacent buildings of equal height must
  not leave a key point between them:
  <code>mergeSkylines([[0, 5], [5, 0]], [[5, 5], [8, 0]])</code> gives <code>[[0, 5], [8, 0]]</code> because
  the comparison with the last emitted height removes the point at x = 5. <b>Handling only one list at an
  equal x.</b> If both lists have a key point at the same x, both heights must update before taking the maximum,
  otherwise a spurious point appears. <b>Emitting a first point of height 0.</b> The empty-output case needs its
  own test, because there is no previous height to compare with (the assumed starting height is 0).
  <b>Comparing against the last <em>input</em> height</b> instead of the last emitted one.
</div>

<h3>Closest pair of points</h3>
<p>
  Given n points in the plane, find the smallest distance between any two. Checking every pair is O(n²). Sort by x and
  cut at the middle point. The closest pair is either inside the left half, inside the right half, or has one point on each
  side. The recursion gives the first two; call the smaller of those two distances <code>d</code>. For the third
  case, a pair that beats <code>d</code> must have both of its points within <code>d</code> of the dividing line,
  so only the points in a vertical <b>strip</b> of width 2d around it can take part.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Points split by a vertical dashed line, with a shaded strip around the line; the closest pair has one point on each side of the line and both points are inside the strip">
    <g class="rough">
      <rect class="boxy" x="260" y="20" width="120" height="200" />
      <path class="ln dash" d="M320,10 L320,230" />
    </g>
    <g class="rough">
      <circle class="box" cx="60" cy="60" r="6" />
      <circle class="box" cx="110" cy="170" r="6" />
      <circle class="box" cx="130" cy="110" r="6" />
      <circle class="box" cx="190" cy="40" r="6" />
      <circle class="box" cx="205" cy="190" r="6" />
      <circle class="box" cx="260" cy="90" r="6" />
      <circle class="boxg" cx="300" cy="140" r="6" />
      <circle class="boxg" cx="342" cy="150" r="6" />
      <circle class="box" cx="380" cy="60" r="6" />
      <circle class="box" cx="450" cy="120" r="6" />
      <circle class="box" cx="500" cy="200" r="6" />
      <circle class="box" cx="560" cy="80" r="6" />
      <circle class="box" cx="590" cy="170" r="6" />
      <path class="lng" d="M300,140 L342,150" />
    </g>
    <text class="sm" x="320" y="244" text-anchor="middle">the dividing line</text>
    <text class="sm" x="262" y="14">strip: points within d of the line</text>
    <text class="sm gr" x="352" y="166">the closest pair straddles the line</text>
  </svg>
  <figcaption>Points outside the strip cannot beat d with a partner on the other side, so the combine step looks only at the strip.</figcaption>
</figure>
<p>
  A strip can still hold all n points, so comparing every pair inside it would be quadratic. The fix is an
  ordering and a packing argument. Sort the strip's points by y, and for each point look only at the
  earlier strip points whose y is less than <code>d</code> below it. Those points all fit in a box
  of width 2d and height d. Cut that box into eight squares of side d/2. Each square lies on one side of the
  dividing line, and two points on the same side are at least <code>d</code> apart, because that side's closest pair is at least
  <code>d</code>; but a square of side d/2 has diagonal d/√2, which is less than d. So each square holds at most one
  point, the box holds at most 8, and the current point has at most 7 earlier neighbours to check. (Points lying exactly on the
  line make the counting fiddlier, but the conclusion, a small constant, stands.) The strip costs O(n) once it is
  sorted by y.
</p>
<p>
  Sorting the strip at every level would cost O(n log n) per level and give O(n log² n) overall (the
  third trap from the recurrence section). Instead, <b>let the recursion return its points sorted by
  y</b>, by merging the two halves exactly as merge sort does, so that the strip is read off in y-order for free.
</p>
<pre><code>function closestPairSquared(points) {                 <span class="c">// squared distance of the closest pair; Infinity for fewer than 2 points</span>
  const n = points.length;
  if (n &lt; 2) return Infinity;
  const pts = points.slice().sort((p, q) =&gt; p[0] - q[0]);   <span class="c">// sorted by x; the caller's array is untouched</span>
  const aux = new Array(n);
  const strip = new Array(n);
  const dist2 = (p, q) =&gt; (p[0] - q[0]) ** 2 + (p[1] - q[1]) ** 2;

  function solve(lo, hi) {                             <span class="c">// closest squared distance inside pts[lo, hi); leaves that range sorted by y</span>
    if (hi - lo &lt;= 3) {
      let best = Infinity;
      for (let i = lo; i &lt; hi; i++) for (let j = i + 1; j &lt; hi; j++) best = Math.min(best, dist2(pts[i], pts[j]));
      const part = pts.slice(lo, hi).sort((p, q) =&gt; p[1] - q[1]);
      for (let k = 0; k &lt; part.length; k++) pts[lo + k] = part[k];
      return best;
    }
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    const midX = pts[mid][0];                          <span class="c">// read before the recursion reorders the range by y</span>
    let best = Math.min(solve(lo, mid), solve(mid, hi));
    let i = lo, j = mid;
    for (let k = lo; k &lt; hi; k++) {                    <span class="c">// merge by y, like merge sort</span>
      aux[k] = j === hi || (i &lt; mid &amp;&amp; pts[i][1] &lt;= pts[j][1]) ? pts[i++] : pts[j++];
    }
    for (let k = lo; k &lt; hi; k++) pts[k] = aux[k];
    let size = 0;
    for (let k = lo; k &lt; hi; k++) {
      const p = pts[k];
      if ((p[0] - midX) ** 2 &gt;= best) continue;        <span class="c">// outside the strip</span>
      for (let t = size - 1; t &gt;= 0 &amp;&amp; (p[1] - strip[t][1]) ** 2 &lt; best; t--) {
        best = Math.min(best, dist2(p, strip[t]));     <span class="c">// at most 7 iterations, by the packing argument</span>
      }
      strip[size++] = p;
    }
    return best;
  }

  return solve(0, n);
}
<span class="c">// Math.sqrt(closestPairSquared(points)) is the distance itself</span></code></pre>
<h4>Dry run: the top-level combine for eight points</h4>
<p class="sub">
  Take the points <code>(0,3) (1,9) (4,7) (6,0) | (7,0) (8,7) (9,10) (10,8)</code>, already sorted by x and cut after the
  fourth. The best squared distance in the left half is 13 (between (1,9) and (4,7)), and in the right half it is 5
  (between (9,10) and (10,8)), so the squared <code>d</code> is 5 and <code>midX</code> is 7. The merged order by y is
  (6,0) (7,0) (0,3) (4,7) (8,7) (10,8) (1,9) (9,10).
</p>
<table>
  <tr><th>Point (in y order)</th><th>(x − midX)²</th><th>In the strip?</th><th>Earlier strip points checked</th><th>best afterwards</th></tr>
  <tr><td>(6,0)</td><td>1</td><td>yes (1 &lt; 5)</td><td>none yet</td><td>5</td></tr>
  <tr><td>(7,0)</td><td>0</td><td>yes</td><td>(6,0): y gap 0, squared distance 1</td><td>1</td></tr>
  <tr><td>(0,3)</td><td>49</td><td>no</td><td>—</td><td>1</td></tr>
  <tr><td>(4,7)</td><td>9</td><td>no (9 ≥ 1)</td><td>—</td><td>1</td></tr>
  <tr><td>(8,7)</td><td>1</td><td>no (1 ≥ 1)</td><td>—</td><td>1</td></tr>
  <tr><td>(10,8), (1,9), (9,10)</td><td>9, 36, 4</td><td>no</td><td>—</td><td>1</td></tr>
</table>
<p class="sub">
  The pair (6,0) and (7,0) straddles the line and beats both halves: the answer is a squared distance of 1.
  Neither half could have seen it. Note that once <code>best</code> drops to 1, the strip shrinks as well, because
  the test uses the current <code>best</code>.
</p>
<p>
  <b>Cost.</b> T(n) = 2T(n/2) + n (one merge by y plus one strip scan), so O(n log n) time after the initial sort by x, and O(n)
  extra space. The work uses <b>squared distances</b>: for integer coordinates every comparison is then
  exact, and no square root is taken until the very end. This is a classic, but interviews rarely ask for the full
  O(n log n) code; what they listen for is the three-way split of the answer, the strip, and the reason the strip
  scan is linear.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Sort by x and split in the middle. The closest pair is in the left half, in the right
  half, or straddles the line. Let d be the best of the two halves; a straddling pair that beats d has both points within d of the
  line, so I only look at that strip. Sorted by y, each strip point has at most seven neighbours that can be closer than d,
  by a packing argument, so the strip is linear, and carrying y-order up by merging avoids a re-sort. That is O(n log n)."
</div>
<div class="warn">
  <span class="ttl">⚠ Where the closest pair goes wrong</span>
  <b>Comparing a strip point with every other strip point.</b> Without the <code>dy² &lt; best</code> stop, a
  strip holding every point is quadratic. <b>Re-sorting the strip at each level:</b> correct, but
  O(n log² n). <b>Reading <code>midX</code> after the recursion:</b> the recursion reorders the range by y, so
  <code>pts[mid]</code> no longer holds the median in x. <b>Taking square roots in the loop</b> (rounding, and
  slower): compare squared distances. <b>Duplicate points:</b> they give a squared distance of 0, and the strip
  test <code>… &gt;= best</code> then skips everything, which is correct.
</div>

<h3>Different ways to add parentheses</h3>
<p>
  Given an expression such as <code>"2*3-4*5"</code> made of non-negative integers and the operators
  <code>+</code>, <code>-</code> and <code>*</code>, return the results of every possible way of fully
  parenthesizing it. Here the combine is a <b>cross product</b>. Pick the <em>last</em> operator to be applied, any of
  them: it splits the expression into a left sub-expression and a right sub-expression, each of which can be
  parenthesized in several ways. If the left has results L and the right has results R, then this split contributes
  one result for every pair (l, r), namely <code>l op r</code>. The answer is the union over all choices of the
  operator.
</p>
<pre><code>function diffWaysToCompute(expression) {
  const tokens = expression.match(/\\d+|[-+*]/g);        <span class="c">// numbers sit at even positions, operators at odd ones</span>
  const memo = new Map();

  function apply(op, a, b) {
    if (op === "+") return a + b;
    if (op === "-") return a - b;
    return a * b + 0;                                 <span class="c">// + 0 turns a -0 (from 0 * -3) into 0</span>
  }

  function ways(lo, hi) {                              <span class="c">// every result of tokens[lo..hi], both ends inclusive</span>
    if (lo === hi) return [Number(tokens[lo])];
    const key = lo * tokens.length + hi;
    if (memo.has(key)) return memo.get(key);
    const results = [];
    for (let op = lo + 1; op &lt; hi; op += 2) {          <span class="c">// each operator in turn is the last one applied</span>
      const lefts = ways(lo, op - 1);
      const rights = ways(op + 1, hi);
      for (const a of lefts) for (const b of rights) results.push(apply(tokens[op], a, b));
    }
    memo.set(key, results);
    return results;
  }

  return ways(0, tokens.length - 1);
}
<span class="c">// diffWaysToCompute("2-1-1") → [2, 0]    diffWaysToCompute("2*3-4*5") → [-34, -10, -14, -10, 10]</span></code></pre>
<h4>Dry run: "2*3-4*5"</h4>
<p class="sub">
  The tokens are <code>2 * 3 - 4 * 5</code>. The last applied operator can be the first <code>*</code>, the
  <code>-</code>, or the second <code>*</code>:
</p>
<table>
  <tr><th>Last operator</th><th>Left sub-expression: results</th><th>Right sub-expression: results</th><th>Pairs</th></tr>
  <tr><td>first <code>*</code></td><td><code>2</code>: [2]</td><td><code>3-4*5</code>: [-17, -5]  (3−(4·5) and (3−4)·5)</td><td>2·(−17) = −34, 2·(−5) = −10</td></tr>
  <tr><td><code>-</code></td><td><code>2*3</code>: [6]</td><td><code>4*5</code>: [20]</td><td>6 − 20 = −14</td></tr>
  <tr><td>second <code>*</code></td><td><code>2*3-4</code>: [-2, 2]  (2·(3−4) and (2·3)−4)</td><td><code>5</code>: [5]</td><td>−2·5 = −10, 2·5 = 10</td></tr>
</table>
<p class="sub">
  The five results are -34, -10, -14, -10 and 10, in the order the code produces them; two equal -10
  because two different parenthesizations give the same value, and the problem keeps both. The same sub-expressions
  are asked for by more than one split: with more numbers, <code>3-4*5</code> is a sub-problem of several
  larger ones, and that is why the code has a <b>memo</b> keyed by the pair (lo, hi).
</p>
<p>
  <b>Cost.</b> The number of results is the Catalan number for the count of operators: 1, 2, 5, 14, 42, 132, 429, 1,430
  and 4,862 results for expressions with 1 to 9 operators, and 16,796 for 10. No algorithm that returns every result can beat the output size, so time and space grow
  exponentially, and an interviewer will give a short expression for that reason. The memo
  does not change that, but it does remove repeated work: for ten numbers joined with <code>+</code>
  (nine operators) it cuts the recursive calls from 19,683 to 331 and the pair-combining operations from 26,928
  to 9,891, against the 4,862 values the answer itself holds. This is the one problem in the chapter where the
  subproblems <em>overlap</em>; divide and conquer with a cache is the bridge to dynamic programming.
</p>
<div class="warn">
  <span class="ttl">⚠ Where this one goes wrong</span>
  <b>Parsing digit by digit:</b> <code>"11"</code> is one number; tokenize with a regular expression, as above.
  <b>Splitting the string instead of indexing it</b>: <code>substring</code> copies, and memo keys become long
  strings; index ranges over the token array are cheaper. <b>Mutating a memoized list:</b> the same array object is
  returned to every caller, so a caller that sorts or pushes to it corrupts the cache (the top-level result here is
  safe to modify only because the memo is local to the call). <b>Negative zero:</b> <code>0 * -1</code> is
  <code>-0</code> in JavaScript, which equals 0 under <code>===</code> but is distinguishable with
  <code>Object.is</code>; adding 0 normalizes it. <b>Removing duplicates</b> when the question wants every
  parenthesization's result.
</div>

<h3>Majority element by splitting</h3>
<p>
  Find the value that appears more than n/2 times in an array, or report that there is none. The
  one-pass Boyer-Moore vote and a counting map both solve it
  (<a href="/dsa/dsa-arrays-strings">arrays and strings</a>), and either is better in practice. The divide-and-conquer version
  is a small, clean example of a combine that <em>verifies</em> instead of computes.
</p>
<p>
  The key fact: if a value is a strict majority of a range, it is a strict majority of at least one of the two halves. If it
  were at most half of each, it would be at most half of the whole. So each half can hand up a single
  <b>candidate</b>, the only value that could be its majority (or "none"). To combine: if both halves name the
  same candidate, it has a majority in each half and therefore in the whole. If they name different ones, count each in the whole range and
  keep the one whose count exceeds half the range, if any.
</p>
<pre><code>const NONE = Symbol("no majority");

function findMajority(nums) {                          <span class="c">// the value that appears more than n / 2 times, or null</span>
  function count(value, lo, hi) {
    let c = 0;
    for (let i = lo; i &lt; hi; i++) if (nums[i] === value) c++;
    return c;
  }

  function candidate(lo, hi) {                         <span class="c">// the only value that could be a strict majority of [lo, hi), or NONE</span>
    if (hi - lo === 1) return nums[lo];
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    const left = candidate(lo, mid);
    const right = candidate(mid, hi);
    if (left === right) return left;                   <span class="c">// a strict majority of both halves is one of the whole range</span>
    const need = (hi - lo) &gt;&gt; 1;                      <span class="c">// a strict majority needs more than floor(length / 2)</span>
    if (left !== NONE &amp;&amp; count(left, lo, hi) &gt; need) return left;
    if (right !== NONE &amp;&amp; count(right, lo, hi) &gt; need) return right;
    return NONE;
  }

  if (nums.length === 0) return null;
  const found = candidate(0, nums.length);
  return found === NONE ? null : found;
}
<span class="c">// findMajority([2, 2, 1, 1, 1, 2, 2]) → 2    findMajority([1, 2, 1]) → 1    findMajority([1, 1, 2, 2]) → null</span></code></pre>
<h4>Dry run: [2, 2, 1, 1, 1, 2, 2]</h4>
<table>
  <tr><th>Range</th><th>Values</th><th>Left candidate</th><th>Right candidate</th><th>Decision</th><th>Returns</th></tr>
  <tr><td>[1, 3)</td><td>2, 1</td><td>2</td><td>1</td><td>counts 1 and 1, neither more than 1</td><td>none</td></tr>
  <tr><td>[0, 3)</td><td>2, 2, 1</td><td>2</td><td>none</td><td>count of 2 is 2, more than 1</td><td>2</td></tr>
  <tr><td>[3, 5)</td><td>1, 1</td><td>1</td><td>1</td><td>the same candidate</td><td>1</td></tr>
  <tr><td>[5, 7)</td><td>2, 2</td><td>2</td><td>2</td><td>the same candidate</td><td>2</td></tr>
  <tr><td>[3, 7)</td><td>1, 1, 2, 2</td><td>1</td><td>2</td><td>counts 2 and 2, neither more than 2</td><td>none</td></tr>
  <tr><td>[0, 7)</td><td>the whole array</td><td>2</td><td>none</td><td>count of 2 is 4, more than 3</td><td>2</td></tr>
</table>
<p class="sub">
  Each level does at most two counting passes over its range, so T(n) = 2T(n/2) + n and the total is O(n log n)
  time with O(log n) stack; the vote needs O(n) and O(1), and a counting map O(n) with O(n) space. Two details are worth
  the care. The threshold is <code>floor(length / 2)</code> and the test is strictly greater: for an even
  length like <code>[1, 1, 2, 2]</code> a value appearing exactly half the time is not a majority. And "no candidate"
  needs a value that no input can equal (a <code>Symbol</code> here), not <code>-1</code> or <code>undefined</code>, which can
  be legitimate array contents.
</p>

<h3>pow(x, n): a split with one subproblem</h3>
<p>
  Computing xⁿ with n multiplications is O(n). The split <code>xⁿ = (x^⌊n/2⌋)² · (x if n is odd)</code> has a = 1 sub-call on
  half the exponent and a combine of one or two multiplications, so T(n) = T(n/2) + 1, which is O(log n): the
  first row of the recurrence table above. The
  <a href="/dsa/dsa-basic-recursion">recursion chapter</a> derived this and showed the one-character
  mistake that undoes it (calling the half twice, which is a = 2 and O(n)). What the interview version adds
  is the edge cases, so here is the form to write:
</p>
<pre><code>function myPow(x, n) {
  if (n &lt; 0) return myPow(1 / x, -n);               <span class="c">// x to a negative power is (1/x) to the positive one</span>
  if (n === 0) return 1;
  const half = myPow(x, Math.floor(n / 2));            <span class="c">// ONE call, result reused</span>
  return n % 2 === 0 ? half * half : half * half * x;
}
<span class="c">// myPow(2, 10) → 1024    myPow(2, -2) → 0.25    myPow(0, -1) → Infinity    myPow(2, -2147483648) → 0</span></code></pre>
<h4>Dry run: myPow(2, -3)</h4>
<table>
  <tr><th>Call</th><th>What it does</th><th>Returns</th></tr>
  <tr><td>myPow(2, -3)</td><td>n is negative, so call myPow(0.5, 3)</td><td>(waiting)</td></tr>
  <tr><td>myPow(0.5, 3)</td><td>half = myPow(0.5, 1)</td><td>(waiting)</td></tr>
  <tr><td>myPow(0.5, 1)</td><td>half = myPow(0.5, 0) = 1, n odd: 1 · 1 · 0.5</td><td>0.5</td></tr>
  <tr><td>myPow(0.5, 3) resumes</td><td>half = 0.5, n odd: 0.5 · 0.5 · 0.5</td><td>0.125</td></tr>
</table>
<p class="sub">
  Edge cases checked against <code>Math.pow</code> on thousands of random bases and exponents: <code>n = 0</code> gives 1
  for every x, including 0; <code>x = 0</code> with a negative n gives <code>Infinity</code> (the inverted base 1/0 is <code>Infinity</code>); the most negative 32-bit exponent
  <code>-2147483648</code> works because <code>-n</code> is an ordinary double in JavaScript (a language with 32-bit
  integers would overflow negating it, and needs a wider type); a huge result overflows to <code>Infinity</code> and a tiny one
  underflows to 0. Compare floating-point results with a tolerance, not <code>===</code>: squaring multiplies in a different
  order from the loop, so the last digits differ.
</p>
<div class="warn">
  <span class="ttl">⚠ Invert the base first, or the result at the end?</span>
  The code inverts <code>x</code> before the recursion. Computing <code>1 / myPow(x, -n)</code> after the recursion
  looks equivalent and loses tiny results: <code>2 ** 1074</code> overflows to <code>Infinity</code>, so the reciprocal
  gives <code>0</code>, while the true value of 2⁻¹⁰⁷⁴ is the smallest positive double, <code>5e-324</code>, which the version above returns. The price
  of inverting first is one extra rounding in 1/x for bases like 3. Both are acceptable answers; knowing the difference is
  the senior detail. Also use <code>Math.floor(n / 2)</code> rather than <code>n &gt;&gt; 1</code>:
  the shift works on 32-bit integers, and an exponent of 2³¹ would turn negative.
</div>

<h3>Median of two sorted arrays as a k-th element search</h3>
<p>
  Given two sorted arrays, find the median of all their elements together, in time better than the O(m + n) merge. The
  <a href="/dsa/dsa-binary-search">binary-search chapter</a> solves it by searching for the cut position in the shorter array. Here is the same problem seen as divide and
  conquer, which many people find easier to get right: the median is the <b>k-th smallest</b> element of the union
  (the two middle ones, if the total is even), and you can find the k-th by throwing away a block of elements
  that provably cannot be it.
</p>
<p>
  Let h = ⌊k/2⌋. Compare the h-th remaining element of each array: <code>p = a[i + h − 1]</code> and
  <code>q = b[j + h − 1]</code>, where i and j count what has been discarded so far, and suppose p ≤ q (the other case
  is symmetric). Count the elements that sort before p in the union, with ties going to <code>a</code> first. In
  <code>a</code> there are h − 1. In <code>b</code> there are only elements smaller than p, and since q ≥ p those are
  among the first h − 1 of <code>b</code>. So at most 2h − 2 elements come before p, p sits at position 2h − 1 or earlier,
  and 2h − 1 ≤ k − 1. That means p, and every element of <code>a</code> before p, is among the k − 1 smallest and
  <b>cannot be the k-th</b>. Discard those h elements, reduce k by h, and repeat. The problem shrinks by a constant
  fraction every step and there is no combine at all: T(k) = T(k/2) + 1, so O(log k).
</p>
<pre><code>function kthOfTwoSorted(a, b, k) {                      <span class="c">// k-th smallest (1-based) of the union; 1 &lt;= k &lt;= a.length + b.length</span>
  let i = 0, j = 0;                                   <span class="c">// a[0, i) and b[0, j) have been discarded</span>
  while (true) {
    if (i === a.length) return b[j + k - 1];          <span class="c">// a is used up: the answer is in b</span>
    if (j === b.length) return a[i + k - 1];
    if (k === 1) return Math.min(a[i], b[j]);
    const step = k &gt;&gt; 1;
    const nextI = Math.min(i + step, a.length);        <span class="c">// a short array offers all it has</span>
    const nextJ = Math.min(j + step, b.length);
    if (a[nextI - 1] &lt;= b[nextJ - 1]) {
      k -= nextI - i;                                 <span class="c">// discard what a offered, and count what was actually discarded</span>
      i = nextI;
    } else {
      k -= nextJ - j;
      j = nextJ;
    }
  }
}

function medianOfTwoSorted(a, b) {
  const total = a.length + b.length;
  if (total === 0) return NaN;
  const mid = total &gt;&gt; 1;
  if (total % 2 === 1) return kthOfTwoSorted(a, b, mid + 1);
  return (kthOfTwoSorted(a, b, mid) + kthOfTwoSorted(a, b, mid + 1)) / 2;
}
<span class="c">// medianOfTwoSorted([1, 3], [2]) → 2    medianOfTwoSorted([1, 2], [3, 4]) → 2.5</span></code></pre>
<h4>Dry run: the 7th smallest of [1, 4, 7, 10, 13] and [2, 3, 5, 6, 8, 9, 11, 12]</h4>
<table>
  <tr><th>i</th><th>j</th><th>k</th><th>step</th><th>a[nextI − 1]</th><th>b[nextJ − 1]</th><th>Decision</th></tr>
  <tr><td>0</td><td>0</td><td>7</td><td>3</td><td>a[2] = 7</td><td>b[2] = 5</td><td>5 is smaller: discard b[0..2], so j = 3 and k = 7 − 3 = 4</td></tr>
  <tr><td>0</td><td>3</td><td>4</td><td>2</td><td>a[1] = 4</td><td>b[4] = 8</td><td>4 is smaller: discard a[0..1], so i = 2 and k = 4 − 2 = 2</td></tr>
  <tr><td>2</td><td>3</td><td>2</td><td>1</td><td>a[2] = 7</td><td>b[3] = 6</td><td>6 is smaller: discard b[3], so j = 4 and k = 2 − 1 = 1</td></tr>
  <tr><td>2</td><td>4</td><td>1</td><td colspan="4">k is 1: the answer is the smaller of a[2] = 7 and b[4] = 8, which is 7</td></tr>
</table>
<p class="sub">
  The merged order is 1 through 13, so the 7th is 7. Time is O(log(m + n)) for one k-th (two calls for an even total) and space is
  O(1). The partition search in the binary-search chapter is O(log min(m, n)), slightly tighter, and a little harder to
  keep straight; either answer is accepted, and this one is a good fallback because its invariant is just "everything
  discarded is below the k-th".
</p>
<div class="warn">
  <span class="ttl">⚠ Where the k-th search goes wrong</span>
  <b>Subtracting <code>step</code> from k when the array offered less.</b> A short array discards only what it has;
  subtract the number actually discarded (<code>nextI - i</code>), as the code does. <b>Slicing the arrays</b> to discard: each
  <code>slice</code> costs O(n) and removes the point of the algorithm. <b>Forgetting the exhausted arrays:</b> when one array
  is used up, the answer is a direct index into the other. <b>Forgetting <code>k === 1</code></b>, where
  <code>k &gt;&gt; 1</code> is 0 and the loop would never discard anything. <b>Averaging with integer division:</b> in JavaScript
  the <code>/ 2</code> is fine, but in languages with integer division an even total needs a floating-point or
  <code>2.0</code> divisor.
</div>

<h3>Split on the elements that cannot be in the answer</h3>
<p>
  Not every split is "cut in the middle". Find the length of the longest substring of <code>s</code> in which every character
  appears at least <code>k</code> times. A character that appears fewer than k times <em>in the whole string</em> cannot be
  in any valid substring, because a substring has at most as many copies as the string. So any answer lies strictly between two
  occurrences of such a character, and the string can be <b>split at every one of them</b>, and the pieces solved
  independently. If a piece has no such character, the piece itself is valid, and is the best the piece can offer.
</p>
<pre><code>function longestSubstring(s, k) {
  function solve(lo, hi) {                            <span class="c">// longest valid substring of s[lo, hi)</span>
    if (hi - lo &lt; k) return 0;
    const count = new Map();
    for (let i = lo; i &lt; hi; i++) count.set(s[i], (count.get(s[i]) ?? 0) + 1);
    let best = 0, start = lo, split = false;
    for (let i = lo; i &lt; hi; i++) {
      if (count.get(s[i]) &lt; k) {                      <span class="c">// this character cannot be in any valid substring of this range</span>
        split = true;
        best = Math.max(best, solve(start, i));       <span class="c">// the piece before it</span>
        start = i + 1;
      }
    }
    if (!split) return hi - lo;                       <span class="c">// every character is frequent: the whole range is valid</span>
    return Math.max(best, solve(start, hi));          <span class="c">// the last piece</span>
  }
  return solve(0, s.length);
}
<span class="c">// longestSubstring("ababbc", 2) → 5    longestSubstring("aaabbcbbbb", 3) → 4</span></code></pre>
<h4>Dry run: longestSubstring("aaabbcbbbb", 3)</h4>
<table>
  <tr><th>Range</th><th>Counts</th><th>Rare characters (fewer than 3)</th><th>Pieces</th><th>Result</th></tr>
  <tr><td>"aaabbcbbbb"</td><td>a 3, b 6, c 1</td><td>c</td><td>"aaabb", "bbbb"</td><td>max of the two</td></tr>
  <tr><td>"aaabb"</td><td>a 3, b 2</td><td>b (two of them)</td><td>"aaa", "", ""</td><td>3</td></tr>
  <tr><td>"bbbb"</td><td>b 4</td><td>none</td><td>—</td><td>4: the whole range is valid</td></tr>
</table>
<p class="sub">
  The answer is 4. The pieces are different sizes, so this does not fit the T(n/b) form, but the depth is bounded in a
  different way: every piece lacks at least one distinct character that its parent had (all copies of the rare
  character were removed). With an alphabet of size σ the recursion is at most σ deep, each level does O(n) work in total
  because the pieces do not overlap, and the running time is O(σ · n), which is O(26 n) for lowercase letters. Space is
  O(σ²) at worst, for the count maps on the current recursion path.
</p>

<h3>Karatsuba and Strassen: the recurrence is the story</h3>
<p>
  Two famous results are worth knowing at the level of the recurrence, not the code. Multiplying two n-digit numbers the
  way you learned at school takes n² digit multiplications. Split each number into a high and low half,
  <code>x = x₁ · B + x₀</code> and <code>y = y₁ · B + y₀</code>, where B is the base raised to half the digits. Then
  <code>x · y = x₁y₁ · B² + (x₁y₀ + x₀y₁) · B + x₀y₀</code>, which is four half-size products: T(n) = 4T(n/2) + n, so
  r = 4/2 = 2 and the total is n<sup>log₂ 4</sup> = n². The split alone buys nothing. <b>Karatsuba's observation</b>
  is that the middle coefficient does not need two products:
  <code>x₁y₀ + x₀y₁ = (x₁ + x₀)(y₁ + y₀) − x₁y₁ − x₀y₀</code>, and both subtracted products are already
  computed. Three half-size products instead of four give T(n) = 3T(n/2) + n, and r = 3/2, so the total is
  n<sup>log₂ 3</sup>, about n<sup>1.585</sup>.
</p>
<p>
  A check by hand, with B = 100: for 1234 × 5678 take x₁ = 12, x₀ = 34, y₁ = 56, y₀ = 78. The high product is
  12 · 56 = 672, the low product is 34 · 78 = 2,652, and the middle is
  (12 + 34)(56 + 78) − 672 − 2,652 = 6,164 − 3,324 = 2,840. Then
  672 · 10,000 + 2,840 · 100 + 2,652 = 7,006,652, which is 1234 × 5678.
</p>
<p>
  <b>Strassen's algorithm</b> does the same for matrices: splitting each into four blocks, the schoolbook method needs eight
  half-size block multiplications, T(n) = 8T(n/2) + n², which is n³. Strassen found seven products, from which the
  four result blocks follow by additions, so T(n) = 7T(n/2) + n², which is O(n<sup>log₂ 7</sup>), about
  n<sup>2.807</sup>. In both cases the combine is cheap additions, and the whole gain is lowering <b>a</b> by one: the
  lesson to take is that for a divide and conquer, <em>the number of recursive calls matters more than the cost of the
  split and the combine</em> once the recursion is deep. Neither is something to write in an interview; the constants
  make the schoolbook method faster for small inputs, and each is usually named as the example of the idea.
</p>

<h3>Parallelism and caches, honestly</h3>
<p>
  Two arguments for divide and conquer are repeated often, and both are true in a limited way. First, the halves are
  independent, so in principle they can run at the same time on different cores or machines. But the combine runs after both
  halves finish, and with a sequential merge the merge at the top alone takes time proportional to n, so merge sort does
  not speed up by a factor of the number of cores; a parallel merge is a separate, harder algorithm. Second, recursion
  works on smaller and smaller ranges, and once a range is small enough to sit in a processor cache, the work below it
  can run on cached data. That is the idea behind cache-oblivious algorithms, and one motivation for recursive and blocked
  formulations of numeric routines. Neither argument is a promise for your code: JavaScript runs your functions on one thread,
  workers cannot share ordinary objects (only the bytes of a <code>SharedArrayBuffer</code>), and this chapter's code
  has not been timed for either effect. In an interview, one sentence is enough: "the halves are independent, so
  it parallelizes and distributes naturally, and the combine is the sequential part."
</p>

<h3>When divide and conquer loses</h3>
<p>
  The split is a tool, not a goal. Reach for something else when:
</p>
<table>
  <tr><th>Situation</th><th>Better choice</th><th>Why</th></tr>
  <tr><td>The subproblems overlap: the same smaller question is reached by several routes (Fibonacci split into n − 1 and n − 2, edit distance, longest increasing subsequence)</td><td>Dynamic programming, or memoization</td><td>A split without a cache re-solves the same piece many times; with one, you have a DP.</td></tr>
  <tr><td>One pass can carry the answer (maximum subarray, majority element, best time to buy and sell)</td><td>A running value: Kadane, the vote, a running minimum</td><td>O(n) time and O(1) space against O(n log n) and a stack.</td></tr>
  <tr><td>Only the k-th element or the top k of a stream is needed</td><td>Quickselect, or a heap of size k</td><td>A full merge sort orders everything when one position is enough; quickselect keeps one side only (O(n) on average) and a heap handles a stream.</td></tr>
  <tr><td>The split cannot be balanced: sorted input into a first-element pivot, a skewed tree</td><td>Choose the pivot at random, or use another structure</td><td>An unbalanced split is T(n) = T(n − 1) + n, which is quadratic.</td></tr>
  <tr><td>The combine costs as much as solving from scratch</td><td>The direct method</td><td>If merging two answers is as hard as the problem, the recursion only adds overhead.</td></tr>
  <tr><td>Many queries and updates on the same array</td><td>A segment tree or Fenwick tree</td><td>It stores the divide-and-conquer tree once and reuses it for every query.</td></tr>
  <tr><td>Inputs are small</td><td>The simple loop</td><td>Calls, allocation and bookkeeping cost more than they save; a common refinement is to switch to a simple method below some size.</td></tr>
</table>
<p class="sub">
  Two further cautions. The recursion depth is only O(log n) when the split is balanced; with an unbalanced one,
  a deep recursion can overflow the stack long before it runs out of time (the
  <a href="/dsa/dsa-basic-recursion">recursion chapter</a> measures the limit). And a divide-and-conquer answer can be right
  and still lose points if a one-line scan exists: say the simple solution first, then offer the split.
</p>

<h3>The mistakes that cost points</h3>
<div class="warn">
  <span class="ttl">⚠ The list, in the order they usually bite</span>
  <ol style="margin:6px 0 0">
    <li><b>Wrong base case.</b> Size 0 and size 1 are different; a half-open range with a "size 1" base case recurses forever on an empty input.</li>
    <li><b>Off-by-one at the midpoint.</b> Use one convention (<code>[lo, mid)</code> and <code>[mid, hi)</code>) all through; <code>lo + ((hi - lo) &gt;&gt; 1)</code> keeps both halves non-empty when the range has at least two elements.</li>
    <li><b>Counting before sorting, or after merging.</b> Cross-pair counting needs both halves sorted and not yet merged.</li>
    <li><b>Strict versus non-strict comparison</b> on ties: decide which side wins and keep the merge and the count consistent.</li>
    <li><b>Slicing the input</b> at every call: a hidden O(n) per call that can change the recurrence.</li>
    <li><b>Re-sorting inside the combine</b>, which adds a log factor.</li>
    <li><b>Losing identity.</b> Sorting values when the answer is per original position; sort indexes.</li>
    <li><b>Mutating the caller's array</b> because the algorithm sorts in place.</li>
    <li><b>Seeding a best with 0</b> where "at least one element" is required; use <code>-Infinity</code>.</li>
    <li><b>Floating-point and integer limits:</b> tolerance for pow, squared distances for geometry, and no <code>| 0</code> on sums that can exceed 2³¹.</li>
    <li><b>Reading a recurrence from a recursion that has a loop</b> in each call: the loop is part of f(n).</li>
  </ol>
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The problem is about <b>pairs in the wrong order</b>, or pairs whose values satisfy a relation, and the brute force is O(n²): merge sort that counts while merging (smaller after self, range-sum counts, reverse pairs, inversions).</li>
  <li>The answer is the best of "inside the left", "inside the right" and "across the middle": a crossing scan or a mergeable summary (maximum subarray, closest pair).</li>
  <li>The answer is built from <b>two sub-answers of the same kind</b>: merging outlines or sorted lists (skyline, merge k sorted lists by halving, in the practice list), or a cross product of results (parentheses).</li>
  <li>The word <b>every</b> ("all possible results"): the output is the cross product of the halves; expect exponential output and ask about the size limit.</li>
  <li>A property that must hold for a candidate in each half if it holds for the whole (a strict majority is a majority of one half): hand up a candidate, then verify.</li>
  <li>An element or a character that <b>cannot belong</b> to any answer: split on it and solve the pieces.</li>
  <li>A sorted structure and a question about the k-th or the median: discard a block that cannot hold the answer, so the problem shrinks without a combine.</li>
  <li>The constraint is n up to 10⁵ and the brute force is quadratic, but the data has no obvious order: an n log n divide and conquer is the usual target (see the constraints table in the <a href="/dsa/dsa-complexity-analysis">complexity chapter</a>).</li>
  <li>Distinguish it from dynamic programming (overlapping subproblems), from greedy (one choice at a time, no sub-answers to combine) and from backtracking (explore and undo choices rather than split the data).</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Name the three parts of a divide-and-conquer function, say why its subproblems must be independent, and say how that differs from dynamic programming.</li>
    <li>Read a recurrence off a piece of code (the calls, the shrink factor, the work outside the calls), and decide from the per-level work whether the root, every level, or the leaves dominate.</li>
    <li>Explain why a sliced version of a divide-and-conquer function can cost an extra log factor, and fix it with index ranges.</li>
    <li>Given a new problem, ask what the answer could be that neither half sees, and say whether the combine needs an extra fact from each half.</li>
    <li>Write the crossing-scan and the four-number-summary versions of maximum subarray, state both costs, and explain why Kadane's algorithm is the better answer to the plain question.</li>
    <li>Write count-smaller-after-self with an index array, and explain why the count added when a left element is written is the number of right elements written so far.</li>
    <li>Turn range-sum counting into counting pairs of prefix sums, and say why both pointers move only forward once the halves are sorted.</li>
    <li>Merge two skylines, and list the situations that put a wrong point in the output (equal heights, equal x, the first point, comparing with an input height instead of the last emitted one).</li>
    <li>Sketch the closest-pair algorithm: the strip, why its scan is linear, and why returning y-sorted points avoids an extra log factor.</li>
    <li>Write different ways to add parentheses with a memo, and say why the answer's size is a Catalan number.</li>
    <li>Explain why a strict majority of a range is a strict majority of one of its halves, and use it to write the candidate-and-verify combine.</li>
    <li>Write myPow with a negative exponent and the most negative 32-bit exponent, and say which floating-point corner differs between inverting first and inverting last.</li>
    <li>Find the k-th element of two sorted arrays by discarding blocks, and say why the median follows.</li>
    <li>State the Karatsuba and Strassen recurrences and which number in them did the work, and say honestly what parallelism and cache arguments do and do not buy in JavaScript.</li>
  </ul>
</div>`,
};
