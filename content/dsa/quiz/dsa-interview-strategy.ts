import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "plan-n-is-twenty",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "constraints-intended-complexity-the-highest-leverage-table-h",
      placement: true,
      kind: "single",
      prompt:
        "<p>A problem statement says only that <code>1 &lt;= n &lt;= 22</code> for the number of items. Assume about 10<sup>8</sup> simple operations per second and a limit of a second or two. Which intended cost does that bound most directly point to?</p>",
      choices: [
        {
          id: "a",
          text: "O(n!), a search that tries every ordering of the items.",
          why: "22! is about 10<sup>21</sup>, far beyond the budget. Factorial search is intended only up to about n = 10 to 12, so a bound of 22 rules it out.",
        },
        {
          id: "b",
          text: "O(n²), a dynamic-programming table over pairs of items.",
          why: "22² is under 500, so this would be affordable, but it would also be affordable at n = 5,000. A setter who intends a quadratic solution allows n in the thousands, so a bound this small signals a cost that grows faster.",
        },
        {
          id: "c",
          text: "O(2<sup>n</sup> · n), enumerating subsets, for example with a bitmask.",
          why: "2<sup>22</sup> is about 4 million, and times n it is under 10<sup>8</sup>, so enumerating every subset fits the budget. It is also near the edge of the budget, which is why a bound in the low twenties points at subsets.",
        },
        {
          id: "d",
          text: "O(n log n), sorting the items and then scanning them once.",
          why: "A solution this fast would be allowed to take n in the hundreds of thousands. A bound of 22 is a sign that the intended solution is much more expensive per item.",
        },
      ],
      answer: "c",
    },
    {
      id: "plan-negatives-kill-window",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "the-first-five-minutes-questions-that-change-the-answer",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are asked for the length of the longest contiguous subarray whose sum is exactly <code>k</code>. The array has up to 100,000 integers, and the interviewer confirms that values can be negative. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Slide a window that grows on the right and shrinks on the left while its sum is above <code>k</code>.",
          why: "The shrinking rule assumes that dropping elements lowers the sum, which only holds when values are non-negative. With negatives, a longer window can have a smaller sum, so the window can move past a valid answer.",
        },
        {
          id: "b",
          text: "Keep prefix sums and a hash map from each prefix value to its first index.",
          why: "For each end index, the start that gives a sum of <code>k</code> has the prefix value <code>prefix - k</code>, which the map looks up in O(1). Nothing here relies on the sign of the values, and the total is O(n).",
        },
        {
          id: "c",
          text: "Sort the array and use two pointers.",
          why: "Sorting destroys the order of the elements, and a subarray is defined by positions that are next to each other. The sorted array no longer answers the question.",
        },
        {
          id: "d",
          text: "Try every start index with a running sum, which takes O(n²).",
          why: "This is correct, and a fine brute force to state first. With n up to 100,000 it checks about 5 × 10<sup>9</sup> pairs, which is far too slow under the usual rule of thumb of 10<sup>8</sup> operations per second.",
        },
      ],
      answer: "b",
    },
    {
      id: "plan-constraint-pairs",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "complexity",
      pattern: "interview-strategy",
      section: "constraints-intended-complexity-the-highest-leverage-table-h",
      kind: "multi",
      prompt:
        "<p>Assume about 10<sup>8</sup> simple operations per second and a limit of one or two seconds. Select every pairing of an input bound and an algorithm whose number of operations fits the limit.</p>",
      choices: [
        {
          id: "a",
          text: "<code>n &lt;= 10</code> with an O(n!) search over every ordering.",
          why: "10! is 3,628,800, a few million operations, well inside the limit. This is the kind of bound at which trying every ordering is intended.",
        },
        {
          id: "b",
          text: "<code>n &lt;= 100,000</code> with an O(n²) double loop.",
          why: "n² is 10<sup>10</sup>, which at that rate takes about 100 seconds. This bound points at O(n log n) or O(n).",
        },
        {
          id: "c",
          text: "<code>n &lt;= 5,000</code> with an O(n²) pass over all pairs.",
          why: "n² is 25,000,000, a fraction of the budget. A bound of a few thousand is where all-pairs work and 2D DP are expected.",
        },
        {
          id: "d",
          text: "<code>n &lt;= 10<sup>18</sup></code> with an O(n) loop.",
          why: "10<sup>18</sup> operations is far beyond any time limit, and the input could not even be read. A bound this large means a closed form or an O(log n) method.",
        },
        {
          id: "e",
          text: "<code>n &lt;= 100</code> with an O(n³) triple loop.",
          why: "n³ is 1,000,000, which is trivial for the budget. Triple nested loops are fine at this bound.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "plan-ops-budget",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "complexity",
      pattern: "interview-strategy",
      section: "constraints-intended-complexity-the-highest-leverage-table-h",
      kind: "single",
      prompt:
        "<p>Take the rule of thumb of about 10<sup>8</sup> simple operations per second. Roughly how long would an algorithm that performs n² simple operations take for n = 200,000?</p>",
      choices: [
        {
          id: "a",
          text: "About 4 seconds",
          why: "That would be 4 × 10<sup>8</sup> operations, which is what n² gives for n of about 20,000, ten times smaller than this input.",
        },
        {
          id: "b",
          text: "About 40 seconds",
          why: "That would be 4 × 10<sup>9</sup> operations. The real count is ten times that.",
        },
        {
          id: "c",
          text: "About 400 seconds",
          why: "200,000² is 4 × 10<sup>10</sup>. Divided by 10<sup>8</sup> operations per second, that is 400 seconds, several minutes, so this approach is far too slow and the constraints are asking for O(n log n) or better.",
        },
        {
          id: "d",
          text: "About 4,000 seconds",
          why: "That would be 4 × 10<sup>11</sup> operations, ten times the real count of 4 × 10<sup>10</sup>.",
        },
      ],
      answer: "c",
    },
    {
      id: "plan-dp-memory",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "complexity",
      pattern: "interview-strategy",
      section: "constraints-intended-complexity-the-highest-leverage-table-h",
      kind: "single",
      prompt:
        "<p>You want only the length of the longest common subsequence of two strings that each have 5,000 characters. A full table has 5,001 × 5,001 cells. Each cell depends only on the cell above, the cell to the left, and the one diagonally above-left. About how many cells do you need to hold if you keep the full table, and if you keep only the two most recent rows?</p>",
      choices: [
        {
          id: "a",
          text: "About 25 million for the full table, and about 10 thousand for two rows.",
          why: "5,001² is 25,010,001, and two rows of 5,001 cells are 10,002. Because each row reads only the one before it, rolling the table down to two rows gives the same length at a tiny fraction of the memory. Rebuilding the subsequence itself by the usual backtrack would need the full table.",
        },
        {
          id: "b",
          text: "About 5 thousand for the full table, and just 2 for the two rows.",
          why: "A table has a cell for every pair of positions, which is a row of 5,001 cells for each of 5,001 rows. Two rows hold 2 × 5,001 cells, not 2.",
        },
        {
          id: "c",
          text: "About 25 million for both, because the recurrence reads every cell of the table.",
          why: "The recurrence needs the previous row and the current row only. Older rows are never read again, so they can be dropped.",
        },
        {
          id: "d",
          text: "About 10 thousand for the full table, and about 5 thousand for two rows.",
          why: "The full table has one cell for every pair of positions, about 25 million, not the sum of the two lengths.",
        },
      ],
      answer: "a",
    },
    {
      id: "plan-trace-min-so-far",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "trace",
      pattern: "interview-strategy",
      section: "a-framework-that-works-on-a-problem-you-have-never-seen",
      kind: "single",
      prompt:
        "<p>The best-profit problem from the chapter is solved in one pass with a running minimum. For <code>maxProfit([3, 8, 2, 6, 1])</code>, what are <code>minSoFar</code> and <code>best</code> right after the loop has processed the third price?</p><pre><code>function maxProfit(prices) {\n  let minSoFar = Infinity;\n  let best = 0;\n  for (const price of prices) {\n    minSoFar = Math.min(minSoFar, price);\n    best = Math.max(best, price - minSoFar);\n  }\n  return best;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>minSoFar = 3</code>, <code>best = 5</code>",
          why: "The third price is 2, which is smaller than 3, so <code>minSoFar</code> becomes 2. It stays at 3 only after the first two prices.",
        },
        {
          id: "b",
          text: "<code>minSoFar = 2</code>, <code>best = 0</code>",
          why: "<code>best</code> never goes down, because it is the larger of its old value and the new profit. After the second price it is already 5, and the new profit 2 - 2 = 0 does not lower it.",
        },
        {
          id: "c",
          text: "<code>minSoFar = 8</code>, <code>best = 5</code>",
          why: "This follows the largest price seen so far. The loop tracks the smallest price, so the 8 is never stored in <code>minSoFar</code>.",
        },
        {
          id: "d",
          text: "<code>minSoFar = 2</code>, <code>best = 5</code>",
          why: "After 3: min 3, best 0. After 8: min 3, best 5. After 2: min 2, and the profit 2 - 2 = 0 does not beat 5. The best pair so far, buying at 3 and selling at 8, stays in <code>best</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "plan-order-optimise",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "trace",
      pattern: "interview-strategy",
      section: "a-framework-that-works-on-a-problem-you-have-never-seen",
      kind: "order",
      prompt:
        "<p>Put the steps of optimising a solution out loud in the order the framework runs them. Start with stating the brute force and end with confirming the plan before you code.</p>",
      items: [
        { id: "brute", text: "State a brute force and its time and space complexity." },
        { id: "bottleneck", text: "Name the bottleneck: the work the brute force repeats." },
        { id: "structure", text: "Choose the structure that makes that repeated work O(1) or O(log n)." },
        { id: "confirm", text: "Confirm the plan and its new complexity with the interviewer, then code." },
      ],
      why: "The bottleneck is a property of the brute force, so the brute force has to be on the board first. A data structure is chosen to remove a named piece of repeated work, so naming it comes before choosing. Confirming comes last, because it is a statement of the finished plan with its new complexity.",
    },
    {
      id: "plan-stuck-precise",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "being-stuck-handled-well",
      kind: "single",
      prompt:
        "<p>You have a working O(n²) solution, and you know its bottleneck is re-scanning a prefix for the maximum of a shrinking window. Ten minutes in, and after working small examples by hand, you still cannot see a structure that gives that maximum in O(1). What is the best next move?</p>",
      choices: [
        {
          id: "a",
          text: "Stay quiet and keep thinking, because speaking would show the gap.",
          why: "Undeclared silence for minutes reads badly. If you need quiet time, say so, use it, and come back with a statement rather than a mumble.",
        },
        {
          id: "b",
          text: "State the bottleneck and the exact gap, then ask for a hint.",
          why: "A precise request, such as being unable to see a way to keep the maximum of a shrinking window in O(1), lets the interviewer give a small hint instead of a large one. It also shows you have a procedure for being stuck.",
        },
        {
          id: "c",
          text: "Code the brute force silently and hope it passes.",
          why: "You already have a working solution and are stuck on making it faster, so coding the same thing again does not move you forward. Doing it silently also removes what the interviewer came to see, which is your reasoning.",
        },
        {
          id: "d",
          text: "Ask the interviewer which data structure to use, with no description of what you tried.",
          why: "A vague request hides the work you have done and hands over the thinking. A hint that follows a precise description of where you are stuck is far cheaper for both of you.",
        },
      ],
      answer: "b",
    },
    {
      id: "plan-hostile-top-k",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "discussing-tradeoffs-at-a-senior-level",
      kind: "single",
      prompt:
        "<p>You must return the k = 10 largest values from n = 1,000,000 numbers, on a code path that handles user-submitted data, so the input may be crafted to hurt you. Which choice is the most defensible, and why?</p>",
      choices: [
        {
          id: "a",
          text: "Keep a min-heap of size k, which guarantees O(n log k) time and uses O(k) space.",
          why: "The bound holds for every input, whatever order the numbers arrive in. When the input may be hostile, a guaranteed bound is worth more than a better average.",
        },
        {
          id: "b",
          text: "Use quickselect, because its O(n) is strictly better than the heap's O(n log k).",
          why: "Quickselect's O(n) is an expected time. Its worst case is O(n²), and an input crafted against a predictable pivot rule can force it; a random pivot makes that unlikely but still gives no guarantee. On a path with hostile input, a guaranteed bound is the safer choice.",
        },
        {
          id: "c",
          text: "Sort the whole array and take the first k, because it is the simplest and so always the best.",
          why: "Sorting is simple and has a guaranteed bound, but it does O(n log n) work to answer a question that needs only k elements. Simplicity can justify it, but not as an automatic best.",
        },
        {
          id: "d",
          text: "Count each distinct value in a hash map and read the top k counts.",
          why: "The task asks for the largest values, not the most frequent ones. A count of occurrences says nothing about which values are largest.",
        },
      ],
      answer: "a",
    },
    {
      id: "plan-empty-max",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "edge-case",
      pattern: "interview-strategy",
      section: "test-before-you-say-done",
      kind: "single",
      prompt:
        "<p>You are testing your own code before saying you are done, and you try the empty input. What does <code>bestOf([])</code> return?</p><pre><code>function bestOf(nums) {\n  return Math.max(...nums);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>0</code>",
          why: "<code>Math.max</code> does not default to 0. Code that treats 0 as the answer for an empty input is making up a contract nobody agreed to.",
        },
        {
          id: "b",
          text: "<code>undefined</code>",
          why: "<code>Math.max()</code> always returns a number. A missing answer would have to come from your own code, for example from <code>nums[0]</code> on an empty array.",
        },
        {
          id: "c",
          text: "<code>-Infinity</code>",
          why: "With no arguments, <code>Math.max</code> returns <code>-Infinity</code>, the identity for maximum. It slips through without an error, which is why the empty input belongs in the tests, along with an agreed return value for it.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>.",
          why: "Spreading an empty array into a call is legal and gives a call with no arguments. Nothing throws, and the wrong value flows on silently.",
        },
      ],
      answer: "c",
    },
    {
      id: "plan-same-element-twice",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "edge-case",
      pattern: "interview-strategy",
      section: "test-before-you-say-done",
      kind: "single",
      prompt:
        "<p>The task is to find two different indexes in a sorted array whose values add up to <code>target</code>. A teammate changes the loop condition from <code>left &lt; right</code> to <code>left &lt;= right</code>. What does <code>pairWithSum([5], 10)</code> return now?</p><pre><code>function pairWithSum(nums, target) {\n  let left = 0;\n  let right = nums.length - 1;\n  while (left &lt;= right) {\n    const sum = nums[left] + nums[right];\n    if (sum === target) return [left, right];\n    if (sum &lt; target) left++;\n    else right--;\n  }\n  return null;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>null</code>, because a single element cannot make a pair of two.",
          why: "That is what <code>left &lt; right</code> returns, since its body never runs with one element. With <code>&lt;=</code> the loop does run once, with both pointers on the same element.",
        },
        {
          id: "b",
          text: "<code>[0, 1]</code>, because the pair spans the array.",
          why: "The array has only index 0. Nothing in the code can produce an index of 1 here.",
        },
        {
          id: "c",
          text: "It throws, because <code>nums[right]</code> is out of range.",
          why: "<code>right</code> starts at 0, which is a valid index for a one-element array, so every read is in range.",
        },
        {
          id: "d",
          text: "<code>[0, 0]</code>, because the one element is added to itself.",
          why: "With <code>left</code> and <code>right</code> both 0, the sum is 5 + 5 = 10, which equals the target, so the function returns <code>[0, 0]</code>. It reuses one element, which the task forbids. The single-element test is the one that catches <code>&lt;</code> versus <code>&lt;=</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "plan-clarify-what-the-example-leaves",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "the-first-five-minutes-questions-that-change-the-answer",
      kind: "single",
      prompt:
        "<p>A problem asks you to count the subarrays of <code>nums</code> whose sum is <code>k</code>. Its one example is <code>nums = [3, -1, 3, 4]</code> with <code>k = 6</code>, and the output is 1. Which question is worth asking before you start?</p>",
      choices: [
        {
          id: "a",
          text: "Can the values in the array be negative numbers?",
          why: "The example already contains a -1, so the answer is yes. Asking it reads as not having read the problem. Take what the example settles, say so, and ask only about what it leaves open.",
        },
        {
          id: "b",
          text: "What should I return for an empty array, and how large can n get?",
          why: "The example says nothing about an empty array, and n fixes your target complexity. Both answers can change your solution, which is the test for a question worth asking.",
        },
        {
          id: "c",
          text: "Am I allowed to use a hash map for this problem?",
          why: "This does not change the solution and spends goodwill. Choosing a structure is your job, and you can name your choice while you explain the plan.",
        },
        {
          id: "d",
          text: "Can the array contain duplicate values, such as two equal numbers?",
          why: "The example has two 3s, so duplicates are allowed. Say that you will assume so, as the example shows it, rather than asking.",
        },
      ],
      answer: "b",
    },
    {
      id: "plan-minute-25",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "the-45-minutes-as-checkpoints-not-hopes",
      kind: "single",
      prompt:
        "<p>It is minute 25 of a 45-minute interview. You have a plan and two nicely written helper functions, but the main loop does not exist yet. What is the best move?</p>",
      choices: [
        {
          id: "a",
          text: "Polish the two helpers and handle the edge cases first, so that what you hand over is clean.",
          why: "Clean helpers without a program leave nothing to trace or test, and the remaining time is the least you will ever have for the part that matters.",
        },
        {
          id: "b",
          text: "Ask the interviewer to give the main loop.",
          why: "That abandons the part of the problem being assessed. A precise question about one detail is fine; handing over the central logic is not.",
        },
        {
          id: "c",
          text: "Switch to a different, simpler approach.",
          why: "Nothing has been shown to be wrong with the plan. Starting over at minute 25 spends time that a missing loop does not justify.",
        },
        {
          id: "d",
          text: "Write the core loop now, and stub the other helpers with a one-line contract each.",
          why: "Working structure is what the last twenty minutes need: it can be traced and tested, and a stub with a stated contract shows the design while its body is still missing.",
        },
      ],
      answer: "d",
    },
    {
      id: "plan-greedy-six",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "trace",
      pattern: "interview-strategy",
      section: "pivoting-off-a-wrong-approach-without-losing-the-interview",
      kind: "single",
      prompt:
        "<p>Coins are 1, 3 and 4. The idea is to take the largest coin that fits, repeatedly. How many coins does that use for 6, and is it the fewest possible?</p>",
      choices: [
        {
          id: "a",
          text: "2 coins (3 and 3), and that is the fewest, which greedy also finds on its own.",
          why: "Largest-first does not choose 3 and 3. It takes the largest coin that fits, which is 4, so it ends up with more coins than the best combination.",
        },
        {
          id: "b",
          text: "3 coins (4, 1, 1), but 3 and 3 needs only 2: greedy is not safe here.",
          why: "After taking 4 the remainder is 2, which can only be paid with 1 and 1. The better answer uses the 3 twice, so 6 is a counterexample, and it is the smallest one for these coins.",
        },
        {
          id: "c",
          text: "3 coins (4, 1 and 1), and it is the fewest.",
          why: "Three coins is what greedy uses, but 3 and 3 reaches 6 with two coins, so it is not the fewest.",
        },
        {
          id: "d",
          text: "2 coins (4 and 2), because greedy can use a 2 to finish the amount.",
          why: "There is no coin of value 2 in this set.",
        },
      ],
      answer: "b",
    },
    {
      id: "plan-majority-guarantee",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "edge-case",
      pattern: "interview-strategy",
      section: "follow-ups-it-is-a-stream-it-is-sorted-it-does-not-fit-on-on",
      kind: "single",
      prompt:
        "<p>A stream is processed with one candidate and one counter: a matching value adds a vote, a different one removes a vote, and a value that arrives at zero votes becomes the candidate. After the stream ends, what can you say about the candidate?</p>",
      choices: [
        {
          id: "a",
          text: "If a value appeared more than half the time it is the candidate; otherwise it may be any value.",
          why: "A strict majority cannot be fully cancelled by pairing, since each cancellation removes one copy of it and one of something else. Without a majority the survivor is arbitrary, and a stream gives no second pass to check.",
        },
        {
          id: "b",
          text: "It is the value that appeared last.",
          why: "The last value is the candidate only if the votes had reached zero just before it, which depends on the whole stream.",
        },
        {
          id: "c",
          text: "It is the most frequent value in the stream, with ties broken by whichever came first.",
          why: "Pairing off different values can leave a candidate that is not the most frequent when no value has a strict majority.",
        },
        {
          id: "d",
          text: "It is always a value that appeared strictly more often than every other value, so the stream's winner is known.",
          why: "No such guarantee holds. For the stream 1, 2, 3 the candidate is 3, which appeared once, exactly as often as the others.",
        },
      ],
      answer: "a",
    },
    {
      id: "plan-subset-forty",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "when-the-problem-is-np-hard-recognise-it-then-say-the-right-",
      kind: "single",
      prompt:
        "<p>The task is to choose a subset of n numbers whose sum is as close as possible to a goal. The constraints say n is at most 40 and each number can be as large as 10<sup>9</sup>. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "A DP over every possible sum.",
          why: "The sums reach about 4 × 10<sup>10</sup>, so a table indexed by sum is far too large. A sum-indexed DP suits small values.",
        },
        {
          id: "b",
          text: "Enumerate all 2<sup>40</sup> subsets.",
          why: "That is about 10<sup>12</sup> subsets, far beyond the roughly 10<sup>8</sup> simple steps that fit in a second.",
        },
        {
          id: "c",
          text: "Split into two halves of 20, list each half's sums, sort one list and match them.",
          why: "Each half has about a million sums, so the work is around 2<sup>n/2</sup> · n steps, which fits. Because the values are large and n is capped at 40, an exponential method in n/2 is what the constraints point to.",
        },
        {
          id: "d",
          text: "A greedy pass that takes the largest remaining number which does not overshoot the goal, then stops.",
          why: "Greedy has no guarantee of finding the closest sum here, and a small example shows it can miss an exact match that exists.",
        },
      ],
      answer: "c",
    },
    {
      id: "plan-affordable-factorial",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "complexity",
      pattern: "interview-strategy",
      section: "when-the-problem-is-np-hard-recognise-it-then-say-the-right-",
      kind: "single",
      prompt:
        "<p>A search tries every ordering of n items, so its cost is n! steps, and about 10<sup>8</sup> simple steps fit in the time limit. What is the largest n that fits?</p>",
      choices: [
        {
          id: "a",
          text: "20, because 2<sup>20</sup> is about a million.",
          why: "That is the cost of subsets, not orderings. The number of orderings of 20 items is about 2.4 × 10<sup>18</sup>.",
        },
        {
          id: "b",
          text: "11, because 11! is about 4 × 10<sup>7</sup> and 12! is about 4.8 × 10<sup>8</sup>.",
          why: "11! is 39,916,800, which fits, and 12! is 479,001,600, which does not.",
        },
        {
          id: "c",
          text: "26, because 2<sup>26</sup> is about 6.7 × 10<sup>7</sup>.",
          why: "26 is the answer for 2<sup>n</sup>. Orderings grow much faster, and 26! is astronomically large.",
        },
        {
          id: "d",
          text: "15, because it lies about halfway between the limits for the other costs in the table.",
          why: "15! is about 1.3 × 10<sup>12</sup>, thousands of times over the budget.",
        },
      ],
      answer: "b",
    },
    {
      id: "plan-proof-two-pointers",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "proving-it-correct-in-one-sentence",
      kind: "single",
      prompt:
        "<p>The sorted two-sum loop moves <code>lo</code> up when <code>nums[lo] + nums[hi] &lt; target</code>. Which sentence best explains why this never loses an answer?</p>",
      choices: [
        {
          id: "a",
          text: "Sorted order makes <code>nums[hi]</code> the largest value in range, so <code>lo</code> with any partner is too small: it is in no valid pair.",
          why: "This names the fact that makes the discard safe: nothing in range can be larger than <code>nums[hi]</code>. It also shows the loop terminates, since every step discards one index.",
        },
        {
          id: "b",
          text: "It passed every example I tried, including empty, single-element and duplicate inputs, so it works.",
          why: "Examples show behaviour on inputs you thought of. They are not an argument about inputs you did not think of.",
        },
        {
          id: "c",
          text: "Moving <code>lo</code> up makes the sum larger, which is the direction the loop needs to move in order to reach the target, and that is the whole reason for the move.",
          why: "That says the move helps, but not that no answer was lost. The claim to prove is that the skipped index belongs to no valid pair.",
        },
        {
          id: "d",
          text: "The loop runs at most n times and each step does constant work, so it is fast and therefore correct.",
          why: "Speed is a different question from correctness. A fast loop that discards a useful index is still wrong.",
        },
      ],
      answer: "a",
    },
    {
      id: "plan-distributed-combine",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "follow-ups-it-is-a-stream-it-is-sorted-it-does-not-fit-on-on",
      kind: "single",
      prompt:
        "<p>Data is spread over many machines. For which question can the global answer be built from nothing more than each machine's own answer to the same question?</p>",
      choices: [
        {
          id: "a",
          text: "The median of all the values, from each machine's median.",
          why: "The medians of the parts do not determine the median of the whole. Two machines can have the same median and very different spreads.",
        },
        {
          id: "b",
          text: "The most frequent value, from each machine's most frequent value.",
          why: "A value that is second most frequent on every machine can be the most frequent overall, so the local winners are not enough.",
        },
        {
          id: "c",
          text: "The number of distinct values, from each machine's distinct count.",
          why: "The same value can appear on several machines, so adding the local counts double counts it.",
        },
        {
          id: "d",
          text: "The k largest values, from each machine's k largest.",
          why: "Every element of the global top k is also in the top k of the machine that holds it, so the coordinator only needs the best k of the union of those lists.",
        },
      ],
      answer: "d",
    },
    {
      id: "plan-minimise-maximum",
      chapter: "dsa-interview-strategy",
      level: "advanced",
      skill: "recognise",
      pattern: "interview-strategy",
      section: "keywords-to-a-first-guess-and-the-check-before-you-commit",
      kind: "single",
      prompt:
        "<p>A statement asks you to split work so that the largest load is as small as possible. Which first guess and which check does the chapter's table suggest?</p>",
      choices: [
        {
          id: "a",
          text: "A heap; check that k is small compared with n.",
          why: "That is the guess for top-k questions. This statement asks for a best value of a quantity, not for the k largest items.",
        },
        {
          id: "b",
          text: "A sliding window; check that adding an element only pushes the window in one direction at a time.",
          why: "A window suits questions about a contiguous range with a monotone constraint. A minimum-of-a-maximum question is about a threshold.",
        },
        {
          id: "c",
          text: 'Binary search on the answer; check that "can all loads stay within x?" flips only once.',
          why: "If x is feasible then any larger x is too, so the feasible values form a boundary that binary search can find, each probe being one greedy feasibility check.",
        },
        {
          id: "d",
          text: "Union-find; check whether queries are dynamic.",
          why: "Union-find answers connectivity questions, which this statement is not about.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "interview-strategy",
    chapter: "dsa-interview-strategy",
    signals: [
      "The problem is new to you and the statement leaves out sizes, ranges or what to return in edge cases.",
      "The constraints give a bound on n, and the bound tells you which complexity the setter intended.",
      "A brute force is easy to state, and the work is in seeing which repeated step can be bought back with a data structure.",
      "You are stuck, or you have a candidate solution and are about to say that you are done.",
    ],
    template:
      "<pre><code>1. Restate the problem and ask what the examples leave open.\n2. Work the example by hand.\n3. State a brute force with its complexity.\n4. Name the bottleneck.\n5. Read the constraint on n for the target complexity.\n6. Pick the structure that removes the bottleneck.\n7. Confirm the plan, then code while narrating.\n8. Trace the example and one edge case, then state the trade-offs.</code></pre>",
    time: "Set by the bound on n: about 10^8 simple operations per second",
    space: "Check the memory limit as well as the time limit",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
