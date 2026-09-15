import type { Chapter } from "../types";

export const advancedAsync: Chapter = {
  id: "advanced-async",
  num: "A2",
  title: "Advanced async",
  short: "Advanced async",
  levels: ["advanced"],
  practice: ["ex-take-n", "ex-concurrency-limit"],
  ready: true,
  subtitle: "Past promises: pausable functions, streams, and running real work concurrently.",
  body: `<h3>Microtask starvation</h3>
<p>
  <a href="/notes/async-properly">The microtask queue always drains
  completely</a> before the event loop touches a macrotask — which is
  usually the right behavior, until a microtask keeps scheduling
  <em>another</em> microtask. Nothing else — not a timer, not a render,
  not user input — ever gets a turn.
</p>
<pre><code>function loopForever() {
  queueMicrotask(loopForever);   <span class="c">// each run schedules the next one before yielding</span>
}
loopForever();
<span class="c">// the page is now permanently frozen — every macrotask queued after this</span>
<span class="c">// point (clicks, timers, even rendering) waits behind an infinite microtask queue</span></code></pre>
<p>
  <code>queueMicrotask(fn)</code> schedules <code>fn</code> directly on
  that same microtask queue a resolved promise's <code>.then()</code>
  uses — the explicit version of the implicit scheduling promises do.
  Node has an even higher-priority version,
  <code>process.nextTick(fn)</code>, which drains completely before
  <em>even the microtask queue</em> gets its turn — Node-only, and easy
  to starve yourself with the same recursive pattern
  above.
</p>

<h3>Node's event loop has phases; the browser's doesn't</h3>
<p>
  Browser-side, "macrotask" is one flat queue. Node's <code>libuv</code>
  event loop is a fixed cycle of named phases, each with its own queue,
  run in order every tick: <b>timers</b> (due
  <code>setTimeout</code>/<code>setInterval</code> callbacks) →
  <b>pending callbacks</b> → <b>poll</b> (I/O — the bulk of real work)
  → <b>check</b> (<code>setImmediate</code>) → <b>close callbacks</b>,
  then back to the top. <code>setImmediate</code> is Node's own
  addition — no equivalent in the browser at all — meaning "run after
  I/O this cycle, before the next timers phase," a more precise
  guarantee than <code>setTimeout(fn, 0)</code> gives you.
</p>

<h3>Generators — functions that pause</h3>
<p>
  A <code>function*</code> doesn't run to completion when called — it
  returns an iterator, and each <code>.next()</code> runs the body only
  until the next <code>yield</code>, then pauses with everything
  (local variables included) intact until <code>.next()</code> is
  called again.
</p>
<div class="try">
  <pre><code>function* range(start, end) {
  for (let i = start; i &lt; end; i++) yield i;
}
console.log([...range(1, 5)]);   <span class="c">// what happens?</span>

function* outer() {
  yield 1;
  yield* [2, 3];        <span class="c">// yield* delegates to another iterable, one value at a time</span>
  yield* innerGen();
}
function* innerGen() {
  yield 4;
  yield 5;
}
console.log([...outer()]);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>[1, 2, 3, 4]</code>, then <code>[1, 2, 3, 4, 5]</code>. Spread
  works on any generator because a generator's return value <em>is</em>
  an iterator (it implements <code>Symbol.iterator</code>, covered
  properly next chapter). <code>yield*</code> is what makes generators
  composable — one generator can hand off to another without unpacking
  it into an array first.
</p>
<p>
  The genuinely two-way part: <code>.next(value)</code> doesn't just
  resume the generator, it becomes the <em>result</em> of the
  <code>yield</code> expression that paused it.
</p>
<div class="try">
  <pre><code>function* runningTotal() {
  let total = 0;
  while (true) {
    const n = yield total;    <span class="c">// pauses here, returning "total" — resumes with whatever .next(n) sends</span>
    total += n;
  }
}
const calc = runningTotal();
console.log(calc.next().value);      <span class="c">// what happens? (no value to send yet — this call just starts it)</span>
console.log(calc.next(5).value);     <span class="c">// what happens?</span>
console.log(calc.next(10).value);    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>0</code>, then <code>5</code>, then <code>15</code>. The first
  <code>.next()</code> has nothing to send <em>into</em> — there's no
  paused <code>yield</code> waiting for a value yet, it just runs the
  generator up to its first <code>yield total</code> and returns that
  <code>0</code>. Every call after that both resumes execution
  <em>and</em> delivers a value into the paused expression — genuine
  two-way communication, not just "give me the next thing."
</p>

<h3>Generators can be told to stop or fail — .return() and .throw()</h3>
<div class="try">
  <pre><code>function* worker() {
  try {
    yield 1;
    yield 2;
    yield 3;
  } finally {
    console.log("cleanup ran");   <span class="c">// runs no matter HOW the generator stops</span>
  }
}

const g = worker();
console.log(g.next());      <span class="c">// { value: 1, done: false }</span>
console.log(g.return(99));  <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>{ value: 99, done: true }</code> — but only after
  <code>"cleanup ran"</code> logs first. <code>.return(value)</code>
  acts as if a <code>return value</code> statement executed right at the
  paused <code>yield</code>, which means any <code>finally</code> block
  wrapped around it still runs. <code>.throw(error)</code> is the
  matching move for failure: it makes the paused <code>yield</code>
  behave as if it had thrown, letting a <code>try/catch</code>
  <em>inside</em> the generator handle it, or propagating out if there
  isn't one. <code>for...of</code> calls <code>.return()</code>
  automatically on a <code>break</code>, so cleanup runs there too,
  without anyone writing it explicitly.
</p>

<h3>Iterator helpers — array methods, without building an array first</h3>
<div class="try">
  <pre><code>function* naturals() {
  let n = 1;
  while (true) yield n++;      <span class="c">// an infinite sequence — could never become a real array</span>
}

const firstFiveSquares = naturals()
  .map((n) =&gt; n * n)
  .filter((n) =&gt; n % 2 === 0)
  .take(5);

console.log([...firstFiveSquares]);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>[4, 16, 36, 64, 100]</code> — <code>.map</code>,
  <code>.filter</code>, <code>.take</code>, <code>.drop</code> and a
  handful more now exist directly on any iterator, lazily: nothing runs
  until something actually consumes the result (here, the spread), and
  each value flows through the whole chain one at a time instead of
  building an intermediate array at every step. That laziness is the
  whole point — the infinite <code>naturals()</code> generator above
  would never finish if <code>.map()</code> ran eagerly across it first,
  but <code>.take(5)</code> only ever pulls five values through the
  chain before stopping. Unlike <code>Temporal</code> (covered in
  <a href="/notes/regex-dates-apis">Regex &amp; dates</a>), iterator
  helpers landed across every major engine well before this site's own
  timeline — safe to reach for directly, no feature check needed.
</p>

<h3>Array.fromAsync — collecting an async iterable into a real array</h3>
<pre><code>async function* pageThrough() {
  yield 1;
  yield 2;
  yield 3;
}

const all = await Array.fromAsync(pageThrough());
console.log(all);   <span class="c">// [1, 2, 3] — a real array, not an async generator anymore</span></code></pre>
<p class="sub">
  Before this existed, collecting an async generator's output meant a
  manual <code>for await...of</code> loop pushing into an array by
  hand. <code>Array.fromAsync</code> is that loop, built in — useful
  once you've decided you <em>do</em> want everything in memory at once
  (a small, known-bounded result set), rather than streaming it the way
  the paging example below does. Same as the iterator helpers above:
  broadly supported today, nothing to feature-detect first.
</p>

<h3>Async generators and for await...of</h3>
<pre><code>async function* pageThrough(url) {
  let next = url;
  while (next) {
    const page = await fetch(next).then((r) =&gt; r.json());
    yield page.items;
    next = page.nextUrl;
  }
}

for await (const items of pageThrough("/api/items")) {
  render(items);   <span class="c">// runs once per page, as each one arrives — never holds every page in memory at once</span>
}</code></pre>
<p class="sub">
  <code>async function*</code> combines both ideas at once — every
  <code>.next()</code> now returns a <em>promise</em> of the next
  value, so the consumer can <code>await</code> each item as it's
  produced instead of needing everything ready up front.
  <code>for await...of</code> is the loop built to consume exactly
  that: pause for each value's promise, unwrap it, run the body,
  repeat.
</p>

<h3>Streams and backpressure</h3>
<pre><code>const response = await fetch("/api/large-file");
const reader = response.body.getReader();   <span class="c">// a ReadableStream, read chunk by chunk</span>

while (true) {
  const { done, value } = await reader.read();   <span class="c">// value is one chunk (a Uint8Array), not the whole file</span>
  if (done) break;
  processChunk(value);
}</code></pre>
<p>
  The point of a stream is never holding the whole thing in memory —
  a multi-gigabyte download processed chunk by chunk costs roughly one
  chunk's worth of memory, not the whole file's. <b>Backpressure</b> is
  what keeps a fast producer from burying a slow consumer in memory:
  a well-built stream only pulls the next chunk once the consumer
  signals it's ready for one, rather than the producer blasting data in
  as fast as it can regardless of whether anything downstream can keep
  up.
</p>

<h3>TransformStream — reshaping a stream mid-pipeline</h3>
<pre><code>const upperCaseStream = new TransformStream({
  transform(chunk, controller) {
    controller.enqueue(chunk.toUpperCase());
  },
});

const response = await fetch("/api/text-stream");
const upper = response.body
  .pipeThrough(new TextDecoderStream())   <span class="c">// bytes -&gt; text</span>
  .pipeThrough(upperCaseStream);           <span class="c">// text -&gt; upper-cased text</span>

for await (const chunk of upper) {
  console.log(chunk);
}</code></pre>
<p class="sub">
  A <code>TransformStream</code> sits between a readable and a writable
  side, letting a pipeline reshape data chunk by chunk without ever
  buffering the whole thing — the same backpressure guarantee from
  earlier applies across every stage: a slow consumer at the end of the
  chain naturally slows down every stage before it, instead of one
  stage racing ahead and burying the next in memory.
</p>

<h3>Web Workers, SharedArrayBuffer, Atomics</h3>
<p>
  A regular Worker (like the one this very playground runs your code
  in, so a hung loop can't freeze the tab) communicates with the main
  thread by <b>copying</b> messages via <code>postMessage</code> — even
  a huge object gets serialized, sent, and rebuilt on the other side.
  <code>SharedArrayBuffer</code> is the exception: actual shared memory
  both threads can read and write directly, no copying.
</p>
<div class="warn">
  <span class="ttl">⚠ Shared memory needs its own locking</span>
  Two threads writing the same <code>SharedArrayBuffer</code> at once
  is a real, classic race condition — JS's usual single-threaded
  "nothing interrupts mid-statement" guarantee doesn't cover memory two
  separate threads can both touch simultaneously.
  <code>Atomics.wait</code>/<code>Atomics.notify</code> /
  <code>Atomics.add</code> exist specifically to coordinate that
  safely, the same job a mutex does in a traditionally threaded
  language. This is genuinely rare in day-to-day app code — mostly
  reserved for CPU-heavy work like audio/video processing or a WASM
  module that needs real shared-memory parallelism.
</div>

<h3>Concurrency control — running a lot of things, but not all at once</h3>
<p>
  <a href="/notes/async-properly">Promise.all</a> runs everything at
  once. Sometimes that's wrong — 500 requests fired simultaneously can
  overwhelm a server or hit a rate limit. A concurrency-limited queue
  runs a fixed number in flight, always starting the next one the
  moment a slot frees up.
</p>
<div class="try">
  <pre><code>function wait(ms, label) {
  return new Promise((resolve) =&gt; setTimeout(() =&gt; resolve(label), ms));
}

async function runWithLimit(tasks, limit) {
  const results = [];
  let index = 0;
  async function worker() {
    while (index &lt; tasks.length) {
      const current = index++;
      results[current] = await tasks[current]();
    }
  }
  await Promise.all(Array.from({ length: limit }, worker));
  return results;
}

const order = [];
const tasks = [1, 2, 3, 4, 5].map((n) =&gt; async () =&gt; {
  order.push("start " + n);
  await wait(10);
  order.push("end " + n);
  return n * 10;
});

const results = await runWithLimit(tasks, 2);
console.log("results:", results);
console.log("order:", order.join(", "));</code></pre>
</div>
<p class="sub">
  Watch the order: <code>start 1, start 2</code> — only two run
  immediately, the limit — then each <code>end</code> is immediately
  followed by the next <code>start</code>, never more than two "start"s
  without a matching "end" between them. That's the whole
  pattern: a fixed pool of <code>worker()</code> functions, all sharing
  one <code>index</code> counter, each one pulling the next task the
  moment it's free. This exact shape — sometimes called a
  <b>semaphore</b> when the limit is explicit — is what a real batch
  job (upload 500 files, 6 at a time) is built on.
</p>`,
};
