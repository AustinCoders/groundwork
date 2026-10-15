import type { Chapter } from "../types";

export const dsaSlidingWindow: Chapter = {
  id: "dsa-sliding-window",
  num: "B7",
  title: "Sliding window",
  short: "Sliding window",
  levels: ["beginner"],
  prerequisites: ["dsa-hashing", "dsa-two-pointers"],
  practice: [
    "ex-longest-substring-no-repeat",
    "ex-minimum-window-substring",
    "ex-find-all-anagrams",
    "ex-longest-repeating-char-replacement",
    "ex-permutation-in-string",
    "ex-min-size-subarray-sum",
    "ex-fruit-into-baskets",
    "ex-subarray-product-less-than-k",
    "ex-max-consecutive-ones-iii",
    "ex-longest-subarray-abs-diff-limit",
    "ex-maximum-average-subarray",
    "ex-longest-substring-k-distinct",
    "ex-subarrays-with-k-distinct",
    "ex-subarrays-with-sum-goal",
    "ex-count-nice-subarrays",
    "ex-maximum-points-from-cards",
    "ex-grumpy-bookstore-owner",
    "ex-sliding-window-maximum",
    "ex-subarray-sum-equals-k",
  ],
  ready: true,
  subtitle: "Stop re-scanning the same elements — slide the window instead.",
  body: `<h3>The insight: don't recompute, adjust</h3>
<p>
  A brute-force "every contiguous subarray/substring" solution recomputes
  each window from scratch — O(n) work, done for O(n) windows, is O(n²).
  Sliding window notices that consecutive windows overlap almost entirely:
  moving from <code>[i, j]</code> to <code>[i+1, j+1]</code> only removes
  one element and adds one element. Update the running answer instead of
  rebuilding it, and the whole scan collapses to O(n).
</p>

<figure>
  <svg viewBox="0 0 640 170" class="dg" role="img" aria-label="A window of fixed size sliding one step across an array">
    <g class="rough">
      <rect class="box" x="20" y="60" width="50" height="50" />
      <rect class="box" x="70" y="60" width="50" height="50" />
      <rect class="box" x="120" y="60" width="50" height="50" />
      <rect class="box" x="170" y="60" width="50" height="50" />
      <rect class="box" x="220" y="60" width="50" height="50" />
      <rect class="box" x="270" y="60" width="50" height="50" />
      <rect class="boxg" x="70" y="55" width="150" height="60" rx="6" />
    </g>
    <text class="sm" x="45" y="90" text-anchor="middle">3</text>
    <text class="sm" x="95" y="90" text-anchor="middle">1</text>
    <text class="sm" x="145" y="90" text-anchor="middle">4</text>
    <text class="sm" x="195" y="90" text-anchor="middle">1</text>
    <text class="sm" x="245" y="90" text-anchor="middle">5</text>
    <text class="sm" x="295" y="90" text-anchor="middle">9</text>
    <text class="lbl" x="145" y="35" text-anchor="middle" style="font-size:15px">window, size 3</text>
    <text class="lbl rd" x="420" y="60" style="font-size:15px">slide right one step:</text>
    <text class="sm rd" x="420" y="85">drop nums[left], add nums[right+1]</text>
    <text class="sm rd" x="420" y="105">O(1) update, not a rescan</text>
  </svg>
  <figcaption>The window's total is maintained incrementally — never recomputed from scratch.</figcaption>
</figure>

<h3>Fixed-size window</h3>
<pre><code><span class="c">// max sum of any window of size k — O(n) time, O(1) space</span>
function maxSumWindow(nums, k) {
  if (k &lt; 1 || k &gt; nums.length) return null; <span class="c">// no window of that size exists; 0 would look like a real sum</span>
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i]; <span class="c">// build first window</span>

  let best = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k]; <span class="c">// add new, drop old — O(1)</span>
    best = Math.max(best, windowSum);
  }
  return best;
}</code></pre>

<h3>Variable-size window — the more common interview shape</h3>
<p>
  Here the window grows on the right and shrinks from the left based on a
  condition, instead of staying a fixed size. This is the pattern behind
  "longest substring without repeating characters," "smallest subarray
  with sum ≥ target," and most "longest/shortest X satisfying Y" questions.
</p>
<pre><code><span class="c">// longest substring with no repeated characters — O(n) time, O(min(n, alphabet)) space</span>
function longestUniqueSubstring(s) {
  const lastSeen = new Map(); <span class="c">// char → most recent index</span>
  let left = 0, best = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1; <span class="c">// jump left past the repeat</span>
    }
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}</code></pre>
<p class="sub">
  Notice <code>left</code> only ever moves forward — it never resets to 0
  and re-scans. That "each pointer visits each index at most once" property
  is <em>why</em> this is O(n) and not O(n²) despite looking like a nested
  loop conceptually.
</p>

<h4>Dry run: longestUniqueSubstring("abcabcbb")</h4>
<table>
  <tr><th>right</th><th>char</th><th>repeat in window?</th><th>left jumps to</th><th>window</th><th>best</th></tr>
  <tr><td>0</td><td>a</td><td>no</td><td>0</td><td>"a"</td><td>1</td></tr>
  <tr><td>1</td><td>b</td><td>no</td><td>0</td><td>"ab"</td><td>2</td></tr>
  <tr><td>2</td><td>c</td><td>no</td><td>0</td><td>"abc"</td><td>3</td></tr>
  <tr><td>3</td><td>a</td><td><b>yes</b> (index 0)</td><td>1</td><td>"bca"</td><td>3</td></tr>
  <tr><td>4</td><td>b</td><td><b>yes</b> (index 1)</td><td>2</td><td>"cab"</td><td>3</td></tr>
  <tr><td>5</td><td>c</td><td><b>yes</b> (index 2)</td><td>3</td><td>"abc"</td><td>3</td></tr>
  <tr><td>6</td><td>b</td><td><b>yes</b> (index 4)</td><td>5</td><td>"cb"</td><td>3</td></tr>
  <tr><td>7</td><td>b</td><td><b>yes</b> (index 6)</td><td>7</td><td>"b"</td><td>3</td></tr>
</table>
<p class="sub">
  <code>left</code> jumps straight to <em>one past</em> the repeat's last
  position — never one step at a time, never backward. Across all 8 steps,
  <code>left</code> moved a total of 7 positions, not 7 positions
  <em>per</em> step — that's the amortized O(n) at work.
</p>

<h3>The general variable-window template</h3>
<pre><code>function template(arr, condition) {
  let left = 0;
  let state = /* running total, count, or map */ 0;

  for (let right = 0; right < arr.length; right++) {
    <span class="c">// 1. expand: fold arr[right] into state</span>

    while (/* state violates the condition */ false) {
      <span class="c">// 2. shrink: undo arr[left] from state, then left++</span>
      left++;
    }

    <span class="c">// 3. update the answer using the current valid window [left, right]</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Why the shrink loop doesn't make this O(n²)</span>
  It looks like a loop inside a loop, but <code>left</code> only ever
  increases and can move at most n times <em>total</em> across the whole
  run — not n times per iteration of the outer loop. Add the outer loop's
  n steps and the inner loop's n total steps together (not multiply) and
  you get O(2n) = O(n). This "amortized" argument is worth being able to
  say out loud in an interview.
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll maintain a window with
  two pointers instead of recomputing each substring — the right pointer
  expands the window, the left pointer only shrinks it when the condition
  breaks, so each index is visited a constant number of times total,
  giving O(n) instead of the O(n²) brute force."
</div>


<h3>See the window move</h3>
<p>Watch <code>left</code> jump rather than crawl. That jump is what keeps the whole scan linear even though the window shrinks and grows.</p>

<div class="demo">
  <div class="demo__bar">Sliding window — longest substring without repeats</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="sw-code"></div>
        <div class="loop-bar"><i id="sw-bar"></i></div>
        <p class="loop-step" id="sw-step"></p>
        <div class="demo__ctl">
          <button class="btn" id="sw-prev" type="button">← Back</button>
          <button class="btn" id="sw-next" type="button">Next step →</button>
          <button class="btn" id="sw-play" type="button">Play</button>
          <button class="btn btn--ghost" id="sw-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Window</div>
          <div id="sw-p-win"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Best so far</div>
          <div id="sw-p-best"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="sw-cells"></div></div></div>
    <p class="demo__note" id="sw-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "sw";
  var CODE = ["let left = 0, best = 0;","for (let right = 0; right < s.length; right++) {","  if (seen.has(s[right]) && seen.get(s[right]) >= left)","    left = seen.get(s[right]) + 1;","  seen.set(s[right], right);","  best = Math.max(best, right - left + 1);","}"];
  var STEPS = [{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":[],"best":["0"]},"note":"Find the longest substring with no repeated character in \\"abcabcbb\\".","line":1},{"cells":[{"v":"a","c":"in","p":"L R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["a"],"best":["0"]},"note":"\\"a\\" is new to the window, so right extends it.","line":3},{"cells":[{"v":"a","c":"in","p":"L R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["a"],"best":["1"]},"note":"Window is length 1 — a new best.","line":6},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["ab"],"best":["1"]},"note":"\\"b\\" is new to the window, so right extends it.","line":3},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["ab"],"best":["2"]},"note":"Window is length 2 — a new best.","line":6},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["2"]},"note":"\\"c\\" is new to the window, so right extends it.","line":3},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"Window is length 3 — a new best.","line":6},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"in","p":"L"},{"v":"c","c":"in","p":""},{"v":"a","c":"in","p":"R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["bca"],"best":["3"]},"note":"\\"a\\" is already inside the window. left jumps to 1 — past the old \\"a\\" — instead of stepping one at a time.","line":4},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"in","p":"L"},{"v":"a","c":"in","p":""},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["cab"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 2 — past the old \\"b\\" — instead of stepping one at a time.","line":4},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"\\"c\\" is already inside the window. left jumps to 3 — past the old \\"c\\" — instead of stepping one at a time.","line":4},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"b","c":"out","p":""}],"panels":{"win":["cb"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 5 — past the old \\"b\\" — instead of stepping one at a time.","line":4},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"in","p":"L R"}],"panels":{"win":["b"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 7 — past the old \\"b\\" — instead of stepping one at a time.","line":4},{"cells":[{"v":"a","c":"done","p":""},{"v":"b","c":"done","p":""},{"v":"c","c":"done","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"Answer: 3. Each index was visited at most twice — O(n), not O(n²).","line":7}];
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

<h3>Longest or shortest: where the answer is recorded</h3>
<p>
  The template above has one open slot: "update the answer using the current
  valid window." Where you fill it depends on whether you want the
  <b>longest</b> or the <b>shortest</b> valid window, and getting it wrong is
  the most common way to write a window that looks right and is off by one.
</p>
<ul>
  <li>
    <b>Longest valid window.</b> Expand, then shrink <em>until the window is
    valid again</em>, then record. The window is valid at the moment you read
    its length, and it is as large as it can be for this right end.
  </li>
  <li>
    <b>Shortest valid window.</b> Expand until the window <em>becomes</em>
    valid, then record <em>inside</em> the shrink loop and keep shrinking for as
    long as it stays valid. Every valid window you pass on the way down is a
    candidate, and the last one is the shortest for this right end.
  </li>
</ul>
<p>
  The classic shortest case is the minimal-length subarray whose sum is at
  least <code>target</code>, for an array of positive numbers.
</p>
<pre><code>function minSubArrayLen(target, nums) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right &lt; nums.length; right++) {
    sum += nums[right];
    while (sum >= target) {                       <span class="c">// valid: record, then try a shorter one</span>
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? 0 : best;            <span class="c">// no valid window: 0, not Infinity</span>
}</code></pre>

<h4>Dry run: minSubArrayLen(7, [2, 3, 1, 2, 4, 3])</h4>
<table>
  <tr><th>right</th><th>added</th><th>windows recorded in the shrink loop</th><th>sum after</th><th>left after</th><th>best</th></tr>
  <tr><td>0</td><td>2</td><td>none (sum 2)</td><td>2</td><td>0</td><td>∞</td></tr>
  <tr><td>1</td><td>3</td><td>none (sum 5)</td><td>5</td><td>0</td><td>∞</td></tr>
  <tr><td>2</td><td>1</td><td>none (sum 6)</td><td>6</td><td>0</td><td>∞</td></tr>
  <tr><td>3</td><td>2</td><td>[2, 3, 1, 2] length 4</td><td>6</td><td>1</td><td>4</td></tr>
  <tr><td>4</td><td>4</td><td>[3, 1, 2, 4] length 4, then [1, 2, 4] length 3</td><td>6</td><td>3</td><td>3</td></tr>
  <tr><td>5</td><td>3</td><td>[2, 4, 3] length 3, then [4, 3] length 2</td><td>3</td><td>5</td><td><b>2</b></td></tr>
</table>
<p class="sub">
  Why <code>left</code> never has to move backward: with positive numbers, if
  the window <code>[l, r]</code> already reaches the target, so does
  <code>[l, r + 1]</code>. The latest start that still reaches the target (the
  one that gives the shortest window for that right end) can only move right
  as <code>right</code> grows, so each index is added once and removed at most
  once. Time O(n), space O(1).
</p>
<div class="warn">
  <span class="ttl">⚠ Three slips in the shortest-window shape</span>
  <ul style="margin:6px 0 0">
    <li>Using <code>if</code> instead of <code>while</code> to shrink records
      one window per right end and misses shorter ones that appear after
      several removals.</li>
    <li>Recording <em>after</em> the loop, when the window has just become
      invalid, reports a window that does not satisfy the rule.</li>
    <li>Returning <code>Infinity</code> (or a stale length) when no window
      qualifies. Decide what "none" looks like before you write the loop.</li>
  </ul>
</div>

<h3>Counting windows: every right end adds right − left + 1</h3>
<p>
  Some questions ask <em>how many</em> subarrays satisfy a rule, not how long
  the best one is. Take: how many contiguous subarrays of a positive-integer
  array have a product strictly less than <code>k</code>?
</p>
<p>
  Fix the right end and let <code>left</code> be the smallest start that keeps
  the product below <code>k</code>. Shrinking a window of positive numbers
  never increases its product, so <em>every</em> start from
  <code>left</code> to <code>right</code> is also valid, and no start before
  <code>left</code> is. That is exactly <code>right - left + 1</code> valid
  subarrays ending at <code>right</code>. Add that number at each step and every
  valid subarray is counted exactly once, grouped by where it ends.
</p>
<pre><code>function numSubarrayProductLessThanK(nums, k) {
  if (k &lt;= 1) return 0;                          <span class="c">// products of positive integers are at least 1</span>
  let left = 0, product = 1, count = 0;
  for (let right = 0; right &lt; nums.length; right++) {
    product *= nums[right];
    while (product >= k) product /= nums[left++];
    count += right - left + 1;                    <span class="c">// all starts in [left, right] work</span>
  }
  return count;
}</code></pre>
<table>
  <tr><th>right (value)</th><th>product after shrink</th><th>left</th><th>new subarrays</th><th>total</th></tr>
  <tr><td>0 (10)</td><td>10</td><td>0</td><td>1: [10]</td><td>1</td></tr>
  <tr><td>1 (5)</td><td>50</td><td>0</td><td>2: [5], [10, 5]</td><td>3</td></tr>
  <tr><td>2 (2)</td><td>10 (100 reached the limit, so the 10 is removed)</td><td>1</td><td>2: [2], [5, 2]</td><td>5</td></tr>
  <tr><td>3 (6)</td><td>60</td><td>1</td><td>3: [6], [2, 6], [5, 2, 6]</td><td><b>8</b></td></tr>
</table>
<p class="sub">
  This is <code>k = 100</code> on <code>[10, 5, 2, 6]</code>. Time O(n), space
  O(1). The <code>k &lt;= 1</code> guard is not decoration: with
  <code>k = 1</code> the loop condition stays true after every element has
  been divided out, <code>left</code> runs past the end of the array, and the
  count comes out wrong (<code>-1</code> for <code>[5]</code> with
  <code>k = 1</code>). The division is exact here because
  <code>product</code> is always a product of the numbers in the window, as
  long as it stays below 2<sup>53</sup>.
</p>

<h3>At most K distinct: a longest window over a counting map</h3>
<p>
  "Longest substring with at most K distinct characters" (and "fruit into
  baskets", which is the same question with K = 2) needs the window to know
  <em>how many of each thing</em> it holds, not just a total. A
  <code>Map</code> from item to count does it, and its <code>size</code> is the
  number of distinct items.
</p>
<pre><code>function longestAtMostKDistinct(s, k) {
  const counts = new Map();
  let left = 0, best = 0;
  for (let right = 0; right &lt; s.length; right++) {
    counts.set(s[right], (counts.get(s[right]) || 0) + 1);
    while (counts.size > k) {
      const c = s[left++];
      counts.set(c, counts.get(c) - 1);
      if (counts.get(c) === 0) counts.delete(c);  <span class="c">// without this, size never drops</span>
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}</code></pre>
<table>
  <tr><th>right</th><th>char</th><th>counts after</th><th>window</th><th>best</th></tr>
  <tr><td>0</td><td>e</td><td>e:1</td><td>"e"</td><td>1</td></tr>
  <tr><td>1</td><td>c</td><td>e:1, c:1</td><td>"ec"</td><td>2</td></tr>
  <tr><td>2</td><td>e</td><td>e:2, c:1</td><td>"ece"</td><td><b>3</b></td></tr>
  <tr><td>3</td><td>b</td><td>three distinct, so drop e, then c: e:1, b:1</td><td>"eb"</td><td>3</td></tr>
  <tr><td>4</td><td>a</td><td>three distinct, so drop e: b:1, a:1</td><td>"ba"</td><td>3</td></tr>
</table>
<p class="sub">
  This is <code>k = 2</code> on <code>"eceba"</code>. Each character enters once
  and leaves at most once: O(n) time, and the map holds at most
  <code>k + 1</code> keys, so O(k) space. With <code>k = 0</code> the shrink loop
  empties the window every time and the answer is 0, which is correct for
  an empty allowance. The "fruit" version is the same code over an array of
  numbers.
</p>

<h3>Exactly K is at most K minus at most K − 1</h3>
<p>
  Now ask for the number of subarrays with <em>exactly</em> K distinct values.
  The window machinery cannot answer this directly, because "exactly K" is not
  monotone: a window with exactly K distinct values can lose one when you
  shrink it, and gain one when you expand it, so neither pointer has a reliable
  direction. "At most K" does behave: shrinking never increases the distinct
  count, so the valid windows for a given right end are exactly the starts from
  <code>left</code> to <code>right</code>.
</p>
<div class="sticky mint">
  <span class="ttl">The trick</span>
  A subarray with at most K distinct values either has at most K − 1, or has
  exactly K. So
  <b>exactly(K) = atMost(K) − atMost(K − 1)</b>. Each term is a plain
  counting window, and the difference leaves precisely the subarrays you want.
</div>
<pre><code>function subarraysWithKDistinct(nums, k) {
  return atMostKDistinct(nums, k) - atMostKDistinct(nums, k - 1);
}

function atMostKDistinct(nums, k) {
  const counts = new Map();
  let left = 0, total = 0;
  for (let right = 0; right &lt; nums.length; right++) {
    counts.set(nums[right], (counts.get(nums[right]) || 0) + 1);
    while (counts.size > k) {
      const x = nums[left++];
      counts.set(x, counts.get(x) - 1);
      if (counts.get(x) === 0) counts.delete(x);
    }
    total += right - left + 1;
  }
  return total;
}</code></pre>
<table>
  <tr><th>right</th><th>at most 2: window</th><th>adds</th><th>total</th><th>at most 1: window</th><th>adds</th><th>total</th></tr>
  <tr><td>0</td><td>[1]</td><td>1</td><td>1</td><td>[1]</td><td>1</td><td>1</td></tr>
  <tr><td>1</td><td>[1, 2]</td><td>2</td><td>3</td><td>[2]</td><td>1</td><td>2</td></tr>
  <tr><td>2</td><td>[1, 2, 1]</td><td>3</td><td>6</td><td>[1]</td><td>1</td><td>3</td></tr>
  <tr><td>3</td><td>[1, 2, 1, 2]</td><td>4</td><td>10</td><td>[2]</td><td>1</td><td>4</td></tr>
  <tr><td>4</td><td>[2, 3]</td><td>2</td><td>12</td><td>[3]</td><td>1</td><td>5</td></tr>
</table>
<p class="sub">
  On <code>[1, 2, 1, 2, 3]</code> with K = 2: 12 − 5 = <b>7</b> subarrays have
  exactly two distinct values. Two linear passes, so O(n) time. The same
  subtraction counts subarrays whose sum equals a goal when the numbers are
  non-negative: <code>atMostSum(goal) - atMostSum(goal - 1)</code>, and "nice"
  subarrays with exactly K odd numbers once each element is replaced by
  <code>x % 2</code>.
</p>
<pre><code>function numSubarraysWithSum(nums, goal) {
  return atMostSum(nums, goal) - atMostSum(nums, goal - 1);
}

function atMostSum(nums, s) {
  if (s &lt; 0) return 0;                          <span class="c">// no non-negative sum is below zero</span>
  let left = 0, sum = 0, total = 0;
  for (let right = 0; right &lt; nums.length; right++) {
    sum += nums[right];
    while (sum > s) sum -= nums[left++];
    total += right - left + 1;
  }
  return total;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "Exactly K isn't monotone, so a
  single window can't track it. At most K is, so I'll count subarrays with at
  most K and subtract those with at most K minus one; what's left is exactly
  K, in two linear passes."
</div>

<h3>The need and missing counters: minimum window substring</h3>
<p>
  Given strings <code>s</code> and <code>t</code>, find the shortest window of
  <code>s</code> that contains every character of <code>t</code>, counting
  repeats: if <code>t</code> has two <code>A</code>s, the window needs two.
  This is the template's hardest everyday use, and it is easiest if you keep
  one idea in your head.
</p>
<p>
  For each character, store <code>need[c]</code> = how many copies of
  <code>c</code> the window <em>still lacks</em>. It starts at the count in
  <code>t</code>. Adding a character to the window subtracts one; removing one
  adds one. A positive value means the window is still short of that character;
  zero or below means it has enough, and a negative number is a surplus. To
  avoid scanning the whole map after every step, keep one more number,
  <code>missing</code>: the total of the positive parts, starting at
  <code>t.length</code>. The window is valid exactly when
  <code>missing === 0</code>.
</p>
<pre><code>function minWindow(s, t) {
  if (t.length === 0 || t.length > s.length) return "";
  const need = new Map();
  for (const c of t) need.set(c, (need.get(c) || 0) + 1);

  let missing = t.length;
  let left = 0, bestStart = 0, bestLen = Infinity;

  for (let right = 0; right &lt; s.length; right++) {
    const c = s[right];
    if (need.has(c)) {
      if (need.get(c) > 0) missing--;            <span class="c">// this copy was still needed</span>
      need.set(c, need.get(c) - 1);
    }
    while (missing === 0) {                       <span class="c">// valid: record, then try to shrink</span>
      if (right - left + 1 &lt; bestLen) {
        bestLen = right - left + 1;
        bestStart = left;
      }
      const d = s[left++];
      if (need.has(d)) {
        need.set(d, need.get(d) + 1);
        if (need.get(d) > 0) missing++;          <span class="c">// we just gave up a copy we needed</span>
      }
    }
  }
  return bestLen === Infinity ? "" : s.slice(bestStart, bestStart + bestLen);
}</code></pre>

<h4>Dry run: minWindow("ADOBECODEBANC", "ABC")</h4>
<table>
  <tr><th>right</th><th>char</th><th>missing</th><th>what the shrink loop does</th><th>left after</th><th>best so far</th></tr>
  <tr><td>0–2</td><td>A, D, O</td><td>2</td><td>nothing; A was needed, D and O are not in t</td><td>0</td><td>none</td></tr>
  <tr><td>3</td><td>B</td><td>1</td><td>nothing</td><td>0</td><td>none</td></tr>
  <tr><td>4</td><td>E</td><td>1</td><td>nothing</td><td>0</td><td>none</td></tr>
  <tr><td>5</td><td>C</td><td>0</td><td>"ADOBEC" is valid: record 6, drop A, missing is 1 again</td><td>1</td><td>"ADOBEC"</td></tr>
  <tr><td>6–9</td><td>O, D, E, B</td><td>1</td><td>nothing (a second B is a surplus, not a fix)</td><td>1</td><td>"ADOBEC"</td></tr>
  <tr><td>10</td><td>A</td><td>0</td><td>valid again: the window stays valid at lengths 10, 9, 8, 7, 6 as D, O, B, E, C are dropped, but none beats 6; dropping C breaks it</td><td>6</td><td>"ADOBEC"</td></tr>
  <tr><td>11</td><td>N</td><td>1</td><td>nothing</td><td>6</td><td>"ADOBEC"</td></tr>
  <tr><td>12</td><td>C</td><td>0</td><td>valid at lengths 7, 6, 5 and <b>4 ("BANC")</b> as O, D, E, B are dropped; dropping B breaks it</td><td>10</td><td><b>"BANC"</b></td></tr>
</table>
<p class="sub">
  Each index enters the window once and leaves at most once, and each step is
  an O(1) map operation: O(|s| + |t|) time. The map holds only the distinct
  characters of <code>t</code>, so the space is O(number of distinct
  characters in t). Because the comparison is strict, ties keep the first
  shortest window.
</p>
<div class="warn">
  <span class="ttl">⚠ Where this goes wrong</span>
  <ul style="margin:6px 0 0">
    <li>Decrementing <code>missing</code> on <em>every</em> matching character,
      instead of only while <code>need[c] &gt; 0</code>. A third
      <code>A</code> in the window is a surplus and must not count.</li>
    <li>Ignoring characters that are not in <code>t</code> is correct, but
      forgetting the <code>need.has(c)</code> check puts them in the map with
      negative counts, and then removing them can push <code>missing</code> up
      wrongly.</li>
    <li>Comparing <code>need.size</code> or the map's contents on every step
      instead of using <code>missing</code>. It still works but turns O(n) into
      O(n · distinct).</li>
    <li>Duplicates in <code>t</code>: <code>"AA"</code> needs two
      <code>A</code>s, not just the presence of <code>A</code>.</li>
  </ul>
</div>

<h3>Fixed window with a frequency compare: anagrams and permutations</h3>
<p>
  "Find every start index where an anagram of <code>p</code> appears in
  <code>s</code>", and "does <code>s2</code> contain a permutation of
  <code>s1</code>", are fixed windows of length <code>k = p.length</code>. The
  window is valid when its character counts equal the counts of
  <code>p</code>. The code assumes lowercase letters, to keep the indexing
  simple. Comparing two 26-slot arrays each step costs O(26) per step,
  which is fine, but you can make each slide O(1) by tracking only the
  <em>difference</em> and a counter of how many letters still differ.
</p>
<pre><code>function findAnagrams(s, p) {
  const out = [];
  const k = p.length;
  if (k > s.length) return out;
  const diff = new Array(26).fill(0);           <span class="c">// window count minus pattern count, per letter</span>
  let unequal = 0;                              <span class="c">// how many letters have diff !== 0</span>

  function bump(ch, delta) {
    const i = ch.charCodeAt(0) - 97;
    if (diff[i] === 0) unequal++;
    diff[i] += delta;
    if (diff[i] === 0) unequal--;
  }

  for (const ch of p) bump(ch, -1);
  for (let right = 0; right &lt; s.length; right++) {
    bump(s[right], 1);
    if (right >= k) bump(s[right - k], -1);     <span class="c">// the letter that just left the window</span>
    if (right >= k - 1 &amp;&amp; unequal === 0) out.push(right - k + 1);
  }
  return out;
}

function checkInclusion(s1, s2) {
  return findAnagrams(s2, s1).length > 0;
}</code></pre>
<table>
  <tr><th>right</th><th>window (size 3)</th><th>letters still different</th><th>result</th></tr>
  <tr><td>0</td><td>"c" (filling)</td><td>2</td><td>—</td></tr>
  <tr><td>1</td><td>"cb" (filling)</td><td>1</td><td>—</td></tr>
  <tr><td>2</td><td>"cba"</td><td>0</td><td><b>match at 0</b></td></tr>
  <tr><td>3–7</td><td>"bae", "aeb", "eba", "bab", "aba"</td><td>2</td><td>no match</td></tr>
  <tr><td>8</td><td>"bac"</td><td>0</td><td><b>match at 6</b></td></tr>
  <tr><td>9</td><td>"acd"</td><td>2</td><td>no match</td></tr>
</table>
<p class="sub">
  This is <code>s = "cbaebabacd"</code> and <code>p = "abc"</code>, which gives
  <code>[0, 6]</code>. Time O(|s| + |p|) and space O(1) for 26 lowercase
  letters. For a larger alphabet, use a <code>Map</code> and delete entries
  whose count reaches zero, and keep the same counter idea. An anagram and a
  permutation are the same thing here, since both mean "same letters, same
  counts, any order"; a sorted copy or a fresh count at each window would also
  work but costs O(k) per window.
</p>

<h3>A budget window: replace K characters, flip K zeros</h3>
<p>
  A third kind of validity is a <em>budget</em>: the window may contain at most
  K things that are "wrong" and need fixing. Max consecutive ones III allows
  flipping at most K zeros, so a window is valid when it contains at most K
  zeros. That is the "at most" window again, with a counter instead of a map.
</p>
<pre><code>function longestOnes(nums, k) {
  let left = 0, zeros = 0, best = 0;
  for (let right = 0; right &lt; nums.length; right++) {
    if (nums[right] === 0) zeros++;
    while (zeros > k) {
      if (nums[left] === 0) zeros--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}</code></pre>
<p>
  <b>Longest repeating character replacement</b> is the same budget with a
  twist. You may replace up to K characters so the window becomes one repeated
  letter. In a window of length <code>len</code>, you keep the most frequent
  letter and replace the rest, which costs <code>len - maxCount</code>
  replacements. The window is valid when that cost is at most K.
</p>
<pre><code>function characterReplacement(s, k) {
  const counts = new Array(26).fill(0);        <span class="c">// uppercase A-Z</span>
  let left = 0, best = 0;
  for (let right = 0; right &lt; s.length; right++) {
    counts[s.charCodeAt(right) - 65]++;
    while (right - left + 1 - Math.max(...counts) > k) {
      counts[s.charCodeAt(left) - 65]--;
      left++;
    }
    best = Math.max(best, right - left + 1);
  }
  return best;
}</code></pre>
<table>
  <tr><th>right</th><th>window after shrinking</th><th>most frequent count</th><th>length − most frequent</th><th>best</th></tr>
  <tr><td>0</td><td>"A"</td><td>1</td><td>0</td><td>1</td></tr>
  <tr><td>1</td><td>"AA"</td><td>2</td><td>0</td><td>2</td></tr>
  <tr><td>2</td><td>"AAB"</td><td>2</td><td>1</td><td>3</td></tr>
  <tr><td>3</td><td>"AABA"</td><td>3</td><td>1</td><td><b>4</b></td></tr>
  <tr><td>4</td><td>"BAB" (the 5-letter window needed 2 replacements)</td><td>2</td><td>1</td><td>4</td></tr>
  <tr><td>5</td><td>"BABB"</td><td>3</td><td>1</td><td>4</td></tr>
  <tr><td>6</td><td>"BBA"</td><td>2</td><td>1</td><td>4</td></tr>
</table>
<p class="sub">
  This is <code>"AABABBA"</code> with K = 1, answer 4. The
  <code>Math.max(...counts)</code> scan costs 26 operations, so the total is
  O(26 · n), which is O(n). A well-known variant keeps <code>maxCount</code> as
  a running maximum that is never lowered, and replaces the
  <code>while</code> with an <code>if</code>, so the window never gets
  smaller. That version is correct and avoids the scan, but its proof takes a
  paragraph, so write the scanning version first and mention the variant only
  if asked about the constant factor.
</p>

<h3>When the window breaks: negative numbers and non-monotone rules</h3>
<p>
  Every window above rests on one property: <b>validity is monotone</b>. If a
  window is valid, so are the windows you get by shrinking it (for the
  "at most" rules), or growing it (for the "at least" rules), and moving
  <code>left</code> forward therefore never throws away an answer. Lose the
  property and the pointers stop knowing which way to go.
</p>
<p>
  The usual way to lose it is a negative number. Run the shortest-window
  template on "shortest subarray with sum at least k" for
  <code>[84, -37, 32, 40, 95]</code> and <code>k = 167</code>:
</p>
<pre><code><span class="c">// WRONG when nums can be negative</span>
function shortestSubarrayWrong(nums, k) {
  let left = 0, sum = 0, best = Infinity;
  for (let right = 0; right &lt; nums.length; right++) {
    sum += nums[right];
    while (sum >= k) {
      best = Math.min(best, right - left + 1);
      sum -= nums[left++];
    }
  }
  return best === Infinity ? -1 : best;
}</code></pre>
<p class="sub">
  It returns 5: at the last element the sum is 214, the whole array is
  recorded, and removing the 84 drops the sum to 130, below 167, so the loop
  stops. But the window <code>[32, 40, 95]</code> sums to exactly 167 and has
  length 3. To reach it you would have to remove the <code>-37</code> as well,
  and removing a negative <em>raises</em> the sum, which the loop never tries
  because it stopped the moment the sum dropped.
</p>
<table>
  <tr><th>Rule</th><th>Monotone?</th><th>Works with the window?</th></tr>
  <tr><td>Sum at least or at most a target, positive numbers</td><td>yes</td><td>yes</td></tr>
  <tr><td>Product below k, positive numbers</td><td>yes</td><td>yes</td></tr>
  <tr><td>At most K distinct, at most K zeros</td><td>yes</td><td>yes</td></tr>
  <tr><td>Exactly K of anything</td><td>no</td><td>only as at most K minus at most K − 1</td></tr>
  <tr><td>Sum equal to a target, with negatives</td><td>no</td><td>no: use prefix sums and a hash map (<a href="/dsa/dsa-hashing">hashing</a>)</td></tr>
  <tr><td>Shortest sum at least k, with negatives</td><td>no</td><td>no: prefix sums plus a monotonic deque (<a href="/dsa/dsa-monotonic-stack-queue">monotonic stack and queue</a>)</td></tr>
</table>
<p class="sub">
  The interview habit that saves you: before you commit to a window, ask "if
  this window is valid, what happens when I add an element, and when I remove
  one?" If the answer depends on the sign or the value of what you add, stop
  and reach for prefix sums.
</p>

<h3>Sliding window maximum: a window with a deque</h3>
<p>
  So far the state could be updated in O(1) in both directions: a sum is undone
  by subtraction, a count by decrementing. A <b>maximum</b> cannot be undone.
  When the largest element leaves the window, you need the largest of what is
  left, and nothing in a single running number tells you that. The brute force
  rescans each window, O(n · k).
</p>
<p>
  Keep only the elements that could still become the maximum. Suppose a new
  element <code>x</code> arrives and an earlier element in the window is
  smaller than or equal to <code>x</code>. That earlier element can never be the
  maximum again, because <code>x</code> is at least as large and leaves the
  window later. So throw it away. What survives is a list of indices whose
  values <em>decrease</em> from front to back, and the front is always the
  maximum of the window. Two more rules finish it: drop the front when its
  index falls out of the window, and read the front after each full window. The
  list needs removal at both ends, which is a deque. (Assume
  <code>1 &lt;= k &lt;= nums.length</code>.)
</p>
<pre><code>function maxSlidingWindow(nums, k) {
  const out = [];
  const dq = [];            <span class="c">// indices; the live part starts at head, values decrease</span>
  let head = 0;
  for (let i = 0; i &lt; nums.length; i++) {
    while (dq.length > head &amp;&amp; nums[dq[dq.length - 1]] &lt;= nums[i]) dq.pop();  <span class="c">// dominated by nums[i]</span>
    dq.push(i);
    if (dq[head] &lt;= i - k) head++;            <span class="c">// the front index left the window</span>
    if (i >= k - 1) out.push(nums[dq[head]]);
  }
  return out;
}</code></pre>

<h4>Dry run: maxSlidingWindow([1, 3, -1, -3, 5, 3, 6, 7], 3)</h4>
<table>
  <tr><th>i (value)</th><th>live deque (values)</th><th>output so far</th></tr>
  <tr><td>0 (1)</td><td>[1]</td><td>[]</td></tr>
  <tr><td>1 (3)</td><td>[3] (1 dominated, removed)</td><td>[]</td></tr>
  <tr><td>2 (−1)</td><td>[3, −1]</td><td>[3]</td></tr>
  <tr><td>3 (−3)</td><td>[3, −1, −3]</td><td>[3, 3]</td></tr>
  <tr><td>4 (5)</td><td>[5] (all three dominated)</td><td>[3, 3, 5]</td></tr>
  <tr><td>5 (3)</td><td>[5, 3]</td><td>[3, 3, 5, 5]</td></tr>
  <tr><td>6 (6)</td><td>[6]</td><td>[3, 3, 5, 5, 6]</td></tr>
  <tr><td>7 (7)</td><td>[7]</td><td>[3, 3, 5, 5, 6, 7]</td></tr>
</table>
<p class="sub">
  Each index is pushed once and popped at most once, so the loop does O(n) work
  in total even though the inner <code>while</code> can pop many entries at one
  step. The live part holds at most <code>k</code> indices. Using a
  <code>head</code> index avoids <code>shift()</code>, which the language
  defines as moving every remaining element down one place, so you should not
  count on it being O(1) when you explain the complexity. Popping on
  <code>&lt;=</code> rather than <code>&lt;</code> keeps the deque strictly
  decreasing and is safe for equal values, since the newer one lasts longer. The
  same two-ended structure answers "longest subarray where max minus min is at
  most a limit" with one deque for the maximum and one for the minimum, and is
  developed in <a href="/dsa/dsa-monotonic-stack-queue">monotonic stack and queue</a>.
</p>

<h3>Which template for which question</h3>
<table>
  <tr><th>The question asks for</th><th>Shape</th><th>When you record</th></tr>
  <tr><td>Longest window that satisfies a rule</td><td>expand, shrink while invalid</td><td>after the shrink loop</td></tr>
  <tr><td>Shortest window that satisfies a rule</td><td>expand, shrink while valid</td><td>inside the shrink loop, before removing</td></tr>
  <tr><td>How many windows satisfy an "at most" rule</td><td>expand, shrink while invalid</td><td>add <code>right - left + 1</code> after the shrink loop</td></tr>
  <tr><td>How many windows satisfy "exactly K"</td><td>two counting windows</td><td>atMost(K) − atMost(K − 1)</td></tr>
  <tr><td>Contains all of another string, with repeats</td><td>need map plus <code>missing</code></td><td>inside the shrink loop while <code>missing === 0</code></td></tr>
  <tr><td>Window of a fixed size</td><td>add the new, drop the old</td><td>once the window is full</td></tr>
  <tr><td>Maximum or minimum of every window</td><td>monotonic deque</td><td>the front, once the window is full</td></tr>
</table>

<h3>Pitfalls that cost offers</h3>
<ul>
  <li>
    <b>Negative numbers</b> break any sum-based window. Check the sign
    constraint in the prompt before writing a line.
  </li>
  <li>
    <b>Substring or subarray, not subsequence.</b> A window is contiguous. If
    the characters may be skipped, it is a different problem.
  </li>
  <li>
    <b>Forgetting to delete zero-count keys</b> makes <code>map.size</code>
    lie, so the distinct-count rule never fires.
  </li>
  <li>
    <b><code>if</code> where <code>while</code> belongs.</b> One removal may not
    restore validity.
  </li>
  <li>
    <b>Off-by-one in the length.</b> The length of <code>[left, right]</code> is
    <code>right - left + 1</code>. Writing <code>right - left</code> is the
    commonest slip, and it is wrong by exactly one on every answer.
  </li>
  <li>
    <b>Recording at the wrong moment.</b> Longest: after shrinking. Shortest:
    before removing. Counting: after shrinking.
  </li>
  <li>
    <b>Re-initialising instead of sliding.</b> Rebuilding the state for every
    window is the O(n · k) solution you were meant to replace.
  </li>
  <li>
    <b>Empty input, <code>k</code> larger than the array, <code>k = 0</code>.</b>
    Decide what each should return before you code, as with
    <code>maxSumWindow</code> above.
  </li>
</ul>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The words "contiguous subarray" or "substring" (not subsequence)</li>
  <li>"Longest," "shortest," "maximum," or "minimum" over a contiguous range</li>
  <li>A brute force would check every <code>[i, j]</code> pair — O(n²) or worse</li>
  <li>The condition can be checked/updated incrementally as the window changes</li>
  <li>Adding an element can only push the window toward invalid, and removing one can only push it back (monotone validity); check this before the sign of the numbers</li>
  <li>"How many subarrays" with an "at most" rule, or "exactly K" that can be rewritten as at most K minus at most K − 1</li>
  <li>"Contains all the characters of T", "is a permutation of", or "at most K replacements/flips" over a string or a binary array</li>
  <li>"Maximum or minimum of every window of size k", which needs a monotonic deque rather than a running number</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why sliding window is O(n) even though the shrink step looks like a loop inside a loop — the amortized argument, not just "it's fast."</li>
    <li>Trace <code>longestUniqueSubstring</code> on a new string by hand, including at least one point where <code>left</code> jumps more than one position.</li>
    <li>Write the general variable-window template (expand, shrink while invalid, update answer) from memory.</li>
    <li>Say why <code>left</code> jumping straight past the repeat, instead of stepping one at a time, still keeps the total work O(n).</li>
    <li>Given a new problem, recognize a fixed-size window versus a variable-size window, and state which condition would trigger the shrink step.</li>
    <li>Say where the answer is recorded for the longest window, the shortest window and a count of windows, and why those places differ.</li>
    <li>Rewrite "exactly K" as at most K minus at most K − 1, and explain why exactly K is not monotone.</li>
    <li>Write minimum window substring with the <code>need</code> map and the <code>missing</code> counter, including what happens with duplicate characters in <code>t</code>.</li>
    <li>Give a concrete input where a sum window fails because of a negative number, and name the replacement technique.</li>
    <li>Explain why a maximum needs a deque while a sum does not, and why each index is popped at most once.</li>
  </ul>
</div>`,
};
