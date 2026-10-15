import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "heap-kth-largest-stream",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "recognise",
      pattern: "heap",
      section: "the-top-k-pattern",
      placement: true,
      kind: "single",
      prompt:
        "<p>Numbers arrive one at a time in a very long stream, and you may keep only about k of them in memory. Whenever asked, you must report the k-th largest number seen so far. Which structure fits?</p>",
      choices: [
        {
          id: "a",
          text: "A max-heap holding k numbers, reading its root.",
          why: "The root of a max-heap is the largest number it holds. To keep the k largest numbers you need to throw out the smallest one when a bigger one arrives, and a max-heap has no cheap way to reach that end.",
        },
        {
          id: "b",
          text: "A sorted array of every number so far, reading the k-th from the end.",
          why: "This keeps every number, which breaks the memory limit. Inserting into the middle of an array can also mean shifting many elements.",
        },
        {
          id: "c",
          text: "A min-heap holding the k largest numbers so far, reading its root.",
          why: "When the heap grows past k, popping removes the smallest of the k + 1 candidates, so what stays are the k largest. Once at least k numbers have arrived, the smallest of those is the k-th largest overall, and each arrival costs O(log k).",
        },
        {
          id: "d",
          text: "A <code>Map</code> that counts how often each value has appeared.",
          why: "This stores every distinct value and keeps no order that you could read the k-th largest from. A <code>Map</code> iterates in insertion order, not in sorted order.",
        },
      ],
      answer: "c",
    },
    {
      id: "heap-merge-sorted-lists",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "recognise",
      pattern: "heap",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt:
        "<p>You have k lists that are each already sorted, with N numbers in total, and you must merge them into one sorted list. Which method uses the fact that the lists are sorted and takes O(N log k) time?</p>",
      choices: [
        {
          id: "a",
          text: "Keep a min-heap of each list's current front element. Pop the smallest, then push the next element of the list it came from.",
          why: "The smallest unmerged number overall is always one of the k fronts, so the heap's root is exactly what comes next. The heap never holds more than k numbers, so each of the N pops and pushes costs O(log k).",
        },
        {
          id: "b",
          text: "Join all the lists into one array, then sort that array with the built-in sort.",
          why: "The result is right, but it costs O(N log N) and ignores that the lists were already sorted. When k is small, O(N log k) is a lot less.",
        },
        {
          id: "c",
          text: "Merge the lists into a growing result one after another, with a two-list merge each time, so the result is rebuilt k - 1 times.",
          why: "The growing result is copied again at every merge, so with k lists of equal length the total can reach O(N · k). That is worse than N log k once k gets large.",
        },
        {
          id: "d",
          text: "Keep a max-heap of each list's current front element, popping the largest and pushing the next element of its list.",
          why: "Each front is the smallest value still left in its list. Popping the largest front takes out a number while smaller ones are still waiting in other lists, so the output is not sorted in general.",
        },
      ],
      answer: "a",
    },
    {
      id: "heap-running-median",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "recognise",
      pattern: "heap",
      section: "the-two-heap-pattern-running-median-of-a-data-stream",
      placement: true,
      kind: "single",
      prompt:
        "<p>Numbers keep arriving, and after each one you must report the median of everything seen so far, quickly. Which design fits?</p>",
      choices: [
        {
          id: "a",
          text: "One min-heap with every number inserted, reading its root as the median.",
          why: "The root of a min-heap is the smallest number, not the middle one. A single heap exposes only one end of the data.",
        },
        {
          id: "b",
          text: "One max-heap with every number, and the median is its root.",
          why: "The root of a max-heap is the largest number. The middle of the data is not reachable from the top of a single heap.",
        },
        {
          id: "c",
          text: "Two min-heaps that each hold half of the numbers, reading both roots after each insert.",
          why: "Both roots are the smallest value of their own half. Neither exposes the largest value of the lower half, which is the number needed next to the middle.",
        },
        {
          id: "d",
          text: "A max-heap for the smaller half and a min-heap for the larger half, with sizes within one.",
          why: "The root of the lower heap is the largest of the smaller half, and the root of the upper heap is the smallest of the larger half, so the two roots sit next to the middle. Each insert is O(log n) and the median is read in O(1).",
        },
      ],
      answer: "d",
    },
    {
      id: "heap-closest-points",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "recognise",
      pattern: "heap",
      section: "recognizing-it-in-an-unseen-problem",
      kind: "single",
      prompt:
        "<p>A list holds n points and you want the k closest to the origin. n is large, k is small, and you want O(n log k) time with only O(k) extra memory. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "A min-heap keyed by distance, popping its root whenever it holds more than k points.",
          why: "The root of a min-heap is the closest point, so this would throw away the very points you want to keep. The kept set would end up as the k farthest.",
        },
        {
          id: "b",
          text: "A max-heap keyed by distance, popping its root whenever it holds more than k points.",
          why: "The root of a max-heap is the farthest of the points kept so far, which is the one to evict when a closer point arrives. What remains is the k closest, and it is the same idea as the min-heap for the k largest, with the sides swapped.",
        },
        {
          id: "c",
          text: "Sort all n points by distance and take the first k.",
          why: "The answer is right, but it takes O(n log n) time, which is more than the goal allows.",
        },
        {
          id: "d",
          text: "Put all n points into a min-heap and pop k times.",
          why: "The answer is right too, but pushing all n points costs O(n log n) time, and the heap then holds every point, so the extra memory is O(n) rather than O(k).",
        },
      ],
      answer: "b",
    },
    {
      id: "heap-build-cost",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "complexity",
      pattern: "heap",
      section: "building-a-heap-from-an-array-in-o-n-not-o-n-log-n",
      kind: "single",
      prompt:
        "<p>A min-heap has to be built from n numbers that are all available up front. Compare calling <code>push</code> n times (each push sifts up) with placing the numbers in an array and sifting down from the last non-leaf node back to the root (heapify). Which pair gives the tightest worst-case time bounds?</p>",
      choices: [
        {
          id: "a",
          text: "n pushes: O(n log n). Heapify: O(n log n).",
          why: "The first bound is right. For heapify, O(n log n) is true only as a loose ceiling. Most nodes sit near the bottom, where a sift-down has almost nowhere to go, so the work adds up to O(n).",
        },
        {
          id: "b",
          text: "n pushes: O(n). Heapify: O(n log n).",
          why: "This has the two the wrong way round. A single push can sift all the way up, O(log n), and n of them can reach O(n log n).",
        },
        {
          id: "c",
          text: "n pushes: O(n). Heapify: O(n).",
          why: "The pushes can cost more. If the numbers arrive in descending order, every new number is the smallest so far and sifts up to the root, which is about log n steps each.",
        },
        {
          id: "d",
          text: "n pushes: O(n log n). Heapify: O(n).",
          why: "Each push is O(log n) in the worst case, for example when the numbers arrive in descending order into a min-heap. Heapify sifts down only from the last non-leaf node, and most nodes are near the bottom with very little distance to sift, so it adds up to O(n).",
        },
      ],
      answer: "d",
    },
    {
      id: "heap-top-k-cost",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "complexity",
      pattern: "heap",
      section: "the-top-k-pattern",
      kind: "single",
      prompt:
        "<p>The chapter's <code>kLargest(nums, k)</code> keeps a min-heap and pops whenever its size goes above k. For n numbers and 2 &lt;= k &lt;= n, what are its worst-case time and its extra space, apart from the input?</p>",
      choices: [
        {
          id: "a",
          text: "Time O(n log k), space O(k).",
          why: "The heap never holds more than k + 1 numbers, so each push and each pop costs O(log k). There are n pushes and at most n pops, and the heap itself needs O(k) space.",
        },
        {
          id: "b",
          text: "Time O(n log n), space O(n).",
          why: "That is the cost of sorting everything, which is what the heap avoids. The heap is trimmed back to k numbers after every push.",
        },
        {
          id: "c",
          text: "Time O(k log n), space O(n).",
          why: "The heap's size is limited by k, not n, so the log factor is log k. The loop also runs over all n numbers, not k of them.",
        },
        {
          id: "d",
          text: "Time O(n), space O(1).",
          why: "A push or a pop in a heap takes O(log size), not constant time, and the heap itself holds up to k + 1 numbers.",
        },
      ],
      answer: "a",
    },
    {
      id: "heap-trace-pop",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "trace",
      pattern: "heap",
      section: "sift-up-insert-and-sift-down-remove-the-two-moves",
      kind: "single",
      prompt:
        "<p>After <code>pop(data)</code> runs once, what does <code>data</code> hold?</p><pre><code>function pop(data) {\n  const min = data[0];\n  const last = data.pop();\n  if (data.length &gt; 0) {\n    data[0] = last;\n    siftDown(data, 0);\n  }\n  return min;\n}\n\nfunction siftDown(data, i) {\n  const n = data.length;\n  while (true) {\n    let smallest = i;\n    const left = 2 * i + 1, right = 2 * i + 2;\n    if (left &lt; n &amp;&amp; data[left] &lt; data[smallest]) smallest = left;\n    if (right &lt; n &amp;&amp; data[right] &lt; data[smallest]) smallest = right;\n    if (smallest === i) break;\n    [data[i], data[smallest]] = [data[smallest], data[i]];\n    i = smallest;\n  }\n}\n\nconst data = [2, 5, 4, 9, 7, 8];\npop(data);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[4, 5, 8, 9, 7]</code>",
          why: "The last element, 8, moves to the root, giving <code>[8, 5, 4, 9, 7]</code>. Its children are 5 and 4, and the smaller is 4, so they swap. The node now at index 2 would have children at indexes 5 and 6, which are past the end, so the sift stops.",
        },
        {
          id: "b",
          text: "<code>[5, 8, 4, 9, 7]</code>",
          why: "This swaps 8 with its left child 5 instead of the smaller child 4. That leaves 5 above 4, so the root is no longer the minimum.",
        },
        {
          id: "c",
          text: "<code>[4, 5, 7, 8, 9]</code>",
          why: "Sifting down repairs one path from the root and does not sort the array. A heap array is only ordered between parents and children.",
        },
        {
          id: "d",
          text: "<code>[5, 4, 9, 7, 8]</code>",
          why: "This treats the removal like <code>shift()</code>, moving everything one place left. That breaks the index rule for children, and here 5 ends up above its child 4.",
        },
      ],
      answer: "a",
    },
    {
      id: "heap-trace-kth-peek",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "trace",
      pattern: "heap",
      section: "the-top-k-pattern",
      kind: "single",
      prompt:
        "<p>Using the chapter's <code>MinHeap</code>, what does the last line return?</p><pre><code>function kLargest(nums, k) {\n  const heap = new MinHeap();\n  for (const num of nums) {\n    heap.push(num);\n    if (heap.size() &gt; k) heap.pop();\n  }\n  const result = [];\n  while (heap.size() &gt; 0) result.push(heap.pop());\n  return result.reverse();\n}\n\nkLargest([5, 2, 9, 1, 7, 3, 8], 3)[2];</code></pre>",
      choices: [
        {
          id: "a",
          text: "9",
          why: "Nine is the largest number kept, and it is at index 0 of the result, because the result is reversed to put the largest first. Index 2 is the last place, which holds the smallest of the three kept numbers, 7.",
        },
        {
          id: "b",
          text: "5",
          why: "Five stays in the heap for a while, but it is evicted when 8 arrives and the heap grows to 4 numbers: 5, 7, 8 and 9. The smallest of those, 5, is popped.",
        },
        {
          id: "c",
          text: "7",
          why: "The heap goes {2, 5, 9}, then 1 comes in and goes out, then 2 leaves for 7, then 3 comes in and goes out, then 5 leaves for 8. It ends as {7, 8, 9}, which drains as 7, 8, 9 and reverses to <code>[9, 8, 7]</code>. Index 2 holds 7, the k-th largest.",
        },
        {
          id: "d",
          text: "1",
          why: "One is pushed and is the smallest, so it is the root at once. The heap has 4 numbers then, which is more than k, so it is popped right away.",
        },
      ],
      answer: "c",
    },
    {
      id: "heap-order-sift-up",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "trace",
      pattern: "heap",
      section: "sift-up-insert-and-sift-down-remove-the-two-moves",
      kind: "order",
      prompt:
        "<p>Put one pass through the <code>while</code> loop of <code>siftUp</code> in the order it runs, when the node still has to move. Start with the loop test and end with the step that sets up the next pass.</p><pre><code>function siftUp(data, i) {\n  while (i &gt; 0) {\n    const parent = Math.floor((i - 1) / 2);\n    if (data[parent] &lt;= data[i]) break;\n    [data[parent], data[i]] = [data[i], data[parent]];\n    i = parent;\n  }\n}</code></pre>",
      items: [
        { id: "test", text: "Test <code>i &gt; 0</code>, which means the node is not the root yet." },
        { id: "parent", text: "Compute the parent's index from <code>i</code>." },
        {
          id: "compare",
          text: "Compare the parent's value with the node's value and stop if the parent is not larger.",
        },
        { id: "swap", text: "Swap the node with its parent." },
        { id: "move", text: "Set <code>i = parent</code>, so the next pass starts at the node's new position." },
      ],
      why: "The test comes first, because there is no parent to look at for the root. The parent's index has to be known before the two values can be compared, and the comparison decides whether a swap happens at all. The index moves last, since the swap needs the old <code>i</code> as well as <code>parent</code>.",
    },
    {
      id: "heap-default-sort",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "edge-case",
      pattern: "heap",
      section: "sift-up-insert-and-sift-down-remove-the-two-moves",
      kind: "single",
      prompt:
        "<p>Because JavaScript has no built-in heap, a teammate keeps the queue as a plain array: after inserting, call <code>queue.sort()</code>, and take the minimum with <code>queue.shift()</code>. What does this return?</p><pre><code>const queue = [25, 9, 100];\nqueue.sort();\nqueue.shift();</code></pre>",
      choices: [
        {
          id: "a",
          text: "9, the smallest number",
          why: "That is what a numeric sort would put first. Without a comparator, <code>sort()</code> compares the values as strings, so the order is not numeric.",
        },
        {
          id: "b",
          text: "100",
          why: 'The default sort compares strings, and <code>"100"</code> comes before <code>"25"</code>, which comes before <code>"9"</code>. The array becomes <code>[100, 25, 9]</code>, so <code>shift()</code> takes 100. A comparator such as <code>(a, b) =&gt; a - b</code> fixes the order, and re-sorting on every insert can cost O(n log n) each time, which a heap\'s O(log n) insert avoids.',
        },
        {
          id: "c",
          text: "<code>undefined</code>, because <code>sort()</code> returns nothing for <code>shift()</code> to use",
          why: "<code>sort()</code> sorts the array in place and also returns it. The <code>shift()</code> call acts on <code>queue</code> itself, which still holds three numbers.",
        },
        {
          id: "d",
          text: "25, the middle number of the three",
          why: "After the default sort 25 is in the middle, but <code>shift()</code> removes the first element, not the middle one.",
        },
      ],
      answer: "b",
    },
    {
      id: "heap-true-statements",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "edge-case",
      pattern: "heap",
      section: "the-one-rule-parent-beats-children",
      kind: "multi",
      prompt: "<p>Select every statement that is true for a min-heap stored in an array as in the chapter.</p>",
      choices: [
        {
          id: "a",
          text: "A node's left child is never larger than its right child.",
          why: "A heap only orders each parent against its children. The two children of a node can be in either order.",
        },
        {
          id: "b",
          text: "Reading the array from left to right gives the numbers in ascending order.",
          why: "The chapter's own example, <code>[2, 5, 4, 9, 7, 8]</code>, has 5 before 4. The array is not sorted.",
        },
        {
          id: "c",
          text: "The element at index 0 is not larger than any other element.",
          why: "Every parent is at most as large as its children, so following parents up from any node reaches the root through values that never get larger. The root is a minimum.",
        },
        {
          id: "d",
          text: "The children of the node at index <code>i</code> are at indexes <code>2i + 1</code> and <code>2i + 2</code>.",
          why: "The tree is stored level by level with no gaps, so child positions follow from the index and no pointers are needed.",
        },
      ],
      answers: ["c", "d"],
    },
    {
      id: "heap-boolean-comparator",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "edge-case",
      pattern: "heap",
      section: "one-heap-class-for-every-job-a-comparator",
      kind: "single",
      prompt:
        "<p>A teammate wants a max-heap from the chapter's comparator-based <code>Heap</code>, whose <code>push</code> and <code>pop</code> decide by testing whether <code>compare(x, y)</code> is below zero. They write the comparator as <code>(a, b) =&gt; a &gt; b</code>, push 5, 3, 8 and 1, and pop four times. What happens?</p>",
      choices: [
        {
          id: "a",
          text: "It pops 8, 5, 3, 1, which is what a max-heap should give.",
          why: "A comparator that returns <code>true</code> or <code>false</code> gives 1 or 0, never a number below zero. The heap only reacts to a negative result, so it never decides that anything must come out first.",
        },
        {
          id: "b",
          text: "It throws a <code>TypeError</code>, because a comparator has to return a number.",
          why: "JavaScript does not check what a comparator returns, and <code>true</code> and <code>false</code> are compared with zero like any other value. Nothing is thrown, and that is what makes the bug hard to find.",
        },
        {
          id: "c",
          text: "It pops 1, 3, 5, 8, so it works as a min-heap instead.",
          why: "A min-heap needs a negative result when the first value is the smaller one. This comparator never returns a negative result, so the heap cannot sort in either direction.",
        },
        {
          id: "d",
          text: "It runs without an error, but the heap never moves an item and the pops come out in no useful order.",
          why: "<code>true</code> counts as 1 and <code>false</code> as 0, so the test for a negative result never passes and nothing is swapped. Pushing 5, 3, 8, 1 and popping four times gave 5, 1, 8, 3 in a run. The fix is a numeric comparator such as <code>(a, b) =&gt; b - a</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "heap-merge-k-cost",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "complexity",
      pattern: "heap",
      section: "merge-k-sorted-lists-and-the-k-smallest-pairs",
      kind: "single",
      prompt:
        "<p>There are k sorted lists with N elements in total. A merge keeps a min-heap holding the current front of every list that still has elements. It pops the smallest, adds it to the output, and pushes the next element of the list that front came from. What are its worst-case time and its extra space, apart from the output?</p>",
      choices: [
        {
          id: "a",
          text: "Time O(N log N), extra space O(N).",
          why: "That is what you get by putting every element in one heap, or by sorting the joined lists. This merge never holds more than one entry per list, so the heap stays at k entries and each operation costs log k.",
        },
        {
          id: "b",
          text: "Time O(N log k), extra space O(k).",
          why: "Each of the N elements is pushed once and popped once, and the heap has at most k entries, so each of those operations is O(log k). The heap is the only extra storage.",
        },
        {
          id: "c",
          text: "Time O(N · k), extra space O(1).",
          why: "This is the cost of merging the lists one after another into a growing result, which copies the result again at every step. The heap replaces the k-way comparison by an O(log k) step.",
        },
        {
          id: "d",
          text: "Time O(k log N), extra space O(k).",
          why: "Every one of the N elements has to be popped at least once, so the time cannot be written as a function of k and log N alone. When N is much larger than k this bound would be far too small.",
        },
      ],
      answer: "b",
    },
    {
      id: "heap-trace-pairs",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "trace",
      pattern: "heap",
      section: "merge-k-sorted-lists-and-the-k-smallest-pairs",
      kind: "single",
      prompt:
        "<p>Using the chapter's comparator-based <code>Heap</code>, what does the call return?</p><pre><code>function kSmallestPairs(nums1, nums2, k) {\n  const result = [];\n  if (nums1.length === 0 || nums2.length === 0) return result;\n  const heap = new Heap((a, b) =&gt; a[0] - b[0]);\n  for (let i = 0; i &lt; Math.min(nums1.length, k); i++) heap.push([nums1[i] + nums2[0], i, 0]);\n  while (result.length &lt; k &amp;&amp; heap.size() &gt; 0) {\n    const [, i, j] = heap.pop();\n    result.push([nums1[i], nums2[j]]);\n    if (j + 1 &lt; nums2.length) heap.push([nums1[i] + nums2[j + 1], i, j + 1]);\n  }\n  return result;\n}\n\nkSmallestPairs([1, 7, 11], [2, 4, 6], 3);</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[[1, 2], [7, 2], [11, 2]]</code>",
          why: "These are the three seeds, one for each row. After <code>(1, 2)</code> is popped, the pair <code>(1, 4)</code> with sum 5 is pushed, and it beats the seed <code>(7, 2)</code> with sum 9.",
        },
        {
          id: "b",
          text: "<code>[[1, 2], [1, 4], [7, 2]]</code>",
          why: "After <code>(1, 4)</code> is popped, the pair <code>(1, 6)</code> with sum 7 is pushed. Its sum is below the sum 9 of <code>(7, 2)</code>, so it comes out first.",
        },
        {
          id: "c",
          text: "<code>[[1, 2], [1, 4], [1, 6]]</code>",
          why: "The sums come out as 3, 5 and 7. Each pop pushes the next pair of the same row, and <code>(1, 6)</code> with sum 7 is smaller than the seeds with sums 9 and 13.",
        },
        {
          id: "d",
          text: "<code>[[1, 2], [1, 4], [7, 4]]</code>",
          why: "The pair <code>(7, 4)</code> has sum 11, and it is only pushed after <code>(7, 2)</code> is popped, which has not happened. Pairs with sums 7 and 9 are available first.",
        },
      ],
      answer: "c",
    },
    {
      id: "heap-rooms-touching",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "edge-case",
      pattern: "heap",
      section: "greedy-with-a-heap-the-best-option-available-right-now",
      kind: "single",
      prompt:
        "<p>Using the chapter's <code>MinHeap</code>, what does the call return?</p><pre><code>function minMeetingRooms(intervals) {\n  const sorted = intervals.slice().sort((a, b) =&gt; a[0] - b[0]);\n  const ends = new MinHeap();\n  for (const [start, end] of sorted) {\n    if (ends.size() &gt; 0 &amp;&amp; ends.peek() &lt;= start) ends.pop();\n    ends.push(end);\n  }\n  return ends.size();\n}\n\nminMeetingRooms([[0, 5], [5, 10], [10, 15]]);</code></pre>",
      choices: [
        {
          id: "a",
          text: "1",
          why: "Each meeting starts at the moment the previous one ends. The test <code>peek() &lt;= start</code> is true each time, so the same room is freed and used again, and the heap never has more than one end time.",
        },
        {
          id: "b",
          text: "2",
          why: "This is what the code would give if the test were <code>peek() &lt; start</code>: then the second meeting could not reuse the room that ends at 5 and a second end time would be pushed. With <code>&lt;=</code> that does not happen.",
        },
        {
          id: "c",
          text: "3",
          why: "Three is the number of meetings, which is what you would get if no room were ever reused. A room is reused whenever its meeting has ended by the time the next one starts.",
        },
        {
          id: "d",
          text: "0",
          why: "The loop pushes an end time after every meeting, so the heap is never empty at the end when there is at least one meeting.",
        },
      ],
      answer: "a",
    },
    {
      id: "heap-rooms-recognise",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "recognise",
      pattern: "heap",
      section: "greedy-with-a-heap-the-best-option-available-right-now",
      kind: "single",
      prompt:
        "<p>You are given meetings as start and end times and must find the fewest rooms that hold all of them, with no two meetings in one room overlapping. Which approach is right?</p>",
      choices: [
        {
          id: "a",
          text: "Sort the meetings by end time and count how many can be chosen without any overlap.",
          why: "That counts the most meetings that fit in one room, which is a different question. Meetings that were left out still need rooms.",
        },
        {
          id: "b",
          text: "Count the pairs of meetings that overlap.",
          why: "Four meetings that all overlap give six overlapping pairs but need only four rooms. The number of pairs grows faster than the number of rooms.",
        },
        {
          id: "c",
          text: "Merge overlapping meetings into blocks of busy time and count the blocks.",
          why: "The meetings <code>[0, 10]</code>, <code>[1, 2]</code> and <code>[3, 4]</code> merge into one block, but the first meeting overlaps each of the others, so two rooms are needed.",
        },
        {
          id: "d",
          text: "Sort by start time and keep a min-heap of the end times of the rooms in use. Reuse the room that ends earliest if it is free, otherwise add a room.",
          why: "A new meeting can only reuse a room that has already ended, and the room that ended earliest is the best candidate. The heap root is that room, and the heap size at the end is the number of rooms ever needed at once.",
        },
      ],
      answer: "d",
    },
    {
      id: "heap-lazy-live-count",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "edge-case",
      pattern: "heap",
      section: "lazy-deletion-and-the-sliding-window-median",
      kind: "single",
      prompt:
        "<p>A sliding-window median removes numbers lazily. The number 2 has just left the window, and the lower max-heap still holds <code>[5, 4, 2]</code> with 2 recorded as owed. The balancing step must know how many numbers are really in the lower half. Why does the code keep its own counters instead of reading the heap's <code>size()</code>?</p>",
      choices: [
        {
          id: "a",
          text: "<code>size()</code> takes O(n) time on this heap, which is too slow.",
          why: "<code>size()</code> returns the length of an array, which takes constant time. Speed is not the reason.",
        },
        {
          id: "b",
          text: "<code>size()</code> stops changing once a heap has been popped from.",
          why: "Every <code>pop</code> removes one element from the array, so <code>size()</code> goes down each time.",
        },
        {
          id: "c",
          text: "<code>size()</code> only counts the entries above the median.",
          why: "<code>size()</code> counts every entry in the array, whatever its value. It has no idea where the median is.",
        },
        {
          id: "d",
          text: "<code>size()</code> counts the dead entry 2 as well, so it says 3 while only 5 and 4 are still in the window.",
          why: "A dead entry stays inside the array until it reaches the top. The array length is therefore at least the number of live numbers and can be larger, so balancing by it would put the wrong number of elements in each half.",
        },
      ],
      answer: "d",
    },
    {
      id: "heap-sort-cost",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "complexity",
      pattern: "heap",
      section: "heapsort-and-what-each-operation-costs",
      kind: "single",
      prompt:
        "<p>The chapter's heapsort builds a max-heap inside the array, then repeatedly swaps the root with the last slot of the heap range and sifts the new root down. What are its worst-case time and its extra space?</p>",
      choices: [
        {
          id: "a",
          text: "Time O(n log n), extra space O(1).",
          why: "Building the heap takes O(n), and then there are n - 1 sift-downs that each travel at most the height of the heap, which is O(log n). The heap lives in the input array, so no second array is needed.",
        },
        {
          id: "b",
          text: "Time O(n), extra space O(1), because the heap is built in O(n).",
          why: "Building the heap is O(n), but that is only the first stage. The loop after it does n - 1 sift-downs of up to log n steps each.",
        },
        {
          id: "c",
          text: "Time O(n log n), extra space O(n), because the heap needs its own array.",
          why: "The first stage rearranges the input array into a heap, and the second stage swaps within that same array. No second array is created.",
        },
        {
          id: "d",
          text: "Time O(n²), extra space O(1).",
          why: "A sift-down follows one path from the root towards a leaf, and the path has about log n nodes, not n. That keeps each of the n - 1 steps at O(log n).",
        },
      ],
      answer: "a",
    },
    {
      id: "heap-bucket-length",
      chapter: "dsa-heaps-priority-queues",
      level: "intermediate",
      skill: "edge-case",
      pattern: "heap",
      section: "top-k-frequent-a-heap-buckets-or-quickselect",
      kind: "single",
      prompt:
        "<p>A bucket version of top-K frequent creates its buckets with <code>Array.from({ length: nums.length }, () =&gt; [])</code> and then runs <code>buckets[count].push(value)</code> for every distinct value. What happens for <code>nums = [7, 7, 7]</code>?</p>",
      choices: [
        {
          id: "a",
          text: "It returns <code>[7]</code> for <code>k = 1</code>.",
          why: "The program never gets that far. The value 7 has a count of 3, and the array has indexes 0, 1 and 2 only.",
        },
        {
          id: "b",
          text: "It returns an empty array, because bucket 3 is skipped.",
          why: "The bucket is not skipped quietly. Reading index 3 of a three-element array gives <code>undefined</code>, and the code then calls <code>push</code> on it.",
        },
        {
          id: "c",
          text: "It throws a <code>TypeError</code>, because there is no bucket at index 3.",
          why: "A value that appears n times has count n, so the buckets need indexes 0 to n and therefore n + 1 slots. Reading index 3 gives <code>undefined</code>, and <code>undefined.push</code> is a <code>TypeError</code>.",
        },
        {
          id: "d",
          text: "It throws a <code>RangeError</code>, because the index is outside the array.",
          why: "Reading past the end of an array does not throw in JavaScript; it gives <code>undefined</code>. The error comes from the next step, calling a method on that <code>undefined</code>, and it is a <code>TypeError</code>.",
        },
      ],
      answer: "c",
    },
  ],
  pattern: {
    pattern: "heap",
    chapter: "dsa-heaps-priority-queues",
    signals: [
      "Top K, the k-th largest or smallest, or the k closest.",
      "Merging k sorted lists or arrays into one.",
      "The minimum or maximum is needed again and again while the data keeps changing.",
      "A running median or other statistic of a stream.",
      "A brute force would re-sort after every update.",
    ],
    template:
      "<pre><code>const heap = new MinHeap();\nfor (const x of nums) {\n  heap.push(x);\n  if (heap.size() &gt; k) heap.pop();\n}</code></pre>",
    time: "O(n log k)",
    space: "O(k)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
