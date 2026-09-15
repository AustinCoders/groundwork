import type { Chapter } from "../types";

export const errorsTools: Chapter = {
  id: "errors-tools",
  num: "B16",
  title: "Errors & tools",
  short: "Errors & tools",
  levels: ["beginner"],
  practice: ["ex-safe-parse", "ex-custom-error"],
  ready: true,
  subtitle: "The last lesson before the beginner project — reading what the engine is trying to tell you.",
  body: `<h3>try / catch / finally</h3>
<pre><code>try {
  JSON.parse("this isn't JSON");     <span class="c">// throws a SyntaxError</span>
} catch (error) {
  console.log("caught:", error.message);
} finally {
  console.log("finally always runs — success, failure, doesn't matter");
}</code></pre>
<div class="try">
  <pre><code>try {
  throw new Error("inner");
} finally {
  console.log("finally ran");
}</code></pre>
</div>
<p class="sub">
  Click run — you'll see <code>"finally ran"</code>, and then the
  error still shows up as uncaught below it. There's no
  <code>catch</code> here at all, and <code>finally</code> doesn't stop
  the error from propagating — it just guarantees that cleanup code
  (closing a connection, hiding a spinner) runs on the way out, whether
  the block succeeded or not.
</p>
<p>
  The caught value doesn't have to be named if you don't need it —
  useful when you only care <em>that</em> something failed:
</p>
<pre><code>try {
  riskyThing();
} catch {                 <span class="c">// no (error) — the binding is optional since ES2019</span>
  showFallbackUI();
}</code></pre>

<h3>The built-in error types</h3>
<table>
  <tr><th>Type</th><th>Thrown when</th></tr>
  <tr><td><code>TypeError</code></td><td>an operation on the wrong type — calling a non-function, reading a property of <code>undefined</code></td></tr>
  <tr><td><code>RangeError</code></td><td>a number outside what's allowed — an invalid array length, <code>(1).toFixed(101)</code>, recursion too deep ("Maximum call stack size exceeded")</td></tr>
  <tr><td><code>ReferenceError</code></td><td>a name that doesn't exist in scope, or one still in the TDZ</td></tr>
  <tr><td><code>SyntaxError</code></td><td>malformed code — <code>JSON.parse</code> of invalid JSON, or a broken <code>eval</code> string</td></tr>
  <tr><td><code>AggregateError</code></td><td>more than one error at once — what <code>Promise.any</code> rejects with when every promise fails</td></tr>
</table>
<pre><code>try {
  null.name;
} catch (e) {
  console.log(e instanceof TypeError, e.constructor.name);   <span class="c">// true "TypeError"</span>
}

try {
  new Array(-1);
} catch (e) {
  console.log(e instanceof RangeError);   <span class="c">// true</span>
}</code></pre>
<p class="sub">
  Every one of these extends <code>Error</code> — same
  <code>.message</code>/<code>.stack</code> shape — so a
  <code>catch (e)</code> can always fall back to treating it generically.
  But checking <code>e instanceof TypeError</code> specifically lets
  code react differently to "you passed the wrong shape of data" versus
  "the network is down" versus "you wrote invalid JSON," instead of
  pattern-matching the message string, which can change between engine
  versions.
</p>

<h3>finally can override the return value — the trap</h3>
<div class="try">
  <pre><code>function attempt() {
  try {
    return "try";
  } finally {
    return "finally";   <span class="c">// ← this WINS, silently discarding "try"</span>
  }
}
console.log(attempt());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"finally"</code> — a <code>return</code> (or <code>throw</code>,
  or <code>break</code>/<code>continue</code>) inside
  <code>finally</code> doesn't run alongside the <code>try</code>'s
  outcome, it <b>replaces</b> it completely, even swallowing an error
  that was already thrown. This is almost always a bug rather than a
  choice — a real <code>finally</code> block should stick to cleanup
  (closing a connection, clearing a timer) and never contain its own
  <code>return</code>.
</p>

<h3>debugger — a breakpoint you can commit</h3>
<pre><code>function processOrder(order) {
  debugger;                 <span class="c">// execution pauses HERE the instant DevTools is open</span>
  const total = order.items.reduce((sum, i) =&gt; sum + i.price, 0);
  return total;
}</code></pre>
<p class="sub">
  With DevTools closed, <code>debugger;</code> does nothing at all —
  not an error, not even a warning. With DevTools open, it pauses
  exactly like clicking a line number in the Sources panel, every local
  variable inspectable in the scope pane. It's useful specifically
  because it travels with the code: a click-added breakpoint disappears
  on refresh, but a <code>debugger;</code> statement fires every time
  that line runs until it's deleted — handy for a rare, hard-to-reproduce
  path, and worth grepping for before shipping.
</p>

<h3>Custom errors</h3>
<p>
  <code>Error</code> is a class like any other — extend it to attach
  your own data, and <code>instanceof</code> still recognizes the whole
  chain.
</p>
<div class="try">
  <pre><code>class ValidationError extends Error {
  constructor(message, field) {
    super(message);
    this.name = "ValidationError";
    this.field = field;
  }
}

try {
  throw new ValidationError("age must be positive", "age");
} catch (e) {
  console.log(e.name, "-", e.message, "- field:", e.field);
  console.log("is an Error:", e instanceof Error);
  console.log("is a ValidationError:", e instanceof ValidationError);
}</code></pre>
</div>
<p class="sub">
  Both <code>instanceof</code> checks come back <code>true</code> —
  <code>super(message)</code> wires up the normal <code>Error</code>
  machinery (<code>.message</code>, <code>.stack</code>), and the
  <code>class ... extends Error</code> keeps the prototype chain intact.
  That lets calling code catch broadly (<code>instanceof Error</code>)
  or specifically (<code>instanceof ValidationError</code>) depending on
  what it actually needs to handle differently.
</p>

<h3>Reading a stack trace</h3>
<p>
  Every <code>Error</code> carries a <code>.stack</code> string — a
  snapshot of every function call that was still active the moment it
  was thrown, most-recent first:
</p>
<pre><code>Error: Cannot read properties of undefined (reading 'name')
    at getDisplayName (utils.js:12:18)
    at renderUser (UserCard.js:8:24)
    at renderApp (App.js:22:3)
    at main (index.js:5:1)</code></pre>
<p class="sub">
  Read it <b>top to bottom, most specific first</b>: line 1 is where
  the error actually happened — inside <code>getDisplayName</code>, at
  <code>utils.js</code> line 12. Every line under it is a caller, in
  order, all the way out to where the whole chain started. The bug is
  almost always at or near the top; the rest of the trace is just
  "how did we get here."
</p>
<div class="warn">
  <span class="ttl">⚠ The throw site isn't always the bug</span>
  A <code>TypeError</code> reading a property of <code>undefined</code>
  tells you <em>where it blew up</em>, not <em>where it went wrong</em>.
  The real bug is usually a few frames up — whatever handed
  <code>getDisplayName</code> an object it shouldn't have. Read the
  whole trace before fixing the top line.
</div>

<h3>console — more than .log</h3>
<table>
  <tr>
    <th>Call</th>
    <th>For</th>
  </tr>
  <tr><td><code>console.log(...)</code></td><td>general output</td></tr>
  <tr><td><code>console.info(...)</code>, <code>console.debug(...)</code></td><td>same as log, different icon — some filters hide/show them separately</td></tr>
  <tr><td><code>console.warn(...)</code></td><td>yellow, doesn't stop anything — a heads-up</td></tr>
  <tr><td><code>console.error(...)</code></td><td>red, includes a stack trace automatically</td></tr>
  <tr><td><code>console.table(data)</code></td><td>an array of objects, rendered as an actual table</td></tr>
  <tr><td><code>console.group(label)</code> / <code>.groupEnd()</code></td><td>indents everything between them — collapsible in DevTools</td></tr>
  <tr><td><code>console.time(label)</code> / <code>.timeEnd(label)</code></td><td>how long the code between them took</td></tr>
</table>
<pre><code>console.table([
  { name: "Ana", age: 29, role: "admin" },
  { name: "Ravi", age: 34, role: "editor" },
]);</code></pre>
<p class="sub">
  Open your own DevTools console and run that — every object becomes a
  row, every shared key becomes a column, automatically. It's the
  single fastest way to eyeball an array of records without writing a
  loop just to look at it.
</p>

<h3>DevTools, the short version</h3>
<ul>
  <li>
    <b>Elements panel</b> — the live DOM tree, editable in place. Change
    a class or a style here to test an idea before touching the file.
  </li>
  <li>
    <b>Console panel</b> — everything above, plus a REPL you can run
    arbitrary code in, against the actual page that's open.
  </li>
  <li>
    <b>Sources panel</b> — set a real breakpoint by clicking a line
    number, or drop <code>debugger;</code> directly in your code. Either
    one pauses execution right there, with every variable in scope
    inspectable.
  </li>
  <li>
    <b>Network panel</b> — every request the page made, its status,
    timing, and response — the first place to look when "the data never
    showed up."
  </li>
</ul>
<div class="say">
  <span class="ttl">Say it like this →</span> "console.log tells you
  what you thought to ask for. A breakpoint lets you stop time and
  inspect everything — including the things you didn't think to log."
</div>`,
};
