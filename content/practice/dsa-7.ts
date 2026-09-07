import type { Exercise } from "../types";

export const dsa7: Exercise[] = [
{
    id: "ex-group-anagrams",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Group Anagrams",
    brief:
      "<p>Given an array of strings, bucket them so that every bucket holds words that are anagrams of one another. Write <code>groupAnagrams(strs)</code> returning an array of those buckets.</p><ul><li>The order of the buckets and the order inside each bucket do not matter</li><li>Every input string belongs to exactly one bucket, duplicates included</li><li>The empty string forms a bucket of its own</li><li>An empty input array yields an empty array</li></ul>",
    starter:
      "function groupAnagrams(strs) {\n  // TODO: return the strings grouped so each group holds mutual anagrams\n}\n",
    hints: [
      "Comparing every pair is O(n^2 * k). Instead, give each word a key that is identical for all its anagrams.",
      "Sorting a word's characters produces exactly such a key — 'eat', 'tea' and 'ate' all become 'aet'.",
      "Collect the words into a Map from key to array, then return the Map's values.",
    ],
    solution:
      "function groupAnagrams(strs) {\n  const groups = new Map();\n  for (const word of strs) {\n    const key = word.split('').sort().join('');\n    if (!groups.has(key)) groups.set(key, []);\n    groups.get(key).push(word);\n  }\n  const out = [];\n  for (const group of groups.values()) out.push(group);\n  return out;\n}\n",
    tests: [
      {
        name: "groups a mixed list",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nconst got = groupAnagrams(['eat', 'tea', 'tan', 'ate', 'nat', 'bat']);\nassert.deepEqual(norm(got), norm([['eat', 'tea', 'ate'], ['tan', 'nat'], ['bat']]));",
      },
      {
        name: "single empty string",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nassert.deepEqual(norm(groupAnagrams([''])), norm([['']]));",
      },
      {
        name: "nothing groups together",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nconst got = groupAnagrams(['abc', 'de', 'f']);\nassert.equal(got.length, 3);\nassert.deepEqual(norm(got), norm([['abc'], ['de'], ['f']]));",
      },
      {
        name: "duplicates stay in the same bucket",
        body: "const norm = (gs) =>\n  gs.map((g) => g.slice().sort()).sort((a, b) => (a.join(',') < b.join(',') ? -1 : 1));\nconst got = groupAnagrams(['ab', 'ba', 'ab']);\nassert.equal(got.length, 1);\nassert.deepEqual(norm(got), norm([['ab', 'ab', 'ba']]));",
      },
      {
        name: "empty input",
        body: "assert.deepEqual(groupAnagrams([]), []);",
      },
    ],
  },
{
    id: "ex-valid-parentheses",
    chapter: "dsa-stacks-queues",
    level: "beginner",
    title: "Valid Parentheses",
    brief:
      "<p>A string made only of <code>()</code>, <code>[]</code> and <code>{}</code> is balanced when every opening bracket is closed by the matching kind, in the right order. Write <code>isValid(s)</code>.</p><ul><li>Brackets may nest, e.g. <code>{[()]}</code> is balanced</li><li>They may not cross, e.g. <code>([)]</code> is not</li><li>A closing bracket with nothing open, or an opening bracket never closed, both fail</li><li>The empty string is balanced</li></ul>",
    starter: "function isValid(s) {\n  // TODO: report whether every bracket is closed by its own kind, in order\n}\n",
    hints: [
      "Counting brackets is not enough — '([)]' has the right counts and is still wrong.",
      "The most recently opened bracket is always the one that must close first. Which data structure has that property?",
      "Push openers onto a stack; on a closer, pop and check the pair. At the end the stack must be empty.",
    ],
    solution:
      "function isValid(s) {\n  const pairs = new Map([[')', '('], [']', '['], ['}', '{']]);\n  const stack = [];\n  for (const c of s) {\n    if (c === '(' || c === '[' || c === '{') {\n      stack.push(c);\n    } else if (pairs.has(c)) {\n      if (stack.pop() !== pairs.get(c)) return false;\n    }\n  }\n  return stack.length === 0;\n}\n",
    tests: [
      {
        name: "simple and nested balanced strings",
        body: "assert.equal(isValid('()'), true);\nassert.equal(isValid('()[]{}'), true);\nassert.equal(isValid('{[()]}'), true);",
      },
      {
        name: "mismatched kinds",
        body: "assert.equal(isValid('(]'), false);\nassert.equal(isValid('([)]'), false);",
      },
      {
        name: "unclosed opener",
        body: "assert.equal(isValid('('), false);\nassert.equal(isValid('([]'), false);",
      },
      {
        name: "closer with nothing open",
        body: "assert.equal(isValid(']'), false);\nassert.equal(isValid('(){}}{'), false);",
      },
      {
        name: "empty string is balanced",
        body: "assert.equal(isValid(''), true);",
      },
    ],
  },
{
    id: "ex-string-to-integer-atoi",
    chapter: "dsa-arrays-strings",
    level: "advanced",
    title: "String to Integer (atoi)",
    brief:
      "<p>Write <code>myAtoi(s)</code>, a hand-rolled string-to-number conversion following these rules exactly, in order.</p><ul><li>Skip any leading spaces</li><li>Accept one optional <code>+</code> or <code>-</code></li><li>Read digits until a non-digit or the end of the string; stop there and ignore the rest</li><li>If no digits were read, the answer is <code>0</code></li><li>Clamp the result to the signed 32-bit range: below <code>-2147483648</code> becomes <code>-2147483648</code>, above <code>2147483647</code> becomes <code>2147483647</code></li><li>Do not use <code>parseInt</code>, <code>Number</code> or <code>+s</code></li></ul>",
    starter: "function myAtoi(s) {\n  // TODO: parse a leading signed integer out of s and clamp it to 32 bits\n}\n",
    hints: [
      "Work through the four phases in order with a single index: whitespace, sign, digits, stop.",
      "Only the space character is skipped, and only before the sign — ' -42' parses but '- 42' does not.",
      "Build the value as digits * 10 + digit, and clamp the moment it passes the boundary rather than after the whole loop.",
    ],
    solution:
      "function myAtoi(s) {\n  const MAX = 2147483647;\n  const MIN = -2147483648;\n  let i = 0;\n  while (i < s.length && s[i] === ' ') i++;\n  let sign = 1;\n  if (s[i] === '+' || s[i] === '-') {\n    if (s[i] === '-') sign = -1;\n    i++;\n  }\n  let value = 0;\n  while (i < s.length && s[i] >= '0' && s[i] <= '9') {\n    value = value * 10 + (s.charCodeAt(i) - 48);\n    if (sign === 1 && value > MAX) return MAX;\n    if (sign === -1 && -value < MIN) return MIN;\n    i++;\n  }\n  return sign * value;\n}\n",
    tests: [
      {
        name: "plain and signed numbers",
        body: "assert.equal(myAtoi('42'), 42);\nassert.equal(myAtoi('+1'), 1);\nassert.equal(myAtoi('   -042'), -42);",
      },
      {
        name: "stops at the first non-digit",
        body: "assert.equal(myAtoi('1337c0d3'), 1337);\nassert.equal(myAtoi('4193 with words'), 4193);\nassert.equal(myAtoi('0-1'), 0);",
      },
      {
        name: "no leading digits means zero",
        body: "assert.equal(myAtoi('words and 987'), 0);\nassert.equal(myAtoi(''), 0);\nassert.equal(myAtoi('   '), 0);\nassert.equal(myAtoi('-'), 0);\nassert.equal(myAtoi('- 42'), 0);\nassert.equal(myAtoi('+-12'), 0);",
      },
      {
        name: "clamps to the 32-bit range",
        body: "assert.equal(myAtoi('-91283472332'), -2147483648);\nassert.equal(myAtoi('91283472332'), 2147483647);\nassert.equal(myAtoi('2147483648'), 2147483647);\nassert.equal(myAtoi('-2147483649'), -2147483648);",
      },
      {
        name: "the boundaries themselves survive",
        body: "assert.equal(myAtoi('2147483647'), 2147483647);\nassert.equal(myAtoi('-2147483648'), -2147483648);",
      },
    ],
  },
{
    id: "ex-integer-to-roman",
    chapter: "dsa-arrays-strings",
    level: "intermediate",
    title: "Integer to Roman",
    brief:
      "<p>Write <code>intToRoman(num)</code> converting a number from 1 to 3999 into its Roman numeral.</p><ul><li>The symbols are <code>I</code>=1, <code>V</code>=5, <code>X</code>=10, <code>L</code>=50, <code>C</code>=100, <code>D</code>=500, <code>M</code>=1000</li><li>Values are written largest first and added up</li><li>Six subtractive pairs replace four-in-a-row: <code>IV</code>=4, <code>IX</code>=9, <code>XL</code>=40, <code>XC</code>=90, <code>CD</code>=400, <code>CM</code>=900</li><li>So 1994 is <code>MCMXCIV</code>, not <code>MDCCCCLXXXXIIII</code></li></ul>",
    starter: "function intToRoman(num) {\n  // TODO: build the Roman numeral for num\n}\n",
    hints: [
      "Special-casing 4 and 9 at each digit position is fiddly. Can the subtractive pairs just be extra symbols in your table?",
      "List all thirteen values — 1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1 — in descending order with their symbols.",
      "Then it is a greedy loop: while num is at least the current value, append its symbol and subtract.",
    ],
    solution:
      "function intToRoman(num) {\n  const values = [1000, 900, 500, 400, 100, 90, 50, 40, 10, 9, 5, 4, 1];\n  const symbols = ['M', 'CM', 'D', 'CD', 'C', 'XC', 'L', 'XL', 'X', 'IX', 'V', 'IV', 'I'];\n  let out = '';\n  let n = num;\n  for (let i = 0; i < values.length; i++) {\n    while (n >= values[i]) {\n      out += symbols[i];\n      n -= values[i];\n    }\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "small numbers and repeats",
        body: "assert.equal(intToRoman(1), 'I');\nassert.equal(intToRoman(3), 'III');\nassert.equal(intToRoman(58), 'LVIII');",
      },
      {
        name: "subtractive pairs",
        body: "assert.equal(intToRoman(4), 'IV');\nassert.equal(intToRoman(9), 'IX');\nassert.equal(intToRoman(40), 'XL');\nassert.equal(intToRoman(90), 'XC');\nassert.equal(intToRoman(400), 'CD');\nassert.equal(intToRoman(900), 'CM');",
      },
      {
        name: "mixed value",
        body: "assert.equal(intToRoman(1994), 'MCMXCIV');\nassert.equal(intToRoman(3749), 'MMMDCCXLIX');",
      },
      {
        name: "upper bound",
        body: "assert.equal(intToRoman(3999), 'MMMCMXCIX');\nassert.equal(intToRoman(1000), 'M');",
      },
    ],
  },
{
    id: "ex-roman-to-integer",
    chapter: "dsa-arrays-strings",
    level: "beginner",
    title: "Roman to Integer",
    brief:
      "<p>Write <code>romanToInt(s)</code> converting a valid Roman numeral into a number.</p><ul><li>The symbols are <code>I</code>=1, <code>V</code>=5, <code>X</code>=10, <code>L</code>=50, <code>C</code>=100, <code>D</code>=500, <code>M</code>=1000</li><li>Symbols normally sit in descending order and are added together</li><li>When a smaller symbol sits directly before a larger one it is subtracted instead, so <code>IV</code> is 4 and <code>CM</code> is 900</li><li>You may assume the input is a well-formed numeral from 1 to 3999</li></ul>",
    starter: "function romanToInt(s) {\n  // TODO: total up the symbols in s\n}\n",
    hints: [
      "You do not need to detect the six subtractive pairs by name.",
      "Look at each symbol together with the one after it: if the next value is larger, this one is negative.",
      "Sum every symbol's value with that sign and the answer falls out in one pass.",
    ],
    solution:
      "function romanToInt(s) {\n  const value = new Map([\n    ['I', 1], ['V', 5], ['X', 10], ['L', 50],\n    ['C', 100], ['D', 500], ['M', 1000],\n  ]);\n  let total = 0;\n  for (let i = 0; i < s.length; i++) {\n    const here = value.get(s[i]);\n    const next = i + 1 < s.length ? value.get(s[i + 1]) : 0;\n    total += next > here ? -here : here;\n  }\n  return total;\n}\n",
    tests: [
      {
        name: "purely additive numerals",
        body: "assert.equal(romanToInt('III'), 3);\nassert.equal(romanToInt('LVIII'), 58);\nassert.equal(romanToInt('MMM'), 3000);",
      },
      {
        name: "subtractive pairs",
        body: "assert.equal(romanToInt('IV'), 4);\nassert.equal(romanToInt('IX'), 9);\nassert.equal(romanToInt('XL'), 40);\nassert.equal(romanToInt('CM'), 900);",
      },
      {
        name: "several subtractions in one numeral",
        body: "assert.equal(romanToInt('MCMXCIV'), 1994);\nassert.equal(romanToInt('MMMCMXCIX'), 3999);",
      },
      {
        name: "single symbol",
        body: "assert.equal(romanToInt('I'), 1);\nassert.equal(romanToInt('D'), 500);",
      },
    ],
  },
{
    id: "ex-zigzag-conversion",
    chapter: "dsa-arrays-strings",
    level: "advanced",
    title: "Zigzag Conversion",
    brief:
      "<p>Imagine writing a string downward across <code>numRows</code> rows, and when you hit the bottom row, writing diagonally back up to the top, then down again — a zigzag. Write <code>convert(s, numRows)</code> returning the characters read off row by row, top row first.</p><ul><li>With <code>numRows = 3</code>, <code>PAYPALISHIRING</code> lays out as rows <code>PAHN</code>, <code>APLSIIG</code>, <code>YIR</code> and returns <code>PAHNAPLSIIGYIR</code></li><li>When <code>numRows</code> is 1 there is no zigzag, so the string comes back unchanged</li><li>The same holds when <code>numRows</code> is at least the length of the string</li></ul>",
    starter:
      "function convert(s, numRows) {\n  // TODO: return s read back row by row after laying it out in a zigzag\n}\n",
    hints: [
      "You never have to build a 2D grid — you only need to know which row each character lands on.",
      "Keep one string buffer per row, walk the input once, and append each character to the current row.",
      "The row index moves +1 until it reaches the last row, then -1 until it reaches row 0. Flipping the step at both ends is the whole trick — and numRows === 1 must be handled before that, or the step never flips.",
    ],
    solution:
      "function convert(s, numRows) {\n  if (numRows <= 1 || numRows >= s.length) return s;\n  const rows = [];\n  for (let r = 0; r < numRows; r++) rows.push('');\n  let row = 0;\n  let step = 1;\n  for (const c of s) {\n    rows[row] += c;\n    if (row === 0) step = 1;\n    else if (row === numRows - 1) step = -1;\n    row += step;\n  }\n  return rows.join('');\n}\n",
    tests: [
      {
        name: "three rows",
        body: "assert.equal(convert('PAYPALISHIRING', 3), 'PAHNAPLSIIGYIR');",
      },
      {
        name: "four rows",
        body: "assert.equal(convert('PAYPALISHIRING', 4), 'PINALSIGYAHRPI');",
      },
      {
        name: "one row is the identity",
        body: "assert.equal(convert('AB', 1), 'AB');\nassert.equal(convert('PAYPALISHIRING', 1), 'PAYPALISHIRING');",
      },
      {
        name: "more rows than characters",
        body: "assert.equal(convert('AB', 5), 'AB');\nassert.equal(convert('A', 2), 'A');",
      },
      {
        name: "two rows alternate",
        body: "assert.equal(convert('ABCDE', 2), 'ACEBD');\nassert.equal(convert('', 3), '');",
      },
    ],
  },
{
    id: "ex-minimum-window-substring",
    chapter: "dsa-sliding-window",
    level: "advanced",
    title: "Minimum Window Substring",
    brief:
      "<p>Write <code>minWindow(s, t)</code> returning the shortest contiguous slice of <code>s</code> that contains every character of <code>t</code>, counting repeats.</p><ul><li>If <code>t</code> has two <code>a</code>s, the window must contain at least two <code>a</code>s</li><li>The characters may appear in any order, and extra characters in the window are fine</li><li>Return the empty string when no such window exists</li><li>The answer is unique in every case tested here</li></ul>",
    starter: "function minWindow(s, t) {\n  // TODO: return the shortest slice of s covering all of t\n}\n",
    hints: [
      "Grow a window to the right until it covers t, then shrink from the left as far as it still covers t. Record the best, then keep growing.",
      "Track counts per character, plus a single counter of how many distinct characters are still short of their required count — that turns 'does the window cover t?' into one comparison.",
      "Only adjust that counter when a character's count crosses its requirement exactly, otherwise repeats will throw it off.",
    ],
    solution:
      "function minWindow(s, t) {\n  if (t.length === 0 || s.length < t.length) return '';\n  const need = new Map();\n  for (const c of t) need.set(c, (need.get(c) || 0) + 1);\n  const have = new Map();\n  let missing = need.size;\n  let best = '';\n  let left = 0;\n  for (let right = 0; right < s.length; right++) {\n    const c = s[right];\n    if (need.has(c)) {\n      have.set(c, (have.get(c) || 0) + 1);\n      if (have.get(c) === need.get(c)) missing--;\n    }\n    while (missing === 0) {\n      if (best === '' || right - left + 1 < best.length) {\n        best = s.slice(left, right + 1);\n      }\n      const d = s[left];\n      if (need.has(d)) {\n        have.set(d, have.get(d) - 1);\n        if (have.get(d) < need.get(d)) missing++;\n      }\n      left++;\n    }\n  }\n  return best;\n}\n",
    tests: [
      {
        name: "classic case",
        body: "assert.equal(minWindow('ADOBECODEBANC', 'ABC'), 'BANC');",
      },
      {
        name: "single character",
        body: "assert.equal(minWindow('a', 'a'), 'a');\nassert.equal(minWindow('ab', 'b'), 'b');",
      },
      {
        name: "repeats in t must be covered",
        body: "assert.equal(minWindow('a', 'aa'), '');\nassert.equal(minWindow('aa', 'aa'), 'aa');\nassert.equal(minWindow('bbaac', 'aab'), 'baa');",
      },
      {
        name: "no window exists",
        body: "assert.equal(minWindow('abc', 'd'), '');\nassert.equal(minWindow('', 'a'), '');",
      },
      {
        name: "shortest window wins, not the first one",
        body: "assert.equal(minWindow('acbbaca', 'aba'), 'baca');",
      },
    ],
  },
{
    id: "ex-find-all-anagrams",
    chapter: "dsa-sliding-window",
    level: "intermediate",
    title: "Find All Anagrams in a String",
    brief:
      "<p>Write <code>findAnagrams(s, p)</code> returning, in ascending order, every start index in <code>s</code> where a substring of length <code>p.length</code> is an anagram of <code>p</code>.</p><ul><li>Matches may overlap</li><li>Return an empty array when there are none, or when <code>p</code> is longer than <code>s</code></li><li>Re-sorting every window is too slow — reuse the previous window's work</li></ul>",
    starter:
      "function findAnagrams(s, p) {\n  // TODO: return every start index of a window of s that is an anagram of p\n}\n",
    hints: [
      "A window is an anagram of p exactly when their character counts match, so track counts rather than the characters themselves.",
      "Slide a fixed-width window: add the character entering on the right, remove the one leaving on the left. That is O(1) per step.",
      "Comparing two whole count tables at every index is wasteful — keep a running 'how many characters are at the right count' tally and update it as counts change.",
    ],
    solution:
      "function findAnagrams(s, p) {\n  const out = [];\n  if (p.length === 0 || s.length < p.length) return out;\n  const need = new Map();\n  for (const c of p) need.set(c, (need.get(c) || 0) + 1);\n  const have = new Map();\n  let matched = 0;\n  const bump = (c, delta) => {\n    if (!need.has(c)) return;\n    const before = have.get(c) || 0;\n    const after = before + delta;\n    have.set(c, after);\n    if (before === need.get(c)) matched--;\n    if (after === need.get(c)) matched++;\n  };\n  for (let i = 0; i < s.length; i++) {\n    bump(s[i], 1);\n    if (i >= p.length) bump(s[i - p.length], -1);\n    if (i >= p.length - 1 && matched === need.size) out.push(i - p.length + 1);\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "finds separated matches",
        body: "assert.deepEqual(findAnagrams('cbaebabacd', 'abc'), [0, 6]);",
      },
      {
        name: "finds overlapping matches",
        body: "assert.deepEqual(findAnagrams('abab', 'ab'), [0, 1, 2]);",
      },
      {
        name: "no matches",
        body: "assert.deepEqual(findAnagrams('abcdef', 'gh'), []);\nassert.deepEqual(findAnagrams('aaaa', 'ab'), []);",
      },
      {
        name: "pattern longer than the string",
        body: "assert.deepEqual(findAnagrams('a', 'ab'), []);\nassert.deepEqual(findAnagrams('', 'a'), []);",
      },
      {
        name: "repeats inside the pattern",
        body: "assert.deepEqual(findAnagrams('baa', 'aab'), [0]);\nassert.deepEqual(findAnagrams('aaaa', 'aa'), [0, 1, 2]);",
      },
    ],
  },
{
    id: "ex-isomorphic-strings",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Isomorphic Strings",
    brief:
      "<p>Two strings are isomorphic when you can rename the characters of the first to get the second: each character always maps to the same character, and no two characters map to the same one. Write <code>isIsomorphic(s, t)</code>.</p><ul><li><code>egg</code> and <code>add</code> are isomorphic: e to a, g to d</li><li><code>foo</code> and <code>bar</code> are not: o would have to be both a and r</li><li><code>badc</code> and <code>baba</code> are not: two different letters would both map to a</li><li>Different lengths are never isomorphic; a character may map to itself</li></ul>",
    starter:
      "function isIsomorphic(s, t) {\n  // TODO: decide whether s can be renamed character-by-character into t\n}\n",
    hints: [
      "One map from s-character to t-character catches 'foo' vs 'bar' — but not 'badc' vs 'baba'.",
      "The mapping has to be one-to-one in both directions, so track the reverse as well.",
      "Walk both strings together; at each index, either both mappings are absent (record them) or both already agree.",
    ],
    solution:
      "function isIsomorphic(s, t) {\n  if (s.length !== t.length) return false;\n  const forward = new Map();\n  const backward = new Map();\n  for (let i = 0; i < s.length; i++) {\n    const a = s[i];\n    const b = t[i];\n    if (forward.has(a) && forward.get(a) !== b) return false;\n    if (backward.has(b) && backward.get(b) !== a) return false;\n    forward.set(a, b);\n    backward.set(b, a);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "a consistent renaming",
        body: "assert.equal(isIsomorphic('egg', 'add'), true);\nassert.equal(isIsomorphic('paper', 'title'), true);",
      },
      {
        name: "one character would need two images",
        body: "assert.equal(isIsomorphic('foo', 'bar'), false);",
      },
      {
        name: "the mapping must be one-to-one",
        body: "assert.equal(isIsomorphic('badc', 'baba'), false);\nassert.equal(isIsomorphic('ab', 'aa'), false);",
      },
      {
        name: "identical strings and empty strings",
        body: "assert.equal(isIsomorphic('abc', 'abc'), true);\nassert.equal(isIsomorphic('', ''), true);",
      },
      {
        name: "different lengths",
        body: "assert.equal(isIsomorphic('ab', 'abc'), false);",
      },
    ],
  },
{
    id: "ex-word-pattern",
    chapter: "dsa-hashing",
    level: "intermediate",
    title: "Word Pattern",
    brief:
      "<p>Given a pattern of single letters and a sentence of space-separated words, decide whether the sentence follows the pattern. Write <code>wordPattern(pattern, s)</code>.</p><ul><li>Each letter must stand for one word throughout, and each word for one letter</li><li><code>abba</code> with <code>dog cat cat dog</code> holds; with <code>dog cat cat fish</code> it does not</li><li><code>abba</code> with <code>dog dog dog dog</code> also fails — a and b cannot both mean dog</li><li>If the counts of letters and words differ, the answer is false</li></ul>",
    starter:
      "function wordPattern(pattern, s) {\n  // TODO: decide whether the words of s line up with the letters of pattern\n}\n",
    hints: [
      "Split the sentence into words first, and bail out immediately if there are not exactly as many words as letters.",
      "This is the same bijection check as isomorphic strings, only the right-hand side is words instead of characters.",
      "Keep both a letter-to-word map and a word-to-letter map, and require each pairing to agree with whatever is already recorded.",
    ],
    solution:
      "function wordPattern(pattern, s) {\n  const words = s.split(' ').filter((w) => w.length > 0);\n  if (words.length !== pattern.length) return false;\n  const toWord = new Map();\n  const toLetter = new Map();\n  for (let i = 0; i < pattern.length; i++) {\n    const letter = pattern[i];\n    const word = words[i];\n    if (toWord.has(letter) && toWord.get(letter) !== word) return false;\n    if (toLetter.has(word) && toLetter.get(word) !== letter) return false;\n    toWord.set(letter, word);\n    toLetter.set(word, letter);\n  }\n  return true;\n}\n",
    tests: [
      {
        name: "the sentence follows the pattern",
        body: "assert.equal(wordPattern('abba', 'dog cat cat dog'), true);\nassert.equal(wordPattern('aaaa', 'dog dog dog dog'), true);",
      },
      {
        name: "a letter changes its word",
        body: "assert.equal(wordPattern('abba', 'dog cat cat fish'), false);",
      },
      {
        name: "two letters share one word",
        body: "assert.equal(wordPattern('abba', 'dog dog dog dog'), false);\nassert.equal(wordPattern('ab', 'dog dog'), false);",
      },
      {
        name: "counts must match",
        body: "assert.equal(wordPattern('aaa', 'dog cat cat dog'), false);\nassert.equal(wordPattern('abc', 'dog cat'), false);",
      },
      {
        name: "single letter, single word",
        body: "assert.equal(wordPattern('a', 'dog'), true);\nassert.equal(wordPattern('a', 'dog cat'), false);",
      },
    ],
  },
{
    id: "ex-decode-string",
    chapter: "dsa-stacks-queues",
    level: "intermediate",
    title: "Decode String",
    brief:
      "<p>An encoded string uses the form <code>k[content]</code>, meaning the content repeats <code>k</code> times. Write <code>decodeString(s)</code> returning the expanded text.</p><ul><li><code>3[a]2[bc]</code> expands to <code>aaabcbc</code></li><li>Brackets nest, so <code>3[a2[c]]</code> expands to <code>accaccacc</code></li><li><code>k</code> may have more than one digit, and plain letters can appear outside brackets</li><li>The input is always well formed, and digits only ever appear as repeat counts</li></ul>",
    starter: "function decodeString(s) {\n  // TODO: expand every k[...] group, including nested ones\n}\n",
    hints: [
      "When you meet a '[' you have to put the text built so far aside and start a fresh one — and pick it back up at the matching ']'.",
      "Two stacks do it: one for the pending prefix strings, one for the pending repeat counts.",
      "On '[' push the current string and count and reset both; on ']' pop them and set current = poppedString + poppedCount copies of current. Remember multi-digit counts are read across several characters.",
    ],
    solution:
      "function decodeString(s) {\n  const strStack = [];\n  const numStack = [];\n  let current = '';\n  let count = 0;\n  for (const c of s) {\n    if (c >= '0' && c <= '9') {\n      count = count * 10 + (c.charCodeAt(0) - 48);\n    } else if (c === '[') {\n      strStack.push(current);\n      numStack.push(count);\n      current = '';\n      count = 0;\n    } else if (c === ']') {\n      const times = numStack.pop();\n      const prefix = strStack.pop();\n      let repeated = '';\n      for (let i = 0; i < times; i++) repeated += current;\n      current = prefix + repeated;\n    } else {\n      current += c;\n    }\n  }\n  return current;\n}\n",
    tests: [
      {
        name: "sequential groups",
        body: "assert.equal(decodeString('3[a]2[bc]'), 'aaabcbc');\nassert.equal(decodeString('2[abc]3[cd]ef'), 'abcabccdcdcdef');",
      },
      {
        name: "nested groups",
        body: "assert.equal(decodeString('3[a2[c]]'), 'accaccacc');\nassert.equal(decodeString('2[2[2[x]]]'), 'xxxxxxxx');",
      },
      {
        name: "multi-digit counts",
        body: "assert.equal(decodeString('10[a]'), 'aaaaaaaaaa');\nassert.equal(decodeString('12[ab]').length, 24);",
      },
      {
        name: "text outside brackets and a zero count",
        body: "assert.equal(decodeString('abc'), 'abc');\nassert.equal(decodeString(''), '');\nassert.equal(decodeString('x0[y]z'), 'xz');",
      },
      {
        name: "prefix before a nested group is preserved",
        body: "assert.equal(decodeString('2[ab3[c]d]'), 'abcccdabcccd');",
      },
    ],
  },
{
    id: "ex-encode-decode-strings",
    chapter: "dsa-design-problems",
    level: "advanced",
    title: "Encode and Decode Strings",
    brief:
      "<p>Design a pair of functions that send a list of strings over a channel that can only carry one string. Write <code>encode(strs)</code> returning a single string, and <code>decode(str)</code> returning the original list, so that <code>decode(encode(list))</code> always equals <code>list</code>.</p><ul><li>The strings may contain any characters at all — digits, <code>#</code>, brackets, spaces</li><li>Empty strings are valid list members, and the empty list must round-trip too</li><li>Any single separator character can appear inside the data, so a plain join will not do</li><li>Prefix each string with its length and a delimiter: <code>5#hello</code></li></ul>",
    starter:
      "function encode(strs) {\n  // TODO: pack the list into one string\n}\n\nfunction decode(str) {\n  // TODO: unpack the string back into the original list\n}\n",
    hints: [
      "Joining on a delimiter fails as soon as the data contains that delimiter. Escaping works but is fiddly — is there a way to know a string's extent before reading it?",
      "Write each entry as its length, then a '#', then the raw characters. The '#' is only ever read at a known position, so a '#' inside the data is harmless.",
      "To decode, find the next '#' from the current index, parse the digits before it as a length, slice exactly that many characters, then continue after them.",
    ],
    solution:
      "function encode(strs) {\n  let out = '';\n  for (const s of strs) out += s.length + '#' + s;\n  return out;\n}\n\nfunction decode(str) {\n  const out = [];\n  let i = 0;\n  while (i < str.length) {\n    let hash = i;\n    while (str[hash] !== '#') hash++;\n    let len = 0;\n    for (let k = i; k < hash; k++) len = len * 10 + (str.charCodeAt(k) - 48);\n    out.push(str.slice(hash + 1, hash + 1 + len));\n    i = hash + 1 + len;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "round-trips a plain list",
        body: "const list = ['hello', 'world', 'agent'];\nconst packed = encode(list);\nassert.type(packed, 'string');\nassert.deepEqual(decode(packed), list);",
      },
      {
        name: "round-trips data containing digits and hashes",
        body: "const list = ['12#34', '#', '###', '5#hello', '0#'];\nassert.deepEqual(decode(encode(list)), list);",
      },
      {
        name: "round-trips empty strings",
        body: "const list = ['', 'a', '', '', 'bc'];\nassert.deepEqual(decode(encode(list)), list);\nassert.deepEqual(decode(encode([''])), ['']);",
      },
      {
        name: "round-trips the empty list",
        body: "const packed = encode([]);\nassert.type(packed, 'string');\nassert.deepEqual(decode(packed), []);",
      },
      {
        name: "round-trips separators and whitespace",
        body: "const list = [' ', ',', 'a,b', 'x y z', '[]{}'];\nassert.deepEqual(decode(encode(list)), list);",
      },
    ],
  },
{
    id: "ex-tree-max-depth",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Maximum Depth of Binary Tree",
    brief:
      "<p>Given the <code>root</code> of a binary tree, return its depth: the number of nodes on the longest path from the root down to any leaf.</p><ul><li>An empty tree (<code>null</code> root) has depth <code>0</code></li><li>A tree with only a root has depth <code>1</code></li><li><code>build(arr)</code> turns a level-order array (with <code>null</code> for a missing child) into a tree</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxDepth(root) {\n  // TODO: return the number of nodes on the longest root-to-leaf path\n}\n",
    hints: [
      "The depth of a tree is defined in terms of the depth of its two subtrees. That is a recursive definition — write the recursive function.",
      "What is the depth of an empty tree? That is your base case, and it makes the leaf case fall out for free.",
      "A node contributes 1 plus whichever of its two subtrees is deeper.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxDepth(root) {\n  if (!root) return 0;\n  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));\n}\n",
    tests: [
      {
        name: "depth of a small branching tree",
        body: "assert.equal(maxDepth(build([3,9,20,null,null,15,7])), 3);",
      },
      {
        name: "a single node has depth 1",
        body: "assert.equal(maxDepth(build([1])), 1);",
      },
      {
        name: "an empty tree has depth 0",
        body: "assert.equal(maxDepth(null), 0);",
      },
      {
        name: "left-skewed chain",
        body: "assert.equal(maxDepth(build([1,2,null,3,null,4])), 4);",
      },
      {
        name: "measures the deeper side",
        body: "assert.equal(maxDepth(build([1,null,2,null,3])), 3);",
      },
    ],
  },
{
    id: "ex-tree-same-tree",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Same Tree",
    brief:
      "<p>Given two binary tree roots <code>p</code> and <code>q</code>, decide whether they are identical: the same shape <em>and</em> the same value at every corresponding position.</p><ul><li>Two empty trees are identical</li><li>Same values in a different shape are <b>not</b> identical</li><li>Return a boolean</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isSameTree(p, q) {\n  // TODO: compare the two trees position by position\n}\n",
    hints: [
      "Two trees match when their roots match and, recursively, their left subtrees match and their right subtrees match.",
      "Handle the null cases first: both null, then exactly one null. Only after that is it safe to read .val.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isSameTree(p, q) {\n  if (!p && !q) return true;\n  if (!p || !q) return false;\n  if (p.val !== q.val) return false;\n  return isSameTree(p.left, q.left) && isSameTree(p.right, q.right);\n}\n",
    tests: [
      {
        name: "identical trees",
        body: "assert.equal(isSameTree(build([1,2,3]), build([1,2,3])), true);",
      },
      {
        name: "same values, different shape",
        body: "assert.equal(isSameTree(build([1,2]), build([1,null,2])), false);",
      },
      {
        name: "same shape, different values",
        body: "assert.equal(isSameTree(build([1,2,1]), build([1,1,2])), false);",
      },
      {
        name: "two empty trees match",
        body: "assert.equal(isSameTree(null, null), true);",
      },
      {
        name: "an empty tree never matches a node",
        body: "assert.equal(isSameTree(build([1]), null), false);",
      },
    ],
  },
{
    id: "ex-tree-symmetric",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Symmetric Tree",
    brief:
      "<p>Decide whether a binary tree is a mirror image of itself — that is, whether the left subtree is the reflection of the right subtree.</p><ul><li>An empty tree is symmetric</li><li>Mirroring means the left child of one side lines up with the <b>right</b> child of the other</li><li>Missing children have to line up too, not just values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isSymmetric(root) {\n  // TODO: decide whether the two halves of the tree reflect each other\n}\n",
    hints: [
      "Comparing a tree with itself will not do it. You need a helper that compares two nodes as mirrors of one another.",
      "In that helper, pair a.left with b.right and a.right with b.left.",
      "The base cases are the same as an equality check: both null is fine, one null is not.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction mirrors(a, b) {\n  if (!a && !b) return true;\n  if (!a || !b) return false;\n  if (a.val !== b.val) return false;\n  return mirrors(a.left, b.right) && mirrors(a.right, b.left);\n}\n\nfunction isSymmetric(root) {\n  if (!root) return true;\n  return mirrors(root.left, root.right);\n}\n",
    tests: [
      {
        name: "a mirrored tree",
        body: "assert.equal(isSymmetric(build([1,2,2,3,4,4,3])), true);",
      },
      {
        name: "children on the same side are not a mirror",
        body: "assert.equal(isSymmetric(build([1,2,2,null,3,null,3])), false);",
      },
      {
        name: "gaps mirror correctly",
        body: "assert.equal(isSymmetric(build([1,2,2,null,3,3,null])), true);",
      },
      {
        name: "a deep value breaks the symmetry",
        body: "assert.equal(isSymmetric(build([1,2,2,3,4,4,5])), false);",
      },
      {
        name: "single node and empty tree",
        body: "assert.equal(isSymmetric(build([1])), true);\nassert.equal(isSymmetric(null), true);",
      },
    ],
  },
{
    id: "ex-tree-invert",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Invert Binary Tree",
    brief:
      "<p>Flip a binary tree horizontally: every node's left and right children swap places, all the way down. Return the root.</p><ul><li>Rearrange the <b>existing nodes</b> in place — the returned root must be the node you were given</li><li>An empty tree inverts to <code>null</code></li><li><code>toArray(root)</code> serialises a tree back to level-order form so you can eyeball the result</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction invertTree(root) {\n  // TODO: swap the two children of every node, top to bottom\n}\n",
    hints: [
      "Inverting a tree is: invert the left subtree, invert the right subtree, then swap them at this node.",
      "You cannot assign both children at once — stash one in a temporary before you overwrite it.",
      "Return the same root object you received; the caller relies on the tree being mutated in place.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction invertTree(root) {\n  if (!root) return null;\n  const left = invertTree(root.left);\n  root.left = invertTree(root.right);\n  root.right = left;\n  return root;\n}\n",
    tests: [
      {
        name: "inverts a full tree",
        body: "assert.deepEqual(toArray(invertTree(build([4,2,7,1,3,6,9]))), [4,7,2,9,6,3,1]);",
      },
      {
        name: "mutates the original nodes",
        body: "const root = build([2,1,3]);\nconst out = invertTree(root);\nassert.ok(out === root, 'should return the same root node');\nassert.deepEqual(toArray(root), [2,3,1]);",
      },
      {
        name: "a skewed tree flips sides",
        body: "assert.deepEqual(toArray(invertTree(build([1,2,null,3]))), [1,null,2,null,3]);",
      },
      {
        name: "a single node is unchanged",
        body: "assert.deepEqual(toArray(invertTree(build([1]))), [1]);",
      },
      {
        name: "an empty tree returns null",
        body: "assert.equal(invertTree(null), null);",
      },
    ],
  },
{
    id: "ex-tree-level-order",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Binary Tree Level Order Traversal",
    brief:
      "<p>Return the values of a binary tree grouped by depth: one inner array per level, each read left to right, starting at the root.</p><ul><li>For <code>[3,9,20,null,null,15,7]</code> the answer is <code>[[3],[9,20],[15,7]]</code></li><li>An empty tree gives <code>[]</code></li><li>Levels with missing children simply contain fewer values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction levelOrder(root) {\n  // TODO: collect the node values one level at a time\n}\n",
    hints: [
      "A breadth-first walk visits nodes in exactly this order — the only extra work is knowing where one level stops.",
      "Instead of one long queue, keep an array holding the current level and build the next level from it.",
      "For each node on the current level, push its non-null children into the next level's array.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction levelOrder(root) {\n  const out = [];\n  if (!root) return out;\n  let level = [root];\n  while (level.length) {\n    const vals = [];\n    const next = [];\n    for (let i = 0; i < level.length; i++) {\n      const node = level[i];\n      vals.push(node.val);\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    out.push(vals);\n    level = next;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "groups a small tree by level",
        body: "assert.deepEqual(levelOrder(build([3,9,20,null,null,15,7])), [[3],[9,20],[15,7]]);",
      },
      {
        name: "uneven levels",
        body: "assert.deepEqual(levelOrder(build([1,2,3,4,null,null,5])), [[1],[2,3],[4,5]]);",
      },
      {
        name: "a skewed tree gives one value per level",
        body: "assert.deepEqual(levelOrder(build([1,2,null,3])), [[1],[2],[3]]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(levelOrder(build([1])), [[1]]);",
      },
      {
        name: "an empty tree gives no levels",
        body: "assert.deepEqual(levelOrder(null), []);",
      },
    ],
  },
{
    id: "ex-tree-zigzag-level-order",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Binary Tree Zigzag Level Order Traversal",
    brief:
      "<p>Return the tree's values grouped by level, but alternate the reading direction: the root level runs left to right, the next runs right to left, and so on.</p><ul><li><code>[3,9,20,null,null,15,7]</code> becomes <code>[[3],[20,9],[15,7]]</code></li><li>An empty tree gives <code>[]</code></li><li>Only the output order alternates — the tree itself is untouched</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction zigzagLevelOrder(root) {\n  // TODO: collect each level, alternating the direction you emit it in\n}\n",
    hints: [
      "Start from an ordinary level-by-level traversal; the zigzag is only about how each finished level is written out.",
      "Keep a boolean that flips once per level, and reverse the collected values when it says right-to-left.",
      "Do not reverse the queue of children as well, or the following level comes out scrambled.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction zigzagLevelOrder(root) {\n  const out = [];\n  if (!root) return out;\n  let level = [root];\n  let leftToRight = true;\n  while (level.length) {\n    const vals = [];\n    const next = [];\n    for (let i = 0; i < level.length; i++) {\n      const node = level[i];\n      vals.push(node.val);\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    out.push(leftToRight ? vals : vals.reverse());\n    leftToRight = !leftToRight;\n    level = next;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "alternates on a three level tree",
        body: "assert.deepEqual(zigzagLevelOrder(build([3,9,20,null,null,15,7])), [[3],[20,9],[15,7]]);",
      },
      {
        name: "four levels keep alternating",
        body: "assert.deepEqual(zigzagLevelOrder(build([1,2,3,4,5,6,7,8])), [[1],[3,2],[4,5,6,7],[8]]);",
      },
      {
        name: "a full three level tree",
        body: "assert.deepEqual(zigzagLevelOrder(build([1,2,3,4,5,6,7])), [[1],[3,2],[4,5,6,7]]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(zigzagLevelOrder(build([1])), [[1]]);",
      },
      {
        name: "an empty tree",
        body: "assert.deepEqual(zigzagLevelOrder(null), []);",
      },
    ],
  },
{
    id: "ex-tree-right-side-view",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Binary Tree Right Side View",
    brief:
      "<p>Imagine standing to the right of a binary tree and looking at it. Return the values you can see, ordered from the top down.</p><ul><li>You see exactly one node per level: the rightmost one</li><li>That node is not always a right child — a deep left branch can be visible</li><li>An empty tree gives <code>[]</code></li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction rightSideView(root) {\n  // TODO: return the rightmost value on each level, top to bottom\n}\n",
    hints: [
      "Do not follow right children all the way down — if the right side stops early, the deeper left nodes become visible.",
      "Walk the tree level by level and keep the last value of each level.",
      "A depth-first alternative works too: visit right before left and record the first node you meet at each new depth.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction rightSideView(root) {\n  const out = [];\n  if (!root) return out;\n  let level = [root];\n  while (level.length) {\n    const next = [];\n    for (let i = 0; i < level.length; i++) {\n      const node = level[i];\n      if (node.left) next.push(node.left);\n      if (node.right) next.push(node.right);\n    }\n    out.push(level[level.length - 1].val);\n    level = next;\n  }\n  return out;\n}\n",
    tests: [
      {
        name: "sees the rightmost node of each level",
        body: "assert.deepEqual(rightSideView(build([1,2,3,null,5,null,4])), [1,3,4]);",
      },
      {
        name: "a deep left branch is visible",
        body: "assert.deepEqual(rightSideView(build([1,2,3,4])), [1,3,4]);",
      },
      {
        name: "a left-only chain is entirely visible",
        body: "assert.deepEqual(rightSideView(build([1,2,null,3])), [1,2,3]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(rightSideView(build([1])), [1]);",
      },
      {
        name: "an empty tree",
        body: "assert.deepEqual(rightSideView(null), []);",
      },
    ],
  },
{
    id: "ex-tree-diameter",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Diameter of Binary Tree",
    brief:
      "<p>Return the length of the longest path between any two nodes of a binary tree, measured in <b>edges</b>.</p><ul><li>The path does not have to pass through the root</li><li>A single node has diameter <code>0</code>; an empty tree also gives <code>0</code></li><li>Aim for a single traversal rather than recomputing depths for every node</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction diameterOfBinaryTree(root) {\n  // TODO: return the longest path between two nodes, counted in edges\n}\n",
    hints: [
      "Any path has a single highest node. For that node the path is (depth of left subtree) + (depth of right subtree) edges.",
      "So compute depths recursively, and while you are up there, record the best left + right sum you have seen.",
      "The function returns a depth to its caller but updates the running best as a side effect — two different quantities.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction diameterOfBinaryTree(root) {\n  let best = 0;\n  function depth(node) {\n    if (!node) return 0;\n    const l = depth(node.left);\n    const r = depth(node.right);\n    if (l + r > best) best = l + r;\n    return 1 + Math.max(l, r);\n  }\n  depth(root);\n  return best;\n}\n",
    tests: [
      {
        name: "path through the root",
        body: "assert.equal(diameterOfBinaryTree(build([1,2,3,4,5])), 3);",
      },
      {
        name: "longest path avoids the root",
        body: "const root = build([1,2,3,4,5,null,null,6,null,null,7,8,null,null,9]);\nassert.equal(diameterOfBinaryTree(root), 6);",
      },
      {
        name: "two nodes are one edge apart",
        body: "assert.equal(diameterOfBinaryTree(build([1,2])), 1);",
      },
      {
        name: "a single node has diameter 0",
        body: "assert.equal(diameterOfBinaryTree(build([1])), 0);",
      },
      {
        name: "an empty tree has diameter 0",
        body: "assert.equal(diameterOfBinaryTree(null), 0);",
      },
    ],
  },
{
    id: "ex-tree-balanced",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Balanced Binary Tree",
    brief:
      "<p>A binary tree is height-balanced when, for <b>every</b> node, the depths of its two subtrees differ by at most one. Return whether the given tree qualifies.</p><ul><li>Checking only the root is not enough — the imbalance can sit deep inside</li><li>An empty tree and a single node are balanced</li><li>The naive version recomputes depths repeatedly; one traversal is enough</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isBalanced(root) {\n  // TODO: report whether every node's subtrees differ in depth by at most one\n}\n",
    hints: [
      "Computing the depth of a node already visits its whole subtree — so the balance check can ride along with it.",
      "Let the recursive helper return the depth normally, but a sentinel such as -1 the moment it discovers an imbalance.",
      "Once either side returns the sentinel, stop and propagate it upward instead of doing more work.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isBalanced(root) {\n  function check(node) {\n    if (!node) return 0;\n    const l = check(node.left);\n    if (l === -1) return -1;\n    const r = check(node.right);\n    if (r === -1) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return check(root) !== -1;\n}\n",
    tests: [
      {
        name: "a balanced tree",
        body: "assert.equal(isBalanced(build([3,9,20,null,null,15,7])), true);",
      },
      {
        name: "a lopsided subtree",
        body: "assert.equal(isBalanced(build([1,2,2,3,3,null,null,4,4])), false);",
      },
      {
        name: "root looks fine but a deeper node does not",
        body: "const root = build([1,2,3,4,null,6,7,8,null,12,null,null,null]);\nassert.equal(isBalanced(root), false, 'node 2 has subtree depths 2 and 0');",
      },
      {
        name: "a chain is unbalanced",
        body: "assert.equal(isBalanced(build([1,2,null,3])), false);",
      },
      {
        name: "single node and empty tree are balanced",
        body: "assert.equal(isBalanced(build([1])), true);\nassert.equal(isBalanced(null), true);",
      },
    ],
  },
{
    id: "ex-tree-lowest-common-ancestor",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Lowest Common Ancestor of a Binary Tree",
    brief:
      "<p>Given the root of a binary tree and two nodes <code>p</code> and <code>q</code> from it, return their lowest common ancestor: the deepest node that has both of them somewhere below it.</p><ul><li>A node counts as an ancestor of itself, so the answer may be <code>p</code> or <code>q</code></li><li><code>p</code> and <code>q</code> are node objects, not values, and both are present in the tree</li><li>This is an ordinary binary tree — no ordering to exploit</li><li><code>find(root, val)</code> is provided so you can fetch a node by value</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  // TODO: return the deepest node that has both p and q below it\n}\n",
    hints: [
      "Ask each subtree a simpler question: 'do you contain p or q anywhere inside you?'",
      "If the left subtree reports a hit and the right subtree also reports a hit, the current node is the answer.",
      "If only one side reports a hit, pass that side's answer up unchanged. Hitting p or q itself is a hit — do not keep descending past it.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  if (!root || root === p || root === q) return root;\n  const left = lowestCommonAncestor(root.left, p, q);\n  const right = lowestCommonAncestor(root.right, p, q);\n  if (left && right) return root;\n  return left || right;\n}\n",
    tests: [
      {
        name: "ancestor on opposite sides of the root",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst got = lowestCommonAncestor(root, find(root, 5), find(root, 1));\nassert.equal(got.val, 3);",
      },
      {
        name: "a node is its own ancestor",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst got = lowestCommonAncestor(root, find(root, 5), find(root, 4));\nassert.equal(got.val, 5);",
      },
      {
        name: "two leaves deep in one subtree",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst got = lowestCommonAncestor(root, find(root, 7), find(root, 4));\nassert.equal(got.val, 2);",
      },
      {
        name: "returns the actual node object",
        body: "const root = build([3,5,1,6,2,0,8,null,null,7,4]);\nconst five = find(root, 5);\nconst got = lowestCommonAncestor(root, find(root, 6), find(root, 4));\nassert.ok(got === five, 'must return the node itself, not a copy');",
      },
      {
        name: "a single node tree",
        body: "const root = build([1]);\nassert.equal(lowestCommonAncestor(root, root, root).val, 1);",
      },
    ],
  },
{
    id: "ex-tree-validate-bst",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Validate Binary Search Tree",
    brief:
      "<p>Decide whether a binary tree is a valid binary search tree. In a valid BST, for every node, <em>every</em> value in its left subtree is strictly smaller than it and every value in its right subtree is strictly larger.</p><ul><li>The rule covers whole subtrees, not just the immediate children</li><li>Duplicate values make a tree invalid</li><li>An empty tree and a single node are valid</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isValidBST(root) {\n  // TODO: report whether the tree obeys the BST ordering everywhere\n}\n",
    hints: [
      "Comparing each node only with its own two children is not enough: a grandchild can break the ordering with respect to an ancestor.",
      "Carry a permitted range down the recursion. Going left tightens the upper bound to the current value; going right tightens the lower bound.",
      "An in-order traversal of a valid BST is strictly increasing — checking that also works.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction isValidBST(root) {\n  function ok(node, low, high) {\n    if (!node) return true;\n    if (low !== null && node.val <= low) return false;\n    if (high !== null && node.val >= high) return false;\n    return ok(node.left, low, node.val) && ok(node.right, node.val, high);\n  }\n  return ok(root, null, null);\n}\n",
    tests: [
      {
        name: "accepts a valid BST",
        body: "assert.equal(isValidBST(build([2,1,3])), true);\nassert.equal(isValidBST(build([8,4,12,2,6,10,14])), true);",
      },
      {
        name: "rejects a left-subtree node bigger than the root",
        body: "const root = build([10,5,15,3,12]);\nassert.equal(isValidBST(root), false, '12 sits in the left subtree but exceeds the root');",
      },
      {
        name: "rejects a right-subtree node smaller than the root",
        body: "assert.equal(isValidBST(build([5,1,4,null,null,3,6])), false);",
      },
      {
        name: "duplicates are not allowed",
        body: "assert.equal(isValidBST(build([2,2,2])), false);",
      },
      {
        name: "single node and empty tree are valid",
        body: "assert.equal(isValidBST(build([1])), true);\nassert.equal(isValidBST(null), true);",
      },
    ],
  },
{
    id: "ex-tree-kth-smallest-bst",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Kth Smallest Element in a BST",
    brief:
      "<p>Given the root of a binary search tree and a number <code>k</code>, return the <code>k</code>th smallest value in it (<code>k = 1</code> means the smallest).</p><ul><li><code>k</code> is always between 1 and the number of nodes</li><li>Do not collect and sort every value — the tree already knows the order</li><li>You can stop the moment you have counted <code>k</code> values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction kthSmallest(root, k) {\n  // TODO: return the kth smallest value in the BST\n}\n",
    hints: [
      "Which traversal order visits a BST's values from smallest to largest?",
      "In-order traversal: left subtree, then the node, then the right subtree. Count the nodes as you emit them.",
      "An explicit stack lets you stop as soon as the counter reaches k, instead of walking the whole tree.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction kthSmallest(root, k) {\n  const stack = [];\n  let node = root;\n  let count = 0;\n  while (node || stack.length) {\n    while (node) {\n      stack.push(node);\n      node = node.left;\n    }\n    node = stack.pop();\n    count++;\n    if (count === k) return node.val;\n    node = node.right;\n  }\n  return -1;\n}\n",
    tests: [
      {
        name: "the smallest value",
        body: "assert.equal(kthSmallest(build([5,3,6,2,4,null,null,1]), 1), 1);",
      },
      {
        name: "a value in the middle",
        body: "assert.equal(kthSmallest(build([5,3,6,2,4,null,null,1]), 3), 3);",
      },
      {
        name: "the largest value",
        body: "assert.equal(kthSmallest(build([5,3,6,2,4,null,null,1]), 6), 6);",
      },
      {
        name: "smallest sits two levels down",
        body: "assert.equal(kthSmallest(build([3,1,4,null,2]), 2), 2);",
      },
      {
        name: "a single node",
        body: "assert.equal(kthSmallest(build([42]), 1), 42);",
      },
    ],
  },
{
    id: "ex-tree-lca-bst",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Lowest Common Ancestor of a BST",
    brief:
      "<p>Same question as before, but now the tree is a <b>binary search tree</b>: return the lowest common ancestor of nodes <code>p</code> and <code>q</code>.</p><ul><li>Use the ordering — you should never have to search both subtrees</li><li>A node counts as an ancestor of itself</li><li>All values are distinct and both nodes are in the tree</li><li><code>find(root, val)</code> is provided so you can fetch a node by value</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  // TODO: use the BST ordering to walk straight to the split point\n}\n",
    hints: [
      "If both values are smaller than the current node, the answer cannot be here or to the right.",
      "The answer is the first node where p and q stop agreeing about which way to go — including the case where the node is p or q itself.",
      "That means a single loop from the root downwards, no recursion into two subtrees.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction find(root, val) {\n  if (!root) return null;\n  if (root.val === val) return root;\n  return find(root.left, val) || find(root.right, val);\n}\n\nfunction lowestCommonAncestor(root, p, q) {\n  let node = root;\n  while (node) {\n    if (p.val < node.val && q.val < node.val) node = node.left;\n    else if (p.val > node.val && q.val > node.val) node = node.right;\n    else return node;\n  }\n  return null;\n}\n",
    tests: [
      {
        name: "values on opposite sides split at the root",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nassert.equal(lowestCommonAncestor(root, find(root, 2), find(root, 8)).val, 6);",
      },
      {
        name: "an ancestor of itself",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nassert.equal(lowestCommonAncestor(root, find(root, 2), find(root, 4)).val, 2);",
      },
      {
        name: "deep inside the left subtree",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nconst got = lowestCommonAncestor(root, find(root, 3), find(root, 5));\nassert.ok(got === find(root, 4), 'must return the node object');\nassert.equal(got.val, 4);",
      },
      {
        name: "both nodes in the right subtree",
        body: "const root = build([6,2,8,0,4,7,9,null,null,3,5]);\nassert.equal(lowestCommonAncestor(root, find(root, 7), find(root, 9)).val, 8);",
      },
      {
        name: "a single node tree",
        body: "const root = build([1]);\nassert.equal(lowestCommonAncestor(root, root, root).val, 1);",
      },
    ],
  },
{
    id: "ex-tree-sorted-array-to-bst",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Convert Sorted Array to BST",
    brief:
      "<p>Given an array sorted in increasing order, build a <b>height-balanced</b> binary search tree from it and return the root.</p><ul><li>Height-balanced means every node's two subtrees differ in depth by at most one</li><li>Several shapes are acceptable; any balanced BST holding those values counts</li><li>An empty array produces <code>null</code></li><li><code>inorder(root)</code> and <code>isHeightBalanced(root)</code> are provided for checking your work</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction isHeightBalanced(root) {\n  function h(node) {\n    if (!node) return 0;\n    const l = h(node.left);\n    if (l < 0) return -1;\n    const r = h(node.right);\n    if (r < 0) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return h(root) >= 0;\n}\n\nfunction sortedArrayToBST(nums) {\n  // TODO: build a height-balanced BST from the sorted values\n}\n",
    hints: [
      "Which element of a sorted array belongs at the root if you want both sides to come out the same size?",
      "Take the middle element, then build the left subtree from the slice before it and the right subtree from the slice after it.",
      "Recurse on index ranges rather than slicing arrays, and stop when the range is empty.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction inorder(root) {\n  const out = [];\n  function walk(node) {\n    if (!node) return;\n    walk(node.left);\n    out.push(node.val);\n    walk(node.right);\n  }\n  walk(root);\n  return out;\n}\nfunction isHeightBalanced(root) {\n  function h(node) {\n    if (!node) return 0;\n    const l = h(node.left);\n    if (l < 0) return -1;\n    const r = h(node.right);\n    if (r < 0) return -1;\n    if (Math.abs(l - r) > 1) return -1;\n    return 1 + Math.max(l, r);\n  }\n  return h(root) >= 0;\n}\n\nfunction sortedArrayToBST(nums) {\n  function go(lo, hi) {\n    if (lo > hi) return null;\n    const mid = Math.floor((lo + hi) / 2);\n    const node = new TreeNode(nums[mid]);\n    node.left = go(lo, mid - 1);\n    node.right = go(mid + 1, hi);\n    return node;\n  }\n  return go(0, nums.length - 1);\n}\n",
    tests: [
      {
        name: "holds the values in order and stays balanced",
        body: "const nums = [-10,-3,0,5,9];\nconst root = sortedArrayToBST(nums);\nassert.deepEqual(inorder(root), nums);\nassert.ok(isHeightBalanced(root), 'the tree must be height-balanced');",
      },
      {
        name: "an even number of values",
        body: "const nums = [1,2,3,4,5,6];\nconst root = sortedArrayToBST(nums);\nassert.deepEqual(inorder(root), nums);\nassert.ok(isHeightBalanced(root));",
      },
      {
        name: "a longer array is not a chain",
        body: "const nums = [1,2,3,4,5,6,7,8,9,10,11,12,13,14,15];\nconst root = sortedArrayToBST(nums);\nassert.deepEqual(inorder(root), nums);\nassert.ok(isHeightBalanced(root));",
      },
      {
        name: "a single value",
        body: "assert.deepEqual(toArray(sortedArrayToBST([7])), [7]);",
      },
      {
        name: "an empty array gives null",
        body: "assert.equal(sortedArrayToBST([]), null);",
      },
    ],
  },
{
    id: "ex-tree-build-from-preorder-inorder",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Construct Binary Tree from Preorder and Inorder Traversal",
    brief:
      "<p>You are given the preorder traversal and the inorder traversal of the same binary tree, with all values distinct. Rebuild the tree and return its root.</p><ul><li>Preorder visits node, left, right; inorder visits left, node, right</li><li>Together the two orders pin down exactly one tree</li><li>Two empty arrays produce <code>null</code></li><li>Use <code>toArray(root)</code> to inspect what you built</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction buildTree(preorder, inorder) {\n  // TODO: rebuild the tree from the two traversals\n}\n",
    hints: [
      "The first value of the preorder array is always the root of the piece you are currently building.",
      "Locate that value in the inorder array: everything to its left is the left subtree, everything to its right is the right subtree.",
      "Scanning the inorder array each time is O(n^2); precompute a Map from value to index. Consume preorder with one shared cursor so the left subtree is built before the right.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction buildTree(preorder, inorder) {\n  const pos = new Map();\n  for (let i = 0; i < inorder.length; i++) pos.set(inorder[i], i);\n  let cursor = 0;\n  function go(lo, hi) {\n    if (lo > hi) return null;\n    const val = preorder[cursor++];\n    const node = new TreeNode(val);\n    const mid = pos.get(val);\n    node.left = go(lo, mid - 1);\n    node.right = go(mid + 1, hi);\n    return node;\n  }\n  return go(0, inorder.length - 1);\n}\n",
    tests: [
      {
        name: "rebuilds a branching tree",
        body: "assert.deepEqual(toArray(buildTree([3,9,20,15,7], [9,3,15,20,7])), [3,9,20,null,null,15,7]);",
      },
      {
        name: "a left-leaning chain",
        body: "assert.deepEqual(toArray(buildTree([1,2,3], [3,2,1])), [1,2,null,3]);",
      },
      {
        name: "a right-leaning chain",
        body: "assert.deepEqual(toArray(buildTree([1,2,3], [1,2,3])), [1,null,2,null,3]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(toArray(buildTree([1], [1])), [1]);",
      },
      {
        name: "empty traversals give null",
        body: "assert.equal(buildTree([], []), null);",
      },
    ],
  },
{
    id: "ex-tree-serialize-deserialize",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Serialize and Deserialize Binary Tree",
    brief:
      "<p>Write two functions: <code>serialize(root)</code> turns a binary tree into a string, and <code>deserialize(data)</code> turns that string back into an identical tree.</p><ul><li>Only the round trip matters — the exact format is yours to choose</li><li><code>serialize</code> must return a string; <code>deserialize</code> must return a tree of <code>TreeNode</code>s</li><li>An empty tree has to survive the trip too</li><li>Values may be negative, so a format that can tell <code>-3</code> from a missing child is required</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction serialize(root) {\n  // TODO: turn the tree into a string\n}\n\nfunction deserialize(data) {\n  // TODO: rebuild the tree that serialize() encoded\n}\n",
    hints: [
      "Shape is the hard part: values alone are ambiguous. Record the missing children explicitly with a placeholder token.",
      "A preorder walk that emits a marker for every null makes rebuilding trivial — one cursor over the tokens, consuming left then right.",
      "Join with a separator and split it back out; do not encode numbers in a way that loses the minus sign.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction serialize(root) {\n  const parts = [];\n  function walk(node) {\n    if (!node) {\n      parts.push('#');\n      return;\n    }\n    parts.push(String(node.val));\n    walk(node.left);\n    walk(node.right);\n  }\n  walk(root);\n  return parts.join(',');\n}\n\nfunction deserialize(data) {\n  const parts = data.split(',');\n  let cursor = 0;\n  function walk() {\n    const token = parts[cursor++];\n    if (token === '#') return null;\n    const node = new TreeNode(Number(token));\n    node.left = walk();\n    node.right = walk();\n    return node;\n  }\n  return walk();\n}\n",
    tests: [
      {
        name: "round trips a branching tree",
        body: "const arr = [1,2,3,null,null,4,5];\nassert.deepEqual(toArray(deserialize(serialize(build(arr)))), arr);",
      },
      {
        name: "round trips an empty tree",
        body: "assert.equal(deserialize(serialize(null)), null);\nassert.deepEqual(toArray(deserialize(serialize(null))), []);",
      },
      {
        name: "round trips a skewed tree",
        body: "const arr = [1,2,null,3,null,4];\nassert.deepEqual(toArray(deserialize(serialize(build(arr)))), arr);",
      },
      {
        name: "round trips negative values and a single node",
        body: "assert.deepEqual(toArray(deserialize(serialize(build([-1,-2,-3])))), [-1,-2,-3]);\nassert.deepEqual(toArray(deserialize(serialize(build([0])))), [0]);",
      },
      {
        name: "serialize produces a string",
        body: "assert.type(serialize(build([1,2,3])), 'string');",
      },
    ],
  },
{
    id: "ex-tree-path-sum",
    chapter: "dsa-trees",
    level: "beginner",
    title: "Path Sum",
    brief:
      "<p>Given a binary tree and a number <code>targetSum</code>, return <code>true</code> if some root-to-leaf path has values adding up to exactly <code>targetSum</code>.</p><ul><li>A leaf is a node with no children — a path must reach one, it cannot stop halfway</li><li>An empty tree has no paths, so the answer is always <code>false</code></li><li>Values may be negative</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction hasPathSum(root, targetSum) {\n  // TODO: report whether some root-to-leaf path adds up to targetSum\n}\n",
    hints: [
      "Instead of accumulating a running total, subtract the current node's value and ask the children about the smaller target.",
      "The success test belongs at a leaf: no children left and the remaining target equals this node's value.",
      "Careful with the empty tree — returning true when the remaining target hits 0 at a null child is the classic bug.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction hasPathSum(root, targetSum) {\n  if (!root) return false;\n  if (!root.left && !root.right) return targetSum === root.val;\n  return (\n    hasPathSum(root.left, targetSum - root.val) ||\n    hasPathSum(root.right, targetSum - root.val)\n  );\n}\n",
    tests: [
      {
        name: "finds a matching path",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,null,1]);\nassert.equal(hasPathSum(root, 22), true);",
      },
      {
        name: "finds a shorter matching path",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,null,1]);\nassert.equal(hasPathSum(root, 26), true);",
      },
      {
        name: "a partial path does not count",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,null,1]);\nassert.equal(hasPathSum(root, 5), false, 'the root alone is not a root-to-leaf path');\nassert.equal(hasPathSum(build([1,2]), 1), false);",
      },
      {
        name: "a single node",
        body: "assert.equal(hasPathSum(build([7]), 7), true);\nassert.equal(hasPathSum(build([7]), 0), false);",
      },
      {
        name: "an empty tree has no path",
        body: "assert.equal(hasPathSum(null, 0), false);",
      },
    ],
  },
{
    id: "ex-tree-path-sum-ii",
    chapter: "dsa-tree-problems",
    level: "intermediate",
    title: "Path Sum II",
    brief:
      "<p>Return <b>every</b> root-to-leaf path whose values add up to <code>targetSum</code>, each path given as an array of values from the root downwards.</p><ul><li>Paths must start at the root and end at a leaf</li><li>Return <code>[]</code> when nothing matches, and for an empty tree</li><li>Report the paths in left-to-right depth-first order</li><li>Values may be negative</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction pathSum(root, targetSum) {\n  // TODO: collect every root-to-leaf path that adds up to targetSum\n}\n",
    hints: [
      "Carry a single array holding the values on the path you are currently exploring, and push the node's value on the way down.",
      "Pop that value again as the call returns — otherwise the path leaks into sibling branches.",
      "When you record a hit, store a copy of the path array; storing the array itself means later mutations rewrite your answer.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction pathSum(root, targetSum) {\n  const out = [];\n  const path = [];\n  function walk(node, remaining) {\n    if (!node) return;\n    path.push(node.val);\n    if (!node.left && !node.right && remaining === node.val) {\n      out.push(path.slice());\n    } else {\n      walk(node.left, remaining - node.val);\n      walk(node.right, remaining - node.val);\n    }\n    path.pop();\n  }\n  walk(root, targetSum);\n  return out;\n}\n",
    tests: [
      {
        name: "finds both matching paths",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,5,1]);\nassert.deepEqual(pathSum(root, 22), [[5,4,11,2],[5,8,4,5]]);",
      },
      {
        name: "no matching path",
        body: "const root = build([5,4,8,11,null,13,4,7,2,null,null,5,1]);\nassert.deepEqual(pathSum(root, 100), []);",
      },
      {
        name: "negative values",
        body: "assert.deepEqual(pathSum(build([-2,null,-3]), -5), [[-2,-3]]);",
      },
      {
        name: "a single node",
        body: "assert.deepEqual(pathSum(build([1]), 1), [[1]]);\nassert.deepEqual(pathSum(build([1]), 2), []);",
      },
      {
        name: "an empty tree",
        body: "assert.deepEqual(pathSum(null, 0), []);",
      },
    ],
  },
{
    id: "ex-tree-max-path-sum",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Binary Tree Maximum Path Sum",
    brief:
      "<p>A path here is any sequence of connected nodes — each consecutive pair joined by an edge — visiting no node twice. It does not have to touch the root. Return the largest possible sum of the values along such a path.</p><ul><li>The tree has at least one node, and a single node is a valid path</li><li>Values may be negative, so the answer can be negative</li><li>A path bends at most once: it can come up one subtree and go down the other</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxPathSum(root) {\n  // TODO: return the largest sum along any path in the tree\n}\n",
    hints: [
      "Every path has a single topmost node. At that node the path may use both subtrees — but what it hands back to its own parent may use only one.",
      "So the recursive helper returns 'best sum of a downward path starting here', while a separate running maximum records node.val + left + right.",
      "A subtree that contributes a negative amount should simply be skipped: clamp each child's contribution at 0. Do not clamp the running maximum itself, or an all-negative tree gives the wrong answer.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\n\nfunction maxPathSum(root) {\n  let best = -Infinity;\n  function gain(node) {\n    if (!node) return 0;\n    const left = Math.max(gain(node.left), 0);\n    const right = Math.max(gain(node.right), 0);\n    if (node.val + left + right > best) best = node.val + left + right;\n    return node.val + Math.max(left, right);\n  }\n  gain(root);\n  return best;\n}\n",
    tests: [
      {
        name: "a small tree bends at the root",
        body: "assert.equal(maxPathSum(build([1,2,3])), 6);",
      },
      {
        name: "skips a negative root",
        body: "assert.equal(maxPathSum(build([-10,9,20,null,null,15,7])), 42);",
      },
      {
        name: "best path sits inside a subtree",
        body: "const root = build([10,2,10,20,1,null,-25,null,null,null,null,3,4]);\nassert.equal(maxPathSum(root), 42);",
      },
      {
        name: "an all-negative tree picks the least bad node",
        body: "assert.equal(maxPathSum(build([-2,-1,-3])), -1);",
      },
      {
        name: "a single negative node",
        body: "assert.equal(maxPathSum(build([-3])), -3);",
      },
    ],
  },
{
    id: "ex-tree-next-right-pointers",
    chapter: "dsa-tree-problems",
    level: "advanced",
    title: "Populating Next Right Pointers in Each Node",
    brief:
      "<p>Every node in this <b>perfect</b> binary tree (all leaves at the same depth, every other node has two children) carries an extra <code>next</code> pointer, initially <code>null</code>. Set each <code>next</code> to the node immediately to its right on the same level, and return the root.</p><ul><li>The last node of every level keeps <code>next = null</code></li><li>Annotate the given tree in place and return the same root</li><li>The <code>next</code> pointers you have already set can be used to walk a level — that is how you avoid a queue</li><li><code>nextChain(node)</code> follows <code>next</code> from a node and collects the values</li></ul>",
    starter:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n    this.next = null;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction nextChain(node) {\n  const out = [];\n  for (let n = node; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction connect(root) {\n  // TODO: link every node to its right-hand neighbour on the same level\n}\n",
    hints: [
      "A level-order traversal with a queue solves it, but the tree is perfect — there is a way to do it with no extra storage.",
      "Once a level is fully linked, you can walk that level using next, wiring up the level below as you go.",
      "From a node on the linked level: node.left.next is node.right, and node.right.next is node.next.left when node.next exists.",
    ],
    solution:
      "class TreeNode {\n  constructor(val, left, right) {\n    this.val = val === undefined ? 0 : val;\n    this.left = left === undefined ? null : left;\n    this.right = right === undefined ? null : right;\n    this.next = null;\n  }\n}\nfunction build(arr) {\n  if (!arr || arr.length === 0 || arr[0] === null) return null;\n  const root = new TreeNode(arr[0]);\n  const queue = [root];\n  let i = 1;\n  while (queue.length && i < arr.length) {\n    const node = queue.shift();\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.left = new TreeNode(v);\n        queue.push(node.left);\n      }\n    }\n    if (i < arr.length) {\n      const v = arr[i++];\n      if (v !== null) {\n        node.right = new TreeNode(v);\n        queue.push(node.right);\n      }\n    }\n  }\n  return root;\n}\nfunction toArray(root) {\n  if (!root) return [];\n  const out = [];\n  const queue = [root];\n  while (queue.length) {\n    const node = queue.shift();\n    if (node === null) {\n      out.push(null);\n    } else {\n      out.push(node.val);\n      queue.push(node.left);\n      queue.push(node.right);\n    }\n  }\n  while (out.length && out[out.length - 1] === null) out.pop();\n  return out;\n}\nfunction nextChain(node) {\n  const out = [];\n  for (let n = node; n; n = n.next) out.push(n.val);\n  return out;\n}\n\nfunction connect(root) {\n  let leftmost = root;\n  while (leftmost && leftmost.left) {\n    let node = leftmost;\n    while (node) {\n      node.left.next = node.right;\n      if (node.next) node.right.next = node.next.left;\n      node = node.next;\n    }\n    leftmost = leftmost.left;\n  }\n  return root;\n}\n",
    tests: [
      {
        name: "links every level of a perfect tree",
        body: "const root = connect(build([1,2,3,4,5,6,7]));\nassert.deepEqual(nextChain(root), [1]);\nassert.deepEqual(nextChain(root.left), [2,3]);\nassert.deepEqual(nextChain(root.left.left), [4,5,6,7]);",
      },
      {
        name: "links across different parents",
        body: "const root = connect(build([1,2,3,4,5,6,7]));\nassert.ok(root.left.right.next === root.right.left, '5 must point at 6');\nassert.equal(root.right.right.next, null, 'the last node of a level ends the chain');",
      },
      {
        name: "annotates the tree in place",
        body: "const root = build([1,2,3]);\nconst out = connect(root);\nassert.ok(out === root, 'should return the same root node');\nassert.ok(root.left.next === root.right);\nassert.equal(root.right.next, null);",
      },
      {
        name: "a single node",
        body: "const root = connect(build([1]));\nassert.deepEqual(nextChain(root), [1]);\nassert.equal(root.next, null);",
      },
      {
        name: "an empty tree returns null",
        body: "assert.equal(connect(null), null);",
      },
    ],
  },
];
