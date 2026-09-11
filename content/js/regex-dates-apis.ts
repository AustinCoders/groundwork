import type { Chapter } from "../types";

export const regexDatesApis: Chapter = {
  id: "regex-dates-apis",
  num: "I6",
  title: "Regex, dates & browser APIs",
  short: "Regex, dates & APIs",
  levels: ["intermediate"],
  practice: ["ex-extract-hashtags", "ex-query-param"],
  ready: true,
  subtitle: "Four unrelated toolboxes every real app ends up reaching for.",
  body: `<h3>Regex — the essentials</h3>
<pre><code>/abc/         <span class="c">// literal — matches "abc" exactly</span>
/abc/i        <span class="c">// flag: i = case-insensitive</span>
/abc/g        <span class="c">// flag: g = find ALL matches, not just the first</span>
/(\\w+)@(\\w+)/  <span class="c">// ( ) = a capturing group — grabbed separately from the full match</span></code></pre>
<div class="try">
  <pre><code>const text = "contact: ana@example.com today";
const match = text.match(/(\\w+)@(\\w+)\\.com/);
console.log(match[0]);   <span class="c">// the whole match — what happens?</span>
console.log(match[1]);   <span class="c">// group 1 — what happens?</span>
console.log(match[2]);   <span class="c">// group 2 — what happens?</span></code></pre>
</div>
<p class="sub">
  <code>"ana@example.com"</code>, then <code>"ana"</code>, then
  <code>"example"</code> — the full match is always index 0, and every
  parenthesized group after it fills in one more slot, in order.
</p>
<pre><code><span class="c">// Named groups — same idea, readable by name instead of position</span>
const parsed = "2024-01".match(/(?&lt;year&gt;\\d{4})-(?&lt;month&gt;\\d{2})/);
parsed.groups.year;    <span class="c">// "2024"</span>
parsed.groups.month;   <span class="c">// "01"</span>

"2024-01-15".replace(/(\\d+)-(\\d+)-(\\d+)/, "$3/$2/$1");   <span class="c">// "15/01/2024" — $1/$2/$3 refer back to the groups</span>

[..."a1 b22 c333".matchAll(/[a-z](\\d+)/g)].map((m) =&gt; m[1]);  <span class="c">// ["1", "22", "333"] — every match, not just the first</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ A /g regex remembers where it left off</span>
  <code>.test()</code> and <code>.exec()</code> on a regex literal
  with the <code>g</code> flag mutate the regex object's own
  <code>lastIndex</code> — the next call resumes searching from there,
  not from the start of the string.
</div>
<div class="try">
  <pre><code>const stateful = /\\d/g;
console.log(stateful.test("a1"));   <span class="c">// what happens?</span>
console.log(stateful.test("a1"));   <span class="c">// SAME regex, same string — what happens?</span>
console.log(stateful.test("a1"));   <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>true</code>, <code>false</code>, <code>true</code> — alternating,
  on the exact same input. First call finds the digit and leaves
  <code>lastIndex</code> at <code>2</code>; second call starts
  searching from index <code>2</code> in a 2-character string, finds
  nothing, and resets <code>lastIndex</code> back to <code>0</code>;
  third call starts over and finds it again. Reusing one global-flagged
  regex object across unrelated calls is exactly how this bites — a
  fresh <code>/\\d/g</code> literal each time, or dropping the
  <code>g</code> flag for a one-shot <code>.test()</code>, avoids it.
</p>

<h3>Dates</h3>
<div class="try">
  <pre><code>const d = new Date(2024, 0, 15);   <span class="c">// year, MONTH (0-indexed!), day</span>
console.log(d.getMonth());   <span class="c">// what happens?</span>
console.log(d.getDate());    <span class="c">// what happens?</span></code></pre>
</div>
<p class="sub">
  <code>0</code>, then <code>15</code> — <code>getMonth()</code> is
  January-is-<code>0</code>, a decision baked into
  <code>Date</code> since the original Java date API it was modeled on
  in 1995, and never fixed since without breaking every existing
  script.
</p>
<pre><code>const start = new Date("2024-01-15");
const end = new Date("2024-02-15");
(end - start) / 86_400_000;   <span class="c">// 31 — subtracting Dates gives milliseconds; divide to get days</span></code></pre>
<div class="warn">
  <span class="ttl">⚠ Why almost nobody hand-rolls date math</span>
  Time zones, daylight saving transitions, leap years, and leap
  seconds all make "add one day" genuinely harder than
  <code>+ 86400000</code> — a DST boundary can make that arithmetic
  land on the wrong calendar day entirely. This is the real reason
  libraries like <code>date-fns</code> exist, and why the language
  now has <code>Temporal</code>: not laziness, a correctness problem
  that's easy to get subtly wrong by hand.
</div>
<pre><code>Temporal.PlainDate.from("2024-01-31").add({ months: 1 }).toString();
<span class="c">// "2024-02-29" — calendar-aware: no milliseconds, no time zone, no DST surprise</span></code></pre>
<p class="sub">
  <code>Temporal</code> is the built-in successor to <code>Date</code>. It
  ships in Firefox (139+) and Chrome (144+); check support for the rest
  of your audience, or load a polyfill, before relying on it.
</p>
<pre><code>new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(d);
<span class="c">// "15 January 2024" — locale-correct formatting, no manual string building</span>

new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" }).format(150000);
<span class="c">// "₹1,50,000.00" — Indian digit grouping, handled for you</span></code></pre>

<h3>Browser storage</h3>
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
