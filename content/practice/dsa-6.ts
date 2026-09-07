import type { Exercise } from "../types";

export const dsa6: Exercise[] = [
{
    id: "ex-daily-temperatures",
    chapter: "dsa-monotonic-stack-queue",
    level: "intermediate",
    title: "Daily Temperatures",
    brief:
      "<p>Given an array <code>temperatures</code> where each entry is that day's temperature, return an array <code>answer</code> in which <code>answer[i]</code> is how many days you must wait after day <code>i</code> for a <b>strictly warmer</b> temperature.</p><ul><li>If no later day is warmer, put <code>0</code> there</li><li>Equal temperatures do not count as warmer</li><li>Aim for <b>O(n)</b> — the nested-loop version is O(n^2)</li></ul>",
    starter:
      "function dailyTemperatures(temperatures) {\n  // TODO: keep track of the days that are still waiting for a warmer day\n}\n",
    hints: [
      "While you walk left to right, some earlier days are still 'unresolved'. What order are their temperatures in?",
      "Hold their INDICES on a stack whose temperatures decrease from bottom to top.",
      "When today beats the temperature at the top index, pop it and record today's index minus that index — repeat until the top is warmer than today.",
    ],
    solution:
      "function dailyTemperatures(temperatures) {\n  const answer = new Array(temperatures.length).fill(0);\n  const stack = [];\n  for (let i = 0; i < temperatures.length; i++) {\n    while (stack.length && temperatures[stack[stack.length - 1]] < temperatures[i]) {\n      const day = stack.pop();\n      answer[day] = i - day;\n    }\n    stack.push(i);\n  }\n  return answer;\n}\n",
    tests: [
      {
        name: "classic week of temperatures",
        body: "assert.deepEqual(dailyTemperatures([73,74,75,71,69,72,76,73]), [1,1,4,2,1,1,0,0]);",
      },
      {
        name: "strictly increasing",
        body: "assert.deepEqual(dailyTemperatures([30,40,50,60]), [1,1,1,0]);",
      },
      {
        name: "strictly decreasing — nobody ever warms up",
        body: "assert.deepEqual(dailyTemperatures([90,80,70]), [0,0,0]);",
      },
      {
        name: "equal temperatures do not count",
        body: "assert.deepEqual(dailyTemperatures([50,50,50]), [0,0,0]);",
      },
      {
        name: "single day",
        body: "assert.deepEqual(dailyTemperatures([42]), [0]);",
      },
    ],
  },
{
    id: "ex-next-greater-element-i",
    chapter: "dsa-monotonic-stack-queue",
    level: "intermediate",
    title: "Next Greater Element I",
    brief:
      "<p><code>nums1</code> is a subset of <code>nums2</code>, and both contain distinct values. For each value in <code>nums1</code>, find it inside <code>nums2</code> and return the first value to its <b>right</b> in <code>nums2</code> that is greater than it.</p><ul><li>If there is no such value, use <code>-1</code></li><li>The result lines up positionally with <code>nums1</code></li><li>Aim for <b>O(n + m)</b> rather than searching <code>nums2</code> once per query</li></ul>",
    starter:
      "function nextGreaterElement(nums1, nums2) {\n  // TODO: precompute every answer for nums2 once, then look them up\n}\n",
    hints: [
      "Solve the harder question first: what is the next greater element for EVERY entry of nums2?",
      "Sweep nums2 once with a stack of values that are still waiting for something bigger.",
      "Store each resolved answer in a Map from value -> next greater, then map nums1 through it with a default of -1.",
    ],
    solution:
      "function nextGreaterElement(nums1, nums2) {\n  const nextGreater = new Map();\n  const stack = [];\n  for (const value of nums2) {\n    while (stack.length && stack[stack.length - 1] < value) {\n      nextGreater.set(stack.pop(), value);\n    }\n    stack.push(value);\n  }\n  return nums1.map((v) => (nextGreater.has(v) ? nextGreater.get(v) : -1));\n}\n",
    tests: [
      {
        name: "mixed hits and misses",
        body: "assert.deepEqual(nextGreaterElement([4,1,2], [1,3,4,2]), [-1,3,-1]);",
      },
      {
        name: "increasing nums2",
        body: "assert.deepEqual(nextGreaterElement([2,4], [1,2,3,4]), [3,-1]);",
      },
      {
        name: "decreasing nums2 has no answers",
        body: "assert.deepEqual(nextGreaterElement([9,7,5], [9,7,5,3]), [-1,-1,-1]);",
      },
      {
        name: "single query",
        body: "assert.deepEqual(nextGreaterElement([1], [1,5]), [5]);",
      },
      {
        name: "query order is preserved",
        body: "assert.deepEqual(nextGreaterElement([3,1,2], [1,2,3,10]), [10,2,3]);",
      },
    ],
  },
{
    id: "ex-next-greater-element-circular",
    chapter: "dsa-monotonic-stack-queue",
    level: "advanced",
    title: "Next Greater Element II (Circular)",
    brief:
      "<p>Given a <b>circular</b> array <code>nums</code>, return an array where position <code>i</code> holds the next value greater than <code>nums[i]</code>, searching to the right and wrapping past the end back to the start.</p><ul><li>If no greater value exists anywhere in the circle, use <code>-1</code></li><li>Values may repeat; only <em>strictly</em> greater counts</li><li>Aim for <b>O(n)</b> time and O(n) extra space</li></ul>",
    starter: "function nextGreaterElements(nums) {\n  // TODO: a monotonic stack, but the array has no real 'end'\n}\n",
    hints: [
      "Wrapping is just 'walk the array twice' — index i maps to nums[i % n].",
      "Run the usual decreasing-stack sweep over 2n steps, but only PUSH indices during the first n steps.",
      "Anything still on the stack after the second pass genuinely has no greater element, so leave those as -1.",
    ],
    solution:
      "function nextGreaterElements(nums) {\n  const n = nums.length;\n  const answer = new Array(n).fill(-1);\n  const stack = [];\n  for (let i = 0; i < 2 * n; i++) {\n    const value = nums[i % n];\n    while (stack.length && nums[stack[stack.length - 1]] < value) {\n      answer[stack.pop()] = value;\n    }\n    if (i < n) stack.push(i);\n  }\n  return answer;\n}\n",
    tests: [
      {
        name: "wraps around the end",
        body: "assert.deepEqual(nextGreaterElements([1,2,1]), [2,-1,2]);",
      },
      {
        name: "the maximum has no answer",
        body: "assert.deepEqual(nextGreaterElements([1,2,3,4,3]), [2,3,4,-1,4]);",
      },
      {
        name: "decreasing array wraps to the front",
        body: "assert.deepEqual(nextGreaterElements([5,4,3,2,1]), [-1,5,5,5,5]);",
      },
      {
        name: "all equal — strictly greater never happens",
        body: "assert.deepEqual(nextGreaterElements([1,1,1]), [-1,-1,-1]);",
      },
      {
        name: "single element",
        body: "assert.deepEqual(nextGreaterElements([7]), [-1]);",
      },
    ],
  },
{
    id: "ex-largest-rectangle-histogram",
    chapter: "dsa-monotonic-stack-queue",
    level: "advanced",
    title: "Largest Rectangle in Histogram",
    brief:
      "<p><code>heights</code> describes a histogram of bars, each exactly one unit wide. Return the area of the largest axis-aligned rectangle you can fit inside it.</p><ul><li>A rectangle of height <code>h</code> may span a run of consecutive bars as long as every bar in the run is at least <code>h</code> tall</li><li>An empty histogram has area <code>0</code></li><li>Aim for <b>O(n)</b>; the obvious 'expand from each bar' solution is O(n^2)</li></ul>",
    starter:
      "function largestRectangleArea(heights) {\n  // TODO: for each bar, how far left and right can it extend at its own height?\n}\n",
    hints: [
      "Every maximal rectangle is limited by its shortest bar. So ask, for each bar: how wide a run has this bar as its minimum?",
      "Keep a stack of indices with non-decreasing heights. A bar shorter than the top means the top's run has just ended.",
      "When you pop index j, its right edge is the current i and its left edge is one past the new stack top. Push a sentinel height of 0 after the last bar so everything drains.",
    ],
    solution:
      "function largestRectangleArea(heights) {\n  const stack = [];\n  let best = 0;\n  for (let i = 0; i <= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i];\n    while (stack.length && heights[stack[stack.length - 1]] >= h) {\n      const height = heights[stack.pop()];\n      const left = stack.length ? stack[stack.length - 1] + 1 : 0;\n      best = Math.max(best, height * (i - left));\n    }\n    stack.push(i);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic histogram",
        body: "assert.equal(largestRectangleArea([2,1,5,6,2,3]), 10);",
      },
      {
        name: "two bars",
        body: "assert.equal(largestRectangleArea([2,4]), 4);",
      },
      {
        name: "flat histogram spans everything",
        body: "assert.equal(largestRectangleArea([3,3,3,3]), 12);",
      },
      {
        name: "strictly decreasing",
        body: "assert.equal(largestRectangleArea([6,5,4,3,2,1]), 12);",
      },
      {
        name: "empty and single bar",
        body: "assert.equal(largestRectangleArea([]), 0);\nassert.equal(largestRectangleArea([5]), 5);\nassert.equal(largestRectangleArea([0]), 0);",
      },
    ],
  },
{
    id: "ex-maximal-rectangle",
    chapter: "dsa-monotonic-stack-queue",
    level: "advanced",
    title: "Maximal Rectangle",
    brief:
      "<p>Given a 2-D <code>matrix</code> filled with the numbers <code>0</code> and <code>1</code>, return the area of the largest rectangle made entirely of <code>1</code>s.</p><ul><li>The rectangle must be axis-aligned and solid — no zeros inside it</li><li>An empty matrix, or one with no <code>1</code>s at all, gives <code>0</code></li><li>Aim for <b>O(rows * cols)</b></li></ul>",
    starter:
      "function maximalRectangle(matrix) {\n  // TODO: reduce each row to a problem you already know how to solve\n}\n",
    hints: [
      "Treat each row as the ground line of a histogram: for column c, the bar height is how many consecutive 1s sit directly above (and including) that cell.",
      "Rolling those heights forward costs O(cols) per row — a 1 adds one to the previous height, a 0 resets it to 0.",
      "Now run the largest-rectangle-in-a-histogram sweep on the heights after every row and keep the best area seen.",
    ],
    solution:
      "function maximalRectangle(matrix) {\n  if (!matrix || matrix.length === 0 || matrix[0].length === 0) return 0;\n  const cols = matrix[0].length;\n  const heights = new Array(cols).fill(0);\n  let best = 0;\n  for (const row of matrix) {\n    for (let c = 0; c < cols; c++) {\n      heights[c] = Number(row[c]) === 1 ? heights[c] + 1 : 0;\n    }\n    best = Math.max(best, histogramArea(heights));\n  }\n  return best;\n}\n\nfunction histogramArea(heights) {\n  const stack = [];\n  let best = 0;\n  for (let i = 0; i <= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i];\n    while (stack.length && heights[stack[stack.length - 1]] >= h) {\n      const height = heights[stack.pop()];\n      const left = stack.length ? stack[stack.length - 1] + 1 : 0;\n      best = Math.max(best, height * (i - left));\n    }\n    stack.push(i);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic 4x5 grid",
        body: "const m = [[1,0,1,0,0],[1,0,1,1,1],[1,1,1,1,1],[1,0,0,1,0]];\nassert.equal(maximalRectangle(m), 6);",
      },
      {
        name: "solid block",
        body: "assert.equal(maximalRectangle([[1,1],[1,1]]), 4);",
      },
      {
        name: "tall thin column beats a wide short row",
        body: "const m = [[0,1,0],[0,1,0],[0,1,0],[1,1,1]];\nassert.equal(maximalRectangle(m), 4);",
      },
      {
        name: "single cells",
        body: "assert.equal(maximalRectangle([[0]]), 0);\nassert.equal(maximalRectangle([[1]]), 1);",
      },
      {
        name: "empty matrix",
        body: "assert.equal(maximalRectangle([]), 0);\nassert.equal(maximalRectangle([[0,0],[0,0]]), 0);",
      },
    ],
  },
{
    id: "ex-asteroid-collision",
    chapter: "dsa-stacks-queues",
    level: "intermediate",
    title: "Asteroid Collision",
    brief:
      "<p>Each entry of <code>asteroids</code> is an asteroid: its magnitude is the size and its sign is the direction — positive moves right, negative moves left. They all move at the same speed. Return the state of the row once no more collisions can happen.</p><ul><li>Two asteroids collide only when a right-mover is immediately followed by a left-mover</li><li>The smaller one explodes; if they are the same size <b>both</b> explode</li><li>Asteroids moving the same way, or moving apart, never meet</li></ul>",
    starter:
      "function asteroidCollision(asteroids) {\n  // TODO: the survivors so far behave exactly like a stack\n}\n",
    hints: [
      "Push each asteroid onto a stack of survivors — but a NEGATIVE arrival may have to fight its way in first.",
      "A collision happens only when the incoming asteroid is negative and the stack top is positive; otherwise just push.",
      "Loop the fight: if the top is smaller, pop it and keep fighting; if equal, pop it and the newcomer also dies; if bigger, the newcomer dies.",
    ],
    solution:
      "function asteroidCollision(asteroids) {\n  const survivors = [];\n  for (const a of asteroids) {\n    let alive = true;\n    while (alive && a < 0 && survivors.length && survivors[survivors.length - 1] > 0) {\n      const top = survivors[survivors.length - 1];\n      if (top < -a) {\n        survivors.pop();\n        continue;\n      }\n      if (top === -a) survivors.pop();\n      alive = false;\n    }\n    if (alive) survivors.push(a);\n  }\n  return survivors;\n}\n",
    tests: [
      {
        name: "small left-mover is destroyed",
        body: "assert.deepEqual(asteroidCollision([5,10,-5]), [5,10]);",
      },
      {
        name: "equal sizes destroy each other",
        body: "assert.deepEqual(asteroidCollision([8,-8]), []);",
      },
      {
        name: "one big asteroid clears several",
        body: "assert.deepEqual(asteroidCollision([10,2,-5]), [10]);",
      },
      {
        name: "moving apart means no collisions",
        body: "assert.deepEqual(asteroidCollision([-2,-1,1,2]), [-2,-1,1,2]);",
      },
      {
        name: "a survivor keeps travelling left",
        body: "assert.deepEqual(asteroidCollision([1,-1,-2]), [-2]);\nassert.deepEqual(asteroidCollision([]), []);",
      },
    ],
  },
{
    id: "ex-evaluate-rpn",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Evaluate Reverse Polish Notation",
    brief:
      "<p>Evaluate an arithmetic expression given in reverse Polish (postfix) notation. <code>tokens</code> is an array of strings: either an integer, or one of <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>.</p><ul><li>An operator applies to the two values immediately before it, in order — so <code>['3','4','-']</code> is <code>3 - 4</code></li><li>Division is integer division that <b>truncates toward zero</b>: <code>7 / -3</code> is <code>-2</code></li><li>The expression is always valid and never divides by zero</li></ul>",
    starter:
      "function evalRPN(tokens) {\n  // TODO: numbers go somewhere to wait; an operator consumes the two most recent\n}\n",
    hints: [
      "Push every number onto a stack. When you meet an operator, pop two values.",
      "Order matters: the FIRST value you pop is the right-hand operand.",
      "Math.trunc gives you the toward-zero rounding that Math.floor does not for negatives.",
    ],
    solution:
      "function evalRPN(tokens) {\n  const stack = [];\n  for (const token of tokens) {\n    if (token === '+' || token === '-' || token === '*' || token === '/') {\n      const right = stack.pop();\n      const left = stack.pop();\n      let value;\n      if (token === '+') value = left + right;\n      else if (token === '-') value = left - right;\n      else if (token === '*') value = left * right;\n      else value = Math.trunc(left / right);\n      stack.push(value);\n    } else {\n      stack.push(Number(token));\n    }\n  }\n  return stack.pop();\n}\n",
    tests: [
      {
        name: "add then multiply",
        body: "assert.equal(evalRPN(['2','1','+','3','*']), 9);",
      },
      {
        name: "division truncates",
        body: "assert.equal(evalRPN(['4','13','5','/','+']), 6);",
      },
      {
        name: "operand order matters for minus",
        body: "assert.equal(evalRPN(['3','4','-']), -1);",
      },
      {
        name: "negative division truncates toward zero",
        body: "assert.equal(evalRPN(['7','-3','/']), -2);",
      },
      {
        name: "long nested expression and a lone number",
        body: "assert.equal(evalRPN(['10','6','9','3','+','-11','*','/','*','17','+','5','+']), 22);\nassert.equal(evalRPN(['42']), 42);",
      },
    ],
  },
{
    id: "ex-basic-calculator",
    chapter: "dsa-stacks-queues",
    level: "advanced",
    title: "Basic Calculator",
    brief:
      "<p>Evaluate a string expression built from non-negative integers, <code>+</code>, <code>-</code>, matched parentheses and spaces. Return the integer result.</p><ul><li>There is no <code>*</code> or <code>/</code>, so the only precedence is parentheses</li><li>A leading <code>-</code>, including right after <code>(</code>, is a unary minus: <code>-(3+4)</code> is <code>-7</code></li><li>Spaces may appear anywhere and mean nothing</li><li>Do <em>not</em> use <code>eval</code> or <code>Function</code></li></ul>",
    starter:
      "function calculate(s) {\n  // TODO: one left-to-right pass; parentheses need you to remember where you were\n}\n",
    hints: [
      "With only + and -, a running total plus a current sign (+1 or -1) is enough — until you hit a parenthesis.",
      "On '(' push the running total and the pending sign, then start a fresh sub-total from zero with sign +1.",
      "On ')' finish the sub-total, then pop the sign and the outer total and combine: outer + sign * subTotal.",
    ],
    solution:
      "function calculate(s) {\n  const stack = [];\n  let result = 0;\n  let sign = 1;\n  let num = 0;\n  for (let i = 0; i < s.length; i++) {\n    const c = s[i];\n    if (c >= '0' && c <= '9') {\n      num = num * 10 + (c.charCodeAt(0) - 48);\n    } else if (c === '+') {\n      result += sign * num;\n      num = 0;\n      sign = 1;\n    } else if (c === '-') {\n      result += sign * num;\n      num = 0;\n      sign = -1;\n    } else if (c === '(') {\n      stack.push(result);\n      stack.push(sign);\n      result = 0;\n      sign = 1;\n    } else if (c === ')') {\n      result += sign * num;\n      num = 0;\n      const outerSign = stack.pop();\n      const outerResult = stack.pop();\n      result = outerResult + outerSign * result;\n      sign = 1;\n    }\n  }\n  return result + sign * num;\n}\n",
    tests: [
      {
        name: "nested parentheses",
        body: "assert.equal(calculate('(1+(4+5+2)-3)+(6+8)'), 23);",
      },
      {
        name: "spaces are ignored",
        body: "assert.equal(calculate('1 + 1'), 2);\nassert.equal(calculate(' 2-1 + 2 '), 3);",
      },
      {
        name: "subtracting a group flips its sign",
        body: "assert.equal(calculate('2-(5-6)'), 3);",
      },
      {
        name: "leading unary minus",
        body: "assert.equal(calculate('-(3+4)'), -7);\nassert.equal(calculate('-2+ 1'), -1);",
      },
      {
        name: "multi-digit numbers and deep nesting",
        body: "assert.equal(calculate('(100)'), 100);\nassert.equal(calculate('1-(2-(3-(4-5)))'), 3);",
      },
    ],
  },
{
    id: "ex-basic-calculator-ii",
    chapter: "dsa-stacks-queues",
    level: "intermediate",
    title: "Basic Calculator II",
    brief:
      "<p>Evaluate a string expression built from non-negative integers, the operators <code>+</code>, <code>-</code>, <code>*</code>, <code>/</code>, and spaces. There are <b>no parentheses</b>.</p><ul><li><code>*</code> and <code>/</code> bind tighter than <code>+</code> and <code>-</code>, so <code>3+2*2</code> is <code>7</code></li><li>Division truncates toward zero: <code>3/2</code> is <code>1</code></li><li>Spaces may appear anywhere and mean nothing</li><li>Do <em>not</em> use <code>eval</code> or <code>Function</code></li></ul>",
    starter: "function calculate(s) {\n  // TODO: defer the low-precedence work; apply * and / the moment you can\n}\n",
    hints: [
      "Keep a stack of terms that only ever need to be ADDED at the end. Then the final answer is just their sum.",
      "Track the operator that came BEFORE the number you just finished reading, and act on it when the number ends.",
      "'+' pushes num, '-' pushes -num, '*' and '/' pop the last term and combine it with num right away.",
    ],
    solution:
      "function calculate(s) {\n  const terms = [];\n  let num = 0;\n  let op = '+';\n  for (let i = 0; i < s.length; i++) {\n    const c = s[i];\n    const isDigit = c >= '0' && c <= '9';\n    if (isDigit) num = num * 10 + (c.charCodeAt(0) - 48);\n    if ((!isDigit && c !== ' ') || i === s.length - 1) {\n      if (op === '+') terms.push(num);\n      else if (op === '-') terms.push(-num);\n      else if (op === '*') terms.push(terms.pop() * num);\n      else terms.push(Math.trunc(terms.pop() / num));\n      op = c;\n      num = 0;\n    }\n  }\n  return terms.reduce((a, b) => a + b, 0);\n}\n",
    tests: [
      {
        name: "multiplication binds tighter than addition",
        body: "assert.equal(calculate('3+2*2'), 7);",
      },
      {
        name: "division truncates and spaces are ignored",
        body: "assert.equal(calculate(' 3/2 '), 1);\nassert.equal(calculate(' 3+5 / 2 '), 5);",
      },
      {
        name: "subtraction then division",
        body: "assert.equal(calculate('14-3/2'), 13);",
      },
      {
        name: "chained same-precedence operators",
        body: "assert.equal(calculate('2*3*4'), 24);\nassert.equal(calculate('100/10/5'), 2);",
      },
      {
        name: "single number and a negative result",
        body: "assert.equal(calculate('42'), 42);\nassert.equal(calculate('1-2*3'), -5);",
      },
    ],
  },
{
    id: "ex-kth-largest-element",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "Kth Largest Element in an Array",
    brief:
      "<p>Return the <code>k</code>-th largest value in <code>nums</code>. This is the k-th in <b>sorted order</b>, not the k-th distinct value — in <code>[3,2,3,1,2,4,5,5,6]</code> the 4th largest is <code>4</code>.</p><ul><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li><li>The heap route keeps the k best seen so far and runs in O(n log k)</li><li>Quickselect solves it in O(n) on average by partitioning around a pivot and recursing into one side only — either approach passes</li><li><code>1 &lt;= k &lt;= nums.length</code>, and duplicates are allowed</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findKthLargest(nums, k) {\n  // TODO: keep only the k biggest values seen so far\n}\n",
    hints: [
      "You do not need the whole array sorted — you only need to know where the boundary between 'top k' and 'the rest' sits.",
      "Hold the k largest values in a MIN heap. Its root is the weakest of the k, so it is exactly the k-th largest.",
      "Push every value; whenever the heap grows past k, pop the root to evict the smallest survivor.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findKthLargest(nums, k) {\n  const heap = new MinHeap();\n  for (const n of nums) {\n    heap.push(n);\n    if (heap.size() > k) heap.pop();\n  }\n  return heap.peek();\n}\n",
    tests: [
      {
        name: "second largest",
        body: "assert.equal(findKthLargest([3,2,1,5,6,4], 2), 5);",
      },
      {
        name: "duplicates count separately",
        body: "assert.equal(findKthLargest([3,2,3,1,2,4,5,5,6], 4), 4);",
      },
      {
        name: "k = 1 is the maximum, k = n is the minimum",
        body: "assert.equal(findKthLargest([7,10,4,3,20,15], 1), 20);\nassert.equal(findKthLargest([7,10,4,3,20,15], 6), 3);",
      },
      {
        name: "all values equal",
        body: "assert.equal(findKthLargest([2,2,2,2], 3), 2);",
      },
      {
        name: "negatives and a single element",
        body: "assert.equal(findKthLargest([-1,-5,-3], 2), -3);\nassert.equal(findKthLargest([1], 1), 1);",
      },
    ],
  },
{
    id: "ex-median-from-data-stream",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Find Median from Data Stream",
    brief:
      "<p>Design <code>MedianFinder</code>, which accepts numbers one at a time and can report the median of everything seen so far at any moment.</p><ul><li><code>addNum(num)</code> — take the next value from the stream</li><li><code>findMedian()</code> — the middle value when the count is odd, or the average of the two middle values when it is even</li><li>Re-sorting on every query is too slow; aim for O(log n) per add and O(1) per query</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — pass a comparator such as <code>function (a, b) { return b - a; }</code> to get a max-heap</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nclass MedianFinder {\n  constructor() {\n    // TODO: split the stream into a low half and a high half\n  }\n  addNum(num) {}\n  findMedian() {}\n}\n",
    hints: [
      "The median only depends on the one or two values sitting at the boundary between the smaller half and the larger half.",
      "Keep a max-heap of the lower half and a min-heap of the upper half; both boundary values are then just two peeks.",
      "To add: push into the low heap, move its largest across to the high heap, then move back if the high heap became bigger. That keeps low.size() equal to high.size() or one more.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nclass MedianFinder {\n  constructor() {\n    this.low = new MinHeap(function (a, b) { return b - a; });\n    this.high = new MinHeap();\n  }\n  addNum(num) {\n    this.low.push(num);\n    this.high.push(this.low.pop());\n    if (this.high.size() > this.low.size()) this.low.push(this.high.pop());\n  }\n  findMedian() {\n    if (this.low.size() > this.high.size()) return this.low.peek();\n    return (this.low.peek() + this.high.peek()) / 2;\n  }\n}\n",
    tests: [
      {
        name: "interleaved adds and queries",
        body: "const m = new MedianFinder();\nm.addNum(1);\nassert.equal(m.findMedian(), 1);\nm.addNum(2);\nassert.equal(m.findMedian(), 1.5);\nm.addNum(3);\nassert.equal(m.findMedian(), 2);",
      },
      {
        name: "descending stream",
        body: "const m = new MedianFinder();\n[5,4,3,2,1].forEach((n) => m.addNum(n));\nassert.equal(m.findMedian(), 3);\nm.addNum(0);\nassert.equal(m.findMedian(), 2.5);",
      },
      {
        name: "duplicates and negatives",
        body: "const m = new MedianFinder();\n[-1,-2,-3,-4].forEach((n) => m.addNum(n));\nassert.equal(m.findMedian(), -2.5);\nm.addNum(-2);\nassert.equal(m.findMedian(), -2);",
      },
      {
        name: "unsorted arrival order",
        body: "const m = new MedianFinder();\n[6,10,2,6,5,0].forEach((n) => m.addNum(n));\nassert.equal(m.findMedian(), 5.5);\nm.addNum(100);\nassert.equal(m.findMedian(), 6);",
      },
      {
        name: "single value",
        body: "const m = new MedianFinder();\nm.addNum(42);\nassert.equal(m.findMedian(), 42);",
      },
    ],
  },
{
    id: "ex-k-closest-points-origin",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "K Closest Points to Origin",
    brief:
      "<p>Given an array of <code>points</code> as <code>[x, y]</code> pairs, return the <code>k</code> points closest to the origin <code>[0, 0]</code>.</p><ul><li>Distance is the usual Euclidean distance — but you can compare <code>x*x + y*y</code> directly and skip the square root</li><li>The answer may be returned in <b>any order</b></li><li>The inputs have no ties on the boundary, so the answer set is unique</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kClosest(points, k) {\n  // TODO: keep the k best candidates and evict the worst as you go\n}\n",
    hints: [
      "You never need the actual distance — squared distance orders the points identically and avoids Math.sqrt.",
      "Keep a heap capped at size k whose ROOT is the worst (farthest) of the survivors, so it is cheap to evict.",
      "Give MinHeap a comparator that puts the largest squared distance first, push every point, and pop whenever size exceeds k.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kClosest(points, k) {\n  const dist = (p) => p[0] * p[0] + p[1] * p[1];\n  const heap = new MinHeap(function (a, b) { return dist(b) - dist(a); });\n  for (const p of points) {\n    heap.push(p);\n    if (heap.size() > k) heap.pop();\n  }\n  const out = [];\n  while (heap.size()) out.push(heap.pop());\n  return out;\n}\n",
    tests: [
      {
        name: "picks the single closest point",
        body: "const out = kClosest([[1,3],[-2,2]], 1);\nassert.deepEqual(out, [[-2,2]]);",
      },
      {
        name: "picks two out of three",
        body: "const out = kClosest([[3,3],[5,-1],[-2,4]], 2)\n  .sort((a, b) => a[0] - b[0]);\nassert.deepEqual(out, [[-2,4],[3,3]]);",
      },
      {
        name: "k equals every point",
        body: "const out = kClosest([[1,0],[0,2],[3,3]], 3)\n  .sort((a, b) => a[0] - b[0]);\nassert.deepEqual(out, [[0,2],[1,0],[3,3]]);",
      },
      {
        name: "the origin itself is closest",
        body: "const out = kClosest([[10,10],[0,0],[4,4]], 1);\nassert.deepEqual(out, [[0,0]]);",
      },
      {
        name: "negative coordinates are handled by squared distance",
        body: "const out = kClosest([[-1,-1],[8,-9],[-7,0]], 2)\n  .sort((a, b) => a[0] - b[0]);\nassert.deepEqual(out, [[-7,0],[-1,-1]]);",
      },
    ],
  },
{
    id: "ex-last-stone-weight",
    chapter: "dsa-heaps-priority-queues",
    level: "beginner",
    title: "Last Stone Weight",
    brief:
      "<p>You have a pile of stones with the given weights. Repeatedly take the two heaviest stones and smash them together:</p><ul><li>If they weigh the same, both are destroyed</li><li>Otherwise the lighter one is destroyed and the heavier one is left with the difference in weight</li><li>Return the weight of the last remaining stone, or <code>0</code> if none remain</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction lastStoneWeight(stones) {\n  // TODO: simulate the smashing, always grabbing the two heaviest stones\n}\n",
    hints: [
      "Re-sorting after every smash works but is wasteful — you only ever need the two largest.",
      "Pass a comparator like function (a, b) { return b - a; } so MinHeap behaves as a MAX heap.",
      "Loop while size() > 1: pop twice, and if the two differ push their difference back.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction lastStoneWeight(stones) {\n  const heap = new MinHeap(function (a, b) { return b - a; });\n  for (const s of stones) heap.push(s);\n  while (heap.size() > 1) {\n    const first = heap.pop();\n    const second = heap.pop();\n    if (first !== second) heap.push(first - second);\n  }\n  return heap.size() ? heap.peek() : 0;\n}\n",
    tests: [
      {
        name: "classic pile",
        body: "assert.equal(lastStoneWeight([2,7,4,1,8,1]), 1);",
      },
      {
        name: "everything cancels out",
        body: "assert.equal(lastStoneWeight([3,3]), 0);\nassert.equal(lastStoneWeight([2,2,2,2]), 0);",
      },
      {
        name: "equal heavies cancel, lighter ones remain",
        body: "assert.equal(lastStoneWeight([10,4,2,10]), 2);",
      },
      {
        name: "single stone and empty pile",
        body: "assert.equal(lastStoneWeight([9]), 9);\nassert.equal(lastStoneWeight([]), 0);",
      },
      {
        name: "one giant stone survives",
        body: "assert.equal(lastStoneWeight([1,1,1,100]), 97);",
      },
    ],
  },
{
    id: "ex-task-scheduler",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Task Scheduler",
    brief:
      "<p><code>tasks</code> lists CPU tasks by name; each takes exactly one time unit. Two runs of the <b>same</b> task must be separated by at least <code>n</code> time units, during which the CPU may run a different task or sit idle. Return the shortest total time needed to finish every task.</p><ul><li>Tasks may be run in any order</li><li>When there is enough variety the answer is simply <code>tasks.length</code> — no idling is ever required</li><li><code>n = 0</code> means no cooldown at all</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction leastInterval(tasks, n) {\n  // TODO: at every tick, run whichever available task has the most work left\n}\n",
    hints: [
      "The names do not matter — only how many times each name appears. Start by counting.",
      "Greedy rule: at each tick run the task with the largest remaining count that is not cooling down. A max-heap gives you that in O(log k).",
      "Park a task you just ran in a waiting list together with the time it becomes available again, and move it back into the heap when the clock reaches that time. Ticks where the heap is empty but the waiting list is not are idle ticks — count them too.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction leastInterval(tasks, n) {\n  const counts = new Map();\n  for (const t of tasks) counts.set(t, (counts.get(t) || 0) + 1);\n  const heap = new MinHeap(function (a, b) { return b - a; });\n  for (const c of counts.values()) heap.push(c);\n  const cooling = [];\n  let time = 0;\n  while (heap.size() || cooling.length) {\n    time++;\n    if (heap.size()) {\n      const remaining = heap.pop() - 1;\n      if (remaining > 0) cooling.push([time + n, remaining]);\n    }\n    if (cooling.length && cooling[0][0] === time) heap.push(cooling.shift()[1]);\n  }\n  return time;\n}\n",
    tests: [
      {
        name: "idling is required",
        body: "assert.equal(leastInterval(['A','A','A','B','B','B'], 2), 8);",
      },
      {
        name: "no cooldown means no idling",
        body: "assert.equal(leastInterval(['A','A','A','B','B','B'], 0), 6);",
      },
      {
        name: "enough variety — the answer is just the task count",
        body: "assert.equal(leastInterval(['A','B','C','D','E','A','B','C','D','E'], 4), 10);\nassert.equal(leastInterval(['A','B','C','D'], 2), 4);",
      },
      {
        name: "one dominant task with plenty of filler",
        body: "assert.equal(leastInterval(['A','A','A','A','A','A','B','C','D','E','F','G'], 2), 16);",
      },
      {
        name: "single task repeated, and an empty list",
        body: "assert.equal(leastInterval(['A','A','A'], 2), 7);\nassert.equal(leastInterval([], 3), 0);",
      },
    ],
  },
{
    id: "ex-sort-characters-by-frequency",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "Sort Characters By Frequency",
    brief:
      "<p>Given a string <code>s</code>, rearrange its characters so that they are grouped by how often they occur, most frequent group first.</p><ul><li>All copies of a character must sit together in one contiguous run</li><li>Characters with the same frequency may appear in <b>any order</b> relative to each other</li><li>The result must contain exactly the same characters as the input</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction frequencySort(s) {\n  // TODO: count, then emit whole runs in descending frequency order\n}\n",
    hints: [
      "Two phases: build a character -> count map, then decide the order of the groups.",
      "Push [character, count] pairs into the heap with a comparator that compares the counts in descending order.",
      "Pop repeatedly and append character.repeat(count) — that keeps every run contiguous for free.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction frequencySort(s) {\n  const counts = new Map();\n  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);\n  const heap = new MinHeap(function (a, b) { return b[1] - a[1]; });\n  for (const entry of counts) heap.push(entry);\n  let out = '';\n  while (heap.size()) {\n    const pair = heap.pop();\n    out += pair[0].repeat(pair[1]);\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "the most common letter comes first",
        body: "function checkFreq(input, out) {\n  assert.type(out, 'string');\n  assert.equal(out.length, input.length, 'length must match');\n  const a = {}, b = {};\n  for (const ch of input) a[ch] = (a[ch] || 0) + 1;\n  for (const ch of out) b[ch] = (b[ch] || 0) + 1;\n  assert.deepEqual(b, a, 'must be a rearrangement of the input');\n  let prev = Infinity, i = 0;\n  const seen = new Set();\n  while (i < out.length) {\n    let j = i;\n    while (j < out.length && out[j] === out[i]) j++;\n    assert.ok(!seen.has(out[i]), 'each character must form one contiguous run');\n    seen.add(out[i]);\n    assert.ok(j - i <= prev, 'runs must be in non-increasing frequency order');\n    prev = j - i;\n    i = j;\n  }\n}\ncheckFreq('tree', frequencySort('tree'));\nassert.equal(frequencySort('tree')[0], 'e');",
      },
      {
        name: "ties may come out in any order",
        body: "const out = frequencySort('cccaaa');\nassert.equal(out.length, 6);\nassert.ok(out === 'cccaaa' || out === 'aaaccc');",
      },
      {
        name: "case is significant",
        body: "const out = frequencySort('Aabb');\nassert.equal(out.slice(0, 2), 'bb');\nassert.equal(out.length, 4);\nassert.ok(out.indexOf('A') >= 0 && out.indexOf('a') >= 0);",
      },
      {
        name: "single character and empty string",
        body: "assert.equal(frequencySort('z'), 'z');\nassert.equal(frequencySort(''), '');",
      },
      {
        name: "a clear frequency ordering",
        body: "assert.equal(frequencySort('aaabbc'), 'aaabbc');",
      },
    ],
  },
{
    id: "ex-reorganize-string",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Reorganize String",
    brief:
      "<p>Rearrange the characters of <code>s</code> so that no two adjacent characters are the same, and return the result.</p><ul><li>If no such arrangement exists, return the empty string <code>''</code></li><li><b>Any</b> valid arrangement is accepted — the tests check the property, not one specific string</li><li>An arrangement is impossible exactly when some character occurs more than <code>ceil(s.length / 2)</code> times</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction reorganizeString(s) {\n  // TODO: place the character you have the most of, but never twice in a row\n}\n",
    hints: [
      "The character with the highest count is the bottleneck — check it against ceil(n / 2) first and bail out early.",
      "Greedily emit the most frequent REMAINING character each step, using a max-heap of [character, count].",
      "The one you just placed must not be eligible next, so hold it aside for exactly one round and only push it back after you have popped the next character.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction reorganizeString(s) {\n  const counts = new Map();\n  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);\n  const limit = Math.ceil(s.length / 2);\n  const heap = new MinHeap(function (a, b) { return b[1] - a[1]; });\n  for (const entry of counts) {\n    if (entry[1] > limit) return '';\n    heap.push([entry[0], entry[1]]);\n  }\n  let out = '';\n  let held = null;\n  while (heap.size()) {\n    const current = heap.pop();\n    out += current[0];\n    current[1] -= 1;\n    if (held && held[1] > 0) heap.push(held);\n    held = current;\n  }\n  return out.length === s.length ? out : '';\n}\n",
    tests: [
      {
        name: "a valid rearrangement exists",
        body: "function checkValid(input, out) {\n  assert.type(out, 'string');\n  assert.equal(out.length, input.length, 'length must match the input');\n  const a = {}, b = {};\n  for (const ch of input) a[ch] = (a[ch] || 0) + 1;\n  for (const ch of out) b[ch] = (b[ch] || 0) + 1;\n  assert.deepEqual(b, a, 'must use exactly the same characters');\n  for (let i = 1; i < out.length; i++) {\n    assert.notEqual(out[i], out[i - 1], 'adjacent characters must differ');\n  }\n}\ncheckValid('aab', reorganizeString('aab'));\ncheckValid('aaabbb', reorganizeString('aaabbb'));",
      },
      {
        name: "impossible inputs return the empty string",
        body: "assert.equal(reorganizeString('aaab'), '');\nassert.equal(reorganizeString('aaaaab'), '');",
      },
      {
        name: "the exact boundary case is still possible",
        body: "const out = reorganizeString('aaabc');\nassert.equal(out.length, 5);\nfor (let i = 1; i < out.length; i++) assert.notEqual(out[i], out[i - 1]);\nlet aCount = 0;\nfor (const ch of out) if (ch === 'a') aCount++;\nassert.equal(aCount, 3);",
      },
      {
        name: "many distinct characters",
        body: "const input = 'vvvlo';\nconst out = reorganizeString(input);\nassert.equal(out.length, 5);\nfor (let i = 1; i < out.length; i++) assert.notEqual(out[i], out[i - 1]);",
      },
      {
        name: "single character and empty string",
        body: "assert.equal(reorganizeString('a'), 'a');\nassert.equal(reorganizeString(''), '');",
      },
    ],
  },
{
    id: "ex-meeting-rooms-ii",
    chapter: "dsa-intervals",
    level: "intermediate",
    title: "Meeting Rooms II",
    brief:
      "<p>Given <code>intervals</code>, an array of <code>[start, end]</code> meeting times, return the minimum number of rooms needed so that no two overlapping meetings share a room.</p><ul><li>A meeting that ends exactly when another begins can reuse the same room</li><li>The input is not sorted</li><li>An empty schedule needs <code>0</code> rooms</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minMeetingRooms(intervals) {\n  // TODO: process meetings in start order and track when rooms free up\n}\n",
    hints: [
      "Sort by start time so you can walk the day forward in order.",
      "The only thing you need to know about the busy rooms is which one frees up SOONEST — that is a min-heap of end times.",
      "For each meeting: if the earliest end time is <= this start, reuse that room (pop it). Then push this meeting's end. The heap size at the end is the answer.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minMeetingRooms(intervals) {\n  if (!intervals.length) return 0;\n  const sorted = intervals.slice().sort((a, b) => a[0] - b[0]);\n  const endTimes = new MinHeap();\n  for (const meeting of sorted) {\n    if (endTimes.size() && endTimes.peek() <= meeting[0]) endTimes.pop();\n    endTimes.push(meeting[1]);\n  }\n  return endTimes.size();\n}\n",
    tests: [
      {
        name: "one long meeting plus two short ones",
        body: "assert.equal(minMeetingRooms([[0,30],[5,10],[15,20]]), 2);",
      },
      {
        name: "no overlap at all",
        body: "assert.equal(minMeetingRooms([[7,10],[2,4]]), 1);\nassert.equal(minMeetingRooms([[1,2],[2,3],[3,4]]), 1);",
      },
      {
        name: "everything overlaps",
        body: "assert.equal(minMeetingRooms([[1,5],[2,6],[3,7],[4,8]]), 4);",
      },
      {
        name: "empty schedule and a single meeting",
        body: "assert.equal(minMeetingRooms([]), 0);\nassert.equal(minMeetingRooms([[9,17]]), 1);",
      },
      {
        name: "input is not sorted",
        body: "assert.equal(minMeetingRooms([[13,15],[1,13],[6,9]]), 2);",
      },
    ],
  },
{
    id: "ex-smallest-range-k-lists",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Smallest Range Covering Elements from K Lists",
    brief:
      "<p>You are given <code>k</code> lists of integers, each already sorted in non-decreasing order. Find the smallest range <code>[start, end]</code> that contains at least one number from every list.</p><ul><li>Range <code>[a, b]</code> is smaller than <code>[c, d]</code> when <code>b - a &lt; d - c</code>; on a tie the one with the smaller <code>a</code> wins</li><li>Return the range as a two-element array</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n",
    hints: [
      "Hold one 'cursor' per list. The current candidate range always runs from the smallest cursor value to the largest.",
      "A min-heap of [value, listIndex, position] gives you the smallest cursor instantly; track the maximum separately as a plain variable.",
      "Only advancing the SMALLEST cursor can ever shrink the range. Stop the moment that list runs out — no further range can cover every list.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction smallestRange(nums) {\n  const heap = new MinHeap(function (a, b) { return a[0] - b[0]; });\n  let currentMax = -Infinity;\n  for (let i = 0; i < nums.length; i++) {\n    heap.push([nums[i][0], i, 0]);\n    currentMax = Math.max(currentMax, nums[i][0]);\n  }\n  let best = [heap.peek()[0], currentMax];\n  for (;;) {\n    const entry = heap.pop();\n    const value = entry[0];\n    const list = entry[1];\n    const pos = entry[2];\n    if (currentMax - value < best[1] - best[0]) best = [value, currentMax];\n    if (pos + 1 === nums[list].length) break;\n    const next = nums[list][pos + 1];\n    currentMax = Math.max(currentMax, next);\n    heap.push([next, list, pos + 1]);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "three interleaved lists",
        body: "const lists = [[4,10,15,24,26],[0,9,12,20],[5,18,22,30]];\nassert.deepEqual(smallestRange(lists), [20,24]);",
      },
      {
        name: "the very first window is already optimal",
        body: "assert.deepEqual(smallestRange([[1,10],[2,20],[3,30]]), [1,3]);",
      },
      {
        name: "disjoint blocks",
        body: "assert.deepEqual(smallestRange([[1,2,3],[4,5,6],[7,8,9]]), [3,7]);",
      },
      {
        name: "every list holds the same single value",
        body: "assert.deepEqual(smallestRange([[5],[5]]), [5,5]);",
      },
      {
        name: "one list only",
        body: "assert.deepEqual(smallestRange([[7]]), [7,7]);\nassert.deepEqual(smallestRange([[10,20],[15],[12,25]]), [10,15]);",
      },
    ],
  },
{
    id: "ex-k-pairs-smallest-sums",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Find K Pairs with Smallest Sums",
    brief:
      "<p>Given two integer arrays <code>nums1</code> and <code>nums2</code>, both sorted in non-decreasing order, and an integer <code>k</code>, return the <code>k</code> pairs <code>[u, v]</code> — one value from each array — with the smallest sums.</p><ul><li>If fewer than <code>k</code> pairs exist, return all of them</li><li>Building every pair is <code>O(n * m)</code> and far too slow for large inputs</li><li>Pairs with equal sums may appear in any order</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kSmallestPairs(nums1, nums2, k) {\n  // TODO: expand pairs outward from the cheapest corner instead of building them all\n}\n",
    hints: [
      "Think of the pairs as a grid, rows indexed by nums1 and columns by nums2. Both arrays are sorted, so sums grow as you move right or down.",
      "Seed a min-heap with the first column only: (0,0), (1,0), (2,0)... at most k of them.",
      "Each time you pop (i, j), the only new candidate it unlocks is (i, j + 1) — push that and repeat until you have k pairs.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction kSmallestPairs(nums1, nums2, k) {\n  const result = [];\n  if (!nums1.length || !nums2.length || k <= 0) return result;\n  const sumOf = (e) => nums1[e[0]] + nums2[e[1]];\n  const heap = new MinHeap(function (a, b) { return sumOf(a) - sumOf(b); });\n  const seeds = Math.min(nums1.length, k);\n  for (let i = 0; i < seeds; i++) heap.push([i, 0]);\n  while (result.length < k && heap.size()) {\n    const entry = heap.pop();\n    result.push([nums1[entry[0]], nums2[entry[1]]]);\n    if (entry[1] + 1 < nums2.length) heap.push([entry[0], entry[1] + 1]);\n  }\n  return result;\n}\n",
    tests: [
      {
        name: "three cheapest pairs, all distinct sums",
        body: "const out = kSmallestPairs([1,7,11], [2,4,6], 3)\n  .sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));\nassert.deepEqual(out, [[1,2],[1,4],[1,6]]);",
      },
      {
        name: "ties are allowed but the sums are fixed",
        body: "const out = kSmallestPairs([1,1,2], [1,2,3], 2);\nassert.equal(out.length, 2);\nconst sums = out.map((p) => p[0] + p[1]).sort((a, b) => a - b);\nassert.deepEqual(sums, [2,2]);\nout.forEach((p) => assert.deepEqual(p, [1,1]));",
      },
      {
        name: "k larger than the number of pairs",
        body: "const out = kSmallestPairs([1,2], [3], 10)\n  .sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));\nassert.deepEqual(out, [[1,3],[2,3]]);",
      },
      {
        name: "empty input or k of zero",
        body: "assert.deepEqual(kSmallestPairs([], [1,2], 3), []);\nassert.deepEqual(kSmallestPairs([1,2], [], 3), []);\nassert.deepEqual(kSmallestPairs([1,2], [3,4], 0), []);",
      },
      {
        name: "negatives sort correctly",
        body: "const out = kSmallestPairs([-10,-4,0], [3,5,6], 2)\n  .sort((a, b) => (a[0] + a[1]) - (b[0] + b[1]));\nassert.deepEqual(out, [[-10,3],[-10,5]]);",
      },
    ],
  },
{
    id: "ex-ipo-maximize-capital",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "IPO — Maximise Capital",
    brief:
      "<p>You may finish at most <code>k</code> projects before an IPO. Project <code>i</code> needs <code>capital[i]</code> up front and adds <code>profits[i]</code> to your money when it finishes. You start with <code>w</code> capital and can only work on one project at a time.</p><ul><li>Profit is added to your capital, so finishing a project may unlock more expensive ones</li><li>Each project can be done at most once</li><li>Return the maximum capital you can end up with</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findMaximizedCapital(k, w, profits, capital) {\n  // TODO: at each step, take the best project you can currently afford\n}\n",
    hints: [
      "Because profits are non-negative, your capital never shrinks — so a project that becomes affordable stays affordable.",
      "Sort the projects by required capital and keep a pointer that moves forward as your capital grows.",
      "Move every newly affordable project's PROFIT into a max-heap, then take its root. Repeat k times, stopping early if the heap is empty.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findMaximizedCapital(k, w, profits, capital) {\n  const order = profits.map((_, i) => i).sort((a, b) => capital[a] - capital[b]);\n  const affordable = new MinHeap(function (a, b) { return b - a; });\n  let next = 0;\n  let money = w;\n  for (let round = 0; round < k; round++) {\n    while (next < order.length && capital[order[next]] <= money) {\n      affordable.push(profits[order[next]]);\n      next++;\n    }\n    if (!affordable.size()) break;\n    money += affordable.pop();\n  }\n  return money;\n}\n",
    tests: [
      {
        name: "two projects unlock the third",
        body: "assert.equal(findMaximizedCapital(2, 0, [1,2,3], [0,1,1]), 4);",
      },
      {
        name: "doing all of them",
        body: "assert.equal(findMaximizedCapital(3, 0, [1,2,3], [0,1,2]), 6);",
      },
      {
        name: "nothing is affordable",
        body: "assert.equal(findMaximizedCapital(1, 0, [1,2,3], [1,1,2]), 0);\nassert.equal(findMaximizedCapital(5, 0, [10], [7]), 0);",
      },
      {
        name: "greedy must pick the biggest affordable profit",
        body: "assert.equal(findMaximizedCapital(1, 2, [1,2,3], [0,1,1]), 5);",
      },
      {
        name: "k of zero and an empty project list",
        body: "assert.equal(findMaximizedCapital(0, 5, [1,2], [0,0]), 5);\nassert.equal(findMaximizedCapital(3, 5, [], []), 5);",
      },
    ],
  },
{
    id: "ex-maximum-performance-team",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Maximum Performance of a Team",
    brief:
      "<p>There are <code>n</code> engineers; engineer <code>i</code> has <code>speed[i]</code> and <code>efficiency[i]</code>. Pick <b>at most</b> <code>k</code> of them to maximise the team's performance, defined as the <em>sum of their speeds</em> multiplied by the <em>minimum efficiency</em> among the chosen engineers.</p><ul><li>You may pick fewer than <code>k</code> engineers if that is better</li><li>Return the maximum performance as a plain number — the test inputs are small enough that no modulo is needed</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction maxPerformance(n, speed, efficiency, k) {\n  // TODO: fix the minimum efficiency first, then maximise the speed sum\n}\n",
    hints: [
      "The formula has two moving parts. Pin one of them down: suppose engineer i is the LEAST efficient member of the team.",
      "Sort engineers by efficiency descending. When you reach engineer i, everyone already seen has efficiency at least as high, so any team drawn from them has minimum efficiency efficiency[i].",
      "Keep the k fastest of those in a min-heap of speeds with a running sum; evict the slowest when the heap exceeds k, and score sum * efficiency[i] at every step.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction maxPerformance(n, speed, efficiency, k) {\n  const order = efficiency.map((_, i) => i).sort((a, b) => efficiency[b] - efficiency[a]);\n  const speeds = new MinHeap();\n  let sum = 0;\n  let best = 0;\n  for (const i of order) {\n    speeds.push(speed[i]);\n    sum += speed[i];\n    if (speeds.size() > k) sum -= speeds.pop();\n    best = Math.max(best, sum * efficiency[i]);\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "team of at most two",
        body: "assert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 2), 60);",
      },
      {
        name: "team of at most three",
        body: "assert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 3), 68);",
      },
      {
        name: "k equal to n — everyone is allowed",
        body: "assert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 6), 72);\nassert.equal(maxPerformance(6, [2,10,3,1,5,8], [5,4,3,9,7,2], 4), 72);",
      },
      {
        name: "k of one picks the best single engineer",
        body: "assert.equal(maxPerformance(3, [2,8,2], [2,7,1], 1), 56);",
      },
      {
        name: "a single engineer, and fewer than k is sometimes better",
        body: "assert.equal(maxPerformance(1, [5], [4], 1), 20);\nassert.equal(maxPerformance(2, [10,1], [10,1], 2), 100);",
      },
    ],
  },
{
    id: "ex-min-cost-connect-sticks",
    chapter: "dsa-heaps-priority-queues",
    level: "intermediate",
    title: "Minimum Cost to Connect Sticks",
    brief:
      "<p>You have sticks of the given lengths. Connecting two sticks of lengths <code>x</code> and <code>y</code> costs <code>x + y</code> and produces a single stick of length <code>x + y</code>. Return the minimum total cost of joining them all into one stick.</p><ul><li>You may connect the sticks in any order</li><li>Zero or one stick costs <code>0</code> — there is nothing to join</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction connectSticks(sticks) {\n  // TODO: which two sticks should you join first, and why?\n}\n",
    hints: [
      "A stick's length is paid again in every later join it takes part in — so short sticks should be combined early, while the total is still small.",
      "Greedily join the two SHORTEST remaining sticks, then drop the result back into the pool.",
      "Sorting once is not enough because each new stick has to slot back into the ordering — that is exactly what a min-heap gives you.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction connectSticks(sticks) {\n  const heap = new MinHeap();\n  for (const s of sticks) heap.push(s);\n  let cost = 0;\n  while (heap.size() > 1) {\n    const joined = heap.pop() + heap.pop();\n    cost += joined;\n    heap.push(joined);\n  }\n  return cost;\n}\n",
    tests: [
      {
        name: "three sticks",
        body: "assert.equal(connectSticks([2,4,3]), 14);",
      },
      {
        name: "four sticks — order matters",
        body: "assert.equal(connectSticks([1,8,3,5]), 30);",
      },
      {
        name: "nothing to join",
        body: "assert.equal(connectSticks([5]), 0);\nassert.equal(connectSticks([]), 0);",
      },
      {
        name: "two sticks cost their sum",
        body: "assert.equal(connectSticks([1,1]), 2);\nassert.equal(connectSticks([3,7]), 10);",
      },
      {
        name: "one long stick among short ones",
        body: "assert.equal(connectSticks([1,2,3,4,5]), 33);",
      },
    ],
  },
{
    id: "ex-furthest-building-you-can-reach",
    chapter: "dsa-heaps-priority-queues",
    level: "advanced",
    title: "Furthest Building You Can Reach",
    brief:
      "<p>You walk along a row of buildings with the given <code>heights</code>, starting at index <code>0</code> and always moving to the next building. You carry <code>bricks</code> bricks and <code>ladders</code> ladders.</p><ul><li>Stepping down or onto an equal height is free</li><li>Stepping up by <code>d</code> costs either <code>d</code> bricks or one ladder</li><li>A ladder covers any height difference; bricks are consumed permanently</li><li>Return the index of the furthest building you can reach</li><li>A <code>MinHeap</code> class is <b>already written for you</b> in the starter — you only need the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction furthestBuilding(heights, bricks, ladders) {\n  // TODO: ladders are worth the most on the biggest climbs — but you find those later\n}\n",
    hints: [
      "Only the upward jumps matter; flat and downhill steps are free and can be skipped entirely.",
      "Ladders should end up on the largest jumps overall, but you cannot know which those are until you have walked further — so commit tentatively and revise.",
      "Assume every climb uses a ladder and hold those climbs in a MIN heap. Once you hold more than `ladders` of them, the smallest one is demoted: pop it and pay for it with bricks. If bricks go negative, you are stuck at the previous building.",
    ],
    solution:
      "class MinHeap {\n  constructor(cmp) { this.a = []; this.cmp = cmp || function (x, y) { return x - y; }; }\n  size() { return this.a.length; }\n  peek() { return this.a[0]; }\n  push(v) {\n    const a = this.a;\n    a.push(v);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (this.cmp(a[i], a[p]) >= 0) break;\n      const t = a[i]; a[i] = a[p]; a[p] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.a;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1, r = l + 1;\n        let m = i;\n        if (l < a.length && this.cmp(a[l], a[m]) < 0) m = l;\n        if (r < a.length && this.cmp(a[r], a[m]) < 0) m = r;\n        if (m === i) break;\n        const t = a[i]; a[i] = a[m]; a[m] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction furthestBuilding(heights, bricks, ladders) {\n  const climbs = new MinHeap();\n  let remaining = bricks;\n  for (let i = 0; i + 1 < heights.length; i++) {\n    const diff = heights[i + 1] - heights[i];\n    if (diff <= 0) continue;\n    climbs.push(diff);\n    if (climbs.size() > ladders) remaining -= climbs.pop();\n    if (remaining < 0) return i;\n  }\n  return heights.length - 1;\n}\n",
    tests: [
      {
        name: "the ladder must be saved for the biggest climb",
        body: "assert.equal(furthestBuilding([4,2,7,6,9,14,12], 5, 1), 4);",
      },
      {
        name: "two ladders reach further",
        body: "assert.equal(furthestBuilding([4,12,2,7,3,18,20,3,19], 10, 2), 7);",
      },
      {
        name: "bricks alone are enough",
        body: "assert.equal(furthestBuilding([14,3,19,3], 17, 0), 3);",
      },
      {
        name: "stuck immediately with no resources",
        body: "assert.equal(furthestBuilding([1,2,3], 0, 0), 0);\nassert.equal(furthestBuilding([1,5,1,2], 0, 1), 2);",
      },
      {
        name: "flat and downhill walks are always free",
        body: "assert.equal(furthestBuilding([1,1,1], 0, 0), 2);\nassert.equal(furthestBuilding([9,5,2], 0, 0), 2);\nassert.equal(furthestBuilding([7], 0, 0), 0);",
      },
    ],
  },
{
    id: "ex-valid-anagram",
    chapter: "dsa-hashing",
    level: "beginner",
    title: "Valid Anagram",
    brief:
      "<p>Two words are anagrams when one is a rearrangement of the other: the same letters, each used the same number of times. Write <code>isAnagram(s, t)</code> which returns <code>true</code> when <code>t</code> is an anagram of <code>s</code>.</p><ul><li>Comparison is case-sensitive and every character counts, including repeats</li><li>Two empty strings are anagrams of each other</li><li>Strings of different lengths can never be anagrams</li></ul>",
    starter: "function isAnagram(s, t) {\n  // TODO: decide whether t uses exactly the same characters as s\n}\n",
    hints: [
      "Sorting both strings works and is easy to reason about, but it costs O(n log n). What cheaper summary of a string is identical for any two anagrams?",
      "A frequency table keyed by character is enough. Build it once for s.",
      "Walk t and decrement each count. If a count ever drops below zero — or a character is missing entirely — you can stop early.",
    ],
    solution:
      "function isAnagram(s, t) {\n  if (s.length !== t.length) return false;\n  const counts = new Map();\n  for (const c of s) counts.set(c, (counts.get(c) || 0) + 1);\n  for (const c of t) {\n    const n = counts.get(c);\n    if (!n) return false;\n    counts.set(c, n - 1);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "recognises a genuine anagram",
        body: "assert.equal(isAnagram('anagram', 'nagaram'), true);",
      },
      {
        name: "rejects different letters",
        body: "assert.equal(isAnagram('rat', 'car'), false);",
      },
      {
        name: "rejects different lengths",
        body: "assert.equal(isAnagram('a', 'ab'), false);\nassert.equal(isAnagram('ab', 'a'), false);",
      },
      {
        name: "counts repeats, not just the letter set",
        body: "assert.equal(isAnagram('aacc', 'ccac'), false);\nassert.equal(isAnagram('aabb', 'bbaa'), true);",
      },
      {
        name: "two empty strings are anagrams",
        body: "assert.equal(isAnagram('', ''), true);",
      },
    ],
  },
{
    id: "ex-valid-palindrome",
    chapter: "dsa-two-pointers",
    level: "beginner",
    title: "Valid Palindrome",
    brief:
      "<p>Write <code>isPalindrome(s)</code>. Ignore every character that is not a letter or a digit, treat upper and lower case as equal, and report whether what is left reads the same forwards and backwards.</p><ul><li>Punctuation and spaces are skipped entirely, not replaced</li><li>Digits do count as content</li><li>A string with no alphanumeric characters at all is a palindrome</li><li>Aim for O(1) extra space — do not build a cleaned copy of the string</li></ul>",
    starter: "function isPalindrome(s) {\n  // TODO: compare the string against itself from both ends\n}\n",
    hints: [
      "Two indices, one at each end, walking toward each other, is enough — no cleaned copy needed.",
      "Before comparing, advance each pointer past any character that is not a letter or digit.",
      "Guard the skip loops with the same 'left < right' condition so a string of pure punctuation cannot run a pointer off the end.",
    ],
    solution:
      "function isPalindrome(s) {\n  const isAlnum = (c) =>\n    (c >= '0' && c <= '9') || (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z');\n  let i = 0;\n  let j = s.length - 1;\n  while (i < j) {\n    while (i < j && !isAlnum(s[i])) i++;\n    while (i < j && !isAlnum(s[j])) j--;\n    if (s[i].toLowerCase() !== s[j].toLowerCase()) return false;\n    i++;\n    j--;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "ignores case and punctuation",
        body: "assert.equal(isPalindrome('A man, a plan, a canal: Panama'), true);",
      },
      {
        name: "rejects a non-palindrome",
        body: "assert.equal(isPalindrome('race a car'), false);\nassert.equal(isPalindrome('hello'), false);",
      },
      {
        name: "blank and punctuation-only strings are palindromes",
        body: "assert.equal(isPalindrome(''), true);\nassert.equal(isPalindrome(' '), true);\nassert.equal(isPalindrome('.,;!'), true);",
      },
      {
        name: "digits are part of the content",
        body: "assert.equal(isPalindrome('0P'), false);\nassert.equal(isPalindrome('1a2!2a1'), true);",
      },
      {
        name: "single character",
        body: "assert.equal(isPalindrome('z'), true);",
      },
    ],
  },
{
    id: "ex-longest-common-prefix",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Longest Common Prefix",
    brief:
      "<p>Given an array of strings, return the longest string that every one of them starts with. Write <code>longestCommonPrefix(strs)</code>.</p><ul><li>If the strings share no starting characters, return the empty string</li><li>An empty array also yields the empty string</li><li>Any empty string in the array forces the answer to be empty</li></ul>",
    starter: "function longestCommonPrefix(strs) {\n  // TODO: return the prefix shared by every string in strs\n}\n",
    hints: [
      "The answer can never be longer than the shortest string in the array.",
      "Take the first string as a candidate prefix and shrink it against each remaining string.",
      "Alternatively compare column by column: check index 0 across all strings, then index 1, stopping at the first mismatch or the first string that has run out.",
    ],
    solution:
      "function longestCommonPrefix(strs) {\n  if (!strs || strs.length === 0) return '';\n  let prefix = strs[0];\n  for (let i = 1; i < strs.length; i++) {\n    let k = 0;\n    const s = strs[i];\n    while (k < prefix.length && k < s.length && prefix[k] === s[k]) k++;\n    prefix = prefix.slice(0, k);\n    if (prefix === '') return '';\n  }\n  return prefix;\n}\n",
    tests: [
      {
        name: "finds a shared prefix",
        body: "assert.equal(longestCommonPrefix(['flower', 'flow', 'flight']), 'fl');\nassert.equal(longestCommonPrefix(['interspecies', 'interstellar', 'interstate']), 'inters');",
      },
      {
        name: "returns empty when nothing is shared",
        body: "assert.equal(longestCommonPrefix(['dog', 'racecar', 'car']), '');",
      },
      {
        name: "handles an empty string in the array",
        body: "assert.equal(longestCommonPrefix(['', 'abc']), '');\nassert.equal(longestCommonPrefix(['abc', '']), '');",
      },
      {
        name: "single string is its own prefix",
        body: "assert.equal(longestCommonPrefix(['alone']), 'alone');",
      },
      {
        name: "empty array",
        body: "assert.equal(longestCommonPrefix([]), '');",
      },
    ],
  },
{
    id: "ex-reverse-string-in-place",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Reverse String In Place",
    brief:
      "<p>You are handed an array of single-character strings. Write <code>reverseString(chars)</code> so that the array itself ends up reversed.</p><ul><li>Mutate the array you were given — do not build and return a new one</li><li>Use O(1) extra space; <code>slice</code>, <code>reverse</code> and friends defeat the point</li><li>The return value is not checked, but returning the same array is fine</li></ul>",
    starter: "function reverseString(chars) {\n  // TODO: reverse chars in place\n}\n",
    hints: [
      "Only half the array needs to move — each swap places two characters at once.",
      "Keep an index at the front and one at the back, swap what they point at, then step both inward until they meet.",
    ],
    solution:
      "function reverseString(chars) {\n  let i = 0;\n  let j = chars.length - 1;\n  while (i < j) {\n    const tmp = chars[i];\n    chars[i] = chars[j];\n    chars[j] = tmp;\n    i++;\n    j--;\n  }\n  return chars;\n}\n",
    tests: [
      {
        name: "mutates the caller's array",
        body: "const arr = ['h', 'e', 'l', 'l', 'o'];\nreverseString(arr);\nassert.deepEqual(arr, ['o', 'l', 'l', 'e', 'h'], 'the original array must be reversed in place');",
      },
      {
        name: "does not replace the array with a new one",
        body: "const arr = ['a', 'b', 'c'];\nconst out = reverseString(arr);\nassert.ok(out === undefined || out === arr, 'return the same array or nothing at all');\nassert.deepEqual(arr, ['c', 'b', 'a']);",
      },
      {
        name: "even length",
        body: "const arr = ['H', 'a', 'n', 'n', 'a', 'h'];\nreverseString(arr);\nassert.deepEqual(arr, ['h', 'a', 'n', 'n', 'a', 'H']);",
      },
      {
        name: "single element and empty array",
        body: "const one = ['x'];\nreverseString(one);\nassert.deepEqual(one, ['x']);\nconst none = [];\nreverseString(none);\nassert.deepEqual(none, []);",
      },
    ],
  },
{
    id: "ex-reverse-words-in-string",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Reverse Words in a String",
    brief:
      "<p>Write <code>reverseWords(s)</code>. A word is any run of non-space characters. Return the words in the opposite order, joined by a single space.</p><ul><li>Leading and trailing spaces must not appear in the result</li><li>Runs of several spaces between words collapse to one</li><li>The letters inside each word keep their order — only the words move</li><li>A string of nothing but spaces returns the empty string</li></ul>",
    starter: "function reverseWords(s) {\n  // TODO: return the words of s in reverse order, single-spaced\n}\n",
    hints: [
      "Splitting on a single space leaves empty entries wherever two spaces sat next to each other.",
      "Filter those empties out after splitting — or scan the string yourself and collect each run of non-space characters.",
      "Once you have a clean array of words, reversing and joining with ' ' finishes the job.",
    ],
    solution:
      "function reverseWords(s) {\n  const words = [];\n  let i = 0;\n  while (i < s.length) {\n    while (i < s.length && s[i] === ' ') i++;\n    let start = i;\n    while (i < s.length && s[i] !== ' ') i++;\n    if (i > start) words.push(s.slice(start, i));\n  }\n  let out = '';\n  for (let k = words.length - 1; k >= 0; k--) {\n    out += words[k];\n    if (k > 0) out += ' ';\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "reverses simple word order",
        body: "assert.equal(reverseWords('the sky is blue'), 'blue is sky the');",
      },
      {
        name: "trims leading and trailing spaces",
        body: "assert.equal(reverseWords('  hello world  '), 'world hello');",
      },
      {
        name: "collapses repeated inner spaces",
        body: "assert.equal(reverseWords('a good   example'), 'example good a');",
      },
      {
        name: "single word and blank input",
        body: "assert.equal(reverseWords('solo'), 'solo');\nassert.equal(reverseWords('   '), '');\nassert.equal(reverseWords(''), '');",
      },
      {
        name: "letters inside words are untouched",
        body: "assert.equal(reverseWords('  abc  def '), 'def abc');",
      },
    ],
  },
{
    id: "ex-implement-strstr",
    chapter: "dsa-string-algorithms",
    level: "intermediate",
    title: "Implement indexOf (strStr)",
    brief:
      "<p>Write <code>strStr(haystack, needle)</code> returning the index of the first occurrence of <code>needle</code> inside <code>haystack</code>, or <code>-1</code> when it does not occur.</p><ul><li>An empty <code>needle</code> matches at index <code>0</code></li><li>Matches may overlap earlier partial matches, so a failed comparison must not skip characters blindly</li><li>Do not call the built-in <code>indexOf</code>, <code>includes</code> or <code>search</code></li></ul>",
    starter:
      "function strStr(haystack, needle) {\n  // TODO: return the first index where needle starts inside haystack, else -1\n}\n",
    hints: [
      "The last position worth trying is haystack.length - needle.length; past that the needle cannot fit.",
      "For each start position, compare characters one by one and abandon the attempt on the first mismatch.",
      "Watch inputs like ('aaab', 'aab') — after a failed attempt you must resume from the next start index, not from where the mismatch happened.",
    ],
    solution:
      "function strStr(haystack, needle) {\n  const n = haystack.length;\n  const m = needle.length;\n  if (m === 0) return 0;\n  if (m > n) return -1;\n  for (let i = 0; i <= n - m; i++) {\n    let k = 0;\n    while (k < m && haystack[i + k] === needle[k]) k++;\n    if (k === m) return i;\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "finds the first occurrence",
        body: "assert.equal(strStr('sadbutsad', 'sad'), 0);\nassert.equal(strStr('mississippi', 'issip'), 4);",
      },
      {
        name: "returns -1 when absent",
        body: "assert.equal(strStr('leetcode', 'leeto'), -1);\nassert.equal(strStr('abc', 'abcd'), -1);",
      },
      {
        name: "empty needle matches at 0",
        body: "assert.equal(strStr('abc', ''), 0);\nassert.equal(strStr('', ''), 0);",
      },
      {
        name: "recovers from a partial match",
        body: "assert.equal(strStr('aaab', 'aab'), 1);\nassert.equal(strStr('ababab', 'abab'), 0);",
      },
      {
        name: "needle longer than haystack",
        body: "assert.equal(strStr('a', 'aa'), -1);",
      },
    ],
  },
{
    id: "ex-longest-palindromic-substring",
    chapter: "dsa-two-pointers",
    level: "advanced",
    title: "Longest Palindromic Substring",
    brief:
      "<p>Write <code>longestPalindrome(s)</code> returning the longest contiguous slice of <code>s</code> that reads the same in both directions.</p><ul><li>If several slices tie for longest, returning any one of them is correct</li><li>Palindromes can have odd length (a centre character) or even length (a centre gap)</li><li>The empty string yields the empty string; a single character is its own answer</li><li>Checking every substring is O(n^3) — aim for O(n^2) time and O(1) space</li></ul>",
    starter: "function longestPalindrome(s) {\n  // TODO: return the longest palindromic substring of s\n}\n",
    hints: [
      "Every palindrome grows outward from a centre. How many centres does a string of length n have?",
      "There are 2n - 1 of them: n single characters and n - 1 gaps between neighbours. Expand from each while the characters on both sides still match.",
      "Keep only the best start index and length as you go, and slice once at the end — no need to store the candidate strings.",
    ],
    solution:
      "function longestPalindrome(s) {\n  if (s.length < 2) return s;\n  let bestStart = 0;\n  let bestLen = 1;\n  const expand = (lo, hi) => {\n    while (lo >= 0 && hi < s.length && s[lo] === s[hi]) {\n      lo--;\n      hi++;\n    }\n    const len = hi - lo - 1;\n    if (len > bestLen) {\n      bestLen = len;\n      bestStart = lo + 1;\n    }\n  };\n  for (let i = 0; i < s.length; i++) {\n    expand(i, i);\n    expand(i, i + 1);\n  }\n  return s.slice(bestStart, bestStart + bestLen);\n}\n",
    tests: [
      {
        name: "odd-length palindrome, ties allowed",
        body: "const s = 'babad';\nconst r = longestPalindrome(s);\nassert.type(r, 'string');\nassert.equal(r.length, 3, 'the longest palindrome here has length 3');\nassert.ok(s.indexOf(r) !== -1, 'the answer must be a substring of the input');\nassert.equal(r, r.split('').reverse().join(''), 'the answer must be a palindrome');",
      },
      {
        name: "even-length palindrome",
        body: "const s = 'cbbd';\nconst r = longestPalindrome(s);\nassert.equal(r.length, 2);\nassert.ok(s.indexOf(r) !== -1);\nassert.equal(r, r.split('').reverse().join(''));",
      },
      {
        name: "whole string is a palindrome",
        body: "assert.equal(longestPalindrome('aaaa'), 'aaaa');\nconst r = longestPalindrome('forgeeksskeegfor');\nassert.equal(r.length, 10);\nassert.equal(r, r.split('').reverse().join(''));",
      },
      {
        name: "no repeats means any single character wins",
        body: "const s = 'abcde';\nconst r = longestPalindrome(s);\nassert.equal(r.length, 1);\nassert.ok(s.indexOf(r) !== -1);",
      },
      {
        name: "empty and single-character input",
        body: "assert.equal(longestPalindrome(''), '');\nassert.equal(longestPalindrome('q'), 'q');",
      },
    ],
  },
{
    id: "ex-longest-substring-no-repeat",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Longest Substring Without Repeating Characters",
    brief:
      "<p>Write <code>lengthOfLongestSubstring(s)</code> returning the length of the longest contiguous stretch of <code>s</code> in which no character appears twice.</p><ul><li>Return a number, not the substring itself</li><li>The empty string answers <code>0</code></li><li>Spaces, digits and symbols are ordinary characters here</li><li>One pass over the string is enough</li></ul>",
    starter:
      "function lengthOfLongestSubstring(s) {\n  // TODO: return the length of the longest duplicate-free window\n}\n",
    hints: [
      "Keep a window [left, right] that is always duplicate-free, and extend right one character at a time.",
      "When the new character is already inside the window, the left edge has to move past its previous position.",
      "Storing each character's most recent index in a Map lets you jump left straight there instead of shrinking one step at a time — but only move left forward, never backward.",
    ],
    solution:
      "function lengthOfLongestSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0;\n  let best = 0;\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    if (lastSeen.has(c) && lastSeen.get(c) >= left) {\n      left = lastSeen.get(c) + 1;\n    }\n    lastSeen.set(c, right);\n    const len = right - left + 1;\n    if (len > best) best = len;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "typical case",
        body: "assert.equal(lengthOfLongestSubstring('abcabcbb'), 3);",
      },
      {
        name: "all identical characters",
        body: "assert.equal(lengthOfLongestSubstring('bbbbb'), 1);",
      },
      {
        name: "the window must not be a subsequence",
        body: "assert.equal(lengthOfLongestSubstring('pwwkew'), 3);\nassert.equal(lengthOfLongestSubstring('dvdf'), 3);",
      },
      {
        name: "empty string and no repeats at all",
        body: "assert.equal(lengthOfLongestSubstring(''), 0);\nassert.equal(lengthOfLongestSubstring('abcdef'), 6);",
      },
      {
        name: "spaces and symbols count",
        body: "assert.equal(lengthOfLongestSubstring('a b!a b'), 4);",
      },
    ],
  },
];
