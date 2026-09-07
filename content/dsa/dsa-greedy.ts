import type { Chapter } from "../types";

export const dsaGreedy: Chapter = {
  id: "dsa-greedy",
  num: "I9",
  title: "Greedy algorithms",
  short: "Greedy algorithms",
  levels: ["intermediate"],
  practice: ["ex-gas-station", "ex-jump-game", "ex-jump-game-ii", "ex-candy", "ex-partition-labels"],
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
  intervals.sort((a, b) => a[1] - b[1]); <span class="c">// sort by FINISH time — the entire trick</span>

  let count = 0, lastEnd = -Infinity;
  for (const [start, end] of intervals) {
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
<p class="sub">
  This one's greedy argument is subtler: if the tank goes negative
  arriving at station <code>i</code>, starting from <em>any</em> station
  between the current <code>start</code> and <code>i</code> would also
  fail, because each of those partial sums was non-negative up to the
  point of failure — so it's always safe to jump the candidate start
  forward to <code>i + 1</code> without missing a valid answer.
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
  <li>When in doubt in an interview: try to prove greedy for a minute; if you can't, say so and switch to DP rather than silently guessing</li>
</ul>`,
};
