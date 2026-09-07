import type { Exercise } from "../types";

export const dsa1: Exercise[] = [
{
    id: "ex-travelling-salesman-bitmask",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Travelling Salesman (Bitmask DP)",
    brief:
      "<p>You are given an <code>n x n</code> matrix <code>cost</code> where <code>cost[i][j]</code> is the price of travelling from city <code>i</code> to city <code>j</code>. Starting at <b>city 0</b>, visit every other city exactly once and come back to city 0. Return the cheapest total price of such a tour.</p><ul><li>The tour always starts <b>and</b> ends at city <code>0</code></li><li><code>n</code> is at most 12, so an exponential-in-<code>n</code> answer is expected — but <code>n!</code> permutations is not</li><li><code>cost[i][i]</code> is <code>0</code> and the matrix need not be symmetric</li><li>A single city (<code>n === 1</code>) costs <code>0</code></li></ul>",
    starter: "function tsp(cost) {\n  // TODO: cheapest tour from city 0 through every city and back\n}\n",
    hints: [
      "Trying every ordering is n! work. But two different orderings that have visited the SAME set of cities and are standing on the SAME city are interchangeable from here on — only the set and the current city matter.",
      "So the state is (set of visited cities, city you are standing on). Encode the set as an n-bit integer: bit i is 1 when city i has been visited. That is 2^n * n states.",
      "Fill dp[mask][last] = cheapest way to have visited exactly that mask and be sitting on that last city. Seed dp[1][0] = 0, extend to every unvisited city, and at the end add cost[last][0] for each candidate last.",
    ],
    solution:
      "function tsp(cost) {\n  const n = cost.length;\n  if (n <= 1) return 0;\n  const full = 1 << n;\n  const dp = [];\n  for (let mask = 0; mask < full; mask++) dp.push(new Array(n).fill(Infinity));\n  dp[1][0] = 0;\n  for (let mask = 1; mask < full; mask++) {\n    if ((mask & 1) === 0) continue;\n    for (let last = 0; last < n; last++) {\n      if ((mask & (1 << last)) === 0) continue;\n      const here = dp[mask][last];\n      if (here === Infinity) continue;\n      for (let next = 0; next < n; next++) {\n        if (mask & (1 << next)) continue;\n        const nextMask = mask | (1 << next);\n        const candidate = here + cost[last][next];\n        if (candidate < dp[nextMask][next]) dp[nextMask][next] = candidate;\n      }\n    }\n  }\n  let best = Infinity;\n  for (let last = 1; last < n; last++) {\n    const total = dp[full - 1][last] + cost[last][0];\n    if (total < best) best = total;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic four-city tour",
        body: "const cost = [\n  [0, 10, 15, 20],\n  [10, 0, 35, 25],\n  [15, 35, 0, 30],\n  [20, 25, 30, 0],\n];\nassert.equal(tsp(cost), 80);",
      },
      {
        name: "a single city costs nothing",
        body: "assert.equal(tsp([[0]]), 0);",
      },
      {
        name: "two cities is just there and back",
        body: "assert.equal(tsp([[0, 7], [3, 0]]), 10);",
      },
      {
        name: "asymmetric costs matter",
        body: "const cost = [\n  [0, 1, 9],\n  [9, 0, 1],\n  [1, 9, 0],\n];\nassert.equal(tsp(cost), 3, 'the cheap direction is 0 -> 1 -> 2 -> 0');",
      },
      {
        name: "five cities",
        body: "const cost = [\n  [0, 2, 9, 10, 7],\n  [1, 0, 6, 4, 3],\n  [15, 7, 0, 8, 3],\n  [6, 3, 12, 0, 11],\n  [9, 5, 2, 8, 0],\n];\nassert.equal(tsp(cost), 21);",
      },
    ],
  },
{
    id: "ex-partition-k-equal-sum-subsets",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Partition to K Equal Sum Subsets",
    brief:
      "<p>Given an array of positive integers <code>nums</code> and an integer <code>k</code>, decide whether the array can be split into exactly <code>k</code> non-empty groups that all add up to the same total. Return <code>true</code> or <code>false</code>.</p><ul><li>Every element must land in exactly one group</li><li><code>nums.length</code> is at most 16, so a bitmask over the used elements is the intended shape</li><li>If the total is not divisible by <code>k</code> the answer is <code>false</code></li><li>If any single element is bigger than the per-group target the answer is <code>false</code></li></ul>",
    starter:
      "function canPartitionKSubsets(nums, k) {\n  // TODO: can the elements be split into k groups of equal sum?\n}\n",
    hints: [
      "First the cheap rejections: the total must divide evenly by k, and no element may exceed the target sum = total / k.",
      "Now fill the groups ONE AT A TIME rather than juggling k of them. Track only which elements are used, as a bitmask; the running partial sum of the group you are currently filling is (sum of used elements) mod target.",
      "So dp[mask] = 'this exact set of elements can be consumed as some whole groups plus one partial group'. Extend mask by an unused element only when the partial sum plus that element does not overshoot the target. The answer is dp[(1 << n) - 1].",
    ],
    solution:
      "function canPartitionKSubsets(nums, k) {\n  const n = nums.length;\n  if (k <= 0 || n < k) return false;\n  let total = 0;\n  for (let i = 0; i < n; i++) total += nums[i];\n  if (total % k !== 0) return false;\n  const target = total / k;\n  for (let i = 0; i < n; i++) if (nums[i] > target) return false;\n  if (target === 0) return true;\n  const items = nums.slice().sort((a, b) => b - a);\n  const full = 1 << n;\n  const reachable = new Array(full).fill(false);\n  const used = new Array(full).fill(0);\n  reachable[0] = true;\n  for (let mask = 0; mask < full; mask++) {\n    if (!reachable[mask]) continue;\n    const partial = used[mask] % target;\n    for (let i = 0; i < n; i++) {\n      if (mask & (1 << i)) continue;\n      if (partial + items[i] > target) continue;\n      const nextMask = mask | (1 << i);\n      if (!reachable[nextMask]) {\n        reachable[nextMask] = true;\n        used[nextMask] = used[mask] + items[i];\n      }\n    }\n  }\n  return reachable[full - 1];\n}\n",
    tests: [
      {
        name: "splits into four groups of five",
        body: "assert.equal(canPartitionKSubsets([4, 3, 2, 3, 5, 2, 1], 4), true);",
      },
      {
        name: "rejects when no split exists",
        body: "assert.equal(canPartitionKSubsets([1, 2, 3, 4], 3), false);",
      },
      {
        name: "rejects when one element is too big",
        body: "assert.equal(canPartitionKSubsets([2, 2, 2, 2, 3, 4, 5], 4), false);",
      },
      {
        name: "k of 1 is always the whole array",
        body: "assert.equal(canPartitionKSubsets([7], 1), true);\nassert.equal(canPartitionKSubsets([3, 9, 4], 1), true);",
      },
      {
        name: "needs the non-greedy pairing",
        body: "assert.equal(canPartitionKSubsets([10, 10, 10, 7, 7, 7, 7, 7, 7, 6, 6, 6], 3), true);\nassert.equal(canPartitionKSubsets([1, 1, 1, 1, 2, 2, 2, 2], 5), false);",
      },
    ],
  },
{
    id: "ex-count-strictly-increasing-digits",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Count Numbers With Strictly Increasing Digits",
    brief:
      "<p>Given a positive integer <code>N</code>, count how many integers in the range <code>[1, N]</code> have <b>strictly increasing</b> digits when written in base 10 — that is, every digit is larger than the digit before it.</p><ul><li><code>1</code>, <code>7</code>, <code>13</code> and <code>159</code> qualify</li><li><code>11</code>, <code>21</code> and <code>102</code> do not</li><li>Every one-digit number from 1 to 9 qualifies</li><li><code>N</code> can be as large as <code>10^9</code>, so counting one number at a time is out — walk the digits of <code>N</code> instead</li></ul>",
    starter:
      "function countStrictlyIncreasing(N) {\n  // TODO: how many integers in [1, N] have strictly increasing digits?\n}\n",
    hints: [
      "Build the answer digit by digit from the most significant end. At each position you only need three facts: the previous digit you placed, whether you are still hugging the prefix of N, and whether you have placed a non-zero digit yet.",
      "'Still hugging N' (call it tight) limits the current digit to at most N's digit at that position; once you go strictly below it, every later position is free to use 0..9.",
      "Leading zeros are not really digits — while nothing has started, choosing 0 keeps 'previous digit' at -1 and does not start the number. Memoise only the states where tight is false, since the tight states are a single path.",
    ],
    solution:
      "function countStrictlyIncreasing(N) {\n  if (N < 1) return 0;\n  const s = String(N);\n  const len = s.length;\n  const memo = new Map();\n  const go = (pos, prev, tight, started) => {\n    if (pos === len) return started ? 1 : 0;\n    const key = pos * 100 + (prev + 1) * 2 + (started ? 1 : 0);\n    if (!tight && memo.has(key)) return memo.get(key);\n    const limit = tight ? s.charCodeAt(pos) - 48 : 9;\n    let total = 0;\n    for (let d = 0; d <= limit; d++) {\n      const stillTight = tight && d === limit;\n      if (!started && d === 0) {\n        total += go(pos + 1, -1, stillTight, false);\n      } else if (d > prev) {\n        total += go(pos + 1, d, stillTight, true);\n      }\n    }\n    if (!tight) memo.set(key, total);\n    return total;\n  };\n  return go(0, -1, true, false);\n}\n",
    tests: [
      {
        name: "single digits all count",
        body: "assert.equal(countStrictlyIncreasing(1), 1);\nassert.equal(countStrictlyIncreasing(9), 9);\nassert.equal(countStrictlyIncreasing(10), 9, '10 has a decreasing step');",
      },
      {
        name: "two-digit range",
        body: "assert.equal(countStrictlyIncreasing(12), 10, 'the 9 singles plus 12');\nassert.equal(countStrictlyIncreasing(99), 45);\nassert.equal(countStrictlyIncreasing(100), 45);",
      },
      {
        name: "agrees with a brute force count up to 2000",
        body: "const naive = (limit) => {\n  let count = 0;\n  for (let v = 1; v <= limit; v++) {\n    const t = String(v);\n    let ok = true;\n    for (let i = 1; i < t.length; i++) if (t.charCodeAt(i) <= t.charCodeAt(i - 1)) ok = false;\n    if (ok) count++;\n  }\n  return count;\n};\nfor (const limit of [37, 123, 456, 789, 1000, 1357, 2000]) {\n  assert.equal(countStrictlyIncreasing(limit), naive(limit), 'mismatch at N = ' + limit);\n}",
      },
      {
        name: "handles a huge N instantly",
        body: "assert.equal(countStrictlyIncreasing(999999999), 511, 'every non-empty subset of 1..9');\nassert.equal(countStrictlyIncreasing(1000000000), 511);",
      },
    ],
  },
{
    id: "ex-burst-balloons",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Burst Balloons",
    brief:
      "<p>You are given <code>nums</code>, the numbers painted on a row of balloons. Bursting the balloon at index <code>i</code> earns you <code>left * nums[i] * right</code> coins, where <code>left</code> and <code>right</code> are the balloons immediately beside it <em>at that moment</em>. A missing neighbour (off the end of the row) counts as a balloon painted <code>1</code>. After a burst the row closes up. Return the most coins you can collect by bursting all of them.</p><ul><li>You choose the order freely</li><li>An empty row earns <code>0</code></li><li>Greedily bursting the cheapest (or the most expensive) balloon first is <b>not</b> optimal</li></ul>",
    starter: "function maxCoins(nums) {\n  // TODO: maximum coins from bursting every balloon\n}\n",
    hints: [
      "Thinking about which balloon to burst FIRST is a trap — it splits the row into two halves that are no longer independent, because the two halves become neighbours.",
      "Flip it around: ask which balloon in a range is burst LAST. When balloon k is last inside the open interval (left, right), its neighbours at that moment are exactly the boundaries left and right, and the two sides really are independent.",
      "Pad the array with a 1 at each end. Let dp[left][right] be the best you can do strictly between those two indices; then dp[left][right] = max over k of dp[left][k] + dp[k][right] + vals[left]*vals[k]*vals[right]. Fill by increasing gap.",
    ],
    solution:
      "function maxCoins(nums) {\n  const vals = [1];\n  for (let i = 0; i < nums.length; i++) vals.push(nums[i]);\n  vals.push(1);\n  const m = vals.length;\n  const dp = [];\n  for (let i = 0; i < m; i++) dp.push(new Array(m).fill(0));\n  for (let gap = 2; gap < m; gap++) {\n    for (let left = 0; left + gap < m; left++) {\n      const right = left + gap;\n      let best = 0;\n      for (let k = left + 1; k < right; k++) {\n        const coins = dp[left][k] + dp[k][right] + vals[left] * vals[k] * vals[right];\n        if (coins > best) best = coins;\n      }\n      dp[left][right] = best;\n    }\n  }\n  return dp[0][m - 1];\n}\n",
    tests: [
      {
        name: "the classic row",
        body: "assert.equal(maxCoins([3, 1, 5, 8]), 167);",
      },
      {
        name: "empty and single",
        body: "assert.equal(maxCoins([]), 0);\nassert.equal(maxCoins([5]), 5, 'both neighbours are the imaginary 1s');",
      },
      {
        name: "two balloons",
        body: "assert.equal(maxCoins([1, 5]), 10);",
      },
      {
        name: "beats the greedy order",
        body: "assert.equal(maxCoins([7, 9, 8, 0, 7, 1, 3, 5, 5, 2]), 1582);\nassert.equal(maxCoins([2, 4, 6]), 66);",
      },
      {
        name: "zeros in the row",
        body: "assert.equal(maxCoins([0, 0]), 0);\nassert.equal(maxCoins([3, 0, 4]), 16);",
      },
    ],
  },
{
    id: "ex-minimum-cost-to-cut-a-stick",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "Minimum Cost to Cut a Stick",
    brief:
      "<p>A wooden stick of length <code>n</code> lies from position <code>0</code> to position <code>n</code>. You are given <code>cuts</code>, the positions you must cut at, in any order you like. Cutting a piece costs the <b>length of that piece</b>, and the cut splits it in two. Return the minimum total cost of performing all the cuts.</p><ul><li>You may perform the cuts in any order, and the order changes the cost</li><li><code>cuts</code> is not sorted</li><li>No cuts at all costs <code>0</code></li><li>Example: <code>n = 7</code> with <code>cuts = [1, 3, 4, 5]</code> costs <code>16</code></li></ul>",
    starter: "function minCost(n, cuts) {\n  // TODO: cheapest total cost to make every cut\n}\n",
    hints: [
      "Sort the cut positions and glue 0 to the front and n to the back. Every piece that ever exists is then the span between two of those points.",
      "For the span from point i to point j, the price of the FIRST cut you make inside it is fixed: it is the whole span, points[j] - points[i], no matter which cut you pick. What varies is what the two halves cost afterwards.",
      "So dp[i][j] = (points[j] - points[i]) + min over k strictly between i and j of dp[i][k] + dp[k][j], with dp[i][i+1] = 0. Fill by increasing j - i.",
    ],
    solution:
      "function minCost(n, cuts) {\n  const points = cuts.slice().sort((a, b) => a - b);\n  points.unshift(0);\n  points.push(n);\n  const m = points.length;\n  const dp = [];\n  for (let i = 0; i < m; i++) dp.push(new Array(m).fill(0));\n  for (let gap = 2; gap < m; gap++) {\n    for (let i = 0; i + gap < m; i++) {\n      const j = i + gap;\n      let best = Infinity;\n      for (let k = i + 1; k < j; k++) {\n        const inner = dp[i][k] + dp[k][j];\n        if (inner < best) best = inner;\n      }\n      dp[i][j] = best + points[j] - points[i];\n    }\n  }\n  return dp[0][m - 1];\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "assert.equal(minCost(7, [1, 3, 4, 5]), 16);",
      },
      {
        name: "unsorted cuts",
        body: "assert.equal(minCost(9, [5, 6, 1, 4, 2]), 22);",
      },
      {
        name: "no cuts and one cut",
        body: "assert.equal(minCost(10, []), 0);\nassert.equal(minCost(10, [4]), 10, 'the single cut always costs the whole stick');",
      },
      {
        name: "order really matters",
        body: "assert.equal(minCost(20, [10]), 20);\nassert.equal(minCost(20, [5, 10, 15]), 40);\nassert.equal(minCost(30, [1, 2, 3, 28, 29]), 64);",
      },
    ],
  },
{
    id: "ex-house-robber-iii",
    chapter: "dsa-advanced-dp",
    level: "advanced",
    title: "House Robber III",
    brief:
      "<p>The houses of a neighbourhood form a binary tree; <code>node.val</code> is the money in that house. The police are alerted if you rob <b>two houses that are directly linked</b> — that is, a node and one of its children. Return the most money you can take.</p><ul><li>A <code>TreeNode</code> class and a <code>buildTree(levelOrder)</code> helper are already provided — <code>buildTree</code> reads a level-order array where <code>null</code> marks a missing child</li><li>An empty tree yields <code>0</code></li><li>Robbing a grandchild is fine; only parent-child pairs are forbidden</li><li>All values are non-negative</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\n\nfunction buildTree(values) {\n  if (!values || values.length === 0 || values[0] === null) return null;\n  const root = new TreeNode(values[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length > 0 && i < values.length) {\n    const node = queue.shift();\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.left = new TreeNode(v); queue.push(node.left); }\n    }\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.right = new TreeNode(v); queue.push(node.right); }\n    }\n  }\n  return root;\n}\n\nfunction rob(root) {\n  // TODO: most money takeable without robbing a node and its child\n}\n",
    hints: [
      "A node cannot decide on its own: 'take me' is only worth it if the children were skipped. So one number per subtree is not enough information to pass upward.",
      "Return TWO numbers from each subtree — the best total when this node is robbed, and the best total when it is not.",
      "If the node is robbed you must add the children's 'not robbed' numbers. If it is not robbed each child is free to take whichever of its two numbers is larger. The answer at the root is the max of its pair.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\n\nfunction buildTree(values) {\n  if (!values || values.length === 0 || values[0] === null) return null;\n  const root = new TreeNode(values[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length > 0 && i < values.length) {\n    const node = queue.shift();\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.left = new TreeNode(v); queue.push(node.left); }\n    }\n    if (i < values.length) {\n      const v = values[i++];\n      if (v !== null) { node.right = new TreeNode(v); queue.push(node.right); }\n    }\n  }\n  return root;\n}\n\nfunction rob(root) {\n  const go = (node) => {\n    if (node === null) return [0, 0];\n    const left = go(node.left);\n    const right = go(node.right);\n    const skip = Math.max(left[0], left[1]) + Math.max(right[0], right[1]);\n    const take = node.val + left[0] + right[0];\n    return [skip, take];\n  };\n  const pair = go(root);\n  return Math.max(pair[0], pair[1]);\n}\n",
    tests: [
      {
        name: "skips the root to take both grandchildren",
        body: "assert.equal(rob(buildTree([3, 2, 3, null, 3, null, 1])), 7);",
      },
      {
        name: "takes the root and the grandchildren",
        body: "assert.equal(rob(buildTree([3, 4, 5, 1, 3, null, 1])), 9);",
      },
      {
        name: "empty tree and single node",
        body: "assert.equal(rob(null), 0);\nassert.equal(rob(buildTree([])), 0);\nassert.equal(rob(buildTree([7])), 7);",
      },
      {
        name: "a long left spine alternates",
        body: "const root = buildTree([4, 1, null, 2, null, null, null]);\nassert.equal(rob(root), 6, 'take the 4 and the 2');",
      },
      {
        name: "zeros do not confuse the choice",
        body: "assert.equal(rob(buildTree([0, 0, 0])), 0);\nassert.equal(rob(buildTree([2, 1, 3, null, 4])), 7);",
      },
    ],
  },
{
    id: "ex-range-sum-query-mutable",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Range Sum Query — Mutable",
    brief:
      "<p>Build a <code>NumArray</code> class over an integer array that supports point updates and range-sum queries.</p><ul><li><code>new NumArray(nums)</code> — takes a copy of the array</li><li><code>update(i, val)</code> — <b>replaces</b> the value at index <code>i</code> with <code>val</code> (it is not a delta)</li><li><code>sumRange(l, r)</code> — the sum of indices <code>l</code> through <code>r</code> <b>inclusive</b>, with <code>0 &lt;= l &lt;= r &lt; nums.length</code></li><li>Both <code>update</code> and <code>sumRange</code> must run in <b>O(log n)</b>. Re-summing the slice on every query, or rebuilding prefix sums on every update, is <em>not</em> acceptable — the tests interleave thousands of both</li><li>Values may be negative</li></ul>",
    starter:
      "class NumArray {\n  constructor(nums) {\n    // TODO: what structure gives you O(log n) updates AND O(log n) range sums?\n  }\n  update(i, val) {}\n  sumRange(l, r) {}\n}\n",
    hints: [
      "A plain prefix-sum array answers queries in O(1) but costs O(n) to repair after one write. A plain array is the mirror image: O(1) writes, O(n) queries. You want the middle ground where both are logarithmic.",
      "Store partial sums over BLOCKS that halve: a Fenwick (binary indexed) tree, or a segment tree where each node holds the sum of its half of the array.",
      "For a Fenwick tree, keep the original values too. update(i, val) then becomes 'add val - nums[i] at position i', and sumRange(l, r) is prefix(r) - prefix(l - 1). Remember prefix(-1) must be 0.",
    ],
    solution:
      "class NumArray {\n  constructor(nums) {\n    this.n = nums.length;\n    this.values = nums.slice();\n    this.tree = new Array(this.n + 1).fill(0);\n    for (let i = 0; i < this.n; i++) this._add(i, nums[i]);\n  }\n  _add(i, delta) {\n    for (let x = i + 1; x <= this.n; x += x & -x) this.tree[x] += delta;\n  }\n  _prefix(i) {\n    let sum = 0;\n    for (let x = i + 1; x > 0; x -= x & -x) sum += this.tree[x];\n    return sum;\n  }\n  update(i, val) {\n    const delta = val - this.values[i];\n    this.values[i] = val;\n    this._add(i, delta);\n  }\n  sumRange(l, r) {\n    return this._prefix(r) - this._prefix(l - 1);\n  }\n}\n",
    tests: [
      {
        name: "queries then an update",
        body: "const na = new NumArray([1, 3, 5]);\nassert.equal(na.sumRange(0, 2), 9);\nassert.equal(na.sumRange(1, 1), 3);\nna.update(1, 2);\nassert.equal(na.sumRange(0, 2), 8);\nassert.equal(na.sumRange(1, 2), 7);",
      },
      {
        name: "single element and negatives",
        body: "const one = new NumArray([-7]);\nassert.equal(one.sumRange(0, 0), -7);\none.update(0, 4);\nassert.equal(one.sumRange(0, 0), 4);\nconst mix = new NumArray([-2, 0, 3, -5]);\nassert.equal(mix.sumRange(0, 3), -4);\nmix.update(3, 5);\nassert.equal(mix.sumRange(2, 3), 8);",
      },
      {
        name: "updating the same index repeatedly is not cumulative",
        body: "const na = new NumArray([10, 20, 30]);\nna.update(0, 1);\nna.update(0, 2);\nna.update(0, 3);\nassert.equal(na.sumRange(0, 0), 3, 'update replaces, it does not add');\nassert.equal(na.sumRange(0, 2), 53);",
      },
      {
        name: "interleaved updates and queries match a brute-force mirror",
        body: "const n = 64;\nconst base = [];\nfor (let i = 0; i < n; i++) base.push(((i * 37) % 41) - 20);\nconst na = new NumArray(base);\nconst mirror = base.slice();\nlet seed = 12345;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 500; step++) {\n  if (step % 3 === 0) {\n    const i = rnd(n);\n    const v = rnd(200) - 100;\n    na.update(i, v);\n    mirror[i] = v;\n  } else {\n    let l = rnd(n);\n    let r = rnd(n);\n    if (l > r) { const t = l; l = r; r = t; }\n    let expected = 0;\n    for (let i = l; i <= r; i++) expected += mirror[i];\n    assert.equal(na.sumRange(l, r), expected, 'sumRange(' + l + ', ' + r + ') at step ' + step);\n  }\n}",
      },
      {
        name: "stays fast on a large array",
        body: "const n = 50000;\nconst base = new Array(n).fill(1);\nconst mirror = base.slice();\nconst na = new NumArray(base);\nlet total = n;\nlet seed = 99;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 20000; step++) {\n  const i = rnd(n);\n  const v = rnd(21) - 10;\n  total += v - mirror[i];\n  mirror[i] = v;\n  na.update(i, v);\n  assert.equal(na.sumRange(0, n - 1), total, 'full total at step ' + step);\n}\nlet expected = 0;\nfor (let i = 100; i <= 140; i++) expected += mirror[i];\nassert.equal(na.sumRange(100, 140), expected);",
      },
    ],
  },
{
    id: "ex-fenwick-binary-indexed-tree",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Implement a Fenwick (Binary Indexed) Tree",
    brief:
      "<p>Implement the data structure itself, from scratch. A <code>FenwickTree</code> holds <code>size</code> numbers, all <code>0</code> to begin with.</p><ul><li><code>new FenwickTree(size)</code> — <code>size</code> zeros</li><li><code>update(i, delta)</code> — <b>adds</b> <code>delta</code> to the value at the 0-based index <code>i</code> (this one is a delta, not a replacement)</li><li><code>prefixSum(i)</code> — the sum of indices <code>0</code> through <code>i</code> <b>inclusive</b>; <code>prefixSum(-1)</code> is <code>0</code></li><li>Both operations must be <b>O(log size)</b></li><li>Deltas may be negative</li></ul><p>The trick the structure is built on: index <code>x</code> of the internal array covers the <code>x &amp; -x</code> values ending at <code>x</code>, where <code>x &amp; -x</code> isolates the lowest set bit.</p>",
    starter:
      "class FenwickTree {\n  constructor(size) {\n    // TODO: an internal array; 1-based indexing makes the bit tricks work\n  }\n  update(i, delta) {}\n  prefixSum(i) {}\n}\n",
    hints: [
      "Work internally in 1-based positions: the learner's index i lives at internal position i + 1. Position 0 is left unused so that x & -x is never 0.",
      "To walk UP from a position to every node that covers it, repeatedly do x += x & -x while x <= size. To sum a prefix, walk DOWN with x -= x & -x while x > 0.",
      "That is the whole structure — two four-line loops. Make sure prefixSum(-1) turns into x = 0, whose loop body never runs, so it returns 0.",
    ],
    solution:
      "class FenwickTree {\n  constructor(size) {\n    this.size = size;\n    this.tree = new Array(size + 1).fill(0);\n  }\n  update(i, delta) {\n    for (let x = i + 1; x <= this.size; x += x & -x) this.tree[x] += delta;\n  }\n  prefixSum(i) {\n    let sum = 0;\n    for (let x = i + 1; x > 0; x -= x & -x) sum += this.tree[x];\n    return sum;\n  }\n}\n",
    tests: [
      {
        name: "starts empty and accumulates",
        body: "const ft = new FenwickTree(5);\nassert.equal(ft.prefixSum(4), 0);\nassert.equal(ft.prefixSum(-1), 0);\nft.update(0, 3);\nft.update(2, 7);\nassert.equal(ft.prefixSum(0), 3);\nassert.equal(ft.prefixSum(1), 3);\nassert.equal(ft.prefixSum(2), 10);\nassert.equal(ft.prefixSum(4), 10);",
      },
      {
        name: "update adds rather than replaces",
        body: "const ft = new FenwickTree(4);\nft.update(1, 5);\nft.update(1, 5);\nassert.equal(ft.prefixSum(1), 10);\nft.update(1, -4);\nassert.equal(ft.prefixSum(1), 6);\nassert.equal(ft.prefixSum(3), 6);",
      },
      {
        name: "range sums come from two prefixes",
        body: "const ft = new FenwickTree(8);\nfor (let i = 0; i < 8; i++) ft.update(i, i + 1);\nassert.equal(ft.prefixSum(7), 36);\nassert.equal(ft.prefixSum(3) - ft.prefixSum(0), 9, 'indices 1..3 hold 2 + 3 + 4');\nassert.equal(ft.prefixSum(7) - ft.prefixSum(3), 26);",
      },
      {
        name: "size 1 and non-power-of-two sizes",
        body: "const one = new FenwickTree(1);\none.update(0, 42);\nassert.equal(one.prefixSum(0), 42);\nconst odd = new FenwickTree(7);\nodd.update(6, 2);\nodd.update(5, 3);\nassert.equal(odd.prefixSum(4), 0);\nassert.equal(odd.prefixSum(5), 3);\nassert.equal(odd.prefixSum(6), 5);",
      },
      {
        name: "interleaved updates and prefixes match a brute-force mirror",
        body: "const n = 50;\nconst ft = new FenwickTree(n);\nconst mirror = new Array(n).fill(0);\nlet seed = 2024;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 400; step++) {\n  const i = rnd(n);\n  const delta = rnd(21) - 10;\n  ft.update(i, delta);\n  mirror[i] += delta;\n  const q = rnd(n);\n  let expected = 0;\n  for (let j = 0; j <= q; j++) expected += mirror[j];\n  assert.equal(ft.prefixSum(q), expected, 'prefixSum(' + q + ') at step ' + step);\n}",
      },
    ],
  },
{
    id: "ex-range-minimum-query-segment-tree",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Range Minimum Query (Segment Tree)",
    brief:
      "<p>Build a <code>SegmentTreeMin</code> class over an array of numbers.</p><ul><li><code>new SegmentTreeMin(nums)</code> — builds from a non-empty array</li><li><code>update(i, val)</code> — <b>replaces</b> the value at index <code>i</code></li><li><code>rangeMin(l, r)</code> — the smallest value in indices <code>l</code> to <code>r</code> <b>inclusive</b></li><li>Both operations must be <b>O(log n)</b></li><li>A Fenwick tree does not work here — minimum has no inverse, so you cannot subtract one prefix from another</li><li>Values may be negative; duplicates are fine</li></ul>",
    starter:
      "class SegmentTreeMin {\n  constructor(nums) {\n    // TODO: each node should own the minimum of one half of its parent's span\n  }\n  update(i, val) {}\n  rangeMin(l, r) {}\n}\n",
    hints: [
      "Store the tree in a flat array where node 1 owns the whole array, node 2k owns the left half of node k's span and node 2k + 1 the right half. An array of length 4 * n is always enough.",
      "A query on (l, r) at a node has three cases: the node's span is completely outside — return Infinity; completely inside — return the node's stored minimum; otherwise recurse into both children and take the smaller.",
      "An update walks down to the single leaf, writes the new value there, and then on the way back up resets each ancestor to Math.min of its two children.",
    ],
    solution:
      "class SegmentTreeMin {\n  constructor(nums) {\n    this.n = nums.length;\n    this.tree = new Array(4 * (this.n > 0 ? this.n : 1)).fill(Infinity);\n    if (this.n > 0) this._build(nums, 1, 0, this.n - 1);\n  }\n  _build(nums, node, lo, hi) {\n    if (lo === hi) { this.tree[node] = nums[lo]; return; }\n    const mid = (lo + hi) >> 1;\n    this._build(nums, node * 2, lo, mid);\n    this._build(nums, node * 2 + 1, mid + 1, hi);\n    this.tree[node] = Math.min(this.tree[node * 2], this.tree[node * 2 + 1]);\n  }\n  update(i, val) {\n    this._update(1, 0, this.n - 1, i, val);\n  }\n  _update(node, lo, hi, i, val) {\n    if (lo === hi) { this.tree[node] = val; return; }\n    const mid = (lo + hi) >> 1;\n    if (i <= mid) this._update(node * 2, lo, mid, i, val);\n    else this._update(node * 2 + 1, mid + 1, hi, i, val);\n    this.tree[node] = Math.min(this.tree[node * 2], this.tree[node * 2 + 1]);\n  }\n  rangeMin(l, r) {\n    if (this.n === 0 || l > r) return Infinity;\n    return this._query(1, 0, this.n - 1, l, r);\n  }\n  _query(node, lo, hi, l, r) {\n    if (r < lo || hi < l) return Infinity;\n    if (l <= lo && hi <= r) return this.tree[node];\n    const mid = (lo + hi) >> 1;\n    const left = this._query(node * 2, lo, mid, l, r);\n    const right = this._query(node * 2 + 1, mid + 1, hi, l, r);\n    return Math.min(left, right);\n  }\n}\n",
    tests: [
      {
        name: "queries the initial array",
        body: "const st = new SegmentTreeMin([5, 2, 9, 1, 7, 3]);\nassert.equal(st.rangeMin(0, 5), 1);\nassert.equal(st.rangeMin(0, 2), 2);\nassert.equal(st.rangeMin(4, 5), 3);\nassert.equal(st.rangeMin(2, 2), 9);",
      },
      {
        name: "an update can raise or lower the minimum",
        body: "const st = new SegmentTreeMin([5, 2, 9, 1, 7, 3]);\nst.update(3, 100);\nassert.equal(st.rangeMin(0, 5), 2, 'the old minimum is gone');\nst.update(5, -4);\nassert.equal(st.rangeMin(0, 5), -4);\nassert.equal(st.rangeMin(0, 4), 2);",
      },
      {
        name: "single element array",
        body: "const st = new SegmentTreeMin([8]);\nassert.equal(st.rangeMin(0, 0), 8);\nst.update(0, -1);\nassert.equal(st.rangeMin(0, 0), -1);",
      },
      {
        name: "duplicates survive one being replaced",
        body: "const st = new SegmentTreeMin([4, 1, 6, 1, 9]);\nassert.equal(st.rangeMin(0, 4), 1);\nst.update(1, 50);\nassert.equal(st.rangeMin(0, 4), 1, 'the other 1 is still there');\nst.update(3, 50);\nassert.equal(st.rangeMin(0, 4), 4);",
      },
      {
        name: "interleaved updates and queries match a brute-force mirror",
        body: "const n = 47;\nconst base = [];\nfor (let i = 0; i < n; i++) base.push(((i * 29) % 53) - 26);\nconst st = new SegmentTreeMin(base);\nconst mirror = base.slice();\nlet seed = 555;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 500; step++) {\n  if (step % 4 === 0) {\n    const i = rnd(n);\n    const v = rnd(120) - 60;\n    st.update(i, v);\n    mirror[i] = v;\n  }\n  let l = rnd(n);\n  let r = rnd(n);\n  if (l > r) { const t = l; l = r; r = t; }\n  let expected = Infinity;\n  for (let i = l; i <= r; i++) if (mirror[i] < expected) expected = mirror[i];\n  assert.equal(st.rangeMin(l, r), expected, 'rangeMin(' + l + ', ' + r + ') at step ' + step);\n}",
      },
    ],
  },
{
    id: "ex-count-of-smaller-numbers-after-self",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Count of Smaller Numbers After Self",
    brief:
      "<p>Given an integer array <code>nums</code>, return an array <code>counts</code> of the same length where <code>counts[i]</code> is how many numbers to the <b>right</b> of <code>nums[i]</code> are <b>strictly smaller</b> than it.</p><ul><li><code>[5, 2, 6, 1]</code> gives <code>[2, 1, 1, 0]</code></li><li>Equal values do not count — only strictly smaller ones</li><li>An empty array gives an empty array</li><li>Values can be negative and can repeat, so index them by <b>rank</b> (their position in the sorted set of distinct values) rather than by value</li><li>Aim for <code>O(n log n)</code>; the nested-loop count is the thing to beat</li></ul>",
    starter:
      "function countSmaller(nums) {\n  // TODO: for each index, how many strictly smaller values sit to its right?\n}\n",
    hints: [
      "Walk the array from RIGHT to LEFT. Then 'the numbers to my right' is exactly 'everything I have inserted so far', and the question becomes 'how many inserted values are smaller than this one?'.",
      "That question is a prefix count, which is what a Fenwick tree answers in O(log n) — as long as the values are small array indices. So first compress: sort the distinct values and map each value to its rank 0, 1, 2, ...",
      "For each element from the right: answer = prefixSum(rank - 1) (strictly smaller ranks only, which is why equal values are excluded), then add 1 at rank.",
    ],
    solution:
      "function countSmaller(nums) {\n  const n = nums.length;\n  const result = new Array(n).fill(0);\n  if (n === 0) return result;\n  const sorted = nums.slice().sort((a, b) => a - b);\n  const rank = new Map();\n  let next = 0;\n  for (let i = 0; i < n; i++) {\n    if (!rank.has(sorted[i])) { rank.set(sorted[i], next); next++; }\n  }\n  const size = next;\n  const tree = new Array(size + 1).fill(0);\n  const add = (i) => { for (let x = i + 1; x <= size; x += x & -x) tree[x] += 1; };\n  const prefix = (i) => {\n    let sum = 0;\n    for (let x = i + 1; x > 0; x -= x & -x) sum += tree[x];\n    return sum;\n  };\n  for (let i = n - 1; i >= 0; i--) {\n    const r = rank.get(nums[i]);\n    result[i] = prefix(r - 1);\n    add(r);\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "the worked example",
        body: "assert.deepEqual(countSmaller([5, 2, 6, 1]), [2, 1, 1, 0]);",
      },
      {
        name: "empty, single, and all equal",
        body: "assert.deepEqual(countSmaller([]), []);\nassert.deepEqual(countSmaller([-1]), [0]);\nassert.deepEqual(countSmaller([-1, -1]), [0, 0], 'equal does not count as smaller');\nassert.deepEqual(countSmaller([7, 7, 7, 7]), [0, 0, 0, 0]);",
      },
      {
        name: "sorted ascending and descending",
        body: "assert.deepEqual(countSmaller([1, 2, 3, 4, 5]), [0, 0, 0, 0, 0]);\nassert.deepEqual(countSmaller([5, 4, 3, 2, 1]), [4, 3, 2, 1, 0]);",
      },
      {
        name: "negatives and duplicates together",
        body: "assert.deepEqual(countSmaller([-1, -2, 0, -2, 3]), [2, 0, 1, 0, 0]);\nassert.deepEqual(countSmaller([2, 0, 1]), [2, 0, 0]);",
      },
      {
        name: "matches a brute force on a larger array",
        body: "const n = 300;\nconst nums = [];\nfor (let i = 0; i < n; i++) nums.push(((i * 137) % 91) - 45);\nconst brute = [];\nfor (let i = 0; i < n; i++) {\n  let c = 0;\n  for (let j = i + 1; j < n; j++) if (nums[j] < nums[i]) c++;\n  brute.push(c);\n}\nassert.deepEqual(countSmaller(nums), brute);",
      },
    ],
  },
{
    id: "ex-range-sum-query-2d-mutable",
    chapter: "dsa-segment-fenwick-trees",
    level: "advanced",
    title: "Range Sum Query 2D — Mutable",
    brief:
      "<p>Build a <code>NumMatrix</code> class over a rectangular grid of numbers that supports point updates and rectangle-sum queries.</p><ul><li><code>new NumMatrix(matrix)</code> — takes a copy of the grid</li><li><code>update(row, col, val)</code> — <b>replaces</b> that cell's value</li><li><code>sumRegion(row1, col1, row2, col2)</code> — the sum of the rectangle with those <b>inclusive</b> corners, where <code>row1 &lt;= row2</code> and <code>col1 &lt;= col2</code></li><li>Both operations should be <b>O(log rows * log cols)</b></li><li>Values may be negative</li></ul>",
    starter:
      "class NumMatrix {\n  constructor(matrix) {\n    // TODO: a Fenwick tree in each dimension\n  }\n  update(row, col, val) {}\n  sumRegion(row1, col1, row2, col2) {}\n}\n",
    hints: [
      "Start from the 1D Fenwick tree and nest it: the internal store is a (rows + 1) x (cols + 1) grid, and every operation runs the x += x & -x loop over rows with a second such loop over columns inside it.",
      "Define one private helper, prefix(row, col) = sum of the rectangle from (0, 0) to (row, col) inclusive, returning 0 when either coordinate is negative.",
      "Then inclusion-exclusion gives the answer: prefix(r2, c2) - prefix(r1 - 1, c2) - prefix(r2, c1 - 1) + prefix(r1 - 1, c1 - 1). Keep the raw values in a mirror grid so update can compute its delta.",
    ],
    solution:
      "class NumMatrix {\n  constructor(matrix) {\n    this.rows = matrix.length;\n    this.cols = this.rows > 0 ? matrix[0].length : 0;\n    this.values = [];\n    this.tree = [];\n    for (let i = 0; i <= this.rows; i++) this.tree.push(new Array(this.cols + 1).fill(0));\n    for (let i = 0; i < this.rows; i++) this.values.push(matrix[i].slice());\n    for (let i = 0; i < this.rows; i++) {\n      for (let j = 0; j < this.cols; j++) this._add(i, j, matrix[i][j]);\n    }\n  }\n  _add(row, col, delta) {\n    for (let x = row + 1; x <= this.rows; x += x & -x) {\n      for (let y = col + 1; y <= this.cols; y += y & -y) this.tree[x][y] += delta;\n    }\n  }\n  _prefix(row, col) {\n    let sum = 0;\n    for (let x = row + 1; x > 0; x -= x & -x) {\n      for (let y = col + 1; y > 0; y -= y & -y) sum += this.tree[x][y];\n    }\n    return sum;\n  }\n  update(row, col, val) {\n    const delta = val - this.values[row][col];\n    this.values[row][col] = val;\n    this._add(row, col, delta);\n  }\n  sumRegion(row1, col1, row2, col2) {\n    return this._prefix(row2, col2)\n      - this._prefix(row1 - 1, col2)\n      - this._prefix(row2, col1 - 1)\n      + this._prefix(row1 - 1, col1 - 1);\n  }\n}\n",
    tests: [
      {
        name: "rectangles before and after an update",
        body: "const nm = new NumMatrix([\n  [1, 2, 3],\n  [4, 5, 6],\n  [7, 8, 9],\n]);\nassert.equal(nm.sumRegion(0, 0, 2, 2), 45);\nassert.equal(nm.sumRegion(1, 1, 2, 2), 28);\nassert.equal(nm.sumRegion(0, 2, 0, 2), 3);\nnm.update(1, 1, 0);\nassert.equal(nm.sumRegion(0, 0, 2, 2), 40);\nassert.equal(nm.sumRegion(1, 1, 1, 1), 0);",
      },
      {
        name: "single cell matrix and negatives",
        body: "const one = new NumMatrix([[5]]);\nassert.equal(one.sumRegion(0, 0, 0, 0), 5);\none.update(0, 0, -3);\nassert.equal(one.sumRegion(0, 0, 0, 0), -3);\nconst neg = new NumMatrix([[-1, -2], [-3, -4]]);\nassert.equal(neg.sumRegion(0, 0, 1, 1), -10);\nassert.equal(neg.sumRegion(0, 1, 1, 1), -6);",
      },
      {
        name: "non-square grids and single rows or columns",
        body: "const nm = new NumMatrix([[1, 2, 3, 4], [5, 6, 7, 8]]);\nassert.equal(nm.sumRegion(0, 0, 0, 3), 10);\nassert.equal(nm.sumRegion(0, 2, 1, 2), 10);\nnm.update(0, 3, 40);\nassert.equal(nm.sumRegion(0, 0, 0, 3), 46);\nassert.equal(nm.sumRegion(0, 0, 1, 3), 72);",
      },
      {
        name: "updating replaces rather than accumulates",
        body: "const nm = new NumMatrix([[10, 10], [10, 10]]);\nnm.update(0, 0, 1);\nnm.update(0, 0, 2);\nnm.update(0, 0, 3);\nassert.equal(nm.sumRegion(0, 0, 0, 0), 3);\nassert.equal(nm.sumRegion(0, 0, 1, 1), 33);",
      },
      {
        name: "interleaved updates and queries match a brute-force mirror",
        body: "const rows = 12;\nconst cols = 9;\nconst grid = [];\nfor (let i = 0; i < rows; i++) {\n  const row = [];\n  for (let j = 0; j < cols; j++) row.push(((i * 7 + j * 13) % 31) - 15);\n  grid.push(row);\n}\nconst nm = new NumMatrix(grid);\nconst mirror = [];\nfor (let i = 0; i < rows; i++) mirror.push(grid[i].slice());\nlet seed = 31337;\nconst rnd = (m) => { seed = (seed * 48271) % 2147483647; return seed % m; };\nfor (let step = 0; step < 400; step++) {\n  if (step % 3 === 0) {\n    const r = rnd(rows);\n    const c = rnd(cols);\n    const v = rnd(100) - 50;\n    nm.update(r, c, v);\n    mirror[r][c] = v;\n  }\n  let r1 = rnd(rows);\n  let r2 = rnd(rows);\n  if (r1 > r2) { const t = r1; r1 = r2; r2 = t; }\n  let c1 = rnd(cols);\n  let c2 = rnd(cols);\n  if (c1 > c2) { const t = c1; c1 = c2; c2 = t; }\n  let expected = 0;\n  for (let i = r1; i <= r2; i++) for (let j = c1; j <= c2; j++) expected += mirror[i][j];\n  assert.equal(nm.sumRegion(r1, c1, r2, c2), expected, 'step ' + step);\n}",
      },
    ],
  },
{
    id: "ex-classify-growth-rate",
    chapter: "dsa-complexity-analysis",
    level: "beginner",
    title: "Classify a Function's Growth Rate",
    brief:
      '<p>Someone instrumented a function with an operation counter and handed you the numbers. Given <code>counts</code>, an array of <code>[n, operations]</code> samples, return the complexity class as a string.</p><ul><li>The answer is one of <code>"O(1)"</code>, <code>"O(log n)"</code>, <code>"O(n)"</code>, <code>"O(n log n)"</code>, <code>"O(n^2)"</code> — check them in <b>exactly that order</b></li><li>Their growth functions are <code>1</code>, <code>log2(n)</code>, <code>n</code>, <code>n * log2(n)</code>, <code>n * n</code></li><li>Scale a candidate <code>f</code> to the <b>first</b> sample: <code>c = counts[0][1] / f(counts[0][0])</code></li><li>The candidate <b>fits</b> when every sample <code>[n, ops]</code> satisfies <code>Math.abs(c * f(n) - ops) &lt;= 0.15 * ops</code> — a 15% tolerance, so that real measurements with a bit of noise still classify</li><li>Return the first candidate that fits; the data is always clean enough that one does</li><li><code>counts</code> has at least two samples and every <code>n</code> is at least 2</li></ul>',
    starter:
      "function classify(counts) {\n  // TODO: which growth curve, scaled to the first sample, tracks all the samples?\n}\n",
    hints: [
      "Do not try to reason about ratios between consecutive samples — just write down the five candidate curves as functions and test each one.",
      "For each candidate: work out the constant c that makes the curve pass exactly through the first sample, then check the remaining samples against that same c.",
      "The whole thing is a loop over five [name, fn] pairs with an inner loop over the samples and an early bail-out. Math.log2 gives you the base-2 logarithm.",
    ],
    solution:
      "function classify(counts) {\n  const candidates = [\n    ['O(1)', (n) => 1],\n    ['O(log n)', (n) => Math.log2(n)],\n    ['O(n)', (n) => n],\n    ['O(n log n)', (n) => n * Math.log2(n)],\n    ['O(n^2)', (n) => n * n],\n  ];\n  for (let c = 0; c < candidates.length; c++) {\n    const name = candidates[c][0];\n    const f = candidates[c][1];\n    const scale = counts[0][1] / f(counts[0][0]);\n    let fits = true;\n    for (let i = 0; i < counts.length; i++) {\n      const n = counts[i][0];\n      const ops = counts[i][1];\n      if (Math.abs(scale * f(n) - ops) > 0.15 * ops) { fits = false; break; }\n    }\n    if (fits) return name;\n  }\n  return 'O(n^2)';\n}\n",
    tests: [
      {
        name: "constant work",
        body: "assert.equal(classify([[10, 5], [100, 5], [1000, 5], [10000, 5]]), 'O(1)');\nassert.equal(classify([[8, 12], [64, 12]]), 'O(1)');",
      },
      {
        name: "logarithmic work",
        body: "assert.equal(classify([[16, 40], [256, 80], [4096, 120], [65536, 160]]), 'O(log n)');",
      },
      {
        name: "linear work, including slightly noisy samples",
        body: "assert.equal(classify([[100, 300], [200, 600], [400, 1200], [800, 2400]]), 'O(n)');\nassert.equal(classify([[100, 300], [200, 588], [400, 1230], [800, 2350]]), 'O(n)', 'noise inside 15% still classifies');",
      },
      {
        name: "linearithmic work",
        body: "assert.equal(classify([[64, 384], [256, 2048], [1024, 10240], [4096, 49152]]), 'O(n log n)');",
      },
      {
        name: "quadratic work",
        body: "assert.equal(classify([[10, 200], [20, 800], [40, 3200], [80, 12800]]), 'O(n^2)');\nassert.equal(classify([[100, 4950], [200, 19900], [400, 79800]]), 'O(n^2)', 'n(n-1)/2 is quadratic');",
      },
    ],
  },
{
    id: "ex-rewrite-nested-loop-linear",
    chapter: "dsa-complexity-analysis",
    level: "beginner",
    title: "Rewrite a Nested Loop as a Linear Scan",
    brief:
      "<p>The starter contains a working <code>hasPairSum(nums, target)</code>: it returns <code>true</code> when two <b>different</b> positions in <code>nums</code> hold values adding up to <code>target</code>. It is correct and it is <code>O(n^2)</code>. Rewrite it so it runs in <code>O(n)</code>, keeping the exact same behaviour.</p><ul><li>The two values must come from two different indices, but they may be equal values — <code>[3, 3]</code> with target <code>6</code> is <code>true</code></li><li>A single element can never pair with itself: <code>[4]</code> with target <code>8</code> is <code>false</code></li><li>Negative numbers and zero are allowed</li><li>One test runs 150,000 elements with no answer present. The quadratic version needs billions of comparisons there and will not finish — the linear one takes milliseconds</li></ul>",
    starter:
      "function hasPairSum(nums, target) {\n  // TODO: this is the O(n^2) version — make it O(n) without changing what it returns\n  for (let i = 0; i < nums.length; i++) {\n    for (let j = i + 1; j < nums.length; j++) {\n      if (nums[i] + nums[j] === target) return true;\n    }\n  }\n  return false;\n}\n",
    hints: [
      "The inner loop is answering one question over and over: 'is the value target - nums[i] somewhere else in the array?' Any structure that answers membership in O(1) removes it.",
      "Pass over the array once with a Set. For each value, ask whether its complement has already been seen; if not, add the value and move on.",
      "Checking BEFORE inserting is what keeps a single element from pairing with itself, while still letting a real duplicate pair up — [3, 3] with target 6 must stay true.",
    ],
    solution:
      "function hasPairSum(nums, target) {\n  const seen = new Set();\n  for (let i = 0; i < nums.length; i++) {\n    if (seen.has(target - nums[i])) return true;\n    seen.add(nums[i]);\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds and rejects small cases",
        body: "assert.equal(hasPairSum([2, 7, 11, 15], 9), true);\nassert.equal(hasPairSum([2, 7, 11, 15], 3), false);\nassert.equal(hasPairSum([1, 2, 3, 4], 7), true);",
      },
      {
        name: "an element cannot pair with itself",
        body: "assert.equal(hasPairSum([4], 8), false);\nassert.equal(hasPairSum([], 0), false);\nassert.equal(hasPairSum([5, 1], 10), false);",
      },
      {
        name: "duplicate values do pair",
        body: "assert.equal(hasPairSum([3, 3], 6), true);\nassert.equal(hasPairSum([0, 0], 0), true);\nassert.equal(hasPairSum([1, 3, 5, 3], 6), true);",
      },
      {
        name: "negatives and zero",
        body: "assert.equal(hasPairSum([-3, 8, 4], 1), true);\nassert.equal(hasPairSum([-5, -2, -9], -7), true);\nassert.equal(hasPairSum([-1, -2, -3], 5), false);",
      },
      {
        name: "150,000 elements with no answer — quadratic will not finish",
        body: "const n = 150000;\nconst nums = [];\nfor (let i = 0; i < n; i++) nums.push(i * 2);\nassert.equal(hasPairSum(nums, 3), false, 'every value is even, so an odd target is impossible');\nassert.equal(hasPairSum(nums, 2 * n - 4), true, 'the last two values do add up');",
      },
    ],
  },
{
    id: "ex-count-basic-operations",
    chapter: "dsa-complexity-analysis",
    level: "beginner",
    title: "Count the Comparisons Exactly",
    brief:
      "<p>Consider this shape, which shows up inside selection sort, bubble sort and every 'check all pairs' scan:</p><ul><li><code>for (let i = 0; i &lt; n; i++)</code></li><li><code>&nbsp;&nbsp;for (let j = i + 1; j &lt; n; j++)</code></li><li><code>&nbsp;&nbsp;&nbsp;&nbsp;// exactly one comparison happens here</code></li></ul><p>Write <code>countComparisons(n)</code> returning the <b>exact</b> number of comparisons performed — not a Big-O class, the precise count.</p><ul><li><code>n = 0</code> and <code>n = 1</code> both perform <code>0</code> comparisons</li><li>Return a plain number</li><li><code>n</code> can be in the hundreds of thousands, and the tests are strict about speed — so derive the closed form rather than actually running the two loops</li></ul>",
    starter: "function countComparisons(n) {\n  // TODO: the exact comparison count, in closed form\n}\n",
    hints: [
      "Count one outer iteration at a time. When i = 0 the inner loop runs n - 1 times, when i = 1 it runs n - 2 times, and so on down to 0 for the last i.",
      "So the total is (n - 1) + (n - 2) + ... + 1 + 0 — the sum of the first n - 1 whole numbers.",
      "That sum has a closed form: n * (n - 1) / 2. Multiplying before dividing keeps it an exact integer, and check that n = 0 does not slip through as a negative.",
    ],
    solution: "function countComparisons(n) {\n  if (n <= 1) return 0;\n  return (n * (n - 1)) / 2;\n}\n",
    tests: [
      {
        name: "small values, checked against the actual loops",
        body: "const brute = (n) => {\n  let c = 0;\n  for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) c++;\n  return c;\n};\nfor (let n = 0; n <= 40; n++) {\n  assert.equal(countComparisons(n), brute(n), 'wrong at n = ' + n);\n}",
      },
      {
        name: "the degenerate sizes",
        body: "assert.equal(countComparisons(0), 0);\nassert.equal(countComparisons(1), 0);\nassert.equal(countComparisons(2), 1);\nassert.type(countComparisons(5), 'number');",
      },
      {
        name: "known landmarks",
        body: "assert.equal(countComparisons(10), 45);\nassert.equal(countComparisons(100), 4950);\nassert.equal(countComparisons(1000), 499500);",
      },
      {
        name: "huge n must be instant, so the loops cannot be run",
        body: "assert.equal(countComparisons(200000), 19999900000);\nassert.equal(countComparisons(1000000), 499999500000);",
      },
    ],
  },
{
    id: "ex-pick-approach-from-constraint",
    chapter: "dsa-interview-strategy",
    level: "intermediate",
    title: "Read the Constraint, Pick the Complexity",
    brief:
      '<p>The single highest-leverage reflex in an interview: the stated bound on <code>n</code> already tells you which complexity the interviewer is fishing for. Roughly 10^8 basic operations fit in a second, so the input size pins down the shape of the answer before you have thought about the problem at all.</p><p>Write <code>pickApproach(n)</code> returning the intended complexity as a string:</p><ul><li><code>n &lt;= 20</code> — <code>"O(2^n) / bitmask"</code> (subsets are still affordable, so brute force over subsets is the point)</li><li><code>n &lt;= 300</code> — <code>"O(n^3)"</code> (think Floyd-Warshall or interval DP)</li><li><code>n &lt;= 5000</code> — <code>"O(n^2)"</code> (a two-dimensional DP table)</li><li><code>n &lt;= 1000000</code> — <code>"O(n log n)"</code> (sort, heap, or binary search on the answer)</li><li>anything larger — <code>"O(n)"</code> (one pass, maybe two pointers or a hash map)</li></ul><p>The bands are inclusive on their upper bound, so <code>n = 20</code> is the bitmask band and <code>n = 21</code> is the next one down.</p>',
    starter:
      "function pickApproach(n) {\n  // TODO: map the input size to the complexity the constraint is hinting at\n}\n",
    hints: [
      "This is a ladder of thresholds. Check them from the smallest bound upward and return on the first one that n fits inside.",
      "Watch the boundaries: each band is inclusive, so the comparison is n <= bound, not n < bound.",
      "Everything past the last bound falls through to the linear answer — no final comparison needed, just a return.",
    ],
    solution:
      "function pickApproach(n) {\n  if (n <= 20) return 'O(2^n) / bitmask';\n  if (n <= 300) return 'O(n^3)';\n  if (n <= 5000) return 'O(n^2)';\n  if (n <= 1000000) return 'O(n log n)';\n  return 'O(n)';\n}\n",
    tests: [
      {
        name: "tiny inputs mean exponential is fine",
        body: "assert.equal(pickApproach(1), 'O(2^n) / bitmask');\nassert.equal(pickApproach(12), 'O(2^n) / bitmask');\nassert.equal(pickApproach(20), 'O(2^n) / bitmask');",
      },
      {
        name: "the cubic and quadratic bands",
        body: "assert.equal(pickApproach(21), 'O(n^3)');\nassert.equal(pickApproach(300), 'O(n^3)');\nassert.equal(pickApproach(301), 'O(n^2)');\nassert.equal(pickApproach(5000), 'O(n^2)');",
      },
      {
        name: "sorting territory",
        body: "assert.equal(pickApproach(5001), 'O(n log n)');\nassert.equal(pickApproach(100000), 'O(n log n)');\nassert.equal(pickApproach(1000000), 'O(n log n)');",
      },
      {
        name: "beyond a million it has to be one pass",
        body: "assert.equal(pickApproach(1000001), 'O(n)');\nassert.equal(pickApproach(50000000), 'O(n)');\nassert.type(pickApproach(7), 'string');",
      },
    ],
  },
{
    id: "ex-feasible-approaches-under-constraints",
    chapter: "dsa-interview-strategy",
    level: "intermediate",
    title: "Which Approaches Actually Fit?",
    brief:
      '<p>You are given <code>approaches</code>, an array of objects <code>{ name, timeComplexity, spaceComplexity }</code>, and a <code>constraint</code> object <code>{ n, memoryMB }</code>. Return the <code>name</code>s of the approaches that fit the budget, in their <b>original order</b>.</p><ul><li>A complexity string is one of <code>"O(1)"</code>, <code>"O(log n)"</code>, <code>"O(n)"</code>, <code>"O(n log n)"</code>, <code>"O(n^2)"</code>, <code>"O(n^3)"</code>, <code>"O(2^n)"</code>, <code>"O(n!)"</code></li><li>Turn it into a number by substituting <code>constraint.n</code>, with logarithms base 2 — so <code>"O(n log n)"</code> at <code>n = 1000</code> is <code>1000 * Math.log2(1000)</code></li><li><b>Time budget:</b> the machine does <code>1e8</code> basic operations per second and you have 1 second, so the approach fits on time when its value is <code>&lt;= 1e8</code></li><li><b>Memory budget:</b> each unit of space costs 8 bytes and 1 MB is <code>1e6</code> bytes, so the approach fits on memory when <code>units * 8 &lt;= constraint.memoryMB * 1e6</code></li><li>Both budgets must hold. Comparisons are <code>&lt;=</code>, so landing exactly on the budget counts as fitting</li><li><code>O(2^n)</code> and <code>O(n!)</code> overflow to enormous values for even modest <code>n</code> — that is fine, they simply do not fit</li><li>An empty <code>approaches</code> array returns an empty array</li></ul>',
    starter:
      "function feasibleApproaches(approaches, constraint) {\n  // TODO: keep the approaches whose time AND space both fit the budget\n}\n",
    hints: [
      "Write one helper that turns a complexity string plus a value of n into a number. A chain of string comparisons is perfectly fine here — there are only eight cases.",
      "Factorial is the only awkward one: build it with a loop and bail out to Infinity once the product gets absurd, so you never spin for a large n.",
      "Then it is a single filter: evaluate the time string against 1e8 and the space string times 8 against memoryMB * 1e6, and collect the names of the survivors in order.",
    ],
    solution:
      "function feasibleApproaches(approaches, constraint) {\n  const n = constraint.n;\n  const evaluate = (complexity) => {\n    if (complexity === 'O(1)') return 1;\n    if (complexity === 'O(log n)') return Math.log2(n);\n    if (complexity === 'O(n)') return n;\n    if (complexity === 'O(n log n)') return n * Math.log2(n);\n    if (complexity === 'O(n^2)') return n * n;\n    if (complexity === 'O(n^3)') return n * n * n;\n    if (complexity === 'O(2^n)') return Math.pow(2, n);\n    if (complexity === 'O(n!)') {\n      let product = 1;\n      for (let i = 2; i <= n; i++) {\n        product *= i;\n        if (product > 1e300) return Infinity;\n      }\n      return product;\n    }\n    return Infinity;\n  };\n  const opsBudget = 1e8;\n  const byteBudget = constraint.memoryMB * 1e6;\n  const fitting = [];\n  for (let i = 0; i < approaches.length; i++) {\n    const a = approaches[i];\n    const ops = evaluate(a.timeComplexity);\n    const bytes = evaluate(a.spaceComplexity) * 8;\n    if (ops <= opsBudget && bytes <= byteBudget) fitting.push(a.name);\n  }\n  return fitting;\n}\n",
    tests: [
      {
        name: "drops the approach that is too slow",
        body: "const approaches = [\n  { name: 'brute force', timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' },\n  { name: 'floyd warshall', timeComplexity: 'O(n^3)', spaceComplexity: 'O(n^2)' },\n  { name: 'sort then scan', timeComplexity: 'O(n log n)', spaceComplexity: 'O(n)' },\n];\nconst got = feasibleApproaches(approaches, { n: 1000, memoryMB: 16 });\nassert.deepEqual(got, ['brute force', 'sort then scan'], 'n^3 is 1e9 operations');",
      },
      {
        name: "memory can be the thing that rules an approach out",
        body: "const approaches = [\n  { name: 'table dp', timeComplexity: 'O(n^2)', spaceComplexity: 'O(n^2)' },\n  { name: 'rolling dp', timeComplexity: 'O(n^2)', spaceComplexity: 'O(n)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 1000, memoryMB: 16 }), ['table dp', 'rolling dp'], '1e6 units is 8 MB');\nassert.deepEqual(feasibleApproaches(approaches, { n: 1000, memoryMB: 4 }), ['rolling dp'], '8 MB does not fit in 4 MB');",
      },
      {
        name: "exponential and factorial only survive a tiny n",
        body: "const approaches = [\n  { name: 'bitmask dp', timeComplexity: 'O(2^n)', spaceComplexity: 'O(2^n)' },\n  { name: 'permutations', timeComplexity: 'O(n!)', spaceComplexity: 'O(n)' },\n  { name: 'greedy', timeComplexity: 'O(n log n)', spaceComplexity: 'O(1)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 10, memoryMB: 64 }), ['bitmask dp', 'permutations', 'greedy']);\nassert.deepEqual(feasibleApproaches(approaches, { n: 40, memoryMB: 64 }), ['greedy'], '2^40 and 40! are both hopeless');",
      },
      {
        name: "order is preserved and nothing may fit",
        body: "const approaches = [\n  { name: 'c', timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },\n  { name: 'a', timeComplexity: 'O(1)', spaceComplexity: 'O(1)' },\n  { name: 'b', timeComplexity: 'O(log n)', spaceComplexity: 'O(1)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 1000000, memoryMB: 64 }), ['c', 'a', 'b']);\nassert.deepEqual(feasibleApproaches([], { n: 100, memoryMB: 1 }), []);\nconst heavy = [{ name: 'quadratic', timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' }];\nassert.deepEqual(feasibleApproaches(heavy, { n: 100000, memoryMB: 64 }), [], '1e10 operations is far past the budget');",
      },
      {
        name: "landing exactly on a budget counts as fitting",
        body: "const approaches = [\n  { name: 'exact time', timeComplexity: 'O(n^2)', spaceComplexity: 'O(1)' },\n  { name: 'exact memory', timeComplexity: 'O(n)', spaceComplexity: 'O(n)' },\n];\nassert.deepEqual(feasibleApproaches(approaches, { n: 10000, memoryMB: 0.08 }), ['exact time', 'exact memory'], '1e8 ops and 80000 bytes are both exactly on budget');",
      },
    ],
  },
{
    id: "ex-two-sum",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Two Sum",
    brief:
      "<p>You are given an array of integers <code>nums</code> and an integer <code>target</code>. Return the two <b>indices</b> whose values add up to <code>target</code>, as an array <code>[i, j]</code> with <code>i &lt; j</code>.</p><ul><li>Exactly one pair is guaranteed to work</li><li>You may not reuse the same index twice</li><li>Values may be negative, and may repeat</li></ul>",
    starter: "function twoSum(nums, target) {\n  // TODO: return the two indices whose values sum to target\n}\n",
    hints: [
      "The brute force is a nested loop, O(n^2). What would let you answer 'have I already seen target - x?' in constant time?",
      "Walk the array once. For each value, the number you need is target - value.",
      "Check the map for the complement BEFORE inserting the current value, so an element never pairs with itself.",
    ],
    solution:
      "function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n  return [];\n}\n",
    tests: [
      {
        name: "finds the pair at the front",
        body: "assert.deepEqual(twoSum([2,7,11,15], 9), [0,1]);",
      },
      {
        name: "works mid-array",
        body: "assert.deepEqual(twoSum([3,2,4], 6), [1,2]);",
      },
      {
        name: "handles duplicate values",
        body: "assert.deepEqual(twoSum([3,3], 6), [0,1]);",
      },
      {
        name: "handles negatives and a zero target",
        body: "assert.deepEqual(twoSum([-4,1,4,9], 0), [0,2]);",
      },
      {
        name: "uses the far ends of a long array",
        body: "assert.deepEqual(twoSum([1,2,3,4,5,6,7,8], 15), [6,7]);",
      },
    ],
  },
{
    id: "ex-best-time-to-buy-and-sell-stock",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Best Time to Buy and Sell Stock",
    brief:
      "<p><code>prices[i]</code> is the price of a stock on day <code>i</code>. You may buy on one day and sell on a <em>later</em> day, at most once. Return the largest profit you can make.</p><ul><li>If no transaction is profitable, return <code>0</code></li><li>You cannot sell before you buy</li><li>An empty array yields <code>0</code></li></ul>",
    starter: "function maxProfit(prices) {\n  // TODO: return the best profit from a single buy-then-sell\n}\n",
    hints: [
      "For any day you might sell on, the only thing that matters is the cheapest price seen before it.",
      "Sweep left to right carrying two running values: the minimum price so far, and the best profit so far.",
      "Update the answer with price - minSoFar, then update minSoFar.",
    ],
    solution:
      "function maxProfit(prices) {\n  let min = Infinity;\n  let best = 0;\n  for (const p of prices) {\n    if (p < min) min = p;\n    else if (p - min > best) best = p - min;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "buys the dip and sells the peak",
        body: "assert.equal(maxProfit([7,1,5,3,6,4]), 5);",
      },
      {
        name: "returns 0 when prices only fall",
        body: "assert.equal(maxProfit([7,6,4,3,1]), 0);",
      },
      {
        name: "handles a single day",
        body: "assert.equal(maxProfit([5]), 0);",
      },
      {
        name: "handles an empty array",
        body: "assert.equal(maxProfit([]), 0);",
      },
      {
        name: "finds the best profit late in the array",
        body: "assert.equal(maxProfit([3,2,6,5,0,3]), 4);",
      },
    ],
  },
{
    id: "ex-maximum-subarray",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Maximum Subarray",
    brief:
      "<p>Given an integer array <code>nums</code>, find the contiguous subarray with the largest sum and return that sum.</p><ul><li>The subarray must contain at least one element</li><li>Values may be negative — an all-negative array still has an answer</li><li>Aim for a single pass in O(n) time and O(1) extra space</li></ul>",
    starter: "function maxSubArray(nums) {\n  // TODO: return the largest sum of any contiguous subarray\n}\n",
    hints: [
      "Ask a smaller question: what is the best subarray that ENDS at index i?",
      "A running sum that has gone negative can only hurt whatever comes next — at that point you are better off starting over.",
      "Keep cur = max(nums[i], cur + nums[i]) and track the maximum cur you have ever seen.",
    ],
    solution:
      "function maxSubArray(nums) {\n  let cur = nums[0];\n  let best = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    cur = Math.max(nums[i], cur + nums[i]);\n    if (cur > best) best = cur;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic mixed array",
        body: "assert.equal(maxSubArray([-2,1,-3,4,-1,2,1,-5,4]), 6);",
      },
      {
        name: "single element",
        body: "assert.equal(maxSubArray([1]), 1);",
      },
      {
        name: "all positive means the whole array",
        body: "assert.equal(maxSubArray([5,4,-1,7,8]), 23);",
      },
      {
        name: "all negative picks the least bad element",
        body: "assert.equal(maxSubArray([-4,-2,-7,-3]), -2);",
      },
      {
        name: "does not mistake a negative dip for a reset",
        body: "assert.equal(maxSubArray([8,-1,9]), 16);",
      },
    ],
  },
{
    id: "ex-merge-sorted-array",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Merge Sorted Array In Place",
    brief:
      "<p><code>nums1</code> has <code>m</code> real values followed by <code>n</code> zeroes used as padding. <code>nums2</code> has <code>n</code> values. Both are sorted ascending. Merge <code>nums2</code> into <code>nums1</code> so that <code>nums1</code> ends up fully sorted.</p><ul><li>Mutate <code>nums1</code> directly — the return value is ignored</li><li>Use O(1) extra space; do not build a new array and copy it back</li><li>Either input may contribute zero elements</li></ul>",
    starter:
      "function merge(nums1, m, nums2, n) {\n  // TODO: merge nums2 into nums1 in place so nums1 ends up sorted\n}\n",
    hints: [
      "Writing from the front would overwrite values in nums1 you have not read yet.",
      "The tail of nums1 is free space. What if you filled it from the back, largest value first?",
      "Run three pointers: i at m-1, j at n-1, and a write pointer at m+n-1. Copy the larger of nums1[i] / nums2[j] and step back.",
    ],
    solution:
      "function merge(nums1, m, nums2, n) {\n  let i = m - 1;\n  let j = n - 1;\n  let w = m + n - 1;\n  while (j >= 0) {\n    if (i >= 0 && nums1[i] > nums2[j]) {\n      nums1[w] = nums1[i];\n      i--;\n    } else {\n      nums1[w] = nums2[j];\n      j--;\n    }\n    w--;\n  }\n  return nums1;\n}\n",
    tests: [
      {
        name: "mutates nums1 into the merged order",
        body: "const a = [1,2,3,0,0,0];\nmerge(a, 3, [2,5,6], 3);\nassert.deepEqual(a, [1,2,2,3,5,6]);",
      },
      {
        name: "handles an empty nums1 region",
        body: "const a = [0];\nmerge(a, 0, [7], 1);\nassert.deepEqual(a, [7]);",
      },
      {
        name: "handles an empty nums2",
        body: "const a = [4,9];\nmerge(a, 2, [], 0);\nassert.deepEqual(a, [4,9]);",
      },
      {
        name: "handles nums2 entirely smaller than nums1",
        body: "const a = [8,9,0,0,0];\nmerge(a, 2, [1,2,3], 3);\nassert.deepEqual(a, [1,2,3,8,9]);",
      },
      {
        name: "handles duplicates across both arrays",
        body: "const a = [2,2,0,0];\nmerge(a, 2, [2,2], 2);\nassert.deepEqual(a, [2,2,2,2]);",
      },
    ],
  },
{
    id: "ex-remove-duplicates-from-sorted-array",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Remove Duplicates from Sorted Array",
    brief:
      "<p>Given a sorted array <code>nums</code>, remove the repeated values <b>in place</b> so each distinct value appears once. Return <code>k</code>, the number of distinct values.</p><ul><li>The first <code>k</code> slots of <code>nums</code> must hold the distinct values in order</li><li>Whatever sits beyond index <code>k - 1</code> does not matter</li><li>Do not allocate a second array</li></ul>",
    starter:
      "function removeDuplicates(nums) {\n  // TODO: compact the distinct values to the front and return how many there are\n}\n",
    hints: [
      "Because the array is sorted, every duplicate sits directly next to its twin.",
      "Use two indices: a slow write pointer and a fast read pointer that scans ahead.",
      "Only advance the write pointer when nums[read] differs from the last value you wrote.",
    ],
    solution:
      "function removeDuplicates(nums) {\n  if (nums.length === 0) return 0;\n  let k = 1;\n  for (let i = 1; i < nums.length; i++) {\n    if (nums[i] !== nums[k - 1]) {\n      nums[k] = nums[i];\n      k++;\n    }\n  }\n  return k;\n}\n",
    tests: [
      {
        name: "returns the count and compacts the array",
        body: "const a = [1,1,2];\nconst k = removeDuplicates(a);\nassert.equal(k, 2);\nassert.deepEqual(a.slice(0, k), [1,2]);",
      },
      {
        name: "handles long runs of duplicates",
        body: "const a = [0,0,1,1,1,2,2,3,3,4];\nconst k = removeDuplicates(a);\nassert.equal(k, 5);\nassert.deepEqual(a.slice(0, k), [0,1,2,3,4]);",
      },
      {
        name: "leaves an already distinct array alone",
        body: "const a = [1,2,3];\nconst k = removeDuplicates(a);\nassert.equal(k, 3);\nassert.deepEqual(a.slice(0, k), [1,2,3]);",
      },
      {
        name: "collapses an all-same array to one element",
        body: "const a = [5,5,5,5];\nconst k = removeDuplicates(a);\nassert.equal(k, 1);\nassert.deepEqual(a.slice(0, k), [5]);",
      },
      {
        name: "handles an empty array",
        body: "assert.equal(removeDuplicates([]), 0);",
      },
    ],
  },
{
    id: "ex-rotate-array",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Rotate Array by K",
    brief:
      "<p>Rotate <code>nums</code> to the right by <code>k</code> steps, <b>in place</b>. Element at index <code>i</code> ends up at index <code>(i + k) % n</code>.</p><ul><li>Mutate the array itself; the return value is ignored</li><li><code>k</code> may be larger than the array length</li><li>Target O(1) extra space — a triple reversal does it</li></ul>",
    starter: "function rotate(nums, k) {\n  // TODO: rotate nums right by k steps, in place\n}\n",
    hints: [
      "First reduce k with k % nums.length — rotating by the full length changes nothing.",
      "Reversing the whole array puts the last k elements at the front, but each block is backwards.",
      "Reverse everything, then reverse the first k, then reverse the remaining n - k.",
    ],
    solution:
      "function rotate(nums, k) {\n  const n = nums.length;\n  if (n === 0) return nums;\n  k = ((k % n) + n) % n;\n  const reverse = (lo, hi) => {\n    while (lo < hi) {\n      const t = nums[lo];\n      nums[lo] = nums[hi];\n      nums[hi] = t;\n      lo++;\n      hi--;\n    }\n  };\n  reverse(0, n - 1);\n  reverse(0, k - 1);\n  reverse(k, n - 1);\n  return nums;\n}\n",
    tests: [
      {
        name: "rotates in place by 3",
        body: "const a = [1,2,3,4,5,6,7];\nrotate(a, 3);\nassert.deepEqual(a, [5,6,7,1,2,3,4]);",
      },
      {
        name: "handles k larger than the length",
        body: "const a = [1,2,3];\nrotate(a, 5);\nassert.deepEqual(a, [2,3,1]);",
      },
      {
        name: "k equal to the length leaves it unchanged",
        body: "const a = [-1,-100,3,99];\nrotate(a, 4);\nassert.deepEqual(a, [-1,-100,3,99]);",
      },
      {
        name: "rotating by 1 moves the tail to the front",
        body: "const a = [1,2];\nrotate(a, 1);\nassert.deepEqual(a, [2,1]);",
      },
      {
        name: "single element survives any k",
        body: "const a = [9];\nrotate(a, 7);\nassert.deepEqual(a, [9]);",
      },
    ],
  },
{
    id: "ex-product-of-array-except-self",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Product of Array Except Self",
    brief:
      "<p>Given <code>nums</code>, return an array <code>out</code> where <code>out[i]</code> is the product of every element <em>except</em> <code>nums[i]</code>.</p><ul><li>You may not use division — zeroes in the input would break it</li><li>Run in O(n) time</li><li>Handle one zero, two zeroes, and negative values correctly</li></ul>",
    starter: "function productExceptSelf(nums) {\n  // TODO: build the products without dividing\n}\n",
    hints: [
      "The answer at index i is (product of everything to its left) times (product of everything to its right).",
      "One forward pass can fill out[i] with the running product of the prefix.",
      "Then walk backwards with a single running suffix product and multiply it into each slot.",
    ],
    solution:
      "function productExceptSelf(nums) {\n  const n = nums.length;\n  const out = new Array(n).fill(1);\n  let prefix = 1;\n  for (let i = 0; i < n; i++) {\n    out[i] = prefix;\n    prefix *= nums[i];\n  }\n  let suffix = 1;\n  for (let i = n - 1; i >= 0; i--) {\n    out[i] *= suffix;\n    suffix *= nums[i];\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "basic case",
        body: "assert.deepEqual(productExceptSelf([1,2,3,4]), [24,12,8,6]);",
      },
      {
        name: "handles a single zero",
        body: "assert.deepEqual(productExceptSelf([-1,1,0,-3,3]), [0,0,9,0,0]);",
      },
      {
        name: "two zeroes make every product zero",
        body: "assert.deepEqual(productExceptSelf([0,0,4]), [0,0,0]);",
      },
      {
        name: "handles negatives",
        body: "assert.deepEqual(productExceptSelf([-1,-2,-3]), [6,3,2]);",
      },
      {
        name: "handles a two element array",
        body: "assert.deepEqual(productExceptSelf([5,7]), [7,5]);",
      },
    ],
  },
{
    id: "ex-majority-element",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Majority Element",
    brief:
      "<p>An array <code>nums</code> of length <code>n</code> contains one value that appears <b>more than</b> <code>n / 2</code> times. Return that value.</p><ul><li>The majority element always exists</li><li>A hash map works, but O(1) extra space is possible</li><li>Think about what happens if you cancel each majority vote against a different value</li></ul>",
    starter: "function majorityElement(nums) {\n  // TODO: return the value that appears more than n / 2 times\n}\n",
    hints: [
      "Pair up each occurrence of the majority value with a different value and discard both — something is always left over.",
      "Carry a candidate and a counter. When the counter hits zero, adopt the current value as the new candidate.",
      "Increment when the value matches the candidate, decrement otherwise. The final candidate is the answer.",
    ],
    solution:
      "function majorityElement(nums) {\n  let candidate = null;\n  let count = 0;\n  for (const x of nums) {\n    if (count === 0) candidate = x;\n    count += x === candidate ? 1 : -1;\n  }\n  return candidate;\n}\n",
    tests: [
      {
        name: "obvious majority",
        body: "assert.equal(majorityElement([3,2,3]), 3);",
      },
      {
        name: "majority is not the first element",
        body: "assert.equal(majorityElement([2,2,1,1,1,2,2]), 2);",
      },
      {
        name: "single element",
        body: "assert.equal(majorityElement([7]), 7);",
      },
      {
        name: "handles negative values",
        body: "assert.equal(majorityElement([-5,-5,4,-5,1]), -5);",
      },
      {
        name: "candidate gets reset mid-scan",
        body: "assert.equal(majorityElement([1,2,2,3,2,2,2]), 2);",
      },
    ],
  },
{
    id: "ex-move-zeroes",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Move Zeroes",
    brief:
      "<p>Move every <code>0</code> in <code>nums</code> to the end of the array, <b>in place</b>, while keeping the relative order of the non-zero values.</p><ul><li>Mutate the array; the return value is ignored</li><li>Do not create a copy</li><li>An array of all zeroes, or no zeroes at all, must still come out right</li></ul>",
    starter: "function moveZeroes(nums) {\n  // TODO: push all zeroes to the end in place, preserving order\n}\n",
    hints: [
      "Think of it as compaction: first get every non-zero value packed at the front in order.",
      "A slow write pointer plus a fast read pointer does this in one pass.",
      "After the scan, fill everything from the write pointer to the end with zeroes — or swap as you go.",
    ],
    solution:
      "function moveZeroes(nums) {\n  let w = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] !== 0) {\n      const t = nums[w];\n      nums[w] = nums[i];\n      nums[i] = t;\n      w++;\n    }\n  }\n  return nums;\n}\n",
    tests: [
      {
        name: "mutates the array, zeroes at the end",
        body: "const a = [0,1,0,3,12];\nmoveZeroes(a);\nassert.deepEqual(a, [1,3,12,0,0]);",
      },
      {
        name: "single zero stays a single zero",
        body: "const a = [0];\nmoveZeroes(a);\nassert.deepEqual(a, [0]);",
      },
      {
        name: "array with no zeroes is untouched",
        body: "const a = [4,-2,9];\nmoveZeroes(a);\nassert.deepEqual(a, [4,-2,9]);",
      },
      {
        name: "leading zeroes all shift back",
        body: "const a = [0,0,5,6];\nmoveZeroes(a);\nassert.deepEqual(a, [5,6,0,0]);",
      },
      {
        name: "all zeroes",
        body: "const a = [0,0,0];\nmoveZeroes(a);\nassert.deepEqual(a, [0,0,0]);",
      },
    ],
  },
{
    id: "ex-contains-duplicate",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Contains Duplicate",
    brief:
      "<p>Return <code>true</code> if any value appears at least twice in <code>nums</code>, and <code>false</code> if every element is distinct.</p><ul><li>Return an actual boolean, not a truthy value</li><li>An empty array has no duplicates</li><li>Aim for O(n) time</li></ul>",
    starter: "function containsDuplicate(nums) {\n  // TODO: return true if any value repeats\n}\n",
    hints: [
      "Sorting first makes duplicates adjacent, but that costs O(n log n).",
      "A Set remembers what you have already seen in O(1) per lookup.",
      "You can also just compare new Set(nums).size against nums.length.",
    ],
    solution:
      "function containsDuplicate(nums) {\n  const seen = new Set();\n  for (const x of nums) {\n    if (seen.has(x)) return true;\n    seen.add(x);\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "detects a repeat",
        body: "assert.equal(containsDuplicate([1,2,3,1]), true);",
      },
      {
        name: "all distinct",
        body: "assert.equal(containsDuplicate([1,2,3,4]), false);",
      },
      {
        name: "empty array",
        body: "assert.equal(containsDuplicate([]), false);",
      },
      {
        name: "single element",
        body: "assert.equal(containsDuplicate([9]), false);",
      },
      {
        name: "duplicate negatives far apart",
        body: "assert.equal(containsDuplicate([-3,5,7,8,-3]), true);",
      },
    ],
  },
{
    id: "ex-missing-number",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Find the Missing Number",
    brief:
      "<p><code>nums</code> holds <code>n</code> distinct numbers taken from the range <code>0..n</code>. Exactly one number from that range is absent — return it.</p><ul><li>The array is not necessarily sorted</li><li>The missing value can be <code>0</code> or <code>n</code> itself</li><li>O(n) time and O(1) extra space is achievable</li></ul>",
    starter: "function missingNumber(nums) {\n  // TODO: return the one value from 0..n that is not present\n}\n",
    hints: [
      "You know exactly what the sum of 0..n should be: n * (n + 1) / 2.",
      "Subtract the actual sum of the array from that expected total.",
      "XOR works too: XOR every index 0..n together with every value — the pairs cancel out.",
    ],
    solution:
      "function missingNumber(nums) {\n  const n = nums.length;\n  let total = (n * (n + 1)) / 2;\n  for (const x of nums) total -= x;\n  return total;\n}\n",
    tests: [
      {
        name: "missing from the middle",
        body: "assert.equal(missingNumber([3,0,1]), 2);",
      },
      {
        name: "missing the largest value",
        body: "assert.equal(missingNumber([0,1,2]), 3);",
      },
      {
        name: "missing zero",
        body: "assert.equal(missingNumber([1,2,3]), 0);",
      },
      {
        name: "single element array",
        body: "assert.equal(missingNumber([0]), 1);",
      },
      {
        name: "unsorted longer array",
        body: "assert.equal(missingNumber([9,6,4,2,3,5,7,0,1]), 8);",
      },
    ],
  },
{
    id: "ex-find-disappeared-numbers",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Find All Numbers Disappeared in an Array",
    brief:
      "<p><code>nums</code> has length <code>n</code> and every value lies in <code>1..n</code>, but some values repeat and others are missing. Return every value in <code>1..n</code> that does not appear, in ascending order.</p><ul><li>Return an empty array when nothing is missing</li><li>Duplicates in the input are expected</li><li>Bonus: solve it without a Set, using the array itself as the bookkeeping</li></ul>",
    starter:
      "function findDisappearedNumbers(nums) {\n  // TODO: return every value in 1..n that is absent from nums\n}\n",
    hints: [
      "Value v naturally belongs at index v - 1. That mapping is the whole trick.",
      "For each value, mark the slot it points at — negating nums[v - 1] is a marker you can undo.",
      "Any index that is still positive at the end was never pointed at, so index + 1 is missing.",
    ],
    solution:
      "function findDisappearedNumbers(nums) {\n  for (let i = 0; i < nums.length; i++) {\n    const idx = Math.abs(nums[i]) - 1;\n    if (nums[idx] > 0) nums[idx] = -nums[idx];\n  }\n  const out = [];\n  for (let i = 0; i < nums.length; i++) {\n    if (nums[i] > 0) out.push(i + 1);\n    else nums[i] = -nums[i];\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds both missing values",
        body: "assert.deepEqual(findDisappearedNumbers([4,3,2,7,8,2,3,1]), [5,6]);",
      },
      {
        name: "small case",
        body: "assert.deepEqual(findDisappearedNumbers([1,1]), [2]);",
      },
      {
        name: "nothing missing",
        body: "assert.deepEqual(findDisappearedNumbers([1,2,3]), []);",
      },
      {
        name: "single element that is missing its partner",
        body: "assert.deepEqual(findDisappearedNumbers([2,2]), [1]);",
      },
      {
        name: "all the same value",
        body: "assert.deepEqual(findDisappearedNumbers([3,3,3]), [1,2]);",
      },
    ],
  },
{
    id: "ex-sort-colors",
    chapter: "dsa-two-pointers",
    level: "intermediate",
    title: "Sort Colors",
    brief:
      "<p><code>nums</code> contains only the values <code>0</code>, <code>1</code> and <code>2</code>. Sort it <b>in place</b> so all the 0s come first, then the 1s, then the 2s.</p><ul><li>Mutate the array; the return value is ignored</li><li>Do it in a single pass with O(1) extra space</li><li>Counting each value and rewriting is two passes — aim better</li></ul>",
    starter: "function sortColors(nums) {\n  // TODO: sort the 0s, 1s and 2s in place in one pass\n}\n",
    hints: [
      "Maintain three regions: settled 0s at the front, settled 2s at the back, and unexplored space in between.",
      "Use pointers low, mid and high. mid is the element you are currently deciding about.",
      "Swapping a 2 into place brings back an unexamined value — so do NOT advance mid in that case.",
    ],
    solution:
      "function sortColors(nums) {\n  let low = 0;\n  let mid = 0;\n  let high = nums.length - 1;\n  const swap = (i, j) => {\n    const t = nums[i];\n    nums[i] = nums[j];\n    nums[j] = t;\n  };\n  while (mid <= high) {\n    if (nums[mid] === 0) {\n      swap(low, mid);\n      low++;\n      mid++;\n    } else if (nums[mid] === 2) {\n      swap(mid, high);\n      high--;\n    } else {\n      mid++;\n    }\n  }\n  return nums;\n}\n",
    tests: [
      {
        name: "mutates a mixed array into sorted order",
        body: "const a = [2,0,2,1,1,0];\nsortColors(a);\nassert.deepEqual(a, [0,0,1,1,2,2]);",
      },
      {
        name: "handles a reversed array",
        body: "const a = [2,1,0];\nsortColors(a);\nassert.deepEqual(a, [0,1,2]);",
      },
      {
        name: "already sorted stays sorted",
        body: "const a = [0,0,1,2,2];\nsortColors(a);\nassert.deepEqual(a, [0,0,1,2,2]);",
      },
      {
        name: "handles a missing colour",
        body: "const a = [2,0,0,2];\nsortColors(a);\nassert.deepEqual(a, [0,0,2,2]);",
      },
      {
        name: "single element",
        body: "const a = [1];\nsortColors(a);\nassert.deepEqual(a, [1]);",
      },
    ],
  },
{
    id: "ex-next-permutation",
    chapter: "dsa-two-pointers",
    level: "advanced",
    title: "Next Permutation",
    brief:
      "<p>Rearrange <code>nums</code> <b>in place</b> into the next lexicographically larger permutation of the same values. If the array is already the largest possible arrangement, rearrange it into the smallest (fully ascending) one.</p><ul><li>Mutate the array; the return value is ignored</li><li>Use O(1) extra space — no generating all permutations</li><li>Duplicate values must be handled correctly</li></ul>",
    starter:
      "function nextPermutation(nums) {\n  // TODO: rearrange nums in place into the next larger permutation\n}\n",
    hints: [
      "Scan from the right: a suffix that is non-increasing is already at its maximum arrangement.",
      "Find the rightmost index i where nums[i] < nums[i + 1] — that is the only digit worth raising.",
      "Swap nums[i] with the smallest value to its right that still exceeds it, then reverse the suffix so it is as small as possible.",
    ],
    solution:
      "function nextPermutation(nums) {\n  const n = nums.length;\n  const swap = (i, j) => {\n    const t = nums[i];\n    nums[i] = nums[j];\n    nums[j] = t;\n  };\n  const reverse = (lo, hi) => {\n    while (lo < hi) swap(lo++, hi--);\n  };\n  let i = n - 2;\n  while (i >= 0 && nums[i] >= nums[i + 1]) i--;\n  if (i >= 0) {\n    let j = n - 1;\n    while (nums[j] <= nums[i]) j--;\n    swap(i, j);\n  }\n  reverse(i + 1, n - 1);\n  return nums;\n}\n",
    tests: [
      {
        name: "steps to the next permutation",
        body: "const a = [1,2,3];\nnextPermutation(a);\nassert.deepEqual(a, [1,3,2]);",
      },
      {
        name: "wraps the largest arrangement back to the smallest",
        body: "const a = [3,2,1];\nnextPermutation(a);\nassert.deepEqual(a, [1,2,3]);",
      },
      {
        name: "handles a duplicate pivot value",
        body: "const a = [1,1,5];\nnextPermutation(a);\nassert.deepEqual(a, [1,5,1]);",
      },
      {
        name: "reverses the suffix, not just swaps",
        body: "const a = [1,3,5,4,2];\nnextPermutation(a);\nassert.deepEqual(a, [1,4,2,3,5]);",
      },
      {
        name: "single element is unchanged",
        body: "const a = [7];\nnextPermutation(a);\nassert.deepEqual(a, [7]);",
      },
    ],
  },
{
    id: "ex-trapping-rain-water",
    chapter: "dsa-two-pointers",
    level: "advanced",
    title: "Trapping Rain Water",
    brief:
      "<p><code>height[i]</code> is the height of a bar of width 1. After it rains, water settles in the dips between bars. Return the total units of water trapped.</p><ul><li>Water above bar <code>i</code> is <code>min(tallest to its left, tallest to its right) - height[i]</code></li><li>Never negative — a bar taller than both walls traps nothing</li><li>Two pointers get this in O(n) time and O(1) space</li></ul>",
    starter: "function trap(height) {\n  // TODO: return the total units of trapped water\n}\n",
    hints: [
      "Work out the water column above each bar independently, then add them up.",
      "Precomputing leftMax[] and rightMax[] arrays solves it in O(n) space — get that working first.",
      "To drop to O(1): walk two pointers inward, and always process the side whose running max is smaller — that side's total is already decided.",
    ],
    solution:
      "function trap(height) {\n  let lo = 0;\n  let hi = height.length - 1;\n  let leftMax = 0;\n  let rightMax = 0;\n  let total = 0;\n  while (lo < hi) {\n    if (height[lo] < height[hi]) {\n      leftMax = Math.max(leftMax, height[lo]);\n      total += leftMax - height[lo];\n      lo++;\n    } else {\n      rightMax = Math.max(rightMax, height[hi]);\n      total += rightMax - height[hi];\n      hi--;\n    }\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "classic skyline",
        body: "assert.equal(trap([0,1,0,2,1,0,1,3,2,1,2,1]), 6);",
      },
      {
        name: "deep single basin",
        body: "assert.equal(trap([4,2,0,3,2,5]), 9);",
      },
      {
        name: "a monotonic slope traps nothing",
        body: "assert.equal(trap([1,2,3,4]), 0);",
      },
      {
        name: "too few bars to hold water",
        body: "assert.equal(trap([2,5]), 0);",
      },
      {
        name: "empty input",
        body: "assert.equal(trap([]), 0);",
      },
    ],
  },
{
    id: "ex-container-with-most-water",
    chapter: "dsa-two-pointers",
    level: "intermediate",
    title: "Container With Most Water",
    brief:
      "<p><code>height[i]</code> is the height of a vertical line at position <code>i</code>. Pick two lines so that the container they form with the x-axis holds the most water, and return that area.</p><ul><li>Area is <code>(j - i) * min(height[i], height[j])</code></li><li>The container cannot be tilted</li><li>Beat the O(n^2) double loop</li></ul>",
    starter: "function maxArea(height) {\n  // TODO: return the largest area between any two lines\n}\n",
    hints: [
      "Start with the widest possible container: one pointer at each end.",
      "Moving either pointer inward always loses width, so the only way to win is to gain height.",
      "Move the pointer at the SHORTER line — keeping it can never produce a bigger area.",
    ],
    solution:
      "function maxArea(height) {\n  let lo = 0;\n  let hi = height.length - 1;\n  let best = 0;\n  while (lo < hi) {\n    const h = Math.min(height[lo], height[hi]);\n    const area = h * (hi - lo);\n    if (area > best) best = area;\n    if (height[lo] < height[hi]) lo++;\n    else hi--;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic case",
        body: "assert.equal(maxArea([1,8,6,2,5,4,8,3,7]), 49);",
      },
      {
        name: "two lines only",
        body: "assert.equal(maxArea([1,1]), 1);",
      },
      {
        name: "widest pair wins when heights are equal",
        body: "assert.equal(maxArea([4,4,4,4]), 12);",
      },
      {
        name: "tall lines at the extremes",
        body: "assert.equal(maxArea([9,1,1,1,9]), 36);",
      },
      {
        name: "a single line holds nothing",
        body: "assert.equal(maxArea([5]), 0);",
      },
    ],
  },
];
