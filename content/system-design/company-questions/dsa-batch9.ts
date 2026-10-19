import type { DsaQuestion } from "./dsa-types";

export const questions: DsaQuestion[] = [
  {
    id: "juspay-lock-unlock-tree",
    company: "juspay",
    title: "Lock and Unlock Nodes in an N-ary Tree",
    prompt: `Design a LockTree over n nodes numbered 0 to n-1, built from a parent array in which the single root has parent -1 (node 0 in the example below). lock(node, user) returns true and locks the node only if the node is unlocked and none of its ancestors and none of its descendants is locked, and unlock(node, user) returns true and frees the node only if that same user locked it; otherwise a call returns false and changes nothing. The input is an operation list like a LeetCode design problem: run(ops, args) returns null for the constructor "LockTree" and a boolean for every later call, so with parent [-1,0,0,1,1,2] the calls lock(1,7), lock(3,8), unlock(1,8) return true, false (ancestor 1 is locked), false (wrong user). There are up to 100,000 nodes and calls, user ids are positive integers, and the tree height stays under 1,000.`,
    level: "intern",
    difficulty: "Hard",
    pattern: "Tree with ancestor and descendant counters",
    patternId: "tree",
    evidence: "one",
    sources: [
      {
        label: "Juspay Internship Interview Experience (undated, GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/?p=671552",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-tree-problems", "dsa-design-problems"],
    answer: {
      ask: `<p>I would pin down the semantics first. Does locking a node that is already locked fail even for the same user? Can one user hold many locks at once, as long as no two are on the same root-to-leaf path? What do unlock and lock return when the node does not exist or the user is wrong: a boolean, with the state unchanged? Is the tree given once up front, or does it change? And how deep can it get, because that decides how much a walk up to the root costs.</p>
<p>Assumptions I would state: the tree is fixed, node ids are valid, a failed call changes nothing, locking an already locked node returns false, and the height is small enough that walking to the root is cheap.</p>`,
      brute: `<p>The direct way to answer lock is to inspect every node that could block it. Walk up the parent pointers and check each ancestor, then run a depth-first search over the whole subtree of the node and check each descendant. Unlock is trivial, just compare the owner.</p>
<p>The cost sits in the subtree scan. Locking the root of a tree with 100,000 nodes touches all of them, so one call is O(n), and 100,000 calls on a wide tree reach around ten billion node visits. The scan is wasteful because it re-discovers, call after call, a fact that changes only when somebody locks or unlocks: whether anything below this node is locked. It also needs child lists, which the parent array did not give us.</p>`,
      insight: `<p>The pattern is <b>tree with ancestor and descendant counters</b>. The two blocking conditions have different shapes, so give each its own cheap check.</p>
<p>Ancestors are easy to reach: a node has exactly one parent chain, so walking up and looking at each owner costs the height h. Descendants are the expensive side, so we never look at them. Instead every node keeps a counter, lockedBelow, that says how many locked nodes sit strictly below it. When a node is locked, add one to the counter of every ancestor. When it is unlocked, subtract one. A node has a locked descendant exactly when its counter is above zero, which is a single comparison.</p>
<p>Why is it correct? The rule itself keeps the set of locked nodes free of any ancestor and descendant pair, because lock refuses to create one. The counters are only ever changed along the exact ancestor chain of the node being locked or unlocked, and every successful lock is matched by one unlock that undoes the same additions. So after any sequence of calls, each counter equals the number of locked nodes in that subtree. Failed calls touch nothing, so they cannot corrupt the state.</p>
<p>Out loud: "I store the owner of each node and, per node, how many locks are below it. Lock checks the node, its counter and the ancestor chain, then bumps the chain. Unlock checks the owner and reverses the bump. Every call is O(h) with no subtree scans."</p>`,
      walkthrough: `<p>Use parent = [-1,0,0,1,1,2]: node 0 is the root, nodes 1 and 2 are its children, nodes 3 and 4 hang under 1, and node 5 under 2. The table lists the calls in order.</p>
<p>lock(1,7) finds nothing blocking and succeeds, and node 0 now counts one lock below it. lock(3,8) fails because ancestor 1 is locked. lock(2,8) succeeds, so node 0 counts two. lock(0,9) fails because node 0 counts locks below it. unlock(1,8) fails because node 1 belongs to user 7. unlock(1,7) succeeds and node 0 drops to one. Now lock(3,8) succeeds, since node 1 is free, and both node 1 and node 0 gain a count. The last two columns show the locked nodes and the nonzero counters after each call.</p>`,
      edges: `<p><b>Locking an already locked node</b> fails on the owner check, even for the same user, and so does a second lock by another user.</p>
<ul>
  <li><b>Unlocking a free node:</b> the owner is null, which never equals a user id, so it returns false.</li>
  <li><b>Wrong user:</b> unlock leaves the lock and the counters alone.</li>
  <li><b>The root:</b> its parent is -1, so the upward walk ends at once, and a locked root blocks every other lock.</li>
  <li><b>Single node tree:</b> both walks are empty and the node locks and unlocks freely.</li>
  <li><b>Parents with larger ids:</b> only parent pointers are followed, so the order of ids does not matter.</li>
  <li><b>Sibling subtrees:</b> two nodes that are neither ancestor nor descendant of each other can both be locked.</li>
</ul>`,
      followups: [
        "How would you add an upgrade call that replaces every lock below a node, all held by one user, with a single lock on that node?",
        "How would you keep each call at O(log n) on a very deep tree, for example with an Euler tour and a Fenwick tree?",
        "How would you make lock and unlock safe when many threads call them at once?",
        "How would you list every node a given user currently holds in time proportional to the answer?",
      ],
      slips: `<p>The most common slip is checking only one direction, for example looking at ancestors but forgetting that a locked descendant also blocks the lock.</p>
<ul>
  <li>Scanning the subtree on every lock, which is exactly the cost the counters remove.</li>
  <li>Updating the counters before the checks pass, so a failed lock leaves stale counts.</li>
  <li>Including the node itself in its own counter, which makes a node block itself.</li>
  <li>Forgetting to subtract on unlock, so the counters only ever grow.</li>
  <li>Letting any user unlock a node instead of comparing the owner.</li>
</ul>`,
    },
    trace: {
      caption:
        "Calls on parent = [-1,0,0,1,1,2], with the owner of each locked node and the nonzero lockedBelow counters.",
      head: ["Step", "Call", "What decides it", "Result", "Locked (node:user)", "lockedBelow"],
      rows: [
        ["1", "lock(1, 7)", "nothing blocks it", "true", "1:7", "0:1"],
        ["2", "lock(3, 8)", "ancestor 1 is locked", "false", "1:7", "0:1"],
        ["3", "lock(2, 8)", "nothing blocks it", "true", "1:7 2:8", "0:2"],
        ["4", "lock(0, 9)", "lockedBelow[0] is 2", "false", "1:7 2:8", "0:2"],
        ["5", "unlock(1, 8)", "owner is 7, not 8", "false", "1:7 2:8", "0:2"],
        ["6", "unlock(1, 7)", "owner matches", "true", "2:8", "0:1"],
        ["7", "lock(3, 8)", "ancestors 1, 0 free", "true", "2:8 3:8", "0:2 1:1"],
      ],
    },
    complexity: { time: "O(h) per call, h = tree height", space: "O(n)", brute: "O(n) per lock" },
    solution: {
      entry: "run",
      code: `class LockTree {
  constructor(parent) {
    this.parent = parent;
    this.owner = new Array(parent.length).fill(null);
    this.lockedBelow = new Array(parent.length).fill(0);
  }

  hasLockedAncestor(node) {
    for (let up = this.parent[node]; up !== -1; up = this.parent[up]) {
      if (this.owner[up] !== null) return true;
    }
    return false;
  }

  adjustAncestors(node, delta) {
    for (let up = this.parent[node]; up !== -1; up = this.parent[up]) {
      this.lockedBelow[up] += delta;
    }
  }

  lock(node, user) {
    if (this.owner[node] !== null) return false;
    if (this.lockedBelow[node] > 0 || this.hasLockedAncestor(node)) return false;
    this.owner[node] = user;
    this.adjustAncestors(node, 1);
    return true;
  }

  unlock(node, user) {
    if (this.owner[node] !== user) return false;
    this.owner[node] = null;
    this.adjustAncestors(node, -1);
    return true;
  }
}

function run(ops, args) {
  const tree = new LockTree(args[0][0]);
  return ops.map((op, i) => (i === 0 ? null : tree[op](...args[i])));
}`,
      cases: [
        {
          args: [
            ["LockTree", "lock", "lock", "lock", "lock", "unlock", "unlock", "lock"],
            [[[-1, 0, 0, 1, 1, 2]], [1, 7], [3, 8], [2, 8], [0, 9], [1, 8], [1, 7], [3, 8]],
          ],
          expected: [null, true, false, true, false, false, true, true],
        },
        { args: [["LockTree"], [[[-1]]]], expected: [null] },
        {
          args: [
            ["LockTree", "lock", "lock", "unlock", "unlock", "unlock", "lock"],
            [[[-1]], [0, 1], [0, 1], [0, 2], [0, 1], [0, 1], [0, 2]],
          ],
          expected: [null, true, false, false, true, false, true],
        },
        {
          args: [
            ["LockTree", "lock", "lock", "lock", "unlock", "lock"],
            [[[-1, 0, 0]], [0, 5], [1, 5], [2, 6], [0, 5], [1, 5]],
          ],
          expected: [null, true, false, false, true, true],
        },
        {
          args: [
            ["LockTree", "lock", "lock", "unlock", "lock", "lock"],
            [[[-1, 0, 1, 2]], [3, 4], [0, 4], [3, 4], [0, 4], [2, 1]],
          ],
          expected: [null, true, false, true, true, false],
        },
        {
          args: [
            ["LockTree", "lock", "lock", "lock", "lock"],
            [[[-1, 0, 0, 1, 1, 2, 2]], [3, 1], [4, 1], [2, 2], [1, 1]],
          ],
          expected: [null, true, true, true, false],
        },
        {
          args: [
            ["LockTree", "unlock", "lock", "unlock", "lock", "lock"],
            [[[2, 2, -1, 0]], [1, 1], [3, 1], [3, 1], [2, 2], [1, 1]],
          ],
          expected: [null, false, true, true, true, false],
        },
        {
          args: [
            ["LockTree", "lock", "lock", "lock", "unlock", "lock", "lock"],
            [[[3, 3, 3, -1]], [0, 1], [1, 1], [3, 2], [0, 1], [3, 2], [2, 3]],
          ],
          expected: [null, true, true, false, true, false, true],
        },
        {
          args: [
            [
              "LockTree",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "unlock",
              "unlock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "unlock",
            ],
            [
              [[6, 4, 10, 4, 10, 7, 1, 2, 2, 5, -1, 10]],
              [8, 2],
              [1, 3],
              [5, 3],
              [8, 2],
              [5, 1],
              [8, 2],
              [4, 3],
              [1, 3],
              [4, 3],
              [2, 1],
              [10, 3],
              [2, 2],
              [9, 2],
              [8, 2],
              [7, 3],
              [9, 3],
              [7, 2],
              [6, 3],
              [3, 3],
              [4, 1],
              [10, 2],
              [8, 1],
              [10, 2],
              [10, 2],
              [8, 3],
              [0, 2],
              [4, 1],
              [10, 3],
              [4, 3],
              [2, 3],
            ],
          ],
          expected: [
            null,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            false,
            true,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
          ],
        },
        {
          args: [
            [
              "LockTree",
              "unlock",
              "lock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "unlock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "lock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "unlock",
              "lock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "lock",
              "lock",
              "lock",
              "unlock",
              "unlock",
              "lock",
              "lock",
              "lock",
            ],
            [
              [
                [
                  38, 8, 38, 26, 39, 11, 39, 4, 4, 17, 29, 4, 11, 4, 15, 4, 24, 18, 21, 33, 16, 39, 37, 33, 15, 37, 11,
                  34, 22, 11, 26, 15, 11, 12, 11, 31, 17, 23, 14, -1,
                ],
              ],
              [32, 3],
              [35, 2],
              [18, 3],
              [25, 2],
              [23, 2],
              [1, 2],
              [1, 3],
              [27, 2],
              [0, 3],
              [21, 3],
              [2, 3],
              [33, 1],
              [25, 1],
              [14, 1],
              [18, 1],
              [38, 1],
              [18, 3],
              [38, 1],
              [28, 1],
              [35, 1],
              [17, 2],
              [28, 1],
              [28, 2],
              [9, 2],
              [12, 2],
              [28, 3],
              [0, 3],
              [31, 1],
              [1, 3],
              [21, 1],
              [28, 2],
              [39, 2],
              [36, 2],
              [23, 2],
              [9, 2],
              [11, 2],
              [38, 1],
              [37, 1],
              [2, 2],
              [30, 3],
              [24, 3],
              [16, 2],
              [27, 1],
              [38, 1],
              [17, 1],
              [22, 3],
              [32, 3],
              [3, 1],
              [10, 2],
              [39, 1],
              [9, 3],
              [28, 1],
              [18, 3],
              [25, 1],
              [5, 1],
              [34, 2],
              [39, 1],
              [17, 1],
              [29, 1],
              [12, 3],
              [5, 1],
              [25, 3],
              [7, 1],
              [35, 3],
              [30, 3],
              [30, 2],
              [28, 3],
              [22, 3],
              [32, 1],
              [34, 3],
              [36, 3],
              [30, 3],
              [23, 3],
              [33, 1],
              [37, 2],
              [21, 1],
              [23, 1],
              [26, 3],
              [39, 2],
              [8, 2],
            ],
          ],
          expected: [
            null,
            false,
            true,
            true,
            false,
            true,
            false,
            true,
            true,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            true,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            true,
            false,
            false,
            true,
            false,
            false,
            false,
            false,
            false,
            false,
            false,
            true,
          ],
        },
      ],
    },
  },
  {
    id: "juspay-tree-from-inorder-postorder",
    company: "juspay",
    title: "Construct Binary Tree from Inorder and Postorder",
    prompt:
      "You are given the inorder and the postorder traversal of the same binary tree, where all values are distinct. Rebuild the tree and return it as a level-order array, writing null for a missing child and dropping trailing nulls. For inorder [9,3,15,20,7] and postorder [9,15,7,20,3] the answer is [3,9,20,null,null,15,7]. There are up to 3,000 nodes, and an empty tree gives an empty array.",
    level: "intern",
    difficulty: "Medium",
    pattern: "Divide and conquer with an index map",
    patternId: "tree",
    leetcode: { number: 106, slug: "construct-binary-tree-from-inorder-and-postorder-traversal" },
    evidence: "one",
    sources: [
      {
        label: "Juspay Internship Interview Experience (On-Campus), June 2021 (GeeksforGeeks)",
        url: "https://www.geeksforgeeks.org/?p=688691",
        kind: "candidate-report",
        year: 2021,
      },
    ],
    chapters: ["dsa-trees", "dsa-tree-problems"],
    answer: {
      ask: `<p>First, are all values distinct? The whole method depends on it, so I would ask and assume yes. Then: do the two arrays really describe one tree, or must I validate that? Can the input be empty? How many nodes are there, which tells me whether recursion depth is a risk? And what output form does the caller want: a tree object, or a level-order list with null for gaps?</p>
<p>Assumptions I would state: distinct values, both arrays are valid traversals of the same tree, up to 3,000 nodes, an empty input gives an empty tree, and the answer is a level-order array with trailing nulls removed.</p>`,
      brute: `<p>The plain version takes the last postorder value as the root, finds it in the inorder array with a linear search, slices both arrays into a left part and a right part, and recurses on the slices.</p>
<p>It is correct and short. The price is time and memory: each level does an O(n) search and copies O(n) elements into slices. On a balanced tree that totals O(n log n). On a skewed tree, where every node has only one child, the arrays shrink by one each time, so the total is n plus n minus 1 plus n minus 2 and so on, which is O(n²). With 3,000 nodes that is millions of copied numbers, and it grows quickly beyond that. Both the search and the copying are avoidable.</p>`,
      insight: `<p>The pattern is <b>divide and conquer with an index map</b>. Two facts do all the work. In postorder the last value is always the root of the current tree. In inorder, everything left of the root belongs to the left subtree and everything right of it belongs to the right subtree.</p>
<p>So the root's position in the inorder array splits the problem into two smaller ones. To find that position in O(1), build a map from value to inorder index once, which is allowed because values are distinct. To avoid slicing, pass only a window into the inorder array, a low and a high index.</p>
<p>The postorder array is consumed from the back with a single moving index. Postorder reads left subtree, right subtree, root, so reading it backwards gives root, right subtree, left subtree. That fixes the order of the recursion: after taking the root, build the right child first, then the left child. If you build the left first, you read the wrong values.</p>
<p>Why is it correct? Each call is given the window of inorder positions that holds exactly one subtree, and the next unread value from the back of postorder is that subtree's root. Splitting at the root's inorder index hands each child exactly its own window, and the backwards reading order ensures the right subtree uses up its values before the left starts.</p>
<p>Out loud: "Root from the back of postorder, split by the inorder index map, right before left."</p>`,
      walkthrough: `<p>Take inorder [9,3,15,20,7] and postorder [9,15,7,20,3]. The table lists the nodes in the order they are created.</p>
<p>The back of postorder is 3, which sits at inorder index 1, so the window 0 to 4 splits into a left window (0 to 0) and a right window (2 to 4). We build right first: the next value from the back is 20, at index 3, splitting 2 to 4 into 2 to 2 and 4 to 4. Again right first: the next value is 7, with empty windows on both sides. Then the left child of 20: the next value is 15. Finally the left child of 3: the next value is 9. The creation order is 3, 20, 7, 15, 9, and reading the finished tree level by level gives the answer.</p>`,
      edges: `<p><b>Empty input:</b> the first call has low above high and returns no node, so the level-order array is empty.</p>
<ul>
  <li><b>One node:</b> the root splits into two empty windows.</li>
  <li><b>Left-skewed tree:</b> the inorder and postorder arrays are equal, and the recursion goes one level deeper per node.</li>
  <li><b>Right-skewed tree:</b> postorder is inorder reversed.</li>
  <li><b>Negative values and zero:</b> only map lookups and comparisons of indexes are used, so the values do not matter.</li>
  <li><b>Trailing nulls:</b> the output loop trims them, so a leaf at the bottom does not leave padding.</li>
  <li><b>Depth:</b> a chain of 3,000 nodes means 3,000 nested calls, which JavaScript allows.</li>
</ul>`,
      followups: [
        "How would you build the tree from preorder and inorder instead, and which side do you build first?",
        "Why can a tree not be rebuilt from preorder and postorder alone when a node can have a single child?",
        "How would you remove the recursion so a degenerate tree of a million nodes cannot overflow the stack?",
        "What goes wrong if the values are not distinct, and what extra information would you need?",
        "How would you check that the two arrays are consistent traversals before building?",
      ],
      slips: `<p>The classic mistake is building the left child before the right one. Reading postorder from the back gives root, right, left, so the order of the two recursive calls matters.</p>
<ul>
  <li>Slicing the arrays on every call, which turns a linear solution into a quadratic one.</li>
  <li>Searching for the root with indexOf on every call instead of building the map once.</li>
  <li>Passing the wrong bounds, for example mid instead of mid plus one for the right window.</li>
  <li>Moving the postorder index inside the wrong branch, so it is shared incorrectly.</li>
  <li>Forgetting to trim trailing nulls when printing the level order.</li>
</ul>`,
    },
    trace: {
      caption: "Nodes in creation order: the root is taken from the back of postorder, then right subtree, then left.",
      head: ["Step", "Next from back", "Inorder window", "Split at", "Creates"],
      rows: [
        ["1", "3", "0 to 4", "1", "root 3"],
        ["2", "20", "2 to 4", "3", "right child of 3"],
        ["3", "7", "4 to 4", "4", "right child of 20"],
        ["4", "15", "2 to 2", "2", "left child of 20"],
        ["5", "9", "0 to 0", "0", "left child of 3"],
      ],
    },
    complexity: { time: "O(n)", space: "O(n)", brute: "O(n²)" },
    solution: {
      entry: "buildTree",
      code: `function buildTree(inorder, postorder) {
  const inorderIndex = new Map();
  inorder.forEach((value, i) => inorderIndex.set(value, i));
  let postIndex = postorder.length - 1;

  function build(low, high) {
    if (low > high) return null;
    const value = postorder[postIndex--];
    const node = { value, left: null, right: null };
    const split = inorderIndex.get(value);
    node.right = build(split + 1, high);
    node.left = build(low, split - 1);
    return node;
  }

  const root = build(0, inorder.length - 1);
  const levels = [];
  const queue = [root];
  for (let head = 0; head < queue.length; head++) {
    const node = queue[head];
    levels.push(node === null ? null : node.value);
    if (node !== null) queue.push(node.left, node.right);
  }
  while (levels.length > 0 && levels[levels.length - 1] === null) levels.pop();
  return levels;
}`,
      cases: [
        {
          args: [
            [9, 3, 15, 20, 7],
            [9, 15, 7, 20, 3],
          ],
          expected: [3, 9, 20, null, null, 15, 7],
        },
        { args: [[], []], expected: [] },
        { args: [[1], [1]], expected: [1] },
        {
          args: [
            [1, 2, 3],
            [1, 2, 3],
          ],
          expected: [3, 2, null, 1],
        },
        {
          args: [
            [1, 2, 3],
            [3, 2, 1],
          ],
          expected: [1, null, 2, null, 3],
        },
        {
          args: [
            [4, 2, 5, 1, 6, 3, 7],
            [4, 5, 2, 6, 7, 3, 1],
          ],
          expected: [1, 2, 3, 4, 5, 6, 7],
        },
        {
          args: [
            [-5, 0, 5],
            [-5, 5, 0],
          ],
          expected: [0, -5, 5],
        },
        {
          args: [
            [2, 1, 3],
            [2, 3, 1],
          ],
          expected: [1, 2, 3],
        },
        {
          args: [
            [40, 10, 30, 20, 50],
            [40, 30, 50, 20, 10],
          ],
          expected: [10, 40, 20, null, null, 30, 50],
        },
        {
          args: [
            [-1, -4, 29, -7, 20, 32, 17, 23, 26, 11, 8, 5, 14, 2],
            [-1, 29, -4, 20, 17, 23, 32, 8, 5, 14, 11, 26, 2, -7],
          ],
          expected: [
            -7,
            -4,
            2,
            -1,
            29,
            26,
            null,
            null,
            null,
            null,
            null,
            32,
            11,
            20,
            23,
            null,
            14,
            null,
            null,
            17,
            null,
            5,
            null,
            null,
            null,
            8,
          ],
        },
        {
          args: [
            [
              20, -7, 86, 29, 53, 74, 35, 110, 38, 77, 8, -4, 32, 59, 89, 62, 104, 11, 2, -1, 98, 41, 14, 17, 80, 68,
              26, 23, 101, 71, 107, 47, 83, 50, 95, 44, 65, 56, 5, 92,
            ],
            [
              20, -7, 29, 86, 35, 74, 110, 8, 77, -4, 59, 32, 38, 62, 104, 89, 53, 2, -1, 98, 14, 41, 80, 17, 26, 23,
              101, 47, 107, 50, 95, 44, 83, 56, 5, 65, 71, 92, 68, 11,
            ],
          ],
          expected: [
            11,
            53,
            68,
            86,
            89,
            17,
            92,
            -7,
            29,
            38,
            104,
            41,
            80,
            71,
            null,
            20,
            null,
            null,
            null,
            110,
            32,
            62,
            null,
            98,
            14,
            null,
            null,
            101,
            65,
            null,
            null,
            74,
            null,
            -4,
            59,
            null,
            null,
            -1,
            null,
            null,
            null,
            23,
            null,
            83,
            5,
            null,
            35,
            77,
            null,
            null,
            null,
            2,
            null,
            26,
            null,
            107,
            44,
            56,
            null,
            null,
            null,
            null,
            8,
            null,
            null,
            null,
            null,
            null,
            47,
            95,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            50,
          ],
        },
      ],
    },
  },
  {
    id: "myntra-max-overlapping-intervals",
    company: "myntra",
    title: "Maximum Overlapping Intervals",
    prompt:
      "Given a list of closed integer intervals [start, end] with start never above end, return the largest number of intervals that contain one common point. Intervals that only touch, like [1,4] and [4,6], do share that point. For [[1,4],[2,5],[9,12],[5,9],[5,12]] the answer is 3, because the point 5 lies in [2,5], [5,9] and [5,12]. There are up to 100,000 intervals, they come in no particular order, and an empty list gives 0.",
    level: "senior SDE",
    difficulty: "Medium",
    pattern: "Sweep line over start and end events",
    patternId: "intervals",
    evidence: "one",
    sources: [
      {
        label: "Myntra Interview Experience for Senior SDE (GeeksforGeeks, undated)",
        url: "https://www.geeksforgeeks.org/?p=369559",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-intervals", "dsa-sweep-line-geometry"],
    answer: {
      ask: `<p>The first question is what overlap means at an endpoint. If one interval ends at 4 and another starts at 4, do they overlap? I will assume yes, because the intervals are closed. Then: are the numbers integers or can they be decimals? Can the input be empty, and what should I return? Can start exceed end? Is the list sorted? Do I return only the count, or also where it happens? How many intervals are there, and how large can the coordinates be, since that rules out a counting array over the whole range?</p>
<p>Assumptions: closed intervals, start at most end, unsorted, up to 100,000 intervals, only the count is needed, and coordinates may be large or negative.</p>`,
      brute: `<p>The obvious solution is to try every candidate point. The best point can always be taken to be the start of some interval, so for each interval take its start and count how many intervals contain it. Keep the largest count.</p>
<p>That is simple and correct, but it makes n candidates and counts n intervals for each, so it is O(n²). At 100,000 intervals that is ten billion containment checks, far too slow. A second idea, an array that adds one for every integer covered, depends on the coordinate range instead of n, so it fails when the numbers reach billions. The waste in the first version is that every candidate recounts intervals that are obviously far away.</p>`,
      insight: `<p>The pattern is a <b>sweep line over start and end events</b>. Picture a vertical line moving left to right. Its count of open intervals goes up when it reaches a start and down when it passes an end. The answer is the highest the count ever gets.</p>
<p>To do this without events objects, sort the starts and the ends as two separate lists. The ends do not need to stay paired with their starts, because we only count how many intervals are open, not which ones. Then process the starts in order. Before opening the interval at this start, close every interval whose end is strictly smaller than the start. After that, the open count is exactly the number of intervals that contain this point. Add one for the new interval and update the maximum.</p>
<p>Why strictly smaller? Because the intervals are closed. An interval ending at 5 still contains the point 5, so a new interval starting at 5 overlaps it. If the problem used half-open intervals, the test would become less-than-or-equal.</p>
<p>Why is it correct? The maximum overlap happens at some interval's start: if the best point is not a start, slide it left to the nearest start and no interval is lost. At each start, the open count is the number of earlier starts minus the number of ends strictly before it. Every interval that ended before this start must have started before it too, so the subtraction is exact.</p>
<p>Out loud: "Sort starts, sort ends, sweep the starts, retire the ended ones first, and track the peak."</p>`,
      walkthrough: `<p>Take [[1,4],[2,5],[9,12],[5,9],[5,12]]. The sorted starts are 1, 2, 5, 5, 9 and the sorted ends are 4, 5, 9, 12, 12.</p>
<p>At start 1 nothing has ended, so the open count becomes 1. At start 2 the smallest end, 4, is not below 2, so the count becomes 2. At the first start 5 the end 4 is below 5 and is retired, so the count drops to 1 and the new interval lifts it to 2. At the second start 5 the next end is 5, which is not below 5, so the count rises to 3. That is the peak so far. At start 9 the end 5 retires, giving 2, then 9 is not below 9, and the count rises to 3 again. The answer is 3.</p>`,
      edges: `<p><b>Empty list:</b> the loop never runs and the best stays at 0.</p>
<ul>
  <li><b>One interval:</b> the count rises to 1, so the answer is 1.</li>
  <li><b>Touching intervals:</b> an end equal to a start is not retired, so [1,4] and [4,6] count as 2.</li>
  <li><b>Identical intervals:</b> every copy opens before any ends, so three copies give 3.</li>
  <li><b>Disjoint intervals:</b> each is retired before the next opens, so the answer is 1.</li>
  <li><b>Nested intervals:</b> the outer one stays open while the inner ones come and go, adding at most 1 at a time.</li>
  <li><b>Negatives and large values:</b> only comparisons are used, and the sort uses a numeric comparator.</li>
  <li><b>Input unchanged:</b> the code builds new arrays for starts and ends.</li>
</ul>`,
      followups: [
        "How would you return the point, or the range of points, where the peak overlap happens?",
        "How would the loop change if intervals were half-open, so that touching intervals do not overlap?",
        "How would you answer this for a stream of intervals using a min-heap of end times?",
        "How would you compute the minimum number of rooms needed for a set of meetings, and is it the same problem?",
      ],
      slips: `<p>The most common bug is the endpoint test. Retiring an interval when its end is less than or equal to the next start gives the wrong answer for closed intervals.</p>
<ul>
  <li>Calling sort without a numeric comparator, so 10 sorts before 9.</li>
  <li>Processing the ends first in a merged event list, which undercounts touching intervals.</li>
  <li>Taking the maximum only when a start is processed but forgetting to retire ended intervals first.</li>
  <li>Assuming the ends must stay paired with their starts, and building a more complicated structure than needed.</li>
  <li>Allocating an array over the full coordinate range, which breaks on large numbers.</li>
</ul>`,
    },
    trace: {
      caption: "Sweep over the sorted starts. Ends strictly below the start are retired before the new interval opens.",
      head: ["Step", "Start", "Ends retired", "Open count", "Best so far"],
      rows: [
        ["1", "1", "none", "1", "1"],
        ["2", "2", "none (4 is not < 2)", "2", "2"],
        ["3", "5", "4", "2", "2"],
        ["4", "5", "none (5 is not < 5)", "3", "3"],
        ["5", "9", "5", "3", "3"],
      ],
    },
    complexity: { time: "O(n log n)", space: "O(n)", brute: "O(n²)" },
    solution: {
      entry: "maxOverlap",
      code: `function maxOverlap(intervals) {
  const starts = intervals.map((pair) => pair[0]).sort((a, b) => a - b);
  const ends = intervals.map((pair) => pair[1]).sort((a, b) => a - b);
  let open = 0;
  let best = 0;
  let endIndex = 0;

  for (const start of starts) {
    while (ends[endIndex] < start) {
      open--;
      endIndex++;
    }
    open++;
    best = Math.max(best, open);
  }

  return best;
}`,
      cases: [
        {
          args: [
            [
              [1, 4],
              [2, 5],
              [9, 12],
              [5, 9],
              [5, 12],
            ],
          ],
          expected: 3,
        },
        { args: [[]], expected: 0 },
        { args: [[[3, 3]]], expected: 1 },
        {
          args: [
            [
              [1, 4],
              [4, 6],
            ],
          ],
          expected: 2,
        },
        {
          args: [
            [
              [1, 2],
              [1, 2],
              [1, 2],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [1, 2],
              [3, 4],
              [5, 6],
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
              [-5, -1],
              [-3, 2],
              [-2, 0],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [7, 8],
              [5, 9],
              [1, 2],
              [6, 7],
            ],
          ],
          expected: 3,
        },
        {
          args: [
            [
              [24, 24],
              [-3, 9],
              [10, 13],
              [6, 11],
              [-2, 5],
              [-6, 2],
              [-12, -8],
              [-8, -4],
              [-17, -15],
              [-9, 5],
              [35, 40],
              [-18, -10],
              [34, 41],
              [-19, -15],
              [24, 39],
              [-19, -16],
              [35, 49],
              [25, 34],
              [-14, -7],
              [-19, -18],
              [-4, -2],
              [9, 21],
              [7, 10],
              [5, 5],
              [14, 18],
            ],
          ],
          expected: 5,
        },
      ],
    },
  },
  {
    id: "myntra-first-non-repeating-stream",
    company: "myntra",
    title: "First Non-Repeating Character in a Stream",
    prompt: `Characters arrive one at a time. After each arrival, report the first character that has appeared exactly once so far, or # if no character is unique, and return all the reports joined into one string. For the stream "mamas" the answer is "mma#s". There are up to 100,000 characters, and each report must be cheap because the stream never stops.`,
    level: "senior SDE",
    difficulty: "Medium",
    pattern: "Queue plus counts",
    patternId: "hash",
    evidence: "one",
    sources: [
      {
        label: "Myntra Interview Experience for Senior SDE (GeeksforGeeks, undated)",
        url: "https://www.geeksforgeeks.org/?p=369559",
        kind: "candidate-report",
      },
    ],
    chapters: ["dsa-hashing", "dsa-stacks-queues"],
    answer: {
      ask: `<p>I would ask what "first" means: the earliest arrival among the characters that are still unique. Which characters can appear: only lowercase letters, or any character? Is the stream given as a whole string, or arriving through a call, and does the caller need the answer after every character? What should be reported when nothing is unique: a marker like #? And how long can the stream be, to know if rescanning is affordable?</p>
<p>Assumptions I would state: any characters are possible, the answer after every character is needed, # means none is unique, and the stream can reach 100,000 characters.</p>`,
      brute: `<p>After each new character, count every character of the prefix seen so far, then scan the prefix from the left and report the first one whose count is 1. Another version keeps a count map but still scans the whole prefix for the first unique character.</p>
<p>Either way, each report costs O(n), so the whole stream costs O(n²). At 100,000 characters that is around five billion steps, too slow, and it also gets worse the longer the stream runs. The scan is wasted work: the answer changes only a little between two steps, yet we rebuild it from scratch every time.</p>`,
      insight: `<p>The pattern is <b>queue plus counts</b>. Keep a count of each character, and keep a queue of the characters in the order of their first arrival. The answer is always the first character in the queue that is still unique.</p>
<p>When a character arrives, add one to its count. If the count is now 1, it is new, so push it at the back of the queue. If it is 2 or more, it is a repeat and it is not pushed again. Then look at the front of the queue: while the front character has a count above 1, it can never be unique again, so drop it. After that, the front, if there is one, is the answer. If the queue is empty, report #.</p>
<p>Why is it correct? A character's count only goes up, so once it is repeated it stays repeated, and dropping it from the front is safe forever. The queue holds characters in the order of first arrival, so the first one that is still unique is the earliest unique character. Characters behind the front that have become repeats are not removed yet, but they are removed the moment they reach the front, and until then they are never reported.</p>
<p>Each character is pushed at most once and dropped at most once, so the total work over the whole stream is linear, which is O(1) per character on average. In JavaScript, do not use shift to drop from a plain array, since that can cost O(n). Move a head index forward instead. Map lookups are O(1) on average.</p>
<p>Out loud: "Counts for repeats, a queue for first-arrival order, and clean the front before answering."</p>`,
      walkthrough: `<p>Take the stream "mamas". The table shows the live part of the queue (from the head onward) after each step.</p>
<p>The first m is new, so it enters the queue and is reported. The a enters behind it, and m stays in front. The second m raises its count to 2, so m is dropped from the front and a becomes the answer. The second a raises its count to 2 and is dropped too, leaving the queue empty, so the report is #. The s enters the empty queue and is reported. The reports are m, m, a, #, s, giving "mma#s".</p>`,
      edges: `<p><b>Empty stream:</b> there are no steps, so the output is an empty string.</p>
<ul>
  <li><b>All different:</b> the front never changes, so every report is the first character.</li>
  <li><b>All the same:</b> the first report is the character and every later one is #.</li>
  <li><b>A character repeating many times:</b> it is pushed once only, because the push happens only when the count becomes 1.</li>
  <li><b>A repeat that is not at the front:</b> its count rises but nothing is dropped until it reaches the front.</li>
  <li><b>Any characters:</b> spaces, digits and capitals work, since the map does not care.</li>
  <li><b>Queue growth:</b> the queue holds at most one entry per distinct character.</li>
</ul>`,
      followups: [
        "How would you build this as a class with an add method and a query method that returns the current answer in O(1)?",
        "How would you do it with a doubly linked list and a map so that a repeated character is removed at once instead of lazily?",
        "How would you find the first non-repeating character of a plain string, in one pass over the counts and one pass to pick?",
        "How would the design change if the stream is huge and the distinct characters do not fit in memory?",
      ],
      slips: `<p>A common mistake is pushing a character onto the queue every time it arrives, which fills it with repeats and breaks the amount of work.</p>
<ul>
  <li>Cleaning the queue only once, instead of looping while the front is a repeat.</li>
  <li>Calling array shift in a loop, which can make the whole thing quadratic.</li>
  <li>Forgetting to answer # when the queue runs empty, and returning undefined.</li>
  <li>Reporting the most recent unique character instead of the earliest one.</li>
  <li>Using the queue itself to test for repeats, instead of a count map.</li>
</ul>`,
    },
    trace: {
      caption: "Stream mamas: live queue is the part from the head onward; the front is the report.",
      head: ["Step", "Char in", "Count of char", "Live queue", "Report"],
      rows: [
        ["1", "m", "1", "m", "m"],
        ["2", "a", "1", "m a", "m"],
        ["3", "m", "2", "a", "a"],
        ["4", "a", "2", "(empty)", "#"],
        ["5", "s", "1", "s", "s"],
      ],
    },
    complexity: { time: "O(n)", space: "O(k) for k distinct characters, plus the output", brute: "O(n²)" },
    solution: {
      entry: "firstNonRepeating",
      code: `function firstNonRepeating(stream) {
  const counts = new Map();
  const queue = [];
  let head = 0;
  let output = "";

  for (const char of stream) {
    const count = (counts.get(char) ?? 0) + 1;
    counts.set(char, count);
    if (count === 1) queue.push(char);
    while (head < queue.length && counts.get(queue[head]) > 1) head++;
    output += head < queue.length ? queue[head] : "#";
  }

  return output;
}`,
      cases: [
        { args: ["mamas"], expected: "mma#s" },
        { args: [""], expected: "" },
        { args: ["a"], expected: "a" },
        { args: ["aa"], expected: "a#" },
        { args: ["abc"], expected: "aaa" },
        { args: ["aabb"], expected: "a#b#" },
        { args: ["abcabc"], expected: "aaabc#" },
        { args: ["zzzzz"], expected: "z####" },
        { args: ["ab ba b"], expected: "aaaa ##" },
        {
          args: ["366164414661522355246003663211660303324246231223063545465621"],
          expected: "3333333333333335#####0######################################",
        },
      ],
    },
  },
];
