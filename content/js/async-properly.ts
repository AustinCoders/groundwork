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
  The event loop itself — call stack, microtask queue, why a 0ms timer
  still loses to a promise — already got two full step-through demos
  back in <a href="/notes/setup-mental-model">the mental model
  chapter</a>. If that ordering isn't solid yet, that's the place to
  build it; this chapter assumes it and moves straight to the layer on
  top: what a Promise actually <em>is</em>, and how to not shoot
  yourself in the foot with <code>await</code>.
</p>

<h3>A promise has exactly three states</h3>
<table>
  <tr>
    <th>State</th>
    <th>Meaning</th>
    <th>Can it change again?</th>
  </tr>
  <tr><td><b>pending</b></td><td>not settled yet</td><td>yes — to fulfilled or rejected</td></tr>
  <tr><td><b>fulfilled</b></td><td>succeeded, has a value</td><td class="tone-bad">no — permanent</td></tr>
  <tr><td><b>rejected</b></td><td>failed, has a reason</td><td class="tone-bad">no — permanent</td></tr>
</table>
<p>
  "Settled" means fulfilled <em>or</em> rejected — either way, done,
  forever. A promise can only make that transition once; every
  <code>.then()</code>/<code>.catch()</code> attached to it (even
  attached late, after it already settled) gets called with that same
  final outcome.
</p>
<pre><code>fetch("/api/user")
  .then((response) =&gt; response.json())   <span class="c">// each .then returns a NEW promise</span>
  .then((user) =&gt; console.log(user.name))
  .catch((error) =&gt; console.error("failed:", error))   <span class="c">// catches a rejection from ANY step above</span>
  .finally(() =&gt; hideSpinner());          <span class="c">// runs either way, exactly like try/finally</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> A single <code>.catch()</code> at the
  end of a chain catches a failure from every step before it — you
  don't need one per <code>.then()</code>. That's the real advantage
  over callback-style error handling from <a href="/notes/scope-functions">the scope chapter</a>: one
  handler instead of one check at every level.
</div>

<h3>async / await is the same promises, different spelling</h3>
<pre><code>async function loadUser() {
  try {
    const response = await fetch("/api/user");
    if (!response.ok) throw new Error("Request failed: " + response.status);
    return await response.json();
  } catch (error) {
    console.error("failed:", error);
    throw error;   <span class="c">// re-throw so the caller still knows it failed</span>
  }
}</code></pre>
<p>
  Two things worth being precise about: an <code>async function</code>
  <b>always returns a promise</b>, even if the body has no
  <code>await</code> at all and just <code>return</code>s a plain
  value — that value gets silently wrapped. And
  <code>try/catch</code> around <code>await</code> catches a rejected
  awaited promise exactly like a thrown synchronous error — same
  syntax, unified handling.
</p>

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

fetch("/api/slow-report", { signal: controller.signal });  <span class="c">// fetch understands AbortSignal natively</span></code></pre>
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
