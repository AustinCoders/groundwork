import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "gpb-circular-dependency",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "recognizing-which-one-an-unseen-problem-wants",
      placement: true,
      kind: "single",
      prompt:
        "<p>A build tool reads lines such as “app needs lib” and “lib needs core”. Before building anything it must report whether the lines contain a circular dependency, for example “core needs app”. Which check is right?</p>",
      choices: [
        {
          id: "a",
          text: "Ignore the direction of every line, treat it as an undirected edge, and run the undirected cycle check with a parent.",
          why: "Direction matters here. “app needs lib”, “app needs core” and “lib needs core” form a cycle when the arrows are ignored, yet nothing depends on itself, so the tool would raise a false alarm.",
        },
        {
          id: "b",
          text: "Run DFS with three states: unvisited, in progress, and done, and report a cycle on reaching an in-progress package.",
          why: "An edge back to a package that is still open on the current path means that package depends, through a chain, on itself. An edge to a package that is already done is harmless, which is what the third state separates.",
        },
        {
          id: "c",
          text: "Run BFS with a visited set and report a circular dependency whenever a package is reached for the second time.",
          why: "Two different chains can lead to the same package without any circularity: app needs lib, lib needs core, and app needs core. Reaching core twice proves nothing about a cycle.",
        },
        {
          id: "d",
          text: "Colour the packages with two colours so that every “needs” line joins different colours, and report a cycle when that fails.",
          why: "A two-colouring fails only when the lines contain an odd cycle once directions are ignored. A circular dependency of four packages, a needs b needs c needs d needs a, colours without a clash, so this check would miss it.",
        },
      ],
      answer: "b",
    },
    {
      id: "gpb-two-teams",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "bipartite-check-can-you-2-color-it-with-no-clashes",
      placement: true,
      kind: "single",
      prompt:
        "<p>You get a list of players and a list of rival pairs. Rivals must not be on the same team. Decide whether everyone can be placed on one of two teams so that no rival pair shares a team. Which approach is right?</p>",
      choices: [
        {
          id: "a",
          text: "Count the connected components of the rivalry graph and answer yes when there are at least two of them.",
          why: "The number of components says how the rivalries cluster, not whether a split exists. Two separate groups can each be a triangle of mutual rivals, and a triangle cannot be split into two teams.",
        },
        {
          id: "b",
          text: "Run a cycle check on the rivalry graph and answer no whenever the rivalries contain any cycle at all.",
          why: "Only a cycle of odd length blocks the split. Four players A, B, C, D with rivalries A–B, B–C, C–D and D–A form a cycle, yet A and C can play against B and D.",
        },
        {
          id: "c",
          text: "Colour players with BFS or DFS from every uncoloured player, giving rivals opposite colours, and answer no if a rival pair clashes.",
          why: "A rival pair with the same colour proves the split is impossible, because the colours were forced. Repeating from every uncoloured player covers groups that are not connected to the first one.",
        },
        {
          id: "d",
          text: "Sort the players by how many rivals they have, fewest first, and put them on alternating teams in that order.",
          why: "This can put rivals together. On the line A–B–C–D, with fewest rivals first and ties kept in listed order, the sort gives A, D, B, C, and alternating puts A and B, who are rivals, on the same team.",
        },
      ],
      answer: "c",
    },
    {
      id: "gpb-count-islands",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "connected-components-how-many-separate-islands-exist",
      kind: "single",
      prompt:
        "<p>A map is a grid of <code>1</code> for land and <code>0</code> for water. Land cells that touch horizontally or vertically belong to the same island. You must count the islands. Which plan fits?</p>",
      choices: [
        {
          id: "a",
          text: "Scan every cell; at each land cell not yet seen, count one island and flood-fill it.",
          why: "Each flood fill uses up exactly one island, so the number of times a new fill starts is the number of islands. This is the connected-components loop with cells as nodes and touching land as edges.",
        },
        {
          id: "b",
          text: "Count the land cells that touch at least one water cell, since those mark the edges of islands.",
          why: "That counts coastline cells, not islands. One large island has many such cells, and the count says nothing about which cells belong together.",
        },
        {
          id: "c",
          text: "Run a single DFS from the top-left cell and count how many times it has to backtrack.",
          why: "A single DFS only reaches the cells connected to its start. Backtracking happens on dead ends within one island, so it does not count islands.",
        },
        {
          id: "d",
          text: "Run cycle detection on the land cells and count the number of cycles it finds.",
          why: "An island can be a straight line of cells and contain no cycle at all, and a large island can contain many cycles. Cycles are not what defines an island.",
        },
      ],
      answer: "a",
    },
    {
      id: "gpb-undirected-parent",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "cycle-detection-the-rule-differs-by-directed-vs-undirected",
      kind: "single",
      prompt:
        "<p>A teammate removes the <code>parent</code> check from the undirected cycle detector. The graph is the path 0 – 1 – 2, written as <code>[[1], [0, 2], [1]]</code>. What does <code>hasCycleUndirected(graph, 0, new Set())</code> return?</p><pre><code>function hasCycleUndirected(graph, node, visited) {\n  visited.add(node);\n  for (const next of graph[node]) {\n    if (!visited.has(next)) {\n      if (hasCycleUndirected(graph, next, visited)) return true;\n    } else {\n      return true;\n    }\n  }\n  return false;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>false</code>, because a path has no cycle and the code handles that.",
          why: "A path has no cycle, but this code does not return <code>false</code> for it. From node 1 the neighbour 0 is already visited, and the <code>else</code> branch answers <code>true</code> at once.",
        },
        {
          id: "b",
          text: "<code>true</code>: node 1 sees 0 as visited, but 0 is only the node it came from.",
          why: "In an undirected graph every edge appears in both lists, so each node sees the node it came from as a visited neighbour. Without excluding the parent, that is reported as a cycle, so the result is a false positive.",
        },
        {
          id: "c",
          text: "It never returns, because the two directions of an edge send the recursion back and forth forever.",
          why: "The visited set stops the recursion: node 0 is marked before node 1 is entered, so the call is never repeated. The function ends, just with the wrong answer.",
        },
        {
          id: "d",
          text: "<code>true</code>, because the three nodes form a cycle.",
          why: "Two edges join three nodes in a line, and a cycle would need a third edge closing the loop. The graph really has no cycle, which is why the <code>true</code> is a mistake.",
        },
      ],
      answer: "b",
    },
    {
      id: "gpb-trace-finished-order",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "graph-traversal",
      section: "cycle-detection-the-rule-differs-by-directed-vs-undirected",
      kind: "single",
      prompt:
        "<p>The directed graph below has edges 0 → 1, 0 → 2, 1 → 3 and 2 → 3. The code records each node in <code>finished</code> when it reaches state 2. What does it return, and what is <code>finished</code> afterwards?</p><pre><code>function check(graph, n) {\n  const state = new Array(n).fill(0);\n  const finished = [];\n\n  function dfs(node) {\n    state[node] = 1;\n    for (const next of graph[node]) {\n      if (state[next] === 1) return true;\n      if (state[next] === 0 &amp;&amp; dfs(next)) return true;\n    }\n    state[node] = 2;\n    finished.push(node);\n    return false;\n  }\n\n  for (let i = 0; i &lt; n; i++) {\n    if (state[i] === 0 &amp;&amp; dfs(i)) return true;\n  }\n  return finished;\n}\n\ncheck([[1, 2], [3], [3], []], 4);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1, 3, 2]</code>",
          why: "That is the order in which the nodes are entered. A node is added to <code>finished</code> only after all its neighbours are done, so node 0 comes last, not first.",
        },
        {
          id: "b",
          text: "<code>[3, 2, 1, 0]</code>",
          why: "Node 0 looks at its neighbours in the order of <code>graph[0]</code>, which is 1 and then 2. The whole of node 1 is finished, including node 3, before node 2 is even entered, so 1 finishes before 2.",
        },
        {
          id: "c",
          text: "<code>true</code>, because node 3 is reached twice.",
          why: "On the second arrival, from node 2, node 3 has state 2: it is finished, not in progress. Only a neighbour with state 1 signals a cycle, so this graph has none and the function returns the list.",
        },
        {
          id: "d",
          text: "<code>[3, 1, 2, 0]</code>",
          why: "Node 0 enters 1, which enters 3. Node 3 finishes first, then node 1. Back in node 0, node 2 is entered, finds 3 already done and finishes, and node 0 finishes last.",
        },
      ],
      answer: "d",
    },
    {
      id: "gpb-not-bipartite",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "bipartite-check-can-you-2-color-it-with-no-clashes",
      kind: "multi",
      prompt:
        "<p>Select every graph that is <em>not</em> bipartite, meaning it cannot be coloured with two colours so that every edge joins different colours.</p>",
      choices: [
        {
          id: "a",
          text: "A ring of four nodes, each joined to the next, with the last joined back to the first.",
          why: "Colouring the nodes in turn 1, −1, 1, −1 gives every edge two different colours, including the closing edge. Rings of even length can always be coloured this way.",
        },
        {
          id: "b",
          text: "A triangle, three nodes all joined to each other.",
          why: "The first node takes one colour, which forces the other two to take the opposite colour. Those two are joined to each other, so the edge between them joins equal colours.",
        },
        {
          id: "c",
          text: "A path of four nodes in a line.",
          why: "A path has no cycle, so alternating colours along it works. Any graph without cycles can be coloured this way.",
        },
        {
          id: "d",
          text: "A ring of five nodes, each joined to the next, with the last joined back to the first.",
          why: "Alternating colours around the ring puts the fifth node next to the first one with the same colour as it. A graph is bipartite exactly when it has no cycle of odd length.",
        },
      ],
      answers: ["b", "d"],
    },
    {
      id: "gpb-only-first-start",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "bipartite-check-can-you-2-color-it-with-no-clashes",
      kind: "single",
      prompt:
        "<p>A teammate removes the outer <code>for (let start = 0; ...)</code> loop from <code>isBipartite</code>, so colouring begins only at node 0. The graph is <code>[[1], [0], [3, 4], [2, 4], [2, 3]]</code>: nodes 0 and 1 are joined, and nodes 2, 3 and 4 form a triangle. What does the changed function return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>true</code>, which is wrong: the triangle is never reached from node 0, so it is never coloured or checked.",
          why: "Colouring spreads along edges, and no edge joins {0, 1} to {2, 3, 4}. The triangle is never touched, so the function reports success for a graph that is not bipartite.",
        },
        {
          id: "b",
          text: "<code>false</code>, because the colouring also reaches the triangle.",
          why: "Colouring from node 0 stays inside the connected component of node 0, which is only the nodes 0 and 1. The triangle is a separate component.",
        },
        {
          id: "c",
          text: "<code>true</code>, which is right, because nodes 0 and 1 can be coloured with two colours and they are the ones that matter.",
          why: "Every edge of the graph has to join different colours. The triangle's edges count as well, and they cannot be satisfied, so the answer for the whole graph is <code>false</code>.",
        },
        {
          id: "d",
          text: "It throws, because <code>color[2]</code> is undefined.",
          why: "The <code>color</code> array was created with one entry per node, all set to 0, so the entries for nodes 2, 3 and 4 exist. Nothing reads them in this run.",
        },
      ],
      answer: "a",
    },
    {
      id: "gpb-components-time",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "graph-traversal",
      section: "connected-components-how-many-separate-islands-exist",
      kind: "single",
      prompt:
        "<p>Here <code>n</code> is the number of nodes and <code>e</code> the number of edges. What is the tightest worst-case time of <code>countComponents</code>, including building the adjacency lists?</p><pre><code>function countComponents(n, edges) {\n  const graph = Array.from({ length: n }, () =&gt; []);\n  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u); }\n\n  const visited = new Set();\n  let components = 0;\n\n  for (let node = 0; node &lt; n; node++) {\n    if (visited.has(node)) continue;\n    components++;\n    const stack = [node];\n    visited.add(node);\n    while (stack.length) {\n      const curr = stack.pop();\n      for (const next of graph[curr]) {\n        if (!visited.has(next)) { visited.add(next); stack.push(next); }\n      }\n    }\n  }\n  return components;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²)",
          why: "That only matches a graph with about n² edges. A sparse graph does far less work, and O(n + e) describes both the sparse and the dense case.",
        },
        {
          id: "b",
          text: "O(e)",
          why: "The outer loop runs n times and builds n lists, even when there are no edges at all. With e = 0 the function still takes about n steps, so the n term cannot be left out.",
        },
        {
          id: "c",
          text: "O(n + e)",
          why: "<code>visited</code> is shared by all the flood fills, so every node is pushed once. Each edge is looked at once from each of its two ends, and the outer loop touches each node once, so the total is linear in n + e.",
        },
        {
          id: "d",
          text: "O(n · e)",
          why: "That would suggest every node triggers a walk over every edge. The shared <code>visited</code> set prevents it, and for a graph with no edges O(n · e) would even say zero work while the loop still runs n times.",
        },
      ],
      answer: "c",
    },
    {
      id: "gpb-fresh-state-time",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "graph-traversal",
      section: "cycle-detection-the-rule-differs-by-directed-vs-undirected",
      kind: "single",
      prompt:
        "<p>A teammate rewrites the directed cycle check so that every start node gets a brand new <code>state</code> array. Here <code>dfs</code> is the usual three-state DFS, <code>n</code> is the number of nodes and <code>e</code> the number of edges. On a graph with no cycle, what is the tightest worst-case time bound?</p><pre><code>function hasCycleSlow(graph, n) {\n  for (let start = 0; start &lt; n; start++) {\n    const state = new Array(n).fill(0);\n    if (dfs(graph, state, start)) return true;\n  }\n  return false;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n + e), the same as the version with one shared array.",
          why: "With one shared array every node and edge is processed once overall. With a new array for each start, a node that an earlier start already finished can be explored again by later starts.",
        },
        {
          id: "b",
          text: "O(n · e)",
          why: "This misses the cost of the new arrays. With no edges at all, creating n arrays of length n already takes n² steps, which O(n · e) cannot account for.",
        },
        {
          id: "c",
          text: "O(2ⁿ)",
          why: "Each single DFS visits a node at most once, because a node that is in progress or done is not entered again within that run. So each start costs only O(n + e), and there are n starts.",
        },
        {
          id: "d",
          text: "O(n · (n + e))",
          why: "There are n starts, and each one allocates an array of n entries and can walk up to all n nodes and e edges. A chain 0 → 1 → … → n − 1 already costs about n² in total, since each start walks the rest of the chain, and a dense graph costs on the order of n · e.",
        },
      ],
      answer: "d",
    },
    {
      id: "gpb-one-visited-flag",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "cycle-detection-the-rule-differs-by-directed-vs-undirected",
      kind: "single",
      prompt:
        "<p>A directed cycle check uses one <code>visited</code> Set and answers <code>true</code> whenever a neighbour is already in it, and its outer loop starts a search only from nodes not yet in <code>visited</code>. It is never given the in-progress and done states. For which input does it give the wrong answer?</p>",
      choices: [
        {
          id: "a",
          text: "A straight line of nodes: 0 → 1 → 2 → 3.",
          why: "Each node is entered once and no neighbour is ever already visited, so the check answers <code>false</code>, which is right for a path.",
        },
        {
          id: "b",
          text: "A ring of three nodes: 0 → 1 → 2 → 0.",
          why: "Node 2's neighbour 0 is in <code>visited</code>, so it answers <code>true</code>, which is right for this graph.",
        },
        {
          id: "c",
          text: "A diamond: 0 → 1, 0 → 2, 1 → 3 and 2 → 3.",
          why: "After 0, 1 and 3 are visited, the walk returns to 0 and enters 2, whose neighbour 3 is already in <code>visited</code>. The check answers <code>true</code>, but node 3 was finished, not in progress, and the diamond has no cycle.",
        },
        {
          id: "d",
          text: "One node with an edge pointing back to itself.",
          why: "Node 0 is added to <code>visited</code> and then finds itself as a neighbour, so the check answers <code>true</code>. A self-loop is a cycle, so that is right.",
        },
      ],
      answer: "c",
    },
    {
      id: "gpb-order-directed-dfs",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "graph-traversal",
      section: "cycle-detection-the-rule-differs-by-directed-vs-undirected",
      kind: "order",
      prompt:
        "<p>Consider one call of <code>dfs(node)</code> in <code>hasCycleDirected</code> for a node with a single neighbour <code>next</code> that is unvisited (state 0), where no cycle exists below it. Put the steps in order, starting with marking the node and ending with the step that finishes the call.</p><pre><code>function dfs(node) {\n  state[node] = 1;\n  for (const next of graph[node]) {\n    if (state[next] === 1) return true;\n    if (state[next] === 0 &amp;&amp; dfs(next)) return true;\n  }\n  state[node] = 2;\n  return false;\n}</code></pre>",
      items: [
        { id: "mark", text: "Set <code>state[node] = 1</code> to mark the node as in progress." },
        { id: "loop", text: "Begin going through <code>graph[node]</code> and take <code>next</code>." },
        { id: "progress", text: "Test whether <code>state[next]</code> is 1, which is false for this neighbour." },
        { id: "recurse", text: "Call <code>dfs(next)</code> and wait for it to return <code>false</code>." },
        { id: "done", text: "Set <code>state[node] = 2</code> and return <code>false</code>." },
      ],
      why: "A node is marked in progress before anything else, so that anything below it can see that it is still open. Each neighbour is then tested for state 1 before it is entered, and a neighbour in state 0 is entered and fully explored before the loop goes on. Only when no neighbours are left is the node marked done.",
    },
    {
      id: "gpb-provinces-cost",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "graph-traversal",
      section: "number-of-provinces-when-the-graph-arrives-as-a-matrix",
      kind: "single",
      prompt:
        "<p>The graph of n cities is given as an n by n matrix, and a traversal counts the provinces. The code finds the neighbours of a city by scanning that city's whole row. What is its worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n), because every city is visited once.",
          why: "Every city is visited once, but visiting it means scanning a row of n entries, so the work per city is O(n), not constant.",
        },
        {
          id: "b",
          text: "O(n + E), where E is the number of 1 entries off the diagonal, since each edge is followed once.",
          why: "That bound needs a neighbour list that holds only the real neighbours. A row of the matrix holds n entries, zeros included, and all of them are read.",
        },
        {
          id: "c",
          text: "O(n log n), because the cities are visited in order.",
          why: "No sorting or heap is involved. Visiting the cities in order does not add a log factor.",
        },
        {
          id: "d",
          text: "O(n²), because each of the n cities has its row of n entries read once.",
          why: "A matrix has n² cells and each city's row is scanned in full once. Reading the input already takes that long, so this is the cost of a matrix, not of the traversal.",
        },
      ],
      answer: "d",
    },
    {
      id: "gpb-tree-count-trap",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "graph-valid-tree-connected-with-no-cycle",
      kind: "single",
      prompt:
        "<p>A check for a valid tree on n nodes first compares the number of edges with n - 1, and then runs one traversal from node 0. For n = 4, which edge list passes the first test but is <em>not</em> a tree?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[[0, 1], [1, 2], [2, 0]]</code>",
          why: "This has 3 edges, which equals n - 1, but the edges form a triangle on 0, 1 and 2 and node 3 is never reached. The traversal sees 3 of 4 nodes and rejects it.",
        },
        {
          id: "b",
          text: "<code>[[0, 1], [1, 2], [2, 3]]</code>",
          why: "This is a chain through all four nodes. It has 3 edges, no cycle, and one traversal reaches all four, so it is a tree.",
        },
        {
          id: "c",
          text: "<code>[[0, 1], [1, 2]]</code>",
          why: "This has 2 edges, so it already fails the first test, and it also leaves node 3 alone.",
        },
        {
          id: "d",
          text: "<code>[[0, 1], [0, 2], [0, 3]]</code>",
          why: "This is a star around node 0. It has 3 edges and one traversal reaches all four nodes, so it is a tree.",
        },
      ],
      answer: "a",
    },
    {
      id: "gpb-dsu-recognise",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "graph-traversal",
      section: "edges-arriving-one-at-a-time-the-union-find-pointer",
      kind: "single",
      prompt:
        "<p>Undirected edges arrive one at a time. After each one you must say whether it closes a cycle with the edges so far. Which approach is the best fit?</p>",
      choices: [
        {
          id: "a",
          text: "Run a topological sort after every edge.",
          why: "Topological sort is for directed graphs, and an undirected edge has no direction to order by.",
        },
        {
          id: "b",
          text: "Run a full DFS over all the nodes after every edge, using a parent check to spot a cycle.",
          why: "This works but costs O(V + E) for each edge, which adds up to a quadratic total on a long list of edges.",
        },
        {
          id: "c",
          text: "Keep a union-find; report a cycle when the new edge joins two nodes that share a root.",
          why: "If both ends already have the same root, a path between them existed before this edge, so the edge closes a cycle. Each check is close to constant time.",
        },
        {
          id: "d",
          text: "Run a BFS from one end of each new edge to find the shortest path to its other end.",
          why: "A shortest path is more information than the question needs, and it still costs O(V + E) per edge.",
        },
      ],
      answer: "c",
    },
    {
      id: "gpb-all-paths-copy",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "reachability-what-can-i-get-to-from-here",
      kind: "single",
      prompt:
        "<p>This function lists every path from node 0 to the last node of a directed acyclic graph, but it stores <code>path</code> itself instead of a copy. What does the call return?</p><pre><code>function allPaths(graph) {\n  const target = graph.length - 1;\n  const paths = [];\n  const path = [0];\n  function dfs(node) {\n    if (node === target) {\n      paths.push(path);\n      return;\n    }\n    for (const next of graph[node]) {\n      path.push(next);\n      dfs(next);\n      path.pop();\n    }\n  }\n  dfs(0);\n  return paths;\n}\n\nallPaths([[1, 2], [3], [3], []]);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[0, 1, 3], [0, 2, 3]]</code>",
          why: "This is the intended answer, and it needs <code>paths.push([...path])</code>. Without the copy, the two stored paths are one and the same array.",
        },
        {
          id: "b",
          text: "<code>[[0], [0]]</code>",
          why: "Both pushes store the same <code>path</code> array. Every push and pop is applied to it, and once the search is finished it is back to <code>[0]</code>, so it shows that twice.",
        },
        {
          id: "c",
          text: "<code>[]</code>",
          why: "Both paths reach the target, so two entries are pushed. The entries just do not hold what was intended.",
        },
        {
          id: "d",
          text: "<code>[[0, 1, 3, 2, 3]]</code>",
          why: "Two entries are pushed, one for each path that reaches the target, not one combined entry. The pops remove nodes again as the search backs out of each path.",
        },
      ],
      answer: "b",
    },
    {
      id: "gpb-division-trace",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "graph-traversal",
      section: "weighted-dfs-evaluate-division",
      kind: "single",
      prompt:
        "<p>The chapter's <code>calcEquation</code> is given the equations <code>a / b = 2</code> and <code>b / c = 3</code>. What does it return for the single query <code>c / a</code>?</p>",
      choices: [
        {
          id: "a",
          text: "6",
          why: "That is <code>a / c</code>. The query asks for <code>c / a</code>, the inverse.",
        },
        {
          id: "b",
          text: "0.5",
          why: "That is <code>b / a</code>, one step along the reverse edge. The query needs two steps.",
        },
        {
          id: "c",
          text: "0.16666666666666666, which is 1/6",
          why: "The search goes from c to b along the reverse edge with weight 1/3, and from b to a along the reverse edge with weight 1/2. The product is 1/6.",
        },
        {
          id: "d",
          text: "-1",
          why: "Both c and a appear in the equations and are linked through b, so an answer exists.",
        },
      ],
      answer: "c",
    },
    {
      id: "gpb-all-paths-cost",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "graph-traversal",
      section: "reachability-what-can-i-get-to-from-here",
      kind: "single",
      prompt:
        "<p>A directed acyclic graph has n nodes, and every node has an edge to every node after it. A search lists all paths from the first node to the last by extending a path and backing out. Which statement about its time is right?</p>",
      choices: [
        {
          id: "a",
          text: "It is exponential in n, because there are 2<sup>n-2</sup> paths to build.",
          why: "Each of the n - 2 middle nodes can be on a path or off it, which gives 2<sup>n-2</sup> paths. The output alone is that large, so no search can finish faster.",
        },
        {
          id: "b",
          text: "It is O(V + E), because each node and edge is visited just once during the search.",
          why: "That holds when a node is visited once. Here a node is reached again by every path that goes through it, so the same edge is walked many times.",
        },
        {
          id: "c",
          text: "It is O(n²), because the graph has about n² edges and each is followed once.",
          why: "The graph has about n²/2 edges, but the search does not follow each edge only once. It follows each one on every path that uses it.",
        },
        {
          id: "d",
          text: "It is O(n log n), because the paths can be sorted by length.",
          why: "Nothing is sorted. The cost is dominated by producing the paths, not by ordering them.",
        },
      ],
      answer: "a",
    },
    {
      id: "gpb-indegree-cycle",
      chapter: "dsa-graph-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "graph-traversal",
      section: "reachability-what-can-i-get-to-from-here",
      kind: "single",
      prompt:
        "<p>The in-degree shortcut returns the nodes with no incoming edge as the smallest set from which everything is reachable. For 4 nodes and the directed edges <code>[[0, 1], [2, 3], [3, 2]]</code> it returns <code>[0]</code>. Is that a correct answer to the question?</p>",
      choices: [
        {
          id: "a",
          text: "Yes, because 0 is the only node with no incoming edge, and every such node has to be a start.",
          why: "That is how the shortcut works, but its argument assumes there is no cycle, and this graph has one.",
        },
        {
          id: "b",
          text: "Yes, because starting from 0 reaches 1 and then also reaches 2 and 3.",
          why: "There is no edge from 0 or 1 into 2 or 3, so starting from 0 reaches only 0 and 1.",
        },
        {
          id: "c",
          text: "No, because every one of the four nodes needs to be in the set to reach all of them.",
          why: "Node 1 is reachable from node 0, so it does not have to be in the set.",
        },
        {
          id: "d",
          text: "No, because 2 and 3 only feed each other, so 0 never reaches them and one must also start.",
          why: "The shortcut relies on an acyclic graph. A cycle with no edge coming in from outside is never reached from the in-degree-zero nodes, so one more start is needed for it.",
        },
      ],
      answer: "d",
    },
  ],
  pattern: {
    pattern: "graph-traversal",
    chapter: "dsa-graph-problems",
    signals: [
      "The prompt asks how many groups, islands or provinces exist.",
      "The prompt asks whether tasks with prerequisites can all be completed, or whether there is a circular dependency.",
      "The prompt asks whether items can be split into two groups with no conflicts inside a group.",
      "The input is pairs that say who is connected to whom, and the answer depends on a property of the whole graph.",
    ],
    template:
      "<pre><code>let components = 0;\nfor (let node = 0; node &lt; n; node++) {\n  if (visited.has(node)) continue;\n  components++;\n  floodFill(node, visited);\n}</code></pre>",
    time: "O(V + E)",
    space: "O(V)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
