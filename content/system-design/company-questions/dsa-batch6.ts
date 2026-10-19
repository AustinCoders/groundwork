import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "razorpay-rotting-oranges",
    company: "razorpay",
    title: "Rotting Oranges",
    prompt:
      "A grid holds 0 for an empty cell, 1 for a fresh orange and 2 for a rotten one, and every minute each fresh orange that touches a rotten one (up, down, left or right) becomes rotten. Return the number of minutes until no fresh orange is left, or -1 if some orange can never rot. For [[2,1,1],[1,1,0],[0,1,1]] the answer is 4. The grid can be as large as 1,000 by 1,000.",
    level: "Intern",
    difficulty: "Medium",
    pattern: "Multi-source grid BFS",
    patternId: "graph",
    leetcode: { number: 994, slug: "rotting-oranges" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Razorpay intern interview experience (rotting oranges)",
        url: "https://www.geeksforgeeks.org/?p=674213",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-grid-bfs"],
    answer: {
      ask: `<p>I would ask: are all rows the same length? Does rot spread only in the four straight directions, or diagonally too? Does every rotten orange spread at the same moment each minute? What should I return when there is no fresh orange to begin with, or no rotten one? Can the grid be empty? How big can it get?</p>
<p>I would assume a rectangular grid, four-direction spread, all spreading at once each minute, an answer of 0 when nothing is fresh, and -1 when a fresh orange can never be reached. I would also keep the caller's grid unchanged.</p>`,
      brute: `<p>Simulate it literally. Each minute, scan the whole grid, find every fresh orange next to a rotten one, mark them all in a copy, then swap the copy in. Stop when a pass changes nothing, then check whether any fresh orange remains.</p>
<p>One pass costs O(R×C). The number of minutes can be as large as the number of cells, because rot can crawl along a winding corridor of fresh oranges one cell per minute. That gives O((R×C)²) in the worst case. On a 1,000 by 1,000 grid that is a million cells times hundreds of thousands of minutes, far too slow, and almost all of the scanning re-checks cells that are nowhere near the rot front.</p>`,
      insight: `<p>The pattern is <b>multi-source BFS on a grid</b>. Rot spreads outward from every rotten orange at once, one step per minute, which is exactly how breadth-first search expands level by level. The only twist is that the search starts from many cells instead of one: put all the initially rotten oranges in the first level.</p>
<p>Why it is correct: BFS visits cells in order of their distance from the nearest source. A fresh orange first reached on level k cannot have been reachable on any earlier level, because every cell of level k-1 and earlier was fully expanded first. So the level number at which an orange rots is exactly the minute it rots, and the answer is the level of the last orange to rot. If the queue runs dry while some fresh orange remains, nothing can reach it (walled off by empty cells), so the answer is -1.</p>
<p>Two details matter. First, mark an orange rotten when you add it to the next level, not when you take it out, so no cell is queued twice. Second, count fresh oranges up front and stop as soon as that count hits zero, otherwise the final level, which spreads to nothing, adds one minute too many. I would say it aloud as: all rotten cells are minute zero, and each round of the loop is one minute.</p>`,
      walkthrough: `<p>Use [[2,1,1],[1,1,0],[0,1,1]]. At the start the only rotten cell is (0,0) and there are 6 fresh oranges. The trace table shows each round.</p>
<p>Minute 1: (0,0) rots its two neighbors (0,1) and (1,0). Minute 2: (0,1) rots (0,2) and (1,1); (1,0) also touches (1,1), but it is already rotten, so it is not counted twice. Minute 3: (1,1) rots (2,1), while (0,2) has no fresh neighbor because (1,2) is empty. Minute 4: (2,1) rots (2,2). Fresh count reaches 0 and the loop stops with 4 minutes. Notice that the table counts rounds, not oranges: six oranges rot, but only four minutes pass.</p>`,
      edges: `<p>No fresh orange at all: the loop condition is false straight away and the answer is 0, even if there are no rotten ones either. An empty grid has zero rows, so it also returns 0.</p>
<p>Fresh oranges but no rotten one: the frontier starts empty, the loop never runs, fresh stays above zero and the result is -1.</p>
<p>A fresh orange fenced off by empty cells (or by the grid edge): the frontier empties while fresh is still above zero, so the loop ends and the code returns -1.</p>
<p>A single cell, or a grid with only rotten and empty cells, returns 0. The code copies the grid first, so the caller's input is never changed. Bounds are checked before every read, so edge and corner cells need no special case.</p>`,
      followups: [
        "How would you change the code if rot could also spread diagonally, or if some cells were walls that block it?",
        "What if each fresh orange needed its own number of minutes before it rots once touched, which algorithm replaces BFS?",
        "How would you return the grid as it looks after exactly k minutes?",
        "Why would a depth-first search give wrong minutes here even though it reaches every reachable orange?",
        "How would you handle new rotten oranges appearing at given times while the rot is already spreading?",
      ],
      slips: `<p>One easy slip is counting minutes per orange taken from the queue instead of per level, which inflates the answer. The second is the off-by-one at the end: incrementing the minute counter after the last level that rotted nothing, so every answer is one too large. Stopping when fresh reaches zero avoids it.</p>
<p>Others: marking a cell rotten only when it is dequeued, so the same cell is queued several times; forgetting the -1 case by returning the last level even though some orange was never reached; using DFS, which finds some path but not the shortest one; and using <code>queue.shift()</code> on a huge array, which can be slow when the queue is large. Processing level arrays, as the code does, sidesteps it.</p>`,
    },
    trace: {
      caption: "Rounds on [[2,1,1],[1,1,0],[0,1,1]]: 6 fresh oranges at the start, one minute per BFS level.",
      head: ["Minute", "Cells that rot", "Fresh left", "Minutes counted"],
      rows: [
        ["0 (start)", "(0,0) already rotten", "6", "0"],
        ["1", "(0,1) (1,0)", "4", "1"],
        ["2", "(0,2) (1,1)", "2", "2"],
        ["3", "(2,1)", "1", "3"],
        ["4", "(2,2)", "0", "4"],
      ],
    },
    complexity: { time: "O(R×C)", space: "O(R×C)", brute: "O((R×C)²)" },
    solution: {
      entry: "orangesRotting",
      code: `function orangesRotting(grid) {
  const rows = grid.length;
  const cols = rows === 0 ? 0 : grid[0].length;
  const cells = grid.map((row) => row.slice());
  const directions = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let frontier = [];
  let fresh = 0;
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (cells[r][c] === 2) frontier.push([r, c]);
      else if (cells[r][c] === 1) fresh++;
    }
  }
  let minutes = 0;
  while (frontier.length > 0 && fresh > 0) {
    const next = [];
    for (const [r, c] of frontier) {
      for (const [dr, dc] of directions) {
        const nr = r + dr;
        const nc = c + dc;
        if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
        if (cells[nr][nc] !== 1) continue;
        cells[nr][nc] = 2;
        fresh--;
        next.push([nr, nc]);
      }
    }
    frontier = next;
    minutes++;
  }
  return fresh === 0 ? minutes : -1;
}`,
      cases: [
        {
          args: [
            [
              [2, 1, 1],
              [1, 1, 0],
              [0, 1, 1],
            ],
          ],
          expected: 4,
        },
        {
          args: [
            [
              [2, 1, 1],
              [0, 1, 1],
              [1, 0, 1],
            ],
          ],
          expected: -1,
        },
        { args: [[[0, 2]]], expected: 0 },
        { args: [[[0]]], expected: 0 },
        { args: [[[1]]], expected: -1 },
        { args: [[[2]]], expected: 0 },
        { args: [[[]]], expected: 0 },
        { args: [[]], expected: 0 },
        {
          args: [
            [
              [2, 2],
              [2, 2],
            ],
          ],
          expected: 0,
        },
        { args: [[[1, 2, 1, 1, 2, 1, 1]]], expected: 2 },
        { args: [[[2, 1, 1, 1, 1, 1, 1, 1, 1]]], expected: 8 },
        {
          args: [
            [
              [1, 1, 1],
              [1, 0, 1],
              [1, 1, 2],
            ],
          ],
          expected: 4,
        },
        {
          args: [
            [
              [2, 0, 1],
              [0, 0, 0],
              [1, 0, 1],
            ],
          ],
          expected: -1,
        },
        {
          args: [
            [
              [0, 0, 1, 1, 2, 0, 1, 1, 1, 1],
              [0, 1, 2, 0, 1, 1, 1, 2, 1, 2],
              [2, 1, 1, 1, 1, 1, 1, 0, 0, 2],
              [1, 0, 1, 1, 1, 2, 0, 1, 1, 1],
              [2, 1, 1, 1, 1, 0, 2, 1, 1, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 2],
              [1, 2, 1, 0, 1, 1, 1, 1, 1, 0],
              [0, 1, 2, 1, 1, 1, 1, 2, 2, 1],
              [2, 1, 1, 2, 1, 2, 1, 1, 2, 0],
              [1, 1, 0, 1, 2, 0, 1, 1, 1, 1],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [0, 1, 2, 1, 1, 1, 0, 1, 2, 1, 1, 2],
              [1, 1, 1, 2, 2, 0, 1, 0, 1, 0, 1, 2],
              [2, 1, 1, 2, 2, 0, 1, 1, 1, 1, 2, 1],
              [1, 1, 1, 1, 1, 1, 2, 1, 0, 1, 1, 1],
              [2, 0, 0, 1, 1, 1, 1, 1, 1, 1, 1, 0],
              [1, 0, 1, 0, 0, 2, 1, 2, 0, 1, 1, 0],
              [1, 0, 1, 1, 0, 1, 1, 1, 1, 1, 0, 0],
              [1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1],
            ],
          ],
          expected: -1,
        },
        {
          args: [
            [
              [1, 1, 1, 1, 1],
              [0, 0, 0, 0, 1],
              [1, 1, 1, 0, 1],
              [1, 0, 0, 0, 1],
              [1, 1, 1, 1, 2],
            ],
          ],
          expected: 8,
        },
      ],
    },
  },
  {
    id: "razorpay-make-sum-divisible",
    company: "razorpay",
    title: "Make Sum Divisible by P",
    prompt:
      "Given an array of positive integers nums and an integer p, remove the shortest contiguous subarray (it may be empty, but it cannot be the whole array) so that the sum of the remaining elements is divisible by p. Return the length of the removed subarray, or -1 if no valid removal exists. For nums = [3,1,4,2] and p = 6 the answer is 1, by removing [4]. The array can hold 100,000 numbers, each up to 1,000,000,000.",
    level: "Intern",
    difficulty: "Medium",
    pattern: "Prefix sums with remainders",
    patternId: "hash",
    leetcode: { number: 1590, slug: "make-sum-divisible-by-p" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Razorpay intern interview experience (divisible sum)",
        url: "https://www.geeksforgeeks.org/?p=596176",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-prefix-sums", "dsa-hashing"],
    answer: {
      ask: `<p>I would ask: are the numbers all positive, so no negative remainders sneak in? Can p be 1? Is removing nothing allowed when the sum already works? Is removing the entire array allowed (the prompt says no)? Do I return the length or the indices? How large can the sum get?</p>
<p>I would assume positive numbers, p of at least 1, an answer of 0 when the whole sum is already divisible, -1 when only the whole array would work, and that I return just the length. Since the sum can reach about 10^14, I will work with remainders so numbers never grow.</p>`,
      brute: `<p>Try every subarray as the one to remove. Build a prefix-sum array, then for each pair of ends (i, j) compute the remaining sum as the total minus the part between them, and test whether it is divisible by p. Keep the shortest valid length.</p>
<p>With prefix sums each test is O(1), but there are about n² / 2 pairs. For n = 100,000 that is roughly five billion checks, too slow for a normal time limit. Without prefix sums, re-adding each remaining part would be O(n³), which is hopeless. The waste is that for a fixed right end we scan every left end, even though only left ends with one specific remainder can possibly work.</p>`,
      insight: `<p>First reduce the problem. Let total be the sum of all numbers mod p. If total is 0, remove nothing. Otherwise the remaining sum is divisible by p exactly when the removed part has a sum with remainder equal to total. So I am looking for the shortest subarray whose sum mod p equals total.</p>
<p>That is the <b>prefix sum plus hash map</b> pattern, only in modular arithmetic. The sum of the subarray after index i up to index j is prefix[j] - prefix[i]. I need that to be congruent to total, which means prefix[i] mod p must equal (prefix[j] - total) mod p. So I scan j from left to right, keep a map from each prefix remainder to the latest index where it appeared, and for each j look up the one remainder I need. If it is in the map, the subarray between has the right sum.</p>
<p>Why the latest index: for a fixed j, every earlier index with that remainder gives a valid subarray, and the later the start the shorter the subarray, so the most recent one is optimal. Overwriting the map entry as I go keeps exactly that. The empty prefix has remainder 0 at index -1, so I seed the map with it; this lets a removal start at index 0.</p>
<p>The one JavaScript trap is that <code>%</code> can return a negative number, so I compute (prefix - total + p) % p. Map lookups are O(1) on average, which makes the scan linear on average. Explained aloud: it is the subarray-sum-equals-k trick, with k replaced by a remainder.</p>`,
      walkthrough: `<p>Take nums = [3,1,4,2] and p = 6. The total is 10, and 10 mod 6 = 4, so I need the shortest subarray whose sum has remainder 4. The map starts with remainder 0 at index -1.</p>
<p>Index 0: the prefix remainder is 3, I need (3 - 4 + 6) mod 6 = 5, which is not in the map, so no candidate; store 3 at index 0. Index 1: prefix 4, need 0, found at -1, so length 2 (that is [3,1], sum 4); store 4 at index 1. Index 2: prefix 2, need 4, found at index 1, so length 1 (that is [4]); best becomes 1. Index 3: prefix 4, need 0, found at -1, length 4. The best stays 1, and the table shows each step.</p>`,
      edges: `<p>Total already divisible (including p equal to 1, and an empty array): the early return gives 0. A single element that is not divisible, such as [5] with p = 3: the only match is the whole array, so the best length stays equal to n and the code returns -1.</p>
<p>Matching the whole array is the one thing the problem forbids. The scan can find it only when the prefix at the end matches the empty prefix, giving length n, and the final check turns any length n into -1. A removal that starts at index 0 works because of the seeded entry at -1; a removal at the end works because the scan covers the last index.</p>
<p>Duplicates in the array are harmless: the map keeps the latest index for each remainder. Large values: the running prefix is reduced mod p at every step, so it stays below p and never loses precision.</p>`,
      followups: [
        "How would the code change if nums could contain negative numbers?",
        "How do you return the start and end indices of the removed subarray instead of its length?",
        "What changes if you want the longest subarray whose sum is divisible by p?",
        "Why does a sliding window not work for this problem?",
        "How would you count the subarrays whose sum is divisible by p, rather than find the shortest?",
      ],
      slips: `<p>Forgetting that JavaScript's <code>%</code> keeps the sign of the left operand, so (prefix - total) % p can be negative and never match a key. Add p before taking the remainder.</p>
<p>Other slips: skipping the seed for the empty prefix, which loses every removal that starts at index 0; storing the first index of a remainder instead of the latest, which finds longer removals; returning n instead of -1 when the only match is the whole array; and forgetting the early exit for a total of 0, which makes the lookup need remainder equal to the prefix itself and can return a wrong positive length. Summing without reducing mod p is fine in JavaScript up to about 10^15 but breaks in languages with 32-bit integers.</p>`,
    },
    trace: {
      caption: "nums = [3,1,4,2], p = 6, so the total remainder is 4 and the removed part must have remainder 4.",
      head: ["i", "nums[i]", "prefix % 6", "Need (index)", "Map after", "Best"],
      rows: [
        ["start", "-", "0", "-", "0:-1", "none"],
        ["0", "3", "3", "5 (miss)", "0:-1 3:0", "none"],
        ["1", "1", "4", "0 (at -1)", "0:-1 3:0 4:1", "2"],
        ["2", "4", "2", "4 (at 1)", "0:-1 3:0 4:1 2:2", "1"],
        ["3", "2", "4", "0 (at -1)", "0:-1 3:0 4:3 2:2", "1"],
      ],
    },
    complexity: { time: "O(n) on average", space: "O(min(n, p))", brute: "O(n²)" },
    solution: {
      entry: "minSubarray",
      code: `function minSubarray(nums, p) {
  let total = 0;
  for (const value of nums) total = (total + value) % p;
  if (total === 0) return 0;
  const lastIndexOfRemainder = new Map([[0, -1]]);
  let prefix = 0;
  let shortest = nums.length;
  for (let i = 0; i < nums.length; i++) {
    prefix = (prefix + nums[i]) % p;
    const needed = (prefix - total + p) % p;
    if (lastIndexOfRemainder.has(needed)) {
      shortest = Math.min(shortest, i - lastIndexOfRemainder.get(needed));
    }
    lastIndexOfRemainder.set(prefix, i);
  }
  return shortest === nums.length ? -1 : shortest;
}`,
      cases: [
        { args: [[3, 1, 4, 2], 6], expected: 1 },
        { args: [[6, 3, 5, 2], 9], expected: 2 },
        { args: [[1, 2, 3], 3], expected: 0 },
        { args: [[1, 2, 3], 7], expected: -1 },
        { args: [[], 5], expected: 0 },
        { args: [[5], 3], expected: -1 },
        { args: [[7], 7], expected: 0 },
        { args: [[4, 4, 4], 1], expected: 0 },
        { args: [[2, 2, 2, 2, 2], 4], expected: 1 },
        { args: [[1000000000, 999999999, 1000000000, 7], 1000000000], expected: 3 },
        {
          args: [
            [
              800108756, 261884195, 25415392, 790485324, 819786709, 706373940, 317365730, 427710510, 71715963,
              248339526, 584624264, 937812772, 39020536, 893368770, 887015220, 244381101, 687219619, 470921101,
              180240666, 329525759, 100030795, 993519454, 204125135, 624808456, 530212329, 911449980, 512461818,
              742992833, 381069513, 966094561, 785085321, 378740271, 884250077, 595021149, 812795976, 456375996,
              489453662, 91956901, 795760723, 852850511, 231680353, 974769145, 846015553, 274021331, 591643279,
              264579144, 834694509, 112380036, 614970273, 629133680, 974610252, 364349632, 305819593, 593559450,
              778811192, 935277226, 560534709, 271625269, 285740181, 910247020,
            ],
            999999937,
          ],
          expected: -1,
        },
        {
          args: [
            [
              8, 17, 35, 31, 29, 4, 40, 29, 30, 3, 40, 30, 8, 15, 32, 39, 29, 15, 25, 45, 23, 13, 24, 37, 35, 14, 25,
              15, 21, 26, 42, 25, 46, 11, 47, 26, 28, 30, 24, 24,
            ],
            13,
          ],
          expected: 0,
        },
        { args: [[1, 1, 1, 1, 1, 1, 9], 5], expected: 0 },
      ],
    },
  },
  {
    id: "razorpay-find-duplicate",
    company: "razorpay",
    title: "Find the Duplicate Number",
    prompt:
      "An array nums holds n + 1 integers, each between 1 and n inclusive, and exactly one value is repeated (possibly many times). Return it without modifying the array and using only constant extra space. For [1,3,4,2,2] the answer is 2. The array can have up to 100,000 elements.",
    level: "Intern",
    difficulty: "Medium",
    pattern: "Cycle detection",
    patternId: "pointers",
    leetcode: { number: 287, slug: "find-the-duplicate-number" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: Razorpay intern interview experience (hiring manager round)",
        url: "https://www.geeksforgeeks.org/?p=674731",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-two-pointers", "dsa-linked-lists"],
    answer: {
      ask: `<p>I would ask: is the length always n + 1 with every value in 1 to n? Is there exactly one repeated value, and may it appear three or more times? May I modify or sort the array? Is extra memory forbidden, or just discouraged? Do I need linear time?</p>
<p>I would assume the guarantees hold, so I never validate the input; the repeated value can appear any number of times; the array is read-only; and the target is O(1) extra space with O(n) time. If extra memory were allowed, a set would be the obvious answer, so the interesting problem is the constrained one.</p>`,
      brute: `<p>There are three obvious routes. Compare every pair: O(n²) time, O(1) space, which for 100,000 elements is about five billion comparisons. Sort a copy and look for equal neighbors: O(n log n) time (with a numeric comparator in JavaScript) but O(n) extra space, and sorting the original breaks the read-only rule. Put values into a hash set until one repeats: O(n) time but O(n) space.</p>
<p>The only brute force that respects the space limit is the pair comparison, and it is too slow. The set solution is fast but breaks the memory rule, so none of the three satisfies both limits at once.</p>`,
      insight: `<p>The pattern is <b>cycle detection on an implicit linked list</b> (Floyd's tortoise and hare). Treat the array as a function: from index i, jump to index nums[i]. Because every value is between 1 and n, no value points back to index 0, so index 0 is a start node that nothing leads to. Every node has exactly one outgoing edge, so a walk from 0 can never stop; with only n + 1 nodes it must eventually revisit one and run around a cycle.</p>
<p>Why the cycle entrance is the duplicate: the node where the walk first enters the cycle is reached by two different edges, one from the path before the cycle and one from inside it. Two edges into the same node means two indices hold the same value, and that value is the node number. Only the repeated value has two or more incoming edges, so the entrance is the answer.</p>
<p>Finding it takes two phases. In phase one a slow pointer moves one step and a fast pointer two steps until they meet inside the cycle. Say the entrance is a steps from the start and they meet b steps past it, with cycle length c. Slow has walked a + b, fast 2(a + b), and the extra a + b is a whole number of laps, so a + b = k · c. That means a steps from the meeting point also lands on the entrance. In phase two, restart one pointer at index 0 and move both one step at a time; they meet at the entrance.</p>
<p>Out loud: pretend the array is a linked list where i points to nums[i], and find where the cycle begins.</p>`,
      walkthrough: `<p>With nums = [1,3,4,2,2] the walk from index 0 is 0, 1, 3, 2, 4, 2, 4, and so on, so the cycle is 2 and 4 and its entrance is 2. The trace table follows both phases.</p>
<p>Phase one: slow and fast both start at 0. After one round slow is 1 and fast is 3; after two, slow is 3 and fast is 4; after three, slow is 2 and fast is 4; after four, both are 4, so they meet inside the cycle. Phase two: slow goes back to 0 while fast stays at 4. One step each gives 1 and 2, another gives 3 and 4, a third gives 2 and 2. They meet at 2, the duplicate.</p>`,
      edges: `<p>The smallest valid input is [1,1]: the walk goes 0, 1, 1, so the cycle is a self-loop on index 1 and the answer is 1. A value repeated many times, such as [2,2,2,2,2], also works: index 0 leads to 2 and 2 points to itself.</p>
<p>The phase-one loop must run at least once, because both pointers start at the same place. That is why it is a do-while loop: a plain while loop would see slow equal to fast and skip phase one entirely.</p>
<p>The array is only read, never written. Because values start at 1, index 0 is never on the cycle, which is what guarantees the walk has a tail and the entrance is a real duplicate. If the input broke the guarantees, a value above n would send a pointer outside the array and a 0 would send the walk back to index 0, which the problem rules out.</p>`,
      followups: [
        "If you were allowed to modify the array, how would cyclic sort or negation solve it in O(n) time?",
        "How would a binary search over the value range solve it, and what does that cost in time?",
        "Why must the walk start at index 0, and what would break if values could be 0?",
        "Can you prove that the second phase finds the cycle entrance?",
        "How would you also report the length of the cycle?",
      ],
      slips: `<p>The classic slip is stopping after phase one and returning the meeting point. The meeting point is somewhere inside the cycle, not necessarily the duplicate; phase two is what finds the entrance.</p>
<p>Others: using a plain while loop with both pointers starting at 0, so phase one never runs; starting the two pointers at different places in the two phases; treating values as zero-based indices; assuming the duplicate appears exactly twice and building a counting approach around that; and sorting or negating entries to mark visited ones, which breaks the do-not-modify rule. Mixing up a value and the index it points to is also frequent, so say out loud that the next position is nums[position].</p>`,
    },
    trace: {
      caption: "nums = [1,3,4,2,2]: phase one finds a meeting point inside the cycle, phase two walks to its entrance.",
      head: ["Phase", "Step", "slow", "fast", "Note"],
      rows: [
        ["1", "0", "0", "0", "both at index 0"],
        ["1", "1", "1", "3", "slow +1, fast +2"],
        ["1", "2", "3", "4", "fast is ahead"],
        ["1", "3", "2", "4", "fast circles the loop"],
        ["1", "4", "4", "4", "met inside the cycle"],
        ["2", "0", "0", "4", "slow back to index 0"],
        ["2", "1", "1", "2", "both move one step"],
        ["2", "2", "3", "4", "still apart"],
        ["2", "3", "2", "2", "met: duplicate is 2"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1) extra", brute: "O(n²)" },
    solution: {
      entry: "findDuplicate",
      code: `function findDuplicate(nums) {
  let slow = 0;
  let fast = 0;
  do {
    slow = nums[slow];
    fast = nums[nums[fast]];
  } while (slow !== fast);
  slow = 0;
  while (slow !== fast) {
    slow = nums[slow];
    fast = nums[fast];
  }
  return slow;
}`,
      cases: [
        { args: [[1, 3, 4, 2, 2]], expected: 2 },
        { args: [[3, 1, 3, 4, 2]], expected: 3 },
        { args: [[3, 3, 3, 3, 3]], expected: 3 },
        { args: [[1, 1]], expected: 1 },
        { args: [[2, 2, 2, 2, 2]], expected: 2 },
        { args: [[1, 4, 4, 2, 4]], expected: 4 },
        { args: [[1, 1, 2]], expected: 1 },
        { args: [[2, 1, 2]], expected: 2 },
        { args: [[4, 3, 1, 4, 2]], expected: 4 },
        {
          args: [
            [
              31, 6, 20, 17, 20, 16, 20, 23, 20, 12, 56, 20, 20, 20, 20, 20, 59, 20, 1, 20, 21, 9, 40, 20, 35, 55, 5,
              45, 43, 57, 42, 50, 20, 49, 4, 14, 20, 32, 7, 20, 10, 20, 54, 20, 20, 11, 20, 20, 20, 20, 20, 20, 18, 22,
              20, 20, 34, 20, 20, 47, 20,
            ],
          ],
          expected: 20,
        },
        {
          args: [[12, 21, 21, 8, 11, 22, 20, 5, 7, 13, 16, 4, 21, 21, 21, 17, 21, 2, 15, 25, 19, 23, 21, 1, 3, 21]],
          expected: 21,
        },
        {
          args: [
            [
              90, 90, 90, 90, 90, 90, 90, 90, 30, 4, 90, 90, 83, 90, 90, 90, 49, 90, 24, 90, 90, 90, 97, 90, 90, 40, 90,
              90, 90, 18, 90, 19, 90, 90, 60, 90, 90, 90, 90, 90, 90, 90, 90, 90, 79, 90, 90, 38, 90, 25, 69, 90, 90,
              90, 90, 66, 23, 90, 90, 90, 17, 42, 90, 90, 90, 90, 90, 90, 90, 90, 90, 90, 2, 90, 90, 54, 90, 72, 90, 73,
              90, 90, 90, 37, 90, 90, 90, 90, 90, 90, 22, 90, 56, 86, 90, 90, 90, 90, 90, 50, 8,
            ],
          ],
          expected: 90,
        },
      ],
    },
  },
  {
    id: "phonepe-distribute-coins",
    company: "phonepe",
    title: "Distribute Coins in Binary Tree",
    prompt:
      "A binary tree has N nodes and holds exactly N coins in total, spread over the nodes (some may hold none). In one move you pass one coin between two nodes joined by an edge. Return the minimum number of moves so every node holds exactly one coin. The tree is a level-order array with null for missing children, and [0,3,0] needs 3 moves; there are up to 100 nodes.",
    level: "SDE-2",
    difficulty: "Medium",
    pattern: "Post-order tree DFS",
    patternId: "tree",
    leetcode: { number: 979, slug: "distribute-coins-in-binary-tree" },
    evidence: "one",
    sources: [
      {
        label: "Roundz: PhonePe SDE-2 interview experience (Aug 2025)",
        url: "https://roundz.substack.com/p/interview-experience-174-phonepe-sde2",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["dsa-tree-problems", "dsa-trees"],
    answer: {
      ask: `<p>I would ask: is the total number of coins guaranteed to equal the number of nodes, or must I detect the impossible case? Is a move one coin across one edge, so carrying a coin through an intermediate node costs one move per edge? Are coin counts non-negative integers? How is the tree encoded, and what do I return for an empty tree?</p>
<p>I would assume the totals match, a move is one coin over one edge, and the array uses the usual level-order format where the children of a missing node are not listed. An empty array or a null root returns 0.</p>`,
      brute: `<p>Treat the whole configuration as a state: the number of coins on each node. A move changes one state into a neighbor, so run a breadth-first search from the starting state to the all-ones state; the depth you reach it at is the answer.</p>
<p>It is correct but the state space is the number of ways to spread N coins over N nodes, which is the binomial coefficient C(2N-1, N). For N = 10 that is already 92,378 states, and for N = 100 it is a number with about 59 digits. Any search over configurations collapses long before the stated size, and a greedy rule about which coin to move first is easy to get wrong.</p>`,
      insight: `<p>Stop thinking about individual coins and look at one edge at a time. Cut the edge between a node and its parent. The subtree below has some number of nodes S and holds some number of coins C. At the end it must hold exactly S coins, so a net C - S coins must cross that edge: upward if positive, downward if negative. Every coin crossing costs one move on that edge, so at least |C - S| moves are unavoidable there. Summing over all edges gives a lower bound.</p>
<p>That bound is achievable. Orient each edge in the direction its coins must flow; a tree has no cycles, so some node has all its incoming flow finished and still has outgoing flow. That node holds one coin plus everything it still has to send, so it can send. Repeat, and no move is ever wasted or impossible.</p>
<p>This is a <b>post-order tree traversal</b> that returns a value to the parent. For each node compute its excess: the node's coins plus the excess of the left child plus that of the right child, minus one for the node itself. That equals coins minus nodes in the subtree. Before returning, add |left excess| + |right excess| to a running move total, because those are the coins crossing the two child edges. A missing child contributes 0.</p>
<p>Out loud: each node tells its parent how many coins it has to spare or needs, and the parent pays one move per coin on each child edge.</p>`,
      walkthrough: `<p>Take the level-order array [1,0,0,null,3]. The root holds 1 coin and has two children holding 0 each; the left child has a single child on its right with 3 coins. The post-order visit order is: leaf with 3, left 0, right 0, root.</p>
<p>The leaf has excess 3 + 0 + 0 - 1 = 2 and adds no moves. The left 0 node sees a child excess of 2, so it adds 2 moves, and its own excess is 0 + 2 - 1 = 1. The right 0 node has no children and returns -1. The root sees excesses 1 and -1, adds 1 + 1 = 2 moves, and returns 1 + 1 - 1 - 1 = 0, a balanced tree. The total is 4, and the table lists the steps.</p>`,
      edges: `<p>A single node (which must hold exactly one coin) has nothing to move and returns 0. A tree where every node already holds one coin has all excesses 0, so the answer is 0. An empty array, or a null root, returns 0 through the guard at the top.</p>
<p>Negative excesses (a subtree that needs coins) are counted with the absolute value, so coins moving down cost the same as coins moving up. A path with all coins at the deepest node pays the sum of the distances, which the per-edge counting produces automatically.</p>
<p>The level-order builder reads children from a queue, not from heap positions, because the encoding skips the children of missing nodes. The recursion depth equals the tree height, at most 100 here.</p>`,
      followups: [
        "What would you return, and how would you detect it, if the coins did not add up to the number of nodes?",
        "How would you output the actual sequence of moves rather than just their count?",
        "If every edge had a different cost per coin, what changes in the formula?",
        "How would the problem change on a general graph with cycles instead of a tree?",
        "How would you avoid deep recursion if the tree could be 100,000 nodes deep?",
      ],
      slips: `<p>Forgetting the absolute value, so a deficit cancels a surplus and the answer comes out too small. Forgetting the minus one for the node's own coin, which makes every excess too large.</p>
<p>Other slips: returning the move count from the recursion instead of the excess, so the parent computes nonsense; simulating the coins one by one with a greedy rule; and building the tree with heap indexing (children of i at 2i + 1 and 2i + 2). That is wrong here, because this encoding omits the children of missing nodes. Also watch that moves is shared across calls: it must be one running total, not reset in each call.</p>`,
    },
    trace: {
      caption: "Level order [1,0,0,null,3], visited in post-order. Excess is subtree coins minus subtree nodes.",
      head: ["Node", "Coins", "Child excess (L, R)", "Returns", "Moves so far"],
      rows: [
        ["leaf 3", "3", "0, 0", "2", "0"],
        ["left 0", "0", "0, 2", "1", "2"],
        ["right 0", "0", "0, 0", "-1", "2"],
        ["root 1", "1", "1, -1", "0", "4"],
      ],
    },
    complexity: { time: "O(N)", space: "O(N) with the tree built", brute: "O(N · C(2N-1, N))" },
    solution: {
      entry: "distributeCoins",
      code: `function buildTree(values) {
  if (values.length === 0 || values[0] === null) return null;
  const root = { val: values[0], left: null, right: null };
  const queue = [root];
  let head = 0;
  let i = 1;
  while (head < queue.length && i < values.length) {
    const node = queue[head++];
    if (i < values.length && values[i] !== null) {
      node.left = { val: values[i], left: null, right: null };
      queue.push(node.left);
    }
    i++;
    if (i < values.length && values[i] !== null) {
      node.right = { val: values[i], left: null, right: null };
      queue.push(node.right);
    }
    i++;
  }
  return root;
}

function distributeCoins(levelOrder) {
  const root = buildTree(levelOrder);
  let moves = 0;
  function excess(node) {
    if (node === null) return 0;
    const fromLeft = excess(node.left);
    const fromRight = excess(node.right);
    moves += Math.abs(fromLeft) + Math.abs(fromRight);
    return node.val + fromLeft + fromRight - 1;
  }
  excess(root);
  return moves;
}`,
      cases: [
        { args: [[3, 0, 0]], expected: 2 },
        { args: [[0, 3, 0]], expected: 3 },
        { args: [[1, 0, 2]], expected: 2 },
        { args: [[1, 0, 0, null, 3]], expected: 4 },
        { args: [[1]], expected: 0 },
        { args: [[1, 1, 1]], expected: 0 },
        { args: [[0, null, 0, null, 3]], expected: 3 },
        { args: [[]], expected: 0 },
        { args: [[0, 0, 3]], expected: 3 },
        { args: [[5, 0, 0, 0, 0]], expected: 6 },
        { args: [[0, 0, 0, 0, 0, 9, 0, 0, 0]], expected: 26 },
        { args: [[1, 0, null, 3, 0, 0, 2, null, 0, null, 0, null, null, null, 3]], expected: 8 },
        { args: [[1, 1, 0, 0, 2, 2, null, 0, 3, null, null, 1, null, null, null, null, null, 0]], expected: 8 },
        { args: [[1, 2, 0, null, 1, 0, 0, 3, null, null, null, 1]], expected: 12 },
      ],
    },
  },
  {
    id: "phonepe-most-stones-removed",
    company: "phonepe",
    title: "Most Stones Removed with Same Row or Column",
    prompt:
      "Stones sit on distinct integer grid points, given as [row, col] pairs. A stone can be removed if another stone that has not been removed yet shares its row or its column. Return the largest number of stones that can be removed; for [[0,0],[0,2],[1,1],[2,0],[2,2]] the answer is 3. There can be 1,000 stones with coordinates up to 10,000.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Union-find on rows and columns",
    patternId: "union",
    leetcode: { number: 947, slug: "most-stones-removed-with-same-row-or-column" },
    evidence: "guide",
    sources: [
      {
        label: "Company-tagged list: PhonePe (LeetCode tags)",
        url: "https://raw.githubusercontent.com/liquidslr/leetcode-company-wise-problems/main/PhonePe/5.%20All.csv",
        kind: "company-list",
        year: 2025,
      },
    ],
    chapters: ["dsa-union-find"],
    answer: {
      ask: `<p>I would ask: are the points distinct? Does sharing a row count even if other stones sit between the two (yes, I assume so)? What are the coordinate ranges, and can the list be empty? Do I return only the count, or also a removal order? Do removals change which stones remain available to the others (yes, only the remaining stones count)?</p>
<p>I would assume distinct points, non-negative coordinates up to 10,000, that two stones are linked whenever they share a row or a column, and that I return just the count. An empty list returns 0.</p>`,
      brute: `<p>Search over removal orders. Pick any stone that currently shares a row or column with another remaining stone, remove it, and recurse on what is left. Track the best count over all branches. Using a bitmask of removed stones as a memo key cuts the repeats, but there are still up to 2^n masks.</p>
<p>That is fine for 10 or 15 stones. At n = 1,000 the number of states is astronomically beyond reach, so enumerating orders cannot work. The insight must come from understanding the structure of which stones can be removed, not from trying orders.</p>`,
      insight: `<p>Build a graph where two stones are joined if they share a row or a column. Stones in the same connected component can all be removed except one, and stones in different components do not interact at all. So the answer is <b>n minus the number of components</b>.</p>
<p>Why a component of k stones loses exactly k - 1: pick a spanning tree of the component. A leaf of that tree shares a row or column with its parent, which is still present, so the leaf can be removed. Remove leaves one after another and only the root is left, so k - 1 removals are possible. The last remaining stone can never go, because any stone it shared a row or column with was in its component and has been removed, and no stone outside the component shares a line with it. So k - 1 is also the maximum.</p>
<p>Comparing every pair of stones to build that graph would cost O(n²). The trick is to make rows and columns the nodes of a <b>union-find</b> structure: a stone at (r, c) simply unions row r with column c. Two stones are in the same component exactly when their row nodes end up in the same set. Rows and columns share the same numbers, so I give them separate names with a prefix, "r" for rows and "c" for columns, so row 3 never merges with column 3. A Map creates entries on demand. With path compression and union by size, each operation is almost constant on average. At the end I count the distinct roots among the stones' row nodes.</p>`,
      walkthrough: `<p>Take [[0,0],[0,2],[1,1],[2,0],[2,2]]. The first stone (0,0) unions row 0 with column 0, which makes one new set. The second stone (0,2) unions row 0 with column 2; row 0 already has a set, so column 2 just joins it. The third stone (1,1) unions row 1 with column 1, a brand new set, so there are now 2 components.</p>
<p>The fourth stone (2,0) unions row 2 with column 0; column 0 is in the first set, so row 2 joins it. The fifth stone (2,2) unions row 2 with column 2, and both are already in the same set, so nothing changes. The table shows 2 components after all five stones, so the answer is 5 - 2 = 3.</p>`,
      edges: `<p>An empty list has no stones and no components, so it returns 0. A single stone is its own component, so it returns 0. Stones that share nothing, such as (1,2) and (2,1), give 0. Here the prefixes matter: without them, row 1 and column 1 would collide and falsely join the two stones.</p>
<p>All stones in one row give n - 1, since the row node unites every column. The code counts components by looking up the root of each stone's row node, so every component is counted once through a stone it actually contains and unused rows or columns are never counted.</p>
<p>The find routine compresses paths with a loop, not recursion, so a long chain cannot overflow the call stack.</p>`,
      followups: [
        "How would you solve it with a depth-first search over stones that share a line, and what would it cost?",
        "Why can the removal order be ignored when computing the count?",
        "How would you output one valid removal order, not just the count?",
        "If stones arrive one at a time, how would you report the answer after each arrival?",
        "Why use prefixed string keys instead of adding an offset to the column number?",
      ],
      slips: `<p>Using the same id space for rows and columns, so row 3 and column 3 become one node and unrelated stones merge. Counting components wrongly, for example returning the component count itself instead of n minus the count.</p>
<p>Other slips: building the pairwise stone graph in O(n²) and then running DFS, which is correct but does more work than the near-linear union of rows and columns; trying to simulate removals by hand and getting stuck on order; forgetting both path compression and union by size, so chains grow long; and returning the number of successful unions, which is the number of row and column nodes minus the components, not the stones minus the components.</p>`,
    },
    trace: {
      caption: "Stones in input order. Each stone unions its row node with its column node (r = row, c = column).",
      head: ["Stone", "Union", "What happens", "Components"],
      rows: [
        ["(0,0)", "r0 + c0", "new set", "1"],
        ["(0,2)", "r0 + c2", "c2 joins r0's set", "1"],
        ["(1,1)", "r1 + c1", "new set", "2"],
        ["(2,0)", "r2 + c0", "r2 joins c0's set", "2"],
        ["(2,2)", "r2 + c2", "already same set", "2"],
      ],
    },
    complexity: { time: "O(n α(n)), near linear", space: "O(n)", brute: "O(2^n · n²)" },
    solution: {
      entry: "removeStones",
      code: `function removeStones(stones) {
  const parent = new Map();
  const size = new Map();
  function find(key) {
    if (!parent.has(key)) {
      parent.set(key, key);
      size.set(key, 1);
    }
    let root = key;
    while (parent.get(root) !== root) root = parent.get(root);
    while (parent.get(key) !== root) {
      const next = parent.get(key);
      parent.set(key, root);
      key = next;
    }
    return root;
  }
  function union(a, b) {
    let rootA = find(a);
    let rootB = find(b);
    if (rootA === rootB) return;
    if (size.get(rootA) < size.get(rootB)) [rootA, rootB] = [rootB, rootA];
    parent.set(rootB, rootA);
    size.set(rootA, size.get(rootA) + size.get(rootB));
  }
  const rowKeys = new Set();
  for (const [row, col] of stones) {
    union("r" + row, "c" + col);
    rowKeys.add("r" + row);
  }
  const components = new Set();
  for (const key of rowKeys) components.add(find(key));
  return stones.length - components.size;
}`,
      cases: [
        {
          args: [
            [
              [0, 0],
              [0, 2],
              [1, 1],
              [2, 0],
              [2, 2],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [0, 0],
              [0, 1],
              [1, 0],
              [1, 2],
              [2, 1],
              [2, 2],
            ],
          ],
          expected: 5,
        },
        { args: [[[0, 0]]], expected: 0 },
        { args: [[]], expected: 0 },
        {
          args: [
            [
              [0, 0],
              [1, 1],
            ],
          ],
          expected: 0,
        },
        {
          args: [
            [
              [1, 2],
              [2, 1],
            ],
          ],
          expected: 0,
        },
        {
          args: [
            [
              [0, 0],
              [0, 1],
              [0, 2],
              [0, 3],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [0, 0],
              [1, 0],
              [2, 0],
              [3, 0],
              [3, 1],
            ],
          ],
          expected: 4,
        },
        {
          args: [
            [
              [0, 1],
              [1, 0],
              [1, 1],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [5, 9],
              [9, 0],
              [0, 0],
              [6, 1],
              [0, 2],
              [3, 3],
              [8, 4],
              [7, 7],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [6, 0],
              [6, 10],
              [3, 9],
              [12, 4],
              [10, 11],
              [1, 3],
              [12, 3],
              [3, 2],
              [1, 8],
              [1, 7],
              [9, 12],
              [6, 1],
              [1, 2],
              [12, 2],
              [5, 5],
              [0, 9],
              [5, 2],
              [3, 8],
              [5, 1],
              [7, 6],
              [10, 1],
              [7, 0],
              [9, 5],
              [4, 9],
              [0, 11],
              [9, 2],
              [11, 6],
              [11, 3],
              [12, 12],
              [6, 3],
              [1, 1],
              [2, 6],
              [1, 12],
              [8, 1],
              [1, 5],
              [3, 6],
              [11, 2],
              [8, 3],
              [8, 4],
              [12, 11],
              [2, 5],
              [3, 4],
              [11, 8],
              [2, 1],
              [11, 7],
              [4, 10],
              [7, 1],
              [6, 5],
              [5, 6],
              [0, 6],
              [4, 5],
              [10, 6],
              [5, 8],
              [3, 0],
              [12, 5],
              [12, 10],
              [5, 3],
              [7, 5],
              [12, 7],
              [11, 12],
            ],
          ],
          expected: 59,
        },
        {
          args: [
            [
              [37, 21],
              [32, 17],
              [34, 33],
              [6, 6],
              [15, 32],
              [37, 34],
              [22, 34],
              [3, 26],
              [5, 21],
              [27, 3],
              [20, 16],
              [28, 38],
              [40, 23],
              [11, 38],
              [34, 0],
              [20, 28],
              [21, 30],
              [38, 14],
              [24, 11],
              [24, 21],
              [27, 8],
              [20, 34],
              [5, 3],
              [25, 6],
              [23, 1],
              [40, 3],
              [1, 32],
              [10, 15],
              [33, 31],
              [2, 20],
              [3, 28],
              [34, 17],
              [35, 40],
              [39, 7],
              [33, 15],
              [29, 2],
              [1, 4],
              [26, 14],
              [3, 8],
              [7, 39],
              [17, 1],
              [18, 18],
              [11, 33],
              [26, 0],
              [22, 0],
              [30, 34],
              [20, 31],
              [5, 31],
              [40, 22],
              [13, 37],
              [17, 5],
              [2, 38],
              [18, 8],
              [23, 0],
              [3, 11],
              [18, 38],
              [23, 22],
              [12, 28],
              [7, 18],
              [0, 15],
              [35, 4],
              [8, 26],
              [40, 10],
              [19, 10],
              [5, 29],
              [8, 12],
              [9, 28],
              [0, 13],
              [26, 2],
              [8, 25],
              [11, 11],
              [25, 34],
              [3, 12],
              [7, 30],
              [2, 37],
              [5, 5],
              [26, 1],
              [19, 13],
              [20, 20],
              [8, 36],
            ],
          ],
          expected: 77,
        },
      ],
    },
  },
  {
    id: "phonepe-minimum-speed",
    company: "phonepe",
    title: "Minimum Speed to Arrive on Time",
    prompt:
      "You take n trains in order, all at the same integer speed in km per hour, and dist[i] is the length of the i-th ride. A train departs only on a whole hour, so after each ride except the last you wait for the next whole hour. Given the allowed total time hour (at most two decimal places), return the smallest positive integer speed that arrives in time, or -1 if none does. For dist = [2,4,7,3] and hour = 6.5 the answer is 4. There can be 100,000 rides, each at most 100,000 km, and hour is at most 100.",
    level: "SDE (on-campus, 2021)",
    difficulty: "Medium",
    pattern: "Binary search on the answer",
    patternId: "search",
    leetcode: { number: 1870, slug: "minimum-speed-to-arrive-on-time" },
    evidence: "one",
    sources: [
      {
        label: "GeeksforGeeks: PhonePe on-campus interview experience, 2021",
        url: "https://www.geeksforgeeks.org/?p=655145",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-binary-search"],
    answer: {
      ask: `<p>I would ask: must the speed be an integer, and is it the same for every train? Is the waiting only between rides, so the last ride ends the moment it arrives? Are distances positive? Does hour have at most two decimals? Is there an upper limit on the answer, and what is returned when no speed works?</p>
<p>I would assume integer speed shared by all trains, no waiting after the last ride, positive distances, at least one ride, and -1 when impossible. Because hour is a decimal, I will convert it to whole hundredths so floating-point rounding never decides a comparison.</p>`,
      brute: `<p>Try speeds 1, 2, 3 and so on. For each speed, add up ceil(dist[i] / speed) for every ride except the last, add dist[last] / speed, and compare with hour. The first speed that fits is the answer.</p>
<p>Each check costs O(n), and the answer can be huge: a last ride of 100,000 km with only 0.01 hours left for it needs a speed of 10 million. So the loop can run ten million times over a hundred thousand rides, about 10^12 operations, far beyond any time limit. Most of those speeds are obviously too slow or just as good as their neighbors, so the work is wasted.</p>`,
      insight: `<p>The pattern is <b>binary search on the answer</b>. The question "does speed s arrive in time?" is monotone: raising the speed never makes any ceiling term bigger and always makes the last ride shorter, so total time never goes up as speed goes up. The answers over s = 1, 2, 3 and so on look like no, no, no, yes, yes, yes, and I am looking for the first yes. Checking a single speed is a linear scan, so the search costs O(n log V) with V the largest speed tried.</p>
<p>Bounds come from reasoning, not guessing. Each of the first n - 1 rides takes at least one full hour, and the last takes some positive time, so if hour is at most n - 1 the answer is -1. Otherwise, any speed at least the longest ride makes every earlier ride take exactly one hour, which leaves hour - (n - 1) for the last ride, so speed ceil(dist[last] / that) also suffices. Take the larger of the two as the upper bound; it is always feasible, so no further -1 check is needed.</p>
<p>The precision trap: hour like 2.01 is not exact in binary. I work in hundredths. Waiting time is an integer number of hours times 100, and the last ride fits if dist[last] · 100 is at most the remaining hundredths times speed. Everything stays an integer comparison. Explained aloud: I am not searching the array, I am searching the space of speeds, because each guess can be tested in a single pass.</p>`,
      walkthrough: `<p>Take dist = [2,4,7,3] and hour = 6.5, which is 650 hundredths. The first three rides take at least 3 hours, leaving at most 3.5 hours for the last one. The upper bound is the larger of 7 (the longest ride) and ceil(300 / 350) = 1, so 7. Search from 1 to 7.</p>
<p>Mid 4: the first three rides use 1 + 1 + 2 = 4 hours, leaving 2.5 for the last ride of 3 km at speed 4, which fits; high becomes 4. Mid 2: the waits are 1 + 2 + 4 = 7 hours, already over 6.5, so low becomes 3. Mid 3: waits are 1 + 2 + 3 = 6 hours, leaving 0.5, but 3 km at speed 3 takes 1 hour, so it fails and low becomes 4. Low meets high at 4, as the table shows.</p>`,
      edges: `<p>If hour is at most n - 1, the guard returns -1 before any search. That includes hour exactly equal to n - 1, because the last ride needs time greater than zero. With one ride there is no waiting, the guaranteed time is 0, and the answer is ceil(dist / hour); for [5] and hour 0.5 the code returns 10.</p>
<p>A speed of 1 is the minimum, so the search never goes below it. When hour leaves only 0.01 hours for the last ride, the answer can be in the millions, for example [1,1,100000] with hour 2.01 gives 10,000,000, and the upper bound computed from the remaining time covers it. The comparison inside the check is at most, not strictly less, so arriving exactly on time counts. The code assumes at least one ride.</p>`,
      followups: [
        "What changes if speeds may be any positive real number instead of an integer?",
        "How would the answer change if you also had to wait for a whole hour after the last ride?",
        "Can you prove the arrives-in-time check is monotone in the speed?",
        "How would you cut the number of binary search steps by tightening the bounds further?",
        "How would you return the minimum speed when each train also has its own maximum speed?",
      ],
      slips: `<p>Applying the ceiling to the last ride too, which models waiting after arrival and gives a speed that is too high. This is a classic mistake on this problem.</p>
<p>Others: comparing floating-point sums directly to hour so a case that lands exactly on the limit flips; testing hour less than n instead of hour at most n - 1; using a strict less-than so exact arrival is rejected; hard-coding an upper bound of ten million without the impossible case; returning mid rather than low when the loop ends; and writing the update as high = mid - 1 in a search that keeps the feasible candidate, which skips the real answer. Forgetting that speed must be an integer, and returning a decimal, is another frequent slip.</p>`,
    },
    trace: {
      caption:
        "dist = [2,4,7,3], hour = 6.5. Search speeds in [1, 7]; waits are the whole hours spent on the first three rides.",
      head: ["Step", "low..high", "mid", "Waits (hours)", "Arrives in time?"],
      rows: [
        ["start", "1..7", "-", "-", "-"],
        ["1", "1..7", "4", "1+1+2 = 4", "yes, high = 4"],
        ["2", "1..4", "2", "1+2+4 = 7", "no, low = 3"],
        ["3", "3..4", "3", "1+2+3 = 6", "no, low = 4"],
        ["done", "4..4", "-", "-", "answer 4"],
      ],
    },
    complexity: { time: "O(n log V)", space: "O(1)", brute: "O(n · V)" },
    solution: {
      entry: "minSpeedOnTime",
      code: `function minSpeedOnTime(dist, hour) {
  const rides = dist.length;
  const limit = Math.round(hour * 100);
  const guaranteed = (rides - 1) * 100;
  if (limit <= guaranteed) return -1;
  const lastRide = dist[rides - 1];
  const arrivesInTime = (speed) => {
    let used = 0;
    for (let i = 0; i < rides - 1; i++) {
      used += Math.ceil(dist[i] / speed) * 100;
    }
    const remaining = limit - used;
    return remaining > 0 && lastRide * 100 <= remaining * speed;
  };
  const longest = dist.reduce((a, b) => Math.max(a, b), 0);
  let low = 1;
  let high = Math.max(longest, Math.ceil((lastRide * 100) / (limit - guaranteed)));
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (arrivesInTime(mid)) high = mid;
    else low = mid + 1;
  }
  return low;
}`,
      cases: [
        { args: [[2, 4, 7, 3], 6.5], expected: 4 },
        { args: [[1, 3, 2], 6], expected: 1 },
        { args: [[1, 3, 2], 2.7], expected: 3 },
        { args: [[1, 3, 2], 1.9], expected: -1 },
        { args: [[5], 0.5], expected: 10 },
        { args: [[1, 1], 1], expected: -1 },
        { args: [[1, 1], 1.01], expected: 100 },
        { args: [[1, 1, 100000], 2.01], expected: 10000000 },
        { args: [[3], 3], expected: 1 },
        { args: [[100000], 1], expected: 100000 },
        {
          args: [
            [
              23251, 84232, 33297, 82885, 5355, 15138, 64286, 92626, 12221, 14637, 2252, 98185, 17542, 2858, 97381,
              58900, 13910, 65686, 16219, 46580, 53562, 31429, 47705, 45862, 37283, 23364, 45639, 78087, 59260, 89720,
              27876, 12786, 40703, 37675, 77585, 55817, 10054, 22905, 16855, 28230, 12589, 71276, 47990, 74917, 57223,
              34220, 82790, 67107, 33337, 4361,
            ],
            60.37,
          ],
          expected: 67107,
        },
        {
          args: [
            [
              52, 878, 555, 430, 372, 140, 185, 958, 44, 355, 716, 988, 200, 728, 432, 5, 340, 854, 748, 522, 166, 823,
              476, 431, 726, 753, 76, 812, 55, 385,
            ],
            31.5,
          ],
          expected: 878,
        },
        { args: [[9, 9, 9, 9], 4], expected: 9 },
      ],
    },
  },
];
