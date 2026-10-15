import type { Chapter } from "../types";

export const dsaAdvancedDp: Chapter = {
  id: "dsa-advanced-dp",
  num: "A1",
  title: "Advanced DP",
  short: "Advanced DP",
  levels: ["advanced"],
  prerequisites: ["dsa-dp-2d", "dsa-dp-state-machines"],
  practice: [
    "ex-travelling-salesman-bitmask",
    "ex-partition-k-equal-sum-subsets",
    "ex-count-strictly-increasing-digits",
    "ex-burst-balloons",
    "ex-minimum-cost-to-cut-a-stick",
    "ex-house-robber-iii",
    "ex-shortest-path-visiting-all-nodes",
    "ex-smallest-sufficient-team",
    "ex-binary-tree-cameras",
    "ex-sum-of-distances-in-tree",
    "ex-number-of-digit-one",
    "ex-minimum-score-triangulation",
    "ex-strange-printer",
    "ex-merge-stones",
    "ex-constrained-subsequence-sum",
  ],
  ready: true,
  subtitle: 'Once you can design the state, every "impossible" DP is just a normal DP over a stranger index.',
  body: `<h3>Advanced DP is not harder recursion — it's harder state design</h3>
<p>
  In the 1D and 2D chapters the state was handed to you: <code>dp[i]</code>
  "best answer using the first i items," <code>dp[i][j]</code> "best answer
  for prefixes i and j." Advanced DP is the same machine — overlapping
  subproblems, memoize, iterate in dependency order — but you have to
  <em>invent</em> the index. The four shapes below cover almost every
  advanced DP asked in interviews, and each one is defined entirely by what
  it uses as the state: a <b>subset</b> (bitmask), a <b>subtree</b> (tree
  DP), a <b>prefix of the digits of a number</b> (digit DP), or a
  <b>contiguous range</b> (interval DP).
</p>

<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="Four boxes showing the four advanced dynamic programming state types: a bitmask subset, a subtree, a digit prefix, and an interval, each labelled with its state signature">
    <g class="rough">
      <rect class="box" x="20" y="40" width="130" height="70" rx="6" />
      <rect class="boxg" x="180" y="40" width="130" height="70" rx="6" />
      <rect class="boxy" x="340" y="40" width="130" height="70" rx="6" />
      <rect class="boxr" x="500" y="40" width="120" height="70" rx="6" />
    </g>
    <text class="lbl" x="85" y="68" text-anchor="middle" style="font-size:15px">bitmask</text>
    <text class="sm" x="85" y="90" text-anchor="middle">dp[mask][last]</text>
    <text class="lbl" x="245" y="68" text-anchor="middle" style="font-size:15px">tree</text>
    <text class="sm" x="245" y="90" text-anchor="middle">dp[node][took?]</text>
    <text class="lbl" x="405" y="68" text-anchor="middle" style="font-size:15px">digit</text>
    <text class="sm" x="405" y="90" text-anchor="middle">dp[pos][tight]</text>
    <text class="lbl" x="560" y="68" text-anchor="middle" style="font-size:15px">interval</text>
    <text class="sm" x="560" y="90" text-anchor="middle">dp[l][r]</text>
    <text class="lbl" x="20" y="150" style="font-size:15px">the state answers: "what does the rest of the problem still need to know?"</text>
    <text class="sm" x="20" y="178">bitmask → which items are already used · tree → the whole subtree is summarized in a few numbers</text>
    <text class="sm" x="20" y="200">digit → how much freedom the remaining digits have · interval → this range is solved independently</text>
    <text class="sm rd" x="20" y="224">if two different paths reach the same state, they are interchangeable from here on — that is the whole test</text>
  </svg>
  <figcaption>Every one of these is the same DP; only the shape of the index changes. Pick the smallest state that still makes future decisions independent of how you arrived.</figcaption>
</figure>

<h3>Bitmask DP: an integer <em>is</em> the visited-set</h3>
<p>
  When n is small (typically n ≤ 20) and the subproblem depends on
  <em>which</em> subset of items you've used — not just how many — encode
  the subset as the bits of a single integer. Bit <code>i</code> set means
  "item i is used." That gives you 2<sup>n</sup> states you can index into
  an array directly, which is far cheaper than hashing a Set.
</p>
<table>
  <tr><th>Operation</th><th>Code</th><th>Meaning</th></tr>
  <tr><td>Is item i in the set?</td><td><code>(mask >> i) & 1</code></td><td>test bit i</td></tr>
  <tr><td>Add item i</td><td><code>mask | (1 << i)</code></td><td>set bit i</td></tr>
  <tr><td>Remove item i</td><td><code>mask & ~(1 << i)</code></td><td>clear bit i</td></tr>
  <tr><td>Full set of n items</td><td><code>(1 << n) - 1</code></td><td>n low bits set</td></tr>
  <tr><td>Iterate submasks of mask</td><td><code>for (let s = mask; s; s = (s - 1) & mask)</code></td><td>every non-empty subset of mask (the empty subset, 0, ends the loop, so handle it separately if you need it), 3<sup>n</sup> total across all masks</td></tr>
</table>
<p class="sub">
  The bit-manipulation chapter covered these operators; the new idea here is
  purely that <code>mask</code> is a legal <em>array index</em>. That is what
  turns an exponential search over subsets into a DP over 2<sup>n</sup> cells.
</p>

<div class="sticky mint">
  <span class="ttl">The ordering trick that makes bitmask DP easy</span>
  Adding an element to a subset always makes the integer <em>larger</em>
  (you set a bit that was 0). So a plain <code>for (let mask = 0; mask &lt; 1 &lt;&lt; n; mask++)</code>
  is already a valid topological order — every state you read from has a
  smaller numeric value than the state you're writing. You never need an
  explicit dependency sort.
</div>

<h3>Traveling Salesman — the canonical bitmask DP</h3>
<p>
  "Visit every city exactly once and return to the start, minimizing total
  distance." Brute force is n! orderings. The DP insight: once you know
  <em>which</em> cities are visited and <em>which one you're standing on</em>,
  the cheapest completion doesn't depend on the order you visited them in.
  That collapses n! paths into 2<sup>n</sup> × n states.
</p>
<pre><code><span class="c">// dist[i][j] = cost of edge i→j. Returns min cost of a tour starting and ending at 0.</span>
<span class="c">// Time O(2^n · n^2), space O(2^n · n) — practical to about n = 18-20.</span>
function tsp(dist) {
  const n = dist.length;
  if (n &lt;= 1) return 0; <span class="c">// no other city to visit: the tour costs nothing</span>
  const FULL = (1 << n) - 1;

  <span class="c">// dp[mask][last] = cheapest way to have visited exactly the set "mask", standing on "last"</span>
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0; <span class="c">// only city 0 visited, standing on city 0, cost 0</span>

  for (let mask = 1; mask &lt;= FULL; mask++) {
    if ((mask & 1) === 0) continue; <span class="c">// every tour includes the start city</span>

    for (let last = 0; last &lt; n; last++) {
      const cur = dp[mask][last];
      if (cur === Infinity) continue;        <span class="c">// unreachable state — skip, don't propagate Infinity</span>
      if (((mask >> last) & 1) === 0) continue; <span class="c">// "last" must actually be in the visited set</span>

      for (let next = 0; next &lt; n; next++) {
        if ((mask >> next) & 1) continue;    <span class="c">// already visited</span>
        const nextMask = mask | (1 << next);
        const cost = cur + dist[last][next];
        if (cost &lt; dp[nextMask][next]) dp[nextMask][next] = cost;
      }
    }
  }

  let best = Infinity;
  for (let last = 1; last &lt; n; last++) {
    best = Math.min(best, dp[FULL][last] + dist[last][0]); <span class="c">// close the loop back to 0</span>
  }
  return best;
}</code></pre>
<h4>Dry run: tsp([[0,10,15],[10,0,20],[15,20,0]])</h4>
<table>
  <tr><th>mask</th><th>last</th><th>action</th><th>result</th></tr>
  <tr><td>001 (city 0 visited)</td><td>0</td><td>base case</td><td>dp[001][0] = 0</td></tr>
  <tr><td>001</td><td>0</td><td>try next=1: cost 0+10</td><td>dp[011][1] = 10</td></tr>
  <tr><td>001</td><td>0</td><td>try next=2: cost 0+15</td><td>dp[101][2] = 15</td></tr>
  <tr><td>011 (0,1 visited)</td><td>1</td><td>try next=2: cost 10+20</td><td>dp[111][2] = 30</td></tr>
  <tr><td>101 (0,2 visited)</td><td>2</td><td>try next=1: cost 15+20</td><td>dp[111][1] = 35</td></tr>
  <tr><td>111 (full)</td><td>1, 2</td><td>every next already visited</td><td>nothing new relaxed</td></tr>
</table>
<p class="sub">
  Closing the loop: dp[111][1] + dist[1][0] = 35 + 10 = 45, and dp[111][2] + dist[2][0]
  = 30 + 15 = 45 — the two candidate tours tie because a 3-city graph has only one
  cycle, walked in either direction. Notice mask only ever grows across the run
  (001 → 011/101 → 111): that's the "no dependency sort needed" property from the
  sticky note above, made concrete.
</p>
<p class="sub">
  Two variants come up constantly. Drop the final <code>+ dist[last][0]</code>
  and you get the shortest Hamiltonian <em>path</em> ("Shortest Path Visiting
  All Nodes"). Replace <code>Math.min</code> with a sum and you're
  <em>counting</em> orderings instead of optimizing them — same states, same
  loops, different combiner.
</p>

<div class="warn">
  <span class="ttl">⚠ 1 &lt;&lt; n overflows the trick, not the language</span>
  JavaScript's bitwise operators coerce to <b>32-bit signed</b> integers, so
  <code>1 &lt;&lt; 31</code> is negative and <code>1 &lt;&lt; 32</code> is
  <code>1</code>, silently. That's fine for n ≤ 30, but it's also a hard
  ceiling worth stating out loud: bitmask DP is for n ≤ ~20 anyway, because
  2<sup>20</sup> × 20 is already 20M cells. If an interviewer gives you n = 40,
  bitmask is the wrong tool — look for meet-in-the-middle instead.
</div>

<h3>Bitmask DP without a "last" dimension — the assignment problem</h3>
<p>
  Not every bitmask DP needs a second dimension. If the k-th decision is
  always "assign worker k," then the number of bits already set
  <em>tells you</em> which worker you're on — the popcount is a free index,
  so the state collapses to a single 1D array of size 2<sup>n</sup>.
</p>
<pre><code><span class="c">// cost[w][j] = cost of giving job j to worker w. Assign every worker exactly one job.</span>
function minAssignmentCost(cost) {
  const n = cost.length;
  const FULL = (1 << n) - 1;
  const dp = new Array(1 << n).fill(Infinity);
  dp[0] = 0;

  for (let mask = 0; mask &lt; FULL; mask++) {
    if (dp[mask] === Infinity) continue;
    const worker = popcount(mask); <span class="c">// jobs assigned so far === index of the next worker</span>

    for (let job = 0; job &lt; n; job++) {
      if ((mask >> job) & 1) continue;
      const nextMask = mask | (1 << job);
      const cost2 = dp[mask] + cost[worker][job];
      if (cost2 &lt; dp[nextMask]) dp[nextMask] = cost2;
    }
  }
  return dp[FULL];
}

function popcount(x) {
  let c = 0;
  while (x) { x &= x - 1; c++; } <span class="c">// x &= x-1 clears the lowest set bit</span>
  return c;
}</code></pre>
<p class="sub">
  Recognizing that a dimension is <em>derivable</em> from the mask is a real
  optimization, not cosmetics: it takes the table from O(2<sup>n</sup>·n) to
  O(2<sup>n</sup>) memory. Say it out loud when you spot it.
</p>

<h3>Bitmask DP when you may revisit: Shortest Path Visiting All Nodes</h3>
<p>
  TSP's DP rests on one fact: every city is entered exactly once, so the mask
  only ever grows and the loop <code>for mask = 0 upward</code> is a valid
  order. Now change one rule. "Given a connected undirected graph with n ≤ 12
  nodes, return the length of the shortest walk that visits every node. You
  may start anywhere, revisit nodes, and reuse edges." The state is still
  <code>(node you stand on, set of nodes seen)</code>, but a step to a node you
  have already seen leaves the mask unchanged. From <code>(1, 0011)</code> you
  can reach <code>(0, 0011)</code> and then <code>(1, 0011)</code> again, so
  the states contain cycles and no loop over masks puts every dependency
  before its user.
</p>
<p>
  Every edge costs 1, and "shortest sequence of moves between states" is
  exactly what <b>BFS</b> computes. So keep the same state, drop the table of
  costs, and run a BFS over the state graph. Seed it with every node at once,
  each with only its own bit set, because the walk may start anywhere. The
  first time any state with a full mask appears, the number of steps taken is
  the answer. A <code>seen[node][mask]</code> table guarantees each of the
  n · 2<sup>n</sup> states is expanded at most once.
</p>
<pre><code>function shortestPathLength(graph) {
  const n = graph.length;
  if (n === 1) return 0;
  const FULL = (1 &lt;&lt; n) - 1;
  const seen = Array.from({ length: n }, () => new Uint8Array(1 &lt;&lt; n)); <span class="c">// seen[node][mask]</span>

  let frontier = [];
  for (let i = 0; i &lt; n; i++) {
    frontier.push([i, 1 &lt;&lt; i]); <span class="c">// start anywhere, having visited only that node</span>
    seen[i][1 &lt;&lt; i] = 1;
  }

  for (let steps = 0; frontier.length > 0; steps++) {
    const next = [];
    for (const [node, mask] of frontier) {
      for (const nb of graph[node]) {
        const nextMask = mask | (1 &lt;&lt; nb);
        if (nextMask === FULL) return steps + 1; <span class="c">// first time any state sees every node</span>
        if (seen[nb][nextMask]) continue;
        seen[nb][nextMask] = 1;
        next.push([nb, nextMask]);
      }
    }
    frontier = next;
  }
  return -1;
}</code></pre>
<h4>Dry run: the star graph [[1,2,3],[0],[0],[0]] (node 0 in the middle, leaves 1, 2, 3)</h4>
<table>
  <tr><th>Level</th><th>States in the frontier (node, mask)</th><th>What happened</th></tr>
  <tr><td>0</td><td>(0,0001) (1,0010) (2,0100) (3,1000)</td><td>the four starting states, one per node</td></tr>
  <tr><td>1</td><td>(1,0011) (2,0101) (3,1001) (0,0011) (0,0101) (0,1001)</td><td>each leaf walks to the centre, the centre walks to each leaf</td></tr>
  <tr><td>2</td><td>(2,0111) (3,1011) (1,0111) (3,1101) (1,1011) (2,1101)</td><td>three nodes seen; the walk is at a leaf again</td></tr>
  <tr><td>3</td><td>(0,0111) (0,1011) (0,1101)</td><td>back at the centre with three nodes seen</td></tr>
  <tr><td>4</td><td>—</td><td>expanding level 3 reaches mask 1111, so the answer is 3 + 1 = 4</td></tr>
</table>
<p class="sub">
  The winning walk is 1 → 0 → 2 → 0 → 3: four edges, with node 0 visited twice.
  A TSP-style DP that forbids revisits would find no such walk, which is the
  whole reason this problem is a BFS and not a loop over masks.
</p>
<p>
  <b>Complexity.</b> There are n · 2<sup>n</sup> states and each is expanded
  once, looping over its node's neighbours. Summed over the nodes the
  neighbour counts add up to 2E, so the time is O(2<sup>n</sup> · (n + E)),
  and the <code>seen</code> table takes O(n · 2<sup>n</sup>) space. An
  equivalent route is to run Floyd-Warshall first to get all-pairs distances,
  then use the TSP path DP over those distances: with the shortest distances
  already baked in, revisiting a node is just a longer hop between two new
  nodes. It costs O(2<sup>n</sup> · n<sup>2</sup>) and is a fine second answer
  when the interviewer asks for a different method.
</p>
<div class="warn">
  <span class="ttl">⚠ Four ways this BFS goes wrong</span>
  Seeding only node 0 gives the best walk <em>from node 0</em>, not the best
  walk. Marking a state as seen when you pop it instead of when you push it
  lets the same state enter the queue many times. Forgetting the
  <code>n === 1</code> case returns -1 for a graph that
  needs no moves at all. And testing <code>nextMask === FULL</code> only after
  pushing is harmless here, but returning <code>steps</code> instead of
  <code>steps + 1</code> is off by one, because the step that completes the
  mask has not been counted yet.
</div>

<h3>Masking the small dimension: Smallest Sufficient Team</h3>
<p>
  "There are up to 16 required skills and up to 60 people, each with a set of
  skills. Pick the fewest people whose skills together cover every required
  skill." The bitmask instinct is to mask over people, but 2<sup>60</sup> states
  is impossible. Look for the dimension that is <em>small</em>: the skills.
  Let <code>mask</code> be the set of required skills covered so far, and let
  <code>best[mask]</code> be the smallest team found whose skills together are
  exactly those. Each person is a 0/1 item that turns <code>mask</code> into
  <code>mask | personMask</code>, so this is 0/1 knapsack where the "weight" is a
  set of skills and the "value" is a head count.
</p>
<pre><code>function smallestSufficientTeam(reqSkills, people) {
  const bitOf = new Map(reqSkills.map((skill, i) => [skill, i]));
  const FULL = (1 &lt;&lt; reqSkills.length) - 1;

  const best = new Array(FULL + 1).fill(null); <span class="c">// best[mask] = smallest list of people whose skills are exactly mask</span>
  best[0] = [];

  for (let i = 0; i &lt; people.length; i++) {
    let personMask = 0;
    for (const skill of people[i]) if (bitOf.has(skill)) personMask |= 1 &lt;&lt; bitOf.get(skill);
    if (personMask === 0) continue;

    for (let mask = 0; mask &lt;= FULL; mask++) {
      if (best[mask] === null) continue;
      const nextMask = mask | personMask;
      if (nextMask === mask) continue; <span class="c">// this person adds nothing here (this also stops reuse of person i)</span>
      if (best[nextMask] === null || best[mask].length + 1 &lt; best[nextMask].length) {
        best[nextMask] = [...best[mask], i];
      }
    }
  }
  return best[FULL];
}</code></pre>
<p>
  Two details deserve a sentence each. First, the guard
  <code>nextMask === mask</code> skips a person who adds nothing, and it also
  is what stops one person being used twice: if the update for person
  <code>i</code> has just written <code>best[nextMask]</code>, reading it again
  with the same person gives <code>nextMask | personMask === nextMask</code>
  and does nothing. So no snapshot of the table is needed, unlike the bounded
  Bellman-Ford in the graph algorithms chapter. Second, people with none of the
  required skills are dropped at the top; they can never help.
</p>
<h4>Dry run: skills [java, nodejs, reactjs], people [java], [nodejs], [nodejs, reactjs]</h4>
<table>
  <tr><th>Person</th><th>personMask</th><th>Updates to best[...]</th></tr>
  <tr><td>0 (java)</td><td>001</td><td>best[001] = [0]</td></tr>
  <tr><td>1 (nodejs)</td><td>010</td><td>best[010] = [1] and best[011] = [0, 1]</td></tr>
  <tr><td>2 (nodejs, reactjs)</td><td>110</td><td>best[110] = [2], then best[111] = [0, 2]; the later offers [1, 2] and [0, 1, 2] are not shorter, so they are dropped</td></tr>
</table>
<p class="sub">
  The answer is <code>best[111]</code> = [0, 2]: two people. Time is
  O(P · 2<sup>S</sup>) transitions for P people and S skills, and each
  improvement copies a team of at most S people, so O(P · 2<sup>S</sup> · S)
  in the worst case. Storing only the team size plus a parent pointer per mask
  removes that copy and brings it to O(P · 2<sup>S</sup>), at the price of one
  extra walk to rebuild the team.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I can't mask the people, 2 to the
  60 is far too many, but there are at most 16 skills, so I'll mask those.
  best[mask] is the smallest team whose skills are exactly that set.
  Each person is a knapsack item that ORs their skills into the mask, and
  I take a new team only when it is strictly smaller."
</div>

<h3>DP on trees: the subtree is the subproblem</h3>
<p>
  On a tree there are no cycles, so a post-order DFS visits every subproblem
  exactly once — you don't even need a memo table, the recursion tree
  <em>is</em> the DP table. The whole design question is: <b>what summary of a
  subtree does the parent need?</b> Usually it's a small tuple, and the
  classic shape is a pair: "best if I take this node" and "best if I don't."
</p>
<pre><code><span class="c">// House Robber III — can't rob a node and its child. Returns max loot.</span>
function rob(root) {
  <span class="c">// returns [bestIfWeRobThisNode, bestIfWeSkipThisNode]</span>
  function dfs(node) {
    if (!node) return [0, 0];

    const [leftRob, leftSkip] = dfs(node.left);
    const [rightRob, rightSkip] = dfs(node.right);

    const robHere = node.val + leftSkip + rightSkip;  <span class="c">// children must be skipped</span>
    const skipHere = Math.max(leftRob, leftSkip) + Math.max(rightRob, rightSkip); <span class="c">// children are free</span>

    return [robHere, skipHere];
  }
  const [a, b] = dfs(root);
  return Math.max(a, b);
}</code></pre>
<p class="sub">
  Note <code>skipHere</code> takes the max of each child independently — a
  common wrong version writes <code>leftSkip + rightSkip</code>, quietly
  forbidding grandchildren from being robbed. The pair-return shape makes
  that mistake visible because each slot has a stated meaning.
</p>

<h3>The two-value trick: what you return upward ≠ what you record</h3>
<p>
  Diameter and "maximum path sum" share one subtle idea that trips people up:
  the best answer <em>through</em> a node (using both children) is not a value
  the parent can use, because a parent can only extend a path that goes
  <em>straight down</em> one side. So you record the two-sided value in an
  outer variable and return the one-sided value.
</p>
<pre><code><span class="c">// Binary Tree Maximum Path Sum — path may start and end anywhere, values may be negative.</span>
function maxPathSum(root) {
  let best = -Infinity;

  <span class="c">// returns the best DOWNWARD path sum starting at this node (usable by the parent)</span>
  function gain(node) {
    if (!node) return 0;

    const left = Math.max(gain(node.left), 0);   <span class="c">// clamp at 0: a negative branch is never worth taking</span>
    const right = Math.max(gain(node.right), 0);

    best = Math.max(best, node.val + left + right); <span class="c">// record the path that TURNS here — two-sided</span>

    return node.val + Math.max(left, right);        <span class="c">// return the path that CONTINUES up — one-sided</span>
  }

  gain(root);
  return best;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Returning the two-sided value is the bug that passes small tests</span>
  If <code>gain</code> returned <code>node.val + left + right</code>, the
  parent would splice in a path that already bends — producing a "path" that
  visits a node twice. It happens to give the right answer on tiny symmetric
  trees, which is exactly why it survives your hand-check and dies on the
  hidden tests. Diameter (<code>best = max(best, left + right)</code>, return
  <code>1 + max(left, right)</code>) is the same skeleton with edge counts.
</div>
<div class="warn">
  <span class="ttl">⚠ Recursion depth on a 10<sup>5</sup>-node skewed tree</span>
  Tree DP recurses to the tree's height. A degenerate (linked-list-shaped)
  tree or a general graph-as-tree with 10<sup>5</sup> nodes will overflow the
  JS call stack. If constraints hint at that, do an explicit iterative
  post-order: push nodes in DFS order into an array, then process that array
  in reverse — every child is finished before its parent.
</div>

<h3>Three states per node: Binary Tree Cameras</h3>
<p>
  "Install the fewest cameras on the nodes of a binary tree so that every node
  is watched. A camera watches its own node, its parent and its children."
  House Robber III needed two numbers per subtree because each node was either
  taken or not. Here ask the usual question: <b>what does a parent need to
  know about a finished subtree?</b> Not the whole picture, only whether the
  subtree's root is looked after, because that decides what the parent must do.
  There are exactly three cases worth distinguishing, and in all three every
  node strictly below the root is already covered.
</p>
<table>
  <tr><th>State</th><th>Meaning for the subtree root</th><th>What it forces on the parent</th></tr>
  <tr><td><code>cam</code></td><td>has a camera</td><td>nothing; the camera also covers the parent</td></tr>
  <tr><td><code>cov</code></td><td>no camera, but a child's camera covers it</td><td>nothing; but the parent gets no help from it</td></tr>
  <tr><td><code>need</code></td><td>no camera and not covered</td><td>the parent must hold a camera, or the tree is not covered</td></tr>
</table>
<p>
  Each state's cost is the fewest cameras in that subtree, and each recurrence
  is a choice among the children's states:
</p>
<ul>
  <li><b>cam:</b> put a camera here, so each child may be in <em>any</em> state. The child that is <code>need</code> is rescued by this camera. Cost: <code>1 + min(all of left) + min(all of right)</code>.</li>
  <li><b>cov:</b> no camera here, so each child must look after itself (<code>cam</code> or <code>cov</code>; <code>need</code> would stay uncovered), and at least one child must have a camera to cover this node. Cost: the cheaper of "left has a camera, right is cam or cov" and the mirror image.</li>
  <li><b>need:</b> no camera here and no camera below that touches this node, so both children are <code>cov</code>. Cost: <code>left.cov + right.cov</code>.</li>
</ul>
<p>
  A missing child is the base case: it can never hold a camera
  (<code>cam = Infinity</code>), it never needs rescuing
  (<code>need = Infinity</code>), and it counts as already looked after
  (<code>cov = 0</code>). That last value is what lets a node with one child
  work without special cases. The root has no parent to rescue it, so the
  answer is <code>min(cam, cov)</code>, never <code>need</code>.
</p>
<pre><code>function minCameraCover(root) {
  const INF = Infinity;

  function dfs(node) {
    if (!node) return { cam: INF, cov: 0, need: INF }; <span class="c">// null: no camera possible, nothing to cover</span>

    const L = dfs(node.left);
    const R = dfs(node.right);

    const cam = 1 + Math.min(L.cam, L.cov, L.need) + Math.min(R.cam, R.cov, R.need);
    const cov = Math.min(L.cam + Math.min(R.cam, R.cov), R.cam + Math.min(L.cam, L.cov));
    const need = L.cov + R.cov;

    return { cam, cov, need };
  }

  const { cam, cov } = dfs(root);
  return Math.min(cam, cov);
}</code></pre>
<h4>Dry run: root r with a single left child a, and a has two leaves b and c</h4>
<table>
  <tr><th>Node</th><th>cam</th><th>cov</th><th>need</th><th>Why</th></tr>
  <tr><td>b (leaf)</td><td>1</td><td>∞</td><td>0</td><td>a leaf has no child that could watch it, so it can only hold a camera or wait for its parent</td></tr>
  <tr><td>c (leaf)</td><td>1</td><td>∞</td><td>0</td><td>same as b</td></tr>
  <tr><td>a</td><td>1</td><td>2</td><td>∞</td><td>cam: 1 + min(b) + min(c) = 1 + 0 + 0. cov: one leaf holds a camera and the other must be cam or cov, so 1 + 1. need is impossible because the leaves are not cov</td></tr>
  <tr><td>r</td><td>2</td><td>1</td><td>2</td><td>the missing right child is (∞, 0, ∞). cam: 1 + min(1, 2, ∞) + 0 = 2. cov: a holds a camera and the missing child is fine, 1 + 0 = 1</td></tr>
</table>
<p class="sub">
  The answer is <code>min(2, 1) = 1</code>: a single camera on a covers a, b,
  c and r. Time is O(n) for n nodes and space is the recursion depth.
  A well-known greedy (put cameras on the parents of leaves, bottom-up) is
  this DP with the states squeezed into one return code; the DP is what
  proves the greedy right, and it is the one to derive in an interview if you
  cannot remember the greedy's rules.
</p>
<div class="warn">
  <span class="ttl">⚠ Do not let the root end up in the "need" state</span>
  A root that is <code>need</code> is a node nobody watches. Taking
  <code>Math.min(cam, cov, need)</code> at the root is the single most common
  wrong answer, and it passes many small tests.
  The test that exposes it is a tree with one node: the right answer is 1,
  and <code>need</code> there is 0.
</div>

<h3>Rerooting: the answer for every node as the root</h3>
<p>
  "Given a tree with n nodes, return an array where entry i is the sum of the
  distances from node i to every other node." Running a BFS from each node is
  O(n²). Rerooting does it in O(n) with a trick that applies whenever the
  question is "the answer if <em>this</em> node were the root, for every node."
</p>
<p>
  <b>Step one: solve it for one root.</b> Root the tree at node 0. For each
  node u let <code>count[u]</code> be the number of nodes in its subtree
  (including u) and <code>down[u]</code> the sum of distances from u to the
  nodes <em>inside</em> its subtree. A child c sits one edge below its parent
  p, so every one of its <code>count[c]</code> nodes is one farther from p
  than from c: <code>down[p] = sum over children c of (down[c] + count[c])</code>.
  One post-order pass gives <code>down[0]</code>, which is the answer for node
  0.
</p>
<p>
  <b>Step two: move the root across one edge.</b> Suppose you know the answer
  for p and want it for its child u. Moving the root from p to u brings the
  <code>count[u]</code> nodes inside u's subtree one step closer, and pushes
  the other <code>n - count[u]</code> nodes one step farther away. So
</p>
<pre><code>ans[u] = ans[p] - count[u] + (n - count[u])</code></pre>
<p>
  A pre-order pass from the root applies this to every node. The two passes
  cost O(n) together. The code below does both without recursion, by
  recording an <code>order</code> in which every node comes after its parent
  and then walking that array backwards for the first pass and forwards for the
  second.
</p>
<pre><code>function sumOfDistancesInTree(n, edges) {
  const adj = Array.from({ length: n }, () => []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  const parent = new Array(n).fill(-1);
  const order = []; <span class="c">// every node appears after its parent</span>
  const stack = [0];
  while (stack.length > 0) {
    const u = stack.pop();
    order.push(u);
    for (const v of adj[u]) {
      if (v !== parent[u]) {
        parent[v] = u;
        stack.push(v);
      }
    }
  }

  const count = new Array(n).fill(1); <span class="c">// nodes in the subtree of u</span>
  const down = new Array(n).fill(0); <span class="c">// sum of distances from u to its own subtree</span>
  for (let i = n - 1; i > 0; i--) {
    const u = order[i], p = parent[u];
    count[p] += count[u];
    down[p] += down[u] + count[u]; <span class="c">// every node under u is one edge farther from p</span>
  }

  const ans = new Array(n).fill(0);
  ans[0] = down[0];
  for (let i = 1; i &lt; n; i++) {
    const u = order[i], p = parent[u];
    ans[u] = ans[p] - count[u] + (n - count[u]); <span class="c">// reroot from p to u</span>
  }
  return ans;
}</code></pre>
<h4>Dry run: n = 6, edges 0-1, 0-2, 2-3, 2-4, 2-5</h4>
<table>
  <tr><th>Pass</th><th>Step</th><th>count (nodes 0..5)</th><th>down (nodes 0..5)</th></tr>
  <tr><td>up</td><td>node 1 into 0</td><td>[2, 1, 1, 1, 1, 1]</td><td>[1, 0, 0, 0, 0, 0]</td></tr>
  <tr><td>up</td><td>node 3 into 2</td><td>[2, 1, 2, 1, 1, 1]</td><td>[1, 0, 1, 0, 0, 0]</td></tr>
  <tr><td>up</td><td>nodes 4 and 5 into 2</td><td>[2, 1, 4, 1, 1, 1]</td><td>[1, 0, 3, 0, 0, 0]</td></tr>
  <tr><td>up</td><td>node 2 into 0</td><td>[6, 1, 4, 1, 1, 1]</td><td>[8, 0, 3, 0, 0, 0]</td></tr>
</table>
<table>
  <tr><th>Pass</th><th>Node</th><th>Formula</th><th>ans[node]</th></tr>
  <tr><td>start</td><td>0</td><td>ans[0] = down[0]</td><td>8</td></tr>
  <tr><td>down</td><td>2</td><td>8 - 4 + (6 - 4)</td><td>6</td></tr>
  <tr><td>down</td><td>3, 4, 5</td><td>6 - 1 + (6 - 1), each</td><td>10</td></tr>
  <tr><td>down</td><td>1</td><td>8 - 1 + (6 - 1)</td><td>12</td></tr>
</table>
<p class="sub">
  The result in node order is [8, 12, 6, 10, 10, 10]. As a spot check, node 2
  is one edge from 0, 3, 4 and 5 and two edges from 1: 1 + 1 + 1 + 1 + 2 = 6.
</p>
<p>
  <b>The general template.</b> Rerooting is "one pass to collect what lives
  below, one pass to hand down what lives above." For sums of distances the
  only information that crosses an edge is <code>count</code>. For other
  questions (the farthest node from each node, the longest path through each
  node, the tree's centre) the downward pass hands down the best value
  <em>excluding the child's own branch</em>, which is why those versions keep
  the top two branch values per node. If a problem asks for a per-node answer
  over a tree, ask whether moving the root across one edge changes the answer
  by something you already have.
</p>
<div class="warn">
  <span class="ttl">⚠ Pitfalls specific to rerooting</span>
  Applying the formula in the wrong order (a child before its parent has its
  answer) reads a zero. Using <code>count[p]</code> where it should be
  <code>count[u]</code> corrupts the answer for every node but the root; check
  against the three-node path 0-1-2, whose answers are [3, 2, 3]. A recursive
  version overflows the call stack on a path of 10<sup>5</sup> nodes, so build
  <code>order</code> with an explicit stack as above. The sums themselves stay
  exact in a JavaScript number: a path of 10<sup>5</sup> nodes totals about
  5 · 10<sup>9</sup>, far below 2<sup>53</sup>.
</div>

<h3>Digit DP: counting numbers up to N with a property</h3>
<p>
  "How many integers in [1, N] have no two adjacent equal digits?" with N up
  to 10<sup>18</sup>. You cannot loop to N. Instead, build the number one
  digit at a time from the most significant end and count completions. Two
  bookkeeping flags carry all the difficulty:
</p>
<ul>
  <li><b>tight</b> — every digit so far matched N's prefix exactly, so this
  position is capped at N's digit. Once you place something smaller, you're
  free (<code>tight</code> becomes false) and all remaining positions allow 0-9.</li>
  <li><b>started</b> — you've placed a nonzero digit. Before that you're in
  leading zeros, which must not count as digits (otherwise "07" looks like it
  has an adjacent-pair rule applied to a zero that isn't there).</li>
</ul>
<pre><code><span class="c">// Count integers in [1, N] with no two adjacent equal digits.</span>
function countNoAdjacentRepeats(N) {
  const digits = String(N).split("").map(Number);
  const n = digits.length;
  const memo = new Map();

  function go(pos, prev, tight, started) {
    if (pos === n) return started ? 1n : 0n; <span class="c">// the all-zeros path is the number 0 — don't count it</span>

    <span class="c">// Only memoize the FREE states: a tight state is visited at most once per position anyway,</span>
    <span class="c">// and its count depends on N's digits, so caching it would be wrong to reuse.</span>
    const key = pos * 100 + (prev + 1) * 2 + (started ? 1 : 0);
    if (!tight && memo.has(key)) return memo.get(key);

    const limit = tight ? digits[pos] : 9;
    let total = 0n;

    for (let d = 0; d &lt;= limit; d++) {
      if (started && d === prev) continue; <span class="c">// the actual property being enforced</span>
      total += go(
        pos + 1,
        d,
        tight && d === limit,      <span class="c">// stay tight only if we matched N's digit exactly</span>
        started || d > 0
      );
    }

    if (!tight) memo.set(key, total);
    return total;
  }

  return go(0, -1, true, false);
}</code></pre>
<p class="sub">
  Complexity is O(positions × states-per-position × 10) — here 19 × 11 × 10,
  about two thousand operations for N = 10<sup>18</sup> (the 11 states are
  "not started" or "started with previous digit 0-9"). The counts are
  <code>BigInt</code> because the answer for N near 10<sup>18</sup> passes
  2<sup>53</sup>, where ordinary numbers stop being exact; pass N as a
  <code>BigInt</code> too, as in <code>10n ** 18n</code>. To count in a range
  <code>[L, R]</code>, compute <code>f(R) - f(L - 1n)</code>; that subtraction
  is the standard closing move and interviewers expect you to name it.
</p>
<div class="warn">
  <span class="ttl">⚠ Memoizing tight states is the classic digit-DP bug</span>
  A tight state's answer is a function of N's remaining digits, not just
  <code>(pos, prev)</code>. Cache it and a later, non-tight visit to the same
  <code>(pos, prev)</code> reads a value that was capped by N — an undercount
  that only shows on some inputs. The guard is one condition:
  <code>if (!tight)</code> on both read and write.
</div>

<h3>More digit DP: when the state is a running count</h3>
<p>
  The adjacent-repeat problem asked "does this number have the property?" and
  needed <code>prev</code> and <code>started</code> in the state. Other digit
  problems ask for a <em>total</em>: how many times does the digit 1 appear
  when you write out every number from 1 to n? "Number of Digit One" has the
  answer 6 for n = 13 (1, 10, 11 twice, 12, 13). The state gains one more
  dimension, the number of ones placed so far, and the base case adds that
  count to the total instead of returning 1.
</p>
<pre><code>function countDigitOne(n) {
  if (n &lt;= 0) return 0;
  const digits = String(n).split("").map(Number);
  const len = digits.length;
  const memo = new Map();

  function go(pos, ones, tight) {
    if (pos === len) return ones; <span class="c">// this finished number contains "ones" ones</span>
    const key = pos * 32 + ones;
    if (!tight &amp;&amp; memo.has(key)) return memo.get(key);

    const limit = tight ? digits[pos] : 9;
    let total = 0;
    for (let d = 0; d &lt;= limit; d++) {
      total += go(pos + 1, ones + (d === 1 ? 1 : 0), tight &amp;&amp; d === limit);
    }
    if (!tight) memo.set(key, total);
    return total;
  }

  return go(0, 0, true);
}</code></pre>
<p>
  Notice what is missing: there is no <code>started</code> flag. Leading zeros
  are harmless here because a zero never adds a one, so "007" and "7" count the
  same. Ask of every digit DP whether the extra flag changes the answer; keep
  it only when it does. The memo is keyed by
  <code>(pos, ones)</code> and still skips tight states, for the reason given
  above.
</p>
<h4>Dry run: n = 13, digits [1, 3]</h4>
<table>
  <tr><th>First digit</th><th>Tight?</th><th>Second digit range</th><th>Numbers written</th><th>Ones contributed</th></tr>
  <tr><td>0</td><td>no, below 1</td><td>0 to 9</td><td>00 to 09</td><td>1 (only "01")</td></tr>
  <tr><td>1</td><td>yes, matches n</td><td>0 to 3</td><td>10, 11, 12, 13</td><td>1 + 2 + 1 + 1 = 5</td></tr>
</table>
<p class="sub">
  Total 1 + 5 = 6. For n = 2147483647 the same code returns 2971027783 almost
  instantly: there are 10 positions, at most 11 values of <code>ones</code>,
  and 10 digits per state, so roughly O(L<sup>2</sup> · 10) work for an
  L-digit number. That answer is still an exact JavaScript number; for bounds
  near 10<sup>18</sup> switch to <code>BigInt</code>, as in the first digit
  DP.
</p>

<h3>Digit DP where the free tail collapses to a power: Digit Set</h3>
<p>
  "Given a sorted list of allowed digits such as <code>["1","3","5","7"]</code>,
  count the positive integers up to n that can be written using only those
  digits." Here every free position has the same number of choices, k, so
  the memo table would hold nothing but powers of k. The DP collapses into
  arithmetic along the single tight path.
</p>
<ul>
  <li><b>Shorter numbers</b> are all below n, and any digits may fill them: <code>k + k² + … + k<sup>L-1</sup></code> of them, for an L-digit n.</li>
  <li><b>Same length:</b> walk n's digits from the left. At position i, each allowed digit strictly smaller than n's digit puts the number below n, and the remaining <code>L - i - 1</code> positions are free: <code>smaller · k<sup>L-i-1</sup></code> numbers.</li>
  <li><b>Staying tight</b> needs n's own digit to be allowed. If it is not, nothing longer is possible and the walk stops. If the walk gets through all L digits, n itself is buildable, so add 1.</li>
</ul>
<pre><code>function atMostNGivenDigitSet(digits, n) {
  const s = String(n);
  const L = s.length, k = digits.length;

  let count = 0;
  for (let len = 1; len &lt; L; len++) count += k ** len; <span class="c">// every shorter number is automatically below n</span>

  for (let i = 0; i &lt; L; i++) {
    let smaller = 0, hasSame = false;
    for (const d of digits) {
      if (d &lt; s[i]) smaller++;
      else if (d === s[i]) hasSame = true;
    }
    count += smaller * k ** (L - i - 1); <span class="c">// go below n here, the L-i-1 tail digits are free</span>
    if (!hasSame) return count;          <span class="c">// cannot copy n's digit, so the tight path ends</span>
  }
  return count + 1; <span class="c">// the tight path survived all L digits: n itself is buildable</span>
}</code></pre>
<h4>Dry run: digits {1, 3, 5, 7}, n = 100</h4>
<table>
  <tr><th>Step</th><th>Work</th><th>Running count</th></tr>
  <tr><td>shorter lengths</td><td>4<sup>1</sup> + 4<sup>2</sup> = 4 + 16</td><td>20</td></tr>
  <tr><td>i = 0, n's digit "1"</td><td>no allowed digit is below "1"; "1" is allowed, stay tight</td><td>20</td></tr>
  <tr><td>i = 1, n's digit "0"</td><td>no allowed digit is below "0"; "0" is not allowed, stop</td><td>20</td></tr>
</table>
<p class="sub">
  The answer is 20. The only 3-digit number that is not above n is 100 itself,
  and it contains a 0, which is not allowed. Time is
  O(L · k); it is the digit DP that needs no table at all.
</p>
<div class="warn">
  <span class="ttl">⚠ The three easy-to-miss terms</span>
  Leaving out the shorter numbers undercounts for any n with more than one
  digit. Leaving out the final <code>+ 1</code> undercounts exactly when n is
  itself made of allowed digits (try digits {7} and n = 7). And comparing a
  digit string to a number (<code>"3" &lt; 5</code>) works by coercion, which
  hides a type mix-up that fails the moment someone passes numbers for one and
  strings for the other; keep both as strings.
</div>

<h3>Interval DP: solve short ranges first, and pick the <em>last</em> move</h3>
<p>
  When the answer for <code>[l, r]</code> is built from answers for strictly
  shorter ranges inside it, iterate by <b>increasing length</b>, not by index.
  The design trick that makes these problems click is choosing the right
  split point semantics: for matrix chain multiplication you pick the last
  multiplication; for Burst Balloons you pick the <em>last balloon to pop</em>,
  because that's the only choice under which the two sides become independent.
</p>

<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="A triangular table showing interval DP filled by increasing range length, with length-one cells on the bottom row and the full range at the top">
    <g class="rough">
      <rect class="box" x="40" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="130" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="220" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="310" y="140" width="70" height="40" rx="4" />
      <rect class="boxy" x="85" y="90" width="70" height="40" rx="4" />
      <rect class="boxy" x="175" y="90" width="70" height="40" rx="4" />
      <rect class="boxy" x="265" y="90" width="70" height="40" rx="4" />
      <rect class="boxg" x="130" y="40" width="70" height="40" rx="4" />
      <rect class="boxg" x="220" y="40" width="70" height="40" rx="4" />
    </g>
    <text class="sm" x="75" y="165" text-anchor="middle">[0,0]</text>
    <text class="sm" x="165" y="165" text-anchor="middle">[1,1]</text>
    <text class="sm" x="255" y="165" text-anchor="middle">[2,2]</text>
    <text class="sm" x="345" y="165" text-anchor="middle">[3,3]</text>
    <text class="sm" x="120" y="115" text-anchor="middle">[0,1]</text>
    <text class="sm" x="210" y="115" text-anchor="middle">[1,2]</text>
    <text class="sm" x="300" y="115" text-anchor="middle">[2,3]</text>
    <text class="sm" x="165" y="65" text-anchor="middle">[0,2]</text>
    <text class="sm" x="255" y="65" text-anchor="middle">[1,3]</text>
    <text class="lbl" x="410" y="160" style="font-size:15px">length 1 — base cases</text>
    <text class="lbl" x="410" y="112" style="font-size:15px">length 2 — needs length 1</text>
    <text class="lbl gr" x="410" y="62" style="font-size:15px">length 3 — needs 1 and 2</text>
    <text class="sm rd" x="40" y="30">outer loop is LENGTH, not index — that is the whole ordering rule</text>
  </svg>
  <figcaption>Every cell only reads cells strictly below it, so filling by increasing length guarantees dependencies are ready.</figcaption>
</figure>

<pre><code><span class="c">// Burst Balloons: popping balloon i earns nums[left] * nums[i] * nums[right],</span>
<span class="c">// where left/right are its CURRENT neighbours. Maximize total coins. O(n^3).</span>
function maxCoins(nums) {
  const a = [1, ...nums, 1]; <span class="c">// sentinel 1s so edge balloons have neighbours</span>
  const n = a.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  <span class="c">// dp[l][r] = best coins from bursting everything strictly between l and r,</span>
  <span class="c">// with l and r themselves still standing (that's what makes the halves independent)</span>
  for (let len = 2; len &lt; n; len++) {          <span class="c">// len = distance between the exclusive bounds</span>
    for (let l = 0; l + len &lt; n; l++) {
      const r = l + len;
      for (let k = l + 1; k &lt; r; k++) {        <span class="c">// k = the LAST balloon burst in (l, r)</span>
        const coins = dp[l][k] + a[l] * a[k] * a[r] + dp[k][r];
        if (coins > dp[l][r]) dp[l][r] = coins;
      }
    }
  }
  return dp[0][n - 1];
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "If I pick the balloon I burst
  <em>first</em>, the two halves aren't independent — the left half's final
  neighbour depends on what's left of the right half. So I invert it and let
  k be the <em>last</em> balloon in the range: at that moment its neighbours
  are exactly the untouched boundaries l and r, and the two sides never
  interact. That's what makes it a clean O(n³) interval DP."
</div>

<p>
  A second interval problem, to show the shape isn't always a 2D answer
  table: <b>palindrome partitioning with minimum cuts</b>. Here the range
  structure only shows up in a precomputed palindrome table; the answer
  itself is a 1D DP over prefixes. Recognizing that split keeps this O(n²)
  instead of O(n³).
</p>
<pre><code><span class="c">// Minimum cuts so every piece of s is a palindrome. O(n^2) time and space.</span>
function minCut(s) {
  const n = s.length;
  if (n &lt;= 1) return 0;

  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--) {          <span class="c">// i descending so pal[i+1][j-1] is already known</span>
    for (let j = i; j &lt; n; j++) {
      if (s[i] === s[j] && (j - i &lt; 2 || pal[i + 1][j - 1])) pal[i][j] = true;
    }
  }

  const cuts = new Array(n).fill(0);
  for (let j = 0; j &lt; n; j++) {
    if (pal[0][j]) { cuts[j] = 0; continue; } <span class="c">// whole prefix is already a palindrome — zero cuts</span>
    let best = Infinity;
    for (let i = 1; i &lt;= j; i++) {
      if (pal[i][j]) best = Math.min(best, cuts[i - 1] + 1); <span class="c">// cut before i</span>
    }
    cuts[j] = best;
  }
  return cuts[n - 1];
}</code></pre>
<p class="sub">
  Matrix chain multiplication is the same skeleton one more time: iterate by
  chain length, split at k, combine as
  <code>dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]</code>. If you can write
  Burst Balloons you can write MCM — the only difference is what the
  "combine" term costs.
</p>

<h3>Interval DP, again: Minimum Score Triangulation</h3>
<p>
  "A convex polygon has n vertices with values <code>v[0..n-1]</code> in order.
  Cut it into n - 2 triangles by non-crossing diagonals. A triangle scores the
  product of its three vertex values. Minimize the total score." This is
  Burst Balloons in a different costume, and seeing why saves you from
  re-deriving it under pressure.
</p>
<p>
  Look at the sub-polygon formed by vertices <code>i..j</code> and the chord
  <code>i-j</code>. In <em>any</em> triangulation of it, that chord is an
  edge of exactly one triangle, and the third corner of that triangle is some
  vertex <code>k</code> strictly between i and j. Fix that apex. The triangle
  scores <code>v[i] · v[k] · v[j]</code>, and what remains is two smaller
  polygons, <code>i..k</code> and <code>k..j</code>, which share only the
  vertex k and cannot interfere. So choosing the <em>triangle that sits on the
  closing chord</em> (the analogue of "the last balloon") is what makes the two
  sides independent:
</p>
<pre><code>dp[i][j] = min over k in (i, j) of  dp[i][k] + dp[k][j] + v[i] * v[k] * v[j]
dp[i][i+1] = 0   <span class="c">// two vertices are an edge, not a polygon</span></code></pre>
<pre><code>function minScoreTriangulation(values) {
  const n = values.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0)); <span class="c">// dp[i][j]: polygon i..j, chord i-j closes it</span>

  for (let len = 2; len &lt; n; len++) {
    for (let i = 0; i + len &lt; n; i++) {
      const j = i + len;
      let best = Infinity;
      for (let k = i + 1; k &lt; j; k++) { <span class="c">// k = the apex of the triangle sitting on the chord i-j</span>
        best = Math.min(best, dp[i][k] + dp[k][j] + values[i] * values[k] * values[j]);
      }
      dp[i][j] = best;
    }
  }
  return dp[0][n - 1];
}</code></pre>
<h4>Dry run: values [3, 7, 4, 5]</h4>
<table>
  <tr><th>Cell</th><th>Choice of k</th><th>Score</th></tr>
  <tr><td>dp[0][2]</td><td>k = 1</td><td>0 + 0 + 3·7·4 = 84</td></tr>
  <tr><td>dp[1][3]</td><td>k = 2</td><td>0 + 0 + 7·4·5 = 140</td></tr>
  <tr><td>dp[0][3]</td><td>k = 1: dp[0][1] + dp[1][3] + 3·7·5</td><td>0 + 140 + 105 = 245</td></tr>
  <tr><td>dp[0][3]</td><td>k = 2: dp[0][2] + dp[2][3] + 3·4·5</td><td>84 + 0 + 60 = 144, the minimum</td></tr>
</table>
<p class="sub">
  The answer is dp[0][3] = 144, the quadrilateral cut by the diagonal from
  vertex 0 to vertex 2. Time is O(n<sup>3</sup>) and space O(n<sup>2</sup>);
  the outer loop is the length of the range, as in the figure earlier in this
  chapter. Matrix chain multiplication has the same recurrence with a different
  product in the last term.
</p>

<h3>Interval DP with matching ends: Strange Printer</h3>
<p>
  "A printer prints a run of the same character on one turn, and each turn may
  overwrite anything already printed. What is the fewest turns to print
  <code>s</code>?" For <code>"aba"</code> the answer is 2, not 3: print
  <code>"aaa"</code>, then print <code>"b"</code> over the middle.
</p>
<p>
  Define <code>dp[i][j]</code> as the fewest turns for <code>t[i..j]</code>.
  The easy upper bound is to give the last character its own turn:
  <code>dp[i][j-1] + 1</code>. The saving comes from a matching earlier
  character. If <code>t[k] === t[j]</code> for some <code>k</code> in
  <code>[i, j-1]</code>, the turn that printed <code>t[k]</code> can simply be
  stretched to also reach position <code>j</code> for free. The stretched
  stroke covers everything between, so the middle <code>t[k+1..j-1]</code>
  gets printed afterwards, on top, independently. That costs
  <code>dp[i][k] + dp[k+1][j-1]</code>: the left part already contains the
  stroke that is being stretched, and the middle is a smaller interval.
</p>
<pre><code>function strangePrinter(s) {
  const t = [];
  for (const ch of s) if (t.length === 0 || t[t.length - 1] !== ch) t.push(ch); <span class="c">// "aaa" costs the same as "a"</span>
  const n = t.length;
  if (n === 0) return 0;

  const dp = Array.from({ length: n }, () => new Array(n).fill(0)); <span class="c">// dp[i][j]: strokes to print t[i..j]</span>
  for (let i = n - 1; i >= 0; i--) {
    dp[i][i] = 1;
    for (let j = i + 1; j &lt; n; j++) {
      dp[i][j] = dp[i][j - 1] + 1; <span class="c">// give t[j] a stroke of its own</span>
      for (let k = i; k &lt; j; k++) {
        if (t[k] === t[j]) { <span class="c">// t[j] rides along on the stroke that printed t[k]</span>
          const middle = k + 1 &lt;= j - 1 ? dp[k + 1][j - 1] : 0;
          dp[i][j] = Math.min(dp[i][j], dp[i][k] + middle);
        }
      }
    }
  }
  return dp[0][n - 1];
}</code></pre>
<h4>Dry run: "aba"</h4>
<table>
  <tr><th>Cell</th><th>Start value</th><th>Matches t[j]</th><th>Result</th></tr>
  <tr><td>dp[1][2] ("ba")</td><td>dp[1][1] + 1 = 2</td><td>none</td><td>2</td></tr>
  <tr><td>dp[0][1] ("ab")</td><td>dp[0][0] + 1 = 2</td><td>none</td><td>2</td></tr>
  <tr><td>dp[0][2] ("aba")</td><td>dp[0][1] + 1 = 3</td><td>k = 0: dp[0][0] + dp[1][1] = 1 + 1 = 2</td><td>2</td></tr>
</table>
<p class="sub">
  Collapsing consecutive duplicates first, as the code does, is not required
  for the recurrence to be correct but it shrinks n, and "aaabbb" becomes
  "ab". Time is O(n<sup>3</sup>), space O(n<sup>2</sup>). The pitfall is the
  empty middle: when <code>k = j - 1</code> the range
  <code>[k+1, j-1]</code> is empty, and <code>dp[j][j-1]</code> is a cell from
  the unused lower triangle of the table that happens to hold 0, so the code
  names that case explicitly instead of relying on it. Also note the loop order: <code>i</code>
  runs <em>downward</em> so <code>dp[k+1][j-1]</code> is finished before
  <code>dp[i][j]</code> needs it, a second legal way to order interval DP.
</p>

<h3>Interval DP with a pile count: Merge Stones</h3>
<p>
  "There are n piles of stones in a row. One move merges exactly K
  <em>consecutive</em> piles into one pile, at a cost equal to their total
  stones. Merge everything into one pile at minimum total cost, or return -1
  if it is impossible." With K = 2 this is the classic interval DP. For
  larger K there is a new problem: a range cannot always be merged into one
  pile, and the leftovers matter.
</p>
<p>
  <b>When is it possible at all?</b> Each move removes K - 1 piles (K go in, one
  comes out). Going from n piles to 1 takes n - 1 removals, so
  <code>(n - 1) % (K - 1)</code> must be 0. That one line is the early
  <code>-1</code>, and the same arithmetic applies to every sub-range.
</p>
<p>
  <b>The state.</b> Let <code>dp[i][j]</code> be the cheapest cost to merge
  <code>i..j</code> <em>as far as it will go</em>. If
  <code>(len - 1) % (K - 1) === 0</code> that is one pile; otherwise it is
  some number of leftover piles, and nothing more can be done inside the
  range. To compute it, split the range at a point where the left part
  becomes exactly <b>one</b> pile, so the left part's length must be
  <code>1 mod (K - 1)</code>. That is why <code>m</code> steps by K - 1 from
  <code>i</code>. The right part is merged as far as it will go. If the whole
  range can now be one pile, add its total stones for the final merge.
</p>
<pre><code>function mergeStones(stones, K) {
  const n = stones.length;
  if ((n - 1) % (K - 1) !== 0) return -1; <span class="c">// every merge removes K-1 piles; this decides if one pile is reachable</span>

  const prefix = [0];
  for (const x of stones) prefix.push(prefix[prefix.length - 1] + x);

  const dp = Array.from({ length: n }, () => new Array(n).fill(0)); <span class="c">// dp[i][j]: cheapest way to shrink i..j as far as possible</span>
  for (let len = 2; len &lt;= n; len++) {
    for (let i = 0; i + len &lt;= n; i++) {
      const j = i + len - 1;
      let best = Infinity;
      for (let m = i; m &lt; j; m += K - 1) { <span class="c">// [i..m] becomes ONE pile, so m steps by K-1</span>
        best = Math.min(best, dp[i][m] + dp[m + 1][j]);
      }
      if ((len - 1) % (K - 1) === 0) best += prefix[j + 1] - prefix[i]; <span class="c">// the final merge into one pile</span>
      dp[i][j] = best;
    }
  }
  return dp[0][n - 1];
}</code></pre>
<h4>Dry run: stones [3, 5, 1, 2, 6], K = 3</h4>
<table>
  <tr><th>Cell (range)</th><th>Splits tried (left + right)</th><th>Final merge</th><th>dp</th></tr>
  <tr><td>every length-2 range</td><td>0 + 0</td><td>none, (2 - 1) % 2 = 1</td><td>0</td></tr>
  <tr><td>[0..2] = 3, 5, 1</td><td>0 + 0</td><td>+ 9</td><td>9</td></tr>
  <tr><td>[1..3] = 5, 1, 2</td><td>0 + 0</td><td>+ 8</td><td>8</td></tr>
  <tr><td>[2..4] = 1, 2, 6</td><td>0 + 0</td><td>+ 9</td><td>9</td></tr>
  <tr><td>[0..3]</td><td>m = 0: 0 + 8; m = 2: 9 + 0</td><td>none (3 % 2 = 1)</td><td>8</td></tr>
  <tr><td>[1..4]</td><td>m = 1: 0 + 9; m = 3: 8 + 0</td><td>none</td><td>8</td></tr>
  <tr><td>[0..4]</td><td>m = 0: 0 + 8; m = 2: 9 + 0</td><td>+ 17</td><td>8 + 17 = 25</td></tr>
</table>
<p class="sub">
  The answer is 25: merge 5, 1, 2 for 8, then 3, 8, 6 for 17. Time is
  O(n<sup>3</sup> / K) because the split loop skips K - 1 positions at a time,
  and space is O(n<sup>2</sup>). The alternative formulation
  <code>dp[i][j][piles]</code> also works, but it adds a third dimension for
  the pile count, with the extra memory and time that brings; the "merge as far
  as it goes" definition is what removes that dimension.
</p>
<div class="warn">
  <span class="ttl">⚠ Three ways merge stones breaks</span>
  Skipping the early <code>-1</code> returns a finite number for an
  impossible input, because the table fills with values regardless. Stepping
  <code>m</code> by 1 instead of K - 1 lets the left part be a range that
  cannot become a single pile, which prices a merge that cannot happen. And
  adding the range total at every cell, not only where the range ends in one
  pile, double-charges stones that are never merged.
</div>

<h3>DP over a DAG: memoized DFS on an implicit graph</h3>
<p>
  Some DP problems have no array to loop over, because the states are the cells
  of a grid and the moves between them depend on the data. "Given a matrix of
  integers, find the length of the longest path that moves up, down, left or
  right to a <em>strictly larger</em> value." The cells are the states, a move
  is an edge, and because every move strictly increases the value, the edges
  can never form a cycle: the states are a <b>DAG</b>.
</p>
<p>
  On a DAG, "the longest path starting at this cell" depends only on the
  cells it can move to, so the recurrence is
  <code>longest(cell) = 1 + max(longest(next))</code> over strictly larger
  neighbours. There is no obvious loop order, but you do not need one: write
  the recursion, cache each answer, and the recursion visits the cells in an
  order that works. A memoized DFS is a post-order walk of the DAG, so a cell's
  answer is always ready before anything that needs it.
</p>
<pre><code>function longestIncreasingPath(matrix) {
  const R = matrix.length, C = matrix[0].length;
  const memo = Array.from({ length: R }, () => new Array(C).fill(0)); <span class="c">// 0 = not computed yet</span>
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];

  function go(r, c) {
    if (memo[r][c] !== 0) return memo[r][c];
    let best = 1; <span class="c">// the cell alone</span>
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr >= R || nc &lt; 0 || nc >= C) continue;
      if (matrix[nr][nc] &lt;= matrix[r][c]) continue; <span class="c">// strictly larger only: this is what keeps the graph acyclic</span>
      best = Math.max(best, 1 + go(nr, nc));
    }
    memo[r][c] = best;
    return best;
  }

  let answer = 0;
  for (let r = 0; r &lt; R; r++) {
    for (let c = 0; c &lt; C; c++) answer = Math.max(answer, go(r, c));
  }
  return answer;
}</code></pre>
<h4>Dry run: [[9, 9, 4], [6, 6, 8], [2, 1, 1]]</h4>
<table>
  <tr><th>Cell (r,c)</th><th>Value</th><th>Strictly larger neighbours</th><th>Longest path from here</th></tr>
  <tr><td>(0,0)</td><td>9</td><td>none</td><td>1</td></tr>
  <tr><td>(0,1)</td><td>9</td><td>none</td><td>1</td></tr>
  <tr><td>(1,2)</td><td>8</td><td>none</td><td>1</td></tr>
  <tr><td>(0,2)</td><td>4</td><td>(0,1) = 9, (1,2) = 8</td><td>1 + max(1, 1) = 2</td></tr>
  <tr><td>(1,0)</td><td>6</td><td>(0,0) = 9</td><td>1 + 1 = 2</td></tr>
  <tr><td>(1,1)</td><td>6</td><td>(0,1) = 9, (1,2) = 8</td><td>2</td></tr>
  <tr><td>(2,0)</td><td>2</td><td>(1,0) = 6</td><td>1 + 2 = 3</td></tr>
  <tr><td>(2,1)</td><td>1</td><td>(2,0) = 2, (1,1) = 6</td><td>1 + max(3, 2) = 4</td></tr>
  <tr><td>(2,2)</td><td>1</td><td>(1,2) = 8</td><td>1 + 1 = 2</td></tr>
</table>
<p class="sub">
  The answer is 4, the path 1 → 2 → 6 → 9. (The table lists cells in the order
  they finish, which is not the scan order: the scan reaches (0,2) third, and
  that call cannot finish until it has computed (1,2) below it.) Every cell is computed once and looks at four neighbours, so the time
  is O(R · C) with O(R · C) memory for the cache.
</p>
<div class="warn">
  <span class="ttl">⚠ The memo only works because the graph has no cycle</span>
  Change <code>&lt;=</code> to <code>&lt;</code> so equal values may chain, and
  two neighbouring cells with the same value each wait on the other forever;
  the memo's 0 means "not computed", so the recursion never terminates. Any
  time you memoize a DFS over an implicit graph, convince yourself the moves
  strictly progress (a larger value, a smaller index, a shrinking budget). A
  second pitfall is depth: a snake-shaped 100 × 100 grid makes a path of up to
  10<sup>4</sup> cells, and recursion that deep is where call-stack limits start to matter. When depth
  is a worry, sort the cells by value and fill a table in that order, or
  process the DAG layer by layer as in the topological patterns chapter.
</div>
<p>
  The same idea in other clothes: "number of paths from the top-left to the
  bottom-right with obstacles", "count the increasing paths in a grid" and
  "the longest path in a DAG" are all memoized recursion over a graph whose
  edges point only forward. The graph algorithms chapter shows the iterative
  form, relaxing edges in topological order.
</p>

<h3>Monotone-deque DP: the best of the last k states</h3>
<p>
  "Given an integer array and k, find the maximum sum of a non-empty
  subsequence in which any two consecutive chosen elements are at most k
  positions apart." Let <code>dp[i]</code> be the best sum of a valid
  subsequence that <b>ends at index i</b>. It either starts at i, giving
  <code>nums[i]</code>, or extends a subsequence ending at some
  <code>j</code> in <code>[i - k, i - 1]</code>:
</p>
<pre><code>dp[i] = nums[i] + max(0, max of dp[j] for j in [i-k, i-1])</code></pre>
<p>
  Evaluated directly, that inner maximum is a scan of k values for each i, so
  O(n · k). But the inner maximum is a <b>sliding-window maximum</b> over the
  <code>dp</code> array you are building, and the monotonic deque from the
  monotonic stack and queue chapter answers it in amortized O(1). The deque
  holds indices whose <code>dp</code> values decrease from front to back. Before
  reading the front, drop indices that fell out of the window. After computing
  <code>dp[i]</code>, drop every index at the back whose value is not larger,
  because it is older than i and no better, so it can never be the window
  maximum again.
</p>
<pre><code>function constrainedSubsetSum(nums, k) {
  const n = nums.length;
  const dp = new Array(n).fill(0); <span class="c">// dp[i]: best sum of a valid subsequence that ENDS at i</span>
  const queue = new Array(n);      <span class="c">// indices whose dp values decrease from head to tail</span>
  let head = 0, tail = 0;
  let best = -Infinity;

  for (let i = 0; i &lt; n; i++) {
    while (head &lt; tail &amp;&amp; queue[head] &lt; i - k) head++; <span class="c">// fell out of the window of the last k indices</span>
    const bestPrevious = head &lt; tail ? dp[queue[head]] : 0;
    dp[i] = nums[i] + Math.max(0, bestPrevious);       <span class="c">// extend the best earlier chain, or start fresh</span>
    best = Math.max(best, dp[i]);

    while (head &lt; tail &amp;&amp; dp[queue[tail - 1]] &lt;= dp[i]) tail--; <span class="c">// dominated: older AND not better</span>
    queue[tail++] = i;
  }
  return best;
}</code></pre>
<h4>Dry run: nums [10, 2, -10, 5, 20], k = 2</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>Best earlier dp in window</th><th>dp[i]</th><th>Deque (indices) after the push</th></tr>
  <tr><td>0</td><td>10</td><td>none, use 0</td><td>10</td><td>0</td></tr>
  <tr><td>1</td><td>2</td><td>dp[0] = 10</td><td>12</td><td>1 (10 ≤ 12, so 0 is dropped)</td></tr>
  <tr><td>2</td><td>-10</td><td>dp[1] = 12</td><td>2</td><td>1, 2</td></tr>
  <tr><td>3</td><td>5</td><td>dp[1] = 12 (index 1 is still within 2)</td><td>17</td><td>3 (both older values are smaller)</td></tr>
  <tr><td>4</td><td>20</td><td>dp[3] = 17</td><td>37</td><td>4</td></tr>
</table>
<p class="sub">
  The answer is the largest dp value, 37, from the subsequence 10, 2, 5, 20.
  Each index enters and leaves the deque once, so the time is O(n) with O(n)
  space for <code>dp</code> and the deque's backing array.
</p>
<div class="warn">
  <span class="ttl">⚠ Where this recurrence goes wrong</span>
  The answer is the maximum over <em>all</em> <code>dp[i]</code>, not
  <code>dp[n-1]</code>, because a subsequence may end anywhere. Forgetting the
  <code>Math.max(0, …)</code> forces every subsequence to extend a negative
  prefix, and starting <code>best</code> at 0 instead of
  <code>-Infinity</code> returns 0 for an all-negative array, where the right
  answer is the largest single element (the subsequence must be non-empty).
  And the window test is <code>queue[head] &lt; i - k</code>: using
  <code>&lt;=</code> shrinks the window to k - 1 elements. The same deque
  turns "Jump Game VI" and any "dp[i] = cost + best of the previous k states"
  into linear time.
</div>

<h3>State compression: making a big state fit</h3>
<p>
  Once the state has three or four dimensions, memory becomes the binding
  constraint before time does. Three techniques cover most of it:
</p>
<table>
  <tr><th>Technique</th><th>When</th><th>Effect</th></tr>
  <tr><td>Rolling array</td><td>dp[i] only reads dp[i-1]</td><td>O(n·m) → O(m) memory; keep <code>prev</code> and <code>cur</code></td></tr>
  <tr><td>Pack dimensions into one integer key</td><td>small, bounded dimensions</td><td><code>pos * 100 + prev * 2 + started</code> beats a string key or nested Map</td></tr>
  <tr><td>Derive a dimension</td><td>one index is a function of another</td><td>popcount(mask) removes a whole dimension, as in the assignment DP</td></tr>
  <tr><td>Typed arrays</td><td>numeric dp with known bounds</td><td><code>Int32Array(1 &lt;&lt; n)</code> is ~4× smaller and faster than a JS array</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ String keys are where advanced DP silently gets slow</span>
  <code>memo.set(i + "," + j + "," + mask, v)</code> allocates a string on
  every single call. At 10<sup>7</sup> states that's the dominant cost — the
  algorithm is right and the submission still times out. Prefer a numeric key
  (<code>(i * M + j) * K + mask</code>) or a flat preallocated array. Mention
  this trade-off out loud; it reads as production experience, not trivia.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I write any code, let me
  pin down the state. I need to know which items are already used and where I
  currently am — order doesn't matter beyond that — so the state is
  (subset, current). n is 15, so 2¹⁵ × 15 states with an O(n) transition is
  about 8 million operations: comfortably fast. Then the recurrence writes
  itself."
</div>

<h3>Games and probability: where this chapter stops</h3>
<p>
  Two families of DP problems look like they belong here but are a separate
  topic that this chapter does not teach. In a <b>two-player
  game</b> such as "Can I Win" or the stone games, the state is the position
  and the value is "does the player to move win" or "by how much do they
  lead", defined from the mover's side so that a turn flip is one negation. The
  bitmask and interval tools above are the state, and the new idea is the
  minimax step. In a <b>probability or expected-value DP</b> such as "Knight
  Probability in a Chessboard" or "Soup Servings", the transitions are weighted
  by chances and the answer is a sum instead of a min. If a problem mentions
  turns, optimal play, or "the probability that", it is one of these; the state
  design from this chapter carries over unchanged.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>n ≤ 20 with permutations, assignments, or "visit all"</b> → bitmask DP. The tiny constraint is the giveaway; interviewers set n = 12-18 precisely to signal 2<sup>n</sup>.</li>
  <li><b>"Maximum/minimum over a tree, with a constraint between parent and child"</b> → tree DP with a tuple return. Ask what a parent needs from a subtree; that tuple <em>is</em> your state.</li>
  <li><b>N up to 10<sup>9</sup>-10<sup>18</sup> and the question is "how many numbers ≤ N satisfy…"</b> → digit DP. Nothing else fits a bound that large, and the answer is a count, not a search.</li>
  <li><b>"Merge adjacent," "burst," "remove and the neighbours join," "partition a string into pieces"</b> → interval DP. Loop by length; the split point is usually the <em>last</em> operation, not the first.</li>
  <li><b>Distinguish from plain 2D DP:</b> 2D DP indexes two independent sequences; interval DP indexes two ends of the <em>same</em> sequence and must be filled so shorter ranges are ready first, usually by length.</li>
  <li><b>Distinguish from greedy:</b> if a locally best choice can be invalidated by a later one (bursting the biggest balloon first is not optimal), greedy is out — the fact that "obvious greedy" fails on a small counterexample is the strongest signal you're in advanced-DP territory.</li>
  <li><b>A walk that may revisit nodes, shortest, over a small graph</b> → the state is still (subset, current), but the states contain cycles. Run a BFS over them instead of a loop over masks.</li>
  <li><b>"For every node as the root"</b> → rerooting: one pass up to collect what lies below, one pass down moving the root across each edge.</li>
  <li><b>"dp[i] = cost + the best of the previous k states"</b> → a monotonic deque over the dp values, which makes it linear.</li>
  <li><b>A grid or graph where each move strictly increases something</b> → memoized DFS over a DAG; the strictness is what makes the memo safe.</li>
  <li>Common pitfall across all of these: propagating <code>Infinity</code> from unreachable states into arithmetic. Always <code>continue</code> on unreachable before relaxing.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write the bitmask DP recurrence for TSP from memory, and explain why iterating mask upward from 0 is already a valid dependency order.</li>
    <li>Explain why the state (subset, current worker) collapses to a single array dimension when the k-th decision is always "assign worker k," and what popcount buys you there.</li>
    <li>Write the two-value tree DP for House Robber III, and say why <code>skipHere</code> must take max(leftRob, leftSkip) per child independently rather than summing leftSkip + rightSkip.</li>
    <li>Explain why a digit-DP tight state must never be memoized, with a concrete (pos, prev) example where reusing a cached tight answer would undercount.</li>
    <li>Given a new problem, decide in one sentence which of the four state shapes — subset, subtree, digit prefix, or interval — it needs, and why the other three don't fit.</li>
  </ul>
</div>`,
};
