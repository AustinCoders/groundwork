import type { Chapter } from "../types";

export const dsaDp2d: Chapter = {
  id: "dsa-dp-2d",
  num: "I8",
  title: "Dynamic programming: 2D",
  short: "DP: 2D",
  levels: ["intermediate"],
  practice: [
    "ex-unique-paths",
    "ex-unique-paths-ii",
    "ex-minimum-path-sum",
    "ex-longest-common-subsequence",
    "ex-edit-distance",
  ],
  ready: true,
  subtitle: "Same idea as 1D, one more dimension — a grid table instead of a row.",
  body: `<h3>When one index isn't enough</h3>
<p>
  2D DP shows up whenever the state needs <b>two</b> pieces of changing
  information to describe it — a position in a grid (row, col), two
  strings being compared (index into each), or an item index plus a
  remaining budget. The recipe from the 1D chapter doesn't change: define
  the state, find the recurrence, pick a base case, fill in order. Only
  now the table has two axes.
</p>

<h3>Grid paths — the most visual entry point</h3>
<figure>
  <svg viewBox="0 0 500 260" class="dg" role="img" aria-label="A grid where each cell's value is the sum of the cell above and the cell to the left, showing the number of unique paths to reach it">
    <g class="rough">
      <rect class="box" x="20" y="20" width="70" height="50" />
      <rect class="box" x="90" y="20" width="70" height="50" />
      <rect class="box" x="160" y="20" width="70" height="50" />
      <rect class="box" x="230" y="20" width="70" height="50" />
      <rect class="box" x="20" y="70" width="70" height="50" />
      <rect class="box" x="90" y="70" width="70" height="50" />
      <rect class="box" x="160" y="70" width="70" height="50" />
      <rect class="boxg" x="230" y="70" width="70" height="50" />
      <rect class="box" x="20" y="120" width="70" height="50" />
      <rect class="box" x="90" y="120" width="70" height="50" />
      <rect class="box" x="160" y="120" width="70" height="50" />
      <rect class="box" x="230" y="120" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="50" text-anchor="middle">1</text>
    <text class="sm" x="125" y="50" text-anchor="middle">1</text>
    <text class="sm" x="195" y="50" text-anchor="middle">1</text>
    <text class="sm" x="265" y="50" text-anchor="middle">1</text>
    <text class="sm" x="55" y="100" text-anchor="middle">1</text>
    <text class="sm" x="125" y="100" text-anchor="middle">2</text>
    <text class="sm" x="195" y="100" text-anchor="middle">3</text>
    <text class="sm gr" x="265" y="100" text-anchor="middle">4</text>
    <text class="sm" x="55" y="150" text-anchor="middle">1</text>
    <text class="sm" x="125" y="150" text-anchor="middle">3</text>
    <text class="sm" x="195" y="150" text-anchor="middle">6</text>
    <text class="sm" x="265" y="150" text-anchor="middle">10</text>
    <text class="lbl gr" x="20" y="200" style="font-size:14px">dp[1][3] = dp[0][3] + dp[1][2] = 1 + 3 = 4</text>
    <text class="sm" x="20" y="225">every cell = the cell above + the cell to the left</text>
  </svg>
  <figcaption>Each cell only looks up, and looks left — never anywhere else. That's the whole recurrence.</figcaption>
</figure>
<pre><code><span class="c">// unique paths from top-left to bottom-right, moving only right or down</span>
function uniquePaths(rows, cols) {
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1)); <span class="c">// first row/col = 1 way</span>

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; <span class="c">// from above, or from the left</span>
    }
  }
  return dp[rows - 1][cols - 1];
}</code></pre>

<h3>Comparing two strings — the other common shape</h3>
<p>
  Longest Common Subsequence: <code>dp[i][j]</code> = the LCS length using
  the first <code>i</code> characters of one string and the first
  <code>j</code> of the other.
</p>
<figure>
  <svg viewBox="0 0 500 200" class="dg" role="img" aria-label="A diagram of the two branches of the LCS recurrence: characters match, take the diagonal plus one, or characters differ, take the best of skipping one character from either string">
    <g class="rough">
      <rect class="boxg" x="20" y="20" width="220" height="70" rx="6" />
      <rect class="boxy" x="260" y="20" width="220" height="70" rx="6" />
    </g>
    <text class="lbl gr" x="35" y="45" style="font-size:14px">chars match:</text>
    <text class="sm" x="35" y="70">dp[i][j] = dp[i-1][j-1] + 1</text>
    <text class="lbl" x="275" y="45" style="font-size:14px">chars differ:</text>
    <text class="sm" x="275" y="65" style="font-size:11px">dp[i][j] = max(dp[i-1][j],</text>
    <text class="sm" x="275" y="80" style="font-size:11px">dp[i][j-1])</text>
    <text class="sm" x="20" y="130">A match extends the diagonal answer by one. A mismatch means "drop</text>
    <text class="sm" x="20" y="150">one character from either string" and keep whichever result is better.</text>
  </svg>
  <figcaption>Two branches, decided per cell by comparing one character from each string.</figcaption>
</figure>
<pre><code>function longestCommonSubsequence(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Off-by-one is the #1 bug in string DP</span>
  Using a table of size <code>(a.length+1) × (b.length+1)</code> — not
  <code>a.length × b.length</code> — is deliberate: row 0 and column 0
  represent "using zero characters," which is what makes
  <code>dp[i-1][j-1]</code> safe to read even when <code>i</code> or
  <code>j</code> is 1. Skip the padding row/column and you'll be
  constantly special-casing the edges instead.
</div>

<h3>The 0/1 Knapsack shape — item index vs. remaining capacity</h3>
<pre><code><span class="c">// dp[i][w] = best value using the first i items, with capacity w remaining</span>
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; <span class="c">// option 1: don't take item i</span>
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1] <span class="c">// option 2: take it</span>
        );
      }
    }
  }
  return dp[n][capacity];
}</code></pre>
<p class="sub">
  Every "at most one of each item, maximize value under a budget" problem
  is this exact shape — the two options at each cell (skip it / take it)
  are the same two-branch decision as the LCS match/mismatch above, just
  applied to a different pair of dimensions.
</p>

<h3>Edit Distance — arguably the single most-asked 2D DP question</h3>
<p>
  Minimum number of insert/delete/replace operations to turn one string
  into another. Same LCS-style grid, but now <b>three</b> branches
  instead of two, because a mismatch has three possible fixes.
</p>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="Three neighboring cells feeding into the current cell when characters differ: replace from the diagonal, delete from above, insert from the left">
    <g class="rough">
      <rect class="box" x="120" y="20" width="110" height="50" />
      <rect class="box" x="260" y="20" width="110" height="50" />
      <rect class="box" x="120" y="100" width="110" height="50" />
      <rect class="boxg" x="260" y="100" width="110" height="50" />
    </g>
    <path class="ln" d="M195,70 L280,100" marker-end="url(#dgarrow4)" />
    <path class="ln" d="M315,70 L315,100" marker-end="url(#dgarrow4)" />
    <path class="ln" d="M230,125 L260,125" marker-end="url(#dgarrow4)" />
    <defs>
      <marker id="dgarrow4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="sm" x="175" y="50" text-anchor="middle">diagonal</text>
    <text class="sm" x="175" y="68" text-anchor="middle">(replace)</text>
    <text class="sm" x="315" y="50" text-anchor="middle">above</text>
    <text class="sm" x="315" y="68" text-anchor="middle">(delete)</text>
    <text class="sm" x="175" y="130" text-anchor="middle">left</text>
    <text class="sm" x="175" y="148" text-anchor="middle">(insert)</text>
    <text class="lbl gr" x="315" y="122" text-anchor="middle" style="font-size:13px">current cell</text>
    <text class="sm gr" x="315" y="140" text-anchor="middle">= 1 + min(3)</text>
    <text class="lbl" x="20" y="195" style="font-size:14px">on a match, skip the +1 and just copy the diagonal cell</text>
  </svg>
  <figcaption>On a mismatch, take the cheapest of: delete a char (above), insert a char (left), or replace it (diagonal) — plus 1 for that operation.</figcaption>
</figure>
<pre><code>function minDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  <span class="c">// base cases: turning "" into b (all inserts) or a into "" (all deletes)</span>
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; <span class="c">// characters already match — no operation needed</span>
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     <span class="c">// delete from a</span>
          dp[i][j - 1],     <span class="c">// insert into a</span>
          dp[i - 1][j - 1]  <span class="c">// replace in a</span>
        );
      }
    }
  }
  return dp[a.length][b.length];
}</code></pre>
<p class="sub">
  This is LCS's structure with the mismatch branch upgraded from "pick
  the better of two neighbors" to "pick the best of three, plus a cost of
  1" — once you've internalized LCS, Edit Distance is a small, specific
  variation, not a new problem from scratch.
</p>

<h3>Palindrome DP — a different kind of two-dimensional state</h3>
<p>
  Here both dimensions describe the <em>same</em> string — a start index
  and an end index — rather than two different strings. "Is
  <code>s[i..j]</code> a palindrome?" depends on whether the outer
  characters match <em>and</em> the inside is also a palindrome, which
  means filling the table by increasing substring length, not row by row.
</p>
<pre><code><span class="c">// dp[i][j] = true if s[i..j] (inclusive) is a palindrome</span>
function longestPalindromicSubstring(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0, maxLen = 1;

  for (let i = 0; i < n; i++) dp[i][i] = true; <span class="c">// every single character is a palindrome</span>

  <span class="c">// fill by SUBSTRING LENGTH, not by row — a length-3 answer needs the length-1 answer inside it already computed</span>
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (s[i] !== s[j]) continue;
      dp[i][j] = len === 2 || dp[i + 1][j - 1]; <span class="c">// outer chars match AND inside is a palindrome</span>
      if (dp[i][j] && len > maxLen) { start = i; maxLen = len; }
    }
  }
  return s.slice(start, start + maxLen);
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Fill order matters more here than in any other 2D DP so far</span>
  <code>dp[i][j]</code> depends on <code>dp[i+1][j-1]</code> — a cell
  that's <em>both</em> a higher row index and a lower column index. Row-
  by-row (top to bottom) doesn't guarantee that cell is ready yet. Filling
  by increasing substring length guarantees every shorter (already-needed)
  substring is computed before any longer one that depends on it.
</div>

<h3>Space optimization: do you really need the whole grid?</h3>
<p>
  If <code>dp[i][...]</code> only ever depends on row <code>i-1</code>
  (never row <code>i-2</code> or earlier), you can collapse the table to
  two 1D rows — or even one row updated in place, for knapsack-style
  problems traversed right to left. This turns O(rows × cols) space into
  O(cols), the same "space-optimized" move as the end of the 1D chapter.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll define dp[i][j] as the
  answer using the first i elements of one thing and the first j of
  another, pad the table with a row and column of zeros for the empty
  case, then fill it in row by row — each cell only depends on cells
  already filled, so the fill order is safe."
</div>

<h3>Recognizing 2D over 1D</h3>
<ul>
  <li>Two sequences are being compared against each other (strings, arrays) → likely LCS-shaped</li>
  <li>"Minimum operations to transform one string into another" → Edit Distance's three-branch variant of LCS</li>
  <li>Movement on an actual grid → likely paths-shaped</li>
  <li>One sequence plus a constraint that itself has a range of values (weight, budget, count) → likely knapsack-shaped</li>
  <li>"Is this substring/subsequence a palindrome" → fill by increasing length, not row by row</li>
  <li>If the state needs a third piece of information, you're not stuck — extend to a 3D table (or a map keyed by a tuple) using the exact same recipe</li>
</ul>
<h3>See the table fill</h3>
<p>Watch which cells each new cell reads. On a match it reaches diagonally; otherwise it takes the better of above and left. That dependency pattern is the whole recurrence.</p>

<div class="demo">
  <div class="demo__bar">DP table — longest common subsequence, cell by cell</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="dp-code"></div>
        <div class="loop-bar"><i id="dp-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="dp-prev" type="button">← Back</button>
          <button class="btn" id="dp-next" type="button">Next step →</button>
          <button class="btn" id="dp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="dp-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">

      </div>
    </div>
      <div class="viz"><div class="viz__grid" id="dp-grid"></div></div>
    <p class="demo__note" id="dp-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "dp";
  var CODE = ["for (let i = 1; i <= A.length; i++)","  for (let j = 1; j <= B.length; j++)","    dp[i][j] = A[i-1] === B[j-1]","      ? dp[i-1][j-1] + 1","      : Math.max(dp[i-1][j], dp[i][j-1]);"];
  var STEPS = [{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"LCS of \\"ABCBDAB\\" and \\"BDCABA\\". Row 0 and column 0 are 0 — an empty string shares nothing."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (0) and left (0) = 0."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"D\\" — take the better of above (0) and left (0) = 0."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"C\\" — take the better of above (0) and left (0) = 0."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[0][3] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (0) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"hot"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[0][5] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[1][0] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"D\\" — take the better of above (0) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"C\\" — take the better of above (0) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (1) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[1][4] + 1 = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"hot"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (1) and left (2) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"D\\" — take the better of above (1) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" === \\"C\\" — extend the diagonal: dp[2][2] + 1 = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"A\\" — take the better of above (1) and left (2) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[3][0] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"D\\" — take the better of above (1) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"C\\" — take the better of above (2) and left (1) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"hot"},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[3][4] + 1 = 3."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"D\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"D\\" === \\"D\\" — extend the diagonal: dp[4][1] + 1 = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"D\\" — take the better of above (2) and left (1) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[5][3] + 1 = 3."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"dep"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"hot"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[5][5] + 1 = 4."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[6][0] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"dep"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"hot"},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[6][4] + 1 = 4."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"dep"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"dep"},{"v":"4","c":"hot"}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (4) and left (4) = 4."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"},{"v":"4","c":"hot"}]],"panels":{},"note":"Bottom-right is the answer: LCS length 4. Every cell was filled once — O(n·m)."}];
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
`,
};
