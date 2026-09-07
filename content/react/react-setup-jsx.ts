import type { Chapter } from "../types";

export const reactSetupJsx: Chapter = {
  id: "react-setup-jsx",
  num: "B1",
  title: "Project setup & JSX",
  short: "Setup & JSX",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "JSX is not HTML and it is not a template language — it is a function call wearing a costume.",
  body: `<h3>Starting a project</h3>
<p>
  Two commands cover almost everything you will do. <b>Vite</b> for a plain
  React app that runs entirely in the browser, and <b>Next.js</b> when you want
  routing and a server as well.
</p>
<pre><code>npm create vite@latest my-app -- --template react-ts
npm create next-app@latest my-app</code></pre>
<p class="sub">
  The old <code>create-react-app</code> is no longer maintained. If you find a
  tutorial that starts with it, the rest of the tutorial is old too.
</p>

<h3>Where the app actually starts</h3>
<pre><code><span class="c">// main.tsx — the file every tutorial skips</span>
import { createRoot } from "react-dom/client";
import App from "./App";

createRoot(document.getElementById("root")).render(
  &lt;StrictMode&gt;
    &lt;App /&gt;
  &lt;/StrictMode&gt;
);</code></pre>
<p>
  <code>createRoot</code> takes a real DOM node and hands React control of
  everything inside it. That is the only place React and the document meet
  &mdash; from here down, React owns the tree.
</p>
<p>
  For a server-rendered page the call is <code>hydrateRoot</code> instead: the
  HTML already exists, so React attaches to it rather than building it. Using
  <code>createRoot</code> on server HTML throws it away and re-renders from
  scratch, which quietly discards the whole point of rendering on the server.
</p>
<p class="sub">
  <code>&lt;StrictMode&gt;</code> is development-only and adds nothing to the
  production build. It deliberately double-invokes components and effects to
  surface impure renders and missing cleanups &mdash; which is why your effect
  runs twice locally and once in production.
</p>

<h3>What JSX actually is</h3>
<p>
  This is the single most useful thing to understand on day one, because
  everything confusing about React later makes sense once you have it.
</p>
<pre><code>const el = &lt;h1 className="title"&gt;Hello&lt;/h1&gt;;</code></pre>
<p>Before your code runs, the build step turns that into a function call:</p>
<pre><code>const el = jsx("h1", { className: "title", children: "Hello" });</code></pre>
<p>
  Which returns a plain object &mdash; roughly
  <code>{ type: "h1", props: { className: "title", children: "Hello" } }</code>.
  That object is called a <b>React element</b>, and it is just a description of
  what you want on screen. Nothing has touched the DOM at this point.
</p>

<div class="bx is-prim">
  <span class="ttl">Three things this explains</span>
  <ul>
    <li>JSX is an <b>expression</b>. You can put it in a variable, return it from an <code>if</code>, or hold it in an array &mdash; because it evaluates to an object.</li>
    <li>You cannot have two sibling tags at the top level, because a function returns one value.</li>
    <li>React elements are cheap. Creating them is making small objects, not touching the page.</li>
  </ul>
</div>

<h3>The rules that trip everyone up</h3>

<h4>One root element</h4>
<p>Wrong, and it will not compile:</p>
<pre><code>return (
  &lt;h1&gt;Title&lt;/h1&gt;
  &lt;p&gt;Body&lt;/p&gt;
);</code></pre>
<p>
  Wrap them. If you do not want a real <code>&lt;div&gt;</code> in the output, use a
  <b>fragment</b> &mdash; the empty tag:
</p>
<pre><code>return (
  &lt;&gt;
    &lt;h1&gt;Title&lt;/h1&gt;
    &lt;p&gt;Body&lt;/p&gt;
  &lt;/&gt;
);</code></pre>

<h4>Braces mean "back to JavaScript"</h4>
<p>
  Inside JSX, <code>{ }</code> is an escape hatch to a JavaScript
  <em>expression</em> &mdash; something that produces a value.
</p>
<pre><code>const name = "Ana";
const age = 30;

&lt;p&gt;{name} is {age} next year: {age + 1}&lt;/p&gt;
&lt;p&gt;{name.toUpperCase()}&lt;/p&gt;          <span class="c">// calls are fine</span>
&lt;p&gt;{age &gt; 18 ? "adult" : "minor"}&lt;/p&gt;  <span class="c">// ternary is fine</span></code></pre>
<p>
  A statement is not. <code>{if (x) ...}</code> and <code>{for (...) ...}</code>
  are syntax errors, because <code>if</code> and <code>for</code> do not produce
  a value. That constraint is why React code leans on <code>&amp;&amp;</code>,
  ternaries and <code>.map()</code> &mdash; not style, arithmetic.
</p>

<h4>Attributes are props, so they are camelCase</h4>
<div class="table-scroll"><table>
<thead><tr><th>HTML</th><th>JSX</th><th>Why</th></tr></thead>
<tbody>
<tr><td><code>class</code></td><td><code>className</code></td><td><code>class</code> is a reserved word in JavaScript</td></tr>
<tr><td><code>for</code></td><td><code>htmlFor</code></td><td>same reason</td></tr>
<tr><td><code>onclick</code></td><td><code>onClick</code></td><td>they are object keys, and JavaScript is camelCase</td></tr>
<tr><td><code>tabindex</code></td><td><code>tabIndex</code></td><td>same</td></tr>
<tr><td><code>style="color: red"</code></td><td><code>style={{ color: "red" }}</code></td><td>an object, not a string</td></tr>
</tbody>
</table></div>
<p class="sub">
  The double braces in <code>style</code> are not special syntax. The outer pair
  is "back to JavaScript", the inner pair is an object literal.
</p>

<h4>Self-closing tags are required</h4>
<p>
  <code>&lt;img&gt;</code> and <code>&lt;br&gt;</code> are legal HTML. In JSX
  they must be <code>&lt;img /&gt;</code> and <code>&lt;br /&gt;</code>, because
  the compiler needs to know where the element ends.
</p>

<h3>What React renders and what it skips</h3>
<pre><code>&lt;p&gt;{"text"}&lt;/p&gt;      <span class="c">// text</span>
&lt;p&gt;{42}&lt;/p&gt;          <span class="c">// 42</span>
&lt;p&gt;{null}&lt;/p&gt;        <span class="c">// nothing</span>
&lt;p&gt;{undefined}&lt;/p&gt;   <span class="c">// nothing</span>
&lt;p&gt;{false}&lt;/p&gt;       <span class="c">// nothing</span>
&lt;p&gt;{[1, 2, 3]}&lt;/p&gt;   <span class="c">// 123</span>
&lt;p&gt;{0}&lt;/p&gt;           <span class="c">// 0  ← not nothing</span></code></pre>
<p>
  <code>null</code>, <code>undefined</code>, <code>true</code> and
  <code>false</code> render nothing, which is what makes
  <code>{condition &amp;&amp; &lt;Thing /&gt;}</code> work. <b>Zero is the
  exception</b>, and it is the most common rendering bug in React &mdash;
  <code>{items.length &amp;&amp; &lt;List /&gt;}</code> puts a literal
  <code>0</code> on the page when the list is empty.
  <a href="/react/react-events-conditionals">Conditional rendering</a> covers the fix.
</p>

<h3>Two transforms, and why old code imports React</h3>
<p>
  Before React 17, JSX compiled to <code>React.createElement(...)</code>, so
  <code>React</code> had to be in scope &mdash; hence
  <code>import React from "react"</code> at the top of every file, even ones
  that never mentioned it. That was the <b>classic runtime</b>.
</p>
<p>
  The <b>automatic runtime</b> compiles to <code>jsx()</code> imported from
  <code>react/jsx-runtime</code> by the compiler itself. You no longer import
  React to write JSX. You still import it for hooks, but
  <code>import { useState } from "react"</code> is the modern form.
</p>
<pre><code><span class="c">// classic — what you will see in older tutorials</span>
import React from "react";
React.createElement("h1", { className: "title" }, "Hello");

<span class="c">// automatic — what your build actually emits today</span>
import { jsx as _jsx } from "react/jsx-runtime";
_jsx("h1", { className: "title", children: "Hello" });</code></pre>
<p class="sub">
  If a tutorial tells you a missing React import is why your JSX broke, it is
  written for a version you are not using.
</p>

<h3>Comments and whitespace</h3>
<pre><code>&lt;div&gt;
  {<span class="c">/* a JSX comment — braces, then a block comment */</span>}
  &lt;span&gt;a&lt;/span&gt; &lt;span&gt;b&lt;/span&gt;      <span class="c">// space between them: kept</span>
  &lt;span&gt;a&lt;/span&gt;
  &lt;span&gt;b&lt;/span&gt;                      <span class="c">// newline between them: removed</span>
  &lt;span&gt;a&lt;/span&gt;{" "}
  &lt;span&gt;b&lt;/span&gt;                      <span class="c">// {" "} puts it back</span>
&lt;/div&gt;</code></pre>
<p>
  JSX strips whitespace that includes a newline at the start or end of a line.
  That is why two elements on separate lines run together, and why
  <code>{" "}</code> exists &mdash; it is an explicit space that survives
  formatting. A missing space after a link is nearly always this.
</p>

<h3>The compile errors you will actually see</h3>
<div class="table-scroll"><table>
<thead><tr><th>Message</th><th>What it means</th></tr></thead>
<tbody>
<tr><td>Adjacent JSX elements must be wrapped</td><td>Two siblings at the top level. Add a fragment.</td></tr>
<tr><td>Objects are not valid as a React child</td><td>You rendered an object &mdash; often a whole record instead of a field, or a Date. Render a string.</td></tr>
<tr><td>Unexpected token, expected ","</td><td>Usually a stray <code>class=</code> or an unclosed tag a few lines above.</td></tr>
<tr><td>Each child in a list should have a unique "key"</td><td>A <code>.map()</code> without keys &mdash; see <a href="/react/react-lists-keys">lists and keys</a>.</td></tr>
<tr><td>Functions are not valid as a React child</td><td><code>{handleClick}</code> where you meant <code>{handleClick()}</code>, or a component used without angle brackets.</td></tr>
</tbody>
</table></div>

<h3>Escaping is automatic</h3>
<p>
  Anything you interpolate is escaped before it reaches the DOM, so
  <code>{"&lt;img onerror=alert(1)&gt;"}</code> renders as visible text rather
  than as a tag. That is React's main defence against XSS, and it is on by
  default &mdash; the only way past it is
  <code>dangerouslySetInnerHTML</code>, which is named that way deliberately.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "JSX is syntax sugar for function calls that return plain objects describing
    the UI. React reads those objects and works out what to change in the DOM,
    which is why JSX is an expression and why the rules feel like JavaScript
    rules rather than HTML rules."
  </p>
</div>`,
};
