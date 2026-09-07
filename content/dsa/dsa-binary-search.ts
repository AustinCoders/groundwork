import type { Chapter } from "../types";

export const dsaBinarySearch: Chapter = {
  id: "dsa-binary-search",
  num: "B6",
  title: "Binary search",
  short: "Binary search",
  levels: ["beginner"],
  practice: [
    "ex-binary-search-classic",
    "ex-search-insert-position",
    "ex-search-2d-matrix",
    "ex-first-last-position",
    "ex-search-rotated-sorted-array",
    "ex-search-rotated-sorted-array-ii",
    "ex-find-min-rotated",
    "ex-find-peak-element",
    "ex-koko-eating-bananas",
    "ex-ship-packages-in-days",
    "ex-split-array-largest-sum",
    "ex-median-two-sorted-arrays",
    "ex-integer-sqrt",
    "ex-valid-perfect-square",
    "ex-find-duplicate-number",
  ],
  ready: true,
  subtitle: "Halving the search space is the single highest-leverage trick in DSA.",
  body: `<h3>The core idea</h3>
<p>
  Binary search needs exactly one property from the search space: at every
  point, you can tell which half the answer is in without checking it
  directly. On a sorted array that's obvious — but the same idea applies
  to any "monotonic" space, which is why binary search shows up far more
  often than "is this array sorted" questions alone would suggest.
</p>

<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="Binary search halving the search space by comparing the middle element">
    <g class="rough">
      <rect class="box" x="20" y="30" width="40" height="40" />
      <rect class="box" x="60" y="30" width="40" height="40" />
      <rect class="box" x="100" y="30" width="40" height="40" />
      <rect class="boxy" x="140" y="30" width="40" height="40" />
      <rect class="box" x="180" y="30" width="40" height="40" />
      <rect class="box" x="220" y="30" width="40" height="40" />
      <rect class="box" x="260" y="30" width="40" height="40" />
    </g>
    <text class="sm" x="40" y="55" text-anchor="middle">1</text>
    <text class="sm" x="80" y="55" text-anchor="middle">3</text>
    <text class="sm" x="120" y="55" text-anchor="middle">6</text>
    <text class="sm" x="160" y="55" text-anchor="middle">9</text>
    <text class="sm" x="200" y="55" text-anchor="middle">12</text>
    <text class="sm" x="240" y="55" text-anchor="middle">15</text>
    <text class="sm" x="280" y="55" text-anchor="middle">20</text>
    <text class="lbl rd" x="160" y="14" text-anchor="middle" style="font-size:14px">mid</text>
    <text class="sm" x="60" y="100">target = 15 &gt; 9 → whole left half (1,3,6,9) is eliminated, no need to check any of it</text>
    <text class="lbl" x="20" y="140" style="font-size:15px">n → n/2 → n/4 → n/8 → … → 1</text>
    <text class="sm" x="20" y="165">log₂(n) halvings until one element remains — that's the O(log n)</text>
  </svg>
  <figcaption>Each comparison eliminates half the remaining space, not just one element.</figcaption>
</figure>

<h3>The template that avoids off-by-one bugs</h3>
<pre><code>function binarySearch(sorted, target) {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {              <span class="c">// note: <=, not <</span>
    const mid = lo + Math.floor((hi - lo) / 2); <span class="c">// avoids overflow, same as (lo+hi)>>1 in JS</span>
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; <span class="c">// not found</span>
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The two bugs that show up every time</span>
  <ul style="margin:6px 0 0">
    <li><code>lo &lt;= hi</code> vs <code>lo &lt; hi</code> — get this wrong
      and you'll either miss the last candidate or loop forever.</li>
    <li><code>mid = (lo + hi) / 2</code> can integer-overflow in other
      languages (not JS, but say it right anyway) — the
      <code>lo + (hi - lo) / 2</code> form is the safe habit.</li>
  </ul>
</div>

<h3>Watch the search space halve, step by step</h3>
<p><code>sorted = [1, 3, 6, 9, 12, 15, 20]</code>, <code>target = 15</code>:</p>
<table>
  <tr><th>step</th><th>lo</th><th>hi</th><th>mid (value)</th><th>compare</th><th>action</th></tr>
  <tr><td>1</td><td>0</td><td>6</td><td>3 (9)</td><td>9 &lt; 15</td><td>lo = 4</td></tr>
  <tr><td>2</td><td>4</td><td>6</td><td>5 (15)</td><td><b>match</b></td><td>return 5</td></tr>
</table>
<p class="sub">
  Seven elements, but only two comparisons — <code>log₂(7) ≈ 2.8</code>,
  rounded up to 3 worst-case steps. Compare that to a linear scan, which
  could need all 7. At n = 1,000,000, binary search needs about 20 steps;
  a linear scan could need a million.
</p>

<h3>Binary search on the answer, not the array</h3>
<p>
  This is the pattern that separates candidates who've memorized one
  template from candidates who understand the idea. Whenever a problem
  asks for the <b>minimum value that satisfies a condition</b> (or
  maximum), and "does value X work?" gets easier to check as X changes
  monotonically, you can binary search over the range of possible answers
  instead of the input array.
</p>
<pre><code><span class="c">// minimum "speed" to eat all bananas within h hours — classic answer-space search</span>
function minEatingSpeed(piles, h) {
  function hoursNeeded(speed) {
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / speed);
    return hours;
  }

  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (hoursNeeded(mid) <= h) hi = mid;   <span class="c">// mid works — answer could be smaller</span>
    else lo = mid + 1;                     <span class="c">// mid too slow — need bigger speed</span>
  }
  return lo;
}</code></pre>
<p class="sub">
  The array here isn't even sorted — what's monotonic is the
  <em>relationship between speed and hours needed</em>: faster speed always
  means fewer or equal hours. That monotonic relationship is the real
  requirement for binary search, not "is the input array sorted."
</p>

<h3>Finding a boundary (first/last occurrence)</h3>
<pre><code><span class="c">// leftmost index where nums[i] >= target — the building block for
   "find first occurrence" and most boundary-search variants</span>
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length; <span class="c">// note: hi = length, not length-1, here</span>
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}</code></pre>

<div class="say">
  <span class="ttl">Say it like this →</span> "Even though the array isn't
  sorted, the answer space is monotonic — if speed X works, every speed
  faster than X also works — so I can binary search over the range of
  possible speeds instead of scanning them all."
</div>


<h3>See the range collapse</h3>
<p>Watch the live range collapse. Ten candidates become one in four comparisons — and the count of comparisons is just how many times you can halve the array.</p>

<div class="demo">
  <div class="demo__bar">Binary search — halving the search space</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="bs-code"></div>
        <div class="loop-bar"><i id="bs-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="bs-prev" type="button">← Back</button>
          <button class="btn" id="bs-next" type="button">Next step →</button>
          <button class="btn" id="bs-play" type="button">Play</button>
          <button class="btn btn--ghost" id="bs-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Live range</div>
          <div id="bs-p-range"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="bs-cells"></div></div></div>
    <p class="demo__note" id="bs-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "bs";
  var CODE = ["let lo = 0, hi = a.length - 1;","while (lo <= hi) {","  const mid = Math.floor((lo + hi) / 2);","  if (a[mid] === target) return mid;","  a[mid] < target ? (lo = mid + 1) : (hi = mid - 1);","}","return -1;"];
  var STEPS = [{"cells":[{"v":"1","c":"in","p":""},{"v":"4","c":"in","p":""},{"v":"9","c":"in","p":""},{"v":"13","c":"in","p":""},{"v":"20","c":"in","p":""},{"v":"27","c":"in","p":""},{"v":"31","c":"in","p":""},{"v":"38","c":"in","p":""},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":""}],"panels":{"range":["lo=0 hi=9","10 candidates left"]},"note":"Sorted array, looking for 31. Every step throws away half the remaining range."},{"cells":[{"v":"1","c":"in","p":"lo"},{"v":"4","c":"in","p":""},{"v":"9","c":"in","p":""},{"v":"13","c":"in","p":""},{"v":"20","c":"mid","p":"mid"},{"v":"27","c":"in","p":""},{"v":"31","c":"in","p":""},{"v":"38","c":"in","p":""},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":"hi"}],"panels":{"range":["lo=0 hi=9","10 candidates left"]},"note":"mid = 4, a[mid] = 20."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"mid","p":"mid"},{"v":"27","c":"in","p":"lo"},{"v":"31","c":"in","p":""},{"v":"38","c":"in","p":""},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":"hi"}],"panels":{"range":["lo=5 hi=9","5 candidates left"]},"note":"20 < 31, so the answer is to the RIGHT. lo becomes 5 — the left half is gone."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"in","p":"lo"},{"v":"31","c":"in","p":""},{"v":"38","c":"mid","p":"mid"},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":"hi"}],"panels":{"range":["lo=5 hi=9","5 candidates left"]},"note":"mid = 7, a[mid] = 38."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"in","p":"lo"},{"v":"31","c":"in","p":"hi"},{"v":"38","c":"mid","p":"mid"},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=5 hi=6","2 candidates left"]},"note":"38 > 31, so the answer is to the LEFT. hi becomes 6."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"mid","p":"mid"},{"v":"31","c":"in","p":"hi"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=5 hi=6","2 candidates left"]},"note":"mid = 5, a[mid] = 27."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"mid","p":"mid"},{"v":"31","c":"in","p":"lo"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=6 hi=6","1 candidates left"]},"note":"27 < 31, so the answer is to the RIGHT. lo becomes 6 — the left half is gone."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"out","p":""},{"v":"31","c":"mid","p":"mid"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=6 hi=6","1 candidates left"]},"note":"mid = 6, a[mid] = 31."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"out","p":""},{"v":"31","c":"done","p":"mid"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=6 hi=6","1 candidates left"]},"note":"a[6] === 31. Found it after 4 comparisons instead of up to 10."}];
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
  <li>Data is sorted, or the answer space is monotonic ("if X works, does X+1 also work?")</li>
  <li>The prompt says "minimum/maximum value such that…"</li>
  <li>A brute force would try every candidate linearly — O(n) or O(n·check)</li>
  <li>You can write a fast "does this candidate work?" check — that check
    becomes the comparison inside the binary search</li>
</ul>`,
};
