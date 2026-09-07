import type { Chapter } from "../types";

export const dsaBacktracking: Chapter = {
  id: "dsa-backtracking",
  num: "I6",
  title: "Backtracking",
  short: "Backtracking",
  levels: ["intermediate"],
  practice: [
    "ex-subsets-bitmask",
    "ex-permutations",
    "ex-combination-sum",
    "ex-combination-sum-ii",
    "ex-word-search",
    "ex-palindrome-partitioning",
    "ex-letter-combinations-phone",
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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"All possible," "every combination," "every way to," "generate all"</li>
  <li>A brute force would need to try every candidate and check validity after the fact — backtracking checks validity <em>during</em> construction and prunes early</li>
  <li>The answer is built incrementally (one element/choice at a time), and a partial answer can be judged "still possibly valid" or "already invalid"</li>
  <li>Grid-based "does a path exist" → Word Search shape; mark-and-restore in place instead of a separate visited set</li>
  <li>"Elements can be reused" → recurse with the same index, not the next one</li>
  <li>If it instead asks for the <em>best</em> single answer rather than <em>all</em> answers, check whether greedy or DP applies first — those are usually faster than exploring the whole tree</li>
</ul>`,
};
