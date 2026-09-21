import type { Chapter } from "../types";

export const asyncProperly: Chapter = {
  id: "async-properly",
  num: "I4",
  title: "Async, properly",
  short: "Async, properly",
  levels: ["intermediate"],
  practice: [
    "ex-order-predict",
    "ex-parallel-load",
    "ex-retry",
    "ex-sequential-save",
    "ex-promise-all",
    "ex-promise-all-settled",
    "ex-promise-any",
    "ex-promise-race",
    "ex-map-limit",
  ],
  ready: true,
  subtitle: "Promises, done right — and the sequential-vs-parallel mistake almost everyone makes once.",
  body: `<p>
  Three chapters already did the groundwork this one stands on:
  <a href="/notes/single-thread">why async exists at all</a>,
  <a href="/notes/setup-mental-model">the ordering demos</a>, and
  <a href="/notes/basic-async">promises themselves</a> — the three
  states, chaining, <code>.catch</code>, and <code>async</code>/<code>await</code>
  as the same thing in different spelling. This chapter assumes all of
  that and goes to the layer above it: the mistakes that survive knowing
  the syntax.
</p>

<div class="say">
  <span class="ttl">One-line recap &rarr;</span> A promise settles once,
  permanently, and every reaction on it runs as a microtask.
  <code>.then</code> returns a new promise whose value is whatever your
  callback returned. An <code>async</code> function always returns a
  promise; <code>await</code> unwraps one and throws on rejection.
</div>

<h3>The mistake: accidental sequential awaiting</h3>
<div class="try">
  <pre><code>function wait(ms, label) {
  return new Promise((resolve) =&gt; setTimeout(() =&gt; resolve(label), ms));
}

async function sequential() {
  const t0 = Date.now();
  await wait(50, "a");
  await wait(50, "b");
  return Date.now() - t0;
}
async function parallel() {
  const t0 = Date.now();
  await Promise.all([wait(50, "a"), wait(50, "b")]);
  return Date.now() - t0;
}

console.log("sequential ~", await sequential(), "ms");
console.log("parallel ~", await parallel(), "ms");</code></pre>
</div>
<p class="sub">
  Roughly <code>100ms</code>, then roughly <code>50ms</code>. Two
  <code>await</code>s back to back run one after the other — the
  second doesn't even <em>start</em> until the first finishes, even
  though the two waits have nothing to do with each other. If the work
  doesn't depend on the previous result, <b>start both first</b>
  (<code>Promise.all</code>, or just call both functions before
  awaiting either), and only then await. This exact mistake — awaiting
  three independent API calls one by one instead of together — is
  a very common, very real source of a slow page.
</p>

<h3>forEach doesn't wait — the async loop trap</h3>
<div class="try">
  <pre><code>function save(item) {
  return new Promise((resolve) =&gt; setTimeout(resolve, 50));
}

async function processAll(items) {
  items.forEach(async (item) =&gt; {
    await save(item);          <span class="c">// forEach has ALREADY moved to the next item by the time this resolves</span>
  });
  console.log("done!");         <span class="c">// what happens?</span>
}
processAll([1, 2, 3]);</code></pre>
</div>
<p class="sub">
  <code>"done!"</code> logs almost immediately — before any of the
  three saves finish. <code>forEach</code> calls its callback three
  times and never looks at what any of them return; an
  <code>async</code> callback still returns a promise,
  <code>forEach</code> just throws every one of those promises away
  unread. The fix is a plain <code>for...of</code> loop (sequential,
  each <code>await</code> genuinely pauses the outer function) or
  <code>await Promise.all(items.map((i) =&gt; save(i)))</code> (parallel,
  and the outer function actually waits for all three before logging).
</p>

<h3>The four combinators</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Settles when</th>
    <th>Result</th>
  </tr>
  <tr><td><code>Promise.all(promises)</code></td><td>all fulfill, <b>or</b> the first one rejects</td><td>array of values, in order — or rejects with that first error</td></tr>
  <tr><td><code>Promise.allSettled(promises)</code></td><td>every one has settled, success or failure</td><td>array of <code>{ status, value }</code> or <code>{ status, reason }</code> — never rejects itself</td></tr>
  <tr><td><code>Promise.race(promises)</code></td><td>the very first one settles, fulfilled or rejected</td><td>that one result — could be a rejection</td></tr>
  <tr><td><code>Promise.any(promises)</code></td><td>the first one <b>fulfills</b> — ignores rejections until one succeeds</td><td>that fulfilled value, or an <code>AggregateError</code> if all rejected</td></tr>
</table>
<div class="try">
  <pre><code>function wait(ms, value, fails) {
  return new Promise((resolve, reject) =&gt;
    setTimeout(() =&gt; (fails ? reject(new Error(value)) : resolve(value)), ms)
  );
}

const settled = await Promise.allSettled([
  wait(10, "ok-1"),
  wait(10, "broke", true),
]);
console.log(JSON.stringify(settled));   <span class="c">// what happens?</span>

const winner = await Promise.any([
  wait(10, "fails-fast", true),
  wait(30, "succeeds-slower"),
]);
console.log(winner);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>allSettled</code> reports both outcomes without ever throwing —
  the standard choice for "run everything, tell me what worked and
  what didn't," like a batch upload. <code>any</code> returns
  <code>"succeeds-slower"</code>: the early rejection doesn't disqualify
  the batch, <code>any</code> just keeps waiting until something
  actually succeeds — the opposite instinct from <code>race</code>,
  which would have surfaced that first rejection immediately.
</p>

<h3>Promise.all does not cancel the others</h3>
<pre><code>const [report, user] = await Promise.all([
  fetch("/slow-report"),                 <span class="c">// keeps running after the line below rejects</span>
  Promise.reject(new Error("nope")),
]);</code></pre>
<p>
  <code>Promise.all</code> rejects the moment any input rejects, but it cannot
  stop the rest. Their requests carry on, their side effects still happen, and
  their results are quietly discarded. Nothing in the language can cancel a
  promise; cancellation is something you build with a signal. Give every task the
  same <code>AbortSignal</code> and abort on failure:
</p>
<pre><code>const controller = new AbortController();
try {
  return await Promise.all(urls.map((u) =&gt; fetch(u, { signal: controller.signal })));
} catch (err) {
  controller.abort();                    <span class="c">// stop the siblings, don't just ignore them</span>
  throw err;
}</code></pre>
<p class="sub">
  <code>Promise.all</code> does attach a handler to every input, so a rejection
  that arrives <em>after</em> the first one is not reported as unhandled. That
  keeps the console quiet, and it is also why a failure can vanish without a
  trace.
</p>

<h3>Unhandled rejections</h3>
<pre><code>async function save() { throw new Error("disk full"); }

save();                                  <span class="c">// no await, no .catch — nobody handles it</span></code></pre>
<p>
  A promise that rejects with no handler attached becomes an
  <b>unhandled rejection</b>, and the platform decides what that means. In a
  browser it fires an <code>unhandledrejection</code> event on
  <code>window</code> and logs an error; the page keeps running. In Node.js
  since version 15 the default is to treat it as an uncaught exception, which
  <b>crashes the process</b>. The usual source is a fire-and-forget async call.
</p>
<pre><code>window.addEventListener("unhandledrejection", (e) =&gt; {
  report(e.reason);                      <span class="c">// last-resort logging, not error handling</span>
});

process.on("unhandledRejection", (reason) =&gt; {   <span class="c">// Node</span>
  report(reason);
});

save().catch(report);                    <span class="c">// the real fix: every promise ends in a handler</span></code></pre>

<h3>Predict the order</h3>
<pre><code>console.log("1");
setTimeout(() =&gt; console.log("2"), 0);
Promise.resolve().then(() =&gt; console.log("3"));
(async () =&gt; {
  console.log("4");
  await null;
  console.log("5");
})();
queueMicrotask(() =&gt; console.log("6"));
console.log("7");</code></pre>
<p>
  The output is <b>1, 4, 7, 3, 5, 6, 2</b>. Step by step: the synchronous code
  runs first and prints 1; <code>setTimeout</code> only schedules a task; the
  <code>.then</code> callback is queued as a microtask; the async function runs
  synchronously up to its first <code>await</code>, printing 4, and its
  continuation is queued as a second microtask; <code>queueMicrotask</code>
  queues a third; then 7 prints and the call stack empties. Now the microtask
  queue drains in order &mdash; 3, 5, 6 &mdash; and only after it is empty does the
  event loop take the timer's task and print 2.
</p>

<h3>AbortController — cancelling something already in flight</h3>
<p>
  Promises can't be cancelled directly once started — there's no
  <code>.cancel()</code>. <code>AbortController</code> is the
  standard workaround: a signal that in-flight work can watch for, and
  react to by stopping itself.
</p>
<pre><code>async function withTimeout(taskFn, ms) {
  const controller = new AbortController();
  const timer = setTimeout(() =&gt; controller.abort(), ms);
  try {
    return await taskFn(controller.signal);
  } finally {
    clearTimeout(timer);   <span class="c">// clean up even if taskFn finished before the timeout</span>
  }
}

const report = await withTimeout(
  (signal) =&gt; fetch("/api/slow-report", { signal }),   <span class="c">// fetch understands AbortSignal natively</span>
  5000
);</code></pre>
<p class="sub">
  For the specific "give up after N ms" case, there's a built-in
  shortcut that skips the manual timer entirely:
  <code>AbortSignal.timeout(5000)</code> returns a signal that aborts
  itself on schedule — pass it straight to <code>fetch</code>'s
  <code>signal</code> option.
</p>

<h3>The stale-response race — "latest request wins"</h3>
<p>
  A search box that fires a request on every keystroke has a race
  built in: nothing guarantees responses arrive in the same order the
  requests left. Type "re", then "rea" a moment later — if the "re"
  request happens to take longer, its (now-stale) results can land
  <em>after</em> "rea"'s and overwrite the correct ones on screen.
</p>
<div class="try">
  <pre><code>let latestId = 0;

async function search(query, render) {
  const id = ++latestId;                     <span class="c">// this request's own ticket number</span>
  const results = await fetchResults(query);
  if (id !== latestId) return;                <span class="c">// a newer search started while this was in flight — drop it</span>
  render(results);
}

function fetchResults(query) {
  const delay = query.length === 2 ? 300 : 30;   <span class="c">// simulate "re" being the slow one</span>
  return new Promise((resolve) =&gt; setTimeout(() =&gt; resolve("results for " + query), delay));
}

const rendered = [];
search("re", (r) =&gt; rendered.push(r));
search("rea", (r) =&gt; rendered.push(r));
await new Promise((r) =&gt; setTimeout(r, 400));
console.log(rendered);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>["results for rea"]</code> — only one result ever renders, even
  though both requests actually completed. Each call captures its own
  <code>id</code> before awaiting; by the time the slow "re" response
  comes back, <code>latestId</code> has already moved on to "rea"'s
  ticket, so the stale one silently drops itself instead of overwriting
  the screen. <code>AbortController</code> solves the same problem a
  different way — cancel the previous request outright instead of
  letting it finish and checking afterward — and is the better choice
  whenever the request itself is expensive enough that abandoning it
  early actually saves real work, not just a render.
</p>

<h3>Promise.withResolvers — resolve/reject without smuggling them out</h3>
<pre><code>function createDeferred() {                                        <span class="c">// the old way</span>
  let resolve, reject;
  const promise = new Promise((res, rej) =&gt; { resolve = res; reject = rej; });
  return { promise, resolve, reject };
}

<span class="c">// the same thing, built in:</span>
const { promise, resolve, reject } = Promise.withResolvers();</code></pre>
<p class="sub">
  A "deferred" — a promise whose <code>resolve</code>/<code>reject</code>
  are usable from <em>outside</em> its own executor — used to require
  the slightly awkward pattern shown above, capturing the callbacks into
  outer variables. <code>Promise.withResolvers()</code> is exactly that
  pattern, standardized. It's useful anywhere a promise needs to be
  settled by something other than its own executor — bridging an
  event-based API, or a queue where one function enqueues work and a
  separate callback resolves it later.
</p>

<h3>Anything with a .then is a thenable — await doesn't require a real Promise</h3>
<pre><code>const thenable = {
  then(resolve) {
    setTimeout(() =&gt; resolve(42), 10);
  },
};

console.log(await thenable);   <span class="c">// what happens?</span></code></pre>
<p class="sub">
  <code>42</code> — <code>await</code> (and <code>Promise.resolve</code>,
  and <code>.then</code> chaining) don't check for
  <code>instanceof Promise</code>; they check for a callable
  <code>.then</code> method, full stop. That's how libraries which
  predate native promises interoperate with <code>await</code> with no
  adapter needed — and it's also a real gotcha: an object that merely
  happens to have a property named <code>then</code>, for entirely
  unrelated reasons, gets treated as a promise by anything that awaits
  it.
</p>

<h3>Linking multiple abort reasons</h3>
<pre><code>const userCancel = new AbortController();
const timeout = AbortSignal.timeout(5000);

const signal = AbortSignal.any([userCancel.signal, timeout]);   <span class="c">// fires when EITHER does</span>
fetch("/api/report", { signal });

cancelButton.addEventListener("click", () =&gt; userCancel.abort());</code></pre>
<p class="sub">
  <code>AbortSignal.any(signals)</code> returns one combined signal that
  aborts the moment any of its inputs does, carrying whichever reason
  fired first — the standard way to give one request both a timeout and
  a user-triggered cancel button without wiring two separate
  <code>abort</code> listeners by hand.
</p>

<h3>Retries</h3>
<div class="try">
  <pre><code>function wait(ms) {
  return new Promise((resolve) =&gt; setTimeout(resolve, ms));
}

async function retry(fn, attempts, delay) {
  for (let i = 0; i &lt; attempts; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === attempts - 1) throw error;   <span class="c">// out of attempts — let the real error surface</span>
      await wait(delay);
    }
  }
}

let tries = 0;
async function flaky() {
  tries++;
  if (tries &lt; 3) throw new Error("not ready yet");
  return "succeeded on attempt " + tries;
}

console.log(await retry(flaky, 5, 10));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"succeeded on attempt 3"</code> — the first two calls throw and
  get swallowed (with a delay between attempts), the third succeeds and
  its result is what <code>retry</code> finally returns. A real
  implementation almost always adds
  <b>exponential backoff</b> — <code>delay * 2 ** i</code> instead of a
  fixed delay — so retries space out instead of hammering a struggling
  server at a constant rate.
</p>

<h3>fetch, past the surface level</h3>
<pre><code>const response = await fetch("/api/users", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ name: "Ana" }),
});

response.ok;              <span class="c">// true for 200-299 — still the #1 fetch mistake to forget</span>
response.status;          <span class="c">// 201, 404, 500, …</span>
response.headers.get("content-type");   <span class="c">// header access is case-insensitive</span></code></pre>
<p class="sub">
  The <code>response.ok</code> check is <a href="/notes/basic-async">already
  covered</a>; forgetting it is still the most common fetch mistake.
</p>
<p>
  <b>CORS</b>, briefly: a browser blocks a script on
  <code>a.com</code> from reading a response from <code>b.com</code>
  unless <code>b.com</code>'s server explicitly opts in with an
  <code>Access-Control-Allow-Origin</code> response header. This is
  enforced by the <em>browser</em>, not the server. Whether the request
  itself reaches the server depends on what kind of request it is, which
  is the next box. Either way it's a client-side protection for the
  person visiting the page, not a way for a server to protect itself from
  being called.
</p>
<div class="bx is-prim">
  <span class="ttl">Simple requests and preflighted requests</span>
  <p>
    A <b>simple</b> request is a <code>GET</code>, <code>HEAD</code> or
    <code>POST</code> with only browser-safe headers and a
    <code>Content-Type</code> of <code>application/x-www-form-urlencoded</code>,
    <code>multipart/form-data</code> or <code>text/plain</code>. The browser
    sends it straight away with an <code>Origin</code> header. The server
    processes it, side effects included, and the browser then withholds the
    <em>response</em> unless <code>Access-Control-Allow-Origin</code> permits it.
  </p>
  <p>
    Anything else is <b>preflighted</b>: <code>PUT</code>, <code>PATCH</code>,
    <code>DELETE</code>, a custom header such as <code>Authorization</code>, or
    <code>Content-Type: application/json</code> &mdash; which is the
    <code>POST</code> above. The browser first sends an <code>OPTIONS</code>
    request asking permission, and only sends the real one if the answer is yes.
  </p>
  <pre><code>OPTIONS /users            <span class="c">// the preflight</span>
Origin: https://a.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: content-type

204 No Content            <span class="c">// the server's answer</span>
Access-Control-Allow-Origin: https://a.com
Access-Control-Allow-Methods: POST
Access-Control-Allow-Headers: content-type

POST /users               <span class="c">// sent only now</span></code></pre>
  <p>
    So a blocked JSON <code>POST</code> usually never reaches the server at all,
    while a blocked form-style <code>POST</code> usually does. See
    <a href="/notes/security">the security chapter</a> for the preflight from the
    server's side.
  </p>
</div>
<div class="warn">
  <span class="ttl">⚠ A CORS error is almost never a JS bug</span>
  If a request works fine in Postman/curl but fails only from the
  browser with a CORS message in the console, the fix is server-side
  (adding the right header) — there is no client-side JavaScript
  workaround for a server that hasn't opted in.
</div>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Independent awaits should run in parallel with <code>Promise.all</code>, but <code>Promise.all</code> cannot cancel its siblings — real cancellation needs an <code>AbortSignal</code> — and every promise must end in a handler, because an unhandled rejection crashes Node and is only logged in a browser."
  </p>
</div>`,
};
