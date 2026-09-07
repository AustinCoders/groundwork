import type { Chapter } from "../types";

export const dsaMinimumSpanningTree: Chapter = {
  id: "dsa-minimum-spanning-tree",
  num: "A4",
  title: "Minimum Spanning Tree",
  short: "Minimum Spanning Tree",
  levels: ["advanced"],
  practice: ["ex-min-cost-connect-all-points"],
  ready: true,
  subtitle:
    "The cheapest wiring that reaches every node — greedy is provably optimal here, and there are exactly two ways to be greedy.",
  body: `<h3>What a minimum spanning tree actually is</h3>
<p>
  Given a connected, undirected, weighted graph on n vertices, a
  <b>spanning tree</b> is any subset of n−1 edges that keeps every vertex
  reachable — connected, acyclic, nothing left out. The <b>minimum</b>
  spanning tree is the spanning tree whose weights sum to the smallest
  possible total. Notice what is <em>not</em> being minimised: not the
  distance between any particular pair of vertices, only the total weight
  of the whole structure. An MST can easily make the trip from u to v much
  longer than the graph allows — it only promises the cheapest total wiring.
</p>

<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A five vertex weighted graph with the four minimum spanning tree edges drawn in green, one rejected cycle edge in red, and two unused edges dashed">
    <g class="rough">
      <path class="lng" d="M100,60 L280,60" />
      <path class="lng" d="M280,60 L470,60" />
      <path class="lnr dash" d="M100,60 L100,190" />
      <path class="lng" d="M280,60 L100,190" />
      <path class="lng" d="M280,60 L280,190" />
      <path class="ln dash" d="M100,190 L280,190" />
      <path class="ln dash" d="M470,60 L280,190" />
    </g>
    <g class="rough">
      <circle class="box" cx="100" cy="60" r="22" />
      <circle class="box" cx="280" cy="60" r="22" />
      <circle class="box" cx="470" cy="60" r="22" />
      <circle class="box" cx="100" cy="190" r="22" />
      <circle class="box" cx="280" cy="190" r="22" />
    </g>
    <text class="lbl" x="100" y="66" text-anchor="middle">A</text>
    <text class="lbl" x="280" y="66" text-anchor="middle">B</text>
    <text class="lbl" x="470" y="66" text-anchor="middle">C</text>
    <text class="lbl" x="100" y="196" text-anchor="middle">D</text>
    <text class="lbl" x="280" y="196" text-anchor="middle">E</text>
    <text class="sm gr" x="190" y="46" text-anchor="middle">1</text>
    <text class="sm gr" x="375" y="46" text-anchor="middle">5</text>
    <text class="sm rd" x="82" y="130" text-anchor="end">4</text>
    <text class="sm gr" x="205" y="136">2</text>
    <text class="sm gr" x="296" y="130">3</text>
    <text class="sm" x="190" y="212" text-anchor="middle">7</text>
    <text class="sm" x="392" y="140">6</text>
    <text class="lbl gr" x="520" y="145" style="font-size:14px">green = in the MST</text>
    <text class="lbl rd" x="520" y="168" style="font-size:14px">red = would close</text>
    <text class="lbl rd" x="520" y="186" style="font-size:14px">a cycle</text>
    <text class="sm" x="520" y="212">total = 1+2+3+5 = 11</text>
  </svg>
  <figcaption>Four edges for five vertices — always exactly n−1. A–D is cheap (4) but rejected because A and D are already connected through B.</figcaption>
</figure>

<h3>Why greedy is safe: the cut property</h3>
<p>
  Greedy algorithms usually need a proof before you trust them, and MST has
  a clean one. Split the vertices into two non-empty groups — call that a
  <b>cut</b>. The <b>cut property</b> says: the cheapest edge crossing that
  cut belongs to some MST. The intuition is an exchange argument. Suppose an
  MST T doesn't contain that cheapest crossing edge e. Add e to T anyway —
  now you have a cycle, and that cycle has to cross back over the cut on some
  other edge f. Since e was the cheapest crossing edge, weight(e) ≤ weight(f),
  so swapping f out for e leaves you with a spanning tree that is no heavier.
  The greedy choice was never a mistake.
</p>
<p>
  The mirror image is the <b>cycle property</b>: on any cycle, the single
  heaviest edge is never needed — you can always delete it and stay
  connected. These two facts are the same fact seen from opposite ends, and
  they generate the two classic algorithms. Kruskal thinks in cycles ("take
  the cheapest edge unless it closes a cycle"), Prim thinks in cuts ("keep
  taking the cheapest edge leaving the tree I've built so far").
</p>
<p class="sub">
  On uniqueness: if all edge weights are <em>distinct</em>, the MST is unique
  — the exchange argument above becomes a strict inequality and no swap can
  tie. With ties, several different MSTs can exist, but every one of them has
  the same total weight. That's the honest answer to "is the MST unique?" in
  an interview: the tree may not be, the cost always is.
</p>

<div class="warn">
  <span class="ttl">⚠ An MST is not a shortest-paths tree</span>
  This is the mix-up interviewers actively probe for. Dijkstra from a source s
  builds a tree where the root-to-v path is the cheapest s→v path. An MST
  minimises the <em>sum of all its edges</em> and has no source at all. In the
  diagram above, the MST path from A to C is A→B→C = 6, and that happens to be
  optimal — but change B–C to weight 12 and C–E to 7 and the MST still routes
  A to C the long way while the direct-ish route through E is cheaper. If the
  problem says "shortest path from X," it is not an MST problem.
</div>

<h3>Kruskal's algorithm: sort every edge, take it if it doesn't close a cycle</h3>
<p>
  Kruskal is the cycle property applied greedily. Sort all E edges by weight,
  walk them cheapest first, and accept an edge only when its two endpoints are
  currently in <em>different</em> components. "Different components?" is exactly
  the question the union-find structure from the previous chapter answers in
  near-constant time — here is a compact version with path halving and union by
  rank so this file stands alone.
</p>
<pre><code>class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; <span class="c">// path halving — flatten as we climb</span>
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false; <span class="c">// already connected — this edge would close a cycle</span>
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    return true;
  }
}</code></pre>
<pre><code><span class="c">// edges: [u, v, weight][] with 0-indexed vertices — O(E log E) time, O(V) extra space</span>
function kruskalMST(n, edges) {
  edges.sort((a, b) => a[2] - b[2]); <span class="c">// the sort IS the algorithm's cost</span>

  const dsu = new DSU(n);
  const tree = [];
  let total = 0;

  for (const [u, v, w] of edges) {
    if (dsu.union(u, v)) { <span class="c">// union returns false when u and v already share a root</span>
      tree.push([u, v, w]);
      total += w;
      if (tree.length === n - 1) break; <span class="c">// n-1 edges = spanning, stop early</span>
    }
  }

  <span class="c">// fewer than n-1 accepted edges means the graph was disconnected</span>
  return tree.length === n - 1 ? { total, tree } : null;
}</code></pre>
<p class="sub">
  Complexity is O(E log E) dominated entirely by the sort — the union-find work
  is O(E · α(V)), and the inverse Ackermann function α is below 5 for any input
  that fits in memory, so treat it as constant when you say the number out loud.
  Space is O(V) for the DSU (the edge list is given, not built). Since E ≤ V²,
  log E ≤ 2 log V, so you'll also see this written O(E log V) — same thing.
</p>

<h3>Watching Kruskal build the tree, edge by edge</h3>
<p>Running it on the graph above, with edges sorted 1, 2, 3, 4, 5, 6, 7:</p>
<table>
  <tr><th>edge</th><th>w</th><th>find(u) === find(v)?</th><th>action</th><th>components after</th><th>total</th></tr>
  <tr><td>A–B</td><td>1</td><td>no</td><td><b>take</b></td><td>{AB} {C} {D} {E}</td><td>1</td></tr>
  <tr><td>B–D</td><td>2</td><td>no</td><td><b>take</b></td><td>{ABD} {C} {E}</td><td>3</td></tr>
  <tr><td>B–E</td><td>3</td><td>no</td><td><b>take</b></td><td>{ABDE} {C}</td><td>6</td></tr>
  <tr><td>A–D</td><td>4</td><td><b>yes</b></td><td>skip — cycle</td><td>{ABDE} {C}</td><td>6</td></tr>
  <tr><td>B–C</td><td>5</td><td>no</td><td><b>take</b></td><td>{ABCDE}</td><td><b>11</b></td></tr>
  <tr><td>C–E</td><td>6</td><td colspan="4">never examined — 4 = n−1 edges already accepted, loop breaks</td></tr>
</table>

<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Four small panels showing the Kruskal forest after each accepted edge, growing from five isolated vertices to one spanning tree">
    <g class="rough">
      <path class="lng" d="M35,75 L85,75" />
      <path class="lng" d="M190,75 L240,75" />
      <path class="lng" d="M190,75 L140,125" />
      <path class="lng" d="M345,75 L395,75" />
      <path class="lng" d="M345,75 L295,125" />
      <path class="lng" d="M395,75 L395,125" />
      <path class="lng" d="M500,75 L550,75" />
      <path class="lng" d="M500,75 L450,125" />
      <path class="lng" d="M550,75 L550,125" />
      <path class="lng" d="M550,75 L600,75" />
    </g>
    <g class="rough">
      <circle class="box" cx="35" cy="75" r="13" /><circle class="box" cx="85" cy="75" r="13" /><circle class="box" cx="135" cy="75" r="13" />
      <circle class="box" cx="35" cy="125" r="13" /><circle class="box" cx="85" cy="125" r="13" />
      <circle class="box" cx="190" cy="75" r="13" /><circle class="box" cx="240" cy="75" r="13" /><circle class="box" cx="290" cy="75" r="13" />
      <circle class="box" cx="190" cy="125" r="13" /><circle class="box" cx="240" cy="125" r="13" />
      <circle class="box" cx="345" cy="75" r="13" /><circle class="box" cx="395" cy="75" r="13" /><circle class="box" cx="445" cy="75" r="13" />
      <circle class="box" cx="345" cy="125" r="13" /><circle class="box" cx="395" cy="125" r="13" />
      <circle class="box" cx="500" cy="75" r="13" /><circle class="box" cx="550" cy="75" r="13" /><circle class="box" cx="600" cy="75" r="13" />
      <circle class="box" cx="500" cy="125" r="13" /><circle class="box" cx="550" cy="125" r="13" />
    </g>
    <text class="lbl" x="20" y="24" style="font-size:15px">Kruskal on the graph above — only the accepted edges are drawn</text>
    <text class="sm" x="85" y="47" text-anchor="middle">1. take A–B (1)</text>
    <text class="sm" x="240" y="47" text-anchor="middle">2. take B–D (2)</text>
    <text class="sm" x="395" y="47" text-anchor="middle">3. take B–E (3)</text>
    <text class="sm gr" x="550" y="47" text-anchor="middle">4. take B–C (5)</text>
    <text class="sm" x="85" y="165" text-anchor="middle">4 components</text>
    <text class="sm" x="240" y="165" text-anchor="middle">3 components</text>
    <text class="sm" x="395" y="165" text-anchor="middle">2 components</text>
    <text class="sm gr" x="550" y="165" text-anchor="middle">1 — spanning</text>
    <text class="sm rd" x="20" y="190">A–D (4) is skipped between panels 3 and 4: both ends were already connected</text>
  </svg>
  <figcaption>The component count drops by exactly one per accepted edge — that is why the loop can stop the instant it hits n−1.</figcaption>
</figure>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll sort the edges by weight
  and sweep cheapest-first, using union-find to reject any edge whose
  endpoints are already connected — that's Kruskal. The cut property
  guarantees the greedy choice is never wrong, and the cost is O(E log E)
  dominated by the sort, since each union-find operation is effectively
  constant time."
</div>

<h3>Prim's algorithm: grow one tree outward with a heap</h3>
<p>
  Prim keeps a single growing tree instead of a forest. At each step the cut is
  "vertices in the tree" versus "vertices outside," and the cut property says
  to take the cheapest edge crossing it. A min-heap keyed by edge weight
  produces that edge in O(log E). Here is a compact binary heap of
  <code>[weight, from, to]</code> triples so the code below runs as written.
</p>
<pre><code>class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let s = i;
        if (l < a.length && a[l][0] < a[s][0]) s = l;
        if (r < a.length && a[r][0] < a[s][0]) s = r;
        if (s === i) break;
        [a[s], a[i]] = [a[i], a[s]];
        i = s;
      }
    }
    return top;
  }
}</code></pre>
<pre><code><span class="c">// adj[u] = [[v, weight], ...] — O(E log V) time, O(E) space for the heap</span>
function primMST(n, adj) {
  const inTree = new Array(n).fill(false);
  const heap = new MinHeap();
  const tree = [];
  let total = 0;

  inTree[0] = true; <span class="c">// seed with any vertex — MST is the same regardless of start</span>
  for (const [v, w] of adj[0]) heap.push([w, 0, v]);

  while (heap.size > 0 && tree.length < n - 1) {
    const [w, u, v] = heap.pop();
    if (inTree[v]) continue; <span class="c">// STALE entry — v got absorbed by a cheaper edge already</span>

    inTree[v] = true;
    tree.push([u, v, w]);
    total += w;

    for (const [next, nw] of adj[v]) {
      if (!inTree[next]) heap.push([nw, v, next]); <span class="c">// only frontier edges matter</span>
    }
  }

  return tree.length === n - 1 ? { total, tree } : null;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The stale-entry check is not optional</span>
  This is the "lazy" heap variant: instead of decreasing a key in place (which
  a plain binary heap can't do), you push a new entry and let obsolete ones
  rot in the heap. Delete <code>if (inTree[v]) continue;</code> and you will
  happily add a second edge into a vertex that is already in the tree — the
  result has n−1 edges, a cycle, and a wrong total. The heap can hold up to E
  entries because of this, which is why the space is O(E) and not O(V).
</div>
<p class="sub">
  Prim also gives the wrong answer silently on a <em>disconnected</em> graph:
  it fills one component and stops. Kruskal, by contrast, naturally produces a
  minimum spanning <em>forest</em> — one tree per component. If the input might
  be disconnected and you're using Prim, you must loop over unvisited seeds
  yourself, or check <code>tree.length === n - 1</code> as above.
</p>

<h3>Kruskal vs Prim: which one in the interview</h3>
<table>
  <tr><th></th><th>Kruskal</th><th>Prim (binary heap)</th><th>Prim (no heap, O(V²))</th></tr>
  <tr><td>Time</td><td>O(E log E)</td><td>O(E log V)</td><td>O(V²)</td></tr>
  <tr><td>Space</td><td>O(V) DSU</td><td>O(E) lazy heap</td><td>O(V)</td></tr>
  <tr><td>Input wanted</td><td>edge list</td><td>adjacency list</td><td>adjacency matrix / on-the-fly weights</td></tr>
  <tr><td>Sparse (E ≈ V)</td><td><b>great</b></td><td>great</td><td>wasteful</td></tr>
  <tr><td>Dense (E ≈ V²)</td><td>O(V² log V) — the sort hurts</td><td>O(V² log V)</td><td><b>best</b> — beats both</td></tr>
  <tr><td>Disconnected input</td><td>gives a spanning forest for free</td><td>needs an outer restart loop</td><td>needs an outer restart loop</td></tr>
  <tr><td>Depends on</td><td>union-find</td><td>a priority queue</td><td>nothing</td></tr>
</table>
<p class="sub">
  The one that actually decides interviews is the last row of the dense column.
  When the graph is <em>implicit</em> and complete — "n points, cost between any
  two is their distance" — materialising all V²/2 edges to sort them is the
  mistake. With V = 1000 that's half a million edges to build and sort when
  O(V²) Prim never stores a single one.
</p>

<h3>Min Cost to Connect All Points — the dense case done right</h3>
<p>
  The classic version: given points on a plane, connecting two costs their
  Manhattan distance, connect them all as cheaply as possible. Every pair is
  an edge, so this is a complete graph — reach for O(V²) Prim, which keeps one
  number per vertex ("cheapest known edge from the tree to you") and rescans
  instead of heaping.
</p>
<pre><code><span class="c">// O(V²) time, O(V) space — never builds the edge list at all</span>
function minCostConnectPoints(points) {
  const n = points.length;
  const minDist = new Array(n).fill(Infinity);
  const inTree = new Array(n).fill(false);
  minDist[0] = 0; <span class="c">// start vertex costs nothing to attach</span>
  let total = 0;

  for (let step = 0; step < n; step++) {
    <span class="c">// pick the cheapest vertex still outside the tree — this is the cut property</span>
    let u = -1;
    for (let v = 0; v < n; v++) {
      if (!inTree[v] && (u === -1 || minDist[v] < minDist[u])) u = v;
    }

    inTree[u] = true;
    total += minDist[u];

    <span class="c">// relax: u joining the tree may give every outsider a cheaper attachment</span>
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue;
      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
      if (d < minDist[v]) minDist[v] = d;
    }
  }
  return total;
}</code></pre>
<p class="sub">
  The relax step is why this works without a heap: <code>minDist[v]</code> is
  always "cheapest edge from the current tree to v," so scanning it for the
  minimum <em>is</em> finding the cheapest edge across the cut. That linear scan
  costs O(V) per step for O(V) steps — the same O(V²) as building the matrix,
  so the heap buys nothing.
</p>

<h3>The virtual-node trick, and other MST disguises</h3>
<p>
  MST problems rarely announce themselves. A recurring twist: each node has a
  standalone cost as well as connection costs — "each village can dig its own
  well for cost w[i], or lay a pipe to another village for cost c." That looks
  like it isn't a spanning tree at all, until you add a <b>virtual node 0</b>
  representing "the water source" and connect it to village i with weight
  w[i]. Now "dig a well" is just another edge, and a plain MST over n+1 nodes
  is the answer.
</p>
<pre><code>function minCostToSupplyWater(n, wells, pipes) {
  <span class="c">// vertex 0 is virtual: edge 0→i with cost wells[i-1] means "dig a well at i"</span>
  const edges = pipes.slice();
  for (let i = 0; i < n; i++) edges.push([0, i + 1, wells[i]]);

  const result = kruskalMST(n + 1, edges); <span class="c">// n+1 vertices now, so n edges in the tree</span>
  return result.total;
}</code></pre>
<div class="sticky mint">
  <span class="ttl">The one-line separation</span>
  MST answers "what's the cheapest wiring for the whole town?" Dijkstra
  answers "what's my fastest commute from <em>my</em> house?" Cheapest total
  wiring will happily route your commute the long way around. Whenever a graph
  problem shows up, decide which of those two sentences it is before writing a
  line of code.
</div>
<p class="sub">
  Two more disguises worth recognising instantly. "Remove the maximum number
  of edges while keeping the graph connected" → build an MST, the answer is
  E − (V−1). "Minimise the largest edge on a path between all pairs" → the MST
  is also a <em>minimax</em> spanning tree, so the answer is the heaviest edge
  on the MST path, not a shortest-path computation.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Connecting everything at minimum
  total cost is a minimum spanning tree. The graph here is complete — every
  pair has a weight — so I'll use the O(V²) form of Prim and skip materialising
  the half-million edges Kruskal would need to sort. If the graph were sparse
  and given as an edge list, I'd sort and run Kruskal with union-find instead."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Connect all," "minimum cost to link every," "cheapest network/wiring/roads," "keep everything reachable" — total cost over the whole structure, not a route between two nodes</li>
  <li>The graph is <b>undirected</b> and weighted. MST is undefined on a directed graph — that's the arborescence / Chu-Liu-Edmonds problem, and no interviewer expects it</li>
  <li>Brute force would enumerate spanning trees — Cayley's formula says a complete graph on n vertices has n<sup>n−2</sup> of them, so exhaustive search is hopeless and greedy is the whole point</li>
  <li>Distinguish from Dijkstra: if a <em>source vertex</em> is named, or the answer is "distance from A to B," it's shortest paths, not MST</li>
  <li>Distinguish from plain union-find connectivity: if weights are ignored and the question is just "are these connected / how many components," you need the DSU but not the sort</li>
  <li>Per-node costs alongside per-edge costs → add a virtual node and turn the node cost into an edge cost</li>
  <li>Complete/implicit graph on ≥ ~1000 points → O(V²) Prim; explicit sparse edge list → Kruskal</li>
</ul>`,
};
