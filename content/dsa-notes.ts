import type { NotesFile } from "./types";

export const dsaNotes: NotesFile = {
  meta: {
    title: "DSA in JS — the whole map",
    subtitle: "34 sections across three levels — beginner through advanced, all written.",
    lead: "Pick a level and you'll get these sections in the order that makes sense, from the first pointer trick to segment trees and interview strategy.",
    author: "Akshat",
    updated: "August 2026",
  },

  hero: { figure: "" },

  chapters: [
    {
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
    },
    {
      id: "dsa-arrays-strings",
      num: "B2",
      title: "Arrays & strings",
      short: "Arrays & strings",
      levels: ["beginner"],
      practice: [
        "ex-best-time-to-buy-and-sell-stock",
        "ex-maximum-subarray",
        "ex-merge-sorted-array",
        "ex-remove-duplicates-from-sorted-array",
        "ex-rotate-array",
        "ex-product-of-array-except-self",
        "ex-majority-element",
        "ex-move-zeroes",
        "ex-contains-duplicate",
        "ex-missing-number",
        "ex-find-disappeared-numbers",
        "ex-subarray-sum-equals-k",
        "ex-continuous-subarray-sum",
        "ex-max-size-subarray-sum-equals-k",
        "ex-contiguous-array",
        "ex-find-pivot-index",
        "ex-range-sum-query-immutable",
        "ex-longest-common-prefix",
        "ex-reverse-string-in-place",
        "ex-reverse-words-in-string",
        "ex-string-to-integer-atoi",
        "ex-integer-to-roman",
        "ex-roman-to-integer",
        "ex-zigzag-conversion",
      ],
      ready: true,
      subtitle: "The two data structures every other pattern is built on top of.",
      body: `<h3>What "beginner" means for this chapter</h3>
<p>
  If arrays and strings already feel completely automatic to you, skim
  this one — but don't skip it. The interview traps in this chapter
  (accidental O(n²) string building, <code>unshift</code>'s hidden cost,
  the shared-reference 2D array bug) are some of the most common ways
  strong candidates lose points on otherwise-correct solutions.
</p>

<h3>An array is a promise about memory</h3>
<p>
  A JS array is really a resizable list, but the mental model interviewers
  expect comes from the lower-level version: a contiguous block of memory
  where <b>index math replaces searching</b>. Because every slot is the
  same fixed size apart, the address of index <code>i</code> is just
  <code>base + i × size</code> — no walking, no scanning. That's the whole
  reason <code>arr[i]</code> is O(1): it's arithmetic, not a lookup.
</p>

<figure>
  <svg viewBox="0 0 640 160" class="dg" role="img" aria-label="An array as contiguous memory slots, each reachable directly by index arithmetic">
    <g class="rough">
      <rect class="box" x="20" y="40" width="80" height="60" />
      <rect class="box" x="100" y="40" width="80" height="60" />
      <rect class="box" x="180" y="40" width="80" height="60" />
      <rect class="box" x="260" y="40" width="80" height="60" />
      <rect class="box" x="340" y="40" width="80" height="60" />
    </g>
    <text class="sm" x="60" y="75" text-anchor="middle">7</text>
    <text class="sm" x="140" y="75" text-anchor="middle">3</text>
    <text class="sm" x="220" y="75" text-anchor="middle">9</text>
    <text class="sm" x="300" y="75" text-anchor="middle">1</text>
    <text class="sm" x="380" y="75" text-anchor="middle">5</text>
    <text class="sm" x="60" y="118" text-anchor="middle">[0]</text>
    <text class="sm" x="140" y="118" text-anchor="middle">[1]</text>
    <text class="sm" x="220" y="118" text-anchor="middle">[2]</text>
    <text class="sm" x="300" y="118" text-anchor="middle">[3]</text>
    <text class="sm" x="380" y="118" text-anchor="middle">[4]</text>
    <text class="lbl" x="440" y="65" style="font-size:16px">arr[3] = base + 3×size</text>
    <text class="sm" x="440" y="88">no scanning — direct math</text>
  </svg>
  <figcaption>Index access is a formula, not a search — that's the entire source of O(1).</figcaption>
</figure>

<h3>What's actually O(1) vs O(n) on an array</h3>
<table>
  <tr><th>Operation</th><th>Complexity</th><th>Why</th></tr>
  <tr><td>Read/write by index</td><td>O(1)</td><td>direct address math</td></tr>
  <tr><td>Push/pop at the end</td><td>O(1) amortized</td><td>no shifting needed</td></tr>
  <tr><td>Shift/unshift at the start</td><td>O(n)</td><td>every other element moves over</td></tr>
  <tr><td><code>splice()</code> in the middle</td><td>O(n)</td><td>everything after the cut shifts</td></tr>
  <tr><td>Search by value (<code>indexOf</code>, <code>includes</code>)</td><td>O(n)</td><td>no shortcut — has to walk it</td></tr>
</table>
<figure>
  <svg viewBox="0 0 640 340" class="dg" role="img" aria-label="Before: three elements sit at indices 0, 1 and 2. After unshift, each of those three elements has moved one slot to the right, and the new element fills the now-empty index 0.">
    <text class="lbl" x="20" y="20" style="font-size:15px">BEFORE — arr = [7, 3, 9], 3 elements at indices 0, 1, 2</text>
    <g class="rough">
      <rect class="box" x="20" y="35" width="70" height="50" />
      <rect class="box" x="90" y="35" width="70" height="50" />
      <rect class="box" x="160" y="35" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="65" text-anchor="middle">7</text>
    <text class="sm" x="125" y="65" text-anchor="middle">3</text>
    <text class="sm" x="195" y="65" text-anchor="middle">9</text>
    <text class="sm" x="55" y="100" text-anchor="middle">[0]</text>
    <text class="sm" x="125" y="100" text-anchor="middle">[1]</text>
    <text class="sm" x="195" y="100" text-anchor="middle">[2]</text>

    <path class="lnr" d="M55,90 C 55,130 125,140 125,183" fill="none" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M125,90 C 125,130 195,140 195,183" fill="none" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M195,90 C 195,130 265,140 265,183" fill="none" marker-end="url(#dgarrow3)" />
    <defs>
      <marker id="dgarrow3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="sm rd" x="330" y="140" text-anchor="middle">each one moves one slot right — O(n) total</text>

    <text class="lbl" x="20" y="215" style="font-size:15px">AFTER — unshift(x) fills the now-empty index 0</text>
    <g class="rough">
      <rect class="boxg" x="20" y="230" width="70" height="50" />
      <rect class="box" x="90" y="230" width="70" height="50" />
      <rect class="box" x="160" y="230" width="70" height="50" />
      <rect class="box" x="230" y="230" width="70" height="50" />
    </g>
    <text class="sm gr" x="55" y="260" text-anchor="middle">x</text>
    <text class="sm" x="125" y="260" text-anchor="middle">7</text>
    <text class="sm" x="195" y="260" text-anchor="middle">3</text>
    <text class="sm" x="265" y="260" text-anchor="middle">9</text>
    <text class="sm" x="55" y="295" text-anchor="middle">[0]</text>
    <text class="sm" x="125" y="295" text-anchor="middle">[1]</text>
    <text class="sm" x="195" y="295" text-anchor="middle">[2]</text>
    <text class="sm" x="265" y="295" text-anchor="middle">[3]</text>
    <text class="lbl gr" x="20" y="320" style="font-size:13px">7 is now at [1] not [0], 3 is now at [2] not [1], 9 is now at [3] not [2]</text>
  </svg>
  <figcaption>Every element's INDEX changes, which means every element's underlying memory slot changes too — that's the O(n) work, done before x even gets placed at [0].</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ The interview trap</span>
  <code>arr.unshift(x)</code> and <code>arr.shift()</code> <em>feel</em> like
  O(1) because they're one method call — they're not. Every remaining
  element has to physically move one slot over. If you reach for these
  inside a loop, you've likely turned an O(n) solution into O(n²) by
  accident.
</div>

<h3>Strings are arrays with one extra rule</h3>
<p>
  In JS, strings are <b>immutable</b> — <code>str[0] = "x"</code> silently
  does nothing. Every "mutation" (<code>slice</code>, <code>+</code>,
  <code>replace</code>) actually builds a brand new string. That has a real
  cost: repeatedly concatenating inside a loop is O(n) <em>per
  concatenation</em>, so a naive loop that builds a string character by
  character is O(n²), not O(n).
</p>
<pre><code><span class="c">// O(n²) — each += allocates a new string of growing length</span>
function buildSlow(chars) {
  let out = "";
  for (const c of chars) out += c;
  return out;
}

<span class="c">// O(n) — push to an array (O(1) amortized), join once at the end</span>
function buildFast(chars) {
  const parts = [];
  for (const c of chars) parts.push(c);
  return parts.join("");
}</code></pre>

<h3>The in-place pattern</h3>
<p>
  A huge share of array interview questions ask for O(1) extra space,
  which means mutating the input instead of allocating a new array. The
  standard tool is <b>swap-and-shrink</b>: walk with two indices, overwrite
  in place, and treat everything past a "write pointer" as garbage.
</p>
<pre><code><span class="c">// remove all occurrences of val, in place, return new length</span>
function removeElement(nums, val) {
  let write = 0;
  for (let read = 0; read < nums.length; read++) {
    if (nums[read] !== val) {
      nums[write] = nums[read];
      write++;
    }
  }
  return write; <span class="c">// [0, write) is the real answer</span>
}</code></pre>
<p class="sub">
  This "read pointer scans everything, write pointer only advances on a
  keep" shape reappears constantly — it's the seed of the two-pointers
  chapter next.
</p>

<h3>Prefix sums — turn O(n) range queries into O(1)</h3>
<p>
  If you're going to ask "what's the sum of elements from index i to j?"
  <em>more than once</em> on the same array, recomputing each sum by
  scanning is wasteful. Precompute a running total once — O(n) — and every
  range sum after that is a subtraction, O(1).
</p>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="A prefix sum array where each entry holds the running total up to that index, letting a range sum be computed as a single subtraction">
    <g class="rough">
      <rect class="box" x="20" y="20" width="70" height="40" />
      <rect class="box" x="90" y="20" width="70" height="40" />
      <rect class="box" x="160" y="20" width="70" height="40" />
      <rect class="box" x="230" y="20" width="70" height="40" />
      <rect class="box" x="300" y="20" width="70" height="40" />
    </g>
    <text class="sm" x="55" y="45" text-anchor="middle">3</text>
    <text class="sm" x="125" y="45" text-anchor="middle">1</text>
    <text class="sm" x="195" y="45" text-anchor="middle">4</text>
    <text class="sm" x="265" y="45" text-anchor="middle">1</text>
    <text class="sm" x="335" y="45" text-anchor="middle">5</text>
    <text class="lbl" x="20" y="85" style="font-size:13px">original array</text>

    <g class="rough">
      <rect class="boxg" x="20" y="100" width="70" height="40" />
      <rect class="boxg" x="90" y="100" width="70" height="40" />
      <rect class="boxy" x="160" y="100" width="70" height="40" />
      <rect class="box" x="230" y="100" width="70" height="40" />
      <rect class="boxy" x="300" y="100" width="70" height="40" />
    </g>
    <text class="sm gr" x="55" y="125" text-anchor="middle">3</text>
    <text class="sm gr" x="125" y="125" text-anchor="middle">4</text>
    <text class="sm" x="195" y="125" text-anchor="middle">8</text>
    <text class="sm" x="265" y="125" text-anchor="middle">9</text>
    <text class="sm" x="335" y="125" text-anchor="middle">14</text>
    <text class="lbl" x="20" y="160" style="font-size:13px">sum(1..4) = prefix[4] − prefix[0] = 14 − 3 = 11</text>
    <text class="lbl" x="20" y="182" style="font-size:13px">prefix[i] = sum of everything up to and including index i</text>
  </svg>
  <figcaption>One O(n) pass builds the prefix array; every range sum after that is O(1) — a single subtraction.</figcaption>
</figure>
<pre><code>function buildPrefixSums(nums) {
  const prefix = new Array(nums.length);
  prefix[0] = nums[0];
  for (let i = 1; i < nums.length; i++) {
    prefix[i] = prefix[i - 1] + nums[i];
  }
  return prefix;
}

<span class="c">// sum of nums[left..right] inclusive, O(1) after O(n) preprocessing</span>
function rangeSum(prefix, left, right) {
  return left === 0 ? prefix[right] : prefix[right] - prefix[left - 1];
}</code></pre>
<p class="sub">
  This is the single highest-leverage array trick for "answer many range
  queries" problems — it turns what looks like it needs O(n) per query
  (O(n·q) for q queries) into O(n) total preprocessing plus O(1) per
  query. The same idea extends to 2D (a prefix-sum matrix for rectangle
  sums) and to counting problems (prefix counts of a condition).
</p>

<h3>Kadane's algorithm — the maximum subarray, in one pass</h3>
<p>
  "Find the contiguous subarray with the largest sum" looks like it needs
  checking every subarray — O(n²). Kadane's insight: at each position,
  the best subarray ending <em>here</em> is either "extend the previous
  best" or "start fresh from here" — whichever is bigger — because a
  negative running sum can only ever hurt what comes after it.
</p>
<pre><code>function maxSubArray(nums) {
  let bestSoFar = nums[0];
  let bestEndingHere = nums[0];

  for (let i = 1; i < nums.length; i++) {
    bestEndingHere = Math.max(nums[i], bestEndingHere + nums[i]);
    bestSoFar = Math.max(bestSoFar, bestEndingHere);
  }
  return bestSoFar;
}</code></pre>
<p><code>nums = [-2, 1, -3, 4, -1, 2, 1, -5, 4]</code>:</p>
<table>
  <tr><th>i</th><th>nums[i]</th><th>bestEndingHere</th><th>bestSoFar</th></tr>
  <tr><td>0</td><td>-2</td><td>-2</td><td>-2</td></tr>
  <tr><td>1</td><td>1</td><td>max(1, -2+1)=1</td><td>1</td></tr>
  <tr><td>2</td><td>-3</td><td>max(-3, 1-3)=-2</td><td>1</td></tr>
  <tr><td>3</td><td>4</td><td>max(4, -2+4)=4</td><td>4</td></tr>
  <tr><td>4</td><td>-1</td><td>max(-1, 4-1)=3</td><td>4</td></tr>
  <tr><td>5</td><td>2</td><td>max(2, 3+2)=5</td><td>5</td></tr>
  <tr><td>6</td><td>1</td><td>max(1, 5+1)=6</td><td>6</td></tr>
  <tr><td>7</td><td>-5</td><td>max(-5, 6-5)=1</td><td>6</td></tr>
  <tr><td>8</td><td>4</td><td>max(4, 1+4)=5</td><td>6</td></tr>
</table>
<p class="sub">
  Answer: 6, from subarray <code>[4, -1, 2, 1]</code>. This is O(n) time,
  O(1) space — and it's the template for a whole family of "best
  contiguous X" problems (max product subarray, circular array variants).
</p>

<h3>Rotating an array in O(1) space — the triple-reversal trick</h3>
<p>
  Rotating right by k with a new array is easy but O(n) space. The
  in-place version uses a neat property: reversing the whole array, then
  reversing each of the two pieces that should end up in the "wrong"
  order, produces a correct rotation.
</p>
<pre><code>function rotate(nums, k) {
  k = k % nums.length;
  reverse(nums, 0, nums.length - 1);  <span class="c">// reverse everything</span>
  reverse(nums, 0, k - 1);            <span class="c">// un-reverse the first k</span>
  reverse(nums, k, nums.length - 1);  <span class="c">// un-reverse the rest</span>
}

function reverse(arr, lo, hi) {
  while (lo < hi) {
    [arr[lo], arr[hi]] = [arr[hi], arr[lo]];
    lo++; hi--;
  }
}
<span class="c">// [1,2,3,4,5,6,7], k=3
   reverse all    → [7,6,5,4,3,2,1]
   reverse [0,k)  → [5,6,7,4,3,2,1]
   reverse [k,n)  → [5,6,7,1,2,3,4]  ← correctly rotated right by 3</span></code></pre>
<p class="sub">
  Three O(n) reversals is still O(n) total, but O(1) extra space instead
  of O(n) — the kind of tradeoff interviewers specifically probe for with
  "can you do it without the extra array?"
</p>

<h3>2D arrays — same rules, one more dimension</h3>
<p>
  A 2D array in JS is really an array of arrays — each row is its own
  separate array object, stored at scattered locations (unlike a true
  contiguous 2D block in lower-level languages). <code>grid[i][j]</code>
  is still O(1): it's two index lookups chained, each O(1).
</p>
<figure>
  <svg viewBox="0 0 500 190" class="dg" role="img" aria-label="A 2D array as an array of separate row arrays, each row its own object, indexed as grid of i then j">
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="130" height="30" />
      <rect class="boxy" x="20" y="60" width="130" height="30" />
      <rect class="boxy" x="20" y="100" width="130" height="30" />
      <rect class="box" x="220" y="10" width="220" height="34" />
      <rect class="box" x="220" y="55" width="220" height="34" />
      <rect class="box" x="220" y="100" width="220" height="34" />
    </g>
    <text class="sm" x="85" y="40" text-anchor="middle">grid[0] →</text>
    <text class="sm" x="85" y="80" text-anchor="middle">grid[1] →</text>
    <text class="sm" x="85" y="120" text-anchor="middle">grid[2] →</text>
    <text class="sm" x="330" y="32" text-anchor="middle">1  2  3</text>
    <text class="sm" x="330" y="77" text-anchor="middle">4  5  6</text>
    <text class="sm" x="330" y="122" text-anchor="middle">7  8  9</text>
    <text class="lbl" x="20" y="165" style="font-size:13px">grid[1][2] → row 1, then index 2 within it → 6. Two O(1) lookups, chained.</text>
  </svg>
  <figcaption>Three separate row arrays, not one contiguous block — which is exactly why the fill()-sharing bug below happens.</figcaption>
</figure>
<pre><code><span class="c">// row-major traversal — the standard order, matches memory/cache-friendly access</span>
function traverse2D(grid) {
  for (let row = 0; row < grid.length; row++) {
    for (let col = 0; col < grid[row].length; col++) {
      console.log(grid[row][col]);
    }
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The shared-row bug</span>
  <code>Array(n).fill(Array(m).fill(0))</code> creates <b>one</b> inner
  array and reuses the same reference for every row — mutate
  <code>grid[0][0]</code> and you'll find <code>grid[1][0]</code> changed
  too. Build each row independently instead:
  <pre><code>const grid = Array.from({ length: n }, () => Array(m).fill(0));</code></pre>
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "Arrays give O(1) random
  access because the address is computed, not searched — but any operation
  that has to shift elements is O(n), and strings are immutable so
  building one char-by-char in a loop is O(n²) unless you batch it."
</div>

<h3>Common gotchas worth knowing cold</h3>
<ul>
  <li><b>Sparse arrays</b> — <code>new Array(5)</code> creates 5 empty
    slots, not zeros; <code>.map()</code> skips them.</li>
  <li><b>Copying</b> — <code>const b = a</code> copies the reference, not
    the array. Use <code>[...a]</code> or <code>a.slice()</code> for a
    shallow copy.</li>
  <li><b><code>sort()</code> mutates</b> the original array and defaults to
    <em>string</em> comparison — <code>[10, 2, 1].sort()</code> gives
    <code>[1, 10, 2]</code> unless you pass a comparator.</li>
  <li><b>Dynamic array growth</b> is covered in depth in the complexity
    chapter's amortized-analysis section — the short version:
    <code>push()</code> is amortized O(1) because the underlying buffer
    doubles instead of growing by one each time.</li>
</ul>`,
    },
    {
      id: "dsa-hashing",
      num: "B3",
      title: "Hashing",
      short: "Hashing",
      levels: ["beginner"],
      practice: [
        "ex-two-sum",
        "ex-top-k-frequent",
        "ex-longest-consecutive-sequence",
        "ex-happy-number",
        "ex-ransom-note",
        "ex-intersection-of-two-arrays",
        "ex-intersection-of-two-arrays-ii",
        "ex-first-unique-character",
        "ex-word-frequency-top-k",
        "ex-valid-anagram",
        "ex-group-anagrams",
        "ex-isomorphic-strings",
        "ex-word-pattern",
      ],
      ready: true,
      subtitle: "The single most common way an O(n²) brute force becomes O(n).",
      body: `<h3>What a hash map actually does</h3>
<p>
  A hash function turns a key into a number, and that number picks a
  "bucket" in an underlying array. Look-up doesn't search — it computes
  the bucket from the key and jumps straight there. That's why
  <code>Map</code>/<code>Set</code>/object lookups are O(1) average case:
  the cost of hashing the key doesn't grow with how many other keys are
  already stored.
</p>

<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="A key being hashed to a bucket index, then stored in that bucket">
    <g class="rough">
      <rect class="boxg" x="20" y="20" width="120" height="50" rx="8" />
      <rect class="boxy" x="220" y="20" width="120" height="50" rx="8" />
      <rect class="box" x="60" y="120" width="60" height="40" />
      <rect class="box" x="120" y="120" width="60" height="40" />
      <rect class="box" x="180" y="120" width="60" height="40" />
      <rect class="box" x="240" y="120" width="60" height="40" />
      <rect class="box" x="300" y="120" width="60" height="40" />
    </g>
    <text class="lbl" x="80" y="50" text-anchor="middle" style="font-size:15px">key: "cat"</text>
    <text class="lbl" x="280" y="50" text-anchor="middle" style="font-size:15px">hash("cat") = 2</text>
    <text class="sm" x="90" y="145" text-anchor="middle">0</text>
    <text class="sm" x="150" y="145" text-anchor="middle">1</text>
    <text class="sm" x="210" y="145" text-anchor="middle">2</text>
    <text class="sm" x="270" y="145" text-anchor="middle">3</text>
    <text class="sm" x="330" y="145" text-anchor="middle">4</text>
    <text class="sm rd" x="210" y="200" text-anchor="middle">"cat" lands here — no scanning</text>
  </svg>
  <figcaption>The hash turns "which bucket" into arithmetic instead of a search.</figcaption>
</figure>

<h3>Map/Set vs plain objects</h3>
<table>
  <tr><th></th><th>Map / Set</th><th>Plain object</th></tr>
  <tr><td>Key types</td><td>anything (objects, NaN, etc.)</td><td>strings/symbols only — numbers get coerced</td></tr>
  <tr><td>Size</td><td><code>.size</code>, O(1)</td><td><code>Object.keys(o).length</code>, O(n)</td></tr>
  <tr><td>Iteration order</td><td>insertion order, guaranteed</td><td>mostly insertion order, but integer-like keys sort first</td></tr>
  <tr><td>Accidental prototype keys</td><td>impossible</td><td><code>"toString" in {}</code> is true</td></tr>
</table>
<p class="sub">
  In interviews, default to <code>Map</code>/<code>Set</code> unless
  there's a specific reason not to — it sidesteps a whole category of
  "wait, why is this key already there" bugs.</p>

<h3>The pattern: trade space for time</h3>
<p>
  Almost every "hashing" interview question is the same trade: spend O(n)
  space to remember what you've already seen, so a second O(n) pass (or
  even the same pass) can answer "have I seen this before?" in O(1)
  instead of O(n).
</p>
<pre><code><span class="c">// Two Sum — brute force: O(n²) time, O(1) space</span>
function twoSumSlow(nums, target) {
  for (let i = 0; i < nums.length; i++) {
    for (let j = i + 1; j < nums.length; j++) {
      if (nums[i] + nums[j] === target) return [i, j];
    }
  }
}

<span class="c">// Two Sum — hashed: O(n) time, O(n) space</span>
function twoSumFast(nums, target) {
  const seen = new Map(); <span class="c">// value → index</span>
  for (let i = 0; i < nums.length; i++) {
    const need = target - nums[i];
    if (seen.has(need)) return [seen.get(need), i];
    seen.set(nums[i], i);
  }
}</code></pre>

<h3>Watch the map build up, step by step</h3>
<p><code>nums = [2, 7, 11, 15]</code>, <code>target = 9</code> — trace every iteration:</p>
<table>
  <tr><th>i</th><th>nums[i]</th><th>need = target − nums[i]</th><th>seen.has(need)?</th><th>action</th></tr>
  <tr><td>0</td><td>2</td><td>7</td><td>no — map is empty</td><td>store {2 → 0}</td></tr>
  <tr><td>1</td><td>7</td><td>2</td><td><b>yes</b> — seen.get(2) = 0</td><td>return [0, 1] ✓</td></tr>
</table>
<p class="sub">
  Notice the map is only ever <em>looked up</em> for the value we still
  need, and only ever <em>written</em> for values we've already passed.
  That single pass does the work a nested loop would need two passes
  (and O(n²) time) to do.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll trade O(n) space for a
  hash map so each lookup is O(1) instead of O(n) — that turns the O(n²)
  nested-loop version into a single O(n) pass."
</div>

<h3>Frequency counting — the other 80% of hashing questions</h3>
<pre><code>function frequency(arr) {
  const counts = new Map();
  for (const x of arr) {
    counts.set(x, (counts.get(x) || 0) + 1);
  }
  return counts;
}

<span class="c">// anagram check: same characters, same counts</span>
function isAnagram(a, b) {
  if (a.length !== b.length) return false;
  const counts = new Map();
  for (const c of a) counts.set(c, (counts.get(c) || 0) + 1);
  for (const c of b) {
    if (!counts.get(c)) return false;
    counts.set(c, counts.get(c) - 1);
  }
  return true;
}</code></pre>

<h3>Grouping — building a Map of arrays</h3>
<pre><code><span class="c">// group anagrams: same sorted letters → same bucket</span>
function groupAnagrams(words) {
  const groups = new Map();
  for (const word of words) {
    const key = [...word].sort().join("");
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(word);
  }
  return [...groups.values()];
}</code></pre>

<div class="warn">
  <span class="ttl">⚠ Hash collisions aren't your problem, but worst case is</span>
  V8's hash maps handle collisions internally, so you never write
  collision-resolution code. But a hash map's O(1) is an <em>average</em>
  case — a pathological hash function can degrade to O(n) per operation.
  You'll never need to defend against this in an interview, but "average
  case, not worst case" is the correct answer if asked.
</div>

<h3>When hashing is the wrong tool</h3>
<ul>
  <li><b>You need order</b> — a hash map doesn't sort. If the question
    wants sorted output or range queries, you likely want a sorted
    structure (or a heap) instead.</li>
  <li><b>You need the closest match, not an exact one</b> — hashing only
    answers "is this exact key present." Nearest-value questions want
    binary search on a sorted structure.</li>
  <li><b>Memory is the actual constraint</b> — if the problem explicitly
    asks for O(1) space, a hash map is disqualified by definition.</li>
</ul>`,
    },
    {
      id: "dsa-two-pointers",
      num: "B4",
      title: "Two pointers",
      short: "Two pointers",
      levels: ["beginner"],
      practice: [
        "ex-sort-colors",
        "ex-next-permutation",
        "ex-trapping-rain-water",
        "ex-container-with-most-water",
        "ex-valid-palindrome",
        "ex-longest-palindromic-substring",
        "ex-two-sum-sorted",
        "ex-three-sum",
        "ex-four-sum",
        "ex-squares-of-sorted-array",
        "ex-backspace-string-compare",
        "ex-merge-two-sorted-arrays",
      ],
      ready: true,
      subtitle: "One pass, two positions — how an O(n²) search collapses to O(n).",
      body: `<h3>The shape of the pattern</h3>
<p>
  Two pointers means walking a structure with <b>two indices instead of
  nested loops</b>. Whenever you're tempted to check every pair
  (<code>i</code>, <code>j</code>) against each other, ask: does the data
  have an order I can exploit so the pointers only ever move forward, never
  backward? If yes, two pointers turns O(n²) pair-checking into a single
  O(n) pass.
</p>

<h3>Variant 1 — opposite ends, closing inward</h3>
<p>Used on sorted arrays where you need a pair that satisfies some condition.</p>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="Two pointers starting at opposite ends of a sorted array and moving toward each other">
    <g class="rough">
      <rect class="box" x="20" y="50" width="70" height="50" />
      <rect class="box" x="90" y="50" width="70" height="50" />
      <rect class="box" x="160" y="50" width="70" height="50" />
      <rect class="box" x="230" y="50" width="70" height="50" />
      <rect class="box" x="300" y="50" width="70" height="50" />
      <rect class="box" x="370" y="50" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="80" text-anchor="middle">2</text>
    <text class="sm" x="125" y="80" text-anchor="middle">7</text>
    <text class="sm" x="195" y="80" text-anchor="middle">11</text>
    <text class="sm" x="265" y="80" text-anchor="middle">15</text>
    <text class="sm" x="335" y="80" text-anchor="middle">18</text>
    <text class="sm" x="405" y="80" text-anchor="middle">24</text>
    <text class="lbl rd" x="55" y="30" text-anchor="middle" style="font-size:16px">↓ left</text>
    <text class="lbl rd" x="405" y="30" text-anchor="middle" style="font-size:16px">right ↓</text>
    <text class="sm" x="440" y="80">→ close inward</text>
  </svg>
  <figcaption>sum too small → move left right; sum too big → move right left.</figcaption>
</figure>
<pre><code><span class="c">// Two Sum on a SORTED array — O(n) time, O(1) space</span>
function twoSumSorted(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left < right) {
    const sum = nums[left] + nums[right];
    if (sum === target) return [left, right];
    if (sum < target) left++;   <span class="c">// need bigger → drop the smaller end</span>
    else right--;               <span class="c">// need smaller → drop the bigger end</span>
  }
  return [-1, -1];
}</code></pre>
<p class="sub">
  Why this is correct, not just fast: because the array is sorted, moving
  <code>left</code> past the current value can never re-find a pair we
  already ruled out — every skipped pair genuinely can't work.
</p>

<h3>Watch it converge, step by step</h3>
<p><code>nums = [2, 7, 11, 15, 18, 24]</code>, <code>target = 22</code>:</p>
<table>
  <tr><th>step</th><th>left</th><th>right</th><th>nums[left]+nums[right]</th><th>compare to 22</th><th>move</th></tr>
  <tr><td>1</td><td>0 (2)</td><td>5 (24)</td><td>26</td><td>too big</td><td>right−−</td></tr>
  <tr><td>2</td><td>0 (2)</td><td>4 (18)</td><td>20</td><td>too small</td><td>left++</td></tr>
  <tr><td>3</td><td>1 (7)</td><td>4 (18)</td><td>25</td><td>too big</td><td>right−−</td></tr>
  <tr><td>4</td><td>1 (7)</td><td>3 (15)</td><td>22</td><td><b>match</b></td><td>return [1, 3]</td></tr>
</table>
<p class="sub">
  Six elements, but only four comparisons — each one eliminates an entire
  end of the remaining range, not just one element. That's the O(n)
  behavior: the pointers together take at most n steps total to meet.
</p>

<h3>Variant 2 — fast/slow, same direction</h3>
<p>
  Both pointers start at the same end but move at different rates (or one
  waits while the other scans). This is the shape behind removing
  duplicates in place, partitioning, and cycle detection in linked lists.
</p>
<pre><code><span class="c">// remove duplicates from a SORTED array, in place — O(n) time, O(1) space</span>
function removeDuplicates(nums) {
  if (nums.length === 0) return 0;
  let slow = 0; <span class="c">// slow = last confirmed-unique position</span>
  for (let fast = 1; fast < nums.length; fast++) {
    if (nums[fast] !== nums[slow]) {
      slow++;
      nums[slow] = nums[fast];
    }
  }
  return slow + 1; <span class="c">// count of unique elements</span>
}</code></pre>

<h3>Variant 3 — palindrome / mirror check</h3>
<pre><code>function isPalindrome(s) {
  let left = 0, right = s.length - 1;
  while (left < right) {
    if (s[left] !== s[right]) return false;
    left++;
    right--;
  }
  return true;
}</code></pre>

<div class="warn">
  <span class="ttl">⚠ Two pointers needs an exploitable order</span>
  The opposite-ends variant only works because the array is sorted — try
  it on unsorted data and it silently gives wrong answers, not an error.
  If the input isn't sorted and sorting it doesn't destroy needed
  information (like original indices), sort first — O(n log n) to enable
  an O(n) pass is still a huge win over O(n²).
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "The array's sorted, so I can
  use two pointers closing inward — each comparison eliminates one end
  entirely instead of comparing every pair, which is what gets this from
  O(n²) down to O(n)."
</div>

<h3>How to recognize it in an unseen problem</h3>
<ul>
  <li>The input is sorted (or can be sorted without losing what you need)</li>
  <li>You're looking for a pair, triplet, or a "does X exist" over combinations</li>
  <li>A brute force would be nested loops comparing indices against each other</li>
  <li>The words "sorted array," "pair," or "in-place" appear in the prompt</li>
</ul>
<p class="sub">
  Three Sum is the natural extension: sort once, then fix one index and
  run the opposite-ends two-pointer scan on the rest — O(n²) total instead
  of the O(n³) brute force, because the inner two-sum collapses from a
  nested loop to a linear scan.</p>
<h3>See it move</h3>
<p>Step through it and watch <em>why</em> a pointer moves. Every move rules out a whole block of pairs at once — that is the entire reason this beats the nested loop.</p>

<div class="demo">
  <div class="demo__bar">Two pointers — find a pair that sums to 22</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="tp-code"></div>
        <div class="loop-bar"><i id="tp-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="tp-prev" type="button">← Back</button>
          <button class="btn" id="tp-next" type="button">Next step →</button>
          <button class="btn" id="tp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="tp-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Current sum</div>
          <div id="tp-p-sum"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="tp-cells"></div></div></div>
    <p class="demo__note" id="tp-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "tp";
  var CODE = ["let lo = 0, hi = a.length - 1;","while (lo < hi) {","  const sum = a[lo] + a[hi];","  if (sum === target) return [lo, hi];","  sum < target ? lo++ : hi--;","}"];
  var STEPS = [{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"out","p":""},{"v":"11","c":"out","p":""},{"v":"15","c":"out","p":""},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":[]},"note":"Sorted array, target 22. Two pointers start at both ends."},{"cells":[{"v":"2","c":"lo","p":"lo"},{"v":"4","c":"in","p":""},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"in","p":""},{"v":"24","c":"hi","p":"hi"}],"panels":{"sum":["a[0] + a[6] = 2 + 24 = 26"]},"note":"Sum is 26. Compare it with the target 22."},{"cells":[{"v":"2","c":"lo","p":"lo"},{"v":"4","c":"in","p":""},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"hi","p":"hi"},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[0] + a[5] = 2 + 19 = 21"]},"note":"26 > 22. Only moving hi DOWN can decrease the sum, so hi retreats."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"lo","p":"lo"},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"in","p":""},{"v":"19","c":"hi","p":"hi"},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[1] + a[5] = 4 + 19 = 23"]},"note":"21 < 22. Only moving lo UP can increase the sum, so lo advances. Everything left of it is now impossible."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"lo","p":"lo"},{"v":"7","c":"in","p":""},{"v":"11","c":"in","p":""},{"v":"15","c":"hi","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[1] + a[4] = 4 + 15 = 19"]},"note":"23 > 22. Only moving hi DOWN can decrease the sum, so hi retreats."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"lo","p":"lo"},{"v":"11","c":"in","p":""},{"v":"15","c":"hi","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[2] + a[4] = 7 + 15 = 22"]},"note":"19 < 22. Only moving lo UP can increase the sum, so lo advances. Everything left of it is now impossible."},{"cells":[{"v":"2","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"7","c":"done","p":"lo"},{"v":"11","c":"out","p":""},{"v":"15","c":"done","p":"hi"},{"v":"19","c":"out","p":""},{"v":"24","c":"out","p":""}],"panels":{"sum":["a[2] + a[4] = 7 + 15 = 22"]},"note":"7 + 15 = 22. Found the pair — done in one pass, O(n)."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>
`,
    },
    {
      id: "dsa-sliding-window",
      num: "B5",
      title: "Sliding window",
      short: "Sliding window",
      levels: ["beginner"],
      practice: [
        "ex-longest-substring-no-repeat",
        "ex-minimum-window-substring",
        "ex-find-all-anagrams",
        "ex-longest-repeating-char-replacement",
        "ex-permutation-in-string",
        "ex-min-size-subarray-sum",
        "ex-fruit-into-baskets",
        "ex-subarray-product-less-than-k",
        "ex-max-consecutive-ones-iii",
        "ex-longest-subarray-abs-diff-limit",
      ],
      ready: true,
      subtitle: "Stop re-scanning the same elements — slide the window instead.",
      body: `<h3>The insight: don't recompute, adjust</h3>
<p>
  A brute-force "every contiguous subarray/substring" solution recomputes
  each window from scratch — O(n) work, done for O(n) windows, is O(n²).
  Sliding window notices that consecutive windows overlap almost entirely:
  moving from <code>[i, j]</code> to <code>[i+1, j+1]</code> only removes
  one element and adds one element. Update the running answer instead of
  rebuilding it, and the whole scan collapses to O(n).
</p>

<figure>
  <svg viewBox="0 0 640 170" class="dg" role="img" aria-label="A window of fixed size sliding one step across an array">
    <g class="rough">
      <rect class="box" x="20" y="60" width="50" height="50" />
      <rect class="box" x="70" y="60" width="50" height="50" />
      <rect class="box" x="120" y="60" width="50" height="50" />
      <rect class="box" x="170" y="60" width="50" height="50" />
      <rect class="box" x="220" y="60" width="50" height="50" />
      <rect class="box" x="270" y="60" width="50" height="50" />
      <rect class="boxg" x="70" y="55" width="150" height="60" rx="6" />
    </g>
    <text class="sm" x="45" y="90" text-anchor="middle">3</text>
    <text class="sm" x="95" y="90" text-anchor="middle">1</text>
    <text class="sm" x="145" y="90" text-anchor="middle">4</text>
    <text class="sm" x="195" y="90" text-anchor="middle">1</text>
    <text class="sm" x="245" y="90" text-anchor="middle">5</text>
    <text class="sm" x="295" y="90" text-anchor="middle">9</text>
    <text class="lbl" x="145" y="35" text-anchor="middle" style="font-size:15px">window, size 3</text>
    <text class="lbl rd" x="420" y="60" style="font-size:15px">slide right one step:</text>
    <text class="sm rd" x="420" y="85">drop nums[left], add nums[right+1]</text>
    <text class="sm rd" x="420" y="105">O(1) update, not a rescan</text>
  </svg>
  <figcaption>The window's total is maintained incrementally — never recomputed from scratch.</figcaption>
</figure>

<h3>Fixed-size window</h3>
<pre><code><span class="c">// max sum of any window of size k — O(n) time, O(1) space</span>
function maxSumWindow(nums, k) {
  let windowSum = 0;
  for (let i = 0; i < k; i++) windowSum += nums[i]; <span class="c">// build first window</span>

  let best = windowSum;
  for (let i = k; i < nums.length; i++) {
    windowSum += nums[i] - nums[i - k]; <span class="c">// add new, drop old — O(1)</span>
    best = Math.max(best, windowSum);
  }
  return best;
}</code></pre>

<h3>Variable-size window — the more common interview shape</h3>
<p>
  Here the window grows on the right and shrinks from the left based on a
  condition, instead of staying a fixed size. This is the pattern behind
  "longest substring without repeating characters," "smallest subarray
  with sum ≥ target," and most "longest/shortest X satisfying Y" questions.
</p>
<pre><code><span class="c">// longest substring with no repeated characters — O(n) time, O(min(n, alphabet)) space</span>
function longestUniqueSubstring(s) {
  const lastSeen = new Map(); <span class="c">// char → most recent index</span>
  let left = 0, best = 0;

  for (let right = 0; right < s.length; right++) {
    const c = s[right];
    if (lastSeen.has(c) && lastSeen.get(c) >= left) {
      left = lastSeen.get(c) + 1; <span class="c">// jump left past the repeat</span>
    }
    lastSeen.set(c, right);
    best = Math.max(best, right - left + 1);
  }
  return best;
}</code></pre>
<p class="sub">
  Notice <code>left</code> only ever moves forward — it never resets to 0
  and re-scans. That "each pointer visits each index at most once" property
  is <em>why</em> this is O(n) and not O(n²) despite looking like a nested
  loop conceptually.
</p>

<h3>Watch the window grow and jump, step by step</h3>
<p><code>s = "abcabcbb"</code>:</p>
<table>
  <tr><th>right</th><th>char</th><th>repeat in window?</th><th>left jumps to</th><th>window</th><th>best</th></tr>
  <tr><td>0</td><td>a</td><td>no</td><td>0</td><td>"a"</td><td>1</td></tr>
  <tr><td>1</td><td>b</td><td>no</td><td>0</td><td>"ab"</td><td>2</td></tr>
  <tr><td>2</td><td>c</td><td>no</td><td>0</td><td>"abc"</td><td>3</td></tr>
  <tr><td>3</td><td>a</td><td><b>yes</b> (index 0)</td><td>1</td><td>"bca"</td><td>3</td></tr>
  <tr><td>4</td><td>b</td><td><b>yes</b> (index 1)</td><td>2</td><td>"cab"</td><td>3</td></tr>
  <tr><td>5</td><td>c</td><td><b>yes</b> (index 2)</td><td>3</td><td>"abc"</td><td>3</td></tr>
  <tr><td>6</td><td>b</td><td><b>yes</b> (index 4)</td><td>5</td><td>"cb"</td><td>3</td></tr>
  <tr><td>7</td><td>b</td><td><b>yes</b> (index 6)</td><td>7</td><td>"b"</td><td>3</td></tr>
</table>
<p class="sub">
  <code>left</code> jumps straight to <em>one past</em> the repeat's last
  position — never one step at a time, never backward. Across all 8 steps,
  <code>left</code> moved a total of 7 positions, not 7 positions
  <em>per</em> step — that's the amortized O(n) at work.
</p>

<h3>The general variable-window template</h3>
<pre><code>function template(arr, condition) {
  let left = 0;
  let state = /* running total, count, or map */ 0;

  for (let right = 0; right < arr.length; right++) {
    <span class="c">// 1. expand: fold arr[right] into state</span>

    while (/* state violates the condition */ false) {
      <span class="c">// 2. shrink: undo arr[left] from state, then left++</span>
      left++;
    }

    <span class="c">// 3. update the answer using the current valid window [left, right]</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Why the shrink loop doesn't make this O(n²)</span>
  It looks like a loop inside a loop, but <code>left</code> only ever
  increases and can move at most n times <em>total</em> across the whole
  run — not n times per iteration of the outer loop. Add the outer loop's
  n steps and the inner loop's n total steps together (not multiply) and
  you get O(2n) = O(n). This "amortized" argument is worth being able to
  say out loud in an interview.
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll maintain a window with
  two pointers instead of recomputing each substring — the right pointer
  expands the window, the left pointer only shrinks it when the condition
  breaks, so each index is visited a constant number of times total,
  giving O(n) instead of the O(n²) brute force."
</div>


<h3>See the window move</h3>
<p>Watch <code>left</code> jump rather than crawl. That jump is what keeps the whole scan linear even though the window shrinks and grows.</p>

<div class="demo">
  <div class="demo__bar">Sliding window — longest substring without repeats</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="sw-code"></div>
        <div class="loop-bar"><i id="sw-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="sw-prev" type="button">← Back</button>
          <button class="btn" id="sw-next" type="button">Next step →</button>
          <button class="btn" id="sw-play" type="button">Play</button>
          <button class="btn btn--ghost" id="sw-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Window</div>
          <div id="sw-p-win"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Best so far</div>
          <div id="sw-p-best"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="sw-cells"></div></div></div>
    <p class="demo__note" id="sw-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "sw";
  var CODE = ["let left = 0, best = 0;","for (let right = 0; right < s.length; right++) {","  if (seen.has(s[right]) && seen.get(s[right]) >= left)","    left = seen.get(s[right]) + 1;","  seen.set(s[right], right);","  best = Math.max(best, right - left + 1);","}"];
  var STEPS = [{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":[],"best":["0"]},"note":"Find the longest substring with no repeated character in \\"abcabcbb\\"."},{"cells":[{"v":"a","c":"in","p":"L R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["a"],"best":["0"]},"note":"\\"a\\" is new to the window, so right extends it."},{"cells":[{"v":"a","c":"in","p":"L R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["a"],"best":["1"]},"note":"Window is length 1 — a new best."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["ab"],"best":["1"]},"note":"\\"b\\" is new to the window, so right extends it."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["ab"],"best":["2"]},"note":"Window is length 2 — a new best."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["2"]},"note":"\\"c\\" is new to the window, so right extends it."},{"cells":[{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"Window is length 3 — a new best."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"in","p":"L"},{"v":"c","c":"in","p":""},{"v":"a","c":"in","p":"R"},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["bca"],"best":["3"]},"note":"\\"a\\" is already inside the window. left jumps to 1 — past the old \\"a\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"in","p":"L"},{"v":"a","c":"in","p":""},{"v":"b","c":"in","p":"R"},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["cab"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 2 — past the old \\"b\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"in","p":"L"},{"v":"b","c":"in","p":""},{"v":"c","c":"in","p":"R"},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"\\"c\\" is already inside the window. left jumps to 3 — past the old \\"c\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"in","p":"L"},{"v":"b","c":"in","p":"R"},{"v":"b","c":"out","p":""}],"panels":{"win":["cb"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 5 — past the old \\"b\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"in","p":"L R"}],"panels":{"win":["b"],"best":["3"]},"note":"\\"b\\" is already inside the window. left jumps to 7 — past the old \\"b\\" — instead of stepping one at a time."},{"cells":[{"v":"a","c":"done","p":""},{"v":"b","c":"done","p":""},{"v":"c","c":"done","p":""},{"v":"a","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"c","c":"out","p":""},{"v":"b","c":"out","p":""},{"v":"b","c":"out","p":""}],"panels":{"win":["abc"],"best":["3"]},"note":"Answer: 3. Each index was visited at most twice — O(n), not O(n²)."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The words "contiguous subarray" or "substring" (not subsequence)</li>
  <li>"Longest," "shortest," "maximum," or "minimum" over a contiguous range</li>
  <li>A brute force would check every <code>[i, j]</code> pair — O(n²) or worse</li>
  <li>The condition can be checked/updated incrementally as the window changes</li>
</ul>`,
    },
    {
      id: "dsa-binary-search",
      num: "B6",
      title: "Binary search",
      short: "Binary search",
      levels: ["beginner"],
      practice: [
        "ex-binary-search-classic",
        "ex-search-insert-position",
        "ex-search-2d-matrix",
        "ex-first-last-position",
        "ex-search-rotated-sorted-array",
        "ex-search-rotated-sorted-array-ii",
        "ex-find-min-rotated",
        "ex-find-peak-element",
        "ex-koko-eating-bananas",
        "ex-ship-packages-in-days",
        "ex-split-array-largest-sum",
        "ex-median-two-sorted-arrays",
        "ex-integer-sqrt",
        "ex-valid-perfect-square",
        "ex-find-duplicate-number",
      ],
      ready: true,
      subtitle: "Halving the search space is the single highest-leverage trick in DSA.",
      body: `<h3>The core idea</h3>
<p>
  Binary search needs exactly one property from the search space: at every
  point, you can tell which half the answer is in without checking it
  directly. On a sorted array that's obvious — but the same idea applies
  to any "monotonic" space, which is why binary search shows up far more
  often than "is this array sorted" questions alone would suggest.
</p>

<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="Binary search halving the search space by comparing the middle element">
    <g class="rough">
      <rect class="box" x="20" y="30" width="40" height="40" />
      <rect class="box" x="60" y="30" width="40" height="40" />
      <rect class="box" x="100" y="30" width="40" height="40" />
      <rect class="boxy" x="140" y="30" width="40" height="40" />
      <rect class="box" x="180" y="30" width="40" height="40" />
      <rect class="box" x="220" y="30" width="40" height="40" />
      <rect class="box" x="260" y="30" width="40" height="40" />
    </g>
    <text class="sm" x="40" y="55" text-anchor="middle">1</text>
    <text class="sm" x="80" y="55" text-anchor="middle">3</text>
    <text class="sm" x="120" y="55" text-anchor="middle">6</text>
    <text class="sm" x="160" y="55" text-anchor="middle">9</text>
    <text class="sm" x="200" y="55" text-anchor="middle">12</text>
    <text class="sm" x="240" y="55" text-anchor="middle">15</text>
    <text class="sm" x="280" y="55" text-anchor="middle">20</text>
    <text class="lbl rd" x="160" y="14" text-anchor="middle" style="font-size:14px">mid</text>
    <text class="sm" x="60" y="100">target = 15 &gt; 9 → whole left half (1,3,6,9) is eliminated, no need to check any of it</text>
    <text class="lbl" x="20" y="140" style="font-size:15px">n → n/2 → n/4 → n/8 → … → 1</text>
    <text class="sm" x="20" y="165">log₂(n) halvings until one element remains — that's the O(log n)</text>
  </svg>
  <figcaption>Each comparison eliminates half the remaining space, not just one element.</figcaption>
</figure>

<h3>The template that avoids off-by-one bugs</h3>
<pre><code>function binarySearch(sorted, target) {
  let lo = 0, hi = sorted.length - 1;
  while (lo <= hi) {              <span class="c">// note: <=, not <</span>
    const mid = lo + Math.floor((hi - lo) / 2); <span class="c">// avoids overflow, same as (lo+hi)>>1 in JS</span>
    if (sorted[mid] === target) return mid;
    if (sorted[mid] < target) lo = mid + 1;
    else hi = mid - 1;
  }
  return -1; <span class="c">// not found</span>
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The two bugs that show up every time</span>
  <ul style="margin:6px 0 0">
    <li><code>lo &lt;= hi</code> vs <code>lo &lt; hi</code> — get this wrong
      and you'll either miss the last candidate or loop forever.</li>
    <li><code>mid = (lo + hi) / 2</code> can integer-overflow in other
      languages (not JS, but say it right anyway) — the
      <code>lo + (hi - lo) / 2</code> form is the safe habit.</li>
  </ul>
</div>

<h3>Watch the search space halve, step by step</h3>
<p><code>sorted = [1, 3, 6, 9, 12, 15, 20]</code>, <code>target = 15</code>:</p>
<table>
  <tr><th>step</th><th>lo</th><th>hi</th><th>mid (value)</th><th>compare</th><th>action</th></tr>
  <tr><td>1</td><td>0</td><td>6</td><td>3 (9)</td><td>9 &lt; 15</td><td>lo = 4</td></tr>
  <tr><td>2</td><td>4</td><td>6</td><td>5 (15)</td><td><b>match</b></td><td>return 5</td></tr>
</table>
<p class="sub">
  Seven elements, but only two comparisons — <code>log₂(7) ≈ 2.8</code>,
  rounded up to 3 worst-case steps. Compare that to a linear scan, which
  could need all 7. At n = 1,000,000, binary search needs about 20 steps;
  a linear scan could need a million.
</p>

<h3>Binary search on the answer, not the array</h3>
<p>
  This is the pattern that separates candidates who've memorized one
  template from candidates who understand the idea. Whenever a problem
  asks for the <b>minimum value that satisfies a condition</b> (or
  maximum), and "does value X work?" gets easier to check as X changes
  monotonically, you can binary search over the range of possible answers
  instead of the input array.
</p>
<pre><code><span class="c">// minimum "speed" to eat all bananas within h hours — classic answer-space search</span>
function minEatingSpeed(piles, h) {
  function hoursNeeded(speed) {
    let hours = 0;
    for (const pile of piles) hours += Math.ceil(pile / speed);
    return hours;
  }

  let lo = 1, hi = Math.max(...piles);
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (hoursNeeded(mid) <= h) hi = mid;   <span class="c">// mid works — answer could be smaller</span>
    else lo = mid + 1;                     <span class="c">// mid too slow — need bigger speed</span>
  }
  return lo;
}</code></pre>
<p class="sub">
  The array here isn't even sorted — what's monotonic is the
  <em>relationship between speed and hours needed</em>: faster speed always
  means fewer or equal hours. That monotonic relationship is the real
  requirement for binary search, not "is the input array sorted."
</p>

<h3>Finding a boundary (first/last occurrence)</h3>
<pre><code><span class="c">// leftmost index where nums[i] >= target — the building block for
   "find first occurrence" and most boundary-search variants</span>
function lowerBound(nums, target) {
  let lo = 0, hi = nums.length; <span class="c">// note: hi = length, not length-1, here</span>
  while (lo < hi) {
    const mid = lo + Math.floor((hi - lo) / 2);
    if (nums[mid] < target) lo = mid + 1;
    else hi = mid;
  }
  return lo;
}</code></pre>

<div class="say">
  <span class="ttl">Say it like this →</span> "Even though the array isn't
  sorted, the answer space is monotonic — if speed X works, every speed
  faster than X also works — so I can binary search over the range of
  possible speeds instead of scanning them all."
</div>


<h3>See the range collapse</h3>
<p>Watch the live range collapse. Ten candidates become one in four comparisons — and the count of comparisons is just how many times you can halve the array.</p>

<div class="demo">
  <div class="demo__bar">Binary search — halving the search space</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="bs-code"></div>
        <div class="loop-bar"><i id="bs-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="bs-prev" type="button">← Back</button>
          <button class="btn" id="bs-next" type="button">Next step →</button>
          <button class="btn" id="bs-play" type="button">Play</button>
          <button class="btn btn--ghost" id="bs-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Live range</div>
          <div id="bs-p-range"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="bs-cells"></div></div></div>
    <p class="demo__note" id="bs-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "bs";
  var CODE = ["let lo = 0, hi = a.length - 1;","while (lo <= hi) {","  const mid = Math.floor((lo + hi) / 2);","  if (a[mid] === target) return mid;","  a[mid] < target ? (lo = mid + 1) : (hi = mid - 1);","}","return -1;"];
  var STEPS = [{"cells":[{"v":"1","c":"in","p":""},{"v":"4","c":"in","p":""},{"v":"9","c":"in","p":""},{"v":"13","c":"in","p":""},{"v":"20","c":"in","p":""},{"v":"27","c":"in","p":""},{"v":"31","c":"in","p":""},{"v":"38","c":"in","p":""},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":""}],"panels":{"range":["lo=0 hi=9","10 candidates left"]},"note":"Sorted array, looking for 31. Every step throws away half the remaining range."},{"cells":[{"v":"1","c":"in","p":"lo"},{"v":"4","c":"in","p":""},{"v":"9","c":"in","p":""},{"v":"13","c":"in","p":""},{"v":"20","c":"mid","p":"mid"},{"v":"27","c":"in","p":""},{"v":"31","c":"in","p":""},{"v":"38","c":"in","p":""},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":"hi"}],"panels":{"range":["lo=0 hi=9","10 candidates left"]},"note":"mid = 4, a[mid] = 20."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"mid","p":"mid"},{"v":"27","c":"in","p":"lo"},{"v":"31","c":"in","p":""},{"v":"38","c":"in","p":""},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":"hi"}],"panels":{"range":["lo=5 hi=9","5 candidates left"]},"note":"20 < 31, so the answer is to the RIGHT. lo becomes 5 — the left half is gone."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"in","p":"lo"},{"v":"31","c":"in","p":""},{"v":"38","c":"mid","p":"mid"},{"v":"45","c":"in","p":""},{"v":"50","c":"in","p":"hi"}],"panels":{"range":["lo=5 hi=9","5 candidates left"]},"note":"mid = 7, a[mid] = 38."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"in","p":"lo"},{"v":"31","c":"in","p":"hi"},{"v":"38","c":"mid","p":"mid"},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=5 hi=6","2 candidates left"]},"note":"38 > 31, so the answer is to the LEFT. hi becomes 6."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"mid","p":"mid"},{"v":"31","c":"in","p":"hi"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=5 hi=6","2 candidates left"]},"note":"mid = 5, a[mid] = 27."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"mid","p":"mid"},{"v":"31","c":"in","p":"lo"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=6 hi=6","1 candidates left"]},"note":"27 < 31, so the answer is to the RIGHT. lo becomes 6 — the left half is gone."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"out","p":""},{"v":"31","c":"mid","p":"mid"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=6 hi=6","1 candidates left"]},"note":"mid = 6, a[mid] = 31."},{"cells":[{"v":"1","c":"out","p":""},{"v":"4","c":"out","p":""},{"v":"9","c":"out","p":""},{"v":"13","c":"out","p":""},{"v":"20","c":"out","p":""},{"v":"27","c":"out","p":""},{"v":"31","c":"done","p":"mid"},{"v":"38","c":"out","p":""},{"v":"45","c":"out","p":""},{"v":"50","c":"out","p":""}],"panels":{"range":["lo=6 hi=6","1 candidates left"]},"note":"a[6] === 31. Found it after 4 comparisons instead of up to 10."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Data is sorted, or the answer space is monotonic ("if X works, does X+1 also work?")</li>
  <li>The prompt says "minimum/maximum value such that…"</li>
  <li>A brute force would try every candidate linearly — O(n) or O(n·check)</li>
  <li>You can write a fast "does this candidate work?" check — that check
    becomes the comparison inside the binary search</li>
</ul>`,
    },
    {
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
    },
    {
      id: "dsa-stacks-queues",
      num: "B8",
      title: "Stacks & queues",
      short: "Stacks & queues",
      levels: ["beginner"],
      practice: [
        "ex-min-stack",
        "ex-queue-using-stacks",
        "ex-stack-using-queues",
        "ex-asteroid-collision",
        "ex-evaluate-rpn",
        "ex-basic-calculator",
        "ex-basic-calculator-ii",
        "ex-valid-parentheses",
        "ex-decode-string",
      ],
      ready: true,
      subtitle: "Two rules for order, and half of interview problems secretly need one of them.",
      body: `<h3>The only thing that actually differs between them</h3>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="A stack removing from the top (LIFO) versus a queue removing from the front (FIFO)">
    <g class="rough">
      <rect class="boxy" x="40" y="30" width="180" height="140" rx="8" />
      <rect class="box" x="60" y="130" width="140" height="30" />
      <rect class="box" x="60" y="95" width="140" height="30" />
      <rect class="box" x="60" y="60" width="140" height="30" />
      <rect class="boxg" x="420" y="80" width="180" height="40" rx="8" />
    </g>
    <text class="sm" x="130" y="80" text-anchor="middle">3 (top)</text>
    <text class="sm" x="130" y="115" text-anchor="middle">2</text>
    <text class="sm" x="130" y="150" text-anchor="middle">1</text>
    <text class="lbl" x="60" y="188" style="font-size:15px">Stack — LIFO: push/pop the top</text>
    <text class="sm" x="450" y="60">1 → out</text>
    <text class="sm" x="450" y="104" text-anchor="middle">1  2  3</text>
    <text class="sm" x="580" y="60">← 4 in</text>
    <text class="lbl" x="20" y="210" style="font-size:15px">Queue — FIFO: enqueue at back, dequeue from front</text>
  </svg>
  <figcaption>Same idea (add/remove one at a time) — opposite rule for which end you remove from.</figcaption>
</figure>
<table>
  <tr><th></th><th>Stack (LIFO)</th><th>Queue (FIFO)</th></tr>
  <tr><td>Add</td><td><code>push()</code> — O(1)</td><td><code>enqueue</code> at the back — O(1)</td></tr>
  <tr><td>Remove</td><td><code>pop()</code> — O(1), removes most recent</td><td><code>dequeue</code> from front — O(1), removes oldest</td></tr>
  <tr><td>Real-world model</td><td>a stack of plates</td><td>a checkout line</td></tr>
  <tr><td>Classic use</td><td>undo, call stack, backtracking, matching pairs</td><td>BFS, task scheduling, rate limiting</td></tr>
</table>

<h3>Stacks in JS — just use an array</h3>
<pre><code>const stack = [];
stack.push(1);
stack.push(2);
stack.pop();      <span class="c">// 2 — removes from the END, O(1)</span>
stack[stack.length - 1]; <span class="c">// peek without removing</span></code></pre>

<div class="warn">
  <span class="ttl">⚠ Don't build a queue out of <code>array.shift()</code></span>
  <code>shift()</code> removes from the <em>front</em>, which means every
  remaining element shifts down — O(n) per dequeue, so an n-step queue
  simulation silently becomes O(n²). For a real queue, either push/pop
  from the array's end and treat index 0 as "front" with a separate
  pointer, or use two stacks (below).
</div>
<pre><code><span class="c">// an O(1)-amortized queue using two stacks</span>
class Queue {
  #inStack = [];
  #outStack = [];

  enqueue(x) { this.#inStack.push(x); }

  dequeue() {
    if (this.#outStack.length === 0) {
      while (this.#inStack.length) {
        this.#outStack.push(this.#inStack.pop());
      }
    }
    return this.#outStack.pop();
  }
}</code></pre>
<p class="sub">
  Each element gets moved from <code>inStack</code> to
  <code>outStack</code> at most once ever — so across n operations the
  total work is O(n), even though a single dequeue can occasionally cost
  O(n). That's the "amortized O(1)" argument, same shape as
  <code>array.push()</code>'s resizing.
</p>

<h3>The pattern stacks solve: matching and undoing</h3>
<pre><code><span class="c">// valid parentheses — the canonical stack interview question</span>
function isValid(s) {
  const pairs = { ")": "(", "]": "[", "}": "{" };
  const stack = [];
  for (const c of s) {
    if (c === "(" || c === "[" || c === "{") {
      stack.push(c);
    } else {
      if (stack.pop() !== pairs[c]) return false;
    }
  }
  return stack.length === 0;
}</code></pre>

<h3>Watch the stack fill and drain, step by step</h3>
<p><code>s = "{[()]}"</code>:</p>
<table>
  <tr><th>char</th><th>type</th><th>action</th><th>stack after</th></tr>
  <tr><td>{</td><td>open</td><td>push</td><td>[ { ]</td></tr>
  <tr><td>[</td><td>open</td><td>push</td><td>[ {, [ ]</td></tr>
  <tr><td>(</td><td>open</td><td>push</td><td>[ {, [, ( ]</td></tr>
  <tr><td>)</td><td>close</td><td>pop, expect "(" — got "(" ✓</td><td>[ {, [ ]</td></tr>
  <tr><td>]</td><td>close</td><td>pop, expect "[" — got "[" ✓</td><td>[ { ]</td></tr>
  <tr><td>}</td><td>close</td><td>pop, expect "{" — got "{" ✓</td><td>[ ] — empty</td></tr>
</table>
<p class="sub">
  Stack empty at the end → valid. If any close bracket ever popped the
  <em>wrong</em> open bracket, or the stack ran out of elements to pop, or
  the stack still had leftover opens at the end — any of those means
  invalid. All three failure modes are just as common in interview test
  cases as the happy path, so trace through them mentally too.
</p>

<p class="sub">
  The tell: whenever a problem needs "the most recent unmatched thing" —
  an open bracket, an undo history, the calling function to return to — a
  stack is the structure that naturally tracks it, because LIFO
  <em>is</em> "most recent first."
</p>

<h3>Min-stack — the classic "track extra state per level" question</h3>
<p>
  A regular stack can't answer "what's the minimum value currently in me"
  in better than O(n) — you'd have to scan everything. The fix: keep a
  <em>second</em> stack that tracks the running minimum at each level, so
  it shrinks in lockstep with the main stack.
</p>
<pre><code>class MinStack {
  #stack = [];
  #minStack = []; <span class="c">// minStack[i] = the min among stack[0..i]</span>

  push(x) {
    this.#stack.push(x);
    const currentMin = this.#minStack.length
      ? Math.min(x, this.#minStack[this.#minStack.length - 1])
      : x;
    this.#minStack.push(currentMin);
  }

  pop() {
    this.#minStack.pop();
    return this.#stack.pop();
  }

  getMin() {
    return this.#minStack[this.#minStack.length - 1]; <span class="c">// O(1)</span>
  }
}</code></pre>
<table>
  <tr><th>operation</th><th>stack</th><th>minStack</th><th>getMin()</th></tr>
  <tr><td>push(5)</td><td>[5]</td><td>[5]</td><td>5</td></tr>
  <tr><td>push(2)</td><td>[5, 2]</td><td>[5, 2]</td><td>2</td></tr>
  <tr><td>push(7)</td><td>[5, 2, 7]</td><td>[5, 2, 2]</td><td>2</td></tr>
  <tr><td>pop()</td><td>[5, 2]</td><td>[5, 2]</td><td>2</td></tr>
  <tr><td>pop()</td><td>[5]</td><td>[5]</td><td>5</td></tr>
</table>
<p class="sub">
  <code>minStack</code> pops in lockstep with <code>stack</code>, so it
  never has stale data — the minimum "at this depth" is always exactly
  <code>minStack</code>'s top. This "shadow stack that mirrors the main
  one, tracking one extra fact" idea generalizes to max, running sum, and
  similar per-level queries.
</p>

<h3>Evaluating expressions — the other classic stack application</h3>
<p>
  Postfix (Reverse Polish) notation — <code>"3 4 +"</code> instead of
  <code>"3 + 4"</code> — needs no parentheses and no operator precedence
  rules, because a stack evaluates it directly: push numbers, and when you
  hit an operator, pop two operands, apply it, push the result back.
</p>
<pre><code>function evalRPN(tokens) {
  const stack = [];
  const ops = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => Math.trunc(a / b),
  };
  for (const token of tokens) {
    if (token in ops) {
      const b = stack.pop();
      const a = stack.pop();
      stack.push(ops[token](a, b)); <span class="c">// order matters for - and /</span>
    } else {
      stack.push(Number(token));
    }
  }
  return stack.pop();
}
<span class="c">// evalRPN(["3","4","+","2","*"]) → (3+4)*2 → 14</span></code></pre>

<h3>Deques — a queue that can push/pop from both ends</h3>
<p>
  A <b>deque</b> (double-ended queue) supports O(1) add/remove at
  <em>both</em> the front and back. It's the structure behind the
  advanced "sliding window maximum" pattern (kept as a monotonic deque of
  candidate maximums) and behind efficient BFS variants that need to push
  to the front sometimes (0-1 BFS). In JS there's no built-in deque —
  people either accept an array's O(n) front operations at small scale, or
  reach for a small class backed by two stacks (same two-stack trick as
  the queue above, extended to push at both ends) or a circular buffer.
</p>

<h3>Circular queue — a fixed-size ring buffer</h3>
<figure>
  <svg viewBox="0 0 400 260" class="dg" role="img" aria-label="A circular queue as a ring of fixed slots, with front and rear pointers wrapping back to the start once they reach the end">
    <g class="rough">
      <circle class="box" cx="200" cy="130" r="95" />
    </g>
    <text class="sm" x="200" y="45" text-anchor="middle">0</text>
    <text class="sm" x="280" y="80" text-anchor="middle">1</text>
    <text class="sm" x="280" y="185" text-anchor="middle">2</text>
    <text class="sm" x="200" y="220" text-anchor="middle">3</text>
    <text class="sm" x="120" y="185" text-anchor="middle">4</text>
    <text class="sm" x="120" y="80" text-anchor="middle">5</text>
    <text class="lbl gr" x="200" y="70" text-anchor="middle" style="font-size:13px">front</text>
    <text class="lbl rd" x="200" y="200" text-anchor="middle" style="font-size:13px">rear</text>
    <text class="sm" x="200" y="255" text-anchor="middle">rear+1 wraps back to slot 0 — no shifting, ever</text>
  </svg>
  <figcaption>Fixed-size array + two pointers that wrap with modulo — O(1) enqueue/dequeue with zero shifting and zero resizing.</figcaption>
</figure>
<pre><code>class CircularQueue {
  #data; #front = 0; #size = 0;
  constructor(capacity) { this.#data = new Array(capacity); }

  enqueue(x) {
    if (this.#size === this.#data.length) throw new Error("full");
    const rear = (this.#front + this.#size) % this.#data.length;
    this.#data[rear] = x;
    this.#size++;
  }

  dequeue() {
    if (this.#size === 0) throw new Error("empty");
    const x = this.#data[this.#front];
    this.#front = (this.#front + 1) % this.#data.length;
    this.#size--;
    return x;
  }
}</code></pre>
<p class="sub">
  This is what a production task queue or a ring buffer for streaming
  data actually looks like — fixed memory, no allocation churn, and the
  modulo (<code>%</code>) is what makes "wrap back to the start" free.
</p>

<h3>The pattern queues solve: process in the order things arrived</h3>
<p>
  Queues are the backbone of breadth-first search (its own chapter later):
  visit the closest things first, which requires processing in the exact
  order they were discovered — FIFO, not LIFO.
</p>
<pre><code><span class="c">// level-order traversal shape — the queue IS the "current frontier"</span>
function bfsShape(start, getNeighbors) {
  const queue = [start];
  const visited = new Set([start]);
  while (queue.length) {
    const node = queue.shift(); <span class="c">// front — fine at small scale; use a real
                                    queue/deque for large inputs, per the warning above</span>
    for (const next of getNeighbors(node)) {
      if (!visited.has(next)) {
        visited.add(next);
        queue.push(next);
      }
    }
  }
}</code></pre>

<div class="say">
  <span class="ttl">Say it like this →</span> "I need to always process the
  most recently opened thing first, so a stack's LIFO order matches the
  problem directly — I don't need to search for it, the last element
  pushed is always the right one to check."
</div>

<h3>Recognizing which one you need</h3>
<ul>
  <li><b>Stack</b>: matching pairs, undo/redo, "closest unmatched," depth-first exploration, evaluating expressions</li>
  <li><b>Queue</b>: breadth-first exploration, "process in arrival order," task scheduling</li>
  <li><b>Deque</b>: need to add/remove at both ends — sliding-window maximum, 0-1 BFS</li>
  <li><b>Circular queue</b>: fixed-capacity buffering — rate limiters, streaming windows, producer/consumer queues</li>
  <li><b>Min-stack (or max-stack)</b>: "track the running min/max as things get pushed/popped"</li>
  <li>If a problem says "next greater/smaller element," that's usually a <em>monotonic</em> stack — covered in the advanced tier</li>
</ul>`,
    },
    {
      id: "dsa-linked-lists",
      num: "B9",
      title: "Linked lists",
      short: "Linked lists",
      levels: ["beginner"],
      practice: [
        "ex-reverse-linked-list",
        "ex-merge-two-sorted-lists",
        "ex-linked-list-has-cycle",
        "ex-linked-list-cycle-start",
        "ex-middle-of-linked-list",
        "ex-remove-nth-from-end",
        "ex-palindrome-linked-list",
        "ex-intersection-of-two-lists",
        "ex-add-two-numbers-linked-list",
        "ex-merge-k-sorted-lists",
        "ex-copy-list-with-random-pointer",
        "ex-reorder-list",
        "ex-swap-nodes-in-pairs",
        "ex-reverse-nodes-in-k-group",
        "ex-rotate-list",
        "ex-partition-list",
        "ex-remove-duplicates-sorted-list",
        "ex-delete-node-in-linked-list",
        "ex-sort-linked-list",
        "ex-flatten-multilevel-doubly-list",
      ],
      ready: true,
      subtitle: "No index math, no shifting cost — the tradeoff array questions can't make.",
      body: `<h3>What you're giving up, and what you get for it</h3>
<figure>
  <svg viewBox="0 0 640 140" class="dg" role="img" aria-label="A singly linked list, each node holding a value and a pointer to the next node">
    <g class="rough">
      <rect class="box" x="20" y="40" width="90" height="50" />
      <rect class="box" x="170" y="40" width="90" height="50" />
      <rect class="box" x="320" y="40" width="90" height="50" />
      <rect class="boxr" x="470" y="40" width="90" height="50" />
    </g>
    <text class="sm" x="65" y="70" text-anchor="middle">5 | ●</text>
    <text class="sm" x="215" y="70" text-anchor="middle">3 | ●</text>
    <text class="sm" x="365" y="70" text-anchor="middle">9 | ●</text>
    <text class="sm rd" x="515" y="70" text-anchor="middle">null</text>
    <path d="M110 65 L170 65" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow)"/>
    <path d="M260 65 L320 65" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow)"/>
    <path d="M410 65 L470 65" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow)"/>
    <defs>
      <marker id="dgarrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="20" y="120" style="font-size:14px">head →</text>
  </svg>
  <figcaption>Each node only knows its own value and where the next one lives — no shared block of memory.</figcaption>
</figure>
<table>
  <tr><th>Operation</th><th>Array</th><th>Linked list</th></tr>
  <tr><td>Access by index</td><td>O(1)</td><td>O(n) — must walk from head</td></tr>
  <tr><td>Insert/delete at the front</td><td>O(n) — shifts everything</td><td>O(1) — just repoint</td></tr>
  <tr><td>Insert/delete at a known node</td><td>O(n)</td><td>O(1)</td></tr>
  <tr><td>Search by value</td><td>O(n)</td><td>O(n)</td></tr>
  <tr><td>Memory layout</td><td>contiguous</td><td>scattered, +overhead per node for the pointer</td></tr>
</table>

<h3>Doubly linked lists — pay more memory, get backward traversal free</h3>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="A doubly linked list where each node holds pointers to both the next and previous nodes">
    <g class="rough">
      <rect class="box" x="40" y="45" width="110" height="50" />
      <rect class="box" x="230" y="45" width="110" height="50" />
      <rect class="box" x="420" y="45" width="110" height="50" />
    </g>
    <text class="sm" x="95" y="75" text-anchor="middle">prev|5|next</text>
    <text class="sm" x="285" y="75" text-anchor="middle">prev|3|next</text>
    <text class="sm" x="475" y="75" text-anchor="middle">prev|9|next</text>
    <path d="M150 60 L230 60" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <path d="M230 82 L150 82" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <path d="M340 60 L420 60" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <path d="M420 82 L340 82" stroke="currentColor" fill="none" stroke-width="2" marker-end="url(#dgarrow2)"/>
    <defs>
      <marker id="dgarrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="40" y="130" style="font-size:14px">every node points both ways — walk forward OR backward, both O(1) per step</text>
  </svg>
  <figcaption>The classic tradeoff: extra pointer per node (more memory) buys O(1) removal of a known node without needing its predecessor tracked separately, and O(1) backward walks.</figcaption>
</figure>
<pre><code>class DoublyListNode {
  constructor(val, prev = null, next = null) {
    this.val = val;
    this.prev = prev;
    this.next = next;
  }
}

<span class="c">// removing a known node is O(1) — no need to walk to find its predecessor</span>
function removeNode(node) {
  if (node.prev) node.prev.next = node.next;
  if (node.next) node.next.prev = node.prev;
}</code></pre>
<p class="sub">
  In a <em>singly</em> linked list, deleting a known node still requires
  its predecessor (to repoint <code>.next</code>) — and finding the
  predecessor means walking from the head, O(n). A doubly linked list
  already has <code>.prev</code> sitting right there, which is exactly
  why real-world LRU caches (advanced tier) are almost always built on
  one: O(1) move-to-front and O(1) eviction of a known node.
</p>

<h3>The node and the walk</h3>
<pre><code>class ListNode {
  constructor(val, next = null) {
    this.val = val;
    this.next = next;
  }
}

function traverse(head) {
  let node = head;
  while (node !== null) {
    console.log(node.val);
    node = node.next; <span class="c">// the ENTIRE reason lists are O(n) to access by index</span>
  }
}</code></pre>

<h3>Reversal — the pattern that trips people up live</h3>
<pre><code>function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;  <span class="c">// save before you overwrite it</span>
    curr.next = prev;        <span class="c">// flip the pointer</span>
    prev = curr;              <span class="c">// advance both</span>
    curr = next;
  }
  return prev; <span class="c">// prev is the new head</span>
}</code></pre>

<h3>Watch the pointers move, step by step</h3>
<p>List: <code>1 → 2 → 3 → null</code></p>
<table>
  <tr><th>step</th><th>prev</th><th>curr</th><th>next (saved)</th><th>after curr.next = prev</th></tr>
  <tr><td>start</td><td>null</td><td>1</td><td>—</td><td>1 → 2 → 3 → null (unchanged)</td></tr>
  <tr><td>1</td><td>null</td><td>1</td><td>2</td><td>1 → null &nbsp;&nbsp; (2 → 3 → null, separate)</td></tr>
  <tr><td>— advance —</td><td>1</td><td>2</td><td>—</td><td>prev=1, curr=2</td></tr>
  <tr><td>2</td><td>1</td><td>2</td><td>3</td><td>2 → 1 → null &nbsp;&nbsp; (3 → null, separate)</td></tr>
  <tr><td>— advance —</td><td>2</td><td>3</td><td>—</td><td>prev=2, curr=3</td></tr>
  <tr><td>3</td><td>2</td><td>3</td><td>null</td><td>3 → 2 → 1 → null</td></tr>
  <tr><td>— advance —</td><td>3</td><td>null</td><td>—</td><td>loop ends, return prev = 3</td></tr>
</table>
<p class="sub">
  The list is genuinely broken into two disconnected pieces mid-flip at
  every step — that's expected, not a bug. It only becomes one connected
  list again at the very end, once every node's <code>.next</code> has
  been repointed backward.
</p>

<div class="warn">
  <span class="ttl">⚠ The #1 linked-list bug: losing the rest of the list</span>
  If you write <code>curr.next = prev</code> before saving
  <code>curr.next</code> into a temporary variable, you've just
  overwritten your only pointer to the rest of the list — everything after
  <code>curr</code> is now unreachable. Save <code>next</code> first,
  every time, no exceptions.
</div>

<h3>Fast/slow pointers — find the middle in one pass</h3>
<pre><code>function findMiddle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;      <span class="c">// moves 1 step</span>
    fast = fast.next.next; <span class="c">// moves 2 steps</span>
  }
  return slow; <span class="c">// when fast hits the end, slow is at the middle</span>
}</code></pre>
<p class="sub">
  This is the same fast/slow idea from the two-pointers chapter, adapted
  to a structure with no indices — you can't do
  <code>arr[Math.floor(arr.length/2)]</code> here, so the two-speed walk
  is how you find the middle without a second pass to count length first.
</p>

<h3>Cycle detection — Floyd's algorithm</h3>
<pre><code>function hasCycle(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) return true; <span class="c">// they lapped each other</span>
  }
  return false; <span class="c">// fast hit null — no cycle</span>
}</code></pre>
<p class="sub">
  If there's a cycle, the fast pointer (moving 2x speed) is guaranteed to
  eventually land on the same node as the slow pointer — think of two
  runners on a circular track at different speeds, the faster one always
  laps the slower one. If there's no cycle, fast simply reaches
  <code>null</code> first.
</p>

<h3>Finding WHERE the cycle starts — Floyd's phase two</h3>
<p>
  Detecting a cycle only answers yes/no. The harder follow-up — "return
  the node where the cycle begins" — has a genuinely elegant second phase:
  once slow and fast meet, reset one pointer to the head and advance
  <em>both</em> remaining pointers one step at a time. Where they meet
  again is the cycle's start.
</p>
<pre><code>function detectCycleStart(head) {
  let slow = head, fast = head;
  while (fast !== null && fast.next !== null) {
    slow = slow.next;
    fast = fast.next.next;
    if (slow === fast) {
      let ptr = head;
      while (ptr !== slow) { <span class="c">// phase two — same speed now</span>
        ptr = ptr.next;
        slow = slow.next;
      }
      return ptr; <span class="c">// the cycle's entry node</span>
    }
  }
  return null; <span class="c">// no cycle</span>
}</code></pre>
<p class="sub">
  Why this works comes down to the math: if the distance from head to the
  cycle's start is <code>a</code>, and slow/fast meet <code>b</code> steps
  into the cycle, it can be shown that <code>a</code> equals the remaining
  distance around the cycle back to the start from the meeting point —
  which is exactly why walking both pointers at equal speed from those two
  starting points lands them on the same node. You don't need to re-derive
  this live; knowing the two-phase shape and being able to state the
  result is enough.
</p>

<h3>Merging two sorted lists — the dummy node in action</h3>
<pre><code>function mergeTwoLists(l1, l2) {
  const dummy = new ListNode(0);
  let tail = dummy;

  while (l1 !== null && l2 !== null) {
    if (l1.val <= l2.val) {
      tail.next = l1;
      l1 = l1.next;
    } else {
      tail.next = l2;
      l2 = l2.next;
    }
    tail = tail.next;
  }
  tail.next = l1 !== null ? l1 : l2; <span class="c">// attach whatever's left</span>
  return dummy.next;
}</code></pre>
<table>
  <tr><th>step</th><th>compare</th><th>tail.next =</th><th>merged so far</th></tr>
  <tr><td>1</td><td>l1=1, l2=2</td><td>1</td><td>1</td></tr>
  <tr><td>2</td><td>l1=3, l2=2</td><td>2</td><td>1 → 2</td></tr>
  <tr><td>3</td><td>l1=3, l2=4</td><td>3</td><td>1 → 2 → 3</td></tr>
  <tr><td>4</td><td>l1=null, l2=4</td><td>attach remaining l2</td><td>1 → 2 → 3 → 4</td></tr>
</table>
<p class="sub">
  This is the exact <code>merge()</code> step from merge sort (the sorting
  chapter), just applied to linked lists instead of arrays — and it's
  O(1) space here instead of O(n), because nodes are relinked in place
  rather than copied into a new array.
</p>

<h3>Nth from the end — the gap technique</h3>
<p>
  Without knowing the length up front, you can't index from the end
  directly. The fix: advance one pointer <code>n</code> steps first to
  create a fixed gap, then move both pointers together — when the lead
  pointer hits the end, the trailing pointer is exactly <code>n</code>
  from the end.
</p>
<pre><code>function removeNthFromEnd(head, n) {
  const dummy = new ListNode(0, head);
  let fast = dummy, slow = dummy;

  for (let i = 0; i < n; i++) fast = fast.next; <span class="c">// open the gap</span>

  while (fast.next !== null) { <span class="c">// walk both, gap stays fixed</span>
    fast = fast.next;
    slow = slow.next;
  }

  slow.next = slow.next.next; <span class="c">// slow is right before the target</span>
  return dummy.next;
}</code></pre>
<p class="sub">
  The dummy node earns its keep again here — without it, removing the
  actual head (when <code>n</code> equals the list's length) would need
  its own special case.
</p>

<h3>The dummy-node trick — kills a whole class of edge-case bugs</h3>
<pre><code><span class="c">// remove all nodes with a given value</span>
function removeElements(head, val) {
  const dummy = new ListNode(0, head); <span class="c">// fake node before the real head</span>
  let curr = dummy;
  while (curr.next !== null) {
    if (curr.next.val === val) curr.next = curr.next.next;
    else curr = curr.next;
  }
  return dummy.next; <span class="c">// the real (possibly new) head</span>
}</code></pre>
<p class="sub">
  Without the dummy node, deleting the actual head requires special-case
  code (there's no "previous" node to repoint). With a dummy node in
  front, the head is never special — it's just <code>dummy.next</code>
  like any other node's neighbor. Reach for this trick anytime the head
  itself might need to change.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll use a dummy node before
  the head so removing or inserting at the front doesn't need special-case
  code — it's just another node's <code>.next</code> update, same as
  anywhere else in the list."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt gives you a <code>ListNode</code> / "linked list" input directly</li>
  <li>"Reverse," "merge two sorted lists," "detect a cycle," "find the middle," "nth from the end"</li>
  <li>You need O(1) insert/delete and don't need random access by index</li>
  <li>Fast/slow pointers solve it if the ask involves "middle," "cycle," or "nth from the end"</li>
  <li>Need O(1) removal of an arbitrary known node, or backward traversal — reach for doubly linked</li>
  <li>A dummy node removes a special case anytime the head itself might change</li>
</ul>`,
    },
    {
      id: "dsa-basic-recursion",
      num: "B10",
      title: "Basic recursion",
      short: "Basic recursion",
      levels: ["beginner"],
      practice: ["ex-fibonacci-memoised", "ex-fast-power", "ex-generate-subsets", "ex-flatten-nested-array"],
      ready: true,
      subtitle: "Trees, backtracking, DP and divide-and-conquer are all recursion wearing a costume.",
      body: `<h3>Every recursive function is two things</h3>
<p>
  A <b>base case</b> (the answer you can state directly, no further calls
  needed) and a <b>recursive case</b> (the problem restated in terms of a
  smaller version of itself). Skip the base case and you get infinite
  recursion; get the smaller-version part wrong and it either never
  terminates or terminates with the wrong answer.
</p>
<pre><code>function factorial(n) {
  if (n <= 1) return 1;           <span class="c">// base case — the floor</span>
  return n * factorial(n - 1);    <span class="c">// recursive case — smaller problem</span>
}</code></pre>

<h3>The call stack is a real stack — draw it</h3>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="The call stack building up during factorial(4) then unwinding with the actual multiplications">
    <g class="rough">
      <rect class="box" x="40" y="20" width="220" height="34" />
      <rect class="box" x="40" y="58" width="220" height="34" />
      <rect class="box" x="40" y="96" width="220" height="34" />
      <rect class="boxy" x="40" y="134" width="220" height="34" />
    </g>
    <text class="sm" x="150" y="42" text-anchor="middle">factorial(4) → factorial(3)</text>
    <text class="sm" x="150" y="80" text-anchor="middle">factorial(3) → factorial(2)</text>
    <text class="sm" x="150" y="118" text-anchor="middle">factorial(2) → factorial(1)</text>
    <text class="sm" x="150" y="156" text-anchor="middle">factorial(1) → returns 1</text>
    <text class="lbl" x="320" y="30" style="font-size:14px">↑ builds up</text>
    <text class="sm" x="320" y="50">going DOWN into calls</text>
    <text class="lbl rd" x="320" y="145" style="font-size:14px">↓ unwinds</text>
    <text class="sm rd" x="320" y="165">going UP, multiplying as it returns</text>
    <text class="sm" x="320" y="190">1 → 2×1=2 → 3×2=6 → 4×6=24</text>
  </svg>
  <figcaption>Nothing multiplies until the base case is hit — then the answers flow back up.</figcaption>
</figure>
<div class="warn">
  <span class="ttl">⚠ Recursion isn't free space</span>
  Every call sits on the stack until it returns — n nested calls is O(n)
  <em>space</em>, not O(1), even though you never wrote
  <code>new Array()</code> anywhere. Deep enough recursion (tens of
  thousands of levels in JS) throws a real
  <code>RangeError: Maximum call stack size exceeded</code>. This is a
  legitimate interview follow-up: "can you do this iteratively instead?"
</div>

<h3>Recursion on arrays — shrink by one end</h3>
<pre><code>function sum(arr, i = 0) {
  if (i === arr.length) return 0;      <span class="c">// base case: ran off the end</span>
  return arr[i] + sum(arr, i + 1);      <span class="c">// smaller problem: one fewer element left</span>
}

function reverseString(s) {
  if (s.length <= 1) return s;
  return reverseString(s.slice(1)) + s[0]; <span class="c">// reverse the rest, then tack on the first char</span>
}</code></pre>

<h3>Recursion on trees — the shape you'll use constantly later</h3>
<pre><code>function treeHeight(node) {
  if (node === null) return 0;               <span class="c">// base case: empty subtree</span>
  return 1 + Math.max(
    treeHeight(node.left),
    treeHeight(node.right)
  );                                          <span class="c">// combine two smaller answers</span>
}</code></pre>
<p class="sub">
  Notice this recursion branches into <em>two</em> calls, not one — that's
  the exact shape the Trees chapter builds on, and it's why tree recursion
  complexity is usually expressed in terms of the number of nodes visited,
  not a simple "n halves each time" story.
</p>

<h3>Multiple recursive calls — the branching factor matters</h3>
<p>
  Naive Fibonacci recomputes the same subproblems over and over —
  <code>fib(5)</code> calls <code>fib(3)</code> twice, <code>fib(2)</code>
  three times, and so on. That's O(2ⁿ) work for what's conceptually an
  O(n) amount of distinct information — memoization (its own chapter,
  under Dynamic Programming) is exactly the fix: cache each distinct call
  so it only ever computes once.
</p>
<pre><code><span class="c">// O(2ⁿ) — recomputes the same subproblems repeatedly</span>
function fibSlow(n) {
  if (n <= 1) return n;
  return fibSlow(n - 1) + fibSlow(n - 2);
}</code></pre>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="The recursion tree for fib(4), branching into two calls at every level, with fib(2) and fib(1) recomputed multiple times">
    <g class="rough">
      <rect class="box" x="270" y="10" width="100" height="36" />
      <rect class="box" x="120" y="80" width="100" height="36" />
      <rect class="boxr" x="420" y="80" width="100" height="36" />
      <rect class="box" x="40" y="150" width="90" height="36" />
      <rect class="boxr" x="150" y="150" width="90" height="36" />
      <rect class="boxr" x="400" y="150" width="90" height="36" />
      <rect class="boxr" x="510" y="150" width="90" height="36" />
    </g>
    <text class="sm" x="320" y="32" text-anchor="middle">fib(4)</text>
    <text class="sm" x="170" y="102" text-anchor="middle">fib(3)</text>
    <text class="sm rd" x="470" y="102" text-anchor="middle">fib(2)</text>
    <text class="sm" x="85" y="172" text-anchor="middle">fib(2)</text>
    <text class="sm rd" x="195" y="172" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="445" y="172" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="555" y="172" text-anchor="middle">fib(0)</text>
    <path class="ln" d="M300,46 L180,80" fill="none"/>
    <path class="ln" d="M340,46 L460,80" fill="none"/>
    <path class="ln" d="M150,116 L80,150" fill="none"/>
    <path class="ln" d="M190,116 L195,150" fill="none"/>
    <path class="ln" d="M450,116 L445,150" fill="none"/>
    <path class="ln" d="M490,116 L555,150" fill="none"/>
    <text class="sm rd" x="20" y="220">Red = recomputed more than once — fib(2) is computed twice, fib(1) three times</text>
    <text class="sm" x="20" y="245">Every level doubles the calls below it → O(2ⁿ) nodes in the tree total</text>
  </svg>
  <figcaption>This is what "each call branches into two more calls" actually looks like — and why it explodes.</figcaption>
</figure>

<div class="say">
  <span class="ttl">Say it like this →</span> "The base case is the
  smallest input I can answer directly without recursing, and the
  recursive case restates the problem on a strictly smaller input — as
  long as it's strictly smaller every time, the recursion is guaranteed to
  terminate."
</div>

<h3>Converting recursion to iteration (when asked)</h3>
<p>
  Any recursion can be rewritten iteratively using an explicit stack that
  mimics what the call stack was doing — this is worth being able to do
  live, since "avoid the call stack" is a common follow-up.
</p>
<pre><code><span class="c">// factorial, iteratively — no call stack growth</span>
function factorialIter(n) {
  let result = 1;
  for (let i = 2; i <= n; i++) result *= i;
  return result;
}</code></pre>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The structure itself is recursive — trees, nested lists, nested objects</li>
  <li>The problem can be restated as "solve it for a smaller version, then combine"</li>
  <li>Words like "all combinations," "all paths," "every way to" — usually backtracking, built on this same base/recursive-case shape</li>
  <li>If the same sub-inputs repeat across branches, that's your cue to add memoization rather than leaving it as plain recursion</li>
</ul>`,
    },

    {
      id: "dsa-trees",
      num: "I1",
      title: "Trees",
      short: "Trees",
      levels: ["intermediate"],
      practice: [
        "ex-tree-max-depth",
        "ex-tree-same-tree",
        "ex-tree-symmetric",
        "ex-tree-invert",
        "ex-tree-level-order",
        "ex-tree-path-sum",
      ],
      ready: true,
      subtitle: "A linked list that's allowed to branch — and the three orders you can walk it in.",
      body: `<h3>What makes something a tree</h3>
<p>
  A tree is a linked structure with one rule a linked list doesn't have:
  <b>each node can point to more than one child, and there are no
  cycles</b> — you can never walk from a node back to itself. That single
  branching rule is what unlocks a completely different family of
  algorithms from the linear ones you just spent the beginner tier on.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A binary tree with a root node, two children, and grandchildren, labelling root, parent, child, leaf and the height of the tree">
    <g class="rough">
      <path class="ln" d="M320,50 L200,120" />
      <path class="ln" d="M320,50 L440,120" />
      <path class="ln" d="M200,120 L130,190" />
      <path class="ln" d="M200,120 L270,190" />
      <path class="ln" d="M440,120 L510,190" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="50" r="26" />
      <circle class="box" cx="200" cy="120" r="26" />
      <circle class="box" cx="440" cy="120" r="26" />
      <circle class="boxg" cx="130" cy="190" r="26" />
      <circle class="boxg" cx="270" cy="190" r="26" />
      <circle class="boxg" cx="510" cy="190" r="26" />
    </g>
    <text class="sm" x="320" y="55" text-anchor="middle">8</text>
    <text class="sm" x="200" y="125" text-anchor="middle">3</text>
    <text class="sm" x="440" y="125" text-anchor="middle">10</text>
    <text class="sm" x="130" y="195" text-anchor="middle">1</text>
    <text class="sm" x="270" y="195" text-anchor="middle">6</text>
    <text class="sm" x="510" y="195" text-anchor="middle">14</text>
    <text class="lbl" x="330" y="30" style="font-size:14px">root</text>
    <text class="lbl" x="20" y="230" style="font-size:14px">green = leaves (no children) · height = 2 (root → leaf, in edges)</text>
  </svg>
  <figcaption>3 and 10 are children of 8, and parents of the leaves below them — the same node wears both hats.</figcaption>
</figure>

<h3>Vocabulary you need cold</h3>
<table>
  <tr><th>Term</th><th>Means</th></tr>
  <tr><td>Root</td><td>the top node, the only one with no parent</td></tr>
  <tr><td>Leaf</td><td>a node with no children</td></tr>
  <tr><td>Height</td><td>the number of edges on the longest root-to-leaf path</td></tr>
  <tr><td>Depth</td><td>the number of edges from the root to that specific node</td></tr>
  <tr><td>Balanced</td><td>for every node, the left and right subtree heights differ by at most 1</td></tr>
  <tr><td>Binary Search Tree (BST)</td><td>a binary tree where every left subtree is smaller, every right subtree is bigger</td></tr>
</table>

<h3>The BST property, drawn</h3>
<figure>
  <svg viewBox="0 0 640 90" class="dg" role="img" aria-label="A single node showing that everything in its left subtree is smaller and everything in its right subtree is bigger">
    <g class="rough">
      <rect class="boxr" x="60" y="20" width="180" height="50" rx="6" />
      <rect class="boxy" x="280" y="20" width="80" height="50" rx="6" />
      <rect class="boxg" x="400" y="20" width="180" height="50" rx="6" />
    </g>
    <text class="sm rd" x="150" y="50" text-anchor="middle">everything here is &lt; 8</text>
    <text class="sm" x="320" y="50" text-anchor="middle">8</text>
    <text class="sm gr" x="490" y="50" text-anchor="middle">everything here is &gt; 8</text>
  </svg>
  <figcaption>This must hold at <em>every</em> node, not just the root — that's what makes binary search work on it.</figcaption>
</figure>
<p>
  This property is the entire reason BST search is O(log n) on a balanced
  tree — same idea as binary search on a sorted array, just implemented as
  pointers instead of index math: compare, then throw away half the tree.
</p>
<pre><code>function bstSearch(node, target) {
  if (node === null) return null;
  if (node.val === target) return node;
  return target < node.val
    ? bstSearch(node.left, target)
    : bstSearch(node.right, target);
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ "BST" only buys you O(log n) if it's balanced</span>
  Insert 1,2,3,4,5 in order into a BST with no rebalancing and you get a
  straight line, not a tree — every operation degrades to O(n), same as a
  linked list. This is exactly why self-balancing trees (AVL, red-black)
  exist, even though you'll rarely implement one by hand in an interview.
</div>

<h3>The three depth-first traversal orders</h3>
<p>
  All three visit every node exactly once and all three use the same
  recursive shape — the <em>only</em> difference is where you place the
  "visit this node" line relative to the two recursive calls.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="The same small binary tree with three different numberings showing in-order, pre-order, and post-order visit sequence">
    <g class="rough">
      <path class="ln" d="M110,50 L60,110" />
      <path class="ln" d="M110,50 L160,110" />
      <path class="lnr" d="M310,50 L260,110" />
      <path class="lnr" d="M310,50 L360,110" />
      <path class="lng" d="M510,50 L460,110" />
      <path class="lng" d="M510,50 L560,110" />
    </g>
    <g class="rough">
      <circle class="box" cx="110" cy="50" r="22" />
      <circle class="box" cx="60" cy="110" r="22" />
      <circle class="box" cx="160" cy="110" r="22" />
      <circle class="boxr" cx="310" cy="50" r="22" />
      <circle class="boxr" cx="260" cy="110" r="22" />
      <circle class="boxr" cx="360" cy="110" r="22" />
      <circle class="boxg" cx="510" cy="50" r="22" />
      <circle class="boxg" cx="460" cy="110" r="22" />
      <circle class="boxg" cx="560" cy="110" r="22" />
    </g>
    <text class="sm" x="110" y="55" text-anchor="middle">2nd</text>
    <text class="sm" x="60" y="115" text-anchor="middle">1st</text>
    <text class="sm" x="160" y="115" text-anchor="middle">3rd</text>
    <text class="sm" x="310" y="55" text-anchor="middle">1st</text>
    <text class="sm" x="260" y="115" text-anchor="middle">2nd</text>
    <text class="sm" x="360" y="115" text-anchor="middle">3rd</text>
    <text class="sm" x="510" y="55" text-anchor="middle">3rd</text>
    <text class="sm" x="460" y="115" text-anchor="middle">1st</text>
    <text class="sm" x="560" y="115" text-anchor="middle">2nd</text>
    <text class="lbl" x="60" y="160" style="font-size:14px">In-order</text>
    <text class="lbl rd" x="260" y="160" style="font-size:14px">Pre-order</text>
    <text class="lbl gr" x="460" y="160" style="font-size:14px">Post-order</text>
    <text class="sm" x="20" y="195">In-order: left, node, right — sorted output on a BST</text>
    <text class="sm rd" x="20" y="215">Pre-order: node, left, right — good for copying a tree</text>
    <text class="sm gr" x="20" y="235">Post-order: left, right, node — good for deleting a tree</text>
  </svg>
  <figcaption>Same tree, same recursive shape — only the position of "visit node" relative to the two recursive calls changes.</figcaption>
</figure>
<pre><code>function inOrder(node, out = []) {
  if (node === null) return out;
  inOrder(node.left, out);
  out.push(node.val);   <span class="c">// visit AFTER left, BEFORE right</span>
  inOrder(node.right, out);
  return out;
}

function preOrder(node, out = []) {
  if (node === null) return out;
  out.push(node.val);   <span class="c">// visit FIRST</span>
  preOrder(node.left, out);
  preOrder(node.right, out);
  return out;
}

function postOrder(node, out = []) {
  if (node === null) return out;
  postOrder(node.left, out);
  postOrder(node.right, out);
  out.push(node.val);   <span class="c">// visit LAST</span>
  return out;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "In-order traversal of a BST
  always produces sorted output, because at every node you visit
  everything smaller (left) before the node itself, before everything
  bigger (right) — that ordering guarantee is exactly the BST property
  applied recursively."
</div>

<h3>Breadth-first (level-order) — the one traversal that isn't depth-first</h3>
<p>
  All three orders above dive to the bottom before coming back up. Level
  order does the opposite: visit every node at depth 0, then every node
  at depth 1, then depth 2 — this needs a queue, not recursion, because
  you have to remember an entire "frontier" of nodes at once.
</p>
<pre><code>function levelOrder(root) {
  if (root === null) return [];
  const result = [];
  const queue = [root];
  while (queue.length) {
    const levelSize = queue.length; <span class="c">// freeze how many belong to THIS level</span>
    const level = [];
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}</code></pre>
<p class="sub">
  The <code>levelSize</code> snapshot is the trick — without it you can't
  tell where one level ends and the next begins, since the queue just
  keeps growing as you go.
</p>

<h3>Doing it without recursion — a near-guaranteed follow-up</h3>
<p>
  "Can you do that iteratively?" is one of the most common tree follow-up
  questions, because it tests whether you actually understand what
  recursion was doing for you (managing a stack of "come back to this
  later" positions) rather than just pattern-matching the recursive shape.
</p>
<pre><code><span class="c">// iterative pre-order — the easiest one: an explicit stack, push right before left</span>
function preOrderIterative(root) {
  if (root === null) return [];
  const result = [];
  const stack = [root];
  while (stack.length) {
    const node = stack.pop();
    result.push(node.val);
    if (node.right) stack.push(node.right); <span class="c">// push right FIRST</span>
    if (node.left) stack.push(node.left);   <span class="c">// so left gets popped first</span>
  }
  return result;
}

<span class="c">// iterative in-order — trickier: walk left as far as possible, THEN visit, THEN go right</span>
function inOrderIterative(root) {
  const result = [];
  const stack = [];
  let curr = root;
  while (curr !== null || stack.length) {
    while (curr !== null) {   <span class="c">// go as far left as possible, remembering the path</span>
      stack.push(curr);
      curr = curr.left;
    }
    curr = stack.pop();        <span class="c">// backtrack to the last unvisited node</span>
    result.push(curr.val);
    curr = curr.right;         <span class="c">// then explore its right subtree</span>
  }
  return result;
}</code></pre>
<p class="sub">
  Post-order iteratively is the fiddly one — the cleanest trick is to
  compute pre-order but visiting <em>right before left</em> (swap the push
  order above), collect that into a list, then reverse it. Right-Node-Left
  reversed is exactly Left-Right-Node, which is post-order — worth
  remembering as a shortcut rather than deriving a true post-order stack
  machine from scratch under interview pressure.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Recursion was implicitly
  using the call stack to remember 'come back to this node later' — I can
  make that explicit with my own stack and get the identical traversal
  order without the recursive call overhead."
</div>

<h3>Complexity — the numbers to state out loud</h3>
<table>
  <tr><th>Operation</th><th>Balanced BST</th><th>Unbalanced (worst case)</th></tr>
  <tr><td>Search / insert / delete</td><td>O(log n)</td><td>O(n)</td></tr>
  <tr><td>Any traversal (visits every node once)</td><td>O(n)</td><td>O(n)</td></tr>
  <tr><td>Space (recursive call stack)</td><td>O(log n) — height of the tree</td><td>O(n)</td></tr>
  <tr><td>Space (level order, via queue)</td><td>O(n) — widest level, up to n/2 nodes</td><td>O(n)</td></tr>
</table>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The input is described as a "binary tree" or "BST" with <code>.left</code>/<code>.right</code></li>
  <li>"Sorted order" out of a BST → in-order is almost always the answer</li>
  <li>"Level by level" or "shortest path in an unweighted tree" → level order (BFS)</li>
  <li>"Build/copy/serialize" → pre-order; "safely delete/free" → post-order</li>
</ul>`,
    },
    {
      id: "dsa-tree-problems",
      num: "I2",
      title: "Tree problems in depth",
      short: "Tree problems in depth",
      levels: ["intermediate"],
      practice: [
        "ex-tree-zigzag-level-order",
        "ex-tree-right-side-view",
        "ex-tree-diameter",
        "ex-tree-balanced",
        "ex-tree-lowest-common-ancestor",
        "ex-tree-validate-bst",
        "ex-tree-kth-smallest-bst",
        "ex-tree-lca-bst",
        "ex-tree-sorted-array-to-bst",
        "ex-tree-build-from-preorder-inorder",
        "ex-tree-serialize-deserialize",
        "ex-tree-path-sum-ii",
        "ex-tree-max-path-sum",
        "ex-tree-next-right-pointers",
      ],
      ready: true,
      subtitle: "Construction, LCA, balance and serialization — the four questions traversal alone doesn't answer.",
      body: `<h3>Building a tree back from its traversals</h3>
<p>
  Given pre-order and in-order sequences, you can reconstruct the exact
  original tree — this works because <b>pre-order's first element is
  always the root</b>, and once you know the root, in-order tells you
  exactly which values belong in the left subtree (everything before the
  root) versus the right subtree (everything after it).
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="Using the root from preorder to split the inorder sequence into left and right subtree groups">
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="600" height="40" rx="6" />
      <rect class="box" x="20" y="90" width="600" height="40" rx="6" />
    </g>
    <text class="sm" x="40" y="45">pre-order: [ 3, 9, 20, 15, 7 ] — first element (3) is the root</text>
    <text class="sm" x="40" y="115">in-order:  [ 9, 3, 15, 20, 7 ] — find 3, everything left of it is the left subtree</text>
    <path class="lnr" d="M60,130 L60,160" />
    <path class="lng" d="M300,130 L500,160" />
    <text class="sm rd" x="20" y="180">left subtree in-order: [9]</text>
    <text class="sm gr" x="300" y="180">right subtree in-order: [15, 20, 7]</text>
    <text class="lbl" x="20" y="205" style="font-size:14px">recurse: next pre-order element (9) is the left subtree's root, and so on</text>
  </svg>
  <figcaption>Root from pre-order splits in-order into two halves — repeat recursively for each half.</figcaption>
</figure>
<pre><code>function buildTree(preorder, inorder) {
  if (preorder.length === 0) return null;

  const rootVal = preorder[0];
  const root = { val: rootVal, left: null, right: null };

  const splitIndex = inorder.indexOf(rootVal);
  const leftInorder = inorder.slice(0, splitIndex);
  const rightInorder = inorder.slice(splitIndex + 1);

  root.left = buildTree(preorder.slice(1, 1 + leftInorder.length), leftInorder);
  root.right = buildTree(preorder.slice(1 + leftInorder.length), rightInorder);

  return root;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Post-order + pre-order alone isn't enough</span>
  Pre-order and post-order together can't always uniquely reconstruct a
  binary tree — some trees produce identical pre/post pairs. You need
  in-order paired with either pre-order or post-order (or a fully
  balanced/complete tree structure) to guarantee a unique answer. Worth
  saying out loud if asked to justify why the combination matters.
</div>

<h3>Lowest Common Ancestor (LCA)</h3>
<p>
  The LCA of two nodes is the deepest node that has both as descendants.
  On a plain binary tree, you find it by searching both subtrees and
  noticing where the paths to each target first "meet."
</p>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="A tree highlighting the path down to two target nodes and marking the node where those paths diverge as the lowest common ancestor">
    <g class="rough">
      <path class="ln" d="M320,40 L200,100" />
      <path class="lnr" d="M320,40 L440,100" />
      <path class="ln" d="M200,100 L140,160" />
      <path class="lnr" d="M440,100 L380,160" />
      <path class="lnr" d="M440,100 L500,160" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="40" r="22" />
      <circle class="box" cx="200" cy="100" r="22" />
      <circle class="boxr" cx="440" cy="100" r="22" />
      <circle class="box" cx="140" cy="160" r="22" />
      <circle class="boxr" cx="380" cy="160" r="22" />
      <circle class="boxr" cx="500" cy="160" r="22" />
    </g>
    <text class="sm" x="320" y="45" text-anchor="middle">1</text>
    <text class="sm" x="200" y="105" text-anchor="middle">2</text>
    <text class="sm" x="440" y="105" text-anchor="middle">3</text>
    <text class="sm" x="140" y="165" text-anchor="middle">4</text>
    <text class="sm" x="380" y="165" text-anchor="middle">5</text>
    <text class="sm" x="500" y="165" text-anchor="middle">6</text>
    <text class="lbl rd" x="20" y="195" style="font-size:14px">LCA(5, 6) = 3 — the node where both paths are still together</text>
  </svg>
  <figcaption>3 is an ancestor of both 5 and 6, and it's the deepest one that is.</figcaption>
</figure>
<pre><code>function lowestCommonAncestor(root, p, q) {
  if (root === null || root === p || root === q) return root;

  const left = lowestCommonAncestor(root.left, p, q);
  const right = lowestCommonAncestor(root.right, p, q);

  if (left && right) return root; <span class="c">// p and q split across both sides — root is the LCA</span>
  return left ?? right;            <span class="c">// both on one side — pass that answer up</span>
}</code></pre>
<p class="sub">
  On a <em>BST</em> specifically, you can skip the full search: compare
  both targets against the current node's value. If both are smaller, go
  left; if both are bigger, go right; the moment they split (or match the
  node), you've found the LCA in O(log n) instead of O(n) — the BST
  property does the pruning for you.
</p>

<h3>Checking if a tree is height-balanced</h3>
<div class="warn">
  <span class="ttl">⚠ The naive version is accidentally O(n²)</span>
  Calling a separate <code>height()</code> function at every node, inside
  a traversal that visits every node, recomputes height from scratch each
  time — O(n) work, done n times. The fix: compute height and check
  balance <em>in the same pass</em>, and short-circuit upward the moment
  imbalance is found anywhere below.
</div>
<pre><code>function isBalanced(root) {
  function check(node) {
    if (node === null) return 0; <span class="c">// height of an empty tree</span>

    const leftHeight = check(node.left);
    if (leftHeight === -1) return -1; <span class="c">// already unbalanced below — stop early</span>

    const rightHeight = check(node.right);
    if (rightHeight === -1) return -1;

    if (Math.abs(leftHeight - rightHeight) > 1) return -1; <span class="c">// -1 means "unbalanced"</span>

    return 1 + Math.max(leftHeight, rightHeight);
  }
  return check(root) !== -1;
}</code></pre>

<h3>Validate BST — the trap almost everyone falls into first</h3>
<div class="warn">
  <span class="ttl">⚠ "Check left &lt; node &lt; right at every node" is NOT enough</span>
  It's tempting to just compare each node against its immediate children.
  That misses violations further down: a right-subtree node can be
  smaller than a distant ancestor even while being bigger than its direct
  parent. The BST property is about <b>every node in the entire left
  subtree, and every node in the entire right subtree</b> — not just
  direct children.
</div>
<figure>
  <svg viewBox="0 0 400 170" class="dg" role="img" aria-label="A tree that passes a naive parent-child only check but is not actually a valid BST because a deep node violates an ancestor's range">
    <g class="rough">
      <path class="ln" d="M200,30 L110,80" />
      <path class="lnr" d="M200,30 L290,80" />
      <path class="lnr" d="M290,80 L250,130" />
    </g>
    <g class="rough">
      <circle class="box" cx="200" cy="30" r="22" />
      <circle class="box" cx="110" cy="80" r="22" />
      <circle class="box" cx="290" cy="80" r="22" />
      <circle class="boxr" cx="250" cy="130" r="22" />
    </g>
    <text class="sm" x="200" y="35" text-anchor="middle">5</text>
    <text class="sm" x="110" y="85" text-anchor="middle">3</text>
    <text class="sm" x="290" y="85" text-anchor="middle">8</text>
    <text class="sm rd" x="250" y="135" text-anchor="middle">4</text>
  </svg>
  <figcaption>4 &lt; 8 (its parent) looks fine locally — but 4 is in 5's right subtree, so it must be &gt; 5. It isn't. Invalid.</figcaption>
</figure>
<pre><code><span class="c">// pass down a valid (min, max) RANGE, tightened at every step</span>
function isValidBST(node, min = -Infinity, max = Infinity) {
  if (node === null) return true;
  if (node.val <= min || node.val >= max) return false;

  return (
    isValidBST(node.left, min, node.val) &&   <span class="c">// left subtree must stay BELOW node.val</span>
    isValidBST(node.right, node.val, max)      <span class="c">// right subtree must stay ABOVE node.val</span>
  );
}</code></pre>
<p class="sub">
  An equally valid alternative: run an in-order traversal and check the
  output is strictly increasing — since in-order on a real BST always
  produces sorted output (from the Trees chapter), any violation of that
  proves it isn't one. Both approaches are O(n) time, O(h) space.
</p>

<h3>Diameter of a binary tree</h3>
<p>
  The diameter is the length of the longest path between <em>any</em> two
  nodes — and that path doesn't have to pass through the root. The
  subtlety: the longest path <em>through</em> a given node is
  <code>leftHeight + rightHeight</code>, but the final answer is the
  <b>maximum of that value across every node</b>, not just the root.
</p>
<pre><code>function diameterOfBinaryTree(root) {
  let diameter = 0;

  function height(node) {
    if (node === null) return 0;
    const leftHeight = height(node.left);
    const rightHeight = height(node.right);

    diameter = Math.max(diameter, leftHeight + rightHeight); <span class="c">// update global answer at EVERY node</span>

    return 1 + Math.max(leftHeight, rightHeight); <span class="c">// but only return height upward</span>
  }

  height(root);
  return diameter;
}</code></pre>
<p class="sub">
  This is the same shape as <code>isBalanced</code> above — a single
  post-order pass that computes a per-node value (height) while
  side-effecting a running global answer. That combination — "return one
  thing up the call stack, but also track a separate best-so-far as you
  go" — is worth recognizing as its own recurring template; it also
  solves Binary Tree Maximum Path Sum with the same shape (track the best
  path found anywhere, but only return the best <em>single-branch</em>
  extension upward, since a path can't fork twice).
</p>

<h3>Serialization — turning a tree into a string and back</h3>
<p>
  Pre-order with explicit <code>null</code> markers is the standard
  approach — it's the only single traversal that, alone, can rebuild the
  exact tree shape without needing a second traversal like the
  construction problem above.
</p>
<pre><code>function serialize(root) {
  if (root === null) return "null";
  return \`\${root.val},\${serialize(root.left)},\${serialize(root.right)}\`;
}

function deserialize(data) {
  const values = data.split(",");
  let i = 0;

  function build() {
    if (values[i] === "null") { i++; return null; }
    const node = { val: Number(values[i++]), left: null, right: null };
    node.left = build();
    node.right = build();
    return node;
  }
  return build();
}</code></pre>
<p class="sub">
  The <code>null</code> markers are what make one traversal enough — they
  tell the rebuilder exactly where each branch ends, instead of needing a
  second traversal to disambiguate the shape.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll serialize with
  pre-order and explicit null markers, since that's the one traversal
  where the string alone — no second traversal needed — is enough to
  rebuild the exact original shape."
</div>

<h3>Recognizing which of these four you need</h3>
<ul>
  <li>"Given two traversals, rebuild the tree" → construction (use pre/post-order for the root, in-order to split subtrees)</li>
  <li>"Find the common ancestor" → LCA (BST property prunes it to O(log n) if it's a BST)</li>
  <li>"Is this tree balanced/valid?" → compute the property bottom-up in one pass, short-circuit on failure</li>
  <li>"Save this tree to a file / send over a network" → serialize with pre-order + null markers</li>
</ul>`,
    },
    {
      id: "dsa-heaps-priority-queues",
      num: "I3",
      title: "Heaps & priority queues",
      short: "Heaps & priority queues",
      levels: ["intermediate"],
      practice: [
        "ex-kth-largest-element",
        "ex-median-from-data-stream",
        "ex-k-closest-points-origin",
        "ex-last-stone-weight",
        "ex-task-scheduler",
        "ex-sort-characters-by-frequency",
        "ex-reorganize-string",
        "ex-smallest-range-k-lists",
        "ex-k-pairs-smallest-sums",
        "ex-ipo-maximize-capital",
        "ex-maximum-performance-team",
        "ex-min-cost-connect-sticks",
        "ex-furthest-building-you-can-reach",
      ],
      ready: true,
      subtitle: "You don't need the whole thing sorted — you need the extreme value, fast, repeatedly.",
      body: `<h3>The problem a heap exists to solve</h3>
<p>
  If you need the minimum (or maximum) value <em>once</em>, scan the
  array — O(n). If you need it <em>repeatedly</em>, while the data keeps
  changing, sorting every time is O(n log n) per query — wasteful. A heap
  gives you the extreme value in O(1) and lets you add or remove in
  O(log n), which is the sweet spot for "keep asking me for the biggest
  one" problems.
</p>

<h3>The one rule: parent beats children</h3>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="A min-heap tree where every parent is smaller than its children, alongside the same heap stored as a flat array">
    <g class="rough">
      <path class="ln" d="M320,40 L200,100" />
      <path class="ln" d="M320,40 L440,100" />
      <path class="ln" d="M200,100 L140,160" />
      <path class="ln" d="M200,100 L260,160" />
      <path class="ln" d="M440,100 L500,160" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="320" cy="40" r="24" />
      <circle class="box" cx="200" cy="100" r="24" />
      <circle class="box" cx="440" cy="100" r="24" />
      <circle class="box" cx="140" cy="160" r="24" />
      <circle class="box" cx="260" cy="160" r="24" />
      <circle class="box" cx="500" cy="160" r="24" />
    </g>
    <text class="sm" x="320" y="45" text-anchor="middle">2</text>
    <text class="sm" x="200" y="105" text-anchor="middle">5</text>
    <text class="sm" x="440" y="105" text-anchor="middle">4</text>
    <text class="sm" x="140" y="165" text-anchor="middle">9</text>
    <text class="sm" x="260" y="165" text-anchor="middle">7</text>
    <text class="sm" x="500" y="165" text-anchor="middle">8</text>
    <text class="lbl gr" x="330" y="20" style="font-size:14px">root = the minimum, always</text>
    <g class="rough">
      <rect class="box" x="20" y="195" width="60" height="30" />
      <rect class="box" x="80" y="195" width="60" height="30" />
      <rect class="box" x="140" y="195" width="60" height="30" />
      <rect class="box" x="200" y="195" width="60" height="30" />
      <rect class="box" x="260" y="195" width="60" height="30" />
      <rect class="box" x="320" y="195" width="60" height="30" />
    </g>
    <text class="sm" x="50" y="215" text-anchor="middle">2</text>
    <text class="sm" x="110" y="215" text-anchor="middle">5</text>
    <text class="sm" x="170" y="215" text-anchor="middle">4</text>
    <text class="sm" x="230" y="215" text-anchor="middle">9</text>
    <text class="sm" x="290" y="215" text-anchor="middle">7</text>
    <text class="sm" x="350" y="215" text-anchor="middle">8</text>
    <text class="lbl" x="400" y="215" style="font-size:13px">← stored flat: child of i is 2i+1, 2i+2</text>
  </svg>
  <figcaption>Min-heap: every parent ≤ its children. No claim about left vs right — only up vs down.</figcaption>
</figure>
<p class="sub">
  A heap is <b>not</b> sorted, and it's not a BST — a node's left child
  can be bigger or smaller than its right child, the only guarantee is
  parent-vs-children. That weaker guarantee is exactly what makes insert
  and remove-min cheaper than keeping the whole thing sorted.
</p>

<h3>Sift-up (insert) and sift-down (remove) — the two moves</h3>
<p>
  Insert always adds at the very end of the array, then "bubbles" it up
  while it's smaller than its parent. Removing the min always takes the
  last element, drops it at the root, then "sinks" it down while it's
  bigger than its smallest child. Both are O(log n) because they only
  ever travel the height of the tree.
</p>
<pre><code>class MinHeap {
  #data = [];

  peek() { return this.#data[0]; }
  size() { return this.#data.length; }

  push(val) {
    this.#data.push(val);
    this.#siftUp(this.#data.length - 1);
  }

  pop() {
    const min = this.#data[0];
    const last = this.#data.pop();
    if (this.#data.length > 0) {
      this.#data[0] = last;
      this.#siftDown(0);
    }
    return min;
  }

  #siftUp(i) {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.#data[parent] <= this.#data[i]) break;
      [this.#data[parent], this.#data[i]] = [this.#data[i], this.#data[parent]];
      i = parent;
    }
  }

  #siftDown(i) {
    const n = this.#data.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1, right = 2 * i + 2;
      if (left < n && this.#data[left] < this.#data[smallest]) smallest = left;
      if (right < n && this.#data[right] < this.#data[smallest]) smallest = right;
      if (smallest === i) break;
      [this.#data[i], this.#data[smallest]] = [this.#data[smallest], this.#data[i]];
      i = smallest;
    }
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ JS has no built-in heap — say so, then build one</span>
  Unlike Python (<code>heapq</code>) or Java (<code>PriorityQueue</code>),
  JavaScript has no native heap. In an interview, name this explicitly and
  either implement a small one (above) or, if allowed, describe using a
  sorted-insert array for small n while stating the tradeoff clearly.
</div>

<h3>The top-K pattern</h3>
<p>
  This is where heaps earn their keep: finding the k largest elements out
  of n. Sorting everything is O(n log n). A heap does it in
  O(n log k) — and when k is small relative to n, that's a real win.
</p>
<pre><code><span class="c">// k largest elements — keep a MIN-heap of size k (counter-intuitive but correct)</span>
function kLargest(nums, k) {
  const heap = new MinHeap();
  for (const num of nums) {
    heap.push(num);
    if (heap.size() > k) heap.pop(); <span class="c">// evict the smallest — keep only the top k</span>
  }
  return heap; <span class="c">// contains exactly the k largest, unsorted among themselves</span>
}</code></pre>
<p class="sub">
  The trick that trips people up: for "k <em>largest</em>," you use a
  <em>min</em>-heap, not a max-heap — because you want to cheaply evict
  the smallest of your current top-k candidates the moment a bigger one
  shows up. The heap's root is always "the next one to kick out," which is
  the smallest of the keepers.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I only need the k largest,
  not a full sort, so I'll keep a min-heap of size k — every new element
  either gets discarded or bumps out the current smallest keeper, which
  is O(log k) per element instead of O(n log n) for a full sort."
</div>

<h3>Building a heap from an array in O(n), not O(n log n)</h3>
<p>
  Pushing n elements one at a time costs O(n log n) — each push is
  O(log n). But if you already have the full array upfront, you can build
  the heap faster: place all elements as-is, then sift-down starting from
  the last <em>non-leaf</em> node backward to the root.
</p>
<pre><code>function heapify(arr) {
  const n = arr.length;
  <span class="c">// last non-leaf node is at index Math.floor(n/2) - 1 — every index after that is a leaf</span>
  for (let i = Math.floor(n / 2) - 1; i >= 0; i--) {
    siftDown(arr, i, n);
  }
  return arr;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Why this is O(n), not O(n log n) — worth being able to explain</span>
  Most nodes are near the bottom of the tree, where sift-down has almost
  no distance to travel. Only the few nodes near the root can sift all the
  way down. Summing "number of nodes at each level × how far they can
  sift" across the whole tree converges to O(n), not O(n log n) — a
  genuinely surprising result that's worth knowing exists, even if you
  never re-derive the summation live in an interview.
</div>

<h3>The two-heap pattern — running median of a data stream</h3>
<p>
  A single heap gives you the min <em>or</em> the max. Finding the
  <b>median</b> of a growing stream needs both at once — the classic
  trick is to split the data across two heaps that meet in the middle.
</p>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="A max-heap holding the smaller half of the numbers and a min-heap holding the larger half, with their two roots forming the median">
    <g class="rough">
      <rect class="boxr" x="40" y="30" width="260" height="100" rx="8" />
      <rect class="boxg" x="340" y="30" width="260" height="100" rx="8" />
    </g>
    <text class="lbl rd" x="60" y="55" style="font-size:14px">max-heap: smaller half</text>
    <text class="sm" x="60" y="80">e.g. {1, 3, 5}</text>
    <text class="sm" x="60" y="100">root = 5 (biggest of small half)</text>
    <text class="lbl gr" x="360" y="55" style="font-size:14px">min-heap: larger half</text>
    <text class="sm" x="360" y="80">e.g. {7, 9}</text>
    <text class="sm" x="360" y="100">root = 7 (smallest of big half)</text>
    <text class="lbl" x="20" y="160" style="font-size:15px">median = 5 (odd count) or avg(5, 7) if both heaps were equal-sized</text>
  </svg>
  <figcaption>Both roots sit right at the midpoint — the median is always O(1) to read once the split is balanced.</figcaption>
</figure>
<pre><code>class MedianFinder {
  #small = new MaxHeap(); <span class="c">// same MinHeap code, comparisons flipped — holds the smaller half</span>
  #large = new MinHeap(); <span class="c">// holds the larger half</span>

  addNum(num) {
    this.#small.push(num);
    this.#large.push(this.#small.pop()); <span class="c">// always route through #small first, then rebalance</span>

    if (this.#small.size() < this.#large.size()) {
      this.#small.push(this.#large.pop()); <span class="c">// keep #small equal-or-one-more than #large</span>
    }
  }

  findMedian() {
    if (this.#small.size() > this.#large.size()) return this.#small.peek();
    return (this.#small.peek() + this.#large.peek()) / 2;
  }
}</code></pre>
<p class="sub">
  Every insert is O(log n), and reading the median is O(1) — compare that
  to re-sorting on every insert (O(n log n) each time) or inserting into a
  sorted array (O(n) shifting each time). The two-heap split is what
  makes a <em>streaming</em> median tractable at all.
</p>


<h3>See it sink</h3>
<p>Watch the last element take the root's place and then sink. It only ever follows the smaller child, so it touches one node per level — that is the log n.</p>

<div class="demo">
  <div class="demo__bar">Heap — sift-down after extract-min</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="hp-code"></div>
        <div class="loop-bar"><i id="hp-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="hp-prev" type="button">← Back</button>
          <button class="btn" id="hp-next" type="button">Next step →</button>
          <button class="btn" id="hp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="hp-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">As a tree, level by level</div>
          <div id="hp-p-tree"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="hp-cells"></div></div></div>
    <p class="demo__note" id="hp-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "hp";
  var CODE = ["const min = h[0];","h[0] = h.pop();","let i = 0;","while (true) {","  let small = i, l = 2*i+1, r = 2*i+2;","  if (l < h.length && h[l] < h[small]) small = l;","  if (r < h.length && h[r] < h[small]) small = r;","  if (small === i) break;","  [h[i], h[small]] = [h[small], h[i]]; i = small;","}"];
  var STEPS = [{"cells":[{"v":"1","c":"","p":""},{"v":"3","c":"","p":""},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""},{"v":"8","c":"","p":""}],"panels":{"tree":["1","3  6","5  9  8"]},"note":"A min-heap as an array. Children of index i live at 2i+1 and 2i+2 — no pointers needed."},{"cells":[{"v":"8","c":"hot","p":"node"},{"v":"3","c":"","p":""},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["8","3  6","5  9"]},"note":"Extract-min returns 1. The LAST element (8) moves to the root to keep the tree complete — now it's probably in the wrong place."},{"cells":[{"v":"8","c":"hot","p":"node"},{"v":"3","c":"in","p":"child"},{"v":"6","c":"in","p":"child"},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["8","3  6","5  9"]},"note":"Compare 8 with its children (3, 6)."},{"cells":[{"v":"3","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"6","c":"","p":""},{"v":"5","c":"","p":""},{"v":"9","c":"","p":""}],"panels":{"tree":["3","8  6","5  9"]},"note":"3 > 8, so swap. Sift-down follows the smaller child — at most log n swaps."},{"cells":[{"v":"3","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"6","c":"","p":""},{"v":"5","c":"in","p":"child"},{"v":"9","c":"in","p":"child"}],"panels":{"tree":["3","8  6","5  9"]},"note":"Compare 8 with its children (5, 9)."},{"cells":[{"v":"3","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"9","c":"","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"5 > 8, so swap. Sift-down follows the smaller child — at most log n swaps."},{"cells":[{"v":"3","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"8","c":"hot","p":"node"},{"v":"9","c":"","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"Index 3 has no children — sift-down is done."},{"cells":[{"v":"3","c":"done","p":""},{"v":"5","c":"done","p":""},{"v":"6","c":"done","p":""},{"v":"8","c":"done","p":""},{"v":"9","c":"done","p":""}],"panels":{"tree":["3","5  6","8  9"]},"note":"Heap restored: [3, 5, 6, 8, 9]. Root is 3, the new minimum."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Top K," "k-th largest/smallest," "k closest points"</li>
  <li>Merging k sorted lists/arrays — a heap tracks "the smallest unmerged element" across all of them</li>
  <li>You need repeated access to a min/max while the data set keeps changing (a scheduler, a running median)</li>
  <li>"Running median," "median of a stream" → the two-heap pattern specifically</li>
  <li>A brute force would re-sort after every update — that's the tell a heap should replace it</li>
</ul>`,
    },
    {
      id: "dsa-graphs-representation-traversal",
      num: "I4",
      title: "Graphs: representation & traversal",
      short: "Graphs: representation",
      levels: ["intermediate"],
      practice: [
        "ex-number-of-islands",
        "ex-max-area-of-island",
        "ex-clone-graph",
        "ex-rotting-oranges",
        "ex-surrounded-regions",
      ],
      ready: true,
      subtitle: "A tree is a graph with no cycles and one root — now drop both restrictions.",
      body: `<h3>A graph is nodes plus connections, nothing more</h3>
<p>
  Trees have exactly one root and no cycles. A graph relaxes both: any
  node can connect to any other node, connections can be one-way
  (directed) or two-way (undirected), and cycles are allowed. That
  generality is why graphs model almost anything — social networks, road
  maps, dependency chains, web pages linking to each other.
</p>
<figure>
  <svg viewBox="0 0 640 265" class="dg" role="img" aria-label="A small undirected graph with five nodes and edges connecting them, some forming a cycle">
    <g class="rough">
      <path class="ln" d="M100,60 L280,40" />
      <path class="ln" d="M100,60 L100,180" />
      <path class="ln" d="M280,40 L440,110" />
      <path class="ln" d="M100,180 L280,190" />
      <path class="ln" d="M280,190 L440,110" />
      <path class="ln" d="M280,40 L280,190" />
    </g>
    <g class="rough">
      <circle class="box" cx="100" cy="60" r="24" />
      <circle class="box" cx="280" cy="40" r="24" />
      <circle class="box" cx="440" cy="110" r="24" />
      <circle class="box" cx="100" cy="180" r="24" />
      <circle class="box" cx="280" cy="190" r="24" />
    </g>
    <text class="sm" x="100" y="65" text-anchor="middle">A</text>
    <text class="sm" x="280" y="45" text-anchor="middle">B</text>
    <text class="sm" x="440" y="115" text-anchor="middle">C</text>
    <text class="sm" x="100" y="185" text-anchor="middle">D</text>
    <text class="sm" x="280" y="195" text-anchor="middle">E</text>
    <text class="lbl" x="20" y="235" style="font-size:14px">A-B-E-D-A is a cycle — something a tree can never have</text>
  </svg>
  <figcaption>No single root, connections in any direction, and a cycle (A→B→E→D→A) — none of these are tree-legal.</figcaption>
</figure>

<h3>Two ways to store one, and when each wins</h3>
<figure>
  <svg viewBox="0 0 640 180" class="dg" role="img" aria-label="The same graph stored as an adjacency list versus an adjacency matrix">
    <g class="rough">
      <rect class="boxy" x="20" y="20" width="280" height="140" rx="6" />
      <rect class="box" x="340" y="20" width="280" height="140" rx="6" />
    </g>
    <text class="lbl" x="40" y="45" style="font-size:15px">Adjacency list</text>
    <text class="sm" x="40" y="70">A → [B, D]</text>
    <text class="sm" x="40" y="90">B → [A, C, E]</text>
    <text class="sm" x="40" y="110">C → [B, E]</text>
    <text class="sm" x="40" y="130">D → [A, E]</text>
    <text class="sm" x="40" y="150">E → [B, C, D]</text>
    <text class="lbl" x="360" y="45" style="font-size:15px">Adjacency matrix</text>
    <text class="sm" x="360" y="70">    A B C D E</text>
    <text class="sm" x="360" y="88">A [ 0 1 0 1 0 ]</text>
    <text class="sm" x="360" y="106">B [ 1 0 1 0 1 ]</text>
    <text class="sm" x="360" y="124">C [ 0 1 0 0 1 ]</text>
    <text class="sm" x="360" y="142">D [ 1 0 0 0 1 ]</text>
  </svg>
  <figcaption>List: compact, fast to iterate neighbors. Matrix: O(1) "are X and Y connected," O(V²) space.</figcaption>
</figure>
<table>
  <tr><th></th><th>Adjacency list</th><th>Adjacency matrix</th></tr>
  <tr><td>Space</td><td>O(V + E)</td><td>O(V²) — wasteful for sparse graphs</td></tr>
  <tr><td>"Are X, Y connected?"</td><td>O(degree of X)</td><td>O(1)</td></tr>
  <tr><td>"Give me all of X's neighbors"</td><td>O(degree of X) — direct</td><td>O(V) — scan the whole row</td></tr>
  <tr><td>Best for</td><td>most real interview graphs (sparse)</td><td>dense graphs, or when O(1) edge lookup matters most</td></tr>
</table>
<pre><code><span class="c">// building an adjacency list from an edge list — the shape you'll write constantly</span>
function buildGraph(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) {
    graph[u].push(v);
    graph[v].push(u); <span class="c">// omit this line for a DIRECTED graph</span>
  }
  return graph;
}</code></pre>

<h3>DFS — go deep, backtrack when stuck</h3>
<figure>
  <svg viewBox="0 0 640 175" class="dg" role="img" aria-label="Depth-first search order shown as numbered steps diving deep before backtracking">
    <g class="rough">
      <circle class="boxy" cx="60" cy="70" r="24" />
      <circle class="box" cx="200" cy="70" r="24" />
      <circle class="box" cx="340" cy="70" r="24" />
      <circle class="box" cx="200" cy="20" r="0" />
    </g>
    <path class="ln" d="M84,70 L176,70" marker-end="url(#dgarrow2)" />
    <path class="ln" d="M224,70 L316,70" marker-end="url(#dgarrow2)" />
    <path class="lnr dash" d="M340,95 C 280,150 120,150 60,95" marker-end="url(#dgarrow2)" />
    <defs>
      <marker id="dgarrow2" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="sm" x="60" y="75" text-anchor="middle">1st</text>
    <text class="sm" x="200" y="75" text-anchor="middle">2nd</text>
    <text class="sm" x="340" y="75" text-anchor="middle">3rd</text>
    <text class="sm rd" x="20" y="165">dead end — backtrack to find any unvisited neighbor</text>
  </svg>
  <figcaption>DFS commits to one path fully before ever considering an alternative.</figcaption>
</figure>
<pre><code><span class="c">// recursive DFS — the call stack IS the "backtrack" mechanism, for free</span>
function dfs(graph, start, visited = new Set()) {
  visited.add(start);
  console.log(start);
  for (const neighbor of graph[start]) {
    if (!visited.has(neighbor)) dfs(graph, neighbor, visited);
  }
  return visited;
}

<span class="c">// iterative DFS — same order, explicit stack instead of recursion</span>
function dfsIterative(graph, start) {
  const visited = new Set([start]);
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        stack.push(neighbor);
      }
    }
  }
  return visited;
}</code></pre>

<h3>BFS — spread outward, layer by layer</h3>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="Breadth-first search expanding outward in concentric rings from the start node, one full layer at a time">
    <g class="rough">
      <circle class="boxy" cx="320" cy="85" r="24" />
      <circle class="box" cx="180" cy="45" r="22" />
      <circle class="box" cx="180" cy="125" r="22" />
      <circle class="box" cx="460" cy="45" r="22" />
      <circle class="box" cx="460" cy="125" r="22" />
      <circle class="box" cx="70" cy="85" r="20" />
      <circle class="box" cx="560" cy="85" r="20" />
    </g>
    <text class="sm" x="320" y="90" text-anchor="middle">start</text>
    <text class="sm" x="180" y="50" text-anchor="middle">layer 1</text>
    <text class="sm" x="180" y="130" text-anchor="middle">layer 1</text>
    <text class="sm" x="460" y="50" text-anchor="middle">layer 1</text>
    <text class="sm" x="460" y="130" text-anchor="middle">layer 1</text>
    <text class="sm" x="70" y="90" text-anchor="middle">L2</text>
    <text class="sm" x="560" y="90" text-anchor="middle">L2</text>
    <text class="lbl" x="20" y="165" style="font-size:14px">every layer-1 node visited BEFORE any layer-2 node —</text>
    <text class="lbl" x="20" y="185" style="font-size:14px">this is why BFS finds shortest paths</text>
  </svg>
  <figcaption>The queue enforces "finish this ring before starting the next" — the source of BFS's shortest-path guarantee.</figcaption>
</figure>
<pre><code>function bfs(graph, start) {
  const visited = new Set([start]);
  const queue = [start];
  const order = [];
  while (queue.length) {
    const node = queue.shift();
    order.push(node);
    for (const neighbor of graph[node]) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);   <span class="c">// mark visited when ENQUEUED, not when dequeued</span>
        queue.push(neighbor);
      }
    }
  }
  return order;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Mark visited on enqueue, not on dequeue</span>
  If you wait to mark a node visited until you dequeue it, the same node
  can be pushed onto the queue multiple times by different neighbors
  before it's ever processed — wasted work, and on a graph with cycles it
  can blow up badly. Mark it the instant it's added to the queue.
</div>

<h3>DFS vs BFS — the complexity is identical, the use case isn't</h3>
<table>
  <tr><th></th><th>DFS</th><th>BFS</th></tr>
  <tr><td>Time</td><td>O(V + E)</td><td>O(V + E)</td></tr>
  <tr><td>Space</td><td>O(V) — recursion stack or explicit stack</td><td>O(V) — the queue, can hold a whole "ring"</td></tr>
  <tr><td>Finds shortest path (unweighted)?</td><td>no</td><td>yes — guaranteed</td></tr>
  <tr><td>Natural for</td><td>"does a path exist," cycle detection, backtracking-style exploration</td><td>shortest path, "closest," level-by-level problems</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Both visit every node and
  edge once, so they're both O(V + E) — the choice isn't about speed, it's
  about the guarantee I need. BFS explores in strict distance order, so
  it's the only one of the two that guarantees the first time I reach a
  node is via a shortest path."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Input described as nodes/edges, a grid (adjacent cells = edges), or "connections between X and Y"</li>
  <li>"Shortest path," "fewest steps," "minimum number of moves" on an unweighted graph → BFS</li>
  <li>"Does a path exist," "all paths," "explore every option" → DFS</li>
  <li>A 2D grid where you move up/down/left/right is a graph in disguise — each cell is a node, each valid move is an edge</li>
</ul>`,
    },
    {
      id: "dsa-graph-problems",
      num: "I5",
      title: "Graph problems",
      short: "Graph problems",
      levels: ["intermediate"],
      practice: ["ex-pacific-atlantic-water-flow", "ex-word-ladder"],
      ready: true,
      subtitle: "Three questions that reuse the exact same BFS/DFS you just learned, with one twist each.",
      body: `<h3>Connected components — how many separate "islands" exist</h3>
<figure>
  <svg viewBox="0 0 640 195" class="dg" role="img" aria-label="A graph split into two separate connected components, one with three nodes and one with two nodes">
    <g class="rough">
      <path class="ln" d="M60,60 L160,60" />
      <path class="ln" d="M60,60 L110,140" />
      <path class="ln" d="M420,60 L500,110" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="60" cy="60" r="24" />
      <circle class="boxg" cx="160" cy="60" r="24" />
      <circle class="boxg" cx="110" cy="140" r="24" />
      <circle class="boxy" cx="420" cy="60" r="24" />
      <circle class="boxy" cx="500" cy="110" r="24" />
    </g>
    <text class="lbl gr" x="40" y="20" style="font-size:14px">component 1 (3 nodes)</text>
    <text class="lbl" x="400" y="20" style="font-size:14px">component 2 (2 nodes)</text>
    <text class="sm" x="20" y="185">no edges between the two groups</text>
  </svg>
  <figcaption>Run DFS/BFS from any unvisited node — everything it reaches is one component. Repeat until nothing's left unvisited.</figcaption>
</figure>
<pre><code>function countComponents(n, edges) {
  const graph = Array.from({ length: n }, () => []);
  for (const [u, v] of edges) { graph[u].push(v); graph[v].push(u); }

  const visited = new Set();
  let components = 0;

  for (let node = 0; node < n; node++) {
    if (visited.has(node)) continue; <span class="c">// already covered by an earlier DFS</span>
    components++;
    <span class="c">// flood-fill everything reachable from "node" into "visited"</span>
    const stack = [node];
    visited.add(node);
    while (stack.length) {
      const curr = stack.pop();
      for (const next of graph[curr]) {
        if (!visited.has(next)) { visited.add(next); stack.push(next); }
      }
    }
  }
  return components;
}</code></pre>
<p class="sub">
  The pattern generalizes directly to grid problems ("number of islands"):
  each land cell is a node, each adjacent land cell is an edge — same
  flood-fill, just walking up/down/left/right instead of an adjacency
  list.
</p>

<h3>Cycle detection — the rule differs by directed vs undirected</h3>
<div class="warn">
  <span class="ttl">⚠ The single most common graph-interview mistake</span>
  On an <em>undirected</em> graph, seeing a visited neighbor doesn't
  automatically mean a cycle — it might just be the edge you arrived
  from. You must track and exclude the parent explicitly. On a
  <em>directed</em> graph, that concern doesn't apply, but you now need to
  distinguish "visited earlier, finished" from "visited and still on the
  current path" — the difference between them is the whole check.
</div>
<pre><code><span class="c">// undirected: skip the edge back to where you just came from</span>
function hasCycleUndirected(graph, node, visited, parent) {
  visited.add(node);
  for (const next of graph[node]) {
    if (!visited.has(next)) {
      if (hasCycleUndirected(graph, next, visited, node)) return true;
    } else if (next !== parent) {
      return true; <span class="c">// hit an already-visited node that ISN'T where we came from</span>
    }
  }
  return false;
}

<span class="c">// directed: need a THIRD state — "on the current recursion path"</span>
function hasCycleDirected(graph, n) {
  const state = new Array(n).fill(0); <span class="c">// 0=unvisited, 1=in-progress, 2=done</span>

  function dfs(node) {
    state[node] = 1;
    for (const next of graph[node]) {
      if (state[next] === 1) return true;       <span class="c">// back-edge to an in-progress node = cycle</span>
      if (state[next] === 0 && dfs(next)) return true;
    }
    state[node] = 2;
    return false;
  }

  for (let i = 0; i < n; i++) {
    if (state[i] === 0 && dfs(i)) return true;
  }
  return false;
}</code></pre>
<p class="sub">
  That three-state trick (unvisited / in-progress / done) on a directed
  graph is the exact same idea behind detecting a circular dependency —
  "in-progress" means "currently on the stack of things depending on each
  other," and looping back to one of those is the cycle.
</p>

<h3>Bipartite check — can you 2-color it with no clashes?</h3>
<figure>
  <svg viewBox="0 0 640 160" class="dg" role="img" aria-label="A bipartite graph where nodes alternate between two colors with no same-colored nodes adjacent to each other">
    <g class="rough">
      <path class="ln" d="M100,50 L280,50" />
      <path class="ln" d="M100,50 L280,130" />
      <path class="ln" d="M100,130 L280,50" />
    </g>
    <g class="rough">
      <circle class="boxr" cx="100" cy="50" r="24" />
      <circle class="boxr" cx="100" cy="130" r="24" />
      <circle class="boxg" cx="280" cy="50" r="24" />
      <circle class="boxg" cx="280" cy="130" r="24" />
    </g>
    <text class="lbl" x="60" y="20" style="font-size:14px">every red only connects to green — never red-to-red</text>
  </svg>
  <figcaption>Bipartite = every edge crosses between the two groups, never stays within one.</figcaption>
</figure>
<pre><code>function isBipartite(graph) {
  const color = new Array(graph.length).fill(0); <span class="c">// 0=uncolored, 1 or -1 = the two colors</span>

  for (let start = 0; start < graph.length; start++) {
    if (color[start] !== 0) continue;
    color[start] = 1;
    const queue = [start];

    while (queue.length) {
      const node = queue.shift();
      for (const next of graph[node]) {
        if (color[next] === 0) {
          color[next] = -color[node]; <span class="c">// force the opposite color</span>
          queue.push(next);
        } else if (color[next] === color[node]) {
          return false; <span class="c">// a neighbor shares my color — contradiction</span>
        }
      }
    }
  }
  return true;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll BFS while alternating
  colors between each node and its neighbors — if I ever find an edge
  connecting two same-colored nodes, that's a direct proof the graph isn't
  2-colorable, which is exactly what 'not bipartite' means."
</div>

<h3>Recognizing which one an unseen problem wants</h3>
<ul>
  <li>"How many groups/islands/provinces" → connected components</li>
  <li>"Can these all be completed" / "is there a circular dependency" → cycle detection (directed, usually — think course prerequisites)</li>
  <li>"Can you split into two groups with no conflicts" / "is this graph 2-colorable" → bipartite check</li>
  <li>All three reuse the exact same BFS/DFS skeleton from the previous chapter — the only new part is what you track while visiting</li>
</ul>`,
    },
    {
      id: "dsa-backtracking",
      num: "I6",
      title: "Backtracking",
      short: "Backtracking",
      levels: ["intermediate"],
      practice: [
        "ex-subsets-bitmask",
        "ex-permutations",
        "ex-combination-sum",
        "ex-combination-sum-ii",
        "ex-word-search",
        "ex-palindrome-partitioning",
        "ex-letter-combinations-phone",
      ],
      ready: true,
      subtitle: "Try a choice, recurse, undo the choice — DFS over a tree of decisions instead of a graph.",
      body: `<h3>The shape: choose, explore, un-choose</h3>
<p>
  Backtracking is DFS applied to a tree you build as you go — a
  <b>decision tree</b>, where each level represents one choice and each
  root-to-leaf path is one complete candidate answer. The "backtrack" part
  is the un-choose step: after exploring everything a choice leads to, you
  undo it before trying the next option, so the next branch starts from a
  clean slate.
</p>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A decision tree for generating subsets of two elements, showing every branch of include or exclude choices">
    <g class="rough">
      <path class="ln" d="M320,30 L160,90" />
      <path class="lnr" d="M320,30 L480,90" />
      <path class="ln" d="M160,90 L80,150" />
      <path class="lnr" d="M160,90 L240,150" />
      <path class="ln" d="M480,90 L400,150" />
      <path class="lnr" d="M480,90 L560,150" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="30" r="20" />
      <circle class="box" cx="160" cy="90" r="18" />
      <circle class="boxr" cx="480" cy="90" r="18" />
      <circle class="box" cx="80" cy="150" r="16" />
      <circle class="boxr" cx="240" cy="150" r="16" />
      <circle class="box" cx="400" cy="150" r="16" />
      <circle class="boxr" cx="560" cy="150" r="16" />
    </g>
    <text class="sm" x="320" y="35" text-anchor="middle">[]</text>
    <text class="sm" x="205" y="52">skip 1</text>
    <text class="sm rd" x="435" y="60" text-anchor="end">take 1</text>
    <text class="sm" x="80" y="155" text-anchor="middle">[]</text>
    <text class="sm rd" x="240" y="155" text-anchor="middle">[2]</text>
    <text class="sm" x="400" y="155" text-anchor="middle">[1]</text>
    <text class="sm rd" x="560" y="154" text-anchor="middle" style="font-size:11px">[1,2]</text>
    <text class="lbl" x="20" y="200" style="font-size:14px">4 leaves = 4 subsets of {1,2}: [], [2], [1], [1,2]</text>
    <text class="lbl rd" x="20" y="222" style="font-size:14px">every red edge is "include this element" —</text>
    <text class="lbl rd" x="20" y="242" style="font-size:14px">undone (backtracked) after each branch returns</text>
  </svg>
  <figcaption>Each root-to-leaf path is one full answer. Backtracking undoes a choice the moment its subtree is fully explored.</figcaption>
</figure>

<h3>The template every backtracking problem is built from</h3>
<pre><code>function backtrack(path, choices) {
  if (/* path is a complete valid answer */ false) {
    results.push([...path]); <span class="c">// COPY — path keeps mutating after this</span>
    return;
  }

  for (const choice of choices) {
    if (/* choice is invalid right now */ false) continue; <span class="c">// pruning</span>

    path.push(choice);          <span class="c">// 1. choose</span>
    backtrack(path, nextChoices); <span class="c">// 2. explore</span>
    path.pop();                  <span class="c">// 3. un-choose — THE step people forget</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The bug that shows up in almost every first attempt</span>
  <code>results.push(path)</code> pushes a <em>reference</em> to the same
  array you keep mutating — by the time you're done, every entry in
  <code>results</code> points at the same, now-empty array. Always push a
  copy: <code>[...path]</code> or <code>path.slice()</code>.
</div>

<h3>Subsets — include or exclude, every element</h3>
<pre><code>function subsets(nums) {
  const results = [];
  function backtrack(start, path) {
    results.push([...path]); <span class="c">// every path is valid — push at every node, not just leaves</span>
    for (let i = start; i < nums.length; i++) {
      path.push(nums[i]);
      backtrack(i + 1, path); <span class="c">// i + 1, not start + 1 — never reuse an earlier index</span>
      path.pop();
    }
  }
  backtrack(0, []);
  return results;
}</code></pre>

<h3>Permutations — order matters, every element used exactly once</h3>
<pre><code>function permute(nums) {
  const results = [];
  function backtrack(path, used) {
    if (path.length === nums.length) {
      results.push([...path]);
      return;
    }
    for (let i = 0; i < nums.length; i++) {
      if (used[i]) continue; <span class="c">// pruning: skip anything already placed</span>
      used[i] = true;
      path.push(nums[i]);
      backtrack(path, used);
      path.pop();
      used[i] = false; <span class="c">// un-choose</span>
    }
  }
  backtrack([], new Array(nums.length).fill(false));
  return results;
}</code></pre>

<h3>Combinations — like subsets, but with a fixed size</h3>
<pre><code>function combine(n, k) {
  const results = [];
  function backtrack(start, path) {
    if (path.length === k) {
      results.push([...path]);
      return;
    }
    <span class="c">// prune: if not enough numbers remain to reach size k, stop early</span>
    for (let i = start; i <= n - (k - path.length) + 1; i++) {
      path.push(i);
      backtrack(i + 1, path);
      path.pop();
    }
  }
  backtrack(1, []);
  return results;
}</code></pre>
<p class="sub">
  That early-exit condition is real pruning, not just a style choice — it
  cuts off branches that provably can't reach a valid answer before ever
  recursing into them, which is where backtracking gets its practical
  speed despite the worst-case complexity being exponential.
</p>

<h3>Why the complexity looks scary and that's expected</h3>
<table>
  <tr><th>Problem</th><th>Number of leaves</th></tr>
  <tr><td>Subsets of n elements</td><td>2ⁿ — each element is either in or out</td></tr>
  <tr><td>Permutations of n elements</td><td>n! — every ordering</td></tr>
  <tr><td>Combinations, choose k of n</td><td>C(n, k) — bounded, smaller than 2ⁿ</td></tr>
</table>
<p class="sub">
  This isn't a bug to optimize away — it's inherent to "generate every
  valid X." What you <em>can</em> optimize is how much of the tree you
  actually visit, by pruning invalid branches as early as possible (as
  seen in the N-Queens example below) rather than generating a full
  candidate and checking it after the fact.
</p>

<h3>N-Queens — pruning is what makes it tractable</h3>
<pre><code>function solveNQueens(n) {
  const results = [];
  const cols = new Set(), diag1 = new Set(), diag2 = new Set();
  const placement = [];

  function backtrack(row) {
    if (row === n) {
      results.push([...placement]);
      return;
    }
    for (let col = 0; col < n; col++) {
      const d1 = row - col, d2 = row + col;
      if (cols.has(col) || diag1.has(d1) || diag2.has(d2)) continue; <span class="c">// prune — this column/diagonal is under attack</span>

      cols.add(col); diag1.add(d1); diag2.add(d2);
      placement.push(col);

      backtrack(row + 1);

      cols.delete(col); diag1.delete(d1); diag2.delete(d2); <span class="c">// backtrack</span>
      placement.pop();
    }
  }
  backtrack(0);
  return results;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll build the answer one
  choice at a time and prune the moment a partial choice is already
  invalid — checking column and both diagonals in O(1) via sets means I
  never waste time exploring a branch that was doomed from the first bad
  placement."
</div>

<h3>Word Search — backtracking over a grid instead of an array</h3>
<p>
  The same choose/explore/un-choose shape, just with "neighbors in a
  grid" as the branching factor instead of "remaining array elements."
  This combines directly with the grid-traversal ideas from the matrix
  chapter.
</p>
<pre><code>function exist(board, word) {
  const rows = board.length, cols = board[0].length;

  function backtrack(r, c, i) {
    if (i === word.length) return true; <span class="c">// matched every character — done</span>
    if (r < 0 || r >= rows || c < 0 || c >= cols) return false;
    if (board[r][c] !== word[i]) return false;

    const temp = board[r][c];
    board[r][c] = "#"; <span class="c">// mark visited IN PLACE — avoids a separate visited set</span>

    const found =
      backtrack(r + 1, c, i + 1) ||
      backtrack(r - 1, c, i + 1) ||
      backtrack(r, c + 1, i + 1) ||
      backtrack(r, c - 1, i + 1);

    board[r][c] = temp; <span class="c">// UN-CHOOSE — restore before trying a different path</span>
    return found;
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (backtrack(r, c, 0)) return true;
    }
  }
  return false;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Forgetting to restore the cell is the classic bug here</span>
  Marking a cell visited without restoring it afterward means a
  <em>later</em>, unrelated search path can no longer use that cell even
  though it should be free again — silently wrong answers on inputs where
  paths would legitimately cross the same cell from a different starting
  point.
</div>

<h3>Combination Sum — when you're allowed to reuse an element</h3>
<p>
  Unlike <code>combine()</code> earlier, the same number can be picked
  more than once. The fix is a one-character change with a real
  consequence: recurse with <code>i</code>, not <code>i + 1</code>.
</p>
<pre><code>function combinationSum(candidates, target) {
  const results = [];
  function backtrack(start, path, remaining) {
    if (remaining === 0) { results.push([...path]); return; }
    if (remaining < 0) return; <span class="c">// prune — overshot, no point continuing</span>

    for (let i = start; i < candidates.length; i++) {
      path.push(candidates[i]);
      backtrack(i, path, remaining - candidates[i]); <span class="c">// i, not i+1 — this number can be reused</span>
      path.pop();
    }
  }
  backtrack(0, [], target);
  return results;
}</code></pre>
<p class="sub">
  This single index difference (<code>i</code> vs <code>i + 1</code>) is
  worth internalizing as its own decision point: "can this choice repeat?"
  is usually the very first question to answer before writing the loop —
  it changes one character, but changes the whole shape of the search
  space.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"All possible," "every combination," "every way to," "generate all"</li>
  <li>A brute force would need to try every candidate and check validity after the fact — backtracking checks validity <em>during</em> construction and prunes early</li>
  <li>The answer is built incrementally (one element/choice at a time), and a partial answer can be judged "still possibly valid" or "already invalid"</li>
  <li>Grid-based "does a path exist" → Word Search shape; mark-and-restore in place instead of a separate visited set</li>
  <li>"Elements can be reused" → recurse with the same index, not the next one</li>
  <li>If it instead asks for the <em>best</em> single answer rather than <em>all</em> answers, check whether greedy or DP applies first — those are usually faster than exploring the whole tree</li>
</ul>`,
    },
    {
      id: "dsa-dp-1d",
      num: "I7",
      title: "Dynamic programming: 1D",
      short: "DP: 1D",
      levels: ["intermediate"],
      practice: [
        "ex-climbing-stairs",
        "ex-house-robber",
        "ex-house-robber-ii",
        "ex-coin-change",
        "ex-coin-change-ii",
        "ex-longest-increasing-subsequence",
        "ex-word-break",
        "ex-decode-ways",
        "ex-maximum-product-subarray",
        "ex-partition-equal-subset-sum",
      ],
      ready: true,
      subtitle: "Recursion, minus the part where you solve the same subproblem twice.",
      body: `<h3>The problem DP exists to fix, drawn out</h3>
<p>
  Plain recursion on overlapping subproblems redoes the same work
  exponentially many times. Watch <code>fib(5)</code> expand:
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="The recursion tree for fibonacci of 5, showing fibonacci of 3 computed twice and fibonacci of 2 computed three times">
    <g class="rough">
      <path class="ln" d="M320,48 L180,62" />
      <path class="ln" d="M320,48 L460,62" />
      <path class="ln" d="M180,98 L100,112" />
      <path class="lnr" d="M180,98 L260,112" />
      <path class="lnr" d="M460,98 L380,112" />
      <path class="ln" d="M460,98 L540,112" />
      <path class="lnr" d="M100,146 L60,162" />
      <path class="ln" d="M100,146 L140,162" />
      <path class="lnr" d="M380,146 L340,162" />
      <path class="ln" d="M380,146 L420,162" />
    </g>
    <g class="rough">
      <rect class="box" x="280" y="12" width="80" height="36" />
      <rect class="box" x="140" y="62" width="80" height="36" />
      <rect class="box" x="420" y="62" width="80" height="36" />
      <rect class="box" x="65" y="112" width="70" height="34" />
      <rect class="boxr" x="225" y="112" width="70" height="34" />
      <rect class="boxr" x="345" y="112" width="70" height="34" />
      <rect class="box" x="505" y="112" width="70" height="34" />
      <rect class="boxr" x="25" y="162" width="70" height="34" />
      <rect class="box" x="105" y="162" width="70" height="34" />
      <rect class="boxr" x="305" y="162" width="70" height="34" />
      <rect class="box" x="385" y="162" width="70" height="34" />
    </g>
    <text class="sm" x="320" y="35" text-anchor="middle">fib(5)</text>
    <text class="sm" x="180" y="85" text-anchor="middle">fib(4)</text>
    <text class="sm" x="460" y="85" text-anchor="middle">fib(3)</text>
    <text class="sm" x="100" y="134" text-anchor="middle">fib(3)</text>
    <text class="sm rd" x="260" y="134" text-anchor="middle">fib(2)</text>
    <text class="sm rd" x="380" y="134" text-anchor="middle">fib(2)</text>
    <text class="sm" x="540" y="134" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="60" y="184" text-anchor="middle">fib(2)</text>
    <text class="sm" x="140" y="184" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="340" y="184" text-anchor="middle">fib(1)</text>
    <text class="sm" x="420" y="184" text-anchor="middle">fib(0)</text>
    <text class="lbl rd" x="20" y="220" style="font-size:14px">fib(2) is computed 3 separate times, fib(3) twice —</text>
    <text class="lbl rd" x="20" y="240" style="font-size:14px">pure waste, same inputs every time</text>
  </svg>
  <figcaption>Every red node is a repeat of work already done elsewhere in the tree.</figcaption>
</figure>
<p>
  DP is exactly one idea: <b>cache the result of each distinct subproblem
  the first time you compute it, and look it up instead of recomputing it
  every other time</b>. That's it — the rest is just two different ways of
  organizing that cache.
</p>

<h3>Top-down (memoization) — recursion, plus a cache</h3>
<pre><code>function fib(n, memo = new Map()) {
  if (n <= 1) return n;
  if (memo.has(n)) return memo.get(n); <span class="c">// seen this exact input before — reuse it</span>

  const result = fib(n - 1, memo) + fib(n - 2, memo);
  memo.set(n, result);
  return result;
}</code></pre>
<p class="sub">
  This turns the tree above from O(2ⁿ) into O(n) — there are only n
  <em>distinct</em> subproblems (<code>fib(0)</code> through
  <code>fib(n)</code>), and each one is now computed exactly once.
</p>

<h3>Bottom-up (tabulation) — build the table forward, no recursion at all</h3>
<figure>
  <svg viewBox="0 0 640 130" class="dg" role="img" aria-label="A table being filled left to right, each cell computed from the two cells before it">
    <g class="rough">
      <rect class="box" x="20" y="40" width="70" height="50" />
      <rect class="box" x="90" y="40" width="70" height="50" />
      <rect class="box" x="160" y="40" width="70" height="50" />
      <rect class="box" x="230" y="40" width="70" height="50" />
      <rect class="boxg" x="300" y="40" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="70" text-anchor="middle">0</text>
    <text class="sm" x="125" y="70" text-anchor="middle">1</text>
    <text class="sm" x="195" y="70" text-anchor="middle">1</text>
    <text class="sm" x="265" y="70" text-anchor="middle">2</text>
    <text class="sm" x="335" y="70" text-anchor="middle">3</text>
    <path class="lnr" d="M195,30 C 260,15 300,15 335,30" marker-end="url(#dgarrow3)" />
    <path class="lnr" d="M265,30 L335,30" marker-end="url(#dgarrow3)" />
    <defs>
      <marker id="dgarrow3" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="lbl" x="420" y="55" style="font-size:14px">dp[4] = dp[3] + dp[2]</text>
    <text class="sm" x="420" y="80">needs only the last two</text>
  </svg>
  <figcaption>No recursion, no call stack — just an array filled in order, left to right.</figcaption>
</figure>
<pre><code>function fibBottomUp(n) {
  if (n <= 1) return n;
  const dp = new Array(n + 1);
  dp[0] = 0;
  dp[1] = 1;
  for (let i = 2; i <= n; i++) {
    dp[i] = dp[i - 1] + dp[i - 2];
  }
  return dp[n];
}

<span class="c">// space-optimized: fib only ever needs the last 2 values — O(1) space</span>
function fibOptimized(n) {
  if (n <= 1) return n;
  let prev2 = 0, prev1 = 1;
  for (let i = 2; i <= n; i++) {
    [prev2, prev1] = [prev1, prev1 + prev2];
  }
  return prev1;
}</code></pre>
<table>
  <tr><th></th><th>Time</th><th>Space</th><th>Notes</th></tr>
  <tr><td>Naive recursion</td><td>O(2ⁿ)</td><td>O(n) — call stack</td><td>recomputes everything</td></tr>
  <tr><td>Top-down (memo)</td><td>O(n)</td><td>O(n) memo + O(n) stack</td><td>easiest to write from the recursive version</td></tr>
  <tr><td>Bottom-up (table)</td><td>O(n)</td><td>O(n)</td><td>no recursion overhead</td></tr>
  <tr><td>Bottom-up, optimized</td><td>O(n)</td><td>O(1)</td><td>only when each state needs a fixed, small window of previous states</td></tr>
</table>

<h3>The general recipe — the four questions every 1D DP answers</h3>
<ol>
  <li><b>What does <code>dp[i]</code> mean?</b> — state it in one sentence before writing any code. ("dp[i] = the max sum of a subarray ending exactly at i.")</li>
  <li><b>What's the recurrence?</b> — how does <code>dp[i]</code> relate to earlier states?</li>
  <li><b>What's the base case?</b> — the smallest i you can answer directly.</li>
  <li><b>What order do you fill it in?</b> — usually left to right, since <code>dp[i]</code> needs earlier values.</li>
</ol>

<h3>Worked example: House Robber</h3>
<p>
  Can't rob two adjacent houses. At each house, you either skip it
  (carry forward the best so far) or rob it (best from two houses back,
  plus this house's value).
</p>
<pre><code>function rob(nums) {
  let prevSkip = 0, prevTake = 0; <span class="c">// best up to i-2, best up to i-1</span>
  for (const val of nums) {
    const curr = Math.max(prevTake, prevSkip + val); <span class="c">// skip this OR rob this</span>
    prevSkip = prevTake;
    prevTake = curr;
  }
  return prevTake;
}</code></pre>
<p class="sub">
  Notice the state definition again: "best total up to and including
  house i." Once that's pinned down precisely, the recurrence
  (<code>dp[i] = max(dp[i-1], dp[i-2] + nums[i])</code>) falls out
  directly from re-reading the problem statement.
</p>

<h3>Worked example: Longest Increasing Subsequence</h3>
<pre><code><span class="c">// O(n²) — dp[i] = length of the longest increasing subsequence ENDING at i</span>
function lengthOfLIS(nums) {
  const dp = new Array(nums.length).fill(1); <span class="c">// every element alone is a subsequence of length 1</span>
  let best = 1;
  for (let i = 1; i < nums.length; i++) {
    for (let j = 0; j < i; j++) {
      if (nums[j] < nums[i]) dp[i] = Math.max(dp[i], dp[j] + 1);
    }
    best = Math.max(best, dp[i]);
  }
  return best;
}</code></pre>
<p class="sub">
  There's an O(n log n) version worth knowing exists, even if the O(n²)
  is your first answer: maintain an array <code>tails</code> where
  <code>tails[k]</code> is the smallest possible "tail value" of an
  increasing subsequence of length <code>k+1</code>, and binary search
  (from the earlier chapter) for where each new number belongs. The
  length of <code>tails</code> at the end is the answer — a nice example
  of two earlier patterns (DP + binary search) combining.
</p>

<h3>Worked example: Coin Change — minimum coins to make an amount</h3>
<p>
  Given coin denominations and a target amount, find the fewest coins
  that sum to it (or report it's impossible). This is the DP counterpart
  to the greedy "make change" instinct — and greedy provably fails here
  for arbitrary denominations (try amount 6 with coins [1, 3, 4]: greedy
  picks 4+1+1 = 3 coins, but 3+3 = 2 coins is better).
</p>
<pre><code>function coinChange(coins, amount) {
  <span class="c">// dp[a] = fewest coins to make amount a. Infinity = "not yet known to be possible"</span>
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0; <span class="c">// base case: 0 coins needed to make amount 0</span>

  for (let a = 1; a <= amount; a++) {
    for (const coin of coins) {
      if (coin <= a && dp[a - coin] !== Infinity) {
        dp[a] = Math.min(dp[a], dp[a - coin] + 1); <span class="c">// try using one of THIS coin</span>
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Why greedy fails here (and DP doesn't)</span>
  Greedy commits to the biggest coin first and never reconsiders — but
  the best solution can require a <em>smaller</em> coin earlier to leave
  a better-divisible remainder. DP doesn't guess; it tries every coin at
  every amount and keeps whichever choice actually produces the minimum,
  which is exactly the guarantee greedy can't make without a proof.
</div>
<p class="sub">
  Notice the loop order: for each amount, try every coin — this is
  "unbounded" DP (each coin can be reused any number of times), the exact
  same reuse idea as Combination Sum in the backtracking chapter, just
  solved by table-filling instead of exploring a tree.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll define dp[i] as the
  answer restricted to just the first i elements, figure out how dp[i]
  relates to smaller states, then either memoize the recursive version or
  build the table bottom-up — the state definition is the hard part, the
  loop that fills it in is almost mechanical once that's right."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Maximum/minimum/number of ways to…" over a sequence</li>
  <li>A brute-force recursive solution exists, but it's exponential because of repeated subproblems</li>
  <li>The answer at position i can be expressed using answers at earlier positions</li>
  <li>"Fewest/minimum number of coins/steps/jumps to reach X" with reusable choices → unbounded DP, same shape as Coin Change</li>
  <li>If choices interact in only two dimensions (not "a sequence" but "a sequence + a budget," or two sequences compared against each other), that's the cue for 2D DP, next</li>
</ul>`,
    },
    {
      id: "dsa-dp-2d",
      num: "I8",
      title: "Dynamic programming: 2D",
      short: "DP: 2D",
      levels: ["intermediate"],
      practice: [
        "ex-unique-paths",
        "ex-unique-paths-ii",
        "ex-minimum-path-sum",
        "ex-longest-common-subsequence",
        "ex-edit-distance",
      ],
      ready: true,
      subtitle: "Same idea as 1D, one more dimension — a grid table instead of a row.",
      body: `<h3>When one index isn't enough</h3>
<p>
  2D DP shows up whenever the state needs <b>two</b> pieces of changing
  information to describe it — a position in a grid (row, col), two
  strings being compared (index into each), or an item index plus a
  remaining budget. The recipe from the 1D chapter doesn't change: define
  the state, find the recurrence, pick a base case, fill in order. Only
  now the table has two axes.
</p>

<h3>Grid paths — the most visual entry point</h3>
<figure>
  <svg viewBox="0 0 500 260" class="dg" role="img" aria-label="A grid where each cell's value is the sum of the cell above and the cell to the left, showing the number of unique paths to reach it">
    <g class="rough">
      <rect class="box" x="20" y="20" width="70" height="50" />
      <rect class="box" x="90" y="20" width="70" height="50" />
      <rect class="box" x="160" y="20" width="70" height="50" />
      <rect class="box" x="230" y="20" width="70" height="50" />
      <rect class="box" x="20" y="70" width="70" height="50" />
      <rect class="box" x="90" y="70" width="70" height="50" />
      <rect class="box" x="160" y="70" width="70" height="50" />
      <rect class="boxg" x="230" y="70" width="70" height="50" />
      <rect class="box" x="20" y="120" width="70" height="50" />
      <rect class="box" x="90" y="120" width="70" height="50" />
      <rect class="box" x="160" y="120" width="70" height="50" />
      <rect class="box" x="230" y="120" width="70" height="50" />
    </g>
    <text class="sm" x="55" y="50" text-anchor="middle">1</text>
    <text class="sm" x="125" y="50" text-anchor="middle">1</text>
    <text class="sm" x="195" y="50" text-anchor="middle">1</text>
    <text class="sm" x="265" y="50" text-anchor="middle">1</text>
    <text class="sm" x="55" y="100" text-anchor="middle">1</text>
    <text class="sm" x="125" y="100" text-anchor="middle">2</text>
    <text class="sm" x="195" y="100" text-anchor="middle">3</text>
    <text class="sm gr" x="265" y="100" text-anchor="middle">4</text>
    <text class="sm" x="55" y="150" text-anchor="middle">1</text>
    <text class="sm" x="125" y="150" text-anchor="middle">3</text>
    <text class="sm" x="195" y="150" text-anchor="middle">6</text>
    <text class="sm" x="265" y="150" text-anchor="middle">10</text>
    <text class="lbl gr" x="20" y="200" style="font-size:14px">dp[1][3] = dp[0][3] + dp[1][2] = 1 + 3 = 4</text>
    <text class="sm" x="20" y="225">every cell = the cell above + the cell to the left</text>
  </svg>
  <figcaption>Each cell only looks up, and looks left — never anywhere else. That's the whole recurrence.</figcaption>
</figure>
<pre><code><span class="c">// unique paths from top-left to bottom-right, moving only right or down</span>
function uniquePaths(rows, cols) {
  const dp = Array.from({ length: rows }, () => new Array(cols).fill(1)); <span class="c">// first row/col = 1 way</span>

  for (let r = 1; r < rows; r++) {
    for (let c = 1; c < cols; c++) {
      dp[r][c] = dp[r - 1][c] + dp[r][c - 1]; <span class="c">// from above, or from the left</span>
    }
  }
  return dp[rows - 1][cols - 1];
}</code></pre>

<h3>Comparing two strings — the other common shape</h3>
<p>
  Longest Common Subsequence: <code>dp[i][j]</code> = the LCS length using
  the first <code>i</code> characters of one string and the first
  <code>j</code> of the other.
</p>
<figure>
  <svg viewBox="0 0 500 200" class="dg" role="img" aria-label="A diagram of the two branches of the LCS recurrence: characters match, take the diagonal plus one, or characters differ, take the best of skipping one character from either string">
    <g class="rough">
      <rect class="boxg" x="20" y="20" width="220" height="70" rx="6" />
      <rect class="boxy" x="260" y="20" width="220" height="70" rx="6" />
    </g>
    <text class="lbl gr" x="35" y="45" style="font-size:14px">chars match:</text>
    <text class="sm" x="35" y="70">dp[i][j] = dp[i-1][j-1] + 1</text>
    <text class="lbl" x="275" y="45" style="font-size:14px">chars differ:</text>
    <text class="sm" x="275" y="65" style="font-size:11px">dp[i][j] = max(dp[i-1][j],</text>
    <text class="sm" x="275" y="80" style="font-size:11px">dp[i][j-1])</text>
    <text class="sm" x="20" y="130">A match extends the diagonal answer by one. A mismatch means "drop</text>
    <text class="sm" x="20" y="150">one character from either string" and keep whichever result is better.</text>
  </svg>
  <figcaption>Two branches, decided per cell by comparing one character from each string.</figcaption>
</figure>
<pre><code>function longestCommonSubsequence(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1] + 1;
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1]);
      }
    }
  }
  return dp[a.length][b.length];
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Off-by-one is the #1 bug in string DP</span>
  Using a table of size <code>(a.length+1) × (b.length+1)</code> — not
  <code>a.length × b.length</code> — is deliberate: row 0 and column 0
  represent "using zero characters," which is what makes
  <code>dp[i-1][j-1]</code> safe to read even when <code>i</code> or
  <code>j</code> is 1. Skip the padding row/column and you'll be
  constantly special-casing the edges instead.
</div>

<h3>The 0/1 Knapsack shape — item index vs. remaining capacity</h3>
<pre><code><span class="c">// dp[i][w] = best value using the first i items, with capacity w remaining</span>
function knapsack(weights, values, capacity) {
  const n = weights.length;
  const dp = Array.from({ length: n + 1 }, () => new Array(capacity + 1).fill(0));

  for (let i = 1; i <= n; i++) {
    for (let w = 0; w <= capacity; w++) {
      dp[i][w] = dp[i - 1][w]; <span class="c">// option 1: don't take item i</span>
      if (weights[i - 1] <= w) {
        dp[i][w] = Math.max(
          dp[i][w],
          dp[i - 1][w - weights[i - 1]] + values[i - 1] <span class="c">// option 2: take it</span>
        );
      }
    }
  }
  return dp[n][capacity];
}</code></pre>
<p class="sub">
  Every "at most one of each item, maximize value under a budget" problem
  is this exact shape — the two options at each cell (skip it / take it)
  are the same two-branch decision as the LCS match/mismatch above, just
  applied to a different pair of dimensions.
</p>

<h3>Edit Distance — arguably the single most-asked 2D DP question</h3>
<p>
  Minimum number of insert/delete/replace operations to turn one string
  into another. Same LCS-style grid, but now <b>three</b> branches
  instead of two, because a mismatch has three possible fixes.
</p>
<figure>
  <svg viewBox="0 0 640 220" class="dg" role="img" aria-label="Three neighboring cells feeding into the current cell when characters differ: replace from the diagonal, delete from above, insert from the left">
    <g class="rough">
      <rect class="box" x="120" y="20" width="110" height="50" />
      <rect class="box" x="260" y="20" width="110" height="50" />
      <rect class="box" x="120" y="100" width="110" height="50" />
      <rect class="boxg" x="260" y="100" width="110" height="50" />
    </g>
    <path class="ln" d="M195,70 L280,100" marker-end="url(#dgarrow4)" />
    <path class="ln" d="M315,70 L315,100" marker-end="url(#dgarrow4)" />
    <path class="ln" d="M230,125 L260,125" marker-end="url(#dgarrow4)" />
    <defs>
      <marker id="dgarrow4" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
        <path d="M0,0 L6,3 L0,6 Z" fill="currentColor" />
      </marker>
    </defs>
    <text class="sm" x="175" y="50" text-anchor="middle">diagonal</text>
    <text class="sm" x="175" y="68" text-anchor="middle">(replace)</text>
    <text class="sm" x="315" y="50" text-anchor="middle">above</text>
    <text class="sm" x="315" y="68" text-anchor="middle">(delete)</text>
    <text class="sm" x="175" y="130" text-anchor="middle">left</text>
    <text class="sm" x="175" y="148" text-anchor="middle">(insert)</text>
    <text class="lbl gr" x="315" y="122" text-anchor="middle" style="font-size:13px">current cell</text>
    <text class="sm gr" x="315" y="140" text-anchor="middle">= 1 + min(3)</text>
    <text class="lbl" x="20" y="195" style="font-size:14px">on a match, skip the +1 and just copy the diagonal cell</text>
  </svg>
  <figcaption>On a mismatch, take the cheapest of: delete a char (above), insert a char (left), or replace it (diagonal) — plus 1 for that operation.</figcaption>
</figure>
<pre><code>function minDistance(a, b) {
  const dp = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));

  <span class="c">// base cases: turning "" into b (all inserts) or a into "" (all deletes)</span>
  for (let i = 0; i <= a.length; i++) dp[i][0] = i;
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;

  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      if (a[i - 1] === b[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1]; <span class="c">// characters already match — no operation needed</span>
      } else {
        dp[i][j] = 1 + Math.min(
          dp[i - 1][j],     <span class="c">// delete from a</span>
          dp[i][j - 1],     <span class="c">// insert into a</span>
          dp[i - 1][j - 1]  <span class="c">// replace in a</span>
        );
      }
    }
  }
  return dp[a.length][b.length];
}</code></pre>
<p class="sub">
  This is LCS's structure with the mismatch branch upgraded from "pick
  the better of two neighbors" to "pick the best of three, plus a cost of
  1" — once you've internalized LCS, Edit Distance is a small, specific
  variation, not a new problem from scratch.
</p>

<h3>Palindrome DP — a different kind of two-dimensional state</h3>
<p>
  Here both dimensions describe the <em>same</em> string — a start index
  and an end index — rather than two different strings. "Is
  <code>s[i..j]</code> a palindrome?" depends on whether the outer
  characters match <em>and</em> the inside is also a palindrome, which
  means filling the table by increasing substring length, not row by row.
</p>
<pre><code><span class="c">// dp[i][j] = true if s[i..j] (inclusive) is a palindrome</span>
function longestPalindromicSubstring(s) {
  const n = s.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(false));
  let start = 0, maxLen = 1;

  for (let i = 0; i < n; i++) dp[i][i] = true; <span class="c">// every single character is a palindrome</span>

  <span class="c">// fill by SUBSTRING LENGTH, not by row — a length-3 answer needs the length-1 answer inside it already computed</span>
  for (let len = 2; len <= n; len++) {
    for (let i = 0; i <= n - len; i++) {
      const j = i + len - 1;
      if (s[i] !== s[j]) continue;
      dp[i][j] = len === 2 || dp[i + 1][j - 1]; <span class="c">// outer chars match AND inside is a palindrome</span>
      if (dp[i][j] && len > maxLen) { start = i; maxLen = len; }
    }
  }
  return s.slice(start, start + maxLen);
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Fill order matters more here than in any other 2D DP so far</span>
  <code>dp[i][j]</code> depends on <code>dp[i+1][j-1]</code> — a cell
  that's <em>both</em> a higher row index and a lower column index. Row-
  by-row (top to bottom) doesn't guarantee that cell is ready yet. Filling
  by increasing substring length guarantees every shorter (already-needed)
  substring is computed before any longer one that depends on it.
</div>

<h3>Space optimization: do you really need the whole grid?</h3>
<p>
  If <code>dp[i][...]</code> only ever depends on row <code>i-1</code>
  (never row <code>i-2</code> or earlier), you can collapse the table to
  two 1D rows — or even one row updated in place, for knapsack-style
  problems traversed right to left. This turns O(rows × cols) space into
  O(cols), the same "space-optimized" move as the end of the 1D chapter.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll define dp[i][j] as the
  answer using the first i elements of one thing and the first j of
  another, pad the table with a row and column of zeros for the empty
  case, then fill it in row by row — each cell only depends on cells
  already filled, so the fill order is safe."
</div>

<h3>Recognizing 2D over 1D</h3>
<ul>
  <li>Two sequences are being compared against each other (strings, arrays) → likely LCS-shaped</li>
  <li>"Minimum operations to transform one string into another" → Edit Distance's three-branch variant of LCS</li>
  <li>Movement on an actual grid → likely paths-shaped</li>
  <li>One sequence plus a constraint that itself has a range of values (weight, budget, count) → likely knapsack-shaped</li>
  <li>"Is this substring/subsequence a palindrome" → fill by increasing length, not row by row</li>
  <li>If the state needs a third piece of information, you're not stuck — extend to a 3D table (or a map keyed by a tuple) using the exact same recipe</li>
</ul>
<h3>See the table fill</h3>
<p>Watch which cells each new cell reads. On a match it reaches diagonally; otherwise it takes the better of above and left. That dependency pattern is the whole recurrence.</p>

<div class="demo">
  <div class="demo__bar">DP table — longest common subsequence, cell by cell</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="dp-code"></div>
        <div class="loop-bar"><i id="dp-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="dp-prev" type="button">← Back</button>
          <button class="btn" id="dp-next" type="button">Next step →</button>
          <button class="btn" id="dp-play" type="button">Play</button>
          <button class="btn btn--ghost" id="dp-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">

      </div>
    </div>
      <div class="viz"><div class="viz__grid" id="dp-grid"></div></div>
    <p class="demo__note" id="dp-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "dp";
  var CODE = ["for (let i = 1; i <= A.length; i++)","  for (let j = 1; j <= B.length; j++)","    dp[i][j] = A[i-1] === B[j-1]","      ? dp[i-1][j-1] + 1","      : Math.max(dp[i-1][j], dp[i][j-1]);"];
  var STEPS = [{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"LCS of \\"ABCBDAB\\" and \\"BDCABA\\". Row 0 and column 0 are 0 — an empty string shares nothing."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (0) and left (0) = 0."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"D\\" — take the better of above (0) and left (0) = 0."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"0","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"C\\" — take the better of above (0) and left (0) = 0."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[0][3] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (0) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"dep"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"hot"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[0][5] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[1][0] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"D\\" — take the better of above (0) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"C\\" — take the better of above (0) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (1) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[1][4] + 1 = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"hot"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (1) and left (2) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"D\\" — take the better of above (1) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" === \\"C\\" — extend the diagonal: dp[2][2] + 1 = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"C\\" ≠ \\"A\\" — take the better of above (1) and left (2) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[3][0] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"D\\" — take the better of above (1) and left (1) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" ≠ \\"C\\" — take the better of above (2) and left (1) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"hot"},{"v":"0","c":""}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[3][4] + 1 = 3."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"D\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"D\\" === \\"D\\" — extend the diagonal: dp[4][1] + 1 = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"B\\" — take the better of above (1) and left (0) = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"dep"},{"v":"2","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" ≠ \\"D\\" — take the better of above (2) and left (1) = 2."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"dep"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"hot"},{"v":"0","c":""},{"v":"0","c":""}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[5][3] + 1 = 3."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"dep"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"hot"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"A\\" === \\"A\\" — extend the diagonal: dp[5][5] + 1 = 4."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"dep"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"hot"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[6][0] + 1 = 1."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"dep"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"hot"},{"v":"0","c":""}]],"panels":{},"note":"\\"B\\" === \\"B\\" — extend the diagonal: dp[6][4] + 1 = 4."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"dep"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"dep"},{"v":"4","c":"hot"}]],"panels":{},"note":"\\"B\\" ≠ \\"A\\" — take the better of above (4) and left (4) = 4."},{"grid":[[{"v":"","c":"head"},{"v":"∅","c":"head"},{"v":"B","c":"head"},{"v":"D","c":"head"},{"v":"C","c":"head"},{"v":"A","c":"head"},{"v":"B","c":"head"},{"v":"A","c":"head"}],[{"v":"∅","c":"head"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"},{"v":"0","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"0","c":""},{"v":"0","c":""},{"v":"0","c":""},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"C","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"D","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"}],[{"v":"A","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"}],[{"v":"B","c":"head"},{"v":"0","c":"done"},{"v":"1","c":"done"},{"v":"2","c":"done"},{"v":"2","c":"done"},{"v":"3","c":"done"},{"v":"4","c":"done"},{"v":"4","c":"hot"}]],"panels":{},"note":"Bottom-right is the answer: LCS length 4. Every cell was filled once — O(n·m)."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>
`,
    },
    {
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
    },
    {
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
    },
    {
      id: "dsa-bit-manipulation",
      num: "I11",
      title: "Bit manipulation",
      short: "Bit manipulation",
      levels: ["intermediate"],
      practice: [
        "ex-single-number",
        "ex-single-number-three-times",
        "ex-missing-number-xor",
        "ex-hamming-weight",
        "ex-counting-bits",
        "ex-reverse-bits",
        "ex-power-of-two",
        "ex-power-of-four",
        "ex-bitwise-and-of-range",
        "ex-sum-of-two-integers",
        "ex-divide-two-integers",
        "ex-gray-code",
        "ex-utf8-validation",
        "ex-count-triplets-equal-xor",
        "ex-min-flips-a-or-b-equals-c",
        "ex-xor-sum-of-pairwise-and",
        "ex-decode-xored-array",
        "ex-xor-queries-of-a-subarray",
      ],
      ready: true,
      subtitle: "A small, fixed toolkit of tricks that turn up constantly once you recognize them.",
      body: `<h3>The operators, and what they actually do</h3>
<figure>
  <svg viewBox="0 0 640 130" class="dg" role="img" aria-label="Bitwise AND, OR, and XOR truth tables shown as aligned bit rows for the numbers 6 and 3">
    <text class="lbl" x="20" y="20" style="font-size:14px">6 = 110</text>
    <text class="lbl" x="20" y="40" style="font-size:14px">3 = 011</text>
    <text class="sm" x="140" y="30">AND (&amp;): 010 = 2 — 1 only where BOTH have a 1</text>
    <text class="sm" x="140" y="55">OR  (|): 111 = 7 — 1 where EITHER has a 1</text>
    <text class="sm" x="140" y="80">XOR (^): 101 = 5 — 1 where they DIFFER</text>
    <text class="sm" x="140" y="105">NOT (~): flips every bit — ~6 = -7 (two's complement)</text>
  </svg>
  <figcaption>Same two operands, four completely different results depending on the operator.</figcaption>
</figure>
<table>
  <tr><th>Operator</th><th>Symbol</th><th>Common use</th></tr>
  <tr><td>AND</td><td><code>&amp;</code></td><td>check/clear specific bits</td></tr>
  <tr><td>OR</td><td><code>|</code></td><td>set specific bits</td></tr>
  <tr><td>XOR</td><td><code>^</code></td><td>toggle bits, find "the one that's different"</td></tr>
  <tr><td>NOT</td><td><code>~</code></td><td>flip every bit (rarely used alone)</td></tr>
  <tr><td>Left shift</td><td><code>&lt;&lt;</code></td><td>multiply by 2 per shift — <code>x &lt;&lt; 1 === x * 2</code></td></tr>
  <tr><td>Right shift</td><td><code>&gt;&gt;</code></td><td>divide by 2 per shift (rounds toward -∞)</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ JS bitwise ops force numbers to 32-bit signed integers</span>
  <code>2 ** 32 | 0</code> is <code>0</code>, not <code>4294967296</code> —
  every bitwise operator first converts its operands to a 32-bit signed
  int. This is exactly why <code>x | 0</code> is a common (if now
  old-fashioned) "truncate toward zero" trick, and why bit tricks silently
  break on numbers bigger than 32 bits.
</div>

<h3>Trick 1 — XOR cancels itself out</h3>
<p>
  <code>x ^ x === 0</code> and <code>x ^ 0 === x</code>, for any
  <code>x</code>. XOR-ing a whole list together makes every value that
  appears an even number of times vanish, leaving only what's left over.
</p>
<pre><code><span class="c">// find the single number that doesn't appear exactly twice — O(n) time, O(1) space</span>
function singleNumber(nums) {
  let result = 0;
  for (const num of nums) result ^= num; <span class="c">// every pair cancels to 0</span>
  return result; <span class="c">// whatever's left is the unpaired one</span>
}</code></pre>
<p class="sub">
  This is a genuinely elegant O(1)-space answer to a problem that looks
  like it needs a hash set (O(n) space) — worth recognizing "appears an
  even number of times except one" as an XOR tell.
</p>

<h3>Trick 2 — check, set, and clear a specific bit</h3>
<pre><code>function getBit(num, i)   { return (num >> i) & 1; }        <span class="c">// is bit i a 1?</span>
function setBit(num, i)   { return num | (1 << i); }         <span class="c">// force bit i to 1</span>
function clearBit(num, i) { return num & ~(1 << i); }         <span class="c">// force bit i to 0</span>
function toggleBit(num, i){ return num ^ (1 << i); }          <span class="c">// flip bit i</span></code></pre>
<p class="sub">
  <code>1 &lt;&lt; i</code> builds a number that's all zeros except a single
  1 at position <code>i</code> — every one of these four operations is
  just combining that "mask" with the original number using the right
  bitwise operator.
</p>

<h3>Trick 3 — the lowest set bit, and counting set bits</h3>
<pre><code><span class="c">// n & (n - 1) clears the LOWEST set bit — used constantly</span>
function countSetBits(n) {
  let count = 0;
  while (n !== 0) {
    n = n & (n - 1); <span class="c">// each iteration removes exactly one 1-bit</span>
    count++;
  }
  return count; <span class="c">// loop runs once per set bit, not once per bit position — faster than checking all 32</span>
}

<span class="c">// is n a power of 2? a power of 2 has EXACTLY one set bit</span>
function isPowerOfTwo(n) {
  return n > 0 && (n & (n - 1)) === 0;
}</code></pre>
<figure>
  <svg viewBox="0 0 640 100" class="dg" role="img" aria-label="Showing how n and n-1 combined with AND clears exactly the lowest set bit">
    <text class="lbl" x="20" y="25" style="font-size:14px">n     = 0110 1100</text>
    <text class="lbl" x="20" y="50" style="font-size:14px">n - 1 = 0110 1011</text>
    <text class="lbl gr" x="20" y="80" style="font-size:14px">n &amp; (n-1) = 0110 1000 — lowest 1-bit gone</text>
  </svg>
  <figcaption>Subtracting 1 flips every trailing 0 to 1 and the lowest 1 to 0 — ANDing with the original clears just that bit.</figcaption>
</figure>

<h3>Trick 4 — bitmasks as a compact set</h3>
<p>
  For a small, fixed universe of items (say, ≤ 20-30 elements), an integer
  can represent an entire subset — bit <code>i</code> set means "item i is
  in the set." This is the foundation of bitmask DP (advanced tier): a
  whole subset becomes a single number you can use as a state or a Map
  key, instead of an array you'd need to compare element-by-element.
</p>
<pre><code>let mask = 0;
mask |= (1 << 3);        <span class="c">// add item 3 to the set</span>
const has3 = (mask & (1 << 3)) !== 0; <span class="c">// is item 3 in the set?</span>
mask &= ~(1 << 3);        <span class="c">// remove item 3</span></code></pre>

<div class="say">
  <span class="ttl">Say it like this →</span> "Since every value except one
  appears an even number of times, XOR-ing the whole array together
  cancels every paired value to zero and leaves exactly the unpaired one
  — O(n) time, O(1) space, no hash set needed."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Without using extra space," combined with numbers that appear in pairs → XOR</li>
  <li>"Count sallow bits," "power of two," "single bit differs" → the set-bit tricks above</li>
  <li>A small fixed number of items/states (≤ ~20) where you need to represent "which subset" compactly → bitmask</li>
  <li>Multiplying/dividing by exact powers of 2 in a performance-sensitive inner loop → shifts, though modern engines often optimize this automatically</li>
</ul>`,
    },
    {
      id: "dsa-matrix-problems",
      num: "I12",
      title: "Matrix problems",
      short: "Matrix problems",
      levels: ["intermediate"],
      practice: ["ex-spiral-matrix", "ex-rotate-image", "ex-set-matrix-zeroes", "ex-search-2d-matrix-ii"],
      ready: true,
      subtitle: "A grid is an array of arrays — every trick here is index bookkeeping, done carefully.",
      body: `<h3>Traversal direction — the pattern behind spiral order</h3>
<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A grid with numbers showing the order cells are visited in a spiral, starting from the top-left and winding inward">
    <g class="rough">
      <rect class="box" x="20" y="20" width="80" height="50" />
      <rect class="box" x="100" y="20" width="80" height="50" />
      <rect class="box" x="180" y="20" width="80" height="50" />
      <rect class="box" x="260" y="20" width="80" height="50" />
      <rect class="box" x="20" y="70" width="80" height="50" />
      <rect class="boxg" x="100" y="70" width="80" height="50" />
      <rect class="boxg" x="180" y="70" width="80" height="50" />
      <rect class="box" x="260" y="70" width="80" height="50" />
      <rect class="box" x="20" y="120" width="80" height="50" />
      <rect class="box" x="100" y="120" width="80" height="50" />
      <rect class="box" x="180" y="120" width="80" height="50" />
      <rect class="box" x="260" y="120" width="80" height="50" />
    </g>
    <text class="sm" x="60" y="50" text-anchor="middle">1</text>
    <text class="sm" x="140" y="50" text-anchor="middle">2</text>
    <text class="sm" x="220" y="50" text-anchor="middle">3</text>
    <text class="sm" x="300" y="50" text-anchor="middle">4</text>
    <text class="sm" x="60" y="100" text-anchor="middle">10</text>
    <text class="sm gr" x="140" y="100" text-anchor="middle">11</text>
    <text class="sm gr" x="220" y="100" text-anchor="middle">12</text>
    <text class="sm" x="300" y="100" text-anchor="middle">5</text>
    <text class="sm" x="60" y="150" text-anchor="middle">9</text>
    <text class="sm" x="140" y="150" text-anchor="middle">8</text>
    <text class="sm" x="220" y="150" text-anchor="middle">7</text>
    <text class="sm" x="300" y="150" text-anchor="middle">6</text>
    <text class="lbl" x="20" y="220" style="font-size:14px">right along the top → down the right side →</text>
    <text class="lbl" x="20" y="245" style="font-size:14px">left along the bottom → up the left side → shrink boundary, repeat</text>
  </svg>
  <figcaption>Four boundaries (top/right/bottom/left) that shrink inward after each full loop.</figcaption>
</figure>
<pre><code>function spiralOrder(matrix) {
  const result = [];
  let top = 0, bottom = matrix.length - 1;
  let left = 0, right = matrix[0].length - 1;

  while (top <= bottom && left <= right) {
    for (let c = left; c <= right; c++) result.push(matrix[top][c]);
    top++;
    for (let r = top; r <= bottom; r++) result.push(matrix[r][right]);
    right--;
    if (top <= bottom) { <span class="c">// guard: this row may already be consumed</span>
      for (let c = right; c >= left; c--) result.push(matrix[bottom][c]);
      bottom--;
    }
    if (left <= right) { <span class="c">// guard: this column may already be consumed</span>
      for (let r = bottom; r >= top; r--) result.push(matrix[r][left]);
      left++;
    }
  }
  return result;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The two guards aren't optional</span>
  On a non-square matrix (e.g. a single row, or a single column), skipping
  the <code>if (top &lt;= bottom)</code> / <code>if (left &lt;= right)</code>
  checks re-visits cells that the earlier two loops already covered —
  this is the single most common bug in spiral-order implementations.
</div>

<h3>In-place rotation — 90° with no extra matrix</h3>
<p>
  Rotating 90° clockwise decomposes into two simpler, well-known
  operations: transpose (flip across the diagonal), then reverse each row.
</p>
<figure>
  <svg viewBox="0 0 640 150" class="dg" role="img" aria-label="A 3 by 3 grid being transposed across its diagonal, then each row reversed, resulting in a 90 degree clockwise rotation">
    <g class="rough">
      <rect class="box" x="20" y="20" width="40" height="30" /><rect class="box" x="60" y="20" width="40" height="30" /><rect class="box" x="100" y="20" width="40" height="30" />
      <rect class="box" x="20" y="50" width="40" height="30" /><rect class="box" x="60" y="50" width="40" height="30" /><rect class="box" x="100" y="50" width="40" height="30" />
      <rect class="box" x="20" y="80" width="40" height="30" /><rect class="box" x="60" y="80" width="40" height="30" /><rect class="box" x="100" y="80" width="40" height="30" />
    </g>
    <text class="sm" x="40" y="40" text-anchor="middle">1</text><text class="sm" x="80" y="40" text-anchor="middle">2</text><text class="sm" x="120" y="40" text-anchor="middle">3</text>
    <text class="sm" x="40" y="70" text-anchor="middle">4</text><text class="sm" x="80" y="70" text-anchor="middle">5</text><text class="sm" x="120" y="70" text-anchor="middle">6</text>
    <text class="sm" x="40" y="100" text-anchor="middle">7</text><text class="sm" x="80" y="100" text-anchor="middle">8</text><text class="sm" x="120" y="100" text-anchor="middle">9</text>
    <text class="lbl" x="180" y="65" style="font-size:14px">transpose →</text>
    <g class="rough">
      <rect class="box" x="260" y="20" width="40" height="30" /><rect class="box" x="300" y="20" width="40" height="30" /><rect class="box" x="340" y="20" width="40" height="30" />
      <rect class="box" x="260" y="50" width="40" height="30" /><rect class="box" x="300" y="50" width="40" height="30" /><rect class="box" x="340" y="50" width="40" height="30" />
      <rect class="box" x="260" y="80" width="40" height="30" /><rect class="box" x="300" y="80" width="40" height="30" /><rect class="box" x="340" y="80" width="40" height="30" />
    </g>
    <text class="sm" x="280" y="40" text-anchor="middle">1</text><text class="sm" x="320" y="40" text-anchor="middle">4</text><text class="sm" x="360" y="40" text-anchor="middle">7</text>
    <text class="sm" x="280" y="70" text-anchor="middle">2</text><text class="sm" x="320" y="70" text-anchor="middle">5</text><text class="sm" x="360" y="70" text-anchor="middle">8</text>
    <text class="sm" x="280" y="100" text-anchor="middle">3</text><text class="sm" x="320" y="100" text-anchor="middle">6</text><text class="sm" x="360" y="100" text-anchor="middle">9</text>
    <text class="lbl" x="405" y="45" style="font-size:13px">reverse</text>
    <text class="lbl" x="405" y="62" style="font-size:13px">rows →</text>
    <g class="rough">
      <rect class="boxg" x="500" y="20" width="40" height="30" /><rect class="boxg" x="540" y="20" width="40" height="30" /><rect class="boxg" x="580" y="20" width="40" height="30" />
      <rect class="boxg" x="500" y="50" width="40" height="30" /><rect class="boxg" x="540" y="50" width="40" height="30" /><rect class="boxg" x="580" y="50" width="40" height="30" />
      <rect class="boxg" x="500" y="80" width="40" height="30" /><rect class="boxg" x="540" y="80" width="40" height="30" /><rect class="boxg" x="580" y="80" width="40" height="30" />
    </g>
    <text class="sm" x="520" y="40" text-anchor="middle">7</text><text class="sm" x="560" y="40" text-anchor="middle">4</text><text class="sm" x="600" y="40" text-anchor="middle">1</text>
    <text class="sm" x="520" y="70" text-anchor="middle">8</text><text class="sm" x="560" y="70" text-anchor="middle">5</text><text class="sm" x="600" y="70" text-anchor="middle">2</text>
    <text class="sm" x="520" y="100" text-anchor="middle">9</text><text class="sm" x="560" y="100" text-anchor="middle">6</text><text class="sm" x="600" y="100" text-anchor="middle">3</text>
  </svg>
  <figcaption>Two well-understood O(n²) passes compose into a correct 90° clockwise rotation, in place.</figcaption>
</figure>
<pre><code>function rotate(matrix) {
  const n = matrix.length;

  <span class="c">// transpose: swap matrix[r][c] with matrix[c][r]</span>
  for (let r = 0; r < n; r++) {
    for (let c = r + 1; c < n; c++) { <span class="c">// c starts at r+1 — never touch the diagonal or repeat a swap</span>
      [matrix[r][c], matrix[c][r]] = [matrix[c][r], matrix[r][c]];
    }
  }

  <span class="c">// reverse each row</span>
  for (const row of matrix) row.reverse();
}</code></pre>

<h3>Grid as a graph — search patterns from the graph chapter, reused</h3>
<p>
  Any grid problem involving "connected region," "flood fill," or
  "shortest path between cells" is the graph-traversal chapters applied
  directly: each cell is a node, each of its up-to-4 orthogonal neighbors
  is an edge.
</p>
<pre><code>function numIslands(grid) {
  const rows = grid.length, cols = grid[0].length;
  let islands = 0;

  function sink(r, c) {
    if (r < 0 || r >= rows || c < 0 || c >= cols || grid[r][c] !== "1") return;
    grid[r][c] = "0"; <span class="c">// mark visited by mutating the grid — avoids a separate visited set</span>
    sink(r + 1, c); sink(r - 1, c); sink(r, c + 1); sink(r, c - 1);
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      if (grid[r][c] === "1") {
        islands++;
        sink(r, c); <span class="c">// flood-fill the whole island so it's never counted twice</span>
      }
    }
  }
  return islands;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll treat each cell as a
  graph node with up to four neighbors and reuse a flood-fill DFS — this
  is the exact same connected-components idea from the graph chapter, just
  with grid coordinates standing in for an adjacency list."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Spiral," "rotate," "transpose," "diagonal" → boundary/index bookkeeping, work out the pattern on paper first</li>
  <li>"Islands," "regions," "flood fill," "shortest path in a grid" → it's a graph problem wearing a grid costume</li>
  <li>In-place mutation requested → look for a decomposition into two or more simpler, already-known transformations (like rotate = transpose + reverse)</li>
  <li>Always double-check boundary conditions on non-square grids — single row/column inputs break naive boundary logic first</li>
</ul>`,
    },

    {
      id: "dsa-advanced-dp",
      num: "A1",
      title: "Advanced DP",
      short: "Advanced DP",
      levels: ["advanced"],
      practice: [
        "ex-travelling-salesman-bitmask",
        "ex-partition-k-equal-sum-subsets",
        "ex-count-strictly-increasing-digits",
        "ex-burst-balloons",
        "ex-minimum-cost-to-cut-a-stick",
        "ex-house-robber-iii",
      ],
      ready: true,
      subtitle: 'Once you can design the state, every "impossible" DP is just a normal DP over a stranger index.',
      body: `<h3>Advanced DP is not harder recursion — it's harder state design</h3>
<p>
  In the 1D and 2D chapters the state was handed to you: <code>dp[i]</code>
  "best answer using the first i items," <code>dp[i][j]</code> "best answer
  for prefixes i and j." Advanced DP is the same machine — overlapping
  subproblems, memoize, iterate in dependency order — but you have to
  <em>invent</em> the index. The four shapes below cover almost every
  advanced DP asked in interviews, and each one is defined entirely by what
  it uses as the state: a <b>subset</b> (bitmask), a <b>subtree</b> (tree
  DP), a <b>prefix of the digits of a number</b> (digit DP), or a
  <b>contiguous range</b> (interval DP).
</p>

<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="Four boxes showing the four advanced dynamic programming state types: a bitmask subset, a subtree, a digit prefix, and an interval, each labelled with its state signature">
    <g class="rough">
      <rect class="box" x="20" y="40" width="130" height="70" rx="6" />
      <rect class="boxg" x="180" y="40" width="130" height="70" rx="6" />
      <rect class="boxy" x="340" y="40" width="130" height="70" rx="6" />
      <rect class="boxr" x="500" y="40" width="120" height="70" rx="6" />
    </g>
    <text class="lbl" x="85" y="68" text-anchor="middle" style="font-size:15px">bitmask</text>
    <text class="sm" x="85" y="90" text-anchor="middle">dp[mask][last]</text>
    <text class="lbl" x="245" y="68" text-anchor="middle" style="font-size:15px">tree</text>
    <text class="sm" x="245" y="90" text-anchor="middle">dp[node][took?]</text>
    <text class="lbl" x="405" y="68" text-anchor="middle" style="font-size:15px">digit</text>
    <text class="sm" x="405" y="90" text-anchor="middle">dp[pos][tight]</text>
    <text class="lbl" x="560" y="68" text-anchor="middle" style="font-size:15px">interval</text>
    <text class="sm" x="560" y="90" text-anchor="middle">dp[l][r]</text>
    <text class="lbl" x="20" y="150" style="font-size:15px">the state answers: "what does the rest of the problem still need to know?"</text>
    <text class="sm" x="20" y="178">bitmask → which items are already used · tree → the whole subtree is summarized in a few numbers</text>
    <text class="sm" x="20" y="200">digit → how much freedom the remaining digits have · interval → this range is solved independently</text>
    <text class="sm rd" x="20" y="224">if two different paths reach the same state, they are interchangeable from here on — that is the whole test</text>
  </svg>
  <figcaption>Every one of these is the same DP; only the shape of the index changes. Pick the smallest state that still makes future decisions independent of how you arrived.</figcaption>
</figure>

<h3>Bitmask DP: an integer <em>is</em> the visited-set</h3>
<p>
  When n is small (typically n ≤ 20) and the subproblem depends on
  <em>which</em> subset of items you've used — not just how many — encode
  the subset as the bits of a single integer. Bit <code>i</code> set means
  "item i is used." That gives you 2<sup>n</sup> states you can index into
  an array directly, which is far cheaper than hashing a Set.
</p>
<table>
  <tr><th>Operation</th><th>Code</th><th>Meaning</th></tr>
  <tr><td>Is item i in the set?</td><td><code>(mask >> i) & 1</code></td><td>test bit i</td></tr>
  <tr><td>Add item i</td><td><code>mask | (1 << i)</code></td><td>set bit i</td></tr>
  <tr><td>Remove item i</td><td><code>mask & ~(1 << i)</code></td><td>clear bit i</td></tr>
  <tr><td>Full set of n items</td><td><code>(1 << n) - 1</code></td><td>n low bits set</td></tr>
  <tr><td>Iterate submasks of mask</td><td><code>for (let s = mask; s; s = (s - 1) & mask)</code></td><td>every subset of mask, 3<sup>n</sup> total</td></tr>
</table>
<p class="sub">
  The bit-manipulation chapter covered these operators; the new idea here is
  purely that <code>mask</code> is a legal <em>array index</em>. That is what
  turns an exponential search over subsets into a DP over 2<sup>n</sup> cells.
</p>

<div class="sticky mint">
  <span class="ttl">The ordering trick that makes bitmask DP easy</span>
  Adding an element to a subset always makes the integer <em>larger</em>
  (you set a bit that was 0). So a plain <code>for (let mask = 0; mask &lt; 1 &lt;&lt; n; mask++)</code>
  is already a valid topological order — every state you read from has a
  smaller numeric value than the state you're writing. You never need an
  explicit dependency sort.
</div>

<h3>Traveling Salesman — the canonical bitmask DP</h3>
<p>
  "Visit every city exactly once and return to the start, minimizing total
  distance." Brute force is n! orderings. The DP insight: once you know
  <em>which</em> cities are visited and <em>which one you're standing on</em>,
  the cheapest completion doesn't depend on the order you visited them in.
  That collapses n! paths into 2<sup>n</sup> × n states.
</p>
<pre><code><span class="c">// dist[i][j] = cost of edge i→j. Returns min cost of a tour starting and ending at 0.</span>
<span class="c">// Time O(2^n · n^2), space O(2^n · n) — practical to about n = 18-20.</span>
function tsp(dist) {
  const n = dist.length;
  const FULL = (1 << n) - 1;

  <span class="c">// dp[mask][last] = cheapest way to have visited exactly the set "mask", standing on "last"</span>
  const dp = Array.from({ length: 1 << n }, () => new Array(n).fill(Infinity));
  dp[1][0] = 0; <span class="c">// only city 0 visited, standing on city 0, cost 0</span>

  for (let mask = 1; mask &lt;= FULL; mask++) {
    if ((mask & 1) === 0) continue; <span class="c">// every tour includes the start city</span>

    for (let last = 0; last &lt; n; last++) {
      const cur = dp[mask][last];
      if (cur === Infinity) continue;        <span class="c">// unreachable state — skip, don't propagate Infinity</span>
      if (((mask >> last) & 1) === 0) continue; <span class="c">// "last" must actually be in the visited set</span>

      for (let next = 0; next &lt; n; next++) {
        if ((mask >> next) & 1) continue;    <span class="c">// already visited</span>
        const nextMask = mask | (1 << next);
        const cost = cur + dist[last][next];
        if (cost &lt; dp[nextMask][next]) dp[nextMask][next] = cost;
      }
    }
  }

  let best = Infinity;
  for (let last = 1; last &lt; n; last++) {
    best = Math.min(best, dp[FULL][last] + dist[last][0]); <span class="c">// close the loop back to 0</span>
  }
  return best;
}</code></pre>
<p class="sub">
  Two variants come up constantly. Drop the final <code>+ dist[last][0]</code>
  and you get the shortest Hamiltonian <em>path</em> ("Shortest Path Visiting
  All Nodes"). Replace <code>Math.min</code> with a sum and you're
  <em>counting</em> orderings instead of optimizing them — same states, same
  loops, different combiner.
</p>

<div class="warn">
  <span class="ttl">⚠ 1 &lt;&lt; n overflows the trick, not the language</span>
  JavaScript's bitwise operators coerce to <b>32-bit signed</b> integers, so
  <code>1 &lt;&lt; 31</code> is negative and <code>1 &lt;&lt; 32</code> is
  <code>1</code>, silently. That's fine for n ≤ 30, but it's also a hard
  ceiling worth stating out loud: bitmask DP is for n ≤ ~20 anyway, because
  2<sup>20</sup> × 20 is already 20M cells. If an interviewer gives you n = 40,
  bitmask is the wrong tool — look for meet-in-the-middle instead.
</div>

<h3>Bitmask DP without a "last" dimension — the assignment problem</h3>
<p>
  Not every bitmask DP needs a second dimension. If the k-th decision is
  always "assign worker k," then the number of bits already set
  <em>tells you</em> which worker you're on — the popcount is a free index,
  so the state collapses to a single 1D array of size 2<sup>n</sup>.
</p>
<pre><code><span class="c">// cost[w][j] = cost of giving job j to worker w. Assign every worker exactly one job.</span>
function minAssignmentCost(cost) {
  const n = cost.length;
  const FULL = (1 << n) - 1;
  const dp = new Array(1 << n).fill(Infinity);
  dp[0] = 0;

  for (let mask = 0; mask &lt; FULL; mask++) {
    if (dp[mask] === Infinity) continue;
    const worker = popcount(mask); <span class="c">// jobs assigned so far === index of the next worker</span>

    for (let job = 0; job &lt; n; job++) {
      if ((mask >> job) & 1) continue;
      const nextMask = mask | (1 << job);
      const cost2 = dp[mask] + cost[worker][job];
      if (cost2 &lt; dp[nextMask]) dp[nextMask] = cost2;
    }
  }
  return dp[FULL];
}

function popcount(x) {
  let c = 0;
  while (x) { x &= x - 1; c++; } <span class="c">// x &= x-1 clears the lowest set bit</span>
  return c;
}</code></pre>
<p class="sub">
  Recognizing that a dimension is <em>derivable</em> from the mask is a real
  optimization, not cosmetics: it takes the table from O(2<sup>n</sup>·n) to
  O(2<sup>n</sup>) memory. Say it out loud when you spot it.
</p>

<h3>DP on trees: the subtree is the subproblem</h3>
<p>
  On a tree there are no cycles, so a post-order DFS visits every subproblem
  exactly once — you don't even need a memo table, the recursion tree
  <em>is</em> the DP table. The whole design question is: <b>what summary of a
  subtree does the parent need?</b> Usually it's a small tuple, and the
  classic shape is a pair: "best if I take this node" and "best if I don't."
</p>
<pre><code><span class="c">// House Robber III — can't rob a node and its child. Returns max loot.</span>
function rob(root) {
  <span class="c">// returns [bestIfWeRobThisNode, bestIfWeSkipThisNode]</span>
  function dfs(node) {
    if (!node) return [0, 0];

    const [leftRob, leftSkip] = dfs(node.left);
    const [rightRob, rightSkip] = dfs(node.right);

    const robHere = node.val + leftSkip + rightSkip;  <span class="c">// children must be skipped</span>
    const skipHere = Math.max(leftRob, leftSkip) + Math.max(rightRob, rightSkip); <span class="c">// children are free</span>

    return [robHere, skipHere];
  }
  const [a, b] = dfs(root);
  return Math.max(a, b);
}</code></pre>
<p class="sub">
  Note <code>skipHere</code> takes the max of each child independently — a
  common wrong version writes <code>leftSkip + rightSkip</code>, quietly
  forbidding grandchildren from being robbed. The pair-return shape makes
  that mistake visible because each slot has a stated meaning.
</p>

<h3>The two-value trick: what you return upward ≠ what you record</h3>
<p>
  Diameter and "maximum path sum" share one subtle idea that trips people up:
  the best answer <em>through</em> a node (using both children) is not a value
  the parent can use, because a parent can only extend a path that goes
  <em>straight down</em> one side. So you record the two-sided value in an
  outer variable and return the one-sided value.
</p>
<pre><code><span class="c">// Binary Tree Maximum Path Sum — path may start and end anywhere, values may be negative.</span>
function maxPathSum(root) {
  let best = -Infinity;

  <span class="c">// returns the best DOWNWARD path sum starting at this node (usable by the parent)</span>
  function gain(node) {
    if (!node) return 0;

    const left = Math.max(gain(node.left), 0);   <span class="c">// clamp at 0: a negative branch is never worth taking</span>
    const right = Math.max(gain(node.right), 0);

    best = Math.max(best, node.val + left + right); <span class="c">// record the path that TURNS here — two-sided</span>

    return node.val + Math.max(left, right);        <span class="c">// return the path that CONTINUES up — one-sided</span>
  }

  gain(root);
  return best;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Returning the two-sided value is the bug that passes small tests</span>
  If <code>gain</code> returned <code>node.val + left + right</code>, the
  parent would splice in a path that already bends — producing a "path" that
  visits a node twice. It happens to give the right answer on tiny symmetric
  trees, which is exactly why it survives your hand-check and dies on the
  hidden tests. Diameter (<code>best = max(best, left + right)</code>, return
  <code>1 + max(left, right)</code>) is the same skeleton with edge counts.
</div>
<div class="warn">
  <span class="ttl">⚠ Recursion depth on a 10<sup>5</sup>-node skewed tree</span>
  Tree DP recurses to the tree's height. A degenerate (linked-list-shaped)
  tree or a general graph-as-tree with 10<sup>5</sup> nodes will overflow the
  JS call stack. If constraints hint at that, do an explicit iterative
  post-order: push nodes in DFS order into an array, then process that array
  in reverse — every child is finished before its parent.
</div>

<h3>Digit DP: counting numbers up to N with a property</h3>
<p>
  "How many integers in [1, N] have no two adjacent equal digits?" with N up
  to 10<sup>18</sup>. You cannot loop to N. Instead, build the number one
  digit at a time from the most significant end and count completions. Two
  bookkeeping flags carry all the difficulty:
</p>
<ul>
  <li><b>tight</b> — every digit so far matched N's prefix exactly, so this
  position is capped at N's digit. Once you place something smaller, you're
  free (<code>tight</code> becomes false) and all remaining positions allow 0-9.</li>
  <li><b>started</b> — you've placed a nonzero digit. Before that you're in
  leading zeros, which must not count as digits (otherwise "07" looks like it
  has an adjacent-pair rule applied to a zero that isn't there).</li>
</ul>
<pre><code><span class="c">// Count integers in [1, N] with no two adjacent equal digits.</span>
function countNoAdjacentRepeats(N) {
  const digits = String(N).split("").map(Number);
  const n = digits.length;
  const memo = new Map();

  function go(pos, prev, tight, started) {
    if (pos === n) return started ? 1 : 0; <span class="c">// the all-zeros path is the number 0 — don't count it</span>

    <span class="c">// Only memoize the FREE states: a tight state is visited at most once per position anyway,</span>
    <span class="c">// and its count depends on N's digits, so caching it would be wrong to reuse.</span>
    const key = pos * 100 + (prev + 1) * 2 + (started ? 1 : 0);
    if (!tight && memo.has(key)) return memo.get(key);

    const limit = tight ? digits[pos] : 9;
    let total = 0;

    for (let d = 0; d &lt;= limit; d++) {
      if (started && d === prev) continue; <span class="c">// the actual property being enforced</span>
      total += go(
        pos + 1,
        d,
        tight && d === limit,      <span class="c">// stay tight only if we matched N's digit exactly</span>
        started || d > 0
      );
    }

    if (!tight) memo.set(key, total);
    return total;
  }

  return go(0, -1, true, false);
}</code></pre>
<p class="sub">
  Complexity is O(positions × states-per-position × 10) — here 19 × 20 × 10,
  a few thousand operations for N = 10<sup>18</sup>. To count in a range
  <code>[L, R]</code>, compute <code>f(R) - f(L - 1)</code>; that subtraction
  is the standard closing move and interviewers expect you to name it.
</p>
<div class="warn">
  <span class="ttl">⚠ Memoizing tight states is the classic digit-DP bug</span>
  A tight state's answer is a function of N's remaining digits, not just
  <code>(pos, prev)</code>. Cache it and a later, non-tight visit to the same
  <code>(pos, prev)</code> reads a value that was capped by N — an undercount
  that only shows on some inputs. The guard is one condition:
  <code>if (!tight)</code> on both read and write.
</div>

<h3>Interval DP: solve short ranges first, and pick the <em>last</em> move</h3>
<p>
  When the answer for <code>[l, r]</code> is built from answers for strictly
  shorter ranges inside it, iterate by <b>increasing length</b>, not by index.
  The design trick that makes these problems click is choosing the right
  split point semantics: for matrix chain multiplication you pick the last
  multiplication; for Burst Balloons you pick the <em>last balloon to pop</em>,
  because that's the only choice under which the two sides become independent.
</p>

<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="A triangular table showing interval DP filled by increasing range length, with length-one cells on the bottom row and the full range at the top">
    <g class="rough">
      <rect class="box" x="40" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="130" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="220" y="140" width="70" height="40" rx="4" />
      <rect class="box" x="310" y="140" width="70" height="40" rx="4" />
      <rect class="boxy" x="85" y="90" width="70" height="40" rx="4" />
      <rect class="boxy" x="175" y="90" width="70" height="40" rx="4" />
      <rect class="boxy" x="265" y="90" width="70" height="40" rx="4" />
      <rect class="boxg" x="130" y="40" width="70" height="40" rx="4" />
      <rect class="boxg" x="220" y="40" width="70" height="40" rx="4" />
    </g>
    <text class="sm" x="75" y="165" text-anchor="middle">[0,0]</text>
    <text class="sm" x="165" y="165" text-anchor="middle">[1,1]</text>
    <text class="sm" x="255" y="165" text-anchor="middle">[2,2]</text>
    <text class="sm" x="345" y="165" text-anchor="middle">[3,3]</text>
    <text class="sm" x="120" y="115" text-anchor="middle">[0,1]</text>
    <text class="sm" x="210" y="115" text-anchor="middle">[1,2]</text>
    <text class="sm" x="300" y="115" text-anchor="middle">[2,3]</text>
    <text class="sm" x="165" y="65" text-anchor="middle">[0,2]</text>
    <text class="sm" x="255" y="65" text-anchor="middle">[1,3]</text>
    <text class="lbl" x="410" y="160" style="font-size:15px">length 1 — base cases</text>
    <text class="lbl" x="410" y="112" style="font-size:15px">length 2 — needs length 1</text>
    <text class="lbl gr" x="410" y="62" style="font-size:15px">length 3 — needs 1 and 2</text>
    <text class="sm rd" x="40" y="30">outer loop is LENGTH, not index — that is the whole ordering rule</text>
  </svg>
  <figcaption>Every cell only reads cells strictly below it, so filling by increasing length guarantees dependencies are ready.</figcaption>
</figure>

<pre><code><span class="c">// Burst Balloons: popping balloon i earns nums[left] * nums[i] * nums[right],</span>
<span class="c">// where left/right are its CURRENT neighbours. Maximize total coins. O(n^3).</span>
function maxCoins(nums) {
  const a = [1, ...nums, 1]; <span class="c">// sentinel 1s so edge balloons have neighbours</span>
  const n = a.length;
  const dp = Array.from({ length: n }, () => new Array(n).fill(0));

  <span class="c">// dp[l][r] = best coins from bursting everything strictly between l and r,</span>
  <span class="c">// with l and r themselves still standing (that's what makes the halves independent)</span>
  for (let len = 2; len &lt; n; len++) {          <span class="c">// len = distance between the exclusive bounds</span>
    for (let l = 0; l + len &lt; n; l++) {
      const r = l + len;
      for (let k = l + 1; k &lt; r; k++) {        <span class="c">// k = the LAST balloon burst in (l, r)</span>
        const coins = dp[l][k] + a[l] * a[k] * a[r] + dp[k][r];
        if (coins > dp[l][r]) dp[l][r] = coins;
      }
    }
  }
  return dp[0][n - 1];
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "If I pick the balloon I burst
  <em>first</em>, the two halves aren't independent — the left half's final
  neighbour depends on what's left of the right half. So I invert it and let
  k be the <em>last</em> balloon in the range: at that moment its neighbours
  are exactly the untouched boundaries l and r, and the two sides never
  interact. That's what makes it a clean O(n³) interval DP."
</div>

<p>
  A second interval problem, to show the shape isn't always a 2D answer
  table: <b>palindrome partitioning with minimum cuts</b>. Here the range
  structure only shows up in a precomputed palindrome table; the answer
  itself is a 1D DP over prefixes. Recognizing that split keeps this O(n²)
  instead of O(n³).
</p>
<pre><code><span class="c">// Minimum cuts so every piece of s is a palindrome. O(n^2) time and space.</span>
function minCut(s) {
  const n = s.length;
  if (n &lt;= 1) return 0;

  const pal = Array.from({ length: n }, () => new Array(n).fill(false));
  for (let i = n - 1; i >= 0; i--) {          <span class="c">// i descending so pal[i+1][j-1] is already known</span>
    for (let j = i; j &lt; n; j++) {
      if (s[i] === s[j] && (j - i &lt; 2 || pal[i + 1][j - 1])) pal[i][j] = true;
    }
  }

  const cuts = new Array(n).fill(0);
  for (let j = 0; j &lt; n; j++) {
    if (pal[0][j]) { cuts[j] = 0; continue; } <span class="c">// whole prefix is already a palindrome — zero cuts</span>
    let best = Infinity;
    for (let i = 1; i &lt;= j; i++) {
      if (pal[i][j]) best = Math.min(best, cuts[i - 1] + 1); <span class="c">// cut before i</span>
    }
    cuts[j] = best;
  }
  return cuts[n - 1];
}</code></pre>
<p class="sub">
  Matrix chain multiplication is the same skeleton one more time: iterate by
  chain length, split at k, combine as
  <code>dp[i][k] + dp[k+1][j] + p[i-1]*p[k]*p[j]</code>. If you can write
  Burst Balloons you can write MCM — the only difference is what the
  "combine" term costs.
</p>

<h3>State compression: making a big state fit</h3>
<p>
  Once the state has three or four dimensions, memory becomes the binding
  constraint before time does. Three techniques cover most of it:
</p>
<table>
  <tr><th>Technique</th><th>When</th><th>Effect</th></tr>
  <tr><td>Rolling array</td><td>dp[i] only reads dp[i-1]</td><td>O(n·m) → O(m) memory; keep <code>prev</code> and <code>cur</code></td></tr>
  <tr><td>Pack dimensions into one integer key</td><td>small, bounded dimensions</td><td><code>pos * 100 + prev * 2 + started</code> beats a string key or nested Map</td></tr>
  <tr><td>Derive a dimension</td><td>one index is a function of another</td><td>popcount(mask) removes a whole dimension, as in the assignment DP</td></tr>
  <tr><td>Typed arrays</td><td>numeric dp with known bounds</td><td><code>Int32Array(1 &lt;&lt; n)</code> is ~4× smaller and faster than a JS array</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ String keys are where advanced DP silently gets slow</span>
  <code>memo.set(i + "," + j + "," + mask, v)</code> allocates a string on
  every single call. At 10<sup>7</sup> states that's the dominant cost — the
  algorithm is right and the submission still times out. Prefer a numeric key
  (<code>(i * M + j) * K + mask</code>) or a flat preallocated array. Mention
  this trade-off out loud; it reads as production experience, not trivia.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I write any code, let me
  pin down the state. I need to know which items are already used and where I
  currently am — order doesn't matter beyond that — so the state is
  (subset, current). n is 15, so 2¹⁵ × 15 states with an O(n) transition is
  about 8 million operations: comfortably fast. Then the recurrence writes
  itself."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>n ≤ 20 with permutations, assignments, or "visit all"</b> → bitmask DP. The tiny constraint is the giveaway; interviewers set n = 12-18 precisely to signal 2<sup>n</sup>.</li>
  <li><b>"Maximum/minimum over a tree, with a constraint between parent and child"</b> → tree DP with a tuple return. Ask what a parent needs from a subtree; that tuple <em>is</em> your state.</li>
  <li><b>N up to 10<sup>9</sup>-10<sup>18</sup> and the question is "how many numbers ≤ N satisfy…"</b> → digit DP. Nothing else fits a bound that large, and the answer is a count, not a search.</li>
  <li><b>"Merge adjacent," "burst," "remove and the neighbours join," "partition a string into pieces"</b> → interval DP. Loop by length; the split point is usually the <em>last</em> operation, not the first.</li>
  <li><b>Distinguish from plain 2D DP:</b> 2D DP indexes two independent sequences; interval DP indexes two ends of the <em>same</em> sequence and must be filled by length, not row by row.</li>
  <li><b>Distinguish from greedy:</b> if a locally best choice can be invalidated by a later one (bursting the biggest balloon first is not optimal), greedy is out — the fact that "obvious greedy" fails on a small counterexample is the strongest signal you're in advanced-DP territory.</li>
  <li>Common pitfall across all four: propagating <code>Infinity</code> from unreachable states into arithmetic. Always <code>continue</code> on unreachable before relaxing.</li>
</ul>`,
    },
    {
      id: "dsa-union-find",
      num: "A2",
      title: "Union-Find (Disjoint Set)",
      short: "Union-Find",
      levels: ["advanced"],
      practice: ["ex-number-of-connected-components", "ex-redundant-connection"],
      ready: true,
      subtitle: 'Twenty lines that answer "are these two connected?" in effectively constant time — forever.',
      body: `<h3>The one question it answers, and why BFS isn't good enough</h3>
<p>
  You already know how to find connected components with BFS or DFS: one
  sweep, O(V + E). That works when the graph is <em>fixed</em>. Union-Find
  exists for the other case — when edges keep arriving and you have to answer
  "are u and v connected?" interleaved with "now connect u and v." Re-running
  DFS after every edge is O(E) per query; union-find answers both operations
  in effectively O(1), amortized, forever.
</p>
<p>
  The representation is a <b>forest</b>: every element points at a parent, and
  the root of each tree is that set's canonical name. Two elements are in the
  same set exactly when they reach the same root. That's the entire data
  structure — an array of integers.
</p>

<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A tall union-find tree on the left where node four points through three chained parents to the root, and on the right the same nodes after path compression all pointing directly at the root">
    <g class="rough">
      <path class="ln" d="M110,175 L110,135" />
      <path class="ln" d="M110,115 L110,75" />
      <path class="ln" d="M110,55 L110,30" />
      <path class="lng" d="M420,170 L480,120" />
      <path class="lng" d="M500,170 L500,120" />
      <path class="lng" d="M580,170 L520,120" />
    </g>
    <g class="rough">
      <circle class="box" cx="110" cy="190" r="16" />
      <circle class="box" cx="110" cy="130" r="16" />
      <circle class="box" cx="110" cy="70" r="16" />
      <circle class="boxy" cx="110" cy="20" r="16" />
      <circle class="boxg" cx="420" cy="185" r="16" />
      <circle class="boxg" cx="500" cy="185" r="16" />
      <circle class="boxg" cx="580" cy="185" r="16" />
      <circle class="boxy" cx="500" cy="105" r="16" />
    </g>
    <text class="sm" x="110" y="195" text-anchor="middle">4</text>
    <text class="sm" x="110" y="135" text-anchor="middle">3</text>
    <text class="sm" x="110" y="75" text-anchor="middle">2</text>
    <text class="sm" x="110" y="25" text-anchor="middle">1</text>
    <text class="sm" x="420" y="190" text-anchor="middle">4</text>
    <text class="sm" x="500" y="190" text-anchor="middle">3</text>
    <text class="sm" x="580" y="190" text-anchor="middle">2</text>
    <text class="sm" x="500" y="110" text-anchor="middle">1</text>
    <text class="lbl rd" x="150" y="100" style="font-size:15px">find(4) walks 3 hops</text>
    <text class="sm rd" x="150" y="122">chains like this are the O(n) worst case</text>
    <text class="lbl gr" x="300" y="60" style="font-size:15px">after find(4) with path compression:</text>
    <text class="sm gr" x="300" y="82">every node on the path re-parents to the root</text>
    <text class="sm" x="300" y="222">the next find on any of them costs one hop — the work is paid once, not per query</text>
  </svg>
  <figcaption>Path compression doesn't just speed up the node you queried — it flattens everything on the path, so the cost amortizes away across future queries.</figcaption>
</figure>

<h3>The naive version, so you can see what breaks</h3>
<pre><code>class NaiveDSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i); <span class="c">// everyone starts as their own root</span>
  }

  find(x) {
    while (this.parent[x] !== x) x = this.parent[x]; <span class="c">// walk up to the root</span>
    return x;
  }

  union(a, b) {
    const ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;  <span class="c">// already together — the return value is the useful part</span>
    this.parent[ra] = rb;         <span class="c">// hang one root under the other, arbitrarily</span>
    return true;
  }
}</code></pre>
<p class="sub">
  This is correct and it is also a trap: <code>union(0,1), union(1,2),
  union(2,3), …</code> builds a single chain of length n, and every
  <code>find</code> then costs O(n). The two optimizations below exist purely
  to make the trees short — they do not change what the structure means.
</p>

<h3>The two optimizations that change the complexity class</h3>
<p>
  <b>Path compression</b> — while walking to the root, re-point everything you
  passed directly at the root. You already paid to walk the path; flattening
  it is free.
</p>
<pre><code><span class="c">// recursive, two-pass: the clean version to write on a whiteboard</span>
find(x) {
  if (this.parent[x] !== x) {
    this.parent[x] = this.find(this.parent[x]); <span class="c">// re-parent on the way back down</span>
  }
  return this.parent[x];
}

<span class="c">// iterative, no stack depth risk — prefer this for n in the hundreds of thousands</span>
find(x) {
  let root = x;
  while (this.parent[root] !== root) root = this.parent[root];
  while (this.parent[x] !== root) {        <span class="c">// second pass: hook every node on the path to root</span>
    const next = this.parent[x];
    this.parent[x] = root;
    x = next;
  }
  return root;
}</code></pre>
<p>
  <b>Union by size</b> (or rank) — when merging, always hang the
  <em>smaller</em> tree under the larger root. A node's depth only increases
  when its tree is absorbed by one at least as big, so a node can be pushed
  down at most log n times before its tree contains all n elements. That alone
  caps height at O(log n), even with no path compression at all.
</p>
<pre><code>union(a, b) {
  let ra = this.find(a), rb = this.find(b);
  if (ra === rb) return false;
  if (this.size[ra] &lt; this.size[rb]) [ra, rb] = [rb, ra]; <span class="c">// ra is now the LARGER root</span>
  this.parent[rb] = ra;
  this.size[ra] += this.size[rb];
  return true;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Union by <em>rank</em> and by <em>size</em> are not the same field</span>
  Rank is an upper bound on height and only increments when two roots tie;
  size is the element count and always adds. Both work. What does <em>not</em>
  work is comparing rank while updating it like a size (or vice versa) — a
  common copy-paste mistake that silently degrades to the naive version. Also
  note: with path compression, rank stops being the true height. That's fine —
  it's still a valid balancing heuristic, which is why it's usually called
  "rank" and not "height."
</div>

<h3>The production DSU — memorize this one</h3>
<pre><code>class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.components = n; <span class="c">// every successful union drops this by exactly one</span>
  }

  find(x) {
    let root = x;
    while (this.parent[root] !== root) root = this.parent[root];
    while (this.parent[x] !== root) {
      const next = this.parent[x];
      this.parent[x] = root;
      x = next;
    }
    return root;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false;                       <span class="c">// false === "these were already connected"</span>
    if (this.size[ra] &lt; this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.components--;
    return true;
  }

  connected(a, b) { return this.find(a) === this.find(b); }
  setSize(x) { return this.size[this.find(x)]; }        <span class="c">// size is only meaningful at a root</span>
}</code></pre>
<p class="sub">
  Three details earn their keep in interviews: <code>union</code> returning a
  boolean (that single value solves cycle detection and Redundant Connection),
  the <code>components</code> counter (solves "number of provinces" with no
  extra pass), and <code>setSize</code> going through <code>find</code> first
  (reading <code>size[x]</code> on a non-root is stale garbage).
</p>

<h3>Why the combination is nearly O(1) — the intuition</h3>
<p>
  With both optimizations, m operations on n elements cost O(m · α(n)), where
  α is the inverse Ackermann function. You don't need the proof, you need the
  shape of the argument and a number.
</p>
<ul>
  <li><b>Union by size alone</b> caps tree height at log n: a node only gets
  deeper when its tree is swallowed by one at least as large, so its
  containing set at least doubles each time — that can happen at most log₂ n
  times.</li>
  <li><b>Path compression alone</b> means each expensive walk permanently
  destroys the structure that made it expensive. You cannot pay for the same
  long path twice; the cost amortizes across the sequence of operations, not
  per operation.</li>
  <li><b>Together</b>, the trees flatten faster than they can grow. The
  rigorous bound is α(n), the inverse of a function that grows so violently
  that α(n) ≤ 4 for any n you can physically store — n = 2<sup>65536</sup>
  still gives α = 5.</li>
</ul>
<table>
  <tr><th>Variant</th><th>find / union (amortized)</th><th>Comment</th></tr>
  <tr><td>Naive</td><td>O(n)</td><td>degenerates to a linked list</td></tr>
  <tr><td>Union by size only</td><td>O(log n)</td><td>worst case, not amortized</td></tr>
  <tr><td>Path compression only</td><td>O(log n)</td><td>amortized</td></tr>
  <tr><td>Both</td><td>O(α(n)) ≈ O(1)</td><td>α(n) ≤ 4 for all practical n</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'll use union-find with path
  compression and union by size. Each operation is amortized inverse
  Ackermann, which is at most 4 for any input that fits in memory — so I'll
  treat it as constant. Building over E edges is O(E · α(V)), which is
  effectively linear, and unlike a DFS it keeps working as new edges arrive."
</div>

<h3>Number of connected components — the counter does the work</h3>
<pre><code><span class="c">// LeetCode "Number of Connected Components in an Undirected Graph" / "Number of Provinces"</span>
function countComponents(n, edges) {
  const dsu = new DSU(n);
  for (const [u, v] of edges) dsu.union(u, v);
  return dsu.components;
}

<span class="c">// Same idea on an adjacency MATRIX (Number of Provinces) — only scan the upper triangle</span>
function findCircleNum(isConnected) {
  const n = isConnected.length;
  const dsu = new DSU(n);
  for (let i = 0; i &lt; n; i++) {
    for (let j = i + 1; j &lt; n; j++) {
      if (isConnected[i][j] === 1) dsu.union(i, j);
    }
  }
  return dsu.components;
}</code></pre>
<p class="sub">
  A grid problem like "Number of Islands" can be done this way too — map cell
  <code>(r, c)</code> to index <code>r * cols + c</code> and union each land
  cell with its right and down neighbours only (left/up are covered by the
  other cell's turn). BFS is simpler there and equally fast; reach for DSU on
  grids when the islands <em>change</em>, as in "Number of Islands II," where
  each added land cell is one union and the running count is free.
</p>

<h3>Cycle detection and Redundant Connection</h3>
<p>
  In an undirected graph, an edge <code>(u, v)</code> closes a cycle exactly
  when u and v are <em>already</em> in the same set. That is precisely the
  case where <code>union</code> returns false — so cycle detection is one
  <code>if</code>.
</p>
<pre><code><span class="c">// Does this undirected edge list contain a cycle?</span>
function hasCycle(n, edges) {
  const dsu = new DSU(n);
  for (const [u, v] of edges) {
    if (!dsu.union(u, v)) return true; <span class="c">// both endpoints already connected → this edge closes a loop</span>
  }
  return false;
}

<span class="c">// Redundant Connection: n nodes, n edges, 1-indexed. Return the LAST edge that creates a cycle.</span>
function findRedundantConnection(edges) {
  const dsu = new DSU(edges.length + 1); <span class="c">// +1 because nodes are 1-indexed; slot 0 is unused</span>
  for (const [u, v] of edges) {
    if (!dsu.union(u, v)) return [u, v]; <span class="c">// edges are given in order, so the first failure IS the last-added cycle edge</span>
  }
  return [];
}

<span class="c">// Bonus: "Graph Valid Tree" — a tree is exactly (n-1 edges) + (no cycle)</span>
function validTree(n, edges) {
  if (edges.length !== n - 1) return false;
  const dsu = new DSU(n);
  for (const [u, v] of edges) if (!dsu.union(u, v)) return false;
  return true; <span class="c">// n-1 edges and no cycle forces connectivity — no need to check it separately</span>
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Union-Find does not detect cycles in a <em>directed</em> graph</span>
  It has no notion of edge direction — it only knows "reachable through some
  path, ignoring arrows." A directed graph with edges 1→3 and 2→3 would look
  like a cycle to DSU (both unions touch 3) when there isn't one. For
  directed cycles use DFS with three colors, or Kahn's topological sort and
  check whether every node came off the queue. Naming this distinction
  unprompted is a strong signal in an interview.
</div>

<h3>Accounts Merge — union-find on things that aren't integers</h3>
<p>
  DSU indexes integers, so the real work in most "merge these groups"
  problems is the mapping layer: assign each distinct string an integer id,
  union, then bucket by root. This is the pattern for Accounts Merge,
  "Sentence Similarity II," "Synonymous Sentences," and every
  merge-duplicates question.
</p>
<pre><code><span class="c">// accounts[i] = [name, email1, email2, ...]. Merge accounts sharing any email.</span>
function accountsMerge(accounts) {
  const emailToId = new Map();
  const emailToName = new Map();
  let nextId = 0;

  for (const account of accounts) {
    const name = account[0];
    for (let i = 1; i &lt; account.length; i++) {
      const email = account[i];
      if (!emailToId.has(email)) emailToId.set(email, nextId++);
      emailToName.set(email, name);
    }
  }

  const dsu = new DSU(nextId);
  for (const account of accounts) {
    const firstId = emailToId.get(account[1]);
    for (let i = 2; i &lt; account.length; i++) {
      dsu.union(firstId, emailToId.get(account[i])); <span class="c">// chain every email to the account's first email</span>
    }
  }

  const groups = new Map(); <span class="c">// root id → list of emails</span>
  for (const [email, id] of emailToId) {
    const root = dsu.find(id);
    if (!groups.has(root)) groups.set(root, []);
    groups.get(root).push(email);
  }

  const result = [];
  for (const emails of groups.values()) {
    emails.sort();
    result.push([emailToName.get(emails[0]), ...emails]); <span class="c">// any email in the group maps to the same name</span>
  }
  return result;
}</code></pre>
<p class="sub">
  Complexity is O(E · α + E log E), where E is the total number of emails —
  the sort at the end dominates, which is worth saying out loud because it
  shows you costed the whole solution, not just the clever part.
</p>
<div class="warn">
  <span class="ttl">⚠ Two people can share a name; only emails identify an account</span>
  Union by name and every "John Smith" collapses into one account. The name is
  output-only metadata — never a key. This is the single intended trap in
  Accounts Merge, and it is also the realistic-data lesson: union on the
  identifier, carry the label along for the ride.
</div>

<h3>The advanced aside: union-find with rollback</h3>
<p>
  DSU has no <code>split</code> — you cannot un-merge two sets in general. But
  you <em>can</em> undo unions in reverse order if you keep a journal, which is
  enough for divide-and-conquer over time ("offline dynamic connectivity":
  each edge exists during an interval of queries, so you add it going down a
  segment-tree recursion and roll it back coming up).
</p>
<pre><code>class RollbackDSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.size = new Array(n).fill(1);
    this.history = []; <span class="c">// journal of [childRoot, parentRoot] merges</span>
  }

  find(x) {
    while (this.parent[x] !== x) x = this.parent[x]; <span class="c">// NO path compression — it isn't undoable</span>
    return x;
  }

  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) { this.history.push(null); return false; } <span class="c">// record a no-op so undo() stays aligned</span>
    if (this.size[ra] &lt; this.size[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    this.size[ra] += this.size[rb];
    this.history.push([rb, ra]);
    return true;
  }

  undo() {
    const entry = this.history.pop();
    if (!entry) return;
    const [child, root] = entry;
    this.parent[child] = child;      <span class="c">// exactly one pointer changed, so exactly one is restored</span>
    this.size[root] -= this.size[child];
  }
}</code></pre>
<p class="sub">
  The trade: dropping path compression costs you α and buys back O(log n) per
  operation from union-by-size alone — a fair price for undo. You almost
  certainly won't have to write this in an interview, but naming it when asked
  "what if edges could also be removed?" is exactly the kind of answer that
  separates candidates.
</p>
<p>
  One more forward reference: the next chapter, Minimum Spanning Tree, is
  essentially this data structure plus a sort. <b>Kruskal's algorithm</b> is
  "sort all edges by weight, then add each edge whose <code>union</code>
  returns true" — the boolean you already have is precisely the "does this
  edge connect two different components?" test the algorithm needs.
</p>


<h3>See the chain flatten</h3>
<p>Watch what path compression actually rewrites. The find that flattens the chain is doing the work that makes every later find cheap.</p>

<div class="demo">
  <div class="demo__bar">Union-Find — union by size + path compression</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="uf-code"></div>
        <div class="loop-bar"><i id="uf-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="uf-prev" type="button">← Back</button>
          <button class="btn" id="uf-next" type="button">Next step →</button>
          <button class="btn" id="uf-play" type="button">Play</button>
          <button class="btn btn--ghost" id="uf-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Connected sets</div>
          <div id="uf-p-roots"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="uf-cells"></div></div></div>
    <p class="demo__note" id="uf-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "uf";
  var CODE = ["function find(x) {","  if (parent[x] !== x) parent[x] = find(parent[x]);","  return parent[x];","}","function union(a, b) {","  let ra = find(a), rb = find(b);","  if (ra === rb) return false;","  if (size[ra] < size[rb]) [ra, rb] = [rb, ra];","  parent[rb] = ra; size[ra] += size[rb];","}"];
  var STEPS = [{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"1","c":"","p":"p=1"},{"v":"2","c":"","p":"p=2"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0}","{1}","{2}","{3}","{4}","{5}","{6}"]},"note":"Seven nodes, each its own set — parent[i] = i means 'I am my own root'."},{"cells":[{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"2","c":"","p":"p=2"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1}","{2}","{3}","{4}","{5}","{6}"]},"note":"union(0, 1) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"3","c":"","p":"p=3"},{"v":"4","c":"","p":"p=4"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2}","{3}","{4}","{5}","{6}"]},"note":"union(1, 2) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"3","c":"hot","p":"p=3"},{"v":"3","c":"hot","p":"p=3"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2}","{3, 4}","{5}","{6}"]},"note":"union(3, 4) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"3","c":"","p":"p=3"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"union(2, 3) — the smaller tree hangs under the bigger root, which keeps trees shallow."},{"cells":[{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"","p":"p=0"},{"v":"0","c":"hot","p":"p=0"},{"v":"5","c":"","p":"p=5"},{"v":"6","c":"","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"find(4) walked 4 → 3 → 0. Path compression then re-points every node on that walk straight at the root, so the next find is O(1)."},{"cells":[{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"0","c":"done","p":"p=0"},{"v":"5","c":"done","p":"p=5"},{"v":"6","c":"done","p":"p=6"}],"panels":{"roots":["{0, 1, 2, 3, 4}","{5}","{6}"]},"note":"Union by size plus path compression is what gives near-O(1) amortised operations."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>The words "connected," "groups," "merge," "same network," "provinces," "friend circles," "accounts belonging to one person."</b> Anything that is an equivalence relation (reflexive, symmetric, transitive) is a union-find problem.</li>
  <li><b>Edges arrive over time, or the question is asked repeatedly.</b> One BFS answers one snapshot; DSU answers a stream. If you see "after each query, report the number of components," DSU is almost forced.</li>
  <li><b>Brute force would be:</b> re-run DFS/BFS after every edge — O(E) per edge, O(E²) total. DSU makes it O(E · α).</li>
  <li><b>Distinguish from BFS/DFS:</b> if the graph is static <em>and</em> you also need paths, distances, or an ordering, use traversal — DSU knows nothing about distance, path, or direction. It only answers "same set?"</li>
  <li><b>Distinguish from topological sort:</b> DSU is undirected only. Directed dependencies, cycle detection in a DAG, ordering → topological sort.</li>
  <li><b>Pitfalls:</b> forgetting <code>find</code> before reading <code>size</code>; sizing the array wrong on 1-indexed inputs; and comparing roots with <code>parent[a] === parent[b]</code> instead of <code>find(a) === find(b)</code> — the second is the only correct test.</li>
</ul>`,
    },
    {
      id: "dsa-advanced-graph-algorithms",
      num: "A3",
      title: "Advanced graph algorithms",
      short: "Advanced graph algorithms",
      levels: ["advanced"],
      practice: ["ex-network-delay-time", "ex-cheapest-flights-within-k-stops"],
      ready: true,
      subtitle: "BFS is shortest path when every edge costs 1 — here is what to do when they don't.",
      body: `<h3>Weights break BFS, and knowing why tells you which algorithm to reach for</h3>
<p>
  BFS finds shortest paths because it expands nodes in order of distance —
  with unit edges, "fewest edges" and "cheapest" are the same thing. Add
  weights and that guarantee dies: the node one hop away down a cost-100 edge
  is <em>not</em> closer than a node three hops away down cost-1 edges. Every
  algorithm in this chapter is a different answer to "how do I restore the
  expand-in-distance-order property?"
</p>

<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="A four node graph where the direct edge from S to T costs one hundred but the path through A and B costs three, showing that breadth first search would wrongly finalize T after one hop">
    <g class="rough">
      <path class="lnr" d="M80,60 L520,60" />
      <path class="lng" d="M80,80 L230,150" />
      <path class="lng" d="M270,150 L390,150" />
      <path class="lng" d="M430,150 L520,80" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="60" cy="70" r="22" />
      <circle class="box" cx="250" cy="150" r="20" />
      <circle class="box" cx="410" cy="150" r="20" />
      <circle class="boxg" cx="540" cy="70" r="22" />
    </g>
    <text class="sm" x="60" y="75" text-anchor="middle">S</text>
    <text class="sm" x="250" y="155" text-anchor="middle">A</text>
    <text class="sm" x="410" y="155" text-anchor="middle">B</text>
    <text class="sm" x="540" y="75" text-anchor="middle">T</text>
    <text class="sm rd" x="300" y="48" text-anchor="middle">weight 100 — one hop</text>
    <text class="sm gr" x="140" y="130">1</text>
    <text class="sm gr" x="330" y="142" text-anchor="middle">1</text>
    <text class="sm gr" x="490" y="130">1</text>
    <text class="lbl rd" x="20" y="185" style="font-size:15px">BFS finalizes T at distance 1 hop = wrong;</text>
    <text class="lbl gr" x="380" y="185" style="font-size:15px">Dijkstra finalizes T at cost 3</text>
  </svg>
  <figcaption>BFS orders by hop count; Dijkstra orders by accumulated cost. Same traversal skeleton, different queue discipline — that is the entire upgrade.</figcaption>
</figure>

<h3>A binary heap you can actually write under pressure</h3>
<p>
  JavaScript has no built-in priority queue, so an interviewer expects you to
  either write one or state clearly that you would use one. Fifteen lines,
  array-backed, items are <code>[priority, value]</code> pairs. (This is the
  same heap from the heaps chapter — reproduced here because Dijkstra is
  unwritable without it.)
</p>
<pre><code>class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }

  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;             <span class="c">// parent index</span>
      if (a[p][0] &lt;= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }

  pop() {
    const a = this.a;
    const top = a[0];
    const last = a.pop();
    if (a.length > 0) {
      a[0] = last;
      let i = 0;
      for (;;) {
        const l = 2 * i + 1, r = l + 1;
        let m = i;
        if (l &lt; a.length && a[l][0] &lt; a[m][0]) m = l;
        if (r &lt; a.length && a[r][0] &lt; a[m][0]) m = r;
        if (m === i) break;
        [a[m], a[i]] = [a[i], a[m]];
        i = m;
      }
    }
    return top;
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Do not fake a priority queue with a sorted array</span>
  <code>queue.push(x); queue.sort((p, q) => p[0] - q[0]);</code> inside the
  main loop is O(E log E) <em>per edge</em> — it turns an O(E log V) algorithm
  into something quadratic and it is the most common reason a correct Dijkstra
  times out. If you're truly out of time, say "assume a standard binary heap
  with O(log n) push/pop" and move on; interviewers accept that far more often
  than candidates expect.
</div>

<h3>Dijkstra — the full working version</h3>
<p>
  The invariant: when a node is popped from the heap with the smallest
  tentative distance, that distance is <em>final</em>. Nothing still in the
  heap can improve it, because every remaining path leaves through a node
  that already costs at least as much and all edge weights are
  non-negative — that last clause is exactly why Dijkstra breaks on negative
  edges.
</p>
<pre><code><span class="c">// adj[u] = array of [v, weight]. Non-negative weights only. O((V + E) log V).</span>
function dijkstra(n, adj, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  const pq = new MinHeap();
  pq.push([0, src]);

  while (pq.size > 0) {
    const [d, u] = pq.pop();
    if (d > dist[u]) continue; <span class="c">// STALE entry: we already found a better route to u — skip it</span>

    for (const [v, w] of adj[u]) {
      const nd = d + w;
      if (nd &lt; dist[v]) {      <span class="c">// relaxation: this route to v beats anything known</span>
        dist[v] = nd;
        pq.push([nd, v]);      <span class="c">// push a NEW entry rather than decrease-key</span>
      }
    }
  }
  return dist;
}</code></pre>
<p class="sub">
  A textbook Dijkstra uses <em>decrease-key</em> to update a node's priority in
  place. A binary heap can't do that in O(log n) without an index map, so the
  standard trick is <b>lazy deletion</b>: push a duplicate entry and discard
  outdated ones on pop via the <code>d > dist[u]</code> guard. The heap holds
  up to E entries instead of V, which is why the complexity is usually written
  O(E log V) — same thing, since log E ≤ 2 log V.
</p>
<div class="warn">
  <span class="ttl">⚠ Dropping the stale-entry check is a correctness-adjacent disaster</span>
  Without <code>if (d > dist[u]) continue;</code> the algorithm still returns
  correct distances (relaxation is idempotent) but re-expands every outdated
  entry, degrading toward O(V·E) on dense graphs. A <code>visited</code> Set
  works equally well; what does <em>not</em> work is marking a node visited
  when you <em>push</em> it — that finalizes a distance before it's proven
  minimal and gives genuinely wrong answers.
</div>
<p>
  Recovering the actual path costs one extra array:
</p>
<pre><code>const parent = new Array(n).fill(-1);
<span class="c">// inside the relaxation, alongside dist[v] = nd:</span>
parent[v] = u;

function reconstruct(parent, target) {
  const path = [];
  for (let at = target; at !== -1; at = parent[at]) path.push(at);
  return path.reverse();
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "Weights are non-negative, so I'll
  use Dijkstra with a binary heap. I'll keep a dist array, push the source at
  zero, and each time I pop the closest unfinalized node I relax its
  neighbours. I'll use lazy deletion — pushing duplicates and skipping stale
  pops — since JS heaps don't support decrease-key. That's O(E log V) time and
  O(V + E) space."
</div>

<h3>When "shortest" has a second constraint: Cheapest Flights Within K Stops</h3>
<p>
  This one is a trap for pure Dijkstra: the cheapest way to reach a node might
  use too many stops, while a pricier route is still viable. The state is
  <code>(node, stopsUsed)</code>, not <code>node</code> — and once you see that,
  the cleanest solution is a bounded Bellman-Ford: relax all edges exactly
  <code>k + 1</code> times.
</p>
<pre><code>function findCheapestPrice(n, flights, src, dst, k) {
  let dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  for (let round = 0; round &lt;= k; round++) {  <span class="c">// k stops = k+1 edges</span>
    const next = dist.slice();               <span class="c">// SNAPSHOT — see the warning below</span>
    for (const [u, v, price] of flights) {
      if (dist[u] === Infinity) continue;
      if (dist[u] + price &lt; next[v]) next[v] = dist[u] + price;
    }
    dist = next;
  }
  return dist[dst] === Infinity ? -1 : dist[dst];
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Relaxing in place would use more edges than the round allows</span>
  If you write into <code>dist</code> directly, an edge relaxed earlier in the
  same round can be chained by a later edge in that same pass — so one round
  advances two or more hops and the k-stop limit silently leaks. Copying
  <code>dist</code> at the start of each round pins "distances using at most
  <code>round</code> edges." This is the only place plain Bellman-Ford's
  in-place relaxation is <em>not</em> safe, and it is the intended difficulty
  of the problem.
</div>

<h3>Bellman-Ford — negative weights, and detecting a negative cycle</h3>
<p>
  Bellman-Ford abandons the heap entirely: it just relaxes every edge, V − 1
  times. After i rounds, every shortest path using at most i edges is correct,
  and a simple path can't use more than V − 1 edges — so V − 1 rounds finish
  the job. That reasoning is also the negative-cycle detector: if a V-th round
  still improves something, no finite shortest path exists.
</p>
<pre><code><span class="c">// edges = [[u, v, w], ...] directed. Returns dist array, or null if a negative cycle is reachable.</span>
<span class="c">// O(V · E) time, O(V) space.</span>
function bellmanFord(n, edges, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  for (let i = 0; i &lt; n - 1; i++) {
    let changed = false;
    for (const [u, v, w] of edges) {
      if (dist[u] === Infinity) continue;   <span class="c">// unreachable: Infinity + w must not propagate</span>
      if (dist[u] + w &lt; dist[v]) {
        dist[v] = dist[u] + w;
        changed = true;
      }
    }
    if (!changed) break;                    <span class="c">// early exit: a settled round means we're done</span>
  }

  <span class="c">// One extra round. Any further improvement means a reachable negative cycle.</span>
  for (const [u, v, w] of edges) {
    if (dist[u] !== Infinity && dist[u] + w &lt; dist[v]) return null;
  }
  return dist;
}</code></pre>
<p class="sub">
  To identify <em>which</em> nodes are affected rather than just detecting the
  cycle, run a final BFS/DFS from every node that improved in the extra round
  and mark everything reachable as −∞. That's the version asked for in
  arbitrage-detection questions ("is there a sequence of currency trades that
  multiplies your money?" — take <code>-log(rate)</code> as the weight and a
  negative cycle is exactly an arbitrage).
</p>
<div class="warn">
  <span class="ttl">⚠ A negative <em>edge</em> is fine; a negative <em>cycle</em> is not</span>
  These are different failures. Dijkstra breaks on a single negative edge
  because its finalize-on-pop invariant assumes costs never decrease.
  Bellman-Ford handles negative edges happily — it breaks only on negative
  cycles, and then it reports them rather than lying. If an interviewer says
  "some edges are negative," the follow-up question to ask out loud is "can
  they form a cycle?"
</div>

<h3>Floyd-Warshall — all pairs, in three loops</h3>
<p>
  Sometimes the question isn't one source but every pair ("shortest path
  between all cities," "transitive closure," "find the city with the fewest
  reachable neighbours"). Floyd-Warshall answers it in three nested loops with
  one idea: consider intermediate nodes one at a time. After processing k, the
  table holds shortest paths that may only route through nodes 0..k.
</p>
<pre><code><span class="c">// O(V^3) time, O(V^2) space. Handles negative edges; d[i][i] &lt; 0 means a negative cycle.</span>
function floydWarshall(n, edges) {
  const d = Array.from({ length: n }, () => new Array(n).fill(Infinity));
  for (let i = 0; i &lt; n; i++) d[i][i] = 0;
  for (const [u, v, w] of edges) d[u][v] = Math.min(d[u][v], w); <span class="c">// min guards against parallel edges</span>

  for (let k = 0; k &lt; n; k++) {              <span class="c">// k MUST be the outermost loop</span>
    for (let i = 0; i &lt; n; i++) {
      if (d[i][k] === Infinity) continue;    <span class="c">// prune a whole row — a real constant-factor win</span>
      for (let j = 0; j &lt; n; j++) {
        const viaK = d[i][k] + d[k][j];
        if (viaK &lt; d[i][j]) d[i][j] = viaK;
      }
    }
  }
  return d;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Loop order is the whole algorithm</span>
  Ordering the loops i, then j, then k compiles, runs, and returns
  wrong answers on any graph needing two intermediate nodes. The reason k must
  be outermost is that the recurrence is a DP over "which intermediates are
  allowed" — layer k reads the completed layer k−1. Order the loops i, j, k and
  you're reading a half-built layer. If you remember exactly one thing about
  Floyd-Warshall, remember <b>k first</b>.
</div>
<p class="sub">
  V³ sounds fatal but the constant factor is tiny and there's no heap — up to
  roughly V = 400-500 it beats running Dijkstra V times in practice, and it is
  vastly easier to get right. It's also the go-to for reachability: swap
  <code>min/+</code> for <code>OR/AND</code> and you have transitive closure.
</p>

<h3>0-1 BFS — when weights are only 0 and 1</h3>
<p>
  A heap is overkill when there are only two possible edge costs. Use a
  <b>deque</b>: relaxing along a 0-weight edge doesn't change the distance, so
  push that node on the <em>front</em>; a 1-weight edge pushes to the
  <em>back</em>. The deque stays sorted by distance automatically — it only
  ever holds two distinct values, d and d+1 — giving true O(V + E) with no log
  factor. This shows up in grid problems like "minimum obstacles to remove" or
  "minimum cost to make a path" (rotating grid arrows is free in the direction
  it points, costs 1 otherwise).
</p>
<pre><code><span class="c">// Two-stack deque: amortized O(1) at both ends, no O(n) Array#shift.</span>
class Deque {
  constructor() { this.front = []; this.back = []; }
  get size() { return this.front.length + this.back.length; }
  pushFront(x) { this.front.push(x); }
  pushBack(x) { this.back.push(x); }
  popFront() {
    if (this.front.length === 0) {
      while (this.back.length > 0) this.front.push(this.back.pop()); <span class="c">// reverse back onto front, amortized O(1)</span>
    }
    return this.front.pop();
  }
}

<span class="c">// adj[u] = [[v, w]] with every w either 0 or 1. O(V + E).</span>
function zeroOneBFS(n, adj, src) {
  const dist = new Array(n).fill(Infinity);
  dist[src] = 0;

  const dq = new Deque();
  dq.pushBack(src);

  while (dq.size > 0) {
    const u = dq.popFront();
    for (const [v, w] of adj[u]) {
      const nd = dist[u] + w;
      if (nd &lt; dist[v]) {
        dist[v] = nd;
        if (w === 0) dq.pushFront(v); <span class="c">// same distance layer — must be processed before any d+1 node</span>
        else dq.pushBack(v);          <span class="c">// next layer</span>
      }
    }
  }
  return dist;
}</code></pre>
<div class="say">
  <span class="ttl">Say it like this →</span> "Every edge here costs 0 or 1, so
  I don't need a heap — a deque keeps the frontier sorted by construction.
  Zero-weight edges go to the front because they stay in the current distance
  layer; weight-one edges go to the back. That's plain O(V + E) instead of
  O(E log V)."
</div>

<h3>Multi-source BFS — seed the queue with everything at once</h3>
<p>
  "Distance from each cell to the <em>nearest</em> gate / zero / rotten
  orange" looks like V separate BFS runs. It isn't. Push every source into the
  queue at distance 0 before the loop starts and run one ordinary BFS — the
  frontiers expand together and the first time any source reaches a cell is,
  by definition, the nearest source. One pass, O(V + E), no repetition.
</p>
<pre><code><span class="c">// 01 Matrix: distance from each cell to the nearest 0. One BFS, all zeros seeded.</span>
function updateMatrix(mat) {
  const R = mat.length, C = mat[0].length;
  const dist = Array.from({ length: R }, () => new Array(C).fill(-1));
  const queue = [];

  for (let r = 0; r &lt; R; r++) {
    for (let c = 0; c &lt; C; c++) {
      if (mat[r][c] === 0) { dist[r][c] = 0; queue.push(r * C + c); } <span class="c">// ALL sources seeded before the loop</span>
    }
  }

  const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
  for (let head = 0; head &lt; queue.length; head++) { <span class="c">// index-based queue: no O(n) shift()</span>
    const cell = queue[head];
    const r = (cell / C) | 0, c = cell % C;
    for (const [dr, dc] of dirs) {
      const nr = r + dr, nc = c + dc;
      if (nr &lt; 0 || nr >= R || nc &lt; 0 || nc >= C) continue;
      if (dist[nr][nc] !== -1) continue;           <span class="c">// already reached by a nearer (or equal) source</span>
      dist[nr][nc] = dist[r][c] + 1;
      queue.push(nr * C + nc);
    }
  }
  return dist;
}</code></pre>
<p class="sub">
  The same seeding trick makes "Rotting Oranges" a one-liner change (track the
  last distance assigned and verify no fresh orange is left as −1), and it
  generalizes: a multi-source <em>Dijkstra</em> is just pushing every source at
  its own starting cost. Any time you'd write "run X from every source, take
  the min," check whether one seeded run does it.
</p>

<h3>Picking the right one</h3>
<table>
  <tr><th>Algorithm</th><th>Use when</th><th>Time</th><th>Space</th><th>Negative weights</th></tr>
  <tr><td>BFS</td><td>all edges cost the same (usually 1)</td><td>O(V + E)</td><td>O(V)</td><td>n/a</td></tr>
  <tr><td>0-1 BFS (deque)</td><td>every weight is 0 or 1</td><td>O(V + E)</td><td>O(V)</td><td>no</td></tr>
  <tr><td>Dijkstra + binary heap</td><td>single source, non-negative weights</td><td>O(E log V)</td><td>O(V + E)</td><td>no — breaks silently</td></tr>
  <tr><td>Bellman-Ford</td><td>negative edges, or a hop/stop limit</td><td>O(V · E)</td><td>O(V)</td><td>yes, and detects negative cycles</td></tr>
  <tr><td>Floyd-Warshall</td><td>all pairs, dense, V roughly ≤ 400</td><td>O(V³)</td><td>O(V²)</td><td>yes (no negative cycles)</td></tr>
  <tr><td>Topological sort + relax</td><td>the graph is a DAG</td><td>O(V + E)</td><td>O(V)</td><td>yes — beats all of the above on DAGs</td></tr>
</table>
<p class="sub">
  That last row is the one candidates forget. On a DAG you can relax edges in
  topological order and get shortest <em>or longest</em> paths in linear time,
  negative weights included — no heap, no V·E. If the problem says "no cycles"
  or the edges encode a strict ordering (course prerequisites, build steps,
  DP-shaped grids), check for the DAG shortcut before reaching for Dijkstra.
</p>
<div class="sticky mint">
  <span class="ttl">One sentence that picks the algorithm for you</span>
  "Are the weights uniform, non-negative, or possibly negative — and do I need
  one source or all pairs?" Uniform → BFS (or 0-1 BFS for two values).
  Non-negative, one source → Dijkstra. Negative, one source → Bellman-Ford.
  All pairs, small V → Floyd-Warshall. Answer those two questions out loud
  before writing a line and you will never pick wrong.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li><b>"Minimum cost/time/effort to get from A to B"</b> with numbers on the edges → shortest path. The words "cost," "time," "price," "signal delay," and "effort" are all weight synonyms.</li>
  <li><b>The weights are all 1, or the problem is on an unweighted grid</b> → plain BFS. Do not reach for Dijkstra; it's strictly more code for the same answer, and interviewers notice.</li>
  <li><b>Exactly two distinct weights (usually 0 and 1)</b> → 0-1 BFS with a deque. "Free in this direction, costs 1 to change" is the tell.</li>
  <li><b>Any negative number appears, or there's a cap on the number of edges used</b> → Bellman-Ford. A hop limit turns the state into (node, hops), which Bellman-Ford's round structure gives you for free.</li>
  <li><b>V is small (≤ 400) and the question asks about every pair</b>, or you need to answer many source-target queries → Floyd-Warshall, and mention the O(V³)/O(V²) trade explicitly.</li>
  <li><b>"Nearest X for every cell"</b> → multi-source BFS, seeded with all X. If you find yourself writing a loop that runs BFS once per source, stop and seed instead.</li>
  <li><b>Pitfalls:</b> Dijkstra with negative edges (wrong, and quietly so); sorting an array as a fake priority queue (TLE); Floyd-Warshall with k not outermost (wrong); adding to <code>Infinity</code> from an unreachable node (poisons the table); and using <code>Array#shift()</code> as a queue on 10<sup>5</sup> nodes (O(n²) hidden inside an O(V+E) algorithm).</li>
</ul>`,
    },
    {
      id: "dsa-minimum-spanning-tree",
      num: "A4",
      title: "Minimum Spanning Tree",
      short: "Minimum Spanning Tree",
      levels: ["advanced"],
      practice: ["ex-min-cost-connect-all-points"],
      ready: true,
      subtitle:
        "The cheapest wiring that reaches every node — greedy is provably optimal here, and there are exactly two ways to be greedy.",
      body: `<h3>What a minimum spanning tree actually is</h3>
<p>
  Given a connected, undirected, weighted graph on n vertices, a
  <b>spanning tree</b> is any subset of n−1 edges that keeps every vertex
  reachable — connected, acyclic, nothing left out. The <b>minimum</b>
  spanning tree is the spanning tree whose weights sum to the smallest
  possible total. Notice what is <em>not</em> being minimised: not the
  distance between any particular pair of vertices, only the total weight
  of the whole structure. An MST can easily make the trip from u to v much
  longer than the graph allows — it only promises the cheapest total wiring.
</p>

<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="A five vertex weighted graph with the four minimum spanning tree edges drawn in green, one rejected cycle edge in red, and two unused edges dashed">
    <g class="rough">
      <path class="lng" d="M100,60 L280,60" />
      <path class="lng" d="M280,60 L470,60" />
      <path class="lnr dash" d="M100,60 L100,190" />
      <path class="lng" d="M280,60 L100,190" />
      <path class="lng" d="M280,60 L280,190" />
      <path class="ln dash" d="M100,190 L280,190" />
      <path class="ln dash" d="M470,60 L280,190" />
    </g>
    <g class="rough">
      <circle class="box" cx="100" cy="60" r="22" />
      <circle class="box" cx="280" cy="60" r="22" />
      <circle class="box" cx="470" cy="60" r="22" />
      <circle class="box" cx="100" cy="190" r="22" />
      <circle class="box" cx="280" cy="190" r="22" />
    </g>
    <text class="lbl" x="100" y="66" text-anchor="middle">A</text>
    <text class="lbl" x="280" y="66" text-anchor="middle">B</text>
    <text class="lbl" x="470" y="66" text-anchor="middle">C</text>
    <text class="lbl" x="100" y="196" text-anchor="middle">D</text>
    <text class="lbl" x="280" y="196" text-anchor="middle">E</text>
    <text class="sm gr" x="190" y="46" text-anchor="middle">1</text>
    <text class="sm gr" x="375" y="46" text-anchor="middle">5</text>
    <text class="sm rd" x="82" y="130" text-anchor="end">4</text>
    <text class="sm gr" x="205" y="136">2</text>
    <text class="sm gr" x="296" y="130">3</text>
    <text class="sm" x="190" y="212" text-anchor="middle">7</text>
    <text class="sm" x="392" y="140">6</text>
    <text class="lbl gr" x="520" y="145" style="font-size:14px">green = in the MST</text>
    <text class="lbl rd" x="520" y="168" style="font-size:14px">red = would close</text>
    <text class="lbl rd" x="520" y="186" style="font-size:14px">a cycle</text>
    <text class="sm" x="520" y="212">total = 1+2+3+5 = 11</text>
  </svg>
  <figcaption>Four edges for five vertices — always exactly n−1. A–D is cheap (4) but rejected because A and D are already connected through B.</figcaption>
</figure>

<h3>Why greedy is safe: the cut property</h3>
<p>
  Greedy algorithms usually need a proof before you trust them, and MST has
  a clean one. Split the vertices into two non-empty groups — call that a
  <b>cut</b>. The <b>cut property</b> says: the cheapest edge crossing that
  cut belongs to some MST. The intuition is an exchange argument. Suppose an
  MST T doesn't contain that cheapest crossing edge e. Add e to T anyway —
  now you have a cycle, and that cycle has to cross back over the cut on some
  other edge f. Since e was the cheapest crossing edge, weight(e) ≤ weight(f),
  so swapping f out for e leaves you with a spanning tree that is no heavier.
  The greedy choice was never a mistake.
</p>
<p>
  The mirror image is the <b>cycle property</b>: on any cycle, the single
  heaviest edge is never needed — you can always delete it and stay
  connected. These two facts are the same fact seen from opposite ends, and
  they generate the two classic algorithms. Kruskal thinks in cycles ("take
  the cheapest edge unless it closes a cycle"), Prim thinks in cuts ("keep
  taking the cheapest edge leaving the tree I've built so far").
</p>
<p class="sub">
  On uniqueness: if all edge weights are <em>distinct</em>, the MST is unique
  — the exchange argument above becomes a strict inequality and no swap can
  tie. With ties, several different MSTs can exist, but every one of them has
  the same total weight. That's the honest answer to "is the MST unique?" in
  an interview: the tree may not be, the cost always is.
</p>

<div class="warn">
  <span class="ttl">⚠ An MST is not a shortest-paths tree</span>
  This is the mix-up interviewers actively probe for. Dijkstra from a source s
  builds a tree where the root-to-v path is the cheapest s→v path. An MST
  minimises the <em>sum of all its edges</em> and has no source at all. In the
  diagram above, the MST path from A to C is A→B→C = 6, and that happens to be
  optimal — but change B–C to weight 12 and C–E to 7 and the MST still routes
  A to C the long way while the direct-ish route through E is cheaper. If the
  problem says "shortest path from X," it is not an MST problem.
</div>

<h3>Kruskal's algorithm: sort every edge, take it if it doesn't close a cycle</h3>
<p>
  Kruskal is the cycle property applied greedily. Sort all E edges by weight,
  walk them cheapest first, and accept an edge only when its two endpoints are
  currently in <em>different</em> components. "Different components?" is exactly
  the question the union-find structure from the previous chapter answers in
  near-constant time — here is a compact version with path halving and union by
  rank so this file stands alone.
</p>
<pre><code>class DSU {
  constructor(n) {
    this.parent = Array.from({ length: n }, (_, i) => i);
    this.rank = new Array(n).fill(0);
  }
  find(x) {
    while (this.parent[x] !== x) {
      this.parent[x] = this.parent[this.parent[x]]; <span class="c">// path halving — flatten as we climb</span>
      x = this.parent[x];
    }
    return x;
  }
  union(a, b) {
    let ra = this.find(a), rb = this.find(b);
    if (ra === rb) return false; <span class="c">// already connected — this edge would close a cycle</span>
    if (this.rank[ra] < this.rank[rb]) [ra, rb] = [rb, ra];
    this.parent[rb] = ra;
    if (this.rank[ra] === this.rank[rb]) this.rank[ra]++;
    return true;
  }
}</code></pre>
<pre><code><span class="c">// edges: [u, v, weight][] with 0-indexed vertices — O(E log E) time, O(V) extra space</span>
function kruskalMST(n, edges) {
  edges.sort((a, b) => a[2] - b[2]); <span class="c">// the sort IS the algorithm's cost</span>

  const dsu = new DSU(n);
  const tree = [];
  let total = 0;

  for (const [u, v, w] of edges) {
    if (dsu.union(u, v)) { <span class="c">// union returns false when u and v already share a root</span>
      tree.push([u, v, w]);
      total += w;
      if (tree.length === n - 1) break; <span class="c">// n-1 edges = spanning, stop early</span>
    }
  }

  <span class="c">// fewer than n-1 accepted edges means the graph was disconnected</span>
  return tree.length === n - 1 ? { total, tree } : null;
}</code></pre>
<p class="sub">
  Complexity is O(E log E) dominated entirely by the sort — the union-find work
  is O(E · α(V)), and the inverse Ackermann function α is below 5 for any input
  that fits in memory, so treat it as constant when you say the number out loud.
  Space is O(V) for the DSU (the edge list is given, not built). Since E ≤ V²,
  log E ≤ 2 log V, so you'll also see this written O(E log V) — same thing.
</p>

<h3>Watching Kruskal build the tree, edge by edge</h3>
<p>Running it on the graph above, with edges sorted 1, 2, 3, 4, 5, 6, 7:</p>
<table>
  <tr><th>edge</th><th>w</th><th>find(u) === find(v)?</th><th>action</th><th>components after</th><th>total</th></tr>
  <tr><td>A–B</td><td>1</td><td>no</td><td><b>take</b></td><td>{AB} {C} {D} {E}</td><td>1</td></tr>
  <tr><td>B–D</td><td>2</td><td>no</td><td><b>take</b></td><td>{ABD} {C} {E}</td><td>3</td></tr>
  <tr><td>B–E</td><td>3</td><td>no</td><td><b>take</b></td><td>{ABDE} {C}</td><td>6</td></tr>
  <tr><td>A–D</td><td>4</td><td><b>yes</b></td><td>skip — cycle</td><td>{ABDE} {C}</td><td>6</td></tr>
  <tr><td>B–C</td><td>5</td><td>no</td><td><b>take</b></td><td>{ABCDE}</td><td><b>11</b></td></tr>
  <tr><td>C–E</td><td>6</td><td colspan="4">never examined — 4 = n−1 edges already accepted, loop breaks</td></tr>
</table>

<figure>
  <svg viewBox="0 0 640 200" class="dg" role="img" aria-label="Four small panels showing the Kruskal forest after each accepted edge, growing from five isolated vertices to one spanning tree">
    <g class="rough">
      <path class="lng" d="M35,75 L85,75" />
      <path class="lng" d="M190,75 L240,75" />
      <path class="lng" d="M190,75 L140,125" />
      <path class="lng" d="M345,75 L395,75" />
      <path class="lng" d="M345,75 L295,125" />
      <path class="lng" d="M395,75 L395,125" />
      <path class="lng" d="M500,75 L550,75" />
      <path class="lng" d="M500,75 L450,125" />
      <path class="lng" d="M550,75 L550,125" />
      <path class="lng" d="M550,75 L600,75" />
    </g>
    <g class="rough">
      <circle class="box" cx="35" cy="75" r="13" /><circle class="box" cx="85" cy="75" r="13" /><circle class="box" cx="135" cy="75" r="13" />
      <circle class="box" cx="35" cy="125" r="13" /><circle class="box" cx="85" cy="125" r="13" />
      <circle class="box" cx="190" cy="75" r="13" /><circle class="box" cx="240" cy="75" r="13" /><circle class="box" cx="290" cy="75" r="13" />
      <circle class="box" cx="190" cy="125" r="13" /><circle class="box" cx="240" cy="125" r="13" />
      <circle class="box" cx="345" cy="75" r="13" /><circle class="box" cx="395" cy="75" r="13" /><circle class="box" cx="445" cy="75" r="13" />
      <circle class="box" cx="345" cy="125" r="13" /><circle class="box" cx="395" cy="125" r="13" />
      <circle class="box" cx="500" cy="75" r="13" /><circle class="box" cx="550" cy="75" r="13" /><circle class="box" cx="600" cy="75" r="13" />
      <circle class="box" cx="500" cy="125" r="13" /><circle class="box" cx="550" cy="125" r="13" />
    </g>
    <text class="lbl" x="20" y="24" style="font-size:15px">Kruskal on the graph above — only the accepted edges are drawn</text>
    <text class="sm" x="85" y="47" text-anchor="middle">1. take A–B (1)</text>
    <text class="sm" x="240" y="47" text-anchor="middle">2. take B–D (2)</text>
    <text class="sm" x="395" y="47" text-anchor="middle">3. take B–E (3)</text>
    <text class="sm gr" x="550" y="47" text-anchor="middle">4. take B–C (5)</text>
    <text class="sm" x="85" y="165" text-anchor="middle">4 components</text>
    <text class="sm" x="240" y="165" text-anchor="middle">3 components</text>
    <text class="sm" x="395" y="165" text-anchor="middle">2 components</text>
    <text class="sm gr" x="550" y="165" text-anchor="middle">1 — spanning</text>
    <text class="sm rd" x="20" y="190">A–D (4) is skipped between panels 3 and 4: both ends were already connected</text>
  </svg>
  <figcaption>The component count drops by exactly one per accepted edge — that is why the loop can stop the instant it hits n−1.</figcaption>
</figure>

<div class="say">
  <span class="ttl">Say it like this →</span> "I'll sort the edges by weight
  and sweep cheapest-first, using union-find to reject any edge whose
  endpoints are already connected — that's Kruskal. The cut property
  guarantees the greedy choice is never wrong, and the cost is O(E log E)
  dominated by the sort, since each union-find operation is effectively
  constant time."
</div>

<h3>Prim's algorithm: grow one tree outward with a heap</h3>
<p>
  Prim keeps a single growing tree instead of a forest. At each step the cut is
  "vertices in the tree" versus "vertices outside," and the cut property says
  to take the cheapest edge crossing it. A min-heap keyed by edge weight
  produces that edge in O(log E). Here is a compact binary heap of
  <code>[weight, from, to]</code> triples so the code below runs as written.
</p>
<pre><code>class MinHeap {
  constructor() { this.a = []; }
  get size() { return this.a.length; }
  push(item) {
    const a = this.a;
    a.push(item);
    let i = a.length - 1;
    while (i > 0) {
      const p = (i - 1) >> 1;
      if (a[p][0] <= a[i][0]) break;
      [a[p], a[i]] = [a[i], a[p]];
      i = p;
    }
  }
  pop() {
    const a = this.a, top = a[0], last = a.pop();
    if (a.length) {
      a[0] = last;
      for (let i = 0; ; ) {
        const l = 2 * i + 1, r = l + 1;
        let s = i;
        if (l < a.length && a[l][0] < a[s][0]) s = l;
        if (r < a.length && a[r][0] < a[s][0]) s = r;
        if (s === i) break;
        [a[s], a[i]] = [a[i], a[s]];
        i = s;
      }
    }
    return top;
  }
}</code></pre>
<pre><code><span class="c">// adj[u] = [[v, weight], ...] — O(E log V) time, O(E) space for the heap</span>
function primMST(n, adj) {
  const inTree = new Array(n).fill(false);
  const heap = new MinHeap();
  const tree = [];
  let total = 0;

  inTree[0] = true; <span class="c">// seed with any vertex — MST is the same regardless of start</span>
  for (const [v, w] of adj[0]) heap.push([w, 0, v]);

  while (heap.size > 0 && tree.length < n - 1) {
    const [w, u, v] = heap.pop();
    if (inTree[v]) continue; <span class="c">// STALE entry — v got absorbed by a cheaper edge already</span>

    inTree[v] = true;
    tree.push([u, v, w]);
    total += w;

    for (const [next, nw] of adj[v]) {
      if (!inTree[next]) heap.push([nw, v, next]); <span class="c">// only frontier edges matter</span>
    }
  }

  return tree.length === n - 1 ? { total, tree } : null;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ The stale-entry check is not optional</span>
  This is the "lazy" heap variant: instead of decreasing a key in place (which
  a plain binary heap can't do), you push a new entry and let obsolete ones
  rot in the heap. Delete <code>if (inTree[v]) continue;</code> and you will
  happily add a second edge into a vertex that is already in the tree — the
  result has n−1 edges, a cycle, and a wrong total. The heap can hold up to E
  entries because of this, which is why the space is O(E) and not O(V).
</div>
<p class="sub">
  Prim also gives the wrong answer silently on a <em>disconnected</em> graph:
  it fills one component and stops. Kruskal, by contrast, naturally produces a
  minimum spanning <em>forest</em> — one tree per component. If the input might
  be disconnected and you're using Prim, you must loop over unvisited seeds
  yourself, or check <code>tree.length === n - 1</code> as above.
</p>

<h3>Kruskal vs Prim: which one in the interview</h3>
<table>
  <tr><th></th><th>Kruskal</th><th>Prim (binary heap)</th><th>Prim (no heap, O(V²))</th></tr>
  <tr><td>Time</td><td>O(E log E)</td><td>O(E log V)</td><td>O(V²)</td></tr>
  <tr><td>Space</td><td>O(V) DSU</td><td>O(E) lazy heap</td><td>O(V)</td></tr>
  <tr><td>Input wanted</td><td>edge list</td><td>adjacency list</td><td>adjacency matrix / on-the-fly weights</td></tr>
  <tr><td>Sparse (E ≈ V)</td><td><b>great</b></td><td>great</td><td>wasteful</td></tr>
  <tr><td>Dense (E ≈ V²)</td><td>O(V² log V) — the sort hurts</td><td>O(V² log V)</td><td><b>best</b> — beats both</td></tr>
  <tr><td>Disconnected input</td><td>gives a spanning forest for free</td><td>needs an outer restart loop</td><td>needs an outer restart loop</td></tr>
  <tr><td>Depends on</td><td>union-find</td><td>a priority queue</td><td>nothing</td></tr>
</table>
<p class="sub">
  The one that actually decides interviews is the last row of the dense column.
  When the graph is <em>implicit</em> and complete — "n points, cost between any
  two is their distance" — materialising all V²/2 edges to sort them is the
  mistake. With V = 1000 that's half a million edges to build and sort when
  O(V²) Prim never stores a single one.
</p>

<h3>Min Cost to Connect All Points — the dense case done right</h3>
<p>
  The classic version: given points on a plane, connecting two costs their
  Manhattan distance, connect them all as cheaply as possible. Every pair is
  an edge, so this is a complete graph — reach for O(V²) Prim, which keeps one
  number per vertex ("cheapest known edge from the tree to you") and rescans
  instead of heaping.
</p>
<pre><code><span class="c">// O(V²) time, O(V) space — never builds the edge list at all</span>
function minCostConnectPoints(points) {
  const n = points.length;
  const minDist = new Array(n).fill(Infinity);
  const inTree = new Array(n).fill(false);
  minDist[0] = 0; <span class="c">// start vertex costs nothing to attach</span>
  let total = 0;

  for (let step = 0; step < n; step++) {
    <span class="c">// pick the cheapest vertex still outside the tree — this is the cut property</span>
    let u = -1;
    for (let v = 0; v < n; v++) {
      if (!inTree[v] && (u === -1 || minDist[v] < minDist[u])) u = v;
    }

    inTree[u] = true;
    total += minDist[u];

    <span class="c">// relax: u joining the tree may give every outsider a cheaper attachment</span>
    for (let v = 0; v < n; v++) {
      if (inTree[v]) continue;
      const d = Math.abs(points[u][0] - points[v][0]) + Math.abs(points[u][1] - points[v][1]);
      if (d < minDist[v]) minDist[v] = d;
    }
  }
  return total;
}</code></pre>
<p class="sub">
  The relax step is why this works without a heap: <code>minDist[v]</code> is
  always "cheapest edge from the current tree to v," so scanning it for the
  minimum <em>is</em> finding the cheapest edge across the cut. That linear scan
  costs O(V) per step for O(V) steps — the same O(V²) as building the matrix,
  so the heap buys nothing.
</p>

<h3>The virtual-node trick, and other MST disguises</h3>
<p>
  MST problems rarely announce themselves. A recurring twist: each node has a
  standalone cost as well as connection costs — "each village can dig its own
  well for cost w[i], or lay a pipe to another village for cost c." That looks
  like it isn't a spanning tree at all, until you add a <b>virtual node 0</b>
  representing "the water source" and connect it to village i with weight
  w[i]. Now "dig a well" is just another edge, and a plain MST over n+1 nodes
  is the answer.
</p>
<pre><code>function minCostToSupplyWater(n, wells, pipes) {
  <span class="c">// vertex 0 is virtual: edge 0→i with cost wells[i-1] means "dig a well at i"</span>
  const edges = pipes.slice();
  for (let i = 0; i < n; i++) edges.push([0, i + 1, wells[i]]);

  const result = kruskalMST(n + 1, edges); <span class="c">// n+1 vertices now, so n edges in the tree</span>
  return result.total;
}</code></pre>
<div class="sticky mint">
  <span class="ttl">The one-line separation</span>
  MST answers "what's the cheapest wiring for the whole town?" Dijkstra
  answers "what's my fastest commute from <em>my</em> house?" Cheapest total
  wiring will happily route your commute the long way around. Whenever a graph
  problem shows up, decide which of those two sentences it is before writing a
  line of code.
</div>
<p class="sub">
  Two more disguises worth recognising instantly. "Remove the maximum number
  of edges while keeping the graph connected" → build an MST, the answer is
  E − (V−1). "Minimise the largest edge on a path between all pairs" → the MST
  is also a <em>minimax</em> spanning tree, so the answer is the heaviest edge
  on the MST path, not a shortest-path computation.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Connecting everything at minimum
  total cost is a minimum spanning tree. The graph here is complete — every
  pair has a weight — so I'll use the O(V²) form of Prim and skip materialising
  the half-million edges Kruskal would need to sort. If the graph were sparse
  and given as an edge list, I'd sort and run Kruskal with union-find instead."
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Connect all," "minimum cost to link every," "cheapest network/wiring/roads," "keep everything reachable" — total cost over the whole structure, not a route between two nodes</li>
  <li>The graph is <b>undirected</b> and weighted. MST is undefined on a directed graph — that's the arborescence / Chu-Liu-Edmonds problem, and no interviewer expects it</li>
  <li>Brute force would enumerate spanning trees — Cayley's formula says a complete graph on n vertices has n<sup>n−2</sup> of them, so exhaustive search is hopeless and greedy is the whole point</li>
  <li>Distinguish from Dijkstra: if a <em>source vertex</em> is named, or the answer is "distance from A to B," it's shortest paths, not MST</li>
  <li>Distinguish from plain union-find connectivity: if weights are ignored and the question is just "are these connected / how many components," you need the DSU but not the sort</li>
  <li>Per-node costs alongside per-edge costs → add a virtual node and turn the node cost into an edge cost</li>
  <li>Complete/implicit graph on ≥ ~1000 points → O(V²) Prim; explicit sparse edge list → Kruskal</li>
</ul>`,
    },
    {
      id: "dsa-tries",
      num: "A5",
      title: "Tries",
      short: "Tries",
      levels: ["advanced"],
      practice: ["ex-maximum-xor-of-two-numbers", "ex-implement-trie", "ex-add-and-search-words", "ex-word-search-ii"],
      ready: true,
      subtitle: "Store the string as a path, not a value — and every prefix question becomes a walk instead of a scan.",
      body: `<h3>The shape: the word is the path</h3>
<p>
  A hash set of words answers exactly one question well: "is this exact string
  present?" It is useless for "does anything here start with <code>ca</code>?"
  — you'd have to scan every key. A <b>trie</b> (prefix tree) fixes that by
  storing each character as an <em>edge</em> in a tree, so a word is a
  root-to-node path and every shared prefix is shared storage. Looking up a
  prefix costs O(length of the prefix), completely independent of how many
  words the dictionary holds.
</p>
<p>
  Each node holds two things and nothing else: a map from next-character to
  child node, and a boolean saying "a complete word ends here." That second
  flag is load-bearing — without it you can't tell the stored word
  <code>"do"</code> from the mere prefix <code>"do"</code> inside
  <code>"dog"</code>.
</p>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A trie built from the words car, cat, do and dog, with nodes that terminate a word highlighted in green">
    <g class="rough">
      <path class="ln" d="M300,25 L180,80" />
      <path class="ln" d="M300,25 L470,80" />
      <path class="ln" d="M180,80 L180,135" />
      <path class="ln" d="M180,135 L110,190" />
      <path class="ln" d="M180,135 L250,190" />
      <path class="ln" d="M470,80 L470,135" />
      <path class="ln" d="M470,135 L470,190" />
    </g>
    <g class="rough">
      <circle class="box" cx="300" cy="25" r="20" />
      <circle class="box" cx="180" cy="80" r="18" />
      <circle class="box" cx="470" cy="80" r="18" />
      <circle class="box" cx="180" cy="135" r="18" />
      <circle class="boxg" cx="470" cy="135" r="18" />
      <circle class="boxg" cx="110" cy="190" r="18" />
      <circle class="boxg" cx="250" cy="190" r="18" />
      <circle class="boxg" cx="470" cy="190" r="18" />
    </g>
    <text class="sm" x="300" y="30" text-anchor="middle">root</text>
    <text class="lbl" x="180" y="86" text-anchor="middle">c</text>
    <text class="lbl" x="470" y="86" text-anchor="middle">d</text>
    <text class="lbl" x="180" y="141" text-anchor="middle">a</text>
    <text class="lbl" x="470" y="141" text-anchor="middle">o</text>
    <text class="lbl" x="110" y="196" text-anchor="middle">r</text>
    <text class="lbl" x="250" y="196" text-anchor="middle">t</text>
    <text class="lbl" x="470" y="196" text-anchor="middle">g</text>
    <text class="sm gr" x="110" y="222" text-anchor="middle">"car"</text>
    <text class="sm gr" x="250" y="222" text-anchor="middle">"cat"</text>
    <text class="sm gr" x="470" y="222" text-anchor="middle">"dog"</text>
    <text class="sm gr" x="500" y="140">"do"</text>
    <text class="lbl gr" x="20" y="248" style="font-size:14px">green = isEnd — a stored word finishes at this node</text>
  </svg>
  <figcaption>"car" and "cat" share the c–a path entirely. "do" ends at a node that still has a child, which is why isEnd is a flag and not "has no children."</figcaption>
</figure>

<h3>The structure from scratch</h3>
<p>
  A <code>Map</code> for children beats a fixed 26-slot array: it costs nothing
  for sparse nodes, and it survives inputs that aren't lowercase a–z (digits,
  unicode, arbitrary keys). The fixed array is faster by a constant factor when
  the alphabet really is 26 letters, and it's worth mentioning that tradeoff out
  loud, but reach for the Map by default.
</p>
<pre><code>class TrieNode {
  constructor() {
    this.children = new Map(); <span class="c">// char → TrieNode</span>
    this.isEnd = false;        <span class="c">// a complete stored word terminates here</span>
  }
}

class Trie {
  constructor() { this.root = new TrieNode(); }

  <span class="c">// O(L) time where L = word.length, O(L) new nodes worst case</span>
  insert(word) {
    let node = this.root;
    for (const ch of word) {
      if (!node.children.has(ch)) node.children.set(ch, new TrieNode());
      node = node.children.get(ch);
    }
    node.isEnd = true;
  }

  <span class="c">// walk as far as the string goes; returns the node or null</span>
  _walk(str) {
    let node = this.root;
    for (const ch of str) {
      node = node.children.get(ch);
      if (!node) return null;
    }
    return node;
  }

  search(word) {
    const node = this._walk(word);
    return node !== null && node.isEnd; <span class="c">// reaching the node is NOT enough</span>
  }

  startsWith(prefix) {
    return this._walk(prefix) !== null; <span class="c">// here reaching the node IS enough</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ isEnd is not "has no children," and a leaf is not "is a word"</span>
  Both directions of this confusion produce wrong answers. In the diagram,
  the <code>o</code> node has a child (<code>g</code>) but <em>is</em> a word
  ("do") — so testing <code>children.size === 0</code> misses it. And if you
  only ever insert "dog", the <code>o</code> node is childless-free but is
  <em>not</em> a word. <code>search()</code> and <code>startsWith()</code>
  differing by exactly the <code>isEnd</code> check is the entire point of the
  flag; if your two methods have identical bodies, you have a bug.
</div>

<h3>Cost: pay for the word length, not the dictionary size</h3>
<table>
  <tr><th>Operation</th><th>Trie</th><th>Hash set of words</th><th>Sorted array + binary search</th></tr>
  <tr><td>insert word of length L</td><td>O(L)</td><td>O(L) hash</td><td>O(n) shift</td></tr>
  <tr><td>exact search</td><td>O(L)</td><td>O(L)</td><td>O(L log n)</td></tr>
  <tr><td>"any word with prefix P?"</td><td><b>O(P)</b></td><td>O(n · L) — full scan</td><td>O(L log n)</td></tr>
  <tr><td>list all words with prefix P</td><td>O(P + output)</td><td>O(n · L)</td><td>O(L log n + output)</td></tr>
  <tr><td>space</td><td>O(total chars), shared prefixes stored once</td><td>O(total chars) + hash overhead</td><td>O(total chars)</td></tr>
</table>
<p class="sub">
  The sorted-array column is the honest competitor people forget: sorting the
  dictionary puts every prefix group in a contiguous block, so binary search
  handles prefix queries too. The trie wins when the dictionary <em>changes</em>
  (insertions are O(L), not O(n)) and when you need to walk character-by-character
  <em>while</em> doing something else — which is exactly the Word Search II case
  below, and the real reason tries show up in interviews.
</p>

<div class="sticky mint">
  <span class="ttl">The question each structure answers</span>
  A hash set answers "is this <em>exact</em> string here?" A trie answers "is
  anything here that <em>starts like</em> this?" — and it can answer it
  incrementally, one character at a time, without restarting. Any problem where
  you're extending a candidate string one character at a time and want to bail
  early is a trie problem.
</div>

<h3>Autocomplete: collect everything under a prefix</h3>
<p>
  Walk to the prefix node in O(P), then DFS its subtree collecting every
  <code>isEnd</code>. The cost is O(P + size of the subtree), which is
  proportional to the answer rather than the dictionary — that's what makes it
  viable at search-box latency.
</p>
<pre><code>function autocomplete(trie, prefix, limit = 10) {
  const start = trie._walk(prefix);
  if (!start) return [];

  const out = [];
  (function dfs(node, suffix) {
    if (out.length >= limit) return; <span class="c">// stop the moment we have enough</span>
    if (node.isEnd) out.push(prefix + suffix);

    <span class="c">// sort keys for lexicographic order; skip the sort if insertion order is fine</span>
    for (const ch of [...node.children.keys()].sort()) {
      dfs(node.children.get(ch), suffix + ch);
      if (out.length >= limit) return;
    }
  })(start, "");

  return out;
}</code></pre>
<p class="sub">
  Real autocomplete wants <em>top-k by popularity</em>, not lexicographic order,
  and that changes the design: store a frequency on each terminal node, and at
  insert time also push the word into a small "best few in this subtree" list on
  every node along the path. Then a prefix query is O(P) with no DFS at all —
  you read the cached list off the prefix node. That precompute-on-write trade
  is exactly the answer expected in a "design a search suggestion service"
  system-design follow-up.
</p>

<h3>Wildcard search — the '.' matches any character</h3>
<p>
  The "Design Add and Search Words" variant adds a dot that matches any single
  character. Deterministic lookup becomes a small DFS: a concrete character
  follows one child, a dot branches to all of them.
</p>
<pre><code>function searchPattern(node, word, i = 0) {
  if (i === word.length) return node.isEnd;

  const ch = word[i];
  if (ch !== ".") {
    const next = node.children.get(ch);
    return next ? searchPattern(next, word, i + 1) : false; <span class="c">// single deterministic step</span>
  }

  for (const child of node.children.values()) {
    if (searchPattern(child, word, i + 1)) return true; <span class="c">// dot = branch over every child</span>
  }
  return false;
}</code></pre>
<p class="sub">
  Worst case (a query of all dots) this degenerates to visiting the whole trie,
  O(26<sup>L</sup>) branching bounded by the number of nodes — but note the
  branching factor is the number of <em>existing</em> children, not 26, so on a
  real dictionary it collapses fast. Say that bound out loud rather than
  claiming O(L).
</p>

<h3>Word Break — the trie kills the substring scanning</h3>
<p>
  The DP is the familiar one from the 1D DP chapter: <code>ok[i]</code> means
  "s[0..i) is fully segmentable." The naive inner loop slices
  <code>s.substring(i, j)</code> and hashes it, costing O(n² · L). Walking a
  trie instead reuses the previous character's work and — crucially — breaks the
  instant no dictionary word continues down this path.
</p>
<pre><code>function wordBreak(s, wordDict) {
  const root = {};
  for (const w of wordDict) { <span class="c">// plain objects are fine and fast when keys are chars</span>
    let node = root;
    for (const ch of w) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.end = true;
  }

  const n = s.length;
  const ok = new Array(n + 1).fill(false);
  ok[0] = true; <span class="c">// the empty prefix is trivially segmentable</span>

  for (let i = 0; i < n; i++) {
    if (!ok[i]) continue; <span class="c">// unreachable start — nothing to extend</span>

    let node = root;
    for (let j = i; j < n; j++) {
      node = node[s[j]];
      if (!node) break; <span class="c">// THE win: no dictionary word starts s[i..j], abandon this start</span>
      if (node.end) ok[j + 1] = true;
    }
  }
  return ok[n];
}</code></pre>
<p class="sub">
  Worst case is still O(n²), but the <code>break</code> means the inner loop
  runs only as far as the longest dictionary word that actually matches — in
  practice a handful of characters, not n. No substrings are allocated either,
  which matters more than it looks on long inputs.
</p>

<h3>Word Search II — the trie prunes the backtracking</h3>
<p>
  This is the problem tries exist for in interviews. Find every dictionary word
  hidden in a grid. Running the single-word Word Search backtracking from the
  backtracking chapter once per word is O(W · R · C · 4<sup>L</sup>) and times
  out. The fix is to invert the loop: build one trie of all words and DFS the
  grid <em>once</em>, carrying a trie node alongside the position. The moment the
  path spells something no word starts with, the branch dies.
</p>
<pre><code>function findWords(board, words) {
  const root = {};
  for (const w of words) {
    let node = root;
    for (const ch of w) {
      if (!node[ch]) node[ch] = {};
      node = node[ch];
    }
    node.word = w; <span class="c">// store the word itself — no need to rebuild it from the path</span>
  }

  const rows = board.length, cols = board[0].length;
  const found = [];

  function dfs(r, c, node) {
    const ch = board[r][c];
    const next = node[ch];
    if (!next) return; <span class="c">// PRUNE: no word in the dictionary continues this way</span>

    if (next.word) {
      found.push(next.word);
      delete next.word; <span class="c">// de-dupe: never report the same word twice</span>
    }

    board[r][c] = "#"; <span class="c">// mark visited in place, same trick as Word Search</span>
    if (r > 0)        dfs(r - 1, c, next);
    if (r < rows - 1) dfs(r + 1, c, next);
    if (c > 0)        dfs(r, c - 1, next);
    if (c < cols - 1) dfs(r, c + 1, next);
    board[r][c] = ch; <span class="c">// un-choose</span>

    <span class="c">// leaf pruning: this branch is exhausted, unlink it so future DFS never enters</span>
    if (Object.keys(next).length === 0) delete node[ch];
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) dfs(r, c, root);
  }
  return found;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Three bugs this problem reliably produces</span>
  <b>Duplicates</b> — the same word can be spelled from several start cells, so
  you must clear the marker after reporting it (<code>delete next.word</code>,
  not just pushing). <b>Using a Set to de-dupe instead</b> works but leaves the
  trie node reporting forever, wasting work. <b>Forgetting the restore</b>
  <code>board[r][c] = ch</code> silently blocks cells for later, unrelated
  searches. The leaf-pruning line is the only optional one, and it's what turns
  a TLE into a fast solution on adversarial inputs like a grid of all
  <code>'a'</code> with words <code>"aaaa...a"</code>.
</div>
<p class="sub">
  <code>delete next.word</code> rather than <code>next.word = null</code> matters
  for the pruning line below it: an assigned-null key still shows up in
  <code>Object.keys</code>, so the node would never look empty and the prune
  would never fire.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Instead of running the grid search
  once per word, I'll put all the words in a trie and search the grid once,
  carrying a trie pointer with the DFS. As soon as the path I've spelled isn't a
  prefix of any word, I stop — so shared prefixes are explored once rather than
  once per word, and dead branches are cut at the first character that doesn't
  match anything."
</div>

<h3>Advanced aside: the binary trie for maximum XOR</h3>
<p>
  A trie doesn't have to be built from letters. Write each number as its 32-bit
  binary string and insert those — now the "alphabet" is <code>{0, 1}</code>, the
  tree is exactly 32 deep, and you can answer "which stored number XORs with x to
  give the largest result?" greedily. XOR gives a 1 bit exactly when the bits
  differ, and the high bits dominate the value, so at each level you steer toward
  the <em>opposite</em> bit if such a branch exists.
</p>
<pre><code><span class="c">// maximum XOR of any pair — O(32n) time, O(32n) nodes, vs O(n²) brute force</span>
function findMaximumXOR(nums) {
  const BITS = 31; <span class="c">// stay inside 32-bit signed range: bit 31 down to bit 0</span>
  const root = {};

  for (const num of nums) {
    let node = root;
    for (let b = BITS; b >= 0; b--) {
      const bit = (num >> b) & 1;
      if (!node[bit]) node[bit] = {};
      node = node[bit];
    }
  }

  let best = 0;
  for (const num of nums) {
    let node = root, current = 0;
    for (let b = BITS; b >= 0; b--) {
      const bit = (num >> b) & 1;
      const want = bit ^ 1; <span class="c">// the opposite bit sets this position in the XOR</span>
      if (node[want]) {
        current |= 1 << b;  <span class="c">// greedy: a high bit is worth more than every lower bit combined</span>
        node = node[want];
      } else {
        node = node[bit];   <span class="c">// forced to match — this bit contributes 0</span>
      }
    }
    best = Math.max(best, current);
  }
  return best;
}</code></pre>
<p class="sub">
  The greedy step is safe for the same reason binary place value works: setting
  bit b contributes 2<sup>b</sup>, which strictly exceeds the sum of every lower
  bit (2<sup>b</sup> − 1). So there is never a reason to give up a high bit hoping
  to win low ones. The same structure, with counts stored per node, extends to
  "count pairs with XOR less than k" and to offline queries with a max-value
  constraint.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The words <b>prefix</b>, <b>autocomplete</b>, <b>dictionary</b>, <b>starts with</b>, or a list of words plus something to search them against</li>
  <li>You're building a candidate string one character at a time (grid DFS, backtracking, DP over a string) and want to abandon it the moment no target could continue — that incremental "still a valid prefix?" check is the trie's unique ability</li>
  <li>Brute force is "for each of W words, scan/search the whole input" — the trie inverts it to one pass over the input carrying all W words at once</li>
  <li>Distinguish from a hash set: if only exact membership is ever asked, a <code>Set</code> is simpler, smaller and faster — don't build a trie to show off</li>
  <li>Distinguish from suffix structures: "any substring" questions (repeated substrings, longest common substring) want a suffix trie/automaton or hashing, not a plain prefix trie</li>
  <li>Bitwise pair problems — maximum XOR, XOR under a threshold — are a binary trie over 32-bit strings in disguise</li>
  <li>Watch the flag: <code>isEnd</code> is separate from "leaf," and <code>search</code> vs <code>startsWith</code> must differ by exactly that check</li>
</ul>`,
    },
    {
      id: "dsa-segment-fenwick-trees",
      num: "A6",
      title: "Segment trees & Fenwick trees",
      short: "Segment & Fenwick trees",
      levels: ["advanced"],
      practice: [
        "ex-range-sum-query-mutable",
        "ex-fenwick-binary-indexed-tree",
        "ex-range-minimum-query-segment-tree",
        "ex-count-of-smaller-numbers-after-self",
        "ex-range-sum-query-2d-mutable",
      ],
      ready: true,
      subtitle:
        "Prefix sums die the moment the array can change — these two structures buy back updates for a log factor.",
      body: `<h3>Where the prefix-sum array falls over</h3>
<p>
  A prefix-sum array is unbeatable on a <em>static</em> array: O(n) to build,
  O(1) per range query. The moment an element can change, it collapses —
  updating index i invalidates every prefix from i onward, so each update is
  O(n). Skip the precompute and you flip the problem: O(1) updates, O(n)
  queries. Either way an interleaved workload of q operations costs O(n·q),
  and with n and q around 10<sup>5</sup> that's 10<sup>10</sup> operations.
</p>
<table>
  <tr><th>Structure</th><th>Build</th><th>Range query</th><th>Point update</th><th>10⁵ mixed ops</th></tr>
  <tr><td>Raw array, loop each query</td><td>O(1)</td><td>O(n)</td><td>O(1)</td><td>~10¹⁰ — too slow</td></tr>
  <tr><td>Prefix-sum array</td><td>O(n)</td><td>O(1)</td><td>O(n)</td><td>~10¹⁰ — too slow</td></tr>
  <tr><td>Fenwick / segment tree</td><td>O(n)</td><td>O(log n)</td><td>O(log n)</td><td>~1.7 × 10⁶ — fine</td></tr>
</table>
<p class="sub">
  The move both structures make is the same one binary search makes: refuse to
  store either extreme. Don't store every individual element (queries too slow)
  and don't store every prefix (updates too slow) — store O(n) carefully chosen
  <em>partial</em> aggregates such that any range is assembled from O(log n) of
  them and any element belongs to only O(log n) of them.
</p>

<h3>The segment tree: one node per range</h3>
<p>
  Build a binary tree over index ranges. The root covers [0, n−1], each internal
  node splits its range in half, and leaves are single elements. Every node
  caches the aggregate of its range. A query for [l, r] descends from the root
  and stops the instant a node's range is fully contained — so an arbitrary
  range is covered by at most 2 nodes per level, i.e. O(log n) nodes total.
</p>

<figure>
  <svg viewBox="0 0 640 260" class="dg" role="img" aria-label="A segment tree over the eight element array 3 1 4 1 5 9 2 6, with the two nodes that answer a query for the range two to five highlighted in green">
    <g class="rough">
      <path class="ln" d="M320,42 L160,102" />
      <path class="ln" d="M320,42 L480,102" />
      <path class="ln" d="M160,102 L80,162" />
      <path class="lng" d="M160,102 L240,162" />
      <path class="lng" d="M480,102 L400,162" />
      <path class="ln" d="M480,102 L560,162" />
      <path class="ln" d="M80,162 L40,222" /><path class="ln" d="M80,162 L120,222" />
      <path class="ln" d="M240,162 L200,222" /><path class="ln" d="M240,162 L280,222" />
      <path class="ln" d="M400,162 L360,222" /><path class="ln" d="M400,162 L440,222" />
      <path class="ln" d="M560,162 L520,222" /><path class="ln" d="M560,162 L600,222" />
    </g>
    <g class="rough">
      <rect class="box" x="277" y="26" width="86" height="32" rx="6" />
      <rect class="box" x="122" y="86" width="76" height="32" rx="6" />
      <rect class="box" x="442" y="86" width="76" height="32" rx="6" />
      <rect class="box" x="47" y="146" width="66" height="32" rx="6" />
      <rect class="boxg" x="207" y="146" width="66" height="32" rx="6" />
      <rect class="boxg" x="367" y="146" width="66" height="32" rx="6" />
      <rect class="box" x="527" y="146" width="66" height="32" rx="6" />
      <rect class="box" x="18" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="98" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="178" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="258" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="338" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="418" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="498" y="206" width="44" height="30" rx="5" />
      <rect class="box" x="578" y="206" width="44" height="30" rx="5" />
    </g>
    <text class="sm" x="320" y="47" text-anchor="middle">[0..7] = 31</text>
    <text class="sm" x="160" y="107" text-anchor="middle">[0..3] = 9</text>
    <text class="sm" x="480" y="107" text-anchor="middle">[4..7] = 22</text>
    <text class="sm" x="80" y="167" text-anchor="middle">[0..1]=4</text>
    <text class="sm gr" x="240" y="167" text-anchor="middle">[2..3]=5</text>
    <text class="sm gr" x="400" y="167" text-anchor="middle">[4..5]=14</text>
    <text class="sm" x="560" y="167" text-anchor="middle">[6..7]=8</text>
    <text class="sm" x="40" y="226" text-anchor="middle">3</text>
    <text class="sm" x="120" y="226" text-anchor="middle">1</text>
    <text class="sm" x="200" y="226" text-anchor="middle">4</text>
    <text class="sm" x="280" y="226" text-anchor="middle">1</text>
    <text class="sm" x="360" y="226" text-anchor="middle">5</text>
    <text class="sm" x="440" y="226" text-anchor="middle">9</text>
    <text class="sm" x="520" y="226" text-anchor="middle">2</text>
    <text class="sm" x="600" y="226" text-anchor="middle">6</text>
    <text class="lbl gr" x="20" y="20" style="font-size:14px">query(2, 5) = [2..3] + [4..5] = 5 + 14 = 19 — two nodes, not four leaves</text>
  </svg>
  <figcaption>Any range decomposes into O(log n) fully-covered nodes. Changing one leaf only touches the log n ancestors above it, which is where the fast update comes from.</figcaption>
</figure>

<h3>Build, query, update</h3>
<p>
  Store the tree in a flat array with the heap layout: node 1 is the root, node
  k's children are 2k and 2k+1. Every recursive call carries the range it owns
  (<code>lo</code>, <code>hi</code>) so no range metadata is stored per node.
</p>
<pre><code>class SegmentTree {
  constructor(nums) {
    this.n = nums.length;
    this.t = new Array(4 * this.n).fill(0); <span class="c">// 4n is the safe size — see the warning below</span>
    if (this.n > 0) this._build(nums, 1, 0, this.n - 1);
  }

  _build(nums, node, lo, hi) {
    if (lo === hi) { this.t[node] = nums[lo]; return; } <span class="c">// leaf</span>
    const mid = (lo + hi) >> 1;
    this._build(nums, 2 * node, lo, mid);
    this._build(nums, 2 * node + 1, mid + 1, hi);
    this.t[node] = this.t[2 * node] + this.t[2 * node + 1]; <span class="c">// merge children upward</span>
  }

  <span class="c">// sum of nums[l..r] inclusive — O(log n)</span>
  query(l, r, node = 1, lo = 0, hi = this.n - 1) {
    if (r < lo || hi < l) return 0;              <span class="c">// no overlap — return the IDENTITY, not 0 blindly</span>
    if (l <= lo && hi <= r) return this.t[node]; <span class="c">// total overlap — cached answer, stop descending</span>
    const mid = (lo + hi) >> 1;                  <span class="c">// partial overlap — split and combine</span>
    return this.query(l, r, 2 * node, lo, mid)
         + this.query(l, r, 2 * node + 1, mid + 1, hi);
  }

  <span class="c">// set nums[i] = value — O(log n), touches exactly one root-to-leaf path</span>
  update(i, value, node = 1, lo = 0, hi = this.n - 1) {
    if (lo === hi) { this.t[node] = value; return; }
    const mid = (lo + hi) >> 1;
    if (i <= mid) this.update(i, value, 2 * node, lo, mid);
    else          this.update(i, value, 2 * node + 1, mid + 1, hi);
    this.t[node] = this.t[2 * node] + this.t[2 * node + 1]; <span class="c">// re-merge on the way back up</span>
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Two sizing/identity traps</span>
  <b>4n, not 2n.</b> When n isn't a power of two the tree is unbalanced in the
  heap layout and indices can reach just past 2n; 4n is the standard safe
  over-allocation (the tight bound is 2·2<sup>⌈log₂ n⌉</sup>, which is easier
  to just round up than to compute). <b>The no-overlap return must be the
  operation's identity.</b> Returning 0 is right for sum, catastrophically
  wrong for min — a min tree must return <code>Infinity</code> there, or every
  query gets dragged to 0.
</div>

<h3>Range min, max, gcd — only the merge changes</h3>
<p>
  Nothing about the traversal is sum-specific. Swap the merge function and the
  identity element and the same tree answers a different question. The only
  requirement is that the operation be <b>associative</b> — the tree combines
  sub-answers in a fixed nesting, so order of grouping must not matter.
</p>
<table>
  <tr><th>Query</th><th>merge(a, b)</th><th>identity (no-overlap return)</th><th>Fenwick can do it?</th></tr>
  <tr><td>range sum</td><td><code>a + b</code></td><td><code>0</code></td><td>yes — subtraction inverts it</td></tr>
  <tr><td>range min</td><td><code>Math.min(a, b)</code></td><td><code>Infinity</code></td><td>no — prefix min can't be un-done</td></tr>
  <tr><td>range max</td><td><code>Math.max(a, b)</code></td><td><code>-Infinity</code></td><td>no</td></tr>
  <tr><td>range gcd</td><td><code>gcd(a, b)</code></td><td><code>0</code></td><td>no</td></tr>
  <tr><td>range XOR</td><td><code>a ^ b</code></td><td><code>0</code></td><td>yes — XOR is its own inverse</td></tr>
  <tr><td>count of a value</td><td><code>a + b</code></td><td><code>0</code></td><td>yes</td></tr>
</table>
<p class="sub">
  That last column is the deep reason the two structures aren't interchangeable.
  A Fenwick tree answers range queries as <code>prefix(r) − prefix(l−1)</code>,
  which needs an <em>invertible</em> operation. Min has no inverse — you cannot
  recover min(l..r) from min(0..r) and min(0..l−1) — so range-min genuinely
  requires a segment tree (or, if the array never changes, a sparse table).
</p>

<h3>Lazy propagation: range updates without touching every leaf</h3>
<p>
  Now let updates be ranges too: "add 5 to everything in [l, r]." Doing that
  with point updates is O(n log n) per operation — worse than a plain loop. The
  fix is to be lazy: when a node's range is fully inside the update range, apply
  the change to <em>that node's aggregate only</em> and leave an IOU on it
  saying "my children still owe this." The IOU is pushed down one level at a
  time, and only when someone actually descends through that node.
</p>
<p>
  The whole technique is two rules. <b>Push before you look</b> — any node you
  visit must settle its debt before you read or split it. <b>Stop at total
  coverage</b> — record the IOU and return without recursing. Together they keep
  every range update at O(log n).
</p>
<pre><code>class LazySumTree {
  constructor(n) {
    this.n = n;
    this.t = new Array(4 * n).fill(0);
    this.lazy = new Array(4 * n).fill(0); <span class="c">// pending "+x to every element in my range"</span>
  }

  _push(node, lo, hi) {
    const add = this.lazy[node];
    if (add === 0) return;
    this.t[node] += add * (hi - lo + 1); <span class="c">// a range add of x raises the SUM by x * width</span>
    if (lo !== hi) {                      <span class="c">// leaves have nobody to hand the debt to</span>
      this.lazy[2 * node] += add;
      this.lazy[2 * node + 1] += add;
    }
    this.lazy[node] = 0;
  }

  rangeAdd(l, r, add, node = 1, lo = 0, hi = this.n - 1) {
    this._push(node, lo, hi);            <span class="c">// settle before doing anything else</span>
    if (r < lo || hi < l) return;
    if (l <= lo && hi <= r) {            <span class="c">// fully covered — take the IOU and STOP</span>
      this.lazy[node] += add;
      this._push(node, lo, hi);          <span class="c">// apply to this node so its parent can re-merge</span>
      return;
    }
    const mid = (lo + hi) >> 1;
    this.rangeAdd(l, r, add, 2 * node, lo, mid);
    this.rangeAdd(l, r, add, 2 * node + 1, mid + 1, hi);
    this.t[node] = this.t[2 * node] + this.t[2 * node + 1];
  }

  query(l, r, node = 1, lo = 0, hi = this.n - 1) {
    this._push(node, lo, hi);            <span class="c">// same rule on the read path</span>
    if (r < lo || hi < l) return 0;
    if (l <= lo && hi <= r) return this.t[node];
    const mid = (lo + hi) >> 1;
    return this.query(l, r, 2 * node, lo, mid)
         + this.query(l, r, 2 * node + 1, mid + 1, hi);
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Forgetting <code>* (hi - lo + 1)</code>, and mixing update kinds</span>
  Adding x to a range of width w raises that node's <em>sum</em> by x·w, not by
  x. On a min/max tree it really is just <code>+= x</code> (adding a constant
  shifts the minimum by that constant), so the multiplier is sum-specific — get
  it wrong and small tests still pass because width-1 leaves are correct.
  Separately: "add x to a range" and "assign x to a range" are different lazy
  values and cannot share one field naively — if a problem needs both, store the
  assignment tag and the pending add together, and apply assignment first.
</div>

<h3>Fenwick tree: the same job in a quarter of the code</h3>
<p>
  A Binary Indexed Tree does point-update / prefix-query with one flat array and
  two three-line loops. The idea: store in <code>t[k]</code> the sum of the
  <code>k &amp; -k</code> elements ending at k, where <code>k &amp; -k</code>
  isolates the lowest set bit. Then any prefix is assembled by repeatedly
  stripping the lowest set bit, and any index is updated by repeatedly adding it
  — both take as many steps as there are bits, so O(log n).
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Coverage ranges of a Fenwick tree over eight elements, with the three nodes that combine to form the prefix sum up to index seven highlighted in green">
    <g class="rough">
      <rect class="box"  x="30"  y="34"  width="60"  height="16" rx="3" />
      <rect class="box"  x="30"  y="56"  width="130" height="16" rx="3" />
      <rect class="box"  x="170" y="78"  width="60"  height="16" rx="3" />
      <rect class="boxg" x="30"  y="100" width="270" height="16" rx="3" />
      <rect class="box"  x="310" y="122" width="60"  height="16" rx="3" />
      <rect class="boxg" x="310" y="144" width="130" height="16" rx="3" />
      <rect class="boxg" x="450" y="166" width="60"  height="16" rx="3" />
      <rect class="box"  x="30"  y="188" width="550" height="16" rx="3" />
    </g>
    <text class="sm" x="36" y="47">t[1]</text>
    <text class="sm" x="36" y="69">t[2]</text>
    <text class="sm" x="176" y="91">t[3]</text>
    <text class="sm gr" x="36" y="113">t[4] — covers 1..4</text>
    <text class="sm" x="316" y="135">t[5]</text>
    <text class="sm gr" x="316" y="157">t[6] — covers 5..6</text>
    <text class="sm gr" x="456" y="179">t[7]</text>
    <text class="sm" x="36" y="201">t[8] — covers 1..8</text>
    <text class="sm" x="60" y="226" text-anchor="middle">1</text>
    <text class="sm" x="130" y="226" text-anchor="middle">2</text>
    <text class="sm" x="200" y="226" text-anchor="middle">3</text>
    <text class="sm" x="270" y="226" text-anchor="middle">4</text>
    <text class="sm" x="340" y="226" text-anchor="middle">5</text>
    <text class="sm" x="410" y="226" text-anchor="middle">6</text>
    <text class="sm" x="480" y="226" text-anchor="middle">7</text>
    <text class="sm" x="550" y="226" text-anchor="middle">8</text>
    <text class="lbl gr" x="20" y="20" style="font-size:14px">prefix(7) = t[7] + t[6] + t[4] — strip the lowest set bit: 7 → 6 → 4 → 0</text>
    <text class="sm rd" x="20" y="245">update(3) walks the other way, adding the low bit: 3 → 4 → 8</text>
  </svg>
  <figcaption>Each cell covers a power-of-two-sized block ending at its own index. Query walks left by removing low bits, update walks right by adding them — never more than log n steps either way.</figcaption>
</figure>

<pre><code>class Fenwick {
  constructor(n) {
    this.n = n;
    this.t = new Array(n + 1).fill(0); <span class="c">// 1-INDEXED internally; index 0 is unusable</span>
  }

  <span class="c">// add delta at 0-indexed position i — O(log n)</span>
  update(i, delta) {
    for (let k = i + 1; k <= this.n; k += k & -k) this.t[k] += delta;
  }

  <span class="c">// sum of nums[0..i] inclusive — O(log n)</span>
  prefix(i) {
    let sum = 0;
    for (let k = i + 1; k > 0; k -= k & -k) sum += this.t[k];
    return sum;
  }

  range(l, r) {
    return this.prefix(r) - (l > 0 ? this.prefix(l - 1) : 0); <span class="c">// needs an invertible op</span>
  }

  <span class="c">// O(n) build — much better than n calls to update(), which is O(n log n)</span>
  static from(nums) {
    const f = new Fenwick(nums.length);
    for (let i = 0; i < nums.length; i++) f.t[i + 1] += nums[i];
    for (let k = 1; k <= f.n; k++) {
      const parent = k + (k & -k);
      if (parent <= f.n) f.t[parent] += f.t[k]; <span class="c">// push each cell into the one that contains it</span>
    }
    return f;
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Fenwick stores <em>deltas</em>, not values</span>
  <code>update(i, delta)</code> <b>adds</b>; it does not assign. To <em>set</em>
  <code>nums[i] = v</code> you must keep the raw array alongside and call
  <code>update(i, v - nums[i])</code>, then write <code>nums[i] = v</code>.
  Passing the new value straight in is the single most common Fenwick bug, and
  it produces plausible-looking wrong answers rather than a crash. Related: the
  1-indexing is not stylistic — <code>k & -k</code> is 0 when k is 0, so a
  0-indexed loop never terminates.
</div>

<h3>Why Fenwick usually wins in practice</h3>
<p>
  Both are O(log n), but the constants differ a lot. The Fenwick array is n+1
  entries versus 4n; the loops are iterative with no recursion, no range
  bookkeeping and no branching; and access is a tight sequence of index
  arithmetic that the cache handles well. Expect a 2–4× real-time speedup and
  roughly a quarter of the code. It is also far easier to write correctly under
  interview pressure — two loops with no off-by-one range logic.
</p>
<p class="sub">
  The price is expressiveness. Fenwick does point-update + prefix-query of an
  invertible operation, and (via a difference array) range-update + point-query.
  Everything else — range min/max, range update <em>and</em> range query
  together, "find the k-th element," storing anything richer than a number per
  node — is segment tree territory.
</p>

<h3>Count of smaller numbers after self — the classic BIT problem</h3>
<p>
  For each element, how many elements to its right are strictly smaller? Brute
  force is O(n²). The trick is to sweep right-to-left over <em>value ranks</em>
  instead of positions: a Fenwick tree over ranks makes "how many already-seen
  values rank below this one?" a single prefix query.
</p>
<pre><code><span class="c">// O(n log n) time, O(n) space</span>
function countSmaller(nums) {
  <span class="c">// coordinate compression: values can be huge/negative, ranks are 0..m-1</span>
  const sorted = [...new Set(nums)].sort((a, b) => a - b);
  const rank = new Map(sorted.map((v, i) => [v, i]));

  const bit = new Fenwick(sorted.length);
  const res = new Array(nums.length);

  for (let i = nums.length - 1; i >= 0; i--) { <span class="c">// right to left: "seen" == "to my right"</span>
    const r = rank.get(nums[i]);
    res[i] = r > 0 ? bit.prefix(r - 1) : 0; <span class="c">// count of seen values with a STRICTLY lower rank</span>
    bit.update(r, 1);                        <span class="c">// now this element counts as seen</span>
  }
  return res;
}</code></pre>
<p class="sub">
  Coordinate compression is the reusable half of this idea: whenever you want a
  Fenwick indexed by value but values are unbounded, sort the distinct values
  and index by rank. The same right-to-left + BIT skeleton solves counting
  inversions, "reverse pairs," and range-sum-count problems — recognising the
  skeleton is worth more than memorising any one of them.
</p>

<div class="say">
  <span class="ttl">Say it like this →</span> "Queries and updates are
  interleaved, so a prefix-sum array would cost O(n) per update. I'll use a
  Fenwick tree — point update and prefix query both O(log n), and range sum is
  just the difference of two prefixes. If the problem needed range minimum, or
  range updates as well as range queries, I'd move to a segment tree with lazy
  propagation instead, since min has no inverse and Fenwick can't do it."
</div>

<h3>Which one to reach for</h3>
<table>
  <tr><th>Workload</th><th>Use</th><th>Why</th></tr>
  <tr><td>Static array, many range queries</td><td><b>Prefix-sum array</b></td><td>O(1) queries; a tree is pure overhead</td></tr>
  <tr><td>Static array, range <em>min/max</em> only</td><td><b>Sparse table</b></td><td>O(n log n) build, O(1) query, no updates</td></tr>
  <tr><td>Point update + prefix/range <b>sum</b></td><td><b>Fenwick</b></td><td>smallest, fastest, hardest to get wrong</td></tr>
  <tr><td>Range update + <em>point</em> query</td><td><b>Fenwick over a difference array</b></td><td>add x at l, subtract x at r+1; point value = prefix sum</td></tr>
  <tr><td>Point update + range <b>min/max/gcd</b></td><td><b>Segment tree</b></td><td>non-invertible merge — prefixes can't be subtracted</td></tr>
  <tr><td>Range update + range query</td><td><b>Segment tree + lazy</b></td><td>the only one of the three that can defer work</td></tr>
  <tr><td>Rich per-node state (max subarray, k-th element, merge sort tree)</td><td><b>Segment tree</b></td><td>a node can hold a struct, not just a number</td></tr>
  <tr><td>2D grid sums with updates</td><td><b>2D Fenwick</b></td><td>nested loops over both dimensions, O(log² n)</td></tr>
</table>

<div class="sticky mint">
  <span class="ttl">One sentence to keep</span>
  A prefix-sum array is a segment tree that gave up on updates; a Fenwick tree
  is a segment tree that gave up on everything except invertible prefixes. Start
  at the cheapest one that still answers the question, and only climb when the
  workload forces you to.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Queries and <b>updates are interleaved</b> over the same array — that single word "update" is what rules out a prefix-sum array</li>
  <li>Constraints around n, q ≥ 10<sup>5</sup> with per-query work implied — O(n·q) is 10<sup>10</sup>, so an O(log n) per operation structure is the intended answer</li>
  <li>Brute force is "recompute the range every time"; the fix is caching O(n) partial aggregates so any range is O(log n) of them</li>
  <li>Sum-like and invertible (sum, XOR, count) → Fenwick. Min/max/gcd, or updates that span ranges → segment tree</li>
  <li>"How many earlier/later elements are smaller/larger" or "count inversions" → sweep in one direction with a Fenwick over compressed value ranks, not over positions</li>
  <li>Distinguish from a heap: a heap gives you the global min/max with updates, but cannot answer <em>a specific range</em>. Distinguish from a sorted structure: if you need order statistics <em>plus</em> ranges, that's a Fenwick over ranks</li>
  <li>If the array never changes after construction, stop — prefix sums or a sparse table, and say why you didn't build a tree</li>
</ul>`,
    },
    {
      id: "dsa-string-algorithms",
      num: "A7",
      title: "String algorithms",
      short: "String algorithms",
      levels: ["advanced"],
      practice: ["ex-implement-strstr"],
      ready: true,
      subtitle: "Preprocess the pattern once, and you never have to look backward in the text again.",
      body: `<h3>The insight: a mismatch still tells you something</h3>
<p>
  The naive substring search tries every alignment and, on a mismatch,
  throws away everything it just learned — it slides the pattern one step
  right and re-compares from character zero. That's O(n·m). But a
  mismatch after <em>k</em> matched characters is not zero information:
  you now know exactly what the last k characters of the text were, because
  they were the first k characters of the pattern. Every fast string
  algorithm in this chapter is a different way of cashing in that
  information.
</p>
<figure>
  <svg viewBox="0 0 640 230" class="dg" role="img" aria-label="A pattern aligned against a text, mismatching at its last character, with the naive one-step shift compared against the KMP shift of two that reuses the already-matched prefix">
    <g class="rough">
      <rect class="box" x="20" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="58" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="96" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="134" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="172" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="210" y="42" width="38" height="36" rx="4" />
      <rect class="box" x="248" y="42" width="38" height="36" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxg" x="20" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="58" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="96" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="134" y="96" width="38" height="36" rx="4" />
      <rect class="boxg" x="172" y="96" width="38" height="36" rx="4" />
      <rect class="boxr" x="210" y="96" width="38" height="36" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxg" x="96" y="155" width="38" height="36" rx="4" />
      <rect class="boxg" x="134" y="155" width="38" height="36" rx="4" />
      <rect class="boxg" x="172" y="155" width="38" height="36" rx="4" />
      <rect class="box" x="210" y="155" width="38" height="36" rx="4" />
      <rect class="box" x="248" y="155" width="38" height="36" rx="4" />
      <rect class="box" x="286" y="155" width="38" height="36" rx="4" />
    </g>
    <text class="sm" x="20" y="32">text</text>
    <text class="sm" x="39" y="66" text-anchor="middle">a</text>
    <text class="sm" x="77" y="66" text-anchor="middle">b</text>
    <text class="sm" x="115" y="66" text-anchor="middle">a</text>
    <text class="sm" x="153" y="66" text-anchor="middle">b</text>
    <text class="sm" x="191" y="66" text-anchor="middle">a</text>
    <text class="sm" x="229" y="66" text-anchor="middle">b</text>
    <text class="sm" x="267" y="66" text-anchor="middle">c</text>
    <text class="sm" x="39" y="120" text-anchor="middle">a</text>
    <text class="sm" x="77" y="120" text-anchor="middle">b</text>
    <text class="sm" x="115" y="120" text-anchor="middle">a</text>
    <text class="sm" x="153" y="120" text-anchor="middle">b</text>
    <text class="sm" x="191" y="120" text-anchor="middle">a</text>
    <text class="sm rd" x="229" y="120" text-anchor="middle">c</text>
    <text class="sm" x="115" y="179" text-anchor="middle">a</text>
    <text class="sm" x="153" y="179" text-anchor="middle">b</text>
    <text class="sm" x="191" y="179" text-anchor="middle">a</text>
    <text class="sm" x="229" y="179" text-anchor="middle">b</text>
    <text class="sm" x="267" y="179" text-anchor="middle">a</text>
    <text class="sm" x="305" y="179" text-anchor="middle">c</text>
    <text class="lbl" x="340" y="62" style="font-size:14px">5 characters match</text>
    <text class="lbl rd" x="340" y="112" style="font-size:14px">mismatch at p[5]</text>
    <text class="sm" x="340" y="134">naive: shift 1, recompare all 6</text>
    <text class="lbl gr" x="340" y="168" style="font-size:14px">KMP: fail[4] = 3</text>
    <text class="sm gr" x="340" y="190">keep the matched "aba",</text>
    <text class="sm gr" x="340" y="208">shift 2, resume at p[3]</text>
  </svg>
  <figcaption>The three already-matched characters in the shifted row were never re-read from the text — that reuse is the entire speedup.</figcaption>
</figure>

<h3>The prefix function: what KMP actually precomputes</h3>
<p>
  For a pattern <code>p</code>, define <code>fail[i]</code> as the length of
  the longest <b>proper</b> prefix of <code>p[0..i]</code> that is also a
  suffix of <code>p[0..i]</code>. "Proper" means it can't be the whole thing
  — otherwise the answer would trivially always be <code>i + 1</code>. This
  single array is all KMP needs: when a mismatch happens after
  <code>len</code> matched characters, <code>fail[len - 1]</code> tells you
  the largest number of characters you may keep without re-reading the text.
</p>
<figure>
  <svg viewBox="0 0 640 240" class="dg" role="img" aria-label="The failure table for the pattern ababaca, showing each character above its failure value, with an arc marking the fallback from index five back to index two">
    <g class="rough">
      <rect class="box" x="40" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="90" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="140" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="190" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="240" y="52" width="50" height="42" rx="4" />
      <rect class="boxr" x="290" y="52" width="50" height="42" rx="4" />
      <rect class="box" x="340" y="52" width="50" height="42" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxy" x="40" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="90" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="140" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="190" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="240" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="290" y="100" width="50" height="40" rx="4" />
      <rect class="boxy" x="340" y="100" width="50" height="40" rx="4" />
    </g>
    <g class="rough">
      <path class="lnr dash" d="M315,144 C305,196 185,196 165,144" />
    </g>
    <text class="sm" x="65" y="44" text-anchor="middle">0</text>
    <text class="sm" x="115" y="44" text-anchor="middle">1</text>
    <text class="sm" x="165" y="44" text-anchor="middle">2</text>
    <text class="sm" x="215" y="44" text-anchor="middle">3</text>
    <text class="sm" x="265" y="44" text-anchor="middle">4</text>
    <text class="sm" x="315" y="44" text-anchor="middle">5</text>
    <text class="sm" x="365" y="44" text-anchor="middle">6</text>
    <text class="sm" x="65" y="79" text-anchor="middle">a</text>
    <text class="sm" x="115" y="79" text-anchor="middle">b</text>
    <text class="sm" x="165" y="79" text-anchor="middle">a</text>
    <text class="sm" x="215" y="79" text-anchor="middle">b</text>
    <text class="sm" x="265" y="79" text-anchor="middle">a</text>
    <text class="sm rd" x="315" y="79" text-anchor="middle">c</text>
    <text class="sm" x="365" y="79" text-anchor="middle">a</text>
    <text class="sm" x="65" y="126" text-anchor="middle">0</text>
    <text class="sm" x="115" y="126" text-anchor="middle">0</text>
    <text class="sm" x="165" y="126" text-anchor="middle">1</text>
    <text class="sm" x="215" y="126" text-anchor="middle">2</text>
    <text class="sm" x="265" y="126" text-anchor="middle">3</text>
    <text class="sm" x="315" y="126" text-anchor="middle">0</text>
    <text class="sm" x="365" y="126" text-anchor="middle">1</text>
    <text class="sm rd" x="240" y="212" text-anchor="middle">len falls 3 → 1 → 0 before 'c' settles</text>
    <text class="lbl" x="404" y="66" style="font-size:13px">fail[i] = longest proper</text>
    <text class="lbl" x="404" y="84" style="font-size:13px">prefix of p[0..i] that is</text>
    <text class="lbl" x="404" y="102" style="font-size:13px">also a suffix of p[0..i]</text>
    <text class="sm gr" x="404" y="132">p[0..4] = "ababa"</text>
    <text class="sm gr" x="404" y="150">prefix "aba" = suffix "aba"</text>
    <text class="sm gr" x="404" y="168">so fail[4] = 3</text>
  </svg>
  <figcaption>Notice index 5: a single character can force several fallbacks in a row, and that chain is exactly what keeps the build linear.</figcaption>
</figure>

<h3>Building the failure table, step by step</h3>
<p>
  The build is the same algorithm as the search, run with the pattern
  matched against itself. <code>len</code> holds "how many characters of the
  prefix currently match the suffix ending at <code>i - 1</code>". On a
  mismatch you don't reset <code>len</code> to 0 — you fall back to the next
  shorter candidate, <code>fail[len - 1]</code>, and try again.
</p>
<pre><code><span class="c">// prefix function / failure table — O(m) time, O(m) space</span>
function buildFailure(pattern) {
  const fail = new Array(pattern.length).fill(0);
  let len = 0; <span class="c">// length of the current prefix-suffix match</span>

  for (let i = 1; i &lt; pattern.length; i++) { <span class="c">// fail[0] is always 0 — a single char has no proper prefix</span>
    while (len > 0 &amp;&amp; pattern[i] !== pattern[len]) {
      len = fail[len - 1]; <span class="c">// fall back to the next-shorter border, don't reset to 0</span>
    }
    if (pattern[i] === pattern[len]) len++;
    fail[i] = len;
  }
  return fail;
}

buildFailure("ababaca"); <span class="c">// [0, 0, 1, 2, 3, 0, 1]</span></code></pre>
<table>
  <tr><th>i</th><th>p[i]</th><th>len before</th><th>fallback chain</th><th>fail[i]</th></tr>
  <tr><td>1</td><td>b</td><td>0</td><td>—</td><td>0</td></tr>
  <tr><td>2</td><td>a</td><td>0</td><td>—</td><td>1</td></tr>
  <tr><td>3</td><td>b</td><td>1</td><td>—</td><td>2</td></tr>
  <tr><td>4</td><td>a</td><td>2</td><td>—</td><td>3</td></tr>
  <tr><td>5</td><td>c</td><td>3</td><td>3 → fail[2]=1 → fail[0]=0</td><td>0</td></tr>
  <tr><td>6</td><td>a</td><td>0</td><td>—</td><td>1</td></tr>
</table>
<p class="sub">
  The <code>while</code> loop looks like it could make this quadratic. It
  can't: <code>len</code> grows by at most 1 per iteration of the outer
  loop, so across the whole build it increases at most m times — and the
  <code>while</code> loop only ever <em>decreases</em> it. Total decreases
  ≤ total increases ≤ m. This is the same amortized argument as the sliding
  window's left pointer, and it is the sentence to say out loud.
</p>

<h3>KMP search: the text pointer never moves backward</h3>
<pre><code><span class="c">// all occurrences of pattern in text — O(n + m) time, O(m) space</span>
function kmpSearch(text, pattern) {
  if (pattern.length === 0) return [0];
  const fail = buildFailure(pattern);
  const hits = [];
  let len = 0; <span class="c">// how many pattern chars currently matched</span>

  for (let i = 0; i &lt; text.length; i++) { <span class="c">// i only ever increases — no backtracking in the text</span>
    while (len > 0 &amp;&amp; text[i] !== pattern[len]) {
      len = fail[len - 1];
    }
    if (text[i] === pattern[len]) len++;

    if (len === pattern.length) {
      hits.push(i - pattern.length + 1);
      len = fail[len - 1]; <span class="c">// keep going — allows overlapping matches</span>
    }
  }
  return hits;
}

kmpSearch("aaaaa", "aa"); <span class="c">// [0, 1, 2, 3] — overlaps included</span></code></pre>
<div class="sticky mint">
  <span class="ttl">The one-line mental model</span>
  KMP is a state machine whose state is "how many characters of the pattern
  I've matched so far." Reading a text character either advances the state
  by one or drops it to a strictly smaller state — and it never rewinds the
  input. That's why it streams: you can feed KMP a network socket you can't
  seek backward in.
</div>
<div class="warn">
  <span class="ttl">⚠ After a full match, resetting len to 0 loses overlaps</span>
  If the question is "count occurrences of <code>aa</code> in
  <code>aaaa</code>," the answer is 3, not 2. Setting <code>len = 0</code>
  after a hit gives you the non-overlapping count. Setting
  <code>len = fail[len - 1]</code> gives you overlapping matches. Ask the
  interviewer which they want — and note that you deliberately chose.
</div>

<h3>Rabin-Karp: compare hashes, not characters</h3>
<p>
  KMP is clever about <em>which</em> comparisons to skip. Rabin-Karp is
  clever about making each comparison O(1): treat every length-m window of
  the text as a base-B number mod a large prime, and roll that number
  forward as the window slides — subtract the outgoing character's
  contribution, multiply by the base, add the incoming character. A window
  can only be a match if its hash equals the pattern's hash, so you compare
  m characters only on a hash hit.
</p>
<pre><code><span class="c">// Rabin-Karp — O(n + m) expected, O(n·m) worst case, O(1) extra space</span>
const BASE = 256;
const MOD = 1000000007; <span class="c">// large prime → collisions are rare, not impossible</span>

function rabinKarp(text, pattern) {
  const n = text.length, m = pattern.length;
  if (m === 0 || m > n) return [];

  let high = 1; <span class="c">// BASE^(m-1) mod MOD — the weight of the leftmost char</span>
  for (let i = 0; i &lt; m - 1; i++) high = (high * BASE) % MOD;

  let patHash = 0, winHash = 0;
  for (let i = 0; i &lt; m; i++) {
    patHash = (patHash * BASE + pattern.charCodeAt(i)) % MOD;
    winHash = (winHash * BASE + text.charCodeAt(i)) % MOD;
  }

  const hits = [];
  for (let i = 0; i + m &lt;= n; i++) {
    <span class="c">// hash equality is necessary but NOT sufficient — always verify</span>
    if (winHash === patHash &amp;&amp; text.startsWith(pattern, i)) hits.push(i);

    if (i + m &lt; n) {
      winHash = (winHash - (text.charCodeAt(i) * high) % MOD + MOD) % MOD; <span class="c">// drop the left char (+MOD keeps it non-negative)</span>
      winHash = (winHash * BASE + text.charCodeAt(i + m)) % MOD;           <span class="c">// shift left, add the right char</span>
    }
  }
  return hits;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Two bugs that bite everyone who writes this from memory</span>
  <b>(1) Negative modulo.</b> JavaScript's <code>%</code> returns a negative
  result for negative operands, so <code>-3 % 7</code> is <code>-3</code>,
  not <code>4</code>. Always add <code>MOD</code> back before the final
  <code>%</code>. <b>(2) Silent overflow.</b> JS numbers are exact only up
  to 2⁵³. With <code>MOD</code> near 10⁹, the product
  <code>winHash * BASE</code> reaches ~2.6 × 10¹¹ and
  <code>charCode * high</code> reaches ~6.5 × 10¹³ — both safe. Push
  <code>MOD</code> to 10¹² "because bigger is better" and the products
  silently lose precision and the algorithm returns wrong answers on large
  inputs. Use <code>BigInt</code> if you truly need a bigger modulus.
</div>
<p class="sub">
  Collisions are handled by the <code>startsWith</code> verification, so
  Rabin-Karp is never <em>wrong</em> — only occasionally slow. An adversary
  who knows your BASE and MOD can construct a text where every window
  collides, degrading it to O(n·m); production implementations pick BASE
  randomly at startup for exactly this reason. Mentioning that unprompted
  reads as real experience.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Rabin-Karp buys me O(1) per
  window with a rolling hash, and I verify on hash equality so collisions
  cost time but never correctness. I'd reach for it over KMP when I'm
  searching for <em>many</em> patterns of the same length at once — I hash
  all of them into a set and still do one pass — or for 2D pattern search,
  where KMP doesn't generalize cleanly."
</div>

<h3>The Z-function: the same information, easier to reason about</h3>
<p>
  <code>z[i]</code> is the length of the longest substring starting at
  <code>i</code> that is also a prefix of the whole string. It's computed
  with a "Z-box" — the rightmost interval <code>[l, r]</code> known to match
  a prefix — which lets you copy an already-known answer from the mirror
  position instead of recomputing it. Many people find Z easier to derive
  under pressure than KMP's failure table, and it solves substring search by
  a trick: concatenate.
</p>
<pre><code><span class="c">// Z-function — O(n) time, O(n) space</span>
function zFunction(s) {
  const n = s.length;
  const z = new Array(n).fill(0);
  z[0] = n;
  let l = 0, r = 0; <span class="c">// [l, r) = rightmost segment known to match a prefix</span>

  for (let i = 1; i &lt; n; i++) {
    if (i &lt; r) z[i] = Math.min(r - i, z[i - l]); <span class="c">// reuse the mirror, clamped to the box</span>
    while (i + z[i] &lt; n &amp;&amp; s[z[i]] === s[i + z[i]]) z[i]++; <span class="c">// extend past the box the slow way</span>
    if (i + z[i] > r) { l = i; r = i + z[i]; } <span class="c">// this match reaches further right — adopt it</span>
  }
  return z;
}

<span class="c">// substring search: glue with a separator that appears in neither string</span>
function zSearch(text, pattern) {
  const combined = pattern + " " + text;
  const z = zFunction(combined);
  const hits = [];
  for (let i = pattern.length + 1; i &lt; combined.length; i++) {
    if (z[i] === pattern.length) hits.push(i - pattern.length - 1);
  }
  return hits;
}</code></pre>
<p class="sub">
  The separator must be a character that cannot occur in either string,
  otherwise a "match" could straddle the boundary and report a false hit.
  <code>" "</code> is a safe default for arbitrary text; interviewers
  often accept <code>"#"</code> with a stated assumption.
</p>

<h3>Manacher's algorithm: every palindrome, in O(n)</h3>
<p>
  Expand-around-center for the longest palindromic substring is O(n²): 2n−1
  centers, each expansion up to O(n). Manacher makes it linear with the same
  reuse idea as the Z-function — a palindrome centered at <code>c</code>
  reaching to <code>right</code> means positions inside it are mirror images
  of positions already solved, so you start each expansion from a known
  lower bound rather than from zero.
</p>
<p>
  First, the unification trick. Odd-length and even-length palindromes need
  different center handling, which is where most hand-written attempts get
  tangled. Interleave a separator: <code>"abba"</code> becomes
  <code>"#a#b#b#a#"</code>. The transformed string always has odd length
  <code>2n + 1</code>, so <em>every</em> palindrome in it is odd-length and
  has a single character center — even-length palindromes of the original
  become odd-length palindromes centered on a <code>#</code>. Better still,
  the radius <code>p[i]</code> in the transformed string is exactly the
  palindrome's <em>length</em> in the original string.
</p>
<table>
  <tr><th>original</th><th>transformed</th><th>center</th><th>radius p</th><th>original length</th></tr>
  <tr><td>"aba"</td><td>#a#b#a#</td><td>index 3 ('b')</td><td>3</td><td>3</td></tr>
  <tr><td>"abba"</td><td>#a#b#b#a#</td><td>index 4 ('#')</td><td>4</td><td>4</td></tr>
  <tr><td>"a"</td><td>#a#</td><td>index 1 ('a')</td><td>1</td><td>1</td></tr>
</table>
<pre><code><span class="c">// longest palindromic substring — O(n) time, O(n) space</span>
function longestPalindrome(s) {
  if (s.length &lt; 2) return s;

  const t = "#" + s.split("").join("#") + "#"; <span class="c">// always odd length: 2n + 1</span>
  const n = t.length;
  const p = new Array(n).fill(0); <span class="c">// p[i] = palindrome radius at i (= length in s)</span>
  let center = 0, right = 0; <span class="c">// rightmost palindrome found so far</span>

  for (let i = 0; i &lt; n; i++) {
    if (i &lt; right) {
      const mirror = 2 * center - i;
      p[i] = Math.min(right - i, p[mirror]); <span class="c">// clamp: beyond "right" nothing is verified yet</span>
    }
    <span class="c">// expand only past what the mirror already guaranteed</span>
    while (i - p[i] - 1 >= 0 &amp;&amp; i + p[i] + 1 &lt; n &amp;&amp;
           t[i - p[i] - 1] === t[i + p[i] + 1]) {
      p[i]++;
    }
    if (i + p[i] > right) { center = i; right = i + p[i]; } <span class="c">// new rightmost reach</span>
  }

  let best = 0, bestCenter = 0;
  for (let i = 0; i &lt; n; i++) {
    if (p[i] > best) { best = p[i]; bestCenter = i; }
  }
  const start = (bestCenter - best) / 2; <span class="c">// map transformed index back to s</span>
  return s.slice(start, start + best);
}

longestPalindrome("babad");   <span class="c">// "bab" (or "aba" — both valid)</span>
longestPalindrome("cbbd");    <span class="c">// "bb"</span>
longestPalindrome("forgeeksskeegfor"); <span class="c">// "geeksskeeg"</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ The clamp is what makes it linear, and it's the line people drop</span>
  <code>Math.min(right - i, p[mirror])</code> — without the
  <code>right - i</code> term you'd copy a mirror radius that extends past
  the verified region, and you'd report palindromes that don't exist.
  Without <code>p[mirror]</code> you'd start every expansion at 0 and be
  back to O(n²). The linearity argument: <code>right</code> only moves
  forward, and every iteration of the inner <code>while</code> loop pushes
  <code>right</code> one step further, so the total work in all expansions
  is bounded by n.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Expand-around-center is O(n²)
  and is a completely acceptable answer here — let me code that first, then
  I'll tell you how Manacher gets it to O(n). The trick is interleaving a
  separator so odd and even cases unify, then reusing the mirror radius
  inside the current rightmost palindrome so each expansion starts from a
  known lower bound instead of from scratch."
</div>
<p class="sub">
  That's a genuinely good interview move. Manacher is rarely <em>required</em>
  — but showing you know the O(n²) baseline, can implement it cleanly, and
  can explain the linear improvement is worth more than a memorized
  Manacher you can't justify.
</p>

<h3>Choosing between them</h3>
<table>
  <tr><th>Algorithm</th><th>Preprocess</th><th>Search</th><th>Extra space</th><th>Reach for it when</th></tr>
  <tr><td>Naive</td><td>—</td><td>O(n·m)</td><td>O(1)</td><td>m is tiny, or it's the stated baseline</td></tr>
  <tr><td>KMP</td><td>O(m)</td><td>O(n) guaranteed</td><td>O(m)</td><td>One pattern, worst-case guarantee needed, streaming input</td></tr>
  <tr><td>Rabin-Karp</td><td>O(m)</td><td>O(n) expected</td><td>O(1)</td><td>Many equal-length patterns, 2D search, dedup/fingerprinting</td></tr>
  <tr><td>Z-function</td><td>O(n+m)</td><td>O(n+m)</td><td>O(n+m)</td><td>Prefix-flavoured questions; easier to re-derive live</td></tr>
  <tr><td>Manacher</td><td>—</td><td>O(n)</td><td>O(n)</td><td>Palindromes specifically</td></tr>
</table>
<p class="sub">
  In real code you would call <code>indexOf</code>, which V8 implements with
  a tuned hybrid (a two-way / Boyer-Moore-Horspool variant). Say that too —
  knowing when <em>not</em> to hand-roll is part of the signal. These
  algorithms earn their keep when the built-in doesn't fit the shape:
  streaming, multi-pattern, or when the failure table itself is the answer
  (shortest palindrome, longest repeated prefix, string periodicity).
</p>

<h3>The failure table answers more than "where is the pattern"</h3>
<p>
  A surprising number of string questions reduce to "compute the prefix
  function and read one entry."
</p>
<pre><code><span class="c">// Shortest palindrome: prepend the fewest chars to make s a palindrome.</span>
<span class="c">// Trick: the answer hinges on the longest palindromic PREFIX of s.</span>
function shortestPalindrome(s) {
  const rev = s.split("").reverse().join("");
  const fail = buildFailure(s + " " + rev);
  const overlap = fail[fail.length - 1]; <span class="c">// longest prefix of s that is a suffix of reverse(s)</span>
  return rev.slice(0, s.length - overlap) + s;
}

<span class="c">// Smallest repeating unit: "abcabcabc" → "abc". Returns s itself if none.</span>
function repeatedUnit(s) {
  const fail = buildFailure(s);
  const period = s.length - fail[s.length - 1];
  return s.length % period === 0 ? s.slice(0, period) : s;
}</code></pre>
<p class="sub">
  <code>n - fail[n-1]</code> being the smallest period of a string is a
  genuinely useful identity — it's the whole answer to "Repeated Substring
  Pattern" and to several string-rotation questions.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>"Find all occurrences," "does A contain B," "how many times does the pattern appear" with n and m both large enough that O(n·m) times out — that's KMP or Rabin-Karp</li>
  <li>The input is a <em>stream</em>, or you're told you may not seek backward in the text — KMP is the only one of these that never rewinds the input pointer</li>
  <li>Several patterns, all the same length, searched at once, or a 2D grid pattern — Rabin-Karp, because hashes go into a Set and generalize to rectangles</li>
  <li>Anything about <b>prefixes that are also suffixes</b>, string periodicity, rotations, or "shortest characters to prepend/append" — build the failure table and read one entry, don't invent a new algorithm</li>
  <li>"Longest palindromic substring/prefix," "count all palindromic substrings" — expand-around-center first (O(n²), always acceptable), Manacher if pressed for linear</li>
  <li>Distinguish from DP: "longest palindromic <em>subsequence</em>" (non-contiguous) is 2D DP, not Manacher; "edit distance" and "longest common subsequence" are DP too. These algorithms are all about <em>contiguous</em> matches</li>
  <li>Pitfall: hash equality is never proof of string equality — an implementation that skips the verification step is a bug, not an optimization</li>
</ul>`,
    },
    {
      id: "dsa-monotonic-stack-queue",
      num: "A8",
      title: "Monotonic stack & queue in depth",
      short: "Monotonic stack & queue",
      levels: ["advanced"],
      practice: [
        "ex-daily-temperatures",
        "ex-next-greater-element-i",
        "ex-next-greater-element-circular",
        "ex-largest-rectangle-histogram",
        "ex-maximal-rectangle",
      ],
      ready: true,
      subtitle: "Throw away every element that can never win again — what survives is already sorted.",
      body: `<h3>The insight: some elements become permanently useless</h3>
<p>
  Suppose you're scanning left to right looking for each element's <b>next
  greater element</b>. You reach value 7 and the pending element behind it
  is a 3. That 3 is finished — 7 is its answer, and no later element can
  ever be its answer instead. But more than that: the 3 is now useless to
  <em>everyone</em>. Any future element looking backward for something
  bigger will hit the 7 before it reaches the 3. So the 3 can be discarded
  entirely.
</p>
<p>
  Do this consistently and the pending set is always sorted — a
  <b>monotonic stack</b>. You never search it, never sort it, never scan it:
  you only pop from the top while the invariant is violated. Each element is
  pushed exactly once and popped at most once, so the total work across the
  whole scan is O(n), even though the inner <code>while</code> loop can pop
  many elements on a single step.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="Four snapshots of a monotonic stack as it scans the array two one five six two three, showing the stack growing, then two elements being popped when a smaller value arrives">
    <g class="rough">
      <rect class="box" x="52" y="180" width="76" height="32" rx="4" />
    </g>
    <g class="rough">
      <rect class="box" x="212" y="180" width="76" height="32" rx="4" />
      <rect class="box" x="212" y="146" width="76" height="32" rx="4" />
      <rect class="box" x="212" y="112" width="76" height="32" rx="4" />
    </g>
    <g class="rough">
      <rect class="boxg" x="372" y="180" width="76" height="32" rx="4" />
      <rect class="boxr" x="372" y="146" width="76" height="32" rx="4" />
      <rect class="boxr" x="372" y="112" width="76" height="32" rx="4" />
    </g>
    <g class="rough">
      <rect class="box" x="522" y="180" width="76" height="32" rx="4" />
      <rect class="box" x="522" y="146" width="76" height="32" rx="4" />
      <rect class="box" x="522" y="112" width="76" height="32" rx="4" />
    </g>
    <text class="lbl" x="20" y="28" style="font-size:15px">heights = [2, 1, 5, 6, 2, 3] — stack holds indices, heights strictly increasing bottom to top</text>
    <text class="sm" x="90" y="62" text-anchor="middle">after i=1</text>
    <text class="sm" x="250" y="62" text-anchor="middle">after i=3</text>
    <text class="sm rd" x="410" y="62" text-anchor="middle">at i=4, h=2</text>
    <text class="sm" x="560" y="62" text-anchor="middle">after i=5</text>
    <text class="sm" x="90" y="201" text-anchor="middle">1</text>
    <text class="sm" x="250" y="201" text-anchor="middle">1</text>
    <text class="sm" x="250" y="167" text-anchor="middle">5</text>
    <text class="sm" x="250" y="133" text-anchor="middle">6</text>
    <text class="sm gr" x="410" y="201" text-anchor="middle">1</text>
    <text class="sm rd" x="410" y="167" text-anchor="middle">5 pop</text>
    <text class="sm rd" x="410" y="133" text-anchor="middle">6 pop</text>
    <text class="sm" x="560" y="201" text-anchor="middle">1</text>
    <text class="sm" x="560" y="167" text-anchor="middle">2</text>
    <text class="sm" x="560" y="133" text-anchor="middle">3</text>
    <text class="sm rd" x="20" y="232">a bar is popped exactly when its right boundary is found — and the new stack top is its left boundary</text>
  </svg>
  <figcaption>The stack is never searched or sorted — it stays ordered because anything out of order is popped on arrival.</figcaption>
</figure>

<h3>The canonical shape</h3>
<pre><code><span class="c">// The template. Two decisions define every variant:</span>
<span class="c">//   1. the comparison in the while condition (&lt; vs > vs &lt;= vs >=)</span>
<span class="c">//   2. what you do at pop time vs. at push time</span>
function monotonic(nums) {
  const stack = []; <span class="c">// store INDICES, not values — you almost always need positions</span>

  for (let i = 0; i &lt; nums.length; i++) {
    while (stack.length &amp;&amp; nums[stack[stack.length - 1]] &lt; nums[i]) {
      const j = stack.pop();
      <span class="c">// nums[i] is j's NEXT GREATER — resolve j here</span>
    }
    <span class="c">// whatever is on top now is i's PREVIOUS GREATER (or none if empty)</span>
    stack.push(i);
  }
  <span class="c">// anything left on the stack has no next greater element</span>
}</code></pre>
<div class="sticky mint">
  <span class="ttl">One pass gives you two answers</span>
  A single decreasing stack resolves <b>next greater</b> at pop time and
  <b>previous greater</b> at push time, in the same loop. Most people write
  two passes (one forward, one backward) for problems that need both
  boundaries. You don't have to — and saying so mid-interview is a strong
  signal that you understand the structure rather than the recipe.
</div>
<table>
  <tr><th>Question</th><th>Stack order (bottom → top)</th><th>Pop while top ...</th></tr>
  <tr><td>Next greater element</td><td>decreasing</td><td>value &lt; nums[i]</td></tr>
  <tr><td>Next smaller element</td><td>increasing</td><td>value > nums[i]</td></tr>
  <tr><td>Previous greater element</td><td>decreasing</td><td>same loop, read the top after popping</td></tr>
  <tr><td>Previous smaller element</td><td>increasing</td><td>same loop, read the top after popping</td></tr>
</table>
<p class="sub">
  Memorize the <em>derivation</em>, not the table: "I want the next bigger
  thing, so a pending element stops being pending the moment something
  bigger arrives, so I pop while the top is smaller, so the stack is
  decreasing." Regenerate it in ten seconds at the whiteboard instead of
  recalling four near-identical rules under pressure.
</p>

<h3>Next greater element</h3>
<pre><code><span class="c">// For each element, the first larger value to its right; -1 if none. O(n).</span>
function nextGreater(nums) {
  const res = new Array(nums.length).fill(-1);
  const stack = []; <span class="c">// indices; nums[stack] strictly decreasing</span>

  for (let i = 0; i &lt; nums.length; i++) {
    while (stack.length &amp;&amp; nums[stack[stack.length - 1]] &lt; nums[i]) {
      res[stack.pop()] = nums[i];
    }
    stack.push(i);
  }
  return res; <span class="c">// leftovers keep their -1 — nothing bigger ever came</span>
}

nextGreater([2, 1, 2, 4, 3]); <span class="c">// [4, 2, 4, -1, -1]</span></code></pre>
<p>
  The <b>circular</b> variant ("Next Greater Element II") wraps around the
  end of the array. The fix is not a second algorithm — just walk the index
  twice and mod:
</p>
<pre><code>function nextGreaterCircular(nums) {
  const n = nums.length;
  const res = new Array(n).fill(-1);
  const stack = [];

  for (let step = 0; step &lt; 2 * n; step++) { <span class="c">// two laps: the second one resolves the wrap-around</span>
    const i = step % n;
    while (stack.length &amp;&amp; nums[stack[stack.length - 1]] &lt; nums[i]) {
      res[stack.pop()] = nums[i];
    }
    if (step &lt; n) stack.push(i); <span class="c">// only push during the first lap, or indices duplicate</span>
  }
  return res;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Strict vs. non-strict comparison decides how ties behave</span>
  <code>&lt;</code> vs <code>&lt;=</code> in the while condition changes
  whether equal elements pop each other. For "next <em>strictly</em> greater"
  you must use <code>&lt;</code>, otherwise two equal values resolve each
  other incorrectly. For histogram-style problems with duplicate heights,
  <code>&gt;=</code> (popping equals) is usually the right choice — it can
  compute a too-small width for one of the duplicates, but the largest
  duplicate is always measured with the full width, so the maximum still
  comes out correct. Reason about ties explicitly; don't guess.
</div>

<h3>Largest rectangle in histogram</h3>
<p>
  This is the problem that makes the pattern click. A rectangle of height
  <code>heights[j]</code> extends left until it hits a strictly shorter bar
  and right until it hits a strictly shorter bar. So each bar needs its
  <b>previous smaller</b> and <b>next smaller</b> index — exactly what an
  increasing stack hands you: <code>i</code> is the right boundary at pop
  time, and the new stack top is the left boundary.
</p>
<pre><code><span class="c">// O(n) time, O(n) space</span>
function largestRectangleArea(heights) {
  const stack = []; <span class="c">// indices; heights increasing bottom to top</span>
  let best = 0;

  for (let i = 0; i &lt;= heights.length; i++) {
    <span class="c">// SENTINEL: a virtual height-0 bar past the end drains the stack — no cleanup loop</span>
    const h = i === heights.length ? 0 : heights[i];

    while (stack.length &amp;&amp; heights[stack[stack.length - 1]] >= h) {
      const height = heights[stack.pop()];
      <span class="c">// left boundary = one past the new top; if the stack emptied, this bar reached index 0</span>
      const left = stack.length ? stack[stack.length - 1] + 1 : 0;
      best = Math.max(best, height * (i - left)); <span class="c">// width = right boundary i, exclusive</span>
    }
    stack.push(i);
  }
  return best;
}

largestRectangleArea([2, 1, 5, 6, 2, 3]); <span class="c">// 10 — the 5 and 6 bars, width 2</span></code></pre>
<table>
  <tr><th>i</th><th>h</th><th>popped (height)</th><th>left</th><th>width</th><th>area</th><th>best</th></tr>
  <tr><td>1</td><td>1</td><td>2</td><td>0</td><td>1</td><td>2</td><td>2</td></tr>
  <tr><td>4</td><td>2</td><td>6</td><td>3</td><td>1</td><td>6</td><td>6</td></tr>
  <tr><td>4</td><td>2</td><td>5</td><td>2</td><td>2</td><td><b>10</b></td><td><b>10</b></td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>3</td><td>5</td><td>1</td><td>3</td><td>10</td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>2</td><td>2</td><td>4</td><td>8</td><td>10</td></tr>
  <tr><td>6</td><td>0 (sentinel)</td><td>1</td><td>0</td><td>6</td><td>6</td><td>10</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ Two off-by-one traps live in the width calculation</span>
  <b>(1)</b> When the stack empties after a pop, the left boundary is
  <code>0</code>, not <code>stack.top + 1</code> — that bar was shorter than
  everything before it, so it extends all the way to the start. Forgetting
  this silently under-counts the widest rectangles. <b>(2)</b> The width is
  <code>i - left</code>, not <code>i - left + 1</code>, because
  <code>i</code> is the first bar that <em>breaks</em> the rectangle, so it
  is an exclusive right boundary. Sanity-check both against
  <code>[2]</code> (answer 2) and <code>[2, 2]</code> (answer 4) before
  declaring victory.
</div>
<p class="sub">
  Directly on top of this: <b>Maximal Rectangle</b> in a binary matrix. Walk
  the rows, maintain a running "height of consecutive 1s ending at this row"
  array, and call <code>largestRectangleArea</code> on it once per row —
  O(rows × cols) total. Recognizing that a hard 2D problem is this 1D
  problem run row-by-row is exactly the kind of reduction interviews reward.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Every rectangle is bounded by
  the first shorter bar on each side, so I need previous-smaller and
  next-smaller for each bar. An increasing monotonic stack gives me both in
  one pass: the index that triggers a pop is the right boundary, and
  whatever is left on the stack is the left boundary. I'll append a virtual
  zero-height bar so the stack drains without a separate cleanup loop."
</div>

<h3>Trapping rain water, the monotonic-stack way</h3>
<p>
  You have probably seen the two-pointer solution. The stack version is
  worth knowing because it computes the water in <b>horizontal layers</b>
  rather than vertical columns, and it's the same skeleton as the histogram
  — which means one mental model covers both problems.
</p>
<pre><code><span class="c">// O(n) time, O(n) space — fills water layer by layer</span>
function trap(height) {
  const stack = []; <span class="c">// indices; heights decreasing bottom to top</span>
  let water = 0;

  for (let i = 0; i &lt; height.length; i++) {
    while (stack.length &amp;&amp; height[stack[stack.length - 1]] &lt; height[i]) {
      const bottom = stack.pop(); <span class="c">// the floor of the basin we're about to fill</span>
      if (!stack.length) break;   <span class="c">// no left wall → water spills off the edge</span>

      const left = stack[stack.length - 1];
      const width = i - left - 1;                                    <span class="c">// strictly between the two walls</span>
      const bounded = Math.min(height[left], height[i]) - height[bottom]; <span class="c">// shorter wall caps the level</span>
      water += width * bounded;
    }
    stack.push(i);
  }
  return water;
}

trap([0,1,0,2,1,0,1,3,2,1,2,1]); <span class="c">// 6</span></code></pre>
<p class="sub">
  The <code>break</code> when the stack empties is the whole "you need walls
  on both sides" rule, expressed structurally. And notice
  <code>bounded</code> subtracts <code>height[bottom]</code>: you're adding
  only the slab <em>above</em> the previously-filled level, never
  double-counting a layer you already paid for. The two-pointer solution is
  O(1) space and is the better final answer — but explaining the layered
  view first shows you understand <em>why</em> the two-pointer bound works.
</p>

<h3>Monotonic deque: sliding window maximum</h3>
<p>
  Same invariant, one extra requirement: elements also expire off the
  <em>front</em> when they fall out of the window. A stack can't do that, so
  you use a deque — pop from the back to maintain monotonicity, shift from
  the front to evict stale indices. The front is always the window's maximum
  because everything smaller behind it was discarded on arrival.
</p>
<pre><code><span class="c">// max of every window of size k — O(n) time, O(k) space</span>
function maxSlidingWindow(nums, k) {
  const dq = []; <span class="c">// indices; nums[dq] decreasing front to back</span>
  const out = [];

  for (let i = 0; i &lt; nums.length; i++) {
    if (dq.length &amp;&amp; dq[0] &lt;= i - k) dq.shift(); <span class="c">// front fell out of the window — evict</span>

    <span class="c">// anything smaller than nums[i] can never be a max again: nums[i] is newer AND bigger</span>
    while (dq.length &amp;&amp; nums[dq[dq.length - 1]] &lt;= nums[i]) dq.pop();

    dq.push(i);
    if (i >= k - 1) out.push(nums[dq[0]]); <span class="c">// front = current window max</span>
  }
  return out;
}

maxSlidingWindow([1,3,-1,-3,5,3,6,7], 3); <span class="c">// [3, 3, 5, 5, 6, 7]</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Array.prototype.shift() is not O(1)</span>
  In the abstract this is a deque; in JavaScript, <code>shift()</code> on a
  plain array is O(n) in the general case because it re-indexes. V8
  optimizes small arrays well enough that this passes in practice, but the
  honest O(n) implementation uses a head pointer into a fixed array and
  advances it instead of shifting. If an interviewer asks "is that really
  O(n) overall?" — that's what they're probing. The one-line fix:
  <code>let head = 0;</code> then <code>head++</code> in place of
  <code>shift()</code>, and read <code>dq[head]</code> for the front.
</div>
<table>
  <tr><th>Approach</th><th>Time</th><th>Space</th><th>Note</th></tr>
  <tr><td>Recompute each window</td><td>O(n·k)</td><td>O(1)</td><td>The baseline to state and reject</td></tr>
  <tr><td>Max-heap with lazy deletion</td><td>O(n log n)</td><td>O(n)</td><td>Works, and generalizes to "kth largest in window"</td></tr>
  <tr><td>Monotonic deque</td><td><b>O(n)</b></td><td>O(k)</td><td>Optimal — each index enters and leaves once</td></tr>
  <tr><td>Balanced BST / multiset</td><td>O(n log k)</td><td>O(k)</td><td>Needed if the window query is median or kth, not max</td></tr>
</table>
<p class="sub">
  That last row is the useful boundary: a monotonic deque works because
  <code>max</code> lets you discard dominated elements forever. If the query
  were "median of every window," nothing is discardable — you'd need two
  heaps or an ordered multiset. Knowing <em>why</em> the deque stops working
  is more valuable than knowing that it works.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "If a new element is both
  larger and more recent than something already in the deque, that older
  element is permanently dominated — it can never be the max of any future
  window. So I drop it. What's left is decreasing, the front is the current
  max, and each index is pushed and popped exactly once, giving O(n) total
  rather than O(n·k)."
</div>


<h3>See the stack work</h3>
<p>Watch the stack stay decreasing. Every index is pushed once and popped at most once, which is the whole argument for O(n) despite the inner while loop.</p>

<div class="demo">
  <div class="demo__bar">Monotonic stack — next greater element</div>
  <div class="demo__body">
    <div class="loop-grid">
      <div>
        <div class="loop-code" id="ms-code"></div>
        <div class="loop-bar"><i id="ms-bar"></i></div>
        <div class="demo__ctl">
          <button class="btn" id="ms-prev" type="button">← Back</button>
          <button class="btn" id="ms-next" type="button">Next step →</button>
          <button class="btn" id="ms-play" type="button">Play</button>
          <button class="btn btn--ghost" id="ms-reset" type="button">Reset</button>
        </div>
      </div>
      <div class="loop-queues">
        <div class="loop-box">
          <div class="loop-box__label">Stack (indices waiting)</div>
          <div id="ms-p-stack"></div>
        </div>
        <div class="loop-box">
          <div class="loop-box__label">Answers</div>
          <div id="ms-p-out"></div>
        </div>
      </div>
    </div>
      <div class="viz"><div class="viz__row"><div class="viz__cells" id="ms-cells"></div></div></div>
    <p class="demo__note" id="ms-note"></p>
  </div>
</div>

<script>
(function () {
  var ID = "ms";
  var CODE = ["const stack = [];","for (let i = 0; i < a.length; i++) {","  while (stack.length && a[stack.at(-1)] < a[i])","    res[stack.pop()] = a[i];","  stack.push(i);","}"];
  var STEPS = [{"cells":[{"v":"2","c":"","p":""},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":[]},"note":"For each element, find the next element to its right that is bigger. The stack holds indices still waiting for their answer."},{"cells":[{"v":"2","c":"hot","p":"i"},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[0] = 2."},{"cells":[{"v":"2","c":"hot","p":"i"},{"v":"1","c":"","p":""},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 0. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"hot","p":"i"},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[1] = 1."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"hot","p":"i"},{"v":"5","c":"","p":""},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)","idx 1 (1)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 1. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"in","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)","idx 1 (1)"],"out":["2 → none","1 → none","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[2] = 5."},{"cells":[{"v":"2","c":"in","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 0 (2)"],"out":["2 → none","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"a[2] = 5 is bigger than a[1] = 1, so 1's answer is 5. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"a[2] = 5 is bigger than a[0] = 2, so 2's answer is 5. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"hot","p":"i"},{"v":"6","c":"","p":""},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 2 (5)"],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"Push index 2. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"in","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 2 (5)"],"out":["2 → 5","1 → 5","5 → none","6 → none","2 → none","3 → none"]},"note":"Look at a[3] = 6."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":[],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"a[3] = 6 is bigger than a[2] = 5, so 5's answer is 6. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"hot","p":"i"},{"v":"2","c":"","p":""},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Push index 3. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"hot","p":"i"},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Look at a[4] = 2."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"hot","p":"i"},{"v":"3","c":"","p":""}],"panels":{"stack":["idx 3 (6)","idx 4 (2)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Push index 4. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"in","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)","idx 4 (2)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → none","3 → none"]},"note":"Look at a[5] = 3."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"out","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"a[5] = 3 is bigger than a[4] = 2, so 2's answer is 3. Pop it — it never needs the stack again."},{"cells":[{"v":"2","c":"out","p":""},{"v":"1","c":"out","p":""},{"v":"5","c":"out","p":""},{"v":"6","c":"in","p":""},{"v":"2","c":"out","p":""},{"v":"3","c":"hot","p":"i"}],"panels":{"stack":["idx 3 (6)","idx 5 (3)"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"Push index 5. The stack stays decreasing, which is why each index is pushed and popped at most once — O(n) total."},{"cells":[{"v":"2","c":"done","p":""},{"v":"1","c":"done","p":""},{"v":"5","c":"done","p":""},{"v":"6","c":"done","p":""},{"v":"2","c":"done","p":""},{"v":"3","c":"done","p":""}],"panels":{"stack":["idx 3 (6) — no answer","idx 5 (3) — no answer"],"out":["2 → 5","1 → 5","5 → 6","6 → none","2 → 3","3 → none"]},"note":"Anything still on the stack has no greater element to its right. Final: [5, 5, 6, -1, 3, -1]."}];
  var codeEl = document.getElementById(ID + "-code");
  if (!codeEl) return;
  if (codeEl.dataset.demoInit) return;
  codeEl.dataset.demoInit = "1";

  var barEl = document.getElementById(ID + "-bar");
  var noteEl = document.getElementById(ID + "-note");
  var cellsEl = document.getElementById(ID + "-cells");
  var gridEl = document.getElementById(ID + "-grid");
  var nextBtn = document.getElementById(ID + "-next");
  var prevBtn = document.getElementById(ID + "-prev");
  var playBtn = document.getElementById(ID + "-play");
  var resetBtn = document.getElementById(ID + "-reset");
  var i = 0, timer = null;

  CODE.forEach(function (text, idx) {
    var row = document.createElement("div");
    row.dataset.n = String(idx + 1);
    row.textContent = text;
    codeEl.appendChild(row);
  });

  function fill(el, items) {
    if (!el) return;
    el.innerHTML = "";
    if (!items || !items.length) {
      var em = document.createElement("span");
      em.className = "demo__term dim";
      em.style.cssText = "display:inline-block;border:0;padding:0;margin:0;min-height:0";
      em.textContent = "empty";
      el.appendChild(em);
      return;
    }
    items.forEach(function (t) {
      var chip = document.createElement("span");
      chip.className = "loop-frame";
      chip.textContent = t;
      el.appendChild(chip);
    });
  }

  function render() {
    var s = STEPS[i];
    Array.prototype.forEach.call(codeEl.children, function (row) {
      row.classList.toggle("hot", Number(row.dataset.n) === s.line);
    });
    Object.keys(s.panels || {}).forEach(function (k) {
      fill(document.getElementById(ID + "-p-" + k), s.panels[k]);
    });
    if (cellsEl && s.cells) {
      cellsEl.innerHTML = "";
      s.cells.forEach(function (c) {
        var d0 = document.createElement("div");
        d0.className = "viz__cell" + (c.c ? " viz__cell--" + c.c : "");
        d0.appendChild(document.createTextNode(c.v));
        var lab = document.createElement("i");
        lab.textContent = c.p || "";
        d0.appendChild(lab);
        cellsEl.appendChild(d0);
      });
    }
    if (gridEl && s.grid) {
      gridEl.innerHTML = "";
      gridEl.style.gridTemplateColumns = "repeat(" + s.grid[0].length + ", minmax(36px, 1fr))";
      s.grid.forEach(function (row) {
        row.forEach(function (c) {
          var g = document.createElement("div");
          g.className = "viz__gcell" + (c.c ? " viz__gcell--" + c.c : "");
          g.textContent = c.v;
          gridEl.appendChild(g);
        });
      });
    }
    noteEl.textContent = s.note;
    barEl.style.width = (i / (STEPS.length - 1)) * 100 + "%";
    nextBtn.disabled = i === STEPS.length - 1;
    prevBtn.disabled = i === 0;
  }

  function stop() { if (timer) { clearInterval(timer); timer = null; } playBtn.textContent = "Play"; }
  nextBtn.addEventListener("click", function () { stop(); if (i < STEPS.length - 1) { i++; render(); } });
  prevBtn.addEventListener("click", function () { stop(); if (i > 0) { i--; render(); } });
  resetBtn.addEventListener("click", function () { stop(); i = 0; render(); });
  playBtn.addEventListener("click", function () {
    if (timer) { stop(); return; }
    if (i === STEPS.length - 1) { i = 0; render(); }
    playBtn.textContent = "Pause";
    timer = setInterval(function () {
      if (i >= STEPS.length - 1) { stop(); return; }
      i++; render();
    }, 1100);
  });
  render();
})();
</script>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The literal words "next greater," "next smaller," "previous warmer day," "first element to the right that…" — that's a monotonic stack, unconditionally</li>
  <li>Each element needs its <b>span</b> or <b>boundaries</b> — "how far can this bar/temperature/stock price extend before something bigger stops it" (Daily Temperatures, Stock Span, Largest Rectangle, Maximal Rectangle, Sum of Subarray Minimums)</li>
  <li>The brute force is an O(n²) double loop where the inner loop scans rightward until a condition trips — that inner scan is what the stack amortizes away</li>
  <li>"Maximum/minimum of every window of size k" with a fixed k → monotonic <b>deque</b>. The extra front-eviction is the only difference from a stack</li>
  <li>Distinguish from a plain sliding window: sliding window maintains an aggregate (sum, count, set) that updates in O(1); monotonic structures maintain an <em>ordered candidate set</em> because the aggregate (max, min) can't be undone incrementally when an element leaves</li>
  <li>Distinguish from a heap: use a heap when you need the kth or the median, or when elements arrive without a scan order. Use a monotonic deque when a newer-and-better element makes an older one permanently irrelevant</li>
  <li>Pitfalls: pushing values instead of indices (you'll need positions for widths), the wrong strictness on ties, forgetting the sentinel so the stack never drains, and assuming <code>shift()</code> is free</li>
</ul>`,
    },
    {
      id: "dsa-design-problems",
      num: "A9",
      title: "Design problems",
      short: "Design problems",
      levels: ["advanced"],
      practice: [
        "ex-lru-cache",
        "ex-design-hashmap",
        "ex-time-based-key-value-store",
        "ex-insert-delete-getrandom",
        "ex-encode-decode-strings",
      ],
      ready: true,
      subtitle:
        "The interface is the spec — pick the data structure combo that meets the complexity contract before you write a line of code.",
      body: `<h3>These questions are graded on the choice, not the code</h3>
<p>
  "Design an LRU cache with O(1) get and put." "Design a stack with O(1)
  getMin." The implementation is usually forty lines of unremarkable
  pointer-juggling. What's being tested is the twenty seconds <em>before</em>
  that: can you read a set of required operations and their required
  complexities, notice that no single data structure delivers all of them,
  and compose two structures where each covers the other's blind spot?
</p>
<p>
  The universal opening move: write the operation table first. Every
  operation, its required complexity, and the structure that provides it.
  Do this out loud, on the board, before touching code.
</p>
<table>
  <tr><th>Requirement</th><th>Target</th><th>Structure that delivers it</th><th>What it cannot do</th></tr>
  <tr><td>Find a value by key</td><td>O(1)</td><td>Hash map</td><td>Any ordering</td></tr>
  <tr><td>Reorder / evict by recency</td><td>O(1)</td><td>Doubly linked list</td><td>Find a node by key</td></tr>
  <tr><td>Min or max of a stack</td><td>O(1)</td><td>Parallel auxiliary stack</td><td>Arbitrary deletion</td></tr>
  <tr><td>Min or max, arbitrary insert/delete</td><td>O(log n)</td><td>Heap</td><td>O(1) lookup by key</td></tr>
  <tr><td>Kth smallest / median, streaming</td><td>O(log n)</td><td>Two heaps, balanced</td><td>Range queries</td></tr>
  <tr><td>Prefix / range sums with updates</td><td>O(log n)</td><td>Fenwick or segment tree</td><td>Key lookup</td></tr>
  <tr><td>Expire old events by time</td><td>O(1) amortized</td><td>Deque or ring buffer of buckets</td><td>Random access by key</td></tr>
  <tr><td>Group by count, get the smallest count</td><td>O(1)</td><td>Frequency buckets (LFU)</td><td>Ordering within… unless the bucket is itself ordered</td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The composition rule</span>
  When one structure can find things but not order them, and another can
  order things but not find them, <b>store pointers from the first into the
  second</b>. The hash map's value is not the data — it's a handle into the
  ordered structure. Almost every "design X in O(1)" answer is an instance
  of that one sentence.
</div>

<h3>LRU cache: the canonical composition</h3>
<p>
  The contract: <code>get(key)</code> and <code>put(key, value)</code>, both
  O(1), with the least-recently-used entry evicted when capacity is
  exceeded. A hash map gives O(1) lookup but has no notion of "oldest." An
  array or list gives ordering, but finding a key in it is O(n). A doubly
  linked list gives O(1) removal <em>if you already hold the node</em> —
  which is exactly what the map can hand you.
</p>
<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A hash map on the left whose entries point into a doubly linked list on the right, with the most recently used node next to the head sentinel and the least recently used node next to the tail">
    <g class="rough">
      <path class="ln dash" d="M132,86 L250,100" />
      <path class="ln dash" d="M132,120 L360,104" />
      <path class="ln dash" d="M132,154 L470,118" />
    </g>
    <g class="rough">
      <path class="ln" d="M220,104 L248,104" />
      <path class="ln" d="M332,104 L358,104" />
      <path class="ln" d="M442,104 L468,104" />
      <path class="ln" d="M552,104 L578,104" />
      <path class="ln dash" d="M248,126 L220,126" />
      <path class="ln dash" d="M358,126 L332,126" />
      <path class="ln dash" d="M468,126 L442,126" />
      <path class="ln dash" d="M578,126 L552,126" />
    </g>
    <g class="rough">
      <rect class="box" x="20" y="50" width="112" height="150" rx="6" />
      <rect class="box" x="170" y="88" width="50" height="48" rx="4" />
      <rect class="boxg" x="250" y="88" width="82" height="48" rx="4" />
      <rect class="box" x="360" y="88" width="82" height="48" rx="4" />
      <rect class="boxr" x="470" y="88" width="82" height="48" rx="4" />
      <rect class="box" x="580" y="88" width="50" height="48" rx="4" />
    </g>
    <text class="sm" x="76" y="42" text-anchor="middle">hash map</text>
    <text class="sm" x="34" y="90">"A" →</text>
    <text class="sm" x="34" y="124">"B" →</text>
    <text class="sm" x="34" y="158">"C" →</text>
    <text class="sm" x="195" y="118" text-anchor="middle">head</text>
    <text class="sm" x="291" y="118" text-anchor="middle">A</text>
    <text class="sm" x="401" y="118" text-anchor="middle">B</text>
    <text class="sm" x="511" y="118" text-anchor="middle">C</text>
    <text class="sm" x="605" y="118" text-anchor="middle">tail</text>
    <text class="sm gr" x="291" y="76" text-anchor="middle">most recent</text>
    <text class="sm rd" x="511" y="76" text-anchor="middle">evict this one</text>
    <text class="sm gr" x="150" y="186">map: O(1) "which node is key K?"</text>
    <text class="sm gr" x="150" y="208">list: O(1) unlink, O(1) move-to-front, O(1) evict-from-back</text>
  </svg>
  <figcaption>Neither structure alone is enough; the dashed arrows — map entries pointing at list nodes — are the entire design.</figcaption>
</figure>
<pre><code><span class="c">// LRU cache — get, put, and eviction all O(1). O(capacity) space.</span>
class LRUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.map = new Map(); <span class="c">// key → node reference (NOT key → value)</span>

    <span class="c">// sentinel head/tail remove every null check from the unlink code</span>
    this.head = { key: null, val: null, prev: null, next: null };
    this.tail = { key: null, val: null, prev: null, next: null };
    this.head.next = this.tail;
    this.tail.prev = this.head;
  }

  _unlink(node) {
    node.prev.next = node.next;
    node.next.prev = node.prev;
  }

  _pushFront(node) { <span class="c">// front (next to head) = most recently used</span>
    node.next = this.head.next;
    node.prev = this.head;
    this.head.next.prev = node;
    this.head.next = node;
  }

  get(key) {
    const node = this.map.get(key);
    if (!node) return -1;
    this._unlink(node);
    this._pushFront(node); <span class="c">// a read counts as a use — this is the line people forget</span>
    return node.val;
  }

  put(key, value) {
    const existing = this.map.get(key);
    if (existing) {
      existing.val = value;
      this._unlink(existing);
      this._pushFront(existing);
      return; <span class="c">// an update must NOT evict anything</span>
    }

    if (this.map.size === this.cap) {
      const lru = this.tail.prev;
      this._unlink(lru);
      this.map.delete(lru.key); <span class="c">// why nodes store their key: you evict from the list, delete from the map</span>
    }

    const node = { key, val: value, prev: null, next: null };
    this._pushFront(node);
    this.map.set(key, node);
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Three bugs that turn an O(1) LRU into a wrong one</span>
  <b>(1)</b> Not refreshing on <code>get</code> — a read is a use, and
  skipping the move-to-front makes it an insertion-order cache, not an LRU.
  <b>(2)</b> Not storing <code>key</code> inside the node — on eviction you
  hold the node and need its key to delete the map entry; without it you'd
  have to scan the map, and the whole design collapses to O(n).
  <b>(3)</b> Evicting on an update to an existing key — capacity didn't
  change, so nothing should be evicted; this shows up as a failing test only
  when the cache is exactly full.
</div>
<p class="sub">
  Worth mentioning after you've written the real thing: JavaScript's
  <code>Map</code> preserves insertion order, so
  <code>map.delete(k); map.set(k, v);</code> moves a key to the back, and
  <code>map.keys().next().value</code> is the oldest key — a ten-line LRU.
  Say it as a language-specific shortcut you know about, then note that
  interviewers ask this question precisely to see the linked-list mechanics,
  so you'd hand-roll it here.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "Both operations have to be
  O(1), so I need constant-time lookup <em>and</em> constant-time reordering.
  No single structure gives me both. A hash map maps keys to nodes, and a
  doubly linked list holds recency order — the map tells me which node in
  O(1), and because the list is doubly linked I can unlink that node in O(1)
  without traversing. Sentinel head and tail nodes let me skip all the
  null-checking edge cases."
</div>

<h3>LFU cache: the same trick, one level deeper</h3>
<p>
  LFU evicts the least <em>frequently</em> used entry, breaking ties by
  least-recently used. Now three things must be O(1): find a key, find the
  minimum frequency, and find the oldest key at that frequency. The answer
  is to bucket by frequency and keep each bucket internally ordered — a map
  from count to an ordered collection of keys — plus a single
  <code>minFreq</code> integer.
</p>
<p>
  Why a bare <code>minFreq</code> counter is enough is the elegant part:
  frequencies only ever increase by exactly 1. So <code>minFreq</code> can
  only rise by 1 (when the last key in the minimum bucket is promoted) or
  reset to 1 (when a brand-new key is inserted). You never have to search
  for the new minimum.
</p>
<pre><code><span class="c">// LFU — get/put O(1). A JS Set preserves insertion order, so it doubles as</span>
<span class="c">// the per-bucket LRU list; in another language this is a DLL per bucket.</span>
class LFUCache {
  constructor(capacity) {
    this.cap = capacity;
    this.vals = new Map();    <span class="c">// key → value</span>
    this.freq = new Map();    <span class="c">// key → use count</span>
    this.buckets = new Map(); <span class="c">// count → Set of keys, oldest first</span>
    this.minFreq = 0;
  }

  _promote(key) {
    const f = this.freq.get(key);
    const bucket = this.buckets.get(f);
    bucket.delete(key);
    if (bucket.size === 0) {
      this.buckets.delete(f);
      if (this.minFreq === f) this.minFreq++; <span class="c">// safe: counts only ever step up by 1</span>
    }
    this.freq.set(key, f + 1);
    if (!this.buckets.has(f + 1)) this.buckets.set(f + 1, new Set());
    this.buckets.get(f + 1).add(key);
  }

  get(key) {
    if (!this.vals.has(key)) return -1;
    this._promote(key);
    return this.vals.get(key);
  }

  put(key, value) {
    if (this.cap === 0) return;
    if (this.vals.has(key)) { this.vals.set(key, value); this._promote(key); return; }

    if (this.vals.size === this.cap) {
      const victims = this.buckets.get(this.minFreq);
      const victim = victims.values().next().value; <span class="c">// oldest key in the least-used bucket → LRU tiebreak</span>
      victims.delete(victim);
      if (victims.size === 0) this.buckets.delete(this.minFreq);
      this.vals.delete(victim);
      this.freq.delete(victim);
    }

    this.vals.set(key, value);
    this.freq.set(key, 1);
    if (!this.buckets.has(1)) this.buckets.set(1, new Set());
    this.buckets.get(1).add(key);
    this.minFreq = 1; <span class="c">// a fresh key always resets the minimum</span>
  }
}</code></pre>
<p class="sub">
  Note the shape is identical to LRU — a lookup structure pointing into an
  ordered structure — just nested one level: map → bucket → ordered keys.
  If you can explain LRU cleanly, LFU is a five-sentence extension, and
  saying "it's LRU with a frequency dimension, and minFreq works because
  counts only increment" is usually enough to satisfy the follow-up.
</p>

<h3>Min stack: O(1) getMin with an auxiliary stack</h3>
<p>
  The trap is reaching for a heap. A heap gives O(log n) min with arbitrary
  removal — but a stack doesn't <em>have</em> arbitrary removal. Pops happen
  in exactly the reverse order of pushes, which means you can precompute the
  answer: at push time, record the minimum of everything at or below this
  point. Popping automatically restores the previous minimum because you
  pop that record too.
</p>
<pre><code><span class="c">// push / pop / top / getMin all O(1). O(n) extra space.</span>
class MinStack {
  constructor() {
    this.main = [];
    this.mins = []; <span class="c">// mins[i] = min of main[0..i] — a running prefix minimum</span>
  }

  push(x) {
    this.main.push(x);
    const currentMin = this.mins.length ? this.mins[this.mins.length - 1] : x;
    this.mins.push(Math.min(x, currentMin));
  }

  pop() {
    this.mins.pop(); <span class="c">// discarding this entry restores the previous min for free</span>
    return this.main.pop();
  }

  top()    { return this.main[this.main.length - 1]; }
  getMin() { return this.mins[this.mins.length - 1]; }
}</code></pre>
<p>
  The space optimization interviewers like to fish for: only push to
  <code>mins</code> when the new value is a new minimum, and only pop from
  it when the popped value equals the current minimum.
</p>
<pre><code>  push(x) {
    this.main.push(x);
    if (!this.mins.length || x &lt;= this.mins[this.mins.length - 1]) this.mins.push(x);
  }

  pop() {
    const x = this.main.pop();
    if (x === this.mins[this.mins.length - 1]) this.mins.pop();
    return x;
  }</code></pre>
<div class="warn">
  <span class="ttl">⚠ The duplicate-minimum bug in the optimized version</span>
  It must be <code>x &lt;= min</code>, not <code>x &lt; min</code>. Push
  <code>[2, 2]</code> with a strict comparison and only one 2 lands in
  <code>mins</code>; the first <code>pop()</code> removes it, and
  <code>getMin()</code> now reports a stale minimum even though a 2 is still
  on the stack. This is the single most common failure on this problem, and
  the test case that catches it is two lines long — offer it yourself.
</div>
<p class="sub">
  <b>Max Stack</b> is the same design for <code>peekMax()</code>. But if the
  question also demands <code>popMax()</code> — remove the maximum from
  anywhere in the stack — the auxiliary-stack trick breaks, because you're
  no longer popping in reverse push order. That version needs a doubly
  linked list plus an ordered map from value to the list of nodes holding
  it, giving O(log n) <code>popMax</code>. Naming that boundary unprompted
  ("this trick works only because removals are LIFO") is the senior-level
  version of this answer.
</p>

<h3>Hit counter: designing for a stream</h3>
<p>
  "Count hits in the last 5 minutes, with timestamps arriving in
  non-decreasing order." The naive store-everything approach is O(1) per hit
  but unbounded memory. The complexity contract to negotiate here isn't just
  time — it's <b>space</b>, and the interviewer is waiting for you to notice
  that the window is fixed-size.
</p>
<pre><code><span class="c">// Version 1: a queue of timestamps. O(1) amortized hit, O(1) amortized</span>
<span class="c">// getHits, but O(hits) space — unbounded under load.</span>
class HitCounter {
  constructor(windowSec = 300) {
    this.window = windowSec;
    this.times = [];
    this.head = 0; <span class="c">// head pointer instead of shift() — shift() is O(n)</span>
  }

  hit(ts) { this.times.push(ts); }

  getHits(ts) {
    while (this.head &lt; this.times.length &amp;&amp; this.times[this.head] &lt;= ts - this.window) {
      this.head++; <span class="c">// each timestamp is skipped at most once across all calls</span>
    }
    return this.times.length - this.head;
  }
}</code></pre>
<pre><code><span class="c">// Version 2: a ring buffer of per-second buckets. O(1) hit, O(window)</span>
<span class="c">// getHits, and O(window) space no matter the traffic — the one to ship.</span>
class BucketedHitCounter {
  constructor(windowSec = 300) {
    this.n = windowSec;
    this.stamps = new Array(windowSec).fill(-1); <span class="c">// which second this slot currently represents</span>
    this.counts = new Array(windowSec).fill(0);
  }

  hit(ts) {
    const i = ts % this.n;
    if (this.stamps[i] !== ts) {         <span class="c">// slot belongs to an older second — reuse it</span>
      this.stamps[i] = ts;
      this.counts[i] = 1;
    } else {
      this.counts[i]++;
    }
  }

  getHits(ts) {
    let total = 0;
    for (let i = 0; i &lt; this.n; i++) {
      if (ts - this.stamps[i] &lt; this.n) total += this.counts[i]; <span class="c">// skip stale slots without clearing them</span>
    }
    return total;
  }
}</code></pre>
<p class="sub">
  The lazy-expiry idea — never clear old data, just check whether a slot's
  timestamp is still in range when you read it — is the reusable insight
  here. It's the same technique behind lazy deletion in heaps and tombstones
  in log-structured storage.
</p>

<h3>Rate limiter: a sliding window counter</h3>
<p>
  The natural follow-up, and the one that bridges into system design. A
  fixed-window counter is trivial but lets a client fire 2× the limit across
  a window boundary. Storing every request timestamp is exact but O(limit)
  memory per user. The sliding-window-counter approximation keeps two
  integers per user and weights the previous window by how much of it still
  overlaps — the algorithm real API gateways ship.
</p>
<pre><code><span class="c">// O(1) time and O(1) space PER USER. Approximate, but bounded error.</span>
class SlidingWindowRateLimiter {
  constructor(limit, windowMs) {
    this.limit = limit;
    this.windowMs = windowMs;
    this.state = new Map(); <span class="c">// userId → { start, count, prevCount }</span>
  }

  allow(userId, now = Date.now()) {
    const start = Math.floor(now / this.windowMs) * this.windowMs;
    let s = this.state.get(userId);

    if (!s || s.start &lt; start - this.windowMs) {
      s = { start, count: 0, prevCount: 0 }; <span class="c">// idle for 2+ windows — everything expired</span>
    } else if (s.start &lt; start) {
      s = { start, count: 0, prevCount: s.count }; <span class="c">// rolled into a new window: demote count</span>
    }
    this.state.set(userId, s);

    <span class="c">// fraction of the previous window still inside the trailing window</span>
    const overlap = 1 - (now - start) / this.windowMs;
    const estimate = s.prevCount * overlap + s.count;

    if (estimate >= this.limit) return false;
    s.count++;
    return true;
  }
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Bounded memory is part of the contract, and it's the part people skip</span>
  Two things will be probed. <b>(1)</b> This <code>Map</code> grows forever
  as new user IDs appear — a real implementation needs TTL eviction, which
  is… an LRU, from earlier in this chapter. Say that; it closes the loop.
  <b>(2)</b> The counter is an <em>approximation</em>: it assumes requests
  were spread evenly across the previous window, so a burst clustered at one
  edge can be over- or under-counted by a few percent. State that trade-off
  before being asked, and name the exact alternative (a deque of timestamps,
  O(limit) memory) so the interviewer knows you chose rather than settled.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "Let me pin the contract
  first: which operations must be O(1), and is memory bounded? For the rate
  limiter, per-request work has to be O(1) and per-user memory has to be
  O(1) — that immediately rules out storing every timestamp, so I'll use a
  weighted two-window counter. It's approximate at window boundaries; if you
  need exactness I'd switch to a deque of timestamps and pay O(limit)
  memory per user."
</div>

<h3>How to run the first two minutes of any design question</h3>
<table>
  <tr><th>Step</th><th>What you say</th></tr>
  <tr><td>1. Restate the interface</td><td>"So: get, put, and eviction — three operations."</td></tr>
  <tr><td>2. Pin the complexity per operation</td><td>"All three O(1)? Including eviction? Good."</td></tr>
  <tr><td>3. Name what breaks</td><td>"A map has no order; a list can't find a key. Neither alone works."</td></tr>
  <tr><td>4. Compose, then justify</td><td>"Map from key to <em>node</em>, list for order. Map finds, list reorders."</td></tr>
  <tr><td>5. Call out the edge cases first</td><td>"Capacity 0, update-an-existing-key, get on a miss."</td></tr>
  <tr><td>6. Then write it</td><td>Sentinels first, helpers second, public methods last.</td></tr>
</table>
<p class="sub">
  Steps 1-5 take ninety seconds and are where the hiring signal lives. A
  candidate who writes a flawless LRU without ever explaining why the list
  must be <em>doubly</em> linked has demonstrated recall; a candidate who
  derives it from "unlink must be O(1) and I only hold the node, not its
  predecessor" has demonstrated design.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The prompt starts with the word "Design" and hands you a class signature with named methods and stated complexities — the complexities <em>are</em> the problem statement</li>
  <li>Two operations pull in opposite directions: fast lookup versus maintained order, or fast insert versus fast min/max. That tension is the signal to compose two structures rather than search for one perfect one</li>
  <li>Something must be evicted, expired, or capped — look for hash map + doubly linked list (recency), frequency buckets (LFU), or a ring buffer / deque (time windows)</li>
  <li>"O(1) min/max" on a structure with LIFO removal → auxiliary stack. "O(1) min/max" with arbitrary removal → you need a heap or ordered map, and the honest answer is O(log n), not O(1)</li>
  <li>"Streaming," "in the last N seconds," "timestamps arrive in order" → the window is fixed, so memory should be O(window), not O(events); bucket and expire lazily</li>
  <li>Distinguish from an algorithms question: there's no clever traversal or recurrence here. If you're searching for an <em>algorithm</em>, you've misread it — you're searching for a <em>combination</em></li>
  <li>Pitfalls: forgetting that a read counts as a use, not storing the key inside the node so eviction can clean up the map, using <code>&lt;</code> where <code>&lt;=</code> is needed on duplicate minimums, and letting the per-key map grow without bound</li>
</ul>`,
    },
    {
      id: "dsa-advanced-backtracking",
      num: "A10",
      title: "Advanced backtracking",
      short: "Advanced backtracking",
      levels: ["advanced"],
      practice: ["ex-n-queens-count"],
      ready: true,
      subtitle: 'Same three lines as before — the advanced part is saying "no" earlier and storing state in bits.',
      body: `<h3>What actually separates advanced backtracking from basic</h3>
<p>
  The core algorithm does not change. You still choose, explore, un-choose.
  What changes at this level is <b>how cheap a decision is</b> and <b>how
  early you can reject one</b>. Every advanced backtracking problem is the
  same template plus one or both of these upgrades: a <b>smarter state
  representation</b> (integers and bitmasks instead of sets and arrays) and
  <b>aggressive pruning</b> (a bound, a constraint propagation step, or a
  shared prefix structure like a Trie that says "no word in the entire
  dictionary continues this way").
</p>
<p>
  Both upgrades attack the same number: <em>nodes visited</em>. Constant-factor
  work per node matters, but cutting a subtree removes 2^k or k! leaves at
  once. Pruning wins by orders of magnitude; state representation then makes
  each surviving node 5-10× cheaper.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A decision tree where one branch is cut by a bound check before recursing, eliminating an entire exponential subtree in a single test">
    <g class="rough">
      <path class="lng" d="M320,35 L170,105" />
      <path class="lnr" d="M320,35 L470,105" />
      <path class="lng" d="M170,105 L100,175" />
      <path class="lng" d="M170,105 L240,175" />
      <path class="ln dash" d="M100,175 L70,220" />
      <path class="ln dash" d="M100,175 L130,220" />
      <path class="ln dash" d="M240,175 L210,220" />
      <path class="ln dash" d="M240,175 L270,220" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="320" cy="35" r="20" />
      <circle class="boxg" cx="170" cy="105" r="18" />
      <circle class="boxr" cx="470" cy="105" r="18" />
      <circle class="box" cx="100" cy="175" r="15" />
      <circle class="box" cx="240" cy="175" r="15" />
    </g>
    <text class="sm" x="320" y="40" text-anchor="middle">root</text>
    <text class="sm gr" x="215" y="62">feasible</text>
    <text class="sm rd" x="430" y="62">bound fails</text>
    <text class="lbl rd" x="500" y="150" text-anchor="middle" style="font-size:14px">✗ pruned</text>
    <text class="sm rd" x="500" y="172" text-anchor="middle">one O(1) test removes</text>
    <text class="sm rd" x="500" y="190" text-anchor="middle">every leaf below it</text>
    <text class="sm" x="150" y="243">…the half you actually explore…</text>
  </svg>
  <figcaption>The prune is a single comparison at an internal node; what it saves is exponential in the depth remaining beneath that node.</figcaption>
</figure>

<h3>Sets are correct; integers are fast</h3>
<p>
  The intermediate N-Queens solution tracked attacks with three
  <code>Set</code>s. That is O(1) per lookup <em>amortized</em>, but each
  operation hashes a number, touches a heap-allocated bucket, and may
  allocate. In a search that visits millions of nodes, that constant factor is
  the whole runtime. When the domain is small and dense — "which of these ≤32
  columns are used," "which of the digits 1-9 are taken" — a single 32-bit
  integer replaces the set entirely.
</p>
<table>
  <tr><th>Operation</th><th>With a Set</th><th>With a bitmask</th></tr>
  <tr><td>Is <code>x</code> used?</td><td><code>s.has(x)</code></td><td><code>(mask &gt;&gt; x) &amp; 1</code></td></tr>
  <tr><td>Mark <code>x</code> used</td><td><code>s.add(x)</code></td><td><code>mask | (1 &lt;&lt; x)</code></td></tr>
  <tr><td>Un-mark <code>x</code></td><td><code>s.delete(x)</code></td><td><code>mask ^ (1 &lt;&lt; x)</code></td></tr>
  <tr><td>All still-legal options at once</td><td>loop + 3 lookups</td><td><code>full &amp; ~(a | b | c)</code> — one expression</td></tr>
  <tr><td>Iterate only the legal options</td><td>not possible directly</td><td><code>while (free) { bit = free &amp; -free; free ^= bit; }</code></td></tr>
  <tr><td>Pass state to the recursive call</td><td>mutate + undo</td><td>pass a new integer — nothing to undo</td></tr>
</table>
<p class="sub">
  The last two rows are the ones that change how the code reads. With sets you
  loop over <em>all</em> candidates and skip the illegal ones; with a mask you
  compute the legal ones as a number and loop over exactly those. And because
  integers are values, not references, the "un-choose" step disappears — the
  caller's copy was never modified in the first place.
</p>

<h3>N-Queens with bitmasks — the canonical example</h3>
<p>
  Three integers replace three sets. <code>cols</code> has bit <em>c</em> set
  if column <em>c</em> is taken. The diagonals are the clever part: instead of
  keying by <code>row - col</code> and <code>row + col</code>, store the
  diagonal attacks <em>projected onto the current row</em>, and shift them by
  one as you descend. A "\" diagonal moves one column right per row down, so
  its mask shifts left; a "/" diagonal moves one column left, so its mask
  shifts right.
</p>
<pre><code><span class="c">// all N-Queens boards — O(n!) worst case, but with a tiny constant per node</span>
function solveNQueens(n) {
  const full = (1 &lt;&lt; n) - 1; <span class="c">// n low bits set: the whole board width</span>
  const results = [], placement = [];

  function place(row, cols, diag1, diag2) {
    if (row === n) {
      results.push(placement.map(c =&gt; ".".repeat(c) + "Q" + ".".repeat(n - c - 1)));
      return;
    }

    let free = full &amp; ~(cols | diag1 | diag2); <span class="c">// every safe column, computed in one step</span>

    while (free) {
      const bit = free &amp; -free;  <span class="c">// isolate the lowest set bit — the next safe column</span>
      free ^= bit;               <span class="c">// consume it so the loop terminates</span>
      const col = 31 - Math.clz32(bit); <span class="c">// bit -&gt; column index, only for the output board</span>

      placement.push(col);
      place(
        row + 1,
        cols | bit,
        ((diag1 | bit) &lt;&lt; 1) &amp; full, <span class="c">// "\" attacks slide one column right next row</span>
        (diag2 | bit) &gt;&gt; 1           <span class="c">// "/" attacks slide one column left next row</span>
      );
      placement.pop(); <span class="c">// the ONLY thing left to undo — the masks were never mutated</span>
    }
  }

  place(0, 0, 0, 0);
  return results;
}</code></pre>
<p class="sub">
  If the question only asks <em>how many</em> solutions exist (N-Queens II),
  delete <code>placement</code> and <code>Math.clz32</code> entirely and return
  a counter. The recursion then touches nothing but four integers — no arrays,
  no allocation, no garbage collection pressure anywhere in the hot path.
</p>

<figure>
  <svg viewBox="0 0 640 235" class="dg" role="img" aria-label="Three bitmask rows for columns and both diagonals being OR-ed together and inverted to produce the set of free columns on the next row">
    <g class="rough">
      <rect class="boxr" x="180" y="20" width="40" height="30" />
      <rect class="box" x="220" y="20" width="40" height="30" />
      <rect class="box" x="260" y="20" width="40" height="30" />
      <rect class="boxr" x="300" y="20" width="40" height="30" />
      <rect class="box" x="340" y="20" width="40" height="30" />
      <rect class="box" x="380" y="20" width="40" height="30" />
      <rect class="boxr" x="180" y="60" width="40" height="30" />
      <rect class="box" x="220" y="60" width="40" height="30" />
      <rect class="box" x="260" y="60" width="40" height="30" />
      <rect class="box" x="300" y="60" width="40" height="30" />
      <rect class="box" x="340" y="60" width="40" height="30" />
      <rect class="box" x="380" y="60" width="40" height="30" />
      <rect class="box" x="180" y="100" width="40" height="30" />
      <rect class="box" x="220" y="100" width="40" height="30" />
      <rect class="boxr" x="260" y="100" width="40" height="30" />
      <rect class="box" x="300" y="100" width="40" height="30" />
      <rect class="box" x="340" y="100" width="40" height="30" />
      <rect class="box" x="380" y="100" width="40" height="30" />
    </g>
    <g class="rough">
      <path class="ln" d="M180,145 L420,145" />
      <rect class="boxr" x="180" y="155" width="40" height="30" />
      <rect class="boxg" x="220" y="155" width="40" height="30" />
      <rect class="boxg" x="260" y="155" width="40" height="30" />
      <rect class="boxr" x="300" y="155" width="40" height="30" />
      <rect class="boxg" x="340" y="155" width="40" height="30" />
      <rect class="boxg" x="380" y="155" width="40" height="30" />
    </g>
    <text class="sm" x="170" y="40" text-anchor="end">cols</text>
    <text class="sm" x="170" y="80" text-anchor="end">diag1 &lt;&lt; 1</text>
    <text class="sm" x="170" y="120" text-anchor="end">diag2 &gt;&gt; 1</text>
    <text class="sm" x="170" y="175" text-anchor="end">free</text>
    <text class="sm rd" x="200" y="40" text-anchor="middle">1</text>
    <text class="sm" x="240" y="40" text-anchor="middle">0</text>
    <text class="sm" x="280" y="40" text-anchor="middle">0</text>
    <text class="sm rd" x="320" y="40" text-anchor="middle">1</text>
    <text class="sm" x="360" y="40" text-anchor="middle">0</text>
    <text class="sm" x="400" y="40" text-anchor="middle">0</text>
    <text class="sm rd" x="200" y="80" text-anchor="middle">1</text>
    <text class="sm" x="240" y="80" text-anchor="middle">0</text>
    <text class="sm" x="280" y="80" text-anchor="middle">0</text>
    <text class="sm" x="320" y="80" text-anchor="middle">0</text>
    <text class="sm" x="360" y="80" text-anchor="middle">0</text>
    <text class="sm" x="400" y="80" text-anchor="middle">0</text>
    <text class="sm" x="200" y="120" text-anchor="middle">0</text>
    <text class="sm" x="240" y="120" text-anchor="middle">0</text>
    <text class="sm rd" x="280" y="120" text-anchor="middle">1</text>
    <text class="sm" x="320" y="120" text-anchor="middle">0</text>
    <text class="sm" x="360" y="120" text-anchor="middle">0</text>
    <text class="sm" x="400" y="120" text-anchor="middle">0</text>
    <text class="sm rd" x="200" y="175" text-anchor="middle">✗</text>
    <text class="sm gr" x="240" y="175" text-anchor="middle">✓</text>
    <text class="sm gr" x="280" y="175" text-anchor="middle">✓</text>
    <text class="sm rd" x="320" y="175" text-anchor="middle">✗</text>
    <text class="sm gr" x="360" y="175" text-anchor="middle">✓</text>
    <text class="sm gr" x="400" y="175" text-anchor="middle">✓</text>
    <text class="lbl" x="440" y="150" style="font-size:14px">free = full &amp; ~(a|b|c)</text>
    <text class="sm" x="440" y="172">one instruction, not a loop</text>
    <text class="sm" x="180" y="215">wait — column 2 is attacked by a diagonal, so ✗ there too; the OR is what merges all three rows</text>
  </svg>
  <figcaption>Three independent constraints collapse into one integer, and the loop then iterates only over the columns that survived.</figcaption>
</figure>

<div class="warn">
  <span class="ttl">⚠ JavaScript bitwise operators are 32-bit and signed</span>
  <code>&amp;</code>, <code>|</code>, <code>^</code>, <code>&lt;&lt;</code> and
  <code>~</code> coerce their operands to <b>signed 32-bit</b> integers, so
  <code>1 &lt;&lt; 31</code> is negative and <code>1 &lt;&lt; 32</code> is
  <code>1</code>, not 4294967296. Bitmask search is therefore safe up to about
  <code>n = 30</code> — which covers every N-Queens or subset-mask problem an
  interviewer will hand you, since 2³⁰ states is already far past the time
  limit. Above that you need <code>BigInt</code> (much slower) or an array of
  words. Also use <code>&gt;&gt;&gt;</code> rather than <code>&gt;&gt;</code>
  if a mask could ever have bit 31 set, because <code>&gt;&gt;</code> sign-extends.
</div>

<div class="say">
  <span class="ttl">Say it like this →</span> "The algorithm is still plain
  backtracking — the change is that the board state is three integers instead
  of three sets. <code>full &amp; ~(cols | diag1 | diag2)</code> gives me every
  legal column in one operation, and <code>free &amp; -free</code> lets me
  iterate only the legal ones instead of looping over all n and rejecting
  most. Same asymptotics, roughly an order of magnitude on the constant, and
  the un-choose step disappears because integers are passed by value."
</div>

<h3>Sudoku — bitmasks plus constraint propagation</h3>
<p>
  Sudoku is where the two upgrades combine. Each row, column and 3×3 box gets
  a 9-bit mask of digits already used, so the candidate set for any cell is one
  OR and one AND away. Then comes the real accelerator: <b>most-constrained
  variable first</b> (MRV). Instead of filling cells left-to-right, always
  recurse on the empty cell with the <em>fewest</em> candidates. A cell with
  one candidate is a forced move; a cell with zero candidates means this branch
  is already dead, and you learn that <em>before</em> spending a single guess.
</p>
<pre><code><span class="c">// solves a 9x9 board of "1".."9" and "." in place</span>
function solveSudoku(board) {
  const rows = new Array(9).fill(0);
  const cols = new Array(9).fill(0);
  const boxes = new Array(9).fill(0);
  const empties = [];
  const boxOf = (r, c) =&gt; ((r / 3) | 0) * 3 + ((c / 3) | 0);
  const ALL = 0x1FF; <span class="c">// 9 low bits set = digits 1..9</span>

  for (let r = 0; r &lt; 9; r++) {
    for (let c = 0; c &lt; 9; c++) {
      if (board[r][c] === ".") { empties.push([r, c]); continue; }
      const bit = 1 &lt;&lt; (board[r][c].charCodeAt(0) - 49); <span class="c">// "1" -&gt; bit 0</span>
      rows[r] |= bit; cols[c] |= bit; boxes[boxOf(r, c)] |= bit;
    }
  }

  const candidates = (r, c) =&gt; ALL &amp; ~(rows[r] | cols[c] | boxes[boxOf(r, c)]);
  const popcount = (x) =&gt; { let n = 0; while (x) { x &amp;= x - 1; n++; } return n; };

  function solve(k) {
    if (k === empties.length) return true;

    <span class="c">// MRV: find the most-constrained remaining cell and swap it into slot k</span>
    let pick = k, fewest = 10;
    for (let i = k; i &lt; empties.length; i++) {
      const cnt = popcount(candidates(empties[i][0], empties[i][1]));
      if (cnt &lt; fewest) { fewest = cnt; pick = i; if (cnt &lt;= 1) break; }
    }
    if (fewest === 0) return false; <span class="c">// a cell with no legal digit — dead branch, prune now</span>

    const swap = empties[k]; empties[k] = empties[pick]; empties[pick] = swap;
    const [r, c] = empties[k], b = boxOf(r, c);

    let free = candidates(r, c);
    while (free) {
      const bit = free &amp; -free;
      free ^= bit;

      rows[r] |= bit; cols[c] |= bit; boxes[b] |= bit;
      board[r][c] = String.fromCharCode(49 + (31 - Math.clz32(bit)));

      if (solve(k + 1)) return true;

      rows[r] ^= bit; cols[c] ^= bit; boxes[b] ^= bit; <span class="c">// un-choose: XOR clears the bit we set</span>
      board[r][c] = ".";
    }

    empties[pick] = empties[k]; empties[k] = swap; <span class="c">// restore the ordering before failing upward</span>
    return false;
  }

  solve(0);
  return board;
}</code></pre>
<p class="sub">
  The swap-into-slot-k trick keeps the "remaining cells" set implicit — indices
  <code>k..end</code> are unfilled, <code>0..k-1</code> are done — so MRV costs
  a linear scan of the remainder instead of a heap, and reordering needs no
  extra structure. Restoring the swap on the failure path is what keeps the
  invariant true for the caller.
</p>
<div class="warn">
  <span class="ttl">⚠ Un-choosing with <code>&amp;= ~bit</code> vs <code>^= bit</code></span>
  Both clear a bit, but they differ when the bit is <em>not</em> currently set:
  <code>&amp;= ~bit</code> is idempotent, <code>^= bit</code> would set it. Here
  <code>^=</code> is correct and self-documenting precisely because we know we
  just set it. The dangerous case is a problem where the same value can be
  chosen along two different paths in the same frame — then XOR silently
  corrupts state and you get answers that are valid-looking but wrong. When in
  doubt, use <code>&amp;= ~bit</code>.
</div>
<p>
  Real constraint propagation goes one step further than MRV: after placing a
  digit, repeatedly scan for any cell that now has exactly one candidate and
  place it too, with no branching at all, until nothing more is forced. Most
  "hard" published Sudokus solve almost entirely by propagation with a handful
  of guesses. You will not usually be asked to implement it, but naming it —
  "this is MRV plus unit propagation, the same idea a SAT solver uses" — is a
  strong signal.
</p>

<h3>Word Search II — a Trie prunes the whole dictionary at once</h3>
<p>
  The naive extension of Word Search is to run the single-word grid search once
  per word: O(W · R · C · 4^L). That re-walks the same board prefixes for every
  word sharing them. The fix is to invert the loop — walk the board <em>once</em>
  and carry a Trie node (see the Tries chapter) alongside the position. The
  moment the current cell's letter has no child in the Trie, no word in the
  entire dictionary continues this way, and the branch dies immediately.
</p>
<pre><code>function findWords(board, words) {
  const root = {};
  for (const w of words) { <span class="c">// build the Trie: shared prefixes are shared work</span>
    let node = root;
    for (const ch of w) node = node[ch] || (node[ch] = {});
    node.word = w; <span class="c">// terminal marker that also carries the answer string</span>
  }

  const R = board.length, C = board[0].length, found = [];

  function dfs(r, c, parent) {
    const ch = board[r][c];
    const node = parent[ch];
    if (!node) return; <span class="c">// THE prune: no dictionary word continues with this letter</span>

    if (node.word) { found.push(node.word); delete node.word; } <span class="c">// delete = dedupe, no Set needed</span>

    board[r][c] = "#"; <span class="c">// "#" is never a Trie key, so revisits prune on the line above</span>
    if (r &gt; 0)     dfs(r - 1, c, node);
    if (r + 1 &lt; R) dfs(r + 1, c, node);
    if (c &gt; 0)     dfs(r, c - 1, node);
    if (c + 1 &lt; C) dfs(r, c + 1, node);
    board[r][c] = ch; <span class="c">// un-choose</span>

    if (Object.keys(node).length === 0) delete parent[ch]; <span class="c">// trim exhausted branches for good</span>
  }

  for (let r = 0; r &lt; R; r++) for (let c = 0; c &lt; C; c++) dfs(r, c, root);
  return found;
}</code></pre>
<p class="sub">
  Three separate prunes are stacked here and each is worth naming out loud:
  <b>(1)</b> missing child kills a branch in O(1); <b>(2)</b>
  <code>delete node.word</code> after a hit means a duplicate is never reported
  and no <code>Set</code> is needed; <b>(3)</b> deleting a Trie node once its
  subtree is empty shrinks the dictionary permanently, so later starting cells
  search a strictly smaller structure. Complexity drops from
  O(W · R · C · 4^L) to O(R · C · 4^L) with L now bounded by the longest word,
  and in practice far below that because the Trie kills most branches at depth 2-3.
</p>
<div class="warn">
  <span class="ttl">⚠ Mutating the Trie while iterating over it</span>
  The <code>delete parent[ch]</code> line runs <em>after</em> the recursion, on
  the way out, which is safe. Deleting a node while a sibling call is still
  walking it — or trimming <code>node.word</code> before you have pushed the
  string — produces missing results that are miserable to debug. If the
  interviewer objects to mutating the input board or the Trie, offer the
  <code>visited</code>-set variant and note the extra allocation cost; do not
  argue that mutation is fine.
</div>

<h3>Branch and bound — pruning with a number, not just a rule</h3>
<p>
  Everything above prunes on <em>feasibility</em>: this branch cannot produce a
  valid answer. Branch and bound prunes on <em>optimality</em>: this branch
  cannot produce a <em>better</em> answer than one already found. You need
  three ingredients — the best answer so far, an optimistic bound on what the
  current branch could still reach, and the comparison between them.
</p>
<p>
  The simplest form is the one already hiding in Combination Sum. Sort the
  candidates and <code>break</code> instead of <code>continue</code>:
</p>
<pre><code>function combinationSum(candidates, target) {
  candidates.sort((a, b) =&gt; a - b); <span class="c">// sorting is what makes the break valid</span>
  const results = [], path = [];

  function go(start, remaining) {
    if (remaining === 0) { results.push([...path]); return; }

    for (let i = start; i &lt; candidates.length; i++) {
      if (candidates[i] &gt; remaining) break; <span class="c">// sorted ⇒ every LATER candidate also overshoots</span>
      path.push(candidates[i]);
      go(i, remaining - candidates[i]);
      path.pop();
    }
  }

  go(0, target);
  return results;
}</code></pre>
<p class="sub">
  <code>continue</code> would still be correct and would still terminate — it
  just wastes the rest of the loop testing values that are provably too large.
  Turning a <code>continue</code> into a <code>break</code> by first
  establishing an ordering is the smallest, most repeatable pruning upgrade
  there is, and it applies to Combination Sum II, Palindrome Partitioning and
  most "sum to target" variants unchanged.
</p>
<p>
  The general version needs a real bound function. For 0/1 knapsack, the
  classic optimistic estimate is the <b>fractional relaxation</b>: sort items
  by value density and pretend you may take a fraction of the item that
  straddles the capacity limit. That is never worse than the true optimum, so
  if even it cannot beat the incumbent, the whole subtree is dead.
</p>
<pre><code><span class="c">// 0/1 knapsack by branch and bound — exponential worst case, near-instant in practice</span>
function knapsack(items, capacity) {
  items.sort((a, b) =&gt; b.value / b.weight - a.value / a.weight); <span class="c">// densest first</span>
  const n = items.length;
  let best = 0;

  <span class="c">// optimistic: allow a fractional last item, so bound &gt;= any real completion</span>
  function bound(i, room, taken) {
    let estimate = taken, left = room;
    for (let j = i; j &lt; n &amp;&amp; left &gt; 0; j++) {
      const take = Math.min(items[j].weight, left);
      estimate += items[j].value * (take / items[j].weight);
      left -= take;
    }
    return estimate;
  }

  function go(i, room, taken) {
    if (i === n) { best = Math.max(best, taken); return; }
    if (bound(i, room, taken) &lt;= best) return; <span class="c">// THE bound: cannot beat the incumbent</span>

    <span class="c">// take first: densest-first ordering raises \`best\` fast, which strengthens every later bound</span>
    if (items[i].weight &lt;= room) go(i + 1, room - items[i].weight, taken + items[i].value);
    go(i + 1, room, taken);
  }

  go(0, capacity, 0);
  return best;
}</code></pre>
<table>
  <tr><th>Prune type</th><th>Question it answers</th><th>Typical problems</th></tr>
  <tr><td>Feasibility</td><td>Can this partial answer still be completed at all?</td><td>N-Queens, Sudoku, Word Search</td></tr>
  <tr><td>Ordering / break</td><td>Are all remaining choices provably worse than this failing one?</td><td>Combination Sum, Palindrome Partitioning</td></tr>
  <tr><td>Bound</td><td>Can this subtree beat the best answer found so far?</td><td>Knapsack, TSP, job scheduling, Optimal Account Balancing</td></tr>
  <tr><td>Memo / dedupe</td><td>Have I already explored this exact state?</td><td>Partition to K Equal Sum Subsets, bitmask DP</td></tr>
</table>
<p class="sub">
  The fourth row is the boundary where backtracking turns into DP. If the state
  reaching a node is fully described by a small key (a bitmask of used
  elements, an index plus a remainder), memoize it and the exponential tree
  collapses to a polynomial-in-2^n table — that is exactly the bridge into the
  bitmask-DP section of the Advanced DP chapter.
</p>

<div class="sticky mint">
  <span class="ttl">The one-sentence version</span>
  Advanced backtracking is the same choose/explore/un-choose loop with two
  upgrades bolted on: make each node cheap (bits instead of sets) and make each
  <em>no</em> arrive earlier (feasibility rule, sorted break, bound, or a Trie
  that speaks for the whole dictionary at once). If you can name which of those
  four you are applying and why it is valid, you have said everything an
  interviewer is listening for.
</div>

<h3>Ordering the search is free speed</h3>
<p>
  Two branches, same subtree size, different order of exploration — the
  runtimes can differ by 100×. Bound-based pruning only works once
  <code>best</code> is good, so anything that finds a good answer sooner
  strengthens every subsequent prune. Three heuristics carry most of the value:
</p>
<ul>
  <li><b>Most-constrained variable first</b> — branch on the cell/slot with the
    fewest options (Sudoku MRV). Fewer children means failure surfaces at a
    shallower depth.</li>
  <li><b>Least-constraining value first</b> — among the options for that slot,
    try the one that eliminates the fewest options elsewhere, so a solution is
    reached before the search has to unwind.</li>
  <li><b>Greedy-first ordering</b> — sort by value density (knapsack), largest
    item first (bin packing, Partition to K Equal Sum Subsets), so the
    incumbent jumps early. Largest-first also fails fast: if the biggest item
    fits nowhere, you learn it at depth 1 instead of depth n.</li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "Worst case this is still
  exponential and I don't think we can avoid that — the problem is NP-hard. But
  I'll sort the items densest-first so a good incumbent appears early, and add a
  fractional-relaxation bound so any subtree whose optimistic estimate can't beat
  the incumbent gets cut. That's branch and bound; it doesn't change the
  asymptotics but it's the difference between running and not running at n = 40."
</div>

<h3>Complexity at this level: say the honest thing</h3>
<table>
  <tr><th>Problem</th><th>Worst case</th><th>What pruning actually buys</th></tr>
  <tr><td>N-Queens (sets)</td><td>O(n!)</td><td>baseline; ~n = 12 before it drags</td></tr>
  <tr><td>N-Queens (bitmask)</td><td>O(n!)</td><td>same tree, ~5-10× cheaper per node; n = 15-16 comfortable</td></tr>
  <tr><td>Sudoku (plain)</td><td>O(9^m), m = empty cells</td><td>can hang on adversarial boards</td></tr>
  <tr><td>Sudoku (bitmask + MRV)</td><td>O(9^m)</td><td>milliseconds on real boards; MRV does the heavy lifting</td></tr>
  <tr><td>Word Search II (per word)</td><td>O(W · R · C · 4^L)</td><td>—</td></tr>
  <tr><td>Word Search II (Trie)</td><td>O(R · C · 4^L)</td><td>W disappears from the bound entirely</td></tr>
  <tr><td>Knapsack (brute)</td><td>O(2ⁿ)</td><td>—</td></tr>
  <tr><td>Knapsack (branch &amp; bound)</td><td>O(2ⁿ)</td><td>typically explores a tiny fraction of nodes; unchanged bound</td></tr>
</table>
<p class="sub">
  Notice that the worst-case column barely moves. Saying "pruning makes this
  O(n log n)" is wrong and interviewers catch it instantly. The correct framing
  is: the worst case is unchanged, the <em>expected</em> number of visited nodes
  collapses, and here is the specific reason a branch dies. Being precise about
  that distinction reads as senior; over-claiming reads as memorized.
</p>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>Basic backtracking is already the obvious approach, but n or the branching
    factor makes the plain version time out — the question is not "which
    algorithm" but "which prune."</li>
  <li>The state is a small dense set (≤ 30 columns, 9 digits, ≤ 20 items used)
    → replace sets/arrays with a bitmask; <code>full &amp; ~(a|b|c)</code> and
    <code>x &amp; -x</code> are the two idioms to reach for.</li>
  <li>Many candidate strings/words are searched against one structure → build a
    Trie and invert the loops: walk the structure once carrying a Trie node,
    instead of once per word.</li>
  <li>The problem asks for the <em>best</em> value rather than <em>all</em>
    answers → you now have an incumbent, so branch and bound applies; find an
    optimistic bound (relaxation: drop the integrality constraint, ignore
    capacity, allow fractions) and prune when bound ≤ best.</li>
  <li>Candidates can be sorted so failure is monotone → change
    <code>continue</code> to <code>break</code>; free, and it composes with
    everything else.</li>
  <li>Distinguish from DP: if two different paths reach the <em>same</em> state
    and the future depends only on that state, memoize and it becomes bitmask
    DP. Backtracking is the right tool when states are mostly distinct or you
    must enumerate rather than count.</li>
</ul>`,
    },
    {
      id: "dsa-topological-patterns",
      num: "A11",
      title: "Topological patterns",
      short: "Topological patterns",
      levels: ["advanced"],
      practice: ["ex-course-schedule", "ex-course-schedule-ii", "ex-alien-dictionary"],
      ready: true,
      subtitle: 'Any problem phrased as "X must come before Y" is a DAG asking to be linearized.',
      body: `<h3>The shape: dependencies want to be a line</h3>
<p>
  A <b>topological order</b> of a directed graph is any ordering of its
  vertices such that for every edge <code>u → v</code>, <code>u</code> appears
  before <code>v</code>. It is the answer to every "in what order can I do
  these tasks given these prerequisites" question — build systems, course
  schedules, package managers, spreadsheet recalculation, and a surprising
  number of string and DP problems in disguise.
</p>
<p>
  One theorem carries the whole chapter: <b>a topological order exists if and
  only if the graph is a DAG</b> (directed, acyclic). A cycle
  <code>a → b → a</code> demands that <code>a</code> come before
  <code>b</code> and after it, which no ordering can satisfy. That turns every
  topological sort into a free cycle detector — and interviewers exploit this
  constantly, which is why "Course Schedule I" (can it be done at all?) and
  "Course Schedule II" (give me the order) are the same code with a different
  return statement.
</p>
<p>
  The order is generally <b>not unique</b>. If two tasks have no dependency
  path between them, either may go first. Any valid order is accepted; say
  this out loud, because a candidate who assumes a unique answer often writes
  a comparison-based sort by mistake.
</p>

<figure>
  <svg viewBox="0 0 640 250" class="dg" role="img" aria-label="A five node directed acyclic graph with in-degree labels, showing node zero with in-degree zero as the only valid starting point for Kahn's algorithm">
    <g class="rough">
      <path class="ln" d="M92,110 L200,68" />
      <path class="ln" d="M92,130 L200,172" />
      <path class="ln" d="M242,72 L358,110" />
      <path class="ln" d="M242,168 L358,130" />
      <path class="ln" d="M402,120 L508,120" />
    </g>
    <g class="rough">
      <circle class="boxg" cx="70" cy="120" r="22" />
      <circle class="box" cx="220" cy="60" r="22" />
      <circle class="box" cx="220" cy="180" r="22" />
      <circle class="box" cx="380" cy="120" r="22" />
      <circle class="box" cx="530" cy="120" r="22" />
    </g>
    <text class="lbl" x="70" y="126" text-anchor="middle">0</text>
    <text class="lbl" x="220" y="66" text-anchor="middle">1</text>
    <text class="lbl" x="220" y="186" text-anchor="middle">2</text>
    <text class="lbl" x="380" y="126" text-anchor="middle">3</text>
    <text class="lbl" x="530" y="126" text-anchor="middle">4</text>
    <text class="sm gr" x="70" y="165" text-anchor="middle">in = 0</text>
    <text class="sm" x="220" y="30" text-anchor="middle">in = 1</text>
    <text class="sm" x="220" y="222" text-anchor="middle">in = 1</text>
    <text class="sm" x="380" y="165" text-anchor="middle">in = 2</text>
    <text class="sm" x="530" y="165" text-anchor="middle">in = 1</text>
    <text class="lbl gr" x="20" y="30" style="font-size:14px">only in-degree 0 nodes are legal to emit</text>
    <text class="sm" x="20" y="52">node 3 waits for BOTH 1 and 2 — its counter must reach 0, not just drop</text>
  </svg>
  <figcaption>Node 3's in-degree of 2 is the whole idea: a node becomes available only when the <em>last</em> of its prerequisites is emitted.</figcaption>
</figure>

<h3>Kahn's algorithm — BFS over in-degrees</h3>
<p>
  Count how many prerequisites each node has. Everything with zero goes in the
  queue. Pop one, emit it, and decrement the counter of everything it points
  at; whenever a counter hits zero, that node's last blocker just cleared, so
  push it. If you emit fewer than <code>n</code> nodes, the leftovers are all
  stuck waiting on each other — a cycle.
</p>
<pre><code><span class="c">// edges are [prereq, dependent] pairs. O(V + E) time, O(V + E) space.</span>
function topoSortKahn(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  const indeg = new Array(n).fill(0);
  for (const [u, v] of edges) { adj[u].push(v); indeg[v]++; }

  const queue = [];
  for (let i = 0; i &lt; n; i++) if (indeg[i] === 0) queue.push(i);

  const order = [];
  for (let head = 0; head &lt; queue.length; head++) { <span class="c">// moving index, NOT queue.shift()</span>
    const u = queue[head];
    order.push(u);
    for (const v of adj[u]) {
      if (--indeg[v] === 0) queue.push(v); <span class="c">// last prerequisite cleared — v is now free</span>
    }
  }

  return order.length === n ? order : []; <span class="c">// short order ⇒ a cycle blocked the rest</span>
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ <code>Array.prototype.shift()</code> is O(n), and it silently makes this O(V²)</span>
  Using an array as a queue with <code>shift()</code> re-indexes every
  remaining element on each pop. On a graph with 10⁵ nodes that turns a clean
  O(V + E) into something quadratic. Either use the moving-<code>head</code>
  index above (the array doubles as the visit log, and it never shrinks) or a
  real deque. Interviewers at this level do notice.
</div>
<p>
  Walking the diagram's graph, with edges 0→1, 0→2, 1→3, 2→3, 3→4:
</p>
<table>
  <tr><th>Step</th><th>Pop</th><th>Emit so far</th><th>In-degrees after decrement</th><th>Newly freed</th></tr>
  <tr><td>init</td><td>—</td><td>[]</td><td>0:<b>0</b> 1:1 2:1 3:2 4:1</td><td>queue = [0]</td></tr>
  <tr><td>1</td><td>0</td><td>[0]</td><td>1:<b>0</b> 2:<b>0</b> 3:2 4:1</td><td>1, 2</td></tr>
  <tr><td>2</td><td>1</td><td>[0,1]</td><td>2:0 3:1 4:1</td><td>none (3 still waits on 2)</td></tr>
  <tr><td>3</td><td>2</td><td>[0,1,2]</td><td>3:<b>0</b> 4:1</td><td>3</td></tr>
  <tr><td>4</td><td>3</td><td>[0,1,2,3]</td><td>4:<b>0</b></td><td>4</td></tr>
  <tr><td>5</td><td>4</td><td>[0,1,2,3,4]</td><td>—</td><td>done, length 5 = n ✓</td></tr>
</table>
<p class="sub">
  Step 2 is the one to notice: node 3's counter drops from 2 to 1 and
  <em>nothing happens</em>. Pushing on "decremented" instead of "reached zero"
  is the single most common bug in this algorithm, and it produces an order
  that looks plausible on small examples but violates a prerequisite on any
  node with two parents.
</p>
<p>
  Two free bonuses fall out of this structure and both come up as follow-ups:
  the number of nodes popped in a single "round" (drain the entire queue before
  starting the next) is the count of tasks that can run <b>in parallel</b>, and
  the number of rounds is the <b>minimum time</b> to finish everything with
  unlimited workers — which is also the longest path length. Also, if at any
  point the queue holds more than one node, the topological order is not
  unique; that is exactly the test for "is there a unique ordering" (Sequence
  Reconstruction).
</p>

<h3>DFS topological sort — post-order, then reverse</h3>
<p>
  The DFS version comes at it from the opposite end. Recurse into all of a
  node's descendants first, and only <em>after</em> they have all been emitted,
  append the node itself. That builds the order backwards: a node always lands
  after everything it depends on, so reversing the finished list gives a valid
  topological order.
</p>
<p>
  Cycle detection is where this version earns its keep — and where it is most
  often written wrong. A single <code>visited</code> boolean is not enough. You
  need three states, because seeing an already-visited node means two very
  different things depending on whether that node is still <em>on the current
  recursion stack</em>.
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="Two cases of encountering an already-seen node in DFS: an edge back to a gray node on the current path is a cycle, while an edge to a black finished node is harmless">
    <g class="rough">
      <path class="ln" d="M70,70 L150,70" />
      <path class="ln" d="M190,70 L270,70" />
      <path class="lnr" d="M270,90 Q170,140 70,90" />
      <path class="ln" d="M400,70 L480,70" />
      <path class="ln dash" d="M520,90 Q560,130 600,90" />
    </g>
    <g class="rough">
      <circle class="boxy" cx="50" cy="70" r="20" />
      <circle class="boxy" cx="170" cy="70" r="20" />
      <circle class="boxy" cx="290" cy="70" r="20" />
      <circle class="boxy" cx="380" cy="70" r="20" />
      <circle class="box" cx="500" cy="70" r="20" />
      <circle class="box" cx="620" cy="70" r="20" />
    </g>
    <text class="sm" x="50" y="75" text-anchor="middle">A</text>
    <text class="sm" x="170" y="75" text-anchor="middle">B</text>
    <text class="sm" x="290" y="75" text-anchor="middle">C</text>
    <text class="sm" x="380" y="75" text-anchor="middle">X</text>
    <text class="sm" x="500" y="75" text-anchor="middle">Y</text>
    <text class="sm" x="620" y="75" text-anchor="middle">Y</text>
    <text class="sm rd" x="170" y="150" text-anchor="middle">C → A: A is GRAY (still on the path)</text>
    <text class="lbl rd" x="170" y="175" text-anchor="middle" style="font-size:14px">cycle — reject</text>
    <text class="sm" x="500" y="150" text-anchor="middle">X → Y: Y is BLACK (already finished)</text>
    <text class="lbl gr" x="500" y="175" text-anchor="middle" style="font-size:14px">not a cycle — just skip</text>
    <text class="sm" x="20" y="25">yellow = GRAY, on the current recursion stack · plain = BLACK, fully explored</text>
  </svg>
  <figcaption>Both edges point at a node you have seen before; only the one pointing at a node still on the stack is a cycle.</figcaption>
</figure>
<pre><code>const WHITE = 0, GRAY = 1, BLACK = 2; <span class="c">// unvisited / on current path / fully explored</span>

function topoSortDfs(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [u, v] of edges) adj[u].push(v);

  const state = new Array(n).fill(WHITE);
  const order = [];
  let cyclic = false;

  function dfs(u) {
    state[u] = GRAY; <span class="c">// entering: u is now on the recursion stack</span>

    for (const v of adj[u]) {
      if (state[v] === GRAY) { cyclic = true; return; } <span class="c">// back edge into the current path</span>
      if (state[v] === WHITE) {
        dfs(v);
        if (cyclic) return; <span class="c">// unwind immediately, don't finish this node</span>
      }
      <span class="c">// state[v] === BLACK: cross/forward edge to finished work — safely ignored</span>
    }

    state[u] = BLACK; <span class="c">// leaving: everything reachable from u is already in \`order\`</span>
    order.push(u);    <span class="c">// POST-order push — this is what makes the reversal correct</span>
  }

  for (let i = 0; i &lt; n; i++) {
    if (state[i] === WHITE) {
      dfs(i);
      if (cyclic) return []; <span class="c">// no valid order exists</span>
    }
  }

  return order.reverse();
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ One boolean <code>visited</code> array reports cycles that do not exist</span>
  With a single flag, the graph <code>X → Y</code>, <code>X → Z</code>,
  <code>Y → Z</code> looks cyclic: DFS finishes <code>Z</code> via
  <code>Y</code>, then <code>X → Z</code> hits a visited node and a naive check
  screams "cycle." It is not one — <code>Z</code> was <em>done</em>, not
  <em>in progress</em>. The fix is the GRAY/BLACK split. The mirror-image bug is
  resetting <code>state[u] = WHITE</code> on the way out (backtracking-style
  un-choose), which is correct but degrades to exponential time because
  finished subtrees get re-explored. Set BLACK and leave it.
</div>
<table>
  <tr><th></th><th>Kahn (BFS)</th><th>DFS post-order</th></tr>
  <tr><td>Complexity</td><td>O(V + E)</td><td>O(V + E)</td></tr>
  <tr><td>Cycle detection</td><td>emitted count &lt; n</td><td>edge into a GRAY node</td></tr>
  <tr><td>Extra state</td><td>in-degree array + queue</td><td>3-state array + call stack</td></tr>
  <tr><td>Recursion depth risk</td><td>none — iterative</td><td>stack overflow near V ≈ 10⁴-10⁵ in JS</td></tr>
  <tr><td>Gives "parallel rounds" / min time</td><td>yes, naturally</td><td>no</td></tr>
  <tr><td>Lexicographically smallest order</td><td>yes — swap the queue for a min-heap</td><td>no</td></tr>
  <tr><td>Reports <em>which</em> nodes are in the cycle</td><td>awkward</td><td>easy — the GRAY nodes on the stack</td></tr>
</table>
<p class="sub">
  Default to Kahn in an interview. It is iterative (no stack-depth caveat), the
  cycle check is a one-line length comparison, and the in-degree array is the
  hook for every follow-up question. Reach for DFS when you need the actual
  cycle, or when the same traversal is already computing something else
  post-order.
</p>

<h3>Course Schedule I and II — the canonical pair</h3>
<p>
  "Can you finish all <code>numCourses</code> given <code>prerequisites</code>
  where <code>[a, b]</code> means you must take <code>b</code> before
  <code>a</code>?" is Course Schedule I. Course Schedule II asks for the
  ordering itself. One function answers both.
</p>
<pre><code>function findOrder(numCourses, prerequisites) {
  const adj = Array.from({ length: numCourses }, () =&gt; []);
  const indeg = new Array(numCourses).fill(0);

  for (const [course, prereq] of prerequisites) {
    adj[prereq].push(course); <span class="c">// EDGE DIRECTION: prereq -&gt; course, i.e. reversed from the input pair</span>
    indeg[course]++;
  }

  const queue = [];
  for (let i = 0; i &lt; numCourses; i++) if (indeg[i] === 0) queue.push(i);

  const order = [];
  for (let head = 0; head &lt; queue.length; head++) {
    const u = queue[head];
    order.push(u);
    for (const v of adj[u]) if (--indeg[v] === 0) queue.push(v);
  }

  return order.length === numCourses ? order : [];
}

<span class="c">// Course Schedule I is the same call, thrown away down to a boolean</span>
const canFinish = (n, prereqs) =&gt; findOrder(n, prereqs).length === n;</code></pre>
<div class="warn">
  <span class="ttl">⚠ Getting the edge direction backwards</span>
  LeetCode gives pairs as <code>[course, prereq]</code> — <em>dependent
  first</em>. The graph edge points the other way:
  <code>prereq → course</code>. Build it backwards and you get a perfectly
  valid topological order of the reversed graph, which is a wrong answer that
  still passes the "no cycle" check and often passes the first sample test.
  Before writing the loop, say out loud which direction the arrow points and
  what the in-degree of a node <em>means</em> ("how many courses I still have
  to take before this one"). That one sentence prevents the bug.
</div>
<p class="sub">
  Follow-ups that reuse this exact code: return the lexicographically smallest
  valid order (replace the queue with a min-heap, cost becomes O(V log V + E));
  find the minimum number of semesters if unlimited courses can be taken in
  parallel (count BFS rounds); detect whether the ordering is unique (a round
  where the queue held ≥ 2 nodes means it is not).
</p>

<h3>Alien Dictionary — deriving the graph is the hard part</h3>
<p>
  Given a list of words sorted by an unknown alphabet's order, recover that
  order. The topological sort at the end is boilerplate; the interview is
  testing whether you can extract the edges correctly. Two rules do it: compare
  each <b>adjacent pair</b> of words, and from that pair take <b>only the first
  position where they differ</b> — everything after it is unconstrained,
  because lexicographic comparison stopped there.
</p>
<pre><code>function alienOrder(words) {
  const adj = new Map(), indeg = new Map();
  for (const w of words) {
    for (const ch of w) {
      if (!adj.has(ch)) { adj.set(ch, new Set()); indeg.set(ch, 0); } <span class="c">// every seen letter must appear in the answer</span>
    }
  }

  for (let i = 0; i + 1 &lt; words.length; i++) {
    const a = words[i], b = words[i + 1];

    <span class="c">// "abc" before "ab" is impossible in ANY alphabet — invalid input, not a cycle</span>
    if (a.length &gt; b.length &amp;&amp; a.startsWith(b)) return "";

    for (let j = 0; j &lt; Math.min(a.length, b.length); j++) {
      if (a[j] !== b[j]) {
        if (!adj.get(a[j]).has(b[j])) { <span class="c">// dedupe: a repeated edge would double-count in-degree</span>
          adj.get(a[j]).add(b[j]);
          indeg.set(b[j], indeg.get(b[j]) + 1);
        }
        break; <span class="c">// ONLY the first difference carries information — stop comparing</span>
      }
    }
  }

  const queue = [...indeg.keys()].filter((c) =&gt; indeg.get(c) === 0);
  let out = "";
  for (let head = 0; head &lt; queue.length; head++) {
    const u = queue[head];
    out += u;
    for (const v of adj.get(u)) {
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }

  return out.length === indeg.size ? out : ""; <span class="c">// cycle ⇒ the input was contradictory</span>
}</code></pre>
<p class="sub">
  Three failure modes, three different causes, and an interviewer will probe
  all of them. <b>Prefix violation</b> (<code>["abc", "ab"]</code>) — caught
  before the loop; it is not a graph problem at all. <b>Cycle</b>
  (<code>["a","b","a"]</code>) — caught by the length check at the end.
  <b>Insufficient information</b> (<code>["z","x"]</code> says nothing about
  <code>y</code>) — <em>not</em> an error; any order among the unconstrained
  letters is accepted, which is exactly why every letter seen anywhere must be
  seeded into the maps up front, even letters with no edges at all.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "The sorted-words input is really
  a set of pairwise ordering constraints in disguise. Each adjacent pair gives
  me at most one edge — the first character position where they differ — and
  once I have those edges it's a plain topological sort, so O(C) where C is the
  total length of all the words. The two traps are that a longer word can't
  precede its own prefix, and that letters with no constraints still have to
  appear in the output."
</div>

<h3>Longest path in a DAG — DP over the topological order</h3>
<p>
  Longest path is NP-hard on a general graph, but on a DAG it is linear. The
  reason is exactly the property topological order gives you: when you process
  node <code>u</code>, every edge <em>into</em> <code>u</code> has already been
  processed, so <code>dist[u]</code> is final and can be relaxed outward
  without ever being revisited. That is the same argument Dijkstra makes with a
  priority queue — here the ordering is free and, crucially, negative weights
  are fine.
</p>
<pre><code><span class="c">// edges: [u, v, weight]. Returns the longest path length in the whole DAG. O(V + E).</span>
function longestPath(n, edges) {
  const adj = Array.from({ length: n }, () =&gt; []);
  const indeg = new Array(n).fill(0);
  for (const [u, v, w] of edges) { adj[u].push([v, w]); indeg[v]++; }

  const order = [];
  const queue = [];
  const remaining = indeg.slice(); <span class="c">// copy — we still need the original to seed sources</span>
  for (let i = 0; i &lt; n; i++) if (remaining[i] === 0) queue.push(i);
  for (let head = 0; head &lt; queue.length; head++) {
    const u = queue[head];
    order.push(u);
    for (const [v] of adj[u]) if (--remaining[v] === 0) queue.push(v);
  }
  if (order.length !== n) throw new Error("cycle: longest path is unbounded");

  const dist = new Array(n).fill(-Infinity);
  for (let i = 0; i &lt; n; i++) if (indeg[i] === 0) dist[i] = 0; <span class="c">// any source can start a path</span>

  for (const u of order) {
    if (dist[u] === -Infinity) continue;
    for (const [v, w] of adj[u]) {
      dist[v] = Math.max(dist[v], dist[u] + w); <span class="c">// dist[u] is FINAL — topo order guarantees it</span>
    }
  }

  return Math.max(...dist);
}</code></pre>
<p class="sub">
  Flip <code>Math.max</code> to <code>Math.min</code> and you have shortest
  path on a DAG, which beats Dijkstra's O(E log V) and — unlike Dijkstra —
  handles negative edge weights correctly. This is worth knowing as a named
  fact: "if the graph is a DAG, shortest path is O(V + E) by topological order,
  and negative weights are not a problem."
</p>
<p>
  Once you see this, a whole family of problems reveals itself as topological
  DP where the graph is implicit and never built:
</p>
<table>
  <tr><th>Problem</th><th>Implicit DAG</th><th>Value propagated in topo order</th></tr>
  <tr><td>Longest Increasing Path in a Matrix</td><td>cell → strictly larger neighbour</td><td>path length (memoized DFS = topo order)</td></tr>
  <tr><td>Parallel Courses</td><td>prereq → course</td><td>semester number = 1 + max over parents</td></tr>
  <tr><td>Longest String Chain</td><td>word → word with one letter added</td><td>chain length; sort by length is the topo order</td></tr>
  <tr><td>Critical path / project scheduling</td><td>task → dependent task</td><td>earliest finish time</td></tr>
  <tr><td>Counting paths s → t</td><td>the DAG itself</td><td><code>ways[v] += ways[u]</code></td></tr>
</table>
<div class="sticky mint">
  <span class="ttl">The reframe that unlocks the family</span>
  Memoized DFS on a DAG <em>is</em> a topological sort — the recursion's return
  order is exactly reverse post-order. So any DP whose subproblem dependencies
  never cycle can be written either as top-down memoization or as a bottom-up
  loop over a topological order. When someone asks you to "convert your
  recursion to iteration," what they are asking for is the topological order.
</div>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The words "prerequisite," "depends on," "must come before," "build
    order," "compile," "recipe/ingredient," or any input of ordered pairs
    <code>[a, b]</code> meaning "a then b."</li>
  <li>The question is "is this even possible?" — that is cycle detection, and a
    topological sort answers it as a side effect (emitted count &lt; n).</li>
  <li>Sorted or ranked input that implies relative order between symbols
    (Alien Dictionary, Sequence Reconstruction, Verifying an Alien Dictionary's
    harder cousins) — the edges must be <em>derived</em>, and only adjacent
    pairs at the first differing position carry information.</li>
  <li>"Minimum number of rounds/semesters/steps with unlimited parallelism" →
    Kahn, counting BFS levels. "Is the order unique?" → check whether the queue
    ever holds two nodes at once.</li>
  <li>Longest/shortest/count-of paths where the graph provably has no cycles →
    do not reach for Dijkstra or Bellman-Ford; relax edges in topological order
    for O(V + E), negative weights included.</li>
  <li>Distinguish from plain BFS/DFS: ordinary traversal visits a node the
    first time it is reached; topological sort must <em>wait</em> until every
    incoming edge is satisfied. If a node has two parents and you emit it after
    seeing only one, you have written BFS, not a topological sort.</li>
  <li>Distinguish from Union-Find: undirected connectivity and cycle detection
    in an undirected graph is Union-Find's job; direction and ordering is this
    chapter's.</li>
</ul>`,
    },
    {
      id: "dsa-interview-strategy",
      num: "A12",
      title: "Interview strategy",
      short: "Interview strategy",
      levels: ["advanced"],
      practice: ["ex-pick-approach-from-constraint", "ex-feasible-approaches-under-constraints"],
      ready: true,
      subtitle:
        "The algorithm is half the score — the other half is everything you say before, during and after writing it.",
      body: `<h3>What is actually being scored</h3>
<p>
  At the advanced level the interviewer is not checking whether you can produce
  a correct program. They are estimating one thing: <b>what is it like to hand
  this person an ambiguous problem and come back in three days?</b> Every
  behaviour in this chapter is a proxy for that. Clarifying questions predict
  whether you will build the wrong thing. Stating a brute force before
  optimizing predicts whether you ship something or stall. Testing your own
  code predicts whether QA finds your bugs or you do. Naming a tradeoff
  unprompted predicts whether you will make a defensible technical decision
  alone.
</p>
<p>
  Two candidates can both produce a working O(n log n) solution and receive
  "strong hire" and "no hire." The difference is almost never the code. It is
  that one of them narrated a decision process the interviewer could follow and
  trust, and the other silently emitted a memorized answer that could not be
  probed, extended, or debugged out loud.
</p>

<figure>
  <svg viewBox="0 0 640 215" class="dg" role="img" aria-label="A 45 minute interview timeline divided into clarify, approach, code, test and tradeoff phases, with the common failure mode of coding too early marked in red">
    <g class="rough">
      <rect class="boxy" x="40" y="60" width="62" height="46" rx="4" />
      <rect class="boxg" x="102" y="60" width="87" height="46" rx="4" />
      <rect class="box" x="189" y="60" width="261" height="46" rx="4" />
      <rect class="boxg" x="450" y="60" width="87" height="46" rx="4" />
      <rect class="box" x="537" y="60" width="63" height="46" rx="4" />
    </g>
    <text class="sm" x="71" y="88" text-anchor="middle">clarify</text>
    <text class="sm" x="145" y="88" text-anchor="middle">approach</text>
    <text class="sm" x="319" y="88" text-anchor="middle">code, narrating</text>
    <text class="sm" x="493" y="88" text-anchor="middle">test</text>
    <text class="sm" x="568" y="82" text-anchor="middle">trade-</text>
    <text class="sm" x="568" y="98" text-anchor="middle">offs</text>
    <text class="sm" x="40" y="128" text-anchor="middle">0</text>
    <text class="sm" x="102" y="128" text-anchor="middle">5</text>
    <text class="sm" x="189" y="128" text-anchor="middle">12</text>
    <text class="sm" x="450" y="128" text-anchor="middle">33</text>
    <text class="sm" x="537" y="128" text-anchor="middle">40</text>
    <text class="sm" x="600" y="128" text-anchor="middle">45 min</text>
    <text class="lbl" x="40" y="40" style="font-size:14px">no code is written before minute 12 — that is deliberate, not slow</text>
    <text class="lbl rd" x="40" y="165" style="font-size:14px">the common failure: coding at minute 3</text>
    <text class="sm rd" x="40" y="187">→ wrong complexity discovered at minute 30, no time to recover, and</text>
    <text class="sm rd" x="40" y="205">→ the interviewer never saw you reason, only saw you type</text>
  </svg>
  <figcaption>The first twelve minutes buy the last thirty. A wrong approach caught at minute 8 costs nothing; the same mistake found at minute 30 ends the interview.</figcaption>
</figure>

<h3>The first five minutes: questions that change the answer</h3>
<p>
  Silence here is the single strongest negative signal available, and it is the
  cheapest to fix. An engineer who starts coding from an under-specified
  problem statement is telling the interviewer exactly how they behave with an
  under-specified ticket. But not all questions are equal — "can I use a
  hashmap?" wastes the goodwill you are trying to build. Ask only questions
  whose answer would <b>change your solution</b>, and say why you are asking.
</p>
<table>
  <tr><th>Ask</th><th>Why it changes the solution</th></tr>
  <tr><td>"How large can n get?"</td><td>The highest-value question in the interview. It fixes your target complexity before you have written anything — see the table below.</td></tr>
  <tr><td>"Is the input sorted, or can I sort it?"</td><td>Sorted unlocks two pointers and binary search for free. If not sorted, an O(n log n) sort may be free anyway when the target is already O(n log n) — but it is <em>not</em> free if the target is O(n).</td></tr>
  <tr><td>"Can there be duplicates?"</td><td>Changes whether you dedupe, whether a Set is safe, whether two-pointer needs a skip loop, and whether the expected output is unique.</td></tr>
  <tr><td>"What's the range of the values? Negative? Zero? Floats?"</td><td>Negatives break sliding-window-on-sums and greedy arguments. Small bounded values unlock counting sort or a bitmask. Floats kill exact equality.</td></tr>
  <tr><td>"What should I return for empty input / no valid answer?"</td><td>An explicit contract, decided up front, instead of an ad-hoc guess at minute 40.</td></tr>
  <tr><td>"Can I mutate the input?"</td><td>In-place sorting or marking may be the whole space optimization; if the input is shared state, it isn't allowed.</td></tr>
  <tr><td>"Is this called once, or repeatedly on the same data?"</td><td>Repeated queries change the answer entirely — preprocess into a prefix array, segment tree, or index map and amortize.</td></tr>
  <tr><td>"Does the whole input fit in memory, or is it a stream?"</td><td>Streaming rules out sorting and random access; pushes toward heaps, reservoir sampling, count-min sketch.</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Before I start — a few things
  that would change my approach. How big is n? Can values be negative? And are
  duplicates possible in the input? …n is up to 10⁵ and values can be negative
  — good, that rules out the sliding-window approach I was about to reach for,
  since a negative number means the window sum isn't monotonic."
</div>
<p class="sub">
  That last clause is the part that scores. You are not collecting facts, you
  are demonstrating that each fact <em>eliminates a branch</em> of your
  decision tree. Two or three questions asked this way beat ten asked
  mechanically.
</p>
<div class="warn">
  <span class="ttl">⚠ Don't ask questions you can answer from the examples</span>
  If the provided example contains a negative number, asking "can values be
  negative?" reads as not having read the problem. Skim the examples first,
  extract what they already settle, and ask only about what they leave open —
  then say so: "the example has duplicates so I'll assume they're allowed; what
  I can't tell from it is whether the array is guaranteed non-empty."
</div>

<h3>A framework that works on a problem you have never seen</h3>
<p>
  You will not recognize the problem. That is the point of an advanced
  interview. What you need is not recall but a procedure that visibly makes
  progress even from zero. Run these seven steps out loud, in order.
</p>
<table>
  <tr><th>#</th><th>Step</th><th>What you actually say</th></tr>
  <tr><td>1</td><td>Restate in your own words</td><td>"So: given X, return Y, where the constraint is Z. Is that right?"</td></tr>
  <tr><td>2</td><td>Work the given example by hand</td><td>Say the answer for the example before writing anything. Catches misreads instantly.</td></tr>
  <tr><td>3</td><td>State a brute force, with its complexity</td><td>"The obvious thing is to check every pair — O(n²) time, O(1) space. That's my baseline; let me see if I can beat it."</td></tr>
  <tr><td>4</td><td>Name the bottleneck</td><td>"The expensive part is that for each i, I re-scan everything before i. That inner scan is the thing to remove."</td></tr>
  <tr><td>5</td><td>Read the constraints for the target</td><td>"n goes to 10⁵, so O(n²) is 10¹⁰ — far too slow. They're steering me to O(n log n) or O(n)."</td></tr>
  <tr><td>6</td><td>Ask what structure removes the bottleneck</td><td>"What would make that inner scan O(1) or O(log n)? A hashmap of seen values, a heap, a monotonic stack, or precomputed prefix sums."</td></tr>
  <tr><td>7</td><td>Confirm, then code</td><td>"So: one pass, hashmap from value to index, O(n) time and O(n) space. Shall I code that?"</td></tr>
</table>
<p>
  Step 3 is non-negotiable and candidates skip it constantly, believing a brute
  force looks weak. The opposite is true: it guarantees you have <em>a</em>
  solution on the board within five minutes, it proves you understand the
  problem, and it gives you a concrete complexity to improve on. An interviewer
  will almost always let you skip implementing it. What they will not forgive
  is twenty minutes of silence hunting for the clever answer.
</p>
<figure>
  <svg viewBox="0 0 640 190" class="dg" role="img" aria-label="A three step flow from brute force through naming the repeated work to replacing it with a data structure that answers the same question faster">
    <g class="rough">
      <path class="ln" d="M186,75 L232,75" />
      <path class="ln" d="M406,75 L452,75" />
    </g>
    <g class="rough">
      <rect class="box" x="26" y="45" width="160" height="60" rx="6" />
      <rect class="boxy" x="232" y="45" width="174" height="60" rx="6" />
      <rect class="boxg" x="452" y="45" width="162" height="60" rx="6" />
    </g>
    <text class="sm" x="106" y="70" text-anchor="middle">brute force</text>
    <text class="sm" x="106" y="90" text-anchor="middle">O(n²), stated aloud</text>
    <text class="sm" x="319" y="70" text-anchor="middle">what work repeats?</text>
    <text class="sm" x="319" y="90" text-anchor="middle">"I re-scan the prefix"</text>
    <text class="sm" x="533" y="70" text-anchor="middle">which structure</text>
    <text class="sm" x="533" y="90" text-anchor="middle">answers it in O(1)?</text>
    <text class="sm" x="26" y="140">hashmap · prefix sums · heap · monotonic stack · sorted order + two pointers ·</text>
    <text class="sm" x="26" y="160">binary search on the answer · union-find · trie · memoized state</text>
    <text class="lbl gr" x="26" y="30" style="font-size:14px">optimization is a search over this middle box, not over memorized solutions</text>
  </svg>
  <figcaption>Almost every optimization in interview DSA is the same move: identify work being redone, then buy it back with a data structure.</figcaption>
</figure>

<h3>Constraints → intended complexity: the highest-leverage table here</h3>
<p>
  Interviewers and problem setters choose <code>n</code> deliberately. The
  bound is a hint about the intended solution, and reading it correctly can
  collapse a twenty-minute search into thirty seconds. Calibrate against the
  rough industry rule that <b>~10⁸ simple operations is about one second</b>.
</p>
<table>
  <tr><th>Constraint on n</th><th>Intended complexity</th><th>Pattern family it points at</th></tr>
  <tr><td>n ≤ 10-12</td><td>O(n!) · O(n! · n)</td><td>Full permutation search, brute-force TSP, "try every ordering"</td></tr>
  <tr><td>n ≤ 20-25</td><td>O(2ⁿ) · O(2ⁿ · n)</td><td><b>Bitmask</b> — subset enumeration, bitmask DP, meet-in-the-middle (2^(n/2)) if n ≈ 40</td></tr>
  <tr><td>n ≤ 100</td><td>O(n³) · O(n⁴)</td><td>Floyd-Warshall, interval/matrix-chain DP, triple nested loops are fine</td></tr>
  <tr><td>n ≤ 1,000-5,000</td><td>O(n²)</td><td>2D DP over pairs — edit distance, LCS, palindromic substrings; all-pairs comparison</td></tr>
  <tr><td>n ≤ 10⁵</td><td>O(n log n)</td><td>Sort-then-scan, heap, binary search on the answer, balanced BST / ordered set, divide and conquer, segment tree</td></tr>
  <tr><td>n ≤ 10⁶-10⁷</td><td>O(n) · O(n log log n)</td><td>Single pass, two pointers, sliding window, hashmap, counting sort, prefix sums, sieve, Kadane</td></tr>
  <tr><td>n ≤ 10⁹-10¹⁸</td><td>O(log n) · O(√n) · O(1)</td><td>Math/closed form, binary search over the answer space, matrix exponentiation, digit DP — <em>you cannot even read the input</em></td></tr>
</table>
<p class="sub">
  Read the second half of the constraints too. "Sum of all string lengths ≤
  10⁵" over many strings means linear in the <em>total</em>, which points at a
  Trie or Aho-Corasick rather than per-string work. A value range like "values
  ≤ 100" alongside a huge n points at counting/bucketing. A memory limit
  matters as much as time: n = 10⁵ with an O(n²) DP table is 10¹⁰ cells —
  impossible regardless of the time limit, which tells you the DP must be
  rolled down to one or two rows.
</p>
<div class="sticky mint">
  <span class="ttl">Read the constraints backwards</span>
  Do not design a solution and then check whether it is fast enough. Read
  <code>n</code> first, derive the complexity the setter intends, and use that
  as a <em>filter on which patterns are even eligible</em>. "n ≤ 20" is not
  trivia — it is the interviewer telling you the answer involves subsets. Very
  few candidates do this, and it is visible in seconds when someone does.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "n is at most 20, which is a
  strong hint — 2²⁰ is about a million, so exponential in n is affordable and
  polynomial probably isn't achievable here. That points at enumerating subsets
  with a bitmask, most likely bitmask DP over the set of already-used elements.
  Let me check whether the state really is just 'which subset is used' or
  whether I need an index too."
</div>

<h3>How to talk while you code</h3>
<p>
  The goal is a continuous, low-effort narration that lets the interviewer
  follow your reasoning without interrupting. Not a play-by-play of syntax —
  nobody needs "now I'll write a for loop." Narrate <b>decisions</b>, and
  <b>name your patterns</b>, because naming is what proves the choice was
  deliberate rather than lucky.
</p>
<table>
  <tr><th>Instead of</th><th>Say</th></tr>
  <tr><td>silence</td><td>"I'll use a monotonic decreasing stack here, because I need the next greater element for every index and a stack lets each element be pushed and popped once — amortized O(n)."</td></tr>
  <tr><td>"now a map"</td><td>"Map from value to index rather than a Set, because I need to return indices, not just detect membership."</td></tr>
  <tr><td>"hmm, hold on"</td><td>"I'm deciding between sorting first and using a heap. Sorting is simpler but O(n log n) up front; the heap gets me the top k in O(n log k). Since k is small I'll take the heap."</td></tr>
  <tr><td>"…" while fixing a bug</td><td>"That should be <code>&lt;=</code>, not <code>&lt;</code> — otherwise the last window never gets evaluated. Let me re-check the boundary."</td></tr>
  <tr><td>"I'll handle that later"</td><td>"I'm deliberately deferring the empty-input case; noting it here as a TODO and I'll come back before I call this done."</td></tr>
</table>
<p class="sub">
  Two mechanical habits pay for themselves. First, write the function signature
  and the return type before the body — it forces the contract to be explicit.
  Second, when you defer something, say so and leave a visible marker; an
  acknowledged gap is a plan, an unacknowledged one is a bug.
</p>
<div class="warn">
  <span class="ttl">⚠ Narrating and thinking are different modes, and forcing both at once stalls people</span>
  It is entirely fine to say "give me twenty seconds to think this through
  quietly" and then go silent — that reads as controlled. What reads badly is
  <em>undeclared</em> silence for two minutes. Buy the quiet explicitly, use
  it, then come back with a statement rather than a mumble.
</div>

<h3>Being stuck, handled well</h3>
<p>
  You will get stuck. It is expected and it is not disqualifying — freezing is.
  What is being measured is whether you have a procedure for it. Work this
  ladder out loud, in order, and say which rung you are on.
</p>
<table>
  <tr><th>Rung</th><th>Do this</th><th>Why it works</th></tr>
  <tr><td>1</td><td>Re-read the constraints and the exact wording of the ask</td><td>Most stuckness is a misread — "subsequence" vs "subarray," "any" vs "all," "at most" vs "exactly." The constraint bound also re-states the target complexity you may have drifted from.</td></tr>
  <tr><td>2</td><td>Work a tiny example by hand — n = 1, n = 2, n = 3</td><td>You are looking for the <em>rule</em> your hand is following. Solving n = 3 manually and asking "what did I just do?" recovers the recurrence more often than staring at the general case.</td></tr>
  <tr><td>3</td><td>Ask "what shape is this?"</td><td>Not "have I seen this problem" but: is it a graph? intervals? a tree of choices? a search over a monotonic answer space? Shape recall is far more reliable than problem recall.</td></tr>
  <tr><td>4</td><td>Ask whether it is two known patterns composed</td><td>Advanced problems usually are. Sort + two pointers. Trie + backtracking. Binary search on the answer + a greedy feasibility check. Heap + hashmap. Topological order + DP. Say the two names out loud.</td></tr>
  <tr><td>5</td><td>Relax the problem, solve the easier version</td><td>Drop a constraint (assume sorted, assume no duplicates, assume k = 1, assume the array is positive). Solve that, then re-introduce the constraint and see what breaks. Partial credit is real credit.</td></tr>
  <tr><td>6</td><td>State where you are stuck, precisely, and take the hint</td><td>"I have an O(n²) solution and I know the bottleneck is re-scanning the prefix; what I can't see is a structure that gives me the max of a shrinking window in O(1)." That is a targeted request, and it lets the interviewer give a small hint rather than a large one.</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "I'm going to slow down for a
  second and work n = 3 by hand, because I think the recurrence will be obvious
  once I see what I'm doing manually. …Right — at each step I'm choosing
  between taking this element and skipping it, and the choice only depends on
  the remaining capacity. That's a knapsack shape, so the state is (index,
  remaining) and I can memoize it."
</div>
<p class="sub">
  Note what that phrasing does: it converts "stuck" into "executing a
  deliberate step." Interviewers are instructed to give hints; taking one
  gracefully costs far less than most candidates fear, and refusing to ask
  while burning ten minutes costs far more.
</p>

<h3>Test before you say "done"</h3>
<p>
  Declaring completion and letting the interviewer find the bug is the most
  avoidable score loss in the entire interview. Finding it yourself, out loud,
  converts the same bug into a positive signal. Trace the given example first —
  line by line, tracking real variable values, not vibes — then run a
  deliberately chosen edge case.
</p>
<table>
  <tr><th>Edge case</th><th>What it catches</th></tr>
  <tr><td>Empty input <code>[]</code> / <code>""</code></td><td><code>arr[0]</code> on an empty array, <code>Math.max()</code> of nothing returning <code>-Infinity</code>, a <code>while</code> loop that assumed one element</td></tr>
  <tr><td>Single element</td><td>Two-pointer and sliding-window loops whose body never executes; <code>left &lt; right</code> vs <code>left &lt;= right</code></td></tr>
  <tr><td>All duplicates <code>[5,5,5,5]</code></td><td>Dedupe logic, Set-vs-Map choices, two-pointer skip loops, "distinct" requirements</td></tr>
  <tr><td>Already sorted / reverse sorted</td><td>Worst-case quicksort partitioning, degenerate BSTs, and off-by-one at the array ends</td></tr>
  <tr><td>Two elements</td><td>The smallest case where a comparison or swap can be backwards</td></tr>
  <tr><td>Negatives and zero</td><td>Greedy and sliding-window sum arguments that silently assume positivity; division and modulo by zero</td></tr>
  <tr><td>All elements identical to the target / none matching</td><td>The "not found" return contract you agreed on in minute two</td></tr>
  <tr><td>Maximum n from the constraints</td><td>Recursion depth (JS blows up around 10⁴-10⁵ frames), integer overflow past 2⁵³, O(n²) memory</td></tr>
</table>
<div class="say">
  <span class="ttl">Say it like this →</span> "Let me trace the given example
  before I call this done. left = 0, right = 4, sum = 9, target is 9 — returns
  [0, 4], matches. Now an edge case: single element. The <code>while (left &lt;
  right)</code> never executes, so I fall through to the not-found return —
  correct. And an empty array: <code>nums.length - 1</code> is -1, the loop
  still doesn't execute, still correct. I'm happy with this."
</div>
<div class="warn">
  <span class="ttl">⚠ Tracing "in your head" is not tracing</span>
  Under pressure, silently re-reading code confirms what you intended to write,
  not what you wrote. Say the actual variable values out loud, or write them in
  a comment block. The whole value of the exercise comes from forcing yourself
  to evaluate rather than recognize — and it is also the only way the
  interviewer can see you doing it.
</div>

<h3>Discussing tradeoffs at a senior level</h3>
<p>
  The clearest seniority marker in the last ten minutes is raising a tradeoff
  <b>before you are asked</b>, and framing it against a use case rather than in
  the abstract. Intermediate candidates report complexity. Advanced candidates
  report complexity, name the alternative they rejected, and say what would
  change their mind.
</p>
<table>
  <tr><th>Axis</th><th>The sentence to have ready</th></tr>
  <tr><td>Time vs space</td><td>"This is O(n) time with an O(n) hashmap. If memory were the binding constraint I'd sort in place and use two pointers — O(1) extra space, O(n log n) time. Which matters more here?"</td></tr>
  <tr><td>Preprocess vs per-query</td><td>"If this is called once, the linear scan is right. If it's called a million times on the same array, I'd build prefix sums up front — O(n) once, then O(1) per query."</td></tr>
  <tr><td>Worst case vs average case</td><td>"Quickselect is O(n) expected but O(n²) adversarially. If this is on a user-facing path where input could be hostile, I'd take the heap's guaranteed O(n log k) instead."</td></tr>
  <tr><td>Simplicity vs constant factor</td><td>"The bitmask version is maybe 5× faster per node but noticeably harder to read. For n ≤ 12 I'd ship the readable one and leave a comment about the optimization."</td></tr>
  <tr><td>Amortized vs bounded latency</td><td>"The dynamic array is amortized O(1) but a single resize is O(n). If this were in a real-time path I'd pre-size it."</td></tr>
  <tr><td>Exact vs approximate</td><td>"For exact distinct counts I need O(n) memory. If an error of a percent or two is acceptable at this scale, HyperLogLog does it in kilobytes."</td></tr>
  <tr><td>Mutating vs pure</td><td>"I'm sorting the input in place, which is faster but destroys the caller's array. If it's shared, I'd copy first and pay the O(n)."</td></tr>
</table>
<p class="sub">
  Every one of those ends in a question or a condition. That is deliberate — it
  turns a monologue into a design conversation and invites the interviewer to
  supply real-world context, which is the exact interaction they are trying to
  score. It is also honest: which side of a tradeoff is correct genuinely
  depends on information you do not have.
</p>
<p>
  Two more things to have ready without being asked. <b>How would this scale
  past one machine?</b> — even a sentence ("if the array doesn't fit in memory,
  I'd external-sort by chunk, or shard by hash of the key and merge") shows the
  thinking extends past the whiteboard. And <b>what would you test?</b> — naming
  three unit tests and one property ("the output should always be a permutation
  of the input") signals engineering maturity that pure DSA never reaches.
</p>

<h3>Signals that separate an advanced performance from an intermediate one</h3>
<ul>
  <li><b>Constraints are read as a hint, not as trivia.</b> "n ≤ 20, so they
    intend an exponential-in-n solution — that means bitmask" is said in the
    first two minutes, not discovered at minute thirty.</li>
  <li><b>A brute force is stated with its complexity before any optimizing
    starts.</b> There is always something on the board, and the improvement is
    measured against a named baseline rather than asserted.</li>
  <li><b>Patterns are named out loud as they are chosen.</b> "Monotonic stack,
    because I need the next greater element and each index is pushed and popped
    once" — not just correct code that happens to be a monotonic stack.</li>
  <li><b>The bottleneck is identified explicitly</b> ("the expensive part is
    re-scanning the prefix") and the optimization is presented as buying that
    specific work back with a specific structure.</li>
  <li><b>Getting stuck produces a described procedure, not silence.</b>
    Re-read constraints → hand-trace a tiny case → identify the shape → check
    for two composed patterns → relax a constraint → ask a precise question.</li>
  <li><b>The candidate tests their own code before declaring done</b> — a real
    trace with real values, plus a deliberately chosen edge case, and finds
    their own off-by-one.</li>
  <li><b>Tradeoffs are raised unprompted and tied to a use case</b>, with a
    stated condition that would flip the decision, rather than a memorized
    complexity table recited on request.</li>
  <li><b>Corrections are absorbed without defensiveness.</b> A hint is taken,
    integrated, and credited — "good catch, that breaks when the values are
    negative; let me fix the invariant" — because the interviewer is
    simulating what code review with you feels like.</li>
  <li><b>Uncertainty is stated honestly and bounded.</b> "I'm fairly sure this
    is O(n log n) amortized but I'd want to double-check the resize cost" beats
    a confident wrong claim every time, and it is the difference between an
    engineer you can trust and one you have to verify.</li>
</ul>`,
    },
  ],
};
