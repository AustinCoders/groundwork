import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "hash-pair-in-one-pass",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "recognise",
      pattern: "hash-map",
      section: "the-pattern-trade-space-for-time",
      placement: true,
      kind: "single",
      prompt:
        "<p>An unsorted array and a target are given. You must return the positions of two different elements that add up to the target. The first idea checks every pair, which is O(n²). Which approach brings the time down to O(n)?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the array, then binary search for <code>target - x</code> for every <code>x</code>.",
          why: "Sorting costs O(n log n) already, so this cannot reach O(n). It also moves the elements, so the original positions would have to be tracked separately.",
        },
        {
          id: "b",
          text: "Walk the array once, looking up <code>target - x</code> in a <code>Map</code> of the values seen so far, then storing <code>x</code> with its index.",
          why: 'Asking "have I seen the number I need?" costs O(1) on average with a hash map, instead of O(n) with a scan. One pass of n cheap lookups is O(n) time, paid for with O(n) space for the map.',
        },
        {
          id: "c",
          text: "Keep the nested loops but <code>break</code> as soon as a pair matches.",
          why: "An early exit helps when a match comes early, but a missing pair, or one at the very end, still forces every pair to be checked. The worst case stays O(n²).",
        },
        {
          id: "d",
          text: "Keep a running total and stop as soon as it equals the target.",
          why: "A running total adds up a prefix of the array, so it can only find a block that starts at index 0. The two numbers can be anywhere, and they need not be neighbours.",
        },
      ],
      answer: "b",
    },
    {
      id: "hash-count-each-word",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "recognise",
      pattern: "hash-map",
      section: "frequency-counting-the-other-80-of-hashing-questions",
      placement: true,
      kind: "single",
      prompt:
        "<p>A text holds n words. You must report how many times each distinct word occurs, and you want O(n) time overall. Which structure do you reach for?</p>",
      choices: [
        {
          id: "a",
          text: "An array of the words seen so far, searching it with <code>indexOf</code> for every new word.",
          why: "Each <code>indexOf</code> is a scan of the words seen so far, and it runs n times. That is the hidden O(n) inside a loop, which makes the whole thing O(n²).",
        },
        {
          id: "b",
          text: "A <code>Set</code> of the words.",
          why: "A <code>Set</code> remembers whether a word was seen, but it holds no number next to it. It can list the distinct words, yet it cannot say how often each one occurred.",
        },
        {
          id: "c",
          text: "A <code>Map</code> from each word to its count, adding 1 for every occurrence.",
          why: "Each word is one O(1) average lookup and one O(1) average update, so n words cost O(n). This count-as-you-go shape is the frequency counter, and it is behind most hashing questions.",
        },
        {
          id: "d",
          text: "A sorted array of the words, found again with binary search.",
          why: "Keeping the array sorted means inserting in the middle, and each insert can move many elements. Even a sort followed by a scan costs O(n log n), which is slower than counting in one pass.",
        },
      ],
      answer: "c",
    },
    {
      id: "hash-why-constant",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "complexity",
      pattern: "hash-map",
      section: "what-a-hash-map-actually-does",
      kind: "single",
      prompt: "<p>Why is <code>map.get(key)</code> O(1) on average, and what is the caveat?</p>",
      choices: [
        {
          id: "a",
          text: "The map keeps its keys sorted, so it can halve the search range on every step.",
          why: "Halving a sorted range is binary search, which is O(log n). A hash map does not keep its keys in sorted order, and it never searches at all.",
        },
        {
          id: "b",
          text: "Every key is stored at its own array index, so a lookup is a plain index read with no worst case.",
          why: "Different keys can hash to the same bucket, and the map has to handle that. It is a clever use of an array, but the O(1) is an average, not a guarantee for every key.",
        },
        {
          id: "c",
          text: "The engine caches recent lookups, so repeating a lookup is free.",
          why: "Even the first lookup of a key is O(1) on average, with no caching involved. The speed comes from how the key is turned into a position.",
        },
        {
          id: "d",
          text: "The key is hashed straight to a bucket, so nothing is searched. That is an average: many keys in one bucket make a lookup slower.",
          why: 'The key is turned into a number that picks a bucket, so the map jumps there instead of scanning. If many keys land in the same bucket, a lookup has more to walk through, so "average case, not worst case" is the honest caveat.',
        },
      ],
      answer: "d",
    },
    {
      id: "hash-two-sum-cost",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "complexity",
      pattern: "hash-map",
      section: "the-pattern-trade-space-for-time",
      kind: "single",
      prompt:
        "<p>What are the time and the extra space of <code>twoSumFast</code> on an array of n numbers?</p><pre><code>function twoSumFast(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i &lt; nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n) time and O(n) extra space",
          why: "There is one loop, and <code>has</code>, <code>get</code> and <code>set</code> are O(1) on average, so the time is O(n). In the worst case nothing matches, and the map ends up holding up to n numbers, so the space is O(n). This is the trade of space for time.",
        },
        {
          id: "b",
          text: "O(n²) time and O(1) extra space",
          why: "That describes the brute-force version with two nested loops, which keeps nothing but its indexes. The map is what removes the inner loop.",
        },
        {
          id: "c",
          text: "O(n) time and O(1) extra space",
          why: "The time is right, but the map grows by one entry for every number it walks past. Its size is proportional to n, so the space cannot be constant.",
        },
        {
          id: "d",
          text: "O(n log n) time and O(n) extra space",
          why: "A log n factor would come from sorting or from a balanced tree. The hash map's lookups do not search a sorted structure, and nothing here sorts.",
        },
      ],
      answer: "a",
    },
    {
      id: "hash-trace-two-sum",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "trace",
      pattern: "hash-map",
      section: "the-pattern-trade-space-for-time",
      kind: "single",
      prompt:
        "<p>What does <code>twoSumFast([4, 9, 2, 7, 11], 18)</code> return?</p><pre><code>function twoSumFast(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i &lt; nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[4, 3]</code>",
          why: "The two indexes are right but in the wrong order. The code returns <code>[seen.get(need), i]</code>, the earlier index first, and that is 3 followed by 4.",
        },
        {
          id: "b",
          text: "<code>[1, 1]</code>",
          why: "At <code>i = 1</code> the value is 9 and <code>need</code> is 9, but 9 is only stored after the lookup. The map holds just the 4 at that moment, so a number never pairs with itself.",
        },
        {
          id: "c",
          text: "<code>[3, 4]</code>",
          why: "The map grows 4 → 0, 9 → 1, 2 → 2. At <code>i = 3</code> the value is 7, which needs 11 and finds nothing, so 7 → 3 is stored. At <code>i = 4</code> the value is 11, which needs 7, and <code>seen.get(7)</code> is 3. The function returns <code>[3, 4]</code>.",
        },
        {
          id: "d",
          text: "<code>undefined</code>",
          why: "The function returns <code>undefined</code> only when the loop ends without a match. A pair does exist here: 7 + 11 = 18.",
        },
      ],
      answer: "c",
    },
    {
      id: "hash-trace-counts-order",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "trace",
      pattern: "hash-map",
      section: "frequency-counting-the-other-80-of-hashing-questions",
      kind: "single",
      prompt:
        "<p>What does <code>[...frequency([9, 4, 4, 9, 2, 4])]</code> give? The entries are written as <code>[key, count]</code>.</p><pre><code>function frequency(arr) {\n  const counts = new Map();\n  for (const x of arr) {\n    counts.set(x, (counts.get(x) || 0) + 1);\n  }\n  return counts;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[9, 2], [4, 3], [2, 1]]</code>",
          why: "A <code>Map</code> iterates in insertion order, and 9, 4 and 2 are first seen in that order. The counts are 2 for 9, 3 for 4 and 1 for 2. A plain object would list the keys 2, 4, 9 instead, because integer-like keys sort first.",
        },
        {
          id: "b",
          text: "<code>[[2, 1], [4, 3], [9, 2]]</code>",
          why: "That is the order a plain object would use, since integer-like keys come out in ascending order. A <code>Map</code> does not sort its keys: it keeps the order they were inserted.",
        },
        {
          id: "c",
          text: "<code>[[4, 3], [9, 2], [2, 1]]</code>",
          why: "That sorts the entries by count, highest first. A <code>Map</code> never reorders by value. Getting the most frequent keys needs an extra sort or a heap on top of the counts.",
        },
      ],
      answer: "a",
    },
    {
      id: "hash-store-before-check",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "edge-case",
      pattern: "hash-map",
      section: "the-pattern-trade-space-for-time",
      kind: "single",
      prompt:
        "<p>A teammate moves <code>seen.set</code> above the lookup. What does <code>twoSum([3, 2, 4], 6)</code> return now?</p><pre><code>function twoSum(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i &lt; nums.length; i++) {\n    seen.set(nums[i], i);\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n  }\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 2]</code>",
          why: "That is the correct answer, 2 + 4, and it is what the original order returns. With the store first, the loop never gets as far as index 2.",
        },
        {
          id: "b",
          text: "<code>[0, 0]</code>",
          why: "At <code>i = 0</code> the code stores 3 and then looks for <code>6 - 3 = 3</code>, which is the entry it just wrote. The element pairs with itself, and the function returns <code>[0, 0]</code>. Looking up first, then storing, is what prevents that.",
        },
        {
          id: "c",
          text: "<code>[0, 1]</code>",
          why: "That pair is 3 + 2 = 5, which is not the target. The function returns before it even reaches index 1.",
        },
        {
          id: "d",
          text: "<code>undefined</code>",
          why: "The function returns on the very first pass of the loop, so it never gets to fall off the end.",
        },
      ],
      answer: "b",
    },
    {
      id: "hash-object-as-counter",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "edge-case",
      pattern: "hash-map",
      section: "map-set-vs-plain-objects",
      kind: "multi",
      prompt:
        "<p>A word counter uses a plain object. Select every word that makes it produce a wrong count when it appears in the input.</p><pre><code>const counts = {};\nfor (const word of words) {\n  counts[word] = (counts[word] || 0) + 1;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: '<code>"constructor"</code>',
          why: 'A plain object inherits <code>constructor</code> from <code>Object.prototype</code>, so <code>counts["constructor"]</code> is already a function, which is truthy. Adding 1 to it gives a string, not 1.',
        },
        {
          id: "b",
          text: '<code>"apple"</code>',
          why: 'An ordinary word has no inherited property of that name, so <code>counts["apple"]</code> starts as <code>undefined</code> and the count works as intended.',
        },
        {
          id: "c",
          text: '<code>"toString"</code>',
          why: "<code>toString</code> is inherited from <code>Object.prototype</code> too, so it is already present before anything is stored. A <code>Map</code> has no such keys, which is why it is the default in interviews.",
        },
        {
          id: "d",
          text: '<code>"42"</code>',
          why: 'Number-like words are fine as keys. Object keys are always strings, so <code>"42"</code> is stored and counted correctly. The only oddity is that integer-like keys come out first when you iterate.',
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "hash-anagram-length",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "edge-case",
      pattern: "hash-map",
      section: "frequency-counting-the-other-80-of-hashing-questions",
      kind: "single",
      prompt:
        '<p>The first line of <code>isAnagram</code>, the length check, has been deleted. What does <code>isAnagram("abc", "ab")</code> return?</p><pre><code>function isAnagram(a, b) {\n  const counts = new Map();\n  for (const c of a) counts.set(c, (counts.get(c) || 0) + 1);\n  for (const c of b) {\n    if (!counts.get(c)) return false;\n    counts.set(c, counts.get(c) - 1);\n  }\n  return true;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "<code>false</code>, because the strings are different.",
          why: "Different strings can still return <code>true</code> here. The second loop only fails when it meets a character with no count left, and it never looks for counts that are left over.",
        },
        {
          id: "b",
          text: "<code>true</code>, although the strings are not anagrams.",
          why: "The first loop counts a, b and c once each. The second loop uses up the a and the b and never fails. The leftover count for c is never inspected, so it returns <code>true</code>. The length check closes that gap.",
        },
        {
          id: "c",
          text: 'It throws a <code>TypeError</code>, because <code>counts.get("c")</code> is missing.',
          why: 'The loop that could look up a missing key is the second one, and it never reads "c" because <code>b</code> has no "c". Even then, <code>get</code> on a missing key just gives <code>undefined</code>, without an error.',
        },
        {
          id: "d",
          text: "<code>undefined</code>, because the length was never compared.",
          why: "Every path through the function ends in a <code>return</code> of <code>true</code> or <code>false</code>. Nothing here can fall off the end and give <code>undefined</code>.",
        },
      ],
      answer: "b",
    },
    {
      id: "hash-wrong-tool",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "recognise",
      pattern: "hash-map",
      section: "when-hashing-is-the-wrong-tool",
      kind: "multi",
      prompt: "<p>Select every task where a hash map is the wrong tool.</p>",
      choices: [
        {
          id: "a",
          text: "Find the stored number that is closest to 50.",
          why: 'A hash map only answers "is this exact key present". Nearest-value questions want a sorted structure and a binary search.',
        },
        {
          id: "b",
          text: "Decide whether any value in an array appears twice.",
          why: 'This is the classic fit: remember each value in a <code>Set</code> and ask "seen this before?" in O(1) on average.',
        },
        {
          id: "c",
          text: "Count how many stored numbers lie between 10 and 20.",
          why: "A range query needs the keys in order, and a hash map has no order to exploit. A sorted array with binary search, or a tree, answers it.",
        },
        {
          id: "d",
          text: "Count how many times each letter appears in a string.",
          why: "This is the frequency counter, a standard use. Each letter costs one lookup and one update, so the whole string costs O(n).",
        },
        {
          id: "e",
          text: "Check a list for repeated values when the problem requires O(1) extra space.",
          why: "A hash map grows with the input, so it is ruled out by the space limit. You would need another approach, such as comparing every pair, which trades time for space.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "hash-order-one-pass",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "trace",
      pattern: "hash-map",
      section: "the-pattern-trade-space-for-time",
      kind: "order",
      prompt:
        "<p>Put one pass through the loop of <code>twoSumFast</code> in the order it happens, for an index <code>i</code> whose partner is not found.</p>",
      items: [
        { id: "need", text: "Compute <code>need = target - nums[i]</code>." },
        { id: "ask", text: "Ask <code>seen.has(need)</code>, and find that the answer is no." },
        { id: "store", text: "Store <code>seen.set(nums[i], i)</code>." },
        { id: "next", text: "Move on to <code>i + 1</code>." },
      ],
      why: "The value you need has to be known before the map can be asked about it. The map is asked before nums[i] is stored, so the element cannot pair with itself, and the store comes before the next index so later elements can find it.",
    },
  ],
  pattern: {
    pattern: "hash-map",
    chapter: "dsa-hashing",
    signals: [
      "The brute force is a nested loop asking whether a matching item exists elsewhere in the array.",
      "The prompt asks whether a value was seen before, or whether anything repeats.",
      "The prompt asks how many times each item occurs.",
      "Items must be grouped by a shared key, such as the sorted letters of an anagram.",
      "The prompt wants the positions of a pair or a complement in unsorted data.",
    ],
    template:
      "<pre><code>function pairWithTarget(nums, target) {\n  const seen = new Map();\n  for (let i = 0; i &lt; nums.length; i++) {\n    const need = target - nums[i];\n    if (seen.has(need)) return [seen.get(need), i];\n    seen.set(nums[i], i);\n  }\n}</code></pre>",
    time: "O(n)",
    space: "O(n)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
