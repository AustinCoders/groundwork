import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "dc-recognise-pairs",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "recognise",
      pattern: "divide-and-conquer",
      section: "count-of-range-sum",
      placement: true,
      kind: "single",
      prompt:
        "<p>Count the pairs of positions <code>i &lt; j</code> with <code>nums[i] &gt; 3 * nums[j]</code> in an array of up to 100,000 numbers. Checking every pair is too slow. Which plan fits?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the array once, then move one pointer in from each end and count pairs as the pointers cross.",
          why: "Sorting throws away the positions, and the condition <code>i &lt; j</code> depends on them. A sorted array no longer says which element came first.",
        },
        {
          id: "b",
          text: "Keep a <code>Map</code> keyed by <code>3 * nums[j]</code> and look up each <code>nums[i]</code> to count the pairs it completes.",
          why: "A <code>Map</code> answers equality questions. The condition here is an inequality, so there is no single key to look up.",
        },
        {
          id: "c",
          text: "Merge sort it, counting the cross pairs between the sorted halves just before each merge.",
          why: "Every pair is split at exactly one level, where one element is in the left half and the other in the right. With both halves sorted, the matching right elements for each left element form one run whose end only moves right, so the count costs a linear pass per level.",
        },
        {
          id: "d",
          text: "Check every pair with two loops, but break out of the inner loop early whenever the pair cannot work.",
          why: "Without an order on the data there is no point at which the inner loop can safely stop. The worst case is still quadratic.",
        },
      ],
      answer: "c",
    },
    {
      id: "dc-recognise-parens",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "recognise",
      pattern: "divide-and-conquer",
      section: "different-ways-to-add-parentheses",
      placement: true,
      kind: "single",
      prompt:
        '<p>For an expression such as <code>"2*3-4*5"</code>, return every value it can take over all ways of putting in parentheses. Which plan is the divide-and-conquer one?</p>',
      choices: [
        {
          id: "a",
          text: "Evaluate from left to right with a stack of numbers and operators, applying each operator as it is met.",
          why: "That fixes one order of evaluation, so it produces one value. The question asks for the values of all the orders.",
        },
        {
          id: "b",
          text: "Apply every multiplication first, then the additions and subtractions from left to right.",
          why: "That is one particular parenthesization, which gives one value. It is how the usual precedence rules read the string, not a way to list the others.",
        },
        {
          id: "c",
          text: "Binary search over the possible values and test whether each one can be produced.",
          why: "The task is to list all values, not to find one that satisfies a test, and the set of reachable values has no order that a search could use.",
        },
        {
          id: "d",
          text: "Try each operator as the last one applied, solve both sides, and pair up their results.",
          why: "The last operator splits the expression into two independent sub-expressions. Each side has its own list of results, and the operator is applied to every pair. The same sub-expressions come up under several splits, so a cache keyed by the range of tokens avoids redoing them.",
        },
      ],
      answer: "d",
    },
    {
      id: "dc-recognise-median",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "recognise",
      pattern: "divide-and-conquer",
      section: "median-of-two-sorted-arrays-as-a-k-th-element-search",
      placement: true,
      kind: "single",
      prompt:
        "<p>Two arrays are each sorted and hold m and n numbers. Which plan finds their median in less than O(m + n) time?</p>",
      choices: [
        {
          id: "a",
          text: "Merge the two arrays into one sorted array and read the middle element, or the two middle ones.",
          why: "Merging writes every element once, so it takes O(m + n) time. It is correct and simple, but it is the cost the question wants to beat.",
        },
        {
          id: "b",
          text: "Push every number into a min-heap and pop elements until the middle one is reached.",
          why: "Building and popping a heap of all m + n numbers costs more than a merge, and it ignores that each array is already sorted.",
        },
        {
          id: "c",
          text: "Concatenate the two arrays, sort the result, and read the middle element or the two middle ones.",
          why: "Sorting costs O((m + n) log(m + n)), which is worse than merging two sorted arrays.",
        },
        {
          id: "d",
          text: "Treat the median as the k-th smallest of the union and discard blocks of k/2 elements that cannot hold it.",
          why: "The smaller of the two compared elements has fewer than k elements before it, so it and everything before it in its array cannot be the k-th. Each step discards about half of what is left to find, so there are O(log(m + n)) steps and no merge at all.",
        },
      ],
      answer: "d",
    },
    {
      id: "dc-two-calls-constant",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "complexity",
      pattern: "divide-and-conquer",
      section: "reading-the-recurrence-off-the-code",
      kind: "single",
      prompt:
        "<p>A function on the range <code>[lo, hi)</code> makes two recursive calls, one on each half, and does a constant amount of work outside the calls, for example returning the larger of the two results. What is its running time on n elements?</p>",
      choices: [
        {
          id: "a",
          text: "O(log n)",
          why: "That is the cost when only one half is visited, as in binary search. Here both halves are visited, so the number of calls doubles at every level.",
        },
        {
          id: "b",
          text: "O(n)",
          why: "The levels have 1, 2, 4 and so on calls, up to about n at the bottom, each doing constant work. The sum of that series is a constant multiple of the bottom level.",
        },
        {
          id: "c",
          text: "O(n log n)",
          why: "That needs linear work at every level, as in merge sort. Here a level of k calls does k units of work, and the total over all levels is only O(n).",
        },
        {
          id: "d",
          text: "O(n²)",
          why: "The recursion tree has about 2n nodes in all, and every node does constant work. Nothing in it grows quadratically.",
        },
      ],
      answer: "b",
    },
    {
      id: "dc-slice-cost",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "complexity",
      pattern: "divide-and-conquer",
      section: "reading-the-recurrence-off-the-code",
      kind: "single",
      prompt:
        "<p>A function makes two recursive calls, one on each half of its array, and returns the larger of the two results. It passes the halves with <code>nums.slice(0, mid)</code> and <code>nums.slice(mid)</code>, and does nothing else outside the calls. What is its running time on n elements?</p>",
      choices: [
        {
          id: "a",
          text: "O(n), because slice is a built-in operation and so adds nothing to the cost of the calls.",
          why: "A slice copies its elements, whoever wrote it. Being built in does not make the copy free.",
        },
        {
          id: "b",
          text: "O(log n), because slicing cuts the array in half at every call and so halves the work.",
          why: "Slicing makes a copy of each half, and both halves are still processed. The number of elements handled does not shrink.",
        },
        {
          id: "c",
          text: "O(n log n): every level copies n elements in total, over about log₂ n levels.",
          why: "The two slices at the top copy n elements between them, the four at the next level copy n again, and so on for each of the log₂ n levels. For 1,024 elements that is 10,240 elements copied in all.",
        },
        {
          id: "d",
          text: "O(n²), because each of the calls copies up to n elements into a new array.",
          why: "Only the top call copies about n elements. The calls below copy halves, then quarters, so each level copies n in total, not n per call.",
        },
      ],
      answer: "c",
    },
    {
      id: "dc-strip-sort-cost",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "complexity",
      pattern: "divide-and-conquer",
      section: "closest-pair-of-points",
      kind: "single",
      prompt:
        "<p>A closest-pair solution sorts the strip by y with a built-in sort at every level of the recursion, instead of carrying the y order up by merging. The strip can hold every point of the range. What is the total running time, after the one sort by x?</p>",
      choices: [
        {
          id: "a",
          text: "O(n log n)",
          why: "That is the bound when the y order comes for free from a merge. Sorting the strip adds a log factor to every level.",
        },
        {
          id: "b",
          text: "O(n log² n)",
          why: "A level sorts strips whose sizes add up to at most n, which costs O(n log n). There are about log₂ n levels, so the total is O(n log n) times O(log n).",
        },
        {
          id: "c",
          text: "O(n²)",
          why: "The scan of the strip is still linear, because each point meets only a handful of neighbours. Nothing in this version is quadratic.",
        },
        {
          id: "d",
          text: "O(n)",
          why: "Even the first sort by x costs O(n log n), so no bound below n log n is possible here.",
        },
      ],
      answer: "b",
    },
    {
      id: "dc-trace-smaller-after",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "trace",
      pattern: "divide-and-conquer",
      section: "count-of-smaller-numbers-after-self",
      kind: "single",
      prompt: "<p>The chapter's <code>countSmaller</code> runs on <code>[4, 1, 3, 2]</code>. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[3, 0, 1, 0]</code>",
          why: "The 4 has three smaller numbers to its right (1, 3 and 2), the 3 has one (the 2), and the 1 and the 2 have none. The bottom merges give the 4 one and the 3 one, and the last merge adds two more to the 4, which jumps over 2 and 3.",
        },
        {
          id: "b",
          text: "<code>[1, 0, 1, 0]</code>",
          why: "That is the state after the two bottom merges only. The last merge, of the sorted halves [1, 4] and [2, 3], still adds 2 to the count of the 4.",
        },
        {
          id: "c",
          text: "<code>[3, 0, 2, 0]</code>",
          why: "The 3 has only one smaller number after it, the 2. The 4 sits before the 3 and is not counted for it.",
        },
        {
          id: "d",
          text: "<code>[2, 0, 1, 0]</code>",
          why: "That gives the 4 only two of its three smaller neighbours. The bottom merge counts the 1 for the 4, and the last merge counts the 2 and the 3, for three in all.",
        },
      ],
      answer: "a",
    },
    {
      id: "dc-tie-strictness",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "edge-case",
      pattern: "divide-and-conquer",
      section: "count-of-smaller-numbers-after-self",
      kind: "single",
      prompt:
        "<p>In <code>countSmaller</code> the merge takes the left element when <code>nums[order[i]] &lt;= nums[order[j]]</code>. If the test is changed to <code>&lt;</code>, what does <code>countSmaller([2, 2])</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[0, 1]</code>",
          why: "Counts belong to elements that are written from the left half. The second 2 is in the right half and is never given a count in this merge.",
        },
        {
          id: "b",
          text: "<code>[1, 1]</code>",
          why: "The right element gets no count from this merge, so its entry stays 0.",
        },
        {
          id: "c",
          text: "<code>[0, 0]</code>",
          why: "That is the correct answer, and the code with <code>&lt;=</code> returns it: equal elements are not smaller. With <code>&lt;</code> the tie goes to the right.",
        },
        {
          id: "d",
          text: "<code>[1, 0]</code>",
          why: "On a tie the strict test is false, so the right element is written first. When the left 2 is written afterwards, one right element has already gone before it, and that equal element is counted as smaller.",
        },
      ],
      answer: "d",
    },
    {
      id: "dc-crossing-seed",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "edge-case",
      pattern: "divide-and-conquer",
      section: "maximum-subarray-and-why-kadane-wins",
      kind: "single",
      prompt:
        "<p>In <code>maxSubarrayDC</code> the two crossing scans start with <code>leftBest</code> and <code>rightBest</code> equal to 0 instead of <code>-Infinity</code>. Which input now returns a wrong answer?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[4, -1, 2, 1]</code>",
          why: "The array has positive elements, so the true best is 6. A seed of 0 can only add the empty choice on one side of a crossing, and a sum of 0 never exceeds 6, so the answer stays right.",
        },
        {
          id: "b",
          text: "<code>[-3, -1, -2]</code>",
          why: "The crossing sum is now 0 + 0 whatever the scans see, which beats every negative sum. The function returns 0, but the best non-empty subarray is <code>[-1]</code> with sum -1.",
        },
        {
          id: "c",
          text: "<code>[1, 2, 3]</code>",
          why: "Every element is positive and the true best is 6. The seed adds only an empty choice worth 0, which cannot beat it, so the answer stays right.",
        },
        {
          id: "d",
          text: "<code>[-1, 5, -2]</code>",
          why: "The array holds a positive element, so the true best is 5. The seed only adds an empty choice worth 0, which cannot beat 5, so the answer stays right. The seed goes wrong only when every element is negative.",
        },
      ],
      answer: "b",
    },
    {
      id: "dc-majority-threshold",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "edge-case",
      pattern: "divide-and-conquer",
      section: "majority-element-by-splitting",
      kind: "single",
      prompt:
        "<p>The chapter's <code>findMajority([1, 1, 2, 2])</code> returns <code>null</code>. Which single change would make it return 1?</p>",
      choices: [
        {
          id: "a",
          text: "Use <code>&gt;=</code> instead of <code>&gt;</code> when comparing a count with <code>need</code>.",
          why: "Here <code>need</code> is 2, and the value 1 appears exactly twice, so <code>&gt;=</code> accepts it. Exactly half the length is not a strict majority.",
        },
        {
          id: "b",
          text: "Add 1 to <code>need</code>, so that a candidate has to beat a higher threshold.",
          why: "That makes the test stricter, so <code>[1, 1, 2, 2]</code> still gives <code>null</code>. It breaks other inputs: <code>[2, 2, 1]</code> would no longer find its majority.",
        },
        {
          id: "c",
          text: "Use <code>-1</code> as the marker for no candidate instead of a <code>Symbol</code>, since -1 looks like a safe unused value.",
          why: "For <code>[1, 1, 2, 2]</code> the answer is still <code>null</code>. The change breaks arrays that really contain -1, such as <code>[-1, -1, 2]</code>, which would report no majority.",
        },
        {
          id: "d",
          text: "Delete the line <code>if (left === right) return left;</code> so that equal candidates are always counted.",
          why: "The line is a shortcut. Without it, equal candidates are confirmed by counting and returned all the same, so the results do not change, only the amount of counting.",
        },
      ],
      answer: "a",
    },
    {
      id: "dc-recognise-rare-split",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "recognise",
      pattern: "divide-and-conquer",
      section: "split-on-the-elements-that-cannot-be-in-the-answer",
      kind: "single",
      prompt:
        "<p>Find the longest substring of <code>s</code> in which every character appears at least <code>k</code> times. Which observation drives the divide-and-conquer solution?</p>",
      choices: [
        {
          id: "a",
          text: "Grow a window to the right and shrink it from the left as soon as one of the counts drops below k.",
          why: "Validity is not monotone. Adding a character can make a window invalid and adding another can make it valid again, so there is no shrinking rule that keeps a single window correct.",
        },
        {
          id: "b",
          text: "Split the string in the middle and return the longer of the two halves that are valid.",
          why: "The best substring can cross the middle, and a half can be invalid while a longer valid substring lies inside the whole string.",
        },
        {
          id: "c",
          text: "A character with fewer than k copies in the whole string can be in no valid substring, so split there.",
          why: "A substring has no more copies of a character than the whole string does. Every answer therefore lies between occurrences of such a character, and each piece can be solved on its own. A piece with no rare character is valid as it stands.",
        },
        {
          id: "d",
          text: "Binary search on the length of the answer and test every window of that length for validity.",
          why: "Longer substrings are not always valid when shorter ones are, or the reverse, so the property that binary search needs does not hold.",
        },
      ],
      answer: "c",
    },
    {
      id: "dc-lose-reasons",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "recognise",
      pattern: "divide-and-conquer",
      section: "when-divide-and-conquer-loses",
      kind: "multi",
      prompt:
        "<p>Select every situation in which a divide-and-conquer solution is likely to lose to another approach.</p>",
      choices: [
        {
          id: "a",
          text: "The same smaller question is reached by several different splits.",
          why: "Without a cache the shared piece is solved again each time. With a cache this is dynamic programming, which is the usual better fit.",
        },
        {
          id: "b",
          text: "The two halves are independent of each other.",
          why: "Independence is what divide and conquer needs. It lets the halves be solved in either order, or at the same time.",
        },
        {
          id: "c",
          text: "A single pass with a running value can carry the answer.",
          why: "Kadane's algorithm and the majority vote are examples. They take linear time and constant space where the split costs n log n time and a stack.",
        },
        {
          id: "d",
          text: "The split is balanced, so each half has about n/2 elements.",
          why: "A balanced split is what keeps the recursion shallow and the recurrence at n log n. An unbalanced split is the one that hurts.",
        },
        {
          id: "e",
          text: "Merging two sub-answers costs as much as solving the whole problem directly.",
          why: "Then the recursion only adds calls and bookkeeping on top of the direct work.",
        },
      ],
      answers: ["a", "c", "e"],
    },
    {
      id: "dc-order-closest",
      chapter: "dsa-divide-conquer",
      level: "intermediate",
      skill: "trace",
      pattern: "divide-and-conquer",
      section: "closest-pair-of-points",
      kind: "order",
      prompt:
        "<p>Put the steps of the chapter's <code>closestPairSquared</code> in the order they happen for a range of at least four points.</p>",
      items: [
        { id: "sort", text: "Sort all the points by x, once, at the start." },
        {
          id: "solve",
          text: "Split the range at the middle, solve both halves recursively, and set <code>best</code> to the smaller of the two distances.",
        },
        { id: "merge", text: "Merge the two halves, which are each sorted by y, into one range sorted by y." },
        {
          id: "skip",
          text: "Walk the merged range in y order and skip every point whose squared distance from the dividing line is at least <code>best</code>.",
        },
        {
          id: "compare",
          text: "Compare each remaining point with the earlier strip points that are less than <code>best</code> below it, lowering <code>best</code> when a pair is closer.",
        },
      ],
      why: "Everything depends on the sort by x, because the split cuts at the middle of that order. The strip is defined by <code>best</code>, which exists only after both halves return, and the y order of the whole range comes from merging the y-sorted halves. The walk then decides for each point whether it is in the strip before comparing it with the earlier strip points, and the comparisons are what can lower <code>best</code> below the answer of either half.",
    },
  ],
  pattern: {
    pattern: "divide-and-conquer",
    chapter: "dsa-divide-conquer",
    signals: [
      "The task counts or finds pairs of positions that satisfy a relation, and the brute force over all pairs is quadratic.",
      "The answer is the best of three cases: inside the left half, inside the right half, or across the middle.",
      "Two answers of the same kind have to be merged into one, such as sorted lists, outlines or lists of results.",
      "The data is sorted and the k-th element or the median is wanted, so a block of elements can be discarded at each step.",
    ],
    template:
      "<pre><code>function solve(lo, hi) {\n  if (hi - lo &lt;= 1) return baseCase(lo, hi);\n  const mid = lo + ((hi - lo) &gt;&gt; 1);\n  const left = solve(lo, mid);\n  const right = solve(mid, hi);\n  return combine(left, right, lo, mid, hi);\n}</code></pre>",
    time: "O(n log n) when the combine is linear and the split is balanced",
    space: "O(log n) for the recursion, plus O(n) when merging",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
