import type { Chapter } from "../types";

export const dsaStacksQueues: Chapter = {
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
};
