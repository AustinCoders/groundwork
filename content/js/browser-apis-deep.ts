import type { Chapter } from "../types";

export const browserApisDeep: Chapter = {
  id: "browser-apis-deep",
  num: "I10",
  title: "Browser APIs, in depth",
  short: "Browser APIs",
  levels: ["intermediate"],
  practice: ["ex-query-param", "ex-build-query-string"],
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

<h4>Dry run: parsing and mutating the URL step by step</h4>
<table>
  <tr><th>Step</th><th>Code</th><th>Result</th></tr>
  <tr><td>1</td><td><code>new URL("https://shop.example.com/search?q=js&amp;page=2")</code></td><td>parses into pieces — pathname is <code>"/search"</code>, <code>searchParams</code> holds <code>q=js</code> and <code>page=2</code></td></tr>
  <tr><td>2</td><td><code>url.pathname</code></td><td><code>"/search"</code> — just the path, no query string</td></tr>
  <tr><td>3</td><td><code>url.searchParams.get("q")</code></td><td><code>"js"</code></td></tr>
  <tr><td>4</td><td><code>url.searchParams.set("page", "3")</code></td><td>mutates the live <code>searchParams</code> view in place — <code>page</code> goes from 2 to 3</td></tr>
  <tr><td>5</td><td><code>url.toString()</code></td><td><code>"https://shop.example.com/search?q=js&amp;page=3"</code> — the change shows up automatically</td></tr>
</table>
<p class="sub">
  Step 4 never touches <code>url.href</code> or <code>url.search</code> directly — <code>searchParams</code> is a live view onto the same <code>URL</code> object, so mutating it is enough for step 5's <code>toString()</code> to reflect the change.
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
</p>

<h3>Clipboard — reading and writing outside the page</h3>
<pre><code>await navigator.clipboard.writeText("copied!");        <span class="c">// should run from a real user gesture (a click), not on page load</span>

button.addEventListener("click", async () =&gt; {
  const text = await navigator.clipboard.readText();   <span class="c">// asks permission the first time</span>
  console.log("clipboard had:", text);
});</code></pre>
<p class="sub">
  Both methods are <code>async</code> and both are gated behind a
  <b>secure context</b> (HTTPS or localhost) and, for anything beyond a
  same-origin write, a permission prompt. Reading the clipboard
  specifically is the more restricted half — a page silently reading
  whatever's on a user's clipboard on load would be a real privacy
  problem, so the browser insists on both a secure context and, in most
  browsers, the read happening inside a direct response to user input.
</p>

<h3>Page Visibility — knowing when nobody's looking</h3>
<pre><code>document.addEventListener("visibilitychange", () =&gt; {
  if (document.visibilityState === "hidden") {
    pauseVideo();
    stopPolling();
  } else {
    resumePolling();
  }
});</code></pre>
<p class="sub">
  A tab that's minimized, in the background, or on a phone whose screen
  just locked doesn't stop running JavaScript — timers keep firing —
  but the user isn't watching. <code>visibilitychange</code> is the
  standard hook for pausing expensive work (video, polling, animation)
  exactly then, and resuming it the moment the tab becomes visible
  again, rather than burning battery and bandwidth on a tab nobody's
  looking at.
</p>

<h3>BroadcastChannel — talking to your own other tabs</h3>
<pre><code>const channel = new BroadcastChannel("cart-updates");

channel.postMessage({ itemCount: 3 });                 <span class="c">// every OTHER tab/window on the same origin hears this</span>

channel.addEventListener("message", (event) =&gt; {
  console.log("another tab said:", event.data);
});</code></pre>
<p class="sub">
  Same-origin tabs can already coordinate through the
  <code>storage</code> event (which fires when another tab writes to
  <code>localStorage</code>), but that only works as a side effect of
  actually storing something. <code>BroadcastChannel</code> is built
  for exactly this job directly — send a message to every other open
  tab of the same site, with no storage write required at all. Closing
  every tab connected to a channel is the only cleanup needed; there's
  no server, no polling, just same-origin tabs talking directly.
</p>

<h3>Web Share and Geolocation, briefly</h3>
<pre><code>await navigator.share({ title: "Check this out", url: location.href });   <span class="c">// hands off to the OS's native share sheet</span>

navigator.geolocation.getCurrentPosition(
  (pos) =&gt; console.log(pos.coords.latitude, pos.coords.longitude),
  (err) =&gt; console.log("denied or unavailable:", err.message)
);</code></pre>
<p class="sub">
  Both need a real user gesture and a secure context, and both are
  permission-gated the same way clipboard reads are.
  <code>navigator.share</code> only exists where the OS has a native
  share sheet to hand off to — always feature-detect
  (<code>if (navigator.share)</code>) and fall back to your own share
  buttons where it's missing.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "The browser hands you storage, URLs, observers, the clipboard, cross-tab messaging and visibility as APIs, and the skill is picking the smallest one that fits — <code>URLSearchParams</code> over string slicing, <code>IntersectionObserver</code> over scroll listeners, delegation over a listener per element — while remembering many are asynchronous or permission-gated."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain why editing <code>url.searchParams</code> and calling <code>url.toString()</code> reflects the change immediately, with no manual string concatenation.</li>
    <li>Predict the click log order in the bubbling demo with the capture checkbox on versus off, and say why capture-phase listeners fire first.</li>
    <li>Explain what <code>event.stopPropagation()</code> actually stops, and why event delegation depends on propagation still working elsewhere.</li>
    <li>Explain why <code>visibilitychange</code>, not a periodic check, is the right hook for pausing video or polling when a tab isn't visible.</li>
    <li>Name two APIs from this chapter that require both a secure context and a real user gesture, and explain why that restriction exists.</li>
  </ul>
</div>`,
};
