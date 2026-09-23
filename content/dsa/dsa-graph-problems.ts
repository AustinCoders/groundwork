import type { Chapter } from "../types";

export const dsaGraphProblems: Chapter = {
  id: "dsa-graph-problems",
  num: "I5",
  title: "Graph problems",
  short: "Graph problems",
  levels: ["intermediate"],
  practice: [
    "ex-pacific-atlantic-water-flow",
    "ex-word-ladder",
    "ex-is-bipartite",
    "ex-shortest-binary-matrix",
    "ex-keys-rooms",
  ],
  ready: true,
  subtitle: "Three questions that reuse the exact same BFS/DFS you just learned, with one twist each.",
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

<h3>Recognizing which one an unseen problem wants</h3>
<ul>
  <li>"How many groups/islands/provinces" → connected components</li>
  <li>"Can these all be completed" / "is there a circular dependency" → cycle detection (directed, usually — think course prerequisites)</li>
  <li>"Can you split into two groups with no conflicts" / "is this graph 2-colorable" → bipartite check</li>
  <li>All three reuse the exact same BFS/DFS skeleton from the previous chapter — the only new part is what you track while visiting</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Count connected components with a loop over every node plus a flood-fill, and connect that shape to "number of islands" on a grid.</li>
    <li>Explain why undirected cycle detection needs to exclude the parent, but directed cycle detection needs a third "in-progress" state instead.</li>
    <li>Trace the three-state cycle check on a graph with no cycle, and confirm every node reaches state 2 without a false positive.</li>
    <li>Write isBipartite with BFS colouring, and say in one sentence what a same-colored edge proves.</li>
    <li>Given a new problem, decide which of the three (components, cycle, bipartite) it is before writing any code.</li>
  </ul>
</div>`,
};
