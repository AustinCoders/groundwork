import type { Chapter } from "../types";

export const browserApisDeep: Chapter = {
  id: "browser-apis-deep",
  num: "I10",
  title: "Browser APIs, in depth",
  short: "Browser APIs",
  levels: ["intermediate"],
  practice: ["ex-query-param"],
  ready: true,
  subtitle: "Storage, the URL bar, and the event system — past what the beginner DOM chapter reached.",
  body: `<h3>Browser storage</h3>
<table>
  <tr>
    <th></th>
    <th><code>localStorage</code></th>
    <th><code>sessionStorage</code></th>
  </tr>
  <tr><td>Survives</td><td>closing the tab, the browser, the computer restarting</td><td>only this tab; gone when it closes</td></tr>
  <tr><td>Shared across tabs?</td><td>yes, same origin</td><td>no — each tab gets its own</td></tr>
  <tr><td>Capacity</td><td>~5-10MB, string values only</td><td>same</td></tr>
</table>
<pre><code>localStorage.setItem("theme", "dark");
localStorage.getItem("theme");     <span class="c">// "dark" — always a string</span>
localStorage.setItem("user", JSON.stringify({ name: "Ana" }));
JSON.parse(localStorage.getItem("user"));   <span class="c">// objects need to round-trip through JSON yourself</span>
localStorage.removeItem("theme");</code></pre>

<h3>URL and URLSearchParams</h3>
<div class="try">
  <pre><code>const url = new URL("https://shop.example.com/search?q=js&amp;page=2");
console.log(url.pathname);              <span class="c">// what happens?</span>
console.log(url.searchParams.get("q")); <span class="c">// what happens?</span>

url.searchParams.set("page", "3");
console.log(url.toString());   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  A parsed <code>URL</code> gives every piece
  (<code>pathname</code>, <code>hostname</code>, <code>protocol</code>)
  as its own property, and <code>searchParams</code> is a live,
  mutable view — editing it and reading <code>url.toString()</code>
  again reflects the change immediately, no manual query-string
  concatenation required.
</p>

<h3>History and IntersectionObserver, briefly</h3>
<pre><code>history.pushState({ page: 2 }, "", "/products?page=2");  <span class="c">// changes the URL bar, no page reload</span>
window.addEventListener("popstate", (e) =&gt; {
  console.log("back/forward pressed, state:", e.state);   <span class="c">// fires on browser back/forward, not on pushState itself</span>
});</code></pre>
<p class="sub">
  This is the mechanism every client-side router (React Router,
  Next.js's own routing) is built on — a URL that changes without a
  real navigation, plus a way to hear when the user manually goes
  back or forward.
</p>
<pre><code>const observer = new IntersectionObserver((entries) =&gt; {
  entries.forEach((entry) =&gt; {
    if (entry.isIntersecting) console.log(entry.target, "scrolled into view");
  });
});
document.querySelectorAll(".lazy-image").forEach((img) =&gt; observer.observe(img));</code></pre>
<p class="sub">
  The standard, efficient way to know when an element enters or leaves
  the viewport — infinite scroll, lazy-loaded images, and "animate in
  on scroll" effects all run on this instead of a
  <code>scroll</code> listener doing math on every single pixel of
  scrolling.
</p>

<h3>Events, in depth — live</h3>
<p>
  Click the innermost box below and watch the log. Every listener here
  is a real <code>addEventListener</code> call against the actual
  nested boxes on this page.
</p>
<div class="demo">
  <div class="demo__bar">Bubbling, capturing, and stopPropagation</div>
  <div class="demo__body">
    <div class="dom-sandbox" id="ev-sandbox">
      <div class="ev-box ev-box--outer" id="ev-outer">
        outer
        <div class="ev-box ev-box--middle" id="ev-middle">
          middle
          <div class="ev-box ev-box--inner" id="ev-inner">inner — click me</div>
        </div>
      </div>
    </div>
    <div class="demo__ctl">
      <label class="ev-check"><input type="checkbox" id="ev-capture" /> listen during the capture phase</label>
      <label class="ev-check"><input type="checkbox" id="ev-stop" /> inner listener calls stopPropagation()</label>
      <button class="btn btn--ghost" id="ev-clear" type="button">Clear log</button>
    </div>
    <div class="demo__term" id="ev-log"></div>
  </div>
</div>
<script>
(function () {
  var sandbox = document.getElementById("ev-sandbox");
  if (!sandbox) return;
  if (sandbox.dataset.demoInit) return;
  sandbox.dataset.demoInit = "1";

  var outer = document.getElementById("ev-outer");
  var middle = document.getElementById("ev-middle");
  var inner = document.getElementById("ev-inner");
  var captureBox = document.getElementById("ev-capture");
  var stopBox = document.getElementById("ev-stop");
  var logEl = document.getElementById("ev-log");

  function log(msg, cls) {
    var line = document.createElement("div");
    line.className = cls || "ok";
    line.textContent = msg;
    logEl.appendChild(line);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function makeHandler(name) {
    return function (e) {
      var phase = e.eventPhase === 1 ? "capture" : e.eventPhase === 3 ? "bubble" : "target";
      log(name + " listener fired (" + phase + " phase)");
      if (name === "inner" && stopBox.checked) {
        e.stopPropagation();
        log("inner called stopPropagation() — nothing above hears this click", "dim");
      }
    };
  }

  var outerHandler = makeHandler("outer");
  var middleHandler = makeHandler("middle");
  var innerHandler = makeHandler("inner");

  function attach() {
    var useCapture = captureBox.checked;
    outer.removeEventListener("click", outerHandler, true);
    outer.removeEventListener("click", outerHandler, false);
    middle.removeEventListener("click", middleHandler, true);
    middle.removeEventListener("click", middleHandler, false);
    inner.removeEventListener("click", innerHandler, true);
    inner.removeEventListener("click", innerHandler, false);
    outer.addEventListener("click", outerHandler, useCapture);
    middle.addEventListener("click", middleHandler, useCapture);
    inner.addEventListener("click", innerHandler, useCapture);
  }

  attach();
  captureBox.addEventListener("change", attach);

  document.getElementById("ev-clear").addEventListener("click", function () {
    logEl.innerHTML = "";
  });
})();
</script>
<p class="sub">
  With the capture checkbox off (the default), clicking "inner" logs
  <code>inner → middle → outer</code> — the event starts at the exact
  element clicked and <b>bubbles</b> upward through every ancestor
  listening for it. Check the capture box and it reverses to
  <code>outer → middle → inner</code> — capture-phase listeners run on
  the way <em>down</em>, before the event even reaches its target.
  Check "stopPropagation" and only the inner listener fires at all —
  the click never continues past it in either direction.
</p>

<h3>Delegation and custom events</h3>
<p>
  Bubbling is what makes <b>event delegation</b> work: one listener on
  a parent container, instead of one per child, checking
  <code>event.target</code> to see which child was actually clicked.
</p>
<pre><code>list.addEventListener("click", (e) =&gt; {
  const item = e.target.closest("li");    <span class="c">// works even if the click landed on a span INSIDE the li</span>
  if (!item) return;
  console.log("clicked:", item.dataset.id);
});
<span class="c">// one listener handles every current AND future &lt;li&gt; — no re-binding when items are added later</span></code></pre>
<pre><code>const updated = new CustomEvent("cart:updated", { detail: { count: 3 } });
cartElement.dispatchEvent(updated);

cartElement.addEventListener("cart:updated", (e) =&gt; {
  console.log("new count:", e.detail.count);
});</code></pre>
<p class="sub">
  A custom event bubbles and can be listened for exactly like a real
  browser event — the standard way for one part of a page to announce
  something happened without being directly wired to whoever might
  care.
</p>`,
};
