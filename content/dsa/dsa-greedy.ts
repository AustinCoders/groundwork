import type { Chapter } from "../types";

export const dsaGreedy: Chapter = {
  id: "dsa-greedy",
  num: "I13",
  title: "Greedy algorithms",
  short: "Greedy algorithms",
  levels: ["intermediate"],
  prerequisites: ["dsa-sorting-algorithms"],
  practice: [
    "ex-gas-station",
    "ex-jump-game",
    "ex-jump-game-ii",
    "ex-candy",
    "ex-partition-labels",
    "ex-assign-cookies",
    "ex-boats-to-save-people",
    "ex-queue-reconstruction-by-height",
    "ex-minimum-arrows-burst-balloons",
    "ex-valid-parenthesis-string",
    "ex-best-time-to-buy-and-sell-stock-ii",
    "ex-fractional-knapsack",
    "ex-non-overlapping-intervals",
    "ex-task-scheduler",
    "ex-reorganize-string",
    "ex-min-cost-connect-sticks",
  ],
  ready: true,
  subtitle: "The best DP alternative — when the locally best choice happens to be globally best too.",
  body: `<h3>The trade greedy makes</h3>
<p>
  DP explores every relevant option and keeps whichever turns out best.
  Greedy skips that entirely: at each step, take whatever <b>looks</b>
  best right now, commit to it, and never reconsider. That's a huge
  shortcut when it works — usually O(n log n) instead of DP's O(n²) or
  worse — but it only produces the correct answer for problems with a
  specific mathematical property.
</p>

<h3>The property that has to hold: the greedy-choice property</h3>
<p>
  A problem is safe for greedy only if <b>a locally optimal choice is
  always part of some globally optimal solution</b> — choosing it never
  closes off the best overall answer. If that's not provably true, greedy
  will find <em>a</em> valid answer, just not always the best one, and it
  will fail silently — no error, just a wrong result on some input you
  didn't test.
</p>
<div class="warn">
  <span class="ttl">⚠ Greedy's biggest risk: it "works" on your test cases and fails in the interview follow-up</span>
  The interviewer's next question is almost always "can you prove that's
  optimal?" or a counter-example that breaks it. If you can't argue
  <em>why</em> the greedy choice is always safe, say so explicitly and
  fall back to DP — guessing greedy without justification is a bigger red
  flag than just using DP from the start.
</div>

<h3>Worked example: Activity/Interval scheduling</h3>
<p>
  Maximize the number of non-overlapping intervals you can select. The
  greedy choice: always take the interval that <b>finishes earliest</b>
  among the remaining valid options.
</p>
<figure>
  <svg viewBox="0 0 640 170" class="dg" role="img" aria-label="Several overlapping intervals on a timeline, with the earliest-finishing ones selected greedily leaving no room for the intervals they conflict with">
    <g class="rough">
      <rect class="boxg" x="20" y="30" width="120" height="24" />
      <rect class="box" x="60" y="60" width="160" height="24" />
      <rect class="boxg" x="160" y="90" width="120" height="24" />
      <rect class="box" x="200" y="120" width="200" height="24" />
      <rect class="boxg" x="300" y="30" width="130" height="24" />
      <rect class="boxg" x="450" y="60" width="150" height="24" />
    </g>
    <text class="sm gr" x="30" y="47" text-anchor="middle" style="text-anchor:start">A (picked)</text>
    <text class="sm" x="70" y="77" style="text-anchor:start">B (conflicts with A)</text>
    <text class="sm gr" x="170" y="107" style="text-anchor:start">C (picked)</text>
    <text class="sm" x="210" y="137" style="text-anchor:start">D (conflicts with C)</text>
    <text class="sm gr" x="310" y="47" style="text-anchor:start">E (picked)</text>
    <text class="sm gr" x="460" y="77" style="text-anchor:start">F (picked)</text>
  </svg>
  <figcaption>Sort by finish time, always take the next interval that starts after the last one you picked ends.</figcaption>
</figure>
<pre><code>function maxNonOverlapping(intervals) {
  const sorted = [...intervals].sort((a, b) => a[1] - b[1]); <span class="c">// sort a copy by FINISH time — the entire trick</span>

  let count = 0, lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start >= lastEnd) { <span class="c">// this one doesn't conflict with our last pick</span>
      count++;
      lastEnd = end;
    }
  }
  return count;
}</code></pre>
<p class="sub">
  Why finish time and not start time or duration: picking whatever
  finishes earliest leaves the <em>maximum possible room</em> for
  everything that comes after — any other choice can only leave equal or
  less room. That's the actual proof sketch, and being able to say it is
  what separates "I memorized this" from "I understand why it's safe."
</p>

<h3>Proving the rule: the exchange argument and staying ahead</h3>
<p>
  The sketch above, "finishing earliest leaves the most room", is the idea of a
  proof. When an interviewer asks "why is that optimal?", you want it in three
  or four sentences. Two shapes of argument cover almost every greedy rule you
  will meet, and it helps to see both on the same problem.
</p>

<h4>The exchange argument: swap in the greedy choice</h4>
<p>
  Take <em>any</em> best schedule and call it O, with its intervals in time
  order. Let <code>g</code> be the interval the greedy rule picks first, the
  one that finishes earliest of all. If O already starts with <code>g</code>,
  there is nothing to show. If not, O starts with some interval
  <code>o1</code>, and <code>g</code> finishes no later than <code>o1</code>
  does, because <code>g</code> finishes earliest of all. Everything else in O
  starts at or after the end of <code>o1</code>, so it also starts at or after
  the end of <code>g</code>. Replace <code>o1</code> with <code>g</code>: no
  overlap appears, and the count is unchanged. So <em>some</em> best schedule
  contains the greedy first choice. Now throw away <code>g</code> and every
  interval that overlaps it. What is left of O is still a valid schedule for
  the intervals that remain, so the same argument applies to the smaller
  problem, and repeating it shows the greedy schedule is a best one.
</p>
<p>
  The pattern to copy is: <b>pick an arbitrary best solution, change it so
  that it agrees with the greedy choice, and show it did not get worse</b>.
  It suits rules that decide "what goes first" or "who gets matched with whom",
  and it is the argument behind the cookie, boat and queue problems later in
  this chapter.
</p>

<h4>Staying ahead: greedy is never behind</h4>
<p>
  The second shape compares the greedy answer with any other answer step by
  step and shows it is never behind. For scheduling, let greedy pick
  <code>g1, g2, ...</code> and let any valid schedule pick
  <code>o1, o2, ...</code>, both in time order. Claim: the end of
  <code>g<sub>i</sub></code> is never later than the end of
  <code>o<sub>i</sub></code>. For <code>i = 1</code> this is the rule itself.
  If it holds for <code>i</code>, then <code>o<sub>i+1</sub></code> starts after
  <code>o<sub>i</sub></code> ends, which is not before <code>g<sub>i</sub></code>
  ends, so <code>o<sub>i+1</sub></code> was available when greedy chose its
  next interval. Greedy picks the earliest finish among the available ones, so
  <code>g<sub>i+1</sub></code> ends no later than <code>o<sub>i+1</sub></code>.
  If the other schedule had more intervals than greedy, its extra interval
  would start after greedy's last end and greedy would not have stopped, a
  contradiction. So greedy has at least as many.
</p>
<p>
  This one suits a process that moves forward and is summarised by a single
  number: a finish time, the farthest index reached, the fuel left. Jump Game is
  the same proof in miniature, because after each step the greedy "farthest
  reachable" is at least what any other strategy has reached.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Take any optimal schedule. Its
  first interval ends no earlier than the one I pick, so I can swap mine in
  without creating an overlap, and the count stays the same. So some optimal
  schedule starts with my choice, and I repeat that on what is left."
</div>

<h3>Hunting for a counterexample before you trust a rule</h3>
<p>
  A proof takes minutes to write, and a counterexample takes seconds to find if
  you let the machine look. Keep a slow, obviously correct brute force next to
  the greedy rule, feed both random small inputs, and stop at the first
  disagreement. Small inputs matter: counterexamples to greedy rules usually
  need only three to five items, and a narrow range of values forces the ties
  and touching endpoints where rules break.
</p>
<pre><code>function bruteMaxNonOverlapping(intervals) {
  const n = intervals.length;
  let best = 0;
  for (let mask = 0; mask &lt; (1 &lt;&lt; n); mask++) { <span class="c">// every subset of the intervals</span>
    const chosen = [];
    for (let i = 0; i &lt; n; i++) if (mask &amp; (1 &lt;&lt; i)) chosen.push(intervals[i]);
    chosen.sort((a, b) =&gt; a[0] - b[0]);
    let ok = true;
    for (let i = 1; i &lt; chosen.length; i++) {
      if (chosen[i][0] &lt; chosen[i - 1][1]) { ok = false; break; } <span class="c">// overlaps its neighbour</span>
    }
    if (ok) best = Math.max(best, chosen.length);
  }
  return best;
}</code></pre>
<pre><code>function findCounterexample(greedy, brute, makeInput, tries = 2000) {
  for (let t = 0; t &lt; tries; t++) {
    const input = makeInput();
    if (greedy(input) !== brute(input)) return input; <span class="c">// the first input where they disagree</span>
  }
  return null;
}</code></pre>
<p>
  Try it on the tempting wrong key, sorting by start time:
</p>
<pre><code>function maxNonOverlappingByStart(intervals) {
  const sorted = [...intervals].sort((a, b) =&gt; a[0] - b[0]); <span class="c">// the tempting but wrong sort key</span>
  let count = 0, lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start &gt;= lastEnd) {
      count++;
      lastEnd = end;
    }
  }
  return count;
}</code></pre>
<p class="sub">
  Calling <code>findCounterexample(maxNonOverlappingByStart,
  bruteMaxNonOverlapping, makeInput)</code> with a generator of five or fewer
  random intervals finds a failing input within a few dozen tries: in a run of
  20,000 random inputs about one in ten disagreed with the brute force. The shape
  to expect is <code>[[1, 10], [2, 3], [4, 5]]</code>: sorted by start, the long
  interval comes first and blocks the other two, so the rule returns 1 while
  the best schedule has 2. The same call with the finish-time rule returns
  <code>null</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ Passing the stress test is evidence, not a proof</span>
  A few thousand clean runs mean you have not found a counterexample, not that
  none exists. It is still the fastest way to kill a wrong rule, and it works in
  an interview as a sentence: "I would check this against a brute force on small
  random inputs." The brute force takes exponential time, so it is only for
  tiny inputs. And if the generator never produces ties or touching
  endpoints, it will miss the cases that matter.
</div>

<h3>Worked example: Jump Game — can you reach the end?</h3>
<pre><code>function canJump(nums) {
  let farthestReachable = 0;
  for (let i = 0; i < nums.length; i++) {
    if (i > farthestReachable) return false; <span class="c">// stuck — can't even reach index i</span>
    farthestReachable = Math.max(farthestReachable, i + nums[i]);
  }
  return true;
}</code></pre>
<p class="sub">
  The greedy insight: you never need to know <em>which</em> path gets you
  furthest, only the single number "furthest index reachable so far" —
  tracking every possible path (which DP would do) is unnecessary work
  because only the maximum ever matters for future decisions.
</p>

<h3>Jump Game II: the fewest jumps, one boundary at a time</h3>
<p>
  Now the end is always reachable and you want the <b>fewest</b> jumps to get
  there. Trying every sequence of jumps is exponential, and a DP over
  "fewest jumps to each index" is O(n²) because each index looks at all the
  indices it can jump to. The greedy view is a breadth-first search without the
  queue. Look at the set of indices reachable with <code>j</code> jumps. It is
  a block that starts at index 0 and ends at some index
  <code>currentEnd</code>: if you can land on an index, you can also land on any
  earlier one with no more jumps, by jumping a bit shorter. The block reachable
  with <code>j + 1</code> jumps therefore ends at the farthest reach
  <code>i + nums[i]</code> of any index <code>i</code> inside the current block.
</p>
<p>
  So scan left to right, keep the farthest reach seen so far, and every time
  you step past the end of the current block you must spend one more jump, and
  the new block ends at that farthest reach.
</p>
<pre><code>function jump(nums) {
  let jumps = 0, currentEnd = 0, farthest = 0;
  for (let i = 0; i &lt; nums.length - 1; i++) {
    farthest = Math.max(farthest, i + nums[i]);
    if (i === currentEnd) { <span class="c">// the last index reachable with the current number of jumps</span>
      if (farthest &lt;= i) return -1; <span class="c">// nothing beyond i is reachable</span>
      jumps++;
      currentEnd = farthest;
    }
  }
  return jumps;
}</code></pre>
<h4>Dry run: jump([2, 3, 1, 1, 4])</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>farthest</th><th>i === currentEnd?</th><th>jumps</th><th>currentEnd</th></tr>
  <tr><td>0</td><td>2</td><td>2</td><td>yes: spend a jump</td><td>1</td><td>2</td></tr>
  <tr><td>1</td><td>3</td><td>4</td><td>no</td><td>1</td><td>2</td></tr>
  <tr><td>2</td><td>1</td><td>4</td><td>yes: spend a jump</td><td>2</td><td>4</td></tr>
  <tr><td>3</td><td>1</td><td>4</td><td>no</td><td>2</td><td>4</td></tr>
</table>
<p class="sub">
  The first jump covers indices 1 to 2. Looking inside that block, index 1
  reaches farthest (<code>1 + 3 = 4</code>), so the second jump covers the last
  index, and the answer is 2. You never decide which index to jump from; you
  only record how far the best one could have taken you. The loop is O(n) time
  and O(1) space, and the proof is the staying-ahead argument above: after
  every jump, <code>currentEnd</code> is as far as any strategy with that many
  jumps could be.
</p>
<div class="warn">
  <span class="ttl">⚠ Stop one short, and decide what unreachable means</span>
  The loop runs to <code>nums.length - 1</code>, exclusive. If it included the
  last index, the moment <code>i</code> equals <code>currentEnd</code> there
  would count one jump too many, because you do not need to jump <em>from</em>
  the destination. The line <code>if (farthest &lt;= i) return -1</code> catches
  an array where you get stuck, such as <code>[1, 0, 1]</code>. The standard
  problem promises that the end is reachable, and then that line never fires,
  but a version that quietly returns a wrong number on an unreachable input is
  worse than one that says so.
</div>

<h3>Worked example: Gas Station</h3>
<pre><code>function canCompleteCircuit(gas, cost) {
  let total = 0, tank = 0, start = 0;
  for (let i = 0; i < gas.length; i++) {
    const diff = gas[i] - cost[i];
    total += diff;
    tank += diff;
    if (tank < 0) {       <span class="c">// can't reach the next station from any point up to here</span>
      start = i + 1;       <span class="c">// so the answer, if any, must start AFTER i</span>
      tank = 0;
    }
  }
  return total >= 0 ? start : -1; <span class="c">// total < 0 means no valid start exists anywhere</span>
}</code></pre>
<h4>Dry run: gas = [1, 2, 3, 4, 5], cost = [3, 4, 5, 1, 2]</h4>
<table>
  <tr><th>i</th><th>gas[i]</th><th>cost[i]</th><th>diff</th><th>total</th><th>tank</th><th>tank &lt; 0?</th></tr>
  <tr><td>0</td><td>1</td><td>3</td><td>-2</td><td>-2</td><td>-2</td><td>yes → start = 1, tank = 0</td></tr>
  <tr><td>1</td><td>2</td><td>4</td><td>-2</td><td>-4</td><td>-2</td><td>yes → start = 2, tank = 0</td></tr>
  <tr><td>2</td><td>3</td><td>5</td><td>-2</td><td>-6</td><td>-2</td><td>yes → start = 3, tank = 0</td></tr>
  <tr><td>3</td><td>4</td><td>1</td><td>3</td><td>-3</td><td>3</td><td>no</td></tr>
  <tr><td>4</td><td>5</td><td>2</td><td>3</td><td>0</td><td>6</td><td>no</td></tr>
</table>
<p class="sub">
  total ends at 0 (≥ 0, so a valid start exists) and the last reset left
  <code>start = 3</code> — station 3 is the answer. Every candidate start
  before index 3 failed somewhere on the way to it, so none of them could
  ever have worked either, which is exactly the argument below.
</p>
<p class="sub">
  This one's greedy argument is subtler: if the tank goes negative
  arriving at station <code>i</code>, starting from <em>any</em> station
  between the current <code>start</code> and <code>i</code> would also
  fail, because each of those partial sums was non-negative up to the
  point of failure — so it's always safe to jump the candidate start
  forward to <code>i + 1</code> without missing a valid answer.
</p>

<h3>Candy: two passes, one constraint each</h3>
<p>
  Children stand in a line with ratings. Each gets at least one candy, and a
  child with a higher rating than a neighbour must get more candy than that
  neighbour. Find the fewest candies. Each child has two constraints, one
  against the left neighbour and one against the right, and they pull against
  each other. Trying to satisfy both in one pass is where people get stuck.
  Split them: handle the left neighbours in one pass and the right neighbours in
  another, always giving the smallest number that works.
</p>
<p>
  Left to right, a child rated higher than the one on their left gets one more
  than that child, and everyone else stays at 1. Now every left constraint
  holds, and each number is the smallest that makes it so. Then right to left,
  a child rated higher than the one on their right needs more than that child.
  But they may already hold a larger number from the first pass, and lowering it
  would break a left constraint. So the second pass <b>raises</b> the number to
  the larger of what it has and what the right neighbour requires.
</p>
<pre><code>function candy(ratings) {
  const n = ratings.length;
  const give = new Array(n).fill(1); <span class="c">// everyone gets at least one</span>

  for (let i = 1; i &lt; n; i++) {
    if (ratings[i] &gt; ratings[i - 1]) give[i] = give[i - 1] + 1; <span class="c">// beat the left neighbour</span>
  }
  for (let i = n - 2; i &gt;= 0; i--) {
    if (ratings[i] &gt; ratings[i + 1]) give[i] = Math.max(give[i], give[i + 1] + 1); <span class="c">// and the right one</span>
  }
  return give.reduce((sum, x) =&gt; sum + x, 0);
}</code></pre>
<h4>Dry run: ratings [1, 0, 2]</h4>
<table>
  <tr><th>Step</th><th>candies</th><th>why</th></tr>
  <tr><td>start</td><td>[1, 1, 1]</td><td>everyone gets one</td></tr>
  <tr><td>left to right, i = 1</td><td>[1, 1, 1]</td><td>0 is not higher than 1</td></tr>
  <tr><td>left to right, i = 2</td><td>[1, 1, 2]</td><td>2 is higher than 0, so one more than the 1</td></tr>
  <tr><td>right to left, i = 1</td><td>[1, 1, 2]</td><td>0 is not higher than 2</td></tr>
  <tr><td>right to left, i = 0</td><td>[2, 1, 2]</td><td>1 is higher than 0: max(1, 1 + 1) = 2</td></tr>
</table>
<p class="sub">
  The total is 5. The second pass shows why the <code>Math.max</code> matters. With
  ratings <code>[1, 3, 4, 5, 2]</code> the first pass gives
  <code>[1, 2, 3, 4, 1]</code>. At the peak, 5 is higher than the 2 on its right,
  which needs only <code>1 + 1 = 2</code> candies, but the peak already holds 4
  from the climb. Assigning 2 would break the rule with the 4-rated neighbour on
  its left, so the second pass keeps 4 and the total is 11. Children with
  <em>equal</em> ratings do not constrain each other: <code>[1, 2, 2]</code> gets
  <code>[1, 2, 1]</code>, which is 4. Time is O(n) and space is O(n) for the
  array of candies.
</p>

<h3>Partition Labels: each letter's last occurrence sets the cut</h3>
<p>
  Cut a string into as many parts as possible so that no letter appears in more
  than one part, and return the size of each part. A letter that appears twice
  forces everything between its first and last occurrence into one part. Chasing
  those overlaps is the same merging problem as intervals, but there is a
  shortcut: you only need the <em>last</em> index of each letter. Walk the
  string, keep the farthest last-occurrence of any letter you have passed, and
  the moment the walk reaches that index, every letter in the part ends here, so
  you can cut.
</p>
<pre><code>function partitionLabels(s) {
  const last = new Map();
  for (let i = 0; i &lt; s.length; i++) last.set(s[i], i); <span class="c">// last index of each letter</span>

  const sizes = [];
  let start = 0, end = 0;
  for (let i = 0; i &lt; s.length; i++) {
    end = Math.max(end, last.get(s[i])); <span class="c">// the part must reach this letter's last occurrence</span>
    if (i === end) { <span class="c">// nothing inside the part reaches beyond here: cut</span>
      sizes.push(end - start + 1);
      start = i + 1;
    }
  }
  return sizes;
}</code></pre>
<h4>Dry run: partitionLabels("abcabdd")</h4>
<p class="sub">last occurrences: a = 3, b = 4, c = 2, d = 6</p>
<table>
  <tr><th>i</th><th>letter</th><th>last[letter]</th><th>end</th><th>action</th></tr>
  <tr><td>0</td><td>a</td><td>3</td><td>3</td><td>none, the part must reach index 3</td></tr>
  <tr><td>1</td><td>b</td><td>4</td><td>4</td><td>none, the part must now reach index 4</td></tr>
  <tr><td>2</td><td>c</td><td>2</td><td>4</td><td>none</td></tr>
  <tr><td>3</td><td>a</td><td>3</td><td>4</td><td>none</td></tr>
  <tr><td>4</td><td>b</td><td>4</td><td>4</td><td>i === end: cut, size 4 - 0 + 1 = 5, start = 5</td></tr>
  <tr><td>5</td><td>d</td><td>6</td><td>6</td><td>none</td></tr>
  <tr><td>6</td><td>d</td><td>6</td><td>6</td><td>i === end: cut, size 6 - 5 + 1 = 2</td></tr>
</table>
<p class="sub">
  The result is <code>[5, 2]</code>. Cutting at the earliest possible point is
  safe because any valid partition must put everything up to that end into one
  part, so a cut anywhere earlier is impossible and a later one only makes the
  parts fewer. The first loop is O(n) and the second is O(n), with at most one
  entry per distinct letter in the map. A common slip is to use each letter's
  first occurrence, or to return the cut positions when the question asks for
  the sizes.
</p>

<h3>Sort, then match from the right end: Assign Cookies and Boats</h3>
<p>
  A large family of greedy problems is "sort, then pair things off". The skill is
  deciding <em>which end</em> to serve first. Two small examples show how the
  exchange argument picks it.
</p>
<h4>Assign Cookies</h4>
<p>
  Each child has a greed factor, each cookie has a size, and a child is happy
  with a cookie at least as big as their greed. Each cookie goes to at most one
  child. Maximise the number of happy children. Serve the <b>least greedy</b>
  child first, with the <b>smallest cookie</b> that satisfies them. A cookie too
  small for the least greedy child is too small for everyone, so it is thrown
  away. Why is the smallest sufficient cookie a safe choice? In any best plan,
  if that cookie went to another child, or to nobody, give it to the least
  greedy child instead. If the least greedy child held a different cookie, that
  cookie is at least as big as this one, so it still satisfies whoever received
  this one. The number of happy children does not drop, and the bigger cookies
  stay available for greedier children.
</p>
<pre><code>function findContentChildren(greed, cookies) {
  const children = [...greed].sort((a, b) =&gt; a - b);
  const sizes = [...cookies].sort((a, b) =&gt; a - b);
  let child = 0;
  for (let cookie = 0; cookie &lt; sizes.length &amp;&amp; child &lt; children.length; cookie++) {
    if (sizes[cookie] &gt;= children[child]) child++; <span class="c">// the smallest cookie that satisfies the least greedy child</span>
  }
  return child;
}</code></pre>
<p class="sub">
  With greed <code>[1, 2, 3]</code> and cookies <code>[1, 1]</code>, the first
  cookie satisfies the child with greed 1, and the second is too small for the
  child with greed 2 and is dropped, so the answer is 1. Time is O(n log n +
  m log m) for the two sorts, and the matching pass is linear.
</p>

<h4>Boats to Save People</h4>
<p>
  Each boat carries at most two people and a total weight of at most
  <code>limit</code>, and every person alone fits. Use the fewest boats. Look at
  the <b>heaviest</b> person H and the <b>lightest</b> person L. If L and H
  cannot share a boat, no one can share with H, so H rides alone. If they can,
  pair them, and the exchange argument says that is safe. Suppose some best plan
  has H with a partner P and L with a partner Q. Regroup the four as (L, H) and
  (P, Q). Since L weighs no more than P, <code>L + H</code> is at most
  <code>P + H</code>. Since Q weighs no more than H, <code>P + Q</code> is at
  most <code>P + H</code>. Both are within the limit because <code>P + H</code>
  was, and the number of boats is the same.
</p>
<pre><code>function numRescueBoats(people, limit) {
  const weights = [...people].sort((a, b) =&gt; a - b);
  let light = 0, heavy = weights.length - 1, boats = 0;
  while (light &lt;= heavy) {
    if (weights[light] + weights[heavy] &lt;= limit) light++; <span class="c">// the lightest rides with the heaviest</span>
    heavy--; <span class="c">// the heaviest always leaves in this boat</span>
    boats++;
  }
  return boats;
}</code></pre>
<h4>Dry run: numRescueBoats([3, 2, 2, 1], 3)</h4>
<p class="sub">sorted weights: [1, 2, 2, 3]</p>
<table>
  <tr><th>light</th><th>heavy</th><th>weights[light] + weights[heavy]</th><th>action</th><th>boats</th></tr>
  <tr><td>0</td><td>3</td><td>1 + 3 = 4 &gt; 3</td><td>the 3 rides alone</td><td>1</td></tr>
  <tr><td>0</td><td>2</td><td>1 + 2 = 3 ≤ 3</td><td>the 1 and a 2 share</td><td>2</td></tr>
  <tr><td>1</td><td>1</td><td>2 + 2 = 4 &gt; 3</td><td>the last 2 rides alone</td><td>3</td></tr>
</table>
<p class="sub">
  The loop condition is <code>light &lt;= heavy</code>, so the final person, when
  both pointers meet, still gets a boat. Time is O(n log n) for the sort and
  O(n) for the two-pointer sweep. The code assumes every person's weight is at
  most <code>limit</code>; if that were not promised, you would first have to
  say what to do about someone who cannot ride at all.
</p>

<h3>Queue Reconstruction by Height: place the tallest first</h3>
<p>
  Each person is a pair <code>[h, k]</code>: height <code>h</code>, and exactly
  <code>k</code> people in front of them who are at least as tall. Rebuild a
  queue that satisfies everyone. The trick is to build the queue in the order
  that makes each placement final. When you place a person, consider only taller
  or equal people: if you have inserted people from tallest to shortest, then
  everyone already in the queue is at least as tall, so inserting at index
  <code>k</code> puts exactly <code>k</code> of them in front. People inserted
  later are shorter, so they never change the count of anyone placed before.
</p>
<p>
  Sort by height descending. Break ties by <code>k</code> ascending, so that
  among equal heights the one with fewer people in front goes in first and the
  next one counts it correctly.
</p>
<pre><code>function reconstructQueue(people) {
  const sorted = [...people].sort((a, b) =&gt; b[0] - a[0] || a[1] - b[1]); <span class="c">// tallest first, fewer-in-front first</span>
  const queue = [];
  for (const person of sorted) {
    queue.splice(person[1], 0, [...person]); <span class="c">// k taller people are already placed: insert at index k</span>
  }
  return queue;
}</code></pre>
<h4>Dry run: [[7, 0], [4, 4], [7, 1], [5, 0], [6, 1], [5, 2]]</h4>
<table>
  <tr><th>Insert</th><th>at index</th><th>queue afterwards</th></tr>
  <tr><td>[7, 0]</td><td>0</td><td>[7,0]</td></tr>
  <tr><td>[7, 1]</td><td>1</td><td>[7,0] [7,1]</td></tr>
  <tr><td>[6, 1]</td><td>1</td><td>[7,0] [6,1] [7,1]</td></tr>
  <tr><td>[5, 0]</td><td>0</td><td>[5,0] [7,0] [6,1] [7,1]</td></tr>
  <tr><td>[5, 2]</td><td>2</td><td>[5,0] [7,0] [5,2] [6,1] [7,1]</td></tr>
  <tr><td>[4, 4]</td><td>4</td><td>[5,0] [7,0] [5,2] [6,1] [4,4] [7,1]</td></tr>
</table>
<p class="sub">
  Check the pair <code>[6, 1]</code>: in the final queue, exactly one person
  before it, the 7, is at least as tall. Each <code>splice</code> shifts the
  elements after the insertion point, so the worst case is O(n²) for the
  inserts on top of the O(n log n) sort. If the tie-break were <code>k</code>
  descending, the person with more people in front would go in first and be
  shifted out of position by the one inserted after. The code sorts a copy and
  stores copies of the pairs, so the caller's data is never changed.
</p>

<h3>Minimum Arrows to Burst Balloons: the same shape as interval scheduling</h3>
<p>
  Each balloon is a horizontal span <code>[xStart, xEnd]</code>, and an arrow
  shot straight up at <code>x</code> bursts every balloon whose span contains
  <code>x</code>, ends included. Find the fewest arrows. Sort by the <b>right
  end</b> and shoot the first arrow at the right end of the first balloon: that
  is as far right as an arrow can go while still hitting it, so it hits as many
  later balloons as possible. Every balloon whose start is at or before that
  point is burst. The first balloon that starts after it needs a new arrow, again
  at its right end.
</p>
<pre><code>function findMinArrowShots(points) {
  if (points.length === 0) return 0;
  const sorted = [...points].sort((a, b) =&gt; a[1] - b[1]); <span class="c">// by right end</span>
  let arrows = 1, arrowAt = sorted[0][1]; <span class="c">// shoot at the first balloon's right end</span>
  for (let i = 1; i &lt; sorted.length; i++) {
    if (sorted[i][0] &gt; arrowAt) { <span class="c">// starts after the arrow: not hit, so shoot again</span>
      arrows++;
      arrowAt = sorted[i][1];
    }
  }
  return arrows;
}</code></pre>
<h4>Dry run: [[10, 16], [2, 8], [1, 6], [7, 12]]</h4>
<p class="sub">sorted by right end: [1, 6], [2, 8], [7, 12], [10, 16]</p>
<table>
  <tr><th>Balloon</th><th>starts after the arrow?</th><th>action</th><th>arrows</th></tr>
  <tr><td>[1, 6]</td><td>first balloon</td><td>shoot at 6</td><td>1</td></tr>
  <tr><td>[2, 8]</td><td>2 &gt; 6? no</td><td>burst by the arrow at 6</td><td>1</td></tr>
  <tr><td>[7, 12]</td><td>7 &gt; 6? yes</td><td>shoot at 12</td><td>2</td></tr>
  <tr><td>[10, 16]</td><td>10 &gt; 12? no</td><td>burst by the arrow at 12</td><td>2</td></tr>
</table>
<p class="sub">
  The answer is 2. The arrow count equals the largest number of balloons that
  can be picked so that no two share a point, which is the scheduling problem
  from earlier with one change: here two spans that only touch, like
  <code>[1, 2]</code> and <code>[2, 3]</code>, share the point 2 and one arrow
  bursts both, so the test is a strict <code>&gt;</code>, where the scheduling
  code used <code>&gt;=</code>. The
  <a href="/dsa/dsa-intervals">intervals chapter</a> lines up this touching
  rule for every interval problem side by side. Time is O(n log n).
</p>

<h3>Greedy on counts: Task Scheduler and Reorganize String</h3>
<p>
  Some greedy problems are about how often each item occurs, and the busiest item
  sets the shape of the whole answer. Both problems below have a heap solution
  (always take the most frequent item that is allowed), which the
  <a href="/dsa/dsa-heaps-priority-queues">heaps chapter</a> covers. Here is the
  version that needs no heap, with the reason it works.
</p>

<h4>Task Scheduler: the busiest task sets the frame</h4>
<p>
  Each task takes one time unit, the CPU may idle, and two runs of the same task
  must be at least <code>n</code> units apart. Return the fewest units. Let the
  most frequent task occur <code>m</code> times. Its occurrences need
  <code>m - 1</code> gaps, and each gap, together with the run before it, spans
  <code>n + 1</code> units: <code>A _ _ A _ _ A</code> for <code>n = 2</code>. The
  last occurrence closes the frame, along with any other task that is tied for
  the highest count. So the frame has length
  <code>(m - 1) × (n + 1) + withMax</code>, where <code>withMax</code> is how
  many tasks occur exactly <code>m</code> times. No schedule can be shorter. The
  other tasks drop into the empty slots of the frame. If there are so many of
  them that they do not fit, the schedule never has to idle at all, and the
  answer is simply the number of tasks.
</p>
<pre><code>function leastInterval(tasks, n) {
  const counts = new Map();
  for (const task of tasks) counts.set(task, (counts.get(task) || 0) + 1);

  let maxCount = 0;
  for (const count of counts.values()) maxCount = Math.max(maxCount, count);
  let withMax = 0;
  for (const count of counts.values()) if (count === maxCount) withMax++;

  const frame = (maxCount - 1) * (n + 1) + withMax; <span class="c">// the busiest task sets the frame</span>
  return Math.max(tasks.length, frame); <span class="c">// enough other tasks fill every idle slot</span>
}</code></pre>
<h4>Dry run: AAABBB with n = 2, then AAABBCCDE with n = 2</h4>
<table>
  <tr><th>Tasks</th><th>m</th><th>withMax</th><th>frame</th><th>tasks.length</th><th>answer</th></tr>
  <tr><td>AAABBB, n = 2</td><td>3</td><td>2</td><td>(3 - 1) × 3 + 2 = 8</td><td>6</td><td>8</td></tr>
  <tr><td>AAABBCCDE, n = 2</td><td>3</td><td>1</td><td>(3 - 1) × 3 + 1 = 7</td><td>9</td><td>9</td></tr>
</table>
<p class="sub">
  The first schedule is <code>A B _ A B _ A B</code>: eight units with two idles.
  In the second, the other six tasks fill the gaps and spill over, so every unit
  can be busy, and a valid order exists such as
  <code>A B C A B C A D E</code>. The code counts with a <code>Map</code> in O(n)
  time, and only the number of distinct tasks is stored.
</p>

<h4>Reorganize String: fill the even slots first</h4>
<p>
  Rearrange a string so that no two equal letters are adjacent, or return the
  empty string if that is impossible. If one letter occurs more than
  <code>ceil(length / 2)</code> times, no arrangement exists, because that letter
  would need more slots than there are pairwise non-adjacent positions. Otherwise
  lay the letters down one letter at a time, most frequent first, into the slots
  0, 2, 4, ... and then, when those are full, 1, 3, 5, ...
</p>
<pre><code>function reorganizeString(s) {
  const counts = new Map();
  for (const ch of s) counts.set(ch, (counts.get(ch) || 0) + 1);

  const letters = [...counts.keys()].sort((a, b) =&gt; counts.get(b) - counts.get(a)); <span class="c">// most frequent first</span>
  if (s.length &gt; 0 &amp;&amp; counts.get(letters[0]) &gt; Math.ceil(s.length / 2)) return "";

  const out = new Array(s.length);
  let pos = 0;
  for (const ch of letters) {
    for (let k = 0; k &lt; counts.get(ch); k++) {
      out[pos] = ch;
      pos += 2; <span class="c">// skip a slot so equal letters are never neighbours</span>
      if (pos &gt;= s.length) pos = 1; <span class="c">// evens are full: continue on the odd slots</span>
    }
  }
  return out.join("");
}</code></pre>
<p class="sub">
  Why can a letter never touch itself? Each letter's slots are consecutive in
  that fill order. A letter that sits entirely in even slots, or entirely in odd
  slots, has slots two apart. Only a letter that starts on an even slot and runs
  on into the odd slots could land next to itself, and it would need more
  occurrences than the letter laid down before it, which the sort order rules
  out. The first letter cannot wrap, because the check above guarantees it fits
  in the even slots. For <code>"aaabbc"</code> the fill order gives
  <code>a</code> at 0, 2, 4, then <code>b</code> at 1 and 3, then <code>c</code>
  at 5: <code>"ababac"</code>. For <code>"aaab"</code> the letter
  <code>a</code> occurs 3 times, more than <code>ceil(4 / 2) = 2</code>, so the
  answer is the empty string. Time is O(n + k log k) for k distinct letters.
</p>

<h3>Valid Parenthesis String: track the range of open brackets</h3>
<p>
  A string holds <code>(</code>, <code>)</code> and <code>*</code>, where a star
  may be <code>(</code>, <code>)</code> or nothing. Is there a way to choose the
  stars so the brackets balance? Trying every choice is 3<sup>k</sup> for k
  stars. Instead of choosing, track every count of open brackets that is still
  possible. That set is always a block of consecutive integers, so two numbers
  describe it: <code>lo</code>, the fewest brackets that could be open, and
  <code>hi</code>, the most. A <code>(</code> moves both up by one, a
  <code>)</code> moves both down by one, and a star widens the block: it could
  close one (<code>lo - 1</code>), open one (<code>hi + 1</code>) or do nothing.
</p>
<p>
  Two repairs keep the block honest. If <code>hi</code> drops below 0, even
  treating every star as an opening bracket leaves a <code>)</code> with no
  partner, so the string is invalid. And <code>lo</code> is clamped at 0, because
  a negative count of open brackets is not a possible state; it only means some
  of the choices are impossible. At the end the string is valid exactly when 0
  is inside the block, and since <code>lo</code> was clamped, that means
  <code>lo === 0</code>.
</p>
<pre><code>function checkValidString(s) {
  let lo = 0, hi = 0; <span class="c">// fewest and most "(" that could still be open</span>
  for (const ch of s) {
    if (ch === "(") { lo++; hi++; }
    else if (ch === ")") { lo--; hi--; }
    else { lo--; hi++; } <span class="c">// a star could close one, do nothing, or open one</span>
    if (hi &lt; 0) return false; <span class="c">// even with every star as "(", a ")" has no partner</span>
    if (lo &lt; 0) lo = 0; <span class="c">// "fewest open" cannot go below zero</span>
  }
  return lo === 0; <span class="c">// some choice of stars closes everything</span>
}</code></pre>
<h4>Dry run: checkValidString("(*))")</h4>
<table>
  <tr><th>Character</th><th>lo, hi before the clamp</th><th>lo, hi after</th></tr>
  <tr><td>(</td><td>1, 1</td><td>1, 1</td></tr>
  <tr><td>*</td><td>0, 2</td><td>0, 2</td></tr>
  <tr><td>)</td><td>-1, 1</td><td>0, 1</td></tr>
  <tr><td>)</td><td>-1, 0</td><td>0, 0</td></tr>
</table>
<p class="sub">
  <code>hi</code> never goes below 0 and <code>lo</code> ends at 0, so the string
  is valid: read the star as <code>(</code> and you get <code>(())</code>. The
  string <code>")*("</code> fails at the first character, because
  <code>hi</code> becomes -1 at once. Forgetting the clamp on <code>lo</code> is
  the usual bug: <code>"*)"</code> is valid (read the star as <code>(</code>), but
  without the clamp <code>lo</code> ends at -2 and the string is wrongly rejected.
  One pass, O(n) time,
  O(1) space.
</p>

<h3>Best Time to Buy and Sell Stock II: add up every rise</h3>
<p>
  With as many buy-and-sell pairs as you like (holding at most one share at a
  time), the profit is the sum of every day-to-day rise. Any profitable
  transaction from day <code>i</code> to day <code>j</code> is the sum of the
  daily changes in between, and it cannot beat the sum of the positive daily
  changes alone, because the positive ones are all of the gain and the negative
  ones only subtract. Buying at the start of every rise and selling at its end
  collects exactly the positive changes.
</p>
<pre><code>function maxProfitMany(prices) {
  let profit = 0;
  for (let i = 1; i &lt; prices.length; i++) {
    if (prices[i] &gt; prices[i - 1]) profit += prices[i] - prices[i - 1]; <span class="c">// collect every rise</span>
  }
  return profit;
}</code></pre>
<p class="sub">
  For <code>[7, 1, 5, 3, 6, 4]</code> the rises are 1 to 5 (4) and 3 to 6 (3),
  and the profit is 7. The same answer comes from "buy at 1, sell at 5, buy at 3,
  sell at 6". Time is O(n), space O(1). The moment a rule is added that changes
  what a transaction costs or when you may start another, this stops being
  greedy: a cooldown after selling, a fee per transaction, or a cap on the
  number of transactions all need a small DP over "holding" and "not holding",
  which is in <a href="/dsa/dsa-dp-state-machines">DP state machines</a>.
</p>

<h3>Where greedy is exactly right: fractional knapsack and Huffman coding</h3>
<h4>Fractional knapsack, and why the 0/1 version is different</h4>
<p>
  You have items with a weight and a value, a bag with a weight limit, and you
  may take <em>part</em> of an item. Take items in order of value per unit of
  weight, the best ratio first, and split the last one that does not fit
  whole. The exchange argument is one line: if a plan uses some weight on a
  lower-ratio item while a higher-ratio item still has unused weight, move that
  weight across and the value goes up or stays equal.
</p>
<pre><code>function fractionalKnapsack(items, capacity) {
  const sorted = [...items].sort((a, b) =&gt; b[1] / b[0] - a[1] / a[0]); <span class="c">// best value per unit of weight first</span>
  let value = 0, room = capacity;
  for (const [weight, worth] of sorted) {
    if (room === 0) break;
    const take = Math.min(weight, room); <span class="c">// all of it, or whatever still fits</span>
    value += worth * (take / weight);
    room -= take;
  }
  return value;
}</code></pre>
<p class="sub">
  With items <code>[weight, value]</code> of <code>[10, 60]</code>,
  <code>[20, 100]</code> and <code>[30, 120]</code> and a limit of 50, the ratios
  are 6, 5 and 4. Take all of the first (60), all of the second (100), and
  20 of the 30 units of the third (80): total 240. Weights must be positive, or
  the ratio divides by zero.
</p>
<p>
  The identical data under the 0/1 rule, where an item is taken whole or not at
  all, gives a different story. Ratio order takes the first two items, weight 30
  and value 160, and the third no longer fits. But the second and third items
  together weigh exactly 50 and are worth 220. The splitting freedom is what
  made greedy safe, and without it the problem is the 0/1 knapsack, which needs
  the table in the 2D DP chapter.
</p>

<h4>Huffman coding: always merge the two lightest</h4>
<p>
  A prefix code gives each symbol a bit string so that no code is the start of
  another. Frequent symbols should get short codes. Huffman's rule builds the
  best code tree from the bottom: repeatedly take the two lightest nodes, merge
  them under a new node whose weight is their sum, and put that node back. The
  total cost of the code, the sum over symbols of frequency times code length,
  equals the sum of all the merged weights, because each merge adds the weight of
  everything below it one level deeper.
</p>
<p>
  The standard implementation uses a min-heap. There is a heap-free version
  that is easy to write: sort the frequencies once, and keep the merged sums in
  a second queue. The sums come out in non-decreasing order, because each merge
  takes the two smallest items available and the smallest items only grow, so the
  second queue stays sorted by itself. At each step the two smallest are among
  the fronts of the two queues.
</p>
<pre><code>function huffmanCost(freqs) {
  if (freqs.length &lt; 2) return 0;
  const leaves = [...freqs].sort((a, b) =&gt; a - b);
  const merged = []; <span class="c">// sums come out in non-decreasing order, so a plain queue stays sorted</span>
  let i = 0, j = 0, total = 0;

  const takeSmallest = () =&gt; {
    if (j &gt;= merged.length || (i &lt; leaves.length &amp;&amp; leaves[i] &lt;= merged[j])) return leaves[i++];
    return merged[j++];
  };

  for (let step = 0; step &lt; freqs.length - 1; step++) {
    const sum = takeSmallest() + takeSmallest(); <span class="c">// merge the two lightest</span>
    merged.push(sum);
    total += sum;
  }
  return total;
}</code></pre>
<h4>Dry run: huffmanCost([5, 9, 12, 13, 16, 45])</h4>
<table>
  <tr><th>Step</th><th>Two lightest</th><th>New node</th><th>Running total</th></tr>
  <tr><td>1</td><td>5 and 9 (both leaves)</td><td>14</td><td>14</td></tr>
  <tr><td>2</td><td>12 and 13 (both leaves)</td><td>25</td><td>39</td></tr>
  <tr><td>3</td><td>14 (merged) and 16 (leaf)</td><td>30</td><td>69</td></tr>
  <tr><td>4</td><td>25 and 30 (both merged)</td><td>55</td><td>124</td></tr>
  <tr><td>5</td><td>45 (leaf) and 55 (merged)</td><td>100</td><td>224</td></tr>
</table>
<p class="sub">
  The cost is 224. With n symbols there are n - 1 merges. Sorting is
  O(n log n) and the merging is O(n) after it. The heap version is O(n log n)
  throughout; it is the same loop as the heap exercise on connecting sticks at
  the lowest total cost. The proof is again an exchange argument: the two
  rarest symbols can always be made siblings at the deepest level of some best
  tree.
</p>

<h3>Where greedy fails: three counterexamples to keep in your head</h3>
<table>
  <tr><th>Tempting rule</th><th>Input that breaks it</th><th>What it returns, and the right answer</th><th>Use instead</th></tr>
  <tr><td>Fewest coins: always take the largest coin that fits</td><td>coins 1, 3, 4; amount 6</td><td>4 + 1 + 1, three coins; the best is 3 + 3, two coins</td><td>DP over the amount</td></tr>
  <tr><td>0/1 knapsack: take items by best value per unit of weight</td><td>weights 6, 5, 5; values 10, 7, 7; limit 10</td><td>takes the first item, value 10; the best is the other two, value 14</td><td>the 2D table</td></tr>
  <tr><td>Most intervals: sort by start time and take what fits</td><td>[1, 10], [2, 3], [4, 5]</td><td>takes [1, 10] and stops, count 1; the best is 2</td><td>sort by end time</td></tr>
</table>
<p class="sub">
  All three rules sound reasonable, all three work on many inputs, and each
  fails on an input small enough to write on a whiteboard. Keep these three in
  mind as a reflex: before you commit to a greedy rule, spend a minute looking for
  a small input where it fails, which is what the stress test above automates.
</p>

<h3>Greedy vs DP — how to decide which one a problem wants</h3>
<table>
  <tr><th>Signal</th><th>Points toward</th></tr>
  <tr><td>"Maximum/minimum number of X" with a simple, provable local rule</td><td>Greedy</td></tr>
  <tr><td>You can sort by one property and process in that order</td><td>Greedy</td></tr>
  <tr><td>The best choice now can make a <em>later</em> choice worse in a way you can't undo</td><td>DP</td></tr>
  <tr><td>You keep wanting to say "but what if I hadn't picked that one"</td><td>DP — that's the tell you need to explore alternatives</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll try the greedy
  approach — sort by finish time and always take the next non-conflicting
  option — and I can justify it because taking the earliest-finishing
  option never leaves less room than any other choice would, so it can't
  cost us a better solution."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Minimum number of," "maximum number of," where a sorted, greedy-order decision seems natural</li>
  <li>You can articulate <em>why</em> the greedy choice never eliminates the optimal answer — if you can't, don't trust it</li>
  <li>Scheduling, interval, and "assign resources" problems are greedy's home turf</li>
  <li>"Sort, then pair the ends": cookies to children, people to boats, anything where the extreme item should take the partner that costs the least</li>
  <li>One number summarises progress (farthest reach, finish time, fuel, open brackets) → a single pass that keeps only that number, often with a range instead of a choice</li>
  <li>Counts decide the answer (the busiest task, the most frequent letter) → build the frame the busiest item forces, then fit the rest into it</li>
  <li>A rule that sounds right but you cannot prove → test it against a brute force on small random inputs, and keep the three counterexamples above in mind</li>
  <li>Changing the problem slightly (fractions allowed, a cooldown, a fee, a cap on transactions) can flip it between greedy and DP, so re-check the property each time</li>
  <li>When in doubt in an interview: try to prove greedy for a minute; if you can't, say so and switch to DP rather than silently guessing</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State the greedy-choice property in your own words, and say what "fails silently" means for an unproven greedy approach.</li>
    <li>Explain why sorting interval scheduling by finish time (not start time, not duration) is the part that makes it correct.</li>
    <li>Write Jump Game and say why tracking a single "farthest reachable" number is enough, without exploring every path.</li>
    <li>Trace Gas Station on a small example and explain why a failed start can jump straight past every station up to the failure point.</li>
    <li>Given a new problem, try to argue why the greedy choice is safe for a minute — and say out loud when you can't, rather than guessing.</li>
    <li>Write the exchange argument for earliest-finish scheduling in four sentences, and the staying-ahead argument for the same problem.</li>
    <li>Write a brute force and a random tester that would find a counterexample to a greedy rule, and say what a clean run does and does not show.</li>
    <li>Write Jump Game II with its boundary variable, and say why the loop stops before the last index.</li>
    <li>Explain why Candy needs two passes and why the second one takes a maximum.</li>
    <li>Explain why Queue Reconstruction inserts the tallest first, and what breaks if ties are sorted the other way.</li>
    <li>Say why Minimum Arrows uses a strict comparison where interval scheduling uses an inclusive one.</li>
    <li>Give the counterexample for coin change with the coins 1, 3 and 4, and for the 0/1 knapsack taken by value per weight.</li>
  </ul>
</div>`,
};
