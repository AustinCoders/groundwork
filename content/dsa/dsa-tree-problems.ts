import type { Chapter } from "../types";

export const dsaTreeProblems: Chapter = {
  id: "dsa-tree-problems",
  num: "I3",
  title: "Tree problems in depth",
  short: "Tree problems in depth",
  levels: ["intermediate"],
  prerequisites: ["dsa-trees"],
  practice: [
    "ex-tree-zigzag-level-order",
    "ex-tree-right-side-view",
    "ex-tree-level-averages",
    "ex-tree-next-right-pointers",
    "ex-tree-diameter",
    "ex-tree-balanced",
    "ex-tree-lowest-common-ancestor",
    "ex-tree-validate-bst",
    "ex-tree-kth-smallest-bst",
    "ex-tree-lca-bst",
    "ex-tree-sorted-array-to-bst",
    "ex-tree-build-from-preorder-inorder",
    "ex-tree-build-from-inorder-postorder",
    "ex-tree-serialize-deserialize",
    "ex-tree-serialize-bst",
    "ex-tree-path-sum-ii",
    "ex-tree-path-sum-iii",
    "ex-tree-max-path-sum",
    "ex-tree-vertical-order",
    "ex-tree-nodes-at-distance-k",
    "ex-tree-house-robber-iii",
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
<h4>Dry run: rebuilding the tree in the diagram above</h4>
<table>
  <tr><th>Call</th><th>preorder in</th><th>inorder in</th><th>rootVal</th><th>splitIndex</th><th>leftInorder</th><th>rightInorder</th></tr>
  <tr><td>1 — root</td><td>[3, 9, 20, 15, 7]</td><td>[9, 3, 15, 20, 7]</td><td>3</td><td>1</td><td>[9]</td><td>[15, 20, 7]</td></tr>
  <tr><td>2 — 3's left</td><td>[9]</td><td>[9]</td><td>9</td><td>0</td><td>[]</td><td>[]</td></tr>
  <tr><td>3 — 3's right</td><td>[20, 15, 7]</td><td>[15, 20, 7]</td><td>20</td><td>1</td><td>[15]</td><td>[7]</td></tr>
  <tr><td>4 — 20's left</td><td>[15]</td><td>[15]</td><td>15</td><td>0</td><td>[]</td><td>[]</td></tr>
  <tr><td>5 — 20's right</td><td>[7]</td><td>[7]</td><td>7</td><td>0</td><td>[]</td><td>[]</td></tr>
</table>
<p class="sub">
  Calls 2, 4 and 5 get an empty <code>leftInorder</code> and
  <code>rightInorder</code>, so both their recursive calls hit
  <code>preorder.length === 0</code> and return <code>null</code> — that's
  the base case doing its job, turning each of those calls into a leaf.
  The result is exactly the tree in the figure: 3 with left child 9, and
  right child 20 whose own children are 15 and 7.
</p>
<div class="warn">
  <span class="ttl">⚠ Post-order + pre-order alone isn't enough</span>
  Pre-order and post-order together can't always uniquely reconstruct a
  binary tree — some trees produce identical pre/post pairs. You need
  in-order paired with either pre-order or post-order (or a fully
  balanced/complete tree structure) to guarantee a unique answer. Worth
  saying out loud if asked to justify why the combination matters.
</div>

<h3>Building from traversals in O(n): an index map and a moving pointer</h3>
<p>
  Look again at the code above and ask what each call costs. <code>inorder.indexOf</code>
  scans the array to find the root, and the two <code>slice</code> calls copy the pieces.
  Both are O(length of the piece), and on a skewed tree the pieces shrink by only one each
  time, so the total is O(n²). It works for a five-node example and is too slow for a long
  one. Two changes make it O(n), and neither changes the idea.
</p>
<ol>
  <li><b>Look the root up in a map.</b> Build a <code>Map</code> from each value to its index in the in-order array once, in O(n). Finding the split point is then O(1). This needs the values to be <b>distinct</b>, as the problem promises; with duplicates the root's position is ambiguous and the tree is not unique.</li>
  <li><b>Never copy.</b> Instead of slicing, describe each subtree by the inclusive range <code>lo..hi</code> of the in-order array that it owns. The pre-order array is never cut either: its next unused element is always the next root to place, so a single moving index <code>preIndex</code> is enough.</li>
</ol>
<pre><code>function buildTree(preorder, inorder) {
  const indexOf = new Map(inorder.map((value, i) =&gt; [value, i])); <span class="c">// one pass, O(1) lookups later</span>
  let preIndex = 0;
  function build(lo, hi) { <span class="c">// lo..hi is the inclusive range of inorder this subtree owns</span>
    if (lo &gt; hi) return null;
    const rootVal = preorder[preIndex++];
    const root = new TreeNode(rootVal);
    const mid = indexOf.get(rootVal);
    root.left = build(lo, mid - 1); <span class="c">// left first: preorder lists the left subtree before the right</span>
    root.right = build(mid + 1, hi);
    return root;
  }
  return build(0, inorder.length - 1);
}</code></pre>
<p>
  The order of the two recursive calls is not a style choice. Pre-order lists a node, then the
  <em>whole left subtree</em>, then the whole right subtree, so after taking the root, the
  next values in line belong to the left subtree, and <code>build</code> must handle the left
  side first so that <code>preIndex</code> is in the right place when the right side starts.
</p>
<h4>Dry run: preorder [3, 9, 20, 15, 7], inorder [9, 3, 15, 20, 7]</h4>
<table>
  <tr><th>call (lo, hi)</th><th>root taken from preorder</th><th>index in inorder</th><th>left range</th><th>right range</th></tr>
  <tr><td>(0, 4)</td><td>3</td><td>1</td><td>(0, 0)</td><td>(2, 4)</td></tr>
  <tr><td>(0, 0)</td><td>9</td><td>0</td><td>(0, −1): empty</td><td>(1, 0): empty</td></tr>
  <tr><td>(2, 4)</td><td>20</td><td>3</td><td>(2, 2)</td><td>(4, 4)</td></tr>
  <tr><td>(2, 2)</td><td>15</td><td>2</td><td>(2, 1): empty</td><td>(3, 2): empty</td></tr>
  <tr><td>(4, 4)</td><td>7</td><td>4</td><td>(4, 3): empty</td><td>(5, 4): empty</td></tr>
</table>
<p class="sub">
  A call with <code>lo &gt; hi</code> is an empty range and returns <code>null</code> without
  consuming anything from <code>preorder</code>. The roots are taken in the order 3, 9, 20, 15, 7,
  which is exactly the pre-order array front to back. Each of the n nodes is created once and each
  lookup is O(1), so the time is O(n) and the space is O(n) for the map plus O(h) for the recursion.
</p>
<h4>The same idea from in-order and post-order</h4>
<p>
  Post-order puts the root <em>last</em>. Read the array from the back: the last value is the
  root, and before it come the right subtree and then the left subtree. So the pointer starts at the end
  and moves left, and the right subtree has to be built first:
</p>
<pre><code>function buildTreeFromPost(inorder, postorder) {
  const indexOf = new Map(inorder.map((value, i) =&gt; [value, i]));
  let postIndex = postorder.length - 1; <span class="c">// the root is LAST in postorder</span>
  function build(lo, hi) {
    if (lo &gt; hi) return null;
    const rootVal = postorder[postIndex--];
    const root = new TreeNode(rootVal);
    const mid = indexOf.get(rootVal);
    root.right = build(mid + 1, hi); <span class="c">// reading backwards, the right subtree comes first</span>
    root.left = build(lo, mid - 1);
    return root;
  }
  return build(0, inorder.length - 1);
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Which pairs of traversals work</span>
  In-order plus pre-order, and in-order plus post-order, each determine the tree when the values are
  distinct. Pre-order plus post-order do not in general: a node with a single child can be a left child
  or a right child and give the same two lists. The common mistake with the code above is the order of the
  two recursive calls. If you swap them in <code>buildTree</code> you take the right subtree's roots from the
  front of the pre-order array, so on most inputs the tree comes out wrong, and on some the index runs off the end of the
  array and the recursion never stops.
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

<h3>Path problems: three different questions, three templates</h3>
<p>
  "Path sum" is a family, not a single problem, and the key to each member is the exact definition of
  a path. Read these three carefully, because they look alike and need different code.
</p>
<table>
  <tr><th>Problem</th><th>A path is…</th><th>Template</th></tr>
  <tr><td>Path Sum II</td><td>root to a <b>leaf</b>, all of them listed</td><td>top-down with a shared path array; push, recurse, pop</td></tr>
  <tr><td>Path Sum III</td><td>any <b>downward</b> stretch (start anywhere, end anywhere below)</td><td>top-down with a prefix-sum map</td></tr>
  <tr><td>Maximum Path Sum</td><td>any stretch that may <b>bend once</b> at a top node</td><td>bottom-up: bend at the node, return one branch</td></tr>
</table>
<h4>Path Sum II: list every root-to-leaf path with a given sum</h4>
<p>
  This is backtracking on a tree. Keep one array, <code>path</code>, which always holds the nodes from the
  root to the current node. On arrival, push the node; on the way out, pop it. At a leaf, check the
  remaining sum and, on a match, record a <b>copy</b> of the path.
</p>
<pre><code>function pathSum(root, target) {
  const paths = [];
  const path = [];
  function visit(node, remaining) {
    if (node === null) return;
    path.push(node.val);
    remaining -= node.val;
    if (node.left === null &amp;&amp; node.right === null &amp;&amp; remaining === 0) paths.push([...path]); <span class="c">// copy: path keeps changing</span>
    visit(node.left, remaining);
    visit(node.right, remaining);
    path.pop(); <span class="c">// undo this node's push before returning to the parent</span>
  }
  visit(root, target);
  return paths;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Copy the path, and pop on every exit</span>
  <code>paths.push(path)</code> stores a reference to the one shared array, which later pushes and pops
  keep changing, so every recorded answer ends up identical, usually empty. Copy at the leaf. The
  <code>pop</code> must run on every route out of the function; because the early
  <code>return</code> for <code>null</code> happens <em>before</em> the push, there is nothing to undo there. And a
  path ends only at a leaf: checking <code>remaining === 0</code> at a node that still has a child would
  accept a path that stops half-way down. With negative values you cannot stop early when the running
  sum exceeds the target.
</div>
<p class="sub">
  On the tree 5 (4 (11 (7, 2)), 8 (13, 4 (5, 1))) with target 22 it returns
  <code>[[5, 4, 11, 2], [5, 8, 4, 5]]</code>. Visiting is O(n), and each copy costs the length of the path it
  records, so the total grows beyond O(n) when many long paths match. The extra space is O(h) for the path and the
  recursion, not counting the answer.
</p>
<h4>Maximum Path Sum: the full code</h4>
<p>
  Here a path may start and end at any node and may bend once, at its highest node, so a path through a
  node is: the best downward branch on the left, the node, the best downward branch on the right. The
  diameter chapter section above has the same shape, with node values in place of edge counts, and two
  changes: values can be <b>negative</b>, so a branch with a negative gain is dropped by taking
  <code>Math.max(0, …)</code>, and the answer starts at <code>−Infinity</code> because every node might be
  negative.
</p>
<pre><code>function maxPathSum(root) {
  let best = -Infinity;
  function gain(node) {
    if (node === null) return 0;
    const left = Math.max(0, gain(node.left)); <span class="c">// a negative branch is better left out</span>
    const right = Math.max(0, gain(node.right));
    best = Math.max(best, node.val + left + right); <span class="c">// a path that bends at this node</span>
    return node.val + Math.max(left, right); <span class="c">// but only one branch can continue upward</span>
  }
  gain(root);
  return best;
}</code></pre>
<table>
  <tr><th>node (post-order)</th><th>left gain</th><th>right gain</th><th>path that bends here</th><th>returned upward</th></tr>
  <tr><td>9</td><td>0</td><td>0</td><td>9</td><td>9</td></tr>
  <tr><td>15</td><td>0</td><td>0</td><td>15</td><td>15</td></tr>
  <tr><td>7</td><td>0</td><td>0</td><td>7</td><td>7</td></tr>
  <tr><td>20</td><td>15</td><td>7</td><td>20 + 15 + 7 = 42</td><td>20 + max(15, 7) = 35</td></tr>
  <tr><td>−10 (root)</td><td>9</td><td>35</td><td>−10 + 9 + 35 = 34</td><td>25 (unused)</td></tr>
</table>
<p class="sub">
  The tree is −10 with children 9 and 20, where 20 has children 15 and 7. The best path is
  <code>15 → 20 → 7</code> with sum 42, found at the node 20. The bend value is <em>recorded</em> but never
  <em>returned</em>: a parent may extend only one branch, because a path cannot fork twice. That
  "record one thing, return another" split is the whole problem. Time O(n), space O(h). Writing
  <code>let best = 0</code> instead of <code>−Infinity</code> is the usual bug: a tree of all negative values
  would then report 0, a path that does not exist.
</p>
<h4>Path Sum III: count downward paths that sum to a target</h4>
<p>
  Now a path starts at <em>any</em> node and goes down, ending anywhere. The brute force starts a
  fresh downward sum from every node, which is O(n·h): fine on a balanced tree and O(n²) on a chain. The
  better idea comes from arrays. A subarray sum is a difference of two prefix sums, and a downward
  path is a subarray of the root-to-node path. Walk down keeping the running <b>prefix sum</b> from the
  root. A path that ends at the current node and sums to <code>target</code> exists for every earlier
  prefix on the same root path that equals <code>prefix − target</code>. A map from prefix sum to how
  many times it occurs on the current path answers that in O(1).
</p>
<pre><code>function pathSumIII(root, target) {
  const seen = new Map([[0, 1]]); <span class="c">// prefix sum -&gt; how many times it occurs on the current root path</span>
  let count = 0;
  function visit(node, prefix) {
    if (node === null) return;
    const sum = prefix + node.val;
    count += seen.get(sum - target) || 0; <span class="c">// paths ending here that start just below an earlier prefix</span>
    seen.set(sum, (seen.get(sum) || 0) + 1);
    visit(node.left, sum);
    visit(node.right, sum);
    seen.set(sum, seen.get(sum) - 1); <span class="c">// leaving this node: it is no longer on the path</span>
  }
  visit(root, 0);
  return count;
}</code></pre>
<h4>Dry run: the tree 10 (5 (3 (3, −2), 2 (·, 1)), −3 (·, 11)), target 8</h4>
<table>
  <tr><th>node</th><th>prefix</th><th>looks for (prefix − 8)</th><th>found</th><th>running count</th></tr>
  <tr><td>10</td><td>10</td><td>2</td><td>0</td><td>0</td></tr>
  <tr><td>5</td><td>15</td><td>7</td><td>0</td><td>0</td></tr>
  <tr><td>3</td><td>18</td><td>10</td><td>1 (the prefix after node 10)</td><td>1: path 5 → 3</td></tr>
  <tr><td>3 (child)</td><td>21</td><td>13</td><td>0</td><td>1</td></tr>
  <tr><td>−2</td><td>16</td><td>8</td><td>0</td><td>1</td></tr>
  <tr><td>2</td><td>17</td><td>9</td><td>0</td><td>1</td></tr>
  <tr><td>1</td><td>18</td><td>10</td><td>1</td><td>2: path 5 → 2 → 1</td></tr>
  <tr><td>−3</td><td>7</td><td>−1</td><td>0</td><td>2</td></tr>
  <tr><td>11</td><td>18</td><td>10</td><td>1</td><td>3: path −3 → 11</td></tr>
</table>
<p class="sub">
  Three paths sum to 8. Three details carry the whole solution. The map starts with
  <code>{0: 1}</code>: the empty prefix before the root, so that a path that begins at the root is found. The
  count for <code>sum</code> is <b>decremented on the way back up</b>, because once you leave a node its prefix is
  no longer on the current root path; forget that and paths from one branch are matched with prefixes from
  another. And the lookup happens <em>before</em> this node's own prefix is added, otherwise a target of 0 would
  count the empty path. Time O(n). Space is O(h) for the recursion; the map as written keeps a zero-count
  entry for every prefix it has seen, so it can grow to O(n), and deleting a key when its count reaches 0 holds it to O(h).
</p>

<h3>Pair-returning recursion: House Robber III</h3>
<p>
  Thieves have found a street shaped like a binary tree. Robbing a house triggers an alarm if a
  <em>directly linked</em> house, its parent or its child, was also robbed. Maximise the money. The first
  idea is the recursion that falls straight out of the statement: for each node either rob it, and then skip
  its children and continue at its four grandchildren, or skip it and take the best of its two subtrees.
</p>
<pre><code>function robSlow(node) {
  if (node === null) return 0;
  let withNode = node.val;
  if (node.left !== null) withNode += robSlow(node.left.left) + robSlow(node.left.right);
  if (node.right !== null) withNode += robSlow(node.right.left) + robSlow(node.right.right);
  return Math.max(withNode, robSlow(node.left) + robSlow(node.right));
}</code></pre>
<p>
  This is correct and very slow, because a node is reached both as a child of its parent and as a
  grandchild of its grandparent, and each of those visits repeats the whole subtree below it. Counting calls on
  a chain of nodes shows the growth:
</p>
<table>
  <tr><th>chain length</th><th>calls to <code>robSlow</code></th></tr>
  <tr><td>10</td><td>463</td></tr>
  <tr><td>20</td><td>57,311</td></tr>
  <tr><td>30</td><td>7,049,153</td></tr>
</table>
<p>
  The count multiplies by roughly 120 every ten nodes, so the running time grows exponentially with the height. The remedy
  is to return <b>two answers from each call</b> instead of one: the best total if this node is robbed, and the
  best total if it is skipped. Then the parent has everything it needs from each child in a single visit.
</p>
<pre><code>function rob(root) {
  function visit(node) {
    if (node === null) return [0, 0];
    const [leftRob, leftSkip] = visit(node.left);
    const [rightRob, rightSkip] = visit(node.right);
    const robThis = node.val + leftSkip + rightSkip; <span class="c">// robbing this house forces both children to be skipped</span>
    const skipThis = Math.max(leftRob, leftSkip) + Math.max(rightRob, rightSkip); <span class="c">// children are free to choose</span>
    return [robThis, skipThis];
  }
  const [robRoot, skipRoot] = visit(root);
  return Math.max(robRoot, skipRoot);
}</code></pre>
<h4>Dry run: the tree 3 (2 (·, 3), 3 (·, 1))</h4>
<table>
  <tr><th>node</th><th>children's [rob, skip]</th><th>rob this = val + skips</th><th>skip this = best of each child</th></tr>
  <tr><td>3 (under 2)</td><td>none</td><td>3</td><td>0</td></tr>
  <tr><td>2</td><td>right child [3, 0]</td><td>2 + 0 = 2</td><td>max(3, 0) = 3</td></tr>
  <tr><td>1</td><td>none</td><td>1</td><td>0</td></tr>
  <tr><td>3 (under the root)</td><td>right child [1, 0]</td><td>3 + 0 = 3</td><td>max(1, 0) = 1</td></tr>
  <tr><td>3 (root)</td><td>[2, 3] and [3, 1]</td><td>3 + 3 + 1 = 7</td><td>max(2, 3) + max(3, 1) = 6</td></tr>
</table>
<p class="sub">
  The answer is <code>max(7, 6) = 7</code>: rob the root and the two grandchildren 3 and 1. Time is O(n)
  with one visit per node and O(h) space. A common wrong idea is to take every other <em>level</em>. On the
  tree above the odd levels give 2 + 3 = 5 and the even levels 3 + 3 + 1 = 7, which happens to be right, but on the
  chain 2, 1, 1, 2 both parities give 3 while robbing the two ends gives 4. The pair-return template, one value per decision state, is the same trick that dynamic programming uses
  on a line, applied to a tree.
</p>

<h3>Serialization — turning a tree into a string and back</h3>
<p>
  Pre-order with explicit <code>null</code> markers is the standard
  approach. With the markers, one traversal is enough to rebuild the exact
  tree shape without a second traversal like the construction problem
  above (post-order or level-order with markers work too; in-order does not).
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
  pre-order and explicit null markers, since with the markers the string
  alone — no second traversal needed — is enough to rebuild the exact
  original shape, and pre-order is the simplest to write."
</div>

<h3>Serialization, two more forms: level order and the compact BST</h3>
<p>
  The pre-order form above is the shortest to write. Two others come up as often, and each has a reason to exist.
</p>
<h4>Level order with null markers</h4>
<p>
  This is the format the practice problems print: <code>1,2,3,#,#,4,5</code>. It is breadth-first, so it can
  be produced and consumed with a queue and no recursion, which matters for very deep trees. Missing children
  are written as <code>#</code>, and trailing markers are trimmed since they carry no information.
</p>
<pre><code>function serializeLevel(root) {
  if (root === null) return "";
  const tokens = [];
  const queue = [root];
  let head = 0;
  while (head &lt; queue.length) {
    const node = queue[head++];
    if (node === null) {
      tokens.push("#");
      continue;
    }
    tokens.push(String(node.val));
    queue.push(node.left, node.right);
  }
  while (tokens[tokens.length - 1] === "#") tokens.pop(); <span class="c">// trailing markers carry no information</span>
  return tokens.join(",");
}

function deserializeLevel(data) {
  if (data === "") return null;
  const tokens = data.split(",");
  const root = new TreeNode(Number(tokens[0]));
  const queue = [root];
  let head = 0;
  let i = 1;
  while (head &lt; queue.length &amp;&amp; i &lt; tokens.length) {
    const node = queue[head++];
    if (i &lt; tokens.length &amp;&amp; tokens[i] !== "#") {
      node.left = new TreeNode(Number(tokens[i]));
      queue.push(node.left);
    }
    i++;
    if (i &lt; tokens.length &amp;&amp; tokens[i] !== "#") {
      node.right = new TreeNode(Number(tokens[i]));
      queue.push(node.right);
    }
    i++;
  }
  return root;
}</code></pre>
<table>
  <tr><th>tree</th><th>serialized</th><th>why</th></tr>
  <tr><td>1 (2, 3 (4, 5)) where 2 has no children</td><td><code>1,2,3,#,#,4,5</code></td><td>2's two missing children are written, then 4 and 5; nothing follows</td></tr>
  <tr><td>1 (·, 2 (3, ·))</td><td><code>1,#,2,3</code></td><td>the root's missing left child is written; 2's missing right child is trailing and trimmed</td></tr>
</table>
<p class="sub">
  The reader mirrors the writer: take the next node from a queue and read the <em>next two</em> tokens as its
  left and right child, enqueueing any that are real. That is the same loop that turned a level-order array into a
  tree in the trees chapter. Time and space are O(n). Writing a <code>null</code> for the children of a missing
  node would be harmless but wasteful, and the reader would then expect those tokens, so the writer and the reader
  must agree.
</p>
<h4>The compact form for a BST: no markers at all</h4>
<p>
  A binary search tree does not need null markers, because the ordering already says where a value goes. Write the
  pre-order values only. To rebuild, read the values in order and give each recursive call a legal
  <b>range</b>: the same <code>(lower, upper)</code> idea used to validate a BST. The next value becomes the
  node if it fits the range; if not, it belongs to an ancestor's other side, so this subtree is finished.
</p>
<pre><code>function serializeBST(root) {
  const values = [];
  (function visit(node) {
    if (node === null) return;
    values.push(node.val); <span class="c">// pre-order, and no null markers at all</span>
    visit(node.left);
    visit(node.right);
  })(root);
  return values.join(",");
}

function deserializeBST(data) {
  if (data === "") return null;
  const values = data.split(",").map(Number);
  let i = 0;
  function build(lower, upper) {
    if (i &gt;= values.length) return null;
    const val = values[i];
    if (val &lt;= lower || val &gt;= upper) return null; <span class="c">// belongs to an ancestor's other side</span>
    i++;
    const node = new TreeNode(val);
    node.left = build(lower, val);
    node.right = build(val, upper);
    return node;
  }
  return build(-Infinity, Infinity);
}</code></pre>
<p class="sub">
  For the BST 5 (3 (2, 4), 8 (·, 9)) the string is <code>5,3,2,4,8,9</code>. Rebuilding it, <code>build(−∞, ∞)</code>
  takes 5 and then asks for a left child with the range (−∞, 5): 3 fits, and so does 2 under it with the range
  (−∞, 3). The next value, 4, is too big for the ranges (−∞, 2) and (2, 3), so both of 2's children come out
  <code>null</code>; back at 3, the range (3, 5) accepts 4, and 4's two children both reject the 8. At the root, the
  range (5, ∞) accepts 8, and then 9 becomes 8's right child. The string is about half the length of the marker
  form, and the reader runs in O(n): every value is consumed once and each range check is O(1). It requires a
  valid BST with distinct values. A general tree has no such ordering, which is why it needs the markers.
</p>

<h3>Level by level: the BFS variants</h3>
<p>
  The level-order loop from the trees chapter is a template with a slot in the middle, where each variant does
  something different with one whole level at once. Keeping the current level as an <em>array of nodes</em> makes
  every variant a few lines, and it avoids removing items from the front of an array. One small
  helper builds the next level:
</p>
<pre><code>function childrenOf(level) {
  const next = [];
  for (const node of level) {
    if (node.left !== null) next.push(node.left);
    if (node.right !== null) next.push(node.right);
  }
  return next;
}</code></pre>
<h4>Right side view, zigzag, and level averages</h4>
<pre><code>function rightSideView(root) {
  if (root === null) return [];
  const view = [];
  let level = [root];
  while (level.length &gt; 0) {
    view.push(level[level.length - 1].val); <span class="c">// the last node of a level is the one seen from the right</span>
    level = childrenOf(level);
  }
  return view;
}

function zigzagLevelOrder(root) {
  if (root === null) return [];
  const result = [];
  let level = [root];
  let leftToRight = true;
  while (level.length &gt; 0) {
    const values = level.map((node) =&gt; node.val);
    result.push(leftToRight ? values : values.reverse()); <span class="c">// reverse the output row, never the nodes</span>
    leftToRight = !leftToRight;
    level = childrenOf(level);
  }
  return result;
}

function averageOfLevels(root) {
  if (root === null) return [];
  const averages = [];
  let level = [root];
  while (level.length &gt; 0) {
    let sum = 0;
    for (const node of level) sum += node.val;
    averages.push(sum / level.length);
    level = childrenOf(level);
  }
  return averages;
}</code></pre>
<p>
  <b>Right side view</b> is "the last node of every level": from the right you see the rightmost node of each depth,
  even when it is a left child that is the only node at that depth. <b>Zigzag</b> reads levels alternately left to
  right and right to left. The right way to do it keeps the traversal order fixed and reverses only the
  <em>row of values</em> being reported. Reversing the node array itself would swap the order in which the next
  level is built, and the zigzag would drift. <b>Level averages</b> sum a level and divide by its length; sums of
  integers stay exact up to 2⁵³, so overflow is not a concern for ordinary inputs.
</p>
<table>
  <tr><th>level</th><th>nodes (tree 3 (9, 20 (15, 7)))</th><th>right side view</th><th>zigzag row</th><th>average</th></tr>
  <tr><td>0</td><td>3</td><td>3</td><td>3</td><td>3</td></tr>
  <tr><td>1</td><td>9, 20</td><td>20</td><td>20, 9 (reversed)</td><td>14.5</td></tr>
  <tr><td>2</td><td>15, 7</td><td>7</td><td>15, 7 (left to right)</td><td>11</td></tr>
</table>
<p class="sub">
  All three are O(n) time. The extra space is the widest level, which is up to about n/2 nodes for a
  perfect tree.
</p>
<h4>Next right pointers in O(1) space</h4>
<p>
  Fill in each node's <code>next</code> pointer with the node on its right at the same level, or <code>null</code> for the
  last node of a level. A queue does it in O(n) space. The O(1)-space version uses the pointers it is
  <em>creating</em>: once a level is linked, it can be walked like a linked list, and that walk is the
  traversal for building the links of the level below. For a <b>perfect</b> binary tree (every node has either
  two children or none, all leaves at one depth), the links are easy to see:
</p>
<pre><code>function connectPerfect(root) {
  let leftmost = root;
  while (leftmost !== null &amp;&amp; leftmost.left !== null) {
    for (let node = leftmost; node !== null; node = node.next) {
      node.left.next = node.right; <span class="c">// siblings under the same parent</span>
      if (node.next !== null) node.right.next = node.next.left; <span class="c">// cousins across two parents</span>
    }
    leftmost = leftmost.left; <span class="c">// the row below is already linked, so we can walk it next</span>
  }
  return root;
}</code></pre>
<p>
  Two kinds of link are made. Inside one parent, <code>left.next = right</code>. Across two parents,
  <code>right.next = next.left</code>, using the parent's own <code>next</code> pointer, which was set when the previous
  level was processed. That step is where the already-built links save the space. A general tree has missing
  children, so a node's neighbour may sit under a different parent entirely. The robust version walks one level as a
  linked list and uses a dummy node and a <code>tail</code> to string together the next level, which is the
  dummy-node trick from the linked lists chapter:
</p>
<pre><code>function connectAny(root) {
  let levelStart = root;
  while (levelStart !== null) {
    const dummy = new TreeNode(0);
    let tail = dummy;
    for (let node = levelStart; node !== null; node = node.next) {
      if (node.left !== null) {
        tail.next = node.left;
        tail = tail.next;
      }
      if (node.right !== null) {
        tail.next = node.right;
        tail = tail.next;
      }
    }
    levelStart = dummy.next; <span class="c">// the first node of the row we just linked</span>
  }
  return root;
}</code></pre>
<p class="sub">
  The loop over <code>levelStart</code> handles one level per pass, and the inner loop follows the <code>next</code>
  links of the level that is already linked. The first node of the level just built is
  <code>dummy.next</code>. The time is O(n) and the extra space O(1), and it also solves the perfect-tree case.
  The perfect-tree version is simpler to write when the problem promises that shape; reach for the general one
  when it does not.
</p>

<h3>Vertical order: giving every node a column</h3>
<p>
  Draw the tree and slice it with vertical lines. A node's <b>column</b> is 0 for the root, one less for a left
  child and one more for a right child. A vertical order lists the values column by column from left to right.
  The row order inside a column is the part to pin down. A breadth-first traversal visits shallower nodes first and,
  within a row, left to right, so appending values to their column's list in visit order gives top-to-bottom,
  left-to-right inside each column:
</p>
<pre><code>function verticalOrder(root) {
  if (root === null) return [];
  const columns = new Map();
  let minCol = 0;
  let maxCol = 0;
  const queue = [[root, 0]];
  let head = 0;
  while (head &lt; queue.length) {
    const [node, col] = queue[head++];
    if (!columns.has(col)) columns.set(col, []);
    columns.get(col).push(node.val);
    minCol = Math.min(minCol, col);
    maxCol = Math.max(maxCol, col);
    if (node.left !== null) queue.push([node.left, col - 1]);
    if (node.right !== null) queue.push([node.right, col + 1]);
  }
  const result = [];
  for (let col = minCol; col &lt;= maxCol; col++) result.push(columns.get(col));
  return result;
}</code></pre>
<p>
  The columns between the leftmost and the rightmost one are all occupied, because each column differs from its
  parent's by one, so the answer is read out by counting from <code>minCol</code> up to <code>maxCol</code> with no
  sorting. Time O(n), space O(n). For the tree 3 (9, 20 (15, 7)) the columns are 9 in −1; 3 and 15 in 0; 20 in 1;
  7 in 2, giving <code>[[9], [3, 15], [20], [7]]</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ Two nodes at the same row and column: read the tie rule</span>
  Some versions of the problem say that two nodes in the same row <em>and</em> the same column are listed in
  increasing order of value. Then left-to-right visit order is not enough, and you must sort by
  <code>(column, row, value)</code>:
</div>
<pre><code>function verticalTraversal(root) {
  const cells = [];
  (function visit(node, row, col) {
    if (node === null) return;
    cells.push([col, row, node.val]);
    visit(node.left, row + 1, col - 1);
    visit(node.right, row + 1, col + 1);
  })(root, 0, 0);
  cells.sort((a, b) =&gt; a[0] - b[0] || a[1] - b[1] || a[2] - b[2]); <span class="c">// column, then row, then value</span>
  const result = [];
  let lastCol = null;
  for (const [col, , val] of cells) {
    if (col !== lastCol) {
      result.push([]);
      lastCol = col;
    }
    result[result.length - 1].push(val);
  }
  return result;
}</code></pre>
<p class="sub">
  On the tree 1 (2 (4, 6), 3 (5, 7)) the nodes 6 and 5 both sit at row 2 in column 0. The breadth-first version
  gives <code>[1, 6, 5]</code> for that column and the sorted version gives <code>[1, 5, 6]</code>. The sort makes
  the time O(n log n). Always read the statement for the tie rule before choosing between the two.
</p>

<h3>All nodes at distance K: the tree as a graph</h3>
<p>
  Given the root, a target node and an integer <code>k</code>, return the values of every node whose distance from
  the target is exactly <code>k</code> edges. The trouble is that the nodes at that distance are not only below the
  target: they may be reached by going <em>up</em> first and then down another branch. Child pointers
  cannot go up.
</p>
<p>
  The fix is the observation from the trees chapter: a tree is a graph, and a graph's
  distances come from breadth-first search. Add the missing edge, each node's parent, with one traversal that fills a
  map. Then run a breadth-first search from the target over three neighbours, <code>left</code>, <code>right</code> and
  <code>parent</code>, with a <code>seen</code> set so that the search does not walk back along the edge it just used.
  After exactly <code>k</code> rounds, the frontier is the answer.
</p>
<pre><code>function distanceK(root, target, k) {
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

  const seen = new Set([target]); <span class="c">// a tree has no cycles, but the parent edge leads back where we came from</span>
  let frontier = [target];
  for (let distance = 0; distance &lt; k &amp;&amp; frontier.length &gt; 0; distance++) {
    const next = [];
    for (const node of frontier) {
      for (const neighbour of [node.left, node.right, parent.get(node)]) {
        if (neighbour !== null &amp;&amp; !seen.has(neighbour)) {
          seen.add(neighbour);
          next.push(neighbour);
        }
      }
    }
    frontier = next;
  }
  return frontier.map((node) =&gt; node.val);
}</code></pre>
<h4>Dry run: tree 3 (5 (6, 2 (7, 4)), 1 (0, 8)), target 5, k = 2</h4>
<table>
  <tr><th>round</th><th>frontier after the round</th><th>how they were reached</th></tr>
  <tr><td>0</td><td>5</td><td>the target itself</td></tr>
  <tr><td>1</td><td>6, 2, 3</td><td>two children of 5 and its parent</td></tr>
  <tr><td>2</td><td>7, 4, 1</td><td>7 and 4 are the children of 2; 1 is the other child of 3, reached by going up to 3 first</td></tr>
</table>
<p class="sub">
  The result is <code>[7, 4, 1]</code>. Notice that 1 is not under the target at all; only the parent edge
  finds it. Building the parent map is O(n), and the search visits each node at most once, so the time is O(n)
  and the space O(n). Without the <code>seen</code> set the search would step back across the edge it just used, so nodes
  would be reached again at the wrong distances. If <code>k</code> is larger than any distance, the frontier empties and the answer is <code>[]</code>;
  <code>k = 0</code> returns the target alone.
</p>

<h3>Kth smallest in a BST, and where its relatives live</h3>
<p>
  In-order traversal of a BST is sorted (see the trees chapter), so the k-th smallest value is the k-th node an
  in-order walk visits. The iterative in-order from the trees chapter lets you stop <em>in the middle</em> of the
  walk:
</p>
<pre><code>function kthSmallest(root, k) {
  const stack = [];
  let node = root;
  while (node !== null || stack.length &gt; 0) {
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    k--;
    if (k === 0) return node.val; <span class="c">// stop the moment the k-th value is visited</span>
    node = node.right;
  }
  return undefined;
}</code></pre>
<p class="sub">
  The walk goes down the left spine (at most the height h, pushing as it goes), then visits k nodes, popping and
  stepping right. It costs O(h + k) time and O(h) space, which is far less than O(n) when k is small. On the BST
  5 (3 (2 (1, ·), 4), 6) the third smallest is 3: the visits are 1, 2, 3. If the tree is queried many times while it
  keeps changing, store each node's subtree size and descend by comparing k with the left size, which makes a
  query O(h) instead of O(h + k); that idea is developed in
  <a href="/dsa/dsa-bst-operations">BST operations and ordered data</a>.
</p>
<p>
  The operations that exploit the ordering of a BST all live in that chapter, so they are not repeated here: insert and
  delete, in-order successor and predecessor, floor and ceiling, the BST iterator (the same stack idea, paused between
  calls), and building a height-balanced BST from a sorted array. This chapter stays with problems
  that are about the <em>shape</em> of a tree rather than its ordering.
</p>

<h3>Recognizing which of these four you need</h3>
<ul>
  <li>"Given two traversals, rebuild the tree" → construction (use pre/post-order for the root, in-order to split subtrees)</li>
  <li>"Find the common ancestor" → LCA (BST property prunes it to O(log n) if it's a BST)</li>
  <li>"Is this tree balanced/valid?" → compute the property bottom-up in one pass, short-circuit on failure</li>
  <li>"Save this tree to a file / send over a network" → serialize with pre-order + null markers</li>
</ul>

<h3>Recognising the rest of the problems in this chapter</h3>
<p>The four questions above are the foundations. These phrases point to the longer techniques.</p>
<table>
  <tr><th>The prompt says…</th><th>Reach for</th></tr>
  <tr><td>"rebuild the tree" from two traversals, long input</td><td>index map from value to in-order position, ranges <code>lo..hi</code>, one moving pointer</td></tr>
  <tr><td>"all root-to-leaf paths with sum S"</td><td>top-down, shared path array, push, recurse, pop, copy at the leaf</td></tr>
  <tr><td>"paths that start and end anywhere, going down", count them</td><td>prefix sums on the root path in a map, undo on the way out</td></tr>
  <tr><td>"maximum path sum", "diameter", "longest …" with a bend</td><td>bottom-up: record the bend at each node, return one branch</td></tr>
  <tr><td>"choose nodes, no two adjacent" (rob, cover, colour)</td><td>return a pair, one value per state of the node</td></tr>
  <tr><td>"right side view", "zigzag", "level averages", "next pointers"</td><td>level-by-level loop with the level held as an array</td></tr>
  <tr><td>"vertical", "column", "top view"</td><td>column index carried with each node, breadth-first</td></tr>
  <tr><td>"distance k from a node", "time to spread from a node"</td><td>parent map plus breadth-first search from the target</td></tr>
  <tr><td>"serialize" a tree, size matters or it is a BST</td><td>level order with markers, or pre-order values only with ranges</td></tr>
</table>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Rebuild a tree from preorder + inorder by hand for a 5-node example, tracking splitIndex at each call.</li>
    <li>Explain why pre-order + post-order alone can't always uniquely reconstruct a tree, but in-order + either one can.</li>
    <li>Write isBalanced and diameterOfBinaryTree, and name the shared template: return one value up the stack, track a separate running best as a side effect.</li>
    <li>Explain why checking only "left &lt; node &lt; right" at each node is not enough to validate a BST — and what a (min, max) range check fixes.</li>
    <li>Say why null markers are what let pre-order serialization rebuild a tree from one traversal alone.</li>
    <li>Rebuild a tree from pre-order and in-order in O(n), and say what the index map and the moving pointer each replace.</li>
    <li>Write Path Sum II, Path Sum III and Maximum Path Sum, and say in one sentence what makes each path definition different.</li>
    <li>Explain why the prefix-sum map is decremented when leaving a node, and why it starts with <code>{0: 1}</code>.</li>
    <li>Return a pair from a recursive call to solve House Robber III, and say why the one-value version is exponential.</li>
    <li>Serialize a BST with no null markers and rebuild it with ranges.</li>
    <li>Write right side view, zigzag and next right pointers, and say which one needs O(1) extra space and how.</li>
    <li>Solve "all nodes at distance k" by adding parent edges and running breadth-first search, and explain what the seen set prevents.</li>
  </ul>
</div>`,
};
