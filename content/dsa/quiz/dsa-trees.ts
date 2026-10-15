import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "tree-subtree-size-order",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-traversal",
      section: "the-three-depth-first-traversal-orders",
      placement: true,
      kind: "single",
      prompt:
        "<p>You want a traversal whose visit step records every node's subtree size using the sizes already known for its two children, with no second pass. Where does the visit step belong?</p>",
      choices: [
        {
          id: "a",
          text: "Before both recursive calls, as in pre-order.",
          why: "At that moment neither child has been looked at, so neither subtree's size is known. Pre-order suits copying a tree, where the parent has to exist before its children.",
        },
        {
          id: "b",
          text: "Between the two recursive calls, as in in-order.",
          why: "The left subtree is finished by then, but the right subtree has not been visited yet, so only half of the size is known. In-order is the one that gives sorted output on a BST.",
        },
        {
          id: "c",
          text: "After both recursive calls, as in post-order.",
          why: "Both subtrees are complete before the node is visited, so <code>1 + left + right</code> can be computed right there. Any value that is built from the children's results, such as a height or a size, wants this order.",
        },
        {
          id: "d",
          text: "In a level-order walk that uses a queue.",
          why: "Level order visits a node before any of its descendants, because they sit on deeper levels that are reached later. Nothing below the node has been counted at the moment it is visited.",
        },
      ],
      answer: "c",
    },
    {
      id: "tree-level-by-level",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-traversal",
      section: "breadth-first-level-order-the-one-traversal-that-isn-t-depth",
      placement: true,
      kind: "single",
      prompt:
        "<p>A binary tree has to be reported as rows: the root alone first, then every node at depth 1, then every node at depth 2, and so on. Which approach is the natural fit?</p>",
      choices: [
        {
          id: "a",
          text: "Breadth-first with a queue, snapshotting its length for each row.",
          why: "The queue hands nodes back in the order they were added, so a whole level comes out before the next one starts. The snapshot, <code>levelSize</code>, marks where each row ends.",
        },
        {
          id: "b",
          text: "Pre-order, because it visits the root first and so shallower nodes come out first.",
          why: "Pre-order dives before it spreads. With root 1, left child 2 (which has a child 4) and right child 3, it gives 1, 2, 4, 3, and 4 at depth 2 arrives before 3 at depth 1.",
        },
        {
          id: "c",
          text: "The same row-by-row loop, but with a stack in place of the queue.",
          why: "A stack hands back the most recently pushed node first, so the walk goes down one branch before returning to the rest of the row. That is the shape of iterative pre-order, not of level order.",
        },
        {
          id: "d",
          text: "In-order, because it gives the nodes in a fixed left-to-right order.",
          why: "In-order puts a node between its two subtrees, so for root 1 with children 2 and 3 it gives 2, 1, 3. The root lands between its two children, which belong to the next row, and nothing separates one depth from the next.",
        },
      ],
      answer: "a",
    },
    {
      id: "tree-nearest-leaf",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-traversal",
      section: "recognizing-it-in-an-unseen-problem",
      placement: true,
      kind: "single",
      prompt:
        "<p>A very large binary tree is given by its root. You want the depth of the nearest leaf, the one with the fewest edges from the root, and you want to be able to stop as soon as the answer is known instead of visiting every node. Which traversal always gives the right depth and also allows that?</p>",
      choices: [
        {
          id: "a",
          text: "Pre-order, stopping at the first leaf it reaches.",
          why: "Depth-first goes straight down the first branch it takes, so the first leaf it reaches can be far from the root. If the root has a long left chain and a leaf as its right child, the chain's end is reached first.",
        },
        {
          id: "b",
          text: "In-order, stopping at the first leaf it reaches.",
          why: "In-order starts at the bottom of the left spine, which can be deep, and the order says nothing about depth. The first leaf it meets is not necessarily the nearest one.",
        },
        {
          id: "c",
          text: "Post-order, combining each node's answer from its two children.",
          why: "The combined answer is correct, but in its usual form a node can only report after both of its subtrees are finished, so every node gets visited. It cannot stop early.",
        },
        {
          id: "d",
          text: "Level order, stopping at the first leaf it takes off the queue.",
          why: "Level order takes nodes off the queue in order of depth, so the first leaf to come off is a nearest one. Everything deeper never has to be visited.",
        },
      ],
      answer: "d",
    },
    {
      id: "tree-kth-smallest-bst",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-traversal",
      section: "doing-it-without-recursion-a-near-guaranteed-follow-up",
      kind: "single",
      prompt:
        "<p>A BST holds n distinct values. You need its third smallest value and want to touch only a handful of nodes on the way instead of all n. Which approach fits?</p>",
      choices: [
        {
          id: "a",
          text: "Level order, taking the third value that comes off the queue as the answer.",
          why: "The first nodes off the queue are the root and its children, and a BST gives no reason for those to be the smallest values in the tree.",
        },
        {
          id: "b",
          text: "Iterative in-order with a stack, stopping after the third visit.",
          why: "In-order on a BST visits the values in ascending order, and the explicit stack lets you stop in the middle of the walk. The work is about the height of the tree plus three visits, not n.",
        },
        {
          id: "c",
          text: "Pre-order into a list of every value, then sort the list.",
          why: "This gives the right answer, but it visits all n nodes and then sorts them, and it ignores the BST property completely.",
        },
        {
          id: "d",
          text: "Post-order, taking the third value it visits as the answer.",
          why: "Post-order visits children before parents, not smaller values before larger ones. For a root 5 whose left child 3 has a right child 4, and whose right child is 8, it starts 4, 3, 8, which is not the three smallest.",
        },
      ],
      answer: "b",
    },
    {
      id: "tree-recursion-depth",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "complexity",
      pattern: "tree-traversal",
      section: "complexity-the-numbers-to-state-out-loud",
      kind: "single",
      prompt:
        "<p>The recursive <code>inOrder(node, out)</code> from the chapter runs on a binary tree with n nodes. Not counting the <code>out</code> array, what is its worst-case extra space, taken over all tree shapes with n nodes, when the cost is the call stack?</p>",
      choices: [
        {
          id: "a",
          text: "O(1), because recursion adds no memory of its own.",
          why: "Every call that has not returned yet keeps its own frame on the call stack, so recursion does use memory, in proportion to how deep the calls nest.",
        },
        {
          id: "b",
          text: "O(log n), because the tree is halved at every step.",
          why: "That holds only when the tree is balanced. A tree whose nodes all have just a left child makes the calls nest n deep, because nothing is halved.",
        },
        {
          id: "c",
          text: "O(n log n), because each of the n nodes makes calls that go log n deep.",
          why: "The calls are not repeated for every node. The stack holds one chain of calls at a time, from the root down to the node being visited, so its depth stays within the height of the tree plus a constant and never multiplies by n.",
        },
        {
          id: "d",
          text: "O(n), reached by a tree that is a single chain.",
          why: "The stack depth grows with the height of the tree, and a chain of n nodes has height n - 1. That is the unbalanced worst case, the same one that makes BST operations O(n).",
        },
      ],
      answer: "d",
    },
    {
      id: "tree-queue-width",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "complexity",
      pattern: "tree-traversal",
      section: "complexity-the-numbers-to-state-out-loud",
      kind: "single",
      prompt:
        "<p>The chapter's <code>levelOrder</code> runs on a perfect binary tree of 15 nodes, which is four full levels of 1, 2, 4 and 8 nodes. What is the largest number of nodes the queue holds at the same moment?</p>",
      choices: [
        {
          id: "a",
          text: "4",
          why: "That is the number of levels, which is about how deep a recursive walk nests. The queue is limited by how wide a level is, not by how many there are.",
        },
        {
          id: "b",
          text: "8",
          why: "After the last node of the third level is processed, the queue holds all eight leaves. For a perfect tree the widest level holds about half of the nodes, so the queue's space is O(n).",
        },
        {
          id: "c",
          text: "7",
          why: "That is how many nodes sit above the last level, 1 + 2 + 4. They have already left the queue by the time the leaves are all waiting in it.",
        },
        {
          id: "d",
          text: "15",
          why: "A node leaves the queue as soon as it is processed, so the queue never holds the whole tree. At most the widest level, here 8 nodes, is waiting at once.",
        },
      ],
      answer: "b",
    },
    {
      id: "tree-swapped-pushes",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-traversal",
      section: "doing-it-without-recursion-a-near-guaranteed-follow-up",
      kind: "single",
      prompt:
        "<p>The two pushes of the iterative pre-order are written in the other order. What does <code>walk(root)</code> return?</p><pre><code>const node = (val, left = null, right = null) =&gt; ({ val, left, right });\nconst root = node(6, node(2, null, node(4)), node(9, node(7), null));\n\nfunction walk(root) {\n  const result = [];\n  const stack = [root];\n  while (stack.length) {\n    const current = stack.pop();\n    result.push(current.val);\n    if (current.left) stack.push(current.left);\n    if (current.right) stack.push(current.right);\n  }\n  return result;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>[6, 2, 4, 9, 7]</code>",
          why: "That is real pre-order, which is what the chapter's order of pushes gives, with the right child pushed first. Here the left child is pushed first, so the right one is popped first.",
        },
        {
          id: "b",
          text: "<code>[4, 2, 7, 9, 6]</code>",
          why: "That is post-order. The walk still pops a node and records it before any of its children, so the root 6 cannot come last.",
        },
        {
          id: "c",
          text: "<code>[6, 9, 7, 2, 4]</code>",
          why: "Popping 6 pushes 2 then 9, so 9 is on top and is taken next, then its child 7, and only then 2 and its child 4. It is pre-order with right visited before left.",
        },
        {
          id: "d",
          text: "<code>[6, 9, 2, 7, 4]</code>",
          why: "That is level order from right to left. A stack goes down before it goes across, so after 9 comes its child 7, not 2.",
        },
      ],
      answer: "c",
    },
    {
      id: "tree-order-inorder-loop",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-traversal",
      section: "doing-it-without-recursion-a-near-guaranteed-follow-up",
      kind: "order",
      prompt:
        "<p>Put one pass of the outer <code>while</code> loop of <code>inOrderIterative</code> in the order it runs. Start with the inner loop that walks left and end with the step that moves to the right child.</p><pre><code>function inOrderIterative(root) {\n  const result = [];\n  const stack = [];\n  let curr = root;\n  while (curr !== null || stack.length) {\n    while (curr !== null) {\n      stack.push(curr);\n      curr = curr.left;\n    }\n    curr = stack.pop();\n    result.push(curr.val);\n    curr = curr.right;\n  }\n  return result;\n}</code></pre>",
      items: [
        {
          id: "walk",
          text: "Run the inner <code>while</code>: push <code>curr</code> and step to <code>curr.left</code> until <code>curr</code> is <code>null</code>.",
        },
        { id: "pop", text: "Pop the most recently pushed node off the stack into <code>curr</code>." },
        { id: "record", text: "Push <code>curr.val</code> onto <code>result</code>." },
        { id: "right", text: "Set <code>curr = curr.right</code>." },
      ],
      why: "The inner loop ends only when <code>curr</code> is <code>null</code>, so the node to visit has to be popped before its value can be read. The value must be recorded before <code>curr</code> moves to the right child, because that assignment replaces the node that was just visited.",
    },
    {
      id: "tree-null-guard",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-traversal",
      section: "breadth-first-level-order-the-one-traversal-that-isn-t-depth",
      kind: "single",
      prompt:
        "<p>In <code>levelOrder</code>, the two guarded lines <code>if (node.left) queue.push(node.left);</code> and <code>if (node.right) queue.push(node.right);</code> are replaced by the unguarded <code>queue.push(node.left);</code> and <code>queue.push(node.right);</code>. What happens for <code>levelOrder({ val: 1, left: null, right: null })</code>?</p>",
      choices: [
        {
          id: "a",
          text: "It throws a <code>TypeError</code> on the second pass of the outer loop.",
          why: "The first pass pushes two <code>null</code> values, and <code>levelSize</code> now counts them. The second pass dequeues one and reads <code>node.val</code> on <code>null</code>, which throws.",
        },
        {
          id: "b",
          text: "It returns <code>[[1]]</code>, because null children are skipped when they are read.",
          why: "Nothing skips them. Once a <code>null</code> is in the queue it is counted by <code>levelSize</code> and dequeued like any node, which is why the guards are needed.",
        },
        {
          id: "c",
          text: "It returns <code>[[1], [null, null]]</code>, one row for the two missing children.",
          why: "Recording a <code>null</code> child would need <code>node.val</code> to give <code>null</code>, but reading a property of <code>null</code> throws before anything is recorded.",
        },
        {
          id: "d",
          text: "It never returns, because the queue is refilled with <code>null</code> forever.",
          why: "The loop stops at the second pass, because the first <code>null</code> taken off the queue throws. Nothing keeps running to refill it.",
        },
      ],
      answer: "a",
    },
    {
      id: "tree-insertion-order",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-traversal",
      section: "the-bst-property-drawn",
      kind: "single",
      prompt:
        "<p>The values 1 to 7 are inserted one at a time into an empty BST that never rebalances, with smaller values going left and larger values going right. Which insertion order gives the shortest tree?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1, 2, 3, 4, 5, 6, 7</code>",
          why: "Each new value is larger than everything so far, so it always goes right. The tree is a straight line of height 6, and searching it is O(n).",
        },
        {
          id: "b",
          text: "<code>4, 3, 2, 1, 5, 6, 7</code>",
          why: "It starts with the middle value, but 3, 2, 1 form a left chain and 5, 6, 7 a right chain. The height is 3, which is more than the best possible 2.",
        },
        {
          id: "c",
          text: "<code>4, 2, 6, 1, 3, 5, 7</code>",
          why: "Each value fills the next free spot of a complete tree: 4 is the root, 2 and 6 its children, and 1, 3, 5, 7 the leaves. The height is 2, the least a tree with 7 nodes can have.",
        },
        {
          id: "d",
          text: "<code>1, 7, 2, 6, 3, 5, 4</code>",
          why: "Alternating between the smallest and largest values left over looks balanced, but each new value falls between the previous two and goes one level deeper. The height ends up 6, as bad as sorted input.",
        },
      ],
      answer: "c",
    },
    {
      id: "tree-always-true",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-traversal",
      section: "the-three-depth-first-traversal-orders",
      kind: "multi",
      prompt:
        "<p>Select every statement that is true for any non-empty binary tree with distinct values, not only for a BST.</p>",
      choices: [
        {
          id: "a",
          text: "The first value in the in-order list is the root.",
          why: "In-order starts with the leftmost node. That is the root only when the root has no left child.",
        },
        {
          id: "b",
          text: "The first value in the pre-order list is the root.",
          why: "Pre-order visits the node before both recursive calls, so the root is always first. That is what lets a pre-order list start a rebuild.",
        },
        {
          id: "c",
          text: "The in-order list is sorted from smallest to largest.",
          why: "That is a property of a BST. In an ordinary binary tree the values can be in any arrangement, and in-order just lists them in left, node, right order.",
        },
        {
          id: "d",
          text: "The last value in the post-order list is the root.",
          why: "Post-order visits the node after both recursive calls, so the root always comes last.",
        },
      ],
      answers: ["b", "d"],
    },
    {
      id: "tree-mirror-decides",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-traversal",
      section: "the-recursion-template-base-case-trust-the-children-combine",
      kind: "single",
      prompt:
        "<p>The chapter's <code>isSymmetric</code> runs on a tree whose root 1 has two children, both with value 2. Each 2 has no left child and a right child 3. What does it return, and what decides it?</p>",
      choices: [
        {
          id: "a",
          text: "<code>true</code>, because both subtrees look the same.",
          why: "Symmetric means the right side is the mirror image of the left, not a copy of it. A copy of the left side would need the 3 on the same side in both subtrees, and a mirror needs it on opposite sides.",
        },
        {
          id: "b",
          text: "<code>false</code>, decided by the first call <code>mirror(2, 2)</code> when it compares an empty left child with the 3 on the other side.",
          why: "The two 2's have equal values, so the call goes on to <code>mirror(a.left, b.right)</code>. Here <code>a.left</code> is empty and <code>b.right</code> is the node 3, and one side being empty while the other is not returns <code>false</code> straight away.",
        },
        {
          id: "c",
          text: "<code>false</code>, because the values 3 and 2 differ.",
          why: "The function never compares a 3 with a 2. The values on the two sides are the same, and what differs is where the 3 sits, so the answer comes from a missing child, not from a mismatched value.",
        },
        {
          id: "d",
          text: "It throws a <code>TypeError</code>, because it reads <code>.val</code> on an empty child.",
          why: "The two checks before the comparison, <code>a === null &amp;&amp; b === null</code> and <code>a === null || b === null</code>, return before <code>.val</code> is read, so no empty node is ever dereferenced.",
        },
      ],
      answer: "b",
    },
    {
      id: "tree-min-depth-chain",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-traversal",
      section: "minimum-depth-the-one-child-trap",
      kind: "single",
      prompt:
        "<p>A function computes minimum depth, counted in nodes down to a leaf, as <code>1 + Math.min(depth(node.left), depth(node.right))</code>, with <code>depth(null)</code> equal to <code>0</code>. What does it return for the tree <code>1 → 2 → 3</code>, where each node's only child is its right child?</p>",
      choices: [
        {
          id: "a",
          text: "<code>1</code>, although the correct answer is <code>3</code>.",
          why: "The root's left child is empty, so the minimum picks that side's <code>0</code> and the result is <code>1 + 0</code>. But the root is not a leaf, and the only leaf is the node 3, three nodes down.",
        },
        {
          id: "b",
          text: "<code>2</code>, which is the average of the possible answers.",
          why: "The function never averages anything. It takes the smaller of two numbers, and one of them is the <code>0</code> of the empty left side.",
        },
        {
          id: "c",
          text: "<code>3</code>, because the minimum is taken over the leaf side only.",
          why: "The code does not skip empty children. It takes the minimum of both sides, empty one included, which is what makes it wrong.",
        },
        {
          id: "d",
          text: "<code>0</code>, because <code>Math.min</code> of an empty side and a real side is always <code>0</code>.",
          why: "The 0 is only the smaller side inside the root's call, where the result is <code>1 + 0 = 1</code>. The function never returns 0 for a non-empty tree, since every call adds 1.",
        },
      ],
      answer: "a",
    },
    {
      id: "tree-direction-of-flow",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-traversal",
      section: "top-down-versus-bottom-up-which-way-does-the-information-flo",
      kind: "single",
      prompt:
        "<p>For every node you must decide something that depends on the sum of the values on the path from the root down to that node. Which way does the information naturally flow?</p>",
      choices: [
        {
          id: "a",
          text: "Up from the leaves, as the return value of each call.",
          why: "A call's return value describes the subtree below it. The sum of the path above a node is not something its children know, so it cannot come back up from them.",
        },
        {
          id: "b",
          text: "Both ways at once, with every call returning the path sum.",
          why: "The path sum for a node is fixed by its ancestors alone. Nothing the subtree returns changes it, so only one direction is needed.",
        },
        {
          id: "c",
          text: "Sideways, from each node to its sibling.",
          why: "A sibling is not on the path from the root, so its value does not belong in the sum.",
        },
        {
          id: "d",
          text: "Down from the root, as an extra parameter such as <code>sumSoFar</code> that each call passes on to its children.",
          why: "Each node can compute its own sum from its parent's sum plus its own value. A parameter carries that fact down, and the recursion needs no second pass.",
        },
      ],
      answer: "d",
    },
    {
      id: "tree-subtree-cost",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "complexity",
      pattern: "tree-traversal",
      section: "is-one-tree-inside-another-subtree-of-another-tree",
      kind: "single",
      prompt:
        "<p><code>isSubtree(root, subRoot)</code> from the chapter runs on a tree with <code>n</code> nodes and a <code>subRoot</code> with <code>m</code> nodes. Over all inputs of those sizes, what is its worst-case time?</p>",
      choices: [
        {
          id: "a",
          text: "O(n + m), because every node of both trees is looked at once.",
          why: "That is the cost of the string version with a linear-time substring search. The recursive version can compare the whole of <code>subRoot</code> again at many different nodes of <code>root</code>.",
        },
        {
          id: "b",
          text: "O(n log m), because each comparison skips half of <code>subRoot</code>.",
          why: "Nothing is halved. A comparison goes on until the first mismatch, and in a bad case that is after about <code>m</code> nodes.",
        },
        {
          id: "c",
          text: "O(n · m), for a root that is a long run of equal values and a <code>subRoot</code> that ends in a different one.",
          why: "Every node of the run starts a comparison that walks nearly all of <code>subRoot</code> before it finds the one value that differs. That is n starts of about m steps each.",
        },
        {
          id: "d",
          text: "O(n), because <code>isSameTree</code> stops at the first mismatch.",
          why: "Stopping early only helps on typical inputs. In the worst case the mismatch is found at the very end of <code>subRoot</code>, so each of the <code>n</code> starts still costs about <code>m</code>.",
        },
      ],
      answer: "c",
    },
    {
      id: "tree-flatten-next",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-traversal",
      section: "flattening-a-tree-into-a-linked-list-in-place",
      kind: "single",
      prompt:
        "<p>The chapter's <code>flatten</code> runs on this tree: the root 1 has left child 2 and right child 5; the node 2 has children 3 and 4; the node 5 has only a right child 6. Once it has finished, which node does <code>3.right</code> point to?</p>",
      choices: [
        {
          id: "a",
          text: "The node 5, the old right child of the root.",
          why: "In pre-order, 5 comes after 4, so it is the successor of 4, not of 3. The node 3 is followed by the node 4.",
        },
        {
          id: "b",
          text: "<code>null</code>, because 3 is a leaf.",
          why: "A leaf's <code>right</code> is <code>null</code> before the call, but <code>flatten</code> overwrites it. Every node except the last one in pre-order ends up pointing at its successor.",
        },
        {
          id: "c",
          text: "The node 2, its parent.",
          why: "The chain only goes forward in pre-order. A node's parent comes before it, so the parent's <code>right</code> leads to the child, not the other way round.",
        },
        {
          id: "d",
          text: "The node 4, because 4 is next after 3 in pre-order.",
          why: "Pre-order of the original tree is 1, 2, 3, 4, 5, 6. Visiting in the order 6, 5, 4, 3, 2, 1 means that when 3 is visited, <code>prev</code> holds 4, which is assigned to <code>3.right</code>.",
        },
      ],
      answer: "d",
    },
    {
      id: "tree-null-array-position",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-traversal",
      section: "trees-that-are-not-made-of-pointers-arrays-and-n-ary-nodes",
      kind: "single",
      prompt:
        "<p>The level-order array <code>[1, null, 2, 3]</code> describes a binary tree, with <code>null</code> for a missing child and no entries for the children of a missing node. Where is the node 3?</p>",
      choices: [
        {
          id: "a",
          text: "The right child of the node 2.",
          why: "The root 1 takes the next two entries, <code>null</code> and 2, as its left and right child. The queue then holds only the node 2, and its left child is the next entry, 3. The right child would be a further entry, and the array has none.",
        },
        {
          id: "b",
          text: "The left child of the root, at index <code>2 · 0 + 1</code>.",
          why: "The root's left child is the entry at index 1, which is <code>null</code>. The index formula only holds for a complete tree, and this array leaves out the children of the missing node.",
        },
        {
          id: "c",
          text: "The left child of the node 2.",
          why: "The root's children are the entries at index 1 and 2: <code>null</code> and 2. The only node waiting for children is then the 2, and the next entry, 3, becomes its left child.",
        },
        {
          id: "d",
          text: "The right child of the root, replacing the 2.",
          why: "The root's right child is the entry at index 2, which is 2. Entry 3 comes after it, so it belongs to a node that is further down.",
        },
      ],
      answer: "c",
    },
    {
      id: "tree-array-facts",
      chapter: "dsa-trees",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-traversal",
      section: "trees-that-are-not-made-of-pointers-arrays-and-n-ary-nodes",
      kind: "multi",
      prompt:
        "<p>A binary tree is stored in an array with 0-based indices, the root at index 0. Select every statement that is true.</p>",
      choices: [
        {
          id: "a",
          text: "The parent of index <code>i</code> (for <code>i &gt; 0</code>) is <code>Math.floor((i - 1) / 2)</code>.",
          why: "Dividing is the inverse of the child formulas <code>2p + 1</code> and <code>2p + 2</code>: for <code>i = 5</code> the result is 2, and for <code>i = 6</code> it is 2 as well, the same parent for two siblings.",
        },
        {
          id: "b",
          text: "The children of the node at index 4 are at indices 8 and 9.",
          why: "Those are the children when the root is counted from 1. With the root at 0 the children of index 4 are at <code>2 · 4 + 1 = 9</code> and <code>2 · 4 + 2 = 10</code>.",
        },
        {
          id: "c",
          text: "A tree of five nodes that is a chain of right children needs an array of 31 slots.",
          why: "The node at depth <code>d</code> of a right-only chain sits at index <code>2^(d + 1) − 2</code>: 0, 2, 6, 14, and 30 for the fifth node. The array needs slots up to index 30, so 31 in all, and 26 of them stay empty.",
        },
        {
          id: "d",
          text: "Every binary tree can be stored this way without wasted slots.",
          why: "Only a complete tree has no gaps. A tree that is a long chain or has a missing node high up leaves most of the array empty.",
        },
      ],
      answers: ["a", "c"],
    },
  ],
  pattern: {
    pattern: "tree-traversal",
    chapter: "dsa-trees",
    signals: [
      "The input is a binary tree or BST with left and right pointers.",
      "Sorted output or the k-th smallest value is wanted from a BST.",
      "The prompt wants level by level output, or the nearest or shortest of something in an unweighted tree.",
      "A node's value depends on the results of both of its children.",
      "The prompt asks for the walk to be done without recursion.",
    ],
    template:
      "<pre><code>function walk(node, out) {\n  if (node === null) return;\n  walk(node.left, out);\n  out.push(node.val);\n  walk(node.right, out);\n}</code></pre>",
    time: "O(n)",
    space: "O(h) for a depth-first walk, O(n) for a queue",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
