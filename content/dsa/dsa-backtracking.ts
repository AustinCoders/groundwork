import type { Chapter } from "../types";

export const dsaBacktracking: Chapter = {
  id: "dsa-backtracking",
  num: "I9",
  title: "Backtracking",
  short: "Backtracking",
  levels: ["intermediate"],
  prerequisites: ["dsa-basic-recursion"],
  practice: [
    "ex-subsets-bitmask",
    "ex-permutations",
    "ex-combination-sum",
    "ex-combination-sum-ii",
    "ex-word-search",
    "ex-palindrome-partitioning",
    "ex-letter-combinations-phone",
    "ex-subsets-ii",
    "ex-permutations-ii",
    "ex-combinations",
    "ex-generate-parentheses",
    "ex-restore-ip-addresses",
    "ex-n-queens-count",
  ],
  ready: true,
  subtitle: "Try a choice, recurse, undo the choice — DFS over a tree of decisions instead of a graph.",
  body: `<h3>The shape: choose, explore, un-choose</h3>
<p>
  Backtracking is DFS applied to a tree you build as you go — a
  <b>decision tree</b>, where each level represents one choice and each
  root-to-leaf path is one complete candidate answer. The "backtrack" part
  is the un-choose step: after exploring everything a choice leads to, you
  undo it before trying the next option, so the next branch starts from a
  clean slate.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A decision tree for generating subsets of two elements, showing every branch of include or exclude choices">
    <g class="rough">
      <path class="ln" d="M320,30 L160,90" />
      <path class="lnr" d="M320,30 L480,90" />
      <path class="ln" d="M160,90 L80,150" />
      <path class="lnr" d="M160,90 L240,150" />
      <path class="ln" d="M480,90 L400,150" />
      <path class="lnr" d="M480,90 L560,150" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="30" r="20" />
      <circle class="box" cx="160" cy="90" r="18" />
      <circle class="boxr" cx="480" cy="90" r="18" />
      <circle class="box" cx="80" cy="150" r="16" />
      <circle class="boxr" cx="240" cy="150" r="16" />
      <circle class="box" cx="400" cy="150" r="16" />
      <circle class="boxr" cx="560" cy="150" r="16" />
    </g>
    <text class="sm" x="320" y="35" text-anchor="middle">[]</text>
    <text class="sm" x="205" y="52">skip 1</text>
    <text class="sm rd" x="435" y="60" text-anchor="end">take 1</text>
    <text class="sm" x="80" y="155" text-anchor="middle">[]</text>
    <text class="sm rd" x="240" y="155" text-anchor="middle">[2]</text>
    <text class="sm" x="400" y="155" text-anchor="middle">[1]</text>
    <text class="sm rd" x="560" y="154" text-anchor="middle" style="font-size:11px">[1,2]</text>
    <text class="lbl" x="20" y="200" style="font-size:14px">4 leaves = 4 subsets of {1,2}: [], [2], [1], [1,2]</text>
    <text class="lbl rd" x="20" y="222" style="font-size:14px">every red edge is "include this element" —</text>
    <text class="lbl rd" x="20" y="242" style="font-size:14px">undone (backtracked) after each branch returns</text>
  </svg>
  <figcaption>Each root-to-leaf path is one full answer. Backtracking undoes a choice the moment its subtree is fully explored.</figcaption>
</figure>

<h3>The template every backtracking problem is built from</h3>
<pre><code>function backtrack(path, choices) {
  if (/* path is a complete valid answer */ false) {
    results.push([...path]); <span class="c">// COPY — path keeps mutating after this</span>
    return;
  }

  for (const choice of choices) {
    if (/* choice is invalid right now */ false) continue; <span class="c">// pruning</span>

    path.push(choice);          <span class="c">// 1. choose</span>
    backtrack(path, nextChoices); <span class="c">// 2. explore</span>
    path.pop();                  <span class="c">// 3. un-choose — THE step people forget</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The bug that shows up in almost every first attempt</span>
  <code>results.push(path)</code> pushes a <em>reference</em> to the same
  array you keep mutating — by the time you're done, every entry in
  <code>results</code> points at the same, now-empty array. Always push a
  copy: <code>[...path]</code> or <code>path.slice()</code>.
</div>

<h3>Subsets — include or exclude, every element</h3>
<pre><code>function subsets(nums) {
  const results = [];
  function backtrack(start, path) {
    results.push([...path]); <span class="c">// every path is valid — push at every node, not just leaves</span>
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path); <span class="c">// i + 1, not start + 1 — never reuse an earlier index</span>
      path.pop();
    }
  }
  backtrack(0, []);
  return results;
}</code></pre>
<h4>Dry run: subsets([1, 2]) — the same tree as the figure above</h4>
<table>
  <tr><th>Call, in order</th><th>path</th><th>results after this call's push</th></tr>
  <tr><td>backtrack(0, [])</td><td>[]</td><td>[[]]</td></tr>
  <tr><td>backtrack(1, [1])</td><td>[1]</td><td>[[], [1]]</td></tr>
  <tr><td>backtrack(2, [1, 2])</td><td>[1, 2]</td><td>[[], [1], [1, 2]]</td></tr>
  <tr><td>backtrack(2, [2])</td><td>[2]</td><td>[[], [1], [1, 2], [2]]</td></tr>
</table>
<p class="sub">
  Between the third and fourth rows, <code>path.pop()</code> runs twice on
  the way back out of the recursion — once undoing the 2, once undoing the
  1 — before <code>backtrack(2, [2])</code> ever starts. That's the
  un-choose step doing its job: <code>[2]</code> starts from a clean empty
  path, not from <code>[1]</code> left over from the branch before it.
</p>

<h3>Permutations — order matters, every element used exactly once</h3>
<pre><code>function permute(nums) {
  const results = [];
  function backtrack(path, used) {
    if (path.length === nums.length) {
      results.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue; <span class="c">// pruning: skip anything already placed</span>
      used[i] = true;
      path.push(nums[i]);
      backtrack(path, used);
      path.pop();
      used[i] = false; <span class="c">// un-choose</span>
    }
  }
  backtrack([], new Array(nums.length).fill(false));
  return results;
}</code></pre>

<h3>Combinations — like subsets, but with a fixed size</h3>
<pre><code>function combine(n, k) {
  const results = [];
  function backtrack(start, path) {
    if (path.length === k) {
      results.push([...path]);
      return;
    }
    <span class="c">// prune: if not enough numbers remain to reach size k, stop early</span>
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(1, []);
  return results;
}</code></pre>
<p class="sub">
  That early-exit condition is real pruning, not just a style choice — it
  cuts off branches that provably can't reach a valid answer before ever
  recursing into them, which is where backtracking gets its practical
  speed despite the worst-case complexity being exponential.
</p>

<h3>Why the complexity looks scary and that's expected</h3>
<table>
  <tr><th>Problem</th><th>Number of leaves</th></tr>
  <tr><td>Subsets of n elements</td><td>2ⁿ — each element is either in or out</td></tr>
  <tr><td>Permutations of n elements</td><td>n! — every ordering</td></tr>
  <tr><td>Combinations, choose k of n</td><td>C(n, k) — bounded, smaller than 2ⁿ</td></tr>
</table>
<p class="sub">
  This isn't a bug to optimize away — it's inherent to "generate every
  valid X." What you <em>can</em> optimize is how much of the tree you
  actually visit, by pruning invalid branches as early as possible (as
  seen in the N-Queens example below) rather than generating a full
  candidate and checking it after the fact.
</p>

<h3>N-Queens — pruning is what makes it tractable</h3>
<pre><code>function solveNQueens(n) {
  const results = [];
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  const placement = [];

  function backtrack(row) {
    if (row === n) {
      results.push([...placement]);
      return;
    }
    for (let col = 0; col < n; col++) {
      const d1 = row - col, d2 = row + col;
      if (cols.has(col) || diag1.has(d1) || diag2.has(d2)) continue; <span class="c">// prune — this column/diagonal is under attack</span>

      cols.add(col); diag1.add(d1); diag2.add(d2);
      placement.push(col);

      backtrack(row + 1);

      cols.delete(col); diag1.delete(d1); diag2.delete(d2); <span class="c">// backtrack</span>
      placement.pop();
    }
  }
  backtrack(0);
  return results;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll build the answer one
  choice at a time and prune the moment a partial choice is already
  invalid — checking column and both diagonals in O(1) via sets means I
  never waste time exploring a branch that was doomed from the first bad
  placement."
</div>

<h3>Word Search — backtracking over a grid instead of an array</h3>
<p>
  The same choose/explore/un-choose shape, just with "neighbors in a
  grid" as the branching factor instead of "remaining array elements."
  This combines directly with the grid-traversal ideas from the matrix
  chapter.
</p>
<pre><code>function exist(board, word) {
  const rows = board.length, cols = board[0].length;

  function backtrack(r, c, i) {
    if (i === word.length) return true; <span class="c">// matched every character — done</span>
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[i]) return false;

    const temp = board[r][c];
    board[r][c] = "#"; <span class="c">// mark visited IN PLACE — avoids a separate visited set</span>

    const found =
      backtrack(r + 1, c, i + 1) ||
      backtrack(r - 1, c, i + 1) ||
      backtrack(r, c + 1, i + 1) ||
      backtrack(r, c - 1, i + 1);

    board[r][c] = temp; <span class="c">// UN-CHOOSE — restore before trying a different path</span>
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (backtrack(r, c, 0)) return true;
    }
  }
  return false;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Forgetting to restore the cell is the classic bug here</span>
  Marking a cell visited without restoring it afterward means a
  <em>later</em>, unrelated search path can no longer use that cell even
  though it should be free again — silently wrong answers on inputs where
  paths would legitimately cross the same cell from a different starting
  point.
</div>

<h3>Combination Sum — when you're allowed to reuse an element</h3>
<p>
  Unlike <code>combine()</code> earlier, the same number can be picked
  more than once. The fix is a one-character change with a real
  consequence: recurse with <code>i</code>, not <code>i + 1</code>.
</p>
<pre><code>function combinationSum(candidates, target) {
  const results = [];
  function backtrack(start, path, remaining) {
    if (remaining === 0) { results.push([...path]); return; }
    if (remaining < 0) return; <span class="c">// prune — overshot, no point continuing</span>

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, path, remaining - candidates[i]); <span class="c">// i, not i+1 — this number can be reused</span>
      path.pop();
    }
  }
  backtrack(0, [], target);
  return results;
}</code></pre>
<p class="sub">
  This single index difference (<code>i</code> vs <code>i + 1</code>) is
  worth internalizing as its own decision point: "can this choice repeat?"
  is usually the very first question to answer before writing the loop —
  it changes one character, but changes the whole shape of the search
  space.
</p>

<h3>Duplicates in the input — sort, then skip at the same level</h3>
<p>
  Everything so far assumed the input values are distinct. Once they are not, the
  tree itself still has the right shape, but different branches produce the same
  answer. Take <code>[1, 2, 2]</code> and the plain <code>subsets</code> code:
  choosing the first 2 and then nothing gives <code>[1, 2]</code>, and choosing
  the second 2 and then nothing gives <code>[1, 2]</code> again. The plain code
  returns <code>[[], [1], [1, 2], [1, 2, 2], [1, 2], [2], [2, 2], [2]]</code>:
  eight lists, but only six different ones.
</p>
<p>
  The fix comes from asking <em>where</em> the two copies of <code>[1, 2]</code>
  diverge. Both start from <code>[1]</code>, and then in the same loop one branch
  picks the 2 at index 1 and the other picks the 2 at index 2. Two siblings in the
  same loop holding equal values lead to the same answers: the earlier sibling's
  subtree can still reach everything that the later sibling's subtree can. So: <b>in one loop, try
  each distinct value once</b>. Sort the input so equal values sit next to each
  other, and skip a value when it equals the one just before it in the same loop.
</p>
<pre><code>function subsetsWithDup(nums) {
  const sorted = [...nums].sort((a, b) =&gt; a - b); <span class="c">// equal values must sit next to each other</span>
  const results = [];

  function backtrack(start, path) {
    results.push([...path]);
    for (let i = start; i &lt; sorted.length; i++) {
      if (i &gt; start &amp;&amp; sorted[i] === sorted[i - 1]) continue; <span class="c">// same value already tried at THIS level</span>
      path.push(sorted[i]);
      backtrack(i + 1, path);
      path.pop();
    }
  }

  backtrack(0, []);
  return results;
}</code></pre>
<p>
  The condition is <code>i &gt; start</code>, not <code>i &gt; 0</code>, and that
  difference is the whole idea. <code>i === start</code> is the first value this
  loop tries, so there is nothing before it to repeat. A value that equals its
  neighbour is only a duplicate if that neighbour was tried in the <em>same
  loop</em>. Equal values at different depths are fine and necessary: the 2 in
  <code>[1, 2, 2]</code> is chosen at one level and the next 2 at the level
  below it, and that is how <code>[1, 2, 2]</code> gets built.
</p>
<h4>Dry run: subsetsWithDup([1, 2, 2])</h4>
<table>
  <tr><th>Step</th><th>Call or skip</th><th>Pushed to results</th></tr>
  <tr><td>1</td><td>backtrack(0, []), takes sorted[0] = 1</td><td>[]</td></tr>
  <tr><td>2</td><td>backtrack(1, [1]), takes sorted[1] = 2</td><td>[1]</td></tr>
  <tr><td>3</td><td>backtrack(2, [1, 2]), takes sorted[2] = 2 (i equals start, so allowed)</td><td>[1, 2]</td></tr>
  <tr><td>4</td><td>backtrack(3, [1, 2, 2]), no values left</td><td>[1, 2, 2]</td></tr>
  <tr><td>5</td><td>back in backtrack(1, [1]): i = 2, sorted[2] equals sorted[1] and i &gt; start, <b>skip</b></td><td>— (would repeat [1, 2])</td></tr>
  <tr><td>6</td><td>back in backtrack(0, []): takes sorted[1] = 2, calls backtrack(2, [2])</td><td>[2]</td></tr>
  <tr><td>7</td><td>backtrack(2, [2]) takes sorted[2] = 2 (i equals start), calls backtrack(3, [2, 2])</td><td>[2, 2]</td></tr>
  <tr><td>8</td><td>back in backtrack(0, []): i = 2, equal to the previous and i &gt; start, <b>skip</b></td><td>— (would repeat [2])</td></tr>
</table>
<p class="sub">
  Two skips, and exactly the two repeated lists disappear. The result has six
  entries. Time is O(n · 2ⁿ) at worst: up to 2ⁿ subsets, each costing O(n) to
  copy.
</p>
<h4>Permutations with repeated values</h4>
<p>
  The same sentence works for permutations, with one wrinkle: permutations loop
  over <em>all</em> positions each time, using a <code>used</code> array, so "the
  previous value in the same loop" must also be unused to count as a sibling. The
  rule is: skip index <code>i</code> if it equals <code>sorted[i - 1]</code> and
  <code>sorted[i - 1]</code> is <b>not</b> currently used. Intuitively, equal
  values are interchangeable, so you insist they enter the path in their original
  left-to-right order; a twin may only be placed when the twin before it is
  already in the path.
</p>
<pre><code>function permuteUnique(nums) {
  const sorted = [...nums].sort((a, b) =&gt; a - b);
  const results = [];
  const used = new Array(sorted.length).fill(false);
  const path = [];

  function backtrack() {
    if (path.length === sorted.length) {
      results.push([...path]);
      return;
    }
    for (let i = 0; i &lt; sorted.length; i++) {
      if (used[i]) continue;
      if (i &gt; 0 &amp;&amp; sorted[i] === sorted[i - 1] &amp;&amp; !used[i - 1]) continue; <span class="c">// equal twins are used left to right</span>
      used[i] = true;
      path.push(sorted[i]);
      backtrack();
      path.pop();
      used[i] = false;
    }
  }

  backtrack();
  return results;
}</code></pre>
<p>
  For <code>[1, 1, 2]</code> there are 3 distinct permutations, against 3! = 6 in
  the plain code. Step by step: the root tries <code>i = 0</code> (a 1), and inside
  it both the second 1 (allowed, since the first is used) and the 2 are tried,
  giving <code>[1, 1, 2]</code> and <code>[1, 2, 1]</code>. Back at the root,
  <code>i = 1</code> is a 1 whose twin at index 0 is unused, so it is skipped.
  Then <code>i = 2</code> starts <code>[2, ...]</code> and inside it index 0 is
  taken, index 1 is skipped for the same reason, giving
  <code>[2, 1, 1]</code>.
</p>
<p>
  There is a second way that avoids the index rule entirely: count the values,
  and let each level branch once per <em>distinct</em> value that still has a
  count left. Equal values can never be chosen as two separate siblings because
  they are one entry in the map.
</p>
<pre><code>function permuteUniqueCounts(nums) {
  const counts = new Map();
  for (const x of nums) counts.set(x, (counts.get(x) ?? 0) + 1);
  const results = [];
  const path = [];

  function backtrack() {
    if (path.length === nums.length) {
      results.push([...path]);
      return;
    }
    for (const [value, left] of counts) { <span class="c">// one branch per DISTINCT value</span>
      if (left === 0) continue;
      counts.set(value, left - 1);
      path.push(value);
      backtrack();
      path.pop();
      counts.set(value, left);
    }
  }

  backtrack();
  return results;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The test <code>used[i - 1]</code> without the <code>!</code> is correct but slow</span>
  Writing <code>used[i - 1]</code> instead of <code>!used[i - 1]</code> also
  returns only distinct permutations, because it enforces the opposite order of
  twins. But it enters branches that it is going to abandon later. For eight equal
  numbers, one distinct permutation, the version above makes 9 calls and the
  opposite test makes 2,781. Prefer the form that cuts a branch at the moment it
  is created.
</div>
<h4>Combination Sum II — each element once, duplicates in the input</h4>
<p>
  Candidates may repeat (<code>[10, 1, 2, 7, 6, 1, 5]</code>), and each position
  may be used at most once, so the recursive call is <code>i + 1</code> as in
  <code>subsets</code>. The same-level skip removes duplicate answers. Sorting also
  buys a second, separate saving: once <code>sorted[i]</code> is larger than
  what remains, every later value in the loop is too, so <code>break</code> ends the
  loop instead of continuing it.
</p>
<pre><code>function combinationSum2(candidates, target) {
  const sorted = [...candidates].sort((a, b) =&gt; a - b);
  const results = [];

  function backtrack(start, path, remaining) {
    if (remaining === 0) {
      results.push([...path]);
      return;
    }
    for (let i = start; i &lt; sorted.length; i++) {
      if (sorted[i] &gt; remaining) break; <span class="c">// sorted: every later value is too big as well</span>
      if (i &gt; start &amp;&amp; sorted[i] === sorted[i - 1]) continue; <span class="c">// same value already tried at this level</span>
      path.push(sorted[i]);
      backtrack(i + 1, path, remaining - sorted[i]); <span class="c">// i + 1: each element is used at most once</span>
      path.pop();
    }
  }

  backtrack(0, [], target);
  return results;
}</code></pre>
<p>
  With target 8 the answer is <code>[[1, 1, 6], [1, 2, 5], [1, 7], [2, 6]]</code>.
  Note that <code>[1, 1, 6]</code> is kept: its second 1 is chosen one level
  <em>deeper</em> than the first, where it is not a sibling. The same-level skip
  fires only once, at the top, when the loop reaches the second 1 after the first
  1's whole subtree has been explored, which would otherwise have produced
  <code>[1, 2, 5]</code> and <code>[1, 7]</code> a second time.
</p>
<div class="warn">
  <span class="ttl">⚠ Four ways duplicate handling goes wrong</span>
  <b>Forgetting to sort.</b> On <code>[2, 1, 2]</code> the equal values are not
  adjacent, the skip never fires, and duplicates return. <b>Writing
  <code>i &gt; 0</code> instead of <code>i &gt; start</code>.</b> On
  <code>[1, 2, 2]</code> that drops <code>[2, 2]</code> and
  <code>[1, 2, 2]</code>, because the second 2 is wrongly skipped even when it
  is a child, not a sibling. <b>Sorting the caller's array in place.</b> Copy it
  first, as the code does. <b>Deduplicating at the end with a Set of strings.</b>
  It returns the right answer but still builds every duplicate first, which is
  exactly the work the skip avoids.
</div>

<h3>Cut-point backtracking — splitting a string into valid pieces</h3>
<p>
  So far each level chose <em>which element</em> comes next. A different family
  chooses <em>where to cut</em> a string. The state is a single number,
  <code>start</code>, the first character of the piece you have not placed yet; a
  level tries every possible end of the next piece; and a branch is only worth
  entering when the piece it cuts is acceptable. The pruning happens on the
  piece, before recursing.
</p>
<p>
  <b>Palindrome Partitioning</b> asks for every way to split a string so that
  every piece is a palindrome. The loop is over the end of the next piece, the
  test is "is <code>s[start..end]</code> a palindrome", and the base case is
  reaching the end of the string.
</p>
<pre><code>function partition(s) {
  const n = s.length;
  const results = [];
  const pieces = [];

  function isPalindrome(lo, hi) {
    while (lo &lt; hi) {
      if (s[lo++] !== s[hi--]) return false;
    }
    return true;
  }

  function backtrack(start) {
    if (start === n) {
      results.push([...pieces]);
      return;
    }
    for (let end = start; end &lt; n; end++) { <span class="c">// the piece is s[start..end]: choose where to cut</span>
      if (!isPalindrome(start, end)) continue;
      pieces.push(s.slice(start, end + 1));
      backtrack(end + 1); <span class="c">// the next piece starts right after the cut</span>
      pieces.pop();
    }
  }

  backtrack(0);
  return results;
}</code></pre>
<h4>Dry run: partition("aab")</h4>
<table>
  <tr><th>start</th><th>end tried</th><th>Piece</th><th>Palindrome?</th><th>Outcome</th></tr>
  <tr><td>0</td><td>0</td><td>"a"</td><td>yes</td><td>recurse with start = 1</td></tr>
  <tr><td>1</td><td>1</td><td>"a"</td><td>yes</td><td>recurse with start = 2</td></tr>
  <tr><td>2</td><td>2</td><td>"b"</td><td>yes</td><td>start = 3 = n, record ["a", "a", "b"]</td></tr>
  <tr><td>1</td><td>2</td><td>"ab"</td><td>no</td><td>skipped, no recursion</td></tr>
  <tr><td>0</td><td>1</td><td>"aa"</td><td>yes</td><td>recurse with start = 2</td></tr>
  <tr><td>2</td><td>2</td><td>"b"</td><td>yes</td><td>record ["aa", "b"]</td></tr>
  <tr><td>0</td><td>2</td><td>"aab"</td><td>no</td><td>skipped</td></tr>
</table>
<p class="sub">
  The cost has a different shape from subsets. On <code>"aaaa…a"</code> of length
  <code>n</code> every cut is allowed, so there are 2ⁿ⁻¹ partitions (1, 2, 4, 8
  for lengths 1 to 4), and each costs O(n) to copy and to test. The palindrome
  test alone adds a factor of n per piece. To pay for it once, precompute a table
  <code>isPal[lo][hi]</code> in O(n²), after which each test is O(1):
</p>
<pre><code>function buildPalindromeTable(s) {
  const n = s.length;
  const isPal = Array.from({ length: n }, () =&gt; new Array(n).fill(false));
  for (let lo = n - 1; lo &gt;= 0; lo--) { <span class="c">// lo goes right to left so isPal[lo + 1][hi - 1] is ready</span>
    for (let hi = lo; hi &lt; n; hi++) {
      isPal[lo][hi] = s[lo] === s[hi] &amp;&amp; (hi - lo &lt; 2 || isPal[lo + 1][hi - 1]);
    }
  }
  return isPal;
}</code></pre>
<p class="sub">
  A substring is a palindrome when its two end characters match and the part
  between them is a palindrome (or has fewer than two characters). The loop over
  <code>lo</code> runs from the right end so that <code>isPal[lo + 1][hi - 1]</code>
  already exists. This is a small 2D dynamic programming table.
  The backtracking itself is unchanged, with <code>isPal[start][end]</code> in
  place of the helper.
</p>
<p>
  <b>Restore IP Addresses</b> is the same skeleton with exactly four pieces and
  validity rules built into the loop: each piece has one to three digits, no
  leading zero unless the piece is the single digit <code>0</code>, and a value
  of at most 255. Because the number of pieces is fixed, a strong prune is
  available: at any point, the characters left must fit in the pieces left, at
  least one and at most three each.
</p>
<pre><code>function restoreIpAddresses(s) {
  const results = [];
  const parts = [];

  function backtrack(start) {
    const partsLeft = 4 - parts.length;
    const charsLeft = s.length - start;
    if (charsLeft &lt; partsLeft || charsLeft &gt; 3 * partsLeft) return; <span class="c">// cannot fit: prune early</span>
    if (partsLeft === 0) {
      results.push(parts.join("."));
      return;
    }
    for (let len = 1; len &lt;= 3; len++) {
      const piece = s.slice(start, start + len);
      if (piece.length &lt; len) break; <span class="c">// ran off the end of the string</span>
      if (piece.length &gt; 1 &amp;&amp; piece[0] === "0") break; <span class="c">// no leading zeros: "0" is fine, "01" is not</span>
      if (Number(piece) &gt; 255) break;
      parts.push(piece);
      backtrack(start + len);
      parts.pop();
    }
  }

  backtrack(0);
  return results;
}</code></pre>
<p>
  For <code>"25525511135"</code> the two answers are
  <code>255.255.11.135</code> and <code>255.255.111.35</code>. The search is
  tiny: at most 3 choices at each of 4 levels, so at most 81 leaves, which makes
  the running time O(1) for a fixed address length of 4 pieces. The length check
  is what lets a string like <code>"1111111111111"</code> (13 digits) return
  immediately instead of searching.
</p>
<div class="warn">
  <span class="ttl">⚠ Cut-point bugs that show up in interviews</span>
  <b>Leading zeros.</b> <code>"0"</code> is a valid piece, <code>"01"</code> and
  <code>"00"</code> are not; for <code>"0000"</code> the only answer is
  <code>0.0.0.0</code>, and for <code>"010010"</code> you must not allow
  <code>"01"</code> or <code>"010"</code>. Note the code uses <code>break</code>,
  not <code>continue</code>, for these: a longer piece starting with the same
  zero is invalid too, so the whole loop can end. <b>Comparing strings
  instead of numbers.</b> <code>"99" &gt; "255"</code> is true as strings, so
  convert with <code>Number</code>. <b>Off-by-one on the slice.</b> The piece is
  <code>s.slice(start, end + 1)</code> when <code>end</code> is inclusive, and
  the recursion continues at <code>end + 1</code>. Mixing an inclusive end with
  an exclusive slice drops or repeats a character.
</div>

<h3>Letter Combinations — one decision per position</h3>
<p>
  Given a string of digits, return every letter string a phone keypad could
  spell. Here the levels are the <em>positions</em> of the input, and the loop at
  each level runs over the letters of that position's digit. Nothing needs a
  <code>start</code> index, because every position is decided exactly once and in
  order, and no choice depends on an earlier one.
</p>
<pre><code>function letterCombinations(digits) {
  if (digits.length === 0) return []; <span class="c">// not [""]: no digits means no combinations</span>
  const letters = { 2: "abc", 3: "def", 4: "ghi", 5: "jkl", 6: "mno", 7: "pqrs", 8: "tuv", 9: "wxyz" };
  const results = [];
  const path = [];

  function backtrack(position) {
    if (position === digits.length) {
      results.push(path.join(""));
      return;
    }
    for (const ch of letters[digits[position]]) { <span class="c">// one decision per digit position</span>
      path.push(ch);
      backtrack(position + 1);
      path.pop();
    }
  }

  backtrack(0);
  return results;
}</code></pre>
<p>
  For <code>"23"</code> the answer is the nine strings
  <code>ad, ae, af, bd, be, bf, cd, ce, cf</code>. The number of leaves is the
  product of the letter counts, at most 4ⁿ because digits 7 and 9 have four
  letters, and each result costs O(n) to join, so the time is O(4ⁿ · n).
</p>
<div class="warn">
  <span class="ttl">⚠ The empty input returns <code>[]</code>, not <code>[""]</code></span>
  With no digits the recursion would reach its base case immediately and
  record one empty string. The problem statement wants no combinations, so the
  function returns early. This is the kind of detail an interviewer tests with
  the first edge case they type in.
</div>

<h3>Generate Parentheses — prune on counts, not at the leaf</h3>
<p>
  Produce every string of <code>n</code> pairs of parentheses that is
  <b>well formed</b>: reading left to right, you never close more than you have
  opened, and at the end the counts match. Generating all 2²ⁿ strings and
  testing each one is correct but wasteful: for <code>n = 8</code> that is 65,536
  strings against 1,430 valid ones.
</p>
<p>
  Build the string one character at a time and track two numbers,
  <code>open</code> and <code>close</code>. The two rules translate directly into
  the two branches. You may add <code>(</code> while <code>open &lt; n</code>.
  You may add <code>)</code> only while <code>close &lt; open</code>, since
  otherwise there is nothing to close. Every string the recursion finishes is
  well formed by construction, so there is no validity check at the leaves.
</p>
<pre><code>function generateParenthesis(n) {
  const results = [];
  const path = [];

  function backtrack(open, close) {
    if (path.length === 2 * n) {
      results.push(path.join(""));
      return;
    }
    if (open &lt; n) { <span class="c">// we may open while we still have openers left</span>
      path.push("(");
      backtrack(open + 1, close);
      path.pop();
    }
    if (close &lt; open) { <span class="c">// we may close only what is already open</span>
      path.push(")");
      backtrack(open, close + 1);
      path.pop();
    }
  }

  backtrack(0, 0);
  return results;
}</code></pre>
<h4>Dry run: generateParenthesis(2)</h4>
<table>
  <tr><th>path</th><th>open, close</th><th>Branches available</th></tr>
  <tr><td>""</td><td>0, 0</td><td>"(" only: close &lt; open is false</td></tr>
  <tr><td>"("</td><td>1, 0</td><td>"(" (open &lt; 2) and ")" (close &lt; open)</td></tr>
  <tr><td>"(("</td><td>2, 0</td><td>")" only: open is already n</td></tr>
  <tr><td>"(()"</td><td>2, 1</td><td>")" only</td></tr>
  <tr><td>"(())"</td><td>2, 2</td><td>length 4 = 2n: <b>record</b></td></tr>
  <tr><td>"()"</td><td>1, 1</td><td>"(" only: close &lt; open is false</td></tr>
  <tr><td>"()("</td><td>2, 1</td><td>")" only</td></tr>
  <tr><td>"()()"</td><td>2, 2</td><td>length 4: <b>record</b></td></tr>
</table>
<p class="sub">
  The results are <code>["(())", "()()"]</code>. For <code>n = 3</code> the
  function returns <code>["((()))", "(()())", "(())()", "()(())", "()()()"]</code>.
  The counts of valid strings for <code>n = 1, 2, 3, ...</code> are 1, 2, 5, 14,
  42, 132, ... (the Catalan numbers). The recursion makes 22 calls for
  <code>n = 3</code> and 6,917 for <code>n = 8</code>.
</p>
<p>
  Complexity follows from one observation: this tree has <b>no dead ends</b>.
  Whenever the path is shorter than <code>2n</code>, at least one branch is
  open: if <code>open &lt; n</code>, add <code>(</code>; otherwise
  <code>open = n</code> and <code>close &lt; n = open</code>, so add
  <code>)</code>. Every node therefore has a result below it, so the number of
  nodes is at most the number of results times the depth. Time is
  O(n · Cₙ), where Cₙ is the n-th Catalan number, which grows roughly like 4ⁿ up
  to a polynomial factor. The recursion depth and the extra space are O(n).
</p>
<div class="warn">
  <span class="ttl">⚠ Counting what you have used, not what you have left</span>
  The common slip is <code>if (close &lt; n)</code> for the closing branch. That
  allows <code>"())"</code> and every other string that closes before it opens,
  and the results fill with invalid strings. The closing rule compares
  <code>close</code> with <code>open</code>, not with <code>n</code>. Also
  remember that <code>path.join("")</code> makes a new string, so the usual
  "push a copy" bug cannot happen here, but pushing the array itself would repeat
  it.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll build the string left to
  right and carry the number of opens and closes. I can open while I have opens
  left, and I can close only while closes are fewer than opens, so every string
  I finish is already valid and the tree has no dead ends. The count is the
  Catalan number, and the work is that many strings times n."
</div>

<h3>Per-position or per-element? A decision table</h3>
<p>
  Every problem in this chapter has the same template; what changes is <b>what a
  level decides</b> and what the loop ranges over. Settling those two things
  before writing code is the real work. Almost every bug in this chapter is one of
  them answered wrongly.
</p>
<table>
  <tr><th>Problem</th><th>A level decides</th><th>Loop ranges over</th><th>Next call</th><th>Record a result</th></tr>
  <tr><td>Subsets</td><td>the next element to include</td><td><code>i</code> from <code>start</code></td><td><code>i + 1</code></td><td>at every node</td></tr>
  <tr><td>Combinations (k of n)</td><td>the next number</td><td><code>i</code> from <code>start</code>, with a size prune</td><td><code>i + 1</code></td><td>when the size is k</td></tr>
  <tr><td>Combination Sum</td><td>the next candidate, reuse allowed</td><td><code>i</code> from <code>start</code></td><td><code>i</code></td><td>when the remainder is 0</td></tr>
  <tr><td>Permutations</td><td>which unused element goes in this position</td><td>all <code>i</code>, skip used</td><td>no start index</td><td>when the path is full</td></tr>
  <tr><td>Subsets II, Combination Sum II</td><td>as above, duplicates in the input</td><td>sorted, skip equal at same level</td><td><code>i + 1</code></td><td>as above</td></tr>
  <tr><td>Palindrome Partitioning, Restore IP</td><td>where the next piece ends</td><td><code>end</code> from <code>start</code></td><td><code>end + 1</code></td><td>when <code>start</code> reaches the end</td></tr>
  <tr><td>Letter Combinations</td><td>the letter for the next position</td><td>the letters of that digit</td><td>position + 1</td><td>when every position is set</td></tr>
  <tr><td>Generate Parentheses</td><td>open or close next</td><td>two fixed branches</td><td>counts updated</td><td>when the length is 2n</td></tr>
  <tr><td>N-Queens, Word Search</td><td>the column for this row, or the next step</td><td>columns, or four directions</td><td>row + 1, or next cell</td><td>when every row is placed, or the word is matched</td></tr>
</table>
<p class="sub">
  Two questions pick almost every cell of that table. <b>Is order part of the
  answer?</b> If <code>[1, 2]</code> and <code>[2, 1]</code> are different answers
  (permutations), every level looks at everything unused and there is no
  <code>start</code>. If they are the same answer (subsets, combinations), the loop
  starts at <code>start</code> so each set is built in one order only.
  <b>Can an element be reused?</b> Reuse recurses with <code>i</code>, no reuse
  with <code>i + 1</code>.
</p>
<p>
  The cost of a backtracking solution is always (number of leaves, or results) ×
  (work per result). The work per result is the copy, usually O(n), plus any test
  you run at the node, such as the palindrome check. That is why subsets are
  O(n · 2ⁿ), permutations O(n · n!), and why the output itself often sets the
  floor: if the answer has a million lists, no pruning can make the program
  faster than writing them. Pruning improves how much of the tree you visit, not
  what an answer costs.
</p>
<div class="warn">
  <span class="ttl">⚠ Three things that fail only on larger inputs</span>
  <b>Recursion depth.</b> The depth equals the number of levels, usually
  <code>n</code>, and that is small for generation problems, which are limited by
  2ⁿ long before the stack matters. <b>Copying at the wrong time.</b> Copy
  <code>path</code> when you record a result and only then, never when you pass it
  down, or you pay O(n) at every node of the tree. <b>Pruning too late.</b> A
  test at the leaf, such as "is the string valid", visits the whole tree. The same
  test one level earlier, as in Generate Parentheses and Restore IP, cuts whole
  subtrees.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"All possible," "every combination," "every way to," "generate all"</li>
  <li>A brute force would need to try every candidate and check validity after the fact — backtracking checks validity <em>during</em> construction and prunes early</li>
  <li>The answer is built incrementally (one element/choice at a time), and a partial answer can be judged "still possibly valid" or "already invalid"</li>
  <li>Grid-based "does a path exist" → Word Search shape; mark-and-restore in place instead of a separate visited set</li>
  <li>"Elements can be reused" → recurse with the same index, not the next one</li>
  <li>The input has repeated values but the answer must not repeat → sort, and skip a value equal to the previous one <em>in the same loop</em> (<code>i &gt; start</code>)</li>
  <li>A string must be split into valid pieces → cut-point backtracking: the state is <code>start</code>, the loop ranges over where the next piece ends, and the piece is tested before recursing</li>
  <li>A rule that can be judged on a prefix (counts, a numeric range, no leading zero) → put it in the loop condition so the branch is never entered, not in a check at the leaf</li>
  <li>If it instead asks for the <em>best</em> single answer rather than <em>all</em> answers, check whether greedy or DP applies first — those are usually faster than exploring the whole tree</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write the choose/explore/un-choose template from memory, and say why results.push needs a copy of path, not path itself.</li>
    <li>Write subsets, permutations and combinations, and explain what changes between them (when you push into results, and how the loop's start index moves).</li>
    <li>Explain the one-character difference between combine() and combinationSum() (i vs i + 1), and what it means about reusing a choice.</li>
    <li>Trace N-Queens' pruning on a 4×4 board and say why checking columns and diagonals in O(1) matters.</li>
    <li>In Word Search, explain why forgetting to restore a visited cell produces silently wrong answers rather than a crash.</li>
    <li>Explain why duplicates are skipped with <code>i &gt; start</code> after sorting, and show what <code>i &gt; 0</code> would drop on <code>[1, 2, 2]</code>.</li>
    <li>Write Permutations II both ways (the <code>!used[i - 1]</code> rule and a count map) and say what each one does to twins.</li>
    <li>Write the cut-point template for Palindrome Partitioning, and say what the leading-zero rule changes in Restore IP Addresses.</li>
    <li>Generate Parentheses with two counters, and say why its tree has no dead ends and what the result count is for n = 3.</li>
    <li>For a new problem, say what a level decides, what the loop ranges over, and whether order or reuse matters, before you write any code.</li>
  </ul>
</div>`,
};
