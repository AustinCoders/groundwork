import type { Chapter } from "../types";

export const archSearch: Chapter = {
  id: "arch-search",
  num: "I7",
  title: "Search without a search service",
  short: "Search",
  levels: ["intermediate"],
  practice: [],
  ready: true,
  subtitle: "A JSON file per topic, fetched on the first keystroke and grepped in the browser.",
  body: `<h3>How it works</h3>
<p>
  Each topic has a route that returns a JSON array of its chapters — id, title, and the body with the
  HTML stripped out — marked <code>force-static</code>, so it is written to disk at build time and
  served from the CDN like any other file. There is also one global index, small, holding titles
  across every topic.
</p>
<p>
  The reader types; the browser fetches the index for the current topic and the global one; matching
  is a lowercase substring scan. No service, no API key, no monthly bill, and it works offline once
  the file is cached.
</p>

<h3>The timing detail that matters</h3>
<p>
  The fetch is <b>lazy</b>. Nothing is downloaded until the search box has at least one character in
  it, so a reader who never searches pays nothing at all for the feature. That single condition is
  the difference between a nice trick and a real cost on every page.
</p>

<h3>What it costs when you do search</h3>
<div class="table-scroll"><table>
<thead><tr><th>Index</th><th>Raw</th><th>gzip</th></tr></thead>
<tbody>
<tr><td><code>/interview</code></td><td>378 KB</td><td><b>134 KB</b></td></tr>
<tr><td><code>/dsa</code></td><td>339 KB</td><td><b>115 KB</b></td></tr>
<tr><td>global</td><td>25 KB</td><td>6.6 KB</td></tr>
<tr><td><code>/css</code> (an outline)</td><td>1.9 KB</td><td>0.6 KB</td></tr>
</tbody>
</table></div>

<p>
  Two topics already cost more on the first keystroke than a whole page does, and they are the two
  people are most likely to search. That is the honest state of it: the approach is right for a site
  this size and it is already at the edge of comfortable on the two biggest topics.
</p>

<h3>What would be done about it</h3>
<ol>
<li><b>Trim the index.</b> The body is stored as stripped text; capping how much is kept per chapter and dropping code blocks would roughly halve it, and changes nothing else.</li>
<li><b>Invert it.</b> A precomputed map of term to chapter ids instead of raw text. Much smaller, more code, and it needs a stemming decision.</li>
<li><b>Hand it to a service.</b> Typesense, Meilisearch or Algolia. Typo tolerance and ranking for free, a monthly bill, and a network round trip per keystroke.</li>
</ol>
<p>
  The first is worth doing now. The third is only right if search becomes something readers rely on
  rather than reach for occasionally.
</p>`,
};
