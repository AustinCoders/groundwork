import type { TopicSources } from "./types";

const DOCS = "https://git-scm.com/docs";
const BOOK = "https://git-scm.com/book/en/v2";
const RELNOTES = "https://github.com/git/git/blob/master/Documentation/RelNotes";
const GH = "https://docs.github.com/en";

export const gitSources: TopicSources = {
  model: [
    {
      label: "Pro Git: What is Git?",
      url: `${BOOK}/Getting-Started-What-is-Git%3F`,
      kind: "book",
      backs:
        "Explains that Git stores each commit as a snapshot of the whole project, not as a list of file differences.",
    },
    {
      label: "Pro Git: Branches in a Nutshell",
      url: `${BOOK}/Git-Branching-Branches-in-a-Nutshell`,
      kind: "book",
      backs:
        "Shows commits pointing at their parents, a branch as a movable pointer to a commit, and HEAD as the current branch.",
    },
    {
      label: "Git reference: gitrevisions",
      url: `${DOCS}/gitrevisions`,
      kind: "docs",
      backs: "Defines the ~ and ^ suffixes for naming commits and the two-dot and three-dot range notations.",
    },
    {
      label: "Git reference: git-merge-base",
      url: `${DOCS}/git-merge-base`,
      kind: "docs",
      backs:
        "Defines the merge base as the best common ancestor used in a three-way merge, and documents --is-ancestor.",
    },
    {
      label: "Git reference: git-gc",
      url: `${DOCS}/git-gc`,
      kind: "docs",
      backs: "States that gc prunes loose unreachable objects older than two weeks by default.",
    },
  ],
  objects: [
    {
      label: "Pro Git: Git Objects",
      url: `${BOOK}/Git-Internals-Git-Objects`,
      kind: "book",
      backs:
        "Walks through blobs, trees and commits, the header that is hashed with the content, and zlib compression of each object.",
    },
    {
      label: "Pro Git: Packfiles",
      url: `${BOOK}/Git-Internals-Packfiles`,
      kind: "book",
      backs:
        "Shows loose objects being packed, and that the newer version is stored intact while the older one becomes a delta.",
    },
    {
      label: "Git reference: gitformat-index",
      url: `${DOCS}/gitformat-index`,
      kind: "docs",
      backs:
        "Specifies the index file layout, starting with the DIRC signature, a version number and the sorted index entries.",
    },
    {
      label: "Git reference: hash-function-transition",
      url: `${DOCS}/hash-function-transition`,
      kind: "docs",
      backs:
        "Records the 2017 SHAttered collision against SHA-1 and the project's choice of SHA-256 as the successor hash.",
    },
    {
      label: "Git reference: BreakingChanges (Git 3.0)",
      url: `${DOCS}/BreakingChanges`,
      kind: "docs",
      backs:
        "Says Git 3.0 has no planned release date, will default new repositories to sha256 and reftable, and keeps sha1 supported.",
    },
    {
      label: "Git 2.45 release notes",
      url: `${RELNOTES}/2.45.0.adoc`,
      kind: "docs",
      backs: "Announces the reftable backend for refs, enabled with git init --ref-format=reftable.",
    },
  ],
  areas: [
    {
      label: "Pro Git: Recording Changes to the Repository",
      url: `${BOOK}/Git-Basics-Recording-Changes-to-the-Repository`,
      kind: "book",
      backs:
        "Describes the untracked, unmodified, modified and staged states a file moves through, and how staging works.",
    },
    {
      label: "Git reference: git-diff",
      url: `${DOCS}/git-diff`,
      kind: "docs",
      backs:
        "Documents the diff of working tree against index, --cached for index against a commit, and diff against a named commit.",
    },
    {
      label: "Git reference: git-restore",
      url: `${DOCS}/git-restore`,
      kind: "docs",
      backs: "Documents --source, --staged and --worktree, which choose where content is copied from and to.",
    },
    {
      label: "Git reference: gitignore",
      url: `${DOCS}/gitignore`,
      kind: "docs",
      backs: "Defines the pattern format, including ! negation, and notes that files already tracked are not affected.",
    },
    {
      label: "Git 2.23 release notes",
      url: `${RELNOTES}/2.23.0.adoc`,
      kind: "docs",
      backs: "Introduces git switch and git restore to split the two jobs that git checkout used to do.",
    },
  ],
  config: [
    {
      label: "Git reference: git-config",
      url: `${DOCS}/git-config#_conditional_includes`,
      kind: "docs",
      backs:
        "Documents config scopes, includeIf conditions such as gitdir, onbranch and hasconfig, and every setting named in the chapter.",
    },
    {
      label: "Pro Git: First-Time Git Setup",
      url: `${BOOK}/Getting-Started-First-Time-Git-Setup`,
      kind: "book",
      backs:
        "Explains the system, global and local config files and setting user.name and user.email on a new machine.",
    },
    {
      label: "Git reference: gitattributes",
      url: `${DOCS}/gitattributes`,
      kind: "docs",
      backs: "Defines per-path attributes such as text, eol, diff and merge that are committed with the repository.",
    },
    {
      label: "Git reference: gitcredentials",
      url: `${DOCS}/gitcredentials`,
      kind: "docs",
      backs: "Describes credential helpers, which store HTTPS usernames and tokens so Git does not ask on every push.",
    },
    {
      label: "GitHub Blog: Token authentication requirements for Git operations",
      url: "https://github.blog/security/application-security/token-authentication-requirements-for-git-operations/",
      kind: "article",
      backs: "Announces that from August 13, 2021 GitHub no longer accepts account passwords for Git operations.",
    },
    {
      label: "Git 2.34 release notes",
      url: `${RELNOTES}/2.34.0.adoc`,
      kind: "docs",
      backs: "Records that SSH keys can be used for signing commits and tags in addition to GnuPG from this release.",
    },
  ],
  daily: [
    {
      label: "Git reference: git-log",
      url: `${DOCS}/git-log`,
      kind: "docs",
      backs:
        "Documents the filters and views used in the chapter: --graph, --since, --author, --grep, --follow, -S, -G and -L.",
    },
    {
      label: "Git reference: pretty-formats",
      url: `${DOCS}/pretty-formats`,
      kind: "docs",
      backs: "Lists the format placeholders such as %h, %an, %ar, %s and %d used to build custom log layouts.",
    },
    {
      label: "Pro Git: Viewing the Commit History",
      url: `${BOOK}/Git-Basics-Viewing-the-Commit-History`,
      kind: "book",
      backs: "Works through git log with -p, --stat, --pretty and --graph, and the options that limit its output.",
    },
    {
      label: "Git reference: git-shortlog",
      url: `${DOCS}/git-shortlog`,
      kind: "docs",
      backs: "Describes shortlog as a summary of git log output grouped by author, with -s and -n for counts.",
    },
  ],
  branch: [
    {
      label: "Pro Git: Branches in a Nutshell",
      url: `${BOOK}/Git-Branching-Branches-in-a-Nutshell`,
      kind: "book",
      backs:
        "Shows that a branch is a lightweight movable pointer to a commit and that HEAD points at the current branch.",
    },
    {
      label: "Git reference: git-switch",
      url: `${DOCS}/git-switch`,
      kind: "docs",
      backs: "Documents switching and creating branches with -c, and that detaching HEAD needs an explicit --detach.",
    },
    {
      label: "Git reference: git-checkout, Detached HEAD",
      url: `${DOCS}/git-checkout#_detached_head`,
      kind: "docs",
      backs: "Explains what a detached HEAD is and why commits made there are lost unless a branch or tag is created.",
    },
    {
      label: "Git reference: git-branch",
      url: `${DOCS}/git-branch`,
      kind: "docs",
      backs:
        "Documents upstream tracking with --set-upstream-to, renaming with -m and the safety check in -d versus -D.",
    },
    {
      label: "Git reference: git-for-each-ref",
      url: `${DOCS}/git-for-each-ref`,
      kind: "docs",
      backs:
        "Defines the ahead-behind format atom that reports commits ahead of and behind a given commit for every ref.",
    },
  ],
  remote: [
    {
      label: "Pro Git: Remote Branches",
      url: `${BOOK}/Git-Branching-Remote-Branches`,
      kind: "book",
      backs: "Explains remote-tracking branches as local references that Git moves only when you talk to the remote.",
    },
    {
      label: "Git reference: git-fetch",
      url: `${DOCS}/git-fetch`,
      kind: "docs",
      backs:
        "Documents refspecs, FETCH_HEAD and --prune, which removes remote-tracking refs that no longer exist on the remote.",
    },
    {
      label: "Git reference: git-pull",
      url: `${DOCS}/git-pull`,
      kind: "docs",
      backs: "States that pull runs git fetch and then integrates with merge or, with --rebase, with rebase.",
    },
    {
      label: "Git reference: git-push",
      url: `${DOCS}/git-push`,
      kind: "docs",
      backs:
        "Documents --force-with-lease, its weakness when something fetches in the background, and --force-if-includes.",
    },
  ],
  merge: [
    {
      label: "Git reference: git-merge",
      url: `${DOCS}/git-merge`,
      kind: "docs",
      backs:
        "Covers fast-forward and true merges, --no-ff and --squash, how conflicts are presented, and the diff3 and zdiff3 styles.",
    },
    {
      label: "Git reference: merge-strategies",
      url: `${DOCS}/merge-strategies`,
      kind: "docs",
      backs:
        "Describes ort as the default two-head strategy written to replace recursive, plus octopus, ours and the -X options.",
    },
    {
      label: "Git 2.34 release notes",
      url: `${RELNOTES}/2.34.0.adoc`,
      kind: "docs",
      backs: "Records that the ort strategy replaced recursive as the default merge strategy in Git 2.34.",
    },
    {
      label: "Git reference: git-rerere",
      url: `${DOCS}/git-rerere`,
      kind: "docs",
      backs: "Explains how rerere records a hand resolution and reapplies it when the same conflict appears again.",
    },
    {
      label: "Pro Git: Advanced Merging",
      url: `${BOOK}/Git-Tools-Advanced-Merging`,
      kind: "book",
      backs:
        "Works through reading and resolving conflicts, aborting a merge, and undoing a merge with reset or revert.",
    },
  ],
  rebase: [
    {
      label: "Git reference: git-rebase",
      url: `${DOCS}/git-rebase`,
      kind: "docs",
      backs:
        "Documents --onto, interactive mode, --autosquash, --update-refs and the ORIG_HEAD note used to undo a rebase.",
    },
    {
      label: "Pro Git: Rebasing",
      url: `${BOOK}/Git-Branching-Rebasing`,
      kind: "book",
      backs:
        "Shows rebase replaying commits onto a new base and the rule not to rebase commits others have based work on.",
    },
    {
      label: "Pro Git: Rewriting History",
      url: `${BOOK}/Git-Tools-Rewriting-History`,
      kind: "book",
      backs: "Demonstrates interactive rebase to reorder, reword, squash and split commits before sharing them.",
    },
    {
      label: "Git reference: git-replay",
      url: `${DOCS}/git-replay`,
      kind: "docs",
      backs:
        "Describes git replay as an experimental command that replays commits onto a new base and works in bare repositories.",
    },
  ],
  github: [
    {
      label: "GitHub Docs: About rulesets",
      url: `${GH}/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/about-rulesets`,
      kind: "docs",
      backs:
        "Explains that several rulesets can apply to one branch, have bypass lists, and are visible to anyone with read access.",
    },
    {
      label: "GitHub Docs: About protected branches",
      url: `${GH}/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches`,
      kind: "docs",
      backs:
        "Lists the branch protection settings: required reviews, status checks, conversation resolution and linear history.",
    },
    {
      label: "GitHub Docs: About code owners",
      url: `${GH}/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-code-owners`,
      kind: "docs",
      backs: "Defines the CODEOWNERS file and the rule that the last matching pattern takes precedence.",
    },
    {
      label: "GitHub Docs: Managing a merge queue",
      url: `${GH}/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue`,
      kind: "docs",
      backs:
        "States that workflows must listen for the merge_group event for required checks to run on queued pull requests.",
    },
    {
      label: "GitHub Docs: Checking out pull requests locally",
      url: `${GH}/pull-requests/how-tos/review-pull-requests/checking-out-pull-requests-locally`,
      kind: "docs",
      backs: "Shows git fetch origin pull/ID/head:BRANCH and notes that the refs/pull namespace is read-only.",
    },
    {
      label: "GitHub Docs: Events that trigger workflows",
      url: `${GH}/actions/reference/workflows-and-actions/events-that-trigger-workflows`,
      kind: "docs",
      backs:
        "Gives the default pull_request activity types (opened, synchronize, reopened) and the pull_request_target warnings.",
    },
  ],
  flow: [
    {
      label: "Vincent Driessen: A successful Git branching model",
      url: "https://nvie.com/posts/a-successful-git-branching-model/",
      kind: "article",
      backs:
        "The original 2010 GitFlow article, with the author's 2020 note recommending a simpler flow for continuously delivered software.",
    },
    {
      label: "GitHub Docs: GitHub flow",
      url: `${GH}/get-started/using-github/github-flow`,
      kind: "docs",
      backs:
        "Describes GitHub flow: create a branch, make changes, open a pull request, review, merge and delete the branch.",
    },
    {
      label: "Trunk Based Development: Introduction",
      url: "https://trunkbaseddevelopment.com/",
      kind: "article",
      backs:
        "Defines trunk-based development as collaborating in a single trunk branch and avoiding long-lived branches.",
    },
    {
      label: "DORA: Trunk-based development",
      url: "https://dora.dev/capabilities/trunk-based-development/",
      kind: "article",
      backs:
        "Reports the research finding: three or fewer active branches, merged to trunk at least once a day, with no code freezes.",
    },
    {
      label: "Martin Fowler: Feature Toggles (aka Feature Flags)",
      url: "https://martinfowler.com/articles/feature-toggles.html",
      kind: "article",
      backs:
        "Explains release toggles as the way to ship unfinished code on trunk without a long-lived feature branch.",
    },
  ],
  undo: [
    {
      label: "Git reference: git-reset",
      url: `${DOCS}/git-reset`,
      kind: "docs",
      backs: "Defines what --soft, --mixed and --hard each do to HEAD, the index and the working tree.",
    },
    {
      label: "Pro Git: Reset Demystified",
      url: `${BOOK}/Git-Tools-Reset-Demystified`,
      kind: "book",
      backs: "Explains reset through the three trees: HEAD, the index and the working directory.",
    },
    {
      label: "Git reference: git-revert",
      url: `${DOCS}/git-revert`,
      kind: "docs",
      backs:
        "States that revert records new commits that undo earlier ones, and that a merge needs -m to pick the mainline parent.",
    },
    {
      label: "Git project: How to revert a faulty merge",
      url: "https://github.com/git/git/blob/master/Documentation/howto/revert-a-faulty-merge.adoc",
      kind: "docs",
      backs:
        "Explains why re-merging a reverted branch brings back nothing old, and that the fix is to revert the revert.",
    },
    {
      label: "Git reference: git-reflog",
      url: `${DOCS}/git-reflog`,
      kind: "docs",
      backs:
        "Describes reflogs as a local record of ref updates that expire after 90 days, or 30 days for unreachable entries.",
    },
    {
      label: "Git reference: git-stash",
      url: `${DOCS}/git-stash`,
      kind: "docs",
      backs:
        "Documents stash push, pop, apply and drop, and the export and import subcommands for moving stashes between machines.",
    },
  ],
  tools: [
    {
      label: "Git reference: git-bisect",
      url: `${DOCS}/git-bisect`,
      kind: "docs",
      backs:
        "Describes bisect as a binary search for the commit that introduced a bug, and bisect run for automating it.",
    },
    {
      label: "Git reference: git-blame",
      url: `${DOCS}/git-blame`,
      kind: "docs",
      backs:
        "Documents -w, -M and -C for seeing past whitespace and moved code, and --ignore-revs-file for skipping commits.",
    },
    {
      label: "Git reference: git-cherry-pick",
      url: `${DOCS}/git-cherry-pick`,
      kind: "docs",
      backs:
        "Explains that cherry-pick applies an existing commit's change as a new commit, and that -x records the source.",
    },
    {
      label: "Git reference: git-range-diff",
      url: `${DOCS}/git-range-diff`,
      kind: "docs",
      backs: "Describes range-diff as comparing two commit ranges, such as two versions of the same branch.",
    },
    {
      label: "Git reference: git-worktree",
      url: `${DOCS}/git-worktree`,
      kind: "docs",
      backs: "Documents linked worktrees and the add --orphan, --relative-paths, lock and repair options.",
    },
    {
      label: "Pro Git: Submodules",
      url: `${BOOK}/Git-Tools-Submodules`,
      kind: "book",
      backs:
        "Shows how a submodule pins another repository at a commit through .gitmodules, and the problems that causes.",
    },
  ],
  danger: [
    {
      label: "GitHub Docs: Removing sensitive data from a repository",
      url: `${GH}/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository`,
      kind: "docs",
      backs:
        "Says to revoke or rotate a leaked secret first, then rewrite history with git-filter-repo and coordinate with collaborators.",
    },
    {
      label: "GitHub Docs: About large files on GitHub",
      url: `${GH}/repositories/working-with-files/managing-large-files/about-large-files-on-github`,
      kind: "docs",
      backs: "States that GitHub warns on files over 50 MiB and blocks pushes containing files over 100 MiB.",
    },
    {
      label: "git-filter-repo (GitHub repository)",
      url: "https://github.com/newren/git-filter-repo",
      kind: "code",
      backs:
        "The history rewriting tool the chapter uses to purge a file, built as the replacement for git filter-branch.",
    },
    {
      label: "Git reference: git-push",
      url: `${DOCS}/git-push`,
      kind: "docs",
      backs:
        "Explains how --force-with-lease and --force-if-includes stop a force-push from overwriting commits you never saw.",
    },
    {
      label: "Git reference: git-clean",
      url: `${DOCS}/git-clean`,
      kind: "docs",
      backs: "Documents that clean deletes untracked files from the working tree, with -n to preview what would go.",
    },
  ],
  hygiene: [
    {
      label: "Conventional Commits 1.0.0",
      url: "https://www.conventionalcommits.org/en/v1.0.0/",
      kind: "spec",
      backs:
        "Specifies the type(scope): subject format and maps fix, feat and BREAKING CHANGE to patch, minor and major bumps.",
    },
    {
      label: "Semantic Versioning 2.0.0",
      url: "https://semver.org/",
      kind: "spec",
      backs:
        "Defines MAJOR.MINOR.PATCH and says major version zero is for initial development where anything may change.",
    },
    {
      label: "Pro Git: Contributing to a Project",
      url: `${BOOK}/Distributed-Git-Contributing-to-a-Project`,
      kind: "book",
      backs:
        "Gives the commit guidelines: a summary line of about 50 characters, a blank line, then a body wrapped at about 72.",
    },
    {
      label: "Git reference: githooks",
      url: `${DOCS}/githooks`,
      kind: "docs",
      backs:
        "Lists every client and server hook, when each one fires, which can abort the operation, and core.hooksPath.",
    },
    {
      label: "Git reference: git-tag",
      url: `${DOCS}/git-tag`,
      kind: "docs",
      backs:
        "Distinguishes lightweight tags from annotated tag objects that carry a tagger, date, message and optional signature.",
    },
    {
      label: "Git reference: git-interpret-trailers",
      url: `${DOCS}/git-interpret-trailers`,
      kind: "docs",
      backs:
        "Defines trailers such as Signed-off-by as key and value lines at the end of a commit message that Git can parse.",
    },
  ],
  scale: [
    {
      label: "GitHub Docs: About Git Large File Storage",
      url: `${GH}/repositories/working-with-files/managing-large-files/about-git-large-file-storage`,
      kind: "docs",
      backs:
        "Explains that Git LFS keeps a small pointer file in the repository and stores the real file contents elsewhere.",
    },
    {
      label: "Git reference: git-clone",
      url: `${DOCS}/git-clone`,
      kind: "docs",
      backs:
        "Documents --depth for shallow clones, --filter for partial clones, --sparse, and --revision for fetching one commit.",
    },
    {
      label: "Git reference: git-sparse-checkout",
      url: `${DOCS}/git-sparse-checkout`,
      kind: "docs",
      backs: "Describes limiting the working tree to chosen directories, with cone mode as the default.",
    },
    {
      label: "Git reference: git-maintenance",
      url: `${DOCS}/git-maintenance`,
      kind: "docs",
      backs: "Lists the scheduled background tasks: commit-graph, prefetch, loose-objects and incremental-repack.",
    },
    {
      label: "Git reference: gitattributes",
      url: `${DOCS}/gitattributes`,
      kind: "docs",
      backs:
        "Defines the text and eol attributes that normalise line endings between LF in the repository and CRLF on checkout.",
    },
    {
      label: "GitHub Docs: About commit signature verification",
      url: `${GH}/authentication/managing-commit-signature-verification/about-commit-signature-verification`,
      kind: "docs",
      backs: "Explains that commits and tags signed with GPG, SSH or S/MIME are marked as verified on GitHub.",
    },
  ],
  interview: [
    {
      label: "Pro Git: Reset Demystified",
      url: `${BOOK}/Git-Tools-Reset-Demystified`,
      kind: "book",
      backs: "Backs the answers on reset, checkout and the three trees that most undo questions come down to.",
    },
    {
      label: "Git reference: git-reflog",
      url: `${DOCS}/git-reflog`,
      kind: "docs",
      backs: "Backs the reflog answer: a local record of ref updates kept 90 days, or 30 days for unreachable entries.",
    },
    {
      label: "Git reference: merge-strategies",
      url: `${DOCS}/merge-strategies`,
      kind: "docs",
      backs:
        "Backs the merge strategy answer: ort as the default for two heads, octopus for more, and what -X options change.",
    },
    {
      label: "Git reference: BreakingChanges (Git 3.0)",
      url: `${DOCS}/BreakingChanges`,
      kind: "docs",
      backs:
        "Backs the Git 3.0 answer: no release date yet, with sha256 and reftable planned as defaults for new repositories.",
    },
  ],
  cheat: [
    {
      label: "Git project: Git Cheat Sheet",
      url: "https://git-scm.com/cheat-sheet",
      kind: "docs",
      backs: "The Git project's own one-page command summary, grouped by task like this chapter.",
    },
    {
      label: "Git project: Reference manual index",
      url: DOCS,
      kind: "docs",
      backs: "Index of the manual page for every command listed in the tables, the same text that git help prints.",
    },
    {
      label: "Git 2.46 release notes",
      url: `${RELNOTES}/2.46.0.adoc`,
      kind: "docs",
      backs: "Records that git config gained the get, set, unset and list subcommands in place of the old mode flags.",
    },
    {
      label: "Git 2.49 release notes",
      url: `${RELNOTES}/2.49.0.adoc`,
      kind: "docs",
      backs:
        "Records the two newest commands in the table: git backfill and a shallow clone of one commit with --revision.",
    },
  ],
};
