import type { GitSection } from "./types";

export const gitInterview: GitSection = {
  id: "interview",
  num: "G15",
  title: "Interview bank",
  short: "Interview bank",
  subtitle:
    "Questions interviewers actually ask, from fresher to senior, with short answers you can defend under follow-up.",
  body: `
<p>
  Each answer is written to be said out loud in under a minute. Scenario questions are marked. In
  those, the interviewer cares less about the exact command than about the order you do things in
  and the risk you notice.
</p>

<h3>Fresher</h3>

<div class="qa">
  <span class="q">What's the difference between Git and GitHub?</span>
  <p>Git is the version control tool that runs on your machine. GitHub is a hosting service for Git repositories that adds collaboration on top: pull requests, issues, CI, permissions. GitLab and Bitbucket are alternatives. You can use Git with no host at all.</p>
</div>
<div class="qa">
  <span class="q">What is a commit?</span>
  <p>A snapshot of the whole project at one moment, not a diff. It stores a pointer to a tree (the files), pointers to its parent commits, the author, the committer, and a message. Its ID is a hash of all of that, so changing anything about a commit, even its parent, gives it a new ID.</p>
</div>
<div class="qa">
  <span class="q">What does the staging area do?</span>
  <p>It's a draft of the next commit. It lets you choose which of your current changes go into this commit and which wait for the next one, so commits stay focused even when you edited several things at once. <code>git add -p</code> goes further and stages part of a file.</p>
</div>
<div class="qa">
  <span class="q">What is a branch, and why are branches cheap in Git?</span>
  <p>A branch is a file containing one commit hash: a movable label. Creating one writes a few dozen bytes and copies nothing. When you commit, the current branch moves forward to the new commit. That's why Git encourages a branch per task.</p>
</div>
<div class="qa">
  <span class="q">What is HEAD?</span>
  <p>A pointer to where you are. Normally it points to a branch, which points to a commit. If it points straight at a commit instead, you're in detached HEAD state.</p>
</div>
<div class="qa">
  <span class="q">Explain the difference between fetch and pull.</span>
  <p>Fetch downloads new commits and updates remote-tracking branches like <code>origin/main</code>. It never touches your files, so it's always safe. Pull is fetch followed by a merge or rebase into your current branch, so it can produce conflicts.</p>
</div>
<div class="qa">
  <span class="q">What's the difference between <code>main</code> and <code>origin/main</code>?</span>
  <p><code>main</code> is your local branch. <code>origin/main</code> is your repository's memory of where <code>main</code> was on the remote the last time you fetched. It only moves when you fetch, pull or push, and you never commit to it directly.</p>
</div>
<div class="qa">
  <span class="q">What does <code>git clone</code> actually do?</span>
  <p>It creates a repository, downloads every commit and object from the remote, adds the remote under the name <code>origin</code>, creates remote-tracking branches for its branches, and checks out the default branch. You get the full history, not just the latest files.</p>
</div>
<div class="qa">
  <span class="q">How do you resolve a merge conflict?</span>
  <p><code>git status</code> lists the conflicted files. Open each one and decide what the final code should be, often a mix of both sides. Delete the conflict markers, <code>git add</code> the file to mark it resolved, then <code>git commit</code> (or <code>git rebase --continue</code> during a rebase). <code>git merge --abort</code> backs out completely.</p>
</div>
<div class="qa">
  <span class="q">You added a file to <code>.gitignore</code> but Git still tracks it. Why?</span>
  <p><code>.gitignore</code> only affects untracked files. Once a file is tracked, Git keeps tracking it. Run <code>git rm --cached path</code> to stop tracking it while keeping it on disk, then commit. If it held a secret, removing it now does nothing for history: rotate the secret.</p>
</div>
<div class="qa">
  <span class="q">When would you use <code>git stash</code>?</span>
  <p>When you need a clean working tree for a moment, for example to switch branches for an urgent fix, but your current work isn't ready to commit. <code>git stash</code> sets it aside, <code>git stash pop</code> brings it back. Use <code>-u</code> to include untracked files. For anything longer than an hour, a commit on a branch is safer.</p>
</div>
<div class="qa">
  <span class="q">What is detached HEAD, and how do you avoid losing work in it?</span>
  <p>It happens when you check out a commit or tag directly. You can look around and even commit, but no branch moves with you, so switching away leaves those commits unreachable. If you made commits you want, run <code>git switch -c new-branch</code> before leaving.</p>
</div>
<div class="qa">
  <span class="q">Scenario: you made three commits on <code>main</code> that should have been on a feature branch. Nothing is pushed.</span>
  <p><code>git branch feature</code> labels the current commit, so the work is safe. Then <code>git reset --hard origin/main</code> moves <code>main</code> back to where the remote is. <code>git switch feature</code> and carry on. The commits never moved. Only the labels did.</p>
</div>
<div class="qa">
  <span class="q">Scenario: there's a typo in your last commit message.</span>
  <p><code>git commit --amend</code> opens the message for editing and replaces the commit. If it's not pushed, that's the end of it. If it's pushed to your own branch, <code>git push --force-with-lease</code>. If it's on a shared branch, leave it. A typo isn't worth rewriting shared history.</p>
</div>

<h3>Mid-level</h3>

<div class="qa">
  <span class="q">Merge or rebase: which and why?</span>
  <p>Merge keeps the true shape of history and never rewrites anything, so it's correct for shared branches. Rebase gives a clean linear history but creates new commits, so it's only for work nobody else has. A common policy: rebase your feature branch onto <code>main</code> while you work, then merge or squash-merge the pull request.</p>
</div>
<div class="qa">
  <span class="q">Explain the three modes of <code>git reset</code>.</span>
  <p>All three move the current branch to another commit. <code>--soft</code> stops there, so your changes stay staged. <code>--mixed</code>, the default, also resets the staging area, so changes stay in your files but unstaged. <code>--hard</code> also overwrites the working tree, which throws away uncommitted work permanently.</p>
</div>
<div class="qa">
  <span class="q">When would you use revert instead of reset?</span>
  <p>Whenever the commit is already pushed to a shared branch. Revert adds a new commit that undoes the old one, so nobody's history breaks and the record honestly shows the change went in and came out. Reset rewrites history and forces everyone else to recover.</p>
</div>
<div class="qa">
  <span class="q">What's a fast-forward merge, and why would you use <code>--no-ff</code>?</span>
  <p>If your branch hasn't moved since the feature branched off, Git can just slide the branch label forward, with no merge commit. <code>--no-ff</code> always makes a merge commit, which records that these commits arrived together as one feature and lets you revert the whole feature with one <code>git revert -m 1</code>.</p>
</div>
<div class="qa">
  <span class="q">What does interactive rebase let you do?</span>
  <p>Rewrite a branch before review: squash noisy commits, reword messages, drop commits, reorder them, or stop at one to change its code. Combined with <code>git commit --fixup</code> and <code>--autosquash</code>, fixes land in the right commit automatically. The goal is commits that each make one coherent, revertable change.</p>
</div>
<div class="qa">
  <span class="q">Cherry-pick: what is it and what's the catch?</span>
  <p>It applies one commit's changes onto another branch, typically to backport a fix to a release branch. The catch is that it creates a new commit with a new hash, so the same change exists twice in the graph. Use <code>-x</code> so the message records the original hash, which makes the duplicate traceable.</p>
</div>
<div class="qa">
  <span class="q"><code>--force</code> versus <code>--force-with-lease</code>?</span>
  <p><code>--force</code> overwrites the remote branch no matter what is there. <code>--force-with-lease</code> only overwrites it if it's still where your <code>origin/...</code> ref says, so it fails instead of deleting a teammate's new commits. Add <code>--force-if-includes</code> to also guard against a background fetch having moved that ref without you noticing.</p>
</div>
<div class="qa">
  <span class="q">What is the reflog, and how long does it keep things?</span>
  <p>A local log of every position <code>HEAD</code> and each branch has had: commits, resets, rebases, checkouts. It's how you find commits that no branch points to any more. By default entries are kept 90 days, or 30 days for commits that are no longer reachable. It's per clone and never pushed.</p>
</div>
<div class="qa">
  <span class="q">What does <code>git pull --rebase</code> do, and why do teams set it as default?</span>
  <p>It fetches, then replays your local unpushed commits on top of the new remote tip instead of creating a merge commit. That avoids the "Merge branch 'main' of github.com…" noise in history. Set it with <code>git config --global pull.rebase true</code>. It's safe because it only rewrites commits you haven't pushed.</p>
</div>
<div class="qa">
  <span class="q">Squash merging: pros and cons?</span>
  <p>Pro: one clean commit per pull request on <code>main</code>, easy to read and revert. Con: the branch's individual commits are lost from <code>main</code>, so <code>bisect</code> can only narrow things down to the whole PR. Also, Git no longer sees the branch as merged, so <code>git branch -d</code> refuses and continuing work on that branch causes repeat conflicts. Start a fresh branch after a squash merge.</p>
</div>
<div class="qa">
  <span class="q">Lightweight versus annotated tags?</span>
  <p>A lightweight tag is just a ref pointing at a commit. An annotated tag is a real object with a tagger, date, message and optional signature. <code>git describe</code> and <code>git push --follow-tags</code> use annotated tags by default. Releases should always be annotated.</p>
</div>
<div class="qa">
  <span class="q">Scenario: your pull request has fifteen commits like "wip" and "fix lint". The reviewer asks you to clean it up.</span>
  <p><code>git fetch</code>, then <code>git rebase -i origin/main</code>. Squash the noise into a few meaningful commits and reword the messages. Run the tests at the end, then <code>git push --force-with-lease</code>. It's your branch, so rewriting is fine. Mention that review comments tied to old commits may show as outdated.</p>
</div>
<div class="qa">
  <span class="q">Scenario: a fix merged to <code>main</code> must also ship in the <code>release/2.3</code> patch.</span>
  <p><code>git switch release/2.3</code>, <code>git cherry-pick -x &lt;hash&gt;</code>, resolve any conflicts, run tests, push, and tag <code>v2.3.1</code>. For a fix spread across several commits, cherry-pick the range, or cherry-pick the merge commit with <code>-m 1</code>. Fixing on <code>main</code> first and backporting keeps <code>main</code> from missing a fix.</p>
</div>
<div class="qa">
  <span class="q">Scenario: you ran <code>git reset --hard HEAD~3</code> on the wrong branch.</span>
  <p><code>git reflog</code> shows the entry just before the reset, something like <code>HEAD@{1}</code>. <code>git reset --hard HEAD@{1}</code> puts the branch back. The three commits were never deleted, only unreferenced. Any uncommitted changes in files at the time, though, are gone.</p>
</div>

<h3>Senior</h3>

<div class="qa">
  <span class="q">How does Git store data internally?</span>
  <p>As a content-addressed object database with four object types: blobs (file contents), trees (directories), commits (a tree, parents and metadata) and annotated tags. Each object's ID is a hash of its content, so identical content is stored once and changing any commit changes the IDs of every commit after it. Objects start as loose zlib-compressed files and are later packed into packfiles with delta compression.</p>
</div>
<div class="qa">
  <span class="q">Does Git track renames?</span>
  <p>No. A commit only has a tree, and there's no rename record. Commands detect renames on the fly by comparing removed and added files by similarity, 50% by default. That's why a rename plus heavy edits in one commit can show as a delete and an add. Keep big renames in their own commit, and use <code>git log --follow</code> for a single file's history.</p>
</div>
<div class="qa">
  <span class="q">What merge strategies does Git have?</span>
  <p><code>ort</code> is the default for two-head merges since Git 2.34, replacing <code>recursive</code>. It's much faster and handles renames better. <code>octopus</code> merges more than two branches if there are no conflicts. The <code>ours</code> strategy records a merge but keeps your tree entirely, which is different from <code>-X ours</code>: that option only picks your side for conflicting hunks and still merges everything else.</p>
</div>
<div class="qa">
  <span class="q">What happens during <code>git gc</code>?</span>
  <p>It packs loose objects into packfiles with delta compression, packs refs into one file, expires old reflog entries, and prunes unreachable objects older than the grace period, two weeks by default. The grace period protects objects a running command might be about to reference. Modern setups rely on <code>git maintenance</code> to do this in small background steps.</p>
</div>
<div class="qa">
  <span class="q">Git uses SHA-1. Is that a security problem?</span>
  <p>SHA-1 collisions have been demonstrated, so Git switched to a hardened SHA-1 implementation that detects the known collision attack and refuses such objects. Git has also supported SHA-256 repositories (<code>git init --object-format=sha256</code>) since 2.29, and the project is moving toward making it the default. Host support is still uneven. Trust in history really comes from signatures on commits and tags, plus protected branches.</p>
</div>
<div class="qa">
  <span class="q">What does a signed commit prove?</span>
  <p>That someone holding a particular private key created that commit object. Not that the code was reviewed, and not that the author field is true when the signer is someone else, for example after a rebase or a host squash-merge. It's useful for supply-chain policies combined with required reviews and branch protection, not instead of them.</p>
</div>
<div class="qa">
  <span class="q">Scenario: a teammate force-pushed and wiped a day of commits from <code>main</code>. Recover them.</span>
  <p>The old tip is in the force-push output, in anyone's <code>git reflog show origin/main</code>, or in the host's branch activity log. <code>git branch rescue &lt;hash&gt;</code> to pin it, combine it with the new work, check, and push normally. Then fix the cause: branch protection that blocks force-pushes, and a team alias for <code>--force-with-lease --force-if-includes</code>.</p>
</div>
<div class="qa">
  <span class="q">Scenario: a secret got committed and pushed. What now?</span>
  <p>Rotate it first. It's compromised the moment it left the machine, and that's the only step that actually closes the hole. Check the provider's logs for use. Then purge with <code>git filter-repo</code> from a fresh clone, force-push every branch and tag, have everyone re-clone, and ask the host to clear cached views and pull request refs. Check forks. Afterwards add push protection and a pre-commit scanner.</p>
</div>
<div class="qa">
  <span class="q">Scenario: a regression appeared somewhere in the last 400 commits.</span>
  <p><code>git bisect start</code>, <code>git bisect bad</code>, <code>git bisect good &lt;last known good&gt;</code>. Git binary-searches, about nine steps for 400 commits. With a script that exits 0 for good and 1 for bad, <code>git bisect run ./check.sh</code> does it unattended. Exit code 125 means skip, for commits that don't build. Merge-heavy history works fine. Commits that don't build weaken it, which is an argument for atomic commits.</p>
</div>
<div class="qa">
  <span class="q">Scenario: a feature merge broke production. You reverted it. Next week the fixed feature is merged again and half of it is missing. Why?</span>
  <p>The revert undid the changes, but Git still records the feature's commits as merged. The second merge only brings in commits made after the first merge, which is just the fix. The fix is to revert the revert first, then merge the fixed branch. Or rebuild the feature on new commits before merging.</p>
</div>
<div class="qa">
  <span class="q">Scenario: how would you speed up Git in a large monorepo?</span>
  <p>Measure first: <code>GIT_TRACE2_PERF=1</code>, <code>git count-objects -vH</code> and git-sizer tell you whether it's history size, file count or big blobs. Then: blobless partial clones and cone-mode sparse-checkout for developers, or just <code>scalar clone</code>. <code>git maintenance start</code> with commit-graph for history operations. fsmonitor and the untracked cache for <code>status</code>. LFS for binaries. In CI, shallow or treeless clones plus caching.</p>
</div>
<div class="qa">
  <span class="q">Scenario: CI only wants to test packages changed in a pull request, but <code>git diff</code> against <code>main</code> fails in CI.</span>
  <p>The CI checkout is probably shallow, so <code>git merge-base</code> can't find the common ancestor and <code>git diff origin/main...HEAD</code> breaks. Fetch the base branch and enough depth, or use a blobless clone with full history (<code>fetch-depth: 0</code> plus <code>--filter=blob:none</code>), which is cheap and keeps merge-base working.</p>
</div>
<div class="qa">
  <span class="q">Which branching strategy would you pick for this team, and why?</span>
  <p>Tie it to release cadence. A web app deployed continuously: trunk-based or GitHub Flow, because long-lived branches only add merge pain when you ship daily. Several supported versions, or mobile and on-premise releases: release branches cut from <code>main</code> with fixes backported by cherry-pick. Then name the cost: trunk-based needs feature flags and strong CI. Release branches need discipline about backports.</p>
</div>
<div class="qa">
  <span class="q">Scenario: a long-lived branch has diverged from <code>main</code> for six months. How do you land it?</span>
  <p>Don't try one big rebase. Merge <code>main</code> into the branch in steps, maybe a month of <code>main</code> at a time, with <code>rerere</code> on so repeated conflicts resolve themselves. Get the tests green at each step. Then ship it in slices behind a feature flag rather than one enormous merge. Next time, prevent it by merging <code>main</code> in weekly or not letting branches live that long.</p>
</div>
<div class="qa">
  <span class="q">Submodules, subtrees or a monorepo?</span>
  <p>Submodules pin another repository at an exact commit. Precise, but everyone must remember <code>--recurse-submodules</code>, and changes that span repositories take two commits and two reviews. Subtree copies the other project's files into yours, so clones are simple but syncing back is manual. A monorepo gives atomic cross-project changes and one set of tooling, at the cost of needing sparse-checkout, partial clone and build tools that understand what changed.</p>
</div>
<div class="qa">
  <span class="q">Scenario: you own Git standards for 200 repositories. How do you enforce them?</span>
  <p>On the server, because client hooks are optional. Organisation-wide rulesets or branch protection: no force-push or deletion of <code>main</code>, required reviews, required status checks, and optionally signed commits and linear history. <code>CODEOWNERS</code> for review routing. Secret scanning with push protection. Lint commit messages or PR titles in CI. Then give developers a shared hook config so they see failures locally before CI does.</p>
</div>

<div class="bx is-ref">
<span class="ttl">How to answer well</span>
<p>
  Name the concept, then give one concrete situation where you used it. "Rebase rewrites commits so
  their hashes change" is a textbook answer. "We rebase feature branches so <code>main</code> stays
  linear, but not after review starts, because reviewers lose track of what changed" tells the
  interviewer you've actually lived with the trade-off.
</p>
</div>
`,
};
