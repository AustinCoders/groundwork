import type { Chapter } from "../types";

export const archSearch: Chapter = {
  id: "arch-search",
  num: "I12",
  title: "Search without a search service",
  short: "Search",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle:
    "Twenty-one JSON files written at build time, fetched on the first keystroke and scanned in the browser, with a test that fails the build when one grows too large.",
  body: `<h3>Two kinds of index</h3>
<p>
  Search here has no server, no API key and no ranking. The build writes two kinds of index as
  static files, and the chapter reader's search box scans them in memory.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Index</th><th>Route</th><th>One row per</th><th>Row holds</th></tr></thead>
<tbody>
<tr><td>Per topic, 20 of them</td><td><code>app/{topic}/search-index.json/route.ts</code></td><td>Chapter in that topic, outlines included</td><td><code>id</code>, and <code>text</code>: the chapter's visible words, compacted</td></tr>
<tr><td>Global, one</td><td><code>app/search-index.json/route.ts</code></td><td>Written chapter in every topic that has levels</td><td><code>id</code>, <code>topicId</code>, <code>topicName</code>, <code>href</code>, <code>num</code>, <code>short</code>, and <code>text</code>: title, short name, subtitle and topic name</td></tr>
</tbody>
</table></div>
<p>
  Each per-topic route is five lines long. It declares <code>dynamic = "force-static"</code> and
  returns <code>searchIndexResponse(topicId)</code> from <code>components/reader/searchIndex.ts</code>.
  <code>force-static</code> makes the build call the handler once and store the body. In production
  the file is served like any other static asset, and no code runs.
</p>

<h3>What goes into a row</h3>
<p>
  <code>searchableText()</code> turns a chapter into the words a reader can actually see:
</p>
<ul>
<li>It removes every <code>&lt;script&gt;</code> and <code>&lt;style&gt;</code> element together with its contents. A plain tag-stripping regex keeps what is inside a script, and for a long time the source of every interactive demo was indexed as if it were prose.</li>
<li>It strips the remaining tags.</li>
<li>It decodes 14 named entities, so <code>&amp;gt;</code> becomes <code>&gt;</code> and a search for <code>=&gt;</code> finds the chapters that show an arrow function.</li>
<li>It lowercases the text and collapses whitespace.</li>
</ul>
<p>
  <code>compactWords()</code> then removes the repetition. It takes each distinct word once, sorts
  the words longest first, and drops any word that already appears inside the text kept so far.
  <code>loop</code> is dropped when <code>loops</code> has been kept, because a substring search for
  <code>loop</code> finds it inside <code>loops</code> anyway. A query term never contains a space,
  so this loses nothing. The first test in <code>tests/search-index.test.ts</code> checks this for
  every chapter on the site: every kept word is an original word, and every original word can still
  be found in the compacted text.
</p>
<p>
  Measured on today's content, for the JavaScript topic: stripping tags alone gives an index of
  173,862 bytes gzipped. Removing scripts and decoding entities brings it to 158,729. Compacting
  brings it to 77,347. Most of the saving comes from dropping repetition, not markup.
</p>

<h3>What happens when you type</h3>

<figure>
<svg viewBox="0 0 900 340" class="dg" role="img" aria-label="The first keystroke starts two fetches in parallel, the topic's search-index.json and the global /search-index.json. Until the topic index arrives, matching runs over the chapter titles and subtitles already in the page. Every query term must be a substring of a row's text. Matches mark chapters in the sidebar; matches in the global index from other topics are listed, up to twelve.">
<g class="rough">
<rect x="20" y="136" width="160" height="80" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="230" y="30" width="250" height="66" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="230" y="136" width="250" height="66" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
<rect x="230" y="242" width="250" height="66" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="540" y="110" width="170" height="100" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="745" y="30" width="145" height="66" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="745" y="242" width="145" height="66" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M180 160 C206 160 206 63 224 63" marker-end="url(#arrow)" />
<path class="ln" d="M180 176 H224" style="stroke-dasharray: 6 5" marker-end="url(#arrow)" />
<path class="ln" d="M180 192 C206 192 206 275 224 275" marker-end="url(#arrow)" />
<path class="ln" d="M480 63 C510 63 510 140 534 140" marker-end="url(#arrow)" />
<path class="ln" d="M480 169 H534" style="stroke-dasharray: 6 5" marker-end="url(#arrow)" />
<path class="ln" d="M710 140 C728 140 728 63 739 63" marker-end="url(#arrow)" />
<path class="ln" d="M480 275 H739" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="100" y="170" text-anchor="middle">Keystroke</text>
<text class="sm" x="100" y="192" text-anchor="middle">query not blank</text>
<text class="lbl gr" x="355" y="58" text-anchor="middle">{topic}/search-index.json</text>
<text class="sm" x="355" y="80" text-anchor="middle">fetched once per reader view</text>
<text class="lbl" x="355" y="164" text-anchor="middle">Chapter metas</text>
<text class="sm" x="355" y="186" text-anchor="middle">in the page, used until then</text>
<text class="lbl gr" x="355" y="270" text-anchor="middle">/search-index.json</text>
<text class="sm" x="355" y="292" text-anchor="middle">every topic, titles only</text>
<text class="lbl" x="625" y="140" text-anchor="middle">Match</text>
<text class="sm" x="625" y="162" text-anchor="middle">split on spaces;</text>
<text class="sm" x="625" y="180" text-anchor="middle">every term must be</text>
<text class="sm" x="625" y="198" text-anchor="middle">a substring</text>
<text class="lbl" x="817" y="58" text-anchor="middle">Sidebar</text>
<text class="sm" x="817" y="80" text-anchor="middle">matches marked</text>
<text class="lbl" x="817" y="270" text-anchor="middle">Other topics</text>
<text class="sm" x="817" y="292" text-anchor="middle">up to 12 links</text>
</svg>
<figcaption>
  Dashed lines are the fallback that runs until the topic's index arrives. A reader who never types
  downloads neither file.
</figcaption>
</figure>

<p>
  All of this is in <code>ReaderShell</code>. An effect runs whenever <code>query.trim()</code> is
  non-empty and an index is still missing. It fires both fetches in parallel and ignores late
  responses with a <code>cancelled</code> flag in its cleanup. A failed fetch is swallowed. Until
  the topic index arrives, or for good if it never does, matching runs over
  <code>chapterMetas</code>, the titles, short names and subtitles the page already received as
  props. So search always does something, and it gets better once the full index lands.
</p>
<p>
  Matching is deliberately naive. The query is lowercased and split on whitespace, and a row
  matches when every term is a substring of its <code>text</code>. There is no ranking, no stemming
  and no typo tolerance. The sidebar marks each matching chapter and states how many chapters
  match. The global index is filtered to rows from <em>other</em> topics with the same test and
  capped at 12 links, so a search inside React can point you to the Node chapter that answers it.
</p>
<p>
  The indexes live in <code>ReaderShell</code>'s state, and <code>RouteFade</code> remounts a page
  on every client navigation. So the next chapter you open starts without them, and its first
  search requests the files again. They are static files, so this is a cheap repeat request, but it
  is still a request. Keeping the loaded index in a module-level cache would remove it.
</p>

<h3>The size budget</h3>
<p>
  The third test in <code>tests/search-index.test.ts</code> gzips every written topic's index with
  Node's default level and fails if any is 85 KB or more. It runs in CI before the build step, so an
  index that crosses the line fails the check. Sizes from the last production build, read from
  the files it wrote:
</p>
<div class="table-scroll"><table>
<thead><tr><th>Index</th><th>Rows</th><th>Raw</th><th>gzip</th><th>Brotli</th><th>Of the 85 KB budget</th></tr></thead>
<tbody>
<tr><td><code>/notes</code> (JavaScript)</td><td>41</td><td>189 KB</td><td>75.5 KB</td><td>65.4 KB</td><td>89%</td></tr>
<tr><td><code>/react</code></td><td>57</td><td>189 KB</td><td>74.4 KB</td><td>64.0 KB</td><td>87%</td></tr>
<tr><td><code>/system-design</code></td><td>24</td><td>172 KB</td><td>71.6 KB</td><td>61.0 KB</td><td>84%</td></tr>
<tr><td><code>/interview</code></td><td>27</td><td>149 KB</td><td>62.7 KB</td><td>54.5 KB</td><td>74%</td></tr>
<tr><td><code>/dsa</code></td><td>34</td><td>137 KB</td><td>56.4 KB</td><td>49.2 KB</td><td>66%</td></tr>
<tr><td><code>/search-index.json</code> (global)</td><td>174</td><td>49 KB</td><td>11.9 KB</td><td>10.0 KB</td><td>not tested</td></tr>
<tr><td>An outline-only topic, such as <code>/redis</code></td><td>21</td><td>1.2 KB</td><td>0.4 KB</td><td>0.3 KB</td><td>not tested</td></tr>
</tbody>
</table></div>
<p>
  All 21 files together come to 931 KB raw. The architecture index is being rewritten as this is
  written: it was 11.2 KB gzipped at the last build and measures 23.5 KB on the working tree, so its
  row will change.
</p>
<p>
  The budget has already moved once. It was 75 KB when the compaction landed on 15 September 2026,
  after which the JavaScript index was 70 KB. On 24 September, dry-run tables and checklists reached
  every JavaScript and System Design chapter (DSA and React already had them), and the JavaScript
  index went past 75 KB from real content growth. The limit was raised to 85 KB, with a comment
  beside it pointing to the roadmap's options. The JavaScript index has 9.5 KB of headroom left.
</p>

<h3>When it outgrows this</h3>
<p>
  The pressure comes from the biggest topics getting longer, not from more topics. A new topic
  gets its own file and adds nothing to the others. Three steps are available, in order of cost:
</p>
<ul>
<li><b>Shard by level.</b> Split a topic's index into beginner, intermediate and advanced files, and fetch the level the reader is in first. It keeps the same code and the same guarantees, and each file holds only one level's chapters.</li>
<li><b>Invert it.</b> Precompute a map from each term to chapter IDs. This gives smaller files and faster matching, but prefix matching gets harder, and someone has to decide about stemming.</li>
<li><b>Use a service</b> such as Typesense, Meilisearch or Algolia. That brings ranking and typo tolerance, along with a monthly bill, an API key in the CSP, and a round trip per keystroke. It is only worth it if readers come to rely on search, rather than using it now and then.</li>
</ul>

<div class="bx is-ref">
<span class="ttl">What was given up</span>
<p>
  The sidebar once showed a hit count beside each chapter. Counting occurrences needs the
  repetition that made up most of the index's weight, so it went when the index was compacted. The
  sidebar now shows <em>which</em> chapters match, not how often. An e2e test types a query, checks
  that the right chapters are marked, and checks that demo-script source is not matched.
</p>
</div>`,
};
