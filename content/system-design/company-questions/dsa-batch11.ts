import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "zerodha-maximum-subarray",
    company: "zerodha",
    title: "Maximum Subarray Sum",
    prompt:
      "Given an array of integers that may hold negatives and zeros, return the largest sum of any non-empty run of consecutive elements. For [-2,1,-3,4,-1,2,1,-5,4] the answer is 6, from the run 4,-1,2,1. The array holds up to 100,000 values, so adding up every possible run separately is too slow. This is a guide level question: a prep guide names it as its example array problem for Zerodha, and no candidate report of it was found.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Kadane's running sum",
    patternId: "dp",
    leetcode: { number: 53, slug: "maximum-subarray" },
    evidence: "guide",
    sources: [
      {
        label: "Zerodha Recruitment Process: DSA topics and example questions (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/zerodha-recruitment-process/",
        kind: "prep-guide",
        year: 2024,
      },
    ],
    chapters: ["dsa-arrays-strings", "dsa-dp-1d"],
    answer: {
      ask: `<p>First I would be straight about the source: one prep guide names Kadane's algorithm as its example array question for Zerodha, but no candidate report of it turned up, so treat it as a standard question worth knowing cold, not as something reported. Then I would pin the problem down. Must the run be non-empty? (Yes, so an all-negative array answers with its largest single element, not 0.) Do I return only the sum or also the positions? Can values be zero or negative? How large can the array get, and can the total overflow?</p>
<p>Assumptions I would state: the array has at least one element, the run needs at least one element, only the sum is returned, and totals stay inside a JavaScript number, which is exact up to about nine quadrillion.</p>`,
      brute: `<p>Try every start and every end and add up the run between them. Re-adding each run from scratch is O(n³). Keeping a running sum while the end moves right makes each new end cost one addition, which brings it to O(n²), about five billion additions at n = 100,000. That is too slow.</p>
<p>The waste is that the best run ending at position i is closely related to the best run ending at i-1, yet the double loop rebuilds it from every possible start. Prefix sums describe the same waste: the best run ending at i is the prefix up to i minus the smallest earlier prefix, and that smallest prefix can be carried along instead of searched for each time.</p>`,
      insight: `<p>The pattern is a <b>running best that ends here</b>, known as Kadane's algorithm, and it is one-dimensional dynamic programming. Let ending[i] be the largest sum of a run that must end exactly at index i. A run ending at i is either the single element nums[i] or a run ending at i-1 extended by nums[i], so ending[i] = max(nums[i], ending[i-1] + nums[i]). The answer is the largest ending[i], because the best run has to end somewhere.</p>
<p>Read the max as a decision. If the best run ending at i-1 is negative, extending it can only lose value, so drop it and start fresh at i. If it is zero or positive, keep extending. The decision depends only on ending[i-1], so one variable replaces the whole array and the space is constant.</p>
<p>Why is it correct? By induction, ending[i-1] is exactly the best run ending at i-1. Every run ending at i is either the lone element or some run ending at i-1 plus nums[i]. Adding the same number to every candidate keeps the best candidate on top, so the larger of the two options is the best run ending at i. Taking the maximum over all end positions then covers every possible run.</p>
<p>Out loud: "At each element I either start over or extend, whichever is larger, and I remember the biggest value I have seen." Start both variables at the first element, not at zero, so an all-negative array returns its largest element instead of 0.</p>`,
      walkthrough: `<p>Run it on [-2,1,-3,4,-1,2,1,-5,4]. Both variables start at the first element, -2. At index 1 the value 1 beats -2 + 1 = -1, so the running sum restarts at 1 and best becomes 1. At index 2, 1 + -3 = -2 beats -3, so the run keeps extending, but best stays 1.</p>
<p>Index 3 is the turning point: 4 beats -2 + 4 = 2, so a fresh start is better, and best becomes 4. Indexes 4 to 6 extend the run by -1, 2 and 1, giving 3, 5 and 6, and best reaches 6. Index 7 adds -5 and the running sum drops to 1, index 8 lifts it to 5, and neither beats 6. The answer is 6, from the run 4, -1, 2, 1.</p>`,
      edges: `<p><b>All negative values:</b> the answer is the largest single element. That works because both variables start at the first element and the restart option nums[i] is always available.</p>
<ul>
  <li><b>Single element:</b> the loop body never runs and that element is returned.</li>
  <li><b>Zeros:</b> a zero can sit inside the best run or not without changing the sum, so ties are harmless.</li>
  <li><b>All positive values:</b> the running sum never restarts and the answer is the total.</li>
  <li><b>Empty array:</b> not valid input here, and the code would return undefined. Agree on 0, a thrown error or a guarantee of at least one element.</li>
  <li><b>Large totals:</b> sums are exact in a JavaScript number up to about 9 quadrillion. In a language with 32-bit integers, use a 64-bit sum.</li>
</ul>`,
      followups: [
        "How would you also return the start and end positions of the best run, and which run would you report when two runs tie?",
        "How would the answer change if the array is circular, so a run may wrap from the end back to the start?",
        "How would you answer this for many range queries with point updates, using a segment tree that stores each segment's total, best prefix, best suffix and best run?",
        "How would you handle the extra rule that the run must contain at least k elements?",
      ],
      slips: `<p>The usual slip is starting the best answer at 0. An all-negative array then returns 0, a total that no non-empty run can reach.</p>
<ul>
  <li>Returning the running sum instead of the best seen so far, which loses a good run as soon as a later negative value shortens it.</li>
  <li>Updating best before updating the running sum, so best lags one element behind.</li>
  <li>Writing the double loop and then being unable to say which work it repeats.</li>
  <li>Confusing it with the maximum product subarray, where a negative value can turn the smallest product into the largest and two values must be tracked.</li>
  <li>Treating the problem as "sum the positives", which ignores that the run has to be contiguous.</li>
</ul>`,
    },
    trace: {
      caption: "Running sum and best so far for [-2,1,-3,4,-1,2,1,-5,4].",
      head: ["Index", "Value", "Best ending here", "Best so far"],
      rows: [
        ["0", "-2", "-2", "-2"],
        ["1", "1", "1", "1"],
        ["2", "-3", "-2", "1"],
        ["3", "4", "4", "4"],
        ["4", "-1", "3", "4"],
        ["5", "2", "5", "5"],
        ["6", "1", "6", "6"],
        ["7", "-5", "1", "6"],
        ["8", "4", "5", "6"],
      ],
    },
    complexity: { time: "O(n)", space: "O(1)", brute: "O(n²), or O(n³) if each run is re-added" },
    solution: {
      entry: "maxSubarray",
      code: `function maxSubarray(nums) {
  let best = nums[0];
  let running = nums[0];
  for (let i = 1; i < nums.length; i++) {
    running = Math.max(nums[i], running + nums[i]);
    best = Math.max(best, running);
  }
  return best;
}`,
      cases: [
        { args: [[-2, 1, -3, 4, -1, 2, 1, -5, 4]], expected: 6 },
        { args: [[1]], expected: 1 },
        { args: [[5, 4, -1, 7, 8]], expected: 23 },
        { args: [[-3, -1, -2]], expected: -1 },
        { args: [[0, 0, 0]], expected: 0 },
        { args: [[-1]], expected: -1 },
        { args: [[2, -1, 2, -1, 2]], expected: 4 },
        { args: [[-2, -1]], expected: -1 },
        { args: [[8, -19, 5, -4, 20]], expected: 21 },
        { args: [[-5, 3, -1, 2, -10, 4]], expected: 4 },
        { args: [[1, 2, 3]], expected: 6 },
        { args: [[-1, 0, -2]], expected: 0 },
        { args: [[3, -4, 5]], expected: 5 },
        { args: [[100000, -1, 100000, -300000, 7]], expected: 199999 },
      ],
    },
  },
  {
    id: "zerodha-validate-bst",
    company: "zerodha",
    title: "Validate a Binary Search Tree",
    prompt:
      "A binary tree arrives in level-order form, with null marking a missing child. Decide whether it is a valid binary search tree: for every node, all values in its left subtree must be strictly smaller and all values in its right subtree strictly larger, so duplicates make a tree invalid. For [10,5,15,null,null,6,20] the answer is false, because 6 is a fine left child of 15 yet sits in the right subtree of 10 while being smaller than 10. The tree has up to 100,000 nodes and may be a long chain. This is a guide level question: a prep guide gives it as its tree example for Zerodha, and no candidate report of it was found.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Tree walk with value bounds",
    patternId: "tree",
    leetcode: { number: 98, slug: "validate-binary-search-tree" },
    evidence: "guide",
    sources: [
      {
        label: "Zerodha Recruitment Process: DSA topics and example questions (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/zerodha-recruitment-process/",
        kind: "prep-guide",
        year: 2024,
      },
    ],
    chapters: ["dsa-trees", "dsa-tree-problems", "dsa-bst-operations"],
    answer: {
      ask: `<p>I would start with the source: a prep guide lists this as its tree example for Zerodha, but I found no candidate report of it, so this is guide level practice on a standard question, not a reported one. Then the problem itself. Are duplicates allowed? (Here no, both sides are strict.) Is an empty tree valid? (Yes.) Can values be at the extremes of the integer range? How deep can the tree get, because a chain of 100,000 nodes would overflow a recursive walk in some languages?</p>
<p>Assumptions I would state: strict ordering on both sides, an empty tree is valid, values can be any integers, and the tree arrives as a level-order array that I turn into nodes first.</p>`,
      brute: `<p>The direct reading of the rule is to check it node by node: for each node, scan its whole left subtree for a value that is not smaller and its whole right subtree for a value that is not larger. That is correct, but on a chain of 100,000 nodes the subtree sizes are 100,000, 99,999 and so on, around five billion steps in total, so O(n²).</p>
<p>The tempting shortcut is to compare each node only with its two children. It is fast and wrong: in the example, 6 is a valid child of 15, yet the tree is invalid. The rule is about whole subtrees, so information about ancestors has to travel downward.</p>`,
      insight: `<p>The pattern is a <b>tree walk that carries the allowed range</b>. Every node must lie strictly between a low bound and a high bound. The root has no bounds. When we step to a left child, the high bound becomes the parent's value. When we step to a right child, the low bound becomes the parent's value. The other bound is inherited unchanged. A node is fine exactly when low &lt; value &lt; high, treating a missing bound as no limit.</p>
<p>Why is that enough? The BST rule says that for every ancestor a, the node is smaller than a if it lies in a's left subtree and larger than a if it lies in a's right subtree. Along the path from the root, the tightest upper limit is the nearest ancestor we turned left at, and the tightest lower limit is the nearest ancestor we turned right at. The bounds only ever narrow as we go down, so checking against the tightest pair also enforces every looser one.</p>
<p>I keep a missing bound as null instead of a huge number. A sentinel such as the largest integer would wrongly reject a tree whose node holds that very value. An explicit stack replaces recursion, so a chain of 100,000 nodes is safe, and pushing the right child before the left one makes the left side run first. The walk stops at the first violation it meets.</p>
<p>Out loud: "Each node carries the interval it must fall inside. Going left tightens the top of the interval, going right tightens the bottom."</p>`,
      walkthrough: `<p>Take [10,5,15,null,null,6,20]. The root 10 has no bounds and passes. Its left child 5 must be below 10 and passes. Its right child 15 must be above 10 and passes. Now 15's left child 6 is visited, and its interval is the low bound 10 from the root and the high bound 15 from its parent. Since 6 is not above 10, the walk stops and returns false. Node 20 is never checked.</p>
<p>A local check would have accepted 6, because 6 is below its parent 15. Only the bound inherited from the root catches it.</p>`,
      edges: `<p><b>Empty tree:</b> an empty array, or an array whose first value is null, is valid.</p>
<ul>
  <li><b>Single node:</b> no bounds apply, so it is valid.</li>
  <li><b>Duplicates:</b> an equal value on either side fails because both comparisons are strict, so [2,2,2] is invalid.</li>
  <li><b>Extreme values:</b> missing bounds are null, so a node holding the smallest or largest integer is still handled.</li>
  <li><b>Long chains:</b> the explicit stack means depth cannot overflow the call stack. A chain that always goes right never holds more than one pending node.</li>
  <li><b>Violation deep in a branch:</b> a node far below an ancestor that it breaks is caught, as 6 is in the example, because bounds travel with the walk.</li>
</ul>`,
      followups: [
        "How would you solve it with an in-order traversal, and what must you remember between steps to detect a duplicate?",
        "How would you repair a tree in which exactly two nodes were swapped by mistake, without changing its shape?",
        "How would you return the size of the largest subtree that is itself a valid BST?",
        "How would the check change if duplicates were allowed on the left side only?",
      ],
      slips: `<p>The classic slip is comparing a node only with its own children, which accepts trees where a deep node breaks an ancestor's rule.</p>
<ul>
  <li>Using less-or-equal where the rule is strict, which accepts duplicates.</li>
  <li>Using the integer limits as stand-in bounds, which fails for a node holding exactly that limit.</li>
  <li>Updating only one bound when moving down, for example passing the parent's value as the new low bound when going left.</li>
  <li>Checking that the left child is smaller and the right child is larger, then recursing without passing any bounds.</li>
  <li>Recursing on a 100,000-node chain in a language with a small call stack.</li>
</ul>`,
    },
    trace: {
      caption: "Nodes visited and the interval each must fall inside, for [10,5,15,null,null,6,20].",
      head: ["Step", "Node", "Low", "High", "Verdict"],
      rows: [
        ["1", "10", "none", "none", "ok"],
        ["2", "5", "none", "10", "ok"],
        ["3", "15", "10", "none", "ok"],
        ["4", "6", "10", "15", "fails: 6 <= 10"],
      ],
    },
    complexity: { time: "O(n)", space: "O(h) for the walk, O(n) with the built tree", brute: "O(n²)" },
    solution: {
      entry: "isValidBst",
      code: `function isValidBst(values) {
  if (values.length === 0 || values[0] === null) return true;
  const pending = [{ node: buildTree(values), low: null, high: null }];
  while (pending.length > 0) {
    const { node, low, high } = pending.pop();
    if (low !== null && node.val <= low) return false;
    if (high !== null && node.val >= high) return false;
    if (node.right !== null) pending.push({ node: node.right, low: node.val, high });
    if (node.left !== null) pending.push({ node: node.left, low, high: node.val });
  }
  return true;
}

function buildTree(values) {
  const root = { val: values[0], left: null, right: null };
  const waiting = [root];
  let next = 1;
  for (let head = 0; head < waiting.length && next < values.length; head++) {
    for (const side of ["left", "right"]) {
      if (next >= values.length) break;
      const value = values[next++];
      if (value === null) continue;
      waiting[head][side] = { val: value, left: null, right: null };
      waiting.push(waiting[head][side]);
    }
  }
  return root;
}`,
      cases: [
        { args: [[2, 1, 3]], expected: true },
        { args: [[5, 1, 4, null, null, 3, 6]], expected: false },
        { args: [[]], expected: true },
        { args: [[1]], expected: true },
        { args: [[2, 2, 2]], expected: false },
        { args: [[10, 5, 15, null, null, 6, 20]], expected: false },
        { args: [[8, 3, 10, 1, 6, null, 14, null, null, 4, 7, 13]], expected: true },
        { args: [[5, 4, 6, null, null, 3, 7]], expected: false },
        { args: [[0, -1]], expected: true },
        { args: [[-2147483648, null, 2147483647]], expected: true },
        { args: [[1, null, 1]], expected: false },
        { args: [[1, null, 2, null, 3, null, 4]], expected: true },
        { args: [[5, null, 4]], expected: false },
        { args: [[10, 5, 15, 3, 12]], expected: false },
        { args: [[3, 1, 5, 0, 2, 4, 6]], expected: true },
        { args: [[2147483647, 2147483647]], expected: false },
      ],
    },
  },
  {
    id: "zerodha-remove-nth-from-end",
    company: "zerodha",
    title: "Remove the Nth Node From the End of a Linked List",
    prompt:
      "You get a singly linked list, written here as an array from head to tail, and a number n. Delete the node that is n places from the tail, where n = 1 means the last node, and return the list that remains. For [1,2,3,4,5] and n = 2 the result is [1,2,3,5]. You may assume 1 <= n <= length, and the list can hold up to 100,000 nodes. The list does not store its length and cannot be walked backwards, so aim to do it in a single pass. This is a guide level question: prep guides list it among Zerodha linked-list topics, and no candidate report of it was found.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Two pointers with a fixed gap",
    patternId: "list",
    leetcode: { number: 19, slug: "remove-nth-node-from-end-of-list" },
    evidence: "guide",
    sources: [
      {
        label: "Zerodha Recruitment Process: DSA topics and example questions (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/zerodha-recruitment-process/",
        kind: "prep-guide",
        year: 2024,
      },
      {
        label: "Zerodha Onsite Interview: Every Round, What It Tests (SpaceComplexity)",
        url: "https://spacecomplexity.ai/blog/zerodha-onsite-interview",
        kind: "prep-guide",
        year: 2026,
      },
    ],
    chapters: ["dsa-linked-lists", "dsa-two-pointers"],
    answer: {
      ask: `<p>I would say up front that the prep guides I found list this among Zerodha linked-list topics, while no candidate report of it turned up, so it is guide level practice on a standard question. Then I would ask: is n always valid, between 1 and the length? (I assume yes.) May the head itself be the node to remove? Do I modify the list in place and return its head? Does the list store its length? Can I walk it twice, or is one pass required? Values may repeat, and the target is chosen by position, never by value.</p>
<p>Assumptions I would state: n is valid, removal is in place, the length is unknown, and one pass is the goal even though two passes would also be correct.</p>`,
      brute: `<p>Counting from the end for every node is the slowest reading: for each node, walk to the tail to learn its distance, which is O(L²) for a list of L nodes. The natural improvement is two passes. First walk the list to count its length L, then walk again to the node at position L - n - 1 and unlink the node after it, with a special case when the head itself must go.</p>
<p>That is O(L) time and O(1) space and is a fully acceptable first answer. Its weaknesses are the two traversals, which matter if the list arrives as a stream you can read only once, and the special case for removing the head. The one-pass version below removes both.</p>`,
      insight: `<p>The pattern is <b>two pointers with a fixed gap</b>. Place a dummy node in front of the head, so the head is no longer special, and start two pointers there, called ahead and behind. Move ahead forward n steps. Now ahead is n nodes in front of behind. Move both one step at a time until ahead is standing on the last node. The gap never changes, so behind is then n nodes before the last one, which makes behind the node just before the target.</p>
<p>Count it to be sure. Number the dummy 0 and the nodes 1 to L. When ahead stands at L, behind stands at L - n, and the node after it, at L - n + 1, is the n-th from the end: n = 1 gives L, the last node. Unlinking is a single assignment, behind.next = behind.next.next, and the result is read from dummy.next.</p>
<p>Why the dummy? If n equals L, the target is the head, so there is no real node before it. With the dummy, behind ends on the dummy and the same assignment drops the head. No case split and no null checks are needed, which is where most bugs on this problem live.</p>
<p>Out loud: "I let one pointer get a head start of n nodes, then move both together. When the leader reaches the end, the follower is exactly one node before the one to delete."</p>`,
      walkthrough: `<p>Take [1,2,3,4,5] with n = 2. Both pointers start on the dummy. Ahead walks two steps and lands on node 2, while behind stays on the dummy. Now both advance while ahead has a next node. Ahead moves to 3 and behind to node 1, then ahead to 4 and behind to 2, then ahead to 5 and behind to 3.</p>
<p>Ahead has no next node, so the walk stops with behind on node 3. Node 3's next is 4, the second node from the end, and it is unlinked by pointing 3 at 5. Reading from the dummy gives [1,2,3,5].</p>`,
      edges: `<p><b>n = 1:</b> the last node is removed. Ahead reaches the last node after its head start of one step plus the walk, and behind stops on the second to last node.</p>
<ul>
  <li><b>n equals the length:</b> the head is removed, and behind stays on the dummy because ahead reaches the last node right after its head start.</li>
  <li><b>Single node:</b> n must be 1, the only node goes, and the result is an empty list.</li>
  <li><b>Repeated values:</b> removal is by position, so [7,7,7,7] with n = 2 still loses exactly one node.</li>
  <li><b>n out of range:</b> not supported. If n exceeds the length, ahead runs past the tail and the code throws. Validate n first if the input is untrusted.</li>
  <li><b>Long lists:</b> the walk is iterative, so 100,000 nodes cause no stack problem.</li>
</ul>`,
      followups: [
        "How would you solve it with two passes, and when would you prefer that version over the one-pass pointer gap?",
        "How would you find the middle node of the list in one pass, and how is that related to the fixed gap idea?",
        "How would you handle an n that may be larger than the length, by returning the list unchanged?",
        "How would you remove the n-th node from the end of a doubly linked list, and does the answer get simpler?",
      ],
      slips: `<p>The most common slip is leaving out the dummy node. The code then needs a separate branch for removing the head, and forgetting it dereferences null.</p>
<ul>
  <li>Off by one in the gap: moving ahead n + 1 steps while still looping on ahead.next leaves behind one node too early, so the node before the target is deleted. The two conventions work only as a pair: n steps with a test on ahead.next, or n + 1 steps with a test on ahead itself.</li>
  <li>Returning the original head, which is wrong when the head was removed. Return dummy.next.</li>
  <li>Deleting by value, which removes the wrong node when values repeat.</li>
  <li>Counting n from the front by mistake, when n = 1 means the last node.</li>
</ul>`,
    },
    trace: {
      caption: "Pointer positions for [1,2,3,4,5] with n = 2, where dummy is the node before the head.",
      head: ["Step", "Ahead", "Behind", "What happens"],
      rows: [
        ["1", "dummy", "dummy", "both at the dummy"],
        ["2", "2", "dummy", "ahead takes n = 2 steps"],
        ["3", "3", "1", "move both"],
        ["4", "4", "2", "move both"],
        ["5", "5", "3", "ahead.next is null: stop"],
        ["6", "5", "3", "unlink 4; result 1,2,3,5"],
      ],
    },
    complexity: {
      time: "O(L), L is the list length",
      space: "O(1) beyond the list",
      brute: "O(L²) by recounting, O(L) in two passes",
    },
    solution: {
      entry: "removeNthFromEnd",
      code: `function removeNthFromEnd(values, n) {
  const dummy = { val: 0, next: null };
  let tail = dummy;
  for (const value of values) {
    tail.next = { val: value, next: null };
    tail = tail.next;
  }

  let ahead = dummy;
  for (let step = 0; step < n; step++) ahead = ahead.next;

  let behind = dummy;
  while (ahead.next !== null) {
    ahead = ahead.next;
    behind = behind.next;
  }
  behind.next = behind.next.next;

  const result = [];
  for (let node = dummy.next; node !== null; node = node.next) result.push(node.val);
  return result;
}`,
      cases: [
        { args: [[1, 2, 3, 4, 5], 2], expected: [1, 2, 3, 5] },
        { args: [[1], 1], expected: [] },
        { args: [[1, 2], 1], expected: [1] },
        { args: [[1, 2], 2], expected: [2] },
        { args: [[1, 2, 3], 3], expected: [2, 3] },
        { args: [[1, 2, 3, 4, 5], 1], expected: [1, 2, 3, 4] },
        { args: [[1, 2, 3, 4, 5], 5], expected: [2, 3, 4, 5] },
        { args: [[7, 7, 7, 7], 2], expected: [7, 7, 7] },
        { args: [[1, 2, 3], 2], expected: [1, 3] },
        { args: [[4, 5, 6, 7, 8, 9], 3], expected: [4, 5, 6, 8, 9] },
        { args: [[1, 2, 3, 4], 4], expected: [2, 3, 4] },
        { args: [[9, 8], 2], expected: [8] },
      ],
    },
  },
  {
    id: "zerodha-zero-one-knapsack",
    company: "zerodha",
    title: "0/1 Knapsack",
    prompt:
      "You have items with given weights and values and a bag that can carry a total weight of at most capacity. Each item can be taken once or left behind. Return the largest total value you can carry. For weights [1,3,4,5], values [1,4,5,7] and capacity 7 the answer is 9, from the items of weight 3 and 4. There are up to 200 items, the capacity goes up to 10,000, and weights and values are non-negative integers. This is a guide level question: a prep guide gives it as its dynamic programming example for Zerodha, and no candidate report of it was found.",
    level: "level not stated",
    difficulty: "Medium",
    pattern: "Knapsack table over capacity",
    patternId: "dp",
    evidence: "guide",
    sources: [
      {
        label: "Zerodha Recruitment Process: DSA topics and example questions (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/zerodha-recruitment-process/",
        kind: "prep-guide",
        year: 2024,
      },
    ],
    chapters: ["dsa-dp-2d", "dsa-dp-1d"],
    answer: {
      ask: `<p>I would begin with the source: one prep guide names 0/1 knapsack as its dynamic programming example for Zerodha, and I found no candidate report of it, so this is guide level practice on a standard problem. Then I would clarify. May an item be split? (No, that is the fractional version, which greedy solves.) Can an item be used more than once? (No, that is the unbounded version.) Are weights integers, and can one be zero? Do I return only the best value or also the chosen items? How big is the capacity, since the table size depends on it?</p>
<p>Assumptions I would state: whole items only, each once, non-negative integer weights and values, and only the best value is returned.</p>`,
      brute: `<p>Each item is either in the bag or out, so there are 2<sup>n</sup> subsets. Enumerate them, add up the weight and value of each, and keep the best one that fits. With 200 items that is far beyond any machine. A recursive version, solve(i, room) = the better of skipping item i or taking it, has the same exponential cost.</p>
<p>The waste is visible in the recursion: the pair (i, room) is reached by many different earlier choices, and every visit redoes the same subproblem. There are only n times (capacity + 1) distinct pairs, so remembering their answers collapses the exponential tree into a table.</p>`,
      insight: `<p>The pattern is a <b>knapsack table indexed by capacity</b>. Let best[i][room] be the largest value achievable using only the first i items with a weight limit of room. Item i is either skipped, which keeps best[i-1][room], or taken, which adds its value to the best that fits in the remaining room: best[i-1][room - weight] + value, allowed only when the weight is at most room. Take the larger. The answer is best[n][capacity].</p>
<p>Row i reads only row i-1, so a single array is enough. The detail that makes it work: update the cells for each item from the high room down to the low room. When cell room is updated, the cell room - weight lies below it and has not been touched yet for this item, so it still holds the previous row's value. Going upward would read cells that already include this item and could take the same item again, which silently solves the unbounded problem.</p>
<p>Why is it correct? By induction over the items, the array holds the best value for every limit using the items seen so far. The array starts as all zeros, meaning "weight at most room", so a cell never needs an impossible marker. Each item adds exactly the two options of skip or take, and nothing else. The cost is n times capacity, which is polynomial in the capacity's value but not in the number of bits needed to write it.</p>
<p>Out loud: "For each item I go through the capacities from big to small and ask whether taking it beats leaving it."</p>`,
      walkthrough: `<p>Take weights [1,3,4,5], values [1,4,5,7] and capacity 7. The array holds the best value for each room from 0 to 7, starting all zeros. Item 1 (weight 1, value 1) lifts every cell from room 1 upward to 1. Item 2 (weight 3, value 4) turns room 3 into 4 and rooms 4 to 7 into 5, since room 4 can hold item 1 plus item 2.</p>
<p>Item 3 (weight 4, value 5) updates room 7 to dp[3] + 5 = 4 + 5 = 9, the weights 3 and 4 together. It also lifts rooms 5 and 6 to 6. Item 4 (weight 5, value 7) improves room 5 to 7 and room 6 to 8 but not room 7, since dp[2] + 7 = 8 is below 9. The answer is the last cell, 9.</p>`,
      edges: `<p><b>Capacity 0:</b> only items of weight 0 can be taken, and the array has a single cell.</p>
<ul>
  <li><b>No items:</b> the array stays at zeros and the answer is 0.</li>
  <li><b>An item heavier than the capacity:</b> its loop starts below its weight and never runs, so the item is ignored.</li>
  <li><b>A zero-weight item:</b> each cell reads its own old value before writing, so the item is counted once, not repeatedly.</li>
  <li><b>An item that exactly fills the bag:</b> taking it reads cell 0, the value of the zero-weight items alone, and adds its own value.</li>
  <li><b>All items fit:</b> the answer is the sum of all values.</li>
  <li><b>Values of zero:</b> they never improve a cell, which is harmless.</li>
</ul>`,
      followups: [
        "How would you recover which items were chosen, and what extra information would you store?",
        "How would you solve it when the capacity is huge but the values are small, by swapping the roles of weight and value in the table?",
        "How does the code change for the unbounded knapsack, where every item can be taken any number of times?",
        "How is the equal-sum partition problem a 0/1 knapsack, and which boolean table does it need?",
        "Why does a greedy choice by value per unit weight fail here but succeed when items can be split?",
      ],
      slips: `<p>The classic slip is looping the capacity upward in the one-dimensional version. That lets an item be taken again within the same pass and returns the unbounded answer.</p>
<ul>
  <li>Choosing items greedily by value per unit weight. On this example it takes weight 5 first, then weight 1, and reaches 8 instead of 9.</li>
  <li>Using a table sized capacity instead of capacity + 1, which loses the last cell.</li>
  <li>Mixing the two meanings of the table: starting from zeros means "weight at most room" and the last cell is the answer, while starting from minus infinity except cell 0 means "weight exactly room" and the answer is the largest cell.</li>
  <li>Looping the room down to 1 instead of down to the item's weight, which reads a negative index.</li>
  <li>Mixing up the weight and value arrays.</li>
</ul>`,
    },
    trace: {
      caption: "Best value for each room from 0 to 7 after each item, for weights [1,3,4,5] and values [1,4,5,7].",
      head: ["Item", "Weight", "Value", "dp[0] to dp[7]"],
      rows: [
        ["start", "-", "-", "0 0 0 0 0 0 0 0"],
        ["1", "1", "1", "0 1 1 1 1 1 1 1"],
        ["2", "3", "4", "0 1 1 4 5 5 5 5"],
        ["3", "4", "5", "0 1 1 4 5 6 6 9"],
        ["4", "5", "7", "0 1 1 4 5 7 8 9"],
      ],
    },
    complexity: { time: "O(n × capacity)", space: "O(capacity)", brute: "O(2^n × n)" },
    solution: {
      entry: "knapsack",
      code: `function knapsack(weights, values, capacity) {
  const best = new Array(capacity + 1).fill(0);
  for (let item = 0; item < weights.length; item++) {
    for (let room = capacity; room >= weights[item]; room--) {
      best[room] = Math.max(best[room], best[room - weights[item]] + values[item]);
    }
  }
  return best[capacity];
}`,
      cases: [
        { args: [[1, 3, 4, 5], [1, 4, 5, 7], 7], expected: 9 },
        { args: [[], [], 10], expected: 0 },
        { args: [[5], [10], 4], expected: 0 },
        { args: [[5], [10], 5], expected: 10 },
        { args: [[2, 3, 4], [3, 4, 5], 0], expected: 0 },
        { args: [[0, 2], [5, 3], 0], expected: 5 },
        { args: [[1, 1, 1], [1, 1, 1], 2], expected: 2 },
        { args: [[10, 20, 30], [60, 100, 120], 50], expected: 220 },
        { args: [[5, 4, 6, 3], [10, 40, 30, 50], 10], expected: 90 },
        { args: [[1, 2, 3], [6, 10, 12], 5], expected: 22 },
        { args: [[3, 3], [5, 5], 5], expected: 5 },
        { args: [[1, 2, 3], [0, 0, 0], 6], expected: 0 },
      ],
    },
  },
  {
    id: "flipkart-marathon-energy-drinks",
    company: "flipkart",
    title: "Fewest Energy Drinks to Finish a Marathon",
    prompt:
      "A runner starts a marathon with reserve calories of energy and burns perMile calories for every mile. Along the course there are checkpoints, and each one holds a single energy drink worth a known number of calories. The array gaps lists the miles from the start to the first checkpoint, then between each pair of checkpoints, then from the last checkpoint to the finish, so it has one more entry than the array drinks. The runner may take a drink only at a checkpoint that has been reached, takes the whole drink, and must never run out of energy before reaching the next point, although arriving with exactly zero is fine. Return the fewest drinks that get the runner to the finish, or -1 if it cannot be done. For reserve 10, perMile 1, gaps [10,10,10,30,40] and drinks [60,30,30,40] the answer is 2. There are up to 100,000 checkpoints.",
    level: "SDE-2",
    difficulty: "Hard",
    pattern: "Greedy with a max-heap",
    patternId: "heap",
    evidence: "one",
    sources: [
      {
        label: "Flipkart Interview Experience | SDE-2 | Bengaluru | May-2024 [Reject] (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/flipkart-interview-experience-sde-2-bengaluru-may-2024-reject/",
        kind: "candidate-report",
        year: 2024,
      },
    ],
    chapters: ["dsa-heaps-priority-queues", "dsa-greedy"],
    answer: {
      ask: `<p>The candidate report describes this problem only loosely: an athlete with a reserve, a burn per mile, and checkpoints holding drinks, with gaps between them. The report also says the candidate got stuck and needed a hint. Its sample lists as many distances as drinks, so it does not say whether a first leg from the start to the first checkpoint exists. I would not guess the statement. I would fix an interpretation out loud and confirm it, and this answer solves the one in the prompt above, where the first and last legs both count. It has the same shape as the well known minimum refuelling stops problem but is not that exact statement.</p>
<p>Choices to confirm: each checkpoint holds one drink and the runner takes all of it or none, there is no limit on how much energy the runner can hold, energy does not decay, arriving at a point with exactly zero is allowed, and when the finish cannot be reached the answer is -1.</p>`,
      brute: `<p>Try every subset of checkpoints to drink at. For each subset, simulate the run, subtract the burn on every leg, add the drink at each chosen checkpoint, and fail if the energy ever drops below zero before a point. Keep the smallest feasible subset. That is 2<sup>n</sup> subsets with an O(n) simulation each, hopeless at 100,000 checkpoints.</p>
<p>A table is the middle step: let best[j] be the largest total energy gathered using j drinks among the checkpoints seen so far, keeping only choices that never ran dry. It runs in O(n²), which is still too slow at this size. The table spends effort on every count j at every checkpoint, while the question needs only the smallest j.</p>`,
      insight: `<p>The pattern is <b>greedy with a max-heap</b>, a lazy choice made at the last possible moment. Do not decide at a checkpoint whether to drink. Just remember what was on offer. Push each drink into a max-heap as soon as it is passed. Run the legs in order. If the energy in hand does not cover the next leg, the runner would stall, so reach back and drink the largest drink passed so far: pop it, add it to the energy, and count it. Repeat until the leg is covered. If the heap is empty while the energy is still short, no drink could have helped and the answer is -1.</p>
<p>Why may we drink retroactively? Energy never expires and extra energy never hurts an earlier leg, so taking a passed drink late gives the same result as taking it on the spot. A drink is worth taking only when it prevents a stall, so we delay every choice until a stall forces one.</p>
<p>Why the largest one? Assume an optimal plan that contains every drink we have taken so far. At a stall, those drinks are not enough, so the plan must hold another drink y passed before the stall, and y is no larger than the largest passed drink we have not taken, call it x. If the plan lacks x, swap y for x. Every leg before the stall was already covered by the drinks we took earlier, which the plan still holds, and from the stall onward the plan has at least as much energy as before. So the swapped plan is no worse, the greedy choice is safe, and repeating the argument shows the greedy count is the smallest. A stall with an empty heap means every passed drink is already taken, so the point is unreachable.</p>
<p>Out loud: "I carry every drink I have passed in a max-heap and only reach for one when I would run dry, always the biggest."</p>`,
      walkthrough: `<p>Take reserve 10, one calorie per mile, gaps [10,10,10,30,40] and drinks [60,30,30,40]. Leg 1 burns 10, the runner has exactly 10, arrives with 0, and the 60 drink joins the heap. Leg 2 burns 10 with nothing in hand, so it stalls: pop 60, count 1, energy 60, then 50 left after the leg, and the first 30 joins the heap.</p>
<p>Leg 3 burns 10, leaving 40, and the second 30 joins. Leg 4 burns 30, leaving 10, and 40 joins. The last leg to the finish burns 40 with 10 in hand, so it stalls again: pop 40, count 2, energy 50, and 10 is left at the finish. The answer is 2.</p>`,
      edges: `<p><b>No checkpoints:</b> there is a single leg. The answer is 0 if the reserve covers it and -1 otherwise.</p>
<ul>
  <li><b>Reserve already enough:</b> no stall ever happens, so no drink is taken and the answer is 0.</li>
  <li><b>Arriving with exactly zero:</b> allowed, so the stall test is energy below burn, never at or below it.</li>
  <li><b>Stall on the first leg:</b> the heap is empty, so the answer is -1.</li>
  <li><b>Drinks worth zero:</b> they are popped only after everything larger is gone, when the run is already doomed, so they never change a successful answer.</li>
  <li><b>Burn rate of zero or gaps of zero:</b> nothing is burned, so no stall can occur.</li>
  <li><b>Equal drinks:</b> ties in the heap do not matter.</li>
</ul>`,
      followups: [
        "How would the answer change if the runner can hold at most a fixed amount of energy, so a drink can be wasted?",
        "How would you return which checkpoints the drinks were taken at?",
        "How would you solve it if each drink had a cost and you wanted the cheapest plan instead of the fewest drinks?",
        "How would you process checkpoints as a stream if the course is not known in advance?",
      ],
      slips: `<p>The common slip is deciding at each checkpoint, for example always drinking, or drinking only when the next leg looks long. The choice cannot be made correctly until a stall shows that it is needed.</p>
<ul>
  <li>Sorting all drinks and taking the largest overall, which ignores that a drink must be passed before it can be used.</li>
  <li>Pushing a checkpoint's drink into the heap before the leg that reaches that checkpoint.</li>
  <li>Skipping the final leg from the last checkpoint to the finish, so the run is never checked there.</li>
  <li>Stalling when energy is at or below the burn, which rejects exact arrival with zero.</li>
  <li>Taking only one drink per stall instead of looping until the leg is covered.</li>
  <li>Popping from an empty heap instead of returning -1.</li>
</ul>`,
    },
    trace: {
      caption: "Legs for reserve 10, one calorie per mile, gaps [10,10,10,30,40] and drinks [60,30,30,40].",
      head: ["Leg", "Burn", "Energy at start", "Drink taken", "Left", "Heap after"],
      rows: [
        ["1", "10", "10", "-", "0", "60"],
        ["2", "10", "0", "60", "50", "30"],
        ["3", "10", "50", "-", "40", "30,30"],
        ["4", "30", "40", "-", "10", "40,30,30"],
        ["5", "40", "10", "40", "10", "30,30"],
      ],
    },
    complexity: { time: "O(n log n)", space: "O(n)", brute: "O(2^n × n)" },
    solution: {
      entry: "fewestDrinks",
      code: `class MaxHeap {
  constructor() {
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  push(value) {
    const items = this.items;
    items.push(value);
    let child = items.length - 1;
    while (child > 0) {
      const parent = (child - 1) >> 1;
      if (items[parent] >= items[child]) break;
      [items[parent], items[child]] = [items[child], items[parent]];
      child = parent;
    }
  }

  pop() {
    const items = this.items;
    const top = items[0];
    const last = items.pop();
    if (items.length > 0) {
      items[0] = last;
      let parent = 0;
      for (;;) {
        const left = 2 * parent + 1;
        const right = left + 1;
        let largest = parent;
        if (left < items.length && items[left] > items[largest]) largest = left;
        if (right < items.length && items[right] > items[largest]) largest = right;
        if (largest === parent) break;
        [items[parent], items[largest]] = [items[largest], items[parent]];
        parent = largest;
      }
    }
    return top;
  }
}

function fewestDrinks(reserve, perMile, gaps, drinks) {
  const passed = new MaxHeap();
  let energy = reserve;
  let taken = 0;
  for (let leg = 0; leg < gaps.length; leg++) {
    const burn = gaps[leg] * perMile;
    while (energy < burn) {
      if (passed.size === 0) return -1;
      energy += passed.pop();
      taken++;
    }
    energy -= burn;
    if (leg < drinks.length) passed.push(drinks[leg]);
  }
  return taken;
}`,
      cases: [
        { args: [10, 1, [10, 10, 10, 30, 40], [60, 30, 30, 40]], expected: 2 },
        { args: [100, 1, [50, 50], [10]], expected: 0 },
        { args: [1, 1, [10], []], expected: -1 },
        { args: [10, 1, [10], []], expected: 0 },
        { args: [0, 0, [5, 5], [1]], expected: 0 },
        { args: [10, 1, [5, 20], [5]], expected: -1 },
        { args: [5, 1, [3, 3, 3], [3, 3]], expected: 2 },
        { args: [1, 1, [1, 1, 1, 1], [1, 1, 1]], expected: 3 },
        { args: [5, 1, [5, 5], [0]], expected: -1 },
        { args: [3, 1, [3, 2, 10], [2, 100]], expected: 2 },
        { args: [10, 2, [5, 5, 5], [10, 50]], expected: 2 },
        { args: [0, 1, [0, 0], [4]], expected: 0 },
        { args: [3, 1, [1, 2, 4], [1, 4]], expected: 1 },
        { args: [3, 1, [2, 1, 4], [4, 3]], expected: 1 },
        { args: [4, 1, [1, 3, 3], [2, 1]], expected: 2 },
      ],
    },
  },
  {
    id: "swiggy-min-days-bouquets",
    company: "swiggy",
    title: "Minimum Days to Make m Bouquets",
    prompt:
      "Flowers stand in a row, and bloomDay[i] is the day flower i opens. A bouquet needs exactly k flowers that are next to each other in the row and all open, and each flower can go into at most one bouquet. Return the earliest day on which you can have m bouquets, or -1 if the row is too short. For bloomDay [1,10,2,9,3,8,4,7,5,6], m = 4 and k = 2 the answer is 9. The row holds up to 100,000 flowers and days go up to a billion, so trying day after day is far too slow.",
    level: "SDE-2",
    difficulty: "Medium",
    pattern: "Binary search on the answer",
    patternId: "search",
    leetcode: { number: 1482, slug: "minimum-number-of-days-to-make-m-bouquets" },
    evidence: "one",
    sources: [
      {
        label:
          "Swiggy interview experiences index, 'Swiggy - SDE 2 - July 2025 [Offer]' (CodingKaro, mirrors LeetCode Discuss)",
        url: "https://www.codingkaro.in/jobs-internships/leetcode-interview-experience/Swiggy",
        kind: "candidate-report",
        year: 2025,
      },
    ],
    chapters: ["dsa-binary-search", "dsa-greedy"],
    answer: {
      ask: `<p>A single July 2025 SDE-2 offer post lists this problem, as Minimum Days to Make Bouquets of k Adjacent Flowers, among five problems, and the index shows only that title, so the exact wording the candidate saw is not on file. I would therefore restate it and solve the standard version: flowers in a row, a bouquet is exactly k adjacent open flowers, each flower is used at most once, and the answer is the earliest day with m bouquets. I would confirm that adjacent means neighbours in the row, that a flower can be used on or after its bloom day, and that -1 is returned when m times k exceeds the number of flowers.</p>
<p>Assumptions I would state: m and k are at least 1, days are positive integers, and the flowers stay open once they bloom.</p>`,
      brute: `<p>Walk the days from the earliest bloom to the latest. For each day, scan the row to count how many bouquets can be made, and stop at the first day that reaches m. Each scan is O(n), and with days up to a billion that is O(n times the range of days), which is unusable.</p>
<p>Only days that equal some bloom day can matter, since nothing changes in between. Sorting the distinct bloom days and trying each one cuts it to O(n²) in the worst case. That is the right observation, but it still scans the whole row for every candidate day.</p>`,
      insight: `<p>The pattern is <b>binary search on the answer</b>. Ask a yes or no question about a day d: can m bouquets be made by day d? That answer is monotone. If it is yes on day d, it is yes on d + 1, because flowers only open and never close. A monotone yes or no over a sorted range of days means we can binary search for the first yes.</p>
<p>The check is a greedy scan. Walk the row keeping a run of consecutive open flowers. An open flower extends the run, and when the run reaches k, count one bouquet and reset the run to zero. A closed flower resets the run to zero. Cutting a bouquet as early as possible is optimal because, inside a stretch of r open flowers, the most bouquets possible is r divided by k rounded down, and the early cut reaches exactly that.</p>
<p>The search range is from the earliest bloom day to the latest. Before the earliest day nothing is open. On the latest day everything is open, so after the -1 check (m times k at most n) at least m bouquets exist. Keep low and high with the invariant that the answer lies in [low, high]. Take mid = floor((low + high) / 2). If mid works, set high = mid, since mid may itself be the answer. Otherwise set low = mid + 1. When they meet, that day is the answer.</p>
<p>Out loud: "I binary search the day. For a fixed day, one pass counts the bouquets greedily. About 30 passes cover a billion days."</p>`,
      walkthrough: `<p>Take bloomDay [1,10,2,9,3,8,4,7,5,6] with m = 4 and k = 2. The row has ten flowers and four bouquets of two need eight, so it is possible. The range is day 1 to day 10.</p>
<p>Mid is 5. The open flowers are 1, 2, 3, 4 and 5, but each is separated by a closed one, so no pair of neighbours exists: 0 bouquets, so low becomes 6. Mid is 8. Everything except the 10 and the 9 is open, which leaves the single flower 1, the single flower 2, and a run of six, so only 3 bouquets: low becomes 9. Mid is 9. Only the 10 is closed, so one flower is left alone and a run of eight gives 4 bouquets, so high becomes 9. Low equals high, and the answer is 9.</p>`,
      edges: `<p><b>Too few flowers:</b> if m times k exceeds the number of flowers, return -1 before searching. An empty row also returns -1.</p>
<ul>
  <li><b>k = 1:</b> every open flower is a bouquet, so the answer is the m-th smallest bloom day.</li>
  <li><b>One bouquet using the whole row:</b> the answer is the latest bloom day.</li>
  <li><b>All days equal:</b> low equals high at the start and the loop is skipped.</li>
  <li><b>Huge days:</b> the midpoint is computed from values up to a billion, which fits comfortably in a JavaScript number. In a 32-bit language write low + (high - low) / 2 and compute m times k in 64 bits.</li>
  <li><b>A bloom day exactly equal to mid:</b> that flower counts as open, so the comparison is less-or-equal.</li>
</ul>`,
      followups: [
        "How would you return the positions of the flowers in each bouquet for the answer day?",
        "How would you adapt it if a bouquet needed k flowers that need not be adjacent?",
        "How would you answer many queries with different m and k on the same row?",
        "How does this compare with the problems on finding the smallest speed or capacity, and what do they share?",
        "How would you search if bloom days were real numbers instead of integers?",
      ],
      slips: `<p>The most frequent slip is ignoring adjacency and returning the day when at least m times k flowers are open, then dividing by k. Open flowers that are separated by closed ones cannot be combined.</p>
<ul>
  <li>Not resetting the run when a flower is closed.</li>
  <li>Not resetting the run after a bouquet is cut, so a run of 2k flowers yields one bouquet instead of two.</li>
  <li>Searching the index of the flowers instead of the days.</li>
  <li>Mixing the two update styles, for example high = mid - 1 together with the loop test low &lt; high, which can skip the answer.</li>
  <li>Sorting the bloom days, which destroys the adjacency the problem depends on.</li>
  <li>Forgetting the -1 case and returning the latest bloom day.</li>
</ul>`,
    },
    trace: {
      caption: "Binary search for bloomDay [1,10,2,9,3,8,4,7,5,6], m = 4, k = 2.",
      head: ["Low", "High", "Mid", "Bouquets", "Move"],
      rows: [
        ["1", "10", "5", "0", "low = mid + 1"],
        ["6", "10", "8", "3", "low = mid + 1"],
        ["9", "10", "9", "4", "high = mid"],
        ["9", "9", "-", "-", "answer 9"],
      ],
    },
    complexity: {
      time: "O(n log D), D is the range of bloom days",
      space: "O(1)",
      brute: "O(n × D) day by day, O(n²) over distinct days",
    },
    solution: {
      entry: "minDays",
      code: `function minDays(bloomDay, m, k) {
  if (m * k > bloomDay.length) return -1;
  let low = bloomDay[0];
  let high = bloomDay[0];
  for (const day of bloomDay) {
    if (day < low) low = day;
    if (day > high) high = day;
  }
  while (low < high) {
    const mid = Math.floor((low + high) / 2);
    if (bouquetsBy(bloomDay, k, mid) >= m) high = mid;
    else low = mid + 1;
  }
  return low;
}

function bouquetsBy(bloomDay, k, day) {
  let bouquets = 0;
  let run = 0;
  for (const bloom of bloomDay) {
    if (bloom <= day) {
      run++;
      if (run === k) {
        bouquets++;
        run = 0;
      }
    } else {
      run = 0;
    }
  }
  return bouquets;
}`,
      cases: [
        { args: [[1, 10, 3, 10, 2], 3, 1], expected: 3 },
        { args: [[1, 10, 3, 10, 2], 3, 2], expected: -1 },
        { args: [[7, 7, 7, 7, 12, 7, 7], 2, 3], expected: 12 },
        { args: [[1, 10, 2, 9, 3, 8, 4, 7, 5, 6], 4, 2], expected: 9 },
        { args: [[5], 1, 1], expected: 5 },
        { args: [[1, 10, 3, 10, 2], 1, 5], expected: 10 },
        { args: [[1000000000, 1000000000], 1, 2], expected: 1000000000 },
        { args: [[], 1, 1], expected: -1 },
        { args: [[2, 2, 2, 2], 2, 2], expected: 2 },
        { args: [[1, 2, 3, 4], 2, 2], expected: 4 },
        { args: [[3, 1, 2], 2, 1], expected: 2 },
        { args: [[1, 2], 1, 3], expected: -1 },
        { args: [[5, 5, 1, 5, 5], 2, 2], expected: 5 },
      ],
    },
  },
  {
    id: "razorpay-meeting-rooms-ii",
    company: "razorpay",
    title: "Minimum Meeting Rooms",
    prompt:
      "Meetings are given as [start, end] pairs with the start before the end, in no particular order. Two meetings clash when they overlap in time, and a meeting that ends at the very moment another begins does not clash with it. Return the fewest rooms that can hold all the meetings. For [[0,30],[5,10],[15,20]] the answer is 2. There are up to 100,000 meetings and times go up to two billion.",
    level: "SDE-2 (2-3 years)",
    difficulty: "Medium",
    pattern: "Sorted starts and ends",
    patternId: "intervals",
    leetcode: { number: 253, slug: "meeting-rooms-ii" },
    evidence: "one",
    sources: [
      {
        label: "RazorPay Interview Experience for SDE-2 ( 2-3 years Experienced) (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/interview-experiences/razorpay-interview-experience-for-sde2-2-3-years-experienced/",
        kind: "candidate-report",
        year: 2020,
      },
    ],
    chapters: ["dsa-intervals", "dsa-heaps-priority-queues"],
    answer: {
      ask: `<p>The candidate report was posted in 2020 and describes an SDE-2 first round in which the interviewer wanted the brute force first and the optimised version coded while explaining. It gives only a link to the InterviewBit Meeting Rooms problem, which asks for the fewest conference rooms and lets a meeting start in the room another just left, so that is the version solved here. I would plan to say both approaches aloud. Before coding I would ask: does a meeting that ends exactly when another starts clash? (No, they can share a room.) Is every start strictly before its end? Is the input sorted? Do I return only the number of rooms or also the assignment? How many meetings are there?</p>
<p>Assumptions I would state: start is strictly before end, the order is arbitrary, touching meetings can share a room, times are integers, and only the count is returned.</p>`,
      brute: `<p>The most crowded moment always coincides with the start of some meeting. So for every meeting, take its start time and count how many meetings are running at that instant, meaning start at or before it and end after it. The largest count is the number of rooms. Counting is a pass over all meetings, and doing it for every meeting is O(n²), about ten billion steps at 100,000 meetings.</p>
<p>Another direct method keeps a list of rooms and tries each meeting against each room in turn. It is correct as well, but it costs O(n times the number of rooms) and needs the meetings sorted by start first. Both repeat work that sorting removes.</p>`,
      insight: `<p>The pattern is <b>sort the starts and the ends separately and sweep</b>. The answer is the largest number of meetings running at once, so we only need to know, whenever a meeting starts, whether some earlier meeting has already finished. Sort all start times, and sort all end times in a second array. Walk through the starts in order with a pointer into the ends that marks the earliest end not yet used to free a room.</p>
<p>For each start, compare it with that earliest end. If the start is at or after it, that meeting is over, so its room is free: reuse it and advance the pointer. Otherwise every meeting begun so far is still running, so a new room is needed: add one. The count of rooms added is the answer.</p>
<p>Why can we forget which end belongs to which meeting? Every meeting ends after it starts. An end time at or before the current start therefore belongs to a meeting that began even earlier, and starts are processed in order, so that meeting has already been counted. What matters is only how many meetings have finished, not which ones.</p>
<p>Why is the room count right even though the pointer moves at most one step per start? Rooms are only ever added, never removed, so the count never drops. The pointer never gets ahead of the number of ends at or before the current start. A room is added only when the pointer has caught up with all of those ends. At that moment the rooms equal the meetings started minus the meetings finished, which is the true crowd at that start. The busiest moment is the start of some meeting, so the final count equals the peak.</p>
<p>Touching meetings share a room because the comparison is greater-or-equal. The usual alternative is a min-heap of end times with the same O(n log n) cost: pop the earliest end if it is at or before the new start, push the new end, and track the largest heap size.</p>
<p>Out loud: "I line up all the starts and all the ends in order. Each start either reuses the earliest finished room or opens a new one."</p>`,
      walkthrough: `<p>Take [[1,4],[2,5],[3,6],[4,7],[8,9]]. The sorted starts are 1, 2, 3, 4, 8 and the sorted ends are 4, 5, 6, 7, 9. Start 1 meets the earliest end 4: not over yet, so rooms = 1. Start 2 also meets 4, so rooms = 2, and start 3 gives rooms = 3.</p>
<p>Start 4 meets the earliest end 4, and 4 is at or after 4, so the first meeting has just finished and its room is reused, which advances the end pointer to 5. Start 8 is after 5, so another room is reused. No new room was needed for the last two, so the answer is 3.</p>`,
      edges: `<p><b>No meetings:</b> both arrays are empty and the answer is 0.</p>
<ul>
  <li><b>Touching meetings:</b> [1,5] and [5,10] share one room because the test is greater-or-equal.</li>
  <li><b>Identical meetings:</b> three copies of [1,5] need three rooms.</li>
  <li><b>One meeting containing the rest:</b> [1,10] with [2,3] and [4,5] needs two rooms, not three, since the short ones do not overlap each other.</li>
  <li><b>Unsorted input:</b> the code sorts copies of the starts and ends, so the input order does not matter and the input is not changed.</li>
  <li><b>Zero-length meetings:</b> not supported, because the first rule assumes start is strictly before end. A [5,5] alone would count no room, so state the assumption.</li>
  <li><b>Times with different digit counts:</b> they need a numeric comparator in the sort, because the default sort compares text.</li>
</ul>`,
      followups: [
        "How would you return which meeting is in which room, and what would the heap hold instead of just end times?",
        "How is the minimum number of platforms for trains with arrival and departure times the same problem, and where does the tie rule at equal times change the answer?",
        "How would you solve it if meetings arrive one at a time and the count must be available after each arrival?",
        "How would you find the largest number of non-overlapping meetings that fit in a single room?",
        "How would you report the time window in which the largest overlap occurs?",
      ],
      slips: `<p>In JavaScript the biggest slip is calling sort without a comparator. The default sorts numbers as text, so 10 comes before 2 and every answer is wrong for times of different lengths. Always pass (a, b) =&gt; a - b.</p>
<ul>
  <li>Using a strict comparison, which counts meetings that only touch as clashing and returns too many rooms.</li>
  <li>Sorting only the starts and leaving the ends in input order, so the earliest end is not at the front.</li>
  <li>Confusing it with the easier question of whether one person can attend all meetings, which only asks whether any overlap exists.</li>
  <li>Mutating the caller's input array by sorting it in place.</li>
</ul>`,
    },
    trace: {
      caption: "Starts in order against the earliest unused end, for [[1,4],[2,5],[3,6],[4,7],[8,9]].",
      head: ["Start", "Earliest end", "Reuse?", "Rooms"],
      rows: [
        ["1", "4", "no", "1"],
        ["2", "4", "no", "2"],
        ["3", "4", "no", "3"],
        ["4", "4", "yes", "3"],
        ["8", "5", "yes", "3"],
      ],
    },
    complexity: { time: "O(n log n)", space: "O(n)", brute: "O(n²)" },
    solution: {
      entry: "minMeetingRooms",
      code: `function minMeetingRooms(intervals) {
  const starts = intervals.map((meeting) => meeting[0]).sort((a, b) => a - b);
  const ends = intervals.map((meeting) => meeting[1]).sort((a, b) => a - b);
  let rooms = 0;
  let freed = 0;
  for (const start of starts) {
    if (start >= ends[freed]) freed++;
    else rooms++;
  }
  return rooms;
}`,
      cases: [
        {
          args: [
            [
              [0, 30],
              [5, 10],
              [15, 20],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [7, 10],
              [2, 4],
            ],
          ],
          expected: 1,
        },
        { args: [[]], expected: 0 },
        { args: [[[1, 2]]], expected: 1 },
        {
          args: [
            [
              [1, 4],
              [2, 5],
              [3, 6],
              [4, 7],
              [8, 9],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [1, 5],
              [5, 10],
            ],
          ],
          expected: 1,
        },
        {
          args: [
            [
              [1, 10],
              [2, 3],
              [4, 5],
              [6, 7],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [1, 5],
              [1, 5],
              [1, 5],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [10, 12],
              [1, 3],
              [2, 11],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [9, 10],
              [4, 9],
              [4, 17],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [0, 1000000000],
              [1, 2],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [5, 6],
              [10, 11],
              [2, 3],
            ],
          ],
          expected: 1,
        },
      ],
    },
  },
];
