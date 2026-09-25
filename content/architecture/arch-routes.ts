import type { Chapter } from "../types";

export const archRoutes: Chapter = {
  id: "arch-routes",
  num: "B6",
  title: "Every route and why the URLs look the way they do",
  short: "Every route",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "53 pages, 27 route handlers, the metadata files, and the links that live after the # sign.",
  body: `<h3>The whole tree on one page</h3>
<p>
  <code>app/</code> holds 53 <code>page.tsx</code> files and 27 <code>route.ts</code> files. Only four of
  those route handlers run on request. The other 23 are JSON files in disguise: they set
  <code>dynamic = "force-static"</code>, run once during the build, and are served from the CDN like any
  page. Every URL on the site falls into one of five groups.
</p>

<figure>
<svg viewBox="0 0 900 420" class="dg" role="img" aria-label="Five groups of routes. Pages with the Shell sidebar: topic covers and chapters, Git, level pages, path, review, progress, mock and soon. Full-screen tools: the playground, the problems list, each problem and the whiteboard. Prerendered JSON: the search indexes, the test cases and the mock question banks. Server functions: tts, weather, joke and client-error. Along the bottom, the metadata routes.">
<g class="rough">
<rect x="20" y="20" width="205" height="300" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="240" y="20" width="205" height="300" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="460" y="20" width="205" height="300" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="680" y="20" width="200" height="300" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<rect x="20" y="340" width="860" height="60" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
</g>
<text class="lbl" x="36" y="48">With the Shell</text>
<text class="sm" x="36" y="68">sidebar, prerendered HTML</text>
<text class="sm" x="36" y="100">/</text>
<text class="sm" x="36" y="122">/&lt;topic&gt;</text>
<text class="sm" x="36" y="144">/&lt;topic&gt;/&lt;chapter&gt;</text>
<text class="sm" x="36" y="166">/git</text>
<text class="sm" x="36" y="188">/level/&lt;topic&gt;</text>
<text class="sm" x="36" y="210">/path?topic=&amp;level=</text>
<text class="sm" x="36" y="232">/review, /progress</text>
<text class="sm" x="36" y="254">/mock</text>
<text class="sm" x="36" y="276">/soon?topic=</text>
<text class="lbl" x="256" y="48">Full screen</text>
<text class="sm" x="256" y="68">no sidebar, a menu drawer</text>
<text class="sm" x="256" y="100">/practice?id=free</text>
<text class="sm" x="256" y="122">/problems</text>
<text class="sm" x="256" y="144">/problems/&lt;id&gt;</text>
<text class="sm" x="256" y="166">/whiteboard</text>
<text class="lbl" x="476" y="48">Prerendered JSON</text>
<text class="sm" x="476" y="68">made once, at build time</text>
<text class="sm" x="476" y="100">/search-index.json</text>
<text class="sm" x="476" y="122">/&lt;topic&gt;/search-index.json</text>
<text class="sm" x="476" y="144">/problems/&lt;id&gt;/cases</text>
<text class="sm" x="476" y="166">/mock/bank/&lt;stage&gt;</text>
<text class="sm" x="476" y="298">21 + 538 + 12 files</text>
<text class="lbl" x="696" y="48">Server functions</text>
<text class="sm" x="696" y="68">run on every request</text>
<text class="sm" x="696" y="100">/api/tts</text>
<text class="sm" x="696" y="122">/api/weather</text>
<text class="sm" x="696" y="144">/api/joke</text>
<text class="sm" x="696" y="166">/api/client-error</text>
<text class="sm" x="696" y="298">4 functions</text>
<text class="lbl" x="36" y="366">Metadata routes</text>
<text class="sm" x="36" y="388">/sitemap.xml &middot; /robots.txt &middot; /manifest.webmanifest &middot; /icon &middot; /apple-icon &middot; 9 opengraph-image routes</text>
</svg>
<figcaption>
  Four of the five groups are files by the time a reader arrives. Only the right-hand column executes
  code on the server, and nothing on the reading path depends on it.
</figcaption>
</figure>

<h3>Topic covers and chapters</h3>
<p>
  Each of the 20 chaptered topics has its own folder with the same four files: <code>page.tsx</code> for
  the cover, <code>[chapter]/page.tsx</code>, <code>[chapter]/loading.tsx</code> and
  <code>search-index.json/route.ts</code>. The pages are a few lines each and call
  <code>TopicCoverPage</code> and <code>TopicChapterPage</code> in
  <code>components/reader/topicPages.tsx</code>, where the real work is.
</p>
<p>
  A single <code>app/[topic]/[chapter]</code> route would have removed the repetition. What the explicit
  folders give instead: a topic's URL is a folder you can see, a topic can carry its own files (six of
  them have their own <code>opengraph-image.tsx</code> share card), and there is no dynamic segment at
  the root of the site that has to be told which names are not topics. The cost is that adding a topic
  means adding a folder as well as data. The folder names come from the topic's
  <code>notes</code> field, which is why JavaScript is at <code>/notes</code>, and
  <code>tests/content.test.ts</code> checks that no two topics resolve to the same one.
</p>
<p>
  <code>generateStaticParams</code> returns every chapter id, written or not, so all 567 chapter pages are
  prerendered, outlines included. The chapter route does not set <code>dynamicParams</code>, so the
  default applies: an id the build did not know about is rendered once on the server, and it calls
  <code>notFound()</code>. Git is the exception to all of this: one folder, one page, one long HTML
  string, and no <code>[chapter]</code>.
</p>

<h3>/problems, and a page per problem</h3>
<p>
  <code>/problems</code> is built on the server from the exercise list, grouped by the chapter each
  exercise belongs to. Its filters (search text, topic, level, solved or not, sort order and layout) live
  in the query string, but not through Next's router. <code>ProblemsView.tsx</code> writes them with
  <code>history.replaceState</code>, fires a custom <code>groundwork:problems-url</code> event, and reads
  them back through <code>useSyncExternalStore</code>. Filtering never causes a navigation or a server
  request, and a filtered view is still a link you can share.
</p>
<p>
  <code>/problems/&lt;id&gt;</code> has 538 prerendered pages, one per exercise. Each page hands the
  client only its own exercise and the ids and titles of its neighbours, not the list. That was a
  deliberate change: the commit "Load one exercise per page" records the JavaScript per page falling from
  5.0 MB to 2.9 MB for a problem and from 3.5 MB to 1.3 MB for the problem list, uncompressed, because the
  practice pages had previously imported every exercise.
</p>
<p>
  Beside each page is <code>/problems/&lt;id&gt;/cases</code>, a route handler with
  <code>dynamicParams = false</code>, so an unknown id is a plain 404 without running anything. At build
  time it runs the exercise's JavaScript solution against its tests and writes the recorded cases as
  JSON; the playground fetches it only when a reader switches a problem to a language other than
  JavaScript or SQL. The 538 files come to 4,166,947 bytes in the build, and 222 of them contain
  translatable cases. The largest, for "maximal square", is 1,002,059 bytes. It is still the right
  place for them: nobody who stays in JavaScript downloads a byte of it.
</p>

<h3>/practice?id=</h3>
<p>
  The playground is <code>/practice?id=free</code>. Before every problem had its own page, a problem was
  <code>/practice?id=&lt;exercise&gt;</code>, and those links are still out there. They still work:
  <code>PracticeClient.tsx</code> reads <code>id</code>, and if it is anything other than
  <code>free</code> it shows "Opening the problem&hellip;" and calls <code>router.replace()</code> to
  <code>/problems/&lt;id&gt;</code>. The redirect has to happen in the browser, because a prerendered page
  cannot see its query string at build time.
</p>

<h3>/whiteboard</h3>
<p>
  One prerendered page whose only content is a frame and a loading line. The board itself is imported with
  <code>ssr: false</code>, so none of its 1,851 lines run on the server; there is nothing to render until
  the browser has read your saved boards from <code>localStorage</code>.
</p>

<h3>/mock, and the question banks</h3>
<p>
  <code>/mock</code> is prerendered with a catalog only: the 12 stages, what each one decides, and how
  many questions it has. The questions live at <code>/mock/bank/&lt;stage&gt;</code>, 12 static JSON
  files totalling 474,513 bytes. <code>app/mock/useStageBanks.ts</code> fetches only the stages a loop
  needs and caches each promise in a <code>Map</code>. The lobby starts those fetches when the reader
  points at Start, by hover or focus, and loads the room's code in idle time while they look at their
  plan. The commit that set this up, "Cut the mock lobby from 628 KB of JavaScript to 237 KB", records
  that the lobby had been fetching 462 KB of questions before the reader chose anything, and 12 KB
  after.
</p>

<h3>/level, /path, /review, /progress, /soon</h3>
<div class="table-scroll"><table>
<thead><tr><th>Route</th><th>What the server builds</th><th>What the browser adds</th></tr></thead>
<tbody>
<tr><td><code>/level/&lt;topic&gt;</code></td><td>19 pages, one per topic with levels: the three levels with chapter, minute and exercise counts</td><td>Your progress through each level</td></tr>
<tr><td><code>/level?topic=</code></td><td>An empty page</td><td>A redirect to <code>/level/&lt;topic&gt;</code></td></tr>
<tr><td><code>/path?topic=&amp;level=</code></td><td>Every chapter's metadata and exercise links, for every topic</td><td>Picks the topic and level from the query string and draws the path</td></tr>
<tr><td><code>/review</code></td><td>Every written chapter</td><td>Which ones are due, from your read dates</td></tr>
<tr><td><code>/progress</code></td><td>A frame</td><td>Streaks, XP, badges and the calendar, all from <code>localStorage</code></td></tr>
<tr><td><code>/soon?topic=</code></td><td>A frame</td><td>The planned topic's syllabus</td></tr>
</tbody>
</table></div>
<p>
  <code>/path</code>, <code>/review</code>, <code>/progress</code>, <code>/soon</code> and the bare
  <code>/level</code> are marked <code>noindex</code>: without your browser's data they are either empty
  or a duplicate of a page that is indexed. <code>/level/&lt;topic&gt;</code> is indexed, and listed in
  the sitemap, only for topics with something written.
</p>

<h3>Search indexes</h3>
<p>
  Each topic has <code>/&lt;topic&gt;/search-index.json</code>: every chapter's title, short name,
  subtitle and body text, lowercased, stripped of tags, and deduplicated word by word by
  <code>compactWords()</code>. The root <code>/search-index.json</code> covers every written chapter on the
  site but only by title, short name and subtitle. The reader's search box fetches both on the first
  keystroke, never before. Together the 21 files are 953,236 bytes in the build; the largest is
  JavaScript's at 193,062 and the cross-topic one is 49,794.
</p>

<h3>The four functions</h3>
<p>
  <code>/api/tts</code>, <code>/api/weather</code>, <code>/api/joke</code> and
  <code>/api/client-error</code> run on the Node runtime, each behind an in-memory per-IP limit from
  <code>lib/rateLimit.ts</code>: 40 requests a minute for speech and 20 for the rest.
  <code>/api/tts</code> answers a GET with an MP3 the CDN may cache for a year, word timings in a header,
  and a POST with uncacheable JSON. <code>robots.txt</code> disallows <code>/api/</code>.
  <a href="/architecture/arch-apis">The endpoints chapter</a> has the details.
</p>

<h3>Sitemap, robots, manifest and share images</h3>
<p>
  These are metadata routes: TypeScript files whose default export Next turns into the file.
  <code>app/sitemap.ts</code> lists the home page, <code>/problems</code>, <code>/practice</code>,
  <code>/whiteboard</code>, every topic with something written, their level pages, every written chapter,
  and every problem: 755 URLs in the last production build. Outlines, <code>/mock</code> and the personal
  pages are not in it, and <code>tests/seo.test.ts</code> fails if an unwritten chapter creeps in.
  <code>app/manifest.ts</code> makes the site installable. <code>app/icon.tsx</code> and
  <code>app/apple-icon.tsx</code> draw the icons, and nine <code>opengraph-image.tsx</code> files, the
  root's and eight topic or section ones, draw the share cards through <code>lib/og.tsx</code>. Pages
  without their own card inherit the nearest one above them.
</p>

<h3>Links that live after the # sign</h3>
<p>
  Two features share work without a server by putting the whole thing in the URL's fragment. The
  fragment is never sent in a request, so a static page can receive it, and nothing is stored anywhere.
</p>
<ul>
<li><b>The playground:</b> <code>/practice?id=free#share=&hellip;</code>. <code>lib/shareLink.ts</code> packs the open files as JSON, compresses them with the browser's <code>CompressionStream("deflate-raw")</code>, and encodes the bytes as URL-safe base64. Reading one back keeps at most 20 files, 60 characters of each name and 200,000 characters of each file, and drops any language the editor does not know.</li>
<li><b>The whiteboard:</b> <code>/whiteboard#board=&hellip;</code>, packed the same way by <code>lib/whiteboard/exporter.ts</code>. Images are dropped before packing, because a pasted photo would make the link unusable, and the share dialog says how many were left out. Reading one back keeps at most 2,000 elements.</li>
<li><b>Chapter anchors:</b> a cover page runs <code>HashRedirect</code>, which turns <code>/react#react-auth</code> into <code>/react/react-auth</code>, so an anchor-style link to a chapter still lands on it. It ignores <code>#top</code> and anything that is not a plain id.</li>
</ul>
<p>
  The limit of this design is the length of a URL. A large board makes a long link, and a link that
  contains the data cannot be edited after it is sent. For a site with no accounts, that is the right
  trade.
</p>

<h3>The Shell, and the pages that dropped it</h3>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="On the left, a Shell page: a sidebar with tools, topics, progress and display settings, beside the main content. On the right, a full-screen page: a thin header over the tool, with the site menu as a drawer that slides in on demand.">
<g class="rough">
<rect x="30" y="40" width="400" height="236" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="30" y="40" width="130" height="236" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="470" y="40" width="400" height="236" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="470" y="40" width="400" height="40" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="470" y="80" width="140" height="196" rx="8" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 1.6; stroke-dasharray: 6 5" />
</g>
<text class="sm" x="30" y="28">SHELL: READING PAGES</text>
<text class="sm" x="44" y="72">brand, clock</text>
<text class="sm" x="44" y="100">8 tool links</text>
<text class="sm" x="44" y="128">topics</text>
<text class="sm" x="44" y="156">your progress</text>
<text class="sm" x="44" y="184">theme, font</text>
<text class="lbl" x="295" y="152" text-anchor="middle">the chapter</text>
<text class="sm" x="295" y="176" text-anchor="middle">max reading width</text>
<text class="sm" x="470" y="28">BARE: FULL-SCREEN TOOLS</text>
<text class="sm" x="486" y="65">menu &middot; title &middot; actions</text>
<text class="sm" x="484" y="112">SiteDrawer,</text>
<text class="sm" x="484" y="132">opened on</text>
<text class="sm" x="484" y="152">demand:</text>
<text class="sm" x="484" y="172">7 links,</text>
<text class="sm" x="484" y="192">theme, font</text>
<text class="lbl" x="740" y="172" text-anchor="middle">the tool,</text>
<text class="lbl" x="740" y="196" text-anchor="middle">edge to edge</text>
</svg>
<figcaption>
  The drawer on the right is drawn dashed because it is not there until the menu button is pressed. It is
  a portal with <code>role="dialog"</code>, and Escape closes it.
</figcaption>
</figure>

<p>
  <code>components/Shell.tsx</code> is the frame with the sidebar: the brand, the clock, the streak, links
  to the tools, the topic list, reading progress, and the theme and font pickers. The home page, every
  topic cover and chapter, <code>/git</code>, the level, path, review, progress and soon pages,
  <code>/mock</code>, and the not-found and error pages all use it. The mock interview switches it to a
  <code>focused</code> variant while an interview is running, which folds the topic list away.
</p>
<p>
  The playground, <code>/problems</code>, every problem page and <code>/whiteboard</code> do not. The
  commit "Playground and problems: no sidebar, a site menu drawer" took the sidebar off them, and the
  whiteboard was built full-screen from the start. An editor, a list of 538 problems and an infinite
  canvas all want the width more than they want navigation that is always visible, so these pages use
  <code>components/SiteDrawer.tsx</code> instead: a menu button that opens a drawer with seven links and
  the shared <code>AppearancePicker</code>. <code>components/AppHeader.tsx</code> provides the thin
  header and a <code>BareShell</code> frame, which the whiteboard uses with the header turned off. The two
  frames never meet on one page.
</p>`,
};
