import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "sort-numeric-comparator",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "recognise",
      pattern: "sorting",
      section: "why-js-s-built-in-sort-usually-wins-anyway",
      placement: true,
      kind: "single",
      prompt:
        "<p>You have <code>const ids = [25, 4, 100, 1]</code> and need it in ascending numeric order, <code>[1, 4, 25, 100]</code>. Which call does that in JavaScript?</p>",
      choices: [
        {
          id: "a",
          text: "<code>ids.sort()</code>",
          why: 'With no comparator, <code>sort</code> turns the elements into strings and compares those, so <code>"100"</code> comes before <code>"25"</code> and <code>"25"</code> before <code>"4"</code>. You get <code>[1, 100, 25, 4]</code>.',
        },
        {
          id: "b",
          text: "<code>ids.sort((a, b) =&gt; b - a)</code>",
          why: "This comparator puts the larger value first, so the result is descending: <code>[100, 25, 4, 1]</code>.",
        },
        {
          id: "c",
          text: "<code>ids.sort((a, b) =&gt; a - b)</code>",
          why: "The comparator returns a negative number when <code>a</code> is smaller, so <code>a</code> goes first. That compares the numbers themselves and gives <code>[1, 4, 25, 100]</code>.",
        },
        {
          id: "d",
          text: "<code>ids.sort((a, b) =&gt; a &gt; b)</code>",
          why: "A comparator has to return a number that is negative, zero or positive. This one returns <code>true</code> or <code>false</code>, which count as 1 or 0 and are never negative, so the engine is never told that <code>a</code> should come first. The array is not reliably sorted.",
        },
      ],
      answer: "c",
    },
    {
      id: "sort-bounded-scores",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "recognise",
      pattern: "sorting",
      section: "counting-sort-when-the-range-is-small",
      placement: true,
      kind: "single",
      prompt:
        "<p>An exam gave each of 2,000,000 students a whole-number score from 0 to 100, and you must sort all the scores. Which approach suits this data best?</p>",
      choices: [
        {
          id: "a",
          text: "Bubble sort, because the scores are small numbers and most of them will already be close.",
          why: "The numbers being small does not help bubble sort, because its cost depends on how many elements there are. With 2,000,000 of them, O(n²) is trillions of steps.",
        },
        {
          id: "b",
          text: "Counting sort: count how many students got each score, then write them out in order.",
          why: "The scores can only take 101 different values, so the counts array is tiny. The cost is O(n + k), about two million steps, and no two elements are ever compared.",
        },
        {
          id: "c",
          text: "Quicksort with a random pivot, since no sort can beat O(n log n) on this many numbers.",
          why: "Any sort that compares elements needs about n log n steps, roughly 40 million comparisons here. When the values come from a tiny known range, counting them avoids comparing at all and does better.",
        },
        {
          id: "d",
          text: "Heap sort, because it uses no extra memory and its worst case never degrades below n log n.",
          why: "Heap sort has a guaranteed O(n log n) worst case and O(1) extra space, but this problem has no memory limit. The tiny range of scores is the clue that points to something faster than any comparison sort.",
        },
      ],
      answer: "b",
    },
    {
      id: "sort-ties-keep-order",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "recognise",
      pattern: "sorting",
      section: "the-cheat-sheet-interviewers-expect-you-to-know-cold",
      placement: true,
      kind: "single",
      prompt:
        "<p>A list of orders is already in date order. You sort it again by customer name, and each customer's orders must stay in date order. Which property of the second sort do you need?</p>",
      choices: [
        {
          id: "a",
          text: "It must be in place, using O(1) extra space.",
          why: "Memory use has nothing to do with what happens to ties. Heap sort is in place and still shuffles equal elements.",
        },
        {
          id: "b",
          text: "It must have a worst case of O(n log n).",
          why: "That is a promise about speed. Heap sort has it, and it does not keep equal elements in their earlier order.",
        },
        {
          id: "c",
          text: "It must be fast on data that is already nearly sorted.",
          why: "Being fast on nearly sorted input is also about speed. It says nothing about which of two equal customers ends up first.",
        },
        {
          id: "d",
          text: "It must be stable.",
          why: "A stable sort keeps equal elements in their original relative order, so orders from the same customer stay in date order. Merge sort and insertion sort are stable, and so is the TimSort behind JavaScript's <code>sort</code>. Quicksort and heap sort are not.",
        },
      ],
      answer: "d",
    },
    {
      id: "sort-bubble-first-pass",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "trace",
      pattern: "sorting",
      section: "bubble-sort-repeatedly-swap-neighbors-into-order",
      kind: "single",
      prompt:
        "<p>The chapter's <code>bubbleSort</code> runs on <code>[6, 2, 9, 4, 1]</code>. What does the array hold right after the first full pass of the inner loop, when <code>i</code> is 0?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[2, 6, 4, 1, 9]</code>",
          why: "The pass compares neighbours left to right. It swaps 6 and 2, leaves 6 and 9 alone, then swaps 9 with 4 and 9 with 1, so the 9 is carried to the end. That is three swaps in one pass.",
        },
        {
          id: "b",
          text: "<code>[1, 2, 4, 6, 9]</code>, fully sorted",
          why: "One pass only carries the largest value to the end. Putting everything in order takes several passes, up to n - 1 of them.",
        },
        {
          id: "c",
          text: "<code>[2, 6, 9, 4, 1]</code>",
          why: "That is the array after only the first swap. A pass does not stop at the first swap. It keeps comparing neighbours until the end of the unsorted part.",
        },
        {
          id: "d",
          text: "<code>[1, 2, 9, 4, 6]</code>",
          why: "This is what one pass of selection sort gives: the minimum swapped to the front. Bubble sort moves the largest value to the back by many small swaps instead.",
        },
      ],
      answer: "a",
    },
    {
      id: "sort-partition-trace",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "trace",
      pattern: "sorting",
      section: "quicksort-partition-then-recurse",
      kind: "single",
      prompt:
        "<p>The chapter's <code>partition</code>, with the last element as the pivot, runs on <code>arr = [4, 9, 3, 8, 1, 6]</code> with <code>lo = 0</code> and <code>hi = 5</code>. What does it return, and what does <code>arr</code> look like afterwards?</p>",
      choices: [
        {
          id: "a",
          text: "It returns 3, and <code>arr</code> is fully sorted: <code>[1, 3, 4, 6, 8, 9]</code>.",
          why: "Partitioning does not sort either side. It only puts the pivot in its final place with the smaller values somewhere on its left and the larger ones somewhere on its right.",
        },
        {
          id: "b",
          text: "It returns 3, and <code>arr</code> is <code>[4, 3, 1, 6, 9, 8]</code>.",
          why: "The values below 6 are 4, 3 and 1, and they are swapped to the front in that order, so <code>i</code> ends at 3. The last step swaps the pivot into index 3, which leaves <code>[4, 3, 1, 6, 9, 8]</code>.",
        },
        {
          id: "c",
          text: "It returns 3, and <code>arr</code> is <code>[4, 3, 1, 8, 9, 6]</code>.",
          why: "This leaves out the final swap. The pivot 6 is still at the end, so it has not reached its sorted position, and the returned index would not point at it.",
        },
        {
          id: "d",
          text: "It returns 4, and <code>arr</code> is <code>[4, 3, 1, 6, 9, 8]</code>.",
          why: "The array is right, but the index is off by one. Three values are below the pivot, so <code>i</code> is 3 and the pivot sits at index 3, and that index is what is returned.",
        },
      ],
      answer: "b",
    },
    {
      id: "sort-quicksort-sorted-input",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "complexity",
      pattern: "sorting",
      section: "quicksort-partition-then-recurse",
      kind: "single",
      prompt:
        "<p>The chapter's <code>quickSort</code> picks the last element as its pivot. It is run on an array that is already sorted, <code>[1, 2, 3, ..., n]</code>. What is its running time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n log n), because quicksort splits the array in half each time.",
          why: "That is the average case. On sorted input with a last-element pivot, the pivot is the largest remaining value every time, so one side of each split is empty.",
        },
        {
          id: "b",
          text: "O(n), because the array is already in order and nothing needs to move.",
          why: "<code>partition</code> still compares every element with the pivot, and quicksort does not notice that the array is sorted. The recursion also only shrinks by one element at a time.",
        },
        {
          id: "c",
          text: "O(n²), because every split removes only the pivot.",
          why: "The pivot is the largest value, so the left part holds n - 1 elements and the right part is empty. The comparisons add up to (n - 1) + (n - 2) + ... + 1, which is n(n - 1) / 2: 28 for n = 8 and 499,500 for n = 1,000.",
        },
        {
          id: "d",
          text: "O(log n), because the recursion depth is logarithmic.",
          why: "The work would be about n log n only if each pivot split the range in half, giving log n rounds of scanning. Here every split leaves one side empty, so there are n rounds, and each one scans the remaining elements.",
        },
      ],
      answer: "c",
    },
    {
      id: "sort-insertion-nearly-sorted",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "complexity",
      pattern: "sorting",
      section: "insertion-sort-build-up-a-sorted-prefix-one-element-at-a-tim",
      kind: "single",
      prompt:
        "<p>A list of n readings arrives almost in order: after sorting, every reading would move at most 3 places. How does the chapter's <code>insertionSort</code> behave on it?</p>",
      choices: [
        {
          id: "a",
          text: "O(n²), because that is its worst case whatever the input.",
          why: "The worst case is for inputs like a reversed array, where every element travels far. The cost really depends on how far each element has to shift.",
        },
        {
          id: "b",
          text: "O(n), because each element only shifts a few places.",
          why: "The inner <code>while</code> loop runs once per place an element has to move, so a constant number of shifts per element gives O(n) in total. When every reading is at most 3 places from its sorted spot, each one can be out of order with at most 6 others, so 10,000 readings need at most 30,000 shifts. A reversed array of that size takes 49,995,000.",
        },
        {
          id: "c",
          text: "O(n log n), because every comparison sort needs that many steps.",
          why: "The n log n limit is for the worst case of sorts that compare elements. Insertion sort does not halve anything, and on nearly sorted data it does less work than that limit.",
        },
        {
          id: "d",
          text: "O(log n), because the sorted prefix is searched like a sorted array.",
          why: "Even sorting needs at least a look at every element, so no sort can be O(log n). The code also walks the prefix one step at a time instead of halving it.",
        },
      ],
      answer: "b",
    },
    {
      id: "sort-counting-huge-range",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "complexity",
      pattern: "sorting",
      section: "counting-sort-when-the-range-is-small",
      kind: "single",
      prompt:
        "<p>You must sort 1,000 integers that can be anywhere from 0 to 1,000,000,000. A teammate suggests <code>countingSort(arr, 1000000000)</code> because it is O(n + k). Why is that a poor choice?</p>",
      choices: [
        {
          id: "a",
          text: "Counting sort only works when every value is different, so repeated values break it.",
          why: "Repeated values are what the counts are for. Each <code>counts[x]</code> simply goes above 1.",
        },
        {
          id: "b",
          text: "Counting sort still compares elements in pairs, so it cannot beat O(n log n) here.",
          why: "Counting sort never compares two elements. That is exactly how it can beat the n log n limit of comparison sorts, when the range allows it.",
        },
        {
          id: "c",
          text: "Counting sort cannot handle values above 100, whatever the length of the array is.",
          why: "There is no such limit. Any bounded range works, and the trouble is how large that range is.",
        },
        {
          id: "d",
          text: "The counts array would need a billion slots, far more work than about 10,000 comparisons.",
          why: "O(n + k) is only good when k is small. Here the k term dwarfs n, because the walk from 0 to <code>maxVal</code> visits every possible value, and so an ordinary comparison sort does far less work.",
        },
      ],
      answer: "d",
    },
    {
      id: "sort-merge-base-case",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "edge-case",
      pattern: "sorting",
      section: "merge-sort-divide-conquer-then-combine",
      kind: "single",
      prompt:
        "<p>A teammate changes the first line of the chapter's <code>mergeSort</code> from <code>if (arr.length &lt;= 1) return arr;</code> to <code>if (arr.length === 1) return arr;</code>. What happens on <code>mergeSort([])</code>?</p>",
      choices: [
        {
          id: "a",
          text: "It throws a <code>RangeError</code>, because the recursion never reaches the base case.",
          why: "For an empty array <code>mid</code> is 0, and both <code>slice(0, 0)</code> and <code>slice(0)</code> are empty again. The function calls itself on the same empty array until the call stack overflows.",
        },
        {
          id: "b",
          text: "It returns <code>[]</code>, because there is nothing to sort.",
          why: "That would be true with the original <code>&lt;= 1</code> check. With <code>=== 1</code>, a length of 0 does not match, so the function does not return early.",
        },
        {
          id: "c",
          text: "It returns <code>undefined</code>, because no value is returned.",
          why: "The function never reaches a return for an empty array. It keeps recursing instead, so it never produces a value of any kind.",
        },
        {
          id: "d",
          text: "It works, because the two slices are smaller than the original array.",
          why: "Neither slice is smaller. Both are empty arrays of length 0, the same as the input, so the recursion makes no progress.",
        },
      ],
      answer: "a",
    },
    {
      id: "sort-group-anagrams",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "recognise",
      pattern: "sorting",
      section: "recognizing-when-sorting-is-the-actual-pattern",
      kind: "single",
      prompt:
        '<p>You are given a list of words and must group the ones that are anagrams of each other, such as <code>"listen"</code> and <code>"silent"</code>. Which idea does the grouping rest on?</p>',
      choices: [
        {
          id: "a",
          text: "Sort the list of words alphabetically, and anagrams will sit next to each other.",
          why: 'Anagrams are not alphabetical neighbours. In a list holding <code>"listen"</code>, <code>"litter"</code> and <code>"silent"</code>, the word <code>"litter"</code> lands between the two anagrams.',
        },
        {
          id: "b",
          text: "Sort the words by length, because anagrams always have the same length.",
          why: 'The same length is necessary but not enough. <code>"listen"</code> and <code>"garden"</code> are both six letters long and are not anagrams.',
        },
        {
          id: "c",
          text: "Sort the letters inside each word, and use that sorted string as the group key.",
          why: 'Anagrams contain the same letters, so sorting the letters gives the same string for all of them. <code>"listen"</code> and <code>"silent"</code> both become <code>"eilnst"</code>. This is sorting used to normalize items into a key.',
        },
        {
          id: "d",
          text: "Use a stable sort, so that equal words keep their original order.",
          why: "Stability only matters when elements compare as equal. Sorting the words themselves compares different strings, so there are no ties, and it does not bring anagrams together.",
        },
      ],
      answer: "c",
    },
    {
      id: "sort-worst-case-guarantee",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "recognise",
      pattern: "sorting",
      section: "the-cheat-sheet-interviewers-expect-you-to-know-cold",
      kind: "multi",
      prompt:
        "<p>Select every algorithm from the chapter whose worst case is O(n log n). Quicksort here uses the last element as its pivot.</p>",
      choices: [
        {
          id: "a",
          text: "Merge sort",
          why: "Merge sort always splits in half and merges in O(n) per level, so its worst case is the same O(n log n) as its average case. It pays for that with O(n) extra space.",
        },
        {
          id: "b",
          text: "Quicksort",
          why: "Its average case is O(n log n), but a bad pivot choice, such as the last element of a sorted array, gives O(n²). A random pivot makes that unlikely but does not remove it.",
        },
        {
          id: "c",
          text: "Heap sort",
          why: "Building the heap is O(n) and each of the n extractions costs O(log n), whatever the input. Its worst case is guaranteed O(n log n), and it works in place.",
        },
        {
          id: "d",
          text: "Insertion sort",
          why: "Insertion sort is O(n²) in the worst case, such as a reversed array. It is fast only on nearly sorted input.",
        },
      ],
      answers: ["a", "c"],
    },
    {
      id: "sort-order-counting-sort",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "trace",
      pattern: "sorting",
      section: "counting-sort-when-the-range-is-small",
      kind: "order",
      prompt: "<p>Put the steps of the chapter's <code>countingSort(arr, maxVal)</code> in the order they happen.</p>",
      items: [
        { id: "make", text: "Create <code>counts</code>, an array of <code>maxVal + 1</code> zeros." },
        {
          id: "tally",
          text: "Walk <code>arr</code> once and add 1 to <code>counts[x]</code> for every value <code>x</code>.",
        },
        { id: "walk", text: "Walk <code>val</code> upward from 0 to <code>maxVal</code>." },
        {
          id: "write",
          text: "For each <code>val</code>, push it onto <code>result</code> as many times as <code>counts[val]</code> says.",
        },
      ],
      why: "The counts array has to exist before anything can be tallied, and the tally has to be finished before the output is written, because the output reads the final counts. Walking <code>val</code> from low to high is what puts the result in ascending order, and no element is ever compared with another.",
    },
    {
      id: "sort-lomuto-all-equal",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "complexity",
      pattern: "sorting",
      section: "partitioning-lomuto-s-trap-three-way-and-hoare",
      kind: "single",
      prompt:
        "<p>The chapter's quicksort uses Lomuto's partition with the last element as the pivot. How does its running time grow when it sorts an array of n values that are all equal?</p>",
      choices: [
        {
          id: "a",
          text: "O(n), because an array with no disorder needs only one pass",
          why: "A pass over the array is O(n), but each partition fixes only one element and the recursion then handles the other n − 1. One pass is not the whole run.",
        },
        {
          id: "b",
          text: "O(n log n), because each partition splits the range into two equal halves, so the recursion is about log n levels deep",
          why: "The split is not even. The test <code>arr[j] &lt; pivot</code> is never true for equal values, so everything stays on the right of the pivot and the left part is empty.",
        },
        {
          id: "c",
          text: "O(2ⁿ), because every call makes two recursive calls",
          why: "One of the two calls is on an empty range and returns at once, so the calls form a chain of about n, not a doubling tree.",
        },
        {
          id: "d",
          text: "O(n²), because each partition peels off only one element and scans all the rest",
          why: 'Equal values are never "less than" the pivot, so the pivot ends at the start of the range and each call shrinks the problem by one. The scans add up to n(n − 1) / 2 comparisons: 1,999,000 for 2,000 values. A three-way partition finishes in one pass.',
        },
      ],
      answer: "d",
    },
    {
      id: "sort-three-way-result",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "trace",
      pattern: "sorting",
      section: "partitioning-lomuto-s-trap-three-way-and-hoare",
      kind: "single",
      prompt:
        "<p>The array is <code>[4, 1, 5, 2]</code>. What does <code>partition3(arr, 0, 3, 3)</code> return, as <code>[lt, gt]</code>, using the function from the chapter?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[2, 1]</code>",
          why: "No element equals 3, so the middle block is empty and <code>gt</code> ends one less than <code>lt</code>. The array becomes <code>[2, 1, 5, 4]</code>: indices 0 and 1 hold the smaller values, and 2 and 3 the larger.",
        },
        {
          id: "b",
          text: "<code>[2, 2]</code>",
          why: "That would say index 2 holds a value equal to 3, but <code>arr[2]</code> is 5. A middle block of one element needs one element equal to the pivot.",
        },
        {
          id: "c",
          text: "<code>[0, 3]</code>",
          why: "That is the result for an array in which every element equals the pivot. Here the values are all different from 3.",
        },
        {
          id: "d",
          text: "<code>[1, 2]</code>",
          why: "Two elements, 1 and 2, are smaller than 3, so <code>lt</code> ends at 2, not 1.",
        },
      ],
      answer: "a",
    },
    {
      id: "sort-quickselect-index",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "edge-case",
      pattern: "sorting",
      section: "quickselect-the-k-th-smallest-without-sorting-everything",
      kind: "single",
      prompt:
        "<p>You must find the 3rd largest of 7 values with the chapter's <code>quickselect(nums, k)</code>, where <code>k</code> is a 0-based index into the sorted order and <code>k = 0</code> is the minimum. Which call is right?</p>",
      choices: [
        {
          id: "a",
          text: "<code>quickselect(nums, 2)</code>",
          why: "Index 2 is the 3rd smallest of the seven values, not the 3rd largest.",
        },
        {
          id: "b",
          text: "<code>quickselect(nums, 3)</code>",
          why: "Index 3 is the middle value (the median of seven), the 4th smallest and also the 4th largest.",
        },
        {
          id: "c",
          text: "<code>quickselect(nums, 4)</code>",
          why: "In sorted order the largest is at index 6, the 2nd largest at 5 and the 3rd largest at 4. In general the k-th largest is at index <code>n − k</code>, here 7 − 3.",
        },
        {
          id: "d",
          text: "<code>quickselect(nums, 5)</code>",
          why: 'Index 5 is the 2nd largest. Counting the largest as "1st" means the k-th largest is at <code>n − k</code>, not <code>n − k + 1</code>.',
        },
      ],
      answer: "c",
    },
    {
      id: "sort-quickselect-cost",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "complexity",
      pattern: "sorting",
      section: "quickselect-the-k-th-smallest-without-sorting-everything",
      kind: "single",
      prompt:
        "<p>Quickselect with a random pivot finds the k-th smallest of n values. What is its average running time, and why?</p>",
      choices: [
        {
          id: "a",
          text: "O(n log n), because it partitions at every level just as quicksort does, so every level handles all n elements, as in a full sort",
          why: "Quicksort recurses into both sides, so every level handles all n elements. Quickselect keeps only the side that contains index k, so the work shrinks from level to level.",
        },
        {
          id: "b",
          text: "O(log n), because each step halves the range",
          why: "Each step still scans the whole current range to partition it, which costs O(range). The ranges shrink, but their sizes add up to more than a logarithm.",
        },
        {
          id: "c",
          text: "O(n²), because the pivot is chosen at random",
          why: "A random pivot is what makes the quadratic case very unlikely. O(n²) is the worst case, when every pivot is nearly the smallest or largest value.",
        },
        {
          id: "d",
          text: "O(n), because the remaining part shrinks by a constant fraction on average, so the sizes form a geometric series",
          why: "With probability 1/2 the pivot falls in the middle half and at most 3/4 of the range remains. The costs n + (3/4)n + (3/4)²n + … add up to a constant times n, and measured on random data it averaged about 3.4 element visits per element.",
        },
      ],
      answer: "d",
    },
    {
      id: "sort-inversions-merge-step",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "trace",
      pattern: "sorting",
      section: "counting-inversions-a-merge-sort-that-answers-a-question",
      kind: "single",
      prompt:
        "<p>During the merge in <code>countInversions</code>, the left half is <code>[2, 5, 8]</code> and the right half is <code>[3, 4, 9]</code>, both already sorted. How many inversions does this merge add to <code>count</code>?</p>",
      choices: [
        {
          id: "a",
          text: "2",
          why: "Two is the number of times an element is taken from the right half while the left half still has elements (the 3 and the 4). Each of those jumps over several left elements, and the count adds all of them.",
        },
        {
          id: "b",
          text: "4",
          why: "The 3 is written before 5 and 8, adding <code>mid − i</code> = 2, and the 4 is written before the same two, adding 2 more. The 9 is written after the left half is used up, so it adds nothing.",
        },
        {
          id: "c",
          text: "6",
          why: "Six would count every right element against every left element it exceeds or sits beside. The 9 is larger than all of the left half, so it forms no inversion at all.",
        },
        {
          id: "d",
          text: "9",
          why: "Nine is the number of pairs with one element from each half (3 × 3), but most of them are in the right order, such as (2, 3) and (5, 9).",
        },
      ],
      answer: "b",
    },
    {
      id: "sort-boolean-comparator",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "edge-case",
      pattern: "sorting",
      section: "writing-comparators-that-do-not-lie",
      kind: "single",
      prompt:
        "<p>A teammate sorts numbers with <code>nums.sort((a, b) =&gt; a &gt; b)</code>. In node, <code>[4, 3, 2, 1].sort((a, b) =&gt; a &gt; b)</code> returns <code>[4, 3, 2, 1]</code> unchanged. What is wrong?</p>",
      choices: [
        {
          id: "a",
          text: "The comparator returns <code>true</code> or <code>false</code>, which are never negative, so it cannot say that <code>a</code> goes first",
          why: "A comparator must return a negative number, zero or a positive number. With only 1 and 0 the engine never learns that an element belongs earlier, so the order it produces is unreliable, and on 30-element random arrays it was wrong every time in node.",
        },
        {
          id: "b",
          text: "It sorts in descending order, so it should use <code>&lt;</code> instead",
          why: "Switching the operator does not help: <code>a &lt; b</code> is also a boolean, and a boolean is the problem. The array above is simply left as it was, not reversed.",
        },
        {
          id: "c",
          text: "It throws a <code>TypeError</code>, because the comparator must return a number",
          why: "No error is thrown. The value is converted to a number, 1 or 0, and the sort goes ahead with a comparator that is not consistent.",
        },
        {
          id: "d",
          text: "Nothing is wrong, because <code>true</code> means that the pair should be swapped and <code>false</code> means that it should stay where it is",
          why: 'The sort does not interpret the result as "swap". It treats it as the sign of a comparison, and a result that is never negative cannot express "a before b".',
        },
      ],
      answer: "a",
    },
    {
      id: "sort-radix-stable-pass",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "edge-case",
      pattern: "sorting",
      section: "radix-sort-one-digit-at-a-time",
      kind: "single",
      prompt:
        "<p>An LSD radix sort handles the ones digit first, then the tens, then the hundreds. Suppose its tens-digit pass is <em>not</em> stable. What can go wrong?</p>",
      choices: [
        {
          id: "a",
          text: "The pass can crash when two numbers have the same tens digit, because the counting array has room for only one number per digit",
          why: "Equal digits are ordinary input for a counting pass. Without stability they are placed in some order, not rejected.",
        },
        {
          id: "b",
          text: "The result is always sorted in descending order instead",
          why: "An unstable pass does not reverse the order. It only fails to preserve the order that the earlier pass gave to numbers that tie on the current digit.",
        },
        {
          id: "c",
          text: "Numbers that share a tens digit can lose the order the ones pass gave them, so the final array can be out of order",
          why: "Take 45 and 42: after the ones pass 42 comes before 45. They tie on the tens digit, so only a stable pass keeps 42 ahead of 45. An unstable pass may swap them, and no later pass looks at the ones digit again, so the mistake stays.",
        },
        {
          id: "d",
          text: "Nothing, because the hundreds pass will sort everything again",
          why: "A later pass only orders by its own digit. Numbers that tie on it keep whatever order they arrived in, so a mistake made earlier is not repaired.",
        },
      ],
      answer: "c",
    },
    {
      id: "sort-lower-bound-claim",
      chapter: "dsa-sorting-algorithms",
      level: "beginner",
      skill: "recognise",
      pattern: "sorting",
      section: "why-n-log-n-is-a-wall-for-comparison-sorts",
      kind: "single",
      prompt:
        '<p>An interviewer asks: "Could a clever algorithm sort n arbitrary distinct numbers in O(n) worst-case time using only comparisons between elements?" What is the best answer?</p>',
      choices: [
        {
          id: "a",
          text: "Yes, merge sort can be tuned to reach O(n) with enough care",
          why: "Merge sort's worst case is about n log₂ n comparisons, which is already close to the proven minimum, so there is no tuning that reaches O(n).",
        },
        {
          id: "b",
          text: "No: a comparison sort must tell apart all n! orderings, so its decision tree needs n! leaves and a height of at least log₂(n!), which is Ω(n log n)",
          why: "Each comparison has two outcomes, so t comparisons can distinguish at most 2ᵗ orderings, and 2ᵗ ≥ n! forces t ≥ log₂(n!) ≥ (n/2) log₂(n/2). Counting and radix sort escape the bound because they read values rather than only comparing.",
        },
        {
          id: "c",
          text: "No, because every sorting algorithm needs at least n log n steps",
          why: "That is too broad: counting sort runs in O(n + k) and radix sort in O(d · (n + b)). The bound holds only for algorithms that learn about the data through comparisons.",
        },
        {
          id: "d",
          text: "Yes, if the input happens to be nearly sorted",
          why: "Nearly sorted input can be handled in O(n), as insertion sort does, but the question asks about the worst case over arbitrary inputs, where the bound applies.",
        },
      ],
      answer: "b",
    },
  ],
  pattern: {
    pattern: "sorting",
    chapter: "dsa-sorting-algorithms",
    signals: [
      "The problem gets easier once the data is in order, for example with two pointers, binary search or a merge.",
      "Items that look the same after sorting need to be grouped, such as anagrams.",
      "Intervals or events have to be handled in order of their start time.",
      "The values are small whole numbers in a known range, which points to counting sort.",
      "Equal items must keep their earlier relative order, which needs a stable sort.",
    ],
    template:
      "<pre><code>const ordered = items.slice().sort((a, b) =&gt; a.key - b.key);\nfor (const item of ordered) {\n  process(item);\n}</code></pre>",
    time: "O(n log n)",
    space: "O(n)",
    styles: ["online-assessment", "phone-screen"],
  },
};
