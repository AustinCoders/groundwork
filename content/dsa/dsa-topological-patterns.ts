import type { Chapter } from "../types";

export const dsaTopologicalPatterns: Chapter = {
  id: "dsa-topological-patterns",
  num: "A11",
  title: "Topological patterns",
  short: "Topological patterns",
  levels: ["advanced"],
  practice: ["ex-course-schedule", "ex-course-schedule-ii", "ex-alien-dictionary"],
  ready: true,
  subtitle: 'Any problem phrased as "X must come before Y" is a DAG asking to be linearized.',
  body: `<h3>The shape: dependencies want to be a line</h3>
<p>
  A <b>topological order</b> of a directed graph is any ordering of its
  vertices such that for every edge <code>u → v</code>, <code>u</code> appears
  before <code>v</code>. It is the answer to every "in what order can I do
  these tasks given these prerequisites" question — build systems, course
  schedules, package managers, spreadsheet recalculation, and a surprising
  number of string and DP problems in disguise.
</p>
<p>
  One theorem carries the whole chapter: <b>a topological order exists if and
  only if the graph is a DAG</b> (directed, acyclic). A cycle
  <code>a → b → a</code> demands that <code>a</code> come before
  <code>b</code> and after it, which no ordering can satisfy. That turns every
  topological sort into a free cycle detector — and interviewers exploit this
  constantly, which is why "Course Schedule I" (can it be done at all?) and
  "Course Schedule II" (give me the order) are the same code with a different
  return statement.
</p>
<p>
  The order is generally <b>not unique</b>. If two tasks have no dependency
  path between them, either may go first. Any valid order is accepted; say
  this out loud, because a candidate who assumes a unique answer often writes
  a comparison-based sort by mistake.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A five node directed acyclic graph with in-degree labels, showing node zero with in-degree zero as the only valid starting point for Kahn's algorithm">
    <g class="rough">
      <path class="ln" d="M92,110 L200,68" />
      <path class="ln" d="M92,130 L200,172" />
      <path class="ln" d="M242,72 L358,110" />
      <path class="ln" d="M242,168 L358,130" />
      <path class="ln" d="M402,120 L508,120" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="70" cy="120" r="22" />
      <circle class="box" cx="220" cy="60" r="22" />
      <circle class="box" cx="220" cy="180" r="22" />
      <circle class="box" cx="380" cy="120" r="22" />
      <circle class="box" cx="530" cy="120" r="22" />
    </g>
    <text class="lbl" x="70" y="126" text-anchor="middle">0</text>
    <text class="lbl" x="220" y="66" text-anchor="middle">1</text>
    <text class="lbl" x="220" y="186" text-anchor="middle">2</text>
    <text class="lbl" x="380" y="126" text-anchor="middle">3</text>
    <text class="lbl" x="530" y="126" text-anchor="middle">4</text>
    <text class="sm gr" x="70" y="165" text-anchor="middle">in = 0</text>
    <text class="sm" x="220" y="30" text-anchor="middle">in = 1</text>
    <text class="sm" x="220" y="222" text-anchor="middle">in = 1</text>
    <text class="sm" x="380" y="165" text-anchor="middle">in = 2</text>
    <text class="sm" x="530" y="165" text-anchor="middle">in = 1</text>
    <text class="lbl gr" x="20" y="30" style="font-size:14px">only in-degree 0 nodes are legal to emit</text>
    <text class="sm" x="20" y="52">node 3 waits for BOTH 1 and 2 — its counter must reach 0, not just drop</text>
  </svg>
  <figcaption>Node 3's in-degree of 2 is the whole idea: a node becomes available only when the <em>last</em> of its prerequisites is emitted.</figcaption>
</figure>

<h3>Kahn's algorithm — BFS over in-degrees</h3>
<p>
  Count how many prerequisites each node has. Everything with zero goes in the
  queue. Pop one, emit it, and decrement the counter of everything it points
  at; whenever a counter hits zero, that node's last blocker just cleared, so
  push it. If you emit fewer than <code>n</code> nodes, the leftovers are all
  stuck waiting on each other — a cycle.
</p>
<pre><code><span class="c">// edges are [prereq, dependent] pairs. O(V + E) time, O(V + E) space.</span>
function topoSortKahn(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; }

  const queue = [];
  for (let i = 0; i &lt; n; i++) if (indeg[i] === 0) queue.push(i);

  const order = [];
  for (let head = 0; head &lt; queue.length; head++) { <span class="c">// moving index, NOT queue.shift()</span>
    const u = queue[head];
    order.push(u);
    for (const v of adj[u]) {
      if (--indeg[v] === 0) queue.push(v); <span class="c">// last prerequisite cleared — v is now free</span>
    }
  }

  return order.length === n ? order : []; <span class="c">// short order ⇒ a cycle blocked the rest</span>
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ <code>Array.prototype.shift()</code> is O(n), and it silently makes this O(V²)</span>
  Using an array as a queue with <code>shift()</code> re-indexes every
  remaining element on each pop. On a graph with 10⁵ nodes that turns a clean
  O(V + E) into something quadratic. Either use the moving-<code>head</code>
  index above (the array doubles as the visit log, and it never shrinks) or a
  real deque. Interviewers at this level do notice.
</div>
<p>
  Walking the diagram's graph, with edges 0→1, 0→2, 1→3, 2→3, 3→4:
</p>
<table>
  <tr><th>Step</th><th>Pop</th><th>Emit so far</th><th>In-degrees after decrement</th><th>Newly freed</th></tr>
  <tr><td>init</td><td>—</td><td>[]</td><td>0:<b>0</b> 1:1 2:1 3:2 4:1</td><td>queue = [0]</td></tr>
  <tr><td>1</td><td>0</td><td>[0]</td><td>1:<b>0</b> 2:<b>0</b> 3:2 4:1</td><td>1, 2</td></tr>
  <tr><td>2</td><td>1</td><td>[0,1]</td><td>2:0 3:1 4:1</td><td>none (3 still waits on 2)</td></tr>
  <tr><td>3</td><td>2</td><td>[0,1,2]</td><td>3:<b>0</b> 4:1</td><td>3</td></tr>
  <tr><td>4</td><td>3</td><td>[0,1,2,3]</td><td>4:<b>0</b></td><td>4</td></tr>
  <tr><td>5</td><td>4</td><td>[0,1,2,3,4]</td><td>—</td><td>done, length 5 = n ✓</td></tr>
</table>
<p class="sub">
  Step 2 is the one to notice: node 3's counter drops from 2 to 1 and
  <em>nothing happens</em>. Pushing on "decremented" instead of "reached zero"
  is the single most common bug in this algorithm, and it produces an order
  that looks plausible on small examples but violates a prerequisite on any
  node with two parents.
</p>
<p>
  Two free bonuses fall out of this structure and both come up as follow-ups:
  the number of nodes popped in a single "round" (drain the entire queue before
  starting the next) is the count of tasks that can run <b>in parallel</b>, and
  the number of rounds is the <b>minimum time</b> to finish everything with
  unlimited workers — which is also the longest path length. Also, if at any
  point the queue holds more than one node, the topological order is not
  unique; that is exactly the test for "is there a unique ordering" (Sequence
  Reconstruction).
</p>

<h3>DFS topological sort — post-order, then reverse</h3>
<p>
  The DFS version comes at it from the opposite end. Recurse into all of a
  node's descendants first, and only <em>after</em> they have all been emitted,
  append the node itself. That builds the order backwards: a node always lands
  after everything it depends on, so reversing the finished list gives a valid
  topological order.
</p>
<p>
  Cycle detection is where this version earns its keep — and where it is most
  often written wrong. A single <code>visited</code> boolean is not enough. You
  need three states, because seeing an already-visited node means two very
  different things depending on whether that node is still <em>on the current
  recursion stack</em>.
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="Two cases of encountering an already-seen node in DFS: an edge back to a gray node on the current path is a cycle, while an edge to a black finished node is harmless">
    <g class="rough">
      <path class="ln" d="M70,70 L150,70" />
      <path class="ln" d="M190,70 L270,70" />
      <path class="lnr" d="M270,90 Q170,140 70,90" />
      <path class="ln" d="M400,70 L480,70" />
      <path class="ln dash" d="M520,90 Q560,130 600,90" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="50" cy="70" r="20" />
      <circle class="boxy" cx="170" cy="70" r="20" />
      <circle class="boxy" cx="290" cy="70" r="20" />
      <circle class="boxy" cx="380" cy="70" r="20" />
      <circle class="box" cx="500" cy="70" r="20" />
      <circle class="box" cx="620" cy="70" r="20" />
    </g>
    <text class="sm" x="50" y="75" text-anchor="middle">A</text>
    <text class="sm" x="170" y="75" text-anchor="middle">B</text>
    <text class="sm" x="290" y="75" text-anchor="middle">C</text>
    <text class="sm" x="380" y="75" text-anchor="middle">X</text>
    <text class="sm" x="500" y="75" text-anchor="middle">Y</text>
    <text class="sm" x="620" y="75" text-anchor="middle">Y</text>
    <text class="sm rd" x="170" y="150" text-anchor="middle">C → A: A is GRAY (still on the path)</text>
    <text class="lbl rd" x="170" y="175" text-anchor="middle" style="font-size:14px">cycle — reject</text>
    <text class="sm" x="500" y="150" text-anchor="middle">X → Y: Y is BLACK (already finished)</text>
    <text class="lbl gr" x="500" y="175" text-anchor="middle" style="font-size:14px">not a cycle — just skip</text>
    <text class="sm" x="20" y="25">yellow = GRAY, on the current recursion stack · plain = BLACK, fully explored</text>
  </svg>
  <figcaption>Both edges point at a node you have seen before; only the one pointing at a node still on the stack is a cycle.</figcaption>
</figure>
<pre><code>const WHITE = 0, GRAY = 1, BLACK = 2; <span class="c">// unvisited / on current path / fully explored</span>

function topoSortDfs(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [u, v] of edges) adj[u].push(v);

  const state = new Array(n).fill(WHITE);
  const order = [];
  let cyclic = false;

  function dfs(u) {
    state[u] = GRAY; <span class="c">// entering: u is now on the recursion stack</span>

    for (const v of adj[u]) {
      if (state[v] === GRAY) { cyclic = true; return; } <span class="c">// back edge into the current path</span>
      if (state[v] === WHITE) {
        dfs(v);
        if (cyclic) return; <span class="c">// unwind immediately, don't finish this node</span>
      }
      <span class="c">// state[v] === BLACK: cross/forward edge to finished work — safely ignored</span>
    }

    state[u] = BLACK; <span class="c">// leaving: everything reachable from u is already in \`order\`</span>
    order.push(u);    <span class="c">// POST-order push — this is what makes the reversal correct</span>
  }

  for (let i = 0; i &lt; n; i++) {
    if (state[i] === WHITE) {
      dfs(i);
      if (cyclic) return []; <span class="c">// no valid order exists</span>
    }
  }

  return order.reverse();
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ One boolean <code>visited</code> array reports cycles that do not exist</span>
  With a single flag, the graph <code>X → Y</code>, <code>X → Z</code>,
  <code>Y → Z</code> looks cyclic: DFS finishes <code>Z</code> via
  <code>Y</code>, then <code>X → Z</code> hits a visited node and a naive check
  screams "cycle." It is not one — <code>Z</code> was <em>done</em>, not
  <em>in progress</em>. The fix is the GRAY/BLACK split. The mirror-image bug is
  resetting <code>state[u] = WHITE</code> on the way out (backtracking-style
  un-choose), which is correct but degrades to exponential time because
  finished subtrees get re-explored. Set BLACK and leave it.
</div>
<table>
  <tr><th></th><th>Kahn (BFS)</th><th>DFS post-order</th></tr>
  <tr><td>Complexity</td><td>O(V + E)</td><td>O(V + E)</td></tr>
  <tr><td>Cycle detection</td><td>emitted count &lt; n</td><td>edge into a GRAY node</td></tr>
  <tr><td>Extra state</td><td>in-degree array + queue</td><td>3-state array + call stack</td></tr>
  <tr><td>Recursion depth risk</td><td>none — iterative</td><td>stack overflow near V ≈ 10⁴-10⁵ in JS</td></tr>
  <tr><td>Gives "parallel rounds" / min time</td><td>yes, naturally</td><td>no</td></tr>
  <tr><td>Lexicographically smallest order</td><td>yes — swap the queue for a min-heap</td><td>no</td></tr>
  <tr><td>Reports <em>which</em> nodes are in the cycle</td><td>awkward</td><td>easy — the GRAY nodes on the stack</td></tr>
</table>
<p class="sub">
  Default to Kahn in an interview. It is iterative (no stack-depth caveat), the
  cycle check is a one-line length comparison, and the in-degree array is the
  hook for every follow-up question. Reach for DFS when you need the actual
  cycle, or when the same traversal is already computing something else
  post-order.
</p>

<h3>Course Schedule I and II — the canonical pair</h3>
<p>
  "Can you finish all <code>numCourses</code> given <code>prerequisites</code>
  where <code>[a, b]</code> means you must take <code>b</code> before
  <code>a</code>?" is Course Schedule I. Course Schedule II asks for the
  ordering itself. One function answers both.
</p>
<pre><code>function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () =&gt; []);
  const indeg = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course); <span class="c">// EDGE DIRECTION: prereq -&gt; course, i.e. reversed from the input pair</span>
    indeg[course]++;
  }

  const queue = [];
  for (let i = 0; i &lt; numCourses; i++) if (indeg[i] === 0) queue.push(i);

  const order = [];
  for (let head = 0; head &lt; queue.length; head++) {
    const u = queue[head];
    order.push(u);
    for (const v of adj[u]) if (--indeg[v] === 0) queue.push(v);
  }

  return order.length === numCourses ? order : [];
}

<span class="c">// Course Schedule I is the same call, thrown away down to a boolean</span>
const canFinish = (n, prereqs) =&gt; findOrder(n, prereqs).length === n;</code></pre>
<div class="warn">
  <span class="ttl">⚠ Getting the edge direction backwards</span>
  LeetCode gives pairs as <code>[course, prereq]</code> — <em>dependent
  first</em>. The graph edge points the other way:
  <code>prereq → course</code>. Build it backwards and you get a perfectly
  valid topological order of the reversed graph, which is a wrong answer that
  still passes the "no cycle" check and often passes the first sample test.
  Before writing the loop, say out loud which direction the arrow points and
  what the in-degree of a node <em>means</em> ("how many courses I still have
  to take before this one"). That one sentence prevents the bug.
</div>
<p class="sub">
  Follow-ups that reuse this exact code: return the lexicographically smallest
  valid order (replace the queue with a min-heap, cost becomes O(V log V + E));
  find the minimum number of semesters if unlimited courses can be taken in
  parallel (count BFS rounds); detect whether the ordering is unique (a round
  where the queue held ≥ 2 nodes means it is not).
</p>

<h3>Alien Dictionary — deriving the graph is the hard part</h3>
<p>
  Given a list of words sorted by an unknown alphabet's order, recover that
  order. The topological sort at the end is boilerplate; the interview is
  testing whether you can extract the edges correctly. Two rules do it: compare
  each <b>adjacent pair</b> of words, and from that pair take <b>only the first
  position where they differ</b> — everything after it is unconstrained,
  because lexicographic comparison stopped there.
</p>
<pre><code>function alienOrder(words) {
  const adj = new Map(), indeg = new Map();
  for (const w of words) {
    for (const ch of w) {
      if (!adj.has(ch)) { adj.set(ch, new Set()); indeg.set(ch, 0); } <span class="c">// every seen letter must appear in the answer</span>
    }
  }

  for (let i = 0; i + 1 &lt; words.length; i++) {
    const a = words[i], b = words[i + 1];

    <span class="c">// "abc" before "ab" is impossible in ANY alphabet — invalid input, not a cycle</span>
    if (a.length &gt; b.length &amp;&amp; a.startsWith(b)) return "";

    for (let j = 0; j &lt; Math.min(a.length, b.length); j++) {
      if (a[j] !== b[j]) {
        if (!adj.get(a[j]).has(b[j])) { <span class="c">// dedupe: a repeated edge would double-count in-degree</span>
          adj.get(a[j]).add(b[j]);
          indeg.set(b[j], indeg.get(b[j]) + 1);
        }
        break; <span class="c">// ONLY the first difference carries information — stop comparing</span>
      }
    }
  }

  const queue = [...indeg.keys()].filter((c) =&gt; indeg.get(c) === 0);
  let out = "";
  for (let head = 0; head &lt; queue.length; head++) {
    const u = queue[head];
    out += u;
    for (const v of adj.get(u)) {
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }

  return out.length === indeg.size ? out : ""; <span class="c">// cycle ⇒ the input was contradictory</span>
}</code></pre>
<p class="sub">
  Three failure modes, three different causes, and an interviewer will probe
  all of them. <b>Prefix violation</b> (<code>["abc", "ab"]</code>) — caught
  before the loop; it is not a graph problem at all. <b>Cycle</b>
  (<code>["a","b","a"]</code>) — caught by the length check at the end.
  <b>Insufficient information</b> (<code>["z","x"]</code> says nothing about
  <code>y</code>) — <em>not</em> an error; any order among the unconstrained
  letters is accepted, which is exactly why every letter seen anywhere must be
  seeded into the maps up front, even letters with no edges at all.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "The sorted-words input is really
  a set of pairwise ordering constraints in disguise. Each adjacent pair gives
  me at most one edge — the first character position where they differ — and
  once I have those edges it's a plain topological sort, so O(C) where C is the
  total length of all the words. The two traps are that a longer word can't
  precede its own prefix, and that letters with no constraints still have to
  appear in the output."
</div>

<h3>Longest path in a DAG — DP over the topological order</h3>
<p>
  Longest path is NP-hard on a general graph, but on a DAG it is linear. The
  reason is exactly the property topological order gives you: when you process
  node <code>u</code>, every edge <em>into</em> <code>u</code> has already been
  processed, so <code>dist[u]</code> is final and can be relaxed outward
  without ever being revisited. That is the same argument Dijkstra makes with a
  priority queue — here the ordering is free and, crucially, negative weights
  are fine.
</p>
<pre><code><span class="c">// edges: [u, v, weight]. Returns the longest path length in the whole DAG. O(V + E).</span>
function longestPath(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  const indeg = new Array(n).fill(0);
  for (const [u, v, w] of edges) { adj[u].push([v, w]); indeg[v]++; }

  const order = [];
  const queue = [];
  const remaining = indeg.slice(); <span class="c">// copy — we still need the original to seed sources</span>
  for (let i = 0; i &lt; n; i++) if (remaining[i] === 0) queue.push(i);
  for (let head = 0; head &lt; queue.length; head++) {
    const u = queue[head];
    order.push(u);
    for (const [v] of adj[u]) if (--remaining[v] === 0) queue.push(v);
  }
  if (order.length !== n) throw new Error("cycle: longest path is unbounded");

  const dist = new Array(n).fill(-Infinity);
  for (let i = 0; i &lt; n; i++) if (indeg[i] === 0) dist[i] = 0; <span class="c">// any source can start a path</span>

  for (const u of order) {
    if (dist[u] === -Infinity) continue;
    for (const [v, w] of adj[u]) {
      dist[v] = Math.max(dist[v], dist[u] + w); <span class="c">// dist[u] is FINAL — topo order guarantees it</span>
    }
  }

  return Math.max(...dist);
}</code></pre>
<p class="sub">
  Flip <code>Math.max</code> to <code>Math.min</code> and you have shortest
  path on a DAG, which beats Dijkstra's O(E log V) and — unlike Dijkstra —
  handles negative edge weights correctly. This is worth knowing as a named
  fact: "if the graph is a DAG, shortest path is O(V + E) by topological order,
  and negative weights are not a problem."
</p>
<p>
  Once you see this, a whole family of problems reveals itself as topological
  DP where the graph is implicit and never built:
</p>
<table>
  <tr><th>Problem</th><th>Implicit DAG</th><th>Value propagated in topo order</th></tr>
  <tr><td>Longest Increasing Path in a Matrix</td><td>cell → strictly larger neighbour</td><td>path length (memoized DFS = topo order)</td></tr>
  <tr><td>Parallel Courses</td><td>prereq → course</td><td>semester number = 1 + max over parents</td></tr>
  <tr><td>Longest String Chain</td><td>word → word with one letter added</td><td>chain length; sort by length is the topo order</td></tr>
  <tr><td>Critical path / project scheduling</td><td>task → dependent task</td><td>earliest finish time</td></tr>
  <tr><td>Counting paths s → t</td><td>the DAG itself</td><td><code>ways[v] += ways[u]</code></td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The reframe that unlocks the family</span>
  Memoized DFS on a DAG <em>is</em> a topological sort — the recursion's return
  order is exactly reverse post-order. So any DP whose subproblem dependencies
  never cycle can be written either as top-down memoization or as a bottom-up
  loop over a topological order. When someone asks you to "convert your
  recursion to iteration," what they are asking for is the topological order.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The words "prerequisite," "depends on," "must come before," "build
    order," "compile," "recipe/ingredient," or any input of ordered pairs
    <code>[a, b]</code> meaning "a then b."</li>
  <li>The question is "is this even possible?" — that is cycle detection, and a
    topological sort answers it as a side effect (emitted count &lt; n).</li>
  <li>Sorted or ranked input that implies relative order between symbols
    (Alien Dictionary, Sequence Reconstruction, Verifying an Alien Dictionary's
    harder cousins) — the edges must be <em>derived</em>, and only adjacent
    pairs at the first differing position carry information.</li>
  <li>"Minimum number of rounds/semesters/steps with unlimited parallelism" →
    Kahn, counting BFS levels. "Is the order unique?" → check whether the queue
    ever holds two nodes at once.</li>
  <li>Longest/shortest/count-of paths where the graph provably has no cycles →
    do not reach for Dijkstra or Bellman-Ford; relax edges in topological order
    for O(V + E), negative weights included.</li>
  <li>Distinguish from plain BFS/DFS: ordinary traversal visits a node the
    first time it is reached; topological sort must <em>wait</em> until every
    incoming edge is satisfied. If a node has two parents and you emit it after
    seeing only one, you have written BFS, not a topological sort.</li>
  <li>Distinguish from Union-Find: undirected connectivity and cycle detection
    in an undirected graph is Union-Find's job; direction and ordering is this
    chapter's.</li>
</ul>`,
};
