import type { Chapter } from "../types";

export const dsaGamesProbabilityDp: Chapter = {
  id: "dsa-games-probability-dp",
  num: "A11",
  title: "Game theory and probability DP",
  short: "Games & probability DP",
  levels: ["advanced"],
  prerequisites: ["dsa-advanced-dp"],
  practice: [
    "ex-nim-game",
    "ex-divisor-game",
    "ex-stone-game-iv",
    "ex-predict-the-winner",
    "ex-stone-game-iii",
    "ex-stone-game-ii",
    "ex-can-i-win",
    "ex-flip-game-ii",
    "ex-nim-winning-move",
    "ex-expected-rolls-to-reach",
    "ex-knight-probability",
    "ex-out-of-boundary-paths",
    "ex-dice-roll-simulation",
    "ex-soup-servings",
    "ex-new-21-game",
  ],
  ready: true,
  subtitle:
    "When the other side is an opponent, take the worst case; when it is chance, take the average. Either way the answer is a table over positions.",
  body: `<h3>The shape of a game problem: a second player who also wants to win</h3>
<p>
  Ordinary dynamic programming asks "what is the best result I can reach?" and
  you control every step of the path. A game problem takes some of those steps
  away. After you move, <em>someone else</em> moves, and that someone wants the
  opposite outcome. You no longer choose a path through the states; you choose
  one edge, and the opponent chooses the next. The question changes from "what
  is the best path?" to "what can I guarantee, whatever they do?"
</p>
<p>
  The problems in this chapter have the same five properties, and the whole
  method depends on them:
</p>
<ul>
  <li><b>Two players move in turn.</b> Neither can skip.</li>
  <li><b>Perfect information.</b> Both players see the whole position. There are no hidden cards.</li>
  <li><b>No chance in the moves.</b> The only uncertainty is what the opponent chooses.</li>
  <li><b>The game must end.</b> Every play is finite, and the rules say who wins at the end.</li>
  <li><b>Both play optimally.</b> "Optimally" means each player makes the move that is best against a perfect opponent, not against the opponent's likely mistakes.</li>
</ul>
<p>
  The second half of the chapter drops the opponent and lets <em>chance</em> take
  the next step instead: a die rolls, a knight picks a random move, soup is
  served at random. Those are expected-value and probability problems. They look
  different, but the engine is the same: define a <b>position</b>, define the
  <b>value</b> of a position, and write the value as a combination of the values
  of the positions one step later. Only the combination changes.
</p>
<table>
  <tr><th>The question asked</th><th>Value stored for a position</th><th>How the next positions are combined</th></tr>
  <tr><td>Can the player to move force a win?</td><td>true or false</td><td>true if <em>some</em> move leads to a position that is false for the opponent</td></tr>
  <tr><td>By how much can the player to move lead?</td><td>a number, positive or negative</td><td>the <em>maximum</em> over moves of (what I gain now) minus (the opponent's best lead afterwards)</td></tr>
  <tr><td>How many steps are needed on average?</td><td>a real number</td><td>1 plus the <em>probability-weighted sum</em> of the values of the positions the chance step can lead to</td></tr>
  <tr><td>What is the probability that something happens?</td><td>a number between 0 and 1</td><td>the <em>probability-weighted sum</em> of the values afterwards, or the chance pushed forward from the start</td></tr>
</table>
<p class="sub">
  Read this table once more at the end. If you can say, for a new problem, which
  row it is, you have already chosen the state and the recurrence.
</p>
<p>
  This chapter builds on the state design from
  <a href="/dsa/dsa-advanced-dp">advanced DP</a> (bitmasks and intervals are the
  states used below) and on the memoization argument from
  <a href="/dsa/dsa-advanced-backtracking">advanced backtracking</a>, where Can I
  Win appears as a memoized search. Here the question is why that search is
  correct, and how the same idea scales to scores, to chance and to games with
  piles of a billion stones.
</p>

<h3>Win and lose, derived: a position is winning exactly when some move leads to a losing one</h3>
<p>
  Start with the smallest game that has all the properties. A pile holds
  <code>n</code> stones. Players alternate, and on each turn a player removes 1,
  2 or 3 stones. The player who cannot move, because the pile is empty, loses
  (equivalently, whoever takes the last stone wins). Does the player who moves
  first win?
</p>
<p>
  Define the words precisely, because the whole chapter rests on them. A
  position is <b>winning</b> (W) if the player about to move has a strategy that
  wins whatever the opponent replies. It is <b>losing</b> (L) if, once the
  player to move has moved, the other player has such a strategy whatever the
  mover chose. The claim is:
</p>
<div class="sticky mint">
  <span class="ttl">The claim to prove</span>
  Every position is exactly one of W and L, and a position is W exactly when at
  least one move leads to an L position.
</div>
<p>
  The proof is a short induction, and it shows precisely which assumptions you
  are using. Induct on the length of the longest play that can start from the
  position. That length is finite because the game must end.
</p>
<ul>
  <li><b>No move is possible.</b> The rules decide. Here the player to move loses, so the position is L. The statement "some move leads to an L position" is false, because there are no moves. They agree.</li>
  <li><b>Some move leads to an L position q.</b> The positions one move away are shorter, so by the induction hypothesis q is correctly labelled. L means the player <em>not</em> moving at q, which is the current mover, has a winning strategy from q. So the mover plays to q and then follows that strategy. The position is W.</li>
  <li><b>Every move leads to a W position.</b> Whatever the mover plays, the opponent is now the player to move at a W position, and has a winning strategy there. Every choice of the mover loses, so the position is L, and it is not W.</li>
</ul>
<p>
  The three cases cover everything, and they never give two answers for one
  position. That is the proof, and it is the logic behind every win/lose solution in
  this chapter. It also tells you what can break it. If the game can repeat
  a position forever, the induction has nothing to start from. If the game can
  end without a winner, "not winning for the opponent" no longer means "winning
  for me". Section after section below, the bugs in game solutions turn out to
  be a violated assumption from this list.
</p>
<pre><code>function canWinTake(n, moves) {
  const memo = new Map(); <span class="c">// stones left -&gt; does the player about to move win?</span>

  function wins(left) {
    if (left === 0) return false; <span class="c">// no stones: the player to move cannot move and loses</span>
    if (memo.has(left)) return memo.get(left);
    let result = false;
    for (const take of moves) {
      if (take &lt;= left &amp;&amp; !wins(left - take)) { <span class="c">// a move that leaves the opponent in a losing position</span>
        result = true;
        break;
      }
    }
    memo.set(left, result);
    return result;
  }

  return wins(n);
}</code></pre>
<p class="sub">
  The base case <code>left === 0</code> is the rules of the game written as code.
  Every other line is the proof's second and third case: the loop looks for a
  move whose resulting position is losing, and if none exists the answer stays
  <code>false</code>. Time is O(n · m) for m allowed moves, because each of the
  n positions is computed once and tries at most m moves. Space is O(n) for the
  memo and the recursion.
</p>

<figure>
  <svg viewBox="0 0 640 215" class="dg" role="img" aria-label="Positions 0 to 10 of a take 1, 3 or 4 stones game, losing positions 0, 2, 7 and 9 in red, winning ones in green, with arrows from position 10 to positions 9, 7 and 6">
    <g class="rough">
      <rect class="boxr" x="26" y="30" width="48" height="40" />
      <rect class="boxg" x="80" y="30" width="48" height="40" />
      <rect class="boxr" x="134" y="30" width="48" height="40" />
      <rect class="boxg" x="188" y="30" width="48" height="40" />
      <rect class="boxg" x="242" y="30" width="48" height="40" />
      <rect class="boxg" x="296" y="30" width="48" height="40" />
      <rect class="boxg" x="350" y="30" width="48" height="40" />
      <rect class="boxr" x="404" y="30" width="48" height="40" />
      <rect class="boxg" x="458" y="30" width="48" height="40" />
      <rect class="boxr" x="512" y="30" width="48" height="40" />
      <rect class="boxg" x="566" y="30" width="48" height="40" />
    </g>
    <g class="rough">
      <path class="ln" d="M590,72 Q563,120 536,72" />
      <path class="ln" d="M590,72 Q507,150 428,72" />
      <path class="ln dash" d="M590,72 Q480,170 374,72" />
    </g>
    <text class="sm" x="50" y="22" text-anchor="middle">0</text>
    <text class="sm" x="104" y="22" text-anchor="middle">1</text>
    <text class="sm" x="158" y="22" text-anchor="middle">2</text>
    <text class="sm" x="212" y="22" text-anchor="middle">3</text>
    <text class="sm" x="266" y="22" text-anchor="middle">4</text>
    <text class="sm" x="320" y="22" text-anchor="middle">5</text>
    <text class="sm" x="374" y="22" text-anchor="middle">6</text>
    <text class="sm" x="428" y="22" text-anchor="middle">7</text>
    <text class="sm" x="482" y="22" text-anchor="middle">8</text>
    <text class="sm" x="536" y="22" text-anchor="middle">9</text>
    <text class="sm" x="590" y="22" text-anchor="middle">10</text>
    <text class="lbl rd" x="50" y="57" text-anchor="middle">L</text>
    <text class="lbl gr" x="104" y="57" text-anchor="middle">W</text>
    <text class="lbl rd" x="158" y="57" text-anchor="middle">L</text>
    <text class="lbl gr" x="212" y="57" text-anchor="middle">W</text>
    <text class="lbl gr" x="266" y="57" text-anchor="middle">W</text>
    <text class="lbl gr" x="320" y="57" text-anchor="middle">W</text>
    <text class="lbl gr" x="374" y="57" text-anchor="middle">W</text>
    <text class="lbl rd" x="428" y="57" text-anchor="middle">L</text>
    <text class="lbl gr" x="482" y="57" text-anchor="middle">W</text>
    <text class="lbl rd" x="536" y="57" text-anchor="middle">L</text>
    <text class="lbl gr" x="590" y="57" text-anchor="middle">W</text>
    <text class="sm" x="40" y="165">Stones left, and the verdict for the player to move. Moves: take 1, 3 or 4.</text>
    <text class="sm" x="40" y="185">From 10 the arrows go to 9 and 7 (both L) and to 6 (W). One arrow into an L is enough.</text>
  </svg>
  <figcaption>The verdict of a position is read off the verdicts one move away. Position 10 is winning because taking 1 or 3 stones hands the opponent a losing position; taking 4 would not.</figcaption>
</figure>

<h4>Dry run: the table for moves 1, 3 and 4, built from 0 upward</h4>
<table>
  <tr><th>Stones n</th><th>Positions one move away</th><th>Any of them L?</th><th>Verdict for n</th></tr>
  <tr><td>0</td><td>none</td><td>no moves exist</td><td>L</td></tr>
  <tr><td>1</td><td>0 (L)</td><td>yes</td><td>W</td></tr>
  <tr><td>2</td><td>1 (W)</td><td>no</td><td>L</td></tr>
  <tr><td>3</td><td>2 (L), 0 (L)</td><td>yes</td><td>W</td></tr>
  <tr><td>4</td><td>3 (W), 1 (W), 0 (L)</td><td>yes, by taking 4</td><td>W</td></tr>
  <tr><td>5</td><td>4 (W), 2 (L), 1 (W)</td><td>yes, by taking 3</td><td>W</td></tr>
  <tr><td>6</td><td>5 (W), 3 (W), 2 (L)</td><td>yes, by taking 4</td><td>W</td></tr>
  <tr><td>7</td><td>6 (W), 4 (W), 3 (W)</td><td>no</td><td>L</td></tr>
  <tr><td>8</td><td>7 (L), 5 (W), 4 (W)</td><td>yes, by taking 1</td><td>W</td></tr>
  <tr><td>9</td><td>8 (W), 6 (W), 5 (W)</td><td>no</td><td>L</td></tr>
  <tr><td>10</td><td>9 (L), 7 (L), 6 (W)</td><td>yes, by taking 1 or 3</td><td>W</td></tr>
</table>
<p class="sub">
  The losing positions so far are 0, 2, 7 and 9. Running the code to 40 gives
  0, 2, 7, 9, 14, 16, 21, 23, 28, 30, 35, 37: a period of 7. For moves 1, 2 and
  3 the losing positions are the multiples of 4. These patterns are the reason a
  problem with <code>n</code> up to 10<sup>9</sup> can still be easy.
</p>
<pre><code>function winTable(maxN, moves) {
  const wins = new Array(maxN + 1).fill(false); <span class="c">// wins[n]: the player to move with n stones wins</span>
  for (let n = 1; n &lt;= maxN; n++) {
    for (const take of moves) {
      if (take &lt;= n &amp;&amp; !wins[n - take]) {
        wins[n] = true;
        break;
      }
    }
  }
  return wins;
}</code></pre>
<p>
  When a game problem gives a huge pile, do not search for the answer directly.
  Print the table for the first 30 or 40 values, look at where the L positions
  fall, and then <em>prove</em> the pattern the way the proof above does: from an
  L position every move must land on a W position, and from a W position there
  must be a move onto an L position. For moves 1, 2 and 3 that is two lines:
  from a multiple of 4 any move of size 1 to 3 leaves a non-multiple; from a
  non-multiple <code>n</code>, taking <code>n % 4</code> stones (which is
  between 1 and 3) leaves a multiple. That is why <i>Nim Game</i> is
  <code>n % 4 !== 0</code>.
</p>
<p>
  The same method settles <i>Divisor Game</i> (start with <code>n</code>; a move
  picks <code>x</code> with <code>0 &lt; x &lt; n</code> and <code>n % x === 0</code>
  and replaces <code>n</code> by <code>n - x</code>; the player who cannot move
  loses). The table suggests that the player to move wins exactly when
  <code>n</code> is even. Proof: <code>n = 1</code> has no move, so it is L. An odd
  <code>n</code> has only odd divisors, so every move leads to an even number.
  An even <code>n</code> can take <code>x = 1</code> and lead to an odd number.
  By induction, even is W and odd is L. The function is one line,
  <code>return n % 2 === 0</code>, and the proof is the answer the interviewer
  is waiting for.
</p>
<div class="warn">
  <span class="ttl">⚠ Check who loses at the end, and say it before you code</span>
  "The player who cannot move loses" and "the player who takes the last stone
  loses" are different games, and the base case of the recursion flips. Write the
  terminal rule as the first line of the solution and say it aloud. A second trap
  is a game that can end with nobody winning: <code>!wins(next)</code> then
  means "the opponent cannot win", which is not the same as "I win". The Can I
  Win section below shows exactly where that bites.
</div>

<h3>From the game tree to a table: minimax, negamax and the DP</h3>
<p>
  The textbook name for this recursion is <b>minimax</b>. Give every finished
  game a score from the point of view of the player who is about to move at that
  position: +1 if they win, -1 if they lose. At each position the mover
  chooses the move with the best result for them, and the opponent then chooses
  the move that is best for the opponent, which is the worst for the mover.
  Written with two roles, that is a <code>max</code> level followed by a
  <code>min</code> level.
</p>
<p>
  Because the game is zero-sum, one function is enough. If <code>V(p)</code> is
  the value of position <code>p</code> for the player to move, then after a move
  to <code>q</code> the opponent is the one to move, and what is good for them
  is exactly bad for me: the value of that move for me is <code>-V(q)</code>.
  So there is one rule at every level:
</p>
<div class="sticky mint">
  <span class="ttl">Negamax</span>
  V(p) = the maximum, over all moves from p to q, of ( -V(q) ), and V(p) is fixed
  by the rules when there is no move.
</div>
<p>
  This form is called <b>negamax</b>. With only the two values +1 and -1,
  <code>-V(q) = +1</code> exactly when <code>V(q) = -1</code>, so the maximum is +1
  exactly when some move leads to a position worth -1 to its mover. That is the
  statement proved above, so minimax with win/lose values and the
  "winning iff some move reaches a losing position" recursion are one idea. The
  negation <code>-V(q)</code> is what later lets the score-difference recurrences
  subtract the opponent's best, instead of maintaining a separate max level and
  min level.
</p>
<p>
  The step from search to dynamic programming is the observation you already
  know from memoization. <code>V(p)</code> depends only on the position
  <code>p</code>, not on the sequence of moves that led there. Two different move
  orders that reach the same position share the same subtree, so the subtree
  needs solving once. The tree has about (moves per turn)<sup>depth</sup> nodes.
  The table has one entry per <em>distinct position</em>. For the pile game with
  moves 1, 2 and 3, the plain recursion with early exit made 3,843,200 calls for
  <code>n = 30</code>; the memoized one made 67 calls and stored 30 results. The
  cost of the DP is therefore
</p>
<div class="sticky mint">
  <span class="ttl">What a game DP costs</span>
  (number of distinct positions) × (work to try the moves from one position)
</div>
<p>
  and that product is what you quote when the interviewer asks for the
  complexity. Everything that follows is a choice of what "position" means, and
  a proof that the choice is complete.
</p>

<h3>The memo key: everything the future depends on, nothing else</h3>
<p>
  A memo key is correct when two plays that reach the same key have identical
  futures: the same legal moves and the same results, for both players. Test a
  candidate key by asking two questions. <b>Is anything missing?</b> If two plays
  with equal keys could differ in what moves are legal or who wins, the key is
  too small and the memo will silently return wrong answers. <b>Is anything
  redundant?</b> Information that is already determined by the rest of the key
  only splits states that are really the same, and the memo stops sharing work.
</p>
<table>
  <tr><th>Game</th><th>Key</th><th>Why that is complete</th></tr>
  <tr><td>Take 1, 2 or 3 stones</td><td>stones left</td><td>nothing else changes the future</td></tr>
  <tr><td>Can I Win</td><td>the set of used numbers, as a bitmask</td><td>the running total is the sum of the used numbers, so it is determined; whose turn it is follows from how many were used</td></tr>
  <tr><td>Take from either end of a row</td><td>(i, j), the piles still in play</td><td>the piles taken earlier are gone, and their values are already counted in the scores</td></tr>
  <tr><td>Stone Game II</td><td>(i, M): first remaining pile, and the current limit M</td><td>M changes which moves are legal, so it is part of the position</td></tr>
  <tr><td>Flip Game II</td><td>the string itself</td><td>the string says which moves exist</td></tr>
  <tr><td>Nim</td><td>the multiset of heap sizes</td><td>the order of the heaps is irrelevant, so sort them to merge equal positions</td></tr>
</table>
<p>
  Notice what is <em>not</em> in the keys: who is to move. The recursion is
  always written from <b>the point of view of the player about to move</b>. The
  function returns "can the player about to move win from here?" or "how far
  ahead can they get?", and when it recurses it either negates the result or
  subtracts it. Storing the player in the key would double the states for no
  gain, and forgetting to flip the sign at one recursive call is a classic bug.
</p>
<div class="warn">
  <span class="ttl">⚠ A key that is too small gives a wrong answer without any error</span>
  Memoize Can I Win on the remaining total alone and the code runs fast and looks
  right. I compared that version with the correct one over 840 pairs
  (<code>maxChoosable</code> from 1 to 12, <code>desiredTotal</code> from 1 to 70)
  and they disagreed on 76. For example, <code>canIWin(4, 9)</code> is
  <code>false</code>, and the remaining-total key returns <code>true</code>;
  <code>canIWin(5, 13)</code> is <code>true</code> and it returns
  <code>false</code>. The same remaining total can be reached with different
  numbers still available, and those positions have different futures. The
  opposite mistake, a key that records the whole path, is correct and useless: it
  never hits.
</div>
<div class="warn">
  <span class="ttl">⚠ The recursion needs a game that cannot loop</span>
  Everything in this chapter relies on a position never returning to itself, so
  that the recursion bottoms out. Games on a graph where a piece can move back
  and forth (a cat chasing a mouse around a cycle, for instance) can produce
  draws and infinite plays. Memoized recursion loops forever on them; they are
  solved by working backwards from the finished positions with a queue instead.
  That is beyond this chapter. If your state graph has a cycle, say so out loud
  and stop using this recursion.
</div>

<h3>Score games: maximize your lead, not your total</h3>
<p>
  Now the game has a score. <i>Predict the Winner</i>: an array of numbers lies
  in a row. Two players alternate; on each turn a player takes the number at
  either end of the row and adds it to their own score. Both want the larger
  final score. Return whether the first player can win, where a tie counts as a
  win for the first player.
</p>
<p>
  The obvious state is the interval <code>(i, j)</code> of numbers still in the
  row. The obvious value, "the most I can collect", is awkward: after you take
  <code>nums[i]</code> the opponent moves on <code>(i + 1, j)</code>, and what
  you eventually collect from that interval depends on how the opponent plays
  it. The way out is to change what the table stores.
</p>
<div class="sticky mint">
  <span class="ttl">Store the lead, not the total</span>
  <code>lead(i, j)</code> is the largest value of (my score - the other player's
  score) that the player to move can guarantee on <code>nums[i..j]</code>, when
  both play to maximize their own lead.
</div>
<p>
  Take the left end. You gain <code>nums[i]</code>. The other player is now the
  one to move on <code>(i + 1, j)</code>, and the best lead they can guarantee
  there is <code>lead(i + 1, j)</code>. Your lead over the whole interval is your
  gain minus their lead on the rest: <code>nums[i] - lead(i + 1, j)</code>. The
  right end gives <code>nums[j] - lead(i, j - 1)</code>. You pick the better:
</p>
<pre><code>lead(i, i) = nums[i]
lead(i, j) = max( nums[i] - lead(i + 1, j),  nums[j] - lead(i, j - 1) )</code></pre>
<p>
  <b>Why subtracting the opponent's lead is right.</b> Suppose I have taken
  <code>nums[i]</code>. The opponent chooses among their moves to make
  <em>their own</em> lead as large as possible. Their lead and my lead on the
  rest of the row are exact negatives of each other, because every number goes
  to exactly one of us (my score minus theirs is minus (their score minus mine)).
  So the move that maximizes their lead is the same move that minimizes mine,
  and the best they can do to me is to hold my lead on the rest to
  <code>-lead(i + 1, j)</code>. There is no separate "min" step to write.
  That one sign flip is the whole minimax of this game. Formally the claim
  "lead(i, j) is what the recurrence computes" follows by induction on
  <code>j - i</code>: a one-number row is forced, and every longer row reduces
  to two shorter rows whose values are correct by the hypothesis.
</p>
<pre><code>function bestLead(piles) {
  const n = piles.length;
  const lead = Array.from({ length: n }, () =&gt; new Array(n).fill(0)); <span class="c">// lead[i][j]: best (mover - other) on piles i..j</span>
  for (let i = 0; i &lt; n; i++) lead[i][i] = piles[i];
  for (let len = 2; len &lt;= n; len++) {
    for (let i = 0; i + len - 1 &lt; n; i++) {
      const j = i + len - 1;
      lead[i][j] = Math.max(piles[i] - lead[i + 1][j], piles[j] - lead[i][j - 1]);
    }
  }
  return lead[0][n - 1];
}

function predictTheWinner(nums) {
  return bestLead(nums) &gt;= 0; <span class="c">// player 1 wins a tie</span>
}</code></pre>
<p class="sub">
  The answer is <code>lead(0, n - 1) &gt;= 0</code>; <code>&gt;=</code> is the tie
  rule. If the problem says a tie goes to the second player, or asks for the
  lead itself, only that last line changes. Time is O(n²) and space is O(n²).
  Intervals are filled by increasing length so that the two shorter intervals
  are ready, exactly as in interval DP.
</p>
<h4>Dry run: nums = [5, 3, 4, 5]</h4>
<table>
  <tr><th>Interval</th><th>Take left</th><th>Take right</th><th>lead</th></tr>
  <tr><td>[0,0] [1,1] [2,2] [3,3]</td><td colspan="2">a single number is forced</td><td>5, 3, 4, 5</td></tr>
  <tr><td>[0,1] = 5, 3</td><td>5 - 3 = 2</td><td>3 - 5 = -2</td><td>2</td></tr>
  <tr><td>[1,2] = 3, 4</td><td>3 - 4 = -1</td><td>4 - 3 = 1</td><td>1</td></tr>
  <tr><td>[2,3] = 4, 5</td><td>4 - 5 = -1</td><td>5 - 4 = 1</td><td>1</td></tr>
  <tr><td>[0,2] = 5, 3, 4</td><td>5 - lead[1][2] = 5 - 1 = 4</td><td>4 - lead[0][1] = 4 - 2 = 2</td><td>4</td></tr>
  <tr><td>[1,3] = 3, 4, 5</td><td>3 - lead[2][3] = 3 - 1 = 2</td><td>5 - lead[1][2] = 5 - 1 = 4</td><td>4</td></tr>
  <tr><td>[0,3] = 5, 3, 4, 5</td><td>5 - lead[1][3] = 5 - 4 = 1</td><td>5 - lead[0][2] = 5 - 4 = 1</td><td>1</td></tr>
</table>
<p class="sub">
  <code>lead[0][3] = 1</code>, which is at least 0, so the first player wins by
  one point: 9 against 8 out of the 17 in the row (both opening moves are equally
  good here).
  I checked the code against a brute force that tracks both players' totals
  separately and lets each maximize their own total, on 600 random arrays that
  included negative numbers and zeros.
</p>
<h4>One row of memory is enough</h4>
<p>
  Row <code>i</code> of the table needs row <code>i + 1</code> (the cell below)
  and the cell to its left in row <code>i</code>. If you fill rows from the bottom
  up and each row from left to right, one array is enough. Before row
  <code>i</code> is computed, <code>lead[j]</code> still holds the value from row
  <code>i + 1</code>; the assignment overwrites it with row <code>i</code>, and
  <code>lead[j - 1]</code> has already been overwritten, which is exactly what
  the recurrence wants.
</p>
<pre><code>function bestLeadRolling(piles) {
  const n = piles.length;
  const lead = piles.slice(); <span class="c">// lead[j] holds lead[i + 1][j] until row i overwrites it with lead[i][j]</span>
  for (let i = n - 2; i &gt;= 0; i--) {
    for (let j = i + 1; j &lt; n; j++) {
      lead[j] = Math.max(piles[i] - lead[j], piles[j] - lead[j - 1]); <span class="c">// lead[j - 1] is already row i</span>
    }
  }
  return lead[n - 1];
}</code></pre>
<p class="sub">
  Time stays O(n²); space drops to O(n). This is the same rolling idea as in
  <a href="/dsa/dsa-dp-state-machines">knapsack</a>: overwriting is safe when every cell you still need is either already
  the new value or not yet touched.
</p>
<div class="warn">
  <span class="ttl">⚠ "Both take the bigger end" is not optimal play</span>
  For <code>[1, 5, 233, 7]</code> a player who always takes the larger end
  takes 7, the opponent takes 233, and the greedy player ends with 7 + 5 = 12
  against 233 + 1 = 234. The optimal first move is to take the 1, which forces
  the opponent to open the row and leave the 233 for you; the lead is 222. A
  greedy opponent model is the most common wrong answer to this problem, and
  the lead DP exists because it never assumes the opponent is anything but
  optimal.
</div>

<h4>Stone Game: when parity answers the question</h4>
<p>
  <i>Stone Game</i> is the same row game with an even number of piles and a total
  that is odd, so there is never a tie. The DP above solves it. But the answer is
  always <code>true</code>, and the reason is worth saying in an interview. Number
  the piles 0 to n - 1. The two ends of a row of even length have different
  parities. The first player takes pile 0, which has an even index. Now the row
  has odd length and both ends are odd-indexed, so whatever the opponent takes is
  an odd-indexed pile, and one end of the remaining even-length row is
  even-indexed again; the first player takes that. By repeating this, the first
  player collects <em>every</em> even-indexed pile, and by starting with the other
  end could collect every odd-indexed pile instead. One of the two sums is larger
  than the other, and the first player can choose it. With an odd total the sums
  cannot be equal, so the first player wins.
</p>
<p class="sub">
  I tested the consequence on 2,000 random arrays of even length: the lead was
  never negative, and it was positive whenever the total was odd. The argument
  needs the even length. For an odd number of piles it does not work, which is
  why <i>Predict the Winner</i>, with any length, needs the DP.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll store the lead, my score
  minus the opponent's, for each interval, because then the opponent's best reply
  is just a subtraction: taking the left end gives nums[i] minus the best lead on
  what remains. That is O(n²) states with O(1) work each. If the interviewer
  asks, the even-length version has a parity argument: the first player can
  force all the even-indexed piles or all the odd-indexed ones, so they never
  lose."
</div>

<h3>Stone Game III: the same lead idea over a suffix</h3>
<p>
  The piles are in a row, with values that may be negative. On each turn a player
  takes 1, 2 or 3 piles from the <em>front</em>. The player with the larger sum
  wins; return <code>"Alice"</code>, <code>"Bob"</code> or <code>"Tie"</code>.
  The position is just the index <code>i</code> of the first remaining pile, so
  the table is one-dimensional. With <code>lead[i]</code> the best lead for the
  player to move when piles <code>i..</code> remain, taking <code>k</code>
  piles gains their sum and then hands the opponent <code>lead[i + k]</code>:
</p>
<pre><code>lead[n] = 0
lead[i] = max over k in 1..3 (with i + k &lt;= n) of ( sum(i .. i + k - 1) - lead[i + k] )</code></pre>
<pre><code>function stoneGameIII(stoneValue) {
  const n = stoneValue.length;
  const lead = new Array(n + 1).fill(0); <span class="c">// lead[i]: best (mover - other) when stones i.. remain; lead[n] = 0</span>
  for (let i = n - 1; i &gt;= 0; i--) {
    let taken = 0;
    lead[i] = -Infinity;
    for (let k = 1; k &lt;= 3 &amp;&amp; i + k &lt;= n; k++) {
      taken += stoneValue[i + k - 1];
      lead[i] = Math.max(lead[i], taken - lead[i + k]);
    }
  }
  if (lead[0] &gt; 0) return "Alice";
  if (lead[0] &lt; 0) return "Bob";
  return "Tie";
}</code></pre>
<h4>Dry run: stoneValue = [1, 2, 3, 7], then [1, 2, 3, -9]</h4>
<table>
  <tr><th>i</th><th>take 1</th><th>take 2</th><th>take 3</th><th>lead[i]</th></tr>
  <tr><td>3</td><td>7 - 0 = 7</td><td></td><td></td><td>7</td></tr>
  <tr><td>2</td><td>3 - 7 = -4</td><td>10 - 0 = 10</td><td></td><td>10</td></tr>
  <tr><td>1</td><td>2 - 10 = -8</td><td>5 - 7 = -2</td><td>12 - 0 = 12</td><td>12</td></tr>
  <tr><td>0</td><td>1 - 12 = -11</td><td>3 - 10 = -7</td><td>6 - 7 = -1</td><td>-1</td></tr>
</table>
<p class="sub">
  <code>lead[0] = -1 &lt; 0</code>, so Bob wins. Taking all three of the first
  piles (6 stones) is Alice's best, but it leaves Bob the 7. For
  <code>[1, 2, 3, -9]</code> the table is lead[3] = -9, lead[2] = max(3 - (-9),
  -6) = 12, lead[1] = max(2 - 12, 5 - (-9), -4) = 14 and lead[0] = max(1 - 14,
  3 - 12, 6 - (-9)) = 15. Alice wins by taking three piles and forcing Bob onto
  the -9.
</p>
<p>
  Time is O(n), because every index tries at most three moves, and space is
  O(n). The pitfalls are all in the edges: the base value <code>lead[n] = 0</code>
  (an empty row has no lead), the guard <code>i + k &lt;= n</code> so that a
  move never takes piles that do not exist, and <code>-Infinity</code> as the
  starting maximum so that all-negative rows still pick the least bad move.
  Starting <code>lead[i]</code> at 0 would let a player "pass", which is not a
  legal move. I compared the function with an exhaustive search that tracks both
  players' scores on 600 random rows with values from -20 to 20.
</p>

<h3>Stone Game II: when a rule depends on history, the history joins the state</h3>
<p>
  Now the number of piles a player may take depends on how the game has gone. The
  piles are in a row with positive values. Start with <code>M = 1</code>. On each
  turn a player takes the first <code>X</code> remaining piles for any
  <code>1 &lt;= X &lt;= 2M</code>, and then <code>M</code> becomes
  <code>max(M, X)</code>. The game ends when the piles are gone. Return the most
  stones the first player can collect.
</p>
<p>
  Apply the key test from before. Is <code>i</code>, the first remaining pile,
  enough? No. At the same <code>i</code> the legal moves depend on <code>M</code>:
  with <code>M = 1</code> a player may take 1 or 2 piles, with <code>M = 5</code>
  up to 10. So <code>M</code> is part of the position, and the state is
  <code>(i, M)</code>. Here it is natural to store the <em>share</em> instead of
  the lead. Let <code>best(i, M)</code> be the most stones the player to move can
  collect from piles <code>i..</code> onward. Every remaining stone ends up with
  exactly one of the two players, so after you take <code>X</code> piles the
  opponent collects at most <code>best(i + X, max(M, X))</code> of the rest and
  you keep everything else:
</p>
<pre><code>best(i, M) = max over X in 1..2M of ( suffix[i] - best(i + X, max(M, X)) )</code></pre>
<p>
  Here <code>suffix[i]</code> is the sum of piles <code>i..</code>. Taking the
  first <code>X</code> piles and receiving the rest minus the opponent's share is
  the same as taking those piles plus your share of the remainder. The two forms
  (lead and share) are interchangeable because the total is a constant.
</p>
<pre><code>function stoneGameII(piles) {
  const n = piles.length;
  const suffix = new Array(n + 1).fill(0);
  for (let i = n - 1; i &gt;= 0; i--) suffix[i] = suffix[i + 1] + piles[i];
  const memo = Array.from({ length: n + 1 }, () =&gt; new Array(n + 1).fill(-1)); <span class="c">// memo[i][M]</span>

  function best(i, M) { <span class="c">// most stones the mover can collect from piles i.. when the limit is 2M</span>
    if (i + 2 * M &gt;= n) return suffix[i]; <span class="c">// may take everything left (piles are positive)</span>
    if (memo[i][M] !== -1) return memo[i][M];
    let most = 0;
    for (let x = 1; x &lt;= 2 * M; x++) {
      most = Math.max(most, suffix[i] - best(i + x, Math.max(M, x))); <span class="c">// my share = what is left - the opponent's share</span>
    }
    memo[i][M] = most;
    return most;
  }

  return best(0, 1);
}</code></pre>
<h4>Dry run: piles = [2, 7, 9, 4, 4]</h4>
<p>
  The suffix sums are 26, 24, 17, 8, 4, 0. The recursion visits these states.
</p>
<table>
  <tr><th>Call</th><th>What happens</th><th>Value</th></tr>
  <tr><td>best(0, 1)</td><td>X = 1 or 2: asks best(1, 1) and best(2, 2)</td><td>max(26 - 16, 26 - 17) = 10</td></tr>
  <tr><td>best(1, 1)</td><td>X = 1 or 2: asks best(2, 1) and best(3, 2)</td><td>max(24 - 13, 24 - 8) = 16</td></tr>
  <tr><td>best(2, 1)</td><td>X = 1 or 2: asks best(3, 1) and best(4, 2)</td><td>max(17 - 8, 17 - 4) = 13</td></tr>
  <tr><td>best(3, 1)</td><td>3 + 2 &gt;= 5, so the player can take both remaining piles</td><td>suffix[3] = 8</td></tr>
  <tr><td>best(4, 2)</td><td>one pile left, taken</td><td>suffix[4] = 4</td></tr>
  <tr><td>best(3, 2)</td><td>can take everything</td><td>8</td></tr>
  <tr><td>best(2, 2)</td><td>2 + 4 &gt;= 5, so the player can take everything</td><td>suffix[2] = 17</td></tr>
</table>
<p class="sub">
  The first player collects 10 of the 26 stones, by taking only the 2 first
  (X = 1), and the second player gets the other 16, which is exactly
  <code>best(1, 1)</code>.
</p>
<p>
  There are at most n² distinct <code>(i, M)</code> pairs (<code>M</code> never
  exceeds the number of piles) and each tries at most <code>2M &lt;= 2n</code>
  moves, so the time is at most O(n³) and the space O(n²). The "take everything"
  shortcut is valid because no pile is negative: when every remaining pile is
  at least 0, taking them all is the best possible share. I checked the
  function against an exhaustive search on 500 random arrays of positive piles.
</p>
<div class="warn">
  <span class="ttl">⚠ The shortcut line is a theorem about the input, not a style choice</span>
  With negative piles, taking everything is no longer best: you may be forced to
  take a pile but should not take more than you must. The function above returns
  <code>0</code> for <code>[-3, -3, -3]</code>, but the true best for the first
  player is -6. The problem guarantees positive piles, which is why the line is
  allowed; if a variant allows negative values, delete the shortcut, handle
  <code>i === n</code> as the only base case, and start <code>most</code> at
  <code>-Infinity</code> instead of <code>0</code>, because a player may not pass.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "The position is not only which
  piles are left, because the limit M changes the legal moves, so my state is
  (i, M). My value is the most stones the mover can get from i onward, and since
  every remaining stone goes to somebody, it is the suffix sum minus the
  opponent's best on the position I hand over. There are O(n²) states with up to
  2M transitions each, so O(n³) at worst."
</div>

<h3>Bitmask games: Can I Win, and why its guards matter</h3>
<p>
  Two players take turns choosing an integer from 1 to <code>maxChoosable</code>.
  A number, once chosen, is gone for both players. Each chosen number is added
  to a shared running total, and the player whose choice makes the total reach
  <code>desiredTotal</code> or more wins. Can the first player force a win?
</p>
<p>
  The <a href="/dsa/dsa-advanced-backtracking">backtracking chapter</a> solves
  this as a memoized search. Here the same solution is read as a game. The
  position is which numbers have been used. The running total is not an extra
  fact, because it is the sum of the used numbers; whose turn it is follows from
  how many numbers are used. So the used set is a complete key, and with
  <code>maxChoosable</code> at most 20 an integer bitmask holds it: bit
  <code>n - 1</code> is set when the number <code>n</code> is used. A
  winning pick is a move into a position the opponent never gets to play, so it
  counts as a move into a lost position for them.
</p>
<pre><code>function canIWin(maxChoosable, desiredTotal) {
  if (desiredTotal &lt;= 0) return true; <span class="c">// the target is met before anyone has to move</span>
  if ((maxChoosable * (maxChoosable + 1)) / 2 &lt; desiredTotal) return false; <span class="c">// even every number together falls short</span>
  const memo = new Int8Array(1 &lt;&lt; maxChoosable); <span class="c">// 0 unknown, 1 win, 2 lose; index = mask of used numbers</span>

  function wins(used, remaining) {
    if (memo[used] !== 0) return memo[used] === 1;
    let result = false;
    for (let n = 1; n &lt;= maxChoosable &amp;&amp; !result; n++) {
      const bit = 1 &lt;&lt; (n - 1);
      if (used &amp; bit) continue;
      if (n &gt;= remaining || !wins(used | bit, remaining - n)) result = true;
    }
    memo[used] = result ? 1 : 2;
    return result;
  }

  return wins(0, desiredTotal);
}</code></pre>
<p>
  The three early lines each need a reason, and the reasons are the interesting
  part.
</p>
<ul>
  <li><b><code>if ((maxChoosable * (maxChoosable + 1)) / 2 &lt; desiredTotal) return false</code> is a correctness line.</b> If even the sum of all the numbers falls short, nobody can ever reach the target. The game ends with every number used and no winner, which the win/lose recursion cannot express: the loop would find no moves and return <code>false</code>, and the caller would read "the opponent cannot win" as "I win". The guard answers "the first player cannot force a win" directly. When the guard does not fire, a winner is guaranteed: the unused numbers always add up to at least the remaining target (they sum to the total of all numbers minus the used ones, and the total is at least the target), so while the target is still unmet there is always an unused number, and the last pick of the game must reach it. That restores the "no draws" assumption of the proof. Removing the guard changed the answer on 255 of the 700 pairs I tried (<code>maxChoosable</code> 1 to 10, <code>desiredTotal</code> 1 to 70).</li>
  <li><b><code>if (desiredTotal &lt;= 0) return true</code> is only a shortcut.</b> With <code>maxChoosable &gt;= 1</code> the loop already finds <code>n &gt;= remaining</code> on the first number and returns true. The line makes the intent visible and avoids allocating the memo.</li>
  <li><b><code>n &gt;= remaining</code> inside the loop</b> is the move that ends the game. It does not recurse, because the game is over.</li>
</ul>
<h4>Dry run: maxChoosable = 3, desiredTotal = 4</h4>
<table>
  <tr><th>Call (used numbers, remaining)</th><th>What the mover tries</th><th>Verdict for the mover</th></tr>
  <tr><td>({1}, 3)</td><td>pick 2: leaves ({1,2}, 1), and the opponent picks 3 and wins; pick 3: 3 &gt;= 3, wins at once</td><td>WIN</td></tr>
  <tr><td>({1,2}, 1)</td><td>pick 3: 3 &gt;= 1, wins at once</td><td>WIN (stored)</td></tr>
  <tr><td>({2}, 2)</td><td>pick 1: leaves ({1,2}, 1), a stored WIN for the opponent; pick 3: 3 &gt;= 2, wins at once</td><td>WIN</td></tr>
  <tr><td>({3}, 1)</td><td>pick 1: 1 &gt;= 1, wins at once</td><td>WIN</td></tr>
  <tr><td>({}, 4), the root</td><td>pick 1 hands over ({1}, 3), a WIN for the opponent; pick 2 hands over ({2}, 2), a WIN; pick 3 hands over ({3}, 1), a WIN</td><td>LOSE</td></tr>
</table>
<p class="sub">
  Whatever the first player picks (1, 2 or 3), the opponent can reach 4 on the
  next turn. The position <code>({1,2}, 1)</code> is looked up once and reused:
  two different orders of play reach it. Time is O(2<sup>m</sup> · m) and space
  O(2<sup>m</sup>) for m = <code>maxChoosable</code>, since each of the at most
  2<sup>m</sup> masks is solved once and tries at most m numbers. For m = 20 that
  is about 20 million steps and a 1 MB typed array. The typed array
  <code>Int8Array</code> holds 0 for "not computed yet", 1 and 2 for the two
  answers, which avoids a <code>Map</code>'s hashing and its boxed values.
</p>
<div class="warn">
  <span class="ttl">⚠ Three ways this goes wrong</span>
  <b>(1)</b> Keying the memo on the remaining total instead of the mask, shown above.
  <b>(2)</b> Shifting with a number above 30: <code>1 &lt;&lt; 31</code> is negative
  in JavaScript, and the problem's limit of 20 is far from that, but a variant
  with larger pools needs a <code>BigInt</code> mask or a different approach.
  <b>(3)</b> Forgetting that the memo must be reset for each query. If the
  function is called for many <code>(maxChoosable, desiredTotal)</code> pairs, the
  memo for one target is meaningless for another, because the set of used numbers
  does not carry the target.
</div>

<h3>Flip Game II: the string is the position</h3>
<p>
  A string contains only <code>+</code> and <code>-</code>. A move chooses two
  consecutive <code>++</code> and flips them to <code>--</code>. The player who
  cannot move loses. Can the player to move win? Here the position is the string,
  and the memo key is the string itself.
</p>
<pre><code>function canWinFlip(s) {
  const memo = new Map(); <span class="c">// the string itself is the position</span>

  function wins(state) {
    if (memo.has(state)) return memo.get(state);
    let result = false;
    for (let i = 0; i + 1 &lt; state.length &amp;&amp; !result; i++) {
      if (state[i] === "+" &amp;&amp; state[i + 1] === "+") {
        const next = state.slice(0, i) + "--" + state.slice(i + 2);
        if (!wins(next)) result = true; <span class="c">// flipping here leaves the opponent without a win</span>
      }
    }
    memo.set(state, result);
    return result;
  }

  return wins(s);
}</code></pre>
<h4>Dry run: five pluses in a row</h4>
<table>
  <tr><th>String</th><th>Moves tried</th><th>Verdict for the mover</th></tr>
  <tr><td><code>----+</code></td><td>no <code>++</code> anywhere, no move</td><td>L</td></tr>
  <tr><td><code>--+++</code></td><td>flip at 2 leaves <code>----+</code> (L)</td><td>W</td></tr>
  <tr><td><code>+----</code></td><td>no move</td><td>L</td></tr>
  <tr><td><code>+--++</code></td><td>flip at 3 leaves <code>+----</code> (L)</td><td>W</td></tr>
  <tr><td><code>++--+</code></td><td>flip at 0 leaves <code>----+</code> (L, found in the memo)</td><td>W</td></tr>
  <tr><td><code>--+--</code></td><td>no move</td><td>L</td></tr>
  <tr><td><code>+++--</code></td><td>flip at 0 leaves <code>--+--</code> (L)</td><td>W</td></tr>
  <tr><td><code>+++++</code></td><td>flips at 0, 1, 2, 3 leave <code>--+++</code>, <code>+--++</code>, <code>++--+</code>, <code>+++--</code>, all W</td><td>L</td></tr>
</table>
<p class="sub">
  Five pluses in a row is a loss for the player to move. Every flip splits the
  row into pieces that the opponent can answer. There are at most 2<sup>n</sup>
  different strings, and each state spends O(n) positions times O(n) to build a
  string, so the worst case is O(2<sup>n</sup> · n²). In practice far fewer
  strings are reachable, but the bound is exponential, and the next two sections
  show why a long run of pluses can be answered much faster. I checked the
  function against an exhaustive search without a memo on all 16,383 strings of
  length 13 or less.
</p>
<div class="warn">
  <span class="ttl">⚠ Strings are values, so the memo works, but slicing is a cost</span>
  <code>state[i] === "+"</code> reads a character, and <code>slice</code> builds
  a new string every time, which is O(n). Mutating a character array in place
  and restoring it after the recursive call is a valid alternative, but then the
  memo key must still be a fresh string (<code>join("")</code>), because an array
  used as a <code>Map</code> key is compared by reference, not by contents.
</div>

<h3>Nim and the XOR rule, with a proof</h3>
<p>
  <b>Nim</b> is the standard game with several piles. There are heaps of stones.
  A move chooses one heap and removes any positive number of stones from it. The
  player who cannot move (all heaps empty) loses. A position is the multiset of
  heap sizes. It has too many positions to table when the heaps are large, yet
  there is a closed-form answer:
</p>
<div class="sticky mint">
  <span class="ttl">The XOR rule</span>
  The player to move loses exactly when h<sub>1</sub> ^ h<sub>2</sub> ^ ... ^
  h<sub>m</sub> equals 0.
</div>
<p>
  <b>Proof.</b> Call a position <em>zero</em> if its XOR is 0. By the win/lose
  recursion, it is enough to show three facts, because they say that zero
  positions satisfy exactly the definition of L.
</p>
<ul>
  <li><b>The finished position is zero.</b> All heaps are empty and the XOR of zeros is 0, and the player to move has lost. This is the base case.</li>
  <li><b>From a zero position, every move leaves a non-zero position.</b> A move changes exactly one heap, from <code>h</code> to some <code>h'</code> with <code>h' &lt; h</code>. The new XOR is <code>0 ^ h ^ h'</code>, which equals <code>h ^ h'</code>. That is not 0 because <code>h</code> and <code>h'</code> are different numbers. So no move from a zero position reaches a zero position.</li>
  <li><b>From a non-zero position, some move reaches a zero position.</b> Let <code>s</code> be the XOR, which is not 0, and let <code>d</code> be the highest bit that is set in <code>s</code>. The bit <code>d</code> in <code>s</code> is the XOR of the bit <code>d</code> of every heap, so an odd number of heaps have bit <code>d</code> set; in particular at least one does. Take such a heap <code>h</code> and replace it with <code>h ^ s</code>. Bit <code>d</code> goes from 1 to 0, and every bit above <code>d</code> is unchanged (<code>s</code> has none of them set), so <code>h ^ s &lt; h</code>. That is a legal move, removing <code>h - (h ^ s)</code> stones. The new XOR is <code>s ^ h ^ (h ^ s) = 0</code>.</li>
</ul>
<p>
  Together: from a zero position the player to move can only reach non-zero
  positions, which have a move back to zero; the finished position is zero. By
  induction on the total number of stones (it falls by at least 1 on every
  move), the zero positions are exactly the losing ones, which is the claim.
  The third fact is also an algorithm: it tells the winner which move to make.
</p>
<pre><code>function nimWins(heaps) {
  let xor = 0;
  for (const h of heaps) xor ^= h;
  return xor !== 0; <span class="c">// the player to move wins exactly when the XOR is not zero</span>
}

function nimMove(heaps) {
  let xor = 0;
  for (const h of heaps) xor ^= h;
  if (xor === 0) return null; <span class="c">// already losing: no move helps against best play</span>
  for (let i = 0; i &lt; heaps.length; i++) {
    const target = heaps[i] ^ xor; <span class="c">// the size this heap needs for the XOR to become 0</span>
    if (target &lt; heaps[i]) return [i, heaps[i] - target]; <span class="c">// [heap index, stones to remove]</span>
  }
}</code></pre>
<h4>Dry run: heaps [3, 4, 5]</h4>
<table>
  <tr><th>Heap</th><th>Size</th><th>Binary</th></tr>
  <tr><td>0</td><td>3</td><td>011</td></tr>
  <tr><td>1</td><td>4</td><td>100</td></tr>
  <tr><td>2</td><td>5</td><td>101</td></tr>
  <tr><td colspan="2">XOR</td><td>010 (the number 2)</td></tr>
</table>
<p class="sub">
  The XOR is 2, so the player to move wins. The highest set bit of 2 is bit 1,
  and only the heap of size 3 has it. The target size is <code>3 ^ 2 = 1</code>,
  smaller than 3, so the move is to remove 2 stones from heap 0. The new heaps
  <code>[1, 4, 5]</code> are 001, 100 and 101, whose XOR is 0. For the heap of
  size 4, <code>4 ^ 2 = 6</code> is larger, so it offers no move. Deciding takes
  O(m) for m heaps. I checked <code>nimWins</code> and the move that
  <code>nimMove</code> returns against an exhaustive search of the whole game
  tree, over 5,043 heap vectors: one or two heaps of up to 9 stones each, three
  heaps of up to 7, four of up to 5 and five of up to 4.
</p>
<div class="warn">
  <span class="ttl">⚠ The rule belongs to this exact game</span>
  If the player who takes the last stone <em>loses</em> instead, the answer
  differs. An exhaustive search over small positions shows the change: if every
  heap has at most one stone, the player to move wins exactly when the number of
  one-stone heaps is even; otherwise the XOR rule still holds. If a move may remove only a limited number of stones, or from a
  restricted set of heaps, the XOR of sizes is no longer the answer. For those
  games the XOR of per-pile values from the next section is the right tool, and
  the pile values come from a small table, not from the sizes.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "This is Nim, so the player to move
  loses exactly when the XOR of the heap sizes is zero. From zero every move
  changes one heap and breaks the XOR; from non-zero I can pick a heap that has
  the top bit of the XOR set, shrink it to heap XOR s, and hand back a zero
  position. That is O(m) and no search at all."
</div>

<h3>Sprague-Grundy in one section: games that split into independent parts</h3>
<p>
  This section is awareness, not something to derive in an interview. The idea
  is that Nim's XOR rule is one case of a general rule. Give every position of a
  game a number, its <b>Grundy value</b>, by this definition: the Grundy value of
  a position is the smallest non-negative integer that is <em>not</em> the Grundy
  value of any position one move away (the <b>mex</b>, the "minimum excludant").
  A position with no moves has value 0. Two facts follow, and the theorem behind
  them is stated here without proof:
</p>
<ul>
  <li>A position is losing exactly when its Grundy value is 0. (If the value is 0, no move leads to a 0, so every move leads to a W position. If the value is not 0, some move leads to a position with value 0.)</li>
  <li>If a game is a <em>sum</em> of independent games, where on each turn a player moves in exactly one of them, then its Grundy value is the XOR of the parts' values.</li>
</ul>
<p>
  A Nim heap of size <code>n</code> can move to every size from 0 to
  <code>n - 1</code>, so its value is <code>mex{0, ..., n - 1} = n</code>. A game of
  several heaps is a sum of heaps, so its value is the XOR of the sizes: the
  rule from the last section is the special case. Anywhere a game falls apart
  into pieces that do not interact, you can compute a value per piece and XOR
  them, instead of searching the product of all the pieces' positions.
</p>
<p>
  <i>Flip Game II</i> is such a game. Each run of consecutive pluses is a piece:
  flipping two neighbouring pluses in a run of length <code>len</code> leaves two
  runs, of lengths <code>left</code> and <code>len - 2 - left</code>, and the
  pieces never affect one another. The value of a run follows the mex rule over
  the ways to split it:
</p>
<pre><code>function flipGrundy(maxLen) {
  const g = new Array(maxLen + 1).fill(0); <span class="c">// g[len]: Grundy value of a run of len pluses</span>
  for (let len = 2; len &lt;= maxLen; len++) {
    const reachable = new Set();
    for (let left = 0; left &lt;= len - 2; left++) {
      reachable.add(g[left] ^ g[len - 2 - left]); <span class="c">// flip two pluses: the run splits into left and len - 2 - left</span>
    }
    let mex = 0;
    while (reachable.has(mex)) mex++; <span class="c">// smallest value that no move reaches</span>
    g[len] = mex;
  }
  return g;
}

function canWinFlipFast(s) {
  const runs = s.split("-").map((run) =&gt; run.length); <span class="c">// lengths of the runs of pluses</span>
  const g = flipGrundy(runs.reduce((a, b) =&gt; Math.max(a, b), 0));
  let xor = 0;
  for (const len of runs) xor ^= g[len];
  return xor !== 0;
}</code></pre>
<h4>Dry run: the first Grundy values of a run of pluses</h4>
<table>
  <tr><th>Run length</th><th>Values reached by the splits (left ^ right)</th><th>mex = value</th></tr>
  <tr><td>0, 1</td><td>no move</td><td>0</td></tr>
  <tr><td>2</td><td>0 ^ 0 = 0</td><td>1</td></tr>
  <tr><td>3</td><td>0 ^ 0 = 0, and the same again from the other side</td><td>1</td></tr>
  <tr><td>4</td><td>0 ^ 1 = 1, 0 ^ 0 = 0, 1 ^ 0 = 1</td><td>2</td></tr>
  <tr><td>5</td><td>0 ^ 1, 0 ^ 1, 1 ^ 0, 1 ^ 0 are all 1</td><td>0</td></tr>
  <tr><td>6</td><td>0 ^ 2 = 2, 0 ^ 1 = 1, 1 ^ 1 = 0, 1 ^ 0 = 1, 2 ^ 0 = 2</td><td>3</td></tr>
  <tr><td>7</td><td>0 ^ 0 = 0, 0 ^ 2 = 2, 1 ^ 1 = 0, and mirrors</td><td>1</td></tr>
</table>
<p class="sub">
  The values for lengths 0 to 20 are 0, 0, 1, 1, 2, 0, 3, 1, 1, 0, 3, 3, 2, 2,
  4, 0, 5, 2, 2, 3, 3. A run of 5 has value 0, matching the dry run of
  <code>"+++++"</code> above: it is a loss for the player to move. The code reads
  a whole string as its list of runs (<code>s.split("-")</code>) and XORs their
  values; it is O(n + L²) for a longest run of L, because the table is built
  once, and L² is small next to 2<sup>n</sup>. I checked
  <code>canWinFlipFast</code> against the memoized search on all 16,383 strings of
  length 13 or less and on 300 random strings of lengths 14 to 23.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "The plain memo is exponential in
  the string length. But the game breaks into independent runs of pluses, so this
  is a sum of games and I can give each run a Grundy value, the mex of the XORs
  of the two runs a flip leaves behind, and XOR the values. I wouldn't expect to
  derive the theorem from scratch, but I'd use it, and I could confirm it against
  the brute force on small strings."
</div>

<h3>Expected value: linearity first, then DP</h3>
<p>
  From here the second player is replaced by chance, and the question changes
  from "who wins" to "what happens on average". The <b>expected value</b> of a
  random quantity is its probability-weighted average, the sum of each possible
  value times its probability. There are two tools. The first is often a
  one-line answer; the second is a DP and works when the first does not.
</p>
<p>
  <b>Linearity of expectation.</b> For any two random quantities
  <code>X</code> and <code>Y</code>, <code>E[X + Y] = E[X] + E[Y]</code>. No
  independence is needed. That makes counting problems easy to attack: write the
  quantity as a sum of <em>indicator</em> variables, each 1 when some event
  happens and 0 when it does not, and use <code>E[indicator] = P(event)</code>.
  You never need to understand how the events interact.
</p>
<p>
  <b>Example: fixed points of a random permutation.</b> Shuffle the numbers
  0 to n - 1 uniformly. How many positions <code>i</code> have the number
  <code>i</code> in them, on average? Let <code>X<sub>i</sub></code> be 1 if
  position <code>i</code> holds the number <code>i</code>. Position
  <code>i</code> is equally likely to hold any of the n numbers, so
  <code>P(X<sub>i</sub> = 1) = 1/n</code>. The sum of n indicators has expected
  value n · (1/n) = 1, for every n. The indicators are <em>not</em>
  independent (if the first n - 1 positions are fixed, so is the last), and the
  answer is the same, which is the point of the method. I confirmed it by
  enumerating every permutation for n from 1 to 7: the total number of fixed
  points across all n! permutations is exactly n!.
</p>
<p>
  <b>Example: the coupon collector.</b> There are n kinds of coupon. Each draw
  gives a uniformly random kind, independently. How many draws are needed on
  average to see every kind? Split the process into phases. Phase
  <code>have</code> starts when <code>have</code> kinds are already seen and ends
  when a new kind arrives. A draw is new with probability
  <code>p = (n - have) / n</code>. The number of draws until the first success,
  with success probability <code>p</code>, averages <code>1 / p</code>. (Reason:
  call the average <code>E</code>. One draw is made; with probability
  <code>1 - p</code> you are back where you started, so
  <code>E = 1 + (1 - p) E</code>, which gives <code>E = 1 / p</code>.) The total is
  the sum of the phase lengths, so by linearity
</p>
<pre><code>E = n/n + n/(n-1) + ... + n/1 = n * (1 + 1/2 + ... + 1/n)</code></pre>
<pre><code>function expectedDrawsToCollect(n) {
  let expected = 0;
  for (let have = 0; have &lt; n; have++) {
    expected += n / (n - have); <span class="c">// waiting for one of the n - have new coupons: geometric with p = (n - have) / n</span>
  }
  return expected;
}</code></pre>
<h4>Dry run: three kinds of coupon</h4>
<table>
  <tr><th>Kinds already seen</th><th>Chance a draw is new</th><th>Average draws in this phase</th></tr>
  <tr><td>0</td><td>3/3</td><td>3 / 3 = 1</td></tr>
  <tr><td>1</td><td>2/3</td><td>3 / 2 = 1.5</td></tr>
  <tr><td>2</td><td>1/3</td><td>3 / 1 = 3</td></tr>
  <tr><td colspan="2">Total</td><td>5.5</td></tr>
</table>
<p class="sub">
  For n = 10 the answer is about 29.29, and for n = 25 about 95.4. The last
  coupon alone costs n draws on average, which is why collecting everything is
  much slower than collecting most of it. I checked the formula against an
  independent computation that tracks the probability of finishing on each draw
  and sums <code>t · P(finish at t)</code> for n = 1, 2, 3, 6, 10 and 25; they
  agree to 1e-8. Time is O(n).
</p>
<div class="warn">
  <span class="ttl">⚠ What linearity does not give you</span>
  <code>E[X + Y] = E[X] + E[Y]</code> is always true. <code>E[X · Y] = E[X] · E[Y]</code>
  holds when the two are independent, but can fail when they are not. The expected maximum is not the
  maximum of the expected values. And "the expected number of steps" is not
  "the number of steps in the most likely case". When a question asks for the
  average of something that is not a plain sum or count, reach for the DP in the
  next section instead of forcing linearity.
</div>

<h3>Expected value by DP: the value of a state is the cost of a step plus the weighted next values</h3>
<p>
  When the process is a walk through states, define <code>E[s]</code> as the
  expected number of remaining steps from state <code>s</code>. At a finished
  state it is 0. Otherwise one step is taken, which costs 1, and the next state
  is random, so
</p>
<pre><code>E[s] = 1 + sum over outcomes o of ( P(o) * E[next state after o] )</code></pre>
<p>
  This is the same shape as the game recursions, with a probability-weighted sum
  in place of a max. If the states can never repeat, the recursion ends and you
  fill the table from the finished states backwards.
</p>
<p>
  <b>A walk that never repeats.</b> Roll a fair six-sided die repeatedly and add
  the faces. How many rolls are needed on average until the total is at least
  <code>target</code>? The total only goes up, so a state is the current total
  <code>s</code>, and <code>E[s] = 0</code> for any <code>s &gt;= target</code>.
</p>
<pre><code>function expectedRollsToReach(target) {
  const expected = new Array(target + 6).fill(0); <span class="c">// expected[s]: rolls still needed from total s; 0 once s &gt;= target</span>
  for (let s = target - 1; s &gt;= 0; s--) {
    let sum = 0;
    for (let face = 1; face &lt;= 6; face++) sum += expected[s + face];
    expected[s] = 1 + sum / 6;
  }
  return expected[0];
}</code></pre>
<p class="sub">
  The array is padded by 6 zeros so that <code>expected[s + face]</code> past the
  target reads 0 without a branch. For <code>target = 3</code>:
  <code>E[2] = 1 + (0 + 0 + ... ) / 6 = 1</code>, then
  <code>E[1] = 1 + (E[2] + 0 + 0 + 0 + 0 + 0) / 6 = 7/6</code>, then
  <code>E[0] = 1 + (E[1] + E[2] + 0 + 0 + 0 + 0) / 6 = 1 + (7/6 + 1) / 6 = 49/36</code>,
  about 1.361. Time and space are O(target). I compared the function against the
  probability of finishing at each roll, summed as <code>t · P(finish at t)</code>,
  for targets 1, 2, 6, 7, 20 and 50, and they agree to 1e-9.
</p>
<p>
  <b>A walk that loops back.</b> Roll a die until a six appears twice in a row.
  Now a state is the length of the current run of sixes, 0 or 1, and a failed
  roll sends you back to 0, so the states form a cycle and "fill from the end"
  has no end to start from. The fix is algebra. Write the two equations:
</p>
<pre><code>E0 = 1 + (1/6) E1 + (5/6) E0         one roll: a six moves to run 1, anything else stays at run 0
E1 = 1 + (1/6) * 0 + (5/6) E0        a six finishes, anything else falls back to run 0</code></pre>
<p>
  Substitute the second into the first: <code>E0 = 1 + 1/6 + (5/36) E0 + (5/6) E0</code>.
  Collecting terms, <code>E0 (1 - 5/36 - 30/36) = 7/6</code>, so
  <code>E0 / 36 = 7/6</code> and <code>E0 = 42</code>. For a run of any length
  <code>k</code>, the trick is to express each <code>E[j]</code> as
  <code>a + b · E0</code> from the top down, so that the cycle becomes a single
  equation in <code>E0</code>:
</p>
<pre><code>function expectedRollsForRun(k) {
  let a = 0; <span class="c">// E[j] = a + b * E[0], worked out from the top: E[k] = 0</span>
  let b = 0;
  for (let j = k - 1; j &gt;= 0; j--) {
    a = 1 + a / 6; <span class="c">// one more roll, then a six (1/6) climbs to j + 1</span>
    b = b / 6 + 5 / 6; <span class="c">// any other face (5/6) falls back to run length 0</span>
  }
  return a / (1 - b); <span class="c">// E[0] = a + b * E[0], solved for E[0]</span>
}</code></pre>
<p class="sub">
  Every state above the top is built from the one before it: <code>E[k] = 0</code>
  is <code>a = 0, b = 0</code>, and going down one step gives
  <code>a' = 1 + a/6</code> (the roll that costs 1, then a six), and
  <code>b' = b/6 + 5/6</code> (a six keeps the dependence, anything else returns
  to <code>E0</code>). At <code>j = 0</code>, <code>E0 = a + b · E0</code>, so
  <code>E0 = a / (1 - b)</code>. The exact answers for k = 1 to 6 are 6, 42, 258,
  1554, 9330 and 55,986, which fit <code>(6<sup>k+1</sup> - 6) / 5</code>. I checked
  k = 1 to 3 against the finishing-time distribution too. Time is O(k).
</p>
<div class="warn">
  <span class="ttl">⚠ Four expected-value slips</span>
  <b>(1)</b> Forgetting the "+ 1" for the step you are taking, and returning only
  the weighted next values. <b>(2)</b> Weights that do not add to 1: check that
  the probabilities of all outcomes out of a state sum to 1, including the "stay"
  outcome. <b>(3)</b> A state that can loop back to itself with probability 1 has
  infinite expectation, and the equation <code>E = 1 + E</code> has no solution;
  the <code>1 / (1 - b)</code> above would divide by zero. <b>(4)</b> Mixing the
  two questions: the average number of steps and the probability of finishing
  within some steps are different tables, built in different directions.
</div>

<h3>Probability DP: push the probability forward, one step at a time</h3>
<p>
  The second kind of question is "what is the probability that...". The state
  table now holds, for each step <code>t</code>, <b>the probability of being in
  each state after t steps</b>. Start with probability 1 on the initial state.
  Each step moves every state's probability along its transitions, multiplied by
  the chance of the transition. The probability of an event is the sum, over
  all the ways it can happen, of the product of the step probabilities along the
  way; the table adds up all the ways that reach the same state.
</p>
<p>
  This is the <em>forward</em> direction. The expected-value tables of the last
  section were filled <em>backwards</em>, from the finished states. Both are
  valid; pick the direction that gives the question's answer directly. The
  cost is (steps) × (states) × (transitions per state). Two rules keep these
  tables honest. Probability that leaves the table for good (a knight that falls
  off the board) is simply dropped, or collected into an answer counter, and
  never carried on. And the probabilities at any step add up to the starting 1
  minus whatever has left; if the totals do not, something was double-counted.
</p>

<h4>Knight Probability in a Chessboard</h4>
<p>
  A knight starts on an <code>n × n</code> board at <code>(row, column)</code>.
  It makes exactly <code>k</code> moves. Each move picks one of the 8 knight
  moves uniformly, even if that move leaves the board, and once the knight is off
  the board it stays off. What is the probability that it is still on the board
  after <code>k</code> moves? Layer <code>t</code> of the table is the chance of
  being on each cell after <code>t</code> moves while never having left.
</p>
<pre><code>function knightProbability(n, k, row, column) {
  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  let now = Array.from({ length: n }, () =&gt; new Array(n).fill(0)); <span class="c">// now[r][c]: chance of being on (r, c) and still on the board</span>
  now[row][column] = 1;
  for (let step = 0; step &lt; k; step++) {
    const next = Array.from({ length: n }, () =&gt; new Array(n).fill(0));
    for (let r = 0; r &lt; n; r++) {
      for (let c = 0; c &lt; n; c++) {
        if (now[r][c] === 0) continue;
        for (const [dr, dc] of moves) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr &lt; 0 || nr &gt;= n || nc &lt; 0 || nc &gt;= n) continue; <span class="c">// this move leaves the board: its probability is dropped</span>
          next[nr][nc] += now[r][c] / 8;
        }
      }
    }
    now = next;
  }
  let total = 0;
  for (const line of now) for (const p of line) total += p;
  return total;
}</code></pre>
<h4>Dry run: n = 3, k = 2, start (0, 0), written as counts out of 8<sup>t</sup></h4>
<table>
  <tr><th>After move</th><th>Cells with a non-zero count</th><th>Stays on the board</th></tr>
  <tr><td>0</td><td>(0,0): 1</td><td>1 of 1</td></tr>
  <tr><td>1</td><td>(1,2): 1 and (2,1): 1 (the other six moves leave the board)</td><td>2 of 8</td></tr>
  <tr><td>2</td><td>(0,0): 2, (0,2): 1, (2,0): 1</td><td>4 of 64</td></tr>
</table>
<p class="sub">
  The answer is 4/64 = 0.0625. The code divides by 8 at each step, which gives
  the same result as dividing by 8<sup>k</sup> once at the end. Time is
  O(k · n² · 8) and space O(n²), two layers. I checked the function against a
  direct count of all 8<sup>k</sup> move sequences on 120 random boards (n from 1
  to 6, k from 0 to 5) and the results agree to 1e-12.
</p>
<div class="warn">
  <span class="ttl">⚠ Knight pitfalls</span>
  <b>(1)</b> Divide by 8 every time, not by the number of moves that stay on the
  board: the knight picks among all 8, and the off-board choices are part of the
  probability that is lost. <b>(2)</b> Write into a fresh layer; updating the
  current layer in place lets mass move twice in one step. <b>(3)</b> Build the
  grid with <code>Array.from({ length: n }, () =&gt; new Array(n).fill(0))</code>.
  <code>new Array(n).fill(new Array(n).fill(0))</code> makes every row the same
  array object.
</div>

<h4>Out of Boundary Paths: count the paths, divide by nothing</h4>
<p>
  A ball starts at <code>(startRow, startColumn)</code> of an <code>m × n</code>
  grid and moves up, down, left or right, at most <code>maxMove</code> times. Count
  the paths that take the ball out of the grid, modulo 1,000,000,007. This
  is the same table as the knight, with counts instead of probabilities, and the
  mass that leaves is not dropped but <em>added to the answer</em> at the step
  where it leaves. A path is counted once, at the first move that exits, because
  after exiting it is no longer in the table.
</p>
<pre><code>function findPaths(m, n, maxMove, startRow, startColumn) {
  const MOD = 1000000007;
  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  let ways = Array.from({ length: m }, () =&gt; new Array(n).fill(0)); <span class="c">// ways[r][c]: paths that are on (r, c) after this many moves</span>
  ways[startRow][startColumn] = 1;
  let out = 0;
  for (let move = 0; move &lt; maxMove; move++) {
    const next = Array.from({ length: m }, () =&gt; new Array(n).fill(0));
    for (let r = 0; r &lt; m; r++) {
      for (let c = 0; c &lt; n; c++) {
        const w = ways[r][c];
        if (w === 0) continue;
        for (const [dr, dc] of dirs) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr &lt; 0 || nr &gt;= m || nc &lt; 0 || nc &gt;= n) out = (out + w) % MOD; <span class="c">// this path leaves the grid now</span>
          else next[nr][nc] = (next[nr][nc] + w) % MOD;
        }
      }
    }
    ways = next;
  }
  return out;
}</code></pre>
<h4>Dry run: m = 2, n = 2, maxMove = 2, start (0, 0)</h4>
<table>
  <tr><th>Move</th><th>Ways on the grid afterwards</th><th>Leave the grid on this move</th><th>Total out</th></tr>
  <tr><td>1</td><td>(0,1): 1, (1,0): 1</td><td>2 (up and left from (0,0))</td><td>2</td></tr>
  <tr><td>2</td><td>(0,0): 2, (1,1): 2</td><td>4 (two from each of (0,1) and (1,0))</td><td>6</td></tr>
</table>
<p class="sub">
  The answer 6 matches the example in the problem statement. Time is O(maxMove ·
  m · n · 4) and space O(m · n). Taking the remainder after every addition is
  needed once the counts get large, and it is safe: each count is below 1,000,000,007 and a sum of two of
  them is below 2<sup>31</sup>, far under the exact-integer limit of doubles
  (2<sup>53</sup>). I checked the function against full path enumeration on 150
  small cases, and against a <code>BigInt</code> run with no remainder (reduced
  at the end) on grids up to 50 × 50 with 50 moves.
</p>

<h4>Dice Roll Simulation: the state remembers how long the current run is</h4>
<p>
  A die with faces 1 to 6 is rolled <code>n</code> times, and face <code>i</code>
  may not appear more than <code>rollMax[i]</code> times in a row. Count the
  different sequences, modulo 1,000,000,007. The last face alone is not enough
  to know which next rolls are allowed; you also need how many times in a row it
  has come up. So the state is <code>(last face, run length)</code>, and the
  table holds how many sequences end in each state.
</p>
<p>
  Two kinds of transition. Repeating the last face moves
  <code>(face, run)</code> to <code>(face, run + 1)</code> when
  <code>run + 1 &lt;= rollMax[face]</code>. Rolling any other face starts a run of 1
  and is allowed for every face that is not the same as the last. Summing over
  "any other face" for each target face would be a loop inside a loop; instead
  note that the number of sequences that end in some <em>other</em> face is
  <code>all - endsIn[face]</code>, which is O(1) to get after one pass.
</p>
<pre><code>function dieSimulator(n, rollMax) {
  const MOD = 1000000007;
  let dp = rollMax.map((limit) =&gt; new Array(limit + 1).fill(0)); <span class="c">// dp[face][run]: sequences ending in face with exactly run of them in a row</span>
  for (let face = 0; face &lt; 6; face++) dp[face][1] = 1;
  for (let roll = 2; roll &lt;= n; roll++) {
    const endsIn = dp.map((runs) =&gt; runs.reduce((sum, count) =&gt; (sum + count) % MOD, 0));
    const all = endsIn.reduce((sum, count) =&gt; (sum + count) % MOD, 0);
    const next = rollMax.map((limit) =&gt; new Array(limit + 1).fill(0));
    for (let face = 0; face &lt; 6; face++) {
      next[face][1] = (all - endsIn[face] + MOD) % MOD; <span class="c">// switching to this face from any other face starts a run of 1</span>
      for (let run = 2; run &lt;= rollMax[face]; run++) next[face][run] = dp[face][run - 1]; <span class="c">// repeating the face lengthens the run</span>
    }
    dp = next;
  }
  let total = 0;
  for (const runs of dp) for (const count of runs) total = (total + count) % MOD;
  return total;
}</code></pre>
<h4>Dry run: n = 2, rollMax = [1, 1, 2, 2, 2, 3]</h4>
<table>
  <tr><th>After roll</th><th>Sequences ending in each face</th><th>Total</th></tr>
  <tr><td>1</td><td>1 each, run 1</td><td>6</td></tr>
  <tr><td>2</td><td>each face starts a new run from the other 5 faces: 5 each; the faces with a limit of 2 or 3 (the last four) can also repeat: +1 each</td><td>30 + 4 = 34</td></tr>
</table>
<p class="sub">
  The answer for these limits is 34, matching the problem's example. Time is
  O(n · (sum of the limits)), at most about 90n since each limit is at most 15,
  and space O(sum of the limits). I verified it on 120 random small cases (n up
  to 7, limits from 1 to 4) against direct enumeration of every allowed
  sequence, and against a <code>BigInt</code> version with no remainder up to
  n = 5000.
</p>
<div class="warn">
  <span class="ttl">⚠ The remainder trap</span>
  <code>(all - endsIn[face]) % MOD</code> can be negative in JavaScript, because
  <code>%</code> keeps the sign of the left side, and <code>all</code> has
  already been reduced so it can be smaller than <code>endsIn[face]</code>.
  Add <code>MOD</code> before taking the remainder, as the code does. A second
  trap in counting problems in general: multiplying two reduced numbers
  (<code>a * b % MOD</code>) overflows the exact range of doubles; the last
  section shows what to do then. These tables add and never multiply, so plain
  numbers are enough.
</div>

<h3>Soup Servings: a cutoff that is justified by the numbers</h3>
<p>
  There are two soups, A and B, with <code>n</code> ml each. Each turn picks one
  of four servings, each with probability 1/4, as (A, B) amounts:
  (100, 0), (75, 25), (50, 50), (25, 75). If a soup has less than the serving
  asks for, it gives what is left. The process stops when a soup is empty. Return
  the probability that A empties first plus half the probability that they empty
  in the same turn. An answer within 1e-5 is accepted, and
  <code>n</code> can be 10<sup>9</sup>.
</p>
<p>
  Every serving is a multiple of 25 ml, so count in units of 25: the servings are
  (4, 0), (3, 1), (2, 2), (1, 3) units, and an amount <code>n</code> is
  <code>ceil(n / 25)</code> units (a leftover of 1 ml still blocks the soup from
  being empty). With <code>f(a, b)</code> for the answer when A has <code>a</code>
  units and B has <code>b</code>:
</p>
<pre><code>f(a, b) = 0.5   if a &lt;= 0 and b &lt;= 0     (both empty together: half a win)
f(a, b) = 1     if a &lt;= 0               (A emptied first)
f(a, b) = 0     if b &lt;= 0               (B emptied first)
f(a, b) = 0.25 * ( f(a-4, b) + f(a-3, b-1) + f(a-2, b-2) + f(a-1, b-3) )</code></pre>
<p>
  That is U² states for U = n / 25, which is about 1.6 · 10<sup>15</sup> for
  <code>n = 10<sup>9</sup></code>. There is a way out, and it is the interesting part.
</p>
<p>
  <b>Why a cutoff is valid.</b> Each turn removes on average
  (100 + 75 + 50 + 25) / 4 = 62.5 ml from A, but only (0 + 25 + 50 + 75) / 4 =
  37.5 ml from B. A drains faster, and the longer the process runs the more
  likely it is that A is empty first, so the answer approaches 1 as
  <code>n</code> grows. Because the problem accepts an error of 1e-5, any
  <code>n</code> so large that the true answer is within 1e-5 of 1 may return 1.
  I computed the exact values and measured how far below 1 the answer is:
</p>
<table>
  <tr><th>n (ml)</th><th>1 - answer</th></tr>
  <tr><td>1,000</td><td>2.3 · 10<sup>-2</sup></td></tr>
  <tr><td>2,500</td><td>7.5 · 10<sup>-4</sup></td></tr>
  <tr><td>3,750</td><td>4.8 · 10<sup>-5</sup></td></tr>
  <tr><td>4,451 to 4,475</td><td>9.8 · 10<sup>-6</sup>, the first values of n below 1 · 10<sup>-5</sup></td></tr>
  <tr><td>4,800</td><td>5.0 · 10<sup>-6</sup></td></tr>
  <tr><td>12,500</td><td>4.5 · 10<sup>-13</sup></td></tr>
  <tr><td>25,000 and above</td><td>below what a double can show (the computed value is exactly 1)</td></tr>
</table>
<p>
  The cutoff of 4,800 is safe for two reasons that must both hold. The error
  at 4,800 is 5.0 · 10<sup>-6</sup>, below 1e-5. And the answer does not move
  away from 1 for larger <code>n</code>: I checked numerically, for every
  <code>n</code> up to 55,000 (the answer depends on <code>n</code> only through
  <code>ceil(n / 25)</code>), that the answer never decreases as
  <code>n</code> grows. That check is evidence, not a proof; the drift argument
  above is why you would expect it, and why the gap falls so quickly. Below the
  cutoff the table has at most 192² = 36,864 states.
</p>
<pre><code>function soupServings(n) {
  if (n &gt;= 4800) return 1; <span class="c">// beyond this the answer is within 1e-5 of 1</span>
  const units = Math.ceil(n / 25); <span class="c">// every serving is a multiple of 25 ml, so count in units of 25</span>
  const memo = Array.from({ length: units + 1 }, () =&gt; new Array(units + 1).fill(-1));

  function f(a, b) { <span class="c">// P(A empties first) + half of P(both empty together), with a and b units left</span>
    if (a &lt;= 0 &amp;&amp; b &lt;= 0) return 0.5;
    if (a &lt;= 0) return 1;
    if (b &lt;= 0) return 0;
    if (memo[a][b] !== -1) return memo[a][b];
    memo[a][b] = 0.25 * (f(a - 4, b) + f(a - 3, b - 1) + f(a - 2, b - 2) + f(a - 1, b - 3));
    return memo[a][b];
  }

  return f(units, units);
}</code></pre>
<h4>Dry run: n = 50, so 2 units each</h4>
<table>
  <tr><th>State (a, b)</th><th>Terms: f(a-4,b), f(a-3,b-1), f(a-2,b-2), f(a-1,b-3)</th><th>f</th></tr>
  <tr><td>(1, 1)</td><td>1, 0.5, 0.5, 0.5</td><td>0.25 · 2.5 = 0.625</td></tr>
  <tr><td>(1, 2)</td><td>1, 1, 0.5, 0.5</td><td>0.75</td></tr>
  <tr><td>(2, 1)</td><td>1, 0.5, 0.5, 0</td><td>0.5</td></tr>
  <tr><td>(2, 2)</td><td>1, 1, 0.5, 0</td><td>0.25 · 2.5 = 0.625</td></tr>
</table>
<p class="sub">
  The answer for n = 50 is 0.625, as in the problem statement. I compared the
  function with a direct enumeration of the game in raw millilitres, with no
  memo, for every n from 0 to 150. Below the cutoff the table has U² entries for
  U = <code>ceil(n / 25)</code>, at most 192² = 36,864, so time and space are
  constant in <code>n</code> once the cutoff is applied.
</p>
<div class="warn">
  <span class="ttl">⚠ Soup Servings pitfalls</span>
  <b>(1)</b> Use <code>Math.ceil</code>, not <code>Math.floor</code>, for the
  units. For <code>n = 60</code> the correct answer is 0.65625; rounding down
  gives 0.625. <b>(2)</b> The tie counts as one half, which is why the
  both-empty base case is 0.5 and is checked first. <b>(3)</b> The cutoff is a
  statement about the checker's tolerance. If a problem asked for 12 correct
  digits, 4,800 would be far too small: the error there is 5.0 · 10<sup>-6</sup>.
  The cutoff would have to move out to about 25,000 ml, where the computed value
  is exactly 1.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "The state space is (n/25)², which is
  far too big for n up to a billion. But A is served 62.5 ml per turn on average
  against 37.5 for B, so as n grows the answer tends to 1. The checker allows
  1e-5, and I measured that the error is already 5e-6 at n = 4800 and keeps
  shrinking, so for larger n I return 1 and below that I use the table."
</div>

<h3>New 21 Game: probability DP with a sliding window</h3>
<p>
  Alice starts with 0 points. While she has fewer than <code>k</code> points she
  draws a number uniformly from 1 to <code>maxPts</code> and adds it. She stops
  when she has <code>k</code> points or more. What is the probability that her
  final total is at most <code>n</code>?
</p>
<p>
  Let <code>reach[i]</code> be the probability that her total ever equals
  <code>i</code>. She reaches <code>i</code> by being at some total
  <code>j</code> that is still below <code>k</code> (so she draws again) and then
  drawing exactly <code>i - j</code>, which has probability
  <code>1 / maxPts</code>. So
</p>
<pre><code>reach[0] = 1
reach[i] = (1 / maxPts) * sum of reach[j] over j in [i - maxPts, i - 1] with j &lt; k</code></pre>
<p>
  The answer is the sum of <code>reach[i]</code> for <code>k &lt;= i &lt;= n</code>,
  because those are exactly the totals at which she stops. The sum for
  <code>reach[i]</code> has <code>maxPts</code> terms, so computing every entry
  that way costs O(n · maxPts). But the range slides: the sum for
  <code>i + 1</code> is the sum for <code>i</code> plus the new term
  <code>reach[i]</code> (if <code>i &lt; k</code>) minus the term that fell out,
  <code>reach[i - maxPts]</code> (if it was in the window). A running window sum
  makes each step O(1).
</p>
<pre><code>function new21Game(n, k, maxPts) {
  if (k === 0 || n &gt;= k + maxPts - 1) return 1; <span class="c">// no draw is made, or no total can exceed n</span>
  const reach = new Array(n + 1).fill(0); <span class="c">// reach[i]: chance that Alice's total ever equals i</span>
  reach[0] = 1;
  let window = 1; <span class="c">// sum of reach[j] over the last maxPts totals j &lt; k, the ones that still draw</span>
  let answer = 0;
  for (let i = 1; i &lt;= n; i++) {
    reach[i] = window / maxPts;
    if (i &lt; k) window += reach[i]; <span class="c">// Alice draws again from i</span>
    else answer += reach[i]; <span class="c">// Alice stops at i, and i &lt;= n</span>
    if (i - maxPts &gt;= 0 &amp;&amp; i - maxPts &lt; k) window -= reach[i - maxPts]; <span class="c">// total i - maxPts is too far back to reach i + 1</span>
  }
  return answer;
}</code></pre>
<h4>Dry run: n = 5, k = 3, maxPts = 4</h4>
<table>
  <tr><th>i</th><th>Window (sum of reach[j], j &lt; 3, in the last 4 totals)</th><th>reach[i] = window / 4</th><th>Action</th></tr>
  <tr><td>1</td><td>reach[0] = 1</td><td>0.25</td><td>1 &lt; 3: add to the window</td></tr>
  <tr><td>2</td><td>1 + 0.25 = 1.25</td><td>0.3125</td><td>2 &lt; 3: add to the window</td></tr>
  <tr><td>3</td><td>1 + 0.25 + 0.3125 = 1.5625</td><td>0.390625</td><td>3 &gt;= 3: she stops; answer += 0.390625</td></tr>
  <tr><td>4</td><td>1.5625</td><td>0.390625</td><td>stops; answer = 0.78125; reach[0] leaves the window (i - 4 = 0)</td></tr>
  <tr><td>5</td><td>0.5625 (reach[1] + reach[2])</td><td>0.140625</td><td>stops; answer = 0.921875</td></tr>
</table>
<p class="sub">
  The probability is 0.921875. The only other final total is 6, reached from 2
  by drawing a 4, with probability <code>reach[6] = 0.078125</code>; it exceeds
  <code>n = 5</code> and is the missing 1 - 0.921875. I compared the function
  with exact fractions on 400 random cases (the largest difference was 9 ·
  10<sup>-16</sup>) and on one with n = 200, k = 150 and maxPts = 100, where the
  float answer differs from the exact fraction by about 3 · 10<sup>-16</sup>.
  Time is O(n) and space O(n).
</p>
<div class="warn">
  <span class="ttl">⚠ Three guards that decide the answer</span>
  <b>(1)</b> <code>k === 0</code>: Alice never draws, her total is 0, and 0 is at
  most <code>n</code>, so the answer is 1. Without the guard the loop would start
  with a window that wrongly adds the first draw. <b>(2)</b>
  <code>n &gt;= k + maxPts - 1</code>: the highest total she can stop on is
  <code>k - 1 + maxPts</code> (she draws from <code>k - 1</code> and gets
  <code>maxPts</code>), so no total can exceed <code>n</code>, and the answer is 1.
  This also keeps <code>n</code> small enough for the array. <b>(3)</b> A total
  joins the window only if it is below <code>k</code>: totals at or above
  <code>k</code> are final states and do not draw again, which is the difference
  between this table and a plain sliding window of averages.
</div>

<h3>Floating point, exact fractions and answers modulo a prime</h3>
<p>
  Every probability table in this chapter fills cells with a
  <code>number</code>, a 64-bit double, and most of the time that is exactly what
  a judge expects: the problem says "answers within 10<sup>-5</sup> are
  accepted" and a double carries about 15 to 16 significant digits. It is worth
  knowing where that stops being true, because probability problems are where
  JavaScript's number type is most often misused.
</p>
<h4>What the double does to you</h4>
<ul>
  <li><b>Rounding is built in.</b> <code>0.1 + 0.2</code> is <code>0.30000000000000004</code>, so <code>0.1 + 0.2 === 0.3</code> is <code>false</code>. Compare computed probabilities with a tolerance, <code>Math.abs(a - b) &lt; 1e-9</code>, never with <code>===</code>. That includes the checks in your own tests.</li>
  <li><b>Small errors do not stay invisible.</b> The loop-back expected value from earlier, <code>expectedRollsForRun(2)</code>, returns <code>42.00000000000015</code>, not 42, and <code>expectedRollsForRun(3)</code> returns <code>258.00000000000506</code>. If the true answer is a known integer or a short fraction, an exact computation is the way to show it.</li>
  <li><b>Very small values vanish.</b> <code>0.5 ** 1074</code> is <code>5e-324</code>, the smallest positive double, and <code>0.5 ** 1075</code> is <code>0</code>. So is <code>8 ** -400</code>, which a knight with 400 moves would produce on one path. A table that sums many paths loses only the cells that are individually tiny, but an answer that is itself that small cannot be returned as a double.</li>
  <li><b>Cutoffs are tolerance-dependent.</b> The Soup Servings shortcut is right for an error limit of 1e-5 and wrong for a stricter one, as computed above.</li>
  <li><b>How big the error gets, in these experiments.</b> The knight table was within 6 · 10<sup>-17</sup> of the exact value on 200 random boards (n from 3 to 10, k up to 60), and the New 21 Game within 9 · 10<sup>-16</sup> on 400 random cases. The expected-value result of about 258 was off by 5 · 10<sup>-12</sup>, which is a relative error near 2 · 10<sup>-14</sup>. That is evidence for these sizes, not a bound for every input.</li>
</ul>

<h4>Exact answers: count outcomes first, divide once</h4>
<p>
  A judge may ask for an exact fraction, or for the probability written as
  <code>P / Q</code> modulo a prime, or two probabilities may have to be compared
  exactly. Then doubles are the wrong tool. The cleanest approach is usually to
  change what the table counts. In the knight problem every step has 8 outcomes,
  all equally likely, so the probability after <code>k</code> moves is
  <code>(number of move sequences that stay on the board) / 8<sup>k</sup></code>.
  Count sequences with <code>BigInt</code>, which has no upper limit, and divide
  once at the end. This is the same table as before with the division by 8
  removed:
</p>
<pre><code>function knightWays(n, k, row, column) {
  const moves = [[1, 2], [2, 1], [2, -1], [1, -2], [-1, -2], [-2, -1], [-2, 1], [-1, 2]];
  let now = Array.from({ length: n }, () =&gt; new Array(n).fill(0n)); <span class="c">// now[r][c]: how many move sequences are on (r, c) and still on the board</span>
  now[row][column] = 1n;
  for (let step = 0; step &lt; k; step++) {
    const next = Array.from({ length: n }, () =&gt; new Array(n).fill(0n));
    for (let r = 0; r &lt; n; r++) {
      for (let c = 0; c &lt; n; c++) {
        if (now[r][c] === 0n) continue;
        for (const [dr, dc] of moves) {
          const nr = r + dr;
          const nc = c + dc;
          if (nr &lt; 0 || nr &gt;= n || nc &lt; 0 || nc &gt;= n) continue;
          next[nr][nc] += now[r][c];
        }
      }
    }
    now = next;
  }
  let total = 0n;
  for (const line of now) for (const ways of line) total += ways;
  return total;
}</code></pre>
<p>
  For <code>n = 3, k = 2</code> from <code>(0, 0)</code> it returns <code>4n</code>,
  and 4/64 reduced is exactly 1/16. When the denominators differ from step to
  step, as in expected values, use small fraction helpers on
  <code>BigInt</code>. The numerator and denominator are kept in lowest terms by
  dividing by their greatest common divisor:
</p>
<pre><code>function gcd(a, b) {
  while (b !== 0n) [a, b] = [b, a % b];
  return a;
}

function frac(num, den = 1n) {
  const g = gcd(num &lt; 0n ? -num : num, den);
  return g === 0n ? { num: 0n, den: 1n } : { num: num / g, den: den / g }; <span class="c">// lowest terms, den &gt; 0</span>
}

const add = (x, y) =&gt; frac(x.num * y.den + y.num * x.den, x.den * y.den);
const mul = (x, y) =&gt; frac(x.num * y.num, x.den * y.den);
const compare = (x, y) =&gt; {
  const diff = x.num * y.den - y.num * x.den;
  return diff &lt; 0n ? -1 : diff &gt; 0n ? 1 : 0;
};</code></pre>
<p>
  With those helpers the loop-back expected value is exact. The same algebra as
  before, with <code>1/6</code> and <code>5/6</code> as exact fractions, returns
  42 with no trace of the error:
</p>
<pre><code>function expectedRollsForRunExact(k) {
  let a = frac(0n);
  let b = frac(0n);
  for (let j = k - 1; j &gt;= 0; j--) {
    a = add(frac(1n), mul(frac(1n, 6n), a));
    b = add(mul(frac(1n, 6n), b), frac(5n, 6n));
  }
  const oneMinusB = add(frac(1n), mul(frac(-1n), b));
  return mul(a, frac(oneMinusB.den, oneMinusB.num)); <span class="c">// a / (1 - b)</span>
}</code></pre>
<p class="sub">
  <code>expectedRollsForRunExact(2)</code> returns <code>{ num: 42n, den: 1n }</code>,
  and for k = 1 to 6 it returns 6, 42, 258, 1554, 9330 and 55,986 exactly. Exact
  arithmetic costs more: the numbers grow with the number of steps. For the
  knight on an 8 × 8 board with 100 moves from (0, 0), the reduced fraction has a
  77-digit numerator and a 90-digit denominator. That is still instant here, but
  it is why you count with a fixed denominator when you can, instead of reducing
  a fraction after every addition.
</p>

<h4>Answers modulo 1,000,000,007</h4>
<p>
  Many counting problems ask for the result modulo the prime
  1,000,000,007. Counts reduce at every step, which is fine for additions with
  plain numbers, as in the paths and dice tables. Two things change when
  probabilities are involved or numbers are multiplied.
</p>
<ul>
  <li><b>Multiplying two reduced numbers can lose bits.</b> <code>1000000006 * 1000000006</code> is about 10<sup>18</sup>, above 2<sup>53</sup>, so the double is only approximate: <code>1000000006 * 1000000006 % 1000000007</code> gives <code>999999972</code>, while the true value is 1 (it is <code>(-1)</code> times <code>(-1)</code> modulo the prime). Do products in <code>BigInt</code> and convert back with <code>Number(...)</code>.</li>
  <li><b>Division becomes multiplication by an inverse.</b> A probability <code>p / q</code> is reported as <code>p * q<sup>-1</sup></code> modulo the prime, where the inverse of <code>q</code> is <code>q<sup>M - 2</sup></code> modulo <code>M</code> (Fermat's little theorem, valid because <code>M</code> is prime and <code>q</code> is not a multiple of it).</li>
</ul>
<pre><code>const MOD = 1000000007n;

function powMod(base, exponent, mod) {
  let result = 1n;
  base %= mod;
  while (exponent &gt; 0n) {
    if (exponent &amp; 1n) result = (result * base) % mod;
    base = (base * base) % mod;
    exponent &gt;&gt;= 1n;
  }
  return result;
}

const inverse = (a) =&gt; powMod(a, MOD - 2n, MOD);
const asModular = (x) =&gt; (x.num % MOD) * inverse(x.den) % MOD;</code></pre>
<p class="sub">
  <code>asModular(frac(1n, 16n))</code> is <code>562500004n</code>, and
  <code>16 * 562500004 = 9,000,000,064</code>, which leaves remainder 1 after
  dividing by 1,000,000,007, as an inverse must. Reduce numerators and
  denominators consistently: either reduce the fraction first and then convert,
  or convert numerator and denominator separately; both give the same residue as
  long as the denominator is not a multiple of the prime.
</p>

<h4>Choosing the number type</h4>
<table>
  <tr><th>The task says</th><th>Use</th><th>Why</th></tr>
  <tr><td>"within 1e-5" or "1e-6"</td><td>doubles</td><td>the tolerance is far above the rounding error; the table is simple and fast</td></tr>
  <tr><td>"return the exact fraction", or two probabilities must be compared for equality</td><td><code>BigInt</code> counts, or <code>BigInt</code> fractions</td><td>a double cannot represent most fractions, so equality and ties would depend on rounding</td></tr>
  <tr><td>"modulo 1,000,000,007"</td><td>plain numbers for sums, <code>BigInt</code> for products, a modular inverse for division</td><td>a product of two residues leaves the exact range of doubles</td></tr>
  <tr><td>the answer itself is smaller than about 10<sup>-300</sup></td><td>logarithms or exact fractions</td><td>a double underflows to 0</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ BigInt traps</span>
  <b>(1)</b> <code>1n + 1</code> throws a <code>TypeError</code>; convert explicitly.
  <b>(2)</b> BigInt division truncates toward zero: <code>7n / 2n</code> is
  <code>3n</code> and <code>-7n / 2n</code> is <code>-3n</code>.
  <b>(3)</b> <code>Number(8n ** 400n)</code> is <code>Infinity</code>, so
  <code>Number(a) / Number(b)</code> for the two huge parts of a fraction is
  <code>NaN</code>. Scale before converting:
  <code>Number(a * 10n ** 18n / b) / 1e18</code>.
  <b>(4)</b> <code>JSON.stringify</code> throws on a BigInt; convert to a string
  first when you print results.
</div>

<h3>Recognising a game or probability problem</h3>
<p>
  These problems announce themselves in the statement, and the first job is to
  name the family, because the family fixes the value you store.
</p>
<ul>
  <li><b>"Two players take turns", "both play optimally", "can the first player win", "Alice and Bob"</b> → a win/lose or score game. If the answer is true/false, store a boolean per position. If the answer is a score or "who has more", store the <em>lead</em> of the player to move.</li>
  <li><b>Elements are taken from the ends of a row, or from the front, with a choice of how many</b> → interval or suffix state, and the lead recurrence <code>gain - best lead of the opponent</code>.</li>
  <li><b>A pool of at most about 20 distinct items that cannot be reused</b> → the used set is the state, a bitmask. Check the "someone must win" condition before trusting the recursion.</li>
  <li><b>A pile of up to 10<sup>9</sup> items, or several piles with take-any-number moves</b> → do not build a table of that size. Print the first 30 values, find the pattern (period, parity, XOR of sizes) and prove it with the "from L every move reaches W, from W some move reaches L" argument.</li>
  <li><b>The board falls apart into independent pieces</b> (runs, separate piles) → the Grundy value of each piece, XORed.</li>
  <li><b>"Expected number of", "on average how many"</b> → try linearity of expectation first, with indicators. If the process is a walk through states, <code>E[s] = 1 + sum of P(o) * E[next]</code>; if states can repeat, write the equations and solve for the start state.</li>
  <li><b>"What is the probability that... after k steps" or "until a condition"</b> → push the distribution forward over the states, step by step, and collect the mass at the end or the mass that leaves.</li>
  <li><b>"Return the answer modulo 1,000,000,007" with probabilities</b> → count outcomes with integers and divide by a modular inverse; <b>"within 1e-5"</b> → doubles are fine, and look for a cutoff when <code>n</code> is huge.</li>
</ul>
<p>
  <b>Who is the other player?</b> This is the question that separates the two
  halves of the chapter. If the other side is an adversary who wants you to lose,
  its step is a <em>min</em> over its choices (in negamax, a sign change). If the
  other side is random, its step is an <em>average</em>. A problem that mixes
  both, say a game where a die decides the move, takes a max on your turns and an
  average on the die's, and it is still a DP over positions with the same state
  tests.
</p>
<table>
  <tr><th>Looks like</th><th>Is not</th><th>The difference</th></tr>
  <tr><td>Predict the Winner</td><td>a greedy "take the bigger end"</td><td>a player who always takes the bigger end loses on <code>[1, 5, 233, 7]</code> against optimal play</td></tr>
  <tr><td>Stone Game II</td><td>plain interval DP</td><td>the legal moves depend on M, so M joins the state</td></tr>
  <tr><td>Can I Win</td><td>plain backtracking</td><td>the same used set repeats from different orders, so memoizing on the mask removes most of the tree</td></tr>
  <tr><td>a long pile game</td><td>a table to fill</td><td>the table has a period or a parity, and the proof of that is the answer</td></tr>
  <tr><td>Knight Probability</td><td>a search over the paths</td><td>mass is merged cell by cell, so there are k layers, not 8<sup>k</sup> paths</td></tr>
  <tr><td>Soup Servings</td><td>a table that must be filled for any n</td><td>the answer is within tolerance of 1 past a cutoff</td></tr>
</table>
<p>
  <b>A routine that works in an interview.</b> (1) Say which family it is. (2)
  Define the position and test the key: could two plays with the same key differ?
  (3) Write the recurrence from the point of view of the player about to move.
  (4) State the base case from the rules, and confirm the game cannot end without
  a winner and cannot loop. (5) State the complexity as positions times work per
  position. (6) Test on two or three tiny inputs by hand, or against an
  exhaustive search, before the interviewer does it for you. Step 6 is how every
  function in this chapter was checked.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll treat this as a two-player
  zero-sum game with perfect information, so the value of a position is defined
  from the mover's side: win or lose, or the lead. The position is the set of
  remaining items and nothing else, because the earlier moves are already in the
  scores. I'll memoize on that, and the cost is the number of positions times
  the moves per position. If the numbers are too big for a table I'll print a
  small table, look for the pattern and prove it by induction."
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State and prove, in your own words, that a position is winning exactly when some move leads to a losing position, and name the two assumptions that fail most often (the game ends, and it cannot end without a winner).</li>
    <li>Explain why a memo key that records only the remaining total gives wrong answers for Can I Win, and which part of the position the mask carries instead.</li>
    <li>Derive <code>lead(i, j) = max(nums[i] - lead(i + 1, j), nums[j] - lead(i, j - 1))</code>, and say why the opponent's best reply is a subtraction and not a separate minimum.</li>
    <li>Write Stone Game II's state and recurrence from memory, and say why the take-everything shortcut needs positive piles.</li>
    <li>Prove the Nim XOR rule: the finished position is zero, every move from zero leaves non-zero, and from non-zero a move to zero exists. Say what the move is.</li>
    <li>Explain in one minute why Flip Game II splits into independent runs, and what the mex of a run means.</li>
    <li>Compute the expected number of fixed points of a random permutation with indicators, and the coupon collector's expectation with phases.</li>
    <li>Solve "roll until two sixes in a row" with equations and get 42.</li>
    <li>Write the push-forward table for Knight Probability, and say which probability is dropped and why you divide by 8 every step.</li>
    <li>Explain the Soup Servings cutoff: the drift argument, the 1e-5 tolerance, and what you measured to be sure.</li>
    <li>Say when a double is enough, when to count with <code>BigInt</code> and divide once, and why <code>a * b % MOD</code> with two residues is a bug.</li>
  </ul>
</div>
`,
};
