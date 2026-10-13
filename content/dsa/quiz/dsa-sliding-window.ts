import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "sw-spot-fixed",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "recognise",
      pattern: "sliding-window",
      section: "the-insight-don-t-recompute-adjust",
      placement: true,
      kind: "single",
      prompt:
        "<p>A shop keeps its takings for n days in an array. Given a number k, which can be as large as n / 2, you must report the highest total over any k days in a row. Which approach is best?</p>",
      choices: [
        {
          id: "a",
          text: "For every start day, add up its k days from scratch and keep the biggest total.",
          why: "This is correct, but each window costs k additions and there are about n windows, so the time is O(n · k). Neighbouring windows share all but one day each, and this approach throws that overlap away.",
        },
        {
          id: "b",
          text: "Sort the takings and add up the k largest values.",
          why: "Sorting breaks the order of the days, and the k largest days are usually not next to each other. The question is about days in a row, so the answer can be smaller than this total.",
        },
        {
          id: "c",
          text: "Put one pointer at each end of the array and move them toward each other.",
          why: "Pointers closing inward look for a pair, not for a block of k neighbours. They never form a window of a fixed size.",
        },
        {
          id: "d",
          text: "Add up the first k days once, then move one day at a time: add the new day, subtract the day that left, and keep the best total.",
          why: "Moving the window one step changes only two values, so each update is O(1) and the whole scan is O(n), however large k is.",
        },
      ],
      answer: "d",
    },
    {
      id: "sw-spot-variable",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "recognise",
      pattern: "sliding-window",
      section: "variable-size-window-the-more-common-interview-shape",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array holds only positive whole numbers. You are given a target and must find the length of the shortest run of neighbouring elements whose sum is at least the target. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "A window of one fixed size k, slid across the array once.",
          why: "The answer is the length you are looking for, so you do not know k in advance. A fixed window only answers the question for a size you already have.",
        },
        {
          id: "b",
          text: "A window that grows on the right until its sum reaches the target, then shrinks from the left for as long as the sum still reaches it.",
          why: "Because every number is positive, growing the window raises the sum and shrinking it lowers the sum, so the two moves never need to be undone. Each end only moves forward, so the scan is O(n).",
        },
        {
          id: "c",
          text: "Sort the numbers from largest to smallest and add them up until the target is reached.",
          why: "The largest numbers are usually not neighbours in the array, so this answers a different question. It also loses the positions the problem depends on.",
        },
        {
          id: "d",
          text: "Store each number in a hash map and look up <code>target - x</code> for every element.",
          why: "That finds two elements that add up to the target. The question is about a run of any length, whose sum is not made of just two elements.",
        },
      ],
      answer: "b",
    },
    {
      id: "sw-which-fit",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "recognise",
      pattern: "sliding-window",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "multi",
      prompt: "<p>Select every task that a sliding window can solve in one pass.</p>",
      choices: [
        {
          id: "a",
          text: "Count the pairs of values, anywhere in an array, that add up to a target.",
          why: "The two values of a pair can sit anywhere in the array, so they do not form one contiguous stretch. A window only covers neighbouring elements. A hash map suits this task.",
        },
        {
          id: "b",
          text: "Find the longest substring that contains at most two different letters.",
          why: "It asks for the longest contiguous stretch, and a small map of letter counts can be updated as one letter enters and one leaves. When a third letter appears, the left end shrinks until only two remain.",
        },
        {
          id: "c",
          text: "Find the highest total of any six readings in a row.",
          why: "This is a fixed-size window. Each step adds the newest reading and subtracts the one that left, so the total is never rebuilt.",
        },
        {
          id: "d",
          text: "Find the longest subsequence in which each number is bigger than the one before it, gaps allowed.",
          why: "A subsequence may skip elements, so it is not one contiguous block. A window cannot skip elements, which is why the words subsequence and gaps allowed rule it out.",
        },
      ],
      answers: ["b", "c"],
    },
    {
      id: "sw-trace-unique",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "trace",
      pattern: "sliding-window",
      section: "variable-size-window-the-more-common-interview-shape",
      kind: "single",
      prompt:
        '<p>Run the chapter\'s <code>longestUniqueSubstring</code> on a new string. What does the call return, and where does <code>left</code> end up?</p><pre><code>function longestUniqueSubstring(s) {\n  const lastSeen = new Map();\n  let left = 0, best = 0;\n\n  for (let right = 0; right &lt; s.length; right++) {\n    const c = s[right];\n    if (lastSeen.has(c) &amp;&amp; lastSeen.get(c) &gt;= left) {\n      left = lastSeen.get(c) + 1;\n    }\n    lastSeen.set(c, right);\n    best = Math.max(best, right - left + 1);\n  }\n  return best;\n}\n\nlongestUniqueSubstring("dvdfa");</code></pre>',
      choices: [
        {
          id: "a",
          text: "It returns 3, and <code>left</code> ends at 2.",
          why: "This would be the result if <code>left</code> jumped to the repeated letter itself. The code moves it to one past the old copy, which here is index 1, so the window <code>vdfa</code> is still 4 long.",
        },
        {
          id: "b",
          text: "It returns 5, and <code>left</code> ends at 0.",
          why: "This would keep every letter, but the string has two <code>d</code> letters, so the whole string is never a valid window. At index 2 the repeat moves <code>left</code> forward.",
        },
        {
          id: "c",
          text: "It returns 4, and <code>left</code> ends at 1.",
          why: "The windows grow as <code>d</code>, <code>dv</code>, then the second <code>d</code> at index 2 finds the old one at index 0, so <code>left</code> becomes 1 and the window is <code>vd</code>. After that <code>f</code> and <code>a</code> extend it to <code>vdfa</code>, length 4.",
        },
        {
          id: "d",
          text: "It returns 4, and <code>left</code> ends at 0.",
          why: "The length 4 is right, but <code>left</code> cannot stay at 0. The window from 0 to 4 would be <code>dvdfa</code>, which holds two <code>d</code> letters, so the repeat at index 2 must have moved <code>left</code> to 1.",
        },
      ],
      answer: "c",
    },
    {
      id: "sw-trace-fixed",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "trace",
      pattern: "sliding-window",
      section: "fixed-size-window",
      kind: "single",
      prompt:
        "<p>Run the chapter's <code>maxSumWindow</code>. When the second loop ends, what does <code>windowSum</code> hold, and what does the function return?</p><pre><code>function maxSumWindow(nums, k) {\n  let windowSum = 0;\n  for (let i = 0; i &lt; k; i++) windowSum += nums[i];\n\n  let best = windowSum;\n  for (let i = k; i &lt; nums.length; i++) {\n    windowSum += nums[i] - nums[i - k];\n    best = Math.max(best, windowSum);\n  }\n  return best;\n}\n\nmaxSumWindow([4, 2, 1, 7, 8, 1, 2, 8], 3);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>windowSum</code> is 16, and it returns 16.",
          why: "16 is the biggest window total, but <code>windowSum</code> always holds the total of the window the loop is on. The last window, 1 + 2 + 8, totals only 11.",
        },
        {
          id: "b",
          text: "<code>windowSum</code> is 7, and it returns 16.",
          why: "7 is the total of the first window, 4 + 2 + 1, which only the first loop sees. The second loop keeps updating <code>windowSum</code> until it reaches the end of the array.",
        },
        {
          id: "c",
          text: "<code>windowSum</code> is 11, and it returns 16.",
          why: "The window totals are 7, 10, 16, 16, 11 and 11. <code>windowSum</code> ends on the last of them, 11, and <code>best</code> kept the largest, 16.",
        },
        {
          id: "d",
          text: "<code>windowSum</code> is 11, and it returns 11.",
          why: "<code>best</code> is the maximum so far, not the latest total. It reached 16 on the third window and never drops.",
        },
      ],
      answer: "c",
    },
    {
      id: "sw-order-template",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "trace",
      pattern: "sliding-window",
      section: "the-general-variable-window-template",
      kind: "order",
      prompt:
        "<p>Put one pass of the general variable-window template in the order it happens, for a pass where the new element makes the window break its condition. Start with the first step of the loop body and end with the loop moving on to the next index.</p>",
      items: [
        { id: "expand", text: "Fold <code>arr[right]</code> into the running state." },
        {
          id: "shrink",
          text: "While the state breaks the condition, undo <code>arr[left]</code> from the state and move <code>left</code> forward.",
        },
        {
          id: "answer",
          text: "Update the answer from the valid window between <code>left</code> and <code>right</code>.",
        },
        { id: "advance", text: "The <code>for</code> loop moves <code>right</code> forward to the next index." },
      ],
      why: "The new element has to be part of the state before the condition can be checked, so expanding comes before shrinking. The answer is read last, because only then is the window valid again. Using it before the shrink step would count a window that breaks the rule. The loop moves <code>right</code> on only after the body of the pass is finished.",
    },
    {
      id: "sw-stale-guard",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "edge-case",
      pattern: "sliding-window",
      section: "variable-size-window-the-more-common-interview-shape",
      kind: "single",
      prompt:
        '<p>A teammate removes the check <code>lastSeen.get(c) &gt;= left</code> from <code>longestUniqueSubstring</code>, so <code>left</code> moves whenever a letter has been seen at all. The longest run of different letters in <code>"abba"</code> is 2. What does the changed function return?</p><pre><code>if (lastSeen.has(c)) {\n  left = lastSeen.get(c) + 1;\n}</code></pre>',
      choices: [
        {
          id: "a",
          text: "2, the correct answer",
          why: "The unchanged function returns 2. After the change the last letter pulls <code>left</code> backward, and the result grows.",
        },
        {
          id: "b",
          text: "4, because every letter is counted once",
          why: "The repeated <code>b</code> still moves <code>left</code> forward, so the window never covers all four letters. The wrong answer is smaller than that.",
        },
        {
          id: "c",
          text: "It throws a <code>TypeError</code>, because <code>lastSeen.get(c)</code> can be <code>undefined</code>",
          why: "The <code>has</code> test still runs first, so <code>get</code> is only called for letters that are in the map. Nothing throws.",
        },
        {
          id: "d",
          text: "3, which is more than the true answer",
          why: "At the second <code>b</code>, <code>left</code> moves to 2. At the final <code>a</code>, whose old index is 0, <code>left</code> is set back to 1, which is behind where it was. The window <code>bba</code> then counts as 3 long, though it repeats a letter. <code>left</code> must never move backward.",
        },
      ],
      answer: "d",
    },
    {
      id: "sw-k-too-big",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "edge-case",
      pattern: "sliding-window",
      section: "fixed-size-window",
      kind: "single",
      prompt:
        "<p>The window size is larger than the array. In JavaScript, what does <code>maxSumWindow([5, 9], 3)</code> return, using the function from the chapter?</p>",
      choices: [
        {
          id: "a",
          text: "14, the total of the numbers that exist",
          why: "The first loop does not stop at the end of the array. It reads <code>nums[2]</code> as well, and that read changes the total.",
        },
        {
          id: "b",
          text: "<code>NaN</code>",
          why: "The first loop reads <code>nums[2]</code>, which does not exist, so it gives <code>undefined</code>. Adding <code>undefined</code> to a number gives <code>NaN</code>, and the second loop never runs, so <code>best</code> stays <code>NaN</code>. Check that <code>k &lt;= nums.length</code> before building the first window.",
        },
        {
          id: "c",
          text: "<code>undefined</code>",
          why: "The function ends with <code>return best</code>, and <code>best</code> was set from <code>windowSum</code>, which is a number, even if that number is <code>NaN</code>.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>.",
          why: "Reading an index past the end of an array does not throw in JavaScript. It gives <code>undefined</code>, and arithmetic on <code>undefined</code> gives <code>NaN</code> without an error.",
        },
      ],
      answer: "b",
    },
    {
      id: "sw-amortized-cost",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "complexity",
      pattern: "sliding-window",
      section: "the-general-variable-window-template",
      kind: "single",
      prompt:
        "<p>All the numbers in <code>nums</code> are positive. For n numbers, what is the running time of this function?</p><pre><code>function shortestAtLeast(nums, target) {\n  let left = 0, sum = 0, best = Infinity;\n  for (let right = 0; right &lt; nums.length; right++) {\n    sum += nums[right];\n    while (sum &gt;= target) {\n      best = Math.min(best, right - left + 1);\n      sum -= nums[left];\n      left++;\n    }\n  }\n  return best === Infinity ? 0 : best;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²), because a <code>while</code> loop sits inside a <code>for</code> loop",
          why: "The inner loop can run many times in one pass, but <code>left</code> only ever moves forward and can move at most n steps in the whole call. The loops add up, they do not multiply.",
        },
        {
          id: "b",
          text: "O(n log n), because the window is halved each time",
          why: "Nothing is halved. The window grows by one element on the right and loses elements on the left, one step at a time.",
        },
        {
          id: "c",
          text: "O(n), because <code>right</code> moves n times and <code>left</code> moves at most n times in total",
          why: "Every element enters the window once and leaves it at most once, so the total work is at most about 2n steps. This is the amortized argument for the shrink loop.",
        },
        {
          id: "d",
          text: "O(n · m), where m is the length of the final window",
          why: "m can be close to n, which would make this as large as O(n²). The cost does not depend on the window size at all, because each element is added and removed at most once.",
        },
      ],
      answer: "c",
    },
    {
      id: "sw-brute-cost",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "complexity",
      pattern: "sliding-window",
      section: "the-insight-don-t-recompute-adjust",
      kind: "single",
      prompt:
        "<p>For n = 1,000 numbers and a window size of k = 500, roughly how many additions does it take to total every window from scratch, compared with the sliding method of <code>maxSumWindow</code>?</p>",
      choices: [
        {
          id: "a",
          text: "About 250,000 from scratch, against about 1,000 steps when sliding",
          why: "There are 1,000 − 500 + 1 = 501 windows of 500 additions each, which is 250,500. Sliding adds 500 values to build the first window and then does one update for each of the 500 remaining positions. That is the difference between O(n · k) and O(n).",
        },
        {
          id: "b",
          text: "About 1,000 from scratch, the same as sliding",
          why: "Totalling a window from scratch means adding all k values again, so 500 additions for each of 501 windows. It cannot match the sliding method, which adds and drops one value per step.",
        },
        {
          id: "c",
          text: "About 500 from scratch, against 1,000 when sliding",
          why: "That is just the cost of one window. From scratch, every window pays it again.",
        },
        {
          id: "d",
          text: "About 1,000,000 from scratch, against 1,000 when sliding",
          why: "That is n × n, which would be right if every window had n elements. Windows here have k = 500, and there are 501 of them, so about 250,000 additions.",
        },
      ],
      answer: "a",
    },
    {
      id: "sw-space-bound",
      chapter: "dsa-sliding-window",
      level: "beginner",
      skill: "complexity",
      pattern: "sliding-window",
      section: "variable-size-window-the-more-common-interview-shape",
      kind: "single",
      prompt:
        "<p>The string passed to <code>longestUniqueSubstring</code> is n characters long and uses only the 26 lowercase letters, whatever n is. How much extra space does the function use?</p>",
      choices: [
        {
          id: "a",
          text: "O(n), because it stores one entry per character of the string",
          why: "The map stores one entry per distinct letter, not per position. A repeated letter just overwrites its old entry.",
        },
        {
          id: "b",
          text: "O(n²), because every window is stored",
          why: "No window is stored. The function keeps only <code>left</code>, <code>best</code> and a map of last positions.",
        },
        {
          id: "c",
          text: "O(log n), because the window is halved",
          why: "Nothing is halved here, and the map's size does not depend on n once all 26 letters have appeared.",
        },
        {
          id: "d",
          text: "O(1), because the map never holds more than 26 entries",
          why: "The map has one entry per distinct letter seen, so at most 26. That is a fixed bound that does not grow with n. In general the space is O(min(n, alphabet size)).",
        },
      ],
      answer: "d",
    },
  ],
  pattern: {
    pattern: "sliding-window",
    chapter: "dsa-sliding-window",
    signals: [
      "The prompt says contiguous subarray or substring, not subsequence.",
      "The prompt asks for the longest, shortest, largest or smallest contiguous range that meets a condition.",
      "A brute force would check every start and end pair, which costs O(n²) or worse.",
      "The condition can be updated in O(1) as one element enters the window and one leaves.",
      "The prompt gives a window size k and asks about every block of k neighbours.",
    ],
    template:
      "<pre><code>let left = 0;\nfor (let right = 0; right &lt; arr.length; right++) {\n  add(arr[right]);\n  while (violatesCondition()) {\n    remove(arr[left]);\n    left++;\n  }\n  updateAnswer(left, right);\n}</code></pre>",
    time: "O(n)",
    space: "O(1), or O(min(n, alphabet)) when the window keeps a map",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
