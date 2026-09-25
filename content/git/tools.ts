import type { GitSection } from "./types";

export const gitTools: GitSection = {
  id: "tools",
  num: "G10",
  title: "Detective tools",
  short: "Detective tools",
  subtitle:
    "Find the commit that broke it, the reason a line exists, and the history of one function, then move fixes between branches.",
  body: `
<div class="cover__meta">
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    Git stores every version of every file, which makes it a very good
    investigation tool if you know the questions to ask it. This section
    covers the commands you reach for when something is wrong and you need
    to know <em>when</em>, <em>who</em> and <em>why</em>, and the ones for
    moving work around once you do.
  </p>

  <h3>bisect: binary search through history</h3>
  <p>
    A bug exists today and did not exist at the last release, and there are
    400 commits in between. Reading them is hopeless. Bisect asks you to test
    the commit halfway between a known good and a known bad one, and throws
    away the half that your answer rules out. Each test halves the range, so
    400 commits take about nine tests (2<sup>9</sup> = 512), and 10,000 take
    about fourteen.
  </p>

  <figure>
    <svg viewBox="0 0 900 340" class="dg" role="img" aria-label="Sixteen commits in a row, with the first marked good and the last marked bad. Test 1 checks commit 8, which is good, so commits 0 to 8 drop out. Test 2 checks commit 12, which is bad, so 13 to 15 drop out. Test 3 checks commit 10, good. Test 4 checks commit 11, bad. Commit 11 is the first bad commit, found in four tests.">
<g class="rough">
<path class="ln" d="M200 50 H860" />
<path class="ln" d="M200 110 H860" />
<path class="ln" d="M200 170 H860" />
<path class="ln" d="M200 230 H860" />
<path class="ln" d="M200 290 H860" />
<circle cx="200" cy="50" r="6" style="fill: var(--green)" />
<circle cx="244" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="288" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="332" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="376" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="420" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="464" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="508" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="552" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="596" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="640" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="684" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="728" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="772" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="816" cy="50" r="6" style="fill: var(--ink)" />
<circle cx="860" cy="50" r="6" style="fill: var(--red)" />
<circle cx="200" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="244" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="288" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="332" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="376" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="420" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="464" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="508" cy="110" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="552" cy="110" r="9" style="fill: var(--green)" />
<circle cx="596" cy="110" r="6" style="fill: var(--ink)" />
<circle cx="640" cy="110" r="6" style="fill: var(--ink)" />
<circle cx="684" cy="110" r="6" style="fill: var(--ink)" />
<circle cx="728" cy="110" r="6" style="fill: var(--ink)" />
<circle cx="772" cy="110" r="6" style="fill: var(--ink)" />
<circle cx="816" cy="110" r="6" style="fill: var(--ink)" />
<circle cx="860" cy="110" r="6" style="fill: var(--ink)" />
<circle cx="200" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="244" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="288" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="332" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="376" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="420" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="464" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="508" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="552" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="596" cy="170" r="6" style="fill: var(--ink)" />
<circle cx="640" cy="170" r="6" style="fill: var(--ink)" />
<circle cx="684" cy="170" r="6" style="fill: var(--ink)" />
<circle cx="728" cy="170" r="9" style="fill: var(--red)" />
<circle cx="772" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="816" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="860" cy="170" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="200" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="244" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="288" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="332" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="376" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="420" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="464" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="508" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="552" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="596" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="640" cy="230" r="9" style="fill: var(--green)" />
<circle cx="684" cy="230" r="6" style="fill: var(--ink)" />
<circle cx="728" cy="230" r="6" style="fill: var(--red)" />
<circle cx="772" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="816" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="860" cy="230" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="200" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="244" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="288" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="332" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="376" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="420" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="464" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="508" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="552" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="596" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="640" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="684" cy="290" r="9" style="fill: var(--red)" />
<circle cx="728" cy="290" r="6" style="fill: var(--red)" />
<circle cx="772" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="816" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
<circle cx="860" cy="290" r="6" style="fill: var(--sheet); stroke: var(--line-soft); stroke-width: 2" />
</g>
<text class="sm" x="20" y="55">START</text>
<text class="sm" x="20" y="115">TEST 1: good</text>
<text class="sm" x="20" y="175">TEST 2: bad</text>
<text class="sm" x="20" y="235">TEST 3: good</text>
<text class="sm" x="20" y="295">TEST 4: bad</text>
<text class="sm gr" x="200" y="30" text-anchor="middle">good</text>
<text class="sm rd" x="860" y="30" text-anchor="middle">bad</text>
<text class="sm" x="552" y="92" text-anchor="middle">#8</text>
<text class="sm" x="728" y="152" text-anchor="middle">#12</text>
<text class="sm" x="640" y="212" text-anchor="middle">#10</text>
<text class="sm rd" x="684" y="320" text-anchor="middle">#11 is the first bad commit</text>
    </svg>
    <figcaption>
      Sixteen commits, four tests. Hollow commits have been ruled out.
      Each answer removes half of what is left, whatever the answer is.
    </figcaption>
  </figure>

  <pre><code>$ git bisect start
$ git bisect bad
$ git bisect good v2.3.0
Bisecting: 199 revisions left to test after this (roughly 8 steps)
[5c2e9a1f3d7b0e4c8a6f2d9b1e5c7a3f0d8b4e6c] refactor: move tax helpers into pricing module

$ npm test -- cart
$ git bisect good
Bisecting: 99 revisions left to test after this (roughly 7 steps)
...
8f2c9d1e4b7a0c3f5e6d9b2a1c4f7e0d3b6a9c2e is the first bad commit
commit 8f2c9d1e4b7a0c3f5e6d9b2a1c4f7e0d3b6a9c2e
Author: Marco Ruiz &lt;marco@example.com&gt;
Date:   Tue Sep 16 11:20:43 2026 +0100

    feat: coupon stacking

$ git bisect reset</code></pre>
  <p>
    <code>git bisect start BAD GOOD</code> does the first three lines in
    one. If a commit can't be tested (it doesn't build, or the test needs
    something added later), answer <code>git bisect skip</code> and Git picks
    a neighbour. <code>git bisect log</code> prints your answers so far, and
    <code>git bisect replay</code> reruns them after a mistake. When you are
    hunting a change that is not a bug, such as when something got faster,
    rename the terms: <code>git bisect start --term-old=slow
    --term-new=fast</code>. On a branch full of merges,
    <code>--first-parent</code> tests only main's own commits and tells you
    which merge brought the problem in.
  </p>

  <h3>bisect run: let the machine do it</h3>
  <p>
    If a script can tell good from bad, bisect can run the whole search
    unattended. The exit code is the answer.
  </p>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Exit code</th><th>Bisect reads it as</th></tr>
      </thead>
      <tbody>
        <tr><td><code>0</code></td><td>Good</td></tr>
        <tr><td><code>1</code> to <code>127</code>, except 125</td><td>Bad</td></tr>
        <tr><td><code>125</code></td><td>Can't test this one, skip it</td></tr>
        <tr><td>Above <code>127</code></td><td>Stop the bisect: something is broken in the script itself</td></tr>
      </tbody>
    </table>
  </div>
  <pre><code>$ cat /tmp/check.sh
#!/bin/sh
npm ci --silent || exit 125
cp /tmp/tax-regression.test.ts tests/ || exit 125
npx vitest run tests/tax-regression.test.ts

$ chmod +x /tmp/check.sh
$ git bisect start HEAD v2.3.0
$ git bisect run /tmp/check.sh
...
8f2c9d1e4b7a0c3f5e6d9b2a1c4f7e0d3b6a9c2e is the first bad commit
bisect found first bad commit</code></pre>
  <p>
    Two details make this work. The script lives <em>outside</em> the
    repository, because bisect checks out old commits and would otherwise
    change it under you. And the test that proves the bug is copied in each
    time, because it didn't exist in the old commits. A failed install
    exits 125, so a commit that won't build is skipped instead of being
    blamed.
  </p>

  <h3>blame, done properly</h3>
  <p>
    <code>git blame</code> shows, for each line, the last commit that changed
    it. The point is not to find someone to blame. It is to find the commit,
    read its message and its pull request, and learn <em>why</em> an odd line
    exists before you delete it. Plain blame is easily fooled, though. A
    reformat, or a function moved to another file, makes the mover look like
    the author. The flags fix that.
  </p>
  <pre><code>$ git blame -w -C -C -L 41,43 src/cart.ts
e4f9a01b src/cart.ts    (Priya Shah 2026-03-04 14:02:11 +0000 41)   const subtotal = sumLines(lines);
7d21e0c3 src/pricing.ts (Marco Ruiz 2025-11-19 09:40:52 +0000 42)   const tax = roundHalfEven(subtotal * rate);
7d21e0c3 src/pricing.ts (Marco Ruiz 2025-11-19 09:40:52 +0000 43)   return subtotal + tax;</code></pre>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Flag</th><th>What it does</th></tr>
      </thead>
      <tbody>
        <tr><td><code>-L 41,43</code> or <code>-L :checkout</code></td><td>Only these lines, or only this function</td></tr>
        <tr><td><code>-w</code></td><td>Ignore whitespace-only changes, so re-indenting doesn't steal the line</td></tr>
        <tr><td><code>-M</code></td><td>Follow lines moved within the same file</td></tr>
        <tr><td><code>-C</code></td><td>Follow lines moved from other files changed in the same commit</td></tr>
        <tr><td><code>-C -C</code></td><td>Also look in any file that existed in the commit that created this file, which catches "split a module in two"</td></tr>
        <tr><td><code>-C -C -C</code></td><td>Look in every file in every commit. Thorough and slow on big repos</td></tr>
        <tr><td><code>--ignore-rev &lt;sha&gt;</code></td><td>Pretend this commit didn't happen and blame what was there before it</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    In the output above, the file name column appears because
    <code>-C</code> traced two of the lines back to
    <code>src/pricing.ts</code>, where they were first written. Without it,
    all three lines would point at the commit that moved them.
  </p>

  <h3>.git-blame-ignore-revs</h3>
  <p>
    When a team runs Prettier over the whole codebase, that one commit
    becomes the "author" of nearly every line. List such commits, one full
    ID per line, in a file at the root of the repository, and point blame at
    it.
  </p>
  <pre><code>$ cat .git-blame-ignore-revs
3b7e1a4c9d2f5e8a0b1c4d7e0f3a6b9c2d5e8f1a
c04b8a2e6f9d1c3b5a7e9f0d2c4b6a8e0f1d3c5b

$ git config blame.ignoreRevsFile .git-blame-ignore-revs</code></pre>
  <p>
    GitHub's blame view reads <code>.git-blame-ignore-revs</code> from the
    root automatically. Locally, each developer has to set the config once,
    so put the command in your setup script. Add the reformat commit to the
    file in a follow-up commit, once its final ID is known (after the PR is
    merged, if you squash).
  </p>

  <h3>When the line is gone: log -S and log -G</h3>
  <p>
    Blame only sees lines that still exist. To find when something was
    <em>removed</em>, or when a string first appeared, use the pickaxe.
  </p>
  <pre><code>$ git log -S "applyLegacyDiscount" --oneline
a07f3b5 refactor: drop legacy discount path
1c9e4d2 feat: legacy discount for enterprise plans

$ git log -G "rate\\s*\\*" --oneline -- src/pricing.ts</code></pre>
  <p>
    <code>-S</code> lists commits where the number of occurrences of the
    string changed, so it finds additions and deletions but not edits that
    leave the count the same. <code>-G</code> takes a regular expression and
    lists every commit whose diff has an added or removed line matching it.
  </p>

  <h3>log -L: the history of one function</h3>
  <p>
    <code>git log -L</code> follows a range of lines, or a whole function,
    back through history, showing only the part of each commit's diff that
    touched it, and following it as the lines move around the file.
  </p>
  <pre><code>$ git log -L :applyCoupon:src/cart.ts --oneline
8f2c9d1 feat: coupon stacking
diff --git a/src/cart.ts b/src/cart.ts
--- a/src/cart.ts
+++ b/src/cart.ts
@@ -58,7 +58,9 @@
 export function applyCoupon(cart: Cart, code: string) {
-  const coupon = findCoupon(code);
+  const coupons = [...cart.coupons, findCoupon(code)];
...

$ git log -L 40,60:src/cart.ts</code></pre>
  <p>
    Git finds the function with a built-in pattern that guesses what a
    function header looks like. For many languages it guesses better if you
    tell it the language in <code>.gitattributes</code>, for example
    <code>*.py diff=python</code> or <code>*.rs diff=rust</code>. The same
    setting improves the <code>@@</code> hunk headers in every diff.
  </p>

  <h3>cherry-pick: copying a commit</h3>
  <p>
    Cherry-pick takes the diff one commit introduced and applies it on top
    of your current branch as a <em>new</em> commit. The classic use is
    backporting a fix from main onto a release branch. Because the new
    commit has a different parent, it has a different ID, and the same
    change now exists twice in the graph.
  </p>

  <figure>
    <svg viewBox="0 0 900 250" class="dg" role="img" aria-label="Main has commits A, B, F and D. F is a fix. A release branch left main at A and has commits R1 and R2. A dashed arrow from F to a new commit F prime at the end of the release branch shows the cherry-pick. F prime has a new ID but the same diff.">
      <g class="rough">
        <path class="ln" d="M80 80 H560" />
        <path class="ln" d="M80 80 C120 80 120 180 160 180 H520" />
        <path class="ln dash" d="M332 88 L506 172" marker-end="url(#arrow)" />
        <circle cx="80" cy="80" r="8" style="fill: var(--ink)" />
        <circle cx="200" cy="80" r="8" style="fill: var(--ink)" />
        <circle cx="320" cy="80" r="9" style="fill: var(--green)" />
        <circle cx="440" cy="80" r="8" style="fill: var(--ink)" />
        <circle cx="560" cy="80" r="8" style="fill: var(--ink)" />
        <circle cx="240" cy="180" r="8" style="fill: var(--ink)" />
        <circle cx="360" cy="180" r="8" style="fill: var(--ink)" />
        <circle cx="520" cy="180" r="9" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
      </g>
      <text class="sm" x="80" y="56" text-anchor="middle">A</text>
      <text class="sm" x="200" y="56" text-anchor="middle">B</text>
      <text class="sm gr" x="320" y="56" text-anchor="middle">F: the fix (a3f9c1e)</text>
      <text class="sm" x="440" y="56" text-anchor="middle">D</text>
      <text class="sm" x="560" y="56" text-anchor="middle">E</text>
      <text class="lbl" x="580" y="85">main</text>
      <text class="sm" x="240" y="210" text-anchor="middle">R1</text>
      <text class="sm" x="360" y="210" text-anchor="middle">R2</text>
      <text class="sm gr" x="520" y="210" text-anchor="middle">F′: new ID, same diff</text>
      <text class="lbl" x="542" y="185">release/2.4</text>
      <text class="sm" x="440" y="118">git cherry-pick -x a3f9c1e</text>
    </svg>
    <figcaption>
      D and E are not copied. Only F's own change is replayed on top of R2,
      which is exactly what a backport needs.
    </figcaption>
  </figure>

  <pre><code>$ git switch release/2.4
$ git cherry-pick -x a3f9c1e
$ git cherry-pick -x a3f9c1e^..c04b8a2
$ git cherry-pick main~3..main
$ git cherry-pick -n a3f9c1e
$ git cherry-pick -m 1 4c1d9e2</code></pre>
  <p>
    <code>-x</code> appends <code>(cherry picked from commit
    a3f9c1e...)</code> to the message, with the full ID, so anyone can trace
    the copy back to the original. Use it for every backport. Ranges follow
    the usual rule: <code>A..B</code> means "after A, up to B", so it
    <em>excludes</em> A. Write <code>A^..B</code> to include it.
    <code>-n</code> applies the change without committing, so you can
    combine several picks into one commit. <code>-m 1</code> picks a merge
    commit, taking its diff against the first parent.
  </p>
  <p>
    A pick conflicts when the target branch has drifted from the code the fix
    was written against.
  </p>
  <pre><code>$ git cherry-pick -x a3f9c1e
Auto-merging src/tax.ts
CONFLICT (content): Merge conflict in src/tax.ts
error: could not apply a3f9c1e... fix: round tax per line
hint: After resolving the conflicts, mark them with
hint: "git add/rm &lt;pathspec&gt;", then run
hint: "git cherry-pick --continue".

$ git add src/tax.ts
$ git cherry-pick --continue</code></pre>
  <p>
    <code>--skip</code> drops the current commit from a range and moves on,
    and <code>--abort</code> puts everything back. To see which fixes on main
    have not reached a release branch yet, ask <code>git cherry -v
    release/2.4 main</code>. It compares patches, not IDs, so a
    cherry-picked copy counts as present: lines starting with
    <code>-</code> are already there, lines with <code>+</code> are missing.
  </p>

  <h3>range-diff: what changed between two versions of a branch</h3>
  <p>
    After a rebase, every commit on your branch has a new ID and the normal
    diff against main shows the whole feature again. Reviewers want to know
    what changed <em>since last time</em>. <code>range-diff</code> matches
    the old commits to the new ones and diffs each pair.
  </p>
  <pre><code>$ git range-diff main feature/cart@{1} feature/cart
1:  a1b2c3d = 1:  e4f5a6b feat: add coupon model
2:  b2c3d4e ! 2:  f6a7b8c feat: apply coupon at checkout
    @@ src/cart.ts: export function checkout(cart: Cart) {
    -+  const total = subtotal - discount;
    ++  const total = Math.max(0, subtotal - discount);
3:  c3d4e5f &lt; -:  ------- wip: debug logging
-:  ------- &gt; 3:  9d8e7f6 test: cover negative totals</code></pre>
  <p>
    <code>=</code> means unchanged, <code>!</code> means changed (with a
    diff of the diffs), <code>&lt;</code> means dropped and <code>&gt;</code>
    means new. <code>feature/cart@{1}</code> is the branch's own reflog, so
    "where it was before the rebase". Before a force-push, <code>git
    range-diff main @{u} @</code> compares what you pushed last time with
    what you are about to push. Paste it into the PR so reviewers can see
    exactly what moved.
  </p>

  <h3>worktree: two branches checked out at once</h3>
  <p>
    You are deep in a feature and an urgent bug comes in. Instead of stashing
    and switching, check out a second branch into a separate folder. Both
    folders share one object database, so it costs almost no disk and no
    network, and each has its own working tree, index and HEAD.
  </p>
  <pre><code>$ git worktree add -b hotfix/login ../shop-hotfix origin/main
Preparing worktree (new branch 'hotfix/login')
HEAD is now at 5e6f7a8 chore: bump deps

$ git worktree list
/Users/priya/shop          8f2c9d1 [feature/cart]
/Users/priya/shop-hotfix   5e6f7a8 [hotfix/login]

$ git worktree remove ../shop-hotfix
$ git worktree prune</code></pre>
  <p>
    A branch can be checked out in only one worktree at a time, which stops
    two folders from fighting over the same branch. Dependencies and build
    output are per folder, so expect to run <code>npm ci</code> in the new
    one. A second worktree is also how people run a long test suite on one branch
    while coding on another, or run several coding agents side by side
    without them overwriting each other's files.
  </p>

  <h3>git grep</h3>
  <p>
    <code>git grep</code> searches tracked files only, so it skips
    <code>node_modules</code> and build output without being told, and it
    runs in parallel. It can also search any commit without checking it out.
  </p>
  <pre><code>$ git grep -n -p "applyCoupon" -- "*.ts"
src/cart.ts=58=export function applyCoupon(cart: Cart, code: string) {
src/cart.ts:61:  return applyCoupon(next, rest);
src/checkout.ts:12:import { applyCoupon } from "./cart";

$ git grep -n "FEATURE_COUPONS" v2.3.0 -- src/
$ git grep -e "TODO" --and -e "tax" -- src/</code></pre>
  <p>
    <code>-p</code> adds the enclosing function line, marked with
    <code>=</code> instead of <code>:</code>. Passing a tag or commit, like
    <code>v2.3.0</code>, searches that snapshot.
  </p>

  <h3>git notes</h3>
  <p>
    Notes attach text to a commit without changing it, so its ID stays the
    same. They suit facts learned after the commit was made: which build
    deployed it, a benchmark result, a link to the incident it caused.
  </p>
  <pre><code>$ git notes add -m "Deployed to production 2026-09-20, build 4127" 8f2c9d1
$ git log -1 8f2c9d1
commit 8f2c9d1e4b7a0c3f5e6d9b2a1c4f7e0d3b6a9c2e
Author: Marco Ruiz &lt;marco@example.com&gt;
Date:   Tue Sep 16 11:20:43 2026 +0100

    feat: coupon stacking

Notes:
    Deployed to production 2026-09-20, build 4127

$ git push origin refs/notes/commits
$ git fetch origin "refs/notes/*:refs/notes/*"</code></pre>
  <p>
    Notes live on their own ref, <code>refs/notes/commits</code>, which is
    not pushed or fetched unless you ask, as above. GitHub does not display
    them. And a rebase leaves them behind on the old commits unless you set
    <code>notes.rewriteRef</code>. They are a niche tool, mostly used by CI
    systems and by projects that email patches.
  </p>

  <h3>Submodules and subtrees</h3>
  <p>
    Both put one repository inside another. They make opposite trade-offs.
  </p>

  <figure>
    <svg viewBox="0 0 900 280" class="dg" role="img" aria-label="Left, a submodule: your repository's tree holds only a pointer to commit 3fa9c1e of a separate lib repository, which is cloned separately. Right, a subtree: the lib's files are ordinary files inside your repository's tree and history.">
      <g class="rough">
        <rect x="30" y="50" width="240" height="150" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="310" y="85" width="130" height="80" rx="10" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <path class="ln" d="M270 160 H306" marker-end="url(#arrow)" />
        <rect x="480" y="50" width="390" height="150" rx="10" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="500" y="120" width="350" height="66" rx="8" style="fill: var(--dg-box-green); stroke: var(--green); stroke-width: 2" />
      </g>
      <text class="sm" x="30" y="32">SUBMODULE</text>
      <text class="lbl" x="46" y="80">your repo's tree</text>
      <text class="sm" x="46" y="108">src/</text>
      <text class="sm" x="46" y="130">.gitmodules</text>
      <text class="sm" x="46" y="164">vendor/lib → 3fa9c1e</text>
      <text class="sm" x="46" y="186">(one pointer, mode 160000)</text>
      <text class="lbl" x="375" y="118" text-anchor="middle">lib repo</text>
      <text class="sm" x="375" y="142" text-anchor="middle">its own clone</text>
      <text class="sm" x="30" y="236">clone needs --recurse-submodules</text>
      <text class="sm" x="30" y="258">bump = commit a new pointer</text>
      <text class="sm" x="480" y="32">SUBTREE</text>
      <text class="lbl" x="496" y="80">your repo's tree</text>
      <text class="sm" x="496" y="106">src/</text>
      <text class="sm" x="516" y="146">vendor/lib/index.ts</text>
      <text class="sm" x="516" y="170">vendor/lib/parse.ts</text>
      <text class="sm gr" x="700" y="146">ordinary files,</text>
      <text class="sm gr" x="700" y="170">in your history</text>
      <text class="sm" x="480" y="236">a plain clone just works</text>
      <text class="sm" x="480" y="258">bump = git subtree pull, a merge into your repo</text>
    </svg>
    <figcaption>
      A submodule stores a commit ID of another repository. A subtree stores
      that repository's files.
    </figcaption>
  </figure>

  <pre><code>$ git submodule add https://github.com/acme/money.git vendor/money
$ git clone --recurse-submodules https://github.com/acme/shop.git
$ git submodule update --init --recursive
$ git submodule update --remote vendor/money
$ git config submodule.recurse true

$ git subtree add --prefix=vendor/money https://github.com/acme/money.git main --squash
$ git subtree pull --prefix=vendor/money https://github.com/acme/money.git main --squash
$ git subtree push --prefix=vendor/money https://github.com/acme/money.git fix/rounding</code></pre>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th></th><th>Submodule</th><th>Subtree</th></tr>
      </thead>
      <tbody>
        <tr><td>What your repo stores</td><td>A commit ID (a "gitlink") and a URL in <code>.gitmodules</code></td><td>The files themselves</td></tr>
        <tr><td>Fresh clone</td><td>Empty folder unless you pass <code>--recurse-submodules</code></td><td>Complete</td></tr>
        <tr><td>Pinning</td><td>Exact: every commit of yours names one commit of theirs</td><td>Whatever was last pulled in</td></tr>
        <tr><td>Changing the inner code</td><td>Commit inside the submodule, push it, then commit the new pointer outside. Two pushes, in that order</td><td>Edit in place. Sending changes back upstream with <code>subtree push</code> is slow and fiddly</td></tr>
        <tr><td>Common failures</td><td>Stale checkout after pull; detached HEAD inside; a pointer to a commit nobody pushed</td><td>Bigger history; upstream sync forgotten; <code>git subtree</code> is a contrib script, not core Git</td></tr>
        <tr><td>Good fit</td><td>Large, independently released code you must pin exactly, such as firmware or a vendored SDK</td><td>Small code you rarely update and want to be always present</td></tr>
      </tbody>
    </table>
  </div>

  <div class="bx is-ref">
    <span class="ttl">The honest recommendation</span>
    <p>
      If the code can be published as a package (npm, PyPI, Maven, a Go
      module), do that and let the package manager pin the version. It gives
      you exact pinning without either tool's sharp edges. If the two
      projects always change together, they probably belong in one
      repository. Submodules and subtrees are for the cases in between.
    </p>
  </div>
`,
};
