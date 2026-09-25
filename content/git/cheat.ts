import type { GitSection } from "./types";

export const gitCheat: GitSection = {
  id: "cheat",
  num: "G16",
  title: "Cheat sheet",
  short: "Cheat sheet",
  subtitle: "Every command worth knowing, grouped by the job you're doing, plus the setup to run once per machine.",
  body: `
<h3>One-time setup on a new machine</h3>
<p>
  Worth doing properly, once. These settings remove most everyday friction: no more "set upstream"
  errors, clearer conflicts, remembered resolutions and pruned remote branches.
</p>
<pre><code>git config --global user.name "Your Name"
git config --global user.email "you@company.com"
git config --global init.defaultBranch main
git config --global pull.rebase true
git config --global push.autoSetupRemote true
git config --global push.followTags true
git config --global fetch.prune true
git config --global merge.conflictStyle zdiff3
git config --global rerere.enabled true
git config --global rebase.autoSquash true
git config --global rebase.updateRefs true
git config --global diff.algorithm histogram
git config --global branch.sort -committerdate
git config --global core.editor "code --wait"

git config --global alias.lg "log --oneline --graph --decorate --all"
git config --global alias.st "status -sb"
git config --global alias.last "log -1 --stat"
git config --global alias.unstage "restore --staged"
git config --global alias.please "push --force-with-lease --force-if-includes"</code></pre>
<p>
  Check where any setting comes from with <code>git config --show-origin --get pull.rebase</code>,
  and list everything with <code>git config --list --show-origin</code>.
</p>

<h3>Which undo do I need?</h3>

<figure>
<svg viewBox="0 0 900 380" class="dg" role="img" aria-label="A decision chart for undoing a change. First question: is the change committed? If not, is it staged? Staged: git restore --staged. Not staged: git restore. If it is committed, has it been pushed? Not pushed: git reset --soft HEAD~1, or amend, or interactive rebase. Pushed: git revert. At the bottom: git reflog finds anything HEAD pointed to.">
<g class="rough">
<rect x="310" y="20" width="280" height="50" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="60" y="130" width="240" height="50" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<rect x="600" y="130" width="240" height="50" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
<path class="ln" d="M310 45 H180 V124" marker-end="url(#arrow)" />
<path class="ln" d="M590 45 H720 V124" marker-end="url(#arrow)" />
<path class="ln" d="M180 180 V212 H117 V244" marker-end="url(#arrow)" />
<path class="ln" d="M180 212 H337 V244" marker-end="url(#arrow)" />
<path class="ln" d="M720 180 V212 H562 V244" marker-end="url(#arrow)" />
<path class="ln" d="M720 212 H782 V244" marker-end="url(#arrow)" />
<rect x="15" y="250" width="205" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="235" y="250" width="205" height="64" rx="10" style="fill: var(--sheet); stroke: var(--red); stroke-width: 1.8" />
<rect x="460" y="250" width="205" height="64" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
<rect x="680" y="250" width="205" height="64" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
<rect x="15" y="330" width="870" height="40" rx="10" style="fill: var(--sheet-2); stroke: var(--line-soft); stroke-width: 1.6" />
</g>
<text class="lbl" x="450" y="51" text-anchor="middle">Is the change committed?</text>
<text class="lbl" x="180" y="161" text-anchor="middle">Is it staged?</text>
<text class="lbl" x="720" y="161" text-anchor="middle">Has it been pushed?</text>
<text class="sm" x="245" y="36" text-anchor="middle">no</text>
<text class="sm" x="655" y="36" text-anchor="middle">yes</text>
<text class="sm" x="140" y="232" text-anchor="middle">yes</text>
<text class="sm" x="300" y="232" text-anchor="middle">no</text>
<text class="sm" x="600" y="232" text-anchor="middle">no</text>
<text class="sm" x="760" y="232" text-anchor="middle">yes</text>
<text class="lbl" x="117" y="278" text-anchor="middle">restore --staged f</text>
<text class="sm" x="117" y="301" text-anchor="middle">unstage, keep the edits</text>
<text class="lbl" x="337" y="278" text-anchor="middle">git restore f</text>
<text class="sm rd" x="337" y="301" text-anchor="middle">discards edits for good</text>
<text class="lbl" x="562" y="278" text-anchor="middle">reset --soft HEAD~1</text>
<text class="sm" x="562" y="301" text-anchor="middle">or --amend, or rebase -i</text>
<text class="lbl" x="782" y="278" text-anchor="middle">git revert &lt;sha&gt;</text>
<text class="sm" x="782" y="301" text-anchor="middle">new commit, safe to push</text>
<text class="sm" x="450" y="355" text-anchor="middle">Lost something along the way? git reflog lists every commit HEAD pointed to in the last 90 days.</text>
</svg>
<figcaption>
  Two questions decide it. Uncommitted work is cheap to undo but easy to lose for good. Pushed
  commits are undone with a new commit, never by rewriting what others already have.
</figcaption>
</figure>

<h3>Setup and config</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git init</code></td><td>Start a repository in the current folder</td></tr>
<tr><td><code>git clone &lt;url&gt;</code></td><td>Copy a remote repository with its full history</td></tr>
<tr><td><code>git clone --filter=blob:none &lt;url&gt;</code></td><td>Clone all history, fetch file contents on demand</td></tr>
<tr><td><code>git clone --depth 1 &lt;url&gt;</code></td><td>Latest commit only, for CI</td></tr>
<tr><td><code>git config --global &lt;key&gt; &lt;value&gt;</code></td><td>Set an option for every repository you use</td></tr>
<tr><td><code>git config --list --show-origin</code></td><td>Every setting, and the file it came from</td></tr>
<tr><td><code>git help &lt;command&gt;</code></td><td>The full manual page</td></tr>
</tbody>
</table></div>

<h3>Inspect</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git status -sb</code></td><td>Compact state: branch, ahead or behind, changed files</td></tr>
<tr><td><code>git diff</code></td><td>Unstaged changes</td></tr>
<tr><td><code>git diff --staged</code></td><td>Exactly what the next commit will contain</td></tr>
<tr><td><code>git diff main...HEAD</code></td><td>What your branch changed since it left <code>main</code></td></tr>
<tr><td><code>git log --oneline --graph --all</code></td><td>The whole commit graph, one line per commit</td></tr>
<tr><td><code>git log -p -- &lt;file&gt;</code></td><td>Every change to one file, with diffs</td></tr>
<tr><td><code>git log main..feature</code></td><td>Commits on <code>feature</code> that <code>main</code> doesn't have</td></tr>
<tr><td><code>git show &lt;sha&gt;</code></td><td>One commit's message and diff</td></tr>
<tr><td><code>git show &lt;sha&gt;:path/file</code></td><td>A file as it was at that commit</td></tr>
<tr><td><code>git shortlog -sn</code></td><td>Commit counts per author</td></tr>
</tbody>
</table></div>

<h3>Stage and commit</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git add &lt;file&gt;</code></td><td>Stage a file</td></tr>
<tr><td><code>git add -p</code></td><td>Stage hunk by hunk</td></tr>
<tr><td><code>git commit -m "..."</code></td><td>Commit the staged changes</td></tr>
<tr><td><code>git commit -v</code></td><td>Write the message with the diff in view</td></tr>
<tr><td><code>git commit --amend</code></td><td>Replace the last commit (unpushed only)</td></tr>
<tr><td><code>git commit --amend --no-edit</code></td><td>Add staged changes to the last commit, keep the message</td></tr>
<tr><td><code>git commit --fixup=&lt;sha&gt;</code></td><td>A fix to be squashed into an earlier commit</td></tr>
<tr><td><code>git commit -s</code></td><td>Add a <code>Signed-off-by</code> trailer</td></tr>
<tr><td><code>git commit -S</code></td><td>Sign the commit with your GPG or SSH key</td></tr>
<tr><td><code>git rm --cached &lt;file&gt;</code></td><td>Stop tracking a file, keep it on disk</td></tr>
<tr><td><code>git mv &lt;old&gt; &lt;new&gt;</code></td><td>Rename, including case-only renames</td></tr>
</tbody>
</table></div>

<h3>Branch</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git branch -vv</code></td><td>Local branches with their upstream and ahead or behind counts</td></tr>
<tr><td><code>git switch &lt;name&gt;</code></td><td>Move to a branch</td></tr>
<tr><td><code>git switch -c &lt;name&gt;</code></td><td>Create a branch and move to it</td></tr>
<tr><td><code>git switch -</code></td><td>Back to the previous branch</td></tr>
<tr><td><code>git switch --detach &lt;sha&gt;</code></td><td>Look at an old commit without a branch</td></tr>
<tr><td><code>git branch -m &lt;new&gt;</code></td><td>Rename the current branch</td></tr>
<tr><td><code>git branch -d &lt;name&gt;</code></td><td>Delete a merged branch</td></tr>
<tr><td><code>git branch -D &lt;name&gt;</code></td><td>Delete even if unmerged</td></tr>
<tr><td><code>git branch --merged main</code></td><td>Branches already merged, safe to delete</td></tr>
</tbody>
</table></div>

<h3>Remote</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git remote -v</code></td><td>List remotes and their URLs</td></tr>
<tr><td><code>git remote add upstream &lt;url&gt;</code></td><td>Add a second remote, such as the original of a fork</td></tr>
<tr><td><code>git fetch --prune</code></td><td>Download new commits, drop refs deleted on the remote</td></tr>
<tr><td><code>git pull</code></td><td>Fetch, then merge or rebase into the current branch</td></tr>
<tr><td><code>git push</code></td><td>Send the current branch to its upstream</td></tr>
<tr><td><code>git push -u origin &lt;branch&gt;</code></td><td>First push, and set the upstream</td></tr>
<tr><td><code>git push --force-with-lease</code></td><td>Force-push without overwriting commits you haven't seen</td></tr>
<tr><td><code>git push origin --delete &lt;branch&gt;</code></td><td>Delete a remote branch</td></tr>
</tbody>
</table></div>

<h3>Merge and rebase</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git merge &lt;branch&gt;</code></td><td>Merge into the current branch, fast-forward if possible</td></tr>
<tr><td><code>git merge --no-ff &lt;branch&gt;</code></td><td>Always record a merge commit</td></tr>
<tr><td><code>git merge --squash &lt;branch&gt;</code></td><td>Stage the branch's changes as one commit</td></tr>
<tr><td><code>git merge --abort</code></td><td>Back out of a conflicted merge</td></tr>
<tr><td><code>git rebase main</code></td><td>Replay your commits on top of <code>main</code></td></tr>
<tr><td><code>git rebase -i &lt;base&gt;</code></td><td>Squash, reword, reorder or drop commits</td></tr>
<tr><td><code>git rebase --onto &lt;new&gt; &lt;old&gt;</code></td><td>Move a branch from one base to another</td></tr>
<tr><td><code>git rebase --continue</code> / <code>--abort</code></td><td>Carry on after resolving, or give up and restore</td></tr>
<tr><td><code>git cherry-pick -x &lt;sha&gt;</code></td><td>Copy one commit here, noting the original hash</td></tr>
<tr><td><code>git checkout --ours</code> / <code>--theirs &lt;file&gt;</code></td><td>Take one side of a conflicted file</td></tr>
</tbody>
</table></div>

<h3>Undo</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git restore &lt;file&gt;</code></td><td>Discard unstaged edits to a file</td></tr>
<tr><td><code>git restore --staged &lt;file&gt;</code></td><td>Unstage, keep the edits</td></tr>
<tr><td><code>git restore --source=&lt;sha&gt; &lt;file&gt;</code></td><td>Bring back a file as it was at a commit</td></tr>
<tr><td><code>git reset --soft HEAD~1</code></td><td>Undo the last commit, keep its changes staged</td></tr>
<tr><td><code>git reset HEAD~1</code></td><td>Undo the last commit, keep its changes unstaged</td></tr>
<tr><td><code>git reset --hard &lt;sha&gt;</code></td><td>Move the branch and discard all uncommitted work</td></tr>
<tr><td><code>git revert &lt;sha&gt;</code></td><td>New commit that undoes a pushed one</td></tr>
<tr><td><code>git revert -m 1 &lt;merge&gt;</code></td><td>Undo a whole merge</td></tr>
<tr><td><code>git reflog</code></td><td>Every place HEAD has been: find "lost" commits</td></tr>
<tr><td><code>git reset --hard ORIG_HEAD</code></td><td>Undo the merge, rebase or reset you just did</td></tr>
<tr><td><code>git clean -nd</code></td><td>Preview which untracked files <code>clean -fd</code> would delete</td></tr>
</tbody>
</table></div>

<h3>Investigate</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git blame -w -C &lt;file&gt;</code></td><td>Who last changed each line, ignoring whitespace and moves</td></tr>
<tr><td><code>git blame -L 40,60 &lt;file&gt;</code></td><td>Blame just those lines</td></tr>
<tr><td><code>git log -S "text"</code></td><td>Commits that added or removed that string</td></tr>
<tr><td><code>git log -G "regex"</code></td><td>Commits whose diff matches a pattern</td></tr>
<tr><td><code>git log -L :funcName:file</code></td><td>History of one function</td></tr>
<tr><td><code>git log --follow &lt;file&gt;</code></td><td>A file's history through renames</td></tr>
<tr><td><code>git grep "text" &lt;sha&gt;</code></td><td>Search the files of any commit</td></tr>
<tr><td><code>git bisect start</code>, <code>good</code>, <code>bad</code></td><td>Binary-search for the commit that broke something</td></tr>
<tr><td><code>git bisect run &lt;cmd&gt;</code></td><td>Let a script mark each step</td></tr>
<tr><td><code>git merge-base main HEAD</code></td><td>Where your branch left <code>main</code></td></tr>
</tbody>
</table></div>

<h3>Stash and worktrees</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git stash -u</code></td><td>Park all changes, including untracked files</td></tr>
<tr><td><code>git stash push -m "msg" &lt;file&gt;</code></td><td>Stash specific files with a label</td></tr>
<tr><td><code>git stash list</code></td><td>Show stashes</td></tr>
<tr><td><code>git stash pop</code></td><td>Reapply the latest stash and drop it</td></tr>
<tr><td><code>git stash apply stash@{2}</code></td><td>Reapply a stash and keep it</td></tr>
<tr><td><code>git stash branch &lt;name&gt;</code></td><td>Turn a stash into a branch</td></tr>
<tr><td><code>git worktree add ../hotfix main</code></td><td>A second working folder on another branch, no stashing</td></tr>
<tr><td><code>git worktree list</code> / <code>remove &lt;dir&gt;</code></td><td>Manage extra worktrees</td></tr>
</tbody>
</table></div>

<h3>Tags and releases</h3>
<div class="table-scroll"><table>
<thead><tr><th>Command</th><th>Does</th></tr></thead>
<tbody>
<tr><td><code>git tag -a v1.2.0 -m "msg"</code></td><td>Annotated tag, the kind to use for releases</td></tr>
<tr><td><code>git tag -s v1.2.0 -m "msg"</code></td><td>Signed annotated tag</td></tr>
<tr><td><code>git tag -l "v1.*"</code></td><td>List matching tags</td></tr>
<tr><td><code>git push origin v1.2.0</code></td><td>Push one tag</td></tr>
<tr><td><code>git push --follow-tags</code></td><td>Push commits plus annotated tags that point at them</td></tr>
<tr><td><code>git describe --tags --always</code></td><td>Label like <code>v1.2.0-3-g8f2c9d1</code> for builds</td></tr>
<tr><td><code>git tag -v v1.2.0</code></td><td>Verify a tag's signature</td></tr>
<tr><td><code>git tag -d v1.2.0</code> then <code>git push origin --delete v1.2.0</code></td><td>Delete a tag locally and on the remote</td></tr>
<tr><td><code>git log v1.1.0..v1.2.0 --oneline</code></td><td>What changed between two releases</td></tr>
</tbody>
</table></div>

<h3>How to actually learn this</h3>
<ol>
  <li>Make a throwaway repository today. Break it on purpose: hard reset too far, force-push over yourself, create a conflict. Recover each time. Confidence comes from having already broken things somewhere it didn't matter.</li>
  <li>Run <code>git lg</code> after every operation for a week. Watching the graph move is how the pointer model stops being abstract.</li>
  <li>Read your own diff before every commit. It's the highest-value habit on this page.</li>
  <li>When you're stuck, ask "where is the pointer, and where do I want it?" That question answers most Git problems.</li>
</ol>
`,
};
