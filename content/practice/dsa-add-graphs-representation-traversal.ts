import type { Exercise } from "../types";

export const dsaAddGraphsRepresentationTraversal: Exercise[] = [
  {
    "id": "ex-edges-to-adjacency-list",
    "chapter": "dsa-graphs-representation-traversal",
    "level": "beginner",
    "title": "Edge List to Adjacency List",
    "brief": "<p>Write <code>edgesToAdjacencyList(n, edges, directed)</code>. The graph has nodes <code>0</code> to <code>n - 1</code>, and <code>edges</code> is an array of <code>[u, v]</code> pairs. Return an array of length <code>n</code> in which element <code>i</code> is the array of the neighbours of node <code>i</code>.</p><ul><li>If <code>directed</code> is true, an edge <code>[u, v]</code> is stored only in <code>u</code>'s list</li><li>Otherwise it is stored in both lists, and a self-loop <code>[u, u]</code> is stored <b>once</b> in <code>u</code>'s list</li><li>Neighbours appear in the order the edges are given. Parallel edges are kept, so <code>[0, 1]</code> twice gives two entries</li><li>Nodes with no edges get an empty array, and every list must be its <b>own</b> array</li><li>The input <code>edges</code> must not be changed</li></ul>",
    "starter": "function edgesToAdjacencyList(n, edges, directed) {\n  // TODO: one fresh array per node, then fill it from the edges\n}\n",
    "hints": [
      "Create the outer array with Array.from({ length: n }, () => []). A shortcut such as new Array(n).fill([]) puts the same array in every slot, and one push then shows up everywhere.",
      "For each [u, v]: push v onto graph[u]. If the graph is undirected, also push u onto graph[v].",
      "A self-loop in an undirected graph would be pushed twice onto the same list. Guard the second push with u !== v so it is stored once."
    ],
    "solution": "function edgesToAdjacencyList(n, edges, directed) {\n  const graph = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    if (!directed && u !== v) graph[v].push(u);\n  }\n  return graph;\n}\n",
    "tests": [
      {
        "name": "an undirected path",
        "body": "assert.deepEqual(edgesToAdjacencyList(4, [[0, 1], [1, 2], [2, 3]], false), [[1], [0, 2], [1, 3], [2]]);"
      },
      {
        "name": "a directed graph stores each edge once",
        "body": "assert.deepEqual(edgesToAdjacencyList(3, [[0, 1], [1, 2], [2, 0]], true), [[1], [2], [0]]);"
      },
      {
        "name": "isolated nodes get empty lists",
        "body": "assert.deepEqual(edgesToAdjacencyList(4, [[1, 2]], false), [[], [2], [1], []]);"
      },
      {
        "name": "no nodes at all",
        "body": "assert.deepEqual(edgesToAdjacencyList(0, [], false), []);"
      },
      {
        "name": "no edges",
        "body": "assert.deepEqual(edgesToAdjacencyList(3, [], true), [[], [], []]);"
      },
      {
        "name": "neighbours keep the order of the edges",
        "body": "assert.deepEqual(edgesToAdjacencyList(4, [[0, 3], [0, 1], [0, 2]], true), [[3, 1, 2], [], [], []]);"
      },
      {
        "name": "an undirected self-loop is stored once",
        "body": "assert.deepEqual(edgesToAdjacencyList(2, [[0, 0], [0, 1]], false), [[0, 1], [0]]);\nassert.deepEqual(edgesToAdjacencyList(1, [[0, 0]], true), [[0]]);"
      },
      {
        "name": "parallel edges are kept",
        "body": "assert.deepEqual(edgesToAdjacencyList(2, [[0, 1], [0, 1]], false), [[1, 1], [0, 0]]);"
      },
      {
        "name": "every list is its own array",
        "body": "const g = edgesToAdjacencyList(3, [], false);\ng[0].push(9);\nassert.deepEqual(g, [[9], [], []]);\nassert.notEqual(g[0], g[1]);"
      },
      {
        "name": "does not change the edges it is given",
        "body": "const edges = [[0, 1], [1, 2]];\nedgesToAdjacencyList(3, edges, false);\nassert.deepEqual(edges, [[0, 1], [1, 2]]);"
      }
    ]
  },
  {
    "id": "ex-valid-path-exists",
    "chapter": "dsa-graphs-representation-traversal",
    "level": "beginner",
    "title": "Is There a Path Between Two Nodes",
    "brief": "<p>An undirected graph has nodes <code>0</code> to <code>n - 1</code> and an array of <code>edges</code>, each <code>[u, v]</code>. Return <code>true</code> if there is a path from <code>source</code> to <code>destination</code>, and <code>false</code> otherwise.</p><ul><li>A node always has a path to itself</li><li>The graph can be disconnected, can contain cycles, and can contain nodes with no edges</li><li>Aim for O(V + E). Do not use recursion on a graph that may be one long chain of 100,000 nodes</li></ul>",
    "starter": "function validPath(n, edges, source, destination) {\n  // TODO: build the adjacency list, then search from the source\n}\n",
    "hints": [
      "First turn the edge list into an adjacency list: each edge goes into both lists. Then it is a plain traversal question: is the destination reachable from the source?",
      "Mark nodes visited the moment you add them to the queue (or stack), so no node is added twice. Return true as soon as you see the destination.",
      "Use an index into the array for the queue, or a stack, instead of recursion. A chain of 100,000 nodes would overflow the call stack of a recursive DFS."
    ],
    "solution": "function validPath(n, edges, source, destination) {\n  if (source === destination) return true;\n  const graph = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  const seen = new Array(n).fill(false);\n  seen[source] = true;\n  const queue = [source];\n  for (let head = 0; head < queue.length; head++) {\n    for (const next of graph[queue[head]]) {\n      if (next === destination) return true;\n      if (!seen[next]) {\n        seen[next] = true;\n        queue.push(next);\n      }\n    }\n  }\n  return false;\n}\n",
    "tests": [
      {
        "name": "connected through a triangle",
        "body": "assert.equal(validPath(3, [[0, 1], [1, 2], [2, 0]], 0, 2), true);"
      },
      {
        "name": "two separate pieces",
        "body": "assert.equal(validPath(6, [[0, 1], [0, 2], [3, 5], [5, 4], [4, 3]], 0, 5), false);"
      },
      {
        "name": "a node has a path to itself even with no edges",
        "body": "assert.equal(validPath(1, [], 0, 0), true);\nassert.equal(validPath(5, [[1, 2]], 4, 4), true);"
      },
      {
        "name": "an isolated destination is unreachable",
        "body": "assert.equal(validPath(4, [[0, 1], [1, 2]], 0, 3), false);"
      },
      {
        "name": "the edge can be listed in either direction",
        "body": "assert.equal(validPath(3, [[2, 1], [1, 0]], 0, 2), true);"
      },
      {
        "name": "a path that needs several steps around a cycle",
        "body": "assert.equal(validPath(6, [[0, 1], [1, 2], [2, 3], [3, 0], [3, 4], [4, 5]], 1, 5), true);"
      },
      {
        "name": "self-loops and repeated edges do not matter",
        "body": "assert.equal(validPath(3, [[0, 0], [0, 1], [0, 1]], 0, 2), false);\nassert.equal(validPath(3, [[0, 0], [0, 1], [1, 2]], 0, 2), true);"
      },
      {
        "name": "a very long chain does not overflow the stack",
        "body": "const n = 100000;\nconst edges = [];\nfor (let i = 0; i + 1 < n; i++) edges.push([i, i + 1]);\nassert.equal(validPath(n, edges, 0, n - 1), true);\nassert.equal(validPath(n, edges.slice(0, 500), 0, n - 1), false);"
      }
    ]
  },
  {
    "id": "ex-shortest-path-unweighted",
    "chapter": "dsa-graphs-representation-traversal",
    "level": "intermediate",
    "title": "Shortest Path in an Unweighted Graph",
    "brief": "<p>An undirected graph has nodes <code>0</code> to <code>n - 1</code> and an array of <code>edges</code>. Return a <b>shortest path</b> from <code>source</code> to <code>target</code> as an array of nodes, starting with <code>source</code> and ending with <code>target</code>, where each consecutive pair is joined by an edge.</p><ul><li>If <code>source === target</code>, return <code>[source]</code></li><li>If there is no path, return <code>null</code></li><li>When several paths tie for shortest, any one of them is accepted</li><li>O(V + E) time</li></ul>",
    "starter": "function shortestPathInGraph(n, edges, source, target) {\n  // TODO: BFS that remembers, for each node, which node discovered it\n}\n",
    "hints": [
      "BFS visits nodes in order of distance, so the first time a node is reached is along a shortest path. Record that moment's predecessor in a parent array, and use the array as the visited set too.",
      "Fill parent with a marker such as -2 for 'not seen' and set parent[source] = -1. When you enqueue next from node, set parent[next] = node.",
      "To build the answer, start at target and follow parent links back to the source, pushing each node, then reverse. If target was never reached, return null."
    ],
    "solution": "function shortestPathInGraph(n, edges, source, target) {\n  const graph = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  const parent = new Array(n).fill(-2);\n  parent[source] = -1;\n  const queue = [source];\n  for (let head = 0; head < queue.length && parent[target] === -2; head++) {\n    const node = queue[head];\n    for (const next of graph[node]) {\n      if (parent[next] === -2) {\n        parent[next] = node;\n        queue.push(next);\n      }\n    }\n  }\n  if (parent[target] === -2) return null;\n  const path = [];\n  for (let at = target; at !== -1; at = parent[at]) path.push(at);\n  return path.reverse();\n}\n",
    "tests": [
      {
        "name": "a straight line",
        "body": "assert.deepEqual(shortestPathInGraph(4, [[0, 1], [1, 2], [2, 3]], 0, 3), [0, 1, 2, 3]);"
      },
      {
        "name": "same source and target",
        "body": "assert.deepEqual(shortestPathInGraph(3, [[0, 1]], 2, 2), [2]);"
      },
      {
        "name": "unreachable returns null",
        "body": "assert.equal(shortestPathInGraph(4, [[0, 1], [2, 3]], 0, 3), null);"
      },
      {
        "name": "takes the shortcut, not the long way round",
        "body": "const edges = [[0, 1], [1, 2], [2, 3], [3, 4], [0, 4]];\nassert.deepEqual(shortestPathInGraph(5, edges, 0, 3), [0, 4, 3]);"
      },
      {
        "name": "a tie may return either shortest path",
        "body": "const path = shortestPathInGraph(4, [[0, 1], [0, 2], [1, 3], [2, 3]], 0, 3);\nassert.equal(path.length, 3);\nassert.equal(path[0], 0);\nassert.equal(path[2], 3);\nassert.ok(path[1] === 1 || path[1] === 2);"
      },
      {
        "name": "every step in the returned path is a real edge",
        "body": "const edges = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [4, 5], [2, 5]];\nconst path = shortestPathInGraph(6, edges, 0, 5);\nassert.equal(path.length, 3);\nconst has = (a, b) => edges.some(([u, v]) => (u === a && v === b) || (u === b && v === a));\nfor (let i = 0; i + 1 < path.length; i++) assert.ok(has(path[i], path[i + 1]));"
      },
      {
        "name": "cycles do not trap the search",
        "body": "const edges = [[0, 1], [1, 2], [2, 0], [2, 3]];\nassert.deepEqual(shortestPathInGraph(4, edges, 0, 3), [0, 2, 3]);"
      },
      {
        "name": "a path in a graph with isolated nodes",
        "body": "assert.deepEqual(shortestPathInGraph(5, [[1, 3]], 3, 1), [3, 1]);\nassert.equal(shortestPathInGraph(5, [[1, 3]], 0, 1), null);"
      },
      {
        "name": "random graphs: the path length equals the true distance",
        "body": "let seed = 17;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 30; t++) {\n  const n = 2 + next() % 9;\n  const edges = [];\n  for (let i = 0; i < next() % 14; i++) edges.push([next() % n, next() % n]);\n  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));\n  for (const [u, v] of edges) if (u !== v) dist[u][v] = dist[v][u] = 1;\n  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][k] + dist[k][j]);\n  const s = next() % n;\n  const e = next() % n;\n  const path = shortestPathInGraph(n, edges, s, e);\n  if (dist[s][e] === Infinity) assert.equal(path, null);\n  else {\n    assert.equal(path.length - 1, dist[s][e]);\n    assert.equal(path[0], s);\n    assert.equal(path[path.length - 1], e);\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-label-components",
    "chapter": "dsa-graphs-representation-traversal",
    "level": "intermediate",
    "title": "Label Connected Components",
    "brief": "<p>An undirected graph has nodes <code>0</code> to <code>n - 1</code> and an array of <code>edges</code>. Return an array <code>label</code> of length <code>n</code> where <code>label[i]</code> says which connected component node <code>i</code> belongs to.</p><ul><li>Number the components <code>0, 1, 2, ...</code> in the order of their <b>smallest node</b>: the component that contains node 0 is 0, the next component to appear when scanning nodes from 0 upwards is 1, and so on</li><li>Two nodes have the same label exactly when there is a path between them</li><li>A node with no edges is a component of its own</li><li>O(V + E) time</li></ul>",
    "starter": "function labelComponents(n, edges) {\n  // TODO: loop over every node; each unlabelled node starts a new traversal\n}\n",
    "hints": [
      "One traversal from one node only reaches its own component. To cover the whole graph, loop over every node and start a traversal from each node that has no label yet.",
      "Use the label array as the visited set: -1 means 'no label'. Give the start node the current count, push it, and label every neighbour you find with the same number.",
      "Because you scan start nodes in increasing order, the numbering by smallest node comes for free. Increase the count after each traversal finishes."
    ],
    "solution": "function labelComponents(n, edges) {\n  const graph = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  const label = new Array(n).fill(-1);\n  let count = 0;\n  for (let start = 0; start < n; start++) {\n    if (label[start] !== -1) continue;\n    label[start] = count;\n    const queue = [start];\n    for (let head = 0; head < queue.length; head++) {\n      for (const next of graph[queue[head]]) {\n        if (label[next] === -1) {\n          label[next] = count;\n          queue.push(next);\n        }\n      }\n    }\n    count++;\n  }\n  return label;\n}\n",
    "tests": [
      {
        "name": "two pieces and a lone node",
        "body": "assert.deepEqual(labelComponents(6, [[0, 1], [1, 2], [3, 4]]), [0, 0, 0, 1, 1, 2]);"
      },
      {
        "name": "a fully connected graph has one label",
        "body": "assert.deepEqual(labelComponents(4, [[0, 1], [1, 2], [2, 3], [3, 0]]), [0, 0, 0, 0]);"
      },
      {
        "name": "no edges: every node is its own component",
        "body": "assert.deepEqual(labelComponents(3, []), [0, 1, 2]);"
      },
      {
        "name": "labels follow the smallest node, not the order of the edges",
        "body": "assert.deepEqual(labelComponents(5, [[4, 3], [2, 1]]), [0, 1, 1, 2, 2]);"
      },
      {
        "name": "an empty graph",
        "body": "assert.deepEqual(labelComponents(0, []), []);"
      },
      {
        "name": "a component whose nodes are far apart in number",
        "body": "assert.deepEqual(labelComponents(5, [[0, 4], [1, 3]]), [0, 1, 2, 1, 0]);"
      },
      {
        "name": "self-loops and repeated edges do not add components",
        "body": "assert.deepEqual(labelComponents(3, [[0, 0], [0, 1], [0, 1]]), [0, 0, 1]);"
      },
      {
        "name": "a long chain is one component",
        "body": "const n = 50000;\nconst edges = [];\nfor (let i = 0; i + 1 < n; i++) edges.push([i, i + 1]);\nconst label = labelComponents(n, edges);\nassert.equal(label[0], 0);\nassert.equal(label[n - 1], 0);\nassert.equal(new Set(label).size, 1);"
      },
      {
        "name": "agrees with a union-find on random graphs",
        "body": "let seed = 17;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 40; t++) {\n  const n = 1 + next() % 12;\n  const edges = [];\n  for (let i = 0; i < next() % 12; i++) edges.push([next() % n, next() % n]);\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));\n  for (const [u, v] of edges) parent[find(u)] = find(v);\n  const label = labelComponents(n, edges);\n  const first = new Map();\n  const expected = [];\n  for (let i = 0; i < n; i++) {\n    const root = find(i);\n    if (!first.has(root)) first.set(root, first.size);\n    expected.push(first.get(root));\n  }\n  assert.deepEqual(label, expected);\n}"
      }
    ]
  },
  {
    "id": "ex-iterative-dfs-order",
    "chapter": "dsa-graphs-representation-traversal",
    "level": "intermediate",
    "title": "Depth-First Order Without Recursion",
    "brief": "<p>Given an adjacency list <code>graph</code> (<code>graph[i]</code> is the array of neighbours of node <code>i</code>, and the graph can be directed) and a <code>start</code> node, return the nodes in the order a <b>recursive</b> depth-first search would visit them: visit a node, then try its neighbours in the listed order, going deep into each unvisited one before trying the next.</p><ul><li>Do <b>not</b> use recursion. The tests include a chain of 200,000 nodes, which overflows the call stack of a recursive version</li><li>Only nodes reachable from <code>start</code> appear in the result, each exactly once</li><li>The order matters: a simple stack of nodes that pushes all neighbours at once gives a different order for some graphs</li><li>O(V + E) time</li></ul>",
    "starter": "function dfsOrder(graph, start) {\n  // TODO: an explicit stack of [node, index of the next neighbour to try]\n}\n",
    "hints": [
      "A recursive call remembers two things: its node and how far it has got through that node's neighbour loop. Keep both: a stack of [node, nextIndex] pairs.",
      "Loop while the stack is not empty. Look at the top pair. If nextIndex has run past the end of that node's neighbour list, pop it (the call returns). Otherwise take the neighbour at nextIndex and increase nextIndex.",
      "If that neighbour is unvisited, mark it visited, append it to the result, and push [neighbour, 0]. That push is the recursive call, and the pair underneath keeps its place for when the call returns."
    ],
    "solution": "function dfsOrder(graph, start) {\n  const visited = new Set([start]);\n  const order = [start];\n  const stack = [[start, 0]];\n  while (stack.length > 0) {\n    const frame = stack[stack.length - 1];\n    const [node, i] = frame;\n    if (i === graph[node].length) {\n      stack.pop();\n      continue;\n    }\n    frame[1]++;\n    const next = graph[node][i];\n    if (!visited.has(next)) {\n      visited.add(next);\n      order.push(next);\n      stack.push([next, 0]);\n    }\n  }\n  return order;\n}\n",
    "tests": [
      {
        "name": "the diamond: the deep branch is finished first",
        "body": "assert.deepEqual(dfsOrder([[1, 2], [3], [3], []], 0), [0, 1, 3, 2]);"
      },
      {
        "name": "a single node",
        "body": "assert.deepEqual(dfsOrder([[]], 0), [0]);"
      },
      {
        "name": "a cycle visits each node once",
        "body": "assert.deepEqual(dfsOrder([[1], [2], [0]], 0), [0, 1, 2]);"
      },
      {
        "name": "unreachable nodes are left out",
        "body": "assert.deepEqual(dfsOrder([[1], [], [3], []], 0), [0, 1]);"
      },
      {
        "name": "starting from a node in the middle",
        "body": "assert.deepEqual(dfsOrder([[1], [2, 0], [1]], 1), [1, 2, 0]);"
      },
      {
        "name": "neighbours are tried in the listed order",
        "body": "assert.deepEqual(dfsOrder([[3, 1, 2], [], [], [2]], 0), [0, 3, 2, 1]);"
      },
      {
        "name": "self-loops and repeated neighbours are harmless",
        "body": "assert.deepEqual(dfsOrder([[0, 1, 1], [0, 2], [1]], 0), [0, 1, 2]);"
      },
      {
        "name": "a chain of 200000 nodes does not overflow the stack",
        "body": "const n = 200000;\nconst graph = Array.from({ length: n }, (_, i) => (i + 1 < n ? [i + 1] : []));\nconst order = dfsOrder(graph, 0);\nassert.equal(order.length, n);\nassert.equal(order[n - 1], n - 1);"
      },
      {
        "name": "matches a recursive DFS on random graphs",
        "body": "let seed = 17;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfunction reference(graph, start) {\n  const seen = new Set();\n  const order = [];\n  const go = (u) => {\n    seen.add(u);\n    order.push(u);\n    for (const v of graph[u]) if (!seen.has(v)) go(v);\n  };\n  go(start);\n  return order;\n}\nfor (let t = 0; t < 40; t++) {\n  const n = 1 + next() % 10;\n  const graph = Array.from({ length: n }, () => []);\n  for (let i = 0; i < next() % 18; i++) graph[next() % n].push(next() % n);\n  const s = next() % n;\n  assert.deepEqual(dfsOrder(graph, s), reference(graph, s));\n}"
      }
    ]
  },
  {
    "id": "ex-nodes-at-distance-k",
    "chapter": "dsa-graphs-representation-traversal",
    "level": "intermediate",
    "title": "All Nodes at Distance K",
    "brief": "<p>An undirected graph has nodes <code>0</code> to <code>n - 1</code> and an array of <code>edges</code>. Return every node whose shortest distance from <code>source</code> is <b>exactly</b> <code>k</code> edges, as an array sorted ascending.</p><ul><li>Distance counts edges on a shortest path. A node reachable by a path of length <code>k</code> that also has a shorter path is <b>not</b> at distance <code>k</code></li><li><code>k = 0</code> returns <code>[source]</code></li><li>Return <code>[]</code> if no node is at that distance, or if <code>k</code> is larger than anything reachable</li><li>O(V + E) time</li></ul>",
    "starter": "function nodesAtDistance(n, edges, source, k) {\n  // TODO: BFS that records the distance of every node\n}\n",
    "hints": [
      "BFS discovers nodes in order of distance. Keep a dist array filled with -1, set dist[source] = 0, and when you discover next from node, set dist[next] = dist[node] + 1.",
      "Once the BFS has finished (or as soon as the queue reaches distances greater than k, whichever you prefer), collect every node whose dist equals k.",
      "Do not count a node twice or count nodes by 'there is some path of length k': a node found earlier keeps its smaller distance, because it is only discovered once. Collecting by index also gives you the ascending order for free."
    ],
    "solution": "function nodesAtDistance(n, edges, source, k) {\n  const graph = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  const dist = new Array(n).fill(-1);\n  dist[source] = 0;\n  const queue = [source];\n  for (let head = 0; head < queue.length; head++) {\n    const node = queue[head];\n    if (dist[node] === k) continue;\n    for (const next of graph[node]) {\n      if (dist[next] === -1) {\n        dist[next] = dist[node] + 1;\n        queue.push(next);\n      }\n    }\n  }\n  const result = [];\n  for (let i = 0; i < n; i++) if (dist[i] === k) result.push(i);\n  return result;\n}\n",
    "tests": [
      {
        "name": "k = 0 is the source itself",
        "body": "assert.deepEqual(nodesAtDistance(4, [[0, 1], [1, 2]], 1, 0), [1]);"
      },
      {
        "name": "distance 1 is the neighbours",
        "body": "assert.deepEqual(nodesAtDistance(5, [[0, 1], [0, 2], [0, 3], [3, 4]], 0, 1), [1, 2, 3]);"
      },
      {
        "name": "distance 2 on a tree",
        "body": "assert.deepEqual(nodesAtDistance(5, [[0, 1], [0, 2], [0, 3], [3, 4]], 0, 2), [4]);"
      },
      {
        "name": "a node with a shorter route is not at distance k",
        "body": "assert.deepEqual(nodesAtDistance(4, [[0, 1], [1, 2], [2, 3], [0, 3]], 0, 2), [2]);\nassert.deepEqual(nodesAtDistance(4, [[0, 1], [1, 2], [2, 3], [0, 3]], 0, 3), []);"
      },
      {
        "name": "k larger than anything reachable",
        "body": "assert.deepEqual(nodesAtDistance(4, [[0, 1], [2, 3]], 0, 5), []);"
      },
      {
        "name": "nodes in another component are never counted",
        "body": "assert.deepEqual(nodesAtDistance(5, [[0, 1], [3, 4]], 0, 1), [1]);"
      },
      {
        "name": "the result is sorted ascending",
        "body": "assert.deepEqual(nodesAtDistance(5, [[2, 4], [2, 1], [2, 3], [2, 0]], 2, 1), [0, 1, 3, 4]);"
      },
      {
        "name": "a cycle: the far side is found once",
        "body": "assert.deepEqual(nodesAtDistance(6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], 0, 3), [3]);\nassert.deepEqual(nodesAtDistance(6, [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]], 0, 2), [2, 4]);"
      },
      {
        "name": "agrees with an all-pairs distance table on random graphs",
        "body": "let seed = 17;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 40; t++) {\n  const n = 1 + next() % 10;\n  const edges = [];\n  for (let i = 0; i < next() % 14; i++) edges.push([next() % n, next() % n]);\n  const dist = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));\n  for (const [u, v] of edges) if (u !== v) dist[u][v] = dist[v][u] = 1;\n  for (let m = 0; m < n; m++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) dist[i][j] = Math.min(dist[i][j], dist[i][m] + dist[m][j]);\n  const s = next() % n;\n  const k = next() % 5;\n  const expected = [];\n  for (let i = 0; i < n; i++) if (dist[s][i] === k) expected.push(i);\n  assert.deepEqual(nodesAtDistance(n, edges, s, k), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-find-town-judge",
    "chapter": "dsa-graphs-representation-traversal",
    "level": "beginner",
    "title": "Find the Town Judge",
    "brief": "<p>In a town of <code>n</code> people labelled <code>1</code> to <code>n</code>, there might be a secret <b>judge</b>. If there is one: the judge trusts nobody, and everybody else trusts the judge. There is exactly one person who fits both rules, or no one.</p><p><code>trust</code> is an array of pairs <code>[a, b]</code> meaning person <code>a</code> trusts person <code>b</code>. Return the judge's label, or <code>-1</code> if there is no judge.</p><ul><li>This is a <b>directed</b> graph: <code>a -&gt; b</code> adds one to the in-degree of <code>b</code> and one to the out-degree of <code>a</code></li><li>A town of one person with no trust pairs has its single person as judge</li><li>Aim for O(n + trust.length) time, without building adjacency lists</li></ul>",
    "starter": "function findJudge(n, trust) {\n  // TODO: count how many people each person trusts, and how many trust each person\n}\n",
    "hints": [
      "The judge has out-degree 0 (trusts nobody) and in-degree n - 1 (trusted by everyone else). Nobody else can have both numbers.",
      "Make two arrays of n + 1 zeros, because people are labelled from 1. For each [a, b]: add one to out[a] and one to in[b].",
      "Return the person i with out[i] === 0 and in[i] === n - 1, or -1 if none. For n = 1 with no pairs, person 1 has out 0 and in 0 = n - 1, so the same test returns 1."
    ],
    "solution": "function findJudge(n, trust) {\n  const trusts = new Array(n + 1).fill(0);\n  const trusted = new Array(n + 1).fill(0);\n  for (const [a, b] of trust) {\n    trusts[a]++;\n    trusted[b]++;\n  }\n  for (let i = 1; i <= n; i++) {\n    if (trusts[i] === 0 && trusted[i] === n - 1) return i;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "two people, one trusts the other",
        "body": "assert.equal(findJudge(2, [[1, 2]]), 2);"
      },
      {
        "name": "three people all trust person 3",
        "body": "assert.equal(findJudge(3, [[1, 3], [2, 3]]), 3);"
      },
      {
        "name": "a cycle of trust has no judge",
        "body": "assert.equal(findJudge(3, [[1, 3], [2, 3], [3, 1]]), -1);"
      },
      {
        "name": "a town of one person",
        "body": "assert.equal(findJudge(1, []), 1);"
      },
      {
        "name": "nobody trusts anybody in a bigger town",
        "body": "assert.equal(findJudge(3, []), -1);"
      },
      {
        "name": "a judge who is trusted by only some people is not a judge",
        "body": "assert.equal(findJudge(4, [[1, 3], [2, 3]]), -1);"
      },
      {
        "name": "the judge is the last label and everyone else trusts someone else as well",
        "body": "assert.equal(findJudge(4, [[1, 4], [2, 4], [3, 4], [1, 2]]), 4);"
      },
      {
        "name": "two candidates, each trusted by only some people, mean no judge",
        "body": "assert.equal(findJudge(4, [[1, 3], [2, 3], [1, 4], [2, 4]]), -1);\nassert.equal(findJudge(4, [[1, 3], [2, 3], [1, 4], [2, 4], [3, 4]]), 4);"
      }
    ]
  }
];
