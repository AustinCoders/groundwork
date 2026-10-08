import type { Chapter } from "../types";

export const archDesignSystem: Chapter = {
  id: "arch-design-system",
  num: "I13",
  title: "The design system",
  short: "Design system",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Nine themes and seven fonts as CSS variables, two page frames, and the checks that keep them readable.",
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
  The <code>:root</code> block in <code>globals.css</code> defines 63 custom properties: paper and
  sheet colours, ink, pencil, red and green, highlighter colours, sticky notes, code colours,
  diagram boxes, shadows, sizes, fonts, the editor's syntax colours, the categorical
  <code>--c-*</code> colours and the role colours. That block is the Paper theme, and it also
  matches <code>[data-theme="light"]</code>, so a Paper preview inside another theme shows Paper.
  Its 56 colour tokens are the properties whose value is a colour (the colours and the shadows).
  Each of the other eight is a <code>[data-theme="&hellip;"]</code> block that restates exactly
  those 56 and nothing else, and sets <code>color-scheme</code>, so native scrollbars and form
  controls match.
</p>
<p>
  Anything computed from those colours lives once, in a shared <code>:root, [data-theme]</code>
  block: the <code>-soft</code> tints, the editor's <code>--ide-*</code> aliases such as
  <code>--ide-fg: var(--ink)</code> and <code>--ide-hover</code>, and <code>--scrim</code>, the
  black that the modules' backdrops (the modal, the drawer, the sheets and the whiteboard) mix
  with <code>transparent</code>. <code>--scrim</code> is declared on <code>::backdrop</code> as
  well, because older browsers do not let a dialog's backdrop inherit from the page. The backdrops
  in the global rules still set their own tints. That selector matches every element that carries a theme, so a Kraft
  swatch inside a Night page computes Kraft's editor colours instead of inheriting Night's.
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
  Seven of those properties are roles, and every theme sets all seven, so the accent is blue on
  Paper, rust on Kraft and violet on Lavender. Role values are opaque hex, so the contrast test
  can check them. The shared <code>:root, [data-theme]</code> block derives a <code>-soft</code>
  tint of the accent and of each state by mixing 16% of it into the sheet, next to the
  <code>--c-*-soft</code> tints.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Role</th><th>Use</th><th>Replaces</th></tr></thead>
<tbody>
<tr><td><code>--primary</code></td><td>Buttons, links, the active tab or nav item, progress fills, focus rings and selected states</td><td>Green as an action colour, and the interview book's red <code>--primary</code></td></tr>
<tr><td><code>--on-primary</code></td><td>Text and icons on an accent fill</td><td>&mdash;</td></tr>
<tr><td><code>--primary-soft</code></td><td>Selected rows and chips</td><td><code>--hl-mint</code> as a selected background</td></tr>
<tr><td><code>--mark</code></td><td>The highlighter behind words, inline code and title underlines</td><td><code>--hl-yellow</code> as the highlighter</td></tr>
<tr><td><code>--success</code>, <code>--danger</code>, <code>--caution</code>, <code>--info</code></td><td>States only: passed and failed tests, done and due, tips. Never decoration.</td><td><code>--green</code> and <code>--red</code> as states</td></tr>
</tbody>
</table></div>
<p>
  Text on any <code>-soft</code> tint is <code>--ink</code>. <code>--red</code> and
  <code>--green</code> stay, as the categorical <code>--c-red</code> and <code>--c-green</code>
  for charts, topic chips and the whiteboard. A state uses <code>--success</code>,
  <code>--danger</code>, <code>--caution</code> or <code>--info</code> instead.
</p>
<p>
  The table is the intended use, and most of the site now reads the roles: the home page, review,
  progress, the interview book, the mock interview, the site menu, the modal and the shared page
  frame, the problems list, the whiteboard, the git guide, the architecture pages, the theme
  picker, the dropdowns, the code editor and the practice workspace, the topic covers and
  chapters, <code>/level</code> and <code>/path</code>. Their buttons, links, progress bars,
  active tabs and chapters, selections, focus rings, highlights and the notebook's margin line
  follow the theme, and their passed, failed, read, due and tip states use the state roles.
  Nothing sets its own <code>--primary</code>, and the green <code>--ide-accent</code> alias is
  gone.
</p>
<p>
  What stays fixed is mostly what a chapter says in colour, so that it means the same in every
  theme, such as the callouts (the sticky notes, the red gotcha box and the green and yellow
  boxes), the diagrams and step-through visualisers, the dry-run and truth tables, the level tags
  and the interview book's cards and pills. The visualisers' current-step highlight follows the
  theme's marker. Some uses outside the chapters stay categorical too, such as the problem
  hint, the progress page's achievements, the home page's interview-story reds,
  the book's test, say and trap boxes, the mock interviewers' avatars, the editor's window dots,
  the problem levels, the lanes of the architecture map, and the whiteboard's ruled margin and
  laser. <code>tests/theme-roles.test.ts</code> finds every CSS module under <code>app/</code> and
  <code>components/</code>, the global rules in <code>app/globals.css</code> and
  <code>app/theme-bridge.css</code>, and every <code>.ts</code> and <code>.tsx</code> file under
  <code>app/</code>, <code>components/</code> and <code>lib/</code>, and scans them for a listed
  set of fixed green, red, mint and highlighter tokens, their <code>-soft</code> tints and their
  <code>--ide-*</code> aliases. It fails when one is used outside its file's categorical list, when
  a module declares its own role token, and when a module's declaration values hold a colour
  literal: a hex, <code>rgb()</code>, <code>hsl()</code> or newer colour function, or a named colour
  such as <code>white</code>. A new module or component is covered the day it is added, with an
  empty categorical list. In <code>.ts</code> and <code>.tsx</code> files the only listed tokens
  allowed are the fills of the two diagram arrow markers. That scan looks for the listed tokens,
  not for hex values, so the app icons, the error page and the whiteboard's paper tints still
  carry colours of their own.
</p>
<p>
  <code>app/theme-bridge.css</code> maps these names onto the conventional ones Tailwind utilities
  expect (<code>--background</code>, <code>--border</code>, <code>--ring</code> and so on)
  inside an <code>@theme inline</code> block, so a Tailwind class and a hand-written rule resolve
  to the same colour in every theme. <code>--primary</code> needs no alias. The bridge points
  <code>--ring</code> and <code>--accent</code> at it and <code>--destructive</code> at
  <code>--danger</code>. Home, Progress and the site drawer set <code>--accent</code> locally to a
  topic's colour, which is why the accent role is not called <code>--accent</code>.
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
  are a <code>role="radiogroup"</code> of swatches, and fonts are a second radiogroup with an "Aa"
  sample set in each font. Each swatch carries its own <code>data-theme</code>, so it is a live
  preview of that theme's sheet, ink, <code>--primary</code> chip and categorical colours. The
  selected card's border and the focus outline use the current theme's <code>--primary</code>.
</p>

<h3>Page frames</h3>
<p>
  Almost every page renders in <code>components/frame/PageFrame.tsx</code>: a sticky header with a
  labelled back pill, a menu button that opens the site drawer, the brand and the page title. Home,
  review, progress, privacy, the 404 page and the error page render it directly.
  <code>components/topic/TopicFrame.tsx</code> fills it in for a topic, with the topic's mark beside
  a title that links to its cover. A page that sets <code>reading</code> also gets the drawer's text
  size, narrator and print controls. Every topic cover, every chapter, outline or written, the level
  pages that render rather than redirect, the reading path, Git and this architecture section all use
  <code>TopicFrame</code>. Opening the drawer locks body scroll, focuses its first control, closes on
  Escape, and holds focus with the shared <code>components/FocusTrap.tsx</code>, which wraps
  <code>@radix-ui/react-focus-scope</code>.
</p>
<p>
  The practice playground, the problems list and the whiteboard are full-screen tools, and a
  frame would cost them height they need. They have no persistent chrome. Practice and problems
  open <code>components/SiteDrawer.tsx</code> from a menu button. It is a portal with
  <code>role="dialog"</code> and <code>aria-modal</code>, seven links (home, playground, problems,
  whiteboard, mock interview, review, progress) with <code>aria-current</code> on the current one,
  and an <code>AppearancePicker</code>. It focuses its first control, holds Tab inside, closes on
  Escape, locks scroll, and returns focus to whatever opened it. The whiteboard renders through
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
  <code>globals.css</code> is about 7,900 lines. It holds the tokens, the prose styles every
  chapter uses, and the reading pages' layout. Everything that belongs to one page or tool is in
  one of 22 CSS modules, the largest being <code>app/mock/mock.module.css</code> at about 3,300
  lines. The rule of thumb is that anything
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
  seed 7) feeding a displacement map of scale 2.4, and it is defined once, in
  <code>components/chapter/DiagramDefs.tsx</code>, along with the <code>arrow</code>,
  <code>arrow-green</code> and <code>arrow-red</code> markers. The topic reader, the series reader
  and landing, and a page frame with its reading controls on all render that one component.
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
  <code>e2e/a11y.spec.ts</code> runs axe through <code>@axe-core/playwright</code> against 31
  pages, including the home page, the outline cover of a topic that is only being planned, six chapters, the other three written topics' covers, the
  playground, the problems list, the mock lobby, the whiteboard, the 404 page and this
  architecture section. One of them, <code>/level/typescript</code>, is the level picker of a
  topic that is only outlined, and another, <code>/typescript/ts-setup-compiler</code>, is that
  same topic's own outline chapter; <code>/level/typescript</code> stands in for <code>/soon</code>,
  which redirects there while every topic is marked ready. It also runs against 16 states that a
  plain page load does not show: 12 that open with a click, and 4 seeded in
  <code>localStorage</code>. The clicks open the site menu, the reading menu on <code>/notes</code>
  with its Text size and Narrator folds open, a reading budget picked on the JavaScript cover's Up
  next card, the Topics fold with a category expanded, the home page's topic section on Languages,
  its interview book on a later round and its how-it-works stepper on step 3, the Chapters and Filters sheets, and a system design round in
  the mock interview, checked at the brief, a question, a follow-up, the rubric and the debrief.
  The seeds give a chapter due for review, a
  chapter marked read on a path, a year of activity on the progress page, and two saved mock
  sessions. Each page and state is
  checked in all 9 themes, at 1440 and 390 pixels wide, except the two sheets, which
  only open on a narrow screen and are checked at 390. One helper sets the theme the way the theme
  picker does, runs axe with the WCAG 2.0 and 2.1 A and AA tags, and fails on any violation, naming
  the page, the state, the theme and the width. No rule is disabled. A table, a code block, a query
  result or the progress heatmap that is wider than its box takes focus and gets a name while it
  scrolls, and drops both when its box grows wide enough to show it whole.
</p>
<p>
  Axe cannot settle the contrast of most text on the reading pages. The ruled paper behind it is a
  gradient or a pseudo-element, so axe reports that text as incomplete rather than as a pass or a
  failure. The token pairs and the tinted-box pairs in <code>tests/contrast.test.ts</code> guard
  those colours instead.
</p>
<p>
  Axe only sees the pages and states the spec opens. <code>tests/contrast.test.ts</code> checks the
  tokens themselves, without a browser. It parses <code>globals.css</code>, finds every block that
  defines the editor's colours, and for each of the five syntax colours (keyword, string, number,
  operator, comment) computes the WCAG contrast ratio against the editor background and against the
  active line, which is <code>--line-soft</code> composited over it. Across nine themes that is 90
  checks, and each must reach 4.5:1. A new theme that forgets a token, or picks a comment grey that
  is too faint, fails in Vitest before anyone sees it.
</p>
<p>
  The same file checks the text and role colours in every theme. The ink, the soft ink and the
  pencil grey, then <code>--primary</code> and the four states, are each checked against the paper,
  the sheet and the editor's background <code>--sheet-2</code>. <code>--on-primary</code> is checked
  against <code>--primary</code> and the ink against <code>--mark</code>. That is 234 more checks at
  4.5:1, and a theme block that leaves out a role fails with the theme's selector and the token's
  name. The six categorical colours get 54 checks at 3:1 against the sheet.
</p>
<p>
  Some text sits on a tint that is mixed over the page, so the test mixes it the same way. A
  warning's red is checked on <code>--warn-bg</code> over the paper and over the sheet, and
  <code>--warn-bg</code> must be a tint of that theme's own red. The interview book's green is
  checked on <code>--dg-box-green</code>, and the ink, the soft ink and the pencil grey on the
  inline-code tint over all three surfaces. That is 108 more checks at 4.5:1.
</p>

<div class="bx is-ref">
<span class="ttl">What a new theme costs</span>
<p>
  Adding a theme takes one <code>[data-theme="&hellip;"]</code> block in <code>globals.css</code>
  that restates the 56 colour tokens, the seven roles included, and one entry in
  <code>THEME_ITEMS</code> in <code>lib/storage.ts</code>. The <code>ThemeValue</code> type, both
  pickers and the e2e accent tests all come from that list. A dark theme may also join the
  <code>[data-theme="dark"]</code> override selectors that swap the heading underline and the
  code background inside sticky notes and gotcha boxes. Nothing else in the code is edited. This
  chapter is the one hand-kept description: its theme table, its heading, and the check counts
  that multiply by the number of themes are updated by hand.
</p>
<p>
  Missing a step fails a test that names it. <code>tests/theme-contract.test.ts</code> names the
  block and the token when a theme leaves out or adds a colour token or sets no
  <code>color-scheme</code>. It names the list entry that has no block, the block that has no
  entry, a value listed twice and a label that is not an icon and a name. It fails when Paper
  derives a colour that belongs in the shared block, or when a rule reads <code>--scrim</code> or
  an <code>--ide-*</code> alias that nothing declares. <code>tests/contrast.test.ts</code> fails a text, role, syntax or categorical colour
  below its ratio. The e2e accent tests iterate <code>THEME_ITEMS</code> and read each theme's
  expected colours from <code>globals.css</code>, and the accessibility spec runs axe in every theme
  that list names, so they check the new theme without a change.
  What the approach still costs is 56 restated values per theme, chosen by hand. What it buys is
  that a theme switch is one attribute write and nothing in React.
</p>
</div>`,
};
