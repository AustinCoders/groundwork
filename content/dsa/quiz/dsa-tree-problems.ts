import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "tpr-valid-bst-trap",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-recursion",
      section: "validate-bst-the-trap-almost-everyone-falls-into-first",
      placement: true,
      kind: "single",
      prompt:
        "<p>A binary tree has root 10, a left child 5 and a right child 15. The node 15 has one child of its own, a left child 6 that is a leaf. Is this a valid BST, and what shows it?</p>",
      choices: [
        {
          id: "a",
          text: "It is valid: every node is larger than its left child and smaller than its right child.",
          why: "Each of those local comparisons does pass here, but that is not the BST rule. The rule covers every node in a whole subtree, not just the direct children, so passing this check proves nothing.",
        },
        {
          id: "b",
          text: "It is not valid: 6 is in the right subtree of 10, yet 6 is smaller than 10.",
          why: "This is what a range passed down catches. Going right at 10 sets the lowest allowed value to 10, and 15 then sets the highest allowed value for its left child to 15. The value 6 is below 10, so it is rejected.",
        },
        {
          id: "c",
          text: "It is not valid: 6 is smaller than its parent 15, and a child must be larger than its parent.",
          why: "A left child is meant to be smaller than its parent, so 6 under 15 is fine locally. The problem is 6 against the ancestor 10, which sits further up.",
        },
        {
          id: "d",
          text: "It is not valid: 15 has only one child, and a BST node must have two children or none.",
          why: "A BST node may have zero, one or two children. The shape of the tree has nothing to do with the ordering rule.",
        },
      ],
      answer: "b",
    },
    {
      id: "tpr-lca-in-a-bst",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-recursion",
      section: "lowest-common-ancestor-lca",
      placement: true,
      kind: "single",
      prompt:
        "<p>A BST has distinct values, and two keys <code>p</code> and <code>q</code> are known to be in it. Its nodes have only <code>left</code> and <code>right</code> pointers. Which approach finds their lowest common ancestor in time proportional to the height, without searching both subtrees?</p>",
      choices: [
        {
          id: "a",
          text: "Run the routine for plain binary trees, which recurses into both children at every node.",
          why: "It returns the right node on any binary tree, a BST included. But it does not use the ordering, and it can end up visiting all n nodes even when the height is only about log n.",
        },
        {
          id: "b",
          text: "Find the depth of each key, then walk the deeper one upward until the two are level and walk both upward in step until they meet.",
          why: "The nodes only point down, so there is no way to walk upward. Building parent links first costs a pass over the whole tree.",
        },
        {
          id: "c",
          text: "Return whichever of the two keys is smaller, since it is bound to be the ancestor of the other.",
          why: "Take root 5 with children 3 and 8, and the keys 3 and 8. The smaller key is 3, but the lowest common ancestor is 5.",
        },
        {
          id: "d",
          text: "Walk down from the root, going left if both keys are smaller and right if both are larger, and stop at the split.",
          why: "At the first node where the two keys no longer fall on the same side, they are in different subtrees, or one of them is that node, so that node is the lowest common ancestor. Each step discards a whole subtree, so the cost follows the height.",
        },
      ],
      answer: "d",
    },
    {
      id: "tpr-ship-the-tree",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-recursion",
      section: "serialization-turning-a-tree-into-a-string-and-back",
      placement: true,
      kind: "single",
      prompt:
        "<p>A binary tree of integers, of any shape and possibly with repeated values, has to be written to a string and later rebuilt exactly from that string alone. Which encoding is enough?</p>",
      choices: [
        {
          id: "a",
          text: "Pre-order, with a marker such as <code>null</code> wherever a child is missing.",
          why: "The markers show where every branch ends, so reading the string front to back in the same order rebuilds the same shape. One traversal is enough because of them.",
        },
        {
          id: "b",
          text: "Pre-order values only, with no markers for missing children.",
          why: "Two different trees can give the same list. A root 1 with only a left child 2, and a root 1 with only a right child 2, both write 1, 2.",
        },
        {
          id: "c",
          text: "In-order values only, with no markers for missing children.",
          why: "In-order gives the same list for different shapes. A root 1 with a left child 2, and a root 2 with a right child 1, both write 2, 1.",
        },
        {
          id: "d",
          text: "Level-order values only, with no markers for missing children.",
          why: "Without markers the list cannot say which side a lone child hangs on. A root 1 with only a left child 2, and a root 1 with only a right child 2, both write 1, 2.",
        },
      ],
      answer: "a",
    },
    {
      id: "tpr-max-path-template",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-recursion",
      section: "diameter-of-a-binary-tree",
      kind: "single",
      prompt:
        "<p>A path in a binary tree may start and end at any nodes and uses each node at most once. Node values can be negative, and you want the largest sum along any path. Using the same template as the diameter, what should the recursive helper return to its caller, and what should it update on the side?</p>",
      choices: [
        {
          id: "a",
          text: "Return the best path that goes through this node and uses both of its children, and update nothing on the side.",
          why: "A path that uses both children of a node has forked there, so the parent cannot extend it without forking a second time, and a path cannot do that. Only a path that continues down one branch can be handed upward.",
        },
        {
          id: "b",
          text: "Return the best path sum found anywhere in the subtree below, so the root receives the answer directly.",
          why: "The caller needs a path that ends at this node, so that it can continue through the parent. The best path below may sit in a different branch and cannot be extended that way.",
        },
        {
          id: "c",
          text: "Return the value plus its better branch clipped at 0, and update the answer with the value plus both branches clipped at 0.",
          why: "Upward only one branch can continue, but at the node itself a path may take both. Clipping a negative branch to 0 means leaving it out, which a path is allowed to do.",
        },
        {
          id: "d",
          text: "Return only the node's own value, and update the answer with the largest of those values seen at each node.",
          why: "That throws away every sum computed below the node. The answer would never be more than the largest single value.",
        },
      ],
      answer: "c",
    },
    {
      id: "tpr-naive-balance-cost",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "tree-recursion",
      section: "checking-if-a-tree-is-height-balanced",
      kind: "single",
      prompt:
        "<p>Over all binary trees with n nodes, what is the worst-case running time of <code>isBalancedSlow</code>?</p><pre><code>function height(node) {\n  if (node === null) return 0;\n  return 1 + Math.max(height(node.left), height(node.right));\n}\n\nfunction isBalancedSlow(node) {\n  if (node === null) return true;\n  const balancedHere = Math.abs(height(node.left) - height(node.right)) &lt;= 1;\n  const leftOk = isBalancedSlow(node.left);\n  const rightOk = isBalancedSlow(node.right);\n  return balancedHere &amp;&amp; leftOk &amp;&amp; rightOk;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n)",
          why: "The recursion does visit each node once, but every visit also calls <code>height</code>, which walks the whole subtree under that node. The walks add up to more than n.",
        },
        {
          id: "b",
          text: "O(n log n)",
          why: "This is the cost when the tree is balanced, because every node is then counted in the height walks of only about log n ancestors. A different shape does worse.",
        },
        {
          id: "c",
          text: "O(n²)",
          why: "On a chain where every node has only a left child, the height walks cover n - 1, n - 2, n - 3 nodes and so on, which adds up to about n²/2. Computing the height and the balance in one pass brings it down to O(n).",
        },
        {
          id: "d",
          text: "O(2ⁿ)",
          why: "Each call goes into a different subtree, so the work never multiplies at every level. There are n calls, and the height walks made by one call together cover each node under it at most once, so the total is at most about n times n steps.",
        },
      ],
      answer: "c",
    },
    {
      id: "tpr-rebuild-cost",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "tree-recursion",
      section: "building-a-tree-back-from-its-traversals",
      kind: "single",
      prompt:
        "<p>The chapter's <code>buildTree</code> uses <code>indexOf</code> and <code>slice</code> in every call. It is called with <code>preorder = [n, n - 1, ..., 1]</code> and <code>inorder = [1, 2, ..., n]</code>, which is a tree where every node has only a left child. What is its running time in n?</p><pre><code>function buildTree(preorder, inorder) {\n  if (preorder.length === 0) return null;\n  const rootVal = preorder[0];\n  const root = { val: rootVal, left: null, right: null };\n  const splitIndex = inorder.indexOf(rootVal);\n  const leftInorder = inorder.slice(0, splitIndex);\n  const rightInorder = inorder.slice(splitIndex + 1);\n  root.left = buildTree(preorder.slice(1, 1 + leftInorder.length), leftInorder);\n  root.right = buildTree(preorder.slice(1 + leftInorder.length), rightInorder);\n  return root;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "O(n²)",
          why: "Each call scans and copies arrays that are only one element shorter than in the call before, so the total is n + (n - 1) + ... + 1. Mapping each value to its in-order position and passing index bounds instead of slices gets O(n) when the values are distinct.",
        },
        {
          id: "b",
          text: "O(n log n)",
          why: "That would need every call to split its arrays roughly in half. Here the root is always the last value of <code>inorder</code>, so one side is empty and the other holds everything else.",
        },
        {
          id: "c",
          text: "O(n)",
          why: "Creating a node is cheap, and n nodes are created. But every call also runs <code>indexOf</code> and <code>slice</code> over arrays whose length is proportional to the remaining nodes, which dominates.",
        },
        {
          id: "d",
          text: "O(h), where h is the height of the tree",
          why: "The height describes how deep the recursion goes, which is about the call stack. The running time has to count the n calls and the scanning and copying inside each of them.",
        },
      ],
      answer: "a",
    },
    {
      id: "tpr-trace-diameter",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-recursion",
      section: "diameter-of-a-binary-tree",
      kind: "single",
      prompt:
        "<p>What does <code>diameterOfBinaryTree(root)</code> return for this tree?</p><pre><code>const node = (val, left = null, right = null) =&gt; ({ val, left, right });\nconst root = node(1, node(2, node(3, node(5)), node(4, null, node(6))));\n\nfunction diameterOfBinaryTree(root) {\n  let diameter = 0;\n  function height(node) {\n    if (node === null) return 0;\n    const leftHeight = height(node.left);\n    const rightHeight = height(node.right);\n    diameter = Math.max(diameter, leftHeight + rightHeight);\n    return 1 + Math.max(leftHeight, rightHeight);\n  }\n  height(root);\n  return diameter;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "3",
          why: "That is what the root alone gives: its left subtree has height 3 and its right subtree is empty. The running maximum has already been raised at the node 2, where the two sides have heights 2 and 2.",
        },
        {
          id: "b",
          text: "5",
          why: "The longest path, 5, 3, 2, 4, 6, has five nodes, but the function counts edges. Heights 2 and 2 at node 2 add up to 4 edges.",
        },
        {
          id: "c",
          text: "6",
          why: "Six is the number of nodes in the whole tree. The diameter is the length of one path, not a count of nodes.",
        },
        {
          id: "d",
          text: "4",
          why: "At node 2 the two sides each have height 2, so <code>leftHeight + rightHeight</code> is 4, bigger than the 3 found at the root. The longest path avoids the root completely.",
        },
      ],
      answer: "d",
    },
    {
      id: "tpr-trace-lca",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-recursion",
      section: "lowest-common-ancestor-lca",
      kind: "single",
      prompt:
        "<p>What is <code>lowestCommonAncestor(n3, n5, n4).val</code> for the tree built below?</p><pre><code>const node = (val, left = null, right = null) =&gt; ({ val, left, right });\nconst n7 = node(7), n4 = node(4), n6 = node(6);\nconst n2 = node(2, n7, n4);\nconst n5 = node(5, n6, n2);\nconst n1 = node(1, node(0), node(8));\nconst n3 = node(3, n5, n1);\n\nfunction lowestCommonAncestor(root, p, q) {\n  if (root === null || root === p || root === q) return root;\n  const left = lowestCommonAncestor(root.left, p, q);\n  const right = lowestCommonAncestor(root.right, p, q);\n  if (left &amp;&amp; right) return root;\n  return left ?? right;\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "3",
          why: "Three would be the answer if the two nodes sat in different subtrees of 3. Here 4 hangs below 5, so both are on the same side and the root is not where they split.",
        },
        {
          id: "b",
          text: "5",
          why: "The call on node 5 returns at once, because <code>root === p</code>, without looking below it. The right side of 3 finds neither node and returns <code>null</code>, so 5 is passed up unchanged. A node counts as an ancestor of itself.",
        },
        {
          id: "c",
          text: "2",
          why: "Two is the parent of 4, but the routine never gets to it. It stops at 5 the moment it matches <code>p</code>, and does not search that subtree for <code>q</code>.",
        },
        {
          id: "d",
          text: "4",
          why: "Node 4 is <code>q</code>, but it is only reached if the search goes below 5, and the routine returns at 5 before that. A match higher up hides it.",
        },
      ],
      answer: "b",
    },
    {
      id: "tpr-order-deserialize",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-recursion",
      section: "serialization-turning-a-tree-into-a-string-and-back",
      kind: "order",
      prompt:
        '<p>The string was written by <code>serialize</code>: the value, then the left subtree, then the right subtree, with <code>"null"</code> for a missing child. Put the steps of one call to <code>build</code> in the order it runs them. Start with the check for <code>"null"</code> and end with returning the node.</p><pre><code>function build() {\n  if (values[i] === "null") { i++; return null; }\n  const node = { val: Number(values[i++]), left: null, right: null };\n  node.left = build();\n  node.right = build();\n  return node;\n}</code></pre>',
      items: [
        {
          id: "check",
          text: 'Read <code>values[i]</code>, and if it is <code>"null"</code> advance <code>i</code> and return <code>null</code>.',
        },
        { id: "make", text: "Create the node from <code>values[i]</code> and advance <code>i</code> past it." },
        { id: "left", text: "Build the left subtree with a recursive call." },
        { id: "right", text: "Build the right subtree with a recursive call." },
        { id: "return", text: "Return the node." },
      ],
      why: "The node has to exist, with <code>i</code> already moved past its value, before the recursive calls run. Otherwise the left call would read the same value again. The left subtree comes before the right one because <code>serialize</code> wrote it first, and the node is returned last because both of its subtrees must be attached by then.",
    },
    {
      id: "tpr-sentinel-bounds",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-recursion",
      section: "validate-bst-the-trap-almost-everyone-falls-into-first",
      kind: "single",
      prompt:
        "<p>A teammate starts the bounds of <code>isValidBST</code> at the largest safe integers instead of infinities. What does it return for a tree that is one node whose value is <code>Number.MIN_SAFE_INTEGER</code>?</p><pre><code>function isValidBST(node, min = Number.MIN_SAFE_INTEGER, max = Number.MAX_SAFE_INTEGER) {\n  if (node === null) return true;\n  if (node.val &lt;= min || node.val &gt;= max) return false;\n  return isValidBST(node.left, min, node.val) &amp;&amp; isValidBST(node.right, node.val, max);\n}</code></pre>",
      choices: [
        {
          id: "a",
          text: "<code>false</code>, although a single node is a valid BST.",
          why: "The check <code>node.val &lt;= min</code> compares the value with the starting bound, which is that same number, so it is true and the tree is rejected. Starting from <code>-Infinity</code> and <code>Infinity</code>, or from <code>null</code> bounds, avoids a value that can clash with a sentinel.",
        },
        {
          id: "b",
          text: "<code>true</code>, because a single node has no children to break the order.",
          why: "The check against the bounds runs before anything else, and it is the bounds that reject the node here. The code never asks whether children exist.",
        },
        {
          id: "c",
          text: "It throws a <code>RangeError</code>, because the value is outside the range of safe integers.",
          why: "<code>Number.MIN_SAFE_INTEGER</code> is itself a safe integer, and nothing in the comparison can throw. The function simply gets the wrong boolean.",
        },
        {
          id: "d",
          text: "<code>undefined</code>, because the node has no children to check.",
          why: "Every path through the function returns <code>true</code> or <code>false</code>. Having no children does not make it return nothing.",
        },
      ],
      answer: "a",
    },
    {
      id: "tpr-which-pairs-rebuild",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-recursion",
      section: "building-a-tree-back-from-its-traversals",
      kind: "multi",
      prompt:
        "<p>For a binary tree with distinct values, select every input that is enough to rebuild the exact tree.</p>",
      choices: [
        {
          id: "a",
          text: "The pre-order list and the post-order list.",
          why: "Not always. A root 1 with only a left child 2, and a root 1 with only a right child 2, both have the pre-order list 1, 2 and the post-order list 2, 1.",
        },
        {
          id: "b",
          text: "The pre-order list and the in-order list.",
          why: "The first pre-order value is the root, and its position in the in-order list splits the values into the left and right subtrees. Repeating that on each part rebuilds the tree.",
        },
        {
          id: "c",
          text: "The post-order list and the in-order list.",
          why: "This works the same way, with the last post-order value as the root. Its position in the in-order list separates the two subtrees.",
        },
        {
          id: "d",
          text: "The in-order list alone.",
          why: "Many shapes share one in-order list. A root 1 with a left child 2, and a root 2 with a right child 1, both give 2, 1.",
        },
      ],
      answers: ["b", "c"],
    },
    {
      id: "tpr-left-first",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "recognise",
      pattern: "tree-recursion",
      section: "building-from-traversals-in-o-n-an-index-map-and-a-moving-po",
      kind: "single",
      prompt:
        "<p>In the O(n) <code>buildTree(preorder, inorder)</code> there is one shared index <code>preIndex</code> into the pre-order array. Why must <code>root.left = build(lo, mid - 1)</code> run before <code>root.right = build(mid + 1, hi)</code>?</p>",
      choices: [
        {
          id: "a",
          text: "Because the map lookup for the left side is faster than for the right side.",
          why: "Every lookup in the map costs the same. The order has nothing to do with speed, and the code is O(n) either way.",
        },
        {
          id: "b",
          text: "Because pre-order lists the whole left subtree right after the root, so the next values from <code>preorder</code> belong to the left side and must be consumed first.",
          why: "Pre-order is node, left subtree, right subtree. After the root is taken, <code>preIndex</code> points at the left subtree's root, and only when that subtree is finished does it point at the right subtree's root. The two calls share the one index, so the order matters.",
        },
        {
          id: "c",
          text: "Because the in-order array has to be walked from left to right.",
          why: "The code never walks the in-order array. It only looks values up in the map and passes ranges, so the direction of a walk plays no role.",
        },
        {
          id: "d",
          text: "It does not matter, because the recursion restores <code>preIndex</code> when a call returns.",
          why: "Nothing restores <code>preIndex</code>. It only moves forward, and each node is taken from the array exactly once, so building the right side first would take the wrong values as its roots.",
        },
      ],
      answer: "b",
    },
    {
      id: "tpr-paths-without-copy",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-recursion",
      section: "path-problems-three-different-questions-three-templates",
      kind: "single",
      prompt:
        "<p>Path Sum II is written as in the chapter, except that the recording line is <code>paths.push(path)</code> instead of <code>paths.push([...path])</code>. It runs on a tree that has two root-to-leaf paths with the target sum. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "The two correct paths, because <code>push</code> stores the values.",
          why: "<code>push</code> stores a reference to the array, not a snapshot of its values. Both entries are the same array object, and that object changes afterwards.",
        },
        {
          id: "b",
          text: "Only the first path, because the second push is ignored.",
          why: "Both pushes happen, and the result has two entries. They are just not the paths that were found.",
        },
        {
          id: "c",
          text: "<code>[[], []]</code>, two references to one shared array that every <code>pop</code> has emptied.",
          why: "The shared <code>path</code> array is pushed and popped all through the recursion, and when the top call finishes it is empty again. Both stored references show that empty array.",
        },
        {
          id: "d",
          text: "It throws, because JavaScript does not let one array be pushed into another array.",
          why: "Arrays can hold other arrays. The line is legal and runs; it just records the wrong thing.",
        },
      ],
      answer: "c",
    },
    {
      id: "tpr-prefix-undo",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-recursion",
      section: "path-problems-three-different-questions-three-templates",
      kind: "single",
      prompt:
        "<p>The line <code>seen.set(sum, seen.get(sum) - 1)</code> is deleted from the chapter's <code>pathSumIII</code>. The function is called on the tree with root 1 and two children, both with value 2, with a target of <code>0</code>. No path sums to 0. What does the changed function return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>0</code>, the correct answer, because only a path can add to the count.",
          why: "The count goes up whenever the lookup finds a matching prefix, and without the undo a prefix from the left branch is still in the map when the right branch is visited.",
        },
        {
          id: "b",
          text: "<code>2</code>, one for each child, because each child finds the prefix left by the root.",
          why: "Only the right child finds a stale match. The left child looks for the prefix 3 before any such prefix exists, and the root looks for the prefix 1, which is not in the map yet.",
        },
        {
          id: "c",
          text: "It throws, because <code>seen.get(sum)</code> becomes <code>undefined</code>.",
          why: "Without the line the counts only grow, and nothing reads a missing entry as a number that is then used in arithmetic.",
        },
        {
          id: "d",
          text: "<code>1</code>. The right child has prefix 3 and finds the prefix 3 left by the left child.",
          why: "The left child's prefix 3 is never removed, so when the right child, with the same prefix 3, looks up 3, it finds a count of 1. That counts a path that does not exist, because the left child is not an ancestor of the right one.",
        },
      ],
      answer: "d",
    },
    {
      id: "tpr-all-negative-path",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-recursion",
      section: "path-problems-three-different-questions-three-templates",
      kind: "single",
      prompt:
        "<p>In <code>maxPathSum</code> the first line is changed from <code>let best = -Infinity</code> to <code>let best = 0</code>. It runs on a tree whose root is −2 with a single left child −1. What does it return, and what should it return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>−3</code>, which is both nodes added, and it is also correct.",
          why: "The path through both nodes has the sum −3, which is worse than the path made of the node −1 alone, so −3 is neither returned nor correct.",
        },
        {
          id: "b",
          text: "<code>0</code>, but the correct answer is <code>−1</code>, the single node −1.",
          why: "No node has a positive bend value, so <code>best</code> never rises above its starting 0. A path must contain at least one node, so 0 is a sum that no path has.",
        },
        {
          id: "c",
          text: "<code>−1</code>, because the starting value of <code>best</code> does not matter.",
          why: "The starting value matters when every candidate is below it. Here the largest candidate is −1, which is less than 0, so the 0 wins.",
        },
        {
          id: "d",
          text: "<code>−2</code>, because the root is the top of the path.",
          why: "The bend at the root is −2 plus the gain of the left child, which is clamped to 0 because −1 is negative, giving −2. The bend at the child is −1, and that is the better candidate.",
        },
      ],
      answer: "b",
    },
    {
      id: "tpr-robber-pair",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-recursion",
      section: "pair-returning-recursion-house-robber-iii",
      kind: "single",
      prompt:
        "<p>The chapter's <code>rob</code> runs on a tree whose root is 3. The root's left child is 4, which has two leaf children, 1 and 3. The root's right child is 5, which has one right child, a leaf 1. What pair <code>[robThis, skipThis]</code> does the call for the node 4 return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[4, 4]</code>",
          why: "Robbing 4 forces both leaves to be skipped, so the total is 4 + 0 + 0 = 4. Skipping 4 lets each leaf be robbed, 1 + 3 = 4. The two states happen to tie.",
        },
        {
          id: "b",
          text: "<code>[8, 0]</code>",
          why: "That would add the values of the children to the node's own value, which is exactly what the alarm forbids. A robbed house forces both of its children to be skipped.",
        },
        {
          id: "c",
          text: "<code>[4, 0]</code>",
          why: "The first number is right, but skipping the node 4 does not give 0: its two leaves are free to be robbed and are worth 1 + 3.",
        },
        {
          id: "d",
          text: "<code>[1, 3]</code>",
          why: "Those are the values of the two leaves, not a pair of totals for the node 4. The first entry is the best total with 4 robbed, and 4 itself is in it.",
        },
      ],
      answer: "a",
    },
    {
      id: "tpr-right-view-left-node",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "trace",
      pattern: "tree-recursion",
      section: "level-by-level-the-bfs-variants",
      kind: "single",
      prompt:
        "<p>The root 1 has a left child 2 and a right child 3, and the node 2 has a left child 4. The node 3 has no children. What does the chapter's <code>rightSideView</code> return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 3]</code>, because only right children are visible from the right.",
          why: "A node is visible when nothing at its depth lies further to the right, whether it is a left child or a right child. At depth 2 the node 4 is the only node, so it is visible.",
        },
        {
          id: "b",
          text: "<code>[1, 2, 4]</code>, following the left children down.",
          why: "At depth 1 the nodes are 2 and 3, and the last one, 3, is the one seen from the right.",
        },
        {
          id: "c",
          text: "<code>[1, 3, 2, 4]</code>, every node that has no node to its right.",
          why: "The node 2 has the node 3 to its right at the same depth, so it is hidden. Also the view has one entry per depth, so it cannot have four entries for three levels.",
        },
        {
          id: "d",
          text: "<code>[1, 3, 4]</code>",
          why: "The view takes the last node of each level: 1, then 3 at depth 1, then 4, the only node at depth 2. The node 4 is a left child, and it is visible because the right child at that depth does not exist.",
        },
      ],
      answer: "d",
    },
    {
      id: "tpr-connect-space",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "complexity",
      pattern: "tree-recursion",
      section: "level-by-level-the-bfs-variants",
      kind: "single",
      prompt:
        "<p>The chapter's <code>connectAny</code> links each node to its right neighbour on the same level for any binary tree. What extra space does it use, apart from the <code>next</code> pointers it fills in?</p>",
      choices: [
        {
          id: "a",
          text: "O(h), for the recursion.",
          why: "There is no recursion. The function is two loops, one over the levels and one along a level.",
        },
        {
          id: "b",
          text: "O(w), where w is the width of the widest level, as for a queue.",
          why: "That is the cost of the queue-based version. This one never stores a level; it only follows the <code>next</code> pointers it has already set.",
        },
        {
          id: "c",
          text: "O(1): a few variables and one dummy node, because it walks each finished level through its own <code>next</code> links.",
          why: "The links of the level just built act as the queue for building the level below, so no queue or array of nodes is needed. The dummy node and the <code>tail</code>, <code>levelStart</code> and loop variables take constant space.",
        },
        {
          id: "d",
          text: "O(n), because every node is put in a set so that it is linked only once.",
          why: "No set is used. Each node is linked exactly once because every level is walked once, in order.",
        },
      ],
      answer: "c",
    },
    {
      id: "tpr-distance-no-seen",
      chapter: "dsa-tree-problems",
      level: "intermediate",
      skill: "edge-case",
      pattern: "tree-recursion",
      section: "all-nodes-at-distance-k-the-tree-as-a-graph",
      kind: "single",
      prompt:
        "<p>The <code>seen</code> check is removed from <code>distanceK</code>, so every non-null neighbour is added to the next frontier. The tree is a root 1 with two leaf children 2 and 3, the target is the root, and <code>k = 2</code>. No node is two edges from the root. What does the changed function return?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[1, 1]</code>, the root twice, because each leaf steps back to its parent, the target.",
          why: "After round one the frontier is the leaves 2 and 3. In round two each of them has the root as its parent, and nothing stops the search from going back to it, so the root appears once for each leaf.",
        },
        {
          id: "b",
          text: "<code>[2, 3]</code>, the two leaves.",
          why: "The leaves are one edge from the root. After the second round the frontier holds whatever can be reached in two steps, and the leaves are not among them.",
        },
        {
          id: "c",
          text: "<code>[]</code>, which is correct, because the tree has only two levels.",
          why: "Without the <code>seen</code> check the search is free to step back onto the node it came from, so it does not stop at the edge of the tree.",
        },
        {
          id: "d",
          text: "It never finishes, because the search keeps going back and forth.",
          why: "The loop runs for exactly <code>k</code> rounds, so it ends after two rounds even though it wanders. The result is wrong, not endless.",
        },
      ],
      answer: "a",
    },
  ],
  pattern: {
    pattern: "tree-recursion",
    chapter: "dsa-tree-problems",
    signals: [
      "The answer for a node comes from the answers of its left and right subtrees.",
      "A property must hold at every node, such as balanced or a valid BST, and a failure anywhere should end the check.",
      "The prompt wants a best value across all nodes, such as a diameter or a maximum path sum.",
      "Two nodes and their common ancestor are asked for.",
      "A tree has to be rebuilt from traversal lists or turned into a string and back.",
    ],
    template:
      "<pre><code>function solve(root) {\n  let best = 0;\n  function visit(node) {\n    if (node === null) return 0;\n    const left = visit(node.left);\n    const right = visit(node.right);\n    best = Math.max(best, left + right);\n    return 1 + Math.max(left, right);\n  }\n  visit(root);\n  return best;\n}</code></pre>",
    time: "O(n)",
    space: "O(h)",
    styles: ["online-assessment", "phone-screen", "onsite"],
  },
};
