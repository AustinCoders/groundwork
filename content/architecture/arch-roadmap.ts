import type { Chapter } from "../types";

export const archRoadmap: Chapter = {
  id: "arch-roadmap",
  num: "A6",
  title: "What is next, and roughly how long",
  short: "What is next",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Four things left, in the order worth picking them up.",
  body: `<h3>The list</h3>
<div class="table-scroll"><table>
<thead><tr><th>#</th><th>Item</th><th>Effort</th><th>Why there</th></tr></thead>
<tbody>
<tr><td>1</td><td>Trim the search index</td><td><b>0.5 day</b></td><td>Halves the two indexes that already cost over 100 KB</td></tr>
<tr><td>2</td><td>A real error tracker</td><td><b>0.5&ndash;1 day</b></td><td>Wanted before there are accounts to break</td></tr>
<tr><td>3</td><td>Offline reading</td><td><b>2&ndash;3 days</b></td><td>The content is already static; it is mostly a caching problem</td></tr>
<tr><td>4</td><td>Accounts and progress sync</td><td><b>5&ndash;8 days</b></td><td>The biggest gap, and the biggest commitment</td></tr>
</tbody>
</table></div>
<p class="sub">
  Roughly 8 to 13 focused days for all four. The first two come to about a day together and neither
  depends on the other.
</p>

<h3>Why accounts are last</h3>
<p>
  Not because they are hard. Because they are <b>the only item on the list that adds ongoing work
  rather than removing it</b>: a database to keep alive, auth email that has to actually arrive, and
  an account-deletion path that has to work. Every other item is finished when it ships.
</p>
<p>
  The build itself is 5 to 8 days — provider and schema 1 to 2, the synced storage layer 2, migration
  from <code>localStorage</code> and signed-out behaviour 1 to 2, tests 1. The components do not
  change at all, because the storage module is already the seam. The commitment outlasts the build,
  and that is the part worth deciding on before starting.
</p>

<h3>Offline reading, and the part that is fiddly</h3>
<p>
  There is already a web app manifest; what is missing is a service worker. The content is static and
  cached hard already, so most of the work is a cache strategy — and the awkward detail is that the
  App Router serves RSC payloads as well as HTML, so the rules have to cover both or client-side
  navigation breaks offline while a full page load works.
</p>
<p>
  The other decision is the playground. It needs 18 MB of WebAssembly, which should not be precached
  by default; either it stays online-only or "download for offline" becomes an explicit action.
</p>

<h3>Further out, and less certain</h3>
<ul>
<li><b>A schema for chapter bodies.</b> They are HTML strings, so a malformed one is caught by the integrity tests rather than by a type. Zod over the chapter shape would move that error to the build.</li>
<li><b>Product analytics.</b> Pageviews cannot answer the questions that would change the writing &mdash; which chapter people leave from, which exercise gets abandoned, and above all which searches return nothing, since that is a list of chapters that should exist.</li>
<li><b>The interview book as a paid product.</b> 27 rounds and 405 questions is the most obvious thing here to charge for. It needs accounts first, then payments, then a gate.</li>
<li><b>Pyodide from a CDN</b> instead of the deploy, if 18 MB ever becomes a problem. The trade is a third-party origin in the policy and a dependency on somebody else's uptime.</li>
</ul>

<div class="bx is-ref">
<span class="ttl">What is not on the list</span>
<p>
  Rewriting anything. Nothing in this architecture is currently the wrong shape for what the site is
  &mdash; the pressure is on the writing, where 4 topics of 20 are done, rather than on the system
  that serves it.
</p>
</div>`,
};
