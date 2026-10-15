import type { Chapter } from "../types";

export const dsaAdvancedGraphAlgorithms: Chapter = {
  id: "dsa-advanced-graph-algorithms",
  num: "A3",
  title: "Advanced graph algorithms",
  short: "Advanced graph algorithms",
  levels: ["advanced"],
  prerequisites: ["dsa-heaps-priority-queues", "dsa-grid-bfs", "dsa-topological-patterns"],
  practice: [
    "ex-network-delay-time",
    "ex-cheapest-flights-within-k-stops",
    "ex-min-effort-path",
    "ex-find-the-city",
    "ex-bellman-ford",
    "ex-path-with-maximum-probability",
    "ex-minimum-bottleneck-path",
    "ex-number-of-ways-to-arrive",
    "ex-second-shortest-path",
    "ex-shortest-path-obstacle-elimination",
    "ex-longest-path-in-dag",
    "ex-floyd-warshall-paths",
    "ex-spfa-negative-cycle",
    "ex-word-ladder",
  ],
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
  either write one or state clearly that you would use one. Roughly thirty-five
  lines, array-backed, items are <code>[priority, value]</code> pairs. (This is the
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
<h4>Dry run: dijkstra(4, adj, 0) on the S–A–B–T graph above (S=0, A=1, B=2, T=3)</h4>
<table>
  <tr><th>Pop</th><th>d, u</th><th>Stale?</th><th>Relaxations</th><th>dist [S,A,B,T] after</th></tr>
  <tr><td>1</td><td>0, S</td><td>no</td><td>T: 0+100=100; A: 0+1=1</td><td>[0, 1, ∞, 100]</td></tr>
  <tr><td>2</td><td>1, A</td><td>no</td><td>S: 1+1=2, no improvement; B: 1+1=2</td><td>[0, 1, 2, 100]</td></tr>
  <tr><td>3</td><td>2, B</td><td>no</td><td>A: 2+1=3, no improvement; T: 2+1=3</td><td>[0, 1, 2, 3]</td></tr>
  <tr><td>4</td><td>3, T</td><td>no</td><td>S: 3+100=103, no improvement; B: 3+1=4, no improvement</td><td>[0, 1, 2, 3]</td></tr>
  <tr><td>5</td><td>100, T</td><td><b>yes</b></td><td>skipped — 100 &gt; dist[T]=3</td><td>unchanged</td></tr>
</table>
<p class="sub">
  T is pushed twice — once at cost 100 straight off S, once at cost 3 through A
  then B — and the heap pops the cheap entry first purely because it's smaller.
  The expensive entry is still sitting in the heap; the <code>d &gt; dist[u]</code>
  guard on pop 5 is what discards it instead of re-relaxing from a node whose
  distance is already final.
</p>
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

<h3>Same loop, different cost: path probability and the bottleneck</h3>
<p>
  Dijkstra works because of two properties of "cost", and neither says the cost
  has to be a sum. First, extending a path never makes it <em>better</em>:
  adding a non-negative edge can only raise the total. Second, partial paths can
  be compared, so the heap can order them. Anything that satisfies both can be
  run through the same loop. Two variants come up often enough to know by
  heart.
</p>
<p>
  <b>Maximum probability.</b> "Each undirected edge succeeds with some
  probability; find the path from start to end with the highest chance of
  every edge succeeding." Probabilities multiply along a path, and since every
  factor is at most 1, extending a path never raises its probability. That is
  the same shape as a non-negative edge weight, with <code>×</code> in place of
  <code>+</code> and "largest" in place of "smallest". The heap pops the
  smallest key, so push the <em>negated</em> probability.
</p>
<pre><code>function maxProbability(n, edges, succProb, start, end) {
  const adj = Array.from({ length: n }, () => []);
  edges.forEach(([a, b], i) => {
    adj[a].push([b, succProb[i]]);
    adj[b].push([a, succProb[i]]);
  });

  const best = new Array(n).fill(0); <span class="c">// best[v] = highest probability found so far; 0 = unreached</span>
  best[start] = 1;
  const pq = new MinHeap();
  pq.push([-1, start]); <span class="c">// the heap pops the smallest key, so store the NEGATED probability</span>

  while (pq.size > 0) {
    const [negP, u] = pq.pop();
    const p = -negP;
    if (p &lt; best[u]) continue; <span class="c">// stale: a better route to u was found after this entry was pushed</span>
    if (u === end) return p;   <span class="c">// the first pop of the target is final</span>
    for (const [v, chance] of adj[u]) {
      const np = p * chance;   <span class="c">// probabilities multiply, and a factor of at most 1 never raises it</span>
      if (np > best[v]) {
        best[v] = np;
        pq.push([-np, v]);
      }
    }
  }
  return 0;
}</code></pre>
<h4>Dry run: edges 0-1 (0.5), 1-2 (0.5), 0-2 (0.2); from 0 to 2</h4>
<table>
  <tr><th>Pop</th><th>Node, probability</th><th>Pushes</th></tr>
  <tr><td>1</td><td>0, 1.0</td><td>node 1 at 0.5, node 2 at 0.2</td></tr>
  <tr><td>2</td><td>1, 0.5</td><td>node 2 at 0.5 × 0.5 = 0.25, which beats 0.2</td></tr>
  <tr><td>3</td><td>2, 0.25</td><td>the target is popped: return 0.25 (the stale entry 0.2 is still in the heap and never read)</td></tr>
</table>
<p class="sub">
  The two-edge route wins over the direct edge even though it has more edges.
  Time is O((V + E) log V), as for ordinary Dijkstra. Taking logarithms turns
  the product into a sum of <code>-log p</code> values, which are non-negative:
  that is why this is a shortest-path problem in disguise.
</p>
<p>
  <b>Bottleneck (minimax) path.</b> "Find the path whose <em>largest edge</em>
  is as small as possible": the lowest bridge you must cross, the narrowest
  road, the hardest step of a hike. The cost of a path is the maximum along it,
  and extending a path can only keep the maximum or raise it, so the first
  property holds again. Replace <code>d + w</code> with
  <code>Math.max(d, w)</code> and everything else stays.
</p>
<pre><code>function minimaxPath(n, adj, src, dst) {
  const best = new Array(n).fill(Infinity); <span class="c">// best[v] = smallest possible "largest edge" on a path to v</span>
  best[src] = 0;
  const pq = new MinHeap();
  pq.push([0, src]);

  while (pq.size > 0) {
    const [d, u] = pq.pop();
    if (d > best[u]) continue;
    if (u === dst) return d;
    for (const [v, w] of adj[u]) {
      const nd = Math.max(d, w); <span class="c">// the only change from Dijkstra: combine with max instead of +</span>
      if (nd &lt; best[v]) {
        best[v] = nd;
        pq.push([nd, v]);
      }
    }
  }
  return Infinity;
}</code></pre>
<h4>Dry run: edges 0-3 (9), 0-1 (4), 1-2 (4), 2-3 (4); from 0 to 3</h4>
<table>
  <tr><th>Pop</th><th>Node, bottleneck</th><th>Pushes</th></tr>
  <tr><td>1</td><td>0, 0</td><td>node 3 at max(0, 9) = 9, node 1 at 4</td></tr>
  <tr><td>2</td><td>1, 4</td><td>node 2 at max(4, 4) = 4</td></tr>
  <tr><td>3</td><td>2, 4</td><td>node 3 at max(4, 4) = 4, which beats 9</td></tr>
  <tr><td>4</td><td>3, 4</td><td>the target is popped: return 4</td></tr>
</table>
<p class="sub">
  The ordinary shortest path from 0 to 3 is the direct edge of weight 9, but
  the bottleneck path takes the three edges of weight 4. This is the engine
  behind "Path With Minimum Effort" (the grid version in the exercises). Binary
  search on the answer with a connectivity check also works, and so does
  Kruskal's algorithm, because the path between two nodes inside a minimum spanning tree is a
  bottleneck-optimal path (the minimum spanning tree chapter covers why).
</p>
<div class="warn">
  <span class="ttl">⚠ What breaks these variants</span>
  Forgetting to negate the probability makes the heap hand you the <em>least</em>
  likely route first. Probabilities above 1, or a "cost" that can shrink as the
  path grows, break the finalize-on-pop argument just as negative edges do. The
  stale test reverses with the key: a max-probability entry is stale when it is
  <em>smaller</em> than <code>best[u]</code>. And floating-point products drift,
  so compare results with a tolerance rather than <code>===</code>.
</div>

<h3>Counting shortest paths, and the second shortest</h3>
<p>
  Two questions piggyback on the same distances. <b>How many</b> shortest
  paths are there? (This is "Number of Ways to Arrive at Destination", and the
  answer is requested modulo 10<sup>9</sup> + 7.) Keep a second array,
  <code>ways[v]</code>. When a strictly shorter route to <code>v</code> is
  found, every old path is now too long, so <code>ways[v] = ways[u]</code>. When
  a route <em>ties</em> the best known, every shortest path to <code>u</code>
  extends to a new shortest path to <code>v</code>, so
  <code>ways[v] += ways[u]</code>.
</p>
<p>
  Why is <code>ways[u]</code> final when u is popped? Every shortest path to u
  comes through a predecessor that is strictly closer, because edge weights are
  positive, so all of u's predecessors were popped and contributed their counts
  before u. A zero-weight edge breaks that argument, so this version needs
  positive weights.
</p>
<pre><code>function countShortestPaths(n, roads) {
  const MOD = 1_000_000_007;
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, w] of roads) {
    adj[u].push([v, w]);
    adj[v].push([u, w]);
  }

  const dist = new Array(n).fill(Infinity);
  const ways = new Array(n).fill(0); <span class="c">// ways[v] = number of shortest paths from node 0 to v</span>
  dist[0] = 0;
  ways[0] = 1;
  const pq = new MinHeap();
  pq.push([0, 0]);

  while (pq.size > 0) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue;
    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd &lt; dist[v]) {
        dist[v] = nd;
        ways[v] = ways[u];                    <span class="c">// a strictly better route: forget the old count</span>
        pq.push([nd, v]);
      } else if (nd === dist[v]) {
        ways[v] = (ways[v] + ways[u]) % MOD;  <span class="c">// a tie: every shortest path to u extends to v</span>
      }
    }
  }
  return ways[n - 1];
}</code></pre>
<h4>Dry run: the 7-node example with roads 0-6 (7), 0-1 (2), 1-2 (3), 1-3 (3), 6-3 (3), 3-5 (1), 6-5 (1), 2-5 (1), 0-4 (5), 4-6 (2)</h4>
<table>
  <tr><th>Pop (dist, node)</th><th>Effect</th><th>ways afterwards (nodes 0..6)</th></tr>
  <tr><td>0, 0</td><td>6 at 7, 1 at 2, 4 at 5, all strictly better</td><td>[1, 1, 0, 0, 1, 0, 1]</td></tr>
  <tr><td>2, 1</td><td>2 at 5, 3 at 5, both new</td><td>[1, 1, 1, 1, 1, 0, 1]</td></tr>
  <tr><td>5, 4</td><td>6 at 5 + 2 = 7 ties its current 7: add ways[4]</td><td>ways[6] = 2</td></tr>
  <tr><td>5, 3</td><td>5 at 5 + 1 = 6, new</td><td>ways[5] = 1</td></tr>
  <tr><td>5, 2</td><td>5 at 5 + 1 = 6 ties: add ways[2]</td><td>ways[5] = 2</td></tr>
  <tr><td>6, 5</td><td>6 at 6 + 1 = 7 ties: add ways[5]</td><td>ways[6] = 4</td></tr>
  <tr><td>7, 6</td><td>the target; nothing improves</td><td>answer 4</td></tr>
</table>
<p class="sub">
  The answer is 4. Note the order of the pops at distance 5: any order among equal
  distances gives the same counts, because each of those nodes has all of its
  own predecessors at strictly smaller distances.
</p>
<p>
  <b>The second shortest.</b> "Find the second shortest path length, strictly
  longer than the shortest" is Dijkstra with <em>two</em> distances per node.
  Keep <code>d1[v]</code>, the shortest, and <code>d2[v]</code>, the shortest
  value strictly larger than <code>d1[v]</code>. A new candidate
  <code>nd</code> falls in one of three cases: it beats <code>d1</code> (the old
  best is demoted to <code>d2</code>), it lies strictly between the two (it
  replaces <code>d2</code>), or it is useless. Each node may now be expanded
  twice, once per value it keeps, so the stale test compares against
  <code>d2</code>, not <code>d1</code>.
</p>
<pre><code>function secondShortest(n, adj, src, dst) {
  const d1 = new Array(n).fill(Infinity); <span class="c">// shortest distance to each node</span>
  const d2 = new Array(n).fill(Infinity); <span class="c">// shortest distance that is strictly longer than d1</span>
  d1[src] = 0;
  const pq = new MinHeap();
  pq.push([0, src]);

  while (pq.size > 0) {
    const [d, u] = pq.pop();
    if (d > d2[u]) continue; <span class="c">// neither the best nor the second best way to reach u</span>
    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd &lt; d1[v]) {
        d2[v] = d1[v]; <span class="c">// the old best becomes the runner-up (its heap entry is still pending)</span>
        d1[v] = nd;
        pq.push([nd, v]);
      } else if (nd > d1[v] &amp;&amp; nd &lt; d2[v]) {
        d2[v] = nd;
        pq.push([nd, v]);
      }
    }
  }
  return d2[dst];
}</code></pre>
<h4>Dry run: edges 0-1 (1), 1-2 (1), 0-2 (3); from 0 to 2</h4>
<table>
  <tr><th>Pop</th><th>What is learned</th><th>d1 / d2 for nodes 0, 1, 2</th></tr>
  <tr><td>0, node 0</td><td>node 1 at 1, node 2 at 3</td><td>[0, 1, 3] / [∞, ∞, ∞]</td></tr>
  <tr><td>1, node 1</td><td>back to 0 costs 2, a second route; node 2 at 2 beats 3, so 3 is demoted</td><td>[0, 1, 2] / [2, ∞, 3]</td></tr>
  <tr><td>2, node 0</td><td>node 1 at 3, a second route to it; node 2 at 5 is useless</td><td>[0, 1, 2] / [2, 3, 3]</td></tr>
  <tr><td>2, node 2 and later</td><td>nothing improves any more</td><td>d2[2] = 3</td></tr>
</table>
<p class="sub">
  The answer is <code>d2[2] = 3</code>, the direct edge. Walks may revisit a node:
  <code>d2[0] = 2</code> is the walk 0 → 1 → 0. The version that asks for a
  second shortest <em>simple</em> path is a harder problem and needs a different
  algorithm. Time is O((V + E) log V) with a constant factor of about two.
</p>
<div class="warn">
  <span class="ttl">⚠ Strict versus tied</span>
  If the problem wants the second value that is <em>not equal</em> to the
  shortest, the middle <code>else if</code> must say <code>nd &gt; d1[v]</code>;
  with <code>&gt;=</code> a tie with the shortest would be recorded as the
  second shortest. If instead it wants the second best path counted with
  duplicates, drop the strict test. Read the statement for which one it is.
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

<h3>The same flights problem, with Dijkstra on (node, flights taken)</h3>
<p>
  The bounded Bellman-Ford above is not the only way. The root of the trap is
  that "the cheapest cost to reach a node" is the wrong state, because a cheap
  arrival with many flights may be useless later while a dearer arrival with
  few flights still has room. So make the state what the problem actually
  constrains: <b>(node, flights taken so far)</b>. Now "cheapest cost to reach
  this state" is a well-defined quantity, and Dijkstra applies to the graph of
  states, where each flight leads from <code>(u, t)</code> to
  <code>(v, t + 1)</code>.
</p>
<pre><code>function findCheapestPrice(n, flights, src, dst, k) {
  const adj = Array.from({ length: n }, () => []);
  for (const [u, v, price] of flights) adj[u].push([v, price]);

  const best = Array.from({ length: n }, () => new Array(k + 2).fill(Infinity)); <span class="c">// best[node][flightsTaken]</span>
  best[src][0] = 0;
  const pq = new MinHeap();
  pq.push([0, src, 0]); <span class="c">// [cost so far, node, flights taken]</span>

  while (pq.size > 0) {
    const [cost, u, taken] = pq.pop();
    if (u === dst) return cost;             <span class="c">// cheapest way to reach dst within the limit</span>
    if (cost > best[u][taken]) continue;    <span class="c">// stale</span>
    if (taken === k + 1) continue;          <span class="c">// k stops = k + 1 flights: none left to take</span>
    for (const [v, price] of adj[u]) {
      const nc = cost + price;
      if (nc &lt; best[v][taken + 1]) {
        best[v][taken + 1] = nc;
        pq.push([nc, v, taken + 1]);
      }
    }
  }
  return -1;
}</code></pre>
<p>
  Because the first time the target is popped it is at its cheapest cost under
  the limit, the function returns immediately. There are at most
  <code>n · (k + 2)</code> states and each is expanded once, so the time is about
  O(k · E · log(k · E)). That is slower than Bellman-Ford's O(k · E) here, but
  the augmented-state idea is the one that carries over to harder limits (fuel
  tanks, keys collected, discounts remaining), where Bellman-Ford's round
  structure no longer fits.
</p>
<h4>Why the table has a second index: flights 0→1 (1), 1→2 (1), 2→3 (1), 0→2 (5); from 0 to 3, at most 1 stop</h4>
<table>
  <tr><th>Version</th><th>What it does</th><th>Result</th></tr>
  <tr><td>Keeps one best cost per node</td><td>reaches node 2 at cost 2 through node 1, so the direct flight 0→2 at cost 5 is pruned as worse; the continuation 2→3 would be a third flight, which is over the limit</td><td>-1, wrong</td></tr>
  <tr><td>Keeps one best cost per (node, flights taken)</td><td>keeps 0→2 at cost 5 as the only state with one flight at node 2, then 2→3 completes the trip in two flights</td><td>6, right</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Pruning by node alone is the classic wrong answer</span>
  Whenever a second quantity limits the path, the state must carry it. The
  failure is silent: the code returns a plausible number or -1 on most inputs
  and is wrong only when a cheap route exhausts the budget. The same wrong turn
  appears in "shortest path with at most k obstacles removed", where the state
  is (cell, removals used). Also remember that <em>k stops</em> means
  <em>k + 1 flights</em>, which is where the <code>k + 2</code> array size and
  the <code>taken === k + 1</code> test come from.
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
      if (dist[u] === Infinity) continue;   <span class="c">// unreachable: skip, never relax from here</span>
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

<h3>SPFA: Bellman-Ford that only looks where something changed</h3>
<p>
  Plain Bellman-Ford relaxes every edge every round, even edges out of nodes
  whose distance has not changed since the last round. Those edges cannot
  improve anything, so relaxing them is wasted work. SPFA, the "shortest path
  faster algorithm", keeps a queue of nodes whose distance <em>just changed</em>
  and relaxes only the edges out of those. When a node's distance improves it
  joins the queue, unless it is already waiting there.
</p>
<p>
  Negative cycles need a new test, since the "extra round" is gone. Track, for
  every node, how many edges its current best path uses. A shortest path
  without a cycle uses at most n - 1 edges, so if some node's best path ever
  reaches n edges the path repeats a node and the repeated stretch is a cycle
  that keeps lowering the distance: a negative cycle.
</p>
<pre><code>function spfa(n, adj, src) {
  const dist = new Array(n).fill(Infinity);
  const edgesOnPath = new Array(n).fill(0); <span class="c">// edges on the best path currently known to each node</span>
  const inQueue = new Array(n).fill(false);
  const queue = new Array(n);                <span class="c">// circular buffer: a node is in it at most once</span>
  let head = 0, tail = 0;

  dist[src] = 0;
  queue[tail++ % n] = src;
  inQueue[src] = true;

  while (head !== tail) {
    const u = queue[head++ % n];
    inQueue[u] = false;
    for (const [v, w] of adj[u]) {
      if (dist[u] + w &lt; dist[v]) {
        dist[v] = dist[u] + w;
        edgesOnPath[v] = edgesOnPath[u] + 1;
        if (edgesOnPath[v] >= n) return null; <span class="c">// a shortest path with n edges repeats a node: negative cycle</span>
        if (!inQueue[v]) {
          inQueue[v] = true;
          queue[tail++ % n] = v;
        }
      }
    }
  }
  return dist;
}</code></pre>
<h4>Dry run: edges 0→1 (4), 0→2 (5), 1→2 (-3), 2→3 (2), 1→3 (6)</h4>
<table>
  <tr><th>Pop</th><th>Improvements</th><th>Queue afterwards</th><th>dist (nodes 0..3)</th></tr>
  <tr><td>0</td><td>1 = 4, 2 = 5</td><td>1, 2</td><td>[0, 4, 5, ∞]</td></tr>
  <tr><td>1</td><td>2 = 4 + (-3) = 1, 3 = 4 + 6 = 10; node 2 is already queued</td><td>2, 3</td><td>[0, 4, 1, 10]</td></tr>
  <tr><td>2</td><td>3 = 1 + 2 = 3; node 3 is already queued</td><td>3</td><td>[0, 4, 1, 3]</td></tr>
  <tr><td>3</td><td>no outgoing edges</td><td>empty</td><td>[0, 4, 1, 3]</td></tr>
</table>
<p class="sub">
  Node 2 was reached twice, first at 5 and then at 1 through the negative edge,
  but it was expanded only once, after its distance settled, because the first
  queue entry covered both. That sharing is the saving.
</p>
<div class="warn">
  <span class="ttl">⚠ Do not promise more than the worst case</span>
  SPFA's worst case is O(V · E), the same bound as Bellman-Ford, and inputs
  built to defeat it exist. On random graphs it is often far faster, which is
  why it is popular in contests, but in an interview say "typically fast, worst
  case O(V · E)" and not "O(E)". If all weights are non-negative, Dijkstra is
  the better answer; if you must handle negative edges in a guaranteed bound,
  Bellman-Ford is the one with a clean proof. The circular buffer in the code is
  safe because the <code>inQueue</code> flag keeps at most n nodes in it at once.
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
  wrong answers on some graphs: with edges 0→1, 1→3 and 3→2, each of weight 1,
  it leaves <code>d[0][2]</code> at ∞ instead of 3. The reason k must
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

<h3>Floyd-Warshall: recovering the path, not just the length</h3>
<p>
  The distance matrix tells you how far; interviews often ask for the route.
  Keep a second matrix <code>next[i][j]</code>, the first node to step to when
  travelling from i to j on a best path. Initially <code>next[u][v] = v</code>
  for each edge. When going through <code>k</code> improves
  <code>d[i][j]</code>, the new best path starts the same way as the best path
  from i to k, so <code>next[i][j] = next[i][k]</code>. To print a route, start
  at i and repeat <code>i = next[i][j]</code> until you arrive.
</p>
<pre><code>function floydPaths(n, edges) {
  const d = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  const next = Array.from({ length: n }, () => new Array(n).fill(-1)); <span class="c">// next[i][j] = first step on a best path i -> j</span>
  for (let i = 0; i &lt; n; i++) {
    d[i][i] = 0;
    next[i][i] = i;
  }
  for (const [u, v, w] of edges) {
    if (w &lt; d[u][v]) {
      d[u][v] = w;
      next[u][v] = v;
    }
  }

  for (let k = 0; k &lt; n; k++) {
    for (let i = 0; i &lt; n; i++) {
      if (d[i][k] === Infinity) continue;
      for (let j = 0; j &lt; n; j++) {
        if (d[i][k] + d[k][j] &lt; d[i][j]) {
          d[i][j] = d[i][k] + d[k][j];
          next[i][j] = next[i][k]; <span class="c">// to go i -> j through k, start the way you start towards k</span>
        }
      }
    }
  }
  return { d, next };
}

function pathBetween(next, i, j) {
  if (next[i][j] === -1) return [];
  const path = [i];
  while (i !== j) {
    i = next[i][j];
    path.push(i);
  }
  return path;
}</code></pre>
<h4>Dry run: edges 0→1 (5), 1→2 (3), 2→3 (1), 0→3 (10)</h4>
<table>
  <tr><th>Round</th><th>Improvement</th><th>Update</th></tr>
  <tr><td>k = 1</td><td>d[0][2] goes from ∞ to 8</td><td>next[0][2] = next[0][1] = 1</td></tr>
  <tr><td>k = 2</td><td>d[0][3] goes from 10 to 9</td><td>next[0][3] = next[0][2] = 1</td></tr>
  <tr><td>k = 2</td><td>d[1][3] goes from ∞ to 4</td><td>next[1][3] = next[1][2] = 2</td></tr>
</table>
<p class="sub">
  Reading the route from 0 to 3: next[0][3] is 1, next[1][3] is 2, next[2][3] is
  3, so the path is 0 → 1 → 2 → 3 with total 9, cheaper than the direct edge of
  10. Storing the whole path in each cell would cost O(V) per update and
  O(V<sup>4</sup>) in total; the <code>next</code> matrix keeps the total at
  O(V<sup>3</sup>) time and O(V<sup>2</sup>) space.
</p>
<div class="warn">
  <span class="ttl">⚠ Reconstruction loops forever on a negative cycle</span>
  If the graph has a negative cycle, some <code>d[i][i]</code> becomes negative
  and <code>pathBetween</code> can walk around the cycle without end. Check
  <code>d[i][i] &lt; 0</code> for every i before reconstructing, as the
  comment on the Floyd-Warshall code above says. Also remember that
  <code>next[i][j] === -1</code> means "no route", and that the first node of
  a path is always i itself, which the code adds before the loop.
</div>

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

<h3>Shortest and longest paths on a DAG</h3>
<p>
  The table at the end of this chapter says that on a DAG, topological order
  beats everything. Here is the code and the reason. Process the nodes in
  topological order. When you reach node <code>u</code>, every edge into u
  comes from a node earlier in the order, so every candidate for
  <code>dist[u]</code> has already been offered and <code>dist[u]</code> is
  final. Relax the edges out of u and move on. Each edge is relaxed once, so
  the time is O(V + E), whatever the weights are: negative edges are fine, and
  so is <em>longest</em> path, which is hard on a general graph (the longest simple path is
  NP-hard) but needs only the comparison flipped here.
</p>
<pre><code>function dagPaths(n, edges, src) {
  const adj = Array.from({ length: n }, () => []);
  const indegree = new Array(n).fill(0);
  for (const [u, v, w] of edges) {
    adj[u].push([v, w]);
    indegree[v]++;
  }

  const order = [];
  for (let i = 0; i &lt; n; i++) if (indegree[i] === 0) order.push(i);
  for (let head = 0; head &lt; order.length; head++) { <span class="c">// Kahn's algorithm; order doubles as the queue</span>
    for (const [v] of adj[order[head]]) {
      if (--indegree[v] === 0) order.push(v);
    }
  }
  if (order.length &lt; n) return null; <span class="c">// a cycle: there is no topological order</span>

  const shortest = new Array(n).fill(Infinity);
  const longest = new Array(n).fill(-Infinity);
  shortest[src] = 0;
  longest[src] = 0;

  for (const u of order) { <span class="c">// every edge into u was relaxed before u is processed</span>
    for (const [v, w] of adj[u]) {
      if (shortest[u] !== Infinity &amp;&amp; shortest[u] + w &lt; shortest[v]) shortest[v] = shortest[u] + w;
      if (longest[u] !== -Infinity &amp;&amp; longest[u] + w > longest[v]) longest[v] = longest[u] + w;
    }
  }
  return { shortest, longest };
}</code></pre>
<h4>Dry run: edges 0→1 (2), 0→2 (-1), 1→3 (3), 2→3 (4), 2→4 (1), 3→5 (-2), 4→5 (6); source 0</h4>
<table>
  <tr><th>Processed</th><th>shortest (nodes 0..5)</th><th>longest (nodes 0..5)</th></tr>
  <tr><td>node 0</td><td>[0, 2, -1, ∞, ∞, ∞]</td><td>[0, 2, -1, -∞, -∞, -∞]</td></tr>
  <tr><td>node 1</td><td>[0, 2, -1, 5, ∞, ∞]</td><td>[0, 2, -1, 5, -∞, -∞]</td></tr>
  <tr><td>node 2</td><td>[0, 2, -1, 3, 0, ∞]</td><td>[0, 2, -1, 5, 0, -∞]</td></tr>
  <tr><td>node 3</td><td>[0, 2, -1, 3, 0, 1]</td><td>[0, 2, -1, 5, 0, 3]</td></tr>
  <tr><td>node 4</td><td>[0, 2, -1, 3, 0, 1]</td><td>[0, 2, -1, 5, 0, 6]</td></tr>
</table>
<p class="sub">
  The shortest path to node 5 costs 1, through 0 → 2 → 3 → 5 (that is -1 + 4 - 2
  = 1), and the longest costs 6, through 0 → 2 → 4 → 5 (that is -1 + 1 + 6 = 6).
  Notice that node 3 was first set to 5 from node 1 and improved to 3 from
  node 2, both before node 3 was processed.
</p>
<div class="warn">
  <span class="ttl">⚠ Check that it really is a DAG</span>
  Kahn's algorithm leaves nodes behind when there is a cycle, so the code
  returns <code>null</code> when <code>order.length &lt; n</code>. Skipping that
  test lets the relaxation run on a partial order and return confident wrong
  answers. And a node the source cannot reach stays at
  <code>Infinity</code> (or <code>-Infinity</code> for longest); the guards in
  the code keep it from relaxing out of such nodes. The DP chapters used the
  same idea without the name: "unique paths" and "longest path in a matrix" fill
  a DAG in an order where dependencies come first.
</div>

<h3>Dijkstra without a heap: the array version for dense graphs</h3>
<p>
  The heap makes Dijkstra O(E log V), which is a win when E is near V and a loss
  when the graph is dense. If E is about V<sup>2</sup>, then
  E log V is about V<sup>2</sup> log V, and a plain array does better: at each of
  the V rounds, scan all V nodes for the unfinished one with the smallest
  distance (O(V)), finalize it, and relax its V possible neighbours (O(V)). That
  is O(V<sup>2</sup>) in total with no heap, no stale entries and no duplicates.
</p>
<pre><code>function denseDijkstra(n, w, src) {
  const dist = new Array(n).fill(Infinity);
  const done = new Array(n).fill(false);
  dist[src] = 0;

  for (let round = 0; round &lt; n; round++) {
    let u = -1;
    for (let i = 0; i &lt; n; i++) {
      if (!done[i] &amp;&amp; (u === -1 || dist[i] &lt; dist[u])) u = i; <span class="c">// linear scan replaces the heap</span>
    }
    if (u === -1 || dist[u] === Infinity) break;              <span class="c">// everything left is unreachable</span>
    done[u] = true;
    for (let v = 0; v &lt; n; v++) {
      if (!done[v] &amp;&amp; dist[u] + w[u][v] &lt; dist[v]) dist[v] = dist[u] + w[u][v];
    }
  }
  return dist;
}</code></pre>
<p class="sub">
  Use it when the input is already an adjacency matrix (a distance table, a
  complete graph over points) and V is a few thousand at most: the V × V matrix
  is then the input size, so O(V<sup>2</sup>) is linear in what you were given.
  The correctness argument is the same as for the heap version, since "the
  unfinished node with the smallest distance" is exactly what the heap's pop
  returns. Choosing between the two is a one-line comparison: V<sup>2</sup>
  against E log V. It is also the form Prim's algorithm takes on a dense graph
  in the next chapter.
</p>
<div class="warn">
  <span class="ttl">⚠ Two small traps</span>
  Stop when the smallest remaining distance is <code>Infinity</code>: what is
  left cannot be reached, and finalizing it would only waste rounds. And the matrix must store
  <code>Infinity</code> for a missing edge, not 0, or every missing edge becomes
  a free shortcut.
</div>

<h3>A-star: Dijkstra with a compass</h3>
<p>
  Dijkstra explores in a growing disc around the source, in every direction,
  because it knows nothing about where the target is. When you have one source,
  one target and a cheap way to <em>estimate</em> the remaining distance, you can
  bias the search toward the target. <b>A*</b> orders the heap by
  <code>f = g + h</code>, where <code>g</code> is the cost paid so far and
  <code>h(v)</code> is a heuristic: a guess of the cost from v to the target. With
  <code>h = 0</code> it is exactly Dijkstra.
</p>
<p>
  The guess has to be honest. <b>Admissible</b> means <code>h</code> never
  <em>over</em>estimates the true remaining cost, and then the first time the
  target is popped its cost is optimal. On a grid with 4-direction moves of cost
  1, the Manhattan distance <code>|dr| + |dc|</code> is admissible, since no path
  can be shorter than the straight-line count of steps. It is also
  <b>consistent</b> (it drops by at most 1 per step, which is the step cost),
  and with a consistent heuristic every node is finalized the first time it is
  popped, so the same stale-entry skip as Dijkstra's is enough.
</p>
<pre><code>function aStarGrid(grid, start, goal) {
  const R = grid.length, C = grid[0].length;
  const [sr, sc] = start, [gr, gc] = goal;
  if (grid[sr][sc] === 1 || grid[gr][gc] === 1) return -1;

  const h = (r, c) => Math.abs(r - gr) + Math.abs(c - gc); <span class="c">// Manhattan distance: never overestimates on a 4-way grid</span>
  const cost = Array.from({ length: R }, () => new Array(C).fill(Infinity));
  cost[sr][sc] = 0;
  const pq = new MinHeap();
  pq.push([h(sr, sc), 0, sr, sc]); <span class="c">// [f = steps so far + estimate, steps so far, row, column]</span>
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  while (pq.size > 0) {
    const [, steps, r, c] = pq.pop();
    if (steps > cost[r][c]) continue;
    if (r === gr &amp;&amp; c === gc) return steps;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr >= R || nc &lt; 0 || nc >= C || grid[nr][nc] === 1) continue;
      if (steps + 1 &lt; cost[nr][nc]) {
        cost[nr][nc] = steps + 1;
        pq.push([steps + 1 + h(nr, nc), steps + 1, nr, nc]);
      }
    }
  }
  return -1;
}</code></pre>
<h4>Dry run: a 3 × 5 grid with a wall, from (0,0) to (0,4)</h4>
<pre><code>. . . . .
. # # # .
. . . . .</code></pre>
<table>
  <tr><th>Pop</th><th>Cell</th><th>g</th><th>h</th><th>f = g + h</th></tr>
  <tr><td>1</td><td>(0,0)</td><td>0</td><td>4</td><td>4</td></tr>
  <tr><td>2</td><td>(0,1)</td><td>1</td><td>3</td><td>4</td></tr>
  <tr><td>3</td><td>(0,2)</td><td>2</td><td>2</td><td>4</td></tr>
  <tr><td>4</td><td>(0,3)</td><td>3</td><td>1</td><td>4</td></tr>
  <tr><td>5</td><td>(0,4)</td><td>4</td><td>0</td><td>4: the goal, return 4</td></tr>
</table>
<p class="sub">
  A* expanded 5 cells. Dijkstra on the same grid expands up to 9, since it also fills
  in the cells behind and beside the start at distances 1, 2 and 3 before it
  reaches distance 4. The gap grows with the grid: on an open 9 × 9 grid with the
  goal along the top row, A* expands 9 cells and Dijkstra up to 45. The worst case is
  no better than Dijkstra's, though. If the heuristic is poor, or the way to the
  target is a long detour around a wall, A* explores as widely as Dijkstra does.
</p>
<div class="warn">
  <span class="ttl">⚠ An optimistic guess is fine, a pessimistic one is wrong</span>
  If <code>h</code> overestimates, A* can pop the target through a worse route
  and return a non-optimal cost, silently. Squaring the Manhattan distance,
  scaling it up for speed ("weighted A*") or using Manhattan distance on a grid
  that allows diagonal moves all break the guarantee; with diagonal moves use the
  Chebyshev distance, <code>max(|dr|, |dc|)</code>. Also note that A* answers
  one target, not all distances, and that the cost of computing
  <code>h</code> is paid on every push.
</div>

<h3>Bidirectional search: two small circles instead of one big one</h3>
<p>
  In an unweighted graph where each node has about b neighbours, a BFS to
  distance d visits on the order of b<sup>d</sup> nodes. Two searches, one from
  the source and one from the target, each only need to reach distance d / 2
  before they touch. That is about 2 · b<sup>d/2</sup> nodes, a very large
  saving when b is big and d is moderate. It is the standard speed-up for "Word
  Ladder" and other puzzle-state graphs, whose branching factor is large.
</p>
<p>
  The mechanics: keep a distance map and a frontier for each side. Each round,
  expand <em>one whole level</em> of the <em>smaller</em> frontier (so the work
  stays balanced). While scanning neighbours, if a neighbour is already in the
  other side's map, the two searches have met, and the answer is
  <code>distance so far + 1 + the other side's distance</code>.
</p>
<pre><code>function bidirectionalBFS(adj, source, target) {
  if (source === target) return 0;
  const distA = new Map([[source, 0]]); <span class="c">// distances from the source</span>
  const distB = new Map([[target, 0]]); <span class="c">// distances from the target</span>
  let frontA = [source], frontB = [target];

  while (frontA.length > 0 &amp;&amp; frontB.length > 0) {
    const fromA = frontA.length &lt;= frontB.length; <span class="c">// always expand the smaller frontier</span>
    const front = fromA ? frontA : frontB;
    const mine = fromA ? distA : distB;
    const other = fromA ? distB : distA;
    const next = [];

    for (const u of front) {
      for (const v of adj[u]) {
        if (other.has(v)) return mine.get(u) + 1 + other.get(v); <span class="c">// the two searches touch</span>
        if (!mine.has(v)) {
          mine.set(v, mine.get(u) + 1);
          next.push(v);
        }
      }
    }
    if (fromA) frontA = next;
    else frontB = next;
  }
  return -1;
}</code></pre>
<h4>Dry run: path 0-1-2-3-4-5-6 with extra leaves 7, 8 on node 1 and 9 on node 5; from 0 to 6</h4>
<table>
  <tr><th>Round</th><th>Side expanded</th><th>Frontier expanded</th><th>New frontier</th></tr>
  <tr><td>1</td><td>source side (sizes 1 and 1: tie goes to the source)</td><td>0</td><td>1</td></tr>
  <tr><td>2</td><td>source side</td><td>1</td><td>2, 7, 8</td></tr>
  <tr><td>3</td><td>target side (sizes 3 and 1: smaller)</td><td>6</td><td>5</td></tr>
  <tr><td>4</td><td>target side</td><td>5</td><td>4, 9</td></tr>
  <tr><td>5</td><td>target side</td><td>4, 9</td><td>3</td></tr>
  <tr><td>6</td><td>target side</td><td>3: its neighbour 2 is in the source side's map at distance 2</td><td>return 3 + 1 + 2 = 6</td></tr>
</table>
<p class="sub">
  The searches met in the middle and the answer is the length of the whole path.
  Returning at the first meeting is right: before each level, the two searches
  have not touched, which means the true distance is at least the sum of their
  radii plus one, and any meeting found while expanding that level has length at
  most that sum, so it is exactly the shortest. If you instead stop one level
  too early or too late the answer is off by one or two.
</p>
<div class="warn">
  <span class="ttl">⚠ Where bidirectional search goes wrong</span>
  It needs an undirected graph, or edges you can follow backwards from the
  target. It does not carry over to weighted graphs as is, where "first meeting"
  stops being enough and the stopping rule needs care. Alternating single nodes
  instead of whole levels breaks the argument above. Forgetting
  <code>source === target</code> returns -1 or a wrong length for a zero-length
  trip. And the saving is real only when branching is large: on a path-like graph,
  where each level holds a node or two, it saves nothing.
</div>

<h3>Picking the right one</h3>
<table>
  <tr><th>Algorithm</th><th>Use when</th><th>Time</th><th>Space</th><th>Negative weights</th></tr>
  <tr><td>BFS</td><td>all edges cost the same (usually 1)</td><td>O(V + E)</td><td>O(V)</td><td>n/a</td></tr>
  <tr><td>0-1 BFS (deque)</td><td>every weight is 0 or 1</td><td>O(V + E)</td><td>O(V)</td><td>no</td></tr>
  <tr><td>Dijkstra + binary heap</td><td>single source, non-negative weights</td><td>O(E log V)</td><td>O(V + E)</td><td>no — breaks silently</td></tr>
  <tr><td>Dijkstra, array scan</td><td>dense graph or a distance matrix as input</td><td>O(V²)</td><td>O(V)</td><td>no</td></tr>
  <tr><td>A*</td><td>one source and one target, with a heuristic that never overestimates</td><td>as Dijkstra in the worst case</td><td>O(V)</td><td>no</td></tr>
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
  <li><b>"Highest probability," "largest/smallest bottleneck," "narrowest road"</b> → the Dijkstra loop with a different combine step: multiply and pop the largest, or take the max along the path.</li>
  <li><b>"How many shortest paths" or "the second shortest"</b> → Dijkstra carrying a count, or two distances per node.</li>
  <li><b>A second limit on the path (stops, fuel, removals)</b> → put it in the state and run Dijkstra on (node, used), not on node alone.</li>
  <li><b>The graph is a DAG</b> (or the problem says "no cycles") → relax in topological order for shortest or longest paths in O(V + E).</li>
  <li><b>Dense graph or an adjacency matrix as input</b> → array-scan Dijkstra in O(V<sup>2</sup>); <b>one source, one target on a grid with coordinates</b> → A* with an admissible heuristic; <b>huge branching, undirected</b> → bidirectional BFS.</li>
  <li><b>Pitfalls:</b> Dijkstra with negative edges (wrong, and quietly so); sorting an array as a fake priority queue (TLE); Floyd-Warshall with k not outermost (wrong); relaxing from an unreachable node when the sentinel is a finite number like 10<sup>9</sup> (the sum looks like a real distance; with <code>Infinity</code> it stays infinite, but the guard keeps the intent clear); and using <code>Array#shift()</code> as a queue on 10<sup>5</sup> nodes (O(n²) hidden inside an O(V+E) algorithm).</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write Dijkstra with a binary heap from memory, including the stale-entry check, and explain what goes wrong if you delete it.</li>
    <li>Explain why Dijkstra gives wrong answers on a graph with a negative edge, and why Bellman-Ford doesn't.</li>
    <li>Trace why Floyd-Warshall requires k as the outermost loop, using the path 0→1→3→2 to see it break under i, j, k ordering.</li>
    <li>Explain when a 0-1 BFS deque replaces a heap, and why a 0-weight edge goes to the front (not the back) to keep the deque sorted by distance.</li>
    <li>Given a new shortest-path problem, answer "uniform, non-negative, or negative weights — one source or all pairs?" and name the algorithm that answer forces.</li>
  </ul>
</div>`,
};
