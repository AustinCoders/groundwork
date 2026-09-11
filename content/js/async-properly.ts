import type { Chapter } from "../types";

export const asyncProperly: Chapter = {
  id: "async-properly",
  num: "I4",
  title: "Async, properly",
  short: "Async, properly",
  levels: ["intermediate"],
  practice: ["ex-order-predict", "ex-parallel-load", "ex-retry"],
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

response.ok;              <span class="c">// true for 200-299 — <a href="/notes/basic-async">already covered</a>, still the #1 fetch mistake to forget</span>
response.status;          <span class="c">// 201, 404, 500, …</span>
response.headers.get("content-type");   <span class="c">// header access is case-insensitive</span></code></pre>
<p>
  <b>CORS</b>, briefly: a browser blocks a script on
  <code>a.com</code> from reading a response from <code>b.com</code>
  unless <code>b.com</code>'s server explicitly opts in with an
  <code>Access-Control-Allow-Origin</code> response header. This is
  enforced by the <em>browser</em>, not the server — the request
  usually still reaches the server and can still have side effects; the
  browser just refuses to hand the <em>response</em> back to your
  JavaScript. It's a client-side protection for the person visiting the
  page, not a way for a server to protect itself from being called.
</p>
<div class="warn">
  <span class="ttl">⚠ A CORS error is almost never a JS bug</span>
  If a request works fine in Postman/curl but fails only from the
  browser with a CORS message in the console, the fix is server-side
  (adding the right header) — there is no client-side JavaScript
  workaround for a server that hasn't opted in.
</div>`,
};
