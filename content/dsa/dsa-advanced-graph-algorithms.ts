import type { Chapter } from "../types";

export const dsaAdvancedGraphAlgorithms: Chapter = {
  id: "dsa-advanced-graph-algorithms",
  num: "A3",
  title: "Advanced graph algorithms",
  short: "Advanced graph algorithms",
  levels: ["advanced"],
  practice: ["ex-network-delay-time", "ex-cheapest-flights-within-k-stops"],
  ready: true,
  subtitle: "BFS is shortest path when every edge costs 1 — here is what to do when they don't.",
  body: `<h3>Weights break BFS, and knowing why tells you which algorithm to reach for</h3>
<p>
  BFS finds shortest paths because it expands nodes in order of distance —
  with unit edges, "fewest edges" and "cheapest" are the same thing. Add
  weights and that guarantee dies: the node one hop away down a cost-100 edge
  is <em>not</em> closer than a node three hops away down cost-1 edges. Every
  algorithm in this chapter is a different answer to "how do I restore the
  expand-in-distance-order property?"
</p>

<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="A four node graph where the direct edge from S to T costs one hundred but the path through A and B costs three, showing that breadth first search would wrongly finalize T after one hop">
    <g class="rough">
      <path class="lnr" d="M80,60 L520,60" />
      <path class="lng" d="M80,80 L230,150" />
      <path class="lng" d="M270,150 L390,150" />
      <path class="lng" d="M430,150 L520,80" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="60" cy="70" r="22" />
      <circle class="box" cx="250" cy="150" r="20" />
      <circle class="box" cx="410" cy="150" r="20" />
      <circle class="boxg" cx="540" cy="70" r="22" />
    </g>
    <text class="sm" x="60" y="75" text-anchor="middle">S</text>
    <text class="sm" x="250" y="155" text-anchor="middle">A</text>
    <text class="sm" x="410" y="155" text-anchor="middle">B</text>
    <text class="sm" x="540" y="75" text-anchor="middle">T</text>
    <text class="sm rd" x="300" y="48" text-anchor="middle">weight 100 — one hop</text>
    <text class="sm gr" x="140" y="130">1</text>
    <text class="sm gr" x="330" y="142" text-anchor="middle">1</text>
    <text class="sm gr" x="490" y="130">1</text>
    <text class="lbl rd" x="20" y="185" style="font-size:15px">BFS finalizes T at distance 1 hop = wrong;</text>
    <text class="lbl gr" x="380" y="185" style="font-size:15px">Dijkstra finalizes T at cost 3</text>
  </svg>
  <figcaption>BFS orders by hop count; Dijkstra orders by accumulated cost. Same traversal skeleton, different queue discipline — that is the entire upgrade.</figcaption>
</figure>

<h3>A binary heap you can actually write under pressure</h3>
<p>
  JavaScript has no built-in priority queue, so an interviewer expects you to
  either write one or state clearly that you would use one. Fifteen lines,
  array-backed, items are <code>[priority, value]</code> pairs. (This is the
  same heap from the heaps chapter — reproduced here because Dijkstra is
  unwritable without it.)
</p>
<pre><code>class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }

  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;             <span class="c">// parent index</span>
      if (a[p][0] &lt;= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }

  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l &lt; a.length && a[l][0] &lt; a[m][0]) m = l;
        if (r &lt; a.length && a[r][0] &lt; a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Do not fake a priority queue with a sorted array</span>
  <code>queue.push(x); queue.sort((p, q) => p[0] - q[0]);</code> inside the
  main loop is O(E log E) <em>per edge</em> — it turns an O(E log V) algorithm
  into something quadratic and it is the most common reason a correct Dijkstra
  times out. If you're truly out of time, say "assume a standard binary heap
  with O(log n) push/pop" and move on; interviewers accept that far more often
  than candidates expect.
</div>

<h3>Dijkstra — the full working version</h3>
<p>
  The invariant: when a node is popped from the heap with the smallest
  tentative distance, that distance is <em>final</em>. Nothing still in the
  heap can improve it, because every remaining path leaves through a node
  that already costs at least as much and all edge weights are
  non-negative — that last clause is exactly why Dijkstra breaks on negative
  edges.
</p>
<pre><code><span class="c">// adj[u] = array of [v, weight]. Non-negative weights only. O((V + E) log V).</span>
function dijkstra(n, adj, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  const pq = new MinHeap();
  pq.push([0, src]);

  while (pq.size > 0) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue; <span class="c">// STALE entry: we already found a better route to u — skip it</span>

    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd &lt; dist[v]) {      <span class="c">// relaxation: this route to v beats anything known</span>
        dist[v] = nd;
        pq.push([nd, v]);      <span class="c">// push a NEW entry rather than decrease-key</span>
      }
    }
  }
  return dist;
}</code></pre>
<p class="sub">
  A textbook Dijkstra uses <em>decrease-key</em> to update a node's priority in
  place. A binary heap can't do that in O(log n) without an index map, so the
  standard trick is <b>lazy deletion</b>: push a duplicate entry and discard
  outdated ones on pop via the <code>d > dist[u]</code> guard. The heap holds
  up to E entries instead of V, which is why the complexity is usually written
  O(E log V) — same thing, since log E ≤ 2 log V.
</p>
<div class="warn">
  <span class="ttl">⚠ Dropping the stale-entry check is a correctness-adjacent disaster</span>
  Without <code>if (d > dist[u]) continue;</code> the algorithm still returns
  correct distances (relaxation is idempotent) but re-expands every outdated
  entry, degrading toward O(V·E) on dense graphs. A <code>visited</code> Set
  works equally well; what does <em>not</em> work is marking a node visited
  when you <em>push</em> it — that finalizes a distance before it's proven
  minimal and gives genuinely wrong answers.
</div>
<p>
  Recovering the actual path costs one extra array:
</p>
<pre><code>const parent = new Array(n).fill(-1);
<span class="c">// inside the relaxation, alongside dist[v] = nd:</span>
parent[v] = u;

function reconstruct(parent, target) {
  const path = [];
  for (let at = target; at !== -1; at = parent[at]) path.push(at);
  return path.reverse();
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "Weights are non-negative, so I'll
  use Dijkstra with a binary heap. I'll keep a dist array, push the source at
  zero, and each time I pop the closest unfinalized node I relax its
  neighbours. I'll use lazy deletion — pushing duplicates and skipping stale
  pops — since JS heaps don't support decrease-key. That's O(E log V) time and
  O(V + E) space."
</div>

<h3>When "shortest" has a second constraint: Cheapest Flights Within K Stops</h3>
<p>
  This one is a trap for pure Dijkstra: the cheapest way to reach a node might
  use too many stops, while a pricier route is still viable. The state is
  <code>(node, stopsUsed)</code>, not <code>node</code> — and once you see that,
  the cleanest solution is a bounded Bellman-Ford: relax all edges exactly
  <code>k + 1</code> times.
</p>
<pre><code>function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  for (let round = 0; round &lt;= k; round++) {  <span class="c">// k stops = k+1 edges</span>
    const next = dist.slice();               <span class="c">// SNAPSHOT — see the warning below</span>
    for (const [u, v, price] of flights) {
      if (dist[u] === Infinity) continue;
      if (dist[u] + price &lt; next[v]) next[v] = dist[u] + price;
    }
    dist = next;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Relaxing in place would use more edges than the round allows</span>
  If you write into <code>dist</code> directly, an edge relaxed earlier in the
  same round can be chained by a later edge in that same pass — so one round
  advances two or more hops and the k-stop limit silently leaks. Copying
  <code>dist</code> at the start of each round pins "distances using at most
  <code>round</code> edges." This is the only place plain Bellman-Ford's
  in-place relaxation is <em>not</em> safe, and it is the intended difficulty
  of the problem.
</div>

<h3>Bellman-Ford — negative weights, and detecting a negative cycle</h3>
<p>
  Bellman-Ford abandons the heap entirely: it just relaxes every edge, V − 1
  times. After i rounds, every shortest path using at most i edges is correct,
  and a simple path can't use more than V − 1 edges — so V − 1 rounds finish
  the job. That reasoning is also the negative-cycle detector: if a V-th round
  still improves something, no finite shortest path exists.
</p>
<pre><code><span class="c">// edges = [[u, v, w], ...] directed. Returns dist array, or null if a negative cycle is reachable.</span>
<span class="c">// O(V · E) time, O(V) space.</span>
function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  for (let i = 0; i &lt; n - 1; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] === Infinity) continue;   <span class="c">// unreachable: Infinity + w must not propagate</span>
      if (dist[u] + w &lt; dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break;                    <span class="c">// early exit: a settled round means we're done</span>
  }

  <span class="c">// One extra round. Any further improvement means a reachable negative cycle.</span>
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w &lt; dist[v]) return null;
  }
  return dist;
}</code></pre>
<p class="sub">
  To identify <em>which</em> nodes are affected rather than just detecting the
  cycle, run a final BFS/DFS from every node that improved in the extra round
  and mark everything reachable as −∞. That's the version asked for in
  arbitrage-detection questions ("is there a sequence of currency trades that
  multiplies your money?" — take <code>-log(rate)</code> as the weight and a
  negative cycle is exactly an arbitrage).
</p>
<div class="warn">
  <span class="ttl">⚠ A negative <em>edge</em> is fine; a negative <em>cycle</em> is not</span>
  These are different failures. Dijkstra breaks on a single negative edge
  because its finalize-on-pop invariant assumes costs never decrease.
  Bellman-Ford handles negative edges happily — it breaks only on negative
  cycles, and then it reports them rather than lying. If an interviewer says
  "some edges are negative," the follow-up question to ask out loud is "can
  they form a cycle?"
</div>

<h3>Floyd-Warshall — all pairs, in three loops</h3>
<p>
  Sometimes the question isn't one source but every pair ("shortest path
  between all cities," "transitive closure," "find the city with the fewest
  reachable neighbours"). Floyd-Warshall answers it in three nested loops with
  one idea: consider intermediate nodes one at a time. After processing k, the
  table holds shortest paths that may only route through nodes 0..k.
</p>
<pre><code><span class="c">// O(V^3) time, O(V^2) space. Handles negative edges; d[i][i] &lt; 0 means a negative cycle.</span>
function floydWarshall(n, edges) {
  const d = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  for (let i = 0; i &lt; n; i++) d[i][i] = 0;
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w); <span class="c">// min guards against parallel edges</span>

  for (let k = 0; k &lt; n; k++) {              <span class="c">// k MUST be the outermost loop</span>
    for (let i = 0; i &lt; n; i++) {
      if (d[i][k] === Infinity) continue;    <span class="c">// prune a whole row — a real constant-factor win</span>
      for (let j = 0; j &lt; n; j++) {
        const viaK = d[i][k] + d[k][j];
        if (viaK &lt; d[i][j]) d[i][j] = viaK;
      }
    }
  }
  return d;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Loop order is the whole algorithm</span>
  Ordering the loops i, then j, then k compiles, runs, and returns
  wrong answers on any graph needing two intermediate nodes. The reason k must
  be outermost is that the recurrence is a DP over "which intermediates are
  allowed" — layer k reads the completed layer k−1. Order the loops i, j, k and
  you're reading a half-built layer. If you remember exactly one thing about
  Floyd-Warshall, remember <b>k first</b>.
</div>
<p class="sub">
  V³ sounds fatal but the constant factor is tiny and there's no heap — up to
  roughly V = 400-500 it beats running Dijkstra V times in practice, and it is
  vastly easier to get right. It's also the go-to for reachability: swap
  <code>min/+</code> for <code>OR/AND</code> and you have transitive closure.
</p>

<h3>0-1 BFS — when weights are only 0 and 1</h3>
<p>
  A heap is overkill when there are only two possible edge costs. Use a
  <b>deque</b>: relaxing along a 0-weight edge doesn't change the distance, so
  push that node on the <em>front</em>; a 1-weight edge pushes to the
  <em>back</em>. The deque stays sorted by distance automatically — it only
  ever holds two distinct values, d and d+1 — giving true O(V + E) with no log
  factor. This shows up in grid problems like "minimum obstacles to remove" or
  "minimum cost to make a path" (rotating grid arrows is free in the direction
  it points, costs 1 otherwise).
</p>
<pre><code><span class="c">// Two-stack deque: amortized O(1) at both ends, no O(n) Array#shift.</span>
class Deque {
  constructor() { this.front = []; this.back = []; }
  get size() { return this.front.length + this.back.length; }
  pushFront(x) { this.front.push(x); }
  pushBack(x) { this.back.push(x); }
  popFront() {
    if (this.front.length === 0) {
      while (this.back.length > 0) this.front.push(this.back.pop()); <span class="c">// reverse back onto front, amortized O(1)</span>
    }
    return this.front.pop();
  }
}

<span class="c">// adj[u] = [[v, w]] with every w either 0 or 1. O(V + E).</span>
function zeroOneBFS(n, adj, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  const dq = new Deque();
  dq.pushBack(src);

  while (dq.size > 0) {
    const u = dq.popFront();
    for (const [v, w] of adj[u]) {
      const nd = dist[u] + w;
      if (nd &lt; dist[v]) {
        dist[v] = nd;
        if (w === 0) dq.pushFront(v); <span class="c">// same distance layer — must be processed before any d+1 node</span>
        else dq.pushBack(v);          <span class="c">// next layer</span>
      }
    }
  }
  return dist;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "Every edge here costs 0 or 1, so
  I don't need a heap — a deque keeps the frontier sorted by construction.
  Zero-weight edges go to the front because they stay in the current distance
  layer; weight-one edges go to the back. That's plain O(V + E) instead of
  O(E log V)."
</div>

<h3>Multi-source BFS — seed the queue with everything at once</h3>
<p>
  "Distance from each cell to the <em>nearest</em> gate / zero / rotten
  orange" looks like V separate BFS runs. It isn't. Push every source into the
  queue at distance 0 before the loop starts and run one ordinary BFS — the
  frontiers expand together and the first time any source reaches a cell is,
  by definition, the nearest source. One pass, O(V + E), no repetition.
</p>
<pre><code><span class="c">// 01 Matrix: distance from each cell to the nearest 0. One BFS, all zeros seeded.</span>
function updateMatrix(mat) {
  const R = mat.length, C = mat[0].length;
  const dist = Array.from({ length: R }, () => new Array(C).fill(-1));
  const queue = [];

  for (let r = 0; r &lt; R; r++) {
    for (let c = 0; c &lt; C; c++) {
      if (mat[r][c] === 0) { dist[r][c] = 0; queue.push(r * C + c); } <span class="c">// ALL sources seeded before the loop</span>
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let head = 0; head &lt; queue.length; head++) { <span class="c">// index-based queue: no O(n) shift()</span>
    const cell = queue[head];
    const r = (cell / C) | 0, c = cell % C;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr >= R || nc &lt; 0 || nc >= C) continue;
      if (dist[nr][nc] !== -1) continue;           <span class="c">// already reached by a nearer (or equal) source</span>
      dist[nr][nc] = dist[r][c] + 1;
      queue.push(nr * C + nc);
    }
  }
  return dist;
}</code></pre>
<p class="sub">
  The same seeding trick makes "Rotting Oranges" a one-liner change (track the
  last distance assigned and verify no fresh orange is left as −1), and it
  generalizes: a multi-source <em>Dijkstra</em> is just pushing every source at
  its own starting cost. Any time you'd write "run X from every source, take
  the min," check whether one seeded run does it.
</p>

<h3>Picking the right one</h3>
<table>
  <tr><th>Algorithm</th><th>Use when</th><th>Time</th><th>Space</th><th>Negative weights</th></tr>
  <tr><td>BFS</td><td>all edges cost the same (usually 1)</td><td>O(V + E)</td><td>O(V)</td><td>n/a</td></tr>
  <tr><td>0-1 BFS (deque)</td><td>every weight is 0 or 1</td><td>O(V + E)</td><td>O(V)</td><td>no</td></tr>
  <tr><td>Dijkstra + binary heap</td><td>single source, non-negative weights</td><td>O(E log V)</td><td>O(V + E)</td><td>no — breaks silently</td></tr>
  <tr><td>Bellman-Ford</td><td>negative edges, or a hop/stop limit</td><td>O(V · E)</td><td>O(V)</td><td>yes, and detects negative cycles</td></tr>
  <tr><td>Floyd-Warshall</td><td>all pairs, dense, V roughly ≤ 400</td><td>O(V³)</td><td>O(V²)</td><td>yes (no negative cycles)</td></tr>
  <tr><td>Topological sort + relax</td><td>the graph is a DAG</td><td>O(V + E)</td><td>O(V)</td><td>yes — beats all of the above on DAGs</td></tr>
</table>
<p class="sub">
  That last row is the one candidates forget. On a DAG you can relax edges in
  topological order and get shortest <em>or longest</em> paths in linear time,
  negative weights included — no heap, no V·E. If the problem says "no cycles"
  or the edges encode a strict ordering (course prerequisites, build steps,
  DP-shaped grids), check for the DAG shortcut before reaching for Dijkstra.
</p>
<div class="sticky mint">
  <span class="ttl">One sentence that picks the algorithm for you</span>
  "Are the weights uniform, non-negative, or possibly negative — and do I need
  one source or all pairs?" Uniform → BFS (or 0-1 BFS for two values).
  Non-negative, one source → Dijkstra. Negative, one source → Bellman-Ford.
  All pairs, small V → Floyd-Warshall. Answer those two questions out loud
  before writing a line and you will never pick wrong.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>"Minimum cost/time/effort to get from A to B"</b> with numbers on the edges → shortest path. The words "cost," "time," "price," "signal delay," and "effort" are all weight synonyms.</li>
  <li><b>The weights are all 1, or the problem is on an unweighted grid</b> → plain BFS. Do not reach for Dijkstra; it's strictly more code for the same answer, and interviewers notice.</li>
  <li><b>Exactly two distinct weights (usually 0 and 1)</b> → 0-1 BFS with a deque. "Free in this direction, costs 1 to change" is the tell.</li>
  <li><b>Any negative number appears, or there's a cap on the number of edges used</b> → Bellman-Ford. A hop limit turns the state into (node, hops), which Bellman-Ford's round structure gives you for free.</li>
  <li><b>V is small (≤ 400) and the question asks about every pair</b>, or you need to answer many source-target queries → Floyd-Warshall, and mention the O(V³)/O(V²) trade explicitly.</li>
  <li><b>"Nearest X for every cell"</b> → multi-source BFS, seeded with all X. If you find yourself writing a loop that runs BFS once per source, stop and seed instead.</li>
  <li><b>Pitfalls:</b> Dijkstra with negative edges (wrong, and quietly so); sorting an array as a fake priority queue (TLE); Floyd-Warshall with k not outermost (wrong); adding to <code>Infinity</code> from an unreachable node (poisons the table); and using <code>Array#shift()</code> as a queue on 10<sup>5</sup> nodes (O(n²) hidden inside an O(V+E) algorithm).</li>
</ul>`,
};
