import type { Chapter } from "../types";

export const dsaDpStateMachines: Chapter = {
  id: "dsa-dp-state-machines",
  num: "I12",
  title: "DP state machines and the knapsack family",
  short: "DP state machines",
  levels: ["intermediate"],
  prerequisites: ["dsa-dp-1d"],
  practice: [
    "ex-house-robber",
    "ex-best-time-to-buy-and-sell-stock",
    "ex-stock-ii-unlimited",
    "ex-stock-with-cooldown",
    "ex-stock-with-fee",
    "ex-stock-iii-two-transactions",
    "ex-stock-iv-k-transactions",
    "ex-paint-house",
    "ex-paint-house-ii",
    "ex-knapsack-01",
    "ex-unbounded-knapsack",
    "ex-bounded-knapsack",
    "ex-coin-change-ii",
    "ex-combination-sum-iv",
    "ex-partition-equal-subset-sum",
    "ex-target-sum",
    "ex-ones-and-zeroes",
    "ex-last-stone-weight-ii",
  ],
  ready: true,
  subtitle:
    "When one number per position cannot remember enough, keep one number per mode, and let the loop order say what you are counting.",
  body: `<h3>A state machine is a DP whose state is a mode</h3>
<p>
  In the 1D chapter the state was a position: <code>dp[i]</code> was the best
  answer for the first <code>i</code> items. That works when the best answer
  for a prefix is all the future needs to know. Often it is not. In "buy and
  sell a stock" the future needs to know <em>whether you are holding a
  share</em>. In "paint houses so no two neighbours match" it needs to know
  <em>what colour the last house got</em>. The best profit of the prefix does
  not say either of those things, and two prefixes with the same best number
  can lead to different futures.
</p>
<p>
  The fix is not a new idea, it is a wider state. Keep <b>one number per
  mode</b>: <code>dp[i][mode]</code> is the best result after the first
  <code>i</code> items while being in that mode. The modes are few (two, three,
  a handful), so you do not need a table: the numbers for item <code>i</code>
  depend only on the numbers for item <code>i - 1</code>, and a few variables
  carry the whole DP. Drawn as a picture, the modes are boxes and the allowed
  moves between them are arrows, which is why this family is called a
  <b>state machine</b>.
</p>
<p>
  The second half of the chapter is the <b>knapsack family</b>: "choose items
  under a budget". There the extra information is the budget left, and the
  whole family turns on one tiny decision: in which direction the inner loop
  runs, and whether the items or the budget sit in the outer loop. Both halves
  use the same recipe, so here it is once.
</p>
<div class="sticky mint">
  <span class="ttl">The recipe for a state machine</span>
  <ol>
    <li>List the <b>modes</b> you can be in at the end of a step. Keep the list as short as the problem lets you.</li>
    <li>Draw an <b>arrow</b> for every legal move between modes (and from a mode to itself). Write what the move gains or costs on the arrow. A move that is illegal simply has no arrow.</li>
    <li>The new value of a mode is the <b>best over the arrows pointing into it</b>: the old value of the mode the arrow starts in, plus the arrow's gain.</li>
    <li>Set the starting values: the mode you begin in gets 0, every mode you cannot be in yet gets <code>-Infinity</code> (or <code>Infinity</code> when minimising).</li>
    <li>The answer is the best value among the modes that are allowed to be the last one.</li>
  </ol>
</div>

<h3>Warm-up: House Robber is a two-mode machine</h3>
<p>
  You have already solved this: houses in a row, each with some money, and you
  may not rob two houses that are next to each other. The earlier version kept
  the best total "up to house i". Here is the same problem with the modes
  written out. After deciding on house <code>i</code> you are in exactly one of
  two modes: <b>skipped</b> (you did not rob house <code>i</code>) or
  <b>robbed</b> (you did).
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="A two mode state machine for house robber. From the skipped mode you can skip again or rob. From the robbed mode you can only skip. There is no arrow from robbed back to robbed.">
    <g class="rough">
      <rect class="box" x="90" y="80" width="150" height="56" />
      <rect class="boxg" x="400" y="80" width="150" height="56" />
    </g>
    <path class="ln" d="M240,98 C 290,70 350,70 398,98" marker-end="url(#dgarrow5)" />
    <path class="ln" d="M398,120 C 350,150 290,150 242,120" marker-end="url(#dgarrow5)" />
    <path class="ln" d="M130,80 C 110,20 220,20 200,78" marker-end="url(#dgarrow5)" />
    <defs>
      <marker id="dgarrow5" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="165" y="114" text-anchor="middle">skipped</text>
    <text class="lbl" x="475" y="114" text-anchor="middle">robbed</text>
    <text class="sm" x="320" y="62" text-anchor="middle">rob house i: + nums[i]</text>
    <text class="sm" x="320" y="170" text-anchor="middle">skip house i: + 0</text>
    <text class="sm" x="165" y="22" text-anchor="middle">skip again: + 0</text>
    <text class="sm rd" x="475" y="170" text-anchor="middle">no arrow robbed → robbed:</text>
    <text class="sm rd" x="475" y="190" text-anchor="middle">two neighbours are not allowed</text>
  </svg>
  <figcaption>The rule "no two neighbours" is the missing arrow. Everything else is read off the picture: the new <em>robbed</em> value comes only from <em>skipped</em>, the new <em>skipped</em> value from either.</figcaption>
</figure>
<pre><code>function robModes(nums) {
  let skipped = 0;         <span class="c">// best total when the last house looked at was skipped</span>
  let robbed = -Infinity;  <span class="c">// best total when the last house was robbed; impossible before any house</span>
  for (const x of nums) {
    [skipped, robbed] = [Math.max(skipped, robbed), skipped + x];
  }
  return Math.max(skipped, robbed);
}</code></pre>
<p class="sub">
  The two new values are computed in one destructuring assignment so that both
  read the <em>old</em> <code>skipped</code>. If you wrote them as two separate
  statements, the second would see the first one's new value and the
  recurrence would be wrong. This habit matters again in the cooldown problem.
</p>
<h4>Dry run: robModes([2, 7, 9, 3, 1])</h4>
<table>
  <tr><th>house</th><th>skipped</th><th>robbed</th><th>why</th></tr>
  <tr><td>start</td><td>0</td><td>−∞</td><td>nothing looked at, nothing robbed</td></tr>
  <tr><td>2</td><td>0</td><td>2</td><td>skip: max(0, −∞) = 0; rob: 0 + 2</td></tr>
  <tr><td>7</td><td>2</td><td>7</td><td>skip: max(0, 2) = 2; rob: old skipped 0 + 7</td></tr>
  <tr><td>9</td><td>7</td><td>11</td><td>skip: max(2, 7) = 7; rob: old skipped 2 + 9</td></tr>
  <tr><td>3</td><td>11</td><td>10</td><td>skip: max(7, 11) = 11; rob: old skipped 7 + 3</td></tr>
  <tr><td>1</td><td>11</td><td>12</td><td>skip: max(11, 10) = 11; rob: old skipped 11 + 1</td></tr>
</table>
<p class="sub">
  The answer is <code>max(11, 12) = 12</code>, from robbing the houses worth 2,
  9 and 1. The same code is O(n) time and O(1) space. It is also the shape of
  the next problem, only with a different set of arrows.
</p>

<h3>Buy and sell a stock: one machine, many variants</h3>
<p>
  You get a list of daily <code>prices</code>. You may buy and sell, holding at
  most one share at a time, and you want the largest total profit. The six
  well-known versions of this problem differ only in a rule about
  transactions: one allowed, unlimited, a cooldown day after each sale, a fee
  per sale, at most two, at most <code>k</code>. Learn them as one machine with
  the arrows changed, and you do not have to memorise six solutions.
</p>
<p>
  <b>Why the naive way fails.</b> Choosing the best pair of days for a single
  transaction is a double loop, O(n²), and still easy. Choosing a set of
  non-overlapping buy and sell days for the unlimited version is a choice from
  a number of possibilities that grows exponentially, and plain recursion
  repeats the same suffix again and again. The state that repeats is tiny: the
  day, and whether you hold a share. That is the whole DP.
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="A two mode stock machine. Free means no share held, held means one share. Buy moves from free to held and costs the price. Sell moves from held to free and earns the price. Each mode also has an arrow to itself for doing nothing.">
    <g class="rough">
      <rect class="box" x="90" y="80" width="150" height="56" />
      <rect class="boxg" x="400" y="80" width="150" height="56" />
    </g>
    <path class="ln" d="M240,98 C 290,70 350,70 398,98" marker-end="url(#dgarrow6)" />
    <path class="ln" d="M398,120 C 350,150 290,150 242,120" marker-end="url(#dgarrow6)" />
    <path class="ln" d="M130,80 C 110,20 220,20 200,78" marker-end="url(#dgarrow6)" />
    <path class="ln" d="M440,80 C 420,20 530,20 510,78" marker-end="url(#dgarrow6)" />
    <defs>
      <marker id="dgarrow6" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="165" y="114" text-anchor="middle">free</text>
    <text class="lbl" x="475" y="114" text-anchor="middle">held</text>
    <text class="sm" x="320" y="62" text-anchor="middle">buy: − price</text>
    <text class="sm" x="320" y="170" text-anchor="middle">sell: + price</text>
    <text class="sm" x="165" y="22" text-anchor="middle">wait: 0</text>
    <text class="sm" x="475" y="22" text-anchor="middle">wait: 0</text>
    <text class="sm" x="320" y="198" text-anchor="middle">free = no share in hand · held = one share in hand</text>
  </svg>
  <figcaption>Each day every mode picks its best incoming arrow. The answer is the value of <em>free</em> on the last day, because a share still held is worth nothing.</figcaption>
</figure>

<h3>Unlimited transactions (the "II" version)</h3>
<p>
  Read the new values off the picture. You are <b>free</b> after today if you
  were free yesterday and waited, or were holding yesterday and sold at today's
  price. You are <b>held</b> after today if you were holding and waited, or were
  free and bought at today's price.
</p>
<pre><code>function maxProfitUnlimited(prices) {
  let held = -Infinity; <span class="c">// best profit while holding a share; impossible before the first day</span>
  let free = 0;         <span class="c">// best profit while holding nothing</span>
  for (const p of prices) {
    [held, free] = [Math.max(held, free - p), Math.max(free, held + p)];
  }
  return free;
}</code></pre>
<h4>Dry run: prices [7, 1, 5, 3, 6, 4]</h4>
<table>
  <tr><th>day</th><th>price</th><th>held</th><th>free</th><th>what happened</th></tr>
  <tr><td>start</td><td></td><td>−∞</td><td>0</td><td></td></tr>
  <tr><td>1</td><td>7</td><td>−7</td><td>0</td><td>buying at 7 is the only way to hold</td></tr>
  <tr><td>2</td><td>1</td><td>−1</td><td>0</td><td>buy at 1 beats the buy at 7</td></tr>
  <tr><td>3</td><td>5</td><td>−1</td><td>4</td><td>sell the share bought at 1: −1 + 5</td></tr>
  <tr><td>4</td><td>3</td><td>1</td><td>4</td><td>buy again from free 4: 4 − 3</td></tr>
  <tr><td>5</td><td>6</td><td>1</td><td>7</td><td>sell that share: 1 + 6</td></tr>
  <tr><td>6</td><td>4</td><td>3</td><td>7</td><td>holding is still possible, but free stays 7</td></tr>
</table>
<p class="sub">
  The answer is 7, which is (5 − 1) + (6 − 3). The machine never decided in
  advance which days to trade on; it kept the best value for each mode and let
  the last day pick. It runs in O(n) time and O(1) space.
</p>

<h3>One transaction (the "I" version)</h3>
<p>
  Now you may buy once and sell once. The only change is on the buying arrow:
  you can no longer buy from a <em>free</em> mode that has already earned
  something, because a second purchase would be a second transaction. Before the
  one purchase you have earned exactly 0, so the buying arrow starts from a
  constant 0 and not from <code>free</code>.
</p>
<pre><code>function maxProfitOnce(prices) {
  let held = -Infinity; <span class="c">// best profit holding the one share we may buy</span>
  let free = 0;         <span class="c">// best profit after selling it, or 0 if we never trade</span>
  for (const p of prices) {
    [held, free] = [Math.max(held, -p), Math.max(free, held + p)];
  }
  return free;
}</code></pre>
<p class="sub">
  On [7, 1, 5, 3, 6, 4] the <code>held</code> column becomes −7, −1, −1, −1, −1,
  −1 (the cheapest price seen so far, negated) and <code>free</code> becomes 0,
  0, 4, 4, 5, 5. The answer is 5. This is the "track the minimum so far" loop
  you may know, seen as a machine: <code>-held</code> is that minimum.
</p>

<h3>A fee on every transaction</h3>
<p>
  Each sale costs a fixed <code>fee</code>. Put the fee on the selling arrow:
  selling now gives <code>price - fee</code> instead of <code>price</code>. The
  fee is paid once per transaction, so it belongs on one of the two arrows, not
  on both.
</p>
<pre><code>function maxProfitWithFee(prices, fee) {
  let held = -Infinity;
  let free = 0;
  for (const p of prices) {
    [held, free] = [Math.max(held, free - p), Math.max(free, held + p - fee)];
  }
  return free;
}</code></pre>
<h4>Dry run: prices [1, 3, 2, 8, 4, 9] with fee 2</h4>
<table>
  <tr><th>day</th><th>price</th><th>held</th><th>free</th><th>what happened</th></tr>
  <tr><td>1</td><td>1</td><td>−1</td><td>0</td><td>buy at 1</td></tr>
  <tr><td>2</td><td>3</td><td>−1</td><td>0</td><td>selling would earn −1 + 3 − 2 = 0, no gain</td></tr>
  <tr><td>3</td><td>2</td><td>−1</td><td>0</td><td>nothing better</td></tr>
  <tr><td>4</td><td>8</td><td>−1</td><td>5</td><td>sell: −1 + 8 − 2</td></tr>
  <tr><td>5</td><td>4</td><td>1</td><td>5</td><td>buy at 4 from free 5</td></tr>
  <tr><td>6</td><td>9</td><td>1</td><td>8</td><td>sell: 1 + 9 − 2</td></tr>
</table>
<p class="sub">
  The answer is 8: buy at 1 and sell at 8 for 7 − 2 = 5, buy at 4 and sell at
  9 for 5 − 2 = 3. The machine had to refuse the small rise on day 2, because
  that trade would have earned nothing after the fee. A rule like "add up every
  rise" does not carry over to the fee version without changes, but the machine
  does, because only one arrow changed.
</p>

<h3>A cooldown day after each sale: a third mode</h3>
<p>
  After you sell you must wait one full day before buying again. "I sold
  yesterday" is now a fact the future needs, and neither <em>free</em> nor
  <em>held</em> remembers it. So add a mode. There are three: <b>held</b>,
  <b>sold</b> (you sold today, so tomorrow you cannot buy), and <b>rest</b>
  (you hold nothing and may buy tomorrow).
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A three mode stock machine with a cooldown. Rest moves to held by buying. Held moves to sold by selling. Sold moves to rest with no gain, which is the forced cooldown day. Rest and held each have an arrow to themselves for waiting. There is no arrow from sold to held.">
    <g class="rough">
      <rect class="box" x="20" y="80" width="130" height="56" />
      <rect class="boxg" x="255" y="80" width="130" height="56" />
      <rect class="boxy" x="490" y="80" width="130" height="56" />
    </g>
    <path class="ln" d="M150,100 L253,100" marker-end="url(#dgarrow7)" />
    <path class="ln" d="M385,100 L488,100" marker-end="url(#dgarrow7)" />
    <path class="ln" d="M555,138 C 540,215 100,215 85,138" marker-end="url(#dgarrow7)" />
    <path class="ln" d="M50,80 C 30,20 140,20 120,78" marker-end="url(#dgarrow7)" />
    <path class="ln" d="M285,80 C 265,20 375,20 355,78" marker-end="url(#dgarrow7)" />
    <defs>
      <marker id="dgarrow7" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="85" y="114" text-anchor="middle">rest</text>
    <text class="lbl" x="320" y="114" text-anchor="middle">held</text>
    <text class="lbl" x="555" y="114" text-anchor="middle">sold</text>
    <text class="sm" x="201" y="92" text-anchor="middle">buy: − p</text>
    <text class="sm" x="436" y="92" text-anchor="middle">sell: + p</text>
    <text class="sm" x="320" y="232" text-anchor="middle">cooldown day: + 0 (the only way out of sold)</text>
    <text class="sm" x="85" y="22" text-anchor="middle">wait: 0</text>
    <text class="sm" x="320" y="22" text-anchor="middle">wait: 0</text>
    <text class="sm rd" x="555" y="160" text-anchor="middle">no arrow sold → held</text>
  </svg>
  <figcaption>The cooldown is the missing arrow from <em>sold</em> to <em>held</em>. The only way out of <em>sold</em> is one step to <em>rest</em>, and you buy from <em>rest</em>.</figcaption>
</figure>
<pre><code>function maxProfitCooldown(prices) {
  let held = -Infinity; <span class="c">// holding a share</span>
  let sold = -Infinity; <span class="c">// sold today, must rest tomorrow</span>
  let rest = 0;         <span class="c">// holding nothing and free to buy</span>
  for (const p of prices) {
    [held, sold, rest] = [Math.max(held, rest - p), held + p, Math.max(rest, sold)];
  }
  return Math.max(sold, rest);
}</code></pre>
<p>
  Read the three new values from the arrows pointing into each box. <b>held</b>
  comes from <em>held</em> (wait) or from <em>rest</em> (buy). <b>sold</b>
  comes only from <em>held</em> (sell). <b>rest</b> comes from <em>rest</em>
  (wait) or from <em>sold</em> (the cooldown day passing). The answer takes
  <code>max(sold, rest)</code> because ending in <em>held</em> wastes the
  share.
</p>
<h4>Dry run: prices [1, 2, 3, 0, 2]</h4>
<table>
  <tr><th>day</th><th>price</th><th>held</th><th>sold</th><th>rest</th><th>what happened</th></tr>
  <tr><td>start</td><td></td><td>−∞</td><td>−∞</td><td>0</td><td></td></tr>
  <tr><td>1</td><td>1</td><td>−1</td><td>−∞</td><td>0</td><td>buy at 1 from rest</td></tr>
  <tr><td>2</td><td>2</td><td>−1</td><td>1</td><td>0</td><td>sell: −1 + 2</td></tr>
  <tr><td>3</td><td>3</td><td>−1</td><td>2</td><td>1</td><td>sell later is better (2); yesterday's sale lets rest become 1</td></tr>
  <tr><td>4</td><td>0</td><td>1</td><td>−1</td><td>2</td><td>buy at 0 from rest 1; rest becomes 2 (yesterday's sold)</td></tr>
  <tr><td>5</td><td>2</td><td>1</td><td>3</td><td>2</td><td>sell: 1 + 2</td></tr>
</table>
<p class="sub">
  The answer is <code>max(3, 2) = 3</code>: buy at 1, sell at 2, rest on day 3,
  buy at 0, sell at 2, for 1 + 2. Selling on day 3 instead earns 2, but then
  day 4 is the forced rest day and the cheap price of 0 cannot be used.
</p>
<div class="warn">
  <span class="ttl">⚠ Every mode must read yesterday's numbers</span>
  In the cooldown machine, <code>sold</code> is computed from the old
  <code>held</code>, and <code>held</code> from the old <code>rest</code>.
  Written as separate statements in the "natural" order
  (<code>held = ...; sold = held + p; ...</code>), the new <code>held</code>
  leaks into <code>sold</code> and the new <code>sold</code> into <code>rest</code>,
  so a share sold today can be bought again tomorrow. On prices <code>[0, 1, 0, 1]</code> that version
  returns 2 where the true answer is 1. Keep the one destructuring assignment,
  or copy the old values into constants first. The same leak does not change
  the answer in the two-mode versions, but do not rely on that, because it is
  a different argument each time.
</div>

<h3>At most two, or at most k, transactions</h3>
<p>
  With a limit on the <em>number</em> of transactions the counter joins the
  state: you need to know how many you have used. Make one pair of modes for
  each count. Let <code>held[j]</code> be the best profit while holding a share
  that was bought as the <code>j</code>-th transaction, and <code>free[j]</code>
  the best profit holding nothing after at most <code>j</code> sales. Selling
  as the <code>j</code>-th transaction goes from <code>held[j]</code> to
  <code>free[j]</code>; buying the <code>j</code>-th goes from
  <code>free[j - 1]</code> to <code>held[j]</code>, and <code>free[0]</code> is
  0. For at most two transactions, unroll the loop over the counts and you have
  four variables:
</p>
<pre><code>function maxProfitTwice(prices) {
  let held1 = -Infinity, free1 = 0;
  let held2 = -Infinity, free2 = 0;
  for (const p of prices) {
    held1 = Math.max(held1, -p);
    free1 = Math.max(free1, held1 + p);
    held2 = Math.max(held2, free1 - p);
    free2 = Math.max(free2, held2 + p);
  }
  return free2;
}</code></pre>
<p>
  This code does reuse the new <code>free1</code> inside <code>held2</code>,
  which breaks the "read yesterday" rule above. It is still correct, and the
  reason is worth saying out loud. The new <code>free1</code> may include a sale
  made today, and <code>held2</code> then buys today, so the machine has sold
  and bought on the same day. That pair of trades earns exactly 0 and can be
  deleted from the plan, which leaves a plan with fewer transactions. The
  recurrences were defined as "at most", so such a plan is allowed and the
  value is real.
</p>
<h4>Dry run: prices [3, 3, 5, 0, 0, 3, 1, 4]</h4>
<table>
  <tr><th>day</th><th>price</th><th>held1</th><th>free1</th><th>held2</th><th>free2</th></tr>
  <tr><td>1</td><td>3</td><td>−3</td><td>0</td><td>−3</td><td>0</td></tr>
  <tr><td>2</td><td>3</td><td>−3</td><td>0</td><td>−3</td><td>0</td></tr>
  <tr><td>3</td><td>5</td><td>−3</td><td>2</td><td>−3</td><td>2</td></tr>
  <tr><td>4</td><td>0</td><td>0</td><td>2</td><td>2</td><td>2</td></tr>
  <tr><td>5</td><td>0</td><td>0</td><td>2</td><td>2</td><td>2</td></tr>
  <tr><td>6</td><td>3</td><td>0</td><td>3</td><td>2</td><td>5</td></tr>
  <tr><td>7</td><td>1</td><td>0</td><td>3</td><td>2</td><td>5</td></tr>
  <tr><td>8</td><td>4</td><td>0</td><td>4</td><td>2</td><td>6</td></tr>
</table>
<p class="sub">
  The answer is 6: buy at 0 and sell at 3 for 3, then buy at 1 and sell at 4 for
  3. Day 4 is where the second transaction becomes useful:
  <code>held2 = free1 - 0 = 2</code> means "already earned 2 from the first
  trade, and own a share bought for nothing".
</p>
<p>
  The general version loops over the counts. Two details decide whether it
  passes. First, <code>k</code> can be far larger than the number of days, and
  a transaction needs two days, so at most <code>floor(n / 2)</code>
  transactions are ever useful. When <code>k</code> is at least that, the limit
  does not bind and the unlimited machine gives the answer; without this check
  an input with <code>k = 10<sup>9</sup></code> would try to allocate a billion
  slots. Second, the counts are an inner loop of <code>k</code> steps per day.
</p>
<pre><code>function maxProfitK(k, prices) {
  const n = prices.length;
  if (k === 0 || n &lt; 2) return 0;
  if (k &gt;= Math.floor(n / 2)) return maxProfitUnlimited(prices);

  const held = new Array(k + 1).fill(-Infinity);
  const free = new Array(k + 1).fill(0);
  for (const p of prices) {
    for (let j = 1; j &lt;= k; j++) {
      held[j] = Math.max(held[j], free[j - 1] - p);
      free[j] = Math.max(free[j], held[j] + p);
    }
  }
  return free[k];
}</code></pre>
<p class="sub">
  Time is O(n · min(k, n/2)) and space is O(min(k, n/2)). The two-transaction
  function above is this one with <code>k = 2</code> written out, and the same
  remark about buying and selling on one day applies to it. The one, unlimited,
  fee and cooldown versions are the same machine with the arrows changed, and
  the table below puts them side by side.
</p>
<table>
  <tr><th>Variant</th><th>Modes</th><th>What changes on the arrows</th><th>Time</th><th>Space</th></tr>
  <tr><td>Unlimited</td><td>free, held</td><td>buy from free: − p; sell from held: + p</td><td>O(n)</td><td>O(1)</td></tr>
  <tr><td>One transaction</td><td>free, held</td><td>buy starts from the constant 0, not from free</td><td>O(n)</td><td>O(1)</td></tr>
  <tr><td>Fee per transaction</td><td>free, held</td><td>sell earns p − fee</td><td>O(n)</td><td>O(1)</td></tr>
  <tr><td>Cooldown</td><td>held, sold, rest</td><td>sold has one outgoing arrow, to rest</td><td>O(n)</td><td>O(1)</td></tr>
  <tr><td>At most k</td><td>held[j], free[j] for each j</td><td>buy j-th from free[j − 1]</td><td>O(n · min(k, n/2))</td><td>O(min(k, n/2))</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "The state is the day plus what I
  am holding, so I will keep the best profit per mode and move one day at a
  time. For the cooldown I add a mode for 'sold today', and the cooldown is
  just that mode having one exit. Each day's numbers depend only on the
  previous day's, so it is O(n) time and O(1) space."
</div>

<h3>Paint House: the mode is the colour of the last house</h3>
<p>
  Each house is painted red, blue or green, with a cost for each colour on each
  house, and two neighbouring houses must not share a colour. Find the cheapest
  way to paint them all. The best cost of the first <code>i</code> houses does
  not tell you what you can do for house <code>i + 1</code>, because the cheapest
  prefix may end in the very colour you now need to avoid. So make the colour
  the mode: <code>cost[c]</code> is the cheapest way to paint the houses so far
  with the last one in colour <code>c</code>.
</p>
<pre><code>function paintHouse(costs) {
  let red = 0, blue = 0, green = 0;
  for (const [r, b, g] of costs) {
    [red, blue, green] = [
      r + Math.min(blue, green),
      b + Math.min(red, green),
      g + Math.min(red, blue),
    ];
  }
  return Math.min(red, blue, green);
}</code></pre>
<p>
  The arrows are "any colour except my own": each new colour value is that
  house's cost plus the cheaper of the <em>other</em> two previous values. Once
  again all three read the previous row, hence the single assignment.
</p>
<h4>Dry run: costs [[17, 2, 17], [16, 16, 5], [14, 3, 19]]</h4>
<table>
  <tr><th>house</th><th>costs r, b, g</th><th>red</th><th>blue</th><th>green</th></tr>
  <tr><td>1</td><td>17, 2, 17</td><td>17</td><td>2</td><td>17</td></tr>
  <tr><td>2</td><td>16, 16, 5</td><td>16 + min(2, 17) = 18</td><td>16 + min(17, 17) = 33</td><td>5 + min(17, 2) = 7</td></tr>
  <tr><td>3</td><td>14, 3, 19</td><td>14 + min(33, 7) = 21</td><td>3 + min(18, 7) = 10</td><td>19 + min(18, 33) = 37</td></tr>
</table>
<p class="sub">
  The answer is <code>min(21, 10, 37) = 10</code>: blue, green, blue for 2 + 5 +
  3. O(n) time, O(1) space.
</p>
<p>
  With <code>k</code> colours the same idea costs O(n · k²) if each colour scans
  the others. To get O(n · k), notice that a colour needs "the best previous
  value excluding my own colour". Keep the smallest previous value, which colour
  gave it, and the second smallest. A colour that is not the smallest's colour
  takes the smallest; the smallest's own colour takes the second smallest.
</p>
<pre><code>function paintHouseK(costs) {
  if (costs.length === 0) return 0;
  const k = costs[0].length;
  let prev = costs[0]; <span class="c">// the first house has no neighbour to avoid</span>
  for (let i = 1; i &lt; costs.length; i++) {
    let min1 = Infinity, min2 = Infinity, minColor = -1;
    for (let c = 0; c &lt; k; c++) {
      if (prev[c] &lt; min1) {
        min2 = min1;
        min1 = prev[c];
        minColor = c;
      } else if (prev[c] &lt; min2) {
        min2 = prev[c];
      }
    }
    prev = costs[i].map((cost, c) =&gt; cost + (c === minColor ? min2 : min1));
  }
  return Math.min(...prev);
}</code></pre>
<p class="sub">
  If two colours tie for the smallest, the second one lands in <code>min2</code>
  through the <code>else if</code>, so the tie is handled. With one colour and
  more than one house the answer is <code>Infinity</code>, which is the honest
  answer: it cannot be done. O(n · k) time, O(k) space.
</p>

<h3>0/1 knapsack, and why the inner loop runs backwards</h3>
<p>
  The second half of the chapter starts from a problem you met in the 2D
  chapter. You have <code>n</code> items, each with a weight and a value, and a
  bag that holds <code>capacity</code> weight. Each item can be taken at most
  once. Maximise the total value. Greedy by value per weight fails: with
  capacity 50 and items (weight 10, value 60), (20, 100), (30, 120), the best
  ratio picks the first two for 160, but the second and third make 220. Trying
  every subset is 2ⁿ, so the DP is the answer.
</p>
<p>
  The 2D table was <code>dp[i][w]</code>: the best value using only the first
  <code>i</code> items with capacity <code>w</code>. Each row is computed from
  the row above it:
</p>
<pre><code>dp[i][w] = max(dp[i-1][w], dp[i-1][w - weight[i-1]] + value[i-1])</code></pre>
<p>
  Notice that row <code>i</code> never looks at row <code>i - 2</code> or older.
  So one array is enough, if each pass over the items turns the previous row
  into the next row <em>in place</em>. Whether that works depends entirely on
  the order in which the cells of the pass are visited.
</p>
<pre><code>function knapsack01(weights, values, capacity) {
  const best = new Array(capacity + 1).fill(0); <span class="c">// best[w]: best value with room w, items so far</span>
  for (let i = 0; i &lt; weights.length; i++) {
    for (let w = capacity; w &gt;= weights[i]; w--) { <span class="c">// backwards: high w first</span>
      best[w] = Math.max(best[w], best[w - weights[i]] + values[i]);
    }
  }
  return best[capacity];
}</code></pre>
<h3>The proof that the direction is not a style choice</h3>
<p>
  Call the array's content <em>row i</em> before the pass for item
  <code>i</code> begins, meaning <code>best[w]</code> equals the 2D value
  <code>dp[i][w]</code> for every <code>w</code>. We need it to equal
  <code>dp[i+1][w]</code> afterwards.
</p>
<p>
  The new value at <code>w</code> needs two old values: <code>dp[i][w]</code>,
  which is sitting in <code>best[w]</code>, and <code>dp[i][w - wt]</code>,
  which is sitting in <code>best[w - wt]</code>, <em>provided that cell still
  holds row i</em>. The backward loop makes that true. When the loop is at
  index <code>w</code>, it has written only indices greater than <code>w</code>
  (it started at the top and has been counting down). The cell
  <code>w - wt</code> is below <code>w</code>, since <code>wt</code> is at
  least 1, so it has not been touched in this pass and still holds row i. (A weight of
  0 reads the very cell it is about to write, and the read happens first.) The
  value written is therefore exactly <code>dp[i+1][w]</code>. Cells below
  <code>wt</code> are never written, and they should not change, because the
  item does not fit in so little room. After the pass the array is row
  <code>i + 1</code>, and the argument repeats for the next item.
</p>
<p>
  Now run the loop the other way, from <code>w = wt</code> up to
  <code>capacity</code>. At index <code>w</code> the cell <code>w - wt</code> is
  below it, so it <em>has</em> already been written in this pass: it holds
  row <code>i + 1</code>, a state in which item <code>i</code> may already be in
  the bag. Reading it and adding the item's value takes the item a second time.
  The forward loop computes
  <code>new[w] = max(old[w], new[w - wt] + value)</code>, and that is a
  different problem, in which each item can be used any number of times. That
  problem has a name and a chapter section of its own, below.
</p>
<figure>
  <svg viewBox="0 0 640 330" class="dg" role="img" aria-label="Two rows of eight cells numbered 0 to 7, for an item of weight 3. In the backward pass, cells 5, 6 and 7 are already updated and the cell being computed, cell 4, reads cell 1, which still holds the old row. In the forward pass, cells 3, 4, 5 and 6 are already updated and the cell being computed, cell 7, reads cell 4, which has already been overwritten with the new row.">
    <text class="lbl" x="20" y="24">backward: computing cell 4 (weight 3)</text>
    <g class="rough">
      <rect class="box" x="20" y="40" width="64" height="44" />
      <rect class="box" x="84" y="40" width="64" height="44" />
      <rect class="box" x="148" y="40" width="64" height="44" />
      <rect class="box" x="212" y="40" width="64" height="44" />
      <rect class="boxy" x="276" y="40" width="64" height="44" />
      <rect class="boxg" x="340" y="40" width="64" height="44" />
      <rect class="boxg" x="404" y="40" width="64" height="44" />
      <rect class="boxg" x="468" y="40" width="64" height="44" />
    </g>
    <text class="lbl" x="52" y="68" text-anchor="middle">0</text>
    <text class="lbl" x="116" y="68" text-anchor="middle">1</text>
    <text class="lbl" x="180" y="68" text-anchor="middle">2</text>
    <text class="lbl" x="244" y="68" text-anchor="middle">3</text>
    <text class="lbl" x="308" y="68" text-anchor="middle">4</text>
    <text class="lbl" x="372" y="68" text-anchor="middle">5</text>
    <text class="lbl" x="436" y="68" text-anchor="middle">6</text>
    <text class="lbl" x="500" y="68" text-anchor="middle">7</text>
    <path class="ln" d="M116,92 C 150,125 270,125 304,92" marker-end="url(#dgarrow8)" />
    <text class="sm" x="210" y="118" text-anchor="middle">reads cell 1: still the old row</text>
    <text class="sm gr" x="436" y="108" text-anchor="middle">green = already rewritten this pass</text>
    <text class="lbl" x="20" y="184">forward: computing cell 7 (weight 3)</text>
    <g class="rough">
      <rect class="box" x="20" y="200" width="64" height="44" />
      <rect class="box" x="84" y="200" width="64" height="44" />
      <rect class="box" x="148" y="200" width="64" height="44" />
      <rect class="boxg" x="212" y="200" width="64" height="44" />
      <rect class="boxr" x="276" y="200" width="64" height="44" />
      <rect class="boxg" x="340" y="200" width="64" height="44" />
      <rect class="boxg" x="404" y="200" width="64" height="44" />
      <rect class="boxy" x="468" y="200" width="64" height="44" />
    </g>
    <text class="lbl" x="52" y="228" text-anchor="middle">0</text>
    <text class="lbl" x="116" y="228" text-anchor="middle">1</text>
    <text class="lbl" x="180" y="228" text-anchor="middle">2</text>
    <text class="lbl" x="244" y="228" text-anchor="middle">3</text>
    <text class="lbl" x="308" y="228" text-anchor="middle">4</text>
    <text class="lbl" x="372" y="228" text-anchor="middle">5</text>
    <text class="lbl" x="436" y="228" text-anchor="middle">6</text>
    <text class="lbl" x="500" y="228" text-anchor="middle">7</text>
    <path class="lnr" d="M500,252 C 460,290 350,290 312,252" marker-end="url(#dgarrow8)" />
    <text class="sm rd" x="406" y="312" text-anchor="middle">reads cell 4: already the new row, so the item can be taken twice</text>
    <defs>
      <marker id="dgarrow8" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
  </svg>
  <figcaption>Yellow is the cell being computed, green cells were already rewritten in this pass. Going down, the cell to read sits below every rewritten cell. Going up, it sits among them.</figcaption>
</figure>
<h4>Dry run: weights [1, 3, 4, 5], values [1, 4, 5, 7], capacity 7</h4>
<p>
  The array after each item, with columns for <code>w = 0</code> to
  <code>7</code>. The first row is the start.
</p>
<table>
  <tr><th>after item</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
  <tr><td>none</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>weight 1, value 1</td><td>0</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><td>weight 3, value 4</td><td>0</td><td>1</td><td>1</td><td>4</td><td>5</td><td>5</td><td>5</td><td>5</td></tr>
  <tr><td>weight 4, value 5</td><td>0</td><td>1</td><td>1</td><td>4</td><td>5</td><td>6</td><td>6</td><td>9</td></tr>
  <tr><td>weight 5, value 7</td><td>0</td><td>1</td><td>1</td><td>4</td><td>5</td><td>7</td><td>8</td><td>9</td></tr>
</table>
<p class="sub">
  The answer is <code>best[7] = 9</code>, from the items of weight 3 and 4 (4 + 5).
  Look at the weight-1 row: with capacity 2 the value is still 1, because the
  one item of weight 1 cannot be taken twice. Hold on to that cell: in the
  unbounded version below it becomes 2.
</p>
<p>
  To see the bug rather than believe the proof, take a single item of weight 3
  and value 5 and a capacity of 9. Run the loop upwards and you get a "best" of
  15, three copies of an item that exists once.
</p>
<pre><code>function knapsackForwardBug(weights, values, capacity) {
  const best = new Array(capacity + 1).fill(0);
  for (let i = 0; i &lt; weights.length; i++) {
    for (let w = weights[i]; w &lt;= capacity; w++) { <span class="c">// WRONG direction for 0/1</span>
      best[w] = Math.max(best[w], best[w - weights[i]] + values[i]);
    }
  }
  return best[capacity];
}

console.log(knapsack01([3], [5], 9));        <span class="c">// 5</span>
console.log(knapsackForwardBug([3], [5], 9)); <span class="c">// 15</span></code></pre>
<p>
  <b>Cost.</b> The loops do <code>n</code> passes of up to
  <code>capacity</code> steps: O(n · C) time and O(C) space, against O(n · C)
  space for the 2D table. This is <em>pseudo-polynomial</em>: the running time
  depends on the <em>value</em> of <code>C</code>, not on the number of bits
  needed to write it. A capacity of 10⁹ is a one-line input and a billion-cell
  array, so check the constraints before you choose this DP.
</p>
<div class="warn">
  <span class="ttl">⚠ "At most capacity" versus "exactly capacity"</span>
  Starting with an all-zero array means <code>best[w]</code> is the best value
  for weight <em>at most</em> <code>w</code>, because an empty bag is a valid
  answer for every <code>w</code>. If the problem needs the weight to be
  <em>exactly</em> <code>w</code> (fill the bag, or hit a target sum), start
  with <code>best[0] = 0</code> and every other cell <code>-Infinity</code>
  (maximising) or <code>Infinity</code> (minimising), or use a boolean array
  with <code>reach[0] = true</code>. The loops are identical, only the start
  changes, and a wrong start gives a plausible wrong number.
</div>
<div class="warn">
  <span class="ttl">⚠ The cheap mistakes in the knapsack loop</span>
  <ul>
    <li>The lower bound of the backward loop is <code>weights[i]</code>, not 0. Below it <code>w - weight</code> is negative, and <code>best[-1]</code> is <code>undefined</code>, so the arithmetic quietly becomes <code>NaN</code>.</li>
    <li>Weights and the capacity must be non-negative integers to index an array. A fractional weight needs scaling or a different method.</li>
    <li>A 2D table made with <code>new Array(m).fill(new Array(n).fill(0))</code> shares one row m times. Build rows with <code>Array.from({ length: m }, () =&gt; new Array(n).fill(0))</code>.</li>
    <li>To recover <em>which</em> items were taken you need the 2D table (or one bit per item and capacity). The rolling array answers "how much", not "which".</li>
  </ul>
</div>

<h3>Unbounded knapsack: the forward loop on purpose</h3>
<p>
  Now each item may be used any number of times (coins in a till, rod pieces,
  any "reusable choice"). The last section showed that the upward loop reads
  <code>new[w - wt]</code>, a row in which the item may already be in the bag.
  That is exactly the rule here: "best value with room <code>w</code> using the
  items so far, each as often as I like" equals the best of leaving the item
  out or taking one copy and solving the smaller bag with the same freedom.
</p>
<pre><code>function unboundedKnapsack(weights, values, capacity) {
  const best = new Array(capacity + 1).fill(0);
  for (let i = 0; i &lt; weights.length; i++) {
    for (let w = weights[i]; w &lt;= capacity; w++) { <span class="c">// forwards: reuse is the point</span>
      best[w] = Math.max(best[w], best[w - weights[i]] + values[i]);
    }
  }
  return best[capacity];
}</code></pre>
<p>
  The code differs from <code>knapsack01</code> in the direction of the inner
  loop and in nothing else. On the items of the last dry run the array becomes
  0 1 2 4 5 7 8 9, against 0 1 1 4 5 7 8 9 before. The first difference is at
  <code>w = 2</code>: two copies of the weight-1 item are allowed now.
</p>
<table>
  <tr><th>after item</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th></tr>
  <tr><td>weight 1, value 1</td><td>0</td><td>1</td><td>2</td><td>3</td><td>4</td><td>5</td><td>6</td><td>7</td></tr>
  <tr><td>weight 3, value 4</td><td>0</td><td>1</td><td>2</td><td>4</td><td>5</td><td>6</td><td>8</td><td>9</td></tr>
  <tr><td>weight 4, value 5</td><td>0</td><td>1</td><td>2</td><td>4</td><td>5</td><td>6</td><td>8</td><td>9</td></tr>
  <tr><td>weight 5, value 7</td><td>0</td><td>1</td><td>2</td><td>4</td><td>5</td><td>7</td><td>8</td><td>9</td></tr>
</table>
<p class="sub">
  Time O(n · C), space O(C). For a pure maximum or minimum, the unbounded
  version also works with the two loops swapped (capacity outside, items
  inside), which is how the earlier Coin Change was written. For <em>counting</em>
  the loop order changes the answer, and the next-but-one section is about
  exactly that.
</p>
<div class="warn">
  <span class="ttl">⚠ Zero weights break the unbounded loop</span>
  An item of weight 0 and positive value can be taken forever, so the true
  answer is unbounded, while the loop above adds it once per cell and returns a
  finite number. Check the constraints for positive weights, or treat zero-weight
  positive-value items separately.
</div>

<h3>Bounded knapsack: split the counts into powers of two</h3>
<p>
  Between the two extremes: item <code>i</code> exists <code>c</code> times. One
  fix is to turn it into <code>c</code> separate 0/1 items, which costs
  O(Σcᵢ · C). With counts of 10⁴ that is far too slow, and it is wasteful: you
  do not need <code>c</code> separate items, only enough pieces that every count
  from 0 to <code>c</code> can be built from a subset of them.
</p>
<p>
  Split <code>c</code> into <b>1, 2, 4, 8, ...</b> and a remainder. Pick
  <code>k</code> so that 1 + 2 + ... + 2<sup>k−1</sup> = 2<sup>k</sup> − 1 is at
  most <code>c</code> and the next power would overshoot, and let the remainder
  be <code>r = c − (2<sup>k</sup> − 1)</code>, which is less than
  2<sup>k</sup>. Every count <code>t</code> from 0 to <code>c</code> is a subset
  sum of the pieces. If <code>t ≤ 2<sup>k</sup> − 1</code>, binary writes it
  with the powers alone. Otherwise take the remainder piece <code>r</code> and
  write <code>t − r</code> with the powers: <code>t − r</code> is at most
  <code>c − r = 2<sup>k</sup> − 1</code>, and it is positive because
  <code>t</code> exceeds <code>2<sup>k</sup> − 1</code>, which is at least
  <code>r</code>. No subset of the pieces sums to more than <code>c</code>,
  because the pieces add up to exactly <code>c</code>. For <code>c = 13</code> the pieces are 1, 2,
  4 and 6, and each of 0 to 13 is a sum of some of them (12 = 2 + 4 + 6, 13 = 1
  + 2 + 4 + 6).
</p>
<pre><code>function boundedKnapsack(items, capacity) {
  const best = new Array(capacity + 1).fill(0);
  for (const { weight, value, count } of items) {
    let left = count;
    for (let piece = 1; left &gt; 0; piece *= 2) {
      const take = Math.min(piece, left);
      left -= take;
      for (let w = capacity; w &gt;= take * weight; w--) { <span class="c">// each piece is one 0/1 item: backwards</span>
        best[w] = Math.max(best[w], best[w - take * weight] + take * value);
      }
    }
  }
  return best[capacity];
}</code></pre>
<p class="sub">
  Each piece is a 0/1 item of weight <code>take * weight</code> and value
  <code>take * value</code>, so the backward loop is the one from the 0/1
  section. Time is O(Σ log cᵢ · C), space O(C).
</p>

<h3>Coin Change II: the loop order decides what you count</h3>
<p>
  Count the ways to make <code>amount</code> from unlimited coins of given
  values. The 1D chapter solved "fewest coins", where order of the loops did
  not matter. For <em>counting</em> it matters, and one swap turns "combinations"
  into "sequences". Both versions below are short, both look plausible, and
  they give different numbers for the same input.
</p>
<pre><code>function coinChangeII(amount, coins) { <span class="c">// counts combinations: 2 + 1 and 1 + 2 are the same way</span>
  const ways = new Array(amount + 1).fill(0);
  ways[0] = 1;
  for (const coin of coins) {              <span class="c">// coins OUTSIDE</span>
    for (let a = coin; a &lt;= amount; a++) {
      ways[a] += ways[a - coin];
    }
  }
  return ways[amount];
}

function countOrderedSequences(amount, coins) { <span class="c">// counts sequences: 2 + 1 and 1 + 2 are different</span>
  const ways = new Array(amount + 1).fill(0);
  ways[0] = 1;
  for (let a = 1; a &lt;= amount; a++) {          <span class="c">// amount OUTSIDE</span>
    for (const coin of coins) {
      if (coin &lt;= a) ways[a] += ways[a - coin];
    }
  }
  return ways[amount];
}

console.log(coinChangeII(5, [1, 2, 5]));          <span class="c">// 4</span>
console.log(countOrderedSequences(5, [1, 2, 5])); <span class="c">// 9</span>
console.log(coinChangeII(4, [1, 2, 3]));          <span class="c">// 4</span>
console.log(countOrderedSequences(4, [1, 2, 3])); <span class="c">// 7</span></code></pre>
<p>
  <b>Why the coins-outside loop counts combinations.</b> Let
  <code>W_k[a]</code> be the number of ways to make <code>a</code> using only
  the first <code>k</code> kinds of coin, where a "way" is a multiset (the
  order is not recorded). Take the <code>k</code>-th kind, value
  <code>c</code>. A multiset either uses no coin of this kind, giving
  <code>W_{k−1}[a]</code> ways, or uses at least one: remove one such coin and
  what is left is a multiset for <code>a − c</code> that may still use this
  kind, giving <code>W_k[a − c]</code>. So
  <code>W_k[a] = W_{k−1}[a] + W_k[a − c]</code>. That is exactly the forward
  loop: <code>ways[a]</code> still holds <code>W_{k−1}[a]</code> when it is
  updated, and <code>ways[a - c]</code> was already updated and holds
  <code>W_k[a − c]</code>. Because all the coins of one kind are handled in one
  pass, a way can only be "extended" by kinds in the order of the outer loop, so
  each multiset is produced once, in one canonical order: all the 1s, then
  the 2s, then the 5s.
</p>
<h4>Dry run: coinChangeII(5, [1, 2, 5])</h4>
<table>
  <tr><th>after coin</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th></tr>
  <tr><td>start</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>1</td><td>1</td><td>2</td><td>2</td><td>3</td><td>3</td></tr>
  <tr><td>5</td><td>1</td><td>1</td><td>2</td><td>2</td><td>3</td><td>4</td></tr>
</table>
<p class="sub">
  The four ways to make 5 are 5; 2+2+1; 2+1+1+1; 1+1+1+1+1. After the coin 1
  there is one way to make every amount (all ones). The coin 2 adds the ways that
  use at least one 2.
</p>
<p>
  <b>Why the amount-outside loop counts sequences.</b> Now
  <code>ways[a]</code> is computed as the sum over every coin <code>c</code>
  that could be the <em>last</em> coin: <code>ways[a] = Σ ways[a − c]</code>.
  Each sequence has exactly one last coin, so each sequence is counted once, and
  two orders of the same coins have different last coins or different earlier
  parts. For amount 5 with [1, 2, 5] the nine sequences are the 4 combinations
  above, expanded into their orders: {5} has 1 order, {2, 2, 1} has 3,
  {2, 1, 1, 1} has 4 and {1, 1, 1, 1, 1} has 1, and 1 + 3 + 4 + 1 = 9.
</p>
<h4>Dry run: countOrderedSequences(5, [1, 2, 5])</h4>
<table>
  <tr><th>amount a</th><th>computed from</th><th>ways[a]</th></tr>
  <tr><td>0</td><td>base case, the empty sequence</td><td>1</td></tr>
  <tr><td>1</td><td>ways[0]</td><td>1</td></tr>
  <tr><td>2</td><td>ways[1] + ways[0]</td><td>2</td></tr>
  <tr><td>3</td><td>ways[2] + ways[1]</td><td>3</td></tr>
  <tr><td>4</td><td>ways[3] + ways[2]</td><td>5</td></tr>
  <tr><td>5</td><td>ways[4] + ways[3] + ways[0]</td><td>9</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The rule to carry into any counting problem</span>
  Ask whether the order of the choices is part of what you count. If it is not
  (<em>combinations</em>, <em>multisets</em>, "different sets of coins"), put the
  <b>items outside</b> and the target inside. If it is (<em>sequences</em>,
  <em>orderings</em>, "different ordered sums", the Combination Sum IV
  problem), put the <b>target outside</b> and the items inside. Reading the
  problem statement for the word "order" is the entire skill.
</div>
<div class="warn">
  <span class="ttl">⚠ Counting pitfalls</span>
  <ul>
    <li>Coins must be positive. A coin of 0 makes <code>ways[a] += ways[a]</code> double the cell, so the count is wrong (in the true problem it would be infinite).</li>
    <li>Counts grow fast. JavaScript numbers are exact up to 2<sup>53</sup> − 1, and counts of subsets or sequences can pass that on a long input. If the statement says "modulo 10<sup>9</sup> + 7", take the remainder after every addition; if it does not and the numbers can be huge, use <code>BigInt</code>.</li>
    <li><code>ways[0] = 1</code> is the "empty way", not a typo. With 0 there the first coin has nothing to extend.</li>
  </ul>
</div>

<h3>Subset sum and Partition Equal Subset Sum</h3>
<p>
  Subset sum asks: can some of these numbers, each used at most once, add up to
  exactly <code>target</code>? It is the 0/1 knapsack with the value thrown away
  and the question turned into a yes or no, so each cell becomes a boolean:
  <code>reach[s]</code> is true if some subset of the numbers so far sums to
  <code>s</code>. The array starts with only <code>reach[0] = true</code> (the
  empty subset), and the inner loop runs backwards for the same reason as
  before.
</p>
<pre><code>function canMakeSum(nums, target) {
  if (target &lt; 0) return false;
  const reach = new Array(target + 1).fill(false);
  reach[0] = true;
  for (const x of nums) {
    for (let s = target; s &gt;= x; s--) {
      if (reach[s - x]) reach[s] = true;
    }
  }
  return reach[target];
}</code></pre>
<p>
  <b>Partition Equal Subset Sum:</b> can the array be split into two groups with
  equal sums? If the total is odd, no. Otherwise one group sums to
  <code>total / 2</code> if and only if the other does too, so the question is
  exactly <code>canMakeSum(nums, total / 2)</code>.
</p>
<pre><code>function canPartition(nums) {
  const total = nums.reduce((a, b) =&gt; a + b, 0);
  if (total % 2 !== 0) return false;
  return canMakeSum(nums, total / 2);
}</code></pre>
<h4>Dry run: canPartition([1, 5, 11, 5])</h4>
<p>
  The total is 22, so the target is 11. Columns are the reachable sums
  <code>0</code> to <code>11</code> (1 means reachable) after each number.
</p>
<table>
  <tr><th>after</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr>
  <tr><td>start</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>5</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>11</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td></tr>
  <tr><td>5</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td><td>1</td><td>1</td></tr>
</table>
<p class="sub">
  Sum 11 is reachable, from the single number 11 (the other group is 1 + 5 + 5).
  O(n · S) time and O(S) space, where S is the target.
</p>
<p>
  <b>A JavaScript aside: a bitset in one BigInt.</b> The array of booleans is a
  bit pattern in disguise. Store it in one <code>BigInt</code> whose bit
  <code>s</code> means "sum <code>s</code> is reachable". Taking number
  <code>x</code> or not is <code>reach | (reach &lt;&lt; x)</code>: every
  reachable sum also yields that sum plus <code>x</code>. Because a shift builds
  a new value, there is no loop direction to get wrong. The mask keeps the
  number from growing past the target.
</p>
<pre><code>function canPartitionBits(nums) {
  const total = nums.reduce((a, b) =&gt; a + b, 0);
  if (total % 2 !== 0) return false;
  const target = BigInt(total / 2);
  const keep = (1n &lt;&lt; (target + 1n)) - 1n; <span class="c">// bits 0..target only</span>
  let reach = 1n;
  for (const x of nums) reach = (reach | (reach &lt;&lt; BigInt(x))) &amp; keep;
  return ((reach &gt;&gt; target) &amp; 1n) === 1n;
}</code></pre>
<p class="sub">
  It is the same recurrence with a different container, so it has the same
  O(n · S) bit operations. Treat it as a neat alternative to know about, and
  measure before claiming it is faster on a given input.
</p>

<h3>Target Sum: signs become a subset count</h3>
<p>
  Put a <code>+</code> or <code>-</code> in front of every number so that the
  expression equals <code>target</code>, and count how many sign assignments do.
  Trying all signs is 2ⁿ, and a recursion over (index, running sum) repeats
  states, but there is a better move: reduce it to a different question.
</p>
<p>
  Let <code>P</code> be the sum of the numbers that got a <code>+</code> and
  <code>N</code> the sum of those that got a <code>-</code>. Then
  <code>P − N = target</code> and <code>P + N = total</code>. Add the two
  equations: <code>2P = total + target</code>. So
  <code>P = (total + target) / 2</code>, and the question becomes <b>how many
  subsets of the numbers sum to P</b>, a counting subset sum. Each subset of
  positions is exactly one sign assignment, so the count is the same, and two
  equal values at different positions count separately, as they should.
</p>
<p>
  Two cases have no answer: <code>|target| &gt; total</code> (the expression
  cannot reach that far), and <code>total + target</code> odd (P would not be a
  whole number). Check both before building an array, which also keeps
  <code>P</code> non-negative.
</p>
<pre><code>function findTargetSumWays(nums, target) {
  const total = nums.reduce((a, b) =&gt; a + b, 0);
  const shifted = total + target;
  if (Math.abs(target) &gt; total || shifted % 2 !== 0) return 0;
  const want = shifted / 2;
  const ways = new Array(want + 1).fill(0);
  ways[0] = 1;
  for (const x of nums) {
    for (let s = want; s &gt;= x; s--) ways[s] += ways[s - x];
  }
  return ways[want];
}</code></pre>
<h4>Dry run: findTargetSumWays([1, 1, 2, 3], 1)</h4>
<p>
  The total is 7, so <code>P = (7 + 1) / 2 = 4</code>. Columns are
  <code>ways[0..4]</code>.
</p>
<table>
  <tr><th>after</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th></tr>
  <tr><td>start</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>1</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>1</td><td>1</td><td>2</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>2</td><td>1</td><td>2</td><td>2</td><td>2</td><td>1</td></tr>
  <tr><td>3</td><td>1</td><td>2</td><td>2</td><td>3</td><td>3</td></tr>
</table>
<p class="sub">
  The answer is 3. The subsets with sum 4 are {first 1, 3}, {second 1, 3} and
  {1, 1, 2}. In sign form the numbers in the subset get a plus and the rest a
  minus: <code>+1 −1 −2 +3</code>, <code>−1 +1 −2 +3</code> and
  <code>+1 +1 +2 −3</code> all equal 1.
</p>
<div class="warn">
  <span class="ttl">⚠ Zeros are not noise</span>
  A <code>0</code> in the input can take either sign, so every zero doubles the
  count. The loop above does this correctly on its own: for <code>x = 0</code>
  it runs <code>ways[s] += ways[s]</code> for every <code>s</code>, which
  doubles each cell. Code that "skips zeros to save time" returns a count that
  is too small by a factor of 2 for every zero. Negative numbers are not allowed in this
  reduction: they would make the array index negative.
</div>

<h3>Ones and Zeroes: a knapsack with two budgets</h3>
<p>
  You get binary strings, and you may use at most <code>m</code> zeros and
  <code>n</code> ones in total. Choose the largest number of strings you can
  afford. Each string is an item that costs some zeros and some ones and has
  the value 1; each item can be used once. That is the 0/1 knapsack with a
  budget of <b>two</b> numbers, so the array has two axes:
  <code>best[z][o]</code> is the most strings that fit within <code>z</code>
  zeros and <code>o</code> ones.
</p>
<p>
  The proof of the backwards loop does not care how many axes there are, only
  that the cell you read must still hold the previous item's value. Cell
  <code>[z - zeros][o - ones]</code> is "before" cell <code>[z][o]</code> in
  both axes, so run <b>both</b> loops from high to low.
</p>
<pre><code>function findMaxForm(strs, m, n) {
  const best = Array.from({ length: m + 1 }, () =&gt; new Array(n + 1).fill(0));
  for (const s of strs) {
    let zeros = 0;
    for (const ch of s) if (ch === "0") zeros++;
    const ones = s.length - zeros;
    for (let z = m; z &gt;= zeros; z--) {
      for (let o = n; o &gt;= ones; o--) {
        best[z][o] = Math.max(best[z][o], best[z - zeros][o - ones] + 1);
      }
    }
  }
  return best[m][n];
}</code></pre>
<h4>Dry run: findMaxForm(["10", "0", "1"], 1, 1)</h4>
<p>
  The grid <code>best[z][o]</code> for <code>z, o</code> in {0, 1}, written as
  rows of <code>z</code>. The string <code>"10"</code> costs one zero and one
  one, <code>"0"</code> costs one zero, <code>"1"</code> costs one one.
</p>
<table>
  <tr><th>after</th><th>z = 0: o = 0, 1</th><th>z = 1: o = 0, 1</th></tr>
  <tr><td>start</td><td>0, 0</td><td>0, 0</td></tr>
  <tr><td>"10" (1 zero, 1 one)</td><td>0, 0</td><td>0, 1</td></tr>
  <tr><td>"0" (1 zero)</td><td>0, 0</td><td>1, 1</td></tr>
  <tr><td>"1" (1 one)</td><td>0, 1</td><td>1, 2</td></tr>
</table>
<p class="sub">
  The answer is <code>best[1][1] = 2</code>: take <code>"0"</code> and
  <code>"1"</code>, which together fit the budget, and skip <code>"10"</code>,
  which would use the whole budget for one string. Time O(L · m · n) for L
  strings plus the cost of counting characters, space O(m · n).
</p>

<h3>Last Stone Weight II: a partition problem in disguise</h3>
<p>
  You have stones with positive weights. Repeatedly pick any two, smash them
  together, and put back a stone of weight <code>|x − y|</code> (or nothing if
  they are equal). What is the smallest possible weight of the last stone? This
  is not the heap problem where you must smash the two heaviest stones: here you
  choose <em>which</em> two, and heaviest-first can be beaten. On
  <code>[3, 3, 2, 2, 2]</code> smashing the two heaviest each time ends with a
  stone of 2, while splitting the stones into {3, 3} and {2, 2, 2} reaches 0.
</p>
<p>
  <b>Derive the reduction.</b> A smash replaces <code>x</code> and
  <code>y</code> by their difference, which is <code>x</code> with
  <code>y</code> subtracted. Follow all the smashes through to the end: every
  original stone has been added or subtracted exactly once (by induction, each
  smash combines two signed sums into their difference), so the last stone is
  the absolute value of some signed sum <code>Σ ± stone</code>. A signed sum
  splits the stones into a group with <code>+</code> and a group with
  <code>-</code>, and its size is the gap between the two group sums. So the last
  weight is at least the smallest gap over all ways to split the stones into two
  groups.
</p>
<p>
  <b>The bound is reached.</b> Take a split with the smallest gap
  <code>D</code>. If one group is empty (the gap is the whole total), move a
  single stone across: the gap becomes <code>|total − 2y|</code>, no larger,
  so a best split with both groups non-empty exists when there are at least two
  stones. Smash one stone <code>x</code> from the heavier group A against one
  stone <code>y</code> from the lighter group B and put the leftover
  <code>|x − y|</code> into the group of whichever stone was larger. That group
  loses the smaller of the two weights, and so does the other one, so the gap
  between the group sums is still <code>D</code> and there is one stone fewer.
  Repeat on the smaller set (the base case is a single stone, whose weight is
  the gap with an empty other group). Since no result can be below <code>D</code>
  and one smash order reaches <code>D</code>, the smallest last stone is
  exactly <code>D</code>.
</p>
<p>
  So the answer is the smallest gap, which is a subset sum problem: find the
  largest <code>s ≤ total / 2</code> that some subset sums to, and the gap is
  <code>total − 2s</code>.
</p>
<pre><code>function lastStoneWeightII(stones) {
  const total = stones.reduce((a, b) =&gt; a + b, 0);
  const half = Math.floor(total / 2);
  const reach = new Array(half + 1).fill(false);
  reach[0] = true;
  for (const stone of stones) {
    for (let s = half; s &gt;= stone; s--) {
      if (reach[s - stone]) reach[s] = true;
    }
  }
  let best = half;
  while (!reach[best]) best--;
  return total - 2 * best;
}</code></pre>
<h4>Dry run: lastStoneWeightII([2, 7, 4, 1, 8, 1])</h4>
<p>
  The total is 23, so <code>half = 11</code>. Columns are the reachable sums
  <code>0</code> to <code>11</code>.
</p>
<table>
  <tr><th>after</th><th>0</th><th>1</th><th>2</th><th>3</th><th>4</th><th>5</th><th>6</th><th>7</th><th>8</th><th>9</th><th>10</th><th>11</th></tr>
  <tr><td>2</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>
  <tr><td>7</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td><td>0</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>0</td></tr>
  <tr><td>4</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td><td>1</td><td>0</td><td>1</td><td>0</td><td>1</td></tr>
  <tr><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td><td>1</td></tr>
</table>
<p class="sub">
  After the stone 1, every sum up to 11 is reachable, and the remaining stones
  (8 and 1) change nothing in this range. The largest reachable sum is 11, so
  the answer is <code>23 − 2 · 11 = 1</code>: one group sums to 11, the other to
  12. Time O(n · total), space O(total).
</p>

<h3>Choosing the loop: one table for the whole family</h3>
<p>
  Everything in the second half is one skeleton, a 1D array over the budget,
  with two switches: the <b>direction</b> of the inner loop over the budget, and
  which loop is <b>outside</b>.
</p>
<table>
  <tr><th>The question</th><th>Each item</th><th>Inner loop over the budget</th><th>Outer loop</th></tr>
  <tr><td>Best value, items used at most once</td><td>at most once</td><td>high to low</td><td>items</td></tr>
  <tr><td>Best value or fewest items, reusable</td><td>any number of times</td><td>low to high</td><td>items (target outside also works)</td></tr>
  <tr><td>Count subsets or sign assignments</td><td>at most once</td><td>high to low</td><td>items</td></tr>
  <tr><td>Count combinations, order ignored</td><td>any number of times</td><td>low to high</td><td>items</td></tr>
  <tr><td>Count ordered sequences</td><td>any number of times</td><td>low to high</td><td>target</td></tr>
  <tr><td>Item with a count limit</td><td>up to c times</td><td>high to low, over binary pieces</td><td>items, then pieces</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "It is a knapsack, so I will keep
  one array over the budget. Each item can be used once, so I run the inner loop
  from high to low, so the cell I read still holds the previous
  item's row. If items could repeat I would run it low to high instead. Time is
  O(n times the budget) and space O(budget), and since the budget is a value
  and not an input length, I will check its size first."
</div>

<h3>Recognizing the shape in an unseen problem</h3>
<ul>
  <li>"You may not do X two steps in a row", "after Y you must wait": the constraint talks about the <em>previous</em> step. Make the previous step's kind the mode.</li>
  <li>"At most k of something" together with positions or days: add the counter to the state, one pair of modes per count, and cap <code>k</code> by what the input allows.</li>
  <li>"Neighbours must differ" with a few choices each (colours, flavours): the mode is the choice made last.</li>
  <li>A list of numbers or items, each used once, and a target or a limit: 0/1 knapsack. If the target is "exactly equal", the array is boolean or a count and starts from <code>[0] = true</code> or 1.</li>
  <li>"Split into two groups with equal or nearly equal sums", "assign plus and minus": rewrite it as a subset sum to <code>total / 2</code> or to <code>(total + target) / 2</code>.</li>
  <li>"Unlimited supply" of each item: the forward loop. "Number of ways": ask whether order counts, and place the loops accordingly.</li>
  <li>Two limits at once (zeros and ones, weight and volume): one more axis on the array, and both loops run backwards.</li>
  <li>The budget is huge (10<sup>9</sup>) but the number of items is small: this DP is the wrong tool, because its cost depends on the value of the budget.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Take the stock problem with a rule you have not seen (say, a limit on days you can hold) and draw the modes and arrows before writing any code.</li>
    <li>Say why the cooldown version needs a third mode and what the missing arrow from <em>sold</em> to <em>held</em> means.</li>
    <li>Explain, in your own words, why the 0/1 knapsack inner loop runs from high to low, and which problem the same code solves if you flip it.</li>
    <li>Given Coin Change II, state which loop is outside for "number of combinations" and for "number of ordered sequences", and show with amount 5 and coins [1, 2, 5] that the answers are 4 and 9.</li>
    <li>Turn Target Sum into a subset count with <code>(total + target) / 2</code>, and list the two cases that return 0 immediately.</li>
    <li>Reduce Last Stone Weight II to a partition problem and say why the answer is <code>total − 2s</code> for the largest reachable <code>s ≤ total / 2</code>.</li>
    <li>State the time and space of each DP here, and say why the knapsack ones are pseudo-polynomial.</li>
  </ul>
</div>`,
};
