import type { Chapter } from "../types";

export const dsaMinimumSpanningTree: Chapter = {
  id: "dsa-minimum-spanning-tree",
  num: "A4",
  title: "Minimum Spanning Tree",
  short: "Minimum Spanning Tree",
  levels: ["advanced"],
  prerequisites: ["dsa-union-find", "dsa-heaps-priority-queues"],
  practice: [
    "ex-min-cost-connect-all-points",
    "ex-connect-cities",
    "ex-min-effort-path",
    "ex-optimize-water-distribution",
    "ex-distance-limited-paths-exist",
    "ex-critical-pseudo-critical-edges",
    "ex-second-best-mst-weight",
    "ex-minimum-bottleneck-path",
    "ex-maximum-spanning-tree-weight",
  ],
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
  optimal — but take a triangle with A–B = 4, B–C = 4 and A–C = 5. The MST keeps
  the two 4s and drops the 5, so its A→C path costs 8 while the direct
  edge costs 5. If the
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
  const sorted = [...edges].sort((a, b) => a[2] - b[2]); <span class="c">// the sort IS the algorithm's cost; the copy leaves the caller's edges in order</span>

  const dsu = new DSU(n);
  const tree = [];
  let total = 0;

  for (const [u, v, w] of sorted) {
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
<h4>Dry run: primMST(5, adj) on the same A–B–C–D–E graph, starting at A</h4>
<table>
  <tr><th>Pop</th><th>w, u, v</th><th>Stale?</th><th>Action</th><th>total</th></tr>
  <tr><td>1</td><td>1, A, B</td><td>no</td><td>accept B; push B–C(5), B–D(2), B–E(3)</td><td>1</td></tr>
  <tr><td>2</td><td>2, B, D</td><td>no</td><td>accept D; push D–E(7)</td><td>3</td></tr>
  <tr><td>3</td><td>3, B, E</td><td>no</td><td>accept E; push E–C(6)</td><td>6</td></tr>
  <tr><td>4</td><td>4, A, D</td><td><b>yes</b></td><td>skip — D already in tree</td><td>6</td></tr>
  <tr><td>5</td><td>5, B, C</td><td>no</td><td>accept C — 4 edges reached, stop</td><td>11</td></tr>
</table>
<p class="sub">
  Prim lands on the identical total (11) and even the identical edge set as
  Kruskal's table above, just discovered in a different order — Kruskal sorts
  globally first, Prim only ever looks at the cheapest edge leaving its current
  tree. The stale pop at step 4 (A–D, weight 4) is exactly why the heap can hold
  more entries than vertices: D found a cheaper route through B before its
  direct edge from A was ever popped.
</p>
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
  it fills one component and stops. Kruskal's loop, by contrast, naturally builds a
  minimum spanning <em>forest</em> — one tree per component (the version above
  returns <code>null</code> because of its final <code>n - 1</code> check;
  return <code>tree</code> without that check to get the forest). If the input might
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
  <tr><td>Disconnected input</td><td>builds a spanning forest (drop the <code>n - 1</code> check)</td><td>needs an outer restart loop</td><td>needs an outer restart loop</td></tr>
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
<h4>Dry run: minCostToSupplyWater(3, [1, 2, 2], [[1, 2, 1], [2, 3, 1]])</h4>
<p>
  Village 1 has a cheap well (1), villages 2 and 3 have dearer wells (2 each),
  and two pipes cost 1 apiece. With the virtual vertex 0 added, the edge list
  is the two pipes followed by 0–1 (1), 0–2 (2) and 0–3 (2). Sorting is stable,
  so equal weights keep their input order:
</p>
<table>
  <tr><th>edge</th><th>w</th><th>same component?</th><th>action</th><th>total</th></tr>
  <tr><td>1–2 (pipe)</td><td>1</td><td>no</td><td><b>take</b></td><td>1</td></tr>
  <tr><td>2–3 (pipe)</td><td>1</td><td>no</td><td><b>take</b></td><td>2</td></tr>
  <tr><td>0–1 (well at 1)</td><td>1</td><td>no</td><td><b>take</b> — 3 = n edges accepted, stop</td><td><b>3</b></td></tr>
  <tr><td>0–2, 0–3 (wells)</td><td>2</td><td colspan="3">never examined</td></tr>
</table>
<p class="sub">
  The plan it found: dig one well at village 1 and run pipes 1–2 and 2–3, for
  1 + 1 + 1 = 3. Digging all three wells would cost 5. In the tree every village
  has a path to vertex 0 whose last edge is a well, so each village is supplied
  by a chain of pipes from a village that has a well.
</p>
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

<h3>Maximum spanning tree: negate the weights</h3>
<p>
  Some problems want the heaviest wiring that still connects everything: the
  most reliable links, the widest pipes, the highest total capacity. Both
  properties flip cleanly. The <em>heaviest</em> edge crossing any cut belongs
  to some maximum spanning tree, and the <em>lightest</em> edge on any cycle is
  never needed. You do not need a second algorithm. Every spanning tree has
  exactly n−1 edges, so negating every weight multiplies every tree's total by
  −1 and reverses the ranking of the trees: the tree with the smallest negated
  total is the tree with the largest original total.
</p>
<pre><code>function maxSpanningTreeWeight(n, edges) {
  const flipped = edges.map(([u, v, w]) => [u, v, -w]);
  const result = kruskalMST(n, flipped); <span class="c">// the same function as above, untouched</span>
  return result === null ? null : -result.total; <span class="c">// flip the sign back</span>
}</code></pre>
<p class="sub">
  This works because Kruskal only <em>compares</em> weights; it never relied on
  them being positive, unlike Dijkstra. For the same reason you can add one
  constant to every weight, or subtract one, without changing which tree
  Kruskal picks: all spanning trees contain the same number of edges, so every
  total moves by the same amount. Sorting in descending order and keeping the
  rest of the loop is the equivalent one-line change.
</p>
<div class="warn">
  <span class="ttl">⚠ Negation is for spanning trees only</span>
  Do not carry this over to paths. Negating weights turns "shortest path" into
  "longest path", which is NP-hard on a general graph and is not what
  Dijkstra solves. The trick is safe here because a spanning tree always has
  the same number of edges, whatever you choose.
</div>

<h3>Why the MST path is also the minimax path</h3>
<p>
  The warning at the top said an MST route between two vertices need not be the
  cheapest route. It is still the best route by a different measure. Define the
  <b>bottleneck</b> of a path as its single heaviest edge. For any two vertices
  u and v, the path between them <em>inside the MST</em> has the smallest
  bottleneck of all u–v paths in the whole graph.
</p>
<p>
  Here is the proof, using nothing but the cut property. Let e = (a, b) be the
  heaviest edge on the tree path from u to v, and suppose some other path P in
  the graph had a bottleneck lighter than w(e). Delete e from the tree: the
  tree falls into two pieces, and because e was on the tree path, u is in one
  piece and v is in the other. P walks from u to v, so at least one of its
  edges f crosses between the two pieces. Then w(f) ≤ bottleneck(P) &lt; w(e),
  and swapping e for f gives a spanning tree that is strictly lighter than the
  MST. That is a contradiction, so no such P exists.
</p>
<p>
  This turns a family of problems into union-find. If you only need the
  bottleneck between two specific vertices, run Kruskal's sweep and stop the
  moment u and v land in the same component: the weight of the edge you just
  accepted is the answer. You never need the tree itself.
</p>
<table>
  <tr><th>Way to get the minimum bottleneck</th><th>Time</th><th>Notes</th></tr>
  <tr><td>Kruskal's sweep until u and v connect</td><td>O(E log E)</td><td>no priority queue, a dozen lines, answers many pairs offline</td></tr>
  <tr><td>Dijkstra with <code>max</code> instead of <code>+</code></td><td>O(E log V)</td><td>needs adjacency lists; the cost of a path is its largest edge</td></tr>
  <tr><td>Binary search on the limit, then BFS</td><td>O(E log W)</td><td>W is the number of distinct weights; works when E is huge and weights are small integers</td></tr>
</table>

<h3>Path with minimum effort: Kruskal over the grid edges</h3>
<p>
  Given a grid of heights, the effort of a route is the largest absolute height
  difference between consecutive cells, and you want the route from the top-left
  to the bottom-right with the least effort. The graph is the grid itself: each
  cell is a vertex, each pair of neighbours is an edge, and the weight is the
  height difference. "Smallest possible largest edge on a path" is exactly the
  bottleneck from the last section, so the answer is the weight of the edge that
  first connects the two corners in a Kruskal sweep. (The shortest-path version
  of this problem is the Dijkstra exercise in the graph chapter; the two
  solutions are worth writing side by side.)
</p>
<pre><code><span class="c">// O(RC log RC) time for R rows and C columns, O(RC) space</span>
function minimumEffortPath(heights) {
  const rows = heights.length, cols = heights[0].length;
  if (rows * cols === 1) return 0; <span class="c">// start is already the finish</span>

  const edges = [];
  for (let r = 0; r &lt; rows; r++) {
    for (let c = 0; c &lt; cols; c++) {
      const id = r * cols + c; <span class="c">// flatten (r, c) into one vertex number</span>
      if (c + 1 &lt; cols) edges.push([id, id + 1, Math.abs(heights[r][c] - heights[r][c + 1])]);
      if (r + 1 &lt; rows) edges.push([id, id + cols, Math.abs(heights[r][c] - heights[r + 1][c])]);
    }
  }
  edges.sort((a, b) => a[2] - b[2]);

  const dsu = new DSU(rows * cols);
  for (const [u, v, w] of edges) {
    dsu.union(u, v);
    if (dsu.find(0) === dsu.find(rows * cols - 1)) return w; <span class="c">// the corners just connected: w is the bottleneck</span>
  }
  return 0; <span class="c">// unreachable: a grid is connected</span>
}</code></pre>
<p>
  Each cell contributes at most two edges (right and down), which covers every
  neighbouring pair once, so there are fewer than 2RC edges and the sort
  dominates. Running it on <code>[[1,2,2],[3,8,2],[5,3,5]]</code>, with cells
  numbered 0 to 8 row by row:
</p>
<table>
  <tr><th>edge</th><th>w</th><th>action</th><th>corners 0 and 8 connected?</th></tr>
  <tr><td>1–2</td><td>0</td><td>union</td><td>no</td></tr>
  <tr><td>2–5</td><td>0</td><td>union</td><td>no</td></tr>
  <tr><td>0–1</td><td>1</td><td>union</td><td>no</td></tr>
  <tr><td>0–3</td><td>2</td><td>union</td><td>no</td></tr>
  <tr><td>3–6</td><td>2</td><td>union</td><td>no</td></tr>
  <tr><td>6–7</td><td>2</td><td>union</td><td>no</td></tr>
  <tr><td>7–8</td><td>2</td><td>union</td><td><b>yes — answer 2</b></td></tr>
</table>
<p class="sub">
  The route it found is 0 → 3 → 6 → 7 → 8, down the left side and across the
  bottom, with every step costing 2. The heavier edges (3, 5, 6) are never
  looked at: the sweep stops as soon as the answer is known.
</p>
<div class="warn">
  <span class="ttl">⚠ Three small traps in the grid version</span>
  <b>One cell.</b> With a single cell the first and last vertex are the same
  and there are no edges, so the loop never runs; the early return handles it.
  <b>The id formula.</b> <code>r * cols + c</code> uses the column count, not the
  row count; swapping them makes two different cells share an id on a
  non-square grid. <b>Check after every edge.</b> The answer is the weight of
  the edge that completes the connection, so testing the corners only at the
  end would return the weight of the last edge in the sweep, which can be much
  heavier.
</div>

<h3>Edge-length limited paths: sort the queries too</h3>
<p>
  Here is a more general shape. You have one fixed graph and many queries
  <code>[p, q, limit]</code>, each asking "is there a path from p to q whose
  every edge is strictly shorter than limit?" Answering each query with its own
  search is O(Q · (V + E)). The bottleneck fact above says a query is yes
  exactly when p and q are connected using only edges lighter than the limit,
  and a union-find can maintain exactly that, provided edges are only ever
  <em>added</em>.
</p>
<p>
  Union-find cannot delete, so you cannot sweep the limit downward. Sweep it
  upward instead. Sort the edges once by weight, sort the <em>queries</em> by
  limit, and walk the queries from smallest limit to largest: before answering
  a query, union every edge whose weight is below its limit. The set of
  unioned edges only grows, which is what the structure supports. Because you
  reordered the queries, record each one's original index and write its answer
  there.
</p>
<pre><code><span class="c">// O(E log E + Q log Q) time, O((E + Q) α(V)) for the unions and finds</span>
function distanceLimitedPathsExist(n, edgeList, queries) {
  const edges = [...edgeList].sort((a, b) => a[2] - b[2]);
  const order = queries.map((_, i) => i).sort((a, b) => queries[a][2] - queries[b][2]);

  const dsu = new DSU(n);
  const answer = new Array(queries.length).fill(false);
  let next = 0; <span class="c">// edges[0..next-1] are already unioned</span>

  for (const qi of order) {
    const [p, q, limit] = queries[qi];
    while (next &lt; edges.length &amp;&amp; edges[next][2] &lt; limit) { <span class="c">// strictly shorter than the limit</span>
      dsu.union(edges[next][0], edges[next][1]);
      next++;
    }
    answer[qi] = dsu.find(p) === dsu.find(q); <span class="c">// answer goes back to the ORIGINAL position</span>
  }
  return answer;
}</code></pre>
<h4>Dry run: n = 3, edges [[0,1,2],[1,2,4],[2,0,8],[1,0,16]], queries [[0,1,2],[0,2,5]]</h4>
<table>
  <tr><th>query (original index)</th><th>limit</th><th>edges unioned before answering</th><th>find(p) = find(q)?</th><th>answer</th></tr>
  <tr><td>[0, 1, 2] (0)</td><td>2</td><td>none: no edge is lighter than 2</td><td>no</td><td>false</td></tr>
  <tr><td>[0, 2, 5] (1)</td><td>5</td><td>0–1 (2) and 1–2 (4)</td><td>yes</td><td>true</td></tr>
</table>
<p class="sub">
  The result is <code>[false, true]</code>. Note the first query's edge 0–1 has
  weight exactly 2 and the limit is exactly 2: the comparison must be
  <code>&lt;</code> to match "strictly shorter". If the statement says "at most",
  change it to <code>&lt;=</code>; this is the one place the problem text decides
  the code.
</p>
<div class="warn">
  <span class="ttl">⚠ Sorting the queries in place loses their order</span>
  <code>queries.sort(...)</code> permutes the array you were given and you can no
  longer say which answer belongs to which query. Sort an array of indices
  (<code>order</code> above) and write <code>answer[qi]</code>. Also sort a
  copy of the edges, as <code>kruskalMST</code> does, so the caller's list is
  left alone.
</div>
<p class="sub">
  The skeleton is reusable: whenever every query is a threshold on the same
  graph and you can answer it by "union everything below the threshold", sort
  queries by threshold and sweep once. It shows up as offline connectivity, and
  it is the same trick as sorting events in a sweep line.
</p>

<h3>Critical and pseudo-critical edges</h3>
<p>
  Ties make the MST non-unique, so a sharper question becomes meaningful: which
  edges <em>must</em> be in every MST, and which are in <em>some</em> MST?
  Call an edge <b>critical</b> if it is in every MST, <b>pseudo-critical</b> if
  it is in some MSTs but not all, and neither if it is in none. The two tests
  fall straight out of the definitions, with a fresh Kruskal run each:
</p>
<ul>
  <li><b>Critical:</b> build the MST while <em>forbidding</em> the edge. If the total goes up (or the graph disconnects), the edge was irreplaceable.</li>
  <li><b>In some MST:</b> build the MST after <em>forcing</em> the edge in first. If the total still equals the unconstrained minimum, there is an MST that contains it.</li>
</ul>
<pre><code><span class="c">// O(E² α(V)): the sort happens once, each of the 2E runs is a linear sweep. Assumes no self-loops.</span>
function findCriticalAndPseudoCriticalEdges(n, edges) {
  const order = edges.map(([u, v, w], i) => [u, v, w, i]).sort((a, b) => a[2] - b[2]); <span class="c">// carry the original index</span>

  function weightOfTree(skip, force) {
    const dsu = new DSU(n);
    let cost = 0, used = 0;
    if (force !== -1) {
      const [u, v, w] = edges[force];
      dsu.union(u, v);
      cost += w;
      used++;
    }
    for (const [u, v, w, i] of order) {
      if (i === skip) continue;
      if (dsu.union(u, v)) { cost += w; used++; }
    }
    return used === n - 1 ? cost : Infinity; <span class="c">// disconnected without this edge</span>
  }

  const best = weightOfTree(-1, -1);
  const critical = [], pseudo = [];
  for (let i = 0; i &lt; edges.length; i++) {
    if (weightOfTree(i, -1) > best) critical.push(i);        <span class="c">// check critical FIRST</span>
    else if (weightOfTree(-1, i) === best) pseudo.push(i);   <span class="c">// in some MST but not in all</span>
  }
  return [critical, pseudo];
}</code></pre>
<h4>Dry run: n = 5, edges 0: (0,1,1), 1: (1,2,1), 2: (2,3,2), 3: (0,3,2), 4: (0,4,3), 5: (3,4,3), 6: (1,4,6)</h4>
<p>The unconstrained MST weighs 7. Running both tests on every edge:</p>
<table>
  <tr><th>edge</th><th>total without it</th><th>total with it forced</th><th>verdict</th></tr>
  <tr><td>0: (0,1,1)</td><td>8</td><td>7</td><td><b>critical</b></td></tr>
  <tr><td>1: (1,2,1)</td><td>8</td><td>7</td><td><b>critical</b></td></tr>
  <tr><td>2: (2,3,2)</td><td>7</td><td>7</td><td>pseudo-critical</td></tr>
  <tr><td>3: (0,3,2)</td><td>7</td><td>7</td><td>pseudo-critical</td></tr>
  <tr><td>4: (0,4,3)</td><td>7</td><td>7</td><td>pseudo-critical</td></tr>
  <tr><td>5: (3,4,3)</td><td>7</td><td>7</td><td>pseudo-critical</td></tr>
  <tr><td>6: (1,4,6)</td><td>7</td><td>10</td><td>neither</td></tr>
</table>
<p class="sub">
  The answer is <code>[[0, 1], [2, 3, 4, 5]]</code>. Edges 2 and 3 are
  interchangeable: they both close the cycle 0–1–2–3 and an MST needs one of
  them, so neither is critical. Edges 4 and 5 are interchangeable the same way.
  Edge 6 is the heaviest edge on a cycle, so the cycle property says it is
  never needed, and forcing it costs 3 more.
</p>
<div class="warn">
  <span class="ttl">⚠ Order of the two tests, and skipping by index</span>
  A critical edge also passes the "forced total equals the best" test, because
  it is in every MST. If you test pseudo-critical first, every critical edge is
  reported in both lists. Test critical first and use <code>else</code>.
  Separately, skip and force by the edge's <em>index</em>, never by comparing
  endpoints or weights: parallel edges and equal weights are exactly the
  situations this problem is about.
</div>
<p class="sub">
  There is a faster solution that groups equal-weight edges and looks for
  bridges inside each group, but when the edge count is a few hundred the
  2E-runs version above is the one to write: each piece is a function you
  already have, and the two definitions are the whole proof.
</p>

<h3>Second-best MST: one swap away</h3>
<p>
  The second-best spanning tree is the cheapest tree that is not the MST itself
  (it may weigh the same, if the MST was not unique). The natural worry is that
  it could differ from the MST in many edges, so finding it would mean searching
  a huge space. It never has to: <b>some second-best tree differs from the MST
  by exactly one edge.</b>
</p>
<p>
  The argument uses the exchange property of spanning trees. Let T be an MST and
  T′ a cheapest tree other than T. For any edge e that is in T′ but not in T,
  there is an edge f in T but not in T′ such that both T − f + e and T′ − e + f
  are spanning trees. Their weights add up to w(T) + w(T′), the same as the
  originals. T − f + e is a tree other than T, so w(T − f + e) ≥ w(T′). That
  forces w(T′ − e + f) ≤ w(T), and since T is minimum it equals w(T). So
  w(T − f + e) = w(T′): the one-swap tree is just as cheap as T′. Therefore it is
  enough to try every single swap.
</p>
<p>
  Which swaps are legal? Add a non-tree edge e = (u, v) to T and you create one
  cycle, the tree path from u to v plus e. You must delete an edge on that cycle
  to get a tree again, and the best choice is the <em>heaviest tree edge on the
  path</em>. So:
</p>
<p class="sub">
  second best = w(T) + min over non-tree edges e of ( w(e) − heaviest edge on the tree path between e's endpoints )
</p>
<pre><code><span class="c">// O(E log E + E·V): one DFS per non-tree edge. Returns null if the graph is disconnected,</span>
<span class="c">// Infinity if the graph is already a tree (no swap exists).</span>
function secondBestMSTWeight(n, edges) {
  const order = edges.map(([u, v, w], i) => [u, v, w, i]).sort((a, b) => a[2] - b[2]);
  const dsu = new DSU(n);
  const adj = Array.from({ length: n }, () => []);
  const inTree = new Array(edges.length).fill(false);
  let total = 0, used = 0;

  for (const [u, v, w, i] of order) {
    if (dsu.union(u, v)) {
      inTree[i] = true;
      adj[u].push([v, w]); <span class="c">// keep the tree itself, to walk paths on it</span>
      adj[v].push([u, w]);
      total += w;
      used++;
    }
  }
  if (used !== n - 1) return null;

  function heaviestOnPath(from, to) {
    const stack = [[from, -1, 0]]; <span class="c">// [node, parent, heaviest edge so far]; iterative, so a path graph cannot overflow the call stack</span>
    while (stack.length > 0) {
      const [node, parent, heaviest] = stack.pop();
      if (node === to) return heaviest;
      for (const [next, w] of adj[node]) {
        if (next !== parent) stack.push([next, node, Math.max(heaviest, w)]);
      }
    }
    return -Infinity;
  }

  let best = Infinity;
  for (let i = 0; i &lt; edges.length; i++) {
    if (inTree[i]) continue;
    const [u, v, w] = edges[i];
    best = Math.min(best, total + w - heaviestOnPath(u, v)); <span class="c">// swap e in, the path's heaviest edge out</span>
  }
  return best;
}</code></pre>
<h4>Dry run: n = 4, edges (0,1,1), (1,2,2), (0,2,3), (2,3,4), (1,3,6)</h4>
<table>
  <tr><th>step</th><th>result</th></tr>
  <tr><td>Kruskal takes</td><td>(0,1,1), (1,2,2), (2,3,4); the others close cycles. total = 7</td></tr>
  <tr><td>non-tree (0,2,3)</td><td>tree path 0–1–2 has heaviest edge 2, swap cost 7 + 3 − 2 = <b>8</b></td></tr>
  <tr><td>non-tree (1,3,6)</td><td>tree path 1–2–3 has heaviest edge 4, swap cost 7 + 6 − 4 = 9</td></tr>
  <tr><td>answer</td><td>min(8, 9) = <b>8</b></td></tr>
</table>
<p class="sub">
  A swap candidate can tie with the MST: if w(e) equals the heaviest edge on its
  path, the swap costs exactly w(T) and you have found a second MST. That is
  correct for "cheapest tree other than this one". Some problems ask for the
  cheapest tree <em>strictly heavier</em> than the MST; then you need the
  heaviest path edge that is strictly lighter than w(e), so each path query has
  to track the two largest distinct weights, not one. Read which version is
  asked before writing the code. For large V, replace the DFS with binary
  lifting over the tree (store, for each vertex and each power of two, the
  ancestor and the heaviest edge on the way up) and each query drops to O(log V).
</p>

<h3>Boruvka's algorithm: every component grabs its cheapest edge</h3>
<p>
  There is a third classic MST algorithm, and it is the one that parallelises.
  Kruskal needs one global sorted order, and Prim grows one tree at a time.
  Boruvka works in <b>rounds</b>. At the start of a round, every current
  component looks at all edges leaving it and picks the cheapest one. By the cut
  property each of those picks belongs to some MST, so all of them can be
  accepted at once, merging components. Repeat until one component is left.
</p>
<p>
  Each component merges with at least one other, so the component count at least
  halves each round and there are at most log₂ V rounds. A round scans the whole
  edge list once, so the total is O(E log V), the same as Prim with a binary
  heap, with no heap and no sort.
</p>
<pre><code><span class="c">// O(E log V) time, O(V) extra space. Returns the MST weight, or null if the graph is disconnected.</span>
function boruvkaMST(n, edges) {
  const dsu = new DSU(n);
  const lighter = (a, b) => edges[a][2] &lt; edges[b][2] || (edges[a][2] === edges[b][2] &amp;&amp; a &lt; b); <span class="c">// ties broken by edge index</span>
  let components = n, total = 0;

  while (components > 1) {
    const cheapest = new Array(n).fill(-1); <span class="c">// cheapest[root] = index of that component's best outgoing edge</span>
    for (let i = 0; i &lt; edges.length; i++) {
      const ru = dsu.find(edges[i][0]), rv = dsu.find(edges[i][1]);
      if (ru === rv) continue; <span class="c">// inside one component, not outgoing</span>
      if (cheapest[ru] === -1 || lighter(i, cheapest[ru])) cheapest[ru] = i;
      if (cheapest[rv] === -1 || lighter(i, cheapest[rv])) cheapest[rv] = i;
    }

    let merged = false;
    for (let r = 0; r &lt; n; r++) {
      if (cheapest[r] === -1) continue;
      const [u, v, w] = edges[cheapest[r]];
      if (dsu.union(u, v)) { total += w; components--; merged = true; } <span class="c">// two components may have picked the same edge</span>
    }
    if (!merged) return null; <span class="c">// no component had an outgoing edge: disconnected</span>
  }
  return total;
}</code></pre>
<h4>Dry run: 6 vertices, edges 0–1 (1), 2–3 (1), 4–5 (1), 1–2 (5), 3–4 (6), 0–5 (9)</h4>
<table>
  <tr><th>round</th><th>components at the start</th><th>each component's cheapest edge</th><th>accepted</th><th>total</th></tr>
  <tr><td>1</td><td>{0} {1} {2} {3} {4} {5}</td><td>0 and 1 pick 0–1; 2 and 3 pick 2–3; 4 and 5 pick 4–5</td><td>0–1, 2–3, 4–5 (each picked twice, accepted once)</td><td>3</td></tr>
  <tr><td>2</td><td>{0,1} {2,3} {4,5}</td><td>{0,1}: 1–2 (5); {2,3}: 1–2 (5); {4,5}: 3–4 (6)</td><td>1–2, 3–4</td><td><b>14</b></td></tr>
</table>
<p class="sub">
  Six components became three and then one, and the total 1 + 1 + 1 + 5 + 6 = 14
  matches Kruskal. The line that checks <code>dsu.union</code> before counting is
  not optional: two components often pick the same edge, as above, and it must
  be added once.
</p>
<div class="warn">
  <span class="ttl">⚠ Ties need a rule</span>
  The textbook argument assumes all weights are different. With equal weights,
  components can pick different edges that together form a cycle, and the cut
  property no longer tells you the whole batch is safe. Breaking ties by edge
  index makes every comparison strict, so the weights behave as if they were
  distinct. The union check in the merge loop also rejects any edge that would
  close a cycle, but do not lean on that alone.
</div>
<p class="sub">
  You will rarely be asked to write Boruvka in an interview. It is worth one
  sentence as an answer to "is there another way?": each round every component
  picks its cheapest outgoing edge independently, so rounds map well onto
  parallel or distributed systems, and the idea of "cheapest outgoing edge per component" is a building
  block in faster MST algorithms.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Connect all," "minimum cost to link every," "cheapest network/wiring/roads," "keep everything reachable" — total cost over the whole structure, not a route between two nodes</li>
  <li>The graph is <b>undirected</b> and weighted. MST is undefined on a directed graph — that's the arborescence / Chu-Liu-Edmonds problem, and no interviewer expects it</li>
  <li>Brute force would enumerate spanning trees — Cayley's formula says a complete graph on n vertices has n<sup>n−2</sup> of them, so exhaustive search is hopeless and greedy is the whole point</li>
  <li>Distinguish from Dijkstra: if a <em>source vertex</em> is named, or the answer is "distance from A to B," it's shortest paths, not MST</li>
  <li>Distinguish from plain union-find connectivity: if weights are ignored and the question is just "are these connected / how many components," you need the DSU but not the sort</li>
  <li>Per-node costs alongside per-edge costs → add a virtual node and turn the node cost into an edge cost</li>
  <li>Complete/implicit graph on ≥ ~1000 points → O(V²) Prim; explicit sparse edge list → Kruskal</li>
  <li>"Minimise the largest edge on a path," "minimum effort," "smallest limit so that A and B connect" → minimax path: the MST path is optimal, so sweep Kruskal until the endpoints join</li>
  <li>Many queries of the form "connected using only edges below this limit?" → sort the queries by limit as well and answer them in one sweep of union-find</li>
  <li>"Which edges are in every / in some / in no minimum spanning tree" → rerun Kruskal once per edge, skipping it and forcing it</li>
  <li>"Second-cheapest spanning tree," "cost of the best tree that differs from the MST" → one edge swap: add a non-tree edge, remove the heaviest edge on the cycle it closes</li>
  <li>"Maximise the total" or "widest path" on a connectivity problem → negate the weights, or sort descending</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State the cut property from memory and use it to explain why both Kruskal and Prim are provably optimal, not just heuristically reasonable.</li>
    <li>Write Kruskal with union-find, and explain why the sort — not the union-find work — dominates its O(E log E) cost.</li>
    <li>Write Prim with a lazy min-heap, and explain what the stale-entry check (<code>inTree[v]</code>) prevents.</li>
    <li>Explain why an MST is not a shortest-path tree, with a concrete case where the MST route between two nodes isn't the cheapest path between them.</li>
    <li>Given a new problem, decide whether it's MST (minimize total wiring cost) or Dijkstra (minimize one source's route) — and separately, whether the graph is sparse (Kruskal) or dense/implicit (O(V²) Prim).</li>
    <li>Prove from the cut property that the path between two vertices inside an MST has the smallest possible heaviest edge, and use it to solve minimum-effort grid paths with a Kruskal sweep that stops when the corners connect.</li>
    <li>Answer many "is there a path using only edges below L" queries offline by sorting both edges and queries, and say why the queries must keep their original index.</li>
    <li>Classify an edge as critical, pseudo-critical or neither with two Kruskal runs, and say why the critical test comes first.</li>
    <li>Compute the second-best MST by one swap, and say what changes if the problem wants a tree strictly heavier than the MST.</li>
    <li>Describe Boruvka's rounds in two sentences and say why there are at most log V of them.</li>
  </ul>
</div>`,
};
