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
