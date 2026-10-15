import type { Chapter } from "../types";

export const dsaComplexityAnalysis: Chapter = {
  id: "dsa-complexity-analysis",
  num: "B1",
  title: "Complexity analysis",
  short: "Complexity analysis",
  levels: ["beginner"],
  prerequisites: [],
  practice: [
    "ex-classify-growth-rate",
    "ex-rewrite-nested-loop-linear",
    "ex-count-basic-operations",
    "ex-loop-iteration-counts",
    "ex-fib-call-count-and-depth",
    "ex-master-theorem-solver",
    "ex-amortized-push-cost",
  ],
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
  <svg viewBox="0 0 520 400" class="dg dg-fit" role="img" aria-label="A chart of operations versus input size n, showing O(1) and O(log n) staying low, O(n) rising as a straight diagonal, O(n log n) rising faster, and O(n squared) and O(2 to the n) shooting almost straight up and exiting the top of the chart early">
    <g class="rough">
      <path class="ln" d="M70,340 L423,340" />
      <path class="ln" d="M70,340 L70,20" />
    </g>
    <text class="sm" x="429" y="345">n</text>
    <text class="sm" x="40" y="20">ops</text>

    <path class="lng" d="M70,320 L423,320" fill="none" />
    <path class="lng dash" d="M70,320 C 151,300 261,270 423,250" fill="none" />
    <path class="ln" d="M70,320 L423,60" fill="none" />
    <path class="ln dash" d="M70,320 C 213,220 337,90 405,25" fill="none" />
    <path class="lnr" d="M70,320 C 138,260 213,120 250,25" fill="none" />
    <path class="lnr dash" d="M250,25 L250,10" fill="none" />
    <path class="lnr dash" d="M70,320 C 95,260 126,120 148,25" fill="none" />
    <path class="lnr dash" d="M148,25 L148,10" fill="none" />

    <text class="sm gr" x="432" y="324">O(1)</text>
    <text class="sm gr" x="432" y="254">O(log n)</text>
    <text class="sm" x="432" y="64">O(n)</text>
    <text class="sm" x="412" y="22">O(n log n)</text>
    <text class="sm rd" x="258" y="40">O(n²)</text>
    <text class="sm rd" x="15" y="45">O(2ⁿ)</text>
    <text class="sm rd" x="15" y="378">O(n²) and O(2ⁿ) explode — real numbers in the table below</text>
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
    const mid = lo + Math.floor((hi - lo) / 2);
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
<h4>Dry run: hasDuplicate([3, 1, 4, 1]) — counting the hidden work</h4>
<table>
  <tr><th>x</th><th>seen before</th><th>seen.includes(x) comparisons</th><th>Match?</th></tr>
  <tr><td>3</td><td>[]</td><td>0</td><td>no</td></tr>
  <tr><td>1</td><td>[3]</td><td>1 (vs 3)</td><td>no</td></tr>
  <tr><td>4</td><td>[3, 1]</td><td>2 (vs 3, 1)</td><td>no</td></tr>
  <tr><td>1</td><td>[3, 1, 4]</td><td>2 (vs 3, then 1 — match)</td><td>yes → return true</td></tr>
</table>
<p class="sub">
  0 + 1 + 2 + 2 = 5 comparisons to check an array of only 4 elements — the
  cost of each <code>includes</code> call grows with how much of
  <code>seen</code> exists so far, not a fixed amount. That growing-per-
  iteration cost is the O(n²) signature hiding behind what reads like a
  single, innocent <code>for...of</code> loop.
</p>

<h3>Loops that don't count up by one</h3>
<p>
  "Count the loops" works when every loop runs n times. Plenty of loops
  don't: the variable doubles, the inner loop starts where the outer one
  is, the condition tests <code>i * i</code>. For all of these the honest
  method is one question, asked of each loop in turn: <b>how many times
  does the body run, as a function of n?</b> The five shapes below cover
  almost everything you will meet. Each function counts its own body, so
  the table afterwards is measured, not guessed.
</p>
<pre><code>function countDoubling(n) {
  let steps = 0;
  for (let i = 1; i &lt; n; i *= 2) steps++;
  return steps;
}

function countTriangle(n) {
  let steps = 0;
  for (let i = 0; i &lt; n; i++) {
    for (let j = i + 1; j &lt; n; j++) steps++;
  }
  return steps;
}

function countSqrt(n) {
  let steps = 0;
  for (let i = 2; i * i &lt;= n; i++) steps++;
  return steps;
}

function countHarmonic(n) {
  let steps = 0;
  for (let i = 1; i &lt;= n; i++) {
    for (let j = i; j &lt;= n; j += i) steps++;
  }
  return steps;
}

function countNestedDoubling(n) {
  let steps = 0;
  for (let i = 0; i &lt; n; i++) {
    for (let j = 1; j &lt; n; j *= 2) steps++;
  }
  return steps;
}</code></pre>
<table>
  <tr><th>n</th><th>countDoubling</th><th>countTriangle</th><th>countSqrt</th><th>countHarmonic</th><th>countNestedDoubling</th></tr>
  <tr><td>10</td><td>4</td><td>45</td><td>2</td><td>27</td><td>40</td></tr>
  <tr><td>100</td><td>7</td><td>4,950</td><td>9</td><td>482</td><td>700</td></tr>
  <tr><td>1,000</td><td>10</td><td>499,500</td><td>30</td><td>7,069</td><td>10,000</td></tr>
  <tr><td>10,000</td><td>14</td><td>49,995,000</td><td>99</td><td>93,668</td><td>140,000</td></tr>
</table>
<p>
  Read the columns against the n that produced them and the shapes
  appear. Here is where each one comes from.
</p>
<ul>
  <li>
    <b>Doubling is logarithmic.</b> <code>i</code> takes the values 1, 2,
    4, 8, ..., 2<sup>k−1</sup> and stops once 2<sup>k</sup> reaches n. So
    the body runs ⌈log₂ n⌉ times: 10 times for n = 1,000, 20 for a million,
    and only 30 for a billion. Halving (<code>n = Math.floor(n / 2)</code>
    until it hits 0) is the same loop run backwards, which is exactly why
    binary search is O(log n).
  </li>
  <li>
    <b>A dependent inner loop is quadratic, with a half in front.</b> When
    the outer variable is <code>i</code>, the inner loop runs
    <code>n − 1 − i</code> times, so the total is (n−1) + (n−2) + ... + 1 +
    0 = n(n−1)/2. For n = 5 that is 4 + 3 + 2 + 1 + 0 = 10. The ½ is a
    constant, so the class is still O(n²): halving the work of a quadratic
    loop does not make it a different shape.
  </li>
  <li>
    <b>A condition on <code>i * i</code> is a square root.</b>
    <code>i * i &lt;= n</code> is the same test as <code>i &lt;= √n</code>, so
    the loop runs about √n times. Trial division for primality stops there
    because if n = a · b with a ≤ b, then a ≤ √n: any factor pair has a
    member at or below the root. A million costs about a thousand steps.
  </li>
  <li>
    <b>A stride that grows with <code>i</code> is harmonic.</b> The inner
    loop of <code>countHarmonic</code> runs ⌊n/i⌋ times, so the total is
    n · (1 + ½ + ⅓ + ... + 1/n) ≈ n · ln n. It is not n² because most values
    of <code>i</code> are large and their inner loop runs only a few times;
    for n = 100 the exact count is 482, close to 100 · ln 100 ≈ 460. This is
    the shape of the sieve of Eratosthenes, though the real sieve only
    strides from primes, which brings it down to O(n log log n).
  </li>
  <li>
    <b>A linear loop around a logarithmic one multiplies.</b>
    <code>countNestedDoubling</code> runs n times a loop that runs log n
    times: O(n log n), and the table shows exactly n × ⌈log₂ n⌉ (1,000 ×
    10 = 10,000).
  </li>
</ul>
<p>
  One more shape matters a great deal for the next chapters: a loop inside
  a loop whose inner variable <em>does not reset</em>. This is the engine
  of every two-pointer and sliding-window solution.
</p>
<pre><code>function countWindowMoves(nums, limit) {
  let left = 0, sum = 0, moves = 0;
  for (let right = 0; right &lt; nums.length; right++) {
    sum += nums[right];
    moves++;
    while (sum &gt; limit &amp;&amp; left &lt;= right) {
      sum -= nums[left];
      left++;
      moves++;
    }
  }
  return moves;
}</code></pre>
<p class="sub">
  It has a <code>while</code> inside a <code>for</code>, and it is O(n), not
  O(n²). <code>left</code> never moves backwards and never passes
  <code>right + 1</code>, so across the <em>whole</em> run it advances at
  most n times in total. <code>right</code> advances n times. The inner loop
  does not restart from zero on every outer step, so the two loops share a
  budget of at most 2n moves instead of multiplying. For
  <code>countWindowMoves([4, 2, 3, 5, 1], 6)</code> the moves are 5 steps of
  <code>right</code> plus 3 of <code>left</code>, 8 in all, well under 2n =
  10.
</p>
<div class="warn">
  <span class="ttl">⚠ Nested loops do not always mean a product</span>
  Before multiplying two loops, ask whether the inner loop's variable is
  reset to the same starting value on every outer step. If it is
  (<code>let j = 0</code> inside the outer body), multiply the two counts. If
  it is shared and only ever moves forward, add them. The mistake runs both
  ways: calling a pointer loop O(n²) undersells the solution, and calling a
  real double loop O(n) because "the inner one is small" oversells it.
</div>

<h3>What built-in calls really cost</h3>
<p>
  Most hidden quadratics come from one line that looks like a single step
  but is a loop inside the engine. The language specification does not
  promise any of these costs, and an engine is free to be faster than the
  table, but this is what to <em>assume</em> in an interview and say out
  loud. Read the right-hand column as "the work this line is allowed to
  hide".
</p>
<table>
  <tr><th>Call</th><th>Assume</th><th>Why</th></tr>
  <tr><td><code>arr[i]</code>, <code>arr.length</code>, <code>s[i]</code>, <code>s.charCodeAt(i)</code></td><td>O(1)</td><td>one index computation</td></tr>
  <tr><td><code>push</code>, <code>pop</code></td><td>amortized O(1)</td><td>the end of the array is the cheap end</td></tr>
  <tr><td><code>shift</code>, <code>unshift</code>, <code>splice(i, k)</code></td><td>O(n)</td><td>elements after the change move over</td></tr>
  <tr><td><code>slice(a, b)</code></td><td>O(b − a)</td><td>it builds a new array, so it copies the piece</td></tr>
  <tr><td><code>concat</code>, <code>[...arr]</code>, <code>Array.from(arr)</code>, <code>reverse</code>, <code>join</code></td><td>O(n)</td><td>each one touches every element</td></tr>
  <tr><td><code>includes</code>, <code>indexOf</code>, <code>find</code>, <code>some</code>, <code>every</code></td><td>O(n)</td><td>a scan that may stop early, worst case the whole array</td></tr>
  <tr><td><code>map</code>, <code>filter</code>, <code>forEach</code>, <code>reduce</code></td><td>O(n) × the callback</td><td>a callback that itself scans makes the whole call quadratic</td></tr>
  <tr><td><code>sort(compare)</code></td><td>O(n log n) comparisons</td><td>multiply by what one comparison costs</td></tr>
  <tr><td><code>Math.max(...arr)</code></td><td>O(n)</td><td>spreading a very large array into arguments can also throw a <code>RangeError</code></td></tr>
  <tr><td><code>s + t</code>, <code>s.slice(a, b)</code>, <code>s.repeat(k)</code></td><td>O(length of the result)</td><td>strings are immutable, so a new one is built</td></tr>
  <tr><td><code>s === t</code></td><td>O(length of the shorter)</td><td>comparison walks until the first difference</td></tr>
  <tr><td><code>s.split("")</code>, <code>[...s]</code></td><td>O(n)</td><td>one new element per character</td></tr>
  <tr><td><code>map.get</code>, <code>map.set</code>, <code>set.has</code>, <code>set.add</code></td><td>O(1) average</td><td>for a string key add the O(L) cost of hashing a key of length L</td></tr>
  <tr><td><code>Object.keys</code>, <code>Object.values</code>, <code>Object.entries</code></td><td>O(n)</td><td>builds an array of every property</td></tr>
</table>
<p>
  Two rows deserve a second look. The callback row is where most
  accidental quadratics are born:
  <code>arr.filter((x) =&gt; other.includes(x))</code> is one line and
  O(n × m), because the callback's <code>includes</code> scans
  <code>other</code> for every element. And the string-key row is the
  polite lie of hash maps: a map of n strings, each of length L, costs
  O(n · L) to fill, not O(n), because every key has to be hashed
  character by character. When the strings are short that is a constant, and
  when the interviewer says "each word can be up to 10,000 characters", it
  is not.
</p>
<p>Here is the table at work on a short function. Read it line by line, the way you would out loud.</p>
<pre><code>function lengthsReversed(words) {          <span class="c">// n words, each up to L characters</span>
  const sorted = [...words].sort();         <span class="c">// spread O(n); sort O(n log n) compares, each up to O(L)</span>
  const out = [];
  for (const w of sorted) {                 <span class="c">// n iterations</span>
    out.unshift(w.length);                  <span class="c">// O(n) every time: the hidden loop</span>
  }
  return out;
}</code></pre>
<table>
  <tr><th>Line</th><th>Cost</th></tr>
  <tr><td><code>[...words]</code></td><td>O(n)</td></tr>
  <tr><td><code>.sort()</code></td><td>O(n log n) comparisons × O(L) per comparison = O(n · L · log n)</td></tr>
  <tr><td><code>out.unshift(...)</code> in a loop of n</td><td>n calls × O(n) each = O(n²)</td></tr>
  <tr><td>Total</td><td>O(n · L · log n + n²), with O(n) extra space</td></tr>
</table>
<p class="sub">
  Which term wins depends on the input: with short words the quadratic
  <code>unshift</code> loop dominates, and with a few very long words the
  sort does. Naming both terms instead of rounding to one is what shows the
  interviewer you looked inside the lines. The fix for the loop is to
  <code>push</code> and <code>reverse</code> once at the end, which is O(n).
</p>

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
  <tr><td>Naive recursive Fibonacci</td><td>T(n) = T(n-1) + T(n-2) + O(1)</td><td>doesn't fit the form (n-1 and n-2, not n/b)</td><td>O(2ⁿ) upper bound (the tight bound is O(φⁿ), φ ≈ 1.618)</td></tr>
</table>
<p class="sub">
  You will not be asked to apply the Master Theorem from memory in most
  interviews — but being able to write down a recurrence for your own
  recursive solution, and reason informally about "how many levels ×
  how much work per level," is a real and commonly-tested skill.
</p>

<h3>Memoized recursion: states times work per state</h3>
<p>
  A recurrence like <code>T(n) = T(n−1) + T(n−2) + O(1)</code> counts
  <em>calls</em>, and it is the right tool for plain recursion. Add a cache
  and it stops being the right tool, because most of those calls no longer
  do anything. The count that matters changes to this:
</p>
<div class="sticky mint">
  <span class="ttl">The memoization rule</span>
  Time = (number of distinct states) × (work done in one state, not counting
  the recursive calls it makes). Each state's body runs once, because every
  later call to it is answered from the cache in O(1). Space = the cache
  (one entry per state) plus the deepest chain of calls.
</div>
<p>Watch the rule on Fibonacci, counting both the calls and the bodies that actually run.</p>
<pre><code>function fibNaive(n, stats) {
  stats.calls++;
  if (n &lt; 2) return n;
  return fibNaive(n - 1, stats) + fibNaive(n - 2, stats);
}

function fibMemo(n, stats, memo = new Map()) {
  stats.calls++;
  if (n &lt; 2) return n;
  if (memo.has(n)) return memo.get(n);
  stats.bodies++;
  const value = fibMemo(n - 1, stats, memo) + fibMemo(n - 2, stats, memo);
  memo.set(n, value);
  return value;
}</code></pre>
<table>
  <tr><th>n</th><th>fibNaive calls</th><th>fibMemo calls</th><th>fibMemo bodies run</th></tr>
  <tr><td>6</td><td>25</td><td>11</td><td>5</td></tr>
  <tr><td>10</td><td>177</td><td>19</td><td>9</td></tr>
  <tr><td>20</td><td>21,891</td><td>39</td><td>19</td></tr>
  <tr><td>30</td><td>2,692,537</td><td>59</td><td>29</td></tr>
</table>
<p class="sub">
  There are n − 1 states that run a body (the values 2 through n), and each
  body does O(1) work besides its two recursive calls, so the time is
  O(n). The calls column is about twice the bodies column because every body
  makes two calls and only the first call into a state does real work. That
  is the general shape: calls ≤ states × calls per body, so counting
  bodies loses at most a constant factor.
</p>
<p>
  The rule matters most when the work per state is not constant. Minimum
  coins to make an amount is the standard example:
</p>
<pre><code>function minCoins(coins, amount) {
  const memo = new Map();
  function solve(left) {
    if (left === 0) return 0;
    if (left &lt; 0) return Infinity;
    if (memo.has(left)) return memo.get(left);
    let best = Infinity;
    for (const coin of coins) {
      best = Math.min(best, solve(left - coin) + 1);
    }
    memo.set(left, best);
    return best;
  }
  const result = solve(amount);
  return result === Infinity ? -1 : result;
}</code></pre>
<table>
  <tr><th>Quantity</th><th>Value</th><th>Reason</th></tr>
  <tr><td>States</td><td>amount</td><td><code>left</code> can be 1, 2, ..., amount; 0 and negatives return immediately</td></tr>
  <tr><td>Work per state</td><td>coins.length</td><td>one loop over the coin list, plus O(1) cache work</td></tr>
  <tr><td>Time</td><td>O(amount × coins.length)</td><td>states × work per state</td></tr>
  <tr><td>Space</td><td>O(amount)</td><td>the cache has one entry per state</td></tr>
</table>
<p class="sub">
  With <code>coins = [1, 2, 5]</code> and an amount of 11, 100 or 1,000, the
  count of bodies run is exactly 11, 100 and 1,000: one per amount, as the
  table says. Without the cache the same recursion branches three ways at
  every level and its call tree grows exponentially in the amount.
</p>
<div class="warn">
  <span class="ttl">⚠ Two things the rule does not tell you</span>
  <b>The stack is still there.</b> Memoization removes repeated work, not
  depth: <code>minCoins([1], 10000)</code> recurses 10,000 calls deep and
  throws a <code>RangeError</code> on a default Node 24 stack, even though it
  has only 10,000 states. A bottom-up DP table has
  no such limit. <b>The state must be the whole state.</b> If the answer
  depends on two parameters but the cache key uses one, the cache returns
  answers computed for a different question, and you get wrong results, not
  slow ones. The number of states is the product of the ranges of every
  parameter in the key.
</div>
<p class="sub">
  The same rule prices every DP you will write later: a table of r × c
  cells with O(1) work per cell is O(r · c); a table of n cells where each
  looks back over all earlier cells is O(n²). See
  <a href="/dsa/dsa-dp-1d">DP in one dimension</a> for the full treatment.
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

<h3>The potential method: amortized cost with a bank account</h3>
<p>
  The aggregate method above works when you can add up the whole sequence
  at once. Many structures are easier to reason about one operation at a
  time, and for that you use a <b>potential function</b> Φ: a number
  computed from the structure's current state that stands for "work we have
  already paid for but not yet done". The amortized cost of an operation is
  its actual cost plus the change in potential:
</p>
<pre><code>amortized = actual + Φ(after) − Φ(before)</code></pre>
<p>
  Add this up over a sequence of n operations and the Φ terms cancel from
  end to end, leaving total actual cost = total amortized cost − Φ(final) +
  Φ(start). So if Φ starts at 0 and never goes negative, the total actual
  cost is at most the total amortized cost. If every operation has a
  constant amortized cost, the whole sequence does too.
</p>
<p>
  For the doubling array, pick Φ = 2 · size − capacity. Then the argument
  has only two cases:
</p>
<ul>
  <li>
    <b>A push with room to spare.</b> Actual cost 1. The size grows by one,
    so Φ rises by 2. Amortized = 1 + 2 = 3.
  </li>
  <li>
    <b>A push into a full array</b> (size = capacity = c). Actual cost c + 1:
    copy the c elements, then write one. Before the push Φ = 2c − c = c.
    Afterwards the size is c + 1 and the capacity is 2c, so Φ = 2(c + 1) − 2c =
    2. Amortized = (c + 1) + (2 − c) = 3. The big copy is paid for by the
    potential the cheap pushes stored up.
  </li>
</ul>
<p>
  So every push has amortized cost at most 3, and n pushes cost at most 3n
  in total. The code below replays the argument by running a model of the
  array and recording both numbers for every push.
</p>
<pre><code>function simulatePushes(n) {
  let size = 0, capacity = 0, actual = 0;
  const amortized = [];
  for (let k = 0; k &lt; n; k++) {
    const before = 2 * size - capacity;
    let cost = 1;
    if (size === capacity) {
      cost += size;
      capacity = Math.max(1, capacity * 2);
    }
    size++;
    actual += cost;
    amortized.push(cost + (2 * size - capacity) - before);
  }
  return { actual, amortized };
}</code></pre>
<h4>Dry run: the first six pushes</h4>
<table>
  <tr><th>push</th><th>size, capacity before</th><th>actual cost</th><th>Φ before → after</th><th>amortized</th></tr>
  <tr><td>1</td><td>0, 0 (full)</td><td>1</td><td>0 → 1</td><td>2</td></tr>
  <tr><td>2</td><td>1, 1 (full)</td><td>2</td><td>1 → 2</td><td>3</td></tr>
  <tr><td>3</td><td>2, 2 (full)</td><td>3</td><td>2 → 2</td><td>3</td></tr>
  <tr><td>4</td><td>3, 4</td><td>1</td><td>2 → 4</td><td>3</td></tr>
  <tr><td>5</td><td>4, 4 (full)</td><td>5</td><td>4 → 2</td><td>3</td></tr>
  <tr><td>6</td><td>5, 8</td><td>1</td><td>2 → 4</td><td>3</td></tr>
</table>
<p class="sub">
  Total actual cost of the first five pushes is 1 + 2 + 3 + 1 + 5 = 12,
  against a budget of 3 × 5 = 15. The expensive pushes (3 and 5) are exactly
  the ones where Φ drops. For n = 1,000 the simulation gives a total actual
  cost of 2,023 and a largest amortized value of 3. The first push shows 2
  rather than 3 only because the model starts from capacity 0.
</p>
<div class="warn">
  <span class="ttl">⚠ The potential has two jobs, and both can be forgotten</span>
  Φ must start at 0 (or at its minimum) and must never go negative. With
  Φ = 2 · size − capacity, an array that starts with capacity 1 and size 0
  would begin at Φ = −1 and the "total actual ≤ total amortized" step would
  quietly fail. Also keep the idea separate from average case: Φ is a
  proof device about a sequence of operations, not a probability over inputs.
</div>
<p class="sub">
  You will almost never write a potential function in an interview. What is
  worth having is the story it tells: every cheap operation pays a little
  extra into an account, and an occasional expensive one spends the
  account. That is how to defend "amortized O(1)" for a dynamic array, for
  the two-stack queue, and for a monotonic stack where each element is pushed
  once and popped at most once.
</p>

<h3>Output size, and numbers that are values rather than sizes</h3>
<p>
  Two cases make "count the loops" give an answer that is right on paper and
  wrong in practice.
</p>
<p>
  <b>The output is part of the work.</b> No algorithm can run faster than the
  time it takes to write its answer. A function that returns every subset of
  n numbers must produce 2<sup>n</sup> arrays whose lengths add up to
  n · 2<sup>n−1</sup>, so it is Θ(n · 2<sup>n</sup>) however cleverly it is
  written.
</p>
<pre><code>function allSubsets(nums) {
  const out = [[]];
  for (const x of nums) {
    const size = out.length;
    for (let i = 0; i &lt; size; i++) out.push([...out[i], x]);
  }
  return out;
}</code></pre>
<p class="sub">
  Counting the work: the loop over <code>nums</code> runs n times, but the
  inner loop doubles each round (1, 2, 4, ..., 2<sup>n−1</sup> subsets), and
  each <code>[...out[i], x]</code> copies the subset it extends. For n = 10
  the result has 1,024 subsets with 5,120 elements in total; for n = 20 it has
  1,048,576 subsets and 10,485,760 elements. Say so out loud: "O(n · 2ⁿ), and
  that is also the size of the output, so it cannot be beaten". The same
  reasoning prices all permutations at O(n · n!) and all pairs at O(n²).
</p>
<p>
  <b>A number can be an input whose <em>value</em> is the loop bound.</b>
  An algorithm is <em>pseudo-polynomial</em> when its cost is polynomial in
  the numeric value of an input but exponential in the number of digits it
  takes to write that input. The subset-sum check below is the classic case:
</p>
<pre><code>function canMakeSum(nums, target) {
  const reachable = new Uint8Array(target + 1);
  reachable[0] = 1;
  for (const x of nums) {
    for (let s = target; s &gt;= x; s--) {
      if (reachable[s - x]) reachable[s] = 1;
    }
  }
  return reachable[target] === 1;
}</code></pre>
<table>
  <tr><th>target</th><th>digits needed to write it</th><th>steps for n numbers</th><th>memory</th></tr>
  <tr><td>1,000</td><td>4</td><td>about n × 1,000</td><td>1 KB</td></tr>
  <tr><td>1,000,000</td><td>7</td><td>about n × 1,000,000</td><td>1 MB</td></tr>
  <tr><td>1,000,000,000</td><td>10</td><td>about n × 1,000,000,000</td><td>1 GB</td></tr>
</table>
<p class="sub">
  The time is O(n · target) and the space is O(target). It is "polynomial"
  only if you treat <code>target</code> as the input size. But adding one
  digit to the target multiplies the work by ten, so in terms of the
  length of the input it is exponential. The honest interview statement is
  "O(n · T) time and O(T) space, which is fine because T is at most a few
  thousand here". Two others you will meet: trial-division primality
  (<code>for (let i = 2; i * i &lt;= n; i++)</code>) is O(√N) in the value
  N, about 31,621 steps for N = 1,000,000,007, and the 0/1 knapsack DP is
  O(n · W) in the capacity W.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "This is O(n · W), where W is
  the numeric capacity, not the input length. It is pseudo-polynomial: fine
  for W up to about a million, hopeless if W can be a billion, and in that
  case I'd look for a different formulation."
</div>

<h3>The constraints tell you the target complexity</h3>
<p>
  The most useful complexity skill in an interview happens before any
  code: read the limits on n and work backwards. A comfortable budget to plan
  for is about 10<sup>8</sup> simple steps, which is a rule of thumb for
  choosing an approach, not a measurement. The table lists the largest
  growth rate that fits under that budget for each size of n, and the kind
  of solution that usually lives there.
</p>
<table>
  <tr><th>Largest n</th><th>Fits</th><th>Work at that n</th><th>Typical approach</th></tr>
  <tr><td>about 10</td><td>O(n!)</td><td>10! = 3,628,800</td><td>try every ordering: permutations, brute-force backtracking</td></tr>
  <tr><td>about 20 to 25</td><td>O(2ⁿ), or O(n · 2ⁿ) near 20</td><td>2²⁰ = 1,048,576 (times 20 for n · 2ⁿ); 2²⁵ = 33,554,432</td><td>try every subset, bitmask, meet in the middle</td></tr>
  <tr><td>about 500</td><td>O(n³)</td><td>500³ = 125,000,000</td><td>three nested loops, interval DP, Floyd–Warshall</td></tr>
  <tr><td>about 5,000</td><td>O(n²)</td><td>5,000² = 25,000,000</td><td>all pairs, 2D DP, two nested loops</td></tr>
  <tr><td>about 10⁵</td><td>O(n log n)</td><td>about 1.7 million</td><td>sorting, heaps, binary search per element, balanced trees</td></tr>
  <tr><td>about 10⁷</td><td>O(n)</td><td>about 10⁷</td><td>one pass, hash map, two pointers, prefix sums</td></tr>
  <tr><td>10⁹ or more</td><td>O(log n) or O(1)</td><td>about 30</td><td>binary search on the answer, math formula, fast exponentiation</td></tr>
</table>
<p>
  Use it in two directions. Forward: when a problem says n ≤ 10<sup>5</sup>
  and your first idea is an O(n²) pair loop (10<sup>10</sup> steps), you
  know before writing a line that the idea is too slow and a hash map, sort,
  or pointer technique is needed. Backward: when the limit is n ≤ 20 and
  someone proposes a clever O(n) greedy, the small limit is a hint that the
  intended solution is an exponential search, and the greedy may be wrong.
  The sizes in the table also tell you what <em>not</em> to over-engineer:
  at n ≤ 1,000, an O(n²) loop is 10<sup>6</sup> steps and a perfectly good
  answer.
</p>
<div class="warn">
  <span class="ttl">⚠ The table is a starting guess, not a proof</span>
  Constants matter at the edges: an O(n log n) solution with a heavy
  comparator, or an O(n²) one that allocates in its inner loop, can fail
  where the table says it fits. Strings multiply everything by their length
  (see the string-key row above). And when the statement gives no limits at
  all, ask for them: it is the single question that most changes your
  answer.
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
</p>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Read the time and space complexity off a function by counting loops and allocations, not lines of code.</li>
    <li>Spot a hidden O(n) call (includes, indexOf, spreading a Set) sitting inside a loop, and explain why that makes the whole function O(n²).</li>
    <li>Explain the difference between O, Ω and Θ, and why interviews almost always mean "worst case" when they say Big-O.</li>
    <li>Derive O(n log n) from a recurrence like T(n) = 2T(n/2) + O(n), at least at the level of "why the log n shows up."</li>
    <li>State a solution's complexity out loud before writing it, as a plan rather than an afterthought.</li>
    <li>Work out how many times a loop body runs when the variable doubles, starts at the outer index, tests <code>i * i</code>, or strides by <code>i</code>, and tell a pointer loop that shares a budget from a nested loop that multiplies.</li>
    <li>Price the built-in calls in a loop (<code>slice</code>, spread, <code>sort</code>, string keys) instead of treating each as one step.</li>
    <li>Cost a memoized recursion as states times work per state, and say why a cache does not shrink the call stack.</li>
    <li>Say why an output of size 2ⁿ forces the time, and what "pseudo-polynomial" means for a loop bounded by a value.</li>
    <li>Turn a limit such as n ≤ 10⁵ into the complexity you are allowed to use before writing any code.</li>
  </ul>
</div>`,
};
