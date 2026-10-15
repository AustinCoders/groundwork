import type { Chapter } from "../types";

export const dsaIntervals: Chapter = {
  id: "dsa-intervals",
  num: "I14",
  title: "Intervals",
  short: "Intervals",
  levels: ["intermediate"],
  prerequisites: ["dsa-sorting-algorithms", "dsa-heaps-priority-queues"],
  practice: [
    "ex-merge-intervals",
    "ex-insert-interval",
    "ex-non-overlapping-intervals",
    "ex-meeting-rooms",
    "ex-meeting-rooms-ii",
    "ex-remove-covered-intervals",
    "ex-interval-list-intersections",
    "ex-employee-free-time",
    "ex-car-pooling",
    "ex-corporate-flight-bookings",
    "ex-my-calendar-i",
    "ex-minimum-arrows-burst-balloons",
  ],
  ready: true,
  subtitle: "Every interval question starts the same way: sort by start time. Then it's bookkeeping.",
  body: `<h3>The one setup step that unlocks almost everything</h3>
<p>
  Intervals arrive in whatever order the input gives them — which tells
  you nothing useful. Sort them by start time first, and suddenly you only
  ever need to compare each interval against the <em>most recent</em> one
  you've processed, instead of checking against all of them. That single
  sort is the setup step for nearly every interval problem you'll see.
</p>

<h3>Merging overlapping intervals</h3>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="Overlapping intervals on a timeline being merged into fewer, larger intervals after sorting by start time">
    <g class="rough">
      <rect class="box" x="20" y="20" width="140" height="24" />
      <rect class="box" x="120" y="50" width="120" height="24" />
      <rect class="box" x="280" y="20" width="80" height="24" />
      <rect class="boxg" x="420" y="20" width="200" height="24" />
    </g>
    <text class="sm" x="90" y="37" text-anchor="middle">1–4</text>
    <text class="sm" x="180" y="67" text-anchor="middle">3–6</text>
    <text class="sm" x="320" y="37" text-anchor="middle">8–10</text>
    <text class="lbl" x="20" y="90" style="font-size:14px">↓ after merging (1–4 and 3–6 overlap, 8–10 doesn't touch either)</text>
    <text class="sm gr" x="520" y="37" text-anchor="middle">1–6</text>
    <text class="sm" x="320" y="120" style="font-size:14px">result: [1,6], [8,10]</text>
  </svg>
  <figcaption>1–4 and 3–6 share the point 3–4, so they collapse into one interval; 8–10 stays separate.</figcaption>
</figure>
<pre><code>function merge(intervals) {
  if (intervals.length === 0) return []; <span class="c">// nothing to merge — without this guard the result would be [undefined]</span>

  const sorted = [...intervals].sort((a, b) => a[0] - b[0]); <span class="c">// sort a COPY by START — enables the single left-to-right pass</span>

  const result = [[...sorted[0]]]; <span class="c">// copy the first interval, so extending it never writes into the caller's data</span>
  for (let i = 1; i < sorted.length; i++) {
    const [start, end] = sorted[i];
    const last = result[result.length - 1];

    if (start <= last[1]) {
      last[1] = Math.max(last[1], end); <span class="c">// overlaps — extend the last merged interval</span>
    } else {
      result.push([start, end]); <span class="c">// no overlap — starts a new group (a fresh copy)</span>
    }
  }
  return result;
}</code></pre>
<p class="sub">
  Two pitfalls hide in the shorter version, which starts with
  <code>[intervals[0]]</code> and sorts in place. On an empty input it
  returns <code>[undefined]</code>, and because that first element is the
  caller's own inner array, extending it rewrites the input:
  merging <code>[[1,3],[2,6]]</code> would leave the caller holding
  <code>[[1,6],[2,6]]</code>. The sort would also reorder the caller's
  array. The guard and the copies above cost one line each and avoid both.
</p>
<div class="warn">
  <span class="ttl">⚠ "Touching" counts as overlapping unless told otherwise</span>
  <code>[1,4]</code> and <code>[4,6]</code> — do they merge? Most
  problems say yes (use <code>&lt;=</code>), some say no (use
  <code>&lt;</code>). This is exactly the kind of boundary detail worth
  asking the interviewer to clarify before coding, rather than guessing.
</div>

<h3>Meeting Rooms I: can one person attend everything?</h3>
<p>
  The simplest question you can ask of a list of meetings: is there any pair that
  overlaps? Sort by start time. Suppose no earlier pair has clashed. Then the
  meetings so far follow each other in order, and the latest end among them
  belongs to the last one. So the next meeting clashes with something earlier
  exactly when it starts before the end of the one just before it, and one pass
  over sorted neighbours decides the whole question.
</p>
<pre><code>function canAttendMeetings(intervals) {
  const sorted = [...intervals].sort((a, b) =&gt; a[0] - b[0]);
  for (let i = 1; i &lt; sorted.length; i++) {
    if (sorted[i][0] &lt; sorted[i - 1][1]) return false; <span class="c">// starts before the previous one ends</span>
  }
  return true; <span class="c">// back-to-back meetings, where one ends as the next starts, are allowed</span>
}</code></pre>
<p class="sub">
  <code>[[0, 30], [5, 10], [15, 20]]</code> returns <code>false</code>, because
  after sorting, <code>[5, 10]</code> starts at 5, before the 30 at which the
  first meeting ends. <code>[[7, 10], [2, 4]]</code> returns <code>true</code>:
  sorted, 2 to 4 ends before 7. And <code>[[1, 2], [2, 3]]</code> returns
  <code>true</code>: the strict <code>&lt;</code> lets a meeting start at the
  moment the last one ends. Time is O(n log n) for the sort plus a linear pass,
  so the sort dominates. The sort is on a copy, so the caller's order is untouched.
</p>

<h3>Inserting a new interval into an already-sorted, non-overlapping list</h3>
<pre><code>function insert(intervals, newInterval) {
  const result = [];
  let i = 0;

  <span class="c">// 1. everything that ends before newInterval starts — keep as-is</span>
  while (i < intervals.length && intervals[i][1] < newInterval[0]) {
    result.push(intervals[i++]);
  }

  <span class="c">// 2. everything that overlaps newInterval — merge it in</span>
  while (i < intervals.length && intervals[i][0] <= newInterval[1]) {
    newInterval = [
      Math.min(newInterval[0], intervals[i][0]),
      Math.max(newInterval[1], intervals[i][1]),
    ];
    i++;
  }
  result.push(newInterval);

  <span class="c">// 3. everything that starts after newInterval ends — keep as-is</span>
  while (i < intervals.length) result.push(intervals[i++]);

  return result;
}</code></pre>
<p class="sub">
  Three clean phases instead of one tangled loop — this is a genuinely
  common interview shape: split the problem into "before," "during," and
  "after" relative to the thing you're inserting.
</p>

<h3>Interval list intersections: two sorted lists, two pointers</h3>
<p>
  Two people each hand you a sorted list of busy intervals, and inside each list
  the intervals do not overlap. Find every time that both are busy. This is a
  merge, like merging two sorted arrays, and no sort is needed. Look at the
  current interval from each list. Their overlap, if there is one, starts at the
  <em>later</em> start and ends at the <em>earlier</em> end, and exists when that
  start is not after that end. Then advance the pointer of the interval that ends
  first: it cannot overlap anything further along in the other list, because
  everything further along starts after the interval the other pointer is on.
</p>
<pre><code>function intervalIntersection(first, second) {
  const result = [];
  let i = 0, j = 0;
  while (i &lt; first.length &amp;&amp; j &lt; second.length) {
    const start = Math.max(first[i][0], second[j][0]); <span class="c">// the overlap starts at the later start</span>
    const end = Math.min(first[i][1], second[j][1]); <span class="c">// and ends at the earlier end</span>
    if (start &lt;= end) result.push([start, end]); <span class="c">// a single shared point, start === end, still counts</span>
    if (first[i][1] &lt; second[j][1]) i++; <span class="c">// drop the interval that ends first: it cannot meet anything later</span>
    else j++;
  }
  return result;
}</code></pre>
<h4>Dry run: first = [[0, 2], [5, 10], [13, 23], [24, 25]], second = [[1, 5], [8, 12], [15, 24], [25, 26]]</h4>
<table>
  <tr><th>Pair</th><th>start, end</th><th>Overlap?</th><th>Advance</th></tr>
  <tr><td>[0, 2] and [1, 5]</td><td>1, 2</td><td>yes: [1, 2]</td><td>first, which ends at 2</td></tr>
  <tr><td>[5, 10] and [1, 5]</td><td>5, 5</td><td>yes: [5, 5]</td><td>second, which ends at 5</td></tr>
  <tr><td>[5, 10] and [8, 12]</td><td>8, 10</td><td>yes: [8, 10]</td><td>first, which ends at 10</td></tr>
  <tr><td>[13, 23] and [8, 12]</td><td>13, 12</td><td>no: the start is after the end</td><td>second, which ends at 12</td></tr>
  <tr><td>[13, 23] and [15, 24]</td><td>15, 23</td><td>yes: [15, 23]</td><td>first, which ends at 23</td></tr>
  <tr><td>[24, 25] and [15, 24]</td><td>24, 24</td><td>yes: [24, 24]</td><td>second, which ends at 24</td></tr>
  <tr><td>[24, 25] and [25, 26]</td><td>25, 25</td><td>yes: [25, 25]</td><td>first, which ends at 25</td></tr>
</table>
<p class="sub">
  The result is <code>[[1, 2], [5, 5], [8, 10], [15, 23], [24, 24], [25, 25]]</code>.
  Each step advances one pointer, so there are at most
  <code>first.length + second.length</code> steps: O(n + m) time, and the output
  is the only extra space. Three details cost people offers. The test is
  <code>start &lt;= end</code>, not <code>&lt;</code>, because two closed
  intervals that meet at one point, like [1, 5] and [5, 10], share that point;
  the problem is stated with closed intervals, and you should confirm that. The
  pointer to advance is the one with the smaller <em>end</em>, not the smaller
  start. And when the ends are equal, advancing either one is fine, since the
  next step will find no overlap for the other.
</p>

<h3>Employee free time: merge the busy intervals, read the gaps</h3>
<p>
  Several employees each have a list of busy intervals. Find the periods when
  <em>everybody</em> is free, leaving out the time before anyone starts and after
  everyone is done. Everyone free means nobody is busy, so you can ignore which
  employee owns an interval: pour all the intervals into one list and sort by
  start. Now sweep, keeping <code>busyUntil</code>, the latest end seen so far.
  When the next interval starts after <code>busyUntil</code>, the stretch in
  between is free for everyone. This is the merge from the first section, except
  that you report the gaps instead of the merged blocks.
</p>
<pre><code>function employeeFreeTime(schedules) {
  const all = schedules.flat().sort((a, b) =&gt; a[0] - b[0]); <span class="c">// every busy interval of every employee</span>
  const free = [];
  if (all.length === 0) return free;
  let busyUntil = all[0][1];
  for (let i = 1; i &lt; all.length; i++) {
    const [start, end] = all[i];
    if (start &gt; busyUntil) free.push([busyUntil, start]); <span class="c">// nobody is busy in between</span>
    busyUntil = Math.max(busyUntil, end);
  }
  return free;
}</code></pre>
<h4>Dry run: [[[1, 2], [5, 6]], [[1, 3]], [[4, 10]]]</h4>
<table>
  <tr><th>Interval (sorted by start)</th><th>start &gt; busyUntil?</th><th>free time added</th><th>busyUntil</th></tr>
  <tr><td>[1, 2]</td><td>first one</td><td>none</td><td>2</td></tr>
  <tr><td>[1, 3]</td><td>1 &gt; 2? no</td><td>none</td><td>3</td></tr>
  <tr><td>[4, 10]</td><td>4 &gt; 3? yes</td><td>[3, 4]</td><td>10</td></tr>
  <tr><td>[5, 6]</td><td>5 &gt; 10? no</td><td>none</td><td>10</td></tr>
</table>
<p class="sub">
  The only time everyone is free is <code>[[3, 4]]</code>. The line that uses
  <code>Math.max</code> is the one that matters: the interval <code>[5, 6]</code>
  sits entirely inside <code>[4, 10]</code>, and if <code>busyUntil</code> were
  simply set to the latest interval's end, it would drop back to 6 and invent
  free time that is not there. With N intervals in total, sorting costs
  O(N log N) and the sweep is O(N). The employees' lists are already sorted, so
  a k-way merge with a heap would cost O(N log k) instead; the flat sort is the
  one to write first, and the merge is a follow-up you can offer.
</p>

<h3>Minimum number of rooms/resources needed (meeting rooms)</h3>
<p>
  How many overlapping meetings exist <em>at the same time, at once</em>?
  Track starts and ends as separate sorted event streams — whenever a
  meeting starts before the earliest still-running meeting ends, you need
  another room.
</p>
<pre><code>function minMeetingRooms(intervals) {
  const real = intervals.filter(i => i[0] < i[1]); <span class="c">// a [5, 5] meeting takes no time and needs no room</span>
  const starts = real.map(i => i[0]).sort((a, b) => a - b);
  const ends = real.map(i => i[1]).sort((a, b) => a - b);

  let rooms = 0, maxRooms = 0;
  let s = 0, e = 0;
  while (s < starts.length) {
    if (starts[s] < ends[e]) {
      rooms++;       <span class="c">// a meeting started before the earliest one ended</span>
      s++;
    } else {
      rooms--;       <span class="c">// a meeting ended — free up a room</span>
      e++;
    }
    maxRooms = Math.max(maxRooms, rooms);
  }
  return maxRooms;
}</code></pre>
<h4>Dry run: minMeetingRooms([[0, 30], [5, 10], [15, 20]])</h4>
<p class="sub">starts = [0, 5, 15], ends = [10, 20, 30]</p>
<table>
  <tr><th>Step</th><th>Compare</th><th>Action</th><th>rooms</th><th>maxRooms</th></tr>
  <tr><td>1</td><td>starts[0]=0 &lt; ends[0]=10</td><td>a meeting started — rooms++</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>starts[1]=5 &lt; ends[0]=10</td><td>another started before the first ended — rooms++</td><td>2</td><td>2</td></tr>
  <tr><td>3</td><td>starts[2]=15 &lt; ends[0]=10? no</td><td>a meeting ended first — rooms--</td><td>1</td><td>2</td></tr>
  <tr><td>4</td><td>starts[2]=15 &lt; ends[1]=20</td><td>the third meeting started — rooms++</td><td>2</td><td>2</td></tr>
</table>
<p class="sub">
  <code>rooms</code> peaks at 2, while [0,30] and [5,10] overlap. By the
  time the third meeting, [15,20], starts, [5,10] has already ended and
  freed its room — so [15,20] reuses that one instead of needing a third.
  Two rooms cover all three meetings. The <code>filter</code> drops
  zero-length meetings such as [5, 5]: a tie counts as "ended first", so the
  end of [5, 5] would be swept before its own start, <code>e</code> would run
  past the array and the loop would never end.
</p>
<p class="sub">
  This is the same idea as the sliding-window pattern from the beginner
  tier, applied to time instead of an array — "how many things are active
  at once" is a two-pointer sweep over sorted event boundaries.
</p>
<p class="sub">
  A min-heap solves the same problem too: push each meeting's end time
  when it starts, and if the heap's minimum end time is ≤ the new
  meeting's start, pop it (reuse that room) instead of allocating a new
  one — heap size at the end is the room count. Both approaches are
  O(n log n); the two-pointer version above just avoids the heap's
  constant-factor overhead.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll sort by start time
  first so I only ever need to compare each interval against the most
  recently processed one — that turns an all-pairs comparison into a
  single linear pass."
</div>

<h3>Meeting Rooms II with a heap, written out</h3>
<p>
  The paragraph above described the heap solution in words. Here it is as code,
  because it is the version that generalises: the heap only needs the meetings to
  arrive in order of start time, one at a time, and the same shape answers "which
  room is free first". JavaScript has no built-in heap, so this uses a short binary
  min-heap of end times. The idea is to process meetings in order of start time
  and keep one entry per room in use, namely the time at which that room frees
  up. The smallest entry, the top of the heap, is the room that frees up first.
  If it is free by the time the new meeting starts, reuse that room, and
  otherwise a new room is needed. In both cases the new meeting's end time goes
  into the heap.
</p>
<pre><code>class MinHeap {
  constructor() {
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
      if (a[parent] &lt;= a[i]) break;
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
        let smallest = i;
        if (left &lt; a.length &amp;&amp; a[left] &lt; a[smallest]) smallest = left;
        if (right &lt; a.length &amp;&amp; a[right] &lt; a[smallest]) smallest = right;
        if (smallest === i) break;
        [a[smallest], a[i]] = [a[i], a[smallest]];
        i = smallest;
      }
    }
    return top;
  }
}</code></pre>
<pre><code>function minMeetingRoomsHeap(intervals) {
  const meetings = intervals.filter(([start, end]) =&gt; start &lt; end).sort((a, b) =&gt; a[0] - b[0]);
  const endTimes = new MinHeap(); <span class="c">// one end time per room that is in use</span>
  for (const [start, end] of meetings) {
    if (endTimes.size &gt; 0 &amp;&amp; endTimes.peek() &lt;= start) {
      endTimes.pop(); <span class="c">// the room that frees up first is free by now: reuse it</span>
    }
    endTimes.push(end); <span class="c">// this meeting occupies a room until its end</span>
  }
  return endTimes.size;
}</code></pre>
<h4>Dry run: [[0, 30], [5, 10], [15, 20]]</h4>
<table>
  <tr><th>Meeting</th><th>heap before</th><th>top ≤ start?</th><th>heap after</th></tr>
  <tr><td>[0, 30]</td><td>empty</td><td>no room yet</td><td>{30}</td></tr>
  <tr><td>[5, 10]</td><td>{30}</td><td>30 ≤ 5? no, a second room</td><td>{10, 30}</td></tr>
  <tr><td>[15, 20]</td><td>{10, 30}</td><td>10 ≤ 15? yes, reuse that room</td><td>{20, 30}</td></tr>
</table>
<p class="sub">
  The heap ends with 2 entries, so 2 rooms. The test is <code>&lt;=</code>: a
  room that frees at 15 can host a meeting that starts at 15, which matches the
  two-array sweep above, where a tie counts as "ended first". Each of the n
  meetings does one push and at most one pop, each O(log n), so the time is
  O(n log n) and the heap holds at most as many entries as there are rooms. The
  heap can also tell you <em>which</em> room is free, not just how many, once
  each entry stores a room number beside its end time, which is what a follow-up
  such as "assign each meeting a room number" needs. The
  <code>filter</code> at the top drops zero-length meetings for the same reason
  as before.
</p>

<h3>Non-overlapping intervals: remove the fewest, sorting by end</h3>
<p>
  Given intervals, remove as few as possible so that the rest do not overlap.
  Removing the fewest is the same as keeping the most, and keeping the most
  non-overlapping intervals is exactly the activity-selection problem from the
  <a href="/dsa/dsa-greedy">greedy chapter</a>: sort by <b>end</b> time, keep an
  interval whenever it starts at or after the end of the last one kept, and
  count the ones you skip. The sort key is what makes it work. An interval that
  ends earliest leaves the most room, so keeping it can never cost a later
  choice.
</p>
<pre><code>function eraseOverlapIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) =&gt; a[1] - b[1]); <span class="c">// by END: keep whatever frees the line soonest</span>
  let removed = 0, lastEnd = -Infinity;
  for (const [start, end] of sorted) {
    if (start &gt;= lastEnd) {
      lastEnd = end; <span class="c">// fits after the last kept interval: keep it</span>
    } else {
      removed++; <span class="c">// clashes with the kept one, which ends no later: drop this one</span>
    }
  }
  return removed;
}</code></pre>
<h4>Dry run: [[1, 2], [2, 3], [3, 4], [1, 3]]</h4>
<p class="sub">sorted by end: [1, 2], [2, 3], [1, 3], [3, 4]</p>
<table>
  <tr><th>Interval</th><th>start ≥ lastEnd?</th><th>action</th><th>lastEnd</th><th>removed</th></tr>
  <tr><td>[1, 2]</td><td>1 ≥ -∞</td><td>keep</td><td>2</td><td>0</td></tr>
  <tr><td>[2, 3]</td><td>2 ≥ 2</td><td>keep</td><td>3</td><td>0</td></tr>
  <tr><td>[1, 3]</td><td>1 ≥ 3? no</td><td>remove</td><td>3</td><td>1</td></tr>
  <tr><td>[3, 4]</td><td>3 ≥ 3</td><td>keep</td><td>4</td><td>1</td></tr>
</table>
<p class="sub">
  One interval has to go. The comparison is <code>&gt;=</code> because
  intervals that merely touch, like [1, 2] and [2, 3], do not overlap here. If
  the problem says touching counts as an overlap, the comparison becomes
  <code>&gt;</code>; ask. Time is O(n log n), space O(1) beyond the sorted copy.
</p>
<p>
  You can also sort by <b>start</b>, and it works if you handle a clash
  carefully. Walk the sorted list. When the next interval overlaps the last one
  you kept, you must drop one of the two, and you drop the one that ends
  <em>later</em>, because the one that ends sooner leaves more room.
</p>
<pre><code>function eraseOverlapByStart(intervals) {
  if (intervals.length === 0) return 0;
  const sorted = [...intervals].sort((a, b) =&gt; a[0] - b[0]); <span class="c">// by START instead</span>
  let removed = 0, lastEnd = sorted[0][1];
  for (let i = 1; i &lt; sorted.length; i++) {
    const [start, end] = sorted[i];
    if (start &gt;= lastEnd) {
      lastEnd = end;
    } else {
      removed++; <span class="c">// a clash: of the two, drop the one that ends later</span>
      lastEnd = Math.min(lastEnd, end);
    }
  }
  return removed;
}</code></pre>
<p class="sub">
  This version returns the same counts, and it is useful to know because it
  shows what the sort-by-end trick buys you: with the end sort you never have to
  decide which of two clashing intervals to drop, since the one you already kept
  always ends first. The start-sorted version needs the extra
  <code>Math.min</code> on a clash, and forgetting it, so that
  <code>lastEnd</code> stays at the larger end, is the classic bug.
</p>

<h3>Remove covered intervals: sort start up, end down</h3>
<p>
  An interval is covered if another one contains it completely. Count the
  intervals that are not covered. Sort by start ascending. Then every interval
  that could cover the current one comes earlier or ties on the start, and the
  current one is covered exactly when some earlier interval's end reaches at
  least as far. So keep the largest end seen so far: if the current end is bigger,
  the interval is not covered and it becomes the new maximum.
</p>
<p>
  The tie-break is the part that is easy to get wrong. When two intervals share a
  start, the longer one must come first. Sorted with the longer first, the
  shorter one then fails the "reaches farther" test and is correctly counted as
  covered. If the shorter one came first, it would be counted and kept, and then
  the longer one would be kept too, although the longer one covers it.
</p>
<pre><code>function removeCoveredIntervals(intervals) {
  const sorted = [...intervals].sort((a, b) =&gt; a[0] - b[0] || b[1] - a[1]); <span class="c">// start up, then end DOWN</span>
  let kept = 0, maxEnd = -Infinity;
  for (const [, end] of sorted) {
    if (end &gt; maxEnd) { <span class="c">// reaches farther than everything before it: not covered</span>
      kept++;
      maxEnd = end;
    }
  }
  return kept;
}</code></pre>
<p class="sub">
  For <code>[[1, 4], [3, 6], [2, 8]]</code> the sorted order is
  <code>[1, 4], [2, 8], [3, 6]</code>. The first is kept (<code>maxEnd = 4</code>),
  the second reaches 8 and is kept, and the third reaches only 6, which is not
  beyond 8, so it is covered by <code>[2, 8]</code>. The answer is 2. For
  <code>[[1, 4], [1, 6]]</code>, the sort puts <code>[1, 6]</code> first, and the
  <code>[1, 4]</code> is covered. Time is O(n log n). The code assumes the
  intervals are distinct; with exact duplicates you must say whether one copy
  covers the other.
</p>

<h3>Minimum arrows: a stabbing problem in the same family</h3>
<p>
  Given spans on a line, shoot the fewest vertical arrows so that every span is
  hit, where an arrow at <code>x</code> hits every span with
  <code>start &lt;= x &lt;= end</code>. This is the "fewest points that stab every
  interval" problem, and the greedy chapter works it through with a proof: sort by
  end, shoot at the end of the first span that is not yet hit, and skip every span
  that starts at or before that point. In terms of this chapter, the answer is
  the maximum number of intervals that are pairwise disjoint when touching counts
  as overlapping, which is the non-overlapping count above computed with a
  strict comparison. The one thing to take from it here is the touching rule: for
  arrows, <code>[1, 2]</code> and <code>[2, 3]</code> share the point 2, so one
  arrow is enough, and the test for "needs a new arrow" is a strict
  <code>start &gt; arrowAt</code>.
</p>

<h3>Sweep line: turn intervals into events</h3>
<p>
  A different way to look at a list of intervals is to forget the pairs and keep
  only the moments something changes. Each interval gives two events: at its start
  the number of active things goes up, and at its end it goes down. Sort all the
  events by time and walk through them, keeping a running count. The count after
  each event is how many intervals are active at that moment, and the largest
  count is the answer to "how many at once". The two-pointer room count earlier
  is this idea with the events split into two sorted arrays.
</p>
<pre><code>function maxOverlapSweep(intervals) {
  const events = [];
  for (const [start, end] of intervals) {
    if (start &gt;= end) continue;
    events.push([start, 1]);
    events.push([end, -1]);
  }
  events.sort((a, b) =&gt; a[0] - b[0] || a[1] - b[1]); <span class="c">// at a tie, ends (-1) come before starts (+1)</span>
  let active = 0, best = 0;
  for (const [, change] of events) {
    active += change;
    best = Math.max(best, active);
  }
  return best;
}</code></pre>
<p>
  The tie-break is the whole subtlety. At a time where one interval ends and
  another starts, the end must be processed <em>first</em>, so that back-to-back
  meetings do not count as overlapping. The sort <code>a[1] - b[1]</code> does
  that, because the end event carries -1 and the start event carries +1. Flip it
  and <code>[[1, 2], [2, 3]]</code> reports 2 active at once instead of 1. If the
  problem treats touching as overlapping, flip the tie-break on purpose.
</p>
<p>
  The events can carry weights as well as plus and minus one, which is where
  most sweep-line questions come from. Car Pooling asks whether a car with a given
  capacity can complete every trip, where a trip is
  <code>[passengers, from, to]</code> and the passengers are on board from
  <code>from</code> up to, but not including, <code>to</code>.
</p>
<pre><code>function carPooling(trips, capacity) {
  const events = [];
  for (const [passengers, from, to] of trips) {
    events.push([from, passengers]); <span class="c">// they get on at "from"</span>
    events.push([to, -passengers]); <span class="c">// and off at "to", before anyone boards there</span>
  }
  events.sort((a, b) =&gt; a[0] - b[0] || a[1] - b[1]); <span class="c">// at the same stop, drop-offs come first</span>
  let onBoard = 0;
  for (const [, change] of events) {
    onBoard += change;
    if (onBoard &gt; capacity) return false;
  }
  return true;
}</code></pre>
<h4>Dry run: trips [[2, 1, 5], [3, 5, 7]] with capacity 3, then [[2, 1, 5], [3, 3, 7]] with capacity 4</h4>
<table>
  <tr><th>Trips</th><th>Events after sorting</th><th>onBoard after each</th><th>Result</th></tr>
  <tr><td>[2, 1, 5], [3, 5, 7], capacity 3</td><td>(1, +2), (5, -2), (5, +3), (7, -3)</td><td>2, 0, 3, 0</td><td>true</td></tr>
  <tr><td>[2, 1, 5], [3, 3, 7], capacity 4</td><td>(1, +2), (3, +3), (5, -2), (7, -3)</td><td>2, 5, 3, 0</td><td>false at 5 &gt; 4</td></tr>
</table>
<p class="sub">
  In the first row, the passengers leave at stop 5 exactly as the others board,
  and the sort puts the drop-off first, so the count never exceeds 3. If the
  events were sorted with starts first, the count would reach 5 at stop 5 and
  the answer would be wrongly <code>false</code>. Sorting 2n events costs
  O(n log n), and the sweep is linear.
</p>

<h3>Difference arrays: many range updates, one pass</h3>
<p>
  When the times are small whole numbers, you can skip the sort. Keep an array
  <code>diff</code> in which <code>diff[t]</code> records the <em>change</em> in
  the running total at time <code>t</code>. To add 5 to every position from
  <code>a</code> up to <code>b</code>, change two numbers instead of
  <code>b - a + 1</code>: add 5 at <code>a</code>, where the total steps up, and
  subtract 5 just past <code>b</code>, where it steps back down. At the end, a
  running sum over <code>diff</code> turns the steps back into the totals. This
  is the prefix-sum idea run in reverse, which the
  <a href="/dsa/dsa-prefix-sums">prefix sums chapter</a> develops on its own.
  Car Pooling becomes:
</p>
<pre><code>function carPoolingDiff(trips, capacity) {
  let last = 0;
  for (const [, , to] of trips) last = Math.max(last, to);
  const diff = new Array(last + 1).fill(0);
  for (const [passengers, from, to] of trips) {
    diff[from] += passengers; <span class="c">// the count steps up at "from"</span>
    diff[to] -= passengers; <span class="c">// and steps back down at "to"</span>
  }
  let onBoard = 0;
  for (let stop = 0; stop &lt;= last; stop++) {
    onBoard += diff[stop]; <span class="c">// the running sum of the steps is the count on board</span>
    if (onBoard &gt; capacity) return false;
  }
  return true;
}</code></pre>
<p>
  The array is sized by the largest stop, and each trip costs two updates, so the
  total is O(n + maxStop). That beats the sorted events when the number of trips
  is large and the stops are bounded, and it loses when the times are huge or
  sparse: a stop at 10<sup>9</sup> would need an array of 10<sup>9</sup> entries,
  and then the sorted events are the right tool, or you compress the times first.
</p>
<p>
  Corporate Flight Bookings is the same trick with inclusive ranges. Each booking
  is <code>[first, last, seats]</code> for flights numbered 1 to n, and you want
  the total seats booked on every flight.
</p>
<pre><code>function corpFlightBookings(bookings, n) {
  const diff = new Array(n + 2).fill(0); <span class="c">// flights are numbered 1..n; the spare slot absorbs last + 1</span>
  for (const [first, last, seats] of bookings) {
    diff[first] += seats;
    diff[last + 1] -= seats; <span class="c">// the range is inclusive, so the step down is one past the end</span>
  }
  const answer = [];
  let running = 0;
  for (let flight = 1; flight &lt;= n; flight++) {
    running += diff[flight];
    answer.push(running);
  }
  return answer;
}</code></pre>
<h4>Dry run: [[1, 2, 10], [2, 3, 20], [2, 5, 25]] with n = 5</h4>
<table>
  <tr><th>Booking</th><th>diff[first] +=</th><th>diff[last + 1] -=</th><th>diff after</th></tr>
  <tr><td>[1, 2, 10]</td><td>diff[1] += 10</td><td>diff[3] -= 10</td><td>[0, 10, 0, -10, 0, 0, 0]</td></tr>
  <tr><td>[2, 3, 20]</td><td>diff[2] += 20</td><td>diff[4] -= 20</td><td>[0, 10, 20, -10, -20, 0, 0]</td></tr>
  <tr><td>[2, 5, 25]</td><td>diff[2] += 25</td><td>diff[6] -= 25</td><td>[0, 10, 45, -10, -20, 0, -25]</td></tr>
</table>
<p class="sub">
  The running sum over flights 1 to 5 is 10, 55, 45, 25, 25, which is the answer.
  The array has <code>n + 2</code> slots on purpose: a booking that ends on the
  last flight writes to index <code>n + 1</code>. Because the range is inclusive,
  the step down belongs at <code>last + 1</code>; writing it at
  <code>last</code> would remove the seats one flight too early. Time is
  O(n + number of bookings), against O(n × bookings) for adding to every flight
  in the range.
</p>

<h3>My Calendar I: booking without a double booking</h3>
<p>
  Design a calendar that accepts <code>book(start, end)</code> for the half-open
  range <code>[start, end)</code> and refuses a booking that overlaps one already
  made. The heart of it is the overlap test for two half-open ranges. Two ranges
  overlap exactly when each one starts before the other ends:
  <code>start &lt; e &amp;&amp; s &lt; end</code>. Both halves matter, because
  they cover the case where the new booking sits inside an old one and the case
  where it surrounds one.
</p>
<pre><code>class MyCalendar {
  constructor() {
    this.booked = [];
  }

  book(start, end) {
    for (const [s, e] of this.booked) {
      if (start &lt; e &amp;&amp; s &lt; end) return false; <span class="c">// [start, end) and [s, e) share a moment</span>
    }
    this.booked.push([start, end]);
    return true;
  }
}</code></pre>
<p class="sub">
  <code>book(10, 20)</code> is accepted. <code>book(15, 25)</code> is refused,
  because <code>15 &lt; 20</code> and <code>10 &lt; 25</code>. <code>book(20, 30)</code>
  is accepted: the range <code>[10, 20)</code> does not include 20, and the test
  <code>20 &lt; 20</code> is false. Each call scans the existing bookings, so the
  time is O(k) for the k bookings so far, and n bookings cost O(n²) in total.
  That is right for small inputs. For many bookings, keep the booked ranges in a
  sorted structure and find the neighbours of the new range by binary search,
  which makes the check logarithmic, though inserting into a plain sorted array
  still shifts elements. The variants where overlaps are allowed up to some depth
  (My Calendar II and III) are the sweep line again, counting how many bookings
  are active.
</p>

<h3>Sort by start or by end? A table to decide</h3>
<table>
  <tr><th>Problem</th><th>Sort by</th><th>Touching ends</th><th>Why that key</th></tr>
  <tr><td>Merge intervals</td><td>start</td><td>merge (<code>&lt;=</code>)</td><td>a merged block only grows to the right, so you compare with the last block</td></tr>
  <tr><td>Insert interval (already sorted)</td><td>none needed</td><td>merge (<code>&lt;=</code>)</td><td>before, during and after phases</td></tr>
  <tr><td>Meeting rooms I</td><td>start</td><td>allowed (<code>&lt;</code> to clash)</td><td>a clash can only be with the previous meeting</td></tr>
  <tr><td>Meeting rooms II, heap</td><td>start</td><td>room is reusable (<code>&lt;=</code>)</td><td>you decide a room as each meeting arrives</td></tr>
  <tr><td>Fewest removals, most kept</td><td>end</td><td>allowed (<code>&gt;=</code> to keep)</td><td>the earliest end leaves the most room</td></tr>
  <tr><td>Fewest arrows</td><td>end</td><td>shared point (<code>&gt;</code> for a new arrow)</td><td>shoot as far right as the first span allows</td></tr>
  <tr><td>Remove covered intervals</td><td>start up, end down</td><td>same start: longer first</td><td>whoever could cover you comes earlier</td></tr>
  <tr><td>Intersections of two sorted lists</td><td>already sorted</td><td>shared point counts (<code>&lt;=</code>)</td><td>advance the one that ends first</td></tr>
  <tr><td>Free time, how many at once</td><td>start, or events</td><td>depends; ask</td><td>one running number summarises everything before</td></tr>
</table>
<p class="sub">
  A rule of thumb that holds in this chapter: sort by <b>start</b> when you are
  building or comparing against what came before you (merging, clash checks),
  and by <b>end</b> when you are choosing which intervals to keep or which
  point to use (scheduling, stabbing). The touching column is the one to say out
  loud before coding, because the same pair of intervals is an overlap in one
  problem and not in the next.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Input is a list of <code>[start, end]</code> pairs, or "meetings," "bookings," "ranges"</li>
  <li>"Merge," "overlap," "how many at the same time," "minimum rooms/resources"</li>
  <li>Almost always starts with sorting by start (or end, for the greedy scheduling case in the previous chapter) — decide which based on what the question actually asks</li>
  <li>If it also involves inserting one new interval into an existing sorted set, think in three phases: before, overlapping, after</li>
  <li>"Fewest removed" or "most kept" → sort by end and keep what fits; "fewest points or arrows to hit everything" → also sort by end</li>
  <li>Two already-sorted lists of intervals → two pointers, advancing whichever ends first, with no sort</li>
  <li>"When is everyone free" → pour every interval into one list and read the gaps behind a running maximum end</li>
  <li>"How many at once", "does the load ever exceed a limit" → events with plus and minus weights, ends before starts at a tie; or a difference array when the times are small whole numbers</li>
  <li>A booking that must not overlap earlier ones → the half-open overlap test <code>start &lt; e &amp;&amp; s &lt; end</code></li>
  <li>Before coding, ask what touching ends mean: the same pair is an overlap in one problem and not in the next</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Say why sorting by start time first turns an all-pairs comparison into a single linear pass.</li>
    <li>Write merge() with its empty-input guard and copies, and explain the touching-vs-overlapping boundary case (&lt;= vs &lt;) and why it needs clarifying up front.</li>
    <li>Write insert() as three phases — before, overlapping, after — and say why that beats one tangled loop.</li>
    <li>Trace minMeetingRooms on a small example using the two-sorted-streams sweep, and connect it to the sliding-window pattern.</li>
    <li>Given a new interval problem, decide whether to sort by start or by end before writing any code.</li>
    <li>Write Meeting Rooms II with a heap, and say why the test is <code>&lt;=</code> when a room frees at the moment a meeting starts.</li>
    <li>Explain why sorting by end makes Non-overlapping Intervals a single pass, and what extra decision the sort-by-start version must make on a clash.</li>
    <li>Explain the tie-break in Remove Covered Intervals, and why the longer interval must come first.</li>
    <li>Intersect two sorted interval lists with two pointers, and say which pointer moves and why.</li>
    <li>Turn a list of trips into events or a difference array, and say why the drop-off sorts before the pick-up at the same stop.</li>
    <li>Write the half-open overlap test for My Calendar, and say what each half of it catches.</li>
  </ul>
</div>`,
};
