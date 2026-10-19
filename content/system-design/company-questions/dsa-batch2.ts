import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "amazon-lru-cache",
    company: "amazon",
    title: "LRU Cache",
    prompt:
      "Design a cache with a fixed capacity (at least 1) that supports get(key) and put(key, value), each in O(1) average time. get returns the stored value, or -1 when the key is absent, and either call counts as using that key; put updates an existing key or inserts a new one, and an insert into a full cache first evicts the key that was used longest ago. With capacity 2, put(1, 10), put(2, 20), get(1) returns 10, then put(3, 30) evicts key 2, so get(2) returns -1.",
    level: "SDE-1 and SDE",
    difficulty: "Medium",
    pattern: "Hash map plus doubly linked list",
    patternId: "design",
    leetcode: { number: 146, slug: "lru-cache" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Amazon software engineer interview experience",
        url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-software-engineer-3/",
        kind: "candidate-report",
      },
      {
        label: "GeeksforGeeks: Amazon SDE-1 off-campus interview experience, 2020",
        url: "https://www.geeksforgeeks.org/?p=531076",
        kind: "candidate-report",
        year: 2020,
      },
      {
        label: "TechInterview.org: top coding problems by company",
        url: "https://www.techinterview.org/post/3233474385/coding-interview-top-50-most-asked-problems-by-company-google-amazon-meta-apple-microsoft-blind-75-neetcode-150/",
        kind: "company-list",
        year: 2026,
      },
      {
        label: "Company-tagged list: Amazon (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/amazon/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-design-problems", "dsa-linked-lists", "dsa-hashing"],
    answer: {
      ask: `<p>Before coding I would ask: can the capacity be 0, or is it at least 1? Are keys and values integers, and can a value be negative, given that -1 is the miss marker? Does put on an existing key count as a use? Does a get that misses change anything? Must it be thread safe? And may I use a language feature that remembers insertion order, or should I build the list by hand?</p>
<p>I would assume capacity of at least 1, integer keys, both put and get refresh recency, a miss changes nothing, a single thread, and O(1) average time per operation. I will build the list myself and mention the shortcut afterwards.</p>`,
      brute: `<p>The simplest design keeps an array of [key, value] pairs ordered by use. get scans for the key, removes that pair and pushes it to the end; put does the same scan, and drops the first element when the array is full. It is correct and easy to reason about.</p>
<p>But every operation is O(capacity), because both the scan and the removal walk the array. With a capacity of 100,000 and a million operations that is on the order of 100 billion element moves, far beyond a time limit. Adding a Map for lookup fixes the search, but recency is still a problem: finding the oldest key means scanning for the smallest timestamp, which is again O(capacity).</p>`,
      insight: `<p>Two structures cooperate, and each one covers the other's weakness. A hash map answers "where is this key" in O(1) on average. A doubly linked list keeps every entry in recency order. One sentinel node closes the list into a ring: the node after the sentinel is the most recently used, and the node before it is the one to evict.</p>
<p>The map stores the <em>node itself</em>, not just the value. That is the whole trick. Removing a node from the middle of a doubly linked list takes constant time only if you already hold the node, and the map hands it to you. So a get is: look up the node, unlink it, push it to the front, return its value. A put on a new key is: if the cache is full, take the node before the sentinel, unlink it and delete its key from the map, then create the new node and push it to the front.</p>
<p>The invariant is simple: the list order is the recency order, and the map holds exactly the keys that are in the list. Every operation changes a constant number of pointers and then the invariant holds again, so it is correct by construction. Two details cause most bugs. The node must store its own key, because eviction starts from a node and must delete that key from the map. And the sentinel removes all the null checks at the ends of the list.</p>
<p>Out loud I would say: "hash map plus doubly linked list, O(1) per operation." In JavaScript a Map also remembers insertion order, so deleting a key and setting it again moves it to the end; that is a valid shortcut, but it leans on engine behaviour, so I show the explicit list first.</p>`,
      walkthrough: `<p>Take capacity 2 and the operations in the table. The first two puts fill the cache, and the newest key always sits first in the order column. get(1) is a hit, so key 1 jumps to the front and key 2 becomes the oldest. put(3, 30) arrives at a full cache, so it evicts the oldest entry, key 2, and then puts 3 at the front.</p>
<p>The next get(2) is a miss and the order does not change, which is why a miss must not touch the list. put(4, 40) evicts key 1, because key 1 has gone unused longer than key 3. The last two gets are hits that reorder the list again. Watch the order column: at every row it is the single source of truth for who is evicted next.</p>`,
      edges: `<p>Capacity 1: every new put evicts the only entry, and the code handles it because the oldest node and the newest node are the same node. Updating an existing key must not evict anything, even when the cache is full, so put checks the map before it checks the size. A put that overwrites a value also counts as a use, so it moves the node to the front.</p>
<p>A get on a missing key returns -1 and leaves the list alone. Re-inserting a key that was evicted earlier creates a fresh node, so there is no stale pointer. An empty cache has the sentinel pointing at itself, so a get on it simply misses. Values of 0 are fine, since the code tests for the node, not for a truthy value.</p>`,
      followups: [
        "How would you make this safe for many threads without one global lock?",
        "How would you add a time-to-live to each entry?",
        "What changes if eviction should be least frequently used instead of least recently used?",
        "Can you build it with only a JavaScript Map, and what does that rely on?",
        "How would you shard it across machines, and what happens to recency order?",
      ],
      slips: `<p>The most common slip is a singly linked list: removing a middle node then needs a scan for its predecessor, and the cache is O(n) again. The next is forgetting to store the key in the node, so eviction cannot delete the map entry and the cache slowly lies about its size.</p>
<p>Others: updating an existing key without refreshing its recency; evicting before checking whether the key already exists, which throws away an entry for nothing; using a falsy check such as <code>if (!value)</code>, which treats a stored 0 as a miss; and getting pointer order wrong when linking, which is why I write the unlink and push-front helpers once and never inline them.</p>`,
    },
    trace: {
      caption: "Capacity 2. Order lists keys from most to least recently used.",
      head: ["Operation", "Result", "Order after", "Evicted"],
      rows: [
        ["put(1, 10)", "null", "1", "-"],
        ["put(2, 20)", "null", "2, 1", "-"],
        ["get(1)", "10", "1, 2", "-"],
        ["put(3, 30)", "null", "3, 1", "key 2"],
        ["get(2)", "-1", "3, 1", "-"],
        ["put(4, 40)", "null", "4, 3", "key 1"],
        ["get(1)", "-1", "4, 3", "-"],
        ["get(3)", "30", "3, 4", "-"],
        ["get(4)", "40", "4, 3", "-"],
      ],
    },
    complexity: { time: "O(1) average per operation", space: "O(capacity)", brute: "O(capacity) per operation" },
    solution: {
      entry: "run",
      code: `class LRUCache {
  constructor(capacity) {
    this.capacity = capacity;
    this.nodes = new Map();
    this.root = { key: 0, value: 0 };
    this.root.prev = this.root;
    this.root.next = this.root;
  }

  unlink(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }
  pushFront(node) {
    node.prev = this.root;
    node.next = this.root.next;
    this.root.next.prev = node;
    this.root.next = node;
  }

  get(key) {
    const node = this.nodes.get(key);
    if (node === undefined) return -1;
    this.unlink(node);
    this.pushFront(node);
    return node.value;
  }
  put(key, value) {
    const old = this.nodes.get(key);
    if (old !== undefined) this.unlink(old);
    else if (this.nodes.size === this.capacity) {
      const oldest = this.root.prev;
      this.unlink(oldest);
      this.nodes.delete(oldest.key);
    }
    const node = { key, value, prev: null, next: null };
    this.nodes.set(key, node);
    this.pushFront(node);
  }
}

function run(ops, args) {
  const cache = new LRUCache(args[0][0]);
  return ops.map((op, i) => (i === 0 ? null : (cache[op](...args[i]) ?? null)));
}`,
      cases: [
        {
          args: [
            ["LRUCache", "put", "put", "get", "put", "get", "put", "get", "get", "get"],
            [[2], [1, 10], [2, 20], [1], [3, 30], [2], [4, 40], [1], [3], [4]],
          ],
          expected: [null, null, null, 10, null, -1, null, -1, 30, 40],
        },
        { args: [["LRUCache"], [[3]]], expected: [null] },
        {
          args: [
            ["LRUCache", "get", "get"],
            [[2], [7], [7]],
          ],
          expected: [null, -1, -1],
        },
        {
          args: [
            ["LRUCache", "put", "put", "put", "get", "get"],
            [[1], [1, 1], [2, 2], [3, 3], [1], [3]],
          ],
          expected: [null, null, null, null, -1, 3],
        },
        {
          args: [
            ["LRUCache", "put", "put", "get", "put", "get", "get"],
            [[2], [5, 1], [5, 2], [5], [6, 3], [5], [6]],
          ],
          expected: [null, null, null, 2, null, 2, 3],
        },
        {
          args: [
            ["LRUCache", "put", "put", "put", "get", "put", "get", "get"],
            [[2], [1, 1], [2, 2], [1, 9], [2], [3, 3], [1], [3]],
          ],
          expected: [null, null, null, null, 2, null, -1, 3],
        },
        {
          args: [
            ["LRUCache", "put", "get", "put", "get"],
            [[2], [4, 0], [4], [4, 0], [4]],
          ],
          expected: [null, null, 0, null, 0],
        },
        {
          args: [
            ["LRUCache", "put", "put", "put", "put", "get", "get", "get", "get"],
            [[3], [1, 1], [2, 2], [3, 3], [4, 4], [1], [2], [3], [4]],
          ],
          expected: [null, null, null, null, null, -1, 2, 3, 4],
        },
        {
          args: [
            ["LRUCache", "put", "put", "get", "get", "put", "get", "get"],
            [[2], [2, 1], [1, 1], [2], [3], [2, 3], [1], [2]],
          ],
          expected: [null, null, null, 1, -1, null, 1, 3],
        },
        {
          args: [
            [
              "LRUCache",
              "get",
              "get",
              "put",
              "get",
              "put",
              "put",
              "get",
              "get",
              "put",
              "get",
              "get",
              "get",
              "put",
              "get",
              "put",
              "get",
              "put",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "put",
              "put",
              "get",
              "get",
              "put",
              "put",
              "get",
              "put",
              "get",
              "get",
              "get",
              "get",
              "get",
              "get",
              "put",
              "put",
              "put",
              "get",
              "get",
              "get",
              "put",
              "put",
              "get",
              "get",
              "put",
              "put",
              "put",
              "get",
              "get",
              "put",
              "get",
              "put",
              "get",
              "put",
              "put",
              "put",
              "get",
            ],
            [
              [5],
              [3],
              [6],
              [1, 4],
              [7],
              [1, 2],
              [4, 2],
              [0],
              [0],
              [4, 0],
              [2],
              [1],
              [1],
              [7, 2],
              [5],
              [2, 1],
              [6],
              [5, 1],
              [1],
              [5],
              [8],
              [8],
              [7],
              [3],
              [5, 2],
              [3, 1],
              [6],
              [3],
              [4, 2],
              [7, 2],
              [4],
              [4, 3],
              [3],
              [0],
              [0],
              [2],
              [2],
              [5],
              [4, 3],
              [4, 1],
              [7, 4],
              [2],
              [7],
              [0],
              [0, 2],
              [0, 1],
              [0],
              [0],
              [7, 0],
              [4, 2],
              [7, 2],
              [2],
              [2],
              [4, 3],
              [6],
              [1, 1],
              [4],
              [0, 1],
              [3, 0],
              [6, 4],
              [3],
            ],
          ],
          expected: [
            null,
            -1,
            -1,
            null,
            -1,
            null,
            null,
            -1,
            -1,
            null,
            -1,
            2,
            2,
            null,
            -1,
            null,
            -1,
            null,
            2,
            1,
            -1,
            -1,
            2,
            -1,
            null,
            null,
            -1,
            1,
            null,
            null,
            2,
            null,
            1,
            -1,
            -1,
            -1,
            -1,
            2,
            null,
            null,
            null,
            -1,
            4,
            -1,
            null,
            null,
            1,
            1,
            null,
            null,
            null,
            -1,
            -1,
            null,
            -1,
            null,
            3,
            null,
            null,
            null,
            0,
          ],
        },
      ],
    },
  },
  {
    id: "amazon-trapping-rain-water",
    company: "amazon",
    title: "Trapping Rain Water",
    prompt:
      "Each element of an array is the height of a unit-wide bar, and the bars stand side by side. After rain, water collects in the gaps and cannot spill over a taller wall or past either end of the row; return how many units of water the whole row holds. For heights [3, 1, 0, 2, 0, 5, 1, 4] the answer is 12. The array has up to 100,000 bars, with heights from 0 to 100,000.",
    level: "level not stated",
    difficulty: "Hard",
    pattern: "Two pointers",
    patternId: "pointers",
    leetcode: { number: 42, slug: "trapping-rain-water" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Amazon interview experience, technical round 1",
        url: "https://www.geeksforgeeks.org/?p=482934",
        kind: "candidate-report",
      },
      {
        label: "Company-tagged list: Amazon (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/amazon/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-two-pointers", "dsa-monotonic-stack-queue"],
    answer: {
      ask: `<p>I would ask: are the heights non-negative integers, as the problem suggests? Is every bar exactly one unit wide? Does water at the two ends spill away, so the first and last bar can never hold any? What should I return for an empty row, a single bar, or two bars? May I use extra arrays, or is constant extra memory expected?</p>
<p>I would assume non-negative integer heights, unit widths, water spilling off both ends, and 0 for any row of fewer than three bars. I will aim for one pass over the input and then see how little memory I can use.</p>`,
      brute: `<p>Look at one position at a time. The water standing above bar i reaches the lower of two walls: the tallest bar at or left of i and the tallest bar at or right of i. So for every i, scan left for the maximum, scan right for the maximum, and add the lower of the two minus the height of bar i.</p>
<p>That is correct, and it is O(n²): each position triggers two scans that together cover the whole row. With 100,000 bars that is about ten billion comparisons, which will not finish in time. You can store the prefix maximums and suffix maximums in two arrays to get O(n) time, but then you spend O(n) memory on tables that we can avoid.</p>`,
      insight: `<p>The formula for one position is <code>min(tallest to the left, tallest to the right) - height</code>. Notice that only the <em>smaller</em> of the two maximums matters. So we do not need both exact values at every position, only to know which side is the smaller one.</p>
<p>Put a pointer at each end and keep <code>leftMax</code> and <code>rightMax</code> for the bars already passed on each side. Compare the two bars under the pointers and handle the shorter one. Suppose the left bar is shorter. Every bar we have already passed on the left was shorter than some bar on the right at that moment, and that taller bar is still somewhere to the right of the left pointer. So the true right-hand wall for this position is at least as high as <code>leftMax</code>, and the left side is the limiting wall. Water here is exactly <code>leftMax - height</code>, with no need to know the real right maximum. Then we move the left pointer in. The case where the right bar is shorter is the mirror image.</p>
<p>Each step settles one position for good and moves one pointer, so the pointers meet after n - 1 steps. Update the running maximum <em>before</em> computing the water, so the amount is never negative.</p>
<p>The pattern is two pointers moving inward, deciding by the smaller side. Out loud: "the lower wall decides, so I always advance from the lower side, where I am certain of the limiting wall."</p>`,
      walkthrough: `<p>Use the row [3, 1, 0, 2, 0, 5, 1, 4]. The right pointer starts on the 4. The left bar 3 is lower than 4, so we set leftMax to 3, add nothing, and move right. The next four left bars (1, 0, 2, 0) are all lower than 4 and lower than the leftMax of 3, so they hold 2, 3, 1 and 3 units: the running total reaches 9.</p>
<p>Now the left pointer is on the 5, which is not lower than the 4 on the right, so we switch sides. The right wall is the shorter one: rightMax becomes 4, and the bar of height 4 holds nothing. Then the right pointer moves to the 1, which holds 4 - 1 = 3 units, and the total is 12. The pointers have met. Check the water column row by row in the table.</p>`,
      edges: `<p>An empty row, one bar or two bars: the loop condition <code>left &lt; right</code> either fails at once or the two bars hold nothing, so the answer is 0. A row that only rises or only falls never has a smaller maximum behind it, so every step adds 0. A flat row adds 0 each time.</p>
<p>Ties between the two pointer bars go to the right side; either choice is correct because the two maximums are then both limited by that same height. Leading and trailing zeros are fine because the maximum starts at 0 and zero minus zero adds nothing. The total can reach about ten billion, which a JavaScript number holds exactly, so no overflow handling is needed.</p>`,
      followups: [
        "How would you solve it with a monotonic stack, and when is that version more natural?",
        "How would you compute the water for a two-dimensional grid of heights?",
        "Can you return the water level at every position instead of the total?",
        "What changes if bars have different widths?",
        "How does the prefix and suffix maximum version compare in memory and in readability?",
      ],
      slips: `<p>The classic mistake is using the global maximum as one wall, which ignores that a closer, lower wall limits the water. Another is computing the water before updating the running maximum, which produces negative amounts on a new peak.</p>
<p>Candidates also advance the wrong pointer: with the bar comparison used here, the pointer on the lower bar must move, and moving the taller side's pointer settles a position whose limiting wall is not yet known. And many jump straight to the two-pointer code without being able to explain why the other side's exact maximum is not needed, which is the part worth being ready to explain.</p>`,
    },
    trace: {
      caption: "Heights [3, 1, 0, 2, 0, 5, 1, 4]. Pointers start at both ends.",
      head: ["Pointers", "Compare", "Side moved", "Maxes (L, R)", "Water total"],
      rows: [
        ["left 0, right 7", "3 < 4", "left", "3, 0", "0"],
        ["left 1, right 7", "1 < 4", "left", "3, 0", "2"],
        ["left 2, right 7", "0 < 4", "left", "3, 0", "5"],
        ["left 3, right 7", "2 < 4", "left", "3, 0", "6"],
        ["left 4, right 7", "0 < 4", "left", "3, 0", "9"],
        ["left 5, right 7", "5 >= 4", "right", "3, 4", "9"],
        ["left 5, right 6", "5 >= 1", "right", "3, 4", "12"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1) extra", brute: "O(n²)" },
    solution: {
      entry: "trap",
      code: `function trap(height) {
  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;
  while (left < right) {
    if (height[left] < height[right]) {
      leftMax = Math.max(leftMax, height[left]);
      water += leftMax - height[left];
      left++;
    } else {
      rightMax = Math.max(rightMax, height[right]);
      water += rightMax - height[right];
      right--;
    }
  }
  return water;
}`,
      cases: [
        { args: [[3, 1, 0, 2, 0, 5, 1, 4]], expected: 12 },
        { args: [[]], expected: 0 },
        { args: [[7]], expected: 0 },
        { args: [[2, 5]], expected: 0 },
        { args: [[2, 0, 2]], expected: 2 },
        { args: [[1, 2, 3, 4, 5]], expected: 0 },
        { args: [[4, 4, 4, 4]], expected: 0 },
        { args: [[0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]], expected: 6 },
        { args: [[5, 0, 0, 0, 5]], expected: 15 },
        { args: [[4, 2, 0, 3, 2, 5]], expected: 9 },
        {
          args: [
            [
              60, 57, 54, 51, 48, 45, 42, 39, 36, 33, 30, 27, 24, 21, 18, 15, 12, 9, 6, 3, 0, 3, 6, 9, 12, 15, 18, 21,
              24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60,
            ],
          ],
          expected: 1200,
        },
        {
          args: [
            [
              0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, 39, 42, 45, 48, 51, 54, 57, 60, 57, 54, 51, 48, 45, 42,
              39, 36, 33, 30, 27, 24, 21, 18, 15, 12, 9, 6, 3, 0,
            ],
          ],
          expected: 0,
        },
        {
          args: [
            [
              41, 46, 13, 37, 5, 35, 43, 27, 54, 13, 46, 44, 39, 0, 27, 18, 53, 17, 45, 43, 15, 1, 47, 12, 16, 7, 28,
              59, 14, 4, 50, 19, 24, 59, 16, 23, 13, 52, 43, 52, 30, 48, 38, 8, 38, 34, 18, 46, 36, 0, 55, 20, 21, 52,
              14, 10, 50, 16, 59, 0, 21, 45, 18, 39, 4, 4, 44, 31, 15, 55, 2, 44, 57, 17, 31, 51, 50, 34, 57, 42, 32, 6,
              17, 31, 9, 15, 46, 8, 4, 19, 48, 38, 24, 5, 17, 57, 19, 42, 44, 6, 47, 55, 36, 6, 21, 24, 3, 25, 55, 18,
              46, 3, 48, 6, 30, 49, 12, 35, 6, 21, 39, 15, 40, 14, 15, 59, 38, 27, 44, 2, 37, 39, 1, 8, 20, 20, 38, 56,
              35, 52, 46, 17, 3, 10, 2, 13, 53, 27, 2, 46, 35, 17, 53, 46, 58, 10, 16, 48, 16, 17, 45, 0, 39, 31, 16,
              14, 39, 48, 33, 36, 40, 25, 34, 11, 6, 22, 29, 3, 36, 27, 27, 23, 30, 21, 15, 26, 31, 39, 21, 14, 47, 4,
              21, 41, 7, 8, 59, 4, 31, 23, 7, 12, 58, 23, 1, 36, 41, 46, 31, 13, 11, 51, 57, 30, 6, 40, 29, 18, 6, 29,
              59, 31, 10, 13, 57, 12, 47, 43, 35, 0, 25, 55, 0, 45, 29, 33, 26, 19, 39, 51, 16, 21, 0, 16, 48, 29, 51,
              58, 30, 38, 4, 6, 30, 30, 31, 37, 25, 0, 33, 59, 6, 9, 21, 52, 56, 52, 27, 1, 45, 19, 52, 41, 3, 35, 51,
              57, 26, 3, 41, 34, 47, 12, 35, 22, 36, 33, 22, 9, 23, 23, 11, 19, 23, 46, 27, 13, 14, 41, 17, 48,
            ],
          ],
          expected: 8665,
        },
      ],
    },
  },
  {
    id: "amazon-longest-palindromic-substring",
    company: "amazon",
    title: "Longest Palindromic Substring",
    prompt:
      'Given a string, return its longest substring that reads the same forwards and backwards. If several palindromes tie for the maximum length, return the one that starts earliest, and return an empty string for empty input. For "football" the answer is "oo", because "oo" and "ll" both have length 2 and "oo" starts first. The string has at most 1,000 characters.',
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Expand around the centre",
    patternId: "pointers",
    leetcode: { number: 5, slug: "longest-palindromic-substring" },
    evidence: "several",
    sources: [
      {
        label: "GeeksforGeeks: Amazon software engineer interview experience",
        url: "https://www.geeksforgeeks.org/interview-experiences/amazon-interview-experience-for-software-engineer-3/",
        kind: "candidate-report",
      },
      {
        label: "TechInterview.org: top coding problems by company",
        url: "https://www.techinterview.org/post/3233474385/coding-interview-top-50-most-asked-problems-by-company-google-amazon-meta-apple-microsoft-blind-75-neetcode-150/",
        kind: "company-list",
        year: 2026,
      },
      {
        label: "Company-tagged list: Amazon (LeetCode tag export)",
        url: "https://github.com/snehasishroy/leetcode-companywise-interview-questions/blob/master/amazon/all.csv",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-string-algorithms", "dsa-dp-2d"],
    answer: {
      ask: `<p>I would ask: what is the alphabet, and is the match case sensitive? Do I return the substring itself, its length, or its start index? If two palindromes tie for longest, does the interviewer want a particular one, or is any acceptable? What should an empty string return? Is a single character a palindrome of length 1?</p>
<p>I would assume any characters compared exactly, a single character counts as a palindrome, an empty string returns an empty string, and ties go to the leftmost palindrome so the answer is deterministic. With at most 1,000 characters, a quadratic solution is comfortably fast.</p>`,
      brute: `<p>Try every substring, test each one for being a palindrome, and keep the longest. There are about n²/2 substrings, and a palindrome test compares up to half of the characters, so the total work is cubic in n.</p>
<p>For 1,000 characters that is already around a hundred million character comparisons, which is acceptable only because the limit is so small. If the limit moved to 5,000 it would be more than ten billion, and the approach would fail. It also repeats work: testing "abcba" re-checks "bcb" and "c" from scratch, even though we just learned that they are palindromes.</p>`,
      insight: `<p>Every palindrome has a centre. For an odd length the centre is a character; for an even length it is the gap between two characters. A string of n characters has n odd centres and n - 1 even centres, so 2n - 1 centres in total.</p>
<p>Reverse the thinking: instead of testing substrings, grow a palindrome outward from each centre. Start with a window that is empty or one character wide, then repeatedly compare the character just outside the window on each side. If they match, the bigger window is also a palindrome, because a string whose two ends match and whose inside is a palindrome is itself a palindrome. The moment they differ, or we hit an end of the string, the window cannot grow any further at this centre. Whatever we have is the longest palindrome around that centre.</p>
<p>Correctness follows from two facts. Any palindrome in the string is centred somewhere, and we try every centre. And at a fixed centre the palindromes are nested, so the first mismatch ends them all. We keep the best window seen. To return the leftmost on ties, we only replace the best when a window is strictly longer, and since centres are visited from left to right, an earlier centre means an earlier start for equal lengths.</p>
<p>Each expansion costs O(n) at worst, and there are 2n - 1 centres, so the time is O(n²) with O(1) extra memory. The dynamic programming table needs O(n²) memory for the same time, and Manacher's algorithm reaches O(n). I name the pattern out loud: "expand around the centre, over odd and even centres".</p>`,
      walkthrough: `<p>Take "football". At each centre the table shows the odd palindrome and the even palindrome that grows from the gap just after it. Centre 0 gives "f", and the best becomes "f". The interesting row is centre 1: its even expansion compares o with o and matches, then compares f with t and stops. That is a window of length 2, "oo", strictly longer than "f", so it becomes the best.</p>
<p>Centres 2 to 5 produce only single letters. At centre 6 the even expansion matches l with l, giving "ll", but that has the same length as "oo", and a tie does not replace the best, so the earlier palindrome stays. This is how the leftmost rule falls out of a strict comparison. Notice that both two-letter palindromes sit in a gap between letters; skipping the even centres is the usual bug.</p>`,
      edges: `<p>Empty string: the loop never runs, the best length stays 0, and the slice returns an empty string. One character: its odd expansion gives length 1. All characters equal, like "aaaa": the centre in the middle of the string expands to the full length, and the odd and even expansions around it both stay in bounds because the loop checks the indexes first.</p>
<p>No repeated letters: every answer has length 1, and the strict comparison keeps the first character, which satisfies the leftmost rule. A palindrome touching either end of the string: the bounds check stops the expansion before reading outside the string. Two equal-length answers, as in "football" where "oo" and "ll" tie: the earlier centre wins, giving "oo".</p>`,
      followups: [
        "How would you solve it with a dynamic programming table, and what does it cost in memory?",
        "Can you reach O(n) time, and what does Manacher's algorithm track?",
        "How would you count all palindromic substrings instead of finding the longest?",
        "How would you find the longest palindromic subsequence, which is a different problem?",
        "What changes if the string is a stream and you must answer after each character?",
      ],
      slips: `<p>The most common slip is expanding only around single characters, which misses every even-length palindrome such as "abba". Next is the off-by-one when the loop ends: the window is one step too wide, so the length is <code>right - left - 1</code> and the start is <code>left + 1</code>.</p>
<p>Candidates also read outside the string by checking the characters before the bounds, replace the best on ties and break the leftmost rule, or build substrings with slice inside the loop, which quietly adds a factor of n. Another trap is describing the solution as dynamic programming and then writing the centre expansion; be clear that it is the centre idea, with the table as a different option.</p>`,
    },
    trace: {
      caption: 'String "football". Odd and even palindromes grown from each centre.',
      head: ["Centre", "Odd window", "Even window", "Best so far"],
      rows: [
        ["0 (f)", "f", "(empty)", "f"],
        ["1 (o)", "o", "oo", "oo"],
        ["2 (o)", "o", "(empty)", "oo"],
        ["3 (t)", "t", "(empty)", "oo"],
        ["4 (b)", "b", "(empty)", "oo"],
        ["5 (a)", "a", "(empty)", "oo"],
        ["6 (l)", "l", "ll", "oo"],
        ["7 (l)", "l", "(none)", "oo"],
      ],
    },
    complexity: { time: "O(n²)", space: "O(1) extra", brute: "O(n³)" },
    solution: {
      entry: "longestPalindrome",
      code: `function longestPalindrome(text) {
  let bestStart = 0;
  let bestLength = 0;

  function expand(left, right) {
    while (left >= 0 && right < text.length && text[left] === text[right]) {
      left--;
      right++;
    }
    const length = right - left - 1;
    if (length > bestLength) {
      bestLength = length;
      bestStart = left + 1;
    }
  }

  for (let centre = 0; centre < text.length; centre++) {
    expand(centre, centre);
    expand(centre, centre + 1);
  }
  return text.slice(bestStart, bestStart + bestLength);
}`,
      cases: [
        { args: ["football"], expected: "oo" },
        { args: [""], expected: "" },
        { args: ["a"], expected: "a" },
        { args: ["ab"], expected: "a" },
        { args: ["babad"], expected: "bab" },
        { args: ["cbbd"], expected: "bb" },
        { args: ["aaaa"], expected: "aaaa" },
        { args: ["cold"], expected: "c" },
        { args: ["bananas"], expected: "anana" },
        { args: ["racecar"], expected: "racecar" },
        { args: ["level noon"], expected: "level" },
        {
          args: [
            "civic kayak madam level stats racecar level cold kayak civic racecar madam refer stats madam level madam madam kayak banana kayak kayak madam kayak ",
          ],
          expected: " madam level madam ",
        },
      ],
    },
  },
  {
    id: "apple-top-k-frequent",
    company: "apple",
    title: "Top K Frequent Elements",
    prompt:
      "Given an array of integers and a number k, return the k distinct values that appear most often, in increasing order. The input is guaranteed to have a unique answer, so there is no tie at the cutoff. For nums [7, 2, 7, 5, 2, 7] and k = 2 the answer is [2, 7], because 7 appears three times and 2 appears twice. The array has up to 100,000 elements, and the selection should not sort every distinct value.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Heap or bucket sort over counts",
    patternId: "heap",
    leetcode: { number: 347, slug: "top-k-frequent-elements" },
    evidence: "guide",
    sources: [
      {
        label: "Jointaro: Apple software engineer experience with question list",
        url: "https://www.jointaro.com/interviews/companies/apple/work-experiences/software-engineer-new-york-ny-september-19-2025-5-7ac598dd/",
        kind: "company-list",
        year: 2025,
      },
      {
        label: "PracHub: 15 common Apple coding questions",
        url: "https://prachub.com/coding-questions/solve-15-common-apple-coding-questions",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-heaps-priority-queues", "dsa-hashing"],
    answer: {
      ask: `<p>I would ask: is k always between 1 and the number of distinct values? If two values tie at the cutoff, is any of them acceptable, or is the input guaranteed to avoid that? Can the numbers be negative or large? In what order should the result come back? And is the data an array in memory, or a stream I only see once?</p>
<p>I would assume an in-memory array, any integers, a unique answer, and that the result must come back in increasing order, so I will sort only the k chosen values at the end. I will count first, then choose how to select the top k.</p>`,
      brute: `<p>Count the occurrences with a Map, put the distinct values in an array, sort that array by count from high to low, and take the first k. It is simple and correct. Counting is O(n), and sorting d distinct values costs O(d log d), which is O(n log n) when most values are distinct.</p>
<p>At 100,000 elements this runs fast enough, so it is not wrong, but it does more work than necessary. It fully orders all d values when we only want the top k, and the stated goal is to avoid sorting every distinct value. On much larger inputs the logarithmic factor starts to matter, and a sort also needs all the counts to exist before it begins.</p>`,
      insight: `<p>A count can never be larger than n, so counts are small whole numbers, and we can sort them without comparing. Make an array of buckets indexed by count, where <code>buckets[c]</code> holds the values that appear exactly c times. Fill it from the count Map, then walk the buckets from the highest index down, collecting values until we have k of them.</p>
<p>Why it is right: walking from index n down visits values in non-increasing order of frequency. So after collecting k values we hold k values with counts at least as large as everything left behind. Because the answer is guaranteed unique, the cutoff never splits a bucket, so those k are exactly the answer. Every value goes into exactly one bucket and every bucket is touched once, so the whole thing is O(n) time and O(n) memory.</p>
<p>There is a second standard answer: a min-heap of size k. Push each distinct value with its count, and when the heap grows past k, pop the smallest count. The heap always holds the k most frequent values seen so far, which is the invariant. That costs O(n log k) and uses O(k) memory beyond the counts, so it is the better choice when k is tiny, the counts arrive as a stream, or the bucket array would be wasteful. JavaScript has no built-in heap, so in an interview you either write one or choose buckets.</p>
<p>Out loud: "count with a hash map, then bucket sort by frequency, because frequency is bounded by n."</p>`,
      walkthrough: `<p>The input is [7, 2, 7, 5, 2, 7] with k = 2. The first six rows build the count Map one element at a time; after the last read it holds 7 three times, 2 twice and 5 once.</p>
<p>Next the counts are turned into buckets: bucket 1 holds 5, bucket 2 holds 2 and bucket 3 holds 7. The scan starts at the highest index that can exist, 6, and passes over the empty buckets above 3 without any work worth showing, so the table begins at count 3. Bucket 3 gives 7, and bucket 2 gives 2, so the result has two values and we stop; bucket 1 is never read. The final row sorts the result into [2, 7] only so the output order is fixed. The heap version would instead hold 7 and 2 after reading all counts and would have discarded 5 along the way.</p>`,
      edges: `<p>k equal to the number of distinct values returns every distinct value, and the scan simply runs down to bucket 1. A single element returns itself. Negative numbers work because the Map accepts any key and the buckets are indexed by count, not by value. An empty array with k = 0 gives an empty result, since the loop stops immediately.</p>
<p>If every value appears once, all of them sit in bucket 1, and the guarantee of a unique answer means the caller then asks for all of them. If the answer were not unique, a bucket could be cut in the middle and the choice would be arbitrary, so I state that assumption early. The bucket array has n + 1 slots so that a value filling the whole array, with count n, still has a bucket.</p>`,
      followups: [
        "How would you do it with a size-k min-heap, and when is it better than buckets?",
        "How would you find the top k in a stream that does not fit in memory?",
        "How would you break ties by the smaller value, or by who appeared first?",
        "Can quickselect on the counts give O(n) average time, and what is the catch?",
        "How would a count-min sketch change the answer, and what accuracy do you give up?",
      ],
      slips: `<p>The most common slip is sorting the original array instead of the distinct values, or sorting the Map entries with a comparator that returns a boolean rather than a number, which gives a wrong order. Another is sizing the bucket array to the number of distinct values instead of n + 1, so a high count lands out of range.</p>
<p>With a heap, candidates push every distinct value into a max-heap one by one, which costs O(d log d) for d distinct values and gains nothing over sorting, or they forget to evict when the size passes k. Others use a plain object as the counter and get string keys back, so the output becomes strings instead of numbers. A last one is returning more than k values when the final bucket holds several, which the uniqueness guarantee rules out but a real interviewer may not.</p>`,
    },
    trace: {
      caption: "nums [7, 2, 7, 5, 2, 7], k = 2. Count first, then walk the buckets.",
      head: ["Step", "Counts so far", "Bucket scanned", "Picked"],
      rows: [
        ["read 7", "7:1", "-", "-"],
        ["read 2", "7:1, 2:1", "-", "-"],
        ["read 7", "7:2, 2:1", "-", "-"],
        ["read 5", "7:2, 2:1, 5:1", "-", "-"],
        ["read 2", "7:2, 2:2, 5:1", "-", "-"],
        ["read 7", "7:3, 2:2, 5:1", "-", "-"],
        ["make buckets", "1:[5] 2:[2] 3:[7]", "-", "-"],
        ["scan count 3", "same", "[7]", "7"],
        ["scan count 2", "same", "[2]", "7, 2"],
        ["sort output", "k reached", "stop", "2, 7"],
      ],
    },
    complexity: { time: "O(n) plus O(k log k) to sort the output", space: "O(n)", brute: "O(n log n)" },
    solution: {
      entry: "topKFrequent",
      code: `function topKFrequent(nums, k) {
  const counts = new Map();
  for (const value of nums) {
    counts.set(value, (counts.get(value) || 0) + 1);
  }

  const buckets = Array.from({ length: nums.length + 1 }, () => []);
  for (const [value, count] of counts) {
    buckets[count].push(value);
  }

  const result = [];
  for (let count = nums.length; count > 0 && result.length < k; count--) {
    for (const value of buckets[count]) {
      result.push(value);
    }
  }
  return result.sort((a, b) => a - b);
}`,
      cases: [
        { args: [[7, 2, 7, 5, 2, 7], 2], expected: [2, 7] },
        { args: [[1], 1], expected: [1] },
        { args: [[], 0], expected: [] },
        { args: [[1, 1, 1, 2, 2, 3], 2], expected: [1, 2] },
        { args: [[-1, -1, -2, -2, -2, 5], 2], expected: [-2, -1] },
        { args: [[4, 5, 6], 3], expected: [4, 5, 6] },
        { args: [[9, 9, 9, 9], 1], expected: [9] },
        { args: [[3, 0, 3, 0, 3, 1], 1], expected: [3] },
        { args: [[1, 2, 2, 3, 3, 3, 4, 4, 4, 4], 3], expected: [2, 3, 4] },
        { args: [[5, 5, 5, 8, 8, 1, 1, 1, 1, 9], 2], expected: [1, 5] },
        {
          args: [
            [
              0, 12, 1, 16, 10, 5, 24, 1, 7, 0, 7, 0, 9, 0, 0, 35, 16, 0, 0, 0, 9, 5, 19, 21, 0, 5, 3, 7, 2, 7, 0, 27,
              2, 18, 30, 7, 15, 19, 13, 2, 1, 0, 2, 39, 9, 4, 0, 5, 22, 39, 1, 27, 0, 8, 8, 0, 4, 0, 0, 39, 25, 0, 0,
              36, 11, 22, 4, 5, 0, 4, 1, 16, 0, 19, 3, 1, 38, 29, 25, 10, 14, 35, 2, 0, 10, 3, 2, 30, 2, 8, 1, 17, 8, 4,
              18, 7, 17, 24, 3, 1, 37, 0, 0, 15, 2, 33, 0, 10, 3, 15, 0, 0, 1, 19, 19, 0, 8, 5, 11, 1, 1, 8, 1, 0, 6, 0,
              7, 0, 0, 18, 0, 6, 28, 11, 4, 12, 1, 0, 16, 8, 32, 0, 1, 26, 29, 9, 14, 0, 0, 12, 7, 21, 0, 2, 35, 1, 30,
              0, 0, 0, 5, 1, 1, 26, 0, 0, 10, 8, 17, 29, 0, 1, 1, 1, 13, 30, 1, 2, 31, 21, 0, 3, 2, 9, 13, 13, 31, 10,
              0, 0, 34, 35, 0, 1, 11, 28, 10, 27, 15, 2, 3, 12, 0, 22, 21, 16, 35, 1, 32, 0, 3, 27, 16, 23, 18, 14, 0,
              8, 9, 3, 24, 17, 4, 10, 30, 0, 0, 0, 1, 0, 0, 1, 5, 15, 23, 5, 16, 38, 2, 0, 22, 10, 1, 0, 0, 13, 0, 12,
              23, 0, 15, 20, 7, 21, 38, 9, 0, 2, 30, 20, 22, 18, 0, 15, 0, 18, 13, 0, 1, 0, 3, 27, 4, 33, 4, 5, 17, 9,
              0, 0, 6, 4, 0, 32, 0, 15, 6, 21, 2, 1, 18, 0, 0, 5, 23, 0, 33, 0, 0, 10, 3, 4, 1, 0, 19, 15, 0, 23, 27,
              28, 22, 0, 4, 32, 20, 1, 38, 8, 2, 33, 29, 12, 2, 13, 20, 1, 27, 37, 32, 5, 7, 26, 5, 12, 15, 1, 0, 23, 0,
              6, 10, 5, 22, 32, 4, 0, 1, 26, 16, 5, 34, 3, 10, 0, 13, 6, 0, 0, 0, 1, 1, 9, 27, 2, 9, 25, 26, 0, 18, 0,
              0, 0, 26, 7, 28, 5, 6, 33, 32, 0, 5, 9, 7, 0, 4, 1, 0, 8, 6, 2, 15, 5, 6, 5, 9, 35, 1, 7, 0, 35,
            ],
            5,
          ],
          expected: [0, 1, 2, 4, 5],
        },
      ],
    },
  },
  {
    id: "apple-is-graph-bipartite",
    company: "apple",
    title: "Is Graph Bipartite?",
    prompt:
      "An undirected graph has nodes numbered 0 to n - 1 and is given as an adjacency list, where graph[i] holds the neighbours of node i. Decide whether the nodes can be split into two groups so that every edge joins a node of one group to a node of the other. For graph [[1, 2], [0, 2], [0, 1, 3], [2]], a triangle with a tail, the answer is false. The graph may be disconnected and has up to 10,000 nodes.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Graph two-colouring with BFS",
    patternId: "graph",
    leetcode: { number: 785, slug: "is-graph-bipartite" },
    evidence: "guide",
    sources: [
      {
        label: "PracHub: two-colourable graph question tagged Apple",
        url: "https://prachub.com/coding-questions/determine-whether-an-undirected-graph-is-two-colorable",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-graphs-representation-traversal", "dsa-graph-problems"],
    answer: {
      ask: `<p>I would ask: can the graph be disconnected, so that I must check every component? Can a node list itself as a neighbour, and can an edge be listed twice? Is the adjacency list guaranteed to be symmetric, so that if j is in graph[i] then i is in graph[j]? What should an empty graph or a graph with no edges return?</p>
<p>I would assume a symmetric list, possible disconnected components, and no promise about self loops, so I will handle them. An empty graph and a graph with no edges are both bipartite, so they return true. I will return a boolean and nothing else.</p>`,
      brute: `<p>The direct approach assigns each node to group A or group B in every possible way and checks that no edge has both ends in the same group. That is 2 to the power n assignments, each checked in O(n + e), so exponential in the number of nodes.</p>
<p>It is fine for 10 nodes and hopeless for 40, since 2 to the power 40 is about a trillion assignments. With 10,000 nodes it can never finish. The brute force also ignores that the assignment is not really free: once you place one node, every neighbour of that node is forced to the other group, so almost all of those assignments are doomed from the first step.</p>`,
      insight: `<p>The forcing is the whole idea. Put a start node in group 0. Every neighbour must then be in group 1, every neighbour of those must be in group 0, and so on. Inside one connected component there is no choice left: the first node's group fixes all the others, and swapping the two groups gives the only other valid answer. So one attempt per component is enough, and the work is a graph traversal.</p>
<p>Use breadth-first search with a colour array where -1 means unseen. When you pop a node and look at a neighbour, there are two cases. If the neighbour is unseen, give it the opposite colour and queue it. If it already has a colour, that colour must be the opposite of the current node's. If the colours are equal, an edge joins two nodes that the forcing put in the same group, so no valid split exists and we return false at once.</p>
<p>Why this is sufficient: if the whole traversal finishes with no conflict, every edge was examined from at least one end and found to join different colours, so the colouring is a valid split. Why a conflict is final: the colours were forced, not chosen, so no other colouring could do better. The same fact says a graph is bipartite exactly when it has no cycle of odd length.</p>
<p>The one loop that people drop is the outer one: after finishing a component, scan for the next unseen node and start again. A self loop is detected for free, because the neighbour of a node is itself and has the same colour. The pattern is graph two-colouring with BFS, O(V + E) time and O(V) memory. Out loud: "colour by BFS level parity, fail on a same-colour edge."</p>`,
      walkthrough: `<p>The graph is the triangle 0-1-2 with a tail 2-3. We start at node 0, give it colour 0, and queue it. Popping node 0 shows two uncoloured neighbours: node 1 gets colour 1 and node 2 gets colour 1, and both enter the queue. At this point the colour column reads "0 1 1 -".</p>
<p>Now pop node 1. Its neighbour 0 has colour 0, which differs from 1, so that edge is fine. Its other neighbour is node 2, and node 2 already has colour 1, the same as node 1. That edge joins two nodes in the same group, which proves an odd cycle, the triangle, so the function returns false immediately. Node 3 is never reached, and the answer does not depend on it. A bipartite graph, such as a square, would instead drain the queue with no conflict.</p>`,
      edges: `<p>No nodes: the outer loop does not run, so the result is true. A node with no neighbours: it is coloured and the inner loop is empty. Disconnected components: the outer loop starts a new traversal at every unseen node, and a failure in any one component fails the whole graph, including components that come after a bipartite one.</p>
<p>A self loop such as node 0 listing 0: the neighbour has the same colour as the node itself, so it returns false, which is correct because an edge cannot join a node to its own group. Duplicate neighbours are harmless since the second look sees opposite colours. Large trees and paths are bipartite, and a long chain does not overflow anything, because the queue is a plain array and not a recursion stack.</p>`,
      followups: [
        "How would you return the two groups instead of only a boolean?",
        "How would you solve it with union-find, and what do you store besides the parent?",
        "How would you return an odd cycle as proof when the answer is false?",
        "Does a depth-first version change the answer, and what is the stack risk?",
        "How does this relate to splitting people into two teams when some pairs dislike each other?",
      ],
      slips: `<p>The biggest slip is starting from node 0 only. If the graph has several components, the others are never checked and an odd cycle hides in one of them. The next is marking the colour when popping from the queue instead of when pushing, which lets one node be queued several times and can colour it twice with different values.</p>
<p>Candidates also compare the colour of the neighbour to a fixed number instead of to the current node, treat an already coloured neighbour as automatically fine, or use <code>queue.shift()</code> in a hot loop, which can make the traversal slow on large inputs; an index pointer avoids it. Finally, some report "false" as soon as they see any cycle, but even cycles are allowed: only odd cycles break the split.</p>`,
    },
    trace: {
      caption: "Graph [[1,2],[0,2],[0,1,3],[2]]. Colour -1 shown as a dash.",
      head: ["Node popped", "Neighbour", "Colours of 0..3", "Action"],
      rows: [
        ["start at 0", "-", "0 - - -", "colour 0, queue [0]"],
        ["0", "1 (unseen)", "0 1 - -", "colour 1, queue [1]"],
        ["0", "2 (unseen)", "0 1 1 -", "colour 1, queue [1, 2]"],
        ["1", "0 (colour 0)", "0 1 1 -", "differs, fine"],
        ["1", "2 (colour 1)", "0 1 1 -", "same as node 1: false"],
      ],
    },
    complexity: { time: "O(V + E)", space: "O(V)", brute: "O(2^V · (V + E))" },
    solution: {
      entry: "isBipartite",
      code: `function isBipartite(graph) {
  const colour = new Array(graph.length).fill(-1);

  for (let start = 0; start < graph.length; start++) {
    if (colour[start] !== -1) continue;
    colour[start] = 0;
    const queue = [start];

    for (let head = 0; head < queue.length; head++) {
      const node = queue[head];
      for (const next of graph[node]) {
        if (colour[next] === -1) {
          colour[next] = 1 - colour[node];
          queue.push(next);
        } else if (colour[next] === colour[node]) {
          return false;
        }
      }
    }
  }
  return true;
}`,
      cases: [
        { args: [[[1, 2], [0, 2], [0, 1, 3], [2]]], expected: false },
        { args: [[]], expected: true },
        { args: [[[]]], expected: true },
        { args: [[[], [], []]], expected: true },
        {
          args: [
            [
              [1, 3],
              [0, 2],
              [1, 3],
              [0, 2],
            ],
          ],
          expected: true,
        },
        {
          args: [
            [
              [1, 2],
              [0, 2],
              [0, 1],
            ],
          ],
          expected: false,
        },
        { args: [[[1], [0], [3, 4], [2, 4], [2, 3]]], expected: false },
        { args: [[[1], [0], [3], [2], []]], expected: true },
        { args: [[[0]]], expected: false },
        {
          args: [
            [
              [1, 4],
              [0, 2],
              [1, 3],
              [2, 4],
              [3, 0],
            ],
          ],
          expected: false,
        },
        {
          args: [
            [
              [1],
              [0, 2],
              [1, 3],
              [2, 4],
              [3, 5],
              [4, 6],
              [5, 7],
              [6, 8],
              [7, 9],
              [8, 10],
              [9, 11],
              [10, 12],
              [11, 13],
              [12, 14],
              [13, 15],
              [14, 16],
              [15, 17],
              [16, 18],
              [17, 19],
              [18, 20],
              [19, 21],
              [20, 22],
              [21, 23],
              [22, 24],
              [23, 25],
              [24, 26],
              [25, 27],
              [26, 28],
              [27, 29],
              [28, 30],
              [29, 31],
              [30, 32],
              [31, 33],
              [32, 34],
              [33, 35],
              [34, 36],
              [35, 37],
              [36, 38],
              [37, 39],
              [38, 40],
              [39, 41],
              [40, 42],
              [41, 43],
              [42, 44],
              [43, 45],
              [44, 46],
              [45, 47],
              [46, 48],
              [47, 49],
              [48, 50],
              [49, 51],
              [50, 52],
              [51, 53],
              [52, 54],
              [53, 55],
              [54, 56],
              [55, 57],
              [56, 58],
              [57, 59],
              [58, 60],
              [59, 61],
              [60, 62],
              [61, 63],
              [62, 64],
              [63, 65],
              [64, 66],
              [65, 67],
              [66, 68],
              [67, 69],
              [68, 70],
              [69, 71],
              [70, 72],
              [71, 73],
              [72, 74],
              [73, 75],
              [74, 76],
              [75, 77],
              [76, 78],
              [77, 79],
              [78, 80],
              [79, 81],
              [80, 82],
              [81, 83],
              [82, 84],
              [83, 85],
              [84, 86],
              [85, 87],
              [86, 88],
              [87, 89],
              [88, 90],
              [89, 91],
              [90, 92],
              [91, 93],
              [92, 94],
              [93, 95],
              [94, 96],
              [95, 97],
              [96, 98],
              [97, 99],
              [98, 100],
              [99, 101],
              [100, 102],
              [101, 103],
              [102, 104],
              [103, 105],
              [104, 106],
              [105, 107],
              [106, 108],
              [107, 109],
              [108, 110],
              [109, 111],
              [110, 112],
              [111, 113],
              [112, 114],
              [113, 115],
              [114, 116],
              [115, 117],
              [116, 118],
              [117, 119],
              [118, 120],
              [119, 121],
              [120, 122],
              [121, 123],
              [122, 124],
              [123, 125],
              [124, 126],
              [125, 127],
              [126, 128],
              [127, 129],
              [128, 130],
              [129, 131],
              [130, 132],
              [131, 133],
              [132, 134],
              [133, 135],
              [134, 136],
              [135, 137],
              [136, 138],
              [137, 139],
              [138, 140],
              [139, 141],
              [140, 142],
              [141, 143],
              [142, 144],
              [143, 145],
              [144, 146],
              [145, 147],
              [146, 148],
              [147, 149],
              [148, 150],
              [149, 151],
              [150, 152],
              [151, 153],
              [152, 154],
              [153, 155],
              [154, 156],
              [155, 157],
              [156, 158],
              [157, 159],
              [158, 160],
              [159, 161],
              [160, 162],
              [161, 163],
              [162, 164],
              [163, 165],
              [164, 166],
              [165, 167],
              [166, 168],
              [167, 169],
              [168, 170],
              [169, 171],
              [170, 172],
              [171, 173],
              [172, 174],
              [173, 175],
              [174, 176],
              [175, 177],
              [176, 178],
              [177, 179],
              [178, 180],
              [179, 181],
              [180, 182],
              [181, 183],
              [182, 184],
              [183, 185],
              [184, 186],
              [185, 187],
              [186, 188],
              [187, 189],
              [188, 190],
              [189, 191],
              [190, 192],
              [191, 193],
              [192, 194],
              [193, 195],
              [194, 196],
              [195, 197],
              [196, 198],
              [197, 199],
              [198],
            ],
          ],
          expected: true,
        },
        {
          args: [
            [
              [9, 45, 11, 37],
              [56],
              [15, 3, 5],
              [24, 22, 2],
              [17, 15, 9, 29],
              [26, 24, 12, 18, 38, 2],
              [49, 7],
              [14, 44, 6, 22],
              [53, 35, 29, 21],
              [0, 4],
              [19],
              [12, 0],
              [11, 21, 5, 33],
              [30],
              [59, 7, 49, 57],
              [4, 2],
              [17, 31, 53],
              [4, 16, 32],
              [53, 29, 5, 49],
              [30, 10, 26, 20, 50],
              [19, 51],
              [8, 56, 12, 32, 58],
              [29, 39, 45, 3, 7, 55],
              [30],
              [51, 3, 27, 5, 41, 31, 53],
              [30, 58],
              [5, 19, 31, 55],
              [24],
              [53, 29],
              [18, 22, 8, 42, 40, 46, 28, 34, 4],
              [19, 23, 13, 25],
              [16, 26, 48, 24],
              [57, 17, 47, 21],
              [44, 12, 54, 38],
              [39, 57, 29],
              [8, 50],
              [37, 47],
              [36, 0],
              [41, 33, 5],
              [44, 40, 22, 34, 58],
              [39, 29, 47],
              [38, 24, 44],
              [29],
              [],
              [33, 39, 7, 41],
              [0, 22],
              [29],
              [36, 40, 32, 54],
              [31],
              [6, 14, 18],
              [35, 19],
              [24, 20, 56],
              [],
              [18, 8, 28, 16, 24],
              [47, 33],
              [22, 26],
              [21, 1, 51],
              [32, 34, 14],
              [39, 21, 25],
              [14],
            ],
          ],
          expected: true,
        },
        {
          args: [
            [
              [33, 21, 19, 2],
              [30, 12],
              [51, 23, 19, 59, 33, 11, 0],
              [22, 52, 4, 56],
              [55, 53, 3, 13, 39],
              [52, 36, 22],
              [27, 49],
              [16, 38],
              [57, 35],
              [44, 22],
              [],
              [20, 28, 18, 2],
              [1],
              [28, 40, 18, 4],
              [37, 53, 51],
              [36, 56, 32, 58, 18],
              [37, 7],
              [38, 52, 54],
              [43, 51, 35, 29, 11, 13, 33, 15],
              [2, 0, 52, 42, 56],
              [11, 55, 47],
              [54, 0, 56],
              [3, 49, 5, 9],
              [2],
              [43],
              [36],
              [33, 51],
              [32, 6],
              [11, 13, 33, 49],
              [38, 18, 58, 44],
              [1],
              [],
              [27, 15, 43],
              [26, 0, 18, 28, 2],
              [43, 59, 51],
              [18, 42, 8, 48],
              [15, 5, 25],
              [14, 16, 54],
              [17, 29, 55, 7, 47],
              [42, 4],
              [13, 49],
              [],
              [39, 47, 45, 35, 19, 43],
              [18, 34, 24, 32, 42],
              [9, 29],
              [42, 56],
              [],
              [42, 20, 38],
              [57, 51, 35],
              [22, 56, 40, 6, 28],
              [],
              [18, 2, 48, 34, 14, 26],
              [5, 3, 17, 19],
              [4, 14],
              [21, 37, 17],
              [4, 20, 38],
              [15, 49, 45, 21, 3, 19],
              [8, 48],
              [59, 15, 29],
              [58, 34, 2],
            ],
          ],
          expected: false,
        },
      ],
    },
  },
  {
    id: "apple-number-of-islands",
    company: "apple",
    title: "Number of Islands",
    prompt:
      "A grid holds 1 for land and 0 for water. An island is a group of land cells joined through shared sides (up, down, left or right, never diagonally), and you must return how many islands the grid contains. For the grid [[1, 1, 0, 0], [0, 1, 0, 1], [1, 0, 0, 1]] the answer is 3. The grid is a rectangle of up to 300 rows and 300 columns.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Grid DFS or BFS",
    patternId: "graph",
    leetcode: { number: 200, slug: "number-of-islands" },
    evidence: "guide",
    sources: [
      {
        label: "PracHub: count islands question tagged Apple",
        url: "https://prachub.com/coding-questions/count-islands-in-a-binary-grid-2",
        kind: "company-list",
        year: 2026,
      },
    ],
    chapters: ["dsa-grid-bfs", "dsa-graphs-representation-traversal"],
    answer: {
      ask: `<p>I would ask: do diagonal neighbours count as connected, or only the four side neighbours? Are the cells numbers or the characters "0" and "1"? Is every row the same length? Can the grid be empty, or have empty rows? And am I allowed to change the input grid, or must it come back untouched?</p>
<p>I would assume four-way connection, rectangular grids, and numbers 0 and 1. An empty grid has zero islands. I will not modify the input; I will keep a separate visited table, and mention that overwriting land with water is a common memory-saving alternative if mutation is allowed.</p>`,
      brute: `<p>One naive approach floods outward from every land cell, collects the cells it reaches, and counts the distinct islands by remembering some canonical cell of each, such as the smallest index. Nothing is remembered between floods, so an island with s cells is explored s times, each time touching s cells.</p>
<p>That makes the work O(s²) for one island and up to O((m times n)²) for a grid dominated by a single island. A 300 by 300 grid of all land has 90,000 cells, so the total is around eight billion cell visits. A cheaper wrong idea is to count land cells that have no land neighbour above or to the left, which miscounts any U-shaped island because its two arms look like separate starts.</p>`,
      insight: `<p>Each island is a connected component of land cells, so the question is "how many components", which is the standard flood-fill problem. Scan the grid in order. When you meet a land cell that has not been seen, you have found an island you have not counted yet, because every island you counted earlier has already been fully marked. Count it, then flood-fill from that cell and mark every connected land cell as seen so the scan will skip them.</p>
<p>The invariant is: after each flood, all cells of that island are marked, so an unseen land cell found later must belong to a new island. That is the full proof, and it is also why you can stop worrying about double counting. The flood itself can be depth-first or breadth-first; both visit exactly the same set of cells.</p>
<p>The detail that separates a working solution from one that crashes is the stack. A recursive flood on a 300 by 300 snake-shaped island recurses up to 90,000 levels deep, which overflows the JavaScript call stack. So I use an explicit stack in a loop and mark a cell as seen when I push it, not when I pop it. Marking at push time keeps each cell in the stack at most once.</p>
<p>Every cell is scanned once and examined by its four neighbours at most four times, so the time is O(m times n), and the seen table and stack use O(m times n) memory. Out loud: "connected components by grid flood fill, one count per unseen land cell."</p>`,
      walkthrough: `<p>The grid has three rows and four columns: land at (0,0), (0,1), (1,1), (1,3), (2,0) and (2,3). The scan reaches (0,0) first. It is land and unseen, so the count becomes 1 and the flood marks (0,0), then (0,1), then (1,1). Those three cells are one island.</p>
<p>The scan then passes (0,1) through (1,2); each of those is already marked or water, and the count stays at 1. At (1,3) it finds fresh land, so the count becomes 2, and the flood takes (1,3) and (2,3). Finally it reaches (2,0): its only neighbours, (1,0) and (2,1), are water. The cell (1,1) touches it only diagonally, and diagonals do not count, so this is a third island. The rest of the scan finds nothing new, and the answer is 3, as the last row of the table shows.</p>`,
      edges: `<p>An empty grid has no rows, so the outer loop never runs and the answer is 0. A grid with empty rows has no columns to scan, which gives 0 as well. A grid of all water gives 0, a grid of all land gives 1, and a single land cell gives 1. A checkerboard has every land cell alone, because its neighbours are diagonal, so the count equals the number of land cells.</p>
<p>Non-square grids work because the bounds checks use the row count for the row index and the length of that row for the column index. A very long snake does not blow the stack because the flood is iterative. A U-shaped island is counted once: the first arm starts the flood and the flood reaches the second arm through the bottom. Cells on the border are protected by the bounds test, which runs before any read of the grid.</p>`,
      followups: [
        "How would you count islands if the grid arrives as a stream of changes, one cell turning to land at a time?",
        "How would you find the area of the largest island?",
        "How would you solve it with union-find, and when is that the better tool?",
        "How would you count distinct island shapes, treating translated copies as equal?",
        "What changes if diagonals count as connected?",
      ],
      slips: `<p>The most common slip is recursion depth: a recursive flood passes the small tests and then crashes on a large snake of land. The next is forgetting to mark visited cells, which makes the flood loop forever between two neighbours, or marking only when popping, which pushes the same cell many times.</p>
<p>Candidates also count land cells instead of components, let diagonals connect cells, or mix up rows and columns in the bounds check, which only shows on a non-square grid. Another is mutating the input without saying so. And a classic interview slip is writing the flood and forgetting to increment the island count exactly once per flood, at the place where it starts.</p>`,
    },
    trace: {
      caption: "Grid [[1,1,0,0],[0,1,0,1],[1,0,0,1]]. Cells are written (row, column).",
      head: ["Scan reaches", "State of the cell", "Islands", "Flood marks"],
      rows: [
        ["(0,0)", "land, unseen: new island", "1", "(0,0) (0,1) (1,1)"],
        ["(0,1) to (1,2)", "seen or water: skip", "1", "none"],
        ["(1,3)", "land, unseen: new island", "2", "(1,3) (2,3)"],
        ["(2,0)", "land, unseen: new island", "3", "(2,0)"],
        ["(2,1) to (2,3)", "water or seen: skip", "3", "none"],
      ],
    },
    complexity: { time: "O(m · n)", space: "O(m · n)", brute: "O((m · n)²)" },
    solution: {
      entry: "numIslands",
      code: `function numIslands(grid) {
  const rows = grid.length;
  const seen = grid.map((row) => row.map(() => false));
  const steps = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let islands = 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== 1 || seen[r][c]) continue;
      islands++;
      seen[r][c] = true;
      const stack = [[r, c]];
      while (stack.length > 0) {
        const [row, col] = stack.pop();
        for (const [dr, dc] of steps) {
          const nr = row + dr;
          const nc = col + dc;
          const inside = nr >= 0 && nr < rows && nc >= 0 && nc < grid[nr].length;
          if (inside && grid[nr][nc] === 1 && !seen[nr][nc]) {
            seen[nr][nc] = true;
            stack.push([nr, nc]);
          }
        }
      }
    }
  }
  return islands;
}`,
      cases: [
        {
          args: [
            [
              [1, 1, 0, 0],
              [0, 1, 0, 1],
              [1, 0, 0, 1],
            ],
          ],
          expected: 3,
        },
        { args: [[]], expected: 0 },
        { args: [[[]]], expected: 0 },
        { args: [[[0]]], expected: 0 },
        { args: [[[1]]], expected: 1 },
        {
          args: [
            [
              [1, 1, 1],
              [1, 1, 1],
              [1, 1, 1],
            ],
          ],
          expected: 1,
        },
        {
          args: [
            [
              [1, 0, 1, 0],
              [0, 1, 0, 1],
              [1, 0, 1, 0],
              [0, 1, 0, 1],
            ],
          ],
          expected: 8,
        },
        {
          args: [
            [
              [1, 0, 1],
              [1, 1, 1],
            ],
          ],
          expected: 1,
        },
        { args: [[[1, 0, 1, 0, 1]]], expected: 3 },
        { args: [[[1], [0], [1], [1]]], expected: 2 },
        {
          args: [
            [
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
              [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
              [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            ],
          ],
          expected: 1,
        },
        {
          args: [
            [
              [
                1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0,
                1, 1, 0, 0, 0,
              ],
              [
                1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 1, 1, 1, 0, 0, 0, 1,
                1, 1, 0, 0, 1,
              ],
              [
                1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0,
                1, 0, 0, 0, 0,
              ],
              [
                0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0,
                0, 1, 0, 0, 1,
              ],
              [
                0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0,
                0, 1, 0, 1, 0,
              ],
              [
                0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0,
                1, 1, 1, 1, 1,
              ],
              [
                1, 1, 0, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0,
                0, 0, 1, 0, 1,
              ],
              [
                0, 0, 0, 1, 0, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 1,
                1, 1, 1, 0, 0,
              ],
              [
                0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1, 1, 1, 1, 0,
                0, 0, 0, 1, 1,
              ],
              [
                1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0,
                1, 0, 0, 1, 0,
              ],
              [
                1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0,
                0, 1, 1, 0, 0,
              ],
              [
                0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1,
                0, 1, 1, 0, 1,
              ],
              [
                1, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1,
                1, 1, 0, 1, 1,
              ],
              [
                1, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 0,
                1, 1, 0, 0, 0,
              ],
              [
                1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0,
                0, 0, 1, 0, 0,
              ],
              [
                0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 1, 1, 1, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0,
                1, 1, 0, 1, 1,
              ],
              [
                1, 1, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0,
                1, 0, 0, 1, 1,
              ],
              [
                1, 0, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 1, 1, 1, 0,
                1, 0, 0, 0, 0,
              ],
              [
                1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 1, 1, 0, 1, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1,
                1, 0, 1, 1, 1,
              ],
              [
                1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0,
                0, 0, 0, 0, 0,
              ],
              [
                1, 0, 1, 0, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 1, 0,
                1, 0, 1, 1, 0,
              ],
              [
                0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0,
                0, 1, 0, 1, 1,
              ],
              [
                0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0,
                1, 0, 0, 0, 1,
              ],
              [
                0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1,
                0, 1, 0, 0, 0,
              ],
              [
                0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 1,
                1, 1, 0, 0, 0,
              ],
              [
                0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 1, 0, 1, 1, 1, 1, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0,
                0, 0, 1, 0, 0,
              ],
              [
                1, 0, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 0, 0, 0,
                0, 1, 0, 1, 1,
              ],
              [
                0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 0, 1, 1, 0, 1, 1, 0, 0, 1,
                0, 1, 0, 1, 1,
              ],
              [
                0, 1, 1, 0, 0, 1, 1, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0,
                1, 1, 0, 0, 0,
              ],
              [
                1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 1, 1, 0, 0, 1,
                0, 1, 0, 0, 0,
              ],
            ],
          ],
          expected: 125,
        },
      ],
    },
  },
];
