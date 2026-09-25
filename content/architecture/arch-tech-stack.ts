import type { Chapter } from "../types";

export const archTechStack: Chapter = {
  id: "arch-tech-stack",
  num: "B2",
  title: "The tech stack",
  short: "The tech stack",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Every dependency, what it does here, where it runs, and what it would cost to remove.",
  body: `<h3>The frame</h3>
<p>
  <code>package.json</code> lists 43 runtime dependencies and 16 development ones. That sounds like a
  lot for a static site, and it is: 20 of the 43 are <code>@codemirror/</code> packages, and most of the
  rest exist for the editor. The frame the site actually sits in is small.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Thing</th><th>Version</th><th>What it does here</th></tr></thead>
<tbody>
<tr><td><b>Next.js</b> (App Router)</td><td>16.3.0</td><td>Routing, the build, static generation, metadata routes, the server/client split</td></tr>
<tr><td><b>React</b></td><td>19.2.8</td><td>Components; server components for everything that does not need a browser</td></tr>
<tr><td><b>TypeScript</b></td><td>5.9.3</td><td>Types the code and the content, so a malformed chapter fails the build. The same package also runs in the browser as the playground's TypeScript compiler</td></tr>
<tr><td><b>CSS</b></td><td>&mdash;</td><td><code>app/globals.css</code> at 9,319 lines, plus 7 CSS modules for the newer full-screen tools</td></tr>
<tr><td><b>Tailwind</b></td><td>4</td><td>Imported for its theme and utilities layers only, with no preflight reset. The site is styled with custom properties and its own class names</td></tr>
<tr><td><b>Vercel</b></td><td>&mdash;</td><td>Host, CDN, firewall, analytics</td></tr>
<tr><td><b>Node</b></td><td>22.x</td><td>Pinned in <code>engines</code>, and to 22.11.0 in <code>.nvmrc</code>, so CI and the host agree</td></tr>
</tbody>
</table></div>

<h3>The editor</h3>
<p>
  The playground's editor is CodeMirror 6, mounted through <code>@uiw/react-codemirror</code> in
  <code>components/practice/CodeEditor.tsx</code>. <code>lib/codeLanguages.ts</code> lists 17 languages,
  and each one's syntax support is a dynamic <code>import()</code>, so choosing Rust downloads the Rust
  grammar and nothing else. Kotlin, Swift, C#, Ruby and Lua use the older stream parsers from <code>@codemirror/legacy-modes</code>. Three packages from
  Replit add a Vim mode, a minimap and indentation guides.
</p>
<p>
  The editor's tooling runs off the main thread. <code>lib/editor/toolsWorker.ts</code> is a Web Worker
  that loads <code>eslint-linter-browserify</code> with the <code>globals</code> package for linting,
  Prettier's standalone build for formatting, and the TypeScript compiler for type errors. That is why
  Prettier appears under <code>dependencies</code> rather than <code>devDependencies</code>: it is not
  only a tool the repository runs on itself, it ships to readers.
</p>

<h3>The runtimes</h3>
<p>
  Eleven of the 17 languages run. None of them runs on a server. Each one is loaded the first time a
  reader picks it, and most of them come from jsDelivr rather than from this site.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Language</th><th>What runs it</th><th>Served from</th><th>Runs in</th></tr></thead>
<tbody>
<tr><td>JavaScript</td><td>The browser's own engine</td><td>&mdash;</td><td><code>jsWorker</code>, a Web Worker</td></tr>
<tr><td>TypeScript</td><td>The <code>typescript</code> package, type-checking against 46 lib files, then run as JavaScript</td><td>This site: <code>/wasm/typescript-lib/</code>, 1.2 MB</td><td>Compiled in the page, run in <code>jsWorker</code></td></tr>
<tr><td>Python</td><td>Pyodide 314.0.6</td><td>jsDelivr</td><td><code>pyodideWorker</code></td></tr>
<tr><td>SQL</td><td>sql.js 1.14.2, SQLite compiled to WebAssembly</td><td>The glue is bundled; the <code>.wasm</code> comes from jsDelivr</td><td>The page</td></tr>
<tr><td>Ruby</td><td>ruby.wasm 2.10.1 with Ruby 3.4</td><td>jsDelivr</td><td><code>scriptWorker</code></td></tr>
<tr><td>PHP</td><td>php-wasm 0.1.0</td><td>jsDelivr</td><td><code>scriptWorker</code></td></tr>
<tr><td>Lua</td><td>wasmoon 1.16.0</td><td>jsDelivr</td><td><code>scriptWorker</code></td></tr>
<tr><td>C, C++</td><td>clang from <code>@yowasp/clang</code>, run on a WASI shim</td><td>jsDelivr</td><td><code>scriptWorker</code></td></tr>
<tr><td>HTML, CSS</td><td>The browser</td><td>&mdash;</td><td>A sandboxed preview iframe</td></tr>
<tr><td>React components</td><td><code>react-sandbox.js</code>, 204 KB, bundled by esbuild from <code>lib/reactSandbox/</code></td><td>This site: <code>/wasm/</code></td><td>An iframe with <code>sandbox="allow-scripts"</code></td></tr>
<tr><td>Java, Go, Rust, Kotlin, Swift, C#</td><td>Nothing</td><td>&mdash;</td><td>Write-only: highlighted, formatted, not run</td></tr>
</tbody>
</table></div>

<figure>
<svg viewBox="0 0 900 340" class="dg" role="img" aria-label="The page sends code to four Web Workers: jsWorker for JavaScript, pyodideWorker for Python, scriptWorker for Ruby, PHP, Lua, C and C++, and toolsWorker for linting and formatting. Web pages and React components run in sandboxed iframes. jsDelivr supplies the Python and script runtimes; this site supplies the TypeScript lib files and the React sandbox.">
<g class="rough">
<rect x="30" y="110" width="190" height="90" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
<rect x="30" y="260" width="190" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
<rect x="300" y="20" width="260" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="300" y="90" width="260" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="300" y="160" width="260" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="300" y="230" width="260" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
<rect x="640" y="80" width="230" height="90" rx="10" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<rect x="640" y="220" width="230" height="90" rx="10" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
<path class="ln" d="M220 135 C262 135 258 48 294 48" marker-end="url(#arrow)" />
<path class="ln" d="M220 148 C262 148 258 118 294 118" marker-end="url(#arrow)" />
<path class="ln" d="M220 162 C262 162 258 188 294 188" marker-end="url(#arrow)" />
<path class="ln" d="M220 176 C262 176 258 258 294 258" marker-end="url(#arrow)" />
<path class="ln" d="M125 200 V254" marker-end="url(#arrow)" />
<path class="ln" d="M640 112 H566" marker-end="url(#arrow)" />
<path class="ln" d="M640 140 C600 140 600 188 566 188" marker-end="url(#arrow)" />
<path class="ln" d="M640 258 H566" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="125" y="146" text-anchor="middle">The page</text>
<text class="sm" x="125" y="168" text-anchor="middle">CodeMirror, SQL,</text>
<text class="sm" x="125" y="186" text-anchor="middle">TypeScript compile</text>
<text class="lbl" x="125" y="288" text-anchor="middle">Sandboxed iframes</text>
<text class="sm" x="125" y="310" text-anchor="middle">HTML and CSS, React</text>
<text class="lbl" x="316" y="44">jsWorker</text>
<text class="sm" x="316" y="64">JavaScript, and compiled TS</text>
<text class="lbl" x="316" y="114">pyodideWorker</text>
<text class="sm" x="316" y="134">Python</text>
<text class="lbl" x="316" y="184">scriptWorker</text>
<text class="sm" x="316" y="204">Ruby, PHP, Lua, C, C++</text>
<text class="lbl" x="316" y="254">toolsWorker</text>
<text class="sm" x="316" y="274">lint, format, type errors</text>
<text class="lbl" x="656" y="106">jsDelivr</text>
<text class="sm" x="656" y="128">Pyodide, ruby.wasm,</text>
<text class="sm" x="656" y="146">php-wasm, wasmoon, clang</text>
<text class="lbl" x="656" y="246">This site's /wasm/</text>
<text class="sm" x="656" y="268">46 TypeScript lib files</text>
<text class="sm" x="656" y="286">react-sandbox.js</text>
</svg>
<figcaption>
  Four workers, two kinds of iframe, and the page itself. The TypeScript lib files are also what the
  page's own compiler reads, and sql.js fetches its <code>.wasm</code> from jsDelivr straight into the
  page.
</figcaption>
</figure>

<h3>Why the runtimes come from a CDN</h3>
<p>
  Pyodide and sql.js used to be copied into <code>public/wasm/</code> by a prebuild script and shipped
  with every deploy. The commit that moved them to jsDelivr records why: <code>public/wasm/</code> was
  18 MB, Vercel keeps every deployment, and the project had gone over its storage allowance on two
  runtimes that only load when someone picks Python or SQL. After the move the folder was 1.3 MB, just the
  TypeScript lib files. The Ruby, PHP, Lua and clang runtimes were added the same way from the start. The
  trade is plain: deploys got small, and in exchange the Python and C++ paths depend on a third party
  being up. <code>tests/wasm-assets.test.ts</code> fails if the pinned versions drift from what is
  installed. <code>lib/wasmAssets.ts</code> holds every version and URL in one place, the
  <code>NEXT_PUBLIC_PYODIDE_BASE</code>, <code>NEXT_PUBLIC_SQL_JS_BASE</code> and
  <code>NEXT_PUBLIC_NPM_CDN</code> variables can point them somewhere else, and
  <code>scripts/copy-wasm-assets.mjs --all</code> still knows how to self-host Pyodide and sql.js. The
  Content-Security-Policy in <code>next.config.ts</code> is built from the same list, so adding a runtime
  origin in one place allows it in the other.
</p>

<h3>Small pieces</h3>
<ul>
<li><b>msedge-tts</b> &mdash; the narrator's voice, behind <code>/api/tts</code>. Unofficial, free, and the one real single point of failure among the server functions. See <a href="/architecture/arch-apis">the endpoints chapter</a>.</li>
<li><b>Radix</b> &mdash; <code>@radix-ui/react-focus-scope</code> traps focus in the sidebar drawer and the shortcut help, loaded dynamically. The <code>radix-ui</code> package supplies one component, the Select in <code>components/ui/select.tsx</code>, used by four files.</li>
<li><b>clsx</b> and <b>tailwind-merge</b> &mdash; one helper, <code>cn()</code> in <code>lib/utils.ts</code>, for that Select. <code>class-variance-authority</code> is also installed, but nothing imports it.</li>
<li><b>next/font</b> &mdash; 13 Google font families behind the 7 font styles in the display picker, alongside 9 colour themes.</li>
<li><b>Vercel Analytics and Speed Insights</b> &mdash; pageviews and field Core Web Vitals.</li>
<li><b>@sentry/nextjs</b> &mdash; imported only when <code>NEXT_PUBLIC_SENTRY_DSN</code> is set. Without it, browser errors are posted to <code>/api/client-error</code> and land in the function log instead.</li>
</ul>

<h3>The tools that never reach a reader</h3>
<div class="table-scroll"><table>
<thead><tr><th>Tool</th><th>What it catches</th></tr></thead>
<tbody>
<tr><td><b>ESLint</b> + <code>eslint-config-next</code></td><td>The usual, plus Next-specific mistakes</td></tr>
<tr><td><b>Prettier</b></td><td>Formatting, with <code>content/interview-data.ts</code> and <code>content/practice/</code> ignored on purpose</td></tr>
<tr><td><b>cspell</b></td><td>Spelling across every file, including all the prose</td></tr>
<tr><td><b>Vitest</b></td><td>15 test files. Among them: the content's integrity, the site's claims about itself, SEO metadata, and the pure engines behind the mock interview, the grader, the debugger and the whiteboard</td></tr>
<tr><td><b>Playwright</b> + <b>axe</b></td><td>3 specs against a production build: smoke, accessibility, and the whiteboard</td></tr>
<tr><td><b>Lighthouse CI</b></td><td>Performance budgets, run three times in CI so one slow runner cannot fail them</td></tr>
<tr><td><b>esbuild</b></td><td>Bundles the React sandbox before every build</td></tr>
<tr><td><b>husky</b> + <b>lint-staged</b></td><td>Lint, format and spell-check staged files on commit; reject code comments on push</td></tr>
</tbody>
</table></div>

<div class="bx is-prim">
<span class="ttl">What is not here, deliberately</span>
<p>
  No state management library: <code>useSyncExternalStore</code> over small storage modules covers it.
  No component library beyond that one Select: the site has its own vocabulary and its own stylesheet.
  No ORM, because there is no database. No CMS, because the content is the repository. No auth, because
  there is nothing per-user on the server. And no code-execution service: every language that runs, runs
  in the reader's tab, which is why the playground costs nothing to operate however much it is used.
</p>
</div>`,
};
