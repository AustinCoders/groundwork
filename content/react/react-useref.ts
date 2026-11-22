import type { Chapter } from "../types";

export const reactUseref: Chapter = {
  id: "react-useref",
  num: "I1",
  title: "useRef",
  short: "useRef",
  levels: ["intermediate"],
  prerequisites: ["react-usestate", "react-useeffect-basics"],
  practice: ["ex-react-previous-value", "ex-comp-autofocus", "ex-comp-use-previous", "ex-comp-ref-array-scroll"],
  ready: true,
  subtitle: "A box that survives renders and does not cause them.",
  body: `<p>
  State is memory that changes what the screen shows. Some memory should not: the id of a running timer, the previous
  value of a prop, the DOM node of an input you want to focus. Putting those in state would cost a render every time
  they change, and nothing on screen would be different. <code>useRef</code> is React's answer: a mutable box that lives
  as long as the component, which you can change freely without React noticing. This chapter covers the two jobs refs
  do, holding values and holding DOM nodes, exactly when <code>ref.current</code> is filled in, the React 19 changes to
  passing refs and to callback refs, and the line between a legitimate ref and one that hides a bug. It assumes
  <a href="/react/react-usestate">state</a> and <a href="/react/react-useeffect-basics">effects</a>. Everything here was
  run against React 19.3.
</p>

<h3>A box React keeps for you</h3>
<pre><code>import { useRef } from "react";

function Stopwatch() {
  const intervalRef = useRef(null);
  <span class="c">// intervalRef is { current: null } on the first render,</span>
  <span class="c">// and the same object on every render after</span>
}</code></pre>
<p>
  <code>useRef(initial)</code> returns a plain object with one property, <code>current</code>, set to the initial value
  on the first render. React stores that object in the component's hook slots, the same way it stores state, so every
  later render gets <em>the same object</em> back. You can read and write <code>ref.current</code> whenever you like,
  and React does not care: changing it does not schedule a render.
</p>
<p>
  Compare the two kinds of component memory directly:
</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th><code>useState</code></th><th><code>useRef</code></th></tr></thead>
<tbody>
<tr><td>Survives re-renders</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Changing it re-renders</td><td>Yes, through the setter</td><td>No</td></tr>
<tr><td>How you change it</td><td>Call the setter; the new value appears next render</td><td>Assign to <code>.current</code>; the new value is there immediately</td></tr>
<tr><td>Safe to read while rendering</td><td>Yes, it is the render's snapshot</td><td>Not for anything that affects output</td></tr>
<tr><td>Use for</td><td>Anything the screen shows</td><td>Values the screen does not show; DOM nodes</td></tr>
</tbody>
</table></div>
<p>
  If you wrote <code>useRef</code> yourself on top of <code>useState</code>, it would be one line:
  <code>const [ref] = useState(() =&gt; ({ current: initial }))</code>. You never call the setter, so React never re-renders
  because of it, and you mutate the object inside. That is a good way to remember what a ref is: state with the
  re-render removed.
</p>

<h3>Changing a ref does not re-render</h3>
<pre><code>function Clicks() {
  const clicks = useRef(0);
  return (
    &lt;button onClick={() =&gt; { clicks.current += 1; }}&gt;
      Clicked {clicks.current} times
    &lt;/button&gt;
  );
}</code></pre>
<p>
  Click it twice and the label still says 0. The count really is 2, but nothing told React to render, so the old text
  stays. If something else re-renders the component later, the label suddenly jumps to 2. That delayed, unrelated
  update is the signature of a ref used where state belonged. The rule is simple: <b>if the value appears in the JSX,
  it is state</b>. Refs are for values your event handlers and effects need, not your output.
</p>

<h3>Job one: values that are not for the screen</h3>
<p>
  The classic example is a timer. Starting it gives you an id you need later to stop it, and nothing on screen depends
  on the id:
</p>
<pre><code>function Stopwatch() {
  const [startedAt, setStartedAt] = useState(null);
  const [now, setNow] = useState(null);
  const intervalRef = useRef(null);

  function start() {
    setStartedAt(Date.now());
    setNow(Date.now());
    clearInterval(intervalRef.current);
    intervalRef.current = setInterval(() =&gt; setNow(Date.now()), 10);
  }

  function stop() {
    clearInterval(intervalRef.current);
  }

  const seconds = startedAt !== null &amp;&amp; now !== null ? (now - startedAt) / 1000 : 0;

  return (
    &lt;&gt;
      &lt;p&gt;{seconds.toFixed(2)} s&lt;/p&gt;
      &lt;button onClick={start}&gt;Start&lt;/button&gt;
      &lt;button onClick={stop}&gt;Stop&lt;/button&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  Why not a plain variable, <code>let intervalId</code>? Because the component function runs again on every render and
  the variable starts fresh each time: the <code>stop</code> handler created on a later render would see
  <code>undefined</code>. Why not state? It would work, but every start would cause a render for a value nobody sees.
  The ref is exactly right: it persists, and it is invisible to React.
</p>
<p>
  Other values in the same category: a WebSocket or third-party instance created on first use; whether the user has
  already been shown a one-time hint in this session; the previous scroll position, to compare with the next one; a
  debounce timer; an <code>AbortController</code> for the request currently in flight.
</p>

<p>
  A useful way to tell these apart from state: imagine the value changed while the component sat idle on screen. If the
  user should see a difference, it is state. If nothing visible should change until some later handler or effect reads
  it, it is a ref.
</p>

<h4>Initialising an expensive ref once</h4>
<p>
  Unlike <code>useState</code>, <code>useRef</code> has no lazy form. Its argument is evaluated on every render and
  ignored after the first, so <code>useRef(new VideoPlayer())</code> builds and throws away a player on every render;
  counting calls confirms one construction per render. When the initial value is expensive, initialise it yourself the
  first time:
</p>
<pre><code>const playerRef = useRef(null);
if (playerRef.current === null) {
  playerRef.current = new VideoPlayer();   <span class="c">// runs once</span>
}</code></pre>
<p>
  This is the one case where writing a ref during render is fine: it is initialisation, it always produces the same
  result, and nothing outside the component can observe it.
</p>

<h3>Job two: holding a DOM node</h3>
<p>
  React manages the DOM for you, but some things it has no declarative API for: focusing an input, scrolling an element
  into view, measuring its size, starting a media element, handing a node to a non-React library. For those you need
  the actual node, and refs are how you get it:
</p>
<pre><code>function SearchBox() {
  const inputRef = useRef(null);

  return (
    &lt;&gt;
      &lt;input ref={inputRef} placeholder="Search" /&gt;
      &lt;button onClick={() =&gt; inputRef.current.focus()}&gt;Focus search&lt;/button&gt;
    &lt;/&gt;
  );
}</code></pre>
<p>
  Passing a ref object to the <code>ref</code> attribute of a DOM element tells React: when you create this node, put
  it in <code>inputRef.current</code>; when you remove it, set <code>current</code> back to <code>null</code>.
</p>

<h4>When <code>current</code> is filled in</h4>
<p>
  The node does not exist until React has committed the render to the DOM, so the timing matters. Logging from the
  render and from a layout effect of a component with <code>&lt;input ref={r} /&gt;</code> prints
  <code>render: null</code>, then <code>layout: INPUT</code>:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Moment</th><th><code>ref.current</code></th><th>Safe to use the node?</th></tr></thead>
<tbody>
<tr><td>First render (your function body)</td><td><code>null</code></td><td>No: it does not exist yet</td></tr>
<tr><td>Later renders</td><td>the node from the last commit</td><td>No: it may be about to change</td></tr>
<tr><td>Layout effects</td><td>the new node</td><td>Yes, before the browser paints</td></tr>
<tr><td>Effects</td><td>the new node</td><td>Yes</td></tr>
<tr><td>Event handlers</td><td>the current node</td><td>Yes</td></tr>
<tr><td>After the element is removed</td><td><code>null</code></td><td>Check before use</td></tr>
</tbody>
</table></div>
<p>
  So the rule is: touch DOM refs in effects and event handlers, never while rendering. Focusing an input when a
  component appears is an effect:
</p>
<pre><code>function LoginForm() {
  const emailRef = useRef(null);

  useEffect(() =&gt; {
    emailRef.current.focus();
  }, []);

  return &lt;input ref={emailRef} type="email" /&gt;;
}</code></pre>
<p>
  For that particular case the <code>autoFocus</code> attribute is simpler; reach for the effect when the focus depends
  on something, such as moving focus to the first invalid field after a failed submit.
</p>

<h4>Lists of nodes: a callback ref</h4>
<p>
  One <code>useRef</code> holds one value, and you cannot call hooks in a loop, so a ref per list item needs a different
  tool. A <b>callback ref</b> is a function passed to <code>ref</code>; React calls it with the node when it attaches
  it. Store the nodes in a <code>Map</code> kept in one ref:
</p>
<pre><code>function Gallery({ photos }) {
  const nodesRef = useRef(new Map());

  function scrollTo(id) {
    nodesRef.current.get(id)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  return (
    &lt;ul&gt;
      {photos.map((photo) =&gt; (
        &lt;li
          key={photo.id}
          ref={(node) =&gt; {
            nodesRef.current.set(photo.id, node);
            return () =&gt; nodesRef.current.delete(photo.id);
          }}
        &gt;
          &lt;img src={photo.src} alt={photo.alt} /&gt;
        &lt;/li&gt;
      ))}
    &lt;/ul&gt;
  );
}</code></pre>
<p>
  The function returned from the callback ref is new in React 19: a cleanup, called when the node is detached, just like
  an effect's cleanup. If the callback returns a cleanup, React calls it on detach; if it returns nothing, React calls the
  callback a second time with <code>null</code> instead, which is how callback refs worked before. Both were checked:
  with a cleanup, mount and unmount logged <i>attach DIV, cleanup</i>; without, <i>called DIV, called null</i>. Code that
  must also run on React 18 should handle the <code>null</code> call.
</p>
<p class="sub">
  A callback ref written inline is a new function on every render, so React detaches the old one and attaches the new
  one each time. That is harmless for a <code>Map</code> update; if the callback does real work, such as attaching an
  observer, define it once with <code>useCallback</code>.
</p>

<h3>Measuring an element</h3>
<p>
  Layout that depends on an element's real size, such as a tooltip that flips above its anchor when there is no room below,
  needs a measurement before the user sees anything. That is the narrow job of <code>useLayoutEffect</code>, which runs
  after React has updated the DOM but before the browser paints:
</p>
<pre><code>function Tooltip({ anchorRect, children }) {
  const tipRef = useRef(null);
  const [above, setAbove] = useState(false);

  useLayoutEffect(() =&gt; {
    const height = tipRef.current.getBoundingClientRect().height;
    const roomBelow = window.innerHeight - anchorRect.bottom;
    setAbove(height &gt; roomBelow);
  }, [anchorRect]);

  const top = above ? anchorRect.top - 8 : anchorRect.bottom + 8;
  return (
    &lt;div ref={tipRef} className="tip" style={{ top, transform: above ? "translateY(-100%)" : "none" }}&gt;
      {children}
    &lt;/div&gt;
  );
}</code></pre>
<p>
  The first render positions the tooltip below; the layout effect measures it, and if it does not fit, sets state, which
  React re-renders synchronously before the paint. The user only ever sees the final position. With
  <code>useEffect</code> they could see one frame in the wrong place.
</p>
<p>
  When the size can change after mount, because the content or the window changes, a <code>ResizeObserver</code> attached
  in an effect keeps the measurement current, and the effect's cleanup disconnects it:
</p>
<pre><code>function useElementWidth() {
  const ref = useRef(null);
  const [width, setWidth] = useState(0);

  useEffect(() =&gt; {
    const observer = new ResizeObserver(([entry]) =&gt; {
      setWidth(entry.contentRect.width);
    });
    observer.observe(ref.current);
    return () =&gt; observer.disconnect();
  }, []);

  return [ref, width];
}</code></pre>
<p>
  The hook returns the ref for the caller to attach and the width as state, because the width is displayed. That split is
  the whole chapter in miniature: the node lives in a ref, the number the screen shows lives in state.
</p>

<h3>Wrapping a library that is not React</h3>
<p>
  Charts, maps, rich-text editors and video players often come as plain JavaScript that wants a DOM node to take over.
  The ref gives it one, an effect creates the instance, and the cleanup destroys it:
</p>
<pre><code>function MapView({ center, zoom }) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);

  useEffect(() =&gt; {
    const map = createMap(containerRef.current, { center, zoom });
    mapRef.current = map;
    return () =&gt; {
      map.destroy();
      mapRef.current = null;
    };
  }, []);

  useEffect(() =&gt; {
    mapRef.current?.setView(center, zoom);
  }, [center, zoom]);

  return &lt;div ref={containerRef} className="map" /&gt;;
}</code></pre>
<p>
  Two refs, two jobs: <code>containerRef</code> holds the DOM node the library draws into, which React renders empty and
  then leaves alone; <code>mapRef</code> holds the library's instance so later effects can talk to it. The first effect
  creates and destroys the map once; the second keeps it in step with props without re-creating it. Under Strict Mode in
  development the map is created, destroyed and created again on mount, which is exactly the test that the cleanup is
  complete.
</p>

<h3>Passing a ref to your own component</h3>
<p>
  A ref on a DOM element gives you the node. A ref on your own component, <code>&lt;MyInput ref={r} /&gt;</code>, gives
  you whatever that component chooses to expose. In React 19 a function component simply receives <code>ref</code> as
  a prop and passes it on:
</p>
<pre><code>function MyInput({ label, ref, ...rest }) {
  return (
    &lt;label&gt;
      {label}
      &lt;input ref={ref} {...rest} /&gt;
    &lt;/label&gt;
  );
}

function Form() {
  const nameRef = useRef(null);
  return &lt;MyInput label="Name" ref={nameRef} /&gt;;   <span class="c">// nameRef.current is the &lt;input&gt;</span>
}</code></pre>
<p>
  Before React 19 this needed <code>forwardRef</code>, which wrapped the component and passed <code>ref</code> as a
  second argument. <code>forwardRef</code> still works, and you will see it in most existing code and libraries, but new
  code does not need it. The <code>key</code> attribute is still special and never reaches the component, but
  <code>ref</code> now does.
</p>
<p>
  Sometimes a component should expose a small, deliberate API instead of its whole DOM node: a video player that offers
  <code>play</code> and <code>pause</code> but not arbitrary DOM access. <code>useImperativeHandle</code> sets what the
  parent's ref receives:
</p>
<pre><code>function VideoPlayer({ src, ref }) {
  const videoRef = useRef(null);

  useImperativeHandle(ref, () =&gt; ({
    play: () =&gt; videoRef.current.play(),
    pause: () =&gt; videoRef.current.pause(),
  }), []);

  return &lt;video ref={videoRef} src={src} /&gt;;
}</code></pre>
<p>
  The parent's <code>ref.current</code> is now <code>{ play, pause }</code> and nothing else. Use this sparingly. If a
  parent needs to tell a child what to do, a prop such as <code>isPlaying</code> is usually better, because it keeps
  data flowing one way and the child's behaviour visible in the parent's JSX. Imperative handles are for genuinely
  imperative actions: focus, scroll, play, select text.
</p>

<h3>The previous value of a prop or state</h3>
<p>
  "What was this value on the last render?" is a common question, for example to animate a number going up or down.
  The textbook answer uses a ref updated in an effect:
</p>
<pre><code>function usePrevious(value) {
  const ref = useRef(undefined);
  useEffect(() =&gt; {
    ref.current = value;
  });
  return ref.current;
}</code></pre>
<p>
  During render, <code>ref.current</code> still holds the value from the previous commit, because the effect that
  overwrites it has not run yet. So <code>usePrevious(count)</code> returns the last committed value. Trace it with
  <code>count</code> going 0, 1, 1, 5:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Render</th><th><code>count</code></th><th><code>ref.current</code> read during render</th><th><code>ref.current</code> after the effect</th></tr></thead>
<tbody>
<tr><td>1</td><td>0</td><td><code>undefined</code></td><td>0</td></tr>
<tr><td>2</td><td>1</td><td>0</td><td>1</td></tr>
<tr><td>3</td><td>1 (parent re-rendered)</td><td>1</td><td>1</td></tr>
<tr><td>4</td><td>5</td><td>1</td><td>5</td></tr>
</tbody>
</table></div>
<p>
  Render 3 is the catch: an unrelated re-render makes "previous" equal "current". Sometimes that is what you want ("the
  value at the last render"), often it is not ("the value before it last changed"). It also reads a ref during render,
  which the React docs discourage, because under concurrent rendering a render can be started and thrown away. The
  version React recommends keeps the previous value in state and compares while rendering:
</p>
<pre><code>function Trend({ count }) {
  const [prev, setPrev] = useState(count);
  const [trend, setTrend] = useState(null);

  if (prev !== count) {
    setPrev(count);
    setTrend(count &gt; prev ? "up" : "down");
  }

  return &lt;p&gt;{count} {trend === "up" ? "▲" : trend === "down" ? "▼" : ""}&lt;/p&gt;;
}</code></pre>
<p>
  Setting state during render is allowed in exactly this shape: guarded by a condition that becomes false after the
  update, and only for the component's own state. React throws away the JSX from this render and re-renders
  immediately, before committing, so the screen never shows the inconsistent intermediate state. It only records a
  change when the value actually changed, which fixes the render 3 problem.
</p>

<h3>Refs and effects that need the latest value</h3>
<p>
  A long-lived callback, such as an interval set up once or a listener attached once, closes over the render it was
  created in and so sees stale props. A common pattern stores the latest value in a ref that is updated after each
  commit:
</p>
<pre><code>function useLatest(value) {
  const ref = useRef(value);
  useLayoutEffect(() =&gt; {
    ref.current = value;
  });
  return ref;
}

function AutoSaver({ draft }) {
  const latestDraft = useLatest(draft);
  useEffect(() =&gt; {
    const id = setInterval(() =&gt; save(latestDraft.current), 5000);
    return () =&gt; clearInterval(id);
  }, [latestDraft]);
  <span class="c">// …</span>
}</code></pre>
<p>
  The interval is set up once and always saves the newest draft. Since React 19.2, <code>useEffectEvent</code> covers
  most of these cases with a supported API, and <a href="/react/react-effects-depth">effects in depth</a> shows it; the
  ref pattern is still what you will see in older code and libraries, and it is worth being able to read.
</p>

<h3>State, ref or plain variable?</h3>
<p>
  Every value inside a component is one of three things, and choosing correctly is most of the skill:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Ask</th><th>If yes</th></tr></thead>
<tbody>
<tr><td>Does the screen show it, or does it decide what the screen shows?</td><td>State</td></tr>
<tr><td>Can it be computed from props and state during this render?</td><td>A plain variable in the function body</td></tr>
<tr><td>Must it survive between renders but never affect what is rendered?</td><td>A ref</td></tr>
<tr><td>Is it the same for every instance and never changes?</td><td>A constant outside the component</td></tr>
</tbody>
</table></div>
<p>
  The middle two get confused most. A filtered list is computed from state, so it is a plain variable recomputed each
  render; storing it in a ref would freeze it. A timer id is not computed from anything and must outlive the render that
  created it, so it is a ref; a plain variable would be lost. When in doubt, start with state: a value wrongly kept in
  state costs an extra render, while a value wrongly kept in a ref shows the user stale information.
</p>

<h3>Refs, focus and accessibility</h3>
<p>
  The most valuable everyday use of DOM refs is managing focus, which keyboard and screen-reader users depend on. Three
  moments come up constantly. When a dialog opens, focus should move into it, usually to its first field or its heading,
  so the user is not left typing into the page behind. When the dialog closes, focus should return to the button that
  opened it, so the user does not lose their place; that means keeping a ref to the trigger. And after a form fails
  validation, focus should move to the first invalid field, so the error is announced and can be fixed straight away.
</p>
<p>
  In each case the focus call goes in an effect or a handler, after React has committed the change that made the element
  exist. The native <code>&lt;dialog&gt;</code> element with <code>showModal()</code> does the first two for you, which is a
  good reason to prefer it, and its <code>showModal()</code> call is itself something you make through a ref. Moving focus
  for no reason is as bad as not moving it: change focus only in response to something the user did.
</p>

<h3>Refs and concurrent rendering</h3>
<p>
  The rule against touching refs during render becomes concrete once you know React can render a component without
  committing it. With transitions and Suspense, React may start rendering an update, pause, start over with newer state,
  or throw the work away. Anything a render writes into a ref happens even for renders that never reach the screen. A
  render that increments <code>renderCount.current</code> counts discarded renders too; a render that stores
  "the latest props" in a ref can store props that were never displayed. Effects and handlers run only for committed work,
  which is why they are the place for ref writes.
</p>

<h3>Rules for refs</h3>
<ul>
  <li><b>Do not read or write <code>ref.current</code> while rendering</b>, except to initialise it once. The render should be a pure calculation from props and state; a ref read makes the output depend on something React does not track, so it will not update when the ref does.</li>
  <li><b>Do read and write refs in event handlers and effects.</b> That is what they are for.</li>
  <li><b>Never put a ref's <code>.current</code> in a dependency array.</b> Changing it does not re-render, so the array is not re-evaluated when it changes, and the effect will not re-run as you expect. Depend on state instead.</li>
  <li><b>Do not use a DOM ref to change what React manages.</b> Setting <code>textContent</code> or removing children that React rendered puts the DOM out of step with React, and the next render can crash or overwrite your change. Reading, focusing, scrolling and measuring are fine; adding content is fine only inside an element React leaves empty.</li>
</ul>

<h3>Cost</h3>
<p>
  A ref is one object per hook call per component instance, created once and kept until unmount: constant time and
  memory. The cost to watch is indirect: the renders you avoid by using a ref are real savings only when the value
  truly does not affect output. Turning displayed state into a ref to "save renders" saves nothing and produces a screen
  that is wrong until something else renders.
</p>

<h3>Pitfalls</h3>
<ul>
  <li><b>Showing a ref's value in JSX</b> and expecting it to update. It updates only when something else re-renders.</li>
  <li><b>Using <code>ref.current</code> during the first render</b> for a DOM ref: it is <code>null</code> until commit.</li>
  <li><b><code>useRef(expensive())</code></b>: evaluated every render. Initialise lazily with a <code>null</code> check.</li>
  <li><b><code>ref.current</code> in a dependency array</b>: the effect does not re-run when it changes.</li>
  <li><b>Calling <code>useRef</code> inside a <code>map</code></b> to get one ref per item: hooks cannot go in loops. Use a callback ref and a <code>Map</code>.</li>
  <li><b>Inline callback refs that do expensive setup</b>: they detach and re-attach every render.</li>
  <li><b>Reaching into a child with an imperative handle</b> for something a prop could express.</li>
  <li><b>Forgetting the <code>null</code> case</b> for refs to elements that are conditionally rendered, or for callback refs on React 18.</li>
</ul>

<h3>Recognising it in a problem</h3>
<ul>
  <li>"Store the timer or subscription id so another handler can cancel it": a ref.</li>
  <li>"Focus, scroll to, measure or play this element": a DOM ref, used in an effect or handler.</li>
  <li>"One ref per list item": a callback ref filling a <code>Map</code>.</li>
  <li>"The interval keeps using the old prop": the latest value in a ref, or <code>useEffectEvent</code>.</li>
  <li>"The label only updates when something else changes": a value that should have been state is in a ref.</li>
</ul>

<h3>Interview questions</h3>
<p><b>1. What is the difference between <code>useRef</code> and <code>useState</code>?</b></p>
<p>
  Both persist a value across renders. Setting state schedules a re-render and the new value appears in the next
  render's snapshot; assigning <code>ref.current</code> changes the value immediately and does not re-render. So state is
  for anything the UI shows, and refs are for values the UI does not show, such as timer ids or instances, and for DOM
  nodes.
</p>
<p class="sub">
  <i>Follow-up: could you implement <code>useRef</code> with <code>useState</code>?</i> Yes:
  <code>const [ref] = useState(() =&gt; ({ current: initial }))</code>, never calling the setter. That shows a ref is just
  a persistent object React never re-renders for.
</p>
<p><b>2. When is a DOM ref's <code>current</code> set?</b></p>
<p>
  During the commit, after React creates or updates the node and before layout effects run. It is <code>null</code>
  during the first render, holds the node in layout effects, effects and handlers, and is set back to
  <code>null</code> when the element is removed. So DOM refs are used in effects and event handlers, not during render.
</p>
<p class="sub">
  <i>Follow-up: how do you get refs to every item in a list?</i> A callback ref per item that stores the node in a
  <code>Map</code> held in one <code>useRef</code>, removing it in the callback's cleanup, since hooks cannot be called
  in a loop.
</p>
<p><b>3. How do you pass a ref to a custom component in React 19?</b></p>
<p>
  As a normal prop: the function component receives <code>ref</code> in its props and passes it to the element it wants
  to expose. <code>forwardRef</code> is no longer needed for new code, though it still works. To expose a limited API
  instead of the node, use <code>useImperativeHandle</code>.
</p>
<p class="sub">
  <i>Follow-up: what changed about callback refs?</i> In React 19 a callback ref can return a cleanup function, called
  on detach. Without a cleanup, React still calls the callback with <code>null</code> on detach, as before.
</p>
<p><b>4. Why should you avoid reading refs during render?</b></p>
<p>
  Because the render becomes dependent on a value React does not track: when the ref changes, nothing re-renders, so the
  output is stale, and under concurrent rendering a render may run and be discarded, so writes during render can leak.
  The exception is one-time lazy initialisation.
</p>
<div class="bx is-prim">
  <span class="ttl">The trap question</span>
  <p>
    "Can I put <code>ref.current</code> in an effect's dependency array so the effect runs when the ref changes?" No.
    Dependencies are compared when the component renders, and changing a ref does not render, so the effect will not
    re-run at the moment the ref changes. If something should react to a change, that something is state. For DOM nodes
    that appear and disappear, use a callback ref, which React calls at exactly the right moments.
  </p>
</div>
<div class="bx is-ref">
  <span class="ttl">Say it like this</span>
  <p>
    "A ref is a mutable object React keeps for the component's lifetime; changing <code>.current</code> doesn't
    re-render. I use refs for values the UI doesn't show, like timer ids, and for DOM nodes I need to focus, scroll or
    measure, touching them in effects and handlers rather than during render. In React 19 I pass <code>ref</code> as a
    normal prop, and if a value appears in the JSX it belongs in state, not a ref."
  </p>
</div>

<div class="bx is-ref">
  <span class="ttl">Before you move on</span>
  <ul>
    <li>Fill in the state-versus-ref table from memory.</li>
    <li>Explain why clicking a ref-based counter does not update its label, and when the label finally changes.</li>
    <li>Build a start/stop timer that keeps its interval id in a ref.</li>
    <li>Say at which moments a DOM ref is <code>null</code> and when it holds the node.</li>
    <li>Collect refs for every item in a list with a callback ref and a cleanup.</li>
    <li>Pass a ref through your own component in React 19, and expose a limited API with <code>useImperativeHandle</code>.</li>
    <li>Trace <code>usePrevious</code> across an unrelated re-render, and write the state-based alternative.</li>
  </ul>
</div>`,
};
