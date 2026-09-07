import type { Chapter } from "../types";

export const dsaBasicRecursion: Chapter = {
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
};
