import type { Chapter } from "../types";

export const modulesTooling: Chapter = {
  id: "modules-tooling",
  num: "I5",
  title: "Modules & tooling",
  short: "Modules & tooling",
  levels: ["intermediate"],
  practice: ["ex-semver-satisfies", "ex-pipe"],
  ready: true,
  subtitle: "Everything that turns files full of JS into one thing a browser can run.",
  body: `<p>
  Nothing in this chapter runs in the sandbox above the way earlier
  <code>.try</code> blocks did — <code>import</code>/<code>export</code>
  are only valid inside a real module, not inside an arbitrary function
  body, so every example here is read, not clicked.
</p>

<h3>ESM — import and export</h3>
<pre><code><span class="c">// math.js</span>
export const PI = 3.14159;
export function square(n) { return n * n; }
export default function add(a, b) { return a + b; }   <span class="c">// at most ONE default per module</span>

<span class="c">// app.js</span>
import add, { PI, square } from "./math.js";   <span class="c">// default + named, one import statement</span>
import * as math from "./math.js";              <span class="c">// everything, under one namespace object</span></code></pre>
<div class="sticky mint">
  <span class="ttl">Rule</span> An imported binding is a
  <b>live view</b> into the exporting module, not a value copied once
  at import time. If <code>math.js</code> later reassigns an exported
  <code>let</code>, every file that imported it sees the new value —
  the same "reference, not snapshot" idea from
  <a href="/notes/objects-arrays-basics">objects and arrays</a>,
  applied to module bindings instead of object properties.
</div>
<p>
  This live-binding rule, plus imports being <b>static</b> — resolved
  before any module code runs, always at the top level, never
  conditional — is exactly what lets a bundler safely
  <b>tree-shake</b>: it can see every import/export at compile time and
  delete anything nothing else actually uses, something CommonJS's
  fully dynamic <code>require()</code> can't guarantee.

</p>

<h3>CommonJS vs ESM</h3>
<table>
  <tr>
    <th></th>
    <th>CommonJS (Node's original)</th>
    <th>ESM</th>
  </tr>
  <tr><td>Syntax</td><td><code>require()</code> / <code>module.exports</code></td><td><code>import</code> / <code>export</code></td></tr>
  <tr><td>Loading</td><td>synchronous</td><td>can be async (dynamic <code>import()</code>)</td></tr>
  <tr><td>Resolved</td><td>at runtime, can be conditional</td><td>statically, before execution</td></tr>
  <tr><td>Top-level <code>this</code></td><td><code>module.exports</code></td><td><code>undefined</code></td></tr>
  <tr><td>File markers</td><td><code>.cjs</code>, or default in a plain <code>package.json</code></td><td><code>.mjs</code>, or <code>"type": "module"</code> in <code>package.json</code></td></tr>
</table>
<p class="sub">
  Node runs both today; browsers only ever understood ESM
  (<code>&lt;script type="module"&gt;</code>). ESM is the forward
  direction — new libraries default to it, and most tooling exists
  partly to smooth over the gap for code still shipping CommonJS.
</p>

<h3>Dynamic import()</h3>
<pre><code>button.addEventListener("click", async () =&gt; {
  const { openModal } = await import("./modal.js");   <span class="c">// only fetched when actually needed</span>
  openModal();
});</code></pre>
<p class="sub">
  Unlike a static <code>import</code>, this one is a real function call
  — it can go inside an <code>if</code>, a click handler, anywhere —
  and it returns a promise. This is the mechanism behind
  <b>code splitting</b>: a bundler sees a dynamic <code>import()</code>
  and automatically cuts that module (and everything only it needs)
  into its own separate file, downloaded only when that line actually
  runs, instead of bloating the very first page load with code most
  visitors may never trigger.
</p>

<h3>npm, package.json, semver</h3>
<pre><code>{
  "name": "my-app",
  "version": "1.4.2",
  "dependencies": { "react": "^18.2.0" },
  "devDependencies": { "vitest": "^4.1.10" }
}</code></pre>
<p>
  A version is <code>MAJOR.MINOR.PATCH</code> — <b>major</b> for
  breaking changes, <b>minor</b> for new, backward-compatible features,
  <b>patch</b> for backward-compatible fixes. The prefix in front of a
  dependency's version controls how far an install is allowed to drift:
</p>
<table>
  <tr>
    <th>Range</th>
    <th>Allows</th>
  </tr>
  <tr><td><code>^18.2.0</code></td><td>anything up to, not including, <code>19.0.0</code> — new minors and patches, never a new major</td></tr>
  <tr><td><code>~18.2.0</code></td><td>anything up to, not including, <code>18.3.0</code> — patches only</td></tr>
  <tr><td><code>18.2.0</code></td><td>that exact version, nothing else</td></tr>
</table>
<div class="warn">
  <span class="ttl">⚠ package.json alone isn't reproducible</span>
  <code>^18.2.0</code> is a range, not one specific version — two
  installs weeks apart can legitimately resolve to different actual
  versions. <code>package-lock.json</code> (or <code>yarn.lock</code>,
  <code>pnpm-lock.yaml</code>) pins the <em>exact</em> resolved tree,
  which is why it's committed to the repo and why "works on my
  machine" so often traces back to a missing or ignored lockfile.
</div>

<h3>A bundler, briefly</h3>
<p>
  A bundler (Vite, webpack, esbuild, Rollup) does three jobs at once:
  follows every <code>import</code> to build one dependency graph,
  <b>transpiles</b> newer syntax and JSX/TS down to something the
  target browsers understand, and packs the result into as few files
  as make sense (splitting where a dynamic <code>import()</code> says
  to). The <b>source map</b> it emits alongside the bundle is what lets
  a browser's DevTools show your original <code>Button.tsx</code> and
  its real line numbers in a stack trace, instead of line 1 of one
  giant minified file.
</p>

<h3>Linting and formatting</h3>
<p>
  Two different jobs, often confused because they're configured
  together. <b>ESLint</b> reads your code for actual
  <em>problems</em> — an unused variable, a missing dependency in a
  React hook, a variable that shadows an outer one by accident.
  <b>Prettier</b> doesn't look for problems at all — it just rewrites
  every file into one consistent style (quotes, spacing, line length),
  so a diff shows what actually changed instead of a formatting
  argument. Running both: Prettier decides how the code looks, ESLint
  decides whether the code is right.
</p>`,
};
