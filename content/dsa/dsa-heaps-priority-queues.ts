import type { Chapter } from "../types";

export const dsaHeapsPriorityQueues: Chapter = {
  id: "dsa-heaps-priority-queues",
  num: "I4",
  title: "Heaps & priority queues",
  short: "Heaps & priority queues",
  levels: ["intermediate"],
  prerequisites: ["dsa-trees"],
  practice: [
    "ex-kth-largest-element",
    "ex-median-from-data-stream",
    "ex-k-closest-points-origin",
    "ex-last-stone-weight",
    "ex-task-scheduler",
    "ex-sort-characters-by-frequency",
    "ex-reorganize-string",
    "ex-smallest-range-k-lists",
    "ex-k-pairs-smallest-sums",
    "ex-ipo-maximize-capital",
    "ex-maximum-performance-team",
    "ex-min-cost-connect-sticks",
    "ex-furthest-building-you-can-reach",
    "ex-top-k-frequent",
    "ex-merge-k-sorted-lists",
    "ex-meeting-rooms-ii",
    "ex-quickselect-kth-largest",
    "ex-heap-with-comparator",
    "ex-top-k-frequent-words",
    "ex-kth-smallest-sorted-matrix",
    "ex-merge-k-sorted-arrays",
    "ex-heapsort-in-place",
    "ex-sliding-window-median",
    "ex-single-threaded-cpu",
  ],
  ready: true,
  subtitle: "You don't need the whole thing sorted — you need the extreme value, fast, repeatedly.",
  body: `<h3>The problem a heap exists to solve</h3>
<p>
  If you need the minimum (or maximum) value <em>once</em>, scan the
  array — O(n). If you need it <em>repeatedly</em>, while the data keeps
  changing, sorting every time is O(n log n) per query — wasteful. A heap
  gives you the extreme value in O(1) and lets you add or remove in
  O(log n), which is the sweet spot for "keep asking me for the biggest
  one" problems.
</p>

<h3>The one rule: parent beats children</h3>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="A min-heap tree where every parent is smaller than its children, alongside the same heap stored as a flat array">
    <g class="rough">
      <path class="ln" d="M320,40 L200,100" />
      <path class="ln" d="M320,40 L440,100" />
      <path class="ln" d="M200,100 L140,160" />
      <path class="ln" d="M200,100 L260,160" />
      <path class="ln" d="M440,100 L500,160" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="320" cy="40" r="24" />
      <circle class="box" cx="200" cy="100" r="24" />
      <circle class="box" cx="440" cy="100" r="24" />
      <circle class="box" cx="140" cy="160" r="24" />
      <circle class="box" cx="260" cy="160" r="24" />
      <circle class="box" cx="500" cy="160" r="24" />
    </g>
    <text class="sm" x="320" y="45" text-anchor="middle">2</text>
    <text class="sm" x="200" y="105" text-anchor="middle">5</text>
    <text class="sm" x="440" y="105" text-anchor="middle">4</text>
    <text class="sm" x="140" y="165" text-anchor="middle">9</text>
    <text class="sm" x="260" y="165" text-anchor="middle">7</text>
    <text class="sm" x="500" y="165" text-anchor="middle">8</text>
    <text class="lbl gr" x="330" y="20" style="font-size:14px">root = the minimum, always</text>
    <g class="rough">
      <rect class="box" x="20" y="195" width="60" height="30" />
      <rect class="box" x="80" y="195" width="60" height="30" />
      <rect class="box" x="140" y="195" width="60" height="30" />
      <rect class="box" x="200" y="195" width="60" height="30" />
      <rect class="box" x="260" y="195" width="60" height="30" />
      <rect class="box" x="320" y="195" width="60" height="30" />
    </g>
    <text class="sm" x="50" y="215" text-anchor="middle">2</text>
    <text class="sm" x="110" y="215" text-anchor="middle">5</text>
    <text class="sm" x="170" y="215" text-anchor="middle">4</text>
    <text class="sm" x="230" y="215" text-anchor="middle">9</text>
    <text class="sm" x="290" y="215" text-anchor="middle">7</text>
    <text class="sm" x="350" y="215" text-anchor="middle">8</text>
    <text class="lbl" x="400" y="215" style="font-size:13px">← stored flat: child of i is 2i+1, 2i+2</text>
  </svg>
  <figcaption>Min-heap: every parent ≤ its children. No claim about left vs right — only up vs down.</figcaption>
</figure>
<p class="sub">
  A heap is <b>not</b> sorted, and it's not a BST — a node's left child
  can be bigger or smaller than its right child, the only guarantee is
  parent-vs-children. That weaker guarantee is exactly what makes insert
  and remove-min cheaper than keeping the whole thing sorted.
</p>

<h3>Sift-up (insert) and sift-down (remove) — the two moves</h3>
<p>
  Insert always adds at the very end of the array, then "bubbles" it up
  while it's smaller than its parent. Removing the min always takes the
  last element, drops it at the root, then "sinks" it down while it's
  bigger than its smallest child. Both are O(log n) because they only
  ever travel the height of the tree.
</p>
<pre><code>class MinHeap {
  #data = [];

  peek() { return this.#data[0]; }
  size() { return this.#data.length; }

  push(val) {
    this.#data.push(val);
    this.#siftUp(this.#data.length - 1);
  }

  pop() {
    const min = this.#data[0];
    const last = this.#data.pop();
    if (this.#data.length > 0) {
      this.#data[0] = last;
      this.#siftDown(0);
    }
    return min;
  }

  #siftUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.#data[parent] <= this.#data[i]) break;
      [this.#data[parent], this.#data[i]] = [this.#data[i], this.#data[parent]];
      i = parent;
    }
  }

  #siftDown(i) {
    const n = this.#data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.#data[left] < this.#data[smallest]) smallest = left;
      if (right < n && this.#data[right] < this.#data[smallest]) smallest = right;
      if (smallest === i) break;
      [this.#data[i], this.#data[smallest]] = [this.#data[smallest], this.#data[i]];
      i = smallest;
    }
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ JS has no built-in heap — say so, then build one</span>
  Unlike Python (<code>heapq</code>) or Java (<code>PriorityQueue</code>),
  JavaScript has no native heap. In an interview, name this explicitly and
  either implement a small one (above) or, if allowed, describe using a
  sorted-insert array for small n while stating the tradeoff clearly.
</div>

<h3>One Heap class for every job: a comparator</h3>
<p>
  The <code>MinHeap</code> above hard-codes one decision: <code>&lt;</code>
  on the stored values. That is enough for plain numbers, but interview
  problems put <em>pairs</em> in the heap: a (distance, point), a (count,
  word), an (end time, room). Rewriting the sift loops for every shape is
  how heap bugs get written. The fix is to pull that one decision out into
  a function. The heap asks "does <code>a</code> come out before
  <code>b</code>?" and never looks inside the items itself.
</p>
<p>
  The contract is the same as <code>Array.prototype.sort</code>: a
  comparator returns a <b>negative</b> number when <code>a</code> must
  come out first, a positive number when <code>b</code> must, and
  <code>0</code> for a tie. The heap below only ever tests
  <code>compare(x, y) &lt; 0</code> ("strictly before") or
  <code>&gt;= 0</code>, so equal items never swap.
</p>
<pre><code>class Heap {
  #data;
  #compare;

  constructor(compare, items = []) {
    this.#compare = compare;
    this.#data = items.slice();
    for (let i = (this.#data.length &gt;&gt; 1) - 1; i &gt;= 0; i--) this.#siftDown(i); <span class="c">// heapify in O(n)</span>
  }

  size() { return this.#data.length; }
  peek() { return this.#data[0]; }

  push(item) {
    this.#data.push(item);
    this.#siftUp(this.#data.length - 1);
  }

  pop() {
    const top = this.#data[0];
    const last = this.#data.pop();
    if (this.#data.length &gt; 0) {
      this.#data[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  #siftUp(i) {
    const data = this.#data;
    while (i &gt; 0) {
      const parent = (i - 1) &gt;&gt; 1;
      if (this.#compare(data[i], data[parent]) &gt;= 0) break; <span class="c">// not strictly better than its parent: stay</span>
      [data[i], data[parent]] = [data[parent], data[i]];
      i = parent;
    }
  }

  #siftDown(i) {
    const data = this.#data;
    const n = data.length;
    while (true) {
      let best = i;
      const left = 2 * i + 1, right = left + 1;
      if (left &lt; n &amp;&amp; this.#compare(data[left], data[best]) &lt; 0) best = left;
      if (right &lt; n &amp;&amp; this.#compare(data[right], data[best]) &lt; 0) best = right;
      if (best === i) break;
      [data[i], data[best]] = [data[best], data[i]];
      i = best;
    }
  }
}</code></pre>
<p>
  Two details are worth reading twice. The constructor accepts a starting
  array and fixes it with the bottom-up loop from the heapify section
  below, so <code>new Heap(compare, items)</code> costs O(n) rather than
  n pushes at O(n log n). And it copies the array with
  <code>slice()</code>, so the caller's array is not reordered behind
  their back.
</p>
<p>
  Now <code>MinHeap</code> and <code>MaxHeap</code> are one line each. This
  <code>MinHeap</code> replaces the earlier class, and
  <code>new MinHeap()</code> works exactly as before. The
  <code>MaxHeap</code> is the one the <code>MedianFinder</code> below
  assumes, and it is only the comparator turned around.
</p>
<pre><code>class MinHeap extends Heap {
  constructor(items) { super((a, b) =&gt; a - b, items); }
}

class MaxHeap extends Heap {
  constructor(items) { super((a, b) =&gt; b - a, items); }
}</code></pre>
<p>
  Everything else in this chapter builds on these three classes. What you
  put <em>into</em> the heap decides what the comparator looks like:
</p>
<table>
  <tr><th>Entry shape</th><th>Comparator</th><th>Typical use</th></tr>
  <tr><td>a plain number</td><td><code>(a, b) =&gt; a - b</code> (min) or <code>b - a</code> (max)</td><td>top-K numbers, sticks, stones</td></tr>
  <tr><td>a tuple <code>[priority, payload...]</code></td><td>compare <code>a[0]</code> with <code>b[0]</code></td><td>(distance, point), (value, list index, position)</td></tr>
  <tr><td>an object</td><td>compare one field, <code>a.dist - b.dist</code></td><td>tasks, meetings, graph nodes</td></tr>
  <tr><td>a reference to a structure</td><td>compare the field it carries, <code>a.val - b.val</code></td><td>linked-list nodes in a k-way merge</td></tr>
  <tr><td>several keys</td><td>first key, then <code>||</code> the next</td><td>most frequent first, then alphabetical</td></tr>
</table>
<pre><code>const byDistance = new Heap((a, b) =&gt; a.dist - b.dist); <span class="c">// objects: compare one field</span>
byDistance.push({ node: "A", dist: 7 });
byDistance.push({ node: "B", dist: 2 });
byDistance.pop().node; <span class="c">// "B"</span>

const byCountThenWord = new Heap((a, b) =&gt; b[1] - a[1] || (a[0] &lt; b[0] ? -1 : a[0] &gt; b[0] ? 1 : 0)); <span class="c">// arrays: most frequent first, then alphabetical</span></code></pre>
<p class="sub">
  The last comparator uses <code>||</code> as a tie-break: when the counts
  are equal <code>b[1] - a[1]</code> is <code>0</code>, which is falsy, so
  evaluation falls through to the alphabetical comparison.
</p>
<div class="warn">
  <span class="ttl">⚠ Four ways a comparator quietly breaks the heap</span>
  <b>1. Returning a boolean.</b> A comparator like
  <code>(a, b) =&gt; a &gt; b</code> returns <code>true</code> or
  <code>false</code>, and neither is below zero, so the heap never moves
  anything. We pushed 5, 3, 8, 1 into a heap built that way and popped
  5, 1, 8, 3, which is not any order at all. No error is raised.
  <b>2. Comparing arrays with <code>&lt;</code>.</b> JavaScript turns
  arrays into strings first, so <code>[10, "x"] &lt; [9, "y"]</code> is
  <code>true</code> because <code>"10,x"</code> sorts before
  <code>"9,y"</code>. Always compare the number inside.
  <b>3. Changing an item after pushing it.</b> The heap placed the item by
  its value at push time and is never told that the value changed. We
  pushed an object with priority 5, set it to 1 afterwards, and the heap
  still popped the priority-3 item first. If a priority changes, push a
  new entry instead (the lazy-deletion section below shows how to ignore
  the old one).
  <b>4. Expecting first-in, first-out among ties.</b> A heap is not
  stable. Pushing seven entries with the same priority and the letters
  a to g, we got them back as a, g, f, e, d, c, b. When the problem needs
  insertion order among equals, add a counter to the tuple and compare it
  last.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "JavaScript has no heap, so
  I'll write a small one that takes a comparator the way
  <code>sort</code> does. For the k largest I'll use a min-heap of size k;
  for a stream median, a max-heap and a min-heap."
</div>

<h3>The top-K pattern</h3>
<p>
  This is where heaps earn their keep: finding the k largest elements out
  of n. Sorting everything is O(n log n). A heap does it in
  O(n log k) — and when k is small relative to n, that's a real win.
</p>
<pre><code><span class="c">// k largest elements — keep a MIN-heap of size k (counter-intuitive but correct)</span>
function kLargest(nums, k) {
  const heap = new MinHeap();
  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop(); <span class="c">// evict the smallest — keep only the top k</span>
  }
  const result = [];
  while (heap.size() > 0) result.push(heap.pop()); <span class="c">// draining a min-heap yields the k largest smallest-first</span>
  return result.reverse();                         <span class="c">// largest first</span>
}</code></pre>
<p class="sub">
  The trick that trips people up: for "k <em>largest</em>," you use a
  <em>min</em>-heap, not a max-heap — because you want to cheaply evict
  the smallest of your current top-k candidates the moment a bigger one
  shows up. The heap's root is always "the next one to kick out," which is
  the smallest of the keepers.
</p>
<h4>Dry run: kLargest([3, 1, 5, 9, 2, 7], 3)</h4>
<table>
  <tr><th>Push</th><th>Heap after push</th><th>Size vs k</th><th>Action</th><th>Heap keeps</th></tr>
  <tr><td>3</td><td>{3}</td><td>1 ≤ 3</td><td>—</td><td>{3}</td></tr>
  <tr><td>1</td><td>{1, 3}</td><td>2 ≤ 3</td><td>—</td><td>{1, 3}</td></tr>
  <tr><td>5</td><td>{1, 3, 5}</td><td>3 ≤ 3</td><td>—</td><td>{1, 3, 5}</td></tr>
  <tr><td>9</td><td>{1, 3, 5, 9}</td><td>4 &gt; 3</td><td>pop() removes the root, 1</td><td>{3, 5, 9}</td></tr>
  <tr><td>2</td><td>{2, 3, 5, 9}</td><td>4 &gt; 3</td><td>pop() removes the root, 2</td><td>{3, 5, 9}</td></tr>
  <tr><td>7</td><td>{3, 5, 7, 9}</td><td>4 &gt; 3</td><td>pop() removes the root, 3</td><td>{5, 7, 9}</td></tr>
</table>
<p class="sub">
  Every time the heap tips over size <code>k</code>, whatever just became
  the new minimum is exactly what leaves — so the heap only ever holds
  candidates for the answer, never a value that's already been beaten by
  <code>k</code> bigger ones. It ends holding {5, 7, 9}: the three largest
  values. Draining the heap with <code>pop()</code> gives 5, 7, 9, and the
  final <code>reverse()</code> returns <code>[9, 7, 5]</code> as a plain array
  (an extra O(k log k), no more than the O(n log k) of the loop).
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I only need the k largest,
  not a full sort, so I'll keep a min-heap of size k — every new element
  either gets discarded or bumps out the current smallest keeper, which
  is O(log k) per element instead of O(n log n) for a full sort."
</div>

<h3>Top-K frequent: a heap, buckets or quickselect</h3>
<p>
  "Return the k most frequent elements" combines two steps. Counting is
  always the same: one pass with a <code>Map</code>, O(n). (A plain object
  would turn the numbers 1 and <code>"1"</code> into one key, and a
  <code>Map</code> keeps them apart.) Choosing the k biggest counts from d
  distinct values is where the three methods differ, and each one shows a
  different trade.
</p>
<h4>Method 1: the size-k heap</h4>
<p>
  This is the pattern from earlier with one change: the entries are
  <code>[value, count]</code> pairs and the comparator looks at the count.
  A <code>Map</code> iterates as exactly those pairs, so the entries need
  no building.
</p>
<pre><code>function topKFrequent(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  const heap = new Heap((a, b) =&gt; a[1] - b[1]); <span class="c">// [value, count]: the least frequent keeper on top</span>
  for (const entry of counts) {
    heap.push(entry);
    if (heap.size() &gt; k) heap.pop();
  }
  const result = [];
  while (heap.size() &gt; 0) result.push(heap.pop()[0]);
  return result.reverse();
}</code></pre>
<p class="sub">
  <code>topKFrequent([1, 1, 1, 2, 2, 3], 2)</code> counts to
  <code>{1: 3, 2: 2, 3: 1}</code>. The heap takes <code>[1, 3]</code>,
  then <code>[2, 2]</code>; pushing <code>[3, 1]</code> makes three
  entries, so the least frequent, <code>[3, 1]</code>, is popped. What is
  left drains as 2 then 1, and the final reverse gives
  <code>[1, 2]</code>. Cost: O(n) to count, then d pushes and pops on a
  heap of at most k + 1 entries, O(d log k), so O(n + d log k) overall
  with O(d) space for the counts.
</p>
<h4>Method 2: buckets by frequency, O(n)</h4>
<p>
  A count can only be a whole number between 1 and n. That is a small,
  known range, so you do not need to compare counts at all. Put each value
  in a bucket numbered by its count, then read the buckets from the highest
  count down until you have k values.
</p>
<pre><code>function topKFrequentBucket(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  const buckets = Array.from({ length: nums.length + 1 }, () =&gt; []); <span class="c">// buckets[c] = values that appear c times</span>
  for (const [value, count] of counts) buckets[count].push(value);
  const result = [];
  for (let c = buckets.length - 1; c &gt; 0 &amp;&amp; result.length &lt; k; c--) {
    for (const value of buckets[c]) if (result.length &lt; k) result.push(value);
  }
  return result;
}</code></pre>
<p class="sub">
  Counting is O(n), filling the buckets is O(d), and the scan visits n + 1
  buckets and at most d values, so the total is O(n) time and O(n) space.
  The bucket array has <code>n + 1</code> slots, not <code>n</code>,
  because a single value can appear n times and then its count is
  <code>n</code>, which is index <code>n</code> of the array.
</p>
<h4>Method 3: quickselect on the distinct values</h4>
<p>
  If you only need the top k as a <em>set</em>, you do not need them in
  order. Partition the distinct values around a random pivot by count, put
  the higher counts on the left, and keep only the side that contains
  position <code>k - 1</code>. After the loop, the first k entries are the
  answer. This is the same quickselect as in the sorting chapter, with
  counts as the key.
</p>
<pre><code>function partitionByCount(items, counts, lo, hi) {
  const pick = lo + Math.floor(Math.random() * (hi - lo + 1));
  [items[pick], items[hi]] = [items[hi], items[pick]];
  const pivot = counts.get(items[hi]);
  let store = lo;
  for (let i = lo; i &lt; hi; i++) {
    if (counts.get(items[i]) &gt; pivot) { <span class="c">// a higher count belongs on the left</span>
      [items[i], items[store]] = [items[store], items[i]];
      store++;
    }
  }
  [items[store], items[hi]] = [items[hi], items[store]];
  return store;
}

function topKFrequentQuickselect(nums, k) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  const items = [...counts.keys()];
  let lo = 0, hi = items.length - 1;
  while (lo &lt; hi) {
    const p = partitionByCount(items, counts, lo, hi);
    if (p === k - 1) break;
    if (p &lt; k - 1) lo = p + 1;
    else hi = p - 1;
  }
  return items.slice(0, k);
}</code></pre>
<p class="sub">
  On average each partition halves the work, so the total is about O(d), and
  the worst case is O(d²). The worst case is not exotic here. When
  <em>every</em> value has the same count, the strict
  <code>&gt;</code> test never moves anything left, so each partition
  places just one element. We ran this on 20,000 distinct values that all
  appeared once, asking for the top 19,999, and the partitions read a count
  about 200 million times, which is d²/2. The fix is a three-way partition
  (less, equal, greater), which the sorting chapter covers in
  <a href="/dsa/dsa-sorting-algorithms">Sorting algorithms</a>.
</p>
<table>
  <tr><th>Method</th><th>Time</th><th>Extra space</th><th>Reach for it when</th></tr>
  <tr><td>Sort the d distinct values by count</td><td>O(n + d log d)</td><td>O(d)</td><td>you want the shortest code</td></tr>
  <tr><td>Size-k heap</td><td>O(n + d log k)</td><td>O(d + k)</td><td>k is small, or the data arrives as a stream</td></tr>
  <tr><td>Buckets by count</td><td>O(n)</td><td>O(n)</td><td>counts are integers, as here</td></tr>
  <tr><td>Quickselect</td><td>O(d) on average, O(d²) worst</td><td>O(d)</td><td>order does not matter and you want the lowest average</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Ties, order and k</span>
  If two values share the k-th count the problem must say the answer is
  unique or accept any of them; none of the three methods promises a
  particular one. The heap returns the result smallest-count-first until
  you reverse it, and quickselect returns it in no particular order.
  Check the statement before you decide whether the output has to be
  sorted. Also decide what <code>k</code> larger than the number of
  distinct values should do, because the quickselect loop above assumes
  <code>k</code> is at most d.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Counts are integers between
  1 and n, so I can bucket by count and read from the top, which is O(n).
  If k is tiny or the input is a stream, I'd use a size-k heap and pay
  O(log k) per distinct value."
</div>

<h3>Building a heap from an array in O(n), not O(n log n)</h3>
<p>
  Pushing n elements one at a time costs O(n log n) — each push is
  O(log n). But if you already have the full array upfront, you can build
  the heap faster: place all elements as-is, then sift-down starting from
  the last <em>non-leaf</em> node backward to the root.
</p>
<pre><code>function siftDown(arr, i, n) { <span class="c">// the same loop as the class's #siftDown, as a free function</span>
  while (true) {
    let smallest = i;
    const left = 2 * i + 1, right = 2 * i + 2;
    if (left < n && arr[left] < arr[smallest]) smallest = left;
    if (right < n && arr[right] < arr[smallest]) smallest = right;
    if (smallest === i) break;
    [arr[i], arr[smallest]] = [arr[smallest], arr[i]];
    i = smallest;
  }
}

function heapify(arr) {
  const n = arr.length;
  <span class="c">// last non-leaf node is at index Math.floor(n/2) - 1 — every index after that is a leaf</span>
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n);
  }
  return arr;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Why this is O(n), not O(n log n) — worth being able to explain</span>
  Most nodes are near the bottom of the tree, where sift-down has almost
  no distance to travel. Only the few nodes near the root can sift all the
  way down. Summing "number of nodes at each level × how far they can
  sift" across the whole tree converges to O(n), not O(n log n) — a
  genuinely surprising result that's worth knowing exists, even if you
  never re-derive the summation live in an interview.
</div>

<h3>The two-heap pattern — running median of a data stream</h3>
<p>
  A single heap gives you the min <em>or</em> the max. Finding the
  <b>median</b> of a growing stream needs both at once — the classic
  trick is to split the data across two heaps that meet in the middle.
</p>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="A max-heap holding the smaller half of the numbers and a min-heap holding the larger half, with their two roots forming the median">
    <g class="rough">
      <rect class="boxr" x="40" y="30" width="260" height="100" rx="8" />
      <rect class="boxg" x="340" y="30" width="260" height="100" rx="8" />
    </g>
    <text class="lbl rd" x="60" y="55" style="font-size:14px">max-heap: smaller half</text>
    <text class="sm" x="60" y="80">e.g. {1, 3, 5}</text>
    <text class="sm" x="60" y="100">root = 5 (biggest of small half)</text>
    <text class="lbl gr" x="360" y="55" style="font-size:14px">min-heap: larger half</text>
    <text class="sm" x="360" y="80">e.g. {7, 9}</text>
    <text class="sm" x="360" y="100">root = 7 (smallest of big half)</text>
    <text class="lbl" x="20" y="160" style="font-size:15px">median = 5 (odd count) or avg(5, 7) if both heaps were equal-sized</text>
  </svg>
  <figcaption>Both roots sit right at the midpoint — the median is always O(1) to read once the split is balanced.</figcaption>
</figure>
<pre><code>class MedianFinder {
  #small = new MaxHeap(); <span class="c">// same MinHeap code, comparisons flipped — holds the smaller half</span>
  #large = new MinHeap(); <span class="c">// holds the larger half</span>

  addNum(num) {
    this.#small.push(num);
    this.#large.push(this.#small.pop()); <span class="c">// always route through #small first, then rebalance</span>

    if (this.#small.size() < this.#large.size()) {
      this.#small.push(this.#large.pop()); <span class="c">// keep #small equal-or-one-more than #large</span>
    }
  }

  findMedian() {
    if (this.#small.size() > this.#large.size()) return this.#small.peek();
    return (this.#small.peek() + this.#large.peek()) / 2;
  }
}</code></pre>
<p class="sub">
  Every insert is O(log n), and reading the median is O(1) — compare that
  to re-sorting on every insert (O(n log n) each time) or inserting into a
  sorted array (O(n) shifting each time). The two-heap split is what
  makes a <em>streaming</em> median tractable at all.
</p>


<h3>See it sink</h3>
<p>Watch the last element take the root's place and then sink. It only ever follows the smaller child, so it touches one node per level — that is the log n.</p>

<div class="demo">
  <div class="demo__bar">Heap — sift-down after extract-min</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="hp-code"></div>
        <div class="loop-bar"><i id="hp-bar"></i></div>
        <p class="loop-step" id="hp-step"></p>
        <div class="demo__ctl">
          <button class="btn" id="hp-prev" type="button">← Back</button>
          <button class="btn" id="hp-next" type="button">Next step →</button>
          <button class="btn" id="hp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="hp-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">As a tree, level by level</div>
          <div id="hp-p-tree"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="hp-cells"></div></div></div>
    <p class="demo__note" id="hp-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "hp";
  var CODE = ["const min = h[0];","h[0] = h.pop();","let i = 0;","while (true) {","  let small = i, l = 2*i+1, r = 2*i+2;","  if (l < h.length && h[l] < h[small]) small = l;","  if (r < h.length && h[r] < h[small]) small = r;","  if (small === i) break;","  [h[i], h[small]] = [h[small], h[i]]; i = small;","}"];
  var STEPS = [{"cells":[{"v":"1","c":"","p":""},{"v":"3","c":"","p":""},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""},{"v":"8","c":"","p":""}],"panels":{"tree":["1","3  6","5  9  8"]},"note":"A min-heap as an array. Children of index i live at 2i+1 and 2i+2 — no pointers needed.","line":1},{"cells":[{"v":"8","c":"hot","p":"node"},{"v":"3","c":"","p":""},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["8","3  6","5  9"]},"note":"Extract-min returns 1. The LAST element (8) moves to the root to keep the tree complete — now it's probably in the wrong place.","line":2},{"cells":[{"v":"8","c":"hot","p":"node"},{"v":"3","c":"in","p":"child"},{"v":"6","c":"in","p":"child"},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["8","3  6","5  9"]},"note":"Compare 8 with its children, 3 and 6. The smaller child is 3.","line":6},{"cells":[{"v":"3","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["3","8  6","5  9"]},"note":"8 > 3, so swap. Sift-down always follows the smaller child, so it makes at most log n swaps.","line":9},{"cells":[{"v":"3","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"6","c":"","p":""},{"v":"5","c":"in","p":"child"},{"v":"9","c":"in","p":"child"}],"panels":{"tree":["3","8  6","5  9"]},"note":"Compare 8 with its children, 5 and 9. The smaller child is 5.","line":6},{"cells":[{"v":"3","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"9","c":"","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"8 > 5, so swap. Sift-down always follows the smaller child, so it makes at most log n swaps.","line":9},{"cells":[{"v":"3","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"9","c":"","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"Index 3 has no children — sift-down is done.","line":8},{"cells":[{"v":"3","c":"done","p":""},{"v":"5","c":"done","p":""},{"v":"6","c":"done","p":""},{"v":"8","c":"done","p":""},{"v":"9","c":"done","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"Heap restored: [3, 5, 6, 8, 9]. Root is 3, the new minimum.","line":10}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var stepEl = document.getElementById(ID + "-step");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fillTree(el, levels) {
    el.innerHTML = "";
    levels.forEach(function (level) {
      var row = document.createElement("div");
      row.className = "loop-level";
      level.split("  ").forEach(function (t) {
        var chip = document.createElement("span");
        chip.className = "loop-frame";
        chip.textContent = t;
        row.appendChild(chip);
      });
      el.appendChild(row);
    });
  }

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      var panel = document.getElementById(ID + "-p-" + k);
      if (k === "tree") fillTree(panel, s.panels[k]);
      else fill(panel, s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    if (stepEl) stepEl.textContent = "Step " + (i + 1) + " of " + STEPS.length;
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<h3>Merge K sorted lists, and the K smallest pairs</h3>
<p>
  You have k lists, each already sorted, and you want one sorted list. Two
  naive plans fail. Concatenating and sorting costs O(N log N) for N total
  elements and ignores that the lists are sorted. Merging them one at a
  time into a growing result copies that result again at every step, so
  with k lists of equal length it costs O(N · k).
</p>
<p>
  Look at what the next output must be. It is the smallest element not yet
  output. Every list is sorted, so the smallest unused element of a list is
  its <em>front</em>. So the next output is the smallest of at most k
  fronts. That is a min-heap question. Keep the heap holding exactly one
  front per non-empty list. Pop the smallest, output it, and push the next
  element of the list it came from. The heap never holds more than k
  entries, so each of the N pops and pushes costs O(log k), and the whole
  merge is <b>O(N log k)</b> time with O(k) extra space beyond the output.
</p>
<pre><code>function mergeKSorted(lists) {
  const heap = new Heap((a, b) =&gt; a[0] - b[0]); <span class="c">// entry = [value, which list, index in that list]</span>
  lists.forEach((list, i) =&gt; {
    if (list.length &gt; 0) heap.push([list[0], i, 0]);
  });
  const merged = [];
  while (heap.size() &gt; 0) {
    const [value, i, j] = heap.pop();
    merged.push(value);
    if (j + 1 &lt; lists[i].length) heap.push([lists[i][j + 1], i, j + 1]);
  }
  return merged;
}</code></pre>
<p>
  Each heap entry is a tuple <code>[value, which list, position in that
  list]</code>: the value to compare, and the two numbers needed to find
  the successor. Without the list index you could not know where to
  refill from.
</p>
<h4>Dry run: mergeKSorted([[1, 4, 7], [2, 5], [3, 6, 9]])</h4>
<table>
  <tr><th>Step</th><th>Pop (from list)</th><th>Heap after the refill (value, list)</th><th>Output so far</th></tr>
  <tr><td>start</td><td>—</td><td>1 (L0), 2 (L1), 3 (L2)</td><td>[]</td></tr>
  <tr><td>1</td><td>1 (L0)</td><td>2 (L1), 3 (L2), 4 (L0)</td><td>[1]</td></tr>
  <tr><td>2</td><td>2 (L1)</td><td>3 (L2), 4 (L0), 5 (L1)</td><td>[1, 2]</td></tr>
  <tr><td>3</td><td>3 (L2)</td><td>4 (L0), 5 (L1), 6 (L2)</td><td>[1, 2, 3]</td></tr>
  <tr><td>4</td><td>4 (L0)</td><td>5 (L1), 6 (L2), 7 (L0)</td><td>[1, 2, 3, 4]</td></tr>
  <tr><td>5</td><td>5 (L1)</td><td>6 (L2), 7 (L0) — L1 is used up, nothing to refill</td><td>[1, 2, 3, 4, 5]</td></tr>
  <tr><td>6</td><td>6 (L2)</td><td>7 (L0), 9 (L2)</td><td>[1, 2, 3, 4, 5, 6]</td></tr>
  <tr><td>7</td><td>7 (L0)</td><td>9 (L2) — L0 is used up</td><td>[1, 2, 3, 4, 5, 6, 7]</td></tr>
  <tr><td>8</td><td>9 (L2)</td><td>empty</td><td>[1, 2, 3, 4, 5, 6, 7, 9]</td></tr>
</table>
<p class="sub">
  The heap shrinks from three entries to none as lists run out. It never
  grows past three, which is k. That bound is what turns log N into log k.
</p>
<h4>The linked-list version</h4>
<p>
  The classic interview form gives the lists as linked lists. The heap can
  then hold the <em>nodes themselves</em>, because a node already knows its
  successor, and the comparator reads <code>val</code>. The merged list is
  built by re-linking the existing nodes, so nothing is copied.
</p>
<pre><code>function mergeKLists(lists) {
  const heap = new Heap((a, b) =&gt; a.val - b.val); <span class="c">// the entries are the list nodes themselves</span>
  for (const head of lists) if (head !== null) heap.push(head);
  const dummy = { val: 0, next: null };
  let tail = dummy;
  while (heap.size() &gt; 0) {
    const node = heap.pop();
    tail.next = node;
    tail = node;
    if (node.next !== null) heap.push(node.next);
  }
  return dummy.next;
}</code></pre>
<p class="sub">
  Two edge cases explain the guards. A list can be empty, which here is
  <code>null</code> as a head, and an empty head must not be pushed, since
  the comparator would read <code>null.val</code>. And <code>lists</code>
  itself can be empty, in which case the heap never fills and
  <code>dummy.next</code> is <code>null</code>, the right answer. The
  dummy node is the usual trick from the linked-list chapter, so that
  attaching the first node is not a special case.
</p>
<div class="warn">
  <span class="ttl">⚠ Another way to hit the same bound</span>
  Merging the lists in pairs, then merging the results in pairs, and so on,
  also gives O(N log k): there are about log k rounds, and each round
  touches every element once. It needs no heap, and for linked lists it
  uses O(1) extra space. The heap version is simpler to write and is the one
  that still works when the lists are <em>streams</em> you cannot hold at
  once.
</div>
<h4>K pairs with the smallest sums</h4>
<p>
  Given two sorted arrays <code>nums1</code> and <code>nums2</code>, find
  the k pairs <code>(u, v)</code>, with u from the first and v from the
  second, that have the smallest sums. There are m · n pairs, so listing
  them all and sorting is far too much when k is small.
</p>
<p>
  Look at it as k-way merge in disguise. For each <code>i</code> the
  pairs <code>(nums1[i], nums2[0]), (nums1[i], nums2[1]), ...</code> form
  a list whose sums are already sorted, because <code>nums2</code> is
  sorted. That is m sorted lists, generated on demand. So seed the heap
  with the front of each list, which is the pair <code>(i, 0)</code>, and
  pop and refill exactly as before: popping <code>(i, j)</code> pushes
  <code>(i, j + 1)</code>.
</p>
<pre><code>function kSmallestPairs(nums1, nums2, k) {
  const result = [];
  if (nums1.length === 0 || nums2.length === 0) return result;
  const heap = new Heap((a, b) =&gt; a[0] - b[0]); <span class="c">// entry = [sum, i, j]</span>
  for (let i = 0; i &lt; Math.min(nums1.length, k); i++) heap.push([nums1[i] + nums2[0], i, 0]);
  while (result.length &lt; k &amp;&amp; heap.size() &gt; 0) {
    const [, i, j] = heap.pop();
    result.push([nums1[i], nums2[j]]);
    if (j + 1 &lt; nums2.length) heap.push([nums1[i] + nums2[j + 1], i, j + 1]);
  }
  return result;
}</code></pre>
<p>
  Two things keep this cheap. Only the first <code>min(m, k)</code> rows are
  seeded: any pair in row k or later has a sum at least as large as the
  front pairs of the k rows before it, so those k pairs always beat it (or
  tie with it) and it can be skipped.
  And no visited set is needed. In the merge view each pair
  <code>(i, j)</code> is pushed by exactly one event, the pop of
  <code>(i, j - 1)</code> (or the seeding, for <code>j = 0</code>), so no
  pair is ever pushed twice.
</p>
<h4>Dry run: kSmallestPairs([1, 7, 11], [2, 4, 6], 3)</h4>
<table>
  <tr><th>Step</th><th>Pop</th><th>Heap after the refill (pair = sum)</th><th>Result</th></tr>
  <tr><td>seed</td><td>—</td><td>(1,2)=3, (7,2)=9, (11,2)=13</td><td>[]</td></tr>
  <tr><td>1</td><td>(1,2)</td><td>(1,4)=5, (7,2)=9, (11,2)=13</td><td>[(1,2)]</td></tr>
  <tr><td>2</td><td>(1,4)</td><td>(1,6)=7, (7,2)=9, (11,2)=13</td><td>[(1,2), (1,4)]</td></tr>
  <tr><td>3</td><td>(1,6)</td><td>(7,2)=9, (11,2)=13</td><td>[(1,2), (1,4), (1,6)]</td></tr>
</table>
<p class="sub">
  The loop stops at three results. Cost: the heap holds at most
  <code>min(m, k)</code> entries, there are at most k pops, and each pop
  does one push, so it is O(k log min(m, k)). The other arrays in this
  family reuse the same engine: "k-th smallest in a sorted matrix" is
  k-way merge over the rows, and "smallest range covering one number from
  each of k lists" is the same heap plus a running maximum. Both are
  practice problems for this chapter.
</p>
<div class="warn">
  <span class="ttl">⚠ Pitfalls in k-way merges</span>
  Pushing an <em>empty</em> list's front (reading index 0 of
  <code>[]</code> gives <code>undefined</code>, and <code>undefined - 3</code>
  is <code>NaN</code>). Forgetting the position in the tuple, so you cannot
  refill. Seeding every row when k is small, which costs O(m log m) instead
  of O(min(m, k) log min(m, k)). And, if the arrays are not guaranteed
  sorted, trusting an algorithm that depends on it.
</div>

<h3>Greedy with a heap: the best option available right now</h3>
<p>
  A large family of interview problems has this shape. You walk through
  time (or through a sorted list), options become available as you go,
  and at each decision you want the <em>best</em> option among those
  available. "Best of what is available, and the set keeps changing" is
  the sentence that calls for a heap. The heap is used in two ways, and
  naming the way tells you what to push and when to pop:
</p>
<ul>
  <li><b>Release, then take the best.</b> Sort the options by when they become available. As time passes, move each newly available option into the heap, then pop the best one to use it (IPO, task scheduler, reorganize string).</li>
  <li><b>Take now, undo the worst later.</b> Make the cheap choice for everything, keep the choices in a heap, and when you run out of budget, reverse the least valuable choice in the heap (furthest building).</li>
</ul>
<table>
  <tr><th>Problem</th><th>The heap holds</th><th>Ordered by</th><th>Pop when</th></tr>
  <tr><td>Meeting rooms II</td><td>end time of each room in use</td><td>earliest end first (min)</td><td>a meeting starts at or after the earliest end</td></tr>
  <tr><td>Connect sticks</td><td>stick lengths</td><td>shortest first (min)</td><td>every step: take the two shortest</td></tr>
  <tr><td>Furthest building</td><td>climbs paid with a ladder</td><td>smallest climb first (min)</td><td>more climbs than ladders</td></tr>
  <tr><td>IPO</td><td>profits of affordable projects</td><td>largest profit first (max)</td><td>every round: start the best</td></tr>
  <tr><td>Task scheduler</td><td>remaining counts of tasks that can run</td><td>most remaining first (max)</td><td>every time unit</td></tr>
  <tr><td>Reorganize string</td><td>copies left of each letter</td><td>most copies first (max)</td><td>every character placed</td></tr>
</table>

<h4>Meeting rooms II: how many rooms at once</h4>
<p>
  Given meeting intervals, find the fewest rooms that fit them all. Sort by
  start time and walk through the meetings. A new meeting needs a room. It
  can reuse a room only if that room's meeting has already ended, and the
  room most likely to be free is the one whose meeting ends <em>earliest</em>.
  So the heap holds the end time of the current meeting in each room in
  use, and the root is the earliest end. If the root is at or before the new
  start, reuse that room (pop it and push the new end). Otherwise a room
  has to be added (push only).
</p>
<pre><code>function minMeetingRooms(intervals) {
  const sorted = intervals.slice().sort((a, b) =&gt; a[0] - b[0]);
  const ends = new MinHeap(); <span class="c">// end time of the latest meeting in each room in use</span>
  for (const [start, end] of sorted) {
    if (ends.size() &gt; 0 &amp;&amp; ends.peek() &lt;= start) ends.pop(); <span class="c">// that room is free: reuse it</span>
    ends.push(end);
  }
  return ends.size();
}</code></pre>
<h4>Dry run: [[0, 30], [5, 10], [12, 25], [15, 20]]</h4>
<table>
  <tr><th>Meeting</th><th>Heap before</th><th>Action</th><th>Heap after</th></tr>
  <tr><td>[0, 30]</td><td>{}</td><td>no room in use, push 30</td><td>{30}</td></tr>
  <tr><td>[5, 10]</td><td>{30}</td><td>30 &gt; 5, so a new room: push 10</td><td>{10, 30}</td></tr>
  <tr><td>[12, 25]</td><td>{10, 30}</td><td>10 ≤ 12: reuse that room, pop 10 and push 25</td><td>{25, 30}</td></tr>
  <tr><td>[15, 20]</td><td>{25, 30}</td><td>25 &gt; 15, so a new room: push 20</td><td>{20, 25, 30}</td></tr>
</table>
<p class="sub">
  The answer is the final heap size, 3. The size only ever grows when no
  room was free, because a reuse pops and pushes in the same step, so the
  size at the end is the largest number of rooms ever needed at once.
  Cost: O(n log n) for the sort and O(n log n) for the heap. Watch the
  boundary: <code>peek() &lt;= start</code> treats a meeting that ends at 10
  and one that starts at 10 as back-to-back, which is what the usual
  statement of the problem means. The same answer also comes from the
  sweep-line method in <a href="/dsa/dsa-intervals">Intervals</a>.
</p>

<h4>Connect sticks: always merge the two shortest</h4>
<p>
  Joining two sticks costs the sum of their lengths, and you must end with
  one stick. Every stick that takes part in a merge has its length paid
  again in every later merge that includes the merged result. So lengths
  merged <em>early</em> are paid for many times, and lengths merged
  <em>last</em> only once. To pay the least, merge the shortest sticks
  first and keep the long ones for the end. That is Huffman's idea.
</p>
<pre><code>function connectSticks(sticks) {
  const heap = new MinHeap(sticks);
  let cost = 0;
  while (heap.size() &gt; 1) {
    const merged = heap.pop() + heap.pop();
    cost += merged;
    heap.push(merged);
  }
  return cost;
}</code></pre>
<p class="sub">
  <code>connectSticks([2, 4, 3])</code>: take 2 and 3, cost 5, push 5 to
  get {4, 5}; take 4 and 5, cost 9; the total is 14. Merging 3 and 4 first
  would cost 7 and then 9 for 16, so the greedy choice does matter. Cost:
  each of the n - 1 merges does two pops and one push, so O(n log n). We
  checked it against trying every merge order on random inputs of up to six
  sticks.
</p>

<h4>Furthest building you can reach: ladders for the biggest climbs</h4>
<p>
  You walk across buildings. A drop or a flat step is free. A climb of
  <code>d</code> costs <code>d</code> bricks or one ladder, and a ladder
  covers any height. How far can you get? The decision for a climb is hard
  to make in the moment, because you do not know yet what lies ahead. So
  delay it. Give <em>every</em> climb a ladder as you meet it, and put its
  height in a min-heap. Once there are more laddered climbs than ladders,
  one of them has to be paid in bricks. The cheapest one to pay in bricks
  is the <em>smallest</em> laddered climb, which is the heap's root. Pop it
  and pay for it. If the bricks go below zero, you cannot cross the step
  you were on.
</p>
<pre><code>function furthestBuilding(heights, bricks, ladders) {
  const onLadders = new MinHeap(); <span class="c">// the climbs currently given a ladder</span>
  for (let i = 0; i &lt; heights.length - 1; i++) {
    const climb = heights[i + 1] - heights[i];
    if (climb &lt;= 0) continue;
    onLadders.push(climb);
    if (onLadders.size() &gt; ladders) {
      bricks -= onLadders.pop(); <span class="c">// the smallest laddered climb is paid in bricks instead</span>
      if (bricks &lt; 0) return i;
    }
  }
  return heights.length - 1;
}</code></pre>
<h4>Dry run: heights [4, 2, 7, 6, 9, 14, 12], 5 bricks, 1 ladder</h4>
<table>
  <tr><th>Step</th><th>Climb</th><th>Heap of laddered climbs</th><th>Action</th></tr>
  <tr><td>0 → 1</td><td>−2</td><td>{}</td><td>drop, free</td></tr>
  <tr><td>1 → 2</td><td>5</td><td>{5}</td><td>one ladder, one climb on it</td></tr>
  <tr><td>2 → 3</td><td>−1</td><td>{5}</td><td>drop, free</td></tr>
  <tr><td>3 → 4</td><td>3</td><td>{3, 5} then pop 3</td><td>over the ladder limit: pay 3 bricks, 2 left</td></tr>
  <tr><td>4 → 5</td><td>5</td><td>{5, 5} then pop 5</td><td>pay 5 bricks, but only 2 are left: bricks = −3, so stop</td></tr>
</table>
<p class="sub">
  The loop stops at index 4 (the climb from building 4 to building 5
  fails), so the answer is 4. The invariant that makes it correct: after
  each step, the heap holds exactly the <em>largest</em> climbs seen so far
  (as many as there are ladders), and every other climb has been paid in
  bricks. Ladders on the biggest climbs and bricks on the rest is the
  cheapest way to cover a prefix, so the first step where the bricks run
  out is the furthest reachable. Cost: O(n log L) for L ladders. We checked
  it against a search over every ladder-or-bricks choice on random inputs.
</p>
<div class="warn">
  <span class="ttl">⚠ Three slips in this one</span>
  A zero or negative step must be skipped before pushing, or the heap
  fills with free steps. The test <code>bricks &lt; 0</code> must come
  <em>after</em> paying, not before. And the failing step is
  <code>i</code> (you stood on building <code>i</code> and could not
  climb), so return <code>i</code>, not <code>i + 1</code>. With zero
  ladders the heap is popped immediately, which is correct: every climb is
  paid in bricks.
</div>

<h4>IPO: start the most profitable project you can afford</h4>
<p>
  You have capital <code>w</code> and may start at most k projects. Each
  project needs some capital to start and adds its profit to your capital
  when finished. The capital you hold only grows, so a project that is
  affordable now stays affordable. Sort projects by the capital they need.
  Before each round, move every project you can now afford into a
  <em>max</em>-heap of profits, then start the one with the largest profit.
  Starting the largest affordable profit leaves you with the most capital
  after this round, and more capital never makes a project harder to afford.
</p>
<pre><code>function findMaximizedCapital(k, w, profits, capital) {
  const projects = profits.map((p, i) =&gt; [capital[i], p]).sort((a, b) =&gt; a[0] - b[0]);
  const affordable = new MaxHeap(); <span class="c">// profits of the projects we can start right now</span>
  let next = 0;
  for (let round = 0; round &lt; k; round++) {
    while (next &lt; projects.length &amp;&amp; projects[next][0] &lt;= w) {
      affordable.push(projects[next][1]);
      next++;
    }
    if (affordable.size() === 0) break;
    w += affordable.pop();
  }
  return w;
}</code></pre>
<p class="sub">
  <code>findMaximizedCapital(2, 0, [1, 2, 3], [0, 1, 1])</code>: with 0
  capital only the first project is affordable, so profit 1 is taken and
  capital becomes 1. Now both other projects are affordable, the heap holds
  {2, 3}, and 3 is taken for a final capital of 4. Cost: O(n log n) for the
  sort plus at most n pushes and k pops, O((n + k) log n). The
  <code>break</code> matters: if nothing is affordable the capital cannot
  change any more, so further rounds would only repeat. We checked the
  function against trying every project order, on random inputs with
  profits of zero or more, as the problem states.
</p>

<h4>Task scheduler: run the task with the most left</h4>
<p>
  Tasks are labelled with letters. One task runs per time unit, and two
  runs of the same letter must have at least <code>n</code> other units
  between them. Find the shortest time to finish them all (idle units
  count). The greedy move is to run, at each unit, whichever allowed task
  has the <em>most</em> runs left: the task with the longest remaining
  chain also has the most forced waiting ahead of it, so it should not be
  left for last. After a task runs, it sleeps
  for <code>n</code> units and cannot return to the heap until its
  cooldown ends. So there are two containers: a max-heap of tasks that may
  run, and a queue of sleeping ones in the order they went to sleep.
</p>
<pre><code>function leastInterval(tasks, n) {
  const counts = new Map();
  for (const t of tasks) counts.set(t, (counts.get(t) ?? 0) + 1);
  const ready = new MaxHeap([...counts.values()]); <span class="c">// remaining runs of each task that may run now</span>
  const cooling = []; <span class="c">// [time it may run again, remaining runs], in the order they went to sleep</span>
  let time = 0;
  while (ready.size() &gt; 0 || cooling.length &gt; 0) {
    time++;
    if (ready.size() &gt; 0) {
      const left = ready.pop() - 1;
      if (left &gt; 0) cooling.push([time + n, left]);
    }
    if (cooling.length &gt; 0 &amp;&amp; cooling[0][0] === time) ready.push(cooling.shift()[1]);
  }
  return time;
}</code></pre>
<h4>Dry run: tasks A A A B B B, n = 2</h4>
<table>
  <tr><th>Time</th><th>Action</th><th>Heap (counts left)</th><th>Sleeping (ready at time, left)</th></tr>
  <tr><td>1</td><td>run a task with 3 left, 2 remain</td><td>{3}</td><td>(3, 2)</td></tr>
  <tr><td>2</td><td>run the other, 2 remain</td><td>{}</td><td>(3, 2), (4, 2)</td></tr>
  <tr><td>3</td><td>idle, the first task wakes</td><td>{2}</td><td>(4, 2)</td></tr>
  <tr><td>4</td><td>run, 1 remains</td><td>{2}</td><td>(6, 1)</td></tr>
  <tr><td>5</td><td>run the other, 1 remains</td><td>{}</td><td>(6, 1), (7, 1)</td></tr>
  <tr><td>6</td><td>idle, the first task wakes</td><td>{1}</td><td>(7, 1)</td></tr>
  <tr><td>7</td><td>run, none remain</td><td>{1}</td><td>—</td></tr>
  <tr><td>8</td><td>run the other, none remain</td><td>{}</td><td>—</td></tr>
</table>
<p class="sub">
  The answer is 8 (A B idle A B idle A B). Notice the heap simulation
  advances one time unit per loop turn, so it costs
  O(answer · log u) for u distinct letters. That is fine for small
  <code>n</code> but not when <code>n</code> is huge: two tasks
  <code>A A</code> with <code>n = 1000000000</code> would make about a
  billion turns. The closed form avoids that: with <code>m</code> the
  highest count and <code>c</code> the number of letters that reach it, the
  answer is <code>max(tasks.length, (m - 1) * (n + 1) + c)</code>, which
  takes O(T) for T tasks. We compared the simulation, the formula and an
  exhaustive search on random inputs and they agree. The heap version is
  still worth knowing because it extends to "also print the schedule".
</p>

<h4>Reorganize string: never place the same letter twice in a row</h4>
<p>
  Rearrange a string so that no two adjacent characters are equal, or say
  it is impossible. Impossible exactly when some letter appears more than
  <code>ceil(n / 2)</code> times, because even placing it in every other slot
  needs that many. Otherwise build the answer left to right with a max-heap
  of <code>[letter, copies left]</code>. At each step place the letter with
  the most copies left, except that the letter you placed one step ago must
  sit this step out. Pop the top letter, put it in the result, and only
  <em>then</em> return the previous letter to the heap. The new letter is
  held back and goes into the heap on the next turn.
</p>
<pre><code>function reorganizeString(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) ?? 0) + 1);
  const heap = new Heap((a, b) =&gt; b[1] - a[1]); <span class="c">// [letter, copies left], the most copies on top</span>
  for (const entry of counts) heap.push(entry);
  let result = "";
  let resting = null; <span class="c">// the letter placed last step: it may not go first this step</span>
  while (heap.size() &gt; 0 || resting !== null) {
    if (heap.size() === 0) return ""; <span class="c">// only the resting letter is left, and it would touch itself</span>
    const [ch, left] = heap.pop();
    result += ch;
    if (resting !== null) heap.push(resting);
    resting = left &gt; 1 ? [ch, left - 1] : null;
  }
  return result;
}</code></pre>
<h4>Dry run: reorganizeString("aaabbc")</h4>
<table>
  <tr><th>Turn</th><th>Pop (copies it had)</th><th>Result</th><th>Heap after</th><th>Resting</th></tr>
  <tr><td>1</td><td>a (had 3)</td><td>a</td><td>b2, c1</td><td>a2</td></tr>
  <tr><td>2</td><td>b (had 2)</td><td>ab</td><td>a2, c1</td><td>b1</td></tr>
  <tr><td>3</td><td>a (had 2)</td><td>aba</td><td>c1, b1</td><td>a1</td></tr>
  <tr><td>4</td><td>c (had 1)</td><td>abac</td><td>b1, a1</td><td>none</td></tr>
  <tr><td>5</td><td>b (had 1)</td><td>abacb</td><td>a1</td><td>none</td></tr>
  <tr><td>6</td><td>a (had 1)</td><td>abacba</td><td>empty</td><td>none</td></tr>
</table>
<p class="sub">
  Adjacent letters are never equal, because a letter is held out for one
  turn after it is placed. The only way to get stuck is the heap being empty
  while a letter is still resting, which means that letter has more copies
  than the others can separate, and the function returns
  <code>""</code>. Cost: n pops and pushes on a heap of at most u letters,
  so O(n log u). We checked it on random strings of up to seven letters
  against trying every ordering: it succeeds exactly when an ordering
  exists, and then the result is a valid rearrangement.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "At every step the choice is
  the best of what's currently available, and what's available changes as
  time passes. That's a greedy over a changing set, so I'll keep the
  available options in a heap, max or min depending on what 'best' means,
  and pop one each step."
</div>

<h3>Lazy deletion and the sliding-window median</h3>
<p>
  A heap is built for removing the <em>top</em>. Removing an arbitrary
  element is a different matter: finding it takes O(n), because a heap says
  nothing about where a given value sits. Some problems still need it. The
  median of every window of size k slides along an array: each step adds
  one number and removes the number that leaves the window, which may be
  anywhere in either heap.
</p>
<p>
  The fix is <b>lazy deletion</b>. Do not remove it. Write down that one
  copy of that value is now dead, and leave it where it is. Dead entries
  only matter when they reach the top, so whenever the top of a heap is
  dead, pop it for real and cross it off the list. The heap always holds a
  mix of live and dead entries. What changes are three rules:
</p>
<ul>
  <li><b>Count live entries yourself.</b> <code>heap.size()</code> includes dead entries, so the two-heap balance has to use separate live counters.</li>
  <li><b>Keep both tops live.</b> After every change, prune the top of any heap that might now hold a dead entry. Then <code>peek()</code> is always trustworthy.</li>
  <li><b>Record deaths by value, with a count.</b> Equal numbers are interchangeable, so a <code>Map</code> from value to "copies owed" is enough, and it handles duplicates.</li>
</ul>
<pre><code>function medianSlidingWindow(nums, k) {
  const small = new MaxHeap(); <span class="c">// lower half</span>
  const large = new MinHeap(); <span class="c">// upper half</span>
  const owed = new Map(); <span class="c">// value -&gt; how many copies are dead but still sitting in a heap</span>
  let smallLive = 0, largeLive = 0;

  const prune = (heap) =&gt; {
    while (heap.size() &gt; 0 &amp;&amp; (owed.get(heap.peek()) ?? 0) &gt; 0) {
      owed.set(heap.peek(), owed.get(heap.peek()) - 1);
      heap.pop();
    }
  };
  const rebalance = () =&gt; {
    if (smallLive &gt; largeLive + 1) {
      large.push(small.pop());
      smallLive--; largeLive++;
      prune(small);
    } else if (smallLive &lt; largeLive) {
      small.push(large.pop());
      largeLive--; smallLive++;
      prune(large);
    }
  };
  const add = (x) =&gt; {
    if (smallLive === 0 || x &lt;= small.peek()) { small.push(x); smallLive++; }
    else { large.push(x); largeLive++; }
    rebalance();
  };
  const remove = (x) =&gt; {
    owed.set(x, (owed.get(x) ?? 0) + 1);
    if (x &lt;= small.peek()) {
      smallLive--;
      if (x === small.peek()) prune(small);
    } else {
      largeLive--;
      if (x === large.peek()) prune(large);
    }
    rebalance();
  };

  const medians = [];
  for (let i = 0; i &lt; nums.length; i++) {
    add(nums[i]);
    if (i &gt;= k) remove(nums[i - k]);
    if (i &gt;= k - 1) medians.push(k % 2 === 1 ? small.peek() : (small.peek() + large.peek()) / 2);
  }
  return medians;
}</code></pre>
<p>
  To decide which half a leaving number belongs to, the code uses the same
  test as insertion: <code>x &lt;= small.peek()</code>, "does it belong to
  the lower half?". That is correct even when an equal value also sits in
  the other heap, since equal values are interchangeable and only the live
  counts matter.
</p>
<h4>Dry run: medianSlidingWindow([2, 8, 4, 5], 3)</h4>
<table>
  <tr><th>Step</th><th>Lower heap (max)</th><th>Upper heap (min)</th><th>Owed</th><th>Live (lower / upper)</th><th>Median</th></tr>
  <tr><td>add 2</td><td>{2}</td><td>{}</td><td>—</td><td>1 / 0</td><td></td></tr>
  <tr><td>add 8</td><td>{2}</td><td>{8}</td><td>—</td><td>1 / 1</td><td></td></tr>
  <tr><td>add 4</td><td>{4, 2}</td><td>{8}</td><td>—</td><td>2 / 1</td><td>4</td></tr>
  <tr><td>add 5</td><td>{4, 2}</td><td>{5, 8}</td><td>—</td><td>2 / 2</td><td></td></tr>
  <tr><td>remove 2</td><td>{5, 4, 2}</td><td>{8}</td><td>2 × 1</td><td>2 / 1</td><td>5</td></tr>
</table>
<p class="sub">
  The last row shows the idea at work. The number 2 left the window, but it
  sits at the bottom of the lower heap, not at its top, so it stays as a
  dead entry and is only recorded in the owed map. The live counts show the
  lower half is now <em>one</em> element too short, so the upper heap's
  smallest, 5, moves down. The lower heap's top is 5 (live), and the window
  <code>[8, 4, 5]</code> has median 5. The earlier window
  <code>[2, 8, 4]</code> has median 4.
</p>
<p>
  Cost: every element is pushed once on arrival, and each rebalancing moves
  at most one element, so there are O(n) pushes and pops in all, each
  O(log of the heap size). The heaps can contain buried dead entries, so
  their size is bounded by n rather than k, and the total is O(n log n)
  time with O(n) space in the worst case. A structure that can delete by
  value (an ordered set, or a heap that tracks each item's position)
  brings it to O(n log k).
</p>
<div class="warn">
  <span class="ttl">⚠ Where lazy deletion goes wrong</span>
  Using <code>heap.size()</code> instead of the live counts to decide
  whether the heaps are balanced. Forgetting to prune after the rebalance
  moves a top element out, which leaves a dead entry on top and makes
  <code>peek()</code> lie. Deciding which heap an outgoing number is in by
  scanning (O(n)) instead of by comparing with the tops. And for the even
  case, adding two numbers as <code>(a + b) / 2</code> is fine in
  JavaScript, because numbers are doubles, but the result can be a
  fraction, so a problem that expects an integer needs rounding spelled
  out. We tested this function against sorting every window, on thousands
  of random arrays with many duplicates.
</div>
<p class="sub">
  The same trick shows up wherever a priority can change: instead of
  updating an entry's priority in place, push a <em>new</em> entry and skip
  stale ones when they surface. Dijkstra's algorithm does exactly that, as
  you will see in
  <a href="/dsa/dsa-advanced-graph-algorithms">Advanced graph algorithms</a>.
  For small windows, the plain alternative is a sorted array of the window
  with a binary search for each insert and delete, O(k) per step and much
  less to get wrong.
</p>

<h3>Heapsort, and what each operation costs</h3>
<p>
  The heap gives you a sorting algorithm for free. Build a <em>max</em>-heap
  in place. Its root is the largest element, so swap it with the last slot of
  the heap range, which puts it in its final sorted position. Shrink the heap
  range by one, sift the new root down to restore the heap, and repeat. The
  sorted tail grows from the right while the heap shrinks from the right.
</p>
<pre><code>function siftDownMax(arr, i, n) {
  while (true) {
    let largest = i;
    const left = 2 * i + 1, right = left + 1;
    if (left &lt; n &amp;&amp; arr[left] &gt; arr[largest]) largest = left;
    if (right &lt; n &amp;&amp; arr[right] &gt; arr[largest]) largest = right;
    if (largest === i) break;
    [arr[i], arr[largest]] = [arr[largest], arr[i]];
    i = largest;
  }
}

function heapSort(arr) {
  const n = arr.length;
  for (let i = (n &gt;&gt; 1) - 1; i &gt;= 0; i--) siftDownMax(arr, i, n); <span class="c">// 1. build a max-heap in place</span>
  for (let end = n - 1; end &gt; 0; end--) {
    [arr[0], arr[end]] = [arr[end], arr[0]]; <span class="c">// 2. the maximum goes to its final slot</span>
    siftDownMax(arr, 0, end); <span class="c">// the heap is now arr[0..end-1]</span>
  }
  return arr;
}</code></pre>
<h4>Dry run: heapSort([4, 10, 3, 5, 1])</h4>
<table>
  <tr><th>Step</th><th>Heap part (before the bar)</th><th>Sorted tail</th></tr>
  <tr><td>after building the heap</td><td>[10, 5, 3, 4, 1]</td><td></td></tr>
  <tr><td>swap 10 to the end, sift down</td><td>[5, 4, 3, 1]</td><td>[10]</td></tr>
  <tr><td>swap 5 to the end, sift down</td><td>[4, 1, 3]</td><td>[5, 10]</td></tr>
  <tr><td>swap 4 to the end, sift down</td><td>[3, 1]</td><td>[4, 5, 10]</td></tr>
  <tr><td>swap 3 to the end, sift down</td><td>[1]</td><td>[3, 4, 5, 10]</td></tr>
</table>
<p class="sub">
  A single element is already in place, so the loop stops and the whole array
  is <code>[1, 3, 4, 5, 10]</code>. Cost: building the heap is O(n), as
  derived earlier, and then n - 1 sift-downs each cost at most O(log n), so the
  worst case is O(n log n) with O(1) extra space, because everything happens
  inside the one array. It is <b>not stable</b>: sorting the records
  <code>{k:2, id:"a"}, {k:2, id:"b"}, {k:1, id:"c"}</code> by <code>k</code>
  with this code gave c, b, a, so the two records with key 2 swapped places.
  The built-in <code>Array.prototype.sort</code> is required by the language
  specification to be stable, so use it when equal keys must keep their
  order.
</p>
<h4>What every heap operation costs</h4>
<table>
  <tr><th>Operation</th><th>Cost</th><th>Why</th></tr>
  <tr><td>peek the top</td><td>O(1)</td><td>it is <code>data[0]</code></td></tr>
  <tr><td>push</td><td>O(log n)</td><td>sift-up travels at most the height</td></tr>
  <tr><td>pop the top</td><td>O(log n)</td><td>sift-down travels at most the height</td></tr>
  <tr><td>build from n items</td><td>O(n)</td><td>bottom-up heapify</td></tr>
  <tr><td>find an arbitrary value</td><td>O(n)</td><td>a heap says nothing about where a value is</td></tr>
  <tr><td>remove or change an arbitrary item</td><td>O(n) to find, O(log n) to repair</td><td>O(log n) in total if you keep a map from item to array index</td></tr>
  <tr><td>merge two heaps</td><td>O(n + m)</td><td>concatenate and heapify again</td></tr>
  <tr><td>sort everything by popping</td><td>O(n log n)</td><td>n pops, each O(log n)</td></tr>
</table>
<p>
  Three selection tools come out of this. For the k-th largest of n
  numbers: a size-k heap is O(n log k) and works on a stream;
  <em>heapifying everything and popping k times</em> is O(n + k log n), which
  wins when k is small and the data is all there; quickselect is O(n) on
  average with an O(n²) worst case and no extra structure. Sorting is
  O(n log n) and the simplest of all. Which is right depends on whether the
  data streams, whether you need the elements in order, and how large k is
  compared with n.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Top K," "k-th largest/smallest," "k closest points"</li>
  <li>Merging k sorted lists/arrays — a heap tracks "the smallest unmerged element" across all of them</li>
  <li>You need repeated access to a min/max while the data set keeps changing (a scheduler, a running median)</li>
  <li>"Running median," "median of a stream" → the two-heap pattern specifically</li>
  <li>A brute force would re-sort after every update — that's the tell a heap should replace it</li>
  <li>"K smallest pairs," "k-th smallest in a sorted matrix" — a k-way merge over lists you generate as you go, not ones handed to you</li>
  <li>"Fewest rooms," "furthest you can reach," "maximize capital," "task with the most left": a greedy that takes the best option among those available right now</li>
  <li>A sliding window where the median or extreme is needed and old items must leave the structure: two heaps with lazy deletion</li>
  <li>"Top K frequent": count first, then choose between a size-k heap, buckets by count and quickselect</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Implement push and pop on a MinHeap from scratch, including sift-up and sift-down.</li>
    <li>Explain why "k largest" uses a min-heap, not a max-heap — say it in one sentence about what gets evicted.</li>
    <li>Explain why heapify is O(n) rather than O(n log n), even at a high level (most nodes are near the bottom, with little distance left to sift).</li>
    <li>Build the two-heap median finder and say why the sizes must stay balanced within one of each other.</li>
    <li>Given a new problem, recognize the "keep asking for the extreme value while data changes" shape that calls for a heap in the first place.</li>
    <li>Write the comparator-based Heap from memory, define MinHeap and MaxHeap with it, and name three ways a comparator silently breaks it (boolean result, arrays compared with &lt;, a changed item).</li>
    <li>Merge k sorted lists with a heap of fronts and state O(N log k), then turn "k smallest pairs" into the same merge.</li>
    <li>Say when you would count and bucket, use a size-k heap, or use quickselect for top-K frequent, and why quickselect on equal counts needs a three-way partition.</li>
    <li>Solve meeting rooms II and furthest building, and say what the heap holds and when you pop in each one.</li>
    <li>Explain lazy deletion: why you keep separate live counts, and why the tops of both heaps must always be live.</li>
    <li>Write heapsort in place and say why it is O(n log n), why it is not stable, and what each heap operation costs.</li>
  </ul>
</div>`,
};
