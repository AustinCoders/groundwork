import type { Exercise } from "../types";

export const dsaAddRandomizationSampling: Exercise[] = [
  {
    id: "ex-seeded-generator",
    chapter: "dsa-randomization-sampling",
    level: "beginner",
    title: "Write a Seedable Random Generator",
    brief: "<p>Write <code>makeRng(seed)</code>, which returns a function. Each call to that function returns the next number of a repeatable sequence, so that code which takes a generator as a parameter can be tested.</p><ul><li>Every returned number is at least <code>0</code> and below <code>1</code></li><li>Two generators made with the same seed return exactly the same sequence, and each keeps its <b>own</b> state, so calling one does not move the other</li><li>Generators made with different seeds return different sequences</li><li>Do not call <code>Math.random</code>, which cannot be seeded</li><li>The seed is a non-negative whole number; <code>0</code> is a valid seed</li><li>Rolling a six-sided die with <code>Math.floor(rng() * 6)</code> must come out close to fair, not skewed to some faces</li></ul>",
    starter: "function makeRng(seed) {\n  // TODO: keep a 32-bit state in a closure; each call moves it forward and turns it into a number in [0, 1)\n}\n",
    hints: [
      "A generator is a closure: a variable holding the state, and an inner function that updates the state and returns a number computed from it.",
      "A linear congruential step is state = (state * 1664525 + 1013904223) modulo 2 ** 32. The product stays below 2 ** 53, so ordinary arithmetic is exact. Start the state from seed >>> 0.",
      "Divide the new state by 4294967296 (2 ** 32) to get a number in [0, 1). Use that number as a whole, as in Math.floor(rng() * 6); the low bits of the raw state are weak, but dividing keeps the strong high bits in front.",
    ],
    solution: "function makeRng(seed) {\n  let state = seed >>> 0;\n  return function () {\n    state = (state * 1664525 + 1013904223) % 4294967296;\n    return state / 4294967296;\n  };\n}\n",
    tests: [
      {
        name: "returns a function",
        body: "assert.equal(typeof makeRng(1), 'function');\nassert.equal(typeof makeRng(1)(), 'number');",
      },
      {
        name: "every number is in [0, 1)",
        body: "for (const seed of [0, 1, 2, 12345, 4294967295]) {\n  const rng = makeRng(seed);\n  for (let i = 0; i < 5000; i++) {\n    const x = rng();\n    assert.ok(x >= 0 && x < 1, 'seed ' + seed + ' produced ' + x);\n  }\n}",
      },
      {
        name: "the same seed gives the same sequence",
        body: "const a = makeRng(42);\nconst b = makeRng(42);\nfor (let i = 0; i < 1000; i++) assert.equal(a(), b());",
      },
      {
        name: "two generators keep separate state",
        body: "const a = makeRng(7);\nconst first = [a(), a(), a()];\nconst b = makeRng(7);\nconst c = makeRng(7);\nconst fromB = [];\nfor (let i = 0; i < 3; i++) {\n  fromB.push(b());\n  c();\n  c();\n}\nassert.deepEqual(fromB, first);",
      },
      {
        name: "different seeds give different sequences",
        body: "const a = makeRng(1);\nconst b = makeRng(2);\nlet differing = 0;\nfor (let i = 0; i < 20; i++) if (a() !== b()) differing++;\nassert.ok(differing >= 18, 'the sequences of seed 1 and seed 2 are almost the same');",
      },
      {
        name: "seed 0 is not stuck",
        body: "const rng = makeRng(0);\nconst seen = new Set();\nfor (let i = 0; i < 100; i++) seen.add(rng());\nassert.ok(seen.size > 90, 'seed 0 keeps repeating the same few numbers');",
      },
      {
        name: "does not use Math.random",
        body: "const original = Math.random;\nMath.random = () => { throw new Error('makeRng must not call Math.random'); };\ntry {\n  const rng = makeRng(5);\n  for (let i = 0; i < 100; i++) rng();\n} finally {\n  Math.random = original;\n}",
      },
      {
        name: "the mean of many numbers is close to one half",
        body: "const rng = makeRng(99);\nlet sum = 0;\nconst n = 20000;\nfor (let i = 0; i < n; i++) sum += rng();\nassert.ok(Math.abs(sum / n - 0.5) < 0.02, 'mean was ' + sum / n);",
      },
      {
        name: "a die rolled 60000 times is fair by a chi-square test",
        body: "function chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nfor (const seed of [1, 2, 3]) {\n  const rng = makeRng(seed);\n  const counts = [0, 0, 0, 0, 0, 0];\n  for (let i = 0; i < 60000; i++) {\n    const face = Math.floor(rng() * 6);\n    assert.ok(face >= 0 && face <= 5, 'rng() * 6 gave the face ' + face);\n    counts[face]++;\n  }\n  assert.ok(chi(counts) < 20.52, 'seed ' + seed + ' gave counts ' + counts.join(', '));\n}",
      },
    ],
  },
  {
    id: "ex-chi-square-statistic",
    chapter: "dsa-randomization-sampling",
    level: "beginner",
    title: "Chi-Square Statistic of Counts",
    brief: "<p>Write <code>chiSquare(observed, expected)</code>, which measures how far a list of counts is from the counts you expected. It is the sum over all outcomes of <code>(observed - expected) ** 2 / expected</code>.</p><ul><li><code>observed</code> is an array of counts, one per outcome</li><li><code>expected</code> is an optional array of expected counts of the same length. When it is left out, every outcome is expected equally often: <code>total / observed.length</code> each</li><li>Expected counts are positive</li><li>If the two arrays have different lengths, throw an <code>Error</code></li><li>An empty <code>observed</code> array gives <code>0</code></li></ul>",
    starter: "function chiSquare(observed, expected) {\n  // TODO: default the expected counts to total / observed.length, then add up the squared gaps\n}\n",
    hints: [
      "Compute the total of the observed counts first. When expected is undefined, build an array with total / observed.length in every slot.",
      "Check the lengths before the loop and throw new Error(...) when they differ.",
      "Loop over the outcomes and add (observed[i] - expected[i]) ** 2 / expected[i] to a running sum, then return it.",
    ],
    solution: "function chiSquare(observed, expected) {\n  if (observed.length === 0) return 0;\n  const total = observed.reduce((sum, count) => sum + count, 0);\n  const wanted = expected === undefined ? observed.map(() => total / observed.length) : expected;\n  if (wanted.length !== observed.length) throw new Error('observed and expected have different lengths');\n  let statistic = 0;\n  for (let i = 0; i < observed.length; i++) {\n    statistic += (observed[i] - wanted[i]) ** 2 / wanted[i];\n  }\n  return statistic;\n}\n",
    tests: [
      {
        name: "counts that match the expectation give zero",
        body: "assert.equal(chiSquare([10, 10, 10]), 0);\nassert.equal(chiSquare([5, 5]), 0);",
      },
      {
        name: "two outcomes, 12 and 8",
        body: "assert.ok(Math.abs(chiSquare([12, 8]) - 0.8) < 1e-9);",
      },
      {
        name: "the die example from the chapter",
        body: "const stat = chiSquare([10062, 9933, 9957, 10144, 9999, 9905]);\nassert.ok(Math.abs(stat - 3.9944) < 0.001, 'got ' + stat);",
      },
      {
        name: "expected counts can differ per outcome",
        body: "const stat = chiSquare([9995, 29615, 60017, 100373], [10000, 30000, 60000, 100000]);\nassert.ok(Math.abs(stat - 6.3394) < 0.001, 'got ' + stat);",
      },
      {
        name: "a very skewed die gives a huge statistic",
        body: "const stat = chiSquare([6009, 11985, 11958, 12208, 11908, 5932]);\nassert.ok(stat > 4800 && stat < 4900, 'got ' + stat);",
      },
      {
        name: "an empty list gives zero",
        body: "assert.equal(chiSquare([]), 0);",
      },
      {
        name: "mismatched lengths throw",
        body: "assert.throws(() => chiSquare([1, 2, 3], [2, 2]));",
      },
      {
        name: "does not change its arguments",
        body: "const observed = [3, 9, 6];\nconst expected = [6, 6, 6];\nchiSquare(observed, expected);\nchiSquare(observed);\nassert.deepEqual(observed, [3, 9, 6]);\nassert.deepEqual(expected, [6, 6, 6]);",
      },
    ],
  },
  {
    id: "ex-naive-shuffle-counts",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Count What the Naive Shuffle Can Produce",
    brief: "<p>The naive shuffle does <code>for (let i = 0; i &lt; n; i++) swap(a[i], a[j])</code> with <code>j</code> drawn from <b>every</b> position <code>0 .. n - 1</code>. Instead of running it at random, count it exactly.</p><p>Write <code>naiveShuffleCounts(n)</code>. Start from the array <code>[0, 1, ..., n - 1]</code> and try every one of the <code>n ** n</code> ways to choose <code>j</code> at each of the n steps. Return an object that maps each resulting array, written as its numbers joined with no separator (for example <code>\"102\"</code>), to the number of choice sequences that produce it.</p><ul><li><code>1 &lt;= n &lt;= 6</code> (the biggest case has 46,656 sequences)</li><li>Only arrays that can occur appear as keys</li><li>For a fair shuffle all the counts would be equal; here they are not once <code>n &gt;= 3</code></li></ul>",
    starter: "function naiveShuffleCounts(n) {\n  // TODO: walk every sequence of n choices j, each from 0 .. n - 1, applying the swaps\n}\n",
    hints: [
      "Recurse on the step number i. At each step, loop j from 0 to n - 1, swap a[i] and a[j], recurse to step i + 1, then swap back. At step n the array is finished.",
      "When i === n, build the key with a.join('') and add one to its entry in the counts object.",
      "Because the swaps are undone on the way back, one array can be reused for all n ** n branches. Check that the counts add up to n ** n.",
    ],
    solution: "function naiveShuffleCounts(n) {\n  const a = Array.from({ length: n }, (_, i) => i);\n  const counts = {};\n  function step(i) {\n    if (i === n) {\n      const key = a.join('');\n      counts[key] = (counts[key] || 0) + 1;\n      return;\n    }\n    for (let j = 0; j < n; j++) {\n      [a[i], a[j]] = [a[j], a[i]];\n      step(i + 1);\n      [a[i], a[j]] = [a[j], a[i]];\n    }\n  }\n  step(0);\n  return counts;\n}\n",
    tests: [
      {
        name: "one element has one outcome",
        body: "assert.deepEqual(naiveShuffleCounts(1), { '0': 1 });",
      },
      {
        name: "two elements: each order twice",
        body: "assert.deepEqual(naiveShuffleCounts(2), { '01': 2, '10': 2 });",
      },
      {
        name: "three elements: counts of 4 and 5 out of 27",
        body: "assert.deepEqual(naiveShuffleCounts(3), { '012': 4, '021': 5, '102': 5, '120': 5, '201': 4, '210': 4 });",
      },
      {
        name: "the counts add up to n ** n",
        body: "for (let n = 1; n <= 6; n++) {\n  const counts = naiveShuffleCounts(n);\n  const total = Object.values(counts).reduce((s, c) => s + c, 0);\n  assert.equal(total, n ** n, 'n = ' + n);\n}",
      },
      {
        name: "four elements reach all 24 orders, unevenly",
        body: "const counts = naiveShuffleCounts(4);\nconst values = Object.values(counts);\nassert.equal(values.length, 24);\nassert.equal(Math.min(...values), 8);\nassert.equal(Math.max(...values), 15);",
      },
      {
        name: "no fair split exists once n is 3 or more",
        body: "for (let n = 3; n <= 6; n++) {\n  const values = Object.values(naiveShuffleCounts(n));\n  assert.ok(Math.max(...values) > Math.min(...values), 'n = ' + n);\n}",
      },
      {
        name: "every key is a permutation of 0 .. n - 1",
        body: "const counts = naiveShuffleCounts(5);\nfor (const key of Object.keys(counts)) {\n  assert.equal(key.length, 5);\n  assert.equal(key.split('').sort().join(''), '01234', key);\n}",
      },
    ],
  },
  {
    id: "ex-shuffle-array",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Shuffle an Array (Fisher-Yates)",
    brief: "<p>Write <code>shuffle(nums, rng)</code>, which returns a new array holding the elements of <code>nums</code> in a uniformly random order: every one of the n! orders has probability 1/n!.</p><ul><li><code>rng</code> is a function that returns a number in <code>[0, 1)</code>, like <code>Math.random</code>. Use only it for randomness</li><li>Use Fisher-Yates from the back, so tests can script the generator: for <code>i</code> from <code>n - 1</code> down to <code>1</code>, draw once and set <code>j = Math.floor(rng() * (i + 1))</code>, then swap positions <code>i</code> and <code>j</code></li><li>That means exactly <code>n - 1</code> draws, and none for an array of 0 or 1 elements</li><li>Do not change <code>nums</code>; shuffle a copy</li></ul>",
    starter: "function shuffle(nums, rng) {\n  // TODO: copy the array, then walk i from the last index down to 1, swapping a[i] with a[j] for j in 0 .. i\n}\n",
    hints: [
      "Fill positions from the back. At position i the elements not yet placed are the ones in positions 0 .. i, and any of them may go into position i.",
      "j = Math.floor(rng() * (i + 1)) is a whole number from 0 to i inclusive, so position i may keep its own element (j = i). Drawing from 0 .. i - 1 instead is a different algorithm and gives only some of the orders.",
      "Swap with [a[i], a[j]] = [a[j], a[i]]. The loop stops at i = 1 because one element left has nothing to choose from.",
    ],
    solution: "function shuffle(nums, rng) {\n  const a = nums.slice();\n  for (let i = a.length - 1; i > 0; i--) {\n    const j = Math.floor(rng() * (i + 1));\n    [a[i], a[j]] = [a[j], a[i]];\n  }\n  return a;\n}\n",
    tests: [
      {
        name: "the chapter's scripted example",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nassert.deepEqual(shuffle(['A', 'B', 'C', 'D'], scripted([0.6, 0.9, 0.3])), ['B', 'A', 'D', 'C']);",
      },
      {
        name: "draws exactly n - 1 numbers",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nfor (const n of [0, 1, 2, 5, 40]) {\n  const rng = counted(seeded(3));\n  shuffle(Array.from({ length: n }, (_, i) => i), rng);\n  assert.equal(rng.calls, Math.max(0, n - 1), 'n = ' + n);\n}",
      },
      {
        name: "an empty array and a single element",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nassert.deepEqual(shuffle([], seeded(1)), []);\nassert.deepEqual(shuffle([7], seeded(1)), [7]);",
      },
      {
        name: "the result is a permutation of the input",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(5);\nconst input = [4, 8, 15, 16, 23, 42, 4, 8];\nfor (let t = 0; t < 200; t++) {\n  const out = shuffle(input, rng);\n  assert.equal(out.length, input.length);\n  assert.deepEqual(out.slice().sort((a, b) => a - b), input.slice().sort((a, b) => a - b));\n}",
      },
      {
        name: "does not change the input and returns a new array",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst input = [1, 2, 3, 4, 5];\nconst out = shuffle(input, seeded(8));\nassert.deepEqual(input, [1, 2, 3, 4, 5]);\nassert.ok(out !== input);",
      },
      {
        name: "three elements: all 6 orders are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst rng = seeded(7);\nconst keys = ['123', '132', '213', '231', '312', '321'];\nconst counts = new Map(keys.map((k) => [k, 0]));\nfor (let t = 0; t < 60000; t++) {\n  const k = shuffle([1, 2, 3], rng).join('');\n  counts.set(k, counts.get(k) + 1);\n}\nassert.ok(chi([...counts.values()]) < 20.52, 'counts ' + [...counts.values()].join(', '));",
      },
      {
        name: "four elements: all 24 orders are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst rng = seeded(11);\nconst counts = new Map();\nfor (let t = 0; t < 120000; t++) {\n  const k = shuffle([1, 2, 3, 4], rng).join('');\n  counts.set(k, (counts.get(k) || 0) + 1);\n}\nassert.equal(counts.size, 24, 'only ' + counts.size + ' different orders appeared');\nassert.ok(chi([...counts.values()]) < 49.73, 'statistic ' + chi([...counts.values()]));",
      },
      {
        name: "every position gets every element about equally often",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(2);\nconst n = 6;\nconst where = Array.from({ length: n }, () => new Array(n).fill(0));\nconst trials = 60000;\nfor (let t = 0; t < trials; t++) {\n  const out = shuffle([0, 1, 2, 3, 4, 5], rng);\n  for (let p = 0; p < n; p++) where[out[p]][p]++;\n}\nfor (let e = 0; e < n; e++) for (let p = 0; p < n; p++) {\n  assert.ok(Math.abs(where[e][p] / trials - 1 / n) < 0.01, 'element ' + e + ' at position ' + p + ': ' + where[e][p]);\n}",
      },
    ],
  },
  {
    id: "ex-shuffle-and-reset",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Shuffle an Array With Reset",
    brief: "<p>Design a class <code>Shuffler</code> that holds an array and can shuffle it or return it to its original order.</p><ul><li><code>new Shuffler(nums, rng)</code> keeps <b>its own copy</b> of <code>nums</code>. <code>rng</code> returns numbers in <code>[0, 1)</code></li><li><code>reset()</code> returns the original order as an array</li><li><code>shuffle()</code> returns a uniformly random order of the elements: every order has probability 1/n!, and one call does not depend on the one before</li><li>Neither method may hand out the array it stores. If a caller changes a returned array, later calls must still behave correctly</li><li>Changing the array that was passed to the constructor, after the constructor ran, must not change what <code>reset()</code> returns</li><li>Shuffle with Fisher-Yates from the back, one draw per step, so tests can script the generator: for <code>i</code> from <code>n - 1</code> down to <code>1</code>, set <code>j = Math.floor(rng() * (i + 1))</code> and swap positions <code>i</code> and <code>j</code></li></ul>",
    starter: "class Shuffler {\n  constructor(nums, rng) {\n    // TODO: keep a private copy of nums and the generator\n  }\n  reset() {\n    // TODO\n  }\n  shuffle() {\n    // TODO: Fisher-Yates on a fresh copy\n  }\n}\n",
    hints: [
      "Store this.original = nums.slice() in the constructor. Every method that returns an array returns a new copy.",
      "shuffle() copies this.original into a fresh array and runs Fisher-Yates on that copy. Never shuffle this.original itself: after one call, reset() would have nothing to return.",
      "Fisher-Yates from the back: for i from length - 1 down to 1, j = Math.floor(this.rng() * (i + 1)), swap positions i and j.",
    ],
    solution: "class Shuffler {\n  constructor(nums, rng) {\n    this.original = nums.slice();\n    this.rng = rng;\n  }\n  reset() {\n    return this.original.slice();\n  }\n  shuffle() {\n    const a = this.original.slice();\n    for (let i = a.length - 1; i > 0; i--) {\n      const j = Math.floor(this.rng() * (i + 1));\n      [a[i], a[j]] = [a[j], a[i]];\n    }\n    return a;\n  }\n}\n",
    tests: [
      {
        name: "reset returns the original order, even after shuffles",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Shuffler([1, 2, 3, 4, 5], seeded(4));\nassert.deepEqual(s.reset(), [1, 2, 3, 4, 5]);\ns.shuffle();\ns.shuffle();\nassert.deepEqual(s.reset(), [1, 2, 3, 4, 5]);",
      },
      {
        name: "shuffle returns a permutation of the elements",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Shuffler([5, 3, 9, 3, 1], seeded(6));\nfor (let t = 0; t < 100; t++) {\n  assert.deepEqual(s.shuffle().slice().sort((a, b) => a - b), [1, 3, 3, 5, 9]);\n}",
      },
      {
        name: "changing a returned array does not corrupt the object",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Shuffler([1, 2, 3], seeded(9));\nconst a = s.shuffle();\na.push(99);\na[0] = -1;\nconst b = s.reset();\nb.length = 0;\nassert.deepEqual(s.reset(), [1, 2, 3]);\nassert.equal(s.shuffle().length, 3);",
      },
      {
        name: "changing the constructor's array afterwards changes nothing",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst input = [1, 2, 3, 4];\nconst s = new Shuffler(input, seeded(1));\ninput[0] = 100;\ninput.push(5);\nassert.deepEqual(s.reset(), [1, 2, 3, 4]);\nassert.equal(s.shuffle().length, 4);",
      },
      {
        name: "uses the generator it was given, once per step",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nconst s = new Shuffler(['A', 'B', 'C', 'D'], scripted([0.6, 0.9, 0.3, 0.6, 0.9, 0.3]));\nassert.deepEqual(s.shuffle(), ['B', 'A', 'D', 'C']);\nassert.deepEqual(s.shuffle(), ['B', 'A', 'D', 'C']);",
      },
      {
        name: "an empty array and a one-element array",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nassert.deepEqual(new Shuffler([], seeded(1)).shuffle(), []);\nassert.deepEqual(new Shuffler([7], seeded(1)).shuffle(), [7]);\nassert.deepEqual(new Shuffler([7], seeded(1)).reset(), [7]);",
      },
      {
        name: "repeated shuffles of three elements reach all 6 orders equally often",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst s = new Shuffler([1, 2, 3], seeded(7));\nconst keys = ['123', '132', '213', '231', '312', '321'];\nconst counts = new Map(keys.map((k) => [k, 0]));\nfor (let t = 0; t < 60000; t++) {\n  const k = s.shuffle().join('');\n  counts.set(k, counts.get(k) + 1);\n  if (t % 1000 === 0) s.reset();\n}\nassert.ok(chi([...counts.values()]) < 20.52, 'counts ' + [...counts.values()].join(', '));",
      },
    ],
  },
  {
    id: "ex-random-pick-index",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Random Pick Index",
    brief: "<p>Design a class <code>Solution</code> over an integer array that may contain duplicates.</p><ul><li><code>new Solution(nums, rng)</code> stores the array and the generator. <code>rng</code> returns numbers in <code>[0, 1)</code></li><li><code>pick(target)</code> returns an index <code>i</code> with <code>nums[i] === target</code>, chosen <b>uniformly</b> among all such indices</li><li>If the target is not in the array, return <code>-1</code></li><li>Use <b>reservoir sampling</b> over the matching indices, with O(1) extra memory: do not build a map of index lists</li><li>For the m-th match you see (counting from 1), draw once with <code>Math.floor(rng() * m)</code> and take this index if the result is <code>0</code>. That is one draw per match, including the first, and no draws for other elements</li></ul>",
    starter: "class Solution {\n  constructor(nums, rng) {\n    // TODO\n  }\n  pick(target) {\n    // TODO: scan once, count the matches, and replace the chosen index with probability 1 / matches\n  }\n}\n",
    hints: [
      "You cannot know how many matches there are before the scan ends, so keep one candidate and improve it as you go.",
      "On the m-th match the new index should win with probability 1/m. Math.floor(rng() * m) === 0 has exactly that probability.",
      "Induction: after m matches each of them is the candidate with probability 1/m. Match m + 1 takes over with probability 1/(m + 1), and an older one survives with (1/m) * (m/(m + 1)) = 1/(m + 1).",
    ],
    solution: "class Solution {\n  constructor(nums, rng) {\n    this.nums = nums;\n    this.rng = rng;\n  }\n  pick(target) {\n    let chosen = -1;\n    let matches = 0;\n    for (let i = 0; i < this.nums.length; i++) {\n      if (this.nums[i] !== target) continue;\n      matches++;\n      if (Math.floor(this.rng() * matches) === 0) chosen = i;\n    }\n    return chosen;\n  }\n}\n",
    tests: [
      {
        name: "the chapter's scripted example picks index 4",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nconst s = new Solution([1, 3, 2, 3, 3], scripted([0.4, 0.9, 0.1]));\nassert.equal(s.pick(3), 4);",
      },
      {
        name: "another script keeps an earlier match",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nconst s = new Solution([5, 7, 5, 5, 9, 5], scripted([0.8, 0.9, 0.4, 0.9]));\nassert.equal(s.pick(5), 0);\nconst t = new Solution([5, 7, 5, 5, 9, 5], scripted([0.1, 0.1, 0.9, 0.2]));\nassert.equal(t.pick(5), 5);",
      },
      {
        name: "a missing target returns -1 and draws nothing",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nconst s = new Solution([1, 2, 3], scripted([]));\nassert.equal(s.pick(9), -1);",
      },
      {
        name: "a single match is returned, with exactly one draw",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(1));\nconst s = new Solution([4, 8, 6], rng);\nassert.equal(s.pick(8), 1);\nassert.equal(rng.calls, 1);",
      },
      {
        name: "draws once per match",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(2));\nconst s = new Solution([1, 3, 2, 3, 3, 3, 5, 3], rng);\ns.pick(3);\nassert.equal(rng.calls, 5);",
      },
      {
        name: "always returns an index that holds the target",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst nums = [2, 2, 1, 2, 3, 2, 2, 1];\nconst s = new Solution(nums, seeded(3));\nfor (let t = 0; t < 500; t++) {\n  const target = [1, 2, 3][t % 3];\n  assert.equal(nums[s.pick(target)], target);\n}",
      },
      {
        name: "five matching indices are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst s = new Solution([1, 3, 2, 3, 3, 3, 5, 3], seeded(5));\nconst counts = new Map([[1, 0], [3, 0], [4, 0], [5, 0], [7, 0]]);\nfor (let t = 0; t < 50000; t++) {\n  const i = s.pick(3);\n  counts.set(i, counts.get(i) + 1);\n}\nassert.ok(chi([...counts.values()]) < 18.47, 'counts ' + [...counts.values()].join(', '));",
      },
      {
        name: "does not change the array",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst nums = [1, 3, 3, 1];\nconst s = new Solution(nums, seeded(4));\nfor (let t = 0; t < 20; t++) s.pick(3);\nassert.deepEqual(nums, [1, 3, 3, 1]);",
      },
    ],
  },
  {
    id: "ex-linked-list-random-node",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Linked List Random Node",
    brief: "<p>You are given the head of a singly linked list of unknown length (at least one node). Design <code>Solution</code> so that <code>getRandom()</code> returns the value of a uniformly random node.</p><ul><li><code>new Solution(head, rng)</code> keeps the head and the generator. <code>rng</code> returns numbers in <code>[0, 1)</code></li><li><code>getRandom()</code> walks the list <b>once</b>, with O(1) extra memory (do not copy the values into an array)</li><li>For the m-th node (counting from 1), draw once with <code>Math.floor(rng() * m)</code> and take that node's value if the result is <code>0</code>. That is one draw per node</li><li>The list must be left as it was</li></ul>",
    starter: "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) {\n    out.push(n.val);\n    if (out.length > 100000) throw new Error('the list never ends: is there a cycle?');\n  }\n  return out;\n}\n\nclass Solution {\n  constructor(head, rng) {\n    // TODO\n  }\n  getRandom() {\n    // TODO: reservoir sampling with a reservoir of one\n  }\n}\n",
    hints: [
      "Keep a variable for the chosen value and a counter of nodes seen so far. The first node must always become the chosen one.",
      "When the m-th node arrives, replace the chosen value with its value if Math.floor(rng() * m) === 0, which happens with probability 1/m.",
      "Each node ends up chosen with probability 1/m * (m/(m + 1)) * ... * ((n - 1)/n) = 1/n; the product telescopes. Start the loop at this.head and follow next until null.",
    ],
    solution: "class ListNode {\n  constructor(val, next) {\n    this.val = val === undefined ? 0 : val;\n    this.next = next === undefined ? null : next;\n  }\n}\nfunction build(arr) {\n  let head = null;\n  for (let i = arr.length - 1; i >= 0; i--) head = new ListNode(arr[i], head);\n  return head;\n}\nfunction toArray(head) {\n  const out = [];\n  for (let n = head; n; n = n.next) {\n    out.push(n.val);\n    if (out.length > 100000) throw new Error('the list never ends: is there a cycle?');\n  }\n  return out;\n}\n\nclass Solution {\n  constructor(head, rng) {\n    this.head = head;\n    this.rng = rng;\n  }\n  getRandom() {\n    let chosen = this.head.val;\n    let seen = 0;\n    for (let node = this.head; node !== null; node = node.next) {\n      seen++;\n      if (Math.floor(this.rng() * seen) === 0) chosen = node.val;\n    }\n    return chosen;\n  }\n}\n",
    tests: [
      {
        name: "a scripted walk over 10, 20, 30, 40 ends on 30",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nconst s = new Solution(build([10, 20, 30, 40]), scripted([0.3, 0.7, 0.2, 0.6]));\nassert.equal(s.getRandom(), 30);",
      },
      {
        name: "a script that never replaces keeps the first node",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nconst s = new Solution(build([5, 6, 7, 8]), scripted([0, 0.9, 0.9, 0.9]));\nassert.equal(s.getRandom(), 5);",
      },
      {
        name: "a single node is returned, with one draw",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(1));\nassert.equal(new Solution(build([42]), rng).getRandom(), 42);\nassert.equal(rng.calls, 1);",
      },
      {
        name: "draws once per node",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(2));\nnew Solution(build([1, 2, 3, 4, 5, 6, 7]), rng).getRandom();\nassert.equal(rng.calls, 7);",
      },
      {
        name: "leaves the list unchanged",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst head = build([3, 1, 4, 1, 5]);\nconst s = new Solution(head, seeded(3));\nfor (let t = 0; t < 50; t++) s.getRandom();\nassert.deepEqual(toArray(head), [3, 1, 4, 1, 5]);",
      },
      {
        name: "five nodes are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst s = new Solution(build([1, 2, 3, 4, 5]), seeded(10));\nconst counts = [0, 0, 0, 0, 0];\nfor (let t = 0; t < 50000; t++) counts[s.getRandom() - 1]++;\nassert.ok(chi(counts) < 18.47, 'counts ' + counts.join(', '));",
      },
      {
        name: "repeated values count once per node",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Solution(build([7, 7, 7, 9]), seeded(6));\nlet nines = 0;\nconst trials = 40000;\nfor (let t = 0; t < trials; t++) if (s.getRandom() === 9) nines++;\nassert.ok(Math.abs(nines / trials - 0.25) < 0.015, 'nines: ' + nines);",
      },
      {
        name: "a long list works with one pass",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst values = Array.from({ length: 20000 }, (_, i) => i);\nconst s = new Solution(build(values), seeded(8));\nfor (let t = 0; t < 20; t++) {\n  const v = s.getRandom();\n  assert.ok(v >= 0 && v < 20000);\n}",
      },
    ],
  },
  {
    id: "ex-reservoir-sample-k",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Reservoir Sample of k Items",
    brief: "<p>Write <code>reservoirSample(stream, k, rng)</code>. <code>stream</code> is any iterable that can be read <b>once</b> (it may be a generator), and its length is unknown. Return an array of <code>k</code> items so that every <code>k</code>-subset of the stream is equally likely.</p><ul><li><code>rng</code> returns numbers in <code>[0, 1)</code></li><li>The first <code>k</code> items go straight into the reservoir, with no draw</li><li>For the i-th item (counting from 1) with <code>i &gt; k</code>, draw once and set <code>slot = Math.floor(rng() * i)</code>. If <code>slot &lt; k</code>, the item replaces <code>reservoir[slot]</code></li><li>If the stream has fewer than <code>k</code> items, return all of them in arrival order; <code>k = 0</code> gives <code>[]</code></li><li>Use O(k) memory: never store the whole stream</li></ul>",
    starter: "function reservoirSample(stream, k, rng) {\n  // TODO: fill with the first k items, then let item i take a random slot with probability k / i\n}\n",
    hints: [
      "Keep a counter seen of how many items have arrived. While the reservoir has fewer than k items, just push.",
      "For item number seen > k, a draw of floor(rng() * seen) is uniform on 0 .. seen - 1, so it is below k with probability k/seen. That is exactly the probability the new item must have of getting in.",
      "When the draw is below k it is also uniform over the k slots, so using it as the slot to overwrite evicts each current member with equal probability. Proof: each k-subset has probability 1/C(i, k) after i items, by induction.",
    ],
    solution: "function reservoirSample(stream, k, rng) {\n  const reservoir = [];\n  let seen = 0;\n  for (const item of stream) {\n    seen++;\n    if (reservoir.length < k) {\n      reservoir.push(item);\n    } else {\n      const slot = Math.floor(rng() * seen);\n      if (slot < k) reservoir[slot] = item;\n    }\n  }\n  return reservoir;\n}\n",
    tests: [
      {
        name: "the chapter's scripted example",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nassert.deepEqual(reservoirSample(['A', 'B', 'C', 'D', 'E'], 2, scripted([0.5, 0.9, 0.1])), ['E', 'C']);",
      },
      {
        name: "a stream shorter than k returns everything in order",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nassert.deepEqual(reservoirSample([1, 2], 5, seeded(1)), [1, 2]);\nassert.deepEqual(reservoirSample([], 3, seeded(1)), []);",
      },
      {
        name: "k = 0 returns an empty array",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nassert.deepEqual(reservoirSample([1, 2, 3], 0, seeded(1)), []);",
      },
      {
        name: "k equal to the length returns all items",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(1));\nassert.deepEqual(reservoirSample([1, 2, 3], 3, rng).sort(), [1, 2, 3]);\nassert.equal(rng.calls, 0);",
      },
      {
        name: "draws exactly once for every item after the first k",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(4));\nreservoirSample(Array.from({ length: 50 }, (_, i) => i), 7, rng);\nassert.equal(rng.calls, 43);",
      },
      {
        name: "reads a one-shot generator only once",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nlet started = 0;\nfunction* numbers() {\n  started++;\n  for (let i = 0; i < 100; i++) yield i;\n}\nconst out = reservoirSample(numbers(), 5, seeded(2));\nassert.equal(out.length, 5);\nassert.equal(new Set(out).size, 5);\nassert.equal(started, 1);",
      },
      {
        name: "the sample has k distinct members of the stream",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(3);\nfor (let t = 0; t < 200; t++) {\n  const out = reservoirSample(Array.from({ length: 30 }, (_, i) => i), 8, rng);\n  assert.equal(out.length, 8);\n  assert.equal(new Set(out).size, 8);\n  assert.ok(out.every((x) => x >= 0 && x < 30));\n}",
      },
      {
        name: "all 10 pairs of five items are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst rng = seeded(4);\nconst keys = [];\nfor (let a = 0; a < 5; a++) for (let b = a + 1; b < 5; b++) keys.push('' + a + b);\nconst counts = new Map(keys.map((key) => [key, 0]));\nfor (let t = 0; t < 100000; t++) {\n  const key = reservoirSample([0, 1, 2, 3, 4], 2, rng).sort().join('');\n  counts.set(key, counts.get(key) + 1);\n}\nassert.ok(chi([...counts.values()]) < 27.88, 'counts ' + [...counts.values()].join(', '));",
      },
      {
        name: "each item is in the sample with probability k / n",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(5);\nconst inside = new Array(7).fill(0);\nconst trials = 40000;\nfor (let t = 0; t < trials; t++) {\n  for (const x of reservoirSample([0, 1, 2, 3, 4, 5, 6], 3, rng)) inside[x]++;\n}\nfor (let x = 0; x < 7; x++) assert.ok(Math.abs(inside[x] / trials - 3 / 7) < 0.015, 'item ' + x + ': ' + inside[x] / trials);",
      },
    ],
  },
  {
    id: "ex-random-pick-weight",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Random Pick With Weight",
    brief: "<p>Design a class <code>Solution</code> over an array <code>w</code> of non-negative integer weights, at least one of them positive.</p><ul><li><code>new Solution(w, rng)</code> prepares the picker. <code>rng</code> returns numbers in <code>[0, 1)</code>. Do not change <code>w</code></li><li><code>pickIndex()</code> returns index <code>i</code> with probability <code>w[i] / sum(w)</code>. An index with weight <code>0</code> is never returned</li><li>Use <b>prefix sums and a binary search</b>: setup O(n), each pick O(log n), O(n) memory. Do not repeat each index <code>w[i]</code> times</li><li>Each pick draws once: <code>r = Math.floor(rng() * total)</code>, then returns the <b>first</b> index whose prefix sum is strictly greater than <code>r</code></li></ul>",
    starter: "class Solution {\n  constructor(w, rng) {\n    // TODO: store the running totals and the grand total\n  }\n  pickIndex() {\n    // TODO: draw r in 0 .. total - 1, then binary search the first prefix sum greater than r\n  }\n}\n",
    hints: [
      "Lay the weights end to end on a line from 0 to total. Index i owns the whole numbers from prefix[i - 1] up to but not including prefix[i]. A whole number r in 0 .. total - 1 falls in exactly one segment.",
      "Binary search the sorted prefix array for the first position whose value is greater than r (an upper bound). With lo = 0 and hi = n - 1, move hi = mid when prefix[mid] > r, otherwise lo = mid + 1.",
      "Use strictly greater with r from 0, or at least with r from 1. Mixing them makes the first index win too often. A weight of zero needs no special case: its prefix equals the one before it, so the search never lands there.",
    ],
    solution: "class Solution {\n  constructor(w, rng) {\n    this.rng = rng;\n    this.prefix = [];\n    let running = 0;\n    for (const weight of w) {\n      running += weight;\n      this.prefix.push(running);\n    }\n    this.total = running;\n  }\n  pickIndex() {\n    const r = Math.floor(this.rng() * this.total);\n    let lo = 0;\n    let hi = this.prefix.length - 1;\n    while (lo < hi) {\n      const mid = lo + ((hi - lo) >> 1);\n      if (this.prefix[mid] > r) hi = mid;\n      else lo = mid + 1;\n    }\n    return lo;\n  }\n}\n",
    tests: [
      {
        name: "every possible draw maps to the right index (weights 1, 3, 6)",
        body: "const total = 10;\nconst tally = [0, 0, 0];\nconst expected = [0, 1, 1, 1, 2, 2, 2, 2, 2, 2];\nfor (let r = 0; r < total; r++) {\n  const s = new Solution([1, 3, 6], () => (r + 0.5) / total);\n  const got = s.pickIndex();\n  assert.equal(got, expected[r], 'r = ' + r);\n  tally[got]++;\n}\nassert.deepEqual(tally, [1, 3, 6]);",
      },
      {
        name: "zero weights are never picked, for every possible draw",
        body: "const w = [0, 2, 0, 0, 3, 0];\nconst total = 5;\nconst tally = new Array(6).fill(0);\nfor (let r = 0; r < total; r++) {\n  const s = new Solution(w, () => (r + 0.5) / total);\n  tally[s.pickIndex()]++;\n}\nassert.deepEqual(tally, w);",
      },
      {
        name: "a single index is always picked",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Solution([7], seeded(1));\nfor (let t = 0; t < 20; t++) assert.equal(s.pickIndex(), 0);",
      },
      {
        name: "draws exactly once per pick",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(2));\nconst s = new Solution([2, 5, 1], rng);\nfor (let t = 0; t < 10; t++) s.pickIndex();\nassert.equal(rng.calls, 10);",
      },
      {
        name: "does not change the weights",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst w = [4, 1, 2];\nconst s = new Solution(w, seeded(3));\nfor (let t = 0; t < 10; t++) s.pickIndex();\nassert.deepEqual(w, [4, 1, 2]);",
      },
      {
        name: "picks follow the weights (chi-square over the non-zero weights)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst w = [1, 3, 6, 0, 10];\nconst s = new Solution(w, seeded(6));\nconst counts = new Array(5).fill(0);\nconst trials = 200000;\nfor (let t = 0; t < trials; t++) counts[s.pickIndex()]++;\nassert.equal(counts[3], 0);\nlet stat = 0;\nfor (const i of [0, 1, 2, 4]) {\n  const expected = (w[i] / 20) * trials;\n  stat += (counts[i] - expected) ** 2 / expected;\n}\nassert.ok(stat < 16.27, 'counts ' + counts.join(', '));",
      },
      {
        name: "a heavy first weight is not favoured (the >= bug)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Solution([1, 3], seeded(9));\nlet zeros = 0;\nconst trials = 40000;\nfor (let t = 0; t < trials; t++) if (s.pickIndex() === 0) zeros++;\nassert.ok(Math.abs(zeros / trials - 0.25) < 0.015, 'index 0 came up ' + zeros / trials);",
      },
      {
        name: "large inputs stay fast (binary search, not a scan)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst n = 200000;\nconst w = Array.from({ length: n }, (_, i) => (i % 7) + 1);\nconst s = new Solution(w, seeded(5));\nfor (let t = 0; t < 200000; t++) {\n  const i = s.pickIndex();\n  if (i < 0 || i >= n) throw new Error('index out of range: ' + i);\n}",
      },
    ],
  },
  {
    id: "ex-rand10-from-rand7",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Implement rand10() Using rand7()",
    brief: "<p>You are given <code>rand7</code>, a function that returns a uniformly random integer from <code>1</code> to <code>7</code>. Write <code>rand10(rand7)</code> that returns a uniformly random integer from <code>1</code> to <code>10</code>, calling only <code>rand7</code> for randomness.</p><ul><li>Combine two calls into one number from 1 to 49: <code>index = (first - 1) * 7 + second</code>, where <code>first</code> is the earlier call</li><li>If <code>index &lt;= 40</code>, return <code>1 + (index - 1) % 10</code>. Otherwise throw the pair away and draw two new calls</li><li>The result must be exactly uniform, so do not add two calls, and do not reduce a number from 1 to 49 with <code>% 10</code> alone</li><li>There is no upper limit on the number of calls, but the expected number is about 2.45</li></ul>",
    starter: "function rand10(rand7) {\n  // TODO: build a uniform number 1..49 from two calls, and redraw when it is above 40\n}\n",
    hints: [
      "Two calls can be read as the two digits of a base-7 number, so (first - 1) * 7 + second hits each value from 1 to 49 exactly once, with probability 1/49 each.",
      "49 is not a multiple of 10, so some values would come up more often. The largest multiple of 10 that fits is 40: accept only index <= 40 and each result 1..10 then has exactly four indices.",
      "Wrap the two calls in a loop that repeats while the index is above 40. The answer is always correct; only the number of calls is random.",
    ],
    solution: "function rand10(rand7) {\n  while (true) {\n    const first = rand7();\n    const second = rand7();\n    const index = (first - 1) * 7 + second;\n    if (index <= 40) return 1 + ((index - 1) % 10);\n  }\n}\n",
    tests: [
      {
        name: "scripted pairs map as in the chapter",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nassert.equal(rand10(scripted([1, 1])), 1);\nassert.equal(rand10(scripted([6, 5])), 10);\nassert.equal(rand10(scripted([3, 4])), 8);\nassert.equal(rand10(scripted([1, 7])), 7);\nassert.equal(rand10(scripted([2, 4])), 1);",
      },
      {
        name: "indexes above 40 are thrown away and redrawn",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nassert.equal(rand10(scripted([6, 6, 7, 7, 3, 4])), 8);\nassert.equal(rand10(scripted([7, 1, 6, 7, 1, 1])), 1);",
      },
      {
        name: "draws the first call of a pair first",
        body: "const calls = [];\nconst values = [2, 3];\nlet next = 0;\nconst result = rand10(() => {\n  if (next >= values.length) throw new Error('asked for more than two numbers');\n  calls.push(next);\n  return values[next++];\n});\nassert.deepEqual(calls, [0, 1]);\nassert.equal(result, 1 + ((((2 - 1) * 7 + 3) - 1) % 10));",
      },
      {
        name: "all 49 pairs: each result 1..10 comes from exactly four accepted pairs",
        body: "const tally = new Array(11).fill(0);\nlet rejected = 0;\nfor (let a = 1; a <= 7; a++) for (let b = 1; b <= 7; b++) {\n  const values = [a, b, 1, 1];\n  let used = 0;\n  const result = rand10(() => {\n    if (used >= values.length) throw new Error('asked for more than 4 numbers');\n    used++;\n    return values[used - 1];\n  });\n  if (used === 4) rejected++;\n  else tally[result]++;\n}\nassert.equal(rejected, 9);\nassert.deepEqual(tally.slice(1), [4, 4, 4, 4, 4, 4, 4, 4, 4, 4]);",
      },
      {
        name: "100000 calls are uniform (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst rng = seeded(8);\nconst rand7 = () => 1 + Math.floor(rng() * 7);\nconst counts = new Array(10).fill(0);\nfor (let t = 0; t < 100000; t++) counts[rand10(rand7) - 1]++;\nassert.ok(chi(counts) < 27.88, 'counts ' + counts.join(', '));",
      },
      {
        name: "returns only whole numbers from 1 to 10",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(1);\nconst rand7 = () => 1 + Math.floor(rng() * 7);\nfor (let t = 0; t < 5000; t++) {\n  const x = rand10(rand7);\n  assert.ok(Number.isInteger(x) && x >= 1 && x <= 10, 'got ' + x);\n}",
      },
      {
        name: "uses about 2.45 calls to rand7 per result, not many more",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(2);\nlet calls = 0;\nconst rand7 = () => { calls++; return 1 + Math.floor(rng() * 7); };\nconst trials = 50000;\nfor (let t = 0; t < trials; t++) rand10(rand7);\nassert.ok(calls / trials < 2.6, 'used ' + calls / trials + ' calls per result');\nassert.ok(calls / trials >= 2, 'fewer than two calls per result is impossible');",
      },
      {
        name: "successive results are not linked (chi-square on pairs)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst rng = seeded(3);\nconst rand7 = () => 1 + Math.floor(rng() * 7);\nconst counts = new Array(100).fill(0);\nfor (let t = 0; t < 100000; t++) {\n  const a = rand10(rand7);\n  const b = rand10(rand7);\n  counts[(a - 1) * 10 + (b - 1)]++;\n}\nassert.ok(chi(counts) < 148.23, 'statistic ' + chi(counts));",
      },
    ],
  },
  {
    id: "ex-random-point-in-circle",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Generate a Random Point in a Circle",
    brief: "<p>Write <code>randomPointInCircle(radius, cx, cy, rng)</code>, which returns a point <code>[x, y]</code> chosen <b>uniformly</b> from the disc of the given radius around <code>(cx, cy)</code>: a region of the disc has probability in proportion to its area.</p><ul><li><code>rng</code> returns numbers in <code>[0, 1)</code>. Use only it for randomness</li><li>A point on the boundary counts as inside; <code>radius = 0</code> returns the center</li><li>Two good methods: draw a point in the bounding square and redraw until it is inside the circle, or draw an angle and a distance <code>radius * Math.sqrt(u)</code></li><li>A distance of <code>radius * u</code> is wrong: it crowds points near the center</li></ul>",
    starter: "function randomPointInCircle(radius, cx, cy, rng) {\n  // TODO: either reject points of the square that fall outside, or pick angle and radius * Math.sqrt(u)\n}\n",
    hints: [
      "Rejection: x = (rng() * 2 - 1) * radius and the same for y give a point uniform in the square. Keep it only if x * x + y * y <= radius * radius, otherwise draw again. About 78.5% of draws are kept.",
      "Direct: a ring at distance d with a small width has area about 2 * PI * d * width, so far rings hold more area. The chance that the distance is at most d must equal the area fraction (d / radius) ** 2.",
      "Solve u = (d / radius) ** 2 for d: d = radius * Math.sqrt(u). Then x = cx + d * Math.cos(angle) and y = cy + d * Math.sin(angle) with angle = rng() * 2 * Math.PI.",
    ],
    solution: "function randomPointInCircle(radius, cx, cy, rng) {\n  while (true) {\n    const x = (rng() * 2 - 1) * radius;\n    const y = (rng() * 2 - 1) * radius;\n    if (x * x + y * y <= radius * radius) return [cx + x, cy + y];\n  }\n}\n",
    tests: [
      {
        name: "every point is inside the circle",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(1);\nfor (let t = 0; t < 5000; t++) {\n  const [x, y] = randomPointInCircle(10, 3, -2, rng);\n  assert.ok((x - 3) ** 2 + (y + 2) ** 2 <= 100 + 1e-9, 'outside: ' + x + ', ' + y);\n}",
      },
      {
        name: "returns a pair of finite numbers",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst p = randomPointInCircle(1, 0, 0, seeded(2));\nassert.ok(Array.isArray(p) && p.length === 2);\nassert.ok(Number.isFinite(p[0]) && Number.isFinite(p[1]));",
      },
      {
        name: "a radius of zero returns the center",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nassert.deepEqual(randomPointInCircle(0, 5, 7, seeded(3)), [5, 7]);",
      },
      {
        name: "a quarter of the points lie within half the radius",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(21);\nlet inner = 0;\nconst trials = 40000;\nfor (let t = 0; t < trials; t++) {\n  const [x, y] = randomPointInCircle(10, 0, 0, rng);\n  if (x * x + y * y <= 25) inner++;\n}\nassert.ok(Math.abs(inner / trials - 0.25) < 0.02, 'share within half the radius: ' + inner / trials + ' (the area says 0.25)');",
      },
      {
        name: "five rings of equal area get equal shares (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst rng = seeded(4);\nconst counts = new Array(5).fill(0);\nfor (let t = 0; t < 100000; t++) {\n  const [x, y] = randomPointInCircle(10, 0, 0, rng);\n  counts[Math.min(4, Math.floor(((x * x + y * y) / 100) * 5))]++;\n}\nassert.ok(chi(counts) < 18.47, 'counts ' + counts.join(', '));",
      },
      {
        name: "the four quadrants are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst rng = seeded(5);\nconst counts = [0, 0, 0, 0];\nfor (let t = 0; t < 80000; t++) {\n  const [x, y] = randomPointInCircle(5, 0, 0, rng);\n  counts[(x >= 0 ? 0 : 1) + (y >= 0 ? 0 : 2)]++;\n}\nassert.ok(chi(counts) < 16.27, 'counts ' + counts.join(', '));",
      },
      {
        name: "the center of the circle moves the points",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(6);\nlet sx = 0;\nlet sy = 0;\nconst trials = 20000;\nfor (let t = 0; t < trials; t++) {\n  const [x, y] = randomPointInCircle(2, 100, -50, rng);\n  sx += x;\n  sy += y;\n}\nassert.ok(Math.abs(sx / trials - 100) < 0.1, 'mean x ' + sx / trials);\nassert.ok(Math.abs(sy / trials + 50) < 0.1, 'mean y ' + sy / trials);",
      },
      {
        name: "a distance of radius * u is caught: it puts half the points in the inner quarter of the area",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(7);\nlet inner = 0;\nconst trials = 20000;\nfor (let t = 0; t < trials; t++) {\n  const [x, y] = randomPointInCircle(1, 0, 0, rng);\n  if (Math.hypot(x, y) <= 0.5) inner++;\n}\nassert.ok(inner / trials < 0.3, 'share within half the radius: ' + inner / trials);",
      },
    ],
  },
  {
    id: "ex-random-point-in-rectangles",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Random Point in Non-Overlapping Rectangles",
    brief: "<p>Design a class <code>Solution</code> over a list of non-overlapping axis-aligned rectangles <code>[x1, y1, x2, y2]</code>, where <code>(x1, y1)</code> is the bottom-left corner and <code>(x2, y2)</code> the top-right one, both <b>included</b>.</p><ul><li><code>new Solution(rects, rng)</code> prepares the picker. <code>rng</code> returns numbers in <code>[0, 1)</code></li><li><code>pick()</code> returns a point <code>[x, y]</code> with <b>integer</b> coordinates that lies in some rectangle (edges and corners count). Every integer point of the union must be equally likely</li><li>A rectangle holds <code>(x2 - x1 + 1) * (y2 - y1 + 1)</code> integer points, so choosing a rectangle first with equal probability would be wrong</li><li>Target: setup O(n), pick O(log n)</li><li>Draw exactly once per pick: <code>r = Math.floor(rng() * total)</code>, where <code>total</code> is the number of integer points in all rectangles, numbers every point of the union, so tests can script the generator</li></ul>",
    starter: "class Solution {\n  constructor(rects, rng) {\n    // TODO: prefix sums of the number of integer points in each rectangle\n  }\n  pick() {\n    // TODO: draw one point number, find its rectangle with a binary search, then turn the remainder into x and y\n  }\n}\n",
    hints: [
      "Count the integer points of each rectangle, and keep prefix sums of those counts. Weighted pick: a number r from 0 to total - 1 belongs to the first rectangle whose prefix is strictly greater than r.",
      "Inside rectangle i the points are numbered by offset = r - (the prefix before i). With width = x2 - x1 + 1, the point is x = x1 + offset % width and y = y1 + Math.floor(offset / width).",
      "Check with a tiny case by hand: rectangles [0,0,1,1] and [5,5,5,7] hold 4 and 3 points, so r = 0..3 gives the four points of the square and r = 4..6 gives (5,5), (5,6), (5,7).",
    ],
    solution: "class Solution {\n  constructor(rects, rng) {\n    this.rects = rects;\n    this.rng = rng;\n    this.prefix = [];\n    let running = 0;\n    for (const [x1, y1, x2, y2] of rects) {\n      running += (x2 - x1 + 1) * (y2 - y1 + 1);\n      this.prefix.push(running);\n    }\n  }\n  pick() {\n    const r = Math.floor(this.rng() * this.prefix[this.prefix.length - 1]);\n    let lo = 0;\n    let hi = this.prefix.length - 1;\n    while (lo < hi) {\n      const mid = lo + ((hi - lo) >> 1);\n      if (this.prefix[mid] > r) hi = mid;\n      else lo = mid + 1;\n    }\n    const [x1, y1, x2] = this.rects[lo];\n    const offset = r - (lo === 0 ? 0 : this.prefix[lo - 1]);\n    const width = x2 - x1 + 1;\n    return [x1 + (offset % width), y1 + Math.floor(offset / width)];\n  }\n}\n",
    tests: [
      {
        name: "every point is an integer point inside some rectangle",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rects = [[-2, -3, 1, 0], [4, 4, 4, 9], [10, 0, 12, 1]];\nconst s = new Solution(rects, seeded(1));\nfor (let t = 0; t < 3000; t++) {\n  const [x, y] = s.pick();\n  assert.ok(Number.isInteger(x) && Number.isInteger(y), 'not integers: ' + x + ', ' + y);\n  assert.ok(rects.some(([x1, y1, x2, y2]) => x >= x1 && x <= x2 && y >= y1 && y <= y2), 'outside: ' + x + ', ' + y);\n}",
      },
      {
        name: "a single point rectangle always gives that point",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Solution([[3, 4, 3, 4]], seeded(2));\nfor (let t = 0; t < 20; t++) assert.deepEqual(s.pick(), [3, 4]);",
      },
      {
        name: "all 9 points of one rectangle appear (edges and corners included)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Solution([[-3, -2, -1, 0]], seeded(3));\nconst seen = new Set();\nfor (let t = 0; t < 2000; t++) seen.add(s.pick().join(','));\nassert.equal(seen.size, 9, 'saw ' + [...seen].join(' '));",
      },
      {
        name: "every point number maps to a different point",
        body: "const rects = [[0, 0, 1, 1], [5, 5, 5, 7]];\nconst total = 7;\nconst seen = new Set();\nfor (let r = 0; r < total; r++) {\n  const s = new Solution(rects, () => (r + 0.5) / total);\n  seen.add(s.pick().join(','));\n}\nassert.equal(seen.size, 7);",
      },
      {
        name: "7 points over two rectangles are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst s = new Solution([[0, 0, 1, 1], [5, 5, 5, 7]], seeded(21));\nconst keys = ['0,0', '1,0', '0,1', '1,1', '5,5', '5,6', '5,7'];\nconst counts = new Map(keys.map((k) => [k, 0]));\nfor (let t = 0; t < 70000; t++) {\n  const k = s.pick().join(',');\n  assert.ok(counts.has(k), 'unexpected point ' + k);\n  counts.set(k, counts.get(k) + 1);\n}\nassert.ok(chi([...counts.values()]) < 22.46, 'counts ' + [...counts.values()].join(', '));",
      },
      {
        name: "a big rectangle gets points in proportion to its size",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Solution([[0, 0, 0, 0], [10, 10, 19, 19]], seeded(4));\nlet small = 0;\nconst trials = 100000;\nfor (let t = 0; t < trials; t++) if (s.pick()[0] === 0) small++;\nassert.ok(small > 800 && small < 1200, 'the single point came up ' + small + ' times; about 990 expected');",
      },
      {
        name: "draws once per pick",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(5));\nconst s = new Solution([[0, 0, 4, 4], [7, 7, 8, 8]], rng);\nfor (let t = 0; t < 25; t++) s.pick();\nassert.equal(rng.calls, 25);",
      },
      {
        name: "many rectangles are still fast",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rects = [];\nfor (let i = 0; i < 20000; i++) rects.push([i * 3, 0, i * 3 + 1, 1]);\nconst s = new Solution(rects, seeded(6));\nfor (let t = 0; t < 50000; t++) {\n  const [x] = s.pick();\n  if (x < 0 || x > 20000 * 3) throw new Error('x out of range: ' + x);\n}",
      },
    ],
  },
  {
    id: "ex-random-pick-blacklist",
    chapter: "dsa-randomization-sampling",
    level: "intermediate",
    title: "Random Pick With Blacklist",
    brief: "<p>Design a class <code>Solution</code> that picks a uniformly random integer from <code>0</code> to <code>n - 1</code> that is <b>not</b> in a blacklist.</p><ul><li><code>new Solution(n, blacklist, rng)</code>: <code>blacklist</code> holds distinct integers in <code>[0, n)</code>, and at least one number is allowed. <code>rng</code> returns numbers in <code>[0, 1)</code></li><li><code>pick()</code> returns an allowed number, each allowed number equally likely</li><li><code>n</code> can be as large as <code>10 ** 9</code> while the blacklist is small, so setup must cost O(blacklist size) and never loop over <code>0 .. n - 1</code></li><li>Make <b>at most one</b> draw from <code>rng</code> per pick. Redrawing until the draw is allowed is not enough</li></ul>",
    starter: "class Solution {\n  constructor(n, blacklist, rng) {\n    // TODO: size = n - blacklist.length allowed numbers; map the banned numbers below size to allowed ones at or above size\n  }\n  pick() {\n    // TODO: one draw in 0 .. size - 1, remapped if it is banned\n  }\n}\n",
    hints: [
      "There are size = n - blacklist.length allowed numbers. Draw r uniformly from 0 .. size - 1. If r is allowed, it is the answer.",
      "If r is banned, it must be replaced by an allowed number that no other r produces. The numbers at or above size are never drawn, and exactly as many of them are allowed as there are banned numbers below size.",
      "Build a Map: for each banned b < size, assign the next allowed number at or above size, skipping numbers that are themselves banned. Banned numbers at or above size need no entry.",
    ],
    solution: "class Solution {\n  constructor(n, blacklist, rng) {\n    this.rng = rng;\n    this.size = n - blacklist.length;\n    const banned = new Set(blacklist);\n    this.remap = new Map();\n    let spare = this.size;\n    for (const b of blacklist) {\n      if (b >= this.size) continue;\n      while (banned.has(spare)) spare++;\n      this.remap.set(b, spare++);\n    }\n  }\n  pick() {\n    const r = Math.floor(this.rng() * this.size);\n    return this.remap.has(r) ? this.remap.get(r) : r;\n  }\n}\n",
    tests: [
      {
        name: "every possible draw gives a different allowed number (n = 10, blacklist 2, 3, 5)",
        body: "const n = 10;\nconst blacklist = [2, 3, 5];\nconst size = 7;\nconst out = [];\nfor (let r = 0; r < size; r++) {\n  out.push(new Solution(n, blacklist, () => (r + 0.5) / size).pick());\n}\nassert.deepEqual(out.slice().sort((a, b) => a - b), [0, 1, 4, 6, 7, 8, 9]);",
      },
      {
        name: "banned numbers among the spares are skipped (blacklist 1, 7, 8)",
        body: "const out = [];\nfor (let r = 0; r < 7; r++) out.push(new Solution(10, [1, 7, 8], () => (r + 0.5) / 7).pick());\nassert.deepEqual(out.slice().sort((a, b) => a - b), [0, 2, 3, 4, 5, 6, 9]);",
      },
      {
        name: "no blacklist: every number 0 .. n - 1",
        body: "const out = [];\nfor (let r = 0; r < 6; r++) out.push(new Solution(6, [], () => (r + 0.5) / 6).pick());\nassert.deepEqual(out, [0, 1, 2, 3, 4, 5]);",
      },
      {
        name: "only one number allowed",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst s = new Solution(5, [0, 1, 2, 4], seeded(1));\nfor (let t = 0; t < 30; t++) assert.equal(s.pick(), 3);",
      },
      {
        name: "works for every blacklist of every small n (unsorted input too)",
        body: "for (let n = 1; n <= 8; n++) {\n  for (let mask = 0; mask < (1 << n) - 1; mask++) {\n    const blacklist = [];\n    for (let i = n - 1; i >= 0; i--) if ((mask >> i) & 1) blacklist.push(i);\n    const size = n - blacklist.length;\n    const out = [];\n    for (let r = 0; r < size; r++) out.push(new Solution(n, blacklist, () => (r + 0.5) / size).pick());\n    const allowed = [];\n    for (let i = 0; i < n; i++) if (!blacklist.includes(i)) allowed.push(i);\n    assert.deepEqual(out.slice().sort((a, b) => a - b), allowed, 'n = ' + n + ', blacklist ' + blacklist.join(','));\n  }\n}",
      },
      {
        name: "at most one draw per pick",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst rng = counted(seeded(2));\nconst s = new Solution(100, [3, 4, 5, 90, 91], rng);\nfor (let t = 0; t < 200; t++) s.pick();\nassert.ok(rng.calls <= 200, 'used ' + rng.calls + ' draws for 200 picks');",
      },
      {
        name: "the allowed numbers are equally likely (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst s = new Solution(10, [2, 3, 5], seeded(3));\nconst counts = new Map([0, 1, 4, 6, 7, 8, 9].map((k) => [k, 0]));\nfor (let t = 0; t < 70000; t++) {\n  const v = s.pick();\n  assert.ok(counts.has(v), 'picked the banned or invalid number ' + v);\n  counts.set(v, counts.get(v) + 1);\n}\nassert.ok(chi([...counts.values()]) < 22.46, 'counts ' + [...counts.values()].join(', '));",
      },
      {
        name: "n = 10 ** 9 with a tiny blacklist is fast and never banned",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst blacklist = [0, 5, 999999999, 500000000, 7];\nconst banned = new Set(blacklist);\nconst s = new Solution(1000000000, blacklist, seeded(4));\nfor (let t = 0; t < 20000; t++) {\n  const v = s.pick();\n  assert.ok(v >= 0 && v < 1000000000 && !banned.has(v), 'bad pick ' + v);\n}",
      },
      {
        name: "a blacklist that fills most of the range still finds allowed numbers",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst blacklist = [];\nfor (let i = 0; i < 99990; i++) blacklist.push(i);\nconst s = new Solution(100000, blacklist, seeded(5));\nconst seen = new Set();\nfor (let t = 0; t < 2000; t++) seen.add(s.pick());\nassert.equal(seen.size, 10);\nassert.ok([...seen].every((v) => v >= 99990 && v < 100000));",
      },
    ],
  },
  {
    id: "ex-alias-method",
    chapter: "dsa-randomization-sampling",
    level: "advanced",
    title: "Alias Method: O(1) Weighted Picks",
    brief: "<p>Write two functions that pick from a fixed set of weights in O(1) per pick.</p><ul><li><code>buildAlias(weights)</code> takes positive numbers and returns <code>{ accept, alias }</code>, two arrays of length <code>n</code>. Picture <code>n</code> columns of equal height; column <code>c</code> is filled by outcome <code>c</code> up to the fraction <code>accept[c]</code> (between 0 and 1) and by outcome <code>alias[c]</code> for the rest</li><li><code>pickAlias({ accept, alias }, rng)</code> draws a column <code>c = Math.floor(rng() * n)</code>, then draws again and returns <code>c</code> if <code>rng() &lt; accept[c]</code> and <code>alias[c]</code> otherwise. That is exactly two draws per pick</li><li>The build must make outcome <code>i</code> come out with probability <code>weights[i] / sum(weights)</code>. Many different tables are valid; the tests check the probabilities they imply</li><li>Build in O(n)</li></ul>",
    starter: "function buildAlias(weights) {\n  // TODO: scale the weights to average 1, then pair each small outcome with a large one that fills its column\n}\n\nfunction pickAlias(table, rng) {\n  // TODO: choose a column, then choose between the column's own outcome and its alias\n}\n",
    hints: [
      "Multiply each weight by n / total, so the average is 1. An outcome below 1 is small and cannot fill a column alone; one at or above 1 is large.",
      "Keep a list of small and a list of large outcomes. Take one of each: column s keeps its own outcome with accept[s] = scaled[s], and alias[s] = l, the large one. The large one has given away 1 - scaled[s] of its height.",
      "Subtract that from scaled[l] (scaled[l] = scaled[l] + scaled[s] - 1) and put l back into the small or large list depending on its new height. Anything left over at the end has height 1 and keeps accept = 1.",
    ],
    solution: "function buildAlias(weights) {\n  const n = weights.length;\n  const total = weights.reduce((a, b) => a + b, 0);\n  const scaled = weights.map((w) => (w * n) / total);\n  const accept = new Array(n).fill(1);\n  const alias = new Array(n).fill(0);\n  for (let i = 0; i < n; i++) alias[i] = i;\n  const small = [];\n  const large = [];\n  scaled.forEach((height, i) => (height < 1 ? small : large).push(i));\n  while (small.length > 0 && large.length > 0) {\n    const s = small.pop();\n    const l = large.pop();\n    accept[s] = scaled[s];\n    alias[s] = l;\n    scaled[l] = scaled[l] + scaled[s] - 1;\n    (scaled[l] < 1 ? small : large).push(l);\n  }\n  return { accept, alias };\n}\n\nfunction pickAlias({ accept, alias }, rng) {\n  const column = Math.floor(rng() * accept.length);\n  return rng() < accept[column] ? column : alias[column];\n}\n",
    tests: [
      {
        name: "the tables imply the exact probabilities for 1, 3, 6, 10",
        body: "const weights = [1, 3, 6, 10];\nconst { accept, alias } = buildAlias(weights);\nconst n = weights.length;\nassert.equal(accept.length, n);\nassert.equal(alias.length, n);\nconst p = new Array(n).fill(0);\nfor (let c = 0; c < n; c++) {\n  assert.ok(accept[c] >= 0 && accept[c] <= 1 + 1e-12, 'accept out of range: ' + accept[c]);\n  assert.ok(Number.isInteger(alias[c]) && alias[c] >= 0 && alias[c] < n);\n  p[c] += accept[c] / n;\n  p[alias[c]] += (1 - accept[c]) / n;\n}\nfor (let i = 0; i < n; i++) assert.ok(Math.abs(p[i] - weights[i] / 20) < 1e-9, 'outcome ' + i + ' has probability ' + p[i]);",
      },
      {
        name: "equal weights give a plain uniform pick",
        body: "const { accept, alias } = buildAlias([2, 2, 2, 2, 2]);\nconst p = new Array(5).fill(0);\nfor (let c = 0; c < 5; c++) {\n  p[c] += accept[c] / 5;\n  p[alias[c]] += (1 - accept[c]) / 5;\n}\nfor (const x of p) assert.ok(Math.abs(x - 0.2) < 1e-9);",
      },
      {
        name: "a single outcome",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst table = buildAlias([5]);\nconst rng = seeded(1);\nfor (let t = 0; t < 20; t++) assert.equal(pickAlias(table, rng), 0);",
      },
      {
        name: "random weight lists: the implied probabilities match",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nconst rng = seeded(31);\nfor (let round = 0; round < 300; round++) {\n  const n = 1 + Math.floor(rng() * 9);\n  const weights = Array.from({ length: n }, () => 1 + Math.floor(rng() * 9));\n  const total = weights.reduce((a, b) => a + b, 0);\n  const { accept, alias } = buildAlias(weights);\n  const p = new Array(n).fill(0);\n  for (let c = 0; c < n; c++) {\n    p[c] += accept[c] / n;\n    p[alias[c]] += (1 - accept[c]) / n;\n  }\n  for (let i = 0; i < n; i++) assert.ok(Math.abs(p[i] - weights[i] / total) < 1e-9, 'weights ' + weights.join(',') + ', outcome ' + i);\n}",
      },
      {
        name: "pickAlias draws exactly twice per pick",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction counted(rng) {\n  const wrapped = () => { wrapped.calls++; return rng(); };\n  wrapped.calls = 0;\n  return wrapped;\n}\nconst table = buildAlias([1, 2, 3]);\nconst rng = counted(seeded(2));\nfor (let t = 0; t < 40; t++) pickAlias(table, rng);\nassert.equal(rng.calls, 80);",
      },
      {
        name: "pickAlias follows the table with scripted draws",
        body: "function scripted(values) {\n  let next = 0;\n  return function () {\n    if (next >= values.length) throw new Error('the script ran out of values: more draws than expected');\n    return values[next++];\n  };\n}\nconst table = { accept: [0.5, 1], alias: [1, 1] };\nassert.equal(pickAlias(table, scripted([0.1, 0.4])), 0);\nassert.equal(pickAlias(table, scripted([0.1, 0.6])), 1);\nassert.equal(pickAlias(table, scripted([0.9, 0.99])), 1);",
      },
      {
        name: "measured picks follow the weights (chi-square)",
        body: "function seeded(seed) {\n  let a = seed >>> 0;\n  return function () {\n    a = (a + 0x6d2b79f5) >>> 0;\n    let t = a;\n    t = Math.imul(t ^ (t >>> 15), t | 1);\n    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);\n    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;\n  };\n}\nfunction chi(observed) {\n  const total = observed.reduce((s, c) => s + c, 0);\n  const expected = total / observed.length;\n  let stat = 0;\n  for (const c of observed) stat += (c - expected) ** 2 / expected;\n  return stat;\n}\nconst weights = [1, 3, 6, 10];\nconst table = buildAlias(weights);\nconst rng = seeded(6);\nconst counts = [0, 0, 0, 0];\nconst trials = 200000;\nfor (let t = 0; t < trials; t++) counts[pickAlias(table, rng)]++;\nlet stat = 0;\nfor (let i = 0; i < 4; i++) {\n  const expected = (weights[i] / 20) * trials;\n  stat += (counts[i] - expected) ** 2 / expected;\n}\nassert.ok(stat < 16.27, 'counts ' + counts.join(', '));",
      },
      {
        name: "does not change the weights",
        body: "const weights = [4, 1, 7];\nbuildAlias(weights);\nassert.deepEqual(weights, [4, 1, 7]);",
      },
    ],
  },
];
