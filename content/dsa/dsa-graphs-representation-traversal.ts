import type { Chapter } from "../types";

export const dsaGraphsRepresentationTraversal: Chapter = {
  id: "dsa-graphs-representation-traversal",
  num: "I4",
  title: "Graphs: representation & traversal",
  short: "Graphs: representation",
  levels: ["intermediate"],
  practice: [
    "ex-number-of-islands",
    "ex-max-area-of-island",
    "ex-clone-graph",
    "ex-rotting-oranges",
    "ex-surrounded-regions",
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

<span class="c">// iterative DFS — same order, explicit stack instead of recursion</span>
function dfsIterative(graph, start) {
  const visited = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return visited;
}</code></pre>

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

  function bfs() {
    var out = [{ cur: null, frontier: ["A"], visited: ["A"], order: [], note: "Start: put A in the queue and mark it seen." }];
    var queue = ["A"], seen = { A: true }, visited = ["A"], order = [];
    while (queue.length) {
      var n = queue.shift();
      order.push(n);
      var added = [];
      ADJ[n].forEach(function (m) { if (!seen[m]) { seen[m] = true; visited.push(m); queue.push(m); added.push(m); } });
      out.push({ cur: n, frontier: queue.slice(), visited: visited.slice(), order: order.slice(),
        note: "Take " + n + " from the front. " + (added.length ? "Its unseen neighbours " + added.join(", ") + " join the back, marked seen now so nothing is queued twice." : "No unseen neighbours.") });
    }
    return out;
  }
  function dfs() {
    var out = [{ cur: null, frontier: ["A"], visited: [], order: [], note: "Start: push A on the stack." }];
    var stack = ["A"], visited = [], order = [];
    while (stack.length) {
      var n = stack.pop();
      if (visited.indexOf(n) !== -1) {
        out.push({ cur: null, frontier: stack.slice(), visited: visited.slice(), order: order.slice(), note: "Pop " + n + ": already visited, so skip it. The stack can hold duplicates; visited is checked on the way out." });
        continue;
      }
      visited.push(n);
      order.push(n);
      var pushed = [];
      ADJ[n].slice().reverse().forEach(function (m) { if (visited.indexOf(m) === -1) { stack.push(m); pushed.push(m); } });
      out.push({ cur: n, frontier: stack.slice(), visited: visited.slice(), order: order.slice(),
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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Input described as nodes/edges, a grid (adjacent cells = edges), or "connections between X and Y"</li>
  <li>"Shortest path," "fewest steps," "minimum number of moves" on an unweighted graph → BFS</li>
  <li>"Does a path exist," "all paths," "explore every option" → DFS</li>
  <li>A 2D grid where you move up/down/left/right is a graph in disguise — each cell is a node, each valid move is an edge</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Build an adjacency list from an edge list, and say when you'd reach for a matrix instead.</li>
    <li>Write both recursive and iterative DFS, and explain what the call stack was doing that the explicit stack now does.</li>
    <li>Write BFS, and explain out loud why marking a node visited on enqueue (not dequeue) matters.</li>
    <li>State which of DFS or BFS guarantees the shortest path on an unweighted graph, and why the other one doesn't.</li>
    <li>Recognize a 2D grid as a graph in disguise, and say what a "node" and an "edge" are in that disguise.</li>
  </ul>
</div>`,
};
