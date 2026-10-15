import type { Exercise } from "../types";

export const dsaAddMinimumSpanningTree: Exercise[] = [
  {
    "id": "ex-optimize-water-distribution",
    "chapter": "dsa-minimum-spanning-tree",
    "level": "intermediate",
    "title": "Optimize Water Distribution in a Village",
    "brief": "<p>There are <code>n</code> houses numbered <code>1</code> to <code>n</code>. Every house must get water. You can dig a well in house <code>i</code> for <code>wells[i - 1]</code>, or lay a pipe between two houses: <code>pipes[k] = [a, b, cost]</code> connects houses <code>a</code> and <code>b</code> (either direction) for <code>cost</code>.</p><p>A house has water if it has its own well or is joined by a chain of pipes to a house that does. Write <code>minCostToSupplyWater(n, wells, pipes)</code> returning the smallest total cost.</p><ul><li>Several pipes may connect the same pair of houses, with different costs</li><li>With no pipes the answer is the sum of all the wells</li><li>Hint for the shape: a well is just a pipe to somewhere</li></ul>",
    "starter": "function minCostToSupplyWater(n, wells, pipes) {\n  // TODO: turn the wells into edges, then build a minimum spanning tree\n}\n",
    "hints": [
      "Digging a well at house i is not a different kind of choice from laying a pipe: both pay a price to make house i part of the supplied group.",
      "Add one extra vertex 0, the water source, and an edge from 0 to each house i whose weight is wells[i - 1]. Now every house must be connected to the source.",
      "Connecting n + 1 vertices at the smallest total cost is a minimum spanning tree. Sort all edges by cost and add each one with union-find unless its endpoints are already connected."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n  }\n  find(x) {\n    while (this.parent[x] !== x) {\n      this.parent[x] = this.parent[this.parent[x]];\n      x = this.parent[x];\n    }\n    return x;\n  }\n  union(a, b) {\n    const ra = this.find(a);\n    const rb = this.find(b);\n    if (ra === rb) return false;\n    this.parent[rb] = ra;\n    return true;\n  }\n}\n\nfunction minCostToSupplyWater(n, wells, pipes) {\n  const edges = pipes.map(([a, b, cost]) => [a, b, cost]);\n  for (let i = 0; i < n; i++) edges.push([0, i + 1, wells[i]]);\n  edges.sort((x, y) => x[2] - y[2]);\n  const dsu = new DSU(n + 1);\n  let total = 0;\n  let used = 0;\n  for (const [a, b, cost] of edges) {\n    if (dsu.union(a, b)) {\n      total += cost;\n      used++;\n      if (used === n) break;\n    }\n  }\n  return total;\n}\n",
    "tests": [
      {
        "name": "one well and two pipes",
        "body": "assert.equal(minCostToSupplyWater(3, [1, 2, 2], [[1, 2, 1], [2, 3, 1]]), 3);"
      },
      {
        "name": "a pipe cheaper than a second well",
        "body": "assert.equal(minCostToSupplyWater(2, [1, 1], [[1, 2, 1]]), 2);"
      },
      {
        "name": "no pipes means every house digs",
        "body": "assert.equal(minCostToSupplyWater(3, [4, 5, 6], []), 15);\nassert.equal(minCostToSupplyWater(1, [9], []), 9);"
      },
      {
        "name": "pipes that cost more than wells are never used",
        "body": "assert.equal(minCostToSupplyWater(3, [1, 1, 1], [[1, 2, 5], [2, 3, 5], [1, 3, 5]]), 3);"
      },
      {
        "name": "parallel pipes: the cheaper one wins",
        "body": "assert.equal(minCostToSupplyWater(2, [10, 10], [[1, 2, 7], [1, 2, 2], [2, 1, 4]]), 12);"
      },
      {
        "name": "two clusters each need their own well",
        "body": "assert.equal(minCostToSupplyWater(4, [3, 8, 2, 9], [[1, 2, 1], [3, 4, 1]]), 7);"
      },
      {
        "name": "a long chain of pipes from one cheap well",
        "body": "const n = 2000;\nconst wells = new Array(n).fill(100);\nwells[0] = 1;\nconst pipes = [];\nfor (let i = 1; i < n; i++) pipes.push([i, i + 1, 1]);\nassert.equal(minCostToSupplyWater(n, wells, pipes), n);"
      },
      {
        "name": "does not change the arrays it is given",
        "body": "const wells = [5, 5, 5];\nconst pipes = [[2, 3, 9], [1, 2, 1]];\nminCostToSupplyWater(3, wells, pipes);\nassert.deepEqual(pipes, [[2, 3, 9], [1, 2, 1]]);\nassert.deepEqual(wells, [5, 5, 5]);"
      }
    ]
  },
  {
    "id": "ex-distance-limited-paths-exist",
    "chapter": "dsa-minimum-spanning-tree",
    "level": "advanced",
    "title": "Checking Existence of Edge-Length Limited Paths",
    "brief": "<p>An undirected graph has <code>n</code> vertices numbered <code>0</code> to <code>n - 1</code>. <code>edgeList[i] = [u, v, length]</code> is an edge, and several edges may join the same pair. Each query is <code>[p, q, limit]</code>: is there a path from <code>p</code> to <code>q</code> in which <b>every edge is strictly shorter</b> than <code>limit</code>?</p><p>Write <code>distanceLimitedPathsExist(n, edgeList, queries)</code> returning an array of booleans, one per query, <b>in the order the queries were given</b>.</p><ul><li>A query with <code>p === q</code> is always true</li><li>Do not mutate <code>edgeList</code> or <code>queries</code></li><li>With tens of thousands of queries a fresh search per query is too slow</li></ul>",
    "starter": "function distanceLimitedPathsExist(n, edgeList, queries) {\n  // TODO\n}\n",
    "hints": [
      "A query is true exactly when p and q are connected using only edges shorter than the limit. A union-find structure can hold 'the edges added so far', but it cannot remove any.",
      "Process the queries in increasing order of limit, and before answering each one, union every edge whose length is below that limit. The set of added edges only grows.",
      "Sort an array of query indices, not the queries themselves, and store each answer at its original index. Sort a copy of the edges."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n  }\n  find(x) {\n    while (this.parent[x] !== x) {\n      this.parent[x] = this.parent[this.parent[x]];\n      x = this.parent[x];\n    }\n    return x;\n  }\n  union(a, b) {\n    const ra = this.find(a);\n    const rb = this.find(b);\n    if (ra === rb) return false;\n    this.parent[rb] = ra;\n    return true;\n  }\n}\n\nfunction distanceLimitedPathsExist(n, edgeList, queries) {\n  const edges = edgeList.slice().sort((a, b) => a[2] - b[2]);\n  const order = queries.map((_, i) => i).sort((a, b) => queries[a][2] - queries[b][2]);\n  const dsu = new DSU(n);\n  const answer = new Array(queries.length).fill(false);\n  let next = 0;\n  for (const qi of order) {\n    const [p, q, limit] = queries[qi];\n    while (next < edges.length && edges[next][2] < limit) {\n      dsu.union(edges[next][0], edges[next][1]);\n      next++;\n    }\n    answer[qi] = dsu.find(p) === dsu.find(q);\n  }\n  return answer;\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.deepEqual(distanceLimitedPathsExist(3, [[0, 1, 2], [1, 2, 4], [2, 0, 8], [1, 0, 16]], [[0, 1, 2], [0, 2, 5]]), [false, true]);"
      },
      {
        "name": "the limit is strict: an edge exactly as long does not count",
        "body": "assert.deepEqual(distanceLimitedPathsExist(2, [[0, 1, 5]], [[0, 1, 5], [0, 1, 6], [0, 1, 4]]), [false, true, false]);"
      },
      {
        "name": "answers come back in the original query order",
        "body": "const queries = [[0, 3, 10], [0, 1, 2], [0, 3, 3], [0, 1, 1]];\nassert.deepEqual(distanceLimitedPathsExist(4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]], queries), [true, true, false, false]);"
      },
      {
        "name": "a vertex is always connected to itself",
        "body": "assert.deepEqual(distanceLimitedPathsExist(3, [], [[1, 1, 1], [0, 2, 100]]), [true, false]);"
      },
      {
        "name": "parallel edges: the shortest one decides",
        "body": "assert.deepEqual(distanceLimitedPathsExist(2, [[0, 1, 9], [0, 1, 3]], [[0, 1, 4], [0, 1, 3]]), [true, false]);"
      },
      {
        "name": "a path needs every edge short, not just the sum",
        "body": "assert.deepEqual(distanceLimitedPathsExist(3, [[0, 1, 1], [1, 2, 50], [0, 2, 60]], [[0, 2, 51], [0, 2, 50]]), [true, false]);"
      },
      {
        "name": "does not change its inputs",
        "body": "const edges = [[1, 2, 9], [0, 1, 1]];\nconst queries = [[0, 2, 20], [0, 1, 2]];\ndistanceLimitedPathsExist(3, edges, queries);\nassert.deepEqual(edges, [[1, 2, 9], [0, 1, 1]]);\nassert.deepEqual(queries, [[0, 2, 20], [0, 1, 2]]);"
      },
      {
        "name": "tens of thousands of queries finish quickly",
        "body": "const n = 20000;\nconst edges = [];\nfor (let i = 0; i + 1 < n; i++) edges.push([i, i + 1, i + 1]);\nconst queries = [];\nfor (let k = 0; k < 20000; k++) queries.push([0, (k * 7) % (n - 1) + 1, 20001]);\nconst got = distanceLimitedPathsExist(n, edges, queries);\nassert.equal(got.every(Boolean), true);\nassert.equal(distanceLimitedPathsExist(n, edges, [[0, n - 1, n - 1]])[0], false);"
      }
    ]
  },
  {
    "id": "ex-critical-pseudo-critical-edges",
    "chapter": "dsa-minimum-spanning-tree",
    "level": "advanced",
    "title": "Critical and Pseudo-Critical Edges in an MST",
    "brief": "<p>A connected, undirected, weighted graph on <code>n</code> vertices is given as <code>edges[i] = [u, v, weight]</code>. A minimum spanning tree (MST) may not be unique when weights repeat. Classify the edges by index:</p><ul><li><b>critical</b>: in <em>every</em> MST (deleting it would raise the MST weight)</li><li><b>pseudo-critical</b>: in <em>some</em> MSTs but not all</li></ul><p>Write <code>findCriticalAndPseudoCriticalEdges(n, edges)</code> returning <code>[critical, pseudo]</code>, each a list of edge indices in increasing order. An edge in no MST appears in neither list. Assume there are no self-loops.</p>",
    "starter": "function findCriticalAndPseudoCriticalEdges(n, edges) {\n  // TODO\n}\n",
    "hints": [
      "First compute the weight of an ordinary MST. Every question about an edge can be answered by comparing a modified MST weight against it.",
      "To test an edge for being critical, rebuild the MST while skipping it. If the weight rises (or the graph disconnects), every MST needed it. To test for 'in some MST', rebuild after uniting its endpoints first; if the weight still equals the best, some MST contains it.",
      "Sort the edges once but keep each edge's original index alongside it. Do the critical test first: a critical edge also passes the second test, and must not be listed twice."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n  }\n  find(x) {\n    while (this.parent[x] !== x) {\n      this.parent[x] = this.parent[this.parent[x]];\n      x = this.parent[x];\n    }\n    return x;\n  }\n  union(a, b) {\n    const ra = this.find(a);\n    const rb = this.find(b);\n    if (ra === rb) return false;\n    this.parent[rb] = ra;\n    return true;\n  }\n}\n\nfunction findCriticalAndPseudoCriticalEdges(n, edges) {\n  const order = edges.map(([u, v, w], i) => [u, v, w, i]).sort((a, b) => a[2] - b[2]);\n\n  function weightOfTree(skip, force) {\n    const dsu = new DSU(n);\n    let cost = 0;\n    let used = 0;\n    if (force !== -1) {\n      const [u, v, w] = edges[force];\n      dsu.union(u, v);\n      cost += w;\n      used++;\n    }\n    for (const [u, v, w, i] of order) {\n      if (i === skip) continue;\n      if (dsu.union(u, v)) {\n        cost += w;\n        used++;\n      }\n    }\n    return used === n - 1 ? cost : Infinity;\n  }\n\n  const best = weightOfTree(-1, -1);\n  const critical = [];\n  const pseudo = [];\n  for (let i = 0; i < edges.length; i++) {\n    if (weightOfTree(i, -1) > best) critical.push(i);\n    else if (weightOfTree(-1, i) === best) pseudo.push(i);\n  }\n  return [critical, pseudo];\n}\n",
    "tests": [
      {
        "name": "the worked example",
        "body": "assert.deepEqual(findCriticalAndPseudoCriticalEdges(5, [[0, 1, 1], [1, 2, 1], [2, 3, 2], [0, 3, 2], [0, 4, 3], [3, 4, 3], [1, 4, 6]]), [[0, 1], [2, 3, 4, 5]]);"
      },
      {
        "name": "a cycle of equal weights has no critical edge",
        "body": "assert.deepEqual(findCriticalAndPseudoCriticalEdges(4, [[0, 1, 1], [1, 2, 1], [2, 3, 1], [0, 3, 1]]), [[], [0, 1, 2, 3]]);"
      },
      {
        "name": "a tree: every edge is critical",
        "body": "assert.deepEqual(findCriticalAndPseudoCriticalEdges(4, [[0, 1, 5], [1, 2, 1], [1, 3, 9]]), [[0, 1, 2], []]);"
      },
      {
        "name": "parallel edges of equal weight are interchangeable",
        "body": "assert.deepEqual(findCriticalAndPseudoCriticalEdges(2, [[0, 1, 3], [0, 1, 3]]), [[], [0, 1]]);"
      },
      {
        "name": "a heavier parallel edge is in no MST",
        "body": "assert.deepEqual(findCriticalAndPseudoCriticalEdges(2, [[0, 1, 3], [0, 1, 4]]), [[0], []]);"
      },
      {
        "name": "the heaviest edge of a triangle is in no MST",
        "body": "assert.deepEqual(findCriticalAndPseudoCriticalEdges(3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]), [[0, 1], []]);"
      },
      {
        "name": "indices follow the input order, not the sorted order",
        "body": "assert.deepEqual(findCriticalAndPseudoCriticalEdges(3, [[0, 2, 9], [1, 2, 1], [0, 1, 1]]), [[1, 2], []]);"
      },
      {
        "name": "agrees with brute force over every spanning tree on random graphs",
        "body": "let seed = 7;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nfunction parentOf(parent, x) { while (parent[x] !== x) x = parent[x]; return x; }\nfunction allSpanningTrees(n, edges) {\n  const trees = [];\n  const chosen = [];\n  function go(start) {\n    if (chosen.length === n - 1) {\n      const parent = Array.from({ length: n }, (_, i) => i);\n      let ok = true;\n      for (const i of chosen) {\n        const a = parentOf(parent, edges[i][0]);\n        const b = parentOf(parent, edges[i][1]);\n        if (a === b) { ok = false; break; }\n        parent[a] = b;\n      }\n      if (ok) trees.push({ set: chosen.slice(), weight: chosen.reduce((s, i) => s + edges[i][2], 0) });\n      return;\n    }\n    for (let i = start; i < edges.length; i++) { chosen.push(i); go(i + 1); chosen.pop(); }\n  }\n  go(0);\n  return trees;\n}\nfunction randomGraph(n, extra, maxW) {\n  const edges = [];\n  for (let v = 1; v < n; v++) edges.push([ri(0, v - 1), v, ri(1, maxW)]);\n  for (let k = 0; k < extra; k++) {\n    const u = ri(0, n - 1);\n    const v = ri(0, n - 1);\n    if (u !== v) edges.push([u, v, ri(1, maxW)]);\n  }\n  return edges;\n}\nfor (let round = 0; round < 150; round++) {\n  const n = ri(2, 6);\n  const edges = randomGraph(n, ri(0, 5), 3);\n  const trees = allSpanningTrees(n, edges);\n  const best = Math.min(...trees.map((t) => t.weight));\n  const msts = trees.filter((t) => t.weight === best);\n  const critical = [];\n  const pseudo = [];\n  for (let i = 0; i < edges.length; i++) {\n    const inCount = msts.filter((t) => t.set.includes(i)).length;\n    if (inCount === msts.length) critical.push(i);\n    else if (inCount > 0) pseudo.push(i);\n  }\n  assert.deepEqual(findCriticalAndPseudoCriticalEdges(n, edges), [critical, pseudo]);\n}"
      }
    ]
  },
  {
    "id": "ex-second-best-mst-weight",
    "chapter": "dsa-minimum-spanning-tree",
    "level": "advanced",
    "title": "Second-Best Minimum Spanning Tree",
    "brief": "<p>A weighted, undirected graph on <code>n</code> vertices is given as <code>edges[i] = [u, v, weight]</code> (no self-loops, parallel edges allowed). The <b>second-best spanning tree</b> is the cheapest spanning tree that is not the minimum spanning tree you started from. If the MST is not unique, another tree of the same weight is itself a second-best tree.</p><p>Write <code>secondBestMSTWeight(n, edges)</code> returning the weight of the second-best spanning tree, or <code>-1</code> when there is none: the graph is disconnected, or it is already a tree with no spare edge.</p>",
    "starter": "function secondBestMSTWeight(n, edges) {\n  // TODO\n}\n",
    "hints": [
      "Build an ordinary MST first and remember which edges are in it. A second-best tree never needs to differ from the MST by more than one edge.",
      "Adding a non-tree edge (u, v) to the MST closes exactly one cycle: the tree path from u to v plus that edge. To get a tree back, delete an edge on that path, and the best choice is the heaviest one.",
      "For every non-tree edge, the candidate weight is total + w(edge) - heaviestOnTreePath(u, v). Take the minimum. Walking the tree once per non-tree edge is fast enough; use an explicit stack so a long path does not overflow the call stack."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n  }\n  find(x) {\n    while (this.parent[x] !== x) {\n      this.parent[x] = this.parent[this.parent[x]];\n      x = this.parent[x];\n    }\n    return x;\n  }\n  union(a, b) {\n    const ra = this.find(a);\n    const rb = this.find(b);\n    if (ra === rb) return false;\n    this.parent[rb] = ra;\n    return true;\n  }\n}\n\nfunction secondBestMSTWeight(n, edges) {\n  const order = edges.map(([u, v, w], i) => [u, v, w, i]).sort((a, b) => a[2] - b[2]);\n  const dsu = new DSU(n);\n  const adj = Array.from({ length: n }, () => []);\n  const inTree = new Array(edges.length).fill(false);\n  let total = 0;\n  let used = 0;\n  for (const [u, v, w, i] of order) {\n    if (dsu.union(u, v)) {\n      inTree[i] = true;\n      adj[u].push([v, w]);\n      adj[v].push([u, w]);\n      total += w;\n      used++;\n    }\n  }\n  if (used !== n - 1) return -1;\n\n  function heaviestOnPath(from, to) {\n    const stack = [[from, -1, 0]];\n    while (stack.length > 0) {\n      const [node, parent, heaviest] = stack.pop();\n      if (node === to) return heaviest;\n      for (const [next, w] of adj[node]) {\n        if (next !== parent) stack.push([next, node, Math.max(heaviest, w)]);\n      }\n    }\n    return -Infinity;\n  }\n\n  let best = Infinity;\n  for (let i = 0; i < edges.length; i++) {\n    if (inTree[i]) continue;\n    const [u, v, w] = edges[i];\n    best = Math.min(best, total + w - heaviestOnPath(u, v));\n  }\n  return best === Infinity ? -1 : best;\n}\n",
    "tests": [
      {
        "name": "a small graph with a unique MST",
        "body": "assert.equal(secondBestMSTWeight(4, [[0, 1, 1], [1, 2, 2], [0, 2, 3], [2, 3, 4], [1, 3, 6]]), 8);"
      },
      {
        "name": "a triangle",
        "body": "assert.equal(secondBestMSTWeight(3, [[0, 1, 1], [1, 2, 2], [0, 2, 3]]), 4);"
      },
      {
        "name": "a tie gives a second tree of the same weight",
        "body": "assert.equal(secondBestMSTWeight(3, [[0, 1, 1], [1, 2, 1], [0, 2, 1]]), 2);"
      },
      {
        "name": "a tree has no second-best tree",
        "body": "assert.equal(secondBestMSTWeight(4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]]), -1);"
      },
      {
        "name": "a disconnected graph has none either",
        "body": "assert.equal(secondBestMSTWeight(4, [[0, 1, 1], [2, 3, 1], [0, 1, 5]]), -1);"
      },
      {
        "name": "parallel edges give a swap",
        "body": "assert.equal(secondBestMSTWeight(2, [[0, 1, 3], [0, 1, 7]]), 7);"
      },
      {
        "name": "a long path graph does not overflow the call stack",
        "body": "const n = 30000;\nconst edges = [];\nfor (let i = 0; i + 1 < n; i++) edges.push([i, i + 1, 1]);\nedges.push([0, n - 1, 5]);\nassert.equal(secondBestMSTWeight(n, edges), n - 1 - 1 + 5);"
      },
      {
        "name": "agrees with brute force over every spanning tree on random graphs",
        "body": "let seed = 7;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nfunction parentOf(parent, x) { while (parent[x] !== x) x = parent[x]; return x; }\nfunction allSpanningTrees(n, edges) {\n  const trees = [];\n  const chosen = [];\n  function go(start) {\n    if (chosen.length === n - 1) {\n      const parent = Array.from({ length: n }, (_, i) => i);\n      let ok = true;\n      for (const i of chosen) {\n        const a = parentOf(parent, edges[i][0]);\n        const b = parentOf(parent, edges[i][1]);\n        if (a === b) { ok = false; break; }\n        parent[a] = b;\n      }\n      if (ok) trees.push({ set: chosen.slice(), weight: chosen.reduce((s, i) => s + edges[i][2], 0) });\n      return;\n    }\n    for (let i = start; i < edges.length; i++) { chosen.push(i); go(i + 1); chosen.pop(); }\n  }\n  go(0);\n  return trees;\n}\nfunction randomGraph(n, extra, maxW) {\n  const edges = [];\n  for (let v = 1; v < n; v++) edges.push([ri(0, v - 1), v, ri(1, maxW)]);\n  for (let k = 0; k < extra; k++) {\n    const u = ri(0, n - 1);\n    const v = ri(0, n - 1);\n    if (u !== v) edges.push([u, v, ri(1, maxW)]);\n  }\n  return edges;\n}\nfor (let round = 0; round < 150; round++) {\n  const n = ri(2, 6);\n  const edges = randomGraph(n, ri(0, 5), 4);\n  const trees = allSpanningTrees(n, edges);\n  const weights = trees.map((t) => t.weight).sort((a, b) => a - b);\n  const expected = weights.length >= 2 ? weights[1] : -1;\n  assert.equal(secondBestMSTWeight(n, edges), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-minimum-bottleneck-path",
    "chapter": "dsa-minimum-spanning-tree",
    "level": "intermediate",
    "title": "Minimum Bottleneck Between Two Vertices",
    "brief": "<p>A weighted undirected graph on <code>n</code> vertices is given as <code>edges[i] = [u, v, weight]</code>. The <b>bottleneck</b> of a path is its heaviest edge. For each query <code>[a, b]</code>, find the smallest bottleneck over all paths from <code>a</code> to <code>b</code>.</p><p>Write <code>minimumBottleneck(n, edges, queries)</code> returning one number per query, in query order. Use <code>-1</code> when <code>a</code> and <code>b</code> are not connected, and <code>0</code> when <code>a === b</code> (the empty path has no edge).</p>",
    "starter": "function minimumBottleneck(n, edges, queries) {\n  // TODO\n}\n",
    "hints": [
      "This is not a sum of weights, so a shortest-path search is the wrong tool. Think about which structure minimises the heaviest edge on the path between every pair of vertices at once.",
      "The path between a and b inside a minimum spanning tree has the smallest possible heaviest edge among all a-b paths in the graph. So build the MST with Kruskal's algorithm.",
      "Keep the MST as an adjacency list. For each query, walk the tree from a to b with an explicit stack, carrying the heaviest edge seen so far. If b is never reached, the answer is -1."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n  }\n  find(x) {\n    while (this.parent[x] !== x) {\n      this.parent[x] = this.parent[this.parent[x]];\n      x = this.parent[x];\n    }\n    return x;\n  }\n  union(a, b) {\n    const ra = this.find(a);\n    const rb = this.find(b);\n    if (ra === rb) return false;\n    this.parent[rb] = ra;\n    return true;\n  }\n}\n\nfunction minimumBottleneck(n, edges, queries) {\n  const sorted = edges.slice().sort((a, b) => a[2] - b[2]);\n  const dsu = new DSU(n);\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v, w] of sorted) {\n    if (dsu.union(u, v)) {\n      adj[u].push([v, w]);\n      adj[v].push([u, w]);\n    }\n  }\n  return queries.map(([a, b]) => {\n    const stack = [[a, -1, 0]];\n    while (stack.length > 0) {\n      const [node, parent, heaviest] = stack.pop();\n      if (node === b) return heaviest;\n      for (const [next, w] of adj[node]) {\n        if (next !== parent) stack.push([next, node, Math.max(heaviest, w)]);\n      }\n    }\n    return -1;\n  });\n}\n",
    "tests": [
      {
        "name": "a triangle: the direct heavy edge loses to two light ones",
        "body": "assert.deepEqual(minimumBottleneck(3, [[0, 1, 4], [1, 2, 4], [0, 2, 5]], [[0, 2]]), [4]);"
      },
      {
        "name": "the bottleneck is not the sum of the path",
        "body": "assert.deepEqual(minimumBottleneck(4, [[0, 1, 2], [1, 2, 2], [2, 3, 2], [0, 3, 9]], [[0, 3]]), [2]);"
      },
      {
        "name": "a vertex to itself",
        "body": "assert.deepEqual(minimumBottleneck(2, [[0, 1, 5]], [[1, 1]]), [0]);"
      },
      {
        "name": "disconnected vertices give -1",
        "body": "assert.deepEqual(minimumBottleneck(4, [[0, 1, 3], [2, 3, 1]], [[0, 3], [0, 1], [2, 3]]), [-1, 3, 1]);"
      },
      {
        "name": "answers follow the query order",
        "body": "assert.deepEqual(minimumBottleneck(4, [[0, 1, 1], [1, 2, 7], [2, 3, 3]], [[2, 3], [0, 3], [0, 1]]), [3, 7, 1]);"
      },
      {
        "name": "the order of the edges does not matter",
        "body": "assert.deepEqual(minimumBottleneck(3, [[1, 2, 8], [0, 1, 3], [0, 2, 6]], [[1, 2], [0, 2]]), [6, 6]);"
      },
      {
        "name": "agrees with a brute-force connectivity check on random graphs",
        "body": "let seed = 7;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nfunction brute(n, edges, a, b) {\n  if (a === b) return 0;\n  const weights = [...new Set(edges.map((e) => e[2]))].sort((x, y) => x - y);\n  for (const limit of weights) {\n    const seen = new Set([a]);\n    const stack = [a];\n    while (stack.length) {\n      const node = stack.pop();\n      for (const [u, v, w] of edges) {\n        if (w > limit) continue;\n        const next = u === node ? v : v === node ? u : -1;\n        if (next !== -1 && !seen.has(next)) { seen.add(next); stack.push(next); }\n      }\n    }\n    if (seen.has(b)) return limit;\n  }\n  return -1;\n}\nfor (let round = 0; round < 200; round++) {\n  const n = ri(1, 7);\n  const edges = [];\n  for (let k = ri(0, 9); k > 0; k--) {\n    const u = ri(0, n - 1);\n    const v = ri(0, n - 1);\n    if (u !== v) edges.push([u, v, ri(1, 6)]);\n  }\n  const queries = [];\n  for (let k = 0; k < 6; k++) queries.push([ri(0, n - 1), ri(0, n - 1)]);\n  assert.deepEqual(minimumBottleneck(n, edges, queries), queries.map(([a, b]) => brute(n, edges, a, b)));\n}"
      }
    ]
  },
  {
    "id": "ex-maximum-spanning-tree-weight",
    "chapter": "dsa-minimum-spanning-tree",
    "level": "intermediate",
    "title": "Highest-Capacity Network",
    "brief": "<p>A company can lay cables between sites. <code>links[i] = [a, b, capacity]</code> is a possible cable between sites <code>a</code> and <code>b</code> (numbered <code>0</code> to <code>n - 1</code>). It will lay exactly enough cables to connect every site with no cycles, and wants the <b>largest</b> possible total capacity.</p><p>Write <code>maxSpanningTreeWeight(n, links)</code> returning that total, or <code>-1</code> if the sites cannot all be connected. Capacities are zero or positive, so a real total is never <code>-1</code>. One site needs no cable, so the answer for <code>n = 1</code> is <code>0</code>.</p>",
    "starter": "function maxSpanningTreeWeight(n, links) {\n  // TODO\n}\n",
    "hints": [
      "Every spanning tree has exactly n - 1 edges. What happens to the ranking of trees if you multiply every weight by -1?",
      "The tree with the smallest total of negated weights is the tree with the largest total of the original weights. Kruskal's algorithm only compares weights, so negative weights are fine for it.",
      "Equivalently, sort the links by capacity from largest to smallest and add each one with union-find unless it would close a cycle. If fewer than n - 1 links get added, return -1."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n  }\n  find(x) {\n    while (this.parent[x] !== x) {\n      this.parent[x] = this.parent[this.parent[x]];\n      x = this.parent[x];\n    }\n    return x;\n  }\n  union(a, b) {\n    const ra = this.find(a);\n    const rb = this.find(b);\n    if (ra === rb) return false;\n    this.parent[rb] = ra;\n    return true;\n  }\n}\n\nfunction maxSpanningTreeWeight(n, links) {\n  const sorted = links.slice().sort((x, y) => y[2] - x[2]);\n  const dsu = new DSU(n);\n  let total = 0;\n  let used = 0;\n  for (const [a, b, capacity] of sorted) {\n    if (dsu.union(a, b)) {\n      total += capacity;\n      used++;\n    }\n  }\n  return used === n - 1 ? total : -1;\n}\n",
    "tests": [
      {
        "name": "a triangle keeps the two largest",
        "body": "assert.equal(maxSpanningTreeWeight(3, [[0, 1, 4], [1, 2, 4], [0, 2, 5]]), 9);"
      },
      {
        "name": "a single site needs no cable",
        "body": "assert.equal(maxSpanningTreeWeight(1, []), 0);\nassert.equal(maxSpanningTreeWeight(1, [[0, 0, 5]]), 0);"
      },
      {
        "name": "disconnected sites give -1",
        "body": "assert.equal(maxSpanningTreeWeight(4, [[0, 1, 3], [2, 3, 3]]), -1);"
      },
      {
        "name": "zero capacities still need a tree",
        "body": "assert.equal(maxSpanningTreeWeight(3, [[0, 1, 0], [1, 2, 0], [0, 2, 0]]), 0);\nassert.equal(maxSpanningTreeWeight(3, [[0, 1, 0], [1, 2, 4]]), 4);"
      },
      {
        "name": "parallel links: the biggest one wins",
        "body": "assert.equal(maxSpanningTreeWeight(2, [[0, 1, 2], [0, 1, 9], [1, 0, 5]]), 9);"
      },
      {
        "name": "a path graph uses every link",
        "body": "assert.equal(maxSpanningTreeWeight(4, [[0, 1, 1], [1, 2, 2], [2, 3, 3]]), 6);"
      },
      {
        "name": "does not reorder the links it is given",
        "body": "const links = [[0, 1, 1], [1, 2, 9], [0, 2, 5]];\nmaxSpanningTreeWeight(3, links);\nassert.deepEqual(links, [[0, 1, 1], [1, 2, 9], [0, 2, 5]]);"
      },
      {
        "name": "agrees with brute force over every spanning tree on random graphs",
        "body": "let seed = 7;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nfunction parentOf(parent, x) { while (parent[x] !== x) x = parent[x]; return x; }\nfunction allSpanningTrees(n, edges) {\n  const trees = [];\n  const chosen = [];\n  function go(start) {\n    if (chosen.length === n - 1) {\n      const parent = Array.from({ length: n }, (_, i) => i);\n      let ok = true;\n      for (const i of chosen) {\n        const a = parentOf(parent, edges[i][0]);\n        const b = parentOf(parent, edges[i][1]);\n        if (a === b) { ok = false; break; }\n        parent[a] = b;\n      }\n      if (ok) trees.push({ set: chosen.slice(), weight: chosen.reduce((s, i) => s + edges[i][2], 0) });\n      return;\n    }\n    for (let i = start; i < edges.length; i++) { chosen.push(i); go(i + 1); chosen.pop(); }\n  }\n  go(0);\n  return trees;\n}\nfunction randomGraph(n, extra, maxW) {\n  const edges = [];\n  for (let v = 1; v < n; v++) edges.push([ri(0, v - 1), v, ri(1, maxW)]);\n  for (let k = 0; k < extra; k++) {\n    const u = ri(0, n - 1);\n    const v = ri(0, n - 1);\n    if (u !== v) edges.push([u, v, ri(1, maxW)]);\n  }\n  return edges;\n}\nfor (let round = 0; round < 150; round++) {\n  const n = ri(1, 6);\n  const edges = n === 1 ? [] : randomGraph(n, ri(0, 5), 9);\n  const trees = n === 1 ? [{ weight: 0 }] : allSpanningTrees(n, edges);\n  const expected = Math.max(...trees.map((t) => t.weight));\n  assert.equal(maxSpanningTreeWeight(n, edges), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-widest-path-capacity",
    "chapter": "dsa-minimum-spanning-tree",
    "level": "intermediate",
    "title": "Widest Path Between Two Sites",
    "brief": "<p>A road network has <code>roads[i] = [a, b, limit]</code>: a two-way road between <code>a</code> and <code>b</code> that can carry a truck of weight at most <code>limit</code>. A truck's route is only as strong as its <b>weakest</b> road.</p><p>Write <code>heaviestTruck(n, roads, from, to)</code> returning the greatest weight of a truck that can drive from <code>from</code> to <code>to</code>. Return <code>-1</code> if there is no route, and <code>Infinity</code> if <code>from === to</code> (no road is needed).</p>",
    "starter": "function heaviestTruck(n, roads, from, to) {\n  // TODO\n}\n",
    "hints": [
      "This is a bottleneck problem like the minimum one, but flipped: you want the path whose weakest road is as strong as possible.",
      "Sort the roads from strongest to weakest and add them to a union-find one by one. The moment `from` and `to` end up in the same component, the road you just added is the weakest on the best route.",
      "Check connectivity after every added road, return that road's limit at once, and return -1 if all roads are used and the two sites are still apart."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n  }\n  find(x) {\n    while (this.parent[x] !== x) {\n      this.parent[x] = this.parent[this.parent[x]];\n      x = this.parent[x];\n    }\n    return x;\n  }\n  union(a, b) {\n    const ra = this.find(a);\n    const rb = this.find(b);\n    if (ra === rb) return false;\n    this.parent[rb] = ra;\n    return true;\n  }\n}\n\nfunction heaviestTruck(n, roads, from, to) {\n  if (from === to) return Infinity;\n  const sorted = roads.slice().sort((x, y) => y[2] - x[2]);\n  const dsu = new DSU(n);\n  for (const [a, b, limit] of sorted) {\n    dsu.union(a, b);\n    if (dsu.find(from) === dsu.find(to)) return limit;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "the stronger two-road route beats the weak direct road",
        "body": "assert.equal(heaviestTruck(3, [[0, 1, 8], [1, 2, 6], [0, 2, 3]], 0, 2), 6);"
      },
      {
        "name": "a single road",
        "body": "assert.equal(heaviestTruck(2, [[0, 1, 7]], 0, 1), 7);\nassert.equal(heaviestTruck(2, [[0, 1, 7]], 1, 0), 7);"
      },
      {
        "name": "no route",
        "body": "assert.equal(heaviestTruck(4, [[0, 1, 7], [2, 3, 9]], 0, 3), -1);"
      },
      {
        "name": "the same site needs no road",
        "body": "assert.equal(heaviestTruck(3, [], 2, 2), Infinity);"
      },
      {
        "name": "parallel roads: the strongest counts",
        "body": "assert.equal(heaviestTruck(2, [[0, 1, 3], [0, 1, 11], [1, 0, 5]], 0, 1), 11);"
      },
      {
        "name": "a long way round through strong roads wins",
        "body": "assert.equal(heaviestTruck(5, [[0, 4, 2], [0, 1, 9], [1, 2, 9], [2, 3, 9], [3, 4, 9]], 0, 4), 9);"
      },
      {
        "name": "does not reorder the roads",
        "body": "const roads = [[0, 1, 1], [1, 2, 9], [0, 2, 5]];\nheaviestTruck(3, roads, 0, 2);\nassert.deepEqual(roads, [[0, 1, 1], [1, 2, 9], [0, 2, 5]]);"
      },
      {
        "name": "a long chain stays fast",
        "body": "const n = 50000;\nconst roads = [];\nfor (let i = 0; i + 1 < n; i++) roads.push([i, i + 1, 100 + (i % 7)]);\nassert.equal(heaviestTruck(n, roads, 0, n - 1), 100);"
      }
    ]
  }
];
