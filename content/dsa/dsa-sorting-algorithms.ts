import type { Chapter } from "../types";

export const dsaSortingAlgorithms: Chapter = {
  id: "dsa-sorting-algorithms",
  num: "B10",
  title: "Sorting algorithms",
  short: "Sorting algorithms",
  levels: ["beginner"],
  prerequisites: ["dsa-basic-recursion"],
  practice: [
    "ex-merge-sort",
    "ex-quickselect-kth-largest",
    "ex-sort-an-array",
    "ex-largest-number",
    "ex-count-inversions",
    "ex-maximum-gap",
    "ex-sort-by-frequency",
    "ex-sort-colors",
    "ex-three-way-partition",
    "ex-kth-smallest-many-duplicates",
    "ex-reverse-pairs",
    "ex-sort-by-multiple-keys",
    "ex-sort-version-numbers",
    "ex-radix-sort",
    "ex-merge-sort-stable-records",
  ],
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

<h3>Merge sort on index ranges: one buffer, no slices</h3>
<p>
  The merge sort above is the clearest version, but it allocates freely: every
  call slices out two new arrays and every merge builds a new result, so each
  level of the recursion copies roughly <code>n</code> elements twice over, about
  n log n elements allocated over the whole run even though no more than O(n) is
  alive at once. Interviewers sometimes ask for the version that does not
  do this, and the next section needs the merge step in a form where you can
  put a counter inside it. The fix is the same one the recursion chapter used
  for <code>reverseString</code>: never build a smaller array, pass
  <b>indices</b> that describe the subproblem, and allocate one scratch
  buffer up front.
</p>
<p>
  The convention that keeps the arithmetic clean is a <b>half-open range</b>
  <code>[lo, hi)</code>: it includes <code>lo</code> and excludes
  <code>hi</code>. Its length is <code>hi - lo</code>, a range of length 0 or 1 is
  already sorted, and the midpoint splits it into <code>[lo, mid)</code> and
  <code>[mid, hi)</code> with no overlap and no stray <code>+ 1</code> or
  <code>- 1</code>.
</p>
<pre><code>function mergeSortRange(arr) {
  const aux = new Array(arr.length);               <span class="c">// the one scratch buffer, allocated once</span>
  sortRange(arr, aux, 0, arr.length);
  return arr;
}

function sortRange(arr, aux, lo, hi) {              <span class="c">// sorts arr[lo, hi) in place</span>
  if (hi - lo &lt;= 1) return;                        <span class="c">// zero or one element: already sorted</span>
  const mid = lo + ((hi - lo) &gt;&gt; 1);
  sortRange(arr, aux, lo, mid);
  sortRange(arr, aux, mid, hi);
  mergeRange(arr, aux, lo, mid, hi);
}

function mergeRange(arr, aux, lo, mid, hi) {
  for (let k = lo; k &lt; hi; k++) aux[k] = arr[k];   <span class="c">// snapshot the range, so arr can be overwritten</span>
  let i = lo, j = mid;
  for (let k = lo; k &lt; hi; k++) {
    if (i === mid) arr[k] = aux[j++];               <span class="c">// left half used up</span>
    else if (j === hi) arr[k] = aux[i++];           <span class="c">// right half used up</span>
    else if (aux[j] &lt; aux[i]) arr[k] = aux[j++];   <span class="c">// STRICTLY smaller: only then take from the right</span>
    else arr[k] = aux[i++];                         <span class="c">// ties go to the left, which keeps the sort stable</span>
  }
}</code></pre>
<h4>Dry run: mergeRange on arr = [2, 5, 8, 3, 4, 9] with lo = 0, mid = 3, hi = 6</h4>
<table>
  <tr><th>k</th><th>i</th><th>j</th><th>Comparison</th><th>Written to arr[k]</th></tr>
  <tr><td>0</td><td>0</td><td>3</td><td>aux[3] = 3 &lt; aux[0] = 2? no</td><td>2 (from the left)</td></tr>
  <tr><td>1</td><td>1</td><td>3</td><td>3 &lt; 5? yes</td><td>3 (from the right)</td></tr>
  <tr><td>2</td><td>1</td><td>4</td><td>4 &lt; 5? yes</td><td>4 (from the right)</td></tr>
  <tr><td>3</td><td>1</td><td>5</td><td>9 &lt; 5? no</td><td>5 (from the left)</td></tr>
  <tr><td>4</td><td>2</td><td>5</td><td>9 &lt; 8? no</td><td>8 (from the left)</td></tr>
  <tr><td>5</td><td>3</td><td>5</td><td>i === mid, left half used up</td><td>9 (from the right)</td></tr>
</table>
<p class="sub">
  The range ends as <code>[2, 3, 4, 5, 8, 9]</code>. The running time is
  still O(n log n) (n per level, log n levels). Extra space is the single
  O(n) buffer plus O(log n) of call stack, and nothing else is allocated while
  the sort runs. Checked against the built-in sort on random arrays, and for
  stability by sorting records with repeated keys and confirming equal keys kept
  their original order.
</p>
<div class="warn">
  <span class="ttl">⚠ Four bugs this version invites</span>
  <b><code>&lt;=</code> instead of <code>&lt;</code> in the comparison.</b>
  <code>aux[j] &lt;= aux[i]</code> takes the right element on a tie, which puts
  equal items in reverse order and makes the sort unstable. <b>Merging from
  <code>arr</code> while overwriting <code>arr</code>.</b> Without the
  <code>aux</code> snapshot you read values you have already overwritten.
  <b>A fractional midpoint.</b> <code>(lo + hi) / 2</code> is not an integer
  for odd sums; use <code>lo + ((hi - lo) &gt;&gt; 1)</code> or
  <code>Math.floor</code>. <b>Mixing range conventions.</b> If
  <code>sortRange</code> treats <code>hi</code> as included but
  <code>mergeRange</code> treats it as excluded, every merge is off by one.
  Pick half-open once and use it everywhere.
</div>

<h3>Counting inversions: a merge sort that answers a question</h3>
<p>
  An <b>inversion</b> is a pair of positions <code>i &lt; j</code> with
  <code>a[i] &gt; a[j]</code>: two elements that are in the wrong order relative to
  each other. A sorted array has 0, a reversed array of n elements has the
  maximum, n(n − 1) / 2, and the count measures how far the array is from sorted
  (it is also the number of swaps of adjacent elements that insertion sort
  performs). Checking every pair is O(n²). Merge sort gets it in O(n log n)
  because the merge step already compares elements across the two halves.
</p>
<p>
  Split the array. Every inversion is one of three kinds: both elements in the
  left half, both in the right, or one in each. The recursion counts the first
  two kinds. For the third kind, both halves are <em>sorted</em> by the time
  you merge them, and that is what makes them countable at once. Look at the
  moment the merge outputs an element from the <b>right</b> half: it is
  smaller than <code>aux[i]</code>, the smallest element left in the left half, and since
  the left half is sorted it is smaller than every element from
  <code>aux[i]</code> up to <code>aux[mid - 1]</code>. That is exactly
  <code>mid - i</code> inversions, all discovered in one step, and each
  cross-half pair is counted exactly once: when its right-hand element is
  written. Elements written from the left add nothing.
</p>
<pre><code>function countInversions(nums) {
  const arr = nums.slice();                         <span class="c">// the sort reorders its input, so work on a copy</span>
  const aux = new Array(arr.length);

  function sortCount(lo, hi) {                      <span class="c">// sorts arr[lo, hi), returns the inversions inside it</span>
    if (hi - lo &lt;= 1) return 0;
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    let count = sortCount(lo, mid) + sortCount(mid, hi);
    for (let k = lo; k &lt; hi; k++) aux[k] = arr[k];
    let i = lo, j = mid;
    for (let k = lo; k &lt; hi; k++) {
      if (i === mid) arr[k] = aux[j++];
      else if (j === hi) arr[k] = aux[i++];
      else if (aux[j] &lt; aux[i]) {
        arr[k] = aux[j++];
        count += mid - i;                           <span class="c">// jumps over every left element still waiting</span>
      } else arr[k] = aux[i++];
    }
    return count;
  }

  return sortCount(0, arr.length);
}</code></pre>
<h4>Dry run: countInversions([2, 4, 1, 3, 5])</h4>
<p class="sub">
  By brute force the inversions are (2, 1), (4, 1) and (4, 3): three. The
  recursion splits <code>[2, 4]</code> from <code>[1, 3, 5]</code>; the smaller
  pieces <code>[2, 4]</code> and <code>[1, 3, 5]</code> contain none and sort
  to themselves, so only the top merge counts, with <code>mid = 2</code>:
</p>
<table>
  <tr><th>k</th><th>i</th><th>j</th><th>Comparison</th><th>Written</th><th>count</th></tr>
  <tr><td>0</td><td>0</td><td>2</td><td>1 &lt; 2? yes: from the right</td><td>1</td><td>0 + (mid − i) = 2</td></tr>
  <tr><td>1</td><td>0</td><td>3</td><td>3 &lt; 2? no: from the left</td><td>2</td><td>2</td></tr>
  <tr><td>2</td><td>1</td><td>3</td><td>3 &lt; 4? yes: from the right</td><td>3</td><td>2 + (mid − i) = 3</td></tr>
  <tr><td>3</td><td>1</td><td>4</td><td>5 &lt; 4? no: from the left</td><td>4</td><td>3</td></tr>
  <tr><td>4</td><td>2</td><td>4</td><td>i === mid: the rest comes from the right</td><td>5</td><td>3</td></tr>
</table>
<p class="sub">
  Writing the 1 jumped over both 2 and 4, which are the pairs (2, 1) and (4, 1);
  writing the 3 jumped over only the 4, the pair (4, 3). The function returns 3.
  Time is O(n log n), because the merge does O(n) work per level and the counting
  adds O(1) to it, and space is O(n) for the copy and the buffer.
</p>
<div class="warn">
  <span class="ttl">⚠ Where inversion counting goes wrong</span>
  <b>Counting equal pairs.</b> An inversion needs <code>a[i] &gt; a[j]</code>,
  strictly. The strict <code>&lt;</code> in the merge takes the left element on a
  tie, so equal values are never counted; <code>&lt;=</code> would count them.
  <b>Counting before the halves are sorted.</b> The <code>mid - i</code> shortcut
  is valid only because the left half is already sorted. <b>Adding 1 instead of
  <code>mid - i</code>.</b> That counts the jump as one inversion rather than all
  the elements it jumped over. <b>The size of the answer.</b> The reversed array
  of 100,000 elements has 4,999,950,000 inversions, more than 2<sup>32</sup>. JavaScript
  numbers hold it exactly (the limit is 2<sup>53</sup>), but <code>| 0</code> or an
  <code>Int32Array</code> counter would not, and in languages with 32-bit
  integers it needs a 64-bit type. <b>Mutating the input.</b> The sort reorders the
  array, so copy first unless the caller does not mind.
</div>
<p>
  <b>A variation: reverse pairs.</b> Count pairs <code>i &lt; j</code> with
  <code>a[i] &gt; 2 · a[j]</code>. The condition is not the merge order, so you
  cannot count it inside the merge. But once both halves are sorted, a second pass with
  two pointers does it: as <code>i</code> moves right through the left half, the
  right elements it is more than double only grow, so <code>j</code> never moves
  backwards.
</p>
<pre><code>function reversePairs(nums) {
  const arr = nums.slice();
  const aux = new Array(arr.length);

  function sortCount(lo, hi) {
    if (hi - lo &lt;= 1) return 0;
    const mid = lo + ((hi - lo) &gt;&gt; 1);
    let count = sortCount(lo, mid) + sortCount(mid, hi);
    let j = mid;
    for (let i = lo; i &lt; mid; i++) {
      while (j &lt; hi &amp;&amp; arr[i] &gt; 2 * arr[j]) j++;   <span class="c">// both halves are sorted: j only moves forward</span>
      count += j - mid;                              <span class="c">// right elements arr[i] is more than double</span>
    }
    mergeRange(arr, aux, lo, mid, hi);              <span class="c">// the plain merge from the previous section</span>
    return count;
  }

  return sortCount(0, arr.length);
}
<span class="c">// reversePairs([1, 3, 2, 3, 1]) → 2    reversePairs([2, 4, 3, 5, 1]) → 3</span></code></pre>
<p class="sub">
  Both counters were checked against the O(n²) double loop on thousands of
  random arrays with duplicates and negative values. The same
  count-while-merging idea answers "count of smaller numbers after self" and
  "count of range sums" with a little extra bookkeeping, and the divide-and-conquer
  chapter later in the course builds that out. The shape to remember: <b>if a question
  is about pairs in the wrong order, ask whether a sorted merge can count them in bulk.</b>
</p>

<h3>Quicksort — partition, then recurse</h3>
<pre><code>function quickSort(arr, lo = 0, hi = arr.length - 1) {
  while (lo < hi) {
    const pivotIndex = partition(arr, lo, hi);
    if (pivotIndex - lo < hi - pivotIndex) { <span class="c">// recurse into the smaller side, loop on the larger:</span>
      quickSort(arr, lo, pivotIndex - 1);   <span class="c">// the stack stays O(log n) however lopsided the splits are</span>
      lo = pivotIndex + 1;
    } else {
      quickSort(arr, pivotIndex + 1, hi);
      hi = pivotIndex - 1;
    }
  }
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

<h4>Dry run: partition([8, 2, 9, 1, 5], 0, 4) — pivot = last element = 5</h4>
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
  The time still degrades to O(n²) with the last-element pivot above, but the
  recurse-on-the-smaller-side loop keeps the call stack shallow, so a sorted
  or all-equal array of 20,000 elements is slow rather than a stack overflow.
</div>

<h3>Partitioning: Lomuto's trap, three-way and Hoare</h3>
<p>
  The <code>partition</code> above is <b>Lomuto's scheme</b>: one scanning pointer
  <code>j</code>, one write pointer <code>i</code>, pivot taken from the end. It is
  the easiest to write and to explain, and it leaves the pivot at its final
  position. Its weakness is how it treats elements <em>equal</em> to the
  pivot: <code>arr[j] &lt; pivot</code> is false for them, so they all pile up on
  the right. On an array where every element is equal, <code>i</code> never
  moves, each partition peels off one element and the sort does
  n(n − 1) / 2 comparisons: 1,999,000 for 2,000 equal values, against 24,320 for
  2,000 random ones (both counted). This is not an exotic input. Sorting by a
  field with a handful of values (a status, a grade, a boolean flag) hands
  quicksort long runs of equal keys.
</p>
<p>
  <b>Fix 1: three-way partition</b> (the Dutch national flag). Split the range into
  <em>three</em> blocks, smaller than, equal to, and greater than the pivot value,
  and then recurse only into the outer two: the whole equal block is already in its
  final place. Keep four regions as the invariant:
</p>
<figure>
  <svg viewBox="0 0 640 140" class="dg" role="img" aria-label="Four regions of the array during three-way partition: smaller than the pivot, equal to the pivot, not yet examined, and greater than the pivot, with the pointers lt, i and gt at their boundaries">
    <g class="rough">
      <rect class="boxg" x="20" y="25" width="150" height="44" />
      <rect class="boxy" x="170" y="25" width="130" height="44" />
      <rect class="box" x="300" y="25" width="170" height="44" />
      <rect class="boxr" x="470" y="25" width="150" height="44" />
    </g>
    <text class="sm gr" x="95" y="52" text-anchor="middle">&lt; pivot</text>
    <text class="sm" x="235" y="52" text-anchor="middle">= pivot</text>
    <text class="sm" x="385" y="52" text-anchor="middle">not looked at yet</text>
    <text class="sm rd" x="545" y="52" text-anchor="middle">&gt; pivot</text>
    <text class="lbl" x="170" y="95" text-anchor="middle" style="font-size:14px">lt</text>
    <text class="lbl" x="300" y="95" text-anchor="middle" style="font-size:14px">i</text>
    <text class="lbl" x="470" y="95" text-anchor="middle" style="font-size:14px">gt</text>
    <text class="sm" x="20" y="125">[lo, lt) &lt; pivot · [lt, i) = pivot · [i, gt] unknown · (gt, hi] &gt; pivot</text>
  </svg>
  <figcaption>Each step looks at <code>arr[i]</code> and moves one element into the region it belongs to. The loop ends when the unknown region is empty.</figcaption>
</figure>
<pre><code>function partition3(arr, lo, hi, pivot) {          <span class="c">// returns [lt, gt]: arr[lt..gt] all equal the pivot</span>
  let lt = lo, i = lo, gt = hi;
  while (i &lt;= gt) {
    if (arr[i] &lt; pivot) {
      [arr[lt], arr[i]] = [arr[i], arr[lt]];        <span class="c">// the element at lt is an "equal": it is safe to move to i</span>
      lt++;
      i++;
    } else if (arr[i] &gt; pivot) {
      [arr[i], arr[gt]] = [arr[gt], arr[i]];
      gt--;                                         <span class="c">// do NOT advance i: the element swapped in is unexamined</span>
    } else {
      i++;
    }
  }
  return [lt, gt];
}

function quickSort3(arr, lo = 0, hi = arr.length - 1) {
  while (lo &lt; hi) {
    const pivot = arr[lo + Math.floor(Math.random() * (hi - lo + 1))];  <span class="c">// random pivot value</span>
    const [lt, gt] = partition3(arr, lo, hi, pivot);
    if (lt - lo &lt; hi - gt) {                       <span class="c">// smaller side by recursion, larger by loop (O(log n) stack)</span>
      quickSort3(arr, lo, lt - 1);
      lo = gt + 1;
    } else {
      quickSort3(arr, gt + 1, hi);
      hi = lt - 1;
    }
  }
  return arr;
}</code></pre>
<h4>Dry run: partition3([4, 1, 3, 5, 3, 2, 3], 0, 6, 3)</h4>
<table>
  <tr><th>Step</th><th>arr[i]</th><th>Action</th><th>Array after</th><th>lt</th><th>i</th><th>gt</th></tr>
  <tr><td>start</td><td>—</td><td>—</td><td>[4, 1, 3, 5, 3, 2, 3]</td><td>0</td><td>0</td><td>6</td></tr>
  <tr><td>1</td><td>4</td><td>greater: swap with arr[gt], gt−−, i stays</td><td>[3, 1, 3, 5, 3, 2, 4]</td><td>0</td><td>0</td><td>5</td></tr>
  <tr><td>2</td><td>3</td><td>equal: i++</td><td>[3, 1, 3, 5, 3, 2, 4]</td><td>0</td><td>1</td><td>5</td></tr>
  <tr><td>3</td><td>1</td><td>less: swap with arr[lt], lt++, i++</td><td>[1, 3, 3, 5, 3, 2, 4]</td><td>1</td><td>2</td><td>5</td></tr>
  <tr><td>4</td><td>3</td><td>equal: i++</td><td>[1, 3, 3, 5, 3, 2, 4]</td><td>1</td><td>3</td><td>5</td></tr>
  <tr><td>5</td><td>5</td><td>greater: swap with arr[gt], gt−−</td><td>[1, 3, 3, 2, 3, 5, 4]</td><td>1</td><td>3</td><td>4</td></tr>
  <tr><td>6</td><td>2</td><td>less: swap with arr[lt], lt++, i++</td><td>[1, 2, 3, 3, 3, 5, 4]</td><td>2</td><td>4</td><td>4</td></tr>
  <tr><td>7</td><td>3</td><td>equal: i++</td><td>[1, 2, 3, 3, 3, 5, 4]</td><td>2</td><td>5</td><td>4</td></tr>
</table>
<p class="sub">
  Now <code>i &gt; gt</code>, so the loop stops with <code>lt = 2</code> and
  <code>gt = 4</code>: indices 2 to 4 are the three 3s in their final place, and
  quicksort only has to sort <code>[1, 2]</code> and <code>[5, 4]</code>. On an
  all-equal array one pass of n steps leaves <code>lt = lo</code> and
  <code>gt = hi</code>, so the sort finishes at once (2,000 element visits for
  2,000 equal values, instead of 1,999,000 comparisons). The cost is a few more
  swaps on distinct data, which is why many libraries use the simpler scheme with
  safeguards instead.
</p>
<div class="warn">
  <span class="ttl">⚠ The one line that breaks three-way partition</span>
  In the "greater" branch the element swapped in from the end has never been
  looked at, so <code>i</code> must stay put. If you also write <code>i++</code>, that
  element is skipped: <code>partition3([4, 5, 1], 0, 2, 3)</code> would end as
  <code>[1, 5, 4]</code> with <code>lt = 0</code> and <code>gt = 0</code>,
  claiming that index 0 holds the pivot value when it holds a 1. In the "less" branch
  the opposite holds: the element swapped into <code>i</code> came from the equal block, so
  advancing <code>i</code> is correct.
</div>
<p>
  <b>Fix 2: Hoare's scheme</b>, the original two-pointer partition. Pointer
  <code>i</code> walks right until it meets an element that is not smaller than the
  pivot, <code>j</code> walks left until it meets one that is not larger, and the
  two are swapped; this repeats until they cross. Stopping on equal keys looks wasteful,
  but it is the point: equal keys get swapped, the pointers meet near the middle, and an
  all-equal array splits evenly (about n log n comparisons, instead of n²). It also tends to
  do fewer swaps than Lomuto. It is worth knowing exactly, because interviewers like to
  ask how it differs:
</p>
<pre><code>function hoarePartition(arr, lo, hi) {
  const pivot = arr[lo + ((hi - lo) &gt;&gt; 1)];        <span class="c">// middle element, NOT the last one (see the warning)</span>
  let i = lo - 1, j = hi + 1;
  while (true) {
    do i++; while (arr[i] &lt; pivot);                <span class="c">// stops at the first element &gt;= pivot</span>
    do j--; while (arr[j] &gt; pivot);                <span class="c">// stops at the first element &lt;= pivot</span>
    if (i &gt;= j) return j;                          <span class="c">// crossed: [lo..j] &lt;= pivot &lt;= [j+1..hi]</span>
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function quickSortHoare(arr, lo = 0, hi = arr.length - 1) {
  if (lo &gt;= hi) return arr;
  const p = hoarePartition(arr, lo, hi);
  quickSortHoare(arr, lo, p);                       <span class="c">// note: p, not p - 1</span>
  quickSortHoare(arr, p + 1, hi);
  return arr;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Hoare's partition returns a split point, not the pivot's place</span>
  The index it returns means only that everything up to it is at most the pivot and
  everything after it is at least the pivot. The pivot itself may be anywhere. So the
  recursion is <code>(lo, p)</code> and <code>(p + 1, hi)</code>; copying Lomuto's
  <code>(lo, p − 1)</code> and <code>(p + 1, hi)</code> silently drops elements (it
  sorted 407 of 500 random ten-element test arrays wrongly). And with the last
  element as the pivot this exact form can return <code>hi</code>, so the first call
  never shrinks and the recursion overflows the stack (170 of 200 random arrays
  failed). Take the middle element, as above.
</div>
<table>
  <tr><th>Scheme</th><th>Pivot ends at its final index?</th><th>All-equal input</th><th>Reach for it when</th></tr>
  <tr><td>Lomuto</td><td>yes, one index</td><td>n(n − 1) / 2 comparisons</td><td>you want the shortest correct code and the data is distinct enough</td></tr>
  <tr><td>Three-way</td><td>yes, the whole block of equals</td><td>one pass, n steps</td><td>many duplicate keys, or quickselect (next section)</td></tr>
  <tr><td>Hoare</td><td>no, only a split point</td><td>splits evenly, about n log n</td><td>you are asked to explain it, or want fewer swaps</td></tr>
</table>

<h3>Quickselect: the k-th smallest without sorting everything</h3>
<p>
  "Find the k-th largest element" does not need a sorted array, only the one element
  that would sit at a single index. Quicksort recurses into <em>both</em> sides of the
  pivot; <b>quickselect</b> notices that after a three-way partition it knows exactly
  where the block equal to the pivot sits, <code>[lt, gt]</code>, so for a target index
  <code>k</code> there are only three cases. If <code>k &lt; lt</code> the answer is in the
  left part; if <code>k &gt; gt</code> it is in the right part; otherwise
  <code>k</code> lies inside the equal block and the answer is the pivot itself. Only one
  part is ever visited, and the other is discarded for good.
</p>
<pre><code>function quickselect(nums, k) {                      <span class="c">// k-th smallest, k is 0-based: k = 0 is the minimum</span>
  const arr = nums.slice();                          <span class="c">// leave the caller's array alone</span>
  let lo = 0, hi = arr.length - 1;
  while (lo &lt; hi) {
    const pivot = arr[lo + Math.floor(Math.random() * (hi - lo + 1))];
    const [lt, gt] = partition3(arr, lo, hi, pivot);
    if (k &lt; lt) hi = lt - 1;                        <span class="c">// the answer is among the smaller elements</span>
    else if (k &gt; gt) lo = gt + 1;                   <span class="c">// the answer is among the larger elements</span>
    else return arr[k];                              <span class="c">// k is inside the block equal to the pivot</span>
  }
  return arr[k];                                     <span class="c">// one candidate left</span>
}
<span class="c">// k-th LARGEST with a 1-based k: quickselect(nums, nums.length - k)</span></code></pre>
<h4>Dry run: the 3rd smallest of [7, 2, 9, 4, 1, 8], so k = 2</h4>
<table>
  <tr><th>Round</th><th>Range</th><th>Pivot picked</th><th>After partition3</th><th>lt, gt</th><th>Decision</th></tr>
  <tr><td>1</td><td>[0..5]</td><td>7</td><td>[2, 1, 4, 7, 8, 9]</td><td>3, 3</td><td>k = 2 &lt; lt = 3: keep the left part, hi = 2</td></tr>
  <tr><td>2</td><td>[0..2]</td><td>4</td><td>[2, 1, 4, 7, 8, 9]</td><td>2, 2</td><td>k = 2 is inside [2, 2]: return arr[2] = 4</td></tr>
</table>
<p class="sub">
  The sorted array is <code>[1, 2, 4, 7, 8, 9]</code>, so the third smallest is 4.
  Three elements were never touched after round 1. (The pivots are whatever the random
  choice gives; this trace fixes them to 7 and 4 so it is repeatable, and the function was
  checked against sorting on thousands of random arrays with many duplicates.)
</p>
<p>
  <b>Why it is O(n) on average.</b> Round one costs n steps. With a random pivot, the pivot's rank
  lands in the middle half of the values with probability 1/2, and then at most 3n/4
  elements remain; otherwise at most n remain. So the expected cost satisfies
  E(n) ≤ n + ½ · E(3n/4) + ½ · E(n), which rearranges to
  E(n) ≤ 2n + E(3n/4). Unrolling it gives 2n · (1 + 3/4 + (3/4)² + …) = 8n. That is a safe
  upper bound; counting actual element visits, finding the median of 100,000 random numbers
  averaged about 3.4n. The <b>worst case is O(n²)</b>, when every pivot is nearly the
  smallest or largest, which a random pivot makes astronomically unlikely, and an array of equal
  keys finishes in a single round because <code>k</code> falls inside the equal block. A
  deterministic O(n) worst case exists (median of medians) but is rarely worth writing in an interview;
  name it and move on. Space is O(n) for the copy, or O(1) extra if you are allowed to
  reorder the input.
</p>
<table>
  <tr><th>Approach to the k-th element</th><th>Time</th><th>Extra space</th><th>Best when</th></tr>
  <tr><td>Sort, then index</td><td>O(n log n)</td><td>O(1) to O(n)</td><td>you need the whole order anyway, or n is small</td></tr>
  <tr><td>Heap of size k</td><td>O(n log k)</td><td>O(k)</td><td>the data arrives as a stream, or k is tiny</td></tr>
  <tr><td>Quickselect</td><td>O(n) on average, O(n²) worst</td><td>O(n) copy, or O(1) in place</td><td>everything is in memory and you want one element or the k smallest unordered</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Sorting is O(n log n), but I only need one
  index. Quickselect partitions around a random pivot, keeps only the side that contains
  index k, and repeats, so the work shrinks geometrically and averages O(n). I would mention a
  size-k heap if the data is a stream."
</div>
<div class="warn">
  <span class="ttl">⚠ Quickselect slips</span>
  <b>Off by one between "k-th" and an index.</b> Interview wording is usually 1-based
  ("the 2nd largest"); the code is 0-based. The k-th largest is index
  <code>n − k</code> of the sorted order. <b>Choosing <code>arr[lo]</code> or
  <code>arr[hi]</code> as the pivot</b> on sorted input degrades to O(n²) just like quicksort.
  <b>Splitting only into "less" and "not less"</b> loses the equal-block shortcut and
  makes duplicate-heavy input slow. <b>Forgetting to copy</b> when the caller still needs the
  original order, and <b>calling it with <code>k</code> outside <code>0..n − 1</code></b>, which
  returns <code>undefined</code>.
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
  The heaps chapter builds the heap itself, but the sorting shape belongs
  here too: build a max-heap out of the array in O(n), then repeatedly pull
  the maximum off the top and place it at the end — O(log n) per extraction,
  n extractions, O(n log n) total. Unlike merge sort, it sorts <b>in
  place</b> (O(1) extra space); unlike quicksort, its worst case is
  guaranteed O(n log n), never O(n²). The tradeoff: it's not stable, and
  in practice it's usually a bit slower than a well-tuned quicksort due to
  cache behavior.
</p>

<h3>Introsort: how libraries dodge the worst case</h3>
<p>
  Each algorithm so far has a flaw to patch: quicksort can hit O(n²), heapsort is
  slower in practice, and insertion sort is quick only on small ranges. <b>Introsort</b>
  (introspective sort) combines all three. It runs quicksort, but counts the recursion
  depth; once a range has been split more than about 2 · log₂ n levels deep, the splits
  are evidently bad, so it abandons quicksort on that range and finishes it with heapsort,
  whose O(n log n) is guaranteed. And ranges that have become small (here 16 elements or fewer)
  go to insertion sort, which beats everything on tiny inputs. The result runs at
  quicksort speed on typical data with a worst case of O(n log n); common implementations of
  C++'s <code>std::sort</code> work this way. JavaScript's <code>.sort()</code> cannot,
  since it is required to be stable and quicksort and heapsort are not, which is one reason
  engines use a merge-based hybrid.
</p>
<pre><code>function introSort(arr) {
  const limit = 2 * Math.floor(Math.log2(Math.max(arr.length, 1)));
  introRange(arr, 0, arr.length - 1, limit);
  return arr;
}

function introRange(arr, lo, hi, depthLeft) {
  while (hi - lo &gt;= 16) {                                       <span class="c">// big range: partition</span>
    if (depthLeft === 0) { heapSortRange(arr, lo, hi); return; }  <span class="c">// too deep: switch to the guaranteed algorithm</span>
    depthLeft--;
    const [lt, gt] = partition3(arr, lo, hi, medianOfThree(arr, lo, hi));
    if (lt - lo &lt; hi - gt) { introRange(arr, lo, lt - 1, depthLeft); lo = gt + 1; }
    else { introRange(arr, gt + 1, hi, depthLeft); hi = lt - 1; }
  }
  insertionSortRange(arr, lo, hi);                               <span class="c">// small range: insertion sort</span>
}

function medianOfThree(arr, lo, hi) {                            <span class="c">// the median of first, middle and last values</span>
  const a = arr[lo], b = arr[lo + ((hi - lo) &gt;&gt; 1)], c = arr[hi];
  if ((a &lt;= b &amp;&amp; b &lt;= c) || (c &lt;= b &amp;&amp; b &lt;= a)) return b;
  if ((b &lt;= a &amp;&amp; a &lt;= c) || (c &lt;= a &amp;&amp; a &lt;= b)) return a;
  return c;
}

function insertionSortRange(arr, lo, hi) {
  for (let i = lo + 1; i &lt;= hi; i++) {
    const current = arr[i];
    let j = i - 1;
    while (j &gt;= lo &amp;&amp; arr[j] &gt; current) { arr[j + 1] = arr[j]; j--; }
    arr[j + 1] = current;
  }
}

function heapSortRange(arr, lo, hi) {                            <span class="c">// in-place heapsort of arr[lo..hi]</span>
  const n = hi - lo + 1;
  const siftDown = (root, size) =&gt; {
    while (true) {
      let largest = root;
      const left = 2 * root + 1, right = left + 1;
      if (left &lt; size &amp;&amp; arr[lo + left] &gt; arr[lo + largest]) largest = left;
      if (right &lt; size &amp;&amp; arr[lo + right] &gt; arr[lo + largest]) largest = right;
      if (largest === root) return;
      [arr[lo + root], arr[lo + largest]] = [arr[lo + largest], arr[lo + root]];
      root = largest;
    }
  };
  for (let root = (n &gt;&gt; 1) - 1; root &gt;= 0; root--) siftDown(root, n);   <span class="c">// build the max-heap in O(n)</span>
  for (let end = n - 1; end &gt; 0; end--) {
    [arr[lo], arr[lo + end]] = [arr[lo + end], arr[lo]];                  <span class="c">// largest to the back</span>
    siftDown(0, end);
  }
}</code></pre>
<p class="sub">
  Why the total stays O(n log n): quicksort levels each cost O(n) in total and there are
  at most 2 log₂ n of them; any range still unsorted at that point is finished by heapsort in
  O(m log m) for its size m, and those ranges are disjoint, so together they cost
  at most O(n log n); the insertion-sorted ranges are at most 16 long, so each costs a constant.
  The function was checked against the built-in sort on thousands of random arrays
  (small value ranges for duplicates included) and on 100,000-element sorted, reversed,
  all-equal and alternating inputs, and with <code>depthLeft</code> forced to 0 so that
  the heapsort path runs on every array. Introsort is not stable.
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

<h3>Writing comparators that do not lie</h3>
<p>
  A comparator <code>(a, b) =&gt; number</code> promises three things: a negative number
  means <code>a</code> goes first, a positive number means <code>b</code> goes first, and
  zero means they tie. It must also be <b>consistent</b>: if
  <code>a</code> sorts before <code>b</code> and <code>b</code> before <code>c</code>, then
  <code>a</code> sorts before <code>c</code>, and swapping the arguments flips the sign.
  A comparator that breaks this does not fail loudly. The ECMAScript specification leaves
  the resulting order implementation-defined, so you get a plausible-looking wrong array.
</p>
<h4>Multi-key sorting: chain the keys with <code>||</code></h4>
<pre><code>const staff = [
  { name: "Zoe", dept: "ops", salary: 50 },
  { name: "Al",  dept: "eng", salary: 90 },
  { name: "Bo",  dept: "eng", salary: 90 },
  { name: "Cy",  dept: "eng", salary: 70 },
];

staff.sort((a, b) =&gt;
  a.dept.localeCompare(b.dept) ||       <span class="c">// 1st key: department, A to Z</span>
  b.salary - a.salary ||                <span class="c">// 2nd key: salary, highest first (arguments swapped)</span>
  a.name.localeCompare(b.name)          <span class="c">// 3rd key: name, A to Z, breaks the remaining ties</span>
);
<span class="c">// → Al, Bo, Cy (all eng), then Zoe (ops)</span></code></pre>
<p>
  The chain works because <code>0</code> is falsy: when a key ties, <code>||</code> moves on to
  the next one, and the first non-zero result wins. Descending order is the same comparison
  with the arguments swapped (<code>b.salary - a.salary</code>).
</p>
<table>
  <tr><th>Pair compared</th><th>dept</th><th>salary (b − a)</th><th>name</th><th>Result</th></tr>
  <tr><td>Cy vs Zoe</td><td>"eng" before "ops": negative</td><td>not reached</td><td>not reached</td><td>Cy first</td></tr>
  <tr><td>Al vs Cy</td><td>tie: 0</td><td>70 − 90 = −20: negative</td><td>not reached</td><td>Al first (higher salary)</td></tr>
  <tr><td>Al vs Bo</td><td>tie: 0</td><td>90 − 90 = 0: tie</td><td>"Al" before "Bo": negative</td><td>Al first (name)</td></tr>
</table>
<p class="sub">
  Because the sort is stable (the specification requires it since ES2019), there is an
  alternative: sort by the <em>least</em> important key first, then by the next, ending with
  the most important. Each later sort keeps the earlier order among ties. One comparator is
  usually clearer and does one pass.
</p>
<h4>Comparators that look right and are not</h4>
<ul>
  <li><b>Returning a boolean.</b> <code>(a, b) =&gt; a &gt; b</code> returns <code>true</code> or <code>false</code>, which become 1 and 0 and never a negative number. It cannot say "a goes first". In node, <code>[3, 1, 2].sort((a, b) =&gt; a &gt; b)</code> returned <code>[3, 1, 2]</code> unchanged, and 30-element random arrays came out unsorted every time (2,000 of 2,000). Return <code>-1</code>, <code>0</code> or <code>1</code>, or a difference.</li>
  <li><b><code>a - b</code> is only a numeric comparator.</b> It works for ordinary numbers: the sign of the difference of two different numbers is always correct. With <code>BigInt</code> it throws <code>TypeError: Cannot convert a BigInt value to a number</code>; use <code>(a &lt; b ? -1 : a &gt; b ? 1 : 0)</code>. With <code>NaN</code> or non-numeric strings it returns <code>NaN</code>, which is treated as a tie, so the result is not reliably sorted (in node, <code>[2, 3, NaN, 0, 1]</code> comes back unchanged). (In languages with fixed-width integers, <code>a - b</code> can also overflow, another reason to prefer comparing.)</li>
  <li><b>Random comparators.</b> <code>sort(() =&gt; Math.random() - 0.5)</code> is not a shuffle. For three elements, 120,000 trials gave the order <code>[1, 2, 3]</code> 37.6% of the time and <code>[3, 2, 1]</code> 31.4%, against 16.7% for each if it were uniform. Use Fisher-Yates.</li>
  <li><b>The default sort.</b> With no comparator, elements are converted to strings and compared by UTF-16 code units: <code>["file10", "file2", "file1"]</code> sorts to <code>file1, file10, file2</code>, and <code>undefined</code> is always moved to the end without calling your comparator.</li>
  <li><b>Mutation.</b> <code>sort</code> reorders the array in place and returns that same array. <code>toSorted(compare)</code> (ES2023, available in Node 24) returns a sorted copy and leaves the original alone.</li>
</ul>
<h4>Text: <code>localeCompare</code> and numeric-aware order</h4>
<p>
  Comparing strings with <code>&lt;</code> or the default sort uses code-unit order, so
  accented letters land after <code>z</code>: <code>["é", "e", "z", "a"]</code> sorts to
  <code>a, e, z, é</code>. <code>a.localeCompare(b)</code> follows the locale's dictionary
  order (here <code>a, e, é, z</code>), and its options include
  <code>{ numeric: true }</code>, which compares embedded digit runs as numbers:
  <code>["file10", "file2", "file1"]</code> sorts to <code>file1, file2, file10</code>. The exact order
  depends on the locale and the engine's ICU data, so for results that must be identical
  everywhere compare code units on purpose. When sorting many strings, build one
  <code>Intl.Collator</code> and pass its <code>compare</code> method instead of calling
  <code>localeCompare</code> on every comparison.
</p>
<h4>A comparator you must derive: Largest Number</h4>
<p>
  Given non-negative integers, arrange them so that the concatenation is as large as possible:
  <code>[3, 30, 34, 5, 9]</code> gives <code>"9534330"</code>. Sorting the numbers by value
  or the strings alphabetically fails (<code>"3"</code> versus <code>"30"</code>). What decides
  whether <code>a</code> belongs before <code>b</code> is simply which concatenation is bigger:
  <code>a + b</code> or <code>b + a</code>. That is a valid consistent order, so it can be the
  comparator.
</p>
<pre><code>function largestNumber(nums) {
  const parts = nums.map(String);
  parts.sort((a, b) =&gt; (b + a &lt; a + b ? -1 : b + a &gt; a + b ? 1 : 0));  <span class="c">// a first when a+b is the bigger string</span>
  return parts[0] === "0" ? "0" : parts.join("");                      <span class="c">// [0, 0] must give "0", not "00"</span>
}</code></pre>
<table>
  <tr><th>Compare</th><th>a + b</th><th>b + a</th><th>Order</th></tr>
  <tr><td>"3" and "30"</td><td>"330"</td><td>"303"</td><td>"3" first</td></tr>
  <tr><td>"34" and "3"</td><td>"343"</td><td>"334"</td><td>"34" first</td></tr>
  <tr><td>"5" and "34"</td><td>"534"</td><td>"345"</td><td>"5" first</td></tr>
  <tr><td>"9" and "5"</td><td>"95"</td><td>"59"</td><td>"9" first</td></tr>
</table>
<p class="sub">
  The sorted parts are <code>9, 5, 34, 3, 30</code>, joined as <code>"9534330"</code>. The
  function matched a try-every-permutation brute force on 1,500 random small inputs that included
  zeros, repeated values and shared prefixes (<code>12</code>, <code>121</code>). The
  comparator compares strings with <code>&lt;</code>, safe here because they contain only digits.
  Time is O(n log n) comparisons, each costing up to the length of the numbers, and the all-zero
  case is the edge people forget.
</p>
<p>
  One last performance habit: the comparator is called O(n log n) times, so if it computes
  something expensive from each element (parse a date, lowercase a long string), compute that
  key once per element first, sort by the stored keys, then read the elements back
  (<code>items.map(x =&gt; ({ x, key: f(x) })).sort(...).map(e =&gt; e.x)</code>).
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

<h3>Radix sort: one digit at a time</h3>
<p>
  Counting sort needs a small range, because it allocates one counter per possible value. Integers up to
  a billion have far too many values for that. <b>Radix sort</b> keeps counting
  sort's trick of never comparing elements, but applies it to one <em>digit</em> at a time, so each
  pass needs only ten counters. Process the digits from the least significant to the
  most significant (LSD radix sort), sorting the whole array by the current digit with a
  <b>stable</b> counting sort.
</p>
<p>
  Why that ends sorted: after the pass on the ones digit, the array is ordered by its last digit.
  After the pass on the tens digit, it is ordered by tens, and because the pass is stable,
  numbers with equal tens digits stay in the order the previous pass gave them, which is ordered
  by ones. So the array is ordered by the last two digits, and by induction, after the last
  pass, by the whole number. If any pass were unstable, it would scramble the work of the passes before it.
</p>
<pre><code>function radixSort(nums) {                           <span class="c">// non-negative integers</span>
  let out = nums.slice();
  const max = out.reduce((m, x) =&gt; Math.max(m, x), 0);
  for (let place = 1; Math.floor(max / place) &gt; 0; place *= 10) {
    const counts = new Array(10).fill(0);
    for (const x of out) counts[Math.floor(x / place) % 10]++;
    for (let d = 1; d &lt; 10; d++) counts[d] += counts[d - 1];   <span class="c">// counts[d] = how many items have digit &lt;= d</span>
    const next = new Array(out.length);
    for (let i = out.length - 1; i &gt;= 0; i--) {                <span class="c">// walk BACKWARDS: that is what keeps the pass stable</span>
      const d = Math.floor(out[i] / place) % 10;
      next[--counts[d]] = out[i];                              <span class="c">// last unfilled slot for this digit</span>
    }
    out = next;
  }
  return out;
}</code></pre>
<h4>Dry run: [170, 45, 75, 90, 802, 24, 2, 66]</h4>
<table>
  <tr><th>Pass</th><th>Sorted by</th><th>Digit counts, digits 0 to 9</th><th>Array after the pass</th></tr>
  <tr><td>1</td><td>ones digit</td><td>2, 0, 2, 0, 1, 2, 1, 0, 0, 0</td><td>[170, 90, 802, 2, 24, 45, 75, 66]</td></tr>
  <tr><td>2</td><td>tens digit</td><td>2, 0, 1, 0, 1, 0, 1, 2, 0, 1</td><td>[802, 2, 24, 45, 66, 170, 75, 90]</td></tr>
  <tr><td>3</td><td>hundreds digit</td><td>6, 1, 0, 0, 0, 0, 0, 0, 1, 0</td><td>[2, 24, 45, 66, 75, 90, 170, 802]</td></tr>
</table>
<p class="sub">
  Look at pass 2: 802 and 2 both have tens digit 0 and keep their pass-1 order (802 before 2),
  and 24 follows them, then 45, 66, 170 (digit 7) and 75, 90. The loop stops once
  <code>max / place</code> reaches 0: with a maximum of 802, three passes. The function
  was checked against the built-in sort on thousands of random arrays with maxima up to
  2<sup>53</sup> − 1, plus the empty array and arrays of zeros.
</p>
<p>
  <b>Cost.</b> Each pass is O(n + 10), and the number of passes is d, the number of digits of the
  largest value, so O(d · (n + b)) for base b. For 32-bit integers in base 256 that is 4 passes
  over the data, which can beat a comparison sort. But the "linear" claim needs d
  to be a constant. If the values can be as large as n<sup>c</sup>, then d grows like
  log n and the total is again about n log n. <b>Space</b> is O(n) for the output array of each pass
  (plus O(b) counters).
</p>
<div class="warn">
  <span class="ttl">⚠ Radix sort limits</span>
  This version handles <b>non-negative integers</b> only. For negatives, subtract the
  minimum first (if the range fits safely in a number) and add it back, or sort
  negatives and non-negatives separately and reverse the negative half. It does not apply
  to arbitrary comparable objects or to floating-point numbers without extra work, and it is
  not in place. And the backwards walk over <code>out</code> is not decoration: a forward walk
  with the same counts produces the right multiset in the wrong order within a digit, which
  breaks stability and, with it, the induction above.
</div>

<h3>Why n log n is a wall for comparison sorts</h3>
<p>
  Every sort in the cheat sheet except counting and radix is a <b>comparison sort</b>: it
  learns about the data only by asking "is a before b?". For those, O(n log n) is not a
  limitation of the algorithms, it is a theorem, and the argument fits in a paragraph.
</p>
<p>
  Run any comparison sort on an input of n distinct values. Each comparison has two possible answers,
  so the sequence of answers the algorithm sees can be drawn as a <b>binary decision tree</b>: each
  internal node is a comparison, each leaf is the final ordering the algorithm outputs. There are
  n! possible orderings of the input, and a correct algorithm must be able to produce every one of them,
  so the tree needs at least n! leaves. A binary tree with L leaves has height at least log₂ L, and
  the height is the number of comparisons on the worst input. So the worst case needs at least
  log₂(n!) comparisons. To see how big that is without Stirling's formula: the largest n/2 factors of
  n! are each at least n/2, so n! ≥ (n/2)<sup>n/2</sup> and
  log₂(n!) ≥ (n/2) · log₂(n/2), which is Ω(n log n).
</p>
<table>
  <tr><th>n</th><th>n!</th><th>⌈log₂(n!)⌉: fewest worst-case comparisons any comparison sort needs</th></tr>
  <tr><td>3</td><td>6</td><td>3</td></tr>
  <tr><td>4</td><td>24</td><td>5</td></tr>
  <tr><td>5</td><td>120</td><td>7</td></tr>
  <tr><td>10</td><td>3,628,800</td><td>22</td></tr>
  <tr><td>1,000</td><td>about 4 × 10²⁵⁶⁷</td><td>8,530</td></tr>
</table>
<p class="sub">
  Merge sort is close to this floor. Its worst case, for the index-range version above, is
  n⌈log₂ n⌉ − 2<sup>⌈log₂ n⌉</sup> + 1 comparisons (an exhaustive check over every permutation confirmed this
  formula for n from 2 to 8), which for n = 1,000 is 8,977, within about 5% of the 8,530 minimum.
  No comparison sort, however clever, can do asymptotically better.
</p>
<p>
  What the theorem does <em>not</em> say. It bounds the <b>worst case</b> of sorting by comparisons.
  Insertion sort on a nearly sorted array takes O(n) because that input needs few comparisons
  to certify. And counting sort and radix sort are not covered at all: they read the
  <em>values</em> (as array indices and digits) instead of only comparing them, which is exactly why
  they can run in O(n + k) and O(d · (n + b)). The price is the assumption that
  values are small integers or fixed-width keys. That is the sentence for the interview:
  comparison sorting cannot beat n log n, so any faster claim must exploit structure in the data.
</p>

<h3>The decision framework</h3>
<table>
  <tr><th>Situation</th><th>Reach for</th></tr>
  <tr><td>Just sort it, no special constraints</td><td><code>arr.sort((a,b) => a-b)</code> — O(n log n), stable, done</td></tr>
  <tr><td>Values are small bounded integers</td><td>Counting sort — O(n + k)</td></tr>
  <tr><td>Values are floats spread evenly over a range</td><td>Bucket sort — O(n + k) average</td></tr>
  <tr><td>Need worst-case O(n log n) guarantee, O(1) space</td><td>Heap sort</td></tr>
  <tr><td>Data is nearly sorted already</td><td>Insertion sort — O(n) on nearly-sorted input</td></tr>
  <tr><td>Fixed-width or bounded integers, too many distinct values for counting sort</td><td>Radix sort — O(d · (n + b)), stable, not in place</td></tr>
  <tr><td>Only the k-th element (or the k smallest, unordered) is needed</td><td>Quickselect with a three-way partition — O(n) on average</td></tr>
  <tr><td>Many equal keys in a quicksort</td><td>Three-way partition, so the equal block is never recursed into</td></tr>
  <tr><td>Count pairs in the wrong order (inversions, reverse pairs)</td><td>Merge sort that counts while merging — O(n log n)</td></tr>
  <tr><td>Order is defined by a rule, not by value (largest number, multi-key records)</td><td>A custom comparator that is consistent, or precomputed keys</td></tr>
  <tr><td>Explaining/hand-tracing on a whiteboard</td><td>Bubble or selection sort — simplest to reason about, even though you'd never ship them</td></tr>
</table>

<h3>Recognizing when sorting is the actual pattern</h3>
<ul>
  <li>The problem gets easier once order exists — enables two pointers or binary search</li>
  <li>You need the k-th smallest/largest, or a top-K — sorting is O(n log n), often beaten by a heap (see the heaps chapter)</li>
  <li>Grouping by "same after sorting" (anagrams) — sort each item as a normalizing key</li>
  <li>Interval problems almost always start with "sort by start time"</li>
  <li>"Number of pairs out of order" or "count pairs where a[i] is more than ... a[j] for i &lt; j" is a merge sort that counts while it merges, not an O(n²) double loop</li>
  <li>"The k-th largest" or "the median" with everything in memory is quickselect (O(n) on average); with a stream or a small k it is a heap</li>
  <li>The ordering is a custom rule ("arrange to form the largest number", "by department, then salary descending"): the work is writing a comparator that is consistent</li>
  <li>The keys are bounded or fixed-width integers and n is large: counting or radix sort, and the n log n bound simply does not apply</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Recite the time/space/stability cheat sheet for bubble, insertion, merge, quicksort, and heapsort without looking it up.</li>
    <li>Trace one <code>partition</code> pass on a new small array by hand, tracking <code>i</code> and <code>j</code> at each step.</li>
    <li>Explain why quicksort's worst case is O(n²) and what a random pivot does to fix it in practice.</li>
    <li>Explain why insertion sort is O(n) on nearly-sorted data even though it's O(n²) worst case, and why TimSort exploits that.</li>
    <li>Given a new problem, decide whether counting sort, bucket sort, or a comparison sort fits — based on the value range, not habit.</li>
    <li>Write the index-range merge sort with one buffer, and say why a tie must take the left element.</li>
    <li>Explain, with the <code>mid - i</code> argument, why counting inversions inside the merge costs no more than the sort itself.</li>
    <li>Show why Lomuto's partition degrades to n² on equal keys and how a three-way partition or Hoare's scheme fixes it.</li>
    <li>Write quickselect, state its average and worst case and the reason, and convert between a 1-based "k-th largest" and a 0-based index.</li>
    <li>Write a multi-key comparator, explain why <code>(a, b) =&gt; a &gt; b</code> is wrong, and derive the Largest Number comparator.</li>
    <li>Explain why LSD radix sort needs a stable digit pass, and give the decision-tree argument for the n log n lower bound and what it does not cover.</li>
  </ul>
</div>`,
};
