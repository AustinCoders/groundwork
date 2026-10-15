import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "gt-fewest-moves",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "bfs-spread-outward-layer-by-layer",
      placement: true,
      kind: "single",
      prompt:
        "<p>A sliding puzzle has about a million reachable board states. Each state is a node, each legal move joins two states, and every move counts as one step. You must report the fewest moves from the starting state to the solved state. Which approach is correct?</p>",
      choices: [
        {
          id: "a",
          text: "Run DFS with a visited set and report the depth at which it first reaches the solved state.",
          why: "The depth DFS reaches the solved state at depends on which neighbour it happens to explore first, and it can be much larger than the fewest moves. DFS commits to one path fully before trying another, so it makes no promise about the shortest one.",
        },
        {
          id: "b",
          text: "Run BFS from the starting state, recording distances, and stop at the solved state.",
          why: "The queue finishes every state at distance k before it starts any state at distance k + 1. Every move costs one step, so the first time BFS reaches the solved state is by a shortest path.",
        },
        {
          id: "c",
          text: "Use Dijkstra's algorithm, because BFS cannot return a shortest path on any graph that has cycles.",
          why: "A visited set is what lets BFS cope with cycles, and with equal step costs its first arrival is shortest. Dijkstra would also give the right answer here, but it is only needed when edges have different costs.",
        },
        {
          id: "d",
          text: "Build an adjacency matrix of all the states and read the entry for the start and the solved state.",
          why: "An entry tells you whether one move joins two states, not how many moves separate them. With a million states the matrix would also have a trillion cells.",
        },
      ],
      answer: "b",
    },
    {
      id: "gt-sparse-storage",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "two-ways-to-store-one-and-when-each-wins",
      placement: true,
      kind: "single",
      prompt:
        "<p>A road network has 200,000 junctions and about 500,000 roads. Your program will run BFS from several starting junctions. Which way of storing the roads fits best?</p>",
      choices: [
        {
          id: "a",
          text: "A 200,000 by 200,000 adjacency matrix, since BFS is easiest to write against a matrix.",
          why: "Such a matrix has 40 billion cells, far more than the 500,000 roads need. Every dequeued junction would also scan a whole row of 200,000 cells to find its few neighbours.",
        },
        {
          id: "b",
          text: "A plain list of the 500,000 roads, scanned from the beginning whenever BFS needs a junction's neighbours.",
          why: "Each dequeued junction would scan up to all 500,000 roads to find its own, so the whole BFS costs about V times E. The edge list is a fine input format, but BFS wants the neighbours of one node directly.",
        },
        {
          id: "c",
          text: "An adjacency list: one array of neighbours for each junction.",
          why: "It takes O(V + E) space, which is small for a sparse graph, and the neighbours of a junction are right there to iterate. BFS then costs O(V + E) in total.",
        },
        {
          id: "d",
          text: 'A Set of strings such as <code>"3-17"</code>, one per road, testing every other junction against it.',
          why: "Each membership test is cheap on average, but finding the neighbours of one junction means testing all V candidates. Over a whole BFS that is about V squared tests, which is 40 billion here.",
        },
      ],
      answer: "c",
    },
    {
      id: "gt-dense-lookup",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "two-ways-to-store-one-and-when-each-wins",
      kind: "single",
      prompt:
        "<p>A graph has 800 vertices and nearly every pair of them is joined by an edge. The program must answer “is there an edge between <code>a</code> and <code>b</code>?” millions of times and rarely lists a vertex's neighbours. Which storage suits this best?</p>",
      choices: [
        {
          id: "a",
          text: "An adjacency matrix: each question is one array read, and little space is wasted.",
          why: "The matrix has 800 × 800 = 640,000 cells and a nearly complete graph has almost that many edge entries, so little space is wasted. Checking one pair is a single read at <code>matrix[a][b]</code>.",
        },
        {
          id: "b",
          text: "An adjacency list, because lists use less memory than a matrix on a dense graph too.",
          why: "On a dense graph the lists hold about as many entries as the matrix has cells, so memory is similar. Answering the edge question then means scanning the list of <code>a</code>, which can hold close to 800 entries.",
        },
        {
          id: "c",
          text: "No stored graph: run a DFS from <code>a</code> each time and see whether it reaches <code>b</code>.",
          why: "DFS answers whether <code>b</code> is reachable, which is a different question from whether an edge joins the two directly. It can also walk much of the graph each time, far more work than one lookup.",
        },
        {
          id: "d",
          text: "A single array of all the edges, scanned from the start until the pair is found.",
          why: "A nearly complete graph has hundreds of thousands of edges, so one question can scan that many entries. Millions of questions could mean over a hundred billion comparisons.",
        },
      ],
      answer: "a",
    },
    {
      id: "gt-any-path-or-shortest",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>A maze is given as a grid of open cells and walls, and you may step up, down, left or right. You only need a yes or no: can the exit be reached from the entrance at all? Which statement is correct?</p>",
      choices: [
        {
          id: "a",
          text: "Only BFS can answer this, because DFS can go around a cycle of cells forever.",
          why: "With a visited set, DFS never enters a cell twice, so cycles cannot trap it. It finishes after at most one visit per reachable cell.",
        },
        {
          id: "b",
          text: "Only DFS can answer this, because BFS needs to know the depth of the exit beforehand.",
          why: "BFS needs no depth. It simply explores outward layer by layer until the queue is empty or the exit is found.",
        },
        {
          id: "c",
          text: "Neither applies to a grid, because the cells are not stored as an adjacency list.",
          why: "A grid is a graph in disguise: each open cell is a node and each step to a neighbouring open cell is an edge. The neighbours are computed from the row and column, so no stored list is needed.",
        },
        {
          id: "d",
          text: "Either works, because both reach every cell that can be reached from the entrance.",
          why: "Reachability does not depend on the order of exploration, so both traversals give the same yes or no. BFS earns its place when the question asks for the shortest route.",
        },
      ],
      answer: "d",
    },
    {
      id: "gt-trace-iterative-dfs",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "trace",
      pattern: "graph-traversal",
      section: "dfs-go-deep-backtrack-when-stuck",
      kind: "single",
      prompt:
        "<p>Here is the chapter's iterative DFS with an <code>order</code> array added to record the order in which nodes are popped. What does <code>dfsIterative(graph, 0)</code> return for the graph built below?</p><pre><code>function buildGraph(n, edges) {\n  const graph = Array.from({ length: n }, () =&gt; []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  return graph;\n}\n\nfunction dfsIterative(graph, start) {\n  const visited = new Set([start]);\n  const stack = [start];\n  const order = [];\n  while (stack.length) {\n    const node = stack.pop();\n    order.push(node);\n    for (const neighbor of graph[node]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        stack.push(neighbor);\n      }\n    }\n  }\n  return order;\n}\n\nconst graph = buildGraph(4, [[0, 1], [0, 2], [1, 3], [2, 3]]);\ndfsIterative(graph, 0);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 3, 2]</code>",
          why: "That is what the recursive version gives, because it walks the neighbours in list order. In the iterative version 1 and then 2 are pushed, and the top of the stack is 2, so 2 is popped second.",
        },
        {
          id: "b",
          text: "<code>[0, 1, 2, 3]</code>",
          why: "That is a breadth-first order, which comes from a queue. A stack pops the most recent push, so the node after 0 is 2, not 1.",
        },
        {
          id: "c",
          text: "<code>[0, 2, 3, 1]</code>",
          why: "Pop 0 and push 1, then 2. Pop 2 and push 3. Pop 3: its neighbours 1 and 2 are already marked, so nothing is pushed. Pop 1 last.",
        },
        {
          id: "d",
          text: "<code>[0, 2, 1, 3]</code>",
          why: "After 2 is popped, node 3 is pushed on top of the waiting 1, so 3 comes off the stack before 1.",
        },
      ],
      answer: "c",
    },
    {
      id: "gt-trace-distances",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "trace",
      pattern: "graph-traversal",
      section: "bfs-spread-outward-layer-by-layer",
      kind: "single",
      prompt:
        "<p>The graph below is a ring of five nodes. What does <code>distances(graph, 0)</code> return?</p><pre><code>function buildGraph(n, edges) {\n  const graph = Array.from({ length: n }, () =&gt; []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  return graph;\n}\n\nfunction distances(graph, start) {\n  const dist = new Array(graph.length).fill(-1);\n  dist[start] = 0;\n  const queue = [start];\n  while (queue.length) {\n    const node = queue.shift();\n    for (const next of graph[node]) {\n      if (dist[next] === -1) {\n        dist[next] = dist[node] + 1;\n        queue.push(next);\n      }\n    }\n  }\n  return dist;\n}\n\nconst graph = buildGraph(5, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0]]);\ndistances(graph, 0);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 2, 3, 4]</code>",
          why: "Those are the depths a walk 0 → 1 → 2 → 3 → 4 would reach. BFS sets <code>dist[4]</code> while it handles node 0, because 4 is a neighbour of 0, so it gets 1.",
        },
        {
          id: "b",
          text: "<code>[0, 1, 2, 2, 1]</code>",
          why: "Node 0 has neighbours 1 and 4, so both get 1. Node 1 gives node 2 the distance 2, and node 4 gives node 3 the distance 2. Nodes 2 and 3 are each two steps away, one way round the ring or the other.",
        },
        {
          id: "c",
          text: "<code>[0, 1, 1, 2, 2]</code>",
          why: "This treats node 2 as a neighbour of 0, but the edges at node 0 go only to 1 and 4. Node 2 is reached through node 1, which makes it two steps away.",
        },
        {
          id: "d",
          text: "<code>[0, 1, 2, 2, 2]</code>",
          why: "Node 4 is joined directly to node 0, so its distance is 1, not 2. The ring offers two routes to each node and BFS keeps the shorter one.",
        },
      ],
      answer: "b",
    },
    {
      id: "gt-mark-on-dequeue",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "bfs-spread-outward-layer-by-layer",
      kind: "single",
      prompt:
        "<p>This BFS marks a node as visited only when it is dequeued. The graph is a triangle: node 0 is joined to 1 and 2, and node 1 is joined to 2. The variable <code>pushes</code> starts at 1 for the initial <code>queue = [0]</code>. What is <code>pushes</code> when the loop ends?</p><pre><code>const graph = [[1, 2], [0, 2], [0, 1]];\nconst visited = new Set();\nconst queue = [0];\nlet pushes = 1;\nwhile (queue.length) {\n  const node = queue.shift();\n  if (visited.has(node)) continue;\n  visited.add(node);\n  for (const next of graph[node]) {\n    if (!visited.has(next)) {\n      queue.push(next);\n      pushes++;\n    }\n  }\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "3, because each node is queued once.",
          why: "That would be true if nodes were marked when enqueued. Here node 2 is not marked until it is dequeued, so node 0 and node 1 both queue it.",
        },
        {
          id: "b",
          text: "5, because the second copy of node 2 queues its neighbours again.",
          why: "The second copy of 2 is dequeued after the first one has been marked, so the <code>continue</code> skips it and it queues nothing. The count stops before reaching 5.",
        },
        {
          id: "c",
          text: "6, because every adjacency entry causes a push.",
          why: "The triangle has six adjacency entries, but a push happens only towards a neighbour that is not yet visited. Three of those six entries point at nodes that are already marked, so they push nothing.",
        },
        {
          id: "d",
          text: "4, because node 2 is queued twice.",
          why: "The initial 0 counts once. Node 0 pushes 1 and 2. Node 1 is dequeued and, with 2 not yet visited, pushes 2 again. Node 2 then finds 0 and 1 visited and pushes nothing, and the second copy of 2 is skipped. Marking on enqueue would have kept it to 3.",
        },
      ],
      answer: "d",
    },
    {
      id: "gt-other-component",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "bfs-spread-outward-layer-by-layer",
      kind: "single",
      prompt:
        "<p>Using the <code>bfs</code> function from the chapter, what does <code>bfs(graph, 0)</code> return when <code>graph = [[1], [0], [3], [2]]</code>, two separate pairs of connected nodes?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1]</code>, because only nodes reachable from the start are visited.",
          why: "Nodes 2 and 3 are joined to each other but not to 0 or 1, so the queue runs empty after node 1. To cover the whole graph, call BFS again from every node that is still unvisited.",
        },
        {
          id: "b",
          text: "<code>[0, 1, 2, 3]</code>, because BFS visits every node of the graph.",
          why: "BFS visits only the connected component of its start node. A node with no path from the start is never put on the queue.",
        },
        {
          id: "c",
          text: "It throws an error, because nodes 2 and 3 can never be reached.",
          why: "Nothing in the code expects every node to be reachable. The queue simply becomes empty and the function returns normally.",
        },
        {
          id: "d",
          text: "<code>[0, 1]</code> followed by <code>undefined</code> for each unreached node.",
          why: "The function returns the array <code>order</code>, which only ever receives nodes that were dequeued. Its length is the number of reached nodes, with no placeholders.",
        },
      ],
      answer: "a",
    },
    {
      id: "gt-matrix-bfs-time",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "complexity",
      pattern: "graph-traversal",
      section: "two-ways-to-store-one-and-when-each-wins",
      kind: "single",
      prompt:
        "<p>This BFS reads an adjacency matrix with V rows and V columns. In the worst case, how does its running time grow with V, counting each <code>shift()</code> as one step?</p><pre><code>function bfsMatrix(matrix, start) {\n  const n = matrix.length;\n  const visited = new Set([start]);\n  const queue = [start];\n  while (queue.length) {\n    const node = queue.shift();\n    for (let next = 0; next &lt; n; next++) {\n      if (matrix[node][next] === 1 &amp;&amp; !visited.has(next)) {\n        visited.add(next);\n        queue.push(next);\n      }\n    }\n  }\n  return visited;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(V + E)",
          why: "That is the cost with adjacency lists, where a node's loop runs once per actual neighbour. With a matrix, every dequeued node scans a whole row of V cells.",
        },
        {
          id: "b",
          text: "O(V²)",
          why: "Each reachable node is dequeued once and its row of V cells is scanned in full, whether it has two neighbours or two hundred. V nodes times V cells per row gives O(V²), even when the graph is only a path.",
        },
        {
          id: "c",
          text: "O(E)",
          why: "E counts only the 1 entries, but the loop also reads every 0 entry in each scanned row. Those reads cost time too.",
        },
        {
          id: "d",
          text: "O(V log V)",
          why: "Nothing here sorts or halves a range. The inner loop is a plain scan of V cells for each of up to V nodes.",
        },
      ],
      answer: "b",
    },
    {
      id: "gt-peak-memory",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "complexity",
      pattern: "graph-traversal",
      section: "dfs-vs-bfs-the-complexity-is-identical-the-use-case-isn-t",
      kind: "multi",
      prompt:
        "<p>Consider only the peak size of the BFS queue and of the recursive DFS call stack, not the visited set or the graph itself. A graph has V vertices. Select every true statement.</p>",
      choices: [
        {
          id: "a",
          text: "BFS started at the centre of a star, a centre joined to V − 1 leaves, can hold V − 1 nodes in its queue at once.",
          why: "After the centre is dequeued, all V − 1 leaves are queued before any of them is dequeued. BFS memory follows the width of a layer, and here one layer is nearly the whole graph.",
        },
        {
          id: "b",
          text: "BFS started in the middle of a path of V nodes has to hold about V / 2 nodes in its queue at once.",
          why: "On a path each layer holds at most two nodes, one on each side of the start. The queue never holds more than 2, however long the path is.",
        },
        {
          id: "c",
          text: "Recursive DFS started at one end of a path of V nodes reaches a call depth of V.",
          why: "DFS goes from each node into its only unvisited neighbour without returning, so V calls are open at the deepest point. That is why recursive DFS on a long path can run out of stack space.",
        },
        {
          id: "d",
          text: "DFS never needs more of these structures than BFS does on the same graph.",
          why: "A path started at one end is a counterexample: DFS needs V open calls while the BFS queue holds one node. Which one is larger depends on the shape of the graph.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "gt-order-bfs-pass",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "trace",
      pattern: "graph-traversal",
      section: "bfs-spread-outward-layer-by-layer",
      kind: "order",
      prompt:
        "<p>Put the steps of one pass through the loop of <code>reach</code> in the order they happen for a single neighbour. Start with the test that lets the pass begin, and end with the step that moves on to the next neighbour.</p><pre><code>function reach(graph, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  while (queue.length) {\n    const node = queue.shift();\n    for (const neighbor of graph[node]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return visited;\n}</code></pre>",
      items: [
        { id: "test", text: "Test <code>queue.length</code> to see whether any node is still waiting." },
        { id: "take", text: "Take the front node out of the queue and call it <code>node</code>." },
        { id: "pick", text: "Pick the next neighbour from <code>graph[node]</code>." },
        { id: "ask", text: "Ask whether that neighbour is already in <code>visited</code>." },
        {
          id: "mark",
          text: "If it is not, add it to <code>visited</code>, push it onto the queue, and move on to the next neighbour.",
        },
      ],
      why: "The loop test decides whether the pass runs at all, and the node taken from the queue decides which neighbours there are to look at. A neighbour has to be picked before it can be checked, and it is checked before it is marked and queued. Marking at the moment of queuing is what stops the same node from being queued twice.",
    },
    {
      id: "gt-shared-fill",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "weighted-directed-and-labelled-graphs",
      kind: "single",
      prompt:
        "<p>A solution builds its adjacency list with <code>new Array(3).fill([])</code>. What does <code>graph</code> hold after these lines?</p><pre><code>const graph = new Array(3).fill([]);\ngraph[0].push(1);\ngraph[2].push(0);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[1], [], [0]]</code>",
          why: "This is what three separate lists would give. <code>fill</code> does not make three arrays: it stores the one array it was given in every slot.",
        },
        {
          id: "b",
          text: "<code>[[1], [0], []]</code>",
          why: "Nothing shifts the pushed values into other slots by position. The three slots all refer to one array, so each push is visible through every slot.",
        },
        {
          id: "c",
          text: "<code>[[1, 0], [1, 0], [1, 0]]</code>",
          why: "All three slots point at the same array. Both pushes land in it, and each slot shows it. <code>Array.from({ length: 3 }, () =&gt; [])</code> gives three separate arrays.",
        },
        {
          id: "d",
          text: "A <code>TypeError</code>, because <code>fill</code> cannot take an array.",
          why: "<code>fill</code> accepts any value, including an array. The problem is that it reuses that one value for every slot, and no error is raised.",
        },
      ],
      answer: "c",
    },
    {
      id: "gt-trace-parent-path",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "trace",
      pattern: "graph-traversal",
      section: "bfs-with-distances-and-the-path-itself",
      kind: "single",
      prompt:
        "<p>What does the last line return?</p><pre><code>function shortestPath(graph, source, target) {\n  const parent = new Array(graph.length).fill(-2);\n  parent[source] = -1;\n  const queue = [source];\n  for (let head = 0; head &lt; queue.length &amp;&amp; parent[target] === -2; head++) {\n    const node = queue[head];\n    for (const next of graph[node]) {\n      if (parent[next] === -2) {\n        parent[next] = node;\n        queue.push(next);\n      }\n    }\n  }\n  if (parent[target] === -2) return null;\n  const path = [];\n  for (let at = target; at !== -1; at = parent[at]) path.push(at);\n  return path.reverse();\n}\n\nconst graph = [[1, 2], [0, 3], [0, 3], [1, 2, 4], [3]];\nshortestPath(graph, 0, 4);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 3, 4]</code>",
          why: "Node 0 finds 1 and 2. Node 1 is next in the queue and finds 3, so the parent of 3 is 1, and 2 later finds 3 already seen. Node 3 finds 4. Following parents from 4 gives 3, 1, 0, and the reverse is <code>[0, 1, 3, 4]</code>.",
        },
        {
          id: "b",
          text: "<code>[0, 2, 3, 4]</code>",
          why: "Both 1 and 2 are one step from 3, but 1 comes first in the queue because it is listed first in the neighbours of 0. So 3 gets the parent 1, and 2 is too late to claim it.",
        },
        {
          id: "c",
          text: "<code>[4, 3, 1, 0]</code>",
          why: "These are the right nodes in the order the parents are followed, from the target back to the source. The function reverses the list before returning it.",
        },
        {
          id: "d",
          text: "<code>[0, 3, 4]</code>",
          why: "There is no edge between 0 and 3, since the neighbours of 0 are 1 and 2. A path may only use the edges in the lists.",
        },
      ],
      answer: "a",
    },
    {
      id: "gt-deep-chain",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "dfs-and-the-call-stack-when-recursion-runs-out",
      kind: "single",
      prompt:
        "<p>A graph has 100,000 nodes joined in one long chain, and a solution searches it with the recursive <code>dfs(graph, start, visited)</code> from the chapter. The work is O(V + E). What is the risk?</p>",
      choices: [
        {
          id: "a",
          text: "It visits the nodes in a different order from the iterative version, so the answer changes.",
          why: "Both visit the same set of nodes, and on a chain there is only one path to follow, so the order is not the problem.",
        },
        {
          id: "b",
          text: "It loops forever, because a chain has no cycle to stop at.",
          why: "A chain is the simplest case to stop on. The search ends at the last node, which has no unvisited neighbour.",
        },
        {
          id: "c",
          text: "It uses O(E²) time, because each call rescans its parent's neighbours.",
          why: "Each call looks at its own neighbour list once. The total stays O(V + E).",
        },
        {
          id: "d",
          text: "It can throw a <code>RangeError</code>, because every active call is a frame on the call stack and the depth reaches 100,000.",
          why: "On a chain the recursion goes one level deeper for every node. In a run with Node 24, a recursive search of a chain of 3,000 nodes finished and one of 10,000 threw <code>Maximum call stack size exceeded</code>. An explicit stack or BFS has no such limit.",
        },
      ],
      answer: "d",
    },
    {
      id: "gt-component-loop-cost",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "complexity",
      pattern: "graph-traversal",
      section: "disconnected-graphs-the-outer-loop",
      kind: "single",
      prompt:
        "<p>A function loops over every node of a graph with V nodes and E edges, and starts a BFS from each node that has no label yet. Each BFS labels everything it reaches. What is the worst-case time of the whole function?</p>",
      choices: [
        {
          id: "a",
          text: "O(V + E), because every node is enqueued once and every edge is examined a constant number of times.",
          why: "The loop over the nodes costs O(V). The searches together enqueue each node once and scan each node's neighbour list once, which is O(V + E) over all of them.",
        },
        {
          id: "b",
          text: "O(V · (V + E)), because there can be V searches and each costs O(V + E).",
          why: "A search only starts from an unlabelled node, and it labels every node it reaches. A node is therefore enqueued in one search only, so the searches share the O(V + E) between them instead of each costing that much.",
        },
        {
          id: "c",
          text: "O(V²), because the loop over nodes contains a BFS.",
          why: "The loop contains a BFS, but the BFS is not run to completion for every node. Most nodes are skipped because an earlier search already labelled them.",
        },
        {
          id: "d",
          text: "O(E log V), because the searches need a priority queue.",
          why: "BFS uses a plain queue and no ordering by weight, so there is no log factor.",
        },
      ],
      answer: "a",
    },
    {
      id: "gt-clone-register-late",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "clone-graph-copying-a-structure-that-has-cycles",
      kind: "single",
      prompt:
        "<p>In this clone function the line that stores the copy in the map comes <em>after</em> the loop over neighbours. Two nodes, A and B, list each other as their only neighbour. What happens when <code>cloneGraph(A)</code> runs?</p><pre><code>function cloneGraph(node) {\n  if (node === null) return null;\n  const copies = new Map();\n  function copy(original) {\n    if (copies.has(original)) return copies.get(original);\n    const clone = new GraphNode(original.val);\n    for (const neighbor of original.neighbors) clone.neighbors.push(copy(neighbor));\n    copies.set(original, clone);\n    return clone;\n  }\n  return copy(node);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "It returns a correct copy, because the map is still filled in the end.",
          why: "The map is only filled after the neighbour loop finishes, and the loop of A needs the copy of B, whose loop needs the copy of A again. Neither loop ever finishes.",
        },
        {
          id: "b",
          text: "It recurses without end, from A to B and back to A, and throws a <code>RangeError</code>.",
          why: "When <code>copy(B)</code> asks for A, the map still has no entry for A, so it starts another copy of A. This repeats until the call stack is full. Storing the copy before the loop makes the second request return at once.",
        },
        {
          id: "c",
          text: "It returns <code>null</code> for the second node.",
          why: "Nothing in the code returns <code>null</code> for a node that exists. The only <code>null</code> check is at the top, for the whole input.",
        },
        {
          id: "d",
          text: "It returns copies that share the original neighbour objects.",
          why: "The code builds each neighbour array from fresh copies, so nothing shared would be returned. The problem is that it never returns.",
        },
      ],
      answer: "b",
    },
    {
      id: "gt-bfs-not-cheapest",
      chapter: "dsa-graphs-representation-traversal",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "bfs-with-distances-and-the-path-itself",
      kind: "single",
      prompt:
        "<p>Four towns are joined by roads with lengths in kilometres: A–B is 1, B–D is 1, D–C is 1 and A–C is 10. You run the chapter's BFS from A to find the route to C. What does it return, and is it the shortest in kilometres?</p>",
      choices: [
        {
          id: "a",
          text: "A, B, D, C, which is 3 km and the shortest.",
          why: "This is the cheapest route, but BFS does not look at lengths. It stops as soon as C is found, and C is found directly from A.",
        },
        {
          id: "b",
          text: "It returns <code>null</code>, because the roads have different lengths.",
          why: "BFS ignores the numbers on the edges. A route exists, so a path comes back.",
        },
        {
          id: "c",
          text: "A, C, which is 10 km, and it is not the shortest.",
          why: "BFS counts edges, not kilometres, and A–C is a single edge. The route through B and D is longer in edges but only 3 km.",
        },
        {
          id: "d",
          text: "A, C, which is 10 km, and it is the shortest, because BFS always minimises distance.",
          why: "BFS minimises the <em>number of edges</em>, and only that is guaranteed. For lengths it can return a much longer route, as here, where the road A–C is 10 km while A, B, D, C is 3 km.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "graph-traversal",
    chapter: "dsa-graphs-representation-traversal",
    signals: [
      "The input is nodes and edges, or a grid where each cell is joined to its neighbours.",
      "The prompt asks for the fewest steps or moves on an unweighted graph, which points to BFS.",
      "The prompt asks whether one place can be reached from another, or to explore every option, which points to DFS.",
      "The prompt asks how a graph should be stored, and its edges are few compared with V squared.",
    ],
    template:
      "<pre><code>function bfs(graph, start) {\n  const visited = new Set([start]);\n  const queue = [start];\n  while (queue.length) {\n    const node = queue.shift();\n    for (const neighbor of graph[node]) {\n      if (!visited.has(neighbor)) {\n        visited.add(neighbor);\n        queue.push(neighbor);\n      }\n    }\n  }\n  return visited;\n}</code></pre>",
    time: "O(V + E)",
    space: "O(V)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
