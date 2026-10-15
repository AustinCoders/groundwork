import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "gr-largest-coin-first",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "recognise",
      pattern: "greedy",
      section: "the-property-that-has-to-hold-the-greedy-choice-property",
      placement: true,
      kind: "single",
      prompt:
        "<p>You must pay exactly 10 using the fewest coins, and the coin values are 1, 5 and 6, with as many of each as you like. A teammate says to take the largest coin that still fits, again and again. What happens?</p>",
      choices: [
        {
          id: "a",
          text: "It returns 6, 1, 1, 1, 1, which is five coins, and that is the fewest possible because the biggest coin was taken first.",
          why: "Five coins is not the fewest. Paying 5 + 5 needs only two coins, so taking the 6 first closed off the better answer. Taking the biggest piece first is only safe when that choice always belongs to some best solution.",
        },
        {
          id: "b",
          text: "It returns 6, 1, 1, 1, 1, five coins, while 5 + 5 uses two, so taking the 6 breaks the greedy-choice property here.",
          why: "The 6 looks best right now, but no best solution for 10 contains it. The greedy-choice property fails for the values 1, 5 and 6, and the rule returns a valid but wrong answer without any error. A DP over the amount tries every coin at every step and gets two.",
        },
        {
          id: "c",
          text: "It cannot reach 10 at all, because 6 does not divide 10 evenly and the leftover cannot be paid.",
          why: "The coin of value 1 can pay any leftover, so the rule always ends exactly on 10. The trouble is how many coins it spends, not whether it reaches the amount.",
        },
        {
          id: "d",
          text: "It returns 5 + 5, because 5 divides 10 exactly and so it is picked before any other coin.",
          why: "The rule picks the largest coin that fits, and 6 is larger than 5 and fits into 10, so 6 is taken first. Divisibility plays no part in the rule.",
        },
      ],
      answer: "b",
    },
    {
      id: "gr-fewest-points-for-segments",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "recognise",
      pattern: "greedy",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given segments on a number line, each with whole-number ends that count as part of the segment. Choose the fewest points so that every segment contains at least one chosen point. Which approach gives the right count?</p>",
      choices: [
        {
          id: "a",
          text: "Choose the midpoint of every segment, since a midpoint is as central as a point inside a segment can be.",
          why: "Its count can be as large as the number of segments, however much they overlap. For the segments [1, 3] and [2, 4], the single point 3 lies in both, but the midpoints are 2 and 3, which is two points.",
        },
        {
          id: "b",
          text: "Sort by left end; whenever a segment does not contain the last chosen point, choose that segment's left end.",
          why: "For the segments [1, 10], [2, 3] and [2, 3], it chooses 1 and then 2, which is two points, although the single point 2 lies in all three. Left ends are chosen too early to be shared with later segments.",
        },
        {
          id: "c",
          text: "Sort by right end; whenever a segment does not contain the last chosen point, choose its right end.",
          why: "The right end of the earliest-finishing uncovered segment is the furthest right that point can sit and still stab that segment, so it can reach the most later segments. Some best answer always contains that choice, so the count is the smallest possible.",
        },
        {
          id: "d",
          text: "Merge overlapping segments first, then choose one point inside each merged group.",
          why: "Merging chains segments together. The segments [1, 3], [3, 5] and [5, 7] merge into the single group [1, 7], yet no one point lies in all three of them, and the fewest points is two.",
        },
      ],
      answer: "c",
    },
    {
      id: "gr-why-earliest-finish",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "recognise",
      pattern: "greedy",
      section: "worked-example-activity-interval-scheduling",
      placement: true,
      kind: "single",
      prompt:
        "<p>To fit the most non-overlapping intervals, the greedy rule picks the interval that finishes earliest first. Which argument shows that this first choice is safe?</p>",
      choices: [
        {
          id: "a",
          text: "The interval that finishes earliest is always the shortest one, and taking short intervals first leaves the most room for the ones after it.",
          why: "The earliest finish is not always the shortest. Between [0, 3] and [5, 6], the interval [0, 3] finishes first but [5, 6] is shorter. The argument rests on where the interval ends, not on how long it is.",
        },
        {
          id: "b",
          text: "The interval that finishes earliest always starts earliest as well, so no other interval could ever come before it in a schedule.",
          why: "Finishing first does not mean starting first. Between [0, 10] and [5, 6], the interval [5, 6] finishes first and starts later. Safety comes from the end time alone.",
        },
        {
          id: "c",
          text: "After sorting by finish time, one pass over the list is enough to pick the intervals, and that makes the choice cheap to carry out.",
          why: "A cheap pass explains the running time, not the correctness. A rule can be cheap and still give a wrong answer, so it needs a separate argument that the choice cannot cost a better solution.",
        },
        {
          id: "d",
          text: "In any best solution, swap its first interval for the earliest-finishing one: that ends no later, so nothing clashes and the count stays.",
          why: "This is the exchange argument. The swapped-in interval ends at or before the one it replaces, so every interval that came after still fits, and the solution is no worse. Hence some best solution contains the greedy choice.",
        },
      ],
      answer: "d",
    },
    {
      id: "gr-when-largest-first-is-safe",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "recognise",
      pattern: "greedy",
      section: "greedy-vs-dp-how-to-decide-which-one-a-problem-wants",
      kind: "multi",
      prompt:
        "<p>Select every task where the simple rule named is guaranteed to give an optimal answer for every input of that kind.</p>",
      choices: [
        {
          id: "a",
          text: "Pick items to keep whole or leave out, maximising total value within a weight limit, by taking items in order of value per unit of weight.",
          why: "With weights 6, 5 and 5, values 10, 7 and 7 and a limit of 10, the rule takes the item with weight 6 and value 10 first, then neither other item fits, for a total of 10. The two items of weight 5 together are worth 14.",
        },
        {
          id: "b",
          text: "Pick items that may be split into fractions, maximising total value within a weight limit, taking them by value per unit of weight and splitting the last.",
          why: "When fractions are allowed, any unit of weight spent at a lower ratio could be swapped for a unit at a higher ratio without losing value, so taking items in ratio order is optimal.",
        },
        {
          id: "c",
          text: "Pay an amount with the fewest coins when the values are 1, 3 and 4, by always taking the largest coin that fits.",
          why: "For 6 the rule takes 4, 1, 1, which is three coins, while 3 + 3 is two. This set of values breaks the greedy-choice property.",
        },
        {
          id: "d",
          text: "Pay an amount with the fewest coins when the values are 1, 5, 10 and 25, by always taking the largest coin that fits.",
          why: "This particular set of values is known to work with the largest-first rule for every amount. The rule's safety depends on the values, which is why the same rule fails for 1, 3 and 4.",
        },
      ],
      answers: ["b", "d"],
    },
    {
      id: "gr-sort-by-start-instead",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "edge-case",
      pattern: "greedy",
      section: "worked-example-activity-interval-scheduling",
      kind: "single",
      prompt:
        "<p>A teammate changes the sort in <code>maxNonOverlapping</code> to order by start time, <code>a[0] - b[0]</code>, and leaves every other line alone. What does the changed function return for <code>[[1, 10], [2, 3], [4, 5]]</code>?</p><pre><code>function maxNonOverlapping(intervals) {\n  const sorted = [...intervals].sort((a, b) =&gt; a[0] - b[0]);\n\n  let count = 0, lastEnd = -Infinity;\n  for (const [start, end] of sorted) {\n    if (start &gt;= lastEnd) {\n      count++;\n      lastEnd = end;\n    }\n  }\n  return count;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "1, because [1, 10] is taken first and blocks both",
          why: "The long interval [1, 10] comes first and is taken, and then both later intervals start before 10, so neither is taken. The best answer is 2, with [2, 3] and [4, 5], which sorting by finish time finds.",
        },
        {
          id: "b",
          text: "2, because it still ends up taking [2, 3] and [4, 5]",
          why: "That is the best answer, but this version cannot reach it. Once [1, 10] is taken, <code>lastEnd</code> is 10, and neither [2, 3] nor [4, 5] starts at or after that.",
        },
        {
          id: "c",
          text: "3, because every interval is looked at once",
          why: "Looking at every interval does not mean taking every one. [1, 10] overlaps both of the others, so the three cannot all be taken.",
        },
        {
          id: "d",
          text: "0, because the first interval is never taken",
          why: "The first interval in the sorted order is always taken, because its start is at least <code>-Infinity</code>. The count therefore starts at 1 at least.",
        },
      ],
      answer: "a",
    },
    {
      id: "gr-touching-conflicts",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "edge-case",
      pattern: "greedy",
      section: "worked-example-activity-interval-scheduling",
      kind: "single",
      prompt:
        "<p>A new rule says that two intervals which share only an endpoint, such as [1, 2] and [2, 3], do conflict. Which single change to the chapter's <code>maxNonOverlapping</code> makes it follow that rule?</p>",
      choices: [
        {
          id: "a",
          text: "Sort by start time instead of finish time, and keep the rest of the loop as it is.",
          why: "The sort key decides which interval is tried first, not whether touching intervals conflict. Sorting by start would also lose the finish-time argument that makes the rule safe.",
        },
        {
          id: "b",
          text: "Sort by finish time in descending order, with <code>b[1] - a[1]</code>, and keep the rest.",
          why: "Latest-finishing first takes the interval that leaves the least room, which is the opposite of the rule. It does nothing about the endpoint comparison.",
        },
        {
          id: "c",
          text: "Compare with <code>start &gt; lastEnd</code> instead of <code>start &gt;= lastEnd</code>.",
          why: "With <code>&gt;=</code>, an interval starting exactly where the last pick ended is accepted. With <code>&gt;</code> it must start strictly after, so [1, 2] and [2, 3] conflict and only one of them is counted.",
        },
        {
          id: "d",
          text: "Start <code>lastEnd</code> at <code>0</code> instead of <code>-Infinity</code>.",
          why: "This only changes the first comparison, and it can wrongly reject intervals that start below 0. Two intervals that touch are compared by the <code>if</code> line, which stays as it was.",
        },
      ],
      answer: "c",
    },
    {
      id: "gr-jump-edge-inputs",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "edge-case",
      pattern: "greedy",
      section: "worked-example-jump-game-can-you-reach-the-end",
      kind: "multi",
      prompt:
        "<p>Each number is the longest jump you can make from that index. Select every array for which the chapter's <code>canJump</code> returns <code>true</code>.</p>",
      choices: [
        {
          id: "a",
          text: "<code>[0]</code>",
          why: "You start on the last index, so there is nowhere left to go. At <code>i = 0</code> the test <code>i &gt; farthestReachable</code> is <code>0 &gt; 0</code>, false, and the loop ends with <code>true</code>.",
        },
        {
          id: "b",
          text: "<code>[1, 0, 1]</code>",
          why: "From index 0 you reach index 1, and from index 1 the jump length is 0, so <code>farthestReachable</code> stays at 1. At <code>i = 2</code> the test <code>2 &gt; 1</code> returns <code>false</code>.",
        },
        {
          id: "c",
          text: "<code>[2, 0, 0]</code>",
          why: "From index 0 you can jump straight to index 2, so <code>farthestReachable</code> is 2. Index 2 is not beyond it, and the loop finishes with <code>true</code>, even though the zeros in the middle could not be jumped from.",
        },
        {
          id: "d",
          text: "<code>[0, 1]</code>",
          why: "The jump length at index 0 is 0, so <code>farthestReachable</code> stays 0. At <code>i = 1</code> the test <code>1 &gt; 0</code> returns <code>false</code>, and the 1 at index 1 is never used.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "gr-trace-gas-station",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "trace",
      pattern: "greedy",
      section: "worked-example-gas-station",
      kind: "single",
      prompt:
        "<p>Run the chapter's <code>canCompleteCircuit</code> on the input below. What does the call return?</p><pre><code>function canCompleteCircuit(gas, cost) {\n  let total = 0, tank = 0, start = 0;\n  for (let i = 0; i &lt; gas.length; i++) {\n    const diff = gas[i] - cost[i];\n    total += diff;\n    tank += diff;\n    if (tank &lt; 0) {\n      start = i + 1;\n      tank = 0;\n    }\n  }\n  return total &gt;= 0 ? start : -1;\n}\n\ncanCompleteCircuit([4, 2, 1, 5, 1], [2, 3, 3, 2, 2]);</code></pre>",
      choices: [
        {
          id: "a",
          text: "3",
          why: "The differences are 2, -1, -2, 3, -1, so <code>tank</code> goes 2, 1, -1. At <code>i = 2</code> it is negative, so <code>start</code> becomes 3 and <code>tank</code> resets. It then goes 3 and 2 and never drops below zero, and the total is 1, which is not negative.",
        },
        {
          id: "b",
          text: "2",
          why: "Index 2 is where <code>tank</code> first goes negative, but that means station 3 cannot be reached from the current start. The reset moves <code>start</code> to <code>i + 1</code>, which is 3.",
        },
        {
          id: "c",
          text: "0",
          why: "<code>start</code> begins at 0, but starting there fails: the tank is 2, then 1, then -1 on reaching index 3. The loop therefore moves <code>start</code> forward.",
        },
        {
          id: "d",
          text: "-1",
          why: "<code>-1</code> is returned only when the total of all differences is negative. Here the total is 2 - 1 - 2 + 3 - 1 = 1, so a valid start exists and the function returns it.",
        },
      ],
      answer: "a",
    },
    {
      id: "gr-sort-dominates",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "complexity",
      pattern: "greedy",
      section: "worked-example-activity-interval-scheduling",
      kind: "single",
      prompt:
        "<p>For <code>maxNonOverlapping</code> on n intervals, assume the built-in sort takes O(n log n) time in the worst case. What is the worst-case running time of the whole function?</p><pre><code>function maxNonOverlapping(intervals) {\n  const sorted = [...intervals].sort((a, b) =&gt; a[1] - b[1]);\n\n  let count = 0, lastEnd = -Infinity;\n  for (const [start, end] of sorted) {\n    if (start &gt;= lastEnd) {\n      count++;\n      lastEnd = end;\n    }\n  }\n  return count;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n), because the loop visits each interval once",
          why: "The loop is linear, but the sort before it is not. With a comparison sort the sort costs more than a single pass, and the total is the larger of the two.",
        },
        {
          id: "b",
          text: "O(n log n), because the sort outweighs the single pass",
          why: "The sort is O(n log n) and the loop adds O(n), and the sum is still O(n log n). This is why a greedy solution is usually cheaper than the DP it replaces, but not linear.",
        },
        {
          id: "c",
          text: "O(n²), because each interval is compared with the last pick",
          why: "Each interval is compared with a single saved number, <code>lastEnd</code>, not with every earlier pick. That comparison is constant work, so nothing here grows with n squared.",
        },
        {
          id: "d",
          text: "O(log n), because the greedy rule skips most intervals",
          why: "Skipping an interval still means looking at it, so the loop reads all n of them, and the sort before it handles all n as well. Nothing here discards half the input the way a binary search does.",
        },
      ],
      answer: "b",
    },
    {
      id: "gr-gas-station-one-pass",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "complexity",
      pattern: "greedy",
      section: "worked-example-gas-station",
      kind: "single",
      prompt:
        "<p>For <code>canCompleteCircuit</code> on n stations, what is the worst-case running time? The code is the one in the chapter, with a single <code>for</code> loop over the stations and a reset of <code>start</code> and <code>tank</code> inside it.</p>",
      choices: [
        {
          id: "a",
          text: "O(n²), because every time <code>start</code> moves, a fresh trial lap begins",
          why: "The reset only assigns two variables. No lap is replayed, and <code>i</code> keeps moving forward, so each station is processed exactly once.",
        },
        {
          id: "b",
          text: "O(n log n), because the best start has to be found among the stations",
          why: "Nothing is sorted or searched. The best start falls out of the single pass, as the last place where <code>tank</code> went negative plus one.",
        },
        {
          id: "c",
          text: "O(1), because the answer depends only on the totals",
          why: "The totals have to be added up first, and that takes a visit to every station. The extra memory is constant, but the time is not.",
        },
        {
          id: "d",
          text: "O(n), because each station is visited once and the reset is constant work",
          why: "One loop does a fixed amount of work per station, and the reset adds only two assignments. The proof that failed starts can be skipped is what saves the O(n²) of trying every start.",
        },
      ],
      answer: "d",
    },
    {
      id: "gr-order-gas-failure",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "trace",
      pattern: "greedy",
      section: "worked-example-gas-station",
      kind: "order",
      prompt:
        "<p>Put in order what one pass of the loop in <code>canCompleteCircuit</code> does at a station where <code>tank</code> ends up negative. Start with working out the difference at that station and end with the reset that moves the candidate start.</p>",
      items: [
        {
          id: "diff",
          text: "Work out <code>diff</code>, the gas gained at station <code>i</code> minus the cost of travelling on.",
        },
        { id: "add", text: "Add <code>diff</code> to both <code>total</code> and <code>tank</code>." },
        { id: "test", text: "Test whether <code>tank</code> is below zero." },
        { id: "reset", text: "Set <code>start</code> to <code>i + 1</code> and set <code>tank</code> back to 0." },
      ],
      why: "Each step needs the one before it. The difference has to exist before it can be added, the tank has to hold the new amount before it can be tested, and only a failed test moves the candidate start to the next station and empties the tank.",
    },
    {
      id: "gr-jump2-trace",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "trace",
      pattern: "greedy",
      section: "jump-game-ii-the-fewest-jumps-one-boundary-at-a-time",
      kind: "single",
      prompt:
        "<p>Run <code>jump</code> on the input below. What does it return?</p><pre><code>function jump(nums) {\n  let jumps = 0, currentEnd = 0, farthest = 0;\n  for (let i = 0; i &lt; nums.length - 1; i++) {\n    farthest = Math.max(farthest, i + nums[i]);\n    if (i === currentEnd) {\n      if (farthest &lt;= i) return -1;\n      jumps++;\n      currentEnd = farthest;\n    }\n  }\n  return jumps;\n}\n\njump([2, 1, 1, 1, 4]);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>2</code>",
          why: "Two jumps would have to reach index 4 from index 0, but the first jump reaches at most index 2 and the next block reaches only index 3. The loop spends a third jump at <code>i = 3</code>.",
        },
        {
          id: "b",
          text: "<code>-1</code>",
          why: "The <code>-1</code> is returned only when the farthest reach does not pass the current index at a block boundary. Here every boundary has a farthest reach beyond it, so the end is reachable.",
        },
        {
          id: "c",
          text: "<code>4</code>",
          why: "Four would mean a jump from every index, including the last one. The loop stops before the last index, and it only spends a jump at the end of a block.",
        },
        {
          id: "d",
          text: "<code>3</code>",
          why: "The boundaries are at <code>i = 0</code>, where the block grows to index 2, at <code>i = 2</code>, where it grows to index 3, and at <code>i = 3</code>, where it grows to index 4. That is three jumps.",
        },
      ],
      answer: "d",
    },
    {
      id: "gr-candy-without-max",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "edge-case",
      pattern: "greedy",
      section: "candy-two-passes-one-constraint-each",
      kind: "single",
      prompt:
        "<p>A teammate changes the second pass of <code>candy</code> to <code>give[i] = give[i + 1] + 1</code>, without the <code>Math.max</code>, and leaves the first pass alone. For the ratings <code>[1, 3, 4, 5, 2]</code>, how many candies does the changed function hand out in total?</p>",
      choices: [
        {
          id: "a",
          text: "11, the same as the correct version, because the first pass already settled everything.",
          why: "The correct total is 11, but the changed second pass overwrites the 4 given to the child rated 5 with 2. The first pass did not settle everything, because the second pass still touches that child.",
        },
        {
          id: "b",
          text: "9, because the child rated 5 drops from 4 candies to 2.",
          why: "The first pass gives <code>[1, 2, 3, 4, 1]</code>. In the second pass the child rated 5 is higher than the right neighbour, so it is set to <code>1 + 1 = 2</code>, giving <code>[1, 2, 3, 2, 1]</code>, a total of 9. That breaks the rule against the child rated 4 on the left, who holds 3.",
        },
        {
          id: "c",
          text: "5, because every child falls back to one candy.",
          why: "Only a child who is higher than the right neighbour is changed in the second pass. The children with increasing ratings on their right keep what the first pass gave them.",
        },
        {
          id: "d",
          text: "15, because the second pass adds to the first pass instead of replacing it.",
          why: "The second pass assigns a value to each child it changes. It never adds the new number on top of the old one, so the total does not grow past what the first pass produced.",
        },
      ],
      answer: "b",
    },
    {
      id: "gr-arrows-touching",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "edge-case",
      pattern: "greedy",
      section: "minimum-arrows-to-burst-balloons-the-same-shape-as-interval-",
      kind: "single",
      prompt:
        "<p>An arrow bursts a balloon when it hits any point of its span, ends included. A teammate changes the test in <code>findMinArrowShots</code> from <code>sorted[i][0] &gt; arrowAt</code> to <code>sorted[i][0] &gt;= arrowAt</code>. What does the changed function return for <code>[[1, 2], [2, 3]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1</code>, because the two spans share the point 2.",
          why: "1 is the correct answer, and it is what the original returns, since an arrow at 2 bursts both balloons. The changed test treats a balloon that starts exactly at the arrow as needing a new arrow.",
        },
        {
          id: "b",
          text: "<code>0</code>, because no arrow is shot when the spans touch.",
          why: "The function starts with one arrow for the first balloon, so a non-empty list never returns 0.",
        },
        {
          id: "c",
          text: "<code>3</code>, because each end of each span needs its own arrow.",
          why: "There are only two balloons, and a count of arrows above the number of balloons is never needed. The arrow count is bumped once per balloon that fails the test.",
        },
        {
          id: "d",
          text: "<code>2</code>, because the second balloon starts exactly where the first arrow is, and <code>&gt;=</code> counts that as not hit.",
          why: "The first arrow is at 2, the end of <code>[1, 2]</code>. The second balloon starts at 2, so <code>2 &gt;= 2</code> is true and a second arrow is shot, although the first one already bursts it.",
        },
      ],
      answer: "d",
    },
    {
      id: "gr-boats-recognise",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "recognise",
      pattern: "greedy",
      section: "sort-then-match-from-the-right-end-assign-cookies-and-boats",
      placement: true,
      kind: "single",
      prompt:
        "<p>People have given weights. Each boat carries at most two people and a total weight of at most <code>limit</code>, and everyone fits alone. You want the fewest boats. Which rule is correct?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the weights, then put the two heaviest people together if they fit, and keep going down the list.",
          why: "For the weights 1, 2, 4 and 5 with a limit of 6, the two heaviest, 5 and 4, do not fit together, so both ride alone, and then 1 and 2 share: 3 boats. Pairing 1 with 5 and 2 with 4 needs only 2.",
        },
        {
          id: "b",
          text: "Sort the weights, then take the heaviest person and add the lightest if they fit together; otherwise the heaviest rides alone.",
          why: "Whoever can share a boat with the heaviest person, the lightest can too, and regrouping any other plan this way never uses more boats. So the heaviest person can always be matched with the lightest if the two fit.",
        },
        {
          id: "c",
          text: "Keep a set of the weights already seen, and pair each person with someone who weighs exactly <code>limit</code> minus their own weight.",
          why: "Requiring the two weights to add up to exactly the limit misses pairs that fit with room to spare. For weights 1 and 2 with a limit of 5 they share a boat, but 1 + 2 is not 5.",
        },
        {
          id: "d",
          text: "Fill each boat in the order the people arrive, adding the next person whenever they fit.",
          why: "The input order can be bad. For the weights 4, 4, 1, 1 with a limit of 5, filling in order gives the boats {4}, {4, 1} and {1}, which is 3, while {4, 1} twice needs only 2.",
        },
      ],
      answer: "b",
    },
    {
      id: "gr-task-frame",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "trace",
      pattern: "greedy",
      section: "greedy-on-counts-task-scheduler-and-reorganize-string",
      kind: "single",
      prompt:
        "<p>Use the frame formula from the chapter: the answer is the larger of the number of tasks and <code>(maxCount - 1) * (n + 1) + withMax</code>. What is the answer for the tasks <code>A, A, A, B, B, C</code> with a cooldown <code>n = 2</code>?</p>",
      choices: [
        {
          id: "a",
          text: "6, the number of tasks.",
          why: "The frame is larger than 6, so idle time is needed. The three copies of A must start at least 3 units apart, which already takes 7 units.",
        },
        {
          id: "b",
          text: "8, because both A and B are the most frequent.",
          why: "Only A occurs 3 times; B occurs twice and C once. The count <code>withMax</code> is 1, not 2, so the frame is not the 8 that AAABBB would give.",
        },
        {
          id: "c",
          text: "7, from the frame <code>(3 - 1) * 3 + 1</code>.",
          why: "A occurs 3 times, so the frame is <code>2 * 3 + 1 = 7</code>, a layout like <code>A B C A B _ A</code>. It beats the 6 tasks, so it is the answer.",
        },
        {
          id: "d",
          text: "9, one idle for every cooldown unit.",
          why: "Idle units are only needed where no other task can fill a gap. Here B and C fill most of the gaps, so a single idle unit is enough, and the total is 7.",
        },
      ],
      answer: "c",
    },
    {
      id: "gr-huffman-cost",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "complexity",
      pattern: "greedy",
      section: "where-greedy-is-exactly-right-fractional-knapsack-and-huffma",
      kind: "single",
      prompt:
        "<p>The heap-free <code>huffmanCost</code> sorts the n frequencies once and then performs n - 1 merges, each taking the two smallest values from the fronts of two queues. What is its worst-case running time, assuming the sort is O(n log n)?</p>",
      choices: [
        {
          id: "a",
          text: "O(n), because the merging loop does constant work per merge.",
          why: "The merging loop is linear, but the sort before it is not. With a comparison sort, the total is dominated by the sort.",
        },
        {
          id: "b",
          text: "O(n²), because each merge has to look through all the remaining values for the smallest two.",
          why: "Each merge only looks at the front of two queues, which is constant work. Sorting once up front is what removes the search.",
        },
        {
          id: "c",
          text: "O(n log n), the sort, since the n - 1 merges after it cost O(n) in total.",
          why: "The merged sums come out in non-decreasing order, so the second queue never needs sorting. The sort sets the bound, and the heap version has the same bound.",
        },
        {
          id: "d",
          text: "O(n log² n), because each merge also costs a logarithmic heap operation.",
          why: "This version has no heap. Both queues are read from the front in constant time, so there is no per-merge logarithmic factor.",
        },
      ],
      answer: "c",
    },
    {
      id: "gr-paren-range",
      chapter: "dsa-greedy",
      level: "intermediate",
      skill: "trace",
      pattern: "greedy",
      section: "valid-parenthesis-string-track-the-range-of-open-brackets",
      kind: "single",
      prompt:
        '<p>Trace <code>checkValidString("(*)(")</code> with the chapter\'s <code>lo</code> and <code>hi</code>. What does it return, and what do <code>lo</code> and <code>hi</code> hold after the last character?</p>',
      choices: [
        {
          id: "a",
          text: "<code>true</code>, with <code>lo = 0</code> and <code>hi = 2</code>.",
          why: "After the first three characters the range is <code>[0, 1]</code>. The last <code>(</code> raises both ends, so <code>lo</code> becomes 1, not 0, and the function returns <code>false</code>.",
        },
        {
          id: "b",
          text: "<code>false</code>, with <code>lo = 1</code> and <code>hi = 2</code>, because at least one bracket is still open.",
          why: "After <code>(</code>, <code>*</code> and <code>)</code> the range is <code>[0, 1]</code>, and the final <code>(</code> makes it <code>[1, 2]</code>. Zero is not in that range, so every choice of the star leaves a bracket open.",
        },
        {
          id: "c",
          text: "<code>false</code>, because <code>hi</code> goes negative at the third character, which ends the scan.",
          why: "After the third character, <code>hi</code> is 1, not negative. The function returns <code>false</code> for another reason: <code>lo</code> is 1 at the end.",
        },
        {
          id: "d",
          text: "<code>true</code>, because a star can always close the last open bracket.",
          why: "The star comes before the last <code>(</code>, and no character comes after that bracket to close it, so the string cannot balance.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "greedy",
    chapter: "dsa-greedy",
    signals: [
      "The prompt asks for the maximum or minimum count of something, and sorting by one property suggests a natural order to decide in.",
      "A local rule such as earliest finish, largest ratio or farthest reach seems to settle each decision for good.",
      "You can argue that the locally best choice belongs to some best overall solution, with an exchange argument.",
      "Scheduling, assignment or covering with intervals, where decisions never need to be taken back.",
    ],
    template:
      "<pre><code>sort the candidates by the key that makes one choice safe\nfor (const item of sorted) {\n  if (fitsWithWhatIsChosen(item)) choose(item);\n}</code></pre>",
    time: "O(n log n)",
    space: "O(1) extra",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
