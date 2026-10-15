import type { Chapter } from "../types";

export const dsaTrees: Chapter = {
  id: "dsa-trees",
  num: "I1",
  title: "Trees",
  short: "Trees",
  levels: ["intermediate"],
  prerequisites: ["dsa-basic-recursion", "dsa-stacks-queues"],
  practice: [
    "ex-tree-max-depth",
    "ex-tree-min-depth",
    "ex-tree-same-tree",
    "ex-tree-symmetric",
    "ex-tree-invert",
    "ex-tree-subtree-of-another-tree",
    "ex-tree-count-good-nodes",
    "ex-tree-level-order",
    "ex-tree-path-sum",
    "ex-tree-binary-tree-paths",
    "ex-tree-flatten-to-linked-list",
    "ex-tree-is-complete",
    "ex-nary-tree-level-order",
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

<h3>Dry run: level order on the tree from the first diagram</h3>
<p>
  One row per pass through the outer <code>while</code> loop — that's what
  <code>levelSize</code> buys you: a clean boundary between levels instead
  of one row per node.
</p>
<table>
  <tr><th>Iteration</th><th>levelSize</th><th>Queue at start</th><th>Dequeued, in order</th><th>Enqueued (children)</th><th>result so far</th></tr>
  <tr><td>1</td><td>1</td><td>[8]</td><td>8</td><td>3, 10</td><td>[[8]]</td></tr>
  <tr><td>2</td><td>2</td><td>[3, 10]</td><td>3, 10</td><td>1, 6, 14</td><td>[[8], [3, 10]]</td></tr>
  <tr><td>3</td><td>3</td><td>[1, 6, 14]</td><td>1, 6, 14</td><td>(none — all leaves)</td><td>[[8], [3, 10], [1, 6, 14]]</td></tr>
</table>
<p class="sub">
  Queue is empty after iteration 3, so the <code>while</code> loop stops.
  Notice 10 enqueues only <code>14</code> — it has no left child, and the
  code's <code>if (node.left)</code> guard is what keeps a missing child
  from becoming a queued <code>null</code>.
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

<h3>The recursion template: base case, trust the children, combine</h3>
<p>
  Most tree problems are one idea wearing different clothes, and learning to say that
  idea in three steps is worth more than memorising twenty solutions. A tree is defined
  recursively, a node whose children are themselves trees, so a function on a tree is
  best defined the same way. Write the function by answering three questions in order:
</p>
<ol>
  <li><b>What does <code>f(node)</code> return, in one sentence, for the whole subtree rooted at <code>node</code>?</b> Without this sentence the other two steps have no meaning.</li>
  <li><b>What is <code>f(null)</code>?</b> The base case is almost always the empty tree, and a correct base case makes the leaf case come out for free.</li>
  <li><b>Assume <code>f(node.left)</code> and <code>f(node.right)</code> are already correct, and combine them with the node itself.</b> That assumption is the "leap of faith" from the <a href="/dsa/dsa-basic-recursion">recursion chapter</a>; you do not trace into the children, you use what the sentence in step 1 promises.</li>
</ol>
<pre><code>function maxDepth(root) {
  if (root === null) return 0; <span class="c">// an empty tree has no nodes</span>
  return 1 + Math.max(maxDepth(root.left), maxDepth(root.right));
}

function isSameTree(p, q) {
  if (p === null &amp;&amp; q === null) return true; <span class="c">// both ended together</span>
  if (p === null || q === null) return false; <span class="c">// only one ended: the shapes differ</span>
  return p.val === q.val &amp;&amp; isSameTree(p.left, q.left) &amp;&amp; isSameTree(p.right, q.right);
}

function isSymmetric(root) {
  function mirror(a, b) {
    if (a === null &amp;&amp; b === null) return true;
    if (a === null || b === null) return false;
    return a.val === b.val &amp;&amp; mirror(a.left, b.right) &amp;&amp; mirror(a.right, b.left); <span class="c">// outer with outer, inner with inner</span>
  }
  return root === null || mirror(root.left, root.right);
}

function invertTree(root) {
  if (root === null) return null;
  const left = invertTree(root.left); <span class="c">// trust: these are already inverted</span>
  const right = invertTree(root.right);
  root.left = right; <span class="c">// combine: swap the two inverted subtrees</span>
  root.right = left;
  return root;
}</code></pre>
<p>
  Check each function against the three questions. <code>maxDepth(node)</code> returns
  the number of nodes on the longest downward path from <code>node</code>; the empty tree
  has 0; and the node adds 1 to the deeper child. <code>isSameTree(p, q)</code> returns
  whether the two subtrees have the same shape and values; two empty trees are the
  same, one empty and one not is a mismatch, and otherwise the roots must match and both
  pairs of children must be the same. <code>isSymmetric</code> needs a helper, because
  a single tree cannot be compared with itself; the helper takes <em>two</em> nodes and
  pairs the outer children with each other and the inner children with each other.
  <code>invertTree</code> swaps two subtrees that are already inverted.
</p>
<h4>Dry run: isSymmetric on a tree and on a lopsided one</h4>
<p>
  The symmetric tree has root 1 with two children 2, whose children are 3 and 4 on the
  left and 4 and 3 on the right. The calls are written in the order they are made, and
  <code>∅</code> stands for <code>null</code>.
</p>
<table>
  <tr><th>call</th><th>a (left side)</th><th>b (right side)</th><th>result</th><th>next calls</th></tr>
  <tr><td>1</td><td>2</td><td>2</td><td>values equal, keep going</td><td>(a.left, b.right) then (a.right, b.left)</td></tr>
  <tr><td>2</td><td>3</td><td>3</td><td>values equal, keep going</td><td>both children of each are empty</td></tr>
  <tr><td>3, 4</td><td>∅</td><td>∅</td><td>true</td><td>base case: both ended together</td></tr>
  <tr><td>5</td><td>4</td><td>4</td><td>values equal, keep going</td><td>both children of each are empty</td></tr>
  <tr><td>6, 7</td><td>∅</td><td>∅</td><td>true</td><td>the second pair of empty children</td></tr>
  <tr><td>—</td><td colspan="2">every pair matched</td><td>true</td><td>—</td></tr>
</table>
<p class="sub">
  Now take root 1 with two children 2, where each 2 has only a <em>right</em> child 3.
  The first call is <code>mirror(2, 2)</code>; the values match, so it evaluates
  <code>mirror(a.left, b.right)</code>, which is <code>mirror(∅, 3)</code>. One side is
  empty and the other is not, so that call returns <code>false</code> and the
  <code>&amp;&amp;</code> chain stops. Two such trees look alike in a drawing only if you
  forget that a mirror image flips the sides.
</p>
<div class="warn">
  <span class="ttl">⚠ Depth and height: say which one you count</span>
  The vocabulary table counts height in <b>edges</b>, so a single node has height 0. The
  exercises, and most interview statements of "maximum depth", count <b>nodes</b>, so a single
  node has depth 1. Both are fine, and they differ by exactly one, so when you code
  <code>maxDepth</code> ask which is meant, or return <code>0</code> for the empty tree and
  say so out loud.
</div>
<p>
  <b>Recursion depth is a real limit.</b> The call stack grows to the height of the tree. A
  tree with 100,000 nodes in a single chain makes the recursive <code>maxDepth</code> throw a
  <code>RangeError</code> in Node, because the calls nest 100,000 deep. A balanced tree is
  safe: its height is about <code>log₂ n</code>. If the input can be skewed and large,
  switch to a loop that handles one level at a time, which uses no recursion at all:
</p>
<pre><code>function maxDepthIterative(root) {
  if (root === null) return 0;
  let level = [root];
  let depth = 0;
  while (level.length &gt; 0) {
    depth++;
    const next = [];
    for (const node of level) {
      if (node.left !== null) next.push(node.left);
      if (node.right !== null) next.push(node.right);
    }
    level = next;
  }
  return depth;
}</code></pre>
<p class="sub">
  This returns <code>100000</code> on the same chain. It also touches every node once, so
  it is O(n) time, and its extra space is the widest level rather than the height.
</p>

<h3>Top-down versus bottom-up: which way does the information flow?</h3>
<p>
  The template says "combine the children's answers", which is <b>bottom-up</b>: the
  information flows from the leaves toward the root through the return values.
  <code>maxDepth</code> above is bottom-up. There is a second style, <b>top-down</b>, where
  information flows from the root toward the leaves through the <em>arguments</em>, and the
  answer is accumulated on the way.
</p>
<p>
  Look at the same problem both ways. Bottom-up, each node reports the height of its
  subtree. Top-down, each node is told its own depth, and a variable outside the function
  keeps the best depth seen:
</p>
<pre><code>function maxDepthTopDown(root) {
  let best = 0;
  function visit(node, depth) {
    if (node === null) return;
    best = Math.max(best, depth); <span class="c">// the information arrives from above</span>
    visit(node.left, depth + 1);
    visit(node.right, depth + 1);
  }
  visit(root, 1);
  return best;
}</code></pre>
<p>
  Both are correct and O(n). Which one you reach for depends on where the information a
  node needs comes from. If a node needs facts about its <em>descendants</em> (height,
  size, whether they are balanced), the answer travels up. If a node needs facts about its
  <em>ancestors</em> (my depth, the largest value above me, the sum of the path so far),
  the facts travel down as parameters.
</p>
<h4>Count good nodes: a top-down problem</h4>
<p>
  A node is <em>good</em> if no node on the path from the root to it has a larger value.
  Whether a node is good depends only on its ancestors, so pass <code>maxSoFar</code> down
  and add up the good nodes on the way back.
</p>
<pre><code>function goodNodes(root) {
  function visit(node, maxSoFar) {
    if (node === null) return 0;
    const good = node.val &gt;= maxSoFar ? 1 : 0; <span class="c">// nothing larger on the path from the root</span>
    const nextMax = Math.max(maxSoFar, node.val);
    return good + visit(node.left, nextMax) + visit(node.right, nextMax);
  }
  return visit(root, -Infinity); <span class="c">// so the root itself always counts</span>
}</code></pre>
<table>
  <tr><th>node</th><th>maxSoFar when we arrive</th><th>good?</th><th>why</th></tr>
  <tr><td>3 (root)</td><td>−∞</td><td>yes</td><td>nothing above it</td></tr>
  <tr><td>1 (left of 3)</td><td>3</td><td>no</td><td>1 &lt; 3</td></tr>
  <tr><td>3 (left of 1)</td><td>3</td><td>yes</td><td>3 ≥ 3: equal counts as good</td></tr>
  <tr><td>4 (right of the root)</td><td>3</td><td>yes</td><td>4 ≥ 3</td></tr>
  <tr><td>1 (left of 4)</td><td>4</td><td>no</td><td>1 &lt; 4</td></tr>
  <tr><td>5 (right of 4)</td><td>4</td><td>yes</td><td>5 ≥ 4</td></tr>
</table>
<p class="sub">
  The tree is <code>3</code> with children <code>1</code> and <code>4</code>, where 1 has a left
  child 3, and 4 has children 1 and 5. Four nodes are good. Two details: the comparison is
  <code>&gt;=</code>, not <code>&gt;</code>, because "no larger node above" includes equal ones;
  and the starting value is <code>−Infinity</code>, so the root is good without a special case.
</p>
<table>
  <tr><th>Style</th><th>You need to know…</th><th>You pass down</th><th>You return</th><th>Examples</th></tr>
  <tr><td>Bottom-up</td><td>something about the subtree below</td><td>nothing extra</td><td>height, size, a boolean, a pair</td><td>depth, balance, diameter, same tree</td></tr>
  <tr><td>Top-down</td><td>something about the path above</td><td>depth, max so far, running sum, bounds</td><td>a count, or nothing at all</td><td>good nodes, path sum, validate BST by range</td></tr>
  <tr><td>Both</td><td>an answer that uses both</td><td>what the path needs</td><td>what the subtree needs</td><td>path sums that start anywhere (see the next chapter)</td></tr>
</table>

<h3>Minimum depth — the one-child trap</h3>
<p>
  Minimum depth is the number of nodes on the shortest path from the root to a <b>leaf</b>.
  Copying <code>maxDepth</code> and swapping <code>max</code> for <code>min</code> looks
  right, and fails on the simplest input.
</p>
<pre><code>function minDepthWrong(root) {
  if (root === null) return 0;
  return 1 + Math.min(minDepthWrong(root.left), minDepthWrong(root.right));
}</code></pre>
<p>
  Take a root 1 whose only child is a right child 2, whose only child is a right child 3. A
  node with one empty child has one side whose answer is <code>0</code>, and
  <code>Math.min</code> happily picks it. The function returns <code>1 + min(0, …) = 1</code>,
  but the root is <em>not</em> a leaf, so the shortest root-to-leaf path has 3 nodes. The empty side
  is not a path to a leaf at all. The fix is to treat a missing child as unavailable, and to
  fall back to the other side:
</p>
<pre><code>function minDepth(root) {
  if (root === null) return 0;
  if (root.left === null) return 1 + minDepth(root.right); <span class="c">// only one side exists: it must be used</span>
  if (root.right === null) return 1 + minDepth(root.left);
  return 1 + Math.min(minDepth(root.left), minDepth(root.right));
}</code></pre>
<table>
  <tr><th>tree</th><th>wrong version</th><th>correct version</th><th>why</th></tr>
  <tr><td>1 → right 2 → right 3</td><td>1</td><td>3</td><td>the only leaf is 3</td></tr>
  <tr><td>1 with children 2 and 3</td><td>2</td><td>2</td><td>both children are leaves</td></tr>
  <tr><td>1; left child 2 whose only child is 4; right child 5 whose only child is 6</td><td>2</td><td>3</td><td>the leaves 4 and 6 are both three nodes down</td></tr>
</table>
<p>
  There is also a level-by-level version. Breadth-first search visits nodes in order of
  depth, so the <em>first leaf it meets</em> is a nearest one, and it can stop right there:
</p>
<pre><code>function minDepthBFS(root) {
  if (root === null) return 0;
  let level = [root];
  let depth = 1;
  while (level.length &gt; 0) {
    const next = [];
    for (const node of level) {
      if (node.left === null &amp;&amp; node.right === null) return depth; <span class="c">// the first leaf found is a nearest leaf</span>
      if (node.left !== null) next.push(node.left);
      if (node.right !== null) next.push(node.right);
    }
    level = next;
    depth++;
  }
  return depth;
}</code></pre>
<p class="sub">
  Both are O(n) in the worst case. The recursive one always visits every node. The
  breadth-first one visits only the nodes above and on the shallowest leaf's level, so it
  can finish much earlier on a wide tree. The same stop-at-the-first-hit property is why
  shortest-path questions in unweighted graphs use breadth-first search.
</p>

<h3>Is one tree inside another? Subtree of another tree</h3>
<p>
  Given <code>root</code> and <code>subRoot</code>, does some node of <code>root</code> have
  a subtree identical to <code>subRoot</code>? The recursion template gives it directly. The
  question about <code>root</code> is "does this tree contain <code>subRoot</code>?", and the
  answer is yes if the whole tree matches here, or if the left or right subtree contains it.
  "Match here" is exactly <code>isSameTree</code>, so the code reuses it.
</p>
<pre><code>function isSubtree(root, subRoot) {
  if (subRoot === null) return true;
  if (root === null) return false;
  return isSameTree(root, subRoot) || isSubtree(root.left, subRoot) || isSubtree(root.right, subRoot);
}</code></pre>
<p>
  <b>Cost.</b> Each of the <code>n</code> nodes of <code>root</code> may start a comparison that
  walks up to <code>m</code> nodes of <code>subRoot</code>, so the time is O(n·m) in the worst
  case, for example a root that is a long run of equal values and a subtree that ends with
  one different value. The comparison stops at the first mismatch, which is why typical inputs
  are much faster. The space is O(h) for the recursion.
</p>
<p>
  The O(n + m) version turns both trees into strings and asks whether one string contains
  the other, using a linear-time substring search such as KMP (see the <a href="/dsa/dsa-string-algorithms">string algorithms
  chapter</a>). The encoding must be the pre-order serialization with null markers, and it
  has to be <b>delimited</b>:
</p>
<pre><code>function encode(node) {
  if (node === null) return ",#";
  return "," + node.val + encode(node.left) + encode(node.right); <span class="c">// every token starts with a comma</span>
}

function isSubtreeByString(root, subRoot) {
  return encode(root).includes(encode(subRoot));
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Without delimiters, 2 is a substring of 12</span>
  Encode a tree whose root is 12 and a tree whose root is 2 as plain
  <code>"12,#,#"</code> and <code>"2,#,#"</code> and the second is "found" inside the first,
  although no node of the first holds the value 2. Starting every token with a comma means a
  match must begin at a token boundary. Null markers matter as well: pre-order with markers is
  prefix-free, so if the sub-tree's encoding appears starting at some node's token, that node's
  subtree must be exactly the sub-tree. Without markers, different shapes can give the same list
  of values.
</div>

<h3>Flattening a tree into a linked list, in place</h3>
<p>
  <b>Flatten Binary Tree to Linked List</b> asks you to rearrange the tree in place so that every
  node's <code>left</code> is <code>null</code> and its <code>right</code> points to the next node
  in <b>pre-order</b>. The result reads like a singly linked list built from the same nodes.
</p>
<p>
  The first idea is to collect the nodes in pre-order into an array and relink them, which
  costs O(n) extra space. The second idea is a neat trick on the traversal order itself.
  Pre-order is <em>node, left, right</em>. Run it backwards and you get <em>right, left,
  node</em>. If you visit in that reversed order, then at the moment you visit a node, the node you
  visited just before it is exactly the node that comes <b>next</b> in pre-order. So keep a
  <code>prev</code> variable, and for every node set <code>node.right = prev</code> and
  <code>node.left = null</code>.
</p>
<pre><code>function flatten(root) {
  let prev = null;
  function visit(node) {
    if (node === null) return;
    visit(node.right); <span class="c">// reverse pre-order: right, left, node</span>
    visit(node.left);
    node.right = prev; <span class="c">// prev is the node that comes NEXT in pre-order</span>
    node.left = null;
    prev = node;
  }
  visit(root);
}</code></pre>
<h4>Dry run: flatten the tree 1 (left 2 with children 3 and 4, right 5 with a right child 6)</h4>
<table>
  <tr><th>visit order (right, left, node)</th><th>node</th><th>prev before</th><th>wiring</th></tr>
  <tr><td>1st</td><td>6</td><td>∅</td><td>6.right = ∅, 6.left = ∅</td></tr>
  <tr><td>2nd</td><td>5</td><td>6</td><td>5.right = 6</td></tr>
  <tr><td>3rd</td><td>4</td><td>5</td><td>4.right = 5</td></tr>
  <tr><td>4th</td><td>3</td><td>4</td><td>3.right = 4</td></tr>
  <tr><td>5th</td><td>2</td><td>3</td><td>2.right = 3, 2.left = ∅</td></tr>
  <tr><td>6th</td><td>1</td><td>2</td><td>1.right = 2, 1.left = ∅</td></tr>
</table>
<p class="sub">
  Read the chain from the root: <code>1 → 2 → 3 → 4 → 5 → 6</code>, which is the pre-order of the
  original tree. The time is O(n); the extra space is the recursion stack, O(h).
</p>
<p>
  If the interviewer asks for O(1) extra space, use the iterative version. For each node that has a left child,
  find the <em>rightmost</em> node of that left subtree (the last node of its pre-order), hang the node's
  old right subtree off it, and move the whole left subtree over to the right.
</p>
<pre><code>function flattenInPlace(root) {
  let node = root;
  while (node !== null) {
    if (node.left !== null) {
      let rightmost = node.left;
      while (rightmost.right !== null) rightmost = rightmost.right;
      rightmost.right = node.right; <span class="c">// the old right subtree follows the left subtree's last node</span>
      node.right = node.left;
      node.left = null;
    }
    node = node.right;
  }
}</code></pre>
<p class="sub">
  The inner walk looks like it could make the whole thing quadratic, but a node is on the walked
  spine of at most one ancestor's left subtree, so the walks add up to at most n steps and the
  total time is O(n). The space is O(1): no recursion, no stack. Linking the rightmost node of
  a left subtree to the node that must follow it, so that you can find your way on without a stack, is the same idea as the Morris traversal
  (which removes its temporary link again afterwards).
</p>

<h3>Trees that are not made of pointers: arrays and N-ary nodes</h3>
<h4>A complete tree stored in an array</h4>
<p>
  A <b>complete</b> binary tree fills every level from left to right: all levels are full except
  possibly the last, and the last is packed to the left. That regular shape makes pointers
  unnecessary. Number the nodes in level order starting at 0, and the position alone gives the
  relationships:
</p>
<pre><code>const parentIndex = (i) =&gt; Math.floor((i - 1) / 2);
const leftIndex = (i) =&gt; 2 * i + 1;
const rightIndex = (i) =&gt; 2 * i + 2;

function treeFromCompleteArray(values, i = 0) {
  if (i &gt;= values.length) return null;
  return new TreeNode(values[i], treeFromCompleteArray(values, leftIndex(i)), treeFromCompleteArray(values, rightIndex(i)));
}</code></pre>
<table>
  <tr><th>index</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
  <tr><td>value</td><td>10</td><td>20</td><td>30</td><td>40</td><td>50</td><td>60</td></tr>
  <tr><td>children</td><td>1, 2</td><td>3, 4</td><td>5, —</td><td>—</td><td>—</td><td>—</td></tr>
  <tr><td>parent</td><td>—</td><td>0</td><td>0</td><td>1</td><td>1</td><td>2</td></tr>
</table>
<p class="sub">
  This is how a heap is stored (see the <a href="/dsa/dsa-heaps-priority-queues">heaps chapter</a>) and why its operations never need to allocate a node.
  The layout is only efficient when the tree really is complete. A tree that is a single chain of right
  children needs the slot <code>2^(d+1) − 2</code> for the node at depth <code>d</code>: index 0, 2, 6, 14, 30 …
  so an array would be almost entirely empty and its length would double with every extra node.
</p>
<div class="warn">
  <span class="ttl">⚠ The "level-order with nulls" arrays in the exercises are not this layout</span>
  An input such as <code>[1, null, 2, 3]</code> is written in level order, but <b>children of a
  missing node are not listed</b>. So 2 is the right child of 1, and 3 is the left child of 2, which
  sits at array index 3, not at <code>2·2 + 1 = 5</code>. Building a tree from such an array needs a
  queue that remembers which nodes are waiting for children, not index arithmetic:
</div>
<pre><code>function fromLevelOrder(values) {
  if (values.length === 0 || values[0] === null) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let head = 0;
  let i = 1;
  while (head &lt; queue.length &amp;&amp; i &lt; values.length) {
    const node = queue[head++];
    if (i &lt; values.length &amp;&amp; values[i] !== null) {
      node.left = new TreeNode(values[i]);
      queue.push(node.left);
    }
    i++;
    if (i &lt; values.length &amp;&amp; values[i] !== null) {
      node.right = new TreeNode(values[i]);
      queue.push(node.right);
    }
    i++;
  }
  return root;
}</code></pre>
<p class="sub">
  The loop reads two array entries per node taken from the queue: first the left child, then the
  right, skipping <code>null</code> entries. That is the same order level-order traversal produces,
  which is why the format is called level order.
</p>
<h4>Checking that a tree is complete</h4>
<p>
  A level-order walk can test completeness without computing a single index. Push every child,
  <em>including empty ones</em>. In a complete tree all real nodes come first; once you meet an
  empty slot, everything after it must be empty too. A real node after a gap means the last level is
  not packed to the left.
</p>
<pre><code>function isCompleteTree(root) {
  if (root === null) return true;
  const queue = [root];
  let head = 0;
  let seenGap = false;
  while (head &lt; queue.length) {
    const node = queue[head++];
    if (node === null) {
      seenGap = true; <span class="c">// everything after the first gap must also be a gap</span>
      continue;
    }
    if (seenGap) return false; <span class="c">// a real node after a gap: the last level is not packed to the left</span>
    queue.push(node.left, node.right);
  }
  return true;
}</code></pre>
<table>
  <tr><th>tree</th><th>nodes taken off the queue, in order</th><th>result</th></tr>
  <tr><td>1; 2, 3; 4, 5, 6</td><td>1 2 3 4 5 6, then only empty slots</td><td>true</td></tr>
  <tr><td>1; 2, 3; 4, 5, ∅, 7</td><td>1 2 3 4 5, a gap where 3's left child should be, then 7</td><td>false (7 comes after a gap)</td></tr>
</table>
<h4>N-ary trees</h4>
<p>
  Not every tree is binary. A file system, an HTML document and an organisation chart give each node
  any number of children. Store them as an array, <code>children</code>, and every binary template
  carries over with the two recursive calls replaced by a loop over the array:
</p>
<pre><code>class NaryNode {
  constructor(val, children = []) {
    this.val = val;
    this.children = children;
  }
}

function naryPreorder(node, out = []) {
  if (node === null) return out;
  out.push(node.val);
  for (const child of node.children) naryPreorder(child, out);
  return out;
}

function naryPostorder(node, out = []) {
  if (node === null) return out;
  for (const child of node.children) naryPostorder(child, out);
  out.push(node.val);
  return out;
}

function naryLevelOrder(root) {
  if (root === null) return [];
  const result = [];
  let level = [root];
  while (level.length &gt; 0) {
    result.push(level.map((node) =&gt; node.val));
    level = level.flatMap((node) =&gt; node.children);
  }
  return result;
}

function naryMaxDepth(node) {
  if (node === null) return 0;
  let deepest = 0;
  for (const child of node.children) deepest = Math.max(deepest, naryMaxDepth(child));
  return 1 + deepest;
}</code></pre>
<p class="sub">
  There is no standard in-order for an N-ary tree, since there is no single place "between" the children to
  visit the node; pre-order and post-order, which only depend on "before" and "after" the children,
  are the ones that exist. A leaf is a node whose <code>children</code> array is empty, and the
  recursion terminates there through the loop that runs zero times. The time for each traversal is
  O(n) and the space is O(h) for the recursion, or O(width) for the level-order version.
</p>

<h3>Parent pointers, and the tree as a graph</h3>
<p>
  A tree node normally knows only its children, so questions that go <em>up</em> (ancestors,
  the path to the root, the nearest common ancestor) are awkward. Two fixes are standard. The
  first is to <b>record each node's parent</b> in a map, in one traversal:
</p>
<pre><code>function parentMap(root) {
  const parent = new Map([[root, null]]);
  const stack = [root];
  while (stack.length &gt; 0) {
    const node = stack.pop();
    for (const child of [node.left, node.right]) {
      if (child !== null) {
        parent.set(child, node);
        stack.push(child);
      }
    }
  }
  return parent;
}</code></pre>
<p>
  With the map, walking from any node to the root is a loop, and a question that needed a full search
  becomes a short walk. For example, the lowest common ancestor of two nodes is the first ancestor of
  one that is also an ancestor of the other:
</p>
<pre><code>function lcaByParents(parent, p, q) {
  const ancestorsOfP = new Set();
  for (let node = p; node !== null; node = parent.get(node)) ancestorsOfP.add(node);
  for (let node = q; node !== null; node = parent.get(node)) {
    if (ancestorsOfP.has(node)) return node; <span class="c">// the first ancestor of q that is also an ancestor of p</span>
  }
  return null;
}</code></pre>
<p class="sub">
  Building the map is O(n); each query afterwards is O(h) in time and space. The recursive
  LCA in the <a href="/dsa/dsa-tree-problems">next chapter</a> needs no map, only its O(h) recursion stack, so prefer it for a single query. The map
  pays off when you ask many questions about the same tree.
</p>
<p>
  The second fix answers "is A an ancestor of B?" in O(1) after one traversal. Give every node an
  <b>entry time</b> when the traversal first reaches it and an <b>exit time</b> when it leaves,
  using one clock that ticks at both moments. Then A is an ancestor of B exactly when A's interval
  contains B's.
</p>
<pre><code>function entryExitTimes(root) {
  const tin = new Map();
  const tout = new Map();
  let clock = 0;
  function visit(node) {
    tin.set(node, clock++);
    if (node.left !== null) visit(node.left);
    if (node.right !== null) visit(node.right);
    tout.set(node, clock++);
  }
  visit(root);
  return { tin, tout };
}

function isAncestor(times, a, b) {
  return times.tin.get(a) &lt;= times.tin.get(b) &amp;&amp; times.tout.get(b) &lt;= times.tout.get(a);
}</code></pre>
<p class="sub">
  The intervals of two nodes are either nested (one is an ancestor of the other) or disjoint
  (neither is), and never partially overlapping, because a traversal finishes a subtree before it moves
  to the next one. This numbering is also how a subtree becomes a contiguous range of an array, which is how
  subtree queries are answered with a Fenwick or segment tree.
</p>
<p>
  <b>A tree is a graph.</b> A tree with <code>n</code> nodes is connected, has no cycle and has exactly
  <code>n − 1</code> edges. Once every node knows its parent as well as its children, each node has the
  neighbours <code>{ left, right, parent }</code>, and any graph algorithm applies, in particular
  breadth-first search starting from <em>any</em> node, not only the root. That one observation solves
  a whole family ("every node at distance k from this node", "the longest path in the tree") which is
  worked in the tree problems chapter, and it connects this chapter to the graph chapters.
</p>

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
</ul>

<h3>Binary search trees have their own chapter</h3>
<p>
  This chapter treats a BST as a binary tree with one extra property. The operations that
  <em>use</em> that property to be fast, namely insert, delete, successor and predecessor, floor and
  ceiling, the BST iterator, and building a balanced BST from a sorted array, are collected in
  <a href="/dsa/dsa-bst-operations">BST operations and ordered data</a>. Here you only need the search
  loop from earlier and the fact that an in-order walk of a BST is sorted.
</p>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write all three DFS traversals from memory, and say in one sentence what actually changes between them.</li>
    <li>Write level order with a queue, using the <code>levelSize</code> snapshot to separate levels correctly.</li>
    <li>Explain why an unbalanced BST degrades every operation to O(n), with an example insertion order that causes it.</li>
    <li>Convert pre-order from recursive to iterative using an explicit stack, and say why right gets pushed before left.</li>
    <li>Given a new problem, name which traversal it needs and why — before writing a single line of code.</li>
    <li>State the three questions that define a recursive tree function, and apply them to <code>maxDepth</code> and <code>isSymmetric</code> before writing code.</li>
    <li>Decide whether a new problem needs information from above (pass it down) or from below (return it up), and name one problem of each kind.</li>
    <li>Explain why <code>1 + Math.min(left, right)</code> is wrong for minimum depth, and show the smallest tree that breaks it.</li>
    <li>Say what <code>isSubtree</code> costs, and why a string-based version needs a delimiter on every token.</li>
    <li>Flatten a tree in pre-order by visiting right, left, node with a <code>prev</code> pointer, and explain why it works.</li>
    <li>Write the index formulas for a complete tree in an array, and say why a level-order array with <code>null</code> placeholders does not follow them.</li>
    <li>Describe two ways to answer ancestor questions, a parent map and entry/exit times, and what each costs.</li>
  </ul>
</div>`,
};
