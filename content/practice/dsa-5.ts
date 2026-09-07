import type { Exercise } from "../types";

export const dsa5: Exercise[] = [
{
    id: "ex-permutations",
    chapter: "dsa-backtracking",
    level: "beginner",
    title: "Permutations",
    brief:
      "<p>Given an array <code>nums</code> of <b>distinct</b> integers, return every possible ordering of those integers.</p><ul><li>An array of <code>n</code> distinct values has <code>n!</code> permutations</li><li>The permutations may be returned in <b>any order</b>, but each one must list all <code>n</code> values exactly once</li><li>An empty input has exactly one permutation: the empty arrangement, so return <code>[[]]</code></li></ul>",
    starter:
      "function permute(nums) {\n  // TODO: build every ordering of nums by choosing one unused value at a time\n}\n",
    hints: [
      "Think of it as filling n slots. At each slot you pick one value you have not used yet, recurse, then undo the pick before trying the next one.",
      "Track which indices are already taken with a boolean array (or a Set), and keep the arrangement you are building in a shared array.",
      "When the arrangement reaches the full length, push a COPY of it. Pushing the array itself means every answer points at the same array, which then gets emptied as you backtrack.",
    ],
    solution:
      "function permute(nums) {\n  const out = [];\n  const used = new Array(nums.length).fill(false);\n  const current = [];\n  const walk = () => {\n    if (current.length === nums.length) {\n      out.push(current.slice());\n      return;\n    }\n    for (let i = 0; i < nums.length; i++) {\n      if (used[i]) continue;\n      used[i] = true;\n      current.push(nums[i]);\n      walk();\n      current.pop();\n      used[i] = false;\n    }\n  };\n  walk();\n  return out;\n}\n",
    tests: [
      {
        name: "all six orderings of three values",
        body: "const norm = (rows) => rows.map((r) => r.join(',')).sort();\nassert.deepEqual(\n  norm(permute([1, 2, 3])),\n  norm([[1,2,3],[1,3,2],[2,1,3],[2,3,1],[3,1,2],[3,2,1]])\n);",
      },
      {
        name: "two values give two orderings",
        body: "const norm = (rows) => rows.map((r) => r.join(',')).sort();\nassert.deepEqual(norm(permute([0, 1])), norm([[0,1],[1,0]]));",
      },
      {
        name: "single value",
        body: "assert.deepEqual(permute([7]), [[7]]);",
      },
      {
        name: "empty input has one (empty) permutation",
        body: "assert.deepEqual(permute([]), [[]]);",
      },
      {
        name: "four values give 24 distinct orderings",
        body: "const rows = permute([1, 2, 3, 4]);\nassert.equal(rows.length, 24);\nassert.equal(new Set(rows.map((r) => r.join(','))).size, 24);\nassert.ok(rows.every((r) => r.length === 4));",
      },
    ],
  },
{
    id: "ex-combination-sum",
    chapter: "dsa-backtracking",
    level: "intermediate",
    title: "Combination Sum",
    brief:
      "<p>Given an array <code>candidates</code> of <b>distinct positive</b> integers and a positive integer <code>target</code>, return every combination of candidates that sums to <code>target</code>.</p><ul><li>The <b>same candidate may be reused</b> as many times as you like</li><li>Two combinations are the same if they use the same numbers the same number of times — order does not distinguish them, so return each multiset once</li><li>The combinations may be returned in <b>any order</b></li><li>If nothing sums to the target, return an empty array</li></ul>",
    starter:
      "function combinationSum(candidates, target) {\n  // TODO: every multiset of candidates (reuse allowed) that adds up to target\n}\n",
    hints: [
      "Recurse on the remaining amount: pick a candidate, subtract it, recurse. Remaining 0 is a hit, remaining below 0 is a dead end.",
      "To avoid reporting [2,3] and [3,2] as two answers, pass a start index and never look at candidates before it.",
      "Because reuse is allowed, the recursive call gets the SAME index i, not i + 1. That single character is the whole difference from the once-each variant.",
    ],
    solution:
      "function combinationSum(candidates, target) {\n  const out = [];\n  const current = [];\n  const walk = (start, remaining) => {\n    if (remaining === 0) {\n      out.push(current.slice());\n      return;\n    }\n    if (remaining < 0) return;\n    for (let i = start; i < candidates.length; i++) {\n      current.push(candidates[i]);\n      walk(i, remaining - candidates[i]);\n      current.pop();\n    }\n  };\n  walk(0, target);\n  return out;\n}\n",
    tests: [
      {
        name: "reuses a candidate",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum([2, 3, 6, 7], 7)), norm([[2,2,3],[7]]));",
      },
      {
        name: "several combinations of different lengths",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(combinationSum([2, 3, 5], 8)),\n  norm([[2,2,2,2],[2,3,3],[3,5]])\n);",
      },
      {
        name: "unsorted candidates still work",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(combinationSum([8, 7, 4, 3], 11)),\n  norm([[8,3],[7,4],[4,4,3]])\n);",
      },
      {
        name: "no combination reaches the target",
        body: "assert.deepEqual(combinationSum([2], 1), []);",
      },
      {
        name: "a single candidate used many times",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum([3], 9)), norm([[3,3,3]]));",
      },
    ],
  },
{
    id: "ex-combination-sum-ii",
    chapter: "dsa-backtracking",
    level: "advanced",
    title: "Combination Sum II",
    brief:
      "<p>Given an array <code>candidates</code> of positive integers (which <b>may contain duplicates</b>) and a positive integer <code>target</code>, return every combination summing to <code>target</code>.</p><ul><li>Each <em>position</em> in <code>candidates</code> may be used <b>at most once</b></li><li>The returned list must not contain <b>duplicate combinations</b> — if the input has two <code>1</code>s, the combination <code>[1,7]</code> appears only once even though either <code>1</code> could have produced it</li><li>Combinations may be returned in any order</li></ul>",
    starter:
      "function combinationSum2(candidates, target) {\n  // TODO: each position used at most once, and no duplicate combinations in the output\n}\n",
    hints: [
      "Start from the reuse-allowed version and change the recursive call to i + 1 so each position is consumed once. That fixes reuse but not duplicate combinations.",
      "Sort the candidates first. Equal values are then adjacent, which is what lets you spot a repeat cheaply.",
      "Inside the loop, skip candidate i when i > start and candidates[i] === candidates[i - 1]: the first copy at this depth already explored every combination that copy could produce.",
    ],
    solution:
      "function combinationSum2(candidates, target) {\n  const sorted = candidates.slice().sort((a, b) => a - b);\n  const out = [];\n  const current = [];\n  const walk = (start, remaining) => {\n    if (remaining === 0) {\n      out.push(current.slice());\n      return;\n    }\n    for (let i = start; i < sorted.length; i++) {\n      if (i > start && sorted[i] === sorted[i - 1]) continue;\n      if (sorted[i] > remaining) break;\n      current.push(sorted[i]);\n      walk(i + 1, remaining - sorted[i]);\n      current.pop();\n    }\n  };\n  walk(0, target);\n  return out;\n}\n",
    tests: [
      {
        name: "duplicate inputs do not create duplicate combinations",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(combinationSum2([10, 1, 2, 7, 6, 1, 5], 8)),\n  norm([[1,1,6],[1,2,5],[1,7],[2,6]])\n);",
      },
      {
        name: "repeated value used more than once when copies exist",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum2([2, 5, 2, 1, 2], 5)), norm([[1,2,2],[5]]));",
      },
      {
        name: "both copies of a value are needed",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(combinationSum2([1, 1], 2)), norm([[1,1]]));",
      },
      {
        name: "no combination reaches the target",
        body: "assert.deepEqual(combinationSum2([2, 2], 3), []);",
      },
      {
        name: "every value is too large",
        body: "assert.deepEqual(combinationSum2([5, 5, 5], 1), []);",
      },
    ],
  },
{
    id: "ex-word-search",
    chapter: "dsa-backtracking",
    level: "advanced",
    title: "Word Search",
    brief:
      "<p>Given a grid <code>board</code> of single characters and a string <code>word</code>, return <code>true</code> if <code>word</code> can be spelled by walking through adjacent cells.</p><ul><li>Adjacent means <b>horizontally or vertically</b> neighbouring — no diagonals</li><li>The <b>same cell may not be used twice</b> in one path</li><li>The search may start at any cell</li><li>The board must be left <b>exactly as you found it</b> when the function returns</li></ul>",
    starter:
      "function exist(board, word) {\n  // TODO: can word be spelled along a path of adjacent, non-repeating cells?\n}\n",
    hints: [
      "Try starting a depth-first walk from every cell. From a cell that matches word[i], recurse into the four neighbours looking for word[i + 1].",
      "The 'no cell twice' rule needs a visited marker. The cheapest one is to overwrite the cell with a sentinel character before recursing.",
      "Whatever you overwrote must be restored immediately after the four recursive calls return — otherwise a failed path corrupts the board for every later start cell.",
    ],
    solution:
      "function exist(board, word) {\n  if (word.length === 0) return true;\n  const rows = board.length;\n  const cols = rows > 0 ? board[0].length : 0;\n  const walk = (r, c, i) => {\n    if (i === word.length) return true;\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return false;\n    if (board[r][c] !== word[i]) return false;\n    const saved = board[r][c];\n    board[r][c] = '#';\n    const found =\n      walk(r + 1, c, i + 1) ||\n      walk(r - 1, c, i + 1) ||\n      walk(r, c + 1, i + 1) ||\n      walk(r, c - 1, i + 1);\n    board[r][c] = saved;\n    return found;\n  };\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (walk(r, c, 0)) return true;\n    }\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "word snakes through the grid",
        body: "const board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']];\nassert.equal(exist(board, 'ABCCED'), true);\nassert.equal(exist(board, 'SEE'), true);",
      },
      {
        name: "cannot reuse a cell",
        body: "const board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']];\nassert.equal(exist(board, 'ABCB'), false);",
      },
      {
        name: "single cell board",
        body: "assert.equal(exist([['A']], 'A'), true);\nassert.equal(exist([['A']], 'AA'), false);\nassert.equal(exist([['A']], 'B'), false);",
      },
      {
        name: "the board is restored after the search",
        body: "const board = [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']];\nexist(board, 'ABCESEEEFS');\nassert.deepEqual(board, [['A','B','C','E'],['S','F','C','S'],['A','D','E','E']]);",
      },
      {
        name: "long winding path exists",
        body: "const board = [['A','B','C','E'],['S','F','E','S'],['A','D','E','E']];\nassert.equal(exist(board, 'ABCESEEEFS'), true);\nassert.equal(exist(board, 'ABCESEEEFSZ'), false);",
      },
    ],
  },
{
    id: "ex-palindrome-partitioning",
    chapter: "dsa-backtracking",
    level: "intermediate",
    title: "Palindrome Partitioning",
    brief:
      "<p>Given a string <code>s</code>, return every way of cutting it into pieces such that <b>every piece is a palindrome</b>.</p><ul><li>The pieces of one partition must join back together to give <code>s</code>, in order — so the order <em>within</em> a partition matters</li><li>The partitions themselves may be returned in <b>any order</b></li><li>A single character is always a palindrome, so at least one partition always exists</li><li>The empty string has one partition: the empty list, so return <code>[[]]</code></li></ul>",
    starter:
      "function partition(s) {\n  // TODO: every way to cut s so that each piece reads the same forwards and backwards\n}\n",
    hints: [
      "Decide where the FIRST cut goes: try every prefix s[0..end]. If that prefix is a palindrome, recurse on the rest of the string.",
      "Carry a start index and a list of pieces chosen so far. When start reaches s.length you have a complete partition — push a copy.",
      "Write the palindrome check as a two-pointer test over an index range so you never build throwaway reversed strings.",
    ],
    solution:
      "function partition(s) {\n  const out = [];\n  const current = [];\n  const isPal = (lo, hi) => {\n    while (lo < hi) {\n      if (s[lo] !== s[hi]) return false;\n      lo++;\n      hi--;\n    }\n    return true;\n  };\n  const walk = (start) => {\n    if (start === s.length) {\n      out.push(current.slice());\n      return;\n    }\n    for (let end = start; end < s.length; end++) {\n      if (!isPal(start, end)) continue;\n      current.push(s.slice(start, end + 1));\n      walk(end + 1);\n      current.pop();\n    }\n  };\n  walk(0);\n  return out;\n}\n",
    tests: [
      {
        name: "two ways to cut aab",
        body: "const norm = (rows) => rows.map((r) => r.join('|')).sort();\nassert.deepEqual(norm(partition('aab')), norm([['a','a','b'],['aa','b']]));",
      },
      {
        name: "a whole-string palindrome is one of the answers",
        body: "const norm = (rows) => rows.map((r) => r.join('|')).sort();\nassert.deepEqual(norm(partition('aba')), norm([['a','b','a'],['aba']]));",
      },
      {
        name: "single character",
        body: "assert.deepEqual(partition('a'), [['a']]);",
      },
      {
        name: "empty string",
        body: "assert.deepEqual(partition(''), [[]]);",
      },
      {
        name: "no multi-character palindromes",
        body: "const norm = (rows) => rows.map((r) => r.join('|')).sort();\nassert.deepEqual(norm(partition('abc')), norm([['a','b','c']]));",
      },
    ],
  },
{
    id: "ex-n-queens-count",
    chapter: "dsa-advanced-backtracking",
    level: "advanced",
    title: "N-Queens — Count the Solutions",
    brief:
      "<p>On an <code>n × n</code> chessboard, place <code>n</code> queens so that no two attack each other. Return <b>how many distinct arrangements</b> exist.</p><ul><li>Two queens attack each other if they share a <b>row</b>, a <b>column</b>, or a <b>diagonal</b></li><li>Reflections and rotations count as distinct arrangements</li><li><code>n = 4</code> has 2 solutions; <code>n = 2</code> and <code>n = 3</code> have none</li><li><code>n = 8</code> — the classic board — has 92, and must finish quickly, so prune as you go rather than generating all placements and filtering</li></ul>",
    starter:
      "function totalNQueens(n) {\n  // TODO: count the ways to place n non-attacking queens on an n x n board\n}\n",
    hints: [
      "Exactly one queen goes in each row, so recurse row by row and only choose a column. That kills the row constraint for free.",
      "Checking every placed queen at each step is slow. Keep three Sets: used columns, used '\\' diagonals, and used '/' diagonals.",
      "Every cell on the same '\\' diagonal has the same value of row - col, and every cell on the same '/' diagonal has the same row + col. Add all three markers before recursing, remove all three after.",
    ],
    solution:
      "function totalNQueens(n) {\n  const cols = new Set();\n  const down = new Set(); // row - col\n  const up = new Set(); // row + col\n  let count = 0;\n  const place = (row) => {\n    if (row === n) {\n      count++;\n      return;\n    }\n    for (let c = 0; c < n; c++) {\n      if (cols.has(c) || down.has(row - c) || up.has(row + c)) continue;\n      cols.add(c);\n      down.add(row - c);\n      up.add(row + c);\n      place(row + 1);\n      cols.delete(c);\n      down.delete(row - c);\n      up.delete(row + c);\n    }\n  };\n  place(0);\n  return count;\n}\n",
    tests: [
      {
        name: "a single queen on a 1x1 board",
        body: "assert.equal(totalNQueens(1), 1);",
      },
      {
        name: "2 and 3 are impossible",
        body: "assert.equal(totalNQueens(2), 0);\nassert.equal(totalNQueens(3), 0);",
      },
      {
        name: "the classic 4x4 answer",
        body: "assert.equal(totalNQueens(4), 2);",
      },
      {
        name: "6x6 has four arrangements",
        body: "assert.equal(totalNQueens(6), 4);",
      },
      {
        name: "the full chessboard has 92",
        body: "assert.equal(totalNQueens(8), 92);",
      },
    ],
  },
{
    id: "ex-letter-combinations-phone",
    chapter: "dsa-backtracking",
    level: "intermediate",
    title: "Letter Combinations of a Phone Number",
    brief:
      "<p>Given a string of digits <code>2</code>–<code>9</code>, return every letter combination the number could spell on an old telephone keypad.</p><ul><li><code>2</code>=abc, <code>3</code>=def, <code>4</code>=ghi, <code>5</code>=jkl, <code>6</code>=mno, <code>7</code>=pqrs, <code>8</code>=tuv, <code>9</code>=wxyz</li><li>Every combination has exactly one letter per digit, in the digits' own order</li><li>The combinations may be returned in <b>any order</b></li><li>An empty input returns an empty array — <em>not</em> an array holding the empty string</li></ul>",
    starter:
      "function letterCombinations(digits) {\n  // TODO: every string formed by taking one letter from each digit's keypad group\n}\n",
    hints: [
      "Store the keypad as a plain object from digit character to its letters, so digits[i] indexes straight into it.",
      "Recurse on the digit position, carrying the string built so far. At position === digits.length you have a complete combination.",
      "Handle the empty input before you start — the recursion would otherwise report one answer, the empty string, which the spec forbids.",
    ],
    solution:
      "function letterCombinations(digits) {\n  if (digits.length === 0) return [];\n  const pad = {\n    '2': 'abc',\n    '3': 'def',\n    '4': 'ghi',\n    '5': 'jkl',\n    '6': 'mno',\n    '7': 'pqrs',\n    '8': 'tuv',\n    '9': 'wxyz',\n  };\n  const out = [];\n  const walk = (i, built) => {\n    if (i === digits.length) {\n      out.push(built);\n      return;\n    }\n    for (const ch of pad[digits[i]]) walk(i + 1, built + ch);\n  };\n  walk(0, '');\n  return out;\n}\n",
    tests: [
      {
        name: "two digits give nine combinations",
        body: "const out = letterCombinations('23').slice().sort();\nassert.deepEqual(out, ['ad','ae','af','bd','be','bf','cd','ce','cf']);",
      },
      {
        name: "empty input gives an empty array",
        body: "assert.deepEqual(letterCombinations(''), []);",
      },
      {
        name: "one digit gives its letters",
        body: "assert.deepEqual(letterCombinations('7').slice().sort(), ['p','q','r','s']);",
      },
      {
        name: "four-letter keys multiply out",
        body: "const out = letterCombinations('79');\nassert.equal(out.length, 16);\nassert.ok(out.indexOf('pw') !== -1);\nassert.ok(out.indexOf('sz') !== -1);\nassert.ok(out.every((s) => s.length === 2));",
      },
      {
        name: "three digits keep the digit order",
        body: "const out = letterCombinations('234');\nassert.equal(out.length, 27);\nassert.equal(new Set(out).size, 27);\nassert.ok(out.indexOf('adg') !== -1);\nassert.ok(out.indexOf('gda') === -1);",
      },
    ],
  },
{
    id: "ex-merge-intervals",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Merge Intervals",
    brief:
      "<p>Given an array of intervals where <code>intervals[i] = [start, end]</code>, merge every group that overlaps and return the resulting non-overlapping intervals.</p><ul><li>The input is <b>not sorted</b></li><li>Intervals that merely touch, such as <code>[1,4]</code> and <code>[4,5]</code>, count as overlapping and merge into <code>[1,5]</code></li><li>Return the merged intervals sorted by start</li><li>An empty input returns an empty array</li></ul>",
    starter: "function merge(intervals) {\n  // TODO: combine every overlapping group into a single interval\n}\n",
    hints: [
      "Comparing every pair is O(n^2). Sorting by start first means any interval can only ever overlap the one you most recently emitted.",
      "Sweep the sorted list keeping the last interval you pushed to the output. If the next start is <= that interval's end, they overlap.",
      "Merging means widening the end to the LARGER of the two ends — the next interval can be fully contained, in which case the end must not shrink.",
    ],
    solution:
      "function merge(intervals) {\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  const out = [];\n  for (const span of sorted) {\n    const last = out[out.length - 1];\n    if (last && span[0] <= last[1]) {\n      if (span[1] > last[1]) last[1] = span[1];\n    } else {\n      out.push([span[0], span[1]]);\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "merges one overlapping pair",
        body: "assert.deepEqual(\n  merge([[1,3],[2,6],[8,10],[15,18]]),\n  [[1,6],[8,10],[15,18]]\n);",
      },
      {
        name: "touching intervals merge",
        body: "assert.deepEqual(merge([[1,4],[4,5]]), [[1,5]]);",
      },
      {
        name: "a fully contained interval does not shrink the end",
        body: "assert.deepEqual(merge([[1,4],[2,3]]), [[1,4]]);",
      },
      {
        name: "unsorted input is handled",
        body: "assert.deepEqual(merge([[5,6],[1,2],[3,4]]), [[1,2],[3,4],[5,6]]);",
      },
      {
        name: "empty input and a lone interval",
        body: "assert.deepEqual(merge([]), []);\nassert.deepEqual(merge([[7,7]]), [[7,7]]);",
      },
    ],
  },
{
    id: "ex-insert-interval",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Insert Interval",
    brief:
      "<p>Given a list of <b>non-overlapping</b> intervals already <b>sorted by start</b>, insert <code>newInterval</code> and return the list still sorted and still non-overlapping.</p><ul><li>Merge the new interval with any it overlaps or touches</li><li>The result must remain sorted by start</li><li>Inserting into an empty list yields a list holding just the new interval</li><li>Because the input is already sorted, this can be done in a <b>single O(n) pass</b> with no re-sorting</li></ul>",
    starter:
      "function insert(intervals, newInterval) {\n  // TODO: place newInterval into the sorted list, merging anything it touches\n}\n",
    hints: [
      "The list splits into three regions: intervals entirely before the new one, intervals that overlap it, and intervals entirely after it. Walk them in that order.",
      "An interval is entirely before when its end is strictly less than the new start — copy those straight through.",
      "While an interval's start is <= the running end, absorb it: pull the start down to the smaller start and push the end up to the larger end. Push the merged interval once, then copy the tail.",
    ],
    solution:
      "function insert(intervals, newInterval) {\n  const out = [];\n  let start = newInterval[0];\n  let end = newInterval[1];\n  let i = 0;\n  while (i < intervals.length && intervals[i][1] < start) {\n    out.push(intervals[i]);\n    i++;\n  }\n  while (i < intervals.length && intervals[i][0] <= end) {\n    start = Math.min(start, intervals[i][0]);\n    end = Math.max(end, intervals[i][1]);\n    i++;\n  }\n  out.push([start, end]);\n  while (i < intervals.length) {\n    out.push(intervals[i]);\n    i++;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "merges with one neighbour",
        body: "assert.deepEqual(insert([[1,3],[6,9]], [2,5]), [[1,5],[6,9]]);",
      },
      {
        name: "swallows several intervals",
        body: "assert.deepEqual(\n  insert([[1,2],[3,5],[6,7],[8,10],[12,16]], [4,8]),\n  [[1,2],[3,10],[12,16]]\n);",
      },
      {
        name: "inserting into an empty list",
        body: "assert.deepEqual(insert([], [5,7]), [[5,7]]);",
      },
      {
        name: "fully contained interval changes nothing",
        body: "assert.deepEqual(insert([[1,5]], [2,3]), [[1,5]]);",
      },
      {
        name: "no overlap, before and after",
        body: "assert.deepEqual(insert([[3,5]], [6,8]), [[3,5],[6,8]]);\nassert.deepEqual(insert([[3,5]], [1,2]), [[1,2],[3,5]]);\nassert.deepEqual(insert([[3,5]], [5,8]), [[3,8]]);",
      },
    ],
  },
{
    id: "ex-non-overlapping-intervals",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Non-overlapping Intervals",
    brief:
      "<p>Given an array of intervals, return the <b>minimum number you must remove</b> so that the ones left over do not overlap.</p><ul><li>Intervals that only touch at an endpoint, such as <code>[1,2]</code> and <code>[2,3]</code>, do <b>not</b> overlap</li><li>The input is not sorted</li><li>An empty input needs no removals</li><li>Removing the fewest is the same as <em>keeping</em> the most — solve the easier one</li></ul>",
    starter:
      "function eraseOverlapIntervals(intervals) {\n  // TODO: fewest removals that leave a non-overlapping set\n}\n",
    hints: [
      "Flip the question: maximise how many intervals you keep, then the answer is total - kept.",
      "This is the classic activity-selection greedy. Sort by END, not by start — the interval that finishes earliest leaves the most room for everything after it.",
      "Sweep the end-sorted list, keeping a running 'last kept end'. Keep an interval when its start is >= that end, and update the end; otherwise skip it.",
    ],
    solution:
      "function eraseOverlapIntervals(intervals) {\n  if (intervals.length === 0) return 0;\n  const sorted = intervals.slice().sort((a, b) => a[1] - b[1]);\n  let kept = 1;\n  let end = sorted[0][1];\n  for (let i = 1; i < sorted.length; i++) {\n    if (sorted[i][0] >= end) {\n      kept++;\n      end = sorted[i][1];\n    }\n  }\n  return intervals.length - kept;\n}\n",
    tests: [
      {
        name: "one removal is enough",
        body: "assert.equal(eraseOverlapIntervals([[1,2],[2,3],[3,4],[1,3]]), 1);",
      },
      {
        name: "identical intervals",
        body: "assert.equal(eraseOverlapIntervals([[1,2],[1,2],[1,2]]), 2);",
      },
      {
        name: "touching intervals need no removal",
        body: "assert.equal(eraseOverlapIntervals([[1,2],[2,3]]), 0);",
      },
      {
        name: "empty input and a single interval",
        body: "assert.equal(eraseOverlapIntervals([]), 0);\nassert.equal(eraseOverlapIntervals([[5,9]]), 0);",
      },
      {
        name: "a long interval must be dropped, not the short ones",
        body: "assert.equal(eraseOverlapIntervals([[1,100],[11,22],[1,11],[2,12]]), 2);",
      },
    ],
  },
{
    id: "ex-meeting-rooms",
    chapter: "dsa-intervals",
    level: "beginner",
    title: "Meeting Rooms",
    brief:
      "<p>Given an array of meeting time intervals <code>[start, end]</code>, return <code>true</code> if one person could attend <b>all</b> of them.</p><ul><li>Two meetings clash if one starts <b>strictly before</b> the other ends</li><li>Back-to-back meetings such as <code>[1,5]</code> and <code>[5,9]</code> are fine</li><li>The input is not sorted</li><li>An empty schedule, or a schedule with one meeting, is always attendable</li></ul>",
    starter: "function canAttendMeetings(intervals) {\n  // TODO: true when no two meetings overlap\n}\n",
    hints: [
      "Comparing every pair works but is O(n^2). Sorting by start time means a clash can only ever be with the immediately previous meeting.",
      "After sorting, walk from index 1 and return false the moment a meeting starts strictly before the previous one ends. Note 'strictly' — equal values are back-to-back, not a clash.",
    ],
    solution:
      "function canAttendMeetings(intervals) {\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  for (let i = 1; i < sorted.length; i++) {\n    if (sorted[i][0] < sorted[i - 1][1]) return false;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "overlapping meetings",
        body: "assert.equal(canAttendMeetings([[0,30],[5,10],[15,20]]), false);",
      },
      {
        name: "unsorted but compatible",
        body: "assert.equal(canAttendMeetings([[7,10],[2,4]]), true);",
      },
      {
        name: "back-to-back is allowed",
        body: "assert.equal(canAttendMeetings([[1,5],[5,9]]), true);",
      },
      {
        name: "one minute of overlap is a clash",
        body: "assert.equal(canAttendMeetings([[1,5],[4,9]]), false);",
      },
      {
        name: "empty and single-meeting schedules",
        body: "assert.equal(canAttendMeetings([]), true);\nassert.equal(canAttendMeetings([[3,8]]), true);",
      },
    ],
  },
{
    id: "ex-spiral-matrix",
    chapter: "dsa-matrix-problems",
    level: "beginner",
    title: "Spiral Matrix",
    brief:
      "<p>Given an <code>m × n</code> matrix, return all of its values in <b>spiral order</b>: left to right across the top, down the right side, right to left along the bottom, up the left side, then inwards and repeat.</p><ul><li>The matrix need not be square</li><li>A single row or a single column is a valid input</li><li>An empty matrix returns an empty array</li><li>Every value appears in the output exactly once</li></ul>",
    starter: "function spiralOrder(matrix) {\n  // TODO: read the matrix in spiral order into a flat array\n}\n",
    hints: [
      "Keep four boundaries — top, bottom, left, right — and peel one edge at a time, shrinking the matching boundary after each edge.",
      "Loop while top <= bottom AND left <= right, doing the four edges in order: top row, right column, bottom row, left column.",
      "The last two edges need a guard. After shrinking, a single leftover row would otherwise be read twice — check top <= bottom before the bottom row and left <= right before the left column.",
    ],
    solution:
      "function spiralOrder(matrix) {\n  const out = [];\n  if (matrix.length === 0 || matrix[0].length === 0) return out;\n  let top = 0;\n  let bottom = matrix.length - 1;\n  let left = 0;\n  let right = matrix[0].length - 1;\n  while (top <= bottom && left <= right) {\n    for (let c = left; c <= right; c++) out.push(matrix[top][c]);\n    top++;\n    for (let r = top; r <= bottom; r++) out.push(matrix[r][right]);\n    right--;\n    if (top <= bottom) {\n      for (let c = right; c >= left; c--) out.push(matrix[bottom][c]);\n      bottom--;\n    }\n    if (left <= right) {\n      for (let r = bottom; r >= top; r--) out.push(matrix[r][left]);\n      left++;\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "3x3 spiral",
        body: "assert.deepEqual(\n  spiralOrder([[1,2,3],[4,5,6],[7,8,9]]),\n  [1,2,3,6,9,8,7,4,5]\n);",
      },
      {
        name: "wider than tall",
        body: "assert.deepEqual(\n  spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12]]),\n  [1,2,3,4,8,12,11,10,9,5,6,7]\n);",
      },
      {
        name: "single row and single column",
        body: "assert.deepEqual(spiralOrder([[1,2,3]]), [1,2,3]);\nassert.deepEqual(spiralOrder([[1],[2],[3]]), [1,2,3]);",
      },
      {
        name: "empty matrix",
        body: "assert.deepEqual(spiralOrder([]), []);\nassert.deepEqual(spiralOrder([[]]), []);",
      },
      {
        name: "4x4 reaches the centre",
        body: "assert.deepEqual(\n  spiralOrder([[1,2,3,4],[5,6,7,8],[9,10,11,12],[13,14,15,16]]),\n  [1,2,3,4,8,12,16,15,14,13,9,5,6,7,11,10]\n);",
      },
    ],
  },
{
    id: "ex-rotate-image",
    chapter: "dsa-matrix-problems",
    level: "intermediate",
    title: "Rotate Image",
    brief:
      "<p>Given an <code>n × n</code> matrix, rotate it 90° <b>clockwise</b>, <b>in place</b>.</p><ul><li>You must modify the matrix you were given — allocating a second matrix and returning it does not count</li><li>The return value is ignored; the caller reads the matrix it passed in</li><li>After the rotation, the first column read bottom-to-top becomes the first row</li><li>A 1×1 matrix is unchanged</li></ul>",
    starter: "function rotate(matrix) {\n  // TODO: rotate the matrix 90 degrees clockwise, modifying it in place\n}\n",
    hints: [
      "Rotating by 90° clockwise is two simpler in-place moves composed together. Try writing out a small example and looking for them.",
      "First transpose: swap matrix[r][c] with matrix[c][r]. Then reverse each row left-to-right. Together that is exactly a clockwise quarter turn.",
      "When transposing, only iterate over c > r. Looping over the whole square swaps every pair twice and leaves the matrix untouched.",
    ],
    solution:
      "function rotate(matrix) {\n  const n = matrix.length;\n  for (let r = 0; r < n; r++) {\n    for (let c = r + 1; c < n; c++) {\n      const tmp = matrix[r][c];\n      matrix[r][c] = matrix[c][r];\n      matrix[c][r] = tmp;\n    }\n  }\n  for (const row of matrix) {\n    let lo = 0;\n    let hi = n - 1;\n    while (lo < hi) {\n      const tmp = row[lo];\n      row[lo] = row[hi];\n      row[hi] = tmp;\n      lo++;\n      hi--;\n    }\n  }\n}\n",
    tests: [
      {
        name: "2x2 rotates in place",
        body: "const m = [[1,2],[3,4]];\nrotate(m);\nassert.deepEqual(m, [[3,1],[4,2]]);",
      },
      {
        name: "3x3 rotates in place",
        body: "const m = [[1,2,3],[4,5,6],[7,8,9]];\nrotate(m);\nassert.deepEqual(m, [[7,4,1],[8,5,2],[9,6,3]]);",
      },
      {
        name: "4x4 rotates in place",
        body: "const m = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]];\nrotate(m);\nassert.deepEqual(m, [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]);",
      },
      {
        name: "1x1 is unchanged",
        body: "const m = [[42]];\nrotate(m);\nassert.deepEqual(m, [[42]]);",
      },
      {
        name: "four rotations return to the original",
        body: "const m = [[1,2,3],[4,5,6],[7,8,9]];\nrotate(m);\nrotate(m);\nrotate(m);\nrotate(m);\nassert.deepEqual(m, [[1,2,3],[4,5,6],[7,8,9]]);",
      },
    ],
  },
{
    id: "ex-set-matrix-zeroes",
    chapter: "dsa-matrix-problems",
    level: "advanced",
    title: "Set Matrix Zeroes",
    brief:
      "<p>Given an <code>m × n</code> matrix, if any cell holds <code>0</code>, set that cell's entire row and column to <code>0</code>. Do it <b>in place</b>.</p><ul><li>Only the zeros present in the <em>original</em> matrix trigger a wipe — zeros you write must not cascade</li><li>You must use <b>O(1)</b> extra space: no m×n copy, and no arrays of row/column flags</li><li>The trick is to store the flags inside the matrix itself</li><li>The return value is ignored; the caller reads the matrix it passed in</li></ul>",
    starter:
      "function setZeroes(matrix) {\n  // TODO: zero out the row and column of every original zero, using O(1) extra space\n}\n",
    hints: [
      "Zeroing as you scan is wrong: a written zero would then wipe its own row and column. You need to record which rows and columns to wipe, and only then wipe them.",
      "The O(1) trick is to use the first row and the first column as those flag arrays: a zero at [r][c] sets matrix[r][0] and matrix[0][c] to 0.",
      "The first row and column are also real data, so before overwriting them record in two booleans whether each of them originally contained a zero — and apply those two booleans LAST.",
    ],
    solution:
      "function setZeroes(matrix) {\n  const rows = matrix.length;\n  if (rows === 0) return;\n  const cols = matrix[0].length;\n  if (cols === 0) return;\n  let firstRowZero = false;\n  let firstColZero = false;\n  for (let c = 0; c < cols; c++) {\n    if (matrix[0][c] === 0) firstRowZero = true;\n  }\n  for (let r = 0; r < rows; r++) {\n    if (matrix[r][0] === 0) firstColZero = true;\n  }\n  for (let r = 1; r < rows; r++) {\n    for (let c = 1; c < cols; c++) {\n      if (matrix[r][c] === 0) {\n        matrix[r][0] = 0;\n        matrix[0][c] = 0;\n      }\n    }\n  }\n  for (let r = 1; r < rows; r++) {\n    for (let c = 1; c < cols; c++) {\n      if (matrix[r][0] === 0 || matrix[0][c] === 0) matrix[r][c] = 0;\n    }\n  }\n  if (firstRowZero) {\n    for (let c = 0; c < cols; c++) matrix[0][c] = 0;\n  }\n  if (firstColZero) {\n    for (let r = 0; r < rows; r++) matrix[r][0] = 0;\n  }\n}\n",
    tests: [
      {
        name: "one interior zero wipes a cross",
        body: "const m = [[1,1,1],[1,0,1],[1,1,1]];\nsetZeroes(m);\nassert.deepEqual(m, [[1,0,1],[0,0,0],[1,0,1]]);",
      },
      {
        name: "zeros in the first row and first column",
        body: "const m = [[0,1,2,0],[3,4,5,2],[1,3,1,5]];\nsetZeroes(m);\nassert.deepEqual(m, [[0,0,0,0],[0,4,5,0],[0,3,1,0]]);",
      },
      {
        name: "written zeros do not cascade",
        body: "const m = [[1,0],[1,1]];\nsetZeroes(m);\nassert.deepEqual(m, [[0,0],[1,0]]);",
      },
      {
        name: "no zeros leaves the matrix alone",
        body: "const m = [[1,2],[3,4]];\nsetZeroes(m);\nassert.deepEqual(m, [[1,2],[3,4]]);",
      },
      {
        name: "single cell and a single row",
        body: "const a = [[0]];\nsetZeroes(a);\nassert.deepEqual(a, [[0]]);\nconst b = [[1,0,3]];\nsetZeroes(b);\nassert.deepEqual(b, [[0,0,0]]);",
      },
    ],
  },
{
    id: "ex-search-2d-matrix-ii",
    chapter: "dsa-matrix-problems",
    level: "advanced",
    title: "Search a 2D Matrix II",
    brief:
      "<p>Search a value in an <code>m × n</code> matrix where <b>every row is sorted left to right</b> and <b>every column is sorted top to bottom</b>. Return <code>true</code> if <code>target</code> is present.</p><ul><li>The rows are <em>not</em> one long sorted sequence — a row can start lower than the previous row ended, so a plain binary search over the flattened matrix is wrong</li><li>Aim for <b>O(m + n)</b> time and O(1) space</li><li>An empty matrix returns <code>false</code></li></ul>",
    starter:
      "function searchMatrix(matrix, target) {\n  // TODO: exploit that rows AND columns are sorted; O(m + n), no full scan\n}\n",
    hints: [
      "Look for a starting cell where the two directions disagree — one makes values larger, the other makes them smaller. The middle is useless here; a corner is not.",
      "Start at the TOP-RIGHT cell. Everything to its left is smaller and everything below is larger, so one comparison eliminates a whole row or a whole column.",
      "If the cell is greater than the target move left, if it is smaller move down, and stop when you fall off the grid. The bottom-left corner works symmetrically.",
    ],
    solution:
      "function searchMatrix(matrix, target) {\n  if (matrix.length === 0 || matrix[0].length === 0) return false;\n  let r = 0;\n  let c = matrix[0].length - 1;\n  while (r < matrix.length && c >= 0) {\n    const value = matrix[r][c];\n    if (value === target) return true;\n    if (value > target) c--;\n    else r++;\n  }\n  return false;\n}\n",
    tests: [
      {
        name: "finds a value in the middle",
        body: "const m = [\n  [1,4,7,11,15],\n  [2,5,8,12,19],\n  [3,6,9,16,22],\n  [10,13,14,17,24],\n  [18,21,23,26,30],\n];\nassert.equal(searchMatrix(m, 5), true);\nassert.equal(searchMatrix(m, 20), false);",
      },
      {
        name: "finds the corners",
        body: "const m = [\n  [1,4,7,11,15],\n  [2,5,8,12,19],\n  [3,6,9,16,22],\n  [10,13,14,17,24],\n  [18,21,23,26,30],\n];\nassert.equal(searchMatrix(m, 1), true);\nassert.equal(searchMatrix(m, 15), true);\nassert.equal(searchMatrix(m, 18), true);\nassert.equal(searchMatrix(m, 30), true);",
      },
      {
        name: "out of range targets",
        body: "const m = [[1,4],[2,5]];\nassert.equal(searchMatrix(m, 0), false);\nassert.equal(searchMatrix(m, 99), false);",
      },
      {
        name: "single row and single column",
        body: "assert.equal(searchMatrix([[1,3,5]], 3), true);\nassert.equal(searchMatrix([[1,3,5]], 4), false);\nassert.equal(searchMatrix([[1],[3],[5]], 5), true);\nassert.equal(searchMatrix([[1],[3],[5]], 2), false);",
      },
      {
        name: "empty matrix",
        body: "assert.equal(searchMatrix([], 1), false);\nassert.equal(searchMatrix([[]], 1), false);",
      },
    ],
  },
{
    id: "ex-implement-trie",
    chapter: "dsa-tries",
    level: "intermediate",
    title: "Implement Trie (Prefix Tree)",
    brief:
      "<p>Implement a <b>trie</b>: a tree where each edge is a character, so words that share a prefix share a path.</p><ul><li><code>insert(word)</code> — add a word</li><li><code>search(word)</code> — <code>true</code> only if that exact word was inserted</li><li><code>startsWith(prefix)</code> — <code>true</code> if any inserted word begins with <code>prefix</code></li><li>Every operation must run in <b>O(length of the string)</b>, independent of how many words are stored — so no scanning a list of words</li><li>Words are lowercase letters. Inserting the same word twice is harmless</li></ul>",
    starter:
      "class Trie {\n  constructor() {\n    // TODO: create the empty root node\n  }\n\n  insert(word) {\n    // TODO: walk the characters, creating nodes as needed\n  }\n\n  search(word) {\n    // TODO: true only for a complete inserted word\n  }\n\n  startsWith(prefix) {\n    // TODO: true if any word starts with prefix\n  }\n}\n",
    hints: [
      "A node needs two things: a map from the next character to a child node, and a flag saying 'a word ends here'.",
      "search and startsWith share all their work — both walk the characters and bail out when a child is missing. Factor that walk into a helper that returns the node it landed on, or null.",
      "The only difference is the last step: startsWith is happy that the node exists, search additionally requires its end-of-word flag. Without that flag, inserting 'apple' would make 'app' look like a stored word.",
    ],
    solution:
      "class TrieNode {\n  constructor() {\n    this.children = new Map();\n    this.isWord = false;\n  }\n}\n\nclass Trie {\n  constructor() {\n    this.root = new TrieNode();\n  }\n\n  insert(word) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());\n      node = node.children.get(ch);\n    }\n    node.isWord = true;\n  }\n\n  nodeFor(prefix) {\n    let node = this.root;\n    for (const ch of prefix) {\n      if (!node.children.has(ch)) return null;\n      node = node.children.get(ch);\n    }\n    return node;\n  }\n\n  search(word) {\n    const node = this.nodeFor(word);\n    return node !== null && node.isWord;\n  }\n\n  startsWith(prefix) {\n    return this.nodeFor(prefix) !== null;\n  }\n}\n",
    tests: [
      {
        name: "insert then search and startsWith",
        body: "const t = new Trie();\nt.insert('apple');\nassert.equal(t.search('apple'), true);\nassert.equal(t.search('app'), false);\nassert.equal(t.startsWith('app'), true);\nt.insert('app');\nassert.equal(t.search('app'), true);",
      },
      {
        name: "unknown words and prefixes",
        body: "const t = new Trie();\nt.insert('banana');\nassert.equal(t.search('band'), false);\nassert.equal(t.startsWith('band'), false);\nassert.equal(t.startsWith('ban'), true);\nassert.equal(t.search('bananas'), false);",
      },
      {
        name: "shared prefixes stay independent",
        body: "const t = new Trie();\nt.insert('car');\nt.insert('card');\nt.insert('care');\nassert.equal(t.search('car'), true);\nassert.equal(t.search('card'), true);\nassert.equal(t.search('care'), true);\nassert.equal(t.search('ca'), false);\nassert.equal(t.startsWith('care'), true);",
      },
      {
        name: "empty trie and repeated inserts",
        body: "const t = new Trie();\nassert.equal(t.search('a'), false);\nassert.equal(t.startsWith('a'), false);\nt.insert('a');\nt.insert('a');\nassert.equal(t.search('a'), true);",
      },
      {
        name: "two tries do not share state",
        body: "const a = new Trie();\nconst b = new Trie();\na.insert('hello');\nassert.equal(a.search('hello'), true);\nassert.equal(b.search('hello'), false);\nassert.equal(b.startsWith('h'), false);",
      },
    ],
  },
{
    id: "ex-add-and-search-words",
    chapter: "dsa-tries",
    level: "advanced",
    title: "Design Add and Search Words",
    brief:
      "<p>Design a dictionary that supports wildcard lookups.</p><ul><li><code>addWord(word)</code> — store a word of lowercase letters</li><li><code>search(word)</code> — <code>true</code> if any stored word matches. The query may contain <code>'.'</code>, which matches <b>any single letter</b></li><li>The match must cover the whole word: a query of length 3 only matches stored words of length 3</li><li>So after adding <code>'bad'</code>: <code>'.ad'</code> and <code>'b..'</code> match, <code>'b.'</code> does not</li><li>Do not scan every stored word on each query — build a trie</li></ul>",
    starter:
      "class WordDictionary {\n  constructor() {\n    // TODO: create the empty root node\n  }\n\n  addWord(word) {\n    // TODO: store the word\n  }\n\n  search(word) {\n    // TODO: match the word, where '.' matches any single letter\n  }\n}\n",
    hints: [
      "Store the words in an ordinary trie — addWord is unchanged from the plain version. All the difficulty is in search.",
      "Search becomes recursive: a helper takes (node, index). A normal letter has one child to follow, so the recursion stays a straight line.",
      "A '.' has no single child to follow, so try them all: recurse into every child and return true if any branch succeeds. When the index reaches the end, the answer is that node's end-of-word flag — not merely that you arrived.",
    ],
    solution:
      "class WordDictionary {\n  constructor() {\n    this.root = { children: new Map(), isWord: false };\n  }\n\n  addWord(word) {\n    let node = this.root;\n    for (const ch of word) {\n      if (!node.children.has(ch)) {\n        node.children.set(ch, { children: new Map(), isWord: false });\n      }\n      node = node.children.get(ch);\n    }\n    node.isWord = true;\n  }\n\n  search(word) {\n    const walk = (node, i) => {\n      if (i === word.length) return node.isWord;\n      const ch = word[i];\n      if (ch === '.') {\n        for (const child of node.children.values()) {\n          if (walk(child, i + 1)) return true;\n        }\n        return false;\n      }\n      const next = node.children.get(ch);\n      return next === undefined ? false : walk(next, i + 1);\n    };\n    return walk(this.root, 0);\n  }\n}\n",
    tests: [
      {
        name: "the classic sequence",
        body: "const d = new WordDictionary();\nd.addWord('bad');\nd.addWord('dad');\nd.addWord('mad');\nassert.equal(d.search('pad'), false);\nassert.equal(d.search('bad'), true);\nassert.equal(d.search('.ad'), true);\nassert.equal(d.search('b..'), true);",
      },
      {
        name: "length must match exactly",
        body: "const d = new WordDictionary();\nd.addWord('bad');\nassert.equal(d.search('b.'), false);\nassert.equal(d.search('b...'), false);\nassert.equal(d.search('...'), true);",
      },
      {
        name: "a prefix of a stored word is not a match",
        body: "const d = new WordDictionary();\nd.addWord('apple');\nassert.equal(d.search('app'), false);\nassert.equal(d.search('appl.'), true);\nd.addWord('app');\nassert.equal(d.search('app'), true);",
      },
      {
        name: "all wildcards and an empty dictionary",
        body: "const empty = new WordDictionary();\nassert.equal(empty.search('a'), false);\nassert.equal(empty.search('.'), false);\nconst d = new WordDictionary();\nd.addWord('at');\nassert.equal(d.search('..'), true);\nassert.equal(d.search('.'), false);",
      },
      {
        name: "backtracks past a dead branch",
        body: "const d = new WordDictionary();\nd.addWord('at');\nd.addWord('and');\nd.addWord('an');\nd.addWord('add');\nassert.equal(d.search('a'), false);\nassert.equal(d.search('.at'), false);\nassert.equal(d.search('an.'), true);\nassert.equal(d.search('a.d.'), false);\nassert.equal(d.search('a.d'), true);\nassert.equal(d.search('.'), false);",
      },
    ],
  },
{
    id: "ex-word-search-ii",
    chapter: "dsa-tries",
    level: "advanced",
    title: "Word Search II",
    brief:
      "<p>Given a character grid <code>board</code> and a list of <code>words</code>, return every word that can be spelled by walking through adjacent cells.</p><ul><li>Adjacent means horizontally or vertically neighbouring; a cell may not be reused within one word</li><li>Each found word appears in the result <b>once</b>, in any order</li><li>Running the single-word search once per word is far too slow — build a <b>trie</b> of the words and walk the board once, abandoning a path as soon as it leaves the trie</li><li>The board must be left exactly as you found it</li></ul>",
    starter:
      "function findWords(board, words) {\n  // TODO: build a trie of words, then walk the board once, pruning dead prefixes\n}\n",
    hints: [
      "Insert every word into a trie first. Now one depth-first walk of the board can hunt for all of them at once: the current trie node tells you which letters are still worth trying.",
      "Descend the board and the trie in lockstep. If the current cell's letter has no child in the trie node, that whole branch is dead — return immediately.",
      "Store the finished word on its terminal trie node. When you land on such a node, record the word and then CLEAR it, which both deduplicates the result and prunes the node. As always, restore the board cell after recursing.",
    ],
    solution:
      "function findWords(board, words) {\n  const root = {};\n  for (const w of words) {\n    let node = root;\n    for (const ch of w) {\n      if (!node[ch]) node[ch] = {};\n      node = node[ch];\n    }\n    node.word = w;\n  }\n  const rows = board.length;\n  const cols = rows > 0 ? board[0].length : 0;\n  const out = [];\n  const walk = (r, c, node) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return;\n    const ch = board[r][c];\n    const next = node[ch];\n    if (!next) return;\n    if (next.word) {\n      out.push(next.word);\n      next.word = null;\n    }\n    board[r][c] = '#';\n    walk(r + 1, c, next);\n    walk(r - 1, c, next);\n    walk(r, c + 1, next);\n    walk(r, c - 1, next);\n    board[r][c] = ch;\n  };\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) walk(r, c, root);\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds two of four words",
        body: "const board = [\n  ['o','a','a','n'],\n  ['e','t','a','e'],\n  ['i','h','k','r'],\n  ['i','f','l','v'],\n];\nconst out = findWords(board, ['oath','pea','eat','rain']).slice().sort();\nassert.deepEqual(out, ['eat', 'oath']);",
      },
      {
        name: "no word can be spelled",
        body: "assert.deepEqual(findWords([['a','b'],['c','d']], ['abcb']), []);\nassert.deepEqual(findWords([['a','a']], ['aaa']), []);",
      },
      {
        name: "each word is reported only once",
        body: "const out = findWords([['a','a']], ['a']);\nassert.deepEqual(out, ['a']);",
      },
      {
        name: "the board is restored",
        body: "const board = [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']];\nfindWords(board, ['oath','eat','oat','hklv']);\nassert.deepEqual(board, [['o','a','a','n'],['e','t','a','e'],['i','h','k','r'],['i','f','l','v']]);",
      },
      {
        name: "overlapping words and empty inputs",
        body: "const board = [['a','b'],['c','d']];\nconst out = findWords(board, ['ab','abc','abcd','cd','ac','ba','x']).slice().sort();\nassert.deepEqual(out, ['ab', 'ac', 'ba', 'cd']);\nassert.deepEqual(findWords([['a']], []), []);",
      },
    ],
  },
{
    id: "ex-lru-cache",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "LRU Cache",
    brief:
      "<p>Design a cache with a fixed <code>capacity</code> that evicts the <b>least recently used</b> entry when it overflows.</p><ul><li><code>new LRUCache(capacity)</code> — capacity is a positive integer</li><li><code>get(key)</code> — return the value, or <code>-1</code> if absent. A successful <code>get</code> counts as a <b>use</b> and makes that key the most recently used</li><li><code>put(key, value)</code> — insert or overwrite; this also counts as a use. If the cache is over capacity afterwards, evict the least recently used key</li><li>Both operations must be <b>O(1)</b>, so no scanning for the oldest entry</li></ul>",
    starter:
      "class LRUCache {\n  constructor(capacity) {\n    // TODO: remember the capacity and set up the storage\n  }\n\n  get(key) {\n    // TODO: return the value (and mark it as recently used), or -1\n  }\n\n  put(key, value) {\n    // TODO: insert or update, evicting the least recently used key if needed\n  }\n}\n",
    hints: [
      "You need two things at once: O(1) lookup by key, and an ordering by recency you can update in O(1). A plain object gives you the first but not the second.",
      "The textbook answer is a hash map of key -> node in a doubly linked list, where the list is kept in recency order. In JavaScript a Map already iterates in insertion order, which gives you the same thing far more cheaply.",
      "With a Map, 'touch this key' is delete followed by set — that moves it to the back. The least recently used key is then simply the first key the Map yields.",
    ],
    solution:
      "class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n    this.entries = new Map();\n  }\n\n  get(key) {\n    if (!this.entries.has(key)) return -1;\n    const value = this.entries.get(key);\n    this.entries.delete(key);\n    this.entries.set(key, value);\n    return value;\n  }\n\n  put(key, value) {\n    if (this.entries.has(key)) this.entries.delete(key);\n    this.entries.set(key, value);\n    if (this.entries.size > this.capacity) {\n      const oldest = this.entries.keys().next().value;\n      this.entries.delete(oldest);\n    }\n  }\n}\n",
    tests: [
      {
        name: "the classic sequence",
        body: "const c = new LRUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nassert.equal(c.get(1), 1);\nc.put(3, 3);\nassert.equal(c.get(2), -1);\nc.put(4, 4);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(3), 3);\nassert.equal(c.get(4), 4);",
      },
      {
        name: "reading an entry protects it from eviction",
        body: "const c = new LRUCache(2);\nc.put('a', 1);\nc.put('b', 2);\nassert.equal(c.get('a'), 1);\nc.put('c', 3);\nassert.equal(c.get('b'), -1);\nassert.equal(c.get('a'), 1);\nassert.equal(c.get('c'), 3);",
      },
      {
        name: "overwriting refreshes recency without growing the cache",
        body: "const c = new LRUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nc.put(1, 10);\nc.put(3, 3);\nassert.equal(c.get(2), -1);\nassert.equal(c.get(1), 10);\nassert.equal(c.get(3), 3);",
      },
      {
        name: "capacity of one",
        body: "const c = new LRUCache(1);\nc.put(1, 1);\nassert.equal(c.get(1), 1);\nc.put(2, 2);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(2), 2);",
      },
      {
        name: "misses do not disturb the ordering",
        body: "const c = new LRUCache(2);\nc.put(1, 1);\nc.put(2, 2);\nassert.equal(c.get(9), -1);\nc.put(3, 3);\nassert.equal(c.get(1), -1);\nassert.equal(c.get(2), 2);\nassert.equal(c.get(3), 3);",
      },
    ],
  },
{
    id: "ex-design-hashmap",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Design HashMap",
    brief:
      "<p>Build a hash map from scratch, <b>without</b> using the built-in <code>Map</code>, <code>Set</code>, or a plain object as the store.</p><ul><li><code>new MyHashMap(bucketCount)</code> — <code>bucketCount</code> is optional and defaults to <code>769</code></li><li><code>put(key, value)</code> — insert, or overwrite an existing key</li><li><code>get(key)</code> — the value, or <code>-1</code> if the key is absent</li><li><code>remove(key)</code> — delete the key if present; removing a missing key is a no-op</li><li>Keys are non-negative integers. Different keys <b>will</b> land in the same bucket, and your map must still keep them apart</li></ul>",
    starter:
      "class MyHashMap {\n  constructor(bucketCount) {\n    // TODO: create the array of buckets (default 769 of them)\n  }\n\n  put(key, value) {\n    // TODO: insert or overwrite\n  }\n\n  get(key) {\n    // TODO: the stored value, or -1\n  }\n\n  remove(key) {\n    // TODO: delete the key if it is there\n  }\n}\n",
    hints: [
      "Storage is an array of buckets. The hash turns a key into a bucket index — key % bucketCount is enough here.",
      "Two keys sharing a bucket is a collision, and it is normal. The standard fix is separate chaining: each bucket holds a list of [key, value] pairs.",
      "Every operation is 'find the bucket, then scan that small list for the key'. put overwrites the pair it finds and only pushes a new one if nothing matched; remove splices the pair out.",
    ],
    solution:
      "class MyHashMap {\n  constructor(bucketCount) {\n    this.bucketCount = bucketCount || 769;\n    this.buckets = [];\n    for (let i = 0; i < this.bucketCount; i++) this.buckets.push([]);\n  }\n\n  bucketFor(key) {\n    const i = ((key % this.bucketCount) + this.bucketCount) % this.bucketCount;\n    return this.buckets[i];\n  }\n\n  put(key, value) {\n    const bucket = this.bucketFor(key);\n    for (const pair of bucket) {\n      if (pair[0] === key) {\n        pair[1] = value;\n        return;\n      }\n    }\n    bucket.push([key, value]);\n  }\n\n  get(key) {\n    const bucket = this.bucketFor(key);\n    for (const pair of bucket) {\n      if (pair[0] === key) return pair[1];\n    }\n    return -1;\n  }\n\n  remove(key) {\n    const bucket = this.bucketFor(key);\n    for (let i = 0; i < bucket.length; i++) {\n      if (bucket[i][0] === key) {\n        bucket.splice(i, 1);\n        return;\n      }\n    }\n  }\n}\n",
    tests: [
      {
        name: "put, get and remove",
        body: "const m = new MyHashMap();\nm.put(1, 1);\nm.put(2, 2);\nassert.equal(m.get(1), 1);\nassert.equal(m.get(3), -1);\nm.put(2, 1);\nassert.equal(m.get(2), 1);\nm.remove(2);\nassert.equal(m.get(2), -1);",
      },
      {
        name: "colliding keys stay separate",
        body: "const m = new MyHashMap(4);\nm.put(1, 'a');\nm.put(5, 'b');\nm.put(9, 'c');\nassert.equal(m.get(1), 'a');\nassert.equal(m.get(5), 'b');\nassert.equal(m.get(9), 'c');\nm.remove(5);\nassert.equal(m.get(5), -1);\nassert.equal(m.get(1), 'a');\nassert.equal(m.get(9), 'c');",
      },
      {
        name: "overwriting does not duplicate a colliding key",
        body: "const m = new MyHashMap(4);\nm.put(2, 20);\nm.put(6, 60);\nm.put(2, 22);\nassert.equal(m.get(2), 22);\nassert.equal(m.get(6), 60);\nm.remove(2);\nassert.equal(m.get(2), -1);\nassert.equal(m.get(6), 60);",
      },
      {
        name: "removing a missing key is harmless, and zero is a valid key",
        body: "const m = new MyHashMap(4);\nm.remove(7);\nassert.equal(m.get(7), -1);\nm.put(0, 0);\nassert.equal(m.get(0), 0);\nm.remove(0);\nassert.equal(m.get(0), -1);",
      },
      {
        name: "holds many keys at once",
        body: "const m = new MyHashMap(8);\nfor (let k = 0; k < 200; k++) m.put(k, k * 3);\nfor (let k = 0; k < 200; k++) assert.equal(m.get(k), k * 3);\nfor (let k = 0; k < 200; k += 2) m.remove(k);\nassert.equal(m.get(50), -1);\nassert.equal(m.get(51), 153);",
      },
    ],
  },
{
    id: "ex-time-based-key-value-store",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Time Based Key-Value Store",
    brief:
      "<p>Design a store that keeps <b>every</b> version of a key's value and can be queried as of a point in time.</p><ul><li><code>set(key, value, timestamp)</code> — record a value for that key at that time. Timestamps are strictly increasing per key</li><li><code>get(key, timestamp)</code> — the value written at the <b>largest</b> stored time that is <code>&lt;= timestamp</code></li><li>If the key has no write at or before that time (or does not exist at all), return the empty string <code>''</code></li><li><code>get</code> must be <b>O(log n)</b> in the number of writes for that key — a backwards linear scan is not good enough</li></ul>",
    starter:
      "class TimeMap {\n  constructor() {\n    // TODO: set up the storage\n  }\n\n  set(key, value, timestamp) {\n    // TODO: append this version\n  }\n\n  get(key, timestamp) {\n    // TODO: the value at the largest stored time <= timestamp, else ''\n  }\n}\n",
    hints: [
      "Keep the versions of each key separate: a map from key to a list of that key's writes. Nothing about one key should be scanned when reading another.",
      "Because timestamps arrive in increasing order, each key's list is already sorted by time — so you can binary search it instead of scanning.",
      "This is a 'largest value <= target' search, not an exact-match search. When the midpoint's time is <= the query, remember its value as the best answer so far and keep searching to the RIGHT for something better.",
    ],
    solution:
      "class TimeMap {\n  constructor() {\n    this.store = new Map();\n  }\n\n  set(key, value, timestamp) {\n    if (!this.store.has(key)) this.store.set(key, []);\n    this.store.get(key).push([timestamp, value]);\n  }\n\n  get(key, timestamp) {\n    const versions = this.store.get(key);\n    if (!versions) return '';\n    let lo = 0;\n    let hi = versions.length - 1;\n    let best = '';\n    while (lo <= hi) {\n      const mid = lo + Math.floor((hi - lo) / 2);\n      if (versions[mid][0] <= timestamp) {\n        best = versions[mid][1];\n        lo = mid + 1;\n      } else {\n        hi = mid - 1;\n      }\n    }\n    return best;\n  }\n}\n",
    tests: [
      {
        name: "reads the value in force at that time",
        body: "const t = new TimeMap();\nt.set('foo', 'bar', 1);\nassert.equal(t.get('foo', 1), 'bar');\nassert.equal(t.get('foo', 3), 'bar');\nt.set('foo', 'bar2', 4);\nassert.equal(t.get('foo', 4), 'bar2');\nassert.equal(t.get('foo', 5), 'bar2');",
      },
      {
        name: "queries before the first write return the empty string",
        body: "const t = new TimeMap();\nt.set('a', 'one', 10);\nassert.equal(t.get('a', 9), '');\nassert.equal(t.get('a', 10), 'one');\nassert.equal(t.get('missing', 100), '');",
      },
      {
        name: "keys are independent",
        body: "const t = new TimeMap();\nt.set('a', 'a1', 1);\nt.set('b', 'b1', 2);\nt.set('a', 'a2', 3);\nassert.equal(t.get('a', 2), 'a1');\nassert.equal(t.get('b', 2), 'b1');\nassert.equal(t.get('b', 1), '');\nassert.equal(t.get('a', 99), 'a2');",
      },
      {
        name: "picks the right version among many",
        body: "const t = new TimeMap();\nt.set('k', 'v0', 0);\nt.set('k', 'v5', 5);\nt.set('k', 'v10', 10);\nt.set('k', 'v20', 20);\nassert.equal(t.get('k', 0), 'v0');\nassert.equal(t.get('k', 4), 'v0');\nassert.equal(t.get('k', 5), 'v5');\nassert.equal(t.get('k', 19), 'v10');\nassert.equal(t.get('k', 20), 'v20');\nassert.equal(t.get('k', 1000), 'v20');",
      },
      {
        name: "handles a long history",
        body: "const t = new TimeMap();\nfor (let i = 0; i < 2000; i++) t.set('k', 'v' + i, i * 2);\nassert.equal(t.get('k', 0), 'v0');\nassert.equal(t.get('k', 1), 'v0');\nassert.equal(t.get('k', 1999), 'v999');\nassert.equal(t.get('k', 3998), 'v1999');\nassert.equal(t.get('k', 999999), 'v1999');",
      },
    ],
  },
{
    id: "ex-insert-delete-getrandom",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Insert Delete GetRandom O(1)",
    brief:
      "<p>Design a set supporting insert, remove and 'give me a uniformly chosen member', all in <b>average O(1)</b>.</p><ul><li><code>insert(value)</code> — returns <code>true</code> if the value was not already there, otherwise <code>false</code> and nothing changes</li><li><code>remove(value)</code> — returns <code>true</code> if the value was there, otherwise <code>false</code></li><li><code>getRandom()</code> — returns one of the current members</li><li><b>Testability:</b> the constructor takes an optional <code>pick</code> function <code>(n) =&gt; index</code> that chooses an index in <code>0..n-1</code>. When it is omitted, default to a uniform random choice</li><li>You may not scan the collection in <code>remove</code> or <code>getRandom</code></li></ul>",
    starter:
      "class RandomizedSet {\n  constructor(pick) {\n    // TODO: keep the optional pick function (default: uniform random) and set up storage\n  }\n\n  insert(value) {\n    // TODO: true if newly added\n  }\n\n  remove(value) {\n    // TODO: true if it was present\n  }\n\n  getRandom() {\n    // TODO: a member chosen with this.pick\n  }\n}\n",
    hints: [
      "getRandom by index needs a dense array. Membership and removal in O(1) need a map. Keep both: an array of values, and a map from value to its index in that array.",
      "The hard part is remove: splicing out of the middle of the array is O(n) and shifts every later index. Instead, move the LAST value into the hole and then pop.",
      "When you move the last value, remember to update its index in the map — and be careful when the value being removed IS the last one, so you do not resurrect an entry you just deleted.",
    ],
    solution:
      "class RandomizedSet {\n  constructor(pick) {\n    this.pick = pick || ((n) => Math.floor(Math.random() * n));\n    this.values = [];\n    this.indexOf = new Map();\n  }\n\n  insert(value) {\n    if (this.indexOf.has(value)) return false;\n    this.indexOf.set(value, this.values.length);\n    this.values.push(value);\n    return true;\n  }\n\n  remove(value) {\n    if (!this.indexOf.has(value)) return false;\n    const hole = this.indexOf.get(value);\n    const last = this.values[this.values.length - 1];\n    this.values[hole] = last;\n    this.indexOf.set(last, hole);\n    this.values.pop();\n    this.indexOf.delete(value);\n    return true;\n  }\n\n  getRandom() {\n    return this.values[this.pick(this.values.length)];\n  }\n}\n",
    tests: [
      {
        name: "insert and remove report whether anything changed",
        body: "const s = new RandomizedSet((n) => 0);\nassert.equal(s.insert(1), true);\nassert.equal(s.insert(1), false);\nassert.equal(s.remove(2), false);\nassert.equal(s.insert(2), true);\nassert.equal(s.remove(1), true);\nassert.equal(s.remove(1), false);\nassert.equal(s.getRandom(), 2);",
      },
      {
        name: "the picker decides which member comes back",
        body: "const s = new RandomizedSet((n) => n - 1);\ns.insert('a');\ns.insert('b');\ns.insert('c');\nassert.equal(s.getRandom(), 'c');\nconst t = new RandomizedSet((n) => 0);\nt.insert('a');\nt.insert('b');\nassert.equal(t.getRandom(), 'a');",
      },
      {
        name: "removing from the middle keeps every other member reachable",
        body: "const s = new RandomizedSet((n) => 0);\nfor (const v of [10, 20, 30, 40, 50]) s.insert(v);\nassert.equal(s.remove(20), true);\nassert.equal(s.remove(40), true);\nconst seen = [];\nfor (let i = 0; i < 3; i++) {\n  const one = s.getRandom();\n  seen.push(one);\n  s.remove(one);\n}\nassert.deepEqual(seen.slice().sort((a, b) => a - b), [10, 30, 50]);",
      },
      {
        name: "removing the last-inserted value",
        body: "const s = new RandomizedSet((n) => 0);\ns.insert(1);\ns.insert(2);\nassert.equal(s.remove(2), true);\nassert.equal(s.remove(2), false);\nassert.equal(s.getRandom(), 1);\nassert.equal(s.insert(2), true);\nassert.equal(s.remove(1), true);\nassert.equal(s.getRandom(), 2);",
      },
      {
        name: "re-inserting after a removal works",
        body: "const s = new RandomizedSet((n) => n - 1);\ns.insert(1);\nassert.equal(s.remove(1), true);\nassert.equal(s.insert(1), true);\nassert.equal(s.getRandom(), 1);\ns.insert(7);\nassert.equal(s.getRandom(), 7);\nassert.equal(s.remove(7), true);\nassert.equal(s.getRandom(), 1);",
      },
    ],
  },
{
    id: "ex-merge-sort",
    chapter: "dsa-sorting-algorithms",
    level: "intermediate",
    title: "Merge Sort",
    brief:
      "<p>Implement <b>merge sort</b>: return a new array holding <code>nums</code> in ascending order.</p><ul><li>You may <b>not</b> call <code>Array.prototype.sort</code> — the point is to write the algorithm</li><li>The input array must be left <b>unchanged</b>; return a new array</li><li>Duplicates, negatives, an empty array and a single element must all work</li><li>Merge sort is <b>O(n log n)</b> in every case: log n levels of splitting, and each level merges a total of n elements</li></ul>",
    starter:
      "function mergeSort(nums) {\n  // TODO: split in half, sort each half recursively, then merge the two sorted halves\n}\n",
    hints: [
      "Two pieces: the recursive split, and a merge step that takes two ALREADY sorted arrays and interleaves them into one. Write merge first — it is the part with the real logic.",
      "Merging walks two pointers, one per array, repeatedly taking the smaller front element. When one side runs out, append whatever is left of the other.",
      "The base case is a length of 0 or 1, which is already sorted. Return a copy there so the caller never gets a view onto the original array.",
    ],
    solution:
      "function mergeSort(nums) {\n  if (nums.length <= 1) return nums.slice();\n  const mid = Math.floor(nums.length / 2);\n  const left = mergeSort(nums.slice(0, mid));\n  const right = mergeSort(nums.slice(mid));\n  const out = [];\n  let i = 0;\n  let j = 0;\n  while (i < left.length && j < right.length) {\n    if (left[i] <= right[j]) {\n      out.push(left[i]);\n      i++;\n    } else {\n      out.push(right[j]);\n      j++;\n    }\n  }\n  while (i < left.length) {\n    out.push(left[i]);\n    i++;\n  }\n  while (j < right.length) {\n    out.push(right[j]);\n    j++;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "sorts a jumbled array",
        body: "assert.deepEqual(mergeSort([5, 2, 3, 1]), [1, 2, 3, 5]);\nassert.deepEqual(mergeSort([5, 1, 1, 2, 0, 0]), [0, 0, 1, 1, 2, 5]);",
      },
      {
        name: "negatives and duplicates",
        body: "assert.deepEqual(mergeSort([-3, 7, -3, 0, 7]), [-3, -3, 0, 7, 7]);\nassert.deepEqual(mergeSort([2, 2, 2]), [2, 2, 2]);",
      },
      {
        name: "empty, single and already sorted",
        body: "assert.deepEqual(mergeSort([]), []);\nassert.deepEqual(mergeSort([9]), [9]);\nassert.deepEqual(mergeSort([1, 2, 3, 4]), [1, 2, 3, 4]);\nassert.deepEqual(mergeSort([4, 3, 2, 1]), [1, 2, 3, 4]);",
      },
      {
        name: "the input is not modified",
        body: "const input = [3, 1, 2];\nconst out = mergeSort(input);\nassert.deepEqual(input, [3, 1, 2]);\nassert.deepEqual(out, [1, 2, 3]);\nassert.notEqual(out, input);",
      },
      {
        name: "a large array, sorted and complete",
        body: "let seed = 7;\nconst next = () => {\n  seed = (seed * 48271) % 2147483647;\n  return seed % 1000;\n};\nconst input = [];\nfor (let i = 0; i < 600; i++) input.push(next() - 500);\nconst before = input.reduce((a, b) => a + b, 0);\nconst out = mergeSort(input);\nassert.equal(out.length, 600);\nassert.equal(out.reduce((a, b) => a + b, 0), before);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1] <= out[i]);",
      },
    ],
  },
{
    id: "ex-quickselect-kth-largest",
    chapter: "dsa-sorting-algorithms",
    level: "advanced",
    title: "Kth Largest Element — Quickselect",
    brief:
      "<p>Return the <code>k</code>th <b>largest</b> element of <code>nums</code> — that is, the element that would sit at index <code>n - k</code> if the array were sorted ascending.</p><ul><li>This is the kth largest <em>value by position</em>, not the kth distinct value: in <code>[3,2,3,1,2,4,5,5,6]</code> the 4th largest is <code>4</code></li><li>Do <b>not</b> sort the whole array. Use <b>quickselect</b>: partition, then recurse into the one side that can contain the answer — average O(n)</li><li>Choose the pivot <b>deterministically</b> (median-of-three of the low, middle and high elements) so the result never depends on randomness</li><li>The input array must not be modified — partition a copy</li></ul>",
    starter:
      "function findKthLargest(nums, k) {\n  // TODO: quickselect on a copy; deterministic pivot, no full sort\n}\n",
    hints: [
      "Translate the question into an index first: the kth largest sits at index nums.length - k in ascending order. Now you are hunting for one index.",
      "Partition a copy around a pivot so that everything smaller ends up left of it. The pivot then lands at its FINAL sorted index — compare that index with your target.",
      "If the pivot landed left of the target, the answer is in the right part, so move the low bound past it; if it landed right, move the high bound. Unlike quicksort you only ever recurse into one side, which is what turns n log n into an average of n.",
    ],
    solution:
      "function findKthLargest(nums, k) {\n  const a = nums.slice();\n  const target = a.length - k;\n  const swap = (i, j) => {\n    const tmp = a[i];\n    a[i] = a[j];\n    a[j] = tmp;\n  };\n  let lo = 0;\n  let hi = a.length - 1;\n  while (lo < hi) {\n    // median-of-three: park the median of a[lo], a[mid], a[hi] at hi\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (a[mid] < a[lo]) swap(mid, lo);\n    if (a[hi] < a[lo]) swap(hi, lo);\n    if (a[hi] < a[mid]) swap(hi, mid);\n    swap(mid, hi);\n    const pivot = a[hi];\n    let store = lo;\n    for (let i = lo; i < hi; i++) {\n      if (a[i] < pivot) {\n        swap(i, store);\n        store++;\n      }\n    }\n    swap(store, hi);\n    if (store === target) return a[store];\n    if (store < target) lo = store + 1;\n    else hi = store - 1;\n  }\n  return a[lo];\n}\n",
    tests: [
      {
        name: "second largest",
        body: "assert.equal(findKthLargest([3, 2, 1, 5, 6, 4], 2), 5);",
      },
      {
        name: "duplicates count as separate positions",
        body: "assert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 4), 4);\nassert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 1), 6);\nassert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 2), 5);\nassert.equal(findKthLargest([3, 2, 3, 1, 2, 4, 5, 5, 6], 3), 5);",
      },
      {
        name: "single element, all equal, and negatives",
        body: "assert.equal(findKthLargest([1], 1), 1);\nassert.equal(findKthLargest([7, 7, 7], 2), 7);\nassert.equal(findKthLargest([-1, -5, -3], 1), -1);\nassert.equal(findKthLargest([-1, -5, -3], 3), -5);",
      },
      {
        name: "the input array is untouched",
        body: "const input = [3, 2, 1, 5, 6, 4];\nfindKthLargest(input, 3);\nassert.deepEqual(input, [3, 2, 1, 5, 6, 4]);",
      },
      {
        name: "agrees with sorting on a large array",
        body: "let seed = 11;\nconst next = () => {\n  seed = (seed * 48271) % 2147483647;\n  return seed % 5000;\n};\nconst input = [];\nfor (let i = 0; i < 1000; i++) input.push(next() - 2500);\nconst sorted = input.slice().sort((x, y) => x - y);\nfor (const k of [1, 2, 17, 500, 999, 1000]) {\n  assert.equal(findKthLargest(input, k), sorted[1000 - k], 'k = ' + k);\n}\nconst sortedInput = [];\nfor (let i = 0; i < 400; i++) sortedInput.push(i);\nassert.equal(findKthLargest(sortedInput, 1), 399);\nassert.equal(findKthLargest(sortedInput, 400), 0);",
      },
    ],
  },
{
    id: "ex-sort-an-array",
    chapter: "dsa-sorting-algorithms",
    level: "intermediate",
    title: "Sort an Array",
    brief:
      "<p>Sort <code>nums</code> into ascending order and return it, using an algorithm that runs in <b>O(n log n)</b> time.</p><ul><li>You may <b>not</b> call <code>Array.prototype.sort</code></li><li>Quadratic algorithms — bubble, insertion, selection — are not acceptable; the tests use arrays large enough to notice</li><li>Heap sort is a good fit because it sorts <b>in place</b> with O(1) extra space; merge sort would also qualify</li><li>Duplicates, negatives, an empty array and a single element must all work</li></ul>",
    starter:
      "function sortArray(nums) {\n  // TODO: sort in O(n log n) without Array.prototype.sort, and return the array\n}\n",
    hints: [
      "Heap sort has two phases. First turn the array into a max-heap in place; then repeatedly swap the root (the maximum) to the end and shrink the heap by one.",
      "The workhorse is 'sift down': given a root index and the heap size, compare the node with its two children at 2i+1 and 2i+2, swap with the larger if it is bigger, and continue down from there.",
      "Build the heap by sifting down from index floor(n/2) - 1 back to 0 — those are the only nodes with children. Leaves are already valid heaps of one.",
    ],
    solution:
      "function sortArray(nums) {\n  const n = nums.length;\n  const swap = (i, j) => {\n    const tmp = nums[i];\n    nums[i] = nums[j];\n    nums[j] = tmp;\n  };\n  const siftDown = (root, size) => {\n    while (true) {\n      const left = 2 * root + 1;\n      const right = left + 1;\n      let largest = root;\n      if (left < size && nums[left] > nums[largest]) largest = left;\n      if (right < size && nums[right] > nums[largest]) largest = right;\n      if (largest === root) return;\n      swap(root, largest);\n      root = largest;\n    }\n  };\n  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) siftDown(i, n);\n  for (let end = n - 1; end > 0; end--) {\n    swap(0, end);\n    siftDown(0, end);\n  }\n  return nums;\n}\n",
    tests: [
      {
        name: "sorts a jumbled array",
        body: "assert.deepEqual(sortArray([5, 2, 3, 1]), [1, 2, 3, 5]);\nassert.deepEqual(sortArray([5, 1, 1, 2, 0, 0]), [0, 0, 1, 1, 2, 5]);",
      },
      {
        name: "negatives and duplicates",
        body: "assert.deepEqual(sortArray([-4, 0, -4, 9, 9, -1]), [-4, -4, -1, 0, 9, 9]);\nassert.deepEqual(sortArray([3, 3, 3]), [3, 3, 3]);",
      },
      {
        name: "empty, single, sorted and reversed",
        body: "assert.deepEqual(sortArray([]), []);\nassert.deepEqual(sortArray([42]), [42]);\nassert.deepEqual(sortArray([1, 2, 3]), [1, 2, 3]);\nassert.deepEqual(sortArray([3, 2, 1]), [1, 2, 3]);",
      },
      {
        name: "a large array, sorted and complete",
        body: "let seed = 5;\nconst next = () => {\n  seed = (seed * 48271) % 2147483647;\n  return seed % 10000;\n};\nconst input = [];\nfor (let i = 0; i < 5000; i++) input.push(next() - 5000);\nconst before = input.reduce((a, b) => a + b, 0);\nconst out = sortArray(input);\nassert.equal(out.length, 5000);\nassert.equal(out.reduce((a, b) => a + b, 0), before);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1] <= out[i]);",
      },
      {
        name: "a big already-sorted array does not blow up",
        body: "const input = [];\nfor (let i = 0; i < 5000; i++) input.push(i);\nconst out = sortArray(input);\nassert.equal(out[0], 0);\nassert.equal(out[4999], 4999);\nfor (let i = 1; i < out.length; i++) assert.ok(out[i - 1] <= out[i]);",
      },
    ],
  },
{
    id: "ex-largest-number",
    chapter: "dsa-sorting-algorithms",
    level: "intermediate",
    title: "Largest Number",
    brief:
      "<p>Given an array of non-negative integers, arrange them so that concatenating their decimal digits gives the <b>largest possible number</b>. Return it as a <b>string</b>.</p><ul><li><code>[10, 2]</code> gives <code>'210'</code>, because <code>210 &gt; 102</code></li><li>Sorting numerically or lexicographically both give the wrong answer — you need a custom comparator</li><li>The result can be far longer than a JavaScript number can hold, which is why it is a string</li><li><b>Edge case:</b> all zeros must return <code>'0'</code>, not <code>'000'</code></li><li>An empty array returns <code>''</code></li></ul>",
    starter:
      "function largestNumber(nums) {\n  // TODO: order the numbers so their concatenation is as large as possible\n}\n",
    hints: [
      "Work with the numbers as strings. Then ask: given two of them, a and b, which should come first?",
      "The answer is decided by the only thing that matters — compare the two concatenations a + b and b + a as strings, and put a first when a + b is the bigger one. That comparator is consistent, so sorting with it is safe.",
      "After joining, one case remains: if the largest value is 0 then every value is 0, and the join produces a string of zeros. Detect it by checking whether the first element of the sorted list is '0'.",
    ],
    solution:
      "function largestNumber(nums) {\n  const parts = nums.map((n) => String(n));\n  parts.sort((a, b) => {\n    const ab = a + b;\n    const ba = b + a;\n    if (ab === ba) return 0;\n    return ab > ba ? -1 : 1;\n  });\n  if (parts.length === 0) return '';\n  if (parts[0] === '0') return '0';\n  return parts.join('');\n}\n",
    tests: [
      {
        name: "the two-number case",
        body: "assert.equal(largestNumber([10, 2]), '210');",
      },
      {
        name: "the classic example",
        body: "assert.equal(largestNumber([3, 30, 34, 5, 9]), '9534330');",
      },
      {
        name: "all zeros collapse to a single zero",
        body: "assert.equal(largestNumber([0, 0]), '0');\nassert.equal(largestNumber([0, 0, 0, 0]), '0');\nassert.equal(largestNumber([0]), '0');",
      },
      {
        name: "prefixes need the concatenation comparison",
        body: "assert.equal(largestNumber([432, 43243]), '43243432');\nassert.equal(largestNumber([12, 121]), '12121');\nassert.equal(largestNumber([128, 12]), '12812');",
      },
      {
        name: "single value, a leading zero case, and an empty array",
        body: "assert.equal(largestNumber([1]), '1');\nassert.equal(largestNumber([10, 0]), '100');\nassert.equal(largestNumber([0, 1]), '10');\nassert.equal(largestNumber([]), '');",
      },
    ],
  },
{
    id: "ex-fibonacci-memoised",
    chapter: "dsa-basic-recursion",
    level: "beginner",
    title: "Fibonacci with Memoisation",
    brief:
      "<p>Return the <code>n</code>th Fibonacci number, where <code>fib(0) = 0</code>, <code>fib(1) = 1</code> and every later value is the sum of the two before it.</p><ul><li>The naive recursion <code>fib(n-1) + fib(n-2)</code> is <b>O(2^n)</b>: each call spawns two more, so the call tree roughly doubles at every level and the same subproblems are recomputed over and over — <code>fib(40)</code> already takes billions of calls</li><li><b>Memoise</b> it: cache each result the first time you compute it. Every value is then computed once, making it <b>O(n)</b></li><li>The tests call <code>fib(78)</code>, which is unreachable without a cache</li><li>Answers stay exact integers up to <code>fib(78)</code></li></ul>",
    starter:
      "function fib(n) {\n  // TODO: recursive fibonacci, but cache each result so nothing is computed twice\n}\n",
    hints: [
      "Keep the recursive shape — the only change is a lookup table that the recursion consults before doing any work.",
      "Define an inner helper that closes over a Map (or plain object). Its first line checks the cache, and its last line writes the result into the cache before returning.",
      "Base cases first: n of 0 or 1 returns n. Everything else is helper(n - 1) + helper(n - 2), and thanks to the cache the second call is nearly free.",
    ],
    solution:
      "function fib(n) {\n  const memo = new Map();\n  const go = (k) => {\n    if (k < 2) return k;\n    if (memo.has(k)) return memo.get(k);\n    const value = go(k - 1) + go(k - 2);\n    memo.set(k, value);\n    return value;\n  };\n  return go(n);\n}\n",
    tests: [
      {
        name: "the base cases",
        body: "assert.equal(fib(0), 0);\nassert.equal(fib(1), 1);\nassert.equal(fib(2), 1);",
      },
      {
        name: "the start of the sequence",
        body: "const first = [];\nfor (let i = 0; i < 11; i++) first.push(fib(i));\nassert.deepEqual(first, [0, 1, 1, 2, 3, 5, 8, 13, 21, 34, 55]);",
      },
      {
        name: "each term is the sum of the two before it",
        body: "for (let i = 2; i < 30; i++) {\n  assert.equal(fib(i), fib(i - 1) + fib(i - 2), 'at i = ' + i);\n}",
      },
      {
        name: "large n finishes instantly",
        body: "assert.equal(fib(50), 12586269025);\nassert.equal(fib(78), 8944394323791464);",
      },
      {
        name: "repeated calls stay correct",
        body: "assert.equal(fib(40), 102334155);\nassert.equal(fib(40), 102334155);\nassert.equal(fib(10), 55);\nassert.equal(fib(70), 190392490709135);",
      },
    ],
  },
{
    id: "ex-fast-power",
    chapter: "dsa-basic-recursion",
    level: "intermediate",
    title: "Pow(x, n) — Fast Exponentiation",
    brief:
      "<p>Compute <code>x</code> raised to the power <code>n</code> without using <code>Math.pow</code> or the <code>**</code> operator.</p><ul><li><code>n</code> is an integer and <b>may be negative</b>: <code>x^-n</code> is <code>1 / x^n</code></li><li><code>n = 0</code> gives <code>1</code> for any <code>x</code></li><li>Multiplying <code>n</code> times is O(n) and far too slow for large exponents. Use <b>fast exponentiation</b>: squaring the base halves the exponent each step, giving <b>O(log n)</b></li><li>Watch the most negative 32-bit exponent, <code>-2147483648</code> — negating it must not break your loop</li></ul>",
    starter: "function myPow(x, n) {\n  // TODO: x^n in O(log n), handling negative n\n}\n",
    hints: [
      "Deal with the sign of n once, up front: for negative n compute the positive power and return its reciprocal. Everything after that assumes n >= 0.",
      "The identity that does the work: x^n is (x*x)^(n/2) when n is even, and x * (x*x)^((n-1)/2) when n is odd. Each step halves n.",
      "Iteratively: keep a running result and a running base. While the exponent is above 0, multiply the result by the base when the exponent is odd, then square the base and halve the exponent.",
    ],
    solution:
      "function myPow(x, n) {\n  if (n < 0) return 1 / myPow(x, -n);\n  let result = 1;\n  let base = x;\n  let e = n;\n  while (e > 0) {\n    if (e % 2 === 1) result *= base;\n    base *= base;\n    e = Math.floor(e / 2);\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "whole-number powers",
        body: "assert.equal(myPow(2, 10), 1024);\nassert.equal(myPow(3, 5), 243);\nassert.equal(myPow(-2, 3), -8);\nassert.equal(myPow(-2, 4), 16);",
      },
      {
        name: "an exponent of zero",
        body: "assert.equal(myPow(5, 0), 1);\nassert.equal(myPow(0, 0), 1);\nassert.equal(myPow(-7.5, 0), 1);",
      },
      {
        name: "negative exponents",
        body: "assert.equal(myPow(2, -2), 0.25);\nassert.equal(myPow(2, -10), 1 / 1024);\nassert.equal(myPow(-2, -3), -0.125);",
      },
      {
        name: "fractional bases",
        body: "assert.ok(Math.abs(myPow(2.1, 3) - 9.261) < 1e-9);\nassert.ok(Math.abs(myPow(0.5, 4) - 0.0625) < 1e-12);\nassert.ok(Math.abs(myPow(1.0001, 10) - 1.0010004501200215) < 1e-9);",
      },
      {
        name: "huge exponents finish instantly",
        body: "assert.equal(myPow(1, 2147483647), 1);\nassert.equal(myPow(1, -2147483648), 1);\nassert.equal(myPow(-1, -2147483648), 1);\nassert.equal(myPow(2, -2147483648), 0);\nassert.equal(myPow(2, 30), 1073741824);",
      },
    ],
  },
{
    id: "ex-generate-subsets",
    chapter: "dsa-basic-recursion",
    level: "beginner",
    title: "Generate All Subsets",
    brief:
      "<p>Given an array <code>nums</code> of <b>distinct</b> integers, return the power set: every possible subset.</p><ul><li><code>n</code> values produce <code>2^n</code> subsets, including the empty subset and the whole array</li><li>Subsets, and the values inside them, may be returned in <b>any order</b></li><li>Solve it <b>recursively</b> — bitmask tricks are not the exercise here</li><li><code>subsets([])</code> is <code>[[]]</code></li></ul>",
    starter: "function subsets(nums) {\n  // TODO: recursively build every subset\n}\n",
    hints: [
      "Every element faces exactly one binary decision: in or out. That decision is the recursion.",
      "Walk an index through the array. At each index, recurse once having skipped the value and once having included it, undoing the inclusion afterwards.",
      "When the index passes the last element, one complete decision has been made for every value — push a COPY of the accumulated subset, since the shared array keeps changing as you backtrack.",
    ],
    solution:
      "function subsets(nums) {\n  const out = [];\n  const current = [];\n  const walk = (i) => {\n    if (i === nums.length) {\n      out.push(current.slice());\n      return;\n    }\n    walk(i + 1);\n    current.push(nums[i]);\n    walk(i + 1);\n    current.pop();\n  };\n  walk(0);\n  return out;\n}\n",
    tests: [
      {
        name: "the eight subsets of three values",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(\n  norm(subsets([1, 2, 3])),\n  norm([[],[1],[2],[3],[1,2],[1,3],[2,3],[1,2,3]])\n);",
      },
      {
        name: "a single value",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(subsets([0])), norm([[], [0]]));",
      },
      {
        name: "empty input has one subset",
        body: "assert.deepEqual(subsets([]), [[]]);",
      },
      {
        name: "negatives are fine",
        body: "const norm = (rows) => rows.map((r) => r.slice().sort((a, b) => a - b).join(',')).sort();\nassert.deepEqual(norm(subsets([-1, 5])), norm([[], [-1], [5], [-1, 5]]));",
      },
      {
        name: "2^n subsets, all distinct",
        body: "const rows = subsets([1, 2, 3, 4, 5]);\nassert.equal(rows.length, 32);\nconst keys = rows.map((r) => r.slice().sort((a, b) => a - b).join(','));\nassert.equal(new Set(keys).size, 32);\nassert.ok(keys.indexOf('') !== -1);\nassert.ok(keys.indexOf('1,2,3,4,5') !== -1);",
      },
    ],
  },
{
    id: "ex-flatten-nested-array",
    chapter: "dsa-basic-recursion",
    level: "beginner",
    title: "Flatten a Deeply Nested Array",
    brief:
      "<p>Given an array whose elements may themselves be arrays, to <b>any depth</b>, return a flat array of all the non-array values in order.</p><ul><li>You may <b>not</b> use <code>Array.prototype.flat</code> or <code>flatMap</code> — write the recursion yourself</li><li>The depth is arbitrary and unknown in advance</li><li>Nested empty arrays contribute nothing: <code>[[], [[]]]</code> flattens to <code>[]</code></li><li>Values of any type are kept as-is, including <code>0</code>, <code>false</code> and <code>null</code> — only arrays are unwrapped</li></ul>",
    starter:
      "function flattenDeep(arr) {\n  // TODO: pull every non-array value out, at any depth, preserving order\n}\n",
    hints: [
      "Walk the elements one at a time and ask a single question about each: is it an array? Array.isArray answers it.",
      "If it is an array, recurse into it; if not, it is a leaf, so append it to the output. The recursion is what makes the depth irrelevant.",
      "Pass one shared output array down (or concatenate the recursive results). Be careful with falsy leaves — test for arrays explicitly rather than truthiness, or 0, false and null will vanish.",
    ],
    solution:
      "function flattenDeep(arr) {\n  const out = [];\n  const walk = (list) => {\n    for (const item of list) {\n      if (Array.isArray(item)) walk(item);\n      else out.push(item);\n    }\n  };\n  walk(arr);\n  return out;\n}\n",
    tests: [
      {
        name: "flattens a mixed nesting",
        body: "assert.deepEqual(flattenDeep([1, [2, [3, [4]], 5]]), [1, 2, 3, 4, 5]);\nassert.deepEqual(flattenDeep([[1, 2], [3, [4, [5, [6]]]]]), [1, 2, 3, 4, 5, 6]);",
      },
      {
        name: "already flat and empty inputs",
        body: "assert.deepEqual(flattenDeep([1, 2, 3]), [1, 2, 3]);\nassert.deepEqual(flattenDeep([]), []);\nassert.deepEqual(flattenDeep([[], [[]], [[[]]]]), []);",
      },
      {
        name: "falsy leaves survive",
        body: "assert.deepEqual(flattenDeep(['a', ['b', [0, false, null]]]), ['a', 'b', 0, false, null]);\nassert.deepEqual(flattenDeep([[0], [[false]]]), [0, false]);",
      },
      {
        name: "very deep nesting",
        body: "let nested = [500];\nfor (let i = 0; i < 400; i++) nested = [nested];\nassert.deepEqual(flattenDeep(nested), [500]);\nassert.deepEqual(flattenDeep([1, nested, 2]), [1, 500, 2]);",
      },
      {
        name: "order is preserved",
        body: "const out = flattenDeep([[1, [2]], 3, [[4, [5, 6]], 7], [[[8]]]]);\nassert.deepEqual(out, [1, 2, 3, 4, 5, 6, 7, 8]);",
      },
    ],
  },
{
    id: "ex-min-stack",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Min Stack",
    brief:
      "<p>Design a stack that supports the usual operations plus a <code>getMin()</code> that reports the smallest value currently on the stack — every operation must run in <b>O(1)</b>.</p><ul><li><code>push(val)</code> — put <code>val</code> on top</li><li><code>pop()</code> — remove the top value and return it</li><li><code>top()</code> — return the top value without removing it</li><li><code>getMin()</code> — return the smallest value on the stack</li><li>Scanning the whole stack inside <code>getMin</code> is <em>not</em> allowed</li><li>Duplicated minimums must keep working: after pushing 3 twice and popping once, the minimum is still 3</li></ul>",
    starter:
      "class MinStack {\n  constructor() {\n    // TODO: what do you need to remember alongside the values themselves?\n  }\n  push(val) {}\n  pop() {}\n  top() {}\n  getMin() {}\n}\n",
    hints: [
      "getMin has to be O(1), so the answer must already be sitting somewhere when you ask for it.",
      "Keep a second stack that runs in lockstep with the first: every push adds one entry to it, every pop removes one.",
      "The entry you push onto the helper stack is 'the minimum of everything up to and including this value' — that is Math.min(val, currentMin).",
    ],
    solution:
      "class MinStack {\n  constructor() {\n    this.values = [];\n    this.mins = [];\n  }\n  push(val) {\n    this.values.push(val);\n    const best = this.mins.length ? this.mins[this.mins.length - 1] : Infinity;\n    this.mins.push(val < best ? val : best);\n  }\n  pop() {\n    this.mins.pop();\n    return this.values.pop();\n  }\n  top() {\n    return this.values[this.values.length - 1];\n  }\n  getMin() {\n    return this.mins[this.mins.length - 1];\n  }\n}\n",
    tests: [
      {
        name: "tracks the minimum as values go on",
        body: "const s = new MinStack();\ns.push(5); assert.equal(s.getMin(), 5);\ns.push(3); assert.equal(s.getMin(), 3);\ns.push(7); assert.equal(s.getMin(), 3);\nassert.equal(s.top(), 7);",
      },
      {
        name: "minimum is restored after pops",
        body: "const s = new MinStack();\ns.push(5); s.push(3); s.push(7);\nassert.equal(s.pop(), 7);\nassert.equal(s.getMin(), 3);\nassert.equal(s.pop(), 3);\nassert.equal(s.getMin(), 5);",
      },
      {
        name: "duplicate minimums survive one pop",
        body: "const s = new MinStack();\ns.push(2); s.push(2); s.push(9);\ns.pop();\nassert.equal(s.getMin(), 2);\ns.pop();\nassert.equal(s.getMin(), 2, 'the second 2 is still on the stack');",
      },
      {
        name: "handles negatives and a single element",
        body: "const s = new MinStack();\ns.push(-1);\nassert.equal(s.getMin(), -1);\nassert.equal(s.top(), -1);\ns.push(-4); s.push(0);\nassert.equal(s.getMin(), -4);\ns.pop(); s.pop();\nassert.equal(s.getMin(), -1);",
      },
    ],
  },
{
    id: "ex-queue-using-stacks",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Implement Queue using Stacks",
    brief:
      "<p>Build a FIFO queue whose only storage is two stacks. A stack lets you push to the end, pop from the end, and read its length — nothing else.</p><ul><li><code>push(x)</code> — add <code>x</code> to the back of the queue</li><li><code>pop()</code> — remove and return the value at the front</li><li><code>peek()</code> — return the front value without removing it</li><li><code>empty()</code> — <code>true</code> when the queue holds nothing</li><li>Do <em>not</em> use <code>shift()</code>, <code>unshift()</code> or indexed reads into the middle of an array — only stack operations</li></ul>",
    starter:
      "class MyQueue {\n  constructor() {\n    // TODO: two stacks — one for arriving values, one for departing values\n  }\n  push(x) {}\n  pop() {}\n  peek() {}\n  empty() {}\n}\n",
    hints: [
      "Pouring one stack into another reverses it — that is the whole trick.",
      "Keep an 'in' stack that push() writes to and an 'out' stack that pop()/peek() read from.",
      "Only refill the 'out' stack when it is empty; refilling early would scramble the order.",
    ],
    solution:
      "class MyQueue {\n  constructor() {\n    this.inStack = [];\n    this.outStack = [];\n  }\n  transfer() {\n    if (this.outStack.length === 0) {\n      while (this.inStack.length) this.outStack.push(this.inStack.pop());\n    }\n  }\n  push(x) {\n    this.inStack.push(x);\n  }\n  pop() {\n    this.transfer();\n    return this.outStack.pop();\n  }\n  peek() {\n    this.transfer();\n    return this.outStack[this.outStack.length - 1];\n  }\n  empty() {\n    return this.inStack.length === 0 && this.outStack.length === 0;\n  }\n}\n",
    tests: [
      {
        name: "first in is first out",
        body: "const q = new MyQueue();\nq.push(1); q.push(2); q.push(3);\nassert.equal(q.pop(), 1);\nassert.equal(q.pop(), 2);\nassert.equal(q.pop(), 3);",
      },
      {
        name: "peek does not remove",
        body: "const q = new MyQueue();\nq.push(4); q.push(5);\nassert.equal(q.peek(), 4);\nassert.equal(q.peek(), 4);\nassert.equal(q.pop(), 4);\nassert.equal(q.peek(), 5);",
      },
      {
        name: "interleaved pushes and pops keep order",
        body: "const q = new MyQueue();\nq.push(1); q.push(2);\nassert.equal(q.pop(), 1);\nq.push(3); q.push(4);\nassert.equal(q.pop(), 2);\nassert.equal(q.pop(), 3);\nq.push(5);\nassert.equal(q.pop(), 4);\nassert.equal(q.pop(), 5);",
      },
      {
        name: "empty reports correctly",
        body: "const q = new MyQueue();\nassert.equal(q.empty(), true);\nq.push(9);\nassert.equal(q.empty(), false);\nq.pop();\nassert.equal(q.empty(), true);",
      },
    ],
  },
{
    id: "ex-stack-using-queues",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Implement Stack using Queues",
    brief:
      "<p>Build a LIFO stack whose only storage is queues. A queue lets you add to the back, remove from the front, and read its length — nothing else.</p><ul><li><code>push(x)</code> — put <code>x</code> on top of the stack</li><li><code>pop()</code> — remove and return the top value</li><li><code>top()</code> — return the top value without removing it</li><li><code>empty()</code> — <code>true</code> when the stack holds nothing</li><li>Do <em>not</em> reach into the middle or the end of the storage — only <code>push</code> (to the back) and <code>shift</code> (from the front)</li></ul>",
    starter:
      "class MyStack {\n  constructor() {\n    // TODO: a queue, plus a plan for making the newest value come out first\n  }\n  push(x) {}\n  pop() {}\n  top() {}\n  empty() {}\n}\n",
    hints: [
      "One of push or pop has to do extra work — the other can stay trivial. Pick which.",
      "If you rotate the queue right after adding a value, the newest value can end up at the FRONT.",
      "After pushing x onto a queue of size k, shift-and-re-push the other k values; now x is first, so pop is just a shift.",
    ],
    solution:
      "class MyStack {\n  constructor() {\n    this.q = [];\n  }\n  push(x) {\n    this.q.push(x);\n    for (let i = 0; i < this.q.length - 1; i++) this.q.push(this.q.shift());\n  }\n  pop() {\n    return this.q.shift();\n  }\n  top() {\n    return this.q[0];\n  }\n  empty() {\n    return this.q.length === 0;\n  }\n}\n",
    tests: [
      {
        name: "last in is first out",
        body: "const s = new MyStack();\ns.push(1); s.push(2); s.push(3);\nassert.equal(s.pop(), 3);\nassert.equal(s.pop(), 2);\nassert.equal(s.pop(), 1);",
      },
      {
        name: "top does not remove",
        body: "const s = new MyStack();\ns.push(7); s.push(8);\nassert.equal(s.top(), 8);\nassert.equal(s.top(), 8);\nassert.equal(s.pop(), 8);\nassert.equal(s.top(), 7);",
      },
      {
        name: "interleaved pushes and pops",
        body: "const s = new MyStack();\ns.push(1); s.push(2);\nassert.equal(s.pop(), 2);\ns.push(3);\nassert.equal(s.pop(), 3);\nassert.equal(s.pop(), 1);\nassert.equal(s.empty(), true);",
      },
      {
        name: "single element",
        body: "const s = new MyStack();\nassert.equal(s.empty(), true);\ns.push(42);\nassert.equal(s.top(), 42);\nassert.equal(s.empty(), false);\nassert.equal(s.pop(), 42);\nassert.equal(s.empty(), true);",
      },
    ],
  },
];
