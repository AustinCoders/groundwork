import type { Chapter } from "../types";

export const reactMigration: Chapter = {
  id: "react-migration",
  num: "A18",
  title: "Migrating and upgrading",
  short: "Migrating & upgrading",
  levels: ["advanced"],
  practice: [],
  ready: true,
  subtitle: "Nobody rewrites a working application. The skill is moving it while it keeps shipping.",
  body: `<h3>The question you will actually be asked</h3>
<p>
  "We have a four-year-old React app. Two hundred thousand lines, class
  components in the older half, Redux holding server data, on React 17. How do
  you modernise it?" The wrong answer is a rewrite. The right answer is an
  order, a way to measure progress, and a story for the parts you will never
  touch.
</p>

<div class="bx is-prim">
  <span class="ttl">Why the rewrite loses</span>
  <p>
    A rewrite competes with a codebase that is already correct about a thousand
    edge cases nobody wrote down, while the original keeps moving. You ship
    nothing for months, then ship something worse. The strangler pattern &mdash;
    new code in the new style, old code migrated when it is touched anyway
    &mdash; keeps the application shippable the whole way.
  </p>
</div>

<h3>The order that works</h3>
<ol>
  <li><b>Get on a supported version first.</b> Everything else is easier from React 18+, and the upgrade itself is usually small.</li>
  <li><b>Take server state out of Redux.</b> Usually the single biggest win: a query library deletes thousands of lines of actions, reducers and loading flags, and fixes caching you were never going to write.</li>
  <li><b>Adopt TypeScript file by file,</b> with <code>allowJs</code> on. Never as a big-bang conversion.</li>
  <li><b>Convert classes only when you are already in the file.</b> A working class component is not a bug.</li>
  <li><b>Then consider the framework move,</b> if there is a real reason for it.</li>
</ol>

<h3>Version by version, what actually breaks</h3>
<div class="table-scroll"><table>
<thead><tr><th>Upgrade</th><th>Breaks</th></tr></thead>
<tbody>
<tr><td>16 → 17</td><td>Almost nothing. Event delegation moved from <code>document</code> to the root container, which breaks code mixing React and native listeners.</td></tr>
<tr><td>17 → 18</td><td><code>ReactDOM.render</code> → <code>createRoot</code>. Automatic batching now applies in timeouts and promises, so code relying on separate renders changes behaviour. Strict Mode double-invokes effects.</td></tr>
<tr><td>18 → 19</td><td><code>propTypes</code> and <code>defaultProps</code> removed for function components. String refs gone. <code>forwardRef</code> no longer needed. New JSX transform required.</td></tr>
</tbody>
</table></div>
<pre><code>npx codemod@latest react/19/migration-recipe     <span class="c">// does most of the mechanical work</span></code></pre>
<p class="sub">
  Run the codemods, read the diff, and do not trust them blindly &mdash; they
  are excellent at renames and poor at judgement.
</p>

<h3>Class to function, honestly</h3>
<div class="table-scroll"><table>
<thead><tr><th>Class</th><th>Function</th></tr></thead>
<tbody>
<tr><td><code>this.state</code>, <code>setState</code></td><td><code>useState</code>, or <code>useReducer</code> for related fields</td></tr>
<tr><td><code>componentDidMount</code></td><td><code>useEffect(fn, [])</code></td></tr>
<tr><td><code>componentDidUpdate</code></td><td><code>useEffect(fn, [deps])</code></td></tr>
<tr><td><code>componentWillUnmount</code></td><td>the cleanup return</td></tr>
<tr><td><code>shouldComponentUpdate</code></td><td><code>memo</code></td></tr>
<tr><td><code>getDerivedStateFromError</code></td><td>still a class &mdash; error boundaries have no hook</td></tr>
</tbody>
</table></div>
<p>
  The table is the easy half. The trap is that
  <code>componentDidUpdate</code> often held logic comparing previous and next
  props, and the mechanical translation is an effect that runs at the wrong
  times. Ask what the code is <em>synchronising with</em> rather than
  transliterating the lifecycle &mdash; frequently the answer is that it should
  not be an effect at all.
</p>

<h3>Redux to a query cache</h3>
<pre><code><span class="c">// before: 4 files, ~120 lines, for one endpoint</span>
actions/users.js  reducers/users.js  selectors/users.js  sagas/users.js

<span class="c">// after</span>
const { data } = useQuery({ queryKey: ["users"], queryFn: getUsers });</code></pre>
<p>
  Do it one slice at a time, keeping both alive. The store stays for genuine
  client state &mdash; and once the server slices are gone, there is often so
  little left that the store itself can go too.
</p>

<h3>Adopting Server Components without stopping</h3>
<ol>
  <li>Move to the framework's new router with everything marked <code>"use client"</code>. Nothing changes behaviourally; you now have the door.</li>
  <li>Push the directive <b>down</b> the tree, one layout at a time. Each push turns a subtree into server-rendered output.</li>
  <li>Move data fetching from effects into the server components that now exist above them.</li>
  <li>Delete the API routes that existed only so the browser could reach the database.</li>
</ol>
<p>
  Each step is shippable on its own and reversible. Measure the client bundle
  after each one &mdash; if it is not falling, the directive is not moving.
</p>

<h3>Measuring that it is working</h3>
<div class="table-scroll"><table>
<thead><tr><th>Metric</th><th>Tells you</th></tr></thead>
<tbody>
<tr><td>Files with <code>"use client"</code></td><td>How much is still client-side, as one number</td></tr>
<tr><td>Class components remaining</td><td>Progress, and it should only fall</td></tr>
<tr><td>Client bundle size</td><td>Whether the migration is buying anything</td></tr>
<tr><td>TypeScript coverage, or files still <code>.js</code></td><td>The typed fraction</td></tr>
</tbody>
</table></div>
<p>
  Put these in CI. A migration without a number nobody can see is a migration
  that stalls quietly six weeks in, and the only person who notices is the one
  who started it.
</p>

<h3>What to leave alone</h3>
<p>
  Code that works, is not touched, and nobody is asking about. An admin screen
  three people use, written in classes, with no bugs, is not technical debt
  &mdash; it is finished software. Migrating it costs real time and buys
  nothing. Say that out loud in the interview; it is the answer that separates
  someone who has run a migration from someone who has read about one.
</p>

<div class="bx is-ref">
  <span class="ttl">Interview answer, one sentence</span>
  <p>
    "Strangler, not rewrite: get onto a supported version, move server state out
    of Redux into a query cache — usually the biggest single win — adopt
    TypeScript file by file, and convert classes only when you are already in
    the file. Put the progress numbers in CI, and leave alone the code that
    works and nobody touches."
  </p>
</div>`,
};
