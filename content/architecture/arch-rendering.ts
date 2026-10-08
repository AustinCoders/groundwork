import type { Chapter } from "../types";

export const archRendering: Chapter = {
  id: "arch-rendering",
  num: "I3",
  title: "Server, client, and the line between them",
  short: "Server vs client",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Every page is rendered on the server once, at build time. The work is in deciding what crosses into the browser and making sure the first client render matches what the server wrote.",
  body: `<h3>The rule</h3>
<p>
  A component is a server component unless it needs something only a browser has: state, an effect,
  an event handler, <code>localStorage</code>, or a measurement. Adding <code>"use client"</code> has
  a cost, because everything the file imports is bundled and shipped. Across <code>app/</code>,
  <code>components/</code> and <code>lib/</code>, 81 files carry the directive. About a third belong
  to the three big interactive surfaces: the playground, the whiteboard and the mock interview.
</p>

<h3>What a chapter page is made of</h3>
<p>
  <code>TopicChapterPage</code> branches on <code>chapter.ready</code>. An outline chapter, one that
  has not been written yet, renders <code>TopicFrame</code> with
  <code>TopicOutlineChapter</code> (<code>components/topic/TopicOutlineChapter.tsx</code>), a client
  component built from the same shared rail, header pager and bottom pager as the written path below,
  minus the search box, <code>TocCard</code> and the Listen button, since there is no body to search,
  link into or narrate. Its article is a roadmap card built from the chapter's syllabus section, and
  its aside carries a "Meanwhile" link to a related written topic and its interview round, from
  <code>lib/topicRelated.ts</code>.
</p>
<p>
  A written chapter — every chapter in JavaScript, React, DSA and System Design, 156 of them — takes
  the path below instead, built from the same shared parts (<code>ChapterRail</code>,
  <code>TocCard</code>, <code>ChapterEnd</code>, <code>ChapterPager</code>, <code>ChaptersSheet</code>)
  as this very page.
</p>

<figure>
<svg viewBox="0 0 900 430" class="dg" role="img" aria-label="Nested boxes. The root layout is a server component. Inside it, the theme-init script and two client context providers. Inside RouteFade, a client component, sits TopicChapterPage, a server component, which renders TopicFrame, a client component wrapping PageFrame, for a written chapter. TopicFrame's children are TopicReader, a client component holding the chapter HTML and the rail, TOC and end-card islands. After mount, TopicReader's effects enhance the chapter's HTML.">
<g class="rough">
<rect x="10" y="10" width="880" height="410" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="30" y="44" width="250" height="52" rx="9" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.8" />
<rect x="300" y="44" width="570" height="52" rx="9" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.8" />
<rect x="30" y="112" width="840" height="292" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="50" y="150" width="800" height="238" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="70" y="188" width="760" height="186" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="90" y="226" width="500" height="132" rx="9" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="110" y="292" width="200" height="50" rx="8" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.6" />
<rect x="330" y="292" width="240" height="50" rx="8" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 1.6" />
<rect x="614" y="226" width="200" height="132" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<path class="ln" d="M612 292 H598" marker-end="url(#arrow)" />
</g>
<text class="sm gr" x="26" y="32">app/layout.tsx &middot; SERVER</text>
<text class="lbl" x="44" y="68">theme-init script</text>
<text class="sm" x="44" y="87">runs before first paint</text>
<text class="lbl" x="314" y="68">TopicsNavProvider</text>
<text class="sm" x="314" y="87">server-computed data handed to client context</text>
<text class="sm" x="44" y="134">RouteFade &middot; CLIENT</text>
<text class="sm gr" x="64" y="172">TopicChapterPage &middot; SERVER</text>
<text class="lbl" x="84" y="210">TopicFrame &middot; client: wraps PageFrame</text>
<text class="lbl" x="104" y="250">TopicReader &middot; client: rail search, keys, active section</text>
<text class="sm" x="104" y="272">chapter HTML handed down as a prop</text>
<text class="lbl" x="210" y="322" text-anchor="middle">ChapterRail / TocCard</text>
<text class="lbl" x="450" y="322" text-anchor="middle">ChapterEnd / ChapterPager</text>
<text class="lbl" x="714" y="252" text-anchor="middle">After mount</text>
<text class="sm" x="714" y="276" text-anchor="middle">enhance code, tables</text>
<text class="sm" x="714" y="296" text-anchor="middle">run demo scripts</text>
<text class="sm" x="714" y="316" text-anchor="middle">wire the narrator</text>
</svg>
<figcaption>
  Green is rendered on the server, and yellow is a client component. A server component can sit
  inside a client one when it is passed in as <code>children</code> or a prop, which is how the
  chapter body ends up as HTML while the reader around it is interactive.
</figcaption>
</figure>

<p>
  <code>TopicChapterPage</code> in <code>components/reader/topicPages.tsx</code> is a server
  component. For a written chapter it computes the chapter's HTML with <code>withHeadingIds</code>,
  its diagram and exercise counts, and a flat list of the topic's chapters and levels, then hands all
  of it as props to <code>TopicReader</code> (<code>components/topic/TopicReader.tsx</code>) — a
  client component, the same role <code>TopicOutlineChapter</code> plays for an outline chapter, but
  interactive from the start because it owns the rail's search box, the active-section ring and the
  keyboard shortcuts. It renders <code>TopicFrame</code>, which wraps the client
  <code>PageFrame</code>, for its header, puts <code>ChapterHeaderPager</code> in its
  <code>actions</code> slot, and assembles <code>ChapterRail</code>, <code>TocCard</code>,
  <code>ChapterEnd</code> and <code>ChapterPager</code> around the chapter body — the same shared
  parts the architecture and Git readers use; a later story moves the architecture reader's own
  inlined header pager onto this one too. The chapter body itself still reaches the browser as HTML,
  written in by the server component above and handed down as a prop, not fetched or re-rendered by
  the client.
</p>
<p>
  Topic covers branch the same way <code>TopicChapterPage</code> does, in
  <code>TopicCoverPage</code>, but on <code>topicStats(topicId).written &gt; 0</code> rather than a
  single chapter's <code>ready</code> flag. The four topics with something written — JavaScript,
  React, DSA and System Design — get <code>TopicCover</code> (<code>components/topic/TopicCover.tsx</code>),
  a server-computed list of cards and parts handed to a client component that renders
  <code>TopicFrame</code> and reads its own done/next/budget state through
  <code>useReadingPlan</code>. Every other topic's cover is a roadmap: <code>TopicCoverPage</code>
  renders <code>TopicOutline</code> (<code>components/topic/TopicOutline.tsx</code>) in the same
  <code>TopicFrame</code>, listing the planned levels and sections.
</p>
<p>
  The chapter body is written into the page with <code>dangerouslySetInnerHTML</code> and carries
  <code>suppressHydrationWarning</code>. The attribute is there because, after mount,
  <code>TopicReader</code> changes that DOM
  directly. <code>enhanceCodeBlocks</code>, <code>enhanceTables</code>, <code>enhanceTryBlocks</code>,
  <code>activateScripts</code> and <code>setupNarration</code> in
  <code>components/reader/enhancements.ts</code> and <code>narration.ts</code> add copy buttons,
  wrap tables, run each chapter's demo scripts and attach the narrator; <code>TopicReader</code> adds
  one more, <code>markNoSmooth</code>, which tags every <code>.try</code>, <code>.demo</code>,
  <code>canvas</code>, range input and draggable element with <code>data-no-smooth</code> so
  dragging one does not fight the page's smooth-scroll underneath it. React never re-renders that
  HTML, so those changes are safe.
</p>
<p>
  A chapter can also mark a place for something interactive with a block-level
  <code>&lt;div data-play="binary-search"&gt;&lt;/div&gt;</code>. For such a chapter,
  <code>splitIslands</code> in <code>lib/chapterIslands.ts</code> cuts the body at each placeholder
  into HTML segments and islands, and <code>TopicChapterPage</code> hands <code>TopicReader</code>
  those segments instead of one string. The reader still renders the same <code>#chapters</code>
  container, with the HTML segments written in as before and, in each island's place, the element
  that <code>TopicChapterPage</code> rendered on the server and passed down in <code>islands</code>.
  The island carries <code>data-island</code>, and the enhancers, narration and scroll regions skip
  anything inside it. A chapter without a placeholder takes the single-string path unchanged.
</p>
<p>
  The island is <code>PlayIsland</code>, an async server component. It asks the registry in
  <code>lib/play/registry.ts</code>, which holds one dynamic <code>import()</code> per play id, for
  that id's tracer, a pure function in <code>lib/play/</code> that records a whole run as a list of
  frames. It runs the tracer once on the default input and hands the frames, the code lines and a
  title to <code>Player</code>, the one client component in <code>components/play/</code>, as props.
  The tracer is imported only on the server, so none of its code reaches the browser, and the first
  frame is in the HTML before any JavaScript runs. The player only indexes into the frames, so back,
  scrub and reset cost nothing. An id the registry does not know renders the island with a plain
  sentence instead of a player.
</p>
<p>
  A chapter can also wrap a code block in a <code>div</code> whose <code>data-code</code> attribute names the block, with the JavaScript inside the <code>pre</code>, which is what the server renders and what shows by default. When the body contains one, <code>TopicChapterPage</code> passes <code>codeBlocks</code> and <code>TopicReader</code> shows a four-way language switch (<code>CodeLanguageSwitch</code>) in the chapter header. Choosing Python, Java or C++ dynamically imports that one language's file from <code>content/dsa/code/&lt;chapter-id&gt;/</code>, a map from block id to the HTML for the <code>&lt;code&gt;</code> element, and <code>applyCodeLanguage</code> rewrites only the marked blocks, so the page, the players and the checks are left alone. The choice is the <code>groundwork:dsa:lang</code> key. Every marked block must have a translation in all three languages, and each parses with the editor's grammars, which <code>tests/dsa-code-languages.test.ts</code> checks.
</p>
<p>
  The questions behind a chapter check are data, kept apart from the chapter. <code>content/quiz-types.ts</code> holds only types: a <code>Question</code> that is a <code>single</code>, <code>multi</code>, <code>order</code> or <code>predict</code>, each tagged with its chapter, level, skill, pattern and the heading that teaches it, and a <code>PatternRecord</code> with a chapter's signals, template, time, space and interview styles. <code>lib/quiz.ts</code> holds the fixed vocabularies of patterns, skills and interview styles and the pure helpers that report problems in a pool, so a client component may import it. Each chapter's questions sit in their own file under <code>content/dsa/quiz/</code>, and <code>lib/quizPool.ts</code> keeps, like the play registry, one dynamic <code>import()</code> per chapter id behind <code>loadPool</code>, which gives <code>null</code> for an id it does not know. Nothing else imports the pool files, so a chapter page can load its own questions without carrying any other chapter's. <code>tests/dsa-quiz.test.ts</code> runs the helpers over every pool the registry lists, and each helper has a bad fixture that proves it fails.
</p>
<p>
  A topic whose <code>completion</code> is <code>"quiz"</code> gets a second server-rendered island,
  <code>CheckIsland</code>, with <code>id="check"</code>, between the practice strip and the end card of
  each written chapter. In that topic, while a chapter is unread, the end card's and the contents
  card's Mark as read are links to it, and so are the ticks on the cover cards and the path steps,
  which point at the chapter's page. A chapter that is already read keeps its toggle button. The <a href="/architecture/arch-state">state chapter</a> explains the policy behind that.
</p>
<p>
  The root layout works the same way. It computes the topic list, with each topic's written count, and the guides'
  chapter lists on the server, then hands them to a small client provider in
  <code>lib/topicNav.tsx</code>. The site drawer reads them from context and never imports the topic
  data module itself.
</p>

<h3>next/dynamic, and where it is not used</h3>
<div class="table-scroll"><table>
<thead><tr><th>Import</th><th>Where</th><th>Why</th></tr></thead>
<tbody>
<tr><td><code>Board</code>, with <code>ssr: false</code></td><td><code>app/whiteboard/WhiteboardShell.tsx</code></td><td>Its <code>useState</code> initialisers read <code>localStorage</code>, and on a first visit even write a board. None of that can run on a server, so the server renders only the "Setting up the board" line. The board's chunk is 86 KB, or 28 KB gzipped, and is not part of the first load.</td></tr>
<tr><td><code>Room</code> and <code>Scorecard</code></td><td><code>app/mock/MockApp.tsx</code></td><td>Only needed once a loop starts. <code>app/mock/preload.ts</code> exports the same <code>import()</code>, so the lobby warms it with <code>requestIdleCallback</code> when the pointer enters, or focus reaches, a start button.</td></tr>
<tr><td><code>PracticeWorkspace</code></td><td><code>app/mock/Room.tsx</code></td><td>Coding rounds need the editor, but talking rounds do not.</td></tr>
<tr><td><code>FocusScope</code></td><td><code>ShortcutHelp</code></td><td>Only needed once the shortcut help opens.</td></tr>
</tbody>
</table></div>
<p>
  The playground editor is <em>not</em> loaded this way, even though that would be the obvious
  place for it. <code>PracticeWorkspace</code> imports <code>CodeEditor</code> statically and renders
  it only when <code>useMounted()</code> is true. The prerendered HTML contains
  <code>EditorSkeleton</code> instead. That is why <code>/practice</code> and every problem page
  load 1,182 KB of first-load JavaScript, against 681 KB for a chapter page. What is split off is
  finer-grained: the 18 language modes in <code>lib/codeLanguages.ts</code>, Vim mode, the minimap,
  the TypeScript compiler and sql.js are all behind <code>import()</code> and load when first
  needed.
</p>

<h3>Making the first client render match the server</h3>
<p>
  A prerendered page was built by a server that has never seen your browser. If the first client
  render reads <code>localStorage</code> and draws something different, React throws a hydration
  error. It has happened here at least twice. The mock lobby read its saved loop settings in a
  <code>useState</code> initialiser, which caused React error #418 for anyone who had used it
  before. The playground read its saved Live toggle and stdin during render. Both now go through the
  hooks in <code>lib/hooks.ts</code>, which are all built on <code>useSyncExternalStore</code>.
  During hydration it uses the server snapshot, and it switches to the client snapshot straight
  after.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Hook</th><th>Server and hydration</th><th>After</th><th>Used for</th></tr></thead>
<tbody>
<tr><td><code>useMounted()</code></td><td><code>false</code></td><td><code>true</code></td><td>Gating whole subtrees and effects, such as the editor and the reader's DOM enhancements</td></tr>
<tr><td><code>useClientValue(get, fallback)</code></td><td><code>fallback</code></td><td><code>get()</code>, read once</td><td>Zoom, reading budget, editor height, whether the browser has <code>IntersectionObserver</code></td></tr>
<tr><td><code>useProgressValue(get, fallback)</code></td><td><code>fallback</code></td><td><code>get()</code>, re-read on every progress write</td><td>Done counts, due reviews, streaks, solved ticks</td></tr>
<tr><td><code>useLastLevel()</code>, <code>useOSColorScheme()</code></td><td><code>null</code>, <code>"light"</code></td><td>Saved level; live media query</td><td>Topic links, the theme picker</td></tr>
</tbody>
</table></div>
<p>
  <code>useSyncExternalStore</code> compares snapshots with <code>Object.is</code>, so a getter that
  builds a new object on every call would re-render forever. The code gets around this in two ways.
  Some getters return a primitive. <code>ProgressView</code> subscribes to
  <code>JSON.stringify(computeStats())</code> and parses it in a <code>useMemo</code>, and
  <code>useReadingPlan</code> subscribes to a string of ones and zeros. The others cache the parsed value
  against the raw string: <code>runsSnapshot()</code> in <code>lib/runHistory.ts</code>,
  <code>savedConfig()</code> in the lobby, and <code>mockSnapshot()</code>, which is dropped on every
  write.
</p>
<p>
  Settings the reader can change use a second pattern. <code>useReadingPlan</code> reads the saved
  reading budget with <code>useClientValue</code>, keeps an override in <code>useState</code> that starts as
  <code>null</code>, and uses the override once the reader clicks. There is no effect that copies
  storage into state.
</p>

<h3>The lint rules that enforce it</h3>
<p>
  <code>eslint.config.mjs</code> uses <code>eslint-config-next</code> 16.3.0, which turns on
  <code>eslint-plugin-react-hooks</code> 7.1.1's recommended set: 16 rules. Two are the familiar
  ones, <code>rules-of-hooks</code> and <code>exhaustive-deps</code>. The other 14 come from the
  React Compiler's analysis. They include <code>set-state-in-effect</code>,
  <code>set-state-in-render</code>, <code>refs</code>, <code>purity</code>,
  <code>immutability</code>, <code>globals</code> and <code>static-components</code>, and all but
  two are errors. The compiler itself is not enabled: there is no <code>reactCompiler</code> option
  in <code>next.config.ts</code> and no compiler plugin installed. The code is held to the
  compiler's rules without being compiled by it.
</p>
<p>
  These rules shaped the patterns above. <code>set-state-in-effect</code> is why
  <code>useMounted</code> is not the usual "set a flag in <code>useEffect</code>" hook. The rule
  also explains a workaround: the level-up celebration on <code>/progress</code> calls
  <code>setState</code> inside a <code>setTimeout(…, 0)</code> in its effect. Seven lines in the codebase switch a rule off: three for
  <code>exhaustive-deps</code>, two for <code>refs</code> in <code>CodeEditor</code>, and two for
  <code>prefer-const</code>.
</p>

<h3>Two scripts in the root layout</h3>
<p>
  <b>theme-init.</b> <code>app/layout.tsx</code> renders <code>&lt;html data-theme="light"&gt;</code>
  because the server cannot know your theme. Before the page paints, a
  <code>next/script</code> with <code>strategy="beforeInteractive"</code> runs the inline code in
  <code>lib/themeInitScript.ts</code>. It reads <code>jsnotes:theme</code> and
  <code>jsnotes:font</code>, falls back to <code>prefers-color-scheme</code>, and sets
  <code>data-theme</code> and <code>data-font</code> on the root element. There are nine themes and
  seven fonts. <code>&lt;html&gt;</code> has <code>suppressHydrationWarning</code> because those
  attributes will legitimately differ from the server's. The script sits in
  <code>&lt;body&gt;</code>, as the Script docs ask, and Next moves it into the head.
</p>
<p>
  <b>RouteFade.</b> This client component wraps every page. It stores the first pathname in
  <code>useState</code>, and while you are still on that path it renders its children bare. That
  way the hydrated tree is exactly the server's, and nothing animates on first load. After a client
  navigation it wraps the page in <code>&lt;div key={pathname} className="route-fade"&gt;</code>,
  which fades it in over 0.28 seconds. The key remounts the page on every navigation, which throws
  away its state. That is fine here, because a new route is a new page anyway. The providers,
  <code>ErrorReporter</code>, <code>NavTrail</code> and the analytics components sit outside it and
  stay mounted.
</p>

<div class="bx is-ref">
<span class="ttl">The rule for the next feature</span>
<p>
  Read browser state through one of the hooks in <code>lib/hooks.ts</code>, never in render or in a
  <code>useState</code> initialiser, unless the whole component is behind <code>ssr: false</code>.
  The e2e test "the mock lobby hydrates cleanly with saved choices" seeds storage before loading the
  page and fails on error #418. It was added with the lobby fix and fails on the old code.
</p>
</div>`,
};
