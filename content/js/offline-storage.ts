import type { Chapter } from "../types";

export const offlineStorage: Chapter = {
  id: "offline-storage",
  num: "I9",
  title: "Offline & storage",
  short: "Offline & storage",
  levels: ["intermediate"],
  practice: ["ex-cache-first", "ex-storage-picker"],
  ready: true,
  subtitle: "localStorage was the whole story two chapters ago. Past a few MB, it stops being enough.",
  body: `<h3>Why localStorage runs out</h3>
<p>
  <a href="/notes/regex-dates-apis">Already covered</a>: localStorage
  and sessionStorage hold roughly 5-10MB, strings only, and every
  operation is <b>synchronous</b> — a big read or write briefly blocks
  the main thread. Fine for a theme preference or a small cache; the
  wrong tool the moment "small" stops being true.
</p>

<h3>IndexedDB</h3>
<p>
  A real, asynchronous, transactional database built into the
  browser — structured records (not just strings), indexes to query
  by, and a storage ceiling set by available disk space rather than a
  fixed few megabytes.
</p>
<pre><code>const request = indexedDB.open("my-app-db", 1);

request.onupgradeneeded = (event) =&gt; {
  const db = event.target.result;
  db.createObjectStore("notes", { keyPath: "id" });   <span class="c">// runs once, on first open or version bump</span>
};

request.onsuccess = (event) =&gt; {
  const db = event.target.result;
  const tx = db.transaction("notes", "readwrite");
  tx.objectStore("notes").put({ id: 1, text: "buy milk" });
  tx.oncomplete = () =&gt; console.log("saved");
};</code></pre>
<div class="warn">
  <span class="ttl">⚠ Everything here is event-based, not promise-based</span>
  The raw API predates promises entirely — <code>onsuccess</code>/
  <code>onerror</code> callbacks, not <code>await</code>. Most real
  projects reach for a small wrapper library (<code>idb</code> is the
  common one) that wraps the same operations in real promises, rather
  than hand-rolling callback plumbing for every query.
</div>

<h3>The Cache API</h3>
<pre><code>const cache = await caches.open("v1");
await cache.put("/api/products", new Response(JSON.stringify(products)));

const cached = await cache.match("/api/products");
if (cached) console.log(await cached.json());</code></pre>
<p class="sub">
  Stores actual <code>Request</code>/<code>Response</code> pairs —
  built specifically to cache network responses, not arbitrary data.
  Used directly, or (far more often) driven from inside a service
  worker's <code>fetch</code> handler below, intercepting real network
  requests and serving a cached response instead of hitting the
  network at all.
</p>

<h3>Service Worker lifecycle</h3>
<p>
  A service worker is a script that runs separately from any page,
  sitting between the app and the network — it can only be installed
  over HTTPS (or <code>localhost</code>), and it goes through a fixed
  sequence of events every browser follows the same way.
</p>
<table>
  <tr><th>Event</th><th>Happens</th></tr>
  <tr><td><code>install</code></td><td>once, the first time — the usual place to pre-cache the app shell</td></tr>
  <tr><td><code>activate</code></td><td>once this version takes control — clean up old caches from a previous version here</td></tr>
  <tr><td><code>fetch</code></td><td>fires for every network request the page makes, for as long as the worker is active — this is the hook that makes offline actually work</td></tr>
</table>
<pre><code>self.addEventListener("install", (event) =&gt; {
  event.waitUntil(
    caches.open("v1").then((cache) =&gt; cache.addAll(["/", "/app.js", "/style.css"]))
  );
});

self.addEventListener("fetch", (event) =&gt; {
  event.respondWith(
    caches.match(event.request).then((cached) =&gt; cached || fetch(event.request))
  );   <span class="c">// cache-first: serve cached if we have it, otherwise hit the network</span>
});</code></pre>
<p class="sub">
  <code>event.waitUntil()</code> tells the browser "don't finish this
  lifecycle step until this promise settles" — without it, the worker
  could finish installing before the cache is actually populated.
  <code>event.respondWith()</code> is the equivalent for
  <code>fetch</code>: it hijacks the response the page will actually
  receive.
</p>

<h3>PWA basics</h3>
<pre><code>{
  "name": "My App",
  "short_name": "MyApp",
  "start_url": "/",
  "display": "standalone",
  "theme_color": "#1f3a73",
  "background_color": "#fffdf6",
  "icons": [{ "src": "/icon-512.png", "sizes": "512x512", "type": "image/png" }]
}</code></pre>
<p>
  A <code>manifest.json</code>, linked from the page's
  <code>&lt;head&gt;</code>, plus a registered service worker, is the
  entire minimum bar for "installable" — the browser's own criteria,
  not a separate framework. <code>display: "standalone"</code> is what
  drops the browser chrome (address bar, tabs) once installed, so it
  opens looking like a real app rather than a browser tab.
</p>

<h3>Being online-aware</h3>
<pre><code>if (!navigator.onLine) {
  showOfflineBanner();
}
window.addEventListener("online", () =&gt; console.log("back online"));
window.addEventListener("offline", () =&gt; console.log("connection lost"));</code></pre>
<div class="warn">
  <span class="ttl">⚠ navigator.onLine is optimistic, not reliable</span>
  It reports whether the device has a network connection at all — wifi
  connected, but the actual internet down, still reads
  <code>true</code>. Treat it as a hint for UI (show a banner), never
  as proof a request will actually succeed; still handle a failed
  <code>fetch</code> regardless of what <code>navigator.onLine</code>
  said a moment earlier.
</div>
<p>
  <b>Background sync</b> is the piece that closes the loop: register a
  sync event from the page (<code>registration.sync.register("send-queued-posts")</code>),
  and the browser holds onto it, firing the service worker's
  <code>sync</code> event once connectivity actually returns — even if
  the page itself has been closed the whole time. It's how "your
  message will send once you're back online" gets implemented for
  real, instead of just queuing in memory and hoping the tab stays
  open.
</p>

<h3>Storage, side by side</h3>
<table>
  <tr>
    <th></th>
    <th>localStorage</th>
    <th>sessionStorage</th>
    <th>IndexedDB</th>
    <th>Cache API</th>
    <th>Cookies</th>
  </tr>
  <tr><td>Size</td><td>~5-10MB</td><td>~5-10MB</td><td>disk-space limited</td><td>disk-space limited</td><td>~4KB each</td></tr>
  <tr><td>Data shape</td><td>strings</td><td>strings</td><td>structured objects, binary</td><td>Request/Response pairs</td><td>strings</td></tr>
  <tr><td>Sync or async</td><td>sync</td><td>sync</td><td>async</td><td>async</td><td>sync (via <code>document.cookie</code>)</td></tr>
  <tr><td>Survives tab close?</td><td>yes</td><td class="tone-bad">no</td><td>yes</td><td>yes</td><td>yes, until expiry</td></tr>
  <tr><td>Sent to the server automatically?</td><td class="tone-bad">no</td><td class="tone-bad">no</td><td class="tone-bad">no</td><td class="tone-bad">no</td><td class="tone-yes">yes, every matching request</td></tr>
</table>
<p class="sub">
  That last row is the one with real consequences — it's exactly why
  <a href="/notes/security">the security chapter</a>'s CSRF discussion
  is about cookies specifically and not localStorage: only a cookie
  rides along on a request automatically, whether your own JavaScript
  asked for that or not.
</p>`,
};
