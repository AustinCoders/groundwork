import type { Exercise } from "../types";

export const dsaAddBitManipulation: Exercise[] = [
  {
    "id": "ex-single-number-iii",
    "chapter": "dsa-bit-manipulation",
    "level": "intermediate",
    "title": "Single Number III",
    "brief": "<p>In <code>nums</code>, every value appears exactly <b>twice</b> except for two values that each appear once. Return those two values in ascending order, as <code>[smaller, larger]</code>.</p><ul><li>Aim for <b>O(n)</b> time and <b>O(1)</b> extra space — no hash set</li><li>The two values are different from each other, and values may be negative</li><li>Plain XOR of the whole array gives only <code>a ^ b</code>; you need one more idea to separate them</li></ul>",
    "starter": "function singleNumberIII(nums) {\n  // TODO: XOR everything, then split the numbers on one bit where the two survivors differ\n}\n",
    "hints": [
      "XOR all the numbers: every pair cancels and you are left with a ^ b, which is not zero because a and b differ.",
      "Any set bit of a ^ b is a position where a and b disagree. The lowest one is easy to isolate: bit = x & -x.",
      "Split the numbers into those with that bit set and those without. Each pair lands entirely in one group, so XOR-ing each group leaves one survivor. Sort the two at the end."
    ],
    "solution": "function singleNumberIII(nums) {\n  let xor = 0;\n  for (const num of nums) xor ^= num;\n  const bit = xor & -xor;\n  let a = 0;\n  let b = 0;\n  for (const num of nums) {\n    if (num & bit) a ^= num;\n    else b ^= num;\n  }\n  return a < b ? [a, b] : [b, a];\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.deepEqual(singleNumberIII([1, 2, 1, 3, 2, 5]), [3, 5]);"
      },
      {
        "name": "only the two survivors",
        "body": "assert.deepEqual(singleNumberIII([0, 1]), [0, 1]);\nassert.deepEqual(singleNumberIII([7, 4]), [4, 7]);"
      },
      {
        "name": "negative survivors",
        "body": "assert.deepEqual(singleNumberIII([-1, 0]), [-1, 0]);\nassert.deepEqual(singleNumberIII([-3, 8, -3, -9]), [-9, 8]);"
      },
      {
        "name": "survivors that differ only in the sign bit",
        "body": "assert.deepEqual(singleNumberIII([-2147483648, 0, 5, 5]), [-2147483648, 0]);\nassert.deepEqual(singleNumberIII([2147483647, -2147483648, 9, 9]), [-2147483648, 2147483647]);"
      },
      {
        "name": "survivors that agree on the lowest bit",
        "body": "assert.deepEqual(singleNumberIII([3, 5, 1, 1, 6, 6]), [3, 5]);"
      },
      {
        "name": "pairs far apart in the array",
        "body": "assert.deepEqual(singleNumberIII([4, 1, 2, 1, 2, 9, 4, 6, 9, 11]), [6, 11]);"
      },
      {
        "name": "a large array",
        "body": "const nums = [];\nfor (let i = 1; i <= 3000; i++) nums.push(i, i);\nnums.push(-77777, 123456);\nnums.reverse();\nassert.deepEqual(singleNumberIII(nums), [-77777, 123456]);"
      }
    ]
  },
  {
    "id": "ex-hamming-distance",
    "chapter": "dsa-bit-manipulation",
    "level": "beginner",
    "title": "Hamming Distance",
    "brief": "<p>The <b>Hamming distance</b> between two integers is the number of bit positions at which their 32-bit patterns differ. Return the Hamming distance between <code>x</code> and <code>y</code>.</p><ul><li><code>hammingDistance(1, 4)</code> is <code>2</code>: <code>001</code> and <code>100</code> differ in two positions</li><li>Treat negative numbers as their 32-bit two's complement patterns, so <code>hammingDistance(-1, 0)</code> is <code>32</code></li><li>Count set bits with <code>n &amp; (n - 1)</code> rather than testing all 32 positions</li></ul>",
    "starter": "function hammingDistance(x, y) {\n  // TODO: XOR marks the differing bits; count them\n}\n",
    "hints": [
      "XOR of two bits is 1 exactly when they differ. What does x ^ y look like?",
      "The answer is the number of 1-bits in x ^ y.",
      "n & (n - 1) clears the lowest set bit. Loop until n is 0 and count the iterations; it also terminates for negative n, because each step removes one 1-bit."
    ],
    "solution": "function hammingDistance(x, y) {\n  let diff = x ^ y;\n  let count = 0;\n  while (diff !== 0) {\n    diff &= diff - 1;\n    count++;\n  }\n  return count;\n}\n",
    "tests": [
      {
        "name": "1 and 4 differ in two positions",
        "body": "assert.equal(hammingDistance(1, 4), 2);"
      },
      {
        "name": "equal numbers",
        "body": "assert.equal(hammingDistance(0, 0), 0);\nassert.equal(hammingDistance(93, 93), 0);"
      },
      {
        "name": "one bit apart",
        "body": "assert.equal(hammingDistance(3, 1), 1);\nassert.equal(hammingDistance(8, 0), 1);"
      },
      {
        "name": "every low bit differs",
        "body": "assert.equal(hammingDistance(0, 2147483647), 31);"
      },
      {
        "name": "negative numbers use 32-bit patterns",
        "body": "assert.equal(hammingDistance(-1, 0), 32);\nassert.equal(hammingDistance(-1, 1), 31);"
      },
      {
        "name": "the sign bit counts",
        "body": "assert.equal(hammingDistance(-2147483648, 0), 1);\nassert.equal(hammingDistance(-2147483648, 2147483647), 32);"
      },
      {
        "name": "symmetric",
        "body": "assert.equal(hammingDistance(25, 30), hammingDistance(30, 25));\nassert.equal(hammingDistance(25, 30), 3);"
      }
    ]
  },
  {
    "id": "ex-total-hamming-distance",
    "chapter": "dsa-bit-manipulation",
    "level": "advanced",
    "title": "Total Hamming Distance",
    "brief": "<p>Given an array <code>nums</code> of non-negative integers below <code>2^31</code>, return the <b>sum of the Hamming distances between every pair</b> <code>(i, j)</code> with <code>i &lt; j</code>.</p><ul><li><code>totalHammingDistance([4, 14, 2])</code> is <code>6</code></li><li>Checking every pair is O(n²) pairs times a bit count; the target is <b>O(32 · n)</b></li><li>Fewer than two numbers give <code>0</code></li></ul>",
    "starter": "function totalHammingDistance(nums) {\n  // TODO: handle one bit position at a time\n}\n",
    "hints": [
      "Hamming distance adds up bit position by bit position, and the positions do not interact.",
      "In one position, count how many numbers have a 1 there (ones) and how many have a 0 (n - ones).",
      "A pair differs in that position exactly when one is a 1 and the other a 0: ones * (n - ones) pairs. Sum that over the 31 positions."
    ],
    "solution": "function totalHammingDistance(nums) {\n  const n = nums.length;\n  let total = 0;\n  for (let bit = 0; bit < 31; bit++) {\n    let ones = 0;\n    for (const num of nums) ones += (num >> bit) & 1;\n    total += ones * (n - ones);\n  }\n  return total;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(totalHammingDistance([4, 14, 2]), 6);"
      },
      {
        "name": "with a repeated value",
        "body": "assert.equal(totalHammingDistance([4, 14, 4]), 4);"
      },
      {
        "name": "no pairs",
        "body": "assert.equal(totalHammingDistance([]), 0);\nassert.equal(totalHammingDistance([9]), 0);"
      },
      {
        "name": "two numbers",
        "body": "assert.equal(totalHammingDistance([0, 7]), 3);\nassert.equal(totalHammingDistance([5, 5]), 0);"
      },
      {
        "name": "all zeros",
        "body": "assert.equal(totalHammingDistance([0, 0, 0, 0]), 0);"
      },
      {
        "name": "the largest values",
        "body": "assert.equal(totalHammingDistance([0, 2147483647]), 31);\nassert.equal(totalHammingDistance([2147483647, 2147483647, 0]), 62);"
      },
      {
        "name": "matches the pair-by-pair count on a pseudo-random array",
        "body": "let seed = 20260101;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst nums = Array.from({ length: 300 }, () => rand(1000000));\nlet expected = 0;\nfor (let i = 0; i < nums.length; i++) {\n  for (let j = i + 1; j < nums.length; j++) {\n    let diff = nums[i] ^ nums[j];\n    while (diff) { diff &= diff - 1; expected++; }\n  }\n}\nassert.equal(totalHammingDistance(nums), expected);"
      },
      {
        "name": "a long array finishes quickly",
        "body": "const nums = Array.from({ length: 50000 }, (_, i) => i * 7919 % 1000003);\nassert.ok(totalHammingDistance(nums) > 0);"
      }
    ]
  },
  {
    "id": "ex-number-complement",
    "chapter": "dsa-bit-manipulation",
    "level": "beginner",
    "title": "Number Complement",
    "brief": "<p>The <b>complement</b> of a positive integer is the number you get by flipping every bit of its binary representation, <em>without</em> the leading zeros. Return the complement of <code>num</code>.</p><ul><li><code>findComplement(5)</code> is <code>2</code>: <code>101</code> flips to <code>010</code></li><li><code>findComplement(1)</code> is <code>0</code></li><li><code>1 &lt;= num &lt;= 2147483647</code>; JavaScript's <code>~</code> flips all 32 bits, which is not what is asked</li></ul>",
    "starter": "function findComplement(num) {\n  // TODO: build a mask of ones as long as num's binary form, then XOR\n}\n",
    "hints": [
      "~num flips 32 bits including the leading zeros, giving a negative number. You only want to flip the bits up to the highest 1.",
      "Build a mask of all ones with the same bit length as num: start at 0 and shift left, ORing in a 1, once for each bit of num.",
      "num ^ mask flips exactly those bits."
    ],
    "solution": "function findComplement(num) {\n  let mask = 0;\n  for (let rest = num; rest > 0; rest >>= 1) mask = (mask << 1) | 1;\n  return num ^ mask;\n}\n",
    "tests": [
      {
        "name": "5 is 101, complement 010",
        "body": "assert.equal(findComplement(5), 2);"
      },
      {
        "name": "1 has the complement 0",
        "body": "assert.equal(findComplement(1), 0);"
      },
      {
        "name": "all ones flips to 0",
        "body": "assert.equal(findComplement(7), 0);\nassert.equal(findComplement(255), 0);"
      },
      {
        "name": "a power of two",
        "body": "assert.equal(findComplement(8), 7);\nassert.equal(findComplement(1024), 1023);"
      },
      {
        "name": "mixed bits",
        "body": "assert.equal(findComplement(10), 5);\nassert.equal(findComplement(100), 27);"
      },
      {
        "name": "the largest input",
        "body": "assert.equal(findComplement(2147483647), 0);\nassert.equal(findComplement(1073741824), 1073741823);"
      },
      {
        "name": "num + complement is all ones",
        "body": "for (const num of [3, 6, 9, 12345, 999999]) {\n  const comp = findComplement(num);\n  const bits = num.toString(2).length;\n  assert.equal(num + comp, 2 ** bits - 1);\n}"
      }
    ]
  },
  {
    "id": "ex-convert-to-hexadecimal",
    "chapter": "dsa-bit-manipulation",
    "level": "intermediate",
    "title": "Convert a Number to Hexadecimal",
    "brief": "<p>Given a signed 32-bit integer <code>num</code>, return its hexadecimal representation as a string.</p><ul><li>Use lowercase letters <code>a</code> to <code>f</code> and no leading zeros, except that zero itself is <code>\"0\"</code></li><li>Negative numbers use the <b>two's complement</b> pattern, so <code>toHex(-1)</code> is <code>\"ffffffff\"</code></li><li>Do the conversion with shifts and masks; <code>num.toString(16)</code> prints <code>\"-1\"</code> for negative numbers and is not the point of the exercise</li></ul>",
    "starter": "function toHex(num) {\n  // TODO: peel off four bits at a time\n}\n",
    "hints": [
      "Each hex digit is four bits. num & 15 is the lowest digit and num >>> 4 moves to the next.",
      "Use >>> (the unsigned shift), not >>, so a negative number does not keep copying its sign bit in. A negative number then ends after exactly eight digits.",
      "Digits come out lowest first, so prepend each one to the result; stop when the remaining number is 0, and handle num === 0 up front."
    ],
    "solution": "function toHex(num) {\n  if (num === 0) return \"0\";\n  const digits = \"0123456789abcdef\";\n  let rest = num >>> 0;\n  let out = \"\";\n  while (rest > 0) {\n    out = digits[rest & 15] + out;\n    rest >>>= 4;\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "26 is 1a",
        "body": "assert.equal(toHex(26), \"1a\");"
      },
      {
        "name": "zero",
        "body": "assert.equal(toHex(0), \"0\");"
      },
      {
        "name": "minus one is all ones",
        "body": "assert.equal(toHex(-1), \"ffffffff\");"
      },
      {
        "name": "negative numbers use two's complement",
        "body": "assert.equal(toHex(-26), \"ffffffe6\");\nassert.equal(toHex(-16), \"fffffff0\");"
      },
      {
        "name": "no leading zeros",
        "body": "assert.equal(toHex(16), \"10\");\nassert.equal(toHex(255), \"ff\");\nassert.equal(toHex(4096), \"1000\");"
      },
      {
        "name": "the extremes",
        "body": "assert.equal(toHex(2147483647), \"7fffffff\");\nassert.equal(toHex(-2147483648), \"80000000\");"
      },
      {
        "name": "agrees with the built-in on non-negative numbers",
        "body": "for (const num of [1, 9, 10, 15, 100, 65535, 65536, 123456789]) assert.equal(toHex(num), num.toString(16));"
      },
      {
        "name": "agrees with the unsigned built-in on negative numbers",
        "body": "for (const num of [-2, -255, -65536, -123456789]) assert.equal(toHex(num), (num >>> 0).toString(16));"
      }
    ]
  },
  {
    "id": "ex-subarray-xor-equals-k",
    "chapter": "dsa-bit-manipulation",
    "level": "advanced",
    "title": "Count Subarrays With XOR Equal to K",
    "brief": "<p>Given an integer array <code>nums</code> and an integer <code>k</code>, return the number of <b>non-empty contiguous subarrays</b> whose XOR is exactly <code>k</code>.</p><ul><li><code>countSubarraysXor([4, 2, 2, 6, 4], 6)</code> is <code>4</code></li><li>Subarrays with the same values at different positions count separately</li><li>Aim for <b>O(n)</b> time; checking every subarray is O(n²)</li></ul>",
    "starter": "function countSubarraysXor(nums, k) {\n  // TODO: prefix XOR plus a Map of how many times each prefix has been seen\n}\n",
    "hints": [
      "Let prefix[i] be the XOR of the first i numbers. The XOR of nums[i..j-1] is prefix[j] ^ prefix[i].",
      "That equals k exactly when prefix[i] === prefix[j] ^ k. For each j you want the number of earlier prefixes with that value.",
      "Keep a Map from prefix value to count, seeded with {0: 1} for the empty prefix, and update it after looking up."
    ],
    "solution": "function countSubarraysXor(nums, k) {\n  const seen = new Map([[0, 1]]);\n  let prefix = 0;\n  let count = 0;\n  for (const num of nums) {\n    prefix ^= num;\n    count += seen.get(prefix ^ k) ?? 0;\n    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);\n  }\n  return count;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(countSubarraysXor([4, 2, 2, 6, 4], 6), 4);"
      },
      {
        "name": "another example",
        "body": "assert.equal(countSubarraysXor([5, 6, 7, 8, 9], 5), 2);"
      },
      {
        "name": "an empty array",
        "body": "assert.equal(countSubarraysXor([], 0), 0);\nassert.equal(countSubarraysXor([], 5), 0);"
      },
      {
        "name": "k is zero and every subarray qualifies",
        "body": "assert.equal(countSubarraysXor([0, 0, 0], 0), 6);"
      },
      {
        "name": "the whole array is the only match",
        "body": "assert.equal(countSubarraysXor([1, 2, 4], 7), 1);"
      },
      {
        "name": "single elements",
        "body": "assert.equal(countSubarraysXor([3], 3), 1);\nassert.equal(countSubarraysXor([3], 2), 0);"
      },
      {
        "name": "negative numbers",
        "body": "assert.equal(countSubarraysXor([-1, -1, 5], 5), 2);\nassert.equal(countSubarraysXor([-1, -1, 0], 0), 3);"
      },
      {
        "name": "matches the quadratic count on a pseudo-random array",
        "body": "let seed = 20260101;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst nums = Array.from({ length: 400 }, () => rand(16));\nfor (const k of [0, 3, 9, 15]) {\n  let expected = 0;\n  for (let i = 0; i < nums.length; i++) {\n    let x = 0;\n    for (let j = i; j < nums.length; j++) {\n      x ^= nums[j];\n      if (x === k) expected++;\n    }\n  }\n  assert.equal(countSubarraysXor(nums, k), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-maximum-product-of-word-lengths",
    "chapter": "dsa-bit-manipulation",
    "level": "intermediate",
    "title": "Maximum Product of Word Lengths",
    "brief": "<p>Given an array of lowercase words, return the maximum value of <code>words[i].length * words[j].length</code> over all pairs of words that share <b>no letter</b>. If no such pair exists, return <code>0</code>.</p><ul><li>Represent each word's letters as a bitmask (bit <code>0</code> for <code>a</code> up to bit <code>25</code> for <code>z</code>) so that \"share no letter\" becomes one AND</li><li><code>maxProduct([\"abcw\", \"baz\", \"foo\", \"bar\", \"xtfn\", \"abcdef\"])</code> is <code>16</code>, from <code>\"abcw\"</code> and <code>\"xtfn\"</code></li><li>A word cannot be paired with itself</li></ul>",
    "starter": "function maxProduct(words) {\n  // TODO: one bitmask per word, then compare pairs with &\n}\n",
    "hints": [
      "Comparing two words letter by letter costs O(length). Can you reduce each word to one number first?",
      "mask |= 1 << (ch.charCodeAt(0) - 97) over the letters of a word. Two words share a letter exactly when (maskA & maskB) !== 0.",
      "Compute every mask once, then try all pairs: the pair loop is O(n²) cheap comparisons."
    ],
    "solution": "function maxProduct(words) {\n  const masks = words.map((word) => {\n    let mask = 0;\n    for (const ch of word) mask |= 1 << (ch.charCodeAt(0) - 97);\n    return mask;\n  });\n  let best = 0;\n  for (let i = 0; i < words.length; i++) {\n    for (let j = i + 1; j < words.length; j++) {\n      if ((masks[i] & masks[j]) === 0) best = Math.max(best, words[i].length * words[j].length);\n    }\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.equal(maxProduct([\"abcw\", \"baz\", \"foo\", \"bar\", \"xtfn\", \"abcdef\"]), 16);"
      },
      {
        "name": "a second example",
        "body": "assert.equal(maxProduct([\"a\", \"ab\", \"abc\", \"d\", \"cd\", \"bcd\", \"abcd\"]), 4);"
      },
      {
        "name": "no pair without a shared letter",
        "body": "assert.equal(maxProduct([\"a\", \"aa\", \"aaa\", \"aaaa\"]), 0);"
      },
      {
        "name": "empty and single",
        "body": "assert.equal(maxProduct([]), 0);\nassert.equal(maxProduct([\"ab\"]), 0);"
      },
      {
        "name": "two disjoint words",
        "body": "assert.equal(maxProduct([\"a\", \"b\"]), 1);\nassert.equal(maxProduct([\"abc\", \"xyz\"]), 9);"
      },
      {
        "name": "repeated letters inside a word do not matter",
        "body": "assert.equal(maxProduct([\"aabb\", \"ccdd\"]), 16);"
      },
      {
        "name": "the last letter z uses bit 25",
        "body": "assert.equal(maxProduct([\"zzz\", \"zy\", \"abc\"]), 9);"
      },
      {
        "name": "matches a letter-set comparison on pseudo-random words",
        "body": "let seed = 20260101;\nconst rand = (n) => { seed = (seed * 16807) % 2147483647; return seed % n; };\nconst words = Array.from({ length: 60 }, () => Array.from({ length: 1 + rand(6) }, () => String.fromCharCode(97 + rand(8))).join(\"\"));\nlet expected = 0;\nfor (let i = 0; i < words.length; i++) {\n  for (let j = i + 1; j < words.length; j++) {\n    const a = new Set(words[i]);\n    if (![...words[j]].some((ch) => a.has(ch))) expected = Math.max(expected, words[i].length * words[j].length);\n  }\n}\nassert.equal(maxProduct(words), expected);"
      }
    ]
  },
  {
    "id": "ex-submasks-of-a-mask",
    "chapter": "dsa-bit-manipulation",
    "level": "intermediate",
    "title": "Submasks of a Mask",
    "brief": "<p>Given a non-negative integer <code>mask</code>, return an array of all its <b>submasks</b>: every number whose set bits are a subset of the set bits of <code>mask</code>, including <code>mask</code> itself and <code>0</code>. List them from largest to smallest.</p><ul><li><code>submasks(11)</code> (binary <code>1011</code>) is <code>[11, 10, 9, 8, 3, 2, 1, 0]</code></li><li>A mask with <code>k</code> set bits has exactly <code>2^k</code> submasks</li><li>Visit only submasks: do not loop over every number below <code>mask</code>. The classic step is <code>(sub - 1) &amp; mask</code></li></ul>",
    "starter": "function submasks(mask) {\n  // TODO: start at mask and repeatedly step to the next smaller submask\n}\n",
    "hints": [
      "sub - 1 turns the lowest set bit of sub into 0 and every zero below it into 1. That can set bits that are not in mask.",
      "AND with mask throws those extra bits away, leaving the next smaller submask: sub = (sub - 1) & mask.",
      "Stop after you have added 0. If you test sub > 0 in the loop condition you will forget the 0 submask, so use a loop that breaks right after pushing 0."
    ],
    "solution": "function submasks(mask) {\n  const out = [];\n  for (let sub = mask; ; sub = (sub - 1) & mask) {\n    out.push(sub);\n    if (sub === 0) break;\n  }\n  return out;\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.deepEqual(submasks(11), [11, 10, 9, 8, 3, 2, 1, 0]);"
      },
      {
        "name": "zero has only itself",
        "body": "assert.deepEqual(submasks(0), [0]);"
      },
      {
        "name": "a single bit",
        "body": "assert.deepEqual(submasks(1), [1, 0]);\nassert.deepEqual(submasks(8), [8, 0]);"
      },
      {
        "name": "all bits set",
        "body": "assert.deepEqual(submasks(7), [7, 6, 5, 4, 3, 2, 1, 0]);"
      },
      {
        "name": "gaps between the bits",
        "body": "assert.deepEqual(submasks(5), [5, 4, 1, 0]);\nassert.deepEqual(submasks(18), [18, 16, 2, 0]);"
      },
      {
        "name": "the count is 2 to the number of set bits",
        "body": "const mask = 0b1010110101;\nlet bits = 0;\nfor (let m = mask; m; m &= m - 1) bits++;\nassert.equal(submasks(mask).length, 2 ** bits);"
      },
      {
        "name": "every result is a submask, in strictly descending order",
        "body": "const mask = 0b110101101;\nconst out = submasks(mask);\nfor (let i = 0; i < out.length; i++) {\n  assert.equal(out[i] & mask, out[i]);\n  if (i > 0) assert.ok(out[i] < out[i - 1]);\n}"
      },
      {
        "name": "matches the brute force over all smaller numbers",
        "body": "const mask = 0b1011011;\nconst expected = [];\nfor (let s = mask; s >= 0; s--) if ((s & mask) === s) expected.push(s);\nassert.deepEqual(submasks(mask), expected);"
      }
    ]
  },
  {
    "id": "ex-sort-integers-by-bit-count",
    "chapter": "dsa-bit-manipulation",
    "level": "beginner",
    "title": "Sort Integers by the Number of 1 Bits",
    "brief": "<p>Sort the non-negative integers in <code>arr</code> in <b>ascending order of the number of 1 bits</b> in their binary form. Numbers with the same bit count are ordered by value, smallest first. Return a new sorted array and leave <code>arr</code> unchanged.</p><ul><li><code>[0, 1, 2, 3, 4, 5, 6, 7, 8]</code> becomes <code>[0, 1, 2, 4, 8, 3, 5, 6, 7]</code></li><li>Use <code>n &amp; (n - 1)</code> to count the bits, and a comparator with two keys</li><li>Each element is below <code>2^31</code>, and the array may be empty</li></ul>",
    "starter": "function sortByBits(arr) {\n  // TODO: sort by (bit count, value)\n}\n",
    "hints": [
      "Write a helper that counts set bits: while (n) { n &= n - 1; count++; }.",
      "The comparator returns the difference of bit counts, and when that is 0 falls back to the difference of the values.",
      "arr.sort mutates its array. Sort a copy ([...arr] or arr.slice()) so the input stays unchanged."
    ],
    "solution": "function sortByBits(arr) {\n  const countBits = (n) => {\n    let count = 0;\n    while (n) {\n      n &= n - 1;\n      count++;\n    }\n    return count;\n  };\n  return arr.slice().sort((a, b) => countBits(a) - countBits(b) || a - b);\n}\n",
    "tests": [
      {
        "name": "the standard example",
        "body": "assert.deepEqual(sortByBits([0, 1, 2, 3, 4, 5, 6, 7, 8]), [0, 1, 2, 4, 8, 3, 5, 6, 7]);"
      },
      {
        "name": "powers of two all have one bit and sort by value",
        "body": "assert.deepEqual(sortByBits([1024, 512, 256, 128, 64, 32, 16, 8, 4, 2, 1]), [1, 2, 4, 8, 16, 32, 64, 128, 256, 512, 1024]);"
      },
      {
        "name": "empty and single",
        "body": "assert.deepEqual(sortByBits([]), []);\nassert.deepEqual(sortByBits([9]), [9]);"
      },
      {
        "name": "duplicates stay together",
        "body": "assert.deepEqual(sortByBits([3, 1, 3, 2, 1]), [1, 1, 2, 3, 3]);"
      },
      {
        "name": "a bigger value with fewer bits comes first",
        "body": "assert.deepEqual(sortByBits([7, 8]), [8, 7]);\nassert.deepEqual(sortByBits([15, 16, 1]), [1, 16, 15]);"
      },
      {
        "name": "the input is not modified",
        "body": "const input = [5, 3, 7, 1];\nconst result = sortByBits(input);\nassert.deepEqual(input, [5, 3, 7, 1]);\nassert.deepEqual(result, [1, 3, 5, 7]);"
      },
      {
        "name": "large values",
        "body": "assert.deepEqual(sortByBits([2147483647, 1073741824, 3]), [1073741824, 3, 2147483647]);"
      }
    ]
  }
];
