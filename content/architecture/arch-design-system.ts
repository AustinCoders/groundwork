import type { Chapter } from "../types";

export const archDesignSystem: Chapter = {
  id: "arch-design-system",
  num: "I13",
  title: "The design system",
  short: "Design system",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "Nine themes and eight fonts as CSS variables, two page frames, and the checks that keep them readable.",
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
  The <code>:root</code> block in <code>globals.css</code> defines 78 custom properties: paper and
  sheet colours, ink, pencil, red and green, highlighter colours, sticky notes, code colours,
  diagram boxes, shadows, sizes, fonts, the editor's syntax colours, the categorical
  <code>--c-*</code> colours, the role colours and the interview book's <code>--book-*</code> materials (cream paper
  and dark ink, a cloth cover, a ribbon, a shadow, all kept in every theme and tinted by it). That block is the Paper theme, and it also
  matches <code>[data-theme="light"]</code>, so a Paper preview inside another theme shows Paper.
  Its 71 colour tokens are the properties whose value is a colour (the colours and the shadows).
  Each of the other eight is a <code>[data-theme="&hellip;"]</code> block that restates exactly
  those 71 and nothing else, and sets <code>color-scheme</code>, so the native scrollbars inside panels and the form
  controls match. The page's own scrollbar is hidden on <code>html</code>, and the reading-progress
  bar in the header is the only cue to where you are on the page.
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
  the book's test, say and trap boxes, the editor's window dots,
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

<h3>Eight fonts</h3>
<p>
  <code>lib/fonts.ts</code> loads 15 families through <code>next/font/google</code>, which serves
  them from the site's own origin and exposes each as a variable such as
  <code>--font-caveat</code>. Only the default pair, Caveat and Kalam, is preloaded, with
  <code>display: "optional"</code>, so a slow font never causes a layout shift. The other thirteen
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
<tr><td><code>chalk</code></td><td>Chalk</td><td>Permanent Marker</td><td>Indie Flower</td></tr>
<tr><td><code>script</code></td><td>Script</td><td>Dancing Script</td><td>Handlee</td></tr>
<tr><td><code>serif</code></td><td>Reading</td><td>Literata</td><td>Literata</td></tr>
<tr><td><code>roboto</code></td><td>Roboto</td><td>Roboto</td><td>Roboto</td></tr>
</tbody>
</table></div>
<p>
  Six of the eight are handwriting. Reading and Roboto exist for people who find handwriting hard
  to read for long, and they are the reason the picker's heading says "Handwriting" but its options
  do not all fit the name. JetBrains Mono stays the <code>--font-mono</code> for code blocks in
  every font.
</p>

<h3>The first paint</h3>
<p>
  The server cannot know a reader's theme, so the root layout renders
  <code>&lt;html data-theme="light" suppressHydrationWarning&gt;</code>. A
  plain inline <code>&lt;script&gt;</code> in the <code>&lt;head&gt;</code> runs the string in
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
  labelled back pill, a labelled Menu pill (<code>components/MenuButton.tsx</code>) that opens the site drawer, the brand and the page title. Home,
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
  The playground and the problem pages are tools, so they keep the full height of the window, but they
  wear the same header: <code>components/frame/FrameHeader.tsx</code> is the header that
  <code>PageFrame</code> renders, taken out so the tools can use it with a back pill that shrinks to an
  icon, no brand name and a row that wraps on narrow screens. The problems list is a page in
  <code>PageFrame</code> like the interview question bank. The whiteboard is the one tool with its own
  chrome and board menu. Every other page opens <code>components/SiteDrawer.tsx</code> from the same Menu pill. It is a portal with
  <code>role="dialog"</code> and <code>aria-modal</code>, laid out as four numbered sections in the
  home page's vocabulary: a Continue card from the one saved place in <code>groundwork:resume</code>
  with the level and streak as one quiet line, six Go to rows with <code>aria-current</code> on the
  current one, the topics and the two guides as a single-open accordion, and a closed Appearance fold
  holding the theme swatches and handwriting tiles (and, on reading pages, text size, narrator and
  shortcuts), plus a disabled Sign in placeholder and, in its foot, a Take the tour row. That row opens the first-visit tour: a lazy-loaded
  prompt and five-slide dialog built from the same stage kit, shown once on the home page and topic pages after the page has loaded, never on a chapter. The chapter sidebar is built from the same kit,
  <code>components/ui/MenuKit.tsx</code>, so both surfaces share the numbered kicker, search pill,
  dashed rows and highlighter. The seven type sizes are tokens on <code>:root</code>, with two more, a hero and a lead size, for the topic pages. Ctrl or Cmd plus K opens it
  with search focused from any page, except while typing in a field or the editor. It focuses its
  first control, holds Tab inside, closes on Escape, locks scroll, and returns focus to whatever opened it. The whiteboard renders through
  <code>BareShell</code> with <code>header={false}</code> and has its own board menu drawer, which
  embeds the same <code>AppearancePicker</code>.
</p>

<h3>Topic pages</h3>
<p>
  The level picker, the reading path, the topic cover and the outline pages of unwritten topics are
  one family, built from <code>components/topic/TopicKit.tsx</code>: a numbered kicker, a hero with a
  display heading and one taped card, a dashed trail of numbered steps, flat dashed rows, single-open
  folds for the syllabus and a notes card. The page's accent comes from the topic's data, so a new
  topic needs no CSS. None of these pages uses the scroll reveal, because a reveal leaves blocks
  part-transparent mid-scroll and in a stitched screenshot.
</p>
<p>
  The interview book (the landing, the question bank and every round) and this architecture section's
  index are the same family. A round is a chapter in the chapter kit, with a rounds rail, the questions
  as numbered sections and the answer inside the shared prose layer; the landing and the index reuse
  the topic kit's trails, stations and rows. Anything that depends on saved progress is hidden until the
  page has hydrated, so the label of a button never changes under the reader.
</p>

<h3>The topic shell</h3>
<p>
  A topic's home is drawn by one generic shell, <code>components/topic/shell/</code>, and nothing in it
  names a topic. <code>TopicShell</code> takes plain props: the topic's name, a hero, the chapters grouped
  by level into stages, a list of tool links, an optional details panel and an optional notes fold. The
  hero has three shapes and every one carries exactly one primary action. An invitation leads with a
  friendly title, a line about what the quiz is, the honest size of the check, one big button and two quiet
  text links, beside a small three-stop preview of the stages where nothing is locked. A standing, for a
  reader who has progress, shows a level card (the level name in its stage colour and a progress ring
  that fills once on arrival) beside an up-next card that holds the one Continue button; a reader with
  only ticks gets a gentle prompt to check their level instead of a level badge. A plain hero, a title,
  a status line and an action, is what a topic with no placement passes.
</p>
<p>
  <code>JourneyMap</code> replaces the plain list. Each stage is a card on a dashed, wavy trail
  (<code>TrailLeg</code>, the same dashed look as the path page, drawn in pure SVG and hidden from a screen
  reader) and a numbered node that is filled once the stage is read. A stage card is a native
  <code>details</code>, so it opens by keyboard, announces itself and needs no animation; its summary carries
  the stage name, a status chip (your level, up next, in progress, not started or all read), the one-line
  promise, a progress bar with its words (<code>4 / 10 read</code>) and, while closed, a peek at the next
  stop. Each stage takes one of the theme's colour tokens by position, so its tint is readable in every
  theme. <code>ChapterRow</code> and <code>StateMark</code> draw a row with one state mark, the state in
  words where it matters (read, checked, not checked, tested out, soon) and a hidden label otherwise, and
  the minutes and exercises in aligned columns that wrap under the title on a phone; the up-next row is
  tinted. <code>ToolsRow</code> draws four friendly tiles and <code>DetailsPanel</code> the closed panel.
  A link such as <code>#pick-level</code>, <code>#beginner</code> or <code>#notes</code> opens the fold it
  names.
</p>
<p>
  The page stays on the theme tokens: flat cards, no tape and no tilt, the heading font for names and the
  reading font for rows, and the only motion (a card lifting on hover, the ring and the bars filling) is
  switched off for a reader who asks for reduced motion. Everything is hidden until the page has hydrated,
  as the old hero was, so a returning reader never sees the first-time hero flash.
  A topic adopts the shell with a thin adapter. <code>components/topic/shell/model.ts</code> holds the
  pure part, <code>buildGroups</code>, which turns cards and the optional done set, check states and plan
  into groups with their tone, status and peek, so a topic with no placement and no checks (JavaScript,
  say) passes its cards and levels and leaves the rest out. <code>TopicHome</code> is the first adapter and
  does the same for DSA with its plan, its three doors and its level picker; the server hands it the size
  of the placement bank, so the invitation can say how long the check is. If that bank is empty the hero
  falls back to the three equal doors. The shell replaced the chapters band, the full syllabus band,
  the practice band, the up-next card, the plan card with its own Continue and the Start button in the
  header, so the page shows each chapter once and has one way forward.
</p>

<h3>The workbench pages</h3>
<p>
  The playground and the problem pages share one shell, <code>components/practice/workbench.module.css</code>,
  and the same <code>PracticeWorkspace</code>. The page is a paper background with a header and a grid
  whose padding is one token-sized gap, so the room under the header, at the sides and at the bottom is
  the same at every width. The playground fills the window at all sizes; a problem page fills it from
  1001 pixels up and stacks below it, description first. The description panel is a card with a mono
  breadcrumb, the title in the heading font with the hand underline, chips for level and tests, and
  hints that arrive as taped sticky notes. The console's empty states speak in the home voice, and a
  passing submit stamps the page: a rotated rubber stamp, the words, and a pill to the next problem.
  The editor window, the output tabs, the status bar, the palette and the dialogs keep their global
  classes and are restyled in place on the same type scale, so nothing under 12 pixels appears in the
  chrome. Their colours stay on the <code>--ide-*</code> tokens, which are themselves aliases of the
  theme's sheet, line and ink.
</p>

<h3>The mock interview pages</h3>
<p>
  The lobby and the debrief are scene pages built from the same kits as the topic pages: a one-screen hero
  with a composed stage, then numbered bands. The lobby's stage shows a sample exchange and one card that
  depends on saved state (the round left half-way, the last result, or a first-time note), which stays hidden
  until the page hydrates. The room is a tool, like the playground: from 1001 pixels up the page does not
  scroll, the header carries the round rail, the clock and End, and two panes (the interviewer and the answer, or the
  model answer and the rubric) scroll inside themselves. The coding round reuses the exercise layout. The
  whiteboard keeps its own styles in <code>app/mock/mock.module.css</code>, which holds nothing else.
</p>

<h3>The review page</h3>
<p>
  <code>/review</code> is one scene page on the same kits. The hero puts the count of chapters due today in the
  heading, with a taped card for the chapter due first (or the one that comes back next), a numbers card and a
  sticky of the review gaps drawn from <code>REVIEW_GAPS_DAYS</code>. Everything that depends on saved progress is
  hidden until the page hydrates. The bands that follow exist only when there is something to show: the due
  list with I remember and Again, the schedule grouped by day beside a two-week forecast, the latest reviews, and
  an honest start for a reader who has read nothing. Clearing the list gives a stamp that turns in with
  transform alone, so nothing is ever part-transparent. The scheduling maths stays in <code>lib/storage.ts</code>.
</p>

<h3>The progress page</h3>
<p>
  <code>/progress</code> is the same kind of scene page. The hero puts the level and the XP still to go in the
  heading, with a taped level card and meter, a numbers card, and a sticky for the nearest badge that is not
  earned yet. A level up shows as a stamp on the level card and is announced once. The bands that follow are what to
  do next (the review, the topic furthest along, the weak interview answers), the year of activity as a heatmap
  that scrolls inside its own card, one row with a meter for each topic, the interview book with the marks you gave,
  and the badge wall, where earned badges are stuck on and the rest show how far away they are. Every number comes
  from <code>computeStats</code>, <code>earnedBadges</code> and <code>recentActivity</code> in
  <code>lib/gamification.ts</code>, which this page only reads, and everything that depends on saved progress is
  hidden until the page hydrates.
</p>

<h3>The Git landing, privacy and the pages that fail</h3>
<p>
  <code>/git</code> is a topic cover. The hero asks what Git is really doing, with the commit graph on a taped
  card, a numbers card from <code>gitFacts()</code> and a note that points at the first chapter, composed in the
  kit's <code>banner</code> layout. Below it come three ways in, the four parts as winding trails with a tick on every
  chapter you have read, and three honest notes. <code>/privacy</code> keeps its words and puts each section in a
  numbered band with the prose layer inside a paper panel, under a hero whose first card is the contents. The 404 page and
  <code>app/error.tsx</code> share <code>components/frame/LostScene.tsx</code>: a taped stamp card, a card of
  places to go and a note, with a retry pill on the error page and its reference code in a small mono line.
  <code>app/global-error.tsx</code> replaces the whole layout, so it carries its own
  stylesheet in <code>components/frame/globalErrorCss.ts</code>, with light and dark palettes whose contrast
  <code>tests/global-error.test.ts</code> measures.
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
  <code>globals.css</code> is about 7,400 lines. It holds the tokens, the prose styles every
  chapter uses, and the reading pages' layout. Everything that belongs to one page or tool is in
  one of 81 CSS modules, the largest being <code>app/company-questions/hub.module.css</code> at about 1,700
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
  it too. It appears after a 0.35 s delay and hides at once. The attribute appears 31 times across
  the playground, the whiteboard and the architecture index, and the playground's tooltips are off
  under 721 pixels and on touch screens, where a tooltip that cannot be hovered only widens the page.
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
  No browser check of accessibility runs any more. An axe spec (<code>@axe-core/playwright</code>, the WCAG 2.0 and 2.1 A and AA tags, every page and state in all nine themes) used to run in CI and was cut with the rest of the browser suite. A table, a code block, a query
  result or the progress heatmap that is wider than its box still takes focus and gets a name while it
  scrolls, and drops both when its box grows wide enough to show it whole, but nothing checks that on a page now.
</p>
<p>
  What guards colour is <code>tests/contrast.test.ts</code>, which works from the tokens without a browser. The ruled paper behind the reading pages is a
  gradient or a pseudo-element, so no tool could settle the contrast of that text from the rendered page anyway; the token pairs and the tinted-box pairs are
  checked instead.
</p>
<p>
  <code>tests/contrast.test.ts</code> checks the
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
  that restates the 71 colour tokens, the seven roles included, and one entry in
  <code>THEME_ITEMS</code> in <code>lib/storage.ts</code>. The <code>ThemeValue</code> type and both pickers come from that list. A dark theme may also join the
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
  below its ratio.
  What the approach still costs is 56 restated values per theme, chosen by hand. What it buys is
  that a theme switch is one attribute write and nothing in React.
</p>
</div>`,
};
