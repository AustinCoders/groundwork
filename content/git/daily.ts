import type { GitSection } from "./types";

export const gitDaily: GitSection = {
  id: "daily",
  num: "G4",
  title: "The everyday commands",
  short: "Everyday commands",
  subtitle:
    'The loop you run hundreds of times a week, and the history-reading tools that turn "who changed this?" into a one-liner.',
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    This is the loop you'll run several hundred times a week.
    Nothing here is clever; fluency is the point. The second half of
    the chapter is about reading history, which is where experienced
    engineers get most of their value out of Git.
  </p>

  <figure>
    <svg viewBox="0 0 900 230" class="dg" role="img" aria-label="The daily loop in eight steps. Top row, left to right: status, switch -c, edit, diff. Then down to the bottom row, right to left: add -p, commit, fetch and rebase, push. Then back up to status for the next task.">
      <g class="rough">
        <rect x="20" y="40" width="180" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="250" y="40" width="180" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="480" y="40" width="180" height="56" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="710" y="40" width="170" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="710" y="150" width="170" height="56" rx="10" style="fill: var(--dg-box-yellow); stroke: var(--dg-yellow-stroke); stroke-width: 2" />
        <rect x="480" y="150" width="180" height="56" rx="10" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
        <rect x="250" y="150" width="180" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="20" y="150" width="180" height="56" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <path class="ln" d="M200 68 H246" marker-end="url(#arrow)" />
        <path class="ln" d="M430 68 H476" marker-end="url(#arrow)" />
        <path class="ln" d="M660 68 H706" marker-end="url(#arrow)" />
        <path class="ln" d="M795 96 V146" marker-end="url(#arrow)" />
        <path class="ln" d="M710 178 H664" marker-end="url(#arrow)" />
        <path class="ln" d="M480 178 H434" marker-end="url(#arrow)" />
        <path class="ln" d="M250 178 H204" marker-end="url(#arrow)" />
        <path class="ln dash" d="M110 150 V100" marker-end="url(#arrow)" />
      </g>
      <text class="sm" x="20" y="24">ONE TASK, START TO PULL REQUEST</text>
      <text class="lbl" x="110" y="64" text-anchor="middle">status</text>
      <text class="sm" x="110" y="84" text-anchor="middle">where am I?</text>
      <text class="lbl" x="340" y="64" text-anchor="middle">switch -c</text>
      <text class="sm" x="340" y="84" text-anchor="middle">a branch per task</text>
      <text class="lbl" x="570" y="64" text-anchor="middle">edit</text>
      <text class="sm" x="570" y="84" text-anchor="middle">change files</text>
      <text class="lbl" x="795" y="64" text-anchor="middle">diff</text>
      <text class="sm" x="795" y="84" text-anchor="middle">read your change</text>
      <text class="lbl" x="795" y="174" text-anchor="middle">add -p</text>
      <text class="sm" x="795" y="194" text-anchor="middle">choose what goes in</text>
      <text class="lbl" x="570" y="174" text-anchor="middle">commit</text>
      <text class="sm" x="570" y="194" text-anchor="middle">record a snapshot</text>
      <text class="lbl" x="340" y="174" text-anchor="middle">fetch + rebase</text>
      <text class="sm" x="340" y="194" text-anchor="middle">catch up with main</text>
      <text class="lbl" x="110" y="174" text-anchor="middle">push</text>
      <text class="sm" x="110" y="194" text-anchor="middle">share it, open a PR</text>
      <text class="sm" x="122" y="130">next task</text>
    </svg>
    <figcaption>
      The edit, diff, add, commit part repeats many times per branch.
      Fetch and rebase happen whenever main has moved, and always
      before you push for review.
    </figcaption>
  </figure>

  <p class="sub">a normal working day</p>
  <div class="codeblock">
    <pre><code>git status
git switch -c feature/checkout

git diff
git diff --staged
git add -p
git commit -m "feat: apply coupon before tax"

git fetch origin
git rebase origin/main
git push -u origin feature/checkout</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Run <code>git status</code> constantly; it is free and it tells
    you what state you are in. <code>switch -c</code> creates a
    branch and moves onto it. The two diffs show unstaged and staged
    changes. <code>fetch</code> downloads other people's work without
    touching yours, and <code>rebase origin/main</code> replays your
    commits on top of theirs. <code>push -u</code> sets the upstream
    the first time, so later a bare <code>git push</code> and
    <code>git pull</code> know where to go.
  </p>

  <h3>What each command touches</h3>
  <p>
    Most anxiety about Git commands comes from not knowing what they
    will change. This table answers that for the everyday set. "Safe"
    means it cannot lose work you have not committed.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Command</th><th>Reads</th><th>Writes</th><th>Safe?</th></tr>
      </thead>
      <tbody>
        <tr><td><code>git status</code></td><td>Files, index, HEAD</td><td>Nothing (may refresh the index's stat cache)</td><td>Yes</td></tr>
        <tr><td><code>git diff</code>, <code>log</code>, <code>show</code>, <code>grep</code></td><td>Files, index, objects</td><td>Nothing</td><td>Yes</td></tr>
        <tr><td><code>git add</code></td><td>Files</td><td>Objects (new blobs), index</td><td>Yes</td></tr>
        <tr><td><code>git commit</code></td><td>Index</td><td>Objects (trees, commit), current branch ref</td><td>Yes</td></tr>
        <tr><td><code>git switch</code></td><td>Target commit</td><td>HEAD, index, files</td><td>Yes: refuses if your edits would be overwritten</td></tr>
        <tr><td><code>git restore file</code></td><td>Index (or <code>--source</code>)</td><td>Files</td><td><strong>No</strong>: discards edits</td></tr>
        <tr><td><code>git restore --staged file</code></td><td>HEAD</td><td>Index</td><td>Yes: files untouched</td></tr>
        <tr><td><code>git stash</code></td><td>Files, index</td><td>A stash commit; resets files and index</td><td>Yes: recoverable</td></tr>
        <tr><td><code>git fetch</code></td><td>The remote</td><td>Objects, <code>refs/remotes/*</code></td><td>Yes</td></tr>
        <tr><td><code>git pull</code></td><td>The remote</td><td>Everything fetch writes, then branch, index, files</td><td>Mostly: stops on conflicts</td></tr>
        <tr><td><code>git push</code></td><td>Your branch</td><td>The remote's branch</td><td>Yes, unless forced</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Committing well</h3>
  <p>
    <code>git commit</code> with no <code>-m</code> opens your editor,
    and <code>git commit -v</code> puts the full staged diff under the
    message so you can read the change while you describe it. Other
    habits that pay off:
  </p>
  <ul>
    <li>
      <code>git commit --amend</code> replaces the last commit with a
      new one (new message, or extra staged changes). Fine before you
      push; after that it rewrites shared history.
      <code>--amend --no-edit</code> keeps the message.
    </li>
    <li>
      <code>git commit --fixup=&lt;sha&gt;</code> records a small
      correction aimed at an older commit.
      <code>git rebase -i --autosquash</code> later folds it in.
    </li>
    <li>
      <code>git commit -a</code> stages every <em>tracked</em> file's
      changes and commits. It never adds new files, and it skips the
      review step, so use it only when you just read the whole diff.
    </li>
  </ul>

  <h3>Reading history like a pro</h3>
  <p class="sub">git log, actually useful</p>
  <div class="codeblock">
    <pre><code>git log --oneline --graph --decorate --all
git log -p src/cart.js
git log --follow -p src/cart.js
git log -S "calculateTax"
git log --since="2 weeks" --author="Aisha"
git show a3f9c1</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    In order: the whole graph in your terminal, every change to one
    file with its diffs, the same but following the file across
    renames, the commits where a string appeared or vanished, a
    filtered list, and one commit in full. The first one is worth an
    alias, because it answers "where is everything?":
  </p>

  <div class="codeblock">
    <pre><code>$ git log --oneline --graph --decorate --all
* 1b06427 (HEAD -&gt; main) docs: add README
* eeb36f5 fix: round tax to two decimals
| * f9ea75e (feature/coupons) feat: apply coupon before tax
|/
* 9ee1c69 (tag: v1.0) feat: include tax in cart total
* e750e96 feat: add GST calculation
* 37a4c57 feat: cart total</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Read it bottom to top for time order. Each <code>*</code> is a
    commit; the lines to its left are the graph. The parentheses
    show which refs point at each commit, so here
    <code>feature/coupons</code> split from main at v1.0 and main has
    moved on by two commits since.
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Filter</th><th>Shows</th></tr>
      </thead>
      <tbody>
        <tr><td><code>-n 10</code> or <code>-10</code></td><td>Only the newest ten.</td></tr>
        <tr><td><code>--since="2 weeks"</code>, <code>--until=2025-08-01</code></td><td>A time window, by commit date.</td></tr>
        <tr><td><code>--author=Aisha</code></td><td>Author matches the pattern (name or email).</td></tr>
        <tr><td><code>--grep="coupon" -i</code></td><td>Commit message matches, case-insensitive.</td></tr>
        <tr><td><code>-- src/tax.js</code></td><td>Only commits that touched this path.</td></tr>
        <tr><td><code>--no-merges</code> / <code>--merges</code></td><td>Hide merge commits / show only them.</td></tr>
        <tr><td><code>--first-parent</code></td><td>Follow only the first parent: main as a list of what landed.</td></tr>
        <tr><td><code>main..feature</code></td><td>Commits on feature that main does not have. See the mental model chapter.</td></tr>
        <tr><td><code>--stat</code>, <code>--name-status</code></td><td>Which files each commit changed, with counts or with A/M/D/R letters.</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Pretty formats</h3>
  <p>
    <code>git log</code> has built-in layouts, from terse to
    exhaustive: <code>oneline</code>, <code>short</code>,
    <code>medium</code> (the default), <code>full</code>,
    <code>fuller</code> and <code>reference</code>.
    <code>fuller</code> is the one to reach for when you need to see
    both the author and the committer, for example after a rebase:
  </p>

  <div class="codeblock">
    <pre><code>$ git log -1 --format=fuller
commit 1b06427a8c7d8fe438acd53c39008641a3cff92e
Author:     Aisha Khan &lt;aisha@corp.dev&gt;
AuthorDate: Fri Aug 8 14:50:00 2025 +0530
Commit:     Aisha Khan &lt;aisha@corp.dev&gt;
CommitDate: Fri Aug 8 14:50:00 2025 +0530

    docs: add README</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    For anything else, build your own line with
    <code>--format</code> (also spelled <code>--pretty=format:</code>)
    and placeholders:
  </p>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Placeholder</th><th>Gives</th><th>Placeholder</th><th>Gives</th></tr>
      </thead>
      <tbody>
        <tr><td><code>%H</code> / <code>%h</code></td><td>Full / short commit hash</td><td><code>%s</code></td><td>Subject (first line)</td></tr>
        <tr><td><code>%an</code> / <code>%ae</code></td><td>Author name / email</td><td><code>%b</code></td><td>Body</td></tr>
        <tr><td><code>%ad</code> / <code>%ar</code></td><td>Author date / relative ("3 days ago")</td><td><code>%d</code></td><td>Ref names, like <code>(HEAD -&gt; main)</code></td></tr>
        <tr><td><code>%cn</code> / <code>%cr</code></td><td>Committer name / relative date</td><td><code>%p</code></td><td>Short parent hashes</td></tr>
        <tr><td><code>%C(auto)</code></td><td>Git's default colouring for what follows</td><td><code>%n</code></td><td>Newline</td></tr>
      </tbody>
    </table>
  </div>

  <div class="codeblock">
    <pre><code>$ git log --format='%h %an %ad %s' --date=short -3
1b06427 Aisha Khan 2025-08-08 docs: add README
eeb36f5 Ravi Iyer 2025-08-07 fix: round tax to two decimals
9ee1c69 Aisha Khan 2025-08-06 feat: include tax in cart total

$ git config --global alias.lg "log --graph --format='%C(auto)%h%d %s %C(dim)%an, %ar'"
$ git lg -2
* 1b06427 (HEAD -&gt; main) docs: add README Aisha Khan, 3 days ago
* eeb36f5 fix: round tax to two decimals Ravi Iyer, 4 days ago</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <code>--date</code> controls how <code>%ad</code> and the default
    layouts print dates: <code>short</code>, <code>iso</code>,
    <code>relative</code>, or <code>format:%Y-%m-%d %H:%M</code> for
    strftime. Formats are also the right way to feed Git into a
    script: <code>%H</code> and a separator you control are far
    safer to parse than the human layouts, which can change.
  </p>

  <h3>git show: one object in full</h3>
  <p>
    <code>git show</code> prints whatever you point it at. For a
    commit, the header and the diff; for a tag, the tag message and
    then the commit; for a <code>commit:path</code>, the file as it
    was at that commit, with no checkout needed.
  </p>

  <div class="codeblock">
    <pre><code>$ git show --stat HEAD~1
commit eeb36f5fdb53fc3f8dd9e874fe93c1f7fe7733d4
Author: Ravi Iyer &lt;ravi@corp.dev&gt;
Date:   Thu Aug 7 18:50:00 2025 +0530

    fix: round tax to two decimals

 src/tax.js | 4 ++--
 1 file changed, 2 insertions(+), 2 deletions(-)

$ git show v1.0:src/cart.js &gt; /tmp/cart-v1.js
$ git show HEAD --name-status
$ git show HEAD -- src/tax.js</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <h3>Searching: grep, pickaxe, and line history</h3>
  <p>
    Different questions need different searches, and picking the
    right one is most of the skill.
  </p>

  <figure>
    <svg viewBox="0 0 900 300" class="dg" role="img" aria-label="Five questions matched to five commands. Where does this text appear right now: git grep. Which commits added or removed this string: git log -S. Which commits touched lines matching a regex: git log -G. How did this function evolve: git log -L. Who last changed each line: git blame.">
      <g class="rough">
        <rect x="20" y="20" width="490" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
        <rect x="20" y="76" width="490" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
        <rect x="20" y="132" width="490" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
        <rect x="20" y="188" width="490" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
        <rect x="20" y="244" width="490" height="44" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 1.8" />
        <rect x="580" y="20" width="300" height="44" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
        <rect x="580" y="76" width="300" height="44" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
        <rect x="580" y="132" width="300" height="44" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
        <rect x="580" y="188" width="300" height="44" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
        <rect x="580" y="244" width="300" height="44" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 1.8" />
        <path class="ln" d="M510 42 H576" marker-end="url(#arrow)" />
        <path class="ln" d="M510 98 H576" marker-end="url(#arrow)" />
        <path class="ln" d="M510 154 H576" marker-end="url(#arrow)" />
        <path class="ln" d="M510 210 H576" marker-end="url(#arrow)" />
        <path class="ln" d="M510 266 H576" marker-end="url(#arrow)" />
      </g>
      <text class="lbl" x="34" y="48">Where does this text appear right now?</text>
      <text class="lbl" x="34" y="104">Which commits added or removed this string?</text>
      <text class="lbl" x="34" y="160">Which commits touched lines matching a regex?</text>
      <text class="lbl" x="34" y="216">How did this one function evolve?</text>
      <text class="lbl" x="34" y="272">Who last changed each of these lines?</text>
      <text class="lbl" x="596" y="48" style="font-family: var(--font-mono)">git grep -n text</text>
      <text class="lbl" x="596" y="104" style="font-family: var(--font-mono)">git log -S text</text>
      <text class="lbl" x="596" y="160" style="font-family: var(--font-mono)">git log -G regex</text>
      <text class="lbl" x="596" y="216" style="font-family: var(--font-mono)">git log -L :fn:file</text>
      <text class="lbl" x="596" y="272" style="font-family: var(--font-mono)">git blame -L 40,60</text>
    </svg>
    <figcaption>
      The first searches the present. The rest search history, and
      each answers a slightly different question.
    </figcaption>
  </figure>

  <p>
    <strong><code>git grep</code></strong> searches tracked files. It
    is fast because it takes the file list from the index instead of
    walking the disk, and it skips <code>node_modules</code> and build output for free
    because they are not tracked. It can also search any commit
    without checking it out.
  </p>

  <div class="codeblock">
    <pre><code>$ git grep -n calculateTax
src/cart.js:1:import { calculateTax } from "./tax.js";
src/cart.js:4:  return sub + calculateTax(sub);
src/tax.js:1:export function calculateTax(amount, rate = 0.18) {

$ git grep -n "TODO" v1.0
$ git grep -c "console.log" -- '*.js'</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    <strong><code>git log -S</code></strong>, the "pickaxe", deserves
    a moment. It finds commits that changed the <em>number of
    occurrences</em> of a string, so "when did this function get
    deleted?" becomes a five-second question instead of an afternoon.
    <strong><code>git log -G</code></strong> takes a regular
    expression and finds commits whose diff <em>adds or removes a
    line</em> matching it. The difference shows up when code moves
    or is edited in place:
  </p>

  <div class="codeblock">
    <pre><code>$ git log -S'0.18' --oneline
e750e96 feat: add GST calculation

$ git log -G'0\\.18' --oneline
eeb36f5 fix: round tax to two decimals
e750e96 feat: add GST calculation</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The fix commit rewrote the line containing <code>0.18</code>, but
    the file had one <code>0.18</code> before and one after. The count
    did not change, so <code>-S</code> skips it; <code>-G</code> sees a
    matching line removed and added, so it reports it. Use
    <code>-S</code> to find where something was introduced or
    deleted, <code>-G</code> to find every commit that touched it.
    Add <code>-p</code> to either to see the diffs, and
    <code>--all</code> to search every branch.
  </p>

  <p>
    <strong><code>git log -L</code></strong> tracks a range of lines
    through history. <code>git log -L :calculateTax:src/tax.js</code>
    finds the function by name and shows every commit that changed
    it, each with only the diff for that function. You can also give
    line numbers: <code>-L 40,60:src/cart.js</code>.
    <strong><code>git blame</code></strong> goes the other way: for
    each current line, the last commit that changed it.
  </p>

  <div class="codeblock">
    <pre><code>$ git blame -L 1,2 src/tax.js
eeb36f5f (Ravi Iyer 2025-08-07 18:50:00 +0530 1) export function calculateTax(amount, rate = 0.18) {
eeb36f5f (Ravi Iyer 2025-08-07 18:50:00 +0530 2)   return Math.round(amount * rate * 100) / 100;</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    Blame names the last person to <em>touch</em> a line, which is
    often a formatter or a rename, not the author of the logic.
    <code>-w</code> ignores whitespace-only changes, <code>-C</code>
    follows lines moved or copied from other files, and a
    <code>.git-blame-ignore-revs</code> file listing bulk-reformat
    commits (enabled with
    <code>git config blame.ignoreRevsFile .git-blame-ignore-revs</code>)
    makes blame skip them. GitHub reads the same file.
  </p>

  <h3>git shortlog: who did what</h3>
  <p>
    <code>shortlog</code> groups commits by author. With
    <code>-s</code> it only counts, <code>-n</code> sorts by count,
    and <code>-e</code> adds emails, which is how you spot one person
    committing under two addresses.
  </p>

  <div class="codeblock">
    <pre><code>$ git shortlog -sne --all
     3	Aisha Khan &lt;aisha@corp.dev&gt;
     2	Ravi Iyer &lt;ravi@corp.dev&gt;
     1	Meera Das &lt;meera@corp.dev&gt;

$ git shortlog v1.0..HEAD
Aisha Khan (1):
      docs: add README

Ravi Iyer (1):
      fix: round tax to two decimals</code></pre>
    <button class="codeblock__copy" type="button">copy</button>
  </div>

  <p>
    The second form is a first draft of release notes: everything
    since the last tag, grouped by person. Add
    <code>--no-merges</code> to drop merge commits. If one person
    shows up under several names or emails, a <code>.mailmap</code>
    file at the root of the repository maps them to one identity for
    <code>shortlog</code>, <code>log</code> and <code>blame</code>.
    One caution: in a script or pipe, give <code>shortlog</code> a
    revision such as <code>HEAD</code>. With no terminal attached and
    no revision, it waits to read a log from standard input.
  </p>

  <div class="sticky">
    <span class="ttl">switch and restore</span>
    <p>
      Modern Git split the overloaded <code>git checkout</code> into
      two clearer commands: <code>git switch</code> for changing
      branches, <code>git restore</code> for throwing away file
      changes. <code>checkout</code> still works and you'll see it
      everywhere, but the newer pair is much harder to misfire. The
      three areas chapter has the full mapping.
    </p>
  </div>
`,
};
