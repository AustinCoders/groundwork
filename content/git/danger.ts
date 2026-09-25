import type { GitSection } from "./types";

export const gitDanger: GitSection = {
  id: "danger",
  num: "G14",
  title: "Danger zone",
  short: "Danger zone",
  subtitle: "Leaked secrets, force-push accidents, commands that eat work, and how to come back from each one.",
  body: `
<p>
  Almost everything in Git can be undone, because commits are rarely deleted straight away. They
  become unreachable, and the reflog remembers them for weeks. The dangerous cases are the exceptions:
  work that was never committed, history that other people already copied, and data that should never
  have been public. This chapter is about those.
</p>

<h3>You committed a secret</h3>
<p>
  An API key, a database password, a private key. The instinct is to delete the file and commit
  again. That fixes nothing: the secret is still in the earlier commit, and anyone who clones gets
  the full history. If the repository is public, assume the key was copied within minutes. Bots scan
  public pushes for credential patterns continuously.
</p>

<figure>
<svg viewBox="0 0 900 290" class="dg" role="img" aria-label="A timeline for a leaked secret. The key is pushed and the exposure window starts. Step one, rotate the key, closes the window. Step two, audit the provider's logs. Step three, purge history with filter-repo and force-push. Step four, clean up clones, host caches and forks. Underneath, a band lists copies a rewrite never reaches.">
<g class="rough">
<path class="lnr" d="M80 44 H250" />
<path class="lnr" d="M80 36 V52" />
<path class="lnr" d="M250 36 V52" />
<path class="ln" d="M80 110 H820" />
<circle cx="80" cy="110" r="10" style="fill: var(--red)" />
<circle cx="250" cy="110" r="10" style="fill: var(--green)" />
<circle cx="420" cy="110" r="10" style="fill: var(--ink)" />
<circle cx="590" cy="110" r="10" style="fill: var(--ink)" />
<circle cx="760" cy="110" r="10" style="fill: var(--ink)" />
<rect x="20" y="206" width="860" height="66" rx="12" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 2" />
</g>
<text class="sm rd" x="165" y="28" text-anchor="middle">exposure window</text>
<text class="lbl rd" x="80" y="86" text-anchor="middle">key pushed</text>
<text class="lbl gr" x="250" y="86" text-anchor="middle">1. rotate</text>
<text class="lbl" x="420" y="86" text-anchor="middle">2. audit</text>
<text class="lbl" x="590" y="86" text-anchor="middle">3. purge</text>
<text class="lbl" x="760" y="86" text-anchor="middle">4. clean up</text>
<text class="sm" x="80" y="142" text-anchor="middle">scraped within</text>
<text class="sm" x="80" y="160" text-anchor="middle">minutes if public</text>
<text class="sm" x="250" y="142" text-anchor="middle">revoke the old key,</text>
<text class="sm" x="250" y="160" text-anchor="middle">issue a new one</text>
<text class="sm" x="420" y="142" text-anchor="middle">provider logs: was</text>
<text class="sm" x="420" y="160" text-anchor="middle">the old key used?</text>
<text class="sm" x="590" y="142" text-anchor="middle">filter-repo, then</text>
<text class="sm" x="590" y="160" text-anchor="middle">force-push all refs</text>
<text class="sm" x="760" y="142" text-anchor="middle">re-clone, host</text>
<text class="sm" x="760" y="160" text-anchor="middle">support, forks</text>
<text class="lbl" x="40" y="234">Copies a rewrite never reaches</text>
<text class="sm" x="40" y="258">forks · teammates' clones · CI caches · pull request refs · anyone who already scraped it</text>
</svg>
<figcaption>
  Only step 1 closes the exposure. Steps 3 and 4 stop the secret spreading further, but they can't
  pull back a copy someone already has.
</figcaption>
</figure>

<h4>1. Rotate first</h4>
<p>
  Revoke the credential at the provider and issue a new one, before any Git work. Once the old key
  is dead, what's left in history is a curiosity rather than a live threat. Then check the provider's
  access logs for use of the old key while it was exposed. If it was used, this is now a security
  incident, not a Git problem.
</p>

<h4>2. Purge the history</h4>
<p>
  <code>git filter-repo</code> is the tool the Git project recommends. <code>git filter-branch</code>
  is slow, easy to get wrong, and its own manual now warns against it. BFG Repo-Cleaner is an older,
  simpler alternative.
</p>
<pre><code>git clone --mirror https://github.com/org/app.git app-backup.git
git clone https://github.com/org/app.git app-clean
cd app-clean

git filter-repo --invert-paths --path config/.env

echo 'sk_live_51Hx9TQ==&gt;REMOVED' &gt; replacements.txt
git filter-repo --replace-text replacements.txt

git remote add origin https://github.com/org/app.git
git push origin --force --all
git push origin --force --tags</code></pre>
<p>
  <code>--invert-paths --path</code> removes a file from every commit. <code>--replace-text</code>
  rewrites a string wherever it appears, which is right when the secret was pasted into source code.
  filter-repo refuses to run on anything but a fresh clone, and it removes the <code>origin</code>
  remote afterwards so you can't push by accident. Both are deliberate safety features. BFG does the
  same with <code>bfg --delete-files .env</code> or <code>bfg --replace-text passwords.txt</code>, but
  it leaves your latest commit alone by default, so remove the secret from <code>HEAD</code> in a
  normal commit first.
</p>

<h4>3. Why the rewrite is not enough</h4>
<ul>
  <li><strong>Every existing clone still has it.</strong> Teammates must re-clone, or they may push the old history straight back.</li>
  <li><strong>Forks are separate repositories.</strong> Your force-push does not touch them.</li>
  <li><strong>The host keeps references you can't overwrite.</strong> On GitHub, pull requests keep their commits under <code>refs/pull/</code>, and old commits stay reachable by hash until garbage collection. Ask the host's support to remove cached views and PR refs.</li>
  <li><strong>CI caches, artifacts, logs and package registries</strong> may hold copies too.</li>
</ul>
<div class="bx is-ref">
<span class="ttl">Stop the next one</span>
<p>
  Turn on your host's secret scanning and push protection, which reject a push containing a known
  credential format. Add a pre-commit scanner such as gitleaks. Put <code>.env</code> in
  <code>.gitignore</code> before the first commit and commit a <code>.env.example</code> instead. To
  check existing history: <code>git log -p -S "AKIA" --all</code> finds every commit that added or
  removed that string.
</p>
</div>

<h3>Force-push accidents</h3>
<p>
  You rebased your local <code>main</code>, ran <code>git push --force</code>, and your teammate's two
  commits from this morning vanished from the remote. They are not gone. They are unreachable on the
  server, and they still exist in every clone that fetched them.
</p>

<figure>
<svg viewBox="0 0 900 300" class="dg" role="img" aria-label="Before and after a force-push. Before: commits A, B, C and D on the remote, with the teammate's C and D on top. After: the remote main points at your commit E on top of B, and C and D are unreachable but still recorded in reflogs. A rescue box lists the recovery commands.">
<g class="rough">
<path class="ln" d="M80 80 H440" />
<circle cx="80" cy="80" r="9" style="fill: var(--ink)" />
<circle cx="200" cy="80" r="9" style="fill: var(--ink)" />
<circle cx="320" cy="80" r="9" style="fill: var(--green)" />
<circle cx="440" cy="80" r="9" style="fill: var(--green)" />
<path class="ln" d="M80 230 H200" />
<path class="lnr" d="M200 230 C240 230 260 250 311 250" />
<path class="ln dash" d="M200 230 C240 230 260 200 311 200 H431" />
<circle cx="80" cy="230" r="9" style="fill: var(--ink)" />
<circle cx="200" cy="230" r="9" style="fill: var(--ink)" />
<circle cx="320" cy="250" r="9" style="fill: var(--red)" />
<circle cx="320" cy="200" r="9" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="440" cy="200" r="9" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<path class="lng" d="M452 200 H624" marker-end="url(#arrow-green)" />
<rect x="630" y="150" width="250" height="126" rx="12" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
</g>
<text class="sm" x="20" y="36">BEFORE</text>
<text class="sm" x="80" y="110" text-anchor="middle">A</text>
<text class="sm" x="200" y="110" text-anchor="middle">B</text>
<text class="sm gr" x="320" y="110" text-anchor="middle">C</text>
<text class="sm gr" x="440" y="110" text-anchor="middle">D</text>
<text class="lbl" x="460" y="85">origin/main, teammate's work</text>
<text class="sm" x="20" y="150">AFTER git push --force</text>
<text class="sm" x="80" y="260" text-anchor="middle">A</text>
<text class="sm" x="200" y="260" text-anchor="middle">B</text>
<text class="sm" x="320" y="185" text-anchor="middle">C</text>
<text class="sm" x="440" y="185" text-anchor="middle">D</text>
<text class="lbl rd" x="338" y="255">E  origin/main</text>
<text class="sm" x="470" y="228">unreachable,</text>
<text class="sm" x="470" y="246">still in reflogs</text>
<text class="lbl" x="646" y="178">rescue</text>
<text class="sm" x="646" y="204">git reflog show origin/main</text>
<text class="sm" x="646" y="226">git branch rescue &lt;D's hash&gt;</text>
<text class="sm" x="646" y="248">merge or rebase E onto it,</text>
<text class="sm" x="646" y="268">then push normally</text>
</svg>
<figcaption>
  A force-push moves the remote branch. It does not delete C and D anywhere they were already
  fetched, and the server usually keeps them until garbage collection.
</figcaption>
</figure>

<h4>Recovering</h4>
<ol>
  <li><strong>Find the old tip.</strong> The output of the force-push itself shows it: <code>+ 4e1a9c2...7b3f0d8 main -&gt; main (forced update)</code>. The first hash is where the remote was. If the terminal is gone, your teammate runs <code>git reflog show origin/main</code> or just looks at their own <code>main</code>. On GitHub, the branch's activity view lists force-pushes with the before and after hashes.</li>
  <li><strong>Pin it.</strong> <code>git branch rescue 4e1a9c2</code>. Now it can't be garbage-collected.</li>
  <li><strong>Combine and push.</strong> Rebase or merge your work onto <code>rescue</code>, check the result, and push without force. Or, if your push was simply wrong, <code>git push --force-with-lease origin rescue:main</code> puts the remote back exactly as it was.</li>
</ol>
<p class="sub">prevention</p>
<pre><code>git push --force-with-lease
git push --force-with-lease --force-if-includes
git config --global alias.please "push --force-with-lease --force-if-includes"</code></pre>
<p>
  <code>--force-with-lease</code> refuses to push if the remote branch has moved since you last
  fetched it. It has a gap: a background <code>git fetch</code> by your editor updates
  <code>origin/main</code>, and the lease passes even though you never looked at the new commits.
  <code>--force-if-includes</code> (Git 2.30 and later) closes that gap by also checking that the
  remote tip is somewhere in your local branch's reflog. On shared branches, turn on branch
  protection so force-pushes are rejected outright.
</p>

<h3>The commands that destroy work</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>What it destroys</th><th>How to recover</th><th>Safer habit</th></tr></thead>
<tbody>
<tr><td><code>git reset --hard</code></td><td>Uncommitted changes in tracked files, and it moves the branch</td><td>Commits: <code>git reflog</code>, then <code>git reset --hard HEAD@{1}</code>. Staged but uncommitted files: <code>git fsck --lost-found</code> finds their blobs. Unstaged edits: gone.</td><td><code>git stash</code> first, or <code>reset --keep</code></td></tr>
<tr><td><code>git clean -fdx</code></td><td>Untracked and ignored files: <code>.env</code>, local config, build caches</td><td>None from Git. Only your editor's local history or a system backup.</td><td><code>git clean -nd</code> dry run first, or <code>-i</code></td></tr>
<tr><td><code>git restore .</code> or <code>git checkout -- .</code></td><td>Every unstaged edit</td><td>None from Git. Staged versions survive in the index.</td><td>Restore named files, not <code>.</code></td></tr>
<tr><td><code>git push --force</code></td><td>Other people's commits on the remote branch</td><td>Old tip from push output, a teammate's reflog, or the host's activity log</td><td><code>--force-with-lease --force-if-includes</code></td></tr>
<tr><td><code>git branch -D</code></td><td>The branch name, and its own reflog</td><td>Git prints <code>(was 1a2b3c4)</code>. Or search <code>git reflog</code> for when HEAD was on it.</td><td><code>git branch -d</code>, which refuses if unmerged</td></tr>
<tr><td><code>git stash drop</code>, <code>git stash clear</code></td><td>Stash entries</td><td><code>drop</code> prints the hash. After <code>clear</code>, <code>git fsck --unreachable | grep commit</code> and look for "WIP on".</td><td><code>git stash pop</code> only when sure</td></tr>
<tr><td>A rebase that went wrong</td><td>The old shape of the branch</td><td><code>git reset --hard ORIG_HEAD</code> right after, or the entry before the rebase in <code>git reflog</code></td><td><code>git branch backup</code> before a big rebase</td></tr>
<tr><td><code>git filter-repo</code></td><td>All old commit hashes</td><td>Only from a backup clone</td><td><code>git clone --mirror</code> first</td></tr>
<tr><td><code>git reflog expire --expire=now --all</code> then <code>git gc --prune=now</code></td><td>Everything unreachable, for good</td><td>None</td><td>Only run it when you mean to erase, as after a secret purge</td></tr>
</tbody>
</table></div>
<p>
  The pattern: Git protects <em>commits</em> very well, through the reflog and delayed garbage
  collection. It protects <em>uncommitted</em> work hardly at all. When in doubt, commit to a scratch
  branch. A throwaway commit costs nothing and is always recoverable.
</p>

<h3>A large file in history</h3>
<p>
  You committed a 300 MB dataset, or <code>node_modules</code>. GitHub rejects any file over 100 MB,
  so the push fails with <code>this exceeds GitHub's file size limit</code>. Deleting the file in a
  new commit doesn't help: the push still carries the old commit. The fix depends on how far it went.
</p>
<div class="table-scroll"><table>
<thead><tr><th>Where it is</th><th>Fix</th></tr></thead>
<tbody>
<tr><td>In the last commit, not pushed</td><td><code>git rm --cached data.csv</code>, add it to <code>.gitignore</code>, <code>git commit --amend</code></td></tr>
<tr><td>A few commits back, not pushed</td><td><code>git rebase -i</code>, mark that commit <code>edit</code>, remove the file, <code>git commit --amend</code>, <code>git rebase --continue</code></td></tr>
<tr><td>Deep in local history</td><td><code>git filter-repo --path data.csv --invert-paths</code> or <code>--strip-blobs-bigger-than 50M</code></td></tr>
<tr><td>Pushed, and it should be in Git</td><td><code>git lfs migrate import --include="*.psd" --everything</code>, then a coordinated force-push</td></tr>
<tr><td>Pushed and shared, just bloat</td><td>Remove it going forward. Rewrite only if clone size really hurts, since everyone must re-clone.</td></tr>
</tbody>
</table></div>

<h3>A bad merge landed on main</h3>
<p>
  A feature branch was merged and production broke. <code>main</code> is shared and protected, so
  rewriting it is off the table. Revert the merge commit.
</p>
<pre><code>git log --merges --oneline -5
git revert -m 1 9f3e2a1
git push</code></pre>
<p>
  A merge commit has two parents, and <code>-m 1</code> tells Git which one is the mainline to keep:
  parent 1 is the branch you were on when you merged, normally <code>main</code>. The new commit
  undoes everything the feature branch brought in.
</p>
<div class="bx is-ref">
<span class="ttl">The trap when you merge it again</span>
<p>
  After the revert, Git still considers the feature's commits merged. Fix the bug on the branch and
  merge again, and only the fix arrives. The original changes stay reverted. First revert the revert,
  <code>git revert &lt;hash of the revert&gt;</code>, then merge the fix. Or rebuild the feature on
  fresh commits with <code>git rebase --no-ff</code>.
</p>
</div>
<p>
  If the bad merge only reached <code>main</code> seconds ago, nobody has pulled it, and the branch
  isn't protected, <code>git reset --hard HEAD~1</code> plus <code>git push --force-with-lease</code>
  is cleaner. Otherwise, revert. It's the one fix that never surprises a teammate.
</p>

<h3>Big conflicts in a rebase</h3>
<p>
  When a rebase throws conflicts in twenty files, commit after commit, stop grinding.
  <code>git rebase --abort</code> puts everything back. A merge resolves each conflicting region once
  rather than once per replayed commit. If you really need the rebase, turn on
  <code>git config --global rerere.enabled true</code> first. Git then records each resolution and
  replays it automatically the next time the same conflict appears.
</p>
`,
};
