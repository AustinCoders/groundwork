import type { Chapter } from "../types";

export const dsaBstOperations: Chapter = {
  id: "dsa-bst-operations",
  num: "I2",
  title: "BST operations and ordered data",
  short: "BST operations",
  levels: ["intermediate"],
  prerequisites: ["dsa-trees", "dsa-binary-search"],
  practice: [
    "ex-bst-insert",
    "ex-bst-delete-node",
    "ex-bst-inorder-successor",
    "ex-bst-floor-ceiling",
    "ex-tree-kth-smallest-bst",
    "ex-bst-iterator",
    "ex-bst-two-sum-iv",
    "ex-tree-sorted-array-to-bst",
    "ex-bst-sorted-list-to-bst",
    "ex-bst-trim",
    "ex-bst-ordered-set",
    "ex-tree-validate-bst",
    "ex-bst-order-statistics",
    "ex-bst-avl-insert",
  ],
  ready: true,
  subtitle:
    "Insert, delete, successor, kth smallest and an iterator — and the honest truth about balancing and about a language with no TreeMap.",
  body: `<h3>What a BST gives you that arrays and hash maps do not</h3>
<p>
  A hash map answers one question very well: "is this exact key here?" A
  sorted array answers a second one: "what is the smallest value that is at
  least <code>x</code>?" — but only while nobody changes it, because every
  insert shifts everything after the insertion point. A binary search tree is
  the structure that tries to answer both: it keeps its values in order, so it
  can answer questions about <em>order</em>, and it changes by rewiring a few
  pointers, so it can keep answering them while values come and go.
</p>
<p>
  The order questions are the ones a hash map cannot touch: the next larger
  value than <code>x</code>, the closest value to <code>x</code>, the
  <code>k</code>-th smallest, every value between <code>a</code> and
  <code>b</code>, the values in sorted order one at a time. This chapter is
  the toolkit for exactly those. It assumes the tree shape and the three
  traversals from <a href="/dsa/dsa-trees">Trees</a> and the lower-bound idea
  from <a href="/dsa/dsa-binary-search">Binary search</a>; checking that a tree
  <em>is</em> a valid BST and finding a lowest common ancestor are in
  <a href="/dsa/dsa-tree-problems">Tree problems in depth</a> and are not
  repeated here.
</p>
<table>
  <tr><th>Operation</th><th>Hash map</th><th>Sorted array</th><th>Balanced BST</th><th>Plain BST, worst case</th></tr>
  <tr><td>lookup by key</td><td>O(1) average</td><td>O(log n)</td><td>O(log n)</td><td>O(n)</td></tr>
  <tr><td>insert</td><td>O(1) average</td><td>O(n) — shifts</td><td>O(log n)</td><td>O(n)</td></tr>
  <tr><td>delete by key</td><td>O(1) average</td><td>O(n) — shifts</td><td>O(log n)</td><td>O(n)</td></tr>
  <tr><td>smallest / largest</td><td>O(n)</td><td>O(1)</td><td>O(log n)</td><td>O(n)</td></tr>
  <tr><td>next larger / next smaller value</td><td>O(n)</td><td>O(log n)</td><td>O(log n)</td><td>O(n)</td></tr>
  <tr><td>k-th smallest</td><td>O(n) or more</td><td>O(1)</td><td>O(log n) with subtree sizes</td><td>O(n)</td></tr>
  <tr><td>all values in sorted order</td><td>O(n log n) — sort first</td><td>O(n)</td><td>O(n)</td><td>O(n)</td></tr>
</table>
<p class="sub">
  Read the last two columns together. A balanced BST is the only column with no
  weak row, and "plain BST, worst case" is what you get if you never rebalance.
  Everything in this chapter costs O(h), where <code>h</code> is the height of
  the tree — so the whole second half of it is about what keeps
  <code>h</code> small.
</p>

<h3>The node, the invariant and search</h3>
<p>
  A node holds a value and two child pointers. The rule that makes it a
  <em>search</em> tree: at every node, <b>every value in the left subtree is
  smaller and every value in the right subtree is larger</b>. This chapter
  treats a BST as a set of distinct values. Real inputs can contain duplicates,
  and then you have to pick a policy and say it out loud: ignore the repeat,
  keep a count in the node, or always send equal values to one fixed side.
</p>
<p>
  Three facts follow from the rule, and every operation below is built from
  them. First, in-order traversal visits the values in increasing order.
  Second, the smallest value is the end of the left-going path and the largest
  is the end of the right-going path. Third, one comparison against a node
  discards that node's entire left subtree or its entire right subtree — which
  is binary search with pointers instead of indices.
</p>
<pre><code>class TreeNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
  }
}

function search(root, target) {
  let node = root;
  while (node !== null &amp;&amp; node.val !== target) {
    node = target &lt; node.val ? node.left : node.right; <span class="c">// discard one whole side</span>
  }
  return node; <span class="c">// the node, or null when target is absent</span>
}</code></pre>
<p>
  Each step of the loop moves one level down, so the loop runs at most
  <code>h + 1</code> times, where the height here counts the levels on the
  longest root-to-leaf path (a single node has height 1, the empty tree 0).
  That count is the cost of every operation in this chapter. It is about
  <code>log2(n)</code> for a tree with all its levels filled and
  <code>n</code> for a tree that is a chain — the same values, a completely
  different cost, decided only by the shape.
</p>

<h3>Helpers for the dry runs: tree to array and back</h3>
<p>
  The dry runs below show a tree after every operation, so you need a compact
  way to write one down. This is the level-order array form that most
  interview platforms use: read it left to right, level by level, and write
  <code>null</code> for a missing child. The array
  <code>[8,3,10,1,6,null,14]</code> means 8 has children 3 and 10, 3 has
  children 1 and 6, and 10 has no left child and a right child 14. A
  <code>null</code> has no children of its own, so none are listed under it,
  and trailing <code>null</code>s are dropped.
</p>
<pre><code>function buildTree(arr) {
  if (arr.length === 0 || arr[0] === null) return null;
  const root = new TreeNode(arr[0]);
  const queue = [root];
  let i = 1;
  while (i &lt; arr.length) {
    const node = queue.shift();
    if (arr[i] !== null) {
      node.left = new TreeNode(arr[i]);
      queue.push(node.left);
    }
    i += 1;
    if (i &lt; arr.length &amp;&amp; arr[i] !== null) {
      node.right = new TreeNode(arr[i]);
      queue.push(node.right);
    }
    i += 1;
  }
  return root;
}

function toArray(root) {
  if (root === null) return [];
  const out = [];
  const queue = [root];
  while (queue.length &gt; 0) {
    const node = queue.shift();
    if (node === null) {
      out.push(null);
    } else {
      out.push(node.val);
      queue.push(node.left, node.right);
    }
  }
  while (out[out.length - 1] === null) out.pop(); <span class="c">// trim trailing nulls</span>
  return out;
}

function inOrder(node, out = []) {
  if (node === null) return out;
  inOrder(node.left, out);
  out.push(node.val);
  inOrder(node.right, out);
  return out;
}</code></pre>
<p class="sub">
  <code>queue.shift()</code> is O(n) on a long array, which is fine for
  debugging helpers and not something to put inside a solution's hot loop. The
  <a href="/dsa/dsa-trees">Trees</a> chapter's level-order code uses the same
  idiom.
</p>

<h3>Insert: walk down, hang the new node</h3>
<p>
  Where does a new value belong? Search for it. The search follows the unique
  path the value would have to be on, and it ends by falling off the tree at a
  <code>null</code> pointer. That empty slot is the only place the value can go:
  any other position would put it on the wrong side of some ancestor. So insert
  is a search that, instead of returning <code>null</code>, plants a new leaf
  there. A new value is always a leaf, and nothing existing moves.
</p>
<p>
  The recursive version uses a pattern worth learning once because delete and
  trim reuse it: <b>every call returns the root of the subtree it was given,
  and the caller reassigns that pointer</b>. Writing
  <code>node.left = insert(node.left, val)</code> is what links the new leaf
  in; at all the nodes the path passes through, the assignment just writes back
  the pointer that was already there.
</p>
<pre><code>function insert(node, val) {
  if (node === null) return new TreeNode(val); <span class="c">// fell off the tree: this is the slot</span>
  if (val &lt; node.val) node.left = insert(node.left, val);
  else if (val &gt; node.val) node.right = insert(node.right, val);
  return node; <span class="c">// equal value: already present, change nothing</span>
}

function insertIterative(root, val) {
  if (root === null) return new TreeNode(val);
  let node = root;
  while (true) {
    if (val === node.val) return root;
    if (val &lt; node.val) {
      if (node.left === null) {
        node.left = new TreeNode(val);
        return root;
      }
      node = node.left;
    } else {
      if (node.right === null) {
        node.right = new TreeNode(val);
        return root;
      }
      node = node.right;
    }
  }
}</code></pre>
<p>
  Both run in O(h). The recursive one uses O(h) stack; the iterative one needs
  O(1) extra space, which matters in JavaScript for a reason covered in the
  section on degenerate trees below. The tree this chapter uses from here on
  is the one made by inserting 8, 3, 10, 1, 6, 14, 4, 7, 13 in that order.
</p>
<h4>Dry run: building the running example</h4>
<table>
  <tr><th>Insert</th><th>Path from the root</th><th>Becomes</th><th>Tree as an array</th></tr>
  <tr><td>8</td><td>(empty tree)</td><td>the root</td><td>[8]</td></tr>
  <tr><td>3</td><td>8, go left</td><td>left child of 8</td><td>[8,3]</td></tr>
  <tr><td>10</td><td>8, go right</td><td>right child of 8</td><td>[8,3,10]</td></tr>
  <tr><td>1</td><td>8 left, 3 left</td><td>left child of 3</td><td>[8,3,10,1]</td></tr>
  <tr><td>6</td><td>8 left, 3 right</td><td>right child of 3</td><td>[8,3,10,1,6]</td></tr>
  <tr><td>14</td><td>8 right, 10 right</td><td>right child of 10</td><td>[8,3,10,1,6,null,14]</td></tr>
  <tr><td>4</td><td>8 left, 3 right, 6 left</td><td>left child of 6</td><td>[8,3,10,1,6,null,14,null,null,4]</td></tr>
  <tr><td>7</td><td>8 left, 3 right, 6 right</td><td>right child of 6</td><td>[8,3,10,1,6,null,14,null,null,4,7]</td></tr>
  <tr><td>13</td><td>8 right, 10 right, 14 left</td><td>left child of 14</td><td>[8,3,10,1,6,null,14,null,null,4,7,13]</td></tr>
</table>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="The running example tree: 8 at the root with children 3 and 10; 3 has children 1 and 6; 6 has children 4 and 7; 10 has a right child 14 whose left child is 13">
    <g class="rough">
      <path class="ln" d="M320,35 L200,95" />
      <path class="ln" d="M320,35 L440,95" />
      <path class="ln" d="M200,95 L140,155" />
      <path class="ln" d="M200,95 L260,155" />
      <path class="ln" d="M260,155 L220,215" />
      <path class="ln" d="M260,155 L300,215" />
      <path class="ln" d="M440,95 L500,155" />
      <path class="ln" d="M500,155 L470,215" />
    </g>
    <g class="rough">
      <circle class="box" cx="320" cy="35" r="22" />
      <circle class="box" cx="200" cy="95" r="22" />
      <circle class="box" cx="440" cy="95" r="22" />
      <circle class="box" cx="140" cy="155" r="22" />
      <circle class="box" cx="260" cy="155" r="22" />
      <circle class="box" cx="500" cy="155" r="22" />
      <circle class="box" cx="220" cy="215" r="22" />
      <circle class="box" cx="300" cy="215" r="22" />
      <circle class="box" cx="470" cy="215" r="22" />
    </g>
    <text class="lbl" x="320" y="41" text-anchor="middle">8</text>
    <text class="lbl" x="200" y="101" text-anchor="middle">3</text>
    <text class="lbl" x="440" y="101" text-anchor="middle">10</text>
    <text class="lbl" x="140" y="161" text-anchor="middle">1</text>
    <text class="lbl" x="260" y="161" text-anchor="middle">6</text>
    <text class="lbl" x="500" y="161" text-anchor="middle">14</text>
    <text class="lbl" x="220" y="221" text-anchor="middle">4</text>
    <text class="lbl" x="300" y="221" text-anchor="middle">7</text>
    <text class="lbl" x="470" y="221" text-anchor="middle">13</text>
    <text class="sm" x="20" y="250">in-order: 1, 3, 4, 6, 7, 8, 10, 13, 14</text>
  </svg>
  <figcaption>The running example. Every dry run in this chapter starts from this tree, written as <code>[8,3,10,1,6,null,14,null,null,4,7,13]</code>.</figcaption>
</figure>
<div class="warn">
  <span class="ttl">⚠ The same values can make very different trees</span>
  The shape depends on the <em>order</em> of insertion. Inserting 2, 1, 3 gives a
  three-node tree of height 2; inserting 1, 2, 3 gives a chain of height 3. Never
  assume an insert sequence produces a particular shape unless you traced it.
  And the classic silent bug: write <code>insert(node.left, val)</code>
  without the <code>node.left =</code> in front. The function builds a correct
  subtree and throws it away, and the tree never grows.
</div>

<h3>Delete: three cases</h3>
<p>
  Delete is search, then repair. Finding the node is the same walk as before.
  What you do once you are standing on it depends on how many children it has,
  because the repair has to leave the in-order sequence intact minus one value.
</p>
<ul>
  <li><b>No children (a leaf).</b> Nothing depends on it. Replace the pointer that led to it with <code>null</code>.</li>
  <li><b>One child.</b> Replace the node with that child. The child's subtree already lies inside the range the deleted node's slot allowed, because it was a descendant of that node, so every ancestor's constraint still holds.</li>
  <li><b>Two children.</b> Neither child can simply move up: it would have to adopt the other as a subtree. Instead, find a value that can sit in this slot without breaking anything, which means one that is at least everything on the left and at most everything on the right. There are exactly two such values: the <b>successor</b> (the smallest value in the right subtree) and the <b>predecessor</b> (the largest in the left subtree). Copy the successor's value into this node, then delete the successor from the right subtree.</li>
</ul>
<p>
  The last step is not a circular definition. The successor is the leftmost
  node of the right subtree, so it has no left child; deleting it is always
  the leaf case or the one-child case.
</p>
<figure>
  <svg viewBox="0 0 640 235" class="dg" role="img" aria-label="Three small trees. A leaf marked for deletion is cut off. A node with one child is replaced by that child. A node with two children takes the value of its in-order successor, the smallest node of its right subtree, and that successor is then removed">
    <g class="rough">
      <path class="lnr" d="M110,35 L70,95" />
      <path class="ln" d="M110,35 L150,95" />
      <path class="ln" d="M320,35 L360,95" />
      <path class="lng" d="M360,95 L335,155" />
      <path class="ln" d="M530,35 L490,95" />
      <path class="ln" d="M530,35 L570,95" />
      <path class="ln" d="M570,95 L540,155" />
      <path class="ln" d="M570,95 L610,155" />
    </g>
    <g class="rough">
      <circle class="box" cx="110" cy="35" r="20" />
      <circle class="boxr" cx="70" cy="95" r="20" />
      <circle class="box" cx="150" cy="95" r="20" />
      <circle class="box" cx="320" cy="35" r="20" />
      <circle class="boxr" cx="360" cy="95" r="20" />
      <circle class="boxg" cx="335" cy="155" r="20" />
      <circle class="boxr" cx="530" cy="35" r="20" />
      <circle class="box" cx="490" cy="95" r="20" />
      <circle class="box" cx="570" cy="95" r="20" />
      <circle class="boxg" cx="540" cy="155" r="20" />
      <circle class="box" cx="610" cy="155" r="20" />
    </g>
    <text class="sm" x="110" y="40" text-anchor="middle">5</text>
    <text class="sm" x="70" y="100" text-anchor="middle">2</text>
    <text class="sm" x="150" y="100" text-anchor="middle">8</text>
    <text class="sm" x="320" y="40" text-anchor="middle">5</text>
    <text class="sm" x="360" y="100" text-anchor="middle">9</text>
    <text class="sm" x="335" y="160" text-anchor="middle">7</text>
    <text class="sm" x="530" y="40" text-anchor="middle">8</text>
    <text class="sm" x="490" y="100" text-anchor="middle">6</text>
    <text class="sm" x="570" y="100" text-anchor="middle">12</text>
    <text class="sm" x="540" y="160" text-anchor="middle">10</text>
    <text class="sm" x="610" y="160" text-anchor="middle">14</text>
    <text class="sm rd" x="110" y="190" text-anchor="middle">delete 2: a leaf</text>
    <text class="sm" x="110" y="208" text-anchor="middle">cut the link</text>
    <text class="sm rd" x="320" y="190" text-anchor="middle">delete 9: one child</text>
    <text class="sm" x="320" y="208" text-anchor="middle">7 takes its place</text>
    <text class="sm rd" x="530" y="190" text-anchor="middle">delete 8: two children</text>
    <text class="sm" x="530" y="208" text-anchor="middle">10 (min of the right side) moves in,</text>
    <text class="sm" x="530" y="226" text-anchor="middle">then 10 is removed from there</text>
  </svg>
  <figcaption>Red is the node being deleted; green is what replaces it or supplies the replacement value.</figcaption>
</figure>
<pre><code>function minNode(node) {
  while (node.left !== null) node = node.left;
  return node;
}

function deleteNode(node, val) {
  if (node === null) return null; <span class="c">// value not in the tree: nothing to do</span>
  if (val &lt; node.val) {
    node.left = deleteNode(node.left, val);
  } else if (val &gt; node.val) {
    node.right = deleteNode(node.right, val);
  } else {
    if (node.left === null) return node.right;  <span class="c">// leaf (right is null too) or only a right child</span>
    if (node.right === null) return node.left;  <span class="c">// only a left child</span>
    const heir = minNode(node.right);           <span class="c">// two children: the in-order successor</span>
    node.val = heir.val;                        <span class="c">// copy its value up...</span>
    node.right = deleteNode(node.right, heir.val); <span class="c">// ...then remove the original</span>
  }
  return node;
}</code></pre>
<p>
  Notice that the leaf case and the one-child case are the same two lines: a
  leaf has <code>left === null</code>, so the first <code>return</code> hands
  back <code>node.right</code>, which is <code>null</code>. Only the
  two-children case needs its own code. The total work is one downward path:
  the walk to the node, then the continued walk to the successor.
  That is O(h) time and O(h) stack.
</p>
<h4>Dry run: four deletions from the running example</h4>
<table>
  <tr><th>Delete</th><th>Case</th><th>What happens</th><th>Tree as an array</th><th>In-order afterwards</th></tr>
  <tr><td>7</td><td>leaf</td><td>6's right pointer becomes null</td><td>[8,3,10,1,6,null,14,null,null,4,null,13]</td><td>1,3,4,6,8,10,13,14</td></tr>
  <tr><td>14</td><td>one child (13)</td><td>10's right pointer now points at 13</td><td>[8,3,10,1,6,null,13,null,null,4]</td><td>1,3,4,6,8,10,13</td></tr>
  <tr><td>3</td><td>two children (1 and 6)</td><td>successor is 4, the left child of 6; the node holding 3 now holds 4, then the old 4 is removed from the right subtree</td><td>[8,4,10,1,6,null,13]</td><td>1,4,6,8,10,13</td></tr>
  <tr><td>8</td><td>two children, the root</td><td>successor is 10, the immediate right child; the root now holds 10, then the old 10 is removed and its child 13 moves up</td><td>[10,4,13,1,6]</td><td>1,4,6,10,13</td></tr>
  <tr><td>99</td><td>absent</td><td>walks to null and changes nothing</td><td>[10,4,13,1,6]</td><td>1,4,6,10,13</td></tr>
</table>
<p class="sub">
  In every row the in-order list is the previous row's list with exactly the
  deleted value missing. That is the invariant to check, and it is the whole
  proof that the repair is right: if the in-order sequence is the sorted
  sequence minus one value, the tree is still a BST holding the right values.
</p>
<h4>Another way: relink the node instead of copying the value</h4>
<p>
  Copying <code>heir.val</code> into the node changes what that node object
  <em>means</em>. If anything else holds a reference to it — an iterator's
  stack, a map from value to node, a parent pointer table — it now silently
  refers to a different value. When node identity matters, move the successor
  node itself into the slot:
</p>
<pre><code>function removeMin(node) {
  if (node.left === null) return node.right;
  node.left = removeMin(node.left);
  return node;
}

function deleteRelink(node, val) {
  if (node === null) return null;
  if (val &lt; node.val) {
    node.left = deleteRelink(node.left, val);
  } else if (val &gt; node.val) {
    node.right = deleteRelink(node.right, val);
  } else {
    if (node.left === null) return node.right;
    if (node.right === null) return node.left;
    const heir = minNode(node.right);
    heir.right = removeMin(node.right); <span class="c">// detach the heir, keeping the rest of the right side</span>
    heir.left = node.left;
    return heir;                         <span class="c">// the heir takes the deleted node's place</span>
  }
  return node;
}</code></pre>
<p>
  The order of those two assignments matters: <code>removeMin(node.right)</code>
  walks down left pointers to the heir and stops only because <code>heir.left</code>
  is still <code>null</code>. Assign <code>heir.left</code> first and, when the heir is
  the right child itself, the walk runs into the old left subtree and the tree
  breaks. Both versions produce the same shape; they differ only in which objects
  survive. Taking the predecessor instead of the successor also works and
  mirrors every line; it gives a different, equally valid tree.
</p>
<h4>Test it the cheap way</h4>
<p>
  Delete is where interview BST code breaks, and a random test finds the bug in
  seconds. Apply the same random inserts and deletes to the tree and to a plain
  array, and compare in-order against the sorted array after every step. This
  check is complete for the BST property too: a binary tree is a valid BST
  exactly when its in-order sequence is strictly increasing.
</p>
<pre><code>function randomCheck(steps) {
  let root = null;
  let reference = [];
  for (let step = 0; step &lt; steps; step++) {
    const value = Math.floor(Math.random() * 30);
    if (Math.random() &lt; 0.5) {
      root = insert(root, value);
      if (!reference.includes(value)) reference.push(value);
    } else {
      root = deleteNode(root, value);
      reference = reference.filter((x) =&gt; x !== value);
    }
    const expected = [...reference].sort((a, b) =&gt; a - b);
    if (inOrder(root).join() !== expected.join()) return "mismatch after step " + step;
  }
  return "ok";
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The delete bugs that lose offers</span>
  <ul>
    <li>Calling <code>deleteNode(node.left, val)</code> without assigning the result. The tree is never rewired.</li>
    <li>Deleting the root and forgetting to reassign the variable: write <code>root = deleteNode(root, val)</code>, because the root itself can change.</li>
    <li>In the two-children case, deleting the successor from the whole tree or from the wrong side. It lives in the <em>right</em> subtree, and the value-based delete is only safe there because the values are distinct.</li>
    <li>Taking the maximum of the right subtree or the minimum of the left. Neither fits the slot.</li>
    <li>Assuming deletion keeps the tree balanced. It does not; a balanced tree can become lopsided after many deletes.</li>
  </ul>
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Delete has three cases by child
  count. A leaf or a node with one child is just replaced by its child, which
  may be null. With two children I copy in the in-order successor, the minimum
  of the right subtree, and delete that node from the right side, which is
  always an easy case because it has no left child. It's all one root-to-leaf
  walk, so O(h)."
</div>

<h3>Successor and predecessor</h3>
<p>
  The successor of a value <code>v</code> is the smallest value in the tree
  that is strictly larger than <code>v</code>; the predecessor is the largest
  that is strictly smaller. Delete just used one, and "inorder successor" is a
  standard question on its own. Derive it from the in-order sequence: the
  successor is whatever comes right after <code>v</code>. Two situations decide
  where that is.
</p>
<ul>
  <li><b><code>v</code> has a right subtree.</b> Everything after <code>v</code> in order starts inside that subtree, and the first of them is its smallest value: go right once, then left as far as possible.</li>
  <li><b><code>v</code> has no right subtree.</b> The next value is an ancestor. Climb until you arrive from a left child; that parent is the answer, because it is the first ancestor larger than <code>v</code>. If you never arrive from the left, <code>v</code> is the largest value and has no successor.</li>
</ul>
<p>
  With parent pointers, those two cases are the code. Without them — the usual
  interview setting, where you only get the root — there is a neater single
  loop. Walk from the root toward <code>v</code> and remember the last node at
  which you turned left, because a left turn means that node is larger than
  <code>v</code>. If <code>v</code> has a right subtree, the walk continues
  into it, and since <code>v</code> is smaller than everything there it turns
  left all the way down, ending on the minimum of that subtree. If it has no
  right subtree, the remembered node is the nearest larger ancestor. Both cases
  fall out of one rule.
</p>
<pre><code>function successor(root, val) {
  let best = null;
  let node = root;
  while (node !== null) {
    if (val &lt; node.val) {
      best = node;      <span class="c">// a candidate: larger than val, and we may find a smaller one</span>
      node = node.left;
    } else {
      node = node.right; <span class="c">// node.val &lt;= val: it and its left side are too small</span>
    }
  }
  return best;
}

function predecessor(root, val) {
  let best = null;
  let node = root;
  while (node !== null) {
    if (val &gt; node.val) {
      best = node;
      node = node.right;
    } else {
      node = node.left;
    }
  }
  return best;
}

function successorWithParent(node) { <span class="c">// each node has a .parent pointer, null at the root</span>
  if (node.right !== null) return minNode(node.right);
  let child = node;
  let parent = node.parent;
  while (parent !== null &amp;&amp; parent.right === child) {
    child = parent;
    parent = parent.parent;
  }
  return parent;
}</code></pre>
<p>
  <code>successor</code> works whether or not <code>val</code> is in the tree:
  the question "what is the smallest value above 5?" is a fine one even if 5 is
  absent.
</p>
<h4>Dry run: successor on the running example</h4>
<table>
  <tr><th>Query</th><th>Walk (node: decision)</th><th>best at the end</th></tr>
  <tr><td>successor(6)</td><td>8: 6 &lt; 8, remember 8, go left. 3: go right. 6: not less, go right. 7: 6 &lt; 7, remember 7, go left. null.</td><td>7 (6 has a right subtree)</td></tr>
  <tr><td>successor(7)</td><td>8: remember 8, go left. 3: right. 6: right. 7: not less, go right. null.</td><td>8 (7 has no right subtree; 8 is the ancestor reached from the left)</td></tr>
  <tr><td>successor(5)</td><td>8: remember 8, go left. 3: right. 6: 5 &lt; 6, remember 6, go left. 4: right. null.</td><td>6 (5 is not in the tree)</td></tr>
  <tr><td>successor(14)</td><td>8: right. 10: right. 14: right. null.</td><td>null (the largest value)</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Strict or not, node or value</span>
  Successor is <em>strictly</em> greater. If you write <code>val &lt;= node.val</code>
  in the left-turn test you have written a different function (see ceiling
  below) and <code>successor(6)</code> returns 6. Also decide what you return:
  the node, so the caller can read <code>.val</code> or keep walking, or the
  bare value. Returning <code>best.val</code> without a null check crashes on
  the largest value.
</div>
<p>
  Cost: one downward walk, O(h) time and O(1) space. It also lets you step through a
  BST in order with no stack: start at the smallest value and call
  <code>successor</code> repeatedly. That costs O(h) per step, which is worse than
  the iterator below, but needs no stored state.
</p>

<h3>Floor and ceiling</h3>
<p>
  Successor asks for the next value strictly above. Often the question allows
  equality: "the closest value that does not exceed 5" is 5 itself if 5 is
  present. Ordered-set libraries name the four relatives like this:
</p>
<table>
  <tr><th>Name</th><th>Meaning</th><th>Relation to what you have</th></tr>
  <tr><td>floor(x)</td><td>largest value ≤ x</td><td>like the predecessor, but equal is allowed</td></tr>
  <tr><td>lower(x)</td><td>largest value &lt; x</td><td>the predecessor</td></tr>
  <tr><td>ceiling(x)</td><td>smallest value ≥ x</td><td>like the successor, but equal is allowed; the tree form of lowerBound from binary search</td></tr>
  <tr><td>higher(x)</td><td>smallest value &gt; x</td><td>the successor</td></tr>
</table>
<p>
  They are all one walk. Compare <code>x</code> with the current node, keep the
  best candidate seen so far, and descend toward where a better one could still
  be. For the ceiling: when the node is at least <code>x</code> it is a
  candidate, and a smaller candidate could only be on its left; when the node is
  below <code>x</code>, it and its whole left side are too small, so go right.
  The floor is the mirror image.
</p>
<pre><code>function floor(root, x) {
  let best = null;
  let node = root;
  while (node !== null) {
    if (node.val === x) return node;       <span class="c">// exact match: nothing can beat it</span>
    if (node.val &lt; x) {
      best = node;                          <span class="c">// fits (not above x); a larger fit could be on the right</span>
      node = node.right;
    } else {
      node = node.left;
    }
  }
  return best;
}

function ceiling(root, x) {
  let best = null;
  let node = root;
  while (node !== null) {
    if (node.val === x) return node;
    if (node.val &gt; x) {
      best = node;                          <span class="c">// fits (not below x); a smaller fit could be on the left</span>
      node = node.left;
    } else {
      node = node.right;
    }
  }
  return best;
}</code></pre>
<h4>Dry run: floor and ceiling on the running example</h4>
<table>
  <tr><th>x</th><th>floor walk</th><th>floor</th><th>ceiling walk</th><th>ceiling</th></tr>
  <tr><td>5</td><td>8 too big, left. 3 fits (3), right. 6 too big, left. 4 fits (4), right. null.</td><td>4</td><td>8 fits (8), left. 3 too small, right. 6 fits (6), left. 4 too small, right. null.</td><td>6</td></tr>
  <tr><td>7</td><td>8 too big, left. 3 fits, right. 6 fits, right. 7 equals x.</td><td>7</td><td>8 fits, left. 3 too small, right. 6 too small, right. 7 equals x.</td><td>7</td></tr>
  <tr><td>20</td><td>8, 10, 14 each fit, going right every time. null.</td><td>14</td><td>8, 10, 14 each too small, going right. null.</td><td>null</td></tr>
  <tr><td>0</td><td>8, 3, 1 all too big, going left. null.</td><td>null</td><td>8, 3, 1 each fit, going left. null.</td><td>1</td></tr>
</table>
<p>
  Closest value to a target is the floor and the ceiling compared by distance:
  take the nearer, and decide in advance which side wins a tie. Both runs are
  O(h) time and O(1) space.
</p>
<div class="warn">
  <span class="ttl">⚠ null is not a number</span>
  When the target is outside the tree's range, one of the two walks returns
  <code>null</code>. In JavaScript <code>5 - null</code> is <code>5</code>, because
  <code>null</code> converts to 0 in arithmetic, and <code>Math.abs(5 - null)</code>
  is 5. A missing floor then looks like a very close value, and the bug shows up
  only on inputs at the edge. Test for <code>null</code> explicitly before any
  distance arithmetic.
</div>

<h3>Kth smallest, and rank when the tree changes</h3>
<p>
  In-order traversal visits values in increasing order, so the k-th smallest is
  the k-th node visited. You do not need to visit the rest. Use the iterative
  traversal from the Trees chapter, count as you pop, and stop at k. That
  costs O(h) to reach the first node and O(k) more to walk to the k-th, so
  O(h + k) time, and O(h) space for the stack.
</p>
<pre><code>function kthSmallest(root, k) { <span class="c">// k counts from 1</span>
  const stack = [];
  let node = root;
  while (node !== null || stack.length &gt; 0) {
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }
    node = stack.pop();
    k -= 1;
    if (k === 0) return node.val;
    node = node.right;
  }
  return undefined; <span class="c">// k was larger than the number of values</span>
}</code></pre>
<h4>Dry run: kthSmallest(root, 3) on the running example</h4>
<table>
  <tr><th>Step</th><th>Stack after the left descent (bottom to top)</th><th>Pop</th><th>k afterwards</th><th>Then</th></tr>
  <tr><td>1</td><td>8, 3, 1</td><td>1</td><td>2</td><td>1 has no right child</td></tr>
  <tr><td>2</td><td>8, 3</td><td>3</td><td>1</td><td>go to 3's right child, 6</td></tr>
  <tr><td>3</td><td>8, 6, 4</td><td>4</td><td>0</td><td>k reached 0: return 4</td></tr>
</table>
<p>
  That is right if the tree is queried once. Now suppose the problem says the
  tree is modified often and k-th is asked often: "what is the 4th smallest
  after each insert?" Paying O(h + k) per query is no longer good enough for
  large k. The fix is to <b>store in every node how many values live in its
  subtree</b>. Then at a node, the left subtree's size tells you in O(1) which
  side holds the k-th value: if k is within the left count, go left; if k is
  one past it, this node is the answer; otherwise skip the left subtree and
  this node, subtract their count from k, and go right. One root-to-leaf walk,
  O(h).
</p>
<pre><code>class SizedNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.size = 1; <span class="c">// how many values are in the subtree rooted here</span>
  }
}

const sizeOf = (node) =&gt; (node === null ? 0 : node.size);

function insertSized(node, val) {
  if (node === null) return new SizedNode(val);
  if (val &lt; node.val) node.left = insertSized(node.left, val);
  else if (val &gt; node.val) node.right = insertSized(node.right, val);
  else return node; <span class="c">// duplicate: no size changes</span>
  node.size = 1 + sizeOf(node.left) + sizeOf(node.right); <span class="c">// recompute on the way back up</span>
  return node;
}

function kthBySize(root, k) {
  let node = root;
  while (node !== null) {
    const leftCount = sizeOf(node.left);
    if (k &lt;= leftCount) {
      node = node.left;
    } else if (k === leftCount + 1) {
      return node.val;
    } else {
      k -= leftCount + 1; <span class="c">// skip the left subtree and this node</span>
      node = node.right;
    }
  }
  return undefined;
}

function rank(root, x) { <span class="c">// how many stored values are smaller than x</span>
  let smaller = 0;
  let node = root;
  while (node !== null) {
    if (x &lt;= node.val) {
      node = node.left;
    } else {
      smaller += 1 + sizeOf(node.left); <span class="c">// this node and its whole left side are below x</span>
      node = node.right;
    }
  }
  return smaller;
}</code></pre>
<p>
  <code>rank</code> is the inverse of <code>kthBySize</code> — "how many values
  are smaller?" is the position <code>x</code> would take in sorted order, the
  same number lowerBound returns on an array. Deleting from a tree with sizes
  works the same way: the recursion that rewires pointers also recomputes
  <code>size</code> on the way back up, for the O(h) nodes on the path.
  Sizes are the simplest case of <em>augmenting</em> a tree: storing one extra
  fact per node that can be recomputed from the children. Order-statistic trees
  and interval trees are built on the same idea.
</p>
<h4>Dry run: kthBySize(5) and rank(7) on the running example</h4>
<p>
  The subtree sizes in the example are 8 → 9, 3 → 5, 10 → 3, 6 → 3, 14 → 2,
  and 1, 4, 7, 13 → 1 each.
</p>
<table>
  <tr><th>kthBySize(5): at node</th><th>Left subtree holds</th><th>Decision</th></tr>
  <tr><td>8</td><td>5 values</td><td>k = 5 ≤ 5: go left</td></tr>
  <tr><td>3</td><td>1 value</td><td>k = 5 is past 1 + 1: k becomes 5 − 2 = 3, go right</td></tr>
  <tr><td>6</td><td>1 value</td><td>k = 3 is past 1 + 1: k becomes 1, go right</td></tr>
  <tr><td>7</td><td>0 values</td><td>k = 1 = 0 + 1: this is the answer, 7</td></tr>
</table>
<table>
  <tr><th>rank(7): at node</th><th>Left subtree holds</th><th>Decision</th></tr>
  <tr><td>8</td><td>5 values</td><td>7 ≤ 8: go left, smaller stays 0</td></tr>
  <tr><td>3</td><td>1 value</td><td>7 &gt; 3: add 1 + 1, smaller = 2, go right</td></tr>
  <tr><td>6</td><td>1 value</td><td>7 &gt; 6: add 1 + 1, smaller = 4, go right</td></tr>
  <tr><td>7</td><td>0 values</td><td>7 ≤ 7: go left to null; the answer is 4 (the values 1, 3, 4, 6)</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Kth pitfalls</span>
  Off-by-one: this chapter counts k from 1, matching the problem statements,
  while array indexing counts from 0. A recursive version with a counter in an
  outer variable must reset that counter on every call, or the second query
  starts where the first ended. A size field must be updated on <em>every</em>
  structural change, including rotations later in this chapter; a stale
  <code>size</code> gives wrong answers quietly. The k-th <em>largest</em> is
  the k-th smallest of the mirror order, or the (size − k + 1)-th smallest.
</div>

<h3>The BST iterator with an explicit stack</h3>
<p>
  The task: build an object over a BST with <code>next()</code>, which returns
  the next value in increasing order, and <code>hasNext()</code>. The easy
  answer runs an in-order traversal in the constructor and stores everything in
  an array. That works, but the constructor costs O(n) time and O(n) memory
  before the first value is even requested, which is the exact thing the
  problem is asking you to avoid. The expected answer keeps O(h) memory and
  O(1) amortized time per call.
</p>
<p>
  Think of the recursive in-order traversal as a process you can pause. At any
  moment the only state it holds is the chain of ancestors it will return to:
  nodes whose left subtree it is inside of, waiting to be visited themselves.
  That chain is the left spine from the root down to the current position, and
  it is exactly what an explicit stack stores. So keep that stack and advance
  it one step at a time: the next value is the node on top; after taking it,
  its right subtree is the next thing to explore, and you enter it by pushing
  its left spine.
</p>
<pre><code>class BSTIterator {
  constructor(root) {
    this.stack = [];
    this.pushLeftSpine(root);
  }

  pushLeftSpine(node) {
    while (node !== null) {
      this.stack.push(node);
      node = node.left;
    }
  }

  hasNext() {
    return this.stack.length &gt; 0;
  }

  next() {
    const node = this.stack.pop();       <span class="c">// the smallest value not yet returned</span>
    this.pushLeftSpine(node.right);      <span class="c">// what comes after it lies in its right subtree</span>
    return node.val;
  }
}</code></pre>
<h4>Dry run: the iterator on the running example</h4>
<table>
  <tr><th>Call</th><th>Stack before (bottom to top)</th><th>Pops</th><th>Pushes</th><th>Returns</th><th>Stack after</th></tr>
  <tr><td>constructor</td><td>(empty)</td><td>—</td><td>8, 3, 1 (left spine of the root)</td><td>—</td><td>8, 3, 1</td></tr>
  <tr><td>next()</td><td>8, 3, 1</td><td>1</td><td>nothing (1 has no right child)</td><td>1</td><td>8, 3</td></tr>
  <tr><td>next()</td><td>8, 3</td><td>3</td><td>6, 4 (left spine of 3's right child)</td><td>3</td><td>8, 6, 4</td></tr>
  <tr><td>next()</td><td>8, 6, 4</td><td>4</td><td>nothing</td><td>4</td><td>8, 6</td></tr>
  <tr><td>next()</td><td>8, 6</td><td>6</td><td>7</td><td>6</td><td>8, 7</td></tr>
  <tr><td>next()</td><td>8, 7</td><td>7</td><td>nothing</td><td>7</td><td>8</td></tr>
  <tr><td>next()</td><td>8</td><td>8</td><td>10 (the left spine of 8's right child is just 10, which has no left child)</td><td>8</td><td>10</td></tr>
  <tr><td>next()</td><td>10</td><td>10</td><td>14, 13 (the left spine of 10's right child 14)</td><td>10</td><td>14, 13</td></tr>
  <tr><td>next()</td><td>14, 13</td><td>13</td><td>nothing</td><td>13</td><td>14</td></tr>
  <tr><td>next()</td><td>14</td><td>14</td><td>nothing</td><td>14</td><td>(empty): hasNext() is now false</td></tr>
</table>
<p class="sub">
  The row that returns 8 is the one that trips people up. Its right child is 10,
  and 10 has no left child, so the left spine pushed is just 10. The nodes 14
  and 13 are pushed one call later, when 10 is popped.
</p>
<p>
  The cost claims, because interviewers ask. A single <code>next()</code> can
  push up to h nodes, so its worst case is O(h). But every node is pushed once
  and popped once over the whole traversal, so n calls cost O(n) in total:
  O(1) amortized per call. The stack never holds more than one root-to-node
  path, so the memory is O(h). Do not claim O(1) worst case per call, because it
  is not.
</p>
<div class="warn">
  <span class="ttl">⚠ Iterator pitfalls</span>
  Pushing the right child on <code>next()</code> instead of its whole left
  spine skips the smaller values that live under it. Calling
  <code>next()</code> when <code>hasNext()</code> is false pops
  <code>undefined</code> and throws on <code>node.right</code>. Modifying the
  tree while an iterator is live invalidates the stack, so say so as a
  precondition rather than leave it implicit.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "The stack is the in-order
  recursion with the call stack made explicit. I push the left spine up front,
  <code>next</code> pops the top and pushes the left spine of its right child.
  Each node is pushed and popped once, so it's O(1) amortized per call and O(h)
  memory, not O(n) like flattening to an array."
</div>

<h3>Two Sum IV: two iterators from opposite ends</h3>
<p>
  Given a BST and a target <code>k</code>, are there two different nodes whose
  values add up to <code>k</code>? There are three reasonable answers, and the
  trade-off between them is the point of the question.
</p>
<table>
  <tr><th>Approach</th><th>Time</th><th>Extra space</th><th>Idea</th></tr>
  <tr><td>Traverse with a <code>Set</code></td><td>O(n)</td><td>O(n)</td><td>for each value, ask whether <code>k - val</code> was already seen</td></tr>
  <tr><td>In-order array, then two pointers</td><td>O(n)</td><td>O(n)</td><td>the array is sorted, so use the sorted two-sum scan</td></tr>
  <tr><td>Two iterators, one from each end</td><td>O(n)</td><td>O(h)</td><td>the same two-pointer scan, with pointers that walk the tree</td></tr>
</table>
<p>
  The third one is the two-pointer technique with the array replaced by an
  in-order walk from the small end and a <em>reverse</em> in-order walk from the
  big end. The reverse walk is the iterator with <code>left</code> and
  <code>right</code> exchanged. So make the iterator take a direction.
</p>
<pre><code>class BSTWalker {
  constructor(root, forward) {
    this.forward = forward;
    this.stack = [];
    this.descend(root);
  }

  descend(node) {
    while (node !== null) {
      this.stack.push(node);
      node = this.forward ? node.left : node.right; <span class="c">// forward chases the small side, backward the big side</span>
    }
  }

  next() {
    const node = this.stack.pop();
    this.descend(this.forward ? node.right : node.left);
    return node.val;
  }
}

function findTarget(root, k) {
  if (root === null) return false;
  const up = new BSTWalker(root, true);    <span class="c">// ascending values</span>
  const down = new BSTWalker(root, false); <span class="c">// descending values</span>
  let a = up.next();
  let b = down.next();
  while (a &lt; b) {                          <span class="c">// a &lt; b also guarantees two different nodes</span>
    const sum = a + b;
    if (sum === k) return true;
    if (sum &lt; k) a = up.next();            <span class="c">// need a bigger sum: move the small end up</span>
    else b = down.next();                  <span class="c">// need a smaller sum: move the big end down</span>
  }
  return false;
}</code></pre>
<p>
  There is no <code>hasNext()</code> check inside the loop and that is
  deliberate. While <code>a &lt; b</code>, the value <code>b</code> still lies
  ahead of the ascending walker, so <code>up.next()</code> has something to
  return; the same argument covers the descending walker. The proof that the
  scan loses nothing is the one from the sorted two-sum problem: if the sum is
  too small, <code>a</code> cannot pair with any value at or below
  <code>b</code>, so it is finished.
</p>
<h4>Dry run: the tree [5,3,6,2,4,null,7]</h4>
<table>
  <tr><th>Step</th><th>a (from up)</th><th>b (from down)</th><th>Sum</th><th>k = 10</th><th>k = 14</th></tr>
  <tr><td>1</td><td>2</td><td>7</td><td>9</td><td>9 &lt; 10: advance a</td><td>9 &lt; 14: advance a</td></tr>
  <tr><td>2</td><td>3</td><td>7</td><td>10</td><td>10 = 10: return true</td><td>10 &lt; 14: advance a</td></tr>
  <tr><td>3</td><td>4</td><td>7</td><td>11</td><td></td><td>11 &lt; 14: advance a</td></tr>
  <tr><td>4</td><td>5</td><td>7</td><td>12</td><td></td><td>12 &lt; 14: advance a</td></tr>
  <tr><td>5</td><td>6</td><td>7</td><td>13</td><td></td><td>13 &lt; 14: advance a</td></tr>
  <tr><td>6</td><td>7</td><td>7</td><td>—</td><td></td><td>a is no longer less than b: return false</td></tr>
</table>
<p class="sub">
  Worst-case time is O(n): each walker moves forward at most n steps in total,
  using the amortized argument from the iterator. Space is O(h) for the two
  stacks. For one query the Set is simpler and perfectly fine; the two-iterator
  version is the answer to "now do it with O(h) extra space".
</p>

<h3>Sorted array or list to a balanced BST</h3>
<p>
  Given values already in sorted order, build a BST of minimum height. The
  tempting solution — insert them one by one — is the worst possible: sorted
  input makes every new value go right of everything before it, producing a
  chain (the next sections measure what that costs). The sorted order is a
  gift, not a hazard, if you use it differently.
</p>
<p>
  The root must have as many values below it as above it, as nearly as
  possible, so make the <b>middle</b> element the root. The elements before it,
  in order, are exactly the left subtree's values, and the ones after it are the
  right subtree's; both are sorted arrays again. Recurse on each half. At every
  node the two sides differ in size by at most one, so every subtree is as
  balanced as its size allows, and the height of the whole tree is the number of
  times n can be halved: ⌊log2 n⌋ + 1 levels.
</p>
<pre><code>function sortedArrayToBST(nums) {
  function build(lo, hi) { <span class="c">// builds from nums[lo..hi], both ends included</span>
    if (lo &gt; hi) return null;
    const mid = lo + Math.floor((hi - lo) / 2);
    const node = new TreeNode(nums[mid]);
    node.left = build(lo, mid - 1);
    node.right = build(mid + 1, hi);
    return node;
  }
  return build(0, nums.length - 1);
}</code></pre>
<p>
  Pass index bounds, never <code>nums.slice(...)</code>: a slice copies its
  range, so slicing at every level makes the whole build cost O(n log n)
  instead of O(n). With bounds it is O(n) time, one node created per value, and
  O(log n) recursion depth. For an even count there are two middles, and
  choosing the lower or the upper gives two different valid trees; neither is
  more correct.
</p>
<h4>Dry run: [-10, -3, 0, 5, 9]</h4>
<table>
  <tr><th>Call build(lo, hi)</th><th>mid</th><th>Node created</th><th>Left call</th><th>Right call</th></tr>
  <tr><td>build(0, 4)</td><td>2</td><td>0</td><td>build(0, 1)</td><td>build(3, 4)</td></tr>
  <tr><td>build(0, 1)</td><td>0</td><td>-10</td><td>build(0, -1): null</td><td>build(1, 1)</td></tr>
  <tr><td>build(1, 1)</td><td>1</td><td>-3</td><td>null</td><td>null</td></tr>
  <tr><td>build(3, 4)</td><td>3</td><td>5</td><td>build(3, 2): null</td><td>build(4, 4)</td></tr>
  <tr><td>build(4, 4)</td><td>4</td><td>9</td><td>null</td><td>null</td></tr>
</table>
<p class="sub">
  The result is <code>[0,-10,5,null,-3,null,9]</code>: root 0, five values in three levels. Its in-order is the input array, as it must be.
</p>
<p>
  <b>The same problem from a sorted linked list.</b> A list has no random
  access, so finding the middle by walking costs O(n) per call, O(n log n)
  overall. Do it the other way around: build the tree in the order a traversal
  would <em>read</em> the values. In-order means the left subtree is built
  first, and it consumes the first values of the list; then the node itself is
  the next list value; then the right subtree consumes the rest. Keep one
  cursor into the list, and use the counts to know each subtree's size.
</p>
<pre><code>class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function sortedListToBST(head) {
  let length = 0;
  for (let p = head; p !== null; p = p.next) length += 1;
  let cursor = head; <span class="c">// the next list value not yet placed in the tree</span>

  function build(lo, hi) {
    if (lo &gt; hi) return null;
    const mid = lo + Math.floor((hi - lo) / 2);
    const left = build(lo, mid - 1);       <span class="c">// must run first: it consumes the smaller values</span>
    const node = new TreeNode(cursor.val); <span class="c">// the cursor is now exactly at this node's value</span>
    cursor = cursor.next;
    node.left = left;
    node.right = build(mid + 1, hi);
    return node;
  }
  return build(0, length - 1);
}</code></pre>
<p>
  Time O(n), recursion depth O(log n). For the list 1 → 2 → 3 → 4 → 5 → 6, the
  cursor hands out 1, 2, 3, 4, 5, 6 in that order, and the result is
  <code>[3,1,5,null,2,4,6]</code>: 3 at the root, 1 with a right child 2 on the
  left, and 5 with children 4 and 6 on the right. The same two-step recipe
  also rebalances a lopsided BST: in-order traversal into an array, then
  <code>sortedArrayToBST</code>, in O(n) time and O(n) space.
</p>

<h3>Use the ordering to prune: range sum and trim</h3>
<p>
  Any question about the values within <code>[low, high]</code> can skip the
  parts of the tree that cannot contain them. If a node's value is below
  <code>low</code>, then the node and its whole left subtree are below
  <code>low</code> too, so look only at its right subtree. Symmetrically, a
  node above <code>high</code> sends you left.
</p>
<pre><code>function rangeSum(node, low, high) {
  if (node === null) return 0;
  if (node.val &lt; low) return rangeSum(node.right, low, high);
  if (node.val &gt; high) return rangeSum(node.left, low, high);
  return node.val + rangeSum(node.left, low, high) + rangeSum(node.right, low, high);
}

function trimBST(node, low, high) { <span class="c">// keep only values in [low, high]; returns the new subtree root</span>
  if (node === null) return null;
  if (node.val &lt; low) return trimBST(node.right, low, high);  <span class="c">// node and its left side are gone</span>
  if (node.val &gt; high) return trimBST(node.left, low, high);  <span class="c">// node and its right side are gone</span>
  node.left = trimBST(node.left, low, high);
  node.right = trimBST(node.right, low, high);
  return node;
}</code></pre>
<p>
  <code>rangeSum</code> visits the nodes inside the range, plus the nodes on at
  most two root-to-leaf paths (toward <code>low</code> and toward
  <code>high</code>) that sit outside it: O(h + m) for m values in range, not
  O(n). <code>trimBST</code> is the "return the subtree root and reassign"
  pattern from insert and delete again, and it is the best test of whether you
  absorbed that pattern: a trimmed tree's root may be a different node than the
  original root.
</p>
<h4>Dry run: trimBST on the running example with [4, 10]</h4>
<table>
  <tr><th>Call</th><th>Decision</th><th>Returns</th></tr>
  <tr><td>trim(8)</td><td>in range: trim both children</td><td>8</td></tr>
  <tr><td>trim(3)</td><td>3 &lt; 4: drop 3 and its left side, go to its right child</td><td>whatever trim(6) returns</td></tr>
  <tr><td>trim(6)</td><td>in range: trim both children (4 and 7, both in range, no children kept)</td><td>6</td></tr>
  <tr><td>trim(10)</td><td>in range: trim both children</td><td>10</td></tr>
  <tr><td>trim(null)</td><td>10 has no left child</td><td>null</td></tr>
  <tr><td>trim(14)</td><td>14 &gt; 10: drop 14 and its right side, go to its left child</td><td>whatever trim(13) returns</td></tr>
  <tr><td>trim(13)</td><td>13 &gt; 10: go to its left child, null</td><td>null</td></tr>
</table>
<p class="sub">
  Back up the recursion: 8's left child becomes 6 (3 and 1 are gone), 10's right
  child becomes null (14 and 13 are gone), and the result is
  <code>[8,6,10,4,7]</code>. The tree's root stayed 8 here; trim <code>[9, 12]</code>
  on the same tree and the answer's root is 10, not 8.
</p>

<h3>Degenerate trees: the cost is the height</h3>
<p>
  Every operation above visits one root-to-node path, so its cost is the height
  of the tree. The BST property says nothing about that height. The values 1
  through 7 inserted in increasing order make every node the right child of the
  one before it.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="Two trees holding the values 1 to 7. On the left, inserted in increasing order, the values form a chain of seven levels. On the right, inserted as 4, 2, 6, 1, 3, 5, 7, they form a full tree of three levels">
    <g class="rough">
      <path class="lnr" d="M50,25 L85,55" />
      <path class="lnr" d="M85,55 L120,85" />
      <path class="lnr" d="M120,85 L155,115" />
      <path class="lnr" d="M155,115 L190,145" />
      <path class="lnr" d="M190,145 L225,175" />
      <path class="lnr" d="M225,175 L260,205" />
      <path class="lng" d="M470,30 L400,90" />
      <path class="lng" d="M470,30 L540,90" />
      <path class="lng" d="M400,90 L365,150" />
      <path class="lng" d="M400,90 L435,150" />
      <path class="lng" d="M540,90 L505,150" />
      <path class="lng" d="M540,90 L575,150" />
    </g>
    <g class="rough">
      <circle class="boxr" cx="50" cy="25" r="14" />
      <circle class="boxr" cx="85" cy="55" r="14" />
      <circle class="boxr" cx="120" cy="85" r="14" />
      <circle class="boxr" cx="155" cy="115" r="14" />
      <circle class="boxr" cx="190" cy="145" r="14" />
      <circle class="boxr" cx="225" cy="175" r="14" />
      <circle class="boxr" cx="260" cy="205" r="14" />
      <circle class="boxg" cx="470" cy="30" r="18" />
      <circle class="boxg" cx="400" cy="90" r="18" />
      <circle class="boxg" cx="540" cy="90" r="18" />
      <circle class="boxg" cx="365" cy="150" r="18" />
      <circle class="boxg" cx="435" cy="150" r="18" />
      <circle class="boxg" cx="505" cy="150" r="18" />
      <circle class="boxg" cx="575" cy="150" r="18" />
    </g>
    <text class="sm" x="50" y="30" text-anchor="middle">1</text>
    <text class="sm" x="85" y="60" text-anchor="middle">2</text>
    <text class="sm" x="120" y="90" text-anchor="middle">3</text>
    <text class="sm" x="155" y="120" text-anchor="middle">4</text>
    <text class="sm" x="190" y="150" text-anchor="middle">5</text>
    <text class="sm" x="225" y="180" text-anchor="middle">6</text>
    <text class="sm" x="260" y="210" text-anchor="middle">7</text>
    <text class="sm" x="470" y="35" text-anchor="middle">4</text>
    <text class="sm" x="400" y="95" text-anchor="middle">2</text>
    <text class="sm" x="540" y="95" text-anchor="middle">6</text>
    <text class="sm" x="365" y="155" text-anchor="middle">1</text>
    <text class="sm" x="435" y="155" text-anchor="middle">3</text>
    <text class="sm" x="505" y="155" text-anchor="middle">5</text>
    <text class="sm" x="575" y="155" text-anchor="middle">7</text>
    <text class="sm rd" x="160" y="245" text-anchor="middle">inserted 1, 2, 3, ...: 7 levels, search = 7 steps</text>
    <text class="sm gr" x="470" y="245" text-anchor="middle">inserted 4, 2, 6, 1, 3, 5, 7: 3 levels</text>
  </svg>
  <figcaption>Same seven values. The shape comes from the insertion order and not from the values.</figcaption>
</figure>
<p>
  How bad is it in practice? Inserting the keys in random order tends to give a
  height well under n. These are measurements from one run of Node 24, in
  levels, with 20 random shuffles per size:
</p>
<table>
  <tr><th>n</th><th>Inserted in sorted order</th><th>Inserted in random order (20 runs)</th><th>Perfectly balanced</th></tr>
  <tr><td>1,000</td><td>1,000</td><td>18 to 25</td><td>10</td></tr>
  <tr><td>10,000</td><td>10,000</td><td>28 to 36</td><td>14</td></tr>
  <tr><td>100,000</td><td>100,000</td><td>37 to 44</td><td>17</td></tr>
</table>
<p>
  So random order lands at roughly twice the ideal height, which
  is acceptable, and sorted order is the full n, which is a disaster. The cost
  of the disaster is concrete. Inserting 100,000 sorted keys one at a time into
  an unbalanced BST walks about n²/2 = 5·10⁹ nodes in total; the same
  iterative <code>insert</code> as above took roughly 13 seconds on one machine
  running Node 24, against about 0.14 seconds for 10,000 sorted keys. A hidden test with n = 10⁵ and sorted input is the classic
  way a correct-looking BST solution times out.
</p>
<div class="warn">
  <span class="ttl">⚠ In JavaScript the chain also overflows the stack</span>
  The recursive <code>insert</code> above threw a <code>RangeError</code> (maximum
  call stack size exceeded) after about 10,000 sorted insertions in Node 24 with
  default settings. The exact depth depends on the engine, the version and how
  big each frame is, so treat it as "somewhere around ten thousand", not a
  constant. The consequence is general: <em>any</em> recursive function over a
  tree that may be a chain — in-order, height, even a recursive search — can
  overflow on a deep input. When the input is sorted, or a hidden test might be,
  prefer the iterative forms from this chapter, or build the tree balanced to
  begin with.
</div>
<table>
  <tr><th>Tree shape</th><th>Height</th><th>search / insert / delete</th><th>Recursion depth</th></tr>
  <tr><td>chain</td><td>n</td><td>O(n)</td><td>O(n)</td></tr>
  <tr><td>random insertion order</td><td>roughly twice the balanced height in the runs above</td><td>O(log n) in these runs</td><td>O(log n)</td></tr>
  <tr><td>balanced by construction or by rotations</td><td>O(log n), guaranteed</td><td>O(log n)</td><td>O(log n)</td></tr>
</table>

<h3>Balanced trees in concept: rotations and AVL</h3>
<p>
  A <b>self-balancing</b> BST repairs its own shape after each insert or delete
  so that the height stays O(log n) whatever order the operations arrive in.
  The repairs use one tool: a <b>rotation</b>, a local rewiring of three
  pointers that changes the shape without changing the in-order sequence. Since
  the in-order sequence is what makes a BST a BST, a rotation can never break
  the ordering. It only moves a node up and its neighbour down.
</p>
<p>
  Take a node <code>x</code> whose right child is <code>y</code>. A
  <em>left rotation at x</em> makes <code>y</code> the parent and
  <code>x</code> its left child. The one subtree that is in the way is
  <code>y</code>'s old left subtree <code>B</code>: it held values between
  <code>x</code> and <code>y</code>, and after the rotation it hangs from
  <code>x</code>'s right side, which is precisely the range between them. Nothing
  else moves.
</p>
<pre><code>class AvlNode {
  constructor(val) {
    this.val = val;
    this.left = null;
    this.right = null;
    this.height = 1; <span class="c">// levels on the longest path down, counting this node</span>
  }
}

const heightOf = (node) =&gt; (node === null ? 0 : node.height);

function refresh(node) {
  node.height = 1 + Math.max(heightOf(node.left), heightOf(node.right));
}

function rotateLeft(x) {
  const y = x.right;
  x.right = y.left; <span class="c">// the subtree between x and y changes sides</span>
  y.left = x;
  refresh(x);       <span class="c">// x is now below y: update it first</span>
  refresh(y);
  return y;         <span class="c">// y is the new root of this piece</span>
}

function rotateRight(y) {
  const x = y.left;
  y.left = x.right;
  x.right = y;
  refresh(y);
  refresh(x);
  return x;
}</code></pre>
<p>
  The <b>AVL tree</b> is the first self-balancing BST. Its rule: at every node,
  the heights of the two subtrees differ by at most 1. Each node stores its
  height, and after an insert or delete you recompute heights back up the path
  to the root. If a node's balance, <code>height(left) − height(right)</code>,
  becomes +2 or −2, that node is repaired. There are four cases, named for where
  the extra weight sits:
</p>
<table>
  <tr><th>Case</th><th>Where the extra depth is</th><th>Repair</th></tr>
  <tr><td>left-left</td><td>in the left child's left subtree</td><td>one right rotation at the node</td></tr>
  <tr><td>right-right</td><td>in the right child's right subtree</td><td>one left rotation at the node</td></tr>
  <tr><td>left-right</td><td>in the left child's right subtree</td><td>left rotation at the left child, then a right rotation at the node</td></tr>
  <tr><td>right-left</td><td>in the right child's left subtree</td><td>right rotation at the right child, then a left rotation at the node</td></tr>
</table>
<p>
  The two "zig-zag" cases need two rotations because one rotation alone just
  moves the heavy side from one place to another: the inner grandchild is the
  one that is too deep, and the first rotation turns the zig-zag into a straight
  line so the second can fix it.
</p>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Inserting 10, 20, 30 in order makes a right-leaning chain with 10 at the top that is two levels too deep on the right; a left rotation at 10 makes 20 the root with 10 and 30 as its children">
    <g class="rough">
      <path class="ln" d="M130,30 L170,85" />
      <path class="ln" d="M170,85 L210,140" />
      <path class="ln" d="M500,30 L450,85" />
      <path class="ln" d="M500,30 L550,85" />
    </g>
    <g class="rough">
      <circle class="boxr" cx="130" cy="30" r="22" />
      <circle class="box" cx="170" cy="85" r="22" />
      <circle class="box" cx="210" cy="140" r="22" />
      <circle class="boxg" cx="500" cy="30" r="22" />
      <circle class="box" cx="450" cy="85" r="22" />
      <circle class="box" cx="550" cy="85" r="22" />
    </g>
    <text class="sm" x="130" y="35" text-anchor="middle">10</text>
    <text class="sm" x="170" y="90" text-anchor="middle">20</text>
    <text class="sm" x="210" y="145" text-anchor="middle">30</text>
    <text class="sm" x="500" y="35" text-anchor="middle">20</text>
    <text class="sm" x="450" y="90" text-anchor="middle">10</text>
    <text class="sm" x="550" y="90" text-anchor="middle">30</text>
    <text class="lbl" x="255" y="75" text-anchor="middle">left rotation</text>
    <text class="lbl" x="255" y="97" text-anchor="middle">at 10 →</text>
    <text class="sm rd" x="130" y="185" text-anchor="middle">10 is off by two (right too deep)</text>
    <text class="sm gr" x="500" y="185" text-anchor="middle">balanced, same in-order: 10, 20, 30</text>
  </svg>
  <figcaption>The right-right case after inserting 10, 20, 30. One rotation, and the in-order sequence is unchanged.</figcaption>
</figure>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Inserting 30, 10, 20 gives 30 with a left child 10 whose right child is 20; a left rotation at 10 turns this into a left-leaning chain 30, 20, 10; a right rotation at 30 then makes 20 the root with children 10 and 30">
    <g class="rough">
      <path class="ln" d="M90,30 L55,85" />
      <path class="ln" d="M55,85 L90,140" />
      <path class="ln" d="M300,30 L265,85" />
      <path class="ln" d="M265,85 L230,140" />
      <path class="ln" d="M540,30 L500,85" />
      <path class="ln" d="M540,30 L580,85" />
    </g>
    <g class="rough">
      <circle class="boxr" cx="90" cy="30" r="20" />
      <circle class="box" cx="55" cy="85" r="20" />
      <circle class="box" cx="90" cy="140" r="20" />
      <circle class="boxr" cx="300" cy="30" r="20" />
      <circle class="box" cx="265" cy="85" r="20" />
      <circle class="box" cx="230" cy="140" r="20" />
      <circle class="boxg" cx="540" cy="30" r="20" />
      <circle class="box" cx="500" cy="85" r="20" />
      <circle class="box" cx="580" cy="85" r="20" />
    </g>
    <text class="sm" x="90" y="35" text-anchor="middle">30</text>
    <text class="sm" x="55" y="90" text-anchor="middle">10</text>
    <text class="sm" x="90" y="145" text-anchor="middle">20</text>
    <text class="sm" x="300" y="35" text-anchor="middle">30</text>
    <text class="sm" x="265" y="90" text-anchor="middle">20</text>
    <text class="sm" x="230" y="145" text-anchor="middle">10</text>
    <text class="sm" x="540" y="35" text-anchor="middle">20</text>
    <text class="sm" x="500" y="90" text-anchor="middle">10</text>
    <text class="sm" x="580" y="90" text-anchor="middle">30</text>
    <text class="sm" x="195" y="75" text-anchor="middle">rotate left</text>
    <text class="sm" x="195" y="93" text-anchor="middle">at 10 →</text>
    <text class="sm" x="420" y="75" text-anchor="middle">rotate right</text>
    <text class="sm" x="420" y="93" text-anchor="middle">at 30 →</text>
    <text class="sm rd" x="90" y="185" text-anchor="middle">zig-zag: the inner node is deep</text>
    <text class="sm" x="300" y="185" text-anchor="middle">now a straight line</text>
    <text class="sm gr" x="540" y="185" text-anchor="middle">balanced</text>
  </svg>
  <figcaption>The left-right case after inserting 30, 10, 20: a double rotation.</figcaption>
</figure>
<pre><code>function rebalance(node) {
  refresh(node);
  const balance = heightOf(node.left) - heightOf(node.right);
  if (balance &gt; 1) {                                       <span class="c">// left side too deep</span>
    if (heightOf(node.left.left) &lt; heightOf(node.left.right)) {
      node.left = rotateLeft(node.left);                   <span class="c">// left-right: straighten the zig-zag first</span>
    }
    return rotateRight(node);
  }
  if (balance &lt; -1) {                                      <span class="c">// right side too deep</span>
    if (heightOf(node.right.right) &lt; heightOf(node.right.left)) {
      node.right = rotateRight(node.right);                <span class="c">// right-left</span>
    }
    return rotateLeft(node);
  }
  return node;
}

function avlInsert(node, val) {
  if (node === null) return new AvlNode(val);
  if (val &lt; node.val) node.left = avlInsert(node.left, val);
  else if (val &gt; node.val) node.right = avlInsert(node.right, val);
  else return node;
  return rebalance(node); <span class="c">// every node on the way back up gets checked</span>
}

function avlDelete(node, val) { <span class="c">// the same three-case delete, with a rebalance on the way up</span>
  if (node === null) return null;
  if (val &lt; node.val) {
    node.left = avlDelete(node.left, val);
  } else if (val &gt; node.val) {
    node.right = avlDelete(node.right, val);
  } else {
    if (node.left === null) return node.right;
    if (node.right === null) return node.left;
    const heir = minNode(node.right);
    node.val = heir.val;
    node.right = avlDelete(node.right, heir.val);
  }
  return rebalance(node);
}</code></pre>
<p>
  Look at how little is new. <code>avlInsert</code> is <code>insert</code> with
  one extra line, and <code>avlDelete</code> is <code>deleteNode</code> with one
  extra line; the entire balancing story is inside <code>rebalance</code>.
  Everything on the path from the changed spot back to the root is revisited by
  the recursion's returns, which is exactly where heights go stale.
</p>
<h4>Dry run: inserting 1 through 7 into an AVL tree</h4>
<p>
  A plain BST turns this input into a chain of height 7. The AVL version, with
  the repair at each step:
</p>
<table>
  <tr><th>Insert</th><th>Problem found</th><th>Repair</th><th>Tree as an array</th></tr>
  <tr><td>1</td><td>—</td><td>—</td><td>[1]</td></tr>
  <tr><td>2</td><td>—</td><td>—</td><td>[1,null,2]</td></tr>
  <tr><td>3</td><td>1 is off by two, right-right</td><td>left rotation at 1</td><td>[2,1,3]</td></tr>
  <tr><td>4</td><td>—</td><td>—</td><td>[2,1,3,null,null,null,4]</td></tr>
  <tr><td>5</td><td>3 is off by two, right-right</td><td>left rotation at 3</td><td>[2,1,4,null,null,3,5]</td></tr>
  <tr><td>6</td><td>2 is off by two, right-right</td><td>left rotation at 2 (the root changes to 4)</td><td>[4,2,5,1,3,null,6]</td></tr>
  <tr><td>7</td><td>5 is off by two, right-right</td><td>left rotation at 5</td><td>[4,2,6,1,3,5,7]</td></tr>
</table>
<p class="sub">
  The final tree is the perfect one from the figure above: three levels, not
  seven. Two properties are worth knowing. An insert needs at most <em>one</em>
  repair (a single or a double rotation) to restore balance, whereas a delete
  can need a repair at several levels on its way up.
</p>
<p>
  <b>Why the height is logarithmic.</b> Let N(h) be the fewest nodes an AVL tree
  of height h can have. Its root has one subtree of height h − 1 and, to be as
  thin as possible, the other of height h − 2, so N(h) = N(h − 1) + N(h − 2) + 1.
  That is the Fibonacci recurrence, and it grows exponentially:
</p>
<table>
  <tr><th>Height h</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th></tr>
  <tr><td>Fewest nodes N(h)</td><td>1</td><td>2</td><td>4</td><td>7</td><td>12</td><td>20</td><td>33</td><td>54</td></tr>
</table>
<p class="sub">
  Exponential growth in h means h is logarithmic in n; working it through, an
  AVL tree with n nodes has height at most about 1.44 × log2 n. Each rotation is
  a handful of pointer writes, so insert and delete are O(log n) time even in
  the worst case, at the cost of one extra number per node.
</p>
<div class="warn">
  <span class="ttl">⚠ Rotation pitfalls</span>
  Updating heights in the wrong order (the node that moved down must be
  refreshed before the one that moved up). Forgetting that the height of
  <code>null</code> is 0 and a leaf is 1, then mixing that convention with a
  version where a leaf is 0. Skipping the second rotation in the zig-zag case.
  Using <code>&lt;=</code> instead of <code>&lt;</code> in the zig-zag test:
  after a <em>delete</em>, the heavy child can be perfectly even (balance 0), and
  that case needs one rotation, not two. Not rebalancing on the way up from a
  delete. And forgetting to update stored sizes, if you also keep them, inside
  the rotations.
</div>

<h3>Red-black trees: the idea, and why you will not write one</h3>
<p>
  The other balanced tree you will hear about is the <b>red-black tree</b>. It
  gets its balance from a colouring rule instead of heights. Each node is red or
  black, with four rules:
</p>
<ul>
  <li>The root is black.</li>
  <li>A red node never has a red child.</li>
  <li>Every path from a node down to a missing child passes through the same number of black nodes.</li>
  <li>Every missing child counts as black.</li>
</ul>
<p>
  Those rules squeeze the tree into a bounded shape. The shortest root-to-leaf
  path can be all black; the longest can alternate black and red, but cannot
  contain more red nodes than black ones, so no path is more than about twice as
  long as another. That yields a height of at most 2 × log2(n + 1). A new value
  goes in as a red leaf, which can only violate the "no red child under red"
  rule; the repair recolours some nodes and does at most a constant number of
  rotations. Deletion is the harder half and has a longer case list.
</p>
<p>
  How the two compare: an AVL tree is kept more tightly balanced, so lookups
  tend to be a little faster; a red-black tree does fewer rotations per update.
  Both give O(log n) for search, insert and delete. Java's <code>TreeMap</code>
  is documented as a red-black tree, and <code>TreeSet</code> is built on it;
  ordered containers in other standard libraries commonly are red-black trees
  too. Two other ways to get
  the same guarantee are worth a name: a <b>treap</b> keeps a random priority in
  each node and rotates to keep a heap order on the priorities, which makes
  the tree balanced with high probability, and a <b>skip list</b> reaches
  O(log n) expected time with layered linked lists and no rotations at all.
  Databases and file systems use <b>B-trees</b>, which put many keys in each node
  so a single disk read covers a lot of the search.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "A plain BST is only as good as its
  shape: sorted input makes it a linked list. Self-balancing trees such as AVL
  and red-black keep the height at O(log n) with rotations, which rewire three
  pointers and preserve the in-order sequence. I wouldn't hand-roll one in a
  forty-minute interview; I'd name the operation I need from an ordered set,
  give its O(log n) cost, and say what I'd use for it here."
</div>

<h3>JavaScript has no ordered set: what to use instead</h3>
<p>
  In Java you would write <code>TreeMap</code> or <code>TreeSet</code> and move
  on; those give floor, ceiling, k-th-style navigation and sorted iteration in
  O(log n). The ECMAScript standard has no equivalent. <code>Map</code> and
  <code>Set</code> are hash tables that iterate in <em>insertion</em> order, not
  key order; <code>new Set([3, 1, 2])</code> iterates 3, 1, 2. They have no
  floor, no ceiling, no first or last, and no rank. Sorting their keys on every
  query costs O(n log n) each time.
</p>
<div class="warn">
  <span class="ttl">⚠ A plain object is not an ordered map either</span>
  <code>Object.keys({ b: 1, 10: 1, 2: 1, a: 1 })</code> returns
  <code>["2", "10", "b", "a"]</code>: keys that look like non-negative integers
  come first in ascending numeric order, and the rest follow in insertion order.
  That is a coincidence of how property order is specified, it applies only to
  those integer-like keys, and every key is turned into a string. It gives you no
  floor or ceiling, so do not build on it. Likewise,
  <code>[10, 9, 1].sort()</code> returns <code>[1, 10, 9]</code>, because the
  default comparator compares strings: always pass <code>(a, b) =&gt; a - b</code>
  for numbers.
</div>
<p>
  What you do instead depends on which queries you need and how the data
  arrives:
</p>
<table>
  <tr><th>Situation</th><th>Use</th><th>Cost</th></tr>
  <tr><td>All the data is known up front</td><td>Sort once; answer with binary search or two pointers</td><td>O(n log n) once, then O(log n) per query</td></tr>
  <tr><td>Only the minimum or the maximum, with inserts</td><td>A heap (<a href="/dsa/dsa-heaps-priority-queues">Heaps and priority queues</a>)</td><td>O(log n) per push and pop; no floor or ceiling</td></tr>
  <tr><td>Arbitrary removals with min or max</td><td>A heap with lazy deletion</td><td>O(log n) amortized, extra memory for stale entries</td></tr>
  <tr><td>Inserts and ordered queries, up to roughly 10⁴ to 10⁵ values</td><td>A sorted array with binary search and <code>splice</code></td><td>O(log n) to find, O(n) to shift on insert and delete</td></tr>
  <tr><td>Heavy updates plus ordered queries on very large n</td><td>A balanced tree you write (AVL), or an offline method</td><td>O(log n) per operation</td></tr>
  <tr><td>"Count of values smaller than x" over a changing set of numbers known in advance</td><td>Coordinate compression and a Fenwick tree (<a href="/dsa/dsa-segment-fenwick-trees">Segment and Fenwick trees</a>)</td><td>O(log n) per operation</td></tr>
</table>
<p>
  The sorted array is the pragmatic default, and it is better than it sounds:
  the O(n) shift is real, but its constant is small. In a measurement on one
  machine with Node 24, 10,000 random inserts into a sorted array took about
  6 ms and 100,000 took about 0.6 s — quadratic growth, from a small constant. That is plenty for the sizes
  most interview problems use, and you must still <em>say</em> that the insert
  is O(n) and why you accept it. Notice that it also answers rank and k-th in
  O(1) once you have the index, which the tree needs extra bookkeeping for.
</p>
<pre><code>class SortedList {
  constructor() {
    this.items = [];
  }

  lowerBound(x) { <span class="c">// first index whose value is &gt;= x</span>
    let lo = 0;
    let hi = this.items.length;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt;&gt; 1;
      if (this.items[mid] &lt; x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  upperBound(x) { <span class="c">// first index whose value is &gt; x</span>
    let lo = 0;
    let hi = this.items.length;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt;&gt; 1;
      if (this.items[mid] &lt;= x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  has(x) {
    return this.items[this.lowerBound(x)] === x;
  }

  add(x) {
    const i = this.lowerBound(x);
    if (this.items[i] === x) return false;
    this.items.splice(i, 0, x); <span class="c">// O(n): shifts everything after i</span>
    return true;
  }

  remove(x) {
    const i = this.lowerBound(x);
    if (this.items[i] !== x) return false;
    this.items.splice(i, 1);
    return true;
  }

  floor(x) {
    return this.items[this.upperBound(x) - 1]; <span class="c">// undefined if nothing is &lt;= x</span>
  }

  ceiling(x) {
    return this.items[this.lowerBound(x)];     <span class="c">// undefined if nothing is &gt;= x</span>
  }

  rank(x) {
    return this.lowerBound(x);                 <span class="c">// how many values are smaller than x</span>
  }

  kth(k) {
    return this.items[k - 1];                  <span class="c">// k counts from 1</span>
  }
}</code></pre>
<p>
  <code>lowerBound</code> is the same function as in the
  <a href="/dsa/dsa-binary-search">Binary search</a> chapter, including the
  <code>hi = items.length</code> that makes "not found" return the length.
  Walk through four <code>add</code> calls: adding 5, 1, 9 and 3 leaves
  <code>items</code> as <code>[5]</code>, then <code>[1,5]</code>, then
  <code>[1,5,9]</code>, then <code>[1,3,5,9]</code>. Then <code>floor(4)</code>
  is 3, <code>ceiling(4)</code> is 5, <code>rank(5)</code> is 2 (the values 1
  and 3 are smaller), and <code>kth(3)</code> is 5. Because it uses
  <code>&lt;</code> directly it works for numbers and for plain strings; for
  pairs or objects, replace the comparison with a comparator. Do not store
  <code>undefined</code> as a value, since it is also the "not found" answer.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I need floor and ceiling over a
  changing set. JavaScript has no ordered set, so I'll keep a sorted array and
  use binary search to find positions. Lookups and the floor and ceiling are
  O(log n); inserts and deletes shift elements, so they are O(n), which is fine
  for this input size. If n were in the millions with many updates I'd switch
  to a balanced tree, or go offline with coordinate compression and a Fenwick
  tree."
</div>

<h3>Recognizing it in an unseen problem</h3>
<table>
  <tr><th>The problem says</th><th>Reach for</th></tr>
  <tr><td>"insert into / delete from a BST"</td><td>return-the-subtree-root recursion; three cases for delete</td></tr>
  <tr><td>"next greater value", "inorder successor", "closest value to target"</td><td>one downward walk remembering the best candidate (successor, floor, ceiling)</td></tr>
  <tr><td>"kth smallest in a BST"</td><td>iterative in-order with early exit, O(h + k); with updates, subtree sizes</td></tr>
  <tr><td>"implement an iterator over a BST", "O(h) memory"</td><td>explicit stack holding the left spine</td></tr>
  <tr><td>"two sum in a BST"</td><td>a set (simple) or two directional iterators (O(h) space)</td></tr>
  <tr><td>"build a balanced BST from sorted data"</td><td>middle element as the root; for a list, build in in-order with a cursor</td></tr>
  <tr><td>"values within a range" in a BST</td><td>prune with the comparisons: below low go right, above high go left</td></tr>
  <tr><td>sorted-input BST with n up to 10⁵ and recursion</td><td>expect a chain: iterative code, or balance it</td></tr>
  <tr><td>"changing collection, need floor/ceiling/rank"</td><td>ordered set; in JavaScript, a sorted array with binary search</td></tr>
</table>
<p>
  Two relatives belong to other chapters: checking that a tree is a valid BST
  and the lowest common ancestor in a BST are in
  <a href="/dsa/dsa-tree-problems">Tree problems in depth</a>. And a problem that
  merely <em>mentions</em> order is not automatically a BST problem. A running
  median wants two heaps; "count smaller numbers after self" wants merge sort
  or a Fenwick tree; a plain "have I seen this value?" wants a <code>Set</code>.
  Reach for a BST, or its stand-in, when the question needs the order and the
  data changes between questions.
</p>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write <code>insert</code> and <code>deleteNode</code> from memory, say what the three delete cases are and why the successor has at most one child, then check them against a random sorted-array reference.</li>
    <li>Write the single-loop <code>successor</code> with no parent pointers and explain why it handles both the right-subtree case and the ancestor case.</li>
    <li>Say the difference between successor and ceiling in one sentence, and why <code>null</code> inside <code>Math.abs</code> arithmetic is a bug.</li>
    <li>Write the BST iterator, trace the stack for a few calls, and state its cost correctly: O(1) amortized, O(h) worst per call, O(h) memory.</li>
    <li>Build a balanced BST from a sorted array and from a sorted linked list, and say why bounds beat slices.</li>
    <li>Explain what a rotation preserves and why an AVL tree's height is O(log n); say the four AVL cases in your own words.</li>
    <li>Say what JavaScript lacks, name two stand-ins with their costs, and explain what a plain recursive BST does on 100,000 sorted insertions.</li>
  </ul>
</div>`,
};
