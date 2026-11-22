import type { Chapter } from "../types";

export const reactUseeffectBasics: Chapter = {
  id: "react-useeffect-basics",
  num: "B9",
  title: "useEffect basics",
  short: "useEffect",
  levels: ["beginner"],
  prerequisites: ["react-usestate", "react-lists-keys"],
  practice: [
    "ex-react-deps-changed",
    "ex-react-which-deps-changed",
    "ex-comp-window-listener",
    "ex-comp-document-title",
    "ex-comp-document-title-effect",
  ],
  ready: true,
  subtitle: "For keeping a component in step with something outside React, and most of the time you do not need it.",
  body: `<p>
  Rendering in React is meant to be pure: given the same props and state, a component returns the same JSX and
  touches nothing else. Real applications still have to talk to things React does not manage: the document title, a
  timer, a WebSocket, a browser API, a third-party widget. <code>useEffect</code> is where that code goes. This chapter
  builds the mental model the React team recommends, synchronisation rather than lifecycle, traces exactly when effects
  and their cleanups run, fixes the race condition hiding in almost every hand-written fetch, and then spends real time
  on the most useful skill of all: recognising the effects you should not write. It assumes
  <a href="/react/react-usestate">state</a> and <a href="/react/react-lists-keys">keys</a>. Every ordering below was
  run against React 19.3.
</p>

<h3>What an effect is for</h3>
<pre><code>import { useEffect, useState } from "react";

function Inbox({ unread }) {
  useEffect(() =&gt; {
    document.title = unread &gt; 0 ? "(" + unread + ") Inbox" : "Inbox";
  }, [unread]);

  return &lt;h1&gt;Inbox&lt;/h1&gt;;
}</code></pre>
<p>
  Setting <code>document.title</code> while rendering would be a side effect inside what should be a pure calculation,
  and React may render a component and then throw the result away, or render it more than once, so code in the render
  body must not change the outside world. An effect is a function React runs <em>after</em> it has applied the render
  to the screen. The second argument, the dependency array, lists the values from the render that the effect uses, and
  React re-runs the effect only when one of them changed.
</p>
<p>
  The useful way to think about an effect is as a <b>synchronisation</b>: "keep the document title in step with
  <code>unread</code>". Not "run this on mount" or "run this when unread changes", which are lifecycle thoughts, but a
  statement of something that should stay true. React decides when it has to re-synchronise, and your job is to say
  how to start synchronising and how to stop.
</p>

<h3>The dependency array</h3>
<div class="table-scroll"><table>
<thead><tr><th>Written as</th><th>Runs</th><th>Typical use</th></tr></thead>
<tbody>
<tr><td><code>useEffect(fn)</code></td><td>After every render</td><td>Rare; usually a sign something is missing</td></tr>
<tr><td><code>useEffect(fn, [])</code></td><td>After the first render only (and cleaned up on unmount)</td><td>Subscriptions that depend on nothing from the render</td></tr>
<tr><td><code>useEffect(fn, [a, b])</code></td><td>After the first render, then after any render where <code>a</code> or <code>b</code> changed</td><td>Almost everything else</td></tr>
</tbody>
</table></div>
<p>
  The dependency array is not a list of "things that should trigger this". It is the list of reactive values the effect
  reads: props, state and anything computed from them during render. The <code>react-hooks/exhaustive-deps</code> lint
  rule works it out from the effect's code and tells you when the list is wrong. The array must have the same length on
  every render, for the same reason hooks must be called in the same order: React compares it position by position.
</p>
<p>
  React compares each entry with the previous render's value using <code>Object.is</code>. Primitives, such as
  strings, numbers and booleans, compare by value. Objects, arrays and functions compare by reference, and that is the
  source of most effect surprises:
</p>
<pre><code>useEffect(fn, [user.id]);        <span class="c">// a string: re-runs only when the id changes</span>
useEffect(fn, [items.length]);   <span class="c">// a number: fine</span>
useEffect(fn, [user]);           <span class="c">// an object: re-runs whenever user is a new object</span>

function Search({ query }) {
  const options = { query, limit: 20 };   <span class="c">// a new object on every render</span>
  useEffect(() =&gt; {
    runSearch(options);
  }, [options]);                          <span class="c">// ✗ runs after every render</span>
}</code></pre>
<p>
  In the last example, rendering <code>Search</code> three times with the same <code>query</code> runs the effect three
  times, because each render builds a new <code>options</code> object and <code>Object.is</code> sees three different
  objects. Depend on the primitives instead and build the object inside the effect:
</p>
<pre><code>useEffect(() =&gt; {
  runSearch({ query, limit: 20 });
}, [query]);                               <span class="c">// ✓ runs when query changes</span></code></pre>

<h3>Each render has its own effect</h3>
<p>
  The <a href="/react/react-usestate">snapshot rule</a> applies to effects too. The function you pass to
  <code>useEffect</code> is created during a render, so it closes over that render's props and state, exactly like an
  event handler does. React does not call "the effect" with new values; it keeps the function from the latest render
  whose dependencies changed and calls that one.
</p>
<pre><code>function Inbox({ unread }) {
  useEffect(() =&gt; {
    const id = setTimeout(() =&gt; {
      console.log("unread was", unread);
    }, 3000);
    return () =&gt; clearTimeout(id);
  }, [unread]);
  <span class="c">// …</span>
}</code></pre>
<p>
  If <code>unread</code> goes from 2 to 3 within the three seconds, the cleanup cancels the timer from the render where
  it was 2, and the render where it is 3 starts a new one, which logs 3. Without the cleanup, both timers fire, and
  the first logs 2 even though the screen has shown 3 for a while. Neither value is wrong: each effect reports the
  render it belongs to. This is also why the dependency array matters. It is how you tell React which renders' values
  this effect has to be re-created for, and leaving one out means an older render's effect keeps running with older
  values.
</p>

<h3>Cleanup: how to stop synchronising</h3>
<p>
  An effect can return a function. React calls it to undo what the effect did: before running the effect again with new
  values, and once more when the component leaves the screen.
</p>
<pre><code>function ChatRoom({ roomId }) {
  useEffect(() =&gt; {
    const connection = createConnection(roomId);
    connection.connect();
    return () =&gt; connection.disconnect();
  }, [roomId]);

  return &lt;h1&gt;Welcome to {roomId}&lt;/h1&gt;;
}</code></pre>
<p>
  Read it as one sentence: "while this component shows <code>roomId</code>, be connected to it". When
  <code>roomId</code> changes, React disconnects from the old room and connects to the new one. Anything an effect
  starts, it stops: an interval needs <code>clearInterval</code>, a listener needs
  <code>removeEventListener</code>, a subscription needs its unsubscribe.
</p>
<pre><code>useEffect(() =&gt; {
  const id = setInterval(() =&gt; setSeconds((s) =&gt; s + 1), 1000);
  return () =&gt; clearInterval(id);
}, []);

useEffect(() =&gt; {
  function onResize() {
    setWidth(window.innerWidth);
  }
  window.addEventListener("resize", onResize);
  return () =&gt; window.removeEventListener("resize", onResize);
}, []);</code></pre>
<p>
  Without the cleanups, every time the component mounts it adds another interval or listener, and none is ever removed.
  They pile up, all keep firing, and each keeps alive whatever it closed over. Notice too that the interval uses an
  updater, <code>(s) =&gt; s + 1</code>: the effect runs once, so its closure holds the first render's snapshot, and
  <code>setSeconds(seconds + 1)</code> would set 1 forever.
</p>
<p>
  <code>removeEventListener</code> needs the same function that was added, which is why <code>onResize</code> is
  declared inside the effect and referenced by both calls.
</p>

<h3>When effects run, exactly</h3>
<figure>
  <svg viewBox="0 0 780 200" class="dg" role="img" aria-label="An update goes through render, commit to the DOM, layout effects, the browser paint, the cleanups of changed effects, and then the new effects. On unmount, cleanups run.">
    <g class="rough">
      <rect class="box" x="10" y="40" width="110" height="56" rx="10" />
      <rect class="box" x="140" y="40" width="110" height="56" rx="10" />
      <rect class="box" x="270" y="40" width="120" height="56" rx="10" />
      <rect class="box" x="410" y="40" width="100" height="56" rx="10" />
      <rect class="boxg" x="530" y="40" width="110" height="56" rx="10" />
      <rect class="boxg" x="660" y="40" width="110" height="56" rx="10" />
      <path class="ln" d="M120 68 H134" marker-end="url(#arrow)" />
      <path class="ln" d="M250 68 H264" marker-end="url(#arrow)" />
      <path class="ln" d="M390 68 H404" marker-end="url(#arrow)" />
      <path class="ln" d="M510 68 H524" marker-end="url(#arrow)" />
      <path class="ln" d="M640 68 H654" marker-end="url(#arrow)" />
    </g>
    <text class="lbl" x="65" y="65" text-anchor="middle">render</text>
    <text class="sm" x="65" y="84" text-anchor="middle">your function</text>
    <text class="lbl" x="195" y="65" text-anchor="middle">commit</text>
    <text class="sm" x="195" y="84" text-anchor="middle">DOM updated</text>
    <text class="lbl" x="330" y="65" text-anchor="middle">layout effects</text>
    <text class="sm" x="330" y="84" text-anchor="middle">before paint</text>
    <text class="lbl" x="460" y="65" text-anchor="middle">paint</text>
    <text class="sm" x="460" y="84" text-anchor="middle">user sees it</text>
    <text class="lbl" x="585" y="65" text-anchor="middle">cleanups</text>
    <text class="sm" x="585" y="84" text-anchor="middle">old values</text>
    <text class="lbl" x="715" y="65" text-anchor="middle">effects</text>
    <text class="sm" x="715" y="84" text-anchor="middle">new values</text>
    <text class="sm" x="390" y="150" text-anchor="middle">Only effects whose dependencies changed take part. On unmount, only their cleanups run.</text>
    <text class="sm" x="390" y="172" text-anchor="middle">After a click or key press, React may run effects before the paint instead.</text>
  </svg>
  <figcaption>One update, left to right. Cleanups for every changed effect run before any new effect starts.</figcaption>
</figure>
<p>
  For an update that was not caused by a discrete interaction, such as a timer firing or data arriving, React lets the
  browser paint the new screen first and runs effects afterwards, so a slow effect does not delay what the user sees.
  For updates caused by a click, a key press or another discrete input, React may flush effects before the paint.
  Either way, your code should not depend on which one happens: an effect runs after the DOM is updated, and that is
  the guarantee.
</p>
<p>
  Within one commit there is a fixed order, which you can see by logging from a parent and a child that both have
  effects. On mount: the parent renders, then the child's layout effect, the parent's layout effect, the child's effect,
  the parent's effect. Children before parents, because a parent's effect may rely on its children being ready. On an
  update, React first runs the cleanups of every effect that is about to re-run, children first, and only then runs the
  new effects. So an old connection is always closed before the new one opens.
</p>
<p>
  <code>useLayoutEffect</code> has the same API but runs before the browser paints. Use it for the narrow case of
  measuring the DOM and immediately adjusting layout, such as positioning a tooltip from its measured size, where a
  normal effect would let the user see one frame in the wrong place. It blocks painting, so never use it for fetching
  or anything slow.
</p>

<h4>Worked example: tracing a connection effect</h4>
<p>
  Take <code>ChatRoom</code> from above, rendered first with <code>roomId="general"</code>, then
  <code>"travel"</code>, then <code>"travel"</code> again, then removed. Fill in what React does at each step:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Step</th><th><code>roomId</code></th><th>Previous deps</th><th>Changed?</th><th>React runs</th></tr></thead>
<tbody>
<tr><td>1. mount</td><td>general</td><td>(none)</td><td>first run</td><td>connect general</td></tr>
<tr><td>2. re-render</td><td>travel</td><td>[general]</td><td>yes</td><td>disconnect general, then connect travel</td></tr>
<tr><td>3. re-render</td><td>travel</td><td>[travel]</td><td>no</td><td>nothing</td></tr>
<tr><td>4. unmount</td><td>(gone)</td><td>[travel]</td><td>n/a</td><td>disconnect travel</td></tr>
</tbody>
</table></div>
<p>
  At every moment exactly one connection is open, to the room on screen, and when the component leaves there are none.
  That is what a correct effect looks like from outside: every "start" is matched by a "stop" for the same values. Run
  in development with <code>&lt;StrictMode&gt;</code>, step 1 becomes <i>connect general, disconnect general, connect
  general</i>, which is the subject of the next section.
</p>

<h3>Why effects run twice in development</h3>
<p>
  In development, Strict Mode mounts every component, immediately unmounts it, and mounts it again. Your effect runs,
  its cleanup runs, and it runs again. This does not happen in production builds.
</p>
<p>
  It is deliberate. Users mount and unmount components all the time: navigating away and back, opening and closing a
  tab, a list filter hiding a row and showing it again. If an effect has no cleanup, or an incomplete one, that real
  sequence leaves two connections open or two listeners attached. Strict Mode performs the sequence on every mount so
  you see the bug in the first minute instead of in a bug report. The fix is never to disable Strict Mode or to guard
  with a "has this run already" ref; it is to write the cleanup, after which the double run is invisible:
  connect, disconnect, connect leaves one connection, exactly as in production.
</p>
<p>
  A few effects genuinely should happen once per page load, not once per mount, such as initialising an analytics SDK.
  Those belong outside components entirely: at module level, or in the app's entry file.
</p>

<h3>Fetching data, and the race hiding in it</h3>
<p>
  Fetching is the effect beginners write first, and the obvious version has a bug:
</p>
<pre><code>function Profile({ userId }) {
  const [user, setUser] = useState(null);

  useEffect(() =&gt; {
    fetch("/api/users/" + userId)
      .then((response) =&gt; response.json())
      .then((data) =&gt; setUser(data));   <span class="c">// ✗ whichever response lands last wins</span>
  }, [userId]);

  return user ? &lt;h1&gt;{user.name}&lt;/h1&gt; : &lt;p&gt;Loading…&lt;/p&gt;;
}</code></pre>
<p>
  Switch quickly from user 1 to user 2. Both requests are now in flight. Responses do not have to arrive in the order
  requests were sent: if user 1's request is slower, it resolves last, and <code>setUser</code> overwrites user 2 with
  user 1. The page shows the wrong person, with no error. A test simulating exactly that, user 1 answering after 50 ms
  and user 2 after 10 ms, ends with user 1 on screen. On a fast connection you never see it, which is why it ships.
</p>
<p>
  The cleanup is the fix. When <code>userId</code> changes, React cleans up the previous effect before running the
  next one, so the cleanup can mark the old request as no longer wanted:
</p>
<pre><code>useEffect(() =&gt; {
  let ignore = false;
  setStatus("loading");

  fetch("/api/users/" + userId)
    .then((response) =&gt; {
      if (!response.ok) throw new Error("HTTP " + response.status);
      return response.json();
    })
    .then((data) =&gt; {
      if (!ignore) {
        setUser(data);
        setStatus("ready");
      }
    })
    .catch((error) =&gt; {
      if (!ignore) setStatus("error");
    });

  return () =&gt; {
    ignore = true;                     <span class="c">// this render's request is no longer wanted</span>
  };
}, [userId]);</code></pre>
<p>
  Each run of the effect has its own <code>ignore</code> variable, closed over by its own callbacks. The cleanup for
  user 1 sets user 1's flag, so user 1's late response is dropped, and user 2's flag is still false. The same simulated
  race now ends with user 2 on screen. Note the <code>response.ok</code> check, too: <code>fetch</code> only rejects on
  network failure, so a 404 or 500 would otherwise be parsed as if it were data.
</p>
<p>
  <code>AbortController</code> goes one step further and cancels the request itself, saving bandwidth:
</p>
<pre><code>useEffect(() =&gt; {
  const controller = new AbortController();

  fetch("/api/users/" + userId, { signal: controller.signal })
    .then((response) =&gt; response.json())
    .then((data) =&gt; setUser(data))
    .catch((error) =&gt; {
      if (error.name !== "AbortError") setStatus("error");
    });

  return () =&gt; controller.abort();
}, [userId]);</code></pre>
<p>
  An aborted fetch rejects with an <code>AbortError</code>, which the <code>catch</code> has to ignore, since it is not
  a failure the user should see. You cannot make the effect function itself <code>async</code>: an async function
  returns a promise, and React expects either nothing or a cleanup function, so it logs an error and the cleanup is
  lost. Put the <code>async</code> function inside the effect and call it.
</p>
<p class="sub">
  Hand-written fetching in effects also has no caching, no deduplication and no retry, and it starts only after the
  component has rendered, which creates waterfalls. Real applications usually use a data library or their framework's
  data loading; <a href="/react/react-data-fetching">data fetching patterns</a> and
  <a href="/react/react-server-state">server state</a> cover when to stop hand-rolling it. Knowing the race and its fix
  is still essential, because every one of those tools is solving it for you.
</p>

<h3>One effect per synchronisation</h3>
<p>
  When a component talks to two external things, write two effects, even if they would fit in one:
</p>
<pre><code>function ChatRoom({ roomId, unread }) {
  useEffect(() =&gt; {
    const connection = createConnection(roomId);
    connection.connect();
    return () =&gt; connection.disconnect();
  }, [roomId]);

  useEffect(() =&gt; {
    document.title = unread &gt; 0 ? "(" + unread + ") Chat" : "Chat";
  }, [unread]);

  <span class="c">// …</span>
}</code></pre>
<p>
  Combined into one effect with <code>[roomId, unread]</code>, every new unread message would disconnect from the room
  and reconnect, because the whole effect re-runs when either value changes. Split by concern, each effect re-runs
  only for its own inputs, and each can be read, deleted or moved into a custom hook on its own. The question to ask is
  not "what happens at the same time?" but "what has to be started and stopped together?".
</p>

<h4>A complete example: following the browser's online status</h4>
<p>
  The browser fires <code>online</code> and <code>offline</code> events on <code>window</code>, and
  <code>navigator.onLine</code> holds the current value. Keeping a component in step with it is a textbook effect:
</p>
<pre><code>function ConnectionBadge() {
  const [online, setOnline] = useState(() =&gt; navigator.onLine);

  useEffect(() =&gt; {
    function update() {
      setOnline(navigator.onLine);
    }
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    update();
    return () =&gt; {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return &lt;span&gt;{online ? "Online" : "Offline"}&lt;/span&gt;;
}</code></pre>
<p>
  Every piece from this chapter is here. The initial value is read lazily. The effect depends on nothing reactive, so
  the array is empty, and the cleanup removes exactly the listeners it added. The extra <code>update()</code> call
  covers a change that happened between the first render and the effect running. Strict Mode's extra mount adds and
  removes the listeners once more and leaves the same state behind. When a component needs this, and you notice two
  more do too, the effect moves into a custom hook, <code>useOnlineStatus()</code>; for subscriptions to an external
  store like this one, React also offers <a href="/react/react-sync-external-store">useSyncExternalStore</a>, which
  avoids the one render with a stale value that any effect-based subscription has.
</p>

<h3>Most effects should not exist</h3>
<p>
  An effect is for synchronising with an <em>external</em> system. A large share of the effects in real codebases do
  not touch anything external; they move data from one piece of React state to another, and each of those makes the
  code slower and harder to follow. Before writing one, check whether it falls into one of these cases.
</p>

<h4>Deriving a value</h4>
<pre><code><span class="c">// ✗ an extra render with a stale value first, and two sources of truth</span>
const [fullName, setFullName] = useState("");
useEffect(() =&gt; {
  setFullName(first + " " + last);
}, [first, last]);

<span class="c">// ✓ compute it while rendering</span>
const fullName = first + " " + last;</code></pre>
<p>
  The effect version renders once with the old <code>fullName</code>, then the effect sets state, then it renders again.
  The computed version is always right and renders once. If the computation is expensive,
  <code>useMemo</code> caches it; it still does not need state.
</p>

<h4>Responding to something the user did</h4>
<pre><code><span class="c">// ✗ fires for every way items can change, including loading a saved list</span>
useEffect(() =&gt; {
  if (items.length &gt; 0) track("item_added");
}, [items]);

<span class="c">// ✓ it happened because of a click, so it belongs in the click</span>
function handleAdd(item) {
  setItems((list) =&gt; [...list, item]);
  track("item_added");
}</code></pre>
<p>
  The test: did this need to happen <b>because the user did something</b>, or <b>because the component is on the
  screen</b>? The first belongs in the event handler, where you know exactly what happened. Only the second is an
  effect. Submitting a form, sending a message, showing a toast after a save: handlers. Connecting to the chat room the
  user is looking at, keeping the title in step with the unread count: effects.
</p>

<h4>Resetting state when a prop changes</h4>
<pre><code><span class="c">// ✗ renders once with the previous user's draft, then clears it</span>
useEffect(() =&gt; {
  setDraft("");
}, [userId]);

<span class="c">// ✓ a new key is a new component, with fresh state</span>
&lt;Editor key={userId} userId={userId} /&gt;</code></pre>
<p>
  The <a href="/react/react-lists-keys">keys chapter</a> explains why this works: a different key makes React unmount
  the old component and mount a new one, so every piece of state starts from its initial value, including ones added
  later by someone who would have forgotten to clear them in the effect.
</p>

<h4>Passing data up to a parent</h4>
<p>
  An effect in a child that calls <code>onChange(value)</code> whenever its state changes makes data flow in two
  directions and renders twice. Either call <code>onChange</code> from the event handler that changed the value, or
  lift the state into the parent so there is only one copy.
</p>
<pre><code><span class="c">// ✗ the parent hears about the change one render late</span>
useEffect(() =&gt; {
  onChange(checked);
}, [checked, onChange]);

<span class="c">// ✓ tell the parent in the same event that changed it</span>
function handleToggle() {
  const next = !checked;
  setChecked(next);
  onChange(next);
}</code></pre>
<p>
  The handler version updates both components in the same render pass, so the screen never shows the child and the
  parent disagreeing, and there is no extra render.
</p>

<h3>Infinite loops, and the two ways to write one</h3>
<pre><code>useEffect(() =&gt; {
  setCount(count + 1);              <span class="c">// ✗ no array: runs after every render, and causes one</span>
});

useEffect(() =&gt; {
  setUser({ ...user, seen: true }); <span class="c">// ✗ sets a new object, which changes the dependency</span>
}, [user]);</code></pre>
<p>
  The first is easy to spot. The second catches experienced developers: the effect depends on <code>user</code>, sets
  <code>user</code> to a new object, which is a different reference, so the effect runs again, and again. In
  development React logs "Maximum update depth exceeded" and the component keeps re-rendering until the code changes.
  Every loop has the same shape: the effect changes something in its own
  dependency list. The fix is to depend on what you actually read (<code>user.id</code>), to make the update a no-op
  when nothing would change, or, most often, to notice that this should not be an effect at all.
</p>

<h3>Do not lie to the linter</h3>
<p>
  The exhaustive-deps rule tells you which reactive values your effect reads. The tempting fix for an effect that runs
  too often is to delete a value from the array. That does not fix anything; it freezes the effect on the value from
  the render it last ran in, so it silently uses stale data. If including a dependency makes the effect run when it
  should not, change the code so it no longer needs that value:
</p>
<ul>
  <li>Move objects and functions the effect uses inside it, so the effect depends on the primitives they are built from.</li>
  <li>Use an updater, <code>setCount((c) =&gt; c + 1)</code>, so the effect no longer reads <code>count</code>.</li>
  <li>Move values that never change, such as configuration, outside the component, where they are not reactive at all.</li>
  <li>For a value the effect needs to <em>read</em> but should not <em>react</em> to, such as the current theme when logging a "connected" event, React 19.2 added <code>useEffectEvent</code>, covered in <a href="/react/react-effects-depth">effects in depth</a>.</li>
</ul>

<h3>Pitfalls</h3>
<ul>
  <li><b>No cleanup</b> for an interval, listener, subscription or connection: they accumulate on every mount.</li>
  <li><b>Objects or functions created during render in the dependency array:</b> the effect runs after every render.</li>
  <li><b>Setting a dependency inside the effect:</b> an infinite loop.</li>
  <li><b>Fetching without an ignore flag or abort:</b> a slow, stale response overwrites the current one.</li>
  <li><b>An <code>async</code> effect function:</b> React gets a promise instead of a cleanup.</li>
  <li><b>Reading state in a long-lived effect</b> (an interval set up once) without an updater: it sees the first render's value forever.</li>
  <li><b>Derived state, user-action logic or prop resets in effects:</b> compute while rendering, use the handler, use a key.</li>
  <li><b>Removing dependencies to silence the linter:</b> stale values with no error.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>The code needs to talk to something React does not control (the document, a socket, a timer, a non-React library) and keep it in step with props or state: an effect, with a cleanup.</li>
  <li>"It runs twice in development": Strict Mode; check the cleanup undoes the effect completely.</li>
  <li>"It shows the previous user's data sometimes": a fetch race.</li>
  <li>"Maximum update depth exceeded" or a frozen tab: an effect that changes its own dependency.</li>
  <li>An effect whose only job is to call a setter with something computed from other state: delete it and compute during render.</li>
</ul>

<h3>Interview questions</h3>
<p>
  <b>1. What is <code>useEffect</code> for, and what does the dependency array do?</b>
</p>
<p>
  It synchronises a component with an external system, such as the document, a subscription or a timer, after React has
  applied a render to the DOM. The dependency array lists the reactive values the effect reads; React compares them
  with <code>Object.is</code> against the previous render and re-runs the effect, after cleaning up the previous run,
  only when one changed. No array means every render; an empty array means only after the first.
</p>
<p class="sub">
  <i>Follow-up: why does an effect with an object dependency run on every render?</i> Because an object created during
  render is a new reference each time, and <code>Object.is</code> compares references. Depend on its primitive fields,
  or create the object inside the effect.
</p>
<p>
  <b>2. When does the cleanup run?</b>
</p>
<p>
  Before the effect runs again because a dependency changed, and when the component unmounts. In an update, React runs
  all the relevant cleanups first and then all the new effects, so the previous synchronisation is always stopped before
  the next one starts. In development, Strict Mode also runs one extra mount, cleanup and mount to expose missing
  cleanups.
</p>
<p class="sub">
  <i>Follow-up: how do you stop it running twice in development?</i> You do not; you make the cleanup complete, so that
  start, stop, start leaves the same result as start. The double run only happens in development and only exists to
  find effects that would break when a real user navigates away and back.
</p>
<p>
  <b>3. What is wrong with fetching in an effect without a cleanup?</b>
</p>
<p>
  A race. If the dependency changes while a request is in flight, both requests are pending, and the older one can
  resolve last and overwrite the newer data. The cleanup sets an <code>ignore</code> flag, or aborts with an
  <code>AbortController</code>, so only the latest request can update state.
</p>
<p class="sub">
  <i>Follow-up: what else is missing from hand-rolled fetching?</i> Caching, deduplication of identical requests,
  retries, and starting the request before render; data libraries and framework loaders provide those, which is why
  most production apps do not fetch in raw effects.
</p>
<p>
  <b>4. Give examples of effects you would remove.</b>
</p>
<p>
  An effect that sets state computed from other state: compute it during render. An effect that runs logic because of a
  user action: move it into the event handler. An effect that resets state when a prop changes: put a key on the
  component. An effect that pushes a child's state up to a parent: lift the state or call the callback from the handler.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Is <code>useEffect(fn, [])</code> the same as <code>componentDidMount</code>?" It runs after the first render and
    cleans up on unmount, so it looks similar, but the mental model is different: it is a synchronisation with no
    reactive inputs, it runs after the commit rather than at a lifecycle moment, and in development it runs twice. Using
    it to mean "on mount" is how missing dependencies and missing cleanups get written.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "An effect keeps a component in sync with something outside React. It runs after the DOM is updated, its
    dependencies are the reactive values it reads, compared with <code>Object.is</code>, and its cleanup stops the
    previous synchronisation before the next starts or when the component unmounts. I write the cleanup for everything I
    start, guard fetches against races, and I don't use effects for derived values, user actions or resetting state."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Explain an effect as a synchronisation with a start and a stop, not as a lifecycle method.</li>
    <li>Say what no array, an empty array and a filled array each mean, and how dependencies are compared.</li>
    <li>Fill in the connection table above for a different sequence of props, including the Strict Mode run.</li>
    <li>Give the order of render, commit, layout effects, cleanups and effects for one update.</li>
    <li>Write a fetch effect that cannot show a stale response, with either an ignore flag or an abort.</li>
    <li>Rewrite a derived-state effect, a user-action effect and a reset effect without <code>useEffect</code>.</li>
    <li>Spot the two shapes of infinite loop and fix each one without removing a dependency.</li>
  </ul>
</div>`,
};
