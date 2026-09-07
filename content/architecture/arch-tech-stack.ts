import type { Chapter } from "../types";

export const archTechStack: Chapter = {
  id: "arch-tech-stack",
  num: "B2",
  title: "The tech stack",
  short: "The tech stack",
  levels: ["beginner"],
  practice: [],
  ready: true,
  subtitle: "Every dependency, what it does here, and what it would cost to remove.",
  body: `<h3>The frame</h3>
<div class="table-scroll"><table>
<thead><tr><th>Thing</th><th>Version</th><th>What it does here</th></tr></thead>
<tbody>
<tr><td><b>Next.js</b> (App Router)</td><td>16</td><td>Routing, the build, static generation, the server/client split</td></tr>
<tr><td><b>React</b></td><td>19</td><td>Components, and server components for everything that does not need a browser</td></tr>
<tr><td><b>TypeScript</b></td><td>5.9</td><td>Not only the code — the content is typed too, so a malformed chapter fails the build</td></tr>
<tr><td><b>Plain CSS</b></td><td>&mdash;</td><td>One stylesheet of custom properties. Tailwind is installed but the site is written in tokens</td></tr>
<tr><td><b>Vercel</b></td><td>&mdash;</td><td>Host, CDN, firewall, analytics</td></tr>
<tr><td><b>Node</b></td><td>22.x</td><td>Pinned in <code>engines</code> and in <code>.nvmrc</code>, so CI and the host agree</td></tr>
</tbody>
</table></div>

<h3>The playground</h3>
<div class="table-scroll"><table>
<thead><tr><th>Thing</th><th>What it does here</th><th>Weight</th></tr></thead>
<tbody>
<tr><td><b>CodeMirror 6</b></td><td>The editor, with language support for nine syntaxes</td><td>~1.3 MB, lazy</td></tr>
<tr><td><b>Pyodide</b></td><td>CPython compiled to WebAssembly, so Python runs in the browser</td><td>15 MB, only if you pick Python</td></tr>
<tr><td><b>sql.js</b></td><td>SQLite compiled to WebAssembly</td><td>1.5 MB, only if you pick SQL</td></tr>
<tr><td><b>TypeScript lib files</b></td><td>Type definitions the in-browser compiler needs</td><td>1.2 MB, only for TypeScript</td></tr>
</tbody>
</table></div>
<p>
  None of the three runtimes is fetched unless a reader actually chooses that language. They are
  copied into <code>public/</code> by a prebuild script, so they cost deploy size and build time and
  nothing at all at runtime.
</p>

<h3>Small pieces</h3>
<ul>
<li><b>msedge-tts</b> — the narrator's voice. Unofficial, free, and the one real single point of failure on the site. See <a href="/architecture/arch-apis">the endpoints chapter</a>.</li>
<li><b>Radix focus scope</b> — one primitive, used to trap focus in the mobile drawer. Loaded dynamically, so it is not in the bundle until a drawer opens.</li>
<li><b>Vercel Analytics and Speed Insights</b> — pageviews and field Core Web Vitals.</li>
</ul>

<h3>The tools that never reach a reader</h3>
<div class="table-scroll"><table>
<thead><tr><th>Tool</th><th>What it catches</th></tr></thead>
<tbody>
<tr><td><b>ESLint</b> + <code>eslint-config-next</code></td><td>The usual, plus Next-specific mistakes</td></tr>
<tr><td><b>Prettier</b></td><td>Formatting, with the hand-authored data files ignored on purpose</td></tr>
<tr><td><b>cspell</b></td><td>Spelling across 354 files, including all the prose</td></tr>
<tr><td><b>Vitest</b></td><td>15 tests, and they check the <em>content</em> rather than the code</td></tr>
<tr><td><b>Playwright</b> + <b>axe</b></td><td>30 end-to-end tests, including accessibility on 14 pages</td></tr>
<tr><td><b>Lighthouse CI</b></td><td>Performance budgets set just under what the site measures</td></tr>
<tr><td><b>husky</b> + <b>lint-staged</b></td><td>Runs the fast half of that on every commit</td></tr>
</tbody>
</table></div>

<div class="bx is-prim">
<span class="ttl">What is not here, deliberately</span>
<p>
  No state management library — <code>useSyncExternalStore</code> over a small storage module covers
  it. No component library — the site has its own vocabulary and one stylesheet. No ORM, because
  there is no database. No CMS, because the content is the repository. Each absence is a decision
  explained later in these chapters, not an omission.
</p>
</div>`,
};
