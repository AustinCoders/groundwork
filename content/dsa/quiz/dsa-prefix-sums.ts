import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "ps-many-range-sums",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "recognise",
      pattern: "prefix-sum",
      section: "the-idea-a-range-is-the-difference-of-two-prefixes",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array of 48,000 integers never changes. A program must answer 150,000 questions of the form &ldquo;what is the sum of <code>nums[left..right]</code>?&rdquo; Which plan fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Add up the elements from <code>left</code> to <code>right</code> for each question.",
          why: "Every answer is correct, but a question can span the whole array, so the worst case is about 48,000 additions for each of 150,000 questions, which is over seven billion additions in total.",
        },
        {
          id: "b",
          text: "Build one table of running totals, then answer each question with a subtraction of two entries.",
          why: "The table costs one pass of 48,000 steps. After that, <code>P[right + 1] - P[left]</code> answers any question in constant time, because the elements before <code>left</code> sit in both prefixes and cancel.",
        },
        {
          id: "c",
          text: "Sort the array once so that each range is stored contiguously.",
          why: "Sorting moves the elements to new positions, so <code>left..right</code> no longer names the same elements. The sum of the original index range is not the sum of the same positions in the sorted array.",
        },
        {
          id: "d",
          text: "Precompute every possible answer and keep it in a <code>Map</code> keyed by the pair <code>(left, right)</code>.",
          why: "There are about 1.15 billion pairs for 48,000 elements, far too many to store. The table of 48,001 running totals already contains all of them, one subtraction away.",
        },
      ],
      answer: "b",
    },
    {
      id: "ps-negatives-exact-sum",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "recognise",
      pattern: "prefix-sum",
      section: "counting-subarrays-that-hit-a-target-prefix-sums-plus-a-hash",
      placement: true,
      kind: "single",
      prompt:
        "<p>An integer array may contain negative numbers. How many contiguous subarrays sum to exactly <code>k</code>? Which approach is correct and runs in linear time?</p>",
      choices: [
        {
          id: "a",
          text: "A sliding window that grows on the right and shrinks from the left while its sum is above <code>k</code>.",
          why: "The shrinking rule assumes that dropping an element can only lower the sum, which holds for non-negative numbers. With negatives, it can give wrong counts: on <code>[1, -1, 1, 1]</code> with <code>k = 1</code> this window finds 3 subarrays and the true answer is 5.",
        },
        {
          id: "b",
          text: "Sort the array and move two pointers inward until the sums match.",
          why: "Sorting breaks contiguity. A subarray is a run of neighbours in the original order, and after sorting the neighbours are different elements.",
        },
        {
          id: "c",
          text: "Keep a running prefix sum and a <code>Map</code> of how often each prefix occurred. Add the count stored for <code>prefix - k</code>, then record the prefix.",
          why: "A subarray ending here has sum <code>k</code> exactly when an earlier prefix equals <code>prefix - k</code>, and each earlier match is a different start. One lookup and one write per element give linear time, whatever the signs.",
        },
        {
          id: "d",
          text: "Keep the same running prefix sum but store the earlier prefixes in a <code>Set</code>, adding 1 whenever <code>prefix - k</code> is in it.",
          why: "A <code>Set</code> says whether at least one earlier prefix matches, not how many. The same prefix value can occur at several positions, and each position is a different subarray, so this undercounts.",
        },
      ],
      answer: "c",
    },
    {
      id: "ps-booking-ranges",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "recognise",
      pattern: "prefix-sum",
      section: "difference-arrays-the-same-idea-run-backwards",
      placement: true,
      kind: "single",
      prompt:
        "<p>A booking system receives 90,000 requests, each saying &ldquo;add 1 to every day from day <code>a</code> to day <code>b</code>&rdquo;, over days numbered 0 to 29,999. Only after every request has been processed does it print each day's total once. Which plan has the lowest total cost?</p>",
      choices: [
        {
          id: "a",
          text: "Record each request as two writes in a difference array, then take one running sum at the end.",
          why: "Adding to a range changes only the step at day <code>a</code> and the step just past day <code>b</code>. Each request costs two writes, and the final pass over the days rebuilds every total.",
        },
        {
          id: "b",
          text: "For each request, loop over its days and add 1 to each.",
          why: "This is correct, but a request can cover all 30,000 days, so 90,000 requests can cost billions of additions in total.",
        },
        {
          id: "c",
          text: "Rebuild a prefix-sum table after every request.",
          why: "A rebuild is a pass over all days, so doing it for each request costs as much as the loop. A prefix table also answers range reads, and the problem here is range writes.",
        },
        {
          id: "d",
          text: "Keep a Fenwick tree and read each day with a point query after every request.",
          why: "A Fenwick tree over the steps does support range writes and point reads in logarithmic time, so it is correct. Since the totals are read only once at the end, a difference array reaches the same answer with constant work per request and no logarithm.",
        },
      ],
      answer: "a",
    },
    {
      id: "ps-count-complexity",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "complexity",
      pattern: "prefix-sum",
      section: "counting-subarrays-that-hit-a-target-prefix-sums-plus-a-hash",
      kind: "single",
      prompt:
        "<p>Assume <code>Map</code> reads and writes cost O(1) on average. What are the time and the extra space of this function, for an array of n numbers?</p><pre><code>function subarraySum(nums, k) {\n  const seen = new Map([[0, 1]]);\n  let prefix = 0;\n  let count = 0;\n  for (const x of nums) {\n    prefix += x;\n    count += seen.get(prefix - k) ?? 0;\n    seen.set(prefix, (seen.get(prefix) ?? 0) + 1);\n  }\n  return count;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n) time, O(1) space",
          why: "The time is right, but the <code>Map</code> gets a new key whenever a new prefix value appears. With distinct prefixes it grows to n + 1 entries, so the space is not constant.",
        },
        {
          id: "b",
          text: "O(n log n) time, O(n) space",
          why: "Nothing here sorts or searches a tree. Each element does one read and one write on the <code>Map</code>, which are constant on average, so there is no logarithmic factor.",
        },
        {
          id: "c",
          text: "O(n²) time, O(n) space",
          why: "Quadratic time belongs to the version that tries every pair of endpoints. This loop runs once over the array, and the lookup replaces the inner loop.",
        },
        {
          id: "d",
          text: "O(n) time, O(n) space",
          why: "One pass with constant average work per element gives linear time. The <code>Map</code> holds at most one entry per distinct prefix value, so up to n + 1 entries, which is linear space.",
        },
      ],
      answer: "d",
    },
    {
      id: "ps-submatrix-complexity",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "complexity",
      pattern: "prefix-sum",
      section: "two-dimensions-rectangle-sums-by-inclusion-and-exclusion",
      kind: "single",
      prompt:
        "<p>This function counts the submatrices of an R by C grid that sum to <code>target</code>. <code>subarraySum</code> is the linear-time one-dimensional counter. What is the time bound?</p><pre><code>function numSubmatrixSumTarget(matrix, target) {\n  let count = 0;\n  for (let top = 0; top &lt; R; top++) {\n    const columnTotals = new Array(C).fill(0);\n    for (let bottom = top; bottom &lt; R; bottom++) {\n      for (let c = 0; c &lt; C; c++) columnTotals[c] += matrix[bottom][c];\n      count += subarraySum(columnTotals, target);\n    }\n  }\n  return count;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(R · C)",
          why: "That is the cost of reading the grid once. This code starts a pass over C column totals for every pair of rows, and there are about R²/2 pairs.",
        },
        {
          id: "b",
          text: "O(R² · C)",
          why: "There are R(R + 1)/2 pairs of rows. For each, the inner loop adds one row in O(C) and <code>subarraySum</code> runs in O(C), so each pair costs O(C) and the total is O(R² · C).",
        },
        {
          id: "c",
          text: "O(R² · C²)",
          why: "That is the cost of enumerating every pair of rows and every pair of columns with an O(1) rectangle query. This code never enumerates column pairs: the map inside <code>subarraySum</code> finds all matching column runs in one pass over C entries.",
        },
        {
          id: "d",
          text: "O(R · C²)",
          why: "That would be the cost if the pairs were taken over columns instead. Here the outer loops pair rows, so the squared factor is R, not C.",
        },
      ],
      answer: "b",
    },
    {
      id: "ps-trace-updates",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "trace",
      pattern: "prefix-sum",
      section: "difference-arrays-the-same-idea-run-backwards",
      kind: "single",
      prompt:
        "<p>The chapter's <code>applyUpdates(n, updates)</code> starts from n zeros. What does <code>applyUpdates(6, [[1, 4, 3], [0, 2, -2], [3, 5, 1]])</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[-2, 3, 0, 3, 0, -3]</code>",
          why: "These are the first six entries of the difference array after the three updates. The running sum that turns the steps back into values was not taken.",
        },
        {
          id: "b",
          text: "<code>[-2, 1, 3, 4, 1, 0]</code>",
          why: "This is what you get if each decrease is written at <code>right</code> instead of <code>right + 1</code>, which shortens every update by its last element.",
        },
        {
          id: "c",
          text: "<code>[-2, 1, 1, 4, 4, 1]</code>",
          why: "The updates add 3 to indexes 1 to 4, then -2 to indexes 0 to 2, then 1 to indexes 3 to 5. Index 3, for example, receives 3 and 1, which is 4. The difference array is <code>[-2, 3, 0, 3, 0, -3, -1]</code> and its running sum is this answer.",
        },
        {
          id: "d",
          text: "<code>[-2, 1, 1, 2, 2, 2]</code>",
          why: "This is the result if the decreases are never written, so each update runs to the end of the array instead of stopping at its <code>right</code> index.",
        },
      ],
      answer: "c",
    },
    {
      id: "ps-negative-remainder",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "edge-case",
      pattern: "prefix-sum",
      section: "remainders-sums-that-divide-evenly",
      kind: "single",
      prompt:
        "<p>In <code>subarraysDivByK</code>, the line <code>remainder = (((remainder + x) % k) + k) % k;</code> is changed to <code>remainder = (remainder + x) % k;</code>. The array <code>seen</code> has k slots, and <code>count += seen[remainder]</code> follows. What does the function return for <code>[-1, 2, 9]</code> with <code>k = 5</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1</code>, the same as before the change.",
          why: "The right answer is 1, because the whole array sums to 10. But the first prefix is -1, and <code>-1 % 5</code> is <code>-1</code> in JavaScript, which is not a slot of <code>seen</code>. The count is spoiled before the whole array is reached.",
        },
        {
          id: "b",
          text: "<code>0</code>, because the negative element is skipped.",
          why: "No element is skipped. The loop runs for every element and reads <code>seen[-1]</code>, which is <code>undefined</code>, and adding <code>undefined</code> to a number gives <code>NaN</code>, not 0.",
        },
        {
          id: "c",
          text: "It throws a <code>TypeError</code>.",
          why: "Reading an index that is not in an array returns <code>undefined</code> and does not throw. The function runs to the end and returns a value.",
        },
        {
          id: "d",
          text: "<code>NaN</code>.",
          why: "The first prefix leaves remainder -1, and <code>seen[-1]</code> is <code>undefined</code>. The addition <code>count += undefined</code> turns <code>count</code> into <code>NaN</code>, and it stays <code>NaN</code> for the rest of the loop. No error is thrown.",
        },
      ],
      answer: "d",
    },
    {
      id: "ps-empty-seed",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "edge-case",
      pattern: "prefix-sum",
      section: "counting-subarrays-that-hit-a-target-prefix-sums-plus-a-hash",
      kind: "single",
      prompt:
        "<p>In <code>subarraySum</code>, the map is created empty (<code>new Map()</code>) instead of <code>new Map([[0, 1]])</code>, and nothing else changes. Which call now returns a wrong answer?</p>",
      choices: [
        {
          id: "a",
          text: "<code>subarraySum([3, 4], 7)</code>",
          why: "The only match is the whole array, which starts at index 0. Its start prefix is the empty prefix 0, which is no longer in the map, so the function returns 0 instead of 1.",
        },
        {
          id: "b",
          text: "<code>subarraySum([1, 2, 3], 10)</code>",
          why: "No subarray sums to 10, so every lookup misses with or without the seed, and the result is 0 in both versions.",
        },
        {
          id: "c",
          text: "<code>subarraySum([5, 1], 1)</code>",
          why: "The only matching subarray is <code>[1]</code>, which starts at index 1. Its start prefix is 5, which was recorded after the first element, so the lookup still finds it and the result is 1, as before.",
        },
        {
          id: "d",
          text: "<code>subarraySum([], 0)</code>",
          why: "An empty array has no elements, so the loop body never runs and the function returns 0 in both versions.",
        },
      ],
      answer: "a",
    },
    {
      id: "ps-overwrite-first",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "trace",
      pattern: "prefix-sum",
      section: "longest-and-shortest-which-index-you-keep-decides-the-answer",
      kind: "single",
      prompt:
        "<p>In <code>longestSubarraySum</code>, the line <code>if (!first.has(prefix)) first.set(prefix, i);</code> is replaced by <code>first.set(prefix, i);</code>. What does the changed function return for <code>[1, -1, 5, -2, 3]</code> with <code>k = 3</code>?</p><pre><code>function longestSubarraySum(nums, k) {\n  const first = new Map([[0, -1]]);\n  let prefix = 0;\n  let best = 0;\n  for (let i = 0; i &lt; nums.length; i++) {\n    prefix += nums[i];\n    if (first.has(prefix - k)) best = Math.max(best, i - first.get(prefix - k));\n    first.set(prefix, i);\n  }\n  return best;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>4</code>",
          why: "4 is the length of <code>[1, -1, 5, -2]</code> and the answer of the unchanged function. In the changed one, the prefix 0 at index 1 replaces the entry at index -1, so that subarray is no longer found.",
        },
        {
          id: "b",
          text: "<code>3</code>",
          why: "No subarray of length 3 sums to 3 here, and the changed function can only report lengths of subarrays that really sum to 3.",
        },
        {
          id: "c",
          text: "<code>1</code>",
          why: "The single element <code>[3]</code> sums to 3, which is length 1, but the changed function also finds <code>[5, -2]</code>, which is longer, so the maximum is not 1.",
        },
        {
          id: "d",
          text: "<code>2</code>",
          why: "At index 3 the prefix is 3 and the lookup key is 0. After the overwrite, 0 maps to index 1, so the length is 3 - 1 = 2, for the subarray <code>[5, -2]</code>. Nothing later beats it, since index 4 gives length 1.",
        },
      ],
      answer: "d",
    },
    {
      id: "ps-equal-zeros-ones",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "recognise",
      pattern: "prefix-sum",
      section: "turn-the-condition-into-a-sum-the-plus-one-minus-one-trick",
      kind: "single",
      prompt:
        "<p>Find the longest contiguous subarray of a 0/1 array that holds equally many 0s and 1s. Which change of variables turns this into a prefix-sum problem?</p>",
      choices: [
        {
          id: "a",
          text: "Replace every 0 by -1, then find the longest subarray whose sum is 0.",
          why: "Each 1 adds 1 and each 0 now subtracts 1, so the sum is the number of 1s minus the number of 0s. It is zero exactly when the counts are equal, and a zero sum means two equal prefix values, which a map of first indexes finds.",
        },
        {
          id: "b",
          text: "Keep the values and look for a subarray whose sum is half of its own length.",
          why: "Equal counts do mean the sum is half the length, but the length changes from one subarray to the next, so there is no single target <code>k</code> to look up.",
        },
        {
          id: "c",
          text: "Sort the array so the 0s and 1s are grouped, then compare the two group sizes.",
          why: "Sorting destroys the order, and a subarray has to be a run of neighbours in the original order.",
        },
        {
          id: "d",
          text: "Take the XOR of each subarray and look for 0.",
          why: "The subarray <code>[0, 1]</code> has equal counts and an XOR of 1, so a zero XOR does not characterise equal counts.",
        },
      ],
      answer: "a",
    },
    {
      id: "ps-xor-triplet-condition",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "recognise",
      pattern: "prefix-sum",
      section: "prefix-xor-when-the-operation-undoes-itself",
      kind: "single",
      prompt:
        "<p>Count triplets <code>i &lt; j &lt;= k</code> where the XOR of <code>arr[i..j-1]</code> equals the XOR of <code>arr[j..k]</code>. Let <code>P[x]</code> be the XOR of the first x elements. Which condition is equivalent?</p>",
      choices: [
        {
          id: "a",
          text: "<code>P[i] === P[j]</code>",
          why: "That says <code>arr[i..j-1]</code> XORs to 0. The two halves are equal only when their combined XOR is 0, which involves <code>k</code> too.",
        },
        {
          id: "b",
          text: "<code>P[i] === P[k + 1]</code>, with any <code>j</code> from <code>i + 1</code> to <code>k</code>",
          why: "Two values are equal exactly when their XOR is 0. The XOR of both halves is the XOR of <code>arr[i..k]</code>, which is <code>P[i] ^ P[k + 1]</code>. So <code>j</code> drops out of the test and each equal pair contributes <code>k - i</code> triplets.",
        },
        {
          id: "c",
          text: "<code>P[j] === P[k + 1]</code>",
          why: "That says <code>arr[j..k]</code> XORs to 0, which is only one half. It says nothing about the other half being equal to it.",
        },
        {
          id: "d",
          text: "<code>P[i] ^ P[k + 1] === arr[j]</code>",
          why: "This compares the XOR of a whole range with a single element. The condition has no single element in it, only two halves of the range.",
        },
      ],
      answer: "b",
    },
    {
      id: "ps-which-operations",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "recognise",
      pattern: "prefix-sum",
      section: "prefix-products-when-the-operation-has-no-safe-inverse",
      kind: "multi",
      prompt: "<p>Select every statement that is true about answering range queries from two prefixes.</p>",
      choices: [
        {
          id: "a",
          text: "A range XOR is <code>P[r + 1] ^ P[l]</code>, because XOR applied twice cancels.",
          why: "The elements before <code>l</code> appear in both prefixes, and <code>x ^ x</code> is 0, so only the range remains.",
        },
        {
          id: "b",
          text: "A range product can always be found as <code>P[r + 1] / P[l]</code> with ordinary JavaScript numbers.",
          why: "A zero anywhere makes every later prefix product 0, and a zero cannot be divided out. Products past 2<sup>53</sup> - 1 are also not guaranteed to be held exactly, so the quotient can be wrong.",
        },
        {
          id: "c",
          text: "A range minimum cannot be recovered by subtracting two prefix minimums.",
          why: "Minimum has no inverse operation: from the minimum of a long prefix you cannot remove the elements before <code>l</code>. Range minimum needs another structure, such as a sparse table.",
        },
        {
          id: "d",
          text: "A range sum is <code>P[r + 1] - P[l]</code>, and this holds when some elements are negative.",
          why: "The cancelling argument uses only that subtraction undoes addition, so the signs of the elements do not matter.",
        },
        {
          id: "e",
          text: "A prefix table stays correct if elements of the array are changed after it is built.",
          why: "Every prefix from the changed index onward still holds the old total, so the table is wrong from that point until it is rebuilt.",
        },
      ],
      answers: ["a", "c", "d"],
    },
    {
      id: "ps-order-count-loop",
      chapter: "dsa-prefix-sums",
      level: "beginner",
      skill: "trace",
      pattern: "prefix-sum",
      section: "counting-subarrays-that-hit-a-target-prefix-sums-plus-a-hash",
      kind: "order",
      prompt:
        "<p>Put the steps of <code>subarraySum</code> in the order they run for one array. The first step happens before the loop, and the other three repeat for every element.</p>",
      items: [
        { id: "seed", text: "Put the empty prefix, value 0, in the map with a count of 1." },
        { id: "add", text: "Add the element to the running prefix." },
        { id: "look", text: "Add the count stored for <code>prefix - k</code> to the answer." },
        { id: "record", text: "Increase the stored count for <code>prefix</code> by 1." },
      ],
      why: "The seed comes first, because a subarray that starts at index 0 needs the empty prefix in the map. Inside the loop the prefix must include the new element before it is used, so the addition comes next. The lookup comes before the record: if the prefix were recorded first, with <code>k = 0</code> every prefix would match itself and count an empty subarray.",
    },
  ],
  pattern: {
    pattern: "prefix-sum",
    chapter: "dsa-prefix-sums",
    signals: [
      "The prompt asks about contiguous subarrays or ranges: a sum, a count, a balance, or the longest or shortest one.",
      "The brute force tries every pair of endpoints, and a stored running total would make each pair O(1) or remove the inner loop.",
      "The array has negative numbers and the sum must be exact, so a sliding window is not safe.",
      "Many range additions are applied before one final read, or many rectangle sums are asked on a fixed grid.",
    ],
    template:
      "<pre><code>const seen = new Map([[0, 1]]); let prefix = 0, count = 0; for (const x of nums) { prefix += x; count += seen.get(prefix - k) ?? 0; seen.set(prefix, (seen.get(prefix) ?? 0) + 1); }</code></pre>",
    time: "O(n) to build, then O(1) per range query",
    space: "O(n) for the prefix table or the map",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
