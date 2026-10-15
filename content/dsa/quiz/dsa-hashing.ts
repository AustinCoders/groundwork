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
          text: "Sort the array, then binary search the sorted values for <code>target - x</code> for every <code>x</code>.",
          why: "Sorting costs O(n log n) already, so this cannot reach O(n). It also moves the elements, so the original positions would have to be tracked separately.",
        },
        {
          id: "b",
          text: "Walk the array once, looking up <code>target - x</code> in a <code>Map</code> of earlier values, then store <code>x</code> with its index.",
          why: 'Asking "have I seen the number I need?" costs O(1) on average with a hash map, instead of O(n) with a scan. One pass of n cheap lookups is O(n) time, paid for with O(n) space for the map.',
        },
        {
          id: "c",
          text: "Keep the nested loops but <code>break</code> out of both of them as soon as one pair matches.",
          why: "An early exit helps when a match comes early, but a missing pair, or one at the very end, still forces every pair to be checked. The worst case stays O(n²).",
        },
        {
          id: "d",
          text: "Keep a running total while walking the array and stop as soon as it equals the target.",
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
          text: "The map keeps its keys sorted, so a lookup can halve the search range on every step until it finds the key.",
          why: "Halving a sorted range is binary search, which is O(log n). A hash map does not keep its keys in sorted order, and it never searches at all.",
        },
        {
          id: "b",
          text: "Every key is stored at its own array index, so a lookup is a plain index read with no worst case.",
          why: "Different keys can hash to the same bucket, and the map has to handle that. It is a clever use of an array, but the O(1) is an average, not a guarantee for every key.",
        },
        {
          id: "c",
          text: "The engine caches recent lookups, so asking for the same key again costs nothing after the first time.",
          why: "Even the first lookup of a key is O(1) on average, with no caching involved. The speed comes from how the key is turned into a position.",
        },
        {
          id: "d",
          text: "The key is hashed straight to a bucket, so nothing is searched. That is an average: crowded buckets make lookups slower.",
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
    {
      id: "hash-skip-run-middle",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "recognise",
      pattern: "hash-map",
      section: "set-membership-asking-is-the-neighbour-here",
      kind: "single",
      prompt:
        "<p>In longest consecutive sequence, the loop does <code>if (set.has(x - 1)) continue;</code> before it starts walking upwards from <code>x</code>. What does that line do for the running time?</p>",
      choices: [
        {
          id: "a",
          text: "It makes sure the walk starts only at the beginning of a run, so every value is walked over at most once in total.",
          why: "If <code>x - 1</code> exists, <code>x</code> is in the middle or at the end of some run and that run is walked from its own first element. Starting at run beginnings only means no value is visited from two different starts, which keeps the whole loop at about 2n lookups.",
        },
        {
          id: "b",
          text: "It sorts the values as a side effect, so the walk can stop early.",
          why: "A <code>Set</code> does not sort anything, and the loop never relies on order. The check is only a membership lookup.",
        },
        {
          id: "c",
          text: "It removes duplicate values from the input.",
          why: "Duplicates are removed by building the <code>Set</code> in the first place. The <code>continue</code> says nothing about duplicates; it skips values whose predecessor exists.",
        },
        {
          id: "d",
          text: "It lets the loop stop as soon as the first run has been measured.",
          why: "Every run still has to be measured, because the longest one can be anywhere in the data. The check only prevents measuring a run from the middle.",
        },
      ],
      answer: "a",
    },
    {
      id: "hash-duplicates-quadratic",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "complexity",
      pattern: "hash-map",
      section: "set-membership-asking-is-the-neighbour-here",
      kind: "single",
      prompt:
        "<p>A version of longest consecutive sequence loops <code>for (const x of nums)</code> (the array) instead of <code>for (const x of set)</code>, but is otherwise the same. The input has n / 2 copies of the value 1 followed by the n / 2 values 2, 3, ... Which describes its worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "Still O(n), because every walk is skipped unless its predecessor is missing.",
          why: "The value 1 has no predecessor, and every one of its n / 2 copies passes the check. Each copy walks the whole run of about n / 2 values.",
        },
        {
          id: "b",
          text: "O(n log n), because the set lookups are logarithmic.",
          why: "Set lookups are O(1) on average, not logarithmic. The extra cost comes from repeating a walk, not from the cost of one lookup.",
        },
        {
          id: "c",
          text: "O(n²), because each of the n / 2 copies of 1 walks a run of about n / 2 values.",
          why: "n / 2 walks of n / 2 steps is n² / 4. Looping over the <code>Set</code> visits the value 1 once, which removes the repeated walks.",
        },
        {
          id: "d",
          text: "O(1), because the run contains only a few distinct starting points.",
          why: "Even with one distinct starting point, the loop body runs once per array element, and the walk from the start costs time proportional to the run's length.",
        },
      ],
      answer: "c",
    },
    {
      id: "hash-trace-happy-seen",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "trace",
      pattern: "hash-map",
      section: "set-membership-asking-is-the-neighbour-here",
      kind: "single",
      prompt:
        "<p><code>isHappy(19)</code> follows 19, 82, 68, 100, 1. The loop is <code>while (n !== 1 &amp;&amp; !seen.has(n)) { seen.add(n); n = digitSquareSum(n); }</code>. How many values have been added to <code>seen</code> when the function returns?</p>",
      choices: [
        {
          id: "a",
          text: "3",
          why: "That stops one value early. The values 19, 82, 68 and 100 each pass the loop test and get added, which is four.",
        },
        {
          id: "b",
          text: "4",
          why: "The values 19, 82, 68 and 100 are each added before the next step. When <code>n</code> becomes 1 the loop test fails and 1 is never added.",
        },
        {
          id: "c",
          text: "5",
          why: "That counts the final 1 as well. The loop condition <code>n !== 1</code> fails before the body runs, so 1 is never added to the set.",
        },
        {
          id: "d",
          text: "1",
          why: "Every new value in the sequence is added, not only the first one, so the set grows with the sequence.",
        },
      ],
      answer: "b",
    },
    {
      id: "hash-top-k-methods",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "complexity",
      pattern: "hash-map",
      section: "top-k-frequent-count-then-bucket-by-frequency",
      kind: "single",
      prompt:
        "<p>An array of n numbers has m distinct values. After counting, which statement about picking the k most frequent is correct?</p>",
      choices: [
        {
          id: "a",
          text: "Sorting the m (value, count) pairs costs O(m log m), a size-k min-heap costs O(m log k), and frequency buckets cost O(n).",
          why: "Sorting compares m items, so its cost is m log m. A heap that never holds more than k entries makes each of m pushes cost log k. Buckets work because a count is a whole number from 1 to n, so no comparison is needed.",
        },
        {
          id: "b",
          text: "Frequency buckets need a sort of each bucket, so they cost O(n log n).",
          why: "Placing a value in the bucket of its count is one array write. Nothing inside a bucket needs sorting unless the problem asks for a tie-break order.",
        },
        {
          id: "c",
          text: "A size-k min-heap costs O(n log n) because it must look at every element.",
          why: "It does look at every distinct value, but each push or pop on a heap of at most k entries costs O(log k), so the total is O(m log k), not n log n.",
        },
        {
          id: "d",
          text: "The counting pass can be skipped, because buckets can be filled straight from the array.",
          why: "The bucket a value belongs in is its count, and the count is only known after counting. Skipping that pass leaves nothing to index the buckets by.",
        },
      ],
      answer: "a",
    },
    {
      id: "hash-set-of-arrays",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "edge-case",
      pattern: "hash-map",
      section: "composite-keys-a-map-compares-objects-by-reference",
      kind: "single",
      prompt:
        "<p>A grid search keeps <code>const visited = new Set();</code> and does <code>visited.add([r, c])</code> for each cell it reaches. Before expanding a cell it asks <code>visited.has([r, c])</code>. What happens?</p>",
      choices: [
        {
          id: "a",
          text: "It works: arrays with the same numbers are treated as the same key.",
          why: "A <code>Set</code> compares objects by reference, and each <code>[r, c]</code> is a new array. Two arrays that look alike are two different keys.",
        },
        {
          id: "b",
          text: "It throws a <code>TypeError</code> because arrays cannot be keys.",
          why: "Arrays are allowed as keys. That is exactly what makes the bug hard to see: nothing is reported.",
        },
        {
          id: "c",
          text: "<code>has</code> always answers false, so cells are expanded again and again.",
          why: 'The array handed to <code>has</code> was never stored, so it is never found. The fix is a primitive key such as <code>r + "," + c</code> or <code>r * cols + c</code>.',
        },
        {
          id: "d",
          text: "<code>has</code> compares the array contents but only for arrays shorter than three items.",
          why: "No such rule exists. Reference comparison is applied to every object, whatever its length.",
        },
      ],
      answer: "c",
    },
    {
      id: "hash-key-collision",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "edge-case",
      pattern: "hash-map",
      section: "canonical-keys-make-things-that-are-equal-look-equal",
      kind: "single",
      prompt:
        "<p>A canonical key for the pair of counts <code>(a, b)</code> is built as <code>String(a) + String(b)</code>, with no separator. Which pair gets the same key as <code>(1, 11)</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>(11, 1)</code>",
          why: 'Both pairs turn into the text <code>"111"</code>. A separator such as <code>"#"</code> gives <code>"1#11"</code> and <code>"11#1"</code>, which stay different.',
        },
        {
          id: "b",
          text: "<code>(1, 1)</code>",
          why: 'That pair produces <code>"11"</code>, which is shorter than <code>"111"</code>, so the two keys differ.',
        },
        {
          id: "c",
          text: "<code>(2, 11)</code>",
          why: 'That pair produces <code>"211"</code>, a different string from <code>"111"</code>.',
        },
        {
          id: "d",
          text: "<code>(1, 111)</code>",
          why: 'That pair produces <code>"1111"</code>, one character longer than <code>"111"</code>, so it cannot match.',
        },
      ],
      answer: "a",
    },
    {
      id: "hash-isomorphic-one-map",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "edge-case",
      pattern: "hash-map",
      section: "bijections-two-maps-for-isomorphic-strings-and-word-patterns",
      kind: "single",
      prompt:
        "<p>An isomorphic-strings check keeps only the forward map from letters of <code>s</code> to letters of <code>t</code> and rejects a letter that maps to two different targets; it first rejects strings of different lengths. Which input does it wrongly accept?</p>",
      choices: [
        {
          id: "a",
          text: '<code>s = "foo"</code>, <code>t = "bar"</code>',
          why: "Here <code>o</code> would have to map to <code>a</code> and then to <code>r</code>. The forward map sees that conflict and rejects it correctly.",
        },
        {
          id: "b",
          text: '<code>s = "ab"</code>, <code>t = "aa"</code>',
          why: "Each letter of <code>s</code> maps to a single target (<code>a → a</code>, <code>b → a</code>), so the forward map is happy, but two different letters share one target. A backward map from <code>t</code> to <code>s</code> catches it.",
        },
        {
          id: "c",
          text: '<code>s = "egg"</code>, <code>t = "add"</code>',
          why: "These are isomorphic, so accepting them is correct, not a mistake.",
        },
        {
          id: "d",
          text: '<code>s = "abc"</code>, <code>t = "ab"</code>',
          why: "The lengths differ, and a length check at the top rejects the pair before any map is used.",
        },
      ],
      answer: "b",
    },
    {
      id: "hash-trace-resize",
      chapter: "dsa-hashing",
      level: "beginner",
      skill: "trace",
      pattern: "hash-map",
      section: "build-a-hashmap-from-scratch",
      kind: "single",
      prompt:
        "<p>A chained hash map starts with capacity 8 and doubles its capacity right after any insertion that makes <code>size</code> greater than <code>0.75 * capacity</code>. On which new-key insertion does the capacity first change?</p>",
      choices: [
        {
          id: "a",
          text: "The 6th",
          why: "After six entries the size is 6, and 0.75 · 8 is also 6. The rule needs the size to be <em>greater than</em> 6, so nothing happens yet.",
        },
        {
          id: "b",
          text: "The 7th",
          why: "Seven entries make the size 7, which is greater than 0.75 · 8 = 6, so the table doubles to 16 and re-inserts every entry.",
        },
        {
          id: "c",
          text: "The 8th",
          why: "The table has already doubled by then. Waiting until the size reaches the capacity would let chains grow longer than the rule allows.",
        },
        {
          id: "d",
          text: "The 9th",
          why: "That would be the first insertion after the table is completely full, which the load-factor rule is designed to prevent.",
        },
      ],
      answer: "b",
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
