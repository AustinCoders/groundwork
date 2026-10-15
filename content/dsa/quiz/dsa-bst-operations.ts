import type { ChapterPool } from "../../quiz-types";

export const pool: ChapterPool = {
  questions: [
    {
      id: "bo-smallest-at-least",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "recognise",
      pattern: "bst",
      section: "what-a-bst-gives-you-that-arrays-and-hash-maps-do-not",
      placement: true,
      kind: "single",
      prompt:
        "<p>Numbers are added to and removed from a collection one at a time. Between those changes you are repeatedly asked: <em>what is the smallest stored number that is at least x?</em> Which kind of structure answers this without looking at every stored number?</p>",
      choices: [
        {
          id: "a",
          text: "A <code>Set</code>, calling <code>has</code> for x, then x + 1, then x + 2, and so on until one of them is found.",
          why: "A <code>Set</code> answers whether one exact value is present. For non-integer values the next candidate cannot be guessed, and for integers the loop may run for a very long time before it meets a stored value.",
        },
        {
          id: "b",
          text: "A min-heap holding all the numbers, reading its top element each time a query comes in.",
          why: "A heap keeps only the overall smallest value easy to reach. The smallest value that is at least x is somewhere inside the heap, and nothing in its structure points to it.",
        },
        {
          id: "c",
          text: "A structure that keeps the numbers sorted: a balanced BST, or a sorted array with binary search.",
          why: "Sorted order is exactly what this query needs: search for the position x would take and read the value there. The tree or array does this in O(log n) to find the position, and the two differ only in how they pay for inserts and deletes.",
        },
        {
          id: "d",
          text: "A <code>Map</code> from each number to how many times it was added, looked up by x.",
          why: "A <code>Map</code> gives the count for one exact key quickly, but it keeps no order among keys, so it cannot find a neighbour of x.",
        },
      ],
      answer: "c",
    },
    {
      id: "bo-iterator-memory",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "recognise",
      pattern: "bst",
      section: "the-bst-iterator-with-an-explicit-stack",
      placement: true,
      kind: "single",
      prompt:
        "<p>You must write <code>next()</code> and <code>hasNext()</code> that walk a binary search tree in increasing order, using memory proportional to the tree's height and not to its size. Which design fits?</p>",
      choices: [
        {
          id: "a",
          text: "Run an in-order traversal inside the constructor, store every value in an array, and let <code>next()</code> read from that array one index at a time.",
          why: "It returns the right values, but the array holds all n of them, so the memory is O(n), and the constructor does all the work before the first call.",
        },
        {
          id: "b",
          text: "Keep a queue of nodes and process the tree level by level, returning each node as it leaves the queue.",
          why: "A level-order walk visits a parent before its children and goes across a whole level before going down. It does not produce the values in increasing order, and its queue can hold a full level, which is up to about half of the nodes.",
        },
        {
          id: "c",
          text: "Call a recursive in-order function from <code>next()</code> and stop it after one value.",
          why: "A recursive call cannot be paused and resumed later. The next call would start again from the root, losing the position, unless the state is saved elsewhere, and that saved state is what the explicit stack is.",
        },
        {
          id: "d",
          text: "Keep a stack that starts as the root's left spine; each <code>next()</code> pops a node and pushes the left spine of its right child.",
          why: "The stack always holds only the chain of ancestors still waiting to be visited, which is at most one root-to-node path, so the memory is O(h). Every node is pushed once and popped once, which gives O(1) amortized per call.",
        },
      ],
      answer: "d",
    },
    {
      id: "bo-balanced-from-sorted",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "recognise",
      pattern: "bst",
      section: "sorted-array-or-list-to-a-balanced-bst",
      placement: true,
      kind: "single",
      prompt:
        "<p>You are given an array sorted in increasing order and must build a height-balanced binary search tree from it. What is the right way to choose each root?</p>",
      choices: [
        {
          id: "a",
          text: "Take the middle element as the root, and build each side from the values on that side of it, by the same rule.",
          why: "The two halves differ in size by at most one at every node, so every subtree is as balanced as its size allows. With index bounds, one node is created per value, so the whole build is O(n).",
        },
        {
          id: "b",
          text: "Insert the values one by one in array order with the ordinary BST insert, comparing each against the nodes already placed.",
          why: "Each value is larger than everything before it, so it always goes to the right of the previous one. The result is a chain of height n, which is the least balanced tree possible.",
        },
        {
          id: "c",
          text: "Take the first element as the root and build all the remaining values as one right subtree below it.",
          why: "That is the same chain as inserting in order. A root must have about as many values below it as above it to keep the two sides level.",
        },
        {
          id: "d",
          text: "Shuffle the array first, then insert the values in the shuffled order with the ordinary BST insert.",
          why: "A random order usually gives a height roughly twice the ideal, but it does not guarantee balance, and the sorted order already allows a guaranteed result.",
        },
      ],
      answer: "a",
    },
    {
      id: "bo-delete-cost",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "complexity",
      pattern: "bst",
      section: "delete-three-cases",
      kind: "single",
      prompt:
        "<p>A BST has n nodes and height h. You delete a node that has two children, using the in-order successor. What is the time cost, as the tightest bound in terms of n and h?</p>",
      choices: [
        {
          id: "a",
          text: "O(log n), whatever the shape of the tree.",
          why: "O(log n) holds only when the height is about log n. A tree built from sorted input can have a height near n, and then the walk to the node is O(n).",
        },
        {
          id: "b",
          text: "O(h): one walk down to the node and then on down to its successor.",
          why: "The search for the node follows one path and the successor is found by continuing along the left side of the right subtree. Together that is one root-to-leaf path, so at most h steps plus the constant work to copy a value and relink a pointer.",
        },
        {
          id: "c",
          text: "O(1), because only pointers change.",
          why: "Rewiring pointers is constant work, but locating the node and its successor comes first, and that takes a number of steps that grows with the height.",
        },
        {
          id: "d",
          text: "O(n), because every value after the deleted one has to shift one place to the left.",
          why: "Shifting is the cost of deleting from a sorted array. A tree deletes by relinking, so nothing is shifted.",
        },
      ],
      answer: "b",
    },
    {
      id: "bo-iterator-total",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "complexity",
      pattern: "bst",
      section: "the-bst-iterator-with-an-explicit-stack",
      kind: "single",
      prompt:
        "<p>The stack-based iterator is created over a BST with n nodes and height h, and <code>next()</code> is called n times, once for each node. What is the tightest bound on the total time of those n calls?</p>",
      choices: [
        {
          id: "a",
          text: "O(n · h)",
          why: "This is a correct upper bound, because one call can push up to h nodes. It is not the tightest one, though: the calls cannot all be that expensive, since the pushes add up to only n over the whole walk.",
        },
        {
          id: "b",
          text: "O(h)",
          why: "O(h) is the worst case for one call and the size of the stack. The calls together must at least touch all n nodes, so the total cannot be smaller than n.",
        },
        {
          id: "c",
          text: "O(n log n)",
          why: "This would suit an algorithm that sorts or that does a log-sized step per node. The iterator does no search per node, it only moves each node onto the stack and off again.",
        },
        {
          id: "d",
          text: "O(n)",
          why: "Each node is pushed on the stack exactly once and popped exactly once over the whole traversal, so the pushes and pops together cost O(n). That is O(1) amortized per call, although a single call can still cost O(h).",
        },
      ],
      answer: "d",
    },
    {
      id: "bo-sorted-insert-total",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "complexity",
      pattern: "bst",
      section: "degenerate-trees-the-cost-is-the-height",
      kind: "single",
      prompt:
        "<p>The distinct keys 1, 2, 3, … , n are inserted into an empty plain BST (no rebalancing) in increasing order. About how many nodes are visited in total by all the inserts?</p>",
      choices: [
        {
          id: "a",
          text: "About n · log2 n, because each insert follows one root-to-leaf path.",
          why: "That would be right if the paths were about log2 n long. Here each new key is larger than all earlier keys, so the tree is a chain and the path to the insert point has as many nodes as keys already stored.",
        },
        {
          id: "b",
          text: "About n, because each insert is O(1) when a key goes at the end.",
          why: "The insert code does not know that the key belongs at the end. It reaches the end by walking down every node on the chain, and so costs time proportional to the number of keys already stored.",
        },
        {
          id: "c",
          text: "About n² / 2, since insert number i walks about i nodes.",
          why: "The i-th insert walks past the i − 1 keys already stored, and the sum 1 + 2 + … + (n − 1) is about n² / 2. For large n that is the difference between instant and minutes.",
        },
        {
          id: "d",
          text: "About 2<sup>n</sup>, because the tree doubles in size with each level.",
          why: "A chain does not double anything: each level holds one node. An exponential count would apply to a full tree's node count by depth, and the cost here is polynomial.",
        },
      ],
      answer: "c",
    },
    {
      id: "bo-trace-successor",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "trace",
      pattern: "bst",
      section: "successor-and-predecessor",
      kind: "single",
      prompt:
        "<p>The tree is <code>[8,3,10,1,6,null,14,null,null,4,7,13]</code>. The chapter's <code>successor(root, 7)</code> walks from the root and remembers the last node at which it turned left. What does it return?</p>",
      choices: [
        {
          id: "a",
          text: "The node with value 8.",
          why: "The walk turns left once, at 8, because 7 &lt; 8. At 3 and at 6 it turns right, and at 7 it also goes right (7 is not less than 7) and falls off the tree. The only remembered node is 8, which is the nearest ancestor larger than 7.",
        },
        {
          id: "b",
          text: "The node with value 10.",
          why: "10 is larger than 7, but the walk never reaches it. At 8 the walk turns left, and 10 sits in 8's right subtree, which is skipped.",
        },
        {
          id: "c",
          text: "The node with value 6.",
          why: "6 is the parent of 7 and is smaller than 7. A successor must be strictly larger, and the walk only remembers a node when it is larger than the target.",
        },
        {
          id: "d",
          text: "<code>null</code>, because 7 has no right child.",
          why: "Having no right child does not mean having no successor. When the right subtree is empty the successor is an ancestor, and here the ancestor 8 is larger than 7. Only the largest value, 14, would give <code>null</code>.",
        },
      ],
      answer: "a",
    },
    {
      id: "bo-trace-delete",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "trace",
      pattern: "bst",
      section: "delete-three-cases",
      kind: "single",
      prompt:
        "<p>Delete the value 3 from <code>[8,3,10,1,6,null,14,null,null,4,7,13]</code> using the chapter's <code>deleteNode</code>, which uses the in-order <em>successor</em> when a node has two children. What is the tree afterwards, as a level-order array?</p>",
      choices: [
        {
          id: "a",
          text: "<code>[8,1,10,null,6,null,14,4,7,13]</code>",
          why: "This is a valid tree, and it is what the in-order <em>predecessor</em> rule gives: the largest value on the left is 1, which is copied up. The chapter's code uses the successor, so it does not produce this shape.",
        },
        {
          id: "b",
          text: "<code>[8,4,10,1,6,null,14,null,null,null,7,13]</code>",
          why: "3 has two children, 1 and 6. The smallest value in the right subtree is 4, the left child of 6. The node that held 3 now holds 4, and the original 4 is removed from the right subtree, which leaves 6 with only its right child 7.",
        },
        {
          id: "c",
          text: "<code>[8,4,10,1,6,null,14,null,null,4,7,13]</code>",
          why: "This is the result of copying 4 up and forgetting to remove the original 4. The tree now holds 4 twice, so it no longer has the values it should have.",
        },
        {
          id: "d",
          text: "<code>[8,null,10,null,14,13]</code>",
          why: "This drops 3 together with everything below it. Deleting one value must keep all the others, and a two-children delete only moves one value up.",
        },
      ],
      answer: "b",
    },
    {
      id: "bo-null-distance",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "edge-case",
      pattern: "bst",
      section: "floor-and-ceiling",
      kind: "single",
      prompt:
        "<p>A closest-value routine finds <code>floorVal</code> and <code>ceilVal</code> for <code>target</code> and compares the gaps with <code>const down = target - floorVal; const up = ceilVal - target;</code>, picking the side with the smaller gap. For <code>target = 100</code> in a tree whose largest value is 50, <code>floorVal</code> is 50 and <code>ceilVal</code> is <code>null</code>. What goes wrong?</p>",
      choices: [
        {
          id: "a",
          text: "Nothing goes wrong: <code>null - 100</code> evaluates to <code>NaN</code>, a comparison with <code>NaN</code> is always false, so the floor side is chosen.",
          why: "<code>null</code> becomes 0 in subtraction, not <code>NaN</code>, so <code>null - 100</code> is -100. It is <code>undefined</code> that gives <code>NaN</code>, and the routine here has <code>null</code>.",
        },
        {
          id: "b",
          text: "The code throws a <code>TypeError</code> because <code>null</code> is not a number.",
          why: "JavaScript does not throw for arithmetic on <code>null</code>. It converts it to 0 and carries on, which is exactly why this bug stays quiet.",
        },
        {
          id: "c",
          text: "<code>up</code> is -100, which is smaller than <code>down</code> (50), so the missing ceiling is picked.",
          why: "<code>null</code> counts as 0, so <code>ceilVal - target</code> is -100. A negative gap compares as smaller than 50, and the routine returns a value that does not exist. The fix is to test for <code>null</code> before doing any arithmetic.",
        },
        {
          id: "d",
          text: "<code>down</code> becomes 100, because <code>target - floorVal</code> uses the missing value.",
          why: "<code>floorVal</code> is 50, not missing, so <code>down</code> is 50. It is the ceiling side that is missing.",
        },
      ],
      answer: "c",
    },
    {
      id: "bo-avl-delete-case",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "edge-case",
      pattern: "bst",
      section: "balanced-trees-in-concept-rotations-and-avl",
      kind: "single",
      prompt:
        "<p>After a delete in an AVL tree, a node has balance +2: its left subtree is two levels taller than its right. Its left child has two subtrees of exactly the same height. Which repair fixes the node?</p>",
      choices: [
        {
          id: "a",
          text: "One right rotation at the node.",
          why: "With the left child's two subtrees level, the left child is not leaning inward, so the straight case applies. If those subtrees have height H, the right subtree has height H − 1. After one right rotation the old node has subtrees of heights H and H − 1, and the new root has H and H + 1, so every difference is at most one.",
        },
        {
          id: "b",
          text: "A left rotation at the left child, then a right rotation at the node.",
          why: "The double rotation is for a left child that leans right, where the deeper grandchild is on the inner side. Here neither grandchild is deeper, so the first rotation is not needed and the chapter's strict <code>&lt;</code> test does not trigger it.",
        },
        {
          id: "c",
          text: "A left rotation at the node.",
          why: "A left rotation would lift the right child, and the right side is the shallow one. This makes the imbalance worse.",
        },
        {
          id: "d",
          text: "No repair: a balance of 2 is allowed when the child is level.",
          why: "AVL allows a difference of at most 1 at every node, with no exception for a level child. A balance of 2 always needs a rotation.",
        },
      ],
      answer: "a",
    },
    {
      id: "bo-js-floor-ceiling",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "recognise",
      pattern: "bst",
      section: "javascript-has-no-ordered-set-what-to-use-instead",
      kind: "single",
      prompt:
        "<p>A JavaScript solution needs <code>floor</code> and <code>ceiling</code> over a set of about twenty thousand numbers that changes as the program runs. What is the sensible plan?</p>",
      choices: [
        {
          id: "a",
          text: "Put the numbers in a <code>Map</code> or a <code>Set</code> and iterate it in order to find the neighbour of each queried value.",
          why: "They iterate in insertion order, not in key order, and they offer no floor or ceiling. Sorting the keys on each query costs O(n log n) every time.",
        },
        {
          id: "b",
          text: "Keep a sorted array, find positions with binary search, insert with <code>splice</code>, and say that an insert is O(n).",
          why: "Floor and ceiling are one binary search each. The O(n) shift per insert is a real cost, but at twenty thousand elements its constant is small, and stating the trade-off is part of the answer.",
        },
        {
          id: "c",
          text: "Store the numbers as keys of a plain object, because object keys come out sorted when you list them.",
          why: "Only keys that look like non-negative integers are listed in ascending order, and the rest follow in insertion order. Every key also becomes a string, and the object has no floor or ceiling lookup either.",
        },
        {
          id: "d",
          text: "Call the standard library's built-in tree set.",
          why: "There is none. The language specification provides hash-based <code>Map</code> and <code>Set</code> but no ordered collection.",
        },
      ],
      answer: "b",
    },
    {
      id: "bo-rotation-facts",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "recognise",
      pattern: "bst",
      section: "balanced-trees-in-concept-rotations-and-avl",
      kind: "multi",
      prompt: "<p>Select every statement about tree rotations that is true.</p>",
      choices: [
        {
          id: "a",
          text: "A rotation never changes the in-order sequence of the values.",
          why: "True. A rotation only changes which node is the parent of which, and the subtree that moves sides lies between the two rotated nodes in value, so the sorted order is unchanged.",
        },
        {
          id: "b",
          text: "A left rotation at a node lifts its right child above it.",
          why: "True. The right child becomes the new root of that piece, the old node becomes its left child, and the right child's old left subtree is handed to the old node.",
        },
        {
          id: "c",
          text: "In the left-right case, one right rotation at the node is enough.",
          why: "False. With a left child that leans right, a single right rotation only turns the zig-zag into a mirrored zig-zag. The child must be rotated left first and then the node right.",
        },
        {
          id: "d",
          text: "Each rotation is a constant number of pointer changes.",
          why: "True. A rotation rewires a few links and refreshes two stored heights, whatever the size of the subtrees, so it costs O(1).",
        },
        {
          id: "e",
          text: "Red-black trees avoid rotations and rebalance by recolouring alone.",
          why: "False. Recolouring does most of the work, but a red-black tree still uses a constant number of rotations to repair some cases after an insert or a delete.",
        },
      ],
      answers: ["a", "b", "d"],
    },
    {
      id: "bo-order-two-children",
      chapter: "dsa-bst-operations",
      level: "intermediate",
      skill: "trace",
      pattern: "bst",
      section: "delete-three-cases",
      kind: "order",
      prompt:
        "<p>Put the steps of deleting a node that has two children in order, following the chapter's <code>deleteNode</code>.</p>",
      items: [
        {
          id: "find",
          text: "Walk down from the root, going left or right by comparison, until you reach the node with the key.",
        },
        {
          id: "min",
          text: "Find the node with the smallest value in that node's right subtree.",
        },
        {
          id: "copy",
          text: "Copy that smallest value into the node you reached.",
        },
        {
          id: "remove",
          text: "Delete the copied value from the right subtree.",
        },
      ],
      why: "The node has to be found before anything else can be done with it, and the smallest value of its right subtree has to be located before it can be copied. The copy comes before the removal because the final step deletes by the value that was just copied: the code calls <code>deleteNode(node.right, heir.val)</code> on the right subtree, and the successor, having no left child, is then a leaf or a node with one child.",
    },
  ],
  pattern: {
    pattern: "bst",
    chapter: "dsa-bst-operations",
    signals: [
      "The prompt asks for a next larger or next smaller value, a closest value, or a floor or ceiling over a collection that changes.",
      "A binary search tree is given and you must insert, delete, find the k-th value, or walk its values in order one at a time.",
      "Sorted data must become a balanced tree, and inserting in order would build a chain.",
      "The tree may be very deep, because the input is sorted or the tree is never rebalanced.",
    ],
    template:
      "<pre><code>function insert(node, val) { if (node === null) return new TreeNode(val); if (val &lt; node.val) node.left = insert(node.left, val); else if (val &gt; node.val) node.right = insert(node.right, val); return node; }</code></pre>",
    time: "O(h) per operation, O(log n) when balanced",
    space: "O(h) for recursion, O(1) when iterative",
    styles: ["phone-screen", "onsite"],
  },
};
