import type { Chapter } from "../types";

export const dsaGridBfs: Chapter = {
  id: "dsa-grid-bfs",
  num: "I6",
  title: "BFS on grids and implicit graphs",
  short: "BFS on grids",
  levels: ["intermediate"],
  prerequisites: ["dsa-graphs-representation-traversal"],
  practice: [
    "ex-flood-fill",
    "ex-number-of-islands",
    "ex-shortest-binary-matrix",
    "ex-grid-route",
    "ex-nearest-exit-maze",
    "ex-walls-and-gates",
    "ex-zero-one-matrix",
    "ex-rotting-oranges",
    "ex-as-far-from-land",
    "ex-surrounded-regions",
    "ex-pacific-atlantic-water-flow",
    "ex-open-the-lock",
    "ex-minimum-genetic-mutation",
    "ex-snakes-and-ladders",
    "ex-word-ladder",
    "ex-min-knight-moves",
    "ex-sliding-puzzle",
    "ex-shortest-path-k-obstacles",
    "ex-shortest-bridge",
    "ex-queue-without-shift",
  ],
  ready: true,
  subtitle:
    "A grid, a word list and a lock are all the same graph: states, a rule for the next states, and a queue that finishes one distance before starting the next.",
  body: `<h3>A grid is a graph you never build</h3>
<p>
  The graph chapter stored a graph as an adjacency list: one array of
  neighbours per node. A grid hands you a graph for free. Every cell is a
  node, and two cells are joined by an edge when they share a side and neither
  one is a wall. You do not build any list. The neighbours of
  <code>(r, c)</code> are <code>(r-1, c)</code>, <code>(r+1, c)</code>,
  <code>(r, c-1)</code> and <code>(r, c+1)</code>, and you compute them at the
  moment you need them. A grid with R rows and C columns has R·C nodes and at
  most 2·R·C − R − C edges, so the V + E of a traversal is O(R·C).
</p>
<p>
  Everything you learned about traversal carries over. BFS visits cells in
  order of distance, DFS wanders through a region, and a visited marker stops
  you walking in circles. What is new is bookkeeping and a short list of shapes
  that return again and again:
</p>
<ul>
  <li><b>One start, one target, fewest moves</b> is BFS that records a distance for every cell.</li>
  <li><b>Many starts at once</b> (the nearest gate, the nearest zero, every rotten orange) is multi-source BFS.</li>
  <li><b>Paint, count or measure a connected region</b> is flood fill, by DFS or BFS.</li>
  <li><b>Which cells can reach the edge</b> is a search that starts at the edge and runs backward.</li>
  <li><b>The nodes are not cells at all</b>: words, lock combinations, board positions. It is the same BFS on an implicit graph.</li>
</ul>

<div class="sticky mint">
  <span class="ttl">The whole chapter in one sentence</span>
  BFS needs three things: a start state, a way to list the next states of any
  state, and a way to remember which states it has already seen. A grid makes
  all three easy. Any problem that supplies them is the same problem in a
  different costume.
</div>

<p>
  Conventions used throughout: <code>grid[r][c]</code>, with <code>r</code>
  counting rows downward and <code>c</code> counting columns to the right;
  <code>rows = grid.length</code> and <code>cols = grid[0].length</code>; in
  the shortest-path examples <code>0</code> is an open cell and
  <code>1</code> is a wall unless a problem says otherwise.
</p>

<h3>Direction arrays and the bounds check</h3>
<p>
  Writing four copies of the same neighbour code, one per direction, is how
  typos get in. Put the four moves in an array of <code>[dr, dc]</code> pairs
  and loop. The loop body then exists once, and a change from four directions
  to eight is a change to the array, not to the algorithm.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A three by three block of cells with the middle cell labelled r, c and its four side neighbours labelled with their row and column offsets: up minus one zero, down plus one zero, left zero minus one, right zero plus one. The four diagonal cells are marked as not neighbours.">
    <g class="rough">
      <rect class="box" x="200" y="20" width="80" height="60" />
      <rect class="boxg" x="280" y="20" width="80" height="60" />
      <rect class="box" x="360" y="20" width="80" height="60" />
      <rect class="boxg" x="200" y="80" width="80" height="60" />
      <rect class="boxy" x="280" y="80" width="80" height="60" />
      <rect class="boxg" x="360" y="80" width="80" height="60" />
      <rect class="box" x="200" y="140" width="80" height="60" />
      <rect class="boxg" x="280" y="140" width="80" height="60" />
      <rect class="box" x="360" y="140" width="80" height="60" />
    </g>
    <text class="lbl" x="320" y="46" text-anchor="middle">(r-1, c)</text>
    <text class="sm" x="320" y="66" text-anchor="middle">up [-1, 0]</text>
    <text class="lbl" x="240" y="106" text-anchor="middle">(r, c-1)</text>
    <text class="sm" x="240" y="126" text-anchor="middle">left [0, -1]</text>
    <text class="lbl" x="320" y="106" text-anchor="middle">(r, c)</text>
    <text class="lbl" x="400" y="106" text-anchor="middle">(r, c+1)</text>
    <text class="sm" x="400" y="126" text-anchor="middle">right [0, 1]</text>
    <text class="lbl" x="320" y="166" text-anchor="middle">(r+1, c)</text>
    <text class="sm" x="320" y="186" text-anchor="middle">down [1, 0]</text>
    <text class="sm" x="240" y="55" text-anchor="middle">diagonal</text>
    <text class="sm" x="400" y="55" text-anchor="middle">diagonal</text>
    <text class="sm" x="240" y="175" text-anchor="middle">diagonal</text>
    <text class="sm" x="400" y="175" text-anchor="middle">diagonal</text>
    <text class="sm" x="20" y="235">row grows downward, column grows to the right; the diagonals join the picture only in the eight-direction variant</text>
  </svg>
  <figcaption>Four offsets generate every side neighbour. The corners are not neighbours unless a problem says diagonal moves are allowed.</figcaption>
</figure>
<pre><code>const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]]; <span class="c">// up, down, left, right as [dr, dc]</span>

function forEachNeighbor(grid, r, c, visit) {
  const rows = grid.length, cols = grid[0].length;
  for (const [dr, dc] of DIRS) {
    const nr = r + dr, nc = c + dc;
    if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue; <span class="c">// bounds BEFORE any grid[nr][nc]</span>
    visit(nr, nc);
  }
}</code></pre>
<p>
  The rest of the chapter writes that loop inline, because a callback adds
  noise to code you have to produce on a whiteboard. The order inside
  <code>DIRS</code> does not change any distance. It changes which of several
  equally short paths you find, and the order in which cells leave the queue.
</p>
<p>
  A cell is often stored as one number, <code>id = r * cols + c</code>, and
  recovered with <code>r = Math.floor(id / cols)</code> and
  <code>c = id % cols</code>. On a grid with 3 columns, cell
  <code>(2, 1)</code> is id 7. One number is cheaper to put in a
  <code>Set</code> or an array than a pair, and it is the right key for a
  <code>Map</code>, as the next warning shows.
</p>
<div class="warn">
  <span class="ttl">⚠ Five ways grid code goes wrong quietly</span>
  <b>Indexing before checking.</b> If <code>nr</code> is out of range,
  <code>grid[nr]</code> is <code>undefined</code> and <code>grid[nr][nc]</code>
  throws a <code>TypeError</code>. If only <code>nc</code> is out of range, it
  does not throw: <code>grid[0][5]</code> on a 2-column grid is
  <code>undefined</code>, and <code>undefined === 1</code> is false, so the
  phantom cell looks open. That bug returns plausible wrong answers.
  <b>Swapping rows and columns.</b> A square test grid hides it. Test on a
  2 by 5 grid.
  <b>Sharing one row.</b> <code>new Array(rows).fill(new Array(cols).fill(0))</code>
  fills every row with the same array, so writing <code>g[0][0] = 1</code>
  changes <code>g[1][0]</code> too. Build rows with
  <code>Array.from({ length: rows }, () =&gt; new Array(cols).fill(0))</code>.
  <b>Pairs as keys.</b> <code>new Set().add([1, 2]).has([1, 2])</code> is
  <code>false</code>, because arrays compare by identity. Use the number
  <code>r * cols + c</code> or a string.
  <b>An empty grid.</b> <code>grid[0].length</code> throws when
  <code>grid</code> is <code>[]</code>, so guard it when the input allows it.
</div>

<h3>BFS gives distances: the layer argument</h3>
<p>
  The task: the fewest moves from a start cell to a goal cell, moving up,
  down, left or right through open cells. DFS is the wrong tool. It follows
  one path to the end before trying another, so the first route it finds is
  whatever its direction order happened to prefer, and checking every route
  costs time that grows exponentially with the grid size.
</p>
<p>
  Derive the right method from the definition of distance. Exactly one cell is
  at distance 0: the start. A cell is at distance d + 1 exactly when it is not
  at a smaller distance and it touches a cell at distance d. So if you know all
  the cells at distance d, the next layer is every unseen neighbour of that
  layer. Computing layer by layer <em>is</em> BFS, and a queue is the natural
  way to keep the current layer and the one being built in order.
</p>
<p>
  Why a queue never mixes layers up: at every moment it holds some cells at
  distance d followed by some cells at distance d + 1, and nothing else. At
  the start it holds only the start cell. By the time the first cell at
  distance d is popped, every cell at distance d is already in the queue,
  because they were all appended while the cells at distance d − 1 were popped.
  So an unseen neighbour of a cell at distance d cannot have distance d or
  less; its distance is exactly d + 1, and it joins the back. That keeps the
  invariant. The consequence is the one you want: cells leave the queue in
  non-decreasing order of distance, so the first time any cell is discovered it
  is discovered through a shortest path, and the number you store for it is
  final. Nothing ever has to be corrected afterwards.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A four by five grid. The start in the top left holds 0 and the goal in the bottom right holds 7. Walls are red. Open cells show their BFS distance from the start: the top row reads 0, 1, 2, wall, 8; the second row 1, wall, 3, wall, 7; the third row 2, wall, 4, 5, 6; the bottom row 3, 4, 5, wall, 7.">
    <g class="rough">
      <rect class="boxg" x="60" y="20" width="80" height="52" />
      <rect class="box" x="140" y="20" width="80" height="52" />
      <rect class="box" x="220" y="20" width="80" height="52" />
      <rect class="boxr" x="300" y="20" width="80" height="52" />
      <rect class="box" x="380" y="20" width="80" height="52" />
      <rect class="box" x="60" y="72" width="80" height="52" />
      <rect class="boxr" x="140" y="72" width="80" height="52" />
      <rect class="box" x="220" y="72" width="80" height="52" />
      <rect class="boxr" x="300" y="72" width="80" height="52" />
      <rect class="box" x="380" y="72" width="80" height="52" />
      <rect class="box" x="60" y="124" width="80" height="52" />
      <rect class="boxr" x="140" y="124" width="80" height="52" />
      <rect class="box" x="220" y="124" width="80" height="52" />
      <rect class="box" x="300" y="124" width="80" height="52" />
      <rect class="box" x="380" y="124" width="80" height="52" />
      <rect class="box" x="60" y="176" width="80" height="52" />
      <rect class="box" x="140" y="176" width="80" height="52" />
      <rect class="box" x="220" y="176" width="80" height="52" />
      <rect class="boxr" x="300" y="176" width="80" height="52" />
      <rect class="boxy" x="380" y="176" width="80" height="52" />
    </g>
    <text class="lbl" x="100" y="52" text-anchor="middle">0</text>
    <text class="lbl" x="180" y="52" text-anchor="middle">1</text>
    <text class="lbl" x="260" y="52" text-anchor="middle">2</text>
    <text class="sm rd" x="340" y="51" text-anchor="middle">wall</text>
    <text class="lbl" x="420" y="52" text-anchor="middle">8</text>
    <text class="lbl" x="100" y="104" text-anchor="middle">1</text>
    <text class="sm rd" x="180" y="103" text-anchor="middle">wall</text>
    <text class="lbl" x="260" y="104" text-anchor="middle">3</text>
    <text class="sm rd" x="340" y="103" text-anchor="middle">wall</text>
    <text class="lbl" x="420" y="104" text-anchor="middle">7</text>
    <text class="lbl" x="100" y="156" text-anchor="middle">2</text>
    <text class="sm rd" x="180" y="155" text-anchor="middle">wall</text>
    <text class="lbl" x="260" y="156" text-anchor="middle">4</text>
    <text class="lbl" x="340" y="156" text-anchor="middle">5</text>
    <text class="lbl" x="420" y="156" text-anchor="middle">6</text>
    <text class="lbl" x="100" y="208" text-anchor="middle">3</text>
    <text class="lbl" x="180" y="208" text-anchor="middle">4</text>
    <text class="lbl" x="260" y="208" text-anchor="middle">5</text>
    <text class="sm rd" x="340" y="207" text-anchor="middle">wall</text>
    <text class="lbl" x="420" y="208" text-anchor="middle">7</text>
    <text class="sm gr" x="490" y="50">start (0, 0)</text>
    <text class="sm" x="490" y="200">goal (3, 4)</text>
    <text class="sm" x="490" y="120">number = distance from start</text>
  </svg>
  <figcaption>The distances BFS writes into <code>dist</code>. The cell at the top right is at distance 8 and is a dead end the search reaches last; the goal, at distance 7, is dequeued just before it.</figcaption>
</figure>

<pre><code>function shortestPath(grid, start, goal) {
  const rows = grid.length, cols = grid[0].length;
  const [sr, sc] = start, [gr, gc] = goal;
  if (grid[sr][sc] === 1 || grid[gr][gc] === 1) return -1; <span class="c">// start or goal inside a wall</span>

  const dist = Array.from({ length: rows }, () =&gt; new Array(cols).fill(-1)); <span class="c">// -1 = not seen yet</span>
  dist[sr][sc] = 0;
  const queue = [[sr, sc]];
  let head = 0; <span class="c">// read position: queue[head++] instead of queue.shift() (see the queue section)</span>

  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    if (r === gr &amp;&amp; c === gc) return dist[r][c];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (grid[nr][nc] === 1 || dist[nr][nc] !== -1) continue; <span class="c">// wall, or already has its final distance</span>
      dist[nr][nc] = dist[r][c] + 1; <span class="c">// marked NOW, at enqueue time</span>
      queue.push([nr, nc]);
    }
  }
  return -1; <span class="c">// the queue ran dry: the goal is not reachable</span>
}</code></pre>
<p>
  The <code>dist</code> matrix does two jobs. It stores the answer, and its
  <code>-1</code> is the "seen" flag, so there is no separate visited array.
  The sentinel is <code>-1</code> and not <code>0</code> because 0 is a real
  distance: the start cell has it.
</p>

<h4>Dry run: shortestPath on the grid in the figure, start (0, 0), goal (3, 4)</h4>
<table>
  <tr><th>Pop</th><th>Cell</th><th>dist</th><th>Newly enqueued (distance)</th><th>Queue after</th></tr>
  <tr><td>1</td><td>(0,0)</td><td>0</td><td>(1,0) 1, (0,1) 1</td><td>(1,0) (0,1)</td></tr>
  <tr><td>2</td><td>(1,0)</td><td>1</td><td>(2,0) 2</td><td>(0,1) (2,0)</td></tr>
  <tr><td>3</td><td>(0,1)</td><td>1</td><td>(0,2) 2</td><td>(2,0) (0,2)</td></tr>
  <tr><td>4</td><td>(2,0)</td><td>2</td><td>(3,0) 3</td><td>(0,2) (3,0)</td></tr>
  <tr><td>5</td><td>(0,2)</td><td>2</td><td>(1,2) 3</td><td>(3,0) (1,2)</td></tr>
  <tr><td>6</td><td>(3,0)</td><td>3</td><td>(3,1) 4</td><td>(1,2) (3,1)</td></tr>
  <tr><td>7</td><td>(1,2)</td><td>3</td><td>(2,2) 4</td><td>(3,1) (2,2)</td></tr>
  <tr><td>8</td><td>(3,1)</td><td>4</td><td>(3,2) 5</td><td>(2,2) (3,2)</td></tr>
  <tr><td>9</td><td>(2,2)</td><td>4</td><td>(2,3) 5</td><td>(3,2) (2,3)</td></tr>
  <tr><td>10</td><td>(3,2)</td><td>5</td><td>none: (3,3) is a wall, (2,2) is seen</td><td>(2,3)</td></tr>
  <tr><td>11</td><td>(2,3)</td><td>5</td><td>(2,4) 6</td><td>(2,4)</td></tr>
  <tr><td>12</td><td>(2,4)</td><td>6</td><td>(1,4) 7, (3,4) 7</td><td>(1,4) (3,4)</td></tr>
  <tr><td>13</td><td>(1,4)</td><td>7</td><td>(0,4) 8</td><td>(3,4) (0,4)</td></tr>
  <tr><td>14</td><td>(3,4)</td><td>7</td><td>goal popped: return 7</td><td>(0,4)</td></tr>
</table>
<p class="sub">
  Read the queue column: it never holds more than two different distances.
  After pop 8 it holds (2,2) at distance 4 and (3,2) at distance 5, and no
  third distance ever appears, exactly as the argument said.
</p>
<p>
  <b>Cost.</b> Each cell is enqueued at most once, because the
  <code>dist</code> check blocks a second entry, and each pop looks at four
  neighbours. That is O(R·C) time. The <code>dist</code> matrix and the queue
  are both O(R·C) space in the worst case. The goal test sits at the pop, not
  at the push, which is simplest and just as correct for BFS: the answer is the
  same either way, and testing at the push only stops a little earlier.
</p>
<ul>
  <li>If start equals goal and the cell is open, the answer is 0, and the code returns it on the first pop.</li>
  <li>If start or goal is a wall, the answer is -1 before any search begins. Decide this out loud; some statements guarantee it cannot happen.</li>
  <li>A goal that is open but walled in is found by the queue running dry. Returning -1 after the loop is the unreachable case, not an afterthought.</li>
</ul>

<h3>Visited on enqueue, not on dequeue: what goes wrong</h3>
<p>
  The graph chapter told you to mark a node as seen when you push it, not when
  you pop it. Here is exactly what that rule buys, measured on an open
  <code>n</code> by <code>n</code> grid searched from a corner. Three policies:
</p>
<pre><code>function queueEntriesMarkOnEnqueue(n) {
  const seen = Array.from({ length: n }, () =&gt; new Array(n).fill(false));
  seen[0][0] = true;
  const queue = [[0, 0]];
  let head = 0, pushes = 1;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= n || nc &lt; 0 || nc &gt;= n || seen[nr][nc]) continue;
      seen[nr][nc] = true; <span class="c">// the cell is claimed the moment it is queued</span>
      queue.push([nr, nc]);
      pushes++;
    }
  }
  return pushes;
}

function queueEntriesMarkOnDequeueGuarded(n) {
  const seen = Array.from({ length: n }, () =&gt; new Array(n).fill(false));
  const queue = [[0, 0]];
  let head = 0, pushes = 1;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    if (seen[r][c]) continue; <span class="c">// a duplicate entry: drop it on the way out</span>
    seen[r][c] = true;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= n || nc &lt; 0 || nc &gt;= n || seen[nr][nc]) continue;
      queue.push([nr, nc]); <span class="c">// the neighbour is not marked yet, so others can queue it too</span>
      pushes++;
    }
  }
  return pushes;
}

function queueEntriesMarkOnDequeueUnguarded(n) {
  const seen = Array.from({ length: n }, () =&gt; new Array(n).fill(false));
  const queue = [[0, 0]];
  let head = 0, pushes = 1;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    seen[r][c] = true; <span class="c">// no "already seen?" test before expanding</span>
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= n || nc &lt; 0 || nc &gt;= n || seen[nr][nc]) continue;
      queue.push([nr, nc]);
      pushes++;
    }
  }
  return pushes;
}</code></pre>
<table>
  <tr><th>n (cells = n²)</th><th>Mark on enqueue</th><th>Mark on dequeue, with the guard</th><th>Mark on dequeue, no guard</th></tr>
  <tr><td>3 (9)</td><td>9</td><td>13</td><td>19</td></tr>
  <tr><td>4 (16)</td><td>16</td><td>25</td><td>69</td></tr>
  <tr><td>5 (25)</td><td>25</td><td>41</td><td>251</td></tr>
  <tr><td>6 (36)</td><td>36</td><td>61</td><td>923</td></tr>
  <tr><td>8 (64)</td><td>64</td><td>113</td><td>12,869</td></tr>
  <tr><td>10 (100)</td><td>100</td><td>181</td><td>184,755</td></tr>
</table>
<p>
  Each column has a reason, and you should be able to give it.
</p>
<ul>
  <li>
    <b>Mark on enqueue:</b> a cell is claimed when it is queued, so it is
    queued once. The number of entries is the number of cells reached, at most
    R·C.
  </li>
  <li>
    <b>Mark on dequeue, with the guard:</b> still correct, because the second
    copy of a cell is thrown away when it comes out. But until a cell is
    popped, every neighbour that touches it can queue it again, so the queue
    holds up to four entries per cell (about two on this grid). On a general
    graph the bound is the sum of the degrees, 2E, instead of V, which is the
    difference between a queue the size of the nodes and a queue the size of
    the edges.
  </li>
  <li>
    <b>Mark on dequeue, no guard:</b> every copy of a cell is expanded, and
    every expansion queues that cell's neighbours again. On an open grid the
    number of copies of a cell is the number of shortest paths that reach it,
    which for the cell at row i, column j is C(i + j, i). The total for an
    n by n grid is C(2n, n) − 1, which is 184,755 at n = 10 and about 1.2 · 10¹⁷
    at n = 30. That is the case the phrase "can blow up badly" in the graph
    chapter was warning about.
  </li>
</ul>
<div class="warn">
  <span class="ttl">⚠ The same mistake corrupts counters, not only speed</span>
  Anything you update when you <em>discover</em> a cell, such as
  <code>fresh--</code> in Rotting Oranges, a visit counter, or a path count, is
  wrong when the same cell can be discovered twice. A decrement made at pop
  time, with no guard, runs once per copy and drives the counter below zero.
  Mark and update at the same moment: at the push.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I mark a cell as seen when I put
  it in the queue, not when I take it out. That way each cell is queued once,
  the queue never holds more than the cells reached, and a neighbour that two
  cells share cannot be added twice."
</div>

<h3>Recovering the path with parent pointers</h3>
<p>
  Often the problem wants the route and not just its length. Record, for each
  cell, the cell it was discovered from. Because a cell is discovered once, it
  has exactly one parent, and the parents form a tree rooted at the start. The
  route to any cell is the walk from that cell back to the root, read in
  reverse.
</p>
<pre><code>function shortestRoute(grid, start, goal) {
  const rows = grid.length, cols = grid[0].length;
  const id = (r, c) =&gt; r * cols + c;
  const [sr, sc] = start, [gr, gc] = goal;
  if (grid[sr][sc] === 1 || grid[gr][gc] === 1) return null;

  const parent = new Array(rows * cols).fill(-2); <span class="c">// -2 = unseen, -1 = "this is the start"</span>
  parent[id(sr, sc)] = -1;
  const queue = [id(sr, sc)];
  let head = 0;

  while (head &lt; queue.length &amp;&amp; parent[id(gr, gc)] === -2) { <span class="c">// stop once the goal has a parent</span>
    const cur = queue[head++];
    const r = Math.floor(cur / cols), c = cur % cols;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (grid[nr][nc] === 1 || parent[id(nr, nc)] !== -2) continue;
      parent[id(nr, nc)] = cur;
      queue.push(id(nr, nc));
    }
  }
  if (parent[id(gr, gc)] === -2) return null;

  const route = [];
  for (let at = id(gr, gc); at !== -1; at = parent[at]) {
    route.push([Math.floor(at / cols), at % cols]);
  }
  return route.reverse(); <span class="c">// built goal-first, so flip it</span>
}</code></pre>
<h4>Dry run: walking back from the goal (cols = 5, so id = 5r + c)</h4>
<table>
  <tr><th>at (id)</th><th>cell</th><th>parent[at]</th><th>route so far (goal first)</th></tr>
  <tr><td>19</td><td>(3,4)</td><td>14</td><td>(3,4)</td></tr>
  <tr><td>14</td><td>(2,4)</td><td>13</td><td>(3,4) (2,4)</td></tr>
  <tr><td>13</td><td>(2,3)</td><td>12</td><td>(3,4) (2,4) (2,3)</td></tr>
  <tr><td>12</td><td>(2,2)</td><td>7</td><td>... (2,2)</td></tr>
  <tr><td>7</td><td>(1,2)</td><td>2</td><td>... (1,2)</td></tr>
  <tr><td>2</td><td>(0,2)</td><td>1</td><td>... (0,2)</td></tr>
  <tr><td>1</td><td>(0,1)</td><td>0</td><td>... (0,1)</td></tr>
  <tr><td>0</td><td>(0,0)</td><td>-1</td><td>... (0,0), then the loop stops</td></tr>
</table>
<p class="sub">
  Reversed, that is (0,0) (0,1) (0,2) (1,2) (2,2) (2,3) (2,4) (3,4): eight
  cells, seven moves, matching the distance of 7. When several routes tie for
  shortest, you get the one the direction order discovered first. This grid has
  exactly one.
</p>
<div class="warn">
  <span class="ttl">⚠ Sentinels that collide with real ids</span>
  The start cell has id 0. If an unseen cell is marked <code>0</code> in
  <code>parent</code>, "unseen" and "the start" are the same value, and either
  the start gets revisited or its neighbours are treated as seen. Use values
  that cannot be a cell id: here -2 for unseen and -1 for "no parent".
</div>

<h3>Counting layers instead of storing distances</h3>
<p>
  If you only want the length, and not a distance for every cell, process the
  queue one layer at a time and count the layers. The simplest way to write it
  is two arrays: the current layer and the next one.
</p>
<pre><code>function stepsByLayers(grid, start, goal) {
  const rows = grid.length, cols = grid[0].length;
  const [sr, sc] = start, [gr, gc] = goal;
  if (grid[sr][sc] === 1 || grid[gr][gc] === 1) return -1;

  const seen = Array.from({ length: rows }, () =&gt; new Array(cols).fill(false));
  seen[sr][sc] = true;
  let layer = [[sr, sc]];
  let steps = 0; <span class="c">// the layer in hand is at distance "steps"</span>

  while (layer.length &gt; 0) {
    const next = [];
    for (const [r, c] of layer) {
      if (r === gr &amp;&amp; c === gc) return steps;
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
        if (grid[nr][nc] === 1 || seen[nr][nc]) continue;
        seen[nr][nc] = true;
        next.push([nr, nc]);
      }
    }
    layer = next;
    steps++; <span class="c">// the next layer is one move further out</span>
  }
  return -1;
}</code></pre>
<p>
  The layer variable is also the right tool when a problem counts time in
  rounds, as Rotting Oranges does. The one thing to settle before you write it
  is what the start is worth. A problem that counts moves starts at 0. A
  problem that counts the cells on the path, or the words in a sequence, starts
  at 1. Most off-by-one answers in this chapter's problems come from not
  deciding that first.
</p>
<table>
  <tr><th>Problem</th><th>Counts</th><th>Start is worth</th></tr>
  <tr><td>Fewest moves between two cells</td><td>moves</td><td>0</td></tr>
  <tr><td>Shortest path in a binary matrix</td><td>cells on the path</td><td>1</td></tr>
  <tr><td>Word ladder</td><td>words in the sequence</td><td>1</td></tr>
  <tr><td>Open the lock, minimum genetic mutation, snakes and ladders</td><td>moves</td><td>0</td></tr>
  <tr><td>Rotting oranges</td><td>minutes, that is, layers that rotted something</td><td>0</td></tr>
</table>

<h3>A queue without the O(n) shift</h3>
<p>
  Every BFS above reads the queue with <code>queue[head++]</code>. The
  alternative, <code>queue.shift()</code>, is what most people type first. The
  language defines it as removing the first element and then moving every
  remaining element down one index, which is O(n) per call. Engines may speed
  that up in some situations, but a chapter on complexity cannot rely on an
  optimisation it cannot see, and the cost shows up at exactly the sizes that
  grid problems reach. Measure it:
</p>
<pre><code>function drainWithShift(n) {
  const items = Array.from({ length: n }, (_, i) =&gt; i);
  const begin = performance.now();
  while (items.length &gt; 0) items.shift();
  return performance.now() - begin;
}

function drainWithHead(n) {
  const items = Array.from({ length: n }, (_, i) =&gt; i);
  const begin = performance.now();
  let head = 0;
  while (head &lt; items.length) head++;
  return performance.now() - begin;
}</code></pre>
<p>
  On the machine used to check this chapter, in Node 24, draining 10,000
  numbers with <code>shift</code> took a millisecond or two. Draining 100,000
  took about a second, and 400,000 took about twenty seconds, while the head
  index took about a millisecond each time. Your numbers will differ. The
  lesson is the growth: multiply the size by four and the shift version got
  many times slower, the direction that a quadratic cost (sixteen times) predicts. A grid of 1000 by 1000 puts a million cells
  through the queue.
</p>
<p>
  The head index has one cost: the array never shrinks, so it ends up holding
  every cell ever queued. For a single BFS over a grid that is at most R·C
  entries, which you were paying for in the <code>dist</code> matrix anyway. For
  a long-running queue that keeps receiving work, wrap the idea in a small
  class that drops the consumed prefix from time to time:
</p>
<pre><code>class Queue {
  constructor() {
    this.items = [];
    this.head = 0;
  }
  get size() {
    return this.items.length - this.head;
  }
  enqueue(value) {
    this.items.push(value);
  }
  dequeue() {
    if (this.head === this.items.length) return undefined;
    const value = this.items[this.head];
    this.items[this.head] = undefined; <span class="c">// let the consumed value be collected</span>
    this.head++;
    if (this.head &gt;= 32 &amp;&amp; this.head * 2 &gt;= this.items.length) {
      this.items = this.items.slice(this.head); <span class="c">// copy only the live half</span>
      this.head = 0;
    }
    return value;
  }
}</code></pre>
<p class="sub">
  Every operation is O(1) amortised. The <code>slice</code> runs only when the
  consumed prefix is at least half of the array, so it copies no more elements
  than the number of dequeues since the last copy, and each dequeue pays for one
  element of copying. The array never holds more than about twice the live
  elements plus 32.
</p>
<p>
  The other common way to avoid the cost, as in <code>stepsByLayers</code>, is
  to keep two arrays and swap them each round. If an interviewer pushes on
  <code>shift</code>, the honest answer has two parts: say that it is O(n) by
  definition, and that you use a read index so the BFS stays O(V + E). The
  <a href="/dsa/dsa-stacks-queues">stacks and queues chapter</a> covers the
  deque you need when you must also remove from the back.
</p>

<h3>Multi-source BFS: start from every source at once</h3>
<p>
  The task: for every cell, the distance to the nearest gate. The slow idea is
  to run one BFS from every gate and keep the minimum for each cell, which costs
  O(G·R·C) for G gates. The fast idea comes from the layer argument. Nothing in
  that argument needed the first layer to contain one cell. If you put every
  gate in the queue at distance 0 before the loop starts, the queue still holds
  d followed by d + 1, the layers still grow outward one step at a time, and
  every cell is first reached by whichever gate is nearest to it. One BFS
  answers all the questions: O(R·C) time, no matter how many gates there are.
</p>
<p>
  Another way to see it: add an imaginary node joined to every gate by an edge
  of length 0. A normal BFS from that node starts with all the gates, exactly
  as if they were one source.
</p>
<pre><code>function wallsAndGates(rooms) {
  const INF = 2147483647; <span class="c">// an empty room not yet reached; -1 is a wall, 0 is a gate</span>
  const rows = rooms.length;
  if (rows === 0) return rooms;
  const cols = rooms[0].length;

  const queue = [];
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      if (rooms[r][c] === 0) queue.push([r, c]); <span class="c">// every gate starts in the queue</span>
    }
  }

  let head = 0;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (rooms[nr][nc] !== INF) continue; <span class="c">// walls, gates and reached rooms are all skipped</span>
      rooms[nr][nc] = rooms[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return rooms;
}</code></pre>
<p>
  Here the grid itself is the seen marker: a cell that still holds
  <code>INF</code> is unseen, and writing a distance into it claims it. A room
  that no gate can reach keeps <code>INF</code>, which is the answer the problem
  asks for. The 01 Matrix problem is the same code with the roles named
  differently. Every <code>0</code> is a source, and the answer for each
  <code>1</code> is the distance to the nearest zero. This version leaves the
  input alone and returns a new matrix:
</p>
<pre><code>function updateMatrix(mat) {
  const rows = mat.length, cols = mat[0].length;
  const dist = Array.from({ length: rows }, () =&gt; new Array(cols).fill(-1));
  const queue = [];
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      if (mat[r][c] === 0) {
        dist[r][c] = 0;
        queue.push([r, c]);
      }
    }
  }

  let head = 0;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (dist[nr][nc] !== -1) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return dist;
}</code></pre>
<p>
  Rotting Oranges asks for time instead of distance: all rotten oranges spread
  at once, and each minute every fresh orange next to a rotten one rots. The
  minute count is the number of layers, so this one is written with the layer
  arrays and a count of fresh oranges left:
</p>
<pre><code>function orangesRotting(grid) {
  const rows = grid.length, cols = grid[0].length;
  let layer = [];
  let fresh = 0;
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      if (grid[r][c] === 2) layer.push([r, c]);
      else if (grid[r][c] === 1) fresh++;
    }
  }

  let minutes = 0;
  while (layer.length &gt; 0 &amp;&amp; fresh &gt; 0) { <span class="c">// stop the moment nothing fresh is left</span>
    const next = [];
    for (const [r, c] of layer) {
      for (const [dr, dc] of DIRS) {
        const nr = r + dr, nc = c + dc;
        if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
        if (grid[nr][nc] !== 1) continue;
        grid[nr][nc] = 2; <span class="c">// rot it now, so no other orange can queue it again</span>
        fresh--;
        next.push([nr, nc]);
      }
    }
    layer = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1; <span class="c">// leftover fresh oranges are unreachable</span>
}</code></pre>
<h4>Dry run: orangesRotting on [[2,1,1],[1,1,0],[0,1,1]]</h4>
<table>
  <tr><th>Minute</th><th>Layer expanded</th><th>Oranges that rot</th><th>Fresh left</th></tr>
  <tr><td>0</td><td>start</td><td>layer = (0,0); six fresh oranges</td><td>6</td></tr>
  <tr><td>1</td><td>(0,0)</td><td>(1,0), (0,1)</td><td>4</td></tr>
  <tr><td>2</td><td>(1,0), (0,1)</td><td>(1,1), (0,2)</td><td>2</td></tr>
  <tr><td>3</td><td>(1,1), (0,2)</td><td>(2,1)</td><td>1</td></tr>
  <tr><td>4</td><td>(2,1)</td><td>(2,2)</td><td>0, loop ends, return 4</td></tr>
</table>
<ul>
  <li>The condition <code>fresh &gt; 0</code> in the loop is what keeps <code>minutes</code> honest. Without it the loop runs one more time on a layer that rots nothing, and the answer is 1 too big.</li>
  <li>If there are no fresh oranges at the start, the loop never runs and the answer is 0, as the problem requires.</li>
  <li>If a fresh orange is walled off, the layers run out before <code>fresh</code> reaches 0, and the final line returns -1.</li>
  <li>All sources are queued <em>before</em> the loop. Starting a BFS from one source and adding the others as you meet them gives layers that no longer line up with time.</li>
  <li>This version writes into the input grid. Ask whether you may; if not, copy it first, or keep a separate seen array.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Running a BFS from each gate would
  cost gates times cells. Instead I put all the gates in the queue at distance
  zero and run one BFS. Distance layers still grow outward together, so each
  room is reached first by its nearest gate, and the whole thing is linear in
  the grid."
</div>

<h3>Flood fill: DFS or BFS, and what the stack costs</h3>
<p>
  Flood fill paints the connected region of one colour that contains a given
  cell. It is the same walk as the traversal chapter, with the grid itself as
  the visited marker: painting a cell changes its colour away from the old one,
  so it will not be painted twice. Here it is both ways.
</p>
<pre><code>function floodFillDfs(image, sr, sc, color) {
  const rows = image.length, cols = image[0].length;
  const old = image[sr][sc];
  if (old === color) return image; <span class="c">// without this line the paint never changes anything and the recursion never ends</span>

  function paint(r, c) {
    if (r &lt; 0 || r &gt;= rows || c &lt; 0 || c &gt;= cols || image[r][c] !== old) return;
    image[r][c] = color;
    paint(r - 1, c);
    paint(r + 1, c);
    paint(r, c - 1);
    paint(r, c + 1);
  }
  paint(sr, sc);
  return image;
}

function floodFillBfs(image, sr, sc, color) {
  const rows = image.length, cols = image[0].length;
  const old = image[sr][sc];
  if (old === color) return image;

  image[sr][sc] = color; <span class="c">// paint on enqueue: painting IS the visited mark</span>
  const queue = [[sr, sc]];
  let head = 0;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (image[nr][nc] !== old) continue;
      image[nr][nc] = color;
      queue.push([nr, nc]);
    }
  }
  return image;
}

function floodFillStack(image, sr, sc, color) {
  const rows = image.length, cols = image[0].length;
  const old = image[sr][sc];
  if (old === color) return image;

  image[sr][sc] = color;
  const stack = [[sr, sc]];
  while (stack.length &gt; 0) {
    const [r, c] = stack.pop(); <span class="c">// pop() from the end is O(1); this is DFS with a stack you own</span>
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (image[nr][nc] !== old) continue;
      image[nr][nc] = color;
      stack.push([nr, nc]);
    }
  }
  return image;
}</code></pre>
<p>
  All three do O(R·C) work and produce the same image. They differ in what they
  hold while they work. The recursive one holds a call frame per cell on the
  current path. A depth-first walk through an open region does not go straight
  and come back; it snakes. On an open 100 by 100 image, from the top-left
  corner with the direction order above, the recursive version overflows the
  stack in Node 24, and a 50 by 50 image is fine. A plain function that only
  calls itself overflowed at 10,373 frames on the same run, and a function with
  more locals overflows sooner. The limit depends on the engine and the frame
  size, so treat "about ten thousand" as the order of magnitude and not as a
  promise.
</p>
<p>
  The queue version has no such limit, because the queue lives on the heap. On
  open images measured here the queue held at most 300 cells for a 300 by 300
  image painted from a corner, 599 from the centre, and 1000 for a 1000 by 1000
  image painted from a corner. That is roughly the length of the frontier, which
  is much less than the number of cells, though a maze-like region can make it
  larger. The explicit stack has the same freedom from the call-stack limit and
  the same O(R·C) bound in the worst case.
</p>
<div class="warn">
  <span class="ttl">⚠ Flood fill pitfalls</span>
  <b>Painting the same colour.</b> If the new colour equals the old one, the
  paint is invisible, so no cell ever stops matching, and the recursion never
  returns. Check <code>old === color</code> first.
  <b>Deep recursion.</b> A recursive flood fill on a large solid region is a
  stack overflow waiting for the biggest test. Say so, and offer the queue or
  stack version.
  <b>Painting at pop time.</b> In the BFS version the colour is written when a
  cell is queued. Waiting until it is popped brings back the duplicate-entry
  problem from the earlier section.
  <b>Mutating the input.</b> Fine for flood fill, which is defined as a change
  to the image. For problems that only count, ask before writing into the
  caller's grid.
</div>
<p>
  Counting regions is flood fill in a loop: scan every cell, and each time you
  meet an unseen land cell, start a fill, add one to the count, and let the fill
  claim the whole island. The same code handles both kinds of adjacency, because
  the directions are a parameter:
</p>
<pre><code>function countIslands(grid, dirs = DIRS) {
  const rows = grid.length, cols = grid[0].length;
  const seen = Array.from({ length: rows }, () =&gt; new Array(cols).fill(false));
  let islands = 0;

  for (let r0 = 0; r0 &lt; rows; r0++) {
    for (let c0 = 0; c0 &lt; cols; c0++) {
      if (grid[r0][c0] !== "1" || seen[r0][c0]) continue;
      islands++; <span class="c">// an unseen land cell is a new island</span>
      seen[r0][c0] = true;
      const queue = [[r0, c0]];
      let head = 0;
      while (head &lt; queue.length) {
        const [r, c] = queue[head++];
        for (const [dr, dc] of dirs) {
          const nr = r + dr, nc = c + dc;
          if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
          if (grid[nr][nc] !== "1" || seen[nr][nc]) continue;
          seen[nr][nc] = true;
          queue.push([nr, nc]);
        }
      }
    }
  }
  return islands;
}</code></pre>
<p class="sub">
  It uses a <code>seen</code> matrix so the caller's grid is untouched, and it
  compares to the string <code>"1"</code> because that is how the classic
  problem gives its input. Check the element type in your problem: comparing
  <code>"1"</code> to <code>1</code> is the usual reason such a solution finds
  zero islands. Each cell is queued at most once, so the time is O(R·C) and the
  extra space is O(R·C).
</p>
<p>
  Choosing between the versions is not about speed. If you need distances, use
  BFS. If you need only membership or an area, either works, and the recursive
  one is the shortest to write, which is why many interviewers accept it as long
  as you name the depth risk and know the fix.
</p>

<h3>Eight directions and other moves</h3>
<p>
  Diagonal moves change only the direction array. Rather than type eight pairs,
  generate them from the nine combinations of -1, 0 and 1 and drop the one that
  does not move:
</p>
<pre><code>const DIRS8 = [];
for (let dr = -1; dr &lt;= 1; dr++) {
  for (let dc = -1; dc &lt;= 1; dc++) {
    if (dr !== 0 || dc !== 0) DIRS8.push([dr, dc]);
  }
}

function shortestPathBinaryMatrix(grid) {
  const n = grid.length;
  if (grid[0][0] === 1 || grid[n - 1][n - 1] === 1) return -1;

  const dist = Array.from({ length: n }, () =&gt; new Array(n).fill(0)); <span class="c">// 0 = unseen, because the start counts as 1</span>
  dist[0][0] = 1; <span class="c">// the answer counts cells, so the start is cell number 1</span>
  const queue = [[0, 0]];
  let head = 0;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    if (r === n - 1 &amp;&amp; c === n - 1) return dist[r][c];
    for (const [dr, dc] of DIRS8) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= n || nc &lt; 0 || nc &gt;= n) continue;
      if (grid[nr][nc] === 1 || dist[nr][nc] !== 0) continue;
      dist[nr][nc] = dist[r][c] + 1;
      queue.push([nr, nc]);
    }
  }
  return -1;
}</code></pre>
<p>
  The algorithm is unchanged. Time is O(8·R·C), which is O(R·C). Three
  details matter. First, every move costs one, so a diagonal step counts the
  same as a side step. BFS is only correct when all moves cost the same. If a
  diagonal costs more, the layers stop meaning "d moves" and you need Dijkstra's
  algorithm from the <a href="/dsa/dsa-advanced-graph-algorithms">advanced graph
  chapter</a>. Second, the problem decides whether a path may slip diagonally
  between two walls that touch at a corner. The classic statement allows it; ask
  when it is not stated. Third, the same array switches island counting from
  4-connected to 8-connected, as the <code>dirs</code> parameter above shows.
</p>
<p>
  Other move sets are other arrays or other neighbour functions, and BFS does
  not care:
</p>
<table>
  <tr><th>Moves</th><th>Neighbours of (r, c)</th><th>Watch for</th></tr>
  <tr><td>Chess knight</td><td>(r ± 1, c ± 2) and (r ± 2, c ± 1): eight offsets</td><td>on an unbounded board, limit the search window or use symmetry; check the bounds the problem gives</td></tr>
  <tr><td>Slide until a wall (a rolling ball)</td><td>the cell where the ball stops, one per direction</td><td>one move is a whole slide, so the cost of a move is still 1 only if the problem counts slides, not cells</td></tr>
  <tr><td>Wrap-around board</td><td>((r + dr + rows) % rows, (c + dc + cols) % cols)</td><td>a modulo of a negative number is negative in JavaScript; add rows (or cols) before the remainder</td></tr>
  <tr><td>Jump k cells in a line</td><td>(r + k·dr, c + k·dc) for each allowed k</td><td>a larger branching factor, so the cost is R·C times the number of jumps</td></tr>
</table>

<h3>Reverse from the borders</h3>
<p>
  Some questions ask about every cell: which cells can send water to both
  oceans, which regions are completely surrounded. The direct way to answer
  such a question is to start a search from each cell and see where it ends up.
  That is a search of up to R·C cells, repeated R·C times: O(R²·C²).
</p>
<p>
  The trick is to turn the question around. Water in Pacific Atlantic Water
  Flow moves from a cell to a neighbour that is not higher. A cell reaches the
  Pacific exactly when a non-increasing path leads from it to the top or left
  edge. Read that path backward and it is a non-<em>decreasing</em> path from
  the edge to the cell. So instead of asking, for each cell, "can it reach the
  edge?", start at the edge cells and ask once, "which cells can be reached by
  climbing?" That is a multi-source BFS from the whole border, with the
  neighbour rule reversed. Do it once for each ocean and keep the cells that
  appear in both.
</p>
<pre><code>function reachFrom(heights, starts) {
  const rows = heights.length, cols = heights[0].length;
  const seen = Array.from({ length: rows }, () =&gt; new Array(cols).fill(false));
  const queue = [];
  for (const [r, c] of starts) {
    if (!seen[r][c]) {
      seen[r][c] = true;
      queue.push([r, c]);
    }
  }

  let head = 0;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (seen[nr][nc] || heights[nr][nc] &lt; heights[r][c]) continue; <span class="c">// reversed: only climb or stay level</span>
      seen[nr][nc] = true;
      queue.push([nr, nc]);
    }
  }
  return seen;
}

function pacificAtlantic(heights) {
  const rows = heights.length, cols = heights[0].length;
  const pacificEdge = [], atlanticEdge = [];
  for (let r = 0; r &lt; rows; r++) {
    pacificEdge.push([r, 0]);
    atlanticEdge.push([r, cols - 1]);
  }
  for (let c = 0; c &lt; cols; c++) {
    pacificEdge.push([0, c]);
    atlanticEdge.push([rows - 1, c]);
  }
  const pacific = reachFrom(heights, pacificEdge);
  const atlantic = reachFrom(heights, atlanticEdge);

  const both = [];
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      if (pacific[r][c] &amp;&amp; atlantic[r][c]) both.push([r, c]);
    }
  }
  return both;
}</code></pre>
<h4>Dry run: the classic 5 by 5 example</h4>
<table>
  <tr><th></th><th>c = 0</th><th>c = 1</th><th>c = 2</th><th>c = 3</th><th>c = 4</th></tr>
  <tr><th>r = 0</th><td>1</td><td>2</td><td>2</td><td>3</td><td>5</td></tr>
  <tr><th>r = 1</th><td>3</td><td>2</td><td>3</td><td>4</td><td>4</td></tr>
  <tr><th>r = 2</th><td>2</td><td>4</td><td>5</td><td>3</td><td>1</td></tr>
  <tr><th>r = 3</th><td>6</td><td>7</td><td>1</td><td>4</td><td>5</td></tr>
  <tr><th>r = 4</th><td>5</td><td>1</td><td>1</td><td>2</td><td>4</td></tr>
</table>
<p class="sub">Heights. Below, P marks a cell the Pacific search reaches, A one the Atlantic search reaches, PA both, and a dot neither.</p>
<table>
  <tr><th></th><th>c = 0</th><th>c = 1</th><th>c = 2</th><th>c = 3</th><th>c = 4</th></tr>
  <tr><th>r = 0</th><td>P</td><td>P</td><td>P</td><td>P</td><td><b>PA</b></td></tr>
  <tr><th>r = 1</th><td>P</td><td>P</td><td>P</td><td><b>PA</b></td><td><b>PA</b></td></tr>
  <tr><th>r = 2</th><td>P</td><td>P</td><td><b>PA</b></td><td>A</td><td>A</td></tr>
  <tr><th>r = 3</th><td><b>PA</b></td><td><b>PA</b></td><td>A</td><td>A</td><td>A</td></tr>
  <tr><th>r = 4</th><td><b>PA</b></td><td>A</td><td>A</td><td>A</td><td>A</td></tr>
</table>
<p class="sub">
  The seven cells marked PA are the answer: (0,4), (1,3), (1,4), (2,2), (3,0),
  (3,1) and (4,0). Take (2,2), height 5. The Pacific search reaches it by
  climbing from (2,0) at height 2 to (2,1) at 4 to (2,2) at 5. The Atlantic
  search reaches it from the bottom row, climbing from (4,2) at height 1 to
  (3,2) at 1 to (2,2) at 5. Both searches mark it, so water on (2,2) can flow
  to either ocean. Each search is one BFS, so the total is O(R·C).</p>
<div class="warn">
  <span class="ttl">⚠ Pitfalls when you search backward</span>
  <b>Reverse the inequality as well as the direction.</b> Forward, water moves
  to a neighbour that is not higher. Backward, the search moves to a neighbour
  that is not <em>lower</em>. Keeping the forward test finds the wrong cells and
  usually still returns something plausible.
  <b>Use two <code>seen</code> arrays.</b> A shared one stops the second search
  at the cells the first one claimed.
  <b>Corners belong to both borders.</b> The top-right and bottom-left cells
  touch both oceans, and each search must start from them. The
  <code>if (!seen[r][c])</code> check lets a start cell appear twice in a list
  without being queued twice.
  <b>Level cells count.</b> Equal heights can flow either way, so the test is
  <code>&lt;</code>, not <code>&lt;=</code>.
</div>
<p>
  Surrounded Regions has the same shape. Given a board of <code>"X"</code> and
  <code>"O"</code>, flip every <code>"O"</code> region that is completely
  surrounded by <code>"X"</code>. Asking of each region "is it enclosed?" needs
  a search per region and a way to decide, and that is awkward. Ask the
  reverse: an <code>"O"</code> survives exactly when it is connected to an
  <code>"O"</code> on the border. So mark everything reachable from a border
  <code>"O"</code> as safe, and flip what is left.
</p>
<pre><code>function solveSurrounded(board) {
  const rows = board.length, cols = board[0].length;
  const queue = [];
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      const onBorder = r === 0 || r === rows - 1 || c === 0 || c === cols - 1;
      if (onBorder &amp;&amp; board[r][c] === "O") {
        board[r][c] = "S"; <span class="c">// S = safe: connected to the border</span>
        queue.push([r, c]);
      }
    }
  }

  let head = 0;
  while (head &lt; queue.length) {
    const [r, c] = queue[head++];
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      if (board[nr][nc] !== "O") continue;
      board[nr][nc] = "S";
      queue.push([nr, nc]);
    }
  }

  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      if (board[r][c] === "O") board[r][c] = "X"; <span class="c">// an O nobody marked is enclosed</span>
      else if (board[r][c] === "S") board[r][c] = "O"; <span class="c">// restore the safe ones</span>
    }
  }
  return board;
}</code></pre>
<p class="sub">
  On the board X X X X / X O O X / X X O X / X O X X, the only border
  <code>"O"</code> is the one at row 3, column 1, and it has no
  <code>"O"</code> neighbours. The three <code>"O"</code> cells in the middle
  become <code>"X"</code>, and the border one stays. Note the order of the
  three passes: marking must finish before any flip, because a flip made while
  you are still marking could cut off a region the search has not reached yet.
  A third marker value is what lets one pass tell "untouched" from "safe".
</p>
<p>
  The recognition rule: when the question is about the cells that can, or
  cannot, get out to the boundary, search from the boundary inward instead.
  Counting enclaves, and finding the cells a flood cannot reach, fit the same
  frame.
</p>

<h3>State-space BFS: the graph lives in your head</h3>
<p>
  BFS never needed a grid. It needs states, a rule for the next states, and a
  test for the goal. A <b>state</b> is whatever fully describes where you are,
  and <b>fewest moves</b> becomes a shortest path in a graph that you never
  write down. The generic version takes those three pieces as arguments:
</p>
<pre><code>function bfsDistance(start, isGoal, nextStates) {
  const dist = new Map([[start, 0]]);
  const queue = [start];
  let head = 0;
  while (head &lt; queue.length) {
    const state = queue[head++];
    if (isGoal(state)) return dist.get(state);
    for (const next of nextStates(state)) {
      if (dist.has(next)) continue; <span class="c">// the Map is both the distance table and the seen set</span>
      dist.set(next, dist.get(state) + 1);
      queue.push(next);
    }
  }
  return -1;
}</code></pre>
<p>
  One rule makes it work: the state must be a primitive that compares by value,
  such as a string or a number. A state held in an array or object would be
  compared by identity, and the seen check would never match. If the natural
  state is a tuple, turn it into a string or a number.
</p>

<h4>Open the lock</h4>
<p>
  A lock has four wheels, each with the digits 0 to 9, starting at
  <code>"0000"</code>. One move turns one wheel by one step, up or down, and 9
  wraps to 0. Some combinations are dead ends: reaching one jams the lock.
  Return the fewest moves to the target, or -1. The state is the four-character
  string. There are 10,000 states, each with 8 neighbours, so the whole graph
  has 80,000 directed edges and BFS is cheap. A dead end is simply a state that
  is never offered as a neighbour.
</p>
<pre><code>function openLock(deadends, target) {
  const dead = new Set(deadends);
  if (dead.has("0000")) return -1; <span class="c">// the start itself is jammed</span>
  return bfsDistance(
    "0000",
    (state) =&gt; state === target,
    (state) =&gt; {
      const out = [];
      for (let i = 0; i &lt; 4; i++) {
        const digit = Number(state[i]);
        for (const turn of [1, 9]) { <span class="c">// +1 and -1 mod 10, written as +1 and +9</span>
          const next = state.slice(0, i) + ((digit + turn) % 10) + state.slice(i + 1);
          if (!dead.has(next)) out.push(next);
        }
      }
      return out;
    }
  );
}</code></pre>
<p class="sub">
  Strings are immutable in JavaScript, so a changed wheel is built with
  <code>slice</code> around it. If the target is a dead end the search never
  offers it and the answer is -1. If the target is <code>"0000"</code> and the
  start is not dead, the answer is 0.
</p>

<h4>Minimum genetic mutation</h4>
<p>
  A gene is a string over A, C, G and T. A mutation changes one letter, and a
  mutated gene is allowed only if it is in the bank. Return the fewest
  mutations from the start gene to the end gene, or -1. The state is the gene.
  The next states are the one-letter changes that appear in the bank. The
  length is fixed (8 in the original problem), so each state has at most 3 times
  the length of candidates.
</p>
<pre><code>function minMutation(startGene, endGene, bank) {
  if (startGene === endGene) return 0;
  const valid = new Set(bank);
  if (!valid.has(endGene)) return -1;
  return bfsDistance(
    startGene,
    (gene) =&gt; gene === endGene,
    (gene) =&gt; {
      const out = [];
      for (let i = 0; i &lt; gene.length; i++) {
        for (const letter of "ACGT") {
          if (letter === gene[i]) continue;
          const next = gene.slice(0, i) + letter + gene.slice(i + 1);
          if (valid.has(next)) out.push(next);
        }
      }
      return out;
    }
  );
}</code></pre>

<h4>Snakes and ladders</h4>
<p>
  An n by n board has squares numbered 1 to n² in a zig-zag, starting at the
  bottom-left corner: the bottom row runs left to right, the next row up runs
  right to left, and so on. From square s you roll 1 to 6 and land on s + roll,
  if that is at most n². If the landing square holds a snake or a ladder, you
  are carried to its far end, and you do not follow a second one from there.
  Return the fewest rolls to reach square n², or -1. The state is the square
  you stand on after any jump. The next states are the six landings.
</p>
<p>
  The only hard part is turning a square number into a cell of the 2D array.
  Count rows from the bottom: row-from-bottom is <code>Math.floor((s - 1) / n)</code>,
  the offset along that row is <code>(s - 1) % n</code>, and every second row
  runs the other way.
</p>
<pre><code>function snakesAndLadders(board) {
  const n = board.length, last = n * n;

  function cellOf(square) {
    const fromBottom = Math.floor((square - 1) / n);
    const offset = (square - 1) % n;
    const r = n - 1 - fromBottom;
    const c = fromBottom % 2 === 0 ? offset : n - 1 - offset; <span class="c">// odd rows from the bottom run right to left</span>
    return [r, c];
  }

  const dist = new Array(last + 1).fill(-1);
  dist[1] = 0;
  const queue = [1];
  let head = 0;
  while (head &lt; queue.length) {
    const square = queue[head++];
    if (square === last) return dist[square];
    for (let roll = 1; roll &lt;= 6 &amp;&amp; square + roll &lt;= last; roll++) {
      const [r, c] = cellOf(square + roll);
      const landing = board[r][c] === -1 ? square + roll : board[r][c]; <span class="c">// one jump, not a chain</span>
      if (dist[landing] !== -1) continue;
      dist[landing] = dist[square] + 1;
      queue.push(landing);
    }
  }
  return -1;
}</code></pre>
<h4>Dry run: the 6 by 6 board with a ladder 2 → 15, a ladder 14 → 35 and a snake 17 → 13</h4>
<table>
  <tr><th>Square</th><th>1</th><th>6</th><th>7</th><th>12</th><th>13</th><th>36</th></tr>
  <tr><th>Cell (r, c)</th><td>(5,0)</td><td>(5,5)</td><td>(4,5)</td><td>(4,0)</td><td>(3,0)</td><td>(0,0)</td></tr>
</table>
<p class="sub">
  Square 7 sits above square 6, and square 12 sits above square 1: the second row
  from the bottom runs right to left.
</p>
<table>
  <tr><th>Rolls so far</th><th>States first reached in this layer</th></tr>
  <tr><td>0</td><td>1</td></tr>
  <tr><td>1</td><td>3, 4, 5, 6, 7, and 15 (square 2 is a ladder to 15, so 2 itself is never a state)</td></tr>
  <tr><td>2</td><td>8 to 13, 16, 18 to 21 (square 14 would be a ladder to 35 and square 17 a snake to 13)</td></tr>
  <tr><td>3</td><td>22 to 27 and 35</td></tr>
  <tr><td>4</td><td>28 to 33 and <b>36</b>, the goal</td></tr>
</table>
<p class="sub">
  A shortest route is rolls 6, 6, 1, 1: 1 → 7 → 13 → 14, which is carried to 35
  → 36. The ladder at square 2 looks attractive and is a trap here: it lands on
  15, and from 15 the goal is 21 squares away, which takes at least four more
  rolls. The winning route never lands on square 2.</p>

<h4>Word ladder: the neighbour function is the whole problem</h4>
<p>
  Change one letter at a time to turn <code>beginWord</code> into
  <code>endWord</code>, where every intermediate word must be in the list. Return
  the number of words in the shortest sequence, or 0. The state is a word and the
  start is worth 1. The goal is the neighbour function. The direct way compares
  the current word with every word in the list, which is O(N·L) per word and
  O(N²·L) overall for N words of length L.
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="The word ladder graph for hit to cog with the list hot, dot, dog, lot, log, cog. Edges join words that differ in one letter. Layers from hit: hit is layer 1, hot layer 2, dot and lot layer 3, dog and log layer 4, cog layer 5.">
    <g class="rough">
      <path class="ln" d="M84,100 L156,100" />
      <path class="ln" d="M200,88 L278,58" />
      <path class="ln" d="M200,112 L278,142" />
      <path class="ln" d="M322,50 L398,50" />
      <path class="ln" d="M322,150 L398,150" />
      <path class="ln" d="M300,74 L300,126" />
      <path class="ln" d="M420,74 L420,126" />
      <path class="ln" d="M442,58 L538,92" />
      <path class="ln" d="M442,142 L538,108" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="60" cy="100" r="24" />
      <circle class="box" cx="180" cy="100" r="24" />
      <circle class="box" cx="300" cy="50" r="24" />
      <circle class="box" cx="300" cy="150" r="24" />
      <circle class="box" cx="420" cy="50" r="24" />
      <circle class="box" cx="420" cy="150" r="24" />
      <circle class="boxy" cx="560" cy="100" r="24" />
    </g>
    <text class="sm" x="60" y="105" text-anchor="middle">hit</text>
    <text class="sm" x="180" y="105" text-anchor="middle">hot</text>
    <text class="sm" x="300" y="55" text-anchor="middle">dot</text>
    <text class="sm" x="300" y="155" text-anchor="middle">lot</text>
    <text class="sm" x="420" y="55" text-anchor="middle">dog</text>
    <text class="sm" x="420" y="155" text-anchor="middle">log</text>
    <text class="sm" x="560" y="105" text-anchor="middle">cog</text>
    <text class="sm gr" x="60" y="195" text-anchor="middle">1</text>
    <text class="sm" x="180" y="195" text-anchor="middle">2</text>
    <text class="sm" x="300" y="195" text-anchor="middle">3</text>
    <text class="sm" x="420" y="195" text-anchor="middle">4</text>
    <text class="sm" x="560" y="195" text-anchor="middle">5</text>
  </svg>
  <figcaption>The graph exists only because "differ by one letter" defines edges. The numbers are the BFS layers, counting words, so the answer is 5.</figcaption>
</figure>
<p>
  The better way uses the idea that two words are neighbours exactly when they
  agree after one position is blanked out. Replace each position of each word
  by a wildcard, <code>"*"</code>, and group the words by the resulting pattern:
  <code>hot</code> goes under <code>*ot</code>, <code>h*t</code> and
  <code>ho*</code>. Two words in the same bucket differ in at most that one
  position, so a bucket is a clique of neighbours. To find the neighbours of a
  word, look up its L patterns, and read the buckets.
</p>
<pre><code>function wildcardBuckets(beginWord, words) {
  const buckets = new Map();
  for (const word of new Set([beginWord, ...words])) {
    for (let i = 0; i &lt; word.length; i++) {
      const key = word.slice(0, i) + "*" + word.slice(i + 1);
      if (!buckets.has(key)) buckets.set(key, []);
      buckets.get(key).push(word);
    }
  }
  return buckets;
}

function ladderLength(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0; <span class="c">// the end word must be in the list</span>
  const buckets = wildcardBuckets(beginWord, words);

  const dist = new Map([[beginWord, 1]]); <span class="c">// words in the sequence, so the start is 1</span>
  const queue = [beginWord];
  let head = 0;
  while (head &lt; queue.length) {
    const word = queue[head++];
    if (word === endWord) return dist.get(word);
    for (let i = 0; i &lt; word.length; i++) {
      const key = word.slice(0, i) + "*" + word.slice(i + 1);
      for (const next of buckets.get(key)) {
        if (dist.has(next)) continue;
        dist.set(next, dist.get(word) + 1);
        queue.push(next);
      }
    }
  }
  return 0;
}</code></pre>
<h4>Dry run: hit to cog with the list hot, dot, dog, lot, log, cog</h4>
<table>
  <tr><th>Bucket (words in it)</th><th>Bucket (words in it)</th></tr>
  <tr><td><code>h*t</code>: hit, hot</td><td><code>*og</code>: dog, log, cog</td></tr>
  <tr><td><code>*ot</code>: hot, dot, lot</td><td><code>lo*</code>: lot, log</td></tr>
  <tr><td><code>do*</code>: dot, dog</td><td>every other pattern holds a single word</td></tr>
</table>
<table>
  <tr><th>Layer (words in the sequence)</th><th>Words</th><th>How they were found</th></tr>
  <tr><td>1</td><td>hit</td><td>the start</td></tr>
  <tr><td>2</td><td>hot</td><td>bucket <code>h*t</code></td></tr>
  <tr><td>3</td><td>dot, lot</td><td>bucket <code>*ot</code>, from hot</td></tr>
  <tr><td>4</td><td>dog, log</td><td><code>do*</code> from dot, <code>lo*</code> from lot</td></tr>
  <tr><td>5</td><td>cog</td><td>bucket <code>*og</code>; popped, so return 5</td></tr>
</table>
<ul>
  <li>
    <b>Cost.</b> Building the buckets creates N·L keys of length L, so O(N·L²)
    time and space. The search looks at L buckets per word. A bucket holds only
    words that differ at one position, so with a 26-letter alphabet it holds at
    most 26 words, and the search adds O(26·N·L) more steps. The total is
    O(N·L²), against O(N²·L) for comparing pairs, which is far better when the
    list is long and the words are short.
  </li>
  <li>If <code>beginWord</code> is not in the list it is still a legal start, so it goes into the buckets as well, which is why <code>wildcardBuckets</code> adds it.</li>
  <li>If <code>endWord</code> is missing from the list, the answer is 0 at once.</li>
</ul>

<h4>When the state is more than the position</h4>
<p>
  Shortest Path with Obstacle Elimination gives a grid where you may remove up
  to k walls on your way from the top-left to the bottom-right. A cell alone is
  not a state. Arriving at the same cell with 3 removals left is better than
  arriving with 0, so a visited mark on the cell would reject the better
  arrival and give a wrong answer. The state is the triple
  <code>(r, c, removals left)</code>, and the visited set holds triples.
</p>
<pre><code>function shortestPathWithEliminations(grid, k) {
  const rows = grid.length, cols = grid[0].length;
  if (k &gt;= rows + cols - 2) return rows + cols - 2; <span class="c">// enough removals to walk straight: any monotone path is allowed</span>

  const width = k + 1;
  const seen = new Uint8Array(rows * cols * width); <span class="c">// one flag per (cell, removals left)</span>
  seen[k] = 1;
  const queue = [[0, 0, k, 0]]; <span class="c">// row, column, removals left, steps taken</span>
  let head = 0;
  while (head &lt; queue.length) {
    const [r, c, left, steps] = queue[head++];
    if (r === rows - 1 &amp;&amp; c === cols - 1) return steps;
    for (const [dr, dc] of DIRS) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr &gt;= rows || nc &lt; 0 || nc &gt;= cols) continue;
      const nextLeft = left - grid[nr][nc]; <span class="c">// a wall costs one removal, an open cell costs none</span>
      if (nextLeft &lt; 0) continue;
      const key = (nr * cols + nc) * width + nextLeft;
      if (seen[key]) continue;
      seen[key] = 1;
      queue.push([nr, nc, nextLeft, steps + 1]);
    }
  }
  return -1;
}</code></pre>
<p class="sub">
  There are R·C·(k+1) states and four moves from each, so the time and space
  are O(R·C·k). The early return is valid because a path that goes only right
  and down has R + C − 2 steps and passes through at most R + C − 3 cells other
  than the two ends, so with k at least R + C − 2 even a grid full of walls does
  not stop it. The code assumes the start and end cells are open, as the
  problem states.
</p>
<div class="warn">
  <span class="ttl">⚠ Choosing the state</span>
  <b>Too small and the answer is wrong:</b> if something that affects the future
  is missing from the state (removals left, keys held, the direction you
  face), BFS merges positions that are not equivalent. <b>Too large and it is
  slow:</b> extra detail multiplies the number of states. Before writing code,
  estimate states times moves per state. <b>Not a primitive:</b> a tuple used as
  a <code>Map</code> key is compared by identity. Write it as a string such as
  <code>r + "," + c + "," + left</code>, or pack it into a number.
  <b>Unequal move costs:</b> BFS counts moves. If moves have different costs
  the answer is not a layer count, and you want Dijkstra.
</div>

<h3>Bidirectional BFS</h3>
<p>
  A single BFS from the start explores every state within distance d of it
  before it finds a goal at distance d. How many states is that? It depends on
  how fast the ball of states within distance k grows. When it grows by a factor
  b per layer, as in a word ladder with many neighbours, the ball holds about
  b<sup>d</sup> states. Now search from both ends, each to depth d/2. Each ball
  holds about b<sup>d/2</sup> states, and the two together hold
  2·b<sup>d/2</sup>, which is dramatically fewer when b is large.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="Left: one search from S draws a circle of radius d that just reaches G. Right: two searches, one from S and one from G, each draw a circle of radius d over two, and the circles touch halfway. The two small circles together cover half the area of the one large circle.">
    <g class="rough">
      <circle class="boxy" cx="140" cy="130" r="120" />
      <circle class="boxg" cx="400" cy="130" r="60" />
      <circle class="boxg" cx="520" cy="130" r="60" />
    </g>
    <circle cx="140" cy="130" r="4" fill="currentColor" />
    <circle cx="260" cy="130" r="4" fill="currentColor" />
    <circle cx="400" cy="130" r="4" fill="currentColor" />
    <circle cx="520" cy="130" r="4" fill="currentColor" />
    <text class="lbl" x="140" y="118" text-anchor="middle">S</text>
    <text class="lbl" x="250" y="118" text-anchor="end">G</text>
    <text class="lbl" x="400" y="118" text-anchor="middle">S</text>
    <text class="lbl" x="520" y="118" text-anchor="middle">G</text>
    <text class="sm" x="140" y="258" text-anchor="middle">one search: radius d</text>
    <text class="sm" x="460" y="258" text-anchor="middle">two searches: radius d/2 each</text>
  </svg>
  <figcaption>On a flat grid the balls are circles, so halving the radius halves the total area. In a graph whose ball grows exponentially the saving is far larger.</figcaption>
</figure>
<p>
  The algorithm keeps two searches, each with its own distance map and its own
  current layer. Each round, expand one whole layer of the side that currently
  has the smaller frontier. The moment a neighbour you generate is already in
  the other side's map, the two searches have met, and the answer is the
  distance to the state you came from, plus one, plus the other side's distance
  to the neighbour.
</p>
<pre><code>function bidirectionalDistance(start, goal, neighborsOf) {
  if (start === goal) return 0;
  const distA = new Map([[start, 0]]);
  const distB = new Map([[goal, 0]]);
  let frontA = [start], frontB = [goal];

  while (frontA.length &gt; 0 &amp;&amp; frontB.length &gt; 0) {
    const growA = frontA.length &lt;= frontB.length; <span class="c">// expand the smaller side</span>
    const front = growA ? frontA : frontB;
    const mine = growA ? distA : distB;
    const other = growA ? distB : distA;
    const next = [];
    for (const state of front) {
      for (const neighbor of neighborsOf(state)) {
        if (other.has(neighbor)) return mine.get(state) + 1 + other.get(neighbor); <span class="c">// the searches met</span>
        if (mine.has(neighbor)) continue;
        mine.set(neighbor, mine.get(state) + 1);
        next.push(neighbor);
      }
    }
    if (growA) frontA = next;
    else frontB = next;
  }
  return -1; <span class="c">// one side ran out of states without meeting the other</span>
}</code></pre>
<p>
  <b>Why the first meeting is the shortest distance.</b> Let L be the true
  distance. Each round expands one layer on one side, so the sum of the two
  sides' depths grows by exactly one per round, starting from 0. Say the layer
  being expanded is at depth p and the other side's map reaches depth q. A
  meeting found in that round is a real path of length p + 1 + q', where q' is
  at most q, so it is at least L and at most p + q + 1. That already shows no
  meeting can happen while p + q + 1 is less than L. And when p + q + 1 equals
  L, take a shortest path: its state at distance p from the expanding end is in
  the layer being expanded, and the next state on the path is at distance q
  from the other end, so it is already in the other map. That round must find a
  meeting, and any meeting it finds has length at most L and at least L, so it
  is exactly L. Which side you expand changes only how many states you visit,
  never the answer.</p>
<p>
  The same function runs a word ladder when its neighbour function reads the
  wildcard buckets:
</p>
<pre><code>function ladderLengthBidirectional(beginWord, endWord, wordList) {
  const words = new Set(wordList);
  if (!words.has(endWord)) return 0;
  const buckets = wildcardBuckets(beginWord, words);

  const neighborsOf = (word) =&gt; {
    const out = [];
    for (let i = 0; i &lt; word.length; i++) {
      for (const next of buckets.get(word.slice(0, i) + "*" + word.slice(i + 1))) {
        if (next !== word) out.push(next);
      }
    }
    return out;
  };
  const steps = bidirectionalDistance(beginWord, endWord, neighborsOf);
  return steps === -1 ? 0 : steps + 1; <span class="c">// moves become words in the sequence</span>
}</code></pre>
<p>
  How much does it save? Count the states each search expands (the calls to the
  neighbour function) on the lock with no dead ends, and on a 20 by 20 open
  grid:
</p>
<table>
  <tr><th>Search</th><th>Distance</th><th>States expanded, one BFS</th><th>States expanded, bidirectional</th></tr>
  <tr><td>Lock "0000" to "0202"</td><td>4</td><td>266</td><td>14</td></tr>
  <tr><td>Lock "0000" to "1234"</td><td>10</td><td>4,926</td><td>554</td></tr>
  <tr><td>Lock "0000" to "3737"</td><td>12</td><td>7,248</td><td>1,134</td></tr>
  <tr><td>Lock "0000" to "5555"</td><td>20</td><td>9,999</td><td>7,491</td></tr>
  <tr><td>20 by 20 grid, corner to opposite corner</td><td>38</td><td>399</td><td>362</td></tr>
</table>
<p class="sub">
  The lock graph has only 10,000 states, so the far target "5555" is close to
  the size of the whole graph, and neither search can save much. The middle rows
  are the case it helps. The corner-to-corner grid saves almost nothing: the
  goal is the far corner, so the single search ends up covering the whole 20 by
  20 grid, and the two searches, each reaching halfway from its own corner,
  cover half of the grid apiece, the same cells between them. On a grid the
  ball grows only as the square of the radius, so there is little to gain.
  Reach for it when the number of states grows quickly with distance and you
  know the goal state, as in word ladder. Do not expect it to help much on a
  plain grid.
</p>
<div class="warn">
  <span class="ttl">⚠ Bidirectional pitfalls</span>
  <b>Edges must run both ways.</b> The backward search takes the same neighbour
  function from the goal, so it is only valid when "a is a neighbour of b" means
  "b is a neighbour of a". For a directed state graph you need a separate
  function that lists predecessors.
  <b>Test the other side before your own map.</b> If you skip a neighbour
  because you have seen it yourself, you can step over the very state the other
  search holds.
  <b>Expand a full layer per round.</b> Stopping in the middle of a layer breaks
  the depth bookkeeping that the proof relies on.
  <b>Add the two distances.</b> Returning only your own side's distance is off by
  the other side's depth.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I know both the start and the
  goal and the edges go both ways, so I'll search from both ends and always grow
  the smaller frontier. Each ball is half as deep, which matters when the number
  of states grows fast with distance. When a neighbour is already in the other
  side's map I add the two distances plus one."
</div>

<h3>Choosing the technique, and what each costs</h3>
<table>
  <tr><th>Problem shape</th><th>Technique</th><th>Time</th><th>Extra space</th></tr>
  <tr><td>Fewest moves, one source, unit-cost moves</td><td>BFS with distances, or layers</td><td>O(R·C)</td><td>O(R·C)</td></tr>
  <tr><td>Distance to the nearest of many sources</td><td>multi-source BFS</td><td>O(R·C), not O(sources·R·C)</td><td>O(R·C)</td></tr>
  <tr><td>Region painting, island counting and area</td><td>flood fill (BFS, DFS or stack)</td><td>O(R·C)</td><td>O(R·C) worst case</td></tr>
  <tr><td>Which cells can reach the edge, or cannot escape</td><td>reverse multi-source from the border</td><td>O(R·C)</td><td>O(R·C)</td></tr>
  <tr><td>Fewest moves in an abstract space</td><td>state-space BFS</td><td>O(states · moves per state)</td><td>O(states)</td></tr>
  <tr><td>Known start and goal, fast-growing state space, two-way edges</td><td>bidirectional BFS</td><td>about the square root of the plain search when growth is exponential</td><td>two maps</td></tr>
  <tr><td>Moves with different costs</td><td>Dijkstra (advanced graph chapter), or a deque when costs are only 0 and 1</td><td>higher</td><td>higher</td></tr>
</table>
<p class="sub">
  The "square root" in the bidirectional row is a rule of thumb for graphs whose
  ball size multiplies at each layer. It is not a bound for every graph, as the
  grid row of the previous table showed.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Minimum number of steps, moves, turns or mutations" and every step costs the same: BFS. Ask what the state is and what its neighbours are.</li>
  <li>A 2D array where you move to adjacent cells: a grid graph. Ask first whether diagonals are allowed and what blocks a move.</li>
  <li>"Nearest", "closest" or "as far as possible from" a set of cells: multi-source BFS, with the set as the first layer.</li>
  <li>Everything happens at once, each round or minute: layers, and count them.</li>
  <li>"Which cells can reach the border", "enclosed", "cannot escape": start at the border and run the rule backward.</li>
  <li>The input is words, a lock, a board position, a puzzle: write the state as a string, enumerate the neighbours, and the rest is the code from this chapter.</li>
  <li>The answer depends on something besides the position, such as removals left, keys held, or direction: add it to the state.</li>
  <li>Not BFS: costs that differ per move (use Dijkstra), longest paths, or counting every path (DFS with memoization or DP).</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write the direction array and the bounds check from memory, and say which two ways the check can fail quietly.</li>
    <li>Explain in your own words why BFS finds shortest paths on an unweighted graph, using the fact that the queue holds at most two consecutive distances.</li>
    <li>Say why a cell is marked when it is queued, and what happens on a 10 by 10 open grid if it is marked when it is popped with no guard.</li>
    <li>Reconstruct a route with parent pointers, and say why 0 is a bad sentinel for "unseen".</li>
    <li>Explain how a multi-source BFS differs from running one BFS per source, and why it is still linear.</li>
    <li>Give two reasons a recursive flood fill can fail on a large grid, and write the version that does not.</li>
    <li>Solve Pacific Atlantic or Surrounded Regions by searching from the border, and say what the reversed rule is.</li>
    <li>For a word ladder, an open lock or a snakes-and-ladders board, name the state, the neighbours and the goal, and say what the start is worth.</li>
    <li>Say when bidirectional BFS helps, when it does not, and what must hold for it to be correct.</li>
  </ul>
</div>`,
};
