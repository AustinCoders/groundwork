import type { Chapter } from "../types";

export const dsaJsToolkit: Chapter = {
  id: "dsa-js-toolkit",
  num: "B2",
  title: "The JavaScript toolkit for DSA",
  short: "JavaScript toolkit",
  levels: ["beginner"],
  prerequisites: ["dsa-complexity-analysis"],
  practice: [
    "ex-js-make-grid",
    "ex-js-rank-players",
    "ex-js-sort-versions",
    "ex-js-word-counts",
    "ex-js-distinct-cells",
    "ex-js-floor-div-mod",
    "ex-js-multiply-mod",
    "ex-js-factorial-string",
    "ex-js-bit-mask",
    "ex-js-reachable-nodes",
    "ex-sort-by-frequency",
    "ex-hamming-weight",
    "ex-js-heap-class",
    "ex-js-deque-class",
    "ex-js-sorted-list-class",
    "ex-last-stone-weight",
  ],
  ready: true,
  subtitle:
    "A correct algorithm can still fail in JavaScript: a slow shift, a sort that puts 10 before 2, a product that loses digits, a stack that runs out. This is the reference for all of it.",
  body: `<h3>Why a language chapter in a DSA course</h3>
<p>
  Most interview bugs in JavaScript are not algorithm bugs. The idea on the
  whiteboard is right, and the code still fails, because a queue was built on
  <code>shift()</code> and quietly became O(n²), because <code>sort()</code>
  with no comparator puts 10 before 2, because a modular product lost its low
  digits, or because a recursion that is fine on paper throws
  <code>RangeError</code> at depth ten thousand. On top of that, three
  structures that other languages ship in their standard library are missing
  here: a heap, a deque and an ordered set. In an interview you build them
  yourself, so you need to be able to write each one from memory.
</p>
<p>
  This chapter is the reference the later chapters send you back to. Stacks and
  queues, linked lists, hashing, heaps, graphs and dynamic programming all lean
  on something in it. Read it once straight through, then come back to a single
  section when a later chapter points at it.
</p>
<p>
  <b>How the claims in this chapter were checked.</b> Every line that ends in a
  comment of the form <code>// → value</code> shows what Node 24.14.1 printed for
  that expression; each one was run, not recalled. Two kinds of statement are
  kept apart. Some are guaranteed by the language specification: a stable sort,
  insertion order in <code>Map</code>, how equality works for keys, the 32-bit
  window of the bit operators. Others are about speed, which the specification
  does not promise and an engine may improve. For those, the chapter says how
  the cost is described by the algorithm, shows a measurement, and tells you
  what to say in an interview. Timings come from one laptop: the milliseconds
  will differ on yours, but the <em>ratios</em> between rows are what to look
  at.
</p>

<h3>Array operations and what they really cost</h3>
<p>
  An array is a numbered row of slots. Reading or writing slot
  <code>i</code> does not depend on how long the row is, so it is O(1). Adding
  or removing at the <em>end</em> touches one slot, so <code>push</code> and
  <code>pop</code> are O(1) (amortized, as the complexity chapter showed).
  Anything that changes the position of elements, or builds a new row, has to
  touch every slot involved, and that is where the cost hides.
</p>
<table>
  <tr><th>Operation</th><th>Cost</th><th>What it does to the slots</th></tr>
  <tr><td><code>a[i]</code>, <code>a.at(i)</code>, <code>a.length</code></td><td>O(1)</td><td>reads one slot</td></tr>
  <tr><td><code>push</code>, <code>pop</code></td><td>O(1) amortized</td><td>touches the last slot only</td></tr>
  <tr><td><code>shift</code>, <code>unshift</code></td><td>O(n)</td><td>every other element moves one place</td></tr>
  <tr><td><code>splice(i, del, ...items)</code></td><td>O(n)</td><td>elements after <code>i</code> move</td></tr>
  <tr><td><code>slice</code>, <code>concat</code>, <code>[...a]</code>, <code>Array.from(a)</code></td><td>O(n)</td><td>builds a new array of the copied part</td></tr>
  <tr><td><code>indexOf</code>, <code>includes</code>, <code>find</code>, <code>some</code>, <code>every</code></td><td>O(n)</td><td>walks until it finds an answer</td></tr>
  <tr><td><code>map</code>, <code>filter</code>, <code>forEach</code>, <code>reduce</code>, <code>fill</code></td><td>O(n) calls</td><td>one pass; the callback's own cost multiplies</td></tr>
  <tr><td><code>reverse</code></td><td>O(n)</td><td>swaps in place</td></tr>
  <tr><td><code>join</code></td><td>O(total length)</td><td>writes every piece into one string</td></tr>
  <tr><td><code>sort</code></td><td>O(n log n) comparisons</td><td>in place; each comparison costs what your comparator costs</td></tr>
  <tr><td><code>Math.max(...a)</code></td><td>O(n), but capped</td><td>the array becomes call arguments (see below)</td></tr>
</table>
<p class="sub">
  A row of this table is a statement about what the method has to do, not a
  promise about the engine. Engines are free to be faster than the description,
  and the measurements below show where being slower than you hoped still
  bites.
</p>

<h4>The queue built on shift() is quadratic</h4>
<p>
  Dequeue from the front of an array with <code>shift()</code> and the language
  moves every remaining element down one place, which is n moves for an array of
  length n. Draining n items that way costs about n²/2 moves in total. Here is
  that loop, timed for growing n, next to a loop that only moves a read index:
</p>
<pre><code>const a = Array.from({ length: 100000 }, (_, i) =&gt; i);
const start = performance.now();
while (a.length &gt; 0) a.shift();
const ms = performance.now() - start;</code></pre>
<table>
  <tr><th>n</th><th><code>shift()</code> until empty</th><th>read index only</th><th><code>unshift</code> n times</th></tr>
  <tr><td>10,000</td><td>1.8 ms</td><td>0.2 ms</td><td>25 ms</td></tr>
  <tr><td>50,000</td><td>265 ms</td><td>0.1 ms</td><td>835 ms</td></tr>
  <tr><td>100,000</td><td>1,065 ms</td><td>0.5 ms</td><td>3,409 ms</td></tr>
  <tr><td>200,000</td><td>4,507 ms</td><td>0.3 ms</td><td>14,989 ms</td></tr>
</table>
<p class="sub">
  Each doubling of n multiplies the time by about four or more. That is the
  signature of a quadratic loop, and it is why the first row is the dangerous
  one: at 10,000 elements the same code finishes in 2 ms and passes every small
  test. The fix is in the next section.
</p>
<div class="warn">
  <span class="ttl">⚠ shift, unshift and splice(0, ...) are O(n), whatever they look like</span>
  A call that reads as one step is a loop in disguise. If it sits inside a loop
  over the input, the program is O(n²). The same goes for
  <code>acc = acc.concat(x)</code> and <code>acc = [...acc, x]</code> inside a
  loop: each call copies everything gathered so far.
</div>

<h4>Copies in a recursion do the same damage</h4>
<p>
  Backtracking code often writes <code>recurse([...path, x])</code> because
  it avoids undoing the change. That copy is O(length of path) at every call.
  Building a list of n items by repeated copying is n²/2 element copies:
</p>
<table>
  <tr><th>n</th><th><code>p = [...p, i]</code> n times</th><th><code>p.push(i)</code> n times</th></tr>
  <tr><td>2,000</td><td>3.3 ms</td><td>0.11 ms</td></tr>
  <tr><td>4,000</td><td>9.8 ms</td><td>0.05 ms</td></tr>
  <tr><td>8,000</td><td>33 ms</td><td>0.05 ms</td></tr>
</table>
<p>
  The habit that avoids it: change the one shared array with
  <code>push</code>, recurse, then undo with <code>pop</code>. Copy only at the
  moment you record an answer (<code>results.push([...path])</code>), because
  that copy is the size of the output and cannot be avoided.
</p>

<h4>Methods that change the array and methods that return a new one</h4>
<p>
  <code>sort</code>, <code>reverse</code>, <code>splice</code>,
  <code>fill</code> and <code>push</code>/<code>pop</code>/<code>shift</code> change
  the array they are called on. <code>slice</code>, <code>concat</code>,
  <code>map</code>, <code>filter</code> and the spread syntax return a new one.
  <code>sort</code> in particular also <em>returns the same array</em>, which
  surprises people who write <code>const sorted = a.sort()</code> and then find
  that <code>a</code> changed.
</p>
<pre><code>const original = [3, 1, 2];
const sorted = original.sort();
sorted === original; <span class="c">// → true</span>
original; <span class="c">// → [ 1, 2, 3 ]</span>
[...[3, 1, 2]].sort(); <span class="c">// → [ 1, 2, 3 ]</span>
[3, 1, 2].toSorted(); <span class="c">// → [ 1, 2, 3 ]</span>
[3, 1, 2].toReversed(); <span class="c">// → [ 2, 1, 3 ]</span>
[3, 1, 2].with(0, 9); <span class="c">// → [ 9, 1, 2 ]</span></code></pre>
<p class="sub">
  <code>toSorted</code>, <code>toReversed</code>, <code>toSpliced</code> and
  <code>with</code> exist in Node 24, as the output shows. They are newer than
  the older methods, so check what the interview editor runs before leaning on
  them, and know the portable form: copy first with
  <code>[...a]</code> or <code>a.slice()</code>, then change the copy.
</p>

<h3>The queue without shift: a head index</h3>
<p>
  A queue needs two things: add at the back, take from the front. Adding at the
  back is <code>push</code>. For the front, the array does not have to
  <em>delete</em> anything. It only has to remember where the front is. Keep a
  number <code>head</code> that points at the next item to take; "dequeue" is
  reading <code>queue[head]</code> and adding one to <code>head</code>. Nothing
  moves, so each step is O(1).
</p>
<p>
  Breadth-first search is the standard use. Each node enters the queue once, so
  the array never grows past the number of nodes, and the consumed prefix is
  harmless garbage you do not need to free.
</p>
<pre><code>function bfsDistances(n, edges, start) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }

  const dist = new Array(n).fill(-1);
  const queue = [start];
  dist[start] = 0;

  for (let head = 0; head &lt; queue.length; head++) {
    <span class="c">// queue.length is re-read each time, so pushes inside the loop are seen</span>
    const node = queue[head];
    for (const next of adj[node]) {
      if (dist[next] === -1) {
        dist[next] = dist[node] + 1;
        queue.push(next);
      }
    }
  }
  return dist;
}

bfsDistances(6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0); <span class="c">// → [ 0, 1, 1, 2, 3, -1 ]</span></code></pre>
<h4>Dry run: the graph 0-1, 0-2, 1-3, 2-3, 3-4, start 0, node 5 isolated</h4>
<table>
  <tr><th>head</th><th>node taken</th><th>neighbours</th><th>new distances</th><th>queue afterwards</th></tr>
  <tr><td>0</td><td>0</td><td>1, 2</td><td>dist[1] = 1, dist[2] = 1</td><td>[0, 1, 2]</td></tr>
  <tr><td>1</td><td>1</td><td>0, 3</td><td>dist[3] = 2 (0 already has one)</td><td>[0, 1, 2, 3]</td></tr>
  <tr><td>2</td><td>2</td><td>0, 3</td><td>none, both have distances</td><td>[0, 1, 2, 3]</td></tr>
  <tr><td>3</td><td>3</td><td>1, 2, 4</td><td>dist[4] = 3</td><td>[0, 1, 2, 3, 4]</td></tr>
  <tr><td>4</td><td>4</td><td>3</td><td>none</td><td>[0, 1, 2, 3, 4]</td></tr>
</table>
<p class="sub">
  The loop ends when <code>head</code> reaches 5, the queue's length. Node 5 was
  never reached, so its distance stays -1. Setting <code>dist[next]</code>
  at the moment of <em>pushing</em>, not when taking, is what stops a node from
  entering the queue twice. The graph chapters build on exactly this loop.
</p>
<p>
  If you want the <code>push</code> and <code>shift</code> vocabulary without the
  O(n) cost, wrap the head index in a small class. One refinement keeps memory
  from growing forever on a long-running queue: when the consumed prefix is at
  least half the array, cut it off with <code>slice</code>.
</p>
<pre><code>class Queue {
  #items = [];
  #head = 0;

  get size() {
    return this.#items.length - this.#head;
  }

  push(x) {
    this.#items.push(x);
  }

  peek() {
    return this.#items[this.#head];
  }

  shift() {
    if (this.size === 0) return undefined;
    const x = this.#items[this.#head];
    this.#items[this.#head] = undefined;
    this.#head++;
    if (this.#head * 2 &gt;= this.#items.length) {
      this.#items = this.#items.slice(this.#head);
      this.#head = 0;
    }
    return x;
  }
}</code></pre>
<pre><code>const q = new Queue();
q.push("a");
q.push("b");
q.shift(); <span class="c">// → 'a'</span>
q.size; <span class="c">// → 1</span>
q.shift(); <span class="c">// → 'b'</span>
q.shift(); <span class="c">// → undefined</span></code></pre>
<p class="sub">
  Why the slice does not break the O(1) bound: it runs only when the consumed
  prefix is at least as long as what remains, so it copies at most as many
  elements as there have been shifts since the last cut. Each shift pays for
  one element of a later copy, which is the same amortized argument as the
  dynamic array. The class was run against a plain-array model on thousands of
  random push, shift and peek sequences. The two-stack queue in the stacks and
  queues chapter is the alternative when you cannot index into an array.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "I won't use <code>shift()</code>
  for the queue, because it moves every remaining element, so n dequeues cost
  O(n²). I'll push to the array and walk a head index forward. Each node is
  pushed once, so the array is at most n long and every step is O(1)."
</div>

<h3>Copies, references and holes</h3>
<p>
  Arrays are objects, and a variable holds a reference to one. Two variables can
  name the same array, and a "copy" is often a second reference or a copy of
  only the outer layer. Four mistakes come from this, and they all pass a
  one-element test.
</p>
<pre><code>new Array(3); <span class="c">// → [ &lt;3 empty items&gt; ]</span>
new Array(3).map(() =&gt; 1); <span class="c">// → [ &lt;3 empty items&gt; ]</span>
new Array(3).fill(0); <span class="c">// → [ 0, 0, 0 ]</span>
Array.from({ length: 3 }, (_, i) =&gt; i * 2); <span class="c">// → [ 0, 2, 4 ]</span></code></pre>
<p>
  <code>new Array(3)</code> makes three <em>holes</em>: slots that have never
  been assigned. <code>map</code>, <code>forEach</code> and
  <code>filter</code> skip holes, which is why the second line returns holes
  again. <code>fill</code> and <code>Array.from</code> make real elements.
</p>
<pre><code>const shared = new Array(2).fill([]);
shared[0].push(1);
shared; <span class="c">// → [ [ 1 ], [ 1 ] ]</span>

const separate = Array.from({ length: 2 }, () =&gt; []);
separate[0].push(1);
separate; <span class="c">// → [ [ 1 ], [] ]</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ fill([]) fills with one array, not many</span>
  <code>fill</code> evaluates its argument once and puts the same reference in
  every slot. For a grid, build each row separately:
  <code>Array.from({ length: rows }, () =&gt; new Array(cols).fill(0))</code>.
  Filling with a number, string or boolean is safe because those are copied by
  value.
</div>
<pre><code>const grid = [[1, 2], [3, 4]];
const outerCopy = [...grid];
outerCopy[0][0] = 99;
grid; <span class="c">// → [ [ 99, 2 ], [ 3, 4 ] ]</span>

const base = [[1, 2], [3, 4]];
const safe = base.map((row) =&gt; [...row]);
safe[0][0] = 99;
base; <span class="c">// → [ [ 1, 2 ], [ 3, 4 ] ]</span></code></pre>
<p class="sub">
  Spread, <code>slice</code> and <code>concat</code> copy one level. For a 2D
  array, copy each row. <code>structuredClone(grid)</code> copies every level
  and also works, at a higher cost than mapping the rows.
</p>
<p>A few smaller behaviours that decide whether a loop is correct:</p>
<pre><code>[1, 2, 3][-1]; <span class="c">// → undefined</span>
[1, 2, 3].at(-1); <span class="c">// → 3</span>
[1, 2] === [1, 2]; <span class="c">// → false</span>
const sparse = [1];
sparse[5] = 1;
sparse; <span class="c">// → [ 1, &lt;4 empty items&gt;, 1 ]</span>
Math.max(...new Array(100000).fill(1)); <span class="c">// → 1</span>
Math.max(...new Array(1000000).fill(1)); <span class="c">// → RangeError: Maximum call stack size exceeded</span>
new Array(-1); <span class="c">// → RangeError: Invalid array length</span></code></pre>
<ul>
  <li><b>Negative indexes</b> are not an error: <code>a[-1]</code> is
    <code>undefined</code>. Use <code>at(-1)</code> for the last element.</li>
  <li><b>Equality of arrays</b> is identity. Two arrays with the same contents
    are not <code>===</code>. Compare element by element, or compare a joined
    string.</li>
  <li><b>Writing past the end</b> leaves holes, and the length jumps. A loop
    that does <code>a[i] = x</code> with a skipped <code>i</code> produces
    holes that <code>map</code> then ignores.</li>
  <li><b>Spreading a long array into a call</b> turns every element into an
    argument. 100,000 worked here and 1,000,000 threw, so use a loop for a
    maximum over a large input. The same limit applies to
    <code>push(...big)</code>.</li>
  <li><b><code>a.length = 0</code></b> empties the array that everyone holding a
    reference sees. Assigning <code>a = []</code> only changes your variable.</li>
</ul>

<h3>Sorting: the default comparator, comparators and stability</h3>
<p>
  <code>sort()</code> with no argument converts every element to a string and
  compares the strings by their UTF-16 code units. That is correct for words of
  one case and wrong for numbers.
</p>
<pre><code>[10, 2, 1].sort(); <span class="c">// → [ 1, 10, 2 ]</span>
[-1, -2, 3, 10, 9].sort(); <span class="c">// → [ -1, -2, 10, 3, 9 ]</span>
[[10, 1], [9, 2]].sort(); <span class="c">// → [ [ 10, 1 ], [ 9, 2 ] ]</span>
[10, 2, 1].sort((a, b) =&gt; a - b); <span class="c">// → [ 1, 2, 10 ]</span>
[10, 2, 1].sort((a, b) =&gt; b - a); <span class="c">// → [ 10, 2, 1 ]</span></code></pre>
<p>
  The comparator receives two elements and answers with a number. Negative
  means <em>the first goes before the second</em>, positive means the second
  goes first, and zero means they are equal for this sort. For two finite
  numbers <code>a - b</code> has exactly the right sign, so it is a correct
  ascending comparator and <code>b - a</code> a correct descending one. It is
  not correct for anything else:
</p>
<pre><code>[3, 1, 2].sort((a, b) =&gt; a &gt; b); <span class="c">// → [ 3, 1, 2 ]</span>
['b', 'a', 'C'].sort((a, b) =&gt; a - b); <span class="c">// → [ 'b', 'a', 'C' ]</span>
[3n, 1n, 2n].sort((a, b) =&gt; a - b); <span class="c">// → TypeError: Cannot convert a BigInt value to a number</span>
[3n, 1n, 2n, 10n].sort((a, b) =&gt; (a &lt; b ? -1 : a &gt; b ? 1 : 0)); <span class="c">// → [ 1n, 2n, 3n, 10n ]</span>
[3, undefined, 1, 2].sort((a, b) =&gt; b - a); <span class="c">// → [ 3, 2, 1, undefined ]</span></code></pre>
<ul>
  <li>A comparator that returns <b>a boolean</b> never says "negative", because
    <code>false</code> becomes 0 and <code>true</code> becomes 1. The array
    comes back unchanged. Return a number.</li>
  <li><b>Subtracting strings</b> gives <code>NaN</code>, which counts as "equal",
    so nothing moves. Compare strings with
    <code>a &lt; b ? -1 : a &gt; b ? 1 : 0</code>.</li>
  <li><b>BigInts</b> cannot be subtracted into a number for the comparator, so
    use the three-way comparison from the line after it.</li>
  <li><b><code>undefined</code> always sorts to the end</b> and the comparator is
    never called for it.</li>
  <li>The default order of <b>arrays of arrays</b> compares their string form, so
    <code>[10, 1]</code> comes before <code>[9, 2]</code>. For intervals use
    <code>(a, b) =&gt; a[0] - b[0] || a[1] - b[1]</code>.</li>
</ul>
<h4>Two orders for strings</h4>
<pre><code>['b', 'B', 'a', 'A', 'é'].sort(); <span class="c">// → [ 'A', 'B', 'a', 'b', 'é' ]</span>
['b', 'B', 'a', 'A', 'é'].sort((x, y) =&gt; x.localeCompare(y)); <span class="c">// → [ 'a', 'A', 'b', 'B', 'é' ]</span></code></pre>
<p class="sub">
  The default and the three-way comparison use code unit order, where every
  capital letter comes before every lowercase one. <code>localeCompare</code>
  follows the locale's dictionary order. Problems that ask for the
  "lexicographically smallest" string mean code unit order, which is what
  <code>&lt;</code> gives you.
</p>
<h4>Stability</h4>
<p>
  Since ES2019 the language guarantees that <code>sort</code> is <b>stable</b>:
  elements that compare as equal keep the order they had in the input. That is
  what makes multi-key sorting work. Here the records are sorted by score only,
  and the names within one score stay in input order:
</p>
<pre><code>const records = [
  { name: "a", score: 2 },
  { name: "b", score: 1 },
  { name: "c", score: 2 },
  { name: "d", score: 1 },
  { name: "e", score: 2 },
];
records.sort((x, y) =&gt; x.score - y.score).map((r) =&gt; r.name).join(""); <span class="c">// → 'bdace'</span>
[{ n: "b", s: 2 }, { n: "a", s: 2 }, { n: "c", s: 3 }]
  .sort((x, y) =&gt; y.s - x.s || x.n.localeCompare(y.n))
  .map((r) =&gt; r.n); <span class="c">// → [ 'c', 'a', 'b' ]</span></code></pre>
<p class="sub">
  The second sort shows the single-comparator way to use two keys:
  <code>first || second</code>, because a difference of zero is falsy and falls
  through to the next key. Cost: O(n log n) comparisons, and each comparison
  costs what your function does. Sorting n strings of length L is O(L · n log
  n), not O(n log n).
</p>

<h3>Strings: immutable, UTF-16, and building one</h3>
<p>
  A string cannot be changed in place. Assigning to an index does not edit it.
  In sloppy-mode code the assignment is ignored without a word, and in strict
  code (every module, and the practice runner on this site) it throws:
</p>
<pre><code>"use strict";
let s = "abc";
s[0] = "x"; <span class="c">// → TypeError: Cannot assign to read only property '0' of string 'abc'</span></code></pre>
<p>
  To "change" a character, make an array of characters, change the array and
  join it back, or build the result from slices. Both are O(n), so an
  edit-one-character loop over a string is O(n²).
</p>
<h4>Length counts UTF-16 code units</h4>
<pre><code>"a😀b".length; <span class="c">// → 4</span>
[..."a😀b"].length; <span class="c">// → 3</span>
"a😀b".split("").length; <span class="c">// → 4</span>
"😀".codePointAt(0); <span class="c">// → 128512</span>
"😀".charCodeAt(0); <span class="c">// → 55357</span>
"abc".charCodeAt(5); <span class="c">// → NaN</span>
"abc"[5]; <span class="c">// → undefined</span></code></pre>
<p class="sub">
  A character outside the basic range takes two code units.
  <code>length</code>, indexing, <code>charCodeAt</code> and <code>split("")</code>
  count code units and can cut such a character in half. Spread,
  <code>Array.from</code> and <code>for...of</code> walk code points. Interview
  strings are almost always lowercase letters, where the two agree. When a
  problem mentions emoji or "any Unicode text", switch to the code point forms.
</p>
<h4>Characters as numbers</h4>
<pre><code>"a".charCodeAt(0); <span class="c">// → 97</span>
"c".charCodeAt(0) - "a".charCodeAt(0); <span class="c">// → 2</span>
String.fromCharCode(97 + 2); <span class="c">// → 'c'</span>
"10" &lt; "9"; <span class="c">// → true</span>
"Zebra" &lt; "apple"; <span class="c">// → true</span>
"5" + 1; <span class="c">// → '51'</span>
"5" - 1; <span class="c">// → 4</span></code></pre>
<p>
  The first three lines are the letter-to-index idiom behind every
  26-slot counting array. Comparing strings with <code>&lt;</code> compares
  character by character, so a string of digits is not compared as a number. The
  last two lines are the other way <code>+</code> bites: with a string on either
  side it concatenates, and every other arithmetic operator converts to a
  number.
</p>
<h4>Parsing</h4>
<pre><code>parseInt("08"); <span class="c">// → 8</span>
parseInt("12px"); <span class="c">// → 12</span>
Number("12px"); <span class="c">// → NaN</span>
Number(""); <span class="c">// → 0</span>
["1", "2", "3"].map(parseInt); <span class="c">// → [ 1, NaN, NaN ]</span>
["1", "2", "3"].map(Number); <span class="c">// → [ 1, 2, 3 ]</span></code></pre>
<p class="sub">
  <code>map</code> passes three arguments, and <code>parseInt</code> reads the
  second as the radix, so the second element is parsed in base 1 and the third
  in base 2. Pass <code>Number</code>, or write <code>(x) =&gt; parseInt(x, 10)</code>.
  An empty string becomes 0, not <code>NaN</code>, so check for it yourself when
  it matters.
</p>
<h4>Building a string</h4>
<p>
  In the model, <code>s += piece</code> creates a new string holding a copy of
  everything so far, which would make a loop of n appends O(n²), the same shape
  as the array copies above. Node 24 does better in practice: a loop of
  1,000,000 single-character appends took 52 ms with <code>+=</code> and 14 ms
  with an array of pieces and one <code>join</code>, with no quadratic growth
  visible. So in JavaScript, <code>+=</code> in a loop is not the disaster it is
  elsewhere. The habit is still cheap and portable: push the pieces into an
  array and call <code>join("")</code> once. For interview analysis, say that
  the join is O(total length).
</p>
<pre><code>"hello".slice(-3); <span class="c">// → 'llo'</span>
"hello".substring(-3); <span class="c">// → 'hello'</span>
"hello".slice(1, -1); <span class="c">// → 'ell'</span>
"a-b-c".replace("-", "+"); <span class="c">// → 'a+b-c'</span>
"a-b-c".replaceAll("-", "+"); <span class="c">// → 'a+b+c'</span>
[..."hello"].reverse().join(""); <span class="c">// → 'olleh'</span></code></pre>
<p class="sub">
  <code>slice</code> accepts negative positions counted from the end.
  <code>substring</code> treats negatives as 0 and swaps its arguments if they
  are the wrong way round, so prefer <code>slice</code>. Treat
  <code>slice</code> as O(length of the piece), and
  <code>indexOf</code> or <code>includes</code> for a substring as at least
  O(n), with O(n · m) as the safe upper budget.
</p>

<h3>Map and Set: equality, order and composite keys</h3>
<p>
  <code>Map</code> and <code>Set</code> decide whether two keys are "the same"
  with an operation the specification calls SameValueZero. It is
  <code>===</code>, except that <code>NaN</code> equals itself and
  <code>+0</code> equals <code>-0</code>. Anything that is an object, including
  every array, is the same key only as itself.
</p>
<table>
  <tr><th>Question</th><th>Result</th><th>Output</th></tr>
  <tr><td>Is <code>NaN</code> found again?</td><td>yes</td><td><code>new Map([[NaN, "a"]]).get(NaN)</code> is <code>'a'</code></td></tr>
  <tr><td>Is <code>-0</code> the same key as <code>0</code>?</td><td>yes, stored as <code>0</code></td><td><code>new Map([[-0, "a"]]).get(0)</code> is <code>'a'</code></td></tr>
  <tr><td>Are <code>1</code> and <code>"1"</code> one key?</td><td>no</td><td>a <code>Set</code> of both has size 2</td></tr>
  <tr><td>Are <code>1</code> and <code>1n</code> one key?</td><td>no</td><td>a <code>Set</code> of both has size 2</td></tr>
  <tr><td>Are <code>[1, 2]</code> and another <code>[1, 2]</code> one key?</td><td>no, different objects</td><td>a <code>Set</code> of both has size 2</td></tr>
</table>
<pre><code>new Map([[NaN, "a"]]).get(NaN); <span class="c">// → 'a'</span>
[...new Map([[-0, "a"]]).keys()]; <span class="c">// → [ 0 ]</span>
new Set([1, "1"]).size; <span class="c">// → 2</span>
new Set([1, 1n]).size; <span class="c">// → 2</span>
new Set([[1, 2], [1, 2]]).size; <span class="c">// → 2</span>
new Map([[[1, 2], "x"]]).get([1, 2]); <span class="c">// → undefined</span>
new Set("hello").size; <span class="c">// → 4</span></code></pre>
<h4>Composite keys: pairs, coordinates, states</h4>
<p>
  Because an array key is compared by identity, a visited set of
  <code>[row, col]</code> pairs does not work. Turn the pair into one primitive.
  There are three honest ways, with different limits:
</p>
<table>
  <tr><th>Key</th><th>Looks like</th><th>Limits</th></tr>
  <tr><td>A string with a delimiter</td><td><code>\`\${r},\${c}\`</code></td><td>works for any integers, including negatives; allocates a string per lookup</td></tr>
  <tr><td>One number</td><td><code>r * cols + c</code></td><td>needs <code>0 &lt;= c &lt; cols</code>; shift negative values first; must stay below 2<sup>53</sup></td></tr>
  <tr><td>A nested map</td><td><code>rows.get(r)?.has(c)</code></td><td>no key building, but two lookups and more code</td></tr>
</table>
<pre><code>const a = [1, 23];
const b = [12, 3];
\`\${a[0]}\${a[1]}\` === \`\${b[0]}\${b[1]}\`; <span class="c">// → true</span>
\`\${a[0]},\${a[1]}\` === \`\${b[0]},\${b[1]}\`; <span class="c">// → false</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Glue without a delimiter collides</span>
  <code>(1, 23)</code> and <code>(12, 3)</code> both become the string
  <code>"123"</code>. The comma is not decoration. With the numeric form
  <code>r * cols + c</code>, a wrong <code>cols</code> or a column outside
  <code>0..cols-1</code> collides the same way.
</div>
<h4>Order, and what it gives you for free</h4>
<p>
  Iteration order is <b>insertion order</b>, guaranteed. Setting a key that
  already exists keeps its position. Deleting a key and setting it again moves
  it to the end. That small rule is the whole of an LRU cache: on every access,
  delete and re-set the key, and the oldest key is always the first one.
</p>
<pre><code>const m = new Map([["a", 1], ["b", 2], ["c", 3]]);
m.set("a", 9);
[...m.keys()]; <span class="c">// → [ 'a', 'b', 'c' ]</span>
m.delete("a");
m.set("a", 9);
[...m.keys()]; <span class="c">// → [ 'b', 'c', 'a' ]</span>
m.keys().next().value; <span class="c">// → 'b'</span></code></pre>
<pre><code>class LRUCache {
  #map = new Map();
  #capacity;

  constructor(capacity) {
    this.#capacity = capacity;
  }

  get(key) {
    if (!this.#map.has(key)) return -1;
    const value = this.#map.get(key);
    this.#map.delete(key);
    this.#map.set(key, value);
    return value;
  }

  put(key, value) {
    this.#map.delete(key);
    this.#map.set(key, value);
    if (this.#map.size &gt; this.#capacity) {
      this.#map.delete(this.#map.keys().next().value);
    }
  }
}

const cache = new LRUCache(2);
cache.put(1, 10);
cache.put(2, 20);
cache.get(1); <span class="c">// → 10</span>
cache.put(3, 30);
cache.get(2); <span class="c">// → -1</span>
cache.get(3); <span class="c">// → 30</span></code></pre>
<p class="sub">
  Every operation is a handful of O(1) map operations. The class was checked
  against a list-based model on random sequences. Note the <code>has</code> call
  in <code>get</code>: a stored value of 0 or <code>undefined</code> must not be
  confused with a missing key.
</p>
<h4>Plain objects as maps: the traps</h4>
<p>
  An object works as a counter until a key collides with something every object
  already has, or with how objects order their keys.
</p>
<pre><code>const counts = {};
const word = "constructor";
counts[word] = (counts[word] || 0) + 1;
counts[word]; <span class="c">// → 'function Object() { [native code] }1'</span>
Object.keys({ b: 1, 2: 1, a: 1, 1: 1, "-1": 1 }); <span class="c">// → [ '1', '2', 'b', 'a', '-1' ]</span>
const tally = new Map();
tally.set(word, (tally.get(word) ?? 0) + 1);
tally.get(word); <span class="c">// → 1</span></code></pre>
<p class="sub">
  The word <code>"constructor"</code> already exists on every object, so
  <code>counts[word] || 0</code> finds a function and glues "1" to it. Object
  keys are always strings (the number 1 and the string "1" are one key), integer
  looking keys come first in ascending order, and then the rest in insertion
  order. A <code>Map</code> has none of these problems. Use
  <code>get(k) ?? 0</code> rather than <code>get(k) || 0</code> when the stored
  value can legitimately be 0 and you want to keep it, and use
  <code>has</code> to test presence: <code>if (map.get(k))</code> is false for a
  stored 0.
</p>
<h4>Changing a collection while looping over it</h4>
<pre><code>const s = new Set([1]);
const seen = [];
for (const x of s) {
  seen.push(x);
  if (x &lt; 4) s.add(x + 1);
}
seen; <span class="c">// → [ 1, 2, 3, 4 ]</span>
const mm = new Map([[1, 1], [2, 2], [3, 3]]);
const visited = [];
for (const [k] of mm) {
  visited.push(k);
  mm.delete(k + 1);
}
visited; <span class="c">// → [ 1, 3 ]</span></code></pre>
<p class="sub">
  Items added during the loop are visited, and items deleted before the loop
  reaches them are skipped. That is well defined, and it is also an easy way to
  write a loop that never ends if you add a new item on every step. When in
  doubt, loop over a copy: <code>for (const x of [...s])</code>.
</p>
<h4>Cost, and when to reach for a set</h4>
<p>
  <code>has</code>, <code>get</code>, <code>set</code> and <code>delete</code>
  are O(1) <em>on average</em>, and <code>size</code> is O(1). The specification
  asks only that access be sublinear on average, so O(1) average is the working
  assumption, as in the hashing chapter. The array methods on the same job:
  testing "have I seen n numbers" with <code>includes</code> inside a loop over
  n numbers, against a <code>Set</code>:
</p>
<table>
  <tr><th>n</th><th><code>a.includes(x)</code> n times</th><th><code>set.has(x)</code> n times</th></tr>
  <tr><td>2,000</td><td>1.1 ms</td><td>0.15 ms</td></tr>
  <tr><td>8,000</td><td>13.7 ms</td><td>0.23 ms</td></tr>
  <tr><td>32,000</td><td>220 ms</td><td>0.79 ms</td></tr>
</table>
<p class="sub">
  A fourfold input made the array version thirteen to sixteen times slower,
  which is the quadratic shape again.
</p>
<pre><code>[...new Map([["a", 1], ["b", 3], ["c", 2]])].sort((x, y) =&gt; y[1] - x[1]); <span class="c">// → [ [ 'b', 3 ], [ 'c', 2 ], [ 'a', 1 ] ]</span>
Object.groupBy([1, 2, 3, 4], (x) =&gt; (x % 2 ? "odd" : "even")); <span class="c">// → [Object: null prototype] { odd: [ 1, 3 ], even: [ 2, 4 ] }</span>
new Set([1, 2]).union(new Set([2, 3])); <span class="c">// → Set(3) { 1, 2, 3 }</span>
new Set([...new Set([1, 2]), ...new Set([2, 3])]); <span class="c">// → Set(3) { 1, 2, 3 }</span></code></pre>
<p class="sub">
  Sorting a map by value means spreading it into an array of pairs first, since
  a <code>Map</code> itself has no sort. <code>groupBy</code> and the
  <code>Set</code> methods <code>union</code>, <code>intersection</code> and
  <code>difference</code> exist in Node 24, but they are recent, so the spread
  form is the safe one in an unfamiliar environment.
</p>

<h3>Numbers: doubles, safe integers and division</h3>
<p>
  Every JavaScript number is a 64-bit floating-point value. Integers are exact
  only while they fit in the 53 bits the format gives to digits. Past that, whole
  numbers start to be skipped:
</p>
<pre><code>Number.MAX_SAFE_INTEGER; <span class="c">// → 9007199254740991</span>
2 ** 53 === 2 ** 53 + 1; <span class="c">// → true</span>
Number.MAX_SAFE_INTEGER + 2; <span class="c">// → 9007199254740992</span>
Number.isSafeInteger(2 ** 53); <span class="c">// → false</span>
0.1 + 0.2; <span class="c">// → 0.30000000000000004</span>
0.1 + 0.2 === 0.3; <span class="c">// → false</span></code></pre>
<p>
  The consequences for interview code are concrete. Sums and products of large
  inputs can leave the safe range without any warning: the result is a number,
  just a wrong one. Factorials are a clean example:
</p>
<pre><code>function lastSafeFactorial() {
  let f = 1;
  let n = 1;
  while (Number.isSafeInteger(f * (n + 1))) {
    n++;
    f *= n;
  }
  return n;
}
lastSafeFactorial(); <span class="c">// → 18</span></code></pre>
<p class="sub">
  19! is already past the safe range. A problem that asks for "the number of
  ways" modulo 10<sup>9</sup> + 7 is built so the answer stays small; the
  danger is the <em>intermediate product</em>, covered after the division rules.
  When a problem involves fractions, avoid floating point: compare
  <code>a / b</code> with <code>c / d</code> as <code>a * d</code> against
  <code>c * b</code>, and keep everything an integer. If floats are unavoidable,
  compare with a tolerance: <code>Math.abs(x - y) &lt; 1e-9</code>.
</p>
<h4>Division, remainder and the minus-zero</h4>
<pre><code>-7 / 2; <span class="c">// → -3.5</span>
Math.floor(-7 / 2); <span class="c">// → -4</span>
Math.trunc(-7 / 2); <span class="c">// → -3</span>
-7 % 2; <span class="c">// → -1</span>
((-7 % 5) + 5) % 5; <span class="c">// → 3</span>
7 % -5; <span class="c">// → 2</span>
Math.round(2.5); <span class="c">// → 3</span>
Math.round(-2.5); <span class="c">// → -2</span></code></pre>
<p>
  <code>/</code> never rounds: integer division is something you write. Use
  <code>Math.floor</code> to round toward negative infinity and
  <code>Math.trunc</code> to cut toward zero, and choose on purpose, because
  they differ for negative numbers. <code>%</code> gives the remainder with the
  <b>sign of the left operand</b>, so <code>-7 % 5</code> is -2 and a "wrap an
  index around" formula needs the fix on the fifth line,
  <code>((x % m) + m) % m</code>, to land in <code>0..m-1</code>.
  <code>Math.round</code> rounds halves toward positive infinity.
</p>
<pre><code>Math.trunc(-0.5); <span class="c">// → -0</span>
-4 % 2; <span class="c">// → -0</span>
-0 === 0; <span class="c">// → true</span>
Object.is(-0, 0); <span class="c">// → false</span>
String(-0); <span class="c">// → '0'</span>
[-0].includes(0); <span class="c">// → true</span>
Math.max(); <span class="c">// → -Infinity</span>
Math.min(); <span class="c">// → Infinity</span>
Math.max(NaN, 1); <span class="c">// → NaN</span>
NaN === NaN; <span class="c">// → false</span>
Number.isNaN("abc"); <span class="c">// → false</span>
isNaN("abc"); <span class="c">// → true</span></code></pre>
<p class="sub">
  Negative zero is a real value that behaves like 0 in arithmetic and in
  <code>===</code>, but a console prints it as <code>-0</code> and
  <code>Object.is</code> can tell it apart. It appears from
  <code>Math.trunc</code> and <code>Math.round</code> of a small negative number
  and from a negative number's remainder. If a result must print as 0, add 0 to
  it: <code>-0 + 0</code> is 0. <code>Infinity</code> is the right starting
  value for a running minimum, and <code>-Infinity</code> for a running maximum.
  A <code>NaN</code> poisons every comparison, because all of them are false, so
  <code>if (x &lt; best)</code> silently never fires for a <code>NaN</code>
  <code>x</code>. Use <code>Number.isNaN</code>, which does not convert its
  argument first the way the global <code>isNaN</code> does.
</p>
<h4>The middle of a range</h4>
<pre><code>const lo = 2 ** 31;
const hi = 2 ** 31 + 10;
Math.floor((lo + hi) / 2); <span class="c">// → 2147483653</span>
lo + Math.floor((hi - lo) / 2); <span class="c">// → 2147483653</span>
(lo + hi) &gt;&gt; 1; <span class="c">// → 5</span></code></pre>
<p class="sub">
  In JavaScript <code>lo + hi</code> cannot overflow until the sum passes 2<sup>53</sup>,
  so the textbook worry about
  <code>(lo + hi) / 2</code> belongs to languages with 32-bit integers. The
  trap is the opposite one: the shortcut <code>(lo + hi) &gt;&gt; 1</code> forces
  the sum into 32 bits first, and it gives 5 here. Write
  <code>Math.floor((lo + hi) / 2)</code>, or
  <code>lo + ((hi - lo) &gt;&gt; 1)</code> while the range is below 2<sup>31</sup>.
</p>

<h3>BigInt: exact integers, with rules</h3>
<p>
  A <code>BigInt</code> is a separate type that holds a whole number of any
  size exactly. Write a literal with an <code>n</code> suffix or convert with
  <code>BigInt(x)</code>. It exists for the places where the 2<sup>53</sup>
  limit above would change an answer.
</p>
<pre><code>2n ** 100n; <span class="c">// → 1267650600228229401496703205376n</span>
BigInt(Number.MAX_SAFE_INTEGER) + 2n; <span class="c">// → 9007199254740993n</span>
-7n / 2n; <span class="c">// → -3n</span>
-7n % 2n; <span class="c">// → -1n</span>
1n + 1; <span class="c">// → TypeError: Cannot mix BigInt and other types, use explicit conversions</span>
BigInt(1.5); <span class="c">// → RangeError: The number 1.5 cannot be converted to a BigInt because it is not an integer</span>
1n == 1; <span class="c">// → true</span>
1n === 1; <span class="c">// → false</span>
10n &gt; 9; <span class="c">// → true</span>
Number(2n ** 64n); <span class="c">// → 18446744073709552000</span>
JSON.stringify({ a: 1n }); <span class="c">// → TypeError: Do not know how to serialize a BigInt</span>
Math.max(1n, 2n); <span class="c">// → TypeError: Cannot convert a BigInt value to a number</span></code></pre>
<ul>
  <li><b>No mixing.</b> Arithmetic between a BigInt and a number throws. Convert
    one side explicitly.</li>
  <li><b>Division truncates toward zero</b> and drops the remainder, like
    <code>Math.trunc</code>, and <code>%</code> takes the sign of the left
    operand.</li>
  <li><b>Comparison</b> works across types (<code>10n &gt; 9</code>), but
    <code>===</code> does not (<code>1n === 1</code> is false), and a
    <code>Map</code> treats <code>1n</code> and <code>1</code> as different
    keys.</li>
  <li><b>Converting back</b> with <code>Number(big)</code> rounds once the value
    is beyond the safe range.</li>
  <li><b>No <code>Math</code> functions and no JSON.</b> Print with
    <code>String(big)</code> or <code>big.toString()</code>.</li>
</ul>
<h4>The multiplication that loses digits</h4>
<p>
  Counting problems ask for an answer modulo 10<sup>9</sup> + 7 and multiply two
  numbers that are each below that. The product can be about 10<sup>18</sup>,
  far past 2<sup>53</sup>, so the remainder of the rounded product is wrong:
</p>
<pre><code>const MOD = 1000000007;
const x = 999999999;
const y = 999999998;
(x * y) % MOD; <span class="c">// → 70</span>
Number((BigInt(x) * BigInt(y)) % BigInt(MOD)); <span class="c">// → 72</span>
Number.isSafeInteger(x * y); <span class="c">// → false</span>
function mulMod(a, b, m) {
  return Number((BigInt(a) * BigInt(b)) % BigInt(m));
}
mulMod(x, y, MOD); <span class="c">// → 72</span></code></pre>
<p class="sub">
  The first answer is a plausible-looking 70 and the true one is 72, with no
  error raised. Do the multiplication in BigInt and convert the already reduced
  result back, which is safe because it is below the modulus. Additions need no
  such care: the sum of two values below 10<sup>9</sup> + 7 stays safe. Reach
  for BigInt when exactness is the point (huge factorials, exact products, 64-bit
  wrap-around with <code>BigInt.asUintN(64, x)</code>), and keep ordinary
  counters as numbers, since mixing the types costs conversions.
</p>
<pre><code>function factorialString(n) {
  let f = 1n;
  for (let i = 2n; i &lt;= BigInt(n); i++) f *= i;
  return f.toString();
}
factorialString(25); <span class="c">// → '15511210043330985984000000'</span>
BigInt.asUintN(64, -1n); <span class="c">// → 18446744073709551615n</span></code></pre>

<h3>Bit operations and the 32-bit window</h3>
<p>
  The bit operators <code>&amp;</code>, <code>|</code>, <code>^</code>,
  <code>~</code>, <code>&lt;&lt;</code>, <code>&gt;&gt;</code> and
  <code>&gt;&gt;&gt;</code> do not work on the 64-bit double you wrote. They
  first convert each operand to a <b>signed 32-bit integer</b>, work on that, and
  convert back. Everything surprising about them follows from that one step.
</p>
<pre><code>1 &lt;&lt; 30; <span class="c">// → 1073741824</span>
1 &lt;&lt; 31; <span class="c">// → -2147483648</span>
1 &lt;&lt; 32; <span class="c">// → 1</span>
2 ** 31 | 0; <span class="c">// → -2147483648</span>
2 ** 32 | 0; <span class="c">// → 0</span>
(2 ** 40 + 3) | 0; <span class="c">// → 3</span>
1e10 ^ 0; <span class="c">// → 1410065408</span>
-1 &gt;&gt; 0; <span class="c">// → -1</span>
-1 &gt;&gt;&gt; 0; <span class="c">// → 4294967295</span>
-8 &gt;&gt; 1; <span class="c">// → -4</span>
-8 &gt;&gt;&gt; 1; <span class="c">// → 2147483644</span>
3.7 | 0; <span class="c">// → 3</span>
-3.7 | 0; <span class="c">// → -3</span></code></pre>
<ul>
  <li>Bit 31 is the <b>sign bit</b>. <code>1 &lt;&lt; 31</code> is negative, and
    any number from 2<sup>31</sup> up reads as a negative one.</li>
  <li>The shift count is taken <b>modulo 32</b>, so <code>1 &lt;&lt; 32</code>
    is <code>1 &lt;&lt; 0</code>.</li>
  <li>A value of 2<sup>32</sup> or more <b>loses its upper bits</b>:
    <code>(2 ** 40 + 3) | 0</code> is 3. Bit tricks are only for values that fit
    in 32 bits. For wider ones use <code>BigInt</code>, which has its own
    <code>&amp;</code>, <code>|</code>, <code>&lt;&lt;</code>, or plain
    arithmetic.</li>
  <li><code>&gt;&gt;</code> copies the sign bit in from the left;
    <code>&gt;&gt;&gt;</code> fills with zeros. <b><code>x &gt;&gt;&gt; 0</code></b>
    is the idiom that reads the 32 bits as an <em>unsigned</em> number.</li>
  <li><code>x | 0</code> and <code>~~x</code> cut off the fractional part toward
    zero, like <code>Math.trunc</code>, but only inside the 32-bit window.</li>
</ul>
<h4>Parity, masks and printing bits</h4>
<pre><code>-3 % 2; <span class="c">// → -1</span>
-3 % 2 === 1; <span class="c">// → false</span>
(-3 &amp; 1) === 1; <span class="c">// → true</span>
(1 &lt;&lt; 30) - 1; <span class="c">// → 1073741823</span>
(1 &lt;&lt; 31) - 1; <span class="c">// → -2147483649</span>
2 ** 31 - 1; <span class="c">// → 2147483647</span>
(-5).toString(2); <span class="c">// → '-101'</span>
(-5 &gt;&gt;&gt; 0).toString(2); <span class="c">// → '11111111111111111111111111111011'</span>
(5).toString(2).padStart(8, "0"); <span class="c">// → '00000101'</span>
parseInt("101", 2); <span class="c">// → 5</span>
Math.clz32(1); <span class="c">// → 31</span>
Math.imul(65537, 65537); <span class="c">// → 131073</span></code></pre>
<p class="sub">
  An "is it odd" test written as <code>n % 2 === 1</code> fails for every
  negative odd number, because their remainder is -1. Test
  <code>(n &amp; 1) === 1</code>, or <code>n % 2 !== 0</code>. A mask of the low
  <code>k</code> bits, <code>(1 &lt;&lt; k) - 1</code>, is right up to
  <code>k = 30</code> and wrong from 31, as the last two mask lines show; use
  <code>2 ** k - 1</code> while you stay out of the bit operators. A bitmask over
  items, where bit <code>i</code> means "item i is chosen", is therefore safe for
  up to 30 items with <code>1 &lt;&lt; i</code>. <code>(-5).toString(2)</code>
  prints a minus sign, not the stored bits; to see two's complement, shift by
  zero first. <code>Math.imul</code> multiplies two 32-bit integers and keeps
  the low 32 bits exactly, which an ordinary <code>*</code> cannot do once the
  product passes 2<sup>53</sup>. The bit-manipulation chapter builds the tricks
  on this footing.
</p>

<h3>Typed arrays: fixed-size, zero-filled numbers</h3>
<p>
  A typed array such as <code>Int32Array</code>, <code>Uint8Array</code> or
  <code>Float64Array</code> is a fixed-length array of one numeric type, and every
  slot starts at 0. You pick one when you know the size up front and the values
  are numbers: a sieve, a counting array, a DP table, a visited flag, a queue
  of node numbers.
</p>
<pre><code>new Int32Array(1000000).byteLength; <span class="c">// → 4000000</span>
new Uint8Array(1000000).byteLength; <span class="c">// → 1000000</span>
new Uint8Array([256, -1, 257, 3.9]); <span class="c">// → Uint8Array(4) [ 0, 255, 1, 3 ]</span>
new Uint8ClampedArray([256, -1, 300]); <span class="c">// → Uint8ClampedArray(3) [ 255, 0, 255 ]</span>
new Int32Array([2 ** 31, 2 ** 32 + 5]); <span class="c">// → Int32Array(2) [ -2147483648, 5 ]</span>
new Int32Array([Infinity, 1.9]); <span class="c">// → Int32Array(2) [ 0, 1 ]</span>
new Float64Array(2).fill(Infinity); <span class="c">// → Float64Array(2) [ Infinity, Infinity ]</span>
new Int32Array([10, 2, 1]).sort(); <span class="c">// → Int32Array(3) [ 1, 2, 10 ]</span>
typeof new Int32Array(2).push; <span class="c">// → 'undefined'</span></code></pre>
<ul>
  <li><b>Values wrap or clamp silently.</b> A <code>Uint8Array</code> stores 256
    as 0 and -1 as 255. The clamped variant pins to 0..255. An
    <code>Int32Array</code> wraps at 2<sup>31</sup>. Pick the width for the
    largest value you will store.</li>
  <li><b>An integer array cannot hold <code>Infinity</code>.</b> It stores 0.
    For a DP table that uses <code>Infinity</code> as "unreachable", use a
    <code>Float64Array</code>, or a large integer sentinel that fits.</li>
  <li><b>The length is fixed</b>: no <code>push</code>, <code>pop</code> or
    <code>shift</code>, and writing past the end is ignored.</li>
  <li><b><code>sort()</code> is numeric by default</b>, unlike a normal array.</li>
  <li><b><code>subarray</code></b> is a view that shares memory with the
    original, <b><code>slice</code></b> is a copy. Writing through the view
    changes the original.</li>
</ul>
<pre><code>function countPrimes(n) {
  const composite = new Uint8Array(n + 1);
  let count = 0;
  for (let i = 2; i &lt;= n; i++) {
    if (composite[i] === 1) continue;
    count++;
    for (let j = i * i; j &lt;= n; j += i) composite[j] = 1;
  }
  return count;
}
countPrimes(100); <span class="c">// → 25</span>
countPrimes(1000000); <span class="c">// → 78498</span></code></pre>
<p class="sub">
  The array of flags starts zeroed, so there is no fill loop, and a million
  flags take a million bytes. The same fixed size is what makes a typed array a
  good queue for BFS, because every node enters once:
  <code>const queue = new Int32Array(n)</code> with two indexes, a head and a
  tail, replaces the growing array. A grid can also be stored flat in one typed
  array with the index <code>r * cols + c</code>.
</p>
<pre><code>function bfsTyped(n, edges, start) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const dist = new Int32Array(n).fill(-1);
  const queue = new Int32Array(n);
  let head = 0;
  let tail = 0;
  queue[tail++] = start;
  dist[start] = 0;
  while (head &lt; tail) {
    const node = queue[head++];
    for (const next of adj[node]) {
      if (dist[next] === -1) {
        dist[next] = dist[node] + 1;
        queue[tail++] = next;
      }
    }
  }
  return Array.from(dist);
}
bfsTyped(6, [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4]], 0); <span class="c">// → [ 0, 1, 1, 2, 3, -1 ]</span></code></pre>

<h3>Recursion depth: the stack runs out</h3>
<p>
  Every call that has not returned yet takes space on the call stack, and the
  stack has a fixed size. When a recursion nests too deeply, JavaScript throws
  <code>RangeError: Maximum call stack size exceeded</code>. The limit is not a
  number in the language. It depends on how big each frame is, and on the
  runtime. In Node 24 on the machine used here:
</p>
<table>
  <tr><th>Function</th><th>Depth reached before the error</th></tr>
  <tr><td>a bare function that calls itself</td><td>10,381</td></tr>
  <tr><td>a function with five parameters that also builds a small array</td><td>5,660</td></tr>
</table>
<p>
  So plan on a few thousand levels, and treat anything near ten thousand as
  already unsafe. A linked list of 100,000 nodes, a depth-first search of a
  path-shaped graph with 100,000 nodes, or a memoized recursion over
  <code>n = 100,000</code> all fail, even though each is O(n) on paper. The
  language specification describes proper tail calls, but Node does not
  implement them, so moving the recursive call to the last position buys
  nothing:
</p>
<pre><code>function sumTo(n, acc = 0) {
  return n === 0 ? acc : sumTo(n - 1, acc + n);
}
sumTo(1000); <span class="c">// → 500500</span>
sumTo(100000); <span class="c">// → RangeError: Maximum call stack size exceeded</span></code></pre>
<p>
  The fix is to replace the call stack with a stack of your own, which lives in
  the heap and can hold millions of entries. For depth-first search that is an
  array used as a stack:
</p>
<pre><code>function countReachable(n, edges, start) {
  const adj = Array.from({ length: n }, () =&gt; []);
  for (const [a, b] of edges) {
    adj[a].push(b);
    adj[b].push(a);
  }
  const seen = new Uint8Array(n);
  const stack = [start];
  seen[start] = 1;
  let count = 0;
  while (stack.length &gt; 0) {
    const node = stack.pop();
    count++;
    for (const next of adj[node]) {
      if (seen[next] === 0) {
        seen[next] = 1;
        stack.push(next);
      }
    }
  }
  return count;
}

function countReachableRecursive(adj, node, seen) {
  seen[node] = 1;
  let count = 1;
  for (const next of adj[node]) {
    if (seen[next] === 0) count += countReachableRecursive(adj, next, seen);
  }
  return count;
}</code></pre>
<p class="sub">
  Run both on a path graph 0-1-2-...-199,999: the loop version returns 200,000,
  and the recursive one throws <code>RangeError</code>. The loop marks a node as
  seen when it is <em>pushed</em>, so each node enters the stack once, and the
  visiting order differs from the recursive one. Where the order matters (for
  example a topological order from a depth-first search) you keep an index per
  stack entry instead. Keep ordinary recursion for trees and graphs whose depth
  is known to be small, such as a balanced tree of height 20, and say the limit
  out loud when the input could be a long chain.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "The recursive version is the
  clearest, but a path-shaped input makes it n deep, and JavaScript runs out of
  stack at around ten thousand frames. If n can be that large I'll use an
  explicit stack, which is the same traversal with the call stack replaced by an
  array."
</div>

<h3>No built-in heap: a minimal one with a comparator</h3>
<p>
  A <b>priority queue</b> hands back the smallest (or largest) item you have
  stored so far, and accepts new items in between. It is the structure behind
  "k largest", "merge k sorted lists", Dijkstra and scheduling problems. The
  standard way to build one is a <b>binary heap</b>: a complete binary tree kept
  in an array, where every parent comes out before its children. JavaScript has
  no heap in the language. In an interview you write it, so here is one you can
  type from memory, and the heaps chapter explains why it is correct and puts it
  to work.
</p>
<p>
  The array stores the tree level by level: the children of the item at index
  <code>i</code> are at <code>2i + 1</code> and <code>2i + 2</code>, and its
  parent at <code>(i - 1) &gt;&gt; 1</code>. The one design choice is how to say
  which item comes out first. Do it the way <code>sort</code> does: the
  constructor takes a comparator, and an item <code>a</code> sits closer to the
  top than <code>b</code> when <code>compare(a, b) &lt; 0</code>. Then the same
  class is a min-heap, a max-heap, or a heap of pairs ordered by their first
  field.
</p>
<pre><code>class Heap {
  #items;
  #compare;

  constructor(compare = (a, b) =&gt; a - b, items = []) {
    this.#compare = compare;
    this.#items = [...items];
    for (let i = (this.#items.length &gt;&gt; 1) - 1; i &gt;= 0; i--) this.#siftDown(i);
  }

  get size() {
    return this.#items.length;
  }

  peek() {
    return this.#items[0];
  }

  push(item) {
    this.#items.push(item);
    this.#siftUp(this.#items.length - 1);
  }

  pop() {
    const items = this.#items;
    if (items.length === 0) return undefined;
    const top = items[0];
    const last = items.pop();
    if (items.length &gt; 0) {
      items[0] = last;
      this.#siftDown(0);
    }
    return top;
  }

  #siftUp(i) {
    const items = this.#items;
    while (i &gt; 0) {
      const parent = (i - 1) &gt;&gt; 1;
      if (this.#compare(items[i], items[parent]) &gt;= 0) break;
      [items[i], items[parent]] = [items[parent], items[i]];
      i = parent;
    }
  }

  #siftDown(i) {
    const items = this.#items;
    const n = items.length;
    while (true) {
      let best = i;
      const left = 2 * i + 1;
      const right = left + 1;
      if (left &lt; n &amp;&amp; this.#compare(items[left], items[best]) &lt; 0) best = left;
      if (right &lt; n &amp;&amp; this.#compare(items[right], items[best]) &lt; 0) best = right;
      if (best === i) break;
      [items[i], items[best]] = [items[best], items[i]];
      i = best;
    }
  }
}</code></pre>
<pre><code>const minHeap = new Heap();
[5, 3, 8, 1].forEach((x) =&gt; minHeap.push(x));
minHeap.peek(); <span class="c">// → 1</span>
minHeap.pop(); <span class="c">// → 1</span>
minHeap.pop(); <span class="c">// → 3</span>
minHeap.size; <span class="c">// → 2</span>
new Heap((a, b) =&gt; b - a, [4, 9, 2]).pop(); <span class="c">// → 9</span>
const byDistance = new Heap((a, b) =&gt; a[0] - b[0]);
byDistance.push([7, "far"]);
byDistance.push([2, "near"]);
byDistance.pop(); <span class="c">// → [ 2, 'near' ]</span>
new Heap().pop(); <span class="c">// → undefined</span></code></pre>
<h4>Dry run: push 5, 3, 8, 1, then pop twice</h4>
<table>
  <tr><th>Call</th><th>Array before sifting</th><th>Array afterwards</th><th>What happened</th></tr>
  <tr><td>push(5)</td><td>[5]</td><td>[5]</td><td>a single item is already a heap</td></tr>
  <tr><td>push(3)</td><td>[5, 3]</td><td>[3, 5]</td><td>3 is smaller than its parent 5, swap</td></tr>
  <tr><td>push(8)</td><td>[3, 5, 8]</td><td>[3, 5, 8]</td><td>8 is not smaller than its parent 3, stop</td></tr>
  <tr><td>push(1)</td><td>[3, 5, 8, 1]</td><td>[1, 3, 8, 5]</td><td>1 swaps with parent 5, then with parent 3</td></tr>
  <tr><td>pop() returns 1</td><td>[5, 3, 8]</td><td>[3, 5, 8]</td><td>last item 5 moved to the root, then swapped with the smaller child 3</td></tr>
  <tr><td>pop() returns 3</td><td>[8, 5]</td><td>[5, 8]</td><td>last item 8 moved to the root, swapped with its only child 5</td></tr>
</table>
<p class="sub">
  The cost: <code>push</code> and <code>pop</code> are O(log n), because each
  moves along one path of the tree and a complete tree of n items is about
  log₂ n levels tall. <code>peek</code> and <code>size</code> are O(1). The
  constructor builds a heap from an array in O(n) by sifting down from the last
  parent to the root, which the heaps chapter proves. A top-k loop shows the
  typical use: keep a min-heap of the k largest so far and drop its minimum
  whenever it grows past k.
</p>
<pre><code>function kthLargest(nums, k) {
  const heap = new Heap();
  for (const x of nums) {
    heap.push(x);
    if (heap.size &gt; k) heap.pop();
  }
  return heap.peek();
}
kthLargest([3, 2, 1, 5, 6, 4], 2); <span class="c">// → 5</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Four ways a hand-written heap goes wrong</span>
  <b>Comparator direction.</b> Negative means "comes out first", so a max-heap
  uses <code>b - a</code>, and a comparator that returns a boolean does not work
  here for the same reason it does not work in <code>sort</code>.
  <b>Changing priorities in place.</b> If you modify an object that is already in
  the heap, the heap does not notice and the order silently breaks. Push a new
  entry and ignore the stale one when it comes out (lazy deletion), which is how
  Dijkstra works without a decrease-key operation.
  <b>Empty pop.</b> It returns <code>undefined</code>, which is also a legal item,
  so test <code>size</code> first. <b>Ties.</b> A heap is not stable: equal items
  can come out in any order, so put a tie-breaker in the comparator
  (<code>a[0] - b[0] || a[1] - b[1]</code>) whenever the order of equal items
  matters.
</div>
<div class="say">
  <span class="ttl">Say it like this →</span> "JavaScript has no priority queue,
  so I'll write a small binary heap with a comparator. It's an array where the
  children of index i are at 2i+1 and 2i+2. Push adds at the end and sifts up,
  pop moves the last item to the root and sifts down, both O(log n)."
</div>

<h3>No built-in deque: a ring buffer</h3>
<p>
  A <b>deque</b> (double-ended queue) adds and removes at <em>both</em> ends in
  O(1). The head-index queue gives you one end; the other end of a plain array
  is O(n) with <code>unshift</code>. The structure behind "sliding window
  maximum", 0-1 breadth-first search and "palindrome check from both ends" is the
  <b>ring buffer</b>: a fixed row of slots in which the live items occupy a
  stretch that may wrap around the end.
</p>
<p>
  Keep two numbers, <code>head</code> (the slot of the front item) and
  <code>size</code>. The item at logical position <code>i</code> lives in slot
  <code>(head + i) % capacity</code>. Pushing at the back writes to logical
  position <code>size</code>; pushing at the front moves <code>head</code> one
  slot <em>backwards</em>, wrapping around, and writes there. When the row is
  full, build one twice as long, copy the items in logical order and reset
  <code>head</code> to 0.
</p>
<figure>
  <svg viewBox="0 0 640 210" class="dg" role="img" aria-label="A ring buffer with four slots holding 1, 2, 8, 9 in slots 0 to 3, where the head is slot 2, so the logical order reads 8, 9, 1, 2 and wraps from slot 3 back to slot 0">
    <g class="rough">
      <rect class="box" x="120" y="60" width="90" height="50" />
      <rect class="box" x="210" y="60" width="90" height="50" />
      <rect class="boxg" x="300" y="60" width="90" height="50" />
      <rect class="box" x="390" y="60" width="90" height="50" />
    </g>
    <text class="sm" x="165" y="90" text-anchor="middle">1</text>
    <text class="sm" x="255" y="90" text-anchor="middle">2</text>
    <text class="sm" x="345" y="90" text-anchor="middle">8</text>
    <text class="sm" x="435" y="90" text-anchor="middle">9</text>
    <text class="sm" x="165" y="132" text-anchor="middle">slot 0</text>
    <text class="sm" x="255" y="132" text-anchor="middle">slot 1</text>
    <text class="sm" x="345" y="132" text-anchor="middle">slot 2</text>
    <text class="sm" x="435" y="132" text-anchor="middle">slot 3</text>
    <text class="lbl gr" x="345" y="46" text-anchor="middle" style="font-size:14px">head = 2</text>
    <text class="lbl" x="120" y="170" style="font-size:14px">logical order from the front: 8, 9, 1, 2 (slot 2, 3, then wrapping to 0, 1)</text>
    <text class="sm" x="120" y="195">pushFront moves head back one slot; the next free slot for pushBack is (head + size) % 4</text>
  </svg>
  <figcaption>The live items start at the head and may wrap past the last slot. Nothing is ever shifted; only head and size change.</figcaption>
</figure>
<pre><code>class Deque {
  #buf = new Array(4);
  #head = 0;
  #size = 0;

  get size() {
    return this.#size;
  }

  #slot(i) {
    return (this.#head + i) % this.#buf.length;
  }

  #grow() {
    const bigger = new Array(this.#buf.length * 2);
    for (let i = 0; i &lt; this.#size; i++) bigger[i] = this.#buf[this.#slot(i)];
    this.#buf = bigger;
    this.#head = 0;
  }

  pushBack(x) {
    if (this.#size === this.#buf.length) this.#grow();
    this.#buf[this.#slot(this.#size)] = x;
    this.#size++;
  }

  pushFront(x) {
    if (this.#size === this.#buf.length) this.#grow();
    this.#head = (this.#head - 1 + this.#buf.length) % this.#buf.length;
    this.#buf[this.#head] = x;
    this.#size++;
  }

  popFront() {
    if (this.#size === 0) return undefined;
    const x = this.#buf[this.#head];
    this.#buf[this.#head] = undefined;
    this.#head = this.#slot(1);
    this.#size--;
    return x;
  }

  popBack() {
    if (this.#size === 0) return undefined;
    const slot = this.#slot(this.#size - 1);
    const x = this.#buf[slot];
    this.#buf[slot] = undefined;
    this.#size--;
    return x;
  }

  peekFront() {
    return this.#size === 0 ? undefined : this.#buf[this.#head];
  }

  peekBack() {
    return this.#size === 0 ? undefined : this.#buf[this.#slot(this.#size - 1)];
  }

  at(i) {
    return i &gt;= 0 &amp;&amp; i &lt; this.#size ? this.#buf[this.#slot(i)] : undefined;
  }
}</code></pre>
<h4>Dry run: capacity 4, then a push that forces the buffer to grow</h4>
<table>
  <tr><th>Call</th><th>head</th><th>size</th><th>Slots 0, 1, 2, ... (· is empty)</th><th>Reads from the front as</th></tr>
  <tr><td>pushBack(1)</td><td>0</td><td>1</td><td>1 · · ·</td><td>1</td></tr>
  <tr><td>pushBack(2)</td><td>0</td><td>2</td><td>1 2 · ·</td><td>1, 2</td></tr>
  <tr><td>pushFront(9)</td><td>3</td><td>3</td><td>1 2 · 9</td><td>9, 1, 2</td></tr>
  <tr><td>pushFront(8)</td><td>2</td><td>4</td><td>1 2 8 9</td><td>8, 9, 1, 2 (the figure)</td></tr>
  <tr><td>pushBack(3)</td><td>0</td><td>5</td><td>8 9 1 2 3 · · ·</td><td>8, 9, 1, 2, 3 (full, so doubled and copied in order)</td></tr>
  <tr><td>popFront() returns 8</td><td>1</td><td>4</td><td>· 9 1 2 3 · · ·</td><td>9, 1, 2, 3</td></tr>
  <tr><td>popBack() returns 3</td><td>1</td><td>3</td><td>· 9 1 2 · · · ·</td><td>9, 1, 2</td></tr>
</table>
<p class="sub">
  Every operation is O(1) except the doubling, which copies n items. Doubling
  happens after the size has doubled, so the copies over n pushes add up to
  fewer than 2n item moves: O(1) amortized, the same argument as
  <code>push</code> on a dynamic array. Two details that lose offers: the
  <code>- 1 + length</code> in <code>pushFront</code> keeps the index from going
  negative, since <code>%</code> of a negative number is negative; and the full
  test must happen <em>before</em> the write, or a push on a full buffer
  overwrites the front. Setting a popped slot back to <code>undefined</code>
  lets the removed item be collected.
</p>
<h4>What it is for: sliding window maximum</h4>
<p>
  Keep the <em>indexes</em> of candidates in the deque so their values are
  decreasing from front to back. A new number removes every smaller candidate
  from the back, because those can never be a window maximum while the newer,
  larger number is in range. The front is expired when its index leaves the
  window.
</p>
<pre><code>function slidingMax(nums, k) {
  const out = [];
  const candidates = new Deque();
  for (let i = 0; i &lt; nums.length; i++) {
    while (candidates.size &gt; 0 &amp;&amp; nums[candidates.peekBack()] &lt;= nums[i]) {
      candidates.popBack();
    }
    candidates.pushBack(i);
    if (candidates.peekFront() &lt;= i - k) candidates.popFront();
    if (i &gt;= k - 1) out.push(nums[candidates.peekFront()]);
  }
  return out;
}
slidingMax([1, 3, 1, 2, 0, 5], 3); <span class="c">// → [ 3, 3, 2, 5 ]</span></code></pre>
<h4>Dry run: slidingMax([1, 3, 1, 2, 0, 5], 3)</h4>
<table>
  <tr><th>i</th><th>nums[i]</th><th>Removed from the back</th><th>Front expired</th><th>Deque of indexes (values)</th><th>Output so far</th></tr>
  <tr><td>0</td><td>1</td><td>none</td><td>no</td><td>[0] (1)</td><td>[]</td></tr>
  <tr><td>1</td><td>3</td><td>index 0, because 1 &lt;= 3</td><td>no</td><td>[1] (3)</td><td>[]</td></tr>
  <tr><td>2</td><td>1</td><td>none, since 3 &gt; 1</td><td>no</td><td>[1, 2] (3, 1)</td><td>[3]</td></tr>
  <tr><td>3</td><td>2</td><td>index 2, because 1 &lt;= 2</td><td>no, 1 &gt; 3 - 3</td><td>[1, 3] (3, 2)</td><td>[3, 3]</td></tr>
  <tr><td>4</td><td>0</td><td>none</td><td>index 1, since 1 &lt;= 4 - 3</td><td>[3, 4] (2, 0)</td><td>[3, 3, 2]</td></tr>
  <tr><td>5</td><td>5</td><td>indexes 4 and 3</td><td>no</td><td>[5] (5)</td><td>[3, 3, 2, 5]</td></tr>
</table>
<p class="sub">
  Each index is pushed once and popped at most once, so the whole pass is O(n),
  where a rescan of every window is O(n · k). The monotonic chapter treats this
  pattern in full. The deque was checked against a plain-array model on random
  mixes of pushes, pops, peeks and reads, including runs that wrap and grow
  repeatedly.
</p>

<h3>No built-in ordered set: why, and what to use</h3>
<p>
  An <b>ordered set</b> (a "TreeSet" or "TreeMap" in other languages) keeps its
  keys sorted and answers questions about the order: the largest key not above
  <code>x</code> (<code>floor</code>), the smallest key not below
  <code>x</code> (<code>ceiling</code>), how many keys are smaller
  (<code>rank</code>), all keys in a range. JavaScript does not have one.
  <code>Set</code> and <code>Map</code> are hash containers that iterate in
  <em>insertion</em> order, and they hold no comparison function, so they cannot
  tell you anything about order by key. An ordered container needs a comparison
  and a different layout, usually a balanced tree, and the standard library does
  not include one. So the interview question is: which of the simpler things
  already does the job?
</p>
<table>
  <tr><th>If you need</th><th>Use</th><th>Cost</th></tr>
  <tr><td>the data sorted once, then queries</td><td>sort, then binary search (<code>lowerBound</code>)</td><td>O(n log n) once, O(log n) per query</td></tr>
  <tr><td>only the smallest or largest, with inserts and removals</td><td>a heap, with lazy deletion for removals</td><td>O(log n) per operation</td></tr>
  <tr><td>floor, ceiling or rank with occasional inserts</td><td>a sorted array kept in order with <code>splice</code></td><td>O(log n) to find, O(n) to insert or remove</td></tr>
  <tr><td>keys known in advance, many updates</td><td>compress the keys to 0..m-1 and use a Fenwick or segment tree</td><td>O(log m) per update and query</td></tr>
  <tr><td>unknown keys, many updates, and order queries</td><td>a balanced tree you write (treap, AVL), see the BST chapter</td><td>O(log n) per operation</td></tr>
</table>
<p>
  The sorted array is the one to have ready, because it is short and its
  weakness is easy to state. A search is a binary search, and an insert has to
  open a gap, which is the same O(n) shift as <code>unshift</code>. Measured
  here, inserting n values into the middle of an array by
  <code>splice</code> took 4 ms for 10,000, 115 ms for 50,000 and 579 ms for
  100,000 (inserting always at the front: 8, 358 and 1,253 ms). That is fine
  for tens of thousands of updates and a problem for hundreds of thousands.
</p>
<pre><code>class SortedList {
  #items = [];
  #compare;

  constructor(compare = (a, b) =&gt; a - b) {
    this.#compare = compare;
  }

  get size() {
    return this.#items.length;
  }

  #firstNotBefore(x) {
    let lo = 0;
    let hi = this.#items.length;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt; 1;
      if (this.#compare(this.#items[mid], x) &lt; 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  #firstAfter(x) {
    let lo = 0;
    let hi = this.#items.length;
    while (lo &lt; hi) {
      const mid = (lo + hi) &gt;&gt; 1;
      if (this.#compare(this.#items[mid], x) &lt;= 0) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  add(x) {
    this.#items.splice(this.#firstAfter(x), 0, x);
  }

  has(x) {
    const i = this.#firstNotBefore(x);
    return i &lt; this.#items.length &amp;&amp; this.#compare(this.#items[i], x) === 0;
  }

  remove(x) {
    const i = this.#firstNotBefore(x);
    if (i === this.#items.length || this.#compare(this.#items[i], x) !== 0) return false;
    this.#items.splice(i, 1);
    return true;
  }

  rank(x) {
    return this.#firstNotBefore(x);
  }

  at(i) {
    return this.#items.at(i);
  }

  floor(x) {
    return this.#items[this.#firstAfter(x) - 1];
  }

  lower(x) {
    return this.#items[this.#firstNotBefore(x) - 1];
  }

  ceiling(x) {
    return this.#items[this.#firstNotBefore(x)];
  }

  higher(x) {
    return this.#items[this.#firstAfter(x)];
  }
}</code></pre>
<pre><code>const set = new SortedList();
[5, 1, 9, 5].forEach((x) =&gt; set.add(x));
set.floor(6); <span class="c">// → 5</span>
set.ceiling(6); <span class="c">// → 9</span>
set.floor(0); <span class="c">// → undefined</span>
set.higher(9); <span class="c">// → undefined</span>
set.lower(5); <span class="c">// → 1</span>
set.rank(5); <span class="c">// → 1</span>
set.has(7); <span class="c">// → false</span>
set.remove(5); <span class="c">// → true</span>
set.size; <span class="c">// → 3</span>
set.at(-1); <span class="c">// → 9</span></code></pre>
<p class="sub">
  Two binary searches do all the work. <code>firstNotBefore</code> is the first
  position whose item is not smaller than <code>x</code>, the classic lower
  bound; <code>firstAfter</code> is the first position whose item is larger, the
  upper bound. <code>floor</code> and <code>lower</code> are the item just before
  one of those, and <code>ceiling</code> and <code>higher</code> the item at
  it. <code>add</code> inserts after equal items, so the list is a multiset, and
  <code>remove</code> takes out one copy. Both searches return the length when
  nothing qualifies, which is why reading one past the end gives
  <code>undefined</code> and not an error. The list was checked against
  brute-force scans on random operations.
</p>
<div class="say">
  <span class="ttl">Say it like this →</span> "JavaScript has no ordered set, so
  I'll keep a sorted array and binary search it for floor and ceiling. Insert is
  O(n) because of the splice shift, which is fine at this size. If there were
  hundreds of thousands of updates I'd switch to coordinate compression with a
  Fenwick tree, or write a balanced tree."
</div>

<h3>Destructuring, swaps and loops: small idioms with sharp edges</h3>
<p>
  The swap <code>[a[i], a[j]] = [a[j], a[i]]</code> builds a two-element array
  on the right, then assigns from it, so both values are read before either is
  written. It is the idiom for in-place algorithms, and it is correct when
  <code>i === j</code>.
</p>
<pre><code>const arr = [10, 20];
[arr[0], arr[1]] = [arr[1], arr[0]];
arr; <span class="c">// → [ 20, 10 ]</span>
const [first, ...rest] = [1, 2, 3];
rest; <span class="c">// → [ 2, 3 ]</span>
[...["a", "b"].entries()]; <span class="c">// → [ [ 0, 'a' ], [ 1, 'b' ] ]</span>
const out = [];
for (const i in ["a", "b"]) out.push(i + 1);
out; <span class="c">// → [ '01', '11' ]</span>
[1, 2, 3].reduce((a, b) =&gt; a + b, 0); <span class="c">// → 6</span>
[].reduce((a, b) =&gt; a + b); <span class="c">// → TypeError: Reduce of empty array with no initial value</span>
eval("let i = 0, j = 1\\nconst a = [10, 20]\\n[a[i], a[j]] = [a[j], a[i]]"); <span class="c">// → ReferenceError: Cannot access 'a' before initialization</span></code></pre>
<ul>
  <li><b>Rest copies.</b> <code>const [head, ...rest] = list</code> and
    <code>list.slice(1)</code> both copy the tail. A recursion that peels one
    element off the front at every level copies n, n-1, n-2, ... elements, which
    is O(n²). Pass an index instead.</li>
  <li><b><code>for...in</code> on an array gives string indexes</b>, so
    <code>i + 1</code> is string glue. Use <code>for...of</code>, or a plain
    index loop, or <code>entries()</code> when you need both.</li>
  <li><b><code>forEach</code> cannot stop early</b>; a <code>return</code> inside
    only skips to the next item, and <code>break</code> is a syntax error. Use
    <code>for...of</code>, or <code>some</code> and <code>every</code> to stop
    on a condition.</li>
  <li><b><code>reduce</code> without an initial value</b> throws on an empty
    array and uses the first element as the start otherwise. Pass the
    initial value.</li>
  <li><b>A line starting with <code>[</code> or <code>(</code></b> continues the
    previous line when that line has no semicolon. The last line above shows what
    happens to a swap written in a no-semicolon style. Either end every statement
    with a semicolon or put one before such a line.</li>
</ul>

<h3>Reading input and writing output fast</h3>
<p>
  Interview platforms usually give you a function to complete, and none of this
  matters. Contest-style judges give you standard input and expect standard
  output, and two habits decide whether you finish in time: read everything at
  once, and print once.
</p>
<pre><code>const lines = require("fs").readFileSync(0, "utf8").split("\\n");
const [n, k] = lines[0].split(" ").map(Number);
const values = lines[1].split(" ").map(Number);
console.log(values.reduce((a, b) =&gt; a + b, 0));</code></pre>
<p>
  Fed the two lines <code>3 2</code> and <code>10 20 30</code> on standard input,
  this prints 60. Three details of the input text: the text ends with a newline,
  so <code>split("\\n")</code> leaves an empty string as the last element; on a
  platform that ends lines with <code>\\r\\n</code> every line keeps a trailing
  <code>"\\r"</code>, which <code>Number("5\\r")</code> forgives (it gives 5) but
  <code>"5\\r" === "5"</code> does not (it gives false), so call
  <code>trim()</code> before comparing strings; and a list of numbers is
  <code>split(" ").map(Number)</code>, not <code>map(parseInt)</code>.
</p>
<p>
  For output, one <code>console.log</code> per line is a separate write each
  time. Printing 300,000 lines one call at a time took about 1,000 ms to a file
  and 500 ms through a pipe, and building an array of the lines, then printing
  <code>out.join("\\n")</code> once, took 25 ms for the same text. Collect the
  output in an array and print it once at the end.
</p>

<h3>Recognizing it in an unseen problem</h3>
<p>
  This chapter does not describe a pattern, so recognition works the other way
  round: a symptom in your own solution points at the toolkit entry that fixes
  it.
</p>
<table>
  <tr><th>You notice</th><th>Likely cause</th><th>Fix</th></tr>
  <tr><td>Fine on the samples, too slow on the large test, and the code has <code>shift</code>, <code>unshift</code>, <code>splice</code>, <code>concat</code> or a spread inside a loop</td><td>a hidden O(n) per iteration</td><td>head index, deque, <code>push</code> and <code>pop</code> with undo, or a Set</td></tr>
  <tr><td>Numbers come out sorted as 1, 10, 2</td><td>default <code>sort()</code></td><td>comparator <code>(a, b) =&gt; a - b</code></td></tr>
  <tr><td>Answers are wrong only when numbers are large, and no error appears</td><td>a product or sum past 2<sup>53</sup></td><td>BigInt for the product, or reduce before multiplying</td></tr>
  <tr><td>Wrong only for negative inputs</td><td><code>%</code> or <code>|</code> on negatives, <code>n % 2 === 1</code></td><td><code>((x % m) + m) % m</code>, <code>n &amp; 1</code></td></tr>
  <tr><td>A bitmask or shift breaks at 31 or 32 items</td><td>the 32-bit signed window</td><td><code>2 ** k</code> arithmetic, or BigInt</td></tr>
  <tr><td>"Maximum call stack size exceeded" on a long chain</td><td>recursion depth</td><td>an explicit stack or a loop</td></tr>
  <tr><td>Editing one row of a grid edits all rows</td><td><code>fill([])</code> shares one array</td><td><code>Array.from</code> with a callback</td></tr>
  <tr><td>A visited set of pairs never matches</td><td>array keys compare by identity</td><td>a string key with a delimiter, or <code>r * cols + c</code></td></tr>
  <tr><td>Counts are wrong for a word like "constructor"</td><td>a plain object as a map</td><td><code>Map</code></td></tr>
  <tr><td>The problem asks for the next larger or smaller key, or a rank, and keys change</td><td>an ordered set is wanted</td><td><code>SortedList</code>, or a tree</td></tr>
  <tr><td>"Repeatedly take the smallest" or "k largest"</td><td>a priority queue is wanted</td><td><code>Heap</code></td></tr>
</table>
<p class="sub">
  Related chapters: <a href="/dsa/dsa-hashing">hashing</a> builds on the
  <code>Map</code> and <code>Set</code> rules,
  <a href="/dsa/dsa-stacks-queues">stacks and queues</a> and
  <a href="/dsa/dsa-linked-lists">linked lists</a> use the head index and the
  deque, <a href="/dsa/dsa-heaps-priority-queues">heaps</a> explains the heap
  above, and <a href="/dsa/dsa-bit-manipulation">bit manipulation</a> builds on
  the 32-bit window.
</p>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why a queue built on <code>shift()</code> is O(n²) for n dequeues, and write the head-index loop for a breadth-first search from memory.</li>
    <li>Predict what <code>[10, 2, 1].sort()</code> returns and why, then write the comparators for ascending numbers, descending numbers, strings and pairs, and say what stability guarantees.</li>
    <li>State what makes two keys equal in a <code>Map</code>, and turn a <code>[row, col]</code> pair into a key without a collision.</li>
    <li>Say what the safe integer range is, show a product that silently loses digits, and fix it with BigInt.</li>
    <li>Explain what <code>1 &lt;&lt; 31</code>, <code>-1 &gt;&gt;&gt; 0</code> and <code>(lo + hi) &gt;&gt; 1</code> give and why the 32-bit window causes it.</li>
    <li>Explain why recursion fails near ten thousand frames and convert a depth-first search to an explicit stack.</li>
    <li>Write the heap, the ring-buffer deque and the sorted-array ordered set from memory, with their costs, and say what you would use instead at a hundred thousand updates.</li>
  </ul>
</div>`,
};
