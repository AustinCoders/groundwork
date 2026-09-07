import type { Chapter } from "../types";

export const dsaTrees: Chapter = {
  id: "dsa-trees",
  num: "I1",
  title: "Trees",
  short: "Trees",
  levels: ["intermediate"],
  practice: [
    "ex-tree-max-depth",
    "ex-tree-same-tree",
    "ex-tree-symmetric",
    "ex-tree-invert",
    "ex-tree-level-order",
    "ex-tree-path-sum",
  ],
  ready: true,
  subtitle: "A linked list that's allowed to branch — and the three orders you can walk it in.",
  body: `<h3>What makes something a tree</h3>
<p>
  A tree is a linked structure with one rule a linked list doesn't have:
  <b>each node can point to more than one child, and there are no
  cycles</b> — you can never walk from a node back to itself. That single
  branching rule is what unlocks a completely different family of
  algorithms from the linear ones you just spent the beginner tier on.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A binary tree with a root node, two children, and grandchildren, labelling root, parent, child, leaf and the height of the tree">
    <g class="rough">
      <path class="ln" d="M320,50 L200,120" />
      <path class="ln" d="M320,50 L440,120" />
      <path class="ln" d="M200,120 L130,190" />
      <path class="ln" d="M200,120 L270,190" />
      <path class="ln" d="M440,120 L510,190" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="50" r="26" />
      <circle class="box" cx="200" cy="120" r="26" />
      <circle class="box" cx="440" cy="120" r="26" />
      <circle class="boxg" cx="130" cy="190" r="26" />
      <circle class="boxg" cx="270" cy="190" r="26" />
      <circle class="boxg" cx="510" cy="190" r="26" />
    </g>
    <text class="sm" x="320" y="55" text-anchor="middle">8</text>
    <text class="sm" x="200" y="125" text-anchor="middle">3</text>
    <text class="sm" x="440" y="125" text-anchor="middle">10</text>
    <text class="sm" x="130" y="195" text-anchor="middle">1</text>
    <text class="sm" x="270" y="195" text-anchor="middle">6</text>
    <text class="sm" x="510" y="195" text-anchor="middle">14</text>
    <text class="lbl" x="330" y="30" style="font-size:14px">root</text>
    <text class="lbl" x="20" y="230" style="font-size:14px">green = leaves (no children) · height = 2 (root → leaf, in edges)</text>
  </svg>
  <figcaption>3 and 10 are children of 8, and parents of the leaves below them — the same node wears both hats.</figcaption>
</figure>

<h3>Vocabulary you need cold</h3>
<table>
  <tr><th>Term</th><th>Means</th></tr>
  <tr><td>Root</td><td>the top node, the only one with no parent</td></tr>
  <tr><td>Leaf</td><td>a node with no children</td></tr>
  <tr><td>Height</td><td>the number of edges on the longest root-to-leaf path</td></tr>
  <tr><td>Depth</td><td>the number of edges from the root to that specific node</td></tr>
  <tr><td>Balanced</td><td>for every node, the left and right subtree heights differ by at most 1</td></tr>
  <tr><td>Binary Search Tree (BST)</td><td>a binary tree where every left subtree is smaller, every right subtree is bigger</td></tr>
</table>

<h3>The BST property, drawn</h3>
<figure>
  <svg viewBox="0 0 640 90" class="dg" role="img" aria-label="A single node showing that everything in its left subtree is smaller and everything in its right subtree is bigger">
    <g class="rough">
      <rect class="boxr" x="60" y="20" width="180" height="50" rx="6" />
      <rect class="boxy" x="280" y="20" width="80" height="50" rx="6" />
      <rect class="boxg" x="400" y="20" width="180" height="50" rx="6" />
    </g>
    <text class="sm rd" x="150" y="50" text-anchor="middle">everything here is &lt; 8</text>
    <text class="sm" x="320" y="50" text-anchor="middle">8</text>
    <text class="sm gr" x="490" y="50" text-anchor="middle">everything here is &gt; 8</text>
  </svg>
  <figcaption>This must hold at <em>every</em> node, not just the root — that's what makes binary search work on it.</figcaption>
</figure>
<p>
  This property is the entire reason BST search is O(log n) on a balanced
  tree — same idea as binary search on a sorted array, just implemented as
  pointers instead of index math: compare, then throw away half the tree.
</p>
<pre><code>function bstSearch(node, target) {
  if (node === null) return null;
  if (node.val === target) return node;
  return target < node.val
    ? bstSearch(node.left, target)
    : bstSearch(node.right, target);
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ "BST" only buys you O(log n) if it's balanced</span>
  Insert 1,2,3,4,5 in order into a BST with no rebalancing and you get a
  straight line, not a tree — every operation degrades to O(n), same as a
  linked list. This is exactly why self-balancing trees (AVL, red-black)
  exist, even though you'll rarely implement one by hand in an interview.
</div>

<h3>The three depth-first traversal orders</h3>
<p>
  All three visit every node exactly once and all three use the same
  recursive shape — the <em>only</em> difference is where you place the
  "visit this node" line relative to the two recursive calls.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="The same small binary tree with three different numberings showing in-order, pre-order, and post-order visit sequence">
    <g class="rough">
      <path class="ln" d="M110,50 L60,110" />
      <path class="ln" d="M110,50 L160,110" />
      <path class="lnr" d="M310,50 L260,110" />
      <path class="lnr" d="M310,50 L360,110" />
      <path class="lng" d="M510,50 L460,110" />
      <path class="lng" d="M510,50 L560,110" />
    </g>
    <g class="rough">
      <circle class="box" cx="110" cy="50" r="22" />
      <circle class="box" cx="60" cy="110" r="22" />
      <circle class="box" cx="160" cy="110" r="22" />
      <circle class="boxr" cx="310" cy="50" r="22" />
      <circle class="boxr" cx="260" cy="110" r="22" />
      <circle class="boxr" cx="360" cy="110" r="22" />
      <circle class="boxg" cx="510" cy="50" r="22" />
      <circle class="boxg" cx="460" cy="110" r="22" />
      <circle class="boxg" cx="560" cy="110" r="22" />
    </g>
    <text class="sm" x="110" y="55" text-anchor="middle">2nd</text>
    <text class="sm" x="60" y="115" text-anchor="middle">1st</text>
    <text class="sm" x="160" y="115" text-anchor="middle">3rd</text>
    <text class="sm" x="310" y="55" text-anchor="middle">1st</text>
    <text class="sm" x="260" y="115" text-anchor="middle">2nd</text>
    <text class="sm" x="360" y="115" text-anchor="middle">3rd</text>
    <text class="sm" x="510" y="55" text-anchor="middle">3rd</text>
    <text class="sm" x="460" y="115" text-anchor="middle">1st</text>
    <text class="sm" x="560" y="115" text-anchor="middle">2nd</text>
    <text class="lbl" x="60" y="160" style="font-size:14px">In-order</text>
    <text class="lbl rd" x="260" y="160" style="font-size:14px">Pre-order</text>
    <text class="lbl gr" x="460" y="160" style="font-size:14px">Post-order</text>
    <text class="sm" x="20" y="195">In-order: left, node, right — sorted output on a BST</text>
    <text class="sm rd" x="20" y="215">Pre-order: node, left, right — good for copying a tree</text>
    <text class="sm gr" x="20" y="235">Post-order: left, right, node — good for deleting a tree</text>
  </svg>
  <figcaption>Same tree, same recursive shape — only the position of "visit node" relative to the two recursive calls changes.</figcaption>
</figure>
<pre><code>function inOrder(node, out = []) {
  if (node === null) return out;
  inOrder(node.left, out);
  out.push(node.val);   <span class="c">// visit AFTER left, BEFORE right</span>
  inOrder(node.right, out);
  return out;
}

function preOrder(node, out = []) {
  if (node === null) return out;
  out.push(node.val);   <span class="c">// visit FIRST</span>
  preOrder(node.left, out);
  preOrder(node.right, out);
  return out;
}

function postOrder(node, out = []) {
  if (node === null) return out;
  postOrder(node.left, out);
  postOrder(node.right, out);
  out.push(node.val);   <span class="c">// visit LAST</span>
  return out;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "In-order traversal of a BST
  always produces sorted output, because at every node you visit
  everything smaller (left) before the node itself, before everything
  bigger (right) — that ordering guarantee is exactly the BST property
  applied recursively."
</div>

<h3>Breadth-first (level-order) — the one traversal that isn't depth-first</h3>
<p>
  All three orders above dive to the bottom before coming back up. Level
  order does the opposite: visit every node at depth 0, then every node
  at depth 1, then depth 2 — this needs a queue, not recursion, because
  you have to remember an entire "frontier" of nodes at once.
</p>
<pre><code>function levelOrder(root) {
  if (root === null) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length; <span class="c">// freeze how many belong to THIS level</span>
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}</code></pre>
<p class="sub">
  The <code>levelSize</code> snapshot is the trick — without it you can't
  tell where one level ends and the next begins, since the queue just
  keeps growing as you go.
</p>

<h3>Doing it without recursion — a near-guaranteed follow-up</h3>
<p>
  "Can you do that iteratively?" is one of the most common tree follow-up
  questions, because it tests whether you actually understand what
  recursion was doing for you (managing a stack of "come back to this
  later" positions) rather than just pattern-matching the recursive shape.
</p>
<pre><code><span class="c">// iterative pre-order — the easiest one: an explicit stack, push right before left</span>
function preOrderIterative(root) {
  if (root === null) return [];
  const result = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);
    if (node.right) stack.push(node.right); <span class="c">// push right FIRST</span>
    if (node.left) stack.push(node.left);   <span class="c">// so left gets popped first</span>
  }
  return result;
}

<span class="c">// iterative in-order — trickier: walk left as far as possible, THEN visit, THEN go right</span>
function inOrderIterative(root) {
  const result = [];
  const stack = [];
  let curr = root;
  while (curr !== null || stack.length) {
    while (curr !== null) {   <span class="c">// go as far left as possible, remembering the path</span>
      stack.push(curr);
      curr = curr.left;
    }
    curr = stack.pop();        <span class="c">// backtrack to the last unvisited node</span>
    result.push(curr.val);
    curr = curr.right;         <span class="c">// then explore its right subtree</span>
  }
  return result;
}</code></pre>
<p class="sub">
  Post-order iteratively is the fiddly one — the cleanest trick is to
  compute pre-order but visiting <em>right before left</em> (swap the push
  order above), collect that into a list, then reverse it. Right-Node-Left
  reversed is exactly Left-Right-Node, which is post-order — worth
  remembering as a shortcut rather than deriving a true post-order stack
  machine from scratch under interview pressure.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Recursion was implicitly
  using the call stack to remember 'come back to this node later' — I can
  make that explicit with my own stack and get the identical traversal
  order without the recursive call overhead."
</div>

<h3>Complexity — the numbers to state out loud</h3>
<table>
  <tr><th>Operation</th><th>Balanced BST</th><th>Unbalanced (worst case)</th></tr>
  <tr><td>Search / insert / delete</td><td>O(log n)</td><td>O(n)</td></tr>
  <tr><td>Any traversal (visits every node once)</td><td>O(n)</td><td>O(n)</td></tr>
  <tr><td>Space (recursive call stack)</td><td>O(log n) — height of the tree</td><td>O(n)</td></tr>
  <tr><td>Space (level order, via queue)</td><td>O(n) — widest level, up to n/2 nodes</td><td>O(n)</td></tr>
</table>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The input is described as a "binary tree" or "BST" with <code>.left</code>/<code>.right</code></li>
  <li>"Sorted order" out of a BST → in-order is almost always the answer</li>
  <li>"Level by level" or "shortest path in an unweighted tree" → level order (BFS)</li>
  <li>"Build/copy/serialize" → pre-order; "safely delete/free" → post-order</li>
</ul>`,
};
