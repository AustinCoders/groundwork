import type { Chapter } from "../types";

export const errorsTools: Chapter = {
  id: "errors-tools",
  num: "B8",
  title: "Errors & tools",
  short: "Errors & tools",
  levels: ["beginner"],
  practice: ["ex-safe-parse", "ex-custom-error"],
  ready: true,
  subtitle: "The beginner track's last stop — reading what the engine is trying to tell you.",
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
