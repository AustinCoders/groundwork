import type { Exercise } from "../types";

export const dsa4: Exercise[] = [
{
    id: "ex-unique-paths",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Unique Paths",
    brief:
      "<p>A robot starts in the top-left cell of an <code>m x n</code> grid and wants to reach the bottom-right cell. It may only move <b>right</b> or <b>down</b>. Return how many distinct paths there are.</p><ul><li><code>uniquePaths(3, 7)</code> is <code>28</code></li><li>A single row or a single column has exactly <code>1</code> path</li><li><code>m</code> is the number of rows and <code>n</code> the number of columns</li></ul>",
    starter:
      "function uniquePaths(m, n) {\n  // TODO: count the right/down paths from the top-left to the bottom-right\n}\n",
    hints: [
      "You can only arrive at a cell from the cell above it or the cell to its left, so paths(r, c) = paths(r-1, c) + paths(r, c-1).",
      "The whole top row and the whole left column have exactly one path each — that is your base case, and it also handles a 1 x n grid for free.",
      "Fill a table row by row from the top-left. You can even collapse it to a single row of length n, adding the value on the left into each slot in place.",
    ],
    solution:
      "function uniquePaths(m, n) {\n  const row = new Array(n).fill(1);\n  for (let r = 1; r < m; r++) {\n    for (let c = 1; c < n; c++) {\n      row[c] = row[c] + row[c - 1];\n    }\n  }\n  return row[n - 1];\n}\n",
    tests: [
      {
        name: "three by seven",
        body: "assert.equal(uniquePaths(3, 7), 28);",
      },
      {
        name: "three by two",
        body: "assert.equal(uniquePaths(3, 2), 3);",
      },
      {
        name: "a single cell",
        body: "assert.equal(uniquePaths(1, 1), 1);",
      },
      {
        name: "a single row or column",
        body: "assert.equal(uniquePaths(1, 10), 1);\nassert.equal(uniquePaths(10, 1), 1);",
      },
      {
        name: "a square grid",
        body: "assert.equal(uniquePaths(10, 10), 48620);",
      },
      { name: "a two by two grid", body: "assert.equal(uniquePaths(2, 2), 2);" },
      { name: "swapping rows and columns gives the same answer", body: "assert.equal(uniquePaths(7, 3), 28);" },
      { name: "a four by four grid", body: "assert.equal(uniquePaths(4, 4), 20);" },
    ],
  },
{
    id: "ex-unique-paths-ii",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Unique Paths II",
    brief:
      "<p>Same right-and-down robot, but now the grid <code>obstacleGrid</code> marks blocked cells with <code>1</code> and free cells with <code>0</code>. Return the number of distinct paths from the top-left to the bottom-right.</p><ul><li>The robot may never enter a blocked cell</li><li>If the start or the finish is blocked, the answer is <code>0</code></li><li>An obstacle in the top row blocks everything to its right in that row, and likewise down the left column</li></ul>",
    starter:
      "function uniquePathsWithObstacles(obstacleGrid) {\n  // TODO: count right/down paths that avoid every cell marked 1\n}\n",
    hints: [
      "Same recurrence as Unique Paths — a cell's count is the sum of the counts above and to the left — with one extra rule.",
      "A blocked cell simply has a count of 0. Set it to 0 before the additions and the zero propagates on its own; you do not need special row or column logic.",
      "Seed the start cell with 1 (or 0 if it is blocked). Using a single rolling row works here too, as long as you zero out blocked positions as you pass them.",
    ],
    solution:
      "function uniquePathsWithObstacles(obstacleGrid) {\n  const rows = obstacleGrid.length;\n  if (rows === 0) return 0;\n  const cols = obstacleGrid[0].length;\n  if (cols === 0) return 0;\n  const row = new Array(cols).fill(0);\n  row[0] = obstacleGrid[0][0] === 1 ? 0 : 1;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (obstacleGrid[r][c] === 1) {\n        row[c] = 0;\n      } else if (c > 0) {\n        row[c] = row[c] + row[c - 1];\n      }\n    }\n  }\n  return row[cols - 1];\n}\n",
    tests: [
      {
        name: "one obstacle in the middle",
        body: "const grid = [\n  [0,0,0],\n  [0,1,0],\n  [0,0,0],\n];\nassert.equal(uniquePathsWithObstacles(grid), 2);",
      },
      {
        name: "obstacle forces a single route",
        body: "assert.equal(uniquePathsWithObstacles([[0,1],[0,0]]), 1);",
      },
      {
        name: "blocked start or finish",
        body: "assert.equal(uniquePathsWithObstacles([[1]]), 0);\nassert.equal(uniquePathsWithObstacles([[0,0],[0,1]]), 0);",
      },
      {
        name: "a wall across the grid",
        body: "const grid = [\n  [0,0],\n  [1,1],\n  [0,0],\n];\nassert.equal(uniquePathsWithObstacles(grid), 0);",
      },
      {
        name: "no obstacles behaves like Unique Paths",
        body: "const grid = [\n  [0,0,0],\n  [0,0,0],\n  [0,0,0],\n];\nassert.equal(uniquePathsWithObstacles(grid), 6);\nassert.equal(uniquePathsWithObstacles([[0]]), 1);",
      },
      { name: "single row with an obstacle blocks everything past it", body: "assert.equal(uniquePathsWithObstacles([[0,1,0]]), 0);" },
      { name: "single column with an obstacle blocks everything below it", body: "assert.equal(uniquePathsWithObstacles([[0],[1],[0]]), 0);" },
      { name: "an obstacle blocks the down-first route but not right-first", body: "assert.equal(uniquePathsWithObstacles([[0,0],[1,0]]), 1);" },
    ],
  },
{
    id: "ex-minimum-path-sum",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Minimum Path Sum",
    brief:
      "<p>Given a <code>grid</code> of non-negative numbers, find a path from the top-left to the bottom-right that minimises the sum of the numbers along it, and return that sum.</p><ul><li>You may only move <b>right</b> or <b>down</b></li><li>Both the start and the finish cells count towards the total</li><li>A greedy 'always step to the smaller neighbour' rule is <em>not</em> correct</li></ul>",
    starter: "function minPathSum(grid) {\n  // TODO: smallest sum along a right/down path to the bottom-right\n}\n",
    hints: [
      "The cheapest way to stand on a cell is its own value plus the cheaper of the two ways of arriving: from above or from the left.",
      "The top row and left column have only one way in, so each is just a running total — compute those first as base cases.",
      "Fill the rest row by row. You can overwrite the grid itself, or keep one rolling row of length cols.",
    ],
    solution:
      "function minPathSum(grid) {\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const row = new Array(cols).fill(0);\n  row[0] = grid[0][0];\n  for (let c = 1; c < cols; c++) row[c] = row[c - 1] + grid[0][c];\n  for (let r = 1; r < rows; r++) {\n    row[0] = row[0] + grid[r][0];\n    for (let c = 1; c < cols; c++) {\n      row[c] = Math.min(row[c], row[c - 1]) + grid[r][c];\n    }\n  }\n  return row[cols - 1];\n}\n",
    tests: [
      {
        name: "the classic three by three",
        body: "const grid = [\n  [1,3,1],\n  [1,5,1],\n  [4,2,1],\n];\nassert.equal(minPathSum(grid), 7);",
      },
      {
        name: "two by three",
        body: "assert.equal(minPathSum([[1,2,3],[4,5,6]]), 12);",
      },
      {
        name: "a single cell",
        body: "assert.equal(minPathSum([[5]]), 5);",
      },
      {
        name: "single row and single column",
        body: "assert.equal(minPathSum([[1,2,3]]), 6);\nassert.equal(minPathSum([[1],[2],[3]]), 6);",
      },
      {
        name: "the greedy first step is the wrong one",
        body: "const grid = [\n  [1,2,100],\n  [1,100,100],\n  [1,1,1],\n];\nassert.equal(minPathSum(grid), 5);",
      },
      { name: "several equally cheap paths still give the true minimum", body: "assert.equal(minPathSum([[1,1],[1,1]]), 3);" },
      { name: "an all-zero grid costs nothing", body: "assert.equal(minPathSum([[0,0],[0,0]]), 0);" },
      { name: "a larger grid with a non-obvious cheap route", body: "assert.equal(minPathSum([[1,2,3],[4,8,2],[1,5,3]]), 11);" },
    ],
  },
{
    id: "ex-longest-common-subsequence",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Longest Common Subsequence",
    brief:
      "<p>Given two strings <code>a</code> and <code>b</code>, return the length of their longest common subsequence.</p><ul><li>A subsequence keeps the original order but may skip characters — <code>'ace'</code> is a subsequence of <code>'abcde'</code></li><li>It does <b>not</b> have to be contiguous, which is what separates this from longest common substring</li><li>If the two strings share nothing, return <code>0</code></li></ul>",
    starter:
      "function longestCommonSubsequence(a, b) {\n  // TODO: length of the longest subsequence common to both strings\n}\n",
    hints: [
      "Let table[i][j] be the answer for the first i characters of a and the first j characters of b. Any row or column of index 0 is 0, since an empty string shares nothing.",
      "When a[i-1] === b[j-1] those characters can be paired up: table[i][j] = table[i-1][j-1] + 1.",
      "When they differ you must drop one of them, so take max(table[i-1][j], table[i][j-1]). Fill the table left to right, top to bottom, and read the bottom-right corner.",
    ],
    solution:
      "function longestCommonSubsequence(a, b) {\n  const rows = a.length;\n  const cols = b.length;\n  let previous = new Array(cols + 1).fill(0);\n  for (let i = 1; i <= rows; i++) {\n    const current = new Array(cols + 1).fill(0);\n    for (let j = 1; j <= cols; j++) {\n      if (a[i - 1] === b[j - 1]) current[j] = previous[j - 1] + 1;\n      else current[j] = Math.max(previous[j], current[j - 1]);\n    }\n    previous = current;\n  }\n  return previous[cols];\n}\n",
    tests: [
      {
        name: "ace inside abcde",
        body: "assert.equal(longestCommonSubsequence('abcde', 'ace'), 3);",
      },
      {
        name: "identical strings",
        body: "assert.equal(longestCommonSubsequence('abc', 'abc'), 3);",
      },
      {
        name: "nothing in common",
        body: "assert.equal(longestCommonSubsequence('abc', 'def'), 0);",
      },
      {
        name: "empty strings",
        body: "assert.equal(longestCommonSubsequence('', 'abc'), 0);\nassert.equal(longestCommonSubsequence('abc', ''), 0);",
      },
      {
        name: "a single shared letter, far apart",
        body: "assert.equal(longestCommonSubsequence('bsbininm', 'jmjkbkjkv'), 1);\nassert.equal(longestCommonSubsequence('bl', 'yby'), 1);",
      },
      { name: "one string is fully contained in order inside the other", body: "assert.equal(longestCommonSubsequence('abcdef', 'acf'), 3);" },
      { name: "repeated characters cap the match at the shorter run", body: "assert.equal(longestCommonSubsequence('aaaa', 'aa'), 2);" },
      { name: "single character strings", body: "assert.equal(longestCommonSubsequence('a', 'a'), 1);\nassert.equal(longestCommonSubsequence('a', 'b'), 0);" },
    ],
  },
{
    id: "ex-edit-distance",
    chapter: "dsa-dp-2d",
    level: "advanced",
    title: "Edit Distance",
    brief:
      "<p>Given two strings <code>word1</code> and <code>word2</code>, return the minimum number of operations needed to turn <code>word1</code> into <code>word2</code>.</p><ul><li>The allowed operations are <b>insert a character</b>, <b>delete a character</b> and <b>replace a character</b>, each costing 1</li><li>Turning <code>'horse'</code> into <code>'ros'</code> takes <code>3</code></li><li>If one string is empty the answer is the length of the other</li><li>Identical strings cost <code>0</code></li></ul>",
    starter:
      "function minDistance(word1, word2) {\n  // TODO: fewest insert/delete/replace operations to turn word1 into word2\n}\n",
    hints: [
      "Let table[i][j] be the distance between the first i characters of word1 and the first j of word2. The base cases are table[i][0] = i (delete everything) and table[0][j] = j (insert everything).",
      "If the current characters match, nothing needs doing: table[i][j] = table[i-1][j-1].",
      "If they differ, take 1 + the smallest of three neighbours — table[i-1][j-1] is a replace, table[i-1][j] is a delete, table[i][j-1] is an insert.",
    ],
    solution:
      "function minDistance(word1, word2) {\n  const rows = word1.length;\n  const cols = word2.length;\n  let previous = new Array(cols + 1).fill(0);\n  for (let j = 0; j <= cols; j++) previous[j] = j;\n  for (let i = 1; i <= rows; i++) {\n    const current = new Array(cols + 1).fill(0);\n    current[0] = i;\n    for (let j = 1; j <= cols; j++) {\n      if (word1[i - 1] === word2[j - 1]) {\n        current[j] = previous[j - 1];\n      } else {\n        current[j] = 1 + Math.min(previous[j - 1], previous[j], current[j - 1]);\n      }\n    }\n    previous = current;\n  }\n  return previous[cols];\n}\n",
    tests: [
      {
        name: "horse to ros",
        body: "assert.equal(minDistance('horse', 'ros'), 3);",
      },
      {
        name: "intention to execution",
        body: "assert.equal(minDistance('intention', 'execution'), 5);",
      },
      {
        name: "one side empty",
        body: "assert.equal(minDistance('', 'abc'), 3);\nassert.equal(minDistance('abc', ''), 3);\nassert.equal(minDistance('', ''), 0);",
      },
      {
        name: "identical strings cost nothing",
        body: "assert.equal(minDistance('same', 'same'), 0);",
      },
      {
        name: "pure insertions and a single replace",
        body: "assert.equal(minDistance('ab', 'abcd'), 2);\nassert.equal(minDistance('cat', 'cut'), 1);",
      },
      { name: "kitten to sitting, the classic example", body: "assert.equal(minDistance('kitten', 'sitting'), 3);" },
      { name: "pure deletions", body: "assert.equal(minDistance('abc', 'a'), 2);" },
      { name: "a single differing character needs one replace", body: "assert.equal(minDistance('a', 'b'), 1);" },
    ],
  },
  {
    id: "ex-target-sum",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Target Sum",
    brief: "<p>Write <code>findTargetSumWays(nums, target)</code>: put a <code>+</code> or a <code>-</code> in front of every number in <code>nums</code> and count how many of the resulting expressions equal <code>target</code>. Every number must get exactly one sign.</p>",
    starter: "function findTargetSumWays(nums, target) {\n  // TODO\n}\n\nconsole.log(findTargetSumWays([1, 1, 1, 1, 1], 3)); // 5\n",
    hints: [
      "Let P be the sum of the numbers marked +. Then P - (total - P) = target, so P = (total + target) / 2.",
      "That turns the problem into: how many subsets of nums sum to P? A 0/1 knapsack count.",
      "If (total + target) is odd, or |target| exceeds the total, the answer is 0. Zeros double the count, which the DP handles naturally.",
    ],
    solution: "function findTargetSumWays(nums, target) {\n  const total = nums.reduce((a, b) => a + b, 0);\n  if (Math.abs(target) > total || (total + target) % 2 !== 0) return 0;\n  const goal = (total + target) / 2;\n  const ways = new Array(goal + 1).fill(0);\n  ways[0] = 1;\n  for (const n of nums) {\n    for (let s = goal; s >= n; s--) ways[s] += ways[s - n];\n  }\n  return ways[goal];\n}\n",
    tests: [
      { name: "five ones", body: "assert.equal(findTargetSumWays([1, 1, 1, 1, 1], 3), 5);" },
      { name: "one number, reachable", body: "assert.equal(findTargetSumWays([1], 1), 1);" },
      { name: "one number, not reachable", body: "assert.equal(findTargetSumWays([1], 2), 0);" },
      { name: "a negative target mirrors a positive one", body: "assert.equal(findTargetSumWays([1, 1, 1, 1, 1], -3), 5);" },
      { name: "zeros double the answer each", body: "assert.equal(findTargetSumWays([0, 0, 0, 0, 0, 0, 0, 0, 1], 1), 256);" },
      { name: "the parity rules it out", body: "assert.equal(findTargetSumWays([1, 2], 2), 0);" },
      { name: "a target beyond the total", body: "assert.equal(findTargetSumWays([1, 2, 3], 100), 0);" },
      { name: "an empty list reaches only zero", body: "assert.equal(findTargetSumWays([], 0), 1);\nassert.equal(findTargetSumWays([], 1), 0);" },
      { name: "twenty numbers", body: "assert.equal(findTargetSumWays(new Array(20).fill(1), 0), 184756);" },
    ],
  },
  {
    id: "ex-interleaving-string",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Interleaving String",
    brief: "<p>Write <code>isInterleave(s1, s2, s3)</code>: can <code>s3</code> be formed by interleaving <code>s1</code> and <code>s2</code>? That means merging the two strings while keeping each one's own characters in their original order (so <code>\"aabcc\"</code> and <code>\"dbbca\"</code> interleave into <code>\"aadbbcbcac\"</code>).</p>",
    starter: "function isInterleave(s1, s2, s3) {\n  // TODO\n}\n\nconsole.log(isInterleave(\"aabcc\", \"dbbca\", \"aadbbcbcac\")); // true\n",
    hints: [
      "dp[i][j] means: the first i characters of s1 and the first j of s2 can make the first i + j of s3.",
      "dp[i][j] is true if dp[i-1][j] and s1[i-1] === s3[i+j-1], or dp[i][j-1] and s2[j-1] === s3[i+j-1].",
      "If the lengths do not add up, return false at once. One row of dp is enough.",
    ],
    solution: "function isInterleave(s1, s2, s3) {\n  if (s1.length + s2.length !== s3.length) return false;\n  const dp = new Array(s2.length + 1).fill(false);\n  for (let i = 0; i <= s1.length; i++) {\n    for (let j = 0; j <= s2.length; j++) {\n      if (i === 0 && j === 0) dp[j] = true;\n      else {\n        const fromS1 = i > 0 && dp[j] && s1[i - 1] === s3[i + j - 1];\n        const fromS2 = j > 0 && dp[j - 1] && s2[j - 1] === s3[i + j - 1];\n        dp[j] = fromS1 || fromS2;\n      }\n    }\n  }\n  return dp[s2.length];\n}\n",
    tests: [
      { name: "a valid interleaving", body: "assert.equal(isInterleave(\"aabcc\", \"dbbca\", \"aadbbcbcac\"), true);" },
      { name: "an invalid one", body: "assert.equal(isInterleave(\"aabcc\", \"dbbca\", \"aadbbbaccc\"), false);" },
      { name: "all empty", body: "assert.equal(isInterleave(\"\", \"\", \"\"), true);" },
      { name: "one string empty", body: "assert.equal(isInterleave(\"\", \"abc\", \"abc\"), true);\nassert.equal(isInterleave(\"abc\", \"\", \"abd\"), false);" },
      { name: "lengths do not add up", body: "assert.equal(isInterleave(\"a\", \"b\", \"abc\"), false);" },
      { name: "the same letters in the wrong order", body: "assert.equal(isInterleave(\"ab\", \"cd\", \"acbd\"), true);\nassert.equal(isInterleave(\"ab\", \"cd\", \"adbc\"), false);" },
      { name: "repeated letters need a real search", body: "assert.equal(isInterleave(\"aaaa\", \"aaab\", \"aaaaaaab\"), true);\nassert.equal(isInterleave(\"aaaa\", \"aaab\", \"baaaaaaa\"), false);" },
      { name: "300 by 300 characters", body: "const a = \"a\".repeat(300);\nconst b = \"a\".repeat(299) + \"b\";\nassert.equal(isInterleave(a, b, \"a\".repeat(599) + \"b\"), true);\nassert.equal(isInterleave(a, b, \"b\" + \"a\".repeat(599)), false);" },
    ],
  },
  {
    id: "ex-distinct-subsequences",
    chapter: "dsa-dp-2d",
    level: "advanced",
    title: "Distinct Subsequences",
    brief: "<p>Write <code>numDistinct(s, t)</code>: the number of <b>distinct subsequences</b> of <code>s</code> that equal <code>t</code>. Two subsequences are different when they use different index positions, even if they spell the same word. The answer fits in a 53-bit integer for the tests here.</p>",
    starter: "function numDistinct(s, t) {\n  // TODO\n}\n\nconsole.log(numDistinct(\"rabbbit\", \"rabbit\")); // 3\n",
    hints: [
      "dp[i][j] = ways to make the first j letters of t from the first i letters of s.",
      "If s[i-1] === t[j-1] you may either use it (dp[i-1][j-1]) or skip it (dp[i-1][j]); otherwise only skip.",
      "dp[i][0] = 1 for every i: the empty string can always be made in one way. Iterate j downwards to use a single row.",
    ],
    solution: "function numDistinct(s, t) {\n  if (t.length > s.length) return 0;\n  const dp = new Array(t.length + 1).fill(0);\n  dp[0] = 1;\n  for (let i = 0; i < s.length; i++) {\n    for (let j = Math.min(i + 1, t.length); j >= 1; j--) {\n      if (s[i] === t[j - 1]) dp[j] += dp[j - 1];\n    }\n  }\n  return dp[t.length];\n}\n",
    tests: [
      { name: "three ways", body: "assert.equal(numDistinct(\"rabbbit\", \"rabbit\"), 3);" },
      { name: "five ways", body: "assert.equal(numDistinct(\"babgbag\", \"bag\"), 5);" },
      { name: "t longer than s", body: "assert.equal(numDistinct(\"ab\", \"abc\"), 0);" },
      { name: "empty t", body: "assert.equal(numDistinct(\"abc\", \"\"), 1);" },
      { name: "both empty", body: "assert.equal(numDistinct(\"\", \"\"), 1);" },
      { name: "empty s", body: "assert.equal(numDistinct(\"\", \"a\"), 0);" },
      { name: "identical strings", body: "assert.equal(numDistinct(\"abc\", \"abc\"), 1);" },
      { name: "repeated letters multiply", body: "assert.equal(numDistinct(\"aaaa\", \"aa\"), 6);" },
      { name: "no match at all", body: "assert.equal(numDistinct(\"abc\", \"d\"), 0);" },
      { name: "a long input in linear-ish space", body: "assert.equal(numDistinct(\"a\".repeat(30), \"a\".repeat(15)), 155117520);" },
    ],
  },
  {
    id: "ex-maximal-square",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Maximal Square",
    brief: "<p><code>matrix</code> is a grid of the characters <code>\"0\"</code> and <code>\"1\"</code>. Write <code>maximalSquare(matrix)</code>: the <b>area</b> of the largest square that contains only <code>\"1\"</code>s.</p>",
    starter: "function maximalSquare(matrix) {\n  // TODO\n}\n\nconsole.log(maximalSquare([[\"1\", \"1\"], [\"1\", \"1\"]])); // 4\n",
    hints: [
      "Let dp[r][c] be the side of the largest all-1 square whose bottom-right corner is (r, c).",
      "When the cell is \"1\", dp[r][c] = 1 + min(dp[r-1][c], dp[r][c-1], dp[r-1][c-1]).",
      "The answer is the largest side, squared. The border rows and columns are just the cell itself.",
    ],
    solution: "function maximalSquare(matrix) {\n  if (matrix.length === 0) return 0;\n  const cols = matrix[0].length;\n  let prev = new Array(cols + 1).fill(0);\n  let best = 0;\n  for (let r = 0; r < matrix.length; r++) {\n    const curr = new Array(cols + 1).fill(0);\n    for (let c = 1; c <= cols; c++) {\n      if (matrix[r][c - 1] === \"1\") {\n        curr[c] = 1 + Math.min(prev[c], curr[c - 1], prev[c - 1]);\n        if (curr[c] > best) best = curr[c];\n      }\n    }\n    prev = curr;\n  }\n  return best * best;\n}\n",
    tests: [
      { name: "a 2 by 2 square inside a larger grid", body: "assert.equal(maximalSquare([[\"1\",\"0\",\"1\",\"0\",\"0\"],[\"1\",\"0\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\",\"1\"],[\"1\",\"0\",\"0\",\"1\",\"0\"]]), 4);" },
      { name: "only diagonal ones", body: "assert.equal(maximalSquare([[\"0\",\"1\"],[\"1\",\"0\"]]), 1);" },
      { name: "a single zero", body: "assert.equal(maximalSquare([[\"0\"]]), 0);" },
      { name: "a single one", body: "assert.equal(maximalSquare([[\"1\"]]), 1);" },
      { name: "all ones", body: "assert.equal(maximalSquare([[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\"]]), 9);" },
      { name: "a wide rectangle of ones gives a square of its short side", body: "assert.equal(maximalSquare([[\"1\",\"1\",\"1\",\"1\"],[\"1\",\"1\",\"1\",\"1\"]]), 4);" },
      { name: "an empty grid", body: "assert.equal(maximalSquare([]), 0);" },
      { name: "a hole in the middle", body: "assert.equal(maximalSquare([[\"1\",\"1\",\"1\"],[\"1\",\"0\",\"1\"],[\"1\",\"1\",\"1\"]]), 1);" },
      { name: "a 500 by 500 grid of ones", body: "const n = 500;\nconst g = Array.from({ length: n }, () => new Array(n).fill(\"1\"));\nassert.equal(maximalSquare(g), n * n);" },
    ],
  },
  {
    id: "ex-knapsack-01",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "0/1 Knapsack",
    brief: "<p>Write <code>knapsack(weights, values, capacity)</code>: the largest total value you can carry when each item may be taken <b>at most once</b> and the total weight may not exceed <code>capacity</code>. Weights and values are non-negative integers.</p>",
    starter: "function knapsack(weights, values, capacity) {\n  // TODO\n}\n\nconsole.log(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7)); // 9\n",
    hints: [
      "dp[w] = best value using capacity w. For each item, update dp from high w to low w.",
      "Going downwards is what stops one item being used twice; going upwards would give the unbounded knapsack.",
      "dp[capacity] is the answer, because dp is non-decreasing in w.",
    ],
    solution: "function knapsack(weights, values, capacity) {\n  const dp = new Array(capacity + 1).fill(0);\n  for (let i = 0; i < weights.length; i++) {\n    for (let w = capacity; w >= weights[i]; w--) {\n      dp[w] = Math.max(dp[w], dp[w - weights[i]] + values[i]);\n    }\n  }\n  return dp[capacity];\n}\n",
    tests: [
      { name: "a small instance", body: "assert.equal(knapsack([1, 3, 4, 5], [1, 4, 5, 7], 7), 9);" },
      { name: "nothing fits", body: "assert.equal(knapsack([5, 6], [10, 20], 4), 0);" },
      { name: "everything fits", body: "assert.equal(knapsack([1, 2, 3], [6, 10, 12], 10), 28);" },
      { name: "no items", body: "assert.equal(knapsack([], [], 10), 0);" },
      { name: "zero capacity", body: "assert.equal(knapsack([1, 2], [5, 6], 0), 0);" },
      { name: "an item may be used only once", body: "assert.equal(knapsack([2], [10], 100), 10);" },
      { name: "greedy by value per weight is wrong here", body: "assert.equal(knapsack([10, 20, 30], [60, 100, 120], 50), 220);" },
      { name: "an item that weighs nothing is free", body: "assert.equal(knapsack([0, 5], [7, 3], 5), 10);" },
      { name: "200 items, capacity 5,000", body: "const w = Array.from({ length: 200 }, (_, i) => (i % 17) + 1);\nconst v = Array.from({ length: 200 }, (_, i) => (i % 13) + 5);\nconst result = knapsack(w, v, 5000);\nassert.equal(result, v.reduce((a, b) => a + b, 0));" },
    ],
  },
{
    id: "ex-top-k-frequent",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Top K Frequent Elements",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the <code>k</code> most frequently occurring values.</p><ul><li>The answer may be returned in <b>any order</b></li><li><code>k</code> is always between 1 and the number of distinct values in <code>nums</code></li><li>The inputs guarantee the top <code>k</code> is unambiguous — there are no ties on the boundary</li></ul>",
    starter:
      "function topKFrequent(nums, k) {\n  // TODO: count how often each value appears, then take the k biggest counts\n}\n",
    hints: [
      "Two phases: first build a value -> count map in one pass, then pick winners from that map.",
      "Once you have the counts, you only care about the entries, not the original array. Turn the map into an array of [value, count] pairs.",
      "Sort those pairs by count descending and slice off the first k, mapping each pair back to its value.",
    ],
    solution:
      "function topKFrequent(nums, k) {\n  const counts = new Map();\n  for (const n of nums) counts.set(n, (counts.get(n) || 0) + 1);\n  return [...counts.entries()]\n    .sort((a, b) => b[1] - a[1])\n    .slice(0, k)\n    .map((pair) => pair[0]);\n}\n",
    tests: [
      {
        name: "picks the two most common",
        body: "const out = topKFrequent([1,1,1,2,2,3], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [1, 2]);",
      },
      {
        name: "single element array",
        body: "assert.deepEqual(topKFrequent([1], 1), [1]);",
      },
      {
        name: "drops the least frequent value",
        body: "const out = topKFrequent([4,4,5,5,6], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [4, 5]);",
      },
      {
        name: "k equals the number of distinct values",
        body: "const out = topKFrequent([1,2,3,4], 4).sort((a, b) => a - b);\nassert.deepEqual(out, [1, 2, 3, 4]);",
      },
      {
        name: "handles negative numbers",
        body: "const out = topKFrequent([-1,-1,-1,-2,-2,7], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [-2, -1]);",
      },
      { name: "k of one returns only the single most frequent value", body: "assert.deepEqual(topKFrequent([1,1,2,2,2,3], 1), [2]);" },
      { name: "four distinct frequency tiers", body: "const out = topKFrequent([5,5,5,5,6,6,6,7,7,8], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [5, 6]);" },
      { name: "zero is a valid frequent value", body: "const out = topKFrequent([0,0,0,1,1,2], 2).sort((a, b) => a - b);\nassert.deepEqual(out, [0, 1]);" },
    ],
  },
{
    id: "ex-longest-consecutive-sequence",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Longest Consecutive Sequence",
    brief:
      "<p>Given an unsorted integer array <code>nums</code>, return the length of the longest run of consecutive integers you can form from its values. The values do not have to be adjacent in the array.</p><ul><li>Your algorithm must run in <b>O(n)</b> time — <em>sorting is not allowed</em></li><li>Duplicates count only once: <code>[1,2,2,3]</code> has a run of length 3</li><li>Negative numbers are allowed</li><li>An empty array returns <code>0</code></li></ul>",
    starter:
      "function longestConsecutive(nums) {\n  // TODO: find the longest run of consecutive values in O(n), without sorting\n}\n",
    hints: [
      "Put every value into a Set first. Membership tests are then O(1), which is what buys you the linear bound.",
      "Only start counting a run from a number that has no left neighbour — that is, a value x where x - 1 is not in the Set.",
      "Because every value is walked at most once as part of exactly one run, the total work stays O(n) even though there is a loop inside a loop.",
    ],
    solution:
      "function longestConsecutive(nums) {\n  const set = new Set(nums);\n  let best = 0;\n  for (const n of set) {\n    if (set.has(n - 1)) continue; // not the start of a run\n    let length = 1;\n    let current = n;\n    while (set.has(current + 1)) {\n      current++;\n      length++;\n    }\n    if (length > best) best = length;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "finds the scattered run",
        body: "assert.equal(longestConsecutive([100,4,200,1,3,2]), 4);",
      },
      {
        name: "empty array is zero",
        body: "assert.equal(longestConsecutive([]), 0);",
      },
      {
        name: "duplicates do not extend a run",
        body: "assert.equal(longestConsecutive([1,2,0,1]), 3);",
      },
      {
        name: "works with negative numbers",
        body: "assert.equal(longestConsecutive([-1,-2,-3,5,6]), 3);",
      },
      {
        name: "long interleaved run",
        body: "assert.equal(longestConsecutive([0,3,7,2,5,8,4,6,0,1]), 9);",
      },
      { name: "single element array", body: "assert.equal(longestConsecutive([5]), 1);" },
      { name: "two separate runs picks the longer one", body: "assert.equal(longestConsecutive([1,2,3,10,11]), 3);" },
      { name: "all identical duplicates form a run of one", body: "assert.equal(longestConsecutive([7,7,7,7]), 1);" },
    ],
  },
{
    id: "ex-happy-number",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Happy Number",
    brief:
      "<p>A positive integer is <b>happy</b> if repeatedly replacing it with the sum of the squares of its digits eventually reaches <code>1</code>.</p><p>If the process never reaches <code>1</code> it loops forever in a cycle. Return <code>true</code> if <code>n</code> is happy, otherwise <code>false</code>.</p><ul><li><code>19</code> is happy: 1+81 = 82, 64+4 = 68, 36+64 = 100, 1+0+0 = 1</li><li><code>2</code> is not happy — it falls into a repeating cycle</li></ul>",
    starter:
      "function isHappy(n) {\n  // TODO: repeat the digit-square-sum step until you reach 1 or repeat yourself\n}\n",
    hints: [
      "Write the single step first: given a number, produce the sum of the squares of its digits (n % 10 gives the last digit, Math.floor(n / 10) drops it).",
      "The loop only ends two ways: you hit 1, or you see a number you have already seen. A Set of visited numbers detects the second case.",
    ],
    solution:
      "function isHappy(n) {\n  const step = (x) => {\n    let total = 0;\n    while (x > 0) {\n      const d = x % 10;\n      total += d * d;\n      x = Math.floor(x / 10);\n    }\n    return total;\n  };\n  const seen = new Set();\n  while (n !== 1 && !seen.has(n)) {\n    seen.add(n);\n    n = step(n);\n  }\n  return n === 1;\n}\n",
    tests: [
      {
        name: "19 is happy",
        body: "assert.equal(isHappy(19), true);",
      },
      {
        name: "2 is not happy",
        body: "assert.equal(isHappy(2), false);",
      },
      {
        name: "1 is trivially happy",
        body: "assert.equal(isHappy(1), true);",
      },
      {
        name: "7 is happy",
        body: "assert.equal(isHappy(7), true);",
      },
      {
        name: "116 is not happy",
        body: "assert.equal(isHappy(116), false);",
      },
      { name: "a three digit happy number", body: "assert.equal(isHappy(100), true);" },
      { name: "4 falls into the standard unhappy cycle", body: "assert.equal(isHappy(4), false);" },
      { name: "a two digit happy number", body: "assert.equal(isHappy(23), true);" },
    ],
  },
{
    id: "ex-subarray-sum-equals-k",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Subarray Sum Equals K",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the total number of <b>contiguous</b> subarrays whose elements sum to exactly <code>k</code>.</p><ul><li>Values may be negative, so you cannot use a sliding window</li><li>Different index ranges count separately even if they contain the same values</li><li>Target <b>O(n)</b> time using a running prefix sum and a hash map</li></ul>",
    starter:
      "function subarraySum(nums, k) {\n  // TODO: count contiguous subarrays summing to k in a single pass\n}\n",
    hints: [
      "The sum of nums[i..j] is prefix[j] - prefix[i-1]. So a subarray ending at j hits k exactly when some earlier prefix equals prefix[j] - k.",
      "Walk the array keeping a running sum and a Map from prefix-sum value -> how many times that prefix has occurred.",
      "Seed the map with { 0: 1 } so that a prefix which itself equals k is counted. Add the map's count for (running - k) to your answer BEFORE recording the current prefix.",
    ],
    solution:
      "function subarraySum(nums, k) {\n  const counts = new Map([[0, 1]]);\n  let running = 0;\n  let total = 0;\n  for (const n of nums) {\n    running += n;\n    total += counts.get(running - k) || 0;\n    counts.set(running, (counts.get(running) || 0) + 1);\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "counts overlapping subarrays",
        body: "assert.equal(subarraySum([1,1,1], 2), 2);",
      },
      {
        name: "prefix that equals k counts",
        body: "assert.equal(subarraySum([1,2,3], 3), 2);",
      },
      {
        name: "handles negatives and a zero target",
        body: "assert.equal(subarraySum([1,-1,0], 0), 3);",
      },
      {
        name: "no subarray matches",
        body: "assert.equal(subarraySum([1,2,3], 7), 0);",
      },
      {
        name: "single element equal to k",
        body: "assert.equal(subarraySum([5], 5), 1);",
      },
      { name: "empty array has no subarrays", body: "assert.equal(subarraySum([], 5), 0);" },
      { name: "target zero with no zero-sum subarray", body: "assert.equal(subarraySum([1,2,3], 0), 0);" },
      { name: "negative numbers summing to a negative target", body: "assert.equal(subarraySum([-1,-1,-1], -2), 2);" },
    ],
  },
{
    id: "ex-continuous-subarray-sum",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Continuous Subarray Sum",
    brief:
      "<p>Given an array <code>nums</code> of non-negative integers and a positive integer <code>k</code>, return <code>true</code> if there is a contiguous subarray whose sum is a multiple of <code>k</code>.</p><ul><li>The subarray must have <b>length at least 2</b> — this is the whole trap</li><li><code>0</code> counts as a multiple of every <code>k</code>, so <code>[0,0]</code> with <code>k = 7</code> is <code>true</code></li><li>But <code>[1,0]</code> with <code>k = 2</code> is <code>false</code>: the only multiple of 2 in there is the single element <code>0</code>, and length 1 does not qualify</li><li>Target <b>O(n)</b> using prefix-sum remainders</li></ul>",
    starter:
      "function checkSubarraySum(nums, k) {\n  // TODO: is there a contiguous subarray of length >= 2 whose sum is a multiple of k?\n}\n",
    hints: [
      "sum(i..j) is a multiple of k exactly when prefix[j] and prefix[i-1] leave the SAME remainder when divided by k.",
      "So keep a Map from remainder -> the earliest index at which that remainder was seen, seeded with remainder 0 at index -1.",
      "When you meet a remainder you have seen before, only return true if the gap between the indices is at least 2 — and never overwrite a remainder's stored index, or you lose the earliest one.",
    ],
    solution:
      "function checkSubarraySum(nums, k) {\n  const firstIndex = new Map([[0, -1]]);\n  let running = 0;\n  for (let i = 0; i < nums.length; i++) {\n    running += nums[i];\n    const r = running % k;\n    if (firstIndex.has(r)) {\n      if (i - firstIndex.get(r) >= 2) return true;\n    } else {\n      firstIndex.set(r, i);\n    }\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds a multiple of k inside the array",
        body: "assert.equal(checkSubarraySum([23,2,4,6,7], 6), true);",
      },
      {
        name: "whole array sums to a multiple",
        body: "assert.equal(checkSubarraySum([23,2,6,4,7], 6), true);",
      },
      {
        name: "no qualifying subarray",
        body: "assert.equal(checkSubarraySum([23,2,6,4,7], 13), false);",
      },
      {
        name: "a lone zero does not count (length must be >= 2)",
        body: "assert.equal(checkSubarraySum([1,0], 2), false);",
      },
      {
        name: "two zeros do count",
        body: "assert.equal(checkSubarraySum([0,0], 7), true);\nassert.equal(checkSubarraySum([5,0,0], 3), true);",
      },
      { name: "a single element cannot satisfy the length requirement even if divisible", body: "assert.equal(checkSubarraySum([5], 5), false);" },
      { name: "zeros further apart still form a qualifying subarray", body: "assert.equal(checkSubarraySum([5,0,0,0], 3), true);" },
      { name: "k of 1 makes any subarray of length 2 or more qualify", body: "assert.equal(checkSubarraySum([1,1], 1), true);" },
    ],
  },
{
    id: "ex-max-size-subarray-sum-equals-k",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Maximum Size Subarray Sum Equals K",
    brief:
      "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the length of the <b>longest</b> contiguous subarray that sums to exactly <code>k</code>.</p><ul><li>If no such subarray exists, return <code>0</code></li><li>Values may be negative and may be zero</li><li>Target <b>O(n)</b> time with a prefix sum and a hash map</li></ul>",
    starter:
      "function maxSubArrayLen(nums, k) {\n  // TODO: return the length of the longest contiguous subarray summing to k\n}\n",
    hints: [
      "A subarray ending at index j sums to k when some earlier prefix equals prefix[j] - k. Look that up in a Map instead of scanning backwards.",
      "You want the LONGEST subarray, so the map must store the FIRST index at which each prefix sum appeared — never overwrite an existing entry.",
      "Seed the map with prefix 0 at index -1 so a subarray starting at index 0 gets the right length: j - (-1) = j + 1.",
    ],
    solution:
      "function maxSubArrayLen(nums, k) {\n  const firstIndex = new Map([[0, -1]]);\n  let running = 0;\n  let best = 0;\n  for (let i = 0; i < nums.length; i++) {\n    running += nums[i];\n    if (firstIndex.has(running - k)) {\n      const length = i - firstIndex.get(running - k);\n      if (length > best) best = length;\n    }\n    if (!firstIndex.has(running)) firstIndex.set(running, i);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "longest run starts at index 0",
        body: "assert.equal(maxSubArrayLen([1,-1,5,-2,3], 3), 4);",
      },
      {
        name: "longest run starts later",
        body: "assert.equal(maxSubArrayLen([-2,-1,2,1], 1), 2);",
      },
      {
        name: "no subarray sums to k",
        body: "assert.equal(maxSubArrayLen([1,2,3], 100), 0);",
      },
      {
        name: "zeros extend the answer",
        body: "assert.equal(maxSubArrayLen([0,0,0,4], 4), 4);",
      },
      {
        name: "empty array",
        body: "assert.equal(maxSubArrayLen([], 0), 0);",
      },
      { name: "negative k with negative numbers", body: "assert.equal(maxSubArrayLen([-1,-1,-1], -2), 2);" },
      { name: "single element equal to k", body: "assert.equal(maxSubArrayLen([5], 5), 1);" },
      { name: "no subarray reaches a negative target", body: "assert.equal(maxSubArrayLen([1,2,3], -5), 0);" },
    ],
  },
{
    id: "ex-contiguous-array",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Contiguous Array",
    brief:
      "<p>Given a binary array <code>nums</code> containing only <code>0</code> and <code>1</code>, return the length of the longest contiguous subarray that holds an <b>equal number</b> of zeros and ones.</p><ul><li>If no such subarray exists, return <code>0</code></li><li>The answer is always even</li><li>Target <b>O(n)</b> time</li></ul>",
    starter: "function findMaxLength(nums) {\n  // TODO: longest subarray with as many 0s as 1s\n}\n",
    hints: [
      "Counting two things is awkward. Re-map the problem: treat 0 as -1 and 1 as +1, and 'equal counts' becomes 'sums to zero'.",
      "Now it is the longest-subarray-summing-to-zero problem: keep a running total and a Map from total -> the first index where that total appeared.",
      "Seed the map with total 0 at index -1. When the running total repeats, the stretch between the two positions balances out.",
    ],
    solution:
      "function findMaxLength(nums) {\n  const firstIndex = new Map([[0, -1]]);\n  let running = 0;\n  let best = 0;\n  for (let i = 0; i < nums.length; i++) {\n    running += nums[i] === 1 ? 1 : -1;\n    if (firstIndex.has(running)) {\n      const length = i - firstIndex.get(running);\n      if (length > best) best = length;\n    } else {\n      firstIndex.set(running, i);\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "simple pair",
        body: "assert.equal(findMaxLength([0,1]), 2);",
      },
      {
        name: "ignores the trailing odd one out",
        body: "assert.equal(findMaxLength([0,1,0]), 2);",
      },
      {
        name: "longest balanced stretch spans most of the array",
        body: "assert.equal(findMaxLength([0,0,1,0,0,0,1,1]), 6);",
      },
      {
        name: "never balances",
        body: "assert.equal(findMaxLength([1,1,1]), 0);",
      },
      {
        name: "empty array",
        body: "assert.equal(findMaxLength([]), 0);",
      },
      { name: "the whole array balances at the end", body: "assert.equal(findMaxLength([1,1,0,0]), 4);" },
      { name: "a single element cannot balance", body: "assert.equal(findMaxLength([1]), 0);" },
      { name: "a fully alternating array balances entirely", body: "assert.equal(findMaxLength([0,1,0,1,0,1]), 6);" },
    ],
  },
{
    id: "ex-find-pivot-index",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Find Pivot Index",
    brief:
      "<p>Given an integer array <code>nums</code>, return the leftmost <b>pivot index</b>: the index where the sum of all numbers strictly to its left equals the sum of all numbers strictly to its right.</p><ul><li>The element at the pivot itself belongs to neither side</li><li>The sum of an empty side is <code>0</code>, so index <code>0</code> is a valid answer</li><li>If there is no pivot index, return <code>-1</code></li></ul>",
    starter:
      "function pivotIndex(nums) {\n  // TODO: return the leftmost index where the left sum equals the right sum\n}\n",
    hints: [
      "Recomputing both sides at every index is O(n^2). Compute the total of the whole array once up front.",
      "Sweep left to right carrying the running left sum. The right sum at index i is then total - leftSum - nums[i], with no extra loop.",
    ],
    solution:
      "function pivotIndex(nums) {\n  let total = 0;\n  for (const n of nums) total += n;\n  let left = 0;\n  for (let i = 0; i < nums.length; i++) {\n    if (left === total - left - nums[i]) return i;\n    left += nums[i];\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "pivot in the middle",
        body: "assert.equal(pivotIndex([1,7,3,6,5,6]), 3);",
      },
      {
        name: "no pivot exists",
        body: "assert.equal(pivotIndex([1,2,3]), -1);",
      },
      {
        name: "pivot at index 0 with an empty left side",
        body: "assert.equal(pivotIndex([2,1,-1]), 0);",
      },
      {
        name: "single element is always a pivot",
        body: "assert.equal(pivotIndex([5]), 0);",
      },
      {
        name: "empty array has no pivot",
        body: "assert.equal(pivotIndex([]), -1);",
      },
      { name: "pivot with an empty right side", body: "assert.equal(pivotIndex([0,0,0,0,1]), 4);" },
      { name: "negative numbers still balance", body: "assert.equal(pivotIndex([-1,1,0]), 2);" },
      { name: "a mixed-sign array with the pivot in the middle", body: "assert.equal(pivotIndex([-7,1,5,2,-4,3,0]), 3);" },
    ],
  },
{
    id: "ex-range-sum-query-immutable",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Range Sum Query — Immutable",
    brief:
      "<p>Build a class <code>NumArray</code> that answers repeated range-sum queries over a fixed array.</p><ul><li><code>new NumArray(nums)</code> — the constructor may do <b>O(n)</b> work</li><li><code>sumRange(i, j)</code> — returns the sum of <code>nums[i]</code> through <code>nums[j]</code> <b>inclusive</b>, and must run in <b>O(1)</b></li><li>The array never changes after construction, so all the work belongs in the constructor</li><li><code>sumRange(i, i)</code> returns a single element</li></ul>",
    starter:
      "class NumArray {\n  constructor(nums) {\n    // TODO: precompute whatever sumRange needs\n  }\n\n  sumRange(i, j) {\n    // TODO: answer in O(1)\n  }\n}\n",
    hints: [
      "Looping from i to j inside sumRange is O(n) per query. The constructor is allowed to be O(n) — spend the time there instead.",
      "Precompute prefix sums: prefix[t] = the sum of the first t elements. Then sum(i..j) = prefix[j + 1] - prefix[i].",
      "Making the prefix array length n + 1 with a leading 0 removes the special case for i === 0.",
    ],
    solution:
      "class NumArray {\n  constructor(nums) {\n    this.prefix = new Array(nums.length + 1).fill(0);\n    for (let t = 0; t < nums.length; t++) {\n      this.prefix[t + 1] = this.prefix[t] + nums[t];\n    }\n  }\n\n  sumRange(i, j) {\n    return this.prefix[j + 1] - this.prefix[i];\n  }\n}\n",
    tests: [
      {
        name: "sums an interior range",
        body: "const na = new NumArray([-2,0,3,-5,2,-1]);\nassert.equal(na.sumRange(0, 2), 1);\nassert.equal(na.sumRange(2, 5), -1);\nassert.equal(na.sumRange(0, 5), -3);",
      },
      {
        name: "single element range",
        body: "const na = new NumArray([1,2,3,4]);\nassert.equal(na.sumRange(2, 2), 3);\nassert.equal(na.sumRange(0, 0), 1);",
      },
      {
        name: "repeated queries stay consistent",
        body: "const na = new NumArray([5,5,5,5]);\nassert.equal(na.sumRange(1, 3), 15);\nassert.equal(na.sumRange(1, 3), 15);\nassert.equal(na.sumRange(0, 3), 20);",
      },
      {
        name: "whole array of one element",
        body: "const na = new NumArray([42]);\nassert.equal(na.sumRange(0, 0), 42);",
      },
      {
        name: "two instances do not share state",
        body: "const a = new NumArray([1,1,1]);\nconst b = new NumArray([10,10,10]);\nassert.equal(a.sumRange(0, 2), 3);\nassert.equal(b.sumRange(0, 2), 30);",
      },
      { name: "handles an array of all negative numbers", body: "const na = new NumArray([-1,-2,-3,-4]);\nassert.equal(na.sumRange(0, 3), -10);\nassert.equal(na.sumRange(1, 2), -5);" },
      { name: "single element at the last index plus the full range", body: "const na = new NumArray([1,2,3,4,5]);\nassert.equal(na.sumRange(4, 4), 5);\nassert.equal(na.sumRange(0, 4), 15);" },
      { name: "an all-zero array sums to zero everywhere", body: "const na = new NumArray([0,0,0]);\nassert.equal(na.sumRange(0, 2), 0);\nassert.equal(na.sumRange(1, 1), 0);" },
    ],
  },
{
    id: "ex-ransom-note",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Ransom Note",
    brief:
      "<p>Given two strings <code>note</code> and <code>magazine</code>, return <code>true</code> if <code>note</code> can be built using only letters cut out of <code>magazine</code>.</p><ul><li>Each character in <code>magazine</code> may be used <b>at most once</b></li><li>Both strings contain lowercase letters only</li><li>An empty note is always buildable</li></ul>",
    starter:
      "function canConstruct(note, magazine) {\n  // TODO: can note be spelled from magazine's letters, each used at most once?\n}\n",
    hints: [
      "This is a counting problem, not a searching problem. How many of each letter does the magazine supply, and how many does the note demand?",
      "Build a Map of letter -> count for the magazine, then walk the note decrementing. The moment a letter is missing or its count hits zero, the answer is false.",
    ],
    solution:
      "function canConstruct(note, magazine) {\n  const supply = new Map();\n  for (const ch of magazine) supply.set(ch, (supply.get(ch) || 0) + 1);\n  for (const ch of note) {\n    const left = supply.get(ch) || 0;\n    if (left === 0) return false;\n    supply.set(ch, left - 1);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "missing letter",
        body: "assert.equal(canConstruct('a', 'b'), false);",
      },
      {
        name: "enough copies of a repeated letter",
        body: "assert.equal(canConstruct('aa', 'aab'), true);",
      },
      {
        name: "letters may not be reused",
        body: "assert.equal(canConstruct('aa', 'ab'), false);",
      },
      {
        name: "empty note is always buildable",
        body: "assert.equal(canConstruct('', 'abc'), true);",
      },
      {
        name: "empty magazine cannot build a note",
        body: "assert.equal(canConstruct('a', ''), false);",
      },
      { name: "identical strings can always be built", body: "assert.equal(canConstruct('abc', 'abc'), true);" },
      { name: "extra unused letters in the magazine are fine", body: "assert.equal(canConstruct('a', 'xyzabc'), true);" },
      { name: "missing enough copies of a repeated letter", body: "assert.equal(canConstruct('aabbcc', 'aabbc'), false);" },
    ],
  },
{
    id: "ex-intersection-of-two-arrays",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Intersection of Two Arrays",
    brief:
      "<p>Given two integer arrays <code>nums1</code> and <code>nums2</code>, return an array of the values that appear in <b>both</b>.</p><ul><li>Each value appears <b>at most once</b> in the result, however often it occurs in the inputs</li><li>The result may be returned in <b>any order</b></li><li>If there is no overlap, return an empty array</li></ul>",
    starter: "function intersection(nums1, nums2) {\n  // TODO: return the distinct values present in both arrays\n}\n",
    hints: [
      "Checking `nums2.includes(x)` inside a loop is O(n * m). What structure answers 'is this value present?' in O(1)?",
      "Put nums1 into a Set, then filter the distinct values of nums2 against it — a Set on the output side is what enforces 'at most once'.",
    ],
    solution:
      "function intersection(nums1, nums2) {\n  const first = new Set(nums1);\n  const out = new Set();\n  for (const n of nums2) {\n    if (first.has(n)) out.add(n);\n  }\n  return [...out];\n}\n",
    tests: [
      {
        name: "collapses duplicates to one value",
        body: "const out = intersection([1,2,2,1], [2,2]).sort((a, b) => a - b);\nassert.deepEqual(out, [2]);",
      },
      {
        name: "several shared values",
        body: "const out = intersection([4,9,5], [9,4,9,8,4]).sort((a, b) => a - b);\nassert.deepEqual(out, [4, 9]);",
      },
      {
        name: "no overlap",
        body: "assert.deepEqual(intersection([1,2], [3,4]), []);",
      },
      {
        name: "empty input",
        body: "assert.deepEqual(intersection([], [1,2,3]), []);",
      },
      {
        name: "handles negatives and zero",
        body: "const out = intersection([0,-1,-1,3], [-1,0,0]).sort((a, b) => a - b);\nassert.deepEqual(out, [-1, 0]);",
      },
      { name: "identical arrays", body: "const out = intersection([1,2,3], [1,2,3]).sort((a, b) => a - b);\nassert.deepEqual(out, [1, 2, 3]);" },
      { name: "both empty", body: "assert.deepEqual(intersection([], []), []);" },
      { name: "one array is entirely repeats of a value in the other", body: "assert.deepEqual(intersection([1,1,1], [1]), [1]);" },
    ],
  },
{
    id: "ex-intersection-of-two-arrays-ii",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Intersection of Two Arrays II",
    brief:
      "<p>Given two integer arrays <code>nums1</code> and <code>nums2</code>, return the values they share <b>including multiplicity</b>.</p><ul><li>A value must appear in the result as many times as it appears in <em>both</em> arrays — that is, the smaller of its two counts</li><li>So <code>[1,2,2,1]</code> and <code>[2,2]</code> give <code>[2,2]</code></li><li>The result may be returned in <b>any order</b></li></ul>",
    starter:
      "function intersect(nums1, nums2) {\n  // TODO: return shared values, each repeated min(count in nums1, count in nums2) times\n}\n",
    hints: [
      "A Set loses multiplicity. You need a Map from value -> remaining count.",
      "Count nums1 into a Map. Then walk nums2: if the map still has a positive count for that value, push it to the output and decrement.",
      "Decrementing is what caps the output at the smaller of the two counts — no min() call needed.",
    ],
    solution:
      "function intersect(nums1, nums2) {\n  const counts = new Map();\n  for (const n of nums1) counts.set(n, (counts.get(n) || 0) + 1);\n  const out = [];\n  for (const n of nums2) {\n    const left = counts.get(n) || 0;\n    if (left > 0) {\n      out.push(n);\n      counts.set(n, left - 1);\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "keeps both copies",
        body: "const out = intersect([1,2,2,1], [2,2]).sort((a, b) => a - b);\nassert.deepEqual(out, [2, 2]);",
      },
      {
        name: "multiplicity is capped by the smaller count",
        body: "const out = intersect([4,9,5,9], [9,4,9,8,4]).sort((a, b) => a - b);\nassert.deepEqual(out, [4, 9, 9]);",
      },
      {
        name: "one copy available, one copy returned",
        body: "const out = intersect([1], [1,1,1]).sort((a, b) => a - b);\nassert.deepEqual(out, [1]);",
      },
      {
        name: "no overlap",
        body: "assert.deepEqual(intersect([1,2], [3,4]), []);",
      },
      {
        name: "empty input",
        body: "assert.deepEqual(intersect([], [1,2,3]), []);",
      },
      { name: "identical arrays with duplicates", body: "const out = intersect([1,1,2], [1,1,2]).sort((a, b) => a - b);\nassert.deepEqual(out, [1, 1, 2]);" },
      { name: "output order follows the second array, not sorted order", body: "assert.deepEqual(intersect([2,2,1], [1,2,2]), [1, 2, 2]);" },
      { name: "both empty", body: "assert.deepEqual(intersect([], []), []);" },
    ],
  },
{
    id: "ex-first-unique-character",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "First Unique Character in a String",
    brief:
      "<p>Given a string <code>s</code>, return the index of the first character that appears exactly once. If every character repeats, return <code>-1</code>.</p><ul><li><code>s</code> contains lowercase letters only</li><li><code>'leetcode'</code> gives <code>0</code>; <code>'loveleetcode'</code> gives <code>2</code></li><li>An empty string returns <code>-1</code></li></ul>",
    starter:
      "function firstUniqChar(s) {\n  // TODO: index of the first character that appears exactly once, or -1\n}\n",
    hints: [
      "You cannot know whether the first character is unique until you have seen the whole string. That points at two passes.",
      "Pass one builds a character -> count map. Pass two walks the string in order and returns the index of the first character whose count is 1.",
    ],
    solution:
      "function firstUniqChar(s) {\n  const counts = new Map();\n  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);\n  for (let i = 0; i < s.length; i++) {\n    if (counts.get(s[i]) === 1) return i;\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "first character is unique",
        body: "assert.equal(firstUniqChar('leetcode'), 0);",
      },
      {
        name: "unique character appears later",
        body: "assert.equal(firstUniqChar('loveleetcode'), 2);",
      },
      {
        name: "everything repeats",
        body: "assert.equal(firstUniqChar('aabb'), -1);",
      },
      {
        name: "empty string",
        body: "assert.equal(firstUniqChar(''), -1);",
      },
      {
        name: "only the last character is unique",
        body: "assert.equal(firstUniqChar('aabbc'), 4);",
      },
      { name: "a single character string", body: "assert.equal(firstUniqChar('z'), 0);" },
      { name: "every character is already unique", body: "assert.equal(firstUniqChar('abcdef'), 0);" },
      { name: "the only unique character sits in the middle", body: "assert.equal(firstUniqChar('aabcc'), 2);" },
    ],
  },
{
    id: "ex-word-frequency-top-k",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Word Frequency Top-K",
    brief:
      "<p>Given a block of <code>text</code> and an integer <code>k</code>, return the <code>k</code> most frequent words, most frequent first.</p><ul><li>A <b>word</b> is a maximal run of letters. Everything else (spaces, punctuation, digits, newlines) is a separator</li><li>Comparison is case-insensitive, and words are returned <b>lowercased</b></li><li><b>Ordering:</b> higher frequency first; words with the same frequency are ordered <em>alphabetically</em></li><li>If the text has fewer than <code>k</code> distinct words, return all of them</li></ul>",
    starter:
      "function topKWords(text, k) {\n  // TODO: return the k most frequent words, ties broken alphabetically\n}\n",
    hints: [
      "Normalise before counting: lowercase the text, then split on any run of non-letter characters and drop the empty pieces.",
      "Count into a Map, then sort the [word, count] entries. The comparator needs two keys, not one.",
      "Compare counts descending first; when they are equal, fall through to comparing the words ascending. Then slice off the first k.",
    ],
    solution:
      "function topKWords(text, k) {\n  const words = text.toLowerCase().split(/[^a-z]+/).filter((w) => w.length > 0);\n  const counts = new Map();\n  for (const w of words) counts.set(w, (counts.get(w) || 0) + 1);\n  return [...counts.entries()]\n    .sort((a, b) => {\n      if (b[1] !== a[1]) return b[1] - a[1];\n      return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;\n    })\n    .slice(0, k)\n    .map((pair) => pair[0]);\n}\n",
    tests: [
      {
        name: "orders by frequency",
        body: "assert.deepEqual(topKWords('the day is sunny the the the sunny is is', 3), ['the', 'is', 'sunny']);",
      },
      {
        name: "ties break alphabetically",
        body: "assert.deepEqual(topKWords('b a b a c', 3), ['a', 'b', 'c']);",
      },
      {
        name: "punctuation and case are ignored",
        body: "assert.deepEqual(topKWords('Cats, cats; DOGS! dogs? cats.', 2), ['cats', 'dogs']);",
      },
      {
        name: "k larger than the number of distinct words",
        body: "assert.deepEqual(topKWords('hello world hello', 10), ['hello', 'world']);",
      },
      {
        name: "empty text",
        body: "assert.deepEqual(topKWords('', 3), []);",
      },
      { name: "k of one returns the single top word", body: "assert.deepEqual(topKWords('apple apple banana', 1), ['apple']);" },
      { name: "digits act as separators like punctuation", body: "assert.deepEqual(topKWords('a1b2a3b', 5), ['a', 'b']);" },
      { name: "newlines and tabs separate words too", body: "assert.deepEqual(topKWords('cat\\ncat\\ndog', 2), ['cat', 'dog']);" },
    ],
  },
{
    id: "ex-reverse-linked-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Reverse Linked List",
    brief:
      "<p>Given the <code>head</code> of a singly linked list, flip every <code>next</code> pointer so the list runs the other way, and return the new head.</p><ul><li>Reuse the existing nodes — do not allocate a second list</li><li>An empty list reverses to an empty list (<code>null</code>)</li><li>A node looks like <code>{ val, next }</code></li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseList(head) {\n  // TODO: walk the list once, re-pointing each node at the one before it\n}\n",
    hints: [
      "You need three things in flight at a time: the node before, the node you are on, and the node after.",
      "Before you overwrite node.next, save it — otherwise you lose the rest of the list.",
      "Start prev at null. When the walk finishes, prev is sitting on the last node you visited, which is the new head.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseList(head) {\n  let prev = null;\n  let cur = head;\n  while (cur) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  return prev;\n}\n",
    tests: [
      {
        name: "reverses a five node list",
        body: "assert.deepEqual(toArray(reverseList(build([1,2,3,4,5]))), [5,4,3,2,1]);",
      },
      {
        name: "reverses a two node list",
        body: "assert.deepEqual(toArray(reverseList(build([1,2]))), [2,1]);",
      },
      {
        name: "single node is unchanged",
        body: "assert.deepEqual(toArray(reverseList(build([9]))), [9]);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(reverseList(null), null);",
      },
      {
        name: "reuses the original nodes",
        body: "const head = build([1,2,3]);\nconst tail = head.next.next;\nconst out = reverseList(head);\nassert.ok(out === tail, 'new head should be the original tail node');\nassert.equal(head.next, null);",
      },
      { name: "reverses a four node list", body: "assert.deepEqual(toArray(reverseList(build([10,20,30,40]))), [40,30,20,10]);" },
      { name: "reversing twice restores the original order", body: "const head = build([1,2,3,4]);\nconst twice = reverseList(reverseList(head));\nassert.deepEqual(toArray(twice), [1,2,3,4]);" },
      { name: "negative and duplicate values", body: "assert.deepEqual(toArray(reverseList(build([-1,-1,2]))), [2,-1,-1]);" },
    ],
  },
{
    id: "ex-merge-two-sorted-lists",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Merge Two Sorted Lists",
    brief:
      "<p>You are handed the heads of two linked lists, each already sorted in non-decreasing order. Splice them into one sorted list and return its head.</p><ul><li>Build the answer by re-linking the existing nodes, not by copying values into an array</li><li>Either list may be empty</li><li>Equal values may appear in either order relative to each other</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeTwoLists(a, b) {\n  // TODO: repeatedly take the smaller of the two front nodes\n}\n",
    hints: [
      "The smallest remaining value is always at the front of one list or the other — you never have to search.",
      "A throwaway 'dummy' node to hang the result off removes the special case of choosing the very first node.",
      "When one list runs out, the rest of the other is already sorted — attach it whole instead of looping.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeTwoLists(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) {\n      tail.next = a;\n      a = a.next;\n    } else {\n      tail.next = b;\n      b = b.next;\n    }\n    tail = tail.next;\n  }\n  tail.next = a || b;\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "interleaves two lists",
        body: "assert.deepEqual(toArray(mergeTwoLists(build([1,2,4]), build([1,3,4]))), [1,1,2,3,4,4]);",
      },
      {
        name: "one list is entirely smaller",
        body: "assert.deepEqual(toArray(mergeTwoLists(build([1,2,3]), build([7,8]))), [1,2,3,7,8]);",
      },
      {
        name: "handles an empty second list",
        body: "assert.deepEqual(toArray(mergeTwoLists(build([5]), null)), [5]);",
      },
      {
        name: "handles an empty first list",
        body: "assert.deepEqual(toArray(mergeTwoLists(null, build([0]))), [0]);",
      },
      {
        name: "both empty gives null",
        body: "assert.equal(mergeTwoLists(null, null), null);",
      },
      { name: "all values tie", body: "assert.deepEqual(toArray(mergeTwoLists(build([1,1]), build([1,1]))), [1,1,1,1]);" },
      { name: "negative numbers interleave correctly", body: "assert.deepEqual(toArray(mergeTwoLists(build([-5,-3,-1]), build([-4,-2,0]))), [-5,-4,-3,-2,-1,0]);" },
      { name: "single node in each list", body: "assert.deepEqual(toArray(mergeTwoLists(build([2]), build([1]))), [1,2]);" },
    ],
  },
{
    id: "ex-linked-list-has-cycle",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Linked List Cycle",
    brief:
      "<p>Return <code>true</code> if the linked list starting at <code>head</code> loops back on itself, and <code>false</code> if walking it eventually reaches <code>null</code>.</p><ul><li>A cycle exists when some node's <code>next</code> points at a node already visited</li><li>Do not modify the list</li><li>Aim for O(1) extra space — a plain <code>Set</code> of nodes works but costs O(n) memory</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction hasCycle(head) {\n  // TODO: decide whether walking forward ever revisits a node\n}\n",
    hints: [
      "If two walkers move at different speeds around a closed loop, what has to eventually happen to them?",
      "Advance one pointer by one node and another by two. On a finite straight list the fast one hits null.",
      "Check for the meeting after you move, and stop the moment fast or fast.next is null.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction hasCycle(head) {\n  let slow = head;\n  let fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) return true;\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "detects a loop back into the middle",
        body: "const head = build([3,2,0,-4]);\nconst second = head.next;\nhead.next.next.next.next = second;\nassert.equal(hasCycle(head), true);",
      },
      {
        name: "straight list has no cycle",
        body: "assert.equal(hasCycle(build([1,2,3,4,5])), false);",
      },
      {
        name: "single node pointing at itself",
        body: "const only = new ListNode(1);\nonly.next = only;\nassert.equal(hasCycle(only), true);",
      },
      {
        name: "single node with no cycle",
        body: "assert.equal(hasCycle(build([1])), false);",
      },
      {
        name: "empty list has no cycle",
        body: "assert.equal(hasCycle(null), false);",
      },
      { name: "a two node cycle", body: "const head = build([1,2]);\nhead.next.next = head;\nassert.equal(hasCycle(head), true);" },
      { name: "cycle back to the head in a longer list", body: "const head = build([1,2,3,4,5,6,7]);\nlet tail = head;\nwhile (tail.next) tail = tail.next;\ntail.next = head;\nassert.equal(hasCycle(head), true);" },
      { name: "a two node list without a cycle", body: "assert.equal(hasCycle(build([1,2])), false);" },
    ],
  },
{
    id: "ex-linked-list-cycle-start",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Linked List Cycle II",
    brief:
      "<p>If the list contains a loop, return the <b>node where the loop begins</b> — the first node that gets visited twice. If there is no loop, return <code>null</code>.</p><ul><li>Return the node object itself, not its value or index</li><li>Do not modify the list</li><li>The intended solution uses O(1) extra space</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction detectCycle(head) {\n  // TODO: find the loop first, then work out where it starts\n}\n",
    hints: [
      "Start the same way as plain cycle detection: a slow and a fast pointer that meet somewhere inside the loop.",
      "The meeting point is not the loop entrance. Let the distance from head to the entrance be A and the distance from the entrance to the meeting point be B — the maths says the remaining loop distance back to the entrance is also A.",
      "So after they meet, reset one pointer to head and advance both one step at a time; they collide exactly at the entrance.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction detectCycle(head) {\n  let slow = head;\n  let fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n    if (slow === fast) {\n      let walker = head;\n      while (walker !== slow) {\n        walker = walker.next;\n        slow = slow.next;\n      }\n      return walker;\n    }\n  }\n  return null;\n}\n",
    tests: [
      {
        name: "returns the entry node of the loop",
        body: "const head = build([3,2,0,-4]);\nconst entry = head.next;\nhead.next.next.next.next = entry;\nconst got = detectCycle(head);\nassert.equal(got.val, 2);\nassert.ok(got === entry, 'must return the very same node object');",
      },
      {
        name: "loop that starts at the head",
        body: "const head = build([1,2,3]);\nhead.next.next.next = head;\nconst got = detectCycle(head);\nassert.equal(got.val, 1);\nassert.ok(got === head);",
      },
      {
        name: "single self-referencing node",
        body: "const only = new ListNode(7);\nonly.next = only;\nconst got = detectCycle(only);\nassert.equal(got.val, 7);\nassert.ok(got === only);",
      },
      {
        name: "no cycle returns null",
        body: "assert.equal(detectCycle(build([1,2,3,4])), null);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(detectCycle(null), null);",
      },
      { name: "entry near the end of a longer list", body: "const head = build([1,2,3,4,5,6]);\nconst entry = head.next.next.next.next;\nlet tail = head;\nwhile (tail.next) tail = tail.next;\ntail.next = entry;\nconst got = detectCycle(head);\nassert.equal(got.val, 5);\nassert.ok(got === entry);" },
      { name: "the last node of a longer list cycles onto itself", body: "const head = build([10,20,30]);\nconst last = head.next.next;\nlast.next = last;\nconst got = detectCycle(head);\nassert.equal(got.val, 30);\nassert.ok(got === last);" },
      { name: "a single node list with no cycle returns null", body: "assert.equal(detectCycle(build([1])), null);" },
    ],
  },
{
    id: "ex-middle-of-linked-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Middle of the Linked List",
    brief:
      "<p>Return the middle node of a singly linked list.</p><ul><li>For an odd length list there is exactly one middle</li><li>For an even length list return the <b>second</b> of the two middles</li><li>Return the node, not its value — one pass, no counting pass first</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction middleNode(head) {\n  // TODO: reach the middle in a single traversal\n}\n",
    hints: [
      "If one pointer travels twice as fast as another, where is the slow one when the fast one falls off the end?",
      "Loop while fast and fast.next are both non-null; move slow one step and fast two.",
      "Starting both at head naturally lands you on the second middle for even lengths.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction middleNode(head) {\n  let slow = head;\n  let fast = head;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  return slow;\n}\n",
    tests: [
      {
        name: "odd length list",
        body: "assert.deepEqual(toArray(middleNode(build([1,2,3,4,5]))), [3,4,5]);",
      },
      {
        name: "even length takes the second middle",
        body: "assert.deepEqual(toArray(middleNode(build([1,2,3,4,5,6]))), [4,5,6]);",
      },
      {
        name: "two node list",
        body: "assert.equal(middleNode(build([1,2])).val, 2);",
      },
      {
        name: "single node is its own middle",
        body: "assert.equal(middleNode(build([42])).val, 42);",
      },
      {
        name: "returns a node from the original list",
        body: "const head = build([1,2,3]);\nassert.ok(middleNode(head) === head.next);",
      },
      { name: "a three node list", body: "assert.equal(middleNode(build([1,2,3])).val, 2);" },
      { name: "a four node list", body: "assert.equal(middleNode(build([1,2,3,4])).val, 3);" },
      { name: "a seven node list", body: "assert.equal(middleNode(build([1,2,3,4,5,6,7])).val, 4);" },
    ],
  },
{
    id: "ex-remove-nth-from-end",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Remove Nth Node From End",
    brief:
      "<p>Remove the <code>n</code>th node counting from the <b>end</b> of the list and return the head of the result.</p><ul><li><code>n = 1</code> means the last node</li><li><code>n</code> is always valid: <code>1 &lt;= n &lt;= length</code></li><li>Removing the only node leaves an empty list — return <code>null</code></li><li>Try to do it in a single pass</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction removeNthFromEnd(head, n) {\n  // TODO: find the node just before the one to drop, then unlink it\n}\n",
    hints: [
      "Two pointers with a fixed gap of n between them: when the front one reaches the end, the back one is n from the end.",
      "You need the node BEFORE the victim in order to unlink it, so aim the trailing pointer one step short.",
      "A dummy node in front of head makes 'remove the first node' behave like every other case.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction removeNthFromEnd(head, n) {\n  const dummy = new ListNode(0, head);\n  let lead = dummy;\n  let trail = dummy;\n  for (let i = 0; i < n; i++) lead = lead.next;\n  while (lead.next) {\n    lead = lead.next;\n    trail = trail.next;\n  }\n  trail.next = trail.next.next;\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "removes a node in the middle",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3,4,5]), 2)), [1,2,3,5]);",
      },
      {
        name: "removes the last node",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3]), 1)), [1,2]);",
      },
      {
        name: "removes the head when n equals the length",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3]), 3)), [2,3]);",
      },
      {
        name: "removing the only node gives null",
        body: "assert.equal(removeNthFromEnd(build([1]), 1), null);",
      },
      {
        name: "two node list, drop the first",
        body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2]), 2)), [2]);",
      },
      { name: "n further from the end in a five node list", body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3,4,5]), 4)), [1,3,4,5]);" },
      { name: "n equal to the length removes the head", body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2,3,4,5]), 5)), [2,3,4,5]);" },
      { name: "removes the last node of a two node list", body: "assert.deepEqual(toArray(removeNthFromEnd(build([1,2]), 1)), [1]);" },
    ],
  },
{
    id: "ex-palindrome-linked-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Palindrome Linked List",
    brief:
      "<p>Decide whether the values in a singly linked list read the same forwards and backwards. Return <code>true</code> or <code>false</code>.</p><ul><li>Use <b>O(1) extra space</b> — copying the values into an array is the answer we are not looking for</li><li>Runs in O(n) time</li><li>The empty list and any single node list are palindromes</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction isPalindrome(head) {\n  // TODO: compare the front half against the back half without extra storage\n}\n",
    hints: [
      "You cannot walk a singly linked list backwards — but you can make half of it point backwards.",
      "Find the middle with slow/fast, reverse the second half in place, then walk the two halves in step.",
      "Stop comparing when the reversed half runs out; that handles odd lengths, where the exact middle node is ignored.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction isPalindrome(head) {\n  if (!head || !head.next) return true;\n  let slow = head;\n  let fast = head;\n  while (fast.next && fast.next.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  let prev = null;\n  let cur = slow.next;\n  while (cur) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  let front = head;\n  let back = prev;\n  let ok = true;\n  while (back) {\n    if (front.val !== back.val) {\n      ok = false;\n      break;\n    }\n    front = front.next;\n    back = back.next;\n  }\n  return ok;\n}\n",
    tests: [
      {
        name: "even length palindrome",
        body: "assert.equal(isPalindrome(build([1,2,2,1])), true);",
      },
      {
        name: "odd length palindrome",
        body: "assert.equal(isPalindrome(build([1,2,3,2,1])), true);",
      },
      {
        name: "not a palindrome",
        body: "assert.equal(isPalindrome(build([1,2])), false);",
      },
      {
        name: "long odd list that differs in the middle",
        body: "assert.equal(isPalindrome(build([1,2,3,4,1])), false);",
      },
      {
        name: "single node and empty list",
        body: "assert.equal(isPalindrome(build([7])), true);\nassert.equal(isPalindrome(null), true);",
      },
      { name: "two identical elements", body: "assert.equal(isPalindrome(build([3,3])), true);" },
      { name: "an even length list that is not a palindrome", body: "assert.equal(isPalindrome(build([1,2,3,4])), false);" },
      { name: "a longer palindrome with repeated values", body: "assert.equal(isPalindrome(build([1,1,2,1,1])), true);" },
    ],
  },
{
    id: "ex-intersection-of-two-lists",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Intersection of Two Linked Lists",
    brief:
      "<p>Two singly linked lists may merge and share a common tail. Return the first node they share, or <code>null</code> if they never meet.</p><ul><li>Sharing means the <b>same node object</b>, not merely equal values</li><li>The lists may have different lengths</li><li>Do not modify either list; aim for O(1) extra space</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction tailOf(head) {\n  let n = head;\n  while (n && n.next) n = n.next;\n  return n;\n}\n\nfunction getIntersectionNode(a, b) {\n  // TODO: line the two lists up so they reach the shared part together\n}\n",
    hints: [
      "The two lists have different lengths before the join, but identical lengths after it. Cancel out the difference.",
      "One way: measure both lengths, then advance the longer list's pointer by the difference before stepping in lockstep.",
      "Slicker: when a pointer falls off the end of its own list, restart it at the other list's head. Both then travel lenA + lenB and meet at the join (or at null together).",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction tailOf(head) {\n  let n = head;\n  while (n && n.next) n = n.next;\n  return n;\n}\n\nfunction getIntersectionNode(a, b) {\n  if (!a || !b) return null;\n  let p = a;\n  let q = b;\n  while (p !== q) {\n    p = p ? p.next : b;\n    q = q ? q.next : a;\n  }\n  return p;\n}\n",
    tests: [
      {
        name: "finds the shared node object",
        body: "const shared = build([8,4,5]);\nconst a = build([4,1]);\nconst b = build([5,6,1]);\ntailOf(a).next = shared;\ntailOf(b).next = shared;\nconst got = getIntersectionNode(a, b);\nassert.ok(got === shared, 'must return the shared node itself');\nassert.equal(got.val, 8);",
      },
      {
        name: "equal values but no shared nodes",
        body: "const a = build([1,2,3]);\nconst b = build([1,2,3]);\nassert.equal(getIntersectionNode(a, b), null);",
      },
      {
        name: "one list is entirely the shared tail",
        body: "const shared = build([9,10]);\nconst a = build([1,2,3]);\ntailOf(a).next = shared;\nconst got = getIntersectionNode(a, shared);\nassert.ok(got === shared);",
      },
      {
        name: "intersection at the very last node",
        body: "const shared = new ListNode(99);\nconst a = build([1,2,3,4]);\nconst b = build([7]);\ntailOf(a).next = shared;\ntailOf(b).next = shared;\nassert.ok(getIntersectionNode(a, b) === shared);",
      },
      {
        name: "an empty list never intersects",
        body: "assert.equal(getIntersectionNode(null, build([1,2])), null);",
      },
      { name: "a list intersects with itself at its own head", body: "const a = build([1,2,3]);\nassert.ok(getIntersectionNode(a, a) === a);" },
      { name: "both lists empty", body: "assert.equal(getIntersectionNode(null, null), null);" },
      { name: "two equal length lists sharing a short tail", body: "const shared = build([5]);\nconst a = build([1,2]);\nconst b = build([9,9]);\ntailOf(a).next = shared;\ntailOf(b).next = shared;\nassert.ok(getIntersectionNode(a, b) === shared);" },
    ],
  },
{
    id: "ex-add-two-numbers-linked-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Add Two Numbers",
    brief:
      "<p>Two non-negative integers are stored as linked lists with one digit per node, <b>least significant digit first</b>. Add them and return the sum in the same format.</p><ul><li>So <code>[2,4,3]</code> means 342 and <code>[5,6,4]</code> means 465; the sum 807 is <code>[7,0,8]</code></li><li>The lists may have different lengths</li><li>A final carry needs an extra node</li><li>Do not join the digits into a JavaScript number — assume the values overflow</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction addTwoNumbers(a, b) {\n  // TODO: add digit by digit, carrying as you go\n}\n",
    hints: [
      "Reverse order is a gift: the heads are the ones column, so you can add left to right exactly like on paper.",
      "Keep looping while either list has digits left OR the carry is still non-zero.",
      "Treat a missing digit as 0; the new digit is sum % 10 and the next carry is Math.floor(sum / 10).",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction addTwoNumbers(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  let carry = 0;\n  while (a || b || carry) {\n    const sum = (a ? a.val : 0) + (b ? b.val : 0) + carry;\n    carry = Math.floor(sum / 10);\n    tail.next = new ListNode(sum % 10);\n    tail = tail.next;\n    if (a) a = a.next;\n    if (b) b = b.next;\n  }\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "342 + 465 = 807",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([2,4,3]), build([5,6,4]))), [7,0,8]);",
      },
      {
        name: "0 + 0 = 0",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([0]), build([0]))), [0]);",
      },
      {
        name: "carry ripples all the way out",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([9,9,9]), build([1]))), [0,0,0,1]);",
      },
      {
        name: "different lengths",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([9,9,9,9]), build([9,9]))), [8,9,0,0,1]);",
      },
      {
        name: "single digits with no carry",
        body: "assert.deepEqual(toArray(addTwoNumbers(build([5]), build([4]))), [9]);",
      },
      { name: "two single digit numbers that carry into a new node", body: "assert.deepEqual(toArray(addTwoNumbers(build([9]), build([9]))), [8,1]);" },
      { name: "same length numbers with no carries", body: "assert.deepEqual(toArray(addTwoNumbers(build([1,2,3]), build([4,5,6]))), [5,7,9]);" },
      { name: "the second list is longer than the first", body: "assert.deepEqual(toArray(addTwoNumbers(build([5]), build([5,5]))), [0,6]);" },
    ],
  },
{
    id: "ex-merge-k-sorted-lists",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Merge K Sorted Lists",
    brief:
      "<p>You are given an array of linked list heads, each list sorted in non-decreasing order. Merge all of them into one sorted list and return its head.</p><ul><li>The array may be empty, and individual entries may be <code>null</code></li><li>Merging them one at a time into an accumulator is O(k*n) — pairing them up is O(n log k)</li><li>Return <code>null</code> when there is nothing to merge</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeKLists(lists) {\n  // TODO: combine the lists so no element gets copied k times\n}\n",
    hints: [
      "Start from the two-list merge you already know — the whole problem is deciding which pairs to merge and in what order.",
      "Folding list 2 into list 1, then 3 into that, rescans the growing accumulator every time. Merge them in pairs instead, halving the count each round.",
      "Repeat: walk the array taking lists[i] and lists[i + 1], merge each pair into a new array, until only one list remains.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeTwo(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) {\n      tail.next = a;\n      a = a.next;\n    } else {\n      tail.next = b;\n      b = b.next;\n    }\n    tail = tail.next;\n  }\n  tail.next = a || b;\n  return dummy.next;\n}\n\nfunction mergeKLists(lists) {\n  if (!lists || lists.length === 0) return null;\n  let round = lists.slice();\n  while (round.length > 1) {\n    const next = [];\n    for (let i = 0; i < round.length; i += 2) {\n      next.push(mergeTwo(round[i], i + 1 < round.length ? round[i + 1] : null));\n    }\n    round = next;\n  }\n  return round[0];\n}\n",
    tests: [
      {
        name: "merges three sorted lists",
        body: "const out = mergeKLists([build([1,4,5]), build([1,3,4]), build([2,6])]);\nassert.deepEqual(toArray(out), [1,1,2,3,4,4,5,6]);",
      },
      {
        name: "empty array of lists",
        body: "assert.equal(mergeKLists([]), null);",
      },
      {
        name: "array holding only null lists",
        body: "assert.equal(mergeKLists([null, null]), null);",
      },
      {
        name: "single list passes through",
        body: "assert.deepEqual(toArray(mergeKLists([build([2,7,9])])), [2,7,9]);",
      },
      {
        name: "odd count with gaps and negatives",
        body: "const out = mergeKLists([build([-5,0]), null, build([-9,-1,3]), build([]), build([7])]);\nassert.deepEqual(toArray(out), [-9,-5,-1,0,3,7]);",
      },
      { name: "two lists only", body: "assert.deepEqual(toArray(mergeKLists([build([1,3]), build([2,4])])), [1,2,3,4]);" },
      { name: "duplicate values across lists", body: "assert.deepEqual(toArray(mergeKLists([build([1,1]), build([1,1])])), [1,1,1,1]);" },
      { name: "four single-node lists", body: "assert.deepEqual(toArray(mergeKLists([build([1]), build([2]), build([3]), build([4])])), [1,2,3,4]);" },
    ],
  },
{
    id: "ex-copy-list-with-random-pointer",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Copy List with Random Pointer",
    brief:
      "<p>Every node here has a <code>next</code> pointer and an extra <code>random</code> pointer that may aim at any node in the list or at <code>null</code>. Produce a <b>deep copy</b>: a brand new set of nodes whose pointers mirror the original's shape.</p><ul><li>No node in the returned list may be a node from the input list</li><li>If the original's random points at the 3rd node, the copy's random must point at the copy's 3rd node</li><li><code>serialize(head)</code> is provided for the tests: it renders a list as pairs of <code>[val, randomIndex]</code></li></ul>",
    starter:
      "class Node {\n  constructor(val, next, random) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n    this.random = random === undefined ? null : random;\n  }\n}\nfunction build(pairs) {\n  const nodes = pairs.map((p) => new Node(p[0]));\n  for (let i = 0; i < nodes.length; i++) {\n    nodes[i].next = i + 1 < nodes.length ? nodes[i + 1] : null;\n    nodes[i].random = pairs[i][1] === null ? null : nodes[pairs[i][1]];\n  }\n  return nodes.length ? nodes[0] : null;\n}\nfunction serialize(head) {\n  const nodes = [];\n  for (let n = head; n; n = n.next) nodes.push(n);\n  const index = new Map();\n  for (let i = 0; i < nodes.length; i++) index.set(nodes[i], i);\n  return nodes.map((n) => [n.val, n.random ? index.get(n.random) : null]);\n}\n\nfunction copyRandomList(head) {\n  // TODO: clone every node, then wire up next and random on the clones\n}\n",
    hints: [
      "The trouble is that when you clone node i, the node its random points at may not exist yet.",
      "Two passes fix it: first create all the clones and remember the original -> clone correspondence, then make a second pass to set next and random using that mapping.",
      "A Map keyed by the original node objects is the simplest correspondence. (The O(1)-space trick is to weave each clone in right after its original, then unweave.)",
    ],
    solution:
      "class Node {\n  constructor(val, next, random) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n    this.random = random === undefined ? null : random;\n  }\n}\nfunction build(pairs) {\n  const nodes = pairs.map((p) => new Node(p[0]));\n  for (let i = 0; i < nodes.length; i++) {\n    nodes[i].next = i + 1 < nodes.length ? nodes[i + 1] : null;\n    nodes[i].random = pairs[i][1] === null ? null : nodes[pairs[i][1]];\n  }\n  return nodes.length ? nodes[0] : null;\n}\nfunction serialize(head) {\n  const nodes = [];\n  for (let n = head; n; n = n.next) nodes.push(n);\n  const index = new Map();\n  for (let i = 0; i < nodes.length; i++) index.set(nodes[i], i);\n  return nodes.map((n) => [n.val, n.random ? index.get(n.random) : null]);\n}\n\nfunction copyRandomList(head) {\n  if (!head) return null;\n  const clones = new Map();\n  for (let n = head; n; n = n.next) clones.set(n, new Node(n.val));\n  for (let n = head; n; n = n.next) {\n    const copy = clones.get(n);\n    copy.next = n.next ? clones.get(n.next) : null;\n    copy.random = n.random ? clones.get(n.random) : null;\n  }\n  return clones.get(head);\n}\n",
    tests: [
      {
        name: "copies values and random targets",
        body: "const head = build([[7,null],[13,0],[11,4],[10,2],[1,0]]);\nconst copy = copyRandomList(head);\nassert.deepEqual(serialize(copy), [[7,null],[13,0],[11,4],[10,2],[1,0]]);",
      },
      {
        name: "returns genuinely new nodes",
        body: "const head = build([[1,1],[2,1]]);\nconst copy = copyRandomList(head);\nconst originals = new Set();\nfor (let n = head; n; n = n.next) originals.add(n);\nlet reused = false;\nfor (let n = copy; n; n = n.next) if (originals.has(n)) reused = true;\nassert.ok(!reused, 'the copy must not reuse original nodes');\nassert.ok(copy.random === copy.next, 'random must point inside the copy');",
      },
      {
        name: "node whose random points at itself",
        body: "const head = build([[3,0]]);\nconst copy = copyRandomList(head);\nassert.deepEqual(serialize(copy), [[3,0]]);\nassert.ok(copy.random === copy);",
      },
      {
        name: "all randoms null",
        body: "const copy = copyRandomList(build([[1,null],[2,null],[3,null]]));\nassert.deepEqual(serialize(copy), [[1,null],[2,null],[3,null]]);",
      },
      {
        name: "empty list copies to null",
        body: "assert.equal(copyRandomList(null), null);",
      },
      { name: "a longer chain with backward-pointing randoms", body: "const head = build([[1,null],[2,0],[3,1]]);\nconst copy = copyRandomList(head);\nassert.deepEqual(serialize(copy), [[1,null],[2,0],[3,1]]);" },
      { name: "two nodes whose randoms point at each other", body: "const head = build([[1,1],[2,0]]);\nconst copy = copyRandomList(head);\nassert.deepEqual(serialize(copy), [[1,1],[2,0]]);\nassert.ok(copy.random !== head.next);" },
      { name: "a single node with a null random", body: "const copy = copyRandomList(build([[5,null]]));\nassert.deepEqual(serialize(copy), [[5,null]]);" },
    ],
  },
{
    id: "ex-reorder-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Reorder List",
    brief:
      "<p>Rearrange a list <code>n0 -> n1 -> ... -> nk</code> into <code>n0 -> nk -> n1 -> nk-1 -> ...</code>, alternating from the front and the back.</p><ul><li>Reorder the nodes <b>in place</b> — the function returns nothing</li><li>Only relink nodes; do not swap their <code>val</code> fields</li><li>Lists of length 0, 1 or 2 come out unchanged</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reorderList(head) {\n  // TODO: rearrange the nodes in place, returning nothing\n}\n",
    hints: [
      "You need to consume the list from both ends at once, but a singly linked list only goes forwards.",
      "Three phases: split at the middle, reverse the second half, then zip the two halves together alternately.",
      "After splitting, cut the first half loose (set the middle node's next to null) or your zip will loop forever.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reorderList(head) {\n  if (!head || !head.next) return;\n  let slow = head;\n  let fast = head;\n  while (fast.next && fast.next.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  let second = slow.next;\n  slow.next = null;\n  let prev = null;\n  while (second) {\n    const next = second.next;\n    second.next = prev;\n    prev = second;\n    second = next;\n  }\n  let front = head;\n  let back = prev;\n  while (back) {\n    const f = front.next;\n    const b = back.next;\n    front.next = back;\n    back.next = f;\n    front = f;\n    back = b;\n  }\n}\n",
    tests: [
      {
        name: "even length list",
        body: "const head = build([1,2,3,4]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,4,2,3]);",
      },
      {
        name: "odd length list",
        body: "const head = build([1,2,3,4,5]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,5,2,4,3]);",
      },
      {
        name: "two nodes stay put",
        body: "const head = build([1,2]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,2]);",
      },
      {
        name: "single node stays put",
        body: "const head = build([9]);\nreorderList(head);\nassert.deepEqual(toArray(head), [9]);",
      },
      {
        name: "six nodes and an empty list",
        body: "const head = build([1,2,3,4,5,6]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,6,2,5,3,4]);\nreorderList(null);",
      },
      { name: "a three node list", body: "const head = build([1,2,3]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,3,2]);" },
      { name: "a seven node list", body: "const head = build([1,2,3,4,5,6,7]);\nreorderList(head);\nassert.deepEqual(toArray(head), [1,7,2,6,3,5,4]);" },
      { name: "negative values", body: "const head = build([-1,-2,-3,-4]);\nreorderList(head);\nassert.deepEqual(toArray(head), [-1,-4,-2,-3]);" },
    ],
  },
{
    id: "ex-swap-nodes-in-pairs",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Swap Nodes in Pairs",
    brief:
      "<p>Walk the list swapping every two adjacent nodes, and return the new head.</p><ul><li>Swap the <b>nodes</b> by relinking — do not just exchange <code>val</code> fields</li><li>If the list has an odd length the final node keeps its place</li><li>Lists of length 0 or 1 are returned unchanged</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction swapPairs(head) {\n  // TODO: relink each adjacent pair, keeping the chain intact\n}\n",
    hints: [
      "Three pointers matter for each swap: the node before the pair, and the two nodes in the pair.",
      "A dummy node before head gives you a 'node before the pair' even for the very first pair — and its next is the answer.",
      "After swapping, the previous pointer must move to the node that is now second in the pair, not the one you started with.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction swapPairs(head) {\n  const dummy = new ListNode(0, head);\n  let prev = dummy;\n  while (prev.next && prev.next.next) {\n    const first = prev.next;\n    const second = first.next;\n    first.next = second.next;\n    second.next = first;\n    prev.next = second;\n    prev = first;\n  }\n  return dummy.next;\n}\n",
    tests: [
      {
        name: "swaps two full pairs",
        body: "assert.deepEqual(toArray(swapPairs(build([1,2,3,4]))), [2,1,4,3]);",
      },
      {
        name: "odd length leaves the last node alone",
        body: "assert.deepEqual(toArray(swapPairs(build([1,2,3]))), [2,1,3]);",
      },
      {
        name: "single node is unchanged",
        body: "assert.deepEqual(toArray(swapPairs(build([1]))), [1]);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(swapPairs(null), null);",
      },
      {
        name: "moves nodes rather than values",
        body: "const head = build([1,2]);\nconst first = head;\nconst second = head.next;\nconst out = swapPairs(head);\nassert.ok(out === second, 'the second node should now be the head');\nassert.ok(out.next === first);",
      },
      { name: "three full pairs", body: "assert.deepEqual(toArray(swapPairs(build([1,2,3,4,5,6]))), [2,1,4,3,6,5]);" },
      { name: "two pairs and a leftover node", body: "assert.deepEqual(toArray(swapPairs(build([1,2,3,4,5]))), [2,1,4,3,5]);" },
      { name: "negative values", body: "assert.deepEqual(toArray(swapPairs(build([0,-1,-2,-3]))), [-1,0,-3,-2]);" },
    ],
  },
{
    id: "ex-reverse-nodes-in-k-group",
    chapter: "dsa-linked-lists",
    level: "advanced",
    title: "Reverse Nodes in k-Group",
    brief:
      "<p>Reverse the list in consecutive blocks of <code>k</code> nodes and return the new head.</p><ul><li>If fewer than <code>k</code> nodes remain at the end, leave that leftover chunk as it is</li><li>With <code>k = 1</code> nothing changes; with <code>k</code> equal to the length the whole list reverses</li><li>Relink nodes rather than rewriting values</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseKGroup(head, k) {\n  // TODO: reverse each full block of k nodes, leaving a short tail alone\n}\n",
    hints: [
      "Before reversing a block, check that k nodes actually exist — otherwise you must not touch it.",
      "Walk k steps ahead first. If you hit null on the way, return the rest of the list untouched.",
      "Reverse exactly k nodes with the usual prev/cur loop, then reconnect: the block's original head becomes its tail and must point at whatever the next block returns.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction reverseKGroup(head, k) {\n  if (k <= 1 || !head) return head;\n  let probe = head;\n  for (let i = 0; i < k; i++) {\n    if (!probe) return head;\n    probe = probe.next;\n  }\n  let prev = null;\n  let cur = head;\n  for (let i = 0; i < k; i++) {\n    const next = cur.next;\n    cur.next = prev;\n    prev = cur;\n    cur = next;\n  }\n  head.next = reverseKGroup(cur, k);\n  return prev;\n}\n",
    tests: [
      {
        name: "k of 2 on an even length list",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3,4]), 2)), [2,1,4,3]);",
      },
      {
        name: "leftover chunk stays in order",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3,4,5]), 3)), [3,2,1,4,5]);",
      },
      {
        name: "k larger than the list leaves it alone",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3]), 5)), [1,2,3]);",
      },
      {
        name: "k of 1 changes nothing",
        body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3]), 1)), [1,2,3]);",
      },
      {
        name: "empty list and exact multiple",
        body: "assert.equal(reverseKGroup(null, 3), null);\nassert.deepEqual(toArray(reverseKGroup(build([1,2,3,4,5,6]), 3)), [3,2,1,6,5,4]);",
      },
      { name: "k equal to the full list length reverses everything", body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3,4]), 4)), [4,3,2,1]);" },
      { name: "k of 2 with a leftover node", body: "assert.deepEqual(toArray(reverseKGroup(build([1,2,3,4,5,6,7]), 2)), [2,1,4,3,6,5,7]);" },
      { name: "a single node with k greater than the length", body: "assert.deepEqual(toArray(reverseKGroup(build([1]), 2)), [1]);" },
    ],
  },
{
    id: "ex-rotate-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Rotate List",
    brief:
      "<p>Rotate a linked list to the right by <code>k</code> places and return the new head. Each rotation moves the last node to the front.</p><ul><li><code>k</code> can be far larger than the list length</li><li><code>k</code> is non-negative; <code>k = 0</code> changes nothing</li><li>Empty and single node lists come back unchanged</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction rotateRight(head, k) {\n  // TODO: rotating by the length is a no-op — use that\n}\n",
    hints: [
      "Rotating by the length brings you back to the start, so only k % length actually matters.",
      "You need the length anyway — measure it while walking to the tail.",
      "Close the list into a ring by pointing the tail at the head, step to the new tail, then break the ring there.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction rotateRight(head, k) {\n  if (!head || !head.next) return head;\n  let length = 1;\n  let tail = head;\n  while (tail.next) {\n    tail = tail.next;\n    length++;\n  }\n  const shift = k % length;\n  if (shift === 0) return head;\n  tail.next = head;\n  let newTail = head;\n  for (let i = 0; i < length - shift - 1; i++) newTail = newTail.next;\n  const newHead = newTail.next;\n  newTail.next = null;\n  return newHead;\n}\n",
    tests: [
      {
        name: "rotates by two",
        body: "assert.deepEqual(toArray(rotateRight(build([1,2,3,4,5]), 2)), [4,5,1,2,3]);",
      },
      {
        name: "k larger than the length wraps",
        body: "assert.deepEqual(toArray(rotateRight(build([0,1,2]), 4)), [2,0,1]);",
      },
      {
        name: "k equal to the length is a no-op",
        body: "assert.deepEqual(toArray(rotateRight(build([1,2,3]), 3)), [1,2,3]);",
      },
      {
        name: "k of zero is a no-op",
        body: "assert.deepEqual(toArray(rotateRight(build([1,2]), 0)), [1,2]);",
      },
      {
        name: "empty and single node lists",
        body: "assert.equal(rotateRight(null, 7), null);\nassert.deepEqual(toArray(rotateRight(build([9]), 5)), [9]);",
      },
      { name: "rotate by one", body: "assert.deepEqual(toArray(rotateRight(build([1,2,3,4]), 1)), [4,1,2,3]);" },
      { name: "k far larger than the length wraps around several times", body: "assert.deepEqual(toArray(rotateRight(build([1,2,3]), 100)), [3,1,2]);" },
      { name: "a two node list rotated by one", body: "assert.deepEqual(toArray(rotateRight(build([1,2]), 1)), [2,1]);" },
    ],
  },
{
    id: "ex-partition-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Partition List",
    brief:
      "<p>Given a list and a value <code>x</code>, rearrange it so that every node with a value less than <code>x</code> comes before every node with a value greater than or equal to <code>x</code>.</p><ul><li>The <b>relative order within each group must be preserved</b> — this is a stable partition</li><li>No node with value <code>x</code> itself is special; it belongs in the second group</li><li>Return the head of the rearranged list</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction partition(head, x) {\n  // TODO: separate the nodes into two chains, then join them\n}\n",
    hints: [
      "Swapping nodes around in place is painful. What if you took the list apart into two lists instead?",
      "Append each node to a 'less than x' chain or a 'at least x' chain as you walk, then link the first chain's tail to the second chain's head.",
      "Appending in the order you meet nodes keeps things stable automatically. Do not forget to terminate the second chain with null, or you will create a cycle.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction partition(head, x) {\n  const lessHead = new ListNode(0);\n  const restHead = new ListNode(0);\n  let less = lessHead;\n  let rest = restHead;\n  for (let n = head; n; n = n.next) {\n    if (n.val < x) {\n      less.next = n;\n      less = n;\n    } else {\n      rest.next = n;\n      rest = n;\n    }\n  }\n  rest.next = null;\n  less.next = restHead.next;\n  return lessHead.next;\n}\n",
    tests: [
      {
        name: "partitions and keeps order",
        body: "assert.deepEqual(toArray(partition(build([1,4,3,2,5,2]), 3)), [1,2,2,4,3,5]);",
      },
      {
        name: "every value is already below x",
        body: "assert.deepEqual(toArray(partition(build([1,2,3]), 10)), [1,2,3]);",
      },
      {
        name: "every value is at least x",
        body: "assert.deepEqual(toArray(partition(build([5,6,7]), 5)), [5,6,7]);",
      },
      {
        name: "negatives and a single node",
        body: "assert.deepEqual(toArray(partition(build([2,-1,0,-4]), 0)), [-1,-4,2,0]);\nassert.deepEqual(toArray(partition(build([1]), 2)), [1]);",
      },
      {
        name: "empty list returns null",
        body: "assert.equal(partition(null, 3), null);",
      },
      { name: "x equal to the smallest value moves nothing new out", body: "assert.deepEqual(toArray(partition(build([3,1,2]), 1)), [3,1,2]);" },
      { name: "several values equal to x land in the second group in order", body: "assert.deepEqual(toArray(partition(build([1,4,3,0,2,5,2]), 3)), [1,0,2,2,4,3,5]);" },
      { name: "x below every value", body: "assert.deepEqual(toArray(partition(build([-5,-3,-1]), -10)), [-5,-3,-1]);" },
    ],
  },
{
    id: "ex-remove-duplicates-sorted-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Remove Duplicates from Sorted List",
    brief:
      "<p>The list is sorted in non-decreasing order. Delete the repeats so that every value appears exactly once, and return the head.</p><ul><li>Keep the first occurrence of each value</li><li>Because the list is sorted, duplicates are always adjacent</li><li>Modify the list in place — no new nodes</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction deleteDuplicates(head) {\n  // TODO: skip over any node whose value matches the one before it\n}\n",
    hints: [
      "Sorted means you only ever have to compare a node with its immediate neighbour.",
      "When cur.val === cur.next.val, unlink the neighbour by setting cur.next = cur.next.next — and do not advance yet.",
      "Only step forward when the two values differ, otherwise a run of three identical values loses one.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction deleteDuplicates(head) {\n  let cur = head;\n  while (cur && cur.next) {\n    if (cur.val === cur.next.val) cur.next = cur.next.next;\n    else cur = cur.next;\n  }\n  return head;\n}\n",
    tests: [
      {
        name: "collapses a simple duplicate",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([1,1,2]))), [1,2]);",
      },
      {
        name: "handles runs longer than two",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([1,1,1,2,3,3]))), [1,2,3]);",
      },
      {
        name: "already unique list is untouched",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([1,2,3]))), [1,2,3]);",
      },
      {
        name: "every value identical",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([4,4,4,4]))), [4]);",
      },
      {
        name: "single node and empty list",
        body: "assert.deepEqual(toArray(deleteDuplicates(build([7]))), [7]);\nassert.equal(deleteDuplicates(null), null);",
      },
      { name: "negative duplicate values", body: "assert.deepEqual(toArray(deleteDuplicates(build([-3,-3,-2,-1,-1]))), [-3,-2,-1]);" },
      { name: "two identical values", body: "assert.deepEqual(toArray(deleteDuplicates(build([5,5]))), [5]);" },
      { name: "several short runs in a row", body: "assert.deepEqual(toArray(deleteDuplicates(build([1,1,2,2,3,3,4]))), [1,2,3,4]);" },
    ],
  },
{
    id: "ex-delete-node-in-linked-list",
    chapter: "dsa-linked-lists",
    level: "beginner",
    title: "Delete Node in a Linked List",
    brief:
      "<p>You are given <b>only the node to delete</b> — not the head of the list. Remove it so that walking the list from the original head no longer shows its value.</p><ul><li>The node is guaranteed not to be the last node in the list</li><li>All values in the list are distinct</li><li>Everything else must keep its order; the function returns nothing</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\n\nfunction deleteNode(node) {\n  // TODO: you cannot reach the previous node — work with what you have\n}\n",
    hints: [
      "Without the previous node you can never unlink this node object itself. So stop trying to.",
      "Nothing says the node object has to disappear — only that its value must vanish from the sequence.",
      "Copy the next node's value into this node, then unlink the next node instead.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\n\nfunction deleteNode(node) {\n  node.val = node.next.val;\n  node.next = node.next.next;\n}\n",
    tests: [
      {
        name: "removes a node from the middle",
        body: "const head = build([4,5,1,9]);\ndeleteNode(nodeAt(head, 1));\nassert.deepEqual(toArray(head), [4,1,9]);",
      },
      {
        name: "removes the second to last node",
        body: "const head = build([4,5,1,9]);\ndeleteNode(nodeAt(head, 2));\nassert.deepEqual(toArray(head), [4,5,9]);",
      },
      {
        name: "removes the head node",
        body: "const head = build([1,2,3]);\ndeleteNode(head);\nassert.deepEqual(toArray(head), [2,3]);",
      },
      {
        name: "two node list",
        body: "const head = build([7,8]);\ndeleteNode(head);\nassert.deepEqual(toArray(head), [8]);",
      },
      {
        name: "the list shortens by exactly one",
        body: "const head = build([10,20,30,40,50]);\ndeleteNode(nodeAt(head, 3));\nassert.deepEqual(toArray(head), [10,20,30,50]);",
      },
      { name: "removes the head from a list of negative values", body: "const head = build([-1,-2,-3,-4]);\ndeleteNode(head);\nassert.deepEqual(toArray(head), [-2,-3,-4]);" },
      { name: "removes a node from a six node list", body: "const head = build([1,2,3,4,5,6]);\ndeleteNode(nodeAt(head, 1));\nassert.deepEqual(toArray(head), [1,3,4,5,6]);" },
      { name: "deletion is by position, not by value", body: "const head = build([7,7,7,7]);\ndeleteNode(nodeAt(head, 1));\nassert.deepEqual(toArray(head), [7,7,7]);" },
    ],
  },
{
    id: "ex-sort-linked-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Sort List",
    brief:
      "<p>Sort a linked list into non-decreasing order and return the new head.</p><ul><li>Must run in <b>O(n log n)</b> time — merge sort is the natural fit for linked lists</li><li>Relink the existing nodes; do not dump the values into an array and sort that</li><li>Values may be negative and may repeat</li></ul>",
    starter:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction sortList(head) {\n  // TODO: split, sort each half, merge\n}\n",
    hints: [
      "Quicksort needs random access; merge sort only needs sequential access, which is all a linked list offers.",
      "Split with slow/fast pointers, and remember to cut the first half loose by nulling the middle node's next.",
      "The base case is a list of length 0 or 1. Merging two sorted lists is the same routine as Merge Two Sorted Lists.",
    ],
    solution:
      "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction mergeSorted(a, b) {\n  const dummy = new ListNode(0);\n  let tail = dummy;\n  while (a && b) {\n    if (a.val <= b.val) {\n      tail.next = a;\n      a = a.next;\n    } else {\n      tail.next = b;\n      b = b.next;\n    }\n    tail = tail.next;\n  }\n  tail.next = a || b;\n  return dummy.next;\n}\n\nfunction sortList(head) {\n  if (!head || !head.next) return head;\n  let slow = head;\n  let fast = head.next;\n  while (fast && fast.next) {\n    slow = slow.next;\n    fast = fast.next.next;\n  }\n  const second = slow.next;\n  slow.next = null;\n  return mergeSorted(sortList(head), sortList(second));\n}\n",
    tests: [
      {
        name: "sorts an unordered list",
        body: "assert.deepEqual(toArray(sortList(build([4,2,1,3]))), [1,2,3,4]);",
      },
      {
        name: "handles negatives and duplicates",
        body: "assert.deepEqual(toArray(sortList(build([-1,5,3,4,0,-1]))), [-1,-1,0,3,4,5]);",
      },
      {
        name: "already sorted list stays sorted",
        body: "assert.deepEqual(toArray(sortList(build([1,2,3,4,5]))), [1,2,3,4,5]);",
      },
      {
        name: "single node and empty list",
        body: "assert.deepEqual(toArray(sortList(build([1]))), [1]);\nassert.equal(sortList(null), null);",
      },
      {
        name: "reversed list of a thousand values",
        body: "const values = [];\nfor (let i = 1000; i >= 1; i--) values.push(i);\nconst sorted = toArray(sortList(build(values)));\nassert.equal(sorted.length, 1000);\nassert.equal(sorted[0], 1);\nassert.equal(sorted[999], 1000);\nlet ordered = true;\nfor (let i = 1; i < sorted.length; i++) if (sorted[i - 1] > sorted[i]) ordered = false;\nassert.ok(ordered);",
      },
      { name: "a two element unordered list", body: "assert.deepEqual(toArray(sortList(build([2,1]))), [1,2]);" },
      { name: "a fully reversed list", body: "assert.deepEqual(toArray(sortList(build([5,4,3,2,1]))), [1,2,3,4,5]);" },
      { name: "every value identical", body: "assert.deepEqual(toArray(sortList(build([3,3,3]))), [3,3,3]);" },
    ],
  },
{
    id: "ex-flatten-multilevel-doubly-list",
    chapter: "dsa-linked-lists",
    level: "intermediate",
    title: "Flatten a Multilevel Doubly Linked List",
    brief:
      "<p>Each node in this doubly linked list has <code>prev</code>, <code>next</code> and an optional <code>child</code> pointer to another doubly linked list, which may itself have children. Flatten everything into a single level, then return the head.</p><ul><li>A child list is spliced in immediately after its parent node and before whatever followed it</li><li>Afterwards every <code>child</code> must be <code>null</code> and every <code>prev</code> must point at the real predecessor</li><li><code>serialize(head)</code> is provided for the tests: per node it reports <code>[val, prevIsCorrect, childIsNull]</code></li></ul>",
    starter:
      "class Node {\n  constructor(val, prev, next, child) {\n    this.val = val === undefined ? 0 : val;\n    this.prev = prev === undefined ? null : prev;\n    this.next = next === undefined ? null : next;\n    this.child = child === undefined ? null : child;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  let prev = null;\n  for (const v of arr) {\n    const node = new Node(v);\n    node.prev = prev;\n    if (prev) prev.next = node;\n    else head = node;\n    prev = node;\n  }\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\nfunction serialize(head) {\n  const out = [];\n  let prev = null;\n  for (let n = head; n; n = n.next) {\n    out.push([n.val, n.prev === prev, n.child === null]);\n    prev = n;\n  }\n  return out;\n}\n\nfunction flatten(head) {\n  // TODO: splice each child list in after its parent, deepest first\n}\n",
    hints: [
      "Think of it as repeatedly inserting one list into another: when you meet a node with a child, the child list must sit between that node and its current next.",
      "Save the current next before you overwrite it, attach the child, walk to the child list's tail, then reattach the saved next there.",
      "Clear child to null after splicing, and fix both prev pointers you touched. Because you keep walking forward from the parent, nested children get handled automatically.",
    ],
    solution:
      "class Node {\n  constructor(val, prev, next, child) {\n    this.val = val === undefined ? 0 : val;\n    this.prev = prev === undefined ? null : prev;\n    this.next = next === undefined ? null : next;\n    this.child = child === undefined ? null : child;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  let prev = null;\n  for (const v of arr) {\n    const node = new Node(v);\n    node.prev = prev;\n    if (prev) prev.next = node;\n    else head = node;\n    prev = node;\n  }\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) out.push(n.val);\n  return out;\n}\nfunction nodeAt(head, i) {\n  let n = head;\n  while (i-- > 0 && n) n = n.next;\n  return n;\n}\nfunction serialize(head) {\n  const out = [];\n  let prev = null;\n  for (let n = head; n; n = n.next) {\n    out.push([n.val, n.prev === prev, n.child === null]);\n    prev = n;\n  }\n  return out;\n}\n\nfunction flatten(head) {\n  let cur = head;\n  while (cur) {\n    if (cur.child) {\n      const after = cur.next;\n      const childHead = cur.child;\n      cur.child = null;\n      cur.next = childHead;\n      childHead.prev = cur;\n      let tail = childHead;\n      while (tail.next) tail = tail.next;\n      tail.next = after;\n      if (after) after.prev = tail;\n    }\n    cur = cur.next;\n  }\n  return head;\n}\n",
    tests: [
      {
        name: "flattens two levels of nesting",
        body: "const head = build([1,2,3,4,5,6]);\nconst child1 = build([7,8,9,10]);\nconst child2 = build([11,12]);\nnodeAt(head, 2).child = child1;\nnodeAt(child1, 1).child = child2;\nassert.deepEqual(toArray(flatten(head)), [1,2,3,7,8,11,12,9,10,4,5,6]);",
      },
      {
        name: "repairs prev pointers and clears child",
        body: "const head = build([1,2,3]);\nnodeAt(head, 0).child = build([4,5]);\nconst flat = flatten(head);\nassert.deepEqual(serialize(flat), [\n  [1,true,true],[4,true,true],[5,true,true],[2,true,true],[3,true,true],\n]);",
      },
      {
        name: "child hanging off the last node",
        body: "const head = build([1,2]);\nnodeAt(head, 1).child = build([3,4]);\nconst flat = flatten(head);\nassert.deepEqual(toArray(flat), [1,2,3,4]);\nassert.equal(nodeAt(flat, 3).next, null);",
      },
      {
        name: "no children leaves the list alone",
        body: "const head = build([1,2,3]);\nassert.deepEqual(toArray(flatten(head)), [1,2,3]);",
      },
      {
        name: "single node with a child, and the empty list",
        body: "const head = build([1]);\nhead.child = build([2]);\nassert.deepEqual(toArray(flatten(head)), [1,2]);\nassert.equal(flatten(null), null);",
      },
      { name: "a child list attached to a middle node, not the first or last", body: "const head = build([1,2,3]);\nnodeAt(head, 1).child = build([9,8]);\nassert.deepEqual(toArray(flatten(head)), [1,2,9,8,3]);" },
      { name: "two separate children get spliced into their own places", body: "const head = build([1,2,3,4]);\nnodeAt(head, 0).child = build([10]);\nnodeAt(head, 3).child = build([20]);\nassert.deepEqual(toArray(flatten(head)), [1,10,2,3,4,20]);" },
      { name: "three levels of nested children unwind depth first", body: "const head = build([1,2]);\nconst c1 = build([3,4]);\nconst c2 = build([5,6]);\nconst c3 = build([7]);\nnodeAt(head, 0).child = c1;\nnodeAt(c1, 0).child = c2;\nnodeAt(c2, 0).child = c3;\nassert.deepEqual(toArray(flatten(head)), [1,3,5,7,6,4,2]);" },
    ],
  },
];
