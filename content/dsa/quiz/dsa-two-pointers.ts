import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "tp-sorted-pair",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "recognise",
      pattern: "two-pointers",
      section: "variant-1-opposite-ends-closing-inward",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array of numbers is sorted from smallest to largest. You must say whether two different elements add up to a given target, in O(n) time and with O(1) extra space. Which approach meets both limits?</p>",
      choices: [
        {
          id: "a",
          text: "Put every number in a <code>Set</code> and check whether <code>target - x</code> is already in it.",
          why: "This runs in O(n) time, but the <code>Set</code> grows with the input, so it needs O(n) extra space. It also ignores that the array is sorted, which is what makes O(1) space possible.",
        },
        {
          id: "b",
          text: "Two nested loops that test every pair of positions.",
          why: "This needs only O(1) extra space, but it tests about n²/2 pairs, so the time is O(n²), far over the limit.",
        },
        {
          id: "c",
          text: "One index at each end of the array, moving the left one up when the sum is too small and the right one down when it is too big.",
          why: "Because the array is sorted, a sum that is too small can only be fixed by a bigger left value, and a sum that is too big only by a smaller right value. Every comparison rules out one end for good, so the two indexes meet after at most n − 1 steps, using just two variables.",
        },
        {
          id: "d",
          text: "For each element, binary search the rest of the array for <code>target - x</code>.",
          why: "This is correct and uses O(1) extra space, but n binary searches of O(log n) each cost O(n log n) in total, which is over the O(n) limit.",
        },
      ],
      answer: "c",
    },
    {
      id: "tp-in-place-dedupe",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "recognise",
      pattern: "two-pointers",
      section: "variant-2-fast-slow-same-direction",
      placement: true,
      kind: "single",
      prompt:
        "<p>A sorted array contains repeated values. You must overwrite the front of that same array with each distinct value once, in order, and return how many distinct values there are, without allocating another array. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Loop over the array and call <code>splice</code> to delete each duplicate as it is found.",
          why: "This works in place, but every <code>splice</code> can move all the later elements down by one, so a single call can cost O(n) and the whole loop O(n²). Deleting while you loop also makes it easy to skip an element.",
        },
        {
          id: "b",
          text: "Build a <code>Set</code> of the values, then copy it back into the array.",
          why: "The <code>Set</code> holds up to n values, so this breaks the rule against allocating extra space.",
        },
        {
          id: "c",
          text: "Put one pointer at each end of the array and move them toward each other until they meet.",
          why: "Closing inward suits a question about a pair of values. Here every element must be compared with its neighbour in order, so both pointers have to travel from the front toward the back.",
        },
        {
          id: "d",
          text: "Two pointers that both start at the front: a read pointer scans every element, and a write pointer moves forward only when the read pointer finds a new value.",
          why: "The write pointer marks where the next distinct value belongs, and the read pointer never goes backward. Each element is looked at once, so the time is O(n) and the extra space is O(1).",
        },
      ],
      answer: "d",
    },
    {
      id: "tp-when-valid",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "recognise",
      pattern: "two-pointers",
      section: "variant-3-palindrome-mirror-check",
      kind: "multi",
      prompt:
        "<p>The opposite-ends scan from <code>twoSumSorted</code> is about to be used. Select every situation where its answer can be trusted.</p>",
      choices: [
        {
          id: "a",
          text: "The array is sorted ascending and you need the two values that add up to the target.",
          why: "This is the case the scan is built for. Moving a pointer past a value never throws away a pair that could have worked, because every skipped pair is provably too small or too big.",
        },
        {
          id: "b",
          text: "The array is unsorted, you run the scan on it as it is, and you trust <code>[-1, -1]</code> to mean there is no pair.",
          why: "On unsorted data a pointer can discard a value that does have a partner, so a result of <code>[-1, -1]</code> can be wrong even though no error is raised. <code>twoSumSorted([5, 1, 9, 4], 5)</code> is one such case.",
        },
        {
          id: "c",
          text: "The array is unsorted, you only need the two values, and you sort it before scanning.",
          why: "Sorting costs O(n log n) once, and after it the scan is valid. Since only the values are wanted, nothing needed is lost by reordering.",
        },
        {
          id: "d",
          text: "The array is unsorted, you need the original positions of the pair, and you sort it in place and return the positions the scan reports.",
          why: "Sorting moves the elements, so the positions the scan reports belong to the sorted array, not to the one you were given. Sorting is only safe when it does not destroy information you still need, such as original indices.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "tp-unsorted-silent",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "edge-case",
      pattern: "two-pointers",
      section: "the-shape-of-the-pattern",
      kind: "single",
      prompt:
        "<p>Here <code>twoSumSorted</code> is called on an array that is not sorted. The values 1 and 4 do add up to 5. What happens?</p><pre><code>function twoSumSorted(nums, target) {\n  let left = 0, right = nums.length - 1;\n  while (left &lt; right) {\n    const sum = nums[left] + nums[right];\n    if (sum === target) return [left, right];\n    if (sum &lt; target) left++;\n    else right--;\n  }\n  return [-1, -1];\n}\n\ntwoSumSorted([5, 1, 9, 4], 5);</code></pre>",
      choices: [
        {
          id: "a",
          text: "It returns <code>[-1, -1]</code>, with no error, even though a pair exists.",
          why: "The sums are 9, 14 and 6, all too big, so <code>right</code> keeps moving down and throws away 4, 9 and 1 in turn. The logic assumes the right end is the largest value, which is false here. Nothing in the code can detect the unsorted input, so the wrong answer arrives silently.",
        },
        {
          id: "b",
          text: "It returns <code>[1, 3]</code>, because the pointers eventually test every pair.",
          why: "The pointers never test every pair. Each step moves one pointer for good, so the loop looks at no more than n − 1 pairs, and the pair at positions 1 and 3 is never one of them.",
        },
        {
          id: "c",
          text: "It throws an error, because the input is not sorted.",
          why: "JavaScript does not check that an array is sorted, and the function does not either. It runs normally and returns a value.",
        },
        {
          id: "d",
          text: "It never finishes, because the pointers cannot meet on unsorted data.",
          why: "Each pass moves one of the pointers one step closer, whatever the values are, so <code>left &lt; right</code> is false after at most n − 1 passes. The loop always ends. The danger is that it ends with a wrong answer.",
        },
      ],
      answer: "a",
    },
    {
      id: "tp-self-pair",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "edge-case",
      pattern: "two-pointers",
      section: "variant-1-opposite-ends-closing-inward",
      kind: "single",
      prompt:
        "<p>A teammate changes the loop test of <code>twoSumSorted</code> from <code>left &lt; right</code> to <code>left &lt;= right</code> and touches nothing else. No two different elements of <code>[1, 3, 8]</code> add up to 6. What does <code>twoSumSorted([1, 3, 8], 6)</code> return now?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[-1, -1]</code>, the same as before the change",
          why: "Before the change it did return <code>[-1, -1]</code>. With <code>&lt;=</code> the loop gets one more pass, on the single position where the pointers meet, and that pass can report a match.",
        },
        {
          id: "b",
          text: "<code>[1, 1]</code>, which pairs the 3 with itself",
          why: "The first pass gives 1 + 8 = 9, so <code>right</code> drops to 1. The next gives 1 + 3 = 4, so <code>left</code> rises to 1. With both pointers at position 1 the sum is 3 + 3 = 6, which equals the target. The loop must stop when the pointers meet, because a pair needs two different elements.",
        },
        {
          id: "c",
          text: "It never finishes, because the pointers can sit on the same position",
          why: "Every pass still moves one pointer. When both sit on one position, a sum that does not match moves one of them past the other and the loop ends.",
        },
        {
          id: "d",
          text: "It throws a <code>RangeError</code>, because the pointers cross",
          why: "Pointers that cross never cause an error in JavaScript. The loop test simply becomes false and the loop ends.",
        },
      ],
      answer: "b",
    },
    {
      id: "tp-trace-pairs",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "trace",
      pattern: "two-pointers",
      section: "variant-1-opposite-ends-closing-inward",
      kind: "single",
      prompt:
        "<p>Run <code>twoSumSorted</code> from the chapter on a new array and target. How many sums does the loop compute, and what does the call return?</p><pre><code>twoSumSorted([1, 4, 6, 8, 11, 15], 14);</code></pre>",
      choices: [
        {
          id: "a",
          text: "5 sums, and it returns <code>[6, 8]</code>",
          why: "The pair that works is the values 6 and 8, but the function returns their positions, not the values themselves.",
        },
        {
          id: "b",
          text: "4 sums, and it returns <code>[2, 3]</code>",
          why: "The final answer is right, but the loop computes one more sum than this. Count the starting pair as the first one.",
        },
        {
          id: "c",
          text: "5 sums, and it returns <code>[2, 3]</code>",
          why: "The pairs tested, as positions, are (0, 5) giving 16, (0, 4) giving 12, (1, 4) giving 15, (1, 3) giving 12 and (2, 3) giving 14. That is 5 sums, and the last one matches, so it returns <code>[2, 3]</code>.",
        },
        {
          id: "d",
          text: "6 sums, and it returns <code>[-1, -1]</code>",
          why: "A pair does exist, 6 and 8, and the scan reaches it. It stops with a match, not at the point where the pointers meet.",
        },
      ],
      answer: "c",
    },
    {
      id: "tp-trace-dedupe",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "trace",
      pattern: "two-pointers",
      section: "variant-2-fast-slow-same-direction",
      kind: "single",
      prompt:
        "<p>Run the chapter's in-place <code>removeDuplicates</code>. What does it return, and what does <code>nums</code> hold afterwards?</p><pre><code>function removeDuplicates(nums) {\n  if (nums.length === 0) return 0;\n  let slow = 0;\n  for (let fast = 1; fast &lt; nums.length; fast++) {\n    if (nums[fast] !== nums[slow]) {\n      slow++;\n      nums[slow] = nums[fast];\n    }\n  }\n  return slow + 1;\n}\n\nconst nums = [1, 1, 2, 2, 2, 3, 5, 5];\nremoveDuplicates(nums);</code></pre>",
      choices: [
        {
          id: "a",
          text: "It returns 4, and <code>nums</code> is <code>[1, 2, 3, 5]</code>.",
          why: "The function never changes the length of the array, so it still has 8 elements. Only the first 4 are meaningful, and the count it returns tells you where they end.",
        },
        {
          id: "b",
          text: "It returns 4, and <code>nums</code> is <code>[1, 2, 3, 5, 2, 3, 5, 5]</code>.",
          why: "<code>slow</code> ends at 3, so it returns 4. The writes happen at positions 1, 2 and 3 as <code>fast</code> meets 2, 3 and 5. The tail, positions 4 to 7, is left as it was, which is why the caller must use the returned count and not the array length.",
        },
        {
          id: "c",
          text: "It returns 4, and <code>nums</code> is <code>[1, 2, 3, 5, 5, 5, 5, 5]</code>.",
          why: "Nothing writes to the positions after <code>slow</code>, so they are not filled with the last value. They keep what they held before the call.",
        },
        {
          id: "d",
          text: "It returns 3, and <code>nums</code> is <code>[1, 2, 3, 5, 2, 3, 5, 5]</code>.",
          why: "The array is right, but <code>slow</code> is a position, and it ends at 3. The number of distinct values is one more than that, which is why the function returns <code>slow + 1</code>.",
        },
      ],
      answer: "b",
    },
    {
      id: "tp-order-scan",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "trace",
      pattern: "two-pointers",
      section: "variant-2-fast-slow-same-direction",
      kind: "order",
      prompt:
        "<p>Put one pass of the <code>removeDuplicates</code> loop in the order it happens, for a pass where the value at <code>fast</code> is new. Start at the comparison and end with the loop moving on to the next index.</p>",
      items: [
        {
          id: "compare",
          text: "Compare <code>nums[fast]</code> with <code>nums[slow]</code> and see that they differ.",
        },
        { id: "grow", text: "Advance <code>slow</code> by one, to the next position that is free to write." },
        { id: "copy", text: "Copy <code>nums[fast]</code> into <code>nums[slow]</code>." },
        { id: "advance", text: "The loop moves <code>fast</code> forward to the next index." },
      ],
      why: "The comparison comes first because it is what decides that this element is new. <code>slow</code> marks the last confirmed distinct value, so it has to advance before the copy. Copying first would overwrite the value that <code>slow</code> is protecting. The loop moves <code>fast</code> on only after the body of the pass is finished.",
    },
    {
      id: "tp-steps-bound",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "complexity",
      pattern: "two-pointers",
      section: "variant-1-opposite-ends-closing-inward",
      kind: "single",
      prompt:
        "<p>Look at the loop of <code>twoSumSorted</code> on a sorted array of n elements. Which statement describes its running time?</p><pre><code>while (left &lt; right) {\n  const sum = nums[left] + nums[right];\n  if (sum === target) return [left, right];\n  if (sum &lt; target) left++;\n  else right--;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "Each pass moves one pointer one step toward the other, so the gap of n − 1 closes in at most n − 1 passes, which is O(n).",
          why: "The gap between the pointers starts at n − 1 and shrinks by exactly one on every pass that does not return. The loop ends when it reaches 0. This is also the case with no matching pair, which is the worst case.",
        },
        {
          id: "b",
          text: "Every element may be paired with every later one, so the worst case takes about n²/2 passes.",
          why: "That is the cost of the nested-loop version. The sorted order is what lets one comparison rule out a whole end, so the pointers test only n − 1 pairs.",
        },
        {
          id: "c",
          text: "It takes about log n passes, because each comparison halves the range.",
          why: "That is binary search. Here a comparison discards only one element, the one at the end whose partner would be too small or too big, so the range shrinks by one, not by half.",
        },
        {
          id: "d",
          text: "It is O(n) when a pair exists, but when no pair exists the scan must start over and takes O(n²).",
          why: "The scan never starts over. The pointers only move toward each other, so the case with no pair is the one that uses all n − 1 passes, and that is still O(n).",
        },
      ],
      answer: "a",
    },
    {
      id: "tp-triple-cost",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "complexity",
      pattern: "two-pointers",
      section: "how-to-recognize-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>This function asks whether any three elements add up to <code>target</code>. For an array of n numbers, what is its running time?</p><pre><code>function hasTriple(nums, target) {\n  nums.sort((a, b) =&gt; a - b);\n  for (let i = 0; i &lt; nums.length - 2; i++) {\n    let left = i + 1, right = nums.length - 1;\n    while (left &lt; right) {\n      const sum = nums[i] + nums[left] + nums[right];\n      if (sum === target) return true;\n      if (sum &lt; target) left++;\n      else right--;\n    }\n  }\n  return false;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n log n)",
          why: "That is the cost of the sort alone. The loop over <code>i</code> runs about n times, and each of those runs a scan that can take O(n).",
        },
        {
          id: "b",
          text: "O(n²)",
          why: "The sort costs O(n log n), once. The outer loop runs about n times, and each inner scan makes at most n passes, so the loops add up to O(n²). That outweighs the sort, so the total is O(n²).",
        },
        {
          id: "c",
          text: "O(n³)",
          why: "That is the cost of three nested loops that try every triple. The two-pointer scan replaces the two inner loops with one linear pass.",
        },
        {
          id: "d",
          text: "O(n² log n)",
          why: "The sort is not inside the loop. It runs once, so its O(n log n) is added to the loops' cost, not multiplied by it.",
        },
      ],
      answer: "b",
    },
    {
      id: "tp-splice-cost",
      chapter: "dsa-two-pointers",
      level: "beginner",
      skill: "complexity",
      pattern: "two-pointers",
      section: "variant-2-fast-slow-same-direction",
      kind: "single",
      prompt:
        "<p>This function also removes duplicates from a sorted array in place, and it gives correct answers. On a sorted array of n equal values, why is it slow compared with the chapter's fast and slow version?</p><pre><code>function dedupeWithSplice(nums) {\n  let i = 1;\n  while (i &lt; nums.length) {\n    if (nums[i] === nums[i - 1]) nums.splice(i, 1);\n    else i++;\n  }\n  return nums.length;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "Each <code>splice</code> can shift every later element down by one, so up to n splices cost O(n²) in total.",
          why: "Removing an element from the middle leaves a gap that the later elements must move to fill, so one <code>splice</code> can take O(n). With n equal values the loop removes almost every element, so the cost can reach O(n²). The read and write pointers move each element at most once.",
        },
        {
          id: "b",
          text: "Each <code>splice</code> builds a brand-new array, so the function uses O(n²) extra space.",
          why: "<code>splice</code> changes the array it is called on. It returns the removed elements, which here is just one value each time, so the extra space stays small.",
        },
        {
          id: "c",
          text: "After every <code>splice</code> the loop starts again from index 0.",
          why: "<code>i</code> is not reset. It stays where it is, because the next element has just moved into position <code>i</code>.",
        },
        {
          id: "d",
          text: "Comparing <code>nums[i]</code> with <code>nums[i - 1]</code> costs O(n) because both are looked up by position.",
          why: "Reading an element by index takes O(1) time. The cost comes from <code>splice</code>, not from the comparison.",
        },
      ],
      answer: "a",
    },
  ],
  pattern: {
    pattern: "two-pointers",
    chapter: "dsa-two-pointers",
    signals: [
      "The input is sorted, or can be sorted without losing information the answer needs.",
      "The prompt asks for a pair or triplet with a given sum, or for the closest sum to a target.",
      "A brute force would use nested loops over pairs of positions.",
      "The prompt asks for in-place work with O(1) extra space, such as removing duplicates or partitioning.",
      "The prompt asks whether a string reads the same from both ends.",
    ],
    template:
      "<pre><code>let left = 0, right = nums.length - 1;\nwhile (left &lt; right) {\n  const sum = nums[left] + nums[right];\n  if (sum === target) return [left, right];\n  if (sum &lt; target) left++;\n  else right--;\n}</code></pre>",
    time: "O(n), plus O(n log n) when the input must be sorted first",
    space: "O(1)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
