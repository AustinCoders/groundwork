import type { Chapter } from "../types";

export const dsaUnionFind: Chapter = {
  id: "dsa-union-find",
  num: "A2",
  title: "Union-Find (Disjoint Set)",
  short: "Union-Find",
  levels: ["advanced"],
  practice: ["ex-number-of-connected-components", "ex-redundant-connection"],
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
  path, ignoring arrows." A directed graph with edges 1→3 and 2→3 would look
  like a cycle to DSU (both unions touch 3) when there isn't one. For
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
  var STEPS = [{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"1","c":"","p":"p=1"},{"v":"2","c":"","p":"p=2"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0}","{1}","{2}","{3}","{4}","{5}","{6}"]},"note":"Seven nodes, each its own set — parent[i] = i means 'I am my own root'."},{"cells":[{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"2","c":"","p":"p=2"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1}","{2}","{3}","{4}","{5}","{6}"]},"note":"union(0, 1) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2}","{3}","{4}","{5}","{6}"]},"note":"union(1, 2) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"3","c":"hot","p":"p=3"},{"v":"3","c":"hot","p":"p=3"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2}","{3, 4}","{5}","{6}"]},"note":"union(3, 4) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"3","c":"","p":"p=3"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"union(2, 3) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"find(4) walked 4 → 3 → 0. Path compression then re-points every node on that walk straight at the root, so the next find is O(1)."},{"cells":[{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"5","c":"done","p":"p=5"},{"v":"6","c":"done","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"Union by size plus path compression is what gives near-O(1) amortised operations."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
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
  <li><b>Pitfalls:</b> forgetting <code>find</code> before reading <code>size</code>; sizing the array wrong on 1-indexed inputs; and comparing roots with <code>parent[a] === parent[b]</code> instead of <code>find(a) === find(b)</code> — the second is the only correct test.</li>
</ul>`,
};
