import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "iv-most-at-once",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "recognise",
      pattern: "intervals",
      section: "minimum-number-of-rooms-resources-needed-meeting-rooms",
      placement: true,
      kind: "single",
      prompt:
        "<p>A clinic logs an arrival time and a departure time for each visit. You need the largest number of patients who were in the building at the same instant. Which approach is correct?</p>",
      choices: [
        {
          id: "a",
          text: "Merge overlapping visits first, then report how many merged intervals there are, since each one is a busy stretch.",
          why: "Merging collapses a whole crowd into a single block. The visits [1, 5], [2, 6] and [3, 7] merge into one interval, yet three patients are present at time 3.",
        },
        {
          id: "b",
          text: "Sort visits by departure time, keep each visit that starts after the last kept one has ended, and report how many were kept.",
          why: "That counts the largest group of visits that never overlap, which is a different question. For [1, 5], [2, 6] and [3, 7] it keeps one visit, while three patients are present together.",
        },
        {
          id: "c",
          text: "Sort arrivals and departures separately, then sweep both with a counter (up on arrival, down on departure) and report its peak.",
          why: "The counter always holds the number of visits that have started and not yet ended. Its peak is the most patients present at once, and the cost is the two sorts, O(n log n).",
        },
        {
          id: "d",
          text: "Count how many visits share each exact arrival time, and report the largest of those counts as the number present at once.",
          why: "Visits can overlap without arriving at the same moment. The visits [1, 5] and [2, 6] have different arrival times, yet both patients are inside during 2 to 5.",
        },
      ],
      answer: "c",
    },
    {
      id: "iv-fewest-removals",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "recognise",
      pattern: "intervals",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt:
        "<p>You must remove as few intervals as possible so that none of the remaining ones overlap, where intervals that share only an endpoint do not overlap. Which approach gives the right number of removals?</p>",
      choices: [
        {
          id: "a",
          text: "Sort by end time, keep each interval that starts at or after the last kept end, and report n minus the kept count.",
          why: "Keeping the interval that ends earliest leaves the most room for the rest, so the kept set is as large as possible. The removals are everything that was not kept, and that is the fewest possible.",
        },
        {
          id: "b",
          text: "Merge overlapping intervals first, then report n minus the number of merged intervals, as each merged group keeps one survivor.",
          why: "For [1, 10], [2, 3] and [4, 5] there is one merged interval, so this reports 2 removals. Removing only [1, 10] leaves two compatible intervals, so 1 removal is enough.",
        },
        {
          id: "c",
          text: "Count every pair of intervals that overlap, and report the number of such pairs as the removals.",
          why: "One interval can overlap many others, and removing it fixes every one of those pairs at once. For [1, 10], [2, 3] and [4, 5] there are 2 overlapping pairs, but 1 removal is enough.",
        },
        {
          id: "d",
          text: "Sort by start time and, whenever the next interval overlaps the last kept one, remove the next one.",
          why: "This always keeps the earlier-starting interval, even when it is the long one that blocks everything after it. For [1, 10], [2, 3] and [4, 5] it removes both short intervals, which is 2 removals instead of 1.",
        },
      ],
      answer: "a",
    },
    {
      id: "iv-all-idle-periods",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "recognise",
      pattern: "intervals",
      section: "merging-overlapping-intervals",
      placement: true,
      kind: "single",
      prompt:
        "<p>Several machines each log a list of busy periods, given as <code>[start, end]</code> pairs. You need every period between the earliest start and the latest end during which all of the machines are idle at once. Which approach works?</p>",
      choices: [
        {
          id: "a",
          text: "Work out the idle gaps of each machine separately and combine the gaps by taking their union.",
          why: "The union of the gaps holds the times when at least one machine is idle. A time can be in one machine's gap while another machine is busy, so this reports too much.",
        },
        {
          id: "b",
          text: "Sort all busy periods by end time, keep the largest group that never overlaps, and report the gaps between the kept ones.",
          why: "Dropping a busy period makes its time look idle. With [1, 10], [2, 3] and [4, 5], this keeps the last two and reports the time between 3 and 4 as idle, although [1, 10] covers it.",
        },
        {
          id: "c",
          text: "Merge each machine's busy periods on its own, then report the gaps of the machine that has the most periods.",
          why: "The other machines are ignored. A gap in one machine's list can lie inside a busy period of another machine, so it is not a time when all of them are idle.",
        },
        {
          id: "d",
          text: "Put all busy periods in one list, sort by start, merge the overlaps, and report the gaps between merged periods.",
          why: "The merged periods are exactly the times when at least one machine is busy. What lies between two of them is a time when none is, and that is when every machine is idle.",
        },
      ],
      answer: "d",
    },
    {
      id: "iv-merge-without-sort",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "trace",
      pattern: "intervals",
      section: "the-one-setup-step-that-unlocks-almost-everything",
      kind: "single",
      prompt:
        "<p>Someone deletes the sort line from the chapter's <code>merge</code>. What does this version return for the input below?</p><pre><code>function merge(intervals) {\n  if (intervals.length === 0) return [];\n\n  const result = [[...intervals[0]]];\n  for (let i = 1; i &lt; intervals.length; i++) {\n    const [start, end] = intervals[i];\n    const last = result[result.length - 1];\n\n    if (start &lt;= last[1]) {\n      last[1] = Math.max(last[1], end);\n    } else {\n      result.push([start, end]);\n    }\n  }\n  return result;\n}\n\nmerge([[6, 8], [1, 9], [2, 4], [4, 7]]);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[1, 9]]</code>",
          why: "That is the correct merge, and it is what the version with the sort returns. Without the sort, the start of the merged interval is never lowered, so the result is not this.",
        },
        {
          id: "b",
          text: "<code>[[6, 9]]</code>",
          why: "[6, 8] is first, and [1, 9] passes the test because 1 is at most 8, so the end becomes 9. The code only ever changes the end of the last interval, so the start stays 6. The later two intervals fit inside and change nothing.",
        },
        {
          id: "c",
          text: "<code>[[6, 8], [1, 9]]</code>",
          why: "[1, 9] is not pushed as a separate interval. Its start 1 is less than the end 8 of the last interval, so it takes the merge branch.",
        },
        {
          id: "d",
          text: "<code>[[1, 9], [2, 4], [4, 7]]</code>",
          why: "Nothing is left unmerged. Every later start is at most the current end, so each one takes the merge branch and none is pushed.",
        },
      ],
      answer: "b",
    },
    {
      id: "iv-merge-shares-arrays",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "edge-case",
      pattern: "intervals",
      section: "merging-overlapping-intervals",
      kind: "single",
      prompt:
        "<p>A shortcut version of merge, for input that is already sorted, starts with <code>const result = [sorted[0]]</code> and later runs <code>last[1] = Math.max(last[1], end)</code>. The chapter's version copies the first interval instead. After this shortcut runs, what does <code>input</code> hold?</p><pre><code>function shortcutMerge(sorted) {\n  const result = [sorted[0]];\n  for (let i = 1; i &lt; sorted.length; i++) {\n    const [start, end] = sorted[i];\n    const last = result[result.length - 1];\n\n    if (start &lt;= last[1]) {\n      last[1] = Math.max(last[1], end);\n    } else {\n      result.push([start, end]);\n    }\n  }\n  return result;\n}\n\nconst input = [[1, 3], [2, 6]];\nshortcutMerge(input);\nconsole.log(input);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[1, 3], [2, 6]]</code>, unchanged, because <code>merge</code> builds a new array",
          why: "The new outer array holds the very same inner array that <code>input[0]</code> refers to. Writing into <code>last[1]</code> changes that shared inner array, so <code>input</code> is changed too.",
        },
        {
          id: "b",
          text: "<code>[[1, 6]]</code>, because the merged interval replaces both originals",
          why: "<code>merge</code> never removes elements from <code>input</code>. It still has two entries, and only the first inner array has been written to.",
        },
        {
          id: "c",
          text: "<code>[[1, 6], [1, 6]]</code>, because both inner arrays take the merged value",
          why: "Only the first inner array is changed. The second was read from and never written to, so it is still <code>[2, 6]</code>.",
        },
        {
          id: "d",
          text: "<code>[[1, 6], [2, 6]]</code>, because the first inner array is shared with the result",
          why: "<code>result[0]</code> and <code>input[0]</code> are the same array, so extending the end to 6 shows up in both. The caller's input is changed as a side effect. Starting from a copy, <code>[[...sorted[0]]]</code> as the chapter does, avoids it.",
        },
      ],
      answer: "d",
    },
    {
      id: "iv-merge-empty-input",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "edge-case",
      pattern: "intervals",
      section: "merging-overlapping-intervals",
      kind: "single",
      prompt:
        "<p>The chapter's <code>merge</code> opens with a guard for empty input. Here is the shortcut version without it. What does <code>shortcutMerge([])</code> return?</p><pre><code>function shortcutMerge(sorted) {\n  const result = [sorted[0]];\n  for (let i = 1; i &lt; sorted.length; i++) {\n    const [start, end] = sorted[i];\n    const last = result[result.length - 1];\n\n    if (start &lt;= last[1]) {\n      last[1] = Math.max(last[1], end);\n    } else {\n      result.push([start, end]);\n    }\n  }\n  return result;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[]</code>, because there is nothing to merge",
          why: "The function does not check for empty input. It starts from <code>[sorted[0]]</code>, which has one slot even when the input has none, so the result is not empty.",
        },
        {
          id: "b",
          text: "It throws a <code>TypeError</code>, because <code>sorted[0]</code> does not exist",
          why: "Reading an index past the end of an array gives <code>undefined</code> and does not throw. The loop then does not run, so nothing ever reads a property of <code>undefined</code>.",
        },
        {
          id: "c",
          text: "<code>[undefined]</code>, a one-element array holding <code>undefined</code>",
          why: "<code>sorted[0]</code> is <code>undefined</code> and goes straight into the result. The loop runs from 1 and the length is 0, so it never runs, and the caller gets an array with one useless element. A guard such as <code>if (intervals.length === 0) return []</code> fixes it.",
        },
        {
          id: "d",
          text: "<code>undefined</code>, because the function has nothing to return",
          why: "The function reaches <code>return result</code> on every call, and <code>result</code> is an array, so the return value is not <code>undefined</code>.",
        },
      ],
      answer: "c",
    },
    {
      id: "iv-which-pairs-merge",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "edge-case",
      pattern: "intervals",
      section: "merging-overlapping-intervals",
      kind: "multi",
      prompt:
        "<p>Select every input for which the chapter's <code>merge</code>, with its <code>start &lt;= last[1]</code> test, returns a single interval.</p>",
      choices: [
        {
          id: "a",
          text: "<code>[[1, 4], [4, 6]]</code>",
          why: "The second interval starts at 4, which is not greater than the end 4 of the first. The test uses <code>&lt;=</code>, so intervals that only touch are merged into <code>[1, 6]</code>.",
        },
        {
          id: "b",
          text: "<code>[[1, 4], [5, 6]]</code>",
          why: "The second interval starts at 5 and the first ends at 4, so the test is false. There is a gap between them, and both are returned.",
        },
        {
          id: "c",
          text: "<code>[[1, 2], [3, 4]]</code>",
          why: "The start 3 is greater than the end 2, so the second interval is pushed as a new group. The result has two intervals.",
        },
        {
          id: "d",
          text: "<code>[[1, 10], [2, 3]]</code>",
          why: "The second interval starts inside the first, so it merges, and <code>Math.max(10, 3)</code> keeps the end at 10. An interval that sits fully inside another one is absorbed, and the result is <code>[1, 10]</code>.",
        },
      ],
      answers: ["a", "d"],
    },
    {
      id: "iv-trace-insert",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "trace",
      pattern: "intervals",
      section: "inserting-a-new-interval-into-an-already-sorted-non-overlapp",
      kind: "single",
      prompt:
        "<p>Run the chapter's <code>insert</code> on the input below. What does the call return?</p><pre><code>function insert(intervals, newInterval) {\n  const result = [];\n  let i = 0;\n\n  while (i &lt; intervals.length &amp;&amp; intervals[i][1] &lt; newInterval[0]) {\n    result.push(intervals[i++]);\n  }\n\n  while (i &lt; intervals.length &amp;&amp; intervals[i][0] &lt;= newInterval[1]) {\n    newInterval = [\n      Math.min(newInterval[0], intervals[i][0]),\n      Math.max(newInterval[1], intervals[i][1]),\n    ];\n    i++;\n  }\n  result.push(newInterval);\n\n  while (i &lt; intervals.length) result.push(intervals[i++]);\n\n  return result;\n}\n\ninsert([[1, 2], [3, 5], [6, 7], [8, 10], [12, 16]], [4, 8]);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[1, 2], [3, 8], [12, 16]]</code>",
          why: "This misses [8, 10]. Its start 8 is not greater than the end 8 of the new interval, so the second loop takes it, and the merged end becomes 10.",
        },
        {
          id: "b",
          text: "<code>[[1, 2], [3, 10], [12, 16]]</code>",
          why: "[1, 2] ends before 4, so it is copied. [3, 5], [6, 7] and [8, 10] all start at or before the growing end, so they fold into the new interval, which becomes [3, 10]. [12, 16] starts after 10 and is copied last.",
        },
        {
          id: "c",
          text: "<code>[[1, 2], [3, 5], [6, 10], [12, 16]]</code>",
          why: "[3, 5] ends at 5, which is not before 4, so the first loop stops there. The second loop then merges it into the new interval and does not leave it separate.",
        },
        {
          id: "d",
          text: "<code>[[1, 2], [4, 10], [12, 16]]</code>",
          why: "The start is the smaller of the two starts. When [3, 5] is folded in, <code>Math.min(4, 3)</code> is 3, so the start of the merged interval is 3, not 4.",
        },
      ],
      answer: "b",
    },
    {
      id: "iv-insert-cost",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "complexity",
      pattern: "intervals",
      section: "inserting-a-new-interval-into-an-already-sorted-non-overlapp",
      kind: "single",
      prompt:
        "<p>The list passed to <code>insert</code> holds n sorted, non-overlapping intervals. What is the worst-case time of the chapter's <code>insert</code>?</p>",
      choices: [
        {
          id: "a",
          text: "O(log n), because the list is sorted and the position can be found by halving",
          why: "Finding the position could be done by halving, but the function also copies every interval into a new <code>result</code> array. Copying up to n intervals costs O(n) on its own.",
        },
        {
          id: "b",
          text: "O(n log n), because the new list has to be sorted again",
          why: "The list is never sorted again. The three phases keep the order that the input already had.",
        },
        {
          id: "c",
          text: "O(n), because the three loops share one index and handle each interval once",
          why: "The index <code>i</code> only moves forward across the three loops. Every interval is copied or folded in exactly once, with constant work each time.",
        },
        {
          id: "d",
          text: "O(n²), because each interval is compared with the new interval in every loop",
          why: "Each loop picks up where the previous one stopped, so an interval is looked at by one loop only. The comparisons add up to O(n), not a product.",
        },
      ],
      answer: "c",
    },
    {
      id: "iv-rooms-cost",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "complexity",
      pattern: "intervals",
      section: "minimum-number-of-rooms-resources-needed-meeting-rooms",
      kind: "single",
      prompt:
        "<p>For the chapter's <code>minMeetingRooms</code> with n meetings, assume the built-in sort takes O(n log n) time in the worst case. What is the tightest worst-case running time of the whole function?</p>",
      choices: [
        {
          id: "a",
          text: "O(n log n), because the sorts dominate the linear sweep",
          why: "The sweep moves <code>s</code> or <code>e</code> forward on every pass and never back, so it runs at most 2n times. That is O(n), and the sorts, O(n log n), decide the total.",
        },
        {
          id: "b",
          text: "O(n), because the loop is a single pass over the meetings",
          why: "The loop is linear, but the two <code>sort</code> calls before it are not. Sorting by comparisons takes more than a linear amount of work in the worst case.",
        },
        {
          id: "c",
          text: "O(n²), because every start time is compared with every end time",
          why: "The two indexes only move forward, so each start and each end is looked at once. The sweep does not compare every pair.",
        },
        {
          id: "d",
          text: "O(n · k), where k is the number of rooms the answer needs",
          why: "The loop does not search through a list of rooms. It moves two indexes and keeps a counter, so k does not appear. When k is small this expression would also be smaller than the cost of the sorts, so it cannot bound the running time.",
        },
      ],
      answer: "a",
    },
    {
      id: "iv-order-insert-phases",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "trace",
      pattern: "intervals",
      section: "inserting-a-new-interval-into-an-already-sorted-non-overlapp",
      kind: "order",
      prompt:
        "<p>Put in order what the chapter's <code>insert</code> does to the result. Start with the copy of the intervals that end before the new one begins and finish with the copy of the intervals that start after it ends.</p>",
      items: [
        { id: "before", text: "Copy every interval that ends before the new interval starts into the result." },
        { id: "grow", text: "Grow the new interval over every interval that overlaps it." },
        { id: "place", text: "Push the grown new interval into the result." },
        { id: "after", text: "Copy every remaining interval, all of which start after the new interval ends." },
      ],
      why: "The result has to stay sorted, so intervals that end before the new one come first, then the new interval, then those that start after it. The new interval can only be pushed once it has finished growing over every overlapping interval, so the growing comes before the push.",
    },
    {
      id: "iv-rooms-heap-trace",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "trace",
      pattern: "intervals",
      section: "meeting-rooms-ii-with-a-heap-written-out",
      kind: "single",
      prompt:
        "<p>Run the heap version of the room count on <code>[[1, 5], [2, 6], [5, 9]]</code>. The meetings are taken in order of start time, and a meeting reuses a room when the smallest end time in the heap is at most its start. What does <code>minMeetingRoomsHeap</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>3</code>, because every meeting overlaps at least one other.",
          why: "The third meeting starts at 5, exactly when the first one ends, so with the test <code>&lt;=</code> it reuses that room. It would take a third room only if touching counted as overlapping.",
        },
        {
          id: "b",
          text: "<code>1</code>, because the meetings run one after another.",
          why: "The first two meetings are running at the same time, from 2 to 5, so at least two rooms are needed.",
        },
        {
          id: "c",
          text: "<code>2</code>, because the room that frees at 5 is reused by the third meeting.",
          why: "The heap holds {5} after the first meeting and {5, 6} after the second. At the third, the top is 5, which is at most 5, so it is popped and 9 is pushed, leaving {6, 9}: two entries.",
        },
        {
          id: "d",
          text: "<code>4</code>, one room for each end time and one for each start.",
          why: "A room is counted once, however many meetings use it. The heap holds one entry per room, and there are only three meetings in the input.",
        },
      ],
      answer: "c",
    },
    {
      id: "iv-erase-trace",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "trace",
      pattern: "intervals",
      section: "non-overlapping-intervals-remove-the-fewest-sorting-by-end",
      kind: "single",
      prompt:
        "<p>What does <code>eraseOverlapIntervals([[1, 2], [2, 3], [3, 4], [1, 3]])</code> return? It sorts by end time, keeps an interval when <code>start &gt;= lastEnd</code>, and counts the others as removed. Intervals that only touch do not overlap.</p>",
      choices: [
        {
          id: "a",
          text: "<code>0</code>, because every interval touches its neighbour only at a point.",
          why: "The interval <code>[1, 3]</code> starts at 1, before the 3 at which <code>[2, 3]</code> ends, so it really overlaps two of the others. At least one removal is needed.",
        },
        {
          id: "b",
          text: "<code>2</code>, because both of the intervals that start at 1 overlap something.",
          why: "<code>[1, 2]</code> overlaps nothing: it ends at 2 and the next interval starts at 2. Only <code>[1, 3]</code> has to go.",
        },
        {
          id: "c",
          text: "<code>1</code>, because only <code>[1, 3]</code> clashes with a kept interval.",
          why: "Sorted by end, the order is <code>[1, 2], [2, 3], [1, 3], [3, 4]</code>. The first, second and fourth are kept, and <code>[1, 3]</code> starts at 1, which is before the last kept end of 3, so it is removed.",
        },
        {
          id: "d",
          text: "<code>3</code>, because only one interval can be kept.",
          why: "Three of them, <code>[1, 2]</code>, <code>[2, 3]</code> and <code>[3, 4]</code>, can be kept together, so at most one interval needs to be removed.",
        },
      ],
      answer: "c",
    },
    {
      id: "iv-covered-tie-break",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "edge-case",
      pattern: "intervals",
      section: "remove-covered-intervals-sort-start-up-end-down",
      kind: "single",
      prompt:
        "<p>A teammate changes the sort in <code>removeCoveredIntervals</code> to <code>(a, b) =&gt; a[0] - b[0] || a[1] - b[1]</code>, so ties in start are broken by end ascending, and leaves the rest alone. What does the changed function return for <code>[[1, 4], [1, 6], [2, 5]]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1</code>, because <code>[1, 6]</code> covers both of the others.",
          why: "1 is the correct answer, and the original sort returns it. With the changed sort, <code>[1, 4]</code> comes first and is kept before the longer interval is seen.",
        },
        {
          id: "b",
          text: "<code>2</code>, because <code>[1, 4]</code> is kept first.",
          why: "The sorted order is <code>[1, 4], [1, 6], [2, 5]</code>. The first is kept, then <code>[1, 6]</code> reaches farther and is kept too, and <code>[2, 5]</code> is covered. The result counts <code>[1, 4]</code>, which <code>[1, 6]</code> covers.",
        },
        {
          id: "c",
          text: "<code>3</code>, because no interval ends exactly where another starts.",
          why: "Touching endpoints are not what decides coverage. The interval <code>[2, 5]</code> lies inside <code>[1, 6]</code>, so it is not counted even with the changed sort.",
        },
        {
          id: "d",
          text: "<code>0</code>, because the intervals cover each other in a cycle.",
          why: "Coverage cannot go in a circle between different intervals, and the function counts the intervals that survive, so it returns at least 1 for a non-empty list.",
        },
      ],
      answer: "b",
    },
    {
      id: "iv-sweep-tie-order",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "edge-case",
      pattern: "intervals",
      section: "sweep-line-turn-intervals-into-events",
      kind: "single",
      prompt:
        "<p>A teammate sorts the events in <code>maxOverlapSweep</code> by time only, <code>(a, b) =&gt; a[0] - b[0]</code>, so events at the same time keep the order in which they were pushed. Each interval pushes its start event and then its end event. What does the changed function return for <code>[[3, 5], [1, 3]]</code>, where one meeting ends exactly as the other starts?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1</code>, because the two meetings never share a moment: one ends as the other starts.",
          why: "1 is the right answer, and the original sort returns it. The changed sort does not put the end at time 3 first, so it does not return 1.",
        },
        {
          id: "b",
          text: "<code>0</code>, because the end at time 3 cancels the start at time 3.",
          why: "The count is read after every event, and the largest value counts. The count reaches at least 1 after the first start, so the answer cannot be 0.",
        },
        {
          id: "c",
          text: "<code>3</code>, because there are three distinct times.",
          why: "The answer counts meetings that are active together, not distinct times. There are only two meetings, so it cannot exceed 2.",
        },
        {
          id: "d",
          text: "<code>2</code>, because the start at time 3 is processed before the end at time 3.",
          why: "The pushed order is <code>(3, +1), (5, -1), (1, +1), (3, -1)</code>. After a stable sort by time, the start at 3 comes before the end at 3, so the count goes 1, 2, 1, 0, and the largest value is 2.",
        },
      ],
      answer: "d",
    },
    {
      id: "iv-flight-diff-end",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "edge-case",
      pattern: "intervals",
      section: "difference-arrays-many-range-updates-one-pass",
      kind: "single",
      prompt:
        "<p>A teammate changes <code>corpFlightBookings</code> so that it subtracts at <code>diff[last]</code> instead of <code>diff[last + 1]</code>, and leaves the rest alone. What does the changed function return for the single booking <code>[[1, 2, 10]]</code> with <code>n = 3</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[10, 10, 0]</code>, the correct totals.",
          why: "That is what the original returns. With the subtraction one place too early, flight 2 loses its seats.",
        },
        {
          id: "b",
          text: "<code>[10, 0, 0]</code>, because flight 2 loses its seats.",
          why: "The array becomes <code>diff[1] = 10</code> and <code>diff[2] = -10</code>. The running sums over flights 1 to 3 are 10, 0 and 0, so flight 2 is missing its 10 seats.",
        },
        {
          id: "c",
          text: "<code>[10, 10, 10]</code>, because nothing ever subtracts.",
          why: "The subtraction does happen, only at the wrong index. It lands on flight 2 and removes the seats there and on every later flight.",
        },
        {
          id: "d",
          text: "<code>[0, 10, 0]</code>, because the range starts one flight late.",
          why: "The addition still goes to <code>diff[first]</code>, which is index 1, so flight 1 does receive the seats.",
        },
      ],
      answer: "b",
    },
    {
      id: "iv-two-lists-recognise",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "recognise",
      pattern: "intervals",
      section: "interval-list-intersections-two-sorted-lists-two-pointers",
      placement: true,
      kind: "single",
      prompt:
        "<p>Two people each give you a sorted list of busy intervals, with no overlaps inside either list. You must report every time both are busy, in time proportional to the two list sizes. Which approach works?</p>",
      choices: [
        {
          id: "a",
          text: "Compare every interval of the first list with every interval of the second.",
          why: "This finds the right overlaps, but the work is the product of the two sizes, not their sum, so it is too slow when the lists are long.",
        },
        {
          id: "b",
          text: "Merge both lists into one sorted list and merge the overlapping intervals.",
          why: "Merging unions the busy time. The question asks for the time when both are busy, which is an intersection, so the shared parts are lost in the union.",
        },
        {
          id: "c",
          text: "Walk one pointer per list; record the overlap, and then advance the pointer whose interval ends first.",
          why: "An interval that ends first cannot meet anything later in the other list, since later intervals there start after the one the other pointer holds. Every step advances a pointer, so the walk is linear.",
        },
        {
          id: "d",
          text: "Walk one pointer per list; record the overlap, and then advance the pointer whose interval starts first.",
          why: "For <code>[[1, 10]]</code> and <code>[[2, 3], [5, 6]]</code> it records <code>[2, 3]</code>, then moves past the only interval of the first list and never finds <code>[5, 6]</code>.",
        },
      ],
      answer: "c",
    },
    {
      id: "iv-calendar-touching",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "edge-case",
      pattern: "intervals",
      section: "my-calendar-i-booking-without-a-double-booking",
      kind: "single",
      prompt:
        "<p>A teammate changes the overlap test in <code>MyCalendar.book</code> from <code>start &lt; e &amp;&amp; s &lt; end</code> to <code>start &lt;= e &amp;&amp; s &lt;= end</code>. Bookings are half-open, <code>[start, end)</code>. What do <code>book(10, 20)</code> and then <code>book(20, 30)</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>true</code> and <code>true</code>, the same as the original.",
          why: "The original accepts both, since <code>[10, 20)</code> does not contain 20. The changed test treats a shared endpoint as a clash.",
        },
        {
          id: "b",
          text: "<code>true</code> and <code>false</code>, because the endpoint 20 now clashes.",
          why: "For the second call, <code>20 &lt;= 20</code> and <code>10 &lt;= 30</code> are both true, so the booking is refused, although the two half-open ranges share no moment.",
        },
        {
          id: "c",
          text: "<code>false</code> and <code>false</code>, because an empty calendar refuses everything.",
          why: "With no bookings stored, the loop has nothing to compare against, so the first booking is always accepted.",
        },
        {
          id: "d",
          text: "<code>false</code> and <code>true</code>, because the later booking is the one that is checked.",
          why: "Both calls are checked against the bookings already stored. The first has nothing to clash with, so it returns <code>true</code>.",
        },
      ],
      answer: "b",
    },
    {
      id: "iv-flight-diff-cost",
      chapter: "dsa-intervals",
      level: "intermediate",
      skill: "complexity",
      pattern: "intervals",
      section: "difference-arrays-many-range-updates-one-pass",
      kind: "single",
      prompt:
        "<p><code>corpFlightBookings</code> handles m bookings over n flights using a difference array. Each booking is two array updates, and the answer comes from one running sum. What is its time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n × m), because every booking has to reach every flight in its range.",
          why: "That is the cost of adding the seats flight by flight. The difference array avoids it by writing two numbers per booking, whatever the length of the range.",
        },
        {
          id: "b",
          text: "O(n + m), two updates for each booking plus one pass over the flights.",
          why: "The bookings cost O(m) in total and the running sum costs O(n), and the two do not multiply. The array itself takes O(n) space.",
        },
        {
          id: "c",
          text: "O(m log m), because the bookings have to be sorted first.",
          why: "The difference array indexes by flight number, so no sort is needed. That is the saving over the sorted-event version.",
        },
        {
          id: "d",
          text: "O(n log n), because the running sum is a prefix scan.",
          why: "A running sum visits each flight once and adds one number, so it is linear, with no logarithmic factor.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "intervals",
    chapter: "dsa-intervals",
    signals: [
      "The input is a list of [start, end] pairs, meetings, bookings or ranges.",
      "The prompt asks to merge, to find overlaps, or to count how many things are active at the same time.",
      "The prompt asks for the fewest rooms, resources or removals so that nothing clashes.",
      "A new interval has to be inserted into a sorted list, or the gaps between busy periods are wanted.",
    ],
    template:
      "<pre><code>sort the intervals by start (or by end, for keep-the-most scheduling)\nfor (const next of sorted) {\n  if (next overlaps last) extend last; else start a new group;\n}</code></pre>",
    time: "O(n log n)",
    space: "O(n)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
