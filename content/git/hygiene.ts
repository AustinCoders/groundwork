import type { GitSection } from "./types";

export const gitHygiene: GitSection = {
  id: "hygiene",
  num: "G12",
  title: "Commit hygiene",
  short: "Commit hygiene",
  subtitle:
    "Small commits, messages that explain why, hooks that catch mistakes early, and tags that mark what shipped.",
  body: `
<div class="cover__meta">
  <span class="tag tag--beginner">Fresher</span>
  <span class="tag tag--intermediate">Mid</span>
  <span class="tag tag--advanced">Senior</span>
</div>

<p>
  A commit message is documentation written at the one moment you had the most context. Six months
  later, a good message is the difference between understanding a line of code and rewriting it out
  of fear. History is also a tool: <code>bisect</code>, <code>revert</code>, <code>blame</code> and
  <code>cherry-pick</code> all work far better on clean commits than on a pile of "wip" and "fix".
</p>

<div class="bx is-prim">
<span class="ttl">In one minute</span>
<p>
  Make each commit one change you could describe in a short sentence. Write that sentence as the
  first line, in the imperative ("Fix tax rounding on coupons", not "fixed stuff"), keep it under
  about 50 characters, and add a blank line and a few lines of <em>why</em> if the reason is not
  obvious. Read <code>git diff --staged</code> before you commit. That is most of commit hygiene;
  the rest of this page is tooling that makes it automatic.
</p>
</div>

<h3>Atomic commits</h3>
<p>
  An atomic commit holds one logical change, complete on its own. The build passes and the tests pass
  at that commit. It can be reverted without dragging unrelated work out with it, and a reviewer can
  read it without holding three stories in their head at once.
</p>
<ul>
  <li><strong>One reason to exist.</strong> If the subject line needs the word "and", you probably have two commits.</li>
  <li><strong>Refactor apart from behaviour.</strong> "Rename <code>calcTotal</code> to <code>computeTotal</code>" touches 40 files and changes nothing. Keep it away from the three-line bug fix, or the fix drowns in the rename.</li>
  <li><strong>Formatting on its own.</strong> A reformat commit can go into <code>.git-blame-ignore-revs</code> so <code>blame</code> skips it. Mixed into a real change, it can't.</li>
  <li><strong>Green at every step.</strong> <code>git bisect</code> assumes every commit builds. A broken middle commit forces you to <code>git bisect skip</code> and weakens the search.</li>
</ul>
<p>
  You rarely write atomic commits in the order you work. That's what the staging area is for.
  <code>git add -p</code> stages hunk by hunk, <code>git commit --fixup=&lt;sha&gt;</code> records a
  correction aimed at an earlier commit, and <code>git rebase -i --autosquash</code> folds those
  corrections in before you open the pull request.
</p>
<pre><code>git add -p src/cart.ts
git commit -m "fix(cart): apply coupon before tax"
git add src/cart.test.ts
git commit --fixup=HEAD
git rebase -i --autosquash main</code></pre>

<h3>Anatomy of a good message</h3>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="An annotated commit message. The subject line is at most 50 characters and imperative. A blank line follows. The body is wrapped at 72 characters and explains why. Trailers such as Refs, Co-authored-by and Signed-off-by form the last block.">
<g class="rough">
<rect x="20" y="18" width="560" height="266" rx="12" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="36" y="32" width="300" height="30" rx="6" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.6" />
<rect x="36" y="200" width="420" height="72" rx="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 1.6" />
<path class="ln" d="M640 47 H344" marker-end="url(#arrow)" />
<path class="ln" d="M640 84 H80" marker-end="url(#arrow)" />
<path class="ln" d="M640 132 H516" marker-end="url(#arrow)" />
<path class="ln" d="M640 236 H464" marker-end="url(#arrow)" />
</g>
<text class="lbl" x="48" y="53">fix(cart): apply coupon before tax</text>
<text class="sm" x="48" y="114">Tax was calculated on the pre-discount subtotal, so</text>
<text class="sm" x="48" y="134">customers paid too much on percentage coupons. The</text>
<text class="sm" x="48" y="154">order now matches the finance spec.</text>
<text class="sm" x="48" y="222">Refs: PAY-231</text>
<text class="sm" x="48" y="243">Co-authored-by: Sam Lee &lt;sam@example.com&gt;</text>
<text class="sm" x="48" y="264">Signed-off-by: Ana Ruiz &lt;ana@example.com&gt;</text>
<text class="lbl" x="650" y="52">subject: 50, imperative</text>
<text class="lbl" x="650" y="89">blank line, required</text>
<text class="lbl" x="650" y="137">body: wrap at 72, why</text>
<text class="lbl" x="650" y="241">trailers: key: value</text>
</svg>
<figcaption>
  Tools depend on this shape. <code>git log --oneline</code>, GitHub and email patches all treat the
  first line as the title and everything after the first blank line as the body. Trailers are the
  last block, one <code>Key: value</code> per line.
</figcaption>
</figure>

<ul>
  <li><strong>Subject around 50 characters, 72 at most.</strong> Longer subjects get cut off in <code>--oneline</code> output and in the host's UI. No full stop.</li>
  <li><strong>Imperative mood.</strong> "Add", "fix", "remove". It completes the sentence "If applied, this commit will…". Git's own generated messages ("Merge branch…", "Revert…") use the same form.</li>
  <li><strong>Blank line after the subject.</strong> Without it, many tools read the whole message as one long title.</li>
  <li><strong>Body wrapped at 72.</strong> Git does not wrap for you, and <code>git log</code> indents the body by four spaces, so 72 still fits an 80-column terminal.</li>
  <li><strong>Why over what.</strong> The diff already shows what changed. The message should say why, what else you tried, and what a reader might get wrong.</li>
</ul>

<pre><code>- fixed stuff
- update
- Fixed the bug where the cart total was wrong sometimes

+ fix(cart): apply coupon before tax, not after</code></pre>

<h4>Trailers</h4>
<p>
  Trailers are structured <code>Key: value</code> lines at the end of the message. Git can add, parse
  and filter them, and hosts read several of them.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Trailer</th><th>Meaning</th><th>How to add it</th></tr></thead>
<tbody>
<tr><td><code>Co-authored-by:</code></td><td>Credits a pair or mob partner. GitHub and GitLab show both avatars on the commit.</td><td><code>git commit --trailer "Co-authored-by: Sam Lee &lt;sam@example.com&gt;"</code></td></tr>
<tr><td><code>Signed-off-by:</code></td><td>The Developer Certificate of Origin: you certify you have the right to submit the code. Linux and many CNCF projects require it. It is not a cryptographic signature.</td><td><code>git commit -s</code></td></tr>
<tr><td><code>Refs:</code>, <code>Fixes:</code></td><td>Links to a ticket. Some hosts close issues from <code>Fixes #123</code> in the message.</td><td>Type it, or use <code>--trailer</code></td></tr>
<tr><td><code>Reviewed-by:</code>, <code>Acked-by:</code></td><td>Records review in patch-based projects</td><td>Added by the maintainer</td></tr>
</tbody>
</table></div>
<pre><code>git log --format="%h %s %(trailers:key=Co-authored-by,valueonly)"
git interpret-trailers --parse &lt; message.txt</code></pre>

<h3>Conventional Commits</h3>
<p>
  Conventional Commits is a small spec for the subject line that machines can parse. Once every
  commit on <code>main</code> follows it, tooling can pick the next version number and write the
  changelog for you.
</p>
<pre><code>&lt;type&gt;(&lt;optional scope&gt;)&lt;optional !&gt;: &lt;short imperative summary&gt;

&lt;optional body&gt;

&lt;optional footers, such as BREAKING CHANGE: or Refs:&gt;</code></pre>
<p>
  Common types are <code>feat</code>, <code>fix</code>, <code>docs</code>, <code>style</code>,
  <code>refactor</code>, <code>perf</code>, <code>test</code>, <code>build</code>, <code>ci</code>,
  <code>chore</code> and <code>revert</code>. Only three things affect the version number.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Commit</th><th>Semantic version bump</th><th>Example</th></tr></thead>
<tbody>
<tr><td><code>fix:</code></td><td>PATCH, 2.4.0 to 2.4.1</td><td><code>fix(auth): refresh token before expiry</code></td></tr>
<tr><td><code>feat:</code></td><td>MINOR, 2.4.0 to 2.5.0</td><td><code>feat(cart): allow stacking two coupons</code></td></tr>
<tr><td><code>feat!:</code> or a <code>BREAKING CHANGE:</code> footer</td><td>MAJOR, 2.4.0 to 3.0.0</td><td><code>feat(api)!: drop the v1 orders endpoint</code></td></tr>
<tr><td>Anything else</td><td>No release on its own</td><td><code>docs: fix install steps</code></td></tr>
</tbody>
</table></div>
<p>
  Before 1.0.0, most tools treat breaking changes as a minor bump, because semver says anything may
  change in 0.x. The usual tool chain:
</p>
<ul>
  <li><strong>commitlint</strong> checks each message in a <code>commit-msg</code> hook and again in CI.</li>
  <li><strong>semantic-release</strong> runs in CI on every push to <code>main</code>. It reads commits since the last tag, bumps the version, tags, writes release notes and publishes.</li>
  <li><strong>release-please</strong> keeps an open "release PR" that updates the changelog and version. Merging it cuts the release, so a human decides when.</li>
  <li><strong>git-cliff</strong> and <strong>conventional-changelog</strong> only generate the changelog.</li>
</ul>
<div class="bx is-ref">
<span class="ttl">Squash merges and the PR title</span>
<p>
  If your host squash-merges pull requests, the commit that lands on <code>main</code> usually takes
  the PR title as its subject. Then the PR title is what must follow the spec. Lint the title in CI,
  not only the individual commits.
</p>
</div>

<h3>Hooks</h3>
<p>
  Hooks are executables Git runs at fixed points. A hook that exits non-zero aborts the operation, if
  it runs early enough to stop it. They live in <code>.git/hooks</code>, which is not part of the
  repository. A fresh clone gets only the <code>.sample</code> files, and nobody else sees the hooks
  you write there.
</p>

<figure>
<svg viewBox="0 0 930 300" class="dg" role="img" aria-label="The order hooks run in. For git commit: pre-commit, prepare-commit-msg, commit-msg, then the commit is written, then post-commit. For git push: pre-push on your machine, then pre-receive, update and post-receive on the server.">
<g class="rough">
<rect x="20" y="42" width="156" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="204" y="42" width="156" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="388" y="42" width="156" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="572" y="42" width="156" height="64" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="756" y="42" width="156" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M176 74 H198" marker-end="url(#arrow)" />
<path class="ln" d="M360 74 H382" marker-end="url(#arrow)" />
<path class="ln" d="M544 74 H566" marker-end="url(#arrow)" />
<path class="ln" d="M728 74 H750" marker-end="url(#arrow)" />
<rect x="20" y="180" width="156" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="204" y="180" width="156" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 1.8" />
<rect x="388" y="180" width="156" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="572" y="180" width="156" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<rect x="756" y="180" width="156" height="64" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 1.8" />
<path class="ln" d="M176 212 H198" marker-end="url(#arrow)" />
<path class="ln" d="M360 212 H382" marker-end="url(#arrow)" />
<path class="ln" d="M544 212 H566" marker-end="url(#arrow)" />
<path class="ln" d="M728 212 H750" marker-end="url(#arrow)" />
</g>
<text class="sm" x="20" y="30">GIT COMMIT</text>
<text class="lbl" x="98" y="70" text-anchor="middle">pre-commit</text>
<text class="sm rd" x="98" y="92" text-anchor="middle">lint staged files</text>
<text class="lbl" x="282" y="70" text-anchor="middle">prepare-</text>
<text class="lbl" x="282" y="90" text-anchor="middle">commit-msg</text>
<text class="lbl" x="466" y="70" text-anchor="middle">commit-msg</text>
<text class="sm rd" x="466" y="92" text-anchor="middle">check the message</text>
<text class="lbl" x="650" y="70" text-anchor="middle">commit written</text>
<text class="sm" x="650" y="92" text-anchor="middle">objects stored</text>
<text class="lbl" x="834" y="70" text-anchor="middle">post-commit</text>
<text class="sm" x="834" y="92" text-anchor="middle">notify only</text>
<text class="sm" x="20" y="134">red: can abort · git commit --no-verify skips pre-commit and commit-msg</text>
<text class="sm" x="20" y="168">GIT PUSH</text>
<text class="lbl" x="98" y="208" text-anchor="middle">pre-push</text>
<text class="sm rd" x="98" y="230" text-anchor="middle">fast tests</text>
<text class="lbl" x="282" y="208" text-anchor="middle">network</text>
<text class="sm" x="282" y="230" text-anchor="middle">pack sent</text>
<text class="lbl" x="466" y="208" text-anchor="middle">pre-receive</text>
<text class="sm rd" x="466" y="230" text-anchor="middle">reject the push</text>
<text class="lbl" x="650" y="208" text-anchor="middle">update</text>
<text class="sm rd" x="650" y="230" text-anchor="middle">once per ref</text>
<text class="lbl" x="834" y="208" text-anchor="middle">post-receive</text>
<text class="sm" x="834" y="230" text-anchor="middle">CI, deploy, notify</text>
<text class="sm" x="20" y="272">your machine</text>
<text class="sm" x="388" y="272">the server: runs for every push, no --no-verify can skip it</text>
</svg>
<figcaption>
  Client hooks are a convenience that anyone can skip. Server hooks, and the host's branch rules and
  required checks built on the same idea, are the only real enforcement.
</figcaption>
</figure>

<div class="table-scroll"><table>
<thead><tr><th>Client hook</th><th>Fires</th><th>Typical use</th></tr></thead>
<tbody>
<tr><td><code>pre-commit</code></td><td>Before the message is asked for. Non-zero aborts.</td><td>Lint and format staged files, block debug statements, scan for secrets</td></tr>
<tr><td><code>prepare-commit-msg</code></td><td>After the default message is built, before the editor opens</td><td>Insert the ticket ID from the branch name</td></tr>
<tr><td><code>commit-msg</code></td><td>After you save the message. Non-zero aborts.</td><td>commitlint, require a ticket reference</td></tr>
<tr><td><code>post-commit</code></td><td>After the commit exists</td><td>Notifications. It cannot undo anything.</td></tr>
<tr><td><code>pre-merge-commit</code></td><td>Before a merge commit is created</td><td>Same checks as <code>pre-commit</code> for merges</td></tr>
<tr><td><code>pre-rebase</code></td><td>Before a rebase starts. Non-zero aborts.</td><td>Refuse to rebase published branches</td></tr>
<tr><td><code>post-checkout</code>, <code>post-merge</code></td><td>After switching branches or a successful merge or pull</td><td>Reinstall dependencies when the lockfile changed</td></tr>
<tr><td><code>post-rewrite</code></td><td>After <code>commit --amend</code> and rebase</td><td>Carry notes or metadata to the new commits</td></tr>
<tr><td><code>pre-push</code></td><td>After the remote is contacted, before anything is sent. Non-zero aborts.</td><td>Fast tests, block direct pushes to <code>main</code></td></tr>
</tbody>
</table></div>

<h4>Sharing hooks with a team</h4>
<p>
  Since you can't commit <code>.git/hooks</code>, you commit the hooks somewhere else and point Git at
  them. Every option below does that in the end.
</p>
<pre><code>mkdir .githooks
git config core.hooksPath .githooks
chmod +x .githooks/pre-commit</code></pre>
<div class="table-scroll"><table>
<thead><tr><th>Tool</th><th>Config</th><th>Install step</th><th>Fits</th></tr></thead>
<tbody>
<tr><td>Plain <code>core.hooksPath</code></td><td>Scripts in a folder you commit</td><td>Each person runs the <code>git config</code> once</td><td>Small teams, any language</td></tr>
<tr><td>Husky</td><td><code>.husky/pre-commit</code> and friends</td><td>A <code>prepare</code> script in <code>package.json</code> sets <code>core.hooksPath</code> on <code>npm install</code></td><td>JavaScript projects</td></tr>
<tr><td>Lefthook</td><td><code>lefthook.yml</code></td><td><code>lefthook install</code></td><td>Polyglot repos and monorepos. Single binary, runs commands in parallel.</td></tr>
<tr><td>pre-commit</td><td><code>.pre-commit-config.yaml</code></td><td><code>pre-commit install</code></td><td>Python teams. Large catalogue of ready-made hooks, each in its own environment.</td></tr>
</tbody>
</table></div>
<p>
  Pair any of them with <strong>lint-staged</strong> or an equivalent, so the hook only checks files
  in this commit and not the whole repository. To test a hook without making a commit,
  <code>git hook run pre-commit</code> runs it exactly as Git would, from wherever
  <code>core.hooksPath</code> points.
</p>
<div class="bx is-ref">
<span class="ttl">Keep hooks fast, and back them up in CI</span>
<p>
  A pre-commit hook that takes 30 seconds gets skipped with <code>--no-verify</code> within a week.
  Aim for under two seconds. Leave the full test suite to CI, and run the same lint and commitlint
  checks there, because a hook on a laptop is advice. A required status check on the server is a rule.
</p>
</div>

<h3>Tags and releases</h3>
<p>
  A tag is a name for a commit that, unlike a branch, is not supposed to move. There are two kinds,
  and they are different things inside Git.
</p>
<div class="table-scroll"><table>
<thead><tr><th></th><th>Lightweight</th><th>Annotated</th></tr></thead>
<tbody>
<tr><td>What it is</td><td>Just a ref in <code>refs/tags/</code> pointing at a commit</td><td>A ref pointing at a tag object, which points at the commit</td></tr>
<tr><td>Stores</td><td>Nothing extra</td><td>Tagger, date, message, optional signature</td></tr>
<tr><td>Create</td><td><code>git tag v2.4.0</code></td><td><code>git tag -a v2.4.0 -m "Coupon stacking"</code></td></tr>
<tr><td>Seen by <code>git describe</code></td><td>Only with <code>--tags</code></td><td>Yes, by default</td></tr>
<tr><td>Pushed by <code>--follow-tags</code></td><td>No</td><td>Yes, if it points at a pushed commit</td></tr>
<tr><td>Use for</td><td>Private bookmarks</td><td>Every release</td></tr>
</tbody>
</table></div>
<pre><code>git tag -a v2.4.0 -m "Coupon stacking release"
git tag -s v2.4.0 -m "Coupon stacking release"
git tag -v v2.4.0
git show v2.4.0
git push origin v2.4.0
git push --follow-tags
git config --global push.followTags true
git tag -d v2.4.0
git push origin --delete v2.4.0</code></pre>
<p>
  A plain <code>git push</code> sends no tags at all. <code>git push --tags</code> sends every tag you
  have, including stray local ones, so <code>--follow-tags</code> is usually the better default.
  <code>-s</code> signs the tag with your GPG or SSH key. <code>tag -v</code> checks it.
</p>
<p>
  <strong>Never move a published tag.</strong> Anyone who has fetched <code>v2.4.0</code> keeps the old
  one, and <code>git fetch</code> will not overwrite an existing tag unless forced. Two people then
  build different code from the same version name. If a release is bad, ship <code>v2.4.1</code>.
</p>

<h4>git describe</h4>
<pre><code>$ git describe
v2.4.0-3-g8f2c9d1

$ git describe --tags --dirty --always
v2.4.0-3-g8f2c9d1-dirty</code></pre>
<p>
  Read it as: nearest annotated tag <code>v2.4.0</code>, <code>3</code> commits after it, at commit
  <code>8f2c9d1</code> (the <code>g</code> stands for git). Exactly on a tag, it prints just the tag.
  <code>--dirty</code> flags uncommitted changes, and <code>--always</code> falls back to a short hash
  when no tag is reachable. It makes a good build label, because it traces any binary back to an
  exact commit.
</p>
<p>
  Semantic versioning reads <code>MAJOR.MINOR.PATCH</code>: a breaking change, a new
  backwards-compatible feature, a backwards-compatible fix. The Conventional Commits table above is
  the bridge from commit messages to those three numbers.
</p>
`,
};
