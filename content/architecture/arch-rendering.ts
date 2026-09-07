import type { Chapter } from "../types";

export const archRendering: Chapter = {
  id: "arch-rendering",
  num: "I3",
  title: "Server, client, and the line between them",
  short: "Server vs client",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Every page route is static. The interesting work is deciding what crosses into the browser.",
  body: `<h3>The rule</h3>
<p>
  A component is a server component unless it needs something only a browser has: state, an effect,
  an event handler, <code>localStorage</code>, or a measurement. Marking a component
  <code>"use client"</code> is a decision with a cost, because everything it imports is bundled and
  shipped.
</p>

<h3>What is actually a client component here</h3>
<div class="table-scroll"><table>
<thead><tr><th>Component</th><th>Why it has to be</th></tr></thead>
<tbody>
<tr><td><code>Shell</code></td><td>The sidebar collapses, the drawer opens, the theme and font come from storage</td></tr>
<tr><td><code>ReaderShell</code></td><td>Scroll progress, search, the narrator, the chapter nav accordion</td></tr>
<tr><td><code>PracticeWorkspace</code></td><td>The editor, the runner, the console</td></tr>
<tr><td><code>HomeView</code></td><td>The topic filter box and the saved-level links</td></tr>
<tr><td>Progress widgets</td><td>They read <code>localStorage</code> and subscribe to writes</td></tr>
</tbody>
</table></div>
<p>
  Everything else — the chapter body, the cover sheet, the syllabus, the interview rounds — is
  rendered on the server and ships as HTML.
</p>

<h3>The mistake this codebase made twice</h3>
<p>
  A client component that imports a data module pulls that whole module into the bundle. Tree-shaking
  cannot help, because it works at the level of exports, not object properties: importing one field
  of a large object still bundles the object.
</p>
<p>
  The sidebar needed a name, a mark and a link per topic. It imported the whole topic dataset to get
  them — every topic, every level, every syllabus section — onto the initial script set of 557 pages.
  Serialised, it needed 8 KB of the 127 KB it was paying for.
</p>
<p>
  The fix was a smaller type. The server derives a flat list of scalar fields and hands it to the
  client through a context provider, the same way the list of ready topics was already handed over.
  Measured after the change: about 27 KB of brotli off every page, and 57 KB off the home page, which
  had also been serialising the full list into its own payload.
</p>

<div class="bx is-ref">
<span class="ttl">The trap that made the first attempt useless</span>
<p>
  After moving the sidebar to the smaller type, the bundle did not shrink at all. The reason was one
  line: <code>Shell</code> still imported a single string constant from the module that owns the
  topic data, and that import pulled the whole file back in. Moving the constant into a file of its
  own is what actually did it — the chunk went from 259 KB on 557 pages to 112 KB on two.
</p>
</div>

<h3>Dynamic imports, used sparingly</h3>
<p>
  Two things are loaded on demand rather than up front: the focus-trap primitive, which is only
  needed once a mobile drawer opens, and the code editor, which is only needed on the playground.
  Keeping the editor off other routes is worth 1.3 MB — it was reaching the home page through a
  link prefetch until recently.
</p>`,
};
