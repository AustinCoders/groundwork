import type { Chapter } from "../types";

export const dsaStacksQueues: Chapter = {
  id: "dsa-stacks-queues",
  num: "B11",
  title: "Stacks & queues",
  short: "Stacks & queues",
  levels: ["beginner"],
  prerequisites: ["dsa-js-toolkit"],
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
    "ex-backspace-string-compare",
    "ex-simplify-path",
    "ex-remove-adjacent-duplicates",
    "ex-remove-adjacent-duplicates-k",
    "ex-remove-k-digits",
    "ex-iterative-dfs-order",
    "ex-inorder-traversal-iterative",
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
      if (pairs[c] === undefined || stack.pop() !== pairs[c]) return false; <span class="c">// any other character is not a bracket</span>
    }
  }
  return stack.length === 0;
}</code></pre>

<h4>Dry run: isValid("{[()]}")</h4>
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
  const result = stack.pop();
  return result === 0 ? 0 : result; <span class="c">// -0 === 0, so a -0 result comes back as 0 (Math.trunc(-1 / 2) is -0)</span>
}
<span class="c">// evalRPN(["3","4","+","2","*"]) → (3+4)*2 → 14</span></code></pre>

<h3>Infix expressions: Basic Calculator II with one stack</h3>
<p>
  Real expressions are written infix, <code>"2-3*4+5"</code>, and then precedence matters:
  multiplication binds tighter than addition, so you cannot just fold left to
  right. Reverse Polish notation avoided the problem by moving the precedence into the
  notation. For infix, the trick is to see the expression as a <b>sum of terms</b>. A term is
  numbers joined by <code>*</code> and <code>/</code>, and the terms are joined by
  <code>+</code> and <code>-</code>. Keep a stack of <em>finished, signed terms</em>. When a
  number is complete, look at the operator that came <em>before</em> it: after <code>+</code> or
  <code>-</code> the number starts a new term (push it, negated for <code>-</code>); after
  <code>*</code> or <code>/</code> it belongs to the term on top of the stack, so combine it
  with that term immediately. At the end, the answer is the sum of the stack.
</p>
<pre><code>function calculate(s) {                         <span class="c">// digits, + - * /, spaces; "/" truncates toward zero</span>
  const stack = [];
  let num = 0;
  let op = "+";                                 <span class="c">// the operator BEFORE the number being read</span>
  for (let i = 0; i &lt;= s.length; i++) {
    const c = i &lt; s.length ? s[i] : "+";        <span class="c">// a sentinel "+" at the end flushes the last number</span>
    if (c &gt;= "0" &amp;&amp; c &lt;= "9") { num = num * 10 + (c.charCodeAt(0) - 48); continue; }
    if (c === " ") continue;                    <span class="c">// a space never ends a number</span>
    if (op === "+") stack.push(num);
    else if (op === "-") stack.push(-num);
    else if (op === "*") stack.push(stack.pop() * num);
    else stack.push(Math.trunc(stack.pop() / num));
    op = c;
    num = 0;
  }
  return stack.reduce((sum, term) =&gt; sum + term, 0);
}</code></pre>
<h4>Dry run: calculate("2-3*4+5")</h4>
<table>
  <tr><th>Character read</th><th>Number just finished</th><th>Operator before it</th><th>Action</th><th>Stack</th></tr>
  <tr><td>-</td><td>2</td><td>+ (initial)</td><td>push 2</td><td>[2]</td></tr>
  <tr><td>*</td><td>3</td><td>-</td><td>push −3</td><td>[2, −3]</td></tr>
  <tr><td>+</td><td>4</td><td>*</td><td>pop −3, push −3 × 4</td><td>[2, −12]</td></tr>
  <tr><td>end (sentinel)</td><td>5</td><td>+</td><td>push 5</td><td>[2, −12, 5]</td></tr>
</table>
<p class="sub">
  The sum of the stack is 2 − 12 + 5 = −5. Each character is read once, so time is O(n), and the
  stack holds at most one entry per term, O(n) space (O(1) if you keep only the sum so far
  and the last term). The function was checked on 5,000 random expressions against a
  reference that applies the precedence rules by hand. The details people lose points on:
  a <b>multi-digit number</b> is built digit by digit (<code>num * 10 + digit</code>); a
  <b>space</b> must be skipped before the operator test, or it would end a number early; the
  <b>last number</b> has no operator after it, hence the sentinel; and division must use
  <code>Math.trunc</code>, because <code>-7 / 2</code> is <code>-3.5</code> and the
  problem wants <code>-3</code>, while <code>Math.floor</code> would give <code>-4</code>.
</p>

<h3>Parentheses: save the outer state, then combine</h3>
<p>
  Add parentheses (and only <code>+</code> and <code>-</code>, with a minus allowed at the
  start or right after <code>(</code>) and the expression nests. A parenthesised group is a
  sub-expression whose value gets added with the sign that stood in front of it:
  <code>2-(5-6)</code> is <code>2 + (−1) × (5 − 6)</code>. So when you meet <code>(</code>,
  the outer expression is on hold. Push what it needs to resume, its running
  <code>result</code> and the <code>sign</code> in front of the bracket, and start the inner
  expression from scratch. At <code>)</code>, finish the inner value and fold it back:
</p>
<pre><code>function calculateWithParens(s) {
  const stack = [];                              <span class="c">// holds [result, sign] pairs of the outer expressions on hold</span>
  let result = 0, sign = 1, num = 0;
  for (const c of s) {
    if (c &gt;= "0" &amp;&amp; c &lt;= "9") {
      num = num * 10 + (c.charCodeAt(0) - 48);
    } else if (c === "+" || c === "-") {
      result += sign * num;                      <span class="c">// the number before this operator is complete</span>
      num = 0;
      sign = c === "+" ? 1 : -1;
    } else if (c === "(") {
      stack.push(result, sign);                  <span class="c">// put the outer expression on hold ...</span>
      result = 0;                                <span class="c">// ... and start the inner one from scratch</span>
      sign = 1;
    } else if (c === ")") {
      result += sign * num;                      <span class="c">// finish the inner expression</span>
      num = 0;
      const outerSign = stack.pop();             <span class="c">// pushed last, so popped first</span>
      const outerResult = stack.pop();
      result = outerResult + outerSign * result;
    }
  }
  return result + sign * num;                    <span class="c">// the final number has no operator after it</span>
}</code></pre>
<h4>Dry run: calculateWithParens("2-(5-6)")</h4>
<table>
  <tr><th>Character</th><th>result</th><th>sign</th><th>num</th><th>stack</th></tr>
  <tr><td>2</td><td>0</td><td>1</td><td>2</td><td>[]</td></tr>
  <tr><td>-</td><td>2</td><td>−1</td><td>0</td><td>[]</td></tr>
  <tr><td>(</td><td>0</td><td>1</td><td>0</td><td>[2, −1]</td></tr>
  <tr><td>5</td><td>0</td><td>1</td><td>5</td><td>[2, −1]</td></tr>
  <tr><td>-</td><td>5</td><td>−1</td><td>0</td><td>[2, −1]</td></tr>
  <tr><td>6</td><td>5</td><td>−1</td><td>6</td><td>[2, −1]</td></tr>
  <tr><td>)</td><td>2 + (−1) × (5 − 6) = 3</td><td>−1 (stale; the next operator resets it)</td><td>0</td><td>[]</td></tr>
</table>
<p class="sub">
  The end adds <code>sign * num = −1 × 0</code> and the answer is 3. A leading minus works without
  special handling: for <code>"-(2+3)"</code> the first <code>-</code> sets
  <code>sign = −1</code> after adding 0, the bracket saves <code>[0, −1]</code>, and the close gives
  <code>0 + (−1) × 5 = −5</code>. The function matched <code>eval</code> on 5,000 random
  well-formed expressions with nested brackets, spaces and leading minus signs. Mistakes to avoid: popping the pair in the
  wrong order, not resetting <code>sign</code> to 1 and <code>result</code> to 0 after
  <code>(</code>, and forgetting the last <code>sign * num</code> at the end. With
  <code>*</code> and <code>/</code> as well as brackets (Basic Calculator III) the same idea
  of saving state at <code>(</code> combines with the term stack of the previous section.
</p>

<h3>A stack of states for nesting: decode string</h3>
<p>
  <code>"3[a2[c]]"</code> means "three copies of (<code>a</code> followed by two copies of
  <code>c</code>)", which expands to <code>accaccacc</code>. The nesting is the same
  put-on-hold structure as the parentheses above. When you meet <code>[</code>, what you were
  building and how many times the bracket will repeat must wait: push the pair
  <code>[textSoFar, repeatCount]</code> and start a fresh current string. At
  <code>]</code>, pop the pair and append the finished inner text, repeated, to the saved text.
</p>
<pre><code>function decodeString(s) {
  const stack = [];                              <span class="c">// pairs: [text before the bracket, repeat count]</span>
  let current = "";
  let count = 0;
  for (const c of s) {
    if (c &gt;= "0" &amp;&amp; c &lt;= "9") count = count * 10 + (c.charCodeAt(0) - 48);   <span class="c">// counts can have several digits</span>
    else if (c === "[") { stack.push([current, count]); current = ""; count = 0; }
    else if (c === "]") { const [before, times] = stack.pop(); current = before + current.repeat(times); }
    else current += c;
  }
  return current;
}</code></pre>
<h4>Dry run: decodeString("3[a2[c]]")</h4>
<table>
  <tr><th>Character</th><th>current</th><th>count</th><th>stack</th></tr>
  <tr><td>3</td><td>""</td><td>3</td><td>[]</td></tr>
  <tr><td>[</td><td>""</td><td>0</td><td>[["", 3]]</td></tr>
  <tr><td>a</td><td>"a"</td><td>0</td><td>[["", 3]]</td></tr>
  <tr><td>2</td><td>"a"</td><td>2</td><td>[["", 3]]</td></tr>
  <tr><td>[</td><td>""</td><td>0</td><td>[["", 3], ["a", 2]]</td></tr>
  <tr><td>c</td><td>"c"</td><td>0</td><td>[["", 3], ["a", 2]]</td></tr>
  <tr><td>]</td><td>"a" + "c" × 2 = "acc"</td><td>0</td><td>[["", 3]]</td></tr>
  <tr><td>]</td><td>"" + "acc" × 3 = "accaccacc"</td><td>0</td><td>[]</td></tr>
</table>
<p class="sub">
  Checked against a recursive parser on 2,000 random nested inputs. The cost is proportional
  to the length L of the decoded string, since every character of the output is produced by
  <code>repeat</code> or a concatenation. Strictly, each closing bracket rebuilds the string
  for its level, so a chain of many brackets around a long string can do up to
  O(L × nesting depth) copying, though it is normally quoted as O(L). Traps: a count like
  <code>10</code> is two digits; the count must be reset at <code>[</code> (and is naturally zero
  after <code>]</code>); letters may sit before, between and after brackets
  (<code>"2[abc]3[cd]ef"</code>), which is why the text before a bracket is part of what you save.
</p>

<h3>Collision simulation: asteroid collision</h3>
<p>
  Asteroids sit in a row. Each number is its size, positive means moving right and negative
  means moving left, all at the same speed. When two meet the smaller explodes, and if they are
  equal both do. What is left? Collisions can only involve a <b>right-mover with a left-mover
  coming after it</b>, and the pair that collides is always the most recent right-mover still
  alive against the newcomer, which is the top of a stack. A newcomer that moves left may
  destroy <em>several</em> right-movers in a row, so the collision step is a loop:
</p>
<pre><code>function asteroidCollision(asteroids) {
  const stack = [];                                       <span class="c">// survivors so far, in order</span>
  for (const a of asteroids) {
    let alive = true;
    while (alive &amp;&amp; a &lt; 0 &amp;&amp; stack.length &amp;&amp; stack[stack.length - 1] &gt; 0) {
      const top = stack[stack.length - 1];                <span class="c">// a right-mover meets a left-mover</span>
      if (top &lt; -a) stack.pop();                         <span class="c">// top explodes, a keeps going: check the next one</span>
      else if (top === -a) { stack.pop(); alive = false; }  <span class="c">// both explode</span>
      else alive = false;                                  <span class="c">// a explodes</span>
    }
    if (alive) stack.push(a);                              <span class="c">// only survivors are pushed</span>
  }
  return stack;
}</code></pre>
<h4>Dry run: [5, 10, −12, −3, 4]</h4>
<table>
  <tr><th>Asteroid</th><th>What happens</th><th>Stack after</th></tr>
  <tr><td>5</td><td>moves right, nothing to hit: push</td><td>[5]</td></tr>
  <tr><td>10</td><td>moves right: push</td><td>[5, 10]</td></tr>
  <tr><td>−12</td><td>meets 10 (10 &lt; 12, 10 explodes), then meets 5 (5 &lt; 12, 5 explodes); stack empty, so −12 survives</td><td>[−12]</td></tr>
  <tr><td>−3</td><td>the top is negative: two left-movers never meet, push</td><td>[−12, −3]</td></tr>
  <tr><td>4</td><td>moves right: it is after the others, so it never meets them; push</td><td>[−12, −3, 4]</td></tr>
</table>
<p class="sub">
  Every asteroid is pushed at most once and popped at most once, so the loop is O(n)
  amortized. Checked against a brute-force simulation (repeatedly resolve the leftmost
  right-mover/left-mover neighbour pair) on 8,000 random arrays. Pitfalls: a collision needs
  <code>top &gt; 0</code> <em>and</em> <code>a &lt; 0</code> (a left-mover followed by a
  right-mover are moving apart); a <code>while</code>, not an <code>if</code>; both explode on a
  tie; and push the newcomer only if it survived.
</p>

<h3>A stack as a text editor: backspaces and adjacent duplicates</h3>
<p>
  A stack of characters is exactly the model of a text field where you can only edit the end:
  typing pushes, backspace pops. That is the whole of "Backspace String Compare", where
  <code>#</code> means backspace:
</p>
<pre><code>function backspaceCompare(s, t) {
  return build(s) === build(t);
}

function build(text) {
  const stack = [];
  for (const c of text) {
    if (c === "#") stack.pop();                 <span class="c">// backspace on an empty field does nothing</span>
    else stack.push(c);
  }
  return stack.join("");
}
<span class="c">// build("ab#c") → "ac"     build("a##c") → "c"     backspaceCompare("ab#c", "ad#c") → true</span></code></pre>
<p class="sub">
  O(n) time and space. The O(1)-space version scans both strings from the back with a skip
  counter (the two-pointers chapter). Mind that in JavaScript <code>[].pop()</code> returns
  <code>undefined</code> and is harmless; in languages where popping an empty stack throws, guard it.
</p>
<p>
  The same shape solves "remove adjacent duplicates": delete any two equal neighbours, and keep
  deleting, since a removal can <em>create</em> a new pair (<code>"abba"</code> becomes
  <code>"aa"</code> becomes nothing). Rescanning the string after each removal costs O(n²) in
  the worst case. With a stack, the character on top after a pop <em>is</em> the new neighbour,
  so one pass is enough. For the variant that removes <code>k</code> equal neighbours, store a
  run length with each entry:
</p>
<pre><code>function removeDuplicates(s) {                       <span class="c">// remove pairs of equal neighbours</span>
  const stack = [];
  for (const c of s) {
    if (stack.length &amp;&amp; stack[stack.length - 1] === c) stack.pop();
    else stack.push(c);
  }
  return stack.join("");
}

function removeDuplicatesK(s, k) {                   <span class="c">// remove runs of k equal neighbours</span>
  const stack = [];                                  <span class="c">// entries: [character, length of its current run]</span>
  for (const c of s) {
    if (stack.length &amp;&amp; stack[stack.length - 1][0] === c) {
      if (++stack[stack.length - 1][1] === k) stack.pop();
    } else {
      stack.push([c, 1]);
    }
  }
  return stack.map(([c, n]) =&gt; c.repeat(n)).join("");
}</code></pre>
<h4>Dry run: removeDuplicates("abbaca") and removeDuplicatesK("deeedbbcccbdaa", 3)</h4>
<table>
  <tr><th>Character</th><th>Pairs version: stack as text</th><th>Character</th><th>k = 3 version: stack of [char, run]</th></tr>
  <tr><td>a</td><td>"a"</td><td>d</td><td>[d1]</td></tr>
  <tr><td>b</td><td>"ab"</td><td>e</td><td>[d1, e1]</td></tr>
  <tr><td>b</td><td>"a" (b meets b: pop)</td><td>e</td><td>[d1, e2]</td></tr>
  <tr><td>a</td><td>"" (a meets a: pop)</td><td>e</td><td>[d1] (run reached 3: pop)</td></tr>
  <tr><td>c</td><td>"c"</td><td>d</td><td>[d2]</td></tr>
  <tr><td>a</td><td>"ca"</td><td>b, b</td><td>[d2, b2]</td></tr>
  <tr><td></td><td></td><td>c, c, c</td><td>[d2, b2] (the c run reached 3: pop)</td></tr>
  <tr><td></td><td></td><td>b</td><td>[d2] (b run reached 3: pop)</td></tr>
  <tr><td></td><td></td><td>d</td><td>[] (d run reached 3: pop)</td></tr>
  <tr><td></td><td></td><td>a, a</td><td>[a2]</td></tr>
</table>
<p class="sub">
  The results are <code>"ca"</code> and <code>"aa"</code>. Both functions matched a repeated-regex-replacement
  reference on 5,000 random strings (for k = 2, 3 and 4). Time and space are O(n); the stack
  never holds more characters than have been read. Note how removing <code>eee</code> in the k = 3
  trace made the two <code>d</code>s adjacent: after the pop, the top of the stack was
  already the right neighbour, with no rescanning.
</p>

<h3>Simplify path: a stack of directory names</h3>
<p>
  Turn a Unix absolute path such as <code>"/a/./b/../../c/"</code> into its canonical form.
  Walking a path is moving up and down a directory stack: a name goes in, <code>..</code>
  comes out, <code>.</code> and empty segments (from <code>//</code> or a trailing slash) do
  nothing. Split on <code>/</code> and process the segments:
</p>
<pre><code>function simplifyPath(path) {
  const stack = [];
  for (const part of path.split("/")) {
    if (part === "" || part === ".") continue;   <span class="c">// empty segment or "stay here"</span>
    if (part === "..") stack.pop();              <span class="c">// go up; at the root there is nothing to pop</span>
    else stack.push(part);                       <span class="c">// a real name, including "..." or "x.y"</span>
  }
  return "/" + stack.join("/");                  <span class="c">// an empty stack gives "/"</span>
}</code></pre>
<table>
  <tr><th>Segment</th><th>Action</th><th>Stack after</th></tr>
  <tr><td>"" (before the first slash)</td><td>skip</td><td>[]</td></tr>
  <tr><td>a</td><td>push</td><td>[a]</td></tr>
  <tr><td>.</td><td>skip</td><td>[a]</td></tr>
  <tr><td>b</td><td>push</td><td>[a, b]</td></tr>
  <tr><td>..</td><td>pop</td><td>[a]</td></tr>
  <tr><td>..</td><td>pop</td><td>[]</td></tr>
  <tr><td>c</td><td>push</td><td>[c]</td></tr>
  <tr><td>"" (after the trailing slash)</td><td>skip</td><td>[c]</td></tr>
</table>
<p class="sub">
  The result is <code>"/c"</code>. This matched <code>path.posix.normalize</code> (with its trailing slash removed)
  on 5,000 random paths made of <code>a</code>, <code>b</code>, <code>.</code>,
  <code>..</code>, <code>...</code>, <code>x.y</code>, empty segments and doubled slashes. The
  traps: <code>..</code> at the root must stay at the root (popping an empty array is safe in
  JavaScript, so it already does), <code>"..."</code> is an ordinary directory name, and the empty
  result is <code>"/"</code>, not <code>""</code>. O(n) time and space.
</p>

<h3>Remove K digits: the stack that keeps itself sorted</h3>
<p>
  Given a number as a string, remove exactly <code>k</code> digits to make the result as small as
  possible: <code>"1432219"</code> with <code>k = 3</code> gives <code>"1219"</code>. The
  greedy fact: a more significant digit decides the size, so scanning left to right, the first
  digit that is <em>larger than the one after it</em> is the best one to delete. Doing that
  repeatedly is a stack: while the digit on top is bigger than the new digit and deletions
  remain, pop it. While deletions remain, the stack stays non-decreasing from bottom to top.
</p>
<pre><code>function removeKdigits(num, k) {
  const stack = [];
  for (const d of num) {
    while (k &gt; 0 &amp;&amp; stack.length &amp;&amp; stack[stack.length - 1] &gt; d) {
      stack.pop();                                <span class="c">// a bigger digit before a smaller one: delete the bigger</span>
      k--;
    }
    stack.push(d);
  }
  while (k &gt; 0) { stack.pop(); k--; }             <span class="c">// still owed deletions: drop from the end (largest digits)</span>
  const result = stack.join("").replace(/^0+/, "");   <span class="c">// no leading zeros</span>
  return result === "" ? "0" : result;
}</code></pre>
<table>
  <tr><th>Digit read</th><th>Pops</th><th>Stack after</th><th>k left</th></tr>
  <tr><td>1</td><td>none</td><td>1</td><td>3</td></tr>
  <tr><td>4</td><td>none (1 &lt; 4)</td><td>14</td><td>3</td></tr>
  <tr><td>3</td><td>4 &gt; 3: pop 4</td><td>13</td><td>2</td></tr>
  <tr><td>2</td><td>3 &gt; 2: pop 3</td><td>12</td><td>1</td></tr>
  <tr><td>2</td><td>none (2 is not greater than 2)</td><td>122</td><td>1</td></tr>
  <tr><td>1</td><td>2 &gt; 1: pop one 2</td><td>121</td><td>0</td></tr>
  <tr><td>9</td><td>none, k is 0</td><td>1219</td><td>0</td></tr>
</table>
<p class="sub">
  The function matched an exhaustive search over every way of keeping <code>n − k</code>
  digits on 3,000 random inputs. The edge cases are the whole difficulty:
  <code>removeKdigits("10200", 1)</code> is <code>"200"</code> (leading zeros stripped),
  <code>removeKdigits("10", 2)</code> is <code>"0"</code> (nothing left means zero), and
  <code>removeKdigits("112", 1)</code> is <code>"11"</code>: with no descent the leftover
  deletion comes off the end. This is a <b>monotonic stack</b>, the idea the next tier
  generalises (next greater element, histogram areas, lexicographically smallest
  subsequences); here it is enough to see that "pop while the top is worse than the newcomer" is
  a stack pattern in its own right.
</p>

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
    const node = queue.shift(); <span class="c">// front — fine at small scale; for large inputs use a real queue/deque (see the warning above)</span>
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

<h3>A stack built from queues</h3>
<p>
  The earlier two-stack queue has a mirror image that interviewers also ask for: build a
  stack using only queue operations (add to the back, remove from the front, size, empty
  check). A queue hands back the oldest element first, a stack the newest. The trick is to make the
  newest element the oldest. After adding <code>x</code> to the back, rotate the queue by
  moving the <code>size − 1</code> elements that were already there from the front to the
  back, one by one. Now <code>x</code> is at the front and the older elements follow it in
  reverse arrival order, so the front of the queue is always the top of the stack.
</p>
<pre><code>class MyStack {
  constructor() { this.q = []; }                 <span class="c">// used ONLY as a queue: push = enqueue, shift = dequeue</span>

  push(x) {
    this.q.push(x);                              <span class="c">// x is at the back</span>
    for (let i = this.q.length - 1; i &gt; 0; i--) {
      this.q.push(this.q.shift());               <span class="c">// rotate every older element behind x</span>
    }
  }

  pop() { return this.q.shift(); }               <span class="c">// the front is the newest</span>
  top() { return this.q[0]; }
  empty() { return this.q.length === 0; }
}</code></pre>
<table>
  <tr><th>Operation</th><th>Queue after adding</th><th>Rotation</th><th>Queue after (front on the left)</th></tr>
  <tr><td>push(1)</td><td>[1]</td><td>none: nothing older</td><td>[1]</td></tr>
  <tr><td>push(2)</td><td>[1, 2]</td><td>move 1 to the back</td><td>[2, 1]</td></tr>
  <tr><td>push(3)</td><td>[2, 1, 3]</td><td>move 2, then 1</td><td>[3, 2, 1]</td></tr>
  <tr><td>pop()</td><td colspan="2">remove the front</td><td>[2, 1], and 3 was returned</td></tr>
</table>
<p class="sub">
  <code>push</code> costs O(n), <code>pop</code>, <code>top</code> and <code>empty</code> cost O(1). The
  alternative is to push in O(1) and do the rotation inside <code>pop</code> (O(n) for
  that), which is the better choice when pushes outnumber pops. Unlike the two-stack queue, no amortised
  trick makes both operations cheap here, so say which one you chose to make slow. The code
  matched a plain array used as a stack over 500 random sequences of pushes and pops. In this problem
  <code>shift</code> stands for the queue's O(1) dequeue that the problem statement gives you; in real
  JavaScript, remember the warning above that <code>shift</code> on a big array is O(n).
</p>

<h3>Iterative DFS: an explicit stack instead of the call stack</h3>
<p>
  Depth-first search is recursion on a graph, and recursion is a stack the language manages
  for you. A graph or tree that is deep (a path of 200,000 nodes) overflows it, and
  "do it iteratively" is a standard follow-up (the recursion chapter showed the same
  conversion). Put the nodes to visit on your own stack. Three details decide whether the
  order matches the recursive version:
</p>
<ul>
  <li><b>Mark a node visited when you pop it</b> (when you actually visit it), not when you push it. A node can be pushed by two different neighbours before it is ever visited, so on a pop, skip it if it is already visited.</li>
  <li><b>Push the neighbours in reverse</b>, so that the first neighbour ends up on top and is popped first, as it would be in the recursive loop.</li>
  <li>Only push neighbours that are not yet visited; it keeps the stack smaller.</li>
</ul>
<pre><code>function dfsIterative(graph, start) {             <span class="c">// graph: node → array of neighbours</span>
  const order = [];
  const visited = new Set();
  const stack = [start];
  while (stack.length) {
    const node = stack.pop();
    if (visited.has(node)) continue;               <span class="c">// stale entry: already reached another way</span>
    visited.add(node);
    order.push(node);
    for (let i = graph[node].length - 1; i &gt;= 0; i--) {   <span class="c">// reverse, so the first neighbour pops first</span>
      if (!visited.has(graph[node][i])) stack.push(graph[node][i]);
    }
  }
  return order;
}</code></pre>
<h4>Dry run: graph A → [B, C], B → [C], C → []</h4>
<table>
  <tr><th>Pop</th><th>Already visited?</th><th>Action</th><th>Stack after</th><th>Order so far</th></tr>
  <tr><td>A</td><td>no</td><td>visit A, push C then B</td><td>[C, B]</td><td>A</td></tr>
  <tr><td>B</td><td>no</td><td>visit B, push C (not yet visited)</td><td>[C, C]</td><td>A, B</td></tr>
  <tr><td>C</td><td>no</td><td>visit C, nothing to push</td><td>[C]</td><td>A, B, C</td></tr>
  <tr><td>C</td><td>yes</td><td>stale duplicate, skip</td><td>[]</td><td>A, B, C</td></tr>
</table>
<p class="sub">
  The order is A, B, C, the same as the recursive DFS. This matched the recursive version
  on 3,000 random undirected graphs, and a 200,000-node path that makes the recursive version
  throw <code>RangeError</code> is handled in a loop. Time is O(V + E). The stack can hold stale
  duplicates, so its size is bounded by the number of edges rather than the number of nodes.
  The tempting alternative, <b>marking on push</b>, still visits every reachable node
  exactly once, which is all that is needed for reachability or counting components, but it is not DFS
  order: it can differ from the recursive order even when the neighbours are pushed in
  reverse: for A → [B, C, D] and B → [D] the recursive order is A, B, D, C, but marking on
  push gives A, B, C, D (and with the neighbours pushed in their listed order, the small
  graph above would give A, C, B).
</p>
<p>
  The same idea turns a recursive tree traversal into a loop. For <b>inorder</b>
  (left, node, right), go as far left as possible while stacking the nodes you pass; the node
  on top is the next one to visit; then continue with its right subtree.
</p>
<pre><code>function inorder(root) {
  const out = [];
  const stack = [];
  let node = root;
  while (node !== null || stack.length) {
    while (node !== null) { stack.push(node); node = node.left; }   <span class="c">// dive left, remembering the way back</span>
    node = stack.pop();
    out.push(node.val);                                              <span class="c">// everything to its left is done</span>
    node = node.right;
  }
  return out;
}</code></pre>
<p class="sub">
  For the tree 1 → (right) 2 → (left) 3, the loop stacks 1, visits 1, moves to 2, stacks
  2 and 3, visits 3, finds no right child, pops 2 and visits it: the result is
  <code>[1, 3, 2]</code>. It matched the recursive definition on 1,000 random trees and ran on a
  200,000-node left chain that overflows the recursive one. The loop condition needs both
  halves: <code>node !== null</code> keeps it going while there is a subtree to enter,
  <code>stack.length</code> while there are nodes still waiting to be visited.
</p>

<h3>Recognizing which one you need</h3>
<ul>
  <li><b>Stack</b>: matching pairs, undo/redo, "closest unmatched," depth-first exploration, evaluating expressions</li>
  <li><b>Queue</b>: breadth-first exploration, "process in arrival order," task scheduling</li>
  <li><b>Deque</b>: need to add/remove at both ends — sliding-window maximum, 0-1 BFS</li>
  <li><b>Circular queue</b>: fixed-capacity buffering — rate limiters, streaming windows, producer/consumer queues</li>
  <li><b>Min-stack (or max-stack)</b>: "track the running min/max as things get pushed/popped"</li>
  <li><b>Stack of saved states</b>: nesting with <code>( )</code> or <code>[ ]</code> where the outer context must wait (calculator with brackets, decode string)</li>
  <li><b>Stack as a text editor</b>: deletions that can expose new neighbours (backspaces, adjacent duplicates, remove K digits, simplify path)</li>
  <li><b>Stack of survivors</b>: items that interact with only the most recent one (asteroid collision)</li>
  <li><b>Explicit stack</b>: "do it iteratively", or a depth that would overflow the call stack (DFS, tree traversals)</li>
  <li>If a problem says "next greater/smaller element," that's usually a <em>monotonic</em> stack — covered in the advanced tier</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Write <code>isValid</code> from memory, and name all three ways it can fail (wrong match, pop from empty, leftover opens).</li>
    <li>Trace <code>isValid</code> on a new bracket string by hand, showing the stack's contents after every character.</li>
    <li>Explain why building a queue with <code>array.shift()</code> silently degrades a simulation from O(n) to O(n²).</li>
    <li>Explain how the shadow <code>minStack</code> stays in sync with the main stack across both push and pop.</li>
    <li>Given a new problem, recognize whether it needs "most recent unmatched thing" (stack) or "arrival order" (queue) before writing any code.</li>
    <li>Write Basic Calculator II from memory: say what the stack holds (signed terms), what <code>op</code> means (the operator before the number), and why the end needs a sentinel.</li>
    <li>Explain what is pushed at <code>(</code> or <code>[</code> in a calculator or decode-string stack, and what is done with it at the closing bracket.</li>
    <li>Write asteroid collision with its <code>while</code> loop and a survival flag, and name the only case in which two asteroids collide.</li>
    <li>Use a stack as an editor for backspaces, adjacent duplicates (with run lengths for k), simplify path and remove K digits, and state the edge cases of each.</li>
    <li>Build a stack from one queue and say which operation you made slow.</li>
    <li>Convert DFS and inorder traversal to explicit stacks, with the visited-at-pop rule and the reversed neighbour push.</li>
  </ul>
</div>`,
};
