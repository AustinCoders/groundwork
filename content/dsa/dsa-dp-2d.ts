import type { Chapter } from "../types";

export const dsaDp2d: Chapter = {
  id: "dsa-dp-2d",
  num: "I11",
  title: "Dynamic programming: 2D",
  short: "DP: 2D",
  levels: ["intermediate"],
  prerequisites: ["dsa-dp-1d"],
  practice: [
    "ex-unique-paths",
    "ex-unique-paths-ii",
    "ex-minimum-path-sum",
    "ex-longest-common-subsequence",
    "ex-edit-distance",
    "ex-target-sum",
    "ex-interleaving-string",
    "ex-distinct-subsequences",
    "ex-maximal-square",
    "ex-knapsack-01",
    "ex-lcs-string",
    "ex-knapsack-chosen-items",
    "ex-longest-common-substring",
    "ex-longest-palindromic-subsequence",
    "ex-count-square-submatrices",
    "ex-wildcard-matching",
    "ex-regex-matching",
    "ex-russian-doll-envelopes",
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
  if (rows &lt; 1 || cols &lt; 1) return 0;
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1)); <span class="c">// first row/col = 1 way</span>

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; <span class="c">// from above, or from the left</span>
    }
  }
  return dp[rows - 1][cols - 1];
}</code></pre>
<h4>Dry run: uniquePaths(3, 4) — the grid in the figure above</h4>
<table>
  <tr><th>Cell</th><th>Computation</th><th>Value</th></tr>
  <tr><td>dp[1][1]</td><td>dp[0][1] + dp[1][0] = 1 + 1</td><td>2</td></tr>
  <tr><td>dp[1][2]</td><td>dp[0][2] + dp[1][1] = 1 + 2</td><td>3</td></tr>
  <tr><td>dp[1][3]</td><td>dp[0][3] + dp[1][2] = 1 + 3</td><td>4</td></tr>
  <tr><td>dp[2][1]</td><td>dp[1][1] + dp[2][0] = 2 + 1</td><td>3</td></tr>
  <tr><td>dp[2][2]</td><td>dp[1][2] + dp[2][1] = 3 + 3</td><td>6</td></tr>
  <tr><td>dp[2][3]</td><td>dp[1][3] + dp[2][2] = 4 + 6</td><td>10</td></tr>
</table>
<p class="sub">
  Row 0 and column 0 never get computed — they start (and stay) at 1,
  because there's only one way to reach any cell along the top or left
  edge: keep going the one direction that stays on the grid. The answer,
  dp[2][3] = 10, matches the bottom-right cell in the figure.
</p>

<h3>Obstacles and costs: Unique Paths II and Minimum Path Sum</h3>
<p>
  Two small changes to the grid recurrence cover most of the grid questions
  you will be asked. Put walls in some cells, and the first row and column
  stop being all 1s. Put a cost on every cell, and the question changes from
  "how many routes" to "which route is cheapest". The recurrence still looks
  at the same two neighbours, above and left. What changes is how it combines
  them and what the edges hold.
</p>

<h4>Unique Paths II: some cells are walls</h4>
<p>
  <code>dp[r][c]</code> is still the number of routes from the start that end
  on <code>(r, c)</code>. A wall has no routes ending on it, because nobody
  can stand there, so it holds 0. And because every route into a cell comes
  through the cell above or the cell to the left, that 0 flows forward by
  itself: the cells to its right and below simply get nothing from it.
</p>
<p>
  The version at the top of this chapter filled the first row and column with
  1s, which is only right when nothing blocks them. With a wall in the first
  row, every cell to the right of it is unreachable, and those 1s would lie.
  So give every cell the same rule, count a neighbour that is off the grid as
  0 routes, and seed only the start.
</p>
<pre><code>function uniquePathsWithObstacles(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () =&gt; new Array(cols).fill(0));

  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      if (grid[r][c] === 1) continue; <span class="c">// a blocked cell stays 0: no path passes through it</span>
      if (r === 0 &amp;&amp; c === 0) { dp[r][c] = 1; continue; } <span class="c">// standing on the start is one way</span>
      const fromAbove = r &gt; 0 ? dp[r - 1][c] : 0;
      const fromLeft = c &gt; 0 ? dp[r][c - 1] : 0;
      dp[r][c] = fromAbove + fromLeft;
    }
  }
  return dp[rows - 1][cols - 1];
}</code></pre>
<h4>Dry run: a 3 by 3 grid with a wall in the middle</h4>
<p class="sub">grid = [[0, 0, 0], [0, 1, 0], [0, 0, 0]], where 1 is a wall</p>
<table>
  <tr><th></th><th>c0</th><th>c1</th><th>c2</th></tr>
  <tr><th>r0</th><td>1</td><td>1</td><td>1</td></tr>
  <tr><th>r1</th><td>1</td><td>0</td><td>1</td></tr>
  <tr><th>r2</th><td>1</td><td>1</td><td>2</td></tr>
</table>
<p class="sub">
  The top row and left column are all 1s here because nothing blocks them.
  The centre is a wall and stays 0. The cell right of the centre is
  <code>dp[0][2] + dp[1][1] = 1 + 0 = 1</code>, the cell below it is
  <code>dp[1][1] + dp[2][0] = 0 + 1 = 1</code>, and the corner adds the two:
  <code>dp[1][2] + dp[2][1] = 1 + 1 = 2</code>. Both routes go around the
  wall, one over the top and one underneath.
</p>
<div class="warn">
  <span class="ttl">⚠ A wall on the start or the goal, and counts that outgrow a number</span>
  If the start is a wall, the <code>continue</code> runs before the start is
  seeded, nothing is ever added, and the answer is 0, which is correct. The
  same happens when the goal is a wall. Separately, route counts grow
  combinatorially: on an open 30 by 30 grid the exact count is
  <code>30067266499541040</code>, which is more than
  <code>Number.MAX_SAFE_INTEGER</code>, so double arithmetic would silently
  round it. Problems either promise the answer fits or ask for it modulo some
  number. Ask which before you code.
</div>

<h4>Minimum Path Sum: every cell has a cost</h4>
<p>
  Now each cell has a cost and you want the cheapest right-and-down route from
  the top-left to the bottom-right. Let <code>dp[r][c]</code> be the cheapest
  cost of a route from the start to <code>(r, c)</code>, including the cost of
  <code>(r, c)</code> itself. The last step of any route into that cell came
  from above or from the left, so the cheapest route is the cell's own cost
  plus the cheaper of the two arrivals.
</p>
<pre><code>function minPathSum(grid) {
  const rows = grid.length, cols = grid[0].length;
  const dp = Array.from({ length: rows }, () =&gt; new Array(cols).fill(0));

  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      if (r === 0 &amp;&amp; c === 0) { dp[r][c] = grid[0][0]; continue; }
      const fromAbove = r &gt; 0 ? dp[r - 1][c] : Infinity; <span class="c">// off the grid counts as unreachable</span>
      const fromLeft = c &gt; 0 ? dp[r][c - 1] : Infinity;
      dp[r][c] = grid[r][c] + Math.min(fromAbove, fromLeft);
    }
  }
  return dp[rows - 1][cols - 1];
}</code></pre>
<p>
  The off-grid neighbours are <code>Infinity</code> rather than 0 on purpose.
  A top-row cell has no cell above it, and 0 would pretend that a free route
  arrives from there, so the minimum would pick it every time and quietly drop
  the cost of everything to its left. <code>Infinity</code> can never be the
  minimum, which is the right way to say "that arrival does not exist".
</p>
<h4>Dry run: [[1, 3, 1], [1, 5, 1], [4, 2, 1]]</h4>
<table>
  <tr><th></th><th>c0</th><th>c1</th><th>c2</th></tr>
  <tr><th>r0</th><td>1</td><td>4</td><td>5</td></tr>
  <tr><th>r1</th><td>2</td><td>7</td><td>6</td></tr>
  <tr><th>r2</th><td>6</td><td>8</td><td>7</td></tr>
</table>
<p class="sub">
  The answer, <code>dp[2][2] = 7</code>, is the route right, right, down, down,
  which costs 1 + 3 + 1 + 1 + 1. The 5 in the middle is the expensive cell and
  the table routes around it: <code>dp[1][1] = 5 + min(4, 2) = 7</code>, and
  neither neighbour that could use it prefers it. Each cell costs O(1), so the whole table is
  O(rows × cols) time and space. Row <code>r</code> reads only row
  <code>r - 1</code>, so keeping one row (or writing over a copy of the grid)
  takes the space to O(cols), at the price of losing the table you would need
  to rebuild the route.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Only right and down moves means
  every route into a cell arrives from exactly two places, so the cheapest
  route to a cell is its own cost plus the cheaper of those two. Moves in
  four directions would break that, because a cheaper route could loop up and
  around, and then it is a shortest-path problem instead."
</div>

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

<h3>Getting the answer back out, not only its length</h3>
<p>
  The usual follow-up to "return the length" is "now return the actual
  subsequence", or "list the edits", or "which items did you pack". You do not
  need a second algorithm. Every cell's value was chosen from specific
  neighbours, and that choice is still visible in the numbers. Start at the
  answer cell and ask, at each cell, "which neighbour explains this value?".
  Step to it, note what that step meant, and repeat until you reach the
  padding. You collect the choices from the end to the start, so reverse them
  at the end.
</p>

<h4>The LCS string</h4>
<p>
  When the two characters match, the cell was defined as the diagonal plus
  one, so stepping diagonally is always a valid explanation and that character
  belongs to the answer. When they do not match, the cell was the larger of
  above and left, so step toward the larger one. The character you stepped
  past is not used.
</p>
<pre><code>function lcsString(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =&gt; new Array(b.length + 1).fill(0));
  for (let i = 1; i &lt;= a.length; i++) {
    for (let j = 1; j &lt;= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1] + 1
        : Math.max(dp[i - 1][j], dp[i][j - 1]);
    }
  }

  const picked = [];
  let i = a.length, j = b.length;
  while (i &gt; 0 &amp;&amp; j &gt; 0) { <span class="c">// walk from the answer cell back toward the padding</span>
    if (a[i - 1] === b[j - 1]) {
      picked.push(a[i - 1]); <span class="c">// a match is part of the answer: step diagonally</span>
      i--; j--;
    } else if (dp[i - 1][j] &gt;= dp[i][j - 1]) {
      i--; <span class="c">// the value came from above, so a[i - 1] is not used</span>
    } else {
      j--; <span class="c">// the value came from the left, so b[j - 1] is not used</span>
    }
  }
  return picked.reverse().join(""); <span class="c">// collected back to front</span>
}</code></pre>
<h4>Dry run: lcsString("ABCB", "BDCAB")</h4>
<p class="sub">The table first, with the rows labelled by a and the columns by b.</p>
<table>
  <tr><th></th><th>∅</th><th>B</th><th>D</th><th>C</th><th>A</th><th>B</th></tr>
  <tr><th>∅</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>A</th><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
  <tr><th>B</th><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>2</td></tr>
  <tr><th>C</th><td>0</td><td>1</td><td>1</td><td>2</td><td>2</td><td>2</td></tr>
  <tr><th>B</th><td>0</td><td>1</td><td>1</td><td>2</td><td>2</td><td>3</td></tr>
</table>
<table>
  <tr><th>Cell</th><th>Characters</th><th>What explains the value</th><th>Picked so far</th></tr>
  <tr><td>(4, 5) = 3</td><td>a[3] = B, b[4] = B</td><td>they match: step diagonally</td><td>B</td></tr>
  <tr><td>(3, 4) = 2</td><td>a[2] = C, b[3] = A</td><td>they differ; above is 1, left is 2: step left</td><td>B</td></tr>
  <tr><td>(3, 3) = 2</td><td>a[2] = C, b[2] = C</td><td>they match: step diagonally</td><td>B, C</td></tr>
  <tr><td>(2, 2) = 1</td><td>a[1] = B, b[1] = D</td><td>they differ; above is 0, left is 1: step left</td><td>B, C</td></tr>
  <tr><td>(2, 1) = 1</td><td>a[1] = B, b[0] = B</td><td>they match: step diagonally</td><td>B, C, B</td></tr>
</table>
<p class="sub">
  The walk ends at (1, 0), which sits on the padding column, so the loop stops. The picks were collected
  back to front, B then C then B, and the reversal gives <code>"BCB"</code>,
  which has the length 3 that the corner cell promised. When the two neighbours
  tie, either step is valid; <code>&gt;=</code> prefers going up, and the other
  choice would return a different, equally long subsequence on inputs that have
  more than one.
</p>

<h4>The edit script</h4>
<p>
  The same walk works for Edit Distance, with more cases. At a cell, first
  check for a match, because a match was defined as a free diagonal copy. If
  there is no match, compare the cell with each neighbour plus 1 and step to
  one that fits. The step you take is the operation.
</p>
<pre><code>function editScript(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =&gt; new Array(b.length + 1).fill(0));
  for (let i = 0; i &lt;= a.length; i++) dp[i][0] = i;
  for (let j = 0; j &lt;= b.length; j++) dp[0][j] = j;
  for (let i = 1; i &lt;= a.length; i++) {
    for (let j = 1; j &lt;= b.length; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }

  const steps = [];
  let i = a.length, j = b.length;
  while (i &gt; 0 || j &gt; 0) {
    if (i &gt; 0 &amp;&amp; j &gt; 0 &amp;&amp; a[i - 1] === b[j - 1]) {
      steps.push("keep " + a[i - 1]);
      i--; j--;
    } else if (i &gt; 0 &amp;&amp; j &gt; 0 &amp;&amp; dp[i][j] === dp[i - 1][j - 1] + 1) {
      steps.push("replace " + a[i - 1] + " with " + b[j - 1]);
      i--; j--;
    } else if (i &gt; 0 &amp;&amp; dp[i][j] === dp[i - 1][j] + 1) {
      steps.push("delete " + a[i - 1]);
      i--;
    } else {
      steps.push("insert " + b[j - 1]); <span class="c">// only the left neighbour can explain the cell now</span>
      j--;
    }
  }
  return steps.reverse();
}</code></pre>
<h4>Dry run: editScript("horse", "ros")</h4>
<table>
  <tr><th></th><th>∅</th><th>r</th><th>o</th><th>s</th></tr>
  <tr><th>∅</th><td>0</td><td>1</td><td>2</td><td>3</td></tr>
  <tr><th>h</th><td>1</td><td>1</td><td>2</td><td>3</td></tr>
  <tr><th>o</th><td>2</td><td>2</td><td>1</td><td>2</td></tr>
  <tr><th>r</th><td>3</td><td>2</td><td>2</td><td>2</td></tr>
  <tr><th>s</th><td>4</td><td>3</td><td>3</td><td>2</td></tr>
  <tr><th>e</th><td>5</td><td>4</td><td>4</td><td>3</td></tr>
</table>
<p class="sub">
  From the corner <code>dp[5][3] = 3</code>: <code>e</code> and <code>s</code>
  differ, and the only neighbour that explains the 3 is the cell above,
  <code>dp[4][3] = 2</code>, plus 1, so the step is "delete
  <code>e</code>". Then <code>s</code> matches <code>s</code>: keep. Then
  <code>r</code> against <code>o</code>: the cell above, <code>dp[2][2] =
  1</code>, plus 1 gives the current 2, so delete <code>r</code>. Then
  <code>o</code> matches: keep. The last cell, <code>dp[1][1] = 1</code>, is
  the diagonal 0 plus 1: replace <code>h</code> with <code>r</code>. Reversed,
  the script is: replace h with r, keep o, delete r, keep s, delete e, and
  three of those five steps cost something, which is the 3 in the corner.
  When two operations would both explain a cell, the order of the
  <code>if</code> checks decides which script you get; any of them is
  optimal.
</p>

<h4>The packed items in a knapsack</h4>
<p>
  For the knapsack table, ask at each row whether the value changed when that
  item arrived. If <code>dp[i][w]</code> equals <code>dp[i - 1][w]</code>, item
  <code>i</code> was not needed to reach it, so skip it. If it differs, the
  item must have been taken: record it and move to the capacity that was left
  before it, <code>w - weights[i - 1]</code>.
</p>
<pre><code>function knapsackItems(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () =&gt; new Array(capacity + 1).fill(0));
  for (let i = 1; i &lt;= n; i++) {
    for (let w = 0; w &lt;= capacity; w++) {
      dp[i][w] = dp[i - 1][w];
      if (weights[i - 1] &lt;= w) {
        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);
      }
    }
  }

  const taken = [];
  let w = capacity;
  for (let i = n; i &gt;= 1; i--) {
    if (dp[i][w] !== dp[i - 1][w]) { <span class="c">// the value changed when item i arrived, so it was taken</span>
      taken.push(i - 1);
      w -= weights[i - 1];
    }
  }
  return { best: dp[n][capacity], items: taken.reverse() };
}</code></pre>
<h4>Dry run: weights [1, 3, 4, 5], values [1, 4, 5, 7], capacity 7</h4>
<table>
  <tr><th></th><th>w=0</th><th>w=1</th><th>w=2</th><th>w=3</th><th>w=4</th><th>w=5</th><th>w=6</th><th>w=7</th></tr>
  <tr><th>no items</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>item 0 (w1, v1)</th><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><th>item 1 (w3, v4)</th><td>0</td><td>1</td><td>1</td><td>4</td><td>5</td><td>5</td><td>5</td><td>5</td></tr>
  <tr><th>item 2 (w4, v5)</th><td>0</td><td>1</td><td>1</td><td>4</td><td>5</td><td>6</td><td>6</td><td>9</td></tr>
  <tr><th>item 3 (w5, v7)</th><td>0</td><td>1</td><td>1</td><td>4</td><td>5</td><td>7</td><td>8</td><td>9</td></tr>
</table>
<p class="sub">
  Start at <code>dp[4][7] = 9</code>. The row above is also 9, so the fourth
  item is skipped. At row 3, <code>dp[3][7] = 9</code> but the row above has
  5, so item index 2 (weight 4, value 5) is taken and the capacity drops to 3.
  At row 2, <code>dp[2][3] = 4</code> against 1 above, so item index 1 (weight
  3, value 4) is taken and the capacity drops to 0. Row 1 is 0 against 0, so
  the first item is skipped. The result is items 1 and 2, weight 3 + 4 = 7 and
  value 4 + 5 = 9, matching the corner. If two packings tie for the best value,
  this walk returns one of them.
</p>
<div class="warn">
  <span class="ttl">⚠ Reconstruction needs the table you may have thrown away</span>
  The two-row and one-row versions in the space section below keep only the last row
  or two, and the walk back needs the older rows. If a question asks for the
  actual subsequence, edits or items, keep the full table (and say that is why),
  or record a small choice table beside it. Linear-space reconstruction
  exists, but it is rarely what an interview wants. Also watch the loop
  condition: LCS can stop as soon as either index reaches 0, but Edit Distance
  must continue while <em>either</em> is above 0, because the leftover
  characters are pure inserts or deletes.
</div>

<h3>Longest common substring: the table that resets to zero</h3>
<p>
  A substring cannot skip characters, so the LCS table gives the wrong answer
  here. "ABXC" and "ABYC" have a longest common subsequence of length 3
  ("ABC") but a longest common substring of length 2 ("AB"). The definition has
  to change. Let <code>dp[i][j]</code> be the length of the common run that
  ends <em>exactly</em> at <code>a[i - 1]</code> and <code>b[j - 1]</code>. If
  those two characters match, the run that ended at the previous pair grows by
  one: <code>dp[i - 1][j - 1] + 1</code>. If they differ, there is no run
  ending here, so the cell is 0, not the larger of two neighbours.
</p>
<pre><code>function longestCommonSubstring(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () =&gt; new Array(b.length + 1).fill(0));
  let bestLen = 0, bestEnd = 0; <span class="c">// bestEnd is an index into a, one past the last character</span>

  for (let i = 1; i &lt;= a.length; i++) {
    for (let j = 1; j &lt;= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1; <span class="c">// the run ending at both previous characters grows by one</span>
        if (dp[i][j] &gt; bestLen) { bestLen = dp[i][j]; bestEnd = i; }
      } <span class="c">// a mismatch leaves 0: a substring cannot skip a character</span>
    }
  }
  return a.slice(bestEnd - bestLen, bestEnd);
}</code></pre>
<h4>Dry run: longestCommonSubstring("abcde", "zbcdf")</h4>
<table>
  <tr><th></th><th>∅</th><th>z</th><th>b</th><th>c</th><th>d</th><th>f</th></tr>
  <tr><th>∅</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>a</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>b</th><td>0</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>c</th><td>0</td><td>0</td><td>0</td><td>2</td><td>0</td><td>0</td></tr>
  <tr><th>d</th><td>0</td><td>0</td><td>0</td><td>0</td><td>3</td><td>0</td></tr>
  <tr><th>e</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
</table>
<p class="sub">
  The run grows along the diagonal: <code>b</code> gives 1, <code>c</code>
  gives 2, <code>d</code> gives 3, and then <code>e</code> against
  <code>f</code> breaks it back to 0. The answer sits in the middle of the
  table, not in the corner. The corner here is 0, and reading it would be
  wrong, because a run can end anywhere. That is why the code tracks the best
  length and where it ended while it fills the table, and slices the answer
  out of <code>a</code> at the end.
</p>
<table>
  <tr><th></th><th>Longest common subsequence</th><th>Longest common substring</th></tr>
  <tr><td>Cell means</td><td>best length using the first i and j characters</td><td>length of the run ending exactly at i and j</td></tr>
  <tr><td>On a mismatch</td><td>larger of above and left</td><td>0</td></tr>
  <tr><td>Where the answer is</td><td>bottom-right corner</td><td>the largest value anywhere</td></tr>
  <tr><td>Time</td><td>O(m × n)</td><td>O(m × n)</td></tr>
  <tr><td>Space with rolling rows</td><td>O(min(m, n)) for the length</td><td>O(min(m, n)) for the length</td></tr>
</table>
<p class="sub">
  Both tables read only the previous row, so the length alone fits in two
  rows, as in the space section below. For strings long enough that O(m × n)
  is too slow, the faster route is hashing with a binary search on the length,
  which the string algorithms chapter covers.
</p>

<h3>Palindrome DP — a different kind of two-dimensional state</h3>
<p>
  Here both dimensions describe the <em>same</em> string — a start index
  and an end index — rather than two different strings. "Is
  <code>s[i..j]</code> a palindrome?" depends on whether the outer
  characters match <em>and</em> the inside is also a palindrome, which
  means every cell must be filled after <code>dp[i+1][j-1]</code>. Filling by
  increasing substring length does that, and so does filling the rows from
  the bottom up; filling the rows from the top down does not.
</p>
<pre><code><span class="c">// dp[i][j] = true if s[i..j] (inclusive) is a palindrome</span>
function longestPalindromicSubstring(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0, maxLen = 1;

  for (let i = 0; i < n; i++) dp[i][i] = true; <span class="c">// every single character is a palindrome</span>

  <span class="c">// fill by SUBSTRING LENGTH — a length-3 answer needs the length-1 answer inside it already computed (rows bottom-up also works; rows top-down does not)</span>
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
  that's <em>both</em> a higher row index and a lower column index. Filling
  rows top to bottom doesn't guarantee that cell is ready yet, and neither
  does filling columns right to left. Filling by increasing substring length
  guarantees every shorter (already-needed) substring is computed before any
  longer one that depends on it, and filling rows bottom-up (<code>i</code>
  from <code>n-1</code> down to 0, <code>j</code> ascending) does too,
  because row <code>i+1</code> is finished before row <code>i</code> starts.
</div>

<h3>Longest palindromic subsequence: the same interval table, a different rule</h3>
<p>
  The palindrome section above asked a yes-or-no question about every
  substring. Here you may skip characters, and you want the length of the
  longest palindrome you can read off. The state is the same pair of indices,
  <code>dp[i][j]</code> for the part of the string from <code>i</code> to
  <code>j</code>, but the cell now holds a length. Look at the two ends. If
  <code>s[i]</code> and <code>s[j]</code> are equal, both can wrap the best
  palindrome found strictly inside, which adds 2. If they differ, at least one
  of them is unused, so the answer is the better of dropping the left end or
  dropping the right end.
</p>
<pre><code>function longestPalindromeSubseq(s) {
  const n = s.length;
  if (n === 0) return 0;
  const dp = Array.from({ length: n }, () =&gt; new Array(n).fill(0));

  for (let i = n - 1; i &gt;= 0; i--) { <span class="c">// rows bottom-up: row i + 1 is finished before row i</span>
    dp[i][i] = 1;
    for (let j = i + 1; j &lt; n; j++) {
      if (s[i] === s[j]) {
        dp[i][j] = dp[i + 1][j - 1] + 2; <span class="c">// wrap the best palindrome of the inside</span>
      } else {
        dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]); <span class="c">// drop one end</span>
      }
    }
  }
  return dp[0][n - 1];
}</code></pre>
<h4>Dry run: longestPalindromeSubseq("bbbab")</h4>
<table>
  <tr><th></th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>
  <tr><th>0: b</th><td>1</td><td>2</td><td>3</td><td>3</td><td>4</td></tr>
  <tr><th>1: b</th><td>0</td><td>1</td><td>2</td><td>2</td><td>3</td></tr>
  <tr><th>2: b</th><td>0</td><td>0</td><td>1</td><td>1</td><td>3</td></tr>
  <tr><th>3: a</th><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
  <tr><th>4: b</th><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td></tr>
</table>
<p class="sub">
  Only the cells on and above the diagonal mean anything. Row 4 is a single
  character, 1. In row 3, <code>s[3] = a</code> and <code>s[4] = b</code>
  differ, so <code>dp[3][4] = max(dp[4][4], dp[3][3]) = 1</code>. The corner
  works from the ends: <code>s[0] = b</code> and <code>s[4] = b</code> match, so
  <code>dp[0][4] = dp[1][3] + 2 = 2 + 2 = 4</code>, the palindrome
  <code>bbbb</code>. For two neighbours that match, such as
  <code>j = i + 1</code>, the code reads <code>dp[i + 1][j - 1]</code>, which is
  a cell below the diagonal. It was never written, so it still holds 0, and
  0 is exactly the right length for an empty inside.
</p>
<p>
  Two facts help when you are stuck. The length equals the longest common
  subsequence of <code>s</code> and its own reverse, so you can reuse your LCS
  code. And the fewest characters you would have to insert to turn
  <code>s</code> into a palindrome is <code>s.length</code> minus this number,
  because the characters that are not part of the longest palindromic
  subsequence are the ones that need a mirror. As with the palindrome table
  above, the fill order matters: the loop runs <code>i</code> from the bottom
  up, so row <code>i + 1</code> is complete before row <code>i</code> starts.
  Time and space are O(n²), and since row <code>i</code> reads only itself and
  row <code>i + 1</code>, two rows are enough for the length.
</p>

<h3>Counting instead of optimizing: distinct subsequences, interleaving string and target sum</h3>
<p>
  Some questions ask how many ways, or whether it is possible, rather than how
  good. The table is the same, and only the cell's meaning and the operator
  change. When the options at a cell are exclusive and cover everything, the
  number of ways is the <b>sum</b> of the ways under each option, where an
  optimization used <code>Math.max</code>. When the question is a yes or no,
  the sum becomes an OR. The part to get right is the base case: the count for
  the empty case is usually <b>1</b>, not 0, because there is exactly one way
  to build nothing, which is to choose nothing.
</p>

<h4>Distinct Subsequences: how many ways does t appear inside s?</h4>
<p>
  Let <code>dp[i][j]</code> be the number of ways that the first
  <code>j</code> characters of <code>t</code> appear as a subsequence of the
  first <code>i</code> characters of <code>s</code>. Look at the last
  character of that prefix of <code>s</code>. Either it is not used, which
  leaves <code>dp[i - 1][j]</code> ways, or it is used to match
  <code>t[j - 1]</code>, which is only possible when the two are equal and then
  leaves <code>dp[i - 1][j - 1]</code> ways. Every way falls under exactly one
  of those, so you add them. The base is <code>dp[i][0] = 1</code>: the empty
  target appears once in any prefix. <code>dp[0][j]</code> for
  <code>j &gt; 0</code> stays 0, because an empty source cannot spell anything.
</p>
<pre><code>function numDistinct(s, t) {
  const m = s.length, n = t.length;
  const dp = Array.from({ length: m + 1 }, () =&gt; new Array(n + 1).fill(0));
  for (let i = 0; i &lt;= m; i++) dp[i][0] = 1; <span class="c">// the empty target forms one way from any prefix</span>

  for (let i = 1; i &lt;= m; i++) {
    for (let j = 1; j &lt;= n; j++) {
      dp[i][j] = dp[i - 1][j]; <span class="c">// ways that do not use s[i - 1]</span>
      if (s[i - 1] === t[j - 1]) {
        dp[i][j] += dp[i - 1][j - 1]; <span class="c">// plus ways that spend s[i - 1] on t[j - 1]</span>
      }
    }
  }
  return dp[m][n];
}</code></pre>
<h4>Dry run: numDistinct("babgbag", "bag")</h4>
<table>
  <tr><th></th><th>∅</th><th>b</th><th>a</th><th>g</th></tr>
  <tr><th>∅</th><td>1</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>b</th><td>1</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><th>a</th><td>1</td><td>1</td><td>1</td><td>0</td></tr>
  <tr><th>b</th><td>1</td><td>2</td><td>1</td><td>0</td></tr>
  <tr><th>g</th><td>1</td><td>2</td><td>1</td><td>1</td></tr>
  <tr><th>b</th><td>1</td><td>3</td><td>1</td><td>1</td></tr>
  <tr><th>a</th><td>1</td><td>3</td><td>4</td><td>1</td></tr>
  <tr><th>g</th><td>1</td><td>3</td><td>4</td><td>5</td></tr>
</table>
<p class="sub">
  The answer is 5. Read the last column to see why: the first <code>g</code>
  (at index 3) lets <code>"bag"</code> be formed 1 way. The second
  <code>g</code> (index 6) adds the 4 ways to spell <code>"ba"</code> in the six
  characters before it, giving 1 + 4. As index pairs, the five ways are
  (0, 1, 3), (0, 1, 6), (0, 5, 6), (2, 5, 6) and (4, 5, 6). The counts can
  grow past what a double holds exactly, so check whether the problem
  guarantees a small answer or asks for a remainder.
</p>

<h4>Interleaving String: can s3 be woven from s1 and s2?</h4>
<p>
  Here <code>dp[i][j]</code> is true if the first <code>i</code> characters of
  <code>s1</code> and the first <code>j</code> of <code>s2</code> can be woven,
  keeping each string's own order, into the first <code>i + j</code> characters
  of <code>s3</code>. The last of those <code>i + j</code> characters came from
  one of the two strings. If it came from <code>s1</code>, then
  <code>s1[i - 1]</code> must equal it and the smaller state
  <code>(i - 1, j)</code> must be true. If it came from <code>s2</code>, the
  symmetrical test on <code>(i, j - 1)</code> applies. Either is enough, so you
  OR them. Check the lengths first: if <code>s1</code> and <code>s2</code>
  together are not as long as <code>s3</code>, the answer is false at once, and
  without the check the indexing would read past the end of <code>s3</code>.
</p>
<pre><code>function isInterleave(s1, s2, s3) {
  const m = s1.length, n = s2.length;
  if (m + n !== s3.length) return false;
  const dp = Array.from({ length: m + 1 }, () =&gt; new Array(n + 1).fill(false));
  dp[0][0] = true; <span class="c">// zero characters of each build zero characters of s3</span>

  for (let i = 0; i &lt;= m; i++) {
    for (let j = 0; j &lt;= n; j++) {
      if (i === 0 &amp;&amp; j === 0) continue;
      const next = s3[i + j - 1]; <span class="c">// the character of s3 that this cell must place</span>
      const viaS1 = i &gt; 0 &amp;&amp; dp[i - 1][j] &amp;&amp; s1[i - 1] === next;
      const viaS2 = j &gt; 0 &amp;&amp; dp[i][j - 1] &amp;&amp; s2[j - 1] === next;
      dp[i][j] = viaS1 || viaS2;
    }
  }
  return dp[m][n];
}</code></pre>
<h4>Dry run: s1 = "ab", s2 = "ac", s3 = "aacb"</h4>
<table>
  <tr><th></th><th>∅</th><th>a</th><th>c</th></tr>
  <tr><th>∅</th><td>T</td><td>T</td><td>F</td></tr>
  <tr><th>a</th><td>T</td><td>T</td><td>T</td></tr>
  <tr><th>b</th><td>F</td><td>F</td><td>T</td></tr>
</table>
<p class="sub">
  <code>T</code> is true and <code>F</code> is false. The corner is true by the
  route (0,0), (1,0), (1,1), (1,2), (2,2). Reading <code>s3 = a, a, c,
  b</code> along it: <code>a</code> from <code>s1</code>, <code>a</code> from
  <code>s2</code>, <code>c</code> from <code>s2</code>, then <code>b</code>
  from <code>s1</code>. A greedy walk that just matches characters would
  fail on <code>s3 = "acab"</code>: at the start both strings offer an
  <code>a</code>, and committing to <code>s1</code> hits a dead end, while
  taking it from <code>s2</code> works. The table keeps both options alive,
  which is why this needs DP and not two pointers.
</p>

<h4>Target Sum: reduce it to counting subsets</h4>
<p>
  Put a plus or a minus in front of every number so that the total equals
  <code>target</code>, and count the ways. Split the numbers into the group
  that gets a plus, P, and the group that gets a minus, N. Then
  <code>sum(P) - sum(N) = target</code>, and
  <code>sum(P) + sum(N) = total</code>. Add the two equations and
  <code>sum(P) = (total + target) / 2</code>. So the question becomes: in how
  many ways can a subset of the numbers add up to exactly that goal? That is a
  knapsack-shaped table where the "value" is a count. If
  <code>total + target</code> is odd, or <code>|target|</code> is larger than
  <code>total</code>, the answer is 0 before any table is built.
</p>
<pre><code>function findTargetSumWays(nums, target) {
  const total = nums.reduce((sum, x) =&gt; sum + x, 0);
  if (Math.abs(target) &gt; total || (total + target) % 2 !== 0) return 0;
  const goal = (total + target) / 2; <span class="c">// the sum the "plus" group must reach</span>

  const n = nums.length;
  const dp = Array.from({ length: n + 1 }, () =&gt; new Array(goal + 1).fill(0));
  dp[0][0] = 1; <span class="c">// no numbers and sum 0: one way, the empty group</span>

  for (let i = 1; i &lt;= n; i++) {
    for (let w = 0; w &lt;= goal; w++) {
      dp[i][w] = dp[i - 1][w]; <span class="c">// nums[i - 1] goes in the minus group</span>
      if (nums[i - 1] &lt;= w) {
        dp[i][w] += dp[i - 1][w - nums[i - 1]]; <span class="c">// or in the plus group</span>
      }
    }
  }
  return dp[n][goal];
}</code></pre>
<h4>Dry run: nums = [1, 1, 1, 1, 1], target = 3</h4>
<p class="sub">total = 5, so the plus group must sum to goal = (5 + 3) / 2 = 4</p>
<table>
  <tr><th></th><th>sum 0</th><th>sum 1</th><th>sum 2</th><th>sum 3</th><th>sum 4</th></tr>
  <tr><th>no numbers</th><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>after 1 number</th><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>after 2</th><td>1</td><td>2</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><th>after 3</th><td>1</td><td>3</td><td>3</td><td>1</td><td>0</td></tr>
  <tr><th>after 4</th><td>1</td><td>4</td><td>6</td><td>4</td><td>1</td></tr>
  <tr><th>after 5</th><td>1</td><td>5</td><td>10</td><td>10</td><td>5</td></tr>
</table>
<p class="sub">
  Row <code>i</code> counts the subsets of the first <code>i</code> ones that
  sum to each <code>w</code>, which is a binomial coefficient. The cell
  <code>dp[5][4] = 5</code> is the number of ways to choose four of the five
  ones to be the plus group, so five different sign patterns reach 3. Notice
  that <code>dp[i][0]</code> is not always 1. When the input contains a 0,
  that number can go in either group without changing any sum, so the table
  doubles. For <code>[0, 0, 1]</code> and a target of 1 the column for
  <code>w = 0</code> reads 1, 2, 4, 4 and the answer is 4. Setting
  <code>dp[i][0] = 1</code> by habit would give the wrong answer here, and the
  code avoids it by starting <code>w</code> at 0 and applying the same rule
  to every cell.
</p>
<p>
  This table keeps a row per number so you can see what each cell reads. Each
  row reads only the row above, and the one-row version, with the capacity loop
  running downward so a number is not used twice, is the subject of
  <a href="/dsa/dsa-dp-state-machines">DP state machines and the knapsack family</a>.
  Time and space here are O(n × goal), where <code>goal</code> is a
  <em>value</em> in the input rather than a count of items. That is a
  pseudo-polynomial cost, and it is only small when the numbers are.
</p>

<h3>Maximal Square: three neighbours and a minimum</h3>
<p>
  Given a grid of <code>"1"</code> and <code>"0"</code> characters, find the
  area of the largest square made only of 1s. Checking every possible square
  from scratch repeats a lot of work, because a big square is made of smaller
  squares. So let <code>dp[r][c]</code> be the side of the largest all-1 square
  whose <b>bottom-right corner</b> is <code>(r, c)</code>. A cell holding
  <code>"0"</code> has 0. For a cell holding <code>"1"</code>, the claim is
</p>
<p class="sub"><code>dp[r][c] = 1 + min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1])</code></p>
<p>
  Why the smallest of the three? Suppose a square of side <code>k</code> ends
  at <code>(r, c)</code>. Slide its frame one step up, one step left, and one
  step up-left: each of those three shifted squares has side
  <code>k - 1</code> and is all 1s, so each neighbour is at least
  <code>k - 1</code>, and the minimum of the three is at least
  <code>k - 1</code>. In the other direction, let <code>m</code> be the
  minimum of the three. The square of side <code>m + 1</code> ending at
  <code>(r, c)</code> is covered by the <code>m</code>-sided squares ending at
  the cell above, the cell to the left and the cell up-left, plus the cell
  itself, and all of those are 1s. So <code>1 + m</code> is achievable, and
  nothing larger is. One neighbour with a short square, or a stray 0 in one of
  the three corners, caps the answer.
</p>
<pre><code>function maximalSquare(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const dp = Array.from({ length: rows + 1 }, () =&gt; new Array(cols + 1).fill(0)); <span class="c">// padded row and column of 0</span>
  let side = 0;

  for (let r = 1; r &lt;= rows; r++) {
    for (let c = 1; c &lt;= cols; c++) {
      if (matrix[r - 1][c - 1] === "1") { <span class="c">// the cells are the strings "1" and "0"</span>
        dp[r][c] = 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);
        side = Math.max(side, dp[r][c]);
      }
    }
  }
  return side * side;
}</code></pre>
<h4>Dry run on a 4 by 5 grid</h4>
<p class="sub">
  rows: "10100", "10111", "11111", "10010". The table has a padding row and
  column of 0, so the first printed row and column are the padding.
</p>
<table>
  <tr><th></th><th>pad</th><th>c1</th><th>c2</th><th>c3</th><th>c4</th><th>c5</th></tr>
  <tr><th>pad</th><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><th>row 1</th><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><th>row 2</th><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><th>row 3</th><td>0</td><td>1</td><td>1</td><td>1</td><td>2</td><td>2</td></tr>
  <tr><th>row 4</th><td>0</td><td>1</td><td>0</td><td>0</td><td>1</td><td>0</td></tr>
</table>
<p class="sub">
  The largest value is 2, so the answer is 2 × 2 = 4. It first appears at
  <code>dp[3][4]</code>: the cell is a 1, and the cells above, to the left
  and up-left are 1, 1 and 1, so <code>1 + min(1, 1, 1) = 2</code>. The cap
  shows at <code>dp[3][2]</code>: that cell is a 1 and its left and up-left
  neighbours are 1, but the cell directly above it is a 0, so the result is
  <code>1 + min(0, 1, 1) = 1</code> and no larger square can end there.
</p>
<div class="warn">
  <span class="ttl">⚠ The cells are strings, and the answer is an area</span>
  The input holds the characters <code>"1"</code> and <code>"0"</code>. The
  string <code>"0"</code> is truthy in JavaScript, so
  <code>if (matrix[r][c])</code> is true for every cell and the table fills
  with garbage. Compare with <code>=== "1"</code>. And the table tracks the
  side, so the function must return <code>side * side</code>, not the side.
  Each cell does O(1) work, so time is O(rows × cols); row <code>r</code> reads
  only row <code>r - 1</code>, so one row plus the saved diagonal value is
  enough when you only need the number. A related question, counting all
  all-1 square submatrices, is the <em>sum</em> of this table, because
  <code>dp[r][c]</code> is also the number of squares that end at
  <code>(r, c)</code>.
</div>

<h3>Pattern matching: wildcards and regular expressions</h3>
<p>
  Does the whole string <code>s</code> match the pattern <code>p</code>? A
  prefix of the string and a prefix of the pattern are two independent
  positions, so this is a two-string table again. Let <code>dp[i][j]</code> be
  true when the first <code>i</code> characters of <code>s</code> match the
  first <code>j</code> characters of <code>p</code>. Two small pattern
  languages are asked about, and they differ in a way that matters.
</p>
<ul>
  <li><b>Wildcard:</b> <code>?</code> matches any single character, and <code>*</code> matches any sequence, including an empty one. The star stands on its own.</li>
  <li><b>Regular-expression subset:</b> <code>.</code> matches any single character, and <code>x*</code> means zero or more copies of the <em>preceding</em> element <code>x</code>. The star only means something together with what is in front of it.</li>
</ul>

<h4>Wildcard: the star stands alone</h4>
<p>
  An ordinary character or a <code>?</code> uses up one character of each side,
  so <code>dp[i][j]</code> needs <code>dp[i - 1][j - 1]</code> to be true and
  the two characters to agree. A <code>*</code> has two options. It matches
  nothing, which leaves <code>dp[i][j - 1]</code>, or it swallows
  <code>s[i - 1]</code> and stays available to swallow more, which leaves
  <code>dp[i - 1][j]</code>. The base row follows: an empty string matches a
  pattern prefix only if that prefix is all stars.
</p>
<pre><code>function isMatchWildcard(s, p) {
  const m = s.length, n = p.length;
  const dp = Array.from({ length: m + 1 }, () =&gt; new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 1; j &lt;= n; j++) dp[0][j] = dp[0][j - 1] &amp;&amp; p[j - 1] === "*"; <span class="c">// only stars match nothing</span>

  for (let i = 1; i &lt;= m; i++) {
    for (let j = 1; j &lt;= n; j++) {
      if (p[j - 1] === "*") {
        dp[i][j] = dp[i][j - 1] || dp[i - 1][j]; <span class="c">// the star matches empty, or swallows s[i - 1] and stays</span>
      } else {
        dp[i][j] = (p[j - 1] === "?" || p[j - 1] === s[i - 1]) &amp;&amp; dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
}</code></pre>
<h4>Dry run: isMatchWildcard("ab", "*b")</h4>
<table>
  <tr><th></th><th>∅</th><th>*</th><th>b</th></tr>
  <tr><th>∅</th><td>T</td><td>T</td><td>F</td></tr>
  <tr><th>a</th><td>F</td><td>T</td><td>F</td></tr>
  <tr><th>b</th><td>F</td><td>T</td><td>T</td></tr>
</table>
<p class="sub">
  The star in column 1 matches the empty string (<code>dp[0][1]</code> is
  true), and it stays true after swallowing <code>a</code> and then
  <code>b</code>, which is the whole of column 1. Column 2 is the
  <code>b</code>: only the last row can use it, because
  <code>b</code> matches <code>s[1]</code> and <code>dp[1][1]</code>, the
  string <code>"a"</code> against <code>"*"</code>, is true. So the corner is
  true.
</p>

<h4>Regular expression: the star belongs to the character before it</h4>
<p>
  Now <code>x*</code> is one unit, and the table has to treat it as a unit. At a
  star, look two columns back for the first option: <code>dp[i][j - 2]</code>
  means "use zero copies, as if the pair were not in the pattern". The second
  option is that <code>x</code> matches <code>s[i - 1]</code> and the pair stays
  to absorb possibly more, which leaves <code>dp[i - 1][j]</code>. Anything else
  is the plain rule from before. The base row changes too, because
  <code>a*b*</code> can match the empty string: <code>dp[0][j]</code> for a star
  is <code>dp[0][j - 2]</code>.
</p>
<pre><code>function isMatch(s, p) {
  const m = s.length, n = p.length;
  const dp = Array.from({ length: m + 1 }, () =&gt; new Array(n + 1).fill(false));
  dp[0][0] = true;
  for (let j = 2; j &lt;= n; j++) {
    if (p[j - 1] === "*") dp[0][j] = dp[0][j - 2]; <span class="c">// "a*b*" can match the empty string</span>
  }

  const same = (ch, pc) =&gt; pc === "." || pc === ch;
  for (let i = 1; i &lt;= m; i++) {
    for (let j = 1; j &lt;= n; j++) {
      if (p[j - 1] === "*") {
        const zeroCopies = dp[i][j - 2]; <span class="c">// drop the "x*" pair altogether</span>
        const oneMore = same(s[i - 1], p[j - 2]) &amp;&amp; dp[i - 1][j]; <span class="c">// "x*" absorbs s[i - 1] and may absorb more</span>
        dp[i][j] = zeroCopies || oneMore;
      } else {
        dp[i][j] = same(s[i - 1], p[j - 1]) &amp;&amp; dp[i - 1][j - 1];
      }
    }
  }
  return dp[m][n];
}</code></pre>
<h4>Dry run: isMatch("aab", "a*b")</h4>
<table>
  <tr><th></th><th>∅</th><th>a</th><th>*</th><th>b</th></tr>
  <tr><th>∅</th><td>T</td><td>F</td><td>T</td><td>F</td></tr>
  <tr><th>a</th><td>F</td><td>T</td><td>T</td><td>F</td></tr>
  <tr><th>a</th><td>F</td><td>F</td><td>T</td><td>F</td></tr>
  <tr><th>b</th><td>F</td><td>F</td><td>F</td><td>T</td></tr>
</table>
<p class="sub">
  <code>dp[1][2]</code>: the star has already matched one <code>a</code>,
  because <code>a</code> matches <code>s[0]</code> and
  <code>dp[0][2]</code>, the empty string against <code>"a*"</code>, is true.
  <code>dp[2][2]</code> then reuses that: the same star takes the second
  <code>a</code> from <code>dp[1][2]</code>. The final <code>b</code> is an
  ordinary character that needs <code>dp[2][2]</code>, which is true, and
  <code>s[2] = b</code> equal to <code>p[2] = b</code>, so the corner is true.
</p>
<table>
  <tr><th></th><th>Wildcard</th><th>Regular-expression subset</th></tr>
  <tr><td>What a star means</td><td>any sequence, on its own</td><td>repeat the previous element</td></tr>
  <tr><td>Star, "match nothing"</td><td><code>dp[i][j - 1]</code></td><td><code>dp[i][j - 2]</code>, dropping the pair</td></tr>
  <tr><td>Star, "take one more"</td><td><code>dp[i - 1][j]</code>, always allowed</td><td><code>dp[i - 1][j]</code>, only if the element matches</td></tr>
  <tr><td>Empty string against a prefix</td><td>true if the prefix is all stars</td><td>true if the prefix is stars paired with elements, like <code>a*b*</code></td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Why a table and not a simple recursion</span>
  Written as plain recursion, every star branches into "stop here" and "take
  one more", and the same <code>(i, j)</code> pair is reached again and again
  through different branches, which can cost time that grows exponentially in the
  worst case. The table has only (m + 1) × (n + 1) cells and each costs O(1),
  so the time is O(m × n). In the regular-expression version the code assumes
  a well-formed pattern, with no star at the very start and no two stars in a
  row; if you are not told that, say you are assuming it, because
  <code>p[j - 2]</code> would not exist for a leading star.
</div>

<h3>Russian Doll Envelopes: when sorting removes a dimension</h3>
<p>
  An envelope fits inside another if both its width and its height are
  strictly smaller. Given a list of <code>[width, height]</code> pairs, find the
  longest chain of nesting envelopes. The first idea is a table over pairs of
  envelopes: sort them, let <code>best[i]</code> be the longest chain ending at
  envelope <code>i</code>, and compare it against every earlier one. That is
  O(n²) comparisons, too slow when n is in the tens of thousands, and no
  grid is involved at all. The "2D" is in the problem, not in the table.
</p>
<p>
  The way out is to sort by width and leave only one dimension to worry about.
  After sorting by width ascending, any chain is a subsequence of the sorted
  list whose widths increase, so what remains is to make the <em>heights</em>
  strictly increase: the longest increasing subsequence of the heights. There
  is one trap. Two envelopes with the same width must never both be in a chain,
  but nothing in the sorted order stops an increasing run of heights from
  using both. The fix is to sort <b>ties by height descending</b>. Then
  envelopes of one width appear tallest first, so no increasing run can pick
  two of them.
</p>
<p>
  For the increasing subsequence use the tails array. Let
  <code>tails[k]</code> be the smallest height that can end a chain of
  <code>k + 1</code> envelopes. The array is strictly increasing, so for each
  new height you binary search for the first tail that is greater than or equal
  to it. If there is none, the height extends the longest chain, so append it;
  otherwise it replaces that tail, because a smaller tail is never worse for
  extending later. The final length of <code>tails</code> is the answer.
</p>
<pre><code>function maxEnvelopes(envelopes) {
  const sorted = [...envelopes].sort((a, b) =&gt; a[0] - b[0] || b[1] - a[1]); <span class="c">// width up, then height DOWN</span>
  const tails = []; <span class="c">// tails[k] = smallest height that ends a chain of k + 1 envelopes</span>

  for (const [, height] of sorted) {
    let lo = 0, hi = tails.length;
    while (lo &lt; hi) { <span class="c">// first index whose tail is &gt;= height</span>
      const mid = (lo + hi) &gt;&gt; 1;
      if (tails[mid] &lt; height) lo = mid + 1;
      else hi = mid;
    }
    tails[lo] = height; <span class="c">// extend the longest chain, or lower an existing tail</span>
  }
  return tails.length;
}</code></pre>
<h4>Dry run: [[5, 4], [6, 4], [6, 7], [2, 3]]</h4>
<p class="sub">
  Sorted by width ascending and height descending on ties:
  [2, 3], [5, 4], [6, 7], [6, 4]. Only the heights matter now: 3, 4, 7, 4.
</p>
<table>
  <tr><th>Height</th><th>First tail &gt;= height</th><th>Action</th><th>tails</th></tr>
  <tr><td>3</td><td>none</td><td>append</td><td>[3]</td></tr>
  <tr><td>4</td><td>none</td><td>append</td><td>[3, 4]</td></tr>
  <tr><td>7</td><td>none</td><td>append</td><td>[3, 4, 7]</td></tr>
  <tr><td>4</td><td>index 1, which is 4</td><td>replace it with 4, no change</td><td>[3, 4, 7]</td></tr>
</table>
<p class="sub">
  The answer is 3: [2, 3], then [5, 4], then [6, 7]. The last 4 belongs to
  the second envelope of width 6, and it lands on the existing 4 rather than
  extending anything, so the two width-6 envelopes did not both enter a chain.
  Time is O(n log n) for the sort plus O(n log n) for the n binary searches, and
  the space is O(n). The tails array is not itself a valid chain, only a
  summary of the best tails.
</p>
<div class="warn">
  <span class="ttl">⚠ The three details that break it</span>
  Sort ties by height descending: with ascending ties, the input
  <code>[[1, 1], [1, 2]]</code> returns 2 instead of 1. Search for the first
  tail <em>greater than or equal to</em> the height; a search that skips equal
  tails would allow equal heights in a chain, and the problem needs strictly
  increasing ones. And sort a copy, as the code does, because
  <code>sort</code> reorders the caller's array in place. The tails idea is the
  same one the 1D chapter uses for the longest increasing subsequence, and the
  binary search is the one from the binary-search chapter.
</div>

<h3>The same table, filled on demand: a top-down template</h3>
<p>
  Everything so far filled the table bottom-up, which means choosing a loop
  order that guarantees each cell's inputs are ready. The palindrome tables
  showed how that can go wrong. The other way is to write the recurrence the way
  you would state it, as a function, and cache what it returns. The function
  asks for the smaller subproblems it needs, and the cache makes sure each
  one is computed only once. The table gets filled in whatever order the
  recursion happens to need.
</p>
<pre><code>function lcsTopDown(a, b) {
  const memo = Array.from({ length: a.length }, () =&gt; new Array(b.length).fill(undefined));

  function solve(i, j) { <span class="c">// LCS of a.slice(i) and b.slice(j)</span>
    if (i === a.length || j === b.length) return 0; <span class="c">// an empty suffix shares nothing</span>
    if (memo[i][j] !== undefined) return memo[i][j]; <span class="c">// test for undefined: 0 is a real answer</span>
    memo[i][j] = a[i] === b[j]
      ? 1 + solve(i + 1, j + 1)
      : Math.max(solve(i + 1, j), solve(i, j + 1));
    return memo[i][j];
  }
  return solve(0, 0);
}</code></pre>
<p>
  Here the state is the <em>suffix</em> pair: <code>solve(i, j)</code> is the LCS
  of <code>a.slice(i)</code> and <code>b.slice(j)</code>, so the recursion moves
  forward and the base case is running off the end. Prefixes work equally well;
  pick one and write down in a sentence what the state means before you code it.
  The template has four parts: the base cases, a cache check, the recurrence,
  and a cache write before returning.
</p>
<div class="warn">
  <span class="ttl">⚠ Three ways the memo goes wrong</span>
  <b>The sentinel.</b> Test <code>memo[i][j] !== undefined</code> rather than
  whether the value is truthy. LCS can legitimately be 0, and a true-or-false
  problem stores <code>false</code>; a truthiness test would treat both as "not
  computed yet" and recompute them every time, which can quietly turn O(m × n)
  back into exponential time. <b>The depth.</b> The recursion can be as deep
  as <code>m + n</code>. Two strings of 10,000 repeated <code>a</code>
  characters made this function throw "Maximum call stack size exceeded" in
  Node 24 with its default settings, while the bottom-up loops handle the same
  input without recursion. Read the constraints before you choose top-down.
  <b>The key.</b> The cache must be keyed by exactly the parameters that
  change. A nested array indexed by <code>i</code> and <code>j</code> is the
  cheapest to write; a <code>Map</code> keyed by <code>i * (n + 1) + j</code> is
  the choice when the state space is large but only a few states are ever
  reached.
</div>
<table>
  <tr><th></th><th>Bottom-up table</th><th>Top-down with a memo</th></tr>
  <tr><td>Order of filling</td><td>you choose a loop order that respects the dependencies</td><td>the recursion discovers the order</td></tr>
  <tr><td>States computed</td><td>all of them</td><td>only the reachable ones</td></tr>
  <tr><td>Call stack</td><td>none</td><td>up to the longest chain of dependencies</td></tr>
  <tr><td>Reconstructing the answer</td><td>walk back through the table</td><td>the same walk works on the memo, if every state was reached</td></tr>
  <tr><td>Natural when</td><td>every cell is needed and the order is obvious</td><td>the order is awkward, or most states are never reached</td></tr>
</table>
<p class="sub">
  The cost of either version is the number of states times the work per state:
  here (m × n) states at O(1) each. In an interview it is a sound plan to write
  the top-down version first when you cannot see the fill order yet, get it
  correct, and then offer to convert it to loops if the interviewer worries
  about the call stack.
</p>

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
  <li>"Is this substring/subsequence a palindrome" → fill so <code>dp[i+1][j-1]</code> comes first: by increasing length, or rows bottom-up, not rows top-down</li>
  <li>A grid with walls keeps the same recurrence with 0 on the walls; a cost per cell turns the sum into a minimum, with <code>Infinity</code> for neighbours that do not exist; four-direction moves mean a shortest-path problem, not this table</li>
  <li>"Return the actual subsequence, edits or items" → walk back from the answer cell asking which neighbour explains each value, and keep the full table to do it</li>
  <li>"Substring" or "subarray" (contiguous) against "subsequence" → the contiguous table resets to 0 on a mismatch, and its answer is the largest cell anywhere</li>
  <li>"How many ways" → add the options instead of taking a maximum, with a base case of 1 for the empty case; "is it possible" → OR them</li>
  <li>The largest square or rectangle that ends at a corner cell → look at the three neighbours that are already filled</li>
  <li>A pattern with wildcards or repeats against a string → a table over a prefix of each, and a star that means "match nothing" or "take one more"</li>
  <li>Pairs with two ordered properties and a large n → sort by one, run a longest-increasing-subsequence on the other, and sort ties the other way</li>
  <li>If you cannot see the fill order, write the recurrence as a memoized function first, and check the recursion depth against the constraints</li>
  <li>If the state needs a third piece of information, you're not stuck — extend to a 3D table (or a map keyed by a tuple) using the exact same recipe</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State dp[i][j]'s meaning in one sentence for a grid problem, a two-string problem, and a knapsack problem — three different shapes, one recipe.</li>
    <li>Explain why the padding row/column of zeros in LCS and Edit Distance removes the need to special-case i=0 or j=0.</li>
    <li>Write Edit Distance and say why a mismatch checks three neighbors, not two like LCS.</li>
    <li>Explain why palindrome DP needs <code>dp[i+1][j-1]</code> filled before <code>dp[i][j]</code>, and name two fill orders that satisfy it (by length, rows bottom-up) and one that does not (rows top-down).</li>
    <li>Given a new problem, decide whether it needs the whole grid in memory or can be space-optimized to one or two rows.</li>
    <li>Walk back from the corner of an LCS table to build the string, and say why that needs the full table and not a rolling row.</li>
    <li>Explain why the longest common substring table resets to 0 on a mismatch, and why its answer is the largest cell and not the corner.</li>
    <li>Reduce Target Sum to counting subsets with a given sum, and say why <code>dp[i][0]</code> is not always 1 when the input has zeros.</li>
    <li>Derive the Maximal Square recurrence from the squares at the three neighbours, and say why the minimum is the right combination.</li>
    <li>Say how a star differs in wildcard matching and in the regular-expression subset, and which cell each option reads.</li>
    <li>Explain why Russian Doll Envelopes sorts ties by height in descending order, and what breaks if you do not.</li>
    <li>Write the top-down template from memory, with its memo sentinel, and name the constraint that rules it out.</li>
  </ul>
</div>

<h3>See the table fill</h3>
<p>Watch which cells each new cell reads. On a match it reaches diagonally; otherwise it takes the better of above and left. That dependency pattern is the whole recurrence.</p>

<div class="demo">
  <div class="demo__bar">DP table — longest common subsequence, cell by cell</div>
  <div class="demo__body">
    <div class="loop-grid loop-grid--single">
      <div>
        <div class="loop-code" id="dp-code"></div>
        <div class="loop-bar"><i id="dp-bar"></i></div>
        <p class="loop-step" id="dp-step"></p>
        <div class="demo__ctl">
          <button class="btn" id="dp-prev" type="button">← Back</button>
          <button class="btn" id="dp-next" type="button">Next step →</button>
          <button class="btn" id="dp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="dp-reset" type="button">Reset</button>
        </div>
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
  var STEPS = [{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"LCS of \\"ABCBDAB\\" and \\"BDCABA\\". Row 0 and column 0 are 0 — an empty string shares nothing.","line":1},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (0) and left (0) = 0.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"D\\" — take the better of above (0) and left (0) = 0.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"C\\" — take the better of above (0) and left (0) = 0.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[0][3] + 1 = 1.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (0) and left (1) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"hot"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[0][5] + 1 = 1.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[1][0] + 1 = 1.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"D\\" — take the better of above (0) and left (1) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"C\\" — take the better of above (0) and left (1) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (1) and left (1) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[1][4] + 1 = 2.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"hot"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (1) and left (2) = 2.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"D\\" — take the better of above (1) and left (1) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" === \\"C\\" — extend the diagonal: dp[2][2] + 1 = 2.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"A\\" — take the better of above (1) and left (2) = 2.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[3][0] + 1 = 1.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"D\\" — take the better of above (1) and left (1) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"C\\" — take the better of above (2) and left (1) = 2.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"hot"},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[3][4] + 1 = 3.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"D\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"D\\" === \\"D\\" — extend the diagonal: dp[4][1] + 1 = 2.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"D\\" — take the better of above (2) and left (1) = 2.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[5][3] + 1 = 3.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"dep"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"hot"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[5][5] + 1 = 4.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[6][0] + 1 = 1.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"dep"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"hot"},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[6][4] + 1 = 4.","line":4},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"dep"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"dep"},{"v":"4","c":"hot"}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (4) and left (4) = 4.","line":5},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"},{"v":"4","c":"hot"}]],"panels":{},"note":"Bottom-right is the answer: LCS length 4. Every cell was filled once — O(n·m).","line":3}];
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
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(28px, 1fr))";
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
`,
};
