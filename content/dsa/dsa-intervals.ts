import type { Chapter } from "../types";

export const dsaIntervals: Chapter = {
  id: "dsa-intervals",
  num: "I10",
  title: "Intervals",
  short: "Intervals",
  levels: ["intermediate"],
  practice: [
    "ex-merge-intervals",
    "ex-insert-interval",
    "ex-non-overlapping-intervals",
    "ex-meeting-rooms",
    "ex-meeting-rooms-ii",
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
  intervals.sort((a, b) => a[0] - b[0]); <span class="c">// sort by START — enables the single left-to-right pass</span>

  const result = [intervals[0]];
  for (let i = 1; i < intervals.length; i++) {
    const [start, end] = intervals[i];
    const last = result[result.length - 1];

    if (start <= last[1]) {
      last[1] = Math.max(last[1], end); <span class="c">// overlaps — extend the last merged interval</span>
    } else {
      result.push([start, end]); <span class="c">// no overlap — starts a new group</span>
    }
  }
  return result;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ "Touching" counts as overlapping unless told otherwise</span>
  <code>[1,4]</code> and <code>[4,6]</code> — do they merge? Most
  problems say yes (use <code>&lt;=</code>), some say no (use
  <code>&lt;</code>). This is exactly the kind of boundary detail worth
  asking the interviewer to clarify before coding, rather than guessing.
</div>

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

<h3>Minimum number of rooms/resources needed (meeting rooms)</h3>
<p>
  How many overlapping meetings exist <em>at the same time, at once</em>?
  Track starts and ends as separate sorted event streams — whenever a
  meeting starts before the earliest still-running meeting ends, you need
  another room.
</p>
<pre><code>function minMeetingRooms(intervals) {
  const starts = intervals.map(i => i[0]).sort((a, b) => a - b);
  const ends = intervals.map(i => i[1]).sort((a, b) => a - b);

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

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Input is a list of <code>[start, end]</code> pairs, or "meetings," "bookings," "ranges"</li>
  <li>"Merge," "overlap," "how many at the same time," "minimum rooms/resources"</li>
  <li>Almost always starts with sorting by start (or end, for the greedy scheduling case in the previous chapter) — decide which based on what the question actually asks</li>
  <li>If it also involves inserting one new interval into an existing sorted set, think in three phases: before, overlapping, after</li>
</ul>`,
};
