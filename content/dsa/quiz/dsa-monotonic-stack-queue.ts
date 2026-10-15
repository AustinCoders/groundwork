import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "ms-warmer-day",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "recognise",
      pattern: "monotonic-stack",
      section: "the-insight-some-elements-become-permanently-useless",
      placement: true,
      kind: "single",
      prompt:
        "<p>You have one temperature per day for up to 100,000 days. For every day, report how many days pass until a strictly warmer day, or 0 if there is none. Which approach runs in O(n)?</p>",
      choices: [
        {
          id: "a",
          text: "For each day, scan to the right until a warmer day appears, then record the distance.",
          why: "This is correct but can cost O(n²). If the temperatures fall every day, no day has a warmer one after it, so each scan runs to the end of the array.",
        },
        {
          id: "b",
          text: "Sort the days by temperature, then binary search the sorted list for each day's successor.",
          why: "Sorting loses the order of the days, and the answer depends on which warmer day comes first in time, not on which is nearest in temperature.",
        },
        {
          id: "c",
          text: "Walk once with a stack of indices; when today is warmer than the top day, pop it and record the gap.",
          why: "A day on the stack is still waiting for a warmer one. When one arrives, every colder day on top is answered and never looked at again. Each day is pushed once and popped at most once, so the total is O(n).",
        },
        {
          id: "d",
          text: "Slide a window of fixed width over the days and report the maximum inside each window.",
          why: "The task has no fixed width, and the warmer day can be any distance away. A window of one size cannot find it.",
        },
      ],
      answer: "c",
    },
    {
      id: "ms-deque-which-query",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "recognise",
      pattern: "monotonic-stack",
      section: "monotonic-deque-sliding-window-maximum",
      placement: true,
      kind: "single",
      prompt:
        "<p>A monotonic deque of indices lets you slide a window of size k over an array in O(n) total time. Which per-window answer can be read from the deque's own contents?</p>",
      choices: [
        {
          id: "a",
          text: "The median of the window.",
          why: "An older element that is smaller than a newer one can still be the median of the window. In <code>[1, 5, 0]</code> the median is 1. So nothing can be thrown away on arrival, and the deque only works when dominated elements are never needed again.",
        },
        {
          id: "b",
          text: "The second largest value in the window.",
          why: "An older element that is smaller than a newer one can still be the second largest. In <code>[1, 5]</code> the 1 is the second largest, so it cannot be discarded when the 5 arrives.",
        },
        {
          id: "c",
          text: "The average of the window.",
          why: "The average needs every value in the window, but the deque keeps only a subset and throws the dominated elements away. Its contents cannot supply the total, which a running sum tracks instead.",
        },
        {
          id: "d",
          text: "The minimum of the window.",
          why: "The minimum is the mirror image of the maximum. A newer, smaller element makes every older, larger one useless for the minimum, so the deque is kept increasing and its front is the answer.",
        },
      ],
      answer: "d",
    },
    {
      id: "ms-histogram-plan",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "recognise",
      pattern: "monotonic-stack",
      section: "largest-rectangle-in-histogram",
      placement: true,
      kind: "single",
      prompt:
        "<p>You get the heights of bars standing side by side, each of width 1. Find the area of the largest rectangle that fits entirely inside the bars. Which idea gives O(n)?</p>",
      choices: [
        {
          id: "a",
          text: "Keep an increasing stack of indices. A shorter bar finishes the bar on top: its rectangle ends there and starts after the new top.",
          why: "A bar's rectangle stretches until the nearest shorter bar on each side. An increasing stack keeps bars that are still waiting for a shorter one, so the bar that causes a pop is the right edge and the new top is the left edge.",
        },
        {
          id: "b",
          text: "Keep a decreasing stack, popping while the top is shorter than the new bar, as for next greater.",
          why: "That stack finds the nearest taller bar. A rectangle is limited by the nearest shorter bar, so this stack answers a different question.",
        },
        {
          id: "c",
          text: "Move two pointers inward from both ends, always advancing the one at the shorter bar, with area min(h[l], h[r]) · (r − l + 1).",
          why: "That is the container-with-water idea. A water container ignores what lies between its walls, but in a histogram any bar between them that is shorter than both ends caps the height of the rectangle.",
        },
        {
          id: "d",
          text: "Build prefix sums of the heights and pick the span with the largest sum.",
          why: "The area of a rectangle is its lowest bar times its width, not the sum of the bars it covers. A tall bar next to a short one adds its full height to the sum, but a rectangle across both can only use the short bar's height.",
        },
      ],
      answer: "a",
    },
    {
      id: "ms-previous-smaller",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "recognise",
      pattern: "monotonic-stack",
      section: "the-canonical-shape",
      kind: "single",
      prompt:
        "<p>For each element of an array, find the nearest element to its left that is strictly smaller, or -1 if there is none. You use one left-to-right pass with a stack of indices. Which rule is right?</p>",
      choices: [
        {
          id: "a",
          text: "A decreasing stack: pop while the top is smaller than the current value, then read the answer from the top.",
          why: "The top that is left after those pops is the nearest element on the left that is at least as large as the current one. That answers previous greater-or-equal, not previous smaller.",
        },
        {
          id: "b",
          text: "An increasing stack: pop while the top is greater than or equal to the current value, then read the answer from the top.",
          why: "After the pops, whatever is on top is strictly smaller than the current value, and nothing nearer could be, since the popped elements were not smaller. The pop test must include equal values.",
        },
        {
          id: "c",
          text: "An increasing stack: pop while the top is strictly greater than the current value, then read the answer from the top.",
          why: "Equal values stay on the stack and are then returned as answers. For <code>[0, 0]</code> this gives <code>[-1, 0]</code>, but the second 0 has no strictly smaller value on its left, so the answer should be <code>[-1, -1]</code>.",
        },
        {
          id: "d",
          text: "An increasing stack: pop while the top is greater than or equal to the current value, then read the answer from the last element popped.",
          why: "Every element popped was greater than or equal to the current value, so none of them can be strictly smaller. The answer is the element that stays on top.",
        },
      ],
      answer: "b",
    },
    {
      id: "ms-total-time",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "complexity",
      pattern: "monotonic-stack",
      section: "the-insight-some-elements-become-permanently-useless",
      kind: "single",
      prompt:
        "<p>Here <code>nums</code> holds n numbers. Which is the tightest worst-case bound on the total running time of <code>nextGreater</code>?</p><pre><code>function nextGreater(nums) {\n  const res = new Array(nums.length).fill(-1);\n  const stack = [];\n\n  for (let i = 0; i &lt; nums.length; i++) {\n    while (stack.length &amp;&amp; nums[stack[stack.length - 1]] &lt; nums[i]) {\n      res[stack.pop()] = nums[i];\n    }\n    stack.push(i);\n  }\n  return res;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²), because a <code>while</code> loop sits inside a <code>for</code> loop",
          why: "Nested loops only multiply when the inner loop starts fresh each time. Here the inner loop pops from one shared stack, so its pops add up across the whole run.",
        },
        {
          id: "b",
          text: "O(n log n), because each pop has to search the stack",
          why: "Nothing is searched. The element to remove is always the top, and removing it takes O(1).",
        },
        {
          id: "c",
          text: "O(n), because each index is pushed once and popped at most once",
          why: "There are n pushes, and a pop removes an index that was pushed, so there are at most n pops in total. One step may pop many elements, but the pops over the whole run never exceed n.",
        },
        {
          id: "d",
          text: "O(n) when the input is sorted, but O(n²) in general",
          why: "The pop count is limited by the pushes whatever the input looks like. Sorted or not, the total is at most n pushes plus n pops.",
        },
      ],
      answer: "c",
    },
    {
      id: "ms-stack-space",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "complexity",
      pattern: "monotonic-stack",
      section: "the-canonical-shape",
      kind: "single",
      prompt:
        "<p>For the same <code>nextGreater</code>, with n numbers, what is the worst-case extra space used by the stack, not counting the output array <code>res</code>?</p>",
      choices: [
        {
          id: "a",
          text: "O(n)",
          why: "If no element is ever followed by a larger one, nothing is popped. A strictly falling array such as <code>[10, 9, 8, 7, 6, 5, 4, 3, 2, 1]</code> leaves all ten indices on the stack.",
        },
        {
          id: "b",
          text: "O(1), because the answers go straight into <code>res</code>",
          why: "The answers do go into <code>res</code>, but the stack holds the indices still waiting for an answer, and there can be as many as n of them.",
        },
        {
          id: "c",
          text: "O(log n)",
          why: "No halving happens in this loop. The stack only shrinks when a larger value arrives, so its size depends on the input.",
        },
        {
          id: "d",
          text: "O(k), where k is the number of distinct values",
          why: "Equal values stay on the stack, because a pop needs a strictly larger value. For <code>[5, 5, 5, 5]</code> there is one distinct value, but all four indices remain.",
        },
      ],
      answer: "a",
    },
    {
      id: "ms-trace-next-greater",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "trace",
      pattern: "monotonic-stack",
      section: "next-greater-element",
      kind: "single",
      prompt:
        "<p>The chapter's <code>nextGreater</code>, with the strict test <code>nums[stack[stack.length - 1]] &lt; nums[i]</code>, runs on <code>[4, 4, 2, 5, 1, 3]</code>. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[-1, -1, 4, -1, 5, 5]</code>",
          why: "These are the previous greater values, the nearest larger element on the left. <code>nextGreater</code> looks to the right.",
        },
        {
          id: "b",
          text: "<code>[3, 3, 3, -1, 5, -1]</code>",
          why: "These are the indices of the next greater elements. The function stores the values, <code>res[stack.pop()] = nums[i]</code>, not the positions.",
        },
        {
          id: "c",
          text: "<code>[4, 5, 5, -1, 3, -1]</code>",
          why: "This is what the non-strict test <code>&lt;=</code> would give, where the second 4 pops the first. With <code>&lt;</code>, a 4 does not pop an equal 4, so the first 4 waits for the 5.",
        },
        {
          id: "d",
          text: "<code>[5, 5, 5, -1, 3, -1]</code>",
          why: "Both 4s and the 2 are popped by the 5, which is the first larger value to their right. The 5 itself has no larger value after it. The 1 is popped by the 3, and the 3 stays unanswered.",
        },
      ],
      answer: "d",
    },
    {
      id: "ms-trace-histogram",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "trace",
      pattern: "monotonic-stack",
      section: "largest-rectangle-in-histogram",
      kind: "single",
      prompt:
        "<p>The chapter's <code>largestRectangleArea</code> runs on the heights <code>[3, 1, 3, 2, 2]</code>. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "4",
          why: "That is the area of the two bars of height 2 on their own. The rectangle of height 2 also reaches back over the 3 at index 2, so it is three bars wide.",
        },
        {
          id: "b",
          text: "5",
          why: "That is the bar of height 1 stretched over all five positions. A rectangle of height 2 over three bars is larger.",
        },
        {
          id: "c",
          text: "6",
          why: "Bars 2, 3 and 4 have heights 3, 2 and 2, so a rectangle of height 2 and width 3 fits and has area 6. No other rectangle is larger, and the next best has area 5.",
        },
        {
          id: "d",
          text: "8",
          why: "This is what the width <code>i - left + 1</code> would give, one too wide. The width is <code>i - left</code>, because <code>i</code> is the first bar that breaks the rectangle.",
        },
      ],
      answer: "c",
    },
    {
      id: "ms-trap-without-break",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "edge-case",
      pattern: "monotonic-stack",
      section: "trapping-rain-water-the-monotonic-stack-way",
      kind: "single",
      prompt:
        "<p>In the chapter's <code>trap</code>, the line <code>if (!stack.length) break;</code> is deleted and nothing else changes. With the line, <code>trap([2, 0, 3])</code> returns 2. What does it return without it?</p>",
      choices: [
        {
          id: "a",
          text: "2, as before, because the loop condition already guards the stack",
          why: "The loop condition only checks the stack before the pop. After the 0 is popped, the 2 is popped next and the stack is then empty, and nothing checks that before <code>left</code> is read.",
        },
        {
          id: "b",
          text: "<code>NaN</code>",
          why: "After the 2 is popped, the stack is empty and <code>stack[stack.length - 1]</code> is <code>stack[-1]</code>, which is <code>undefined</code>. Then <code>i - left - 1</code> and <code>Math.min(height[left], height[i])</code> are both <code>NaN</code>, and adding the product to <code>water</code> makes it <code>NaN</code>. The <code>break</code> is the rule that a basin needs a wall on its left.",
        },
        {
          id: "c",
          text: "0",
          why: "The first basin is filled before the second pop, so <code>water</code> is 2 by then. The next pop adds <code>NaN</code>, and 2 plus <code>NaN</code> is <code>NaN</code>, not 0.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>.",
          why: "Reading an index that is not in the array gives <code>undefined</code> and does not throw. The error shows up as a <code>NaN</code> result instead.",
        },
      ],
      answer: "b",
    },
    {
      id: "ms-histogram-changes",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "edge-case",
      pattern: "monotonic-stack",
      section: "largest-rectangle-in-histogram",
      kind: "multi",
      prompt:
        "<p>Each change below is made on its own to the chapter's <code>largestRectangleArea</code>. Select every change that makes it return a wrong answer for some non-empty input.</p><pre><code>function largestRectangleArea(heights) {\n  const stack = [];\n  let best = 0;\n\n  for (let i = 0; i &lt;= heights.length; i++) {\n    const h = i === heights.length ? 0 : heights[i];\n\n    while (stack.length &amp;&amp; heights[stack[stack.length - 1]] &gt;= h) {\n      const height = heights[stack.pop()];\n      const left = stack.length ? stack[stack.length - 1] + 1 : 0;\n      best = Math.max(best, height * (i - left));\n    }\n    stack.push(i);\n  }\n  return best;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "Change the loop test to <code>i &lt; heights.length</code>, so the virtual zero bar is never visited.",
          why: "Without the zero bar nothing drains the stack. For <code>[2]</code> no bar is ever popped and the function returns 0, but the answer is 2.",
        },
        {
          id: "b",
          text: "Change <code>&gt;=</code> to <code>&gt;</code> in the <code>while</code> test.",
          why: "Equal bars now stay on the stack, so a later bar of equal height can be measured with a narrower width. The earlier equal bar is popped afterwards and reaches back as far as it can, so the largest rectangle is still found. The answer stays correct.",
        },
        {
          id: "c",
          text: "Change the width to <code>i - left + 1</code>.",
          why: "<code>i</code> is the first bar that breaks the rectangle, so it is an exclusive edge. Adding 1 makes every rectangle one bar too wide, and <code>[2]</code> gives 4 instead of 2.",
        },
        {
          id: "d",
          text: "Change <code>left</code> to <code>stack[stack.length - 1] + 1</code>, with no check for an empty stack.",
          why: "When a pop empties the stack, <code>stack[-1]</code> is <code>undefined</code>, so <code>left</code> is <code>NaN</code> and <code>Math.max</code> returns <code>NaN</code>. The bar at the bottom of the stack is always popped last, so every non-empty input hits this.",
        },
      ],
      answers: ["a", "c", "d"],
    },
    {
      id: "ms-order-one-pop",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "trace",
      pattern: "monotonic-stack",
      section: "largest-rectangle-in-histogram",
      kind: "order",
      prompt:
        "<p>Bar <code>i</code> is shorter than the bar on top of the stack, and after one pop the new top is shorter than it, so the loop stops. Put the steps in the order they happen. Start with the first <code>while</code> test and end with pushing <code>i</code>.</p><pre><code>while (stack.length &amp;&amp; heights[stack[stack.length - 1]] &gt;= h) {\n  const height = heights[stack.pop()];\n  const left = stack.length ? stack[stack.length - 1] + 1 : 0;\n  best = Math.max(best, height * (i - left));\n}\nstack.push(i);</code></pre>",
      items: [
        {
          id: "test",
          text: "Test whether the bar on top is at least as tall as <code>h</code>, which it is.",
        },
        { id: "pop", text: "Pop the top index and read the height of that bar." },
        {
          id: "left",
          text: "Compute <code>left</code> from the bar now on top, or 0 if the stack is empty.",
        },
        {
          id: "area",
          text: "Compute <code>height * (i - left)</code> and keep it in <code>best</code> if it is larger.",
        },
        { id: "push", text: "Test again, find the loop is over, and push <code>i</code>." },
      ],
      why: "The test decides whether a bar is finished, so it comes first. The pop has to come before <code>left</code>, because the left edge is read from the stack as it stands once that bar is gone. The area needs both the height from the pop and the <code>left</code> just computed. Pushing <code>i</code> happens only when the loop test fails, so it is last.",
    },
    {
      id: "ms-stock-span-timing",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "recognise",
      pattern: "monotonic-stack",
      section: "daily-temperatures-next-greater-element-i-and-stock-span",
      kind: "single",
      prompt:
        "<p>Daily Temperatures and Stock Span both use a monotonic stack of indices. When is each answer written?</p>",
      choices: [
        {
          id: "a",
          text: "Both at pop time, as the distance <code>i - j</code>.",
          why: "Daily Temperatures does that, but a span looks backwards to a previous greater price, which is visible only after the pops.",
        },
        {
          id: "b",
          text: "Daily Temperatures at push time, Stock Span at pop time.",
          why: "It is the other way around: the temperature answer is known when a warmer day pops an index.",
        },
        {
          id: "c",
          text: "Daily Temperatures when an index pops, Stock Span when the new index is pushed.",
          why: "A warmer day resolves the popped indices, while the span of today is the distance to whatever is left on top once the smaller prices are gone.",
        },
        {
          id: "d",
          text: "Both after the loop, from the indices left on the stack.",
          why: "Indices left on the stack have no answer; the answers are written during the scan.",
        },
      ],
      answer: "c",
    },
    {
      id: "ms-min-sum-ties",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "edge-case",
      pattern: "monotonic-stack",
      section: "sum-of-subarray-minimums-count-the-windows-each-element-rule",
      kind: "single",
      prompt:
        "<p>Sum of Subarray Minimums on <code>[2, 2]</code> has the answer 6. Suppose the left and right extents of each element both stop at an <em>equal</em> value as well as at a smaller one. What total does the contribution formula produce?</p>",
      choices: [
        {
          id: "a",
          text: "<code>6</code>",
          why: "That needs one side strict and the other not, so that the subarray <code>[2, 2]</code> is assigned to exactly one element.",
        },
        {
          id: "b",
          text: "<code>4</code>",
          why: "Each 2 gets 1 start and 1 end, giving 2 + 2. The two-element window belongs to nobody, so it is counted zero times.",
        },
        {
          id: "c",
          text: "<code>8</code>",
          why: "That is what happens when neither side stops at an equal value: the pair window is counted for both elements.",
        },
        {
          id: "d",
          text: "<code>2</code>",
          why: "Even with both sides stopping early, each element still counts its own one-element subarray.",
        },
      ],
      answer: "b",
    },
    {
      id: "ms-remove-k-trace",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "trace",
      pattern: "monotonic-stack",
      section: "lexicographic-stacks-remove-k-digits-and-remove-duplicate-le",
      kind: "single",
      prompt:
        '<p>Remove K Digits runs on <code>"1432219"</code> with <code>k = 3</code>. After the digits <code>1</code>, <code>4</code> and <code>3</code> have been processed, what do the stack and <code>k</code> hold?</p>',
      choices: [
        {
          id: "a",
          text: "stack <code>[1, 4, 3]</code>, <code>k = 3</code>",
          why: "The digit 3 arrives while 4 is on top, and 4 is larger, so 4 is popped.",
        },
        {
          id: "b",
          text: "stack <code>[1, 3]</code>, <code>k = 2</code>",
          why: "The 4 was popped when the smaller 3 arrived, which used one deletion, and then 3 was pushed.",
        },
        {
          id: "c",
          text: "stack <code>[3]</code>, <code>k = 1</code>",
          why: "The 1 is smaller than 4 and 3 and stays; only 4 is popped.",
        },
        {
          id: "d",
          text: "stack <code>[1, 3]</code>, <code>k = 3</code>",
          why: "The stack is right, but popping a digit uses a deletion, so <code>k</code> went down by one.",
        },
      ],
      answer: "b",
    },
    {
      id: "ms-negatives-window",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "recognise",
      pattern: "monotonic-stack",
      section: "deque-with-prefix-sums-shortest-subarray-with-sum-at-least-k",
      kind: "single",
      prompt:
        "<p>Why does the usual two-pointer sliding window fail for the shortest subarray with sum at least K when the array may contain negative numbers?</p>",
      choices: [
        {
          id: "a",
          text: "A sliding window may only be used on sorted input, and an array with negative numbers is not sorted.",
          why: "A sliding window does not need sorted input; it needs a rule for when to grow and when to shrink.",
        },
        {
          id: "b",
          text: "Adding an element can lower the sum and removing one can raise it, so no pointer move is always safe.",
          why: "With positive numbers growing only raises the sum, which is the rule the window relies on. Negatives break it.",
        },
        {
          id: "c",
          text: "The sums can exceed 32 bits, and the pointers then wrap around to the wrong positions.",
          why: "JavaScript numbers are doubles and keep these sums exact. The problem is the missing monotonic rule, not the size.",
        },
        {
          id: "d",
          text: "A window cannot be combined with prefix sums.",
          why: "The deque solution does use prefix sums. The plain window fails for a different reason.",
        },
      ],
      answer: "b",
    },
    {
      id: "ms-jump-six-cost",
      chapter: "dsa-monotonic-stack-queue",
      level: "intermediate",
      skill: "complexity",
      pattern: "monotonic-stack",
      section: "deque-with-dp-jump-game-vi",
      kind: "single",
      prompt:
        "<p>In Jump Game VI the DP is <code>dp[i] = nums[i] + max(dp[i - k..i - 1])</code>. Using a monotonic deque for the window maximum, what is the total time for an array of length n?</p>",
      choices: [
        {
          id: "a",
          text: "O(n · k)",
          why: "That is the cost when the window maximum is found by scanning the last k values.",
        },
        {
          id: "b",
          text: "O(n log k)",
          why: "That is the cost with a heap or a balanced tree. The deque does better.",
        },
        {
          id: "c",
          text: "O(n)",
          why: "Each index is pushed to the deque once and removed at most once, so the work per step is constant on average.",
        },
        {
          id: "d",
          text: "O(n log n)",
          why: "Nothing is sorted here, and no step costs a logarithm.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "monotonic-stack",
    chapter: "dsa-monotonic-stack-queue",
    signals: [
      "The prompt asks for the next or previous greater or smaller element, or how far each element reaches before something bigger or smaller stops it.",
      "The brute force is a double loop where the inner loop scans sideways until a condition trips.",
      "Each bar, day or price needs a left and a right boundary, as in a histogram or a stock span.",
      "The prompt asks for the maximum or minimum of every window of size k.",
    ],
    template:
      "<pre><code>for (let i = 0; i &lt; n; i++) { while (stack.length &amp;&amp; nums[stack.at(-1)] &lt; nums[i]) resolve(stack.pop(), i); stack.push(i); }</code></pre>",
    time: "O(n)",
    space: "O(n)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
