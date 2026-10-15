import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "os-closest-so-far",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "recognise",
      pattern: "ordered-set",
      section: "what-an-ordered-set-has-to-answer",
      placement: true,
      kind: "single",
      prompt:
        "<p>Up to two million numbers arrive one at a time. For each new number <code>x</code>, you must report the smallest number seen so far that is at least <code>x</code>, and then remember <code>x</code>. Which structure fits?</p>",
      choices: [
        {
          id: "a",
          text: "A <code>Set</code>, looking up <code>x</code> and scanning for the next larger value.",
          why: "A Set answers whether one exact value is present, but it keeps no sorted order. Finding the next larger value means scanning every stored number, which is O(n) per query.",
        },
        {
          id: "b",
          text: "A min-heap of the numbers seen so far.",
          why: "A heap gives the smallest number overall in O(1). It cannot give the smallest number that is at least <code>x</code>, because reaching it means popping everything below <code>x</code> first.",
        },
        {
          id: "c",
          text: "An ordered multiset answering <code>ceiling(x)</code>, such as a balanced tree.",
          why: "<code>ceiling(x)</code> is exactly the smallest stored key that is at least <code>x</code>. These structures answer it in logarithmic or square-root time while still allowing an insert after every query.",
        },
        {
          id: "d",
          text: "A plain sorted array, using binary search and <code>splice</code> for every insert.",
          why: "Each search is O(log n), but each insert shifts about half the array. Two million inserts move on the order of 10<sup>12</sup> items in total, which is too slow here, though it is a sound choice for tens of thousands of numbers.",
        },
      ],
      answer: "c",
    },
    {
      id: "os-calendar-design",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "recognise",
      pattern: "ordered-set",
      section: "interval-maps-my-calendar-i-ii-and-iii",
      placement: true,
      kind: "single",
      prompt:
        "<p>A calendar accepts <code>book(start, end)</code> for half-open ranges, with times up to 10<sup>9</sup>, and refuses any booking that overlaps an earlier one. There are 100,000 calls. Which design makes each call O(log n)?</p>",
      choices: [
        {
          id: "a",
          text: "Keep all bookings in an array and compare the new one with each of them.",
          why: "The answers are right, but each call costs O(n). Over 100,000 calls that is about 5 × 10<sup>9</sup> comparisons in total.",
        },
        {
          id: "b",
          text: "Keep a boolean array with one cell for every time unit.",
          why: "Times reach 10<sup>9</sup>, so the array would need a billion cells, and every booking would also have to mark its whole range.",
        },
        {
          id: "c",
          text: "An ordered map keyed by start, checked with floor and ceiling.",
          why: "The stored bookings never overlap, so only the one with the largest start at or before the new start can run past it, and only the one with the smallest start at or after it can begin before the new end.",
        },
        {
          id: "d",
          text: "Sort the bookings by start on every call, then scan them once.",
          why: "Sorting costs O(n log n) per call and the scan is another O(n), so this is slower than the array scan it was meant to improve on.",
        },
      ],
      answer: "c",
    },
    {
      id: "os-known-values",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "recognise",
      pattern: "ordered-set",
      section: "offline-a-fenwick-tree-over-compressed-coordinates",
      placement: true,
      kind: "single",
      prompt:
        "<p>An array of 100,000 integers is given. Going left to right, you must report for each element how many earlier elements are smaller than it. Every value is known before you start. Which structure is the shortest route to O(log n) per element, with no randomness?</p>",
      choices: [
        {
          id: "a",
          text: "A hash map from each value to the number of times it occurred.",
          why: "It tells how often one exact value occurred. It cannot say how many values lie below <code>x</code> without scanning every key.",
        },
        {
          id: "b",
          text: "A min-heap holding the earlier elements.",
          why: "A heap exposes only its smallest element. Counting the earlier elements below <code>x</code> would mean popping them one at a time.",
        },
        {
          id: "c",
          text: "A sorted copy of the whole array, with a binary search for each element.",
          why: "The sorted copy contains the later elements too, so the search counts every smaller element in the array, not only the ones that came before.",
        },
        {
          id: "d",
          text: "A Fenwick tree of counts, indexed by compressed value.",
          why: "Compression gives each value its position among the sorted distinct values. The count of smaller earlier elements is then a prefix sum over positions, and each element costs one query and one update.",
        },
      ],
      answer: "d",
    },
    {
      id: "os-sorted-array-insert",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "complexity",
      pattern: "ordered-set",
      section: "the-sorted-array-and-where-it-stops",
      kind: "single",
      prompt:
        "<p>A sorted array holds n numbers. A binary search finds where a new number belongs, and <code>splice</code> inserts it there. What does one insert cost?</p>",
      choices: [
        {
          id: "a",
          text: "O(log n)",
          why: "That is the cost of finding the position. <code>splice</code> then has to move every item after that position one place to the right.",
        },
        {
          id: "b",
          text: "O(n)",
          why: "The shift moves up to n items, and about n / 2 for a random position. The binary search adds only O(log n), which does not change the total.",
        },
        {
          id: "c",
          text: "O(n log n)",
          why: "That would be the cost of sorting the array again, which is not needed: the array is already in order apart from the item being inserted.",
        },
        {
          id: "d",
          text: "O(1)",
          why: "Adding at the end of an array is O(1) on average, but the new number can belong anywhere, and every item behind its position has to move.",
        },
      ],
      answer: "b",
    },
    {
      id: "os-treap-add-cost",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "complexity",
      pattern: "ordered-set",
      section: "the-class-add-remove-rank-select-and-neighbours",
      kind: "single",
      prompt:
        "<p>A treap holds n keys, and each key's priority was drawn at random when the key was added. Which statement about the cost of <code>add</code> is right?</p>",
      choices: [
        {
          id: "a",
          text: "It is O(log n) in expectation, whatever the order in which the keys arrive.",
          why: "The shape of a treap is fixed by the keys and the random priorities, not by the order of arrival, so its height is O(log n) in expectation and a split and two merges follow one path.",
        },
        {
          id: "b",
          text: "It is O(n) whenever the keys arrive in sorted order.",
          why: "Sorted arrival ruins a plain search tree, but not a treap: the priorities are random, so sorted input cannot make the tree tall.",
        },
        {
          id: "c",
          text: "It is O(1), because it only changes one pointer.",
          why: "Add rewires every node along a root-to-leaf path through <code>split</code> and <code>merge</code>, and that path has O(log n) nodes in expectation.",
        },
        {
          id: "d",
          text: "It is O(log n) in the worst case, as in an AVL tree.",
          why: "The treap's bound is only an expectation over its random priorities; an unlucky draw can make it taller, with very small probability. The worst-case guarantee belongs to AVL and red-black trees.",
        },
      ],
      answer: "a",
    },
    {
      id: "os-bucket-rank-cost",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "complexity",
      pattern: "ordered-set",
      section: "sqrt-buckets-many-short-arrays-instead-of-one-long-one",
      kind: "single",
      prompt:
        "<p>A bucketed sorted list holds n numbers in buckets of at most B items. <code>rank(x)</code> binary-searches to the position of <code>x</code> and then adds up the lengths of the buckets before it. What does one call cost?</p>",
      choices: [
        {
          id: "a",
          text: "O(log n)",
          why: "The two binary searches are logarithmic, but adding the lengths of the buckets in front of the position visits up to n / B buckets, and that part is not logarithmic.",
        },
        {
          id: "b",
          text: "O(B)",
          why: "B is what a bucket costs to shift on an insert. A rank does no shifting, and its extra work is a sum over the buckets, not over the items of one bucket.",
        },
        {
          id: "c",
          text: "O(n)",
          why: "The sum visits buckets, not items, and there are about n / B of them. That is below n whenever B is more than 1.",
        },
        {
          id: "d",
          text: "O(log n + n / B)",
          why: "The searches cost O(log n), and the sum visits at most about n / B bucket lengths. This is why a larger bucket size makes rank and select faster but makes inserts slower.",
        },
      ],
      answer: "d",
    },
    {
      id: "os-trace-treap-at",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "trace",
      pattern: "ordered-set",
      section: "the-class-add-remove-rank-select-and-neighbours",
      kind: "single",
      prompt:
        "<p>A treap holds the keys 10, 20, 30, 40 and 50. The root is 30. Its left child is 10, whose only child is a right child 20. Its right child is 50, whose only child is a left child 40. <code>at(1)</code> counts positions from 0. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "10",
          why: "10 is <code>at(0)</code>, the smallest key. The walk does visit 10, but with an empty left side and the index at 1 it skips 10 and goes right.",
        },
        {
          id: "b",
          text: "20",
          why: "From 30 the index 1 is below the left subtree's size of 2, so go left to 10. There the left size is 0 and the index is 1, so skip 10 and the index becomes 0, then go right. At 20 the left size is 0 and the index is 0, so this is the answer.",
        },
        {
          id: "c",
          text: "30",
          why: "30 is <code>at(2)</code>: its left subtree holds two keys, so index 2 is the root itself. Index 1 is smaller than that.",
        },
        {
          id: "d",
          text: "40",
          why: "40 is <code>at(3)</code>. It lies in the right subtree, which the walk only enters when the index is larger than the left size.",
        },
      ],
      answer: "b",
    },
    {
      id: "os-trace-bucket-add",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "trace",
      pattern: "ordered-set",
      section: "sqrt-buckets-many-short-arrays-instead-of-one-long-one",
      kind: "single",
      prompt:
        "<p>A bucketed sorted list has load 4 and holds <code>[1, 3]</code> and <code>[5, 7, 9]</code>. <code>add</code> puts an item into the first bucket whose last item is greater than it (or into the last bucket if none is), at the first position holding a larger item. A bucket that grows past 4 items splits so that its first part keeps <code>length &gt;&gt; 1</code> items. After <code>add(4)</code> and then <code>add(8)</code>, what are the buckets?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 3]</code> <code>[4, 5]</code> <code>[7, 8, 9]</code>",
          why: "<code>add(4)</code> goes into the second bucket, whose last item 9 is above 4, giving <code>[4, 5, 7, 9]</code>. <code>add(8)</code> makes it <code>[4, 5, 7, 8, 9]</code>, five items, which splits into two items and three.",
        },
        {
          id: "b",
          text: "<code>[1, 3]</code> <code>[4, 5, 7]</code> <code>[8, 9]</code>",
          why: "That splits the five items into three and two. The rule here keeps <code>5 &gt;&gt; 1</code> = 2 items in the first part, so the second part gets three.",
        },
        {
          id: "c",
          text: "<code>[1, 3, 4]</code> <code>[5, 7, 8, 9]</code>",
          why: "This is also a sorted arrangement, but the stated rule skips the first bucket, because its last item 3 is not greater than 4. The 4 goes into the second bucket.",
        },
        {
          id: "d",
          text: "<code>[1, 3]</code> <code>[4, 5, 7, 8, 9]</code>",
          why: "A bucket holding 5 items is over the load of 4, so it must split. No bucket may stay above the load after an add.",
        },
      ],
      answer: "a",
    },
    {
      id: "os-floor-lower-higher",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "edge-case",
      pattern: "ordered-set",
      section: "what-an-ordered-set-has-to-answer",
      kind: "single",
      prompt:
        "<p>An ordered multiset holds 2, 4, 4 and 7. What do <code>floor(4)</code>, <code>lower(4)</code> and <code>higher(4)</code> return, in that order?</p>",
      choices: [
        {
          id: "a",
          text: "4, 2, 7",
          why: "<code>floor</code> allows equality, so it returns 4. <code>lower</code> is strict and skips both copies of 4, returning 2. <code>higher</code> is strict and returns the first key above 4, which is 7.",
        },
        {
          id: "b",
          text: "2, 2, 4",
          why: "<code>floor(4)</code> may return 4 itself, so it is 4, not 2. And <code>higher(4)</code> is strictly larger than 4, so a second copy of 4 does not count.",
        },
        {
          id: "c",
          text: "4, 4, 7",
          why: "<code>lower(4)</code> is strict, so it cannot return 4. The largest key strictly below 4 is 2.",
        },
        {
          id: "d",
          text: "4, 2, 4",
          why: "<code>higher(4)</code> skips every key equal to 4 and returns the first larger one, which is 7. A copy of 4 would be the answer to <code>ceiling(4)</code>.",
        },
      ],
      answer: "a",
    },
    {
      id: "os-trunc-bucket",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "edge-case",
      pattern: "ordered-set",
      section: "contains-duplicate-iii-an-ordered-set-or-buckets",
      kind: "single",
      prompt:
        "<p>In the bucket solution of Contains Duplicate III, <code>valueDiff</code> is 1, so buckets have width 2. By mistake the bucket of <code>x</code> is computed as <code>Math.trunc(x / 2)</code> instead of <code>Math.floor(x / 2)</code>. Which pair is wrongly reported as a match, although the two numbers differ by more than 1?</p>",
      choices: [
        {
          id: "a",
          text: "-1 and 1",
          why: "<code>Math.trunc(-0.5)</code> is <code>-0</code> and <code>Math.trunc(0.5)</code> is <code>0</code>, and a <code>Map</code> treats the two as the same key. Both numbers land in one bucket although they differ by 2.",
        },
        {
          id: "b",
          text: "0 and 1",
          why: "They differ by 1, which is within <code>valueDiff</code>, so reporting a match is correct whichever rounding is used.",
        },
        {
          id: "c",
          text: "2 and 3",
          why: "Both truncate to bucket 1 and they differ by 1, so the match is correct. Truncation and floor agree for positive numbers.",
        },
        {
          id: "d",
          text: "-3 and -2",
          why: "Both truncate to bucket -1, and they differ by 1, so the match is correct. Truncation goes wrong only around zero, where one bucket covers three values (-1, 0 and 1) instead of two.",
        },
      ],
      answer: "a",
    },
    {
      id: "os-exam-room-next",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "edge-case",
      pattern: "ordered-set",
      section: "exam-room-a-set-of-seats-and-a-set-of-gaps",
      kind: "single",
      prompt:
        "<p>An exam room has 10 seats, numbered 0 to 9, and students already sit in seats 0 and 9. The next student takes the seat farthest from the closest student, with ties going to the lowest seat. Where do they sit?</p>",
      choices: [
        {
          id: "a",
          text: "Seat 5",
          why: "Seat 5 is 5 away from seat 0 but only 4 away from seat 9, so its distance to the closest student is 4. Seat 4 gives the same distance, and the tie goes to the lower seat.",
        },
        {
          id: "b",
          text: "Seat 3",
          why: "Seat 3 is only 3 away from the student in seat 0, so its closest distance is 3, which is worse than the 4 available at seat 4.",
        },
        {
          id: "c",
          text: "Seat 4",
          why: "The gap between 0 and 9 gives the seat <code>0 + ⌊9 / 2⌋ = 4</code>, 4 away from seat 0 and 5 from seat 9. Seat 5 has the same closest distance of 4, and the lower seat wins.",
        },
        {
          id: "d",
          text: "Seat 6",
          why: "Seat 6 is only 3 away from the student in seat 9, so its closest distance is 3, which is worse than 4.",
        },
      ],
      answer: "c",
    },
    {
      id: "os-primitives",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "recognise",
      pattern: "ordered-set",
      section: "what-an-ordered-set-has-to-answer",
      kind: "multi",
      prompt:
        "<p>An ordered multiset offers <code>rank</code>, <code>countAtMost</code> and <code>at</code>, each in O(log n). Select every query that can be answered from a fixed number of those calls.</p>",
      choices: [
        {
          id: "a",
          text: "The largest key that is at most <code>x</code>",
          why: "It is <code>at(countAtMost(x) - 1)</code>: the position just before the first key above <code>x</code>.",
        },
        {
          id: "b",
          text: "How many keys lie in <code>[lo, hi]</code>",
          why: "It is <code>countAtMost(hi) - rank(lo)</code>: the keys up to <code>hi</code>, minus the keys below <code>lo</code>.",
        },
        {
          id: "c",
          text: "The sum of the keys in <code>[lo, hi]</code>",
          why: "The three operations return counts and positions, not the values' total. A sum needs each node to keep a sum of its subtree, which a treap's <code>refresh</code> could do.",
        },
        {
          id: "d",
          text: "The key closest to <code>x</code>",
          why: "Take the floor and the ceiling of <code>x</code>, each from a rank and a select, and keep the one nearer to <code>x</code>.",
        },
        {
          id: "e",
          text: "The number of distinct keys",
          why: "Rank and count treat every copy as one more key, so duplicates cannot be told apart without extra bookkeeping.",
        },
      ],
      answers: ["a", "b", "d"],
    },
    {
      id: "os-range-module-add",
      chapter: "dsa-ordered-structures",
      level: "advanced",
      skill: "trace",
      pattern: "ordered-set",
      section: "intervals-that-merge-as-they-arrive",
      kind: "order",
      prompt:
        "<p>Put the steps of <code>addRange(left, right)</code> on an interval map in order, from first to last.</p>",
      items: [
        {
          id: "floor",
          text: "Take the interval that starts at or before <code>left</code>, if it reaches <code>left</code>: remove it and start from its start and its end.",
        },
        { id: "ask", text: "Ask for the first interval that starts at or after the current start." },
        {
          id: "absorb",
          text: "If it starts at or before the current end, extend the end to cover it, remove it, and ask again.",
        },
        { id: "store", text: "When no such interval is left, store one interval from the start to the end." },
      ],
      why: "The interval on the left has to be handled first, because it may lower the start that every later question uses. Only then can the loop ask for the first interval at or after that start, and it keeps asking after each removal instead of holding on to a position that the removal invalidated. The merged interval is stored last, once nothing else overlaps it, so no stored interval is ever left overlapping or touching it.",
    },
  ],
  pattern: {
    pattern: "ordered-set",
    chapter: "dsa-ordered-structures",
    signals: [
      "The task asks for the next larger value, the next smaller value or the closest value in a collection that keeps changing.",
      "A rank, a k-th element or a count of keys in a range is needed while values are inserted and removed.",
      "Disjoint intervals are stored, and each update asks which stored interval could overlap a point.",
      "A sliding window or a growing prefix needs its median or a range count after every step.",
    ],
    template:
      "<pre><code>floor(x) = at(countAtMost(x) - 1); ceiling(x) = at(rank(x)); count in [lo, hi] = countAtMost(hi) - rank(lo)</code></pre>",
    time: "O(log n) expected per operation with a treap; about O(√n) with buckets; O(n) per insert with a plain sorted array",
    space: "O(n)",
    styles: ["phone-screen", "onsite"],
  },
};
