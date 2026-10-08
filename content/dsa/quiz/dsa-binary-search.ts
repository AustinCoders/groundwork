import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "bs-sorted-input",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "recognise",
      pattern: "binary-search",
      section: "the-core-idea",
      placement: true,
      kind: "single",
      prompt:
        "<p>You need to find a value in an array. The classic <code>binarySearch</code> template is written for ascending order. Which array can you hand it and trust the answer?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[8, 3, 12, 5, 20]</code>",
          why: "Nothing here is in order, so after comparing with the middle element you cannot tell which half the target is in. The search may still return the right index for some targets, but nothing guarantees it.",
        },
        {
          id: "b",
          text: "<code>[20, 12, 8, 5, 3]</code>",
          why: "This array is sorted, but descending. The template sends the search right when <code>sorted[mid] &lt; target</code>, which is the wrong direction here, so it would discard the half that holds the target.",
        },
        {
          id: "c",
          text: "<code>[3, 5, 8, 12, 20]</code>",
          why: "It is sorted from smallest to largest, so every comparison with the middle element tells you which half can be thrown away. That is the property the template relies on.",
        },
        {
          id: "d",
          text: "<code>[3, 12, 5, 20, 8]</code>",
          why: "The values go up and down, so one comparison with the middle element says nothing about either half. Sort the array first, or use a different approach.",
        },
      ],
      answer: "c",
    },
    {
      id: "bs-spot-the-answer-space",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "recognise",
      pattern: "binary-search",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>A problem asks for the smallest ship capacity that moves all the packages within D days. For any capacity you can count the days it needs with one pass over the packages. Which approach fits best?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the packages by weight, then binary search for the capacity inside that sorted list.",
          why: "The best capacity is usually not the weight of any single package, so there is nothing to find inside the sorted list. Sorting does not give the capacities the ordering that binary search needs either.",
        },
        {
          id: "b",
          text: "Skip binary search, because it only works when the input itself is in sorted order.",
          why: "Binary search needs a monotonic question, not a sorted input. Here the question is whether this capacity works, and it is monotonic in the capacity.",
        },
        {
          id: "c",
          text: "Try capacities from 1 upward, running the one-pass check on each, and return the first one that works.",
          why: "This gives the right answer, but it takes a pass for every capacity it tries, which is linear in the range. A monotonic question can be searched with far fewer passes.",
        },
        {
          id: "d",
          text: "Binary search over the capacity, since a capacity that works means every larger one works too.",
          why: "Whether a capacity works only flips once, from no to yes, as the capacity grows. That monotonic yes or no is all binary search needs, so each pass halves the range of capacities left.",
        },
      ],
      answer: "d",
    },
    {
      id: "bs-which-task",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "recognise",
      pattern: "binary-search",
      section: "the-core-idea",
      placement: true,
      kind: "single",
      prompt: "<p>Which of these tasks is a good fit for binary search?</p>",
      choices: [
        {
          id: "a",
          text: "Counting how many times each word appears in a long text.",
          why: "This needs a pass over every word and a place to keep the counts, which is a job for a hash map. There is no half of the data to rule out.",
        },
        {
          id: "b",
          text: "Looking up one name in a phone book that is sorted alphabetically.",
          why: "Opening the book in the middle tells you whether the name comes before or after that page, so half of the book can be set aside at every step. That is exactly what binary search does.",
        },
        {
          id: "c",
          text: "Finding the largest number in a list that is in no particular order.",
          why: "Without any order, no single comparison rules out half of the list. You have to look at every number once.",
        },
        {
          id: "d",
          text: "Reversing a linked list so that its last node comes first.",
          why: "Reversing rewires every node once. There is no value being searched for and nothing to halve.",
        },
      ],
      answer: "b",
    },
    {
      id: "bs-million-comparisons",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "complexity",
      pattern: "binary-search",
      section: "the-template-that-avoids-off-by-one-bugs",
      kind: "single",
      prompt:
        "<p>A sorted array holds 1,000,000 numbers. Roughly how many comparisons can <code>binarySearch</code> need in the worst case?</p>",
      choices: [
        {
          id: "a",
          text: "About 20",
          why: "Each comparison halves the range, and 2 to the power 20 is just over a million, so about 20 halvings leave one element. That is the O(log n) in action.",
        },
        {
          id: "b",
          text: "About 1,000",
          why: "That is the square root of a million. Binary search does far better than that, because every comparison throws away half of what is left.",
        },
        {
          id: "c",
          text: "About 500,000",
          why: "Half of n is what a linear scan needs on average. Binary search halves the range on every step instead of removing one element at a time.",
        },
        {
          id: "d",
          text: "About 1,000,000",
          why: "That is the worst case of a linear scan, one comparison for every element. Binary search needs only about log base 2 of n.",
        },
      ],
      answer: "a",
    },
    {
      id: "bs-answer-search-cost",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "complexity",
      pattern: "binary-search",
      section: "binary-search-on-the-answer-not-the-array",
      kind: "single",
      prompt:
        "<p>Here <code>piles</code> has n numbers and the largest pile is M. Which is the tightest bound on the running time?</p><pre><code>function minEatingSpeed(piles, h) {\n  function hoursNeeded(speed) {\n    let hours = 0;\n    for (const pile of piles) hours += Math.ceil(pile / speed);\n    return hours;\n  }\n\n  let lo = 1, hi = Math.max(...piles);\n  while (lo &lt; hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (hoursNeeded(mid) &lt;= h) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(log M)",
          why: "That counts the halvings of the speed range but forgets that every check, <code>hoursNeeded</code>, walks all n piles.",
        },
        {
          id: "b",
          text: "O(n · M)",
          why: "This is what trying every speed from 1 to M would cost, with one O(n) check each. Binary search tries only about log M of them, so this is an upper bound but not the tightest.",
        },
        {
          id: "c",
          text: "O(n log M)",
          why: "The speed range from 1 to M halves about log M times, and each of those steps runs <code>hoursNeeded</code>, which costs O(n). Finding the largest pile costs one more O(n).",
        },
        {
          id: "d",
          text: "O(n log n)",
          why: "Nothing here is sorted, and the loop is driven by the range of speeds, M, not by the number of piles.",
        },
      ],
      answer: "c",
    },
    {
      id: "bs-mid-needs-floor",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "edge-case",
      pattern: "binary-search",
      section: "the-template-that-avoids-off-by-one-bugs",
      kind: "single",
      prompt:
        "<p>A teammate writes the midpoint as below, and the search has narrowed to <code>lo = 3</code> and <code>hi = 6</code>. In JavaScript, what goes wrong?</p><pre><code>const sorted = [10, 20, 30, 40, 50, 60, 70, 80];\nlet lo = 3, hi = 6;\nconst mid = (lo + hi) / 2;\nif (sorted[mid] === target) return mid;</code></pre>",
      choices: [
        {
          id: "a",
          text: "The sum 3 + 6 overflows, so <code>mid</code> comes out negative.",
          why: "That is a real hazard in languages with 32-bit integers, but JavaScript numbers are doubles, so 3 + 6 never overflows. The problem here is different.",
        },
        {
          id: "b",
          text: "<code>mid</code> is silently rounded up to 5, so <code>sorted[5]</code> is read.",
          why: "JavaScript never rounds a division for you. The result is the exact 4.5, not 5.",
        },
        {
          id: "c",
          text: "JavaScript throws a <code>RangeError</code> because <code>mid</code> is not a whole number.",
          why: "Reading an index that is not a whole number does not throw. It quietly gives <code>undefined</code>.",
        },
        {
          id: "d",
          text: "<code>mid</code> is 4.5, so <code>sorted[mid]</code> is <code>undefined</code>.",
          why: "Division in JavaScript does not round, so 9 / 2 is 4.5. An array has no element at 4.5, so the comparisons stop meaning anything and the search goes wrong from there. Wrap the division in <code>Math.floor</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "bs-lo-less-than-hi",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "edge-case",
      pattern: "binary-search",
      section: "the-template-that-avoids-off-by-one-bugs",
      kind: "single",
      prompt:
        "<p>The template's loop line is changed from <code>while (lo &lt;= hi)</code> to <code>while (lo &lt; hi)</code>, and the rest stays the same, including <code>return -1</code> after the loop. What does <code>binarySearch([7], 7)</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "-1, although 7 is in the array",
          why: "The last candidate is when <code>lo === hi</code>, and <code>&lt;</code> skips it. With one element, <code>lo</code> and <code>hi</code> are both 0, so the loop exits without ever looking at 7 and falls through to <code>return -1</code>.",
        },
        {
          id: "b",
          text: "0, because the single element is found at index 0",
          why: "Index 0 is where 7 sits, but the function never gets to report it. The loop body is not reached, because <code>lo &lt; hi</code> is false at once.",
        },
        {
          id: "c",
          text: "It loops forever, because <code>lo</code> and <code>hi</code> never change",
          why: "The loop condition is false on the first check, so it ends at once. Endless loops come from a bound that never moves while the condition stays true, not from this change.",
        },
        {
          id: "d",
          text: "It throws an error, because the loop never runs",
          why: "Nothing in the code throws. The loop is skipped and the function returns normally.",
        },
      ],
      answer: "a",
    },
    {
      id: "bs-loop-that-never-ends",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "edge-case",
      pattern: "binary-search",
      section: "the-template-that-avoids-off-by-one-bugs",
      kind: "multi",
      prompt:
        "<p>Each change below is made to the classic template on its own, with every other line left as it is. Select every change that can make the loop run forever.</p>",
      choices: [
        {
          id: "a",
          text: "Compute <code>mid</code> as <code>(lo + hi) &gt;&gt; 1</code> instead of <code>lo + Math.floor((hi - lo) / 2)</code>.",
          why: "Both forms round down, so the range still shrinks on every pass. In JavaScript, <code>&gt;&gt; 1</code> first truncates the sum to a 32-bit integer, which is harmless for any realistic array. The form that stays safe in every language is <code>lo + Math.floor((hi - lo) / 2)</code>, the one in the template.",
        },
        {
          id: "b",
          text: "Write the else branch as <code>hi = mid</code> instead of <code>hi = mid - 1</code>.",
          why: "When <code>lo === hi</code> and <code>sorted[mid]</code> is larger than the target, <code>hi</code> stays where it is. <code>lo &lt;= hi</code> is still true, nothing moves, and the loop repeats forever.",
        },
        {
          id: "c",
          text: "Test <code>sorted[mid] &lt; target</code> first and <code>sorted[mid] === target</code> second.",
          why: "The three outcomes are still handled exactly once each, and each non-matching one still moves a bound past <code>mid</code>. The order of the tests does not matter.",
        },
        {
          id: "d",
          text: "Write the smaller branch as <code>lo = mid</code> instead of <code>lo = mid + 1</code>.",
          why: "With <code>lo = 0</code>, <code>hi = 1</code> and a target larger than both, <code>mid</code> is 0 and <code>lo</code> is set to 0 again. The range never shrinks, so the loop repeats forever.",
        },
      ],
      answers: ["b", "d"],
    },
    {
      id: "bs-trace-the-mids",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "trace",
      pattern: "binary-search",
      section: "the-template-that-avoids-off-by-one-bugs",
      kind: "single",
      prompt:
        "<p>The classic template searches <code>[2, 5, 8, 12, 16, 23, 38, 56, 72, 91]</code> for the target <code>38</code>. Which indexes does <code>mid</code> take, in order, until it returns?</p>",
      choices: [
        {
          id: "a",
          text: "4, 7, 6",
          why: "After <code>hi</code> becomes 6, <code>lo</code> is 5, and the middle of 5 to 6 rounds down to 5, not up to 6. This answer skips the probe at index 5.",
        },
        {
          id: "b",
          text: "4, 7, 5, 6",
          why: "Index 4 holds 16, which is too small, so <code>lo</code> becomes 5. Index 7 holds 56, which is too large, so <code>hi</code> becomes 6. Index 5 holds 23, which is too small, so <code>lo</code> becomes 6. Index 6 holds 38, which is the target.",
        },
        {
          id: "c",
          text: "5, 8, 7, 6",
          why: "The first range is 0 to 9, and 9 / 2 rounded down is 4, not 5. The template uses <code>Math.floor</code>, so every middle leans left.",
        },
        {
          id: "d",
          text: "4, 7, 5",
          why: "Index 5 holds 23, not 38, so the search is not over. <code>lo</code> becomes 6 and one more probe, at index 6, finds the target.",
        },
      ],
      answer: "b",
    },
    {
      id: "bs-order-one-pass",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "trace",
      pattern: "binary-search",
      section: "binary-search-on-the-answer-not-the-array",
      kind: "order",
      prompt:
        "<p>Put one pass through the loop of <code>minEatingSpeed</code> in the order it happens, starting from the loop test that lets the pass begin.</p><pre><code>function minEatingSpeed(piles, h) {\n  function hoursNeeded(speed) {\n    let hours = 0;\n    for (const pile of piles) hours += Math.ceil(pile / speed);\n    return hours;\n  }\n\n  let lo = 1, hi = Math.max(...piles);\n  while (lo &lt; hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (hoursNeeded(mid) &lt;= h) hi = mid;\n    else lo = mid + 1;\n  }\n  return lo;\n}</code></pre>",
      items: [
        { id: "test", text: "Test <code>lo &lt; hi</code> to see whether the range still holds more than one speed." },
        {
          id: "mid",
          text: "Compute <code>mid</code>, the middle speed of the range from <code>lo</code> to <code>hi</code>.",
        },
        { id: "check", text: "Call <code>hoursNeeded(mid)</code> to count the hours that speed takes." },
        { id: "compare", text: "Compare that count with <code>h</code>." },
        {
          id: "move",
          text: "Set <code>hi = mid</code> if the speed works, or <code>lo = mid + 1</code> if it does not.",
        },
      ],
      why: "The loop test comes first because it decides whether the pass runs at all. Each later step needs the result of the one before it: the check needs <code>mid</code>, the comparison needs the hours, and the bound that moves depends on the comparison.",
    },
    {
      id: "bs-first-of-the-duplicates",
      chapter: "dsa-binary-search",
      level: "beginner",
      skill: "edge-case",
      pattern: "binary-search",
      section: "finding-a-boundary-first-last-occurrence",
      kind: "single",
      prompt:
        "<p>What does <code>lowerBound([1, 2, 2, 2, 3], 2)</code> return?</p><pre><code>function lowerBound(nums, target) {\n  let lo = 0, hi = nums.length;\n  while (lo &lt; hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (nums[mid] &lt; target) lo = mid + 1;\n    else hi = mid;\n  }\n  return lo;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "-1",
          why: "<code>lowerBound</code> never returns -1. It returns an insertion point, and here the target is present, so the point is the index of its first copy.",
        },
        {
          id: "b",
          text: "1",
          why: "<code>lowerBound</code> finds the leftmost index whose value is at least the target. The first 2 sits at index 1. Following it: <code>hi</code> goes 5, 2, 1 while <code>lo</code> reaches 1 and the range closes.",
        },
        {
          id: "c",
          text: "2",
          why: "Index 2 is the middle 2, and it is what the classic <code>binarySearch</code> returns on its first probe. <code>lowerBound</code> keeps going left with <code>hi = mid</code> instead of stopping on a match.",
        },
        {
          id: "d",
          text: "3",
          why: "That is the last 2. Reaching it would need the search to move right on a match, but a match sets <code>hi = mid</code>.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "binary-search",
    chapter: "dsa-binary-search",
    signals: [
      "The data is sorted, or the answer space is monotonic: if X works, X + 1 works too.",
      "The prompt asks for the minimum or maximum value such that something holds.",
      "A brute force would try every candidate in turn, and a fast check says whether one candidate works.",
      "The prompt asks for O(log n) time.",
    ],
    template:
      "<pre><code>function binarySearch(sorted, target) {\n  let lo = 0, hi = sorted.length - 1;\n  while (lo &lt;= hi) {\n    const mid = lo + Math.floor((hi - lo) / 2);\n    if (sorted[mid] === target) return mid;\n    if (sorted[mid] &lt; target) lo = mid + 1;\n    else hi = mid - 1;\n  }\n  return -1;\n}</code></pre>",
    time: "O(log n)",
    space: "O(1)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
