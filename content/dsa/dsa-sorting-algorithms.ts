import type { Chapter } from "../types";

export const dsaSortingAlgorithms: Chapter = {
  id: "dsa-sorting-algorithms",
  num: "B7",
  title: "Sorting algorithms",
  short: "Sorting algorithms",
  levels: ["beginner"],
  practice: ["ex-merge-sort", "ex-quickselect-kth-largest", "ex-sort-an-array", "ex-largest-number"],
  ready: true,
  subtitle: "You'll rarely hand-write one, but you'll constantly need to reason about them.",
  body: `<h3>The cheat sheet interviewers expect you to know cold</h3>
<table>
  <tr><th>Algorithm</th><th>Time (avg)</th><th>Time (worst)</th><th>Space</th><th>Stable?</th></tr>
  <tr><td>Bubble/Insertion sort</td><td>O(n²)</td><td>O(n²)</td><td>O(1)</td><td>yes</td></tr>
  <tr><td>Merge sort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n)</td><td>yes</td></tr>
  <tr><td>Quicksort</td><td>O(n log n)</td><td>O(n²)</td><td>O(log n)</td><td>no</td></tr>
  <tr><td>Heapsort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(1)</td><td>no</td></tr>
  <tr><td>Counting sort</td><td>O(n + k)</td><td>O(n + k)</td><td>O(k)</td><td>yes</td></tr>
</table>
<p class="sub">
  "Stable" means equal elements keep their original relative order —
  matters when you're sorting objects by one field but want ties to
  preserve a previous sort order.
</p>

<h3>Bubble sort — repeatedly swap neighbors into order</h3>
<p>
  The simplest possible sort: walk the array, and whenever two neighbors
  are out of order, swap them. Repeat full passes until a pass makes zero
  swaps — that's your signal the array is sorted.
</p>
<figure>
  <svg viewBox="0 0 640 175" class="dg" role="img" aria-label="Bubble sort comparing adjacent elements and swapping the larger one rightward, one pass at a time">
    <g class="rough">
      <rect class="box" x="20" y="20" width="70" height="46" />
      <rect class="boxr" x="90" y="20" width="70" height="46" />
      <rect class="boxr" x="160" y="20" width="70" height="46" />
      <rect class="box" x="230" y="20" width="70" height="46" />
    </g>
    <text class="sm" x="55" y="48" text-anchor="middle">5</text>
    <text class="sm rd" x="125" y="48" text-anchor="middle">8</text>
    <text class="sm rd" x="195" y="48" text-anchor="middle">2</text>
    <text class="sm" x="265" y="48" text-anchor="middle">9</text>
    <text class="lbl rd" x="125" y="90" style="font-size:14px">8 &gt; 2 → swap</text>
    <g class="rough">
      <rect class="box" x="20" y="100" width="70" height="46" />
      <rect class="box" x="90" y="100" width="70" height="46" />
      <rect class="box" x="160" y="100" width="70" height="46" />
      <rect class="box" x="230" y="100" width="70" height="46" />
    </g>
    <text class="sm" x="55" y="128" text-anchor="middle">5</text>
    <text class="sm" x="125" y="128" text-anchor="middle">2</text>
    <text class="sm" x="195" y="128" text-anchor="middle">8</text>
    <text class="sm" x="265" y="128" text-anchor="middle">9</text>
    <text class="lbl" x="20" y="168" style="font-size:14px">one pass "bubbles" the largest seen so far rightward</text>
  </svg>
  <figcaption>n passes, each an O(n) scan → O(n²), but it's the easiest to reason about by hand.</figcaption>
</figure>
<pre><code>function bubbleSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let swapped = false;
    for (let j = 0; j < arr.length - 1 - i; j++) {
      if (arr[j] > arr[j + 1]) {
        [arr[j], arr[j + 1]] = [arr[j + 1], arr[j]];
        swapped = true;
      }
    }
    if (!swapped) break; <span class="c">// already sorted — stop early</span>
  }
  return arr;
}</code></pre>
<p class="sub">
  Notice <code>arr.length - 1 - i</code>: after pass <code>i</code>, the
  <code>i</code> largest elements are already bubbled to their final spot
  at the end, so each pass has one less element left to check. That's why
  it's O(n²) and not O(n³) despite "a pass, repeated n times" sounding
  like it could be worse.
</p>

<h3>Selection sort — repeatedly pick the minimum</h3>
<p>
  The mirror image of bubble sort: instead of bubbling large values right
  via many small swaps, scan the unsorted remainder for its minimum and
  swap it directly into place — <b>one swap per pass</b>, not many.
</p>
<pre><code>function selectionSort(arr) {
  for (let i = 0; i < arr.length - 1; i++) {
    let minIndex = i;
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[j] < arr[minIndex]) minIndex = j;
    }
    if (minIndex !== i) [arr[i], arr[minIndex]] = [arr[minIndex], arr[i]];
  }
  return arr;
}</code></pre>
<p class="sub">
  Still O(n²) — finding the minimum is O(n), done n times — but it makes
  at most n swaps total, versus bubble sort's up to O(n²) swaps. Worth
  knowing as the answer to "which of these two simple sorts writes to
  memory less."
</p>

<h3>Insertion sort — build up a sorted prefix, one element at a time</h3>
<figure>
  <svg viewBox="0 0 640 160" class="dg" role="img" aria-label="Insertion sort growing a sorted region on the left by inserting the next element into its correct position">
    <g class="rough">
      <rect class="boxg" x="20" y="20" width="60" height="44" />
      <rect class="boxg" x="80" y="20" width="60" height="44" />
      <rect class="boxg" x="140" y="20" width="60" height="44" />
      <rect class="boxy" x="200" y="20" width="60" height="44" />
      <rect class="box" x="260" y="20" width="60" height="44" />
    </g>
    <text class="sm gr" x="50" y="47" text-anchor="middle">2</text>
    <text class="sm gr" x="110" y="47" text-anchor="middle">5</text>
    <text class="sm gr" x="170" y="47" text-anchor="middle">8</text>
    <text class="sm" x="230" y="47" text-anchor="middle">4</text>
    <text class="sm" x="290" y="47" text-anchor="middle">9</text>
    <text class="lbl" x="20" y="90" style="font-size:14px">sorted prefix [2,5,8] — take 4, shift 8 and 5 right, insert 4 between 2 and 5</text>

    <g class="rough">
      <rect class="boxg" x="20" y="110" width="48" height="40" />
      <rect class="boxg" x="68" y="110" width="48" height="40" />
      <rect class="boxg" x="116" y="110" width="48" height="40" />
      <rect class="boxg" x="164" y="110" width="48" height="40" />
      <rect class="box" x="212" y="110" width="48" height="40" />
    </g>
    <text class="sm gr" x="44" y="135" text-anchor="middle">2</text>
    <text class="sm gr" x="92" y="135" text-anchor="middle">4</text>
    <text class="sm gr" x="140" y="135" text-anchor="middle">5</text>
    <text class="sm gr" x="188" y="135" text-anchor="middle">8</text>
    <text class="sm" x="236" y="135" text-anchor="middle">9</text>
  </svg>
  <figcaption>Green = sorted so far. This is exactly how most people sort a hand of playing cards.</figcaption>
</figure>
<pre><code>function insertionSort(arr) {
  for (let i = 1; i < arr.length; i++) {
    const current = arr[i];
    let j = i - 1;
    while (j >= 0 && arr[j] > current) {
      arr[j + 1] = arr[j]; <span class="c">// shift bigger elements right</span>
      j--;
    }
    arr[j + 1] = current; <span class="c">// drop it into the gap</span>
  }
  return arr;
}</code></pre>
<div class="sticky mint">
  <span class="ttl">Why insertion sort still matters</span>
  It's O(n²) worst case, but O(n) on <em>nearly-sorted</em> data — each
  element only shifts a few positions. That's exactly why TimSort
  (JS's real <code>.sort()</code>) switches to insertion sort for small
  or nearly-sorted runs instead of using merge sort the whole way down.
</div>

<h3>Merge sort — divide, conquer, then combine</h3>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Merge sort splitting an array down to single elements, then merging back up in sorted order">
    <g class="rough">
      <rect class="boxy" x="250" y="10" width="140" height="34" />
      <rect class="box" x="120" y="70" width="140" height="34" />
      <rect class="box" x="380" y="70" width="140" height="34" />
      <rect class="box" x="40" y="130" width="90" height="34" />
      <rect class="box" x="150" y="130" width="90" height="34" />
      <rect class="box" x="380" y="130" width="90" height="34" />
      <rect class="box" x="490" y="130" width="90" height="34" />
    </g>
    <text class="sm" x="320" y="32" text-anchor="middle">5 3 8 1 9 2 7 4</text>
    <text class="sm" x="190" y="92" text-anchor="middle">5 3 8 1</text>
    <text class="sm" x="450" y="92" text-anchor="middle">9 2 7 4</text>
    <text class="sm" x="85" y="152" text-anchor="middle">5 3</text>
    <text class="sm" x="195" y="152" text-anchor="middle">8 1</text>
    <text class="sm" x="425" y="152" text-anchor="middle">9 2</text>
    <text class="sm" x="535" y="152" text-anchor="middle">7 4</text>
    <text class="lbl" x="20" y="185" style="font-size:14px">split down to size 1 (free) → merge pairs back up in order (does the real work)</text>
  </svg>
  <figcaption>log n split levels × O(n) work to merge each level = O(n log n) total.</figcaption>
</figure>
<pre><code>function mergeSort(arr) {
  if (arr.length <= 1) return arr;

  const mid = Math.floor(arr.length / 2);
  const left = mergeSort(arr.slice(0, mid));
  const right = mergeSort(arr.slice(mid));

  return merge(left, right);
}

function merge(left, right) {
  const result = [];
  let i = 0, j = 0;
  while (i < left.length && j < right.length) {
    result.push(left[i] <= right[j] ? left[i++] : right[j++]);
  }
  return result.concat(left.slice(i), right.slice(j));
}</code></pre>

<h3>Quicksort — partition, then recurse</h3>
<pre><code>function quickSort(arr, lo = 0, hi = arr.length - 1) {
  if (lo >= hi) return arr;

  const pivotIndex = partition(arr, lo, hi);
  quickSort(arr, lo, pivotIndex - 1);
  quickSort(arr, pivotIndex + 1, hi);
  return arr;
}

function partition(arr, lo, hi) {
  const pivot = arr[hi];
  let i = lo;
  for (let j = lo; j < hi; j++) {
    if (arr[j] < pivot) {
      [arr[i], arr[j]] = [arr[j], arr[i]];
      i++;
    }
  }
  [arr[i], arr[hi]] = [arr[hi], arr[i]];
  return i; <span class="c">// pivot's final sorted position</span>
}</code></pre>

<h3>Watch one partition pass, step by step</h3>
<p><code>arr = [8, 2, 9, 1, 5]</code>, pivot = last element = <code>5</code>:</p>
<table>
  <tr><th>j</th><th>arr[j]</th><th>&lt; pivot (5)?</th><th>action</th><th>array after</th></tr>
  <tr><td>0</td><td>8</td><td>no</td><td>nothing</td><td>[8, 2, 9, 1, 5] (i=0)</td></tr>
  <tr><td>1</td><td>2</td><td>yes</td><td>swap arr[0], arr[1]; i++</td><td>[2, 8, 9, 1, 5] (i=1)</td></tr>
  <tr><td>2</td><td>9</td><td>no</td><td>nothing</td><td>[2, 8, 9, 1, 5] (i=1)</td></tr>
  <tr><td>3</td><td>1</td><td>yes</td><td>swap arr[1], arr[3]; i++</td><td>[2, 1, 9, 8, 5] (i=2)</td></tr>
  <tr><td>—</td><td>—</td><td>—</td><td>swap arr[2], arr[4] (pivot into place)</td><td>[2, 1, <b>5</b>, 8, 9]</td></tr>
</table>
<p class="sub">
  After one pass, <code>5</code> sits at its <em>final sorted position</em>
  (index 2), everything smaller is to its left, everything bigger is to
  its right — and neither side is sorted yet. That's the whole trick:
  quicksort now recurses on <code>[2, 1]</code> and <code>[8, 9]</code>
  independently, and the pivot never needs to move again.
</p>

<div class="warn">
  <span class="ttl">⚠ Why quicksort's worst case is O(n²)</span>
  If the pivot is always the smallest or largest remaining element (e.g.
  an already-sorted array with a naive "last element" pivot), each
  partition only shrinks the problem by 1, not by half — n levels of O(n)
  work each. Randomizing the pivot choice makes this worst case
  astronomically unlikely in practice, which is why real quicksorts do it.
</div>

<h3>Seeing the full recursion tree, not just one level</h3>
<p>
  Both merge sort and quicksort are divide-and-conquer — the diagram
  earlier only showed one split/merge. Here's why the <em>total</em> work
  across every level is O(n log n): each level does O(n) work combined
  (merging, or partitioning), and there are O(log n) levels because the
  problem size halves each time.
</p>
<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Four levels of recursion, each halving the problem size, with the work at each level adding up to O(n) so the total is O(n log n)">
    <g class="rough">
      <rect class="boxy" x="270" y="10" width="100" height="30" />
      <rect class="box" x="140" y="60" width="90" height="30" />
      <rect class="box" x="410" y="60" width="90" height="30" />
      <rect class="box" x="70" y="110" width="60" height="30" />
      <rect class="box" x="150" y="110" width="60" height="30" />
      <rect class="box" x="430" y="110" width="60" height="30" />
      <rect class="box" x="510" y="110" width="60" height="30" />
    </g>
    <text class="sm" x="320" y="30" text-anchor="middle">n = 8</text>
    <text class="sm" x="185" y="80" text-anchor="middle">n = 4</text>
    <text class="sm" x="455" y="80" text-anchor="middle">n = 4</text>
    <text class="sm" x="100" y="130" text-anchor="middle">n=2</text>
    <text class="sm" x="180" y="130" text-anchor="middle">n=2</text>
    <text class="sm" x="460" y="130" text-anchor="middle">n=2</text>
    <text class="sm" x="540" y="130" text-anchor="middle">n=2</text>
    <text class="lbl" x="20" y="170" style="font-size:14px">level 0: 1×8=8 work · level 1: 2×4=8 work · level 2: 4×2=8 work</text>
    <text class="lbl" x="20" y="190" style="font-size:14px">each level does O(n) total work, and there are log₂(n) levels → O(n log n)</text>
  </svg>
  <figcaption>The "n" per level never changes — only how many pieces it's split into. That's the source of the log n factor.</figcaption>
</figure>

<h3>Heap sort — sort using a heap as scratch space</h3>
<p>
  Covered fully in the heaps chapter next, but the shape belongs here too:
  build a max-heap out of the array in O(n), then repeatedly pull the
  maximum off the top and place it at the end — O(log n) per extraction,
  n extractions, O(n log n) total. Unlike merge sort, it sorts <b>in
  place</b> (O(1) extra space); unlike quicksort, its worst case is
  guaranteed O(n log n), never O(n²). The tradeoff: it's not stable, and
  in practice it's usually a bit slower than a well-tuned quicksort due to
  cache behavior.
</p>

<h3>Why JS's built-in <code>.sort()</code> usually wins anyway</h3>
<p>
  <code>Array.prototype.sort()</code> defaults to comparing elements as
  <b>strings</b> — <code>[10, 2, 1].sort()</code> gives
  <code>[1, 10, 2]</code>, not <code>[1, 2, 10]</code>, unless you pass a
  comparator. Always sort numbers with an explicit comparator:
</p>
<pre><code>nums.sort((a, b) => a - b);       <span class="c">// ascending</span>
nums.sort((a, b) => b - a);       <span class="c">// descending</span>
people.sort((a, b) => a.age - b.age); <span class="c">// by a field</span></code></pre>
<p class="sub">
  V8's engine uses TimSort (a hybrid of merge sort and insertion sort) —
  O(n log n) worst case, and stable. In an interview, you almost never
  hand-roll a sort; you use it as a fast O(n log n) black box and put your
  effort into everything around it.
</p>

<h3>Counting sort — when the range is small</h3>
<p>
  If values are bounded integers in a small known range (say, 0–100), you
  can sort in O(n + k) instead of O(n log n) by counting occurrences
  directly instead of comparing elements at all.
</p>
<pre><code>function countingSort(arr, maxVal) {
  const counts = new Array(maxVal + 1).fill(0);
  for (const x of arr) counts[x]++;

  const result = [];
  for (let val = 0; val <= maxVal; val++) {
    for (let i = 0; i < counts[val]; i++) result.push(val);
  }
  return result;
}</code></pre>

<div class="say">
  <span class="ttl">Say it like this →</span> "Comparison-based sorting is
  bounded at O(n log n) — you can't beat that by comparing elements. But
  if the values are bounded integers, counting sort sorts in O(n + k) by
  never comparing elements at all, just counting them."
</div>

<h3>Bucket sort — counting sort's cousin for spread-out values</h3>
<p>
  When values aren't small integers but <em>are</em> uniformly spread
  across a known range (e.g. floats between 0 and 1), distribute elements
  into <code>k</code> buckets by value, sort each small bucket (often with
  insertion sort, since buckets are tiny), then concatenate. Average case
  O(n + k); worst case (everything lands in one bucket) degrades to
  whatever the per-bucket sort costs.
</p>
<pre><code>function bucketSort(arr, bucketCount = 10) {
  const buckets = Array.from({ length: bucketCount }, () => []);
  for (const x of arr) {
    const idx = Math.min(bucketCount - 1, Math.floor(x * bucketCount));
    buckets[idx].push(x);
  }
  return buckets.flatMap(bucket => bucket.sort((a, b) => a - b));
}</code></pre>

<h3>The decision framework</h3>
<table>
  <tr><th>Situation</th><th>Reach for</th></tr>
  <tr><td>Just sort it, no special constraints</td><td><code>arr.sort((a,b) => a-b)</code> — O(n log n), stable, done</td></tr>
  <tr><td>Values are small bounded integers</td><td>Counting sort — O(n + k)</td></tr>
  <tr><td>Values are floats spread evenly over a range</td><td>Bucket sort — O(n + k) average</td></tr>
  <tr><td>Need worst-case O(n log n) guarantee, O(1) space</td><td>Heap sort</td></tr>
  <tr><td>Data is nearly sorted already</td><td>Insertion sort — O(n) on nearly-sorted input</td></tr>
  <tr><td>Explaining/hand-tracing on a whiteboard</td><td>Bubble or selection sort — simplest to reason about, even though you'd never ship them</td></tr>
</table>

<h3>Recognizing when sorting is the actual pattern</h3>
<ul>
  <li>The problem gets easier once order exists — enables two pointers or binary search</li>
  <li>You need the k-th smallest/largest, or a top-K — sorting is O(n log n), often beaten by a heap (see the heaps chapter)</li>
  <li>Grouping by "same after sorting" (anagrams) — sort each item as a normalizing key</li>
  <li>Interval problems almost always start with "sort by start time"</li>
</ul>`,
};
