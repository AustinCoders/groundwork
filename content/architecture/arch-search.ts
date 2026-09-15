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
  Each topic has a route that returns a JSON array of its chapters — an id, and the words a reader
  can actually see in that chapter — marked <code>force-static</code>, so it is written to disk at
  build time and served from the CDN like any other file. There is also one global index, small,
  holding titles across every topic.
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

<h3>It had grown past a whole page</h3>
<p>
  The first version stored each chapter's body with its tags stripped. As topics filled in, four
  indexes passed 100 KB gzipped — more on the first keystroke than an entire page costs. Stripping
  tags had never been the problem. What made them large was measured, not guessed:
</p>
<ul>
<li><b>Demo scripts.</b> A tag-stripping regex removes <code>&lt;script&gt;</code> but keeps what is inside it, so every interactive demo's source was indexed as if it were prose.</li>
<li><b>Entities.</b> <code>&amp;gt;</code> was indexed as the letters <code>&amp;gt;</code>, which is also why searching for <code>=&gt;</code> found it in 3 JavaScript chapters rather than the 34 that show one.</li>
<li><b>Repetition.</b> Every word appeared as many times as the chapter used it. Matching only asks whether a term appears, not how often.</li>
</ul>

<h3>What was done about it</h3>
<p>
  The index now keeps only reader-visible text, decodes entities, and keeps each distinct word once —
  and drops a word entirely if it already appears inside a longer one, since a search for
  <code>loop</code> finds it inside <code>loops</code> anyway. A query term never contains a space,
  so this is not an approximation: every kept word is an original word, and every original word is
  still findable. A test checks both halves for every chapter on the site.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Index</th><th>gzip before</th><th>gzip after</th></tr></thead>
<tbody>
<tr><td><code>/notes</code> (JavaScript)</td><td>148 KB</td><td><b>70 KB</b></td></tr>
<tr><td><code>/system-design</code></td><td>146 KB</td><td><b>69 KB</b></td></tr>
<tr><td><code>/interview</code></td><td>135 KB</td><td><b>65 KB</b></td></tr>
<tr><td><code>/react</code></td><td>99 KB</td><td><b>57 KB</b></td></tr>
<tr><td><code>/dsa</code></td><td>115 KB</td><td><b>54 KB</b></td></tr>
</tbody>
</table></div>
<p>
  The one thing given up was the hit count beside each chapter in the sidebar. Counting occurrences
  needs the repetition that was most of the weight, so the sidebar now marks which chapters matched
  rather than how many times — a trade chosen deliberately, and the only visible change.
</p>

<h3>What happens when it grows again</h3>
<p>
  The same test fails the build if any topic's index passes 75 KB gzipped, so the next step is
  triggered by a measurement rather than remembered. At that point the options are to
  <b>invert it</b> — a precomputed map of term to chapter ids, more code and a stemming decision — or
  to <b>hand it to a service</b> such as Typesense, Meilisearch or Algolia, which brings typo
  tolerance and ranking along with a monthly bill and a round trip per keystroke. The second is only
  right if search becomes something readers rely on rather than reach for occasionally.
</p>`,
};
