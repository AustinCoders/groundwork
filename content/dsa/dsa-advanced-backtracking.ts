import type { Chapter } from "../types";

export const dsaAdvancedBacktracking: Chapter = {
  id: "dsa-advanced-backtracking",
  num: "A10",
  title: "Advanced backtracking",
  short: "Advanced backtracking",
  levels: ["advanced"],
  prerequisites: ["dsa-backtracking"],
  practice: [
    "ex-n-queens-count",
    "ex-solve-n-queens",
    "ex-solve-sudoku",
    "ex-makesquare",
    "ex-partition-k-equal-sum-subsets",
    "ex-expression-add-operators",
    "ex-remove-invalid-parentheses",
    "ex-unique-paths-iii",
    "ex-closest-subsequence-sum",
    "ex-count-subsets-with-sum",
    "ex-can-i-win",
    "ex-word-break-ii",
  ],
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
<h4>Dry run: solveNQueens(4) — free masks along the path to its first solution</h4>
<table>
  <tr><th>Call</th><th>free = full &amp; ~(cols|diag1|diag2)</th><th>column taken on this path</th><th>placement</th></tr>
  <tr><td>place(0, cols=0000, diag1=0000, diag2=0000)</td><td>1111</td><td>1</td><td>[1]</td></tr>
  <tr><td>place(1, cols=0010, diag1=0100, diag2=0001)</td><td>1000</td><td>3</td><td>[1, 3]</td></tr>
  <tr><td>place(2, cols=1010, diag1=1000, diag2=0100)</td><td>0001</td><td>0</td><td>[1, 3, 0]</td></tr>
  <tr><td>place(3, cols=1011, diag1=0010, diag2=0010)</td><td>0100</td><td>2</td><td>[1, 3, 0, 2]</td></tr>
  <tr><td>place(4, cols=1111, diag1=1100, diag2=0011)</td><td>0000</td><td>row === n → push</td><td><b>[1, 3, 0, 2]</b> ✓</td></tr>
</table>
<p class="sub">
  The table follows the branch that reaches the first solution. At row 0,
  <code>free &amp; -free</code> of <code>1111</code> is <code>0001</code>, so
  the loop tries column 0 first; that branch runs out of legal columns by
  row 3, and only after backing up does it take column 1, the one shown. From row 1 on,
  <code>free</code> is a single bit (<code>1000</code>, <code>0001</code>,
  <code>0100</code>): each queen is a forced move, not a choice among several.
  Every one
  of these <code>free</code> values costs one AND, one OR, one NOT, and one
  shift, regardless of how many columns are actually occupied — that constant
  cost per node is exactly what three <code>Set</code>s could not offer.
</p>
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
      <rect class="boxr" x="260" y="155" width="40" height="30" />
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
    <text class="sm rd" x="280" y="175" text-anchor="middle">✗</text>
    <text class="sm rd" x="320" y="175" text-anchor="middle">✗</text>
    <text class="sm gr" x="360" y="175" text-anchor="middle">✓</text>
    <text class="sm gr" x="400" y="175" text-anchor="middle">✓</text>
    <text class="lbl" x="440" y="150" style="font-size:14px">free = full &amp; ~(a|b|c)</text>
    <text class="sm" x="440" y="172">one instruction, not a loop</text>
    <text class="sm" x="180" y="215">column 2 is blocked only by the diag2 row; the OR merges all three rows</text>
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
<pre><code>function combinationSum(input, target) {
  const candidates = [...input].sort((a, b) =&gt; a - b); <span class="c">// sorting is what makes the break valid; the copy leaves the caller's array alone</span>
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
function knapsack(input, capacity) {
  const items = [...input].sort((a, b) =&gt; b.value / b.weight - a.value / a.weight); <span class="c">// densest first</span>
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

<h3>Partition to K equal sum subsets: fill the buckets, number by number</h3>
<p>
  Given positive integers <code>nums</code> and a count <code>k</code>, can all
  of <code>nums</code> be split into <code>k</code> groups with the same sum?
  Every number is used exactly once. Matchsticks to Square is the same problem
  with <code>k = 4</code>.
</p>
<p>
  Three cheap checks come before any search, and each is a prune in disguise.
  The total must be divisible by <code>k</code>, otherwise no split exists. Each
  group must then sum to <code>target = total / k</code>. And no single number
  may exceed <code>target</code>, since it has to live in some group.
</p>
<p>
  Now choose what the recursion decides. The tempting formulation is "pick a
  subset that sums to <code>target</code>, remove it, repeat". It works, but it
  is awkward to bound. The cleaner one flips the question: process the numbers
  one at a time and decide <em>which of the k buckets</em> each goes into. The
  tree has depth n and branching factor k, so k<sup>n</sup> leaves in the worst
  case. For n = 16 and k = 4 that is over four billion, and the rest of the
  section is about why you will never see anything like that many.
</p>
<p>
  Two prunes do the work. <b>Overflow:</b> a bucket whose sum would exceed
  <code>target</code> is not a choice; since all numbers are positive, a bucket
  that overflows can never come back down. <b>Order:</b> sort descending. A
  large number has the fewest buckets it still fits in, so it is the one most
  likely to fail, and failing at depth 2 prunes far more than failing at depth
  14. When the last number is placed, no bucket exceeds <code>target</code> and
  the buckets sum to <code>k × target</code>, so every bucket equals
  <code>target</code>; no final check is needed.
</p>
<pre><code>function canPartitionKSubsets(nums, k) {
  const total = nums.reduce((a, b) =&gt; a + b, 0);
  if (total % k !== 0) return false;
  const target = total / k;
  const sorted = [...nums].sort((a, b) =&gt; b - a); <span class="c">// big numbers first: they have the fewest places to go</span>
  if (sorted[0] &gt; target) return false;
  const sums = new Array(k).fill(0); <span class="c">// sums[b] = what bucket b holds so far</span>

  function place(i) {
    if (i === sorted.length) return true; <span class="c">// no bucket exceeds target and the total is k * target, so all equal target</span>
    const tried = new Set();
    for (let b = 0; b &lt; k; b++) {
      const s = sums[b];
      if (s + sorted[i] &gt; target || tried.has(s)) continue; <span class="c">// overflow, or a twin of a bucket already tried</span>
      tried.add(s);
      sums[b] += sorted[i];
      if (place(i + 1)) return true;
      sums[b] -= sorted[i];
    }
    return false;
  }

  return place(0);
}</code></pre>
<h4>Dry run: nums = [3, 3, 2, 2, 2, 2], k = 2, so target = 7</h4>
<p class="sub">Sorted descending the numbers stay 3, 3, 2, 2, 2, 2. The state is the two bucket sums.</p>
<table>
  <tr><th>Step</th><th>Number placed</th><th>Bucket sums</th><th>What happens</th></tr>
  <tr><td>1</td><td>3</td><td>[3, 0]</td><td>first bucket tried</td></tr>
  <tr><td>2</td><td>3</td><td>[6, 0]</td><td>second 3 also goes into bucket 0 (6 &lt;= 7)</td></tr>
  <tr><td>3-5</td><td>2, 2, 2</td><td>[6, 2], [6, 4], [6, 6]</td><td>bucket 0 would reach 8, so each 2 goes to bucket 1</td></tr>
  <tr><td>6</td><td>last 2</td><td>[6, 6]</td><td>8 in either bucket: dead end. Undo the three 2s, then undo the second 3</td></tr>
  <tr><td>7</td><td>second 3</td><td>[3, 3]</td><td>the next choice for that number: bucket 1</td></tr>
  <tr><td>8-11</td><td>2, 2, 2, 2</td><td>[5, 3], [7, 3], [7, 5], [7, 7]</td><td>every number placed, both buckets at 7: true</td></tr>
</table>
<p>
  The failed branch in step 6 is the whole cost model: an early wrong choice
  (putting both 3s together) is only discovered after the numbers that could
  have exposed it have been placed. Sorting does not remove such branches, it
  makes them surface earlier.
</p>
<div class="warn">
  <span class="ttl">⚠ What the three checks and the prune assume</span>
  <b>(1)</b> The numbers are positive. With zeros or negatives a bucket can
  exceed <code>target</code> and later return to it, so the overflow prune is
  wrong and so is "no final check needed". <b>(2)</b> Without the
  <code>total % k</code> test, <code>total / k</code> is a fraction and the
  search wastes its whole tree before answering <code>false</code>. <b>(3)</b>
  The sort is on a copy; sorting <code>nums</code> in place mutates the
  caller's array. <b>(4)</b> The <code>tried</code> set deserves its own
  section below, because it is the line that turns this from "too slow" into
  "fast".
</div>

<h3>Symmetry breaking: never explore the same subtree twice</h3>
<p>
  Look again at the inner loop of the partition search. At the very start every
  bucket is empty, so the first number has k placements that are all the same
  in every way that matters: bucket 2 and bucket 3 are just names. Whatever
  completion works with the number in bucket 0 works equally with it in bucket
  1, by swapping what the two buckets are called. The search tries all k and
  discovers k − 1 copies of one answer, and this repeats at every depth.
</p>
<p>
  The fix needs a precise statement of when two choices are interchangeable.
  Here the rest of the search depends only on the <em>multiset of bucket
  sums</em>, because every remaining number can go into any bucket that has
  room. So two buckets with the <b>same current sum</b> are interchangeable:
  if placing the number in the first leads to no solution, placing it in the
  second cannot lead to one either. The <code>tried</code> set records the
  sums already attempted in this call, and a bucket whose sum is in the set is
  skipped. That is duplicate-bucket skipping, and it is all that "symmetry
  breaking" means in practice: <b>cut the choices that lead to subtrees you
  have already proven equivalent</b>.
</p>
<p>
  Here is the effect, counted by instrumenting the function to tally calls. The
  input is <code>[1, 3, 6, 3, 9, 3, 8, 7, 3, 3, 3, 7, 6, 6]</code> with
  <code>k = 4</code>. The total is 68, so the target is 17, and the answer is
  <code>false</code>, which forces the search to exhaust its tree.
</p>
<table>
  <tr><th>Variant</th><th>Calls to <code>place</code></th><th>Against the plain version</th></tr>
  <tr><td>Overflow check only, input order</td><td>2,589,329</td><td>1×</td></tr>
  <tr><td>Sorted descending</td><td>153,741</td><td>about 17× fewer</td></tr>
  <tr><td>Skip equal-sum buckets, input order</td><td>59,591</td><td>about 43× fewer</td></tr>
  <tr><td>Sorted descending and skip equal-sum buckets</td><td>3,700</td><td>about 700× fewer</td></tr>
</table>
<p class="sub">
  The two ideas multiply because they remove different waste. Sorting makes a
  doomed branch fail early; skipping twins stops that branch being explored
  once per equivalent labelling. The worst case is still exponential, so the
  honest claim is that the <em>number of nodes visited</em> dropped by
  roughly three orders of magnitude on this input, not that the bound
  improved. Other inputs show smaller or larger gains.
</p>
<div class="warn">
  <span class="ttl">⚠ Symmetry that is not there</span>
  Skipping twins is valid only when the choices really are interchangeable for
  everything that happens later. It is <em>wrong</em> if the buckets have
  different capacities (bin packing with differently sized bins), if they carry
  labels the answer depends on (assign tasks to named workers and report who
  got what), or if you skip on a property that is not the whole state (comparing
  only the bucket's last item, not its sum). Before adding the line, say which
  quantity determines the future, and check that equal values of it mean equal
  futures.
</div>
<p>
  The same move appears wherever identical things are chosen from. In
  Combination Sum II and Subsets II the guard
  <code>if (i &gt; start &amp;&amp; items[i] === items[i - 1]) continue;</code>
  after sorting is symmetry breaking between equal <em>numbers</em>: picking
  either copy of a 2 leads to the same set of results. In N-Queens the board
  has a mirror image, so you may count only the boards whose first-row queen is
  in the left half and double that (for n = 8 the left half has 46 boards and
  the total is 92; for odd n, add the boards with the queen in the middle
  column once). The pattern is always: find a relabelling
  of the search that maps solutions to solutions, and explore one
  representative of each class.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Two buckets with the same
  current sum are interchangeable, because everything that follows depends only
  on the multiset of sums. So at each number I try each <em>distinct</em> sum
  once and skip any bucket whose sum I have already tried. I'll sort descending
  as well, so the numbers with the fewest legal buckets fail first. It's still
  exponential in the worst case; it just visits far fewer nodes."
</div>

<h3>Expression add operators: carry the last term so multiplication can undo it</h3>
<p>
  Given a string of digits <code>num</code> and an integer <code>target</code>,
  return every way to put <code>+</code>, <code>-</code> or <code>*</code>
  between digits, or nothing at all (so digits join into a longer number),
  such that the expression equals <code>target</code>. For
  <code>"232"</code> and target 8 the answers are <code>2*3+2</code> and
  <code>2+3*2</code>.
</p>
<p>
  The choice at each step is clear: how many digits does the next operand
  take, and which operator goes in front of it? Between two digits there are
  four options (join, <code>+</code>, <code>-</code>, <code>*</code>), so a
  string of n digits has <code>4<sup>n-1</sup></code> candidate expressions
  when none of them contains a zero; for <code>"232"</code> that is 16, and the
  search below visits exactly 16 complete expressions. There is no early
  prune on the value, because a later multiplication can push a small running
  total up or flip its sign, so this is plain exhaustive search whose entire
  craft is in making each node cheap and correct.
</p>
<p>
  The difficulty is precedence. If you keep only the running value, then at
  <code>2+3</code> the value is 5, and appending <code>*2</code> cannot be
  done by multiplying 5 by 2: the correct result is <code>2 + 3·2 = 8</code>,
  not 10. The multiplication binds to the <em>last term</em>, not the whole
  value. So carry two numbers along: the running <code>value</code> and the
  <code>lastTerm</code> that was most recently added to it (negated if it was
  subtracted). A <code>+ n</code> or <code>- n</code> adds ±n and makes ±n the
  new last term. A <code>* n</code> takes the last term back out of the value
  and puts the multiplied term in:
  <code>value - lastTerm + lastTerm * n</code>.
</p>
<pre><code>function addOperators(num, target) {
  const results = [];

  function go(pos, expr, value, lastTerm) {
    if (pos === num.length) {
      if (value === target) results.push(expr);
      return;
    }
    for (let end = pos + 1; end &lt;= num.length; end++) {
      if (end &gt; pos + 1 &amp;&amp; num[pos] === "0") break; <span class="c">// "05" is not an operand; "0" alone is</span>
      const text = num.slice(pos, end);
      const n = Number(text);
      if (pos === 0) {
        go(end, text, n, n); <span class="c">// the first operand has no operator in front of it</span>
      } else {
        go(end, expr + "+" + text, value + n, n);
        go(end, expr + "-" + text, value - n, -n);
        go(end, expr + "*" + text, value - lastTerm + lastTerm * n, lastTerm * n); <span class="c">// take the last term back out, then multiply it</span>
      }
    }
  }

  go(0, "", 0, 0);
  return results;
}</code></pre>
<h4>Dry run: the two accepted expressions for "232", target 8</h4>
<table>
  <tr><th>Expression</th><th>After the first operand</th><th>After the operator and the second operand</th><th>After the third operand</th></tr>
  <tr><td><code>2*3+2</code></td><td>value 2, last 2</td><td><code>*3</code>: value 2 - 2 + 2·3 = 6, last 6</td><td><code>+2</code>: value 8, last 2</td></tr>
  <tr><td><code>2+3*2</code></td><td>value 2, last 2</td><td><code>+3</code>: value 5, last 3</td><td><code>*2</code>: value 5 - 3 + 3·2 = 8, last 6</td></tr>
</table>
<p class="sub">
  The second row is the precedence rule in action: at <code>*2</code> the
  code removes the 3 that <code>+3</code> contributed and replaces it with 6,
  which is exactly what the expression means. Of the 16 leaves for
  <code>"232"</code>, only these two have value 8; the others include
  <code>2+3+2 = 7</code>, <code>2*3*2 = 12</code>, <code>2+32 = 34</code>
  and <code>232</code> itself.
</p>
<p>
  Cost: at most <code>4<sup>n-1</sup></code> leaves, and building each result
  string takes O(n), so the work is O(n · 4<sup>n</sup>); the recursion is n
  deep. I checked the function against a brute force that enumerates every
  operator choice for every digit string up to length 7 over random targets
  (600 cases), comparing the sorted result lists.
</p>
<div class="warn">
  <span class="ttl">⚠ The four traps in this problem</span>
  <b>(1)</b> <b>Leading zeros.</b> <code>"05"</code> is not an operand, but
  <code>"0"</code> alone is. The guard <code>end &gt; pos + 1 &amp;&amp; num[pos]
  === "0"</code> allows the single digit and stops longer ones; forgetting it
  produces <code>1*0+5</code> correctly and also <code>1*05</code> wrongly.
  <b>(2)</b> <b>Multiplication on the whole value</b> instead of the last
  term, which is wrong whenever an addition or subtraction came before it.
  <b>(3)</b> <b>Forgetting that the first operand has no operator.</b> The
  <code>pos === 0</code> branch is a separate path, not a <code>+</code> with a
  zero in front. <b>(4)</b> <b>Precision.</b> <code>Number</code> is exact only up
  to 2<sup>53</sup> - 1; digit strings of length up to about 10 are safe, but a
  long string with no operators would silently round, so confirm the length
  bound or switch to <code>BigInt</code>.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "At each position I choose how
  many digits the next operand takes and which operator precedes it. To respect
  precedence I carry the running value and the last term: plus and minus add
  ±n and set the last term, and multiply subtracts the last term and adds
  last times n. Operands with a leading zero are rejected unless they are
  exactly '0'. It's exhaustive, O(n · 4^n), because a later multiplication can
  change everything, so no value-based prune is sound."
</div>

<h3>Remove invalid parentheses: decide what to remove, then never repeat a result</h3>
<p>
  Given a string of parentheses and letters, remove the <b>fewest</b> brackets
  that make it valid, and return every distinct result. For
  <code>"()())()"</code> the answers are <code>"()()()"</code> and
  <code>"(())()"</code>; for <code>")("</code> the only answer is the empty
  string.
</p>
<p>
  Two ideas make the search small. <b>First, compute the budget before
  searching.</b> One left-to-right scan counts how many <code>(</code> are
  left unmatched and how many <code>)</code> have nothing to close. Those two
  numbers, <code>removeOpen</code> and <code>removeClose</code>, are exactly
  how many of each bracket must go, and they are the minimum, so the search
  never has to compare lengths or find "the shortest": every leaf that spends
  the budget exactly and ends balanced is an answer. For
  <code>"()())()"</code> the scan finds one stray <code>)</code>, so the budget
  is (0 opens, 1 close).
</p>
<p>
  <b>Second, remove from a whole run at a time.</b> If you decide for every
  character "keep or remove", the string <code>"))"</code> gives four branches
  for two characters, and removing the first <code>)</code> gives the same
  string as removing the second. Duplicates are the real danger here, and a
  <code>Set</code> hides them at the cost of generating all of them first.
  Instead, treat a run of equal brackets as one decision: how many of this run
  to remove, from 0 up to the smaller of the run length and the remaining
  budget. Different amounts leave different numbers of brackets, so those
  branches cannot build the same text.
</p>
<pre><code>function removeInvalidParentheses(s) {
  let removeOpen = 0;
  let removeClose = 0;
  for (const ch of s) {
    if (ch === "(") removeOpen++;
    else if (ch === ")") {
      if (removeOpen &gt; 0) removeOpen--; <span class="c">// this ")" closes an earlier "("</span>
      else removeClose++; <span class="c">// nothing to close: this ")" cannot be saved</span>
    }
  }

  const results = [];

  function go(i, balance, open, close, text) {
    if (i === s.length) {
      if (balance === 0 &amp;&amp; open === 0 &amp;&amp; close === 0) results.push(text);
      return;
    }
    const ch = s[i];
    if (ch !== "(" &amp;&amp; ch !== ")") {
      go(i + 1, balance, open, close, text + ch); <span class="c">// letters are never removed</span>
      return;
    }
    let end = i;
    while (end &lt; s.length &amp;&amp; s[end] === ch) end++; <span class="c">// the run of equal brackets s[i..end)</span>
    const run = end - i;
    const budget = ch === "(" ? open : close;
    for (let removed = 0; removed &lt;= Math.min(run, budget); removed++) {
      const kept = run - removed;
      const nextBalance = ch === "(" ? balance + kept : balance - kept;
      if (nextBalance &lt; 0) continue; <span class="c">// a prefix with more ")" than "(" can never be repaired by later characters</span>
      go(
        end,
        nextBalance,
        ch === "(" ? open - removed : open,
        ch === ")" ? close - removed : close,
        text + ch.repeat(kept)
      );
    }
  }

  go(0, 0, removeOpen, removeClose, "");
  return results;
}</code></pre>
<h4>Dry run: s = "()())()", budget (0 opens, 1 close)</h4>
<p class="sub">The runs are <code>(</code>, <code>)</code>, <code>(</code>, <code>))</code>, <code>(</code>, <code>)</code>. Each row is one call: the index, the balance of kept brackets, the remaining budget, and the text built so far.</p>
<table>
  <tr><th>Call</th><th>index</th><th>balance</th><th>open left</th><th>close left</th><th>text</th><th>Note</th></tr>
  <tr><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>""</td><td>run "(" has no budget to remove: keep it</td></tr>
  <tr><td>2</td><td>1</td><td>1</td><td>0</td><td>1</td><td>"("</td><td>run ")": keep it (removed 0)</td></tr>
  <tr><td>3</td><td>2</td><td>0</td><td>0</td><td>1</td><td>"()"</td><td>run "(": keep it</td></tr>
  <tr><td>4</td><td>3</td><td>1</td><td>0</td><td>1</td><td>"()("</td><td>run "))" of length 2: removing 0 gives balance -1, skipped; removing 1 keeps one ")"</td></tr>
  <tr><td>5</td><td>5</td><td>0</td><td>0</td><td>0</td><td>"()()"</td><td>budget spent; the rest is kept: "()" gives "()()()", a result</td></tr>
  <tr><td>6-7</td><td>6, 7</td><td>1, 0</td><td>0</td><td>0</td><td>"()()(", "()()()"</td><td>reach the end balanced: result 1</td></tr>
  <tr><td>8</td><td>2</td><td>1</td><td>0</td><td>0</td><td>"("</td><td>back at call 2 with 1 removed from the first ")" run: the budget is spent</td></tr>
  <tr><td>9-12</td><td>3, 5, 6, 7</td><td>2, 0, 1, 0</td><td>0</td><td>0</td><td>"((", "(())", "(())(", "(())()"</td><td>the remaining runs are kept: result 2</td></tr>
</table>
<p>
  The pruning condition <code>nextBalance &lt; 0</code> is sound for a
  reason worth stating: a prefix with more <code>)</code> than <code>(</code> can
  never be repaired by later characters: a later <code>(</code> cannot match a
  <code>)</code> that came before it, and a later <code>)</code> only makes the
  imbalance worse.
  Complexity: the number of leaves is at most the number of ways to choose a
  removal amount from each run within the budget, which is exponential in the
  worst case (O(2<sup>n</sup>) is a safe bound for a string of length n), and
  each result costs O(n) to build.
</p>
<p>
  I checked this exhaustively rather than by sampling: every string of length
  0 to 10 over the three characters <code>(</code>, <code>)</code> and
  <code>a</code> (88,573 strings), comparing against a brute force that tries
  every subset to keep and takes the longest valid ones. The results matched
  every time and no result was ever repeated. If you cannot argue that last
  part in the moment, wrapping the return in <code>[...new Set(results)]</code>
  costs little.
</p>
<div class="warn">
  <span class="ttl">⚠ Where it goes wrong</span>
  <b>(1)</b> Removing letters. Only brackets are candidates; letters are
  always kept. <b>(2)</b> Counting <em>every</em> bracket as removable, which
  makes the budget too large and returns invalid or non-minimal strings.
  Count only the <em>unmatched</em> ones from the scan. <b>(3)</b> Checking
  validity only at the end, which explores every branch where the balance
  already went negative. <b>(4)</b> Guessing the budget instead of
  measuring it. The end test also checks that both budgets are spent; with the
  exact counts from the scan a balanced leaf always has spent them, so that
  check is a cheap guard, but a budget that is too large lets the search
  return strings that are valid yet remove too much.
</div>

<h3>Unique paths III: a Hamiltonian-path count with a visited grid</h3>
<p>
  A grid has a start square (<code>1</code>), an end square (<code>2</code>),
  empty squares (<code>0</code>) and obstacles (<code>-1</code>). Count the
  walks from start to end that step in the four directions and visit
  <b>every non-obstacle square exactly once</b>. Contrast this with the earlier
  Unique Paths problems, where you only count routes and a dynamic programme
  over the grid is enough. "Every square exactly once" is a different shape: the
  answer depends on <em>which</em> squares you have used, not just where you
  stand, so the grid-cell DP no longer applies and you search.
</p>
<p>
  The search is the familiar one. From the current square try each of the four
  neighbours that is in bounds and not yet used, mark the current square as
  used, recurse, and un-mark. The new ingredient is the <em>accounting</em>
  that makes the end test correct. Count the walkable squares up front (start,
  end and empties together) and pass down how many are still unvisited,
  including the current one. Reaching the end square counts only if exactly one
  is left: the end square itself. Arriving there earlier is a dead end, not a
  solution, because squares remain that can no longer be reached.
</p>
<pre><code>function uniquePathsIII(grid) {
  const R = grid.length;
  const C = grid[0].length;
  let startR = 0;
  let startC = 0;
  let walkable = 0; <span class="c">// start + end + every empty square</span>
  for (let r = 0; r &lt; R; r++) {
    for (let c = 0; c &lt; C; c++) {
      if (grid[r][c] === 1) {
        startR = r;
        startC = c;
      }
      if (grid[r][c] !== -1) walkable++;
    }
  }

  function walk(r, c, left) {
    if (grid[r][c] === 2) return left === 1 ? 1 : 0; <span class="c">// only the end square itself may remain</span>
    const original = grid[r][c];
    grid[r][c] = -1; <span class="c">// visited behaves exactly like an obstacle</span>
    let paths = 0;
    for (const [dr, dc] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const nr = r + dr;
      const nc = c + dc;
      if (nr &gt;= 0 &amp;&amp; nr &lt; R &amp;&amp; nc &gt;= 0 &amp;&amp; nc &lt; C &amp;&amp; grid[nr][nc] !== -1) paths += walk(nr, nc, left - 1);
    }
    grid[r][c] = original; <span class="c">// un-choose</span>
    return paths;
  }

  return walk(startR, startC, walkable);
}</code></pre>
<p class="sub">
  Writing <code>-1</code> into the visited square is the trick that removes a
  separate <code>visited</code> array: a used square must behave exactly like an
  obstacle, so make it one, and restore the original value on the way out.
  Restoring <code>original</code> rather than a hard-coded <code>0</code>
  matters for the start square, which holds <code>1</code>.
</p>
<h4>Dry run: the grid [[1,0,0,0],[0,0,0,0],[0,0,2,-1]]</h4>
<p class="sub">
  Eleven squares are walkable (twelve cells, one obstacle). The search makes
  95 calls to <code>walk</code> and finds two walks, written as (row, column):
</p>
<table>
  <tr><th>Walk</th><th>Squares in order</th></tr>
  <tr><td>1</td><td>(0,0) (1,0) (2,0) (2,1) (1,1) (0,1) (0,2) (0,3) (1,3) (1,2) (2,2)</td></tr>
  <tr><td>2</td><td>(0,0) (0,1) (0,2) (0,3) (1,3) (1,2) (1,1) (1,0) (2,0) (2,1) (2,2)</td></tr>
</table>
<p>
  Each walk has exactly 11 squares and ends on (2,2). Every other route that
  reaches (2,2) with squares unvisited returns 0 at that line, which is why the
  <code>left === 1</code> test, not merely <code>grid[r][c] === 2</code>, is
  the correct base case.
</p>
<p>
  Complexity: after the first step a walk has at most three squares to move to
  (it cannot step back onto the square it came from, which is marked), so the
  tree has at most about 4 · 3<sup>N-1</sup> nodes for N walkable squares, which
  is O(3<sup>N</sup>). The problem statement keeps the grid small (at most
  20 cells), which is the constraint hint that an exponential search is what is
  intended. Space is the recursion depth, O(N).
</p>
<p>
  The bridge to dynamic programming is the same one this chapter keeps
  returning to. The future of the walk depends only on the set of visited
  squares and the current position. If you pass that set as a bitmask instead
  of writing into the grid, there are at most 2<sup>N</sup> · N distinct
  states, and memoizing on them counts the same walks in O(2<sup>N</sup> · N)
  time, at the price of O(2<sup>N</sup> · N) memory. I used exactly that
  memoized count as the reference to check this function on 2,912 random grids
  (874 of them with at least one walk): the two always agreed, and the input
  grid was always left as it started.
</p>
<div class="warn">
  <span class="ttl">⚠ Three ways this miscounts</span>
  <b>(1)</b> Counting the walkable squares without the start or the end, so
  the "one left" test is off by one. <b>(2)</b> Accepting any arrival at the
  end square, which counts walks that skipped squares. <b>(3)</b> Not restoring
  the square on the way back, which makes the second branch see a grid with
  holes in it; the symptom is an answer that is too small and depends on the
  order you try directions in.
</div>

<h3>Meet in the middle: when 2<sup>n</sup> is too big and 2<sup>n/2</sup> is not</h3>
<p>
  Backtracking over subsets costs 2<sup>n</sup>. For n = 20 that is a million
  and everything above works. For n = 40 it is about 10<sup>12</sup>, which no
  pruning rescues in general. If n ranges up to about 40 and the question is
  about a <em>sum</em> over a subset, there is a third option between brute
  force and a DP that needs small values: <b>split the items into two halves,
  enumerate each half's subsets, and combine</b>.
</p>
<p>
  The idea, derived. Any subset of all n items is a subset of the first half
  joined with a subset of the second. So the sum of the whole subset is
  <code>a + b</code>, where <code>a</code> is one of the 2<sup>n/2</sup> sums of
  the left half and <code>b</code> one of the 2<sup>n/2</sup> sums of the right.
  The full search considers every pair (a, b), 2<sup>n</sup> of them. But for a
  fixed <code>a</code> you do not need to look at every <code>b</code>: you
  need the <code>b</code> nearest to <code>goal - a</code>, and if the right-hand
  sums are <em>sorted</em>, a binary search finds it in O(log) time. Total work:
  build two lists of 2<sup>n/2</sup> sums, sort one, and do 2<sup>n/2</sup>
  binary searches.
</p>
<p>
  The problem: choose any subset (possibly empty) of <code>nums</code> so that
  its sum is as close as possible to <code>goal</code>, and return the smallest
  possible absolute difference.
</p>
<pre><code>function subsetSums(nums) {
  const sums = [0]; <span class="c">// the empty subset</span>
  for (const x of nums) {
    const size = sums.length;
    for (let i = 0; i &lt; size; i++) sums.push(sums[i] + x); <span class="c">// every existing subset, with and without x</span>
  }
  return sums;
}

function minAbsDifference(nums, goal) {
  const mid = nums.length &gt;&gt; 1;
  const left = subsetSums(nums.slice(0, mid));
  const right = Float64Array.from(subsetSums(nums.slice(mid))).sort(); <span class="c">// typed arrays sort numerically</span>
  let best = Infinity;
  for (const a of left) {
    const want = goal - a;
    let lo = 0;
    let hi = right.length;
    while (lo &lt; hi) {
      const m = (lo + hi) &gt;&gt; 1;
      if (right[m] &lt; want) lo = m + 1;
      else hi = m;
    } <span class="c">// lo = first right sum &gt;= want</span>
    if (lo &lt; right.length) best = Math.min(best, Math.abs(a + right[lo] - goal));
    if (lo &gt; 0) best = Math.min(best, Math.abs(a + right[lo - 1] - goal));
  }
  return best;
}</code></pre>
<h4>Dry run: nums = [1, 2, 3, 4], goal = 5</h4>
<p class="sub">The halves are [1, 2] and [3, 4]. Left sums: 0, 1, 2, 3. Right sums, sorted: 0, 3, 4, 7.</p>
<table>
  <tr><th>a (left sum)</th><th>want = goal - a</th><th>first right sum &gt;= want</th><th>right sum before it</th><th>best so far</th></tr>
  <tr><td>0</td><td>5</td><td>7 (|0 + 7 - 5| = 2)</td><td>4 (|0 + 4 - 5| = 1)</td><td>1</td></tr>
  <tr><td>1</td><td>4</td><td>4 (|1 + 4 - 5| = 0)</td><td>3 (|1 + 3 - 5| = 1)</td><td>0</td></tr>
  <tr><td>2</td><td>3</td><td>3 (0)</td><td>0</td><td>0</td></tr>
  <tr><td>3</td><td>2</td><td>3 (|3 + 3 - 5| = 1)</td><td>0 (|3 + 0 - 5| = 2)</td><td>0</td></tr>
</table>
<p>
  The answer is 0 (for example 1 + 4, from a = 1 and b = 4). Note that each
  <code>a</code> checks <em>two</em> candidates, the right sum just at or above
  the target and the one just below it, because the closest value can be on
  either side.
</p>
<p>
  Complexity: building each half's sums is O(2<sup>n/2</sup>); sorting one is
  O(2<sup>n/2</sup> · n/2); the binary searches add O(2<sup>n/2</sup> · n/2). The
  total is O(2<sup>n/2</sup> · n) time and O(2<sup>n/2</sup>) space. At n = 40
  each half has 2<sup>20</sup> = 1,048,576 sums, a few tens of millions of
  basic steps in all, against about 10<sup>12</sup> for brute force; on 40
  random values up to 10<sup>7</sup> in magnitude it finished in well under a
  second here. The price is memory: both lists must be held at once.
</p>
<p>
  The counting variant needs no sorting. To count the subsets whose sum is
  exactly <code>target</code>, put the right half's sums into a
  <code>Map</code> from sum to how many times it occurs, then for each left sum
  add <code>seen.get(target - a)</code>.
</p>
<pre><code>function countSubsetsWithSum(nums, target) {
  const mid = nums.length &gt;&gt; 1;
  const left = subsetSums(nums.slice(0, mid));
  const seen = new Map();
  for (const b of subsetSums(nums.slice(mid))) seen.set(b, (seen.get(b) || 0) + 1);
  let count = 0;
  for (const a of left) count += seen.get(target - a) || 0;
  return count;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Pitfalls specific to this technique</span>
  <b>(1)</b> <code>Array.prototype.sort()</code> without a comparator sorts
  numbers as strings, so <code>[9, 10, 1].sort()</code> gives
  <code>[1, 10, 9]</code>; the code uses a
  <code>Float64Array</code>, whose <code>sort()</code> is numeric.
  <b>(2)</b> Checking only the right sum at or above the target and not the
  one below it. <b>(3)</b> Splitting unevenly, which makes one half much larger
  than 2<sup>n/2</sup> and loses the point. <b>(4)</b> Using it when it does not
  apply: if the values are small, a subset-sum DP over the sums is far cheaper,
  and if n is large <em>and</em> the values are large, the problem is hard in
  general and the interviewer is not asking for this.
</div>
<p>
  I checked both functions against brute force on 1,500 random arrays of up to
  14 numbers with negatives allowed, comparing the closest difference and the
  subset count with direct enumeration of all 2<sup>n</sup> subsets.
</p>

<h3>Memoized backtracking: when the state is small, stop re-exploring it</h3>
<p>
  The table of prune types above ends with a row that this chapter has only
  gestured at: <em>memo / dedupe: have I already explored this exact state?</em>
  Backtracking enumerates paths. If two different paths arrive at a state from
  which the future is identical, the second arrival repeats the first one's
  entire subtree. Remember the answer for a state the first time you finish it,
  and the exponential tree collapses to as many distinct states as there are.
  That is dynamic programming reached from the search side, and the test for
  whether it is allowed is one question: <b>does this key contain everything
  the future depends on, and nothing it does not?</b>
</p>
<h4>Can I Win: the state is the set of numbers used</h4>
<p>
  Two players take turns choosing an unused integer from 1 to
  <code>maxChoosable</code> and adding it to a running total. The player who
  makes the total reach <code>desiredTotal</code> or more wins. Can the first
  player force a win? Plain backtracking tries every number for each player in
  turn. But look at what a position is: which numbers are gone. The running
  total is not an extra fact, because it is <em>determined</em> by the used
  set (<code>remaining = desiredTotal - sum of used</code>), and whose turn it
  is is determined by how many are used. So a bitmask of used numbers is a
  complete key, and there are at most 2<sup>maxChoosable</sup> of them.
</p>
<pre><code>function canIWin(maxChoosable, desiredTotal) {
  if (desiredTotal &lt;= 0) return true; <span class="c">// the target is already met before anyone moves</span>
  if ((maxChoosable * (maxChoosable + 1)) / 2 &lt; desiredTotal) return false; <span class="c">// even taking every number cannot reach it</span>
  const memo = new Map(); <span class="c">// used-numbers mask -&gt; can the player about to move force a win?</span>

  function wins(used, remaining) {
    if (memo.has(used)) return memo.get(used);
    let result = false;
    for (let n = 1; n &lt;= maxChoosable; n++) {
      const bit = 1 &lt;&lt; (n - 1);
      if (used &amp; bit) continue;
      if (n &gt;= remaining || !wins(used | bit, remaining - n)) { <span class="c">// win now, or leave the opponent in a lost position</span>
        result = true;
        break;
      }
    }
    memo.set(used, result);
    return result;
  }

  return wins(0, desiredTotal);
}</code></pre>
<p class="sub">
  The recursion returns "can the player <em>about to move</em> win from here".
  A move wins immediately if <code>n &gt;= remaining</code>, or if it leaves the
  opponent in a position the opponent cannot win; that is the entire game logic.
  Note the two guards before the search: a target of 0 or less is already met,
  and if even the sum of every number cannot reach the target, nobody can win.
</p>
<table>
  <tr><th>maxChoosable, desiredTotal</th><th>Answer</th><th>Calls, plain recursion</th><th>Calls with the memo</th><th>Distinct states stored</th></tr>
  <tr><td>10, 40</td><td>false</td><td>11,453</td><td>1,147</td><td>464</td></tr>
  <tr><td>15, 80</td><td>true</td><td>6,006,119</td><td>49,416</td><td>14,149</td></tr>
  <tr><td>18, 79</td><td>true</td><td>94,555,252</td><td>340,179</td><td>79,339</td></tr>
</table>
<p class="sub">
  Counted by instrumenting both versions. The plain version is exponential in
  the number of numbers; the memoized one stores at most one result per subset
  and, because it stops as soon as a winning move is found, usually far fewer.
  Time is O(2<sup>m</sup> · m) in the worst case for m = <code>maxChoosable</code>,
  space O(2<sup>m</sup>). The bitmask limits m to about 30 in JavaScript; the
  problem states m &lt;= 20.
</p>
<h4>Word Break II: the state is the index where the next word starts</h4>
<p>
  Given a string and a dictionary, return every sentence that splits the string
  into dictionary words. The state here is one number: the index
  <code>start</code> from which the rest of the string still has to be spelled.
  The set of sentences for <code>s.slice(start)</code> does not depend on how
  you got to <code>start</code>, so cache it by <code>start</code>.
</p>
<pre><code>function wordBreak(s, wordDict) {
  const words = new Set(wordDict);
  const longest = Math.max(0, ...wordDict.map((w) =&gt; w.length));
  const memo = new Map(); <span class="c">// start index -&gt; every sentence that spells s.slice(start)</span>

  function sentences(start) {
    if (start === s.length) return [""]; <span class="c">// one way to spell nothing: the empty sentence</span>
    if (memo.has(start)) return memo.get(start);
    const out = [];
    for (let end = start + 1; end &lt;= Math.min(s.length, start + longest); end++) {
      const word = s.slice(start, end);
      if (!words.has(word)) continue;
      for (const rest of sentences(end)) out.push(rest === "" ? word : word + " " + rest);
    }
    memo.set(start, out); <span class="c">// an empty list is stored too: it records a dead end</span>
    return out;
  }

  return sentences(0);
}</code></pre>
<h4>Dry run: "catsanddog" with the words cat, cats, and, sand, dog</h4>
<table>
  <tr><th>Call</th><th>What it does</th><th>Stored</th></tr>
  <tr><td>sentences(0)</td><td>tries "cat" (ends at 3) and recurses into 3</td><td></td></tr>
  <tr><td>sentences(3)</td><td>the only word starting at 3 is "sand" (ends at 7): recurses into 7</td><td></td></tr>
  <tr><td>sentences(7)</td><td>"dog" reaches the end of the string, the base case</td><td>7 → ["dog"]</td></tr>
  <tr><td>back in 3</td><td>one sentence found for the suffix "sanddog"</td><td>3 → ["sand dog"]</td></tr>
  <tr><td>sentences(4)</td><td>back in 0, the word "cats" (ends at 4) recurses into 4; there "and" (ends at 7) recurses into 7</td><td></td></tr>
  <tr><td>sentences(7)</td><td><b>memo hit</b>: the work done for "sand" is reused for "and"</td><td>no new work</td></tr>
  <tr><td>back in 4, then 0</td><td>combine the pieces</td><td>4 → ["and dog"], 0 → ["cat sand dog", "cats and dog"]</td></tr>
</table>
<p>
  The memo hit is the point: two different prefixes ("cat sand" and "cats
  and") both end at index 7, and the suffix "dog" is spelled once. On
  <code>"catsandog"</code>, which cannot be split, the same table ends with
  <code>0 → []</code>, and the empty lists stored along the way are dead ends
  that later calls skip instantly.
</p>
<div class="warn">
  <span class="ttl">⚠ What memoization does and does not fix</span>
  <b>(1)</b> <b>The output can be exponential and the memo cannot help.</b>
  For <code>"a"</code> repeated 20 times with the words
  <code>a, aa, aaa, aaaa</code> there are 283,953 sentences; no algorithm
  returns them in less time than it takes to write them down. The memo removes
  repeated <em>searching</em>, not the size of the answer, so state the cost as
  proportional to the output. <b>(2)</b> <b>A key that is too small</b> gives
  wrong answers silently: keying Can I Win on the remaining total alone would
  conflate different used sets. <b>(3)</b> <b>A key that is too big</b> never
  hits: keying it on the path so far is just the original tree with a hash map
  attached. <b>(4)</b> <b>Shared results.</b> The cached arrays are returned to
  several callers, so none of them may mutate what they receive.
</div>
<h4>The partition problem again, with a memo instead of symmetry skipping</h4>
<p>
  The bucket search earlier carries a state of (index, multiset of bucket
  sums), which is awkward to use as a key. A cleaner state exists. Fill the buckets <em>one at a time</em>:
  the set of numbers already used determines the sum so far, and a bucket is
  finished whenever that sum reaches a multiple of <code>target</code>. So the
  used-set bitmask, plus the current bucket's partial sum
  (<code>sum % target</code>, itself determined by the mask), is a complete
  state, and each mask need be explored at most once.
</p>
<pre><code>function canPartitionKSubsetsMemo(nums, k) {
  const total = nums.reduce((a, b) =&gt; a + b, 0);
  if (total % k !== 0) return false;
  const target = total / k;
  if (nums.some((x) =&gt; x &gt; target)) return false;
  const n = nums.length;
  const full = (1 &lt;&lt; n) - 1;
  const known = new Uint8Array(1 &lt;&lt; n); <span class="c">// 0 = not computed, 1 = can finish, 2 = cannot</span>

  function finish(used, filled) {
    if (used === full) return true;
    if (known[used]) return known[used] === 1;
    for (let i = 0; i &lt; n; i++) {
      if (used &amp; (1 &lt;&lt; i) || filled + nums[i] &gt; target) continue;
      if (finish(used | (1 &lt;&lt; i), (filled + nums[i]) % target)) { <span class="c">// reaching target starts a fresh bucket at 0</span>
        known[used] = 1;
        return true;
      }
    }
    known[used] = 2;
    return false;
  }

  return finish(0, 0);
}</code></pre>
<p>
  This version is O(2<sup>n</sup> · n) time and O(2<sup>n</sup>) space, so it
  suits n up to roughly 16 to 20 where the bucket search with symmetry skipping
  may or may not finish. Which is faster depends on the input: the twin skip helps most when
  numbers or sums repeat, while the mask memo's cost depends on n and not on
  the values.
  I compared both against a plain k<sup>n</sup> enumeration on 4,000 random
  small inputs (1,657 of which could be split), including that neither
  modifies <code>nums</code>.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "This is backtracking, but many
  paths reach the same position. The position here is just which numbers are
  used, since the running total and whose turn it is follow from that. So I key
  a memo on the bitmask and the tree collapses to at most 2^m states. The rule
  I check before memoizing is that the key contains everything the future
  depends on and nothing else."
</div>

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
  <tr><td>Partition to K subsets (bucket search)</td><td>O(k<sup>n</sup>)</td><td>sorting and skipping equal-sum buckets cut one 14-number input from 2.6 million calls to 3,700</td></tr>
  <tr><td>Expression add operators</td><td>O(n · 4<sup>n</sup>)</td><td>nothing value-based is sound; leading zeros are the only prune</td></tr>
  <tr><td>Subset sums, meet in the middle</td><td>O(2<sup>n/2</sup> · n)</td><td>n = 40 becomes about a million sums per half instead of 10<sup>12</sup> subsets</td></tr>
  <tr><td>Can I Win (memoized on the used mask)</td><td>O(2<sup>m</sup> · m)</td><td>94.6 million calls become 340 thousand for m = 18</td></tr>
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
  <li>The same kind of container or item appears many times (k equal buckets, duplicate numbers) → symmetry breaking: say which quantity decides the future, and try each distinct value of it once.</li>
  <li>"All ways to insert operators or brackets" with a count of what to remove → carry the extra state the grammar needs (the running value and the last term, the bracket balance), compute any budget with one scan first, and decide whole runs at a time to avoid duplicate results.</li>
  <li>"Visit every cell exactly once" on a small grid → backtracking with a count of the squares still unvisited; with at most about 20 cells the visited set can also be a bitmask, which makes it memoizable.</li>
  <li>Subset sums with n around 30 to 40 and large values → meet in the middle: enumerate each half, sort one, and look up the partner for every sum of the other.</li>
  <li>Different paths reach the same position and the answer depends only on that position → memoize on a small key, after checking that the key holds everything the future depends on.</li>
  <li>Distinguish from DP: if two different paths reach the <em>same</em> state
    and the future depends only on that state, memoize and it becomes bitmask
    DP. Backtracking is the right tool when states are mostly distinct or you
    must enumerate rather than count.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Rewrite N-Queens using three integer bitmasks instead of three sets, and explain why passing masks by value removes the un-choose step from all but the placement array.</li>
    <li>Explain why <code>free &amp; -free</code> followed by <code>free ^= bit</code> visits only the legal columns, without ever building a list of them.</li>
    <li>Explain Sudoku's MRV heuristic and why branching on the most-constrained cell first makes failure surface at a shallower depth, not just cheaper per node.</li>
    <li>Give one example each of a feasibility prune and a bound-based prune from this chapter, and explain what question each one answers.</li>
    <li>Given a new backtracking problem that times out, decide whether the fix is a bitmask, a Trie, a sort-then-<code>break</code>, or a bound function — and justify the choice from the shape of the state space.</li>
    <li>Write the bucket search for Partition to K Equal Sum Subsets, explain why sorting descending helps, and say exactly what makes two buckets interchangeable.</li>
    <li>Explain why Expression Add Operators carries a last term, and work <code>2+3*2</code> by hand to show the value it produces.</li>
    <li>Explain how the budget for Remove Invalid Parentheses is computed in one scan, and why deciding a whole run of equal brackets at once avoids duplicate results.</li>
    <li>State why Unique Paths III needs the count of unvisited squares at the end test, not just an arrival at the end square.</li>
    <li>Describe meet in the middle in three sentences, give its time and space for n items, and say when a subset-sum DP is the better tool.</li>
    <li>For a memoized search, state the key, argue that it holds everything the future depends on, and say why the memo cannot shrink an exponential answer.</li>
  </ul>
</div>`,
};
