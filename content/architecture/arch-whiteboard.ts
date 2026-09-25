import type { Chapter } from "../types";

export const archWhiteboard: Chapter = {
  id: "arch-whiteboard",
  num: "I9",
  title: "The whiteboard",
  short: "The whiteboard",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "An infinite SVG board built on plain arrays, pure functions and one history stack.",
  body: `<h3>The shape of it</h3>
<p>
  The whiteboard at <code>/whiteboard</code> is two layers. <code>lib/whiteboard</code> holds five
  modules of plain TypeScript with no React in them: <code>model.ts</code> (the element type, hit
  testing, arrows, history and cleaning), <code>geometry.ts</code> (turning an element into SVG
  parts), <code>storage.ts</code>, <code>exporter.ts</code> and <code>templates.ts</code>.
  <code>app/whiteboard</code> holds the React side, and most of that is one component:
  <code>Board.tsx</code>, at 1,851 lines, owns the camera, the gestures, the selection and the
  keyboard. The page loads it through <code>next/dynamic</code> with <code>ssr: false</code>,
  because nothing about a board can be rendered without the reader's browser storage.
</p>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="Pointer events are coalesced into one step per animation frame, which writes a draft copy of the elements. When the gesture ends the draft is committed to the history stack, which is saved to localStorage after 400 milliseconds and again on pagehide. The render reads the draft or the present state, culls it above 150 elements, and draws each element through a memoized ElementView.">
<g class="rough">
<rect x="24" y="36" width="180" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="236" y="36" width="180" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="448" y="36" width="190" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="670" y="36" width="206" height="72" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="24" y="196" width="180" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="236" y="196" width="180" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="448" y="196" width="190" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="670" y="196" width="206" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<path class="ln" d="M204 72 H230" marker-end="url(#arrow)" />
<path class="ln" d="M416 72 H442" marker-end="url(#arrow)" />
<path class="ln" d="M638 72 H664" marker-end="url(#arrow)" />
<path class="ln" d="M773 108 V190" marker-end="url(#arrow)" />
<path class="ln" d="M543 108 V190" marker-end="url(#arrow)" />
<path class="ln" d="M448 232 H422" marker-end="url(#arrow)" />
<path class="ln" d="M236 232 H210" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="114" y="66" text-anchor="middle">Pointer events</text>
<text class="sm" x="114" y="90" text-anchor="middle">move, pinch, wheel</text>
<text class="lbl" x="326" y="66" text-anchor="middle">rAF step</text>
<text class="sm" x="326" y="90" text-anchor="middle">one per frame</text>
<text class="lbl" x="543" y="66" text-anchor="middle">Draft</text>
<text class="sm" x="543" y="90" text-anchor="middle">live copy, no history</text>
<text class="lbl gr" x="773" y="66" text-anchor="middle">History</text>
<text class="sm" x="773" y="90" text-anchor="middle">one commit per gesture</text>
<text class="sm" x="784" y="146">400 ms debounce</text>
<text class="sm" x="784" y="166">flush on pagehide</text>
<text class="sm" x="553" y="146">draft ?? present</text>
<text class="lbl" x="773" y="226" text-anchor="middle">localStorage</text>
<text class="sm" x="773" y="250" text-anchor="middle">one key per board</text>
<text class="lbl" x="543" y="226" text-anchor="middle">Cull</text>
<text class="sm" x="543" y="250" text-anchor="middle">only above 150</text>
<text class="lbl" x="326" y="226" text-anchor="middle">ElementView</text>
<text class="sm" x="326" y="250" text-anchor="middle">memo, describe()</text>
<text class="lbl" x="114" y="226" text-anchor="middle">SVG</text>
<text class="sm" x="114" y="250" text-anchor="middle">on screen</text>
</svg>
<figcaption>
  A drag never touches the history stack until the pointer lifts. Everything between is a draft
  that renders but cannot be undone, which is why one drag is one undo step.
</figcaption>
</figure>

<h3>The element model</h3>
<p>
  A board is an array of <code>El</code> objects, and the array order is the stacking order. Every
  element has an id, a <code>kind</code>, a box (<code>x</code>, <code>y</code>, <code>w</code>,
  <code>h</code>) and a <code>style</code>. Lines, arrows and pen strokes also carry
  <code>points</code>, stored relative to <code>x</code> and <code>y</code>. Arrows carry
  <code>start</code> and <code>end</code>, the ids of the shapes they are bound to. Two optional
  flags, <code>locked</code> and <code>group</code>, hold the rest.
</p>
<div class="table-scroll"><table>
<thead><tr><th>What</th><th>Count</th><th>Which</th></tr></thead>
<tbody>
<tr><td>Element kinds</td><td>15</td><td>pen, line, arrow, rect, ellipse, diamond, text, sticky, image, and six extra shapes: triangle, hexagon, star, cylinder, parallelogram, cloud</td></tr>
<tr><td>Tools</td><td>19</td><td>13 in the dock, with the six extra shapes behind one shapes button</td></tr>
<tr><td>Arrow heads</td><td>5</td><td>none, arrow, triangle, dot, bar</td></tr>
<tr><td>Dash styles</td><td>3</td><td>solid, dashed, dotted</td></tr>
</tbody>
</table></div>
<p>
  The highlighter and the laser are tools, not kinds. A highlighter stroke is a wide pen stroke at
  35% opacity, and the laser adds nothing to the array: its trail fades after 700 ms.
</p>

<h3>From element to SVG</h3>
<p>
  <code>describe(el, palette)</code> in <code>geometry.ts</code> turns one element into a list of
  <code>Part</code> objects, each a tag name (<code>path</code>, <code>rect</code>,
  <code>ellipse</code>, <code>polygon</code>, <code>image</code> or <code>text</code>) and its
  attributes. A cylinder is two paths. An arrow is a smoothed path plus a part for each head. A
  label becomes a text part with its lines already wrapped.
</p>
<p>
  <code>ElementView</code> maps parts to JSX, and it is wrapped in <code>memo</code>. That matters
  because every edit in the model returns a new array but reuses the objects it did not change. When
  a reader drags three shapes across a board of 500, <code>moveEls</code> creates three new objects
  and 497 of the <code>ElementView</code>s see the same prop and skip rendering.
</p>
<p>
  The same <code>describe()</code> drives export. On screen the palette is
  <code>var(--wb-ink)</code> and <code>var(--wb-paper)</code>, so a theme change recolours the
  board with no re-render. For export, <code>Board.tsx</code> reads the computed values of those
  two variables and passes real colours, and <code>partToSvg</code> writes strings instead of JSX.
  Because there is only one drawing function, an exported board always matches the screen.
</p>

<h3>Hit testing and arrows</h3>
<p>
  <code>hitTest</code> checks lines by distance to each segment, with a reach of the tolerance plus
  half the stroke width. Ellipses use the ellipse equation, and polygon shapes use a ray-casting
  inside test plus a near-the-outline test, so clicking the empty corner of a star's box misses it.
  <code>elementAt</code> walks the array from the end, so the topmost element wins. The tolerance
  is <code>6 / zoom</code>, which keeps the grab distance the same on screen at any zoom.
</p>
<p>
  An arrow is bound when its end is dropped on a shape, and <code>bindTarget</code> uses twice the
  normal tolerance for that. <code>routeArrows</code> then puts each bound end on the outline of its
  shape, facing the other end. <code>edgeToward</code> works out that point by intersecting a line
  from the centre with the polygon's edges, the ellipse, or the box, and leaves a 6-unit gap. It
  takes a set of changed ids and only recomputes arrows touching them. Moving an arrow on its own
  detaches it, and deleting a shape nulls the ends that pointed at it.
</p>

<h3>History</h3>
<p>
  <code>History</code> is <code>{ past, present, future }</code>, three arrays of whole boards.
  <code>commit</code> pushes the present onto <code>past</code>, trims it to 100 entries and clears
  <code>future</code>. Undo and redo move one board between the arrays. Keeping whole boards is
  cheap here because of structural sharing: two neighbouring states share every element that did
  not change.
</p>
<p>
  Three rules keep the stack honest. A gesture writes a draft and commits once when it ends.
  <code>apply</code> skips a commit when the new array holds the same objects as the present, so a
  click that moves nothing leaves no empty undo step. And the opacity slider goes through
  <code>applyCoalesced</code>, which folds changes to the same selection that arrive within 900 ms
  into one entry.
</p>

<h3>Gestures</h3>
<ul>
<li><strong>Frame throttling.</strong> <code>onPointerMove</code> stores the latest position and
schedules one <code>requestAnimationFrame</code>. However many events a 120 Hz pen fires, the board
steps once per frame. <code>finish()</code> runs any pending step before committing, so the final
position is never lost.</li>
<li><strong>Pinch.</strong> Active pointers live in a <code>Map</code>. When there are two, the
zoom is the starting zoom times the ratio of the distances, and the camera is solved so that the
world point under the starting midpoint stays under the current midpoint.</li>
<li><strong>Wheel.</strong> A non-passive listener zooms by <code>exp(-deltaY &times; 0.01)</code>
around the cursor when Ctrl or Cmd is held, which is also what a trackpad pinch sends, and pans
otherwise. Zoom is clamped between 0.1 and 5, and the buttons step by 1.2.</li>
<li><strong>Pen strokes.</strong> Points closer than <code>1.5 / zoom</code> to the last one are
dropped while drawing, and the finished stroke is simplified with Ramer&ndash;Douglas&ndash;Peucker
at <code>0.6 / zoom</code>.</li>
</ul>

<h3>Storage and untrusted input</h3>
<p>
  Each board is its own key, <code>groundwork:board:&lt;id&gt;</code>, beside an index at
  <code>groundwork:boards</code>, the last board opened and the page preferences. Changes are saved
  400 ms after they stop, and a <code>pagehide</code> or <code>visibilitychange</code> listener
  saves at once, so closing the tab inside that window loses nothing. If storage is full, the board
  says so and suggests exporting or removing images.
</p>
<p>
  Everything read back goes through <code>sanitizeEls</code>, including the reader's own storage,
  imported JSON and share links. It keeps only known kinds, drops duplicate ids, clamps numbers to
  &plusmn;10,000,000, width to 0.5&ndash;60, opacity to 0.05&ndash;1 and font size to 6&ndash;400,
  cuts strings, drops non-finite points, accepts an image only if its source starts with
  <code>data:image/</code>, and unbinds arrows whose target is missing. How many elements it keeps
  depends on the source.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Source</th><th>Elements kept</th></tr></thead>
<tbody>
<tr><td>A saved board</td><td>50,000</td></tr>
<tr><td>An imported JSON file</td><td>5,000</td></tr>
<tr><td>A share link</td><td>2,000</td></tr>
</tbody>
</table></div>

<h3>Export and share links</h3>
<p>
  SVG export fits a view box to the union of the elements' bounds, with 32 units of padding. PNG
  export draws that SVG into an <code>Image</code>, waits for <code>decode()</code>, and paints it
  onto a canvas at twice the size. JSON export writes
  <code>{ type: "groundwork-board", version: 1, name, elements }</code>. When something is
  selected, PNG and SVG export only the selection.
</p>
<p>
  A share link puts the whole board in the URL fragment, after <code>#board=</code>. The board is
  turned into JSON, compressed with the browser's <code>CompressionStream("deflate-raw")</code>
  and written as base64url. Nothing goes to a server, because a fragment is never sent in a
  request. Images are left out and the reader is told how many, and a link longer than 60,000
  characters is refused with a suggestion to export JSON. Opening a link always creates a new
  board named with a "(shared)" suffix, then clears the fragment, so a shared link cannot
  overwrite anything.
</p>

<h3>Templates, pages and tints</h3>
<p>
  <code>templates.ts</code> has six templates: flowchart, system design, kanban, mind map, a 2
  &times; 2 matrix and a retro. Each builds its elements with bound arrows, then
  <code>placeTemplate</code> routes the arrows and centres the result in the view.
</p>
<p>
  <code>Paper.tsx</code> defines 19 page layouts, counting blank, grouped under Dots, Grid, Lines
  and Technical. Each is an SVG
  <code>&lt;pattern&gt;</code> whose stroke width is divided by the zoom so its lines stay hairline,
  and each has a <code>minZoom</code> below which the pattern is hidden rather than drawn as noise.
  Eight tints sit alongside. "Theme" follows the site theme, and the other seven (white, cream,
  kraft, mint, blueprint, chalkboard and night) set <code>--wb-paper</code>, <code>--wb-ink</code>
  and <code>--wb-line</code> on the board's root element.
</p>

<h3>Lock, group and align</h3>
<p>
  A locked element can still be selected, but <code>moveEls</code>, <code>removeEls</code> and the
  align functions skip it. Duplicates come out unlocked. Grouping stamps a shared group id, and
  <code>expandGroups</code> turns a click on one member into a selection of all of them.
  There are six align options (left, centre, right, top, middle, bottom) and two distribute
  options. Distributing needs at least three elements and leaves bound arrows alone, since
  <code>routeArrows</code> places those.
</p>

<h3>The context menu and the drawer</h3>
<p>
  Right-clicking opens <code>ContextMenu.tsx</code>, a <code>role="menu"</code> list that stays
  inside the board, focuses its first button, moves with the arrow keys, and closes on Escape, an
  outside click or the window losing focus. Its items depend on whether anything is selected.
</p>
<p>
  The menu button opens <code>BoardMenu.tsx</code>, a drawer rendered through a portal with the
  board list, the site's appearance picker, and export, import, share and clear.
</p>

<h3>Performance</h3>
<p>
  Above 150 elements the render stops drawing what cannot be seen. It keeps elements whose bounds
  overlap the visible area plus a margin of <code>200 / zoom</code>, and always keeps the
  selection and the element being edited. Below 150 it draws everything.
</p>
<p>
  Culling limits how many elements are drawn, memoization how many re-render, and frame throttling
  how often either happens. In an earlier measurement in headless Chromium, a board of 2,000
  elements kept frames at 16.7 ms at the 95th percentile.
</p>

<div class="bx is-ref">
<span class="ttl">Why SVG and not a canvas</span>
<p>
  A canvas would draw faster at very large counts, but it would have to reimplement text layout,
  hit regions, focus and crisp scaling. SVG gets those from the browser, and CSS variables recolour
  it for free. The model is kept separate from the drawing, and every element goes through
  <code>describe()</code> into plain parts, so a canvas renderer could consume the same parts later
  if a board ever outgrows SVG.
</p>
</div>`,
};
