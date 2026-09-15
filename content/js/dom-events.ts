import type { Chapter } from "../types";

export const domEvents: Chapter = {
  id: "dom-events",
  num: "B14",
  title: "DOM & events",
  short: "DOM & events",
  levels: ["beginner"],
  practice: ["ex-mini-emitter", "ex-find-closest"],
  ready: true,
  subtitle: "The DOM is a live tree of objects — and JS can poke every branch of it.",
  body: `<p>
  Everything below runs against a <b>real, live sandbox</b> on this
  page, not a simulation — the buttons genuinely call
  <code>querySelector</code>, <code>classList</code>,
  <code>appendChild</code> and friends against the little page snippet
  right above them. Push every button before reading on; watching it
  happen is most of the lesson.
</p>

<div class="demo">
  <div class="demo__bar">Live DOM playground</div>
  <div class="demo__body">
    <div class="dom-sandbox" id="de-sandbox">
      <h4>Sandbox page</h4>
      <p id="de-text">Click a button below to mutate me.</p>
      <ul id="de-list">
        <li>Item 1</li>
        <li>Item 2</li>
      </ul>
      <form id="de-form">
        <input id="de-input" type="text" placeholder="type something, then submit" />
        <button class="btn" type="submit">Submit</button>
      </form>
    </div>
    <div class="demo__ctl">
      <button class="btn" id="de-text-btn" type="button">Change text</button>
      <button class="btn" id="de-class-btn" type="button">Toggle highlight</button>
      <button class="btn" id="de-add-btn" type="button">Add list item</button>
      <button class="btn" id="de-remove-btn" type="button">Remove last item</button>
      <button class="btn btn--ghost" id="de-reset-btn" type="button">Reset</button>
    </div>
    <p class="demo__note">Every click below is logged with the exact DOM call that ran.</p>
    <div class="demo__term" id="de-log"></div>
  </div>
</div>

<script>
(function () {
  var sandbox = document.getElementById("de-sandbox");
  if (!sandbox) return;
  if (sandbox.dataset.demoInit) return;
  sandbox.dataset.demoInit = "1";

  var textEl = document.getElementById("de-text");
  var listEl = document.getElementById("de-list");
  var formEl = document.getElementById("de-form");
  var inputEl = document.getElementById("de-input");
  var logEl = document.getElementById("de-log");

  var TEXTS = [
    "Click a button below to mutate me.",
    "That was textEl.textContent = \\"...\\" — a real DOM write."
  ];
  var textIndex = 0;
  var itemCount = 2;

  function log(msg) {
    var line = document.createElement("div");
    line.className = "ok";
    line.textContent = msg;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  document.getElementById("de-text-btn").addEventListener("click", function () {
    textIndex = (textIndex + 1) % TEXTS.length;
    textEl.textContent = TEXTS[textIndex];
    log('textEl.textContent = "' + TEXTS[textIndex] + '"');
  });

  document.getElementById("de-class-btn").addEventListener("click", function () {
    var on = textEl.classList.toggle("de-highlight");
    log('textEl.classList.toggle("de-highlight") -> ' + on);
  });

  document.getElementById("de-add-btn").addEventListener("click", function () {
    itemCount++;
    var li = document.createElement("li");
    li.textContent = "Item " + itemCount;
    listEl.appendChild(li);
    log("document.createElement + listEl.appendChild -> " + listEl.children.length + " items now");
  });

  document.getElementById("de-remove-btn").addEventListener("click", function () {
    if (!listEl.lastElementChild) { log("nothing left to remove"); return; }
    listEl.removeChild(listEl.lastElementChild);
    log("listEl.removeChild(listEl.lastElementChild) -> " + listEl.children.length + " items now");
  });

  formEl.addEventListener("submit", function (e) {
    e.preventDefault();
    log('submit caught — e.type="' + e.type + '", e.target.tagName="' + e.target.tagName + '", value="' + inputEl.value + '"');
    inputEl.value = "";
  });

  document.getElementById("de-reset-btn").addEventListener("click", function () {
    textIndex = 0;
    textEl.textContent = TEXTS[0];
    textEl.classList.remove("de-highlight");
    while (listEl.children.length > 2) listEl.removeChild(listEl.lastElementChild);
    itemCount = 2;
    logEl.innerHTML = "";
    log("reset to the starting state");
  });
})();
</script>

<h3>Selecting elements</h3>
<table>
  <tr>
    <th>Call</th>
    <th>Returns</th>
  </tr>
  <tr><td><code>document.getElementById(id)</code></td><td>one element, or <code>null</code> — no <code>#</code> prefix</td></tr>
  <tr><td><code>document.querySelector(css)</code></td><td>the first match for any CSS selector, or <code>null</code></td></tr>
  <tr><td><code>document.querySelectorAll(css)</code></td><td>a <code>NodeList</code> of every match — not a real array, but it has <code>.forEach</code></td></tr>
</table>
<pre><code>document.getElementById("de-text");         <span class="c">// exact id match</span>
document.querySelector("#de-text");         <span class="c">// same element, CSS-selector syntax</span>
document.querySelector(".btn");             <span class="c">// the FIRST element with class "btn"</span>
document.querySelectorAll(".btn");          <span class="c">// every element with class "btn"</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>querySelector</code>/
  <code>querySelectorAll</code> take real CSS selectors, so anything you
  can write in a stylesheet works here too —
  <code>"ul li:last-child"</code>, <code>"[data-active]"</code>,
  <code>"input[type=email]"</code>. That flexibility is why they've
  mostly replaced the older, narrower
  <code>getElementsByClassName</code>/<code>getElementsByTagName</code>.
</div>

<h3>Reading and changing content</h3>
<table>
  <tr>
    <th>Property</th>
    <th>Reads/writes</th>
    <th>Watch out for</th>
  </tr>
  <tr><td><code>el.textContent</code></td><td>plain text only</td><td>the safe default — never parses HTML</td></tr>
  <tr><td><code>el.innerHTML</code></td><td>markup, parsed as HTML</td><td>user-supplied text through here is an XSS hole — see the security chapter</td></tr>
  <tr><td><code>el.getAttribute(name)</code> / <code>setAttribute(name, v)</code></td><td>any HTML attribute, always as a string</td><td>use for custom/<code>data-*</code> attributes</td></tr>
  <tr><td><code>el.classList</code></td><td><code>.add()</code>, <code>.remove()</code>, <code>.toggle()</code>, <code>.contains()</code></td><td>the modern way to manage classes — no manual string splitting</td></tr>
</table>
<pre><code>el.textContent = "hello &lt;b&gt;there&lt;/b&gt;";  <span class="c">// literal text — tags show up as text, not bold</span>
el.innerHTML = "hello &lt;b&gt;there&lt;/b&gt;";     <span class="c">// actually renders as bold</span>

el.setAttribute("data-user-id", "42");
el.getAttribute("data-user-id");            <span class="c">// "42" — always a string, even for numbers</span>

el.classList.add("active");
el.classList.toggle("open");                <span class="c">// on if it was off, off if it was on</span>
el.classList.contains("active");            <span class="c">// true</span></code></pre>

<h3>Creating, appending, removing</h3>
<pre><code>const li = document.createElement("li");   <span class="c">// exists only in memory so far</span>
li.textContent = "New item";
listEl.appendChild(li);                     <span class="c">// now it's actually in the page</span>

listEl.removeChild(li);                     <span class="c">// gone from the page (still exists in memory until GC'd)</span>
li.remove();                                <span class="c">// modern shorthand — no need to know the parent</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ appendChild moves, it doesn't copy</span>
  If <code>li</code> is already somewhere in the page and you
  <code>appendChild</code> it again elsewhere, it's <em>relocated</em>,
  not duplicated — an element can only exist at one spot in the tree at
  a time. Need it in two places? Use
  <code>el.cloneNode(true)</code> (the <code>true</code> means "deep
  clone, children included") and append the clone.
</div>

<h3>Walking the tree — traversal properties</h3>
<table>
  <tr>
    <th>Property</th>
    <th>Gives you</th>
  </tr>
  <tr><td><code>el.parentElement</code></td><td>the parent, or <code>null</code> at the top</td></tr>
  <tr><td><code>el.children</code></td><td>element children only — text nodes excluded, unlike <code>el.childNodes</code></td></tr>
  <tr><td><code>el.nextElementSibling</code> / <code>previousElementSibling</code></td><td>the next/previous element at the same level, skipping whitespace text nodes</td></tr>
  <tr><td><code>el.closest(selector)</code></td><td>the nearest ancestor (including <code>el</code> itself) matching a CSS selector, or <code>null</code></td></tr>
</table>
<pre><code>function handleClick(event) {
  const row = event.target.closest("tr");   <span class="c">// works whether they clicked text, an icon, or the row</span>
  if (!row) return;                          <span class="c">// clicked something outside any row</span>
  console.log("row id:", row.dataset.id);
}
table.addEventListener("click", handleClick);</code></pre>
<p class="sub">
  <code>closest()</code> is what makes delegation practical for
  anything nested — the click target is rarely the element you actually
  care about (more often an icon or a span inside it), and
  <code>closest()</code> walks upward from wherever the click landed
  until it finds the ancestor that matters.
</p>

<h3>HTMLCollection vs NodeList — one of them is alive</h3>
<div class="try">
  <pre><code>const live = document.getElementsByClassName("item");    <span class="c">// HTMLCollection — LIVE</span>
const frozen = document.querySelectorAll(".item");         <span class="c">// NodeList — static</span>

console.log(live.length, frozen.length);   <span class="c">// 2 2</span>

listEl.appendChild(document.createElement("li"));

console.log(live.length, frozen.length);   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>3 2</code> — <code>live</code> is a live view: it re-counts the
  DOM every time you touch <code>.length</code> or index into it,
  because <code>getElementsByClassName</code>/<code>getElementsByTagName</code>
  return an <code>HTMLCollection</code>. <code>querySelectorAll</code>
  always returns a static <code>NodeList</code> — a snapshot taken the
  moment it ran, unaffected by later DOM changes. A live collection is a
  classic footgun inside a loop: removing an element while iterating a
  live <code>HTMLCollection</code> shifts every later index down by one
  and silently skips an element. Convert one to a real array first
  (<code>Array.from(live)</code>) before mutating while iterating.
</p>

<h3>Batch inserts with DocumentFragment</h3>
<pre><code>const fragment = document.createDocumentFragment();
for (const item of items) {
  const li = document.createElement("li");
  li.textContent = item;
  fragment.appendChild(li);                <span class="c">// appending to the fragment, not the live page yet</span>
}
listEl.appendChild(fragment);               <span class="c">// ONE reflow, however many items were added</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>listEl.appendChild(li)</code>
  inside a loop of 200 items makes the browser consider a layout
  recalculation up to 200 times. A <code>DocumentFragment</code> is an
  invisible, parent-less container — building the whole subtree inside
  it first and appending it once costs exactly one reflow, no matter how
  many children it holds. It's also emptied automatically once appended,
  so there's nothing left to clean up afterward.
</div>

<h3>Events — addEventListener and the event object</h3>
<pre><code>button.addEventListener("click", function (event) {
  console.log(event.type);          <span class="c">// "click"</span>
  console.log(event.target);        <span class="c">// the exact element that was clicked</span>
  console.log(event.currentTarget); <span class="c">// the element the LISTENER is attached to</span>
});</code></pre>
<p>
  <code>target</code> and <code>currentTarget</code> only differ when
  events <b>bubble</b> — a click starts at the exact element you tapped
  and travels upward through every ancestor that's listening.
  <code>target</code> stays fixed at where it started;
  <code>currentTarget</code> is always whichever element's listener is
  currently running. That bubbling is what makes event delegation work:
  put <em>one</em> listener on a parent list instead of one on every
  item, and check <code>event.target</code> inside it to see which item
  was actually clicked.
</p>

<h3>preventDefault — stopping the browser's own reaction</h3>
<p>
  Some elements have a built-in behavior for certain events — a form
  submits and reloads the page, an <code>&lt;a&gt;</code> navigates.
  <code>event.preventDefault()</code> cancels <em>that specific
  default</em> without stopping the event from continuing to bubble or
  running your own handler.
</p>
<pre><code>form.addEventListener("submit", function (event) {
  event.preventDefault();          <span class="c">// stop the page reload</span>
  const data = new FormData(form); <span class="c">// now handle it yourself — fetch(), validation, etc.</span>
});</code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> <code>preventDefault()</code> stops the
  browser's built-in reaction. <code>stopPropagation()</code> stops the
  event from bubbling further up the tree. They solve two different
  problems and it's common to need only one of them.
</div>

<h3>Keyboard events — key vs code</h3>
<pre><code>input.addEventListener("keydown", function (event) {
  console.log(event.key);    <span class="c">// "a", "A", "Enter", "Shift" — what the key actually produced</span>
  console.log(event.code);   <span class="c">// "KeyA", "KeyA", "Enter", "ShiftLeft" — the physical key, layout-independent</span>
  if (event.key === "Enter" &amp;&amp; !event.shiftKey) {
    event.preventDefault();
    submitForm();
  }
});</code></pre>
<p class="sub">
  Use <code>.key</code> for anything about what the user meant to type
  — checking for "Enter", "Escape", or a specific letter — it already
  accounts for Shift and the user's keyboard layout. Use
  <code>.code</code> only for physical-position logic, like WASD game
  controls, where you want the same key regardless of what character it
  produces on a different layout.
</p>

<h3>removeEventListener — and the function-identity trap</h3>
<div class="try">
  <pre><code>function onClick() { console.log("clicked"); }

button.addEventListener("click", onClick);
button.removeEventListener("click", onClick);   <span class="c">// works — same function reference</span>

button.addEventListener("click", () =&gt; console.log("clicked"));
button.removeEventListener("click", () =&gt; console.log("clicked"));  <span class="c">// does NOTHING</span></code></pre>
</div>
<div class="warn">
  <span class="ttl">⚠ removeEventListener needs the exact same function reference</span>
  Two arrow functions with identical bodies are still two different
  function <em>objects</em> — <code>removeEventListener</code> compares
  by reference, not by what the code says, so the second call above
  removes nothing and the original listener keeps firing forever. Store
  the handler in a named variable (or a class field) whenever it will
  need to be removed later.
</div>

<h3>Listener options: once, passive, and signal</h3>
<pre><code>button.addEventListener("click", handler, { once: true });   <span class="c">// auto-removes itself after firing once</span>

list.addEventListener("touchstart", handler, { passive: true });  <span class="c">// promises never to call preventDefault — lets the browser scroll immediately</span>

const controller = new AbortController();
button.addEventListener("click", handler, { signal: controller.signal });
input.addEventListener("input", handler, { signal: controller.signal });
<span class="c">// ... later, remove BOTH listeners in one call:</span>
controller.abort();</code></pre>
<p class="sub">
  <code>signal</code> is the newest of the three, and often the best
  answer to "clean up every listener a component added" — one shared
  <code>AbortController</code> across every <code>addEventListener</code>
  call removes all of them the moment <code>.abort()</code> runs, no
  manual bookkeeping of which handler needs which element.
  <code>passive: true</code> matters specifically for scroll-blocking
  events (<code>touchstart</code>, <code>wheel</code>) — without it, the
  browser has to wait and see whether the handler calls
  <code>preventDefault()</code> before it can start scrolling, a
  measurable jank source on mobile.
</p>

<h3>Forms and input values</h3>
<pre><code>input.value;                 <span class="c">// the current text — always a string, even for type="number"</span>
input.value = "";            <span class="c">// clearing it programmatically</span>

checkbox.checked;            <span class="c">// boolean — .value on a checkbox is NOT what's checked</span>
select.value;                <span class="c">// the selected &lt;option&gt;'s value</span>

input.addEventListener("input", e =&gt; console.log(e.target.value));  <span class="c">// fires on every keystroke</span>
input.addEventListener("change", e =&gt; console.log(e.target.value)); <span class="c">// fires once, on blur/commit</span></code></pre>
<p class="sub">
  <code>input</code> vs <code>change</code> trips a lot of people up:
  <code>input</code> is for "react live, as they type" (a character
  counter, live search); <code>change</code> is for "react once they're
  done" (a select dropdown, a checkbox, a field that loses focus).
</p>`,
};
