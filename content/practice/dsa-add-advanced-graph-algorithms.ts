import type { Exercise } from "../types";

export const dsaAddAdvancedGraphAlgorithms: Exercise[] = [
  {
    "id": "ex-path-with-maximum-probability",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "intermediate",
    "title": "Path With Maximum Probability",
    "brief": "<p>You are given an undirected graph of <code>n</code> nodes. <code>edges[i] = [a, b]</code> is an edge that you cross successfully with probability <code>succProb[i]</code>. Return the largest probability of getting from <code>start</code> to <code>end</code>, where the probability of a path is the product of its edge probabilities, or <code>0</code> if there is no path.</p><ul><li>A <code>MinHeap</code> class is provided: <code>push([priority, ...payload])</code> and <code>pop()</code> return the entry with the smallest first element</li><li>Probabilities are between 0 and 1</li><li>The answer is compared with a tolerance of 1e-9</li><li><code>start</code> and <code>end</code> are different nodes</li></ul>",
    "starter": "class MinHeap {\n  constructor() {\n    this.a = [];\n  }\n  get size() {\n    return this.a.length;\n  }\n  push(item) {\n    const a = this.a;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      [a[p], a[i]] = [a[i], a[p]];\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        [a[m], a[i]] = [a[i], a[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction maxProbability(n, edges, succProb, start, end) {\n  // TODO: Dijkstra where the cost is a product and the heap must pop the LARGEST probability\n}\n",
    "hints": [
      "A factor of at most 1 can only lower a probability, exactly as a non-negative weight can only raise a distance. So Dijkstra's finalize-on-pop argument still holds, with multiplication and 'larger is better'.",
      "The heap pops the smallest key. Push the negated probability, and keep best[v] = the highest probability found so far (0 means not reached).",
      "Skip a popped entry when its probability is lower than best[u] (stale). You may return the first time the target is popped."
    ],
    "solution": "class MinHeap {\n  constructor() {\n    this.a = [];\n  }\n  get size() {\n    return this.a.length;\n  }\n  push(item) {\n    const a = this.a;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      [a[p], a[i]] = [a[i], a[p]];\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        [a[m], a[i]] = [a[i], a[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction maxProbability(n, edges, succProb, start, end) {\n  const adj = Array.from({ length: n }, () => []);\n  edges.forEach(([a, b], i) => {\n    adj[a].push([b, succProb[i]]);\n    adj[b].push([a, succProb[i]]);\n  });\n  const best = new Array(n).fill(0);\n  best[start] = 1;\n  const pq = new MinHeap();\n  pq.push([-1, start]);\n  while (pq.size > 0) {\n    const [negP, u] = pq.pop();\n    const p = -negP;\n    if (p < best[u]) continue;\n    if (u === end) return p;\n    for (const [v, chance] of adj[u]) {\n      const np = p * chance;\n      if (np > best[v]) {\n        best[v] = np;\n        pq.push([-np, v]);\n      }\n    }\n  }\n  return 0;\n}\n",
    "tests": [
      {
        "name": "two edges beat the direct edge",
        "body": "assert.ok(Math.abs(maxProbability(3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.2], 0, 2) - 0.25) < 1e-9);"
      },
      {
        "name": "the direct edge is better",
        "body": "assert.ok(Math.abs(maxProbability(3, [[0, 1], [1, 2], [0, 2]], [0.5, 0.5, 0.3], 0, 2) - 0.3) < 1e-9);"
      },
      {
        "name": "no path gives 0",
        "body": "assert.ok(Math.abs(maxProbability(3, [[0, 1]], [0.5], 0, 2) - 0) < 1e-9);"
      },
      {
        "name": "a certain edge",
        "body": "assert.ok(Math.abs(maxProbability(2, [[0, 1]], [1], 0, 1) - 1) < 1e-9);"
      },
      {
        "name": "an impossible edge",
        "body": "assert.ok(Math.abs(maxProbability(2, [[0, 1]], [0], 0, 1) - 0) < 1e-9);"
      },
      {
        "name": "the edge is undirected",
        "body": "assert.ok(Math.abs(maxProbability(2, [[1, 0]], [0.4], 0, 1) - 0.4) < 1e-9);"
      },
      {
        "name": "a longer path of near-certain edges beats a short unlikely one",
        "body": "assert.ok(Math.abs(maxProbability(4, [[0, 1], [1, 2], [2, 3], [0, 3]], [0.9, 0.9, 0.9, 0.5], 0, 3) - 0.729) < 1e-9);"
      },
      {
        "name": "matches repeated relaxation on a random graph 1",
        "body": "assert.ok(Math.abs(maxProbability(7, [[0, 2], [0, 3], [2, 3], [1, 0], [3, 1], [0, 4], [2, 3], [2, 5], [4, 0]], [0.5, 0.7, 0.2, 0.8, 0.6, 0.8, 0.7, 1, 0.1], 0, 6) - 0) < 1e-9);"
      },
      {
        "name": "matches repeated relaxation on a random graph 2",
        "body": "assert.ok(Math.abs(maxProbability(6, [[0, 3], [4, 5], [3, 5]], [0.8, 0.5, 0.2], 0, 5) - 0.16000000000000003) < 1e-9);"
      },
      {
        "name": "matches repeated relaxation on a random graph 3",
        "body": "assert.ok(Math.abs(maxProbability(5, [[1, 0], [0, 4], [2, 1], [1, 0], [2, 3], [0, 3], [3, 0]], [0.6, 0.9, 0.2, 0.6, 0.3, 0.4, 0.1], 0, 4) - 0.9) < 1e-9);"
      }
    ]
  },
  {
    "id": "ex-number-of-ways-to-arrive",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "advanced",
    "title": "Number of Ways to Arrive at Destination",
    "brief": "<p>A city has <code>n</code> intersections numbered <code>0</code> to <code>n - 1</code> joined by bidirectional roads <code>roads[i] = [u, v, time]</code>. Return the number of different ways to travel from intersection <code>0</code> to intersection <code>n - 1</code> in the <b>shortest possible time</b>, modulo <code>1000000007</code>.</p><ul><li>A <code>MinHeap</code> class is provided: <code>push([priority, ...payload])</code> and <code>pop()</code> return the entry with the smallest first element</li><li>Every <code>time</code> is a positive integer</li><li>If node <code>n - 1</code> cannot be reached, return <code>0</code>; if <code>n = 1</code>, there is one way (stay put)</li><li>Count paths, not distinct sets of roads</li></ul>",
    "starter": "class MinHeap {\n  constructor() {\n    this.a = [];\n  }\n  get size() {\n    return this.a.length;\n  }\n  push(item) {\n    const a = this.a;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      [a[p], a[i]] = [a[i], a[p]];\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        [a[m], a[i]] = [a[i], a[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction countPaths(n, roads) {\n  // TODO: Dijkstra that also carries ways[v], the number of shortest paths to v\n}\n",
    "hints": [
      "Run Dijkstra from 0 and keep a second array ways[v] = number of shortest paths from 0 to v, with ways[0] = 1.",
      "When you find a strictly shorter route to v, the old paths no longer count: ways[v] = ways[u]. When the new route TIES the best distance, every shortest path to u extends to v: ways[v] += ways[u] (mod 1e9+7).",
      "ways[u] is final when u is popped because every shortest path to u comes through a strictly closer node (weights are positive). Keep the stale-entry skip so each node is expanded once."
    ],
    "solution": "class MinHeap {\n  constructor() {\n    this.a = [];\n  }\n  get size() {\n    return this.a.length;\n  }\n  push(item) {\n    const a = this.a;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      [a[p], a[i]] = [a[i], a[p]];\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        [a[m], a[i]] = [a[i], a[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction countPaths(n, roads) {\n  const MOD = 1000000007;\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v, w] of roads) {\n    adj[u].push([v, w]);\n    adj[v].push([u, w]);\n  }\n  const dist = new Array(n).fill(Infinity);\n  const ways = new Array(n).fill(0);\n  dist[0] = 0;\n  ways[0] = 1;\n  const pq = new MinHeap();\n  pq.push([0, 0]);\n  while (pq.size > 0) {\n    const [d, u] = pq.pop();\n    if (d > dist[u]) continue;\n    for (const [v, w] of adj[u]) {\n      const nd = d + w;\n      if (nd < dist[v]) {\n        dist[v] = nd;\n        ways[v] = ways[u];\n        pq.push([nd, v]);\n      } else if (nd === dist[v]) {\n        ways[v] = (ways[v] + ways[u]) % MOD;\n      }\n    }\n  }\n  return ways[n - 1];\n}\n",
    "tests": [
      {
        "name": "the seven-node example",
        "body": "assert.equal(countPaths(7, [[0, 6, 7], [0, 1, 2], [1, 2, 3], [1, 3, 3], [6, 3, 3], [3, 5, 1], [6, 5, 1], [2, 5, 1], [0, 4, 5], [4, 6, 2]]), 4);"
      },
      {
        "name": "a single road",
        "body": "assert.equal(countPaths(2, [[0, 1, 10]]), 1);"
      },
      {
        "name": "a single intersection",
        "body": "assert.equal(countPaths(1, []), 1);"
      },
      {
        "name": "a disconnected destination",
        "body": "assert.equal(countPaths(3, [[0, 1, 1]]), 0);"
      },
      {
        "name": "two equal routes",
        "body": "assert.equal(countPaths(4, [[0, 1, 1], [1, 3, 1], [0, 2, 1], [2, 3, 1]]), 2);"
      },
      {
        "name": "a slower route is not counted",
        "body": "assert.equal(countPaths(3, [[0, 2, 5], [0, 1, 2], [1, 2, 2]]), 1);"
      },
      {
        "name": "parallel roads count as different ways",
        "body": "assert.equal(countPaths(2, [[0, 1, 3], [0, 1, 3], [0, 1, 4]]), 2);"
      },
      {
        "name": "matches counting every path on a random graph 1",
        "body": "assert.equal(countPaths(4, [[2, 1, 3], [3, 0, 3], [2, 1, 1], [1, 2, 2], [1, 2, 2], [0, 1, 3], [0, 1, 1], [1, 3, 1]]), 1);"
      },
      {
        "name": "matches counting every path on a random graph 2",
        "body": "assert.equal(countPaths(6, [[1, 0, 4], [2, 4, 1], [5, 2, 3], [3, 5, 4], [4, 0, 4], [5, 3, 1], [1, 3, 2]]), 1);"
      },
      {
        "name": "matches counting every path on a random graph 3",
        "body": "assert.equal(countPaths(5, [[4, 0, 1], [4, 1, 3], [4, 2, 3], [2, 4, 4], [3, 2, 4], [0, 3, 3]]), 1);"
      },
      {
        "name": "a ladder of 40 rungs has 2^40 ways, taken modulo 1e9+7",
        "body": "const n = 1 + 3 * 40;\nconst roads = [];\nfor (let i = 0; i < 40; i++) {\n  const a = i === 0 ? 0 : 1 + 3 * (i - 1) + 2;\n  const x = 1 + 3 * i;\n  const y = 2 + 3 * i;\n  const z = 3 + 3 * i;\n  roads.push([a, x, 1], [a, y, 1], [x, z, 1], [y, z, 1]);\n}\nlet want = 1;\nfor (let i = 0; i < 40; i++) want = (want * 2) % 1000000007;\nassert.equal(countPaths(n, roads), want);"
      }
    ]
  },
  {
    "id": "ex-second-shortest-path",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "advanced",
    "title": "Second Shortest Path Length",
    "brief": "<p>An undirected weighted graph has <code>n</code> nodes and <code>edges[i] = [u, v, w]</code> with positive integer weights. Return the length of the <b>second shortest walk</b> from <code>src</code> to <code>dst</code>: the smallest length that is <b>strictly greater</b> than the shortest length. A walk may revisit nodes and reuse edges. Return <code>-1</code> if <code>dst</code> cannot be reached.</p><ul><li>A <code>MinHeap</code> class is provided: <code>push([priority, ...payload])</code> and <code>pop()</code> return the entry with the smallest first element</li><li><code>src</code> and <code>dst</code> are different nodes</li><li>Two walks of equal length count once</li><li>Keep two distances per node</li></ul>",
    "starter": "class MinHeap {\n  constructor() {\n    this.a = [];\n  }\n  get size() {\n    return this.a.length;\n  }\n  push(item) {\n    const a = this.a;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      [a[p], a[i]] = [a[i], a[p]];\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        [a[m], a[i]] = [a[i], a[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction secondShortestPath(n, edges, src, dst) {\n  // TODO: Dijkstra with d1[v] (shortest) and d2[v] (shortest strictly longer than d1[v])\n}\n",
    "hints": [
      "Keep two arrays: d1[v], the shortest distance to v, and d2[v], the shortest distance to v that is strictly larger than d1[v].",
      "For a candidate nd = d + w to v: if nd < d1[v], the old d1[v] becomes d2[v] and nd becomes d1[v]; else if d1[v] < nd < d2[v], it replaces d2[v]. Push to the heap whenever a value changes.",
      "A node can now be expanded twice, once per value it keeps, so skip a popped entry only when d > d2[u]. The answer is d2[dst], or -1 if it is Infinity."
    ],
    "solution": "class MinHeap {\n  constructor() {\n    this.a = [];\n  }\n  get size() {\n    return this.a.length;\n  }\n  push(item) {\n    const a = this.a;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      [a[p], a[i]] = [a[i], a[p]];\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        [a[m], a[i]] = [a[i], a[m]];\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction secondShortestPath(n, edges, src, dst) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v, w] of edges) {\n    adj[u].push([v, w]);\n    adj[v].push([u, w]);\n  }\n  const d1 = new Array(n).fill(Infinity);\n  const d2 = new Array(n).fill(Infinity);\n  d1[src] = 0;\n  const pq = new MinHeap();\n  pq.push([0, src]);\n  while (pq.size > 0) {\n    const [d, u] = pq.pop();\n    if (d > d2[u]) continue;\n    for (const [v, w] of adj[u]) {\n      const nd = d + w;\n      if (nd < d1[v]) {\n        d2[v] = d1[v];\n        d1[v] = nd;\n        pq.push([nd, v]);\n      } else if (nd > d1[v] && nd < d2[v]) {\n        d2[v] = nd;\n        pq.push([nd, v]);\n      }\n    }\n  }\n  return d2[dst] === Infinity ? -1 : d2[dst];\n}\n",
    "tests": [
      {
        "name": "a triangle where the direct edge is the second best",
        "body": "assert.equal(secondShortestPath(3, [[0, 1, 1], [1, 2, 1], [0, 2, 3]], 0, 2), 3);"
      },
      {
        "name": "a single edge can be walked three times",
        "body": "assert.equal(secondShortestPath(2, [[0, 1, 4]], 0, 1), 12);"
      },
      {
        "name": "an unreachable target",
        "body": "assert.equal(secondShortestPath(3, [[0, 1, 1]], 0, 2), -1);"
      },
      {
        "name": "two routes of equal length count once",
        "body": "assert.equal(secondShortestPath(4, [[0, 1, 1], [1, 3, 1], [0, 2, 1], [2, 3, 1]], 0, 3), 4);"
      },
      {
        "name": "a heavy edge near the start",
        "body": "assert.equal(secondShortestPath(3, [[0, 1, 1], [1, 2, 10]], 0, 2), 13);"
      },
      {
        "name": "a cheap edge near the end lets the walk bounce",
        "body": "assert.equal(secondShortestPath(3, [[0, 1, 10], [1, 2, 1]], 0, 2), 13);"
      },
      {
        "name": "a detour of the same total as the second walk",
        "body": "assert.equal(secondShortestPath(4, [[0, 1, 2], [1, 3, 2], [0, 2, 1], [2, 3, 4]], 0, 3), 5);"
      },
      {
        "name": "matches a bounded walk search on a random graph 1",
        "body": "assert.equal(secondShortestPath(6, [[2, 4, 5], [4, 1, 4], [0, 5, 1], [5, 2, 4], [1, 4, 1], [0, 2, 3], [5, 4, 5]], 0, 5), 3);"
      },
      {
        "name": "matches a bounded walk search on a random graph 2",
        "body": "assert.equal(secondShortestPath(5, [[2, 3, 5], [3, 4, 2]], 0, 4), -1);"
      },
      {
        "name": "matches a bounded walk search on a random graph 3",
        "body": "assert.equal(secondShortestPath(3, [[0, 2, 5], [2, 1, 2], [0, 1, 3], [2, 0, 3]], 0, 2), 5);"
      },
      {
        "name": "matches a bounded walk search on a random graph 4",
        "body": "assert.equal(secondShortestPath(6, [[2, 4, 2], [3, 4, 4], [4, 3, 1], [4, 1, 1]], 0, 5), -1);"
      }
    ]
  },
  {
    "id": "ex-longest-path-in-dag",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "intermediate",
    "title": "Longest Path From a Source in a DAG",
    "brief": "<p>A directed graph has <code>n</code> nodes and <code>edges[i] = [u, v, w]</code> (an edge from <code>u</code> to <code>v</code> of weight <code>w</code>; weights may be <b>negative</b>). Return an array whose entry <code>v</code> is the <b>largest</b> total weight of a path from <code>src</code> to <code>v</code>, with <code>-Infinity</code> for nodes that <code>src</code> cannot reach (and <code>0</code> for <code>src</code> itself). If the graph contains a cycle, return <code>null</code>.</p><ul><li>Process the nodes in topological order and relax each edge once: O(V + E)</li><li>Parallel edges are possible</li><li>The longest path on a general graph is a different, much harder problem; here the order does the work</li></ul>",
    "starter": "function dagLongestPaths(n, edges, src) {\n  // TODO: Kahn's algorithm for an order (null if a cycle), then relax in that order\n}\n",
    "hints": [
      "Use Kahn's algorithm (in-degree counts and a queue) to get a topological order. If fewer than n nodes come out, there is a cycle: return null.",
      "Start with longest[src] = 0 and everything else -Infinity. Walk the nodes in topological order; for each outgoing edge from a node whose value is not -Infinity, take the larger of the current value and longest[u] + w.",
      "When you reach a node, every edge into it has already been relaxed, so its value is final. Do not relax out of -Infinity nodes (unreachable from src)."
    ],
    "solution": "function dagLongestPaths(n, edges, src) {\n  const adj = Array.from({ length: n }, () => []);\n  const indegree = new Array(n).fill(0);\n  for (const [u, v, w] of edges) {\n    adj[u].push([v, w]);\n    indegree[v]++;\n  }\n  const order = [];\n  for (let i = 0; i < n; i++) if (indegree[i] === 0) order.push(i);\n  for (let head = 0; head < order.length; head++) {\n    for (const [v] of adj[order[head]]) {\n      indegree[v]--;\n      if (indegree[v] === 0) order.push(v);\n    }\n  }\n  if (order.length < n) return null;\n  const longest = new Array(n).fill(-Infinity);\n  longest[src] = 0;\n  for (const u of order) {\n    if (longest[u] === -Infinity) continue;\n    for (const [v, w] of adj[u]) {\n      if (longest[u] + w > longest[v]) longest[v] = longest[u] + w;\n    }\n  }\n  return longest;\n}\n",
    "tests": [
      {
        "name": "the six-node example with negative edges",
        "body": "assert.deepEqual(dagLongestPaths(6, [[0, 1, 2], [0, 2, -1], [1, 3, 3], [2, 3, 4], [2, 4, 1], [3, 5, -2], [4, 5, 6]], 0), [0, 2, -1, 5, 0, 6]);"
      },
      {
        "name": "a single node",
        "body": "assert.deepEqual(dagLongestPaths(1, [], 0), [0]);"
      },
      {
        "name": "a cycle is reported",
        "body": "assert.deepEqual(dagLongestPaths(3, [[0, 1, 1], [1, 2, 1], [2, 0, 1]], 0), null);"
      },
      {
        "name": "nodes the source cannot reach stay at -Infinity",
        "body": "assert.deepEqual(dagLongestPaths(4, [[0, 1, 5], [2, 3, 1]], 0), [0, 5, -Infinity, -Infinity]);"
      },
      {
        "name": "a source in the middle ignores nodes before it",
        "body": "assert.deepEqual(dagLongestPaths(4, [[0, 1, 5], [1, 2, 1], [2, 3, 1]], 1), [-Infinity, 0, 1, 2]);"
      },
      {
        "name": "parallel edges keep the best",
        "body": "assert.deepEqual(dagLongestPaths(2, [[0, 1, 3], [0, 1, 7], [0, 1, -2]], 0), [0, 7]);"
      },
      {
        "name": "only negative edges give negative totals for reachable nodes",
        "body": "assert.deepEqual(dagLongestPaths(3, [[0, 1, -4], [1, 2, -4]], 0), [0, -4, -8]);"
      },
      {
        "name": "matches enumerating every path on a random DAG 1",
        "body": "assert.deepEqual(dagLongestPaths(4, [[0, 1, 5], [0, 3, 3], [1, 3, 6], [1, 2, 4]], 0), [0, 5, 9, 11]);"
      },
      {
        "name": "matches enumerating every path on a random DAG 2",
        "body": "assert.deepEqual(dagLongestPaths(5, [[0, 1, -3], [0, 2, -4], [0, 3, -3], [1, 3, 3], [2, 3, 1], [3, 4, -3]], 0), [0, -3, -4, 0, -3]);"
      },
      {
        "name": "matches enumerating every path on a random DAG 3",
        "body": "assert.deepEqual(dagLongestPaths(7, [[3, 4, 1], [3, 1, 6], [3, 0, -1], [2, 5, 7], [6, 5, 7], [6, 1, 0], [4, 1, 9]], 3), [-1, 10, -Infinity, 0, 1, -Infinity, -Infinity]);"
      }
    ]
  },
  {
    "id": "ex-shortest-path-obstacle-elimination",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "advanced",
    "title": "Shortest Path With Obstacles Elimination",
    "brief": "<p>A grid has open cells (<code>0</code>) and obstacles (<code>1</code>). You start at the top-left cell and want to reach the bottom-right cell, moving up, down, left or right one step at a time. You may walk through at most <code>k</code> obstacles (each obstacle cell you step onto uses one removal). Return the minimum number of steps, or <code>-1</code> if it is impossible.</p><ul><li>The start cell is open in the tests</li><li>A 1 x 1 grid needs <code>0</code> steps</li><li>The state is not just the cell: how many removals you have used matters</li><li>Up to a 40 x 40 grid and <code>k</code> up to 1600 should still be fast</li></ul>",
    "starter": "function shortestPathK(grid, k) {\n  // TODO: BFS over states (row, col, removals used)\n}\n",
    "hints": [
      "The shortest path to a cell may use too many removals, while a longer path to the same cell keeps removals in hand. So a cell alone is not a state: use (row, col, removals used).",
      "Every move costs one step, so a plain BFS over these states finds the fewest steps. Mark states visited when you push them.",
      "Stepping onto an obstacle adds 1 to the removals used; skip the move if that would exceed k. Return the number of steps the first time you pop the bottom-right cell (any removal count). A shortcut: if k >= rows + cols - 2, the answer is rows + cols - 2."
    ],
    "solution": "function shortestPathK(grid, k) {\n  const R = grid.length;\n  const C = grid[0].length;\n  if (R === 1 && C === 1) return 0;\n  if (k >= R + C - 2) return R + C - 2;\n  const seen = Array.from({ length: R }, () => Array.from({ length: C }, () => new Uint8Array(k + 1)));\n  seen[0][0][0] = 1;\n  let frontier = [[0, 0, 0]];\n  for (let steps = 1; frontier.length > 0; steps++) {\n    const next = [];\n    for (const [r, c, used] of frontier) {\n      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n        const nr = r + dr;\n        const nc = c + dc;\n        if (nr < 0 || nr >= R || nc < 0 || nc >= C) continue;\n        const nu = used + grid[nr][nc];\n        if (nu > k || seen[nr][nc][nu]) continue;\n        if (nr === R - 1 && nc === C - 1) return steps;\n        seen[nr][nc][nu] = 1;\n        next.push([nr, nc, nu]);\n      }\n    }\n    frontier = next;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "the five-row example with one removal",
        "body": "assert.equal(shortestPathK([[0, 0, 0], [1, 1, 0], [0, 0, 0], [0, 1, 1], [0, 0, 0]], 1), 6);"
      },
      {
        "name": "a wall that cannot be passed with no removals",
        "body": "assert.equal(shortestPathK([[0, 1, 1], [1, 1, 1], [1, 0, 0]], 0), -1);"
      },
      {
        "name": "a single cell",
        "body": "assert.equal(shortestPathK([[0]], 0), 0);"
      },
      {
        "name": "a straight corridor",
        "body": "assert.equal(shortestPathK([[0, 0, 0, 0]], 0), 3);"
      },
      {
        "name": "a corridor with an obstacle needs one removal",
        "body": "assert.equal(shortestPathK([[0, 1, 0]], 1), 2);"
      },
      {
        "name": "the cheap-looking route runs out of removals",
        "body": "assert.equal(shortestPathK([[0, 1, 1, 0], [0, 0, 0, 0], [1, 1, 1, 0], [0, 0, 0, 0]], 1), 6);"
      },
      {
        "name": "a generous k takes the straight line",
        "body": "assert.equal(shortestPathK([[0, 1], [1, 0]], 5), 2);"
      },
      {
        "name": "matches repeated relaxation on a random grid 1",
        "body": "assert.equal(shortestPathK([[0, 1], [1, 0], [0, 1], [0, 0], [1, 1]], 3), 5);"
      },
      {
        "name": "matches repeated relaxation on a random grid 2",
        "body": "assert.equal(shortestPathK([[0, 0, 0, 0, 0], [0, 0, 0, 0, 0]], 1), 5);"
      },
      {
        "name": "matches repeated relaxation on a random grid 3",
        "body": "assert.equal(shortestPathK([[0, 0, 0, 1], [0, 1, 0, 0], [0, 0, 0, 1], [1, 1, 0, 0], [1, 0, 0, 0]], 1), 7);"
      },
      {
        "name": "a 40 x 40 grid with many obstacles finishes quickly",
        "body": "const n = 40;\nconst grid = Array.from({ length: n }, (_, r) => Array.from({ length: n }, (_, c) => (r % 2 === 1 && c !== (r % 4 === 1 ? n - 1 : 0) ? 1 : 0)));\nconst result = shortestPathK(grid, 20);\nassert.ok(result >= 2 * (n - 1));\nassert.ok(result < 400);"
      }
    ]
  },
  {
    "id": "ex-floyd-warshall-paths",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "advanced",
    "title": "Cheapest Route With Floyd-Warshall",
    "brief": "<p>A directed graph has <code>n</code> nodes and <code>edges[i] = [u, v, w]</code> with positive weights (parallel edges are possible; use the cheapest). Return the cheapest route from <code>from</code> to <code>to</code> as an array of nodes, starting with <code>from</code> and ending with <code>to</code>, or <code>[]</code> if there is none. If <code>from === to</code> return <code>[from]</code>.</p><ul><li>When several routes tie, any cheapest route is accepted; the tests check the route's validity and total cost</li><li>Use Floyd-Warshall with a <code>next</code> matrix (the first step of a best path from i to j), not a stored path per cell</li><li>V is at most 100</li></ul>",
    "starter": "function cheapestRoute(n, edges, from, to) {\n  // TODO: Floyd-Warshall with next[i][j]; when going through k improves d[i][j], set next[i][j] = next[i][k]\n}\n",
    "hints": [
      "Run the usual three loops with k outermost. Alongside d, keep next[i][j], the first node to step to when going from i to j on a best path.",
      "Initialise next[u][v] = v for each edge (keep the cheapest parallel edge) and next[i][i] = i. When d[i][k] + d[k][j] < d[i][j], also set next[i][j] = next[i][k].",
      "To read a route: if next[from][to] is -1 there is none; otherwise start at from and repeat i = next[i][to], pushing each node, until you reach to."
    ],
    "solution": "function cheapestRoute(n, edges, from, to) {\n  const d = Array.from({ length: n }, () => new Array(n).fill(Infinity));\n  const next = Array.from({ length: n }, () => new Array(n).fill(-1));\n  for (let i = 0; i < n; i++) {\n    d[i][i] = 0;\n    next[i][i] = i;\n  }\n  for (const [u, v, w] of edges) {\n    if (w < d[u][v]) {\n      d[u][v] = w;\n      next[u][v] = v;\n    }\n  }\n  for (let k = 0; k < n; k++) {\n    for (let i = 0; i < n; i++) {\n      if (d[i][k] === Infinity) continue;\n      for (let j = 0; j < n; j++) {\n        if (d[i][k] + d[k][j] < d[i][j]) {\n          d[i][j] = d[i][k] + d[k][j];\n          next[i][j] = next[i][k];\n        }\n      }\n    }\n  }\n  if (next[from][to] === -1) return [];\n  const path = [from];\n  let at = from;\n  while (at !== to) {\n    at = next[at][to];\n    path.push(at);\n  }\n  return path;\n}\n",
    "tests": [
      {
        "name": "a shortcut through two intermediate nodes",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(4, [[0, 1, 5], [1, 2, 3], [2, 3, 1], [0, 3, 10]], 0, 3, 9);"
      },
      {
        "name": "the direct edge is cheapest",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(3, [[0, 2, 1], [0, 1, 5], [1, 2, 5]], 0, 2, 1);"
      },
      {
        "name": "no route",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(3, [[0, 1, 1]], 0, 2, null);"
      },
      {
        "name": "edges are directed",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(3, [[0, 1, 1], [1, 2, 1]], 2, 0, null);"
      },
      {
        "name": "parallel edges use the cheapest",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(2, [[0, 1, 9], [0, 1, 2], [0, 1, 5]], 0, 1, 2);"
      },
      {
        "name": "from equals to",
        "body": "assert.deepEqual(cheapestRoute(3, [[0, 1, 1]], 1, 1), [1]);"
      },
      {
        "name": "a cycle in the graph does not confuse the route",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(4, [[0, 1, 1], [1, 2, 1], [2, 0, 1], [2, 3, 1]], 0, 3, 3);"
      },
      {
        "name": "returns a valid cheapest route on a random graph 2",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(7, [[5, 4, 9], [0, 1, 9], [2, 5, 9], [3, 1, 9], [5, 4, 9], [3, 6, 8], [1, 3, 7], [2, 0, 1]], 0, 6, 24);"
      },
      {
        "name": "returns a valid cheapest route on a random graph 3",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(6, [[3, 4, 8], [5, 2, 3], [1, 0, 2]], 0, 5, null);"
      },
      {
        "name": "returns a valid cheapest route on a random graph 4",
        "body": "function check(n, edges, from, to, cost) {\n  const path = cheapestRoute(n, edges, from, to);\n  if (cost === null) {\n    assert.deepEqual(path, []);\n    return;\n  }\n  assert.equal(path[0], from);\n  assert.equal(path[path.length - 1], to);\n  let total = 0;\n  for (let i = 0; i + 1 < path.length; i++) {\n    let w = Infinity;\n    for (const [u, v, c] of edges) if (u === path[i] && v === path[i + 1] && c < w) w = c;\n    assert.ok(w < Infinity, 'there is no edge ' + path[i] + ' -> ' + path[i + 1]);\n    total += w;\n  }\n  assert.equal(total, cost);\n}\ncheck(7, [[0, 2, 8], [4, 5, 3]], 0, 6, null);"
      }
    ]
  },
  {
    "id": "ex-spfa-negative-cycle",
    "chapter": "dsa-advanced-graph-algorithms",
    "level": "advanced",
    "title": "Detect a Negative Cycle",
    "brief": "<p>A directed graph has <code>n</code> nodes and <code>edges[i] = [u, v, w]</code>, where weights may be <b>negative</b>. Return <code>true</code> if the graph contains a cycle whose total weight is negative, <b>anywhere</b> in the graph (not only reachable from node 0), and <code>false</code> otherwise.</p><ul><li>Try SPFA: Bellman-Ford with a queue of nodes whose distance just changed, starting with every node in the queue at distance 0</li><li>Track how many edges the best path to each node uses; reaching <code>n</code> edges means a negative cycle</li><li>A zero-weight cycle is not negative; a negative edge on its own is fine</li></ul>",
    "starter": "function hasNegativeCycle(n, edges) {\n  // TODO: SPFA seeded with every node, counting edges on the best path to each node\n}\n",
    "hints": [
      "Plain Bellman-Ford needs an extra round to detect a negative cycle. In the queue version, count for each node how many edges its best path uses.",
      "A path without a cycle has at most n - 1 edges. If a node's best path ever reaches n edges, it repeats a node, and the repeated stretch keeps lowering the distance: a negative cycle.",
      "To find a cycle anywhere, start with every node at distance 0 and in the queue (as if a virtual source led to all of them). Relax out of a node when it is popped; push a changed node only if it is not already queued."
    ],
    "solution": "function hasNegativeCycle(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [u, v, w] of edges) adj[u].push([v, w]);\n  const dist = new Array(n).fill(0);\n  const edgesOnPath = new Array(n).fill(0);\n  const inQueue = new Array(n).fill(true);\n  const queue = [];\n  for (let i = 0; i < n; i++) queue.push(i);\n  let head = 0;\n  while (head < queue.length) {\n    const u = queue[head++];\n    inQueue[u] = false;\n    for (const [v, w] of adj[u]) {\n      if (dist[u] + w < dist[v]) {\n        dist[v] = dist[u] + w;\n        edgesOnPath[v] = edgesOnPath[u] + 1;\n        if (edgesOnPath[v] >= n) return true;\n        if (!inQueue[v]) {\n          inQueue[v] = true;\n          queue.push(v);\n        }\n      }\n    }\n  }\n  return false;\n}\n",
    "tests": [
      {
        "name": "a triangle with total weight -1",
        "body": "assert.equal(hasNegativeCycle(3, [[0, 1, 1], [1, 2, -3], [2, 0, 1]]), true);"
      },
      {
        "name": "a triangle with total weight 0 is not negative",
        "body": "assert.equal(hasNegativeCycle(3, [[0, 1, 1], [1, 2, -2], [2, 0, 1]]), false);"
      },
      {
        "name": "a negative edge on its own",
        "body": "assert.equal(hasNegativeCycle(2, [[0, 1, -5]]), false);"
      },
      {
        "name": "a negative self-loop",
        "body": "assert.equal(hasNegativeCycle(2, [[1, 1, -1]]), true);"
      },
      {
        "name": "a cycle far from node 0 is still found",
        "body": "assert.equal(hasNegativeCycle(5, [[0, 1, 1], [3, 4, -2], [4, 3, 1]]), true);"
      },
      {
        "name": "an empty graph",
        "body": "assert.equal(hasNegativeCycle(3, []), false);"
      },
      {
        "name": "two-node negative cycle",
        "body": "assert.equal(hasNegativeCycle(2, [[0, 1, -1], [1, 0, -1]]), true);"
      },
      {
        "name": "negative edges in a DAG",
        "body": "assert.equal(hasNegativeCycle(4, [[0, 1, -3], [1, 2, -3], [0, 2, -1], [2, 3, -9]]), false);"
      },
      {
        "name": "matches Bellman-Ford with a virtual source on a random graph 1",
        "body": "assert.equal(hasNegativeCycle(3, [[0, 0, 1], [0, 0, 0], [0, 2, 4], [0, 2, -1], [0, 1, 1]]), false);"
      },
      {
        "name": "matches Bellman-Ford with a virtual source on a random graph 2",
        "body": "assert.equal(hasNegativeCycle(5, [[3, 1, 0], [2, 1, 1], [2, 4, 3], [4, 0, 2]]), false);"
      },
      {
        "name": "matches Bellman-Ford with a virtual source on a random graph 3",
        "body": "assert.equal(hasNegativeCycle(6, [[5, 4, 5]]), false);"
      },
      {
        "name": "matches Bellman-Ford with a virtual source on a random graph 4",
        "body": "assert.equal(hasNegativeCycle(6, [[0, 0, -1], [1, 2, 1], [5, 2, 5], [1, 3, 3]]), true);"
      }
    ]
  }
];
