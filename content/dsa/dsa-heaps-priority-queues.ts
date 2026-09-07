import type { Chapter } from "../types";

export const dsaHeapsPriorityQueues: Chapter = {
  id: "dsa-heaps-priority-queues",
  num: "I3",
  title: "Heaps & priority queues",
  short: "Heaps & priority queues",
  levels: ["intermediate"],
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
  return heap; <span class="c">// contains exactly the k largest, unsorted among themselves</span>
}</code></pre>
<p class="sub">
  The trick that trips people up: for "k <em>largest</em>," you use a
  <em>min</em>-heap, not a max-heap — because you want to cheaply evict
  the smallest of your current top-k candidates the moment a bigger one
  shows up. The heap's root is always "the next one to kick out," which is
  the smallest of the keepers.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I only need the k largest,
  not a full sort, so I'll keep a min-heap of size k — every new element
  either gets discarded or bumps out the current smallest keeper, which
  is O(log k) per element instead of O(n log n) for a full sort."
</div>

<h3>Building a heap from an array in O(n), not O(n log n)</h3>
<p>
  Pushing n elements one at a time costs O(n log n) — each push is
  O(log n). But if you already have the full array upfront, you can build
  the heap faster: place all elements as-is, then sift-down starting from
  the last <em>non-leaf</em> node backward to the root.
</p>
<pre><code>function heapify(arr) {
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
  var STEPS = [{"cells":[{"v":"1","c":"","p":""},{"v":"3","c":"","p":""},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""},{"v":"8","c":"","p":""}],"panels":{"tree":["1","3  6","5  9  8"]},"note":"A min-heap as an array. Children of index i live at 2i+1 and 2i+2 — no pointers needed."},{"cells":[{"v":"8","c":"hot","p":"node"},{"v":"3","c":"","p":""},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["8","3  6","5  9"]},"note":"Extract-min returns 1. The LAST element (8) moves to the root to keep the tree complete — now it's probably in the wrong place."},{"cells":[{"v":"8","c":"hot","p":"node"},{"v":"3","c":"in","p":"child"},{"v":"6","c":"in","p":"child"},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["8","3  6","5  9"]},"note":"Compare 8 with its children (3, 6)."},{"cells":[{"v":"3","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["3","8  6","5  9"]},"note":"3 > 8, so swap. Sift-down follows the smaller child — at most log n swaps."},{"cells":[{"v":"3","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"6","c":"","p":""},{"v":"5","c":"in","p":"child"},{"v":"9","c":"in","p":"child"}],"panels":{"tree":["3","8  6","5  9"]},"note":"Compare 8 with its children (5, 9)."},{"cells":[{"v":"3","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"9","c":"","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"5 > 8, so swap. Sift-down follows the smaller child — at most log n swaps."},{"cells":[{"v":"3","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"9","c":"","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"Index 3 has no children — sift-down is done."},{"cells":[{"v":"3","c":"done","p":""},{"v":"5","c":"done","p":""},{"v":"6","c":"done","p":""},{"v":"8","c":"done","p":""},{"v":"9","c":"done","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"Heap restored: [3, 5, 6, 8, 9]. Root is 3, the new minimum."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
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
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Top K," "k-th largest/smallest," "k closest points"</li>
  <li>Merging k sorted lists/arrays — a heap tracks "the smallest unmerged element" across all of them</li>
  <li>You need repeated access to a min/max while the data set keeps changing (a scheduler, a running median)</li>
  <li>"Running median," "median of a stream" → the two-heap pattern specifically</li>
  <li>A brute force would re-sort after every update — that's the tell a heap should replace it</li>
</ul>`,
};
