import type { Chapter } from "../types";

export const reactRefsDepth: Chapter = {
  id: "react-refs-depth",
  num: "A10",
  title: "Refs in depth",
  short: "Refs in depth",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Forwarding, imperative handles, and integrating libraries that own their own DOM.",
  body: `<h3>ref is a prop again</h3>
<pre><code><span class="c">// React 19</span>
function TextField({ ref, ...rest }) {
  return &lt;input ref={ref} {...rest} /&gt;;
}

<span class="c">// before 19, and in every existing codebase</span>
const TextField = forwardRef(function TextField(props, ref) {
  return &lt;input ref={ref} {...props} /&gt;;
});</code></pre>
<p>
  <code>forwardRef</code> existed because <code>ref</code> was intercepted by
  React rather than passed through. In 19 function components receive it
  normally. You will still read <code>forwardRef</code> constantly, so knowing
  both forms matters more than preferring one.
</p>

<h3>useImperativeHandle: exposing an API instead of a node</h3>
<pre><code>function Editor({ ref }) {
  const inner = useRef(null);

  useImperativeHandle(ref, () =&gt; ({
    focus: () =&gt; inner.current.focus(),
    clear: () =&gt; { inner.current.value = ""; },
  }), []);

  return &lt;textarea ref={inner} /&gt;;
}

editorRef.current.focus();      <span class="c">// the parent gets two methods, not a DOM node</span></code></pre>
<p>
  Handing out the raw node lets a parent do anything to it &mdash; including
  things that fight React. A narrow handle is a contract: these are the
  imperative operations this component supports.
</p>
<div class="bx is-prim">
  <span class="ttl">Use it rarely, and for a reason</span>
  <p>
    A component that needs commanding from outside is usually one that should
    have taken a prop. <code>ref.current.open()</code> and
    <code>&lt;Modal isOpen /&gt;</code> do the same job; the second is
    declarative, testable, and survives being rendered twice. Reach for an
    imperative handle when the action genuinely has no state &mdash; focus,
    scroll, play, reset &mdash; where modelling it as state means inventing a
    flag you then have to clear.
  </p>
</div>

<h3>Callback refs, and the cleanup nobody knew about</h3>
<pre><code>&lt;div ref={(node) =&gt; {
  if (!node) return;
  const observer = new ResizeObserver(onResize);
  observer.observe(node);
  return () =&gt; observer.disconnect();     <span class="c">// React 19: cleanup from a ref callback</span>
}} /&gt;</code></pre>
<p>
  Before 19, a callback ref was called with <code>null</code> on unmount and you
  cleaned up in that branch. React 19 lets it return a cleanup function
  directly, which makes ref callbacks a genuine alternative to an effect for
  anything scoped to a node's lifetime.
</p>
<p class="sub">
  The callback must be stable or memoised. An inline arrow is a new function
  each render, so React detaches and reattaches &mdash; running your setup and
  teardown on every render.
</p>

<h3>Merging refs</h3>
<pre><code>function useMergedRefs(...refs) {
  return useCallback((node) =&gt; {
    for (const ref of refs) {
      if (typeof ref === "function") ref(node);
      else if (ref) ref.current = node;
    }
  }, refs);
}

&lt;input ref={useMergedRefs(localRef, forwardedRef, register("email").ref)} /&gt;</code></pre>
<p>
  An element takes one <code>ref</code>, and libraries want their own &mdash; a
  form library, a drag-and-drop hook, and your own measurement all at once. This
  ten-line helper is why <code>react-merge-refs</code> exists.
</p>

<h3>Integrating a library that owns its DOM</h3>
<pre><code>function Map({ center, markers }) {
  const container = useRef(null);
  const map = useRef(null);

  useEffect(() =&gt; {
    map.current = new MapLib(container.current);      <span class="c">// create once</span>
    return () =&gt; map.current.destroy();
  }, []);

  useEffect(() =&gt; { map.current?.setCenter(center); }, [center]);   <span class="c">// sync props in</span>
  useEffect(() =&gt; { map.current?.setMarkers(markers); }, [markers]);

  return &lt;div ref={container} /&gt;;      <span class="c">// React never touches inside this</span>
}</code></pre>
<p>
  The pattern is always the same: <b>one effect to create and destroy, one per
  prop to synchronise</b>, and a container React renders empty and then leaves
  alone. React must not manage children of a node another library controls
  &mdash; they will fight, and the reconciler will lose in confusing ways.
</p>

<h3>Focus management, which is mostly refs</h3>
<pre><code>useEffect(() =&gt; {
  const previous = document.activeElement;      <span class="c">// remember where focus was</span>
  dialogRef.current?.focus();
  return () =&gt; previous?.focus();               <span class="c">// put it back on close</span>
}, []);</code></pre>
<p>
  Returning focus to the element that opened a dialog is the difference between
  a keyboard user continuing where they were and being dumped at the top of the
  document. It is three lines and it is skipped constantly.
</p>

<h3>The rules that keep refs safe</h3>
<ul>
  <li><b>Never read or write <code>ref.current</code> during render.</b> Rendering must be pure and may run twice.</li>
  <li><b>Do not fight React for a node it owns.</b> Setting <code>textContent</code> on something React renders will be overwritten, or worse, will not be.</li>
  <li><b>A ref is not state.</b> If the UI must change when it changes, it is state.</li>
  <li><b>Prefer declarative.</b> An imperative handle is an escape hatch, and every one you add is a way for a parent to break your component's assumptions.</li>
</ul>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Refs are the escape hatch to the DOM and to values that persist without
    rendering. <code>useImperativeHandle</code> narrows what a parent can do to
    a small API instead of a raw node, and the standard pattern for a
    third-party widget is one effect to create and destroy plus one per prop to
    synchronise — with React never rendering inside the container."
  </p>
</div>`,
};
