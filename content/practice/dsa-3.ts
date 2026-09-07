import type { Exercise } from "../types";

export const dsa3: Exercise[] = [
{
    id: "ex-gray-code",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "Gray Code",
    brief:
      "<p>Given <code>n</code>, return an <em>n</em>-bit gray code sequence: an array of <code>2**n</code> integers where</p><ul><li>the first entry is <code>0</code></li><li>every value in <code>[0, 2**n)</code> appears exactly once</li><li>consecutive entries differ in exactly one bit, and so do the last and first entries (the sequence wraps around)</li></ul><p><b>Any</b> sequence meeting those rules is accepted — there is more than one valid answer. <code>n = 0</code> returns <code>[0]</code>.</p>",
    starter: "function grayCode(n) {\n  // TODO: produce 2**n values where neighbours differ by a single bit\n}\n",
    hints: [
      "Try building it up: given a valid sequence for n-1 bits, how can you extend it to n bits without breaking the one-bit rule at the seam?",
      "Mirror it. Take the previous list, then append it again in reverse with the new high bit set. Reflecting means the two halves meet at a pair that differs only in that new bit.",
      "There is also a one-liner: the i-th gray code is `i ^ (i >> 1)`. Loop i from 0 to 2**n - 1 and map each one.",
    ],
    solution:
      "function grayCode(n) {\n  const out = [];\n  const total = 1 << n;\n  for (let i = 0; i < total; i++) {\n    out.push(i ^ (i >> 1));\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "n = 0 is a single zero",
        body: "assert.deepEqual(grayCode(0), [0]);",
      },
      {
        name: "n = 1 covers both one-bit values",
        body: "const out = grayCode(1);\nassert.equal(out.length, 2);\nassert.equal(out[0], 0);\nassert.equal(out[1], 1);",
      },
      {
        name: "n = 3 has the right shape",
        body: "const out = grayCode(3);\nassert.equal(out.length, 8);\nassert.equal(out[0], 0);\nassert.equal(new Set(out).size, 8);\nfor (const v of out) assert.ok(v >= 0 && v < 8, 'values must stay inside [0, 2**n)');",
      },
      {
        name: "n = 4 — neighbours differ by exactly one bit, wrapping around",
        body: "const out = grayCode(4);\nassert.equal(out.length, 16);\nassert.equal(out[0], 0);\nassert.equal(new Set(out).size, 16);\nfor (let i = 0; i < out.length; i++) {\n  const d = out[i] ^ out[(i + 1) % out.length];\n  assert.ok(d !== 0 && (d & (d - 1)) === 0, 'entries ' + i + ' and ' + ((i + 1) % out.length) + ' must differ in exactly one bit');\n}",
      },
      {
        name: "n = 8 still satisfies every rule",
        body: "const out = grayCode(8);\nassert.equal(out.length, 256);\nassert.equal(out[0], 0);\nassert.equal(new Set(out).size, 256);\nfor (let i = 0; i < out.length; i++) {\n  const d = out[i] ^ out[(i + 1) % out.length];\n  assert.ok(d !== 0 && (d & (d - 1)) === 0, 'one-bit rule broken at index ' + i);\n}",
      },
    ],
  },
{
    id: "ex-maximum-xor-of-two-numbers",
    chapter: "dsa-tries",
    level: "advanced",
    title: "Maximum XOR of Two Numbers in an Array",
    brief:
      "<p>Given an array <code>nums</code>, return the largest value of <code>nums[i] ^ nums[j]</code> over all pairs of indices (i and j may be equal).</p><ul><li>Every value satisfies <code>0 &lt;= nums[i] &lt; 2**31</code>, so results always stay non-negative</li><li>The array can hold hundreds of thousands of values, so the <code>O(n^2)</code> double loop is out — aim for <b>O(n · 31)</b></li><li>A one-element array answers 0, since XOR-ing a value with itself gives 0</li></ul>",
    starter: "function findMaximumXOR(nums) {\n  // TODO: decide the answer one bit at a time, highest bit first\n}\n",
    hints: [
      "Build the answer greedily from bit 30 downward: at each step ask 'can any pair produce a 1 here, on top of the bits I already locked in?'",
      "Keep a growing prefix mask. Put every `num & mask` into a Set, then for the candidate answer `c` check whether some prefix `p` has `c ^ p` also in the Set — that is exactly a pair whose XOR starts with `c`.",
      "The Set-of-prefixes trick is the flat version of a binary trie: inserting each number bit by bit and, for every number, walking the trie preferring the opposite bit at each level gives the same O(n · 31) result.",
    ],
    solution:
      "function findMaximumXOR(nums) {\n  let max = 0;\n  let mask = 0;\n  for (let bit = 30; bit >= 0; bit--) {\n    mask |= 1 << bit;\n    const prefixes = new Set();\n    for (const n of nums) prefixes.add(n & mask);\n    const candidate = max | (1 << bit);\n    for (const p of prefixes) {\n      if (prefixes.has(candidate ^ p)) {\n        max = candidate;\n        break;\n      }\n    }\n  }\n  return max;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(findMaximumXOR([3, 10, 5, 25, 2, 8]), 28);",
      },
      {
        name: "single element",
        body: "assert.equal(findMaximumXOR([0]), 0);",
      },
      {
        name: "small three-element array",
        body: "assert.equal(findMaximumXOR([8, 10, 2]), 10);",
      },
      {
        name: "longer array with repeats",
        body: "assert.equal(findMaximumXOR([14, 70, 53, 83, 49, 91, 36, 80, 92, 51, 66, 70]), 127);",
      },
      {
        name: "large input must not use the O(n^2) loop",
        body: "const nums = [];\nfor (let i = 0; i < 60000; i++) nums.push((i * 2654435761) % 2147483647);\nnums.push(0);\nnums.push(2147483647);\nassert.equal(findMaximumXOR(nums), 2147483647);",
      },
    ],
  },
{
    id: "ex-utf8-validation",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "UTF-8 Validation",
    brief:
      "<p>Given an array <code>data</code> of integers where <b>only the lowest 8 bits of each entry are meaningful</b>, decide whether the bytes form a valid UTF-8 encoding.</p><p>A UTF-8 character is 1 to 4 bytes and its leading byte announces the length:</p><ul><li>1 byte: <code>0xxxxxxx</code></li><li>2 bytes: <code>110xxxxx</code></li><li>3 bytes: <code>1110xxxx</code></li><li>4 bytes: <code>11110xxx</code></li><li>every continuation byte must look like <code>10xxxxxx</code></li></ul><p>Any other leading pattern (such as <code>10xxxxxx</code> in leading position, or <code>111110xx</code>) is invalid, as is a character whose continuation bytes run off the end of the array. An empty array is valid.</p>",
    starter:
      "function validUtf8(data) {\n  // TODO: read a leading byte, then verify exactly that many continuation bytes\n}\n",
    hints: [
      "Mask each entry with `& 0xff` first — the problem says the upper bits are noise and must be ignored.",
      "Count how many 1s the byte starts with. `byte >> 7`, `byte >> 5`, `byte >> 4`, `byte >> 3` compared against 0, 0b110, 0b1110 and 0b11110 tell you the character length; anything else is invalid immediately.",
      "After a leading byte of length k, the next k-1 bytes must each satisfy `(b >> 6) === 0b10`. Bail out if the array ends early, and remember a length of 1 needs no continuations at all.",
    ],
    solution:
      "function validUtf8(data) {\n  let i = 0;\n  while (i < data.length) {\n    const byte = data[i] & 0xff;\n    let length;\n    if (byte >> 7 === 0) length = 1;\n    else if (byte >> 5 === 0b110) length = 2;\n    else if (byte >> 4 === 0b1110) length = 3;\n    else if (byte >> 3 === 0b11110) length = 4;\n    else return false;\n    if (i + length > data.length) return false;\n    for (let j = 1; j < length; j++) {\n      if ((data[i + j] & 0xff) >> 6 !== 0b10) return false;\n    }\n    i += length;\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "valid two-byte character",
        body: "assert.equal(validUtf8([197, 130, 1]), true);",
      },
      {
        name: "broken continuation byte",
        body: "assert.equal(validUtf8([235, 140, 4]), false);",
      },
      {
        name: "valid four-byte and three-byte characters",
        body: "assert.equal(validUtf8([240, 162, 138, 147]), true);\nassert.equal(validUtf8([228, 184, 173]), true);",
      },
      {
        name: "continuation byte in leading position, and illegal prefixes",
        body: "assert.equal(validUtf8([145]), false);\nassert.equal(validUtf8([255]), false);\nassert.equal(validUtf8([248, 130, 130, 130, 130]), false);",
      },
      {
        name: "empty array, plain ASCII, and truncated characters",
        body: "assert.equal(validUtf8([]), true);\nassert.equal(validUtf8([0, 65, 127]), true);\nassert.equal(validUtf8([237]), false);\nassert.equal(validUtf8([240, 162, 138]), false);",
      },
    ],
  },
{
    id: "ex-count-triplets-equal-xor",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Count Triplets That Can Form Two Arrays of Equal XOR",
    brief:
      "<p>Given an array <code>arr</code>, count the triplets of indices <code>(i, j, k)</code> with <code>0 &lt;= i &lt; j &lt;= k &lt; arr.length</code> such that</p><ul><li><code>a</code> = XOR of <code>arr[i] .. arr[j - 1]</code></li><li><code>b</code> = XOR of <code>arr[j] .. arr[k]</code></li><li>and <code>a === b</code></li></ul><p>Return how many such triplets exist. The triple loop is <code>O(n^3)</code> — do better than that.</p>",
    starter:
      "function countTriplets(arr) {\n  // TODO: prefix XOR turns the condition into something j no longer appears in\n}\n",
    hints: [
      "Define `pre[t]` as the XOR of the first t elements. Then a = pre[j] ^ pre[i] and b = pre[k+1] ^ pre[j].",
      "Set a === b and simplify: the pre[j] terms cancel, leaving `pre[i] === pre[k+1]`. The condition does not mention j at all.",
      "So for every pair i < k with pre[i] === pre[k+1], every j in (i, k] works — that is `k - i` triplets. Sum that over all valid pairs.",
    ],
    solution:
      "function countTriplets(arr) {\n  const n = arr.length;\n  const pre = new Array(n + 1).fill(0);\n  for (let i = 0; i < n; i++) pre[i + 1] = pre[i] ^ arr[i];\n  let count = 0;\n  for (let i = 0; i < n; i++) {\n    for (let k = i + 1; k < n; k++) {\n      if (pre[i] === pre[k + 1]) count += k - i;\n    }\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(countTriplets([2, 3, 1, 6, 7]), 4);",
      },
      {
        name: "all equal values",
        body: "assert.equal(countTriplets([1, 1, 1, 1, 1]), 10);",
      },
      {
        name: "no triplet exists",
        body: "assert.equal(countTriplets([2, 3]), 0);\nassert.equal(countTriplets([5]), 0);\nassert.equal(countTriplets([]), 0);",
      },
      {
        name: "sparse matches",
        body: "assert.equal(countTriplets([1, 3, 5, 7, 9]), 3);",
      },
      {
        name: "longer mixed array",
        body: "assert.equal(countTriplets([7, 11, 12, 9, 5, 2, 7, 17, 22]), 8);",
      },
    ],
  },
{
    id: "ex-min-flips-a-or-b-equals-c",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "Minimum Flips to Make a OR b Equal to c",
    brief:
      "<p>Given three non-negative integers <code>a</code>, <code>b</code> and <code>c</code>, return the minimum number of single-bit flips (in <code>a</code> and/or <code>b</code>) needed so that <code>(a | b) === c</code>.</p><ul><li>A flip changes one bit of <code>a</code> or one bit of <code>b</code> from 0 to 1 or from 1 to 0; <code>c</code> is never modified</li><li>All three fit in a signed 32-bit integer, so 32 bit positions are enough</li><li>If <code>(a | b)</code> already equals <code>c</code> the answer is 0</li></ul>",
    starter: "function minFlips(a, b, c) {\n  // TODO: each bit position is an independent little decision\n}\n",
    hints: [
      "Bit positions do not interact — walk all 32 of them and add up the cost of each one independently.",
      "When c's bit is 0, every 1 among a's and b's bits at that position must be cleared, so the cost is `aBit + bBit` (0, 1 or 2).",
      "When c's bit is 1, you need at least one 1 — the cost is 1 if both a and b are 0 there, otherwise 0.",
    ],
    solution:
      "function minFlips(a, b, c) {\n  let flips = 0;\n  for (let i = 0; i < 32; i++) {\n    const x = (a >>> i) & 1;\n    const y = (b >>> i) & 1;\n    const z = (c >>> i) & 1;\n    if (z === 0) flips += x + y;\n    else if (x === 0 && y === 0) flips += 1;\n  }\n  return flips;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(minFlips(2, 6, 5), 3);",
      },
      {
        name: "one flip is enough",
        body: "assert.equal(minFlips(4, 2, 7), 1);",
      },
      {
        name: "already satisfied",
        body: "assert.equal(minFlips(1, 2, 3), 0);\nassert.equal(minFlips(0, 0, 0), 0);",
      },
      {
        name: "mixed clears and sets",
        body: "assert.equal(minFlips(8, 3, 5), 3);",
      },
      {
        name: "high bit positions still counted",
        body: "assert.equal(minFlips(1073741824, 0, 0), 1);\nassert.equal(minFlips(0, 0, 1073741824), 1);\nassert.equal(minFlips(1073741824, 1073741824, 0), 2);",
      },
    ],
  },
{
    id: "ex-xor-sum-of-pairwise-and",
    chapter: "dsa-bit-manipulation",
    level: "advanced",
    title: "Find XOR Sum of All Pairs Bitwise AND",
    brief:
      "<p>Given two arrays <code>arr1</code> and <code>arr2</code> of non-negative integers, consider every pair <code>(i, j)</code> and the value <code>arr1[i] &amp; arr2[j]</code>. Return the XOR of all <code>arr1.length * arr2.length</code> of those values.</p><ul><li>Both arrays can hold up to 100000 values, so materialising every pair is far too slow — the answer must come out in <b>O(n + m)</b></li><li>Neither array is empty</li></ul>",
    starter: "function getXORSum(arr1, arr2) {\n  // TODO: do not build the pairs — find the algebraic shortcut\n}\n",
    hints: [
      "Expand a tiny case by hand, say arr1 = [x, y] and arr2 = [p, q], and write the XOR of all four ANDs out in full.",
      "AND distributes over XOR: `(x & p) ^ (x & q)` is `x & (p ^ q)`. Group the terms by the arr1 element.",
      "Applying that in both directions collapses everything to `(XOR of arr1) & (XOR of arr2)` — two independent linear passes.",
    ],
    solution:
      "function getXORSum(arr1, arr2) {\n  let x = 0;\n  let y = 0;\n  for (const v of arr1) x ^= v;\n  for (const v of arr2) y ^= v;\n  return x & y;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(getXORSum([1, 2, 3], [6, 5]), 0);",
      },
      {
        name: "single element each",
        body: "assert.equal(getXORSum([12], [4]), 4);",
      },
      {
        name: "three by three",
        body: "assert.equal(getXORSum([2, 8, 4], [3, 7, 1]), 4);",
      },
      {
        name: "zeros wipe the result out",
        body: "assert.equal(getXORSum([0], [1, 2, 3]), 0);\nassert.equal(getXORSum([5, 5], [7]), 0);",
      },
      {
        name: "large inputs must not enumerate the pairs",
        body: "const a = [];\nconst b = [];\nfor (let i = 0; i < 100000; i++) a.push(i & 1023);\nfor (let i = 0; i < 100000; i++) b.push((i * 3) & 1023);\nlet x = 0;\nlet y = 0;\nfor (const v of a) x ^= v;\nfor (const v of b) y ^= v;\nassert.equal(getXORSum(a, b), x & y);",
      },
    ],
  },
{
    id: "ex-decode-xored-array",
    chapter: "dsa-bit-manipulation",
    level: "beginner",
    title: "Decode XORed Array",
    brief:
      "<p>An array <code>arr</code> of <code>n</code> non-negative integers was encoded into an array <code>encoded</code> of length <code>n - 1</code>, where <code>encoded[i] === arr[i] ^ arr[i + 1]</code>. Given <code>encoded</code> and the first element <code>first</code>, rebuild and return <code>arr</code>.</p><ul><li>The answer is always unique</li><li><code>encoded</code> may be empty, in which case <code>arr</code> is just <code>[first]</code></li></ul>",
    starter: "function decode(encoded, first) {\n  // TODO: walk forward, recovering one element at a time\n}\n",
    hints: [
      "XOR is its own inverse: if `e === x ^ y` then `y === e ^ x`. That is the whole problem.",
      "You already know arr[0] — it is `first`. Use encoded[0] to get arr[1], then encoded[1] to get arr[2], and so on.",
      "Push `first` into the result, then for each `e` in encoded push `result[result.length - 1] ^ e`.",
    ],
    solution:
      "function decode(encoded, first) {\n  const arr = [first];\n  for (const e of encoded) {\n    arr.push(arr[arr.length - 1] ^ e);\n  }\n  return arr;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.deepEqual(decode([1, 2, 3], 1), [1, 0, 2, 1]);",
      },
      {
        name: "longer encoding",
        body: "assert.deepEqual(decode([6, 2, 7, 3], 4), [4, 2, 0, 7, 4]);",
      },
      {
        name: "empty encoding",
        body: "assert.deepEqual(decode([], 5), [5]);",
      },
      {
        name: "a zero in the encoding repeats the value",
        body: "assert.deepEqual(decode([0], 9), [9, 9]);",
      },
      {
        name: "round-trips against a freshly built encoding",
        body: "const original = [11, 4, 27, 3, 0, 64, 1000];\nconst encoded = [];\nfor (let i = 0; i + 1 < original.length; i++) encoded.push(original[i] ^ original[i + 1]);\nassert.deepEqual(decode(encoded, original[0]), original);",
      },
    ],
  },
{
    id: "ex-xor-queries-of-a-subarray",
    chapter: "dsa-bit-manipulation",
    level: "intermediate",
    title: "XOR Queries of a Subarray",
    brief:
      "<p>Given an array <code>arr</code> and a list of <code>queries</code>, where each query is a pair <code>[left, right]</code>, return an array whose i-th entry is the XOR of <code>arr[left] ^ arr[left + 1] ^ ... ^ arr[right]</code> for that query.</p><ul><li>Both bounds are <b>inclusive</b>, and <code>left &lt;= right</code></li><li>There can be tens of thousands of queries, so re-scanning the range each time is too slow — answer each query in <b>O(1)</b> after linear preprocessing</li><li><code>queries</code> may be empty, in which case return an empty array</li></ul>",
    starter:
      "function xorQueries(arr, queries) {\n  // TODO: precompute something once so each query is a single operation\n}\n",
    hints: [
      "This is the prefix-sum idea with XOR in place of addition — and it works because XOR, like addition, is invertible.",
      "Build `pre` where `pre[t]` is the XOR of the first t elements: `pre[0] = 0` and `pre[t + 1] = pre[t] ^ arr[t]`.",
      "Then the XOR over [left, right] is `pre[right + 1] ^ pre[left]` — the shared front half cancels itself out.",
    ],
    solution:
      "function xorQueries(arr, queries) {\n  const pre = new Array(arr.length + 1).fill(0);\n  for (let i = 0; i < arr.length; i++) pre[i + 1] = pre[i] ^ arr[i];\n  return queries.map((q) => pre[q[1] + 1] ^ pre[q[0]]);\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.deepEqual(\n  xorQueries([1, 3, 4, 8], [[0, 1], [1, 2], [0, 3], [3, 3]]),\n  [2, 7, 14, 8]\n);",
      },
      {
        name: "second example",
        body: "assert.deepEqual(\n  xorQueries([4, 8, 2, 10], [[2, 3], [1, 3], [0, 0], [0, 3]]),\n  [8, 0, 4, 4]\n);",
      },
      {
        name: "single element array and empty query list",
        body: "assert.deepEqual(xorQueries([7], [[0, 0]]), [7]);\nassert.deepEqual(xorQueries([7], []), []);",
      },
      {
        name: "repeated and overlapping ranges",
        body: "assert.deepEqual(\n  xorQueries([5, 5, 5], [[0, 1], [0, 2], [1, 2], [2, 2]]),\n  [0, 5, 0, 5]\n);",
      },
      {
        name: "many queries against a linear reference",
        body: "const arr = [];\nfor (let i = 0; i < 2000; i++) arr.push((i * 37) & 1023);\nconst queries = [];\nfor (let i = 0; i < 500; i++) queries.push([i, 1999 - i]);\nconst out = xorQueries(arr, queries);\nassert.equal(out.length, 500);\nfor (let q = 0; q < queries.length; q++) {\n  let expect = 0;\n  for (let i = queries[q][0]; i <= queries[q][1]; i++) expect ^= arr[i];\n  assert.equal(out[q], expect);\n}",
      },
    ],
  },
{
    id: "ex-number-of-islands",
    chapter: "dsa-graphs-representation-traversal",
    level: "beginner",
    title: "Number of Islands",
    brief:
      "<p>You are given a rectangular <code>grid</code> whose cells are the strings <code>'1'</code> (land) and <code>'0'</code> (water). An <b>island</b> is a group of land cells joined horizontally or vertically. Return how many islands the grid contains.</p><ul><li>Diagonal neighbours do <b>not</b> connect two cells</li><li>Everything outside the grid is water</li><li>An empty grid has <code>0</code> islands</li></ul>",
    starter: "function numIslands(grid) {\n  // TODO: count the groups of connected '1' cells\n}\n",
    hints: [
      "Scan every cell. The first time you step onto a piece of land you have not visited, you have found a brand new island — increment the counter once, right there.",
      "Then you must consume the WHOLE island before continuing, or you would count each of its cells as a separate island. A flood fill (DFS or BFS) from that cell does exactly that.",
      "The simplest way to remember what you have already consumed is to overwrite each visited land cell with '0' as you go, so it can never be picked up again.",
    ],
    solution:
      "function numIslands(grid) {\n  if (!grid || grid.length === 0) return 0;\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const sink = (r, c) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return;\n    if (grid[r][c] !== '1') return;\n    grid[r][c] = '0';\n    sink(r + 1, c);\n    sink(r - 1, c);\n    sink(r, c + 1);\n    sink(r, c - 1);\n  };\n  let count = 0;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === '1') {\n        count++;\n        sink(r, c);\n      }\n    }\n  }\n  return count;\n}\n",
    tests: [
      {
        name: "one big island",
        body: "const grid = [\n  ['1','1','1','1','0'],\n  ['1','1','0','1','0'],\n  ['1','1','0','0','0'],\n  ['0','0','0','0','0'],\n];\nassert.equal(numIslands(grid), 1);",
      },
      {
        name: "three separate islands",
        body: "const grid = [\n  ['1','1','0','0','0'],\n  ['1','1','0','0','0'],\n  ['0','0','1','0','0'],\n  ['0','0','0','1','1'],\n];\nassert.equal(numIslands(grid), 3);",
      },
      {
        name: "diagonals do not connect",
        body: "const grid = [['1','0'], ['0','1']];\nassert.equal(numIslands(grid), 2);",
      },
      {
        name: "all water",
        body: "const grid = [['0','0'], ['0','0']];\nassert.equal(numIslands(grid), 0);",
      },
      {
        name: "single land cell",
        body: "assert.equal(numIslands([['1']]), 1);",
      },
    ],
  },
{
    id: "ex-max-area-of-island",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Max Area of Island",
    brief:
      "<p>Given a <code>grid</code> of <code>0</code>s (water) and <code>1</code>s (land), return the number of cells in the <b>largest</b> island.</p><ul><li>Cells connect horizontally and vertically only</li><li>The area of an island is its cell count</li><li>If there is no land at all, return <code>0</code></li></ul>",
    starter: "function maxAreaOfIsland(grid) {\n  // TODO: return the size of the largest connected group of 1s\n}\n",
    hints: [
      "This is island counting with one change: the flood fill has to report back how big the region it just consumed was.",
      "Make the recursive helper RETURN a number — 0 when it walks off the grid or onto water, otherwise 1 plus the sum of the four recursive calls.",
      "Mark cells as visited (set them to 0) BEFORE recursing, otherwise two neighbours will bounce back and forth into each other forever.",
    ],
    solution:
      "function maxAreaOfIsland(grid) {\n  if (!grid || grid.length === 0) return 0;\n  const rows = grid.length;\n  const cols = grid[0].length;\n  const area = (r, c) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return 0;\n    if (grid[r][c] !== 1) return 0;\n    grid[r][c] = 0;\n    return 1 + area(r + 1, c) + area(r - 1, c) + area(r, c + 1) + area(r, c - 1);\n  };\n  let best = 0;\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) {\n        const a = area(r, c);\n        if (a > best) best = a;\n      }\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "picks the bigger of two islands",
        body: "const grid = [\n  [0,0,1,0],\n  [0,1,1,0],\n  [0,0,0,1],\n];\nassert.equal(maxAreaOfIsland(grid), 3);",
      },
      {
        name: "no land at all",
        body: "assert.equal(maxAreaOfIsland([[0,0],[0,0]]), 0);",
      },
      {
        name: "whole grid is one island",
        body: "assert.equal(maxAreaOfIsland([[1,1],[1,1]]), 4);",
      },
      {
        name: "diagonal cells are separate islands",
        body: "assert.equal(maxAreaOfIsland([[1,0],[0,1]]), 1);",
      },
      {
        name: "long snaking island",
        body: "const grid = [\n  [1,1,1,1],\n  [0,0,0,1],\n  [1,1,1,1],\n];\nassert.equal(maxAreaOfIsland(grid), 9);",
      },
    ],
  },
{
    id: "ex-clone-graph",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Clone Graph",
    brief:
      "<p>Given a reference to one node of a connected, undirected graph, return a <b>deep copy</b> of the whole graph.</p><ul><li>A node is <code>new GNode(val, neighbors)</code> — <code>neighbors</code> defaults to an empty array</li><li>The copy must contain <b>entirely new</b> node objects — not one node may be shared with the original</li><li>The shape must match exactly: same values, same neighbour relationships</li><li><code>cloneGraph(null)</code> returns <code>null</code></li><li><code>GNode</code>, a builder <code>buildGraph</code>, a serialiser <code>serialize</code> and <code>collectNodes</code> are already written for you</li></ul>",
    starter:
      "class GNode {\n  constructor(val, neighbors) {\n    this.val = val === undefined ? 0 : val;\n    this.neighbors = neighbors === undefined ? [] : neighbors;\n  }\n}\n\n// buildGraph([[2,4],[1,3],[2,4],[1,3]]) -> node 1 of a 4-node graph\nfunction buildGraph(adj) {\n  if (adj.length === 0) return null;\n  const nodes = adj.map((_, i) => new GNode(i + 1));\n  for (let i = 0; i < adj.length; i++) {\n    nodes[i].neighbors = adj[i].map((v) => nodes[v - 1]);\n  }\n  return nodes[0];\n}\n\nfunction collectNodes(node) {\n  const out = [];\n  if (!node) return out;\n  const seen = new Set([node]);\n  const stack = [node];\n  while (stack.length > 0) {\n    const cur = stack.pop();\n    out.push(cur);\n    for (const nb of cur.neighbors) {\n      if (!seen.has(nb)) {\n        seen.add(nb);\n        stack.push(nb);\n      }\n    }\n  }\n  return out;\n}\n\n// serialize(node) -> the adjacency list it was built from\nfunction serialize(node) {\n  const nodes = collectNodes(node);\n  nodes.sort((a, b) => a.val - b.val);\n  return nodes.map((n) => n.neighbors.map((x) => x.val).sort((a, b) => a - b));\n}\n\nfunction cloneGraph(node) {\n  // TODO: return a deep copy that shares no node objects with the original\n}\n",
    hints: [
      "The graph has cycles, so a naive recursion will revisit nodes forever. You need to remember which originals you have already copied.",
      "Keep a Map whose KEY is the original node object and whose VALUE is its copy. Look in the map first thing on entry; if the node is already there, return the existing copy.",
      "Create the copy and put it in the map BEFORE you recurse into the neighbours — that is what makes a cycle terminate.",
    ],
    solution:
      "class GNode {\n  constructor(val, neighbors) {\n    this.val = val === undefined ? 0 : val;\n    this.neighbors = neighbors === undefined ? [] : neighbors;\n  }\n}\n\nfunction buildGraph(adj) {\n  if (adj.length === 0) return null;\n  const nodes = adj.map((_, i) => new GNode(i + 1));\n  for (let i = 0; i < adj.length; i++) {\n    nodes[i].neighbors = adj[i].map((v) => nodes[v - 1]);\n  }\n  return nodes[0];\n}\n\nfunction collectNodes(node) {\n  const out = [];\n  if (!node) return out;\n  const seen = new Set([node]);\n  const stack = [node];\n  while (stack.length > 0) {\n    const cur = stack.pop();\n    out.push(cur);\n    for (const nb of cur.neighbors) {\n      if (!seen.has(nb)) {\n        seen.add(nb);\n        stack.push(nb);\n      }\n    }\n  }\n  return out;\n}\n\nfunction serialize(node) {\n  const nodes = collectNodes(node);\n  nodes.sort((a, b) => a.val - b.val);\n  return nodes.map((n) => n.neighbors.map((x) => x.val).sort((a, b) => a - b));\n}\n\nfunction cloneGraph(node) {\n  if (!node) return null;\n  const made = new Map();\n  const copy = (original) => {\n    const found = made.get(original);\n    if (found) return found;\n    const fresh = new GNode(original.val);\n    made.set(original, fresh);\n    for (const nb of original.neighbors) fresh.neighbors.push(copy(nb));\n    return fresh;\n  };\n  return copy(node);\n}\n",
    tests: [
      {
        name: "the copy has the same shape",
        body: "const adj = [[2,4],[1,3],[2,4],[1,3]];\nconst copy = cloneGraph(buildGraph(adj));\nassert.deepEqual(serialize(copy), adj);",
      },
      {
        name: "the clone shares no node objects with the original",
        body: "const original = buildGraph([[2,4],[1,3],[2,4],[1,3]]);\nconst copy = cloneGraph(original);\nconst olds = collectNodes(original);\nconst news = collectNodes(copy);\nassert.equal(news.length, olds.length);\nassert.notEqual(copy, original);\nfor (const n of news) {\n  assert.ok(olds.indexOf(n) === -1, 'clone reused an original node object');\n}",
      },
      {
        name: "editing the copy does not touch the original",
        body: "const original = buildGraph([[2],[1]]);\nconst copy = cloneGraph(original);\ncopy.val = 99;\ncopy.neighbors[0].val = 98;\nassert.equal(original.val, 1);\nassert.equal(original.neighbors[0].val, 2);",
      },
      {
        name: "single node with no neighbours",
        body: "const copy = cloneGraph(buildGraph([[]]));\nassert.equal(copy.val, 1);\nassert.deepEqual(copy.neighbors, []);",
      },
      {
        name: "null graph",
        body: "assert.equal(cloneGraph(null), null);",
      },
    ],
  },
{
    id: "ex-rotting-oranges",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Rotting Oranges",
    brief:
      "<p>Each cell of <code>grid</code> is <code>0</code> (empty), <code>1</code> (a fresh orange) or <code>2</code> (a rotten orange). Every minute, a rotten orange rots each fresh orange directly above, below, left or right of it.</p><p>Return the number of minutes until no fresh orange remains, or <code>-1</code> if some fresh orange can never rot.</p><ul><li>All rotten oranges spread <b>simultaneously</b>, so this is a multi-source breadth-first search — not one BFS per rotten cell</li><li>If there are no fresh oranges to begin with, the answer is <code>0</code></li></ul>",
    starter: "function orangesRotting(grid) {\n  // TODO: multi-source BFS from every rotten orange at once\n}\n",
    hints: [
      "Sweep the grid once first: push EVERY rotten cell into the queue as a starting point, and count how many fresh oranges exist.",
      "Process the queue one whole level at a time. Each level is one minute; oranges rotted during a level go into the next level, not the current one.",
      "Decrement the fresh counter as you rot each orange. At the end, a non-zero counter means something was unreachable, so return -1.",
    ],
    solution:
      "function orangesRotting(grid) {\n  const rows = grid.length;\n  const cols = rows > 0 ? grid[0].length : 0;\n  let fresh = 0;\n  let queue = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (grid[r][c] === 1) fresh++;\n      else if (grid[r][c] === 2) queue.push([r, c]);\n    }\n  }\n  if (fresh === 0) return 0;\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  let minutes = 0;\n  while (queue.length > 0 && fresh > 0) {\n    const next = [];\n    for (const cell of queue) {\n      for (const d of dirs) {\n        const nr = cell[0] + d[0];\n        const nc = cell[1] + d[1];\n        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;\n        if (grid[nr][nc] !== 1) continue;\n        grid[nr][nc] = 2;\n        fresh--;\n        next.push([nr, nc]);\n      }\n    }\n    queue = next;\n    minutes++;\n  }\n  return fresh === 0 ? minutes : -1;\n}\n",
    tests: [
      {
        name: "spreads across the grid in four minutes",
        body: "const grid = [\n  [2,1,1],\n  [1,1,0],\n  [0,1,1],\n];\nassert.equal(orangesRotting(grid), 4);",
      },
      {
        name: "an unreachable orange means -1",
        body: "const grid = [\n  [2,1,1],\n  [0,1,1],\n  [1,0,1],\n];\nassert.equal(orangesRotting(grid), -1);",
      },
      {
        name: "no fresh oranges takes zero minutes",
        body: "assert.equal(orangesRotting([[0,2]]), 0);",
      },
      {
        name: "empty of oranges entirely",
        body: "assert.equal(orangesRotting([[0,0],[0,0]]), 0);",
      },
      {
        name: "two sources meet in the middle",
        body: "const grid = [[2,1,1,1,2]];\nassert.equal(orangesRotting(grid), 2);",
      },
    ],
  },
{
    id: "ex-pacific-atlantic-water-flow",
    chapter: "dsa-graph-problems",
    level: "advanced",
    title: "Pacific Atlantic Water Flow",
    brief:
      "<p>A rectangular island is described by <code>heights</code>, a grid of cell elevations. The Pacific ocean touches the island's <b>top and left</b> edges; the Atlantic touches its <b>bottom and right</b> edges.</p><p>Rain falling on a cell can flow to a neighbour (up, down, left or right) whose height is <b>less than or equal</b> to the current cell's height. Return every coordinate <code>[row, col]</code> from which water can reach <em>both</em> oceans.</p><ul><li>Coordinates may be returned in <b>any order</b></li><li>An empty grid returns an empty array</li></ul>",
    starter: "function pacificAtlantic(heights) {\n  // TODO: return every [row, col] that drains to both oceans\n}\n",
    hints: [
      "Running a search from every cell to see where it drains is O((rows*cols)^2). Turn the question around: start at the oceans and walk UPHILL.",
      "Flood inland from the top and left borders to mark every cell the Pacific can reach; do the same from the bottom and right borders for the Atlantic. Uphill means you may step to a neighbour whose height is >= the current one.",
      "The answer is the intersection of the two visited grids — every cell marked in both.",
    ],
    solution:
      "function pacificAtlantic(heights) {\n  if (!heights || heights.length === 0 || heights[0].length === 0) return [];\n  const rows = heights.length;\n  const cols = heights[0].length;\n  const blank = () => {\n    const g = [];\n    for (let r = 0; r < rows; r++) g.push(new Array(cols).fill(false));\n    return g;\n  };\n  const pacific = blank();\n  const atlantic = blank();\n  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];\n  const climb = (r, c, seen) => {\n    seen[r][c] = true;\n    for (const d of dirs) {\n      const nr = r + d[0];\n      const nc = c + d[1];\n      if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;\n      if (seen[nr][nc]) continue;\n      if (heights[nr][nc] < heights[r][c]) continue;\n      climb(nr, nc, seen);\n    }\n  };\n  for (let r = 0; r < rows; r++) {\n    climb(r, 0, pacific);\n    climb(r, cols - 1, atlantic);\n  }\n  for (let c = 0; c < cols; c++) {\n    climb(0, c, pacific);\n    climb(rows - 1, c, atlantic);\n  }\n  const out = [];\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (pacific[r][c] && atlantic[r][c]) out.push([r, c]);\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "the classic five by five island",
        body: "const heights = [\n  [1,2,2,3,5],\n  [3,2,3,4,4],\n  [2,4,5,3,1],\n  [6,7,1,4,5],\n  [5,1,1,2,4],\n];\nconst out = pacificAtlantic(heights).slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nassert.deepEqual(out, [[0,4],[1,3],[1,4],[2,2],[3,0],[3,1],[4,0]]);",
      },
      {
        name: "a single cell touches both oceans",
        body: "assert.deepEqual(pacificAtlantic([[1]]), [[0,0]]);",
      },
      {
        name: "a flat plateau drains everywhere",
        body: "const out = pacificAtlantic([[2,2],[2,2]]).slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nassert.deepEqual(out, [[0,0],[0,1],[1,0],[1,1]]);",
      },
      {
        name: "a single row sits on both coasts",
        body: "const out = pacificAtlantic([[1,2,3]]).slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);\nassert.deepEqual(out, [[0,0],[0,1],[0,2]]);",
      },
      {
        name: "empty grid",
        body: "assert.deepEqual(pacificAtlantic([]), []);",
      },
    ],
  },
{
    id: "ex-surrounded-regions",
    chapter: "dsa-graphs-representation-traversal",
    level: "intermediate",
    title: "Surrounded Regions",
    brief:
      "<p>Given a <code>board</code> of the strings <code>'X'</code> and <code>'O'</code>, capture every region of <code>'O'</code>s that is completely surrounded by <code>'X'</code>s by flipping those cells to <code>'X'</code>.</p><ul><li>A region of <code>'O'</code>s is <b>not</b> captured if any of its cells touches the border of the board</li><li>Modify <code>board</code> <b>in place</b> — the function's return value is ignored</li><li>Cells connect horizontally and vertically only</li></ul>",
    starter:
      "function solve(board) {\n  // TODO: flip every 'O' region that does not touch the border to 'X', in place\n}\n",
    hints: [
      "Deciding 'is this region surrounded?' from the inside is awkward. Flip the question: which regions are SAFE?",
      "A region is safe exactly when it is reachable from an 'O' sitting on the border. Flood fill inward from every border 'O' and mark those cells with a temporary character such as '#'.",
      "Then make one final pass over the board: every remaining 'O' was unreachable and becomes 'X', and every '#' goes back to 'O'.",
    ],
    solution:
      "function solve(board) {\n  if (!board || board.length === 0) return;\n  const rows = board.length;\n  const cols = board[0].length;\n  const mark = (r, c) => {\n    if (r < 0 || c < 0 || r >= rows || c >= cols) return;\n    if (board[r][c] !== 'O') return;\n    board[r][c] = '#';\n    mark(r + 1, c);\n    mark(r - 1, c);\n    mark(r, c + 1);\n    mark(r, c - 1);\n  };\n  for (let r = 0; r < rows; r++) {\n    mark(r, 0);\n    mark(r, cols - 1);\n  }\n  for (let c = 0; c < cols; c++) {\n    mark(0, c);\n    mark(rows - 1, c);\n  }\n  for (let r = 0; r < rows; r++) {\n    for (let c = 0; c < cols; c++) {\n      if (board[r][c] === 'O') board[r][c] = 'X';\n      else if (board[r][c] === '#') board[r][c] = 'O';\n    }\n  }\n}\n",
    tests: [
      {
        name: "captures the enclosed region in place",
        body: "const board = [\n  ['X','X','X','X'],\n  ['X','O','O','X'],\n  ['X','X','O','X'],\n  ['X','O','X','X'],\n];\nsolve(board);\nassert.deepEqual(board, [\n  ['X','X','X','X'],\n  ['X','X','X','X'],\n  ['X','X','X','X'],\n  ['X','O','X','X'],\n]);",
      },
      {
        name: "a region connected to the border survives",
        body: "const board = [\n  ['X','O','X'],\n  ['X','O','X'],\n  ['X','X','X'],\n];\nsolve(board);\nassert.deepEqual(board, [\n  ['X','O','X'],\n  ['X','O','X'],\n  ['X','X','X'],\n]);",
      },
      {
        name: "a lone border cell is never captured",
        body: "const board = [['O']];\nsolve(board);\nassert.deepEqual(board, [['O']]);",
      },
      {
        name: "everything already X is left alone",
        body: "const board = [['X','X'],['X','X']];\nsolve(board);\nassert.deepEqual(board, [['X','X'],['X','X']]);",
      },
      {
        name: "two regions, only one enclosed",
        body: "const board = [\n  ['X','X','X','X','X'],\n  ['X','O','X','O','X'],\n  ['X','X','X','O','O'],\n];\nsolve(board);\nassert.deepEqual(board, [\n  ['X','X','X','X','X'],\n  ['X','X','X','O','X'],\n  ['X','X','X','O','O'],\n]);",
      },
    ],
  },
{
    id: "ex-word-ladder",
    chapter: "dsa-graph-problems",
    level: "advanced",
    title: "Word Ladder",
    brief:
      "<p>Given <code>beginWord</code>, <code>endWord</code> and a list of words <code>wordList</code>, return the number of words in the <b>shortest</b> transformation sequence from <code>beginWord</code> to <code>endWord</code>.</p><ul><li>Each step changes exactly <b>one letter</b></li><li>Every intermediate word — and <code>endWord</code> — must appear in <code>wordList</code></li><li><code>beginWord</code> does not need to be in the list</li><li>The count includes both ends: <code>hit -> hot -> dot -> dog -> cog</code> is <code>5</code></li><li>If no sequence exists, return <code>0</code>. All words have the same length and use lowercase letters</li></ul>",
    starter:
      "function ladderLength(beginWord, endWord, wordList) {\n  // TODO: length of the shortest one-letter-at-a-time chain, or 0\n}\n",
    hints: [
      "Every word is a node and two words are joined when they differ in one letter. 'Shortest chain' on an unweighted graph means breadth-first search, never depth-first.",
      "Do not compare every pair of words — that is O(n^2 * L). From a word, GENERATE its neighbours: for each position, try all 26 letters and keep the candidates that exist in a Set of the word list.",
      "Delete each word from the Set the moment you enqueue it. That is your visited marker and it stops the queue from exploding.",
    ],
    solution:
      "function ladderLength(beginWord, endWord, wordList) {\n  const words = new Set(wordList);\n  if (!words.has(endWord)) return 0;\n  const letters = 'abcdefghijklmnopqrstuvwxyz';\n  words.delete(beginWord);\n  let frontier = [beginWord];\n  let steps = 1;\n  while (frontier.length > 0) {\n    const next = [];\n    for (const word of frontier) {\n      if (word === endWord) return steps;\n      for (let i = 0; i < word.length; i++) {\n        for (const ch of letters) {\n          if (ch === word[i]) continue;\n          const candidate = word.slice(0, i) + ch + word.slice(i + 1);\n          if (words.has(candidate)) {\n            words.delete(candidate);\n            next.push(candidate);\n          }\n        }\n      }\n    }\n    frontier = next;\n    steps++;\n  }\n  return 0;\n}\n",
    tests: [
      {
        name: "hit to cog in five words",
        body: "assert.equal(\n  ladderLength('hit', 'cog', ['hot','dot','dog','lot','log','cog']),\n  5\n);",
      },
      {
        name: "end word missing from the list",
        body: "assert.equal(\n  ladderLength('hit', 'cog', ['hot','dot','dog','lot','log']),\n  0\n);",
      },
      {
        name: "no chain connects the two words",
        body: "assert.equal(ladderLength('hot', 'dog', ['hot','dog']), 0);",
      },
      {
        name: "single letter words, one hop",
        body: "assert.equal(ladderLength('a', 'c', ['a','b','c']), 2);",
      },
      {
        name: "takes the shorter of two routes",
        body: "assert.equal(\n  ladderLength('red', 'tax', ['ted','tex','red','tax','tad','den','rex','pee']),\n  4\n);",
      },
    ],
  },
{
    id: "ex-course-schedule",
    chapter: "dsa-topological-patterns",
    level: "advanced",
    title: "Course Schedule",
    brief:
      "<p>There are <code>numCourses</code> courses labelled <code>0</code> to <code>numCourses - 1</code>. Each pair <code>[a, b]</code> in <code>prerequisites</code> means you must take course <code>b</code> before course <code>a</code>.</p><p>Return <code>true</code> if it is possible to finish every course.</p><ul><li>It is impossible exactly when the prerequisite graph contains a <b>cycle</b></li><li>A course may be its own prerequisite — <code>[0, 0]</code> is a cycle</li><li>An empty prerequisite list is always finishable</li></ul>",
    starter:
      "function canFinish(numCourses, prerequisites) {\n  // TODO: return true when the prerequisite graph has no cycle\n}\n",
    hints: [
      "Build an adjacency list first. For the pair [a, b], the natural edge is b -> a: 'finishing b unlocks a'.",
      "Kahn's algorithm: count each course's number of unmet prerequisites (its in-degree), queue everything at zero, and repeatedly remove a course and decrement its dependants.",
      "If the number of courses you managed to remove equals numCourses, there was no cycle. Anything left over is stuck in one.",
    ],
    solution:
      "function canFinish(numCourses, prerequisites) {\n  const next = [];\n  for (let i = 0; i < numCourses; i++) next.push([]);\n  const indegree = new Array(numCourses).fill(0);\n  for (const pair of prerequisites) {\n    next[pair[1]].push(pair[0]);\n    indegree[pair[0]]++;\n  }\n  const queue = [];\n  for (let i = 0; i < numCourses; i++) {\n    if (indegree[i] === 0) queue.push(i);\n  }\n  let done = 0;\n  let head = 0;\n  while (head < queue.length) {\n    const course = queue[head++];\n    done++;\n    for (const dependant of next[course]) {\n      indegree[dependant]--;\n      if (indegree[dependant] === 0) queue.push(dependant);\n    }\n  }\n  return done === numCourses;\n}\n",
    tests: [
      {
        name: "a simple chain is finishable",
        body: "assert.equal(canFinish(2, [[1,0]]), true);",
      },
      {
        name: "a two-course cycle is not",
        body: "assert.equal(canFinish(2, [[1,0],[0,1]]), false);",
      },
      {
        name: "no prerequisites at all",
        body: "assert.equal(canFinish(3, []), true);",
      },
      {
        name: "a course that requires itself",
        body: "assert.equal(canFinish(1, [[0,0]]), false);",
      },
      {
        name: "a diamond is fine, a longer cycle is not",
        body: "assert.equal(canFinish(4, [[1,0],[2,0],[3,1],[3,2]]), true);\nassert.equal(canFinish(4, [[1,0],[2,1],[0,2],[3,0]]), false);",
      },
    ],
  },
{
    id: "ex-course-schedule-ii",
    chapter: "dsa-topological-patterns",
    level: "intermediate",
    title: "Course Schedule II",
    brief:
      "<p>There are <code>numCourses</code> courses labelled <code>0</code> to <code>numCourses - 1</code>. Each pair <code>[a, b]</code> in <code>prerequisites</code> means course <code>b</code> must be taken before course <code>a</code>.</p><p>Return any ordering of all the courses that respects every prerequisite. If no such ordering exists, return an empty array.</p><ul><li>There are usually <b>many</b> valid answers — any one of them is accepted</li><li>A valid answer lists every course exactly once</li><li>With no prerequisites, every ordering is valid</li></ul>",
    starter:
      "function findOrder(numCourses, prerequisites) {\n  // TODO: return any valid course order, or [] if the graph has a cycle\n}\n",
    hints: [
      "This is the same cycle check as Course Schedule, except you now record the courses in the order you take them off the queue.",
      "Build edges b -> a and an in-degree count per course. Seed a queue with every course whose in-degree is 0 — those have nothing blocking them.",
      "Pop a course, append it to the result, and decrement each dependant's in-degree, enqueueing any that reach 0. If the result is shorter than numCourses at the end, a cycle exists, so return [].",
    ],
    solution:
      "function findOrder(numCourses, prerequisites) {\n  const next = [];\n  for (let i = 0; i < numCourses; i++) next.push([]);\n  const indegree = new Array(numCourses).fill(0);\n  for (const pair of prerequisites) {\n    next[pair[1]].push(pair[0]);\n    indegree[pair[0]]++;\n  }\n  const order = [];\n  for (let i = 0; i < numCourses; i++) {\n    if (indegree[i] === 0) order.push(i);\n  }\n  let head = 0;\n  while (head < order.length) {\n    const course = order[head++];\n    for (const dependant of next[course]) {\n      indegree[dependant]--;\n      if (indegree[dependant] === 0) order.push(dependant);\n    }\n  }\n  return order.length === numCourses ? order : [];\n}\n",
    tests: [
      {
        name: "a diamond produces a valid order",
        body: "const prereqs = [[1,0],[2,0],[3,1],[3,2]];\nconst order = findOrder(4, prereqs);\nassert.equal(order.length, 4);\nassert.deepEqual(order.slice().sort((a, b) => a - b), [0,1,2,3]);\nconst at = new Map();\norder.forEach((c, i) => at.set(c, i));\nfor (const p of prereqs) {\n  assert.ok(at.get(p[1]) < at.get(p[0]), 'prerequisite must come first');\n}",
      },
      {
        name: "a straight chain is forced",
        body: "const prereqs = [[1,0],[2,1],[3,2]];\nconst order = findOrder(4, prereqs);\nassert.equal(order.length, 4);\nconst at = new Map();\norder.forEach((c, i) => at.set(c, i));\nfor (const p of prereqs) assert.ok(at.get(p[1]) < at.get(p[0]));",
      },
      {
        name: "no prerequisites still returns every course",
        body: "const order = findOrder(3, []);\nassert.deepEqual(order.slice().sort((a, b) => a - b), [0,1,2]);",
      },
      {
        name: "a cycle returns an empty array",
        body: "assert.deepEqual(findOrder(2, [[1,0],[0,1]]), []);",
      },
      {
        name: "one course, no prerequisites",
        body: "assert.deepEqual(findOrder(1, []), [0]);",
      },
    ],
  },
{
    id: "ex-alien-dictionary",
    chapter: "dsa-topological-patterns",
    level: "advanced",
    title: "Alien Dictionary",
    brief:
      "<p>You are given <code>words</code>, a list of lowercase words sorted according to the rules of an unknown alphabet. Work out an ordering of the letters that is consistent with that sorting and return it as a string.</p><ul><li>The result must contain <b>every distinct letter</b> that appears in <code>words</code>, each exactly once</li><li>If several orderings are consistent, return <b>any</b> of them</li><li>If the input is impossible, return the empty string <code>''</code>. That covers a cycle in the deduced order, and also the invalid prefix case: <code>['abc', 'ab']</code> can never be sorted, because a prefix must come first</li><li>Letters inside a single word tell you nothing about their relative order</li></ul>",
    starter:
      "function alienOrder(words) {\n  // TODO: derive a letter order from the sorted words, or '' if impossible\n}\n",
    hints: [
      "Two adjacent words give you exactly ONE fact: at their first differing character position, the letter from the earlier word comes before the letter from the later word. Everything after that position is unconstrained.",
      "If one word is a prefix of the next, there is no differing position. That is fine when the shorter word comes first, and impossible when the longer word comes first — return '' immediately in that case.",
      "Now it is a topological sort over the letters. Register every letter first (even ones with no constraints), then Kahn's algorithm; if the output is shorter than the letter count, there was a cycle.",
    ],
    solution:
      "function alienOrder(words) {\n  const after = new Map();\n  const indegree = new Map();\n  for (const word of words) {\n    for (const ch of word) {\n      if (!after.has(ch)) {\n        after.set(ch, new Set());\n        indegree.set(ch, 0);\n      }\n    }\n  }\n  for (let i = 0; i + 1 < words.length; i++) {\n    const a = words[i];\n    const b = words[i + 1];\n    const limit = Math.min(a.length, b.length);\n    let j = 0;\n    while (j < limit && a[j] === b[j]) j++;\n    if (j === limit) {\n      if (a.length > b.length) return '';\n      continue;\n    }\n    if (!after.get(a[j]).has(b[j])) {\n      after.get(a[j]).add(b[j]);\n      indegree.set(b[j], indegree.get(b[j]) + 1);\n    }\n  }\n  const queue = [];\n  for (const entry of indegree) {\n    if (entry[1] === 0) queue.push(entry[0]);\n  }\n  let out = '';\n  let head = 0;\n  while (head < queue.length) {\n    const ch = queue[head++];\n    out += ch;\n    for (const nx of after.get(ch)) {\n      indegree.set(nx, indegree.get(nx) - 1);\n      if (indegree.get(nx) === 0) queue.push(nx);\n    }\n  }\n  return out.length === indegree.size ? out : '';\n}\n",
    tests: [
      {
        name: "derives a consistent order for the classic input",
        body: "const order = alienOrder(['wrt','wrf','er','ett','rftt']);\nassert.equal(order.length, 5);\nfor (const ch of 'wertf') assert.ok(order.indexOf(ch) !== -1, 'missing letter ' + ch);\nconst pairs = [['t','f'],['w','e'],['r','t'],['e','r']];\nfor (const p of pairs) {\n  assert.ok(order.indexOf(p[0]) < order.indexOf(p[1]), p[0] + ' must precede ' + p[1]);\n}",
      },
      {
        name: "two single letter words",
        body: "const order = alienOrder(['z','x']);\nassert.equal(order.length, 2);\nassert.ok(order.indexOf('z') < order.indexOf('x'));",
      },
      {
        name: "an invalid prefix is impossible",
        body: "assert.equal(alienOrder(['abc','ab']), '');",
      },
      {
        name: "a cycle is impossible",
        body: "assert.equal(alienOrder(['a','b','a']), '');",
      },
      {
        name: "a single word constrains nothing",
        body: "const order = alienOrder(['abc']);\nassert.equal(order.length, 3);\nfor (const ch of 'abc') assert.ok(order.indexOf(ch) !== -1);\nassert.equal(alienOrder(['z','z']), 'z');",
      },
    ],
  },
{
    id: "ex-network-delay-time",
    chapter: "dsa-advanced-graph-algorithms",
    level: "advanced",
    title: "Network Delay Time",
    brief:
      "<p>A network has <code>n</code> nodes labelled <code>1</code> to <code>n</code>. Each entry <code>[u, v, w]</code> in <code>times</code> is a directed edge: a signal takes <code>w</code> time to travel from <code>u</code> to <code>v</code>.</p><p>A signal is sent from node <code>k</code>. Return the time it takes for <b>all</b> nodes to receive it, or <code>-1</code> if some node never does.</p><ul><li>Weights are positive, so this is Dijkstra's algorithm</li><li>The answer is the <b>largest</b> of the shortest distances</li><li>JavaScript has no built-in priority queue, so a compact <code>MinHeap</code> keyed on <code>item[0]</code> is <b>already written for you</b> in the starter — write the algorithm, not the plumbing</li></ul>",
    starter:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction networkDelayTime(times, n, k) {\n  // TODO: Dijkstra from k; return the largest shortest-distance, or -1\n}\n",
    hints: [
      "Build an adjacency list from times first: node -> array of [neighbour, weight]. Scanning the edge list inside the loop would throw away the whole point of the heap.",
      "Push [0, k] to start. Each pop gives the smallest tentative distance in the frontier; the first time you pop a node, that distance is final — record it and skip any later pop of the same node.",
      "At the end, if you settled fewer than n nodes something was unreachable, so return -1. Otherwise return the maximum settled distance.",
    ],
    solution:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction networkDelayTime(times, n, k) {\n  const adj = new Map();\n  for (let i = 1; i <= n; i++) adj.set(i, []);\n  for (const e of times) adj.get(e[0]).push([e[1], e[2]]);\n  const settled = new Map();\n  const heap = new MinHeap();\n  heap.push([0, k]);\n  while (heap.size > 0) {\n    const top = heap.pop();\n    const dist = top[0];\n    const node = top[1];\n    if (settled.has(node)) continue;\n    settled.set(node, dist);\n    for (const edge of adj.get(node)) {\n      if (!settled.has(edge[0])) heap.push([dist + edge[1], edge[0]]);\n    }\n  }\n  if (settled.size !== n) return -1;\n  let worst = 0;\n  for (const entry of settled) {\n    if (entry[1] > worst) worst = entry[1];\n  }\n  return worst;\n}\n",
    tests: [
      {
        name: "signal reaches every node",
        body: "assert.equal(networkDelayTime([[2,1,1],[2,3,1],[3,4,1]], 4, 2), 2);",
      },
      {
        name: "a cheaper two-hop route beats the direct edge",
        body: "assert.equal(networkDelayTime([[1,2,10],[1,3,1],[3,2,1]], 3, 1), 2);",
      },
      {
        name: "an unreachable node gives -1",
        body: "assert.equal(networkDelayTime([[1,2,1]], 2, 2), -1);",
      },
      {
        name: "a lone node needs no time",
        body: "assert.equal(networkDelayTime([], 1, 1), 0);",
      },
      {
        name: "single edge from the source",
        body: "assert.equal(networkDelayTime([[1,2,1]], 2, 1), 1);",
      },
    ],
  },
{
    id: "ex-cheapest-flights-within-k-stops",
    chapter: "dsa-advanced-graph-algorithms",
    level: "advanced",
    title: "Cheapest Flights Within K Stops",
    brief:
      "<p>There are <code>n</code> cities labelled <code>0</code> to <code>n - 1</code> and a list of <code>flights</code>, each <code>[from, to, price]</code>. Return the cheapest price from <code>src</code> to <code>dst</code> using <b>at most <code>k</code> stops</b>, or <code>-1</code> if no such route exists.</p><ul><li>'At most <code>k</code> stops' means at most <code>k + 1</code> flights — the intermediate cities are the stops</li><li>Plain Dijkstra is <b>wrong</b> here: the cheapest way to reach a city may use too many flights, and a pricier route with fewer flights can still win</li><li><code>src === dst</code> costs <code>0</code></li><li>A compact <code>MinHeap</code> keyed on <code>item[0]</code> is <b>already written for you</b> in the starter — spend your effort on the algorithm</li></ul>",
    starter:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findCheapestPrice(n, flights, src, dst, k) {\n  // TODO: cheapest src -> dst using at most k stops, or -1\n}\n",
    hints: [
      "The state you are searching is not just 'which city' — it is 'which city, reached with how many flights'. Carry both through the search.",
      "Push [cost, city, flightsTaken] onto the heap. Because the heap is ordered by cost, the first time you pop dst you have the cheapest legal route, so you can return immediately.",
      "To avoid revisiting pointlessly, remember the fewest flights you have ever used to reach each city and skip a state that arrives at a city both more expensively AND with no fewer flights. Also stop expanding once flightsTaken exceeds k.",
    ],
    solution:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction findCheapestPrice(n, flights, src, dst, k) {\n  const adj = [];\n  for (let i = 0; i < n; i++) adj.push([]);\n  for (const f of flights) adj[f[0]].push([f[1], f[2]]);\n  const fewest = new Array(n).fill(Infinity);\n  const heap = new MinHeap();\n  heap.push([0, src, 0]);\n  while (heap.size > 0) {\n    const top = heap.pop();\n    const cost = top[0];\n    const city = top[1];\n    const hops = top[2];\n    if (city === dst) return cost;\n    if (hops > k || hops >= fewest[city]) continue;\n    fewest[city] = hops;\n    for (const edge of adj[city]) {\n      heap.push([cost + edge[1], edge[0], hops + 1]);\n    }\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "one stop allowed",
        body: "const flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]];\nassert.equal(findCheapestPrice(4, flights, 0, 3, 1), 700);",
      },
      {
        name: "two stops unlock the cheaper route",
        body: "const flights = [[0,1,100],[1,2,100],[2,0,100],[1,3,600],[2,3,200]];\nassert.equal(findCheapestPrice(4, flights, 0, 3, 2), 400);",
      },
      {
        name: "zero stops forces the expensive direct flight",
        body: "const flights = [[0,1,100],[1,2,100],[0,2,500]];\nassert.equal(findCheapestPrice(3, flights, 0, 2, 0), 500);\nassert.equal(findCheapestPrice(3, flights, 0, 2, 1), 200);",
      },
      {
        name: "unreachable destination",
        body: "assert.equal(findCheapestPrice(2, [], 0, 1, 5), -1);",
      },
      {
        name: "source is the destination",
        body: "assert.equal(findCheapestPrice(3, [[0,1,50]], 2, 2, 0), 0);",
      },
    ],
  },
{
    id: "ex-number-of-connected-components",
    chapter: "dsa-union-find",
    level: "intermediate",
    title: "Number of Connected Components in an Undirected Graph",
    brief:
      "<p>You are given <code>n</code> nodes labelled <code>0</code> to <code>n - 1</code> and a list of undirected <code>edges</code>, each <code>[a, b]</code>. Return the number of connected components.</p><ul><li>Solve it with <b>union-find</b> (disjoint set union)</li><li>A node with no edges is its own component</li><li>Duplicate edges are allowed and must not change the answer</li><li><code>n = 0</code> gives <code>0</code></li></ul>",
    starter: "function countComponents(n, edges) {\n  // TODO: union-find — start at n components and merge\n}\n",
    hints: [
      "Start with a parent array where every node is its own parent, and a counter set to n — each node begins as its own component.",
      "find(x) walks up the parent chain to the root. union(a, b) finds both roots; if they are already the same, the edge is redundant and the count does not change.",
      "Only when the two roots differ do you point one at the other and decrement the counter. Path compression (parent[x] = find(parent[x])) keeps find nearly constant time.",
    ],
    solution:
      "function countComponents(n, edges) {\n  const parent = [];\n  for (let i = 0; i < n; i++) parent.push(i);\n  const find = (x) => {\n    while (parent[x] !== x) {\n      parent[x] = parent[parent[x]];\n      x = parent[x];\n    }\n    return x;\n  };\n  let components = n;\n  for (const e of edges) {\n    const ra = find(e[0]);\n    const rb = find(e[1]);\n    if (ra !== rb) {\n      parent[ra] = rb;\n      components--;\n    }\n  }\n  return components;\n}\n",
    tests: [
      {
        name: "two components",
        body: "assert.equal(countComponents(5, [[0,1],[1,2],[3,4]]), 2);",
      },
      {
        name: "one long chain",
        body: "assert.equal(countComponents(5, [[0,1],[1,2],[2,3],[3,4]]), 1);",
      },
      {
        name: "no edges means every node is alone",
        body: "assert.equal(countComponents(4, []), 4);",
      },
      {
        name: "duplicate and reversed edges do not double count",
        body: "assert.equal(countComponents(3, [[0,1],[0,1],[1,0]]), 2);",
      },
      {
        name: "no nodes at all",
        body: "assert.equal(countComponents(0, []), 0);",
      },
    ],
  },
{
    id: "ex-redundant-connection",
    chapter: "dsa-union-find",
    level: "advanced",
    title: "Redundant Connection",
    brief:
      "<p>You start with a tree over <code>n</code> nodes labelled <code>1</code> to <code>n</code> and one extra undirected edge is added, creating exactly one cycle. Given the list of <code>edges</code> in the order they were added, return the edge that can be removed so the result is a tree again.</p><ul><li>If several edges would work, return the one that appears <b>last</b> in the input</li><li>The returned value must be the edge array itself, e.g. <code>[2, 3]</code></li><li>Node labels are 1-based</li></ul>",
    starter:
      "function findRedundantConnection(edges) {\n  // TODO: union-find — the first edge whose two ends are already connected\n}\n",
    hints: [
      "Process the edges in the order given, maintaining a disjoint set. Every edge that joins two previously separate groups is a genuine tree edge.",
      "The moment an edge's two endpoints already share a root, that edge closes a cycle — and because you are scanning in order, it is the last such edge in the input. Return it immediately.",
      "Size the parent array as edges.length + 1 so the 1-based labels index it directly.",
    ],
    solution:
      "function findRedundantConnection(edges) {\n  const parent = [];\n  for (let i = 0; i <= edges.length; i++) parent.push(i);\n  const find = (x) => {\n    while (parent[x] !== x) {\n      parent[x] = parent[parent[x]];\n      x = parent[x];\n    }\n    return x;\n  };\n  for (const e of edges) {\n    const ra = find(e[0]);\n    const rb = find(e[1]);\n    if (ra === rb) return e;\n    parent[ra] = rb;\n  }\n  return [];\n}\n",
    tests: [
      {
        name: "the smallest triangle",
        body: "assert.deepEqual(findRedundantConnection([[1,2],[1,3],[2,3]]), [2,3]);",
      },
      {
        name: "cycle closed before the last edge",
        body: "assert.deepEqual(\n  findRedundantConnection([[1,2],[2,3],[3,4],[1,4],[1,5]]),\n  [1,4]\n);",
      },
      {
        name: "star with one extra rung",
        body: "assert.deepEqual(\n  findRedundantConnection([[1,2],[1,3],[1,4],[3,4],[1,5]]),\n  [3,4]\n);",
      },
      {
        name: "labels in either direction",
        body: "assert.deepEqual(findRedundantConnection([[2,1],[3,1],[4,2],[1,4]]), [1,4]);",
      },
      {
        name: "long chain closed at the very end",
        body: "assert.deepEqual(\n  findRedundantConnection([[1,2],[2,3],[3,4],[4,5],[5,6],[1,6]]),\n  [1,6]\n);",
      },
    ],
  },
{
    id: "ex-min-cost-connect-all-points",
    chapter: "dsa-minimum-spanning-tree",
    level: "advanced",
    title: "Min Cost to Connect All Points",
    brief:
      "<p>Given <code>points</code>, an array of <code>[x, y]</code> coordinates on a plane, connect every point so that there is exactly one path between any two of them, at minimum total cost.</p><ul><li>The cost of a connection is the <b>Manhattan distance</b> <code>|x1 - x2| + |y1 - y2|</code></li><li>Return that minimum total cost — this is a <b>minimum spanning tree</b></li><li>Fewer than two points cost <code>0</code></li><li>A compact <code>MinHeap</code> keyed on <code>item[0]</code> is <b>already written for you</b> in the starter, so you can concentrate on the MST itself</li></ul>",
    starter:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minCostConnectPoints(points) {\n  // TODO: total weight of the minimum spanning tree under Manhattan distance\n}\n",
    hints: [
      "Every pair of points is an edge, so the graph is complete. Prim's algorithm suits it: grow one tree, always adding the cheapest edge that reaches a point not yet in the tree.",
      "Start from point 0. Push [distance, index] for each of its neighbours, then repeatedly pop the cheapest entry, skip it if that point is already in the tree, otherwise add its distance to the total and push its own outgoing edges.",
      "Stop once the tree holds every point. Exactly n - 1 edges get accepted; the 'already in the tree' check is what prevents cycles.",
    ],
    solution:
      "class MinHeap {\n  constructor() {\n    this.items = [];\n  }\n  get size() {\n    return this.items.length;\n  }\n  push(item) {\n    const a = this.items;\n    a.push(item);\n    let i = a.length - 1;\n    while (i > 0) {\n      const p = (i - 1) >> 1;\n      if (a[p][0] <= a[i][0]) break;\n      const t = a[p]; a[p] = a[i]; a[i] = t;\n      i = p;\n    }\n  }\n  pop() {\n    const a = this.items;\n    const top = a[0];\n    const last = a.pop();\n    if (a.length > 0) {\n      a[0] = last;\n      let i = 0;\n      for (;;) {\n        const l = 2 * i + 1;\n        const r = l + 1;\n        let m = i;\n        if (l < a.length && a[l][0] < a[m][0]) m = l;\n        if (r < a.length && a[r][0] < a[m][0]) m = r;\n        if (m === i) break;\n        const t = a[m]; a[m] = a[i]; a[i] = t;\n        i = m;\n      }\n    }\n    return top;\n  }\n}\n\nfunction minCostConnectPoints(points) {\n  const n = points.length;\n  if (n < 2) return 0;\n  const gap = (i, j) =>\n    Math.abs(points[i][0] - points[j][0]) + Math.abs(points[i][1] - points[j][1]);\n  const inTree = new Array(n).fill(false);\n  const heap = new MinHeap();\n  heap.push([0, 0]);\n  let total = 0;\n  let joined = 0;\n  while (heap.size > 0 && joined < n) {\n    const top = heap.pop();\n    const cost = top[0];\n    const idx = top[1];\n    if (inTree[idx]) continue;\n    inTree[idx] = true;\n    joined++;\n    total += cost;\n    for (let j = 0; j < n; j++) {\n      if (!inTree[j]) heap.push([gap(idx, j), j]);\n    }\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "five points",
        body: "assert.equal(\n  minCostConnectPoints([[0,0],[2,2],[3,10],[5,2],[7,0]]),\n  20\n);",
      },
      {
        name: "negative coordinates",
        body: "assert.equal(minCostConnectPoints([[3,12],[-2,5],[-4,1]]), 18);",
      },
      {
        name: "two points cost one edge",
        body: "assert.equal(minCostConnectPoints([[0,0],[1,1]]), 2);",
      },
      {
        name: "a single point costs nothing",
        body: "assert.equal(minCostConnectPoints([[4,7]]), 0);\nassert.equal(minCostConnectPoints([]), 0);",
      },
      {
        name: "a unit square needs three edges",
        body: "assert.equal(minCostConnectPoints([[0,0],[0,1],[1,0],[1,1]]), 3);",
      },
    ],
  },
{
    id: "ex-climbing-stairs",
    chapter: "dsa-dp-1d",
    level: "beginner",
    title: "Climbing Stairs",
    brief:
      "<p>You are climbing a staircase of <code>n</code> steps. Each move you may climb either <code>1</code> or <code>2</code> steps. Return how many distinct ways there are to reach the top.</p><ul><li><code>n = 2</code> gives <code>2</code>: <code>1+1</code> or <code>2</code></li><li><code>n = 3</code> gives <code>3</code>: <code>1+1+1</code>, <code>1+2</code>, <code>2+1</code></li><li>Must run in linear time — plain recursion will time out for larger <code>n</code></li></ul>",
    starter:
      "function climbStairs(n) {\n  // TODO: how many distinct ways to reach step n taking 1 or 2 at a time\n}\n",
    hints: [
      "The last move onto step n came either from step n-1 or from step n-2. So ways(n) = ways(n-1) + ways(n-2).",
      "Recursing on that directly recomputes the same subproblems exponentially. Build the answers upward from the base cases instead.",
      "You only ever need the previous two totals, so two variables are enough — no array required.",
    ],
    solution:
      "function climbStairs(n) {\n  if (n <= 2) return n;\n  let twoBack = 1;\n  let oneBack = 2;\n  for (let step = 3; step <= n; step++) {\n    const current = oneBack + twoBack;\n    twoBack = oneBack;\n    oneBack = current;\n  }\n  return oneBack;\n}\n",
    tests: [
      {
        name: "two steps",
        body: "assert.equal(climbStairs(2), 2);",
      },
      {
        name: "three steps",
        body: "assert.equal(climbStairs(3), 3);",
      },
      {
        name: "one step",
        body: "assert.equal(climbStairs(1), 1);",
      },
      {
        name: "ten steps",
        body: "assert.equal(climbStairs(10), 89);",
      },
      {
        name: "large n stays fast",
        body: "assert.equal(climbStairs(45), 1836311903);",
      },
    ],
  },
{
    id: "ex-house-robber",
    chapter: "dsa-dp-1d",
    level: "beginner",
    title: "House Robber",
    brief:
      "<p>Each house on a street holds <code>nums[i]</code> pounds. You cannot rob two <b>adjacent</b> houses on the same night. Return the largest amount you can take.</p><ul><li>All amounts are non-negative</li><li>An empty street yields <code>0</code></li><li>Greedily taking the biggest house is <em>not</em> correct: <code>[2,1,1,2]</code> gives <code>4</code></li></ul>",
    starter: "function rob(nums) {\n  // TODO: largest total with no two adjacent houses\n}\n",
    hints: [
      "At each house you face one binary choice: rob it (and give up the house right before it) or skip it (and keep the best total so far).",
      "So best(i) = max(best(i-1), best(i-2) + nums[i]). Sweep left to right applying that.",
      "Only the last two totals matter, so carry two running numbers instead of a whole array.",
    ],
    solution:
      "function rob(nums) {\n  let skip = 0;\n  let take = 0;\n  for (const value of nums) {\n    const next = Math.max(take, skip + value);\n    skip = take;\n    take = next;\n  }\n  return take;\n}\n",
    tests: [
      {
        name: "skip the middle house",
        body: "assert.equal(rob([1,2,3,1]), 4);",
      },
      {
        name: "take first, middle and last",
        body: "assert.equal(rob([2,7,9,3,1]), 12);",
      },
      {
        name: "empty street",
        body: "assert.equal(rob([]), 0);",
      },
      {
        name: "one house",
        body: "assert.equal(rob([5]), 5);",
      },
      {
        name: "the greedy pick is wrong here",
        body: "assert.equal(rob([2,1,1,2]), 4);\nassert.equal(rob([2,3,2]), 4);",
      },
    ],
  },
{
    id: "ex-house-robber-ii",
    chapter: "dsa-dp-1d",
    level: "advanced",
    title: "House Robber II",
    brief:
      "<p>Same rules as House Robber, except the houses are arranged in a <b>circle</b>: the first and last house are neighbours, so you may not rob both. Return the largest amount you can take.</p><ul><li><code>[2,3,2]</code> gives <code>3</code> — you cannot take both 2s</li><li>A street of one house has no neighbour problem, so the answer is that house</li><li>An empty street yields <code>0</code></li></ul>",
    starter: "function rob(nums) {\n  // TODO: same as House Robber, but the first and last houses are adjacent\n}\n",
    hints: [
      "You cannot express 'circular' inside one linear sweep. Split on the single decision that causes the trouble: is the FIRST house robbed or not?",
      "If the first house is robbed, the last is off limits, so solve the linear problem on nums[0..n-2]. If it is not, solve it on nums[1..n-1]. The answer is the larger of the two.",
      "Write the plain linear robber as a helper over a slice, then call it twice. Handle n === 1 separately, because both slices would be empty.",
    ],
    solution:
      "function rob(nums) {\n  const line = (list) => {\n    let skip = 0;\n    let take = 0;\n    for (const value of list) {\n      const next = Math.max(take, skip + value);\n      skip = take;\n      take = next;\n    }\n    return take;\n  };\n  if (nums.length === 0) return 0;\n  if (nums.length === 1) return nums[0];\n  return Math.max(line(nums.slice(0, nums.length - 1)), line(nums.slice(1)));\n}\n",
    tests: [
      {
        name: "cannot rob both ends",
        body: "assert.equal(rob([2,3,2]), 3);",
      },
      {
        name: "the interior pair wins",
        body: "assert.equal(rob([1,2,3,1]), 4);",
      },
      {
        name: "three houses, take the biggest",
        body: "assert.equal(rob([1,2,3]), 3);",
      },
      {
        name: "one and two house streets",
        body: "assert.equal(rob([5]), 5);\nassert.equal(rob([1,2]), 2);\nassert.equal(rob([]), 0);",
      },
      {
        name: "longer circle",
        body: "assert.equal(rob([200,3,140,20,10]), 340);\nassert.equal(rob([2,7,9,3,1]), 11);",
      },
    ],
  },
{
    id: "ex-coin-change",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Coin Change",
    brief:
      "<p>Given an array of distinct <code>coins</code> and a target <code>amount</code>, return the <b>fewest</b> coins needed to make exactly that amount.</p><ul><li>You have an unlimited supply of every coin</li><li>If the amount cannot be made, return <code>-1</code></li><li><code>amount = 0</code> needs <code>0</code> coins</li><li>Taking the biggest coin first is <em>not</em> correct in general</li></ul>",
    starter:
      "function coinChange(coins, amount) {\n  // TODO: fewest coins summing to amount, or -1 if impossible\n}\n",
    hints: [
      "Define best[a] as the fewest coins that make a. Then best[a] is 1 + the smallest best[a - c] over every coin c that fits.",
      "Fill best from 0 upward so every value you need has already been computed. Seed best[0] = 0 and everything else with Infinity, meaning 'not reachable yet'.",
      "At the end, an entry still holding Infinity means the amount is unmakeable — that is your -1.",
    ],
    solution:
      "function coinChange(coins, amount) {\n  const best = new Array(amount + 1).fill(Infinity);\n  best[0] = 0;\n  for (let a = 1; a <= amount; a++) {\n    for (const coin of coins) {\n      if (coin <= a && best[a - coin] + 1 < best[a]) {\n        best[a] = best[a - coin] + 1;\n      }\n    }\n  }\n  return best[amount] === Infinity ? -1 : best[amount];\n}\n",
    tests: [
      {
        name: "eleven from 1, 2 and 5",
        body: "assert.equal(coinChange([1,2,5], 11), 3);",
      },
      {
        name: "impossible amount",
        body: "assert.equal(coinChange([2], 3), -1);",
      },
      {
        name: "zero needs no coins",
        body: "assert.equal(coinChange([1], 0), 0);\nassert.equal(coinChange([7,11], 0), 0);",
      },
      {
        name: "greedy would fail here",
        body: "assert.equal(coinChange([1,3,4], 6), 2);",
      },
      {
        name: "larger amount",
        body: "assert.equal(coinChange([186,419,83,408], 6249), 20);",
      },
    ],
  },
{
    id: "ex-coin-change-ii",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Coin Change II",
    brief:
      "<p>Given a target <code>amount</code> and an array of distinct <code>coins</code>, return the number of distinct <b>combinations</b> of coins that add up to the amount.</p><ul><li>You have an unlimited supply of every coin</li><li>Combinations, not permutations: <code>1 + 2</code> and <code>2 + 1</code> are the <b>same</b> answer</li><li>There is exactly <code>1</code> way to make <code>0</code> — take no coins</li><li>If the amount cannot be made, return <code>0</code></li></ul>",
    starter: "function change(amount, coins) {\n  // TODO: count the distinct coin combinations that make amount\n}\n",
    hints: [
      "Let ways[a] be the number of combinations that make a, starting with ways[0] = 1.",
      "The trap is double counting. Loop over the COINS on the outside and the amounts on the inside — that way each combination is only ever built in one fixed coin order.",
      "For a coin c, sweep a from c upward doing ways[a] += ways[a - c]. Swapping the two loops would count permutations instead.",
    ],
    solution:
      "function change(amount, coins) {\n  const ways = new Array(amount + 1).fill(0);\n  ways[0] = 1;\n  for (const coin of coins) {\n    for (let a = coin; a <= amount; a++) {\n      ways[a] += ways[a - coin];\n    }\n  }\n  return ways[amount];\n}\n",
    tests: [
      {
        name: "four ways to make five",
        body: "assert.equal(change(5, [1,2,5]), 4);",
      },
      {
        name: "order does not create new combinations",
        body: "assert.equal(change(4, [1,2,3]), 4);",
      },
      {
        name: "impossible amount",
        body: "assert.equal(change(3, [2]), 0);",
      },
      {
        name: "zero has exactly one combination",
        body: "assert.equal(change(0, [7]), 1);\nassert.equal(change(0, []), 1);",
      },
      {
        name: "one coin that fits exactly once",
        body: "assert.equal(change(10, [10]), 1);\nassert.equal(change(10, [1]), 1);",
      },
    ],
  },
{
    id: "ex-longest-increasing-subsequence",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Longest Increasing Subsequence",
    brief:
      "<p>Given an integer array <code>nums</code>, return the length of the longest <b>strictly increasing</b> subsequence.</p><ul><li>A subsequence keeps the original order but may skip any elements</li><li>Equal values do not count as increasing: <code>[7,7,7]</code> gives <code>1</code></li><li>An empty array gives <code>0</code></li><li>The classic table solution is O(n^2); the patience-sorting approach reaches O(n log n). Either passes here</li></ul>",
    starter: "function lengthOfLIS(nums) {\n  // TODO: length of the longest strictly increasing subsequence\n}\n",
    hints: [
      "The O(n^2) version: best[i] is the length of the longest increasing subsequence ENDING at i. For each i, look back at every j < i with nums[j] < nums[i].",
      "For O(n log n), keep an array tails where tails[k] is the smallest possible value that can end an increasing subsequence of length k+1. That array is always sorted.",
      "For each number, binary search tails for the first entry that is >= it and overwrite it; if there is none, append. The answer is the final length of tails — note that tails is not itself a valid subsequence, only its length matters.",
    ],
    solution:
      "function lengthOfLIS(nums) {\n  const tails = [];\n  for (const value of nums) {\n    let lo = 0;\n    let hi = tails.length;\n    while (lo < hi) {\n      const mid = (lo + hi) >> 1;\n      if (tails[mid] < value) lo = mid + 1;\n      else hi = mid;\n    }\n    if (lo === tails.length) tails.push(value);\n    else tails[lo] = value;\n  }\n  return tails.length;\n}\n",
    tests: [
      {
        name: "classic example",
        body: "assert.equal(lengthOfLIS([10,9,2,5,3,7,101,18]), 4);",
      },
      {
        name: "duplicates inside the run",
        body: "assert.equal(lengthOfLIS([0,1,0,3,2,3]), 4);",
      },
      {
        name: "all equal values",
        body: "assert.equal(lengthOfLIS([7,7,7,7]), 1);",
      },
      {
        name: "empty and single element",
        body: "assert.equal(lengthOfLIS([]), 0);\nassert.equal(lengthOfLIS([4]), 1);\nassert.equal(lengthOfLIS([5,4,3,2,1]), 1);",
      },
      {
        name: "one thousand values in descending blocks of five",
        body: "const nums = [];\nfor (let block = 0; block < 200; block++) {\n  for (let j = 4; j >= 0; j--) nums.push(block * 5 + j);\n}\nassert.equal(nums.length, 1000);\nassert.equal(lengthOfLIS(nums), 200);",
      },
    ],
  },
{
    id: "ex-word-break",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Word Break",
    brief:
      "<p>Given a string <code>s</code> and an array of words <code>wordDict</code>, return <code>true</code> if <code>s</code> can be split into a sequence of one or more dictionary words.</p><ul><li>A dictionary word may be reused any number of times</li><li>The whole string must be consumed, with no leftovers</li><li>An empty string is trivially breakable, so return <code>true</code></li><li>Plain backtracking is exponential on adversarial inputs — memoise or build a table</li></ul>",
    starter: "function wordBreak(s, wordDict) {\n  // TODO: can s be split entirely into dictionary words?\n}\n",
    hints: [
      "Let ok[i] mean 'the first i characters of s can be split'. ok[0] is true because the empty prefix is fine.",
      "ok[i] is true when there is some j < i where ok[j] is true AND the slice s.slice(j, i) is in the dictionary. Put the dictionary in a Set for O(1) lookups.",
      "Fill i from 1 to s.length and return ok[s.length]. Every prefix is computed once, which is what kills the exponential blow-up on inputs like 'aaaa...b'.",
    ],
    solution:
      "function wordBreak(s, wordDict) {\n  const words = new Set(wordDict);\n  const ok = new Array(s.length + 1).fill(false);\n  ok[0] = true;\n  for (let i = 1; i <= s.length; i++) {\n    for (let j = 0; j < i; j++) {\n      if (ok[j] && words.has(s.slice(j, i))) {\n        ok[i] = true;\n        break;\n      }\n    }\n  }\n  return ok[s.length];\n}\n",
    tests: [
      {
        name: "two words end to end",
        body: "assert.equal(wordBreak('leetcode', ['leet','code']), true);",
      },
      {
        name: "a word reused",
        body: "assert.equal(wordBreak('applepenapple', ['apple','pen']), true);",
      },
      {
        name: "leftover characters mean false",
        body: "assert.equal(wordBreak('catsandog', ['cats','dog','sand','and','cat']), false);",
      },
      {
        name: "empty string is breakable",
        body: "assert.equal(wordBreak('', ['a']), true);\nassert.equal(wordBreak('a', []), false);",
      },
      {
        name: "the adversarial all-a string stays fast",
        body: "let s = '';\nfor (let i = 0; i < 40; i++) s += 'a';\ns += 'b';\nassert.equal(wordBreak(s, ['a','aa','aaa','aaaa','aaaaa']), false);",
      },
    ],
  },
{
    id: "ex-decode-ways",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Decode Ways",
    brief:
      "<p>A message of letters was encoded by mapping <code>'A'</code> to <code>1</code> up to <code>'Z'</code> to <code>26</code> and concatenating the numbers. Given the digit string <code>s</code>, return how many ways it can be decoded back into letters.</p><ul><li><code>'12'</code> gives <code>2</code>: <code>AB</code> (1 2) or <code>L</code> (12)</li><li>A single digit only decodes if it is <code>1</code>–<code>9</code> — a lone <code>'0'</code> is invalid</li><li>A pair of digits only decodes if it reads <code>10</code>–<code>26</code>, so leading zeros like <code>'06'</code> are invalid</li><li>If the string cannot be decoded at all, return <code>0</code>. The empty string returns <code>0</code></li></ul>",
    starter: "function numDecodings(s) {\n  // TODO: how many ways can this digit string be decoded\n}\n",
    hints: [
      "Think of it as climbing stairs with two guards: from position i you may consume one digit or two, but only if the piece you consume is a legal code.",
      "Let ways[i] be the number of decodings of the first i characters, with ways[0] = 1. Add ways[i-1] when s[i-1] is not '0', and add ways[i-2] when the two-digit slice sits between 10 and 26.",
      "'0' is the whole difficulty. It contributes nothing on its own, so a '0' that is not preceded by a 1 or a 2 makes the entire answer 0.",
    ],
    solution:
      "function numDecodings(s) {\n  if (s.length === 0) return 0;\n  const ways = new Array(s.length + 1).fill(0);\n  ways[0] = 1;\n  for (let i = 1; i <= s.length; i++) {\n    if (s[i - 1] !== '0') ways[i] += ways[i - 1];\n    if (i >= 2) {\n      const pair = Number(s.slice(i - 2, i));\n      if (pair >= 10 && pair <= 26) ways[i] += ways[i - 2];\n    }\n  }\n  return ways[s.length];\n}\n",
    tests: [
      {
        name: "two readings of 12",
        body: "assert.equal(numDecodings('12'), 2);",
      },
      {
        name: "three readings of 226",
        body: "assert.equal(numDecodings('226'), 3);",
      },
      {
        name: "leading and lone zeros are invalid",
        body: "assert.equal(numDecodings('06'), 0);\nassert.equal(numDecodings('0'), 0);\nassert.equal(numDecodings('100'), 0);",
      },
      {
        name: "a zero forced into a pair",
        body: "assert.equal(numDecodings('10'), 1);\nassert.equal(numDecodings('2101'), 1);",
      },
      {
        name: "longer string and the empty string",
        body: "assert.equal(numDecodings('11106'), 2);\nassert.equal(numDecodings(''), 0);",
      },
    ],
  },
{
    id: "ex-maximum-product-subarray",
    chapter: "dsa-dp-1d",
    level: "intermediate",
    title: "Maximum Product Subarray",
    brief:
      "<p>Given an integer array <code>nums</code>, return the largest product achievable by any <b>contiguous</b>, non-empty subarray.</p><ul><li>Negative numbers flip the sign, so today's worst product can become tomorrow's best</li><li>A zero resets any running product</li><li>A single element is a valid subarray, so an all-negative array still has an answer</li></ul>",
    starter: "function maxProduct(nums) {\n  // TODO: largest product of a contiguous non-empty subarray\n}\n",
    hints: [
      "Unlike maximum sum, tracking only the best running product fails: multiplying a large negative by another negative produces a large positive.",
      "So carry TWO running values as you sweep — the maximum product ending here and the minimum product ending here.",
      "At each element the three candidates are the element alone, element * previousMax, and element * previousMin. Take the max of those for the new max and the min for the new min, computing both from the OLD pair.",
    ],
    solution:
      "function maxProduct(nums) {\n  if (nums.length === 0) return 0;\n  let best = nums[0];\n  let curMax = nums[0];\n  let curMin = nums[0];\n  for (let i = 1; i < nums.length; i++) {\n    const value = nums[i];\n    const a = curMax * value;\n    const b = curMin * value;\n    curMax = Math.max(value, a, b);\n    curMin = Math.min(value, a, b);\n    if (curMax > best) best = curMax;\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "positive run",
        body: "assert.equal(maxProduct([2,3,-2,4]), 6);",
      },
      {
        name: "a zero caps the answer",
        body: "assert.equal(maxProduct([-2,0,-1]), 0);",
      },
      {
        name: "two negatives make a positive",
        body: "assert.equal(maxProduct([-2,3,-4]), 24);\nassert.equal(maxProduct([2,-5,-2,-4,3]), 24);",
      },
      {
        name: "all negative, single element wins",
        body: "assert.equal(maxProduct([-2]), -2);\nassert.equal(maxProduct([-1,-2,-9,-6]), 108);",
      },
      {
        name: "leading zero",
        body: "assert.equal(maxProduct([0,2]), 2);\nassert.equal(maxProduct([-2,0]), 0);",
      },
    ],
  },
{
    id: "ex-partition-equal-subset-sum",
    chapter: "dsa-dp-1d",
    level: "advanced",
    title: "Partition Equal Subset Sum",
    brief:
      "<p>Given an array <code>nums</code> of positive integers, return <code>true</code> if it can be split into two groups whose sums are equal.</p><ul><li>Every element must land in exactly one of the two groups</li><li>If the total is <b>odd</b> the answer is <code>false</code> immediately — no split can halve it</li><li>Otherwise the question reduces to: is there a subset summing to <code>total / 2</code>?</li></ul>",
    starter: "function canPartition(nums) {\n  // TODO: can nums be split into two groups of equal sum?\n}\n",
    hints: [
      "Check the total first. If it is odd, stop — no arrangement can work, and it costs one pass to find out.",
      "Otherwise this is a subset-sum decision problem with target = total / 2. Keep a boolean array reachable[0..target], with reachable[0] = true.",
      "For each number, update the array from target DOWN to that number: reachable[t] = reachable[t] || reachable[t - num]. Sweeping downward is what stops one number being used twice.",
    ],
    solution:
      "function canPartition(nums) {\n  let total = 0;\n  for (const n of nums) total += n;\n  if (total % 2 !== 0) return false;\n  const target = total / 2;\n  const reachable = new Array(target + 1).fill(false);\n  reachable[0] = true;\n  for (const n of nums) {\n    for (let t = target; t >= n; t--) {\n      if (reachable[t - n]) reachable[t] = true;\n    }\n  }\n  return reachable[target];\n}\n",
    tests: [
      {
        name: "splits into eleven and eleven",
        body: "assert.equal(canPartition([1,5,11,5]), true);",
      },
      {
        name: "an odd total is rejected outright",
        body: "assert.equal(canPartition([1,2,3,5]), false);\nassert.equal(canPartition([1]), false);",
      },
      {
        name: "even total but no valid subset",
        body: "assert.equal(canPartition([2,2,3,5]), false);",
      },
      {
        name: "trivial pair",
        body: "assert.equal(canPartition([1,1]), true);\nassert.equal(canPartition([1,2]), false);",
      },
      {
        name: "many equal values",
        body: "assert.equal(canPartition([100,100,100,100,100,100,100,100]), true);\nassert.equal(canPartition([3,3,3,4,5]), true);",
      },
    ],
  },
];
