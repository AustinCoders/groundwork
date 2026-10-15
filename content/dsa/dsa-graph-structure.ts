import type { Chapter } from "../types";

export const dsaGraphStructure: Chapter = {
  id: "dsa-graph-structure",
  num: "A5",
  title: "Advanced graphs: SCC, bridges, Euler paths, LCA",
  short: "Advanced graphs",
  levels: ["advanced"],
  prerequisites: ["dsa-topological-patterns", "dsa-advanced-graph-algorithms"],
  practice: [
    "ex-count-sccs",
    "ex-min-starts-to-reach-all",
    "ex-make-strongly-connected",
    "ex-critical-connections",
    "ex-articulation-points",
    "ex-euler-kind-directed",
    "ex-reconstruct-itinerary",
    "ex-valid-arrangement-of-pairs",
    "ex-kth-ancestor-queries",
    "ex-lca-queries",
    "ex-tree-diameter-weighted",
    "ex-tree-diameter",
    "ex-min-height-trees",
  ],
  ready: true,
  subtitle:
    "One DFS that stamps each vertex with the time it was reached answers questions that look like they need a search per vertex.",
  body: `<h3>One DFS, two clocks: questions about structure</h3>
<p>
  The graph chapters so far asked about <em>paths</em>: is there one, how short,
  in what order. This chapter asks about <b>structure</b>. Which vertices of a
  directed graph can all reach one another? Which single cable, or single
  server, splits a network when it fails? Can you walk along every edge exactly
  once? In a tree, who is the lowest common ancestor of two nodes, and which two
  nodes are farthest apart?
</p>
<p>
  Each has an obvious brute force that deletes something and asks again: remove
  each edge and recount the pieces, or search from every vertex and compare what
  each can reach. That costs O(E · (V + E)) or O(V · (V + E)), fine for ten
  vertices and hopeless for a hundred thousand. The efficient answers come from
  one place: <b>a single depth-first search that stamps every vertex with the
  moment it was first reached</b>, and some reasoning about what the stamps say.
</p>
<table>
  <tr><th>Question</th><th>Tool</th><th>Time</th></tr>
  <tr><td>Which vertices of a directed graph are mutually reachable?</td><td>strongly connected components (Kosaraju or Tarjan)</td><td>O(V + E)</td></tr>
  <tr><td>Which edge, removed, disconnects an undirected graph?</td><td>bridges via low-link</td><td>O(V + E)</td></tr>
  <tr><td>Which vertex, removed, disconnects it?</td><td>articulation points via low-link</td><td>O(V + E)</td></tr>
  <tr><td>Is there a walk that uses every edge exactly once?</td><td>degree test, then Hierholzer</td><td>O(V + E)</td></tr>
  <tr><td>Lowest common ancestor or kth ancestor, many queries</td><td>binary lifting</td><td>O(n log n) to build, O(log n) per query</td></tr>
  <tr><td>Farthest pair of nodes in a tree</td><td>two sweeps, or a DP over children</td><td>O(n)</td></tr>
</table>
<p class="sub">
  This chapter builds on <a href="/dsa/dsa-topological-patterns">Topological patterns</a>
  and <a href="/dsa/dsa-advanced-graph-algorithms">Advanced graph algorithms</a>.
  Everything here is plain DFS with extra bookkeeping, so the work is in the
  reasoning.
</p>

<h3>The DFS tree and what each kind of edge tells you</h3>
<p>
  Run a DFS and keep a counter. The first time you reach a vertex, give it the
  next number: its <b>discovery time</b>, <code>tin[v]</code>. The edges that
  lead to a vertex you have not seen are <b>tree edges</b>, and together they
  form the DFS tree (a forest, if the graph is not connected). Every other edge
  points, when you examine it, at a vertex that already has a
  <code>tin</code>. What that vertex is, relative to where you stand, is what
  this chapter is built on.
</p>
<table>
  <tr><th>Kind of edge u → v</th><th>v is...</th><th>Directed graph</th><th>Undirected graph</th></tr>
  <tr><td>tree</td><td>unvisited, becomes a child of u</td><td>yes</td><td>yes</td></tr>
  <tr><td>back</td><td>an ancestor of u, still open</td><td>yes: closes a cycle</td><td>yes: the only other kind</td></tr>
  <tr><td>forward</td><td>a descendant of u, already finished</td><td>yes</td><td>same edge as a back edge, seen from above</td></tr>
  <tr><td>cross</td><td>in a different branch, already finished or started earlier</td><td>yes</td><td>cannot happen</td></tr>
</table>
<p>
  The last cell needs a proof, because bridges and articulation points rest on
  it. Say an undirected edge joins <code>u</code> and <code>v</code>, and the DFS
  reaches <code>u</code> first. Before <code>u</code> finishes it examines every
  edge it has, including <code>u–v</code>. Either <code>v</code> is still
  unvisited and the edge becomes a tree edge, or <code>v</code> was reached
  meanwhile through another child of <code>u</code>. Either way <code>v</code> is
  in <code>u</code>'s subtree. So <b>in an undirected DFS every non-tree edge
  joins a vertex to one of its ancestors</b>, and nothing connects two branches
  except through their common ancestor. The whole bridge section is a
  consequence of that sentence.
</p>
<p>
  This chapter uses two stamps: the discovery time <code>tin</code>, and the
  <b>finish order</b> (the order in which DFS calls return), which Kosaraju's
  algorithm uses. A derived number, <code>low</code>, built from
  <code>tin</code>, drives Tarjan's algorithm and the bridge algorithm.
</p>

<h3>Strongly connected components: what the problem asks</h3>
<p>
  In a directed graph, say <code>u</code> and <code>v</code> belong together if
  <code>u</code> reaches <code>v</code> <em>and</em> <code>v</code> reaches
  <code>u</code>. The relation is reflexive, symmetric by definition and
  transitive (chain the walks), so it splits the vertices into groups with
  nothing left over. Each group is a <b>strongly connected component</b>, SCC
  for short. A vertex on no cycle is a component of its own, and so is one whose
  only cycle is a self-loop.
</p>
<p>
  Think of modules that import each other, tasks that wait on one another (a
  deadlock is a component of more than one task), or pages you can click between
  in both directions. The brute force finds what every vertex reaches and pairs
  up those that reach each other: O(V · (V + E)). Both algorithms below take
  O(V + E).
</p>

<figure>
  <svg viewBox="0 0 640 290" class="dg" role="img" aria-label="A directed graph of eight vertices that falls into three strongly connected components: a triangle of vertices zero, one and two, a triangle of three, four and five, and the pair six and seven. Dashed edges run between components and always go from component A to C, C to B, or A to B, never back">
    <g class="rough">
      <rect class="ln dash" x="28" y="34" width="188" height="190" rx="14" />
      <rect class="ln dash" x="436" y="34" width="190" height="190" rx="14" />
      <rect class="ln dash" x="250" y="176" width="180" height="76" rx="14" />
    </g>
    <g class="rough">
      <path class="ln" d="M77.7,129.3 L150.5,167.7 M140.5,167.5 L150.5,167.7 L144.7,159.6" />
      <path class="ln" d="M170,158 L170,88 M174.5,97 L170,88 L165.5,97" />
      <path class="ln" d="M152,74.8 L79.7,110.3 M85.8,102.3 L79.7,110.3 L89.8,110.4" />
      <path class="ln" d="M488.2,74.2 L565,108.9 M554.9,109.3 L565,108.9 L558.6,101.1" />
      <path class="ln" d="M567.6,127.9 L499.1,167.1 M504.7,158.7 L499.1,167.1 L509.1,166.5" />
      <path class="ln" d="M478.2,158.1 L472,87.9 M477.2,96.5 L472,87.9 L468.3,97.3" />
      <path class="ln" d="M306.5,200.8 Q340,178 371.8,199.6 M361.8,198.3 L371.8,199.6 L366.9,190.8" />
      <path class="ln" d="M373.5,223.2 Q340,246 308.2,224.4 M318.2,225.7 L308.2,224.4 L313.1,233.2" />
      <path class="ln dash" d="M190,66 L448,66 M439,70.5 L448,66 L439,61.5" />
      <path class="ln dash" d="M189.2,183.5 L268.8,206 M258.9,207.9 L268.8,206 L261.4,199.2" />
      <path class="ln dash" d="M408.7,204.9 L459.4,185.8 M452.6,193.2 L459.4,185.8 L449.4,184.7" />
    </g>
    <g class="rough">
      <circle class="box" cx="60" cy="120" r="20" />
      <circle class="box" cx="170" cy="178" r="20" />
      <circle class="box" cx="170" cy="66" r="20" />
      <circle class="boxg" cx="470" cy="66" r="20" />
      <circle class="boxg" cx="585" cy="118" r="20" />
      <circle class="boxg" cx="480" cy="178" r="20" />
      <circle class="boxy" cx="290" cy="212" r="20" />
      <circle class="boxy" cx="390" cy="212" r="20" />
    </g>
    <text class="lbl" x="60" y="125" text-anchor="middle">0</text>
    <text class="lbl" x="170" y="183" text-anchor="middle">1</text>
    <text class="lbl" x="170" y="71" text-anchor="middle">2</text>
    <text class="lbl" x="470" y="71" text-anchor="middle">3</text>
    <text class="lbl" x="585" y="123" text-anchor="middle">4</text>
    <text class="lbl" x="480" y="183" text-anchor="middle">5</text>
    <text class="lbl" x="290" y="217" text-anchor="middle">6</text>
    <text class="lbl" x="390" y="217" text-anchor="middle">7</text>
    <text class="lbl" x="122" y="26" text-anchor="middle">component A</text>
    <text class="lbl" x="531" y="26" text-anchor="middle">component B</text>
    <text class="lbl" x="340" y="276" text-anchor="middle">component C</text>
  </svg>
  <figcaption>Eight vertices, three components. Solid edges stay inside a component; dashed edges leave one. Every dashed edge points the same way: A to C, C to B, A to B. None points back.</figcaption>
</figure>

<p>
  The figure shows the fact that makes components useful. <b>Collapse every
  component into one vertex and what is left has no cycle.</b> A cycle through
  two components would let every vertex of one reach every vertex of the other
  and back, so they would be one component. This acyclic summary is the
  <em>condensation</em>.
</p>

<h3>Kosaraju: finish times and the reversed graph</h3>
<p>
  Suppose someone hands you a vertex in a <b>sink component</b>, one with no
  edges leaving it. A DFS from there cannot escape and reaches the whole
  component, so the visited set is exactly that component. Mark it, remove it,
  repeat. The trouble is knowing which vertices sit in a sink.
</p>
<p>
  Reverse every edge: the components stay the same, but sources and sinks swap.
  So find a vertex in a <b>source component</b> of the original graph and run the
  DFS on the <em>reversed</em> graph, where that component is now a sink and the
  search cannot leak out. Finish times point out such a vertex.
</p>
<p>
  <b>Lemma.</b> If an edge goes from component C to a different component C',
  the latest finish time in C is later than the latest in C'. If the DFS enters
  C first, at a vertex <code>x</code>, then all of C and C' are unvisited and
  reachable from <code>x</code>, so they all become descendants of
  <code>x</code> and finish before it does. If the DFS enters C' first, it can
  never reach C (the condensation has no cycle), so all of C' finishes before C
  is even started.
</p>
<p>
  Consequence: the vertex that finishes last overall lies in a source component,
  because a component with an edge entering it would have a later finisher.
  Running the DFS on the reversed graph from that vertex yields exactly its
  component. Then take the latest-finishing vertex not yet labelled; by the same
  argument it lies in a source of what remains. So: one DFS recording finish
  order, then a second pass over the <em>reversed</em> graph in
  <em>decreasing</em> finish order.
</p>
<pre><code>function sccKosaraju(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  const radj = Array.from({ length: n }, () =&gt; []);
  for (const [u, v] of edges) {
    adj[u].push(v);
    radj[v].push(u); <span class="c">// the same edge, reversed</span>
  }

  const seen = new Array(n).fill(false);
  const next = new Array(n).fill(0); <span class="c">// next[u] = how many of u's edges are already handled</span>
  const finish = []; <span class="c">// vertices in the order their DFS call returns</span>
  for (let s = 0; s &lt; n; s++) {
    if (seen[s]) continue;
    seen[s] = true;
    const stack = [s];
    while (stack.length) {
      const u = stack[stack.length - 1];
      if (next[u] &lt; adj[u].length) {
        const v = adj[u][next[u]++];
        if (!seen[v]) {
          seen[v] = true;
          stack.push(v);
        }
      } else {
        stack.pop();
        finish.push(u); <span class="c">// u is finished: everything it can reach is already seen</span>
      }
    }
  }

  const comp = new Array(n).fill(-1);
  let count = 0;
  for (let i = n - 1; i &gt;= 0; i--) { <span class="c">// latest finisher first</span>
    const s = finish[i];
    if (comp[s] !== -1) continue;
    comp[s] = count;
    const stack = [s];
    while (stack.length) {
      const u = stack.pop();
      for (const v of radj[u]) {
        if (comp[v] === -1) { <span class="c">// reversed graph; labelled vertices are walls</span>
          comp[v] = count;
          stack.push(v);
        }
      }
    }
    count++;
  }
  return { comp, count }; <span class="c">// comp[v] numbers follow a topological order of the components</span>
}</code></pre>
<p>
  Time O(V + E) and space O(V + E): two traversals and a reversed copy of the
  adjacency lists. Both use an explicit stack with an edge pointer, so no
  recursion depth is involved. The labels come out in <b>topological order of
  the condensation</b>: for every edge <code>u → v</code>,
  <code>comp[u] &lt;= comp[v]</code>. I checked that on thousands of random
  graphs, along with the components themselves.
</p>
<h4>Dry run: the graph from the figure</h4>
<p>
  Edges in input order: 0→1, 1→2, 2→0, 2→3, 3→4, 4→5, 5→3, 1→6, 6→7, 7→6,
  7→5. The first pass starts at 0 and takes edges in that order, so the
  vertices finish in the order <b>5, 4, 3, 2, 7, 6, 1, 0</b>. The second pass
  reads that list from the right, walking reversed edges:
</p>
<table>
  <tr><th>Start (latest unlabelled finisher)</th><th>Original edges walked backwards</th><th>Blocked: the other end is already labelled</th><th>Component</th></tr>
  <tr><td>0</td><td>2→0, then 1→2, then 0→1 (back at 0)</td><td>none</td><td>{0, 1, 2} = label 0</td></tr>
  <tr><td>6 (1 is labelled)</td><td>7→6, then 6→7 (back at 6)</td><td>1→6, from the labelled 1</td><td>{6, 7} = label 1</td></tr>
  <tr><td>3 (7 and 2 are labelled)</td><td>5→3, then 4→5, then 3→4 (back at 3)</td><td>2→3 from the labelled 2, and 7→5 from the labelled 7</td><td>{3, 4, 5} = label 2</td></tr>
</table>
<p class="sub">
  The third column is the point of the algorithm. Each blocked edge is a dashed
  edge of the figure, and because components are found source-first, every such
  edge meets a vertex that is already labelled.
</p>
<div class="warn">
  <span class="ttl">⚠ The second pass must walk the reversed graph, in decreasing finish order</span>
  Run the second pass over the original edges, or walk the finish list from
  the front instead of the back, and on the graph of the figure each search
  spills out of its component into everything downstream of it: I ran both
  mistakes, and both return one single component instead of three. Say the two
  words "reversed" and "decreasing" out loud when you write it.
</div>

<h3>Tarjan: deriving the low-link value</h3>
<p>
  Kosaraju needs a reversed copy of the graph. Tarjan's algorithm finds the same
  components in <b>one</b> DFS, by noticing the moment a component is complete.
  Call the first vertex of a component that the DFS reaches its <b>root</b>
  <code>r</code>. Every other vertex of the component is reachable from
  <code>r</code> through unvisited vertices of the same component, so the DFS
  visits all of them before <code>r</code> returns: <b>a component lives
  entirely inside the subtree of its root</b>.
</p>
<p>
  Keep a stack of visited vertices, pushing each one on discovery. When a root
  <code>r</code> finishes, everything above it on the stack was discovered later,
  so it lies in <code>r</code>'s subtree. Could such a vertex <code>w</code>
  belong to another component with root <code>r'</code>? If <code>r'</code> is
  inside <code>r</code>'s subtree, it has finished and that component has
  already been removed. If <code>r'</code> is above <code>r</code>, then
  <code>r'</code> reaches <code>r</code> down the tree, <code>r</code> reaches
  <code>w</code>, and <code>w</code> reaches <code>r'</code>, which would put
  <code>r</code> in that component too. So <b>the vertices above a finishing
  root are exactly its component</b>: pop down to the root and you have emitted
  it. A vertex stays on the stack exactly while its root is still open.
</p>
<p>
  One job is left: recognise a root when it finishes. Define
</p>
<p>
  <code>low[u]</code> = the smallest <code>tin</code> you can reach from
  <code>u</code> by going down tree edges inside <code>u</code>'s subtree and
  then taking <b>at most one</b> edge to a vertex that is on the stack.
</p>
<p>
  The edge rule first. Take an edge <code>x → v</code> to an already visited
  <code>v</code>. If <code>v</code> is on the stack, its root
  <code>r<sub>v</sub></code> is still open, so it is an ancestor of
  <code>x</code>, and <code>x → v → r<sub>v</sub> → x</code> is a cycle:
  <code>v</code> is in <code>x</code>'s component. If <code>v</code> is not on
  the stack, its component was emitted already, and <code>x</code>, which is
  still open, is not in it; <code>x</code> reaches <code>v</code>, so
  <code>v</code> cannot reach <code>x</code>, and the edge tells you nothing
  about <code>x</code>'s component. The test <code>onStack[v]</code> is not an
  optimisation. It separates these two cases.
</p>
<p>
  Now <b>u is a root exactly when <code>low[u] == tin[u]</code></b>. Suppose
  <code>u</code> is a root but some edge from its subtree, from <code>x</code>,
  reached a stack vertex <code>v</code> with <code>tin[v] &lt; tin[u]</code>.
  The root of <code>x</code>'s component is open, so it is an ancestor of
  <code>x</code> with <code>tin</code> at most <code>tin[v]</code>, hence a
  proper ancestor of <code>u</code>. It reaches <code>u</code> down the tree,
  <code>u</code> reaches <code>x</code>, and <code>x</code> reaches it: then
  <code>u</code> is not a root after all. Conversely, if <code>u</code> is not a
  root, its component has a path from <code>u</code> to its root, an ancestor.
  Follow the path until it first leaves <code>u</code>'s subtree. That edge goes
  to a vertex discovered before <code>u</code> (a later one would have become a
  descendant), and the vertex is in the component, so on the stack. It pulls
  <code>low[u]</code> below <code>tin[u]</code>. And after a child
  <code>v</code> returns, <code>low[u] = min(low[u], low[v])</code>, because
  whatever the child's subtree can reach, <code>u</code> can reach through the
  tree edge.
</p>
<pre><code>function sccTarjan(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [u, v] of edges) adj[u].push(v);

  const tin = new Array(n).fill(-1); <span class="c">// discovery time; -1 means unvisited</span>
  const low = new Array(n).fill(0); <span class="c">// smallest tin reachable, see the derivation</span>
  const onStack = new Array(n).fill(false);
  const open = []; <span class="c">// visited vertices whose component is not closed yet</span>
  const comp = new Array(n).fill(-1);
  let timer = 0;
  let count = 0;

  function dfs(u) {
    tin[u] = low[u] = timer++;
    open.push(u);
    onStack[u] = true;

    for (const v of adj[u]) {
      if (tin[v] === -1) {
        dfs(v);
        low[u] = Math.min(low[u], low[v]); <span class="c">// whatever v's subtree can reach, u can reach</span>
      } else if (onStack[v]) {
        low[u] = Math.min(low[u], tin[v]); <span class="c">// an edge into a still-open component</span>
      }
    }

    if (low[u] === tin[u]) { <span class="c">// u reaches nothing earlier: u is the root of its component</span>
      let w;
      do {
        w = open.pop();
        onStack[w] = false;
        comp[w] = count;
      } while (w !== u);
      count++;
    }
  }

  for (let s = 0; s &lt; n; s++) if (tin[s] === -1) dfs(s);
  return { comp, count }; <span class="c">// components are numbered in reverse topological order</span>
}</code></pre>
<p>
  Each vertex is pushed and popped once and each edge examined once: O(V + E)
  time, O(V) extra space beyond the adjacency lists. Components come out
  <b>sinks first</b>: for every edge <code>u → v</code>,
  <code>comp[u] &gt;= comp[v]</code>, the opposite numbering from Kosaraju.
  That matters for the DP in the next section.
</p>
<h4>Dry run: the same graph, edges in the same order</h4>
<table>
  <tr><th>Event</th><th>What changes</th><th>Open stack afterwards</th></tr>
  <tr><td>visit 0, 1, 2</td><td>tin = 0, 1, 2 and low = tin</td><td>[0, 1, 2]</td></tr>
  <tr><td>edge 2→0, 0 is open</td><td>low[2] = min(2, tin[0]) = <b>0</b></td><td>[0, 1, 2]</td></tr>
  <tr><td>visit 3, 4, 5</td><td>tin = 3, 4, 5</td><td>[0, 1, 2, 3, 4, 5]</td></tr>
  <tr><td>edge 5→3, 3 is open</td><td>low[5] = <b>3</b></td><td>[0, 1, 2, 3, 4, 5]</td></tr>
  <tr><td>5 and 4 finish</td><td>low[4] = 3, low[3] = 3; neither is a root</td><td>[0, 1, 2, 3, 4, 5]</td></tr>
  <tr><td>3 finishes</td><td>low[3] = tin[3] = 3, so pop down to 3: component <b>{5, 4, 3}</b>, label 0</td><td>[0, 1, 2]</td></tr>
  <tr><td>2 finishes, back in 1</td><td>low[2] = 0 ≠ tin[2], not a root; low[1] = 0</td><td>[0, 1, 2]</td></tr>
  <tr><td>visit 6, 7</td><td>tin = 6, 7</td><td>[0, 1, 2, 6, 7]</td></tr>
  <tr><td>edge 7→6, 6 is open</td><td>low[7] = <b>6</b></td><td>[0, 1, 2, 6, 7]</td></tr>
  <tr><td>edge 7→5, 5 is <b>not</b> open</td><td>ignored: 5 belongs to the finished component 0</td><td>[0, 1, 2, 6, 7]</td></tr>
  <tr><td>7 finishes, 6 finishes</td><td>low[6] = tin[6] = 6, so pop down to 6: component <b>{7, 6}</b>, label 1</td><td>[0, 1, 2]</td></tr>
  <tr><td>1 finishes, 0 finishes</td><td>low[0] = tin[0] = 0, pop down to 0: component <b>{2, 1, 0}</b>, label 2</td><td>[]</td></tr>
</table>
<p class="sub">
  The row for edge 7→5 is the one to remember. Without the
  <code>onStack</code> test, <code>low[7]</code> would become 5, vertex 6 would
  no longer look like a root, and {6, 7} would be absorbed into the component of
  0, 1, 2. I ran that variant: it reports two components instead of three.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "A strongly connected component
  is a set of vertices that can all reach each other. One DFS gives every vertex
  a discovery time, and for each vertex I track the earliest time reachable
  through its subtree plus one edge to a vertex still on my component stack.
  When that equals the vertex's own time, nothing below it escapes upward, so
  it is the root of a component and I pop the stack down to it. It's O(V + E),
  and the on-stack check matters: an edge into a finished component must not
  lower the value."
</div>
<p>
  Either is accepted in an interview. Kosaraju is easier to explain from
  scratch; Tarjan is one pass, and its low-link idea also solves bridges, so it
  pays twice. Pick the one you can reproduce under pressure.
</p>
<table>
  <tr><th></th><th>Kosaraju</th><th>Tarjan</th></tr>
  <tr><td>Passes over the graph</td><td>2, one on a reversed copy</td><td>1</td></tr>
  <tr><td>Extra memory</td><td>reversed adjacency, finish list</td><td>tin, low, component stack</td></tr>
  <tr><td>Component labels come out</td><td>sources first (topological)</td><td>sinks first (reverse topological)</td></tr>
  <tr><td>Hardest part to get right</td><td>second pass: reversed graph, decreasing finish order</td><td>edge into a vertex that is no longer on the stack</td></tr>
  <tr><td>Reusable idea</td><td>finish order</td><td>low-link, also used for bridges</td></tr>
</table>

<h3>Condensation: collapse each component into one vertex</h3>
<p>
  Once every vertex has a component label, build the <b>condensation</b>: one
  vertex per component, and an edge between two components if any original
  edge goes from one to the other. As shown above it is a DAG, so everything
  from <a href="/dsa/dsa-topological-patterns">Topological patterns</a> applies to it.
</p>
<figure>
  <svg viewBox="0 0 640 170" class="dg" role="img" aria-label="The condensation of the previous graph: three vertices A, C and B with edges A to C, C to B and A to B, an acyclic graph with A as the only source and B as the only sink">
    <g class="rough">
      <path class="ln" d="M140,90 L288,90 M279,94.5 L288,90 L279,85.5" />
      <path class="ln" d="M350,90 L498,90 M489,94.5 L498,90 L489,85.5" />
      <path class="ln" d="M137.9,79.1 Q320,8 500.2,78.4 M490.2,79.3 L500.2,78.4 L493.4,70.9" />
    </g>
    <g class="rough">
      <circle class="box" cx="110" cy="90" r="30" />
      <circle class="boxy" cx="320" cy="90" r="30" />
      <circle class="boxg" cx="530" cy="90" r="30" />
    </g>
    <text class="lbl" x="110" y="96" text-anchor="middle">A</text>
    <text class="lbl" x="320" y="96" text-anchor="middle">C</text>
    <text class="lbl" x="530" y="96" text-anchor="middle">B</text>
    <text class="sm gr" x="110" y="146" text-anchor="middle">source: in-degree 0</text>
    <text class="sm gr" x="530" y="146" text-anchor="middle">sink: out-degree 0</text>
  </svg>
  <figcaption>The condensation of the earlier graph. A has no edges in, so any set of starting points that reaches everything must include a vertex of A. B has no edges out.</figcaption>
</figure>
<pre><code>function condense(n, edges, comp, count) {
  const seen = Array.from({ length: count }, () =&gt; new Set());
  const dag = Array.from({ length: count }, () =&gt; []);
  const indeg = new Array(count).fill(0);
  const outdeg = new Array(count).fill(0);
  for (const [u, v] of edges) {
    const a = comp[u];
    const b = comp[v];
    if (a === b || seen[a].has(b)) continue; <span class="c">// edges inside a component vanish, parallel ones merge</span>
    seen[a].add(b);
    dag[a].push(b);
    outdeg[a]++;
    indeg[b]++;
  }
  return { dag, indeg, outdeg };
}

function edgesToMakeStronglyConnected(n, edges) {
  const { comp, count } = sccTarjan(n, edges);
  if (count === 1) return 0;
  const { indeg, outdeg } = condense(n, edges, comp, count);
  const sources = indeg.filter((d) =&gt; d === 0).length;
  const sinks = outdeg.filter((d) =&gt; d === 0).length;
  return Math.max(sources, sinks); <span class="c">// each new edge can cure one source and one sink at most</span>
}</code></pre>
<p>
  Edges inside a component disappear, and parallel edges between two components
  are kept once, using a <code>Set</code>. The degree arrays answer two classic
  questions.
</p>
<ul>
  <li><b>Fewest starting vertices that reach everything.</b> Every source
  component (in-degree 0) needs a start of its own, since nothing outside can
  enter it. One start per source is enough: following edges backwards from any
  component must stop (the graph is acyclic), and it stops at a source. The
  answer is the number of source components.</li>
  <li><b>Fewest edges to add to make the graph strongly connected.</b> With one
  component, 0. Otherwise each source needs a new edge entering it and each sink
  a new edge leaving it, and one new edge repairs at most one of each, so at
  least <code>max(sources, sinks)</code> edges are needed. That many also
  suffice (a classical result). I checked the formula against a brute force
  that tries every set of added edges, on random graphs of up to five
  vertices.</li>
</ul>
<p>
  The other use is a <b>DP over the condensation</b>. Say every city has a
  value, you may walk along roads and revisit cities, and each city's value
  counts once. Inside a component you can reach every city, so a component
  counts as a whole; across components the graph is a DAG, so a longest-path DP
  applies. Tarjan's numbering suits it: successors of a component have smaller
  ids, so going through ids from 0 upward finishes every successor first.
</p>
<pre><code>function maxValueOnWalk(n, edges, value) {
  const { comp, count } = sccTarjan(n, edges);
  const total = new Array(count).fill(0);
  for (let v = 0; v &lt; n; v++) total[comp[v]] += value[v]; <span class="c">// a component is visited as a whole, once</span>
  const { dag } = condense(n, edges, comp, count);

  const best = new Array(count).fill(0);
  for (let c = 0; c &lt; count; c++) { <span class="c">// Tarjan numbers sinks first: every successor of c has a smaller id</span>
    let after = 0;
    for (const d of dag[c]) after = Math.max(after, best[d]);
    best[c] = total[c] + after;
  }
  return Math.max(0, ...best);
}</code></pre>
<p class="sub">
  The values must be non-negative for "take the whole component" to be right.
  SCCs appear in one more classic place, <b>2-SAT</b>: one vertex per literal,
  two edges per clause, and the formula is unsatisfiable exactly when some
  variable and its negation share a component.
</p>

<h3>Bridges and articulation points</h3>
<p>
  A <b>bridge</b> is an edge whose removal disconnects its part of an
  undirected graph; an <b>articulation point</b> (cut vertex) is a vertex whose
  removal does. They are the single points of failure of a network, and
  "Critical Connections in a Network" asks for the bridges directly. The brute
  force removes each edge and counts the pieces: O(E · (V + E)).
</p>
<p>
  Use the fact proved earlier: in an undirected DFS every non-tree edge goes to
  an ancestor. Look at a tree edge <code>u–v</code>, <code>v</code> the child.
  Cut it, and the subtree of <code>v</code> stays attached to the rest only
  through non-tree edges that leave the subtree. Those can only go up to an
  ancestor of <code>v</code>, that is, to <code>u</code> or to something above
  it, and a single such edge is enough. So <b>the edge <code>u–v</code> is a
  bridge exactly when no edge from <code>v</code>'s subtree reaches
  <code>u</code> or anything above it.</b>
</p>
<p>
  To test that cheaply, let <code>low[v]</code> be the smallest
  <code>tin</code> among <code>v</code> itself and the far ends of all back
  edges leaving <code>v</code>'s subtree. It is computed bottom-up, as the
  minimum over <code>v</code>'s own back edges and its children's
  <code>low</code>: the update of Tarjan's algorithm, minus the stack, since in
  an undirected graph a visited neighbour is always an ancestor or a descendant
  and "is it still open?" never arises. The test is
  <code>low[v] &gt; tin[u]</code>.
</p>
<figure>
  <svg viewBox="0 0 640 300" class="dg" role="img" aria-label="An undirected graph of seven vertices: two triangles, zero-one-two and three-four-five, joined by the edge from two to three, plus a leaf six hanging off three. The edges two-three and three-six are drawn red because removing either disconnects the graph; vertices two and three are highlighted as articulation points">
    <g class="rough">
      <path class="ln" d="M61.9,174 L108.1,112" />
      <path class="ln" d="M133,111.2 L187,174.8" />
      <path class="ln" d="M180,190 L70,190" />
      <path class="ln" d="M341.9,174 L388.1,112" />
      <path class="ln" d="M413,111.2 L467,174.8" />
      <path class="ln" d="M460,190 L350,190" />
      <path class="lnr" d="M220,190 L310,190" />
      <path class="lnr" d="M330,210 L330,242" />
    </g>
    <g class="rough">
      <circle class="box" cx="50" cy="190" r="20" />
      <circle class="box" cx="120" cy="96" r="20" />
      <circle class="box" cx="400" cy="96" r="20" />
      <circle class="box" cx="480" cy="190" r="20" />
      <circle class="boxy" cx="200" cy="190" r="20" />
      <circle class="boxy" cx="330" cy="190" r="20" />
      <circle class="box" cx="330" cy="262" r="20" />
    </g>
    <text class="lbl" x="50" y="195" text-anchor="middle">0</text>
    <text class="lbl" x="120" y="101" text-anchor="middle">1</text>
    <text class="lbl" x="200" y="195" text-anchor="middle">2</text>
    <text class="lbl" x="330" y="195" text-anchor="middle">3</text>
    <text class="lbl" x="400" y="101" text-anchor="middle">4</text>
    <text class="lbl" x="480" y="195" text-anchor="middle">5</text>
    <text class="lbl" x="330" y="267" text-anchor="middle">6</text>
    <text class="sm" x="50" y="224" text-anchor="middle">0|0</text>
    <text class="sm" x="120" y="66" text-anchor="middle">1|0</text>
    <text class="sm" x="200" y="224" text-anchor="middle">2|0</text>
    <text class="sm" x="290" y="164" text-anchor="end">3|3</text>
    <text class="sm" x="400" y="66" text-anchor="middle">4|3</text>
    <text class="sm" x="480" y="224" text-anchor="middle">5|3</text>
    <text class="sm" x="366" y="284" text-anchor="start">6|6</text>
    <text class="sm" x="590" y="40" text-anchor="end">labels are tin | low</text>
    <text class="sm rd" x="590" y="62" text-anchor="end">red: bridge</text>
    <text class="sm" x="590" y="84" text-anchor="end">yellow: articulation point</text>
  </svg>
  <figcaption>Two triangles, a connecting edge and a leaf. The red edges are bridges. Vertices 2 and 3 are articulation points. Each label shows tin and then low from the dry run below.</figcaption>
</figure>
<pre><code>function findBridges(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  edges.forEach(([a, b], id) =&gt; {
    adj[a].push([b, id]); <span class="c">// remember WHICH edge, not just which neighbour</span>
    adj[b].push([a, id]);
  });

  const tin = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  const bridges = [];
  let timer = 0;

  function dfs(u, parentEdge) {
    tin[u] = low[u] = timer++;
    for (const [v, id] of adj[u]) {
      if (id === parentEdge) continue; <span class="c">// do not walk back along the edge we arrived by</span>
      if (tin[v] !== -1) {
        low[u] = Math.min(low[u], tin[v]); <span class="c">// a back edge to an earlier vertex</span>
      } else {
        dfs(v, id);
        low[u] = Math.min(low[u], low[v]);
        if (low[v] &gt; tin[u]) bridges.push([u, v]); <span class="c">// v's subtree cannot get above u: edge u-v is a bridge</span>
      }
    }
  }

  for (let s = 0; s &lt; n; s++) if (tin[s] === -1) dfs(s, -1);
  return bridges;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Skip the parent <em>edge</em>, not the parent <em>vertex</em></span>
  The test <code>id === parentEdge</code> stops the DFS from walking straight
  back along the edge it just used. Compare vertices instead and two parallel
  edges between the same pair look like one: the second is skipped too, so
  <code>low</code> never sees it and the pair is reported as a bridge. On
  <code>[[0, 1], [0, 1]]</code> the vertex version reports a bridge and the
  edge-id version reports none, which is right: cut one cable and the other
  still carries the link.
</div>
<h4>Dry run: the graph from the figure, starting at vertex 0</h4>
<table>
  <tr><th>Step</th><th>What happens</th><th>Values</th></tr>
  <tr><td>1</td><td>visit 0, 1, 2 along tree edges</td><td>tin = 0, 1, 2</td></tr>
  <tr><td>2</td><td>at 2, edge 2–0 reaches visited vertex 0 (a back edge)</td><td>low[2] = 0</td></tr>
  <tr><td>3</td><td>visit 3, 4, 5; at 5, edge 5–3 is a back edge</td><td>tin = 3, 4, 5; low[5] = 3</td></tr>
  <tr><td>4</td><td>return 5 → 4 → 3</td><td>low[4] = 3, low[3] = 3; the test low[4] &gt; tin[3] is 3 &gt; 3, false</td></tr>
  <tr><td>5</td><td>visit leaf 6, return to 3</td><td>low[6] = 6 &gt; tin[3] = 3, so <b>edge 3–6 is a bridge</b></td></tr>
  <tr><td>6</td><td>return 3 → 2</td><td>low[3] = 3 &gt; tin[2] = 2, so <b>edge 2–3 is a bridge</b>; low[2] stays 0</td></tr>
  <tr><td>7</td><td>return 2 → 1 → 0</td><td>low[2] = 0 &gt; tin[1] = 1? no. low[1] = 0 &gt; tin[0] = 0? no</td></tr>
</table>
<p class="sub">
  Each non-tree edge is examined from both ends, harmlessly. From vertex 3, the
  edge to its descendant 5 reaches a vertex with <code>tin</code> 5, larger than
  <code>tin[3]</code>, so <code>min(low[3], 5)</code> changes nothing. Only the
  lower end of a back edge can learn anything.
</p>
<p>
  <b>Articulation points</b> use the same numbers, with one change and one
  special case. Remove the vertex <code>u</code> itself. A child's subtree is
  cut off unless a back edge from it reaches a <em>proper ancestor</em> of
  <code>u</code>; an edge that lands on <code>u</code> no longer helps, since
  <code>u</code> is gone. So a non-root <code>u</code> is a cut vertex when some
  child has <code>low[v] &gt;= tin[u]</code>: <b><code>&gt;=</code>, not
  <code>&gt;</code></b>. In the dry run <code>low[4] = 3 = tin[3]</code>, so
  vertex 3 is a cut vertex, although edge 3–4 is not a bridge.
</p>
<p>
  The <b>root</b> needs its own rule. It has the smallest <code>tin</code>, so
  every child satisfies <code>low[v] &gt;= tin[root]</code> trivially, and the
  general test would flag any root that has a child. But a root with one child
  is not a cut vertex: everything else hangs below that child and stays
  connected without the root. Since no edge joins two branches, the root's
  subtrees are linked to each other only through it, so the root is a cut vertex
  exactly when it has <b>two or more tree children</b>.
</p>
<pre><code>function findCutVertices(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  edges.forEach(([a, b], id) =&gt; {
    adj[a].push([b, id]);
    adj[b].push([a, id]);
  });

  const tin = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  const isCut = new Array(n).fill(false);
  let timer = 0;

  function dfs(u, parentEdge) {
    tin[u] = low[u] = timer++;
    let children = 0; <span class="c">// tree children of u</span>
    for (const [v, id] of adj[u]) {
      if (id === parentEdge) continue;
      if (tin[v] !== -1) {
        low[u] = Math.min(low[u], tin[v]);
      } else {
        children++;
        dfs(v, id);
        low[u] = Math.min(low[u], low[v]);
        if (parentEdge !== -1 &amp;&amp; low[v] &gt;= tin[u]) isCut[u] = true; <span class="c">// non-root: "&gt;=", not "&gt;"</span>
      }
    }
    if (parentEdge === -1 &amp;&amp; children &gt;= 2) isCut[u] = true; <span class="c">// the root has its own rule</span>
  }

  for (let s = 0; s &lt; n; s++) if (tin[s] === -1) dfs(s, -1);
  return isCut.flatMap((flag, v) =&gt; (flag ? [v] : []));
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Three comparisons that look alike</span>
  Bridge: <code>low[v] &gt; tin[u]</code>. Cut vertex, non-root:
  <code>low[v] &gt;= tin[u]</code>. Cut vertex, root: count the children. A
  triangle has no bridge and no cut vertex, so make it your first test: with
  <code>&gt;=</code> in the bridge test it reports bridges, and with the
  non-root test applied to the root it reports its starting vertex.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll run a DFS and record each
  vertex's discovery time, and for each vertex the lowest discovery time its
  subtree can reach with one back edge. A tree edge from u to a child v is a
  bridge when v's lowest value is still greater than u's own time, because then
  nothing under v connects back to u or above. In an undirected DFS non-tree
  edges only go to ancestors, so that is the only way the subtree could stay
  attached. It's O(V + E), and I identify the parent edge by its id so parallel
  edges are handled."
</div>
<p>
  Delete the bridges and the connected pieces that remain are the
  <b>2-edge-connected components</b>, groups where any single cable can fail
  without splitting the group; the bridges form a tree over them, the same trick
  as the condensation for directed graphs.
</p>

<h3>Euler paths and circuits: use every edge once</h3>
<p>
  An <b>Euler path</b> walks along every edge exactly once; an <b>Euler
  circuit</b> does so and ends where it began. The question is about
  <em>edges</em>, not vertices, and that makes it easy: a clean test and a
  linear-time construction. (Visiting every <em>vertex</em> once is the
  Hamiltonian problem, which has no known fast algorithm.)
</p>
<p>
  The test comes from counting. Each time a walk passes <em>through</em> a
  vertex it uses one edge to arrive and another to leave. So for every vertex
  that is neither the start nor the end, the edges at it pair up.
</p>
<table>
  <tr><th></th><th>Euler circuit</th><th>Euler path (not closed)</th></tr>
  <tr><td>Undirected</td><td>every vertex has even degree</td><td>exactly two vertices have odd degree; the walk starts at one and ends at the other</td></tr>
  <tr><td>Directed</td><td>in-degree = out-degree at every vertex</td><td>one vertex with out − in = 1 (the start), one with in − out = 1 (the end), the rest balanced</td></tr>
  <tr><td>Both</td><td colspan="2">all edges lie in one connected piece (isolated vertices do not matter; for a directed graph, ignore edge directions when checking this)</td></tr>
</table>
<p>
  A self-loop adds 2 to a vertex's degree, so it never changes parity. The
  conditions are necessary by the pairing argument; sufficiency is exactly what
  the construction below proves. Here is the undirected test:
</p>
<pre><code>function eulerKind(n, edges) {
  const degree = new Array(n).fill(0);
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [a, b] of edges) {
    degree[a]++;
    degree[b]++; <span class="c">// a self-loop [a, a] adds 2 to a, which keeps the parity right</span>
    adj[a].push(b);
    adj[b].push(a);
  }

  const start = degree.findIndex((d) =&gt; d &gt; 0);
  if (start === -1) return "circuit"; <span class="c">// no edges: the empty walk uses them all</span>
  const seen = new Array(n).fill(false);
  seen[start] = true;
  const stack = [start];
  while (stack.length) {
    const u = stack.pop();
    for (const v of adj[u]) {
      if (!seen[v]) {
        seen[v] = true;
        stack.push(v);
      }
    }
  }
  for (let v = 0; v &lt; n; v++) if (degree[v] &gt; 0 &amp;&amp; !seen[v]) return "none"; <span class="c">// edges in two separate pieces</span>

  const odd = degree.filter((d) =&gt; d % 2 === 1).length;
  if (odd === 0) return "circuit";
  if (odd === 2) return "path";
  return "none";
}</code></pre>
<p>
  The connectivity loop is not decoration. Two separate triangles have every
  degree even, and no walk can use edges of both.
</p>

<h3>Hierholzer: building the walk</h3>
<p>
  Start at the right vertex (the one with the surplus out-edge for a directed
  path, an odd vertex for an undirected one, anything for a circuit) and keep
  walking along unused edges. Because of the degree conditions you can only get
  stuck at the <b>end</b> of the trail: every other vertex you enter has a spare
  edge to leave by. But that walk may not use all the edges. The unused ones are
  balanced (each vertex has as many unused edges in as out, or an even number),
  so from any vertex of the walk that still has unused edges you can start a new
  walk, and it can only get stuck back where it began, closing a loop. Splice
  the loop in at that vertex and continue.
</p>
<p>
  The stack does this automatically. Push the start. While the stack is not
  empty, look at the top vertex <code>u</code>: if it has an unused edge, take it
  and push the new vertex; otherwise <code>u</code> is stuck, so <b>pop it and
  write it to the output</b>. A vertex is written only when nothing is left to
  do after it, so the output is the trail backwards; reverse it at the end. A
  detour is written before the vertex it started from, and after the reversal it
  sits between that vertex's arrival and its departure: that is the splice.
</p>
<pre><code>function eulerPathDirected(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  const balance = new Array(n).fill(0); <span class="c">// out-degree minus in-degree</span>
  for (const [u, v] of edges) {
    adj[u].push(v);
    balance[u]++;
    balance[v]--;
  }

  let start = -1;
  let ends = 0;
  for (let v = 0; v &lt; n; v++) {
    if (balance[v] === 1) {
      if (start !== -1) return null; <span class="c">// two vertices want to be the start</span>
      start = v;
    } else if (balance[v] === -1) {
      ends++;
    } else if (balance[v] !== 0) {
      return null;
    }
  }
  if (ends &gt; 1) return null;
  if (start === -1) start = edges.length ? edges[0][0] : 0; <span class="c">// balanced: a circuit, any vertex with an edge will do</span>

  const next = new Array(n).fill(0); <span class="c">// next unused edge of each vertex</span>
  const stack = [start];
  const path = [];
  while (stack.length) {
    const u = stack[stack.length - 1];
    if (next[u] &lt; adj[u].length) {
      stack.push(adj[u][next[u]++]); <span class="c">// use one more edge and walk along it</span>
    } else {
      path.push(stack.pop()); <span class="c">// stuck: u is the last vertex of what is still unwritten</span>
    }
  }

  if (path.length !== edges.length + 1) return null; <span class="c">// some edges were unreachable from start</span>
  return path.reverse();
}</code></pre>
<p>
  Each edge is consumed once through the <code>next</code> pointer, so the time
  is O(V + E). The final length check doubles as the connectivity test: if fewer
  than <code>edges.length + 1</code> vertices were written, some edges lay in a
  piece that <code>start</code> cannot reach. The undirected version needs one
  extra detail: every edge is in two adjacency lists, so a <code>used[id]</code>
  flag marks it gone from both ends.
</p>
<pre><code>function eulerTrailUndirected(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  edges.forEach(([a, b], id) =&gt; {
    adj[a].push([b, id]);
    adj[b].push([a, id]);
  });

  const odd = [];
  for (let v = 0; v &lt; n; v++) if (adj[v].length % 2 === 1) odd.push(v);
  if (odd.length !== 0 &amp;&amp; odd.length !== 2) return null;

  let start = odd.length ? odd[0] : adj.findIndex((list) =&gt; list.length &gt; 0);
  if (start === -1) start = 0; <span class="c">// no edges at all</span>

  const used = new Array(edges.length).fill(false); <span class="c">// an undirected edge is listed twice: mark it once</span>
  const next = new Array(n).fill(0);
  const stack = [start];
  const path = [];
  while (stack.length) {
    const u = stack[stack.length - 1];
    while (next[u] &lt; adj[u].length &amp;&amp; used[adj[u][next[u]][1]]) next[u]++; <span class="c">// skip edges used from the other end</span>
    if (next[u] &lt; adj[u].length) {
      const [v, id] = adj[u][next[u]++];
      used[id] = true;
      stack.push(v);
    } else {
      path.push(stack.pop());
    }
  }

  if (path.length !== edges.length + 1) return null;
  return path.reverse();
}</code></pre>
<p class="sub">
  Both functions were compared with a brute force that tries every ordering of
  the edges, on thousands of random multigraphs with self-loops and parallel
  edges: they agree on whether a trail exists, and every trail they return is
  checked to use each edge exactly once.
</p>

<h3>Reconstruct Itinerary: Hierholzer with lexical order</h3>
<p>
  "Reconstruct Itinerary" gives you a list of tickets <code>[from, to]</code>.
  Start at <code>"JFK"</code>, use every ticket exactly once, and return the
  itinerary that is smallest in lexical order. A valid itinerary is promised to
  exist, so this is an Euler path in a directed multigraph, with one twist:
  among all of them you must produce the lexically smallest.
</p>
<p>
  The obvious greedy approach, always taking the smallest available
  destination, fails. With tickets JFK→KUL, JFK→NRT, NRT→JFK, the smallest
  choice from JFK is KUL, which has no ticket out: the walk is stuck with two
  tickets unused. Hierholzer repairs this in one pass. A trap is a vertex where
  the walk gets stuck, and the algorithm <em>writes the stuck vertex first</em>,
  so after the reversal it lands last: the ticket into the trap becomes the
  final departure from JFK, where it has to be.
</p>
<p>
  So taking the smallest unused ticket first gives the lexically smallest
  itinerary: a smallest ticket that is a trap is moved to last, and any other
  smallest ticket is used first, which is as small as it can be. I checked this
  against a brute force that enumerates every valid itinerary of random ticket
  sets and keeps the minimum (over twenty thousand cases with an answer).
</p>
<pre><code>function findItinerary(tickets) {
  const adj = new Map();
  for (const [from, to] of tickets) {
    if (!adj.has(from)) adj.set(from, []);
    adj.get(from).push(to);
  }
  for (const list of adj.values()) list.sort().reverse(); <span class="c">// smallest destination at the END, so pop() is O(1)</span>

  const stack = ["JFK"];
  const route = [];
  while (stack.length) {
    const airport = stack[stack.length - 1];
    const options = adj.get(airport);
    if (options &amp;&amp; options.length) {
      stack.push(options.pop()); <span class="c">// the smallest unused ticket out of here</span>
    } else {
      route.push(stack.pop()); <span class="c">// stuck: this airport comes last among those still unplaced</span>
    }
  }
  return route.reverse();
}</code></pre>
<h4>Dry run: JFK→KUL, JFK→NRT, NRT→JFK</h4>
<p>
  After sorting, <code>JFK</code> has <code>[NRT, KUL]</code> with the smallest,
  KUL, at the end, and <code>NRT</code> has <code>[JFK]</code>.
</p>
<table>
  <tr><th>Step</th><th>Top of stack</th><th>Action</th><th>Stack</th><th>Route written so far</th></tr>
  <tr><td>1</td><td>JFK</td><td>take the smallest ticket, JFK→KUL</td><td>[JFK, KUL]</td><td>[]</td></tr>
  <tr><td>2</td><td>KUL</td><td>no tickets: stuck, write it</td><td>[JFK]</td><td>[KUL]</td></tr>
  <tr><td>3</td><td>JFK</td><td>take JFK→NRT</td><td>[JFK, NRT]</td><td>[KUL]</td></tr>
  <tr><td>4</td><td>NRT</td><td>take NRT→JFK</td><td>[JFK, NRT, JFK]</td><td>[KUL]</td></tr>
  <tr><td>5</td><td>JFK</td><td>no tickets: write it</td><td>[JFK, NRT]</td><td>[KUL, JFK]</td></tr>
  <tr><td>6</td><td>NRT</td><td>write it</td><td>[JFK]</td><td>[KUL, JFK, NRT]</td></tr>
  <tr><td>7</td><td>JFK</td><td>write it</td><td>[]</td><td>[KUL, JFK, NRT, JFK]</td></tr>
</table>
<p class="sub">
  Reversed, the route is JFK, NRT, JFK, KUL: the greedy first choice, KUL, was
  not discarded, only moved to the end. The code returns this itinerary.
</p>
<div class="warn">
  <span class="ttl">⚠ Sorting, removing and reversing</span>
  <code>sort()</code> with no comparator compares text, which is the order the
  problem wants for airport codes, but on <b>numbers</b>
  <code>[9, 10].sort()</code> gives <code>[10, 9]</code>; for numeric vertices
  sort with <code>(a, b) =&gt; b - a</code> and drop the <code>reverse()</code>. Keep the smallest ticket at the
  <em>end</em> of each list and use <code>pop()</code>: removing from the front
  of an array can cost O(length) per call. And do not forget
  <code>route.reverse()</code>, or you return the itinerary backwards.
</div>
<p>
  Time: O(E log E) for the sorting of the adjacency lists, O(E) for the walk.
  A variant, "Valid Arrangement of Pairs", has integer vertices and asks for
  any ordering of the pairs so that each pair starts where the previous one
  ended: the same algorithm, with the start chosen by the out − in = 1 rule.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "This is an Euler path in a
  directed multigraph: every ticket is an edge that must be used once. I'll use
  Hierholzer's algorithm with a stack: take the smallest unused ticket from the
  top airport, and when an airport has no tickets left, pop it into the route.
  The route comes out reversed, so I flip it at the end. A dead-end airport gets
  written first and therefore ends up last, which is why the greedy order is
  safe. Sorting dominates, so it's O(E log E)."
</div>

<h3>Binary lifting: LCA and the kth ancestor</h3>
<p>
  You are given a tree as a parent array (<code>parent[root] = -1</code>) and
  many queries: the kth ancestor of <code>v</code>, or the lowest common
  ancestor of <code>u</code> and <code>v</code>. Walking up one parent at a time
  costs O(depth) per query, which is O(n) on a path-shaped tree; with n and the
  number of queries both near 10⁵ that is about 10¹⁰ steps.
</p>
<p>
  Precompute, for every vertex, its 1st, 2nd, 4th, 8th... ancestor, and call
  the 2<sup>j</sup>th one <code>up[j][v]</code>. Each row comes from the one
  before, because 2<sup>j</sup> steps are two jumps of 2<sup>j−1</sup> steps:
  <code>up[j][v] = up[j−1][ up[j−1][v] ]</code>. Any <code>k</code> is a sum of
  distinct powers of two, its binary digits, so the kth ancestor is reached by
  taking <code>up[j]</code> for every set bit <code>j</code> of
  <code>k</code>: at most log₂ n jumps. The table has n · ⌈log₂ n⌉ entries.
</p>
<p>
  For the LCA, lift the deeper vertex by the depth difference so both are on the
  same level. If they coincide, that is the answer. Otherwise go through the
  jumps from the longest to the shortest, and whenever the two
  2<sup>j</sup>th ancestors <em>differ</em>, take that jump with both. This
  works because "the 2<sup>j</sup>th ancestors are the same vertex" is monotone
  in <code>j</code>: once a jump is long enough to reach a common ancestor, every
  longer one does too. The loop is a binary search for the longest jump that
  stays <em>below</em> the LCA, and afterwards both vertices are children of
  the LCA.
</p>
<pre><code>function buildLifting(parent) {
  const n = parent.length;
  let LOG = 1;
  while (1 &lt;&lt; LOG &lt; n) LOG++; <span class="c">// smallest LOG with 2^LOG &gt;= n; integer arithmetic, no Math.log2</span>

  const up = [parent.slice()]; <span class="c">// up[0][v] = parent of v, or -1 above the root</span>
  for (let j = 1; j &lt; LOG; j++) {
    const prev = up[j - 1];
    up.push(prev.map((mid) =&gt; (mid === -1 ? -1 : prev[mid]))); <span class="c">// 2^j steps = 2^(j-1) steps, twice</span>
  }

  const children = Array.from({ length: n }, () =&gt; []);
  const queue = [];
  for (let v = 0; v &lt; n; v++) {
    if (parent[v] === -1) queue.push(v);
    else children[parent[v]].push(v);
  }
  const depth = new Array(n).fill(0);
  for (let head = 0; head &lt; queue.length; head++) { <span class="c">// breadth-first from the root: no recursion</span>
    const u = queue[head];
    for (const c of children[u]) {
      depth[c] = depth[u] + 1;
      queue.push(c);
    }
  }
  return { up, depth, LOG, n };
}

function kthAncestor(lift, v, k) {
  if (k &gt;= lift.n) return -1; <span class="c">// no vertex is that deep, and the bits of k would run off the table</span>
  for (let j = 0; k &gt; 0 &amp;&amp; v !== -1; j++, k &gt;&gt;= 1) {
    if (k &amp; 1) v = lift.up[j][v]; <span class="c">// take the 2^j jump when bit j of k is set</span>
  }
  return v;
}

function lca(lift, u, v) {
  if (lift.depth[u] &lt; lift.depth[v]) [u, v] = [v, u]; <span class="c">// make u the deeper one</span>
  u = kthAncestor(lift, u, lift.depth[u] - lift.depth[v]); <span class="c">// bring both to the same depth</span>
  if (u === v) return u;
  for (let j = lift.LOG - 1; j &gt;= 0; j--) {
    if (lift.up[j][u] !== lift.up[j][v]) { <span class="c">// the jump lands on different vertices: it stays below the LCA</span>
      u = lift.up[j][u];
      v = lift.up[j][v];
    }
  }
  return lift.up[0][u]; <span class="c">// one step above both is the LCA (-1 if they sit in different trees)</span>
}</code></pre>
<h4>Dry run: a ten-vertex tree</h4>
<p>
  <code>parent = [-1, 0, 0, 1, 1, 2, 3, 3, 4, 7]</code>, so 0 is the root,
  1 and 2 are its children, 3 and 4 are children of 1, and 9 hangs below
  7, below 3. The depths are 0, 1, 1, 2, 2, 2, 3, 3, 3, 4. Here
  <code>LOG</code> is 4.
</p>
<table>
  <tr><th>v</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th></tr>
  <tr><td>up[0] (1 step)</td><td>−1</td><td>0</td><td>0</td><td>1</td><td>1</td><td>2</td><td>3</td><td>3</td><td>4</td><td>7</td></tr>
  <tr><td>up[1] (2 steps)</td><td>−1</td><td>−1</td><td>−1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>1</td><td>3</td></tr>
  <tr><td>up[2] (4 steps)</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>0</td></tr>
  <tr><td>up[3] (8 steps)</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td><td>−1</td></tr>
</table>
<p>
  <b>kthAncestor(9, 3)</b>: 3 is binary 11, so take up[0] then up[1]:
  9 → 7 → 1. <b>kthAncestor(9, 5)</b> is −1, since 9 has depth 4 and only four
  ancestors. <b>lca(9, 8)</b>: depth(9) = 4, depth(8) = 3, so lift 9 by one to
  get 7. Since 7 ≠ 8, scan the jumps from the top: j = 3 and j = 2 give −1 for
  both, equal, skip; j = 1 gives 1 for both, equal, skip; j = 0 gives 3 and 4,
  different, so move to u = 3 and v = 4. The answer is
  <code>up[0][3] = 1</code>. Check on the tree: 9's path goes 9, 7, 3, 1, 0 and
  8's goes 8, 4, 1, 0, so 1 is their lowest common ancestor.
</p>
<p>
  Costs: O(n log n) time and space to build, O(log n) per query. The table can
  carry extra data per jump, such as the maximum edge weight on the way up, to
  answer path queries; and because a new leaf's rows depend only on rows that
  already exist, a leaf can be added in O(log n), which is the setting of "Kth
  Ancestor of a Tree Node". If all queries are known in advance, offline
  Tarjan LCA with <a href="/dsa/dsa-union-find">Union-Find</a>, or an Euler tour
  with a <a href="/dsa/dsa-sparse-table">sparse table</a> for O(1) per query,
  are alternatives. For one query on a binary tree, plain recursion is simpler.
</p>
<div class="warn">
  <span class="ttl">⚠ The details that break lifting code</span>
  <b>Sentinel:</b> a jump above the root must stay −1 in every row, and every
  lookup must check for it first (<code>mid === -1 ? -1 : prev[mid]</code>).
  <b>Out-of-range k:</b> <code>k &gt;= n</code> has no answer, and its high bits
  would index rows that do not exist. <b>Depth:</b> compute it breadth-first;
  a recursive pass overflows on a path-shaped tree. <b>Loop order:</b> the LCA
  jumps must run from the highest row to the lowest. <b>Table size:</b> find the
  smallest <code>LOG</code> with 2<sup>LOG</sup> at least n using integers, not
  <code>Math.log2</code>.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Walking up is O(depth) per query,
  so I'll precompute jumps. up[j][v] is the 2^j-th ancestor, and each row is
  the previous row applied twice, so the table is n log n. For the kth ancestor
  I take the jump for every set bit of k. For the LCA I first equalize depths,
  then go from the longest jump to the shortest, moving both vertices whenever
  their ancestors differ; at the end they are children of the LCA, so I return
  the parent. Build is O(n log n) and each query is O(log n)."
</div>

<h3>Tree diameter: two sweeps and a DP</h3>
<p>
  The <b>diameter</b> of a tree is the length of the longest path between any
  two vertices, counted in edges, or as the sum of edge weights when edges have
  weights. The brute force runs a traversal from every vertex: O(n²). There are
  two linear methods.
</p>
<p>
  <b>Method 1, two sweeps.</b> Start anywhere and find the vertex
  <code>a</code> farthest from it; then find the vertex <code>b</code> farthest
  from <code>a</code>. The distance from <code>a</code> to <code>b</code> is the
  diameter. The claim to prove is that the first farthest vertex ends some
  longest path. Take a longest path P with ends <code>x</code> and
  <code>y</code>, a start <code>s</code> and a farthest vertex <code>f</code>.
  Let <code>p</code> and <code>q</code> be the vertices of P closest to
  <code>s</code> and to <code>f</code>.
</p>
<p>
  If <code>p ≠ q</code>, say <code>q</code> is on the <code>y</code> side. The
  paths <code>s → f</code> and <code>s → y</code> both run through
  <code>p</code> and <code>q</code>, and <code>f</code> being at least as far
  as <code>y</code> gives <code>d(q, f) ≥ d(q, y)</code>. Then
  <code>d(f, x) = d(f, q) + d(q, p) + d(p, x) ≥ d(y, q) + d(q, p) + d(p, x) = d(x, y)</code>.
  If <code>p = q</code>, the path <code>s → x</code> goes through
  <code>p</code>, and <code>d(s, f) ≥ d(s, x)</code> with
  <code>d(s, f) ≤ d(s, p) + d(p, f)</code> gives <code>d(p, f) ≥ d(p, x)</code>,
  and likewise for <code>y</code>; so
  <code>d(f, y) = d(f, p) + d(p, y) ≥ d(x, p) + d(p, y) = d(x, y)</code>. Either
  way <code>f</code> ends a longest path, so the second sweep starts from such
  an end and its farthest vertex is at distance exactly the diameter. The
  argument needs only non-negative distances.
</p>
<pre><code>function farthest(adj, start) {
  const dist = new Map([[start, 0]]);
  const stack = [start];
  let best = start;
  while (stack.length) {
    const u = stack.pop();
    if (dist.get(u) &gt; dist.get(best)) best = u;
    for (const [v, w] of adj[u]) {
      if (!dist.has(v)) { <span class="c">// in a tree, "not seen yet" means "not the vertex I came from"</span>
        dist.set(v, dist.get(u) + w);
        stack.push(v);
      }
    }
  }
  return [best, dist.get(best)];
}

function treeDiameterTwoSweeps(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [u, v, w = 1] of edges) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }
  const [a] = farthest(adj, 0); <span class="c">// sweep 1: any start, find the farthest vertex</span>
  const [b, length] = farthest(adj, a); <span class="c">// sweep 2: from that vertex, the farthest one is the other end</span>
  return { length, ends: [a, b] };
}</code></pre>
<p>
  <b>Method 2, DP over children.</b> For each vertex, let <code>top1</code> be
  the longest downward path from it and <code>top2</code> the longest one
  through a <em>different</em> child. The longest path that has this vertex as
  its highest point is <code>top1 + top2</code>, and the diameter is the best of
  those over all vertices. Processing vertices in reverse breadth-first order
  guarantees that children are done before their parent, with no recursion.
</p>
<pre><code>function treeDiameterDp(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [u, v, w = 1] of edges) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }

  const parent = new Array(n).fill(-1);
  const parentWeight = new Array(n).fill(0);
  const seen = new Array(n).fill(false);
  const order = [0]; <span class="c">// breadth-first order: every parent before its children</span>
  seen[0] = true;
  for (let head = 0; head &lt; order.length; head++) {
    const u = order[head];
    for (const [v, w] of adj[u]) {
      if (!seen[v]) {
        seen[v] = true;
        parent[v] = u;
        parentWeight[v] = w;
        order.push(v);
      }
    }
  }

  const top1 = new Array(n).fill(0); <span class="c">// longest downward path from each vertex</span>
  const top2 = new Array(n).fill(0); <span class="c">// second longest, through a different child</span>
  let best = 0;
  for (let i = order.length - 1; i &gt;= 0; i--) { <span class="c">// children before parents</span>
    const u = order[i];
    best = Math.max(best, top1[u] + top2[u]); <span class="c">// the best path that bends at u</span>
    const p = parent[u];
    if (p === -1) continue;
    const reach = top1[u] + parentWeight[u];
    if (reach &gt; top1[p]) {
      top2[p] = top1[p];
      top1[p] = reach;
    } else if (reach &gt; top2[p]) {
      top2[p] = reach;
    }
  }
  return best;
}</code></pre>
<h4>Dry run: a weighted tree</h4>
<p>
  Edges (u, v, weight): (0,1,2), (1,2,3), (1,3,1), (0,4,4), (4,5,2), (5,6,5),
  (4,7,1).
</p>
<table>
  <tr><th>Sweep</th><th>Distances to vertices 0 to 7</th><th>Farthest</th></tr>
  <tr><td>1: from 0</td><td>0, 2, 5, 3, 4, 6, 11, 5</td><td>vertex 6, distance 11</td></tr>
  <tr><td>2: from 6</td><td>11, 13, 16, 14, 7, 5, 0, 8</td><td>vertex 2, distance <b>16</b></td></tr>
</table>
<p>
  The diameter is 16: the path 6, 5, 4, 0, 1, 2 with weights 5 + 2 + 4 + 2 + 3.
  The DP finds the same number:
</p>
<table>
  <tr><th>Vertex (children first)</th><th>top1</th><th>top2</th><th>Path bending here</th></tr>
  <tr><td>6, 7, 3, 2 (leaves)</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>5</td><td>5 (down to 6)</td><td>0</td><td>5</td></tr>
  <tr><td>4</td><td>7 (via 5: 2 + 5)</td><td>1 (via 7)</td><td>8</td></tr>
  <tr><td>1</td><td>3 (via 2)</td><td>1 (via 3)</td><td>4</td></tr>
  <tr><td>0</td><td>11 (via 4: 4 + 7)</td><td>5 (via 1: 2 + 3)</td><td><b>16</b></td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Where the diameter methods stop working</span>
  Two sweeps is a theorem about <b>trees</b> with non-negative weights. On a
  graph with cycles the farthest vertex need not end a longest shortest path,
  and with negative weights the proof breaks. The DP counts a path as the sum of
  its two longest branches, so decide up front whether the answer is in edges or
  in vertices, which differ by one. The tree chapters have the binary-tree
  version of this DP, where a vertex has at most two children.
</div>
<p class="sub">
  A neighbour of this problem is "Minimum Height Trees": the roots that give
  the smallest height are the middle one or two vertices of a longest path. Find a
  diameter, and its midpoint is the answer.
</p>

<h3>Deep graphs: the recursion limit and the explicit stack</h3>
<p>
  A JavaScript engine gives the call stack a fixed budget. This measures it on
  your own machine:
</p>
<pre><code>function recursionDepth() {
  let depth = 0;
  function dive() {
    depth++;
    dive();
  }
  try {
    dive();
  } catch (error) {
    return depth; <span class="c">// a RangeError: Maximum call stack size exceeded</span>
  }
}</code></pre>
<p>
  On the Node 24 used to check this chapter, an empty recursive function reached
  roughly ten thousand frames. A real DFS frame holds arrays, a loop and
  an iterator, so it fares worse: a recursive Tarjan on a graph that is one long
  path overflowed at about 5,000 vertices, and the recursive bridge finder at
  about 4,400. The numbers depend on the engine and the frame size, so do not
  rely on them; the lesson is the order of magnitude. A path of 10⁵ vertices, a
  normal test when the statement says <code>n ≤ 10⁵</code>, crashes every
  recursive DFS here.
</p>
<p>
  The fix is mechanical: keep the call stack in an array, and replace the
  <code>for</code> loop over neighbours with a per-vertex <b>edge pointer</b>.
</p>
<table>
  <tr><th>In the recursive version</th><th>In the iterative version</th></tr>
  <tr><td>the call <code>dfs(v)</code></td><td>set <code>tin[v]</code>, push <code>v</code> on <code>calls</code></td></tr>
  <tr><td>the loop <code>for (const v of adj[u])</code></td><td>a <code>while</code> loop that reads <code>next[u]++</code> each time</td></tr>
  <tr><td>code before the call</td><td>runs at the push</td></tr>
  <tr><td>code after the call returns</td><td>runs when the child is popped, with the new top of <code>calls</code> as the parent</td></tr>
  <tr><td>the parameter <code>parentEdge</code></td><td>an array <code>viaEdge[v]</code>, set at the push</td></tr>
  <tr><td>code after the loop (the root test in Tarjan)</td><td>runs when the pointer runs out, just before the pop</td></tr>
</table>
<p>
  <code>sccTarjan</code> earlier in the chapter is the recursive form of that
  table; applying the recipe to it line by line gives the iterative version the
  first practice exercise asks for. The next function does it for bridges and
  cut vertices in one pass. Kosaraju, Hierholzer, the diameter code and the
  lifting table were written without recursion from the start.
</p>
<pre><code>function bridgesAndCutVertices(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  edges.forEach(([a, b], id) =&gt; {
    adj[a].push([b, id]);
    adj[b].push([a, id]);
  });

  const tin = new Array(n).fill(-1);
  const low = new Array(n).fill(0);
  const next = new Array(n).fill(0);
  const viaEdge = new Array(n).fill(-1); <span class="c">// the edge id each vertex was first reached by</span>
  const isCut = new Array(n).fill(false);
  const bridges = [];
  let timer = 0;

  for (let root = 0; root &lt; n; root++) {
    if (tin[root] !== -1) continue;
    tin[root] = low[root] = timer++;
    const calls = [root];
    let rootChildren = 0;

    while (calls.length) {
      const u = calls[calls.length - 1];
      if (next[u] &lt; adj[u].length) {
        const [v, id] = adj[u][next[u]++];
        if (id === viaEdge[u]) continue;
        if (tin[v] !== -1) {
          low[u] = Math.min(low[u], tin[v]);
        } else {
          tin[v] = low[v] = timer++;
          viaEdge[v] = id;
          calls.push(v);
          if (u === root) rootChildren++;
        }
      } else {
        calls.pop(); <span class="c">// u is done; its parent p is the new top of the stack</span>
        if (calls.length) {
          const p = calls[calls.length - 1];
          low[p] = Math.min(low[p], low[u]);
          if (low[u] &gt; tin[p]) bridges.push([p, u]);
          if (p !== root &amp;&amp; low[u] &gt;= tin[p]) isCut[p] = true;
        }
      }
    }
    if (rootChildren &gt;= 2) isCut[root] = true;
  }
  return { bridges, cutVertices: isCut.flatMap((flag, v) =&gt; (flag ? [v] : [])) };
}</code></pre>
<p class="sub">
  Both iterative versions agree with the recursive ones on random graphs, and
  they ran in a fraction of a second on a path of 300,000 vertices, where the
  recursive versions throw. In an interview it is reasonable to write the
  recursive form first, name the depth risk, and offer the stack version when
  the constraints are large.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>Groups of things that can all reach each other, a cycle in a directed graph that must be reported as a whole, or "minimum starting points to reach everything":</b> strongly connected components, then the condensation DAG.</li>
  <li><b>"Critical", "single point of failure", "removing this edge/server disconnects":</b> bridges or articulation points with low-link.</li>
  <li><b>"Use every edge exactly once", "reconstruct the route from tickets", "order the dominoes/pairs so each starts where the last ended":</b> Euler path; check degrees, then Hierholzer. If the statement says every <em>vertex</em> once, it is a different, much harder problem.</li>
  <li><b>"Lowest common ancestor" or "kth ancestor" with many queries on a large tree:</b> binary lifting. One query, or a binary search tree: a simple walk is enough.</li>
  <li><b>"Longest path in a tree", "farthest two nodes", "worst-case distance":</b> diameter by two sweeps or the DP. "Best root to minimise the height": the middle of the diameter.</li>
  <li><b>Watch the graph type.</b> Bridges and articulation points are for undirected graphs; SCC is for directed graphs; the two sweeps are for trees. Check <em>directed or undirected</em>, <em>connected or not</em>, <em>multi-edges or self-loops</em> before choosing.</li>
  <li><b>Check the input size.</b> If <code>n</code> reaches 10⁵ and the graph can be a long path, plan the explicit stack from the start.</li>
</ul>
<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain in your own words why a vertex is the root of its strongly connected component exactly when low equals tin, and why an edge into an already-finished component must be ignored.</li>
    <li>State the lemma that makes Kosaraju work, and say why the second pass walks the reversed graph in decreasing finish order.</li>
    <li>Build the condensation and use it for two things: counting the starting vertices needed to reach everything, and a DP over components.</li>
    <li>Write the bridge and articulation-point tests from memory, with the right comparison for each and the special case for the root, and explain why the parent edge is skipped by id.</li>
    <li>Give the degree conditions for an Euler path and circuit in both undirected and directed graphs, then run Hierholzer by hand on the three-ticket example.</li>
    <li>Build the binary lifting table, answer a kth-ancestor and an LCA query on it, and say why the LCA loop goes from the longest jump to the shortest.</li>
    <li>Compute a tree diameter two ways and say when two sweeps stops being valid.</li>
    <li>Translate a recursive DFS into one with an explicit stack and an edge pointer, and say when you would bother.</li>
  </ul>
</div>
`,
};
