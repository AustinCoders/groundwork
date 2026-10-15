import type { Chapter } from "../types";

export const dsaSweepLineGeometry: Chapter = {
  id: "dsa-sweep-line-geometry",
  num: "A13",
  title: "Sweep line, offline queries and geometry",
  short: "Sweep line & geometry",
  levels: ["advanced"],
  prerequisites: ["dsa-intervals", "dsa-heaps-priority-queues", "dsa-math"],
  practice: [
    "ex-meeting-rooms-ii",
    "ex-car-pooling",
    "ex-skyline-problem",
    "ex-full-bloom-flowers",
    "ex-minimum-interval-queries",
    "ex-rank-transform-of-array",
    "ex-rectangle-union-area",
    "ex-segments-intersect",
    "ex-polygon-doubled-area",
    "ex-point-in-polygon",
    "ex-rectangle-area-total",
    "ex-perfect-rectangle",
    "ex-max-points-on-a-line",
    "ex-valid-square",
    "ex-erect-the-fence",
    "ex-closest-pair-squared",
    "ex-k-closest-points-origin",
  ],
  ready: true,
  subtitle:
    "Sort the moments when something changes, keep a summary of what is active, and skylines, offline queries and most geometry questions become one pass.",
  body: `<h3>The sweep-line recipe: events, a tie-break and an active set</h3>
<p>
  Picture a vertical line that starts at the far left of the plane and moves
  right. Almost everywhere nothing happens as it moves: the same shapes are
  under it a moment later as a moment ago. It only matters at a handful of
  places, where a shape begins or ends. A <b>sweep line</b> is the habit of
  looking only at those places. You stop at each one, update what the line is
  touching, and answer the question from that. The line can just as well be a
  timeline, a pointer over sorted queries, or a row scanning a grid; the idea is
  to sort the moments that matter and keep a summary of "what is active right now".
</p>
<p>
  The <a href="/dsa/dsa-intervals">intervals chapter</a> already uses this with
  the simplest possible summary, a counter: meeting rooms, car pooling and
  difference arrays are all sweeps where the active set is just a number. This
  chapter starts where a number stops being enough. The recipe is the same four
  steps every time:
</p>
<ol>
  <li><b>Make events.</b> Turn each object into the coordinates where it starts or stops mattering, carrying whatever the update needs (a height, a weight, an index).</li>
  <li><b>Sort the events,</b> with an explicit rule for what happens when two events share a coordinate.</li>
  <li><b>Walk the events</b> in order and update the active set.</li>
  <li><b>Read the answer</b> from the active set at the right moments: after every event, after every group of events at one coordinate, or between events when the answer accumulates over a stretch.</li>
</ol>
<p>
  What changes from problem to problem is the structure that holds the active
  set. Choose it by the question you will ask of the set:
</p>
<table>
  <tr><th>The question asked of the active set</th><th>Structure</th><th>Where it appears</th></tr>
  <tr><td>How many are active?</td><td>a counter</td><td>meeting rooms, car pooling (intervals chapter)</td></tr>
  <tr><td>What is the largest or smallest value among the active ones?</td><td>a heap, with lazy deletion</td><td>skyline, minimum interval for each query (below)</td></tr>
  <tr><td>What is the nearest active value above or below this one, or remove one specific entry?</td><td>an ordered set</td><td>the <a href="/dsa/dsa-ordered-structures">ordered structures chapter</a></td></tr>
  <tr><td>How much total length is covered?</td><td>a segment tree over compressed coordinates</td><td>rectangle union (below)</td></tr>
</table>
<h4>The tie-break is part of the algorithm</h4>
<p>
  When a start and an end fall on the same coordinate, which one is processed
  first changes the answer, and the right choice comes from the question and
  not from a trick. Ask whether a thing that ends at <code>x</code> is still
  there at <code>x</code>. If the interval is closed, <code>[1, 2]</code> still
  contains 2, so a start at 2 should see it: process starts first. If it is
  half-open, <code>[1, 2)</code> no longer contains 2, so process ends first,
  which is what the intervals chapter does. Writing the order as named numbers
  keeps the choice visible in the code:
</p>
<pre><code>const START = 0, END = 1; <span class="c">// the order of these two numbers IS the tie-break</span>

function maxOverlapClosed(intervals) {
  const events = [];
  for (const [from, to] of intervals) {
    events.push([from, START]);
    events.push([to, END]);
  }
  events.sort((a, b) =&gt; a[0] - b[0] || a[1] - b[1]); <span class="c">// same time: starts first, so [1, 2] and [2, 3] touch</span>
  let active = 0, best = 0;
  for (const [, kind] of events) {
    active += kind === START ? 1 : -1;
    best = Math.max(best, active);
  }
  return best;
}</code></pre>
<p class="sub">
  For <code>[[1, 2], [2, 3]]</code> the events sort to <code>(1, START)</code>,
  <code>(2, START)</code>, <code>(2, END)</code>, <code>(3, END)</code>, so the
  count reaches 2: the two closed intervals share the point 2. Swapping the two
  constants gives 1, the answer for half-open intervals. The sort is
  O(n log n) and the walk is linear.
</p>
<p>
  There are two ways to avoid tie-breaking altogether, and both appear below.
  One is to process <em>all</em> events at a coordinate before reading the
  answer, as the skyline does. The other is to read the answer only between
  coordinates, as the area sweep does: between two events at the same coordinate
  no width passes, so their order cannot change the total.
</p>
<div class="warn">
  <span class="ttl">⚠ Sort numbers with a comparator that returns a number</span>
  <code>[10, 9, 1, 100].sort()</code> returns <code>[1, 10, 100, 9]</code>,
  because the default sort compares text. A comparator that returns a boolean,
  such as <code>(a, b) =&gt; a &gt; b</code>, never returns a negative number and
  leaves <code>[3, 1, 2]</code> unsorted. Write <code>(a, b) =&gt; a - b</code>,
  and chain tie-breaks with <code>||</code> as above.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll turn each object into two
  events, sort them with an explicit rule for ties, and sweep while keeping the
  active ones in a structure that can answer the one question I need, like the
  largest height right now."
</div>

<h3>The skyline problem: a heap with lazy deletion</h3>
<p>
  Each building is <code>[left, right, height]</code>: it stands on the ground
  from <code>left</code> up to, but not including, <code>right</code>. Draw them
  all and trace the outline against the sky. Report that outline as the list of
  <b>key points</b> <code>[x, height]</code>, where each key point is the left
  end of a flat stretch, and the last one has height 0. The rule that makes the
  answer unique: when two neighbouring stretches have the same height, they are
  one stretch, so no key point appears between them.
</p>
<figure>
  <svg viewBox="0 0 640 236" class="dg" role="img" aria-label="Three overlapping buildings drawn as dashed rectangles, with the green skyline outline over them and the key points two ten, three fifteen, seven twelve and twelve zero marked">
    <g class="rough">
      <path class="ln" d="M20,190 L620,190" />
      <rect class="ln dash" x="40" y="110" width="364" height="80" />
      <rect class="ln dash" x="92" y="70" width="208" height="120" />
      <rect class="ln dash" x="196" y="94" width="364" height="96" />
      <path class="lng" d="M40,190 L40,110 L92,110 L92,70 L300,70 L300,94 L560,94 L560,190" />
    </g>
    <text class="sm" x="40" y="102">[2, 10]</text>
    <text class="sm" x="96" y="62">[3, 15]</text>
    <text class="sm" x="306" y="86">[7, 12]</text>
    <text class="sm gr" x="560" y="212" text-anchor="middle">[12, 0]</text>
    <text class="sm" x="62" y="182">10</text>
    <text class="sm" x="110" y="182">15</text>
    <text class="sm" x="500" y="182">12</text>
    <text class="sm" x="40" y="212" text-anchor="middle">2</text>
    <text class="sm" x="92" y="212" text-anchor="middle">3</text>
    <text class="sm" x="196" y="212" text-anchor="middle">5</text>
    <text class="sm" x="300" y="212" text-anchor="middle">7</text>
    <text class="sm" x="404" y="212" text-anchor="middle">9</text>
    <text class="sm" x="560" y="228" text-anchor="middle">x</text>
  </svg>
  <figcaption>Buildings [2, 9, 10], [3, 7, 15] and [5, 12, 12]. The outline changes only where a building starts or ends, and only when that changes the tallest one.</figcaption>
</figure>
<p>
  <b>Why the obvious way fails.</b> You could compute the height at every integer
  <code>x</code> by scanning all buildings, then compress runs. That costs the
  width of the whole range times n, and the range can be 2<sup>31</sup> wide.
</p>
<p>
  <b>The idea.</b> The height at <code>x</code> is the maximum height over the
  buildings with <code>left ≤ x &lt; right</code>. That maximum can only change
  at a coordinate where some building starts or ends, so the outline is decided
  by at most 2n coordinates. Sweep over them in order, keep the buildings
  covering the line in a structure that can say "the tallest", and whenever the
  tallest height differs from the height just before, record <code>[x, height]</code>.
</p>
<p>
  The active set needs three operations: insert a building when its left edge is
  reached, read the maximum height, and remove a building when its right edge is
  passed. A heap does the first two in O(log n) and O(1), but it cannot remove an
  arbitrary entry cheaply. The fix is <b>lazy deletion</b>: do not remove it.
  Leave the dead building where it is, and discard it only when it reaches the
  top, where it is about to be read. This is correct for a simple reason: you
  only ever read the top. A dead entry underneath a live top cannot change the
  maximum, and a dead entry on top is thrown away before you look. It also
  requires that death is permanent, and it is: the sweep only moves right, so a
  building that has ended never comes back.
</p>
<pre><code>class Heap {
  constructor(before) {
    this.before = before; <span class="c">// before(a, b) is true when a must leave the heap earlier than b</span>
    this.items = [];
  }

  get size() {
    return this.items.length;
  }

  peek() {
    return this.items[0];
  }

  push(value) {
    const a = this.items;
    a.push(value);
    let i = a.length - 1;
    while (i &gt; 0) {
      const parent = (i - 1) &gt;&gt; 1;
      if (!this.before(a[i], a[parent])) break;
      [a[parent], a[i]] = [a[i], a[parent]];
      i = parent;
    }
  }

  pop() {
    const a = this.items;
    const top = a[0];
    const last = a.pop();
    if (a.length &gt; 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const left = 2 * i + 1, right = left + 1;
        let first = i;
        if (left &lt; a.length &amp;&amp; this.before(a[left], a[first])) first = left;
        if (right &lt; a.length &amp;&amp; this.before(a[right], a[first])) first = right;
        if (first === i) break;
        [a[first], a[i]] = [a[i], a[first]];
        i = first;
      }
    }
    return top;
  }
}</code></pre>
<pre><code>function getSkyline(buildings) {
  const xs = [...new Set(buildings.flatMap(([left, right]) =&gt; [left, right]))].sort((a, b) =&gt; a - b);
  const byLeft = [...buildings].sort((a, b) =&gt; a[0] - b[0]);
  const alive = new Heap((a, b) =&gt; a[0] &gt; b[0]); <span class="c">// entries [height, right]; the tallest leaves first</span>
  const skyline = [];
  let next = 0, previous = 0;
  for (const x of xs) {
    while (next &lt; byLeft.length &amp;&amp; byLeft[next][0] &lt;= x) {
      const [, right, height] = byLeft[next++];
      alive.push([height, right]);
    }
    while (alive.size &gt; 0 &amp;&amp; alive.peek()[1] &lt;= x) alive.pop(); <span class="c">// lazy deletion: only a dead TOP has to go</span>
    const height = alive.size &gt; 0 ? alive.peek()[0] : 0;
    if (height !== previous) {
      skyline.push([x, height]);
      previous = height;
    }
  }
  return skyline;
}</code></pre>
<p class="sub">
  The heap holds <code>[height, right]</code> pairs, so a building carries its
  own end with it, and "dead" simply means <code>right &lt;= x</code>. The
  comparison is <code>&lt;=</code> because the building is half-open: at
  <code>x === right</code> it no longer covers anything. All buildings that start
  at or before <code>x</code> are pushed first and all dead tops are popped next,
  and only then is the height read. That order is what makes ties harmless: a
  building ending at <code>x</code> and another starting at <code>x</code> are both
  dealt with before the single read at <code>x</code>.
</p>
<h4>Dry run: [[2, 9, 10], [3, 7, 15], [5, 12, 12], [15, 20, 10], [19, 24, 8]]</h4>
<table>
  <tr><th>x</th><th>pushed</th><th>popped</th><th>heap after, tallest first</th><th>height</th><th>key point</th></tr>
  <tr><td>2</td><td>[10, 9]</td><td>none</td><td>[10, 9]</td><td>10</td><td>[2, 10]</td></tr>
  <tr><td>3</td><td>[15, 7]</td><td>none</td><td>[15, 7] [10, 9]</td><td>15</td><td>[3, 15]</td></tr>
  <tr><td>5</td><td>[12, 12]</td><td>none</td><td>[15, 7] [12, 12] [10, 9]</td><td>15</td><td>none, same height</td></tr>
  <tr><td>7</td><td>none</td><td>[15, 7]</td><td>[12, 12] [10, 9]</td><td>12</td><td>[7, 12]</td></tr>
  <tr><td>9</td><td>none</td><td>none</td><td>[12, 12] [10, 9]</td><td>12</td><td>none; [10, 9] is dead but buried</td></tr>
  <tr><td>12</td><td>none</td><td>[12, 12] and [10, 9]</td><td>empty</td><td>0</td><td>[12, 0]</td></tr>
  <tr><td>15</td><td>[10, 20]</td><td>none</td><td>[10, 20]</td><td>10</td><td>[15, 10]</td></tr>
  <tr><td>19</td><td>[8, 24]</td><td>none</td><td>[10, 20] [8, 24]</td><td>10</td><td>none</td></tr>
  <tr><td>20</td><td>none</td><td>[10, 20]</td><td>[8, 24]</td><td>8</td><td>[20, 8]</td></tr>
  <tr><td>24</td><td>none</td><td>[8, 24]</td><td>empty</td><td>0</td><td>[24, 0]</td></tr>
</table>
<p class="sub">
  The answer is <code>[[2, 10], [3, 15], [7, 12], [12, 0], [15, 10], [20, 8], [24, 0]]</code>.
  Watch <code>x = 9</code>: the building <code>[10, 9]</code> has ended, but it
  sits under <code>[12, 12]</code>, so nobody notices and nobody pays for it. It is
  only removed at <code>x = 12</code>, when it surfaces together with the building
  on top of it. That is lazy deletion working as intended.
</p>
<p>
  <b>Cost.</b> Sorting the coordinates is O(n log n). Each building is pushed once
  and popped at most once, each in O(log n), so the sweep is O(n log n) too. The
  heap never holds more than n entries, so the space is O(n).
</p>
<p>
  <b>The ordered-set alternative.</b> Instead of a heap you can keep the heights of
  the active buildings in a sorted multiset: insert at the left edge, remove that
  exact height at the right edge, read the largest. Nothing is left dead, so there
  is no lazy deletion, and the same O(n log n) holds. JavaScript has no built-in
  ordered set, which is why the heap version is the one to write in an interview;
  the <a href="/dsa/dsa-ordered-structures">ordered structures chapter</a> builds
  the structure if you want the other version.
</p>
<div class="warn">
  <span class="ttl">⚠ Skyline pitfalls</span>
  Emit a key point only when the height differs from the previous <em>emitted</em>
  height; otherwise two equal-height buildings that touch produce a bogus point.
  Compare with <code>right &lt;= x</code> and not <code>&lt;</code>, or a building
  that has just ended still holds the outline up for one more key point. Keep the
  final drop to 0: the heap becoming empty gives height 0, which differs from the
  last height, so the closing point appears by itself. And sort the coordinates
  with a numeric comparator.
</div>

<h3>Offline queries: answer them in the order that suits you</h3>
<p>
  A static pile of intervals and a list of questions about it: how many cover this
  time, which one is the smallest that contains this point. Answering each
  question by scanning the intervals costs O(n) per question and O(n · q) in all.
  The way out is the word <b>offline</b>. If you get all the questions before you
  must answer any, you are free to answer them in any order you like, as long as
  each answer is written back to its original slot. The order worth choosing is
  usually sorted by the thing being asked, because then the sweep above applies:
  the "line" is the query value moving upward.
</p>
<p>
  To answer in a different order, sort <em>indices</em> rather than values:
  <code>order = queries.map((_, i) =&gt; i).sort((a, b) =&gt; queries[a] - queries[b])</code>.
  Then <code>answer[order[k]]</code> is where the k-th smallest query's answer goes.
  Sorting the query values themselves loses the positions and you cannot undo it.
</p>
<h4>Number of flowers in full bloom: a count is a difference of two counts</h4>
<p>
  Each flower is in bloom on the closed range <code>[start, end]</code>. For each
  visitor arriving at time <code>t</code>, report how many flowers are in bloom.
  A flower is in bloom at <code>t</code> when <code>start ≤ t</code> and
  <code>t ≤ end</code>. Count the flowers that have <em>opened</em> by <code>t</code>
  (<code>start ≤ t</code>) and subtract the ones that have <em>closed before</em>
  <code>t</code> (<code>end &lt; t</code>). A flower that closed before
  <code>t</code> opened before <code>t</code> too, so every subtracted flower was
  counted, and what remains is exactly the flowers in bloom. Each of the two counts
  is "how many values in a sorted array are at most (or below) t", which is a binary
  search.
</p>
<pre><code>function countAtMost(sorted, t) {
  let lo = 0, hi = sorted.length;
  while (lo &lt; hi) {
    const mid = (lo + hi) &gt;&gt; 1;
    if (sorted[mid] &lt;= t) lo = mid + 1;
    else hi = mid;
  }
  return lo; <span class="c">// how many values are &lt;= t</span>
}

function countBelow(sorted, t) {
  let lo = 0, hi = sorted.length;
  while (lo &lt; hi) {
    const mid = (lo + hi) &gt;&gt; 1;
    if (sorted[mid] &lt; t) lo = mid + 1;
    else hi = mid;
  }
  return lo; <span class="c">// how many values are &lt; t</span>
}</code></pre>
<pre><code>function fullBloomFlowers(flowers, people) {
  const starts = flowers.map(([start]) =&gt; start).sort((a, b) =&gt; a - b);
  const ends = flowers.map(([, end]) =&gt; end).sort((a, b) =&gt; a - b);
  return people.map((t) =&gt; countAtMost(starts, t) - countBelow(ends, t)); <span class="c">// opened by t, minus closed before t</span>
}</code></pre>
<h4>Dry run: flowers [[1, 6], [3, 7], [9, 12], [4, 13]], visitors [2, 3, 7, 11]</h4>
<p class="sub">starts = [1, 3, 4, 9], ends = [6, 7, 12, 13]</p>
<table>
  <tr><th>t</th><th>starts ≤ t</th><th>ends &lt; t</th><th>in bloom</th></tr>
  <tr><td>2</td><td>1 (just 1)</td><td>0</td><td>1</td></tr>
  <tr><td>3</td><td>2 (1 and 3)</td><td>0</td><td>2</td></tr>
  <tr><td>7</td><td>3 (1, 3, 4)</td><td>1 (just 6)</td><td>2</td></tr>
  <tr><td>11</td><td>4</td><td>2 (6 and 7)</td><td>2</td></tr>
</table>
<p class="sub">
  The answer is <code>[1, 2, 2, 2]</code>. Look at <code>t = 7</code>: the flower
  <code>[3, 7]</code> ends at 7 and is still in bloom, which is why the second
  count uses <code>end &lt; t</code> and not <code>end &lt;= t</code>. Using the
  same comparison in both helpers is the standard off-by-one here. Sorting is
  O(n log n) and each visitor costs two binary searches, so the total is
  O((n + q) log n), with O(n) extra space. This version does not even need the
  queries sorted, because binary search answers any order.
</p>
<h4>Minimum interval to include each query: the sweep with a heap</h4>
<p>
  Now the question changes to: for each query point <code>q</code>, what is the size
  (<code>right - left + 1</code>) of the <em>smallest</em> interval that contains
  it, or -1 if there is none? A count could be split into two counts; a minimum
  cannot. So keep the intervals that currently contain <code>q</code> in a
  min-heap keyed by size, and sort the queries so that <code>q</code> only grows.
</p>
<p>
  Sorted this way, two things happen as <code>q</code> increases. Intervals with
  <code>left ≤ q</code> become candidates, and they stay candidates until they end.
  Intervals with <code>right &lt; q</code> are useless for this query and also for
  every later one, since later queries are larger. That permanent death is exactly
  what lazy deletion needs. So: push every interval whose left end is at or before
  <code>q</code>, pop dead tops, and the top is the answer. The code reuses the
  <code>Heap</code> class from the skyline, here ordered so that the smallest size
  comes out first.
</p>
<pre><code>function minInterval(intervals, queries) {
  const byLeft = [...intervals].sort((a, b) =&gt; a[0] - b[0]);
  const order = queries.map((_, i) =&gt; i).sort((a, b) =&gt; queries[a] - queries[b]); <span class="c">// query indices, smallest query first</span>
  const open = new Heap((a, b) =&gt; a[0] &lt; b[0]); <span class="c">// entries [size, right]; the smallest size leaves first</span>
  const answer = new Array(queries.length).fill(-1);
  let next = 0;
  for (const qi of order) {
    const q = queries[qi];
    while (next &lt; byLeft.length &amp;&amp; byLeft[next][0] &lt;= q) {
      const [left, right] = byLeft[next++];
      open.push([right - left + 1, right]);
    }
    while (open.size &gt; 0 &amp;&amp; open.peek()[1] &lt; q) open.pop(); <span class="c">// ended before q, so it also ends before every later query</span>
    if (open.size &gt; 0) answer[qi] = open.peek()[0];
  }
  return answer;
}</code></pre>
<h4>Dry run: intervals [[1, 4], [2, 4], [3, 6], [4, 4]], queries [2, 3, 4, 5]</h4>
<p class="sub">Heap entries are [size, right]; the queries are already in sorted order here.</p>
<table>
  <tr><th>q</th><th>pushed</th><th>popped</th><th>heap after, smallest first</th><th>answer</th></tr>
  <tr><td>2</td><td>[4, 4] and [3, 4]</td><td>none</td><td>[3, 4] [4, 4]</td><td>3</td></tr>
  <tr><td>3</td><td>[4, 6]</td><td>none</td><td>[3, 4] [4, 4] [4, 6]</td><td>3</td></tr>
  <tr><td>4</td><td>[1, 4]</td><td>none</td><td>[1, 4] [3, 4] [4, 4] [4, 6]</td><td>1</td></tr>
  <tr><td>5</td><td>none</td><td>[1, 4] and [3, 4]</td><td>[4, 6] on top, with the dead [4, 4] buried under it</td><td>4</td></tr>
</table>
<p class="sub">
  The result is <code>[3, 3, 1, 4]</code>. At <code>q = 5</code> the entries
  <code>[1, 4]</code> and <code>[3, 4]</code> sit on top and both ended at 4, so
  both are popped. Two entries of size 4 remain: <code>[4, 6]</code>, which is
  still alive, and <code>[4, 4]</code>, which is dead. This run leaves the live one
  on top, so the loop stops and the answer is 4; had the dead one been on top, it
  would have been popped next and the answer would be the same. A dead entry that
  stays buried is harmless, which is the whole point of deleting lazily.
</p>
<p>
  The cost is one sort of the intervals, one sort of the query indices, and a push
  and a pop per interval, so O((n + q) log(n + q)) time and O(n + q) space. The
  pitfalls are the ones to rehearse. Write the answer at <code>answer[qi]</code>,
  not at the sorted position. Pop on <code>right &lt; q</code>, not
  <code>&lt;=</code>, because the range is closed. And do not forget the -1 default
  for a query that no interval reaches.
</p>
<h4>When offline is not available</h4>
<p>
  Offline needs every query up front, and no query may depend on an earlier answer.
  If the queries arrive one at a time and each must be answered before the next
  appears, there is no sorted order to exploit, and you need a structure that
  answers any query on demand, such as the trees in the
  <a href="/dsa/dsa-segment-fenwick-trees">segment and Fenwick tree chapter</a>.
  Ask the interviewer which case you are in. "Are all queries given up front?" is
  often the most valuable single question in these problems.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Since all the queries are known up
  front, I'll sort them and sweep. As the query value only increases, an interval
  that has ended never matters again, so I can delete lazily from the heap, and
  I'll keep each query's original index to put the answers back in order."
</div>

<h3>Coordinate compression, exactly</h3>
<p>
  Many of these problems give coordinates up to 10<sup>9</sup> but only a few
  hundred or thousand distinct ones. The algorithm cannot index an array by such a
  coordinate, but it does not need to: a sweep, a sort or a segment tree only asks
  whether one coordinate is smaller than another. <b>Coordinate compression</b>
  replaces each value by its rank among the distinct values, which keeps every
  comparison and shrinks the range to at most the number of distinct values.
</p>
<pre><code>function compress(values) {
  const sorted = [...new Set(values)].sort((a, b) =&gt; a - b); <span class="c">// the comparator matters: the default sort is textual</span>
  const rank = new Map(sorted.map((value, i) =&gt; [value, i]));
  return { sorted, rank };
}

function rankTransform(array) {
  const { rank } = compress(array);
  return array.map((value) =&gt; rank.get(value) + 1);
}</code></pre>
<p class="sub">
  For <code>[100, 7, 1000000000, 7, 42]</code> the distinct sorted values are
  <code>[7, 42, 100, 1000000000]</code>, so the ranks are 0, 1, 2 and 3, and
  <code>rankTransform</code> returns <code>[3, 1, 4, 1, 2]</code> with ranks
  starting at 1. Equal values get equal ranks, and the order is preserved. The cost
  is O(n log n) for the sort, and each later lookup in the <code>Map</code> is O(1)
  on average. If you need the rank of a value that may not be in the set, such as a
  query coordinate, binary search the sorted array instead: the number of distinct
  values below it, <code>countBelow(sorted, v)</code> from above, is its rank.
</p>
<p>
  <b>What compression keeps and what it destroys.</b> Order survives; distances do
  not. Two coordinates one apart and two coordinates a billion apart can be
  neighbours after compression. Anything that depends on a distance must go back
  to the original values, and the sorted array is how: the length of the gap
  between rank <code>i</code> and rank <code>i + 1</code> is
  <code>sorted[i + 1] - sorted[i]</code>. The rectangle union below uses exactly
  that.
</p>
<div class="warn">
  <span class="ttl">⚠ Compression pitfalls</span>
  Include <em>both</em> endpoints of every interval or rectangle, not only the
  starts. Remove duplicates before ranking, or equal values get different ranks.
  Sort with <code>(a, b) =&gt; a - b</code>. And mind closed against half-open:
  if closed integer intervals <code>[l, r]</code> must keep the unit gaps between
  them, add <code>r + 1</code> to the values and treat them as
  <code>[l, r + 1)</code>.
</div>

<h3>Rectangle union: the simple way and the segment tree</h3>
<p>
  Given n axis-aligned rectangles <code>[x1, y1, x2, y2]</code>, find the area of
  their union, with overlaps counted once. Adding the areas counts overlaps
  several times, and correcting for them by inclusion and exclusion is
  exponential. Counting grid cells fails when the coordinates reach 10<sup>9</sup>.
</p>
<p>
  <b>The idea.</b> Sweep along x. Between two consecutive distinct x coordinates
  (a <em>slab</em>) the set of rectangles that cover the slab does not change, so
  the covered height is one number for the whole slab, and the slab contributes
  <code>width × covered height</code>. The covered height is the total length of
  the union of the y-ranges of those rectangles, which is the interval merge from
  the intervals chapter. There are at most 2n - 1 slabs.
</p>
<pre><code>function unionAreaSimple(rects) {
  const xs = [...new Set(rects.flatMap(([x1, , x2]) =&gt; [x1, x2]))].sort((a, b) =&gt; a - b);
  const byBottom = [...rects].sort((a, b) =&gt; a[1] - b[1]); <span class="c">// sorted by y once, so each slab needs no sort</span>
  let total = 0n;
  for (let i = 0; i + 1 &lt; xs.length; i++) {
    const left = xs[i], right = xs[i + 1];
    let covered = 0, reach = -Infinity;
    for (const [x1, y1, x2, y2] of byBottom) {
      if (x1 &gt; left || x2 &lt; right || y2 &lt;= reach) continue; <span class="c">// not covering this slab, or already inside what is covered</span>
      covered += y2 - Math.max(y1, reach); <span class="c">// count only the part above what is already covered</span>
      reach = y2;
    }
    total += BigInt(right - left) * BigInt(covered); <span class="c">// width times height can pass 2 ** 53</span>
  }
  return total;
}</code></pre>
<p class="sub">
  Sorting the rectangles by bottom edge once means every slab can merge the
  y-ranges in one pass, with <code>reach</code> as the highest point covered so far:
  a range lying entirely below <code>reach</code> adds nothing, and any other adds
  only the part above <code>reach</code>. There are up to 2n - 1 slabs, and each
  scans n rectangles, so this is O(n²) time and O(n) space. For rectangles
  <code>[[0, 0, 2, 2], [1, 0, 2, 3], [1, 0, 3, 1]]</code> the slabs are
  <code>[0, 1]</code>, <code>[1, 2]</code> and <code>[2, 3]</code> with covered
  heights 2, 3 and 1, so the area is 2 + 3 + 1 = 6.
</p>
<p>
  <b>Faster: let a segment tree keep the covered length.</b> The quadratic version
  recomputes the covered length from scratch for every slab, though only one or two
  rectangles enter or leave between slabs. What is needed is a structure that
  supports "add 1 to the cover of the y-range <code>[a, b)</code>", "subtract 1 from
  it", and "total covered length right now". Compress the y coordinates first.
  The <b>elementary segments</b> are the gaps between neighbouring distinct y
  values, numbered 0 to m - 1, and a rectangle covers the segments from the rank of
  its bottom to the rank of its top, exclusive.
</p>
<p>
  Each tree node stands for a range of elementary segments and stores two numbers.
  <code>cover</code> is how many rectangles have this node as one of the pieces
  their y-range was split into, so each such rectangle covers the node's whole
  range. <code>length</code> is the covered length inside the node's range. If
  <code>cover</code> is positive, the whole range is covered and the length is
  <code>ys[hi] - ys[lo]</code>. Otherwise the length is whatever the two children
  report, or 0 at a leaf. Nothing has to be pushed down to children, because every
  removal subtracts from exactly the nodes where the matching insertion added, and
  after every update the root's <code>length</code> is the covered height.
</p>
<pre><code>function unionArea(rects) {
  const ys = [...new Set(rects.flatMap(([, y1, , y2]) =&gt; [y1, y2]))].sort((a, b) =&gt; a - b);
  const yIndex = new Map(ys.map((y, i) =&gt; [y, i]));
  const segments = ys.length - 1; <span class="c">// the gaps between neighbouring y values</span>
  if (segments &lt; 1) return 0n;
  const cover = new Array(4 * segments).fill(0); <span class="c">// how many rectangles cover this node's whole range</span>
  const length = new Array(4 * segments).fill(0); <span class="c">// covered length inside this node's range</span>

  function update(node, lo, hi, from, to, delta) { <span class="c">// node stands for gaps lo .. hi - 1</span>
    if (to &lt;= lo || hi &lt;= from) return;
    if (from &lt;= lo &amp;&amp; hi &lt;= to) {
      cover[node] += delta;
    } else {
      const mid = (lo + hi) &gt;&gt; 1;
      update(2 * node, lo, mid, from, to, delta);
      update(2 * node + 1, mid, hi, from, to, delta);
    }
    if (cover[node] &gt; 0) length[node] = ys[hi] - ys[lo];
    else if (hi - lo === 1) length[node] = 0;
    else length[node] = length[2 * node] + length[2 * node + 1];
  }

  const events = [];
  for (const [x1, y1, x2, y2] of rects) {
    if (x1 === x2 || y1 === y2) continue;
    events.push([x1, 1, yIndex.get(y1), yIndex.get(y2)]);
    events.push([x2, -1, yIndex.get(y1), yIndex.get(y2)]);
  }
  events.sort((a, b) =&gt; a[0] - b[0]); <span class="c">// ties do not matter: no width passes between them</span>
  let total = 0n, previousX = events.length &gt; 0 ? events[0][0] : 0;
  for (const [x, delta, from, to] of events) {
    total += BigInt(x - previousX) * BigInt(length[1]); <span class="c">// the covered length held since the last event</span>
    previousX = x;
    update(1, 0, segments, from, to, delta);
  }
  return total;
}</code></pre>
<h4>Dry run: [[0, 0, 2, 2], [1, 0, 2, 3], [1, 0, 3, 1]], with y values 0, 1, 2, 3</h4>
<table>
  <tr><th>Event at x</th><th>Gaps changed</th><th>Area added before it</th><th>Total</th><th>Covered height after</th></tr>
  <tr><td>0: add rectangle 1</td><td>[0, 2)</td><td>0</td><td>0</td><td>2</td></tr>
  <tr><td>1: add rectangle 2</td><td>[0, 3)</td><td>1 × 2 = 2</td><td>2</td><td>3</td></tr>
  <tr><td>1: add rectangle 3</td><td>[0, 1)</td><td>0 × 3 = 0</td><td>2</td><td>3</td></tr>
  <tr><td>2: remove rectangle 1</td><td>[0, 2)</td><td>1 × 3 = 3</td><td>5</td><td>3</td></tr>
  <tr><td>2: remove rectangle 2</td><td>[0, 3)</td><td>0 × 3 = 0</td><td>5</td><td>1</td></tr>
  <tr><td>3: remove rectangle 3</td><td>[0, 1)</td><td>1 × 1 = 1</td><td>6</td><td>0</td></tr>
</table>
<p class="sub">
  The total is 6, matching the slab version. Two events at <code>x = 1</code> and
  two at <code>x = 2</code> are processed in whatever order the sort leaves them,
  and the second of each pair adds area 0, so the order does not matter. Each
  update touches O(log m) nodes, and there are 2n updates, so the whole sweep is
  O(n log n) after sorting, with O(n) space.
</p>
<div class="warn">
  <span class="ttl">⚠ Union-area pitfalls</span>
  Areas overflow. A single rectangle with coordinates up to 10<sup>9</sup> has area
  10<sup>18</sup>, far beyond 2<sup>53</sup>, which is why the code multiplies in
  <code>BigInt</code>. A problem that asks for the area modulo 10<sup>9</sup> + 7
  wants <code>Number(area % 1000000007n)</code> at the very end. Use the same
  <code>[from, to)</code> pair for a rectangle's removal as for its insertion, or
  the counts do not cancel. And skip rectangles with zero width or height: they
  add nothing, and a zero-height one would build an empty range.
</div>

<h3>Geometry in integers: cross product and orientation</h3>
<p>
  The rest of the chapter is plane geometry, and nearly all of it rests on one
  operation. For vectors <code>u = (ux, uy)</code> and <code>v = (vx, vy)</code>,
  the <b>cross product</b> is the number <code>ux · vy - uy · vx</code>. To see what
  it means, write the vectors by length and angle,
  <code>u = |u| (cos α, sin α)</code> and <code>v = |v| (cos β, sin β)</code>. Then
  the cross product is <code>|u| |v| (cos α sin β - sin α cos β)</code>, which is
  <code>|u| |v| sin(β - α)</code>. Its sign is the sign of the sine of the angle
  you turn through to get from <code>u</code> to <code>v</code>: positive for a
  counter-clockwise turn of less than a half turn, negative for clockwise, and
  zero when the vectors are parallel or one is zero. Its size is the area of the
  parallelogram the two vectors span.
</p>
<p>
  For three points, take the vectors from <code>o</code> to <code>a</code> and from
  <code>o</code> to <code>b</code>. Walking <code>o → a → b</code> turns left if the
  cross product is positive, right if negative, and goes straight (or back on
  itself) if zero.
</p>
<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="Three small diagrams of walking from o to a to b: a left turn with positive cross product, a right turn with negative cross product, and three points on one line with cross product zero">
    <g class="rough">
      <path class="ln" d="M30,110 L120,110 L160,40" />
      <path class="ln" d="M250,70 L340,70 L380,140" />
      <path class="ln" d="M470,90 L540,90 L610,90" />
    </g>
    <text class="lbl" x="22" y="130">o</text>
    <text class="lbl" x="116" y="130">a</text>
    <text class="lbl" x="164" y="36">b</text>
    <text class="lbl" x="242" y="90">o</text>
    <text class="lbl" x="336" y="90">a</text>
    <text class="lbl" x="384" y="158">b</text>
    <text class="lbl" x="462" y="110">o</text>
    <text class="lbl" x="536" y="110">a</text>
    <text class="lbl" x="606" y="110">b</text>
    <text class="sm gr" x="100" y="176" text-anchor="middle">cross &gt; 0: left turn</text>
    <text class="sm rd" x="320" y="176" text-anchor="middle">cross &lt; 0: right turn</text>
    <text class="sm" x="540" y="176" text-anchor="middle">cross = 0: collinear</text>
  </svg>
  <figcaption>The sign of the cross product is the turn direction, drawn here with y pointing up.</figcaption>
</figure>
<pre><code>function cross(o, a, b) {
  return (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
}

function orientation(o, a, b) {
  const c = cross(o, a, b);
  return c &gt; 0 ? 1 : c &lt; 0 ? -1 : 0; <span class="c">// 1: left turn, -1: right turn, 0: collinear</span>
}</code></pre>
<p class="sub">
  <code>orientation</code> reduces the number to -1, 0 or 1. Keep to that sign
  whenever you only need the direction: the size of <code>cross</code> is easy to
  overflow, while its sign is all the algorithms below use. One caution about
  pictures: on a screen, y grows downward, which mirrors the plane, so a "left
  turn" in the formula looks clockwise there. Decide by the sign and the formula,
  not by how the points look on screen.
</p>
<p>
  <b>Exactness.</b> With integer coordinates every operation here is an integer
  operation, so the result is exact, and zero really means collinear. A
  <code>Number</code> holds integers exactly up to 2<sup>53</sup>, about
  9 · 10<sup>15</sup>. If every coordinate has absolute value at most M, each
  difference is at most 2M, each product at most 4M², and the cross product at most
  8M². That stays below 2<sup>53</sup> while M is up to about 3 · 10<sup>7</sup>.
  Beyond that, use <code>BigInt</code>, shown in the floating-point section.
</p>
<h4>Collinear points and the point-on-segment test</h4>
<p>
  Three points are collinear when <code>cross(a, b, c) === 0</code>. That says
  <code>c</code> is on the <em>line</em> through <code>a</code> and <code>b</code>,
  not on the segment between them. To restrict it to the segment, add the bounding
  box check: <code>c</code> must lie between the endpoints in x and in y.
</p>
<pre><code>function onSegment(a, b, p) {
  return (
    cross(a, b, p) === 0 &amp;&amp;
    Math.min(a[0], b[0]) &lt;= p[0] &amp;&amp; p[0] &lt;= Math.max(a[0], b[0]) &amp;&amp;
    Math.min(a[1], b[1]) &lt;= p[1] &amp;&amp; p[1] &lt;= Math.max(a[1], b[1])
  );
}</code></pre>
<p class="sub">
  Why the box is enough once the point is on the line: along a line, x and y both
  change steadily, so a point between the endpoints in the coordinate that varies
  is between them on the line. For a vertical segment the x test is trivially true
  and the y test does the work; for a horizontal one it is the other way round.
  A degenerate "segment" with <code>a === b</code> has cross product 0 for every
  <code>p</code>, and the box shrinks to a single point, so only <code>p === a</code>
  passes, which is correct. This is O(1).
</p>
<h4>Do two segments intersect?</h4>
<p>
  Segment <code>ab</code> and segment <code>cd</code> cross properly when
  <code>c</code> and <code>d</code> are on opposite sides of the line through
  <code>a</code> and <code>b</code>, <em>and</em> <code>a</code> and <code>b</code>
  are on opposite sides of the line through <code>c</code> and <code>d</code>.
  Opposite sides means the two orientations differ. Both conditions are needed: the
  first says that segment <code>cd</code> crosses the line through <code>ab</code>,
  but not that it crosses the segment <code>ab</code> itself, and the second closes
  that gap from the other side.
</p>
<p>
  Write the comparison as "the two orientations differ", not as "the product of two
  cross products is negative". A zero is then its own side, and the same test also
  accepts an endpoint that lies on the other segment (a T) and two segments that
  share an endpoint, which is what interviewers like to probe. What it cannot see
  is the case where both endpoints of one segment lie on the other's line, so two
  orientations are 0 and equal: the segments are collinear and may overlap or leave
  a gap. A segment that has shrunk to a single point lands there too. For those,
  check whether an endpoint of one segment lies inside the other: orientation 0
  <em>and</em> inside its bounding box.
</p>
<pre><code>function segmentsIntersect(a, b, c, d) {
  const o1 = orientation(a, b, c), o2 = orientation(a, b, d);
  const o3 = orientation(c, d, a), o4 = orientation(c, d, b);
  if (o1 !== o2 &amp;&amp; o3 !== o4) return true; <span class="c">// each segment straddles the other's line</span>
  if (o1 === 0 &amp;&amp; onSegment(a, b, c)) return true; <span class="c">// an endpoint lies on the other segment</span>
  if (o2 === 0 &amp;&amp; onSegment(a, b, d)) return true;
  if (o3 === 0 &amp;&amp; onSegment(c, d, a)) return true;
  if (o4 === 0 &amp;&amp; onSegment(c, d, b)) return true;
  return false;
}</code></pre>
<h4>Dry run on seven cases</h4>
<table>
  <tr><th>Case</th><th>a, b, c, d</th><th>o1, o2, o3, o4</th><th>What decides</th><th>Result</th></tr>
  <tr><td>X crossing</td><td>(0,0) (4,4) (0,4) (4,0)</td><td>1, -1, -1, 1</td><td>o1 ≠ o2 and o3 ≠ o4</td><td>true</td></tr>
  <tr><td>T: an end on the other</td><td>(0,0) (4,0) (2,0) (2,3)</td><td>0, 1, 1, -1</td><td>o1 ≠ o2 and o3 ≠ o4, although o1 is 0</td><td>true</td></tr>
  <tr><td>shared endpoint</td><td>(0,0) (2,2) (2,2) (4,0)</td><td>0, -1, -1, 0</td><td>o1 ≠ o2 and o3 ≠ o4</td><td>true</td></tr>
  <tr><td>collinear, overlapping</td><td>(0,0) (3,3) (2,2) (5,5)</td><td>0, 0, 0, 0</td><td>the first test cannot fire; (2,2) is on ab</td><td>true</td></tr>
  <tr><td>collinear, a gap</td><td>(0,0) (1,1) (2,2) (3,3)</td><td>0, 0, 0, 0</td><td>no endpoint lies inside the other segment</td><td>false</td></tr>
  <tr><td>parallel</td><td>(0,0) (4,0) (0,1) (4,1)</td><td>1, 1, -1, -1</td><td>o1 = o2, and nothing is 0</td><td>false</td></tr>
  <tr><td>near miss: lines cross, segments do not</td><td>(0,0) (4,0) (5,-1) (5,1)</td><td>-1, 1, 1, 1</td><td>o3 = o4: a and b are on the same side of cd</td><td>false</td></tr>
</table>
<p class="sub">
  In the T case <code>c</code> is on the line of <code>ab</code> while <code>d</code>
  is off it, and <code>a</code> and <code>b</code> fall on opposite sides of the line
  through <code>cd</code>, so the first test reports the touch even though
  <code>o1</code> is 0. In the two all-zero rows the first test cannot fire, since
  <code>o1 === o2</code>, and only the endpoint checks can say true. Two collinear
  segments that overlap always have an endpoint of one inside the other, so those
  four checks are enough. Across 200,000 random pairs of segments on a 5 × 5 grid,
  including collinear, touching and single-point segments, the function matched an
  independent exact calculation every time, and it gave the same answer with the two
  segments swapped or their endpoints reversed.
</p>
<div class="warn">
  <span class="ttl">⚠ Segment pitfalls</span>
  Do not test <code>cross1 * cross2 &lt; 0</code>: the product of two large cross
  products can overflow even when each is exact, and it also loses the zero case.
  Compare the orientations, which are only -1, 0 and 1. Do not stop after the
  first test; the collinear case needs the four endpoint checks. And do not assume
  the endpoints come in a convenient order: swapping <code>a</code> with
  <code>b</code>, or one segment with the other, must not change the answer.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll use integer cross products so the
  result is exact. Segments cross if each one's endpoints are on opposite sides of
  the other's line. Then I'll handle the zero cases: an endpoint on the other
  segment, and the collinear overlap, with a bounding-box check."
</div>

<h3>Polygon area by the shoelace formula</h3>
<p>
  The cross product gives the area of a triangle: for the triangle
  <code>o, a, b</code> it is half of <code>cross(o, a, b)</code>, with a sign. A
  polygon with vertices <code>p0, p1, ..., p(n-1)</code> given in order around its
  boundary can be cut into the fan of triangles
  <code>(p0, p1, p2), (p0, p2, p3), ...</code>. Adding their signed areas gives the
  polygon's area, and this holds for concave polygons too. A fan triangle can
  stick out of a concave polygon, but each triangle carries the sign of its own
  turn, so a piece that sticks out is counted once forwards and once backwards by
  the triangles of the fan, and cancels. It is called the shoelace formula
  because, written out in coordinates, the products cross like laces.
</p>
<pre><code>function doubledArea(polygon) {
  let sum = 0;
  for (let i = 1; i + 1 &lt; polygon.length; i++) {
    sum += cross(polygon[0], polygon[i], polygon[i + 1]); <span class="c">// the triangle fan from vertex 0</span>
  }
  return sum; <span class="c">// positive for counter-clockwise, negative for clockwise</span>
}</code></pre>
<p class="sub">
  The function returns <em>twice</em> the area, as an integer, which avoids the
  halves and keeps the arithmetic exact; divide by 2 at the end if you need the
  area itself. The sign tells the orientation: positive when the vertices run
  counter-clockwise, negative for clockwise, so <code>Math.abs</code> gives the
  area and the sign is a free orientation test. For the rectangle
  <code>[[0, 0], [4, 0], [4, 3], [0, 3]]</code> the fan has two triangles with
  doubled areas 12 and 12, so the result is 24 and the area is 12. For the concave
  polygon <code>[[0, 0], [6, 0], [6, 6], [3, 2], [0, 6]]</code> it returns 48, an
  area of 24, and reversing the vertex order gives -48. Time is O(n), space O(1).
</p>
<p>
  <b>A cross-check you can trust.</b> For a polygon whose vertices all have integer
  coordinates, Pick's theorem says that area = I + B / 2 - 1, where I is the number
  of lattice points strictly inside and B the number on the boundary. B is the sum
  of <code>gcd(|dx|, |dy|)</code> over the edges, using the gcd from the
  <a href="/dsa/dsa-math">math chapter</a>: an edge from one lattice point to
  another contributes exactly that many lattice points, counting one of its ends. In the chapter's checks, the shoelace
  result equalled <code>2I + B - 2</code> on three thousand random polygons.
</p>
<div class="warn">
  <span class="ttl">⚠ Shoelace pitfalls</span>
  The vertices must be in boundary order, not sorted. A polygon whose edges cross
  itself does not have an "area" this formula can report; the signed pieces
  cancel in ways that mean nothing. Repeating the first vertex at the end adds a
  degenerate triangle of area 0, which is harmless, and fewer than 3 vertices give
  0. For large coordinates the cross products can leave the safe range, so the
  <code>BigInt</code> version applies.
</div>

<h3>Point in polygon by ray casting</h3>
<p>
  Is a point inside a polygon, possibly a concave one? Shoot a ray from the point
  to the right, to infinity, and count how many edges it crosses. Each crossing
  switches between outside and inside, and the far end of the ray is outside, so
  the point is inside exactly when the count is odd. That is the whole idea. The
  difficulty is in the edge cases, and an exact integer test removes all of them.
</p>
<p>
  Three things go wrong if you code it carelessly:
</p>
<ul>
  <li><b>The ray passes through a vertex.</b> Two edges meet there, and a naive test counts the crossing twice, or not at all.</li>
  <li><b>An edge lies along the ray.</b> A horizontal edge on the ray's row has no single crossing point.</li>
  <li><b>The point is on the boundary.</b> Neither "inside" nor "outside" is obviously right.</li>
</ul>
<p>
  The first two are solved by one half-open rule. Count an edge only when
  <code>(a.y &gt; p.y) !== (b.y &gt; p.y)</code>: exactly one endpoint is strictly
  above the ray's row. This treats a vertex exactly on the row as if it were
  slightly <em>below</em> the ray, so the ray never actually touches a vertex. An
  edge ending on the row is counted only if its other end is above, once, and a
  horizontal edge, which has both ends on the same side, is never counted. For an
  edge that passes the test, decide whether the crossing is to the right of the
  point with the cross product sign: for an edge going up, the point must be on its
  left (<code>cross &gt; 0</code>); for an edge going down, on its right
  (<code>cross &lt; 0</code>). No division and no rounding are involved. The
  boundary is handled first, with <code>onSegment</code>.
</p>
<pre><code>function pointInPolygon(p, polygon) {
  let crossings = 0;
  for (let i = 0; i &lt; polygon.length; i++) {
    const a = polygon[i], b = polygon[(i + 1) % polygon.length];
    if (onSegment(a, b, p)) return "boundary";
    if ((a[1] &gt; p[1]) !== (b[1] &gt; p[1])) { <span class="c">// the edge straddles the row of p; a flat edge never does</span>
      const side = cross(a, b, p);
      if (b[1] &gt; a[1] ? side &gt; 0 : side &lt; 0) crossings++; <span class="c">// the crossing lies to the right of p</span>
    }
  }
  return crossings % 2 === 1 ? "inside" : "outside";
}</code></pre>
<h4>Dry run: the diamond [[2, 0], [4, 2], [2, 4], [0, 2]] and the point (1, 2)</h4>
<p class="sub">The ray from (1, 2) runs right along y = 2, straight through the vertex (4, 2).</p>
<table>
  <tr><th>Edge</th><th>One end strictly above y = 2?</th><th>cross(a, b, p)</th><th>Counted?</th></tr>
  <tr><td>(2,0) to (4,2)</td><td>no: 0 and 2 are both not above 2</td><td>not computed</td><td>no</td></tr>
  <tr><td>(4,2) to (2,4)</td><td>yes: only (2,4) is above</td><td>6, edge goes up, positive</td><td>yes</td></tr>
  <tr><td>(2,4) to (0,2)</td><td>yes: only (2,4) is above</td><td>2, edge goes down, needs negative</td><td>no</td></tr>
  <tr><td>(0,2) to (2,0)</td><td>no</td><td>not computed</td><td>no</td></tr>
</table>
<p class="sub">
  One crossing, an odd count, so the point is inside, which is right. The vertex
  (4, 2) was used by two edges but counted once. A naive rule that counts an edge
  whenever the row lies <em>between</em> its ends inclusively counts both edges at
  (4, 2) and gets 2, an even number, so it calls the point outside. The same
  function reports <code>(5, 2)</code> as outside, <code>(4, 2)</code> as the
  boundary and <code>(2, 2)</code> as inside. Time is O(n) per point and space is
  O(1).
</p>
<div class="warn">
  <span class="ttl">⚠ Point-in-polygon pitfalls</span>
  Decide with the interviewer whether a boundary point counts as inside; the code
  returns three answers precisely so the caller can choose. Keep the
  <code>onSegment</code> test before the ray count, or a point on an edge is
  classified inconsistently: the half-open rule calls it inside on one side of the
  polygon and outside on the other. Use the identical comparison, <code>&gt; p.y</code>,
  on both ends of every edge: mixing <code>&gt;</code> and <code>&gt;=</code> from
  one edge to the next makes a shared vertex count differently for its two edges.
  For a <em>convex</em> polygon with counter-clockwise vertices there is a simpler test:
  the point is inside or on the boundary exactly when
  <code>cross(a, b, p) &gt;= 0</code> for every edge.
</div>

<h3>Rectangles: overlap, area and the perfect rectangle</h3>
<p>
  An axis-aligned rectangle is <code>[x1, y1, x2, y2]</code> with
  <code>x1 &lt; x2</code> and <code>y1 &lt; y2</code>: bottom-left and top-right
  corners. Two rectangles overlap in a region of positive area exactly when their
  x-ranges overlap <em>and</em> their y-ranges overlap. Two ranges
  <code>(a1, a2)</code> and <code>(b1, b2)</code> overlap when
  <code>a1 &lt; b2</code> and <code>b1 &lt; a2</code>, the same test as the My
  Calendar check in the intervals chapter.
</p>
<pre><code>function rectanglesOverlap(a, b) {
  return a[0] &lt; b[2] &amp;&amp; b[0] &lt; a[2] &amp;&amp; a[1] &lt; b[3] &amp;&amp; b[1] &lt; a[3]; <span class="c">// strict: sharing an edge is not overlap</span>
}

function overlapArea(a, b) {
  const width = Math.min(a[2], b[2]) - Math.max(a[0], b[0]);
  const height = Math.min(a[3], b[3]) - Math.max(a[1], b[1]);
  return Math.max(0, width) * Math.max(0, height); <span class="c">// clamp each side separately, then multiply</span>
}

function totalArea(a, b) {
  const area = (r) =&gt; (r[2] - r[0]) * (r[3] - r[1]);
  return area(a) + area(b) - overlapArea(a, b);
}</code></pre>
<p class="sub">
  The comparisons are strict, so two rectangles that share only an edge or a
  corner do not overlap. If a problem counts touching as overlap, use
  <code>&lt;=</code>, and say so. For the area, each side of the overlap is the
  smaller of the two top values minus the larger of the two bottom values, and
  that can be negative when the rectangles are apart. Clamp <em>each side</em> at 0
  before multiplying. Clamping only the product is the classic bug: two negative
  sides multiply to a positive number, and rectangles that are apart in both
  directions would report a phantom overlap. The union of two rectangles has area
  <code>A + B - overlap</code>. All three functions are O(1), and they agreed with a
  cell-by-cell count on twenty thousand random pairs.
</p>
<h4>The perfect rectangle: two checks, each catching what the other misses</h4>
<p>
  Given n rectangles, do they fit together to cover one larger rectangle exactly,
  with no gaps and no overlaps? Two tests, both linear:
</p>
<ol>
  <li><b>The areas add up.</b> The sum of the rectangle areas must equal the area of the bounding box, the smallest rectangle containing all of them.</li>
  <li><b>The corners cancel.</b> Look at every corner of every rectangle. In a perfect tiling, a point where tiles meet is a corner of an even number of them: a point inside a straight edge of one tile is the corner of two neighbours, and a point where four tiles meet is the corner of all four. Only the four corners of the whole bounding box belong to exactly one tile. So toggle each corner in a set, adding it if absent and removing it if present. At the end, exactly the four bounding-box corners must be left.</li>
</ol>
<pre><code>function isRectangleCover(rects) {
  let left = Infinity, bottom = Infinity, right = -Infinity, top = -Infinity, area = 0;
  const corners = new Set();
  const toggle = (x, y) =&gt; {
    const key = x + "," + y;
    if (corners.has(key)) corners.delete(key);
    else corners.add(key);
  };
  for (const [x1, y1, x2, y2] of rects) {
    left = Math.min(left, x1);
    bottom = Math.min(bottom, y1);
    right = Math.max(right, x2);
    top = Math.max(top, y2);
    area += (x2 - x1) * (y2 - y1);
    toggle(x1, y1);
    toggle(x1, y2);
    toggle(x2, y1);
    toggle(x2, y2);
  }
  if (area !== (right - left) * (top - bottom)) return false;
  return (
    corners.size === 4 &amp;&amp;
    corners.has(left + "," + bottom) &amp;&amp; corners.has(left + "," + top) &amp;&amp;
    corners.has(right + "," + bottom) &amp;&amp; corners.has(right + "," + top)
  );
}</code></pre>
<p class="sub">
  Neither test is enough alone, and it is worth seeing why. The two rectangles
  <code>[0, 0, 1, 2]</code> and <code>[0, 0, 2, 1]</code> overlap in a unit square
  and leave a unit gap at the top right, so the area is 2 + 2 = 4, which equals the
  2 × 2 bounding box and passes the first check; but the corner (0, 0) is toggled
  twice and disappears, so the second check fails. Three copies of
  <code>[0, 0, 1, 1]</code> toggle every corner three times, so exactly the four
  box corners remain and the second check passes, but the area 3 is not 1, so the
  first check fails. Together they catch both.
</p>
<p>
  A note on how much to trust the pair. The necessity of both tests is the argument
  above. That the two together are also sufficient is true, but the proof is longer
  than the code. What this chapter relies on is a brute-force comparison: every set
  of up to 5 rectangles on a 3 × 3 grid and up to 4 on a 4 × 4 grid, about 5.3
  million sets in all, plus twenty thousand tilings with one rectangle removed,
  duplicated, stretched, shrunk or shifted, checked cell by cell. It never
  disagreed. Time is O(n) and space is O(n) for the set.
</p>
<h4>Dry run: [[1, 1, 3, 3], [3, 1, 4, 2], [3, 2, 4, 4], [1, 3, 2, 4], [2, 3, 3, 4]]</h4>
<table>
  <tr><th>Rectangle</th><th>Area</th><th>Corners toggled</th></tr>
  <tr><td>[1, 1, 3, 3]</td><td>4</td><td>(1,1) (1,3) (3,1) (3,3)</td></tr>
  <tr><td>[3, 1, 4, 2]</td><td>1</td><td>(3,1) removed; (3,2) (4,1) (4,2) added</td></tr>
  <tr><td>[3, 2, 4, 4]</td><td>2</td><td>(3,2) removed; (3,4) added; (4,2) removed; (4,4) added</td></tr>
  <tr><td>[1, 3, 2, 4]</td><td>1</td><td>(1,3) removed; (1,4) (2,3) (2,4) added</td></tr>
  <tr><td>[2, 3, 3, 4]</td><td>1</td><td>(2,3) removed; (2,4) removed; (3,3) removed; (3,4) removed</td></tr>
</table>
<p class="sub">
  The areas sum to 9, the bounding box is 3 × 3 = 9, and the corners left are
  (1,1), (1,4), (4,1) and (4,4), which are exactly the four box corners. The answer
  is <code>true</code>. The input <code>[[1, 1, 2, 3], [1, 3, 2, 4], [3, 1, 4, 2], [3, 2, 4, 4]]</code>
  leaves the middle column empty: its areas sum to 6 against a box of 9, so the
  first check already fails.
</p>
<div class="warn">
  <span class="ttl">⚠ Perfect-rectangle pitfalls</span>
  The tests assume every rectangle has positive width and height. A zero-area
  rectangle would still toggle corners. Do not forget to compare the box corners by
  value and not only the count of 4: four leftover points that are not the box
  corners fail. Build set keys as strings, such as <code>x + "," + y</code>, rather
  than packing two numbers into one, which can collide. And remember an empty list
  has no bounding box: the code above returns <code>false</code> because the
  infinite bounds never match an area of 0.
</div>

<h3>Maximum points on a line: hash the direction, not the slope</h3>
<p>
  Given n points, find the largest number that lie on one straight line. Testing
  every triple with the cross product is O(n³). The better question is: fix one
  point as an <b>anchor</b>. Every other point gives a direction from the anchor, and
  the points that line up with the anchor are exactly the ones with the same
  direction. So count points per direction with a <code>Map</code>, and the best
  line through the anchor holds the largest count plus the anchor. Repeat for
  every anchor: O(n²) lookups.
</p>
<p>
  The direction is the whole problem. The slope <code>dy / dx</code> looks natural,
  but it fails twice. A vertical line has <code>dx = 0</code> and needs a special
  case, and a division of two integers can give the same floating-point number for
  two different slopes. The exact key is the pair <code>(dy, dx)</code> after two
  normalisations. <b>Reduce it</b> by dividing both by their <code>gcd</code>,
  taken from the <a href="/dsa/dsa-math">math chapter</a>, so that (2, 4), (1, 2)
  and (3, 6) all become (1, 2): two integer vectors are parallel exactly when they
  are the same vector after dividing out the gcd and fixing the sign. <b>Fix the
  sign</b>, so that (1, 2) and (-1, -2), which point opposite ways along the same
  line, get one key: make <code>dx</code> positive, and when <code>dx</code> is 0,
  make <code>dy</code> positive.
</p>
<pre><code>function maxPoints(points) {
  const n = points.length;
  if (n &lt;= 2) return n;
  let best = 1;
  for (let i = 0; i &lt; n; i++) {
    const slopes = new Map();
    let duplicates = 0, onBestLine = 0;
    for (let j = i + 1; j &lt; n; j++) {
      let dx = points[j][0] - points[i][0];
      let dy = points[j][1] - points[i][1];
      if (dx === 0 &amp;&amp; dy === 0) {
        duplicates++; <span class="c">// the same point again belongs to every line through i</span>
        continue;
      }
      const g = gcd(dx, dy);
      dx /= g;
      dy /= g;
      if (dx &lt; 0 || (dx === 0 &amp;&amp; dy &lt; 0)) { <span class="c">// one direction, not two opposite ones</span>
        dx = -dx;
        dy = -dy;
      }
      const key = dy + "/" + dx;
      const count = (slopes.get(key) ?? 0) + 1;
      slopes.set(key, count);
      onBestLine = Math.max(onBestLine, count);
    }
    best = Math.max(best, onBestLine + duplicates + 1);
  }
  return best;
}</code></pre>
<p class="sub">
  Two details deserve a sentence each. The loop looks only at points after the
  anchor (<code>j &gt; i</code>): the best line's lowest-indexed point, used as the
  anchor, sees every other point on that line later in the array, so nothing is
  missed. And a point identical to the anchor lies on every line through the
  anchor, so it is counted separately in <code>duplicates</code> and added to
  whichever direction wins. If every point is the same, <code>onBestLine</code> stays
  0 and the answer is the number of duplicates plus the anchor, which is n.
</p>
<h4>Dry run: anchor (1, 4) among (1,4) (1,1) (3,2) (5,3) (4,1) (2,3)</h4>
<table>
  <tr><th>Point</th><th>(dx, dy)</th><th>gcd</th><th>Key after reducing and fixing the sign</th><th>Count so far</th></tr>
  <tr><td>(1,1)</td><td>(0, -3)</td><td>3</td><td>1/0</td><td>1</td></tr>
  <tr><td>(3,2)</td><td>(2, -2)</td><td>2</td><td>-1/1</td><td>1</td></tr>
  <tr><td>(5,3)</td><td>(4, -1)</td><td>1</td><td>-1/4</td><td>1</td></tr>
  <tr><td>(4,1)</td><td>(3, -3)</td><td>3</td><td>-1/1</td><td>2</td></tr>
  <tr><td>(2,3)</td><td>(1, -1)</td><td>1</td><td>-1/1</td><td>3</td></tr>
</table>
<p class="sub">
  The key is written <code>dy/dx</code>. Three points share <code>-1/1</code>, so
  the line through the anchor holds 3 + 1 = 4 points, the answer for this input. The
  row for (1,1) shows the sign rule: the vertical direction (0, -3) becomes
  <code>1/0</code>, not <code>-1/0</code>. Time is O(n² log C), where C bounds the
  coordinate differences, because each gcd takes a logarithmic number of steps, and
  the space is O(n) for one map.
</p>
<div class="warn">
  <span class="ttl">⚠ Slope-hashing pitfalls</span>
  The single most tested trap: the points (0, 0), (94911150, 94911151) and
  (94911149, 94911150) are not on one line, but the slopes
  <code>94911151 / 94911150</code> and <code>94911150 / 94911149</code> are the
  same <code>Number</code>, so a floating-point key reports 3 points where the
  answer is 2. The reduced integer key gives 2. Also: skip the gcd when both
  differences are zero, because <code>gcd(0, 0)</code> is 0 and dividing by it gives
  <code>NaN</code>; normalise the sign <em>after</em> the division; and let the
  vertical case produce the ordinary key <code>"1/0"</code>, a string, with no
  <code>Infinity</code> and no special branch.
</div>

<h3>Valid square without a single square root</h3>
<p>
  Four points are given in any order. Do they form a square? Trying the orderings
  and checking right angles works but is clumsy. A neater test uses distances. A
  square with side <code>s</code> has six pairwise distances: four equal sides, and
  two equal diagonals. In squared form, which stays in integers, the sides are
  <code>s²</code> and the diagonals are <code>2s²</code> by Pythagoras. So compute
  the six squared distances, sort them, and require four equal smallest values
  that are not zero, then two equal larger values, each twice the smaller.
</p>
<pre><code>function squaredDistance(a, b) {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2;
}

function validSquare(p1, p2, p3, p4) {
  const points = [p1, p2, p3, p4];
  const d = [];
  for (let i = 0; i &lt; 4; i++) {
    for (let j = i + 1; j &lt; 4; j++) d.push(squaredDistance(points[i], points[j]));
  }
  d.sort((a, b) =&gt; a - b);
  return d[0] &gt; 0 &amp;&amp; d[0] === d[3] &amp;&amp; d[4] === d[5] &amp;&amp; d[4] === 2 * d[0]; <span class="c">// four equal sides, two diagonals of twice the square</span>
}</code></pre>
<p class="sub">
  For <code>(0,0) (1,1) (1,0) (0,1)</code> the six squared distances sorted are
  <code>[1, 1, 1, 1, 2, 2]</code>: four of 1, two of 2, and 2 is twice 1, so the
  answer is <code>true</code>. A tilted square such as
  <code>(0,0) (2,1) (1,3) (-1,2)</code> gives <code>[5, 5, 5, 5, 10, 10]</code> and
  is accepted. The parallelogram <code>(0,0) (2,0) (3,1) (1,1)</code>, whose sides
  have two different lengths, gives <code>[2, 2, 2, 4, 4, 10]</code> and is
  rejected. The cost is 6 distances and a sort of 6 numbers: O(1).
</p>
<p>
  <b>Why the pattern is sufficient.</b> That a square produces it is clear. The
  converse needs an argument, because the test never looks at angles. Suppose four
  of the six squared distances equal <code>d &gt; 0</code> and the other two equal
  <code>2d</code>. The two long pairs either share a point or are disjoint.
</p>
<ul>
  <li><b>Disjoint long pairs,</b> say <code>AC</code> and <code>BD</code>: then the four other pairs <code>AB, BC, CD, DA</code> have squared length <code>d</code>. In triangle <code>ABC</code>, <code>AB² + BC² = 2d = AC²</code>, so the angle at B is a right angle, and it is an isosceles right triangle on the hypotenuse <code>AC</code>. The same holds for triangle <code>ADC</code>. There are only two points that make an isosceles right triangle on a given hypotenuse, one on each side of it; D cannot equal B because <code>BD² = 2d &gt; 0</code>, so D is the other one, and ABCD is a square.</li>
  <li><b>Long pairs sharing a point,</b> say <code>PQ</code> and <code>PR</code>: then <code>PS, QR, QS, RS</code> all have squared length <code>d</code>, so Q, R and S form an equilateral triangle of side √d, and P is at distance √d from S and √(2d) from both Q and R. P is then on the perpendicular bisector of QR, which passes through S, at distance √d from S: either on the far side of S from QR or on the same side as QR. Measuring from the midpoint M of QR, S is (√3/2)√d from M, so those two positions are (√3/2 + 1)√d and (1 - √3/2)√d from M, while <code>PQ² = 2d</code> demands <code>PM² = 2d - d/4</code>, that is (√7/2)√d. Neither matches, so this case cannot occur.</li>
</ul>
<p class="sub">
  I also checked the test against a permutation-and-right-angle definition on all
  65,536 ordered quadruples of points from a 4 × 4 grid, and on 100,000 random ones,
  with no disagreement.
</p>
<div class="warn">
  <span class="ttl">⚠ Valid-square pitfalls</span>
  Forgetting the <code>d[0] &gt; 0</code> check accepts four identical points, whose
  six distances are all 0 and satisfy every equality. A rhombus has four equal
  sides but unequal diagonals, so it fails the equal-diagonals check, and a
  rectangle has two different side lengths, so it has no four equal smallest
  distances. Skip square
  roots: <code>Math.sqrt</code> rounds, and the squared comparison is exact.
</div>

<h3>Convex hull by monotone chain (erect the fence)</h3>
<p>
  The <b>convex hull</b> of a set of points is the smallest convex polygon that
  contains all of them: stretch a rubber band around the points and let go. "Erect
  the fence" asks for every point that lies on that band, including points in the
  middle of a straight stretch. The <b>monotone chain</b> method builds the hull in
  two halves and uses nothing but the cross product.
</p>
<p>
  Sort the points by x, breaking ties by y. Build the <em>lower hull</em> going left
  to right with a stack: for each new point <code>p</code>, while the stack has two
  or more points and the last two points <code>a</code>, <code>b</code> together with
  <code>p</code> make a right turn (<code>cross(a, b, p) &lt; 0</code>), pop
  <code>b</code>; then push <code>p</code>. Then do the same over the points in
  reverse order for the <em>upper hull</em>. The two chains joined give the
  boundary in counter-clockwise order.
</p>
<p>
  <b>Why the cross-product test is the right one.</b> The lower hull is the part of
  the boundary you see from below: going left to right it only ever turns left (or
  goes straight), because a right turn would make a dent pointing into the hull.
  Look at what a right turn means for the three points <code>a, b, p</code>, whose
  x values do not decrease. Then <code>b</code> lies strictly above the segment
  from <code>a</code> to <code>p</code> (when x values tie, the same holds with
  "above" read as the vertical order). The point on that segment directly below
  <code>b</code> is a blend of <code>a</code> and <code>p</code>, both in the set,
  so the hull reaches strictly below <code>b</code> there, and <code>b</code> cannot
  be on the lower boundary. Popping it loses nothing. After the pops stop, the last
  two stack points and <code>p</code> make a left turn or go straight, and the
  invariant, "every consecutive triple on the stack turns left or goes straight",
  holds again with <code>p</code> on top. <code>p</code> itself belongs on the stack
  because nothing to its right has been seen yet and it is the newest rightmost
  point of the prefix.
</p>
<p>
  A <b>straight</b> triple, <code>cross === 0</code>, is the one decision that
  differs between versions. The middle point is on the hull boundary but is not a
  corner. "Erect the fence" wants it, so pop only when the cross product is
  strictly negative. A problem that wants only the corners pops on
  <code>&lt;= 0</code> as well.
</p>
<pre><code>function convexHull(points, keepCollinear) {
  const sorted = [...points].sort((a, b) =&gt; a[0] - b[0] || a[1] - b[1]);
  const pts = sorted.filter((p, i) =&gt; i === 0 || p[0] !== sorted[i - 1][0] || p[1] !== sorted[i - 1][1]);
  if (pts.length &lt;= 2) return pts;
  const mustPop = keepCollinear ? (turn) =&gt; turn &lt; 0 : (turn) =&gt; turn &lt;= 0;

  function chain(list) {
    const stack = [];
    for (const p of list) {
      while (stack.length &gt;= 2 &amp;&amp; mustPop(cross(stack[stack.length - 2], stack[stack.length - 1], p))) stack.pop();
      stack.push(p);
    }
    return stack;
  }

  const lower = chain(pts);
  const upper = chain([...pts].reverse());
  const seen = new Set();
  const hull = [];
  for (const p of [...lower, ...upper]) {
    const key = p[0] + "," + p[1];
    if (!seen.has(key)) {
      seen.add(key);
      hull.push(p);
    }
  }
  return hull;
}</code></pre>
<h4>Dry run: [[1,1],[2,0],[2,2],[2,4],[3,3],[4,2]], keeping collinear points</h4>
<p class="sub">Sorted by x then y, the order is (1,1) (2,0) (2,2) (2,4) (3,3) (4,2).</p>
<table>
  <tr><th>Chain</th><th>New point</th><th>Pops (cross &lt; 0)</th><th>Stack afterwards</th></tr>
  <tr><td>lower</td><td>(1,1), (2,0)</td><td>none</td><td>(1,1) (2,0)</td></tr>
  <tr><td>lower</td><td>(2,2)</td><td>none: cross 2</td><td>(1,1) (2,0) (2,2)</td></tr>
  <tr><td>lower</td><td>(2,4)</td><td>none: cross 0, straight, kept</td><td>(1,1) (2,0) (2,2) (2,4)</td></tr>
  <tr><td>lower</td><td>(3,3)</td><td>(2,4) with -2, (2,2) with -2</td><td>(1,1) (2,0) (3,3)</td></tr>
  <tr><td>lower</td><td>(4,2)</td><td>(3,3) with -4</td><td>(1,1) (2,0) (4,2)</td></tr>
  <tr><td>upper</td><td>(4,2), (3,3), (2,4), (2,2), (2,0)</td><td>none, with a straight triple kept</td><td>(4,2) (3,3) (2,4) (2,2) (2,0)</td></tr>
  <tr><td>upper</td><td>(1,1)</td><td>(2,0) with -2, (2,2) with -2</td><td>(4,2) (3,3) (2,4) (1,1)</td></tr>
</table>
<p class="sub">
  Joining the lower chain <code>(1,1) (2,0) (4,2)</code> with the upper chain
  <code>(4,2) (3,3) (2,4) (1,1)</code> and dropping repeats gives
  <code>(1,1) (2,0) (4,2) (3,3) (2,4)</code>. The point (2,2) is correctly absent:
  it is inside the hull. If every point is on one line, both chains hold all of
  them, and removing repeats leaves each once.
</p>
<p>
  <b>Cost.</b> The sort is O(n log n). In each chain every point is pushed once and
  popped at most once, so building both chains is O(n), and the total is
  O(n log n) time and O(n) space. The same code with <code>keepCollinear</code> set
  to <code>false</code> returns only the corners: for the bottom-edge example
  <code>(0,0) (1,0) (2,0) (2,2) (0,2)</code> it returns four points, and with
  <code>true</code> it returns five, including <code>(1,0)</code>.
</p>
<div class="warn">
  <span class="ttl">⚠ Convex-hull pitfalls</span>
  Remove duplicate points first; otherwise a repeated point makes a zero turn that
  the "strictly negative" rule keeps. Handle fewer than three distinct points
  before building chains. Choose <code>&lt;</code> or <code>&lt;=</code> on purpose
  and say which you chose: corners only against every boundary point is the whole
  difference between two problems. The output order is counter-clockwise starting
  at the leftmost-lowest point, and some checkers accept any order while others do
  not, so ask.
</div>

<h3>Closest pair of points</h3>
<p>
  Given n points, find the smallest distance between any two. Comparing all pairs
  is O(n²). Two ways reach O(n log n). The <b>divide and conquer</b> version splits
  the points by x, solves both halves, and repairs the pair that straddles the
  split; it belongs with the other recursive splits in the
  <a href="/dsa/dsa-divide-conquer">divide and conquer chapter</a>. The
  <b>sweep</b> version fits this chapter: process the points in x order and keep the
  already-seen points whose x is within the best distance <code>d</code> found so
  far, ordered by y. For a new point, only the active points whose y is within
  <code>d</code> of it can improve the answer, and a packing argument says there are
  a small constant number of them (the argument below gives at most eight): all pairs among the processed points are at least
  <code>d</code> apart, a box <code>d</code> wide and <code>2d</code> tall splits
  into eight squares of side <code>d / 2</code>, and two points in one such square
  would be closer than <code>d</code>. Finding those neighbours in the y-ordered
  set needs an ordered structure, which the
  <a href="/dsa/dsa-ordered-structures">ordered structures chapter</a> covers.
</p>
<p>
  A short version needs no special structure and is usually fast. Sort by x, and for
  each point scan backwards through the earlier points, stopping as soon as the gap
  in x alone is no smaller than the best distance found so far, because every
  earlier point is at least that far away in x.
</p>
<pre><code>function closestPairSquared(points) {
  const pts = [...points].sort((a, b) =&gt; a[0] - b[0] || a[1] - b[1]);
  let best = Infinity;
  for (let i = 1; i &lt; pts.length; i++) {
    for (let j = i - 1; j &gt;= 0; j--) {
      const dx = pts[i][0] - pts[j][0];
      if (dx * dx &gt;= best) break; <span class="c">// everything further left is at least this far away in x</span>
      const dy = pts[i][1] - pts[j][1];
      best = Math.min(best, dx * dx + dy * dy);
    }
  }
  return best;
}</code></pre>
<p class="sub">
  It returns the <em>squared</em> distance, which is exact in integers and avoids
  the square root; take <code>Math.sqrt</code> only for display. It returns
  <code>Infinity</code> for fewer than two points. The honest cost is O(n²) in the
  worst case: if all points share one x, the gap in x is 0, the early exit never
  fires, and every pair is compared. On well-spread input it does far less, but
  when an interviewer asks for the guaranteed bound, use the sweep with an ordered
  set or the divide and conquer.
</p>

<h3>Floating point: why geometry stays in integers</h3>
<p>
  JavaScript numbers are 64-bit floating point. Every integer up to 2<sup>53</sup>
  is stored exactly, and so is every sum, difference and product of integers whose
  result stays within that range. Geometry with integer input stays exact as
  long as no intermediate value leaves that range. Once it does, the damage is silent: no
  error, just a wrong sign. Here is a concrete case. The points
  <code>o = (0, 0)</code>, <code>a = (94911150, 94911151)</code> and
  <code>b = (94911149, 94911150)</code> are not collinear, since the exact cross
  product is 94911150 · 94911150 - 94911151 · 94911149 = 1. In floating point the two
  products are both <code>9008126394322500</code>, and the cross product comes out
  as 0, "collinear". The slopes <code>94911151 / 94911150</code> and
  <code>94911150 / 94911149</code> are also the same double. When coordinates can be
  this large, <code>BigInt</code> restores exactness:
</p>
<pre><code>function crossBig(o, a, b) {
  const ax = BigInt(a[0]) - BigInt(o[0]), ay = BigInt(a[1]) - BigInt(o[1]);
  const bx = BigInt(b[0]) - BigInt(o[0]), by = BigInt(b[1]) - BigInt(o[1]);
  return ax * by - ay * bx; <span class="c">// exact whatever the size; compare it with 0n</span>
}</code></pre>
<p class="sub">
  <code>crossBig(o, a, b)</code> for the points above returns <code>1n</code>. A
  <code>BigInt</code> is slower and cannot be mixed with a <code>Number</code>, so
  convert the coordinates up front, and compare the result with <code>0n</code>,
  <code>&gt; 0n</code> and <code>&lt; 0n</code>. Use it only when the coordinates
  can exceed about 3 · 10<sup>7</sup>; below that, <code>Number</code> is exact and
  much faster.
</p>
<p>The rules that follow:</p>
<ul>
  <li><b>Compare, do not divide.</b> Ask whether two slopes are equal by cross-multiplying, <code>dy1 * dx2 === dy2 * dx1</code>, while the products stay in the safe range, or by reducing with the gcd, not by comparing quotients.</li>
  <li><b>Compare squared distances.</b> Skip <code>Math.sqrt</code> and <code>Math.hypot</code>: <code>a² + b² &lt; c²</code> is exact for integers and the root is rounded.</li>
  <li><b>Do not use an epsilon on integer input.</b> A tolerance such as <code>Math.abs(x - y) &lt; 1e-9</code> is not transitive: with 0, 0.8e-9 and 1.6e-9, the first two are "equal", the last two are "equal", and the first and last are not. Its right size also depends on the scale of the data. Epsilon belongs to genuinely real-valued input, where you should state the tolerance you chose.</li>
  <li><b>Sort by angle with the cross product,</b> not with <code>Math.atan2</code>, when you can: split the plane into two half-planes first, then compare within a half-plane by the sign of the cross product. Two different directions can have the same <code>atan2</code>: the vectors (94911151, 94911150) and (94911150, 94911149) do.</li>
  <li><b>Leave a note on the range.</b> "Coordinates up to 10<sup>4</sup>, so the cross product is at most about 8 · 10<sup>8</sup> and fits" is a sentence that earns trust in an interview.</li>
</ul>
<p>
  Two small <code>-0</code> facts, since negative zero surfaces whenever a zero is
  negated, as in the sign fix of a direction key. <code>0 * -1</code> is <code>-0</code>, which is
  <code>===</code> to <code>0</code> and prints as <code>"0"</code> in a string
  key, and a <code>Map</code> treats <code>-0</code> and <code>0</code> as one key. So it
  is harmless in comparisons and hash keys, but <code>Object.is(0 * -1, 0)</code>
  is <code>false</code>, which matters only to equality checks built on
  <code>Object.is</code>.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "The coordinates are integers up to
  a bound I'll state, so I'll keep everything in integers: cross products for
  orientation, squared distances for comparisons, and a gcd-reduced pair instead
  of a slope. That avoids every floating-point question, and if the bound were
  larger I would switch the cross product to <code>BigInt</code>."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Buildings, intervals, rectangles or events with start and end coordinates, and a question about "the tallest", "the smallest" or "the total covered" at each moment → a sweep line, with a heap, an ordered set or a segment tree as the active set</li>
  <li>The answer changes only at the endpoints → look at the 2n endpoints only, not the whole range</li>
  <li>Many queries against a fixed set, all known up front → offline: sort the queries (keeping their indices) and sweep; or turn a count into a difference of two prefix counts with binary search</li>
  <li>Coordinates up to 10<sup>9</sup> with few distinct values, and only comparisons matter → coordinate compression, going back to the sorted values when a length is needed</li>
  <li>"Area of the union of rectangles" → a sweep over x with a segment tree over compressed y, or the quadratic slab version when n is small</li>
  <li>"Do these segments touch or cross", "which side of the line", "is this a left turn" → the cross product and orientation, handling the zero cases explicitly</li>
  <li>"Is the point inside this polygon" → ray casting with the half-open rule; "area of this polygon" → the shoelace sum</li>
  <li>"Most points on a line" or "group points by direction" → a gcd-reduced, sign-normalised pair as the key, not a floating-point slope</li>
  <li>"Do these four points form a square" → six squared distances; "which points enclose all the rest" → monotone chain</li>
  <li>Any of the above with huge coordinates → check whether a cross product can pass 2<sup>53</sup>, and switch to <code>BigInt</code> if it can</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>List the four steps of the sweep-line recipe, and say which structure you would pick for "how many", "the largest", "the nearest value" and "the total covered length".</li>
    <li>Explain how the order of a start and an end at the same coordinate follows from closed against half-open, and name two ways to avoid tie-breaking altogether.</li>
    <li>Write the skyline with a heap of <code>[height, right]</code> pairs, and say why lazy deletion is correct and why the sweep must read the height only after all events at one x.</li>
    <li>Answer "flowers in full bloom" as a difference of two binary searches, and say why one bound is <code>&lt;=</code> and the other <code>&lt;</code>.</li>
    <li>Solve the minimum interval for each query offline, and say why sorting the queries makes deleting an ended interval permanent.</li>
    <li>Write coordinate compression from memory and say what it preserves and what it destroys.</li>
    <li>Explain the slab idea behind rectangle union, then how the segment tree's <code>cover</code> and <code>length</code> fields give the covered height without pushing anything down.</li>
    <li>Write <code>cross</code> and <code>orientation</code>, explain why the sign is the turn direction, and state the coordinate range in which <code>Number</code> is exact.</li>
    <li>Write the segment intersection test and trace the T, shared-endpoint, collinear-overlap and collinear-gap cases.</li>
    <li>Compute a polygon's doubled area with the fan of triangles, and read the orientation from its sign.</li>
    <li>Cast a ray with the half-open rule, and show how a vertex on the ray is counted once.</li>
    <li>Compute rectangle overlap area with each side clamped at 0, and explain why the perfect-rectangle test needs both the area check and the corner check.</li>
    <li>Key a direction by a gcd-reduced pair with a fixed sign, and give the example where a floating-point slope fails.</li>
    <li>Test a square by six squared distances, and say why four equal distances plus two double ones is enough.</li>
    <li>Build a convex hull with the monotone chain, explain the pop condition with the cross product, and say which comparison keeps collinear boundary points.</li>
    <li>Say why the closest-pair sweep checks only a constant number of neighbours, and what the short scan does in the worst case.</li>
  </ul>
</div>`,
};
