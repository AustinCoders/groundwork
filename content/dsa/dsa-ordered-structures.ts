import type { Chapter } from "../types";

export const dsaOrderedStructures: Chapter = {
  id: "dsa-ordered-structures",
  num: "A12",
  title: "Ordered sets without a TreeMap",
  short: "Ordered structures",
  levels: ["advanced"],
  prerequisites: ["dsa-bst-operations", "dsa-segment-fenwick-trees"],
  practice: [
    "ex-js-sorted-list-class",
    "ex-bst-ordered-set",
    "ex-ordered-multiset",
    "ex-fenwick-multiset",
    "ex-my-calendar-i",
    "ex-my-calendar-ii",
    "ex-my-calendar-iii",
    "ex-data-stream-disjoint-intervals",
    "ex-range-module",
    "ex-exam-room",
    "ex-sliding-window-median",
    "ex-contains-duplicate-iii",
    "ex-count-of-range-sum",
    "ex-reverse-pairs",
    "ex-max-sum-rectangle-no-larger-than-k",
    "ex-stock-price-fluctuation",
    "ex-longest-subarray-abs-diff-limit",
  ],
  ready: true,
  subtitle:
    "Floor, ceiling, rank and range counts over a set that keeps changing, built from a treap, buckets or a Fenwick tree, and the problems that need them.",
  body: `<h3>What an ordered set has to answer</h3>
<p>
  A hash set answers one question: is <code>x</code> in here? A heap answers
  one more: what is the smallest item? A large family of problems asks something
  in between, about <em>neighbours in sorted order</em> inside a collection that
  keeps changing. What is the first booking that starts after 15? Which stored
  number is closest to 12? What is the median of the current window? How many
  earlier prefix sums fall inside <code>[a, b]</code>? Java answers these with
  <code>TreeMap</code> and <code>TreeSet</code>, C++ with <code>std::set</code>
  and <code>std::map</code>. JavaScript has nothing like them:
  <code>Set</code> and <code>Map</code> are hash tables that iterate in
  insertion order, and the sort order of keys plays no part in them.
</p>
<p>
  This chapter is about what to put in that gap, how to choose between the
  options, and the problems where an ordered set is the whole idea. The
  <a href="/dsa/dsa-bst-operations">Binary search tree</a> chapter owns the
  tree itself: insert, delete, rotations, AVL, the red-black idea, and a short
  <code>SortedList</code> class. The
  <a href="/dsa/dsa-js-toolkit">JavaScript toolkit</a> has the same sorted-array
  class with a comparator, and the
  <a href="/dsa/dsa-segment-fenwick-trees">Segment and Fenwick trees</a>
  chapter owns the Fenwick tree. None of that is repeated here. What this
  chapter adds is the working engineer's side: the interface, a complete
  balanced structure with rank and select, a faster one for large inputs, an
  offline alternative, and the problems.
</p>

<h4>The interface</h4>
<table>
  <tr><th>Operation</th><th>Returns</th><th>Java</th><th>C++ (<code>std::set</code>)</th></tr>
  <tr><td><code>add(x)</code>, <code>remove(x)</code></td><td>insert a key, delete a key</td><td><code>add</code>, <code>remove</code></td><td><code>insert</code>, <code>erase</code></td></tr>
  <tr><td><code>has(x)</code></td><td>whether <code>x</code> is stored</td><td><code>contains</code></td><td><code>find</code>, <code>count</code></td></tr>
  <tr><td><code>floor(x)</code></td><td>largest key <code>≤ x</code></td><td><code>floor</code></td><td>step back from <code>upper_bound</code></td></tr>
  <tr><td><code>lower(x)</code></td><td>largest key <code>&lt; x</code></td><td><code>lower</code></td><td>step back from <code>lower_bound</code></td></tr>
  <tr><td><code>ceiling(x)</code></td><td>smallest key <code>≥ x</code></td><td><code>ceiling</code></td><td><code>lower_bound</code></td></tr>
  <tr><td><code>higher(x)</code></td><td>smallest key <code>&gt; x</code></td><td><code>higher</code></td><td><code>upper_bound</code></td></tr>
  <tr><td><code>rank(x)</code></td><td>how many keys are smaller than <code>x</code></td><td>no direct method</td><td>no direct method</td></tr>
  <tr><td><code>at(i)</code></td><td>the i-th smallest key (select)</td><td>no direct method</td><td>no direct method</td></tr>
  <tr><td><code>countRange(lo, hi)</code></td><td>how many keys lie in <code>[lo, hi]</code></td><td><code>subSet</code> then count by walking</td><td>two bounds, then count by walking</td></tr>
  <tr><td>iterate from <code>x</code></td><td>keys in order, starting at the first one <code>≥ x</code></td><td><code>tailSet</code></td><td>iterate from <code>lower_bound</code></td></tr>
</table>
<p class="sub">
  The two rows marked "no direct method" are the surprise. The standard ordered
  sets of Java and C++ do not give you rank or select in O(log n); programmers
  who need them write an order-statistic tree or use a Fenwick tree. So the
  structures in this chapter are not a poor copy of <code>TreeMap</code>. With
  subtree sizes they can answer more than it can.
</p>
<p>
  One observation shortens everything that follows. Five of the rows can be
  computed from two counting primitives. Let <code>rank(x)</code> be the number
  of keys smaller than <code>x</code>, and <code>countAtMost(x)</code> the number
  of keys not larger than <code>x</code>. Then, counting positions from 0:
</p>
<ul>
  <li><code>floor(x) = at(countAtMost(x) − 1)</code>, <code>higher(x) = at(countAtMost(x))</code></li>
  <li><code>lower(x) = at(rank(x) − 1)</code>, <code>ceiling(x) = at(rank(x))</code></li>
  <li><code>countRange(lo, hi) = countAtMost(hi) − rank(lo)</code></li>
</ul>
<p>
  So any structure that supports <code>add</code>, <code>remove</code>,
  <code>rank</code>, <code>countAtMost</code> and <code>at</code> supports the
  whole interface. A sorted array gets rank from a binary search and
  <code>at</code> from an index. A Fenwick tree over compressed values gets both
  from prefix sums. A balanced tree gets both from subtree sizes. The rest of
  the chapter is three ways of providing those five operations, and then using
  them.
</p>
<p>
  Decide first whether the collection is a <b>set</b> (adding a key that is
  already there changes nothing) or a <b>multiset</b> (every copy counts). The
  structures here are multisets, because sliding-window medians and prefix-sum
  counts need every copy: <code>add</code> always adds one, and
  <code>remove</code> removes one copy and says whether it found any. To get set
  behaviour, call <code>has</code> before <code>add</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ floor and lower are different questions</span>
  <code>floor(x)</code> may return <code>x</code> itself, <code>lower(x)</code>
  never does; the same holds for <code>ceiling</code> and <code>higher</code>.
  Most wrong answers in this chapter's problems come from using the non-strict
  version where the statement needs the strict one, or the reverse. Read the
  statement for the words "strictly", "at most" and "distinct", and write the
  choice next to the call. Also remember that all four return
  <code>undefined</code> when there is no such key, so a stored key of 0 must
  be tested with <code>!== undefined</code>, never with a truthiness check.
</div>

<h3>The sorted array, and where it stops</h3>
<p>
  The first thing to reach for is the plain sorted array, and the two chapters
  named above already give you the complete class: a binary search for the
  lower and upper bound, <code>splice</code> to insert and delete. Through the
  lens of the five primitives it is almost free. <code>rank(x)</code> is the
  lower bound, <code>at(i)</code> is <code>items[i]</code>,
  <code>countAtMost(x)</code> is the upper bound, so every query in the table
  costs O(log n) or better. The only slow operations are <code>add</code> and
  <code>remove</code>, and the reason is mechanical: <code>splice(i, 0, x)</code>
  must move every item after position <code>i</code> one place to the right. For
  a random position that is about n/2 items. Inserting n items one at a time
  moves about n²/4 items in total, so the total cost grows with the square of
  n even though each search is logarithmic.
</p>
<p>
  The cost per moved item is small, because the shift runs inside the built-in
  <code>splice</code> and not in your own loop, and that is why the sorted array
  is such a strong default. Measured here, inserting random integers one at a time into a sorted
  array took about 5 ms for 10,000 items, about 0.5 s for 100,000 and about
  4.7 s for 300,000 (Node 24 on an Apple M2 Pro, median of five runs). Tripling
  n multiplied the time by about nine, which is the quadratic growth showing.
  Your numbers will differ with the machine, the Node version and the data. What
  carries over is the shape: fine up to tens of thousands of updates, hopeless
  at hundreds of thousands.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll keep the values in a sorted
  array and binary search it. Every query is O(log n). An insert or delete has
  to shift the items behind it, so each one is O(n), but the cost per item is
  small and that is fine for tens of thousands of updates. If there were hundreds of
  thousands, I would put the same interface on top of buckets or a balanced
  tree."
</div>
<div class="warn">
  <span class="ttl">⚠ Three ways to lose the logarithm</span>
  <code>indexOf</code> is a linear scan, so using it to find the position makes
  every call O(n) before the shift even starts. Calling <code>sort()</code>
  after every insert costs O(n log n) per insert, and the default
  <code>sort</code> compares as strings, so <code>[10, 9, 1].sort()</code> gives
  <code>[1, 10, 9]</code>. And <code>unshift</code> or <code>splice</code> in a
  loop is the same quadratic shift as above, so it cannot be hidden by a
  different spelling.
</div>

<h3>The treap: a balanced tree from two small functions</h3>
<p>
  When the array's shift is too slow, the next candidate is a balanced binary
  search tree, since a tree changes a few pointers instead of moving a block.
  The trouble, as the BST chapter showed, is balance: a plain tree fed sorted
  keys turns into a linked list, and AVL or red-black trees repair it with
  rotations and a list of cases that is easy to get wrong in a live interview.
  The structure below is balanced with high probability, is short enough to
  write from memory, and gets rank and select almost for free. It is called a
  <b>treap</b>: a <em>tree</em> ordered by key, and a heap ordered by a random
  <em>priority</em>.
</p>
<h4>The idea, in three steps</h4>
<p>
  <b>Step 1: two orders at once.</b> Give every key a priority. Demand that the
  tree be a binary search tree by key (smaller keys on the left) and, at the same
  time, a max-heap by priority (a parent's priority is at least its children's).
  For distinct keys and distinct priorities there is exactly one such tree: the
  root must be the key with the highest priority, everything smaller goes to the
  left, everything larger to the right, and the same rule applies inside each
  side. The shape is decided by the keys and priorities alone, and not by the
  order in which the keys were inserted.
</p>
<p>
  <b>Step 2: random priorities give balance.</b> If every priority is drawn at
  random when its key is created, then the root is a uniformly random one of the
  n keys, and so is the root of each subtree. That is quicksort with a random
  pivot, drawn as a tree. The result is the same tree you would get by inserting
  the keys into an ordinary BST in decreasing order of priority, and that order
  is a uniformly random permutation. Such a tree has expected height O(log n).
  The randomness comes from the priorities, so sorted input is harmless: it
  cannot choose the shape.
</p>
<p>
  <b>Step 3: two primitives do all the work.</b> Keeping both orders after every
  change sounds like a job for rotations, but it needs only two functions.
</p>
<ul>
  <li><code>split(t, key)</code> cuts the tree in two: one tree with the keys below <code>key</code>, one with the rest. Walk down from the root. A node smaller than <code>key</code> goes left, together with its whole left subtree, and the walk continues into its right subtree. Any other node goes right with its right subtree, and the walk continues into its left subtree. One root-to-leaf path is rewired, so the cost is the height.</li>
  <li><code>merge(a, b)</code> joins two trees when every key in <code>a</code> is at most every key in <code>b</code>. Compare the two roots. The higher priority stays on top. If it is <code>a</code>, then <code>b</code> must go somewhere inside <code>a</code>'s right subtree, so merge <code>b</code> into <code>a.right</code>; if it is <code>b</code>, merge <code>a</code> into <code>b.left</code>. The cost is the sum of two spine lengths, so again the height.</li>
</ul>
<p>
  <code>add(key)</code> is then one split and two merges: cut at the key,
  merge the left part with the new single-node tree, and merge the result with
  the right part. The new node settles exactly where its random priority puts
  it. <code>remove(key)</code> is two splits (below the key, and equal to the
  key), a merge of the two children of the equal part's root (which drops one
  copy), and a merge back. No rotation appears anywhere.
</p>
<p>
  Finally, every node stores <code>size</code>, the number of nodes in its
  subtree, recomputed by one small function whenever a node's children change.
  With sizes, "how many keys are smaller" and "which key is the i-th" are plain
  walks down the tree, which is why the five primitives come out so cheaply.
</p>
<figure>
  <svg viewBox="0 0 640 262" class="dg" role="img" aria-label="A treap holding the keys 10, 20, 30, 40 and 50. Key 30 with priority 0.9 is the root. Key 10 with priority 0.6 is its left child and has key 20 with priority 0.4 as its right child. Key 50 with priority 0.8 is its right child and has key 40 with priority 0.5 as its left child.">
    <g class="rough">
      <path class="ln" d="M320,48 L200,112" />
      <path class="ln" d="M320,48 L440,112" />
      <path class="ln" d="M200,112 L270,184" />
      <path class="ln" d="M440,112 L370,184" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="320" cy="38" r="22" />
      <circle class="box" cx="200" cy="106" r="22" />
      <circle class="box" cx="440" cy="106" r="22" />
      <circle class="box" cx="270" cy="178" r="22" />
      <circle class="box" cx="370" cy="178" r="22" />
    </g>
    <text class="lbl" x="320" y="44" text-anchor="middle">30</text>
    <text class="lbl" x="200" y="112" text-anchor="middle">10</text>
    <text class="lbl" x="440" y="112" text-anchor="middle">50</text>
    <text class="lbl" x="270" y="184" text-anchor="middle">20</text>
    <text class="lbl" x="370" y="184" text-anchor="middle">40</text>
    <text class="sm gr" x="352" y="30">priority 0.9, size 5</text>
    <text class="sm gr" x="104" y="98">0.6, size 2</text>
    <text class="sm gr" x="472" y="98">0.8, size 2</text>
    <text class="sm gr" x="214" y="214">0.4, size 1</text>
    <text class="sm gr" x="400" y="214">0.5, size 1</text>
    <text class="lbl gr" x="20" y="250" style="font-size:14px">keys increase left to right (a search tree); priorities decrease downward (a heap)</text>
  </svg>
  <figcaption>The same five keys with other priorities would give a different shape, but always one search tree and one heap. The sizes are what make rank and select cheap.</figcaption>
</figure>

<h4>The code: split and merge</h4>
<p>
  <code>makeNode</code> draws the priority once, when the node is created.
  <code>refresh</code> is the single place that knows what a node summarises, so
  anything you want to keep per subtree (a sum, a minimum) is added there and
  nowhere else. The generator <code>walkFrom</code> is an in-order walk with an
  explicit stack, the same idea as the BST iterator, and it starts at the first
  key at or after a bound.
</p>
<pre><code>function makeNode(key, value, priority = Math.random()) {
  return { key, value, priority, size: 1, left: null, right: null };
}

function sizeOf(node) {
  return node === null ? 0 : node.size;
}

function refresh(node) {
  node.size = 1 + sizeOf(node.left) + sizeOf(node.right); <span class="c">// the one place that knows what a node summarises</span>
  return node;
}

function merge(a, b) {
  <span class="c">// every key in a must be &lt;= every key in b</span>
  if (a === null) return b;
  if (b === null) return a;
  if (a.priority &gt; b.priority) {
    a.right = merge(a.right, b); <span class="c">// a stays on top; b joins its right side</span>
    return refresh(a);
  }
  b.left = merge(a, b.left); <span class="c">// b stays on top; a joins its left side</span>
  return refresh(b);
}

function split(node, key, compare, inclusive) {
  <span class="c">// returns [keys &lt; key, the rest]; with inclusive, [keys &lt;= key, the rest]</span>
  if (node === null) return [null, null];
  const order = compare(node.key, key);
  if (order &lt; 0 || (inclusive &amp;&amp; order === 0)) {
    const [middle, right] = split(node.right, key, compare, inclusive);
    node.right = middle; <span class="c">// node and its left side stay in the left part</span>
    return [refresh(node), right];
  }
  const [left, middle] = split(node.left, key, compare, inclusive);
  node.left = middle; <span class="c">// node and its right side go to the right part</span>
  return [left, refresh(node)];
}

function* walkFrom(root, compare, low) {
  const stack = [];
  let node = root;
  while (node !== null) {
    if (low === undefined || compare(node.key, low) &gt;= 0) {
      stack.push(node); <span class="c">// node and everything after it in its right side qualify</span>
      node = node.left;
    } else {
      node = node.right; <span class="c">// node and its left side are too small</span>
    }
  }
  while (stack.length &gt; 0) {
    node = stack.pop();
    yield node;
    node = node.right;
    while (node !== null) {
      stack.push(node);
      node = node.left;
    }
  }
}</code></pre>
<h4>Dry run: add(40) to the tree with 10, 20, 30 and 50</h4>
<p>
  Before the call the tree is the one in the figure without the key 40: root 30
  (priority 0.9) with left child 10 (0.6, whose right child is 20 with 0.4) and
  right child 50 (0.8). The new node gets priority 0.5.
</p>
<table>
  <tr><th>Step</th><th>Call</th><th>What happens</th><th>Result</th></tr>
  <tr><td>1</td><td><code>split(root, 40)</code></td><td>30 &lt; 40, so 30 and its left side stay left; go into 50. 50 is not below 40, so it goes right; its left side is empty.</td><td>left: 30 with 10 and 20 (size 3). right: 50 alone (size 1).</td></tr>
  <tr><td>2</td><td><code>merge(left, node 40)</code></td><td>30 (0.9) beats 40 (0.5), so 40 goes into 30's right side, which is empty.</td><td>30 with right child 40 (size 4)</td></tr>
  <tr><td>3</td><td><code>merge(that, right)</code></td><td>30 (0.9) beats 50 (0.8), so merge 50 into 30's right side: compare 40 (0.5) with 50 (0.8). 50 wins and 40 goes into 50's left side.</td><td>30 with right child 50, which has left child 40</td></tr>
  <tr><td>4</td><td><code>refresh</code> on the way back</td><td>50 gets size 2, then 30 gets size 5.</td><td>the tree in the figure</td></tr>
</table>
<p class="sub">
  Only the nodes on one path were touched: 30, 50 and the new 40. Every other
  node, and its size, is exactly as before. The three steps would produce a
  valid treap whatever the priority of 40 was; a different priority would only
  have moved 40 to a different depth.
</p>

<h3>The class: add, remove, rank, select and neighbours</h3>
<p>
  The class wraps the root and the comparator. A comparator, as in
  <code>sort</code>, lets keys be numbers, strings, pairs or objects: it returns
  a negative number, zero or a positive number. <code>add</code> and
  <code>remove</code> are the split and merge recipes above. The two counting
  walks are the heart of it. <code>countBefore(key)</code> goes down from the
  root: when a node is below the key, that node and its whole left subtree are
  before the key, so add <code>size(left) + 1</code> and move right; otherwise
  move left. <code>at(i)</code> asks, at each node, how many keys are in the left
  subtree: if <code>i</code> is smaller, go left; if equal, this node is the
  answer; otherwise skip the left subtree and the node itself and go right with
  a smaller <code>i</code>. The four neighbour queries are then the one-line
  formulas from the first section.
</p>
<pre><code>class Treap {
  constructor(compare = (a, b) =&gt; a - b) {
    this.compare = compare;
    this.root = null;
  }

  get size() {
    return sizeOf(this.root);
  }

  add(key, value = key) {
    const [left, right] = split(this.root, key, this.compare, false); <span class="c">// left: keys &lt; key</span>
    this.root = merge(merge(left, makeNode(key, value)), right);
  }

  remove(key) {
    const [left, rest] = split(this.root, key, this.compare, false); <span class="c">// left: keys &lt; key</span>
    const [equal, right] = split(rest, key, this.compare, true); <span class="c">// equal: keys == key</span>
    const kept = equal === null ? null : merge(equal.left, equal.right); <span class="c">// drop one node, keep the other copies</span>
    this.root = merge(left, merge(kept, right));
    return equal !== null;
  }

  find(key) {
    let node = this.root;
    while (node !== null) {
      const order = this.compare(key, node.key);
      if (order === 0) return node;
      node = order &lt; 0 ? node.left : node.right;
    }
    return null;
  }

  has(key) {
    return this.find(key) !== null;
  }

  get(key) {
    return this.find(key)?.value;
  }

  set(key, value) {
    const node = this.find(key);
    if (node === null) this.add(key, value);
    else node.value = value;
  }

  countBefore(key, inclusive) {
    let node = this.root;
    let count = 0;
    while (node !== null) {
      const order = this.compare(node.key, key);
      if (order &lt; 0 || (inclusive &amp;&amp; order === 0)) {
        count += sizeOf(node.left) + 1; <span class="c">// node and its whole left side come before key</span>
        node = node.right;
      } else {
        node = node.left;
      }
    }
    return count;
  }

  rank(key) {
    return this.countBefore(key, false); <span class="c">// how many keys are smaller</span>
  }

  countAtMost(key) {
    return this.countBefore(key, true);
  }

  countRange(low, high) {
    return Math.max(0, this.countAtMost(high) - this.rank(low)); <span class="c">// both ends included</span>
  }

  at(index) {
    if (index &lt; 0 || index &gt;= this.size) return undefined; <span class="c">// the index-th smallest, from 0</span>
    let node = this.root;
    while (true) {
      const leftSize = sizeOf(node.left);
      if (index &lt; leftSize) {
        node = node.left;
      } else if (index === leftSize) {
        return node.key;
      } else {
        index -= leftSize + 1;
        node = node.right;
      }
    }
  }

  floor(key) {
    return this.at(this.countAtMost(key) - 1); <span class="c">// largest key &lt;= key</span>
  }

  lower(key) {
    return this.at(this.rank(key) - 1); <span class="c">// largest key &lt; key</span>
  }

  ceiling(key) {
    return this.at(this.rank(key)); <span class="c">// smallest key &gt;= key</span>
  }

  higher(key) {
    return this.at(this.countAtMost(key)); <span class="c">// smallest key &gt; key</span>
  }

  *keys(low) {
    for (const node of walkFrom(this.root, this.compare, low)) yield node.key;
  }

  *entries(low) {
    for (const node of walkFrom(this.root, this.compare, low)) yield [node.key, node.value];
  }

  [Symbol.iterator]() {
    return this.keys();
  }
}</code></pre>
<p>
  Two details are worth knowing. A <b>map</b> comes for free: every node carries
  a <code>value</code>, <code>set(key, value)</code> overwrites the value of an
  existing key, and <code>get</code> reads it, which the interval problems below
  use. And the neighbour queries cost two descents each, one for the count and
  one for <code>at</code>, which is still O(log n). Write them as a single loop,
  as the BST chapter does, if the constant matters.
</p>
<h4>Dry run: rank(40) and at(3) on the tree in the figure</h4>
<table>
  <tr><th>Call</th><th>Node</th><th>Decision</th><th>Running state</th></tr>
  <tr><td rowspan="3"><code>rank(40)</code></td><td>30</td><td>30 &lt; 40: it and its left side (size 2) are before 40; go right</td><td>count = 2 + 1 = 3</td></tr>
  <tr><td>50</td><td>50 is not below 40; go left</td><td>count = 3</td></tr>
  <tr><td>40</td><td>40 is not below 40 (strictly); go left, which is empty</td><td><b>3</b>: the keys 10, 20, 30</td></tr>
  <tr><td rowspan="3"><code>at(3)</code></td><td>30</td><td>left size 2, and 3 &gt; 2: skip the left side and 30, so i = 3 − 3 = 0; go right</td><td>i = 0</td></tr>
  <tr><td>50</td><td>left size 1, and 0 &lt; 1: go left</td><td>i = 0</td></tr>
  <tr><td>40</td><td>left size 0, and i = 0: this is it</td><td><b>40</b></td></tr>
</table>
<p class="sub">
  The two calls agree: 40 has three keys before it, so it is the key at
  position 3. From these two, <code>floor(45)</code> is
  <code>at(countAtMost(45) − 1)</code>, which is <code>at(4 − 1)</code>, which
  is 40, and <code>ceiling(45)</code> is <code>at(rank(45))</code>, which is
  <code>at(4)</code>, which is 50.
</p>

<h4>Cost, depth and why not a skip list</h4>
<p>
  <code>add</code>, <code>remove</code>, <code>rank</code>, <code>at</code> and
  the neighbour queries each cost the height of the tree, which is O(log n)
  <em>in expectation</em>: the expectation is over the random priorities, for any
  sequence of operations that does not depend on them. It is not a worst-case
  bound, and it is not amortised: one operation can in principle be slow, with
  tiny probability. Memory is one object per key. In one run in Node 24, a treap
  of 100,000 random keys had an average node depth of 20.7 (the root counted as
  depth 1), against log₂ 100,000 ≈ 16.6 for a perfect tree. The average depth in
  a random search tree grows like 2 ln n, which is about 1.39 log₂ n. And a
  treap built by adding 1,000,000 keys in <em>ascending</em> order, the input
  that ruins a plain BST, had height 48. The recursion in <code>split</code> and
  <code>merge</code> goes as deep as the tree is high, so a few dozen frames, far
  below the engine's limit.
</p>
<p>
  Why this and not another structure? AVL and red-black trees give a worst-case
  bound, but each needs several rotation cases, and with sizes every rotation
  must also repair two counts. A <b>skip list</b> needs no rotations and is the
  other usual "easy" ordered structure, but rank and select need each forward
  pointer to remember how many bottom-level items it jumps over, kept correct
  through every insert and delete at every level, and the node holds an array
  of pointers and an array of widths. That is more code and more places for an
  off-by-one than the treap, whose rank and select are the two short loops
  above. The treap's weaknesses are real: a random-number call per insert, one
  small object per key, and a bound that is only expected. The measurements
  below show it is not the fastest structure here. It is the one that is short,
  correct and easy to extend.
</p>
<div class="warn">
  <span class="ttl">⚠ Treap traps</span>
  <b>Reversed arguments.</b> <code>merge(a, b)</code> assumes every key in
  <code>a</code> is at most every key in <code>b</code>; swap them and the tree
  silently stops being a search tree. <b>Stale sizes.</b> Any relinking
  without a call to <code>refresh</code> leaves a wrong size, and rank and select
  go wrong while searches still work, so check <code>size</code> against a count
  in your tests. <b>Priority drawn at the wrong time.</b> Draw it once, when the
  node is created, from a random source that does not depend on the key; deriving
  it from the key brings back the input-dependent shape. <b>Comparator.</b> It must be a consistent total order:
  <code>(a, b) =&gt; a - b</code> returns <code>NaN</code> for two infinities of
  the same sign, and a tie in the first field of a pair must fall through to the
  second. <b>Mixing <code>add</code> and <code>set</code>.</b> <code>add</code>
  keeps every copy; <code>set</code> keeps one per key. Pick one per instance.
  <b>Mutating while iterating.</b> The generators walk a stack of nodes, so
  adding or removing mid-loop gives undefined results; collect first, or ask for
  the next key with <code>ceiling</code> each time.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "A balanced tree with random
  priorities, a treap. Insert is a split at the key and two merges, delete is the
  same idea, and each node keeps its subtree size, so rank and k-th are plain
  descents. Expected O(log n) per operation, and sorted input does not hurt it
  because the shape depends on the priorities, not on the order of arrival."
</div>

<h3>Sqrt buckets: many short arrays instead of one long one</h3>
<p>
  The sorted array's problem is one long memory move. Cut the long array into
  consecutive pieces and the move shrinks. Keep the sorted sequence as a list of
  <b>buckets</b>, each a sorted array of at most <code>load</code> items, so that
  every item of bucket k is at most every item of bucket k + 1. An insert finds
  its bucket, inserts into that one short array, and shifts at most
  <code>load</code> items. When a bucket grows past <code>load</code>, split it
  into two halves, which happens once for about every <code>load / 2</code>
  inserts.
</p>
<figure>
  <svg viewBox="0 0 640 214" class="dg" role="img" aria-label="Inserting 15 into the sorted values 10 to 90. In one long array the eight items from 20 to 90 are shifted. In three buckets only the 20 and the 30 in the first bucket are shifted.">
    <g class="rough">
      <rect class="box" x="20" y="42" width="48" height="30" rx="4" />
      <rect class="boxg" x="72" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="124" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="176" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="228" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="280" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="332" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="384" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="436" y="42" width="48" height="30" rx="4" />
      <rect class="boxr" x="488" y="42" width="48" height="30" rx="4" />
    </g>
    <text class="sm" x="44" y="62" text-anchor="middle">10</text>
    <text class="sm" x="96" y="62" text-anchor="middle">15</text>
    <text class="sm" x="148" y="62" text-anchor="middle">20</text>
    <text class="sm" x="200" y="62" text-anchor="middle">30</text>
    <text class="sm" x="252" y="62" text-anchor="middle">40</text>
    <text class="sm" x="304" y="62" text-anchor="middle">50</text>
    <text class="sm" x="356" y="62" text-anchor="middle">60</text>
    <text class="sm" x="408" y="62" text-anchor="middle">70</text>
    <text class="sm" x="460" y="62" text-anchor="middle">80</text>
    <text class="sm" x="512" y="62" text-anchor="middle">90</text>
    <text class="lbl gr" x="20" y="28" style="font-size:14px">one array: inserting 15 shifts 8 items</text>
    <g class="rough">
      <rect class="box" x="20" y="136" width="48" height="30" rx="4" />
      <rect class="boxg" x="72" y="136" width="48" height="30" rx="4" />
      <rect class="boxr" x="124" y="136" width="48" height="30" rx="4" />
      <rect class="boxr" x="176" y="136" width="48" height="30" rx="4" />
      <rect class="box" x="248" y="136" width="48" height="30" rx="4" />
      <rect class="box" x="300" y="136" width="48" height="30" rx="4" />
      <rect class="box" x="352" y="136" width="48" height="30" rx="4" />
      <rect class="box" x="424" y="136" width="48" height="30" rx="4" />
      <rect class="box" x="476" y="136" width="48" height="30" rx="4" />
      <rect class="box" x="528" y="136" width="48" height="30" rx="4" />
    </g>
    <text class="sm" x="44" y="156" text-anchor="middle">10</text>
    <text class="sm" x="96" y="156" text-anchor="middle">15</text>
    <text class="sm" x="148" y="156" text-anchor="middle">20</text>
    <text class="sm" x="200" y="156" text-anchor="middle">30</text>
    <text class="sm" x="272" y="156" text-anchor="middle">40</text>
    <text class="sm" x="324" y="156" text-anchor="middle">50</text>
    <text class="sm" x="376" y="156" text-anchor="middle">60</text>
    <text class="sm" x="448" y="156" text-anchor="middle">70</text>
    <text class="sm" x="500" y="156" text-anchor="middle">80</text>
    <text class="sm" x="552" y="156" text-anchor="middle">90</text>
    <text class="sm gr" x="122" y="186" text-anchor="middle">bucket 1</text>
    <text class="sm gr" x="324" y="186" text-anchor="middle">bucket 2</text>
    <text class="sm gr" x="500" y="186" text-anchor="middle">bucket 3</text>
    <text class="lbl gr" x="20" y="122" style="font-size:14px">three buckets: the same insert shifts 2 items</text>
  </svg>
  <figcaption>Green is the new item and red are the items that move. The other buckets are not touched at all.</figcaption>
</figure>
<p>
  The other operations follow from the layout. To find where <code>x</code>
  lives, binary search the buckets using each bucket's last item (the first
  bucket whose last item is at least <code>x</code> holds the answer), then
  binary search inside that bucket. Floor and ceiling only need the position and
  one step back, which may cross into the previous bucket. Rank and select need
  counts of items, and here the structure is blunt: add up the lengths of the
  buckets before the position, one by one. That scan is why buckets lose to the
  treap on rank-heavy workloads, and why the size of a bucket is a real choice.
</p>
<p>
  With bucket size B and n items there are about n / B buckets. An insert costs
  about B for the shift in one bucket, plus an occasional split that costs
  O(B + n / B). A rank or select costs about n / B for the scan. Setting B near
  √n balances the two terms, so every operation costs about √n. The name
  "sqrt decomposition" comes from this trade (the
  <a href="/dsa/dsa-sparse-table">Sparse table</a> chapter derives the same
  balance for block sums). Choosing B is the one tuning decision, and a fixed
  value of a few hundred, like the 512 below, is a sound default for inputs
  up to a few million items.
</p>
<pre><code>class BucketList {
  constructor(load = 512) {
    this.load = load;
    this.buckets = [];
    this.size = 0;
  }

  locate(x, strict) {
    <span class="c">// [bucket, index] of the first item &gt;= x (or &gt; x when strict); [bucket count, 0] if none</span>
    let lo = 0;
    let hi = this.buckets.length;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt; 1;
      const bucket = this.buckets[mid];
      const last = bucket[bucket.length - 1]; <span class="c">// the bucket's largest item decides where x lives</span>
      if (strict ? last &lt;= x : last &lt; x) lo = mid + 1;
      else hi = mid;
    }
    if (lo === this.buckets.length) return [lo, 0];
    <span class="c">// inside the chosen bucket the answer exists, because its last item qualifies</span>
    const bucket = this.buckets[lo];
    let from = 0;
    let to = bucket.length - 1;
    while (from &lt; to) {
      const mid = (from + to) &gt;&gt; 1;
      if (strict ? bucket[mid] &lt;= x : bucket[mid] &lt; x) from = mid + 1;
      else to = mid;
    }
    return [lo, from];
  }

  before(bucketIndex, index) {
    <span class="c">// the item just before a position, possibly in the previous bucket</span>
    if (index &gt; 0) return this.buckets[bucketIndex][index - 1];
    return bucketIndex &gt; 0 ? this.buckets[bucketIndex - 1].at(-1) : undefined;
  }

  add(x) {
    let [bucketIndex, index] = this.locate(x, true);
    if (this.buckets.length === 0) {
      this.buckets.push([x]);
      this.size = 1;
      return;
    }
    if (bucketIndex === this.buckets.length) {
      bucketIndex -= 1; <span class="c">// x is larger than everything: append to the last bucket</span>
      index = this.buckets[bucketIndex].length;
    }
    const bucket = this.buckets[bucketIndex];
    bucket.splice(index, 0, x); <span class="c">// shifts at most load items</span>
    this.size += 1;
    if (bucket.length &gt; this.load) {
      this.buckets.splice(bucketIndex + 1, 0, bucket.splice(bucket.length &gt;&gt; 1)); <span class="c">// split in two halves</span>
    }
  }

  remove(x) {
    const [bucketIndex, index] = this.locate(x, false);
    if (bucketIndex === this.buckets.length || this.buckets[bucketIndex][index] !== x) return false;
    const bucket = this.buckets[bucketIndex];
    bucket.splice(index, 1);
    this.size -= 1;
    if (bucket.length === 0) this.buckets.splice(bucketIndex, 1); <span class="c">// never keep an empty bucket</span>
    else this.mergeSmall(bucketIndex);
    return true;
  }

  mergeSmall(bucketIndex) {
    <span class="c">// keeps any two neighbours holding more than load / 2 items between them</span>
    const small = this.load &gt;&gt; 1;
    const bucket = this.buckets[bucketIndex];
    const next = this.buckets[bucketIndex + 1];
    if (next !== undefined &amp;&amp; bucket.length + next.length &lt;= small) {
      bucket.push(...next);
      this.buckets.splice(bucketIndex + 1, 1);
      return;
    }
    const previous = this.buckets[bucketIndex - 1];
    if (previous !== undefined &amp;&amp; previous.length + bucket.length &lt;= small) {
      previous.push(...bucket);
      this.buckets.splice(bucketIndex, 1);
    }
  }

  has(x) {
    const [bucketIndex, index] = this.locate(x, false);
    return bucketIndex &lt; this.buckets.length &amp;&amp; this.buckets[bucketIndex][index] === x;
  }

  ceiling(x) {
    const [bucketIndex, index] = this.locate(x, false);
    return this.buckets[bucketIndex]?.[index];
  }

  higher(x) {
    const [bucketIndex, index] = this.locate(x, true);
    return this.buckets[bucketIndex]?.[index];
  }

  floor(x) {
    const [bucketIndex, index] = this.locate(x, true);
    return this.before(bucketIndex, index);
  }

  lower(x) {
    const [bucketIndex, index] = this.locate(x, false);
    return this.before(bucketIndex, index);
  }

  rank(x) {
    const [bucketIndex, index] = this.locate(x, false);
    let count = index;
    for (let i = 0; i &lt; bucketIndex; i++) count += this.buckets[i].length; <span class="c">// a scan over the buckets</span>
    return count;
  }

  at(index) {
    if (index &lt; 0 || index &gt;= this.size) return undefined;
    for (const bucket of this.buckets) {
      if (index &lt; bucket.length) return bucket[index];
      index -= bucket.length;
    }
  }
}</code></pre>
<p>
  <code>locate</code> is the one search everything shares: it returns the
  position of the first item at least <code>x</code>, or, with
  <code>strict</code> set, the first item greater than <code>x</code>. Then
  <code>ceiling</code> reads that position, <code>higher</code> reads the strict
  one, <code>floor</code> and <code>lower</code> step back from them, and
  <code>rank</code> adds up the buckets before it. <code>add</code> uses the
  strict position so equal items stay together, and
  <code>mergeSmall</code> is the clean-up that stops many removals from leaving a
  long list of nearly empty buckets: after a removal, a bucket and a neighbour
  that fit together within <code>load / 2</code> items are joined. That rule keeps
  every pair of neighbouring buckets holding more than <code>load / 2</code>
  items between them, so there are at most about 4n / load + 1 buckets.
</p>
<h4>Dry run: load 4, adding 5, 1, 9, 3, 7, 4, 8, 2, 6 and then removing four items</h4>
<table>
  <tr><th>Call</th><th>Buckets afterwards</th><th>Note</th></tr>
  <tr><td><code>add(5)</code></td><td>[5]</td><td>the first bucket is created</td></tr>
  <tr><td><code>add(1)</code></td><td>[1, 5]</td><td></td></tr>
  <tr><td><code>add(9)</code></td><td>[1, 5, 9]</td><td>larger than everything, so it is appended to the last bucket</td></tr>
  <tr><td><code>add(3)</code></td><td>[1, 3, 5, 9]</td><td>the bucket is full, with 4 items</td></tr>
  <tr><td><code>add(7)</code></td><td>[1, 3] [5, 7, 9]</td><td>5 items is over the load, so it splits into halves of 2 and 3</td></tr>
  <tr><td><code>add(4)</code></td><td>[1, 3] [4, 5, 7, 9]</td><td>4 belongs after 3, and the second bucket's last item 9 is not below 4</td></tr>
  <tr><td><code>add(8)</code></td><td>[1, 3] [4, 5] [7, 8, 9]</td><td>the second bucket overflowed and split</td></tr>
  <tr><td><code>add(2)</code></td><td>[1, 2, 3] [4, 5] [7, 8, 9]</td><td></td></tr>
  <tr><td><code>add(6)</code></td><td>[1, 2, 3] [4, 5] [6, 7, 8, 9]</td><td>6 goes after 5, into the bucket whose last item 9 is above it</td></tr>
  <tr><td><code>rank(7)</code></td><td>unchanged</td><td>position (third bucket, index 1): 3 + 2 items in the buckets before it, plus 1 = <b>6</b></td></tr>
  <tr><td><code>at(5)</code>, <code>floor(10)</code>, <code>ceiling(10)</code></td><td>unchanged</td><td>6 (skip 3, then 2, then index 0 of the third bucket), 9, <code>undefined</code></td></tr>
  <tr><td><code>remove(7)</code>, <code>remove(8)</code></td><td>[1, 2, 3] [4, 5] [6, 9]</td><td></td></tr>
  <tr><td><code>remove(9)</code></td><td>[1, 2, 3] [4, 5] [6]</td><td>joining [4, 5] and [6] would give 3 items, which is more than load / 2 = 2, so no merge</td></tr>
  <tr><td><code>remove(6)</code></td><td>[1, 2, 3] [4, 5]</td><td>the bucket became empty and was deleted</td></tr>
</table>
<p>
  How big should the bucket be? The table below is one run in Node 24 on an Apple
  M2 Pro, with 1,000,000 random integers inserted and then 100,000 calls to
  <code>rank</code> plus 100,000 to <code>at</code> (median of five runs; the
  treap row is the class from the last section for comparison). The machine will
  change every number. The pattern is the lesson: a small load makes updates
  cheap and queries slow, a large one the reverse, and the middle of the range is
  flat.
</p>
<table>
  <tr><th>Structure</th><th>Buckets at the end</th><th>1,000,000 inserts</th><th>100,000 rank and at calls</th></tr>
  <tr><td>BucketList, load 128</td><td>11,264</td><td>about 310 ms</td><td>about 1,560 ms</td></tr>
  <tr><td>BucketList, load 512</td><td>2,747</td><td>about 300 ms</td><td>about 400 ms</td></tr>
  <tr><td>BucketList, load 2,048</td><td>627</td><td>about 500 ms</td><td>about 150 ms</td></tr>
  <tr><td>BucketList, load 8,192</td><td>135</td><td>about 1,230 ms</td><td>about 50 ms</td></tr>
  <tr><td>Treap</td><td>(one tree)</td><td>about 1,950 ms</td><td>about 330 ms</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Bucket traps</span>
  <b>Empty buckets.</b> <code>locate</code> reads the last item of each bucket,
  and an empty bucket has none, so the comparison quietly goes wrong; delete a
  bucket the moment it empties. <b>Spreading a large array.</b>
  <code>bucket.push(...next)</code> passes every item as an argument; in Node 24
  a spread of 200,000 numbers threw a <code>RangeError</code>. Here it only ever
  spreads at most <code>load / 2</code> items, which is safe, but a load of
  hundreds of thousands would not be. <b>Strictness.</b> Using the non-strict
  position for <code>add</code> still works for a multiset, but mixing the two
  inside <code>floor</code> and <code>lower</code> gives answers that are one
  item off. <b>Values.</b> The code compares with <code>&lt;</code> and
  <code>===</code>, so it holds numbers (or strings), not pairs; arrays compared
  with <code>&lt;</code> are turned into strings first.
</div>


<h3>Offline: a Fenwick tree over compressed coordinates</h3>
<p>
  Sometimes the whole set of values is known before the first operation: the
  numbers come from the input array, or from prefix sums you can compute up
  front. Then you do not need a tree that finds places for new keys at all. Sort
  the distinct values once, number them 0 to m − 1 (this is <b>coordinate
  compression</b>), and keep one count per number in a Fenwick tree. A key's
  position in the sorted order is its slot, so the five primitives are:
</p>
<ul>
  <li><code>add(x)</code> and <code>remove(x)</code>: add +1 or −1 at the slot of <code>x</code>, found by binary search in the sorted values.</li>
  <li><code>rank(x)</code>: the prefix sum over the slots before the first value that is at least <code>x</code>. <code>x</code> need not be a stored value, so queries may use numbers outside the universe.</li>
  <li><code>countAtMost(x)</code>: the same, up to the last value that is at most <code>x</code>.</li>
  <li><code>at(i)</code>: the Fenwick binary descent from the
  <a href="/dsa/dsa-segment-fenwick-trees">Segment and Fenwick trees</a> chapter, which finds the smallest slot whose prefix count exceeds <code>i</code> in one O(log m) walk.</li>
</ul>
<p>
  The neighbour queries come from the formulas in the first section. Only
  <code>add</code> is restricted: a value that is not in the universe has no slot, so it
  throws a <code>RangeError</code> instead of corrupting a count.
</p>
<pre><code>class FenwickMultiset {
  constructor(universe) {
    <span class="c">// universe: every value that will ever be added, duplicates allowed</span>
    this.values = [...new Set(universe)].sort((a, b) =&gt; a - b);
    this.m = this.values.length;
    this.tree = new Int32Array(this.m + 1); <span class="c">// Fenwick tree over the counts, 1-based</span>
    this.counts = new Int32Array(this.m); <span class="c">// how many copies of each value</span>
    this.size = 0;
    this.top = this.m === 0 ? 0 : 1 &lt;&lt; (31 - Math.clz32(this.m)); <span class="c">// largest power of two &lt;= m</span>
  }

  lowerBound(x) {
    let lo = 0;
    let hi = this.m;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt; 1;
      if (this.values[mid] &lt; x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  upperBound(x) {
    let lo = 0;
    let hi = this.m;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt; 1;
      if (this.values[mid] &lt;= x) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  bump(x, by) {
    const slot = this.lowerBound(x);
    if (this.values[slot] !== x) throw new RangeError(\`\${x} is not in the universe\`);
    this.counts[slot] += by;
    this.size += by;
    for (let i = slot + 1; i &lt;= this.m; i += i &amp; -i) this.tree[i] += by; <span class="c">// the usual Fenwick update</span>
  }

  add(x) {
    this.bump(x, 1);
  }

  remove(x) {
    const slot = this.lowerBound(x);
    if (this.values[slot] !== x || this.counts[slot] === 0) return false;
    this.bump(x, -1);
    return true;
  }

  prefix(slots) {
    <span class="c">// how many items sit in the first slots compressed positions</span>
    let total = 0;
    for (let i = slots; i &gt; 0; i -= i &amp; -i) total += this.tree[i];
    return total;
  }

  rank(x) {
    return this.prefix(this.lowerBound(x)); <span class="c">// x need not be in the universe</span>
  }

  countAtMost(x) {
    return this.prefix(this.upperBound(x));
  }

  at(index) {
    if (index &lt; 0 || index &gt;= this.size) return undefined;
    let position = 0; <span class="c">// descend the tree: skip every block whose total is still too small</span>
    let remaining = index + 1;
    for (let step = this.top; step &gt; 0; step &gt;&gt;= 1) {
      const next = position + step;
      if (next &lt;= this.m &amp;&amp; this.tree[next] &lt; remaining) {
        position = next;
        remaining -= this.tree[next];
      }
    }
    return this.values[position]; <span class="c">// position is the 1-based slot of the last block skipped</span>
  }

  floor(x) {
    return this.at(this.countAtMost(x) - 1);
  }

  lower(x) {
    return this.at(this.rank(x) - 1);
  }

  ceiling(x) {
    return this.at(this.rank(x));
  }

  higher(x) {
    return this.at(this.countAtMost(x));
  }
}</code></pre>
<h4>Dry run: universe [3, 5, 5, 8, 10, 12], then add 5, 5, 12, 3, 8</h4>
<p>
  The sorted distinct values are <code>[3, 5, 8, 10, 12]</code>, so
  <code>m = 5</code> and <code>top = 4</code>. After the five adds the counts per
  slot are <code>[1, 2, 1, 0, 1]</code> and the Fenwick array (positions 1 to 5)
  is <code>[1, 3, 1, 4, 1]</code>: position 2 covers slots 1 and 2 (1 + 2 = 3),
  and position 4 covers all of slots 1 to 4 (1 + 2 + 1 + 0 = 4). The multiset in
  order is 3, 5, 5, 8, 12.
</p>
<table>
  <tr><th>Call</th><th>Work</th><th>Result</th></tr>
  <tr><td><code>rank(8)</code></td><td>the first value ≥ 8 is at slot 2 (0-based), so take the prefix of 2 slots: 1 + 2</td><td><b>3</b></td></tr>
  <tr><td rowspan="3"><code>at(3)</code></td><td>remaining = 4. Step 4: position 4's block holds 4, which is not below 4, so do not jump</td><td>position 0</td></tr>
  <tr><td>Step 2: position 2's block holds 3, which is below 4, so jump; remaining = 4 − 3 = 1</td><td>position 2</td></tr>
  <tr><td>Step 1: position 3's block holds 1, which is not below 1, so stay. The answer is the value at slot 2</td><td><b>8</b></td></tr>
  <tr><td><code>floor(9)</code></td><td><code>countAtMost(9)</code> = 4 (3, 5, 5, 8), so <code>at(3)</code></td><td><b>8</b></td></tr>
  <tr><td><code>ceiling(9)</code></td><td><code>rank(9)</code> = 4, so <code>at(4)</code></td><td><b>12</b></td></tr>
  <tr><td><code>lower(3)</code></td><td><code>rank(3)</code> = 0, so <code>at(−1)</code></td><td><code>undefined</code></td></tr>
</table>
<p>
  Each operation is O(log m): one binary search over the values and one
  Fenwick walk, after an O(m log m) sort. Memory is a few arrays of length
  m, with no per-key objects, and in the insert timings below it has the fastest
  inserts: 1,000,000 of them took about 0.2 s, not counting that sort. The price is the
  limitation in its name. If the next value depends on an earlier answer (an
  online stream, or a problem where you insert what you just computed), you
  cannot compress in advance and you need the treap or the buckets. If you only
  ever <em>query</em> a number, as in the bounds of a range query, it still need
  not be in the universe; only the numbers you <em>add</em> must be.
</p>
<div class="warn">
  <span class="ttl">⚠ Fenwick-set traps</span>
  <b>Missing a value.</b> For prefix-sum problems the universe must contain every
  prefix sum you will add, including the starting 0. <b>Duplicates in the
  universe.</b> They are removed by the <code>Set</code> in the constructor; if
  you build slots by hand, equal values must share one slot. <b>Off-by-one slots.</b>
  The Fenwick tree is 1-based and the sorted values are 0-based:
  <code>slot + 1</code> on the way in, and the descent's final
  <code>position</code> is already the 0-based slot of the answer. <b>Removing a
  missing key.</b> The check against <code>counts</code> is what stops a
  count from going negative.
</div>

<h3>Interval maps: My Calendar I, II and III</h3>
<p>
  A set of disjoint intervals, kept in a map from start to end, is an ordered
  structure, and a handful of problems reduce to asking it for neighbours. The
  key fact: <em>if the intervals are disjoint, the only one that can reach over a
  point <code>x</code> is the one with the largest start at or before
  <code>x</code>, which is <code>floor(x)</code></em>. An earlier interval ends
  before that one starts, so it cannot reach <code>x</code> either. And the only
  one that can start inside a range is found by <code>ceiling</code>, and then
  by repeating the question.
</p>
<h4>My Calendar I</h4>
<p>
  <code>book(start, end)</code> accepts the half-open range
  <code>[start, end)</code> if it overlaps no earlier booking. The
  <a href="/dsa/dsa-intervals">Intervals</a> chapter shows the O(k) scan. With the
  bookings in an ordered map keyed by start, only two of them can overlap the new
  one. The booking with the largest start at or before <code>start</code> overlaps
  if it ends after <code>start</code>. The booking with the smallest start at or
  after <code>start</code> overlaps if it begins before <code>end</code>. Any
  other overlapping booking would have to be one of those two: an overlapping
  booking that starts at or before <code>start</code> and is not the floor would
  have to end after the floor's start, and so would overlap the floor too, which
  disjointness forbids. One that starts after <code>start</code> and before
  <code>end</code> is at or after the ceiling, which therefore starts before
  <code>end</code> as well.
</p>
<pre><code>class MyCalendar {
  constructor() {
    this.ends = new Treap();
  }

  book(start, end) {
    <span class="c">// bookings are half-open [start, end), keyed by start, with the end as the value</span>
    const before = this.ends.floor(start); <span class="c">// the last booking that starts at or before start</span>
    if (before !== undefined &amp;&amp; this.ends.get(before) &gt; start) return false; <span class="c">// it runs past start</span>
    const after = this.ends.ceiling(start); <span class="c">// the first booking that starts at or after start</span>
    if (after !== undefined &amp;&amp; after &lt; end) return false; <span class="c">// it begins before the new one ends</span>
    this.ends.set(start, end);
    return true;
  }
}</code></pre>
<h4>Dry run: book(10, 20), (15, 25), (20, 30), (5, 10), (8, 12)</h4>
<table>
  <tr><th>Call</th><th>floor(start) and its end</th><th>ceiling(start)</th><th>Verdict</th></tr>
  <tr><td>book(10, 20)</td><td>none</td><td>none</td><td>true</td></tr>
  <tr><td>book(15, 25)</td><td>10, ends at 20, and 20 &gt; 15</td><td>none</td><td>false: it overlaps [10, 20)</td></tr>
  <tr><td>book(20, 30)</td><td>10, ends at 20, and 20 &gt; 20 is false</td><td>none</td><td>true: a booking that ends at 20 does not include 20</td></tr>
  <tr><td>book(5, 10)</td><td>none</td><td>10, and 10 &lt; 10 is false</td><td>true: it ends where the next begins</td></tr>
  <tr><td>book(8, 12)</td><td>5, ends at 10, and 10 &gt; 8</td><td>10</td><td>false: it overlaps [5, 10)</td></tr>
</table>
<p class="sub">
  A booking costs two descents plus the insert, O(log n) expected, against O(n)
  for the scan; n bookings cost O(n log n) in total instead of O(n²). Note the
  strictness: with half-open ranges, "ends exactly where the other starts" is not
  an overlap, which is why the tests are <code>&gt;</code> and
  <code>&lt;</code>, not <code>&gt;=</code> and <code>&lt;=</code>.
</p>
<h4>My Calendar II and III: boundary counts in order</h4>
<p>
  My Calendar II allows a double booking but refuses a triple one. My Calendar
  III accepts everything and, after each booking, reports the largest number of
  bookings that overlap at one moment. Disjoint intervals no longer describe the
  state, since bookings overlap. Store a different set of facts: a map from a
  time to the number of bookings that <em>start</em> there minus the number that
  <em>end</em> there. Walking the map in key order and keeping a running total
  gives the number of bookings active just after each boundary, which is the
  sweep line from the Intervals chapter. The ordered map's contribution is that
  the keys are already sorted, with no sort per call.
</p>
<pre><code>class MyCalendarTwo {
  constructor() {
    this.delta = new Treap(); <span class="c">// time -&gt; how many bookings start there minus how many end there</span>
  }

  bump(time, by) {
    const next = (this.delta.get(time) ?? 0) + by;
    if (next === 0) this.delta.remove(time); <span class="c">// keep the map free of zero entries</span>
    else this.delta.set(time, next);
  }

  book(start, end) {
    this.bump(start, 1);
    this.bump(end, -1);
    let active = 0;
    for (const [, change] of this.delta.entries()) { <span class="c">// in time order, with no sort</span>
      active += change;
      if (active &gt;= 3) {
        this.bump(start, -1); <span class="c">// undo the tentative booking</span>
        this.bump(end, 1);
        return false;
      }
    }
    return true;
  }
}

class MyCalendarThree {
  constructor() {
    this.delta = new Treap();
  }

  book(start, end) {
    this.delta.set(start, (this.delta.get(start) ?? 0) + 1);
    this.delta.set(end, (this.delta.get(end) ?? 0) - 1);
    let active = 0;
    let most = 0;
    for (const [, change] of this.delta.entries()) {
      active += change;
      most = Math.max(most, active);
    }
    return most;
  }
}</code></pre>
<h4>Dry run: the six bookings (10, 20), (50, 60), (10, 40), (5, 15), (5, 10), (25, 55) in My Calendar II</h4>
<table>
  <tr><th>Call</th><th>Running total at each boundary, in time order</th><th>Verdict</th><th>Map after the call (time: change)</th></tr>
  <tr><td>book(10, 20)</td><td>10: 1, 20: 0</td><td>true</td><td>10: +1, 20: −1</td></tr>
  <tr><td>book(50, 60)</td><td>10: 1, 20: 0, 50: 1, 60: 0</td><td>true</td><td>adds 50: +1, 60: −1</td></tr>
  <tr><td>book(10, 40)</td><td>10: 2, 20: 1, 40: 0, 50: 1, 60: 0</td><td>true</td><td>10: +2, 20: −1, 40: −1, 50: +1, 60: −1</td></tr>
  <tr><td>book(5, 15)</td><td>5: 1, <b>10: 3</b>, 15: 2, 20: 1, 40: 0, 50: 1, 60: 0</td><td><b>false</b>: the total reaches 3, so both changes are undone</td><td>unchanged</td></tr>
  <tr><td>book(5, 10)</td><td>5: 1, 10: 2, 20: 1, 40: 0, 50: 1, 60: 0</td><td>true</td><td>adds 5: +1; 10 goes from +2 to +1</td></tr>
  <tr><td>book(25, 55)</td><td>5: 1, 10: 2, 20: 1, 25: 2, 40: 1, 50: 2, 55: 1, 60: 0</td><td>true</td><td>adds 25: +1, 55: −1</td></tr>
</table>
<p class="sub">
  In My Calendar III the same six bookings report 1, 1, 2, 3, 3, 3: the highest
  total ever seen in the walk. Each call walks the whole map, so it costs O(n)
  for n boundaries; the ordered map saves the sort, nothing more, so this is
  honest linear time per booking, the same as a simple list. To get O(log n) there
  are two routes. One is the dynamic segment tree in the
  <a href="/dsa/dsa-segment-fenwick-trees">Segment and Fenwick trees</a> chapter.
  The other uses the treap itself: let <code>refresh</code> also keep, for every
  subtree, the sum of its changes and the highest running total reached inside it.
  A node's best is the larger of its left subtree's best, the left sum plus its own
  change, and that plus the right subtree's best. Key the nodes by the pair
  (time, change), so that at one moment the −1 of an ending booking sorts before
  the +1 of a starting one, and the answer to III is the root's best after each
  insert. It is not worth writing out unless you are asked, but it shows what
  <code>refresh</code> is for: every extra field is recomputed from the children there.
</p>

<h3>Intervals that merge as they arrive</h3>
<p>
  Two classic problems keep a set of <em>merged</em> intervals that changes over
  time. The invariant is the same in both: the stored intervals are disjoint and
  do not touch, keyed by start, so every question is "look at the floor, then walk
  forward with ceiling".
</p>
<h4>Data stream as disjoint intervals</h4>
<p>
  Numbers arrive one at a time with <code>addNum(value)</code>, and
  <code>getIntervals()</code> returns the merged closed intervals so far, sorted:
  after 1, 3, 7, 2, 6 the answer is <code>[[1, 3], [6, 7]]</code>. A new value does
  one of five things: it is already covered, it extends the interval on its left,
  it extends the interval on its right, it joins the two (when it fills a gap of
  exactly one), or it stands alone. The floor of <code>value</code> is the only
  interval that can cover it or end right before it. The only interval that can
  begin right after it is the one with the smallest start above
  <code>value</code>, and it matters only if that start is exactly
  <code>value + 1</code>.
</p>
<pre><code>class SummaryRanges {
  constructor() {
    this.ends = new Treap();
  }

  addNum(value) {
    <span class="c">// closed intervals [start, end] that are disjoint and never touch, keyed by start</span>
    let start = value;
    let end = value;
    const left = this.ends.floor(value);
    if (left !== undefined) {
      const leftEnd = this.ends.get(left);
      if (leftEnd &gt;= value) return; <span class="c">// already covered</span>
      if (leftEnd === value - 1) start = left; <span class="c">// value extends the interval on its left</span>
    }
    const right = this.ends.higher(value);
    if (right === value + 1) { <span class="c">// an interval begins right after value: absorb it</span>
      end = this.ends.get(right);
      this.ends.remove(right);
    }
    this.ends.set(start, end);
  }

  getIntervals() {
    return [...this.ends.entries()];
  }
}</code></pre>
<h4>Dry run: addNum 1, 3, 7, 2, 6</h4>
<table>
  <tr><th>addNum</th><th>floor and its end</th><th>higher</th><th>Intervals afterwards</th></tr>
  <tr><td>1</td><td>none</td><td>none</td><td>[1, 1]</td></tr>
  <tr><td>3</td><td>1, ends at 1; 1 ≠ 3 − 1, so no merge</td><td>none</td><td>[1, 1] [3, 3]</td></tr>
  <tr><td>7</td><td>3, ends at 3; no merge</td><td>none</td><td>[1, 1] [3, 3] [7, 7]</td></tr>
  <tr><td>2</td><td>1, ends at 1 = 2 − 1: extend, so start = 1</td><td>3 = 2 + 1: absorb it, end = 3 and remove key 3</td><td>[1, 3] [7, 7]</td></tr>
  <tr><td>6</td><td>3, ends at 3; no merge</td><td>7 = 6 + 1: absorb it, end = 7</td><td>[1, 3] [6, 7]</td></tr>
</table>
<p class="sub">
  <code>addNum</code> costs O(log n) expected; <code>getIntervals</code> costs
  O(k) for k intervals, the size of its answer. If numbers repeat, nothing
  changes, which is what the early <code>return</code> does. The merging shortens the map, so the
  interval count never exceeds the count of distinct numbers.
</p>
<h4>Range module: add, remove and query a range</h4>
<p>
  The Range Module tracks half-open ranges <code>[left, right)</code> with
  <code>addRange</code>, <code>removeRange</code> and
  <code>queryRange</code>, which asks whether every number in the range is
  tracked. Keep disjoint, non-touching intervals keyed by start. <code>queryRange</code>
  is one floor: the only interval that can cover <code>left</code> starts at or before
  it, and it covers the whole range only if it also reaches <code>right</code>.
  <code>addRange</code> merges: take the floor if it overlaps or touches
  <code>left</code>, then absorb every interval that starts inside the growing
  range, asking <code>ceiling</code> again after each removal.
  <code>removeRange</code> cuts: the floor may need to be shortened, and it may
  also stick out past <code>right</code>, in which case its tail survives as a new
  interval starting at <code>right</code>; then every interval that starts inside
  <code>[left, right)</code> is removed, again keeping a tail if it sticks out.
</p>
<pre><code>class RangeModule {
  constructor() {
    this.ends = new Treap();
  }

  addRange(left, right) {
    <span class="c">// half-open [start, end), disjoint, and never touching, keyed by start</span>
    let start = left;
    let end = right;
    const first = this.ends.floor(left);
    if (first !== undefined &amp;&amp; this.ends.get(first) &gt;= left) { <span class="c">// overlaps or touches on the left</span>
      start = first;
      end = Math.max(end, this.ends.get(first));
      this.ends.remove(first);
    }
    for (let next = this.ends.ceiling(start); next !== undefined &amp;&amp; next &lt;= end; next = this.ends.ceiling(start)) {
      end = Math.max(end, this.ends.get(next)); <span class="c">// absorb every interval that starts inside [start, end]</span>
      this.ends.remove(next);
    }
    this.ends.set(start, end);
  }

  queryRange(left, right) {
    const start = this.ends.floor(left); <span class="c">// only the interval starting at or before left can cover it</span>
    return start !== undefined &amp;&amp; this.ends.get(start) &gt;= right;
  }

  removeRange(left, right) {
    const first = this.ends.floor(left);
    if (first !== undefined &amp;&amp; this.ends.get(first) &gt; left) {
      const firstEnd = this.ends.get(first);
      if (first &lt; left) this.ends.set(first, left); <span class="c">// keep the part before left</span>
      else this.ends.remove(first);
      if (firstEnd &gt; right) this.ends.set(right, firstEnd); <span class="c">// keep the part from right on</span>
    }
    for (let next = this.ends.ceiling(left); next !== undefined &amp;&amp; next &lt; right; next = this.ends.ceiling(left)) {
      const nextEnd = this.ends.get(next);
      this.ends.remove(next); <span class="c">// it starts inside the removed range</span>
      if (nextEnd &gt; right) this.ends.set(right, nextEnd);
    }
  }
}</code></pre>
<h4>Dry run: the stored intervals after each call</h4>
<table>
  <tr><th>Call</th><th>What happens</th><th>Stored intervals</th></tr>
  <tr><td><code>addRange(10, 20)</code></td><td>no floor, nothing to absorb</td><td>[10, 20)</td></tr>
  <tr><td><code>removeRange(14, 16)</code></td><td>floor 10 ends at 20 &gt; 14: shorten it to [10, 14), and since 20 &gt; 16 keep the tail [16, 20)</td><td>[10, 14) [16, 20)</td></tr>
  <tr><td><code>queryRange(10, 14)</code></td><td>floor 10 ends at 14, and 14 ≥ 14</td><td><b>true</b></td></tr>
  <tr><td><code>queryRange(13, 15)</code></td><td>floor 10 ends at 14, and 14 ≥ 15 is false</td><td><b>false</b></td></tr>
  <tr><td><code>queryRange(16, 17)</code></td><td>floor 16 ends at 20, and 20 ≥ 17</td><td><b>true</b></td></tr>
  <tr><td><code>addRange(12, 18)</code></td><td>floor 10 ends at 14 ≥ 12: take it (start 10, end 18) and remove it; ceiling(10) is 16, which is ≤ 18: absorb it, end = 20</td><td>[10, 20)</td></tr>
  <tr><td><code>removeRange(0, 11)</code></td><td>no floor; ceiling(0) is 10 &lt; 11: remove it and keep its tail [11, 20)</td><td>[11, 20)</td></tr>
  <tr><td><code>addRange(30, 40)</code></td><td>floor 11 ends at 20 &lt; 30: no merge</td><td>[11, 20) [30, 40)</td></tr>
  <tr><td><code>addRange(20, 30)</code></td><td>floor 11 ends at 20 ≥ 20 (touching): take it; ceiling(11) is 30 ≤ 30: absorb it, end = 40</td><td>[11, 40)</td></tr>
</table>
<p class="sub">
  Each loop iteration deletes an interval, and every call creates at most two new
  ones, so the loop work over a whole sequence of calls is bounded by twice the
  number of calls, and every call costs O(log n) expected amortised. The interval count never exceeds the number of calls made so far.
</p>
<div class="warn">
  <span class="ttl">⚠ Interval-map traps</span>
  <b>Closed versus half-open.</b> In the data stream, touching means "differs by
  one" (<code>end === value − 1</code>); in the half-open range module, touching
  means "equal" (<code>end === left</code>). Mixing them leaves intervals that
  could have merged, or merges ones that should stay apart. <b>The floor alone is
  not enough.</b> It finds the interval at or before <code>left</code>, but
  intervals that start inside <code>[left, right)</code> are found by repeating
  <code>ceiling</code>. <b>Loops that mutate.</b> The loops here ask for the next
  key after each removal instead of holding an iterator across it. <b>The
  tail.</b> When a removal cuts the middle of an interval, both halves must
  survive; forgetting the right half is the usual bug. <b>Query on a non-merged
  set.</b> <code>queryRange</code> is correct only because adjacent intervals are
  always merged; with touching intervals left apart, a range spanning both would
  be refused.
</div>

<h3>Exam room: a set of seats and a set of gaps</h3>
<p>
  <code>n</code> seats stand in a row. <code>seat()</code> places a student in the
  seat that maximises the distance to the closest student, with ties going to the
  lowest seat number (an empty room gives seat 0), and returns it.
  <code>leave(p)</code> removes the student in seat <code>p</code>. The seat count
  can be up to 10<sup>9</sup> with up to 10<sup>4</sup> calls, so scanning the row is out.
</p>
<p>
  A first solution keeps the occupied seats in an ordered set and, on
  <code>seat()</code>, walks all of them in order, measuring the gap before each
  one. That is O(k) per call for k students, which is acceptable at ten thousand
  calls and is the answer to give first. The faster idea is that the best seat only
  changes where something changed. <code>seat()</code> splits one gap into two,
  <code>leave()</code> joins two gaps into one, and every other gap stays exactly as
  it was. So store the <em>gaps</em> in a second ordered set whose order is "best
  first": larger distance first, and the lower seat on a tie. The first element is
  the answer to <code>seat()</code>, and every update is a few O(log k) operations.
</p>
<p>
  A gap sits between two occupied seats <code>a</code> and <code>b</code>, where
  <code>−1</code> stands for the wall before seat 0 and <code>n</code> for the
  wall after the last seat. Its best seat and distance:
</p>
<table>
  <tr><th>Gap</th><th>Seat</th><th>Distance to the closest student</th><th>Stored when</th></tr>
  <tr><td>between two students, <code>a</code> and <code>b</code></td><td><code>a + ⌊(b − a) / 2⌋</code>, the lower middle</td><td><code>⌊(b − a) / 2⌋</code></td><td><code>b − a ≥ 2</code>, that is, a free seat exists</td></tr>
  <tr><td>against the left wall, <code>(−1, b)</code></td><td>0</td><td><code>b</code></td><td><code>b &gt; 0</code></td></tr>
  <tr><td>against the right wall, <code>(a, n)</code></td><td><code>n − 1</code></td><td><code>n − 1 − a</code></td><td><code>a &lt; n − 1</code></td></tr>
  <tr><td>the empty row, <code>(−1, n)</code></td><td>0</td><td>set to <code>n</code>, larger than any real distance, so it never ties</td><td>always, at the start</td></tr>
</table>
<p>
  The gap keys are objects, so this is where the comparator earns its keep:
  <code>(x, y) =&gt; y.distance − x.distance || x.seat − y.seat</code>. Two
  different gaps never share a best seat, so the comparator returns 0 only for the
  same gap, and <code>remove</code> can find a gap by rebuilding it from
  <code>a</code> and <code>b</code>, which always gives the same distance and seat.
</p>
<pre><code>class ExamRoom {
  constructor(n) {
    this.n = n;
    this.seats = new Treap(); <span class="c">// occupied seats</span>
    this.gaps = new Treap((x, y) =&gt; y.distance - x.distance || x.seat - y.seat); <span class="c">// best gap first, ties to the lower seat</span>
    this.addGap(-1, n);
  }

  gapBetween(a, b) {
    <span class="c">// the gap between occupied seats a and b (-1 and n stand for the walls), or null if no seat is free in it</span>
    if (a === -1 &amp;&amp; b === this.n) return { a, b, seat: 0, distance: this.n };
    if (a === -1) return b &gt; 0 ? { a, b, seat: 0, distance: b } : null;
    if (b === this.n) return a &lt; this.n - 1 ? { a, b, seat: this.n - 1, distance: this.n - 1 - a } : null;
    return b - a &gt;= 2 ? { a, b, seat: a + ((b - a) &gt;&gt; 1), distance: (b - a) &gt;&gt; 1 } : null;
  }

  addGap(a, b) {
    const gap = this.gapBetween(a, b);
    if (gap !== null) this.gaps.add(gap);
  }

  dropGap(a, b) {
    const gap = this.gapBetween(a, b);
    if (gap !== null) this.gaps.remove(gap);
  }

  seat() {
    const { a, b, seat } = this.gaps.at(0); <span class="c">// the best gap is the smallest key</span>
    this.dropGap(a, b);
    this.seats.add(seat);
    this.addGap(a, seat);
    this.addGap(seat, b);
    return seat;
  }

  leave(p) {
    const a = this.seats.lower(p) ?? -1;
    const b = this.seats.higher(p) ?? this.n;
    this.dropGap(a, p); <span class="c">// the two gaps next to p disappear...</span>
    this.dropGap(p, b);
    this.seats.remove(p);
    this.addGap(a, b); <span class="c">// ...and one wider gap replaces them</span>
  }
}</code></pre>
<h4>Dry run: n = 10, then seat, seat, seat, seat, leave(4), seat</h4>
<table>
  <tr><th>Call</th><th>Gaps stored, best first (a, b → seat, distance)</th><th>Returns</th></tr>
  <tr><td>start</td><td>(−1, 10 → 0, 10)</td><td></td></tr>
  <tr><td><code>seat()</code></td><td>(0, 10 → 9, 9)</td><td>0</td></tr>
  <tr><td><code>seat()</code></td><td>(0, 9 → 4, 4)</td><td>9</td></tr>
  <tr><td><code>seat()</code></td><td>(0, 4 → 2, 2) and (4, 9 → 6, 2)</td><td>4</td></tr>
  <tr><td><code>seat()</code></td><td>(4, 9 → 6, 2), then (0, 2 → 1, 1) and (2, 4 → 3, 1)</td><td>2: the two best gaps tie at 2 and the lower seat wins</td></tr>
  <tr><td><code>leave(4)</code></td><td>(2, 9 → 5, 3), then (0, 2 → 1, 1)</td><td>the gaps (2, 4) and (4, 9) joined into (2, 9)</td></tr>
  <tr><td><code>seat()</code></td><td>(5, 9 → 7, 2), then (0, 2 → 1, 1) and (2, 5 → 3, 1)</td><td>5</td></tr>
</table>
<p class="sub">
  After the second <code>seat()</code> the students are at 0 and 9, so the single
  gap (0, 9) has its best seat at 0 + ⌊9 / 2⌋ = 4. Each call is a handful of
  O(log k) operations on two treaps, against O(k) for the scan. The brute-force
  check I ran on random sequences compared every returned seat with a direct
  search over all free seats.
</p>
<div class="warn">
  <span class="ttl">⚠ Exam-room traps</span>
  <b>The walls are different.</b> A gap at a wall has no student on one side, so
  its distance is the whole gap, not half of it. <b>Ties.</b> The lower middle
  <code>a + ((b − a) &gt;&gt; 1)</code> rounds toward the lower seat, which is the
  tie rule; and between equal distances the comparator must fall back to the seat.
  <b>Zero-width gaps.</b> Two neighbouring seats leave no free seat between them;
  storing such a gap would make <code>seat()</code> return an occupied seat.
  <b>Removing an unrelated key.</b> <code>dropGap</code> rebuilds the key from
  <code>(a, b)</code>; if the key were built by a different formula than the one
  used when it was stored, the removal would silently do nothing and the gap would
  linger.
</div>


<h3>Sliding window median</h3>
<p>
  Given <code>nums</code> and a window size <code>k</code>, return the median of
  every window of <code>k</code> consecutive numbers. Sorting each window costs
  O(k log k), so the whole thing costs O(n k log k). But consecutive windows
  differ by one number leaving and one entering. Keep the window's numbers in an
  ordered multiset: add the new number, remove the one that left, and read the
  middle with <code>at</code>. The median of an odd window is
  <code>at((k − 1) / 2)</code>; of an even window it is the average of
  <code>at(k / 2 − 1)</code> and <code>at(k / 2)</code>. The two indices
  <code>(k − 1) &gt;&gt; 1</code> and <code>k &gt;&gt; 1</code> cover both cases,
  because for odd k they are the same position, so one formula averages a number
  with itself.
</p>
<pre><code>function medianSlidingWindow(nums, k) {
  const window = new Treap();
  const medians = [];
  for (let i = 0; i &lt; nums.length; i++) {
    window.add(nums[i]); <span class="c">// the new number enters</span>
    if (i &gt;= k) window.remove(nums[i - k]); <span class="c">// the number that fell out of the window leaves</span>
    if (i &gt;= k - 1) {
      const low = window.at((k - 1) &gt;&gt; 1); <span class="c">// the same element as high when k is odd</span>
      const high = window.at(k &gt;&gt; 1);
      medians.push((low + high) / 2);
    }
  }
  return medians;
}</code></pre>
<h4>Dry run: [1, 3, −1, −3, 5, 3, 6, 7] with k = 3</h4>
<table>
  <tr><th>i</th><th>Enters</th><th>Leaves</th><th>Window in sorted order</th><th>Median</th></tr>
  <tr><td>0</td><td>1</td><td>—</td><td>[1]</td><td>(window not full)</td></tr>
  <tr><td>1</td><td>3</td><td>—</td><td>[1, 3]</td><td>(window not full)</td></tr>
  <tr><td>2</td><td>−1</td><td>—</td><td>[−1, 1, 3]</td><td><b>1</b></td></tr>
  <tr><td>3</td><td>−3</td><td>1</td><td>[−3, −1, 3]</td><td><b>−1</b></td></tr>
  <tr><td>4</td><td>5</td><td>3</td><td>[−3, −1, 5]</td><td><b>−1</b></td></tr>
  <tr><td>5</td><td>3</td><td>−1</td><td>[−3, 3, 5]</td><td><b>3</b></td></tr>
  <tr><td>6</td><td>6</td><td>−3</td><td>[3, 5, 6]</td><td><b>5</b></td></tr>
  <tr><td>7</td><td>7</td><td>5</td><td>[3, 6, 7]</td><td><b>6</b></td></tr>
</table>
<p class="sub">
  The answer is <code>[1, −1, −1, 3, 5, 6]</code>. For <code>k = 2</code> on
  <code>[1, 4, 2, 3]</code> the answers are 2.5, 3 and 2.5. The cost is O(n log k)
  expected with the treap: n additions and n removals on a set of at most
  k + 1 items. The window briefly holds k + 1 numbers because the new one is added
  before the old one is removed, which is harmless.
</p>
<p>
  There are three other ways, and which is best depends on k. A <b>sorted
  array</b> costs O(k) per slide for the shift, O(nk) overall, but with a small
  constant. On 100,000 random numbers, one run in Node 24 took about 19 ms
  (sorted array) against about 83 ms (treap) for k = 100, about 90 ms against
  about 150 ms for k = 5,000, and about 630 ms against about 190 ms for
  k = 50,000. The array wins while the window is small. <b>Two heaps</b> with
  lazy deletion (a max-heap for the lower half, a min-heap for the upper half, a
  count of numbers waiting to be thrown away, and a rebalance after every step)
  also give O(n log n) in the worst case, because buried dead entries can pile
  up and the heaps are bounded by n, not k, and the
  <a href="/dsa/dsa-heaps-priority-queues">Heaps and priority queues</a> chapter
  covers the two-heap median and lazy deletion, but the bookkeeping for stale
  entries is the error-prone part. A <b>Fenwick set</b> over the compressed values is cheaper per operation
  still, since all the numbers are known up front.
</p>
<div class="warn">
  <span class="ttl">⚠ Median traps</span>
  <b>Remove by value, not by position.</b> The structure holds values, not
  indices, and with duplicates it removes one copy of that value, which is what
  is wanted. <b>Averaging.</b> <code>(low + high) / 2</code> is exact for
  integers well beyond 2<sup>31</sup>, because JavaScript numbers are doubles; do not
  write <code>&gt;&gt; 1</code> on the sum, which truncates to 32 bits and drops the
  half. <b>The window is not full yet.</b> Do not read a median before
  <code>i = k − 1</code>. <b>Window larger than the array</b> gives an empty result,
  not an error.
</div>

<h3>Contains duplicate III: an ordered set, or buckets</h3>
<p>
  Is there a pair of different indices <code>i</code> and <code>j</code> with
  <code>|i − j| ≤ indexDiff</code> and
  <code>|nums[i] − nums[j]| ≤ valueDiff</code>? Compare every number with the
  previous <code>indexDiff</code>: O(n · indexDiff). Better: keep the previous
  <code>indexDiff</code> numbers in an ordered set. A close-enough partner for
  <code>x</code> exists exactly when some stored value lies in
  <code>[x − valueDiff, x + valueDiff]</code>, and the smallest stored value that
  is at least <code>x − valueDiff</code> is <code>ceiling(x − valueDiff)</code>.
  If even that one is above <code>x + valueDiff</code>, none exists. Then add
  <code>x</code>, and once the set holds more than <code>indexDiff</code>
  numbers, remove the oldest. Time: O(n log indexDiff).
</p>
<pre><code>function containsNearbyAlmostDuplicate(nums, indexDiff, valueDiff) {
  const window = new Treap();
  for (let i = 0; i &lt; nums.length; i++) {
    const candidate = window.ceiling(nums[i] - valueDiff); <span class="c">// the smallest value that is close enough from below</span>
    if (candidate !== undefined &amp;&amp; candidate &lt;= nums[i] + valueDiff) return true;
    window.add(nums[i]);
    if (window.size &gt; indexDiff) window.remove(nums[i - indexDiff]); <span class="c">// keep the last indexDiff numbers</span>
  }
  return false;
}</code></pre>
<h4>Dry run: [1, 5, 9, 1, 5, 9], indexDiff = 2, valueDiff = 3</h4>
<table>
  <tr><th>i</th><th>x</th><th>Window before</th><th>ceiling(x − 3)</th><th>Close enough? (≤ x + 3)</th><th>Window after</th></tr>
  <tr><td>0</td><td>1</td><td>{}</td><td>none</td><td>no</td><td>{1}</td></tr>
  <tr><td>1</td><td>5</td><td>{1}</td><td>none (nothing ≥ 2)</td><td>no</td><td>{1, 5}</td></tr>
  <tr><td>2</td><td>9</td><td>{1, 5}</td><td>none (nothing ≥ 6)</td><td>no</td><td>{5, 9} (1 removed)</td></tr>
  <tr><td>3</td><td>1</td><td>{5, 9}</td><td>5</td><td>5 ≤ 4? no</td><td>{1, 9} (5 removed)</td></tr>
  <tr><td>4</td><td>5</td><td>{1, 9}</td><td>9</td><td>9 ≤ 8? no</td><td>{1, 5} (9 removed)</td></tr>
  <tr><td>5</td><td>9</td><td>{1, 5}</td><td>none (nothing ≥ 6)</td><td>no</td><td>{5, 9}</td></tr>
</table>
<p class="sub">
  The loop ends with no pair, so the answer is <code>false</code>. Every
  near miss is a difference of exactly 4, one more than <code>valueDiff</code>.
</p>
<h4>The bucket trick</h4>
<p>
  This question asks only <em>whether</em> a close pair exists, not for the
  nearest value, a count or a median, and that permits something cheaper than an
  ordered set. Cut the number line into buckets of width
  <code>valueDiff + 1</code>, so bucket <code>b</code> holds the values from
  <code>b · w</code> to <code>b · w + w − 1</code>. Three facts finish it:
</p>
<ul>
  <li>Two values in the <b>same bucket</b> differ by at most <code>w − 1 = valueDiff</code>, so they are a match.</li>
  <li>Values in buckets that are <b>two or more apart</b> differ by at least <code>w + 1</code>, which is more than <code>valueDiff</code>, so they are never a match.</li>
  <li>Values in <b>adjacent buckets</b> might match, and must be checked by their actual difference.</li>
</ul>
<p>
  So the window is a hash map from bucket number to the one value in it. If a
  bucket would receive a second value, the answer is already <code>true</code>;
  hence each bucket holds at most one value, and checking the two neighbouring
  buckets is two lookups. Total time O(n) expected, with no ordered structure.
</p>
<pre><code>function containsNearbyAlmostDuplicateBuckets(nums, indexDiff, valueDiff) {
  const width = valueDiff + 1; <span class="c">// two numbers in one bucket differ by at most valueDiff</span>
  const bucketOf = (x) =&gt; Math.floor(x / width); <span class="c">// floor, not truncation, so negatives land correctly</span>
  const buckets = new Map();
  for (let i = 0; i &lt; nums.length; i++) {
    const x = nums[i];
    const id = bucketOf(x);
    if (buckets.has(id)) return true; <span class="c">// same bucket: close enough by construction</span>
    if (buckets.has(id - 1) &amp;&amp; x - buckets.get(id - 1) &lt;= valueDiff) return true;
    if (buckets.has(id + 1) &amp;&amp; buckets.get(id + 1) - x &lt;= valueDiff) return true;
    buckets.set(id, x); <span class="c">// at most one number per bucket, or we would have returned</span>
    if (i &gt;= indexDiff) buckets.delete(bucketOf(nums[i - indexDiff]));
  }
  return false;
}</code></pre>
<h4>Dry run: [2, 9, 5], indexDiff = 2, valueDiff = 3, so the width is 4</h4>
<table>
  <tr><th>i</th><th>x</th><th>Bucket ⌊x / 4⌋</th><th>Checks</th><th>Buckets afterwards</th></tr>
  <tr><td>0</td><td>2</td><td>0</td><td>no bucket 0, −1 or 1 stored</td><td>{0: 2}</td></tr>
  <tr><td>1</td><td>9</td><td>2</td><td>no bucket 2, 1 or 3 stored</td><td>{0: 2, 2: 9}</td></tr>
  <tr><td>2</td><td>5</td><td>1</td><td>bucket 1 is empty; bucket 0 holds 2, and 5 − 2 = 3 ≤ 3</td><td><b>true</b></td></tr>
</table>
<p class="sub">
  The values 2 and 5 sit in adjacent buckets, which is exactly the case that needs
  the real difference. On the earlier input <code>[1, 5, 9, 1, 5, 9]</code> the
  neighbouring buckets always differ by 4, so it also answers <code>false</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ Bucket-trick traps</span>
  <b>Truncation instead of floor.</b> With <code>valueDiff = 1</code> the width is
  2. <code>Math.trunc(−1 / 2)</code> is <code>−0</code> and
  <code>Math.trunc(1 / 2)</code> is <code>0</code>, and a <code>Map</code> treats
  <code>−0</code> and <code>0</code> as the same key, so −1 and 1, which differ
  by 2, would be reported as a match. <code>Math.floor</code> gives −1 and 0 and
  keeps them apart. The same goes for <code>| 0</code>, which also
  truncates toward zero. <b>Width.</b> Divide by <code>valueDiff + 1</code>, not by
  <code>valueDiff</code>: <code>valueDiff = 0</code> would divide by zero, and
  <code>valueDiff + 1</code> is the widest bucket in which every pair is still a
  match. <b>Eviction.</b> Remove the bucket of
  the number that leaves the window; it is safe to delete by bucket number
  because that bucket holds only that number. <b>Window size.</b> The window holds
  <code>indexDiff</code> numbers before the new one is checked, so evict when
  <code>i ≥ indexDiff</code>, after the insert.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I only need a yes or no, so I can
  skip the ordered set: bucket the values with width valueDiff plus one. The same
  bucket is a hit, a bucket two away can never be a hit, and an adjacent bucket
  needs one subtraction. With a hash map from bucket to value over the last
  indexDiff numbers, that is O(n). If I needed the nearest value instead, I would
  use an ordered set and ask for the ceiling."
</div>

<h3>Counting pairs: range sums and reverse pairs</h3>
<p>
  A whole family of problems asks "count the pairs <code>i &lt; j</code> where some
  condition holds between a value at <code>i</code> and one at <code>j</code>".
  Sweep <code>j</code> from left to right, keep everything seen so far in an ordered
  multiset, and for each <code>j</code> ask a <em>rank</em> question: how many earlier
  values lie in the range this <code>j</code> allows?
</p>
<p>
  <b>Count of range sum.</b> Count the subarrays whose sum lies in
  <code>[lower, upper]</code>. With prefix sums <code>P</code> (see
  <a href="/dsa/dsa-prefix-sums">Prefix sums</a>), the subarray ending at
  <code>j</code> and starting after <code>i</code> has sum
  <code>P[j] − P[i]</code>. It counts when
  <code>lower ≤ P[j] − P[i] ≤ upper</code>, which is
  <code>P[j] − upper ≤ P[i] ≤ P[j] − lower</code>. So for each new prefix, count
  the earlier prefixes in that range, then insert the new one. The empty prefix 0
  goes in first.
</p>
<pre><code>function countRangeSum(nums, lower, upper) {
  const prefixes = new Treap();
  prefixes.add(0);
  let sum = 0;
  let count = 0;
  for (const x of nums) {
    sum += x;
    count += prefixes.countRange(sum - upper, sum - lower); <span class="c">// earlier prefixes P with lower &lt;= sum - P &lt;= upper</span>
    prefixes.add(sum);
  }
  return count;
}</code></pre>
<h4>Dry run: [−2, 5, −1] with lower = −2 and upper = 2</h4>
<table>
  <tr><th>x</th><th>Prefix sum</th><th>Earlier prefixes</th><th>Range [sum − upper, sum − lower]</th><th>Count</th></tr>
  <tr><td>−2</td><td>−2</td><td>{0}</td><td>[−4, 0]</td><td>1 (0): the subarray [−2]</td></tr>
  <tr><td>5</td><td>3</td><td>{−2, 0}</td><td>[1, 5]</td><td>0</td></tr>
  <tr><td>−1</td><td>2</td><td>{−2, 0, 3}</td><td>[0, 4]</td><td>2 (0 and 3): the subarrays [−2, 5, −1] and [−1]</td></tr>
</table>
<p class="sub">
  The total is 3. <b>Reverse pairs</b> is the same sweep with a different range: for
  each j, the earlier values larger than <code>2 · nums[j]</code> number
  <code>seen.size − seen.countAtMost(2 * nums[j])</code>. Write
  <code>2 * x</code> and not <code>x &lt;&lt; 1</code>: the shift works on 32-bit
  integers, and <code>2147483648 &lt;&lt; 1</code> is <code>0</code>.
</p>
<p>
  There are three standard ways to count such pairs, and they are all O(n log n).
</p>
<table>
  <tr><th>Method</th><th>How</th><th>Reach for it when</th></tr>
  <tr><td>Ordered multiset, as above</td><td>insert as you sweep; rank queries</td><td>the data arrives online, or the condition is awkward (a range of values, a k-th, a count of a sum)</td></tr>
  <tr><td>Fenwick tree over compressed values</td><td>the same sweep with counts at compressed slots; see <a href="/dsa/dsa-segment-fenwick-trees">Segment and Fenwick trees</a> for the full code of both problems</td><td>all values are known up front; the fastest and shortest in practice</td></tr>
  <tr><td>Merge sort that counts</td><td>count crossing pairs while merging two sorted halves; see the inversion counting in <a href="/dsa/dsa-sorting-algorithms">Sorting algorithms</a></td><td>the condition can be checked with two moving pointers across two sorted halves; deterministic O(n log n) and no extra structure</td></tr>
</table>
<p>
  All three give the same answers; the treap version costs O(n log n) in
  expectation while the other two are deterministic. Choose by what the problem
  gives you. A prefix-sum range or "twice as large" condition fits all three. A
  condition that depends on the inserted values in other ways, or that needs the
  elements as well as their count, pushes you towards the ordered structure.
</p>
<div class="warn">
  <span class="ttl">⚠ Pair-counting traps</span>
  <b>Forgetting the empty prefix.</b> Without <code>prefixes.add(0)</code> every
  subarray that starts at index 0 is missed. <b>Both ends are inclusive.</b>
  <code>countRange(lo, hi)</code> counts <code>lo ≤ key ≤ hi</code>; using
  <code>rank(hi)</code> for the upper end would drop the keys equal to
  <code>hi</code>. <b>Query then insert.</b> Count against the earlier values first
  and insert the new one afterwards, or the element pairs with itself. <b>Precision.</b>
  Prefix sums stay exact while they are below 2<sup>53</sup>, and a million
  32-bit values sum to at most about 2 × 10<sup>15</sup>, which is below that.
</div>

<h3>Max sum of a rectangle no larger than K</h3>
<p>
  Given an <code>m × n</code> matrix and an integer <code>k</code>, find the
  largest sum of any rectangular block whose sum is at most <code>k</code>.
  The all-rectangles scan is O(m² n²) with prefix sums. Kadane's algorithm does
  not apply, since it finds the best sum without a cap, and with negative numbers
  a longer subarray is not always bigger.
</p>
<p>
  Reduce to one dimension. Fix a top row and a bottom row; add up each column
  between them to get a single array of <code>n</code> column sums. A rectangle
  with those rows is a contiguous subarray of that array. So the problem becomes:
  <b>the largest subarray sum that is at most k</b> in a one-dimensional array. Take
  prefix sums <code>P</code>. A subarray ending at index <code>j</code> has sum
  <code>P[j] − P[i]</code>, and we want the largest value that is at most
  <code>k</code>, so we want the <em>smallest</em> earlier prefix
  <code>P[i]</code> that is still at least <code>P[j] − k</code>. That is exactly
  <code>ceiling(P[j] − k)</code> among the earlier prefixes, including the empty
  prefix 0.
</p>
<pre><code>function bestSubarrayAtMost(nums, k) {
  const seen = new Treap();
  seen.add(0);
  let prefix = 0;
  let best = -Infinity;
  for (const x of nums) {
    prefix += x;
    const smallest = seen.ceiling(prefix - k); <span class="c">// the smallest earlier prefix that keeps prefix - P &lt;= k</span>
    if (smallest !== undefined) best = Math.max(best, prefix - smallest);
    seen.add(prefix);
  }
  return best;
}

function maxSumSubmatrix(matrix, k) {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const wide = cols &gt;= rows; <span class="c">// pair up the shorter side, scan along the longer one</span>
  const outer = wide ? rows : cols;
  const inner = wide ? cols : rows;
  const cell = (o, i) =&gt; (wide ? matrix[o][i] : matrix[i][o]);
  let best = -Infinity;
  for (let top = 0; top &lt; outer; top++) {
    const strip = new Array(inner).fill(0);
    for (let bottom = top; bottom &lt; outer; bottom++) {
      for (let i = 0; i &lt; inner; i++) strip[i] += cell(bottom, i); <span class="c">// strip[i] = column i summed over rows top..bottom</span>
      best = Math.max(best, bestSubarrayAtMost(strip, k));
      if (best === k) return k; <span class="c">// nothing can beat k</span>
    }
  }
  return best;
}</code></pre>
<h4>Dry run: the one-dimensional core on [2, 2, −1] with k = 3</h4>
<table>
  <tr><th>x</th><th>Prefix</th><th>Earlier prefixes</th><th>ceiling(prefix − 3)</th><th>Candidate prefix − ceiling</th><th>Best so far</th></tr>
  <tr><td>2</td><td>2</td><td>{0}</td><td>0</td><td>2</td><td>2</td></tr>
  <tr><td>2</td><td>4</td><td>{0, 2}</td><td>2</td><td>2</td><td>2</td></tr>
  <tr><td>−1</td><td>3</td><td>{0, 2, 4}</td><td>0</td><td>3</td><td><b>3</b></td></tr>
</table>
<p class="sub">
  The best subarray sum not above 3 is 3, the whole array. For the matrix
  <code>[[1, 0, 1], [0, −2, 3]]</code> with <code>k = 2</code>, the first pair of
  rows (the top row alone) gives the strip <code>[1, 0, 1]</code>, whose best
  sum at most 2 is 2, and since nothing can beat <code>k</code> the function
  returns at once. Time is O(min(m, n)² · max(m, n) · log max(m, n)): there are
  about min(m, n)² pairs on the shorter side, and each costs one pass of
  max(m, n) steps with an O(log) set operation. That is why the code pairs up the
  <em>shorter</em> side. If no rectangle has sum at most <code>k</code>, the code
  returns <code>−Infinity</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ Rectangle traps</span>
  <b>Seed the set with 0.</b> The empty prefix is what lets a subarray start at
  the first column. <b>Ceiling, not floor.</b> We want the smallest earlier prefix
  that is at least <code>P[j] − k</code>; a floor would give a difference that is
  too large to be allowed. <b>Start a fresh set for every pair of rows.</b> The
  prefix sums belong to one strip. <b>The cap is on the sum, not the area.</b> The
  first candidate found is not the answer; the best over all pairs is.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Fix two rows and collapse the
  matrix into one array of column sums. Then it is the best subarray sum that is
  at most k. With prefix sums that is: for each prefix, find the smallest earlier
  prefix that is at least prefix minus k, which is a ceiling query in an ordered
  set. That is O(rows² · cols · log cols), and I would pair up the shorter side."
</div>

<h3>When the language has no TreeMap: what to say</h3>
<p>
  The code in this chapter is the easy part. The harder part, in an interview, is
  what you say before you write any of it, because the interviewer is listening
  for whether you know what you need, what your language lacks, and what each way
  of closing the gap costs. A good answer has four moves.
</p>
<ol>
  <li><b>Name the interface, not the library.</b> "I need an ordered multiset with insert, delete and ceiling, each in O(log n)." That sentence shows you know why a hash set is wrong and a heap is not enough.</li>
  <li><b>Say what is missing.</b> JavaScript's <code>Set</code> and <code>Map</code> iterate in insertion order and have no floor or ceiling. Sorting the keys on every query costs O(n log n), and an object's keys are not an ordered map either. If you need the neighbour of a key, there is no built-in way to ask for it.</li>
  <li><b>Offer the ladder, cheapest first.</b> A sorted array with binary search and <code>splice</code>: short, correct, and O(n) per insert, which is fine for tens of thousands of updates. If the updates are many more, buckets, or a treap, behind the same four methods. If every value is known in advance, a Fenwick tree over the compressed values. State the cost of what you pick, including that an array insert is O(n).</li>
  <li><b>Ask before you build.</b> "May I assume an ordered set with these methods, and fill it in if we have time?" is a fair question. If the answer is yes, write against a class with a clear name and do not pretend it exists in the language. If the answer is no, you already have the ladder ready.</li>
</ol>
<p>
  Be honest about time. A treap is a few dozen lines for split and merge and about a hundred and
  fifty with its class, and it is easy to get wrong the first time, so it is worth writing only when the structure is the whole
  problem, and only if you have practised it. For most problems in this chapter a
  sorted array with a stated cost is a perfectly good answer, and a
  sorted array plus a clear sentence on how you would upgrade it is often a
  better answer than a half-written tree.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "JavaScript has no ordered set, so I
  will hide the one I need behind a few methods: add, remove, ceiling, and
  rank. First version, a sorted array with a binary search: every query is
  O(log n), the insert shifts items so it is O(n), and that is fine for n around
  fifty thousand. If the limit is larger I would swap in bucketed arrays or a
  treap without changing the callers. If every value is known up front I would
  use a Fenwick tree over the compressed values instead."
</div>
<div class="warn">
  <span class="ttl">⚠ Things not to say</span>
  <b>"A JavaScript Set is sorted."</b> It iterates in insertion order.
  <b>"I will sort after every insert."</b> That is O(n log n) per insert.
  <b>"Insert is O(log n)"</b> for a sorted array: the search is, the splice is not.
  <b>"This is O(log n)"</b> for a treap without saying "expected". And do not claim
  more than you can finish: say "I would write a treap here, and the shape is
  split, merge and a size field" if there is not time to code it.
</div>

<h3>How to choose, with numbers</h3>
<table>
  <tr><th>Situation</th><th>Reach for</th><th>Why</th></tr>
  <tr><td>Up to tens of thousands of updates, any queries</td><td>sorted array with <code>splice</code></td><td>shortest code; the shift is the only slow part</td></tr>
  <tr><td>Every value is known in advance; counts, rank, k-th or floor and ceiling</td><td>Fenwick tree over compressed values</td><td>fast, with no per-key objects; it cannot take a value that was not known in advance</td></tr>
  <tr><td>Online, hundreds of thousands to millions of operations, mostly insert and floor or ceiling</td><td>bucket list</td><td>short and fast; rank and k-th cost n / load</td></tr>
  <tr><td>Online, rank or k-th in the loop, or extra per-subtree data</td><td>treap</td><td>O(log n) expected for everything; <code>refresh</code> is the extension point</td></tr>
  <tr><td>Only the smallest or largest, with removals</td><td>heap with lazy deletion</td><td>no ordered queries needed; see <a href="/dsa/dsa-heaps-priority-queues">Heaps and priority queues</a></td></tr>
  <tr><td>Yes or no: is any value within d of this one</td><td>hash map of buckets of width d + 1</td><td>O(n) expected; cannot answer nearest or count</td></tr>
  <tr><td>A set of disjoint intervals</td><td>ordered map from start to end</td><td>the floor is the only interval that can reach over a point</td></tr>
</table>
<p>
  The table below was measured on one machine: Node 24 on an Apple M2 Pro, random
  integers below 10<sup>9</sup>, median of five runs, times for inserting n values one
  at a time. The Fenwick column leaves out building its universe; in a separate
  run that sort and deduplication took about 30 ms for 100,000 values and about
  340 ms for 1,000,000, so counted in, the bucket list is ahead of it. Treat the
  ratios as the lesson, since the milliseconds will not carry over to your
  machine, your Node version or other data.
</p>
<table>
  <tr><th>n</th><th>Sorted array</th><th>Bucket list (load 512)</th><th>Treap</th><th>Fenwick set</th></tr>
  <tr><td>10,000</td><td>about 5 ms</td><td>about 2 ms</td><td>about 9 ms</td><td>about 1 ms</td></tr>
  <tr><td>100,000</td><td>about 510 ms</td><td>about 21 ms</td><td>about 87 ms</td><td>about 14 ms</td></tr>
  <tr><td>300,000</td><td>about 4,700 ms</td><td>about 72 ms</td><td>about 355 ms</td><td>about 58 ms</td></tr>
  <tr><td>1,000,000</td><td>not run</td><td>about 300 ms</td><td>about 1,900 ms</td><td>about 220 ms</td></tr>
</table>
<table>
  <tr><th>Structure</th><th>add and remove</th><th>floor and ceiling</th><th>rank and at</th><th>Catch</th></tr>
  <tr><td>Sorted array</td><td>O(log n) to find, O(n) to shift</td><td>O(log n)</td><td>O(log n) and O(1)</td><td>the shift</td></tr>
  <tr><td>Bucket list</td><td>O(log n + load), plus an occasional split</td><td>O(log n)</td><td>O(n / load) for the scan</td><td>numbers or strings only, as written; load is a tuning choice</td></tr>
  <tr><td>Treap</td><td>O(log n) expected</td><td>O(log n) expected</td><td>O(log n) expected</td><td>randomness, and one object per key</td></tr>
  <tr><td>Fenwick set</td><td>O(log m)</td><td>O(log m)</td><td>O(log m)</td><td>the universe must be known in advance</td></tr>
</table>
<p class="sub">
  The treap is slower than the bucket list and the Fenwick set at these sizes,
  because each insert does more work: it allocates a node and runs a split and
  two merges. It is the right default when the problem needs more than the interface:
  extra aggregates in the nodes, or O(log n) expected cost on rank-heavy
  workloads, where the bucket list's scan grows with n.
</p>

<h3>Recognizing it in an unseen problem</h3>
<table>
  <tr><th>The problem says</th><th>Reach for</th></tr>
  <tr><td>"the closest value to x among those so far", "the next larger or smaller element in a changing set"</td><td><code>floor</code>, <code>lower</code>, <code>ceiling</code>, <code>higher</code> on an ordered multiset</td></tr>
  <tr><td>"the median of the current window", "the k-th smallest in a sliding set"</td><td>ordered multiset with <code>at</code>; or two heaps with lazy deletion</td></tr>
  <tr><td>"count the earlier elements in a range of values", "count subarrays with sum in [a, b]", "count pairs where one is more than twice the other"</td><td>sweep with an ordered multiset and <code>countRange</code>; offline: Fenwick; or merge sort counting</td></tr>
  <tr><td>"book an interval if it does not overlap", "merge intervals as they arrive", "add or remove ranges"</td><td>ordered map from start to end; check the floor and the ceiling</td></tr>
  <tr><td>"at most k overlapping bookings" or "the largest overlap so far"</td><td>ordered map of boundary changes, walked in order; or a segment tree</td></tr>
  <tr><td>"the best sum not exceeding k", "closest sum to k" over subarrays</td><td>prefix sums plus <code>ceiling</code> or <code>floor</code> on the earlier prefixes</td></tr>
  <tr><td>"the gap that is currently the best", where each change splits or joins one gap</td><td>a second ordered set of gaps, ordered by the objective with a comparator</td></tr>
  <tr><td>"within d in value and within k in index"</td><td>ordered set of the last k values, or buckets of width d + 1 for a yes or no</td></tr>
  <tr><td>Values are all known up front and updates are only counts</td><td>compress the values and use a Fenwick tree; the ordered tree is for the online case</td></tr>
  <tr><td>Only "the smallest" or "the largest" is ever asked, with removals</td><td>a heap; do not build an ordered set you do not need</td></tr>
</table>
<ul>
  <li>Check what the question needs before choosing: rank and k-th call for sizes (treap, Fenwick), while floor and ceiling alone are satisfied by a sorted array or the bucket list.</li>
  <li>Read the statement for strictness (floor against lower, ceiling against higher) and for duplicates (a set or a multiset) before you write the first call.</li>
  <li>If the data is known in advance, try the offline version first; it is shorter and faster, and it avoids random numbers.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>List the operations of an ordered set, and show how floor, lower, ceiling, higher and a range count follow from rank and select.</li>
    <li>Explain why a sorted array has O(n) insert although its search is O(log n), and say what size makes that acceptable.</li>
    <li>Describe a treap in terms of split and merge, and say why random priorities keep the height O(log n) even for sorted input.</li>
    <li>Write rank and select on a tree with subtree sizes, and say what <code>refresh</code> must update after every relinking.</li>
    <li>Explain how bucket size trades update cost against rank cost, and why neighbouring buckets are merged after removals.</li>
    <li>Say when a Fenwick tree over compressed coordinates is the better choice, and the one thing that rules it out.</li>
    <li>Argue why the floor and the ceiling are the only two bookings that can clash in My Calendar I.</li>
    <li>Write the range module's three operations on an interval map, including the tail that survives a removal.</li>
    <li>Solve sliding window median and contains duplicate III with an ordered set, and give the bucket argument for the second.</li>
    <li>Reduce max sum of a rectangle no larger than K to prefix sums and a ceiling query, and say why the shorter side is paired up.</li>
    <li>Say in three sentences what you would tell an interviewer when the language has no TreeMap.</li>
  </ul>
</div>`,
};
