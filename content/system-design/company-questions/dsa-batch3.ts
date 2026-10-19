import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "microsoft-connect-level-nodes",
    company: "microsoft",
    title: "Populating Next Right Pointers in Each Node",
    prompt:
      'Take a perfect binary tree given as a level-order array: every parent has two children and every leaf sits at the same depth. Set each node\'s next pointer to the node immediately to its right on the same level, or null for the last node of a level. To make the result checkable, the function returns the values reached by following next pointers level by level, with the string "#" ending each level, so [1,2,3,4,5,6,7] gives [1,"#",2,3,"#",4,5,6,7,"#"]. Aim for constant extra space, not counting the tree itself.',
    level: "SDE-1",
    difficulty: "Medium",
    pattern: "Tree BFS by level",
    patternId: "tree",
    leetcode: { number: 116, slug: "populating-next-right-pointers-in-each-node" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Microsoft SDE-1 interview experience (set 42)",
        url: "https://geeksforgeeks.org/microsoft-interview-experience-set-42-sde1",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-trees", "dsa-tree-problems"],
    answer: {
      ask: `<p>I start by confirming the tree is perfect: every parent has two children and every leaf is at the same depth. That shape is what lets one simple loop work, so if the tree can be ragged I need a different loop. Then I ask how large the tree can get, whether the pointers must be set on the existing nodes, whether extra space beyond a few variables is acceptable, and what to return for an empty tree.</p>
<p>My stated assumptions: the tree is perfect, values may repeat or be negative and are never compared, pointers are set in place, constant extra space is the goal, and an empty tree gives an empty result. A queue-based version is my fallback if the shape turns out to be irregular.</p>`,
      brute: `<p>The obvious solution is a level-order traversal with a queue. At each level I note how many nodes are queued, pop that many, and link each popped node to the one behind it in the queue. The time is O(n), which is already the best possible, but the extra space is O(w) where w is the widest level. In a perfect tree the last level holds about half of all nodes, so the queue grows to roughly n/2 entries. For a tree with hundreds of thousands of nodes that is a real allocation, and the usual follow-up is to do it without the queue. A recursive version that sets <code>left.next = right</code> and <code>right.next = node.next.left</code> avoids the queue, but it costs O(h) call-stack space, which is small for a balanced tree and still not constant.</p>`,
      insight: `<p>The pattern is tree BFS by level, with the previous level doing the job of the queue. Once every node on one level has a correct next pointer, those pointers form a linked list across the level. Walking that list is a free level-order traversal, so no separate queue is needed.</p>
<p>While standing on a node of level d, I wire up its children on level d+1. The two children of one parent link directly: <code>node.left.next = node.right</code>. The right child has to reach into the neighbouring subtree, and the neighbour is already known: <code>node.next</code> is the parent's right sibling, so its left child is the right child's next. If <code>node.next</code> is null, this parent is last on its row and the right child keeps a null next.</p>
<p>The invariant is that when I begin level d, all of level d is already linked left to right. The root level is linked trivially, and processing a level establishes the same fact for the level below. To go down a level I follow <code>left</code> from the leftmost node, which exists on every level of a perfect tree. The loop ends when the leftmost node has no left child, because then the next level does not exist.</p>
<p>Out loud I say: each node on this row wires its own children, the parent's sibling gives the cousin link, and the finished row is the queue for the next one. Every node is visited once and I keep only two pointers, so the extra space is constant.</p>`,
      walkthrough: `<p>Take [1,2,3,4,5,6,7] and read the trace from top to bottom. With <code>leftmost</code> at 1 there is a single node, so it sets 2.next to 3 and has no neighbour. Then <code>leftmost</code> drops to 2, and the row 2, 3 is already linked. Node 2 links 4 to 5, and because 2.next is 3 it also links 5 to 6, the link that crosses between parents. Node 3 links 6 to 7 and has no neighbour. Now <code>leftmost</code> is 4, which has no left child, so the loop stops. The reading pass starts at 1, then 2 and 3, then 4 to 7, writing a marker after each row. The result is the list from the prompt, and each link in the table appears exactly when it is created.</p>`,
      edges: `<ul>
  <li><b>Empty array:</b> the root is null, both loops are skipped, and the result is an empty list.</li>
  <li><b>One node:</b> the root has no left child, so no link is made and the output is the value followed by one marker.</li>
  <li><b>Last node of a row:</b> its right child gets no cross link because <code>node.next</code> is null, so that pointer stays null.</li>
  <li><b>Falsy values:</b> a value of 0 is harmless because every loop tests node objects and never the values.</li>
  <li><b>Not a perfect tree:</b> a missing child would make <code>node.left.next</code> fail. For ragged trees use a dummy head that walks each level and links whichever children exist.</li>
</ul>`,
      followups: [
        "How would you change the loop if the tree is not perfect and children can be missing?",
        "Can you do it recursively, and what does the recursion cost in space?",
        "How would the same next pointers give you the right-side view of the tree?",
        "How would you link each node to its left neighbour instead?",
        "How does the approach change for a tree where each node has many children?",
      ],
      slips: `<ul>
  <li>Linking only the two children of the same parent and forgetting the cross-parent link, so 5 points to null instead of 6.</li>
  <li>Moving down with <code>leftmost = leftmost.next</code> instead of <code>leftmost.left</code>.</li>
  <li>Dereferencing <code>leftmost.left</code> on the leaf row without checking that it exists.</li>
  <li>Writing <code>node.next.left</code> without checking that <code>node.next</code> is set, which fails on the last node of every row.</li>
  <li>Copying each level into a temporary array before linking: it is correct but quietly uses O(n) memory.</li>
  <li>Using a queue and still calling the answer constant space.</li>
</ul>`,
    },
    trace: {
      caption:
        "Linking [1,2,3,4,5,6,7]: the outer pointer leftmost walks down the left edge, the inner pointer node walks along a row.",
      head: ["step", "leftmost", "node", "links set", "linked so far"],
      rows: [
        ["0", "1 (root)", "-", "none yet", "level 1: 1"],
        ["1", "1", "1", "2.next=3", "level 2: 2,3"],
        ["2", "2", "2", "4.next=5, 5.next=6", "level 3: 4,5,6"],
        ["3", "2", "3", "6.next=7", "level 3: 4,5,6,7"],
        ["4", "4", "-", "no left child, stop", "all levels linked"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1) extra", brute: "O(n) time, O(n) queue" },
    solution: {
      entry: "connectLevels",
      code: `function connectLevels(values) {
  const nodes = values.map((val) => ({ val, left: null, right: null, next: null }));
  nodes.forEach((node, index) => {
    node.left = nodes[2 * index + 1] ?? null;
    node.right = nodes[2 * index + 2] ?? null;
  });
  const root = nodes[0] ?? null;
  for (let leftmost = root; leftmost && leftmost.left; leftmost = leftmost.left) {
    for (let node = leftmost; node; node = node.next) {
      node.left.next = node.right;
      if (node.next) node.right.next = node.next.left;
    }
  }
  const rows = [];
  for (let leftmost = root; leftmost; leftmost = leftmost.left) {
    for (let node = leftmost; node; node = node.next) rows.push(node.val);
    rows.push("#");
  }
  return rows;
}`,
      cases: [
        { args: [[1, 2, 3, 4, 5, 6, 7]], expected: [1, "#", 2, 3, "#", 4, 5, 6, 7, "#"] },
        { args: [[]], expected: [] },
        { args: [[9]], expected: [9, "#"] },
        { args: [[1, 2, 3]], expected: [1, "#", 2, 3, "#"] },
        { args: [[5, 5, 5, 5, 5, 5, 5]], expected: [5, "#", 5, 5, "#", 5, 5, 5, 5, "#"] },
        { args: [[0, 0, 0]], expected: [0, "#", 0, 0, "#"] },
        {
          args: [[-1, -2, -3, -4, -5, -6, -7, -8, -9, -10, -11, -12, -13, -14, -15]],
          expected: [-1, "#", -2, -3, "#", -4, -5, -6, -7, "#", -8, -9, -10, -11, -12, -13, -14, -15, "#"],
        },
        {
          args: [
            [-4, 3, -1, 6, 2, -2, 5, 1, -3, 4, 0, -4, 3, -1, 6, 2, -2, 5, 1, -3, 4, 0, -4, 3, -1, 6, 2, -2, 5, 1, -3],
          ],
          expected: [
            -4,
            "#",
            3,
            -1,
            "#",
            6,
            2,
            -2,
            5,
            "#",
            1,
            -3,
            4,
            0,
            -4,
            3,
            -1,
            6,
            "#",
            2,
            -2,
            5,
            1,
            -3,
            4,
            0,
            -4,
            3,
            -1,
            6,
            2,
            -2,
            5,
            1,
            -3,
            "#",
          ],
        },
        {
          args: [
            [
              1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29,
              30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55,
              56, 57, 58, 59, 60, 61, 62, 63,
            ],
          ],
          expected: [
            1,
            "#",
            2,
            3,
            "#",
            4,
            5,
            6,
            7,
            "#",
            8,
            9,
            10,
            11,
            12,
            13,
            14,
            15,
            "#",
            16,
            17,
            18,
            19,
            20,
            21,
            22,
            23,
            24,
            25,
            26,
            27,
            28,
            29,
            30,
            31,
            "#",
            32,
            33,
            34,
            35,
            36,
            37,
            38,
            39,
            40,
            41,
            42,
            43,
            44,
            45,
            46,
            47,
            48,
            49,
            50,
            51,
            52,
            53,
            54,
            55,
            56,
            57,
            58,
            59,
            60,
            61,
            62,
            63,
            "#",
          ],
        },
      ],
    },
  },
  {
    id: "microsoft-character-replacement",
    company: "microsoft",
    title: "Longest Repeating Character Replacement",
    prompt:
      'Given a string s of uppercase letters and an integer k, you may change any character to any other uppercase letter at most k times in total. Return the length of the longest substring that can be made of one repeated letter. For s = "AABABBA" and k = 1 the answer is 4, for example by turning the single B in "AABA" into an A. The string can have up to 100,000 characters, so checking every substring is too slow.',
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Sliding window",
    patternId: "window",
    leetcode: { number: 424, slug: "longest-repeating-character-replacement" },
    evidence: "guide",
    sources: [
      {
        label: "PracHub: Microsoft onsite question on at most K replacements",
        url: "https://prachub.com/coding-questions/longest-single-letter-substring-after-at-most-k-letter-replacements",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-sliding-window"],
    answer: {
      ask: `<p>I ask whether the alphabet is only uppercase letters, because that lets me use an array of 26 counters instead of a map. Then I ask how long the string can be, whether k can be zero or larger than the string, and what to return for an empty string. I also confirm that one change turns a character into any other letter, and that only the length is wanted, not the substring itself.</p>
<p>Assumptions: letters A to Z only, length up to 100,000, k between 0 and the length, an empty string returns 0, and the answer is a number. Because of the length I aim for one linear pass with a fixed amount of extra memory.</p>`,
      brute: `<p>The direct approach tries every substring. For each start and end I count the letters inside, find the most frequent one, and check whether the other letters number at most k, that is, whether length minus the highest count is at most k. Counting from scratch for each pair costs O(n) per substring, and there are O(n²) substrings, so O(n³) in total. Keeping the counts while the end moves right brings it to O(n²), or O(26·n²) if the maximum is rescanned each time. At n = 100,000 that is about five billion pair checks even in the good case, far too slow. The waste is that neighbouring substrings share almost all of their letters, and validity has a monotone shape: shrinking a valid window never breaks it. That is exactly what a sliding window exploits.</p>`,
      insight: `<p>A substring can be turned into one repeated letter with at most k edits exactly when its length minus the count of its most frequent letter is at most k. I keep the most common letter and rewrite everything else. So the task becomes: find the longest window where <code>size - maxCount &lt;= k</code>. This is a variable-size sliding window, and the monotone validity is what makes two pointers legal.</p>
<p>There is a tidy version in which the window never shrinks. For each new right end I count the letter and update <code>maxCount</code>, the highest single-letter count seen in any window so far. If the window is still valid I keep it. If not, I move the left end one step, so the window slides along at the same length instead of shrinking.</p>
<p>Why is a stale <code>maxCount</code> safe? When a letter leaves the window I do not reduce <code>maxCount</code>, so it may be larger than the true maximum of the current window. The window length never exceeds <code>maxCount + k</code>, and <code>maxCount</code> only rises when some letter truly reaches that count inside the current window. So the final length is always one that a real valid window reached, and a longer answer would need a higher real count. A stale value can never make the reported length bigger than the truth.</p>
<p>Out loud: the window is as long as the best answer so far. It grows when a better letter count appears and otherwise slides along. The answer is the final window length, which is <code>s.length - left</code>.</p>`,
      walkthrough: `<p>Run s = AABABBA with k = 1 and follow the trace. The first four letters fit: after A, A, B, A the window is [0,3] with size 4 and A counted three times, so one edit covers the single B. The B at index 4 makes the size 5 while the best count is still 3, so 5 - 3 = 2 exceeds k, and the left end moves to 1, dropping an A. The window keeps its length of 4 and slides. At index 5 another B arrives; its count of 3 ties the old <code>maxCount</code> without beating it, so the window slides again. At index 6 an A cannot lift anything, and the window slides once more. The left end finishes at 3, so the answer is 7 - 3 = 4. The maxCount column never goes past 3, which is why the length stays at 4.</p>`,
      edges: `<ul>
  <li><b>Empty string:</b> the loop never runs and <code>s.length - left</code> is 0.</li>
  <li><b>k = 0:</b> the window slides whenever a different letter arrives, so the answer is the longest run of equal letters.</li>
  <li><b>k at least the length:</b> the window never slides and the answer is the whole length.</li>
  <li><b>All the same letter:</b> maxCount tracks the window size, nothing slides, and the answer is n.</li>
  <li><b>All different letters:</b> maxCount stays at 1, so the answer is the smaller of n and k + 1.</li>
  <li><b>Memory:</b> the counters are a fixed 26-slot array, so memory does not depend on the length of the string.</li>
</ul>`,
      followups: [
        "Can you do it with a while loop that shrinks the window, and why would that be easier to prove?",
        "What changes if the alphabet is all Unicode characters instead of 26 letters?",
        "How would you return the substring itself, not only its length?",
        "How does this relate to the problem of the longest run of ones after flipping at most k zeros?",
        "How would you handle a stream of characters where the string is too large to hold in memory?",
      ],
      slips: `<ul>
  <li>Writing the validity test with the wrong comparison, such as <code>&gt;= k</code> or <code>&lt; k</code>, instead of <code>&gt; k</code>.</li>
  <li>Forgetting to decrement the count of the letter at <code>left</code> before moving the left end.</li>
  <li>Trying to keep <code>maxCount</code> exact by subtracting one when a letter leaves. That is wrong, because a different letter may now hold the maximum.</li>
  <li>Leaving maxCount stale without being able to explain why that is safe, which is the usual follow-up question.</li>
  <li>Scanning all 26 counters on every step to find the maximum. That is still linear, but you should say it is 26n and not n.</li>
  <li>Assuming the replacement letter must already appear in the string.</li>
</ul>`,
    },
    trace: {
      caption:
        'Sliding window on "AABABBA" with k = 1. Counts are shown after adding the new letter, and after dropping one when the window slides.',
      head: ["right", "char", "counts", "maxCount", "window", "size"],
      rows: [
        ["0", "A", "A1", "1", "[0,0]", "1"],
        ["1", "A", "A2", "2", "[0,1]", "2"],
        ["2", "B", "A2 B1", "2", "[0,2]", "3"],
        ["3", "A", "A3 B1", "3", "[0,3]", "4"],
        ["4", "B", "A3 B2, drop A: A2 B2", "3", "[1,4]", "4"],
        ["5", "B", "A2 B3, drop A: A1 B3", "3", "[2,5]", "4"],
        ["6", "A", "A2 B3, drop B: A2 B2", "3", "[3,6]", "4"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1) extra", brute: "O(n²)" },
    solution: {
      entry: "characterReplacement",
      code: `function characterReplacement(s, k) {
  const counts = new Array(26).fill(0);
  const base = "A".charCodeAt(0);
  let left = 0;
  let maxCount = 0;
  for (let right = 0; right < s.length; right++) {
    const added = s.charCodeAt(right) - base;
    counts[added]++;
    maxCount = Math.max(maxCount, counts[added]);
    if (right - left + 1 - maxCount > k) {
      counts[s.charCodeAt(left) - base]--;
      left++;
    }
  }
  return s.length - left;
}`,
      cases: [
        { args: ["AABABBA", 1], expected: 4 },
        { args: ["", 3], expected: 0 },
        { args: ["A", 0], expected: 1 },
        { args: ["ABAB", 2], expected: 4 },
        { args: ["AAAA", 2], expected: 4 },
        { args: ["ABCDE", 1], expected: 2 },
        { args: ["ABCDE", 0], expected: 1 },
        { args: ["MISSISSIPPI", 0], expected: 2 },
        { args: ["ABRACADABRA", 2], expected: 5 },
        { args: ["BAAAB", 2], expected: 5 },
        { args: ["PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSIS", 5], expected: 8 },
        { args: ["PNEUMONOULTRAMICROSCOPICSILICOVOLCANOCONIOSIS", 12], expected: 17 },
        { args: ["INTERNATIONALIZATION", 3], expected: 5 },
      ],
    },
  },
  {
    id: "microsoft-relative-sort-array",
    company: "microsoft",
    title: "Relative Sort Array",
    prompt:
      "You get two integer arrays, arr1 and arr2, where the values of arr2 are distinct and every one of them also appears in arr1. Reorder arr1 so the values named in arr2 come first, following arr2's order with all copies of a value together, and the remaining values follow in ascending order. For arr1 = [5,3,1,3,5,5,8,2] and arr2 = [5,1] the result is [5,5,5,1,2,3,3,8]. Lengths are about a thousand and values are small, but your solution should stay correct for any integers.",
    level: "SDE-1",
    difficulty: "Easy",
    pattern: "Counting with a hash map",
    patternId: "hash",
    leetcode: { number: 1122, slug: "relative-sort-array" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Microsoft SDE-1 interview experience (set 42)",
        url: "https://geeksforgeeks.org/microsoft-interview-experience-set-42-sde1",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-hashing", "dsa-sorting-algorithms"],
    answer: {
      ask: `<p>I ask whether every value of arr2 really appears in arr1 and whether arr2 is distinct. Then I ask about the value range: small non-negative integers allow a counting array, while negatives or huge values need a sort. Can arr1 contain duplicates, which I expect? Should I sort in place or return a new array, and what should happen when arr1 or arr2 is empty?</p>
<p>Assumptions: arr2 is distinct, values are integers of any size, so I do not rely on a small range, I return a new array, an empty arr2 means a plain ascending sort, and leftover values keep all their duplicates in ascending order.</p>`,
      brute: `<p>The quick answer is to sort arr1 with a custom comparator. Look up each value's position in arr2 with <code>indexOf</code>, give values that are not found a position past the end, compare by position, and break ties by the value itself. That is correct, but each comparison does two linear searches, so the cost is O(n log n · m) where m is the length of arr2. Building a position Map first fixes the lookup and gives O(n log n + m), which is fine at a thousand elements. It still sorts everything, including the elements whose order arr2 has already decided, which is more work than needed. Counting avoids comparing those at all: only the leftover values need an actual sort.</p>`,
      insight: `<p>The pattern is counting with a hash map. The order inside the arr2 part is dictated by arr2, so it never needs a comparison. All that matters for each such value is how many copies exist. I count every value of arr1 in a Map from value to count. Then I walk arr2 in its own order: for each value I append it as many times as its count, and I delete it from the Map so it cannot be used twice. Whatever remains in the Map is exactly the set of values that arr2 did not mention. I sort those keys ascending and append each one as many times as its count.</p>
<p>Why it is correct: every element of arr1 is placed exactly once, because each value's count is spent either in the arr2 phase or in the leftover phase, never in both. Deleting the key is what guarantees that. The arr2 phase produces arr2 order with copies together by construction. The leftover phase is ascending because of the sort, and copies stay together because I append them in one go.</p>
<p>The cost is one pass to count, one pass over arr2, and a sort of the distinct leftover keys. If r is the number of distinct leftover values, the time is O(n + m + r log r). When the values are known to be small integers, a counting array replaces both the Map and the sort and the time becomes O(n + m + range).</p>
<p>Out loud: I count everything, spend the counts in arr2 order, then sort only what is left over.</p>`,
      walkthrough: `<p>Use arr1 = [2,3,1,3,2,4,6,7,9,2,19] and arr2 = [2,1,4,3,9,6]. Counting gives three 2s, two 3s, and one each of 1, 4, 6, 7, 9 and 19. The trace shows arr2 being spent in order: three 2s, one 1, one 4, two 3s, one 9 and one 6. After each step the output grows and that value disappears from the Map. What is left at the end is 7 and 19, each with count one. After sorting the keys they are already in order, so the output ends with 7, 19. The final array has eleven entries, the same as arr1, which is a quick sanity check that nothing was lost or duplicated.</p>`,
      edges: `<ul>
  <li><b>Empty arr2:</b> the first phase does nothing and the whole array is sorted ascending in the second phase.</li>
  <li><b>Empty arr1:</b> both phases have nothing to emit, so the result is an empty list.</li>
  <li><b>Everything named in arr2:</b> the Map is empty after the first phase and the second phase adds nothing.</li>
  <li><b>Negative values and multi-digit numbers:</b> the sort uses a numeric comparator, so -7 comes before 5 and 9 comes before 10.</li>
  <li><b>A value in arr2 missing from arr1:</b> this breaks the stated promise, but the lookup falls back to zero copies, so it simply emits nothing.</li>
  <li><b>Duplicates:</b> counts keep every copy and the copies stay together.</li>
</ul>`,
      followups: [
        "How would you do this in O(n + range) when the values are known to lie between 0 and 1000?",
        "What if arr2 could contain values that never appear in arr1?",
        "How would you sort in place without extra arrays, and what would that cost?",
        "What changes if arr1 is too large to fit in memory?",
        "How would you make the sort stable for objects that share a key?",
      ],
      slips: `<ul>
  <li>Calling <code>sort()</code> without a comparator on numbers. It compares as strings, so 10 lands before 9.</li>
  <li>Forgetting to delete a value from the Map after the arr2 phase, which makes it appear again among the leftovers.</li>
  <li>Emitting each leftover value only once instead of all its copies.</li>
  <li>Hard-coding a counting array of size 1001, which fails silently on negative or larger values.</li>
  <li>Using <code>indexOf</code> inside the comparator and not noticing the hidden extra factor of m.</li>
  <li>Sorting arr1 in place and surprising the caller who still holds the original order.</li>
</ul>`,
    },
    trace: {
      caption: "Spending counts in arr2 order for arr1 = [2,3,1,3,2,4,6,7,9,2,19] and arr2 = [2,1,4,3,9,6].",
      head: ["step", "take", "copies", "output so far", "still in map"],
      rows: [
        ["0", "count all", "-", "(empty)", "1,2,3,4,6,7,9,19"],
        ["1", "2", "3", "2,2,2", "1,3,4,6,7,9,19"],
        ["2", "1", "1", "2,2,2,1", "3,4,6,7,9,19"],
        ["3", "4", "1", "2,2,2,1,4", "3,6,7,9,19"],
        ["4", "3", "2", "2,2,2,1,4,3,3", "6,7,9,19"],
        ["5", "9", "1", "2,2,2,1,4,3,3,9", "6,7,19"],
        ["6", "6", "1", "2,2,2,1,4,3,3,9,6", "7,19"],
        ["7", "sorted rest", "1 each", "2,2,2,1,4,3,3,9,6,7,19", "(empty)"],
      ],
    },
    complexity: { time: "O(n + m + r log r)", space: "O(n)", brute: "O(n log n · m)" },
    solution: {
      entry: "relativeSortArray",
      code: `function relativeSortArray(arr1, arr2) {
  const counts = new Map();
  for (const value of arr1) counts.set(value, (counts.get(value) ?? 0) + 1);
  const result = [];
  for (const value of arr2) {
    const copies = counts.get(value) ?? 0;
    for (let i = 0; i < copies; i++) result.push(value);
    counts.delete(value);
  }
  const leftovers = [...counts.keys()].sort((a, b) => a - b);
  for (const value of leftovers) {
    for (let i = 0; i < counts.get(value); i++) result.push(value);
  }
  return result;
}`,
      cases: [
        {
          args: [
            [5, 3, 1, 3, 5, 5, 8, 2],
            [5, 1],
          ],
          expected: [5, 5, 5, 1, 2, 3, 3, 8],
        },
        {
          args: [
            [2, 3, 1, 3, 2, 4, 6, 7, 9, 2, 19],
            [2, 1, 4, 3, 9, 6],
          ],
          expected: [2, 2, 2, 1, 4, 3, 3, 9, 6, 7, 19],
        },
        { args: [[], []], expected: [] },
        { args: [[4], [4]], expected: [4] },
        { args: [[3, 1, 2], []], expected: [1, 2, 3] },
        { args: [[10, 9, 100, 1, 9], [9]], expected: [9, 9, 1, 10, 100] },
        {
          args: [
            [-2, 5, -2, 0, 5, -7],
            [5, -2],
          ],
          expected: [5, 5, -2, -2, -7, 0],
        },
        { args: [[1, 1, 1], [1]], expected: [1, 1, 1] },
        {
          args: [
            [28, 6, 22, 8, 44, 17],
            [22, 28, 8, 6],
          ],
          expected: [22, 28, 8, 6, 17, 44],
        },
        {
          args: [
            [
              5, 19, 10, 1, 15, 6, 20, 11, 2, 16, 7, 21, 12, 3, 17, 8, 22, 13, 4, 18, 9, 0, 14, 5, 19, 10, 1, 15, 6, 20,
              11, 2, 16, 7, 21, 12, 3, 17, 8, 22, 13, 4, 18, 9, 0, 14, 5, 19, 10, 1, 15, 6, 20, 11, 2, 16, 7, 21, 12, 3,
              17, 8, 22, 13, 4, 18, 9, 0, 14, 5, 19, 10, 1, 15, 6, 20, 11, 2, 16, 7,
            ],
            [5, 0, 22, 11, 3, 17],
          ],
          expected: [
            5, 5, 5, 5, 0, 0, 0, 22, 22, 22, 11, 11, 11, 11, 3, 3, 3, 17, 17, 17, 1, 1, 1, 1, 2, 2, 2, 2, 4, 4, 4, 6, 6,
            6, 6, 7, 7, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 10, 10, 12, 12, 12, 13, 13, 13, 14, 14, 14, 15, 15, 15, 15, 16,
            16, 16, 16, 18, 18, 18, 19, 19, 19, 19, 20, 20, 20, 20, 21, 21, 21,
          ],
        },
      ],
    },
  },
  {
    id: "netflix-time-based-key-value",
    company: "netflix",
    title: "Time Based Key-Value Store",
    prompt:
      'Design a store that keeps every value ever written for a key together with the time of the write. set(key, value, timestamp) records a value, and get(key, timestamp) returns the value with the largest timestamp not after the one asked for, or an empty string if there is none. Timestamps for one key only increase, and there can be 200,000 calls, so a read must not scan the whole history. Example: after set("a","x",10) and set("a","y",20), get("a",15) is "x", get("a",5) is "", and get("a",25) is "y".',
    level: "Senior and above",
    difficulty: "Medium",
    pattern: "Hash map and binary search",
    patternId: "design",
    leetcode: { number: 981, slug: "time-based-key-value-store" },
    evidence: "guide",
    sources: [
      {
        label: "PracHub: versioned key-value store question tagged Netflix",
        url: "https://prachub.com/coding-questions/implement-a-versioned-key-value-store",
        kind: "company-list",
        year: 2026,
      },
      {
        label: "Scoutify: Netflix interview question list",
        url: "https://scoutify.com/companies/netflix/interview/",
        kind: "company-list",
      },
    ],
    chapters: ["dsa-binary-search", "dsa-design-problems"],
    answer: {
      ask: `<p>First I confirm the ordering promise: do timestamps for a key always increase, or can writes arrive late? That decides whether plain appending is enough. Can two writes share a timestamp for the same key? What should get return for an unknown key, or for a time before the first write? Do values ever need deleting or expiring? How many calls are there, and are reads more common than writes?</p>
<p>Assumptions: timestamps strictly increase per key, the store lives in memory, nothing is deleted, an unknown key or a time that is too early returns an empty string, and reads are at least as common as writes. A single thread is enough, and I would raise locking as a follow-up.</p>`,
      brute: `<p>The simple design keeps, for each key, a list of (timestamp, value) pairs and answers a read by scanning that list for the latest pair whose timestamp does not exceed the query, walking from the back until one fits. A write is O(1) and a read is O(m), where m is the number of values stored under the key. With 200,000 calls on one hot key, split evenly between writes and reads, a read can walk about 100,000 entries, so the total approaches ten billion comparisons, which is far too slow. Another idea is to store one entry per possible timestamp, which wastes memory and is unusable if times are in the billions. The list is already sorted by timestamp, and that is the hint that binary search applies.</p>`,
      insight: `<p>This is a hash map plus binary search. The map finds the key's history in O(1) on average. Because timestamps for a key only increase, appending keeps the history sorted for free, so no sorting and no balanced tree is needed. A read then asks: in a sorted list of timestamps, which is the last one not greater than t? That is the classic predecessor search, a binary search for the rightmost position that satisfies a monotone condition.</p>
<p>The condition is <code>timestamp[i] &lt;= t</code>. It is true for a prefix of the list and false after it, which is why binary search is valid. I keep an answer variable. When the middle element satisfies the condition, I record its value and search to the right for something later. Otherwise I search to the left. When the range is empty, the recorded value is the answer, and if nothing was recorded the answer is the empty string.</p>
<p>Correctness: the loop keeps two facts. Everything left of <code>low</code> satisfies the condition, everything right of <code>high</code> does not, and the recorded value belongs to the rightmost satisfying index seen so far. When the pointers cross, the recorded value is therefore the last satisfying entry. If two writes ever shared a timestamp, the later one would win, because the search always moves right on a match.</p>
<p>Out loud: a map from key to an append-only sorted list, and each read is a binary search for the last entry at or before the time asked. Writes are O(1) amortised and reads are O(log m).</p>`,
      walkthrough: `<p>Follow the trace: three writes to key a at times 10, 20 and 30 build the sorted list. Read at 5: the first probe looks at index 1, time 20, which is too late, so go left; the probe at index 0, time 10, is also too late; the range empties with nothing recorded, so the result is an empty string. Read at 25: index 1 qualifies, so record y and go right; index 2, time 30, is too late; the answer is y. Read at 30: index 1 qualifies, then index 2 qualifies because the rule is not after, so the answer is z. Read at 99 qualifies at both probes and ends on z, the newest value. No read needed more than two probes.</p>`,
      edges: `<ul>
  <li><b>Unknown key:</b> there is no history, so the read returns an empty string at once.</li>
  <li><b>Time before the first write:</b> every probe fails, nothing is recorded, and the result is an empty string.</li>
  <li><b>Exact timestamp match:</b> the condition uses less-than-or-equal, so the value written at that time is returned.</li>
  <li><b>Time after the last write:</b> the search ends on the final entry, so the newest value is returned.</li>
  <li><b>Same timestamp on different keys:</b> each key has its own list, so they never interfere.</li>
  <li><b>A stored empty string:</b> it looks the same as not found; if that matters, return a distinct marker for absence.</li>
</ul>`,
      followups: [
        "What changes if writes can arrive out of timestamp order?",
        "How would you delete or expire old versions without scanning every key?",
        "How would you add a read that returns the earliest value at or after a time?",
        "How would you make this safe for many threads reading while one thread writes?",
        "What if the history of one key no longer fits in memory?",
      ],
      slips: `<ul>
  <li>Scanning the list linearly and calling it a binary search because the list is sorted.</li>
  <li>Returning the entry at <code>low</code> after the loop, which is one past the answer, or the entry at <code>high</code> without guarding the case where it is -1.</li>
  <li>Using strict less-than so an exact timestamp match is missed.</li>
  <li>Returning <code>undefined</code> or null instead of an empty string when nothing qualifies.</li>
  <li>Sorting the list again on every write, which turns a cheap append into O(m log m).</li>
  <li>Keeping one global list of writes instead of one list per key.</li>
</ul>`,
    },
    trace: {
      caption:
        "Three writes to key a, then four reads. The probes column shows which list index the binary search looked at and the verdict.",
      head: ["step", "call", "list for a", "probes (index)", "returns"],
      rows: [
        ["1", 'set(a,"x",10)', "10:x", "-", "null"],
        ["2", 'set(a,"y",20)', "10:x,20:y", "-", "null"],
        ["3", 'set(a,"z",30)', "10:x,20:y,30:z", "-", "null"],
        ["4", "get(a,5)", "same", "1 late, 0 late", "empty string"],
        ["5", "get(a,25)", "same", "1 ok, 2 late", "y"],
        ["6", "get(a,30)", "same", "1 ok, 2 ok", "z"],
        ["7", "get(a,99)", "same", "1 ok, 2 ok", "z"],
      ],
    },
    complexity: { time: "set O(1), get O(log m)", space: "O(total writes)", brute: "O(m) per get" },
    solution: {
      entry: "run",
      code: `class TimeMap {
  constructor() {
    this.history = new Map();
  }

  set(key, value, timestamp) {
    if (!this.history.has(key)) this.history.set(key, []);
    this.history.get(key).push([timestamp, value]);
  }

  get(key, timestamp) {
    const entries = this.history.get(key);
    if (!entries) return "";
    let low = 0;
    let high = entries.length - 1;
    let answer = "";
    while (low <= high) {
      const mid = (low + high) >> 1;
      if (entries[mid][0] <= timestamp) {
        answer = entries[mid][1];
        low = mid + 1;
      } else {
        high = mid - 1;
      }
    }
    return answer;
  }
}

function run(ops, args) {
  let store = null;
  return ops.map((op, i) => {
    if (op === "TimeMap") {
      store = new TimeMap();
      return null;
    }
    if (op === "set") {
      store.set(...args[i]);
      return null;
    }
    return store.get(...args[i]);
  });
}`,
      cases: [
        {
          args: [
            ["TimeMap", "set", "get", "get", "set", "get", "get"],
            [[], ["a", "x", 10], ["a", 10], ["a", 5], ["a", "y", 20], ["a", 15], ["a", 25]],
          ],
          expected: [null, null, "x", "", null, "x", "y"],
        },
        {
          args: [
            ["TimeMap", "set", "set", "set", "get", "get", "get", "get"],
            [[], ["a", "x", 10], ["a", "y", 20], ["a", "z", 30], ["a", 5], ["a", 25], ["a", 30], ["a", 99]],
          ],
          expected: [null, null, null, null, "", "y", "z", "z"],
        },
        { args: [["TimeMap"], [[]]], expected: [null] },
        {
          args: [
            ["TimeMap", "get"],
            [[], ["ghost", 4]],
          ],
          expected: [null, ""],
        },
        {
          args: [
            ["TimeMap", "set", "set", "get", "get", "get"],
            [[], ["k1", "one", 5], ["k2", "two", 5], ["k1", 5], ["k2", 4], ["k2", 6]],
          ],
          expected: [null, null, null, "one", "", "two"],
        },
        {
          args: [
            ["TimeMap", "set", "get", "get", "get"],
            [[], ["solo", "only", 100], ["solo", 99], ["solo", 100], ["solo", 1000]],
          ],
          expected: [null, null, "", "only", "only"],
        },
        {
          args: [
            ["TimeMap", "set", "set", "get", "get"],
            [[], ["e", "", 1], ["e", "late", 9], ["e", 3], ["e", 9]],
          ],
          expected: [null, null, null, "", "late"],
        },
        {
          args: [
            ["TimeMap", "set", "set", "get", "set", "get"],
            [[], ["a", "first", 1], ["a", "second", 2], ["a", 2], ["a", "third", 3], ["a", 2]],
          ],
          expected: [null, null, null, "second", null, "second"],
        },
        {
          args: [
            [
              "TimeMap",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "set",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
            ],
            [
              [],
              ["even", "val1", 3],
              ["odd", "val2", 6],
              ["even", "val3", 9],
              ["odd", "val4", 12],
              ["even", "val5", 15],
              ["odd", "val6", 18],
              ["even", "val7", 21],
              ["odd", "val8", 24],
              ["even", "val9", 27],
              ["odd", "val10", 30],
              ["even", "val11", 33],
              ["odd", "val12", 36],
              ["even", "val13", 39],
              ["odd", "val14", 42],
              ["even", "val15", 45],
              ["odd", "val16", 48],
              ["even", "val17", 51],
              ["odd", "val18", 54],
              ["even", "val19", 57],
              ["odd", "val20", 60],
              ["even", "val21", 63],
              ["odd", "val22", 66],
              ["even", "val23", 69],
              ["odd", "val24", 72],
              ["even", "val25", 75],
              ["odd", "val26", 78],
              ["even", "val27", 81],
              ["odd", "val28", 84],
              ["even", "val29", 87],
              ["odd", "val30", 90],
              ["even", "val31", 93],
              ["odd", "val32", 96],
              ["even", "val33", 99],
              ["odd", "val34", 102],
              ["even", "val35", 105],
              ["odd", "val36", 108],
              ["even", "val37", 111],
              ["odd", "val38", 114],
              ["even", "val39", 117],
              ["odd", "val40", 120],
              ["odd", 0],
              ["even", 7],
              ["odd", 14],
              ["even", 21],
              ["odd", 28],
              ["even", 35],
              ["odd", 42],
              ["even", 49],
              ["odd", 56],
              ["even", 63],
              ["odd", 70],
              ["even", 77],
              ["odd", 84],
              ["even", 91],
              ["odd", 98],
              ["even", 105],
              ["odd", 112],
              ["even", 119],
              ["odd", 126],
            ],
          ],
          expected: [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            "",
            "val1",
            "val4",
            "val7",
            "val8",
            "val11",
            "val14",
            "val15",
            "val18",
            "val21",
            "val22",
            "val25",
            "val28",
            "val29",
            "val32",
            "val35",
            "val36",
            "val39",
            "val40",
          ],
        },
      ],
    },
  },
  {
    id: "netflix-merge-k-sorted-lists",
    company: "netflix",
    title: "Merge k Sorted Lists",
    prompt:
      "You receive k sorted lists of integers, any of which may be empty, and must combine them into one sorted list. For [[1,4,5],[1,3,4],[2,6]] the result is [1,1,2,3,4,4,5,6]. The total number of values N and the number of lists k can each reach about 10,000, so repeatedly scanning all k list fronts for every output value costs about N times k steps, which is wasteful and grows quickly. In the original problem each list is a chain of linked nodes that the answer should reuse; here the lists arrive as arrays, are turned into chains, and the merged chain is read back as an array.",
    level: "level not stated",
    difficulty: "Hard",
    pattern: "Min-heap merge",
    patternId: "heap",
    leetcode: { number: 23, slug: "merge-k-sorted-lists" },
    evidence: "one",
    sources: [
      {
        label: "DEV: Netflix SDE interview experience 2026",
        url: "https://dev.to/interviewshow-cs/netflix-sde-interview-experience-2026-full-interview-loop-breakdown-core-coding-questions-17mc",
        kind: "candidate-report",
        year: 2026,
      },
    ],
    chapters: ["dsa-heaps-priority-queues", "dsa-linked-lists"],
    answer: {
      ask: `<p>I ask how big k can be and how large the total number of nodes N is. Are the lists linked lists, and may I relink the existing nodes? Can lists be empty, and can k be zero? Are values possibly negative or repeated, and does the order of equal values matter? Is every input list truly sorted ascending? Is O(k) extra space acceptable?</p>
<p>Assumptions: k and N are around ten thousand, nodes can be relinked, empty lists are skipped, duplicates and negatives are allowed, ties may come out in any order because only the values are checked, and O(k) extra space is fine. I would also mention divide and conquer, which merges lists in pairs, as a heap-free alternative with the same time.</p>`,
      brute: `<p>Brute force one: collect all N values, sort them, and rebuild the list. That is O(N log N) and ignores the fact that the inputs are already sorted, so each value pays log N when log k would do, and it does not reuse the nodes. Brute force two: for each output position, look at the front of all k lists and take the smallest. That costs O(k) per output value and O(N·k) overall. With k and N both near ten thousand that is a hundred million comparisons, and it keeps growing quickly with bigger inputs. A third idea, merging the lists one after another into a growing result, is also O(N·k) in the worst case, because the early lists get walked again and again. The heap removes the repeated scan across the fronts.</p>`,
      insight: `<p>The pattern is a min-heap over the current fronts. At any moment the next output value must be the smallest of the k front nodes, because every list is sorted and so nothing behind a front can be smaller than that front. If the k fronts sit in a min-heap, finding the smallest costs O(log k) instead of O(k).</p>
<p>The loop is: push the head of each non-empty list into the heap. Pop the smallest node and append it to the output chain. If the popped node has a successor, push it, because it is the new front of that list. Repeat until the heap is empty. The heap never holds more than one node per list, so its size is at most k.</p>
<p>Why it is correct: the invariant is that the heap holds the front of every list that still has unmerged nodes. The popped node is then smaller than or equal to every unmerged node, since an unmerged node is either a front, which is in the heap, or sits behind a front in a sorted list. Appending it is therefore safe. Each node is pushed once and popped once, so there are N pushes and N pops at O(log k) each.</p>
<p>Out loud: the heap is a tournament among the list fronts. I only ever compare k candidates, and replacing the winner with its successor keeps the tournament full. JavaScript has no built-in heap, so I would say that I am writing a small array-based one before I start coding it.</p>`,
      walkthrough: `<p>Take [[1,4,5],[1,3,4],[2,6]]. The heap starts with the three fronts, 1, 1 and 2. Pop a 1 from the first list and push its successor 4; the output is 1. Pop the other 1 and push 3; the output is 1, 1. Pop 2 and push 6. Pop 3 and push 4. Now two 4s compete, and either may leave first since only the values are compared. Popping the 4 of the first list pushes 5; popping the other 4 pushes nothing. Then 5 leaves with nothing behind it, and 6 leaves last, emptying the heap. The heap column in the trace never holds more than three values, which is k, and the merged column ends with the answer.</p>`,
      edges: `<ul>
  <li><b>No lists:</b> the heap stays empty and the result is an empty list.</li>
  <li><b>All lists empty:</b> empty heads are never pushed, so the loop does not run.</li>
  <li><b>A single list:</b> the heap holds one node at a time and the output equals the input.</li>
  <li><b>Duplicates across lists:</b> the heap compares with strict less-than, so equal values simply stay where they are, ties come out in either order, and none are dropped.</li>
  <li><b>Negative values:</b> only comparisons are used, so sign makes no difference.</li>
  <li><b>Very uneven lists:</b> a long list simply keeps winning pops while short lists run out and leave the heap.</li>
</ul>`,
      followups: [
        "Can you merge the lists with divide and conquer instead, and what is its cost?",
        "What if the lists are too big for memory and arrive as sorted files on disk?",
        "How would you return only the smallest m values of the merged result?",
        "How would you merge k sorted streams that never end?",
        "How would you change the code so equal values keep the order of their lists?",
      ],
      slips: `<ul>
  <li>Pushing a null head for an empty list, so the heap comparison fails on <code>null.val</code>.</li>
  <li>Forgetting to push the popped node's successor, which loses the rest of every list.</li>
  <li>Re-sorting an array of fronts after every pop. That is O(k log k) per value, worse than the heap.</li>
  <li>Returning the dummy head instead of <code>dummy.next</code>.</li>
  <li>Stating the time as O(N log N), when the heap has k entries and the correct bound is O(N log k).</li>
  <li>Writing a heap sift-down that compares only one child, which breaks the heap property.</li>
</ul>`,
    },
    trace: {
      caption:
        "Heap merge of [[1,4,5],[1,3,4],[2,6]]. The heap column shows the values currently held, written in sorted order for readability.",
      head: ["step", "popped", "pushed", "heap now", "merged so far"],
      rows: [
        ["0", "-", "heads 1,1,2", "1,1,2", "(empty)"],
        ["1", "1 (list 0)", "4", "1,2,4", "1"],
        ["2", "1 (list 1)", "3", "2,3,4", "1,1"],
        ["3", "2 (list 2)", "6", "3,4,6", "1,1,2"],
        ["4", "3 (list 1)", "4", "4,4,6", "1,1,2,3"],
        ["5", "4 (list 0)", "5", "4,5,6", "1,1,2,3,4"],
        ["6", "4 (list 1)", "none", "5,6", "1,1,2,3,4,4"],
        ["7", "5 (list 0)", "none", "6", "1,1,2,3,4,4,5"],
        ["8", "6 (list 2)", "none", "(empty)", "1,1,2,3,4,4,5,6"],
      ],
    },
    complexity: { time: "O(N log k)", space: "O(k) heap", brute: "O(N·k)" },
    solution: {
      entry: "mergeKLists",
      code: `function mergeKLists(lists) {
  const heap = [];
  const swap = (a, b) => ([heap[a], heap[b]] = [heap[b], heap[a]]);
  const push = (node) => {
    heap.push(node);
    let i = heap.length - 1;
    while (i > 0 && heap[i].val < heap[(i - 1) >> 1].val) {
      swap(i, (i - 1) >> 1);
      i = (i - 1) >> 1;
    }
  };
  const pop = () => {
    const top = heap[0];
    const last = heap.pop();
    if (heap.length === 0) return top;
    heap[0] = last;
    let i = 0;
    for (;;) {
      let smallest = i;
      for (const child of [2 * i + 1, 2 * i + 2]) {
        if (child < heap.length && heap[child].val < heap[smallest].val) smallest = child;
      }
      if (smallest === i) return top;
      swap(i, smallest);
      i = smallest;
    }
  };
  for (const values of lists) {
    let head = null;
    for (let i = values.length - 1; i >= 0; i--) head = { val: values[i], next: head };
    if (head) push(head);
  }
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (heap.length > 0) {
    tail.next = pop();
    tail = tail.next;
    if (tail.next) push(tail.next);
  }
  const merged = [];
  for (let node = dummy.next; node; node = node.next) merged.push(node.val);
  return merged;
}`,
      cases: [
        {
          args: [
            [
              [1, 4, 5],
              [1, 3, 4],
              [2, 6],
            ],
          ],
          expected: [1, 1, 2, 3, 4, 4, 5, 6],
        },
        { args: [[]], expected: [] },
        { args: [[[]]], expected: [] },
        { args: [[[], [], []]], expected: [] },
        { args: [[[7]]], expected: [7] },
        { args: [[[-3, -1, 0], [-2, 5], [], [4]]], expected: [-3, -2, -1, 0, 4, 5] },
        { args: [[[2, 2, 2], [2, 2], [2]]], expected: [2, 2, 2, 2, 2, 2] },
        { args: [[[1, 2, 3, 4, 5, 6], [10], [7, 8, 9]]], expected: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] },
        {
          args: [
            [
              [0, 20, 20, 20, 40, 40],
              [13, 13, 13, 33, 33, 33, 53],
              [6, 26, 26, 26, 26, 46, 46, 46],
              [19, 19, 19, 39, 39, 39],
              [12, 12, 12, 32, 32, 32, 52],
              [5, 25, 25, 25, 25, 45, 45, 45],
              [18, 18, 18, 38, 38, 38],
              [11, 11, 31, 31, 31, 51, 51],
              [4, 24, 24, 24, 24, 44, 44, 44],
            ],
          ],
          expected: [
            0, 4, 5, 6, 11, 11, 12, 12, 12, 13, 13, 13, 18, 18, 18, 19, 19, 19, 20, 20, 20, 24, 24, 24, 24, 25, 25, 25,
            25, 26, 26, 26, 26, 31, 31, 31, 32, 32, 32, 33, 33, 33, 38, 38, 38, 39, 39, 39, 40, 40, 44, 44, 44, 45, 45,
            45, 46, 46, 46, 51, 51, 52, 53,
          ],
        },
      ],
    },
  },
  {
    id: "netflix-course-schedule-ii",
    company: "netflix",
    title: "Course Schedule II",
    prompt:
      "There are numCourses courses labelled 0 to numCourses - 1, and each pair [a, b] means course b must be finished before course a. Return an order in which all courses can be taken, or an empty list if the pairs contain a cycle and no order exists. For numCourses = 5 and pairs [[1,4],[2,4],[3,1],[3,2],[0,3]] one valid order is [4,1,2,3,0]. Any valid order is correct in an interview, so the reference here is deterministic: it starts with free courses in increasing label order and visits each course's dependants in the order the pairs were given.",
    level: "Senior",
    difficulty: "Medium",
    pattern: "Topological sort",
    patternId: "graph",
    leetcode: { number: 210, slug: "course-schedule-ii" },
    evidence: "guide",
    sources: [
      {
        label: "PracHub: valid task order from prerequisites, Netflix onsite",
        url: "https://prachub.com/coding-questions/return-valid-task-order-from-prerequisites",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-topological-patterns", "dsa-graph-problems"],
    answer: {
      ask: `<p>I ask which way the pair points: in [a, b], is b the prerequisite of a? Can the same pair appear twice, can a course require itself, and can a course have no relationships at all? How large can the numbers of courses and pairs be? If more than one order exists, is any order accepted? And what exactly should I return when no order exists?</p>
<p>Assumptions: [a, b] means b comes first, duplicate pairs and self-pairs can occur, isolated courses still appear in the answer, any valid order is accepted but I produce a deterministic one, a cycle returns an empty list, and sizes reach a few thousand courses and pairs. A linear-time solution that avoids deep recursion is welcome.</p>`,
      brute: `<p>One brute force tries every ordering of the courses and checks every pair against each ordering. That is O(n!) orderings times the pair check, hopeless beyond about ten courses. A smarter brute force repeats a scan: look through all courses for one that is not taken yet and whose prerequisites have all been taken, take it, and start over. Each round scans every course and its prerequisites, and there are n rounds, so the cost is O(V·(V+E)). For a few thousand courses with many pairs that is tens of millions of steps, workable here but wasteful, and it hides the structure of the problem. The waste is rescanning courses that are plainly not ready yet. A better method tracks readiness incrementally, which is what indegree counting does.</p>`,
      insight: `<p>This is topological sorting, done with Kahn's algorithm. Treat each pair as a directed edge from the prerequisite to the course that needs it. A valid order exists exactly when the graph has no cycle, and an order is any arrangement in which every edge points forward.</p>
<p>For each course I track its indegree, the number of prerequisites not yet taken. A course with indegree zero is ready. I put all ready courses into a queue. Then I repeatedly take the front course, add it to the order, and for each course that depends on it I reduce that course's indegree by one; if it reaches zero it has just become ready, so I queue it. Since the order list is also the queue, one array does both jobs, with a read pointer chasing the end.</p>
<p>Why it is correct: a course enters the order only after its indegree has reached zero, which happens only after each of its prerequisites was processed, so every edge points forward in the output. For a cycle, no course on it ever reaches zero, because each one waits on another course of the cycle. Those courses never enter the order, so the order ends up shorter than numCourses and I return an empty list. A duplicate pair counts twice when the indegree counts are built and decrements twice when processed, so it cancels out.</p>
<p>Out loud: peel off courses with nothing left to wait for, and if I get stuck before everything is peeled, there is a cycle. Each course and each pair is handled once, so the time is O(V + E).</p>`,
      walkthrough: `<p>Take five courses with pairs [[1,4],[2,4],[3,1],[3,2],[0,3]]. Counting prerequisites gives indegree values 1, 1, 1, 2, 0 for courses 0 to 4, so only course 4 is ready. Taking 4 frees courses 1 and 2, in the order the pairs were given. Taking 1 lowers course 3 from two waiting prerequisites to one. Taking 2 lowers it to zero, so 3 joins the queue. Taking 3 frees course 0, and taking 0 ends the run. The order has five entries, which equals numCourses, so no cycle was found. The result is [4,1,2,3,0]. The indegree column in the trace shows each count falling to zero exactly when its course becomes ready.</p>`,
      edges: `<ul>
  <li><b>No pairs:</b> every course starts ready, so the answer is the labels in increasing order.</li>
  <li><b>One course:</b> the answer is [0] with no pairs, and an empty list if the course requires itself.</li>
  <li><b>Self-pair [0,0]:</b> the course waits on itself, never reaches zero, and the order comes out short.</li>
  <li><b>Duplicate pairs:</b> the same pair counted twice is decremented twice, so the course still becomes ready.</li>
  <li><b>Cycle in only part of the graph:</b> the other courses are processed, but the order is still short, so the whole answer is an empty list.</li>
  <li><b>Long chain:</b> the queue loop is iterative, so there is no recursion depth to overflow.</li>
</ul>`,
      followups: [
        "How would you solve it with depth-first search, and how do you detect a cycle there?",
        "How would you return the lexicographically smallest valid order?",
        "How would you find the minimum number of semesters if you may take any number of courses at once?",
        "How would you report which courses form the cycle instead of just returning an empty list?",
        "How would the approach change if new pairs arrive one by one over time?",
      ],
      slips: `<ul>
  <li>Reversing the edge direction by reading [a, b] as a before b.</li>
  <li>Returning the partial order when a cycle exists instead of an empty list.</li>
  <li>Forgetting courses that have no pairs at all, which have indegree zero and still belong in the order.</li>
  <li>Using <code>shift()</code> on a large queue in a loop, which is O(n) per call in the worst case.</li>
  <li>Writing a depth-first version with a single visited flag, which reports false cycles or misses real ones.</li>
  <li>Building the adjacency list and the indegree array from different sides of the pair.</li>
</ul>`,
    },
    trace: {
      caption:
        "Kahn's algorithm with numCourses = 5 and pairs [[1,4],[2,4],[3,1],[3,2],[0,3]]. Indegree values are listed for courses 0 to 4.",
      head: ["step", "take", "indegree 0..4", "ready queue", "order so far"],
      rows: [
        ["0", "-", "1 1 1 2 0", "4", "(empty)"],
        ["1", "4", "1 0 0 2 0", "1,2", "4"],
        ["2", "1", "1 0 0 1 0", "2", "4,1"],
        ["3", "2", "1 0 0 0 0", "3", "4,1,2"],
        ["4", "3", "0 0 0 0 0", "0", "4,1,2,3"],
        ["5", "0", "0 0 0 0 0", "(empty)", "4,1,2,3,0"],
      ],
    },
    complexity: { time: "O(V + E)", space: "O(V + E)", brute: "O(V·(V+E))" },
    solution: {
      entry: "findOrder",
      code: `function findOrder(numCourses, prerequisites) {
  const dependents = Array.from({ length: numCourses }, () => []);
  const indegree = new Array(numCourses).fill(0);
  for (const [course, prerequisite] of prerequisites) {
    dependents[prerequisite].push(course);
    indegree[course]++;
  }
  const order = [];
  for (let course = 0; course < numCourses; course++) {
    if (indegree[course] === 0) order.push(course);
  }
  for (let head = 0; head < order.length; head++) {
    for (const next of dependents[order[head]]) {
      indegree[next]--;
      if (indegree[next] === 0) order.push(next);
    }
  }
  return order.length === numCourses ? order : [];
}`,
      cases: [
        {
          args: [
            5,
            [
              [1, 4],
              [2, 4],
              [3, 1],
              [3, 2],
              [0, 3],
            ],
          ],
          expected: [4, 1, 2, 3, 0],
        },
        { args: [1, []], expected: [0] },
        { args: [3, []], expected: [0, 1, 2] },
        {
          args: [
            2,
            [
              [0, 1],
              [1, 0],
            ],
          ],
          expected: [],
        },
        { args: [1, [[0, 0]]], expected: [] },
        {
          args: [
            3,
            [
              [1, 0],
              [1, 0],
              [2, 1],
            ],
          ],
          expected: [0, 1, 2],
        },
        {
          args: [
            4,
            [
              [1, 0],
              [2, 1],
              [1, 2],
            ],
          ],
          expected: [],
        },
        {
          args: [
            6,
            [
              [5, 0],
              [4, 0],
              [5, 2],
              [4, 1],
              [3, 2],
              [2, 3],
            ],
          ],
          expected: [],
        },
        {
          args: [
            6,
            [
              [5, 0],
              [4, 0],
              [5, 2],
              [4, 1],
              [3, 2],
            ],
          ],
          expected: [0, 1, 2, 4, 5, 3],
        },
        {
          args: [
            40,
            [
              [20, 3],
              [14, 3],
              [2, 3],
              [31, 20],
              [14, 37],
              [8, 37],
              [36, 37],
              [31, 14],
              [25, 14],
              [13, 14],
              [2, 31],
              [25, 8],
              [19, 8],
              [7, 8],
              [2, 25],
              [36, 25],
              [24, 25],
              [13, 2],
              [36, 19],
              [30, 19],
              [18, 19],
              [13, 36],
              [7, 36],
              [35, 36],
              [24, 13],
              [7, 30],
              [1, 30],
              [29, 30],
              [24, 7],
              [18, 7],
              [6, 7],
              [35, 24],
              [18, 1],
              [12, 1],
              [0, 1],
              [35, 18],
              [29, 18],
              [17, 18],
              [6, 35],
              [29, 12],
              [23, 12],
              [11, 12],
              [6, 29],
              [0, 29],
              [28, 29],
              [17, 6],
              [0, 23],
              [34, 23],
              [22, 23],
              [17, 0],
              [11, 0],
              [39, 0],
              [28, 17],
              [11, 34],
              [5, 34],
              [33, 34],
              [28, 11],
              [22, 11],
              [10, 11],
              [39, 28],
              [22, 5],
              [16, 5],
              [4, 5],
              [39, 22],
              [33, 22],
              [21, 22],
              [10, 39],
              [33, 16],
              [27, 16],
              [15, 16],
              [10, 33],
              [4, 33],
              [32, 33],
              [21, 10],
              [4, 27],
              [38, 27],
              [26, 27],
              [21, 4],
              [15, 4],
              [32, 21],
              [15, 38],
              [9, 38],
              [32, 15],
              [26, 15],
              [26, 9],
            ],
          ],
          expected: [
            3, 37, 20, 14, 8, 31, 25, 19, 2, 36, 30, 13, 7, 1, 24, 18, 12, 35, 29, 23, 6, 0, 34, 17, 11, 5, 28, 22, 16,
            39, 33, 27, 10, 4, 38, 21, 15, 9, 32, 26,
          ],
        },
      ],
    },
  },
];
