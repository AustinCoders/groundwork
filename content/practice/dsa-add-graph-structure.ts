import type { Exercise } from "../types";

export const dsaAddGraphStructure: Exercise[] = [
  {
    "id": "ex-count-sccs",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Count Strongly Connected Components",
    "brief": "<p>A directed graph has vertices <code>0</code> to <code>n - 1</code> and a list of edges <code>[from, to]</code>. Write <code>countSccs(n, edges)</code> returning the number of <b>strongly connected components</b>: groups of vertices in which every vertex can reach every other.</p><ul><li>A vertex that lies on no cycle is a component by itself</li><li>Self-loops and duplicate edges may appear and change nothing</li><li><code>n</code> can be 0, and <code>edges</code> can be empty</li><li>Target: O(n + edges). The graph can be one path of tens of thousands of vertices, so a recursive DFS may overflow the stack</li></ul>",
    "starter": "function countSccs(n, edges) {\n  // TODO: Tarjan or Kosaraju, written with an explicit stack\n}\n",
    "hints": [
      "Two vertices belong together when each reaches the other. Checking every pair by search is O(n * (n + edges)), too slow for large n.",
      "Kosaraju: record the order DFS calls finish, then sweep that order backwards over the REVERSED graph, counting how many sweeps you start. Tarjan: one DFS, tin and low, and pop a component when low equals tin.",
      "For deep graphs keep the DFS stack in an array with one edge pointer per vertex instead of recursing."
    ],
    "solution": "function sccLabels(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) adj[u].push(v);\n  const tin = new Array(n).fill(-1);\n  const low = new Array(n).fill(0);\n  const onStack = new Array(n).fill(false);\n  const next = new Array(n).fill(0);\n  const comp = new Array(n).fill(-1);\n  const open = [];\n  let timer = 0;\n  let count = 0;\n  for (let s = 0; s < n; s++) {\n    if (tin[s] !== -1) continue;\n    const calls = [s];\n    tin[s] = low[s] = timer++;\n    open.push(s);\n    onStack[s] = true;\n    while (calls.length) {\n      const u = calls[calls.length - 1];\n      if (next[u] < adj[u].length) {\n        const v = adj[u][next[u]++];\n        if (tin[v] === -1) {\n          tin[v] = low[v] = timer++;\n          open.push(v);\n          onStack[v] = true;\n          calls.push(v);\n        } else if (onStack[v]) {\n          low[u] = Math.min(low[u], tin[v]);\n        }\n      } else {\n        calls.pop();\n        if (low[u] === tin[u]) {\n          let w;\n          do {\n            w = open.pop();\n            onStack[w] = false;\n            comp[w] = count;\n          } while (w !== u);\n          count++;\n        }\n        if (calls.length) {\n          const parent = calls[calls.length - 1];\n          low[parent] = Math.min(low[parent], low[u]);\n        }\n      }\n    }\n  }\n  return { comp, count };\n}\n\nfunction countSccs(n, edges) {\n  return sccLabels(n, edges).count;\n}\n",
    "tests": [
      {
        "name": "no vertices and one vertex",
        "body": "assert.equal(countSccs(0, []), 0);\nassert.equal(countSccs(1, []), 1);"
      },
      {
        "name": "no edges: every vertex stands alone",
        "body": "assert.equal(countSccs(5, []), 5);"
      },
      {
        "name": "one big cycle is one component",
        "body": "assert.equal(countSccs(4, [[0, 1], [1, 2], [2, 3], [3, 0]]), 1);"
      },
      {
        "name": "a directed chain gives one component per vertex",
        "body": "assert.equal(countSccs(4, [[0, 1], [1, 2], [2, 3]]), 4);"
      },
      {
        "name": "three components joined one way",
        "body": "assert.equal(countSccs(8, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [1, 6], [6, 7], [7, 6], [7, 5]]), 3);"
      },
      {
        "name": "self-loops and duplicate edges change nothing",
        "body": "assert.equal(countSccs(3, [[0, 0], [0, 1], [0, 1], [1, 2], [2, 1]]), 2);"
      },
      {
        "name": "two cycles joined by a single edge stay separate",
        "body": "assert.equal(countSccs(4, [[0, 1], [1, 0], [2, 3], [3, 2], [1, 2]]), 2);\nassert.equal(countSccs(4, [[0, 1], [1, 0], [2, 3], [3, 2], [1, 2], [3, 0]]), 1);"
      },
      {
        "name": "a path of 30000 vertices needs a loop, not recursion",
        "body": "const n = 30000;\nconst path = Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);\nassert.equal(countSccs(n, path), n);\nassert.equal(countSccs(n, path.concat([[n - 1, 0]])), 1);"
      },
      {
        "name": "random graphs agree with a reachability brute force",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfunction reachAll(n, edges) {\n  const r = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));\n  for (const [u, v] of edges) r[u][v] = true;\n  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r[i][k] && r[k][j]) r[i][j] = true;\n  return r;\n}\nfor (let t = 0; t < 300; t++) {\n  const n = pick(1, 8);\n  const m = pick(0, 14);\n  const edges = Array.from({ length: m }, () => [pick(0, n - 1), pick(0, n - 1)]);\n  const r = reachAll(n, edges);\n  const seen = new Array(n).fill(false);\n  let want = 0;\n  for (let i = 0; i < n; i++) {\n    if (seen[i]) continue;\n    want++;\n    for (let j = 0; j < n; j++) if (r[i][j] && r[j][i]) seen[j] = true;\n  }\n  assert.equal(countSccs(n, edges), want);\n}"
      }
    ]
  },
  {
    "id": "ex-min-starts-to-reach-all",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Fewest Starting Vertices That Reach Everything",
    "brief": "<p>A directed graph has vertices <code>0</code> to <code>n - 1</code> and edges <code>[from, to]</code>, and it may contain cycles. Write <code>minStartVertices(n, edges)</code>: choose the fewest vertices such that every vertex is reachable from at least one of them, and return the choice as an ascending array.</p><ul><li>When a group of vertices on a cycle all qualify equally, pick the <b>smallest-numbered</b> vertex of the group</li><li>Isolated vertices must be chosen themselves</li><li>The answer is unique under that rule</li><li>Target: O(n + edges)</li></ul>",
    "starter": "function minStartVertices(n, edges) {\n  // TODO: which components have no edge entering them from outside?\n}\n",
    "hints": [
      "On a DAG the answer is the vertices with in-degree 0. A cycle breaks that rule: every vertex on it has an incoming edge.",
      "Find the strongly connected components. A component that nothing outside points into needs a start of its own.",
      "Count, for every component, the edges that enter it from a different component. Components with none are the sources; return the smallest vertex of each, sorted."
    ],
    "solution": "function sccLabels(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) adj[u].push(v);\n  const tin = new Array(n).fill(-1);\n  const low = new Array(n).fill(0);\n  const onStack = new Array(n).fill(false);\n  const next = new Array(n).fill(0);\n  const comp = new Array(n).fill(-1);\n  const open = [];\n  let timer = 0;\n  let count = 0;\n  for (let s = 0; s < n; s++) {\n    if (tin[s] !== -1) continue;\n    const calls = [s];\n    tin[s] = low[s] = timer++;\n    open.push(s);\n    onStack[s] = true;\n    while (calls.length) {\n      const u = calls[calls.length - 1];\n      if (next[u] < adj[u].length) {\n        const v = adj[u][next[u]++];\n        if (tin[v] === -1) {\n          tin[v] = low[v] = timer++;\n          open.push(v);\n          onStack[v] = true;\n          calls.push(v);\n        } else if (onStack[v]) {\n          low[u] = Math.min(low[u], tin[v]);\n        }\n      } else {\n        calls.pop();\n        if (low[u] === tin[u]) {\n          let w;\n          do {\n            w = open.pop();\n            onStack[w] = false;\n            comp[w] = count;\n          } while (w !== u);\n          count++;\n        }\n        if (calls.length) {\n          const parent = calls[calls.length - 1];\n          low[parent] = Math.min(low[parent], low[u]);\n        }\n      }\n    }\n  }\n  return { comp, count };\n}\n\nfunction minStartVertices(n, edges) {\n  const { comp, count } = sccLabels(n, edges);\n  const hasEntry = new Array(count).fill(false);\n  for (const [u, v] of edges) if (comp[u] !== comp[v]) hasEntry[comp[v]] = true;\n  const smallest = new Array(count).fill(-1);\n  for (let v = 0; v < n; v++) if (smallest[comp[v]] === -1) smallest[comp[v]] = v;\n  const result = [];\n  for (let c = 0; c < count; c++) if (!hasEntry[c]) result.push(smallest[c]);\n  return result.sort((a, b) => a - b);\n}\n",
    "tests": [
      {
        "name": "a DAG: the vertices with no incoming edge",
        "body": "assert.deepEqual(minStartVertices(6, [[0, 1], [0, 2], [2, 5], [3, 4], [4, 2]]), [0, 3]);"
      },
      {
        "name": "isolated vertices must be chosen",
        "body": "assert.deepEqual(minStartVertices(3, []), [0, 1, 2]);"
      },
      {
        "name": "a cycle that leads onward needs one start, the smallest vertex of the cycle",
        "body": "assert.deepEqual(minStartVertices(4, [[1, 2], [2, 0], [0, 1], [2, 3]]), [0]);"
      },
      {
        "name": "a cycle that is fed from outside needs no start of its own",
        "body": "assert.deepEqual(minStartVertices(4, [[3, 0], [0, 1], [1, 2], [2, 0]]), [3]);"
      },
      {
        "name": "two source cycles and a shared sink",
        "body": "assert.deepEqual(minStartVertices(7, [[0, 1], [1, 0], [2, 3], [3, 2], [1, 4], [3, 4], [4, 5], [5, 6]]), [0, 2]);"
      },
      {
        "name": "one big cycle",
        "body": "assert.deepEqual(minStartVertices(3, [[0, 1], [1, 2], [2, 0]]), [0]);"
      },
      {
        "name": "a single vertex",
        "body": "assert.deepEqual(minStartVertices(1, [[0, 0]]), [0]);"
      },
      {
        "name": "random graphs agree with a reachability brute force",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfunction reachAll(n, edges) {\n  const r = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));\n  for (const [u, v] of edges) r[u][v] = true;\n  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r[i][k] && r[k][j]) r[i][j] = true;\n  return r;\n}\nfor (let t = 0; t < 300; t++) {\n  const n = pick(1, 8);\n  const m = pick(0, 14);\n  const edges = Array.from({ length: m }, () => [pick(0, n - 1), pick(0, n - 1)]);\n  const r = reachAll(n, edges);\n  const want = [];\n  for (let v = 0; v < n; v++) {\n    let rep = true;\n    for (let u = 0; u < n; u++) {\n      if (u === v) continue;\n      if (r[u][v] && !r[v][u]) rep = false;\n      if (r[u][v] && r[v][u] && u < v) rep = false;\n    }\n    if (rep) want.push(v);\n  }\n  assert.deepEqual(minStartVertices(n, edges), want);\n}"
      }
    ]
  },
  {
    "id": "ex-make-strongly-connected",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Edges to Make a Graph Strongly Connected",
    "brief": "<p>A directed graph has vertices <code>0</code> to <code>n - 1</code> and edges <code>[from, to]</code>. Write <code>edgesToConnect(n, edges)</code>: the minimum number of new directed edges you must add so that every vertex can reach every other.</p><ul><li>If the graph is already strongly connected, return <code>0</code></li><li>A single vertex is strongly connected</li><li>New edges may join any two vertices; duplicates of existing edges are never useful</li><li>Target: O(n + edges)</li></ul>",
    "starter": "function edgesToConnect(n, edges) {\n  // TODO: collapse the components and look at sources and sinks\n}\n",
    "hints": [
      "Collapse each strongly connected component into one vertex. What you get is a DAG, and a DAG with more than one vertex has at least one source and at least one sink.",
      "A source needs a new edge entering it and a sink needs a new edge leaving it. One new edge can fix at most one source and one sink.",
      "With more than one component the answer is the larger of the number of sources and the number of sinks. An isolated vertex is both a source and a sink."
    ],
    "solution": "function sccLabels(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) adj[u].push(v);\n  const tin = new Array(n).fill(-1);\n  const low = new Array(n).fill(0);\n  const onStack = new Array(n).fill(false);\n  const next = new Array(n).fill(0);\n  const comp = new Array(n).fill(-1);\n  const open = [];\n  let timer = 0;\n  let count = 0;\n  for (let s = 0; s < n; s++) {\n    if (tin[s] !== -1) continue;\n    const calls = [s];\n    tin[s] = low[s] = timer++;\n    open.push(s);\n    onStack[s] = true;\n    while (calls.length) {\n      const u = calls[calls.length - 1];\n      if (next[u] < adj[u].length) {\n        const v = adj[u][next[u]++];\n        if (tin[v] === -1) {\n          tin[v] = low[v] = timer++;\n          open.push(v);\n          onStack[v] = true;\n          calls.push(v);\n        } else if (onStack[v]) {\n          low[u] = Math.min(low[u], tin[v]);\n        }\n      } else {\n        calls.pop();\n        if (low[u] === tin[u]) {\n          let w;\n          do {\n            w = open.pop();\n            onStack[w] = false;\n            comp[w] = count;\n          } while (w !== u);\n          count++;\n        }\n        if (calls.length) {\n          const parent = calls[calls.length - 1];\n          low[parent] = Math.min(low[parent], low[u]);\n        }\n      }\n    }\n  }\n  return { comp, count };\n}\n\nfunction edgesToConnect(n, edges) {\n  const { comp, count } = sccLabels(n, edges);\n  if (count <= 1) return 0;\n  const indeg = new Array(count).fill(0);\n  const outdeg = new Array(count).fill(0);\n  for (const [u, v] of edges) {\n    if (comp[u] !== comp[v]) {\n      outdeg[comp[u]]++;\n      indeg[comp[v]]++;\n    }\n  }\n  const sources = indeg.filter((d) => d === 0).length;\n  const sinks = outdeg.filter((d) => d === 0).length;\n  return Math.max(sources, sinks);\n}\n",
    "tests": [
      {
        "name": "a single vertex needs nothing",
        "body": "assert.equal(edgesToConnect(1, []), 0);"
      },
      {
        "name": "already one cycle",
        "body": "assert.equal(edgesToConnect(3, [[0, 1], [1, 2], [2, 0]]), 0);"
      },
      {
        "name": "a directed path needs one edge back",
        "body": "assert.equal(edgesToConnect(4, [[0, 1], [1, 2], [2, 3]]), 1);"
      },
      {
        "name": "isolated vertices are both source and sink",
        "body": "assert.equal(edgesToConnect(3, []), 3);\nassert.equal(edgesToConnect(2, []), 2);"
      },
      {
        "name": "one source feeding two sinks",
        "body": "assert.equal(edgesToConnect(3, [[0, 1], [0, 2]]), 2);"
      },
      {
        "name": "two sources feeding one sink",
        "body": "assert.equal(edgesToConnect(3, [[0, 2], [1, 2]]), 2);"
      },
      {
        "name": "components joined one way count as a chain",
        "body": "assert.equal(edgesToConnect(8, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [1, 6], [6, 7], [7, 6], [7, 5]]), 1);"
      },
      {
        "name": "random small graphs agree with trying every set of added edges",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfunction reachAll(n, edges) {\n  const r = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => i === j));\n  for (const [u, v] of edges) r[u][v] = true;\n  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) if (r[i][k] && r[k][j]) r[i][j] = true;\n  return r;\n}\nconst pairsFor = (n) => {\n  const out = [];\n  for (let a = 0; a < n; a++) for (let b = 0; b < n; b++) if (a !== b) out.push([a, b]);\n  return out;\n};\nfor (let t = 0; t < 120; t++) {\n  const n = pick(1, 4);\n  const m = pick(0, 6);\n  const edges = Array.from({ length: m }, () => [pick(0, n - 1), pick(0, n - 1)]);\n  const pairs = pairsFor(n);\n  let want = Infinity;\n  for (let mask = 0; mask < 1 << pairs.length; mask++) {\n    let bits = 0;\n    for (let x = mask; x; x &= x - 1) bits++;\n    if (bits >= want) continue;\n    const extra = pairs.filter((_, i) => (mask >> i) & 1);\n    if (reachAll(n, edges.concat(extra)).every((row) => row.every(Boolean))) want = bits;\n  }\n  assert.equal(edgesToConnect(n, edges), want);\n}"
      }
    ]
  },
  {
    "id": "ex-critical-connections",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Critical Connections in a Network",
    "brief": "<p>There are <code>n</code> servers numbered <code>0</code> to <code>n - 1</code> and a list of two-way cables <code>[a, b]</code>. A cable is <b>critical</b> if removing it leaves some servers unable to reach each other that could reach each other before. Write <code>criticalConnections(n, connections)</code> returning every critical cable as a pair <code>[a, b]</code>, in any order and either way round.</p><ul><li>The network may be disconnected</li><li>Two parallel cables between the same pair are never critical, because the other one still carries the link</li><li>Self-loop cables are never critical</li><li>Target: O(n + cables). A single line of 20000 servers must work, so recursion may overflow</li></ul>",
    "starter": "function criticalConnections(n, connections) {\n  // TODO: DFS with discovery times and low-link values\n}\n",
    "hints": [
      "Removing each cable and recounting the pieces is O(cables * (n + cables)). Look for one DFS that decides all cables at once.",
      "Record tin[v] when v is first reached and low[v], the smallest tin reachable from v's subtree using one back edge. A tree edge u-v is critical when low[v] > tin[u].",
      "Skip the edge you arrived by using its INDEX, not its far endpoint, so parallel cables are handled. Keep your own stack of vertices and one edge pointer per vertex to avoid recursion."
    ],
    "solution": "function lowLink(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  edges.forEach(([a, b], id) => {\n    adj[a].push([b, id]);\n    adj[b].push([a, id]);\n  });\n  const tin = new Array(n).fill(-1);\n  const low = new Array(n).fill(0);\n  const next = new Array(n).fill(0);\n  const viaEdge = new Array(n).fill(-1);\n  const isCut = new Array(n).fill(false);\n  const bridges = [];\n  let timer = 0;\n  for (let root = 0; root < n; root++) {\n    if (tin[root] !== -1) continue;\n    tin[root] = low[root] = timer++;\n    const calls = [root];\n    let rootChildren = 0;\n    while (calls.length) {\n      const u = calls[calls.length - 1];\n      if (next[u] < adj[u].length) {\n        const [v, id] = adj[u][next[u]++];\n        if (id === viaEdge[u]) continue;\n        if (tin[v] !== -1) {\n          low[u] = Math.min(low[u], tin[v]);\n        } else {\n          tin[v] = low[v] = timer++;\n          viaEdge[v] = id;\n          calls.push(v);\n          if (u === root) rootChildren++;\n        }\n      } else {\n        calls.pop();\n        if (calls.length) {\n          const p = calls[calls.length - 1];\n          low[p] = Math.min(low[p], low[u]);\n          if (low[u] > tin[p]) bridges.push([p, u]);\n          if (p !== root && low[u] >= tin[p]) isCut[p] = true;\n        }\n      }\n    }\n    if (rootChildren >= 2) isCut[root] = true;\n  }\n  return { bridges, cutVertices: isCut.flatMap((flag, v) => (flag ? [v] : [])) };\n}\n\nfunction criticalConnections(n, connections) {\n  return lowLink(n, connections).bridges;\n}\n",
    "tests": [
      {
        "name": "a triangle with a tail: only the tail is critical",
        "body": "const norm = (list) => list.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);\nassert.deepEqual(norm(criticalConnections(4, [[0, 1], [1, 2], [2, 0], [1, 3]])), [[1, 3]]);"
      },
      {
        "name": "a single cable is critical",
        "body": "const norm = (list) => list.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);\nassert.deepEqual(norm(criticalConnections(2, [[0, 1]])), [[0, 1]]);"
      },
      {
        "name": "a cycle has no critical cable",
        "body": "assert.deepEqual(criticalConnections(4, [[0, 1], [1, 2], [2, 3], [3, 0]]), []);"
      },
      {
        "name": "every cable of a tree is critical",
        "body": "const norm = (list) => list.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);\nassert.deepEqual(norm(criticalConnections(5, [[0, 1], [0, 2], [2, 3], [2, 4]])), [[0, 1], [0, 2], [2, 3], [2, 4]]);"
      },
      {
        "name": "two triangles joined by a cable",
        "body": "const norm = (list) => list.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);\nassert.deepEqual(norm(criticalConnections(6, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3]])), [[2, 3]]);"
      },
      {
        "name": "parallel cables protect each other",
        "body": "assert.deepEqual(criticalConnections(2, [[0, 1], [0, 1]]), []);\nassert.deepEqual(criticalConnections(3, [[0, 1], [0, 1], [1, 2]]).length, 1);"
      },
      {
        "name": "a disconnected network is handled in every piece",
        "body": "const norm = (list) => list.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);\nassert.deepEqual(norm(criticalConnections(6, [[0, 1], [2, 3], [3, 4], [4, 2]])), [[0, 1]]);\nassert.deepEqual(criticalConnections(3, []), []);"
      },
      {
        "name": "a line of 20000 servers needs a loop, not recursion",
        "body": "const n = 20000;\nconst line = Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);\nassert.equal(criticalConnections(n, line).length, n - 1);\nassert.equal(criticalConnections(n, line.concat([[n - 1, 0]])).length, 0);"
      },
      {
        "name": "random networks agree with removing each cable in turn",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfunction pieces(n, edges, skipEdge, skipVertex) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));\n  edges.forEach(([a, b], id) => {\n    if (id !== skipEdge && a !== skipVertex && b !== skipVertex) parent[find(a)] = find(b);\n  });\n  let count = 0;\n  for (let v = 0; v < n; v++) if (v !== skipVertex && find(v) === v) count++;\n  return count;\n}\nconst norm = (list) => list.map(([a, b]) => [Math.min(a, b), Math.max(a, b)]).sort((x, y) => x[0] - y[0] || x[1] - y[1]);\nfor (let t = 0; t < 400; t++) {\n  const n = pick(1, 9);\n  const m = pick(0, 12);\n  const edges = Array.from({ length: m }, () => [pick(0, n - 1), pick(0, n - 1)]);\n  const base = pieces(n, edges, -1, -1);\n  const want = edges.filter((_, id) => pieces(n, edges, id, -1) > base);\n  assert.deepEqual(norm(criticalConnections(n, edges)), norm(want));\n}"
      }
    ]
  },
  {
    "id": "ex-articulation-points",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Articulation Points",
    "brief": "<p>An undirected graph has vertices <code>0</code> to <code>n - 1</code> and edges <code>[a, b]</code>. A vertex is an <b>articulation point</b> if removing it (and its edges) increases the number of connected components. Write <code>articulationPoints(n, edges)</code> returning them as an ascending array.</p><ul><li>The graph may be disconnected</li><li>Parallel edges and self-loops may appear</li><li>The start of a DFS needs a different test from every other vertex</li><li>Target: O(n + edges)</li></ul>",
    "starter": "function articulationPoints(n, edges) {\n  // TODO: low-link values, with a special rule for the DFS root\n}\n",
    "hints": [
      "Removing each vertex and counting components costs O(n * (n + edges)). One DFS with tin and low can answer for every vertex.",
      "A non-root u is an articulation point when some child v has low[v] >= tin[u]: v's subtree cannot get above u. Note the >=, because an edge landing on u itself no longer helps once u is gone.",
      "The DFS root has the smallest tin, so the rule would fire for any root with a child. Instead the root is an articulation point exactly when it has two or more DFS children."
    ],
    "solution": "function lowLink(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  edges.forEach(([a, b], id) => {\n    adj[a].push([b, id]);\n    adj[b].push([a, id]);\n  });\n  const tin = new Array(n).fill(-1);\n  const low = new Array(n).fill(0);\n  const next = new Array(n).fill(0);\n  const viaEdge = new Array(n).fill(-1);\n  const isCut = new Array(n).fill(false);\n  const bridges = [];\n  let timer = 0;\n  for (let root = 0; root < n; root++) {\n    if (tin[root] !== -1) continue;\n    tin[root] = low[root] = timer++;\n    const calls = [root];\n    let rootChildren = 0;\n    while (calls.length) {\n      const u = calls[calls.length - 1];\n      if (next[u] < adj[u].length) {\n        const [v, id] = adj[u][next[u]++];\n        if (id === viaEdge[u]) continue;\n        if (tin[v] !== -1) {\n          low[u] = Math.min(low[u], tin[v]);\n        } else {\n          tin[v] = low[v] = timer++;\n          viaEdge[v] = id;\n          calls.push(v);\n          if (u === root) rootChildren++;\n        }\n      } else {\n        calls.pop();\n        if (calls.length) {\n          const p = calls[calls.length - 1];\n          low[p] = Math.min(low[p], low[u]);\n          if (low[u] > tin[p]) bridges.push([p, u]);\n          if (p !== root && low[u] >= tin[p]) isCut[p] = true;\n        }\n      }\n    }\n    if (rootChildren >= 2) isCut[root] = true;\n  }\n  return { bridges, cutVertices: isCut.flatMap((flag, v) => (flag ? [v] : [])) };\n}\n\nfunction articulationPoints(n, edges) {\n  return lowLink(n, edges).cutVertices;\n}\n",
    "tests": [
      {
        "name": "a path: every inner vertex",
        "body": "assert.deepEqual(articulationPoints(4, [[0, 1], [1, 2], [2, 3]]), [1, 2]);"
      },
      {
        "name": "a triangle has none",
        "body": "assert.deepEqual(articulationPoints(3, [[0, 1], [1, 2], [2, 0]]), []);"
      },
      {
        "name": "the DFS root with two children counts",
        "body": "assert.deepEqual(articulationPoints(3, [[0, 1], [0, 2]]), [0]);"
      },
      {
        "name": "the DFS root with one child does not",
        "body": "assert.deepEqual(articulationPoints(2, [[0, 1]]), []);\nassert.deepEqual(articulationPoints(3, [[0, 1], [1, 2], [2, 0], [2, 0]]), []);"
      },
      {
        "name": "two triangles and a leaf",
        "body": "assert.deepEqual(articulationPoints(7, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 5], [5, 3], [3, 6]]), [2, 3]);"
      },
      {
        "name": "a vertex shared by two cycles",
        "body": "assert.deepEqual(articulationPoints(5, [[0, 1], [1, 2], [2, 0], [2, 3], [3, 4], [4, 2]]), [2]);"
      },
      {
        "name": "disconnected graph, isolated vertices, no edges",
        "body": "assert.deepEqual(articulationPoints(6, [[0, 1], [1, 2], [4, 5]]), [1]);\nassert.deepEqual(articulationPoints(4, []), []);"
      },
      {
        "name": "a line of 20000 vertices needs a loop, not recursion",
        "body": "const n = 20000;\nconst line = Array.from({ length: n - 1 }, (_, i) => [i, i + 1]);\nassert.equal(articulationPoints(n, line).length, n - 2);"
      },
      {
        "name": "random graphs agree with removing each vertex in turn",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfunction pieces(n, edges, skipEdge, skipVertex) {\n  const parent = Array.from({ length: n }, (_, i) => i);\n  const find = (x) => (parent[x] === x ? x : (parent[x] = find(parent[x])));\n  edges.forEach(([a, b], id) => {\n    if (id !== skipEdge && a !== skipVertex && b !== skipVertex) parent[find(a)] = find(b);\n  });\n  let count = 0;\n  for (let v = 0; v < n; v++) if (v !== skipVertex && find(v) === v) count++;\n  return count;\n}\nfor (let t = 0; t < 400; t++) {\n  const n = pick(1, 9);\n  const m = pick(0, 12);\n  const edges = Array.from({ length: m }, () => [pick(0, n - 1), pick(0, n - 1)]);\n  const base = pieces(n, edges, -1, -1);\n  const want = [];\n  for (let v = 0; v < n; v++) if (pieces(n, edges, -1, v) > base) want.push(v);\n  assert.deepEqual(articulationPoints(n, edges), want);\n}"
      }
    ]
  },
  {
    "id": "ex-euler-kind-directed",
    "chapter": "dsa-graph-structure",
    "level": "intermediate",
    "title": "Euler Circuit or Path in a Directed Graph",
    "brief": "<p>A directed graph has vertices <code>0</code> to <code>n - 1</code> and edges <code>[from, to]</code> (parallel edges and self-loops allowed). Write <code>eulerKindDirected(n, edges)</code> returning:</p><ul><li><code>\"circuit\"</code> if some closed walk uses every edge exactly once</li><li><code>\"path\"</code> if some walk uses every edge exactly once but no closed one does</li><li><code>\"none\"</code> otherwise</li><li>A graph with no edges counts as <code>\"circuit\"</code></li><li>Vertices with no edges may exist and do not matter; the edges themselves must form one connected piece when directions are ignored</li></ul>",
    "starter": "function eulerKindDirected(n, edges) {\n  // TODO: compare in-degree and out-degree, then check connectivity\n}\n",
    "hints": [
      "Each time a walk passes through a vertex it uses one edge in and one edge out. What does that say about out-degree minus in-degree at an interior vertex?",
      "Circuit: every vertex balanced. Path: exactly one vertex with out - in = 1 (the start), exactly one with in - out = 1 (the end), the rest balanced. Anything else is impossible.",
      "Balance alone is not enough: two separate cycles are balanced but cannot be walked as one trail. Check that all vertices with edges are connected, ignoring edge direction."
    ],
    "solution": "function eulerKindDirected(n, edges) {\n  const balance = new Array(n).fill(0);\n  const touched = new Array(n).fill(false);\n  const around = Array.from({ length: n }, () => []);\n  for (const [u, v] of edges) {\n    balance[u]++;\n    balance[v]--;\n    touched[u] = touched[v] = true;\n    around[u].push(v);\n    around[v].push(u);\n  }\n  const first = touched.indexOf(true);\n  if (first === -1) return \"circuit\";\n  const seen = new Array(n).fill(false);\n  seen[first] = true;\n  const stack = [first];\n  while (stack.length) {\n    const u = stack.pop();\n    for (const v of around[u]) {\n      if (!seen[v]) {\n        seen[v] = true;\n        stack.push(v);\n      }\n    }\n  }\n  for (let v = 0; v < n; v++) if (touched[v] && !seen[v]) return \"none\";\n  let starts = 0;\n  let ends = 0;\n  for (const b of balance) {\n    if (b === 1) starts++;\n    else if (b === -1) ends++;\n    else if (b !== 0) return \"none\";\n  }\n  if (starts === 0 && ends === 0) return \"circuit\";\n  if (starts === 1 && ends === 1) return \"path\";\n  return \"none\";\n}\n",
    "tests": [
      {
        "name": "no edges at all",
        "body": "assert.equal(eulerKindDirected(3, []), \"circuit\");"
      },
      {
        "name": "a directed cycle",
        "body": "assert.equal(eulerKindDirected(3, [[0, 1], [1, 2], [2, 0]]), \"circuit\");"
      },
      {
        "name": "a directed line",
        "body": "assert.equal(eulerKindDirected(3, [[0, 1], [1, 2]]), \"path\");"
      },
      {
        "name": "one start with two ways out is impossible",
        "body": "assert.equal(eulerKindDirected(3, [[0, 1], [0, 2]]), \"none\");"
      },
      {
        "name": "two separate cycles are balanced but not one trail",
        "body": "assert.equal(eulerKindDirected(4, [[0, 1], [1, 0], [2, 3], [3, 2]]), \"none\");"
      },
      {
        "name": "two cycles sharing a vertex",
        "body": "assert.equal(eulerKindDirected(5, [[0, 1], [1, 0], [0, 2], [2, 3], [3, 0]]), \"circuit\");"
      },
      {
        "name": "self-loops and parallel edges",
        "body": "assert.equal(eulerKindDirected(2, [[0, 0], [0, 1], [0, 1], [1, 0]]), \"path\");\nassert.equal(eulerKindDirected(1, [[0, 0]]), \"circuit\");"
      },
      {
        "name": "a path where the surplus vertices are the wrong way round",
        "body": "assert.equal(eulerKindDirected(4, [[1, 0], [2, 0], [0, 3]]), \"none\");"
      },
      {
        "name": "random multigraphs agree with trying every ordering of the edges",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfunction trails(n, edges) {\n  const m = edges.length;\n  const used = new Array(m).fill(false);\n  const found = [];\n  const go = (u, seq) => {\n    if (seq.length === m + 1) {\n      found.push(seq.slice());\n      return;\n    }\n    for (let id = 0; id < m; id++) {\n      if (used[id] || edges[id][0] !== u) continue;\n      used[id] = true;\n      seq.push(edges[id][1]);\n      go(edges[id][1], seq);\n      seq.pop();\n      used[id] = false;\n    }\n  };\n  for (let s = 0; s < n; s++) go(s, [s]);\n  return found;\n}\nfor (let t = 0; t < 300; t++) {\n  const n = pick(1, 4);\n  const m = pick(0, 6);\n  const edges = Array.from({ length: m }, () => [pick(0, n - 1), pick(0, n - 1)]);\n  const all = trails(n, edges);\n  const want = all.length === 0 ? \"none\" : all.some((tr) => tr[0] === tr[tr.length - 1]) ? \"circuit\" : \"path\";\n  assert.equal(eulerKindDirected(n, edges), want);\n}"
      }
    ]
  },
  {
    "id": "ex-reconstruct-itinerary",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Reconstruct Itinerary",
    "brief": "<p>You are given airline tickets as pairs <code>[from, to]</code> of airport codes. Write <code>findItinerary(tickets)</code> returning the itinerary that starts at <code>\"JFK\"</code>, uses every ticket exactly once, and is the <b>smallest in lexical order</b> among all such itineraries (compare the arrays element by element as strings).</p><ul><li>An itinerary is an array of airport codes, one more than the number of tickets</li><li>A valid itinerary is guaranteed to exist</li><li>The same ticket can appear more than once</li><li>Always taking the smallest next airport can strand unused tickets, so a plain greedy walk is not enough</li></ul>",
    "starter": "function findItinerary(tickets) {\n  // TODO: an Euler path from \"JFK\", smallest destinations first\n}\n",
    "hints": [
      "Using every ticket exactly once is an Euler path in a directed multigraph, so Hierholzer's algorithm applies.",
      "Keep each airport's destinations sorted so the smallest sits at the END of its array and pop() takes it in O(1). Walk with a stack: take a ticket while one is left, and when the top airport has none, pop it into the route.",
      "The route is written backwards, so reverse it. An airport where the walk gets stuck is written first and therefore comes last, which is how a dead end is saved for the end of the trip."
    ],
    "solution": "function findItinerary(tickets) {\n  const adj = new Map();\n  for (const [from, to] of tickets) {\n    if (!adj.has(from)) adj.set(from, []);\n    adj.get(from).push(to);\n  }\n  for (const list of adj.values()) list.sort().reverse();\n  const stack = [\"JFK\"];\n  const route = [];\n  while (stack.length) {\n    const airport = stack[stack.length - 1];\n    const options = adj.get(airport);\n    if (options && options.length) stack.push(options.pop());\n    else route.push(stack.pop());\n  }\n  return route.reverse();\n}\n",
    "tests": [
      {
        "name": "a single ticket",
        "body": "assert.deepEqual(findItinerary([['JFK', 'SFO']]), ['JFK', 'SFO']);"
      },
      {
        "name": "a dead end must be saved for last",
        "body": "assert.deepEqual(findItinerary([['JFK', 'KUL'], ['JFK', 'NRT'], ['NRT', 'JFK']]), ['JFK', 'NRT', 'JFK', 'KUL']);"
      },
      {
        "name": "the classic five tickets",
        "body": "assert.deepEqual(findItinerary([['JFK', 'SFO'], ['JFK', 'ATL'], ['SFO', 'ATL'], ['ATL', 'JFK'], ['ATL', 'SFO']]), ['JFK', 'ATL', 'JFK', 'SFO', 'ATL', 'SFO']);"
      },
      {
        "name": "a chain of airports",
        "body": "assert.deepEqual(findItinerary([['MUC', 'LHR'], ['JFK', 'MUC'], ['SFO', 'SJC'], ['LHR', 'SFO']]), ['JFK', 'MUC', 'LHR', 'SFO', 'SJC']);"
      },
      {
        "name": "duplicate tickets are used twice",
        "body": "assert.deepEqual(findItinerary([['JFK', 'AAA'], ['AAA', 'JFK'], ['JFK', 'AAA'], ['AAA', 'JFK']]), ['JFK', 'AAA', 'JFK', 'AAA', 'JFK']);"
      },
      {
        "name": "the input array is not required to be sorted",
        "body": "assert.deepEqual(findItinerary([['B', 'JFK'], ['JFK', 'B'], ['JFK', 'A'], ['A', 'JFK']]), ['JFK', 'A', 'JFK', 'B', 'JFK']);"
      },
      {
        "name": "ten thousand tickets in a long loop",
        "body": "const n = 10000;\nconst codes = Array.from({ length: n }, (_, i) => (i === 0 ? 'JFK' : 'X' + String(i).padStart(5, '0')));\nconst tickets = codes.map((c, i) => [c, codes[(i + 1) % n]]);\nconst got = findItinerary(tickets);\nassert.equal(got.length, n + 1);\nassert.equal(got[n], 'JFK');\nassert.equal(got[1], 'X00001');"
      },
      {
        "name": "random ticket sets agree with trying every itinerary in order",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nconst AIR = ['JFK', 'ATL', 'LAX', 'SFO', 'SEA', 'MIA'];\nconst valid = (tickets) => {\n  const m = tickets.length;\n  const used = new Array(m).fill(false);\n  let best = null;\n  const go = (airport, seq) => {\n    if (seq.length === m + 1) {\n      if (best === null) best = seq.slice();\n      return;\n    }\n    const ids = tickets.map((_, i) => i).filter((i) => !used[i] && tickets[i][0] === airport).sort((a, b) => (tickets[a][1] < tickets[b][1] ? -1 : tickets[a][1] > tickets[b][1] ? 1 : 0));\n    for (const id of ids) {\n      if (best !== null) return;\n      used[id] = true;\n      seq.push(tickets[id][1]);\n      go(tickets[id][1], seq);\n      seq.pop();\n      used[id] = false;\n    }\n  };\n  go('JFK', ['JFK']);\n  return best;\n};\nlet checked = 0;\nfor (let t = 0; t < 4000 && checked < 150; t++) {\n  const m = pick(2, 7);\n  const tickets = [];\n  let at = 0;\n  for (let i = 0; i < m; i++) {\n    const next = pick(0, 5);\n    tickets.push([AIR[at], AIR[next]]);\n    at = rnd() < 0.8 ? next : pick(0, 5);\n  }\n  tickets.sort(() => rnd() - 0.5);\n  const want = valid(tickets);\n  if (want === null) continue;\n  checked++;\n  assert.deepEqual(findItinerary(tickets), want);\n}\nassert.ok(checked > 20);"
      }
    ]
  },
  {
    "id": "ex-valid-arrangement-of-pairs",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Valid Arrangement of Pairs",
    "brief": "<p>You are given <code>pairs</code>, an array of <code>[start, end]</code> integer pairs. An <b>arrangement</b> is a reordering of the pairs so that for every neighbouring two, the <code>end</code> of the first equals the <code>start</code> of the second. Write <code>validArrangement(pairs)</code> returning any valid arrangement.</p><ul><li>An arrangement is guaranteed to exist</li><li>Every pair must be used exactly once, and pairs are returned unchanged, as <code>[start, end]</code></li><li>The integers can be large (up to 10<sup>9</sup>), so use a <code>Map</code>, not an array indexed by value</li><li>The same pair may appear more than once</li></ul>",
    "starter": "function validArrangement(pairs) {\n  // TODO: each pair is an edge; find a trail that uses every edge once\n}\n",
    "hints": [
      "Treat every number as a vertex and every pair as a directed edge start to end. An arrangement is then a trail that uses each edge exactly once.",
      "Pick the starting vertex: if one vertex has out-degree one greater than its in-degree, it must be the start; if all vertices are balanced, any vertex that has an outgoing edge will do.",
      "Run Hierholzer with a stack that holds EDGES (or vertices with the edge used to reach them) so you can output pairs. The finished edges come out in reverse order."
    ],
    "solution": "function validArrangement(pairs) {\n  const out = new Map();\n  const balance = new Map();\n  for (const [a, b] of pairs) {\n    if (!out.has(a)) out.set(a, []);\n    out.get(a).push(b);\n    balance.set(a, (balance.get(a) || 0) + 1);\n    balance.set(b, (balance.get(b) || 0) - 1);\n  }\n  let start = pairs[0][0];\n  for (const [v, b] of balance) if (b === 1) start = v;\n  const stack = [[start, null]];\n  const result = [];\n  while (stack.length) {\n    const [u] = stack[stack.length - 1];\n    const options = out.get(u);\n    if (options && options.length) {\n      stack.push([options.pop(), u]);\n    } else {\n      const [v, from] = stack.pop();\n      if (from !== null) result.push([from, v]);\n    }\n  }\n  return result.reverse();\n}\n",
    "tests": [
      {
        "name": "a single pair",
        "body": "assert.deepEqual(validArrangement([[1, 2]]), [[1, 2]]);"
      },
      {
        "name": "pairs given out of order",
        "body": "const pairs = [[5, 1], [4, 5], [11, 9], [9, 4]];\nassert.deepEqual(validArrangement(pairs), [[11, 9], [9, 4], [4, 5], [5, 1]]);"
      },
      {
        "name": "a closed loop can start anywhere",
        "body": "const pairs = [[1, 3], [3, 2], [2, 1]];\nconst got = validArrangement(pairs);\nassert.equal(got.length, 3);\nfor (let i = 0; i + 1 < got.length; i++) assert.equal(got[i][1], got[i + 1][0]);\nassert.deepEqual(got.map((p) => p.join('-')).sort(), ['1-3', '2-1', '3-2']);"
      },
      {
        "name": "a detour that must be spliced in",
        "body": "const pairs = [[1, 2], [2, 3], [3, 2], [2, 4]];\nconst got = validArrangement(pairs);\nfor (let i = 0; i + 1 < got.length; i++) assert.equal(got[i][1], got[i + 1][0]);\nassert.deepEqual(got.map((p) => p.join('-')).sort(), ['1-2', '2-3', '2-4', '3-2']);\nassert.deepEqual(got[0], [1, 2]);"
      },
      {
        "name": "duplicate pairs are all used",
        "body": "const pairs = [[7, 7], [7, 7], [7, 8]];\nconst got = validArrangement(pairs);\nassert.deepEqual(got, [[7, 7], [7, 7], [7, 8]]);"
      },
      {
        "name": "large vertex values",
        "body": "const pairs = [[1000000000, 5], [5, 999999999], [999999999, 1000000000], [1000000000, 7]];\nconst got = validArrangement(pairs);\nfor (let i = 0; i + 1 < got.length; i++) assert.equal(got[i][1], got[i + 1][0]);\nassert.equal(got.length, 4);\nassert.deepEqual(got[0][0], 1000000000);"
      },
      {
        "name": "a long chain of 50000 pairs needs a loop, not recursion",
        "body": "const n = 50000;\nconst pairs = Array.from({ length: n }, (_, i) => [i, i + 1]);\nconst got = validArrangement(pairs.slice().reverse());\nassert.equal(got.length, n);\nassert.deepEqual(got[0], [0, 1]);\nassert.deepEqual(got[n - 1], [n - 1, n]);"
      },
      {
        "name": "random shuffled trails are rearranged into valid ones",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfor (let t = 0; t < 200; t++) {\n  const steps = pick(1, 12);\n  const walk = [pick(0, 4)];\n  for (let i = 0; i < steps; i++) walk.push(pick(0, 4));\n  const pairs = [];\n  for (let i = 0; i < steps; i++) pairs.push([walk[i], walk[i + 1]]);\n  const shuffled = pairs.slice().sort(() => rnd() - 0.5);\n  const got = validArrangement(shuffled);\n  assert.equal(got.length, pairs.length);\n  for (let i = 0; i + 1 < got.length; i++) assert.equal(got[i][1], got[i + 1][0]);\n  const key = (list) => list.map((p) => p.join('>')).sort().join(',');\n  assert.equal(key(got), key(pairs));\n}"
      }
    ]
  },
  {
    "id": "ex-kth-ancestor-queries",
    "chapter": "dsa-graph-structure",
    "level": "intermediate",
    "title": "Kth Ancestor Queries",
    "brief": "<p>A rooted tree has <code>n</code> nodes numbered <code>0</code> to <code>n - 1</code>, described by <code>parent</code>, where <code>parent[i]</code> is the parent of node <code>i</code> and the single root has parent <code>-1</code>. Write <code>kthAncestors(parent, queries)</code> where each query is <code>[node, k]</code>, returning an array with the <code>k</code>th ancestor of each node, or <code>-1</code> if there is none.</p><ul><li>The 1st ancestor is the parent, the 0th is the node itself</li><li><code>parent[i]</code> can be larger than <code>i</code></li><li><code>k</code> can be larger than the depth of the tree</li><li>Target: O(n log n) to prepare and O(log n) per query. The tree can be a line of 100000 nodes</li></ul>",
    "starter": "function kthAncestors(parent, queries) {\n  // TODO: precompute the 1st, 2nd, 4th, 8th... ancestor of every node\n}\n",
    "hints": [
      "Walking up k times per query is O(k) and O(n) on a long line. Precompute jumps instead.",
      "Let up[j][v] be the 2^j-th ancestor of v, or -1. Row 0 is the parent array, and up[j][v] = up[j-1][up[j-1][v]] when that inner value is not -1.",
      "Write k in binary. For every set bit j, jump with row j. Stop early at -1, and answer -1 at once if k is at least n."
    ],
    "solution": "function kthAncestors(parent, queries) {\n  const n = parent.length;\n  let LOG = 1;\n  while (1 << LOG < n) LOG++;\n  const up = [parent.slice()];\n  for (let j = 1; j < LOG; j++) {\n    const prev = up[j - 1];\n    up.push(prev.map((mid) => (mid === -1 ? -1 : prev[mid])));\n  }\n  return queries.map(([node, k]) => {\n    if (k >= n) return -1;\n    let v = node;\n    for (let j = 0; k > 0 && v !== -1; j++, k >>= 1) {\n      if (k & 1) v = up[j][v];\n    }\n    return v;\n  });\n}\n",
    "tests": [
      {
        "name": "a single node",
        "body": "assert.deepEqual(kthAncestors([-1], [[0, 0], [0, 1]]), [0, -1]);"
      },
      {
        "name": "parents and grandparents",
        "body": "const parent = [-1, 0, 0, 1, 1, 2, 3];\nassert.deepEqual(kthAncestors(parent, [[6, 1], [6, 2], [6, 3], [6, 4], [5, 2], [4, 1]]), [3, 1, 0, -1, 0, 1]);"
      },
      {
        "name": "k equal to zero returns the node",
        "body": "assert.deepEqual(kthAncestors([-1, 0, 1], [[2, 0], [1, 0]]), [2, 1]);"
      },
      {
        "name": "k larger than the tree",
        "body": "assert.deepEqual(kthAncestors([-1, 0, 1], [[2, 5], [2, 100], [2, 3]]), [-1, -1, -1]);"
      },
      {
        "name": "parents with larger numbers than their children",
        "body": "const parent = [-1, 3, 1, 0];\nassert.deepEqual(kthAncestors(parent, [[2, 1], [2, 2], [2, 3], [2, 4]]), [1, 3, 0, -1]);"
      },
      {
        "name": "a power-of-two sized line",
        "body": "const n = 16;\nconst parent = Array.from({ length: n }, (_, i) => i - 1);\nassert.deepEqual(kthAncestors(parent, [[15, 15], [15, 8], [15, 7], [7, 7], [7, 8]]), [0, 7, 8, 0, -1]);"
      },
      {
        "name": "a line of 100000 nodes",
        "body": "const n = 100000;\nconst parent = Array.from({ length: n }, (_, i) => i - 1);\nassert.deepEqual(kthAncestors(parent, [[n - 1, 12345], [n - 1, n - 1], [n - 1, n], [500, 499]]), [n - 1 - 12345, 0, -1, 1]);"
      },
      {
        "name": "random trees agree with walking up one step at a time",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfor (let t = 0; t < 200; t++) {\n  const n = pick(1, 40);\n  const order = Array.from({ length: n }, (_, i) => i).sort(() => rnd() - 0.5);\n  const root = order[0];\n  const parent = new Array(n).fill(-1);\n  for (let i = 1; i < n; i++) parent[order[i]] = order[pick(0, i - 1)];\n  parent[root] = -1;\n  const queries = Array.from({ length: 30 }, () => [pick(0, n - 1), pick(0, n + 2)]);\n  const want = queries.map(([node, k]) => {\n    let v = node;\n    for (let i = 0; i < k && v !== -1; i++) v = parent[v];\n    return v;\n  });\n  assert.deepEqual(kthAncestors(parent, queries), want);\n}"
      }
    ]
  },
  {
    "id": "ex-lca-queries",
    "chapter": "dsa-graph-structure",
    "level": "advanced",
    "title": "Lowest Common Ancestor Queries",
    "brief": "<p>A rooted tree has <code>n</code> nodes numbered <code>0</code> to <code>n - 1</code>, described by <code>parent</code>, where <code>parent[i]</code> is the parent of node <code>i</code> and the single root has parent <code>-1</code>. Write <code>lcaQueries(parent, queries)</code> where each query is <code>[u, v]</code>, returning the lowest common ancestor of each pair.</p><ul><li>A node counts as its own ancestor, so the LCA of a node and one of its ancestors is that ancestor</li><li><code>parent[i]</code> can be larger than <code>i</code></li><li>Target: O(n log n) to prepare and O(log n) per query. The tree can be a line of 50000 nodes, so compute depths without recursion</li></ul>",
    "starter": "function lcaQueries(parent, queries) {\n  // TODO: depths by BFS, a table of 2^j-th ancestors, then lift and compare\n}\n",
    "hints": [
      "Walking both nodes up one step at a time is O(depth) per query. Precompute jumps: up[j][v] is the 2^j-th ancestor of v, or -1.",
      "First lift the deeper node by the depth difference so both sit at the same depth. If they are now the same node, that is the answer.",
      "Then try jumps from the longest row down to row 0: whenever up[j][u] and up[j][v] differ, move both. At the end both are children of the answer, so return parent[u]."
    ],
    "solution": "function lcaQueries(parent, queries) {\n  const n = parent.length;\n  let LOG = 1;\n  while (1 << LOG < n) LOG++;\n  const up = [parent.slice()];\n  for (let j = 1; j < LOG; j++) {\n    const prev = up[j - 1];\n    up.push(prev.map((mid) => (mid === -1 ? -1 : prev[mid])));\n  }\n  const children = Array.from({ length: n }, () => []);\n  let root = 0;\n  for (let v = 0; v < n; v++) {\n    if (parent[v] === -1) root = v;\n    else children[parent[v]].push(v);\n  }\n  const depth = new Array(n).fill(0);\n  const queue = [root];\n  for (let head = 0; head < queue.length; head++) {\n    const u = queue[head];\n    for (const c of children[u]) {\n      depth[c] = depth[u] + 1;\n      queue.push(c);\n    }\n  }\n  const lift = (v, k) => {\n    for (let j = 0; k > 0; j++, k >>= 1) if (k & 1) v = up[j][v];\n    return v;\n  };\n  return queries.map(([a, b]) => {\n    let u = a;\n    let v = b;\n    if (depth[u] < depth[v]) [u, v] = [v, u];\n    u = lift(u, depth[u] - depth[v]);\n    if (u === v) return u;\n    for (let j = LOG - 1; j >= 0; j--) {\n      if (up[j][u] !== up[j][v]) {\n        u = up[j][u];\n        v = up[j][v];\n      }\n    }\n    return up[0][u];\n  });\n}\n",
    "tests": [
      {
        "name": "a single node",
        "body": "assert.deepEqual(lcaQueries([-1], [[0, 0]]), [0]);"
      },
      {
        "name": "siblings and cousins",
        "body": "const parent = [-1, 0, 0, 1, 1, 2, 2];\nassert.deepEqual(lcaQueries(parent, [[3, 4], [3, 5], [5, 6], [3, 6]]), [1, 0, 2, 0]);"
      },
      {
        "name": "a node and its own ancestor",
        "body": "const parent = [-1, 0, 1, 2];\nassert.deepEqual(lcaQueries(parent, [[3, 1], [1, 3], [2, 2], [0, 3]]), [1, 1, 2, 0]);"
      },
      {
        "name": "the ten-node tree of the chapter",
        "body": "const parent = [-1, 0, 0, 1, 1, 2, 3, 3, 4, 7];\nassert.deepEqual(lcaQueries(parent, [[9, 8], [9, 6], [9, 5], [8, 6]]), [1, 3, 0, 1]);"
      },
      {
        "name": "the root need not be node 0",
        "body": "const parent = [2, 2, -1, 0, 0];\nassert.deepEqual(lcaQueries(parent, [[3, 4], [3, 1], [4, 2]]), [0, 2, 2]);"
      },
      {
        "name": "parents numbered above their children",
        "body": "const parent = [3, 3, 4, 4, -1];\nassert.deepEqual(lcaQueries(parent, [[0, 1], [0, 2], [1, 3]]), [3, 4, 3]);"
      },
      {
        "name": "a line of 50000 nodes",
        "body": "const n = 50000;\nconst parent = Array.from({ length: n }, (_, i) => i - 1);\nassert.deepEqual(lcaQueries(parent, [[n - 1, 7], [123, 40000], [0, n - 1]]), [7, 123, 0]);"
      },
      {
        "name": "random trees agree with walking up",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfor (let t = 0; t < 200; t++) {\n  const n = pick(1, 40);\n  const order = Array.from({ length: n }, (_, i) => i).sort(() => rnd() - 0.5);\n  const parent = new Array(n).fill(-1);\n  for (let i = 1; i < n; i++) parent[order[i]] = order[pick(0, i - 1)];\n  const queries = Array.from({ length: 30 }, () => [pick(0, n - 1), pick(0, n - 1)]);\n  const want = queries.map(([u, v]) => {\n    const seen = new Set();\n    for (let x = u; x !== -1; x = parent[x]) seen.add(x);\n    let y = v;\n    while (!seen.has(y)) y = parent[y];\n    return y;\n  });\n  assert.deepEqual(lcaQueries(parent, queries), want);\n}"
      }
    ]
  },
  {
    "id": "ex-tree-diameter-weighted",
    "chapter": "dsa-graph-structure",
    "level": "intermediate",
    "title": "Diameter of a Weighted Tree",
    "brief": "<p>A tree has <code>n</code> vertices numbered <code>0</code> to <code>n - 1</code> and <code>n - 1</code> edges <code>[u, v, w]</code>, each with a weight <code>w &gt;= 0</code>. Write <code>treeDiameter(n, edges)</code> returning the largest total weight along any path between two vertices.</p><ul><li>A tree with one vertex has diameter <code>0</code></li><li>Weights can be zero</li><li>The tree can be a line of 100000 vertices, so avoid recursion</li><li>Target: O(n)</li></ul>",
    "starter": "function treeDiameter(n, edges) {\n  // TODO: two sweeps, or a DP over the best two branches at every vertex\n}\n",
    "hints": [
      "Trying every start vertex costs O(n^2). In a tree there is exactly one path between two vertices, so any traversal that adds up weights computes distances correctly.",
      "Sweep once from any vertex and remember the farthest vertex a. Sweep again from a. The largest distance seen in the second sweep is the diameter.",
      "Use an explicit stack for the sweeps. In a tree, a neighbour you have already given a distance to is just the vertex you came from."
    ],
    "solution": "function treeDiameter(n, edges) {\n  if (n <= 1) return 0;\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v, w] of edges) {\n    adj[u].push([v, w]);\n    adj[v].push([u, w]);\n  }\n  const sweep = (start) => {\n    const dist = new Array(n).fill(-1);\n    dist[start] = 0;\n    const stack = [start];\n    let best = start;\n    while (stack.length) {\n      const u = stack.pop();\n      if (dist[u] > dist[best]) best = u;\n      for (const [v, w] of adj[u]) {\n        if (dist[v] === -1) {\n          dist[v] = dist[u] + w;\n          stack.push(v);\n        }\n      }\n    }\n    return [best, dist[best]];\n  };\n  const [a] = sweep(0);\n  return sweep(a)[1];\n}\n",
    "tests": [
      {
        "name": "one vertex",
        "body": "assert.equal(treeDiameter(1, []), 0);"
      },
      {
        "name": "one edge",
        "body": "assert.equal(treeDiameter(2, [[0, 1, 7]]), 7);"
      },
      {
        "name": "the weighted tree of the chapter",
        "body": "assert.equal(treeDiameter(8, [[0, 1, 2], [1, 2, 3], [1, 3, 1], [0, 4, 4], [4, 5, 2], [5, 6, 5], [4, 7, 1]]), 16);"
      },
      {
        "name": "a star: two heaviest spokes",
        "body": "assert.equal(treeDiameter(5, [[0, 1, 3], [0, 2, 9], [0, 3, 4], [0, 4, 8]]), 17);"
      },
      {
        "name": "the longest path avoids vertex 0",
        "body": "assert.equal(treeDiameter(6, [[0, 1, 1], [1, 2, 10], [1, 3, 10], [0, 4, 2], [4, 5, 1]]), 20);"
      },
      {
        "name": "zero-weight edges",
        "body": "assert.equal(treeDiameter(4, [[0, 1, 0], [1, 2, 0], [2, 3, 0]]), 0);\nassert.equal(treeDiameter(4, [[0, 1, 0], [1, 2, 5], [2, 3, 0]]), 5);"
      },
      {
        "name": "unit weights count edges",
        "body": "assert.equal(treeDiameter(5, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [2, 4, 1]]), 3);"
      },
      {
        "name": "a line of 100000 vertices",
        "body": "const n = 100000;\nconst line = Array.from({ length: n - 1 }, (_, i) => [i, i + 1, 2]);\nassert.equal(treeDiameter(n, line), 2 * (n - 1));"
      },
      {
        "name": "random trees agree with all-pairs distances",
        "body": "let seed = 12345;\nconst rnd = () => (seed = (seed * 48271) % 2147483647) / 2147483647;\nconst pick = (lo, hi) => lo + Math.floor(rnd() * (hi - lo + 1));\nfor (let t = 0; t < 200; t++) {\n  const n = pick(1, 12);\n  const edges = [];\n  for (let v = 1; v < n; v++) edges.push([pick(0, v - 1), v, pick(0, 9)]);\n  const d = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)));\n  for (const [u, v, w] of edges) d[u][v] = d[v][u] = w;\n  for (let k = 0; k < n; k++) for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) d[i][j] = Math.min(d[i][j], d[i][k] + d[k][j]);\n  assert.equal(treeDiameter(n, edges), Math.max(0, ...d.flat()));\n}"
      }
    ]
  }
];
