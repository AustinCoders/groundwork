import type { Exercise } from "../types";

export const dsaAddStringAlgorithms: Exercise[] = [
  {
    "id": "ex-longest-duplicate-substring",
    "chapter": "dsa-string-algorithms",
    "level": "advanced",
    "title": "Longest Duplicate Substring",
    "brief": "<p>Write <code>longestDupSubstring(s)</code> returning the longest substring of <code>s</code> that occurs <b>at least twice</b>. The two occurrences may overlap (in <code>\"aaaa\"</code> the answer is <code>\"aaa\"</code>, found at positions 0 and 1). If no substring repeats, return the empty string. If several longest ones exist, any of them is accepted.</p><ul><li>Comparing every pair of positions is far too slow for a string of tens of thousands of characters</li><li>Hash equality is not proof of equality: confirm a hit before you trust it</li></ul>",
    "starter": "function longestDupSubstring(s) {\n  // TODO: binary search on the length, with a rolling hash for each length\n}\n",
    "hints": [
      "If a substring of length L occurs twice, so does a substring of length L - 1 (drop the last character of both copies). So 'is there a duplicate of length L?' flips from true to false once, and you can binary search L.",
      "To test one length, slide a window over the string, hash each window, and keep the hashes in a Map. Compute window hashes in O(1) with prefix hashes: hash(l, r) = H[r] - H[l] * B^(r - l) modulo a prime.",
      "Use a modulus around 10^9 and multiply with care: a product of two such numbers exceeds 2^53. BigInt is the simplest safe choice here. When a window's hash is already in the Map, compare the actual substrings before accepting it, so a collision only costs time. Search lengths from 1 to n - 1."
    ],
    "solution": "function longestDupSubstring(s) {\n  const n = s.length;\n  const MOD = 1000000007n;\n  const BASE = BigInt(257 + Math.floor(Math.random() * 1000));\n  const prefix = new Array(n + 1).fill(0n);\n  const power = new Array(n + 1).fill(1n);\n  for (let i = 0; i < n; i++) {\n    prefix[i + 1] = (prefix[i] * BASE + BigInt(s.charCodeAt(i))) % MOD;\n    power[i + 1] = (power[i] * BASE) % MOD;\n  }\n  const hashOf = (l, r) => (prefix[r] - ((prefix[l] * power[r - l]) % MOD) + MOD) % MOD;\n  const duplicateStart = (len) => {\n    const seen = new Map();\n    for (let i = 0; i + len <= n; i++) {\n      const h = hashOf(i, i + len);\n      const starts = seen.get(h);\n      if (starts === undefined) {\n        seen.set(h, [i]);\n        continue;\n      }\n      const here = s.slice(i, i + len);\n      if (starts.some((j) => s.startsWith(here, j))) return i;\n      starts.push(i);\n    }\n    return -1;\n  };\n  let lo = 1;\n  let hi = n - 1;\n  let best = \"\";\n  while (lo <= hi) {\n    const mid = (lo + hi) >> 1;\n    const at = duplicateStart(mid);\n    if (at !== -1) {\n      best = s.slice(at, at + mid);\n      lo = mid + 1;\n    } else {\n      hi = mid - 1;\n    }\n  }\n  return best;\n}\n",
    "tests": [
      {
        "name": "banana",
        "body": "assert.equal(longestDupSubstring(\"banana\"), \"ana\");"
      },
      {
        "name": "nothing repeats",
        "body": "assert.equal(longestDupSubstring(\"abcd\"), \"\");\nassert.equal(longestDupSubstring(\"a\"), \"\");\nassert.equal(longestDupSubstring(\"\"), \"\");"
      },
      {
        "name": "overlapping copies count",
        "body": "assert.equal(longestDupSubstring(\"aaaa\"), \"aaa\");\nassert.equal(longestDupSubstring(\"aaaaa\"), \"aaaa\");"
      },
      {
        "name": "the repeat can be the whole string minus one character",
        "body": "assert.equal(longestDupSubstring(\"abab\"), \"ab\");\nassert.equal(longestDupSubstring(\"ababa\"), \"aba\");"
      },
      {
        "name": "two copies far apart",
        "body": "assert.equal(longestDupSubstring(\"xyzabcdefq1abcdefr2\"), \"abcdef\");"
      },
      {
        "name": "any longest answer is accepted",
        "body": "const got = longestDupSubstring(\"abcxabcyabdzabd\");\nassert.equal(got.length, 3);\nassert.equal([\"abc\", \"abd\"].includes(got), true);"
      },
      {
        "name": "agrees with brute force on random strings",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nfor (let round = 0; round < 120; round++) {\n  const s = word(ri(0, 30), \"ab\" + (round % 2 ? \"c\" : \"\"));\n  let longest = 0;\n  for (let i = 0; i < s.length; i++) {\n    for (let j = i + 1; j < s.length; j++) {\n      let h = 0;\n      while (j + h < s.length && s[i + h] === s[j + h]) h++;\n      longest = Math.max(longest, h);\n    }\n  }\n  const got = longestDupSubstring(s);\n  assert.equal(got.length, longest);\n  if (longest > 0) assert.equal(s.indexOf(got) !== s.lastIndexOf(got), true);\n}"
      },
      {
        "name": "a long string with a planted repeat finishes quickly",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nconst planted = word(1500, \"abcdefghijklmnopqrstuvwxyz\");\nconst s = word(4000, \"abcdefghijklmnopqrstuvwxyz\") + planted + word(3000, \"abcdefghijklmnopqrstuvwxyz\") + planted + word(2000, \"abcdefghijklmnopqrstuvwxyz\");\nconst got = longestDupSubstring(s);\nassert.equal(got.length >= 1500, true);\nassert.equal(s.indexOf(got) !== s.lastIndexOf(got), true);"
      }
    ]
  },
  {
    "id": "ex-sum-of-scores",
    "chapter": "dsa-string-algorithms",
    "level": "intermediate",
    "title": "Sum of Scores of Built Strings",
    "brief": "<p>A string is built by prepending one character at a time, so after <code>i</code> steps it is the suffix of <code>s</code> of length <code>i</code>, for <code>i = 1, 2, ..., n</code>. The <b>score</b> of that string is the length of its longest common prefix with the whole of <code>s</code>. Write <code>sumScores(s)</code> returning the total of all <code>n</code> scores.</p><ul><li>For <code>\"babab\"</code> the scores are 1, 0, 3, 0, 5 and the answer is 9</li><li>The last string is <code>s</code> itself and scores <code>n</code></li><li>Comparing every suffix with <code>s</code> is O(n^2) on a string like <code>\"aaaa...\"</code>; aim for O(n)</li></ul>",
    "starter": "function sumScores(s) {\n  // TODO\n}\n",
    "hints": [
      "The string of length i starts at position n - i of s. Its score is how far s agrees with itself starting at that position.",
      "That 'how far the string agrees with its own beginning at position p' is exactly the Z-function value z[p]. The sum over all positions is the sum over all suffixes.",
      "Compute the Z array in O(n) with the Z-box (l, r): copy z[i - l] clamped by r - i, then extend by comparing characters. Set z[0] = n, because the whole string matches itself, and sum the array."
    ],
    "solution": "function sumScores(s) {\n  const n = s.length;\n  if (n === 0) return 0;\n  const z = new Array(n).fill(0);\n  z[0] = n;\n  let l = 0;\n  let r = 0;\n  for (let i = 1; i < n; i++) {\n    if (i < r) z[i] = Math.min(r - i, z[i - l]);\n    while (i + z[i] < n && s[z[i]] === s[i + z[i]]) z[i]++;\n    if (i + z[i] > r) {\n      l = i;\n      r = i + z[i];\n    }\n  }\n  return z.reduce((total, value) => total + value, 0);\n}\n",
    "tests": [
      {
        "name": "babab",
        "body": "assert.equal(sumScores(\"babab\"), 9);"
      },
      {
        "name": "azbazbzaz",
        "body": "assert.equal(sumScores(\"azbazbzaz\"), 14);"
      },
      {
        "name": "a single character and the empty string",
        "body": "assert.equal(sumScores(\"a\"), 1);\nassert.equal(sumScores(\"\"), 0);"
      },
      {
        "name": "all different characters: only the whole string scores",
        "body": "assert.equal(sumScores(\"abcdef\"), 6);"
      },
      {
        "name": "all the same character",
        "body": "assert.equal(sumScores(\"aaaa\"), 4 + 3 + 2 + 1);"
      },
      {
        "name": "a repeating block",
        "body": "assert.equal(sumScores(\"abababab\"), 8 + 6 + 4 + 2);"
      },
      {
        "name": "a long string finishes quickly",
        "body": "assert.equal(sumScores(\"a\".repeat(60000)), (60000 * 60001) / 2);"
      },
      {
        "name": "agrees with brute force on random strings",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nfor (let round = 0; round < 200; round++) {\n  const s = word(ri(0, 25), \"ab\" + (round % 3 ? \"\" : \"c\"));\n  let expected = 0;\n  for (let i = 0; i < s.length; i++) {\n    let h = 0;\n    while (i + h < s.length && s[h] === s[i + h]) h++;\n    expected += h;\n  }\n  assert.equal(sumScores(s), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-rotate-string",
    "chapter": "dsa-string-algorithms",
    "level": "intermediate",
    "title": "Rotate String",
    "brief": "<p>A <b>rotation</b> of a string moves some number of its leading characters to the end: the rotations of <code>\"abcde\"</code> are <code>\"abcde\"</code>, <code>\"bcdea\"</code>, <code>\"cdeab\"</code>, <code>\"deabc\"</code> and <code>\"eabcd\"</code>. Write <code>isRotation(s, goal)</code> returning <code>true</code> when <code>goal</code> is some rotation of <code>s</code>.</p><ul><li>Strings of different lengths are never rotations of each other</li><li>Two empty strings are rotations of each other</li><li>Repeated characters make this trickier than it looks: <code>\"aab\"</code> and <code>\"aba\"</code> are rotations, <code>\"aab\"</code> and <code>\"abb\"</code> are not</li></ul>",
    "starter": "function isRotation(s, goal) {\n  // TODO\n}\n",
    "hints": [
      "Write out s followed by s, e.g. 'abcde' + 'abcde' = 'abcdeabcde'. Where do the rotations of s show up in it?",
      "Every rotation of s is a window of length n inside s + s. So goal is a rotation exactly when it has the same length and appears inside s + s.",
      "Check the lengths first. For the substring test you can use the built-in includes; KMP gives a worst-case linear guarantee. Remember the empty-string case."
    ],
    "solution": "function isRotation(s, goal) {\n  if (s.length !== goal.length) return false;\n  return (s + s).includes(goal);\n}\n",
    "tests": [
      {
        "name": "a rotation",
        "body": "assert.equal(isRotation(\"abcde\", \"cdeab\"), true);"
      },
      {
        "name": "not a rotation",
        "body": "assert.equal(isRotation(\"abcde\", \"abced\"), false);"
      },
      {
        "name": "the same string",
        "body": "assert.equal(isRotation(\"abc\", \"abc\"), true);"
      },
      {
        "name": "different lengths",
        "body": "assert.equal(isRotation(\"abc\", \"abcabc\"), false);\nassert.equal(isRotation(\"abc\", \"ab\"), false);"
      },
      {
        "name": "empty strings",
        "body": "assert.equal(isRotation(\"\", \"\"), true);\nassert.equal(isRotation(\"a\", \"\"), false);"
      },
      {
        "name": "repeated characters",
        "body": "assert.equal(isRotation(\"aab\", \"aba\"), true);\nassert.equal(isRotation(\"aab\", \"abb\"), false);\nassert.equal(isRotation(\"aaaa\", \"aaaa\"), true);"
      },
      {
        "name": "a goal that is a substring of s + s but too long or short",
        "body": "assert.equal(isRotation(\"ab\", \"ba\"), true);\nassert.equal(isRotation(\"ab\", \"bab\"), false);"
      },
      {
        "name": "agrees with trying every rotation on random strings",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nfor (let round = 0; round < 300; round++) {\n  const s = word(ri(0, 8), \"ab\");\n  const goal = word(s.length, \"ab\");\n  let expected = s.length === 0;\n  for (let i = 0; i < s.length; i++) if (s.slice(i) + s.slice(0, i) === goal) expected = true;\n  assert.equal(isRotation(s, goal), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-shortest-palindrome",
    "chapter": "dsa-string-algorithms",
    "level": "advanced",
    "title": "Shortest Palindrome",
    "brief": "<p>You may add characters <b>only in front of</b> <code>s</code>. Write <code>shortestPalindrome(s)</code> returning the shortest palindrome you can make this way.</p><ul><li><code>\"aacecaaa\"</code> becomes <code>\"aaacecaaa\"</code>; <code>\"abcd\"</code> becomes <code>\"dcbabcd\"</code></li><li>An empty string stays empty, and a string that is already a palindrome is returned unchanged</li><li>Assume <code>s</code> contains only lowercase letters</li><li>Checking every prefix for being a palindrome is O(n^2); aim for O(n)</li></ul>",
    "starter": "function shortestPalindrome(s) {\n  // TODO\n}\n",
    "hints": [
      "Whatever you add in front is the reverse of a suffix of s. The best case keeps the longest prefix of s that is already a palindrome and mirrors only what follows it.",
      "The prefix of length k is a palindrome exactly when it equals the length-k suffix of reverse(s). A prefix that equals a suffix of the same string is a border.",
      "Build s + '#' + reverse(s) and compute its prefix function (KMP failure table). The last value is the length of the longest palindromic prefix of s. Prepend the reverse of the remaining characters."
    ],
    "solution": "function shortestPalindrome(s) {\n  const rev = s.split(\"\").reverse().join(\"\");\n  const glued = s + \"#\" + rev;\n  const fail = new Array(glued.length).fill(0);\n  let len = 0;\n  for (let i = 1; i < glued.length; i++) {\n    while (len > 0 && glued[i] !== glued[len]) len = fail[len - 1];\n    if (glued[i] === glued[len]) len++;\n    fail[i] = len;\n  }\n  const keep = fail[glued.length - 1];\n  return rev.slice(0, s.length - keep) + s;\n}\n",
    "tests": [
      {
        "name": "aacecaaa",
        "body": "assert.equal(shortestPalindrome(\"aacecaaa\"), \"aaacecaaa\");"
      },
      {
        "name": "abcd",
        "body": "assert.equal(shortestPalindrome(\"abcd\"), \"dcbabcd\");"
      },
      {
        "name": "empty and single",
        "body": "assert.equal(shortestPalindrome(\"\"), \"\");\nassert.equal(shortestPalindrome(\"a\"), \"a\");"
      },
      {
        "name": "already a palindrome",
        "body": "assert.equal(shortestPalindrome(\"racecar\"), \"racecar\");\nassert.equal(shortestPalindrome(\"abba\"), \"abba\");"
      },
      {
        "name": "the whole string is one repeated letter",
        "body": "assert.equal(shortestPalindrome(\"aaaa\"), \"aaaa\");"
      },
      {
        "name": "a palindromic prefix of length one",
        "body": "assert.equal(shortestPalindrome(\"ab\"), \"bab\");\nassert.equal(shortestPalindrome(\"abb\"), \"bbabb\");"
      },
      {
        "name": "a long string finishes quickly",
        "body": "const s = \"a\".repeat(50000) + \"b\";\nassert.equal(shortestPalindrome(s), \"b\" + s);"
      },
      {
        "name": "agrees with brute force on random strings",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nconst isPal = (t) => t === t.split(\"\").reverse().join(\"\");\nfor (let round = 0; round < 300; round++) {\n  const s = word(ri(0, 10), \"abc\");\n  let expected = s;\n  for (let k = 0; k <= s.length; k++) {\n    const candidate = s.slice(s.length - k).split(\"\").reverse().join(\"\") + s;\n    if (isPal(candidate)) {\n      expected = candidate;\n      break;\n    }\n  }\n  assert.equal(shortestPalindrome(s), expected);\n}"
      }
    ]
  },
  {
    "id": "ex-smallest-rotation",
    "chapter": "dsa-string-algorithms",
    "level": "advanced",
    "title": "Lexicographically Smallest Rotation",
    "brief": "<p>Write <code>smallestRotation(s)</code> returning the alphabetically smallest string among all rotations of <code>s</code> (a rotation moves some leading characters to the end).</p><ul><li><code>\"bca\"</code> gives <code>\"abc\"</code>; <code>\"cabab\"</code> gives <code>\"ababc\"</code></li><li>The empty string gives the empty string</li><li>Building and comparing all n rotations is O(n^2); aim for O(n) time and O(1) extra space beyond the result</li></ul>",
    "starter": "function smallestRotation(s) {\n  // TODO\n}\n",
    "hints": [
      "Keep two candidate start positions, i and j, and compare the rotations that start at them one character at a time, wrapping around with a modulo.",
      "Let k be how many characters have matched. At the first difference, the candidate with the larger character cannot be the best start, and neither can the next k starts after it: each of those is worse than the matching start of the other candidate. So skip it forward by k + 1.",
      "Reset k to 0 after a skip, and if the two candidates land on the same index move one of them forward. Stop when a candidate runs off the end or k reaches n. The answer starts at min(i, j)."
    ],
    "solution": "function smallestRotation(s) {\n  const n = s.length;\n  let i = 0;\n  let j = 1;\n  let k = 0;\n  while (i < n && j < n && k < n) {\n    const a = s[(i + k) % n];\n    const b = s[(j + k) % n];\n    if (a === b) {\n      k++;\n      continue;\n    }\n    if (a > b) i += k + 1;\n    else j += k + 1;\n    if (i === j) j++;\n    k = 0;\n  }\n  const at = Math.min(i, j);\n  return s.slice(at) + s.slice(0, at);\n}\n",
    "tests": [
      {
        "name": "bca",
        "body": "assert.equal(smallestRotation(\"bca\"), \"abc\");"
      },
      {
        "name": "cabab",
        "body": "assert.equal(smallestRotation(\"cabab\"), \"ababc\");"
      },
      {
        "name": "empty and single",
        "body": "assert.equal(smallestRotation(\"\"), \"\");\nassert.equal(smallestRotation(\"z\"), \"z\");"
      },
      {
        "name": "already the smallest",
        "body": "assert.equal(smallestRotation(\"aab\"), \"aab\");"
      },
      {
        "name": "a periodic string",
        "body": "assert.equal(smallestRotation(\"abab\"), \"abab\");\nassert.equal(smallestRotation(\"baba\"), \"abab\");"
      },
      {
        "name": "one repeated letter",
        "body": "assert.equal(smallestRotation(\"aaaa\"), \"aaaa\");"
      },
      {
        "name": "the smallest block begins after a long run of larger letters",
        "body": "assert.equal(smallestRotation(\"zzzzzzab\"), \"abzzzzzz\");\nassert.equal(smallestRotation(\"cbaaab\"), \"aaabcb\");"
      },
      {
        "name": "agrees with sorting all rotations on random strings",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nfor (let round = 0; round < 400; round++) {\n  const s = word(ri(0, 12), round % 2 ? \"ab\" : \"abc\");\n  const rotations = [];\n  for (let i = 0; i < s.length; i++) rotations.push(s.slice(i) + s.slice(0, i));\n  rotations.sort();\n  assert.equal(smallestRotation(s), s.length ? rotations[0] : \"\");\n}"
      }
    ]
  },
  {
    "id": "ex-distinct-substrings",
    "chapter": "dsa-string-algorithms",
    "level": "advanced",
    "title": "Count Distinct Substrings",
    "brief": "<p>Write <code>countDistinctSubstrings(s)</code> returning how many <b>different</b> non-empty substrings <code>s</code> has. Equal substrings found at different positions count once.</p><ul><li><code>\"banana\"</code> has 15; <code>\"aaa\"</code> has 3 (<code>\"a\"</code>, <code>\"aa\"</code>, <code>\"aaa\"</code>); the empty string has 0</li><li>Putting every substring in a Set is O(n^3) in time and memory</li><li>A target of O(n log^2 n) is reachable with sorted suffixes</li></ul>",
    "starter": "function countDistinctSubstrings(s) {\n  // TODO\n}\n",
    "hints": [
      "There are n(n+1)/2 substrings if you count repeats. Think about which ones were counted twice.",
      "Sort all suffixes. Every substring is a prefix of some suffix, and a suffix adds new substrings only beyond the prefix it shares with the suffix just before it in sorted order.",
      "Build the suffix array by prefix doubling (sort by the first 2^t characters, using pairs of ranks), then get the common-prefix length of neighbouring suffixes with Kasai's algorithm. The answer is n(n+1)/2 minus the sum of those lengths."
    ],
    "solution": "function countDistinctSubstrings(s) {\n  const n = s.length;\n  if (n === 0) return 0;\n  const sa = Array.from({ length: n }, (_, i) => i);\n  let rank = Array.from(s, (c) => c.charCodeAt(0));\n  for (let k = 1; ; k *= 2) {\n    const second = (i) => (i + k < n ? rank[i + k] : -1);\n    sa.sort((a, b) => rank[a] - rank[b] || second(a) - second(b));\n    const next = new Array(n).fill(0);\n    for (let i = 1; i < n; i++) {\n      const same = rank[sa[i - 1]] === rank[sa[i]] && second(sa[i - 1]) === second(sa[i]);\n      next[sa[i]] = next[sa[i - 1]] + (same ? 0 : 1);\n    }\n    rank = next;\n    if (rank[sa[n - 1]] === n - 1) break;\n  }\n  const position = new Array(n);\n  for (let i = 0; i < n; i++) position[sa[i]] = i;\n  let common = 0;\n  let h = 0;\n  for (let i = 0; i < n; i++) {\n    if (position[i] === n - 1) {\n      h = 0;\n      continue;\n    }\n    const j = sa[position[i] + 1];\n    while (i + h < n && j + h < n && s[i + h] === s[j + h]) h++;\n    common += h;\n    if (h > 0) h--;\n  }\n  return (n * (n + 1)) / 2 - common;\n}\n",
    "tests": [
      {
        "name": "banana",
        "body": "assert.equal(countDistinctSubstrings(\"banana\"), 15);"
      },
      {
        "name": "aaa",
        "body": "assert.equal(countDistinctSubstrings(\"aaa\"), 3);"
      },
      {
        "name": "empty and single",
        "body": "assert.equal(countDistinctSubstrings(\"\"), 0);\nassert.equal(countDistinctSubstrings(\"a\"), 1);"
      },
      {
        "name": "all different characters",
        "body": "assert.equal(countDistinctSubstrings(\"abcd\"), 10);"
      },
      {
        "name": "a repeated block",
        "body": "assert.equal(countDistinctSubstrings(\"abab\"), 7);"
      },
      {
        "name": "two letters",
        "body": "assert.equal(countDistinctSubstrings(\"ab\"), 3);\nassert.equal(countDistinctSubstrings(\"aab\"), 5);"
      },
      {
        "name": "a longer string finishes quickly",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nconst s = word(3000, \"ab\");\nconst count = countDistinctSubstrings(s);\nassert.equal(count > 0 && count <= (3000 * 3001) / 2, true);\nassert.equal(countDistinctSubstrings(\"a\".repeat(3000)), 3000);"
      },
      {
        "name": "agrees with a Set of every substring on random strings",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nfor (let round = 0; round < 200; round++) {\n  const s = word(ri(0, 14), round % 2 ? \"ab\" : \"abc\");\n  const all = new Set();\n  for (let i = 0; i < s.length; i++) for (let j = i + 1; j <= s.length; j++) all.add(s.slice(i, j));\n  assert.equal(countDistinctSubstrings(s), all.size);\n}"
      }
    ]
  },
  {
    "id": "ex-count-keyword-occurrences",
    "chapter": "dsa-string-algorithms",
    "level": "advanced",
    "title": "Count Every Keyword in a Text",
    "brief": "<p>Write <code>countKeywordOccurrences(text, words)</code> returning an array with, for each word in <code>words</code> (same order), the number of times it occurs in <code>text</code>. Occurrences may overlap, and words may repeat or contain each other. Words are non-empty.</p><ul><li><code>countKeywordOccurrences(\"ushers\", [\"he\", \"she\", \"his\", \"hers\"])</code> is <code>[1, 1, 0, 1]</code></li><li><code>countKeywordOccurrences(\"aaaa\", [\"a\", \"aa\"])</code> is <code>[4, 3]</code></li><li>Searching the text once per word is O(k * n); with many words, use one pass</li></ul>",
    "starter": "function countKeywordOccurrences(text, words) {\n  // TODO\n}\n",
    "hints": [
      "Insert all the words into one trie. Walking the text through the trie finds matches that begin at the same place, but you also need matches that begin later.",
      "Give each trie node a failure link: the node for the longest proper suffix of its string that is also in the trie. When the next character has no edge, follow links until it does. Compute links breadth-first so each link points to a finished node.",
      "At each text position the current node represents the longest matching suffix; every word that ends at the node or along its failure chain also ends here. Let each node inherit the word ids of its failure link while building, then add one to the count of each id at every position. Remember that equal words share a node."
    ],
    "solution": "function countKeywordOccurrences(text, words) {\n  const next = [new Map()];\n  const link = [0];\n  const ends = [[]];\n  words.forEach((word, id) => {\n    let node = 0;\n    for (const ch of word) {\n      if (!next[node].has(ch)) {\n        next[node].set(ch, next.length);\n        next.push(new Map());\n        link.push(0);\n        ends.push([]);\n      }\n      node = next[node].get(ch);\n    }\n    ends[node].push(id);\n  });\n  const queue = [...next[0].values()];\n  for (let head = 0; head < queue.length; head++) {\n    const node = queue[head];\n    for (const [ch, child] of next[node]) {\n      let f = link[node];\n      while (f !== 0 && !next[f].has(ch)) f = link[f];\n      link[child] = next[f].has(ch) ? next[f].get(ch) : 0;\n      ends[child] = ends[child].concat(ends[link[child]]);\n      queue.push(child);\n    }\n  }\n  const counts = new Array(words.length).fill(0);\n  let node = 0;\n  for (const ch of text) {\n    while (node !== 0 && !next[node].has(ch)) node = link[node];\n    if (next[node].has(ch)) node = next[node].get(ch);\n    for (const id of ends[node]) counts[id]++;\n  }\n  return counts;\n}\n",
    "tests": [
      {
        "name": "the classic example",
        "body": "assert.deepEqual(countKeywordOccurrences(\"ushers\", [\"he\", \"she\", \"his\", \"hers\"]), [1, 1, 0, 1]);"
      },
      {
        "name": "overlapping occurrences",
        "body": "assert.deepEqual(countKeywordOccurrences(\"aaaa\", [\"a\", \"aa\"]), [4, 3]);\nassert.deepEqual(countKeywordOccurrences(\"ababab\", [\"abab\", \"bab\"]), [2, 2]);"
      },
      {
        "name": "no word occurs",
        "body": "assert.deepEqual(countKeywordOccurrences(\"hello\", [\"xyz\", \"lo!\"]), [0, 0]);"
      },
      {
        "name": "an empty text",
        "body": "assert.deepEqual(countKeywordOccurrences(\"\", [\"a\"]), [0]);"
      },
      {
        "name": "a repeated word is counted for each copy",
        "body": "assert.deepEqual(countKeywordOccurrences(\"abcabc\", [\"abc\", \"abc\"]), [2, 2]);"
      },
      {
        "name": "a word as long as the text",
        "body": "assert.deepEqual(countKeywordOccurrences(\"abc\", [\"abc\", \"abcd\"]), [1, 0]);"
      },
      {
        "name": "a long text finishes quickly",
        "body": "const text = \"ab\".repeat(50000);\nconst got = countKeywordOccurrences(text, [\"ab\", \"ba\", \"abab\", \"bab\"]);\nassert.deepEqual(got, [50000, 49999, 49999, 49999]);"
      },
      {
        "name": "agrees with counting every window on random inputs",
        "body": "let seed = 5;\nconst rnd = () => (seed = (seed * 1103515245 + 12345) & 0x7fffffff) / 0x7fffffff;\nconst ri = (a, b) => a + Math.floor(rnd() * (b - a + 1));\nconst word = (n, letters) => Array.from({ length: n }, () => letters[ri(0, letters.length - 1)]).join(\"\");\nfor (let round = 0; round < 150; round++) {\n  const text = word(ri(0, 30), \"ab\");\n  const words = Array.from({ length: ri(1, 5) }, () => word(ri(1, 4), \"ab\"));\n  const expected = words.map((w) => {\n    let count = 0;\n    for (let i = 0; i + w.length <= text.length; i++) if (text.startsWith(w, i)) count++;\n    return count;\n  });\n  assert.deepEqual(countKeywordOccurrences(text, words), expected);\n}"
      }
    ]
  }
];
