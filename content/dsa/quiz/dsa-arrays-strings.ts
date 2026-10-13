import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "as-remove-in-place",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "recognise",
      pattern: "in-place-array",
      section: "the-in-place-pattern",
      placement: true,
      kind: "single",
      prompt:
        "<p>You must remove every <code>0</code> from an array of numbers, keep the other numbers in their original order, use O(1) extra space and run in O(n) time. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Build and return a new array with <code>nums.filter((x) =&gt; x !== 0)</code>, leaving the original array as it was.",
          why: "It keeps the order and runs in O(n), but it builds a second array, so the extra space is O(n). The task is to change the array you were given.",
        },
        {
          id: "b",
          text: "Scan with a read index, and copy each non-zero value to a write index that only advances on a copy.",
          why: "The read index looks at everything while the write index marks the next free slot, so the kept values slide to the front in their original order. It is one pass, with two numbers of extra memory. Everything past the write index is leftover and is ignored.",
        },
        {
          id: "c",
          text: "Scan from the left and call <code>nums.splice(i, 1)</code> whenever <code>nums[i]</code> is 0.",
          why: "Each <code>splice</code> can shift everything after the cut, so many zeros can make this O(n²). A scan that moves on to <code>i + 1</code> after a removal also skips the value that slid into slot <code>i</code>, so a zero can survive.",
        },
        {
          id: "d",
          text: "Call <code>nums.sort()</code> and slice off the zeros.",
          why: "Sorting does not keep the original order of the other numbers, and the default <code>sort</code> compares values as strings. It also costs O(n log n), not O(n).",
        },
      ],
      answer: "b",
    },
    {
      id: "as-many-range-sums",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "recognise",
      pattern: "in-place-array",
      section: "prefix-sums-turn-o-n-range-queries-into-o-1",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array of 200,000 numbers never changes. Then 50,000 queries arrive, and each asks for the sum of the numbers from index <code>left</code> to index <code>right</code>. Which approach is best?</p>",
      choices: [
        {
          id: "a",
          text: "Add up the numbers from <code>left</code> to <code>right</code> in a loop, for each query.",
          why: "Each query can scan the whole array, so the total is about n × q, here billions of steps. It is correct but wasteful when the array never changes.",
        },
        {
          id: "b",
          text: "Sort the array once, so each range is easy to find.",
          why: "Sorting moves the numbers to new positions, so index <code>left</code> to <code>right</code> no longer means the same slice of the data. It also does not make a sum any cheaper.",
        },
        {
          id: "c",
          text: "Build a running-total array once, then answer each query with one subtraction.",
          why: "One pass builds <code>prefix</code>, where <code>prefix[i]</code> is the sum of everything up to index i. Every range is then a difference of two entries, so the total is O(n + q) instead of O(n × q).",
        },
        {
          id: "d",
          text: "Store the answer for every possible pair <code>(left, right)</code> in a map before the queries start.",
          why: "There are about n²/2 pairs, so building the map is slower than the queries it is meant to speed up and uses far more memory. A single running-total array gives the same O(1) answers.",
        },
      ],
      answer: "c",
    },
    {
      id: "as-shift-in-a-loop",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "complexity",
      pattern: "in-place-array",
      section: "what-s-actually-o-1-vs-o-n-on-an-array",
      kind: "single",
      prompt:
        "<p>The queue holds n numbers. What is the worst-case time of <code>drain</code>?</p><pre><code>function drain(queue) {\n  const out = [];\n  while (queue.length &gt; 0) {\n    out.push(queue.shift());\n  }\n  return out;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²), since each <code>shift</code> can move every remaining element.",
          why: "<code>shift</code> can be O(n), and it runs n times, so the worst case is O(n²). <code>push</code> is amortized O(1), so it does not change the bound. Reading with an index and moving a head position forward avoids the shifting.",
        },
        {
          id: "b",
          text: "O(n), because the loop runs n times and each pass makes just one method call.",
          why: "This counts the loop but treats <code>shift</code> as free. When each <code>shift</code> can move every remaining element, n of them add up to more than n.",
        },
        {
          id: "c",
          text: "O(1), because <code>shift</code> just removes the first slot and nothing else moves.",
          why: "Removing the first element changes the index of every element after it. That is why <code>shift</code> can be O(n), not O(1), even though it is a single method call.",
        },
        {
          id: "d",
          text: "O(n log n), because the array shrinks by one each pass.",
          why: "A log n factor comes from halving the work, not from removing one element at a time. Removing one element per pass gives a sum like n + (n - 1) + ... + 1, which is quadratic.",
        },
      ],
      answer: "a",
    },
    {
      id: "as-string-building",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "complexity",
      pattern: "in-place-array",
      section: "strings-are-arrays-with-one-extra-rule",
      kind: "single",
      prompt:
        '<p>Which statement about <code>buildSlow</code> is accurate?</p><pre><code>function buildSlow(chars) {\n  let out = "";\n  for (const c of chars) out += c;\n  return out;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "It is always O(n), because <code>+=</code> adds one character to the end in one step.",
          why: "Strings are immutable, so <code>+=</code> builds a new string. If that means copying the characters so far each time, the copies grow 1, 2, 3, ... n, which is quadratic.",
        },
        {
          id: "b",
          text: "It is O(log n), because the string grows by doubling, just like a dynamic array does.",
          why: "A dynamic array doubles its spare room so that pushes are cheap. A string has no spare room to fill, and in any case a loop over n characters cannot take less than n steps.",
        },
        {
          id: "c",
          text: "It is O(n²) in every JavaScript engine, which is why <code>join</code> is always required.",
          why: 'Modern engines often optimise repeated concatenation, so it is not guaranteed to be quadratic. The worst case is real, but "always" and "required" go too far.',
        },
        {
          id: "d",
          text: "It can be O(n²) in the worst case, because each <code>+=</code> may copy the string so far.",
          why: 'A string cannot be edited in place, so each <code>+=</code> may allocate a new string and copy what is there. Some engines optimise this, so the careful claim is "can be". Pushing the pieces into an array and calling <code>join</code> once copies each character a constant number of times, which is O(n).',
        },
      ],
      answer: "d",
    },
    {
      id: "as-trace-remove-element",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "trace",
      pattern: "in-place-array",
      section: "the-in-place-pattern",
      kind: "single",
      prompt:
        "<p>After this runs, what are <code>kept</code> and <code>nums</code>?</p><pre><code>function removeElement(nums, val) {\n  let write = 0;\n  for (let read = 0; read &lt; nums.length; read++) {\n    if (nums[read] !== val) {\n      nums[write] = nums[read];\n      write++;\n    }\n  }\n  return write;\n}\n\nconst nums = [0, 4, 0, 7, 9, 0, 3];\nconst kept = removeElement(nums, 0);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>kept</code> is 4 and <code>nums</code> is <code>[4, 7, 9, 3, 9, 0, 3]</code>",
          why: "Four values are not 0, and each is copied forward in turn: 4, 7, 9, 3 fill slots 0 to 3. The slots from <code>write</code> on are never touched, so they still hold the old 9, 0 and 3. Only the first <code>kept</code> slots are the answer.",
        },
        {
          id: "b",
          text: "<code>kept</code> is 4 and <code>nums</code> is <code>[4, 7, 9, 3, 0, 0, 0]</code>",
          why: "That would be a function that moves the zeros to the end. This one never writes a zero: it only copies kept values forward and leaves the tail as it was.",
        },
        {
          id: "c",
          text: "<code>kept</code> is 4 and <code>nums</code> is <code>[4, 7, 9, 3]</code>",
          why: "The function never changes <code>nums.length</code>, so the array stays 7 slots long. The caller uses the returned count to know where the real answer ends.",
        },
        {
          id: "d",
          text: "<code>kept</code> is 3 and <code>nums</code> is <code>[4, 7, 9, 3, 9, 0, 3]</code>",
          why: "The array is right, but <code>write</code> is the next free slot, which is one past the last kept value. Because it starts at 0, it is also the number of values kept, which is 4.",
        },
      ],
      answer: "a",
    },
    {
      id: "as-trace-range-sum",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "trace",
      pattern: "in-place-array",
      section: "prefix-sums-turn-o-n-range-queries-into-o-1",
      kind: "single",
      prompt:
        "<p>With <code>nums = [4, 2, 7, 1, 3]</code> and the two functions below, what does <code>rangeSum(buildPrefixSums(nums), 1, 3)</code> return?</p><pre><code>function buildPrefixSums(nums) {\n  const prefix = new Array(nums.length);\n  prefix[0] = nums[0];\n  for (let i = 1; i &lt; nums.length; i++) {\n    prefix[i] = prefix[i - 1] + nums[i];\n  }\n  return prefix;\n}\n\nfunction rangeSum(prefix, left, right) {\n  return left === 0 ? prefix[right] : prefix[right] - prefix[left - 1];\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "6",
          why: "6 is <code>prefix[1]</code>, the sum of the first two numbers. The formula needs <code>prefix[3]</code> and <code>prefix[left - 1]</code>, which is <code>prefix[0]</code>, so <code>prefix[1]</code> is not used at all.",
        },
        {
          id: "b",
          text: "8",
          why: "That is <code>prefix[3] - prefix[1]</code>, which is 14 - 6. It subtracts the total up to <code>left</code>, so it drops <code>nums[1]</code> from the range. The entry to subtract is the one just before <code>left</code>.",
        },
        {
          id: "c",
          text: "10",
          why: "The prefix array is <code>[4, 6, 13, 14, 17]</code>. The sum of indexes 1 to 3 is <code>prefix[3] - prefix[0]</code>, which is 14 - 4 = 10, and indeed 2 + 7 + 1 = 10.",
        },
        {
          id: "d",
          text: "14",
          why: "14 is <code>prefix[3]</code>, the sum of everything up to index 3. It still contains <code>nums[0]</code>, which lies before <code>left</code>, so that part has to be subtracted.",
        },
      ],
      answer: "c",
    },
    {
      id: "as-prefix-left-zero",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "edge-case",
      pattern: "in-place-array",
      section: "prefix-sums-turn-o-n-range-queries-into-o-1",
      kind: "single",
      prompt:
        "<p>A teammate deletes the <code>left === 0</code> special case, so <code>rangeSum</code> always returns <code>prefix[right] - prefix[left - 1]</code>. For <code>prefix = [4, 6, 13, 14, 17]</code>, what does <code>rangeSum(prefix, 0, 2)</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "13",
          why: "13 is the right sum, 4 + 2 + 7, and it is what the original function returns. Without the special case the code subtracts <code>prefix[-1]</code>, which does not hold 0.",
        },
        {
          id: "b",
          text: "It throws a <code>RangeError</code>.",
          why: "Reading an index that does not exist never throws in JavaScript. It evaluates to <code>undefined</code> and the program carries on.",
        },
        {
          id: "c",
          text: "-4",
          why: "That would be 13 - 17, as if <code>prefix[-1]</code> counted from the end of the array the way it does in some other languages. JavaScript does not do that. For that you would need <code>prefix.at(-1)</code>.",
        },
        {
          id: "d",
          text: "<code>NaN</code>",
          why: "<code>prefix[-1]</code> is not an element, because a negative index is just a missing property in JavaScript, so it is <code>undefined</code>. Subtracting <code>undefined</code> from 13 gives <code>NaN</code>. Nothing throws, so the bug passes quietly and can reach the output.",
        },
      ],
      answer: "d",
    },
    {
      id: "as-all-negative-kadane",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "edge-case",
      pattern: "in-place-array",
      section: "kadane-s-algorithm-the-maximum-subarray-in-one-pass",
      kind: "single",
      prompt:
        "<p>A teammate starts Kadane's algorithm with both running values at 0 and loops from index 0, as below. The task is the largest sum of a non-empty contiguous subarray. What does it return for <code>[-5, -2, -8]</code>?</p><pre><code>function maxSubArray(nums) {\n  let bestSoFar = 0;\n  let bestEndingHere = 0;\n  for (let i = 0; i &lt; nums.length; i++) {\n    bestEndingHere = Math.max(nums[i], bestEndingHere + nums[i]);\n    bestSoFar = Math.max(bestSoFar, bestEndingHere);\n  }\n  return bestSoFar;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "-2",
          why: "-2 is the correct answer, the single element <code>[-2]</code>. It is what the version that starts from <code>nums[0]</code> returns, but not this one.",
        },
        {
          id: "b",
          text: "0",
          why: "<code>bestSoFar</code> starts at 0 and every element is negative, so <code>Math.max</code> keeps the 0. No non-empty subarray sums to 0, so the answer is wrong. Starting both values at <code>nums[0]</code> avoids this.",
        },
        {
          id: "c",
          text: "-5",
          why: "-5 is the value of <code>bestEndingHere</code> on the first pass. <code>bestSoFar</code> starts at 0 and only goes up, so it never gets to hold a negative number.",
        },
        {
          id: "d",
          text: "-15",
          why: "-15 is the sum of the whole array. Extending a negative running sum only makes it worse, so Kadane's algorithm restarts instead of extending, and it never takes the sum of everything here.",
        },
      ],
      answer: "b",
    },
    {
      id: "as-order-triple-reversal",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "trace",
      pattern: "in-place-array",
      section: "rotating-an-array-in-o-1-space-the-triple-reversal-trick",
      kind: "order",
      prompt:
        "<p>Rotate <code>[1, 2, 3, 4, 5, 6]</code> to the right by <code>k = 2</code> in O(1) extra space, using the triple-reversal trick. Put the steps in order.</p>",
      items: [
        {
          id: "all",
          text: "Reverse the whole array, giving <code>[6, 5, 4, 3, 2, 1]</code>.",
        },
        {
          id: "first",
          text: "Reverse the first k elements, giving <code>[5, 6, 4, 3, 2, 1]</code>.",
        },
        {
          id: "rest",
          text: "Reverse the remaining elements, giving <code>[5, 6, 1, 2, 3, 4]</code>.",
        },
      ],
      why: "Reversing everything puts the last k elements at the front, in the wrong order. Reversing the first k and then the rest puts both pieces back in their original order, and the result is rotated. Each array shown is the result of the step before it. The full function also starts with <code>k = k % nums.length</code>, because for a k larger than the length the reversal bounds would point past the end of the array.",
    },
    {
      id: "as-shared-rows",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "edge-case",
      pattern: "in-place-array",
      section: "2d-arrays-same-rules-one-more-dimension",
      kind: "single",
      prompt:
        "<p>What does this print?</p><pre><code>const grid = Array(2).fill(Array(3).fill(0));\ngrid[0][0] = 5;\nconsole.log(JSON.stringify(grid));</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[5,0,0],[0,0,0]]</code>",
          why: "That is what you would get if each row were its own array, for example with <code>Array.from({ length: 2 }, () =&gt; Array(3).fill(0))</code>. Here <code>fill</code> is called once.",
        },
        {
          id: "b",
          text: "<code>[[5,5,5],[0,0,0]]</code>",
          why: "The three cells of a row are numbers, which are copied by value, so writing one cell does not change its neighbours. The sharing is between the two rows.",
        },
        {
          id: "c",
          text: "<code>[[5,0,0],[5,0,0]]</code>",
          why: "<code>Array(3).fill(0)</code> runs once, and <code>fill</code> stores that one array in both rows. <code>grid[0]</code> and <code>grid[1]</code> are the same object, so a write through one row shows through the other.",
        },
        {
          id: "d",
          text: "<code>[[5,5,5],[5,5,5]]</code>",
          why: "Only the cell at index 0 of the shared row is assigned. The other cells of that row are still 0, and they stay 0 in the second row too.",
        },
      ],
      answer: "c",
    },
    {
      id: "as-aliasing-and-sort",
      chapter: "dsa-arrays-strings",
      level: "beginner",
      skill: "edge-case",
      pattern: "in-place-array",
      section: "common-gotchas-worth-knowing-cold",
      kind: "multi",
      prompt: "<p>Select every statement that is true in JavaScript.</p>",
      choices: [
        {
          id: "a",
          text: "<code>[10, 2, 1].sort()</code> gives <code>[1, 10, 2]</code>.",
          why: 'Without a comparator, <code>sort</code> compares the values as strings, so "10" comes before "2". Pass <code>(a, b) =&gt; a - b</code> to sort numbers by value.',
        },
        {
          id: "b",
          text: "<code>nums.sort()</code> leaves <code>nums</code> unchanged and returns a sorted copy.",
          why: "<code>sort</code> reorders the array it is called on and returns that same array. Copy first, for example with <code>[...nums].sort()</code>, if the original order matters.",
        },
        {
          id: "c",
          text: "After <code>const b = a; b.push(9);</code>, the array <code>a</code> also ends in 9.",
          why: "Assigning an array copies the reference, not the elements, so <code>a</code> and <code>b</code> are one array. Use <code>[...a]</code> or <code>a.slice()</code> for a shallow copy.",
        },
        {
          id: "d",
          text: "<code>new Array(3).map(() =&gt; 0)</code> returns <code>[0, 0, 0]</code>.",
          why: "<code>new Array(3)</code> makes three empty slots, not three zeros, and <code>map</code> skips empty slots. The result is still three empty slots. <code>new Array(3).fill(0)</code> gives the zeros.",
        },
      ],
      answers: ["a", "c"],
    },
  ],
  pattern: {
    pattern: "in-place-array",
    chapter: "dsa-arrays-strings",
    signals: [
      "The prompt asks for O(1) extra space, or to modify the input array in place.",
      "Remove, move or compact elements while keeping the order of the rest.",
      "Many sum or count queries over ranges of a fixed array.",
      "Find the best contiguous subarray in one pass.",
      "Rotate or reverse part of an array without allocating a second one.",
    ],
    template:
      "<pre><code>function compact(nums, shouldKeep) {\n  let write = 0;\n  for (let read = 0; read &lt; nums.length; read++) {\n    if (shouldKeep(nums[read])) {\n      nums[write] = nums[read];\n      write++;\n    }\n  }\n  return write;\n}</code></pre>",
    time: "O(n)",
    space: "O(1)",
    styles: ["online-assessment", "phone-screen"],
  },
};
