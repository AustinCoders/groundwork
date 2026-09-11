import type { Chapter } from "../types";

export const realtimeConnections: Chapter = {
  id: "realtime-connections",
  num: "I8",
  title: "Real-time connections",
  short: "Real-time connections",
  levels: ["intermediate"],
  practice: ["ex-backoff-delay", "ex-reconnect-tracker"],
  ready: true,
  subtitle: "fetch answers one question at a time. This is what answers a stream of them.",
  body: `<p>
  Nothing below is a runnable example — every option here needs
  a real server on the other end, so a live demo in this sandbox would
  either hang or fail for reasons that have nothing to do with the
  code being right or wrong. The one genuinely testable piece —
  reconnect backoff — gets its own runnable example further down.
</p>

<h3>WebSocket</h3>
<p>
  A single, long-lived, <b>two-way</b> connection — either side can
  send a message at any time, with no request/response pairing
  required. It starts as a normal HTTP request that asks to
  <b>upgrade</b> the connection; once the server agrees, the same TCP
  connection stops speaking HTTP and starts speaking the WebSocket
  frame format instead.
</p>
<pre><code>const socket = new WebSocket("wss://example.com/chat");

socket.onopen = () =&gt; socket.send(JSON.stringify({ type: "join", room: "general" }));
socket.onmessage = (event) =&gt; {
  const msg = JSON.parse(event.data);
  console.log("received:", msg);
};
socket.onerror = (event) =&gt; console.error("socket error", event);
socket.onclose = (event) =&gt; console.log("closed:", event.code, event.reason);

socket.send(JSON.stringify({ type: "message", text: "hi" }));</code></pre>
<table>
  <tr><th><code>socket.readyState</code></th><th>Means</th></tr>
  <tr><td><code>0</code> — <code>CONNECTING</code></td><td>handshake in progress</td></tr>
  <tr><td><code>1</code> — <code>OPEN</code></td><td>ready — the only state <code>.send()</code> actually works in</td></tr>
  <tr><td><code>2</code> — <code>CLOSING</code></td><td>closing handshake started</td></tr>
  <tr><td><code>3</code> — <code>CLOSED</code></td><td>fully closed, or never connected at all</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ A WebSocket does not reconnect itself</span>
  A dropped connection — the server restarts, a phone switches from
  wifi to mobile data — just fires <code>onclose</code> and stops
  there. Every real WebSocket client reconnects manually: catch
  <code>onclose</code>, wait (ideally with backoff — see below), and
  open a fresh <code>new WebSocket(url)</code>.
</div>

<h3>Server-Sent Events (EventSource)</h3>
<p>
  The one-directional version — server to client only, over a plain
  HTTP response the server keeps open and keeps writing to. The
  browser's built-in <code>EventSource</code> handles the entire
  protocol, including something WebSocket makes you build yourself:
  <b>automatic reconnection</b>.
</p>
<pre><code>const events = new EventSource("/api/notifications");

events.onmessage = (event) =&gt; console.log("update:", event.data);
events.addEventListener("user-joined", (event) =&gt; {   <span class="c">// named events, sent as "event: user-joined" in the stream</span>
  console.log("joined:", JSON.parse(event.data));
});
events.onerror = () =&gt; console.log("connection lost — EventSource is already retrying on its own");</code></pre>
<p class="sub">
  If the connection drops, <code>EventSource</code> automatically
  retries on its own — no manual reconnect logic needed at all, which
  is the entire trade <code>EventSource</code> makes for giving up the
  "client can send things too" half of WebSocket.
</p>
<div class="sticky mint">
  <span class="ttl">Rule</span> Need the client to send data too?
  WebSocket. Only need the server pushing updates —live scores, a
  notification feed, streaming a long response? <code>EventSource</code>
  is simpler and reconnects itself for free.
</div>

<h3>Long polling</h3>
<pre><code>async function poll(attempt = 0) {
  try {
    const response = await fetch("/api/updates?wait=30");   <span class="c">// server HOLDS this request open until there's something to say</span>
    if (!response.ok) throw new Error("HTTP " + response.status);
    handleUpdate(await response.json());
    poll();   <span class="c">// success: ask again immediately — the "long" part is the server delaying its response, not the client waiting</span>
  } catch {
    setTimeout(() =&gt; poll(attempt + 1), backoffDelay(attempt));   <span class="c">// failure: back off instead of hammering a server that's down</span>
  }
}
poll();</code></pre>
<p class="sub">
  <code>backoffDelay</code> is built at the end of this chapter — the
  same wait-longer-after-each-failure rule applies to every reconnect
  strategy here, long polling included.
</p>
<p>
  Ordinary polling means asking every N seconds regardless of whether
  anything changed. <b>Long</b> polling flips who waits: the client
  asks, and the server simply doesn't answer until it has something to
  say (or a timeout passes) — one request, held open, instead of
  hundreds of empty ones. It predates both options above and is
  strictly worse than either when they're available — but it's plain
  HTTP, so it still works through the rare restrictive proxy or old
  environment that blocks a WebSocket upgrade or doesn't handle a
  held-open SSE stream well.
</p>

<h3>Deciding between the three</h3>
<table>
  <tr>
    <th></th>
    <th>WebSocket</th>
    <th>SSE / EventSource</th>
    <th>Long polling</th>
  </tr>
  <tr><td>Direction</td><td>both ways</td><td>server → client only</td><td>both, but request/response shaped</td></tr>
  <tr><td>Reconnects itself</td><td class="tone-bad">no — build it yourself</td><td class="tone-yes">yes, built in</td><td class="tone-warn">it's just fetch — call it again</td></tr>
  <tr><td>Good fit</td><td>chat, multiplayer, collaborative editing</td><td>live feeds, notifications, progress updates</td><td>fallback when neither above is available</td></tr>
  <tr><td>Overhead</td><td>lowest per message, once connected</td><td>low, plain HTTP</td><td>a full request every cycle</td></tr>
</table>

<h3>Reconnecting without hammering the server</h3>
<p>
  Reconnecting instantly, every time, in a loop is exactly how a
  client turns a brief server hiccup into a self-inflicted denial of
  service against that same server the moment it comes back. The fix
  is the same shape as
  <a href="/notes/async-properly">the retry pattern from a few chapters
  back</a>: wait longer after each consecutive failure.
</p>
<div class="try">
  <pre><code>function backoffDelay(attempt, base = 500, max = 30000) {
  const exp = Math.min(base * 2 ** attempt, max);   <span class="c">// doubles each attempt, capped</span>
  return Math.round(exp / 2 + Math.random() * (exp / 2));   <span class="c">// jitter: random within the top half of the range</span>
}

for (let attempt = 0; attempt &lt; 6; attempt++) {
  console.log("attempt", attempt, "-&gt;", backoffDelay(attempt), "ms");
}</code></pre>
</div>
<p class="sub">
  Run it — the delay roughly doubles each attempt, then flattens out
  at the cap. The randomness (<b>jitter</b>) matters as much as the
  growth: without it, every client that dropped at the same moment
  (a server restart takes the whole fleet down at once) reconnects at
  exactly the same moment too, arriving as a synchronized thundering
  herd instead of a spread-out trickle.
</p>
<pre><code>let attempt = 0;
function connect() {
  const socket = new WebSocket(url);
  socket.onopen = () =&gt; { attempt = 0; };   <span class="c">// reset the counter once a connection actually succeeds</span>
  socket.onclose = () =&gt; {
    setTimeout(connect, backoffDelay(attempt));
    attempt++;
  };
}
connect();</code></pre>`,
};
