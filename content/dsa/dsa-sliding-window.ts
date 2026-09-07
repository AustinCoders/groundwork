import type { Chapter } from "../types";

export const dsaSlidingWindow: Chapter = {
  id: "dsa-sliding-window",
  num: "B5",
  title: "Sliding window",
  short: "Sliding window",
  levels: ["beginner"],
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

<h3>Watch the window grow and jump, step by step</h3>
<p><code>s = "abcabcbb"</code>:</p>
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
  var STEPS = [{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":[],"best":["0"]},"note":"Find the longest substring with no repeated character in \\"abcabcbb\\"."},{"cells":[{"v":"a","c":"in","p":"L R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["a"],"best":["0"]},"note":"\\"a\\" is new to the window, so right extends it."},{"cells":[{"v":"a","c":"in","p":"L R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["a"],"best":["1"]},"note":"Window is length 1 — a new best."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["ab"],"best":["1"]},"note":"\\"b\\" is new to the window, so right extends it."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["ab"],"best":["2"]},"note":"Window is length 2 — a new best."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["2"]},"note":"\\"c\\" is new to the window, so right extends it."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"Window is length 3 — a new best."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"in","p":"L"},{"v":"c","c":"in","p":""},{"v":"a","c":"in","p":"R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["bca"],"best":["3"]},"note":"\\"a\\" is already inside the window. left jumps to 1 — past the old \\"a\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"in","p":"L"},{"v":"a","c":"in","p":""},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["cab"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 2 — past the old \\"b\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"\\"c\\" is already inside the window. left jumps to 3 — past the old \\"c\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"b","c":"out","p":""}],"panels":{"win":["cb"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 5 — past the old \\"b\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"in","p":"L R"}],"panels":{"win":["b"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 7 — past the old \\"b\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"done","p":""},{"v":"b","c":"done","p":""},{"v":"c","c":"done","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"Answer: 3. Each index was visited at most twice — O(n), not O(n²)."}];
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
  <li>The words "contiguous subarray" or "substring" (not subsequence)</li>
  <li>"Longest," "shortest," "maximum," or "minimum" over a contiguous range</li>
  <li>A brute force would check every <code>[i, j]</code> pair — O(n²) or worse</li>
  <li>The condition can be checked/updated incrementally as the window changes</li>
</ul>`,
};
