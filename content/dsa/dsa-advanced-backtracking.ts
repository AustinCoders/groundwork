import type { Chapter } from "../types";

export const dsaAdvancedBacktracking: Chapter = {
  id: "dsa-advanced-backtracking",
  num: "A10",
  title: "Advanced backtracking",
  short: "Advanced backtracking",
  levels: ["advanced"],
  practice: ["ex-n-queens-count"],
  ready: true,
  subtitle: 'Same three lines as before — the advanced part is saying "no" earlier and storing state in bits.',
  body: `<h3>What actually separates advanced backtracking from basic</h3>
<p>
  The core algorithm does not change. You still choose, explore, un-choose.
  What changes at this level is <b>how cheap a decision is</b> and <b>how
  early you can reject one</b>. Every advanced backtracking problem is the
  same template plus one or both of these upgrades: a <b>smarter state
  representation</b> (integers and bitmasks instead of sets and arrays) and
  <b>aggressive pruning</b> (a bound, a constraint propagation step, or a
  shared prefix structure like a Trie that says "no word in the entire
  dictionary continues this way").
</p>
<p>
  Both upgrades attack the same number: <em>nodes visited</em>. Constant-factor
  work per node matters, but cutting a subtree removes 2^k or k! leaves at
  once. Pruning wins by orders of magnitude; state representation then makes
  each surviving node 5-10× cheaper.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A decision tree where one branch is cut by a bound check before recursing, eliminating an entire exponential subtree in a single test">
    <g class="rough">
      <path class="lng" d="M320,35 L170,105" />
      <path class="lnr" d="M320,35 L470,105" />
      <path class="lng" d="M170,105 L100,175" />
      <path class="lng" d="M170,105 L240,175" />
      <path class="ln dash" d="M100,175 L70,220" />
      <path class="ln dash" d="M100,175 L130,220" />
      <path class="ln dash" d="M240,175 L210,220" />
      <path class="ln dash" d="M240,175 L270,220" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="35" r="20" />
      <circle class="boxg" cx="170" cy="105" r="18" />
      <circle class="boxr" cx="470" cy="105" r="18" />
      <circle class="box" cx="100" cy="175" r="15" />
      <circle class="box" cx="240" cy="175" r="15" />
    </g>
    <text class="sm" x="320" y="40" text-anchor="middle">root</text>
    <text class="sm gr" x="215" y="62">feasible</text>
    <text class="sm rd" x="430" y="62">bound fails</text>
    <text class="lbl rd" x="500" y="150" text-anchor="middle" style="font-size:14px">✗ pruned</text>
    <text class="sm rd" x="500" y="172" text-anchor="middle">one O(1) test removes</text>
    <text class="sm rd" x="500" y="190" text-anchor="middle">every leaf below it</text>
    <text class="sm" x="150" y="243">…the half you actually explore…</text>
  </svg>
  <figcaption>The prune is a single comparison at an internal node; what it saves is exponential in the depth remaining beneath that node.</figcaption>
</figure>

<h3>Sets are correct; integers are fast</h3>
<p>
  The intermediate N-Queens solution tracked attacks with three
  <code>Set</code>s. That is O(1) per lookup <em>amortized</em>, but each
  operation hashes a number, touches a heap-allocated bucket, and may
  allocate. In a search that visits millions of nodes, that constant factor is
  the whole runtime. When the domain is small and dense — "which of these ≤32
  columns are used," "which of the digits 1-9 are taken" — a single 32-bit
  integer replaces the set entirely.
</p>
<table>
  <tr><th>Operation</th><th>With a Set</th><th>With a bitmask</th></tr>
  <tr><td>Is <code>x</code> used?</td><td><code>s.has(x)</code></td><td><code>(mask &gt;&gt; x) &amp; 1</code></td></tr>
  <tr><td>Mark <code>x</code> used</td><td><code>s.add(x)</code></td><td><code>mask | (1 &lt;&lt; x)</code></td></tr>
  <tr><td>Un-mark <code>x</code></td><td><code>s.delete(x)</code></td><td><code>mask ^ (1 &lt;&lt; x)</code></td></tr>
  <tr><td>All still-legal options at once</td><td>loop + 3 lookups</td><td><code>full &amp; ~(a | b | c)</code> — one expression</td></tr>
  <tr><td>Iterate only the legal options</td><td>not possible directly</td><td><code>while (free) { bit = free &amp; -free; free ^= bit; }</code></td></tr>
  <tr><td>Pass state to the recursive call</td><td>mutate + undo</td><td>pass a new integer — nothing to undo</td></tr>
</table>
<p class="sub">
  The last two rows are the ones that change how the code reads. With sets you
  loop over <em>all</em> candidates and skip the illegal ones; with a mask you
  compute the legal ones as a number and loop over exactly those. And because
  integers are values, not references, the "un-choose" step disappears — the
  caller's copy was never modified in the first place.
</p>

<h3>N-Queens with bitmasks — the canonical example</h3>
<p>
  Three integers replace three sets. <code>cols</code> has bit <em>c</em> set
  if column <em>c</em> is taken. The diagonals are the clever part: instead of
  keying by <code>row - col</code> and <code>row + col</code>, store the
  diagonal attacks <em>projected onto the current row</em>, and shift them by
  one as you descend. A "\" diagonal moves one column right per row down, so
  its mask shifts left; a "/" diagonal moves one column left, so its mask
  shifts right.
</p>
<pre><code><span class="c">// all N-Queens boards — O(n!) worst case, but with a tiny constant per node</span>
function solveNQueens(n) {
  const full = (1 &lt;&lt; n) - 1; <span class="c">// n low bits set: the whole board width</span>
  const results = [], placement = [];

  function place(row, cols, diag1, diag2) {
    if (row === n) {
      results.push(placement.map(c =&gt; ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }

    let free = full &amp; ~(cols | diag1 | diag2); <span class="c">// every safe column, computed in one step</span>

    while (free) {
      const bit = free &amp; -free;  <span class="c">// isolate the lowest set bit — the next safe column</span>
      free ^= bit;               <span class="c">// consume it so the loop terminates</span>
      const col = 31 - Math.clz32(bit); <span class="c">// bit -&gt; column index, only for the output board</span>

      placement.push(col);
      place(
        row + 1,
        cols | bit,
        ((diag1 | bit) &lt;&lt; 1) &amp; full, <span class="c">// "\" attacks slide one column right next row</span>
        (diag2 | bit) &gt;&gt; 1           <span class="c">// "/" attacks slide one column left next row</span>
      );
      placement.pop(); <span class="c">// the ONLY thing left to undo — the masks were never mutated</span>
    }
  }

  place(0, 0, 0, 0);
  return results;
}</code></pre>
<p class="sub">
  If the question only asks <em>how many</em> solutions exist (N-Queens II),
  delete <code>placement</code> and <code>Math.clz32</code> entirely and return
  a counter. The recursion then touches nothing but four integers — no arrays,
  no allocation, no garbage collection pressure anywhere in the hot path.
</p>

<figure>
  <svg viewBox="0 0 640 235" class="dg" role="img" aria-label="Three bitmask rows for columns and both diagonals being OR-ed together and inverted to produce the set of free columns on the next row">
    <g class="rough">
      <rect class="boxr" x="180" y="20" width="40" height="30" />
      <rect class="box" x="220" y="20" width="40" height="30" />
      <rect class="box" x="260" y="20" width="40" height="30" />
      <rect class="boxr" x="300" y="20" width="40" height="30" />
      <rect class="box" x="340" y="20" width="40" height="30" />
      <rect class="box" x="380" y="20" width="40" height="30" />
      <rect class="boxr" x="180" y="60" width="40" height="30" />
      <rect class="box" x="220" y="60" width="40" height="30" />
      <rect class="box" x="260" y="60" width="40" height="30" />
      <rect class="box" x="300" y="60" width="40" height="30" />
      <rect class="box" x="340" y="60" width="40" height="30" />
      <rect class="box" x="380" y="60" width="40" height="30" />
      <rect class="box" x="180" y="100" width="40" height="30" />
      <rect class="box" x="220" y="100" width="40" height="30" />
      <rect class="boxr" x="260" y="100" width="40" height="30" />
      <rect class="box" x="300" y="100" width="40" height="30" />
      <rect class="box" x="340" y="100" width="40" height="30" />
      <rect class="box" x="380" y="100" width="40" height="30" />
    </g>
    <g class="rough">
      <path class="ln" d="M180,145 L420,145" />
      <rect class="boxr" x="180" y="155" width="40" height="30" />
      <rect class="boxg" x="220" y="155" width="40" height="30" />
      <rect class="boxg" x="260" y="155" width="40" height="30" />
      <rect class="boxr" x="300" y="155" width="40" height="30" />
      <rect class="boxg" x="340" y="155" width="40" height="30" />
      <rect class="boxg" x="380" y="155" width="40" height="30" />
    </g>
    <text class="sm" x="170" y="40" text-anchor="end">cols</text>
    <text class="sm" x="170" y="80" text-anchor="end">diag1 &lt;&lt; 1</text>
    <text class="sm" x="170" y="120" text-anchor="end">diag2 &gt;&gt; 1</text>
    <text class="sm" x="170" y="175" text-anchor="end">free</text>
    <text class="sm rd" x="200" y="40" text-anchor="middle">1</text>
    <text class="sm" x="240" y="40" text-anchor="middle">0</text>
    <text class="sm" x="280" y="40" text-anchor="middle">0</text>
    <text class="sm rd" x="320" y="40" text-anchor="middle">1</text>
    <text class="sm" x="360" y="40" text-anchor="middle">0</text>
    <text class="sm" x="400" y="40" text-anchor="middle">0</text>
    <text class="sm rd" x="200" y="80" text-anchor="middle">1</text>
    <text class="sm" x="240" y="80" text-anchor="middle">0</text>
    <text class="sm" x="280" y="80" text-anchor="middle">0</text>
    <text class="sm" x="320" y="80" text-anchor="middle">0</text>
    <text class="sm" x="360" y="80" text-anchor="middle">0</text>
    <text class="sm" x="400" y="80" text-anchor="middle">0</text>
    <text class="sm" x="200" y="120" text-anchor="middle">0</text>
    <text class="sm" x="240" y="120" text-anchor="middle">0</text>
    <text class="sm rd" x="280" y="120" text-anchor="middle">1</text>
    <text class="sm" x="320" y="120" text-anchor="middle">0</text>
    <text class="sm" x="360" y="120" text-anchor="middle">0</text>
    <text class="sm" x="400" y="120" text-anchor="middle">0</text>
    <text class="sm rd" x="200" y="175" text-anchor="middle">✗</text>
    <text class="sm gr" x="240" y="175" text-anchor="middle">✓</text>
    <text class="sm gr" x="280" y="175" text-anchor="middle">✓</text>
    <text class="sm rd" x="320" y="175" text-anchor="middle">✗</text>
    <text class="sm gr" x="360" y="175" text-anchor="middle">✓</text>
    <text class="sm gr" x="400" y="175" text-anchor="middle">✓</text>
    <text class="lbl" x="440" y="150" style="font-size:14px">free = full &amp; ~(a|b|c)</text>
    <text class="sm" x="440" y="172">one instruction, not a loop</text>
    <text class="sm" x="180" y="215">wait — column 2 is attacked by a diagonal, so ✗ there too; the OR is what merges all three rows</text>
  </svg>
  <figcaption>Three independent constraints collapse into one integer, and the loop then iterates only over the columns that survived.</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ JavaScript bitwise operators are 32-bit and signed</span>
  <code>&amp;</code>, <code>|</code>, <code>^</code>, <code>&lt;&lt;</code> and
  <code>~</code> coerce their operands to <b>signed 32-bit</b> integers, so
  <code>1 &lt;&lt; 31</code> is negative and <code>1 &lt;&lt; 32</code> is
  <code>1</code>, not 4294967296. Bitmask search is therefore safe up to about
  <code>n = 30</code> — which covers every N-Queens or subset-mask problem an
  interviewer will hand you, since 2³⁰ states is already far past the time
  limit. Above that you need <code>BigInt</code> (much slower) or an array of
  words. Also use <code>&gt;&gt;&gt;</code> rather than <code>&gt;&gt;</code>
  if a mask could ever have bit 31 set, because <code>&gt;&gt;</code> sign-extends.
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "The algorithm is still plain
  backtracking — the change is that the board state is three integers instead
  of three sets. <code>full &amp; ~(cols | diag1 | diag2)</code> gives me every
  legal column in one operation, and <code>free &amp; -free</code> lets me
  iterate only the legal ones instead of looping over all n and rejecting
  most. Same asymptotics, roughly an order of magnitude on the constant, and
  the un-choose step disappears because integers are passed by value."
</div>

<h3>Sudoku — bitmasks plus constraint propagation</h3>
<p>
  Sudoku is where the two upgrades combine. Each row, column and 3×3 box gets
  a 9-bit mask of digits already used, so the candidate set for any cell is one
  OR and one AND away. Then comes the real accelerator: <b>most-constrained
  variable first</b> (MRV). Instead of filling cells left-to-right, always
  recurse on the empty cell with the <em>fewest</em> candidates. A cell with
  one candidate is a forced move; a cell with zero candidates means this branch
  is already dead, and you learn that <em>before</em> spending a single guess.
</p>
<pre><code><span class="c">// solves a 9x9 board of "1".."9" and "." in place</span>
function solveSudoku(board) {
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0);
  const empties = [];
  const boxOf = (r, c) =&gt; ((r / 3) | 0) * 3 + ((c / 3) | 0);
  const ALL = 0x1FF; <span class="c">// 9 low bits set = digits 1..9</span>

  for (let r = 0; r &lt; 9; r++) {
    for (let c = 0; c &lt; 9; c++) {
      if (board[r][c] === ".") { empties.push([r, c]); continue; }
      const bit = 1 &lt;&lt; (board[r][c].charCodeAt(0) - 49); <span class="c">// "1" -&gt; bit 0</span>
      rows[r] |= bit; cols[c] |= bit; boxes[boxOf(r, c)] |= bit;
    }
  }

  const candidates = (r, c) =&gt; ALL &amp; ~(rows[r] | cols[c] | boxes[boxOf(r, c)]);
  const popcount = (x) =&gt; { let n = 0; while (x) { x &amp;= x - 1; n++; } return n; };

  function solve(k) {
    if (k === empties.length) return true;

    <span class="c">// MRV: find the most-constrained remaining cell and swap it into slot k</span>
    let pick = k, fewest = 10;
    for (let i = k; i &lt; empties.length; i++) {
      const cnt = popcount(candidates(empties[i][0], empties[i][1]));
      if (cnt &lt; fewest) { fewest = cnt; pick = i; if (cnt &lt;= 1) break; }
    }
    if (fewest === 0) return false; <span class="c">// a cell with no legal digit — dead branch, prune now</span>

    const swap = empties[k]; empties[k] = empties[pick]; empties[pick] = swap;
    const [r, c] = empties[k], b = boxOf(r, c);

    let free = candidates(r, c);
    while (free) {
      const bit = free &amp; -free;
      free ^= bit;

      rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
      board[r][c] = String.fromCharCode(49 + (31 - Math.clz32(bit)));

      if (solve(k + 1)) return true;

      rows[r] ^= bit; cols[c] ^= bit; boxes[b] ^= bit; <span class="c">// un-choose: XOR clears the bit we set</span>
      board[r][c] = ".";
    }

    empties[pick] = empties[k]; empties[k] = swap; <span class="c">// restore the ordering before failing upward</span>
    return false;
  }

  solve(0);
  return board;
}</code></pre>
<p class="sub">
  The swap-into-slot-k trick keeps the "remaining cells" set implicit — indices
  <code>k..end</code> are unfilled, <code>0..k-1</code> are done — so MRV costs
  a linear scan of the remainder instead of a heap, and reordering needs no
  extra structure. Restoring the swap on the failure path is what keeps the
  invariant true for the caller.
</p>
<div class="warn">
  <span class="ttl">⚠ Un-choosing with <code>&amp;= ~bit</code> vs <code>^= bit</code></span>
  Both clear a bit, but they differ when the bit is <em>not</em> currently set:
  <code>&amp;= ~bit</code> is idempotent, <code>^= bit</code> would set it. Here
  <code>^=</code> is correct and self-documenting precisely because we know we
  just set it. The dangerous case is a problem where the same value can be
  chosen along two different paths in the same frame — then XOR silently
  corrupts state and you get answers that are valid-looking but wrong. When in
  doubt, use <code>&amp;= ~bit</code>.
</div>
<p>
  Real constraint propagation goes one step further than MRV: after placing a
  digit, repeatedly scan for any cell that now has exactly one candidate and
  place it too, with no branching at all, until nothing more is forced. Most
  "hard" published Sudokus solve almost entirely by propagation with a handful
  of guesses. You will not usually be asked to implement it, but naming it —
  "this is MRV plus unit propagation, the same idea a SAT solver uses" — is a
  strong signal.
</p>

<h3>Word Search II — a Trie prunes the whole dictionary at once</h3>
<p>
  The naive extension of Word Search is to run the single-word grid search once
  per word: O(W · R · C · 4^L). That re-walks the same board prefixes for every
  word sharing them. The fix is to invert the loop — walk the board <em>once</em>
  and carry a Trie node (see the Tries chapter) alongside the position. The
  moment the current cell's letter has no child in the Trie, no word in the
  entire dictionary continues this way, and the branch dies immediately.
</p>
<pre><code>function findWords(board, words) {
  const root = {};
  for (const w of words) { <span class="c">// build the Trie: shared prefixes are shared work</span>
    let node = root;
    for (const ch of w) node = node[ch] || (node[ch] = {});
    node.word = w; <span class="c">// terminal marker that also carries the answer string</span>
  }

  const R = board.length, C = board[0].length, found = [];

  function dfs(r, c, parent) {
    const ch = board[r][c];
    const node = parent[ch];
    if (!node) return; <span class="c">// THE prune: no dictionary word continues with this letter</span>

    if (node.word) { found.push(node.word); delete node.word; } <span class="c">// delete = dedupe, no Set needed</span>

    board[r][c] = "#"; <span class="c">// "#" is never a Trie key, so revisits prune on the line above</span>
    if (r &gt; 0)     dfs(r - 1, c, node);
    if (r + 1 &lt; R) dfs(r + 1, c, node);
    if (c &gt; 0)     dfs(r, c - 1, node);
    if (c + 1 &lt; C) dfs(r, c + 1, node);
    board[r][c] = ch; <span class="c">// un-choose</span>

    if (Object.keys(node).length === 0) delete parent[ch]; <span class="c">// trim exhausted branches for good</span>
  }

  for (let r = 0; r &lt; R; r++) for (let c = 0; c &lt; C; c++) dfs(r, c, root);
  return found;
}</code></pre>
<p class="sub">
  Three separate prunes are stacked here and each is worth naming out loud:
  <b>(1)</b> missing child kills a branch in O(1); <b>(2)</b>
  <code>delete node.word</code> after a hit means a duplicate is never reported
  and no <code>Set</code> is needed; <b>(3)</b> deleting a Trie node once its
  subtree is empty shrinks the dictionary permanently, so later starting cells
  search a strictly smaller structure. Complexity drops from
  O(W · R · C · 4^L) to O(R · C · 4^L) with L now bounded by the longest word,
  and in practice far below that because the Trie kills most branches at depth 2-3.
</p>
<div class="warn">
  <span class="ttl">⚠ Mutating the Trie while iterating over it</span>
  The <code>delete parent[ch]</code> line runs <em>after</em> the recursion, on
  the way out, which is safe. Deleting a node while a sibling call is still
  walking it — or trimming <code>node.word</code> before you have pushed the
  string — produces missing results that are miserable to debug. If the
  interviewer objects to mutating the input board or the Trie, offer the
  <code>visited</code>-set variant and note the extra allocation cost; do not
  argue that mutation is fine.
</div>

<h3>Branch and bound — pruning with a number, not just a rule</h3>
<p>
  Everything above prunes on <em>feasibility</em>: this branch cannot produce a
  valid answer. Branch and bound prunes on <em>optimality</em>: this branch
  cannot produce a <em>better</em> answer than one already found. You need
  three ingredients — the best answer so far, an optimistic bound on what the
  current branch could still reach, and the comparison between them.
</p>
<p>
  The simplest form is the one already hiding in Combination Sum. Sort the
  candidates and <code>break</code> instead of <code>continue</code>:
</p>
<pre><code>function combinationSum(candidates, target) {
  candidates.sort((a, b) =&gt; a - b); <span class="c">// sorting is what makes the break valid</span>
  const results = [], path = [];

  function go(start, remaining) {
    if (remaining === 0) { results.push([...path]); return; }

    for (let i = start; i &lt; candidates.length; i++) {
      if (candidates[i] &gt; remaining) break; <span class="c">// sorted ⇒ every LATER candidate also overshoots</span>
      path.push(candidates[i]);
      go(i, remaining - candidates[i]);
      path.pop();
    }
  }

  go(0, target);
  return results;
}</code></pre>
<p class="sub">
  <code>continue</code> would still be correct and would still terminate — it
  just wastes the rest of the loop testing values that are provably too large.
  Turning a <code>continue</code> into a <code>break</code> by first
  establishing an ordering is the smallest, most repeatable pruning upgrade
  there is, and it applies to Combination Sum II, Palindrome Partitioning and
  most "sum to target" variants unchanged.
</p>
<p>
  The general version needs a real bound function. For 0/1 knapsack, the
  classic optimistic estimate is the <b>fractional relaxation</b>: sort items
  by value density and pretend you may take a fraction of the item that
  straddles the capacity limit. That is never worse than the true optimum, so
  if even it cannot beat the incumbent, the whole subtree is dead.
</p>
<pre><code><span class="c">// 0/1 knapsack by branch and bound — exponential worst case, near-instant in practice</span>
function knapsack(items, capacity) {
  items.sort((a, b) =&gt; b.value / b.weight - a.value / a.weight); <span class="c">// densest first</span>
  const n = items.length;
  let best = 0;

  <span class="c">// optimistic: allow a fractional last item, so bound &gt;= any real completion</span>
  function bound(i, room, taken) {
    let estimate = taken, left = room;
    for (let j = i; j &lt; n &amp;&amp; left &gt; 0; j++) {
      const take = Math.min(items[j].weight, left);
      estimate += items[j].value * (take / items[j].weight);
      left -= take;
    }
    return estimate;
  }

  function go(i, room, taken) {
    if (i === n) { best = Math.max(best, taken); return; }
    if (bound(i, room, taken) &lt;= best) return; <span class="c">// THE bound: cannot beat the incumbent</span>

    <span class="c">// take first: densest-first ordering raises \`best\` fast, which strengthens every later bound</span>
    if (items[i].weight &lt;= room) go(i + 1, room - items[i].weight, taken + items[i].value);
    go(i + 1, room, taken);
  }

  go(0, capacity, 0);
  return best;
}</code></pre>
<table>
  <tr><th>Prune type</th><th>Question it answers</th><th>Typical problems</th></tr>
  <tr><td>Feasibility</td><td>Can this partial answer still be completed at all?</td><td>N-Queens, Sudoku, Word Search</td></tr>
  <tr><td>Ordering / break</td><td>Are all remaining choices provably worse than this failing one?</td><td>Combination Sum, Palindrome Partitioning</td></tr>
  <tr><td>Bound</td><td>Can this subtree beat the best answer found so far?</td><td>Knapsack, TSP, job scheduling, Optimal Account Balancing</td></tr>
  <tr><td>Memo / dedupe</td><td>Have I already explored this exact state?</td><td>Partition to K Equal Sum Subsets, bitmask DP</td></tr>
</table>
<p class="sub">
  The fourth row is the boundary where backtracking turns into DP. If the state
  reaching a node is fully described by a small key (a bitmask of used
  elements, an index plus a remainder), memoize it and the exponential tree
  collapses to a polynomial-in-2^n table — that is exactly the bridge into the
  bitmask-DP section of the Advanced DP chapter.
</p>

<div class="sticky mint">
  <span class="ttl">The one-sentence version</span>
  Advanced backtracking is the same choose/explore/un-choose loop with two
  upgrades bolted on: make each node cheap (bits instead of sets) and make each
  <em>no</em> arrive earlier (feasibility rule, sorted break, bound, or a Trie
  that speaks for the whole dictionary at once). If you can name which of those
  four you are applying and why it is valid, you have said everything an
  interviewer is listening for.
</div>

<h3>Ordering the search is free speed</h3>
<p>
  Two branches, same subtree size, different order of exploration — the
  runtimes can differ by 100×. Bound-based pruning only works once
  <code>best</code> is good, so anything that finds a good answer sooner
  strengthens every subsequent prune. Three heuristics carry most of the value:
</p>
<ul>
  <li><b>Most-constrained variable first</b> — branch on the cell/slot with the
    fewest options (Sudoku MRV). Fewer children means failure surfaces at a
    shallower depth.</li>
  <li><b>Least-constraining value first</b> — among the options for that slot,
    try the one that eliminates the fewest options elsewhere, so a solution is
    reached before the search has to unwind.</li>
  <li><b>Greedy-first ordering</b> — sort by value density (knapsack), largest
    item first (bin packing, Partition to K Equal Sum Subsets), so the
    incumbent jumps early. Largest-first also fails fast: if the biggest item
    fits nowhere, you learn it at depth 1 instead of depth n.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Worst case this is still
  exponential and I don't think we can avoid that — the problem is NP-hard. But
  I'll sort the items densest-first so a good incumbent appears early, and add a
  fractional-relaxation bound so any subtree whose optimistic estimate can't beat
  the incumbent gets cut. That's branch and bound; it doesn't change the
  asymptotics but it's the difference between running and not running at n = 40."
</div>

<h3>Complexity at this level: say the honest thing</h3>
<table>
  <tr><th>Problem</th><th>Worst case</th><th>What pruning actually buys</th></tr>
  <tr><td>N-Queens (sets)</td><td>O(n!)</td><td>baseline; ~n = 12 before it drags</td></tr>
  <tr><td>N-Queens (bitmask)</td><td>O(n!)</td><td>same tree, ~5-10× cheaper per node; n = 15-16 comfortable</td></tr>
  <tr><td>Sudoku (plain)</td><td>O(9^m), m = empty cells</td><td>can hang on adversarial boards</td></tr>
  <tr><td>Sudoku (bitmask + MRV)</td><td>O(9^m)</td><td>milliseconds on real boards; MRV does the heavy lifting</td></tr>
  <tr><td>Word Search II (per word)</td><td>O(W · R · C · 4^L)</td><td>—</td></tr>
  <tr><td>Word Search II (Trie)</td><td>O(R · C · 4^L)</td><td>W disappears from the bound entirely</td></tr>
  <tr><td>Knapsack (brute)</td><td>O(2ⁿ)</td><td>—</td></tr>
  <tr><td>Knapsack (branch &amp; bound)</td><td>O(2ⁿ)</td><td>typically explores a tiny fraction of nodes; unchanged bound</td></tr>
</table>
<p class="sub">
  Notice that the worst-case column barely moves. Saying "pruning makes this
  O(n log n)" is wrong and interviewers catch it instantly. The correct framing
  is: the worst case is unchanged, the <em>expected</em> number of visited nodes
  collapses, and here is the specific reason a branch dies. Being precise about
  that distinction reads as senior; over-claiming reads as memorized.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Basic backtracking is already the obvious approach, but n or the branching
    factor makes the plain version time out — the question is not "which
    algorithm" but "which prune."</li>
  <li>The state is a small dense set (≤ 30 columns, 9 digits, ≤ 20 items used)
    → replace sets/arrays with a bitmask; <code>full &amp; ~(a|b|c)</code> and
    <code>x &amp; -x</code> are the two idioms to reach for.</li>
  <li>Many candidate strings/words are searched against one structure → build a
    Trie and invert the loops: walk the structure once carrying a Trie node,
    instead of once per word.</li>
  <li>The problem asks for the <em>best</em> value rather than <em>all</em>
    answers → you now have an incumbent, so branch and bound applies; find an
    optimistic bound (relaxation: drop the integrality constraint, ignore
    capacity, allow fractions) and prune when bound ≤ best.</li>
  <li>Candidates can be sorted so failure is monotone → change
    <code>continue</code> to <code>break</code>; free, and it composes with
    everything else.</li>
  <li>Distinguish from DP: if two different paths reach the <em>same</em> state
    and the future depends only on that state, memoize and it becomes bitmask
    DP. Backtracking is the right tool when states are mostly distinct or you
    must enumerate rather than count.</li>
</ul>`,
};
