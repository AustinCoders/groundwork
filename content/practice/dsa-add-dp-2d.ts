import type { Exercise } from "../types";

export const dsaAddDp2d: Exercise[] = [
  {
    id: "ex-lcs-string",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Longest Common Subsequence — Return the String",
    brief:
      "<p>Given two strings <code>a</code> and <code>b</code>, return a <b>longest common subsequence</b> as a string, not just its length. A subsequence keeps the original order of its characters but may skip characters in between.</p><ul><li>When several subsequences are equally long, any one of them is accepted</li><li>If the strings share no character, return the empty string</li><li>Build the table first, then walk back from the bottom-right cell to read the answer out of it</li><li>Target complexity: O(a.length × b.length) time</li></ul>",
    starter:
      "function lcsString(a, b) {\n  // TODO: fill the (a.length + 1) x (b.length + 1) table, then walk back from the corner\n}\n",
    hints: [
      "Compute the usual LCS length table first. dp[i][j] is the LCS length of the first i characters of a and the first j of b.",
      "Start at dp[a.length][b.length]. If a[i - 1] === b[j - 1], that character is in the answer: record it and move diagonally. Otherwise move to whichever neighbour, above or left, holds the larger value.",
      "You collect the characters from the end of the answer to the start, so reverse them before joining. Stop as soon as i or j reaches 0.",
    ],
    solution:
      'function lcsString(a, b) {\n  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));\n  for (let i = 1; i <= a.length; i++) {\n    for (let j = 1; j <= b.length; j++) {\n      dp[i][j] = a[i - 1] === b[j - 1] ? dp[i - 1][j - 1] + 1 : Math.max(dp[i - 1][j], dp[i][j - 1]);\n    }\n  }\n  const picked = [];\n  let i = a.length;\n  let j = b.length;\n  while (i > 0 && j > 0) {\n    if (a[i - 1] === b[j - 1]) {\n      picked.push(a[i - 1]);\n      i--;\n      j--;\n    } else if (dp[i - 1][j] >= dp[i][j - 1]) {\n      i--;\n    } else {\n      j--;\n    }\n  }\n  return picked.reverse().join("");\n}\n',
    tests: [
      { name: "a classic pair with one answer", body: 'assert.equal(lcsString("ABCB", "BDCAB"), "BCB");' },
      { name: "identical strings return the string", body: 'assert.equal(lcsString("interview", "interview"), "interview");' },
      {
        name: "no shared character returns the empty string",
        body: 'assert.equal(lcsString("abc", "xyz"), "");\nassert.equal(lcsString("aaa", "bbb"), "");',
      },
      {
        name: "an empty input returns the empty string",
        body: 'assert.equal(lcsString("", "abc"), "");\nassert.equal(lcsString("abc", ""), "");\nassert.equal(lcsString("", ""), "");',
      },
      { name: "one string inside the other", body: 'assert.equal(lcsString("ace", "abcde"), "ace");\nassert.equal(lcsString("abcde", "ace"), "ace");' },
      {
        name: "the result is a subsequence of both and as long as the best",
        body: 'const isSub = (small, big) => {\n  let k = 0;\n  for (const ch of big) if (k < small.length && small[k] === ch) k++;\n  return k === small.length;\n};\nconst cases = [\n  ["AGGTAB", "GXTXAYB", 4],\n  ["abcbdab", "bdcaba", 4],\n  ["aabbaa", "bababa", 4],\n  ["xyxyxy", "yxyxyx", 5],\n];\nfor (const [a, b, length] of cases) {\n  const got = lcsString(a, b);\n  assert.equal(got.length, length);\n  assert.ok(isSub(got, a) && isSub(got, b), got + " must be a subsequence of both");\n}',
      },
      {
        name: "a longer input stays correct",
        body: 'const a = "ab".repeat(150);\nconst b = "ba".repeat(150);\nconst got = lcsString(a, b);\nassert.equal(got.length, 299);\nlet k = 0;\nfor (const ch of a) if (k < got.length && got[k] === ch) k++;\nassert.equal(k, got.length);',
      },
    ],
  },
  {
    id: "ex-knapsack-chosen-items",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "0/1 Knapsack — Which Items?",
    brief:
      "<p>You have items with the given <code>weights</code> and <code>values</code> and a bag that holds at most <code>capacity</code> in total weight. Each item can be taken at most once.</p><p>Return the <b>indices</b> of the items in one best packing, in increasing order. The total value of the items you return must be the largest value achievable, and their total weight must not exceed the capacity.</p><ul><li>If several packings reach the best value, any of them is accepted</li><li>Return <code>[]</code> when nothing fits or nothing has a positive value</li><li>All weights are positive integers</li><li>Build the full table, then walk back to recover the items</li></ul>",
    starter:
      "function knapsackItems(weights, values, capacity) {\n  // TODO: build dp[i][w], then walk back from dp[n][capacity] to find the taken items\n}\n",
    hints: [
      "dp[i][w] is the best value using only the first i items with capacity w. Each cell either skips item i-1 or takes it and looks at dp[i - 1][w - weights[i - 1]].",
      "To recover the items, start at row n with w = capacity. If dp[i][w] differs from dp[i - 1][w], item i-1 must have been taken.",
      "When you take an item, reduce w by its weight before moving up a row. Collect indices on the way up, then reverse them so they are increasing.",
    ],
    solution:
      "function knapsackItems(weights, values, capacity) {\n  const n = weights.length;\n  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));\n  for (let i = 1; i <= n; i++) {\n    for (let w = 0; w <= capacity; w++) {\n      dp[i][w] = dp[i - 1][w];\n      if (weights[i - 1] <= w) {\n        dp[i][w] = Math.max(dp[i][w], dp[i - 1][w - weights[i - 1]] + values[i - 1]);\n      }\n    }\n  }\n  const taken = [];\n  let w = capacity;\n  for (let i = n; i >= 1; i--) {\n    if (dp[i][w] !== dp[i - 1][w]) {\n      taken.push(i - 1);\n      w -= weights[i - 1];\n    }\n  }\n  return taken.reverse();\n}\n",
    tests: [
      {
        name: "a classic case with one best packing",
        body: "assert.deepEqual(knapsackItems([1, 3, 4, 5], [1, 4, 5, 7], 7), [1, 2]);",
      },
      {
        name: "everything fits",
        body: "assert.deepEqual(knapsackItems([2, 3, 4], [3, 4, 5], 100), [0, 1, 2]);",
      },
      {
        name: "nothing fits",
        body: "assert.deepEqual(knapsackItems([5, 6], [10, 20], 4), []);\nassert.deepEqual(knapsackItems([], [], 10), []);\nassert.deepEqual(knapsackItems([1, 2], [5, 6], 0), []);",
      },
      {
        name: "the single best item beats several small ones",
        body: "assert.deepEqual(knapsackItems([10, 4, 4], [100, 30, 30], 10), [0]);",
      },
      {
        name: "two small items beat one that looks better per unit",
        body: "assert.deepEqual(knapsackItems([6, 5, 5], [10, 7, 7], 10), [1, 2]);",
      },
      {
        name: "the returned items are valid and optimal, whichever packing is chosen",
        body: "const weights = [3, 4, 2, 5, 1, 6];\nconst values = [4, 5, 3, 8, 1, 9];\nconst capacity = 11;\nconst items = knapsackItems(weights, values, capacity);\nassert.equal(new Set(items).size, items.length);\nassert.equal(items.every((k, p) => Number.isInteger(k) && k >= 0 && k < weights.length && (p === 0 || k > items[p - 1])), true);\nassert.ok(items.reduce((s, k) => s + weights[k], 0) <= capacity);\nassert.equal(items.reduce((s, k) => s + values[k], 0), 17);",
      },
      {
        name: "indices come back in increasing order",
        body: "const items = knapsackItems([2, 2, 2, 2], [1, 5, 1, 5], 4);\nassert.deepEqual(items, [1, 3]);",
      },
    ],
  },
  {
    id: "ex-longest-common-substring",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Longest Common Substring",
    brief:
      "<p>Given two strings <code>a</code> and <code>b</code>, return the <b>length</b> of the longest string that appears in both as a <b>contiguous</b> run of characters.</p><ul><li>A substring may not skip characters, unlike a subsequence: for <code>\"ABXC\"</code> and <code>\"ABYC\"</code> the answer is 2 (<code>\"AB\"</code>), not 3</li><li>If the strings share no character, return 0</li><li>Target complexity: O(a.length × b.length) time</li></ul>",
    starter:
      "function longestCommonSubstringLength(a, b) {\n  // TODO: dp[i][j] = length of the common run that ends exactly at a[i - 1] and b[j - 1]\n}\n",
    hints: [
      "Reuse the LCS grid, but change the meaning of a cell: the length of the common run ending exactly at a[i - 1] and b[j - 1].",
      "On a match the cell is dp[i - 1][j - 1] + 1. On a mismatch it is 0 — not the larger of two neighbours, because a substring cannot skip a character.",
      "The answer is the largest value anywhere in the table, not the bottom-right cell. Track a running maximum as you fill.",
    ],
    solution:
      "function longestCommonSubstringLength(a, b) {\n  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));\n  let best = 0;\n  for (let i = 1; i <= a.length; i++) {\n    for (let j = 1; j <= b.length; j++) {\n      if (a[i - 1] === b[j - 1]) {\n        dp[i][j] = dp[i - 1][j - 1] + 1;\n        if (dp[i][j] > best) best = dp[i][j];\n      }\n    }\n  }\n  return best;\n}\n",
    tests: [
      { name: "a shared run in the middle", body: 'assert.equal(longestCommonSubstringLength("abcde", "zbcdf"), 3);' },
      {
        name: "a substring is not a subsequence",
        body: 'assert.equal(longestCommonSubstringLength("ABXC", "ABYC"), 2);\nassert.equal(longestCommonSubstringLength("abcdxyz", "xyzabcd"), 4);',
      },
      {
        name: "no shared character gives 0",
        body: 'assert.equal(longestCommonSubstringLength("abc", "xyz"), 0);',
      },
      {
        name: "empty inputs give 0",
        body: 'assert.equal(longestCommonSubstringLength("", "abc"), 0);\nassert.equal(longestCommonSubstringLength("abc", ""), 0);\nassert.equal(longestCommonSubstringLength("", ""), 0);',
      },
      {
        name: "identical strings give their length",
        body: 'assert.equal(longestCommonSubstringLength("groundwork", "groundwork"), 10);',
      },
      {
        name: "the best run is not at the end of either string",
        body: 'assert.equal(longestCommonSubstringLength("xxabcyy", "zzabczz"), 3);\nassert.equal(longestCommonSubstringLength("abcabc", "abc"), 3);',
      },
      {
        name: "repeated characters",
        body: 'assert.equal(longestCommonSubstringLength("aaaa", "aa"), 2);\nassert.equal(longestCommonSubstringLength("aabaa", "baab"), 3);',
      },
    ],
  },
  {
    id: "ex-longest-palindromic-subsequence",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Longest Palindromic Subsequence",
    brief:
      "<p>Given a string <code>s</code>, return the <b>length</b> of the longest palindromic <b>subsequence</b> in it. A subsequence keeps the order of its characters but may skip characters, so it does not have to be contiguous.</p><ul><li><code>\"bbbab\"</code> returns 4 (the subsequence <code>\"bbbb\"</code>)</li><li>The empty string returns 0, and a single character returns 1</li><li>Target complexity: O(n²) time</li></ul>",
    starter:
      "function longestPalindromeSubseq(s) {\n  // TODO: dp[i][j] = longest palindromic subsequence inside s[i..j]\n}\n",
    hints: [
      "Let dp[i][j] be the answer for the part of the string from i to j. A single character is a palindrome of length 1, so dp[i][i] = 1.",
      "If s[i] === s[j], both ends can wrap the best palindrome of the inside: dp[i + 1][j - 1] + 2. Otherwise take the larger of dp[i + 1][j] and dp[i][j - 1].",
      "dp[i][j] needs row i + 1, so fill i from the end of the string down to 0, with j going upward from i + 1. Guard the empty string.",
    ],
    solution:
      "function longestPalindromeSubseq(s) {\n  const n = s.length;\n  if (n === 0) return 0;\n  const dp = Array.from({ length: n }, () => new Array(n).fill(0));\n  for (let i = n - 1; i >= 0; i--) {\n    dp[i][i] = 1;\n    for (let j = i + 1; j < n; j++) {\n      if (s[i] === s[j]) dp[i][j] = dp[i + 1][j - 1] + 2;\n      else dp[i][j] = Math.max(dp[i + 1][j], dp[i][j - 1]);\n    }\n  }\n  return dp[0][n - 1];\n}\n",
    tests: [
      { name: "a classic case", body: 'assert.equal(longestPalindromeSubseq("bbbab"), 4);' },
      { name: "a short answer", body: 'assert.equal(longestPalindromeSubseq("cbbd"), 2);' },
      { name: "the empty string and one character", body: 'assert.equal(longestPalindromeSubseq(""), 0);\nassert.equal(longestPalindromeSubseq("x"), 1);' },
      {
        name: "a string that is already a palindrome",
        body: 'assert.equal(longestPalindromeSubseq("racecar"), 7);\nassert.equal(longestPalindromeSubseq("abba"), 4);',
      },
      { name: "all different characters", body: 'assert.equal(longestPalindromeSubseq("abcdef"), 1);' },
      {
        name: "two equal neighbours need no inside",
        body: 'assert.equal(longestPalindromeSubseq("aa"), 2);\nassert.equal(longestPalindromeSubseq("ab"), 1);',
      },
      {
        name: "skipping characters on both sides",
        body: 'assert.equal(longestPalindromeSubseq("agbdba"), 5);\nassert.equal(longestPalindromeSubseq("character"), 5);',
      },
    ],
  },
  {
    id: "ex-count-square-submatrices",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Count Square Submatrices with All Ones",
    brief:
      "<p>Given an <code>m x n</code> matrix of <code>0</code> and <code>1</code> numbers, return how many <b>square</b> submatrices have every cell equal to <code>1</code>. Squares of every side length count, and two squares at different positions are different even if they have the same size.</p><ul><li>A single <code>1</code> is a 1 x 1 square</li><li>The matrix has at least one row and one column</li><li>Target complexity: O(m × n)</li></ul>",
    starter:
      "function countSquares(matrix) {\n  // TODO: dp[r][c] = side of the largest all-ones square whose bottom-right corner is (r, c)\n}\n",
    hints: [
      "Let dp[r][c] be the side of the largest all-ones square that has its bottom-right corner at (r, c). It is 0 when the cell is 0.",
      "For a cell holding 1, dp[r][c] = 1 + the minimum of the cell above, the cell to the left and the cell up-left.",
      "dp[r][c] is also the number of squares that end at (r, c): one of each side from 1 up to dp[r][c]. So the answer is the sum of the whole table.",
    ],
    solution:
      "function countSquares(matrix) {\n  const rows = matrix.length;\n  const cols = matrix[0].length;\n  const dp = Array.from({ length: rows + 1 }, () => new Array(cols + 1).fill(0));\n  let total = 0;\n  for (let r = 1; r <= rows; r++) {\n    for (let c = 1; c <= cols; c++) {\n      if (matrix[r - 1][c - 1] === 1) {\n        dp[r][c] = 1 + Math.min(dp[r - 1][c], dp[r][c - 1], dp[r - 1][c - 1]);\n        total += dp[r][c];\n      }\n    }\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "squares of sizes one and two",
        body: "assert.equal(countSquares([[0, 1, 1, 1], [1, 1, 1, 1], [0, 1, 1, 1]]), 15);",
      },
      { name: "a 3 x 3 block of ones", body: "assert.equal(countSquares([[1, 1, 1], [1, 1, 1], [1, 1, 1]]), 14);" },
      { name: "all zeros", body: "assert.equal(countSquares([[0, 0], [0, 0]]), 0);" },
      { name: "a single cell", body: "assert.equal(countSquares([[1]]), 1);\nassert.equal(countSquares([[0]]), 0);" },
      { name: "a single row counts only the ones", body: "assert.equal(countSquares([[1, 0, 1, 1]]), 3);" },
      { name: "a single column counts only the ones", body: "assert.equal(countSquares([[1], [1], [0], [1]]), 3);" },
      {
        name: "a hole in the middle limits every larger square",
        body: "assert.equal(countSquares([[1, 1, 1], [1, 0, 1], [1, 1, 1]]), 8);",
      },
      {
        name: "the input is not changed",
        body: "const matrix = [[1, 1], [1, 1]];\ncountSquares(matrix);\nassert.deepEqual(matrix, [[1, 1], [1, 1]]);",
      },
    ],
  },
  {
    id: "ex-wildcard-matching",
    chapter: "dsa-dp-2d",
    level: "intermediate",
    title: "Wildcard Matching",
    brief:
      "<p>Given a string <code>s</code> and a pattern <code>p</code>, return <code>true</code> if the <b>whole</b> of <code>s</code> matches <code>p</code>, and <code>false</code> otherwise.</p><ul><li><code>?</code> matches exactly one character</li><li><code>*</code> matches any sequence of characters, including the empty sequence</li><li>Every other character matches only itself</li><li>The match must cover all of <code>s</code>, not just part of it</li><li>Target complexity: O(s.length × p.length)</li></ul>",
    starter:
      "function isMatchWildcard(s, p) {\n  // TODO: dp[i][j] = do the first i characters of s match the first j of p?\n}\n",
    hints: [
      "Let dp[i][j] mean the first i characters of s match the first j characters of p. dp[0][0] is true, and an empty s matches a pattern prefix only if that prefix is all stars.",
      "For an ordinary character or ?, you need dp[i - 1][j - 1] and the characters to agree.",
      "For *, there are two options: it matches nothing (dp[i][j - 1]) or it swallows s[i - 1] and stays available (dp[i - 1][j]). Either one is enough.",
    ],
    solution:
      'function isMatchWildcard(s, p) {\n  const m = s.length;\n  const n = p.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));\n  dp[0][0] = true;\n  for (let j = 1; j <= n; j++) dp[0][j] = dp[0][j - 1] && p[j - 1] === "*";\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (p[j - 1] === "*") {\n        dp[i][j] = dp[i][j - 1] || dp[i - 1][j];\n      } else {\n        dp[i][j] = (p[j - 1] === "?" || p[j - 1] === s[i - 1]) && dp[i - 1][j - 1];\n      }\n    }\n  }\n  return dp[m][n];\n}\n',
    tests: [
      { name: "no wildcard at all", body: 'assert.equal(isMatchWildcard("abc", "abc"), true);\nassert.equal(isMatchWildcard("abc", "abd"), false);' },
      { name: "a question mark matches one character", body: 'assert.equal(isMatchWildcard("cb", "?a"), false);\nassert.equal(isMatchWildcard("cb", "?b"), true);' },
      { name: "a star matches a whole run", body: 'assert.equal(isMatchWildcard("aa", "*"), true);\nassert.equal(isMatchWildcard("adceb", "*a*b"), true);' },
      { name: "a star can match nothing", body: 'assert.equal(isMatchWildcard("ab", "a*b"), true);\nassert.equal(isMatchWildcard("", "*"), true);\nassert.equal(isMatchWildcard("", "***"), true);' },
      { name: "the whole string must match", body: 'assert.equal(isMatchWildcard("aa", "a"), false);\nassert.equal(isMatchWildcard("abcd", "a*c"), false);' },
      { name: "an empty string against a non-star pattern", body: 'assert.equal(isMatchWildcard("", "?"), false);\nassert.equal(isMatchWildcard("", "a"), false);\nassert.equal(isMatchWildcard("", ""), true);' },
      { name: "stars need backtracking", body: 'assert.equal(isMatchWildcard("acdcb", "a*c?b"), false);\nassert.equal(isMatchWildcard("mississippi", "m??*ss*?i*pi"), false);\nassert.equal(isMatchWildcard("mississippi", "m*iss*i?pi"), true);' },
      {
        name: "a long input does not blow up",
        body: 'const s = "a".repeat(2000);\nassert.equal(isMatchWildcard(s, "*a*a*a*a*b"), false);\nassert.equal(isMatchWildcard(s, "*a*a*a*a*"), true);',
      },
    ],
  },
  {
    id: "ex-regex-matching",
    chapter: "dsa-dp-2d",
    level: "advanced",
    title: "Regular Expression Matching",
    brief:
      "<p>Implement matching for a small regular-expression language. Given a string <code>s</code> of lowercase letters and a pattern <code>p</code>, return <code>true</code> if <b>all</b> of <code>s</code> matches <code>p</code>.</p><ul><li><code>.</code> matches any single character</li><li><code>x*</code> matches zero or more copies of the element <code>x</code> right before the star, where <code>x</code> is a letter or <code>.</code></li><li>The pattern is well formed: a <code>*</code> always follows a letter or a <code>.</code>, never another <code>*</code>, and is never first</li><li>Do not use <code>RegExp</code>; build the table yourself</li><li>Target complexity: O(s.length × p.length)</li></ul>",
    starter:
      "function isMatch(s, p) {\n  // TODO: dp[i][j] = do the first i characters of s match the first j of p?\n}\n",
    hints: [
      "Let dp[i][j] mean the first i characters of s match the first j of p. A star only has meaning together with the element before it, so treat 'x*' as one unit.",
      "For a star at p[j - 1], you can use zero copies, which leaves dp[i][j - 2], or use one more copy when p[j - 2] matches s[i - 1], which leaves dp[i - 1][j]. For any other pattern character, it is dp[i - 1][j - 1] plus a character match.",
      "The base row is not just dp[0][0]: 'a*b*' matches the empty string. For a star at p[j - 1], dp[0][j] = dp[0][j - 2].",
    ],
    solution:
      'function isMatch(s, p) {\n  const m = s.length;\n  const n = p.length;\n  const dp = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(false));\n  dp[0][0] = true;\n  for (let j = 2; j <= n; j++) {\n    if (p[j - 1] === "*") dp[0][j] = dp[0][j - 2];\n  }\n  const same = (ch, pc) => pc === "." || pc === ch;\n  for (let i = 1; i <= m; i++) {\n    for (let j = 1; j <= n; j++) {\n      if (p[j - 1] === "*") {\n        dp[i][j] = dp[i][j - 2] || (same(s[i - 1], p[j - 2]) && dp[i - 1][j]);\n      } else {\n        dp[i][j] = same(s[i - 1], p[j - 1]) && dp[i - 1][j - 1];\n      }\n    }\n  }\n  return dp[m][n];\n}\n',
    tests: [
      { name: "a plain pattern", body: 'assert.equal(isMatch("abc", "abc"), true);\nassert.equal(isMatch("abc", "abd"), false);' },
      { name: "a dot matches any one character", body: 'assert.equal(isMatch("abc", "a.c"), true);\nassert.equal(isMatch("ac", "a.c"), false);' },
      { name: "a star repeats the element before it", body: 'assert.equal(isMatch("aab", "a*b"), true);\nassert.equal(isMatch("aa", "a"), false);\nassert.equal(isMatch("aa", "a*"), true);' },
      { name: "a star may match zero copies", body: 'assert.equal(isMatch("b", "a*b"), true);\nassert.equal(isMatch("aab", "c*a*b"), true);' },
      { name: "dot star matches anything", body: 'assert.equal(isMatch("ab", ".*"), true);\nassert.equal(isMatch("", ".*"), true);\nassert.equal(isMatch("abcdef", "a.*f"), true);' },
      { name: "the empty string and the base row", body: 'assert.equal(isMatch("", ""), true);\nassert.equal(isMatch("", "a*b*"), true);\nassert.equal(isMatch("", "a*b"), false);\nassert.equal(isMatch("a", ""), false);' },
      { name: "a classic false case", body: 'assert.equal(isMatch("mississippi", "mis*is*p*."), false);\nassert.equal(isMatch("mississippi", "mis*is*ip*."), true);' },
      {
        name: "many stars do not blow up",
        body: 'const s = "a".repeat(40);\nassert.equal(isMatch(s, "a*a*a*a*a*a*a*a*b"), false);\nassert.equal(isMatch(s, "a*a*a*a*a*a*a*a*"), true);',
      },
    ],
  },
  {
    id: "ex-russian-doll-envelopes",
    chapter: "dsa-dp-2d",
    level: "advanced",
    title: "Russian Doll Envelopes",
    brief:
      "<p>You are given <code>envelopes</code>, an array of <code>[width, height]</code> pairs. One envelope fits inside another only if <b>both</b> its width and its height are <b>strictly</b> smaller. Return the largest number of envelopes in a chain where each fits inside the next. Envelopes cannot be rotated.</p><ul><li>Envelopes of equal width never fit inside each other</li><li>An empty list returns 0</li><li>Do not change the input array</li><li>Target complexity: O(n log n); an O(n²) table is too slow for the larger tests</li></ul>",
    starter:
      "function maxEnvelopes(envelopes) {\n  // TODO: sort by width, then find the longest strictly increasing run of heights\n}\n",
    hints: [
      "Sort by width ascending. After that, a chain is a subsequence of the sorted list whose heights strictly increase, so it is a longest-increasing-subsequence problem on the heights.",
      "Equal widths must not both enter a chain. Break ties by sorting height descending, so within one width the heights never increase.",
      "Keep a tails array and, for each height, binary search for the first tail that is greater than or equal to it. Replace that tail, or append the height if there is none. The length of tails is the answer.",
    ],
    solution:
      "function maxEnvelopes(envelopes) {\n  const sorted = [...envelopes].sort((a, b) => a[0] - b[0] || b[1] - a[1]);\n  const tails = [];\n  for (const [, height] of sorted) {\n    let lo = 0;\n    let hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < height) lo = mid + 1;\n      else hi = mid;\n    }\n    tails[lo] = height;\n  }\n  return tails.length;\n}\n",
    tests: [
      { name: "a classic case", body: "assert.equal(maxEnvelopes([[5, 4], [6, 4], [6, 7], [2, 3]]), 3);" },
      { name: "identical envelopes", body: "assert.equal(maxEnvelopes([[1, 1], [1, 1], [1, 1]]), 1);" },
      { name: "equal widths never nest", body: "assert.equal(maxEnvelopes([[1, 1], [1, 2]]), 1);\nassert.equal(maxEnvelopes([[4, 5], [4, 6], [6, 7], [2, 3], [1, 1]]), 4);" },
      { name: "an empty list and a single envelope", body: "assert.equal(maxEnvelopes([]), 0);\nassert.equal(maxEnvelopes([[3, 9]]), 1);" },
      { name: "equal heights never nest", body: "assert.equal(maxEnvelopes([[1, 5], [2, 5], [3, 5]]), 1);" },
      { name: "a chain that is already in order and one in reverse", body: "assert.equal(maxEnvelopes([[1, 1], [2, 2], [3, 3], [4, 4]]), 4);\nassert.equal(maxEnvelopes([[4, 4], [3, 3], [2, 2], [1, 1]]), 4);" },
      { name: "taller but narrower does not fit", body: "assert.equal(maxEnvelopes([[1, 10], [2, 9], [3, 8]]), 1);" },
      { name: "the input is not changed", body: "const input = [[6, 4], [5, 4], [2, 3]];\nmaxEnvelopes(input);\nassert.deepEqual(input, [[6, 4], [5, 4], [2, 3]]);" },
      {
        name: "a large input finishes quickly",
        body: "const n = 60000;\nconst envelopes = Array.from({ length: n }, (_, i) => [i + 1, i + 1]);\nassert.equal(maxEnvelopes(envelopes), n);\nconst tied = Array.from({ length: n }, (_, i) => [1 + (i % 3), i + 1]);\nassert.equal(maxEnvelopes(tied), 3);",
      },
    ],
  },
];
