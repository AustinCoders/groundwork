import type { Chapter } from "../types";

export const dsaDp1d: Chapter = {
  id: "dsa-dp-1d",
  num: "I10",
  title: "Dynamic programming: 1D",
  short: "DP: 1D",
  levels: ["intermediate"],
  prerequisites: ["dsa-basic-recursion", "dsa-binary-search"],
  practice: [
    "ex-climbing-stairs",
    "ex-house-robber",
    "ex-house-robber-ii",
    "ex-coin-change",
    "ex-coin-change-ii",
    "ex-longest-increasing-subsequence",
    "ex-word-break",
    "ex-decode-ways",
    "ex-maximum-product-subarray",
    "ex-partition-equal-subset-sum",
    "ex-min-cost-climbing-stairs",
    "ex-maximum-subarray",
    "ex-perfect-squares",
    "ex-triangle",
    "ex-palindromic-substrings",
    "ex-longest-palindromic-substring",
    "ex-longest-increasing-subsequence-fast",
  ],
  ready: true,
  subtitle: "Recursion, minus the part where you solve the same subproblem twice.",
  body: `<h3>The problem DP exists to fix, drawn out</h3>
<p>
  Plain recursion on overlapping subproblems redoes the same work
  exponentially many times. Watch <code>fib(5)</code> expand:
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="The recursion tree for fibonacci of 5, showing fibonacci of 3 computed twice and fibonacci of 2 computed three times">
    <g class="rough">
      <path class="ln" d="M320,48 L180,62" />
      <path class="ln" d="M320,48 L460,62" />
      <path class="ln" d="M180,98 L100,112" />
      <path class="lnr" d="M180,98 L260,112" />
      <path class="lnr" d="M460,98 L380,112" />
      <path class="ln" d="M460,98 L540,112" />
      <path class="lnr" d="M100,146 L60,162" />
      <path class="ln" d="M100,146 L140,162" />
      <path class="lnr" d="M380,146 L340,162" />
      <path class="ln" d="M380,146 L420,162" />
    </g>
    <g class="rough">
      <rect class="box" x="280" y="12" width="80" height="36" />
      <rect class="box" x="140" y="62" width="80" height="36" />
      <rect class="box" x="420" y="62" width="80" height="36" />
      <rect class="box" x="65" y="112" width="70" height="34" />
      <rect class="boxr" x="225" y="112" width="70" height="34" />
      <rect class="boxr" x="345" y="112" width="70" height="34" />
      <rect class="box" x="505" y="112" width="70" height="34" />
      <rect class="boxr" x="25" y="162" width="70" height="34" />
      <rect class="box" x="105" y="162" width="70" height="34" />
      <rect class="boxr" x="305" y="162" width="70" height="34" />
      <rect class="box" x="385" y="162" width="70" height="34" />
    </g>
    <text class="sm" x="320" y="35" text-anchor="middle">fib(5)</text>
    <text class="sm" x="180" y="85" text-anchor="middle">fib(4)</text>
    <text class="sm" x="460" y="85" text-anchor="middle">fib(3)</text>
    <text class="sm" x="100" y="134" text-anchor="middle">fib(3)</text>
    <text class="sm rd" x="260" y="134" text-anchor="middle">fib(2)</text>
    <text class="sm rd" x="380" y="134" text-anchor="middle">fib(2)</text>
    <text class="sm" x="540" y="134" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="60" y="184" text-anchor="middle">fib(2)</text>
    <text class="sm" x="140" y="184" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="340" y="184" text-anchor="middle">fib(1)</text>
    <text class="sm" x="420" y="184" text-anchor="middle">fib(0)</text>
    <text class="lbl rd" x="20" y="220" style="font-size:14px">fib(2) is computed 3 separate times, fib(3) twice —</text>
    <text class="lbl rd" x="20" y="240" style="font-size:14px">pure waste, same inputs every time</text>
  </svg>
  <figcaption>Every red node is a repeat of work already done elsewhere in the tree.</figcaption>
</figure>
<p>
  DP is exactly one idea: <b>cache the result of each distinct subproblem
  the first time you compute it, and look it up instead of recomputing it
  every other time</b>. That's it — the rest is just two different ways of
  organizing that cache.
</p>

<h3>Top-down (memoization) — recursion, plus a cache</h3>
<pre><code>function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n); <span class="c">// seen this exact input before — reuse it</span>

  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}</code></pre>
<p class="sub">
  This turns the tree above from O(2ⁿ) into O(n) — there are only n
  <em>distinct</em> subproblems (<code>fib(0)</code> through
  <code>fib(n)</code>), and each one is now computed exactly once.
</p>

<h3>Bottom-up (tabulation) — build the table forward, no recursion at all</h3>
<figure>
  <svg viewBox="0 0 640 130" class="dg" role="img" aria-label="A table being filled left to right, each cell computed from the two cells before it">
    <g class="rough">
      <rect class="box" x="20" y="40" width="70" height="50" />
      <rect class="box" x="90" y="40" width="70" height="50" />
      <rect class="box" x="160" y="40" width="70" height="50" />
      <rect class="box" x="230" y="40" width="70" height="50" />
      <rect class="boxg" x="300" y="40" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="70" text-anchor="middle">0</text>
    <text class="sm" x="125" y="70" text-anchor="middle">1</text>
    <text class="sm" x="195" y="70" text-anchor="middle">1</text>
    <text class="sm" x="265" y="70" text-anchor="middle">2</text>
    <text class="sm" x="335" y="70" text-anchor="middle">3</text>
    <path class="lnr" d="M195,30 C 260,15 300,15 335,30" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M265,30 L335,30" marker-end="url(#dgarrow3)" />
    <defs>
      <marker id="dgarrow3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="420" y="55" style="font-size:14px">dp[4] = dp[3] + dp[2]</text>
    <text class="sm" x="420" y="80">needs only the last two</text>
  </svg>
  <figcaption>No recursion, no call stack — just an array filled in order, left to right.</figcaption>
</figure>
<pre><code>function fibBottomUp(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

<span class="c">// space-optimized: fib only ever needs the last 2 values — O(1) space</span>
function fibOptimized(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    [prev2, prev1] = [prev1, prev1 + prev2];
  }
  return prev1;
}</code></pre>
<table>
  <tr><th></th><th>Time</th><th>Space</th><th>Notes</th></tr>
  <tr><td>Naive recursion</td><td>O(2ⁿ)</td><td>O(n) — call stack</td><td>recomputes everything</td></tr>
  <tr><td>Top-down (memo)</td><td>O(n)</td><td>O(n) memo + O(n) stack</td><td>easiest to write from the recursive version</td></tr>
  <tr><td>Bottom-up (table)</td><td>O(n)</td><td>O(n)</td><td>no recursion overhead</td></tr>
  <tr><td>Bottom-up, optimized</td><td>O(n)</td><td>O(1)</td><td>only when each state needs a fixed, small window of previous states</td></tr>
</table>

<h3>The general recipe — the four questions every 1D DP answers</h3>
<ol>
  <li><b>What does <code>dp[i]</code> mean?</b> — state it in one sentence before writing any code. ("dp[i] = the max sum of a subarray ending exactly at i.")</li>
  <li><b>What's the recurrence?</b> — how does <code>dp[i]</code> relate to earlier states?</li>
  <li><b>What's the base case?</b> — the smallest i you can answer directly.</li>
  <li><b>What order do you fill it in?</b> — usually left to right, since <code>dp[i]</code> needs earlier values.</li>
</ol>

<h3>Climbing Stairs and Min Cost Climbing Stairs</h3>
<p>
  You climb a staircase of <code>n</code> steps, taking 1 or 2 steps at a time.
  In how many different sequences of moves do you reach the top? Start from the
  last move. To stand on step <code>i</code> you came from step
  <code>i - 1</code> (with a 1-step) or from step <code>i - 2</code> (with a
  2-step), and those are the only two ways. So
  <code>ways[i] = ways[i - 1] + ways[i - 2]</code>, with
  <code>ways[1] = 1</code> and <code>ways[2] = 2</code>. This is the Fibonacci
  recurrence from the start of the chapter wearing a costume, and it has the same
  O(n) time with O(1) space once you keep only the last two values.
</p>
<p>
  The version with a price is where the four questions earn their keep. Each step
  <code>i</code> has a cost <code>cost[i]</code> that you pay when you
  <em>leave</em> it, you may start on step 0 or step 1, and the top is one past
  the last index. State it in one sentence first: <code>best[i]</code> is the
  cheapest total to be standing on step <code>i</code>, where step
  <code>n</code> is the top. Then <code>best[0] = best[1] = 0</code> (you start
  there for free) and each later step is reached from one of the two steps below
  by paying for the step you leave.
</p>
<pre><code>function climbStairs(n) {
  if (n &lt;= 2) return n;
  let twoBack = 1, oneBack = 2; <span class="c">// ways to reach step 1 and step 2</span>
  for (let step = 3; step &lt;= n; step++) {
    [twoBack, oneBack] = [oneBack, oneBack + twoBack]; <span class="c">// last move was a 1-step or a 2-step</span>
  }
  return oneBack;
}

function minCostClimbingStairs(cost) {
  const n = cost.length;
  const best = new Array(n + 1).fill(0); <span class="c">// best[i] = cheapest way to STAND on step i; the top is step n</span>
  for (let i = 2; i &lt;= n; i++) {
    best[i] = Math.min(best[i - 1] + cost[i - 1], best[i - 2] + cost[i - 2]); <span class="c">// pay for the step you leave</span>
  }
  return best[n];
}</code></pre>
<h4>Dry run: minCostClimbingStairs([10, 15, 20])</h4>
<table>
  <tr><th>i</th><th>best[i]</th><th>Why</th></tr>
  <tr><td>0, 1</td><td>0, 0</td><td>you may start on either step without paying</td></tr>
  <tr><td>2</td><td>10</td><td>min(best[1] + 15, best[0] + 10) = min(15, 10): leave step 0 with a 2-step</td></tr>
  <tr><td>3 (top)</td><td>15</td><td>min(best[2] + 20, best[1] + 15) = min(30, 15): leave step 1 with a 2-step</td></tr>
</table>
<p class="sub">
  The answer is 15: start on step 1, pay 15, jump over step 2 to the top. Both
  functions are O(n) time, and the second one can be reduced to O(1) space the
  same way as Fibonacci.
</p>
<div class="warn">
  <span class="ttl">⚠ Off-by-one at the top, and numbers that stop being exact</span>
  The top is index <code>n</code>, not <code>n - 1</code>: you must get
  <em>past</em> the last step, so the answer is <code>best[n]</code>, not the
  cost of standing on the last step. Pay the cost of the step you leave, not the
  step you land on, or every answer is shifted. And for counting, the answers are
  Fibonacci numbers, so they grow fast: as ordinary JavaScript numbers they stop
  being exact at <code>n = 78</code>, where the count passes
  2⁵³ (about 9 × 10¹⁵). When a problem asks for a count modulo something, take the
  remainder inside the loop; if it asks for the exact value of a large
  <code>n</code>, use <code>BigInt</code>.
</div>

<h3>Worked example: House Robber</h3>
<p>
  Can't rob two adjacent houses. At each house, you either skip it
  (carry forward the best so far) or rob it (best from two houses back,
  plus this house's value).
</p>
<pre><code>function rob(nums) {
  let prevSkip = 0, prevTake = 0; <span class="c">// best up to i-2, best up to i-1</span>
  for (const val of nums) {
    const curr = Math.max(prevTake, prevSkip + val); <span class="c">// skip this OR rob this</span>
    prevSkip = prevTake;
    prevTake = curr;
  }
  return prevTake;
}</code></pre>
<p class="sub">
  Notice the state definition again: "best total up to and including
  house i." Once that's pinned down precisely, the recurrence
  (<code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>) falls out
  directly from re-reading the problem statement.
</p>

<h3>House Robber II — a circle is two lines</h3>
<p>
  Now the houses stand in a circle, so the first and the last are neighbours and
  cannot both be robbed. Do not invent a new recurrence. Ask which of the two
  houses is <em>not</em> robbed. Either the last house is left alone, and the
  houses <code>0..n - 2</code> form an ordinary line, or the first house is left
  alone, and <code>1..n - 1</code> form one. Any valid plan belongs to at least
  one of the two cases, and each case is the problem you already solved, so the
  answer is the larger of the two.
</p>
<pre><code>function robLine(nums, lo, hi) { <span class="c">// best total from nums[lo..hi], no two adjacent</span>
  let skip = 0, take = 0;
  for (let i = lo; i &lt;= hi; i++) {
    [skip, take] = [take, Math.max(take, skip + nums[i])];
  }
  return take;
}

function robCircle(nums) {
  const n = nums.length;
  if (n === 1) return nums[0]; <span class="c">// the two ranges below would both be empty</span>
  return Math.max(robLine(nums, 0, n - 2), robLine(nums, 1, n - 1)); <span class="c">// skip the last, or skip the first</span>
}</code></pre>
<p>
  For <code>[2, 3, 2]</code> the first line <code>[2, 3]</code> gives 3, the
  second line <code>[3, 2]</code> gives 3, and the answer is 3. Robbing both
  2s would give 4 on a line, which a circle forbids. For <code>[1, 2, 3, 1]</code>
  the lines <code>[1, 2, 3]</code> and <code>[2, 3, 1]</code> give 4 and 3, so the answer is 4. Time is
  O(n) with O(1) space: two passes over the array.
</p>
<div class="warn">
  <span class="ttl">⚠ One house breaks the split</span>
  With <code>n = 1</code> the ranges <code>0..-1</code> and <code>1..0</code> are
  both empty and the formula returns 0, but the answer is
  <code>nums[0]</code>. Handle it before the split. Also pass index bounds to the
  helper rather than calling <code>slice</code>, which copies the array twice
  and does nothing the bounds do not already do.
</div>
<p class="sub">
  This move, "break the circle by deciding one element's fate", is a reusable
  idea: circular arrays turn into two linear problems in many places, not only
  here.
</p>

<h3>Decode Ways — counting with two look-backs</h3>
<p>
  The letters A to Z are encoded as 1 to 26. A string of digits can be read in
  several ways: <code>"226"</code> can be 2-2-6 (BBF), 22-6 (VF) or 2-26 (BZ).
  Count the readings. Define <code>ways[i]</code> as the number of ways to decode
  the <b>first <code>i</code> characters</b>. The last letter of any reading uses
  either the last one character or the last two, so there are exactly two cases to
  add:
</p>
<ul>
  <li>The last character alone is a letter if it is <code>1</code> to <code>9</code>, and then it adds <code>ways[i - 1]</code>. A <code>0</code> cannot stand alone and adds nothing.</li>
  <li>The last two characters together are a letter if they read <code>10</code> to <code>26</code>, and then they add <code>ways[i - 2]</code>.</li>
</ul>
<p>
  The empty prefix has one way (read nothing), so <code>ways[0] = 1</code>, and
  the first character gives 1 if it is not <code>"0"</code> and 0 otherwise.
</p>
<pre><code>function numDecodings(s) {
  const n = s.length;
  if (n === 0) return 0;
  let twoBack = 1; <span class="c">// ways to decode the first i - 2 characters (the empty prefix has 1 way)</span>
  let oneBack = s[0] === "0" ? 0 : 1; <span class="c">// ways to decode the first i - 1 characters</span>
  for (let i = 2; i &lt;= n; i++) {
    let ways = 0;
    if (s[i - 1] !== "0") ways += oneBack; <span class="c">// the last character alone: 1..9</span>
    const pair = Number(s.slice(i - 2, i));
    if (pair &gt;= 10 &amp;&amp; pair &lt;= 26) ways += twoBack; <span class="c">// the last two together: 10..26</span>
    twoBack = oneBack;
    oneBack = ways;
  }
  return oneBack;
}</code></pre>
<h4>Dry run: "226" and "206"</h4>
<table>
  <tr><th>String</th><th>i</th><th>Last char alone</th><th>Last two chars</th><th>ways[i]</th></tr>
  <tr><td>"226"</td><td>1</td><td>"2" is fine</td><td>—</td><td>1</td></tr>
  <tr><td></td><td>2</td><td>"2": adds ways[1] = 1</td><td>22 is in 10..26: adds ways[0] = 1</td><td>2</td></tr>
  <tr><td></td><td>3</td><td>"6": adds ways[2] = 2</td><td>26 is in range: adds ways[1] = 1</td><td>3</td></tr>
  <tr><td>"206"</td><td>1</td><td>"2" is fine</td><td>—</td><td>1</td></tr>
  <tr><td></td><td>2</td><td>"0" cannot stand alone: adds 0</td><td>20 is in range: adds ways[0] = 1</td><td>1</td></tr>
  <tr><td></td><td>3</td><td>"6": adds ways[2] = 1</td><td>06 is not in 10..26: adds 0</td><td>1</td></tr>
</table>
<p class="sub">
  <code>"206"</code> has exactly one reading, 20-6. The two-value window keeps the
  space at O(1), and the time is O(n).
</p>
<div class="warn">
  <span class="ttl">⚠ The zero cases are the whole problem</span>
  <code>"06"</code> has no valid reading (a <code>0</code> cannot start a letter),
  <code>"100"</code> has none either (the last <code>0</code> needs a
  <code>1</code> or <code>2</code> in front of it, and that one is already used
  by the previous <code>0</code>), and <code>"10"</code> has exactly one. The
  trap is testing the two-character case with a string comparison or a range like
  <code>pair &lt;= 26</code> without the lower bound: <code>"06"</code> is 6 as a
  number but is not a valid pair. The lower bound of 10 is what rejects it. The
  empty string returns 0.
</div>

<h3>Word Break — does a prefix split into words?</h3>
<p>
  Given a string <code>s</code> and a dictionary, can <code>s</code> be cut into
  a sequence of dictionary words? Define <code>ok[i]</code> as whether the first
  <code>i</code> characters can be split. The last word in any split is some
  <code>s[j..i - 1]</code>, and what is in front of it must itself be a splittable
  prefix. So <code>ok[i]</code> is true when some <code>j</code> has
  <code>ok[j]</code> true and <code>s[j..i - 1]</code> in the dictionary. The
  empty prefix is splittable: <code>ok[0] = true</code>.
</p>
<pre><code>function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const maxLen = Math.max(0, ...wordDict.map((w) =&gt; w.length));
  const ok = new Array(s.length + 1).fill(false); <span class="c">// ok[i] = the first i characters can be split into words</span>
  ok[0] = true; <span class="c">// the empty prefix needs no words</span>

  for (let i = 1; i &lt;= s.length; i++) {
    for (let j = Math.max(0, i - maxLen); j &lt; i; j++) { <span class="c">// the last word is s[j..i-1], at most maxLen long</span>
      if (ok[j] &amp;&amp; words.has(s.slice(j, i))) {
        ok[i] = true;
        break;
      }
    }
  }
  return ok[s.length];
}</code></pre>
<h4>Dry run: s = "leetcode", dictionary ["leet", "code"]</h4>
<table>
  <tr><th>i</th><th>Prefix</th><th>Found</th><th>ok[i]</th></tr>
  <tr><td>0</td><td>""</td><td>base case</td><td>true</td></tr>
  <tr><td>1 to 3</td><td>"l", "le", "lee"</td><td>no dictionary word ends here with a splittable start</td><td>false</td></tr>
  <tr><td>4</td><td>"leet"</td><td>"leet" starts at j = 0 and ok[0] is true</td><td>true</td></tr>
  <tr><td>5 to 7</td><td>"leetc" ... "leetcod"</td><td>no word, and "c", "co", "cod" are not words</td><td>false</td></tr>
  <tr><td>8</td><td>"leetcode"</td><td>"code" starts at j = 4 and ok[4] is true</td><td>true</td></tr>
</table>
<p class="sub">
  The inner loop only looks back <code>maxLen</code> characters, because no word
  is longer than that. With <code>L</code> the length of the longest word, the
  loops make O(n · L) substring checks, and each check builds a string of up to
  <code>L</code> characters and hashes it, so the time is O(n · L²). Space is
  O(n) plus the dictionary. Without the bound the same code is O(n³) in the worst
  case.
</p>
<div class="warn">
  <span class="ttl">⚠ Greedy longest-match fails</span>
  Taking the longest word at each position is tempting and wrong. With
  <code>s = "abcd"</code> and the dictionary <code>["ab", "abc", "cd"]</code>
  greedy takes <code>"abc"</code> and is stuck on <code>"d"</code>, while
  <code>"ab" + "cd"</code> works. The table is correct because it keeps every
  splittable prefix, not just the longest. Two smaller traps: put the words in a
  <code>Set</code> (an array's <code>includes</code> makes every check linear in
  the dictionary), and break out of the loop at the first success, since one
  split is enough. If the question asks you to <em>list</em> the splits, that is
  Word Break II and it becomes memoized backtracking; see the advanced
  backtracking chapter.
</div>

<h3>Worked example: Longest Increasing Subsequence</h3>
<pre><code><span class="c">// O(n²) — dp[i] = length of the longest increasing subsequence ENDING at i</span>
function lengthOfLIS(nums) {
  if (nums.length === 0) return 0;
  const dp = new Array(nums.length).fill(1); <span class="c">// every element alone is a subsequence of length 1</span>
  let best = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}</code></pre>
<p class="sub">
  There's an O(n log n) version worth knowing exists, even if the O(n²)
  is your first answer: maintain an array <code>tails</code> where
  <code>tails[k]</code> is the smallest possible "tail value" of an
  increasing subsequence of length <code>k+1</code>, and binary search
  (from the earlier chapter) for where each new number belongs. The
  length of <code>tails</code> at the end is the answer — a nice example
  of two earlier patterns (DP + binary search) combining.
</p>

<h3>LIS in O(n log n) — the tails array</h3>
<p>
  The O(n²) table asks, for every <code>i</code>, a question about every
  <code>j &lt; i</code>. The faster version flips the bookkeeping. Keep
  <code>tails</code>, where <code>tails[k]</code> is the <b>smallest possible last
  value</b> of an increasing subsequence of length <code>k + 1</code> among the
  elements seen so far. Why the smallest? Because for extending, a smaller tail
  is never worse: anything that can follow a tail of 7 can follow a tail of 3.
</p>
<p>
  Two facts make it work. First, <code>tails</code> is always strictly
  increasing: if a subsequence of length 3 ends at 5, then one of length 2 ends
  at something smaller than 5, namely its own second-to-last value. Because it is
  sorted, a binary search can place each new number. Second, a new number
  <code>x</code> does one of two things. If it is larger than every tail, it
  extends the longest run and is appended. Otherwise it replaces the first tail
  that is greater than or equal to it, which lowers that length's best tail
  without changing any length.
</p>
<pre><code>function lengthOfLISFast(nums) {
  const tails = []; <span class="c">// tails[k] = smallest tail of any increasing subsequence of length k + 1</span>
  for (const x of nums) {
    let lo = 0, hi = tails.length;
    while (lo &lt; hi) { <span class="c">// first index whose tail is &gt;= x</span>
      const mid = (lo + hi) &gt;&gt; 1;
      if (tails[mid] &lt; x) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = x; <span class="c">// extend the longest run, or lower an existing tail</span>
  }
  return tails.length;
}</code></pre>
<h4>Dry run: [10, 9, 2, 5, 3, 7, 101, 18]</h4>
<table>
  <tr><th>x</th><th>Slot found</th><th>tails after</th></tr>
  <tr><td>10</td><td>0 (empty)</td><td>[10]</td></tr>
  <tr><td>9</td><td>0: replaces 10</td><td>[9]</td></tr>
  <tr><td>2</td><td>0: replaces 9</td><td>[2]</td></tr>
  <tr><td>5</td><td>1: appended</td><td>[2, 5]</td></tr>
  <tr><td>3</td><td>1: replaces 5</td><td>[2, 3]</td></tr>
  <tr><td>7</td><td>2: appended</td><td>[2, 3, 7]</td></tr>
  <tr><td>101</td><td>3: appended</td><td>[2, 3, 7, 101]</td></tr>
  <tr><td>18</td><td>3: replaces 101</td><td>[2, 3, 7, 18]</td></tr>
</table>
<p class="sub">
  The answer is the final length, 4. Time is O(n log n), one binary search per
  element, and space is O(n).
</p>
<div class="warn">
  <span class="ttl">⚠ <code>tails</code> is not the subsequence, and the comparison decides "strictly"</span>
  For <code>[4, 5, 1]</code> the final <code>tails</code> is <code>[1, 5]</code>,
  yet 1 comes after 5 in the input, so that array is not a subsequence of it (the
  real longest ones are <code>[4, 5]</code>): <code>tails</code> is a record of
  best tails, not of one real subsequence. If you need the subsequence itself, store the index
  at each slot plus a parent link per element. For strictly increasing
  sequences, find the first tail <b>greater than or equal to</b> <code>x</code>
  (the <code>tails[mid] &lt; x</code> test above). For non-decreasing sequences,
  find the first tail <b>strictly greater</b> than <code>x</code> instead; with
  the wrong one, equal values are counted as increases or are dropped.
</div>

<h3>Two meanings of dp[i], and Kadane's two states</h3>
<p>
  Look at the state definitions used so far, because they come in two flavours,
  and mixing them up is the commonest reason a recurrence will not close.
</p>
<table>
  <tr><th>Meaning of <code>dp[i]</code></th><th>Problems</th><th>The answer is</th></tr>
  <tr><td>the answer for the <b>first i items</b></td><td>House Robber, Coin Change, Word Break, Decode Ways</td><td>the last cell, <code>dp[n]</code> (or <code>dp[amount]</code>)</td></tr>
  <tr><td>the best subsequence or subarray <b>ending at i</b></td><td>LIS, Maximum Subarray, Maximum Product Subarray</td><td>the best value over <b>all</b> cells</td></tr>
</table>
<p class="sub">
  A "first i items" cell is a complete answer about that whole prefix, so the
  last cell already answers the whole question. An "ending at i" cell is forced to include item
  <code>i</code>, so the best solution can end anywhere and you must scan every
  cell.
</p>
<p>
  <b>Maximum Subarray (Kadane's algorithm)</b> is the cleanest example of the
  second flavour. Let <code>endingHere</code> be the best sum of a non-empty
  subarray that ends at <code>i</code>. That subarray either is just
  <code>nums[i]</code> or extends the best subarray that ended at
  <code>i - 1</code>, so
  <code>endingHere = max(nums[i], endingHere + nums[i])</code>, and the answer is
  the largest <code>endingHere</code> seen. For
  <code>[1, -3, 4, -1, 2, 1, -5, 4]</code> the running values of
  <code>endingHere</code> are 1, -2, 4, 3, 5, 6, 1, 5, and the best is 6 from
  <code>[4, -1, 2, 1]</code>.
</p>
<p>
  <b>Maximum Product Subarray</b> looks the same and is not, because a negative
  number turns the smallest product into the largest. One state is therefore not
  enough. Keep both the largest and the smallest product of a subarray ending at
  <code>i</code>, and at each step take the best and worst of three candidates:
  start fresh at <code>x</code>, extend the maximum, or extend the minimum.
</p>
<pre><code>function maxSubArray(nums) {
  let endingHere = nums[0], best = nums[0]; <span class="c">// endingHere = best sum of a subarray ending at i</span>
  for (let i = 1; i &lt; nums.length; i++) {
    endingHere = Math.max(nums[i], endingHere + nums[i]); <span class="c">// extend the previous run, or start fresh</span>
    best = Math.max(best, endingHere);
  }
  return best;
}

function maxProduct(nums) {
  let hi = nums[0], lo = nums[0], best = nums[0]; <span class="c">// largest and smallest product ending at i</span>
  for (let i = 1; i &lt; nums.length; i++) {
    const x = nums[i];
    const candidates = [x, hi * x, lo * x]; <span class="c">// start fresh, extend the max, extend the min</span>
    hi = Math.max(...candidates);
    lo = Math.min(...candidates);
    best = Math.max(best, hi);
  }
  return best;
}</code></pre>
<h4>Dry run: maxProduct([-2, 3, -4])</h4>
<table>
  <tr><th>x</th><th>Candidates (x, hi · x, lo · x)</th><th>hi</th><th>lo</th><th>best</th></tr>
  <tr><td>start</td><td>—</td><td>-2</td><td>-2</td><td>-2</td></tr>
  <tr><td>3</td><td>3, -6, -6</td><td>3</td><td>-6</td><td>3</td></tr>
  <tr><td>-4</td><td>-4, -12, 24</td><td>24</td><td>-12</td><td>24</td></tr>
</table>
<p class="sub">
  The 24 comes from <code>lo · x</code>, the earlier minimum times a negative:
  without the second state the answer would be 3. Both functions are O(n) time
  and O(1) space. A zero is handled by the "start fresh" candidate, which resets
  both values.
</p>
<div class="warn">
  <span class="ttl">⚠ Initialise from the first element, not from 0</span>
  Starting <code>best</code> at 0 returns 0 for <code>[-3, -1]</code>, where the
  right answer is -1: the subarray must be non-empty. Start from
  <code>nums[0]</code> and loop from 1. For the product, compute all three
  candidates from the <em>old</em> <code>hi</code> and <code>lo</code> before
  overwriting either, as the code does by building the candidate array first;
  updating <code>hi</code> and then using it to update <code>lo</code> corrupts
  the minimum.
</div>

<h3>Worked example: Coin Change — minimum coins to make an amount</h3>
<p>
  Given coin denominations and a target amount, find the fewest coins
  that sum to it (or report it's impossible). This is the DP counterpart
  to the greedy "make change" instinct — and greedy provably fails here
  for arbitrary denominations (try amount 6 with coins [1, 3, 4]: greedy
  picks 4+1+1 = 3 coins, but 3+3 = 2 coins is better).
</p>
<pre><code>function coinChange(coins, amount) {
  <span class="c">// dp[a] = fewest coins to make amount a. Infinity = "not yet known to be possible"</span>
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; <span class="c">// base case: 0 coins needed to make amount 0</span>

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] !== Infinity) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1); <span class="c">// try using one of THIS coin</span>
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}</code></pre>
<h4>Dry run: coinChange([1, 3, 4], 6) — the example above</h4>
<table>
  <tr><th>a</th><th>dp[a]</th><th>Why</th></tr>
  <tr><td>0</td><td>0</td><td>base case</td></tr>
  <tr><td>1</td><td>1</td><td>dp[0] + one 1-coin</td></tr>
  <tr><td>2</td><td>2</td><td>dp[1] + one 1-coin</td></tr>
  <tr><td>3</td><td>1</td><td>dp[0] + one 3-coin — beats dp[2] + one 1-coin (3)</td></tr>
  <tr><td>4</td><td>1</td><td>dp[0] + one 4-coin — beats dp[3] + one 1-coin (2)</td></tr>
  <tr><td>5</td><td>2</td><td>dp[4] + one 1-coin, ties dp[1] + one 4-coin</td></tr>
  <tr><td>6</td><td>2</td><td>dp[3] + one 3-coin — beats dp[2] + one 4-coin (3)</td></tr>
</table>
<p class="sub">
  dp[6] = 2, matching 3 + 3. The loop tries every coin at every amount and
  keeps the minimum — dp[3] getting to 1 (via the 3-coin, not two 1-coins)
  is what later lets dp[6] reuse that cheap subproblem instead of building
  up from dp[2].
</p>
<div class="warn">
  <span class="ttl">⚠ Why greedy fails here (and DP doesn't)</span>
  Greedy commits to the biggest coin first and never reconsiders — but
  the best solution can require a <em>smaller</em> coin earlier to leave
  a better-divisible remainder. DP doesn't guess; it tries every coin at
  every amount and keeps whichever choice actually produces the minimum,
  which is exactly the guarantee greedy can't make without a proof.
</div>
<p class="sub">
  Notice the loop order: for each amount, try every coin — this is
  "unbounded" DP (each coin can be reused any number of times), the exact
  same reuse idea as Combination Sum in the backtracking chapter, just
  solved by table-filling instead of exploring a tree.
</p>

<h3>Perfect Squares — coin change where the coins are squares</h3>
<p>
  What is the fewest perfect squares (1, 4, 9, 16, ...) that add up to
  <code>n</code>? It is Coin Change with the coin set <code>{1, 4, 9, ...}</code>
  and unlimited use of each, and the same table applies:
  <code>fewest[i] = 1 + min(fewest[i - r²])</code> over every square
  <code>r² ≤ i</code>, with <code>fewest[0] = 0</code>. Recognising that a problem
  is a known one in disguise is most of the skill here.
</p>
<pre><code>function numSquares(n) {
  const fewest = new Array(n + 1).fill(Infinity); <span class="c">// fewest[i] = fewest squares that sum to i</span>
  fewest[0] = 0;
  for (let i = 1; i &lt;= n; i++) {
    for (let root = 1; root * root &lt;= i; root++) {
      fewest[i] = Math.min(fewest[i], fewest[i - root * root] + 1);
    }
  }
  return fewest[n];
}</code></pre>
<h4>Dry run: numSquares(12)</h4>
<table>
  <tr><th>i</th><th>fewest[i]</th><th>Best last square</th></tr>
  <tr><td>1, 2, 3</td><td>1, 2, 3</td><td>1 each time: 1+1, 1+1+1</td></tr>
  <tr><td>4</td><td>1</td><td>4 itself, from fewest[0]</td></tr>
  <tr><td>5, 6, 7</td><td>2, 3, 4</td><td>1 on top of fewest[4], fewest[5], fewest[6]</td></tr>
  <tr><td>8</td><td>2</td><td>4 + 4, from fewest[4]</td></tr>
  <tr><td>9</td><td>1</td><td>9 itself</td></tr>
  <tr><td>10, 11</td><td>2, 3</td><td>1 on top of fewest[9], fewest[10]</td></tr>
  <tr><td>12</td><td>3</td><td>4 + 4 + 4, from fewest[8]</td></tr>
</table>
<p class="sub">
  The answer 3 is <code>4 + 4 + 4</code>; a greedy pick of the biggest square
  first would take 9 and then need three 1s, four squares. Time is O(n · √n),
  since each <code>i</code> tries at most √i squares, and space is O(n). A
  classical theorem says every positive integer is a sum of four squares, so the
  answer is never more than 4, which is a useful sanity check but not a reason
  to skip the table.
</p>

<h3>Coin Change II — the loop order decides what you count</h3>
<p>
  Coin Change asked for the <em>fewest</em> coins. Coin Change II asks <em>how
  many different combinations</em> of coins sum to <code>amount</code>, where
  <code>[1, 2]</code> and <code>[2, 1]</code> are the same combination. The
  recurrence is again a sum, but now the order of the two loops changes the
  meaning of the answer.
</p>
<pre><code>function change(amount, coins) {
  const ways = new Array(amount + 1).fill(0);
  ways[0] = 1; <span class="c">// one way to make 0: take nothing</span>
  for (const coin of coins) { <span class="c">// coins OUTSIDE: each combination is built in one coin order only</span>
    for (let a = coin; a &lt;= amount; a++) {
      ways[a] += ways[a - coin];
    }
  }
  return ways[amount];
}

function countOrderedWays(amount, coins) {
  const ways = new Array(amount + 1).fill(0);
  ways[0] = 1;
  for (let a = 1; a &lt;= amount; a++) { <span class="c">// amounts OUTSIDE: every order of the same coins counts</span>
    for (const coin of coins) {
      if (coin &lt;= a) ways[a] += ways[a - coin];
    }
  }
  return ways[amount];
}</code></pre>
<p>
  With <b>coins on the outside</b> and amounts inside, you finish deciding about
  one coin before the next one is introduced, so each combination is built in one
  fixed coin order: counted once. With <b>amounts on the outside</b> and coins
  inside, every amount asks "what was my last coin?" for every coin, so
  <code>1 + 2</code> and <code>2 + 1</code> both count: you are counting
  sequences. For <code>amount = 5</code> and <code>coins = [1, 2, 5]</code> the
  coin-outside version gives 4 combinations (<code>5</code>,
  <code>2+2+1</code>, <code>2+1+1+1</code>, <code>1+1+1+1+1</code>), and the
  swapped loops give 9 ordered sequences.
</p>
<h4>Dry run: ways[0..5] after each coin, coins [1, 2, 5]</h4>
<table>
  <tr><th>After coin</th><th>ways[0..5]</th><th>What changed</th></tr>
  <tr><td>none</td><td>1, 0, 0, 0, 0, 0</td><td>only the empty selection makes 0</td></tr>
  <tr><td>1</td><td>1, 1, 1, 1, 1, 1</td><td>every amount has exactly one way with only 1s</td></tr>
  <tr><td>2</td><td>1, 1, 2, 2, 3, 3</td><td>ways[a] += ways[a - 2], reading values already updated for this coin</td></tr>
  <tr><td>5</td><td>1, 1, 2, 2, 3, 4</td><td>only ways[5] changes: 3 + ways[0]</td></tr>
</table>
<p class="sub">
  Notice that the inner loop runs upward here, so <code>ways[a - coin]</code>
  already includes uses of the same coin: that is what lets a coin be reused. The
  full treatment of this family, including how the loop direction flips for 0/1
  choices, and the other counting variants such as Target Sum, is in the
  <a href="/dsa/dsa-dp-state-machines">DP state machines and the knapsack
  family</a> chapter. Time is O(amount · coins) and space O(amount).
</p>

<h3>Partition Equal Subset Sum — the backwards loop</h3>
<p>
  Can an array be split into two subsets with equal sums? If the total is odd, no.
  Otherwise it is asking whether some subset sums to <code>total / 2</code>, which
  is a yes-or-no cousin of the table above with one big difference: each element
  may be used <b>at most once</b>. Let <code>reachable[s]</code> mean "some subset
  of the items seen so far sums to <code>s</code>". Adding an item
  <code>x</code> makes <code>s</code> reachable if <code>s - x</code> was
  reachable <em>before</em> this item.
</p>
<pre><code>function canPartition(nums) {
  const total = nums.reduce((sum, x) =&gt; sum + x, 0);
  if (total % 2 !== 0) return false;
  const target = total / 2;
  const reachable = new Array(target + 1).fill(false); <span class="c">// reachable[s] = some subset sums to s</span>
  reachable[0] = true;
  for (const x of nums) {
    for (let s = target; s &gt;= x; s--) { <span class="c">// DOWNWARD: reachable[s - x] is still from BEFORE this item</span>
      if (reachable[s - x]) reachable[s] = true;
    }
  }
  return reachable[target];
}</code></pre>
<h4>Dry run: [1, 5, 11, 5], target 11</h4>
<table>
  <tr><th>After item</th><th>Reachable sums (0 to 11)</th></tr>
  <tr><td>1</td><td>0, 1</td></tr>
  <tr><td>5</td><td>0, 1, 5, 6</td></tr>
  <tr><td>11</td><td>0, 1, 5, 6, 11 (the target is already hit)</td></tr>
  <tr><td>5</td><td>0, 1, 5, 6, 10, 11</td></tr>
</table>
<p class="sub">
  11 is reachable (1 + 5 + 5, leaving 11 on the other side), so the answer is
  true. Time is O(n · total / 2) and space is O(total / 2). Note that this is
  pseudo-polynomial: it depends on the <em>value</em> of the sum, not only on the
  number of items.
</p>
<div class="warn">
  <span class="ttl">⚠ The direction of the inner loop is the difference between 0/1 and unbounded</span>
  Running <code>s</code> upward lets <code>reachable[s - x]</code> already contain
  the effect of the current item, so the item can feed itself, and you have
  silently switched to "unlimited copies". The array <code>[2, 6]</code> sums to 8
  and the target is 4. The correct answer is <code>false</code>. An upward loop
  says <code>true</code>: it marks 2, then 4 from 2 + 2, using the single 2
  twice. Downward, every read of <code>s - x</code> comes from a position not yet
  touched by this item. Coin Change II above runs upward on purpose; here it
  must run downward. The full knapsack treatment is in the
  <a href="/dsa/dsa-dp-state-machines">DP state machines</a> chapter.
</div>

<h3>Palindromic substrings — expand around every centre</h3>
<p>
  Count the palindromic substrings of a string, or find the longest one. A
  palindrome is determined by its centre: grow outwards while the two ends match,
  and every step that succeeds is one more palindrome with the same centre. The
  centre is one of <code>2n - 1</code> places, <code>n</code> characters (odd
  lengths) and <code>n - 1</code> gaps between characters (even lengths), and
  trying both kinds from every index covers them all.
</p>
<pre><code>function countSubstrings(s) {
  let count = 0;

  function expand(left, right) { <span class="c">// grow outwards while the ends match; each success is one palindrome</span>
    while (left &gt;= 0 &amp;&amp; right &lt; s.length &amp;&amp; s[left] === s[right]) {
      count++;
      left--;
      right++;
    }
  }

  for (let center = 0; center &lt; s.length; center++) {
    expand(center, center); <span class="c">// odd length: the centre is a character</span>
    expand(center, center + 1); <span class="c">// even length: the centre is a gap</span>
  }
  return count;
}

function longestPalindrome(s) {
  let bestStart = 0, bestLen = 0;

  function expand(left, right) {
    while (left &gt;= 0 &amp;&amp; right &lt; s.length &amp;&amp; s[left] === s[right]) {
      left--;
      right++;
    }
    const len = right - left - 1; <span class="c">// the loop stepped one past the palindrome on each side</span>
    if (len &gt; bestLen) {
      bestLen = len;
      bestStart = left + 1;
    }
  }

  for (let center = 0; center &lt; s.length; center++) {
    expand(center, center);
    expand(center, center + 1);
  }
  return s.slice(bestStart, bestStart + bestLen);
}</code></pre>
<h4>Dry run: countSubstrings("aaa")</h4>
<table>
  <tr><th>Centre</th><th>Expansions that succeed</th><th>Palindromes found</th></tr>
  <tr><td>char 0</td><td>"a"</td><td>1</td></tr>
  <tr><td>gap 0-1</td><td>"aa"</td><td>1</td></tr>
  <tr><td>char 1</td><td>"a", "aaa"</td><td>2</td></tr>
  <tr><td>gap 1-2</td><td>"aa"</td><td>1</td></tr>
  <tr><td>char 2</td><td>"a"</td><td>1</td></tr>
</table>
<p class="sub">
  Total 6 (three single letters, two "aa", one "aaa"). Time is O(n²): there are
  about 2n centres and each can expand O(n) steps, the worst case being a string
  of one repeated letter. Space is O(1) beyond the output. A different technique
  (Manacher's algorithm) does the same in O(n), but it is rarely asked for.
</p>
<div class="warn">
  <span class="ttl">⚠ Forgetting the even centres, and an off-by-one in the length</span>
  Expanding only from single characters misses <code>"aa"</code> and
  <code>"abba"</code>. In <code>longestPalindrome</code> the loop stops one step
  <em>past</em> the palindrome on each side, so its length is
  <code>right - left - 1</code> and it starts at <code>left + 1</code>. Writing
  <code>right - left + 1</code> is the usual slip. Compare this with the
  table-based approach, which is also O(n²) but uses O(n²) memory.
</div>

<h3>Triangle — let the rows be the table</h3>
<p>
  A triangle of numbers has one entry in row 0, two in row 1, and so on. You start
  at the top and move to one of the two entries just below, left or right.
  Find the smallest path sum from top to bottom. Going top-down, the choice at each
  entry sends you into overlapping paths, so work <b>bottom-up</b>: the cheapest
  path from an entry down to the bottom is the entry itself plus the smaller of
  the two cheapest paths from the entries below it. Start with the last row,
  where the cheapest path is the entry, and fold the rows upward into one array.
</p>
<pre><code>function minimumTotal(triangle) {
  const best = [...triangle[triangle.length - 1]]; <span class="c">// best[j] = cheapest path from the row below down to the bottom, via j</span>
  for (let row = triangle.length - 2; row &gt;= 0; row--) {
    for (let j = 0; j &lt;= row; j++) {
      best[j] = triangle[row][j] + Math.min(best[j], best[j + 1]); <span class="c">// step down-left or down-right</span>
    }
  }
  return best[0];
}</code></pre>
<h4>Dry run: [[2], [3, 4], [6, 5, 7], [4, 1, 8, 3]]</h4>
<table>
  <tr><th>Row processed</th><th>best array afterwards</th><th>How</th></tr>
  <tr><td>3 (copied)</td><td>4, 1, 8, 3</td><td>the cheapest path from a bottom entry is itself</td></tr>
  <tr><td>2</td><td>7, 6, 10</td><td>6 + min(4, 1), 5 + min(1, 8), 7 + min(8, 3)</td></tr>
  <tr><td>1</td><td>9, 10</td><td>3 + min(7, 6), 4 + min(6, 10)</td></tr>
  <tr><td>0</td><td>11</td><td>2 + min(9, 10)</td></tr>
</table>
<p class="sub">
  The answer is 11 (2 + 3 + 5 + 1). Time is O(n²) for <code>n</code> rows, which
  is the number of entries, and the extra space is O(n), one row. Because the
  array is reused row after row, the loop over <code>j</code> must go left to
  right: <code>best[j]</code> is overwritten using <code>best[j]</code> and
  <code>best[j + 1]</code>, and <code>best[j + 1]</code> has not been overwritten
  yet at that point. Going right to left would read an already updated value.
</p>
<div class="warn">
  <span class="ttl">⚠ Copy the last row before overwriting it</span>
  <code>best = triangle[last]</code> without the copy writes into the caller's
  data, so a second call, or a test that reuses the input, sees a changed
  triangle. Also check the reading of "adjacent": from index <code>j</code> you
  may go to <code>j</code> or <code>j + 1</code> in the next row, never
  <code>j - 1</code>.
</div>

<h3>A top-down template you can write on a whiteboard</h3>
<p>
  The bottom-up tables above need you to see the fill order. When you cannot see
  it, or only some subproblems are ever reached, write the recursive definition
  first and add a cache. The recipe is four lines: a function of the <b>whole
  state</b>, a base case, a cache lookup, and a store before returning. Here is
  Coin Change from earlier written that way, with the cache keyed by the
  remaining amount:
</p>
<pre><code>function coinChangeTopDown(coins, amount) {
  const memo = new Map(); <span class="c">// key: remaining amount; value: fewest coins, or Infinity if impossible</span>

  function solve(remaining) {
    if (remaining === 0) return 0;
    if (remaining &lt; 0) return Infinity;
    if (memo.has(remaining)) return memo.get(remaining); <span class="c">// has(), not a truthiness test: 0 is a real answer</span>

    let best = Infinity;
    for (const coin of coins) best = Math.min(best, solve(remaining - coin) + 1);
    memo.set(remaining, best);
    return best;
  }

  const result = solve(amount);
  return result === Infinity ? -1 : result;
}</code></pre>
<p>
  Both versions solve the same distinct subproblems, at most
  <code>amount</code> of them, each doing <code>coins.length</code> work, so the
  time is O(amount · coins) in both. The rule for any memoized recursion is
  <b>states × work per state</b>.
</p>
<table>
  <tr><th></th><th>Top-down (memoize)</th><th>Bottom-up (table)</th></tr>
  <tr><td>Easiest to derive</td><td>yes, it is the recurrence as written</td><td>needs the fill order worked out</td></tr>
  <tr><td>Visits only needed states</td><td>yes</td><td>no, fills the whole table</td></tr>
  <tr><td>Stack depth</td><td>up to the number of levels, so thousands of frames can overflow</td><td>none</td></tr>
  <tr><td>Can drop old rows to save space</td><td>harder</td><td>yes, when only a window is needed</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Four memo bugs that only some inputs expose</span>
  <b>An incomplete key.</b> Everything the answer depends on must be in the key;
  a cache keyed by <code>i</code> alone is wrong if the answer also depends on a
  remaining budget. <b>A falsy test.</b> <code>if (memo[x]) return memo[x]</code>
  re-solves every state whose answer is 0 (or <code>false</code>, or an empty
  string); use <code>has</code> or compare with <code>undefined</code>.
  <b>Forgetting to store.</b> The function computes the right answer but never
  caches it, and it is silently exponential again. <b>Depth.</b> A recursion that
  goes one level per element overflows the stack for inputs in the tens of
  thousands of levels; convert to the table when the inputs are that large.
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll define dp[i] as the
  answer restricted to just the first i elements, figure out how dp[i]
  relates to smaller states, then either memoize the recursive version or
  build the table bottom-up — the state definition is the hard part, the
  loop that fills it in is almost mechanical once that's right."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Maximum/minimum/number of ways to…" over a sequence</li>
  <li>A brute-force recursive solution exists, but it's exponential because of repeated subproblems</li>
  <li>The answer at position i can be expressed using answers at earlier positions</li>
  <li>"Fewest/minimum number of coins/steps/jumps to reach X" with reusable choices → unbounded DP, same shape as Coin Change (Perfect Squares is Coin Change with square coins)</li>
  <li>"Number of ways to reach / decode / split" where the last move is one of a few kinds → add the counts of the states each kind comes from (Climbing Stairs, Decode Ways)</li>
  <li>"Can this prefix be split into pieces from a set?" → one boolean per prefix, looking back over the possible last piece (Word Break)</li>
  <li>Circular input → decide which element is left out and solve two linear problems (House Robber II)</li>
  <li>"Best subarray ending at i" where a negative or a zero changes everything → carry both the best and the worst value ending at i (Maximum Product Subarray)</li>
  <li>Counting combinations versus counting sequences → the order of the two loops decides which one you get (Coin Change II); 0/1 choices want the inner loop to run backwards (Partition Equal Subset Sum)</li>
  <li>If choices interact in only two dimensions (not "a sequence" but "a sequence + a budget," or two sequences compared against each other), that's the cue for 2D DP, next</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State the four questions (meaning of dp[i], recurrence, base case, fill order) for a new 1D problem before writing any code.</li>
    <li>Convert a memoized recursive solution into a bottom-up table, and then space-optimize it when only a fixed window of earlier states is needed.</li>
    <li>Explain, with a concrete counterexample, why greedy fails on Coin Change but DP doesn't.</li>
    <li>Recognize "unbounded" DP (a choice can repeat) versus "0/1" DP (each choice used at most once), and say what changes in the loop.</li>
    <li>Given a new problem, decide in one sentence whether it's 1D DP, 2D DP, or not DP at all.</li>
    <li>Say whether a state means "the answer for the first i items" or "the best one ending at i", and where the final answer is read from in each case.</li>
    <li>Write House Robber II as two linear passes, Decode Ways with its zero cases, and Word Break with a bound on the word length.</li>
    <li>Explain why Maximum Product Subarray needs two values per position, and why Coin Change II's loop order counts combinations while the swapped order counts sequences.</li>
    <li>Explain why the 0/1 knapsack loop runs backwards, with the one-element counterexample for the forward loop.</li>
    <li>Write the O(n log n) LIS with a binary search, and say why <code>tails</code> is not itself a subsequence.</li>
    <li>Write a memoized recursion from the four lines of the template, and name the four ways a memo goes wrong.</li>
  </ul>
</div>`,
};
