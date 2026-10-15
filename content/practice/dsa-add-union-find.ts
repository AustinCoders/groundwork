import type { Exercise } from "../types";

export const dsaAddUnionFind: Exercise[] = [
  {
    "id": "ex-number-of-islands-ii",
    "chapter": "dsa-union-find",
    "level": "advanced",
    "title": "Number of Islands II",
    "brief": "<p>An <code>m x n</code> grid starts as all water. You are given <code>positions</code>, a list of <code>[row, col]</code> cells that turn into land one at a time, in order. After <b>each</b> position is added, report the number of islands. An island is a group of land cells connected horizontally or vertically.</p><ul><li>A <code>DSU</code> class with <code>find(x)</code>, <code>union(a, b)</code> (returns <code>false</code> when they were already together), <code>setSize(x)</code> and a <code>components</code> counter is already provided</li><li>A position may repeat; a repeated position changes nothing and repeats the previous count</li><li>Return an array with one number per position</li><li>A grid with <code>m * n</code> up to 10^5 and as many positions: rescanning the grid after every position is too slow</li></ul>",
    "starter": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction numIslands2(m, n, positions) {\n  // TODO: index a cell as row * n + col, and keep your own islands counter\n}\n",
    "hints": [
      "Re-running a flood fill after every position is O(m * n) each time. Use union-find so one new land cell costs at most four unions.",
      "When a cell becomes land, add 1 to the island count, then look at its four neighbours. Every neighbour that is land AND was in a different set (union returned true) lowers the count by 1.",
      "The DSU's own components counter counts water cells too, so keep a separate islands counter. Ignore a position that is already land, and index with row * n + col using the column count n."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction numIslands2(m, n, positions) {\n  const dsu = new DSU(m * n);\n  const isLand = new Uint8Array(m * n);\n  let islands = 0;\n  const answer = [];\n  for (const [r, c] of positions) {\n    const id = r * n + c;\n    if (!isLand[id]) {\n      isLand[id] = 1;\n      islands++;\n      for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n        const nr = r + dr;\n        const nc = c + dc;\n        if (nr < 0 || nr >= m || nc < 0 || nc >= n) continue;\n        const neighbour = nr * n + nc;\n        if (isLand[neighbour] && dsu.union(id, neighbour)) islands--;\n      }\n    }\n    answer.push(islands);\n  }\n  return answer;\n}\n",
    "tests": [
      {
        "name": "separate cells, then one that joins three islands",
        "body": "assert.deepEqual(numIslands2(3, 3, [[0, 0], [0, 2], [1, 1], [0, 1], [0, 1]]), [1, 2, 3, 1, 1]);"
      },
      {
        "name": "the classic 3 x 3 example",
        "body": "assert.deepEqual(numIslands2(3, 3, [[0, 0], [0, 1], [1, 2], [2, 1]]), [1, 1, 2, 3]);"
      },
      {
        "name": "a single cell grid",
        "body": "assert.deepEqual(numIslands2(1, 1, [[0, 0]]), [1]);"
      },
      {
        "name": "no positions gives an empty answer",
        "body": "assert.deepEqual(numIslands2(2, 2, []), []);"
      },
      {
        "name": "a repeated position does not add an island",
        "body": "assert.deepEqual(numIslands2(2, 2, [[0, 0], [0, 0], [1, 1]]), [1, 1, 2]);"
      },
      {
        "name": "a rectangular grid with more columns than rows",
        "body": "assert.deepEqual(numIslands2(1, 5, [[0, 4], [0, 0], [0, 2], [0, 1], [0, 3]]), [1, 2, 3, 2, 1]);"
      },
      {
        "name": "a rectangular grid with more rows than columns",
        "body": "assert.deepEqual(numIslands2(5, 1, [[4, 0], [0, 0], [2, 0], [1, 0], [3, 0]]), [1, 2, 3, 2, 1]);"
      },
      {
        "name": "matches a flood fill after every position on a random grid 1",
        "body": "assert.deepEqual(numIslands2(3, 2, [[2, 1], [2, 1], [2, 1], [2, 1], [2, 1], [0, 1], [1, 1]]), [1, 1, 1, 1, 1, 2, 1]);"
      },
      {
        "name": "matches a flood fill after every position on a random grid 2",
        "body": "assert.deepEqual(numIslands2(2, 3, [[0, 0], [0, 2], [1, 0], [1, 2], [1, 2], [0, 0], [0, 1], [0, 2], [1, 0], [1, 0]]), [1, 2, 2, 2, 2, 2, 1, 1, 1, 1]);"
      },
      {
        "name": "matches a flood fill after every position on a random grid 3",
        "body": "assert.deepEqual(numIslands2(3, 2, [[1, 1], [2, 1], [1, 0], [1, 0], [1, 0], [0, 0], [1, 0], [2, 1], [2, 1], [0, 0], [2, 0]]), [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]);"
      },
      {
        "name": "100000 cells and 100000 positions finish quickly",
        "body": "const m = 400;\nconst n = 250;\nconst positions = [];\nfor (let i = 0; i < m * n; i++) positions.push([Math.floor(i / n), i % n]);\nconst result = numIslands2(m, n, positions);\nassert.equal(result.length, m * n);\nassert.equal(result[0], 1);\nassert.equal(result[m * n - 1], 1);"
      }
    ]
  },
  {
    "id": "ex-most-stones-removed",
    "chapter": "dsa-union-find",
    "level": "intermediate",
    "title": "Most Stones Removed with Same Row or Column",
    "brief": "<p>Stones are placed at distinct integer points of a 2D plane, given as <code>stones[i] = [row, col]</code>. A stone may be removed if there is <b>another stone still on the board</b> in the same row or the same column. Return the largest number of stones that can be removed.</p><ul><li>A <code>DSU</code> class with <code>find(x)</code>, <code>union(a, b)</code> (returns <code>false</code> when they were already together), <code>setSize(x)</code> and a <code>components</code> counter is already provided</li><li>The coordinates are not small enough to build a grid from; think about rows and columns as elements</li><li>One stone, or stones that share nothing, give <code>0</code></li><li>Up to 1000 stones</li></ul>",
    "starter": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction removeStones(stones) {\n  // TODO: make every row and every column an element, and let each stone join its row to its column\n}\n",
    "hints": [
      "Stones that share a row or a column are linked. Within one linked group you can remove stones one by one until a single stone is left, and you can never remove that last one.",
      "So the answer is (number of stones) - (number of groups). Count groups with union-find.",
      "Union the stones' rows and columns instead of the stones: give each distinct row and each distinct column its own id (a row and a column with the same number are different elements) and union row-id with column-id for every stone."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction removeStones(stones) {\n  const rowId = new Map();\n  const colId = new Map();\n  let next = 0;\n  const links = [];\n  for (const [r, c] of stones) {\n    if (!rowId.has(r)) rowId.set(r, next++);\n    if (!colId.has(c)) colId.set(c, next++);\n    links.push([rowId.get(r), colId.get(c)]);\n  }\n  const dsu = new DSU(next);\n  for (const [a, b] of links) dsu.union(a, b);\n  return stones.length - dsu.components;\n}\n",
    "tests": [
      {
        "name": "all six stones are linked",
        "body": "assert.equal(removeStones([[0, 0], [0, 1], [1, 0], [1, 2], [2, 1], [2, 2]]), 5);"
      },
      {
        "name": "a stone in the middle shares nothing",
        "body": "assert.equal(removeStones([[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]]), 3);"
      },
      {
        "name": "one stone cannot be removed",
        "body": "assert.equal(removeStones([[0, 0]]), 0);"
      },
      {
        "name": "two stones on one row",
        "body": "assert.equal(removeStones([[3, 5], [3, 9]]), 1);"
      },
      {
        "name": "stones on a diagonal share nothing",
        "body": "assert.equal(removeStones([[0, 0], [1, 1], [2, 2], [3, 3]]), 0);"
      },
      {
        "name": "a row number equal to a column number is not a link",
        "body": "assert.equal(removeStones([[1, 5], [5, 1]]), 0);"
      },
      {
        "name": "an L shape of three stones",
        "body": "assert.equal(removeStones([[0, 0], [0, 1], [1, 0]]), 2);"
      },
      {
        "name": "matches an exhaustive removal search on a random board 1",
        "body": "assert.equal(removeStones([[0, 4], [4, 2], [0, 3], [2, 4], [1, 0], [2, 2], [1, 3]]), 6);"
      },
      {
        "name": "matches an exhaustive removal search on a random board 2",
        "body": "assert.equal(removeStones([[0, 2], [2, 1], [3, 2], [2, 4], [0, 4], [3, 4], [1, 0], [3, 0], [3, 1]]), 8);"
      },
      {
        "name": "matches an exhaustive removal search on a random board 3",
        "body": "assert.equal(removeStones([[3, 2], [1, 2], [2, 2], [4, 1], [4, 4], [4, 2], [2, 0], [3, 0]]), 7);"
      },
      {
        "name": "1000 stones on a staircase are all linked",
        "body": "const stones = [];\nfor (let i = 0; i < 500; i++) { stones.push([i, i]); stones.push([i, i + 1]); }\nassert.equal(removeStones(stones), 999);"
      }
    ]
  },
  {
    "id": "ex-smallest-string-with-swaps",
    "chapter": "dsa-union-find",
    "level": "intermediate",
    "title": "Smallest String With Swaps",
    "brief": "<p>You are given a string <code>s</code> and an array <code>pairs</code> of index pairs. You may swap the characters at the two indices of <b>any pair, any number of times</b>. Return the lexicographically smallest string you can obtain.</p><ul><li>A <code>DSU</code> class with <code>find(x)</code>, <code>union(a, b)</code> (returns <code>false</code> when they were already together), <code>setSize(x)</code> and a <code>components</code> counter is already provided</li><li>Pairs may repeat or share indices; indices are 0-based and valid</li><li>No pairs means the string cannot change</li><li>Up to 100000 characters and pairs</li></ul>",
    "starter": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction smallestStringWithSwaps(s, pairs) {\n  // TODO: union the pairs, then sort the letters inside each group\n}\n",
    "hints": [
      "Treat indices as nodes and pairs as edges. Swaps along a connected group let you arrange its letters in any order, and nothing ever leaves the group.",
      "So for each group, the best arrangement puts the smallest letter at the group's earliest index, the next smallest at the next index, and so on.",
      "Union the pairs, collect the indices of each root in increasing order (scan i from 0), sort the group's letters, and write them back index by index."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction smallestStringWithSwaps(s, pairs) {\n  const n = s.length;\n  const dsu = new DSU(n);\n  for (const [a, b] of pairs) dsu.union(a, b);\n  const groups = new Map();\n  for (let i = 0; i < n; i++) {\n    const root = dsu.find(i);\n    if (!groups.has(root)) groups.set(root, []);\n    groups.get(root).push(i);\n  }\n  const out = new Array(n);\n  for (const indices of groups.values()) {\n    const letters = indices.map((i) => s[i]).sort();\n    indices.forEach((position, k) => {\n      out[position] = letters[k];\n    });\n  }\n  return out.join('');\n}\n",
    "tests": [
      {
        "name": "two separate groups",
        "body": "assert.equal(smallestStringWithSwaps(\"dcab\", [[0, 3], [1, 2]]), \"bacd\");"
      },
      {
        "name": "a third pair joins the groups",
        "body": "assert.equal(smallestStringWithSwaps(\"dcab\", [[0, 3], [1, 2], [0, 2]]), \"abcd\");"
      },
      {
        "name": "a chain of swaps moves a letter far",
        "body": "assert.equal(smallestStringWithSwaps(\"cba\", [[0, 1], [1, 2]]), \"abc\");"
      },
      {
        "name": "no pairs leaves the string unchanged",
        "body": "assert.equal(smallestStringWithSwaps(\"zyx\", []), \"zyx\");"
      },
      {
        "name": "a single character",
        "body": "assert.equal(smallestStringWithSwaps(\"q\", []), \"q\");"
      },
      {
        "name": "a repeated pair changes nothing extra",
        "body": "assert.equal(smallestStringWithSwaps(\"ba\", [[0, 1], [1, 0], [0, 1]]), \"ab\");"
      },
      {
        "name": "a pair of an index with itself",
        "body": "assert.equal(smallestStringWithSwaps(\"ba\", [[0, 0]]), \"ba\");"
      },
      {
        "name": "matches a search over reachable strings on a random case 1",
        "body": "assert.equal(smallestStringWithSwaps(\"bdbbd\", [[4, 2]]), \"bdbbd\");"
      },
      {
        "name": "matches a search over reachable strings on a random case 2",
        "body": "assert.equal(smallestStringWithSwaps(\"bdcdad\", [[1, 0], [0, 4], [2, 3], [4, 4]]), \"abcddd\");"
      },
      {
        "name": "matches a search over reachable strings on a random case 3",
        "body": "assert.equal(smallestStringWithSwaps(\"bbdd\", [[3, 3], [3, 1], [3, 1], [3, 0], [2, 1]]), \"bbdd\");"
      },
      {
        "name": "100000 characters in one group come out sorted",
        "body": "const n = 100000;\nlet s = '';\nconst letters = 'zyxwvutsrqponmlkjihgfedcba';\nconst parts = [];\nfor (let i = 0; i < n; i++) parts.push(letters[i % 26]);\ns = parts.join('');\nconst pairs = [];\nfor (let i = 1; i < n; i++) pairs.push([i - 1, i]);\nconst result = smallestStringWithSwaps(s, pairs);\nassert.equal(result, parts.slice().sort().join(''));"
      }
    ]
  },
  {
    "id": "ex-largest-component-common-factor",
    "chapter": "dsa-union-find",
    "level": "advanced",
    "title": "Largest Component Size by Common Factor",
    "brief": "<p>You are given an array <code>nums</code> of positive integers. Build a graph with one node per number, and connect two numbers when they share a <b>common factor greater than 1</b>. Return the size of the largest connected component.</p><ul><li>A <code>DSU</code> class with <code>find(x)</code>, <code>union(a, b)</code> (returns <code>false</code> when they were already together), <code>setSize(x)</code> and a <code>components</code> counter is already provided</li><li>Comparing every pair with <code>gcd</code> is O(n^2) and too slow for 20000 numbers</li><li>The number <code>1</code> shares a factor with nothing</li><li>Values go up to 100000</li></ul>",
    "starter": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction largestComponentSize(nums) {\n  // TODO: union each number with each of its prime factors\n}\n",
    "hints": [
      "Two numbers share a factor greater than 1 exactly when they share a prime factor. So connect each number to its primes instead of comparing pairs of numbers.",
      "Keep a Map from prime to the index of the first number that had it. The next number with the same prime unions with that index.",
      "Find factors by trial division with p * p <= x, dividing each prime out completely. What remains above 1 is itself a prime, and must be linked too. The answer is the largest set size."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction largestComponentSize(nums) {\n  const dsu = new DSU(nums.length);\n  const owner = new Map();\n  function link(index, prime) {\n    if (owner.has(prime)) dsu.union(index, owner.get(prime));\n    else owner.set(prime, index);\n  }\n  for (let i = 0; i < nums.length; i++) {\n    let x = nums[i];\n    for (let p = 2; p * p <= x; p++) {\n      if (x % p !== 0) continue;\n      link(i, p);\n      while (x % p === 0) x /= p;\n    }\n    if (x > 1) link(i, x);\n  }\n  let best = 0;\n  for (let i = 0; i < nums.length; i++) best = Math.max(best, dsu.setSize(i));\n  return best;\n}\n",
    "tests": [
      {
        "name": "a chain 4 - 6 - 15 - 35",
        "body": "assert.equal(largestComponentSize([4, 6, 15, 35]), 4);"
      },
      {
        "name": "two pairs",
        "body": "assert.equal(largestComponentSize([20, 50, 9, 63]), 2);"
      },
      {
        "name": "eight numbers joined through 2, 3, 7 and 13",
        "body": "assert.equal(largestComponentSize([2, 3, 6, 7, 4, 12, 21, 39]), 8);"
      },
      {
        "name": "all primes are separate",
        "body": "assert.equal(largestComponentSize([2, 3, 5, 7, 11]), 1);"
      },
      {
        "name": "one is alone",
        "body": "assert.equal(largestComponentSize([1, 2, 4]), 2);"
      },
      {
        "name": "a single number",
        "body": "assert.equal(largestComponentSize([97]), 1);"
      },
      {
        "name": "a large prime factor left after trial division",
        "body": "assert.equal(largestComponentSize([199982, 299973, 5]), 2);"
      },
      {
        "name": "duplicate values join each other",
        "body": "assert.equal(largestComponentSize([6, 6, 7]), 2);"
      },
      {
        "name": "matches a pairwise gcd search on a random array 1",
        "body": "assert.equal(largestComponentSize([111, 153, 168, 32, 92, 173, 113, 106]), 6);"
      },
      {
        "name": "matches a pairwise gcd search on a random array 2",
        "body": "assert.equal(largestComponentSize([142, 118, 88, 37, 39, 6, 114, 148, 27, 107, 68, 2]), 11);"
      },
      {
        "name": "matches a pairwise gcd search on a random array 3",
        "body": "assert.equal(largestComponentSize([124, 4, 68, 42, 182, 183, 12, 196, 176, 181, 170, 21, 23, 171]), 12);"
      },
      {
        "name": "20000 numbers finish quickly",
        "body": "const nums = [];\nfor (let i = 0; i < 20000; i++) nums.push(2 + i * 4);\nassert.equal(largestComponentSize(nums), 20000);"
      }
    ]
  },
  {
    "id": "ex-evaluate-division-weighted-dsu",
    "chapter": "dsa-union-find",
    "level": "advanced",
    "title": "Evaluate Division (weighted union-find)",
    "brief": "<p>You are given equations of the form <code>A / B = value</code> as <code>equations[i] = [A, B]</code> with <code>values[i]</code>, where every variable is a string and the equations never contradict each other. Answer each query <code>[C, D]</code> with the value of <code>C / D</code>, or <code>-1.0</code> if it cannot be determined.</p><ul><li>A query about a variable that never appears in any equation is <code>-1</code>, even <code>x / x</code></li><li>A known variable divided by itself is <code>1</code></li><li>Answers are compared with a tolerance of 0.00001</li><li>Solve it with a union-find that stores, for every variable, its ratio to its parent (no DSU class is provided: the ratio must live in the structure)</li><li>A recursive <code>find</code> follows the whole chain, so merge the smaller set under the larger</li></ul>",
    "starter": "function calcEquation(equations, values, queries) {\n  // TODO: ratio[x] = value(x) / value(parent of x); update it when you compress a path\n}\n",
    "hints": [
      "Store for every variable x the ratio ratio[x] = value(x) / value(parent[x]), so the root of a set is the yardstick and every other variable is a multiple of it.",
      "When find(x) re-points x at the root, the new ratio is ratio[x] * ratio[parent], where ratio[parent] has just been brought up to date by the recursive find.",
      "To record A / B = v: find both roots ra and rb, hang ra under rb with ratio[ra] = v * ratio[B] / ratio[A]. To answer C / D: both must exist and share a root, and the answer is ratio[C] / ratio[D] after both finds."
    ],
    "solution": "function calcEquation(equations, values, queries) {\n  const parent = new Map();\n  const ratio = new Map();\n  const size = new Map();\n  function add(x) {\n    if (!parent.has(x)) {\n      parent.set(x, x);\n      ratio.set(x, 1);\n      size.set(x, 1);\n    }\n  }\n  function find(x) {\n    const p = parent.get(x);\n    if (p === x) return x;\n    const root = find(p);\n    ratio.set(x, ratio.get(x) * ratio.get(p));\n    parent.set(x, root);\n    return root;\n  }\n  function union(a, b, value) {\n    const ra = find(a);\n    const rb = find(b);\n    if (ra === rb) return;\n    const r = (value * ratio.get(b)) / ratio.get(a);\n    if (size.get(ra) <= size.get(rb)) {\n      parent.set(ra, rb);\n      ratio.set(ra, r);\n      size.set(rb, size.get(rb) + size.get(ra));\n    } else {\n      parent.set(rb, ra);\n      ratio.set(rb, 1 / r);\n      size.set(ra, size.get(ra) + size.get(rb));\n    }\n  }\n  equations.forEach(([a, b], i) => {\n    add(a);\n    add(b);\n    union(a, b, values[i]);\n  });\n  return queries.map(([a, b]) => {\n    if (!parent.has(a) || !parent.has(b)) return -1;\n    if (find(a) !== find(b)) return -1;\n    return ratio.get(a) / ratio.get(b);\n  });\n}\n",
    "tests": [
      {
        "name": "chained equations and an unknown variable",
        "body": "const got = calcEquation([[\"a\", \"b\"], [\"b\", \"c\"]], [2, 3], [[\"a\", \"c\"], [\"b\", \"a\"], [\"a\", \"e\"], [\"a\", \"a\"], [\"x\", \"x\"]]);\nconst want = [6, 0.5, -1, 1, -1];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "two separate components",
        "body": "const got = calcEquation([[\"a\", \"b\"], [\"c\", \"d\"]], [2, 4], [[\"a\", \"d\"], [\"a\", \"b\"], [\"d\", \"c\"]]);\nconst want = [-1, 2, 0.25];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "the same pair stated twice",
        "body": "const got = calcEquation([[\"a\", \"b\"], [\"a\", \"b\"]], [2, 2], [[\"b\", \"a\"]]);\nconst want = [0.5];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "a longer chain is resolved through compression",
        "body": "const got = calcEquation([[\"a\", \"b\"], [\"b\", \"c\"], [\"c\", \"d\"], [\"d\", \"e\"]], [2, 2, 2, 2], [[\"a\", \"e\"], [\"e\", \"a\"], [\"b\", \"d\"]]);\nconst want = [16, 0.0625, 4];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "equations given in an order that merges two big sets",
        "body": "const got = calcEquation([[\"a\", \"b\"], [\"c\", \"d\"], [\"b\", \"c\"]], [2, 3, 5], [[\"a\", \"d\"], [\"d\", \"a\"]]);\nconst want = [30, 0.03333333333333333];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "fractional values",
        "body": "const got = calcEquation([[\"x1\", \"x2\"], [\"x2\", \"x3\"]], [0.5, 0.25], [[\"x1\", \"x3\"], [\"x3\", \"x1\"]]);\nconst want = [0.125, 8];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "no queries",
        "body": "const got = calcEquation([[\"a\", \"b\"]], [3], []);\nconst want = [];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "matches a graph search on a random system 1",
        "body": "const got = calcEquation([[\"c\", \"a\"], [\"b\", \"f\"]], [0.2857142857142857, 2], [[\"d\", \"b\"], [\"f\", \"c\"], [\"b\", \"a\"], [\"e\", \"a\"], [\"a\", \"f\"], [\"f\", \"d\"]]);\nconst want = [-1, -1, -1, -1, -1, -1];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "matches a graph search on a random system 2",
        "body": "const got = calcEquation([[\"c\", \"a\"], [\"b\", \"e\"], [\"f\", \"e\"], [\"b\", \"c\"]], [0.2222222222222222, 0.4444444444444444, 1, 2], [[\"f\", \"c\"], [\"b\", \"d\"], [\"e\", \"f\"], [\"d\", \"c\"], [\"b\", \"b\"], [\"b\", \"a\"]]);\nconst want = [4.5, -1, 1, -1, 1, 0.4444444444444444];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      },
      {
        "name": "matches a graph search on a random system 3",
        "body": "const got = calcEquation([[\"a\", \"f\"], [\"c\", \"a\"], [\"f\", \"c\"], [\"f\", \"d\"], [\"e\", \"b\"]], [1, 0.8888888888888888, 1.125, 2.25, 0.75], [[\"c\", \"f\"], [\"e\", \"b\"], [\"e\", \"b\"], [\"a\", \"c\"], [\"b\", \"c\"], [\"c\", \"b\"]]);\nconst want = [0.8888888888888888, 0.75, 0.75, 1.125, -1, -1];\nassert.equal(got.length, want.length);\nwant.forEach((w, i) => assert.ok(Math.abs(got[i] - w) < 1e-5, 'query ' + i + ' expected ' + w + ' but got ' + got[i]));"
      }
    ]
  },
  {
    "id": "ex-redundant-connection-ii",
    "chapter": "dsa-union-find",
    "level": "advanced",
    "title": "Redundant Connection II",
    "brief": "<p>A <b>rooted tree</b> has <code>n</code> nodes labelled <code>1</code> to <code>n</code>, with every edge directed from parent to child. One extra directed edge was added, so the graph now has <code>n</code> edges, given in <code>edges</code>. Return the edge to remove so that what is left is a rooted tree on all <code>n</code> nodes. If several edges work, return the one that appears <b>last</b> in the input.</p><ul><li>A <code>DSU</code> class with <code>find(x)</code>, <code>union(a, b)</code> (returns <code>false</code> when they were already together), <code>setSize(x)</code> and a <code>components</code> counter is already provided</li><li>The extra edge can create a node with two parents, a cycle, or both</li><li>Plain union-find ignores direction, so deal with the two-parent case first</li><li>Edges are distinct and never connect a node to itself</li></ul>",
    "starter": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction findRedundantDirectedConnection(edges) {\n  // TODO: look for a node with two parents, then run union-find without the later of the two edges\n}\n",
    "hints": [
      "Scan the edges and record the parent of every node. If a node gets a second parent, remember both edges: first (the earlier one) and second (the later one).",
      "Rebuild the graph with second skipped and run union-find. Now every node has at most one parent, so a failed union really means a cycle.",
      "If a union fails: answer first when a two-parent node exists (the cycle goes through it), otherwise the edge that failed. If nothing fails, the answer is second."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction findRedundantDirectedConnection(edges) {\n  const n = edges.length;\n  const parentOf = new Array(n + 1).fill(0);\n  let first = null;\n  let second = null;\n  for (const [u, v] of edges) {\n    if (parentOf[v] !== 0) {\n      first = [parentOf[v], v];\n      second = [u, v];\n    } else {\n      parentOf[v] = u;\n    }\n  }\n  const dsu = new DSU(n + 1);\n  for (const [u, v] of edges) {\n    if (second && u === second[0] && v === second[1]) continue;\n    if (!dsu.union(u, v)) return first ? first : [u, v];\n  }\n  return second;\n}\n",
    "tests": [
      {
        "name": "a node with two parents and no cycle",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[1, 2], [1, 3], [2, 3]]), [2, 3]);"
      },
      {
        "name": "a node with two parents and a cycle through the earlier edge",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[2, 1], [3, 1], [4, 2], [1, 4]]), [2, 1]);"
      },
      {
        "name": "a cycle and no node with two parents",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[1, 2], [2, 3], [3, 4], [4, 1], [1, 5]]), [4, 1]);"
      },
      {
        "name": "a two-node cycle",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[1, 2], [2, 1]]), [2, 1]);"
      },
      {
        "name": "the same two-node cycle in the other order",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[2, 1], [1, 2]]), [1, 2]);"
      },
      {
        "name": "a self-contained cycle among the descendants of the root",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[1, 2], [2, 3], [3, 2]]), [3, 2]);"
      },
      {
        "name": "matches removing each edge in turn on a random graph 1",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[8, 1], [7, 2], [7, 4], [6, 4], [5, 8], [1, 3], [7, 5], [7, 6]]), [6, 4]);"
      },
      {
        "name": "matches removing each edge in turn on a random graph 2",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[4, 1], [2, 4], [1, 4], [2, 3]]), [1, 4]);"
      },
      {
        "name": "matches removing each edge in turn on a random graph 3",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[3, 4], [1, 5], [4, 1], [3, 2], [3, 5]]), [3, 5]);"
      },
      {
        "name": "matches removing each edge in turn on a random graph 4",
        "body": "assert.deepEqual(findRedundantDirectedConnection([[1, 3], [3, 1], [1, 2]]), [3, 1]);"
      },
      {
        "name": "a long chain with the extra edge closing it",
        "body": "const n = 20000;\nconst edges = [];\nfor (let i = 1; i < n; i++) edges.push([i, i + 1]);\nedges.push([n, 1]);\nassert.deepEqual(findRedundantDirectedConnection(edges), [n, 1]);"
      }
    ]
  },
  {
    "id": "ex-bricks-falling-when-hit",
    "chapter": "dsa-union-find",
    "level": "advanced",
    "title": "Bricks Falling When Hit",
    "brief": "<p>A <code>grid</code> of 1 (brick) and 0 (empty). A brick is <b>stable</b> if it is in the top row or is adjacent (up, down, left, right) to a stable brick. The starting grid is stable. You are given <code>hits</code>, a list of <code>[row, col]</code> cells erased one after another: a hit removes the brick there if there is one, and then every brick that is no longer stable falls and disappears. Return an array where <code>result[i]</code> is the number of bricks that <b>fall</b> because of hit <code>i</code> (not counting the brick that was hit).</p><ul><li>A <code>DSU</code> class with <code>find(x)</code>, <code>union(a, b)</code> (returns <code>false</code> when they were already together), <code>setSize(x)</code> and a <code>components</code> counter is already provided</li><li>A hit on an empty cell, or on a cell already cleared, drops nothing: <code>0</code></li><li>Union-find cannot split a set, so think of the hits in reverse order</li><li>Do not modify the input grid</li></ul>",
    "starter": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction hitBricks(grid, hits) {\n  // TODO: remove all the hits first, build the sets, then add the bricks back in reverse order\n}\n",
    "hints": [
      "Deleting is hard for union-find, but adding is easy. Start from the grid after ALL hits and play the hits backwards, restoring one brick at a time.",
      "Add a virtual node ROOF (index rows * cols) and union it with every brick in the top row. The number of stable bricks is the size of the ROOF's set minus 1.",
      "When restoring a brick, read the ROOF set size before, attach the brick to the ROOF (if it is in row 0) and to its four brick neighbours, read the size after. The bricks that had fallen are max(0, after - before - 1). Record at the start which hits really removed a brick; the others restore nothing."
    ],
    "solution": "class DSU {\n  constructor(n) {\n    this.parent = Array.from({ length: n }, (_, i) => i);\n    this.size = new Array(n).fill(1);\n    this.components = n;\n  }\n\n  find(x) {\n    let root = x;\n    while (this.parent[root] !== root) root = this.parent[root];\n    while (this.parent[x] !== root) {\n      const next = this.parent[x];\n      this.parent[x] = root;\n      x = next;\n    }\n    return root;\n  }\n\n  union(a, b) {\n    let ra = this.find(a);\n    let rb = this.find(b);\n    if (ra === rb) return false;\n    if (this.size[ra] < this.size[rb]) [ra, rb] = [rb, ra];\n    this.parent[rb] = ra;\n    this.size[ra] += this.size[rb];\n    this.components--;\n    return true;\n  }\n\n  setSize(x) {\n    return this.size[this.find(x)];\n  }\n}\n\nfunction hitBricks(grid, hits) {\n  const R = grid.length;\n  const C = grid[0].length;\n  const ROOF = R * C;\n  const g = grid.map((row) => row.slice());\n  const removed = hits.map(([r, c]) => {\n    const wasBrick = g[r][c] === 1;\n    g[r][c] = 0;\n    return wasBrick;\n  });\n  const dsu = new DSU(R * C + 1);\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  function attach(r, c) {\n    const id = r * C + c;\n    if (r === 0) dsu.union(id, ROOF);\n    for (const [dr, dc] of dirs) {\n      const nr = r + dr;\n      const nc = c + dc;\n      if (nr >= 0 && nr < R && nc >= 0 && nc < C && g[nr][nc] === 1) dsu.union(id, nr * C + nc);\n    }\n  }\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) if (g[r][c] === 1) attach(r, c);\n  }\n  const answer = new Array(hits.length).fill(0);\n  for (let i = hits.length - 1; i >= 0; i--) {\n    if (!removed[i]) continue;\n    const [r, c] = hits[i];\n    const before = dsu.setSize(ROOF);\n    g[r][c] = 1;\n    attach(r, c);\n    const after = dsu.setSize(ROOF);\n    answer[i] = Math.max(0, after - before - 1);\n  }\n  return answer;\n}\n",
    "tests": [
      {
        "name": "removing a base brick drops two",
        "body": "assert.deepEqual(hitBricks([[1, 0, 0, 0], [1, 1, 1, 0]], [[1, 0]]), [2]);"
      },
      {
        "name": "the second hit has a second route to the top",
        "body": "assert.deepEqual(hitBricks([[1, 0, 0, 0], [1, 1, 0, 0]], [[1, 1], [1, 0]]), [0, 0]);"
      },
      {
        "name": "a hit on an empty cell drops nothing",
        "body": "assert.deepEqual(hitBricks([[1, 0], [1, 1]], [[0, 1]]), [0]);"
      },
      {
        "name": "the same cell hit twice",
        "body": "assert.deepEqual(hitBricks([[1, 1], [1, 1], [0, 1]], [[1, 0], [1, 0]]), [0, 0]);"
      },
      {
        "name": "hitting the top row can bring down a column",
        "body": "assert.deepEqual(hitBricks([[1], [1], [1]], [[0, 0]]), [2]);"
      },
      {
        "name": "a single brick in the top row",
        "body": "assert.deepEqual(hitBricks([[1]], [[0, 0]]), [0]);"
      },
      {
        "name": "no hits",
        "body": "assert.deepEqual(hitBricks([[1, 1], [1, 0]], []), []);"
      },
      {
        "name": "matches a falling simulation on a random grid 1",
        "body": "assert.deepEqual(hitBricks([[1, 1, 1, 1, 1], [0, 1, 1, 1, 1], [1, 1, 1, 1, 0]], [[1, 1], [1, 4], [0, 0]]), [0, 0, 0]);"
      },
      {
        "name": "matches a falling simulation on a random grid 2",
        "body": "assert.deepEqual(hitBricks([[0, 1, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0]], [[2, 2], [2, 1], [0, 0], [0, 1]]), [0, 0, 0, 0]);"
      },
      {
        "name": "matches a falling simulation on a random grid 3",
        "body": "assert.deepEqual(hitBricks([[0, 0, 1, 1], [1, 1, 1, 0], [0, 1, 0, 0]], [[0, 0], [2, 3], [0, 3], [2, 1]]), [0, 0, 0, 0]);"
      },
      {
        "name": "matches a falling simulation on a random grid 4",
        "body": "assert.deepEqual(hitBricks([[0, 1, 0], [0, 1, 1], [1, 1, 0], [1, 1, 1], [1, 0, 1]], [[0, 2], [1, 0], [2, 2], [3, 2]]), [0, 0, 0, 1]);"
      },
      {
        "name": "the input grid is left unchanged",
        "body": "const grid = [[1, 1, 0], [1, 1, 1], [0, 1, 0]];\nconst copy = grid.map((row) => row.slice());\nhitBricks(grid, [[1, 1], [0, 0]]);\nassert.deepEqual(grid, copy);"
      }
    ]
  }
];
