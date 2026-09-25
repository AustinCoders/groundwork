import type { GitSection } from "./types";

export const gitGithub: GitSection = {
  id: "github",
  num: "G0",
  title: "Pull requests and GitHub",
  short: "Pull requests",
  subtitle:
    "How a change gets from your branch into main on GitHub: forks, reviews, protection rules, merge queues, the three merge buttons and the gh CLI.",
  body: `
<div class="cover__meta">
    <span class="tag tag--beginner">Fresher</span>
    <span class="tag tag--intermediate">Mid</span>
    <span class="tag tag--advanced">Senior</span>
  </div>

  <p>
    A pull request is not a Git feature. Git has branches and merges;
    GitHub (like GitLab, where it is called a merge request) adds a page
    around a proposed merge where people can discuss it, review it line by
    line, and run checks against it before anything reaches
    <code>main</code>. Knowing where Git ends and GitHub begins makes both
    easier to reason about. Everything on this page is GitHub's layer on
    top of the Git you already know.
  </p>

  <h3>Forks or branches</h3>
  <p>
    A PR always compares two branches: the <em>base</em> (where the change
    will land) and the <em>head</em> (the change). The head can live in
    the same repository or in a fork, which is your own server-side copy of
    someone else's repository.
  </p>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th></th><th>Branch in the same repo</th><th>Fork</th></tr>
      </thead>
      <tbody>
        <tr><td>Who uses it</td><td>Team members with write access</td><td>Anyone, including people you don't know</td></tr>
        <tr><td>Remotes</td><td><code>origin</code> only</td><td><code>origin</code> (your fork) and <code>upstream</code> (the real project)</td></tr>
        <tr><td>CI secrets</td><td>Available to workflows</td><td>Withheld, and the token is read-only, so untrusted code can't steal them</td></tr>
        <tr><td>Maintainers can push fixes</td><td>Yes</td><td>Only if the author leaves "Allow edits by maintainers" ticked</td></tr>
        <tr><td>Keeping current</td><td><code>git pull</code></td><td><code>git fetch upstream</code> then rebase or merge, or <code>gh repo sync</code></td></tr>
      </tbody>
    </table>
  </div>
  <pre><code>$ gh repo fork acme/shop --clone
$ cd shop
$ git remote -v
origin    https://github.com/priya/shop.git (fetch)
origin    https://github.com/priya/shop.git (push)
upstream  https://github.com/acme/shop.git (fetch)
upstream  https://github.com/acme/shop.git (push)

$ git fetch upstream
$ git switch -c fix/tax-rounding upstream/main</code></pre>

  <h3>Opening a good PR</h3>
  <p>
    Reviewers are the bottleneck in almost every team, so a good PR is one
    that is cheap to review. That mostly comes down to size and context.
  </p>
  <ul>
    <li><strong>One change per PR.</strong> A bug fix, a refactor and a dependency bump are three PRs. A common rule of thumb is to stay under about 400 changed lines of real code. Review quality drops sharply beyond that.</li>
    <li><strong>A title that reads as a changelog line.</strong> With squash merges, it becomes the commit message on main.</li>
    <li><strong>A description that answers why.</strong> What problem, what you changed, how you tested it, what could go wrong, and how to roll it back. Screenshots or a short recording for anything visual.</li>
    <li><strong>Review it yourself first.</strong> Read the diff on GitHub before requesting review. You will find the leftover <code>console.log</code> before someone else does.</li>
    <li><strong>Leave comments on your own diff</strong> where a reviewer would otherwise have to guess, such as "this move is mechanical, the real change is on line 80".</li>
  </ul>
  <p>
    A file at <code>.github/pull_request_template.md</code> pre-fills the
    description of every new PR, which is the easiest way to make these
    habits the default.
  </p>

  <h3>Draft PRs</h3>
  <p>
    A draft PR says "this is not ready, but look if you like". It can't be
    merged, and code owners are not asked to review it. Open drafts early:
    CI runs, the team sees what you are doing, and you can ask for feedback
    on direction before you have polished the wrong approach. Mark it ready
    when it is.
  </p>
  <pre><code>$ gh pr create --draft --fill
$ gh pr ready 412</code></pre>

  <h3>Review mechanics</h3>
  <p>
    A review ends in one of three states. <strong>Comment</strong> gives
    feedback without a verdict. <strong>Approve</strong> counts towards
    the required number of approvals. <strong>Request changes</strong>
    blocks the merge (when reviews are required) until that same reviewer
    approves, or someone with permission dismisses their review.
  </p>
  <p>
    Batch your comments with "Start a review" rather than posting them one
    at a time, so the author gets one notification and a complete picture.
    For small fixes, write a <em>suggestion</em> instead of describing the
    change. In a line comment:
  </p>
  <pre><code>\`\`\`suggestion
  const tax = roundHalfEven(line.amount * rate);
\`\`\`</code></pre>
  <p>
    The author sees a diff with a <strong>Commit suggestion</strong>
    button, and can collect several suggestions into a single commit with
    "Add suggestion to batch". Useful conventions: prefix optional comments
    with "nit:", say explicitly whether a comment blocks approval, and
    resolve conversations once they are addressed, since branch protection
    can require every conversation to be resolved before merging.
  </p>

  <h3>Branch protection and rulesets</h3>
  <p>
    Protection rules make the process mandatory. Without them, anyone with
    write access can push straight to main, force-push over it, or merge a
    PR with failing tests. GitHub has two systems. <strong>Branch
    protection rules</strong> are the classic one: one rule per branch
    name pattern, configured in the repository settings.
    <strong>Rulesets</strong> are the newer one. Several can apply to the
    same branch and they stack, with the strictest setting winning. They
    can target branches and tags, can be switched off without being
    deleted, have an explicit bypass list (roles, teams or apps), and are
    visible to everyone with read access, so contributors can see why a
    push was refused. On some plans they can be set across a whole
    organisation.
  </p>
  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Rule</th><th>What it prevents</th></tr>
      </thead>
      <tbody>
        <tr><td>Require a pull request, with N approvals</td><td>Unreviewed code on main</td></tr>
        <tr><td>Dismiss stale approvals when new commits are pushed</td><td>Approve, then sneak in a different change</td></tr>
        <tr><td>Require approval of the most recent push</td><td>Approving your own last-minute push to someone else's PR</td></tr>
        <tr><td>Require review from code owners</td><td>Changing billing code without the billing team seeing it</td></tr>
        <tr><td>Require status checks to pass</td><td>Merging red CI</td></tr>
        <tr><td>Require branches to be up to date</td><td>Merging something tested against an old main</td></tr>
        <tr><td>Require conversation resolution</td><td>Merging with review threads still open</td></tr>
        <tr><td>Require linear history</td><td>Merge commits on main (allows only squash and rebase)</td></tr>
        <tr><td>Require signed commits</td><td>Commits whose author can't be verified</td></tr>
        <tr><td>Block force pushes and deletions</td><td>Rewriting or deleting main</td></tr>
        <tr><td>Require merge queue</td><td>PRs that pass alone but break main together</td></tr>
      </tbody>
    </table>
  </div>

  <h3>Required status checks, and their trap</h3>
  <p>
    A required check is named by the job name that reports it, for example
    <code>test</code> or <code>ci / test</code>. Two things catch almost
    every team. First, if a workflow is skipped by a <code>paths:</code>
    filter, its check never reports, and a required check that never
    reports stays "Expected" forever and blocks the merge. A job skipped by
    an <code>if:</code> condition, on the other hand, reports as passing.
    Second, renaming a job silently changes the check's name, and the old
    required name waits forever.
  </p>
  <p>
    The usual fix for both is a single summary job, added under
    <code>jobs:</code>, that always runs, depends on everything else, and
    is the only required check.
  </p>
  <pre><code>  all-green:
    if: always()
    needs: [lint, test, build]
    runs-on: ubuntu-latest
    steps:
      - run: test "\${{ contains(needs.*.result, 'failure') || contains(needs.*.result, 'cancelled') }}" = "false"</code></pre>

  <h3>CODEOWNERS</h3>
  <p>
    A <code>CODEOWNERS</code> file maps paths to the people or teams
    responsible for them. GitHub reads it from <code>.github/</code>, the
    repository root, or <code>docs/</code>, on the PR's base branch. Owners
    are requested for review automatically, and with "require review from
    code owners" turned on, their approval becomes mandatory for the files
    they own.
  </p>
  <pre><code>*                     @acme/platform
/apps/billing/        @acme/billing
*.sql                 @acme/dba @priya
/.github/workflows/   @acme/devops
/.github/CODEOWNERS   @acme/platform-leads</code></pre>
  <p>
    Patterns work mostly like <code>.gitignore</code>, and the
    <strong>last</strong> matching line wins, so general rules go at the
    top and specific ones below. Every owner must have write access to the
    repository, or they are not requested for review. Protect the CODEOWNERS file itself
    as the last line does, or anyone could remove the owners of a folder in
    the same PR that changes it.
  </p>

  <h3>Merge queue</h3>
  <p>
    "Require branches to be up to date" is correct but slow: every time
    main moves, every open PR has to update and rerun CI, and on a busy
    repository they race each other forever. A merge queue replaces it.
    You click "Merge when ready", the PR joins a queue, and GitHub tests it
    on top of main <em>plus every PR ahead of it</em>, merging only what
    passes.
  </p>

  <figure>
    <svg viewBox="0 0 900 270" class="dg" role="img" aria-label="A merge queue with three pull requests. Entry one tests main plus PR 101 and passes. Entry two tests main plus 101 plus 102 and passes. Entry three tests main plus 101, 102 and 103 and fails, so PR 103 is removed from the queue and the first two merge.">
      <g class="rough">
        <rect x="190" y="30" width="90" height="36" rx="8" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="290" y="30" width="90" height="36" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="190" y="90" width="90" height="36" rx="8" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="290" y="90" width="90" height="36" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="390" y="90" width="90" height="36" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="190" y="150" width="90" height="36" rx="8" style="fill: var(--sheet-2); stroke: var(--ink); stroke-width: 2" />
        <rect x="290" y="150" width="90" height="36" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="390" y="150" width="90" height="36" rx="8" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 2" />
        <rect x="490" y="150" width="90" height="36" rx="8" style="fill: var(--dg-box-red); stroke: var(--red); stroke-width: 2" />
        <path class="ln" d="M390 48 H626" marker-end="url(#arrow)" />
        <path class="ln" d="M490 108 H626" marker-end="url(#arrow)" />
        <path class="ln" d="M590 168 H626" marker-end="url(#arrow)" />
      </g>
      <text class="sm" x="20" y="53">entry 1</text>
      <text class="sm" x="20" y="113">entry 2</text>
      <text class="sm" x="20" y="173">entry 3</text>
      <text class="sm" x="235" y="53" text-anchor="middle">main</text>
      <text class="sm" x="335" y="53" text-anchor="middle">#101</text>
      <text class="sm" x="235" y="113" text-anchor="middle">main</text>
      <text class="sm" x="335" y="113" text-anchor="middle">#101</text>
      <text class="sm" x="435" y="113" text-anchor="middle">#102</text>
      <text class="sm" x="235" y="173" text-anchor="middle">main</text>
      <text class="sm" x="335" y="173" text-anchor="middle">#101</text>
      <text class="sm" x="435" y="173" text-anchor="middle">#102</text>
      <text class="sm rd" x="535" y="173" text-anchor="middle">#103</text>
      <text class="sm gr" x="640" y="53">CI passes: merge #101</text>
      <text class="sm gr" x="640" y="113">CI passes: merge #102</text>
      <text class="sm rd" x="640" y="173">CI fails: remove #103</text>
      <text class="sm" x="20" y="226">Each entry runs on a temporary branch, gh-readonly-queue/main/pr-N-&lt;sha&gt;, built on the entry ahead.</text>
      <text class="sm" x="20" y="250">If one fails, it leaves the queue and the entries behind it are rebuilt without it.</text>
    </svg>
    <figcaption>
      The entries run in parallel. Main only ever moves to a commit that
      has been tested exactly as it will exist.
    </figcaption>
  </figure>

  <p>
    Your workflows must listen for the <code>merge_group</code> event as
    well as <code>pull_request</code>, or the queue waits for checks that
    never start. The queue's settings control the merge method, how many
    entries build at once, and whether several PRs can be grouped into one
    build to save CI time. Merge queues are available for
    organisation-owned repositories, with the plan deciding which private
    repositories get them.
  </p>

  <h3>The three merge buttons</h3>
  <p>
    Each repository chooses which of these to allow. They produce very
    different histories from the same PR.
  </p>

  <figure>
    <svg viewBox="0 0 900 440" class="dg" role="img" aria-label="Before: main has A and B, and a feature branch from A has C, D and E. Merge commit: main keeps C, D and E and adds a merge commit M with two parents. Squash and merge: main gets one new commit S containing C, D and E together. Rebase and merge: main gets new copies C prime, D prime and E prime after B.">
      <g class="rough">
        <path class="ln" d="M200 100 H300" />
        <path class="lng" d="M200 100 C225 100 235 55 270 55 H410" />
        <path class="ln" d="M200 210 H480" />
        <path class="lng" d="M200 210 C225 210 235 165 270 165 H410 C440 165 450 210 480 210" />
        <path class="ln" d="M200 300 H400" />
        <path class="ln" d="M200 390 H540" />
        <circle cx="200" cy="100" r="7" style="fill: var(--ink)" />
        <circle cx="300" cy="100" r="7" style="fill: var(--ink)" />
        <circle cx="270" cy="55" r="7" style="fill: var(--green)" />
        <circle cx="340" cy="55" r="7" style="fill: var(--green)" />
        <circle cx="410" cy="55" r="7" style="fill: var(--green)" />
        <circle cx="200" cy="210" r="7" style="fill: var(--ink)" />
        <circle cx="300" cy="210" r="7" style="fill: var(--ink)" />
        <circle cx="270" cy="165" r="7" style="fill: var(--green)" />
        <circle cx="340" cy="165" r="7" style="fill: var(--green)" />
        <circle cx="410" cy="165" r="7" style="fill: var(--green)" />
        <circle cx="480" cy="210" r="9" style="fill: var(--sheet); stroke: var(--ink); stroke-width: 3" />
        <circle cx="200" cy="300" r="7" style="fill: var(--ink)" />
        <circle cx="300" cy="300" r="7" style="fill: var(--ink)" />
        <circle cx="400" cy="300" r="9" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="200" cy="390" r="7" style="fill: var(--ink)" />
        <circle cx="300" cy="390" r="7" style="fill: var(--ink)" />
        <circle cx="380" cy="390" r="7" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="460" cy="390" r="7" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
        <circle cx="540" cy="390" r="7" style="fill: var(--sheet); stroke: var(--green); stroke-width: 3" />
      </g>
      <text class="sm" x="20" y="84">BEFORE</text>
      <text class="sm" x="200" y="124" text-anchor="middle">A</text>
      <text class="sm" x="300" y="124" text-anchor="middle">B</text>
      <text class="sm" x="270" y="38" text-anchor="middle">C</text>
      <text class="sm" x="340" y="38" text-anchor="middle">D</text>
      <text class="sm" x="410" y="38" text-anchor="middle">E</text>
      <text class="lbl" x="318" y="105">main</text>
      <text class="lbl gr" x="428" y="60">feature (PR #42)</text>
      <text class="sm" x="20" y="194">MERGE COMMIT</text>
      <text class="sm" x="200" y="234" text-anchor="middle">A</text>
      <text class="sm" x="300" y="234" text-anchor="middle">B</text>
      <text class="sm" x="270" y="148" text-anchor="middle">C</text>
      <text class="sm" x="340" y="148" text-anchor="middle">D</text>
      <text class="sm" x="410" y="148" text-anchor="middle">E</text>
      <text class="sm" x="480" y="234" text-anchor="middle">M</text>
      <text class="lbl" x="500" y="215">main</text>
      <text class="sm" x="600" y="215">keeps C, D, E and adds merge M</text>
      <text class="sm" x="20" y="305">SQUASH AND MERGE</text>
      <text class="sm" x="200" y="324" text-anchor="middle">A</text>
      <text class="sm" x="300" y="324" text-anchor="middle">B</text>
      <text class="sm gr" x="400" y="324" text-anchor="middle">S</text>
      <text class="lbl" x="420" y="305">main</text>
      <text class="sm" x="600" y="305">one new commit S = C + D + E</text>
      <text class="sm" x="20" y="395">REBASE AND MERGE</text>
      <text class="sm" x="200" y="414" text-anchor="middle">A</text>
      <text class="sm" x="300" y="414" text-anchor="middle">B</text>
      <text class="sm gr" x="380" y="414" text-anchor="middle">C′</text>
      <text class="sm gr" x="460" y="414" text-anchor="middle">D′</text>
      <text class="sm gr" x="540" y="414" text-anchor="middle">E′</text>
      <text class="lbl" x="560" y="395">main</text>
      <text class="sm" x="640" y="395">copies with new IDs</text>
    </svg>
    <figcaption>
      Green rings are commits GitHub creates at merge time. Only the merge
      commit keeps the original C, D and E; the other two leave them behind
      on the feature branch.
    </figcaption>
  </figure>

  <div class="table-scroll">
    <table>
      <thead>
        <tr><th>Button</th><th>What lands on main</th><th>Good</th><th>Watch out for</th></tr>
      </thead>
      <tbody>
        <tr><td><strong>Create a merge commit</strong></td><td>All the PR's commits plus a merge commit, like <code>git merge --no-ff</code></td><td>Full history; the PR is one revertable unit (<code>git revert -m 1</code>)</td><td>"wip" and "fix typo" commits land on main; the graph gets busy</td></tr>
        <tr><td><strong>Squash and merge</strong></td><td>One new commit with the combined diff; message from the PR title and number</td><td>Main reads like a changelog; one commit to revert or bisect per PR</td><td>Intermediate commits are gone from main; the branch no longer looks merged to Git</td></tr>
        <tr><td><strong>Rebase and merge</strong></td><td>Each commit replayed onto main, always with new IDs</td><td>Linear history that keeps well-curated commits</td><td>Messy commits land individually; commits can't be matched back to the branch by ID</td></tr>
      </tbody>
    </table>
  </div>
  <p>
    Squash is the most common default. It credits other contributors with
    <code>Co-authored-by:</code> trailers, and it pairs well with "require
    linear history". Its side effect catches people out locally: the
    squash commit is new, so your branch's commits are not ancestors of
    main. <code>git branch -d feature</code> refuses with "not fully
    merged", and <code>git branch --merged</code> doesn't list it. Once
    GitHub shows the PR as merged, <code>git branch -D</code> is safe. And
    don't keep committing on a squash-merged branch; start a new one from
    main, or the next PR will show the old commits again.
  </p>

  <h3>Linking issues</h3>
  <p>
    A closing keyword followed by an issue reference, in the PR description
    or in a commit message, links the two and closes the issue when the PR
    merges.
  </p>
  <pre><code>Fixes #231
Closes #231, closes #240
Resolves acme/api#77</code></pre>
  <p>
    The keywords are <code>close</code>, <code>closes</code>,
    <code>closed</code>, <code>fix</code>, <code>fixes</code>,
    <code>fixed</code>, <code>resolve</code>, <code>resolves</code> and
    <code>resolved</code>. Each issue needs its own keyword, as in the
    second line. They only act when the PR targets the repository's
    <strong>default branch</strong>. A PR into <code>release/3.1</code>
    or into another PR's branch links nothing, which surprises people
    using stacked PRs. Saying "Related to #231" or "Part of #231" links
    without closing.
  </p>

  <h3>The gh CLI</h3>
  <p>
    GitHub's command-line tool does almost everything the website does,
    without leaving the terminal. Authenticate once with <code>gh auth
    login</code>. These are the commands worth knowing by heart.
  </p>
  <pre><code>$ gh pr create --fill --base main
$ gh pr create --title "fix: round tax per line" --body-file notes.md --reviewer acme/payments --draft
$ gh pr list --author "@me"
$ gh pr status
$ gh pr checkout 412
$ gh pr view 412 --comments
$ gh pr view 412 --web
$ gh pr diff 412
$ gh pr checks 412 --watch
$ gh pr review 412 --approve
$ gh pr review 412 --request-changes --body "Needs a test for negative totals"
$ gh pr merge 412 --squash --delete-branch
$ gh pr merge 412 --auto --squash</code></pre>
  <p>
    <code>--fill</code> takes the title and body from your commits.
    <code>gh pr checkout</code> fetches the PR's branch, even from a fork,
    and switches to it. <code>--auto</code> merges as soon as reviews and
    checks pass, and joins the merge queue if the branch requires one.
    For the Actions side:
  </p>
  <pre><code>$ gh run list --branch fix/tax-rounding
STATUS  TITLE                    WORKFLOW  BRANCH            EVENT         ID          ELAPSED  AGE
X       fix: round tax per line  ci        fix/tax-rounding  pull_request  9876543210  2m41s    about 4 minutes ago
✓       fix: round tax per line  lint      fix/tax-rounding  pull_request  9876543201  38s      about 4 minutes ago

$ gh run watch
$ gh run view 9876543210 --log-failed
$ gh run rerun 9876543210 --failed</code></pre>

  <h3>Checking out a PR without gh</h3>
  <p>
    GitHub stores every PR under special refs in the <em>base</em>
    repository, so you can fetch any PR, including one from a fork you have
    never added as a remote. <code>refs/pull/412/head</code> is the PR's
    latest commit. <code>refs/pull/412/merge</code> is the test merge of
    that commit into the base branch, the same commit CI tests, which only
    exists while the PR can be merged without conflicts.
  </p>
  <pre><code>$ git fetch origin pull/412/head:pr-412
From github.com:acme/shop
 * [new ref]         refs/pull/412/head -&gt; pr-412
$ git switch pr-412

$ git config --add remote.origin.fetch "+refs/pull/*/head:refs/remotes/origin/pr/*"
$ git fetch origin
$ git switch -c pr-412 origin/pr/412</code></pre>
  <p>
    The second form fetches every open and closed PR's head on each fetch,
    which is convenient on small repositories and very slow on big ones.
    These refs are read-only: to push fixes to someone's PR you push to
    their branch, which for a fork needs "Allow edits by maintainers".
  </p>

  <h3>GitHub Actions and PRs</h3>
  <p>
    A workflow is a YAML file in <code>.github/workflows/</code>. For PRs,
    what matters is which event starts it and what it is allowed to do.
  </p>
  <pre><code>name: ci
on:
  pull_request:
    types: [opened, synchronize, reopened, ready_for_review]
  merge_group:
  push:
    branches: [main]

permissions:
  contents: read

concurrency:
  group: ci-\${{ github.event.pull_request.number || github.ref }}
  cancel-in-progress: true

jobs:
  test:
    if: github.event.pull_request.draft != true
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 22
          cache: npm
      - run: npm ci
      - run: npm test</code></pre>
  <ul>
    <li><strong><code>pull_request</code></strong> fires by default when a PR is opened, reopened or gets new commits (<code>synchronize</code>). Adding <code>ready_for_review</code> makes CI start when a draft is marked ready, which the draft check above needs. The checkout is the test merge commit, <code>refs/pull/N/merge</code>, so you test what main would become.</li>
    <li><strong><code>merge_group</code></strong> is what the merge queue fires. Leave it out and queued PRs never get their checks.</li>
    <li><strong><code>concurrency</code></strong> cancels the old run when you push again, which saves a lot of CI time.</li>
    <li><strong><code>permissions</code></strong> limits what the job's <code>GITHUB_TOKEN</code> can do. Start from read-only and add only what a job needs.</li>
    <li><strong>Forks are sandboxed.</strong> A <code>pull_request</code> run from a fork gets no secrets and a read-only token, and first-time contributors need a maintainer to approve the run.</li>
  </ul>
  <div class="bx is-ref">
    <span class="ttl">pull_request_target is not a shortcut</span>
    <p>
      <code>pull_request_target</code> runs in the context of the base
      branch, <em>with</em> secrets and a write token. That is safe only as
      long as it never runs the PR's code. A workflow that checks out the PR
      head and then runs <code>npm install</code> or the tests under
      <code>pull_request_target</code> hands your secrets to anyone who opens
      a PR. It is one of the most common ways real repositories get
      compromised.
    </p>
  </div>

  <h3>Stacked PRs</h3>
  <p>
    Big features don't have to be one big PR. Split the work into a stack:
    each PR is based on the branch of the one below it, so each shows only
    its own slice of the diff and can be reviewed on its own.
  </p>

  <figure>
    <svg viewBox="0 0 900 260" class="dg" role="img" aria-label="A stack of three pull requests. PR 1, coupons-model, is based on main. PR 2, coupons-api, is based on coupons-model. PR 3, coupons-ui, is based on coupons-api. Each branch continues from the tip of the one below it.">
      <g class="rough">
        <path class="ln" d="M40 220 H400" />
        <path class="lng" d="M160 220 C200 220 200 160 240 160 H310" />
        <path class="lng" d="M310 160 C350 160 350 100 390 100 H460" />
        <path class="lng" d="M460 100 C500 100 500 40 540 40 H610" />
        <circle cx="80" cy="220" r="7" style="fill: var(--ink)" />
        <circle cx="160" cy="220" r="7" style="fill: var(--ink)" />
        <circle cx="240" cy="160" r="7" style="fill: var(--green)" />
        <circle cx="310" cy="160" r="7" style="fill: var(--green)" />
        <circle cx="390" cy="100" r="7" style="fill: var(--green)" />
        <circle cx="460" cy="100" r="7" style="fill: var(--green)" />
        <circle cx="540" cy="40" r="7" style="fill: var(--green)" />
        <circle cx="610" cy="40" r="7" style="fill: var(--green)" />
      </g>
      <text class="lbl" x="412" y="225">main</text>
      <text class="sm" x="240" y="188">PR 1: coupons-model → main</text>
      <text class="sm" x="390" y="128">PR 2: coupons-api → coupons-model</text>
      <text class="sm" x="540" y="68">PR 3: coupons-ui → coupons-api</text>
    </svg>
    <figcaption>
      Each arrow in a label is "head → base". Merge from the bottom up.
      When PR 1 merges and its branch is deleted, GitHub retargets PR 2 to
      main automatically.
    </figcaption>
  </figure>

  <pre><code>$ git switch -c coupons-model main
$ git commit -m "feat: coupon model and migration"
$ gh pr create --base main --fill
$ git switch -c coupons-api
$ git commit -m "feat: coupon endpoints"
$ gh pr create --base coupons-model --fill
$ git switch -c coupons-ui
$ git commit -m "feat: coupon field at checkout"
$ gh pr create --base coupons-api --fill

$ git switch coupons-ui
$ git rebase -i --update-refs main
$ git push --force-with-lease origin coupons-model coupons-api coupons-ui</code></pre>
  <p>
    The hard part is keeping the stack consistent. Fix a review comment in
    <code>coupons-model</code> and the two branches above it are now based
    on an old commit. <code>git rebase --update-refs</code> (Git 2.38 and
    later) solves this: rebase the top branch, and every branch in the
    stack that points at a rewritten commit is moved along with it. Set
    <code>rebase.updateRefs true</code> to make it the default.
  </p>
  <p>
    Squash merges add one more step. When PR 1 is squashed into main, main
    gets a new commit, and PR 2 still carries PR 1's original commits. Your
    local <code>coupons-model</code> still points at the old tip, so replay
    only what comes after it:
  </p>
  <pre><code>$ git fetch origin
$ git switch coupons-ui
$ git rebase --update-refs --onto origin/main coupons-model
$ git push --force-with-lease origin coupons-api coupons-ui</code></pre>
  <p>
    Tools such as Graphite, ghstack, spr and git-town automate this
    bookkeeping. Stacks work best when each layer is small and genuinely
    reviewable on its own. A stack of five PRs that only make sense
    together is just one big PR that is harder to read.
  </p>
`,
};
