export const ARCHITECTURE_SECTIONS: { id: string; num: string; title: string }[] = [
  { id: "shape", num: "A1", title: "The shape of it" },
  { id: "request", num: "A2", title: "Opening a page" },
  { id: "build", num: "A3", title: "How the pages are made" },
  { id: "model", num: "A4", title: "The content model" },
  { id: "state", num: "A5", title: "Where state lives" },
  { id: "sandbox", num: "A6", title: "Running your code" },
  { id: "edges", num: "A7", title: "What leaves the building" },
  { id: "breaks", num: "A8", title: "What breaks first" },
];

export const ARCHITECTURE_BODY_HTML = `
<svg width="0" height="0" style="position: absolute" aria-hidden="true" focusable="false">
  <filter id="wob">
    <feTurbulence type="fractalNoise" baseFrequency="0.022" numOctaves="3" seed="7" result="n" />
    <feDisplacementMap in="SourceGraphic" in2="n" scale="2.4" xChannelSelector="R" yChannelSelector="G" />
  </filter>
  <marker id="arrow" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" style="fill: var(--ink)" />
  </marker>
  <marker id="arrow-green" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" style="fill: var(--green)" />
  </marker>
  <marker id="arrow-red" viewBox="0 0 10 10" refX="8.5" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
    <path d="M0 0 L10 5 L0 10 z" style="fill: var(--red)" />
  </marker>
</svg>

<section class="sheet hero" id="top">
  <span class="hero__kicker">how this site is built · a worked example</span>
  <h1>The system design of <em>this</em> site.</h1>
  <p class="hero__lead">
    Every other page here explains somebody else's system. This one explains its own — the request
    path, the build, where state lives, and what would break first. Every number on this page was
    measured against the running site rather than estimated, including the ones that are
    unflattering.
  </p>

  <figure>
    <svg viewBox="0 0 900 348" class="dg" role="img" aria-label="Three layers: the reader's browser at the top, the Vercel edge in the middle, and the build output at the bottom. The edge answers requests; the build output is deployed into it.">
      <g class="rough">
        <rect x="30" y="16" width="840" height="72" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
        <rect x="30" y="136" width="840" height="84" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="30" y="268" width="840" height="60" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="470" y="152" width="180" height="52" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="668" y="152" width="186" height="52" rx="9" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
        <path class="ln" d="M300 136 V96" marker-end="url(#arrow)" />
        <path class="ln" d="M300 268 V228" marker-end="url(#arrow)" />
      </g>
      <text class="sm" x="46" y="38">THE READER</text>
      <text class="lbl" x="46" y="70">Browser &middot; HTML, one JS bundle, localStorage</text>

      <text class="sm" x="46" y="158">VERCEL EDGE</text>
      <text class="lbl" x="46" y="190">CDN cache + firewall</text>
      <text class="sm" x="560" y="183" text-anchor="middle">559 static pages</text>
      <text class="sm" x="761" y="183" text-anchor="middle">4 API functions</text>

      <text class="sm" x="46" y="290">BUILT AHEAD OF TIME</text>
      <text class="lbl" x="46" y="316">TypeScript content files &rarr; HTML, search indexes, sitemap</text>

      <text class="sm" x="318" y="118">answers every request</text>
      <text class="sm" x="318" y="252">deployed into the edge</text>
    </svg>
    <figcaption>
      Three layers, and the top two are the only ones that exist at request time. Everything in the
      green band happened before a reader arrived.
    </figcaption>
  </figure>

  <div class="hero__actions">
    <a class="btn btn--primary btn--big" href="#request">Follow one request &rarr;</a>
    <a class="btn btn--big" href="#breaks">Skip to what breaks</a>
  </div>
</section>

<section class="sheet chapter" id="shape" aria-labelledby="shape-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A1</span>
    <h2 id="shape-title">The shape of it</h2>
  </div>

  <p>
    This is a reading site with a code playground attached. The design decision that produced
    everything else was to make it <strong>a build artifact rather than an application</strong>: the
    content lives in TypeScript files in the repository, the whole site is rendered to HTML at build
    time, and a CDN serves it. There is no database, no session, no cache layer of our own, and
    nothing to keep alive between deploys.
  </p>

  <p>
    That has one obvious cost and one large benefit. The cost is that publishing a typo fix is a
    deploy. The benefit is that the interesting parts of this system are the parts that
    <em>do not run</em> — and a system that does not run cannot fall over.
  </p>

  <div class="table-scroll"><table>
    <thead><tr><th>What it is</th><th>Measured</th></tr></thead>
    <tbody>
      <tr><td>Prerendered pages</td><td>559</td></tr>
      <tr><td>Server functions</td><td>4, all under <code>/api/</code></td></tr>
      <tr><td>Databases</td><td>0</td></tr>
      <tr><td>Written chapters</td><td>112 across 4 topics, plus 399 outlines</td></tr>
      <tr><td>Exercises with tests</td><td>299</td></tr>
      <tr><td>Build time</td><td>about 12.5 seconds</td></tr>
      <tr><td>Home page over the wire</td><td>58 KB of HTML, ~207 KB of JavaScript (brotli)</td></tr>
    </tbody>
  </table></div>

  <p class="sub">
    The four functions are the entire dynamic surface: text-to-speech for the narrator, weather and
    a joke for the sidebar, and an endpoint that collects client errors. Nothing else on the site
    runs on a server while a reader is looking at it.
  </p>
</section>

<section class="sheet chapter" id="request" aria-labelledby="request-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A2</span>
    <h2 id="request-title">What happens when you open a page</h2>
  </div>

  <p>
    The interesting thing about this path is how short it is. For a chapter page nothing executes on
    a server at all — the file was written during the build, and the edge either has it or fetches
    it once and then has it.
  </p>

  <figure>
    <svg viewBox="0 0 900 320" class="dg" role="img" aria-label="A request reaches the Vercel firewall. Page requests go to the CDN cache, which either returns cached HTML or fetches the prerendered file once. Requests under slash api take a separate path to a function, which calls an upstream service.">
      <g class="rough">
        <rect x="24" y="120" width="132" height="62" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="238" y="120" width="130" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="450" y="120" width="176" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="450" y="24" width="176" height="60" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="712" y="120" width="164" height="62" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="450" y="232" width="176" height="62" rx="10" style="fill: var(--sheet); stroke: var(--red); stroke-width: 2" />
        <rect x="712" y="232" width="164" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--red); stroke-width: 1.6" />
        <path class="ln" d="M156 151 H232" marker-end="url(#arrow)" />
        <path class="ln" d="M368 151 H444" marker-end="url(#arrow)" />
        <path class="ln" d="M538 120 V90" marker-end="url(#arrow-green)" style="stroke: var(--green)" />
        <path class="ln" d="M626 151 H706" marker-end="url(#arrow)" />
        <path class="ln" d="M303 182 C303 236 380 263 444 263" marker-end="url(#arrow-red)" style="stroke: var(--red)" />
        <path class="ln" d="M626 263 H706" marker-end="url(#arrow-red)" style="stroke: var(--red)" />
      </g>

      <text class="lbl" x="90" y="146" text-anchor="middle">Browser</text>
      <text class="sm" x="90" y="168" text-anchor="middle">one request</text>

      <text class="lbl" x="303" y="146" text-anchor="middle">Firewall</text>
      <text class="sm" x="303" y="168" text-anchor="middle">100/min per IP</text>

      <text class="lbl" x="538" y="146" text-anchor="middle">CDN cache</text>
      <text class="sm" x="538" y="168" text-anchor="middle">keyed by path</text>

      <text class="lbl gr" x="538" y="48" text-anchor="middle">Cache hit</text>
      <text class="sm" x="538" y="70" text-anchor="middle">HTML straight back</text>

      <text class="lbl" x="794" y="146" text-anchor="middle">Prerendered file</text>
      <text class="sm" x="794" y="168" text-anchor="middle">written at build</text>

      <text class="lbl rd" x="538" y="258" text-anchor="middle">Function</text>
      <text class="sm" x="538" y="280" text-anchor="middle">only under /api/</text>

      <text class="lbl" x="794" y="258" text-anchor="middle">Upstream</text>
      <text class="sm" x="794" y="280" text-anchor="middle">TTS, weather, joke</text>

      <text class="sm gr" x="550" y="106">hit</text>
      <text class="sm" x="666" y="142" text-anchor="middle">miss, once</text>
      <text class="sm rd" x="352" y="222">/api/ only</text>
    </svg>
    <figcaption>
      The green path is what almost every reader gets. A miss costs one fetch of a file that already
      exists — nothing is rendered on demand. The red path exists for four endpoints and nothing else.
    </figcaption>
  </figure>

  <p>
    You can watch this happen. A response from a page here carries
    <code>x-vercel-cache: HIT</code> once the path has been requested at least once in that region —
    the first request in a region is a <code>MISS</code> that fetches the prerendered file, and every
    request after it is served from the edge.
  </p>

  <p>
    After the HTML lands, React hydrates. That is where the JavaScript cost sits, and it is worth
    being precise about: a chapter page downloads about 653 KB of uncompressed JavaScript across 13
    files. That is not small, and it is the number this site has spent the most effort on — the
    sidebar's topic data used to be part of it, the code editor used to be prefetched onto the home
    page, and both have been taken out.
  </p>

  <div class="bx is-ref">
    <span class="ttl">Why the whole site is static</span>
    <p>
      The rule this project holds is that a page route is prerendered unless something makes that
      impossible. Three routes once broke it — the playground, the level picker and the coming-soon
      page were server-rendering on every visit because they read the query string during render.
      Moving that read to the client made all three static, and the difference at the edge is
      between a cache hit and a function invocation on every single visit.
    </p>
  </div>
</section>

<section class="sheet chapter" id="build" aria-labelledby="build-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A3</span>
    <h2 id="build-title">How 559 pages get made</h2>
  </div>

  <p>
    Everything a reader sees is produced by one build step from one source of truth. The content
    files export plain TypeScript objects; <code>lib/content.ts</code> is the only thing that reads
    them; and every output — pages, search, sitemap, reading times — is derived from that one
    interface.
  </p>

  <figure>
    <svg viewBox="0 0 900 300" class="dg" role="img" aria-label="Content TypeScript files feed lib/content.ts, which feeds generateStaticParams, which produces static HTML pages, twenty search indexes, and the sitemap.">
      <g class="rough">
        <rect x="24" y="106" width="176" height="88" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="272" y="112" width="170" height="76" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="516" y="24" width="200" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
        <rect x="516" y="118" width="200" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
        <rect x="516" y="212" width="200" height="62" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
      </g>

      <text class="lbl" x="112" y="140" text-anchor="middle">content/</text>
      <text class="sm" x="112" y="162" text-anchor="middle">per-chapter files,</text>
      <text class="sm" x="112" y="180" text-anchor="middle">barrels per topic</text>

      <text class="lbl gr" x="357" y="144" text-anchor="middle">lib/content.ts</text>
      <text class="sm" x="357" y="166" text-anchor="middle">the only reader</text>

      <text class="lbl" x="616" y="50" text-anchor="middle">559 HTML pages</text>
      <text class="sm" x="616" y="70" text-anchor="middle">generateStaticParams</text>

      <text class="lbl" x="616" y="144" text-anchor="middle">20 search indexes</text>
      <text class="sm" x="616" y="164" text-anchor="middle">one JSON per topic</text>

      <text class="lbl" x="616" y="238" text-anchor="middle">sitemap + robots</text>
      <text class="sm" x="616" y="258" text-anchor="middle">written topics only</text>

      <g class="rough">
        <path class="ln" d="M200 150 H266" marker-end="url(#arrow)" />
        <path class="ln" d="M442 140 C480 140 480 55 510 55" marker-end="url(#arrow)" />
        <path class="ln" d="M442 150 H510" marker-end="url(#arrow)" />
        <path class="ln" d="M442 160 C480 160 480 243 510 243" marker-end="url(#arrow)" />
      </g>

      <text class="sm" x="760" y="144">whole build:</text>
      <text class="sm" x="760" y="164">12.5 seconds</text>
    </svg>
    <figcaption>
      One interface in the middle is the whole trick. Add a chapter file and the routes, the search
      index, the sitemap entry and the reading-time estimate all appear without being told to.
    </figcaption>
  </figure>

  <p>
    The content files were, until recently, a problem of their own. Four of them had grown past the
    point where an editor is comfortable — the exercises file was 840 KB and the DSA notes 626 KB.
    They are now barrels over per-chapter files, split through the TypeScript compiler API so that
    the source text of each chapter moved across untouched rather than being re-serialised. The
    composed data is byte-identical to what it was, which is the only reason that refactor was safe
    to do.
  </p>
</section>

<section class="sheet chapter" id="model" aria-labelledby="model-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A4</span>
    <h2 id="model-title">The content model</h2>
  </div>

  <p>
    Four types, and the relationships between them decide the URLs, the navigation and the progress
    tracking.
  </p>

  <figure>
    <svg viewBox="0 0 900 260" class="dg" role="img" aria-label="A topic has up to three levels; a level has a syllabus of sections; a section points at a chapter; a chapter lists exercise ids. Each step is also a URL.">
      <g class="rough">
        <rect x="24" y="98" width="140" height="64" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="230" y="98" width="140" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="436" y="98" width="150" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="652" y="98" width="160" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <path class="ln" d="M164 130 H224" marker-end="url(#arrow)" />
        <path class="ln" d="M370 130 H430" marker-end="url(#arrow)" />
        <path class="ln" d="M586 130 H646" marker-end="url(#arrow)" />
      </g>

      <text class="lbl" x="94" y="126" text-anchor="middle">Topic</text>
      <text class="sm" x="94" y="148" text-anchor="middle">20 of them</text>

      <text class="lbl" x="300" y="126" text-anchor="middle">Level</text>
      <text class="sm" x="300" y="148" text-anchor="middle">3 per topic</text>

      <text class="lbl" x="511" y="126" text-anchor="middle">Chapter</text>
      <text class="sm" x="511" y="148" text-anchor="middle">112 written</text>

      <text class="lbl" x="732" y="126" text-anchor="middle">Exercise</text>
      <text class="sm" x="732" y="148" text-anchor="middle">299 with tests</text>

      <text class="sm" x="194" y="114" text-anchor="middle">1..3</text>
      <text class="sm" x="400" y="114" text-anchor="middle">syllabus</text>
      <text class="sm" x="616" y="114" text-anchor="middle">practice[]</text>

      <text class="sm" x="94" y="196" text-anchor="middle">/css</text>
      <text class="sm" x="300" y="196" text-anchor="middle">/level/css</text>
      <text class="sm" x="511" y="196" text-anchor="middle">/css/css-box-model</text>
      <text class="sm" x="732" y="196" text-anchor="middle">/practice?id=</text>
      <text class="sm" x="24" y="234">Every arrow above is also a URL. The model is the routing.</text>
    </svg>
    <figcaption>
      A chapter does not own its exercises; it lists their ids. That indirection is what lets one
      exercise appear under two chapters, and what makes the practice page a flat list rather than
      a tree.
    </figcaption>
  </figure>

  <p>
    A chapter carries a <code>ready</code> flag, and that single boolean is what separates a written
    chapter from an outline. Outlines still render, still appear in the syllabus and still say
    honestly that they are not written — which is why the site can show 511 chapters while claiming
    only 112.
  </p>

  <div class="bx is-prim">
    <span class="ttl">Why TypeScript files instead of a CMS</span>
    <p>
      Three things a database would take away. The chapter shape is checked by the compiler, so a
      malformed chapter fails the build instead of rendering oddly in production. Content, rendering
      and styling change in one commit and revert in one command. And the whole corpus is covered by
      the same tooling as the code — spell-checking, link-checking, and tests that walk every chapter
      looking for broken internal anchors.
    </p>
  </div>
</section>

<section class="sheet chapter" id="state" aria-labelledby="state-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A5</span>
    <h2 id="state-title">Where state lives</h2>
  </div>

  <p>
    There are no accounts. Everything a reader earns — chapters marked done, exercises solved,
    streaks, the review schedule, theme, font, unsaved editor code — lives in
    <code>localStorage</code> on that one device. Ten keys, all under a <code>jsnotes:</code> prefix.
  </p>

  <figure>
    <svg viewBox="0 0 900 280" class="dg" role="img" aria-label="Components subscribe through useSyncExternalStore to a storage module, which reads and writes localStorage and notifies every subscriber after a write.">
      <g class="rough">
        <rect x="30" y="40" width="200" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="342" y="40" width="216" height="64" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="666" y="40" width="204" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
      </g>

      <text class="lbl" x="130" y="68" text-anchor="middle">Component</text>
      <text class="sm" x="130" y="90" text-anchor="middle">useProgressValue</text>

      <text class="lbl gr" x="450" y="68" text-anchor="middle">lib/storage.ts</text>
      <text class="sm" x="450" y="90" text-anchor="middle">get · set · subscribe</text>

      <text class="lbl" x="768" y="68" text-anchor="middle">localStorage</text>
      <text class="sm" x="768" y="90" text-anchor="middle">10 keys, one device</text>

      <g class="rough">
        <path class="ln" d="M230 62 H336" marker-end="url(#arrow)" />
        <path class="ln" d="M558 62 H660" marker-end="url(#arrow)" />
        <path class="ln" d="M450 104 C450 168 130 152 130 110" marker-end="url(#arrow-green)" style="stroke: var(--green)" />
      </g>
      <text class="sm" x="283" y="52" text-anchor="middle">read</text>
      <text class="sm" x="609" y="52" text-anchor="middle">write</text>
      <text class="sm gr" x="290" y="176" text-anchor="middle">notify every subscriber after a write</text>

      <g class="rough">
        <rect x="30" y="200" width="840" height="60" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
      </g>
      <text class="sm" x="50" y="226">THE SEAM</text>
      <text class="lbl" x="50" y="250">One module to replace when progress needs to sync to an account. No component changes.</text>
    </svg>
    <figcaption>
      Every progress-aware component reads through <code>useSyncExternalStore</code>, so a write
      anywhere re-renders everything that cares, and nothing polls.
    </figcaption>
  </figure>

  <p>
    That is a deliberate trade. It means the site works with no sign-in, stores nothing about
    anybody, and has no database to run — and it means clearing your browser loses six months of
    progress, and a phone starts from zero. It is the right answer for a personal notes site and
    the wrong one for anything with readers, which is why it is the largest single item on the
    roadmap.
  </p>

  <h3>The other boundary: what the server sends the client</h3>

  <p>
    The sidebar needs a name, a mark and a link for each topic. It used to import the whole topic
    dataset to get them — every topic with every level and every syllabus section, on the initial
    script set of 557 pages. Serialised, the sidebar needed 8 KB of the 127 KB it was paying for.
  </p>

  <p>
    The fix was a smaller type: the server derives a flat list of scalar fields and hands it to the
    client through a context provider. Measured after the change, every page dropped about 27 KB
    brotli, and the home page — which was also serialising the full list into its own payload —
    dropped 57 KB.
  </p>
</section>

<section class="sheet chapter" id="sandbox" aria-labelledby="sandbox-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A6</span>
    <h2 id="sandbox-title">Running a reader's code</h2>
  </div>

  <p>
    The playground runs whatever is typed into it, in the reader's own browser. Nothing is sent to a
    server, which removes an entire category of problem — no untrusted code on our machines, no
    queue, no execution quota, and no cost per run.
  </p>

  <figure>
    <svg viewBox="0 0 900 300" class="dg" role="img" aria-label="The editor on the main thread posts code to a Web Worker, which runs it and posts back console output and test results. The worker is terminated on timeout. Python and SQL load WebAssembly runtimes on demand.">
      <g class="rough">
        <rect x="24" y="30" width="380" height="150" rx="12" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="496" y="30" width="380" height="150" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
      </g>
      <text class="sm" x="44" y="54">MAIN THREAD</text>
      <text class="lbl" x="44" y="88">CodeMirror editor</text>
      <text class="sm" x="44" y="112">the page stays responsive</text>
      <text class="sm" x="44" y="136">while code runs</text>

      <text class="sm gr" x="516" y="54">WEB WORKER</text>
      <text class="lbl" x="516" y="88">Runs the code</text>
      <text class="sm" x="516" y="112">console captured, tests run</text>
      <text class="sm" x="516" y="136">terminated on timeout</text>

      <g class="rough">
        <path class="ln" d="M404 82 H490" marker-end="url(#arrow)" />
        <path class="ln" d="M490 132 H410" marker-end="url(#arrow)" />
      </g>
      <text class="sm" x="447" y="72" text-anchor="middle">code</text>
      <text class="sm" x="447" y="152" text-anchor="middle">output</text>

      <g class="rough">
        <rect x="24" y="216" width="270" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="318" y="216" width="264" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
        <rect x="606" y="216" width="270" height="60" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.6" />
      </g>
      <text class="lbl" x="159" y="242" text-anchor="middle">Pyodide · 15 MB</text>
      <text class="sm" x="159" y="264" text-anchor="middle">only if you pick Python</text>
      <text class="lbl" x="450" y="242" text-anchor="middle">sql.js · 1.5 MB</text>
      <text class="sm" x="450" y="264" text-anchor="middle">only if you pick SQL</text>
      <text class="lbl" x="741" y="242" text-anchor="middle">TS lib · 1.2 MB</text>
      <text class="sm" x="741" y="264" text-anchor="middle">only for TypeScript</text>
    </svg>
    <figcaption>
      The worker boundary is not decoration. An infinite loop in a reader's code freezes the worker,
      not the page, and the runner can kill it — which is impossible if the code shares a thread
      with the UI.
    </figcaption>
  </figure>

  <p>
    Four languages run: JavaScript and TypeScript directly, Python through Pyodide, SQL through
    sql.js. The three WebAssembly runtimes come to 18 MB and are copied in at build time, which
    costs deploy size and build time but nothing at runtime — none of it is fetched unless a reader
    actually picks that language.
  </p>
</section>

<section class="sheet chapter" id="edges" aria-labelledby="edges-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A7</span>
    <h2 id="edges-title">The four things that leave the building</h2>
  </div>

  <p>
    Four endpoints, three of which call somebody else's service. Each one is a dependency that can
    be slow, rate-limited or simply gone, so each one has a fallback and none of them is allowed to
    break a page.
  </p>

  <div class="table-scroll"><table>
    <thead><tr><th>Route</th><th>Talks to</th><th>If it fails</th></tr></thead>
    <tbody>
      <tr><td><code>/api/tts</code></td><td>Microsoft Edge voices</td><td>The narrator does not start; the chapter reads normally</td></tr>
      <tr><td><code>/api/weather</code></td><td>Open-Meteo</td><td>The sidebar shows the clock without a temperature</td></tr>
      <tr><td><code>/api/joke</code></td><td>JokeAPI</td><td>A hardcoded joke is returned with a 200</td></tr>
      <tr><td><code>/api/client-error</code></td><td>Nothing — it is the sink</td><td>Errors go unrecorded, which is the current state anyway</td></tr>
    </tbody>
  </table></div>

  <h3>Three layers in front of them</h3>

  <p>
    Abuse of these endpoints costs real money — every text-to-speech request is an upstream call,
    and every invocation is billable. There are three separate defences, and they are separate on
    purpose, because they fail differently.
  </p>

  <div class="table-scroll"><table>
    <thead><tr><th>Layer</th><th>Where it runs</th><th>Limit</th><th>What it cannot do</th></tr></thead>
    <tbody>
      <tr>
        <td>Vercel Firewall</td>
        <td>The edge, before any function</td>
        <td>100 requests a minute per IP on <code>/api/</code></td>
        <td>Counters are per region, so a spread-out client can exceed it</td>
      </tr>
      <tr>
        <td>In-process limiter</td>
        <td>Inside the function</td>
        <td>40 a minute for TTS, 20 for the rest</td>
        <td>Serverless spreads traffic over instances, so each instance counts alone</td>
      </tr>
      <tr>
        <td>Upstream caching</td>
        <td>Between the function and the service</td>
        <td>Weather 10 min, joke 5 min</td>
        <td>Nothing, but it only helps for repeated inputs</td>
      </tr>
    </tbody>
  </table></div>

  <p class="sub">
    Weather coordinates are rounded to one decimal place before the upstream call, so everyone in a
    city shares one cached result instead of each browser generating a unique key.
  </p>

  <div class="bx is-ref">
    <span class="ttl">The dependency worth naming</span>
    <p>
      The narrator uses an unofficial route into Microsoft's edge voices. It is free, it sounds
      better than the browser's built-in speech synthesis, and it has no contract behind it. If it
      disappears the narrator stops and everything else on the site carries on — which is why it
      was built as an enhancement to a page that reads perfectly well without it.
    </p>
  </div>
</section>

<section class="sheet chapter" id="breaks" aria-labelledby="breaks-title">
  <div class="chapter__head">
    <span class="badge" aria-hidden="true">A8</span>
    <h2 id="breaks-title">What breaks first</h2>
  </div>

  <p>
    The useful half of a design review is the part that says where it stops working. A static site
    on a CDN survives traffic that would flatten most architectures — but "it scales" is not an
    answer, and these are the things that actually give way, in the order they would.
  </p>

  <div class="table-scroll"><table>
    <thead><tr><th>Under pressure from</th><th>What gives</th><th>What it would take</th></tr></thead>
    <tbody>
      <tr>
        <td>Readers on phones, searching</td>
        <td>
          The search index. It is fetched on the first keystroke, and the interview index is 134 KB
          gzipped, DSA 115 KB. Two topics already cost more than a whole page does.
        </td>
        <td>Strip HTML from the indexed text first; a real inverted index after that</td>
      </tr>
      <tr>
        <td>Writing more chapters</td>
        <td>
          Build time and deploy size, linearly. 399 chapters are still outlines; writing them roughly
          quadruples the corpus.
        </td>
        <td>Nothing urgent — 12.5 seconds has a lot of room above it</td>
      </tr>
      <tr>
        <td>A burst on the narrator</td>
        <td>
          Function cost and the upstream. The firewall holds the edge, but the per-region counter
          means a distributed client sees a higher ceiling than the number suggests.
        </td>
        <td>A shared counter, which means state, which means the thing this design does not have</td>
      </tr>
      <tr>
        <td>Anyone using two devices</td>
        <td>
          Progress. It does not sync, and there is no mechanism by which it could. This is the
          failure readers actually meet.
        </td>
        <td>Accounts and a database — the one change that alters the shape of the system</td>
      </tr>
      <tr>
        <td>An error in the browser</td>
        <td>
          Visibility. Client errors post to a function and land in a log with no grouping and no
          alerting, and the log expires.
        </td>
        <td>An error tracker; the reporting component is already the seam for one</td>
      </tr>
    </tbody>
  </table></div>

  <h3>What this design deliberately does not have</h3>

  <p>
    Every one of these is an absence rather than an oversight, and each one is what makes the rest
    of the system small enough to hold in your head.
  </p>

  <ul>
    <li><strong>No database.</strong> The content is the repository; the reader's state is their browser.</li>
    <li><strong>No authentication.</strong> Nothing is gated, so there is no session, no password reset and no account to breach.</li>
    <li><strong>No cache layer of our own.</strong> The CDN is the cache, and the build is the invalidation.</li>
    <li><strong>No queue and no background jobs.</strong> Everything that could be slow happens at build time or in the reader's browser.</li>
    <li><strong>No server-side code execution.</strong> The playground runs in a Web Worker on the reader's machine, so untrusted code never reaches ours.</li>
  </ul>

  <p>
    The honest summary is that this is a small system that has been measured carefully rather than a
    large one that has been designed carefully. Most of what is written above is the record of
    finding out that something cost more than it looked like — a sidebar that shipped a syllabus, a
    home page that prefetched a code editor, three routes that quietly rendered on every request.
    None of those were visible without going and measuring.
  </p>

  <div class="hero__actions">
    <a class="btn btn--primary btn--big" href="/system-design">The system design notes &rarr;</a>
    <a class="btn btn--big" href="/interview/r8">The system design interview round</a>
  </div>
</section>
`;
