import type { Chapter } from "../types";

export const dsaTwoPointers: Chapter = {
  id: "dsa-two-pointers",
  num: "B4",
  title: "Two pointers",
  short: "Two pointers",
  levels: ["beginner"],
  practice: [
    "ex-sort-colors",
    "ex-next-permutation",
    "ex-trapping-rain-water",
    "ex-container-with-most-water",
    "ex-valid-palindrome",
    "ex-longest-palindromic-substring",
    "ex-two-sum-sorted",
    "ex-three-sum",
    "ex-four-sum",
    "ex-squares-of-sorted-array",
    "ex-backspace-string-compare",
    "ex-merge-two-sorted-arrays",
  ],
  ready: true,
  subtitle: "One pass, two positions — how an O(n²) search collapses to O(n).",
  body: `<h3>The shape of the pattern</h3>
<p>
  Two pointers means walking a structure with <b>two indices instead of
  nested loops</b>. Whenever you're tempted to check every pair
  (<code>i</code>, <code>j</code>) against each other, ask: does the data
  have an order I can exploit so the pointers only ever move forward, never
  backward? If yes, two pointers turns O(n²) pair-checking into a single
  O(n) pass.
</p>

<h3>Variant 1 — opposite ends, closing inward</h3>
<p>Used on sorted arrays where you need a pair that satisfies some condition.</p>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="Two pointers starting at opposite ends of a sorted array and moving toward each other">
    <g class="rough">
      <rect class="box" x="20" y="50" width="70" height="50" />
      <rect class="box" x="90" y="50" width="70" height="50" />
      <rect class="box" x="160" y="50" width="70" height="50" />
      <rect class="box" x="230" y="50" width="70" height="50" />
      <rect class="box" x="300" y="50" width="70" height="50" />
      <rect class="box" x="370" y="50" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="80" text-anchor="middle">2</text>
    <text class="sm" x="125" y="80" text-anchor="middle">7</text>
    <text class="sm" x="195" y="80" text-anchor="middle">11</text>
    <text class="sm" x="265" y="80" text-anchor="middle">15</text>
    <text class="sm" x="335" y="80" text-anchor="middle">18</text>
    <text class="sm" x="405" y="80" text-anchor="middle">24</text>
    <text class="lbl rd" x="55" y="30" text-anchor="middle" style="font-size:16px">↓ left</text>
    <text class="lbl rd" x="405" y="30" text-anchor="middle" style="font-size:16px">right ↓</text>
    <text class="sm" x="440" y="80">→ close inward</text>
  </svg>
  <figcaption>sum too small → move left right; sum too big → move right left.</figcaption>
</figure>
<pre><code><span class="c">// Two Sum on a SORTED array — O(n) time, O(1) space</span>
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;   <span class="c">// need bigger → drop the smaller end</span>
    else right--;               <span class="c">// need smaller → drop the bigger end</span>
  }
  return [-1, -1];
}</code></pre>
<p class="sub">
  Why this is correct, not just fast: because the array is sorted, moving
  <code>left</code> past the current value can never re-find a pair we
  already ruled out — every skipped pair genuinely can't work.
</p>

<h3>Watch it converge, step by step</h3>
<p><code>nums = [2, 7, 11, 15, 18, 24]</code>, <code>target = 22</code>:</p>
<table>
  <tr><th>step</th><th>left</th><th>right</th><th>nums[left]+nums[right]</th><th>compare to 22</th><th>move</th></tr>
  <tr><td>1</td><td>0 (2)</td><td>5 (24)</td><td>26</td><td>too big</td><td>right−−</td></tr>
  <tr><td>2</td><td>0 (2)</td><td>4 (18)</td><td>20</td><td>too small</td><td>left++</td></tr>
  <tr><td>3</td><td>1 (7)</td><td>4 (18)</td><td>25</td><td>too big</td><td>right−−</td></tr>
  <tr><td>4</td><td>1 (7)</td><td>3 (15)</td><td>22</td><td><b>match</b></td><td>return [1, 3]</td></tr>
</table>
<p class="sub">
  Six elements, but only four comparisons — each one eliminates an entire
  end of the remaining range, not just one element. That's the O(n)
  behavior: the pointers together take at most n steps total to meet.
</p>

<h3>Variant 2 — fast/slow, same direction</h3>
<p>
  Both pointers start at the same end but move at different rates (or one
  waits while the other scans). This is the shape behind removing
  duplicates in place, partitioning, and cycle detection in linked lists.
</p>
<pre><code><span class="c">// remove duplicates from a SORTED array, in place — O(n) time, O(1) space</span>
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0; <span class="c">// slow = last confirmed-unique position</span>
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1; <span class="c">// count of unique elements</span>
}</code></pre>

<h3>Variant 3 — palindrome / mirror check</h3>
<pre><code>function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}</code></pre>

<div class="warn">
  <span class="ttl">⚠ Two pointers needs an exploitable order</span>
  The opposite-ends variant only works because the array is sorted — try
  it on unsorted data and it silently gives wrong answers, not an error.
  If the input isn't sorted and sorting it doesn't destroy needed
  information (like original indices), sort first — O(n log n) to enable
  an O(n) pass is still a huge win over O(n²).
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "The array's sorted, so I can
  use two pointers closing inward — each comparison eliminates one end
  entirely instead of comparing every pair, which is what gets this from
  O(n²) down to O(n)."
</div>

<h3>How to recognize it in an unseen problem</h3>
<ul>
  <li>The input is sorted (or can be sorted without losing what you need)</li>
  <li>You're looking for a pair, triplet, or a "does X exist" over combinations</li>
  <li>A brute force would be nested loops comparing indices against each other</li>
  <li>The words "sorted array," "pair," or "in-place" appear in the prompt</li>
</ul>
<p class="sub">
  Three Sum is the natural extension: sort once, then fix one index and
  run the opposite-ends two-pointer scan on the rest — O(n²) total instead
  of the O(n³) brute force, because the inner two-sum collapses from a
  nested loop to a linear scan.</p>
<h3>See it move</h3>
<p>Step through it and watch <em>why</em> a pointer moves. Every move rules out a whole block of pairs at once — that is the entire reason this beats the nested loop.</p>

<div class="demo">
  <div class="demo__bar">Two pointers — find a pair that sums to 22</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="tp-code"></div>
        <div class="loop-bar"><i id="tp-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="tp-prev" type="button">← Back</button>
          <button class="btn" id="tp-next" type="button">Next step →</button>
          <button class="btn" id="tp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="tp-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Current sum</div>
          <div id="tp-p-sum"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="tp-cells"></div></div></div>
    <p class="demo__note" id="tp-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "tp";
  var CODE = ["let lo = 0, hi = a.length - 1;","while (lo < hi) {","  const sum = a[lo] + a[hi];","  if (sum === target) return [lo, hi];","  sum < target ? lo++ : hi--;","}"];
  var STEPS = [{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"out","p":""},{"v":"11","c":"out","p":""},{"v":"15","c":"out","p":""},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":[]},"note":"Sorted array, target 22. Two pointers start at both ends."},{"cells":[{"v":"2","c":"lo","p":"lo"},{"v":"4","c":"in","p":""},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"in","p":""},{"v":"24","c":"hi","p":"hi"}],"panels":{"sum":["a[0] + a[6] = 2 + 24 = 26"]},"note":"Sum is 26. Compare it with the target 22."},{"cells":[{"v":"2","c":"lo","p":"lo"},{"v":"4","c":"in","p":""},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"hi","p":"hi"},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[0] + a[5] = 2 + 19 = 21"]},"note":"26 > 22. Only moving hi DOWN can decrease the sum, so hi retreats."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"lo","p":"lo"},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"hi","p":"hi"},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[1] + a[5] = 4 + 19 = 23"]},"note":"21 < 22. Only moving lo UP can increase the sum, so lo advances. Everything left of it is now impossible."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"lo","p":"lo"},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"hi","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[1] + a[4] = 4 + 15 = 19"]},"note":"23 > 22. Only moving hi DOWN can decrease the sum, so hi retreats."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"lo","p":"lo"},{"v":"11","c":"in","p":""},{"v":"15","c":"hi","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[2] + a[4] = 7 + 15 = 22"]},"note":"19 < 22. Only moving lo UP can increase the sum, so lo advances. Everything left of it is now impossible."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"done","p":"lo"},{"v":"11","c":"out","p":""},{"v":"15","c":"done","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[2] + a[4] = 7 + 15 = 22"]},"note":"7 + 15 = 22. Found the pair — done in one pass, O(n)."}];
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
`,
};
