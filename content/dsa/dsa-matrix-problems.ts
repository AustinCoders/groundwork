import type { Chapter } from "../types";

export const dsaMatrixProblems: Chapter = {
  id: "dsa-matrix-problems",
  num: "I12",
  title: "Matrix problems",
  short: "Matrix problems",
  levels: ["intermediate"],
  practice: ["ex-spiral-matrix", "ex-rotate-image", "ex-set-matrix-zeroes", "ex-search-2d-matrix-ii"],
  ready: true,
  subtitle: "A grid is an array of arrays — every trick here is index bookkeeping, done carefully.",
  body: `<h3>Traversal direction — the pattern behind spiral order</h3>
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
<div class="warn">
  <span class="ttl">⚠ The two guards aren't optional</span>
  On a non-square matrix (e.g. a single row, or a single column), skipping
  the <code>if (top &lt;= bottom)</code> / <code>if (left &lt;= right)</code>
  checks re-visits cells that the earlier two loops already covered —
  this is the single most common bug in spiral-order implementations.
</div>

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

<h3>Grid as a graph — search patterns from the graph chapter, reused</h3>
<p>
  Any grid problem involving "connected region," "flood fill," or
  "shortest path between cells" is the graph-traversal chapters applied
  directly: each cell is a node, each of its up-to-4 orthogonal neighbors
  is an edge.
</p>
<pre><code>function numIslands(grid) {
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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Spiral," "rotate," "transpose," "diagonal" → boundary/index bookkeeping, work out the pattern on paper first</li>
  <li>"Islands," "regions," "flood fill," "shortest path in a grid" → it's a graph problem wearing a grid costume</li>
  <li>In-place mutation requested → look for a decomposition into two or more simpler, already-known transformations (like rotate = transpose + reverse)</li>
  <li>Always double-check boundary conditions on non-square grids — single row/column inputs break naive boundary logic first</li>
</ul>`,
};
