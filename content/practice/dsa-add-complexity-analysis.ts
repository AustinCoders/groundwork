import type { Exercise } from "../types";

export const dsaAddComplexityAnalysis: Exercise[] = [
{
  "id": "ex-loop-iteration-counts",
  "chapter": "dsa-complexity-analysis",
  "level": "beginner",
  "title": "How Many Times Does the Body Run?",
  "brief": "<p>Write <code>loopIterations(shape, n)</code> that returns the <b>exact</b> number of times the body of one of four loops runs, for a non-negative integer <code>n</code>.</p><ul><li><code>\"doubling\"</code>: <code>for (let i = 1; i &lt; n; i *= 2)</code></li><li><code>\"halving\"</code>: <code>for (let m = n; m &gt; 0; m = Math.floor(m / 2))</code></li><li><code>\"sqrt\"</code>: <code>for (let i = 2; i * i &lt;= n; i++)</code></li><li><code>\"harmonic\"</code>: <code>for (let i = 1; i &lt;= n; i++) for (let j = i; j &lt;= n; j += i)</code>, counting the inner body</li></ul><p>The tests use values of <code>n</code> up to 10<sup>12</sup> for the first three shapes, so do not run the loop for <code>\"sqrt\"</code>: work out how many steps it takes and compute that directly. The harmonic loop is checked up to n = 10<sup>6</sup>.</p>",
  "starter": "function loopIterations(shape, n) {\n  // TODO: count how many times the loop body runs for this shape\n}\n",
  "hints": [
    "Doubling and halving both take about log2(n) steps, so even for n = 10^12 you can afford to simulate the variable itself, as long as you do not simulate anything that runs n times.",
    "For the square-root loop the condition i * i <= n is the same as i <= sqrt(n). The body runs for i = 2 up to floor(sqrt(n)), so that is floor(sqrt(n)) - 1 times (and never fewer than 0). Math.sqrt can land a hair off for huge n, so nudge the result up or down until i * i <= n < (i + 1) * (i + 1).",
    "For the harmonic loop, the inner body runs floor(n / i) times for each i, because j takes the values i, 2i, 3i, ... up to n. Add those up instead of running the inner loop."
  ],
  "solution": "function loopIterations(shape, n) {\n  if (shape === \"doubling\") {\n    let steps = 0;\n    for (let i = 1; i < n; i *= 2) steps++;\n    return steps;\n  }\n  if (shape === \"halving\") {\n    let steps = 0;\n    for (let m = n; m > 0; m = Math.floor(m / 2)) steps++;\n    return steps;\n  }\n  if (shape === \"sqrt\") {\n    let root = Math.floor(Math.sqrt(n));\n    while (root * root > n) root--;\n    while ((root + 1) * (root + 1) <= n) root++;\n    return Math.max(0, root - 1);\n  }\n  if (shape === \"harmonic\") {\n    let total = 0;\n    for (let i = 1; i <= n; i++) total += Math.floor(n / i);\n    return total;\n  }\n  throw new Error(\"unknown shape \" + shape);\n}\n",
  "tests": [
    {
      "name": "small values match the real loops",
      "body": "const real = {\n  doubling: (n) => { let c = 0; for (let i = 1; i < n; i *= 2) c++; return c; },\n  halving: (n) => { let c = 0; for (let m = n; m > 0; m = Math.floor(m / 2)) c++; return c; },\n  sqrt: (n) => { let c = 0; for (let i = 2; i * i <= n; i++) c++; return c; },\n  harmonic: (n) => { let c = 0; for (let i = 1; i <= n; i++) for (let j = i; j <= n; j += i) c++; return c; },\n};\nfor (const shape of Object.keys(real)) {\n  for (let n = 0; n <= 120; n++) {\n    assert.equal(loopIterations(shape, n), real[shape](n), shape + \" at n = \" + n);\n  }\n}"
    },
    {
      "name": "doubling is ceil(log2 n)",
      "body": "assert.equal(loopIterations(\"doubling\", 1000), 10);\nassert.equal(loopIterations(\"doubling\", 1024), 10);\nassert.equal(loopIterations(\"doubling\", 1025), 11);\nassert.equal(loopIterations(\"doubling\", 1e9), 30);"
    },
    {
      "name": "halving is the bit length",
      "body": "assert.equal(loopIterations(\"halving\", 0), 0);\nassert.equal(loopIterations(\"halving\", 1), 1);\nassert.equal(loopIterations(\"halving\", 255), 8);\nassert.equal(loopIterations(\"halving\", 256), 9);"
    },
    {
      "name": "sqrt on small and degenerate inputs",
      "body": "assert.equal(loopIterations(\"sqrt\", 0), 0);\nassert.equal(loopIterations(\"sqrt\", 1), 0);\nassert.equal(loopIterations(\"sqrt\", 3), 0);\nassert.equal(loopIterations(\"sqrt\", 4), 1);\nassert.equal(loopIterations(\"sqrt\", 1e6), 999);"
    },
    {
      "name": "sqrt is fast for huge n",
      "body": "assert.equal(loopIterations(\"sqrt\", 1e12), 999999);\nassert.equal(loopIterations(\"sqrt\", 1e12 - 1), 999998);\nassert.equal(loopIterations(\"sqrt\", 999999999999), 999998);"
    },
    {
      "name": "doubling and halving are fast for huge n",
      "body": "assert.equal(loopIterations(\"doubling\", 2 ** 40), 40);\nassert.equal(loopIterations(\"doubling\", 1e12), 40);\nassert.equal(loopIterations(\"halving\", 2 ** 40), 41);"
    },
    {
      "name": "harmonic reproduces the counts from the chapter",
      "body": "assert.equal(loopIterations(\"harmonic\", 10), 27);\nassert.equal(loopIterations(\"harmonic\", 100), 482);\nassert.equal(loopIterations(\"harmonic\", 1000), 7069);\nassert.equal(loopIterations(\"harmonic\", 10000), 93668);"
    },
    {
      "name": "harmonic stays near n ln n for a million",
      "body": "const n = 1e6;\nconst got = loopIterations(\"harmonic\", n);\nassert.ok(got > n * Math.log(n) * 0.9 && got < n * Math.log(n) * 1.1, \"got \" + got);"
    }
  ]
},
{
  "id": "ex-fib-call-count-and-depth",
  "chapter": "dsa-complexity-analysis",
  "level": "beginner",
  "title": "Naive Fibonacci: Calls and Stack Depth",
  "brief": "<p>The naive recursive Fibonacci is the textbook example of a function whose <em>time</em> and <em>space</em> are very different:</p><pre><code>function fib(n) {\n  if (n &lt; 2) return n;\n  return fib(n - 1) + fib(n - 2);\n}</code></pre><p>Write <code>fibCosts(n)</code> that returns <code>{ calls, depth }</code> for one top-level call <code>fib(n)</code>:</p><ul><li><code>calls</code>: the total number of times <code>fib</code> is called, counting the top-level call and every call that hits the base case</li><li><code>depth</code>: the largest number of <code>fib</code> frames on the call stack at the same moment, counting the top-level frame</li></ul><p>Do not run <code>fib</code>. The tests go up to <code>n = 60</code>, where it would make over five trillion calls. Write a recurrence for each number and compute it in O(n).</p>",
  "starter": "function fibCosts(n) {\n  // TODO: return { calls, depth } without running fib itself\n}\n",
  "hints": [
    "One call to fib(n) is the call itself plus all the calls made by fib(n - 1) and by fib(n - 2). For n below 2 it is just that one call.",
    "Depth is different: the two child calls do not run at the same time, so the stack is as deep as the deeper child, plus one frame for the caller. Keep a pair of values for n - 1 and n - 2 and walk up from the base cases.",
    "Use a loop from 2 to n that keeps the previous two (calls, depth) pairs. The numbers stay below 2^53 up to n = 60, so plain Numbers are exact."
  ],
  "solution": "function fibCosts(n) {\n  let older = { calls: 1, depth: 1 };\n  let newer = { calls: 1, depth: 1 };\n  if (n < 2) return { calls: 1, depth: 1 };\n  for (let k = 2; k <= n; k++) {\n    const next = {\n      calls: 1 + newer.calls + older.calls,\n      depth: 1 + Math.max(newer.depth, older.depth),\n    };\n    older = newer;\n    newer = next;\n  }\n  return newer;\n}\n",
  "tests": [
    {
      "name": "base cases",
      "body": "assert.deepEqual(fibCosts(0), { calls: 1, depth: 1 });\nassert.deepEqual(fibCosts(1), { calls: 1, depth: 1 });"
    },
    {
      "name": "n = 2 and n = 3",
      "body": "assert.deepEqual(fibCosts(2), { calls: 3, depth: 2 });\nassert.deepEqual(fibCosts(3), { calls: 5, depth: 3 });"
    },
    {
      "name": "matches a real counting run for small n",
      "body": "for (let n = 0; n <= 20; n++) {\n  let calls = 0, live = 0, deepest = 0;\n  const fib = (k) => {\n    calls++; live++;\n    if (live > deepest) deepest = live;\n    const value = k < 2 ? k : fib(k - 1) + fib(k - 2);\n    live--;\n    return value;\n  };\n  fib(n);\n  assert.deepEqual(fibCosts(n), { calls, depth: deepest }, \"n = \" + n);\n}"
    },
    {
      "name": "the chapter table: 177 calls at n = 10",
      "body": "assert.equal(fibCosts(10).calls, 177);\nassert.equal(fibCosts(20).calls, 21891);\nassert.equal(fibCosts(30).calls, 2692537);"
    },
    {
      "name": "depth grows by one per step, not exponentially",
      "body": "assert.equal(fibCosts(30).depth, 30);\nassert.equal(fibCosts(60).depth, 60);"
    },
    {
      "name": "calls grow exponentially",
      "body": "assert.equal(fibCosts(60).calls, 5009461563921);\nassert.ok(fibCosts(40).calls > 2 * fibCosts(38).calls);"
    },
    {
      "name": "returns plain numbers",
      "body": "const r = fibCosts(12);\nassert.type(r.calls, \"number\");\nassert.type(r.depth, \"number\");"
    }
  ]
},
{
  "id": "ex-master-theorem-solver",
  "chapter": "dsa-complexity-analysis",
  "level": "beginner",
  "title": "Solve the Recurrence",
  "brief": "<p>Write <code>solveRecurrence(a, b, d)</code> that applies the master theorem to <code>T(n) = a * T(n / b) + O(n^d)</code>, with <code>a &gt;= 1</code>, <code>b &gt;= 2</code> and <code>d &gt;= 0</code>, and returns the answer as a string in exactly this format:</p><ul><li>combine step dominates (<code>d &gt; log_b(a)</code>): <code>\"O(n^d)\"</code></li><li>balanced (<code>d = log_b(a)</code>): <code>\"O(n^d log n)\"</code></li><li>recursion dominates (<code>d &lt; log_b(a)</code>): <code>\"O(n^e)\"</code> with e = log_b(a)</li></ul><p>Write the exponent as a number rounded to 3 decimals, with trailing zeros dropped (<code>2</code>, <code>1.585</code>). Two special spellings: an exponent of 1 is written <code>n</code> (so <code>\"O(n)\"</code> and <code>\"O(n log n)\"</code>), and an exponent of 0 with the log factor is written <code>\"O(log n)\"</code>.</p><p>Beware of floating-point: <code>Math.log(1000) / Math.log(10)</code> is not exactly 3 in JavaScript.</p>",
  "starter": "function solveRecurrence(a, b, d) {\n  // TODO: compare d with log_b(a), then format the answer\n}\n",
  "hints": [
    "Compute e = Math.log(a) / Math.log(b), then compare it with d. Merge sort is a = 2, b = 2, d = 1, where e is exactly 1.",
    "Never compare the two with ===. Treat them as equal when they differ by less than a tiny tolerance such as 1e-9; otherwise the 1000-and-10 case lands in the wrong branch.",
    "Pick the exponent (d when the combine step dominates or the case is balanced, e otherwise), round it with Math.round(x * 1000) / 1000, turn the number into text with String(), and handle the exponent 0 and 1 spellings last."
  ],
  "solution": "function solveRecurrence(a, b, d) {\n  const e = Math.log(a) / Math.log(b);\n  const balanced = Math.abs(e - d) < 1e-9;\n  const exponent = balanced || d > e ? d : e;\n  const rounded = Math.round(exponent * 1000) / 1000;\n  const power = rounded === 0 ? \"\" : rounded === 1 ? \"n\" : \"n^\" + String(rounded);\n  if (balanced) return power === \"\" ? \"O(log n)\" : \"O(\" + power + \" log n)\";\n  return \"O(\" + power + \")\";\n}\n",
  "tests": [
    {
      "name": "merge sort is balanced",
      "body": "assert.equal(solveRecurrence(2, 2, 1), \"O(n log n)\");"
    },
    {
      "name": "binary search",
      "body": "assert.equal(solveRecurrence(1, 2, 0), \"O(log n)\");"
    },
    {
      "name": "tree traversal: recursion dominates, linear",
      "body": "assert.equal(solveRecurrence(2, 2, 0), \"O(n)\");"
    },
    {
      "name": "combine step dominates",
      "body": "assert.equal(solveRecurrence(1, 2, 1), \"O(n)\");\nassert.equal(solveRecurrence(1, 2, 2), \"O(n^2)\");\nassert.equal(solveRecurrence(2, 4, 3), \"O(n^3)\");"
    },
    {
      "name": "recursion dominates with a whole exponent",
      "body": "assert.equal(solveRecurrence(4, 2, 1), \"O(n^2)\");\nassert.equal(solveRecurrence(8, 2, 2), \"O(n^3)\");"
    },
    {
      "name": "recursion dominates with a fractional exponent",
      "body": "assert.equal(solveRecurrence(3, 2, 1), \"O(n^1.585)\");\nassert.equal(solveRecurrence(7, 2, 2), \"O(n^2.807)\");"
    },
    {
      "name": "balanced with a bigger exponent",
      "body": "assert.equal(solveRecurrence(4, 2, 2), \"O(n^2 log n)\");\nassert.equal(solveRecurrence(9, 3, 2), \"O(n^2 log n)\");\nassert.equal(solveRecurrence(8, 2, 3), \"O(n^3 log n)\");"
    },
    {
      "name": "floating-point trap: log_10(1000) is not exactly 3",
      "body": "assert.equal(solveRecurrence(1000, 10, 3), \"O(n^3 log n)\");\nassert.equal(solveRecurrence(125, 5, 3), \"O(n^3 log n)\");"
    }
  ]
},
{
  "id": "ex-amortized-push-cost",
  "chapter": "dsa-complexity-analysis",
  "level": "beginner",
  "title": "The True Cost of n Pushes",
  "brief": "<p>A dynamic array starts with capacity <code>0</code> and size <code>0</code>. Pushing one element costs <b>1</b>. If the array is full (size equals capacity) before the push, it first allocates a buffer with capacity <code>max(1, 2 * capacity)</code> and copies every existing element, which costs <b>size</b> extra. So a push into a full array costs <code>size + 1</code>.</p><p>Write <code>pushCosts(n)</code> that simulates <code>n</code> pushes and returns <code>{ total, worst }</code>:</p><ul><li><code>total</code>: the sum of the costs of all n pushes</li><li><code>worst</code>: the largest cost paid by any single push</li></ul><p>For <code>n = 0</code> both are 0. The point of the exercise is the pair of numbers: <code>worst</code> grows with n, but <code>total / n</code> stays below 3.</p>",
  "starter": "function pushCosts(n) {\n  // TODO: simulate n pushes with capacity doubling\n}\n",
  "hints": [
    "Keep three variables: size, capacity and a running total. Start with size = 0, capacity = 0.",
    "At each push, the cost is 1. If size === capacity, add size to the cost and set the capacity to Math.max(1, capacity * 2). Then increase the size.",
    "Track the largest cost seen so far for worst. After the loop, check your own result: total should never exceed 3 * n."
  ],
  "solution": "function pushCosts(n) {\n  let size = 0;\n  let capacity = 0;\n  let total = 0;\n  let worst = 0;\n  for (let k = 0; k < n; k++) {\n    let cost = 1;\n    if (size === capacity) {\n      cost += size;\n      capacity = Math.max(1, capacity * 2);\n    }\n    size++;\n    total += cost;\n    if (cost > worst) worst = cost;\n  }\n  return { total, worst };\n}\n",
  "tests": [
    {
      "name": "no pushes",
      "body": "assert.deepEqual(pushCosts(0), { total: 0, worst: 0 });"
    },
    {
      "name": "one push",
      "body": "assert.deepEqual(pushCosts(1), { total: 1, worst: 1 });"
    },
    {
      "name": "the first five pushes from the chapter",
      "body": "assert.deepEqual(pushCosts(2), { total: 3, worst: 2 });\nassert.deepEqual(pushCosts(3), { total: 6, worst: 3 });\nassert.deepEqual(pushCosts(5), { total: 12, worst: 5 });"
    },
    {
      "name": "powers of two and one past them",
      "body": "assert.equal(pushCosts(8).total, 15);\nassert.equal(pushCosts(9).total, 24);\nassert.equal(pushCosts(9).worst, 9);"
    },
    {
      "name": "a thousand pushes",
      "body": "assert.deepEqual(pushCosts(1000), { total: 2023, worst: 513 });"
    },
    {
      "name": "the total stays under 3n for every n up to 2000",
      "body": "for (let n = 1; n <= 2000; n++) {\n  assert.ok(pushCosts(n).total <= 3 * n, \"n = \" + n);\n}"
    },
    {
      "name": "the worst single push keeps growing",
      "body": "assert.ok(pushCosts(100000).worst > 60000);\nassert.ok(pushCosts(100000).total / 100000 < 3);"
    }
  ]
}
];
