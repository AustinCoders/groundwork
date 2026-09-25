import type { GitSection } from "./types";

export const gitFlow: GitSection = {
  id: "flow",
  num: "G11",
  title: "Team workflows",
  short: "Team workflows",
  subtitle:
    "Trunk-based, GitHub flow and GitFlow compared, and how release branches, feature flags and CI gates fit around them.",
  body: `
<div class="cover__meta">
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    A branching strategy is a team agreement about three things: where
    work happens, how it gets back to the main line, and what gets
    released. Git doesn't care which one you pick. Your merge conflicts,
    your release process and your CI bill do. You should be able to name
    the strategy your team uses and defend the trade-off, because that
    question comes up in almost every senior interview.
  </p>

  <h3>The one idea underneath all of them</h3>
  <p>
    The cost of integrating two lines of work grows with how far they have
    drifted apart. A branch that lives for an afternoon merges cleanly
    because almost nothing else changed in that time. A branch that lives
    for six weeks collides with six weeks of everyone else's changes, and
    the conflicts are not only textual: code that merges cleanly can still
    break, because someone renamed a function you call. Every strategy
    below is a different answer to the question "how long do we let work
    stay apart, and what do we do about it?"
  </p>

  <h3>Trunk-based development</h3>
  <p>
    Everyone integrates into one branch, the trunk (usually
    <code>main</code>), at least once a day. Branches, if you use them at
    all, live for hours and go through a quick PR. Work that isn't
    finished still merges, hidden behind a feature flag. Main must always
    build and pass its tests, because everyone is building on it.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Trunk-based development. A main line with ten commits. Four tiny branches each leave main and rejoin one commit later. A release branch, release/3.1, is cut from main and tagged v3.1.0. A fix lands on main first and is cherry-picked onto the release branch as v3.1.1.">
      <g class="rough">
        <path class="ln" d="M60 110 H820" />
        <path class="lng" d="M80 110 C100 110 100 55 120 55 C140 55 140 110 160 110" />
        <path class="lng" d="M240 110 C260 110 260 55 280 55 C300 55 300 110 320 110" />
        <path class="lng" d="M480 110 C500 110 500 55 520 55 C540 55 540 110 560 110" />
        <path class="lng" d="M640 110 C660 110 660 55 680 55 C700 55 700 110 720 110" />
        <path class="ln" d="M400 110 C430 110 430 190 460 190 H620" />
        <path class="ln dash" d="M566 118 L612 180" marker-end="url(#arrow)" />
        <circle cx="80" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="160" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="320" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="400" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="480" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="560" cy="110" r="8" style="fill: var(--green)" />
        <circle cx="640" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="720" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="800" cy="110" r="7" style="fill: var(--ink)" />
        <circle cx="120" cy="55" r="6" style="fill: var(--green)" />
        <circle cx="280" cy="55" r="6" style="fill: var(--green)" />
        <circle cx="520" cy="55" r="6" style="fill: var(--green)" />
        <circle cx="680" cy="55" r="6" style="fill: var(--green)" />
        <circle cx="470" cy="190" r="7" style="fill: var(--ink)" />
        <circle cx="620" cy="190" r="8" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
      </g>
      <text class="sm gr" x="120" y="34" text-anchor="middle">branches live hours</text>
      <text class="sm gr" x="548" y="142" text-anchor="end">fix</text>
      <text class="lbl" x="832" y="115">main</text>
      <text class="lbl" x="640" y="195">release/3.1</text>
      <text class="sm" x="470" y="222" text-anchor="middle">v3.1.0</text>
      <text class="sm" x="620" y="222" text-anchor="middle">v3.1.1</text>
      <text class="sm" x="686" y="150">cherry-pick -x</text>
    </svg>
    <figcaption>
      Everything merges into main within a day. When a release needs
      support, it is cut from main, and fixes land on main first and are
      then copied to the release.
    </figcaption>
  </figure>

  <p>
    It needs three things to work: a fast, trustworthy test suite, a
    feature-flag system, and code review that keeps up with small PRs.
    Without them, trunk-based development ships half-built features or
    breaks main several times a day. With them, it has the lowest merge
    cost of any strategy, and it is what very large engineering
    organisations converge on.
  </p>

  <h3>GitHub flow</h3>
  <p>
    One long-lived branch, <code>main</code>, which is always deployable.
    For each change: branch from main, commit, open a pull request, get
    review and green CI, merge, deploy. That is the whole process. Branches
    usually live for a few days rather than a few hours, which is the main
    difference from trunk-based development in practice.
  </p>

  <figure>
    <svg viewBox="0 0 900 210" class="dg" role="img" aria-label="GitHub flow. A main line. Three branches, feature/cart, fix/login and feature/search, each leave main, gain a few commits over a few days, and merge back through a pull request. Each merge is followed by a deploy.">
      <g class="rough">
        <path class="ln" d="M40 150 H860" />
        <path class="lng" d="M80 150 C100 150 100 80 130 80 H250 C275 80 275 150 300 150" />
        <path class="lng" d="M340 150 C360 150 360 80 390 80 H440 C460 80 460 150 480 150" />
        <path class="lng" d="M540 150 C560 150 560 80 600 80 H740 C770 80 770 150 800 150" />
        <circle cx="80" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="340" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="540" cy="150" r="7" style="fill: var(--ink)" />
        <circle cx="130" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="190" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="250" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="390" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="440" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="600" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="670" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="740" cy="80" r="7" style="fill: var(--green)" />
        <circle cx="300" cy="150" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="480" cy="150" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="800" cy="150" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
      </g>
      <text class="lbl gr" x="190" y="56" text-anchor="middle">feature/cart</text>
      <text class="lbl gr" x="415" y="56" text-anchor="middle">fix/login</text>
      <text class="lbl gr" x="670" y="56" text-anchor="middle">feature/search</text>
      <text class="sm" x="300" y="182" text-anchor="middle">PR #88 → deploy</text>
      <text class="sm" x="480" y="182" text-anchor="middle">PR #91 → deploy</text>
      <text class="sm" x="800" y="182" text-anchor="middle">PR #95 → deploy</text>
      <text class="lbl" x="40" y="182">main</text>
    </svg>
    <figcaption>
      Each merge to main is a release candidate, and usually a release.
      There is no separate integration branch and no release branch.
    </figcaption>
  </figure>

  <p>
    It fits web apps and services with continuous deployment, where there
    is only ever one version in production. Its weak point is the same:
    there is no built-in place to maintain version 2 while version 3 is
    being built. If you need that, you add release branches, and at that
    point you are closer to trunk-based development with releases.
  </p>

  <h3>GitFlow</h3>
  <p>
    GitFlow, published by Vincent Driessen in 2010, uses two permanent
    branches and three kinds of temporary ones. <code>main</code> holds
    only released code, one merge per release, each tagged.
    <code>develop</code> is where features are integrated. Features branch
    from develop and merge back into it. When enough is ready, a
    <code>release/*</code> branch is cut from develop for stabilisation,
    then merged into main (and tagged) and back into develop. Urgent fixes
    branch from main as <code>hotfix/*</code> and are merged into both.
  </p>

  <figure>
    <svg viewBox="0 0 900 330" class="dg" role="img" aria-label="GitFlow. Five lanes: main, hotfix, release, develop and feature. A feature branch leaves develop and merges back. A hotfix leaves main at v1.0 and merges into main as v1.0.1 and into develop. A release branch leaves develop, gets a fix, and merges into main as v1.1 and back into develop.">
      <g class="rough">
        <path class="ln" d="M140 60 H860" />
        <path class="ln" d="M180 210 H860" />
        <path class="ln" d="M140 60 C160 60 160 210 180 210" />
        <path class="lng" d="M180 210 C200 210 200 270 220 270 H260 C280 270 280 210 300 210" />
        <path class="lnr" d="M140 60 C200 60 200 110 260 110 H400" />
        <path class="lnr" d="M400 110 C435 110 435 60 470 60" />
        <path class="lnr" d="M400 110 C460 110 460 210 520 210" />
        <path class="ln" d="M620 210 C640 210 640 160 660 160" />
        <path class="ln" d="M660 160 C680 160 680 60 700 60" />
        <path class="ln" d="M660 160 C710 160 710 210 760 210" />
        <circle cx="140" cy="60" r="8" style="fill: var(--ink)" />
        <circle cx="470" cy="60" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="700" cy="60" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="400" cy="110" r="7" style="fill: var(--red)" />
        <circle cx="660" cy="160" r="7" style="fill: var(--ink)" />
        <circle cx="180" cy="210" r="7" style="fill: var(--ink)" />
        <circle cx="300" cy="210" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="420" cy="210" r="7" style="fill: var(--ink)" />
        <circle cx="520" cy="210" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="620" cy="210" r="7" style="fill: var(--ink)" />
        <circle cx="760" cy="210" r="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="220" cy="270" r="7" style="fill: var(--green)" />
        <circle cx="260" cy="270" r="7" style="fill: var(--green)" />
      </g>
      <text class="sm" x="20" y="65">main</text>
      <text class="sm rd" x="20" y="115">hotfix/*</text>
      <text class="sm" x="20" y="165">release/*</text>
      <text class="sm" x="20" y="215">develop</text>
      <text class="sm gr" x="20" y="275">feature/*</text>
      <text class="sm" x="140" y="38" text-anchor="middle">v1.0</text>
      <text class="sm" x="470" y="38" text-anchor="middle">v1.0.1</text>
      <text class="sm" x="700" y="38" text-anchor="middle">v1.1</text>
      <text class="sm" x="20" y="315">Main only ever receives release and hotfix merges. Every release and hotfix is merged twice.</text>
    </svg>
    <figcaption>
      Five kinds of branch and two merges per release. The structure is
      the point: it keeps unreleased work away from main entirely.
    </figcaption>
  </figure>

  <p>
    GitFlow fits software that ships in numbered versions on a schedule and
    has several versions in the field at once: desktop apps, mobile apps
    waiting on store review, on-premise installs, libraries. For a web app
    that deploys every day it is mostly ceremony. Every change is merged
    at least twice, <code>develop</code> drifts from <code>main</code>,
    and the delay between writing code and running it in production grows.
    Driessen added a note to the original article in 2020 saying as much:
    for continuously delivered software, adopt something simpler.
  </p>

  <h3>Side by side</h3>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th></th><th>Trunk-based</th><th>GitHub flow</th><th>GitFlow</th></tr>
      </thead>
      <tbody>
        <tr><td>Long-lived branches</td><td><code>main</code> (plus release branches if needed)</td><td><code>main</code></td><td><code>main</code>, <code>develop</code></td></tr>
        <tr><td>Typical branch life</td><td>Hours</td><td>Days</td><td>Days to weeks</td></tr>
        <tr><td>Unfinished work</td><td>Merged, behind flags</td><td>Stays on the branch</td><td>Stays on the branch, then on develop</td></tr>
        <tr><td>Releases</td><td>From main, often continuous</td><td>Every merge</td><td>Scheduled, via release branches</td></tr>
        <tr><td>Supports old versions</td><td>With release branches</td><td>Not by itself</td><td>Yes, by design</td></tr>
        <tr><td>Merge pain</td><td>Lowest</td><td>Low</td><td>Highest</td></tr>
        <tr><td>Needs</td><td>Fast CI, flags, discipline</td><td>Good CI, quick review</td><td>Release management</td></tr>
        <tr><td>Fits</td><td>High-velocity product teams, large monorepos</td><td>Most web apps and services</td><td>Versioned, installed software</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    Open source adds one more shape on top of any of these: the
    <strong>fork and pull request</strong> model, where contributors
    can't push to the main repository at all. They push to their own copy
    and open a PR upstream. That is covered in the pull requests section.
  </p>

  <h3>Release branches done well</h3>
  <p>
    A release branch exists to <em>stabilise</em> and then <em>maintain</em>
    one version while main moves on. It is cut from main (or develop),
    named for the version, and from then on receives only fixes.
  </p>
  <pre><code>$ git switch -c release/3.1 main
$ git push -u origin release/3.1
$ git tag -a v3.1.0 -m "Release 3.1.0"
$ git push origin v3.1.0

$ git switch release/3.1
$ git cherry-pick -x 7b3e9f2
$ git tag -a v3.1.1 -m "Release 3.1.1: tax rounding fix"
$ git push origin release/3.1 v3.1.1</code></pre>
  <p>
    The rule that keeps release branches sane is <strong>upstream
    first</strong>: fix the bug on main, then cherry-pick the fix to each
    release branch that needs it. If you fix it on the release branch
    instead, you have to remember to bring it back, and the day someone
    forgets, the bug comes back in the next version. Use annotated tags
    (<code>-a</code>) for releases, because they record who tagged, when,
    and a message, and <code>git describe</code> uses them. Decide up
    front how many versions you support, and delete the branch (the tags
    remain) when a version reaches end of life.
  </p>

  <h3>Feature flags versus long-lived branches</h3>
  <p>
    A long-lived feature branch keeps unfinished work away from users by
    keeping it away from main. A feature flag does the same by keeping it
    switched off at runtime while the code is merged.
  </p>
  <pre><code>if (flags.isEnabled("coupon-stacking", { userId: user.id })) {
  return applyStackedCoupons(cart, codes);
}
return applySingleCoupon(cart, codes[0]);</code></pre>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th></th><th>Long-lived branch</th><th>Feature flag</th></tr>
      </thead>
      <tbody>
        <tr><td>Merge conflicts</td><td>Grow every day the branch lives</td><td>Small and continuous</td></tr>
        <tr><td>Deploy vs release</td><td>Tied: merging is releasing</td><td>Separate: deploy any time, turn on when ready</td></tr>
        <tr><td>Rollout</td><td>All users at once</td><td>By percentage, region, account or employees first</td></tr>
        <tr><td>Rollback</td><td>Revert and redeploy</td><td>Flip the flag off in seconds</td></tr>
        <tr><td>Cost</td><td>Painful merges, late integration bugs</td><td>More code paths to test; flags must be removed after launch</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    Flags have their own debt. Every flag doubles the number of states the
    code can be in, and a flag nobody removes is a permanent
    <code>if</code> with an untested branch. Give each flag an owner and
    an expiry date, and delete it in the sprint after full rollout. For
    large refactors that can't hide behind one <code>if</code>, use
    <em>branch by abstraction</em>: put an interface in front of the old
    implementation, build the new one behind the same interface on main,
    switch over, then delete the old one.
  </p>

  <h3>CI gating: keeping main green</h3>
  <p>
    Every strategy assumes main works. CI is how you make that true
    instead of hoped for. The layers are:
  </p>
  <ul>
    <li><strong>Pre-merge checks.</strong> Build, lint, type-check and tests run on every PR, and branch protection makes them required. On GitHub, <code>pull_request</code> workflows run against a test merge of the PR into its base, not the branch alone, so you are testing what main would become.</li>
    <li><strong>Up to date, or a merge queue.</strong> Two PRs can each pass against today's main and still break it together: one renames a function, the other adds a new call to the old name. No text conflict, so Git merges both happily. Requiring branches to be up to date closes the gap but forces endless rebasing on a busy repo. A merge queue closes it properly by testing each PR on top of the ones ahead of it.</li>
    <li><strong>Post-merge checks.</strong> Slower suites (end-to-end, performance) run on main after merge, and a failure pages the team.</li>
    <li><strong>A revert-first policy.</strong> When main breaks, the default response is to revert the offending PR, not to push a fix forward under pressure. Fix it calmly on a branch and merge again.</li>
    <li><strong>Flaky tests are bugs.</strong> A test that fails one time in twenty teaches everyone to click "re-run", and then real failures get re-run too. Quarantine and fix them.</li>
  </ul>

  <h3>Monorepo considerations</h3>
  <p>
    A monorepo puts many projects in one repository. The big win is atomic
    change: you can update a shared library and every caller in one PR, and
    there is never a version mismatch between them. The costs show up in
    Git and CI.
  </p>
  <ul>
    <li><strong>CI must only build what changed.</strong> Running every test for a README edit doesn't scale. Tools such as Nx, Turborepo, Bazel and Pants compute which packages a diff affects, for example <code>turbo run test --filter=...[origin/main]</code>. Path filters in the workflow are the crude version.</li>
    <li><strong>Ownership needs to be per folder.</strong> A <code>CODEOWNERS</code> file routes <code>apps/billing/</code> changes to the billing team and requires their review.</li>
    <li><strong>PR volume makes a merge queue close to mandatory.</strong> With dozens of merges an hour, "up to date with main" is out of date by the time CI finishes.</li>
    <li><strong>Clones get big.</strong> Partial clone (<code>git clone --filter=blob:none</code>) skips downloading old file contents until needed, and <code>git sparse-checkout set apps/web packages/ui</code> writes only the folders you work on. The scaling section covers both.</li>
    <li><strong>History gets noisy.</strong> Scope your questions to a path: <code>git log --oneline -- apps/web</code>.</li>
  </ul>

  <div class="bx is-ref">
    <span class="ttl">A sensible default</span>
    <p>
      For most teams building a web product: GitHub flow with small PRs,
      squash merges, required checks and one required review, feature
      flags for anything that takes more than a few days, and a merge queue
      once the team is big enough that PRs start breaking each other. Add
      release branches only when you truly support more than one version.
    </p>
  </div>
`,
};
