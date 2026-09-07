import type { Chapter } from "../types";

export const reactReviewJudgement: Chapter = {
  id: "react-review-judgement",
  num: "A20",
  title: "Reviewing React, and knowing when not to use it",
  short: "Review & judgement",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "At this level you are judged on what you notice in someone else's code, and on what you argue against.",
  body: `<h3>What to look for, in order</h3>
<p>
  A React review that starts at naming and formatting has already missed the
  expensive problems. Prettier and ESLint handle that layer; a person should be
  reading for the things a tool cannot see.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Look for</th><th>Because</th></tr></thead>
<tbody>
<tr><td><b>State that should not exist</b></td><td>Derived values stored, or the same truth in two places. This is the most common defect in React by a distance.</td></tr>
<tr><td><b>An effect that is not synchronisation</b></td><td>A user action reacted to after the fact, or a value computed in an effect. Both belong elsewhere.</td></tr>
<tr><td><b>State in the wrong place</b></td><td>At the top of the tree "in case", or duplicated instead of lifted.</td></tr>
<tr><td><b>Missing states</b></td><td>Loading, empty, error. Reviews pass the happy path constantly.</td></tr>
<tr><td><b>Keys</b></td><td>Index keys on anything that can reorder or be deleted from the middle.</td></tr>
<tr><td><b>Accessible names</b></td><td>Icon-only buttons, inputs with a placeholder and no label.</td></tr>
<tr><td><b>Race conditions</b></td><td>A fetch in an effect with no abort or cancellation flag.</td></tr>
<tr><td><b>New dependencies</b></td><td>What does it weigh, who maintains it, and what happens when it stops being maintained.</td></tr>
</tbody>
</table></div>

<h3>Comments that land, and ones that do not</h3>
<pre><code>✗  "Use useCallback here."
✓  "This re-creates the handler each render, and Row is memoised — so the memo
    never hits. Worth a useCallback, or moving the state into SearchBox."

✗  "This is wrong."
✓  "If userId changes twice quickly, the slower response can land last and
    overwrite the newer one. An AbortController in the cleanup fixes it."</code></pre>
<p>
  Name the consequence, not the rule. A reviewer who cites a rule gets
  compliance; one who describes the failure gets a colleague who will catch it
  themselves next time. And say which comments are blocking &mdash; leaving that
  ambiguous is how a review turns into three days of back and forth.
</p>

<div class="bx is-prim">
  <span class="ttl">The review question worth asking every time</span>
  <p>
    <b>"What happens the second time?"</b> The second render, the second click,
    the second user, the second tab. Most React bugs that reach production are
    correct the first time through and wrong after that &mdash; stale closures,
    missing cleanups, races, duplicated state that has not drifted yet.
  </p>
</div>

<h3>What not to block on</h3>
<p>
  Personal preference about file structure, arrow versus function declaration,
  whether a component takes three props or four, and premature memoisation. A
  review that blocks on those trains people to stop asking for reviews.
</p>

<h3>The security review, specifically</h3>
<p>
  React escapes everything you interpolate, which removes the most common XSS
  vector by default. The vulnerabilities that remain are the ones where you left
  that protection, and a reviewer should know all four.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Risk</th><th>What to look for</th></tr></thead>
<tbody>
<tr><td><code>dangerouslySetInnerHTML</code></td><td>Any use at all. If the HTML is not authored by you, it must be sanitised with DOMPurify first &mdash; and sanitised on the way in, not on the way out.</td></tr>
<tr><td><b>URLs from data</b></td><td><code>&lt;a href={user.website}&gt;</code> with <code>javascript:</code> in it executes on click. Validate the protocol.</td></tr>
<tr><td><b>Spreading unknown props</b></td><td><code>&lt;div {...fromApi} /&gt;</code> can set event handlers and <code>dangerouslySetInnerHTML</code>. Pick fields explicitly.</td></tr>
<tr><td><b>Secrets in the bundle</b></td><td>Anything prefixed <code>VITE_</code> or <code>NEXT_PUBLIC_</code> is public. A key in client code is a published key.</td></tr>
</tbody>
</table></div>
<pre><code>function SafeLink({ href, children }) {
  const ok = /^(https?:|mailto:|\/)/i.test(href ?? "");
  return ok ? &lt;a href={href}&gt;{children}&lt;/a&gt; : &lt;span&gt;{children}&lt;/span&gt;;
}</code></pre>
<p class="sub">
  Two more worth a glance in review: tokens in <code>localStorage</code> are
  readable by any script that gets injected, so an httpOnly cookie is the safer
  default; and a Content Security Policy is a seatbelt that limits the damage
  when one of the four above slips through &mdash; not a substitute for any of
  them.
</p>

<h3>When not to use React</h3>
<p>
  Being able to argue against your own default is most of what "senior" means in
  this conversation. React is a poor fit more often than the industry admits.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Situation</th><th>Better</th></tr></thead>
<tbody>
<tr><td>A content site with a few interactive pieces</td><td>Astro, or plain HTML with islands. Shipping a framework to render an article is a strange trade.</td></tr>
<tr><td>A form and a table on an internal tool</td><td>Server-rendered HTML with htmx or Hotwire. No build step, no state duplication.</td></tr>
<tr><td>A highly interactive canvas or editor</td><td>The DOM is not the bottleneck; React's model may not help. Consider owning the render loop.</td></tr>
<tr><td>A tiny widget embedded on other people's pages</td><td>Preact, or no framework. Bundle size dominates.</td></tr>
<tr><td>A team that knows something else well</td><td>The framework they know. Familiarity beats theoretical fit almost every time.</td></tr>
</tbody>
</table></div>
<p>
  Where React genuinely earns it: a large application with a lot of shared,
  stateful UI; a team that needs a common component vocabulary; a product where
  the same components must run on web and native; and a hiring market where
  React knowledge is easy to find.
</p>

<h3>Arguing the trade honestly</h3>
<pre><code>"React is fine here" ✗                    <span class="c">// a preference</span>

"This is twelve pages of mostly static content with three interactive
 widgets. React costs us ~45 KB of runtime plus hydration on every page
 to make three components work. Islands would ship the same UI with
 almost no JavaScript. If we expect this to grow into an application,
 React is the right bet now — otherwise it is not." ✓</code></pre>
<p>
  The second version names the cost, the benefit, and the condition under which
  the answer flips. That structure &mdash; cost, benefit, what would change my
  mind &mdash; is what a design review is scoring, and it applies to every tool
  choice, not just this one.
</p>

<h3>The things worth having an opinion on</h3>
<ul>
  <li><b>Server-first by default</b>, with interactivity as islands &mdash; and knowing what that costs in complexity.</li>
  <li><b>Server state is not client state</b>, and a query cache is not optional at any real size.</li>
  <li><b>Effects are a smell until proven otherwise.</b></li>
  <li><b>Accessibility is a correctness requirement</b>, not a phase.</li>
  <li><b>Measure before optimising</b>, and delete the optimisation that did not help.</li>
</ul>
<p>
  You do not have to agree with all five. You should be able to say where you
  stand on each and why, because that is the conversation a senior React
  interview actually is.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "In review I read for state that should not exist, effects that are not
    synchronisation, and what happens the second time — the first render is
    usually fine. And I would argue against React for a mostly static site: it
    costs a runtime and hydration on every page to make three widgets work, and
    islands ship the same UI with almost no JavaScript."
  </p>
</div>`,
};
