import type { Exercise } from "../types";

export const dsaAddAdvancedBacktracking: Exercise[] = [
  {
    "id": "ex-expression-add-operators",
    "chapter": "dsa-advanced-backtracking",
    "level": "advanced",
    "title": "Expression Add Operators",
    "brief": "<p><code>num</code> is a string of digits and <code>target</code> is an integer. Write <code>addOperators(num, target)</code>: return <b>every</b> expression you can build by putting <code>+</code>, <code>-</code> or <code>*</code> between some of the digits (or nothing, which joins digits into a longer number) so that it evaluates to <code>target</code>, with the usual precedence.</p><ul><li>An operand may not have a leading zero: <code>\"05\"</code> is not allowed, but <code>\"0\"</code> is</li><li>Return the expressions as strings with no spaces, in any order</li><li>Return <code>[]</code> if there is none</li></ul>",
    "starter": "function addOperators(num, target) {\n  // TODO\n}\n\nconsole.log(addOperators('232', 8)); // ['2*3+2', '2+3*2'] in any order\n",
    "hints": [
      "At each position choose how many digits the next operand takes, then which operator goes in front of it (the first operand has none). Reject any operand of two or more digits that starts with 0.",
      "Carry the running value so far. Plus and minus are easy, but multiplication must apply only to the last term that was added, not to the whole value: 2+3*2 is 8, not 10.",
      "Carry lastTerm too. For plus, the new last term is +n; for minus it is -n; for multiplication, value = value - lastTerm + lastTerm * n, and the new last term is lastTerm * n."
    ],
    "solution": "function addOperators(num, target) {\n  const results = [];\n  function go(pos, expr, value, lastTerm) {\n    if (pos === num.length) {\n      if (value === target) results.push(expr);\n      return;\n    }\n    for (let end = pos + 1; end <= num.length; end++) {\n      if (end > pos + 1 && num[pos] === '0') break;\n      const text = num.slice(pos, end);\n      const n = Number(text);\n      if (pos === 0) {\n        go(end, text, n, n);\n      } else {\n        go(end, expr + '+' + text, value + n, n);\n        go(end, expr + '-' + text, value - n, -n);\n        go(end, expr + '*' + text, value - lastTerm + lastTerm * n, lastTerm * n);\n      }\n    }\n  }\n  go(0, '', 0, 0);\n  return results;\n}\n",
    "tests": [
      {
        "name": "two answers for 123 and 6",
        "body": "assert.deepEqual(addOperators('123', 6).sort(), ['1*2*3', '1+2+3']);"
      },
      {
        "name": "multiplication binds tighter than addition",
        "body": "assert.deepEqual(addOperators('232', 8).sort(), ['2*3+2', '2+3*2']);"
      },
      {
        "name": "a zero operand is fine, a leading zero is not",
        "body": "assert.deepEqual(addOperators('105', 5).sort(), ['1*0+5', '10-5']);\nassert.deepEqual(addOperators('00', 0).sort(), ['0*0', '0+0', '0-0']);"
      },
      {
        "name": "no expression reaches the target",
        "body": "assert.deepEqual(addOperators('3456237490', 9191), []);\nassert.deepEqual(addOperators('5', 3), []);"
      },
      {
        "name": "a single digit is its own expression",
        "body": "assert.deepEqual(addOperators('5', 5), ['5']);"
      },
      {
        "name": "joining digits makes longer operands",
        "body": "assert.deepEqual(addOperators('12', 12), ['12']);\nassert.deepEqual(addOperators('12', 3).sort(), ['1+2']);\nassert.deepEqual(addOperators('99', 99), ['99']);"
      },
      {
        "name": "a zero-heavy string does not produce operands like 000",
        "body": "const out = addOperators('1000000009', 9);\nassert.equal(out.length, 3280);\nassert.ok(out.every((e) => !/(^|[+\\-*])0\\d/.test(e)));"
      },
      {
        "name": "every result evaluates to the target, and the counts are right",
        "body": "const out = addOperators('123456789', 45);\nassert.equal(out.length, 121);\nassert.equal(new Set(out).size, 121);\nfor (const e of out) assert.equal(Function('return ' + e)(), 45, e);\nassert.equal(addOperators('123456789', 100).length, 78);"
      },
      {
        "name": "negative targets work",
        "body": "assert.deepEqual(addOperators('21', -1).sort(), []);\nassert.deepEqual(addOperators('12', -1).sort(), ['1-2']);\nassert.deepEqual(addOperators('123', -4).sort(), ['1-2-3']);\nassert.deepEqual(addOperators('1', -1), []);"
      }
    ]
  },
  {
    "id": "ex-remove-invalid-parentheses",
    "chapter": "dsa-advanced-backtracking",
    "level": "advanced",
    "title": "Remove Invalid Parentheses",
    "brief": "<p><code>s</code> contains parentheses and lowercase letters. Write <code>removeInvalidParentheses(s)</code>: remove the <b>minimum</b> number of parentheses so that the string becomes valid, and return <b>all distinct</b> results in any order.</p><ul><li>A string is valid when every <code>(</code> is matched by a later <code>)</code> and no <code>)</code> comes before its <code>(</code></li><li>Letters are never removed</li><li>If the string is already valid, it is the only answer. If every bracket must go, the answer is <code>['']</code></li></ul>",
    "starter": "function removeInvalidParentheses(s) {\n  // TODO\n}\n\nconsole.log(removeInvalidParentheses('()())()')); // ['(())()', '()()()'] in any order\n",
    "hints": [
      "One left-to-right scan tells you how many ( and how many ) are unmatched. Those counts are exactly how many of each kind must be removed, and they are the minimum.",
      "Search by index, tracking the balance of kept brackets and how many removals of each kind remain. Never let the balance go negative, and accept a string only when the balance and both budgets reach zero.",
      "To avoid duplicate results, treat a run of equal brackets as one decision: how many of the run to remove, from 0 up to the run length or the remaining budget. Or collect results in a Set."
    ],
    "solution": "function removeInvalidParentheses(s) {\n  let removeOpen = 0;\n  let removeClose = 0;\n  for (const ch of s) {\n    if (ch === '(') removeOpen++;\n    else if (ch === ')') {\n      if (removeOpen > 0) removeOpen--;\n      else removeClose++;\n    }\n  }\n  const results = [];\n  function go(i, balance, open, close, text) {\n    if (i === s.length) {\n      if (balance === 0 && open === 0 && close === 0) results.push(text);\n      return;\n    }\n    const ch = s[i];\n    if (ch !== '(' && ch !== ')') {\n      go(i + 1, balance, open, close, text + ch);\n      return;\n    }\n    let end = i;\n    while (end < s.length && s[end] === ch) end++;\n    const run = end - i;\n    const budget = ch === '(' ? open : close;\n    for (let removed = 0; removed <= Math.min(run, budget); removed++) {\n      const kept = run - removed;\n      const nextBalance = ch === '(' ? balance + kept : balance - kept;\n      if (nextBalance < 0) continue;\n      go(end, nextBalance, ch === '(' ? open - removed : open, ch === ')' ? close - removed : close, text + ch.repeat(kept));\n    }\n  }\n  go(0, 0, removeOpen, removeClose, '');\n  return results;\n}\n",
    "tests": [
      {
        "name": "one stray close bracket",
        "body": "assert.deepEqual(removeInvalidParentheses('()())()').sort(), ['(())()', '()()()']);"
      },
      {
        "name": "letters stay put",
        "body": "assert.deepEqual(removeInvalidParentheses('(a)())()').sort(), ['(a())()', '(a)()()']);"
      },
      {
        "name": "a close bracket before its open one",
        "body": "assert.deepEqual(removeInvalidParentheses(')('), ['']);"
      },
      {
        "name": "an already valid string is its own answer",
        "body": "assert.deepEqual(removeInvalidParentheses('(a(b)c)'), ['(a(b)c)']);\nassert.deepEqual(removeInvalidParentheses('()'), ['()']);\nassert.deepEqual(removeInvalidParentheses('abc'), ['abc']);"
      },
      {
        "name": "only brackets that cannot match are removed",
        "body": "assert.deepEqual(removeInvalidParentheses('(()'), ['()']);\nassert.deepEqual(removeInvalidParentheses('x('), ['x']);\nassert.deepEqual(removeInvalidParentheses('(((('), ['']);"
      },
      {
        "name": "the empty string",
        "body": "assert.deepEqual(removeInvalidParentheses(''), ['']);"
      },
      {
        "name": "no duplicates in the result",
        "body": "const out = removeInvalidParentheses('(()))(()');\nassert.equal(new Set(out).size, out.length);\nconst out2 = removeInvalidParentheses('()))((()');\nassert.equal(new Set(out2).size, out2.length);"
      },
      {
        "name": "agrees with a subset-enumerating brute force on 400 random strings",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nfunction valid(t) {\n  let b = 0;\n  for (const c of t) {\n    if (c === '(') b++;\n    else if (c === ')') {\n      b--;\n      if (b < 0) return false;\n    }\n  }\n  return b === 0;\n}\nfunction brute(s) {\n  let best = -1;\n  const found = new Set();\n  for (let m = 0; m < 1 << s.length; m++) {\n    let t = '';\n    for (let i = 0; i < s.length; i++) if (m & (1 << i)) t += s[i];\n    if (!valid(t) || t.length < best) continue;\n    if (t.length > best) { best = t.length; found.clear(); }\n    found.add(t);\n  }\n  return [...found].sort();\n}\nconst next = seeded(7);\nfor (let n = 0; n < 400; n++) {\n  let s = '';\n  const len = Math.floor(next() * 11);\n  for (let i = 0; i < len; i++) s += '()a'[Math.floor(next() * 3)];\n  assert.deepEqual(removeInvalidParentheses(s).sort(), brute(s), JSON.stringify(s));\n}"
      }
    ]
  },
  {
    "id": "ex-unique-paths-iii",
    "chapter": "dsa-advanced-backtracking",
    "level": "advanced",
    "title": "Unique Paths III",
    "brief": "<p><code>grid</code> holds <code>1</code> (the start), <code>2</code> (the end), <code>0</code> (an empty square) and <code>-1</code> (an obstacle). Write <code>uniquePathsIII(grid)</code>: count the walks from the start to the end that move up, down, left or right and visit <b>every non-obstacle square exactly once</b>.</p><ul><li>There is exactly one start and one end</li><li>The grid has at most 20 cells</li><li>Leave <code>grid</code> as you found it</li></ul>",
    "starter": "function uniquePathsIII(grid) {\n  // TODO\n}\n\nconsole.log(uniquePathsIII([[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, -1]])); // 2\n",
    "hints": [
      "Count the walkable squares first (the start, the end and every empty square). A valid walk uses all of them.",
      "Walk with backtracking: mark the current square as visited, try the four neighbours that are in bounds and not visited, then restore it. Pass down how many squares are still unvisited.",
      "Arriving at the end square is a solution only if exactly that one square is left. Arriving earlier counts as zero. Restore the value you overwrote, so the start square goes back to 1."
    ],
    "solution": "function uniquePathsIII(grid) {\n  const R = grid.length;\n  const C = grid[0].length;\n  let startR = 0;\n  let startC = 0;\n  let walkable = 0;\n  for (let r = 0; r < R; r++) {\n    for (let c = 0; c < C; c++) {\n      if (grid[r][c] === 1) {\n        startR = r;\n        startC = c;\n      }\n      if (grid[r][c] !== -1) walkable++;\n    }\n  }\n  function walk(r, c, left) {\n    if (grid[r][c] === 2) return left === 1 ? 1 : 0;\n    const original = grid[r][c];\n    grid[r][c] = -1;\n    let paths = 0;\n    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n      const nr = r + dr;\n      const nc = c + dc;\n      if (nr >= 0 && nr < R && nc >= 0 && nc < C && grid[nr][nc] !== -1) paths += walk(nr, nc, left - 1);\n    }\n    grid[r][c] = original;\n    return paths;\n  }\n  return walk(startR, startC, walkable);\n}\n",
    "tests": [
      {
        "name": "two walks on the classic grid",
        "body": "assert.equal(uniquePathsIII([[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, -1]]), 2);"
      },
      {
        "name": "four walks when nothing is blocked",
        "body": "assert.equal(uniquePathsIII([[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 2]]), 4);"
      },
      {
        "name": "no walk covers every square",
        "body": "assert.equal(uniquePathsIII([[0, 1], [2, 0]]), 0);"
      },
      {
        "name": "a single row",
        "body": "assert.equal(uniquePathsIII([[1, 2]]), 1);\nassert.equal(uniquePathsIII([[1, 0, 2]]), 1);\nassert.equal(uniquePathsIII([[2, 0, 1]]), 1);"
      },
      {
        "name": "an obstacle can cut the grid",
        "body": "assert.equal(uniquePathsIII([[1, -1, 2]]), 0);\nassert.equal(uniquePathsIII([[1], [-1], [2]]), 0);"
      },
      {
        "name": "the grid is restored",
        "body": "const g = [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, -1]];\nuniquePathsIII(g);\nassert.deepEqual(g, [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 2, -1]]);"
      },
      {
        "name": "reaching the end early does not count",
        "body": "assert.equal(uniquePathsIII([[1, 2, 0]]), 0);\nassert.equal(uniquePathsIII([[0, 1, 2]]), 0);"
      },
      {
        "name": "a four by four grid with one obstacle",
        "body": "const g = [[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, -1, 2]];\nconst copy = JSON.stringify(g);\nassert.equal(uniquePathsIII(g), 4);\nassert.equal(JSON.stringify(g), copy);\nassert.equal(uniquePathsIII([[1, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 2]]), 0);"
      },
      {
        "name": "agrees with a bitmask count on 200 random grids",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nfunction viaMask(grid) {\n  const R = grid.length, C = grid[0].length;\n  const cells = [];\n  let s = -1, e = -1;\n  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {\n    if (grid[r][c] === -1) continue;\n    if (grid[r][c] === 1) s = cells.length;\n    if (grid[r][c] === 2) e = cells.length;\n    cells.push([r, c]);\n  }\n  const N = cells.length;\n  const at = new Map(cells.map(([r, c], i) => [r * 10 + c, i]));\n  const memo = new Map();\n  function f(mask, pos) {\n    if (mask === (1 << N) - 1) return pos === e ? 1 : 0;\n    if (pos === e) return 0;\n    const key = mask * 32 + pos;\n    if (memo.has(key)) return memo.get(key);\n    let total = 0;\n    const [r, c] = cells[pos];\n    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {\n      const j = at.get((r + dr) * 10 + c + dc);\n      if (r + dr >= 0 && r + dr < R && c + dc >= 0 && c + dc < C && j !== undefined && !(mask & (1 << j))) total += f(mask | (1 << j), j);\n    }\n    memo.set(key, total);\n    return total;\n  }\n  return f(1 << s, s);\n}\nconst next = seeded(21);\nlet tested = 0;\nfor (let n = 0; n < 200; n++) {\n  const R = 1 + Math.floor(next() * 4);\n  const C = 2 + Math.floor(next() * 3);\n  const cells = [];\n  for (let i = 0; i < R * C; i++) cells.push(next() < 0.15 ? -1 : 0);\n  const free = [];\n  cells.forEach((v, i) => { if (v === 0) free.push(i); });\n  if (free.length < 2) continue;\n  const a = free.splice(Math.floor(next() * free.length), 1)[0];\n  const b = free[Math.floor(next() * free.length)];\n  cells[a] = 1;\n  cells[b] = 2;\n  const grid = [];\n  for (let i = 0; i < R; i++) grid.push(cells.slice(i * C, i * C + C));\n  const expected = viaMask(grid.map((row) => [...row]));\n  assert.equal(uniquePathsIII(grid), expected, JSON.stringify(grid));\n  tested++;\n}\nassert.ok(tested > 100);"
      }
    ]
  },
  {
    "id": "ex-closest-subsequence-sum",
    "chapter": "dsa-advanced-backtracking",
    "level": "advanced",
    "title": "Closest Subsequence Sum",
    "brief": "<p>Write <code>minAbsDifference(nums, goal)</code>: choose any subset of <code>nums</code> (the empty subset is allowed) and return the smallest possible value of <code>|sum - goal|</code>.</p><ul><li><code>nums</code> can hold up to <b>40</b> integers, positive or negative, so trying every subset (2^40) is far too slow</li><li><code>goal</code> is an integer</li><li>Do not change <code>nums</code></li></ul>",
    "starter": "function minAbsDifference(nums, goal) {\n  // TODO\n}\n\nconsole.log(minAbsDifference([5, -7, 3, 5], 6)); // 0\n",
    "hints": [
      "2^40 subsets is too many, but 2^20 is only about a million. Split nums into two halves and list every subset sum of each half.",
      "Any full subset is one left sum a plus one right sum b. Sort the right sums. For each left sum a you want the right sum closest to goal - a.",
      "Binary search the sorted right sums for the first value at or above goal - a, and check both that value and the one just before it. Sort numerically: Array.prototype.sort() without a comparator compares as strings."
    ],
    "solution": "function minAbsDifference(nums, goal) {\n  function subsetSums(items) {\n    const sums = [0];\n    for (const x of items) {\n      const size = sums.length;\n      for (let i = 0; i < size; i++) sums.push(sums[i] + x);\n    }\n    return sums;\n  }\n  const mid = nums.length >> 1;\n  const left = subsetSums(nums.slice(0, mid));\n  const right = Float64Array.from(subsetSums(nums.slice(mid))).sort();\n  let best = Infinity;\n  for (const a of left) {\n    const want = goal - a;\n    let lo = 0;\n    let hi = right.length;\n    while (lo < hi) {\n      const m = (lo + hi) >> 1;\n      if (right[m] < want) lo = m + 1;\n      else hi = m;\n    }\n    if (lo < right.length) best = Math.min(best, Math.abs(a + right[lo] - goal));\n    if (lo > 0) best = Math.min(best, Math.abs(a + right[lo - 1] - goal));\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "an exact subset exists",
        "body": "assert.equal(minAbsDifference([5, -7, 3, 5], 6), 0);\nassert.equal(minAbsDifference([1, 2, 3, 4], 5), 0);"
      },
      {
        "name": "the closest sum can be on either side",
        "body": "assert.equal(minAbsDifference([7, -9, 15, -2], -5), 1);"
      },
      {
        "name": "the empty subset can be the best",
        "body": "assert.equal(minAbsDifference([1, 2, 3], -7), 7);\nassert.equal(minAbsDifference([10, 20], 0), 0);"
      },
      {
        "name": "a single number",
        "body": "assert.equal(minAbsDifference([5], 4), 1);\nassert.equal(minAbsDifference([5], 1), 1);\nassert.equal(minAbsDifference([-5], 3), 3);"
      },
      {
        "name": "the input is not modified",
        "body": "const a = [3, -1, 4, 1, 5];\nminAbsDifference(a, 7);\nassert.deepEqual(a, [3, -1, 4, 1, 5]);"
      },
      {
        "name": "numbers are compared as numbers, not text",
        "body": "assert.equal(minAbsDifference([9, 10, 1], 20), 0);\nassert.equal(minAbsDifference([100, 9, 80, 10], 99), 0);"
      },
      {
        "name": "agrees with enumerating every subset on 300 small arrays",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nconst next = seeded(3);\nfor (let t = 0; t < 300; t++) {\n  const n = 1 + Math.floor(next() * 12);\n  const nums = Array.from({ length: n }, () => Math.floor(next() * 41) - 20);\n  const goal = Math.floor(next() * 121) - 60;\n  let best = Infinity;\n  for (let m = 0; m < 1 << n; m++) {\n    let s = 0;\n    for (let i = 0; i < n; i++) if (m & (1 << i)) s += nums[i];\n    best = Math.min(best, Math.abs(s - goal));\n  }\n  assert.equal(minAbsDifference(nums, goal), best, JSON.stringify(nums) + ' ' + goal);\n}"
      },
      {
        "name": "forty numbers: the answer matches a DP over small sums",
        "body": "function seeded(seed) {\n  let s = seed >>> 0;\n  return () => {\n    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;\n    return s / 4294967296;\n  };\n}\nconst next = seeded(5);\nfor (let t = 0; t < 4; t++) {\n  const nums = Array.from({ length: 40 }, () => 1 + Math.floor(next() * 9));\n  const total = nums.reduce((a, b) => a + b, 0);\n  const reach = new Array(total + 1).fill(false);\n  reach[0] = true;\n  for (const x of nums) for (let s = total; s >= x; s--) if (reach[s - x]) reach[s] = true;\n  const goal = Math.floor(next() * (total + 40)) - 20;\n  let best = Infinity;\n  for (let s = 0; s <= total; s++) if (reach[s]) best = Math.min(best, Math.abs(s - goal));\n  assert.equal(minAbsDifference(nums, goal), best, 'goal ' + goal);\n}"
      },
      {
        "name": "thirty-five powers of two reach every whole number",
        "body": "const nums = [];\nfor (let i = 0; i < 35; i++) nums.push(2 ** i);\nconst total = 2 ** 35 - 1;\nassert.equal(minAbsDifference(nums, 12345678901), 0);\nassert.equal(minAbsDifference(nums, total + 100), 100);\nassert.equal(minAbsDifference(nums, -50), 50);"
      }
    ]
  },
  {
    "id": "ex-can-i-win",
    "chapter": "dsa-advanced-backtracking",
    "level": "advanced",
    "title": "Can I Win",
    "brief": "<p>Two players take turns choosing an unused integer from <code>1</code> to <code>maxChoosable</code> and adding it to a running total that starts at 0. The player whose choice makes the total reach <code>desiredTotal</code> or more wins. Write <code>canIWin(maxChoosable, desiredTotal)</code>: does the player who moves first win with perfect play from both sides?</p><ul><li>An integer, once chosen, cannot be chosen again by either player</li><li><code>maxChoosable</code> is at most 20</li><li>If <code>desiredTotal</code> is 0 or less, the first player has already won. If even taking every number cannot reach the total, nobody wins, so return <code>false</code></li></ul>",
    "starter": "function canIWin(maxChoosable, desiredTotal) {\n  // TODO\n}\n\nconsole.log(canIWin(10, 11)); // false\n",
    "hints": [
      "A position is fully described by which numbers have been used: the running total follows from that set, and so does whose turn it is. Represent the set as a bitmask.",
      "Write wins(used, remaining): the player about to move wins if some unused n satisfies n >= remaining, or wins(used | bit(n), remaining - n) is false for the opponent.",
      "Cache wins by the used mask. Without the cache the search is exponential in a way that times out around maxChoosable = 18, with it there are at most 2^maxChoosable states."
    ],
    "solution": "function canIWin(maxChoosable, desiredTotal) {\n  if (desiredTotal <= 0) return true;\n  if ((maxChoosable * (maxChoosable + 1)) / 2 < desiredTotal) return false;\n  const memo = new Map();\n  function wins(used, remaining) {\n    if (memo.has(used)) return memo.get(used);\n    let result = false;\n    for (let n = 1; n <= maxChoosable; n++) {\n      const bit = 1 << (n - 1);\n      if (used & bit) continue;\n      if (n >= remaining || !wins(used | bit, remaining - n)) {\n        result = true;\n        break;\n      }\n    }\n    memo.set(used, result);\n    return result;\n  }\n  return wins(0, desiredTotal);\n}\n",
    "tests": [
      {
        "name": "ten numbers and a target of eleven",
        "body": "assert.equal(canIWin(10, 11), false);"
      },
      {
        "name": "a target already met",
        "body": "assert.equal(canIWin(10, 0), true);\nassert.equal(canIWin(10, -5), true);"
      },
      {
        "name": "taking the biggest number wins at once",
        "body": "assert.equal(canIWin(10, 10), true);\nassert.equal(canIWin(10, 1), true);\nassert.equal(canIWin(1, 1), true);"
      },
      {
        "name": "the total cannot be reached by anyone",
        "body": "assert.equal(canIWin(5, 50), false);\nassert.equal(canIWin(4, 11), false);"
      },
      {
        "name": "small games worked out by hand",
        "body": "assert.equal(canIWin(2, 3), false);\nassert.equal(canIWin(3, 6), true);\nassert.equal(canIWin(4, 6), true);"
      },
      {
        "name": "a mid-sized game",
        "body": "assert.equal(canIWin(10, 40), false);\nassert.equal(canIWin(15, 80), true);"
      },
      {
        "name": "the largest games finish in time",
        "body": "assert.equal(canIWin(18, 79), true);\nassert.equal(canIWin(20, 100), true);\nassert.equal(canIWin(20, 210), false);\nassert.equal(canIWin(20, 209), false);"
      },
      {
        "name": "agrees with a plain search on every small game",
        "body": "function plain(max, total) {\n  if (total <= 0) return true;\n  if ((max * (max + 1)) / 2 < total) return false;\n  const used = new Array(max + 1).fill(false);\n  const go = (remaining) => {\n    for (let n = 1; n <= max; n++) {\n      if (used[n]) continue;\n      if (n >= remaining) return true;\n      used[n] = true;\n      const opponent = go(remaining - n);\n      used[n] = false;\n      if (!opponent) return true;\n    }\n    return false;\n  };\n  return go(total);\n}\nfor (let max = 1; max <= 8; max++) for (let total = -1; total <= 40; total++) assert.equal(canIWin(max, total), plain(max, total), max + ' ' + total);"
      }
    ]
  },
  {
    "id": "ex-word-break-ii",
    "chapter": "dsa-advanced-backtracking",
    "level": "advanced",
    "title": "Word Break II",
    "brief": "<p>Write <code>wordBreak(s, wordDict)</code>: return <b>every</b> sentence that can be made by inserting spaces into <code>s</code> so that each word is in <code>wordDict</code>. A dictionary word may be used any number of times. Return the sentences in any order, as strings with single spaces between words, or <code>[]</code> if none exists.</p><ul><li><code>wordDict</code> is an array of distinct lowercase words</li><li>The input may be built so that a plain search repeats the same work exponentially often, and a string that cannot be split must still be rejected quickly</li></ul>",
    "starter": "function wordBreak(s, wordDict) {\n  // TODO\n}\n\nconsole.log(wordBreak('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog'])); // ['cat sand dog', 'cats and dog']\n",
    "hints": [
      "Define sentences(start) as every sentence that spells s.slice(start). Try each end index, and when s.slice(start, end) is a dictionary word, combine it with every sentence from sentences(end).",
      "The answer for sentences(start) does not depend on how you reached start, so cache it in a Map keyed by start. Store empty results too, since they record dead ends.",
      "The base case: sentences(s.length) is [''], one way to spell nothing. When joining, add a space only if the rest is not empty."
    ],
    "solution": "function wordBreak(s, wordDict) {\n  const words = new Set(wordDict);\n  const longest = Math.max(0, ...wordDict.map((w) => w.length));\n  const memo = new Map();\n  function sentences(start) {\n    if (start === s.length) return [''];\n    if (memo.has(start)) return memo.get(start);\n    const out = [];\n    for (let end = start + 1; end <= Math.min(s.length, start + longest); end++) {\n      const word = s.slice(start, end);\n      if (!words.has(word)) continue;\n      for (const rest of sentences(end)) out.push(rest === '' ? word : word + ' ' + rest);\n    }\n    memo.set(start, out);\n    return out;\n  }\n  return sentences(0);\n}\n",
    "tests": [
      {
        "name": "two sentences",
        "body": "assert.deepEqual(wordBreak('catsanddog', ['cat', 'cats', 'and', 'sand', 'dog']).sort(), ['cat sand dog', 'cats and dog']);"
      },
      {
        "name": "three sentences, one of them with a long word",
        "body": "assert.deepEqual(wordBreak('pineapplepenapple', ['apple', 'pen', 'applepen', 'pine', 'pineapple']).sort(), ['pine apple pen apple', 'pine applepen apple', 'pineapple pen apple']);"
      },
      {
        "name": "an unsplittable string",
        "body": "assert.deepEqual(wordBreak('catsandog', ['cats', 'dog', 'sand', 'and', 'cat']), []);"
      },
      {
        "name": "a single word",
        "body": "assert.deepEqual(wordBreak('dog', ['dog']), ['dog']);\nassert.deepEqual(wordBreak('dog', ['do']), []);"
      },
      {
        "name": "a word may be reused",
        "body": "assert.deepEqual(wordBreak('aaaa', ['a', 'aa']).sort(), ['a a a a', 'a a aa', 'a aa a', 'aa a a', 'aa aa']);"
      },
      {
        "name": "counts the sentences for a repeated letter",
        "body": "assert.equal(wordBreak('aaaaaaa', ['aaaa', 'aa', 'a']).length, 31);\nassert.deepEqual(wordBreak('aaaaaaa', ['aaaa', 'aaa']).sort(), ['aaa aaaa', 'aaaa aaa']);\nassert.equal(wordBreak('a'.repeat(15), ['a', 'aa', 'aaa']).length, 5768);"
      },
      {
        "name": "a long string that cannot be split is rejected quickly",
        "body": "assert.deepEqual(wordBreak('a'.repeat(60) + 'b', ['a', 'aa', 'aaa']), []);"
      },
      {
        "name": "sentences have single spaces and use only dictionary words",
        "body": "const dict = ['ab', 'abc', 'cd', 'abcd', 'd', 'c'];\nconst out = wordBreak('abcdabcd', dict);\nassert.ok(out.length > 0);\nassert.equal(new Set(out).size, out.length);\nfor (const sentence of out) {\n  assert.equal(sentence.replace(/ /g, ''), 'abcdabcd');\n  assert.ok(sentence.split(' ').every((w) => dict.includes(w)));\n}"
      }
    ]
  }
];
