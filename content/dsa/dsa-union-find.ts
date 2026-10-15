import type { Chapter } from "../types";

export const dsaUnionFind: Chapter = {
  id: "dsa-union-find",
  num: "A2",
  title: "Union-Find (Disjoint Set)",
  short: "Union-Find",
  levels: ["advanced"],
  prerequisites: ["dsa-graphs-representation-traversal"],
  practice: [
    "ex-number-of-connected-components",
    "ex-redundant-connection",
    "ex-find-circle-num",
    "ex-accounts-merge",
    "ex-equations-possible",
    "ex-number-of-islands-ii",
    "ex-most-stones-removed",
    "ex-smallest-string-with-swaps",
    "ex-largest-component-common-factor",
    "ex-evaluate-division-weighted-dsu",
    "ex-possible-bipartition",
    "ex-redundant-connection-ii",
    "ex-bricks-falling-when-hit",
    "ex-is-bipartite",
  ],
  ready: true,
  subtitle: 'Twenty lines that answer "are these two connected?" in effectively constant time — forever.',
  body: `<h3>The one question it answers, and why BFS isn't good enough</h3>
<p>
  You already know how to find connected components with BFS or DFS: one
  sweep, O(V + E). That works when the graph is <em>fixed</em>. Union-Find
  exists for the other case — when edges keep arriving and you have to answer
  "are u and v connected?" interleaved with "now connect u and v." Re-running
  DFS after every edge is O(E) per query; union-find answers both operations
  in effectively O(1), amortized, forever.
</p>
<p>
  The representation is a <b>forest</b>: every element points at a parent, and
  the root of each tree is that set's canonical name. Two elements are in the
  same set exactly when they reach the same root. That's the entire data
  structure — an array of integers.
</p>

<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A tall union-find tree on the left where node four points through three chained parents to the root, and on the right the same nodes after path compression all pointing directly at the root">
    <g class="rough">
      <path class="ln" d="M110,175 L110,135" />
      <path class="ln" d="M110,115 L110,75" />
      <path class="ln" d="M110,55 L110,30" />
      <path class="lng" d="M420,170 L480,120" />
      <path class="lng" d="M500,170 L500,120" />
      <path class="lng" d="M580,170 L520,120" />
    </g>
    <g class="rough">
      <circle class="box" cx="110" cy="190" r="16" />
      <circle class="box" cx="110" cy="130" r="16" />
      <circle class="box" cx="110" cy="70" r="16" />
      <circle class="boxy" cx="110" cy="20" r="16" />
      <circle class="boxg" cx="420" cy="185" r="16" />
      <circle class="boxg" cx="500" cy="185" r="16" />
      <circle class="boxg" cx="580" cy="185" r="16" />
      <circle class="boxy" cx="500" cy="105" r="16" />
    </g>
    <text class="sm" x="110" y="195" text-anchor="middle">4</text>
    <text class="sm" x="110" y="135" text-anchor="middle">3</text>
    <text class="sm" x="110" y="75" text-anchor="middle">2</text>
    <text class="sm" x="110" y="25" text-anchor="middle">1</text>
    <text class="sm" x="420" y="190" text-anchor="middle">4</text>
    <text class="sm" x="500" y="190" text-anchor="middle">3</text>
    <text class="sm" x="580" y="190" text-anchor="middle">2</text>
    <text class="sm" x="500" y="110" text-anchor="middle">1</text>
    <text class="lbl rd" x="150" y="100" style="font-size:15px">find(4) walks 3 hops</text>
    <text class="sm rd" x="150" y="122">chains like this are the O(n) worst case</text>
    <text class="lbl gr" x="300" y="60" style="font-size:15px">after find(4) with path compression:</text>
    <text class="sm gr" x="300" y="82">every node on the path re-parents to the root</text>
    <text class="sm" x="300" y="222">the next find on any of them costs one hop — the work is paid once, not per query</text>
  </svg>
  <figcaption>Path compression doesn't just speed up the node you queried — it flattens everything on the path, so the cost amortizes away across future queries.</figcaption>
</figure>

<h3>The naive version, so you can see what breaks</h3>
<pre><code>class NaiveDSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i); <span class="c">// everyone starts as their own root</span>
  }

  find(x) {
    while (this.parent[x] !== x) x = this.parent[x]; <span class="c">// walk up to the root</span>
    return x;
  }

  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;  <span class="c">// already together — the return value is the useful part</span>
    this.parent[ra] = rb;         <span class="c">// hang one root under the other, arbitrarily</span>
    return true;
  }
}</code></pre>
<p class="sub">
  This is correct and it is also a trap: <code>union(0,1), union(1,2),
  union(2,3), …</code> builds a single chain of length n, and every
  <code>find</code> then costs O(n). The two optimizations below exist purely
  to make the trees short — they do not change what the structure means.
</p>

<h3>The two optimizations that change the complexity class</h3>
<p>
  <b>Path compression</b> — while walking to the root, re-point everything you
  passed directly at the root. You already paid to walk the path; flattening
  it is free.
</p>
<pre><code><span class="c">// recursive, two-pass: the clean version to write on a whiteboard</span>
find(x) {
  if (this.parent[x] !== x) {
    this.parent[x] = this.find(this.parent[x]); <span class="c">// re-parent on the way back down</span>
  }
  return this.parent[x];
}

<span class="c">// iterative, no stack depth risk — prefer this for n in the hundreds of thousands</span>
find(x) {
  let root = x;
  while (this.parent[root] !== root) root = this.parent[root];
  while (this.parent[x] !== root) {        <span class="c">// second pass: hook every node on the path to root</span>
    const next = this.parent[x];
    this.parent[x] = root;
    x = next;
  }
  return root;
}</code></pre>
<p>
  <b>Union by size</b> (or rank) — when merging, always hang the
  <em>smaller</em> tree under the larger root. A node's depth only increases
  when its tree is absorbed by one at least as big, so a node can be pushed
  down at most log n times before its tree contains all n elements. That alone
  caps height at O(log n), even with no path compression at all.
</p>
<pre><code>union(a, b) {
  let ra = this.find(a), rb = this.find(b);
  if (ra === rb) return false;
  if (this.size[ra] &lt; this.size[rb]) [ra, rb] = [rb, ra]; <span class="c">// ra is now the LARGER root</span>
  this.parent[rb] = ra;
  this.size[ra] += this.size[rb];
  return true;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Union by <em>rank</em> and by <em>size</em> are not the same field</span>
  Rank is an upper bound on height and only increments when two roots tie;
  size is the element count and always adds. Both work. What does <em>not</em>
  work is comparing rank while updating it like a size (or vice versa) — a
  common copy-paste mistake that silently degrades to the naive version. Also
  note: with path compression, rank stops being the true height. That's fine —
  it's still a valid balancing heuristic, which is why it's usually called
  "rank" and not "height."
</div>

<h3>The production DSU — memorize this one</h3>
<pre><code>class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.components = n; <span class="c">// every successful union drops this by exactly one</span>
  }

  find(x) {
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root];
    while (this.parent[x] !== root) {
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;                       <span class="c">// false === "these were already connected"</span>
    if (this.size[ra] &lt; this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.components--;
    return true;
  }

  connected(a, b) { return this.find(a) === this.find(b); }
  setSize(x) { return this.size[this.find(x)]; }        <span class="c">// size is only meaningful at a root</span>
}</code></pre>
<h4>Dry run: union(0,1), union(1,2), union(3,4), union(2,3), then find(4) — the demo above</h4>
<table>
  <tr><th>Step</th><th>Call</th><th>ra, rb</th><th>parent[0..6] after</th><th>components</th></tr>
  <tr><td>1</td><td>union(0, 1)</td><td>ra=0, rb=1</td><td>[0, 0, 2, 3, 4, 5, 6]</td><td>6</td></tr>
  <tr><td>2</td><td>union(1, 2)</td><td>ra=0, rb=2</td><td>[0, 0, 0, 3, 4, 5, 6]</td><td>5</td></tr>
  <tr><td>3</td><td>union(3, 4)</td><td>ra=3, rb=4</td><td>[0, 0, 0, 3, 3, 5, 6]</td><td>4</td></tr>
  <tr><td>4</td><td>union(2, 3)</td><td>ra=0, rb=3</td><td>[0, 0, 0, 0, 3, 5, 6]</td><td>3</td></tr>
  <tr><td>5</td><td>find(4)</td><td>root=0</td><td>[0, 0, 0, 0, 0, 5, 6]</td><td>3</td></tr>
</table>
<p class="sub">
  Step 4's internal find(2) and find(3) calls rewrite nothing — 2 already points
  straight at root 0 from step 2's compression, and 3 is still its own root — so
  union by size alone is doing the shrinking there. Step 5 is the only line that
  triggers path compression: find(4) walks 4 → 3 → 0 to locate the root, then its
  second pass re-points parent[4] straight at 0, exactly the flattening the demo
  above shows.
</p>
<p class="sub">
  Three details earn their keep in interviews: <code>union</code> returning a
  boolean (that single value solves cycle detection and Redundant Connection),
  the <code>components</code> counter (solves "number of provinces" with no
  extra pass), and <code>setSize</code> going through <code>find</code> first
  (reading <code>size[x]</code> on a non-root is stale garbage).
</p>

<h3>Why the combination is nearly O(1) — the intuition</h3>
<p>
  With both optimizations, m operations on n elements cost O(m · α(n)), where
  α is the inverse Ackermann function. You don't need the proof, you need the
  shape of the argument and a number.
</p>
<ul>
  <li><b>Union by size alone</b> caps tree height at log n: a node only gets
  deeper when its tree is swallowed by one at least as large, so its
  containing set at least doubles each time — that can happen at most log₂ n
  times.</li>
  <li><b>Path compression alone</b> means each expensive walk permanently
  destroys the structure that made it expensive. You cannot pay for the same
  long path twice; the cost amortizes across the sequence of operations, not
  per operation.</li>
  <li><b>Together</b>, the trees flatten faster than they can grow. The
  rigorous bound is α(n), the inverse of a function that grows so violently
  that α(n) ≤ 4 for any n you can physically store — n = 2<sup>65536</sup>
  still gives α = 5.</li>
</ul>
<table>
  <tr><th>Variant</th><th>find / union (amortized)</th><th>Comment</th></tr>
  <tr><td>Naive</td><td>O(n)</td><td>degenerates to a linked list</td></tr>
  <tr><td>Union by size only</td><td>O(log n)</td><td>worst case, not amortized</td></tr>
  <tr><td>Path compression only</td><td>O(log n)</td><td>amortized</td></tr>
  <tr><td>Both</td><td>O(α(n)) ≈ O(1)</td><td>α(n) ≤ 4 for all practical n</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll use union-find with path
  compression and union by size. Each operation is amortized inverse
  Ackermann, which is at most 4 for any input that fits in memory — so I'll
  treat it as constant. Building over E edges is O(E · α(V)), which is
  effectively linear, and unlike a DFS it keeps working as new edges arrive."
</div>

<h3>Number of connected components — the counter does the work</h3>
<pre><code><span class="c">// LeetCode "Number of Connected Components in an Undirected Graph" / "Number of Provinces"</span>
function countComponents(n, edges) {
  const dsu = new DSU(n);
  for (const [u, v] of edges) dsu.union(u, v);
  return dsu.components;
}

<span class="c">// Same idea on an adjacency MATRIX (Number of Provinces) — only scan the upper triangle</span>
function findCircleNum(isConnected) {
  const n = isConnected.length;
  const dsu = new DSU(n);
  for (let i = 0; i &lt; n; i++) {
    for (let j = i + 1; j &lt; n; j++) {
      if (isConnected[i][j] === 1) dsu.union(i, j);
    }
  }
  return dsu.components;
}</code></pre>
<p class="sub">
  A grid problem like "Number of Islands" can be done this way too — map cell
  <code>(r, c)</code> to index <code>r * cols + c</code> and union each land
  cell with its right and down neighbours only (left/up are covered by the
  other cell's turn). BFS is simpler there and equally fast; reach for DSU on
  grids when the islands <em>change</em>, as in "Number of Islands II," where
  each added land cell is one union and the running count is free.
</p>

<h3>Cycle detection and Redundant Connection</h3>
<p>
  In an undirected graph, an edge <code>(u, v)</code> closes a cycle exactly
  when u and v are <em>already</em> in the same set. That is precisely the
  case where <code>union</code> returns false — so cycle detection is one
  <code>if</code>.
</p>
<pre><code><span class="c">// Does this undirected edge list contain a cycle?</span>
function hasCycle(n, edges) {
  const dsu = new DSU(n);
  for (const [u, v] of edges) {
    if (!dsu.union(u, v)) return true; <span class="c">// both endpoints already connected → this edge closes a loop</span>
  }
  return false;
}

<span class="c">// Redundant Connection: n nodes, n edges, 1-indexed. Return the LAST edge that creates a cycle.</span>
function findRedundantConnection(edges) {
  const dsu = new DSU(edges.length + 1); <span class="c">// +1 because nodes are 1-indexed; slot 0 is unused</span>
  for (const [u, v] of edges) {
    if (!dsu.union(u, v)) return [u, v]; <span class="c">// edges are given in order, so the first failure IS the last-added cycle edge</span>
  }
  return [];
}

<span class="c">// Bonus: "Graph Valid Tree" — a tree is exactly (n-1 edges) + (no cycle)</span>
function validTree(n, edges) {
  if (edges.length !== n - 1) return false;
  const dsu = new DSU(n);
  for (const [u, v] of edges) if (!dsu.union(u, v)) return false;
  return true; <span class="c">// n-1 edges and no cycle forces connectivity — no need to check it separately</span>
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Union-Find does not detect cycles in a <em>directed</em> graph</span>
  It has no notion of edge direction — it only knows "reachable through some
  path, ignoring arrows." A directed graph with edges 1→2, 1→3 and 2→3 would look
  like a cycle to DSU (the third union finds 2 and 3 already connected) when
  there isn't one. For
  directed cycles use DFS with three colors, or Kahn's topological sort and
  check whether every node came off the queue. Naming this distinction
  unprompted is a strong signal in an interview.
</div>

<h3>Accounts Merge — union-find on things that aren't integers</h3>
<p>
  DSU indexes integers, so the real work in most "merge these groups"
  problems is the mapping layer: assign each distinct string an integer id,
  union, then bucket by root. This is the pattern for Accounts Merge,
  "Sentence Similarity II," "Synonymous Sentences," and every
  merge-duplicates question.
</p>
<pre><code><span class="c">// accounts[i] = [name, email1, email2, ...]. Merge accounts sharing any email.</span>
function accountsMerge(accounts) {
  const emailToId = new Map();
  const emailToName = new Map();
  let nextId = 0;

  for (const account of accounts) {
    const name = account[0];
    for (let i = 1; i &lt; account.length; i++) {
      const email = account[i];
      if (!emailToId.has(email)) emailToId.set(email, nextId++);
      emailToName.set(email, name);
    }
  }

  const dsu = new DSU(nextId);
  for (const account of accounts) {
    const firstId = emailToId.get(account[1]);
    for (let i = 2; i &lt; account.length; i++) {
      dsu.union(firstId, emailToId.get(account[i])); <span class="c">// chain every email to the account's first email</span>
    }
  }

  const groups = new Map(); <span class="c">// root id → list of emails</span>
  for (const [email, id] of emailToId) {
    const root = dsu.find(id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(email);
  }

  const result = [];
  for (const emails of groups.values()) {
    emails.sort();
    result.push([emailToName.get(emails[0]), ...emails]); <span class="c">// any email in the group maps to the same name</span>
  }
  return result;
}</code></pre>
<p class="sub">
  Complexity is O(E · α + E log E), where E is the total number of emails —
  the sort at the end dominates, which is worth saying out loud because it
  shows you costed the whole solution, not just the clever part.
</p>
<div class="warn">
  <span class="ttl">⚠ Two people can share a name; only emails identify an account</span>
  Union by name and every "John Smith" collapses into one account. The name is
  output-only metadata — never a key. This is the single intended trap in
  Accounts Merge, and it is also the realistic-data lesson: union on the
  identifier, carry the label along for the ride.
</div>

<h3>Number of Islands II: when land keeps appearing</h3>
<p>
  The grid section above promised this one. "An m × n grid starts as all
  water. Positions are turned into land one at a time; after each one, report
  the number of islands." Re-running a flood fill after every position costs
  O(m · n) each time. With union-find, each new land cell is one insertion plus
  at most four unions.
</p>
<p>
  The counter logic is the part to get exactly right. When a cell becomes
  land, it starts as a new island, so add 1. Then look at its four neighbours.
  Every neighbour that is already land and was in a <em>different</em> set
  gets merged with this cell, so the number of islands drops by one per
  successful merge. That is the same "<code>union</code> returned true" signal
  as before. Note that the chapter's <code>components</code> counter is no help
  here, because it counts every water cell as a separate component; keep your
  own <code>islands</code> counter.
</p>
<pre><code>function numIslands2(m, n, positions) {
  const dsu = new DSU(m * n);
  const isLand = new Uint8Array(m * n);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let islands = 0;
  const answer = [];

  for (const [r, c] of positions) {
    const id = r * n + c;
    if (!isLand[id]) {          <span class="c">// a repeated position changes nothing</span>
      isLand[id] = 1;
      islands++;                <span class="c">// a new island, until a neighbour says otherwise</span>
      for (const [dr, dc] of dirs) {
        const nr = r + dr, nc = c + dc;
        if (nr &lt; 0 || nr >= m || nc &lt; 0 || nc >= n) continue;
        const neighbour = nr * n + nc;
        if (isLand[neighbour] &amp;&amp; dsu.union(id, neighbour)) islands--; <span class="c">// joined two different islands</span>
      }
    }
    answer.push(islands);
  }
  return answer;
}</code></pre>
<h4>Dry run: a 3 × 3 grid and positions (0,0), (0,2), (1,1), (0,1), (0,1)</h4>
<table>
  <tr><th>Position</th><th>Land neighbours that are in other sets</th><th>islands before → after</th><th>Reported</th></tr>
  <tr><td>(0,0)</td><td>none</td><td>0 → 1</td><td>1</td></tr>
  <tr><td>(0,2)</td><td>none</td><td>1 → 2</td><td>2</td></tr>
  <tr><td>(1,1)</td><td>none: its neighbours (0,1), (1,0), (1,2), (2,1) are water</td><td>2 → 3</td><td>3</td></tr>
  <tr><td>(0,1)</td><td>(0,0), (0,2) and (1,1): three different islands</td><td>3 → 4 → 3 → 2 → 1</td><td>1</td></tr>
  <tr><td>(0,1) again</td><td>already land, skipped</td><td>1</td><td>1</td></tr>
</table>
<p class="sub">
  One cell joined three islands and the counter went from 3 to 1, because the
  +1 for the new cell and three successful unions net to -2. Time is
  O(m · n + k · α(m · n)) for k positions: building the structure is linear in
  the grid, each position is constant amortized.
</p>
<div class="warn">
  <span class="ttl">⚠ Three bugs in this problem</span>
  A repeated position must not increment the counter, which is the
  <code>if (!isLand[id])</code> guard. Merging with a neighbour that is still
  water would silently tie a land cell to an unrelated water cell. And the
  index <code>r * n + c</code> uses the <em>column</em> count n; writing
  <code>r * m + c</code> works on square grids and breaks on rectangular
  ones, where cells collide or the index runs past the end of the array.
</div>

<h3>Most Stones Removed: make the rows and columns the elements</h3>
<p>
  "Stones sit on integer grid points. A stone may be removed if another stone
  shares its row or its column. What is the largest number of stones you can
  remove?" The obvious elements to union are the stones, which needs pairwise
  checks. A better choice: make every <em>row</em> and every <em>column</em> an
  element, and treat each stone as the thing that connects its row to its
  column.
</p>
<p>
  Now ask what a connected group looks like. All stones in one group are linked
  by shared lines, so you can remove them one at a time, always taking a stone
  that still shares a line with another one, until a single stone is left. (Take
  the stones in the reverse of the order a search would discover them from some
  starting stone, and each removed stone still has a neighbour left.) You can
  never remove the last stone of a group, since it shares no line with any other
  stone, and groups cannot help each other because they share no row or column.
  So each group leaves exactly one stone, and the answer is
  <code>stones - groups</code>.
</p>
<pre><code>function removeStones(stones) {
  const rowId = new Map(), colId = new Map();
  let next = 0;
  const links = [];

  for (const [r, c] of stones) {
    if (!rowId.has(r)) rowId.set(r, next++); <span class="c">// a row and a column are two different elements</span>
    if (!colId.has(c)) colId.set(c, next++);
    links.push([rowId.get(r), colId.get(c)]);
  }

  const dsu = new DSU(next);
  for (const [a, b] of links) dsu.union(a, b); <span class="c">// a stone joins its row to its column</span>

  return stones.length - dsu.components;       <span class="c">// one stone must stay in every group</span>
}</code></pre>
<h4>Dry run: stones (0,0), (0,2), (1,1), (2,0), (2,2)</h4>
<table>
  <tr><th>Stone</th><th>Row and column elements</th><th>Union</th><th>Elements left as separate sets</th></tr>
  <tr><td>(0,0)</td><td>row 0 = id 0, col 0 = id 1</td><td>0 + 1</td><td>6 → 5</td></tr>
  <tr><td>(0,2)</td><td>row 0 = id 0, col 2 = id 2</td><td>0 + 2</td><td>4</td></tr>
  <tr><td>(1,1)</td><td>row 1 = id 3, col 1 = id 4</td><td>3 + 4</td><td>3</td></tr>
  <tr><td>(2,0)</td><td>row 2 = id 5, col 0 = id 1</td><td>5 + 1</td><td>2</td></tr>
  <tr><td>(2,2)</td><td>row 2 = id 5, col 2 = id 2</td><td>5 + 2: already the same set</td><td>2</td></tr>
</table>
<p class="sub">
  Two groups remain, so the answer is 5 - 2 = 3. The count of sets works as
  the number of groups only because every row and column in the table was
  created by some stone; an element that no stone touches would be a set of its
  own and inflate the count. Time is O(S · α) for S stones. The same
  "make the lines the elements" idea solves any problem where objects are
  linked through shared attributes.
</p>

<h3>Smallest String With Swaps: connected positions can be sorted</h3>
<p>
  "Given a string and pairs of indices, you may swap the characters at the two
  indices of any pair, any number of times. Return the lexicographically
  smallest string you can reach." Think of the indices as nodes and the pairs as
  edges. Along a chain of swaps you can move any character to any other position
  in the same connected group (repeated adjacent swaps do it, the way bubble sort
  moves values), and a swap never moves a character out of its group. So inside
  a group, <b>any arrangement is reachable</b>. The smallest string puts the
  smallest letter in the earliest position of the group, the next smallest in the
  next position, and so on.
</p>
<pre><code>function smallestStringWithSwaps(s, pairs) {
  const n = s.length;
  const dsu = new DSU(n);
  for (const [a, b] of pairs) dsu.union(a, b);

  const groups = new Map(); <span class="c">// root -> indices in this group, collected in increasing order</span>
  for (let i = 0; i &lt; n; i++) {
    const root = dsu.find(i);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(i);
  }

  const out = new Array(n);
  for (const indices of groups.values()) {
    const letters = indices.map((i) => s[i]).sort(); <span class="c">// smallest letters first</span>
    indices.forEach((position, k) => { out[position] = letters[k]; }); <span class="c">// earliest positions get them</span>
  }
  return out.join("");
}</code></pre>
<p class="sub">
  Walk through <code>"dcab"</code> with pairs [[0,3],[1,2]]. The groups are
  positions {0, 3} holding d and b, and positions {1, 2} holding c and a. Sort
  each group's letters (b, d and a, c) and write them back in increasing
  position order: positions 0 and 3 get b and d, positions 1 and 2 get a and c.
  The result is <code>"bacd"</code>. Adding the pair [0,2] merges the two groups
  into one, and the result becomes <code>"abcd"</code>.
  Time is O((n + P) · α + n log n) for P pairs; the sort inside groups is the
  dominant term.
</p>
<div class="warn">
  <span class="ttl">⚠ Sort the letters, then assign to sorted indices</span>
  Sorting the letters is not enough. The indices of a group must be in
  increasing order before you write the sorted letters back, otherwise the
  smallest letter lands on a later index and the string is not minimal. The code
  gets this for free because it collects indices by scanning
  <code>i = 0, 1, 2, ...</code>. Note also that <code>sort()</code> on single
  characters is safe here, but on numbers it would compare as strings.
</div>

<h3>Largest Component Size by Common Factor: union through shared primes</h3>
<p>
  "Two numbers are connected if they share a common factor greater than 1.
  Return the size of the largest connected group in an array." Checking every
  pair with gcd is O(N²). The way out is the same trick as for stones: introduce
  intermediate elements. Two numbers share a factor greater than 1 exactly when
  they share a <b>prime</b> factor, so for every prime factor <code>p</code> of
  a number, connect the number to <code>p</code>. Numbers that share a prime end
  up in the same set through that prime, with no pairwise comparison.
</p>
<p>
  The code keeps a map from prime to the index of the first number that had it.
  The next number with that prime unions with that index. Finding a number's
  prime factors by trial division takes at most √x tries, and what remains
  after dividing out every factor up to √x is itself a prime.
</p>
<pre><code>function largestComponentSize(nums) {
  const dsu = new DSU(nums.length);
  const owner = new Map(); <span class="c">// prime -> index of the first number that has it</span>

  function link(index, prime) {
    if (owner.has(prime)) dsu.union(index, owner.get(prime));
    else owner.set(prime, index);
  }

  for (let i = 0; i &lt; nums.length; i++) {
    let x = nums[i];
    for (let p = 2; p * p &lt;= x; p++) {
      if (x % p !== 0) continue;
      link(i, p);
      while (x % p === 0) x /= p;
    }
    if (x > 1) link(i, x); <span class="c">// what is left over is one prime larger than the square root</span>
  }

  let best = 0;
  for (let i = 0; i &lt; nums.length; i++) best = Math.max(best, dsu.setSize(i));
  return best;
}</code></pre>
<h4>Dry run: [4, 6, 15, 35]</h4>
<table>
  <tr><th>Index</th><th>Number</th><th>Prime factors</th><th>Action</th></tr>
  <tr><td>0</td><td>4</td><td>2</td><td>owner[2] = 0</td></tr>
  <tr><td>1</td><td>6</td><td>2, 3</td><td>2 is owned by 0, so union(1, 0); owner[3] = 1</td></tr>
  <tr><td>2</td><td>15</td><td>3, 5</td><td>3 is owned by 1, so union(2, 1); owner[5] = 2</td></tr>
  <tr><td>3</td><td>35</td><td>5, 7</td><td>5 is owned by 2, so union(3, 2); owner[7] = 3</td></tr>
</table>
<p class="sub">
  All four numbers end in one set, so the answer is 4, although 4 and 35 share
  no factor directly: the chain 4 - 6 - 15 - 35 does it. Time is
  O(N · √M + N · α) where M is the largest value, and the trial division is the
  cost that matters. For values up to 10<sup>5</sup> that is a few hundred steps
  per number.
</p>
<div class="warn">
  <span class="ttl">⚠ The leftover prime and the number 1</span>
  Forgetting the final <code>if (x &gt; 1)</code> misses large primes: for 35 the
  loop finds 5 and leaves 7, and without the line 35 never connects through 7.
  And 1 has no prime factors, so it forms a group of size 1 by itself, which is
  correct because gcd(1, anything) is 1. The prime itself is never stored as an
  element of the DSU, only as a key of <code>owner</code>; that is cheaper than
  allocating a DSU of size M.
</div>

<h3>Weighted union-find: Evaluate Division</h3>
<p>
  "You are given equations like <code>a / b = 2.0</code> and
  <code>b / c = 3.0</code>. Answer queries such as <code>a / c</code>, returning
  -1 when the answer cannot be determined." Plain union-find only records
  <em>whether</em> two variables are related. Here the relation has a
  <b>size</b>, so store it: for every element x keep
  <code>ratio[x] = value(x) / value(parent of x)</code>. The root of a set is
  the yardstick, and every other variable is a multiple of its root.
</p>
<p>
  <b>Find with compression.</b> When <code>find</code> re-points x directly at
  the root, the stored ratio must change too. After the recursive
  <code>find(p)</code> on x's parent, <code>ratio[p]</code> equals
  <code>value(p) / value(root)</code>, and
  <code>ratio[x] = value(x) / value(p)</code> was already stored. Multiplying
  the two gives <code>value(x) / value(root)</code>, which is the new ratio for
  the new parent.
</p>
<p>
  <b>Union.</b> To record <code>a / b = v</code>, find the roots
  <code>ra</code> and <code>rb</code>. After the finds,
  <code>value(a) = ratio[a] · value(ra)</code> and
  <code>value(b) = ratio[b] · value(rb)</code>. Setting
  <code>value(a) = v · value(b)</code> and solving for
  <code>value(ra) / value(rb)</code> gives <code>v · ratio[b] / ratio[a]</code>.
  Store that as <code>ratio[ra]</code> and hang <code>ra</code> under
  <code>rb</code>. The code hangs the <em>smaller</em> set under the larger one,
  as in the main DSU; when it is <code>rb</code> that goes underneath, the stored
  ratio is the reciprocal.
</p>
<pre><code>class RatioDSU {
  constructor() {
    this.parent = new Map();
    this.ratio = new Map(); <span class="c">// ratio.get(x) = value(x) / value(parent of x)</span>
    this.size = new Map();
  }

  add(x) {
    if (!this.parent.has(x)) {
      this.parent.set(x, x);
      this.ratio.set(x, 1);
      this.size.set(x, 1);
    }
  }

  has(x) { return this.parent.has(x); }

  find(x) {
    const p = this.parent.get(x);
    if (p === x) return x;
    const root = this.find(p); <span class="c">// after this, ratio.get(p) is value(p) / value(root)</span>
    this.ratio.set(x, this.ratio.get(x) * this.ratio.get(p));
    this.parent.set(x, root);
    return root;
  }

  union(a, b, value) { <span class="c">// the equation a / b = value</span>
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return;
    const r = (value * this.ratio.get(b)) / this.ratio.get(a); <span class="c">// value(ra) / value(rb)</span>
    if (this.size.get(ra) &lt;= this.size.get(rb)) {
      this.parent.set(ra, rb);
      this.ratio.set(ra, r);
      this.size.set(rb, this.size.get(rb) + this.size.get(ra));
    } else {
      this.parent.set(rb, ra);
      this.ratio.set(rb, 1 / r); <span class="c">// the smaller set hangs under the larger, so the ratio flips</span>
      this.size.set(ra, this.size.get(ra) + this.size.get(rb));
    }
  }
}

function calcEquation(equations, values, queries) {
  const dsu = new RatioDSU();
  equations.forEach(([a, b], i) => {
    dsu.add(a);
    dsu.add(b);
    dsu.union(a, b, values[i]);
  });

  return queries.map(([a, b]) => {
    if (!dsu.has(a) || !dsu.has(b)) return -1;
    if (dsu.find(a) !== dsu.find(b)) return -1; <span class="c">// also leaves both ratios relative to the same root</span>
    return dsu.ratio.get(a) / dsu.ratio.get(b);
  });
}</code></pre>
<h4>Dry run: a / b = 2, b / c = 3, then three queries</h4>
<table>
  <tr><th>Step</th><th>What happens</th><th>State afterwards</th></tr>
  <tr><td>union(a, b, 2)</td><td>both are roots of size 1; the code hangs a under b with ratio[a] = 2 · 1 / 1</td><td>a → b (2)</td></tr>
  <tr><td>union(b, c, 3)</td><td>b is a root of size 2 and c a root of size 1, so c is the smaller set and hangs under b; r = 3 · 1 / 1 = 3 is value(b) / value(c), so ratio[c] = 1 / 3</td><td>a → b (2), c → b (1/3)</td></tr>
  <tr><td>query a / c</td><td>both finds return b without moving anything; ratio[a] / ratio[c] = 2 / (1/3)</td><td>answer 6</td></tr>
  <tr><td>query b / a</td><td>same root b, whose own ratio is 1; ratio[b] / ratio[a] = 1 / 2</td><td>0.5</td></tr>
  <tr><td>query a / e</td><td>e was never mentioned</td><td>-1</td></tr>
</table>
<p class="sub">
  Compare this with the alternative, a DFS from the
  numerator to the denominator for every query. The DFS costs O(V + E) per query;
  the weighted DSU answers each query in near-constant amortized time after the
  equations are loaded. Union by size is kept here for a practical reason: the
  recursive <code>find</code> follows the whole chain, and without the size rule
  a long run of unions can build a chain tens of thousands deep and overflow the
  call stack.
</p>
<div class="warn">
  <span class="ttl">⚠ Four details that decide whether this works</span>
  Query for an unknown variable must return -1, even for <code>x / x</code>.
  Both <code>find</code> calls must run <em>before</em> reading the two
  ratios, or you divide ratios taken relative to different roots (the
  <code>!==</code> test in the code already makes both calls). Results are
  floating-point values, so compare them with a tolerance in tests. And the
  product in <code>find</code> is multiplication, not addition: it is the
  weighted form of path compression, and with a "difference" instead of a
  "ratio" the same code would use addition.
</div>

<h3>Parity union-find: Possible Bipartition</h3>
<p>
  "Split n people into two groups so that no pair who dislike each other are in
  the same group." This is two-colouring a graph, which BFS does. The
  union-find version generalizes: the relation stored between two elements is
  not "same set" but <b>"same side" or "other side"</b>, one bit. Keep
  <code>parity[x]</code> as the bit between x and its parent, exactly as the
  ratio was kept in the previous section, with XOR where the ratio used
  multiplication.
</p>
<p>
  <b>Union (demand opposite sides).</b> After finding the roots, the side of a
  relative to its root is <code>parity[a]</code>, and likewise for b. If the
  roots are the same, the demand is satisfied exactly when
  <code>parity[a] !== parity[b]</code>; if not, the data contradicts the demand
  and the answer is <code>false</code>. If the roots differ, attach
  one root under the other (the smaller set under the larger) with
  <code>parity[root] = parity[a] ^ parity[b] ^ 1</code>, the value that makes a
  and b land on opposite sides; the bit is the same whichever root goes
  underneath.
</p>
<pre><code>class ParityDSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.parity = new Array(n).fill(0); <span class="c">// parity[x] = 0 if x is on the same side as its parent, 1 if on the other</span>
  }

  find(x) {
    if (this.parent[x] === x) return x;
    const p = this.parent[x];
    const root = this.find(p);
    this.parity[x] ^= this.parity[p]; <span class="c">// parity[p] is now relative to the root</span>
    this.parent[x] = root;
    return root;
  }

  separate(a, b) { <span class="c">// demand that a and b are on different sides; false if that contradicts what is known</span>
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return this.parity[a] !== this.parity[b];
    const link = this.parity[a] ^ this.parity[b] ^ 1; <span class="c">// the parity between the two roots</span>
    const [small, big] = this.size[ra] &lt;= this.size[rb] ? [ra, rb] : [rb, ra];
    this.parent[small] = big;
    this.parity[small] = link; <span class="c">// the same bit whichever root goes underneath</span>
    this.size[big] += this.size[small];
    return true;
  }
}

function possibleBipartition(n, dislikes) {
  const dsu = new ParityDSU(n + 1); <span class="c">// people are numbered from 1</span>
  for (const [a, b] of dislikes) {
    if (!dsu.separate(a, b)) return false;
  }
  return true;
}</code></pre>
<h4>Dry run: dislikes [[1,2],[2,3],[3,1]], three people who all dislike each other</h4>
<table>
  <tr><th>Call</th><th>Roots</th><th>Action</th><th>Result</th></tr>
  <tr><td>separate(1, 2)</td><td>1 and 2</td><td>1 → 2 with parity 0 ^ 0 ^ 1 = 1</td><td>true</td></tr>
  <tr><td>separate(2, 3)</td><td>2 (a set of two) and 3 (a set of one)</td><td>the smaller set goes underneath: 3 → 2 with parity 0 ^ 0 ^ 1 = 1</td><td>true</td></tr>
  <tr><td>separate(3, 1)</td><td>both already under root 2</td><td>parity[3] = 1 and parity[1] = 1: the same side, but they must differ</td><td><b>false</b></td></tr>
</table>
<p class="sub">
  Person 1 is on the opposite side of 2, and 2 on the opposite side of 3, so 1
  and 3 are on the same side, yet they dislike each other. The same three-person
  triangle is the shortest odd cycle. Time is near-linear in the number of
  dislikes, the same as a BFS colouring.
</p>
<p>
  Why bother, when BFS works? Because the parity DSU is <em>online</em>: it
  accepts constraints one at a time and tells you at the exact moment the system
  becomes contradictory, and it composes with other DSU features. Problems such
  as "Is Graph Bipartite" in a streaming setting, or "Satisfiability of Equality
  Equations" in its generalized form (equal, not equal, and "differs by a fixed
  amount"), are all this one idea. The ratio version and the parity version are
  both instances of storing a <em>group element</em> on each edge to the parent.
</p>

<h3>Redundant Connection II: directed union-find, carefully</h3>
<p>
  The earlier warning stands: plain union-find ignores direction. But there is
  a directed version of Redundant Connection that it can still solve, once you
  remove the ambiguity first. "A rooted tree has n nodes with edges pointing from
  parent to child. One extra directed edge was added. Given the n edges, return
  the one to remove so the rest is a rooted tree; if there are several answers,
  return the one that appears last in the input."
</p>
<p>
  Adding one edge to a rooted tree can break the structure in two ways, and they
  can happen at once:
</p>
<ul>
  <li><b>A node with two parents.</b> The new edge points at a node that already had a parent. One of those two edges must go.</li>
  <li><b>A cycle.</b> The new edge points back at an ancestor, creating a loop. Then some edge on the loop must go.</li>
</ul>
<p>
  So the algorithm has three steps. First scan the edges and record whether some
  node receives two edges; call the earlier one <code>first</code> and the later
  one <code>second</code>. Then rebuild the graph with <code>second</code>
  skipped, running union-find on it. In this reduced graph every node has at most
  one parent, so a loop shows up as a union that fails, and the undirected check
  is now legitimate. Finally decide:
</p>
<table>
  <tr><th>Situation</th><th>Answer</th><th>Why</th></tr>
  <tr><td>No node has two parents</td><td>the edge whose union fails</td><td>the extra edge only made a cycle</td></tr>
  <tr><td>Two parents, and a cycle remains after skipping <code>second</code></td><td><code>first</code></td><td>skipping <code>second</code> did not help, so the cycle runs through <code>first</code>, and removing <code>first</code> fixes both problems</td></tr>
  <tr><td>Two parents, and no cycle without <code>second</code></td><td><code>second</code></td><td>without <code>second</code> the graph is already a rooted tree, so removing it works</td></tr>
</table>
<pre><code>function findRedundantDirectedConnection(edges) {
  const n = edges.length;
  const parentOf = new Array(n + 1).fill(0);
  let first = null, second = null; <span class="c">// two edges that enter the same node, if there are any</span>

  for (const [u, v] of edges) {
    if (parentOf[v] !== 0) {
      first = [parentOf[v], v]; <span class="c">// the edge that got there earlier</span>
      second = [u, v];          <span class="c">// the one that arrived later</span>
    } else {
      parentOf[v] = u;
    }
  }

  const dsu = new DSU(n + 1);
  for (const [u, v] of edges) {
    if (second &amp;&amp; u === second[0] &amp;&amp; v === second[1]) continue; <span class="c">// try the graph without the later edge</span>
    if (!dsu.union(u, v)) return first ? first : [u, v];         <span class="c">// a cycle is left: the earlier edge is guilty</span>
  }
  return second; <span class="c">// no cycle without it, so removing the later of the two parent edges works</span>
}</code></pre>
<h4>Dry run: the three situations</h4>
<table>
  <tr><th>Edges</th><th>Double parent?</th><th>Union on the rest</th><th>Answer</th></tr>
  <tr><td>[1,2] [1,3] [2,3]</td><td>node 3: first = [1,3], second = [2,3]</td><td>[1,2], [1,3]: no failure</td><td>[2,3]</td></tr>
  <tr><td>[2,1] [3,1] [4,2] [1,4]</td><td>node 1: first = [2,1], second = [3,1]</td><td>[2,1], [4,2], [1,4]: the last union fails, a cycle 1 → 4 → 2 → 1</td><td>[2,1]</td></tr>
  <tr><td>[1,2] [2,3] [3,4] [4,1] [1,5]</td><td>none</td><td>the fourth edge [4,1] fails</td><td>[4,1]</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Do not remove <code>second</code> without checking for the cycle</span>
  The most common wrong answer returns <code>second</code> whenever two parents
  exist. The second row of the table breaks it: removing [3,1] leaves a cycle,
  and only removing [2,1] gives a tree. And when no node has two parents, the
  edge whose union fails is the last cycle edge in input order, which is the one
  the problem asks for. The same code handles all three rows.
</div>

<h3>Offline union-find: play time backwards (Bricks Falling When Hit)</h3>
<p>
  Union-find can only merge. So when a problem <em>deletes</em> things, the
  trick is to run the timeline in reverse, where deletions become insertions.
  "A grid of bricks: a brick is stable if it touches the top row or touches a
  stable brick. You are given a list of hits; each hit removes one brick (if
  present) and then every brick that is no longer stable falls. For each hit,
  report how many bricks fall, not counting the one that was hit." Assume the
  starting grid is stable.
</p>
<p>
  Forward, each hit can disconnect an unknown number of bricks from the top, and
  union-find cannot undo a union. In reverse, you start from the grid
  <em>after all hits</em> and add the bricks back one at a time, last hit first.
  Add a virtual node <code>ROOF</code>, joined to every brick in row 0. The
  number of bricks that were stable at any moment is the size of the ROOF's set
  minus one. Restoring the brick of hit i connects it, and perhaps a whole group
  hanging off it, to the rest. The growth of the ROOF's set measures exactly the
  bricks that would have fallen when that brick was hit. The restored brick is
  counted in the growth too, so subtract 1.
</p>
<pre><code>function hitBricks(grid, hits) {
  const R = grid.length, C = grid[0].length;
  const ROOF = R * C;
  const g = grid.map((row) => row.slice());

  const removed = hits.map(([r, c]) => {
    const wasBrick = g[r][c] === 1;
    g[r][c] = 0;
    return wasBrick;
  });

  const dsu = new DSU(R * C + 1);
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function attach(r, c) {
    const id = r * C + c;
    if (r === 0) dsu.union(id, ROOF);
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr >= 0 &amp;&amp; nr &lt; R &amp;&amp; nc >= 0 &amp;&amp; nc &lt; C &amp;&amp; g[nr][nc] === 1) dsu.union(id, nr * C + nc);
    }
  }

  for (let r = 0; r &lt; R; r++) {
    for (let c = 0; c &lt; C; c++) if (g[r][c] === 1) attach(r, c); <span class="c">// the grid after every hit</span>
  }

  const answer = new Array(hits.length).fill(0);
  for (let i = hits.length - 1; i >= 0; i--) { <span class="c">// play time backwards</span>
    if (!removed[i]) continue;
    const [r, c] = hits[i];
    const before = dsu.setSize(ROOF);
    g[r][c] = 1;
    attach(r, c);
    const after = dsu.setSize(ROOF);
    answer[i] = Math.max(0, after - before - 1); <span class="c">// the restored brick itself is not one that fell</span>
  }
  return answer;
}</code></pre>
<h4>Dry run: grid [[1,0,0,0],[1,1,1,0]], hits [[1,0]]</h4>
<table>
  <tr><th>Step</th><th>Grid and sets</th><th>ROOF set size</th></tr>
  <tr><td>after every hit</td><td>brick (1,0) removed. Sets: ROOF with (0,0), and a separate group (1,1), (1,2)</td><td>2</td></tr>
  <tr><td>restore (1,0): before</td><td>read the ROOF size before reconnecting</td><td>2</td></tr>
  <tr><td>restore (1,0): attach</td><td>(1,0) joins (0,0), which is in the ROOF's set, and (1,1), which brings (1,2) along</td><td>5</td></tr>
  <tr><td>answer for this hit</td><td>5 - 2 - 1</td><td>2 bricks fell</td></tr>
</table>
<p class="sub">
  The two bricks (1,1) and (1,2) were only held up by the hit brick, so they fall,
  and the answer is [2]. Time is O((R · C + H) · α) for H hits. A hit that
  lands on an empty cell contributes 0 and must <em>not</em> be restored, which
  is why the code records <code>removed[i]</code> at the time of the forward
  pass rather than looking at the grid later.
</p>
<div class="warn">
  <span class="ttl">⚠ Why each detail is there</span>
  Without <code>Math.max(0, …)</code> a restored brick that does not touch the
  ROOF gives -1. Without recording which hits really removed a brick, a repeated
  hit, or a hit on water, restores a brick that never existed. A DSU of exactly
  <code>R * C</code> elements has no slot for the ROOF, so the first row-0 brick
  reads past the end.
  And the order matters: the unions for the final grid must be built
  <em>before</em> the reverse loop starts, so that "before" measures the real
  state at that moment.
</div>
<p>
  The reverse-time idea is general. Whenever a problem says "remove" and asks
  something that union-find answers, ask whether the removals can be replayed
  backwards as additions. A network that loses its links one at a time, with a question about
  connectivity after each failure, has this shape. If the removals cannot be reversed, the rollback structure
  in the next section is the tool.
</p>

<h3>The advanced aside: union-find with rollback</h3>
<p>
  DSU has no <code>split</code> — you cannot un-merge two sets in general. But
  you <em>can</em> undo unions in reverse order if you keep a journal, which is
  enough for divide-and-conquer over time ("offline dynamic connectivity":
  each edge exists during an interval of queries, so you add it going down a
  segment-tree recursion and roll it back coming up).
</p>
<pre><code>class RollbackDSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.history = []; <span class="c">// journal of [childRoot, parentRoot] merges</span>
  }

  find(x) {
    while (this.parent[x] !== x) x = this.parent[x]; <span class="c">// NO path compression — it isn't undoable</span>
    return x;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) { this.history.push(null); return false; } <span class="c">// record a no-op so undo() stays aligned</span>
    if (this.size[ra] &lt; this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.history.push([rb, ra]);
    return true;
  }

  undo() {
    const entry = this.history.pop();
    if (!entry) return;
    const [child, root] = entry;
    this.parent[child] = child;      <span class="c">// exactly one pointer changed, so exactly one is restored</span>
    this.size[root] -= this.size[child];
  }
}</code></pre>
<p class="sub">
  The trade: dropping path compression costs you α and buys back O(log n) per
  operation from union-by-size alone — a fair price for undo. You almost
  certainly won't have to write this in an interview, but naming it when asked
  "what if edges could also be removed?" is exactly the kind of answer that
  separates candidates.
</p>
<p>
  One more forward reference: the next chapter, Minimum Spanning Tree, is
  essentially this data structure plus a sort. <b>Kruskal's algorithm</b> is
  "sort all edges by weight, then add each edge whose <code>union</code>
  returns true" — the boolean you already have is precisely the "does this
  edge connect two different components?" test the algorithm needs.
</p>


<h3>See the chain flatten</h3>
<p>Watch what path compression actually rewrites. The find that flattens the chain is doing the work that makes every later find cheap.</p>

<div class="demo">
  <div class="demo__bar">Union-Find — union by size + path compression</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="uf-code"></div>
        <div class="loop-bar"><i id="uf-bar"></i></div>
        <p class="loop-step" id="uf-step"></p>
        <div class="demo__ctl">
          <button class="btn" id="uf-prev" type="button">← Back</button>
          <button class="btn" id="uf-next" type="button">Next step →</button>
          <button class="btn" id="uf-play" type="button">Play</button>
          <button class="btn btn--ghost" id="uf-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Connected sets</div>
          <div id="uf-p-roots"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="uf-cells"></div></div></div>
    <p class="demo__note" id="uf-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "uf";
  var CODE = ["function find(x) {","  if (parent[x] !== x) parent[x] = find(parent[x]);","  return parent[x];","}","function union(a, b) {","  let ra = find(a), rb = find(b);","  if (ra === rb) return false;","  if (size[ra] < size[rb]) [ra, rb] = [rb, ra];","  parent[rb] = ra; size[ra] += size[rb];","}"];
  var STEPS = [{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"1","c":"","p":"p=1"},{"v":"2","c":"","p":"p=2"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0}","{1}","{2}","{3}","{4}","{5}","{6}"]},"note":"Seven nodes, each its own set — parent[i] = i means 'I am my own root'.","line":1},{"cells":[{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"2","c":"","p":"p=2"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1}","{2}","{3}","{4}","{5}","{6}"]},"note":"union(0, 1) — the smaller tree hangs under the bigger root, which keeps trees shallow.","line":9},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2}","{3}","{4}","{5}","{6}"]},"note":"union(1, 2) — the smaller tree hangs under the bigger root, which keeps trees shallow.","line":9},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"3","c":"hot","p":"p=3"},{"v":"3","c":"hot","p":"p=3"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2}","{3, 4}","{5}","{6}"]},"note":"union(3, 4) — the smaller tree hangs under the bigger root, which keeps trees shallow.","line":9},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"3","c":"","p":"p=3"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"union(2, 3) — the smaller tree hangs under the bigger root, which keeps trees shallow.","line":9},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"find(4) walked 4 → 3 → 0. Path compression then re-points every node on that walk straight at the root, so the next find is O(1).","line":2},{"cells":[{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"5","c":"done","p":"p=5"},{"v":"6","c":"done","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"Union by size plus path compression is what gives near-O(1) amortised operations.","line":9}];
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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>The words "connected," "groups," "merge," "same network," "provinces," "friend circles," "accounts belonging to one person."</b> Anything that is an equivalence relation (reflexive, symmetric, transitive) is a union-find problem.</li>
  <li><b>Edges arrive over time, or the question is asked repeatedly.</b> One BFS answers one snapshot; DSU answers a stream. If you see "after each query, report the number of components," DSU is almost forced.</li>
  <li><b>Brute force would be:</b> re-run DFS/BFS after every edge — O(E) per edge, O(E²) total. DSU makes it O(E · α).</li>
  <li><b>Distinguish from BFS/DFS:</b> if the graph is static <em>and</em> you also need paths, distances, or an ordering, use traversal — DSU knows nothing about distance, path, or direction. It only answers "same set?"</li>
  <li><b>Distinguish from topological sort:</b> DSU is undirected only. Directed dependencies, cycle detection in a DAG, ordering → topological sort.</li>
  <li><b>Objects linked through a shared attribute</b> (stones that share a row or column, numbers that share a prime) → make the attributes elements too and union each object with its attributes, instead of comparing every pair of objects.</li>
  <li><b>"Group the positions, then rearrange inside each group"</b> → union to find the groups, then collect by root and sort or fill each group on its own (smallest string with swaps).</li>
  <li><b>A relation that has a size or a side</b> (a / b = 2.5, "must be on opposite teams") → store a ratio or a parity bit on each edge to the parent, and update it when you compress paths.</li>
  <li><b>Things are deleted and you need connectivity after each deletion</b> → read the timeline backwards so deletions become unions, as in Bricks Falling When Hit.</li>
  <li><b>Pitfalls:</b> forgetting <code>find</code> before reading <code>size</code>; sizing the array wrong on 1-indexed inputs; and comparing roots with <code>parent[a] === parent[b]</code> instead of <code>find(a) === find(b)</code> — the second is the only correct test.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write find() and union() with both path compression and union by size from memory, and say what the boolean return value of union() is used for.</li>
    <li>Trace path compression on a chain by hand and explain why combining it with union by size gives O(α(n)) instead of O(log n).</li>
    <li>Explain why union-find cannot detect a cycle in a directed graph, and name the algorithm you'd reach for instead.</li>
    <li>Explain why Accounts Merge unions on email and never on name, and what silently breaks if you get that backwards.</li>
    <li>Given a new problem, recognize when it wants union-find — edges arriving over time, or a connectivity query repeated many times — versus a single BFS/DFS pass.</li>
  </ul>
</div>`,
};
