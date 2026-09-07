import type { Chapter } from "../types";

export const reactArchitectureScale: Chapter = {
  id: "react-architecture-scale",
  num: "A16",
  title: "Architecture at scale",
  short: "Architecture at scale",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Organising by feature, drawing boundaries, and the decisions that are hard to reverse.",
  body: `<h3>Organise by feature, not by kind</h3>
<pre><code><span class="c">// ✗ every change touches five folders</span>
components/  hooks/  utils/  types/  api/

<span class="c">// ✓ a feature is one folder, deletable in one move</span>
src/
  features/
    checkout/
      components/  hooks/  api.ts  types.ts  index.ts
    catalogue/
  shared/
    ui/  hooks/  lib/
  app/</code></pre>
<p>
  Grouping by kind means a feature is scattered across the tree and nobody can
  tell what belongs to what. Grouping by feature means the answer to "can I
  delete this?" is visible, and a new person can be pointed at one folder.
</p>

<h3>The boundary rules that stop it decaying</h3>
<ul>
  <li>A feature may import from <code>shared/</code>. It <b>must not</b> import from another feature's internals.</li>
  <li>If two features need the same thing, it moves to <code>shared/</code> &mdash; a deliberate promotion, not a shortcut import.</li>
  <li>Each feature exposes a small <code>index.ts</code>. Everything else is private.</li>
</ul>
<pre><code><span class="c">// eslint-plugin-boundaries or an import/no-restricted-paths rule</span>
"no-restricted-imports": ["error", {
  patterns: ["@/features/*/!(index)"]     <span class="c">// only the public entry</span>
}]</code></pre>
<p>
  Conventions decay; lint rules do not. One rule that fails the build is worth
  more than a paragraph in a README nobody reads twice.
</p>

<div class="bx is-prim">
  <span class="ttl">Layers, not just folders</span>
  <p>
    <b>UI</b> renders and handles interaction. <b>Domain</b> holds the rules
    &mdash; pricing, permissions, validation &mdash; as plain functions with no
    React in them. <b>Data</b> talks to the network. The value of separating
    them is that the domain becomes testable without rendering anything, and
    swapping REST for GraphQL touches one layer.
  </p>
</div>

<h3>The dependency direction</h3>
<pre><code>app  →  features  →  shared        <span class="c">// ✓ one direction, always</span></code></pre>
<p>
  <code>shared/</code> must never import from <code>features/</code>. The moment
  it does, everything depends on everything, imports go circular, and the build
  graph stops meaning anything. This is the rule worth enforcing above all
  others.
</p>

<h3>Monorepos</h3>
<div class="table-scroll"><table>
<thead><tr><th>Worth it when</th><th>Not worth it when</th></tr></thead>
<tbody>
<tr><td>Several apps share a component library</td><td>One app</td></tr>
<tr><td>Types are shared between frontend and backend</td><td>Nothing is shared</td></tr>
<tr><td>An atomic change must cross packages</td><td>Teams release independently on purpose</td></tr>
</tbody>
</table></div>
<p class="sub">
  The cost is real: CI gets slower without task caching, tooling gets more
  complicated, and versioning between internal packages becomes a decision
  somebody has to own. A workspace with three packages is fine; adopt Turborepo
  or Nx when the CI time makes you.
</p>

<h3>Micro-frontends: usually the wrong answer</h3>
<p>
  Splitting a frontend into independently deployed applications solves an
  <em>organisational</em> problem &mdash; several teams that cannot coordinate
  releases. It costs you a shared runtime, duplicated dependencies, cross-app
  routing and state, and a debugging story that spans repositories.
</p>
<p>
  If you have one team, you do not have the problem it solves. Module federation
  is not a way to make a large codebase feel smaller.
</p>

<h3>Decisions that are expensive to reverse</h3>
<div class="table-scroll"><table>
<thead><tr><th>Decision</th><th>Why it is hard to undo</th></tr></thead>
<tbody>
<tr><td>Framework and rendering model</td><td>Touches every file and every deployment assumption</td></tr>
<tr><td>Styling approach</td><td>Every component; and runtime CSS-in-JS blocks Server Components</td></tr>
<tr><td>State model</td><td>Migrating a store threads through every consumer</td></tr>
<tr><td>Folder structure and boundaries</td><td>Every import; and imports encode assumptions</td></tr>
<tr><td>The data layer's shape</td><td>Every component that fetches</td></tr>
</tbody>
</table></div>
<p>
  Spend real time on these five. Everything else &mdash; which date library, which
  icon set, whether a component takes three props or four &mdash; is cheap to
  change and not worth a meeting.
</p>

<h3>Write the reasons down</h3>
<pre><code>docs/decisions/
  0003-server-components-for-the-catalogue.md</code></pre>
<p>
  One short file per significant decision: the context, the options, the choice,
  and the trade accepted. Six months later, when someone asks why the app is not
  using the obvious thing, the answer exists &mdash; and if the context has
  changed, the decision can be revisited on purpose rather than drifted away
  from.
</p>

<h3>Guardrails over discipline</h3>
<ul>
  <li><b>Lint the import boundaries</b> so a violation fails CI.</li>
  <li><b>Budget the bundle</b> in CI, so a regression is caught the day it lands.</li>
  <li><b>Enforce the type checker</b> on every push, with <code>strict</code> on.</li>
  <li><b>Codeowners on <code>shared/</code></b>, because that is where accidental coupling enters.</li>
</ul>
<p>
  Every one of these replaces a rule people are expected to remember with one a
  machine checks.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Organise by feature so a feature is one deletable folder, keep the
    dependency direction one-way — app to features to shared, never back — and
    enforce that with a lint rule rather than a convention. Then spend the real
    thinking on the five decisions that are expensive to reverse, and write down
    why each was made."
  </p>
</div>`,
};
