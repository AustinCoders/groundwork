import type { Exercise } from "../types";

export const dsaAddGraphProblems: Exercise[] = [
  {
    "id": "ex-graph-valid-tree",
    "chapter": "dsa-graph-problems",
    "level": "intermediate",
    "title": "Graph Valid Tree",
    "brief": "<p>There are <code>n</code> nodes labelled <code>0</code> to <code>n - 1</code> and a list of undirected <code>edges</code>, each <code>[u, v]</code>. Return <code>true</code> if the edges make the nodes into a <b>tree</b>: every node can reach every other, and there is no cycle.</p><ul><li><code>n</code> is at least 1</li><li>A graph with one node and no edges is a tree</li><li>Duplicate edges and self-loops are possible in the input, and they never make a tree</li><li>O(V + E) time. Think about what the number of edges tells you before you traverse anything</li></ul>",
    "starter": "function validTree(n, edges) {\n  // TODO\n}\n",
    "hints": [
      "A tree on n nodes has exactly n - 1 edges. If the edge count is anything else, you can answer false without looking at the graph.",
      "With exactly n - 1 edges, 'connected' and 'no cycle' mean the same thing, so you only have to check one. Checking that one traversal from node 0 reaches all n nodes is enough.",
      "Build the adjacency list with each edge in both lists, run a DFS or BFS from 0 with a visited set, and compare the number of visited nodes with n. Alternatively use union-find and return false when an edge joins two nodes that already share a root."
    ],
    "solution": "function validTree(n, edges) {\n  if (edges.length !== n - 1) return false;\n  const graph = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) {\n    graph[u].push(v);\n    graph[v].push(u);\n  }\n  const seen = new Set([0]);\n  const stack = [0];\n  while (stack.length > 0) {\n    const node = stack.pop();\n    for (const next of graph[node]) {\n      if (!seen.has(next)) {\n        seen.add(next);\n        stack.push(next);\n      }\n    }\n  }\n  return seen.size === n;\n}\n",
    "tests": [
      {
        "name": "a simple tree",
        "body": "assert.equal(validTree(5, [[0, 1], [0, 2], [0, 3], [1, 4]]), true);"
      },
      {
        "name": "a cycle plus an isolated node has the right edge count but is not a tree",
        "body": "assert.equal(validTree(5, [[0, 1], [1, 2], [2, 3], [1, 3]]), false);"
      },
      {
        "name": "a single node with no edges",
        "body": "assert.equal(validTree(1, []), true);"
      },
      {
        "name": "two nodes with no edge are not connected",
        "body": "assert.equal(validTree(2, []), false);"
      },
      {
        "name": "too many edges means a cycle",
        "body": "assert.equal(validTree(3, [[0, 1], [1, 2], [2, 0]]), false);"
      },
      {
        "name": "a repeated edge is not a tree",
        "body": "assert.equal(validTree(3, [[0, 1], [0, 1]]), false);"
      },
      {
        "name": "a self-loop is not a tree",
        "body": "assert.equal(validTree(2, [[0, 0]]), false);"
      },
      {
        "name": "a long chain is a tree",
        "body": "const n = 50000;\nconst edges = [];\nfor (let i = 0; i + 1 < n; i++) edges.push([i, i + 1]);\nassert.equal(validTree(n, edges), true);\nedges.push([0, n - 1]);\nassert.equal(validTree(n, edges), false);"
      },
      {
        "name": "edges listed in either direction",
        "body": "assert.equal(validTree(4, [[3, 2], [2, 1], [0, 1]]), true);"
      },
      {
        "name": "two separate trees are not one tree",
        "body": "assert.equal(validTree(4, [[0, 1], [2, 3]]), false);"
      }
    ]
  },
  {
    "id": "ex-evaluate-division",
    "chapter": "dsa-graph-problems",
    "level": "advanced",
    "title": "Evaluate Division",
    "brief": "<p><code>equations[i] = [A, B]</code> and <code>values[i]</code> mean <code>A / B = values[i]</code>, where the variables are strings and every value is a positive number. Each query <code>[C, D]</code> asks for <code>C / D</code>.</p><p>Return an array with one answer per query. If a query cannot be answered from the equations, its answer is <code>-1</code>.</p><ul><li>A variable that never appears in any equation is <b>unknown</b>, even when the query divides it by itself (<code>x / x</code> is <code>-1</code> if <code>x</code> is unknown)</li><li>A known variable divided by itself is <code>1</code></li><li>The equations are consistent: they never contradict one another</li><li>Think of variables as nodes and equations as weighted edges in both directions</li><li>Compare floating-point answers with a tolerance in your own checks; the tests here do</li></ul>",
    "starter": "function calcEquation(equations, values, queries) {\n  // TODO: a weighted graph, and one search per query\n}\n",
    "hints": [
      "Each equation A / B = v gives two edges: A to B with weight v, and B to A with weight 1 / v. Store them in a Map from variable to a list of [neighbour, weight].",
      "To answer C / D, search from C. Carry the product of the weights along the path: when you step from node X to Y over an edge with weight w, the new product is product * w. When you reach D, the product is C / D.",
      "Check first whether C and D both appear in the graph (otherwise -1). Use a fresh visited set for every query. If the search ends without reaching D, the answer is -1."
    ],
    "solution": "function calcEquation(equations, values, queries) {\n  const graph = new Map();\n  const link = (a, b, ratio) => {\n    if (!graph.has(a)) graph.set(a, []);\n    graph.get(a).push([b, ratio]);\n  };\n  equations.forEach(([a, b], i) => {\n    link(a, b, values[i]);\n    link(b, a, 1 / values[i]);\n  });\n  const evaluate = (from, to) => {\n    if (!graph.has(from) || !graph.has(to)) return -1;\n    const seen = new Set([from]);\n    const stack = [[from, 1]];\n    while (stack.length > 0) {\n      const [node, product] = stack.pop();\n      if (node === to) return product;\n      for (const [next, ratio] of graph.get(node)) {\n        if (!seen.has(next)) {\n          seen.add(next);\n          stack.push([next, product * ratio]);\n        }\n      }\n    }\n    return -1;\n  };\n  return queries.map(([from, to]) => evaluate(from, to));\n}\n",
    "tests": [
      {
        "name": "chained equations and reversed ones",
        "body": "const got = calcEquation([['a', 'b'], ['b', 'c']], [2.0, 3.0], [['a', 'c'], ['b', 'a'], ['a', 'e'], ['a', 'a'], ['x', 'x']]);\nconst want = [6, 0.5, -1, 1, -1];\nfor (let i = 0; i < want.length; i++) assert.ok(Math.abs(got[i] - want[i]) < 1e-9, 'query ' + i + ' gave ' + got[i]);"
      },
      {
        "name": "the second classic example",
        "body": "const got = calcEquation([['a', 'b'], ['b', 'c'], ['bc', 'cd']], [1.5, 2.5, 5.0], [['a', 'c'], ['c', 'b'], ['bc', 'cd'], ['cd', 'bc']]);\nconst want = [3.75, 0.4, 5, 0.2];\nfor (let i = 0; i < want.length; i++) assert.ok(Math.abs(got[i] - want[i]) < 1e-9, 'query ' + i + ' gave ' + got[i]);"
      },
      {
        "name": "a single equation and its inverse",
        "body": "const got = calcEquation([['a', 'b']], [0.5], [['a', 'b'], ['b', 'a'], ['a', 'a'], ['a', 'c'], ['c', 'a']]);\nconst want = [0.5, 2, 1, -1, -1];\nfor (let i = 0; i < want.length; i++) assert.ok(Math.abs(got[i] - want[i]) < 1e-9);"
      },
      {
        "name": "two separate groups of variables cannot be compared",
        "body": "const got = calcEquation([['a', 'b'], ['c', 'd']], [2, 3], [['a', 'd'], ['c', 'd'], ['d', 'c']]);\nassert.equal(got[0], -1);\nassert.ok(Math.abs(got[1] - 3) < 1e-9);\nassert.ok(Math.abs(got[2] - 1 / 3) < 1e-9);"
      },
      {
        "name": "an unknown variable is -1 even over itself",
        "body": "const got = calcEquation([['a', 'b']], [2], [['z', 'z'], ['a', 'z'], ['z', 'a']]);\nassert.deepEqual(got, [-1, -1, -1]);"
      },
      {
        "name": "no queries",
        "body": "assert.deepEqual(calcEquation([['a', 'b']], [2], []), []);"
      },
      {
        "name": "a long chain multiplies all the way",
        "body": "const names = Array.from({ length: 30 }, (_, i) => 'v' + i);\nconst equations = [];\nconst values = [];\nfor (let i = 0; i + 1 < names.length; i++) { equations.push([names[i], names[i + 1]]); values.push(2); }\nconst got = calcEquation(equations, values, [[names[0], names[29]], [names[29], names[0]]]);\nassert.ok(Math.abs(got[0] - 2 ** 29) < 1e-3);\nassert.ok(Math.abs(got[1] - 2 ** -29) < 1e-12);"
      },
      {
        "name": "a cycle of consistent equations",
        "body": "const got = calcEquation([['a', 'b'], ['b', 'c'], ['a', 'c']], [2, 3, 6], [['c', 'a'], ['b', 'c']]);\nassert.ok(Math.abs(got[0] - 1 / 6) < 1e-9);\nassert.ok(Math.abs(got[1] - 3) < 1e-9);"
      },
      {
        "name": "agrees with the true ratios on random consistent systems",
        "body": "let seed = 29;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nconst names = ['p', 'q', 'r', 's', 't', 'u'];\nfor (let t = 0; t < 30; t++) {\n  const value = {};\n  for (const n of names) value[n] = 1 + next() % 9;\n  const equations = [];\n  const values = [];\n  for (let i = 0; i < 1 + next() % 6; i++) {\n    const a = names[next() % 6], b = names[next() % 6];\n    if (a === b) continue;\n    equations.push([a, b]);\n    values.push(value[a] / value[b]);\n  }\n  const adj = {};\n  for (const [a, b] of equations) { (adj[a] = adj[a] || []).push(b); (adj[b] = adj[b] || []).push(a); }\n  const reach = (s) => { const seen = new Set([s]); const st = [s]; while (st.length) { const u = st.pop(); for (const v of adj[u] || []) if (!seen.has(v)) { seen.add(v); st.push(v); } } return seen; };\n  const queries = Array.from({ length: 5 }, () => [names[next() % 6], names[next() % 6]]);\n  const got = calcEquation(equations, values, queries);\n  queries.forEach(([a, b], i) => {\n    const known = adj[a] && adj[b] && reach(a).has(b);\n    const want = known ? value[a] / value[b] : -1;\n    assert.ok(Math.abs(got[i] - want) < 1e-9, JSON.stringify([equations, queries[i], got[i], want]));\n  });\n}"
      }
    ]
  },
  {
    "id": "ex-number-of-provinces",
    "chapter": "dsa-graph-problems",
    "level": "intermediate",
    "title": "Number of Provinces",
    "brief": "<p>There are <code>n</code> cities. <code>isConnected</code> is an <code>n x n</code> matrix: <code>isConnected[i][j] === 1</code> means city <code>i</code> and city <code>j</code> are directly connected, and <code>0</code> means they are not. The matrix is symmetric and <code>isConnected[i][i] === 1</code>.</p><p>A <b>province</b> is a group of cities that are connected directly or through other cities, with no connection to cities outside the group. Return the number of provinces.</p><ul><li>The graph arrives as a matrix, so reading a row is the way to find a city's neighbours</li><li>O(n²) time</li></ul>",
    "starter": "function findCircleNum(isConnected) {\n  // TODO: count connected components, reading neighbours from matrix rows\n}\n",
    "hints": [
      "A province is a connected component. Count components with a loop over every city plus a traversal from each city that has not been visited.",
      "The neighbours of city c are the columns j where isConnected[c][j] === 1. There is no adjacency list to build; scan the row.",
      "Mark a city visited the moment you add it to the stack or queue. The diagonal is all ones, so a city will 'see' itself as a neighbour, which is harmless only if it is already marked."
    ],
    "solution": "function findCircleNum(isConnected) {\n  const n = isConnected.length;\n  const visited = new Array(n).fill(false);\n  let provinces = 0;\n  for (let city = 0; city < n; city++) {\n    if (visited[city]) continue;\n    provinces++;\n    visited[city] = true;\n    const stack = [city];\n    while (stack.length > 0) {\n      const current = stack.pop();\n      for (let other = 0; other < n; other++) {\n        if (isConnected[current][other] === 1 && !visited[other]) {\n          visited[other] = true;\n          stack.push(other);\n        }\n      }\n    }\n  }\n  return provinces;\n}\n",
    "tests": [
      {
        "name": "two provinces",
        "body": "assert.equal(findCircleNum([[1, 1, 0], [1, 1, 0], [0, 0, 1]]), 2);"
      },
      {
        "name": "every city alone",
        "body": "assert.equal(findCircleNum([[1, 0, 0], [0, 1, 0], [0, 0, 1]]), 3);"
      },
      {
        "name": "one city",
        "body": "assert.equal(findCircleNum([[1]]), 1);"
      },
      {
        "name": "everything connected",
        "body": "assert.equal(findCircleNum([[1, 1, 1], [1, 1, 1], [1, 1, 1]]), 1);"
      },
      {
        "name": "connected only through a middle city",
        "body": "assert.equal(findCircleNum([[1, 1, 0], [1, 1, 1], [0, 1, 1]]), 1);"
      },
      {
        "name": "provinces that are not next to each other in numbering",
        "body": "assert.equal(findCircleNum([[1, 0, 0, 1], [0, 1, 1, 0], [0, 1, 1, 0], [1, 0, 0, 1]]), 2);"
      },
      {
        "name": "a chain of four cities",
        "body": "assert.equal(findCircleNum([[1, 1, 0, 0], [1, 1, 1, 0], [0, 1, 1, 1], [0, 0, 1, 1]]), 1);"
      },
      {
        "name": "agrees with union-find on random symmetric matrices",
        "body": "let seed = 29;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 40; t++) {\n  const n = 1 + next() % 10;\n  const m = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));\n  for (let k = 0; k < next() % 10; k++) { const a = next() % n, b = next() % n; m[a][b] = m[b][a] = 1; }\n  const p = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => (p[x] === x ? x : (p[x] = find(p[x])));\n  for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (m[i][j]) p[find(i)] = find(j);\n  assert.equal(findCircleNum(m), new Set(p.map((_, i) => find(i))).size);\n}"
      }
    ]
  },
  {
    "id": "ex-all-paths-source-target",
    "chapter": "dsa-graph-problems",
    "level": "intermediate",
    "title": "All Paths From Source to Target",
    "brief": "<p><code>graph</code> describes a <b>directed acyclic</b> graph with nodes <code>0</code> to <code>n - 1</code>: <code>graph[i]</code> is the list of nodes that <code>i</code> points to. Return <b>every</b> path from node <code>0</code> to node <code>n - 1</code>, each as an array of nodes.</p><ul><li>The order of the paths, and which of them comes first, does not matter (the tests sort them)</li><li>There is no cycle, so you do not need a visited set; two different paths may pass through the same node</li><li>Each returned path must be its own array: the arrays must not change after you return them</li><li>If node <code>n - 1</code> cannot be reached, return an empty array. A graph with a single node has the one path <code>[0]</code></li></ul>",
    "starter": "function allPathsSourceTarget(graph) {\n  // TODO: DFS that extends a path, records it at the target, and backs out\n}\n",
    "hints": [
      "Keep one array for the current path, starting as [0]. In dfs(node): if node is the target, record a copy of the path. Otherwise try each neighbour.",
      "For each neighbour: push it onto the path, call dfs on it, then pop it. The pop is what lets the next neighbour start from the same prefix.",
      "Record [...path] and not path itself; otherwise every recorded path is the same array, and it is back to just [0] when the search is over."
    ],
    "solution": "function allPathsSourceTarget(graph) {\n  const target = graph.length - 1;\n  const paths = [];\n  const path = [0];\n  function dfs(node) {\n    if (node === target) {\n      paths.push([...path]);\n      return;\n    }\n    for (const next of graph[node]) {\n      path.push(next);\n      dfs(next);\n      path.pop();\n    }\n  }\n  dfs(0);\n  return paths;\n}\n",
    "tests": [
      {
        "name": "a diamond",
        "body": "const got = allPathsSourceTarget([[1, 2], [3], [3], []]).map((p) => p.join()).sort();\nassert.deepEqual(got, ['0,1,3', '0,2,3']);"
      },
      {
        "name": "a larger example with a shortcut",
        "body": "const got = allPathsSourceTarget([[4, 3, 1], [3, 2, 4], [3], [4], []]).map((p) => p.join()).sort();\nassert.deepEqual(got, ['0,1,2,3,4', '0,1,3,4', '0,1,4', '0,3,4', '0,4']);"
      },
      {
        "name": "a single node is its own path",
        "body": "assert.deepEqual(allPathsSourceTarget([[]]), [[0]]);"
      },
      {
        "name": "an unreachable target returns no paths",
        "body": "assert.deepEqual(allPathsSourceTarget([[1], [], []]), []);"
      },
      {
        "name": "a straight line has one path",
        "body": "assert.deepEqual(allPathsSourceTarget([[1], [2], [3], []]), [[0, 1, 2, 3]]);"
      },
      {
        "name": "the returned paths are separate arrays",
        "body": "const paths = allPathsSourceTarget([[1, 2], [3], [3], []]);\nassert.notEqual(paths[0], paths[1]);\nassert.equal(paths[0].length, 3);\nassert.equal(paths[1].length, 3);"
      },
      {
        "name": "every node pointing to every later node gives 2^(n-2) paths",
        "body": "const n = 9;\nconst graph = Array.from({ length: n }, (_, i) => Array.from({ length: n - 1 - i }, (_, k) => i + 1 + k));\nassert.equal(allPathsSourceTarget(graph).length, 2 ** (n - 2));"
      },
      {
        "name": "random DAGs: the path count and every path are valid",
        "body": "let seed = 29;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 40; t++) {\n  const n = 2 + next() % 7;\n  const graph = Array.from({ length: n }, () => []);\n  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (next() % 2) graph[i].push(j);\n  const count = (u) => (u === n - 1 ? 1 : graph[u].reduce((s, v) => s + count(v), 0));\n  const paths = allPathsSourceTarget(graph);\n  assert.equal(paths.length, count(0));\n  for (const p of paths) {\n    assert.equal(p[0], 0);\n    assert.equal(p[p.length - 1], n - 1);\n    for (let i = 0; i + 1 < p.length; i++) assert.ok(graph[p[i]].includes(p[i + 1]));\n  }\n}"
      }
    ]
  },
  {
    "id": "ex-possible-bipartition",
    "chapter": "dsa-graph-problems",
    "level": "intermediate",
    "title": "Possible Bipartition",
    "brief": "<p>There are <code>n</code> people labelled <code>1</code> to <code>n</code>, and a list <code>dislikes</code> of pairs <code>[a, b]</code> meaning person <code>a</code> and person <code>b</code> do not get along. Return <code>true</code> if everyone can be split into <b>two groups</b> so that no two people who dislike each other are in the same group.</p><ul><li>Dislike goes both ways: the pair <code>[a, b]</code> applies to both of them</li><li>People who dislike nobody can go in either group. The groups can be of any size, and one may be empty</li><li>The graph can be disconnected, so one search from person 1 is not enough</li><li>A pair like <code>[3, 3]</code> cannot be satisfied</li></ul>",
    "starter": "function possibleBipartition(n, dislikes) {\n  // TODO: two-colour the dislike graph, one search per component\n}\n",
    "hints": [
      "This is a bipartite check: the people are nodes, each dislike is an edge, and the two groups are the two colours. Every edge must join two different colours.",
      "Colour with BFS. Give an uncoloured start the colour 1; give each uncoloured neighbour the opposite colour; if a neighbour already has the same colour as the current node, return false.",
      "Wrap it in a loop over all people so every component is coloured. Labels start from 1, so allocate n + 1 slots. A self-dislike [a, a] gives a neighbour with the same colour as itself, so the same rule catches it."
    ],
    "solution": "function possibleBipartition(n, dislikes) {\n  const graph = Array.from({ length: n + 1 }, () => []);\n  for (const [a, b] of dislikes) {\n    graph[a].push(b);\n    graph[b].push(a);\n  }\n  const color = new Array(n + 1).fill(0);\n  for (let start = 1; start <= n; start++) {\n    if (color[start] !== 0) continue;\n    color[start] = 1;\n    const queue = [start];\n    for (let head = 0; head < queue.length; head++) {\n      const node = queue[head];\n      for (const next of graph[node]) {\n        if (color[next] === 0) {\n          color[next] = -color[node];\n          queue.push(next);\n        } else if (color[next] === color[node]) {\n          return false;\n        }\n      }\n    }\n  }\n  return true;\n}\n",
    "tests": [
      {
        "name": "a path of dislikes can be split",
        "body": "assert.equal(possibleBipartition(4, [[1, 2], [1, 3], [2, 4]]), true);"
      },
      {
        "name": "a triangle of dislikes cannot",
        "body": "assert.equal(possibleBipartition(3, [[1, 2], [1, 3], [2, 3]]), false);"
      },
      {
        "name": "a cycle of five cannot",
        "body": "assert.equal(possibleBipartition(5, [[1, 2], [2, 3], [3, 4], [4, 5], [1, 5]]), false);"
      },
      {
        "name": "a cycle of four can",
        "body": "assert.equal(possibleBipartition(4, [[1, 2], [2, 3], [3, 4], [4, 1]]), true);"
      },
      {
        "name": "nobody dislikes anyone",
        "body": "assert.equal(possibleBipartition(5, []), true);"
      },
      {
        "name": "the clash is in a component that does not contain person 1",
        "body": "assert.equal(possibleBipartition(6, [[1, 2], [4, 5], [5, 6], [4, 6]]), false);"
      },
      {
        "name": "a person who dislikes themselves",
        "body": "assert.equal(possibleBipartition(2, [[2, 2]]), false);"
      },
      {
        "name": "a repeated pair does no harm",
        "body": "assert.equal(possibleBipartition(2, [[1, 2], [1, 2], [2, 1]]), true);"
      },
      {
        "name": "a long even cycle of 10000 people",
        "body": "const n = 10000;\nconst pairs = [];\nfor (let i = 1; i < n; i++) pairs.push([i, i + 1]);\npairs.push([n, 1]);\nassert.equal(possibleBipartition(n, pairs), true);\nassert.equal(possibleBipartition(n - 1, pairs.slice(0, n - 2).concat([[n - 1, 1]])), false);"
      }
    ]
  },
  {
    "id": "ex-min-vertices-reach-all",
    "chapter": "dsa-graph-problems",
    "level": "intermediate",
    "title": "Smallest Set of Vertices to Reach All Nodes",
    "brief": "<p>A <b>directed acyclic</b> graph has <code>n</code> nodes labelled <code>0</code> to <code>n - 1</code> and a list of directed <code>edges</code>, each <code>[from, to]</code>. Find the <b>smallest</b> set of nodes from which every node in the graph can be reached by following edges.</p><ul><li>The answer is unique for a DAG, and the tests expect it sorted ascending</li><li>A node counts as reaching itself</li><li>O(V + E) time, and you do not need to search the graph: look at what the edges say about each node</li></ul>",
    "starter": "function findSmallestSetOfVertices(n, edges) {\n  // TODO\n}\n",
    "hints": [
      "Ask which nodes MUST be in the set. A node that no edge points to cannot be reached from any other node, so the only way to reach it is to start there.",
      "Every other node has an edge coming in. Following incoming edges backwards in an acyclic graph has to end somewhere, and it can only end at a node with no incoming edge, which is already in your set.",
      "So the answer is exactly the nodes with in-degree zero. Mark every node that appears as the 'to' end of an edge, then collect the unmarked ones in increasing order."
    ],
    "solution": "function findSmallestSetOfVertices(n, edges) {\n  const hasIncoming = new Array(n).fill(false);\n  for (const [, to] of edges) hasIncoming[to] = true;\n  const result = [];\n  for (let i = 0; i < n; i++) if (!hasIncoming[i]) result.push(i);\n  return result;\n}\n",
    "tests": [
      {
        "name": "two starts",
        "body": "assert.deepEqual(findSmallestSetOfVertices(6, [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]), [0, 3]);"
      },
      {
        "name": "several starts feed one shared node",
        "body": "assert.deepEqual(findSmallestSetOfVertices(5, [[0, 1], [2, 1], [3, 1], [1, 4], [2, 4]]), [0, 2, 3]);"
      },
      {
        "name": "a chain",
        "body": "assert.deepEqual(findSmallestSetOfVertices(4, [[0, 1], [1, 2], [2, 3]]), [0]);"
      },
      {
        "name": "no edges: every node is its own start",
        "body": "assert.deepEqual(findSmallestSetOfVertices(3, []), [0, 1, 2]);"
      },
      {
        "name": "a single node",
        "body": "assert.deepEqual(findSmallestSetOfVertices(1, []), [0]);"
      },
      {
        "name": "the answer is sorted even when the edges are not",
        "body": "assert.deepEqual(findSmallestSetOfVertices(5, [[4, 0], [3, 1], [2, 1]]), [2, 3, 4]);"
      },
      {
        "name": "a node with several incoming edges is not a start",
        "body": "assert.deepEqual(findSmallestSetOfVertices(4, [[0, 3], [1, 3], [2, 3]]), [0, 1, 2]);"
      },
      {
        "name": "the set reaches everything on random DAGs",
        "body": "let seed = 29;\nconst next = () => { seed = (seed * 1103515245 + 12345) % 2147483648; return seed; };\nfor (let t = 0; t < 40; t++) {\n  const n = 1 + next() % 9;\n  const edges = [];\n  const out = Array.from({ length: n }, () => []);\n  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) if (next() % 3 === 0) { edges.push([i, j]); out[i].push(j); }\n  const starts = findSmallestSetOfVertices(n, edges);\n  const seen = new Set(starts);\n  const st = [...starts];\n  while (st.length) { const u = st.pop(); for (const v of out[u]) if (!seen.has(v)) { seen.add(v); st.push(v); } }\n  assert.equal(seen.size, n);\n  for (const x of starts) {\n    const rest = starts.filter((y) => y !== x);\n    const s2 = new Set(rest);\n    const st2 = [...rest];\n    while (st2.length) { const u = st2.pop(); for (const v of out[u]) if (!s2.has(v)) { s2.add(v); st2.push(v); } }\n    assert.ok(!s2.has(x));\n  }\n}"
      }
    ]
  }
];
