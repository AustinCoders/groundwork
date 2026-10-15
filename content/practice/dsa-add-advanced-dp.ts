import type { Exercise } from "../types";

export const dsaAddAdvancedDp: Exercise[] = [
  {
    "id": "ex-shortest-path-visiting-all-nodes",
    "chapter": "dsa-advanced-dp",
    "level": "advanced",
    "title": "Shortest Path Visiting All Nodes",
    "brief": "<p>You are given an undirected, connected graph of <code>n</code> nodes labelled <code>0</code> to <code>n - 1</code> as an adjacency list: <code>graph[i]</code> lists the neighbours of node <code>i</code>. Return the length (number of edges) of the shortest walk that visits every node.</p><ul><li>You may start at any node and stop at any node</li><li>You may revisit nodes and reuse edges</li><li><code>1 &lt;= n &lt;= 12</code>, so a state of (node, set of visited nodes) fits in memory</li><li>A graph with one node needs a walk of length <code>0</code></li></ul>",
    "starter": "function shortestPathLength(graph) {\n  // TODO: BFS over states (node, bitmask of visited nodes), seeded with every node\n}\n",
    "hints": [
      "Think of a state as (the node you stand on, the set of nodes you have seen). A move to a neighbour costs 1 and changes the state, so the question is a shortest path between states.",
      "Because you can revisit nodes, the states contain cycles, so a loop over masks is not a valid order. Every move costs the same, which is exactly when a plain BFS finds the shortest route.",
      "Start the BFS from every node at once, each with only its own bit set. Keep a seen[node][mask] table so each state is expanded once, and return as soon as a move produces the full mask."
    ],
    "solution": "function shortestPathLength(graph) {\n  const n = graph.length;\n  if (n === 1) return 0;\n  const FULL = (1 << n) - 1;\n  const seen = Array.from({ length: n }, () => new Uint8Array(1 << n));\n  let frontier = [];\n  for (let i = 0; i < n; i++) {\n    frontier.push([i, 1 << i]);\n    seen[i][1 << i] = 1;\n  }\n  for (let steps = 0; frontier.length > 0; steps++) {\n    const next = [];\n    for (const [node, mask] of frontier) {\n      for (const nb of graph[node]) {\n        const nextMask = mask | (1 << nb);\n        if (nextMask === FULL) return steps + 1;\n        if (seen[nb][nextMask]) continue;\n        seen[nb][nextMask] = 1;\n        next.push([nb, nextMask]);\n      }\n    }\n    frontier = next;\n  }\n  return -1;\n}\n",
    "tests": [
      {
        "name": "a star needs to pass through the centre again and again",
        "body": "assert.equal(shortestPathLength([[1, 2, 3], [0], [0], [0]]), 4);"
      },
      {
        "name": "a single node needs no moves",
        "body": "assert.equal(shortestPathLength([[]]), 0);"
      },
      {
        "name": "two nodes joined by one edge",
        "body": "assert.equal(shortestPathLength([[1], [0]]), 1);"
      },
      {
        "name": "a path is walked end to end",
        "body": "assert.equal(shortestPathLength([[1], [0, 2], [1, 3], [2]]), 3);"
      },
      {
        "name": "a triangle",
        "body": "assert.equal(shortestPathLength([[1, 2], [0, 2], [0, 1]]), 2);"
      },
      {
        "name": "a graph with a hub and a chord",
        "body": "assert.equal(shortestPathLength([[1], [0, 2, 4], [1, 3, 4], [2], [1, 2]]), 4);"
      },
      {
        "name": "a star with five leaves passes through the centre four times",
        "body": "assert.equal(shortestPathLength([[1, 2, 3, 4, 5], [0], [0], [0], [0], [0]]), 8);"
      },
      {
        "name": "a ring of twelve nodes is walked once around",
        "body": "assert.equal(shortestPathLength([[11, 1], [0, 2], [1, 3], [2, 4], [3, 5], [4, 6], [5, 7], [6, 8], [7, 9], [8, 10], [9, 11], [10, 0]]), 11);"
      },
      {
        "name": "matches an exhaustive search on a random graph 1",
        "body": "assert.equal(shortestPathLength([[1], [0, 2, 3, 4], [1], [1], [1]]), 6);"
      },
      {
        "name": "matches an exhaustive search on a random graph 2",
        "body": "assert.equal(shortestPathLength([[1, 2, 3], [0, 6], [0, 4, 6], [0], [2, 5], [4], [1, 2]]), 6);"
      },
      {
        "name": "matches an exhaustive search on a random graph 3",
        "body": "assert.equal(shortestPathLength([[1, 2, 3, 4], [0], [0, 3], [0, 2, 4], [0, 3]]), 4);"
      }
    ]
  },
  {
    "id": "ex-smallest-sufficient-team",
    "chapter": "dsa-advanced-dp",
    "level": "advanced",
    "title": "Smallest Sufficient Team",
    "brief": "<p>A project needs every skill in <code>requiredSkills</code>. You are given <code>people</code>, where <code>people[i]</code> is the list of skills person <code>i</code> has. A team is <b>sufficient</b> if every required skill is known by at least one member. Return the <b>number of people</b> in a smallest sufficient team.</p><ul><li>At most 16 required skills and 60 people</li><li>People may know skills that the project does not need; ignore those</li><li>A sufficient team always exists in the tests</li></ul>",
    "starter": "function smallestTeamSize(requiredSkills, people) {\n  // TODO: a bitmask over the SKILLS, not over the people\n}\n",
    "hints": [
      "60 people means 2^60 subsets, but at most 16 skills means only 2^16 sets of skills. Put the bitmask on the small dimension.",
      "Let best[mask] be the fewest people whose skills together are exactly the skills in mask. Each person is a 0/1 knapsack item that turns mask into mask | personMask.",
      "Loop over people in the outer loop and over masks in the inner loop. Skip a person who adds nothing to the mask; that also stops the same person being used twice."
    ],
    "solution": "function smallestTeamSize(requiredSkills, people) {\n  const bitOf = new Map(requiredSkills.map((s, i) => [s, i]));\n  const FULL = (1 << requiredSkills.length) - 1;\n  const best = new Array(FULL + 1).fill(Infinity);\n  best[0] = 0;\n  for (const skills of people) {\n    let personMask = 0;\n    for (const s of skills) if (bitOf.has(s)) personMask |= 1 << bitOf.get(s);\n    if (personMask === 0) continue;\n    for (let mask = 0; mask <= FULL; mask++) {\n      if (best[mask] === Infinity) continue;\n      const next = mask | personMask;\n      if (next === mask) continue;\n      if (best[mask] + 1 < best[next]) best[next] = best[mask] + 1;\n    }\n  }\n  return best[FULL];\n}\n",
    "tests": [
      {
        "name": "two people cover three skills",
        "body": "assert.equal(smallestTeamSize([\"java\", \"nodejs\", \"reactjs\"], [[\"java\"], [\"nodejs\"], [\"nodejs\", \"reactjs\"]]), 2);"
      },
      {
        "name": "one person who knows everything",
        "body": "assert.equal(smallestTeamSize([\"a\", \"b\"], [[\"a\"], [\"a\", \"b\"], [\"b\"]]), 1);"
      },
      {
        "name": "a single required skill",
        "body": "assert.equal(smallestTeamSize([\"x\"], [[\"y\"], [\"x\"], [\"x\", \"y\"]]), 1);"
      },
      {
        "name": "every person is needed",
        "body": "assert.equal(smallestTeamSize([\"a\", \"b\", \"c\"], [[\"a\"], [\"b\"], [\"c\"]]), 3);"
      },
      {
        "name": "skills nobody needs are ignored",
        "body": "assert.equal(smallestTeamSize([\"a\", \"b\"], [[\"a\", \"z\"], [\"b\", \"y\"], [\"z\", \"y\", \"w\"]]), 2);"
      },
      {
        "name": "a person with no useful skills never helps",
        "body": "assert.equal(smallestTeamSize([\"a\"], [[], [\"q\"], [\"a\"]]), 1);"
      },
      {
        "name": "greedy by most new skills is not optimal",
        "body": "assert.equal(smallestTeamSize([\"a\", \"b\", \"c\", \"d\", \"e\", \"f\"], [[\"a\", \"b\", \"c\", \"d\"], [\"a\", \"b\", \"e\"], [\"c\", \"d\", \"f\"], [\"e\", \"f\"]]), 2);"
      },
      {
        "name": "matches an exhaustive search on a random case 1",
        "body": "assert.equal(smallestTeamSize([\"s0\", \"s1\", \"s2\", \"s3\", \"s4\", \"s5\"], [[\"s2\"], [\"s0\"], [\"s2\", \"s4\", \"other\"], [\"s1\", \"s2\", \"s3\", \"s4\", \"s5\"], [\"s0\", \"s1\", \"s3\", \"s5\"], [\"s0\", \"s1\", \"s3\"], [\"s1\", \"s3\", \"s4\", \"s5\"]]), 2);"
      },
      {
        "name": "matches an exhaustive search on a random case 2",
        "body": "assert.equal(smallestTeamSize([\"s0\", \"s1\", \"s2\", \"s3\", \"s4\", \"s5\"], [[\"s0\", \"s3\", \"s4\", \"s5\", \"other\"], [\"s0\", \"s1\", \"s2\"], [\"other\"], [\"s2\", \"s3\", \"s5\"], [\"s0\", \"s3\", \"s5\", \"other\"], [\"s1\"]]), 2);"
      },
      {
        "name": "matches an exhaustive search on a random case 3",
        "body": "assert.equal(smallestTeamSize([\"s0\", \"s1\", \"s2\", \"s3\", \"s4\", \"s5\"], [[\"s0\", \"s2\", \"s3\", \"s5\", \"other\"], [\"s0\", \"s2\", \"s5\"], [\"s0\", \"s5\"], [\"s0\", \"s3\", \"s4\"], [\"s1\", \"s2\", \"s3\", \"s4\"], [\"s2\", \"s4\", \"s5\", \"other\"], [\"s2\", \"other\"], [\"s2\", \"s5\"]]), 2);"
      }
    ]
  },
  {
    "id": "ex-binary-tree-cameras",
    "chapter": "dsa-advanced-dp",
    "level": "advanced",
    "title": "Binary Tree Cameras",
    "brief": "<p>Cameras are installed on the nodes of a binary tree. A camera at a node monitors <b>itself, its parent and its children</b>. Return the minimum number of cameras needed to monitor every node.</p><ul><li>A <code>TreeNode</code> class and a <code>buildTree(levelOrder)</code> helper are already provided; <code>null</code> marks a missing child</li><li>Node values do not matter, only the shape</li><li>A tree with a single node needs one camera</li><li>The tree has at least one node</li></ul>",
    "starter": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\n\nfunction buildTree(values) {\n  if (!values || values.length === 0 || values[0] === null) return null;\n  const root = new TreeNode(values[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length > 0 && i < values.length) {\n    const node = queue.shift();\n    const l = values[i++];\n    if (l !== null && l !== undefined) {\n      node.left = new TreeNode(l);\n      queue.push(node.left);\n    }\n    if (i < values.length) {\n      const r = values[i++];\n      if (r !== null && r !== undefined) {\n        node.right = new TreeNode(r);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\n\nfunction minCameraCover(root) {\n  // TODO: return three numbers per subtree (camera here, covered by a child, not covered yet)\n}\n",
    "hints": [
      "A parent needs to know only whether the subtree's root is looked after. That gives three states per node: it has a camera, it is covered by a child, or it is not covered and is waiting for its parent.",
      "cam = 1 + min(all states of the left) + min(all states of the right). cov = one child has a camera and the other is cam or cov. need = both children are cov. A missing child is (cam: Infinity, cov: 0, need: Infinity).",
      "The root has no parent to rescue it, so the answer is min(cam, cov), never need. Test a single node: the answer must be 1."
    ],
    "solution": "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\n\nfunction buildTree(values) {\n  if (!values || values.length === 0 || values[0] === null) return null;\n  const root = new TreeNode(values[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length > 0 && i < values.length) {\n    const node = queue.shift();\n    const l = values[i++];\n    if (l !== null && l !== undefined) {\n      node.left = new TreeNode(l);\n      queue.push(node.left);\n    }\n    if (i < values.length) {\n      const r = values[i++];\n      if (r !== null && r !== undefined) {\n        node.right = new TreeNode(r);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\n\nfunction minCameraCover(root) {\n  function dfs(node) {\n    if (!node) return { cam: Infinity, cov: 0, need: Infinity };\n    const L = dfs(node.left);\n    const R = dfs(node.right);\n    const cam = 1 + Math.min(L.cam, L.cov, L.need) + Math.min(R.cam, R.cov, R.need);\n    const cov = Math.min(L.cam + Math.min(R.cam, R.cov), R.cam + Math.min(L.cam, L.cov));\n    const need = L.cov + R.cov;\n    return { cam, cov, need };\n  }\n  const { cam, cov } = dfs(root);\n  return Math.min(cam, cov);\n}\n",
    "tests": [
      {
        "name": "a single node needs its own camera",
        "body": "assert.equal(minCameraCover(buildTree([0])), 1);"
      },
      {
        "name": "a root with one child needs one camera",
        "body": "assert.equal(minCameraCover(buildTree([0,0])), 1);"
      },
      {
        "name": "one camera on the middle node covers a root and two leaves",
        "body": "assert.equal(minCameraCover(buildTree([0,0,null,0,0])), 1);"
      },
      {
        "name": "a path of four nodes needs two cameras",
        "body": "assert.equal(minCameraCover(buildTree([0,0,null,0,null,0])), 2);"
      },
      {
        "name": "a full tree of seven nodes needs two cameras",
        "body": "assert.equal(minCameraCover(buildTree([0,0,0,0,0,0,0])), 2);"
      },
      {
        "name": "a path of three nodes needs one camera in the middle",
        "body": "assert.equal(minCameraCover(buildTree([0,null,0,null,0])), 1);"
      },
      {
        "name": "a left spine of eight nodes",
        "body": "assert.equal(minCameraCover(buildTree([0,0,null,0,null,0,null,0,null,0,null,0,null,0,null,0])), 3);"
      },
      {
        "name": "matches an exhaustive search on a random tree 1",
        "body": "assert.equal(minCameraCover(buildTree([0,0,0,0,null,0,null,null,null,0,0,null,0,null,null,0,null,0,0])), 3);"
      },
      {
        "name": "matches an exhaustive search on a random tree 2",
        "body": "assert.equal(minCameraCover(buildTree([0,null,0,0,null,0,0,0,null,0,0])), 3);"
      },
      {
        "name": "matches an exhaustive search on a random tree 3",
        "body": "assert.equal(minCameraCover(buildTree([0,null,0,null,0,0,0,0,null,0,null,0,null,null,0])), 3);"
      },
      {
        "name": "matches an exhaustive search on a random tree 4",
        "body": "assert.equal(minCameraCover(buildTree([0,null,0,0,0,0,0,null,null,0,0])), 3);"
      }
    ]
  },
  {
    "id": "ex-sum-of-distances-in-tree",
    "chapter": "dsa-advanced-dp",
    "level": "advanced",
    "title": "Sum of Distances in Tree",
    "brief": "<p>You are given an undirected tree with <code>n</code> nodes labelled <code>0</code> to <code>n - 1</code> and its <code>n - 1</code> edges. Return an array <code>answer</code> where <code>answer[i]</code> is the sum of the distances between node <code>i</code> and every other node.</p><ul><li>Distance is the number of edges on the path</li><li>A single node has an answer of <code>[0]</code></li><li>Aim for O(n); running a BFS from every node is O(n^2) and too slow for <code>n = 30000</code></li><li>The tree can be a path of 30000 nodes, so do not rely on deep recursion</li></ul>",
    "starter": "function sumOfDistancesInTree(n, edges) {\n  // TODO: count subtree sizes, then move the root across each edge\n}\n",
    "hints": [
      "Root the tree at node 0. In one pass from the leaves up, compute count[u] (nodes in u's subtree) and down[u] (sum of distances from u to the nodes inside its subtree).",
      "down[p] = sum over children c of (down[c] + count[c]), because every node under c is one edge farther from p. That gives the answer for node 0.",
      "Moving the root from p to its child u brings count[u] nodes one step closer and pushes the other n - count[u] one step away: answer[u] = answer[p] - count[u] + (n - count[u]). Visit nodes parents-first."
    ],
    "solution": "function sumOfDistancesInTree(n, edges) {\n  const adj = Array.from({ length: n }, () => []);\n  for (const [a, b] of edges) {\n    adj[a].push(b);\n    adj[b].push(a);\n  }\n  const parent = new Array(n).fill(-1);\n  const order = [];\n  const stack = [0];\n  while (stack.length > 0) {\n    const u = stack.pop();\n    order.push(u);\n    for (const v of adj[u]) {\n      if (v !== parent[u]) {\n        parent[v] = u;\n        stack.push(v);\n      }\n    }\n  }\n  const count = new Array(n).fill(1);\n  const down = new Array(n).fill(0);\n  for (let i = n - 1; i > 0; i--) {\n    const u = order[i];\n    const p = parent[u];\n    count[p] += count[u];\n    down[p] += down[u] + count[u];\n  }\n  const answer = new Array(n).fill(0);\n  answer[0] = down[0];\n  for (let i = 1; i < n; i++) {\n    const u = order[i];\n    const p = parent[u];\n    answer[u] = answer[p] - count[u] + (n - count[u]);\n  }\n  return answer;\n}\n",
    "tests": [
      {
        "name": "the six-node example",
        "body": "assert.deepEqual(sumOfDistancesInTree(6, [[0, 1], [0, 2], [2, 3], [2, 4], [2, 5]]), [8, 12, 6, 10, 10, 10]);"
      },
      {
        "name": "a single node",
        "body": "assert.deepEqual(sumOfDistancesInTree(1, []), [0]);"
      },
      {
        "name": "two nodes",
        "body": "assert.deepEqual(sumOfDistancesInTree(2, [[1, 0]]), [1, 1]);"
      },
      {
        "name": "a path of three nodes",
        "body": "assert.deepEqual(sumOfDistancesInTree(3, [[0, 1], [1, 2]]), [3, 2, 3]);"
      },
      {
        "name": "a star centred on node 0",
        "body": "assert.deepEqual(sumOfDistancesInTree(5, [[0, 1], [0, 2], [0, 3], [0, 4]]), [4, 7, 7, 7, 7]);"
      },
      {
        "name": "a star centred on a node other than 0",
        "body": "assert.deepEqual(sumOfDistancesInTree(5, [[3, 0], [3, 1], [3, 2], [3, 4]]), [7, 7, 7, 4, 7]);"
      },
      {
        "name": "matches a brute force on a random tree 1",
        "body": "assert.deepEqual(sumOfDistancesInTree(10, [[1, 0], [2, 1], [2, 3], [4, 1], [5, 3], [6, 2], [4, 7], [6, 8], [7, 9]]), [26, 18, 18, 24, 22, 32, 24, 28, 32, 36]);"
      },
      {
        "name": "matches a brute force on a random tree 2",
        "body": "assert.deepEqual(sumOfDistancesInTree(12, [[1, 0], [2, 0], [3, 2], [3, 4], [0, 5], [0, 6], [6, 7], [1, 8], [2, 9], [0, 10], [4, 11]]), [20, 28, 22, 28, 36, 30, 28, 38, 38, 32, 30, 46]);"
      },
      {
        "name": "matches a brute force on a random tree 3",
        "body": "assert.deepEqual(sumOfDistancesInTree(11, [[1, 0], [0, 2], [3, 0], [4, 2], [5, 0], [6, 0], [7, 6], [6, 8], [2, 9], [8, 10]]), [16, 25, 21, 25, 30, 25, 19, 28, 26, 30, 35]);"
      },
      {
        "name": "a path of 30000 nodes is fast and does not overflow the stack",
        "body": "const n = 30000;\nconst edges = [];\nfor (let i = 1; i < n; i++) edges.push([i - 1, i]);\nconst result = sumOfDistancesInTree(n, edges);\nconst total = (n * (n - 1)) / 2;\nassert.equal(result[0], total);\nassert.equal(result[n - 1], total);\nassert.equal(result[1], total - (n - 1) + 1);\nconst mid = 15000;\nassert.equal(result[mid], (mid * (mid + 1)) / 2 + ((n - 1 - mid) * (n - mid)) / 2);"
      }
    ]
  },
  {
    "id": "ex-number-of-digit-one",
    "chapter": "dsa-advanced-dp",
    "level": "intermediate",
    "title": "Number of Digit One",
    "brief": "<p>Given a non-negative integer <code>n</code>, count how many times the digit <code>1</code> appears in the decimal writing of every integer from <code>0</code> to <code>n</code>, added together.</p><ul><li>For <code>n = 13</code> the numbers <code>1, 10, 11, 12, 13</code> contain six ones in total (11 counts twice)</li><li><code>n = 0</code> gives <code>0</code></li><li><code>n</code> can be as large as <code>2147483647</code>, so looping up to <code>n</code> is far too slow</li><li>The answer for the largest <code>n</code> fits in a normal JavaScript number</li></ul>",
    "starter": "function countDigitOne(n) {\n  // TODO: digit DP over the positions of n with a running count of ones\n}\n",
    "hints": [
      "Build the number one digit at a time from the left, with the flag tight (still equal to the prefix of n). A free (non-tight) state depends only on how many digits remain and how many ones you have placed.",
      "Carry ones, the number of 1 digits placed so far, in the state. When every position is filled, add that count to the total instead of returning 1.",
      "Leading zeros are harmless because a 0 never adds a one, so no started flag is needed. Memoize only non-tight states, keyed by position and ones."
    ],
    "solution": "function countDigitOne(n) {\n  if (n <= 0) return 0;\n  const digits = String(n).split('').map(Number);\n  const len = digits.length;\n  const memo = new Map();\n  function go(pos, ones, tight) {\n    if (pos === len) return ones;\n    const key = pos * 32 + ones;\n    if (!tight && memo.has(key)) return memo.get(key);\n    const limit = tight ? digits[pos] : 9;\n    let total = 0;\n    for (let d = 0; d <= limit; d++) {\n      total += go(pos + 1, ones + (d === 1 ? 1 : 0), tight && d === limit);\n    }\n    if (!tight) memo.set(key, total);\n    return total;\n  }\n  return go(0, 0, true);\n}\n",
    "tests": [
      {
        "name": "the worked example, n = 13",
        "body": "assert.equal(countDigitOne(13), 6);"
      },
      {
        "name": "zero",
        "body": "assert.equal(countDigitOne(0), 0);"
      },
      {
        "name": "single digit numbers",
        "body": "assert.equal(countDigitOne(9), 1);"
      },
      {
        "name": "just reaching 10",
        "body": "assert.equal(countDigitOne(10), 2);"
      },
      {
        "name": "a boundary just below a power of ten",
        "body": "assert.equal(countDigitOne(99), 20);"
      },
      {
        "name": "a power of ten",
        "body": "assert.equal(countDigitOne(100), 21);"
      },
      {
        "name": "a four-digit number",
        "body": "assert.equal(countDigitOne(1234), 689);"
      },
      {
        "name": "a number made of ones",
        "body": "assert.equal(countDigitOne(11111), 5560);"
      },
      {
        "name": "the largest 32-bit number",
        "body": "assert.equal(countDigitOne(2147483647), 2971027783);"
      },
      {
        "name": "a ten-digit number is not computed by looping",
        "body": "assert.equal(countDigitOne(1000000000), 900000001);"
      }
    ]
  },
  {
    "id": "ex-minimum-score-triangulation",
    "chapter": "dsa-advanced-dp",
    "level": "intermediate",
    "title": "Minimum Score Triangulation of Polygon",
    "brief": "<p>A convex polygon has <code>n</code> vertices, and <code>values[i]</code> is the number written on vertex <code>i</code> (in clockwise order). A <b>triangulation</b> cuts the polygon into <code>n - 2</code> triangles using non-crossing diagonals. The score of one triangle is the <b>product</b> of the three numbers on its vertices, and the score of a triangulation is the sum over its triangles. Return the smallest possible score.</p><ul><li><code>3 &lt;= n &lt;= 50</code></li><li>A triangle (n = 3) has exactly one triangulation</li><li>Values are positive integers</li></ul>",
    "starter": "function minScoreTriangulation(values) {\n  // TODO: interval DP over the vertices i..j, choosing the apex of the triangle on the chord i-j\n}\n",
    "hints": [
      "Look at the chord between vertices i and j. In any triangulation of the polygon i..j it is an edge of exactly one triangle, whose third corner k lies strictly between i and j.",
      "That triangle splits the polygon into i..k and k..j, which cannot interfere: dp[i][j] = min over k of dp[i][k] + dp[k][j] + values[i] * values[k] * values[j]. Two adjacent vertices are not a polygon, so dp[i][i + 1] = 0.",
      "Fill the table by increasing range length (j - i = 2, 3, ...), and the answer is dp[0][n - 1]. Time O(n^3)."
    ],
    "solution": "function minScoreTriangulation(values) {\n  const n = values.length;\n  const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let len = 2; len < n; len++) {\n    for (let i = 0; i + len < n; i++) {\n      const j = i + len;\n      let best = Infinity;\n      for (let k = i + 1; k < j; k++) {\n        best = Math.min(best, dp[i][k] + dp[k][j] + values[i] * values[k] * values[j]);\n      }\n      dp[i][j] = best;\n    }\n  }\n  return dp[0][n - 1];\n}\n",
    "tests": [
      {
        "name": "a triangle has one triangulation",
        "body": "assert.equal(minScoreTriangulation([1, 2, 3]), 6);"
      },
      {
        "name": "a quadrilateral picks the cheaper diagonal",
        "body": "assert.equal(minScoreTriangulation([3, 7, 4, 5]), 144);"
      },
      {
        "name": "a hexagon",
        "body": "assert.equal(minScoreTriangulation([1, 3, 1, 4, 1, 5]), 13);"
      },
      {
        "name": "equal values make every triangulation equal",
        "body": "assert.equal(minScoreTriangulation([2, 2, 2, 2, 2]), 24);"
      },
      {
        "name": "a large value is best used as few times as possible",
        "body": "assert.equal(minScoreTriangulation([1, 100, 1, 100, 1]), 201);"
      },
      {
        "name": "ascending values",
        "body": "assert.equal(minScoreTriangulation([1, 2, 3, 4, 5, 6]), 68);"
      },
      {
        "name": "matches a recursive search on a random polygon 1",
        "body": "assert.equal(minScoreTriangulation([17, 11, 6, 17, 3]), 1065);"
      },
      {
        "name": "matches a recursive search on a random polygon 2",
        "body": "assert.equal(minScoreTriangulation([19, 5, 13, 1, 16, 16]), 720);"
      },
      {
        "name": "matches a recursive search on a random polygon 3",
        "body": "assert.equal(minScoreTriangulation([6, 16, 10, 2, 16, 5]), 732);"
      },
      {
        "name": "fifty vertices finish quickly",
        "body": "const values = Array.from({ length: 50 }, () => 1);\nassert.equal(minScoreTriangulation(values), 48);"
      }
    ]
  },
  {
    "id": "ex-strange-printer",
    "chapter": "dsa-advanced-dp",
    "level": "advanced",
    "title": "Strange Printer",
    "brief": "<p>A printer can print a sequence of the <b>same character</b> on each turn, starting and ending at any positions, and each turn overwrites whatever was printed there before. Given a string <code>s</code>, return the minimum number of turns the printer needs to print it.</p><ul><li>For <code>\"aba\"</code> the answer is <code>2</code>: print <code>\"aaa\"</code>, then print <code>\"b\"</code> over the middle</li><li>A string of one repeated letter takes one turn</li><li><code>1 &lt;= s.length &lt;= 100</code>, lowercase letters</li></ul>",
    "starter": "function strangePrinter(s) {\n  // TODO: interval DP where the last character may share the stroke of an equal earlier one\n}\n",
    "hints": [
      "Let dp[i][j] be the fewest turns for s[i..j]. An easy upper bound is to give the last character its own turn: dp[i][j - 1] + 1.",
      "If s[k] === s[j] for some k in [i, j - 1], the turn that printed s[k] can be stretched to also cover j for free, and what lies strictly between is then printed on top: dp[i][k] + dp[k + 1][j - 1].",
      "Take care when k + 1 > j - 1 (an empty middle): that part costs 0. Fill with i running downwards so dp[k + 1][j - 1] is ready."
    ],
    "solution": "function strangePrinter(s) {\n  const t = [];\n  for (const ch of s) if (t.length === 0 || t[t.length - 1] !== ch) t.push(ch);\n  const n = t.length;\n  if (n === 0) return 0;\n  const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = n - 1; i >= 0; i--) {\n    dp[i][i] = 1;\n    for (let j = i + 1; j < n; j++) {\n      dp[i][j] = dp[i][j - 1] + 1;\n      for (let k = i; k < j; k++) {\n        if (t[k] === t[j]) {\n          const middle = k + 1 <= j - 1 ? dp[k + 1][j - 1] : 0;\n          dp[i][j] = Math.min(dp[i][j], dp[i][k] + middle);\n        }\n      }\n    }\n  }\n  return dp[0][n - 1];\n}\n",
    "tests": [
      {
        "name": "one repeated letter is one turn",
        "body": "assert.equal(strangePrinter(\"aaabbb\"), 2);"
      },
      {
        "name": "aba reuses the outer stroke",
        "body": "assert.equal(strangePrinter(\"aba\"), 2);"
      },
      {
        "name": "a single character",
        "body": "assert.equal(strangePrinter(\"a\"), 1);"
      },
      {
        "name": "all different letters need a turn each",
        "body": "assert.equal(strangePrinter(\"abcd\"), 4);"
      },
      {
        "name": "abcabc",
        "body": "assert.equal(strangePrinter(\"abcabc\"), 5);"
      },
      {
        "name": "a palindrome of five letters",
        "body": "assert.equal(strangePrinter(\"abcba\"), 3);"
      },
      {
        "name": "alternating letters",
        "body": "assert.equal(strangePrinter(\"ababab\"), 4);"
      },
      {
        "name": "matches a search over printer states on a random string 1",
        "body": "assert.equal(strangePrinter(\"bbabcc\"), 3);"
      },
      {
        "name": "matches a search over printer states on a random string 2",
        "body": "assert.equal(strangePrinter(\"baaacc\"), 3);"
      },
      {
        "name": "matches a search over printer states on a random string 3",
        "body": "assert.equal(strangePrinter(\"bcbcb\"), 3);"
      },
      {
        "name": "a long string of 100 characters finishes quickly",
        "body": "const s = 'abc'.repeat(33) + 'a';\nconst result = strangePrinter(s);\nassert.ok(result >= 3 && result <= 100);\nassert.equal(strangePrinter('a'.repeat(100)), 1);"
      }
    ]
  },
  {
    "id": "ex-merge-stones",
    "chapter": "dsa-advanced-dp",
    "level": "advanced",
    "title": "Minimum Cost to Merge Stones",
    "brief": "<p>There are <code>n</code> piles of stones in a row, <code>stones[i]</code> in pile <code>i</code>. One move merges exactly <code>K</code> <b>consecutive</b> piles into one pile, at a cost equal to the total number of stones in those piles. Return the minimum total cost to merge all piles into one pile, or <code>-1</code> if it is impossible.</p><ul><li><code>2 &lt;= K &lt;= 30</code>, and <code>1 &lt;= n &lt;= 30</code></li><li>A single pile needs no moves and costs <code>0</code></li><li>Each move removes <code>K - 1</code> piles, which decides when one pile is reachable</li></ul>",
    "starter": "function mergeStones(stones, K) {\n  // TODO: return -1 early when (n - 1) % (K - 1) !== 0, then interval DP with prefix sums\n}\n",
    "hints": [
      "Each move turns K piles into 1, so it removes K - 1 piles. To get from n piles to 1 you need (n - 1) divisible by (K - 1); otherwise return -1 straight away.",
      "Let dp[i][j] be the cheapest way to merge stones i..j as far as it will go. Split at m where [i..m] becomes exactly one pile, so m moves in steps of K - 1 from i, and dp[i][j] = min of dp[i][m] + dp[m + 1][j].",
      "When (j - i) % (K - 1) === 0 the whole range can become one pile, so add the sum of stones i..j (use prefix sums) for the final merge. Otherwise add nothing."
    ],
    "solution": "function mergeStones(stones, K) {\n  const n = stones.length;\n  if ((n - 1) % (K - 1) !== 0) return -1;\n  const prefix = [0];\n  for (const x of stones) prefix.push(prefix[prefix.length - 1] + x);\n  const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let len = 2; len <= n; len++) {\n    for (let i = 0; i + len <= n; i++) {\n      const j = i + len - 1;\n      let best = Infinity;\n      for (let m = i; m < j; m += K - 1) best = Math.min(best, dp[i][m] + dp[m + 1][j]);\n      if ((len - 1) % (K - 1) === 0) best += prefix[j + 1] - prefix[i];\n      dp[i][j] = best;\n    }\n  }\n  return dp[0][n - 1];\n}\n",
    "tests": [
      {
        "name": "K = 2 on four piles",
        "body": "assert.equal(mergeStones([3, 2, 4, 1], 2), 20);"
      },
      {
        "name": "four piles cannot be merged three at a time",
        "body": "assert.equal(mergeStones([3, 2, 4, 1], 3), -1);"
      },
      {
        "name": "five piles, K = 3",
        "body": "assert.equal(mergeStones([3, 5, 1, 2, 6], 3), 25);"
      },
      {
        "name": "a single pile costs nothing",
        "body": "assert.equal(mergeStones([7], 4), 0);"
      },
      {
        "name": "exactly K piles are merged once",
        "body": "assert.equal(mergeStones([4, 1, 6], 3), 11);"
      },
      {
        "name": "K = 2 with equal piles",
        "body": "assert.equal(mergeStones([1, 1, 1, 1], 2), 8);"
      },
      {
        "name": "seven piles, K = 3",
        "body": "assert.equal(mergeStones([5, 1, 4, 2, 3, 6, 2], 3), 41);"
      },
      {
        "name": "matches an exhaustive search on a random case 1",
        "body": "assert.equal(mergeStones([2, 5, 7, 2, 7], 4), -1);"
      },
      {
        "name": "matches an exhaustive search on a random case 2",
        "body": "assert.equal(mergeStones([5, 8, 2, 6], 2), 42);"
      },
      {
        "name": "matches an exhaustive search on a random case 3",
        "body": "assert.equal(mergeStones([4, 8, 3, 9, 8], 3), 47);"
      },
      {
        "name": "thirty piles finish quickly",
        "body": "const stones = Array.from({ length: 29 }, () => 1);\nassert.ok(mergeStones(stones, 2) > 0);\nassert.equal(mergeStones(Array.from({ length: 30 }, () => 1), 4), -1);"
      }
    ]
  },
  {
    "id": "ex-constrained-subsequence-sum",
    "chapter": "dsa-advanced-dp",
    "level": "advanced",
    "title": "Constrained Subsequence Sum",
    "brief": "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the maximum sum of a <b>non-empty</b> subsequence in which every two consecutive chosen elements <code>nums[i]</code> and <code>nums[j]</code> (<code>i &lt; j</code>) satisfy <code>j - i &lt;= k</code>.</p><ul><li>An all-negative array has the largest single element as its answer</li><li><code>1 &lt;= k &lt;= nums.length</code></li><li>A solution that scans k values for every element is too slow when both are 30000</li></ul>",
    "starter": "function constrainedSubsetSum(nums, k) {\n  // TODO: dp[i] = nums[i] + max(0, best dp in the last k indices), with a monotonic deque\n}\n",
    "hints": [
      "Let dp[i] be the best sum of a valid subsequence that ends at index i. It either starts at i or extends one that ends at some j in [i - k, i - 1].",
      "dp[i] = nums[i] + max(0, max of dp[j] for j in [i - k, i - 1]). The inner maximum is a sliding-window maximum over the dp values you are building.",
      "Keep a deque of indices whose dp values decrease. Pop the front when its index is below i - k, read the front as the window maximum, and before pushing i pop every back index whose dp is not larger. The answer is the maximum dp[i]."
    ],
    "solution": "function constrainedSubsetSum(nums, k) {\n  const n = nums.length;\n  const dp = new Array(n).fill(0);\n  const queue = new Array(n);\n  let head = 0;\n  let tail = 0;\n  let best = -Infinity;\n  for (let i = 0; i < n; i++) {\n    while (head < tail && queue[head] < i - k) head++;\n    const bestPrevious = head < tail ? dp[queue[head]] : 0;\n    dp[i] = nums[i] + Math.max(0, bestPrevious);\n    best = Math.max(best, dp[i]);\n    while (head < tail && dp[queue[tail - 1]] <= dp[i]) tail--;\n    queue[tail++] = i;\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "the worked example",
        "body": "assert.equal(constrainedSubsetSum([10, 2, -10, 5, 20], 2), 37);"
      },
      {
        "name": "all negative numbers pick the largest single element",
        "body": "assert.equal(constrainedSubsetSum([-1, -2, -3], 1), -1);"
      },
      {
        "name": "a negative stretch longer than k cannot be skipped",
        "body": "assert.equal(constrainedSubsetSum([10, -2, -10, -5, 20], 2), 23);"
      },
      {
        "name": "a single element",
        "body": "assert.equal(constrainedSubsetSum([5], 1), 5);"
      },
      {
        "name": "with k as long as the array every positive number is taken",
        "body": "assert.equal(constrainedSubsetSum([3, -1, 4, -1, 5], 5), 12);"
      },
      {
        "name": "k = 1 forces a contiguous subarray (Kadane)",
        "body": "assert.equal(constrainedSubsetSum([1, -2, 3, 4, -1, 2], 1), 8);"
      },
      {
        "name": "matches an exhaustive search on a random array 1",
        "body": "assert.equal(constrainedSubsetSum([-10, -8, -6, 8, -7, 7, 5, -1], 3), 20);"
      },
      {
        "name": "matches an exhaustive search on a random array 2",
        "body": "assert.equal(constrainedSubsetSum([1, 0, -5, 7, -7, 0, -9], 1), 7);"
      },
      {
        "name": "matches an exhaustive search on a random array 3",
        "body": "assert.equal(constrainedSubsetSum([10, 5, -3, -2, 2, 9], 5), 26);"
      },
      {
        "name": "30000 elements with a large k finish quickly",
        "body": "const n = 30000;\nconst nums = Array.from({ length: n }, (_, i) => (i % 7 === 0 ? -5 : (i % 5) + 1));\nlet positives = 0;\nfor (const x of nums) if (x > 0) positives += x;\nassert.equal(constrainedSubsetSum(nums, n), positives);"
      }
    ]
  },
  {
    "id": "ex-numbers-at-most-n-given-digit-set",
    "chapter": "dsa-advanced-dp",
    "level": "intermediate",
    "title": "Numbers At Most N Given Digit Set",
    "brief": "<p>You are given <code>digits</code>, a sorted array of distinct digit <b>strings</b> from <code>\"1\"</code> to <code>\"9\"</code>, and an integer <code>n</code>. Count the positive integers that are at most <code>n</code> and can be written using only those digits (each digit may be used any number of times).</p><ul><li>For <code>digits = [\"1\", \"3\", \"5\", \"7\"]</code> and <code>n = 100</code> the answer is <code>20</code>: four 1-digit and sixteen 2-digit numbers</li><li><code>n</code> can be up to <code>10^9</code>, so do not enumerate</li><li>Zero is not a positive integer and never counts</li></ul>",
    "starter": "function atMostNGivenDigitSet(digits, n) {\n  // TODO: count shorter numbers in closed form, then walk the digits of n\n}\n",
    "hints": [
      "Split the numbers by length. Every number shorter than n is below it, and it can use any digits: k + k^2 + ... + k^(L - 1) of them, where k is the number of allowed digits and L the number of digits in n.",
      "For numbers with the same length as n, walk n's digits from the left. At position i, each allowed digit strictly smaller than n's digit makes the number smaller, and the remaining L - i - 1 positions are free: smaller * k^(L - i - 1).",
      "You may continue along n's own digit only if it is allowed; if it is not, stop. If you get through all L positions, n itself can be written, so add 1."
    ],
    "solution": "function atMostNGivenDigitSet(digits, n) {\n  const s = String(n);\n  const L = s.length;\n  const k = digits.length;\n  let count = 0;\n  for (let len = 1; len < L; len++) count += k ** len;\n  for (let i = 0; i < L; i++) {\n    let smaller = 0;\n    let hasSame = false;\n    for (const d of digits) {\n      if (d < s[i]) smaller++;\n      else if (d === s[i]) hasSame = true;\n    }\n    count += smaller * k ** (L - i - 1);\n    if (!hasSame) return count;\n  }\n  return count + 1;\n}\n",
    "tests": [
      {
        "name": "four allowed digits and n = 100",
        "body": "assert.equal(atMostNGivenDigitSet([\"1\", \"3\", \"5\", \"7\"], 100), 20);"
      },
      {
        "name": "three allowed digits and n = 10^9",
        "body": "assert.equal(atMostNGivenDigitSet([\"1\", \"4\", \"9\"], 1000000000), 29523);"
      },
      {
        "name": "one allowed digit that is above n",
        "body": "assert.equal(atMostNGivenDigitSet([\"7\"], 8), 1);"
      },
      {
        "name": "n is itself made of allowed digits",
        "body": "assert.equal(atMostNGivenDigitSet([\"7\"], 7), 1);"
      },
      {
        "name": "no number of that length is small enough",
        "body": "assert.equal(atMostNGivenDigitSet([\"5\"], 4), 0);"
      },
      {
        "name": "all nine digits allowed count everything up to n",
        "body": "assert.equal(atMostNGivenDigitSet([\"1\", \"2\", \"3\", \"4\", \"5\", \"6\", \"7\", \"8\", \"9\"], 250), 207);"
      },
      {
        "name": "n has a digit that is not allowed in the middle",
        "body": "assert.equal(atMostNGivenDigitSet([\"1\", \"2\", \"5\"], 1534), 63);"
      },
      {
        "name": "matches enumeration on a random case 1",
        "body": "assert.equal(atMostNGivenDigitSet([\"2\", \"4\", \"7\", \"8\"], 4056), 148);"
      },
      {
        "name": "matches enumeration on a random case 2",
        "body": "assert.equal(atMostNGivenDigitSet([\"2\", \"5\"], 1424), 14);"
      },
      {
        "name": "matches enumeration on a random case 3",
        "body": "assert.equal(atMostNGivenDigitSet([\"6\", \"7\"], 701), 10);"
      }
    ]
  }
];
