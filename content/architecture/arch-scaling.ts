import type { Chapter } from "../types";

export const archScaling: Chapter = {
  id: "arch-scaling",
  num: "A5",
  title: "What breaks first",
  short: "What breaks first",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "The useful half of a design review is the part that says where it stops working.",
  body: `<h3>In the order they would give way</h3>
<div class="table-scroll"><table>
<thead><tr><th>Under pressure from</th><th>What gives</th><th>What it would take</th></tr></thead>
<tbody>
<tr>
  <td>Readers on phones, searching</td>
  <td>The search index. Fetched on the first keystroke; the interview index is 134 KB gzipped, DSA 115 KB. Two topics already cost more than a whole page.</td>
  <td>Strip more out of the indexed text first; an inverted index after that</td>
</tr>
<tr>
  <td>A burst on the narrator</td>
  <td>Function cost and the upstream. The firewall holds the edge, but its counters are per region, so a distributed client sees a higher ceiling than 100 a minute suggests.</td>
  <td>A shared counter &mdash; which means state, which is the thing this design does not have</td>
</tr>
<tr>
  <td>Anyone using two devices</td>
  <td>Progress. It does not sync and there is no mechanism by which it could. This is the failure readers actually meet.</td>
  <td>Accounts and a database</td>
</tr>
<tr>
  <td>An error in somebody's browser</td>
  <td>Visibility. It is recorded in a log with no grouping and no alerting, and the log expires.</td>
  <td>An error tracker; the reporting component is already the seam</td>
</tr>
<tr>
  <td>Writing the 399 outlined chapters</td>
  <td>Build time and deploy size, linearly. Nothing sharp.</td>
  <td>Nothing urgent &mdash; 12.5 seconds has a lot of room above it</td>
</tr>
<tr>
  <td>Traffic on the pages themselves</td>
  <td>Nothing. Static files on a CDN, and the origin is only touched once per path per region.</td>
  <td>&mdash;</td>
</tr>
</tbody>
</table></div>

<h3>At ten times, and at a hundred</h3>
<p>
  <b>Ten times the readers</b> changes almost nothing. The pages are cached files; the extra load
  lands on the four functions, and the two that matter are already cached upstream. The first thing
  that would be felt is the search index on mobile connections, and that is a payload problem rather
  than a capacity one.
</p>
<p>
  <b>A hundred times</b> is where the shape stops being right — not because the CDN struggles, but
  because a site with that many readers has different requirements. It would want accounts, so it
  would want a database; it would want to know which chapter people abandon, so it would want
  product analytics; and the content would want to be publishable without a deploy. Each of those
  adds a piece this design deliberately does not have.
</p>

<h3>What this design deliberately does not have</h3>
<p>
  Every one of these is an absence rather than an oversight, and together they are what keeps the
  system small enough to hold in your head.
</p>
<ul>
<li><b>No database.</b> The content is the repository; the reader's state is their browser.</li>
<li><b>No authentication.</b> Nothing is gated, so there is no session, no reset flow and no account to breach.</li>
<li><b>No cache layer of our own.</b> The CDN is the cache and the build is the invalidation.</li>
<li><b>No queue, no background jobs.</b> Anything slow happens at build time or in the reader's browser.</li>
<li><b>No server-side code execution.</b> The playground runs on the reader's machine, so untrusted code never reaches ours.</li>
</ul>

<div class="bx is-prim">
<span class="ttl">The honest summary</span>
<p>
  This is a small system that has been measured carefully, not a large one that was designed
  carefully. Most of what is written across these chapters is the record of finding out that
  something cost more than it looked like &mdash; a sidebar that shipped a syllabus, a home page that
  prefetched a code editor, three routes that quietly rendered on every request, a policy that
  blocked the site's own analytics. None of those were visible without going and measuring.
</p>
</div>`,
};
