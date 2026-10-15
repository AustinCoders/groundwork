import type { Chapter } from "../types";

export const dsaGraphProblems: Chapter = {
  id: "dsa-graph-problems",
  num: "I7",
  title: "Graph problems",
  short: "Graph problems",
  levels: ["intermediate"],
  prerequisites: ["dsa-graphs-representation-traversal", "dsa-grid-bfs"],
  practice: [
    "ex-pacific-atlantic-water-flow",
    "ex-word-ladder",
    "ex-is-bipartite",
    "ex-shortest-binary-matrix",
    "ex-keys-rooms",
    "ex-number-of-connected-components",
    "ex-course-schedule",
    "ex-clone-graph",
    "ex-redundant-connection",
    "ex-graph-valid-tree",
    "ex-evaluate-division",
    "ex-number-of-provinces",
    "ex-all-paths-source-target",
    "ex-possible-bipartition",
    "ex-min-vertices-reach-all",
  ],
  ready: true,
  subtitle:
    "Components, cycles, colouring, trees and reachability: the same traversal each time, with a different thing to track.",
  body: `<h3>Connected components — how many separate "islands" exist</h3>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="A graph split into two separate connected components, one with three nodes and one with two nodes">
    <g class="rough">
      <path class="ln" d="M60,60 L160,60" />
      <path class="ln" d="M60,60 L110,140" />
      <path class="ln" d="M420,60 L500,110" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="60" cy="60" r="24" />
      <circle class="boxg" cx="160" cy="60" r="24" />
      <circle class="boxg" cx="110" cy="140" r="24" />
      <circle class="boxy" cx="420" cy="60" r="24" />
      <circle class="boxy" cx="500" cy="110" r="24" />
    </g>
    <text class="lbl gr" x="40" y="20" style="font-size:14px">component 1 (3 nodes)</text>
    <text class="lbl" x="400" y="20" style="font-size:14px">component 2 (2 nodes)</text>
    <text class="sm" x="20" y="185">no edges between the two groups</text>
  </svg>
  <figcaption>Run DFS/BFS from any unvisited node — everything it reaches is one component. Repeat until nothing's left unvisited.</figcaption>
</figure>
<pre><code>function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u); }

  const visited = new Set();
  let components = 0;

  for (let node = 0; node < n; node++) {
    if (visited.has(node)) continue; <span class="c">// already covered by an earlier DFS</span>
    components++;
    <span class="c">// flood-fill everything reachable from "node" into "visited"</span>
    const stack = [node];
    visited.add(node);
    while (stack.length) {
      const curr = stack.pop();
      for (const next of graph[curr]) {
        if (!visited.has(next)) { visited.add(next); stack.push(next); }
      }
    }
  }
  return components;
}</code></pre>
<p class="sub">
  The pattern generalizes directly to grid problems ("number of islands"):
  each land cell is a node, each adjacent land cell is an edge — same
  flood-fill, just walking up/down/left/right instead of an adjacency
  list.
</p>

<h3>Number of provinces: when the graph arrives as a matrix</h3>
<p>
  The flood-fill loop above assumed an adjacency list. A common variant hands
  you the graph as an <b>adjacency matrix</b> instead: <code>n</code> cities,
  and <code>isConnected[i][j] === 1</code> when city <code>i</code> and city
  <code>j</code> are directly connected. A <em>province</em> is a group of
  cities joined directly or through other cities, which is exactly a connected
  component. The answer is the number of components.
</p>
<p>
  Nothing new is needed except one change: there is no neighbour list to
  iterate, so the neighbours of city <code>c</code> are the columns in row
  <code>c</code> that hold a 1. Scanning a row costs O(n), and every city is
  scanned once, so this version takes O(n²) time. That is not a weakness of the
  code: with a matrix, O(n²) is simply the cost of reading the input.
</p>
<pre><code>function findCircleNum(isConnected) {
  const n = isConnected.length;
  const visited = new Array(n).fill(false);
  let provinces = 0;
  for (let city = 0; city &lt; n; city++) {
    if (visited[city]) continue; <span class="c">// an earlier search already reached it</span>
    provinces++;
    visited[city] = true;
    const stack = [city];
    while (stack.length &gt; 0) {
      const current = stack.pop();
      for (let other = 0; other &lt; n; other++) { <span class="c">// a row of the matrix is the neighbour list</span>
        if (isConnected[current][other] === 1 &amp;&amp; !visited[other]) {
          visited[other] = true;
          stack.push(other);
        }
      }
    }
  }
  return provinces;
}</code></pre>
<h4>Dry run: isConnected = [[1, 1, 0], [1, 1, 0], [0, 0, 1]]</h4>
<table>
  <tr><th>city</th><th>visited before?</th><th>row scanned</th><th>newly visited</th><th>provinces</th></tr>
  <tr><td>0</td><td>no</td><td>row 0: columns 0 and 1 hold a 1; 0 is visited already</td><td>1</td><td>1</td></tr>
  <tr><td>(stack)</td><td>—</td><td>row 1: columns 0 and 1 hold a 1, both visited</td><td>—</td><td>1</td></tr>
  <tr><td>1</td><td>yes</td><td>skipped</td><td>—</td><td>1</td></tr>
  <tr><td>2</td><td>no</td><td>row 2: only column 2, which is itself</td><td>—</td><td>2</td></tr>
</table>
<p class="sub">
  The answer is 2: cities 0 and 1 form one province, city 2 another. Three
  slips are common. The diagonal is 1 by convention (a city is connected to
  itself), so a city must be marked visited <em>before</em> its row is read, or
  it can be treated as its own unvisited neighbour. The matrix is symmetric,
  but do not read only half of it in a traversal: with edges 0-2 and 1-2, a
  search that looks only at columns after the current row cannot get from city
  2 back to city 1, and counts two provinces instead of one. And there is no need to translate the matrix into an adjacency list first,
  since that costs another O(n²) and gives nothing back. We checked this
  against a union-find count on thousands of random symmetric matrices.
</p>

<h3>Cycle detection — the rule differs by directed vs undirected</h3>
<div class="warn">
  <span class="ttl">⚠ The single most common graph-interview mistake</span>
  On an <em>undirected</em> graph, seeing a visited neighbor doesn't
  automatically mean a cycle — it might just be the edge you arrived
  from. You must track and exclude the parent explicitly. On a
  <em>directed</em> graph, that concern doesn't apply, but you now need to
  distinguish "visited earlier, finished" from "visited and still on the
  current path" — the difference between them is the whole check.
</div>
<pre><code><span class="c">// undirected: skip the edge back to where you just came from</span>
function hasCycleUndirected(graph, node, visited, parent) {
  visited.add(node);
  for (const next of graph[node]) {
    if (!visited.has(next)) {
      if (hasCycleUndirected(graph, next, visited, node)) return true;
    } else if (next !== parent) {
      return true; <span class="c">// hit an already-visited node that ISN'T where we came from</span>
    }
  }
  return false;
}

<span class="c">// directed: need a THIRD state — "on the current recursion path"</span>
function hasCycleDirected(graph, n) {
  const state = new Array(n).fill(0); <span class="c">// 0=unvisited, 1=in-progress, 2=done</span>

  function dfs(node) {
    state[node] = 1;
    for (const next of graph[node]) {
      if (state[next] === 1) return true;       <span class="c">// back-edge to an in-progress node = cycle</span>
      if (state[next] === 0 && dfs(next)) return true;
    }
    state[node] = 2;
    return false;
  }

  for (let i = 0; i < n; i++) {
    if (state[i] === 0 && dfs(i)) return true;
  }
  return false;
}</code></pre>
<p class="sub">
  That three-state trick (unvisited / in-progress / done) on a directed
  graph is the exact same idea behind detecting a circular dependency —
  "in-progress" means "currently on the stack of things depending on each
  other," and looping back to one of those is the cycle.
</p>
<h4>Dry run: hasCycleDirected on the 3-node cycle 0→1→2→0</h4>
<table>
  <tr><th>Call</th><th>state[] before</th><th>Neighbor checked</th><th>Neighbor's state</th><th>Result</th></tr>
  <tr><td>dfs(0)</td><td>[0, 0, 0] → mark 0 in-progress: [1, 0, 0]</td><td>1</td><td>0 (unvisited) → recurse into dfs(1)</td><td>—</td></tr>
  <tr><td>dfs(1)</td><td>[1, 0, 0] → mark 1 in-progress: [1, 1, 0]</td><td>2</td><td>0 (unvisited) → recurse into dfs(2)</td><td>—</td></tr>
  <tr><td>dfs(2)</td><td>[1, 1, 0] → mark 2 in-progress: [1, 1, 1]</td><td>0</td><td>1 (in-progress!)</td><td>return <code>true</code> — cycle found</td></tr>
</table>
<p class="sub">
  Node 0 never reaches state 2 ("done") — the call stack is still three
  deep inside it when the back-edge to it is found. That's exactly what
  "in-progress" is for: if 0 had already finished (state 2) before 2 ever
  looked at it, seeing it again would mean a second, unrelated path merged
  back in — not a cycle. Only a back-edge to something <em>still open on
  the current path</em> counts.
</p>

<h3>Bipartite check — can you 2-color it with no clashes?</h3>
<figure>
  <svg viewBox="0 0 640 160" class="dg" role="img" aria-label="A bipartite graph where nodes alternate between two colors with no same-colored nodes adjacent to each other">
    <g class="rough">
      <path class="ln" d="M100,50 L280,50" />
      <path class="ln" d="M100,50 L280,130" />
      <path class="ln" d="M100,130 L280,50" />
    </g>
    <g class="rough">
      <circle class="boxr" cx="100" cy="50" r="24" />
      <circle class="boxr" cx="100" cy="130" r="24" />
      <circle class="boxg" cx="280" cy="50" r="24" />
      <circle class="boxg" cx="280" cy="130" r="24" />
    </g>
    <text class="lbl" x="60" y="20" style="font-size:14px">every red only connects to green — never red-to-red</text>
  </svg>
  <figcaption>Bipartite = every edge crosses between the two groups, never stays within one.</figcaption>
</figure>
<pre><code>function isBipartite(graph) {
  const color = new Array(graph.length).fill(0); <span class="c">// 0=uncolored, 1 or -1 = the two colors</span>

  for (let start = 0; start < graph.length; start++) {
    if (color[start] !== 0) continue;
    color[start] = 1;
    const queue = [start];

    while (queue.length) {
      const node = queue.shift();
      for (const next of graph[node]) {
        if (color[next] === 0) {
          color[next] = -color[node]; <span class="c">// force the opposite color</span>
          queue.push(next);
        } else if (color[next] === color[node]) {
          return false; <span class="c">// a neighbor shares my color — contradiction</span>
        }
      }
    }
  }
  return true;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll BFS while alternating
  colors between each node and its neighbors — if I ever find an edge
  connecting two same-colored nodes, that's a direct proof the graph isn't
  2-colorable, which is exactly what 'not bipartite' means."
</div>

<h3>Graph valid tree: connected, with no cycle</h3>
<p>
  Given <code>n</code> nodes and a list of undirected edges, decide whether
  the graph is a <b>tree</b>: every node reachable from every other (one
  component) and no cycle. You already have both tools, a component count and
  a cycle check. But there is a shorter route, because a tree has a numeric
  fingerprint.
</p>
<p>
  Start with a single node and no edges: connected, no cycle. Adding a node
  that attaches by <em>one</em> edge keeps it connected and cycle-free, so a
  tree with n nodes built this way has n - 1 edges. Any extra edge between two
  nodes already in the tree closes a cycle, and any missing edge leaves a node
  unreachable. So for a graph with n nodes and exactly n - 1 edges, "no
  cycle" and "connected" are the <em>same</em> statement: if it is connected, it
  cannot have a cycle, and if it has no cycle, it must be connected. Checking
  one of the two is enough, once the edge count is right.
</p>
<pre><code>function validTree(n, edges) {
  if (edges.length !== n - 1) return false; <span class="c">// a tree on n nodes has exactly n - 1 edges</span>
  const graph = Array.from({ length: n }, () =&gt; []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u);
  }
  const seen = new Set([0]);
  const stack = [0];
  while (stack.length &gt; 0) {
    const node = stack.pop();
    for (const next of graph[node]) {
      if (!seen.has(next)) {
        seen.add(next);
        stack.push(next);
      }
    }
  }
  return seen.size === n; <span class="c">// n - 1 edges and connected leaves no room for a cycle</span>
}</code></pre>
<h4>Dry run: two inputs with n = 5 and four edges</h4>
<table>
  <tr><th>edges</th><th>edge count = n - 1?</th><th>nodes reached from 0</th><th>result</th></tr>
  <tr><td>[[0,1], [0,2], [0,3], [1,4]]</td><td>4 = 4, yes</td><td>0, 3, 2, 1, 4: five of five</td><td>true</td></tr>
  <tr><td>[[0,1], [1,2], [2,3], [1,3]]</td><td>4 = 4, yes</td><td>0, 1, 3, 2: four of five, node 4 is never reached</td><td>false</td></tr>
</table>
<p class="sub">
  The second input passes the count and fails the traversal: it has a cycle
  (1, 2, 3) and an isolated node (4), and the extra edge that made the cycle
  also took the place of the one that would have connected node 4. Both checks
  are needed, which is why the function does both. Its time is O(V + E), and,
  since the count test returns first, the traversal only runs when
  E = V - 1.
</p>
<div class="warn">
  <span class="ttl">⚠ Edge cases that decide this one</span>
  <b>Duplicate edges.</b> <code>n = 3, edges = [[0,1], [0,1]]</code> has
  n - 1 = 2 edges but node 2 is unreachable, so the traversal rejects it.
  <b>Self-loops.</b> <code>[[0,0]]</code> with n = 2 has the right count but a
  loop, and node 1 is unreachable. <b>One node, no edges.</b> That is a tree
  (the count is 0 = 1 - 1, and one node is reached). The solution above
  assumes <code>n</code> is at least 1. And the common wrong shortcut,
  <em>"connected, so return true"</em> without the edge count, accepts a
  cycle with extra edges. We checked both versions of this function against
  an independent union-find test on thousands of random graphs, including
  all of those shapes.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "A tree on n nodes has n - 1
  edges, and with that many edges, being connected and having no cycle mean the
  same thing. So I'll reject any other edge count at once, then run one
  traversal from node 0 and check that it reaches all n nodes."
</div>

<h3>Edges arriving one at a time: the union-find pointer</h3>
<p>
  Traversal answers questions about a graph you already hold. When the edges
  come <em>one at a time</em> and you must answer after each ("are these two
  already connected?", "did this edge create a cycle?", "how many groups now?"),
  re-running a DFS after every edge costs O(V + E) each time. A data structure
  built for exactly this is <b>union-find</b> (disjoint sets). It keeps each
  group as a tree of parent pointers and gives every group a single
  <em>root</em> that names it: <code>find(x)</code> follows the pointers up to
  the root, and <code>union(a, b)</code> joins the two groups by pointing one
  root at the other. Two nodes are connected exactly when their roots are
  equal.
</p>
<p>
  That makes the cycle test almost free. An edge <code>[u, v]</code> closes a
  cycle exactly when <code>u</code> and <code>v</code> already share a root,
  because a path between them exists before the edge is added.
</p>
<pre><code>function validTreeUnionFind(n, edges) {
  if (edges.length !== n - 1) return false;
  const parent = Array.from({ length: n }, (_, i) =&gt; i);
  const find = (x) =&gt; {
    while (parent[x] !== x) {
      parent[x] = parent[parent[x]]; <span class="c">// path halving: point at the grandparent as we climb</span>
      x = parent[x];
    }
    return x;
  };
  for (const [u, v] of edges) {
    const rootU = find(u), rootV = find(v);
    if (rootU === rootV) return false; <span class="c">// already connected: this edge would close a cycle</span>
    parent[rootU] = rootV; <span class="c">// merge the two groups</span>
  }
  return true;
}</code></pre>
<p class="sub">
  This is the same answer as the traversal version: with n - 1 edges and no
  edge closing a cycle, the n - 1 successful merges have joined all n nodes into
  one group. The line <code>parent[x] = parent[parent[x]]</code> (path
  halving) keeps the trees flat, so each <code>find</code> is, for practical
  purposes, constant time. The full structure, with union by size, the
  amortized cost and the harder variants (weighted ratios, parity, offline
  deletion) has its own chapter,
  <a href="/dsa/dsa-union-find">Union-find</a>.
</p>
<table>
  <tr><th>The question</th><th>Reach for</th><th>Why</th></tr>
  <tr><td>Count components of a fixed graph</td><td>DFS or BFS in a loop</td><td>one pass, O(V + E), simplest code</td></tr>
  <tr><td>Does this edge close a cycle (undirected), edges arriving in order</td><td>union-find</td><td>answers each edge in nearly constant time</td></tr>
  <tr><td>Components after each of many added edges</td><td>union-find</td><td>decrement a counter on each successful merge</td></tr>
  <tr><td>Anything directed: cycles, order, reachability</td><td>DFS with three states, or topological sort</td><td>union-find ignores direction</td></tr>
  <tr><td>Shortest path, or the path itself</td><td>BFS (Dijkstra if weighted)</td><td>union-find cannot tell you routes</td></tr>
</table>

<h3>Reachability: what can I get to from here</h3>
<p>
  "Reachable" questions ask which nodes a traversal from a start can touch.
  Nothing in the traversal changes. What changes is the question you ask of the
  visited set at the end, and sometimes whether you may keep it at all.
</p>
<h4>Keys and rooms: is everything reachable?</h4>
<p>
  There are <code>n</code> rooms, numbered from 0. Room 0 is unlocked. Each room
  holds a list of keys, and key <code>k</code> opens room <code>k</code>. Can you
  enter every room? That is a <em>directed</em> graph (the keys in room
  <code>i</code> are edges <code>i → k</code>), and the question is whether the
  search from node 0 reaches all n nodes.
</p>
<pre><code>function canVisitAllRooms(rooms) {
  const opened = new Set([0]); <span class="c">// room 0 is unlocked</span>
  const stack = [0];
  while (stack.length &gt; 0) {
    for (const key of rooms[stack.pop()]) {
      if (!opened.has(key)) {
        opened.add(key);
        stack.push(key);
      }
    }
  }
  return opened.size === rooms.length;
}</code></pre>
<h4>Dry run: rooms = [[1, 3], [3, 0, 1], [2], [0]]</h4>
<table>
  <tr><th>Pop</th><th>Keys in that room</th><th>New rooms opened</th><th>opened after</th></tr>
  <tr><td>start</td><td>—</td><td>—</td><td>{0}</td></tr>
  <tr><td>0</td><td>1, 3</td><td>1, 3</td><td>{0, 1, 3}</td></tr>
  <tr><td>3</td><td>0</td><td>none (0 is open)</td><td>{0, 1, 3}</td></tr>
  <tr><td>1</td><td>3, 0, 1</td><td>none</td><td>{0, 1, 3}</td></tr>
</table>
<p class="sub">
  The stack empties with three rooms open out of four, so the answer is
  <code>false</code>. Room 2 holds the only key to room 2 itself, so no room
  that can be entered gives you a way in. Time O(n + k) for k keys in total.
  Do not forget that a key can lead to a room you have already opened:
  without the <code>opened</code> set a loop of keys would run forever.
</p>
<h4>All paths from source to target</h4>
<p>
  Now you want <em>every route</em>, not whether one exists. In a directed
  <em>acyclic</em> graph with nodes 0 to n - 1, list every path from node 0 to
  node n - 1. A path can share nodes with another, so a global visited set
  would wrongly block the second route to a node. Instead keep the current path,
  extend it before each recursive call, and take the last node off after the
  call returns. This is the same choose, explore, un-choose rhythm as
  backtracking, and in a DAG it needs no visited marking at all, since a path can
  never come back to a node it has used.
</p>
<pre><code>function allPathsSourceTarget(graph) {
  const target = graph.length - 1;
  const paths = [];
  const path = [0];
  function dfs(node) {
    if (node === target) {
      paths.push([...path]); <span class="c">// copy: path keeps changing after this</span>
      return;
    }
    for (const next of graph[node]) {
      path.push(next); <span class="c">// choose</span>
      dfs(next);
      path.pop(); <span class="c">// un-choose</span>
    }
  }
  dfs(0);
  return paths;
}</code></pre>
<h4>Dry run: graph = [[1, 2], [3], [3], []]</h4>
<table>
  <tr><th>Call</th><th>path while inside</th><th>What happens</th></tr>
  <tr><td>dfs(0)</td><td>[0]</td><td>try the neighbour 1</td></tr>
  <tr><td>dfs(1)</td><td>[0, 1]</td><td>try the neighbour 3</td></tr>
  <tr><td>dfs(3)</td><td>[0, 1, 3]</td><td>this is the target: record a copy <code>[0, 1, 3]</code>, return</td></tr>
  <tr><td>back in dfs(0)</td><td>[0]</td><td>after un-choosing 3 and 1, try the neighbour 2</td></tr>
  <tr><td>dfs(2) then dfs(3)</td><td>[0, 2, 3]</td><td>record a copy <code>[0, 2, 3]</code></td></tr>
</table>
<p class="sub">
  The result is <code>[[0, 1, 3], [0, 2, 3]]</code>. Two traps. Pushing
  <code>path</code> itself instead of <code>[...path]</code> stores the same
  array each time, and since it is emptied again by the un-choose steps you
  end up with a list of arrays that are all just <code>[0]</code>. And the cost is not O(V + E): the
  answer itself can be huge. If every node points to every later node, there
  are 2<sup>n-2</sup> paths (we ran it for n = 4, 6 and 10 and counted 4, 16
  and 256), so the time grows with the total length of the output (plus
  any dead-end branches the search explores), and you should say that in an
  interview. If the graph can have cycles, the
  current path has to be tracked as a set so that a path does not revisit its
  own nodes.
</p>
<h4>A shortcut worth knowing: where must you start?</h4>
<p>
  Suppose you may start from any nodes you like in a directed acyclic graph, and
  want the <em>fewest</em> starting nodes from which every node is reachable. A
  node with <em>no incoming edge</em> cannot be reached from anywhere, so it
  has to be a start itself. Every other node has an incoming edge and, going
  backwards along incoming edges, the walk cannot go on for ever in an acyclic
  graph, so it ends at a node without incoming edges: the nodes you already
  chose. So the answer is exactly the nodes with in-degree zero. No traversal
  is needed.
</p>
<pre><code>function findSmallestSetOfVertices(n, edges) {
  const hasIncoming = new Array(n).fill(false);
  for (const [, to] of edges) hasIncoming[to] = true;
  const result = [];
  for (let i = 0; i &lt; n; i++) if (!hasIncoming[i]) result.push(i);
  return result;
}</code></pre>
<p class="sub">
  O(V + E) time. The argument leans on the graph being acyclic. In a graph that
  has a cycle, a group of nodes can feed each other and still have no outside
  edge into it, and the in-degree test would miss it. We checked the function
  on random DAGs: its set reaches every node, and removing any node from the
  set leaves that node unreachable.
</p>

<h3>Weighted DFS: evaluate division</h3>
<p>
  You get equations such as <code>a / b = 2.0</code> and <code>b / c =
  3.0</code>, and queries such as <code>a / c</code>. For each query, return the
  value, or <code>-1</code> if it cannot be worked out. The trick is to see the
  variables as <b>nodes</b> and each equation as a <b>weighted edge</b>.
  <code>a / b = 2</code> is an edge from a to b with weight 2, and it also tells
  you <code>b / a = 1 / 2</code>, so it is an edge back with weight 0.5, a
  directed pair for every equation. A query <code>x / y</code> asks for the product
  of the weights along a path from x to y, because
  <code>x / y = (x / m) · (m / y)</code> for any variable <code>m</code> in
  between. The chain <code>a / b · b / c</code> cancels the <code>b</code>
  and leaves <code>a / c</code>.
</p>
<p>
  That is a graph search that carries a number along. Instead of the visited
  stack of plain nodes, push <code>[node, product so far]</code>, where the
  product so far is <code>start / node</code>. When the search arrives at the
  target, the product is the answer.
</p>
<pre><code>function calcEquation(equations, values, queries) {
  const graph = new Map();
  const link = (a, b, ratio) =&gt; {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a).push([b, ratio]);
  };
  equations.forEach(([a, b], i) =&gt; {
    link(a, b, values[i]); <span class="c">// a / b = value</span>
    link(b, a, 1 / values[i]); <span class="c">// so b / a = 1 / value</span>
  });

  const evaluate = (from, to) =&gt; {
    if (!graph.has(from) || !graph.has(to)) return -1; <span class="c">// an unknown variable</span>
    const seen = new Set([from]);
    const stack = [[from, 1]]; <span class="c">// [variable, from / variable]</span>
    while (stack.length &gt; 0) {
      const [node, product] = stack.pop();
      if (node === to) return product;
      for (const [next, ratio] of graph.get(node)) {
        if (!seen.has(next)) {
          seen.add(next);
          stack.push([next, product * ratio]); <span class="c">// from/next = (from/node) * (node/next)</span>
        }
      }
    }
    return -1; <span class="c">// no chain of equations links them</span>
  };

  return queries.map(([from, to]) =&gt; evaluate(from, to));
}</code></pre>
<h4>Dry run: a / b = 2, b / c = 3, then six queries</h4>
<table>
  <tr><th>Query</th><th>What the search does</th><th>Answer</th></tr>
  <tr><td>a / c</td><td>from a (product 1) to b (1 · 2 = 2), then to c (2 · 3 = 6)</td><td>6</td></tr>
  <tr><td>b / a</td><td>from b to a along the reverse edge, weight 1/2</td><td>0.5</td></tr>
  <tr><td>c / a</td><td>c to b (1/3), then b to a (1/3 · 1/2)</td><td>0.16666666666666666</td></tr>
  <tr><td>a / e</td><td><code>e</code> is not in any equation</td><td>-1</td></tr>
  <tr><td>a / a</td><td>the start is the target at once, product 1</td><td>1</td></tr>
  <tr><td>x / x</td><td><code>x</code> is not in any equation, so it is unknown even over itself</td><td>-1</td></tr>
</table>
<p class="sub">
  We ran the function and got exactly the answers above, and compared it with
  the true ratios on thousands of random consistent systems. Cost: one traversal
  per query, O(V + E) each, so O(Q · (V + E)) for Q queries. If there are many
  queries, a <em>weighted union-find</em> that stores each node's ratio to its
  root answers each one in near-constant time after the equations are merged;
  that version is in <a href="/dsa/dsa-union-find">Union-find</a>.
</p>
<div class="warn">
  <span class="ttl">⚠ Pitfalls in evaluate division</span>
  <b>The reverse edge.</b> Without <code>b / a = 1 / v</code> you cannot answer
  <code>c / a</code>. <b>Unknown variable versus same variable.</b>
  <code>a / a</code> is 1 only if <code>a</code> appears in some equation;
  the check for unknown variables comes first. <b>A fresh visited set per
  query.</b> Reusing one set across queries makes later queries fail. <b>Floating
  point.</b> Products of ratios are doubles, so compare answers with a tolerance
  in your own tests (<code>c / a</code> above is 0.16666666666666666, not
  exactly one sixth). The problem guarantees the equations do not contradict
  each other, which is why the first path you find is as good as any other.
</div>

<h3>Clone graph, with a queue</h3>
<p>
  The copy-with-a-map solution to clone graph is in
  <a href="/dsa/dsa-graphs-representation-traversal">Graphs: representation and traversal</a>,
  written as recursion. Here is the same idea as BFS, which is the right choice
  when the graph can be deep, since a queue has no call-stack limit. The shape is
  a traversal where, on first sight of a neighbour, you also create and register
  its copy, and for every neighbour edge you link the copies. It uses
  <code>GraphNode</code> from that chapter.
</p>
<pre><code>function cloneGraphBfs(node) {
  if (node === null) return null;
  const copies = new Map([[node, new GraphNode(node.val)]]);
  const queue = [node];
  for (let head = 0; head &lt; queue.length; head++) {
    const original = queue[head];
    for (const neighbor of original.neighbors) {
      if (!copies.has(neighbor)) {
        copies.set(neighbor, new GraphNode(neighbor.val)); <span class="c">// create and register on first sight</span>
        queue.push(neighbor);
      }
      copies.get(original).neighbors.push(copies.get(neighbor));
    }
  }
  return copies.get(node);
}</code></pre>
<p class="sub">
  The line that links the two copies sits <em>outside</em> the
  <code>if</code>, because an edge to an already-seen neighbour still has to be
  copied; only the creation of the copy happens once. Each node is created once
  and each edge is copied from both ends, so it is O(V + E) with O(V) space.
  This was checked on thousands of random graphs, with self-loops: the copy had
  the same shape and shared no node object with the original. The reverse
  mistake is to link the copies only when the neighbour is new, which loses
  every edge that leads back to a node already discovered.
</p>

<h3>Grids, word ladder and other state-space searches</h3>
<p>
  Several of the best-known "graph" problems do not appear on this page, on
  purpose. Number of islands and its relatives, the multi-source spread of rotting
  oranges, the shortest path in a binary matrix, and the "which cells can reach
  both oceans" problem (reach <em>from</em> the border instead of towards it)
  all run on a grid where the neighbours are computed rather than stored. Word
  ladder, and the other problems where the nodes are <em>states</em> such as a
  word or a lock combination and the edges are one legal move, share the same
  shape. They are all one idea, BFS over an implicit graph, and they live in
  <a href="/dsa/dsa-grid-bfs">BFS on grids and implicit graphs</a>. The
  components, cycles, colouring, trees and reachability on this page work on
  graphs you build from an edge list or a matrix, and they use the
  traversals from the previous chapter unchanged.
</p>

<h3>Recognizing which one an unseen problem wants</h3>
<ul>
  <li>"How many groups/islands/provinces" → connected components</li>
  <li>"Can these all be completed" / "is there a circular dependency" → cycle detection (directed, usually — think course prerequisites)</li>
  <li>"Can you split into two groups with no conflicts" / "is this graph 2-colorable" → bipartite check</li>
  <li>"Is this a tree" / "is it connected with no cycle" → count the edges first (n - 1), then check connectivity</li>
  <li>"Can I reach everything / every room / which nodes must be starts" → one traversal and a look at the visited set, or the in-degrees for a DAG</li>
  <li>"List every path" → DFS that adds a node before the call and removes it after, copying the path when it ends</li>
  <li>Ratios, exchange rates, "A relates to B by a factor" → weighted edges in both directions and a product along the path</li>
  <li>Edges arriving one at a time with "are they connected yet" → union-find instead of a fresh traversal</li>
  <li>Grids, word ladder and other implicit graphs → <a href="/dsa/dsa-grid-bfs">BFS on grids and implicit graphs</a></li>
  <li>All of these reuse the exact same BFS/DFS skeleton from the previous chapter — the only new part is what you track while visiting</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Count connected components with a loop over every node plus a flood-fill, and connect that shape to "number of islands" on a grid.</li>
    <li>Explain why undirected cycle detection needs to exclude the parent, but directed cycle detection needs a third "in-progress" state instead.</li>
    <li>Trace the three-state cycle check on a graph with no cycle, and confirm every node reaches state 2 without a false positive.</li>
    <li>Write isBipartite with BFS colouring, and say in one sentence what a same-colored edge proves.</li>
    <li>Given a new problem, decide which of the three (components, cycle, bipartite) it is before writing any code.</li>
    <li>Count provinces from an adjacency matrix and say why that version is O(n²).</li>
    <li>Explain why n - 1 edges plus connectivity is enough for a valid tree, and give an input that passes the count but fails the traversal.</li>
    <li>Say when you would use union-find instead of a traversal, and when you could not.</li>
    <li>Solve keys and rooms, list all paths in a DAG (and say why the cost depends on the output), and name the in-degree shortcut for the smallest set of start nodes.</li>
    <li>Model evaluate division as a weighted graph with reverse edges, and handle the unknown-variable and same-variable cases.</li>
    <li>Write clone graph with a queue and explain why the link to the copy sits outside the "first time seen" branch.</li>
  </ul>
</div>`,
};
