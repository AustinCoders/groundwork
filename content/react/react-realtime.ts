import type { Chapter } from "../types";

export const reactRealtime: Chapter = {
  id: "react-realtime",
  num: "I21",
  title: "Real-time UI",
  short: "Real-time UI",
  levels: ["intermediate"],
  practice: ["ex-react-parse-sse", "ex-comp-realtime-feed"],
  ready: true,
  subtitle:
    "Polling, Server-Sent Events or a WebSocket: choose the smallest thing that works, then handle the connection dropping.",
  body: `<h3>Three ways to hear about a change</h3>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Polling</th><th>Server-Sent Events</th><th>WebSocket</th></tr></thead>
<tbody>
<tr><td>Direction</td><td>client asks</td><td>server to client only</td><td>both ways</td></tr>
<tr><td>Transport</td><td>ordinary HTTP</td><td>one long HTTP response</td><td>its own protocol, upgraded from HTTP</td></tr>
<tr><td>Reconnects itself</td><td>n/a</td><td><span class="chip tone-yes">yes</span></td><td><span class="chip tone-bad">no</span></td></tr>
<tr><td>Data</td><td>anything</td><td>text</td><td>text or binary</td></tr>
<tr><td>Fits</td><td>dashboards, slow changes</td><td>notifications, feeds, progress, live status, LLM output</td><td>chat, multiplayer, collaborative editing, games</td></tr>
</tbody>
</table></div>
<p>
  Most "real-time" features are one-way: the server has news and the browser
  displays it. That is exactly what Server-Sent Events do, and it is far less
  machinery than a WebSocket. Reach for a socket when the <em>client</em> also
  sends a steady stream of messages and latency matters.
</p>

<div class="bx is-prim">
  <span class="ttl">Start with polling</span>
  <p>
    If a five or ten second delay is acceptable, refetching on an interval
    is a single option on a query: <code>refetchInterval: 10_000</code>. It works
    through every proxy and serverless platform, needs no new infrastructure, and
    fails in obvious ways. Move to a stream when the delay is noticeable to the
    user or the polling load becomes the cost.
  </p>
</div>

<h3>Server-Sent Events</h3>
<pre><code>const source = new EventSource("/api/notifications", { withCredentials: true });

source.onmessage = (e) =&gt; console.log(JSON.parse(e.data));          <span class="c">// unnamed events</span>
source.addEventListener("order", (e) =&gt; console.log(e.data));       <span class="c">// event: order</span>
source.onerror = () =&gt; { <span class="c">/* the browser is already reconnecting */</span> };

source.close();</code></pre>
<p>
  The wire format is plain text: a response with the type
  <code>text/event-stream</code>, and each message a block of
  <code>field: value</code> lines ended by a blank line.
</p>
<pre><code>id: 42
event: order
data: {"id": 7, "status": "shipped"}

: a comment line, often used as a heartbeat</code></pre>
<p>
  Three things come free. The browser <b>reconnects automatically</b>; the server
  can tune the wait with a <code>retry:</code> field in milliseconds. If a message
  carried an <code>id</code>, the reconnect sends it back as a
  <code>Last-Event-ID</code> header, so the server can replay what was missed.
  And named events let one connection carry several kinds of message.
</p>
<pre><code><span class="c">// app/api/notifications/route.ts — a Route Handler</span>
export async function GET() {
  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    start(controller) {
      const timer = setInterval(() =&gt; {
        controller.enqueue(encoder.encode("data: " + JSON.stringify({ at: Date.now() }) + "\\n\\n"));
      }, 5000);
      <span class="c">// clear the timer when the client disconnects</span>
    },
  });
  return new Response(stream, {
    headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache" },
  });
}</code></pre>
<p>Its limits are worth knowing before you choose it:</p>
<ul>
  <li><b>No custom headers.</b> <code>EventSource</code> cannot set an <code>Authorization</code> header, so authenticate with a cookie (<code>withCredentials</code>) or a short-lived token in the URL.</li>
  <li><b>Six connections per domain over HTTP/1.1,</b> across every tab. Over HTTP/2 the limit is negotiated and defaults to 100, so serve it over HTTP/2.</li>
  <li><b>Text only,</b> and one direction. Send the client's messages with an ordinary <code>fetch</code>.</li>
  <li><b>Open connections cost something on serverless.</b> A function platform caps how long a request may stay open, so a long-lived stream may need a different host, or a managed real-time service.</li>
</ul>

<h3>WebSocket</h3>
<pre><code>const ws = new WebSocket("wss://example.com/live");

ws.onopen = () =&gt; ws.send(JSON.stringify({ type: "join", room: "a" }));
ws.onmessage = (e) =&gt; handle(JSON.parse(e.data));
ws.onclose = (e) =&gt; console.log(e.code, e.reason, e.wasClean);</code></pre>
<p>
  A WebSocket gives you nothing for free that SSE does. It does not reconnect, it
  does not resume, and a connection that silently died (a laptop lid, a mobile
  network handover) may not tell you for minutes. You write the reconnect logic,
  and you send periodic pings to notice a dead connection. The API also has no
  <b>backpressure</b>: if messages arrive faster than you process them, they
  pile up in memory, so a firehose needs throttling or the newer
  <code>WebSocketStream</code>. The server side usually cannot live in a
  serverless function, so a socket typically means a separate long-running
  service.
</p>

<h3>Reconnect with backoff, always</h3>
<pre><code>function reconnectDelay(attempt, base = 500, max = 30_000, random = Math.random) {
  const ceiling = Math.min(max, base * 2 ** attempt);
  return random() * ceiling;                         <span class="c">// "full jitter"</span>
}</code></pre>
<p>
  If a server restarts and ten thousand clients reconnect on the same fixed
  schedule, they arrive together and knock it over again. Exponential growth
  spreads the retries out and the <b>jitter</b> &mdash; a random fraction of the
  delay &mdash; stops them re-synchronising. Reset the attempt counter once a
  connection has actually stayed up, not the moment it opens.
</p>

<h3>The hook, and where the connection lives</h3>
<pre><code>function useEventStream(url, onEvent) {
  const handler = useEffectEvent(onEvent);            <span class="c">// always the latest, never a dependency</span>

  useEffect(() =&gt; {
    const source = new EventSource(url);
    source.onmessage = (e) =&gt; handler(JSON.parse(e.data));
    return () =&gt; source.close();                      <span class="c">// Strict Mode's remount closes the first one</span>
  }, [url]);
}</code></pre>
<p>
  The cleanup is the whole point: without <code>close()</code>, every remount
  opens another connection, and Strict Mode makes that visible in development
  immediately. See <a href="/react/react-effects-depth">effects in depth</a> for
  why the handler goes through <code>useEffectEvent</code> instead of the
  dependency array.
</p>
<p>
  Where the connection is opened matters as much as how. One socket per component
  means twenty rows open twenty sockets. Open it once &mdash; in a provider, or a
  module that exposes a subscription through
  <a href="/react/react-sync-external-store">useSyncExternalStore</a> &mdash; and
  let components subscribe to the messages they care about.
</p>

<h3>Put incoming data where the rest of the data lives</h3>
<pre><code>useEventStream("/api/orders/stream", (event) =&gt; {
  queryClient.setQueryData(["orders", event.id], (old) =&gt; ({ ...old, ...event }));
});</code></pre>
<p>
  A pushed message is just a server-state update that arrived by a different
  route. Writing it into the <a href="/react/react-server-state">query cache</a>
  means every component reading that order updates, the initial fetch and the
  live updates share one source of truth, and there is no second copy in
  <code>useState</code> to drift. Alternatively, treat the message as a signal
  &mdash; "orders changed" &mdash; and invalidate the query so it refetches.
</p>

<h3>What breaks in production</h3>
<ul>
  <li><b>The gap.</b> Between the initial fetch and the stream opening, or across a reconnect, events are missed. Fix it with <code>Last-Event-ID</code> replay, or refetch on every reconnect.</li>
  <li><b>Duplicates and order.</b> Give events ids or sequence numbers and make handlers idempotent, so applying one twice changes nothing.</li>
  <li><b>Render storms.</b> A hundred messages a second cannot be a hundred renders. Buffer into a ref and flush once per animation frame, or update through a <a href="/react/react-concurrent">transition</a>, and virtualise long lists.</li>
  <li><b>Hidden tabs.</b> Close or slow the connection on <code>visibilitychange</code>; a background tab does not need live updates.</li>
  <li><b>No status in the UI.</b> Show "reconnecting…" and disable actions that need the connection, or users act on stale data without knowing.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Most real-time UI is one-way, so I start with polling, move to Server-Sent
    Events when I need push because the browser reconnects and resumes for me, and
    use a WebSocket only when the client streams messages too — in which case I own
    reconnection with jittered backoff, heartbeats and gap recovery, and I write
    the messages into the query cache rather than component state."
  </p>
</div>`,
};
