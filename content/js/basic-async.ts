import type { Chapter } from "../types";

export const basicAsync: Chapter = {
  id: "basic-async",
  num: "B7",
  title: "Basic async",
  short: "Basic async",
  levels: ["beginner"],
  practice: ["ex-delayed-double", "ex-json-roundtrip"],
  ready: true,
  subtitle: "Just enough to fetch something and not freeze the page doing it.",
  body: `<p>
  This is the surface level — <em>how</em> to fire off something that
  takes time and react when it's done. <em>Why</em> it works that way
  underneath — the call stack, the microtask queue, the exact ordering
  rules — is the demo you already stepped through back in
  <a href="/notes/setup-mental-model">the mental model chapter</a>, and
  gets a full chapter of its own later. Here, just the tools.
</p>

<h3>setTimeout / setInterval</h3>
<pre><code>const id = setTimeout(() =&gt; {
  console.log("ran once, after the delay");
}, 1000);                        <span class="c">// milliseconds — 1000 = 1 second</span>

clearTimeout(id);                <span class="c">// cancel it before it fires</span>

const tick = setInterval(() =&gt; {
  console.log("runs again, and again, every 500ms");
}, 500);

clearInterval(tick);             <span class="c">// the ONLY way to make it stop</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ The delay is a minimum, not a guarantee</span>
  <code>setTimeout(fn, 0)</code> does not run immediately — it means
  "as soon as the call stack is empty and it's this callback's turn,"
  which could be milliseconds later if the thread is busy with
  something else. JS is single-threaded; a timer can never interrupt
  code that's already running.
</div>
<div class="try">
  <pre><code>let count = 0;
await new Promise((resolve) =&gt; {
  const id = setInterval(() =&gt; {
    count++;
    console.log("tick", count);
    if (count === 3) { clearInterval(id); resolve(); }
  }, 50);
});</code></pre>
</div>
<p class="sub">
  Run it — three ticks, then silence. (The <code>await</code> around it
  is only here so this sandbox waits for all three ticks before calling
  the run finished — in your own code you'd rarely wrap a
  <code>setInterval</code> like that.) Forgetting the
  <code>clearInterval</code> in real code is one of the most common
  memory leaks: the interval keeps a reference to everything its
  callback closes over, alive forever, long after whatever UI it was
  updating is gone from the page.
</p>

<h3>fetch — asking the network for something</h3>
<pre><code>fetch("/api/users/1")
  .then(response =&gt; response.json())   <span class="c">// parses the response body as JSON — itself async</span>
  .then(data =&gt; console.log(data))
  .catch(error =&gt; console.error("request failed:", error));</code></pre>
<p>
  <code>fetch</code> resolves as soon as the server sends back
  <em>any</em> response — even a 404 or a 500. It only rejects on a real
  network failure (offline, DNS gone, CORS blocked). That means status
  codes need their own check:
</p>
<pre><code>fetch("/api/users/1").then(response =&gt; {
  if (!response.ok) {              <span class="c">// true for 200-299, false for 404/500/etc.</span>
    throw new Error("Request failed: " + response.status);
  }
  return response.json();
});</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> A rejected <code>fetch</code> promise
  means the network itself failed. A "successful" 404 still resolves —
  always check <code>response.ok</code> before trusting the body.
</div>
<p class="sub">
  <code>.then()</code>/<code>.catch()</code> chains work, but
  <code>async</code>/<code>await</code> — the same request rewritten
  without the chain — reads more like ordinary code and is what you'll
  actually reach for day to day. It gets its own proper chapter once
  promises themselves have been covered in depth.
</p>

<h3>JSON.stringify / JSON.parse</h3>
<p>
  JavaScript objects and JSON text are not the same thing — every
  network request body, every <code>localStorage</code> value, every
  config file round-trips through a real conversion, and that
  conversion drops things silently.
</p>
<div class="try">
  <pre><code>const obj = { a: 1, b: undefined, c: function () {}, d: [1, undefined, 2] };
console.log(JSON.stringify(obj));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>{"a":1,"d":[1,null,2]}</code> — <code>b</code> and
  <code>c</code> vanish completely, because JSON has no way to
  represent <code>undefined</code> or a function as a
  <em>property value</em>. Inside an array, though, the same
  <code>undefined</code> can't just be skipped without shifting every
  index after it — so it becomes <code>null</code> instead.
</p>
<pre><code>JSON.stringify({ a: 1, b: 2 }, null, 2);
<span class="c">// {
//   "a": 1,
//   "b": 2
// }        — the third argument is indent width, for readable output</span>

JSON.parse('{"a":1,"b":[1,2,3]}');    <span class="c">// back to a real object — { a: 1, b: [1, 2, 3] }</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ A circular reference throws</span>
  <code>const o = {}; o.self = o; JSON.stringify(o);</code> throws
  <code>TypeError: Converting circular structure to JSON</code> —
  <code>stringify</code> walks the whole object graph and has no way to
  represent a reference back to something it's already visiting.
</div>
<p>
  This pairing is also the standard, dependency-free way to deep-clone
  a plain object — with real limits:
</p>
<pre><code>const clone = JSON.parse(JSON.stringify(original));</code></pre>
<p class="sub">
  Works for plain data — objects, arrays, strings, numbers, booleans,
  <code>null</code>. Silently mangles anything else: <code>Date</code>
  becomes a string, <code>Map</code>/<code>Set</code> become
  <code>{}</code>, functions and <code>undefined</code> vanish exactly
  as above. Fine for a config blob; wrong for cloning anything richer —
  <code>structuredClone()</code> (built into every modern runtime) does
  a real deep clone, Dates and Maps included.
</p>`,
};
