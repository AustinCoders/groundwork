import type { Chapter } from "../types";

export const reactUseeffectBasics: Chapter = {
  id: "react-useeffect-basics",
  num: "B9",
  title: "useEffect basics",
  short: "useEffect",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "For synchronising with something outside React — and most of the time you do not need it.",
  body: `<h3>What an effect is for</h3>
<p>
  Rendering is pure: it computes JSX and touches nothing else. Effects are the
  escape hatch for the things rendering must not do &mdash; talking to a
  subscription, a timer, the document title, a browser API. React runs them
  <em>after</em> the DOM has been updated.
</p>
<pre><code>useEffect(() =&gt; {
  document.title = title;
}, [title]);</code></pre>

<h3>The dependency array</h3>
<div class="table-scroll"><table>
<thead><tr><th>Written as</th><th>Runs</th></tr></thead>
<tbody>
<tr><td><code>useEffect(fn)</code></td><td>After every render</td></tr>
<tr><td><code>useEffect(fn, [])</code></td><td>Once, after the first render</td></tr>
<tr><td><code>useEffect(fn, [a, b])</code></td><td>After the first render, then whenever <code>a</code> or <code>b</code> changes</td></tr>
</tbody>
</table></div>
<p>
  React compares each dependency with <code>Object.is</code> against the
  previous render's value. That is a reference comparison, which is where most
  of the surprises come from.
</p>

<h3>Cleanup</h3>
<p>
  Return a function and React calls it before the next run of the effect, and
  once more when the component unmounts. Anything you start, you clean up.
</p>
<pre><code>useEffect(() =&gt; {
  const id = setInterval(tick, 1000);
  return () =&gt; clearInterval(id);
}, []);

useEffect(() =&gt; {
  window.addEventListener("resize", onResize);
  return () =&gt; window.removeEventListener("resize", onResize);
}, []);</code></pre>
<p class="sub">
  Without the cleanup, every remount adds another interval or another listener.
  They accumulate, they all keep firing, and they hold whatever they closed over
  in memory.
</p>

<div class="bx is-prim">
  <span class="ttl">Why your effect runs twice in development</span>
  <p>
    In development, Strict Mode mounts, unmounts and remounts every component
    once on purpose. It is not a bug and it does not happen in production &mdash;
    it exists to reveal effects with missing cleanup. If running twice breaks
    something, that thing would also break when a user navigated away and back.
  </p>
</div>

<h3>Fetching, done properly</h3>
<pre><code>useEffect(() =&gt; {
  let cancelled = false;

  setLoading(true);
  fetch("/api/users/" + userId)
    .then((r) =&gt; r.json())
    .then((data) =&gt; {
      if (!cancelled) setUser(data);      <span class="c">// ignore a stale response</span>
    })
    .catch((err) =&gt; {
      if (!cancelled) setError(err);
    })
    .finally(() =&gt; {
      if (!cancelled) setLoading(false);
    });

  return () =&gt; {
    cancelled = true;                      <span class="c">// this is the race fix</span>
  };
}, [userId]);</code></pre>
<p>
  The <code>cancelled</code> flag is the whole point. Change
  <code>userId</code> from 1 to 2 quickly and both requests are in flight; if
  request 1 is slower, it resolves <em>last</em> and overwrites user 2 with user
  1. The screen shows the wrong person and nothing looks broken. Every fetching
  effect without that flag has this bug, and it only shows up on slow
  connections.
</p>
<p class="sub">
  <code>AbortController</code> does the same job and also cancels the request
  itself &mdash; worth using once you are comfortable. In real projects, a data
  library handles all of this;
  <a href="/react/react-data-fetching">data fetching patterns</a> covers when to
  stop hand-rolling it.
</p>

<h3>When exactly it runs</h3>
<ol>
  <li>You set state, React re-renders the component.</li>
  <li>React applies the changes to the DOM.</li>
  <li>The browser paints.</li>
  <li><b>Then</b> effects run &mdash; children before parents.</li>
</ol>
<p>
  Because it runs after paint, an effect that measures the DOM and then changes
  layout produces a visible flicker: the user sees the first version. That is
  what <code>useLayoutEffect</code> is for &mdash; identical API, but it runs
  <em>before</em> paint, so the browser never shows the intermediate state. It
  blocks painting, so use it only for measuring and adjusting, never for
  fetching.
</p>

<h3>How dependencies are compared</h3>
<pre><code>useEffect(fn, [user.id]);        <span class="c">// a string — compares by value ✓</span>
useEffect(fn, [user]);           <span class="c">// an object — compares by reference</span>
useEffect(fn, [{ id }]);         <span class="c">// ✗ new object every render → runs every render</span>
useEffect(fn, [items.length]);   <span class="c">// ✓ a number</span></code></pre>
<p>
  React uses <code>Object.is</code> on each entry. Primitives compare by value,
  everything else by identity. If a dependency is an object or a function
  created during render, it is new every time &mdash; which is the single most
  common cause of an effect that will not stop running.
</p>
<p class="sub">
  The array length must also be constant between renders. React compares
  position by position, so a conditionally built dependency array is the same
  class of bug as a conditional hook.
</p>

<h3>Most effects should not exist</h3>
<p>
  This is the part that separates people who use the hook from people who
  understand it. Before writing one, check whether it belongs to one of these
  categories &mdash; none of which needs an effect.
</p>

<h4>Deriving a value</h4>
<pre><code><span class="c">// ✗ an extra render, and it can go stale</span>
const [full, setFull] = useState("");
useEffect(() =&gt; { setFull(first + " " + last); }, [first, last]);

<span class="c">// ✓ just compute it</span>
const full = first + " " + last;</code></pre>

<h4>Responding to a user action</h4>
<pre><code><span class="c">// ✗ now every path that changes items sends analytics</span>
useEffect(() =&gt; { if (items.length) track("added"); }, [items]);

<span class="c">// ✓ it happened because of a click, so put it in the click</span>
function handleAdd(item) {
  setItems([...items, item]);
  track("added");
}</code></pre>
<p>
  The test is simple: did this happen <b>because the user did something</b>, or
  <b>because the component appeared on screen</b>? The first belongs in a
  handler. Only the second is an effect.
</p>

<h4>Resetting state when a prop changes</h4>
<pre><code><span class="c">// ✗ renders once with the old value first</span>
useEffect(() =&gt; { setDraft(""); }, [userId]);

<span class="c">// ✓ let React throw the component away</span>
&lt;Editor key={userId} userId={userId} /&gt;</code></pre>

<h3>The two loops</h3>
<pre><code>useEffect(() =&gt; { setCount(count + 1); });          <span class="c">// ✗ no array — infinite</span>

useEffect(() =&gt; {
  setUser({ ...user, seen: true });                 <span class="c">// ✗ new object each time</span>
}, [user]);</code></pre>
<p>
  The second is the one that catches people out. Objects, arrays and functions
  created during render are new references every render, so an effect that
  depends on one runs every render &mdash; and if it sets state, forever. Depend
  on a primitive instead (<code>[user.id]</code>), or create the value outside
  the component.
</p>

<h3>Do not lie to the linter</h3>
<p>
  The exhaustive-deps rule tells you which values your effect reads. Removing
  one to stop the effect re-running does not fix the loop; it freezes the effect
  on an old value and turns an obvious bug into a subtle one. If satisfying the
  linter breaks the effect, the effect is modelling the wrong thing.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "An effect synchronises the component with something outside React, and it
    runs after paint with a cleanup that runs before the next one. The
    interesting part is what is <em>not</em> an effect &mdash; derived values,
    anything caused by a user action, and resetting state on a prop change,
    which is a <code>key</code>."
  </p>
</div>`,
};
