import type { Chapter } from "../types";

export const dsaComplexityAnalysis: Chapter = {
  id: "dsa-complexity-analysis",
  num: "B1",
  title: "Complexity analysis",
  short: "Complexity analysis",
  levels: ["beginner"],
  practice: ["ex-classify-growth-rate", "ex-rewrite-nested-loop-linear", "ex-count-basic-operations"],
  ready: true,
  subtitle: "The one skill every interviewer is silently scoring, whether they say so or not.",
  body: `<h3>What Big-O actually measures</h3>
<p>
  Big-O is not a speed measurement. It's a description of <b>how the work
  grows</b> as the input grows. Two functions can both be "O(n)" and one
  can be 100x slower than the other in real seconds — Big-O doesn't care.
  It only answers one question: if you double the input, roughly what
  happens to the work?
</p>

<h3>The formal definition — worth seeing once</h3>
<p>
  You'll almost never need to write this out in an interview, but knowing
  it makes every informal explanation click into place. Formally,
  <code>f(n) = O(g(n))</code> means: there exist positive constants
  <code>c</code> and <code>n₀</code> such that
  <code>f(n) ≤ c · g(n)</code> for every <code>n ≥ n₀</code>. In plain
  words — <b>past some point, f(n) never grows faster than a constant
  multiple of g(n)</b>. Big-O is an upper bound on growth, not an exact
  count.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="The actual runtime curve behaving unpredictably before n0, then settling to stay under a scaled version of g(n) for every n after that, illustrating the formal definition of Big-O as an upper bound">
    <g class="rough">
      <path class="ln" d="M60,240 L620,240" />
      <path class="ln" d="M60,240 L60,20" />
    </g>
    <text class="sm" x="625" y="245">n</text>
    <path class="ln dash" d="M60,230 L260,175 L420,110 L620,50" fill="none" />
    <path class="lnr" d="M60,225 L110,140 L150,205 L200,100 L260,175 L340,150 L420,125 L500,90 L620,65" fill="none" />
    <path class="ln" d="M260,240 L260,20" stroke-dasharray="4 5" />
    <text class="sm rd" x="440" y="145">f(n) — your actual function</text>
    <text class="sm" x="420" y="95">c · g(n) — a scaled bound</text>
    <text class="lbl" x="270" y="35" style="font-size:14px">after n₀, f(n) always stays under the bound</text>
    <text class="sm" x="230" y="255">n₀</text>
  </svg>
  <figcaption>Left of n₀, f(n) can do anything — even exceed the bound (see the spike). Right of n₀, it never crosses back above c·g(n) — that's the entire promise Big-O makes.</figcaption>
</figure>
<p class="sub">
  This is exactly why constants get dropped: <code>f(n) = 5n</code> is
  still <code>O(n)</code>, because you can always pick a big enough
  <code>c</code> (say, <code>c = 5</code>) to make the inequality true.
  Big-O cares about the <em>shape</em> as n → ∞, not the specific
  multiplier.
</p>

<h3>Big-O's two siblings: Ω and Θ</h3>
<p>
  Big-O gets all the attention in interviews, but it's technically only
  the <b>upper bound</b>. Two related notations describe the other
  directions — worth being able to name if asked "isn't that also
  Ω(something)?"
</p>
<table>
  <tr><th>Notation</th><th>Means</th><th>Plain English</th></tr>
  <tr><td>O(g(n))</td><td>upper bound</td><td>"at worst, this many operations" — never more, could be less</td></tr>
  <tr><td>Ω(g(n))</td><td>lower bound</td><td>"at best, this many operations" — never fewer</td></tr>
  <tr><td>Θ(g(n))</td><td>tight bound</td><td>both O and Ω hold — this is genuinely how it grows, not just a ceiling</td></tr>
</table>
<p class="sub">
  Example: linear search is <code>O(n)</code> (never worse than scanning
  everything) <em>and</em> <code>Ω(1)</code> (you might get lucky and find
  it first) — so it's <b>not</b> <code>Θ(n)</code> in general, because
  best and worst case differ. Merge sort, on the other hand, always does
  Θ(n log n) — best, average and worst case are all the same shape, so
  people often say "O(n log n)" and "Θ(n log n)" almost interchangeably
  for it. In interviews, saying "O" when you technically mean "Θ" is
  common and accepted — but knowing the difference exists signals real
  understanding.
</p>

<h3>Best, average, and worst case — three different questions</h3>
<p>
  "What's the complexity of X" is actually an incomplete question — the
  answer can depend on <em>which</em> input you're worried about.
</p>
<table>
  <tr><th>Algorithm</th><th>Best case</th><th>Average case</th><th>Worst case</th></tr>
  <tr><td>Linear search</td><td>O(1) — target is first</td><td>O(n)</td><td>O(n) — target is last or missing</td></tr>
  <tr><td>Quicksort</td><td>O(n log n)</td><td>O(n log n)</td><td>O(n²) — already-sorted input, bad pivot</td></tr>
  <tr><td>Binary search</td><td>O(1) — target is the middle</td><td>O(log n)</td><td>O(log n)</td></tr>
  <tr><td>Insertion sort</td><td>O(n) — already sorted</td><td>O(n²)</td><td>O(n²) — reverse sorted</td></tr>
</table>
<p class="sub">
  Unless told otherwise, interviewers want the <b>worst case</b> — it's
  the guarantee that holds no matter what input shows up. But naming the
  best case too (especially when it differs a lot, like quicksort's) shows
  you actually understand the algorithm's behavior instead of having
  memorized one number.
</p>

<h3>Multiple inputs — when there isn't just one "n"</h3>
<p>
  Plenty of real problems take two different collections, and it's a
  common mistake to collapse them into one variable when they shouldn't
  be. If a function has an array of size <code>a</code> and a second
  array of size <code>b</code>:
</p>
<pre><code><span class="c">// O(a + b) — two SEPARATE passes, not nested</span>
function concat(arr1, arr2) {
  const result = [];
  for (const x of arr1) result.push(x);  <span class="c">// O(a)</span>
  for (const x of arr2) result.push(x);  <span class="c">// O(b)</span>
  return result;
}

<span class="c">// O(a × b) — NESTED, every element of one meets every element of the other</span>
function hasCommonElement(arr1, arr2) {
  for (const x of arr1) {
    for (const y of arr2) {
      if (x === y) return true;
    }
  }
  return false;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ "O(n²)" can be the wrong (and misleading) answer</span>
  If a candidate calls the first example "O(n²)" because they see two
  loops, that's a real mistake — the loops are sequential, not nested, so
  it's O(a + b), which simplifies to O(n) only if a and b are actually the
  same order of magnitude. Saying "O(a + b)" out loud instead of
  collapsing to a single n shows you're reasoning about the actual inputs,
  not pattern-matching "two loops = squared."
</div>

<h3>The picture that makes it click</h3>
<p>
  Every explanation of Big-O eventually points at the same chart. Look at
  it once, properly, and the notation stops being abstract letters and
  starts being a <em>shape</em> you recognize on sight.
</p>

<figure>
  <svg viewBox="0 0 680 400" class="dg" role="img" aria-label="A chart of operations versus input size n, showing O(1) and O(log n) staying low, O(n) rising as a straight diagonal, O(n log n) rising faster, and O(n squared) and O(2 to the n) shooting almost straight up and exiting the top of the chart early">
    <g class="rough">
      <path class="ln" d="M70,340 L640,340" />
      <path class="ln" d="M70,340 L70,20" />
    </g>
    <text class="sm" x="645" y="345">n</text>
    <text class="sm" x="40" y="20">ops</text>

    <!-- O(1) — flat, green solid -->
    <path class="lng" d="M70,320 L640,320" fill="none" />
    <!-- O(log n) — green dashed, slow rise that flattens -->
    <path class="lng dash" d="M70,320 C 200,300 380,270 640,250" fill="none" />
    <!-- O(n) — black solid diagonal -->
    <path class="ln" d="M70,320 L640,60" fill="none" />
    <!-- O(n log n) — black dashed, above O(n), exits near the top-right -->
    <path class="ln dash" d="M70,320 C 300,220 500,90 610,25" fill="none" />
    <!-- O(n^2) — red solid, steep, exits top early -->
    <path class="lnr" d="M70,320 C 180,260 300,120 360,25" fill="none" />
    <path class="lnr dash" d="M360,25 L360,10" fill="none" />
    <!-- O(2^n) — red dashed, exits top almost immediately -->
    <path class="lnr dash" d="M70,320 C 110,260 160,120 195,25" fill="none" />
    <path class="lnr dash" d="M195,25 L195,10" fill="none" />

    <text class="sm gr" x="546" y="316">O(1)</text>
    <text class="sm gr" x="546" y="242">O(log n)</text>
    <text class="sm" x="546" y="52">O(n)</text>
    <text class="sm" x="440" y="72">O(n log n)</text>
    <text class="sm rd" x="230" y="45">O(n²)</text>
    <text class="sm rd" x="15" y="45">O(2ⁿ)</text>
    <text class="sm rd" x="15" y="378">O(n²) and O(2ⁿ) both explode — see the table below for real numbers</text>
  </svg>
  <figcaption>Same input size n on the x-axis for every curve — the only difference is the shape of the growth. Green stays cheap, red gets unusable fast.</figcaption>
</figure>

<div class="say">
  <span class="ttl">Say it like this →</span> "Big-O describes the growth
  rate of an algorithm's work relative to input size, ignoring constants —
  it's a shape, not a stopwatch."
</div>

<h3>Why the shape matters more than it seems — actual numbers</h3>
<p>
  The chart makes the shape obvious, but the real gut-punch is what these
  shapes mean at realistic input sizes. This is the table that explains
  why an interviewer's face changes when your solution is O(n²) on an
  input that might be a million elements.
</p>
<table>
  <tr><th>Complexity</th><th>n = 10</th><th>n = 1,000</th><th>n = 1,000,000</th></tr>
  <tr><td>O(1)</td><td>1</td><td>1</td><td>1</td></tr>
  <tr><td>O(log n)</td><td>~3</td><td>~10</td><td>~20</td></tr>
  <tr><td>O(n)</td><td>10</td><td>1,000</td><td>1,000,000</td></tr>
  <tr><td>O(n log n)</td><td>~33</td><td>~10,000</td><td>~20,000,000</td></tr>
  <tr><td>O(n²)</td><td>100</td><td>1,000,000</td><td>1,000,000,000,000</td></tr>
  <tr><td>O(2ⁿ)</td><td>1,024</td><td>more than atoms in the universe</td><td>—</td></tr>
</table>
<p class="sub">
  A modern CPU does roughly 10⁸–10⁹ simple operations per second. At
  n = 1,000,000, an O(n) solution finishes in a blink; an O(n²) solution
  needs a <b>trillion</b> operations — that's minutes to hours, not
  milliseconds, on the exact same input. This is the entire reason
  interviewers care so much about the shape and so little about your
  variable names.
</p>

<h3>The complexities you'll actually see</h3>
<table>
  <tr>
    <th>Name</th>
    <th>Notation</th>
    <th>Feels like</th>
    <th>Example</th>
  </tr>
  <tr>
    <td>Constant</td>
    <td><code>O(1)</code></td>
    <td>same work no matter the input size</td>
    <td>array index access, hash map lookup</td>
  </tr>
  <tr>
    <td>Logarithmic</td>
    <td><code>O(log n)</code></td>
    <td>work halves each step</td>
    <td>binary search</td>
  </tr>
  <tr>
    <td>Linear</td>
    <td><code>O(n)</code></td>
    <td>one pass over the input</td>
    <td>a single loop, array scan</td>
  </tr>
  <tr>
    <td>Linearithmic</td>
    <td><code>O(n log n)</code></td>
    <td>a linear pass, log n times</td>
    <td>merge sort, quicksort (average)</td>
  </tr>
  <tr>
    <td>Quadratic</td>
    <td><code>O(n²)</code></td>
    <td>a loop inside a loop</td>
    <td>comparing every pair, bubble sort</td>
  </tr>
  <tr>
    <td>Exponential</td>
    <td><code>O(2ⁿ)</code></td>
    <td>doubles with every extra input</td>
    <td>naive recursive Fibonacci, subsets</td>
  </tr>
  <tr>
    <td>Factorial</td>
    <td><code>O(n!)</code></td>
    <td>every possible ordering</td>
    <td>brute-force permutations</td>
  </tr>
</table>
<p class="sub">
  In interviews, almost every answer you'll ever give is one of these
  seven. If you can name which shape your solution is and defend why,
  you've already cleared the bar most candidates trip on.
</p>

<h3>Reading complexity out of code</h3>
<p>The rule of thumb: count the loops, not the lines.</p>
<pre><code><span class="c">// O(1) — no loop, fixed number of steps</span>
function first(arr) {
  return arr[0];
}

<span class="c">// O(n) — one loop over the input</span>
function sum(arr) {
  let total = 0;
  for (let i = 0; i < arr.length; i++) {
    total += arr[i];
  }
  return total;
}

<span class="c">// O(n²) — a loop inside a loop, both sized by n</span>
function hasDuplicatePair(arr) {
  for (let i = 0; i < arr.length; i++) {
    for (let j = i + 1; j < arr.length; j++) {
      if (arr[i] === arr[j]) return true;
    }
  }
  return false;
}

<span class="c">// O(log n) — the search space halves every step</span>
function binarySearch(sorted, target) {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {
    const mid = (lo + hi) >> 1;
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1;
}</code></pre>

<div class="warn">
  <span class="ttl">⚠ The hidden O(n) inside a loop</span>
  <code>arr.includes(x)</code>, <code>arr.indexOf(x)</code> and
  <code>[...set]</code> are each O(n) on their own. Call one of them
  inside a loop that already runs n times, and the whole function is
  quietly O(n²) — even though you only wrote one visible <code>for</code>.
  This exact trap is one of the most common ways candidates lose points
  without realizing it.
</div>

<pre><code><span class="c">// looks like O(n) — is actually O(n²)</span>
function hasDuplicate(arr) {
  const seen = [];
  for (const x of arr) {
    if (seen.includes(x)) return true;  <span class="c">// O(n) work, n times</span>
    seen.push(x);
  }
  return false;
}

<span class="c">// the fix: swap the array for a Set → O(1) lookup → true O(n)</span>
function hasDuplicateFast(arr) {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x)) return true;
    seen.add(x);
  }
  return false;
}</code></pre>

<h3>Dropping constants and lower-order terms</h3>
<p>
  <code>O(2n)</code> is written as <code>O(n)</code>. <code>O(n² + n)</code>
  is written as <code>O(n²)</code>. Big-O describes what dominates as
  <code>n</code> gets large — the constant factor and the smaller terms
  stop mattering. This is also why "my solution does 3 passes instead of
  1" is still <code>O(n)</code>, just with a bigger constant. It's a
  legitimate follow-up question ("can you get it to one pass?") but it
  doesn't change the Big-O class.
</p>

<h3>Recurrence relations — how you actually derive O(n log n)</h3>
<p>
  For recursive code, "count the loops" doesn't work — you need a
  <b>recurrence relation</b>: an equation describing the work at size n in
  terms of the work at smaller sizes. Merge sort's recurrence is the
  classic example:
</p>
<pre><code>T(n) = 2·T(n/2) + O(n)
       ↑           ↑
       2 subproblems   the merge step, linear work
       of half the size</code></pre>
<p>
  Read it as: "the cost of sorting n elements equals the cost of sorting
  two halves, plus the linear-time work to merge them back together."
  Solving this (formally, by repeatedly substituting, or informally with
  the recursion-tree diagram from the sorting chapter — each of log n
  levels does O(n) total work) gives <code>T(n) = O(n log n)</code>.
</p>

<div class="sticky mint">
  <span class="ttl">The Master Theorem — the shortcut for "obvious shape" recurrences</span>
  For any recurrence of the form <code>T(n) = a·T(n/b) + O(nᵈ)</code>
  (a subproblems, each of size n/b, plus O(nᵈ) work to combine them),
  compare <code>d</code> to <code>log_b(a)</code>:
  <ul style="margin:8px 0 0">
    <li>if <code>d &lt; log_b(a)</code> → <code>T(n) = O(n^(log_b a))</code> — the recursion dominates</li>
    <li>if <code>d = log_b(a)</code> → <code>T(n) = O(nᵈ log n)</code> — balanced (this is merge sort: a=2, b=2, d=1, log₂2=1=d)</li>
    <li>if <code>d &gt; log_b(a)</code> → <code>T(n) = O(nᵈ)</code> — the combine step dominates</li>
  </ul>
</div>
<table>
  <tr><th>Algorithm</th><th>Recurrence</th><th>a, b, d</th><th>Result</th></tr>
  <tr><td>Binary search</td><td>T(n) = T(n/2) + O(1)</td><td>a=1, b=2, d=0</td><td>O(log n)</td></tr>
  <tr><td>Merge sort</td><td>T(n) = 2T(n/2) + O(n)</td><td>a=2, b=2, d=1</td><td>O(n log n)</td></tr>
  <tr><td>Binary tree traversal</td><td>T(n) = 2T(n/2) + O(1)</td><td>a=2, b=2, d=0</td><td>O(n)</td></tr>
  <tr><td>Naive recursive Fibonacci</td><td>T(n) = 2T(n-1) + O(1)</td><td>doesn't fit the form (n-1, not n/b)</td><td>O(2ⁿ)</td></tr>
</table>
<p class="sub">
  You will not be asked to apply the Master Theorem from memory in most
  interviews — but being able to write down a recurrence for your own
  recursive solution, and reason informally about "how many levels ×
  how much work per level," is a real and commonly-tested skill.
</p>

<h3>Space complexity — the part people forget</h3>
<p>
  Space complexity counts <b>extra</b> memory your algorithm uses, not
  counting the input itself. Two things people forget to count:
</p>
<ul>
  <li>
    <b>Output that isn't asked for as input</b> — building a new array to
    return costs O(n) space, even if you never call
    <code>new Array()</code> explicitly.
  </li>
  <li>
    <b>The call stack.</b> Recursion isn't free — each call frame sits on
    the stack until it returns. A recursive function that goes n levels
    deep costs O(n) space even if it allocates nothing else.
  </li>
</ul>

<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="Comparing O(1) space, which uses a few fixed variables, against O(n) space, where a call stack grows one frame per recursive call">
    <g class="rough">
      <rect class="boxg" x="30" y="130" width="220" height="50" rx="6" />
      <rect class="boxr" x="400" y="150" width="200" height="30" />
      <rect class="boxr" x="400" y="118" width="200" height="30" />
      <rect class="boxr" x="400" y="86" width="200" height="30" />
      <rect class="boxr" x="400" y="54" width="200" height="30" />
    </g>
    <text class="sm gr" x="140" y="160" text-anchor="middle">a few variables — that's it</text>
    <text class="lbl gr" x="30" y="115" style="font-size:15px">O(1) space — flat, no matter how big n is</text>
    <text class="sm rd" x="500" y="170" text-anchor="middle">frame n</text>
    <text class="sm rd" x="500" y="138" text-anchor="middle">frame 3</text>
    <text class="sm rd" x="500" y="106" text-anchor="middle">frame 2</text>
    <text class="sm rd" x="500" y="74" text-anchor="middle">frame 1</text>
    <text class="lbl rd" x="20" y="30" style="font-size:15px">O(n) space — one stack frame per call, held until it returns</text>
  </svg>
  <figcaption>Same task, two different space profiles — the iterative version never grows a stack; the recursive one grows one frame per call in flight.</figcaption>
</figure>

<pre><code><span class="c">// O(n) time, O(1) space — no extra structure grows with input</span>
function maxValue(arr) {
  let max = -Infinity;
  for (const x of arr) if (x > max) max = x;
  return max;
}

<span class="c">// O(n) time, O(n) space — the call stack holds n frames</span>
function sumRecursive(arr, i = 0) {
  if (i === arr.length) return 0;
  return arr[i] + sumRecursive(arr, i + 1);
}</code></pre>

<h3>Amortized complexity — the array.push() case</h3>
<p>
  <code>array.push()</code> is described as O(1), but that's an
  <b>amortized</b> average, not a per-call guarantee. Under the hood a
  dynamic array is backed by a fixed-size buffer; most pushes are O(1),
  but occasionally the buffer is full and the engine allocates a new,
  bigger one and copies everything over — an O(n) operation. Because that
  expensive copy happens rarely (typically doubling the capacity each
  time), the <em>average</em> cost per push, spread over many calls,
  works out to O(1). "Amortized O(1)" means exactly this: not every
  single call is cheap, but the total cost over many calls divides out to
  a constant per call.
</p>

<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="A dynamic array doubling its capacity each time it fills up, so most pushes are free and only occasional pushes trigger a full copy">
    <g class="rough">
      <rect class="box" x="30" y="20" width="40" height="34" />
      <rect class="box" x="120" y="20" width="40" height="34" /><rect class="box" x="160" y="20" width="40" height="34" />
      <rect class="box" x="250" y="20" width="40" height="34" /><rect class="box" x="290" y="20" width="40" height="34" />
      <rect class="boxr" x="330" y="20" width="40" height="34" /><rect class="boxr" x="370" y="20" width="40" height="34" />
      <rect class="box" x="460" y="20" width="30" height="34" /><rect class="box" x="490" y="20" width="30" height="34" />
      <rect class="box" x="520" y="20" width="30" height="34" /><rect class="box" x="550" y="20" width="30" height="34" />
      <rect class="boxr" x="580" y="20" width="30" height="34" /><rect class="boxr" x="610" y="20" width="30" height="34" />
    </g>
    <text class="sm" x="50" y="42" text-anchor="middle">cap 1</text>
    <text class="lbl" x="120" y="75" style="font-size:13px">cap 2</text>
    <text class="lbl" x="250" y="75" style="font-size:13px">cap 4</text>
    <text class="lbl" x="460" y="75" style="font-size:13px">cap 8</text>
    <text class="sm rd" x="350" y="10" text-anchor="middle" style="font-size:11px">copy!</text>
    <text class="lbl" x="20" y="110" style="font-size:14px">Total copying across n pushes: 1+2+4+8+…+n/2 ≈ n — spread over n pushes, that's O(1) each</text>
    <text class="lbl" x="20" y="140" style="font-size:14px">This is the "aggregate method": sum the TOTAL cost of n operations, then divide by n</text>
    <text class="lbl" x="20" y="165" style="font-size:14px">to get the amortized cost PER operation — not the same as "average case" over random inputs.</text>
  </svg>
  <figcaption>Doubling means the sizes form a geometric series — that series summing to roughly n is the entire proof.</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ Amortized ≠ average case — a common mix-up</span>
  <b>Average case</b> is about the distribution of possible <em>inputs</em>
  (quicksort is fast on average because most inputs don't trigger worst-case
  pivots). <b>Amortized</b> is about the distribution of cost across a
  <em>sequence of operations</em> on the same structure, regardless of
  input — push() is amortized O(1) no matter what values you push, because
  the guarantee comes from the doubling strategy, not from luck.
</div>

<div class="sticky mint">
  <span class="ttl">The habit to build</span>
  Before you write a line of code in an interview, say the shape out
  loud: "I'll scan the array once and use a hash map for lookups, so
  this should be O(n) time, O(n) space." State it, then build toward it —
  it turns your solution into a plan instead of a guess.
</div>

<div class="try">
  <pre><code><span class="c">// what's the time complexity of this function? try changing</span>
<span class="c">// the input size in your head before running — does the pattern hold?</span>
function countPairs(arr) {
  let count = 0;
  for (let i = 0; i < arr.length; i++) {
    for (let j = 0; j < arr.length; j++) {
      if (arr[i] + arr[j] === 10) count++;
    }
  }
  return count;
}

console.log(countPairs([1, 9, 2, 8, 3, 7]));</code></pre>
</div>
<p class="sub">
  Two nested loops, each running the full length of the array →
  O(n²) time, O(1) space. Notice it doesn't matter that the inner loop
  "only" checks a sum — the shape is decided by the loop structure, not
  what's inside it.
</p>`,
};
