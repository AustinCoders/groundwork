import type { Exercise } from "../types";

export const dsaAddBasicRecursion: Exercise[] = [
  {
    "id": "ex-gcd-euclid",
    "chapter": "dsa-basic-recursion",
    "level": "beginner",
    "title": "Greatest Common Divisor (Euclid)",
    "brief": "<p>Write <code>gcd(a, b)</code>, the greatest common divisor of two integers, using Euclid's recursion.</p><ul><li>The result is never negative, even when an input is: <code>gcd(4, -6)</code> is <code>2</code></li><li><code>gcd(a, 0)</code> is the absolute value of <code>a</code>, and <code>gcd(0, 0)</code> is <code>0</code></li><li>It must finish quickly for inputs up to <code>2 ** 53</code>, so counting down from the smaller number is too slow</li><li>Remember that <code>%</code> in JavaScript keeps the sign of its left operand</li></ul>",
    "starter": "function gcd(a, b) {\n  // TODO: a base case, then a call on a strictly smaller second argument\n}\n",
    "hints": [
      "What is gcd(a, 0)? Nothing divides into 0 any more, so a is the answer. That is your base case.",
      "Any number that divides both a and b also divides a % b, so gcd(a, b) = gcd(b, a % b). The second argument gets strictly smaller, so the recursion ends.",
      "In JavaScript -6 % 4 is -2, so a negative can leak into the answer. Take Math.abs once, at the base case."
    ],
    "solution": "function gcd(a, b) {\n  if (b === 0) return Math.abs(a);\n  return gcd(b, a % b);\n}\n",
    "tests": [
      {
        "name": "a classic pair",
        "body": "assert.equal(gcd(84, 36), 12);\nassert.equal(gcd(36, 84), 12);\nassert.equal(gcd(48, 18), 6);"
      },
      {
        "name": "coprime numbers give 1",
        "body": "assert.equal(gcd(17, 5), 1);\nassert.equal(gcd(35, 64), 1);"
      },
      {
        "name": "one number divides the other",
        "body": "assert.equal(gcd(12, 4), 4);\nassert.equal(gcd(4, 12), 4);\nassert.equal(gcd(9, 9), 9);"
      },
      {
        "name": "zeros",
        "body": "assert.equal(gcd(5, 0), 5);\nassert.equal(gcd(0, 7), 7);\nassert.equal(gcd(0, 0), 0);"
      },
      {
        "name": "negative inputs give a non-negative answer",
        "body": "assert.equal(gcd(-4, 6), 2);\nassert.equal(gcd(4, -6), 2);\nassert.equal(gcd(-4, -6), 2);\nassert.equal(gcd(-9, 0), 9);"
      },
      {
        "name": "large inputs finish instantly",
        "body": "assert.equal(gcd(2 ** 50, 3 * 2 ** 49), 2 ** 49);\nassert.equal(gcd(10 ** 15, 10 ** 15 - 1), 1);\nassert.equal(gcd(9007199254740991, 1), 1);\nassert.equal(gcd(1346269, 832040), 1);"
      },
      {
        "name": "agrees with a counting-down reference on many pairs",
        "body": "const ref = (a, b) => { for (let d = Math.min(a, b); d >= 1; d--) if (a % d === 0 && b % d === 0) return d; return 1; };\nlet x = 7;\nfor (let i = 0; i < 400; i++) {\n  x = (x * 1103515245 + 12345) & 0x7fffffff;\n  const a = 1 + (x % 500);\n  x = (x * 1103515245 + 12345) & 0x7fffffff;\n  const b = 1 + (x % 500);\n  assert.equal(gcd(a, b), ref(a, b));\n}"
      }
    ]
  },
  {
    "id": "ex-tower-of-hanoi",
    "chapter": "dsa-basic-recursion",
    "level": "beginner",
    "title": "Tower of Hanoi: List the Moves",
    "brief": "<p>Three pegs are named <code>\"A\"</code>, <code>\"B\"</code> and <code>\"C\"</code>. <code>n</code> disks of different sizes sit on peg A, the largest at the bottom. Return the list of moves that carries them all to peg C.</p><ul><li>Each move is a two-element array <code>[from, to]</code>, for example <code>[\"A\", \"C\"]</code></li><li>One disk moves at a time, and a larger disk may never sit on a smaller one</li><li>Use the fewest moves possible: <code>2^n - 1</code></li><li><code>hanoi(0)</code> is the empty list</li></ul>",
    "starter": "function hanoi(n) {\n  // TODO: move n - 1 disks out of the way, move the largest one, move n - 1 back on top\n}\n",
    "hints": [
      "Trust the recursion: assume you can already move n - 1 disks between any two pegs. What are the three steps for n disks?",
      "Move n - 1 disks from the source to the spare peg, move the largest disk from the source to the target, then move the n - 1 disks from the spare onto the target.",
      "Write an inner helper move(count, from, to, via) that pushes onto a shared moves array. The roles of from, to and via rotate in the two recursive calls."
    ],
    "solution": "function hanoi(n) {\n  const moves = [];\n  function move(count, from, to, via) {\n    if (count === 0) return;\n    move(count - 1, from, via, to);\n    moves.push([from, to]);\n    move(count - 1, via, to, from);\n  }\n  move(n, \"A\", \"C\", \"B\");\n  return moves;\n}\n",
    "tests": [
      {
        "name": "no disks, no moves",
        "body": "assert.deepEqual(hanoi(0), []);"
      },
      {
        "name": "one disk moves straight across",
        "body": "assert.deepEqual(hanoi(1), [[\"A\", \"C\"]]);"
      },
      {
        "name": "two disks",
        "body": "assert.deepEqual(hanoi(2), [[\"A\", \"B\"], [\"A\", \"C\"], [\"B\", \"C\"]]);"
      },
      {
        "name": "three disks, in the standard order",
        "body": "assert.deepEqual(hanoi(3), [[\"A\", \"C\"], [\"A\", \"B\"], [\"C\", \"B\"], [\"A\", \"C\"], [\"B\", \"A\"], [\"B\", \"C\"], [\"A\", \"C\"]]);"
      },
      {
        "name": "the move count is 2^n - 1",
        "body": "for (let n = 0; n <= 14; n++) assert.equal(hanoi(n).length, 2 ** n - 1);"
      },
      {
        "name": "every move is legal and all disks end on C",
        "body": "for (let n = 1; n <= 10; n++) {\n  const pegs = { A: Array.from({ length: n }, (_, i) => n - i), B: [], C: [] };\n  for (const [from, to] of hanoi(n)) {\n    const disk = pegs[from].pop();\n    assert.ok(disk !== undefined, 'moved from an empty peg');\n    const top = pegs[to][pegs[to].length - 1];\n    assert.ok(top === undefined || top > disk, 'put a larger disk on a smaller one');\n    pegs[to].push(disk);\n  }\n  assert.deepEqual(pegs.C, Array.from({ length: n }, (_, i) => n - i));\n  assert.equal(pegs.A.length + pegs.B.length, 0);\n}"
      }
    ]
  },
  {
    "id": "ex-reverse-in-place-recursive",
    "chapter": "dsa-basic-recursion",
    "level": "beginner",
    "title": "Reverse an Array In Place, Recursively",
    "brief": "<p>Write <code>reverseChars(chars)</code> that reverses the array <b>in place</b> and returns the same array.</p><ul><li>Use recursion, and pass <b>indices</b> down rather than slicing: copying a smaller array on every call turns an O(n) job into O(n^2)</li><li>The array can be empty or have one element</li><li>The array is modified, not copied: the returned value must be the very array that was passed in</li></ul>",
    "starter": "function reverseChars(chars) {\n  // TODO: a helper that swaps chars[lo] and chars[hi], then recurses on lo + 1, hi - 1\n}\n",
    "hints": [
      "What is the smallest input you can answer without a recursive call? Think about both zero and one element left between the two indices.",
      "Swap the outer pair, then trust the recursion to reverse everything between them.",
      "Make the base case lo >= hi, not lo === hi: with an even length the indices cross without ever being equal."
    ],
    "solution": "function reverseChars(chars) {\n  function swapInward(lo, hi) {\n    if (lo >= hi) return;\n    [chars[lo], chars[hi]] = [chars[hi], chars[lo]];\n    swapInward(lo + 1, hi - 1);\n  }\n  swapInward(0, chars.length - 1);\n  return chars;\n}\n",
    "tests": [
      {
        "name": "an even length",
        "body": "assert.deepEqual(reverseChars(['a', 'b', 'c', 'd']), ['d', 'c', 'b', 'a']);"
      },
      {
        "name": "an odd length",
        "body": "assert.deepEqual(reverseChars([1, 2, 3, 4, 5]), [5, 4, 3, 2, 1]);"
      },
      {
        "name": "empty and single-element arrays",
        "body": "assert.deepEqual(reverseChars([]), []);\nassert.deepEqual(reverseChars(['x']), ['x']);"
      },
      {
        "name": "two elements swap",
        "body": "assert.deepEqual(reverseChars([1, 2]), [2, 1]);"
      },
      {
        "name": "the array is changed in place and returned",
        "body": "const arr = [1, 2, 3, 4];\nconst result = reverseChars(arr);\nassert.ok(result === arr, 'must return the same array object');\nassert.deepEqual(arr, [4, 3, 2, 1]);"
      },
      {
        "name": "repeated values stay in the right slots",
        "body": "assert.deepEqual(reverseChars([1, 1, 2, 3, 3, 3]), [3, 3, 3, 2, 1, 1]);"
      },
      {
        "name": "a few thousand elements",
        "body": "const n = 4000;\nconst arr = Array.from({ length: n }, (_, i) => i);\nreverseChars(arr);\nassert.equal(arr[0], n - 1);\nassert.equal(arr[n - 1], 0);\nassert.equal(arr[1234], n - 1 - 1234);"
      }
    ]
  },
  {
    "id": "ex-nested-list-depth-sum",
    "chapter": "dsa-basic-recursion",
    "level": "beginner",
    "title": "Nested List Depth Sum",
    "brief": "<p>You are given a nested list of integers: each element is either an integer or another nested list. Return the sum of every integer multiplied by its <b>depth</b>.</p><ul><li>Integers in the outermost list have depth 1, integers inside one inner list have depth 2, and so on</li><li>For <code>[[1, 1], 2, [1, 1]]</code> the answer is <code>1*2 + 1*2 + 2*1 + 1*2 + 1*2 = 10</code></li><li>For <code>[1, [4, [6]]]</code> the answer is <code>1*1 + 4*2 + 6*3 = 27</code></li><li>Empty lists contribute nothing, and integers can be negative</li></ul>",
    "starter": "function depthSum(nested) {\n  // TODO: carry the current depth down as a parameter of a helper\n}\n",
    "hints": [
      "The depth depends on where you are, not on what the children return, so carry it down as a parameter.",
      "A helper walk(list, depth) loops over the list: an array item recurses with depth + 1, a number adds number * depth.",
      "Start the helper at depth 1, and use Array.isArray to tell a list from an integer."
    ],
    "solution": "function depthSum(nested) {\n  function walk(list, depth) {\n    let total = 0;\n    for (const item of list) {\n      total += Array.isArray(item) ? walk(item, depth + 1) : item * depth;\n    }\n    return total;\n  }\n  return walk(nested, 1);\n}\n",
    "tests": [
      {
        "name": "the first example",
        "body": "assert.equal(depthSum([[1, 1], 2, [1, 1]]), 10);"
      },
      {
        "name": "the second example",
        "body": "assert.equal(depthSum([1, [4, [6]]]), 27);"
      },
      {
        "name": "a flat list has depth 1 throughout",
        "body": "assert.equal(depthSum([1, 2, 3, 4]), 10);"
      },
      {
        "name": "empty lists contribute nothing",
        "body": "assert.equal(depthSum([]), 0);\nassert.equal(depthSum([[]]), 0);\nassert.equal(depthSum([[], [[]], 5]), 5);"
      },
      {
        "name": "negative integers",
        "body": "assert.equal(depthSum([-1, [-2, [-3]]]), -1 + -4 + -9);"
      },
      {
        "name": "a single deeply nested integer",
        "body": "assert.equal(depthSum([[[[[7]]]]]), 35);"
      },
      {
        "name": "a long chain of nesting",
        "body": "let nested = [1];\nfor (let i = 0; i < 400; i++) nested = [nested];\nassert.equal(depthSum(nested), 401);"
      }
    ]
  },
  {
    "id": "ex-count-subsets-with-sum",
    "chapter": "dsa-basic-recursion",
    "level": "beginner",
    "title": "Count Subsets With a Given Sum",
    "brief": "<p>Return how many subsets of <code>nums</code> add up to <code>target</code>.</p><ul><li>A subset is a choice of positions, so equal values at different positions count separately: <code>[0, 0]</code> has four subsets, all summing to 0</li><li>The empty subset sums to 0 and counts when <code>target</code> is 0</li><li>Values can be zero or negative</li><li><code>nums</code> has at most about 20 elements, so a plain two-way recursion is fast enough</li></ul>",
    "starter": "function countSubsets(nums, target) {\n  // TODO: for each element, count the subsets that leave it out plus those that take it\n}\n",
    "hints": [
      "Think of it as a decision for each index: take nums[i] or leave it. That is two recursive calls per index.",
      "Carry down the index and the remaining target. Taking nums[i] subtracts it from the target; leaving it does not.",
      "The base case is reaching the end of the array: that is one subset if the remaining target is exactly 0, and none otherwise. Do not stop early when the target hits 0, because zeros and negatives can still follow."
    ],
    "solution": "function countSubsets(nums, target) {\n  function count(i, remaining) {\n    if (i === nums.length) return remaining === 0 ? 1 : 0;\n    return count(i + 1, remaining) + count(i + 1, remaining - nums[i]);\n  }\n  return count(0, target);\n}\n",
    "tests": [
      {
        "name": "the textbook case",
        "body": "assert.equal(countSubsets([1, 2, 3], 3), 2);"
      },
      {
        "name": "no subset reaches the target",
        "body": "assert.equal(countSubsets([1, 2, 4], 100), 0);\nassert.equal(countSubsets([2, 4, 6], 5), 0);"
      },
      {
        "name": "the empty array",
        "body": "assert.equal(countSubsets([], 0), 1);\nassert.equal(countSubsets([], 5), 0);"
      },
      {
        "name": "zeros multiply the count",
        "body": "assert.equal(countSubsets([0, 0], 0), 4);\nassert.equal(countSubsets([0, 0, 5], 5), 4);"
      },
      {
        "name": "negative values",
        "body": "assert.equal(countSubsets([-1, 1], 0), 2);\nassert.equal(countSubsets([3, -3, 2], 2), 2);"
      },
      {
        "name": "equal values at different positions are different subsets",
        "body": "assert.equal(countSubsets([2, 2, 3], 4), 1);\nassert.equal(countSubsets([2, 2, 2], 2), 3);"
      },
      {
        "name": "twenty elements finish quickly",
        "body": "const nums = Array.from({ length: 20 }, () => 1);\nassert.equal(countSubsets(nums, 10), 184756);\nassert.equal(countSubsets(nums, 21), 0);"
      }
    ]
  },
  {
    "id": "ex-palindrome-by-indices",
    "chapter": "dsa-basic-recursion",
    "level": "beginner",
    "title": "Palindrome Check With Recursion",
    "brief": "<p>Write <code>isPalindrome(s)</code> that returns <code>true</code> when the string reads the same forwards and backwards.</p><ul><li>Compare characters exactly: no case folding and no skipping of spaces or punctuation, so <code>\"Aa\"</code> is not a palindrome</li><li>The empty string and one-character strings are palindromes</li><li>Use recursion on <b>indices</b> (not <code>slice</code>), so each call does O(1) work</li><li>Both even and odd lengths must work</li></ul>",
    "starter": "function isPalindrome(s) {\n  // TODO: compare the outer pair, then trust a call on the inside\n}\n",
    "hints": [
      "The outer pair can settle a 'no' on its own. If they match, the answer is whatever the inside says.",
      "Carry two indices lo and hi through a helper. They move toward each other by one on each call.",
      "The base case must cover both zero and one characters left: use lo >= hi. With lo === hi an even-length string would run past the middle forever."
    ],
    "solution": "function isPalindrome(s) {\n  function check(lo, hi) {\n    if (lo >= hi) return true;\n    if (s[lo] !== s[hi]) return false;\n    return check(lo + 1, hi - 1);\n  }\n  return check(0, s.length - 1);\n}\n",
    "tests": [
      {
        "name": "odd-length palindromes",
        "body": "assert.equal(isPalindrome('racecar'), true);\nassert.equal(isPalindrome('abcba'), true);"
      },
      {
        "name": "even-length palindromes",
        "body": "assert.equal(isPalindrome('abba'), true);\nassert.equal(isPalindrome('aa'), true);"
      },
      {
        "name": "short strings",
        "body": "assert.equal(isPalindrome(''), true);\nassert.equal(isPalindrome('x'), true);"
      },
      {
        "name": "not palindromes",
        "body": "assert.equal(isPalindrome('abca'), false);\nassert.equal(isPalindrome('ab'), false);\nassert.equal(isPalindrome('abcd'), false);"
      },
      {
        "name": "the difference is in the middle",
        "body": "assert.equal(isPalindrome('abcxdcba'), false);\nassert.equal(isPalindrome('abxyba'), false);"
      },
      {
        "name": "comparison is exact",
        "body": "assert.equal(isPalindrome('Aa'), false);\nassert.equal(isPalindrome('a b a'), true);\nassert.equal(isPalindrome('ab ab'), false);"
      },
      {
        "name": "a long palindrome",
        "body": "const half = 'abc'.repeat(1500);\nassert.equal(isPalindrome(half + [...half].reverse().join('')), true);\nassert.equal(isPalindrome(half + 'x' + [...half].reverse().join('')), true);\nassert.equal(isPalindrome(half + 'y' + half), false);"
      }
    ]
  },
  {
    "id": "ex-tree-height-explicit-stack",
    "chapter": "dsa-basic-recursion",
    "level": "intermediate",
    "title": "Tree Height Without Recursion",
    "brief": "<p>A binary tree node is an object <code>{ left, right }</code> where each child is another node or <code>null</code>. Return the height of the tree: the number of nodes on the longest path from the root down to a leaf. An empty tree (<code>null</code>) has height <code>0</code>.</p><ul><li>Do <b>not</b> use recursion: one test builds a chain 200,000 nodes deep, which overflows the call stack of a recursive solution</li><li>Keep your own stack of frames instead, each frame holding a node and its depth</li><li>Run time should be O(n)</li></ul>",
    "starter": "function treeHeight(root) {\n  // TODO: an array as the stack; push [node, depth] frames instead of making calls\n}\n",
    "hints": [
      "A recursive call is just 'a node plus where I am'. Put those two things in an array and push it instead of calling.",
      "Pop a frame, update the best depth seen so far, then push its non-null children with depth + 1.",
      "You do not need to return anything up: the answer is the maximum depth over all frames you ever pop."
    ],
    "solution": "function treeHeight(root) {\n  if (root === null) return 0;\n  let best = 0;\n  const stack = [[root, 1]];\n  while (stack.length) {\n    const [node, depth] = stack.pop();\n    if (depth > best) best = depth;\n    if (node.left) stack.push([node.left, depth + 1]);\n    if (node.right) stack.push([node.right, depth + 1]);\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "an empty tree",
        "body": "assert.equal(treeHeight(null), 0);"
      },
      {
        "name": "a single node",
        "body": "assert.equal(treeHeight({ left: null, right: null }), 1);"
      },
      {
        "name": "a small balanced tree",
        "body": "const leaf = () => ({ left: null, right: null });\nconst tree = { left: { left: leaf(), right: leaf() }, right: leaf() };\nassert.equal(treeHeight(tree), 3);"
      },
      {
        "name": "the deepest path is on the right",
        "body": "const leaf = () => ({ left: null, right: null });\nconst tree = { left: leaf(), right: { left: null, right: { left: null, right: leaf() } } };\nassert.equal(treeHeight(tree), 4);"
      },
      {
        "name": "the deepest path is on the left",
        "body": "const leaf = () => ({ left: null, right: null });\nconst tree = { left: { left: { left: leaf(), right: null }, right: null }, right: leaf() };\nassert.equal(treeHeight(tree), 4);"
      },
      {
        "name": "a 200,000-node left chain does not overflow the stack",
        "body": "let root = null;\nfor (let i = 0; i < 200000; i++) root = { left: root, right: null };\nassert.equal(treeHeight(root), 200000);"
      },
      {
        "name": "a 200,000-node zigzag chain",
        "body": "let root = null;\nfor (let i = 0; i < 200000; i++) root = i % 2 ? { left: root, right: null } : { left: null, right: root };\nassert.equal(treeHeight(root), 200000);"
      },
      {
        "name": "random trees agree with the recursive definition",
        "body": "const ref = (n) => (n === null ? 0 : 1 + Math.max(ref(n.left), ref(n.right)));\nlet seed = 11;\nconst rnd = () => ((seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff);\nconst build = (n) => {\n  if (n === 0) return null;\n  const left = Math.floor(rnd() * n);\n  return { left: build(left), right: build(n - 1 - left) };\n};\nfor (let i = 0; i < 200; i++) {\n  const tree = build(Math.floor(rnd() * 40));\n  assert.equal(treeHeight(tree), ref(tree));\n}"
      }
    ]
  },
  {
    "id": "ex-sum-numbers-in-object",
    "chapter": "dsa-basic-recursion",
    "level": "intermediate",
    "title": "Sum Every Number in a Nested Structure",
    "brief": "<p>Write <code>sumNumbers(value)</code> that adds up every finite number found anywhere inside <code>value</code>, which may be a number, a string, <code>null</code>, an array, or an object whose values can again be any of these.</p><ul><li>Strings, booleans, <code>null</code> and <code>undefined</code> are ignored: the string <code>\"5\"</code> is not a number</li><li>Numbers that are not finite (<code>NaN</code>, <code>Infinity</code>) are ignored</li><li>The structure may contain a <b>cycle</b> (an object that contains itself): it must not recurse forever</li><li>An array or object that is reachable by more than one route is counted once, not once per route</li><li>Beware: <code>typeof null</code> is <code>\"object\"</code></li></ul>",
    "starter": "function sumNumbers(value) {\n  // TODO: numbers are leaves, arrays and objects are nodes, and remember what you have already entered\n}\n",
    "hints": [
      "Treat a number as a leaf and any non-null object (an array is an object too) as a node whose children are Object.values(node).",
      "Check for null before checking typeof is 'object', or Object.values(null) will throw.",
      "Keep a Set of the containers you have already entered. If you meet one again, return 0 for it. That stops cycles and double counting together."
    ],
    "solution": "function sumNumbers(value) {\n  const seen = new Set();\n  function walk(node) {\n    if (typeof node === \"number\") return Number.isFinite(node) ? node : 0;\n    if (node === null || typeof node !== \"object\") return 0;\n    if (seen.has(node)) return 0;\n    seen.add(node);\n    let total = 0;\n    for (const child of Object.values(node)) total += walk(child);\n    return total;\n  }\n  return walk(value);\n}\n",
    "tests": [
      {
        "name": "numbers inside arrays and objects",
        "body": "assert.equal(sumNumbers({ a: 1, b: [2, { c: 3 }], d: 'x' }), 6);"
      },
      {
        "name": "a bare number or string",
        "body": "assert.equal(sumNumbers(7), 7);\nassert.equal(sumNumbers('7'), 0);"
      },
      {
        "name": "null and other non-numbers are ignored",
        "body": "assert.equal(sumNumbers(null), 0);\nassert.equal(sumNumbers([null, undefined, true, '5', 1]), 1);\nassert.equal(sumNumbers({ a: null, b: { c: null, d: 2 } }), 2);"
      },
      {
        "name": "non-finite numbers are ignored",
        "body": "assert.equal(sumNumbers([1, NaN, Infinity, -Infinity, 2]), 3);"
      },
      {
        "name": "empty containers",
        "body": "assert.equal(sumNumbers([]), 0);\nassert.equal(sumNumbers({}), 0);\nassert.equal(sumNumbers([[], {}, [[]]]), 0);"
      },
      {
        "name": "a cycle does not recurse forever",
        "body": "const a = { x: 1 };\na.self = a;\nassert.equal(sumNumbers(a), 1);\nconst list = [1, 2];\nlist.push(list);\nassert.equal(sumNumbers(list), 3);"
      },
      {
        "name": "a shared container is counted once",
        "body": "const shared = { x: 10 };\nassert.equal(sumNumbers([shared, shared, { y: shared }]), 10);"
      },
      {
        "name": "negative numbers and decimals",
        "body": "assert.equal(sumNumbers([-1, [0.5, { a: -0.5 }]]), -1);"
      },
      {
        "name": "a deeply nested chain",
        "body": "let value = 5;\nfor (let i = 0; i < 500; i++) value = [value];\nassert.equal(sumNumbers(value), 5);"
      }
    ]
  },
  {
    "id": "ex-modular-power",
    "chapter": "dsa-basic-recursion",
    "level": "intermediate",
    "title": "Modular Exponentiation With BigInt",
    "brief": "<p>Write <code>powMod(base, exp, mod)</code> that returns <code>(base ** exp) % mod</code> without ever building the huge power. All three arguments and the result are <b>BigInt</b> values.</p><ul><li><code>base</code> and <code>exp</code> are non-negative, and <code>mod</code> is at least 1</li><li>Use the halving idea from fast exponentiation, reducing modulo <code>mod</code> after every multiplication</li><li><code>exp</code> can be as large as <code>10n ** 18n</code>, so the loop or recursion must run about log2(exp) times</li><li>Products of two residues do not fit in a plain number, which is why BigInt is required</li><li>Anything to the power <code>0n</code> is <code>1n</code> modulo <code>mod</code>, and every result modulo <code>1n</code> is <code>0n</code></li></ul>",
    "starter": "function powMod(base, exp, mod) {\n  // TODO: halve the exponent each step, reducing modulo mod after every product\n}\n",
    "hints": [
      "Reduce the base modulo mod first. Then x^n is (x*x)^(n/2) for even n, and x * (x*x)^((n-1)/2) for odd n.",
      "Loop form: keep result and base. While exp is above 0n, multiply result by base when the lowest bit of exp is set, square base, and shift exp right by one bit.",
      "Take % mod after every multiplication, and make sure the answer for mod = 1n is 0n, not 1n."
    ],
    "solution": "function powMod(base, exp, mod) {\n  let result = 1n % mod;\n  base %= mod;\n  while (exp > 0n) {\n    if (exp & 1n) result = (result * base) % mod;\n    base = (base * base) % mod;\n    exp >>= 1n;\n  }\n  return result;\n}\n",
    "tests": [
      {
        "name": "small powers",
        "body": "assert.equal(powMod(2n, 10n, 1000n), 24n);\nassert.equal(powMod(3n, 4n, 5n), 1n);\nassert.equal(powMod(7n, 1n, 100n), 7n);"
      },
      {
        "name": "an exponent of zero",
        "body": "assert.equal(powMod(5n, 0n, 13n), 1n);\nassert.equal(powMod(0n, 0n, 13n), 1n);"
      },
      {
        "name": "a modulus of one",
        "body": "assert.equal(powMod(5n, 3n, 1n), 0n);\nassert.equal(powMod(5n, 0n, 1n), 0n);"
      },
      {
        "name": "a base of zero or larger than the modulus",
        "body": "assert.equal(powMod(0n, 5n, 7n), 0n);\nassert.equal(powMod(100n, 5n, 7n), 4n);"
      },
      {
        "name": "a typical contest-style modulus",
        "body": "assert.equal(powMod(2n, 1000000n, 1000000007n), 235042059n);"
      },
      {
        "name": "agrees with the direct power on many small cases",
        "body": "for (let b = 0n; b < 30n; b++) {\n  for (let e = 0n; e < 25n; e++) {\n    for (const m of [1n, 2n, 7n, 97n, 1000n]) {\n      assert.equal(powMod(b, e, m), (b ** e) % m);\n    }\n  }\n}"
      },
      {
        "name": "a gigantic exponent finishes at once",
        "body": "const m = 1000000007n;\nassert.equal(powMod(2n, m - 1n, m), 1n);\nconst r = powMod(3n, 10n ** 18n, m);\nassert.ok(r >= 0n && r < m);\nassert.equal(powMod(3n, 10n ** 18n + 1n, m), (r * 3n) % m);"
      }
    ]
  },
];
