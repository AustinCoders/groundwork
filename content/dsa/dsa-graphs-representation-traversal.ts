import type { Chapter } from "../types";

export const dsaGraphsRepresentationTraversal: Chapter = {
  id: "dsa-graphs-representation-traversal",
  num: "I5",
  title: "Graphs: representation & traversal",
  short: "Graphs: representation",
  levels: ["intermediate"],
  prerequisites: ["dsa-stacks-queues", "dsa-basic-recursion"],
  practice: [
    "ex-number-of-islands",
    "ex-max-area-of-island",
    "ex-clone-graph",
    "ex-rotting-oranges",
    "ex-surrounded-regions",
    "ex-edges-to-adjacency-list",
    "ex-valid-path-exists",
    "ex-shortest-path-unweighted",
    "ex-label-components",
    "ex-iterative-dfs-order",
    "ex-nodes-at-distance-k",
    "ex-find-town-judge",
    "ex-number-of-connected-components",
  ],
  ready: true,
  subtitle: "A tree is a graph with no cycles and one root — now drop both restrictions.",
  body: `<h3>A graph is nodes plus connections, nothing more</h3>
<p>
  Trees have exactly one root and no cycles. A graph relaxes both: any
  node can connect to any other node, connections can be one-way
  (directed) or two-way (undirected), and cycles are allowed. That
  generality is why graphs model almost anything — social networks, road
  maps, dependency chains, web pages linking to each other.
</p>
<figure>
  <svg viewBox="0 0 640 265" class="dg" role="img" aria-label="A small undirected graph with five nodes and edges connecting them, some forming a cycle">
    <g class="rough">
      <path class="ln" d="M100,60 L280,40" />
      <path class="ln" d="M100,60 L100,180" />
      <path class="ln" d="M280,40 L440,110" />
      <path class="ln" d="M100,180 L280,190" />
      <path class="ln" d="M280,190 L440,110" />
      <path class="ln" d="M280,40 L280,190" />
    </g>
    <g class="rough">
      <circle class="box" cx="100" cy="60" r="24" />
      <circle class="box" cx="280" cy="40" r="24" />
      <circle class="box" cx="440" cy="110" r="24" />
      <circle class="box" cx="100" cy="180" r="24" />
      <circle class="box" cx="280" cy="190" r="24" />
    </g>
    <text class="sm" x="100" y="65" text-anchor="middle">A</text>
    <text class="sm" x="280" y="45" text-anchor="middle">B</text>
    <text class="sm" x="440" y="115" text-anchor="middle">C</text>
    <text class="sm" x="100" y="185" text-anchor="middle">D</text>
    <text class="sm" x="280" y="195" text-anchor="middle">E</text>
    <text class="lbl" x="20" y="235" style="font-size:14px">A-B-E-D-A is a cycle — something a tree can never have</text>
  </svg>
  <figcaption>No single root, connections in any direction, and a cycle (A→B→E→D→A) — none of these are tree-legal.</figcaption>
</figure>

<h3>Two ways to store one, and when each wins</h3>
<figure>
  <svg viewBox="0 0 640 180" class="dg" role="img" aria-label="The same graph stored as an adjacency list versus an adjacency matrix">
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="280" height="140" rx="6" />
      <rect class="box" x="340" y="20" width="280" height="140" rx="6" />
    </g>
    <text class="lbl" x="40" y="45" style="font-size:15px">Adjacency list</text>
    <text class="sm" x="40" y="70">A → [B, D]</text>
    <text class="sm" x="40" y="90">B → [A, C, E]</text>
    <text class="sm" x="40" y="110">C → [B, E]</text>
    <text class="sm" x="40" y="130">D → [A, E]</text>
    <text class="sm" x="40" y="150">E → [B, C, D]</text>
    <text class="lbl" x="360" y="45" style="font-size:15px">Adjacency matrix</text>
    <text class="sm" x="360" y="70">    A B C D E</text>
    <text class="sm" x="360" y="88">A [ 0 1 0 1 0 ]</text>
    <text class="sm" x="360" y="106">B [ 1 0 1 0 1 ]</text>
    <text class="sm" x="360" y="124">C [ 0 1 0 0 1 ]</text>
    <text class="sm" x="360" y="142">D [ 1 0 0 0 1 ]</text>
  </svg>
  <figcaption>List: compact, fast to iterate neighbors. Matrix: O(1) "are X and Y connected," O(V²) space.</figcaption>
</figure>
<table>
  <tr><th></th><th>Adjacency list</th><th>Adjacency matrix</th></tr>
  <tr><td>Space</td><td>O(V + E)</td><td>O(V²) — wasteful for sparse graphs</td></tr>
  <tr><td>"Are X, Y connected?"</td><td>O(degree of X)</td><td>O(1)</td></tr>
  <tr><td>"Give me all of X's neighbors"</td><td>O(degree of X) — direct</td><td>O(V) — scan the whole row</td></tr>
  <tr><td>Best for</td><td>most real interview graphs (sparse)</td><td>dense graphs, or when O(1) edge lookup matters most</td></tr>
</table>
<pre><code><span class="c">// building an adjacency list from an edge list — the shape you'll write constantly</span>
function buildGraph(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u); <span class="c">// omit this line for a DIRECTED graph</span>
  }
  return graph;
}</code></pre>

<h3>Weighted, directed and labelled graphs</h3>
<p>
  The adjacency list above is the shape you want to <em>work</em> in, but
  problems rarely hand it to you that way. Three inputs turn up again and
  again, and the first move in every solution is to convert the input into
  a form where "give me the neighbours of x" is one lookup.
</p>
<table>
  <tr><th>You are given</th><th>Example</th><th>Convert to</th><th>Cost</th></tr>
  <tr><td>an edge list</td><td><code>n = 4, edges = [[0, 1], [1, 2], [2, 3]]</code></td><td>adjacency list</td><td>O(V + E)</td></tr>
  <tr><td>an adjacency matrix</td><td><code>[[0, 1, 0], [1, 0, 1], [0, 1, 0]]</code></td><td>usually nothing: scan a row for neighbours</td><td>O(V) per node, O(V²) for the whole graph</td></tr>
  <tr><td>an adjacency list already</td><td><code>graph[i]</code> = neighbours of <code>i</code></td><td>nothing; read it as is</td><td>O(1)</td></tr>
  <tr><td>labels that are not 0 to n - 1</td><td><code>[["a", "b"], ["b", "c"]]</code></td><td>a <code>Map</code> from label to neighbour array</td><td>O(V + E)</td></tr>
</table>
<h4>Weights</h4>
<p>
  If an edge carries a number, a distance, cost or probability, store that
  number next to the neighbour. In a list each entry becomes a pair
  <code>[neighbour, weight]</code>. In a matrix each cell holds the weight
  instead of 1, and "no edge" needs a value that cannot be a real weight.
  <code>0</code> is a poor choice, because a free edge is legal in many
  problems; <code>Infinity</code> works with <code>Math.min</code>.
</p>
<pre><code>function buildWeighted(n, edges, directed = false) {
  const graph = Array.from({ length: n }, () =&gt; []);
  for (const [u, v, w] of edges) {
    graph[u].push([v, w]); <span class="c">// every entry is [neighbour, weight]</span>
    if (!directed &amp;&amp; u !== v) graph[v].push([u, w]); <span class="c">// an undirected edge is stored from both ends</span>
  }
  return graph;
}</code></pre>
<p class="sub">
  A <b>directed</b> graph stores the edge once, at <code>u</code>. An
  <b>undirected</b> graph stores it at both ends, so every edge appears
  twice in the lists: the total list length is 2E for E undirected edges,
  while "E" in O(V + E) still counts each edge once. A self-loop
  <code>[u, u]</code> would be pushed twice onto the same list if we did not
  guard, which is the reason for the <code>u !== v</code> test.
</p>
<h4>Converting back and forth</h4>
<p>
  Sometimes the algorithm wants a different shape than the input. Edge-list
  algorithms (Kruskal's minimum spanning tree, for example) want the list
  of edges, and Floyd–Warshall wants a matrix. These conversions are short
  and worth being able to write without thinking.
</p>
<pre><code>function listToEdges(graph, directed = false) {
  const edges = [];
  graph.forEach((neighbours, u) =&gt; {
    for (const [v, w] of neighbours) {
      if (directed || u &lt;= v) edges.push([u, v, w]); <span class="c">// undirected: report each edge once</span>
    }
  });
  return edges;
}</code></pre>
<pre><code>function listToMatrix(graph) {
  const n = graph.length;
  const matrix = Array.from({ length: n }, () =&gt; new Array(n).fill(Infinity)); <span class="c">// Infinity = no edge</span>
  graph.forEach((neighbours, u) =&gt; {
    for (const [v, w] of neighbours) matrix[u][v] = Math.min(matrix[u][v], w); <span class="c">// a matrix holds one weight per pair</span>
  });
  return matrix;
}

function matrixToList(matrix) {
  return matrix.map((row) =&gt; {
    const neighbours = [];
    row.forEach((w, v) =&gt; {
      if (w !== Infinity) neighbours.push([v, w]);
    });
    return neighbours;
  });
}</code></pre>
<p class="sub">
  <code>listToEdges</code> keeps an undirected edge only from its smaller
  end (<code>u &lt;= v</code>), so each one comes out once.
  <code>listToMatrix</code> is O(V²) in space whatever the edge count, and a
  matrix has one cell per pair, so two parallel edges between the same pair
  are squeezed into one cell, keeping the cheaper. Going list to edges and
  back to a list gives the same edges. We checked these four functions by
  converting thousands of random graphs, with parallel edges and
  self-loops, back and forth and comparing the edges.
</p>
<h4>Labels that are not numbers</h4>
<p>
  When nodes are names (words, city codes, variables in an equation) use a
  <code>Map</code> from the label to its neighbour array. Do not use a plain
  object: object keys are always strings, so a node labelled with the
  number 1 is stored under <code>"1"</code>, and the check
  <code>visited.has(1)</code> is then false for a visited set that holds
  <code>"1"</code>. We tried it: <code>new Set([1]).has("1")</code> is
  <code>false</code>.
</p>
<pre><code>function buildLabelled(nodes, edges) {
  const graph = new Map();
  for (const node of nodes) graph.set(node, []); <span class="c">// isolated nodes only exist because we list them here</span>
  for (const [u, v] of edges) {
    graph.get(u).push(v);
    graph.get(v).push(u);
  }
  return graph;
}</code></pre>
<p class="sub">
  The first loop is not decoration. An edge list can only mention nodes that
  have at least one edge, so a node with no edges would never appear in the
  map and its component would be missed. If the statement gives the node
  list or a count <code>n</code>, build from that, not from the edges.
</p>
<div class="warn">
  <span class="ttl">⚠ Five ways the build step goes wrong</span>
  <b>1.</b> <code>new Array(n).fill([])</code> puts the <em>same</em> array
  in every slot, so pushing into one neighbour list pushes into all of them.
  We ran <code>const g = Array(3).fill([]); g[0].push(9)</code> and got
  <code>[[9], [9], [9]]</code>. Use <code>Array.from({ length: n }, () =&gt; [])</code>.
  <b>2.</b> Nodes numbered from 1: allocate <code>n + 1</code> slots (or
  subtract one everywhere). Reading <code>graph[n]</code> of an array of
  length <code>n</code> gives <code>undefined</code>, and the next
  <code>.push</code> throws a <code>TypeError</code>.
  <b>3.</b> Forgetting to add the reverse edge for an undirected graph, or
  adding it for a directed one. Read the statement for the word "directed".
  <b>4.</b> Inferring <code>n</code> from the largest label in the edges and
  losing isolated nodes at the end.
  <b>5.</b> Matrix input where <code>matrix[i][i]</code> is 1: that is a
  self-loop, not an edge to a neighbour, and it can look like an unvisited
  neighbour if you do not mark visited first.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll turn the edge list into
  an adjacency list so a node's neighbours are one lookup. That's O(V + E)
  space and time, and each undirected edge goes in both lists. Do the
  weights matter? If they do, each entry becomes a neighbour-and-weight
  pair."
</div>

<h3>DFS — go deep, backtrack when stuck</h3>
<figure>
  <svg viewBox="0 0 640 175" class="dg" role="img" aria-label="Depth-first search order shown as numbered steps diving deep before backtracking">
    <g class="rough">
      <circle class="boxy" cx="60" cy="70" r="24" />
      <circle class="box" cx="200" cy="70" r="24" />
      <circle class="box" cx="340" cy="70" r="24" />
      <circle class="box" cx="200" cy="20" r="0" />
    </g>
    <path class="ln" d="M84,70 L176,70" marker-end="url(#dgarrow2)" />
    <path class="ln" d="M224,70 L316,70" marker-end="url(#dgarrow2)" />
    <path class="lnr dash" d="M340,95 C 280,150 120,150 60,95" marker-end="url(#dgarrow2)" />
    <defs>
      <marker id="dgarrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="sm" x="60" y="75" text-anchor="middle">1st</text>
    <text class="sm" x="200" y="75" text-anchor="middle">2nd</text>
    <text class="sm" x="340" y="75" text-anchor="middle">3rd</text>
    <text class="sm rd" x="20" y="165">dead end — backtrack to find any unvisited neighbor</text>
  </svg>
  <figcaption>DFS commits to one path fully before ever considering an alternative.</figcaption>
</figure>
<pre><code><span class="c">// recursive DFS — the call stack IS the "backtrack" mechanism, for free</span>
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
  return visited;
}

<span class="c">// iterative DFS — an explicit stack instead of recursion; reaches the same nodes, but not always in the same order</span>
function dfsIterative(graph, start) {
  const visited = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    console.log(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return visited;
}</code></pre>
<p class="sub">
  Both visit exactly the same set of nodes, but the order can differ. On
  the diamond <code>0:[1,2]</code>, <code>1:[3]</code>,
  <code>2:[3]</code> the recursive version prints 0, 1, 3, 2, while the
  iterative one pushes 1 then 2 and pops 2 first, so it prints 0, 2, 3, 1.
  Both are valid depth-first orders. To get the recursive order exactly,
  mark a node visited when you pop it (skipping it if it is already
  visited) and push its neighbours in reverse, as the demo below does.
</p>

<h3>DFS and the call stack: when recursion runs out</h3>
<p>
  Recursive DFS is short and easy to read, and it has one hidden cost: every
  active call holds a frame on the call stack until it returns. When DFS
  dives down a path, the number of frames alive at once equals the length of
  the path it is on. On a graph that is one long chain, a linked list that is
  also a graph, a one-row grid, or a tree that has leaned to one side, that
  path has V nodes. The work is still O(V + E), but the <em>stack</em> is V
  frames deep, and the stack is a small fixed-size area, not the whole
  heap.
</p>
<p>
  The failure is easy to see. We ran the chapter's recursive
  <code>dfs</code> in Node 24 over a chain <code>0 → 1 → 2 → ...</code>. A
  chain of 3,000 nodes finished, and a chain of 10,000 nodes threw
  <code>RangeError: Maximum call stack size exceeded</code>. The point where
  it breaks depends on the engine, the size of each frame and the stack
  that is available (it also moves with how warm the code is), so do not memorise a number: remember that it is
  <em>thousands</em>, not hundreds of thousands.
</p>
<div class="warn">
  <span class="ttl">⚠ Check the constraints before you pick recursion</span>
  If the statement says up to 10⁵ nodes, or a grid with a million cells, a
  recursive DFS can fail on the single input an interviewer will try: a
  chain, or a grid full of land. Say it aloud. "Recursion depth could reach
  V, so I'll use an explicit stack" is a sentence that earns points.
</div>
<h4>Turn the recursion into data</h4>
<p>
  A recursive call remembers two things: <em>which node</em> it is working
  on, and <em>how far through its neighbour loop</em> it has got. If you
  store exactly that, a pair <code>[node, index of the next neighbour]</code>
  per call, on your own array, you have the call stack as data, and the
  array lives on the heap, so its size is limited by memory, not by the
  stack. The single-stack-of-nodes version earlier in the chapter loses the
  loop position, and with it the exact recursive order and any chance to
  act when a call <em>returns</em>. The frame version keeps all three.
</p>
<pre><code>function dfsIterative(graph, start) {
  const visited = new Set([start]);
  const order = [start];
  const stack = [[start, 0]]; <span class="c">// [node, index of the next neighbour to try]</span>
  while (stack.length &gt; 0) {
    const frame = stack[stack.length - 1];
    const [node, i] = frame;
    if (i === graph[node].length) {
      stack.pop(); <span class="c">// every neighbour tried: this is where the recursive call would return</span>
      continue;
    }
    frame[1]++;
    const next = graph[node][i];
    if (!visited.has(next)) {
      visited.add(next);
      order.push(next);
      stack.push([next, 0]); <span class="c">// this is the recursive call</span>
    }
  }
  return order;
}</code></pre>
<h4>Dry run: dfsIterative on 0:[1, 2], 1:[3], 2:[3], 3:[]</h4>
<table>
  <tr><th>Step</th><th>Top frame (node, next index)</th><th>What happens</th><th>Stack after, bottom to top</th><th>Order</th></tr>
  <tr><td>start</td><td>—</td><td>push the start</td><td>(0,0)</td><td>[0]</td></tr>
  <tr><td>1</td><td>(0,0)</td><td>neighbour 1 is new: visit it, push a frame</td><td>(0,1) (1,0)</td><td>[0, 1]</td></tr>
  <tr><td>2</td><td>(1,0)</td><td>neighbour 3 is new: visit it, push a frame</td><td>(0,1) (1,1) (3,0)</td><td>[0, 1, 3]</td></tr>
  <tr><td>3</td><td>(3,0)</td><td>no neighbours: pop, the call returns</td><td>(0,1) (1,1)</td><td>[0, 1, 3]</td></tr>
  <tr><td>4</td><td>(1,1)</td><td>all neighbours tried: pop</td><td>(0,1)</td><td>[0, 1, 3]</td></tr>
  <tr><td>5</td><td>(0,1)</td><td>neighbour 2 is new: visit it, push a frame</td><td>(0,2) (2,0)</td><td>[0, 1, 3, 2]</td></tr>
  <tr><td>6</td><td>(2,0)</td><td>neighbour 3 already seen: skip</td><td>(0,2) (2,1)</td><td>[0, 1, 3, 2]</td></tr>
  <tr><td>7</td><td>(2,1)</td><td>all neighbours tried: pop</td><td>(0,2)</td><td>[0, 1, 3, 2]</td></tr>
  <tr><td>8</td><td>(0,2)</td><td>all neighbours tried: pop</td><td>empty</td><td>[0, 1, 3, 2]</td></tr>
</table>
<p class="sub">
  The order 0, 1, 3, 2 is the one the recursive version gave in the earlier
  example, where the one-stack version printed 0, 2, 3, 1. Steps 3, 4, 7 and
  8 are the moments a recursive call would return. If a problem needs
  something done <em>after</em> all of a node's neighbours (a post-order
  action, such as computing a subtree size or marking a node "done" in cycle
  detection), that is where it goes. Cost: O(V + E) time, and the stack of
  frames holds at most V entries. We compared its order with the recursive
  one on thousands of random graphs, and ran it on a chain of 200,000 nodes,
  which the recursive version cannot do.
</p>
<p>
  Two other ways out. If the visiting <em>order</em> does not matter and you
  only need "what is reachable", BFS never recurses and has no such limit.
  And in an interview you rarely need to code the frame version unless the
  constraints force it: naming the limit and saying which of these two you
  would switch to is usually enough.
</p>

<h3>BFS — spread outward, layer by layer</h3>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="Breadth-first search expanding outward in concentric rings from the start node, one full layer at a time">
    <g class="rough">
      <circle class="boxy" cx="320" cy="85" r="24" />
      <circle class="box" cx="180" cy="45" r="22" />
      <circle class="box" cx="180" cy="125" r="22" />
      <circle class="box" cx="460" cy="45" r="22" />
      <circle class="box" cx="460" cy="125" r="22" />
      <circle class="box" cx="70" cy="85" r="20" />
      <circle class="box" cx="560" cy="85" r="20" />
    </g>
    <text class="sm" x="320" y="90" text-anchor="middle">start</text>
    <text class="sm" x="180" y="50" text-anchor="middle">layer 1</text>
    <text class="sm" x="180" y="130" text-anchor="middle">layer 1</text>
    <text class="sm" x="460" y="50" text-anchor="middle">layer 1</text>
    <text class="sm" x="460" y="130" text-anchor="middle">layer 1</text>
    <text class="sm" x="70" y="90" text-anchor="middle">L2</text>
    <text class="sm" x="560" y="90" text-anchor="middle">L2</text>
    <text class="lbl" x="20" y="165" style="font-size:14px">every layer-1 node visited BEFORE any layer-2 node —</text>
    <text class="lbl" x="20" y="185" style="font-size:14px">this is why BFS finds shortest paths</text>
  </svg>
  <figcaption>The queue enforces "finish this ring before starting the next" — the source of BFS's shortest-path guarantee.</figcaption>
</figure>
<pre><code>function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);   <span class="c">// mark visited when ENQUEUED, not when dequeued</span>
        queue.push(neighbor);
      }
    }
  }
  return order;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Mark visited on enqueue, not on dequeue</span>
  If you wait to mark a node visited until you dequeue it, the same node
  can be pushed onto the queue multiple times by different neighbors
  before it's ever processed — wasted work, and on a graph with cycles it
  can blow up badly. Mark it the instant it's added to the queue.
</div>

<h4>Dry run: bfs(graph, "A") on the five-node graph above</h4>
<table>
  <tr><th>Step</th><th>Dequeue</th><th>Neighbors checked</th><th>Newly enqueued</th><th>Queue after</th></tr>
  <tr><td>1</td><td>A</td><td>B, D</td><td>B, D</td><td>[B, D]</td></tr>
  <tr><td>2</td><td>B</td><td>A, C, E</td><td>C, E</td><td>[D, C, E]</td></tr>
  <tr><td>3</td><td>D</td><td>A, E</td><td>(none — both already seen)</td><td>[C, E]</td></tr>
  <tr><td>4</td><td>C</td><td>B, E</td><td>(none — both already seen)</td><td>[E]</td></tr>
  <tr><td>5</td><td>E</td><td>B, C, D</td><td>(none — all already seen)</td><td>[]</td></tr>
</table>
<p class="sub">
  Visit order: A, B, D, C, E. D gets enqueued at step 1 even though it's
  processed after B and before C — that's the queue's FIFO order at work,
  not the order neighbors were listed in.
</p>

<h3>BFS with distances, and the path itself</h3>
<p>
  The BFS above only lists nodes in visiting order. Most problems ask for
  something more: <em>how many edges</em> to reach a node, or <em>which
  edges</em> to take. Both come from a small change to the same loop,
  because of one fact: the node that first reaches <code>next</code> is
  <code>node</code>, which sits one layer closer to the source. So the
  distance of <code>next</code> is the distance of <code>node</code> plus
  one, and the parent of <code>next</code> is <code>node</code>. Set both
  at the moment you enqueue, the same moment you would mark it visited.
</p>
<pre><code>function bfsDistances(graph, source) {
  const dist = new Array(graph.length).fill(-1); <span class="c">// -1 means "not reached yet"</span>
  dist[source] = 0;
  const queue = [source];
  for (let head = 0; head &lt; queue.length; head++) {
    const node = queue[head];
    for (const next of graph[node]) {
      if (dist[next] === -1) {
        dist[next] = dist[node] + 1; <span class="c">// one edge further than the node that found it</span>
        queue.push(next);
      }
    }
  }
  return dist;
}</code></pre>
<p class="sub">
  The distance array does double duty. <code>-1</code> means "not seen", so
  it replaces the visited set, and anything still <code>-1</code> at the end
  is unreachable from the source. Time O(V + E), space O(V). The queue uses
  a moving <code>head</code> index in place of <code>shift()</code>: an array
  used as a queue with <code>shift()</code> can cost O(n) per removal on a
  long array, which would make the loop quadratic, whereas the head index
  makes each removal O(1) and keeps the array as a log of visited nodes.
</p>
<p>
  To get the path, record <em>who found each node</em>. Following those
  parent links from the target back to the source gives the path in reverse.
</p>
<pre><code>function shortestPath(graph, source, target) {
  const parent = new Array(graph.length).fill(-2); <span class="c">// -2 = unseen, -1 = the source has no parent</span>
  parent[source] = -1;
  const queue = [source];
  for (let head = 0; head &lt; queue.length &amp;&amp; parent[target] === -2; head++) {
    const node = queue[head];
    for (const next of graph[node]) {
      if (parent[next] === -2) {
        parent[next] = node; <span class="c">// remember who discovered it</span>
        queue.push(next);
      }
    }
  }
  if (parent[target] === -2) return null; <span class="c">// never reached</span>
  const path = [];
  for (let at = target; at !== -1; at = parent[at]) path.push(at); <span class="c">// walk back from the target</span>
  return path.reverse();
}</code></pre>
<h4>Dry run: shortestPath(graph, A, C) on the five-node graph, with A to E as 0 to 4</h4>
<p>
  The adjacency lists are A:[B, D], B:[A, C, E], C:[B, E], D:[A, E],
  E:[B, C, D]. The loop stops as soon as the target has a parent.
</p>
<table>
  <tr><th>Dequeue</th><th>Newly found (distance, parent)</th><th>Queue after</th></tr>
  <tr><td>A</td><td>B (1, A), D (1, A)</td><td>B, D</td></tr>
  <tr><td>B</td><td>C (2, B), E (2, B)</td><td>D, C, E — C now has a parent, so the loop ends</td></tr>
</table>
<p class="sub">
  Walking back from C: C's parent is B, B's parent is A, A's parent is
  <code>-1</code>, so the reversed list is <code>[A, B, C]</code>, which has
  two edges, matching distance 2. Notice that E also has distance 2 (through
  B) even though the loop stopped before processing it.
</p>
<div class="warn">
  <span class="ttl">⚠ What this does and does not promise</span>
  The path is <em>a</em> shortest one in number of edges. Several can tie
  (here A to E is [A, B, E], and A, D, E is just as short), and which one you
  get depends on the order of the neighbour lists. If the problem asks for
  <em>all</em> shortest paths, or the lexicographically smallest, you need
  more than one parent per node. And BFS counts edges, not weights. On a
  weighted graph the fewest-edge path is not the cheapest one; that is the
  job of Dijkstra's algorithm in
  <a href="/dsa/dsa-advanced-graph-algorithms">Advanced graph algorithms</a>.
  Stopping as soon as the target is <em>discovered</em>, as the loop does, is
  safe because a node's parent and distance never change once they are set.
  And when the source equals the target the answer is the one-node path
  <code>[source]</code>, which the code above returns.
</div>
<p>
  We checked <code>bfsDistances</code> and <code>shortestPath</code>
  against a plain relaxation search on thousands of random directed and
  undirected graphs: the distances matched, and every returned path starts
  at the source, ends at the target, uses real edges and has exactly the
  shortest length.
</p>

<h3>Watch both traversals</h3>
<div class="demo" id="gt">
  <div class="demo__bar">BFS and DFS on the same graph, starting from A</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <svg viewBox="0 0 360 170" role="img" aria-label="A graph of seven nodes, A to G" id="gt-svg" style="max-width:100%;height:auto"></svg>
        <p>
          <label>Traversal
            <select id="gt-mode">
              <option value="bfs">BFS: queue, first in first out</option>
              <option value="dfs">DFS: stack, last in first out</option>
            </select>
          </label>
        </p>
        <div class="loop-code" id="gt-code"></div>
        <p class="loop-step" id="gt-step"></p>
        <div class="demo__ctl">
          <button class="btn" id="gt-prev" type="button">← Back</button>
          <button class="btn" id="gt-next" type="button">Next step →</button>
          <button class="btn btn--ghost" id="gt-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box"><div class="loop-box__label" id="gt-frontier-label">Queue</div><div id="gt-frontier"></div></div>
        <div class="loop-box"><div class="loop-box__label">Visit order</div><div id="gt-order"></div></div>
      </div>
    </div>
    <p class="demo__note" id="gt-note" aria-live="polite"></p>
  </div>
</div>
<script>
(function () {
  var POS = { A: [40, 85], B: [120, 35], C: [120, 135], D: [210, 35], E: [210, 135], F: [290, 85], G: [335, 150] };
  var EDGES = [["A","B"],["A","C"],["B","D"],["C","E"],["D","F"],["E","F"],["E","G"]];
  var ADJ = {};
  Object.keys(POS).forEach(function (n) { ADJ[n] = []; });
  EDGES.forEach(function (e) { ADJ[e[0]].push(e[1]); ADJ[e[1]].push(e[0]); });
  Object.keys(ADJ).forEach(function (n) { ADJ[n].sort(); });

  var CODES = {
    bfs: ["queue = [A]; seen = {A}", "while (queue.length) {", "  n = queue.shift()", "  for (m of adj[n])", "    if (!seen.has(m))", "      { seen.add(m); queue.push(m) }", "}"],
    dfs: ["stack = [A]; visited = {}", "while (stack.length) {", "  n = stack.pop()", "  if (visited.has(n)) continue", "  visited.add(n)", "  for (m of adj[n].reverse())", "    if (!visited.has(m)) stack.push(m)", "}"]
  };

  function bfs() {
    var out = [{ line: 1, cur: null, frontier: ["A"], visited: ["A"], order: [], note: "Start: put A in the queue and mark it seen." }];
    var queue = ["A"], seen = { A: true }, visited = ["A"], order = [];
    while (queue.length) {
      var n = queue.shift();
      order.push(n);
      var added = [];
      ADJ[n].forEach(function (m) { if (!seen[m]) { seen[m] = true; visited.push(m); queue.push(m); added.push(m); } });
      out.push({ line: added.length ? 6 : 3, cur: n, frontier: queue.slice(), visited: visited.slice(), order: order.slice(),
        note: "Take " + n + " from the front. " + (added.length ? "Its unseen neighbours " + added.join(", ") + " join the back, marked seen now so nothing is queued twice." : "No unseen neighbours.") });
    }
    return out;
  }
  function dfs() {
    var out = [{ line: 1, cur: null, frontier: ["A"], visited: [], order: [], note: "Start: push A on the stack." }];
    var stack = ["A"], visited = [], order = [];
    while (stack.length) {
      var n = stack.pop();
      if (visited.indexOf(n) !== -1) {
        out.push({ line: 4, cur: null, frontier: stack.slice(), visited: visited.slice(), order: order.slice(), note: "Pop " + n + ": already visited, so skip it. The stack can hold duplicates; visited is checked on the way out." });
        continue;
      }
      visited.push(n);
      order.push(n);
      var pushed = [];
      ADJ[n].slice().reverse().forEach(function (m) { if (visited.indexOf(m) === -1) { stack.push(m); pushed.push(m); } });
      out.push({ line: pushed.length ? 7 : 5, cur: n, frontier: stack.slice(), visited: visited.slice(), order: order.slice(),
        note: "Pop " + n + " from the top and visit it. " + (pushed.length ? "Push its neighbours (" + pushed.slice().reverse().join(", ") + "), smallest on top, so the search goes deep first." : "Nothing new to push: backtrack.") });
    }
    return out;
  }
  var mode = document.getElementById("gt-mode");
  var steps = bfs(), i = 0;
  var svg = document.getElementById("gt-svg");
  var next = document.getElementById("gt-next"), prev = document.getElementById("gt-prev");

  function render() {
    var s = steps[i];
    var html = EDGES.map(function (e) {
      return '<line class="viz-edge" x1="' + POS[e[0]][0] + '" y1="' + POS[e[0]][1] + '" x2="' + POS[e[1]][0] + '" y2="' + POS[e[1]][1] + '"></line>';
    }).join("");
    Object.keys(POS).forEach(function (n) {
      var cls = "viz-vertex";
      if (s.visited.indexOf(n) !== -1) cls += " is-visited";
      if (s.cur === n) cls += " is-current";
      html += '<g class="' + cls + '"><circle cx="' + POS[n][0] + '" cy="' + POS[n][1] + '" r="16"></circle><text x="' + POS[n][0] + '" y="' + POS[n][1] + '">' + n + "</text></g>";
    });
    svg.innerHTML = html;
    var codeEl = document.getElementById("gt-code");
    var code = CODES[mode.value];
    if (codeEl.children.length !== code.length || codeEl.dataset.mode !== mode.value) {
      codeEl.innerHTML = "";
      codeEl.dataset.mode = mode.value;
      code.forEach(function (text, idx) {
        var row = document.createElement("div");
        row.dataset.n = String(idx + 1);
        row.textContent = text;
        codeEl.appendChild(row);
      });
    }
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    document.getElementById("gt-step").textContent = "Step " + (i + 1) + " of " + steps.length;
    document.getElementById("gt-frontier-label").textContent = mode.value === "bfs" ? "Queue (front on the left)" : "Stack (top on the right)";
    document.getElementById("gt-frontier").innerHTML = s.frontier.map(function (n) { return '<span class="loop-frame loop-frame--stack">' + n + "</span>"; }).join("") || "<em>empty</em>";
    document.getElementById("gt-order").innerHTML = s.order.map(function (n) { return '<span class="loop-frame loop-frame--out">' + n + "</span>"; }).join("") || "<em>nothing yet</em>";
    document.getElementById("gt-note").textContent = s.note + (i === steps.length - 1 ? " Done. Every node reached, in the order " + s.order.join(", ") + "." : "");
    prev.disabled = i === 0;
    next.disabled = i === steps.length - 1;
  }
  next.addEventListener("click", function () { if (i < steps.length - 1) { i++; render(); } });
  prev.addEventListener("click", function () { if (i > 0) { i--; render(); } });
  document.getElementById("gt-reset").addEventListener("click", function () { i = 0; render(); });
  mode.addEventListener("change", function () { steps = mode.value === "bfs" ? bfs() : dfs(); i = 0; render(); });
  render();
})();
</script>

<h3>Disconnected graphs: the outer loop</h3>
<p>
  Everything above grows from <em>one</em> start node, so it can only reach
  that node's component, the set of nodes joined to it by some path. If the
  graph falls into several pieces, one traversal sees one piece. Any problem
  about the <em>whole</em> graph ("visit everything", "count the pieces",
  "is there a cycle anywhere") therefore needs a loop around the traversal:
  try every node as a start, and skip the ones already reached.
</p>
<pre><code>function componentLabels(graph) {
  const label = new Array(graph.length).fill(-1);
  let count = 0;
  for (let start = 0; start &lt; graph.length; start++) {
    if (label[start] !== -1) continue; <span class="c">// an earlier start already reached it</span>
    label[start] = count;
    const queue = [start];
    for (let head = 0; head &lt; queue.length; head++) {
      for (const next of graph[queue[head]]) {
        if (label[next] === -1) {
          label[next] = count;
          queue.push(next);
        }
      }
    }
    count++;
  }
  return { label, count };
}</code></pre>
<h4>Dry run: 6 nodes, edges 0-1, 1-2, 3-4, node 5 alone</h4>
<table>
  <tr><th>Start</th><th>Already labelled?</th><th>Reaches</th><th>Label given</th><th>count after</th></tr>
  <tr><td>0</td><td>no</td><td>0, 1, 2</td><td>0</td><td>1</td></tr>
  <tr><td>1</td><td>yes (0)</td><td>—</td><td>—</td><td>1</td></tr>
  <tr><td>2</td><td>yes (0)</td><td>—</td><td>—</td><td>1</td></tr>
  <tr><td>3</td><td>no</td><td>3, 4</td><td>1</td><td>2</td></tr>
  <tr><td>4</td><td>yes (1)</td><td>—</td><td>—</td><td>2</td></tr>
  <tr><td>5</td><td>no</td><td>5</td><td>2</td><td>3</td></tr>
</table>
<p class="sub">
  The result is <code>label = [0, 0, 0, 1, 1, 2]</code> and
  <code>count = 3</code>. The traversal inside the loop starts at most once
  per node and looks at each edge a constant number of times in total, so the
  loop does not multiply the cost: the whole function is O(V + E), with O(V)
  space. A graph is <em>connected</em> exactly when <code>count</code> is 1.
  Checked on thousands of random graphs against a union-find count, and every
  edge joins two nodes with the same label.
</p>
<div class="warn">
  <span class="ttl">⚠ Where the outer loop is forgotten, and where it lies</span>
  Running one BFS from node 0 and reporting "visited everything" or "no cycle"
  is correct only if the graph is connected. Nodes with no edges are
  components too, which is why the loop runs over <code>graph.length</code>
  and not over the edge list. And on a <em>directed</em> graph the loop does
  not find "components" in the connected sense: starting from nodes in index
  order, a later start can reach nodes that an earlier start already
  labelled. For directed graphs the useful questions are reachability,
  cycles and ordering, which the next chapters cover. Counting pieces with
  this loop is the first problem in
  <a href="/dsa/dsa-graph-problems">Graph problems</a>.
</div>

<h3>DFS vs BFS — the complexity is identical, the use case isn't</h3>
<table>
  <tr><th></th><th>DFS</th><th>BFS</th></tr>
  <tr><td>Time</td><td>O(V + E)</td><td>O(V + E)</td></tr>
  <tr><td>Space</td><td>O(V) — recursion stack or explicit stack</td><td>O(V) — the queue, can hold a whole "ring"</td></tr>
  <tr><td>Finds shortest path (unweighted)?</td><td>no</td><td>yes — guaranteed</td></tr>
  <tr><td>Natural for</td><td>"does a path exist," cycle detection, backtracking-style exploration</td><td>shortest path, "closest," level-by-level problems</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Both visit every node and
  edge once, so they're both O(V + E) — the choice isn't about speed, it's
  about the guarantee I need. BFS explores in strict distance order, so
  it's the only one of the two that guarantees the first time I reach a
  node is via a shortest path."
</div>

<h3>Clone graph: copying a structure that has cycles</h3>
<p>
  Given one node of a connected undirected graph, build a <em>deep copy</em>:
  new node objects with the same values and the same connections, sharing
  nothing with the original. Copying a tree is a simple recursion: copy the
  node, copy each child. On a graph that same recursion never ends, because
  a node's neighbour has that node as <em>its</em> neighbour, so the copy
  of A asks for a copy of B, which asks for a copy of A, and so on.
</p>
<p>
  The fix is the same one that makes DFS finish: remember what you have
  already done. But here "done" is not enough, because you must also be able
  to <em>get the copy back</em> when you meet the node again, so the
  <code>Set</code> of visited nodes becomes a <code>Map</code> from each
  original to its copy. The one rule that matters is when you write to it:
  <b>before</b> you recurse into the neighbours, not after.
</p>
<pre><code>class GraphNode {
  constructor(val) {
    this.val = val;
    this.neighbors = [];
  }
}

function cloneGraph(node) {
  if (node === null) return null;
  const copies = new Map(); <span class="c">// original node -&gt; its copy</span>
  function copy(original) {
    if (copies.has(original)) return copies.get(original);
    const clone = new GraphNode(original.val);
    copies.set(original, clone); <span class="c">// register BEFORE visiting neighbours: this is what stops a cycle</span>
    for (const neighbor of original.neighbors) clone.neighbors.push(copy(neighbor));
    return clone;
  }
  return copy(node);
}</code></pre>
<h4>Dry run: the four-node cycle 1-2-3-4-1, called on node 1</h4>
<table>
  <tr><th>Call</th><th>In the map?</th><th>Action</th><th>Map after</th></tr>
  <tr><td>copy(1)</td><td>no</td><td>make 1', register it, go through neighbours 2 and 4</td><td>1→1'</td></tr>
  <tr><td>copy(2)</td><td>no</td><td>make 2', register it, go through neighbours 1 and 3</td><td>1→1', 2→2'</td></tr>
  <tr><td>copy(1) again</td><td>yes</td><td>return 1' at once, no recursion</td><td>unchanged</td></tr>
  <tr><td>copy(3)</td><td>no</td><td>make 3', register, neighbours 2 and 4</td><td>…, 3→3'</td></tr>
  <tr><td>copy(2) again</td><td>yes</td><td>return 2'</td><td>unchanged</td></tr>
  <tr><td>copy(4)</td><td>no</td><td>make 4', register, go through neighbours 3 and 1</td><td>…, 4→4'</td></tr>
  <tr><td>copy(3) again, copy(1) again (from 4)</td><td>yes, both</td><td>return 3' and 1' at once, so 4' gets neighbours [3', 1']</td><td>unchanged</td></tr>
  <tr><td>copy(4) again (from 1)</td><td>yes</td><td>return 4', so 1' gets neighbours [2', 4']</td><td>unchanged</td></tr>
</table>
<p class="sub">
  Every node is created once, and every edge is followed once from each end,
  so the time is O(V + E) and the map and the recursion use O(V) space. The
  recursion depth is up to V, so the warning about call stacks applies here
  too: with a very long chain the same algorithm needs a BFS or an explicit
  stack. We tested it on thousands of random graphs, including self-loops,
  checking that the copy has the same shape, that no node object is shared
  with the original, and that every neighbour of a copy is itself a copy.
</p>
<div class="warn">
  <span class="ttl">⚠ Four ways clone graph goes wrong</span>
  <b>1.</b> Registering the copy <em>after</em> the neighbour loop: the
  recursion goes round the cycle before anything is in the map, and ends in
  a stack overflow. <b>2.</b> Keying the map by <code>node.val</code> when
  values might repeat; key by the node object itself, since a
  <code>Map</code> can use objects as keys. <b>3.</b> Sharing the neighbour
  array instead of building a new one: <code>clone.neighbors =
  original.neighbors</code> would point the copy back into the original
  graph. <b>4.</b> Forgetting the empty input: <code>cloneGraph(null)</code>
  must return <code>null</code>.
</div>
<p>
  The idea behind it is wider than this one problem. When a traversal must
  produce a <em>result for every node</em> (a copy, a label, a distance), the
  visited set grows into a map from node to result, and you fill the entry
  before going deeper. You have just seen it three times: the distance array,
  the label array, and the copy map.
</p>

<h3>A grid is a graph you never build</h3>
<p>
  A grid problem hands you no edge list, but it is a graph all the same:
  each cell is a node, and two cells are joined when you can step from one
  to the other. You do not need to build an adjacency list. A cell's
  neighbours are computed on the spot from its row and column, and a cell is
  recorded as visited in a second grid, a set of strings or a set of numbers
  such as <code>row * columns + column</code>. A graph whose edges are
  computed rather than stored is an <b>implicit graph</b>, and everything in
  this chapter (the queue, the distances, the visited marking on enqueue)
  works on it unchanged.
</p>
<p>
  The details of grids, the four-direction arrays, the boundary checks,
  flood fill, several sources at once and "reach from the border" problems,
  as well as searching over states that are not cells, such as word ladder,
  have their own chapter:
  <a href="/dsa/dsa-grid-bfs">BFS on grids and implicit graphs</a>. The
  component-counting and cycle problems that sit on top of plain graphs are
  in <a href="/dsa/dsa-graph-problems">Graph problems</a>.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Input described as nodes/edges, a grid (adjacent cells = edges), or "connections between X and Y"</li>
  <li>"Shortest path," "fewest steps," "minimum number of moves" on an unweighted graph → BFS</li>
  <li>"Does a path exist," "all paths," "explore every option" → DFS</li>
  <li>A 2D grid where you move up/down/left/right is a graph in disguise — each cell is a node, each valid move is an edge</li>
  <li>"How many edges," "what is the route," "print the path": BFS with a distance and a parent per node</li>
  <li>"How many groups," "is everything connected," "does a cycle exist anywhere": a traversal inside a loop over every node</li>
  <li>"Copy this structure" when nodes can point back at each other: a map from each original to its copy, filled before you recurse</li>
  <li>A chain, a deep tree or a huge all-land grid under a recursive DFS: say that the call stack may run out, and switch to an explicit stack or BFS</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Build an adjacency list from an edge list, and say when you'd reach for a matrix instead.</li>
    <li>Write both recursive and iterative DFS, and explain what the call stack was doing that the explicit stack now does.</li>
    <li>Write BFS, and explain out loud why marking a node visited on enqueue (not dequeue) matters.</li>
    <li>State which of DFS or BFS guarantees the shortest path on an unweighted graph, and why the other one doesn't.</li>
    <li>Recognize a 2D grid as a graph in disguise, and say what a "node" and an "edge" are in that disguise.</li>
    <li>Convert an edge list to a weighted adjacency list, an adjacency matrix and back, and name the five build-step slips (shared <code>fill([])</code>, 1-indexed nodes, one-way edges, lost isolated nodes, self-loops).</li>
    <li>Explain why a recursive DFS can throw a <code>RangeError</code> on a long chain, and write the iterative version that keeps a node and a neighbour index per frame.</li>
    <li>Write BFS that returns the distance to every node and the actual path, using a parent per node, and say what it does not promise on a weighted graph.</li>
    <li>Wrap a traversal in a loop over all nodes to handle a disconnected graph, and say why a directed graph needs different questions.</li>
    <li>Write clone graph and say why the copy goes into the map before the recursion.</li>
  </ul>
</div>`,
};
