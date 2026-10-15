import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "agr-fastest-routes",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "shortest-path",
      section: "weights-break-bfs-and-knowing-why-tells-you-which-algorithm-",
      placement: true,
      kind: "single",
      prompt:
        "<p>A road network has 100,000 junctions and 300,000 roads. Every road has a positive travel time in minutes, anywhere from 1 to 60. You need the fastest travel time from the depot to every other junction. Which algorithm fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Breadth-first search from the depot, using each junction's number of roads from the depot as its travel time.",
          why: "Breadth-first search orders junctions by how many roads they are from the depot, not by minutes. A junction one road away can be 60 minutes away, while one three roads away can be 3 minutes away, so the first would wrongly be treated as the nearer one.",
        },
        {
          id: "b",
          text: "Floyd-Warshall over every pair of junctions.",
          why: "It would give correct times, but it takes O(V³) steps, which for 100,000 junctions is about 10<sup>15</sup>. It also answers a question nobody asked, since only one source is needed.",
        },
        {
          id: "c",
          text: "Dijkstra's algorithm with a binary heap.",
          why: "Every time is positive, so the junction with the smallest tentative time in the heap can no longer be improved, and it is final the moment it is popped. With a binary heap the work is O((V + E) log V), which is small for this network.",
        },
        {
          id: "d",
          text: "Bellman-Ford, relaxing every road V − 1 times.",
          why: "It would give correct times, because it handles any weights, but in the worst case it relaxes every road about V − 1 times, around 3 × 10<sup>10</sup> relaxations here. With no negative weights there is no reason to pay that.",
        },
      ],
      answer: "c",
    },
    {
      id: "agr-negative-edges",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "shortest-path",
      section: "picking-the-right-one",
      placement: true,
      kind: "single",
      prompt:
        "<p>A directed graph has 2,000 nodes and 6,000 edges. Some edge weights are negative, such as refunds, and you are told there is no negative cycle. You need the shortest distance from one source node to every other node. Which algorithm fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Bellman-Ford.",
          why: "It never declares a node final early, so a negative edge cannot fool it, and with no negative cycle V − 1 rounds are enough. It takes at most about V · E, here 2,000 × 6,000 = 1.2 × 10<sup>7</sup> relaxations.",
        },
        {
          id: "b",
          text: "Dijkstra's algorithm with a binary heap, since there is no negative cycle.",
          why: "The danger for Dijkstra is the negative edge, not only the negative cycle. It treats a node as final when it is popped, assuming nothing later can lower its distance, and a negative edge reached later can. A version that finalises on the first pop can return wrong distances, and a lazy version that re-expands nodes loses its O(E log V) bound, so neither is a safe choice.",
        },
        {
          id: "c",
          text: "Floyd-Warshall over every pair of nodes.",
          why: "It handles negative edges when there is no negative cycle, so the answers would be right, but it takes V³ = 8 × 10<sup>9</sup> steps for 2,000 nodes. It also computes every pair when only one source was asked for.",
        },
        {
          id: "d",
          text: "Breadth-first search from the source.",
          why: "Breadth-first search ignores weights completely, so it finds the route with the fewest edges, not the cheapest one. Having no negative cycle does not mean the graph has no cycles.",
        },
      ],
      answer: "a",
    },
    {
      id: "agr-nearest-exit",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "shortest-path",
      section: "multi-source-bfs-seed-the-queue-with-everything-at-once",
      placement: true,
      kind: "single",
      prompt:
        "<p>A grid has 1,000 × 1,000 cells. Some cells are exits, some are walls and the rest are open floor. You move up, down, left or right and every step costs 1. For every open cell you must report how many steps it takes to reach the nearest exit. Which approach is best?</p>",
      choices: [
        {
          id: "a",
          text: "Run a separate breadth-first search from every open cell until it reaches an exit.",
          why: "Each search can cover up to a million cells, and there can be nearly a million starting cells, so the total can reach about 10<sup>12</sup> steps. Most of that work repeats itself.",
        },
        {
          id: "b",
          text: "Run a depth-first search from each exit and write down the depth at which each cell is first reached.",
          why: "Depth-first search follows one long path before trying others, so the depth at which it first reaches a cell is often not the shortest distance. It is not a shortest-path method when you count steps.",
        },
        {
          id: "c",
          text: "Run Dijkstra's algorithm from each exit in turn and keep the smaller distance for every cell.",
          why: "The distances would be right, but every step costs 1, so a heap is unnecessary, and one run for each exit repeats work across the grid.",
        },
        {
          id: "d",
          text: "Run one breadth-first search whose queue starts with every exit at distance 0.",
          why: "The search frontiers of all exits grow together, one step per layer. The first time any exit reaches a cell is by definition the nearest exit, so one pass over the grid, O(R · C), fills in every distance.",
        },
      ],
      answer: "d",
    },
    {
      id: "agr-arrow-maze",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "shortest-path",
      section: "0-1-bfs-when-weights-are-only-0-and-1",
      kind: "single",
      prompt:
        "<p>Every cell of a maze holds an arrow. Moving to a neighbour in the direction of the arrow costs 0, and moving in any other direction costs 1. The maze has n cells, each with at most 4 neighbours. Which method finds the cheapest route from the top-left to the bottom-right cell in O(n) time?</p>",
      choices: [
        {
          id: "a",
          text: "Plain breadth-first search with an ordinary queue, counting every move as one step.",
          why: "Plain breadth-first search treats every move as cost 1, so it minimises the number of moves, not the cost. A route of six moves that all follow arrows costs 0 and would lose to a route of two moves costing 2.",
        },
        {
          id: "b",
          text: "0-1 breadth-first search with a deque: zero-cost neighbours go to the front, one-cost ones to the back.",
          why: "The deque holds only two distances at a time, d and d + 1, and the zero-cost neighbours sit at the front, so it stays sorted by distance without a heap. Each cell and edge is handled a constant number of times, so the work is O(V + E), which is O(n) here.",
        },
        {
          id: "c",
          text: "Dijkstra's algorithm with a binary heap, using the move costs as edge weights.",
          why: "It gives the right answer, but with a binary heap it takes O(E log V), a logarithmic factor more than needed. When there are only two possible weights a deque replaces the heap.",
        },
        {
          id: "d",
          text: "Floyd-Warshall on the grid's cells, finding the distance between every pair of cells.",
          why: "It takes O(n³) time and computes the distance between every pair of cells, far more than one route from corner to corner.",
        },
      ],
      answer: "b",
    },
    {
      id: "agr-dijkstra-cost",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "shortest-path",
      section: "dijkstra-the-full-working-version",
      kind: "single",
      prompt:
        "<p>Dijkstra's algorithm uses a binary min-heap with lazy deletion: every successful relaxation pushes a new entry, and a popped entry whose distance is larger than <code>dist[u]</code> is skipped. The graph is connected, with V vertices and E edges (so E ≥ V − 1). What is the tightest bound on its worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "O(V · E)",
          why: "That is Bellman-Ford's bound. Dijkstra expands each vertex once and looks at each edge once, and only the heap operations carry a log factor.",
        },
        {
          id: "b",
          text: "O(V²)",
          why: "That is the cost of the version that finds the next vertex by scanning an array. With a heap the cost is about E log V, which is much smaller for sparse graphs and can be larger than V² for dense ones.",
        },
        {
          id: "c",
          text: "O(V log V)",
          why: "That counts the V pops only. Every successful relaxation also pushes an entry, and there can be one for each edge, so the edges have to appear in the bound.",
        },
        {
          id: "d",
          text: "O(E log V)",
          why: "Each vertex is expanded once and each edge is scanned once. Every push strictly lowers a distance, so there are at most E + 1 pushes and as many pops, each costing O(log E) = O(log V) because E ≤ V² in a graph without repeated edges. The total is O(E log V), and since E ≥ V − 1 this also covers the O(V) setup.",
        },
      ],
      answer: "d",
    },
    {
      id: "agr-multi-source-cost",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "shortest-path",
      section: "multi-source-bfs-seed-the-queue-with-everything-at-once",
      kind: "single",
      prompt:
        "<p>A grid has R rows and C columns. One breadth-first search starts with every cell that holds 0 already in the queue at distance 0, then fills in the distance from each cell to its nearest 0. The queue is read with an index, not with <code>shift()</code>. What is the tightest bound on its worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "O((R · C)²)",
          why: "That is what a separate breadth-first search from every cell can cost. The seeded search visits each cell once, so it does not repeat the grid for every start.",
        },
        {
          id: "b",
          text: "O(R · C)",
          why: "Scanning the grid to find the zeros takes R · C steps. Every cell enters the queue at most once and looks at 4 neighbours, so the search itself is also O(R · C).",
        },
        {
          id: "c",
          text: "O(R · C · log(R · C))",
          why: "A log factor comes from a heap, and a heap is only needed when edges have different costs. Every step here costs 1, so queue operations take constant time.",
        },
        {
          id: "d",
          text: "O(R + C)",
          why: "That is far too small. The answer has to fill in a distance for every one of the R · C cells, so at least R · C steps are needed.",
        },
      ],
      answer: "b",
    },
    {
      id: "agr-flights-in-place",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "shortest-path",
      section: "when-shortest-has-a-second-constraint-cheapest-flights-withi",
      kind: "single",
      prompt:
        "<p>This is the bounded Bellman-Ford for the cheapest flight, but it relaxes straight into <code>dist</code> instead of into a copy. Here <code>k = 0</code>, which allows no stops, so only a direct flight is meant to count.</p><pre><code>function cheapest(n, flights, src, dst, k) {\n  const dist = new Array(n).fill(Infinity);\n  dist[src] = 0;\n  for (let round = 0; round &lt;= k; round++) {\n    for (const [u, v, price] of flights) {\n      if (dist[u] === Infinity) continue;\n      if (dist[u] + price &lt; dist[v]) dist[v] = dist[u] + price;\n    }\n  }\n  return dist[dst] === Infinity ? -1 : dist[dst];\n}\n\ncheapest(4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 10]], 0, 3, 0)</code></pre><p>What does the call return?</p>",
      choices: [
        {
          id: "a",
          text: "3",
          why: "The flights are read in order inside one round. 0 to 1 sets <code>dist[1]</code> to 1, then 1 to 2 sees that new value and sets <code>dist[2]</code> to 2, then 2 to 3 sets <code>dist[3]</code> to 3. Three flights were chained in a round that should allow one, so the limit leaks, and the direct flight at 10 cannot beat 3.",
        },
        {
          id: "b",
          text: "10",
          why: "10 is the correct answer for zero stops, because only the direct flight is allowed, and it is what the version that copies <code>dist</code> at the start of each round returns. This version does not copy, so it finds the cheaper chained route first.",
        },
        {
          id: "c",
          text: "-1",
          why: "-1 would mean the destination cannot be reached. Reaching it takes at least one flight, and there are routes to node 3, so <code>dist[3]</code> is finite after the round.",
        },
        {
          id: "d",
          text: "1",
          why: "1 is the cost of reaching node 1. The destination is node 3, and nothing in the code ever gives node 3 a price of 1.",
        },
      ],
      answer: "a",
    },
    {
      id: "agr-order-one-edge",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "shortest-path",
      section: "dijkstra-the-full-working-version",
      kind: "order",
      prompt:
        "<p>Put the steps Dijkstra's algorithm takes for one popped entry and one outgoing edge of a vertex that is not skipped into order. Start with the pop and end with the push.</p><pre><code>const [d, u] = pq.pop();\nif (d &gt; dist[u]) continue;\nfor (const [v, w] of adj[u]) {\n  const nd = d + w;\n  if (nd &lt; dist[v]) {\n    dist[v] = nd;\n    pq.push([nd, v]);\n  }\n}</code></pre>",
      items: [
        { id: "pop", text: "Pop the entry <code>[d, u]</code> with the smallest distance from the heap." },
        {
          id: "stale",
          text: "Skip the entry if <code>d &gt; dist[u]</code>, because a better route to <code>u</code> is already known.",
        },
        {
          id: "sum",
          text: "For an edge from <code>u</code> to <code>v</code> with weight <code>w</code>, compute <code>nd = d + w</code>.",
        },
        { id: "test", text: "Test whether <code>nd &lt; dist[v]</code>." },
        { id: "push", text: "Set <code>dist[v] = nd</code> and push <code>[nd, v]</code> onto the heap." },
      ],
      why: "The pop comes first because every later step works on the popped pair. The stale test comes before any edge is looked at, since for a stale entry <code>d</code> is no longer the distance to <code>u</code>. The sum needs <code>d</code>, the comparison needs the sum, and the update and the push only happen when the comparison passes.",
    },
    {
      id: "agr-floyd-k-innermost",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "shortest-path",
      section: "floyd-warshall-all-pairs-in-three-loops",
      kind: "single",
      prompt:
        "<p>A graph has nodes 0 to 3 and exactly three edges, each costing 1: 0 to 3, 3 to 2 and 2 to 1. The table <code>d</code> starts with <code>d[i][i] = 0</code>, those three edges and <code>Infinity</code> everywhere else. The loops are written with <code>k</code> innermost.</p><pre><code>for (let i = 0; i &lt; 4; i++) {\n  for (let j = 0; j &lt; 4; j++) {\n    for (let k = 0; k &lt; 4; k++) {\n      if (d[i][k] + d[k][j] &lt; d[i][j]) d[i][j] = d[i][k] + d[k][j];\n    }\n  }\n}</code></pre><p>What is <code>d[0][1]</code> afterwards?</p>",
      choices: [
        {
          id: "a",
          text: "3",
          why: "3 is the true shortest cost of 0 to 3 to 2 to 1, and the correct loop order, <code>k</code> outermost, finds it. With <code>k</code> innermost, the cells it needs are not ready at the moment <code>d[0][1]</code> is computed.",
        },
        {
          id: "b",
          text: "2",
          why: "<code>d[0][2]</code> does end up as 2, through node 3, but that is the cost of reaching node 2. Node 1 needs one more edge, and <code>d[0][1]</code> is not updated after that.",
        },
        {
          id: "c",
          text: "Infinity",
          why: "When <code>d[0][1]</code> is computed, <code>d[0][2]</code> is still Infinity because <code>j = 2</code> comes later in the same row, and <code>d[3][1]</code> is still Infinity because row 3 is processed later. Nothing returns to row 0 afterwards, so the cell keeps Infinity although the path exists.",
        },
        {
          id: "d",
          text: "1",
          why: "There is no edge from 0 to 1 and the table starts with Infinity there. No update could ever set it to a cost of 1, since every route from 0 to 1 uses three edges.",
        },
      ],
      answer: "c",
    },
    {
      id: "agr-dijkstra-statements",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "shortest-path",
      section: "dijkstra-the-full-working-version",
      kind: "multi",
      prompt:
        "<p>Dijkstra's algorithm is written as in the chapter, with lazy deletion, on a graph whose weights are all non-negative. Select every statement that is true.</p>",
      choices: [
        {
          id: "a",
          text: "Zero-weight edges break the guarantee that a popped entry holds a final distance.",
          why: "The guarantee needs weights that are not negative, and zero qualifies. Following a zero-weight edge never makes a distance smaller than the one already popped.",
        },
        {
          id: "b",
          text: "Deleting the check <code>if (d &gt; dist[u]) continue</code> still leaves the distances correct, but the loop scans the edges of outdated entries again.",
          why: "An outdated entry pops after the better entry for the same vertex, whose edges have already been relaxed, so its edges cannot improve anything. The check only saves the repeated scanning.",
        },
        {
          id: "c",
          text: "Every vertex is pushed at most once, so the heap never holds more than V entries.",
          why: "A vertex is pushed again every time a better route to it is found. In the S, A, B, T graph from the chapter, T is pushed at cost 100 and then again at cost 3, which is why the heap can hold up to about E entries.",
        },
        {
          id: "d",
          text: "Marking a vertex as visited when it is pushed, and never pushing it again, can give distances that are too large.",
          why: "In the chapter's graph, T is pushed first at cost 100 straight from S. Marked as visited at that moment, it would never be pushed again at cost 3 through A and B, and the answer for T stays 100.",
        },
      ],
      answers: ["b", "d"],
    },
    {
      id: "agr-unreachable-sentinel",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "shortest-path",
      section: "bellman-ford-negative-weights-and-detecting-a-negative-cycle",
      kind: "single",
      prompt:
        "<p>A Bellman-Ford uses a finite number for unreachable nodes and drops the guard that skips unreachable sources. Node 0 is the source, and the only edge is from node 1 to node 2 with weight -5, so nodes 1 and 2 cannot be reached.</p><pre><code>function bellmanFord(n, edges, src) {\n  const INF = 1e9;\n  const dist = new Array(n).fill(INF);\n  dist[src] = 0;\n  for (let i = 0; i &lt; n - 1; i++) {\n    for (const [u, v, w] of edges) {\n      if (dist[u] + w &lt; dist[v]) dist[v] = dist[u] + w;\n    }\n  }\n  return dist;\n}\n\nbellmanFord(3, [[1, 2, -5]], 0)</code></pre><p>What does the call return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1000000000, 1000000000]</code>",
          why: "This is what you would want, with both unreachable nodes still marked unreachable. The edge from node 1 does fire, though, because <code>1e9 + (-5)</code> is smaller than <code>1e9</code>.",
        },
        {
          id: "b",
          text: "<code>[0, Infinity, Infinity]</code>",
          why: "Nothing in this code writes <code>Infinity</code>, because the array was filled with <code>1e9</code>. With a real <code>Infinity</code> as the sentinel, <code>Infinity + (-5)</code> would stay Infinity and the guard would not be needed, but this version does not use one.",
        },
        {
          id: "c",
          text: "<code>[0, 1000000000, 999999995]</code>",
          why: "The unreachable node 1 holds 1e9, and the edge to node 2 gives 1e9 − 5 = 999999995, which is smaller than 1e9, so node 2 now looks reachable at a made-up distance. A finite sentinel plus a negative weight dips below the sentinel, which is why the chapter skips unreachable sources.",
        },
        {
          id: "d",
          text: "<code>[0, 1000000000, -5]</code>",
          why: "The edge cost is added to the distance of its source, which is 1e9, not to 0. The result is 999999995, not -5.",
        },
      ],
      answer: "c",
    },
    {
      id: "agr-probability-negate",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "shortest-path",
      section: "same-loop-different-cost-path-probability-and-the-bottleneck",
      kind: "single",
      prompt:
        "<p>To find the most likely path in a graph where each edge succeeds with some probability, you run Dijkstra with a binary min-heap and multiply along edges. What must you do with the heap keys?</p>",
      choices: [
        {
          id: "a",
          text: "Push the negated probability, so the smallest key is the largest probability.",
          why: 'The heap always pops its smallest key. Negating turns "most likely" into "smallest", and the finalize-on-pop argument then works because a factor of at most 1 never raises a probability.',
        },
        {
          id: "b",
          text: "Push the probability as it is, since larger values come out of a heap first.",
          why: "A min-heap pops the smallest key first, so this would expand the least likely route first and finalize nodes too early.",
        },
        {
          id: "c",
          text: "Push the number of edges instead, and multiply the probabilities at the end.",
          why: "The number of edges says nothing about the probability. A longer path may be far more likely than a shorter one.",
        },
        {
          id: "d",
          text: "Add the probabilities instead of multiplying them.",
          why: "The probability of crossing every edge in a path is the product. A sum can exceed 1 and has no meaning as a probability.",
        },
      ],
      answer: "a",
    },
    {
      id: "agr-ways-tie",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "trace",
      pattern: "shortest-path",
      section: "counting-shortest-paths-and-the-second-shortest",
      kind: "single",
      prompt:
        "<p>While counting shortest paths with Dijkstra, node <code>u</code> is popped with <code>ways[u] = 3</code>. Its edge to <code>v</code> gives <code>d + w</code> exactly equal to <code>dist[v]</code>, and <code>ways[v]</code> is currently 2. What is <code>ways[v]</code> afterwards?</p>",
      choices: [
        {
          id: "a",
          text: "3",
          why: "That would replace the count, which is what happens when the new route is strictly shorter. Here it only ties, so the old paths stay valid.",
        },
        {
          id: "b",
          text: "5",
          why: "A tie means every shortest path to <code>u</code> extends to a new shortest path to <code>v</code>, in addition to the 2 already known: 2 + 3 = 5.",
        },
        {
          id: "c",
          text: "6",
          why: "That multiplies the counts. The two groups of paths are alternatives, so they add.",
        },
        {
          id: "d",
          text: "2",
          why: "That ignores the tie. The 3 shortest paths that reach <code>v</code> through <code>u</code> are new shortest paths to <code>v</code>.",
        },
      ],
      answer: "b",
    },
    {
      id: "agr-flights-state",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "shortest-path",
      section: "the-same-flights-problem-with-dijkstra-on-node-flights-taken",
      kind: "single",
      prompt:
        "<p>You want the cheapest trip from A to B with at most k stops, and you run Dijkstra. Which state makes the answer correct?</p>",
      choices: [
        {
          id: "a",
          text: "The node alone, keeping the cheapest cost seen for each node.",
          why: "A cheap arrival may use up the flights allowed, and a dearer arrival with fewer flights may still lead to the goal. Pruning by node alone discards it.",
        },
        {
          id: "b",
          text: "The pair (node, flights taken so far).",
          why: '"Cheapest cost to reach this node using this many flights" is a well-defined quantity, and Dijkstra applies to the graph of such states.',
        },
        {
          id: "c",
          text: "The pair (node, total cost so far).",
          why: "The cost is what Dijkstra orders by, not a part of the state. Two states differing only by cost would never be recognised as the same place.",
        },
        {
          id: "d",
          text: "The set of nodes visited so far.",
          why: "That is a state of 2<sup>n</sup> possibilities, and the limit is on the number of flights, not on which nodes were seen.",
        },
      ],
      answer: "b",
    },
    {
      id: "agr-dag-longest",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "shortest-path",
      section: "shortest-and-longest-paths-on-a-dag",
      kind: "single",
      prompt:
        "<p>Edges of a DAG have arbitrary integer weights, some negative. What is the best time to compute the <em>longest</em> path from a source to every node?</p>",
      choices: [
        {
          id: "a",
          text: "O(E log V), by running Dijkstra with a max-heap.",
          why: "Dijkstra's finalize-on-pop argument needs extending a path never to improve it. With maximizing and arbitrary weights that does not hold, so the answers can be wrong.",
        },
        {
          id: "b",
          text: "O(V · E), by Bellman-Ford with negated weights.",
          why: "It gives correct answers, since a DAG has no cycles, but it is slower than needed. Topological order does it in one pass over the edges.",
        },
        {
          id: "c",
          text: "Exponential, because longest path is NP-hard.",
          why: "The longest simple path is hard on general graphs. On a DAG no cycle can be repeated, and a single pass in topological order solves it.",
        },
        {
          id: "d",
          text: "O(V + E), by relaxing edges in topological order.",
          why: "When a node is reached in topological order, every edge into it has been relaxed, so its value is final. Each edge is relaxed once, whatever the weights are.",
        },
      ],
      answer: "d",
    },
    {
      id: "agr-a-star-heuristic",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "edge-case",
      pattern: "shortest-path",
      section: "a-star-dijkstra-with-a-compass",
      kind: "single",
      prompt:
        "<p>A* runs on a grid with 4-direction moves of cost 1. Which heuristic <code>h</code> can make it return a path that is not the shortest?</p>",
      choices: [
        {
          id: "a",
          text: "The Manhattan distance to the goal.",
          why: "No path with unit steps can be shorter than the Manhattan distance, so it never overestimates, and A* stays optimal with it.",
        },
        {
          id: "b",
          text: "Always 0.",
          why: "A zero heuristic never overestimates. It turns A* into Dijkstra, which is slower than it needs to be but still optimal.",
        },
        {
          id: "c",
          text: "Twice the Manhattan distance to the goal.",
          why: "At the cell next to the goal the true remaining cost is 1 but the estimate is 2. Overestimating lets A* pop the goal through a worse route before a better one is examined.",
        },
        {
          id: "d",
          text: "The straight-line (Euclidean) distance to the goal.",
          why: "On a 4-direction grid the straight-line distance is never larger than the Manhattan distance, so it still never overestimates and A* stays optimal, with less guidance.",
        },
      ],
      answer: "c",
    },
    {
      id: "agr-bidirectional-fit",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "recognise",
      pattern: "shortest-path",
      section: "bidirectional-search-two-small-circles-instead-of-one-big-on",
      kind: "single",
      prompt:
        "<p>An unweighted, undirected graph has about 30 neighbours per node, and the two nodes you care about are 6 edges apart. Which search visits the fewest nodes?</p>",
      choices: [
        {
          id: "a",
          text: "A BFS from the source until the target is found.",
          why: "It explores on the order of 30<sup>6</sup> nodes before reaching distance 6.",
        },
        {
          id: "b",
          text: "A DFS from the source, stopping at the first path found.",
          why: "A DFS finds some path, not the shortest, and it gives no bound on how many nodes it visits.",
        },
        {
          id: "c",
          text: "Two BFS searches, one from each end, expanding the smaller frontier until they touch.",
          why: "Each side only needs to reach about distance 3, which is on the order of 30<sup>3</sup> nodes per side instead of 30<sup>6</sup> for one.",
        },
        {
          id: "d",
          text: "Dijkstra from the source with all weights set to 1.",
          why: "On a unit-weight graph Dijkstra visits the same nodes as BFS, with the extra cost of a heap.",
        },
      ],
      answer: "c",
    },
    {
      id: "agr-spfa-worst",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "shortest-path",
      section: "spfa-bellman-ford-that-only-looks-where-something-changed",
      kind: "single",
      prompt:
        "<p>What can you safely say about the worst-case time of SPFA, the queue-based Bellman-Ford, on a graph with V nodes and E edges?</p>",
      choices: [
        {
          id: "a",
          text: "O(E), because each edge is relaxed once.",
          why: "A node can re-enter the queue every time its distance improves, so an edge may be relaxed many times.",
        },
        {
          id: "b",
          text: "O(V · E), the same as Bellman-Ford, though often faster in practice.",
          why: "Inputs exist where nodes keep re-entering the queue about V times each. The queue only skips work that cannot help, and that does not change the worst-case bound.",
        },
        {
          id: "c",
          text: "O(E log V), the same as Dijkstra.",
          why: "SPFA has no heap and does not finalize nodes on pop, so Dijkstra's bound does not apply to it.",
        },
        {
          id: "d",
          text: "O(V<sup>2</sup>), because the queue holds at most V nodes.",
          why: "The size of the queue does not bound the number of times nodes are processed. Each node may be taken out of the queue many times.",
        },
      ],
      answer: "b",
    },
    {
      id: "agr-dense-cost",
      chapter: "dsa-advanced-graph-algorithms",
      level: "advanced",
      skill: "complexity",
      pattern: "shortest-path",
      section: "dijkstra-without-a-heap-the-array-version-for-dense-graphs",
      kind: "single",
      prompt:
        "<p>A graph has V = 1000 nodes and E = 500000 edges. Roughly how do the array-scan Dijkstra and the binary-heap Dijkstra compare?</p>",
      choices: [
        {
          id: "a",
          text: "About 10<sup>6</sup> steps for the array version and 5 · 10<sup>6</sup> for the heap, so the array wins.",
          why: "The array version costs V<sup>2</sup> = 10<sup>6</sup>. The heap version costs about E log V, which is 500000 times about 10, so about 5 · 10<sup>6</sup>.",
        },
        {
          id: "b",
          text: "The array version takes about 10<sup>9</sup> steps, far more than the heap version.",
          why: "That would be V<sup>3</sup>. The array version scans V nodes in each of V rounds, which is V<sup>2</sup>.",
        },
        {
          id: "c",
          text: "Both take about the same, since the heap only helps when edges have weights.",
          why: "The heap is about finding the closest unfinished node quickly. The cost difference depends on how many edges there are compared with V<sup>2</sup>.",
        },
        {
          id: "d",
          text: "The array version cannot be used, because it requires an adjacency list.",
          why: "It works directly on an adjacency matrix, which is the natural input for a dense graph.",
        },
      ],
      answer: "a",
    },
  ],
  pattern: {
    pattern: "shortest-path",
    chapter: "dsa-advanced-graph-algorithms",
    signals: [
      "The prompt asks for the minimum cost, time or effort to get from A to B, with numbers on the edges.",
      "Some weights are negative, or the route may use at most k edges.",
      "Every edge costs 1, or only 0 or 1, or the problem lives on an unweighted grid.",
      "The prompt asks for the distance to the nearest of many sources, for every cell.",
      "The prompt asks for the shortest distance between every pair of nodes in a small graph.",
    ],
    template:
      "<pre><code>dist[src] = 0;\nheap.push([0, src]);\nwhile (heap.size &gt; 0) {\n  const [d, u] = heap.pop();\n  if (d &gt; dist[u]) continue;\n  for (const [v, w] of adj[u]) {\n    if (d + w &lt; dist[v]) {\n      dist[v] = d + w;\n      heap.push([d + w, v]);\n    }\n  }\n}</code></pre>",
    time: "O(E log V) for Dijkstra with a binary heap",
    space: "O(V + E)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
