import type { Chapter } from "../types";

export const dsaTreeProblems: Chapter = {
  id: "dsa-tree-problems",
  num: "I2",
  title: "Tree problems in depth",
  short: "Tree problems in depth",
  levels: ["intermediate"],
  practice: [
    "ex-tree-zigzag-level-order",
    "ex-tree-right-side-view",
    "ex-tree-diameter",
    "ex-tree-balanced",
    "ex-tree-lowest-common-ancestor",
    "ex-tree-validate-bst",
    "ex-tree-kth-smallest-bst",
    "ex-tree-lca-bst",
    "ex-tree-sorted-array-to-bst",
    "ex-tree-build-from-preorder-inorder",
    "ex-tree-serialize-deserialize",
    "ex-tree-path-sum-ii",
    "ex-tree-max-path-sum",
    "ex-tree-next-right-pointers",
  ],
  ready: true,
  subtitle: "Construction, LCA, balance and serialization — the four questions traversal alone doesn't answer.",
  body: `<h3>Building a tree back from its traversals</h3>
<p>
  Given pre-order and in-order sequences, you can reconstruct the exact
  original tree — this works because <b>pre-order's first element is
  always the root</b>, and once you know the root, in-order tells you
  exactly which values belong in the left subtree (everything before the
  root) versus the right subtree (everything after it).
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="Using the root from preorder to split the inorder sequence into left and right subtree groups">
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="600" height="40" rx="6" />
      <rect class="box" x="20" y="90" width="600" height="40" rx="6" />
    </g>
    <text class="sm" x="40" y="45">pre-order: [ 3, 9, 20, 15, 7 ] — first element (3) is the root</text>
    <text class="sm" x="40" y="115">in-order:  [ 9, 3, 15, 20, 7 ] — find 3, everything left of it is the left subtree</text>
    <path class="lnr" d="M60,130 L60,160" />
    <path class="lng" d="M300,130 L500,160" />
    <text class="sm rd" x="20" y="180">left subtree in-order: [9]</text>
    <text class="sm gr" x="300" y="180">right subtree in-order: [15, 20, 7]</text>
    <text class="lbl" x="20" y="205" style="font-size:14px">recurse: next pre-order element (9) is the left subtree's root, and so on</text>
  </svg>
  <figcaption>Root from pre-order splits in-order into two halves — repeat recursively for each half.</figcaption>
</figure>
<pre><code>function buildTree(preorder, inorder) {
  if (preorder.length === 0) return null;

  const rootVal = preorder[0];
  const root = { val: rootVal, left: null, right: null };

  const splitIndex = inorder.indexOf(rootVal);
  const leftInorder = inorder.slice(0, splitIndex);
  const rightInorder = inorder.slice(splitIndex + 1);

  root.left = buildTree(preorder.slice(1, 1 + leftInorder.length), leftInorder);
  root.right = buildTree(preorder.slice(1 + leftInorder.length), rightInorder);

  return root;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Post-order + pre-order alone isn't enough</span>
  Pre-order and post-order together can't always uniquely reconstruct a
  binary tree — some trees produce identical pre/post pairs. You need
  in-order paired with either pre-order or post-order (or a fully
  balanced/complete tree structure) to guarantee a unique answer. Worth
  saying out loud if asked to justify why the combination matters.
</div>

<h3>Lowest Common Ancestor (LCA)</h3>
<p>
  The LCA of two nodes is the deepest node that has both as descendants.
  On a plain binary tree, you find it by searching both subtrees and
  noticing where the paths to each target first "meet."
</p>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="A tree highlighting the path down to two target nodes and marking the node where those paths diverge as the lowest common ancestor">
    <g class="rough">
      <path class="ln" d="M320,40 L200,100" />
      <path class="lnr" d="M320,40 L440,100" />
      <path class="ln" d="M200,100 L140,160" />
      <path class="lnr" d="M440,100 L380,160" />
      <path class="lnr" d="M440,100 L500,160" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="40" r="22" />
      <circle class="box" cx="200" cy="100" r="22" />
      <circle class="boxr" cx="440" cy="100" r="22" />
      <circle class="box" cx="140" cy="160" r="22" />
      <circle class="boxr" cx="380" cy="160" r="22" />
      <circle class="boxr" cx="500" cy="160" r="22" />
    </g>
    <text class="sm" x="320" y="45" text-anchor="middle">1</text>
    <text class="sm" x="200" y="105" text-anchor="middle">2</text>
    <text class="sm" x="440" y="105" text-anchor="middle">3</text>
    <text class="sm" x="140" y="165" text-anchor="middle">4</text>
    <text class="sm" x="380" y="165" text-anchor="middle">5</text>
    <text class="sm" x="500" y="165" text-anchor="middle">6</text>
    <text class="lbl rd" x="20" y="195" style="font-size:14px">LCA(5, 6) = 3 — the node where both paths are still together</text>
  </svg>
  <figcaption>3 is an ancestor of both 5 and 6, and it's the deepest one that is.</figcaption>
</figure>
<pre><code>function lowestCommonAncestor(root, p, q) {
  if (root === null || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root; <span class="c">// p and q split across both sides — root is the LCA</span>
  return left ?? right;            <span class="c">// both on one side — pass that answer up</span>
}</code></pre>
<p class="sub">
  On a <em>BST</em> specifically, you can skip the full search: compare
  both targets against the current node's value. If both are smaller, go
  left; if both are bigger, go right; the moment they split (or match the
  node), you've found the LCA in O(log n) instead of O(n) — the BST
  property does the pruning for you.
</p>

<h3>Checking if a tree is height-balanced</h3>
<div class="warn">
  <span class="ttl">⚠ The naive version is accidentally O(n²)</span>
  Calling a separate <code>height()</code> function at every node, inside
  a traversal that visits every node, recomputes height from scratch each
  time — O(n) work, done n times. The fix: compute height and check
  balance <em>in the same pass</em>, and short-circuit upward the moment
  imbalance is found anywhere below.
</div>
<pre><code>function isBalanced(root) {
  function check(node) {
    if (node === null) return 0; <span class="c">// height of an empty tree</span>

    const leftHeight = check(node.left);
    if (leftHeight === -1) return -1; <span class="c">// already unbalanced below — stop early</span>

    const rightHeight = check(node.right);
    if (rightHeight === -1) return -1;

    if (Math.abs(leftHeight - rightHeight) > 1) return -1; <span class="c">// -1 means "unbalanced"</span>

    return 1 + Math.max(leftHeight, rightHeight);
  }
  return check(root) !== -1;
}</code></pre>

<h3>Validate BST — the trap almost everyone falls into first</h3>
<div class="warn">
  <span class="ttl">⚠ "Check left &lt; node &lt; right at every node" is NOT enough</span>
  It's tempting to just compare each node against its immediate children.
  That misses violations further down: a right-subtree node can be
  smaller than a distant ancestor even while being bigger than its direct
  parent. The BST property is about <b>every node in the entire left
  subtree, and every node in the entire right subtree</b> — not just
  direct children.
</div>
<figure>
  <svg viewBox="0 0 400 170" class="dg" role="img" aria-label="A tree that passes a naive parent-child only check but is not actually a valid BST because a deep node violates an ancestor's range">
    <g class="rough">
      <path class="ln" d="M200,30 L110,80" />
      <path class="lnr" d="M200,30 L290,80" />
      <path class="lnr" d="M290,80 L250,130" />
    </g>
    <g class="rough">
      <circle class="box" cx="200" cy="30" r="22" />
      <circle class="box" cx="110" cy="80" r="22" />
      <circle class="box" cx="290" cy="80" r="22" />
      <circle class="boxr" cx="250" cy="130" r="22" />
    </g>
    <text class="sm" x="200" y="35" text-anchor="middle">5</text>
    <text class="sm" x="110" y="85" text-anchor="middle">3</text>
    <text class="sm" x="290" y="85" text-anchor="middle">8</text>
    <text class="sm rd" x="250" y="135" text-anchor="middle">4</text>
  </svg>
  <figcaption>4 &lt; 8 (its parent) looks fine locally — but 4 is in 5's right subtree, so it must be &gt; 5. It isn't. Invalid.</figcaption>
</figure>
<pre><code><span class="c">// pass down a valid (min, max) RANGE, tightened at every step</span>
function isValidBST(node, min = -Infinity, max = Infinity) {
  if (node === null) return true;
  if (node.val <= min || node.val >= max) return false;

  return (
    isValidBST(node.left, min, node.val) &&   <span class="c">// left subtree must stay BELOW node.val</span>
    isValidBST(node.right, node.val, max)      <span class="c">// right subtree must stay ABOVE node.val</span>
  );
}</code></pre>
<p class="sub">
  An equally valid alternative: run an in-order traversal and check the
  output is strictly increasing — since in-order on a real BST always
  produces sorted output (from the Trees chapter), any violation of that
  proves it isn't one. Both approaches are O(n) time, O(h) space.
</p>

<h3>Diameter of a binary tree</h3>
<p>
  The diameter is the length of the longest path between <em>any</em> two
  nodes — and that path doesn't have to pass through the root. The
  subtlety: the longest path <em>through</em> a given node is
  <code>leftHeight + rightHeight</code>, but the final answer is the
  <b>maximum of that value across every node</b>, not just the root.
</p>
<pre><code>function diameterOfBinaryTree(root) {
  let diameter = 0;

  function height(node) {
    if (node === null) return 0;
    const leftHeight = height(node.left);
    const rightHeight = height(node.right);

    diameter = Math.max(diameter, leftHeight + rightHeight); <span class="c">// update global answer at EVERY node</span>

    return 1 + Math.max(leftHeight, rightHeight); <span class="c">// but only return height upward</span>
  }

  height(root);
  return diameter;
}</code></pre>
<p class="sub">
  This is the same shape as <code>isBalanced</code> above — a single
  post-order pass that computes a per-node value (height) while
  side-effecting a running global answer. That combination — "return one
  thing up the call stack, but also track a separate best-so-far as you
  go" — is worth recognizing as its own recurring template; it also
  solves Binary Tree Maximum Path Sum with the same shape (track the best
  path found anywhere, but only return the best <em>single-branch</em>
  extension upward, since a path can't fork twice).
</p>

<h3>Serialization — turning a tree into a string and back</h3>
<p>
  Pre-order with explicit <code>null</code> markers is the standard
  approach — it's the only single traversal that, alone, can rebuild the
  exact tree shape without needing a second traversal like the
  construction problem above.
</p>
<pre><code>function serialize(root) {
  if (root === null) return "null";
  return \`\${root.val},\${serialize(root.left)},\${serialize(root.right)}\`;
}

function deserialize(data) {
  const values = data.split(",");
  let i = 0;

  function build() {
    if (values[i] === "null") { i++; return null; }
    const node = { val: Number(values[i++]), left: null, right: null };
    node.left = build();
    node.right = build();
    return node;
  }
  return build();
}</code></pre>
<p class="sub">
  The <code>null</code> markers are what make one traversal enough — they
  tell the rebuilder exactly where each branch ends, instead of needing a
  second traversal to disambiguate the shape.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll serialize with
  pre-order and explicit null markers, since that's the one traversal
  where the string alone — no second traversal needed — is enough to
  rebuild the exact original shape."
</div>

<h3>Recognizing which of these four you need</h3>
<ul>
  <li>"Given two traversals, rebuild the tree" → construction (use pre/post-order for the root, in-order to split subtrees)</li>
  <li>"Find the common ancestor" → LCA (BST property prunes it to O(log n) if it's a BST)</li>
  <li>"Is this tree balanced/valid?" → compute the property bottom-up in one pass, short-circuit on failure</li>
  <li>"Save this tree to a file / send over a network" → serialize with pre-order + null markers</li>
</ul>`,
};
