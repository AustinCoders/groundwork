import type { Chapter } from "../types";

export const dsaMatrixProblems: Chapter = {
  id: "dsa-matrix-problems",
  num: "I16",
  title: "Matrix problems",
  short: "Matrix problems",
  levels: ["intermediate"],
  prerequisites: ["dsa-prefix-sums"],
  practice: [
    "ex-spiral-matrix",
    "ex-rotate-image",
    "ex-set-matrix-zeroes",
    "ex-search-2d-matrix-ii",
    "ex-game-of-life",
    "ex-valid-sudoku",
    "ex-diagonal-traverse",
    "ex-spiral-matrix-ii",
    "ex-search-2d-matrix",
    "ex-number-of-islands",
    "ex-max-area-of-island",
    "ex-transpose-matrix",
    "ex-rotate-matrix-counterclockwise",
    "ex-reshape-the-matrix",
    "ex-flipping-an-image",
    "ex-toeplitz-matrix",
    "ex-count-negatives-in-sorted-matrix",
    "ex-kth-smallest-in-sorted-matrix",
  ],
  ready: true,
  subtitle: "A grid is an array of arrays — every trick here is index bookkeeping, done carefully.",
  body: `<h3>Grids in JavaScript: indexing, building, and the shared-row trap</h3>
<p>
  A matrix is an array of row arrays, so <code>matrix[r][c]</code> reads row
  <code>r</code>, column <code>c</code>, and the first index is always the
  vertical one. Take the sizes from the data and guard the empty case:
  <code>rows = matrix.length</code>, <code>cols = matrix[0].length</code>
  throws on <code>[]</code>, so return early when there are no rows. Four
  small facts get reused in almost every problem below.
</p>
<ul>
  <li><b>Flat index.</b> Cell <code>(r, c)</code> is number <code>r * cols + c</code> in row-major order, and number <code>id</code> sits at <code>r = Math.floor(id / cols)</code>, <code>c = id % cols</code>. This turns any grid into a 1D array for binary search or hashing.</li>
  <li><b>Diagonals.</b> On a main-direction diagonal (down and to the right) <code>r - c</code> never changes; on an anti-diagonal (down and to the left) <code>r + c</code> never changes. Both are ready-made keys for "group the cells on the same diagonal".</li>
  <li><b>Neighbours.</b> Keep the four moves in one table, <code>const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]]</code>, loop over it, and test the bounds <code>0 &lt;= nr &lt; rows</code> and <code>0 &lt;= nc &lt; cols</code> before reading. Add four diagonal moves for the eight-neighbour version.</li>
  <li><b>Building a blank grid.</b> Write <code>Array.from({ length: rows }, () =&gt; new Array(cols).fill(0))</code>.</li>
</ul>
<div class="warn">
  <span class="ttl">⚠ new Array(rows).fill(new Array(cols).fill(0)) shares one row</span>
  <code>fill</code> evaluates its argument once and stores the <em>same</em>
  array reference in every slot. After <code>grid[0][0] = 1</code> every row
  shows the 1, since <code>grid</code> is <code>[[1, 0], [1, 0]]</code> for a
  two-by-two grid. The <code>Array.from</code> form above calls its callback
  once per row and builds a separate array each time. The same applies to
  <code>Array(rows).fill([])</code> used for adjacency lists. Copying a
  matrix has the same trap: <code>matrix.slice()</code> copies only the outer
  array, so the rows are still shared; use
  <code>matrix.map(row =&gt; row.slice())</code>.
</div>

<h3>Traversal direction — the pattern behind spiral order</h3>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A grid with numbers showing the order cells are visited in a spiral, starting from the top-left and winding inward">
    <g class="rough">
      <rect class="box" x="20" y="20" width="80" height="50" />
      <rect class="box" x="100" y="20" width="80" height="50" />
      <rect class="box" x="180" y="20" width="80" height="50" />
      <rect class="box" x="260" y="20" width="80" height="50" />
      <rect class="box" x="20" y="70" width="80" height="50" />
      <rect class="boxg" x="100" y="70" width="80" height="50" />
      <rect class="boxg" x="180" y="70" width="80" height="50" />
      <rect class="box" x="260" y="70" width="80" height="50" />
      <rect class="box" x="20" y="120" width="80" height="50" />
      <rect class="box" x="100" y="120" width="80" height="50" />
      <rect class="box" x="180" y="120" width="80" height="50" />
      <rect class="box" x="260" y="120" width="80" height="50" />
    </g>
    <text class="sm" x="60" y="50" text-anchor="middle">1</text>
    <text class="sm" x="140" y="50" text-anchor="middle">2</text>
    <text class="sm" x="220" y="50" text-anchor="middle">3</text>
    <text class="sm" x="300" y="50" text-anchor="middle">4</text>
    <text class="sm" x="60" y="100" text-anchor="middle">10</text>
    <text class="sm gr" x="140" y="100" text-anchor="middle">11</text>
    <text class="sm gr" x="220" y="100" text-anchor="middle">12</text>
    <text class="sm" x="300" y="100" text-anchor="middle">5</text>
    <text class="sm" x="60" y="150" text-anchor="middle">9</text>
    <text class="sm" x="140" y="150" text-anchor="middle">8</text>
    <text class="sm" x="220" y="150" text-anchor="middle">7</text>
    <text class="sm" x="300" y="150" text-anchor="middle">6</text>
    <text class="lbl" x="20" y="220" style="font-size:14px">right along the top → down the right side →</text>
    <text class="lbl" x="20" y="245" style="font-size:14px">left along the bottom → up the left side → shrink boundary, repeat</text>
  </svg>
  <figcaption>Four boundaries (top/right/bottom/left) that shrink inward after each full loop.</figcaption>
</figure>
<pre><code>function spiralOrder(matrix) {
  if (matrix.length === 0) return [];
  const result = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
    right--;
    if (top <= bottom) { <span class="c">// guard: this row may already be consumed</span>
      for (let c = right; c >= left; c--) result.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) { <span class="c">// guard: this column may already be consumed</span>
      for (let r = bottom; r >= top; r--) result.push(matrix[r][left]);
      left++;
    }
  }
  return result;
}</code></pre>
<h4>Dry run: spiralOrder on the 3×4 grid in the figure above</h4>
<table>
  <tr><th>Loop pass</th><th>top, bottom, left, right (start)</th><th>Cells appended, in order</th><th>Result so far</th></tr>
  <tr><td>1</td><td>0, 2, 0, 3</td><td>1, 2, 3, 4 (top row) → 5, 6 (right col) → 7, 8, 9 (bottom row) → 10 (left col)</td><td>[1..10]</td></tr>
  <tr><td>2</td><td>1, 1, 1, 2</td><td>11, 12 (top row) → the right col and left col loops run zero times and the bottom-row guard skips: this single row is already fully consumed</td><td>[1..12]</td></tr>
</table>
<p class="sub">
  After pass 2, <code>top</code> becomes 2 while <code>bottom</code> is
  still 1 — the <code>while</code> loop's own condition
  (<code>top &lt;= bottom</code>) catches that and stops. Inside the pass,
  the bottom-row guard had already skipped the redundant walk, while the
  left-column guard was still true (<code>left == right == 1</code>) and its
  loop simply ran zero times. The checks protect against the same
  non-square edge case from different angles.
</p>
<div class="warn">
  <span class="ttl">⚠ The two guards aren't optional</span>
  On a non-square matrix (e.g. a single row, or a single column), skipping
  the <code>if (top &lt;= bottom)</code> / <code>if (left &lt;= right)</code>
  checks re-visits cells that the earlier two loops already covered —
  this is the single most common bug in spiral-order implementations.
</div>

<h3>Direction arrays: turning right with a table</h3>
<p>
  The four-boundary spiral needs guards because the boundaries can cross. A
  second formulation has no boundaries at all: walk in the current direction,
  and turn right whenever the next cell is off the grid or already filled.
  "Turn right" is just advancing an index in a table of moves ordered
  right, down, left, up.
</p>
<pre><code>function generateMatrix(n) { <span class="c">// Spiral Matrix II: fill an n x n grid with 1..n*n in spiral order</span>
  const grid = Array.from({ length: n }, () =&gt; new Array(n).fill(0));
  const dr = [0, 1, 0, -1];
  const dc = [1, 0, -1, 0];
  let r = 0, c = 0, d = 0; <span class="c">// start top-left, heading right</span>

  for (let value = 1; value &lt;= n * n; value++) {
    grid[r][c] = value;
    const nr = r + dr[d], nc = c + dc[d];
    if (nr &lt; 0 || nr &gt;= n || nc &lt; 0 || nc &gt;= n || grid[nr][nc] !== 0) {
      d = (d + 1) % 4; <span class="c">// blocked: turn right, then step in the new direction</span>
    }
    r += dr[d];
    c += dc[d];
  }
  return grid;
}</code></pre>
<h4>Dry run: generateMatrix(3)</h4>
<table>
  <tr><th>value</th><th>cell written</th><th>next cell in this direction</th><th>direction after</th></tr>
  <tr><td>1, 2</td><td>(0,0), (0,1)</td><td>free</td><td>right</td></tr>
  <tr><td>3</td><td>(0,2)</td><td>(0,3) is off the grid</td><td>turn: down</td></tr>
  <tr><td>4</td><td>(1,2)</td><td>free</td><td>down</td></tr>
  <tr><td>5</td><td>(2,2)</td><td>(3,2) is off the grid</td><td>turn: left</td></tr>
  <tr><td>6, 7</td><td>(2,1), (2,0)</td><td>(2,0) is free after 6; (2,-1) is off the grid after 7</td><td>turn after 7: up</td></tr>
  <tr><td>8</td><td>(1,0)</td><td>(0,0) already holds 1</td><td>turn: right</td></tr>
  <tr><td>9</td><td>(1,1)</td><td>(1,2) already holds 4</td><td>(never used again)</td></tr>
</table>
<p class="sub">
  The result is <code>[[1,2,3],[8,9,4],[7,6,5]]</code>. This is O(n²) time,
  one step per cell, and it uses the grid itself as the "visited" record
  (a 0 means unwritten). When you <em>read</em> a matrix in spiral order
  instead of generating one, the grid already holds data, so the same loop
  needs a separate <code>seen</code> array or a sentinel value you will not
  confuse with real data. Pick the boundary version when the shape is a plain
  rectangle and the direction table when the path has to react to obstacles.
</p>

<h3>Diagonals: r + c names each anti-diagonal</h3>
<p>
  "Diagonal Traverse" asks for every element, one anti-diagonal at a time,
  alternating direction. Every cell on the diagonal with sum <code>s</code>
  satisfies <code>c = s - r</code>, and the sums run from 0 to
  <code>rows + cols - 2</code>. For each sum, collect the cells in order of
  increasing row, then reverse every other diagonal. The only fiddly part is
  the range of rows that lie inside the grid: <code>r</code> must be at least
  <code>s - (cols - 1)</code> so that <code>c</code> does not pass the right
  edge, and at most <code>min(rows - 1, s)</code>.
</p>
<pre><code>function findDiagonalOrder(mat) {
  const rows = mat.length, cols = mat[0].length;
  const out = [];
  for (let s = 0; s &lt;= rows + cols - 2; s++) {
    const diagonal = [];
    const first = Math.max(0, s - cols + 1);
    const last = Math.min(rows - 1, s);
    for (let r = first; r &lt;= last; r++) diagonal.push(mat[r][s - r]);
    if (s % 2 === 0) diagonal.reverse(); <span class="c">// even sums are walked bottom-left to top-right</span>
    out.push(...diagonal);
  }
  return out;
}</code></pre>
<table>
  <tr><th>s</th><th>Rows <code>first..last</code></th><th>Cells, row ascending</th><th>Appended</th></tr>
  <tr><td>0</td><td>0..0</td><td>1</td><td>1</td></tr>
  <tr><td>1</td><td>0..1</td><td>2, 4</td><td>2, 4</td></tr>
  <tr><td>2</td><td>0..2</td><td>3, 5, 7</td><td>7, 5, 3 (reversed)</td></tr>
  <tr><td>3</td><td>1..2</td><td>6, 8</td><td>6, 8</td></tr>
  <tr><td>4</td><td>2..2</td><td>9</td><td>9</td></tr>
</table>
<p class="sub">
  On <code>[[1,2,3],[4,5,6],[7,8,9]]</code> the output is
  <code>1 2 4 7 5 3 6 8 9</code>. Time O(rows · cols), and the temporary
  <code>diagonal</code> array is O(min(rows, cols)). This grouping idea is
  the same one that makes Toeplitz checks and "sort each diagonal" problems
  easy: use <code>r - c</code> (or <code>r + c</code>) as the key and let
  the key do the diagonal bookkeeping.
</p>

<h3>In-place rotation — 90° with no extra matrix</h3>
<p>
  Rotating 90° clockwise decomposes into two simpler, well-known
  operations: transpose (flip across the diagonal), then reverse each row.
</p>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="A 3 by 3 grid being transposed across its diagonal, then each row reversed, resulting in a 90 degree clockwise rotation">
    <g class="rough">
      <rect class="box" x="20" y="20" width="40" height="30" /><rect class="box" x="60" y="20" width="40" height="30" /><rect class="box" x="100" y="20" width="40" height="30" />
      <rect class="box" x="20" y="50" width="40" height="30" /><rect class="box" x="60" y="50" width="40" height="30" /><rect class="box" x="100" y="50" width="40" height="30" />
      <rect class="box" x="20" y="80" width="40" height="30" /><rect class="box" x="60" y="80" width="40" height="30" /><rect class="box" x="100" y="80" width="40" height="30" />
    </g>
    <text class="sm" x="40" y="40" text-anchor="middle">1</text><text class="sm" x="80" y="40" text-anchor="middle">2</text><text class="sm" x="120" y="40" text-anchor="middle">3</text>
    <text class="sm" x="40" y="70" text-anchor="middle">4</text><text class="sm" x="80" y="70" text-anchor="middle">5</text><text class="sm" x="120" y="70" text-anchor="middle">6</text>
    <text class="sm" x="40" y="100" text-anchor="middle">7</text><text class="sm" x="80" y="100" text-anchor="middle">8</text><text class="sm" x="120" y="100" text-anchor="middle">9</text>
    <text class="lbl" x="180" y="65" style="font-size:14px">transpose →</text>
    <g class="rough">
      <rect class="box" x="260" y="20" width="40" height="30" /><rect class="box" x="300" y="20" width="40" height="30" /><rect class="box" x="340" y="20" width="40" height="30" />
      <rect class="box" x="260" y="50" width="40" height="30" /><rect class="box" x="300" y="50" width="40" height="30" /><rect class="box" x="340" y="50" width="40" height="30" />
      <rect class="box" x="260" y="80" width="40" height="30" /><rect class="box" x="300" y="80" width="40" height="30" /><rect class="box" x="340" y="80" width="40" height="30" />
    </g>
    <text class="sm" x="280" y="40" text-anchor="middle">1</text><text class="sm" x="320" y="40" text-anchor="middle">4</text><text class="sm" x="360" y="40" text-anchor="middle">7</text>
    <text class="sm" x="280" y="70" text-anchor="middle">2</text><text class="sm" x="320" y="70" text-anchor="middle">5</text><text class="sm" x="360" y="70" text-anchor="middle">8</text>
    <text class="sm" x="280" y="100" text-anchor="middle">3</text><text class="sm" x="320" y="100" text-anchor="middle">6</text><text class="sm" x="360" y="100" text-anchor="middle">9</text>
    <text class="lbl" x="405" y="45" style="font-size:13px">reverse</text>
    <text class="lbl" x="405" y="62" style="font-size:13px">rows →</text>
    <g class="rough">
      <rect class="boxg" x="500" y="20" width="40" height="30" /><rect class="boxg" x="540" y="20" width="40" height="30" /><rect class="boxg" x="580" y="20" width="40" height="30" />
      <rect class="boxg" x="500" y="50" width="40" height="30" /><rect class="boxg" x="540" y="50" width="40" height="30" /><rect class="boxg" x="580" y="50" width="40" height="30" />
      <rect class="boxg" x="500" y="80" width="40" height="30" /><rect class="boxg" x="540" y="80" width="40" height="30" /><rect class="boxg" x="580" y="80" width="40" height="30" />
    </g>
    <text class="sm" x="520" y="40" text-anchor="middle">7</text><text class="sm" x="560" y="40" text-anchor="middle">4</text><text class="sm" x="600" y="40" text-anchor="middle">1</text>
    <text class="sm" x="520" y="70" text-anchor="middle">8</text><text class="sm" x="560" y="70" text-anchor="middle">5</text><text class="sm" x="600" y="70" text-anchor="middle">2</text>
    <text class="sm" x="520" y="100" text-anchor="middle">9</text><text class="sm" x="560" y="100" text-anchor="middle">6</text><text class="sm" x="600" y="100" text-anchor="middle">3</text>
  </svg>
  <figcaption>Two well-understood O(n²) passes compose into a correct 90° clockwise rotation, in place.</figcaption>
</figure>
<pre><code>function rotate(matrix) {
  const n = matrix.length;

  <span class="c">// transpose: swap matrix[r][c] with matrix[c][r]</span>
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) { <span class="c">// c starts at r+1 — never touch the diagonal or repeat a swap</span>
      [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];
    }
  }

  <span class="c">// reverse each row</span>
  for (const row of matrix) row.reverse();
}</code></pre>

<h3>Other rotations, flips, and non-square matrices</h3>
<p>
  The clockwise recipe (transpose, then reverse each row) is one entry in a
  small family. Each of the other moves is a composition of the same two
  building blocks, and you can reconstruct any of them by tracking where the
  corner cell goes.
</p>
<table>
  <tr><th>Move</th><th>Composition</th><th>Where cell (r, c) of an n × n matrix lands</th></tr>
  <tr><td>90° clockwise</td><td>transpose, then reverse each row</td><td>(c, n-1-r)</td></tr>
  <tr><td>90° counterclockwise</td><td>transpose, then reverse the order of the rows</td><td>(n-1-c, r)</td></tr>
  <tr><td>180°</td><td>reverse the order of the rows and reverse each row</td><td>(n-1-r, n-1-c)</td></tr>
  <tr><td>flip left-right</td><td>reverse each row</td><td>(r, n-1-c)</td></tr>
  <tr><td>flip top-bottom</td><td>reverse the order of the rows</td><td>(n-1-r, c)</td></tr>
</table>
<pre><code>function rotateCounterclockwise(matrix) {
  const n = matrix.length;
  for (let r = 0; r &lt; n; r++) {
    for (let c = r + 1; c &lt; n; c++) {
      [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];
    }
  }
  matrix.reverse(); <span class="c">// reverse the row order in place; rows themselves are untouched</span>
}</code></pre>
<p>
  Two follow-ups come up. First, "do it in one pass". Each cell belongs to a
  cycle of four: the cell, the cell it moves to, where that one moves, and
  where the last one moves, which is the starting cell again. Rotate those four
  values together, layer by layer from the outside in.
</p>
<pre><code>function rotateByCycles(matrix) {
  const n = matrix.length;
  for (let r = 0; r &lt; Math.floor(n / 2); r++) {
    for (let c = r; c &lt; n - 1 - r; c++) {
      const tmp = matrix[r][c];
      matrix[r][c] = matrix[n - 1 - c][r];                       <span class="c">// left side moves to the top</span>
      matrix[n - 1 - c][r] = matrix[n - 1 - r][n - 1 - c];       <span class="c">// bottom moves to the left side</span>
      matrix[n - 1 - r][n - 1 - c] = matrix[c][n - 1 - r];       <span class="c">// right side moves to the bottom</span>
      matrix[c][n - 1 - r] = tmp;                                <span class="c">// the saved top moves to the right side</span>
    }
  }
}</code></pre>
<p class="sub">
  The loop bounds are the part to rehearse. <code>r</code> runs over the
  first half of the layers. A layer's side has <code>n - 2r</code> cells, and
  the cycles start only at the first <code>n - 2r - 1</code> of them
  (<code>c</code> stops before <code>n - 1 - r</code>), because the last cell
  of one side is the first cell of the next side and is already moved by a
  cycle that starts there. For an odd n the centre cell never moves. Both versions are O(n²) time and O(1) space.
</p>
<p>
  Second, a <b>non-square</b> matrix cannot be rotated in place, because a
  <code>rows × cols</code> grid becomes <code>cols × rows</code>; you
  allocate the result. The index rule for clockwise is
  <code>result[c][rows - 1 - r] = matrix[r][c]</code>, and a plain transpose is
  <code>result[c][r] = matrix[r][c]</code>.
</p>
<pre><code>function rotateClockwiseCopy(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  const result = Array.from({ length: cols }, () =&gt; new Array(rows));
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) result[c][rows - 1 - r] = matrix[r][c];
  }
  return result;
}

function transpose(matrix) {
  return Array.from({ length: matrix[0].length }, (_, c) =&gt; matrix.map(row =&gt; row[c]));
}

rotateClockwiseCopy([[1, 2, 3], [4, 5, 6]]); <span class="c">// [[4, 1], [5, 2], [6, 3]]</span></code></pre>
<p class="sub">
  A quick sanity check for any rotation code is to apply it four times and
  confirm the matrix returns to where it started.
</p>

<h3>Set Matrix Zeroes: the matrix stores its own markers</h3>
<p>
  Whenever a cell is 0, zero its entire row and column. Zeroing as you scan is
  wrong, because the zeros you just wrote look like original zeros and wipe
  too much. The straightforward fix records the zero rows and columns in two
  extra arrays (O(rows + cols) space). The O(1)-space version stores those
  markers <em>inside</em> the matrix: use the first cell of each row as "this
  row must be zeroed" and the first cell of each column as "this column must
  be zeroed". That overwrites the first row and first column, so remember
  separately whether they held a zero themselves.
</p>
<pre><code>function setZeroes(matrix) {
  const rows = matrix.length, cols = matrix[0].length;
  let firstRowZero = false, firstColZero = false;

  for (let c = 0; c &lt; cols; c++) if (matrix[0][c] === 0) firstRowZero = true;
  for (let r = 0; r &lt; rows; r++) if (matrix[r][0] === 0) firstColZero = true;

  for (let r = 1; r &lt; rows; r++) {          <span class="c">// pass 1: record zeros into the first row and column</span>
    for (let c = 1; c &lt; cols; c++) {
      if (matrix[r][c] === 0) { matrix[r][0] = 0; matrix[0][c] = 0; }
    }
  }
  for (let r = 1; r &lt; rows; r++) {          <span class="c">// pass 2: apply them to the interior only</span>
    for (let c = 1; c &lt; cols; c++) {
      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;
    }
  }
  if (firstRowZero) for (let c = 0; c &lt; cols; c++) matrix[0][c] = 0; <span class="c">// last: the markers are no longer needed</span>
  if (firstColZero) for (let r = 0; r &lt; rows; r++) matrix[r][0] = 0;
}</code></pre>
<h4>Dry run: [[1,1,1],[1,0,1],[1,1,1]]</h4>
<table>
  <tr><th>Stage</th><th>Matrix</th><th>Note</th></tr>
  <tr><td>flags</td><td>[[1,1,1],[1,0,1],[1,1,1]]</td><td>first row and first column have no zero: both flags stay false</td></tr>
  <tr><td>after pass 1</td><td>[[1,0,1],[0,0,1],[1,1,1]]</td><td>the zero at (1,1) marked row 1 at (1,0) and column 1 at (0,1)</td></tr>
  <tr><td>after pass 2</td><td>[[1,0,1],[0,0,0],[1,0,1]]</td><td>cells whose row marker or column marker is 0 become 0</td></tr>
  <tr><td>after the flags</td><td>[[1,0,1],[0,0,0],[1,0,1]]</td><td>nothing more to do; the markers are the real answer here</td></tr>
</table>
<p class="sub">
  Time O(rows · cols), extra space O(1). The ordering is where bugs live. Pass
  2 must skip the first row and column, because applying a marker to the
  marker cells destroys information the other cells still need, and the two
  flags must be applied <em>last</em>, though they have to be computed
  <em>first</em>: computed after pass 1, they would read cells that pass 1 has
  already overwritten.
</p>

<h3>Game of Life: two states in one cell</h3>
<p>
  Each cell is alive (1) or dead (0). A live cell survives with 2 or 3 live
  neighbours; a dead cell comes alive with exactly 3; everything else is dead
  next turn. All cells update <em>simultaneously</em>, so overwriting a cell
  while scanning corrupts the neighbour counts of later cells. Copying the
  board is O(rows · cols) extra space. To stay in place, let each cell hold
  <em>both</em> the old and the new state: bit 0 is the old state and bit 1
  is the new state. Neighbour counts always read bit 0 (<code>&amp; 1</code>),
  which writing bit 1 never disturbs.
</p>
<table>
  <tr><th>Stored value</th><th>Bits (new, old)</th><th>Meaning</th></tr>
  <tr><td>0</td><td>0 0</td><td>dead, stays dead</td></tr>
  <tr><td>1</td><td>0 1</td><td>was alive, dies</td></tr>
  <tr><td>2</td><td>1 0</td><td>was dead, is born</td></tr>
  <tr><td>3</td><td>1 1</td><td>was alive, survives</td></tr>
</table>
<pre><code>function gameOfLife(board) {
  const rows = board.length, cols = board[0].length;

  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      let live = 0;
      for (let dr = -1; dr &lt;= 1; dr++) {
        for (let dc = -1; dc &lt;= 1; dc++) {
          if (dr === 0 &amp;&amp; dc === 0) continue;
          const nr = r + dr, nc = c + dc;
          if (nr &gt;= 0 &amp;&amp; nr &lt; rows &amp;&amp; nc &gt;= 0 &amp;&amp; nc &lt; cols) {
            live += board[nr][nc] &amp; 1; <span class="c">// the OLD state, even in cells already updated</span>
          }
        }
      }
      const alive = board[r][c] &amp; 1;
      const next = alive ? live === 2 || live === 3 : live === 3;
      if (next) board[r][c] |= 2; <span class="c">// write the new state into bit 1</span>
    }
  }
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) board[r][c] &gt;&gt;= 1; <span class="c">// the new state becomes the only state</span>
  }
}</code></pre>
<h4>Dry run: a vertical blinker, [[0,1,0],[0,1,0],[0,1,0]]</h4>
<table>
  <tr><th>Cell</th><th>Live neighbours (old)</th><th>Old state</th><th>Stored value</th></tr>
  <tr><td>(0,0), (0,2), (2,0), (2,2)</td><td>2</td><td>dead</td><td>0</td></tr>
  <tr><td>(0,1), (2,1)</td><td>1</td><td>alive</td><td>1 (dies)</td></tr>
  <tr><td>(1,0), (1,2)</td><td>3</td><td>dead</td><td>2 (born)</td></tr>
  <tr><td>(1,1)</td><td>2</td><td>alive</td><td>3 (survives)</td></tr>
</table>
<p class="sub">
  The board after the first scan is <code>[[0,1,0],[2,3,2],[0,1,0]]</code>,
  and shifting every value right by one gives
  <code>[[0,0,0],[1,1,1],[0,0,0]]</code>, the horizontal blinker. Time
  O(rows · cols · 8) = O(rows · cols), extra space O(1). Reading a neighbour as
  <code>board[nr][nc] === 1</code> instead of <code>&amp; 1</code> is the
  classic bug: an already-updated neighbour holding 3 (alive before and after)
  is then missed, although it was alive.
  On a board that is infinite or mostly empty, the expected follow-up is to
  store only the live coordinates in a set and count neighbours by incrementing
  a map around each live cell.
</p>

<h3>Grid as a graph — search patterns from the graph chapter, reused</h3>
<p>
  Any grid problem involving "connected region," "flood fill," or
  "shortest path between cells" is the graph-traversal chapters applied
  directly: each cell is a node, each of its up-to-4 orthogonal neighbors
  is an edge.
</p>
<pre><code>function numIslands(grid) {
  if (grid.length === 0) return 0;
  const rows = grid.length, cols = grid[0].length;
  let islands = 0;

  function sink(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; <span class="c">// mark visited by mutating the grid — avoids a separate visited set</span>
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++;
        sink(r, c); <span class="c">// flood-fill the whole island so it's never counted twice</span>
      }
    }
  }
  return islands;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll treat each cell as a
  graph node with up to four neighbors and reuse a flood-fill DFS — this
  is the exact same connected-components idea from the graph chapter, just
  with grid coordinates standing in for an adjacency list."
</div>

<h3>Searching a sorted matrix: three different shapes</h3>
<p>
  "Sorted matrix" can mean three different things, and each one has its own
  search. Read which ordering the problem promises before choosing.
</p>
<h4>Shape 1: rows sorted, and each row starts higher than the previous row ends</h4>
<p>
  Then reading row by row gives one sorted list of
  <code>rows · cols</code> numbers. Binary search it without building it, by
  converting the flat index <code>mid</code> back to
  <code>(Math.floor(mid / cols), mid % cols)</code>.
</p>
<pre><code>function searchMatrix(matrix, target) {
  const rows = matrix.length, cols = matrix[0].length;
  let lo = 0, hi = rows * cols - 1;
  while (lo &lt;= hi) {
    const mid = Math.floor((lo + hi) / 2);
    const value = matrix[Math.floor(mid / cols)][mid % cols];
    if (value === target) return true;
    if (value &lt; target) lo = mid + 1;
    else hi = mid - 1;
  }
  return false;
}</code></pre>
<p class="sub">O(log(rows · cols)) time, O(1) space.</p>
<h4>Shape 2: every row sorted and every column sorted, nothing else</h4>
<p>
  Now the rows are not chained, so flat binary search is wrong (the last value
  of one row can exceed the first of the next). Start at the
  <b>top-right</b> corner. That cell is the largest in its row and the
  smallest in its column, so one comparison discards a whole line. If the
  value is bigger than the target, everything below it in the column is bigger
  still, so move left. If it is smaller, everything to its left in the row is
  smaller still, so move down.
</p>
<pre><code>function searchMatrixII(matrix, target) {
  let r = 0, c = matrix[0].length - 1;
  while (r &lt; matrix.length &amp;&amp; c &gt;= 0) {
    const value = matrix[r][c];
    if (value === target) return true;
    if (value &gt; target) c--; <span class="c">// the rest of column c is larger than value</span>
    else r++;                <span class="c">// the rest of row r, to the left, is smaller than value</span>
  }
  return false;
}</code></pre>
<table>
  <tr><th>Step</th><th>Cell</th><th>Value</th><th>Compared with target 5</th><th>Move</th></tr>
  <tr><td>1</td><td>(0,4)</td><td>15</td><td>larger</td><td>left</td></tr>
  <tr><td>2</td><td>(0,3)</td><td>11</td><td>larger</td><td>left</td></tr>
  <tr><td>3</td><td>(0,2)</td><td>7</td><td>larger</td><td>left</td></tr>
  <tr><td>4</td><td>(0,1)</td><td>4</td><td>smaller</td><td>down</td></tr>
  <tr><td>5</td><td>(1,1)</td><td>5</td><td>equal</td><td>found</td></tr>
</table>
<p class="sub">
  The table traces the matrix
  <code>[[1,4,7,11,15],[2,5,8,12,19],[3,6,9,16,22],[10,13,14,17,24],[18,21,23,26,30]]</code>.
  Each step removes one row or one column, so the walk takes at most
  <code>rows + cols</code> steps: O(rows + cols) time, O(1) space. The
  <em>top-left</em> corner would not work, because both of its neighbours are
  larger and a comparison cannot say which way to go; only corners where one
  direction increases and the other decreases give a decision.
</p>
<h4>Shape 3: kth smallest in a row- and column-sorted matrix</h4>
<p>
  The k-th smallest is not at a computable position, but you can binary search
  on the <em>value</em>. For a candidate <code>x</code>, count how many cells
  are <code>&lt;= x</code> with the staircase walk from the bottom-left corner;
  the count rises with <code>x</code>. The answer is the smallest
  <code>x</code> whose count reaches <code>k</code>, and that
  <code>x</code> is always a value that is in the matrix (the count only
  jumps at a value that exists).
</p>
<pre><code>function countAtMost(matrix, limit) {
  const rows = matrix.length, cols = matrix[0].length;
  let count = 0, r = rows - 1, c = 0; <span class="c">// bottom-left: smallest in its row, largest in its column</span>
  while (r &gt;= 0 &amp;&amp; c &lt; cols) {
    if (matrix[r][c] &lt;= limit) {
      count += r + 1; <span class="c">// this cell and everything above it in the column</span>
      c++;
    } else {
      r--;
    }
  }
  return count;
}

function kthSmallest(matrix, k) {
  const rows = matrix.length, cols = matrix[0].length;
  let lo = matrix[0][0], hi = matrix[rows - 1][cols - 1];
  while (lo &lt; hi) {
    const mid = Math.floor((lo + hi) / 2);
    if (countAtMost(matrix, mid) &gt;= k) hi = mid; <span class="c">// mid could be the answer: keep it</span>
    else lo = mid + 1;
  }
  return lo;
}</code></pre>
<h4>Dry run: [[1,5,9],[10,11,13],[12,13,15]], k = 8</h4>
<table>
  <tr><th>lo</th><th>hi</th><th>mid</th><th>count of cells &lt;= mid</th><th>Decision</th></tr>
  <tr><td>1</td><td>15</td><td>8</td><td>2 (1 and 5)</td><td>2 &lt; 8, so lo = 9</td></tr>
  <tr><td>9</td><td>15</td><td>12</td><td>6</td><td>6 &lt; 8, so lo = 13</td></tr>
  <tr><td>13</td><td>15</td><td>14</td><td>8</td><td>8 &gt;= 8, so hi = 14</td></tr>
  <tr><td>13</td><td>14</td><td>13</td><td>8</td><td>8 &gt;= 8, so hi = 13; lo equals hi, stop</td></tr>
</table>
<p class="sub">
  The answer is 13. Each count is O(rows + cols) and the search takes
  O(log(max - min)) rounds, so O((rows + cols) · log(max - min)) time with
  O(1) space. The alternative is a min-heap holding the first element of each
  row, popping k times and pushing the popped cell's right neighbour: O(k log
  rows). Prefer the value search when k is large and the heap when k is small.
</p>

<h3>Valid Sudoku: row, column and box in one pass</h3>
<p>
  The board is valid when no digit repeats in any row, column or 3 × 3 box
  (the board can be unsolvable and still be valid; only the digits already
  placed are checked). One pass over the 81 cells with a "seen" set per row,
  per column and per box does it. The only thing to derive is the box number
  of a cell: boxes are numbered 0 to 8 in row-major order, so the box row is
  <code>Math.floor(r / 3)</code>, the box column is
  <code>Math.floor(c / 3)</code>, and
  <code>box = Math.floor(r / 3) * 3 + Math.floor(c / 3)</code>. For the cell
  at row 4, column 7 that gives <code>1 * 3 + 2 = 5</code>, the middle-right
  box.
</p>
<pre><code>function isValidSudoku(board) {
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0); <span class="c">// each entry is a bitmask of digits seen: bit d-1 for digit d</span>

  for (let r = 0; r &lt; 9; r++) {
    for (let c = 0; c &lt; 9; c++) {
      const ch = board[r][c];
      if (ch === ".") continue;
      const bit = 1 &lt;&lt; (ch.charCodeAt(0) - 49); <span class="c">// "1" is char code 49</span>
      const box = Math.floor(r / 3) * 3 + Math.floor(c / 3);
      if ((rows[r] &amp; bit) || (cols[c] &amp; bit) || (boxes[box] &amp; bit)) return false;
      rows[r] |= bit;
      cols[c] |= bit;
      boxes[box] |= bit;
    }
  }
  return true;
}</code></pre>
<p class="sub">
  This is O(81), a constant, and the bitmask turns each membership test into
  one AND. A Set per row, column and box (keyed by digit, or one Set of strings
  such as <code>"r4:7"</code>, <code>"c7:7"</code>, <code>"b5:7"</code>) is the
  same algorithm and is easier to say aloud. The usual slips are an off-by-one
  in the character code, skipping the box check, and using
  <code>r / 3</code> without the floor, which gives fractions that never match.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Spiral," "rotate," "transpose," "diagonal" → boundary/index bookkeeping, work out the pattern on paper first</li>
  <li>"Islands," "regions," "flood fill," "shortest path in a grid" → it's a graph problem wearing a grid costume</li>
  <li>In-place mutation requested → look for a decomposition into two or more simpler, already-known transformations (like rotate = transpose + reverse)</li>
  <li>Always double-check boundary conditions on non-square grids — single row/column inputs break naive boundary logic first</li>
  <li>"Do it in place with O(1) extra space" on a grid → store extra information in the cells themselves: markers in the first row and column (zeroes), or two states in different bits of one cell (Game of Life)</li>
  <li>A matrix sorted "by rows and by columns" → staircase from a corner (search, count); sorted as one flattened list → binary search on the flat index; kth element of a sorted matrix → binary search on the value, or a heap</li>
  <li>Cells on the same diagonal → the key <code>r - c</code> (same main-direction diagonal) or <code>r + c</code> (same anti-diagonal)</li>
  <li>A path that turns when blocked (spiral, snake, bouncing) → a direction table and an "is the next cell usable" test, not hand-written case analysis</li>
  <li>Every fresh grid you build with <code>fill</code> deserves a second look for the shared-row trap</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write spiral order with four shrinking boundaries, and explain what the two inner guards protect against.</li>
    <li>Decompose 90° in-place rotation into transpose + reverse-each-row, and say why the transpose loop starts c at r + 1.</li>
    <li>Recognize a grid "islands/regions/flood fill" problem as the graph chapter's connected components, with cells as nodes.</li>
    <li>Trace spiral order or rotation by hand on a non-square (e.g. 1-row or 1-column) grid to confirm the boundary logic holds.</li>
    <li>Given a new matrix problem, decide whether it's index bookkeeping (spiral/rotate/transpose) or a graph problem in disguise.</li>
    <li>Build a grid with <code>Array.from</code>, and explain why <code>new Array(rows).fill(new Array(cols))</code> aliases every row.</li>
    <li>Fill a spiral with a direction table and a turn-when-blocked rule, and list a diagonal by the constant <code>r + c</code>.</li>
    <li>Write the counterclockwise, 180° and left-right flip compositions, and rotate a non-square matrix into a new one with <code>result[c][rows - 1 - r]</code>.</li>
    <li>Set matrix zeroes in O(1) space with the first row and column as markers, and say why the two flags are applied last.</li>
    <li>Encode Game of Life in place with the old state in bit 0 and the new state in bit 1, and say why neighbours are read with <code>&amp; 1</code>.</li>
    <li>Choose between flat binary search, the top-right staircase, and a value binary search with a staircase count, and compute the box index for Valid Sudoku.</li>
  </ul>
</div>`,
};
