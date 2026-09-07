import type { Chapter } from "../types";

export const reactCustomRenderers: Chapter = {
  id: "react-custom-renderers",
  num: "A17",
  title: "Custom renderers",
  short: "Custom renderers",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "React is not a DOM library. The DOM is one target among several.",
  body: `<h3>The split nobody notices</h3>
<p>
  React is two packages doing two jobs.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Package</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>react</code></td><td>Components, hooks, state, context, the element format. Knows nothing about the DOM.</td></tr>
<tr><td><code>react-reconciler</code></td><td>Diffing, scheduling, priorities, the fiber tree. Also knows nothing about the DOM.</td></tr>
<tr><td><code>react-dom</code></td><td>A <b>host config</b>: how to create a node, set a property, insert a child.</td></tr>
</tbody>
</table></div>
<p>
  Swap the third and everything else keeps working. That is why
  <code>useState</code> behaves identically in React Native, and why the
  reconciler chapter never mentions elements.
</p>

<h3>What already exists</h3>
<div class="table-scroll"><table>
<thead><tr><th>Renderer</th><th>Targets</th></tr></thead>
<tbody>
<tr><td>React Native</td><td>Native iOS and Android views</td></tr>
<tr><td>React Three Fiber</td><td>A three.js scene graph &mdash; WebGL</td></tr>
<tr><td>Ink</td><td>A terminal. Used by real CLIs.</td></tr>
<tr><td>React PDF</td><td>A PDF document</td></tr>
<tr><td>React Test Renderer</td><td>A plain object tree, for assertions</td></tr>
</tbody>
</table></div>
<p>
  None of these is a fork. They are host configs over the same reconciler, which
  is the point: the component model turned out to be more general than the DOM.
</p>

<h3>A host config, roughly</h3>
<pre><code>const config = {
  createInstance(type, props) { return new SceneNode(type, props); },
  appendChild(parent, child) { parent.add(child); },
  removeChild(parent, child) { parent.remove(child); },
  commitUpdate(instance, _t, oldProps, newProps) { instance.apply(newProps); },
  prepareUpdate(_i, _t, oldProps, newProps) { return diff(oldProps, newProps); },
  shouldSetTextContent() { return false; },
  getPublicInstance(instance) { return instance; },
  supportsMutation: true,
};

const reconciler = Reconciler(config);
const container = reconciler.createContainer(root, 0, null, false, null, "", console.error, null);
reconciler.updateContainer(&lt;App /&gt;, container, null, null);</code></pre>
<p>
  Thirty-odd methods, and the reconciler supplies everything else &mdash; hooks,
  context, Suspense, transitions, the diff. You describe how to create, insert,
  update and remove a node in your world; React decides when.
</p>

<h3>Mutation, persistence and no-op</h3>
<ul>
  <li><b>Mutation mode</b> &mdash; nodes are modified in place. The DOM works this way.</li>
  <li><b>Persistence mode</b> &mdash; every change produces a new node tree. Used where the host is immutable, as in some native frameworks.</li>
  <li><b>No-op</b> &mdash; nothing is committed anywhere. This is how the test renderer works.</li>
</ul>

<h3>Why this is worth understanding even if you never write one</h3>
<div class="bx is-prim">
  <span class="ttl">It explains the boundaries</span>
  <p>
    Everything React "cannot do" &mdash; measure a DOM node during render, read
    layout, focus something &mdash; is not a limitation of React. It is that
    those are host concerns, and the reconciler deliberately knows nothing about
    a host. That is exactly why refs and effects exist: they are the sanctioned
    doors from React's world into the host's.
  </p>
</div>
<p>
  It also explains why the reconciler's rules are so strict. Purity,
  interruptibility, no side effects during render &mdash; those hold because the
  same algorithm has to be correct for a terminal, a 3D scene and a PDF, not
  just a browser.
</p>

<h3>The realistic reasons to build one</h3>
<ul>
  <li>You own a rendering target &mdash; a canvas engine, a game UI, embedded hardware &mdash; and want the component model over it.</li>
  <li>A declarative wrapper over an imperative scene graph, which is exactly what React Three Fiber is.</li>
  <li>Curiosity. Writing one is the fastest way to actually understand the reconciler.</li>
</ul>
<p>
  Not to render to the DOM differently. <code>react-dom</code> is one of the most
  battle-tested pieces of software on the web, and a custom renderer for it
  would be slower and wrong in ways you would find one at a time.
</p>

<h3>The idea to take away</h3>
<p>
  React is a <b>scheduling and diffing engine for tree-shaped UIs</b>, with a
  pluggable back end. Components, hooks and state are the front end and are
  target-independent. Once that clicks, React Native stops looking like a
  separate framework, and the strictness of the render phase stops looking
  arbitrary.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "React splits into the component model, a host-agnostic reconciler, and a
    host config that says how to create and update nodes — which is why the same
    hooks work in React Native, Ink and React Three Fiber. Knowing that explains
    why render must be pure and why refs and effects exist: they are the only
    sanctioned doors to the host."
  </p>
</div>`,
};
