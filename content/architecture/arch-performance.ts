import type { Chapter } from "../types";

export const archPerformance: Chapter = {
  id: "arch-performance",
  num: "A1",
  title: "Performance, and how it was found",
  short: "Performance",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Four real regressions, none of which was visible without measuring.",
  body: `<h3>The record</h3>
<div class="table-scroll"><table>
<thead><tr><th>What was wrong</th><th>Before</th><th>After</th></tr></thead>
<tbody>
<tr><td>The reader page fetched far more than it needed</td><td>623 KB / 56 requests</td><td>470 KB / 26</td></tr>
<tr><td>Links prefetched RSC payloads across the whole sidebar</td><td>25 prefetches</td><td>0</td></tr>
<tr><td>Three page routes rendered on every request</td><td>3 dynamic</td><td>all static</td></tr>
<tr><td>The sidebar shipped the whole syllabus to every page</td><td>259 KB chunk on 557 pages</td><td>112 KB on 2</td></tr>
<tr><td>The home page prefetched the code editor</td><td>1,986 KB of JS</td><td>647 KB</td></tr>
<tr><td>The narrator returned base64 JSON, uncacheable</td><td><code>no-store</code></td><td>binary mp3, CDN-cached</td></tr>
<tr><td>Sidebar accordion opened after mount</td><td>CLS 0.116</td><td>0.030</td></tr>
<tr><td>Font families, most unused</td><td>16</td><td>6</td></tr>
</tbody>
</table></div>

<h3>The two that are worth studying</h3>

<h4>The sidebar that shipped a syllabus</h4>
<p>
  <code>Shell</code> is a client component on every page, and it imported the module holding the
  topic data. It needed a name, a mark and a link per topic — 8 KB serialised. It was bundling 127 KB.
</p>
<p>
  The fix was a narrower type derived on the server and passed through a context provider. Measured
  in brotli: about <b>27 KB off every page</b>, and <b>57 KB off the home page</b>, which had also
  been serialising the full list into its own payload.
</p>
<p>
  The first attempt saved <em>nothing</em>. <code>Shell</code> still imported one string constant
  from the same module, and that import pulled the entire file back in. Tree-shaking works at the
  level of exports; it cannot drop unused properties of an object that is exported. Moving that one
  constant into a file of its own is what actually did it.
</p>

<h4>The home page that loaded a code editor</h4>
<p>
  Measured: <code>/</code> downloaded 1,986 KB of JavaScript across 15 files, against 653 KB across
  13 on a chapter page. The difference was a single 1.3 MB chunk, and it was CodeMirror.
</p>
<p>
  It was not in the home page's script set. Next's router was prefetching it, because the two links
  to the playground on that page were the only ones without <code>prefetch={false}</code>. Adding it
  to both dropped the home page to 647 KB — slightly <em>less</em> than a chapter page, where it had
  been three times more.
</p>

<h3>How these were found</h3>
<p>
  All four came from driving a headless browser at the production site and counting bytes — not from
  a Lighthouse score, which was 100 throughout, and not from reading the code, which looked fine. A
  bundle that is 1.3 MB too big and a bundle that is correct look identical in a source file.
</p>

<div class="bx is-prim">
<span class="ttl">Two lessons that generalise</span>
<p>
  <b>Importing one constant imports the module.</b> If a client component needs a value from a file
  that also holds a large object, that object ships. Constants belong in their own file.
</p>
<p>
  <b>Prefetch is not free.</b> It fetches the route's chunks, not just its data. A link to a
  heavy route from a light page pays the heavy route's cost on every visit that never clicks it.
</p>
</div>`,
};
