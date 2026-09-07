import type { Chapter } from "../types";

export const dsaDp1d: Chapter = {
  id: "dsa-dp-1d",
  num: "I7",
  title: "Dynamic programming: 1D",
  short: "DP: 1D",
  levels: ["intermediate"],
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

<h3>Worked example: Longest Increasing Subsequence</h3>
<pre><code><span class="c">// O(n²) — dp[i] = length of the longest increasing subsequence ENDING at i</span>
function lengthOfLIS(nums) {
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
  <li>"Fewest/minimum number of coins/steps/jumps to reach X" with reusable choices → unbounded DP, same shape as Coin Change</li>
  <li>If choices interact in only two dimensions (not "a sequence" but "a sequence + a budget," or two sequences compared against each other), that's the cue for 2D DP, next</li>
</ul>`,
};
