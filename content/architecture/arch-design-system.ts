import type { Chapter } from "../types";

export const archDesignSystem: Chapter = {
  id: "arch-design-system",
  num: "I13",
  title: "The design system",
  short: "Design system",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Nine themes and seven fonts as CSS variables, two page shells, and the checks that keep them readable.",
  body: `<h3>Tokens, not components</h3>
<p>
  There is no component library here. The design system is a set of CSS custom properties in
  <code>app/globals.css</code>, two attributes on the <code>&lt;html&gt;</code> element that
  choose which set applies, and a few shared React components that read them. A theme is a CSS
  rule block, and so is a font. Changing either is one <code>setAttribute</code> call, and the
  browser recolours or re-sets the whole page without React rendering anything.
</p>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="Before the page paints, the theme-init script reads the saved theme and font from localStorage and sets data-theme and data-font on the html element. Those attributes select token blocks in globals.css, which every component reads through var(). After hydration, the pickers call hooks that save the choice and set the attributes again.">
<g class="rough">
<rect x="24" y="44" width="170" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="224" y="44" width="200" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="454" y="44" width="220" height="72" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="704" y="44" width="172" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="224" y="200" width="200" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="454" y="200" width="220" height="72" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="704" y="200" width="172" height="72" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<path class="ln" d="M194 80 H218" marker-end="url(#arrow)" />
<path class="ln" d="M424 80 H448" marker-end="url(#arrow)" />
<path class="ln" d="M674 80 H698" marker-end="url(#arrow)" />
<path class="ln" d="M790 116 V194" marker-end="url(#arrow)" />
<path class="ln" d="M424 236 H448" marker-end="url(#arrow)" />
<path class="ln" d="M564 200 V122" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="109" y="74" text-anchor="middle">localStorage</text>
<text class="sm" x="109" y="98" text-anchor="middle">jsnotes:theme, :font</text>
<text class="lbl" x="324" y="74" text-anchor="middle">theme-init</text>
<text class="sm" x="324" y="98" text-anchor="middle">runs before paint</text>
<text class="lbl gr" x="564" y="74" text-anchor="middle">&lt;html&gt;</text>
<text class="sm" x="564" y="98" text-anchor="middle">data-theme, data-font</text>
<text class="lbl" x="790" y="74" text-anchor="middle">globals.css</text>
<text class="sm" x="790" y="98" text-anchor="middle">token blocks</text>
<text class="lbl" x="324" y="230" text-anchor="middle">Pickers</text>
<text class="sm" x="324" y="254" text-anchor="middle">dropdowns, swatches</text>
<text class="lbl" x="564" y="230" text-anchor="middle">useThemeChoice</text>
<text class="sm" x="564" y="254" text-anchor="middle">save, then set</text>
<text class="lbl" x="790" y="230" text-anchor="middle">Every rule</text>
<text class="sm" x="790" y="254" text-anchor="middle">var(--ink), var(--sheet)</text>
</svg>
<figcaption>
  Two paths set the same two attributes. The script handles the first paint, before React exists.
  The hooks handle every change after that.
</figcaption>
</figure>

<h3>Nine themes</h3>
<p>
  The <code>:root</code> block in <code>globals.css</code> defines 65 custom properties: paper and
  sheet colours, ink, pencil, red and green, highlighter colours, sticky notes, code colours,
  diagram boxes, shadows, sizes, fonts and the editor's <code>--ide-*</code> palette. That block is
  the Paper theme. Each of the other eight is an <code>html[data-theme="&hellip;"]</code> block
  that overrides the same 43 properties (the colours and the shadows) and sets <code>color-scheme</code>, so native
  scrollbars and form controls match.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Value</th><th>Shown as</th><th>Scheme</th></tr></thead>
<tbody>
<tr><td><code>light</code></td><td>Paper</td><td>light</td></tr>
<tr><td><code>dark</code></td><td>Night</td><td>dark</td></tr>
<tr><td><code>kraft</code></td><td>Kraft</td><td>light</td></tr>
<tr><td><code>blueprint</code></td><td>Blueprint</td><td>dark</td></tr>
<tr><td><code>sepia</code></td><td>Sepia</td><td>light</td></tr>
<tr><td><code>forest</code></td><td>Forest</td><td>light</td></tr>
<tr><td><code>rose</code></td><td>Rose</td><td>dark</td></tr>
<tr><td><code>mono</code></td><td>Mono</td><td>light</td></tr>
<tr><td><code>lavender</code></td><td>Lavender</td><td>light</td></tr>
</tbody>
</table></div>
<p>
  <code>app/theme-bridge.css</code> maps these names onto the conventional ones Tailwind utilities
  expect (<code>--background</code>, <code>--primary</code>, <code>--border</code> and so on)
  inside an <code>@theme inline</code> block, so a Tailwind class and a hand-written rule resolve
  to the same colour in every theme.
</p>

<h3>Seven fonts</h3>
<p>
  <code>lib/fonts.ts</code> loads 13 families through <code>next/font/google</code>, which serves
  them from the site's own origin and exposes each as a variable such as
  <code>--font-caveat</code>. Only the default pair, Caveat and Kalam, is preloaded, with
  <code>display: "optional"</code>, so a slow font never causes a layout shift. The other eleven
  set <code>preload: false</code> and download only when a <code>data-font</code> rule starts
  using them.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Value</th><th>Shown as</th><th>Headings</th><th>Body</th></tr></thead>
<tbody>
<tr><td><code>classic</code></td><td>Classic</td><td>Caveat</td><td>Kalam</td></tr>
<tr><td><code>marker</code></td><td>Marker</td><td>Patrick Hand</td><td>Shadows Into Light</td></tr>
<tr><td><code>sketch</code></td><td>Sketch</td><td>Architects Daughter</td><td>Reenie Beanie</td></tr>
<tr><td><code>pen</code></td><td>Pen</td><td>Gochi Hand</td><td>Neucha</td></tr>
<tr><td><code>script</code></td><td>Script</td><td>Dancing Script</td><td>Handlee</td></tr>
<tr><td><code>serif</code></td><td>Reading</td><td>Literata</td><td>Literata</td></tr>
<tr><td><code>roboto</code></td><td>Roboto</td><td>Roboto</td><td>Roboto</td></tr>
</tbody>
</table></div>
<p>
  Five of the seven are handwriting. Reading and Roboto exist for people who find handwriting hard
  to read for long, and they are the reason the picker's heading says "Handwriting" but its options
  do not all fit the name. JetBrains Mono stays the <code>--font-mono</code> for code blocks in
  every font.
</p>

<h3>The first paint</h3>
<p>
  The server cannot know a reader's theme, so the root layout renders
  <code>&lt;html data-theme="light" suppressHydrationWarning&gt;</code>. A
  <code>next/script</code> with <code>strategy="beforeInteractive"</code> runs the string in
  <code>lib/themeInitScript.ts</code> before the page paints. It reads <code>jsnotes:theme</code>,
  falls back to <code>prefers-color-scheme</code>, and sets <code>data-theme</code>. It reads
  <code>jsnotes:font</code> and sets <code>data-font</code>, defaulting to
  <code>classic</code>. The whole thing is wrapped in <code>try</code>, so blocked storage leaves
  the Paper theme rather than an error. <code>suppressHydrationWarning</code> tells React the
  attribute is expected to differ from the server's HTML.
</p>

<h3>The pickers</h3>
<p>
  <code>components/ThemeFontPicker.tsx</code> exports two hooks.
  <code>useThemeChoice()</code> returns the theme, a <code>choose</code> function and whether the
  component has mounted. Before mounting it reports <code>"light"</code> to match the server.
  After mounting it uses the saved theme or the OS scheme, read through
  <code>useSyncExternalStore</code> so it follows a system switch live. An effect then writes the
  attribute. <code>choose</code> saves first and then updates state. <code>useFontChoice()</code>
  does the same for fonts. <code>ThemePicker</code> and <code>FontPicker</code> are compact
  dropdowns built on these hooks, and they render nothing until mounted, so they never flash the
  wrong value.
</p>
<p>
  <code>components/AppearancePicker.tsx</code> is the larger version used inside drawers. Themes
  are a <code>role="radiogroup"</code> of swatches, each showing that theme's sheet, ink and
  accent colours, and fonts are a second radiogroup with an "Aa" sample set in each font.
</p>

<h3>Two page shells</h3>
<p>
  Reading pages use <code>components/Shell.tsx</code>. It draws the top bar and a sidebar with the
  clock and weather, the streak, the topic of the day, links to the practice tools and the topic
  list, and the theme and font dropdowns at the foot. The sidebar collapses, and the choice is
  saved under <code>jsnotes:sidebar-collapsed</code>, with a separate key for workspace pages. On a
  narrow screen it becomes a drawer. Opening the drawer locks body scroll, focuses the sidebar,
  closes on Escape, and traps focus with <code>@radix-ui/react-focus-scope</code>, which is loaded
  with <code>next/dynamic</code> only when needed. Eleven files render it, from the home page to
  the reader.
</p>
<p>
  The practice playground, the problems list and the whiteboard are full-screen tools, and a
  sidebar would cost them width they need. They have no persistent chrome. Practice and problems
  open <code>components/SiteDrawer.tsx</code> from a menu button. It is a portal with
  <code>role="dialog"</code> and <code>aria-modal</code>, seven links (home, playground, problems,
  whiteboard, mock interview, review, progress) with <code>aria-current</code> on the current one,
  and an <code>AppearancePicker</code>. It focuses its first control, closes on Escape, locks
  scroll, and returns focus to whatever opened it. The whiteboard renders through
  <code>BareShell</code> with <code>header={false}</code> and has its own board menu drawer, which
  embeds the same <code>AppearancePicker</code>.
</p>

<h3>Modals</h3>
<p>
  <code>components/Modal.tsx</code> is built on the native <code>&lt;dialog&gt;</code> element,
  opened with <code>showModal()</code>. The browser supplies the focus trap, the Escape key, the
  <code>::backdrop</code> and the inert page behind. The component adds a click-outside close and
  two dialogs: <code>ConfirmDialog</code>, with Cancel focused by default so a stray Enter does not
  delete anything, and <code>NameDialog</code>, a form with validation used for naming boards and
  files. The whiteboard and the playground's file dialogs use them.
</p>

<h3>CSS modules and globals.css</h3>
<p>
  <code>globals.css</code> is 9,319 lines. It holds the tokens, the prose styles every chapter
  uses, and the reading pages' layout. Seven CSS modules hold everything that belongs to one tool:
  <code>app/mock/mock.module.css</code> (2,187 lines), <code>app/whiteboard/whiteboard.module.css</code>
  (1,572), <code>app/problems/problems.module.css</code> (1,167), and four small ones for the
  modal, the drawer, the appearance picker and the bare header. The rule of thumb is that anything
  chapter HTML can contain goes in globals, because chapter bodies are strings that cannot import a
  module, and anything else goes in a module so it loads only with its page.
</p>

<h3>The hand-drawn look</h3>
<p>
  Diagrams like the one above are inline SVG in the chapter's HTML. They use shared classes:
  <code>.dg</code> sets the body font and ink colour on text, <code>.lbl</code> and <code>.sm</code>
  set two text sizes, <code>.ln</code> is a 2.2-wide ink stroke, and boxes fill with
  <code>--sheet</code>, <code>--sheet-2</code> or the <code>--dg-box-*</code> colours, so every
  diagram follows the theme. The wobble comes from <code>.rough</code>, which applies an SVG filter
  with the id <code>wob</code>. That filter is fractal noise (base frequency 0.022, three octaves,
  seed 7) feeding a displacement map of scale 2.4, and it is defined once in the reader shell
  along with the <code>arrow</code>, <code>arrow-green</code> and <code>arrow-red</code> markers.
  Because the seed is fixed, the wobble is the same on every load.
</p>
<p>
  Icons follow the same idea. There is no icon package. <code>app/whiteboard/icons.tsx</code> maps
  40 names to hand-written paths on a 24-unit grid, drawn with <code>stroke="currentColor"</code>
  at 1.8 wide and marked <code>aria-hidden</code>, and
  <code>components/practice/TopIcon.tsx</code> does the same for the playground's 16.
  <code>currentColor</code> means an icon is always the colour of the button it sits in.
</p>

<h3>Hover, tooltips and motion</h3>
<p>
  A fixed hover colour that looks right on Paper disappears on Night.
  <code>--ide-hover</code> avoids that by being defined as
  <code>color-mix(in srgb, var(--ide-fg) 12%, transparent)</code>: 12% of the theme's own ink
  over whatever is underneath. It was 10% until a later commit raised it for light themes, and
  <code>--ide-hover-strong</code> is 15%. Because <code>--ide-fg</code> is
  <code>var(--ink)</code>, one definition works in all nine themes.
</p>
<p>
  Tooltips are pure CSS. An element with a <code>data-tip</code> attribute gets an
  <code>::after</code> whose content is <code>attr(data-tip)</code>, drawn in the sheet colour on
  ink, and it shows on <code>:hover</code> and on <code>:focus-visible</code>, so keyboard users see
  it too. It appears after a 0.35 s delay and hides at once. The attribute appears 37 times across
  the playground, the problems page, the whiteboard and the architecture index.
</p>
<p>
  Reduced motion is handled at two levels. A global
  <code>@media (prefers-reduced-motion: reduce)</code> rule sets <code>transition</code> and
  <code>animation</code> to <code>none !important</code> on every element and turns off smooth
  scrolling. Components that move things from JavaScript (the home page, the count-up numbers, the
  tilting cards and the confetti) check <code>prefersMotion()</code> in <code>lib/dom.ts</code>
  first.
</p>

<h3>The checks</h3>
<p>
  <code>e2e/a11y.spec.ts</code> runs axe through <code>@axe-core/playwright</code> against 18
  pages, including the home page, a chapter, the playground, the problems list, the mock lobby, the
  whiteboard and this architecture section. It checks the WCAG 2.0 and 2.1 A and AA tags and fails
  on any violation. One more test walks a system design round in the mock interview and runs axe
  on the brief, a question, a follow-up, the rubric and the debrief, because those screens only
  exist after clicking through. The one rule disabled is
  <code>scrollable-region-focusable</code>.
</p>
<p>
  Axe checks the colours a page actually renders, and it only sees the default theme.
  <code>tests/contrast.test.ts</code> covers the rest without a browser. It parses
  <code>globals.css</code>, finds every block that defines the editor's colours, and for each of
  the five syntax colours (keyword, string, number, operator, comment) computes the WCAG contrast
  ratio against the editor background and against the active line, which is
  <code>--line-soft</code> composited over it. Across nine themes that is 90 checks, and each must
  reach 4.5:1. A new theme that forgets a token, or picks a comment grey that is too faint, fails
  in Vitest before anyone sees it.
</p>

<div class="bx is-ref">
<span class="ttl">What the variables approach costs</span>
<p>
  Each theme restates 43 colours, and nothing but the contrast test and the reviewer's eye notices
  when one is off. A component that hard-codes a hex colour is wrong in eight themes. What it buys
  is that a theme switch costs one attribute write and nothing in React, and that a theme can be
  added in one CSS block and one list entry.
</p>
</div>`,
};
