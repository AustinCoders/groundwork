import type { Chapter } from "../types";

export const dsaBasicRecursion: Chapter = {
  id: "dsa-basic-recursion",
  num: "B9",
  title: "Basic recursion",
  short: "Basic recursion",
  levels: ["beginner"],
  prerequisites: ["dsa-complexity-analysis"],
  practice: [
    "ex-fibonacci-memoised",
    "ex-fast-power",
    "ex-generate-subsets",
    "ex-flatten-nested-array",
    "ex-palindrome-by-indices",
    "ex-reverse-in-place-recursive",
    "ex-nested-list-depth-sum",
    "ex-gcd-euclid",
    "ex-tower-of-hanoi",
    "ex-count-subsets-with-sum",
    "ex-sum-numbers-in-object",
    "ex-tree-height-explicit-stack",
    "ex-modular-power",
  ],
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
<h4>Dry run: factorial(4)</h4>
<table>
  <tr><th>Call</th><th>n</th><th>n &lt;= 1?</th><th>Returns</th></tr>
  <tr><td>factorial(4)</td><td>4</td><td>no</td><td>waits on 4 × factorial(3)</td></tr>
  <tr><td>factorial(3)</td><td>3</td><td>no</td><td>waits on 3 × factorial(2)</td></tr>
  <tr><td>factorial(2)</td><td>2</td><td>no</td><td>waits on 2 × factorial(1)</td></tr>
  <tr><td>factorial(1)</td><td>1</td><td>yes</td><td>1 (base case — no further call)</td></tr>
  <tr><td>factorial(2) resumes</td><td>—</td><td>—</td><td>2 × 1 = 2</td></tr>
  <tr><td>factorial(3) resumes</td><td>—</td><td>—</td><td>3 × 2 = 6</td></tr>
  <tr><td>factorial(4) resumes</td><td>—</td><td>—</td><td>4 × 6 = 24</td></tr>
</table>
<p class="sub">
  Nothing multiplies until <code>factorial(1)</code> hits the base case —
  every call above it is suspended mid-expression, waiting on its own
  recursive call to resolve. That's exactly the four simultaneously-alive
  stack frames the space warning below is about: the actual arithmetic
  only happens on the way back up, never on the way down.
</p>

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
  <code>new Array()</code> anywhere. Deep enough recursion (around ten
  thousand levels in node, measured below) throws a real
  <code>RangeError: Maximum call stack size exceeded</code>. This is a
  legitimate interview follow-up: "can you do this iteratively instead?"
</div>

<h3>The leap of faith: write one step, trust the call</h3>
<p>
  The dry run above shows what recursion <em>does</em>. It is a poor way to
  <em>write</em> it: if you try to hold five suspended calls in your head
  while you decide the next line, you will lose the thread by the fourth.
  Write it the way a proof by induction is written. Assume the function
  already returns the right answer for every smaller input, and write only
  the step that turns that answer into yours. Three questions, in this
  order, and the function mostly falls out:
</p>
<ul>
  <li><b>What is the smallest input I can answer without a recursive call?</b> That is the base case. Check that it covers <em>every</em> smallest input, not just the one you were thinking of.</li>
  <li><b>If someone handed me the correct answer for a smaller input, what would I do with it?</b> That is the recursive case. It is one step, not a plan for the whole recursion.</li>
  <li><b>Is the input I hand down strictly smaller, so the base case is eventually reached?</b> That is the progress check, and it is where most infinite recursions are born.</li>
</ul>
<pre><code>function sumDigits(n) {
  if (n &lt; 10) return n;                            <span class="c">// base: one digit, the answer is the number itself</span>
  return (n % 10) + sumDigits(Math.floor(n / 10));  <span class="c">// last digit + (trust: the rest is already right)</span>
}

function isPalindrome(s, lo = 0, hi = s.length - 1) {
  if (lo &gt;= hi) return true;                 <span class="c">// base: zero or one character left</span>
  if (s[lo] !== s[hi]) return false;          <span class="c">// the outer pair can settle it alone</span>
  return isPalindrome(s, lo + 1, hi - 1);     <span class="c">// otherwise trust the inside</span>
}</code></pre>
<p>
  Notice what the bodies do <em>not</em> contain: no loop over the digits, no
  bookkeeping about how many calls are pending. <code>sumDigits(4072)</code>
  is <code>2 + sumDigits(407)</code>, and you are allowed to believe
  <code>sumDigits(407)</code> without opening it up. That permission is the
  leap of faith, and it is justified: the base case is correct, and if every
  call on a smaller input is correct then so is the step built on it, so by
  induction every size is correct.
</p>
<h4>Dry run: isPalindrome("abca") and isPalindrome("abba")</h4>
<table>
  <tr><th>Call</th><th>lo</th><th>hi</th><th>s[lo] vs s[hi]</th><th>Returns</th></tr>
  <tr><td>isPalindrome("abca")</td><td>0</td><td>3</td><td>a = a</td><td>trusts the call on (1, 2)</td></tr>
  <tr><td>isPalindrome("abca")</td><td>1</td><td>2</td><td>b ≠ c</td><td>false, with no further call</td></tr>
  <tr><td>isPalindrome("abba")</td><td>0</td><td>3</td><td>a = a</td><td>trusts the call on (1, 2)</td></tr>
  <tr><td>isPalindrome("abba")</td><td>1</td><td>2</td><td>b = b</td><td>trusts the call on (2, 1)</td></tr>
  <tr><td>isPalindrome("abba")</td><td>2</td><td>1</td><td>—</td><td>lo &gt;= hi: true (nothing left)</td></tr>
</table>
<p class="sub">
  The last row is the reason the base case says <code>lo &gt;= hi</code> and not
  <code>lo === hi</code>. A string of even length shrinks from both ends
  and the two indices <em>cross</em> without ever being equal. With
  <code>===</code> the call on <code>"abba"</code> carries on to
  <code>(3, 0)</code>, then to indices off both ends of the string where
  <code>undefined === undefined</code> keeps the comparison happy, and
  finally throws a <code>RangeError</code>. When you write a base case,
  list every input size that can arrive there, not just the one you drew.
</p>
<div class="warn">
  <span class="ttl">⚠ The three ways the leap of faith breaks</span>
  <b>No progress:</b> the recursive call receives the same input (or one
  that moves away from the base case), so the leap trusts a call that never
  returns. <b>A base case that is too narrow:</b> it matches the input you
  imagined and skips its neighbour, as <code>lo === hi</code> does above.
  <b>A step that does more than one step:</b> if the body re-solves part of
  the smaller problem itself, you are no longer trusting the call, and the
  code becomes hard to reason about and often slow. Fix the step so it uses
  the returned answer and nothing deeper.
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

<h3>Slicing hides a cost: count what each call copies</h3>
<p>
  <code>reverseString</code> above is correct, but it is not the O(n) that
  its single recursive call suggests. Each call runs
  <code>s.slice(1)</code>, which builds a new string of every character
  except the first, and then <code>+ s[0]</code> builds another. The
  calls make n − 1, n − 2, … 1 characters' worth of copies, and that adds up to
  n(n − 1) / 2. Treat that as the cost model: one call per character, each
  call doing O(n) copying work, so O(n²) time overall. (An engine is free to
  share storage between a string and its slice, but you cannot rely on it and
  an interviewer will not grant it, so say O(n²).) The same trap appears in
  arrays whenever the recursion is written as
  <code>f(arr.slice(1))</code> or <code>f([...rest])</code>.
</p>
<table>
  <tr><th>String length n</th><th>Characters copied by slice (n(n − 1) / 2)</th></tr>
  <tr><td>10</td><td>45</td></tr>
  <tr><td>100</td><td>4,950</td></tr>
  <tr><td>1,000</td><td>499,500</td></tr>
  <tr><td>5,000</td><td>12,497,500</td></tr>
</table>
<p class="sub">
  Those counts were measured by wrapping <code>String.prototype.slice</code>
  in node and adding up the lengths it returned (499,500 for a 1,000-character
  string), so they match the formula exactly. The fix is to stop making
  smaller copies and instead pass <em>indices</em> that describe the smaller
  problem. The recursion shape is identical and each call does O(1) work:
</p>
<pre><code>function reverseInPlace(chars, lo = 0, hi = chars.length - 1) {
  if (lo &gt;= hi) return chars;                         <span class="c">// base: zero or one element left</span>
  [chars[lo], chars[hi]] = [chars[hi], chars[lo]];     <span class="c">// swap the outer pair</span>
  return reverseInPlace(chars, lo + 1, hi - 1);        <span class="c">// trust the inside</span>
}
<span class="c">// reverseInPlace(["a","b","c","d"]) → ["d","c","b","a"]</span></code></pre>
<p>
  This does about n / 2 calls, each O(1), so O(n) time, and the call stack
  gets about n / 2 deep, so O(n) space for the stack. It reverses the array it
  is given; strings are immutable in JavaScript, so you reverse
  <code>[...s]</code> and join the result at the end. The general rule worth
  saying out loud: <b>pass the boundaries of the subproblem, not a copy of
  it.</b> Binary search, merge sort on index ranges and every backtracking
  routine later in the course follow it.
</p>

<h3>Return it up, or carry it down</h3>
<p>
  A recursive call can communicate in two directions. So far the answers have
  flowed <b>up</b>: each call returns a value, and the caller combines it
  (<code>sum</code>, <code>treeHeight</code>). The other option is to flow
  information <b>down</b>: the caller hands the call what has happened so far
  as an extra parameter, and the call either reports it at the base case or
  records it somewhere shared. The same sum, both ways:
</p>
<pre><code>function sumReturn(arr, i = 0) {              <span class="c">// answer flows UP</span>
  if (i === arr.length) return 0;
  return arr[i] + sumReturn(arr, i + 1);      <span class="c">// the addition waits until the call returns</span>
}

function sumCarry(arr, i = 0, total = 0) {    <span class="c">// answer flows DOWN, in the parameter</span>
  if (i === arr.length) return total;         <span class="c">// the finished total is simply passed back up</span>
  return sumCarry(arr, i + 1, total + arr[i]);
}</code></pre>
<p>
  <code>sumCarry</code> has nothing left to do after the recursive call, which
  is called a <em>tail call</em>. In some languages that lets the compiler
  reuse the frame. Do not count on it in JavaScript: calling
  <code>sumCarry</code> on an array of 100,000 elements throws a
  <code>RangeError</code> in node, exactly like <code>sumReturn</code> would.
  Carrying the total down changes the shape of the code, not the stack depth.
  If depth is the problem, use a loop or the explicit stack from the
  conversion section below.
</p>
<p>
  Carrying state down earns its keep when the answer depends on <em>where you
  are</em> rather than on the children: the depth of a node, the sum of the path so
  far, the list of choices made so far. Those need a parameter, and the extra
  parameters are an implementation detail the caller should not see. The
  standard shape is a clean public function wrapping an inner
  <b>helper</b> that carries the state:
</p>
<pre><code>function deepestLeafDepth(root) {
  let best = 0;                                <span class="c">// shared by every call of walk</span>
  function walk(node, depth) {                 <span class="c">// depth is carried DOWN</span>
    if (node === null) return;
    best = Math.max(best, depth);
    walk(node.left, depth + 1);
    walk(node.right, depth + 1);
  }
  walk(root, 1);
  return best;
}</code></pre>
<p class="sub">
  This returns the same number as <code>treeHeight</code> from the tree
  section below, computed in the other direction. Return up when the answer
  is built from the answers to the smaller pieces (height, size, count). Carry
  down when it depends on the route taken to reach a node (depth, running
  total, the path itself). Plenty of tree problems do both at once, such as
  the maximum path sum, which the tree chapters cover.
</p>
<div class="warn">
  <span class="ttl">⚠ Shared state is where carried recursion goes wrong</span>
  Declare <code>best</code> inside the public function, as above. If it lives
  outside, at the top of the file, it keeps its value between calls and the
  second call starts from the first call's answer. Also remember that arrays
  and objects passed down are shared, not copied: if you collect a
  <code>path</code> array and push it into your results, you must push a copy
  (<code>[...path]</code>), or every result will end up pointing at the same
  array, which the subsets section below shows in action. Finally, a default
  parameter such as <code>i = 0</code> becomes part of the public signature:
  nothing stops a caller passing <code>sumCarry(arr, 5)</code>. A wrapper with
  an inner helper keeps the contract clean.
</div>

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

<h3>Nested data: when the input is the recursion</h3>
<p>
  Sometimes you never choose to recurse, because the data is already
  recursive: an array that can contain arrays, a JSON object whose values can
  be objects. The tree pattern applies unchanged, with one twist worth
  stating plainly. The base case is not "empty", it is "this is not a
  container": a number, a string, <code>null</code>. Everything else is a node
  with children to visit.
</p>
<pre><code>function flatten(value, out = []) {
  if (!Array.isArray(value)) {               <span class="c">// base: a leaf, not a container</span>
    out.push(value);
    return out;
  }
  for (const item of value) flatten(item, out);  <span class="c">// out is carried down and filled in place</span>
  return out;
}

function nestingDepth(value) {
  if (!Array.isArray(value)) return 0;       <span class="c">// a leaf adds no nesting</span>
  let deepest = 0;
  for (const item of value) deepest = Math.max(deepest, nestingDepth(item));
  return 1 + deepest;                        <span class="c">// this array itself is one level</span>
}</code></pre>
<h4>Dry run: nestingDepth([1, [2, [3]], 4])</h4>
<table>
  <tr><th>Call</th><th>Is it an array?</th><th>Children's depths</th><th>Returns</th></tr>
  <tr><td>nestingDepth(1)</td><td>no</td><td>—</td><td>0</td></tr>
  <tr><td>nestingDepth(2)</td><td>no</td><td>—</td><td>0</td></tr>
  <tr><td>nestingDepth(3)</td><td>no</td><td>—</td><td>0</td></tr>
  <tr><td>nestingDepth([3])</td><td>yes</td><td>0</td><td>1 + 0 = 1</td></tr>
  <tr><td>nestingDepth([2, [3]])</td><td>yes</td><td>0, 1</td><td>1 + 1 = 2</td></tr>
  <tr><td>nestingDepth(4)</td><td>no</td><td>—</td><td>0</td></tr>
  <tr><td>nestingDepth([1, [2, [3]], 4])</td><td>yes</td><td>0, 2, 0</td><td>1 + 2 = 3</td></tr>
</table>
<p class="sub">
  <code>flatten</code> was checked against the built-in
  <code>arr.flat(Infinity)</code> on random nested arrays. Time is O(total number of
  values and arrays), because every element is visited once, and the stack depth equals the nesting
  depth. A tempting shorter version, <code>out.push(...flatten(item))</code>,
  spreads each inner result into function arguments, and in node spreading an
  array of 150,000 elements into a call already throws a <code>RangeError</code>;
  carrying <code>out</code> down avoids both that and the repeated copying.
</p>
<p>
  The same shape handles objects, with three details that cost people offers:
</p>
<pre><code>function sumNumbers(value, seen = new Set()) {
  if (typeof value === "number") return value;
  if (value === null || typeof value !== "object") return 0;  <span class="c">// null is typeof "object"!</span>
  if (seen.has(value)) return 0;                              <span class="c">// already visited: breaks cycles</span>
  seen.add(value);
  let total = 0;
  for (const child of Object.values(value)) total += sumNumbers(child, seen);
  return total;
}</code></pre>
<ul>
  <li><b><code>typeof null === "object"</code>.</b> Without the explicit <code>null</code> check, <code>Object.values(null)</code> throws a <code>TypeError</code> the first time a <code>null</code> value appears.</li>
  <li><b>Cycles.</b> If <code>a.self = a</code>, plain recursion never reaches a leaf and ends in a <code>RangeError</code>. The <code>seen</code> set records the containers already entered. (JSON has no cycles, which is why <code>JSON.stringify</code> throws on one.)</li>
  <li><b>Shared references.</b> The same <code>seen</code> set also skips an object that is merely <em>reachable twice</em>. For <code>[shared, shared]</code> where <code>shared = { x: 1 }</code>, this version returns 1 and a version without <code>seen</code> returns 2. Decide which answer the question wants, and say so.</li>
</ul>

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
  <svg viewBox="0 0 640 330" class="dg" role="img" aria-label="The recursion tree for fib(4), branching into two calls at every level, with fib(2) and fib(1) recomputed multiple times">
    <g class="rough">
      <rect class="box" x="270" y="10" width="100" height="36" />
      <rect class="box" x="120" y="80" width="100" height="36" />
      <rect class="boxr" x="420" y="80" width="100" height="36" />
      <rect class="box" x="40" y="150" width="90" height="36" />
      <rect class="boxr" x="150" y="150" width="90" height="36" />
      <rect class="boxr" x="400" y="150" width="90" height="36" />
      <rect class="boxr" x="510" y="150" width="90" height="36" />
      <rect class="box" x="10" y="220" width="70" height="36" />
      <rect class="box" x="90" y="220" width="70" height="36" />
    </g>
    <text class="sm" x="320" y="32" text-anchor="middle">fib(4)</text>
    <text class="sm" x="170" y="102" text-anchor="middle">fib(3)</text>
    <text class="sm rd" x="470" y="102" text-anchor="middle">fib(2)</text>
    <text class="sm" x="85" y="172" text-anchor="middle">fib(2)</text>
    <text class="sm rd" x="195" y="172" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="445" y="172" text-anchor="middle">fib(1)</text>
    <text class="sm rd" x="555" y="172" text-anchor="middle">fib(0)</text>
    <text class="sm" x="45" y="242" text-anchor="middle">fib(1)</text>
    <text class="sm" x="125" y="242" text-anchor="middle">fib(0)</text>
    <path class="ln" d="M300,46 L180,80" fill="none"/>
    <path class="ln" d="M340,46 L460,80" fill="none"/>
    <path class="ln" d="M150,116 L80,150" fill="none"/>
    <path class="ln" d="M190,116 L195,150" fill="none"/>
    <path class="ln" d="M450,116 L445,150" fill="none"/>
    <path class="ln" d="M490,116 L555,150" fill="none"/>
    <path class="ln" d="M70,186 L45,220" fill="none"/>
    <path class="ln" d="M100,186 L125,220" fill="none"/>
    <text class="sm rd" x="20" y="290">Red = recomputed more than once — fib(2) is computed twice, fib(1) three times</text>
    <text class="sm" x="20" y="315">Every level doubles the calls below it → O(2ⁿ) nodes in the tree total</text>
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

<h3>Memoized Fibonacci: each distinct call runs once</h3>
<p>
  The tree above is wasteful because <code>fibSlow(2)</code> means the same
  thing wherever it appears. A call is determined by its argument, so the
  first time you compute it, write the answer down; every later request is a
  lookup. That is all memoization is: a cache keyed by the arguments.
</p>
<pre><code>function fibMemo(n, memo = new Map()) {
  if (n &lt;= 1) return n;
  if (memo.has(n)) return memo.get(n);                       <span class="c">// seen this argument: reuse the answer</span>
  const result = fibMemo(n - 1, memo) + fibMemo(n - 2, memo);
  memo.set(n, result);                                        <span class="c">// store before returning</span>
  return result;
}</code></pre>
<h4>Dry run: fibMemo(5), in the order things happen</h4>
<table>
  <tr><th>Step</th><th>Call</th><th>What happens</th><th>memo afterwards</th></tr>
  <tr><td>1</td><td>fibMemo(5), (4), (3), (2)</td><td>nothing cached yet, so each one recurses to fibMemo(n − 1) first</td><td>empty</td></tr>
  <tr><td>2</td><td>fibMemo(1), fibMemo(0)</td><td>base cases, return 1 and 0</td><td>empty</td></tr>
  <tr><td>3</td><td>fibMemo(2) resumes</td><td>1 + 0 = 1, stored</td><td>{2: 1}</td></tr>
  <tr><td>4</td><td>fibMemo(1)</td><td>the second call of fibMemo(3): base case, 1</td><td>{2: 1}</td></tr>
  <tr><td>5</td><td>fibMemo(3) resumes</td><td>1 + 1 = 2, stored</td><td>{2: 1, 3: 2}</td></tr>
  <tr><td>6</td><td>fibMemo(2)</td><td>fibMemo(4)'s second call: <b>cache hit</b>, returns 1 without recursing</td><td>{2: 1, 3: 2}</td></tr>
  <tr><td>7</td><td>fibMemo(4) resumes</td><td>2 + 1 = 3, stored</td><td>{2: 1, 3: 2, 4: 3}</td></tr>
  <tr><td>8</td><td>fibMemo(3)</td><td>fibMemo(5)'s second call: <b>cache hit</b>, returns 2</td><td>{2: 1, 3: 2, 4: 3}</td></tr>
  <tr><td>9</td><td>fibMemo(5) resumes</td><td>3 + 2 = 5, stored</td><td>{2: 1, 3: 2, 4: 3, 5: 5}</td></tr>
</table>
<p class="sub">
  That is nine calls in total for <code>fibMemo(5)</code>, against fifteen
  for <code>fibSlow(5)</code>. The gap widens fast: counting every call,
  <code>fibSlow(30)</code> makes 2,692,537 calls and <code>fibMemo(30)</code>
  makes 59. In general memoized Fibonacci makes 2n − 1 calls: each of the n − 1 arguments from 2 to n is
  <em>computed</em> once and makes two calls, plus the first call.
</p>
<p>
  The cost rule you will use from here on: <b>time = (number of distinct
  states) × (work per state)</b>. Here there are n states and each does
  O(1) work besides its calls, so O(n). Space is the n memo entries plus the
  call stack, also O(n). When the loop version of the same recurrence is
  allowed, it drops the stack entirely:
</p>
<pre><code>function fibLoop(n) {
  let prev = 0, curr = 1;                          <span class="c">// fib(0), fib(1)</span>
  for (let i = 0; i &lt; n; i++) [prev, curr] = [curr, prev + curr];
  return prev;
}</code></pre>
<div class="warn">
  <span class="ttl">⚠ Four ways a memo quietly fails</span>
  <b>The cache is recreated on every call.</b> Writing
  <code>const memo = new Map()</code> at the top of <code>fibMemo</code>,
  instead of as a parameter or outside, gives each call its own empty cache.
  The answers stay right and the time stays exponential: fib(20) still makes
  21,891 calls. <b>Truthiness checks.</b> <code>if (memo[n]) return memo[n]</code>
  treats a stored 0 as "not cached"; use <code>has</code>. <b>Depth is not
  reduced.</b> The memo cuts the time, not the nesting: in node here
  <code>fibMemo(10000)</code> still throws a <code>RangeError</code>, because
  the chain of calls from n down to 1 is n deep. <b>Number size.</b>
  JavaScript numbers hold every integer exactly only up to
  2<sup>53</sup> − 1. fib(78) = 8,944,394,323,791,464 is the last Fibonacci number that
  fits; fib(79) is 14,472,334,024,676,221 in exact arithmetic, but the
  <code>number</code> version returns 14472334024676220. Use
  <code>BigInt</code> when the problem asks for large values.
</div>

<h3>Halving the problem: fast exponentiation</h3>
<p>
  Computing x<sup>n</sup> as n − 1 multiplications is O(n), and for a
  large n that is too slow. Notice what squaring does:
  x<sup>10</sup> = (x<sup>5</sup>)<sup>2</sup>, and
  x<sup>5</sup> = x · (x<sup>2</sup>)<sup>2</sup>. In general, if you already
  have the answer for ⌊n / 2⌋, one squaring gets you the answer for n, with one
  extra factor of x when n is odd. The problem shrinks by half per call, so
  there are about log₂ n calls instead of n.
</p>
<pre><code>function power(x, n) {
  if (n === 0) return 1;                        <span class="c">// base: x⁰ = 1, even for x = 0 by convention</span>
  if (n &lt; 0) return 1 / power(x, -n);          <span class="c">// negative exponent: reciprocal of the positive one</span>
  const half = power(x, Math.floor(n / 2));     <span class="c">// ONE call, result reused</span>
  return n % 2 === 0 ? half * half : half * half * x;
}</code></pre>
<h4>Dry run: power(2, 10)</h4>
<table>
  <tr><th>Call</th><th>n</th><th>half = power(x, ⌊n / 2⌋)</th><th>Returns</th></tr>
  <tr><td>power(2, 10)</td><td>10</td><td>needs power(2, 5)</td><td>(waiting)</td></tr>
  <tr><td>power(2, 5)</td><td>5</td><td>needs power(2, 2)</td><td>(waiting)</td></tr>
  <tr><td>power(2, 2)</td><td>2</td><td>needs power(2, 1)</td><td>(waiting)</td></tr>
  <tr><td>power(2, 1)</td><td>1</td><td>needs power(2, 0)</td><td>(waiting)</td></tr>
  <tr><td>power(2, 0)</td><td>0</td><td>base case</td><td>1</td></tr>
  <tr><td>power(2, 1) resumes</td><td>1 (odd)</td><td>1</td><td>1 · 1 · 2 = 2</td></tr>
  <tr><td>power(2, 2) resumes</td><td>2 (even)</td><td>2</td><td>2 · 2 = 4</td></tr>
  <tr><td>power(2, 5) resumes</td><td>5 (odd)</td><td>4</td><td>4 · 4 · 2 = 32</td></tr>
  <tr><td>power(2, 10) resumes</td><td>10 (even)</td><td>32</td><td>32 · 32 = 1024</td></tr>
</table>
<p class="sub">
  Five calls for n = 10. The count is ⌊log₂ n⌋ + 2, which counting calls in
  node confirms for n = 10, 1,024 and 1,000,000 (5, 12 and 21 calls). Time is O(log n), and the call
  stack is the same depth, so O(log n) space. A million-fold larger exponent
  adds only about twenty calls.
</p>
<div class="warn">
  <span class="ttl">⚠ The one-character mistake that undoes the whole idea</span>
  Writing <code>power(x, n / 2) * power(x, n / 2)</code> makes <em>two</em>
  calls per level, each on half the exponent. The tree now doubles as it
  halves, so it has about n leaves and the running time is O(n), the same as
  the plain loop. For n = 1,024 the two-call version makes 4,095 calls and
  the one-call version makes 12. Always store the half in a variable. Related
  slips: use <code>Math.floor(n / 2)</code>, not <code>n / 2</code> (a
  fraction is not a valid exponent for this recursion), and note that
  <code>n &gt;&gt; 1</code> would wrap an exponent of 2<sup>31</sup> or more
  into the wrong value because bitwise operators work on 32-bit integers.
</div>
<p>
  Two practical notes. <b>Floating point:</b> the squaring order multiplies in a
  different sequence than the loop, so the last digits differ.
  <code>power(1.0001, 10000)</code> gave 2.718145926824389 while
  <code>Math.pow(1.0001, 10000)</code> gave 2.7181459268249255. Both are right to
  about twelve digits, so compare floating results with a tolerance.
  <b>Modular exponentiation</b> (find x<sup>n</sup> mod m, ubiquitous in number
  theory and hashing questions) uses the same halving, but the products grow
  past 2<sup>53</sup> in plain numbers: for m = 1,000,000,007 the square
  of m − 1 is about 10¹⁸, which a <code>number</code> cannot hold exactly. Use <code>BigInt</code>,
  and the loop form of the halving, which walks the bits of the exponent:
</p>
<pre><code>function powMod(base, exp, mod) {                 <span class="c">// all three are BigInt</span>
  let result = 1n;
  base %= mod;
  while (exp &gt; 0n) {
    if (exp &amp; 1n) result = (result * base) % mod;   <span class="c">// this bit of the exponent is set</span>
    base = (base * base) % mod;                    <span class="c">// base, base², base⁴, base⁸, ...</span>
    exp &gt;&gt;= 1n;
  }
  return result;
}
<span class="c">// powMod(2n, 1000000n, 1000000007n) → 235042059n</span></code></pre>

<h3>Choose or don't choose: generating subsets</h3>
<p>
  "All subsets" looks like it needs clever bookkeeping until you ask what a
  subset <em>is</em>: for each element, you either took it or you did not.
  That is a recursion with two calls per element, one for each choice, and a
  base case when every element has been decided. The "answer so far" is the
  array of chosen elements, carried down.
</p>
<pre><code>function subsets(nums) {
  const all = [];
  const current = [];
  function decide(i) {
    if (i === nums.length) {
      all.push([...current]);        <span class="c">// COPY: current keeps changing after this</span>
      return;
    }
    decide(i + 1);                   <span class="c">// choice 1: leave nums[i] out</span>
    current.push(nums[i]);           <span class="c">// choice 2: take it ...</span>
    decide(i + 1);
    current.pop();                   <span class="c">// ... then undo, so the caller sees current unchanged</span>
  }
  decide(0);
  return all;
}
<span class="c">// subsets([1, 2, 3]) → [[], [3], [2], [2, 3], [1], [1, 3], [1, 2], [1, 2, 3]]</span></code></pre>
<h4>Dry run: the eight leaves of subsets([1, 2, 3])</h4>
<table>
  <tr><th>Leaf</th><th>Decision for 1</th><th>Decision for 2</th><th>Decision for 3</th><th>Pushed to all</th></tr>
  <tr><td>1</td><td>out</td><td>out</td><td>out</td><td>[]</td></tr>
  <tr><td>2</td><td>out</td><td>out</td><td>in</td><td>[3]</td></tr>
  <tr><td>3</td><td>out</td><td>in</td><td>out</td><td>[2]</td></tr>
  <tr><td>4</td><td>out</td><td>in</td><td>in</td><td>[2, 3]</td></tr>
  <tr><td>5</td><td>in</td><td>out</td><td>out</td><td>[1]</td></tr>
  <tr><td>6</td><td>in</td><td>out</td><td>in</td><td>[1, 3]</td></tr>
  <tr><td>7</td><td>in</td><td>in</td><td>out</td><td>[1, 2]</td></tr>
  <tr><td>8</td><td>in</td><td>in</td><td>in</td><td>[1, 2, 3]</td></tr>
</table>
<p class="sub">
  The recursion tree has 2<sup>n</sup> leaves, one per subset, and
  2<sup>n+1</sup> − 1 calls in all (15 for n = 3). Each leaf copies up to
  n elements, so time is O(n · 2<sup>n</sup>); the stack is n + 1 deep and
  <code>current</code> holds at most n elements, so the working space is O(n)
  not counting the output. This is the template that the backtracking
  chapter develops into permutations, combinations and pruning.
</p>
<div class="warn">
  <span class="ttl">⚠ Two lines carry the entire correctness</span>
  <b>The copy.</b> Change <code>[...current]</code> to <code>current</code> and
  <code>subsets([1, 2, 3])</code> returns eight <em>empty</em> arrays: all
  eight entries are the same array, and by the time the recursion ends every
  <code>pop()</code> has emptied it. <b>The undo.</b> Without
  <code>current.pop()</code> the "in" branch leaves its element behind, and
  the "out" branch of the next level starts with a polluted array. Whenever a
  recursion carries a mutable array down, ask both questions: did I copy it
  when saving, and did I restore it when backing out?
</div>
<p>
  The same tree answers a counting question without building any list, which
  is the "return up" direction again. How many subsets sum to
  <code>target</code>? Subtract the chosen element from the target and ask
  whether the remainder reaches exactly 0 at the end:
</p>
<pre><code>function countSubsets(nums, target, i = 0) {
  if (i === nums.length) return target === 0 ? 1 : 0;   <span class="c">// all decided: did we land exactly?</span>
  return countSubsets(nums, target, i + 1)                <span class="c">// leave nums[i] out</span>
       + countSubsets(nums, target - nums[i], i + 1);     <span class="c">// take it</span>
}
<span class="c">// countSubsets([1, 2, 3], 3) → 2   ({3} and {1, 2})</span></code></pre>
<p class="sub">
  It runs in O(2<sup>n</sup>) time and, because it keeps no list, O(n) stack space. Each
  call is determined by the pair (<code>i</code>, <code>target</code>), so
  when many different paths reach the same pair, this is the repeated-subproblem
  shape from the Fibonacci section and a memo (or a table, in the dynamic
  programming chapters) collapses the exponential into a polynomial. Zeros
  and negative numbers are handled correctly because the empty remainder is only
  tested at the end; <code>nums = [0, 0]</code> with target 0 counts all four subsets.
</p>

<h3>Two classics: gcd and the Tower of Hanoi</h3>
<p>
  <b>Euclid's gcd</b> is the shortest serious recursion there is, and its
  correctness is the leap-of-faith argument in miniature. Any number that
  divides both <code>a</code> and <code>b</code> also divides
  <code>a − q·b</code> for any whole q, in particular the remainder
  <code>a % b</code>, and the reverse is true too, so
  <code>gcd(a, b) = gcd(b, a % b)</code>. The second argument strictly shrinks
  (<code>a % b &lt; b</code>), so it reaches 0, where the answer is the
  first argument.
</p>
<pre><code>function gcd(a, b) {
  if (b === 0) return a;           <span class="c">// nothing left to divide by: a is the answer</span>
  return gcd(b, a % b);
}</code></pre>
<table>
  <tr><th>Call</th><th>a</th><th>b</th><th>a % b</th><th>Next</th></tr>
  <tr><td>gcd(84, 36)</td><td>84</td><td>36</td><td>12</td><td>gcd(36, 12)</td></tr>
  <tr><td>gcd(36, 12)</td><td>36</td><td>12</td><td>0</td><td>gcd(12, 0)</td></tr>
  <tr><td>gcd(12, 0)</td><td>12</td><td>0</td><td>—</td><td>b is 0, returns 12</td></tr>
</table>
<p class="sub">
  How many calls? If b ≤ a / 2 then <code>a % b &lt; b ≤ a / 2</code>, and if b &gt; a / 2
  then <code>a % b = a − b &lt; a / 2</code>. Either way the remainder is less than half of
  <code>a</code>, so every two calls the larger argument at least halves, which gives
  O(log(min(a, b))) calls. The slowest inputs are consecutive Fibonacci
  numbers: <code>gcd(1346269, 832040)</code>, which are fib(31) and fib(30), takes 30 calls. Edge cases:
  <code>gcd(a, 0)</code> is <code>a</code>, <code>gcd(0, 0)</code> returns
  0 (undefined mathematically; decide what you want), and a negative input
  can leak out as a negative answer because <code>%</code> keeps the sign of
  its left operand: <code>gcd(4, -6)</code> returns -2. Apply
  <code>Math.abs</code> to both arguments at the entry if negatives are
  possible. For the least common multiple use <code>a / gcd(a, b) * b</code>,
  dividing first so the intermediate product stays small.
</p>
<p>
  <b>The Tower of Hanoi</b> is the classic case where thinking recursively is
  <em>much</em> easier than thinking about moves. Move n disks from peg A to peg C
  using B as a spare, one disk at a time, never putting a larger disk on a smaller one.
  Leap of faith: suppose you can already move n − 1 disks between any two pegs.
  Then move the top n − 1 to the spare peg, move the biggest disk once, and
  move the n − 1 on top of it. Nothing else is needed.
</p>
<pre><code>function hanoi(n, from, to, via, moves = []) {
  if (n === 0) return moves;                    <span class="c">// no disks: nothing to move</span>
  hanoi(n - 1, from, via, to, moves);           <span class="c">// trust: top n-1 get out of the way, onto via</span>
  moves.push([from, to]);                       <span class="c">// the largest disk moves exactly once</span>
  hanoi(n - 1, via, to, from, moves);           <span class="c">// trust: the n-1 go back on top, onto to</span>
  return moves;
}
<span class="c">// hanoi(3, "A", "C", "B") → A→C, A→B, C→B, A→C, B→A, B→C, A→C</span></code></pre>
<p class="sub">
  For n = 3 that is seven moves. A simulation that replays every move
  confirmed that each is legal and that the disks end up stacked on C for
  every n up to 10. The move count satisfies M(n) = 2 · M(n − 1) + 1 with
  M(0) = 0, so M(n) = 2<sup>n</sup> − 1. No shorter solution exists: to move the
  largest disk, the other n − 1 must be sitting on the third peg, which takes at least
  M(n − 1) moves, and after the largest disk moves, they must travel again, which takes at
  least M(n − 1) more. So the minimum is at least 2M(n − 1) + 1, the same recurrence. The recursion
  is only n + 1 deep but the work is exponential: 20 disks need 1,048,575
  moves, and 64 disks need about 1.8 × 10¹⁹. If you only need the count,
  return <code>2 ** n - 1</code> instead of storing the moves. The
  rotating roles of <code>from</code>, <code>to</code> and <code>via</code> in
  the two recursive calls are the usual place to slip.
</p>

<h3>Reading the cost off the recursion tree</h3>
<p>
  Every function in this chapter can be costed the same way. Draw the
  recursion tree, then:
</p>
<ul>
  <li><b>Time</b> = (number of calls in the tree) × (work each call does itself, not counting its recursive calls). When the work per call varies, add it up level by level.</li>
  <li><b>Stack space</b> = (depth of the tree) × (what each frame holds). Add whatever you build on the side, such as a memo or an output list.</li>
</ul>
<table>
  <tr><th>Function</th><th>Calls</th><th>Work per call</th><th>Time</th><th>Stack depth</th></tr>
  <tr><td><code>sum(arr, i)</code></td><td>n + 1</td><td>O(1)</td><td>O(n)</td><td>n + 1</td></tr>
  <tr><td><code>reverseString</code> with slice</td><td>n</td><td>O(n) copying</td><td>O(n²)</td><td>n</td></tr>
  <tr><td><code>reverseInPlace</code></td><td>about n / 2</td><td>O(1)</td><td>O(n)</td><td>about n / 2</td></tr>
  <tr><td><code>fibSlow(n)</code></td><td>2 · fib(n + 1) − 1</td><td>O(1)</td><td>O(2ⁿ) bound (grows about 1.6× per step)</td><td>n</td></tr>
  <tr><td><code>fibMemo(n)</code></td><td>2n − 1</td><td>O(1)</td><td>O(n)</td><td>n</td></tr>
  <tr><td><code>power(x, n)</code>, one call</td><td>⌊log₂ n⌋ + 2</td><td>O(1)</td><td>O(log n)</td><td>⌊log₂ n⌋ + 2</td></tr>
  <tr><td><code>power(x, n)</code>, two calls</td><td>O(n): 4,095 for n = 1,024</td><td>O(1)</td><td>O(n)</td><td>⌊log₂ n⌋ + 2</td></tr>
  <tr><td><code>subsets(nums)</code></td><td>2ⁿ⁺¹ − 1</td><td>O(1), plus an O(n) copy at each of 2ⁿ leaves</td><td>O(n · 2ⁿ)</td><td>n + 1</td></tr>
  <tr><td><code>hanoi(n, …)</code></td><td>2ⁿ⁺¹ − 1</td><td>O(1)</td><td>O(2ⁿ)</td><td>n + 1</td></tr>
  <tr><td><code>gcd(a, b)</code></td><td>at most about 2 · log₂(min(a, b)) + 3</td><td>O(1)</td><td>O(log min(a, b))</td><td>same as calls</td></tr>
</table>
<p class="sub">
  The call counts for the Fibonacci, power and subsets rows were measured by
  counting calls in node, and the Fibonacci one matches the formula
  2 · fib(n + 1) − 1 for n = 5, 10, 20 and 30 (15, 177, 21,891 and 2,692,537).
  Two reading habits pay off. First, count <em>distinct states</em> when a call is
  determined by its arguments: that is what memoization turns the call count
  into. Second, check whether "work per call" is really constant.
  <code>slice</code> and spread look like one operation and are not, which is
  the entire gap between the two reversals above. The same tree-reading
  carries over to merge sort in the next chapter, where the work per call is
  the size of the merge and the levels add up to n log n.
</p>

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

<h3>How deep is too deep? Measure it, then own the stack</h3>
<p>
  "Maximum call stack size exceeded" is not a number of calls, it is a number
  of <em>bytes</em> of stack, so a function with more parameters and local
  variables overflows sooner. You can measure your own engine in two lines:
</p>
<pre><code>let depth = 0;
function dive() { depth++; dive(); }
try { dive(); } catch (e) { console.log(depth, e.constructor.name); }</code></pre>
<p class="sub">
  On Node 24 this printed a little over 10,000 for the bare function above,
  and a little over 4,000 for a function with six parameters and four locals,
  each followed by <code>RangeError</code>.
  Browsers and other Node versions differ, so never write code that depends
  on a specific number. The practical rule: a recursion whose depth is
  proportional to the input (a linked list or skewed tree of 100,000 nodes,
  a path in a big grid) is a risk, while one whose depth is
  logarithmic (<code>power</code>, balanced trees) is not.
</p>
<p>
  When depth is the risk, move the call stack into your own array. The
  recipe is mechanical. A stack frame is just the arguments plus "where I was
  in the function", so push the arguments instead of calling, and loop until
  the stack is empty. If the function does work <em>after</em> a recursive
  call returns, that pending work becomes a frame of its own, pushed
  <em>before</em> the calls it waits on, because the last item pushed is the
  first one run. First the easy case, where the state is carried down, so a
  frame is just <code>[node, depth]</code>:
</p>
<pre><code>function treeHeightIterative(root) {
  if (root === null) return 0;
  let best = 0;
  const stack = [[root, 1]];                   <span class="c">// each frame: a node and its depth</span>
  while (stack.length) {
    const [node, depth] = stack.pop();
    best = Math.max(best, depth);
    if (node.left) stack.push([node.left, depth + 1]);
    if (node.right) stack.push([node.right, depth + 1]);
  }
  return best;
}</code></pre>
<p>
  It returns the same height as <code>treeHeight</code> on random trees, and on
  a 200,000-node chain it returns 200,000 where the recursive version throws a
  <code>RangeError</code>. The stack now lives on the heap and is limited by
  memory, not by the call-stack size. The harder case is a function with work
  <em>between</em> its calls, such as <code>hanoi</code>, where the move must
  happen after the first recursive call and before the second. Give the stack
  two kinds of frame, "solve this subproblem" and "perform this move", and push
  them in the reverse of the order they should run:
</p>
<pre><code>function hanoiIterative(n, from, to, via) {
  const moves = [];
  const stack = [{ n, from, to, via }];                              <span class="c">// a subproblem to solve</span>
  while (stack.length) {
    const f = stack.pop();
    if (f.move) { moves.push([f.from, f.to]); continue; }           <span class="c">// a pending move: perform it</span>
    if (f.n === 0) continue;
    stack.push({ n: f.n - 1, from: f.via, to: f.to, via: f.from });  <span class="c">// runs LAST (pushed first)</span>
    stack.push({ move: true, from: f.from, to: f.to });              <span class="c">// runs in the middle</span>
    stack.push({ n: f.n - 1, from: f.from, to: f.via, via: f.to });  <span class="c">// runs FIRST (pushed last)</span>
  }
  return moves;
}</code></pre>
<p class="sub">
  For every n from 0 to 12 this produces exactly the same list of moves, in the
  same order, as the recursive <code>hanoi</code>. The reversal is the part to
  rehearse: reading the three pushes top to bottom gives the <em>opposite</em>
  of the execution order, because a stack is last in, first out. Same time,
  O(n) space. A plain loop is simpler than an explicit stack when the
  recursion is a single chain, as in <code>factorialIter</code> and
  <code>fibLoop</code>. Reach for the explicit stack when the recursion
  branches.
</p>

<h3>The mistakes that cost points</h3>
<table>
  <tr><th>Mistake</th><th>What you see</th><th>Fix</th></tr>
  <tr><td>Missing or too-narrow base case (<code>lo === hi</code> instead of <code>lo &gt;= hi</code>)</td><td><code>RangeError</code> on some inputs only, often the empty or even-length one</td><td>List every smallest input; test sizes 0, 1, 2</td></tr>
  <tr><td>Recursive call does not shrink the input</td><td><code>RangeError</code> on every input</td><td>State in a sentence what gets smaller each call</td></tr>
  <tr><td>Slicing or spreading a copy per call</td><td>Correct but O(n²) time and memory</td><td>Pass indices or boundaries</td></tr>
  <tr><td>Two recursive calls where one would do (<code>power</code>)</td><td>Correct but exponential or linear when it should be logarithmic</td><td>Store the shared result in a variable</td></tr>
  <tr><td>Saving a shared array without copying, or forgetting to undo a push</td><td>Results all identical, or polluted</td><td>Push <code>[...current]</code>; pair every push with a pop</td></tr>
  <tr><td>Memo recreated per call, or checked by truthiness</td><td>Still exponential, or cached zeros recomputed</td><td>Pass the memo down or declare it outside; use <code>has</code></td></tr>
  <tr><td>Treating <code>null</code> as a container (<code>typeof null</code> is <code>"object"</code>)</td><td><code>TypeError</code> on <code>Object.values(null)</code></td><td>Check <code>value === null</code> before looking inside</td></tr>
  <tr><td>Module-level accumulator reused across calls</td><td>Second call returns a stale or inflated answer</td><td>Declare the accumulator inside the wrapper function</td></tr>
</table>

<h3>Recognizing it in an unseen problem</h3>
<ul>
  <li>The structure itself is recursive — trees, nested lists, nested objects</li>
  <li>The problem can be restated as "solve it for a smaller version, then combine"</li>
  <li>Words like "all combinations," "all paths," "every way to" — usually backtracking, built on this same base/recursive-case shape</li>
  <li>If the same sub-inputs repeat across branches, that's your cue to add memoization rather than leaving it as plain recursion</li>
  <li>"For each item, take it or leave it" is a two-call recursion over the items, and the number of calls is the first thing to estimate (2ⁿ here)</li>
  <li>The input is cut in half each call and only one half is used (exponent, search range): expect O(log n) calls, and check you are making one call, not two</li>
  <li>The answer depends on the route taken to reach a node (depth, running total, path): carry that state down as a parameter; if it is built from the children's answers, return it up</li>
  <li>The prompt gives a depth that would overflow the stack, or asks you to "do it without recursion": use a loop for a chain, an explicit stack for a branching recursion</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>State the base case and recursive case for a new problem before writing any code, and explain why the recursive case must shrink the input every call.</li>
    <li>Trace <code>factorial(4)</code> (or a similar small call) by hand, showing which calls are still "waiting" when the base case is hit.</li>
    <li>Explain why n nested recursive calls cost O(n) space, even with no array ever allocated.</li>
    <li>Explain why <code>fibSlow(n)</code> is O(2ⁿ) by naming a subproblem it computes more than once.</li>
    <li>Given a new problem, recognize when it's "restate on a smaller input, then combine" (recursion) versus needing memoization because subproblems repeat.</li>
    <li>Write a base case by listing every smallest input (sizes 0, 1 and 2), and explain why <code>lo &gt;= hi</code> is safer than <code>lo === hi</code>.</li>
    <li>Say what <code>reverseString</code> with <code>slice</code> costs and rewrite it with indices; explain why <code>power(x, n / 2) * power(x, n / 2)</code> loses the speedup.</li>
    <li>Write <code>subsets</code> from memory and name the two lines (the copy and the undo) that its correctness hangs on.</li>
    <li>Read the time and stack cost of a recursion off its tree: number of calls times work per call, and depth times frame size.</li>
    <li>Convert a branching recursion to an explicit stack, pushing pending work in the reverse of its execution order.</li>
  </ul>
</div>`,
};
